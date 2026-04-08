from __future__ import annotations

import asyncio
import json
import tempfile
import traceback
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Any

import aiosqlite

from .db import connect
from .settings import Settings


@dataclass
class ScriptExecResult:
    script_run_id: int
    ok: bool
    exit_code: int
    stdout: str
    stderr: str


class JobWorker:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self._task: asyncio.Task | None = None
        self._stop = asyncio.Event()
        self._active_by_type: dict[str, asyncio.Task] = {}

    def _log(self, message: str) -> None:
        print(f"[worker] {datetime.utcnow().isoformat()}Z {message}", flush=True)

    def _parse_script_json(self, stdout: str, *, fallback: str, context: str) -> Any:
        text = (stdout or "").strip() or fallback
        try:
            return json.loads(text)
        except json.JSONDecodeError as exc:
            preview = text[:400].replace("\n", "\\n")
            raise RuntimeError(f"{context}: invalid JSON output ({exc}); stdout_preview={preview}") from exc

    async def start(self) -> None:
        if self._task is None:
            self._stop.clear()
            self._task = asyncio.create_task(self._loop(), name="autoseo-job-worker")
            self._log("started")

    async def stop(self) -> None:
        self._stop.set()
        if self._task is not None:
            await self._task
            self._task = None
        for task in self._active_by_type.values():
            if not task.done():
                task.cancel()
        self._active_by_type.clear()
        self._log("stopped")

    def _cleanup_tasks(self) -> None:
        done_types: list[str] = []
        for job_type, task in self._active_by_type.items():
            if task.done():
                done_types.append(job_type)
                try:
                    task.result()
                except Exception as exc:
                    self._log(f"task crashed for type={job_type}: {exc}")
        for job_type in done_types:
            self._active_by_type.pop(job_type, None)

    async def _loop(self) -> None:
        while not self._stop.is_set():
            try:
                self._cleanup_tasks()
                async with connect(str(self.settings.db_path)) as con:
                    jobs = await self._claim_eligible_jobs(con)
                for job in jobs:
                    job_dict = dict(job)
                    job_type = str(job_dict["job_type"])
                    if job_type in self._active_by_type and not self._active_by_type[job_type].done():
                        continue
                    self._active_by_type[job_type] = asyncio.create_task(
                        self._process_claimed_job(job_dict),
                        name=f"autoseo-job-{job_dict['id']}-{job_type}",
                    )
                    self._log(f"claimed job id={job_dict['id']} type={job_type} and started task")
            except Exception as exc:
                self._log(f"loop error: {exc}")
            await asyncio.sleep(self.settings.worker_poll_seconds)

    async def _process_claimed_job(self, job: dict[str, Any]) -> None:
        async with connect(str(self.settings.db_path)) as con:
            await self._process_job(con, job)

    async def _claim_eligible_jobs(self, con: aiosqlite.Connection) -> list[aiosqlite.Row]:
        cur = await con.execute(
            """
            WITH next_jobs AS (
                SELECT MIN(id) AS id
                FROM jobs
                WHERE status='queued'
                  AND job_type NOT IN (
                    SELECT DISTINCT job_type FROM jobs WHERE status='running'
                  )
                GROUP BY job_type
            )
            UPDATE jobs
            SET status='running', started_at=datetime('now')
            WHERE id IN (SELECT id FROM next_jobs)
            RETURNING *
            """
        )
        rows = await cur.fetchall()
        await cur.close()
        await con.commit()
        return rows

    async def _process_job(self, con: aiosqlite.Connection, job: dict[str, Any]) -> None:
        payload = {}
        if job.get("payload_json"):
            try:
                payload = json.loads(job["payload_json"])
            except json.JSONDecodeError:
                payload = {}
        self._log(f"job start id={job['id']} type={job['job_type']}")
        try:
            job_type = job["job_type"]
            if job_type == "gsc_sync":
                await self._handle_gsc_sync(con, job, payload)
            elif job_type == "seranking_enrich":
                await self._handle_seranking_enrich(con, job, payload)
            elif job_type == "prioritize":
                await self._handle_prioritize(con, job, payload)
            elif job_type == "serp_check":
                await self._handle_serp_check(con, job, payload)
            elif job_type == "ai_visibility_check":
                await self._handle_ai_visibility_check(con, job, payload)
            elif job_type == "full_refresh":
                await self._handle_full_refresh(con, job, payload)
            else:
                raise ValueError(f"Unsupported job_type: {job_type}")

            await con.execute(
                "UPDATE jobs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?",
                (job["id"],),
            )
            await con.commit()
            self._log(f"job success id={job['id']} type={job['job_type']}")
        except Exception as exc:
            trace = traceback.format_exc()
            error_text = f"{exc}\n{trace}"
            await con.execute(
                "UPDATE jobs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?",
                (error_text, job["id"]),
            )
            await con.commit()
            self._log(f"job failed id={job['id']} type={job['job_type']} error={exc}\n{trace}")

    async def _insert_script_run(
        self,
        con: aiosqlite.Connection,
        job_id: int,
        script_name: str,
        args_json: str,
        run_key: str | None,
    ) -> int:
        cur = await con.execute(
            """
            INSERT INTO script_runs (job_id, script_name, status, run_key, args_json, started_at)
            VALUES (?, ?, 'running', ?, ?, datetime('now'))
            """,
            (job_id, script_name, run_key, args_json),
        )
        await con.commit()
        return int(cur.lastrowid)

    async def _finish_script_run(
        self,
        con: aiosqlite.Connection,
        script_run_id: int,
        ok: bool,
        exit_code: int,
        stdout: str,
        stderr: str,
    ) -> None:
        await con.execute(
            """
            UPDATE script_runs
            SET status=?, exit_code=?, output_json=?, error_text=?, finished_at=datetime('now')
            WHERE id=?
            """,
            ("succeeded" if ok else "failed", exit_code, stdout if ok else None, stderr if not ok else None, script_run_id),
        )
        await con.commit()

    async def _run_script(
        self,
        con: aiosqlite.Connection,
        *,
        job_id: int,
        script_name: str,
        args: list[str],
        run_key: str | None = None,
    ) -> ScriptExecResult:
        self._log(f"script start job_id={job_id} script={script_name} args={args}")
        script_run_id = await self._insert_script_run(
            con=con,
            job_id=job_id,
            script_name=script_name,
            args_json=json.dumps(args),
            run_key=run_key,
        )
        script_path = (self.settings.scripts_dir / script_name).resolve()
        proc = await asyncio.create_subprocess_exec(
            self.settings.python_bin,
            str(script_path),
            *args,
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        stdout_b, stderr_b = await proc.communicate()
        stdout = stdout_b.decode("utf-8", errors="replace").strip()
        stderr = stderr_b.decode("utf-8", errors="replace").strip()
        ok = proc.returncode == 0
        await self._finish_script_run(con, script_run_id, ok, int(proc.returncode or 0), stdout, stderr)
        self._log(
            f"script end job_id={job_id} script={script_name} ok={ok} exit_code={int(proc.returncode or 0)}"
        )
        return ScriptExecResult(
            script_run_id=script_run_id,
            ok=ok,
            exit_code=int(proc.returncode or 0),
            stdout=stdout,
            stderr=stderr,
        )

    async def _get_or_create_query(
        self,
        con: aiosqlite.Connection,
        query_text: str,
        *,
        source_type: str,
        query_class: str,
    ) -> int:
        await con.execute(
            """
            INSERT INTO queries (query_text, query_class, source_type, seranking_status, priority_status, first_seen_at, last_seen_at, created_at, updated_at)
            VALUES (?, ?, ?, 'pending', 'pending', datetime('now'), datetime('now'), datetime('now'), datetime('now'))
            ON CONFLICT(query_text) DO UPDATE SET
                last_seen_at=datetime('now'),
                updated_at=datetime('now')
            """,
            (query_text, query_class, source_type),
        )
        cur = await con.execute(
            "SELECT id FROM queries WHERE lower(query_text)=lower(?)",
            (query_text,),
        )
        row = await cur.fetchone()
        return int(row["id"])

    async def _handle_gsc_sync(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        site_url = str(payload.get("site_url") or "").strip()
        if not site_url:
            raise ValueError("gsc_sync requires site_url")

        window_days = int(payload.get("window_days", 7))
        pass_a_cfg = payload.get("pass_a") or {"mode": "top", "max_top_queries": 1000}
        pass_c_cfg = payload.get("pass_c") or {"scope": "top_pages", "top_pages_limit": 100}
        inspect_cfg = payload.get("inspect") or {"enabled": True, "inspect_max_urls": 200, "custom_page_urls": []}
        auth_json = payload.get("auth_json")
        job_id = int(job["id"])

        await con.execute(
            "INSERT INTO gsc_properties (site_url, created_at) VALUES (?, datetime('now')) ON CONFLICT(site_url) DO NOTHING",
            (site_url,),
        )
        prop_cur = await con.execute("SELECT id FROM gsc_properties WHERE site_url=?", (site_url,))
        prop_row = await prop_cur.fetchone()
        if prop_row is None:
            raise RuntimeError(f"Unable to resolve property_id for site_url={site_url}")
        property_id = int(prop_row["id"])

        has_history = await self._has_successful_gsc_history(con, property_id)
        effective_window = min(window_days, 7) if has_history else window_days
        day_list = self._build_day_list(effective_window)
        self._log(
            f"gsc plan job={job_id} site={site_url} requested_window={window_days} effective_window={effective_window} days={len(day_list)}"
        )

        await self._plan_initial_gsc_tasks(
            con,
            job_id=job_id,
            property_id=property_id,
            site_url=site_url,
            day_list=day_list,
            pass_a_cfg=pass_a_cfg,
        )
        await con.commit()

        failures: list[str] = []
        while True:
            task_cur = await con.execute(
                """
                SELECT *
                FROM gsc_sync_tasks
                WHERE job_id=? AND status='queued'
                ORDER BY
                    day ASC,
                    CASE pass_type
                        WHEN 'pass_a' THEN 1
                        WHEN 'pass_b' THEN 2
                        WHEN 'pass_c' THEN 3
                        WHEN 'inspect' THEN 4
                        ELSE 9
                    END ASC,
                    page_url ASC,
                    id ASC
                LIMIT 1
                """,
                (job_id,),
            )
            task_row = await task_cur.fetchone()
            if task_row is None:
                break

            task = dict(task_row)
            task_id = int(task["id"])
            day = str(task["day"])
            pass_type = str(task["pass_type"])
            page_url = str(task["page_url"]) if task["page_url"] is not None else None
            fingerprint = str(task["fingerprint"])
            self._log(f"task start job={job_id} day={day} pass={pass_type} page={page_url or '-'}")

            if await self._is_recent_gsc_fingerprint(con, fingerprint):
                await self._mark_gsc_task(
                    con,
                    task_id=task_id,
                    status="skipped_dedupe_24h",
                    rows_written=0,
                    error_text="Skipped due to 24h fingerprint dedupe",
                    script_run_id=None,
                )
                await self._insert_gsc_call_log(con, fingerprint, job_id, task_id, "skipped_dedupe_24h")
                if pass_type == "pass_b":
                    await self._plan_pass_c_and_inspect_tasks_for_day(
                        con,
                        job_id=job_id,
                        property_id=property_id,
                        site_url=site_url,
                        day=day,
                        pass_a_cfg=pass_a_cfg,
                        pass_c_cfg=pass_c_cfg,
                        inspect_cfg=inspect_cfg,
                    )
                await con.commit()
                self._log(f"task skip dedupe job={job_id} day={day} pass={pass_type} page={page_url or '-'}")
                continue

            await self._mark_gsc_task(
                con,
                task_id=task_id,
                status="running",
                rows_written=0,
                error_text=None,
                script_run_id=None,
            )
            await self._insert_gsc_call_log(con, fingerprint, job_id, task_id, "running")
            await con.commit()

            started = datetime.now(timezone.utc)
            try:
                rows_written, script_run_id = await self._execute_gsc_task(
                    con=con,
                    job_id=job_id,
                    task_id=task_id,
                    property_id=property_id,
                    site_url=site_url,
                    day=day,
                    pass_type=pass_type,
                    page_url=page_url,
                    pass_a_cfg=pass_a_cfg,
                    auth_json=auth_json,
                )
                await self._mark_gsc_task(
                    con,
                    task_id=task_id,
                    status="succeeded",
                    rows_written=rows_written,
                    error_text=None,
                    script_run_id=script_run_id,
                )
                await self._finish_gsc_call_log(con, fingerprint, job_id, task_id, "succeeded")

                if pass_type == "pass_b":
                    await self._plan_pass_c_and_inspect_tasks_for_day(
                        con,
                        job_id=job_id,
                        property_id=property_id,
                        site_url=site_url,
                        day=day,
                        pass_a_cfg=pass_a_cfg,
                        pass_c_cfg=pass_c_cfg,
                        inspect_cfg=inspect_cfg,
                    )

                duration_ms = int((datetime.now(timezone.utc) - started).total_seconds() * 1000)
                self._log(
                    f"task success job={job_id} day={day} pass={pass_type} page={page_url or '-'} rows={rows_written} duration_ms={duration_ms}"
                )
            except Exception as exc:
                await self._mark_gsc_task(
                    con,
                    task_id=task_id,
                    status="failed",
                    rows_written=0,
                    error_text=str(exc),
                    script_run_id=None,
                )
                await self._finish_gsc_call_log(con, fingerprint, job_id, task_id, "failed")
                failures.append(f"day={day} pass={pass_type} page={page_url or '-'} error={exc}")
                self._log(f"task failed job={job_id} day={day} pass={pass_type} page={page_url or '-'} error={exc}")
            await con.commit()

        if failures:
            raise RuntimeError(f"{len(failures)} gsc task(s) failed. First failure: {failures[0]}")

    def _gsc_fingerprint(
        self,
        site_url: str,
        day: str,
        pass_type: str,
        *,
        page_url: str | None,
        pass_a_cfg: dict[str, Any],
    ) -> str:
        if pass_type == "pass_a":
            mode = str(pass_a_cfg.get("mode", "top"))
            if mode == "top":
                return f"{site_url}|{day}|pass_a|mode=top|max_top_queries={int(pass_a_cfg.get('max_top_queries', 1000))}"
            return f"{site_url}|{day}|pass_a|mode=all"
        if pass_type == "pass_b":
            return f"{site_url}|{day}|pass_b|all"
        return f"{site_url}|{day}|{pass_type}|{page_url or ''}"

    async def _has_successful_gsc_history(self, con: aiosqlite.Connection, property_id: int) -> bool:
        cur = await con.execute(
            """
            SELECT COUNT(*) AS cnt
            FROM gsc_runs
            WHERE property_id=?
              AND status='succeeded'
              AND start_date=end_date
            """,
            (property_id,),
        )
        row = await cur.fetchone()
        return bool(row and int(row["cnt"]) > 0)

    def _build_day_list(self, window_days: int) -> list[str]:
        today = datetime.now(timezone.utc).date()
        return [(today - timedelta(days=offset)).strftime("%Y-%m-%d") for offset in range(window_days, 0, -1)]

    async def _plan_initial_gsc_tasks(
        self,
        con: aiosqlite.Connection,
        *,
        job_id: int,
        property_id: int,
        site_url: str,
        day_list: list[str],
        pass_a_cfg: dict[str, Any],
    ) -> None:
        for day in day_list:
            await self._create_gsc_task(
                con,
                job_id=job_id,
                property_id=property_id,
                day=day,
                pass_type="pass_a",
                page_url=None,
                fingerprint=self._gsc_fingerprint(site_url, day, "pass_a", page_url=None, pass_a_cfg=pass_a_cfg),
            )
            await self._create_gsc_task(
                con,
                job_id=job_id,
                property_id=property_id,
                day=day,
                pass_type="pass_b",
                page_url=None,
                fingerprint=self._gsc_fingerprint(site_url, day, "pass_b", page_url=None, pass_a_cfg=pass_a_cfg),
            )

    async def _plan_pass_c_and_inspect_tasks_for_day(
        self,
        con: aiosqlite.Connection,
        *,
        job_id: int,
        property_id: int,
        site_url: str,
        day: str,
        pass_a_cfg: dict[str, Any],
        pass_c_cfg: dict[str, Any],
        inspect_cfg: dict[str, Any],
    ) -> None:
        day_pages = await self._get_day_pass_b_pages(con, property_id, day)
        pass_c_scope = str(pass_c_cfg.get("scope", "top_pages"))
        pass_c_custom_pages = self._normalize_urls(pass_c_cfg.get("custom_page_urls") or [])
        inspect_custom_pages = self._normalize_urls((inspect_cfg or {}).get("custom_page_urls") or [])

        pass_c_targets: list[str] = []
        if pass_c_scope == "top_pages":
            page_limit = int(pass_c_cfg.get("top_pages_limit", 100))
            pass_c_targets = day_pages[:page_limit]
        elif pass_c_scope == "all_pages":
            pass_c_targets = day_pages
        elif pass_c_scope == "custom":
            pass_c_targets = pass_c_custom_pages

        for page_url in pass_c_targets:
            await self._create_gsc_task(
                con,
                job_id=job_id,
                property_id=property_id,
                day=day,
                pass_type="pass_c",
                page_url=page_url,
                fingerprint=self._gsc_fingerprint(site_url, day, "pass_c", page_url=page_url, pass_a_cfg=pass_a_cfg),
            )

        inspect_enabled = bool((inspect_cfg or {}).get("enabled", True))
        if not inspect_enabled:
            return

        missing_pages = await self._get_missing_pages_for_day(con, property_id, day)
        ordered_missing: list[str] = []
        missing_seen: set[str] = set()
        for url in missing_pages:
            if url in missing_seen:
                continue
            missing_seen.add(url)
            ordered_missing.append(url)
        ordered_custom = sorted([u for u in inspect_custom_pages if u not in missing_seen])
        inspect_candidates = ordered_missing + ordered_custom
        inspect_max_urls = int((inspect_cfg or {}).get("inspect_max_urls", 200))

        for page_url in inspect_candidates[:inspect_max_urls]:
            await self._create_gsc_task(
                con,
                job_id=job_id,
                property_id=property_id,
                day=day,
                pass_type="inspect",
                page_url=page_url,
                fingerprint=self._gsc_fingerprint(site_url, day, "inspect", page_url=page_url, pass_a_cfg=pass_a_cfg),
            )

    def _normalize_urls(self, urls: list[Any]) -> list[str]:
        cleaned: list[str] = []
        seen: set[str] = set()
        for value in urls:
            url = str(value or "").strip()
            if not url or url in seen:
                continue
            seen.add(url)
            cleaned.append(url)
        return cleaned

    async def _create_gsc_task(
        self,
        con: aiosqlite.Connection,
        *,
        job_id: int,
        property_id: int,
        day: str,
        pass_type: str,
        page_url: str | None,
        fingerprint: str,
    ) -> int:
        cur = await con.execute(
            """
            INSERT OR IGNORE INTO gsc_sync_tasks
            (job_id, property_id, day, pass_type, page_url, fingerprint, status, rows_written, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'queued', 0, datetime('now'))
            """,
            (job_id, property_id, day, pass_type, page_url, fingerprint),
        )
        if int(cur.lastrowid or 0) > 0:
            return int(cur.lastrowid)
        cur2 = await con.execute(
            """
            SELECT id
            FROM gsc_sync_tasks
            WHERE job_id=? AND day=? AND pass_type=? AND ifnull(page_url,'')=ifnull(?, '') AND fingerprint=?
            LIMIT 1
            """,
            (job_id, day, pass_type, page_url, fingerprint),
        )
        row = await cur2.fetchone()
        return int(row["id"])

    async def _mark_gsc_task(
        self,
        con: aiosqlite.Connection,
        *,
        task_id: int,
        status: str,
        rows_written: int | None = None,
        error_text: str | None = None,
        script_run_id: int | None = None,
    ) -> None:
        sets: list[str] = ["status=?"]
        params: list[Any] = [status]
        if status == "running":
            sets.append("started_at=datetime('now')")
        if status in {"succeeded", "failed", "skipped_dedupe_24h", "skipped_policy"}:
            sets.append("finished_at=datetime('now')")
        if rows_written is not None:
            sets.append("rows_written=?")
            params.append(rows_written)
        sets.append("error_text=?")
        params.append(error_text)
        if script_run_id is not None:
            sets.append("script_run_id=?")
            params.append(script_run_id)
        elif status in {"running", "succeeded", "skipped_dedupe_24h", "skipped_policy"}:
            sets.append("script_run_id=NULL")
        params.append(task_id)
        await con.execute(f"UPDATE gsc_sync_tasks SET {', '.join(sets)} WHERE id=?", tuple(params))

    async def _insert_gsc_call_log(
        self,
        con: aiosqlite.Connection,
        fingerprint: str,
        job_id: int,
        task_id: int,
        status: str,
    ) -> None:
        if status == "skipped_dedupe_24h":
            await con.execute(
                """
                INSERT INTO gsc_api_call_log (fingerprint, job_id, task_id, status, called_at, finished_at)
                VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
                """,
                (fingerprint, job_id, task_id, status),
            )
            return
        await con.execute(
            """
            INSERT INTO gsc_api_call_log (fingerprint, job_id, task_id, status, called_at)
            VALUES (?, ?, ?, ?, datetime('now'))
            """,
            (fingerprint, job_id, task_id, status),
        )

    async def _finish_gsc_call_log(
        self,
        con: aiosqlite.Connection,
        fingerprint: str,
        job_id: int,
        task_id: int,
        status: str,
    ) -> None:
        await con.execute(
            """
            UPDATE gsc_api_call_log
            SET status=?, finished_at=datetime('now')
            WHERE id=(
              SELECT id
              FROM gsc_api_call_log
              WHERE fingerprint=? AND job_id=? AND task_id=?
              ORDER BY called_at DESC, id DESC
              LIMIT 1
            )
            """,
            (status, fingerprint, job_id, task_id),
        )

    async def _is_recent_gsc_fingerprint(self, con: aiosqlite.Connection, fingerprint: str) -> bool:
        cur = await con.execute(
            """
            SELECT id
            FROM gsc_api_call_log
            WHERE fingerprint=?
              AND status IN ('running','succeeded')
              AND datetime(called_at) >= datetime('now', '-24 hours')
            ORDER BY called_at DESC
            LIMIT 1
            """,
            (fingerprint,),
        )
        row = await cur.fetchone()
        return row is not None

    async def _execute_gsc_task(
        self,
        *,
        con: aiosqlite.Connection,
        job_id: int,
        task_id: int,
        property_id: int,
        site_url: str,
        day: str,
        pass_type: str,
        page_url: str | None,
        pass_a_cfg: dict[str, Any],
        auth_json: str | None,
    ) -> tuple[int, int | None]:
        run_key = f"gsc:{job_id}:{task_id}:{site_url}:{pass_type}:{day}:{page_url or 'all'}:{datetime.utcnow().isoformat()}"
        cur = await con.execute(
            """
            INSERT INTO gsc_runs (job_id, run_key, property_id, pass_type, page_url, start_date, end_date, status, started_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'running', datetime('now'))
            """,
            (job_id, run_key, property_id, pass_type, page_url, day, day),
        )
        run_id = int(cur.lastrowid)

        if pass_type == "pass_a":
            args = ["pass-a", "--site-url", site_url, "--start-date", day, "--end-date", day]
            mode = str(pass_a_cfg.get("mode", "top"))
            if mode == "top":
                args += ["--limit", str(int(pass_a_cfg.get("max_top_queries", 1000)))]
            else:
                args += ["--all-rows", "--page-size", "25000"]
            if auth_json:
                args += ["--auth-json", auth_json]
            res = await self._run_script(con, job_id=job_id, script_name="gsc_fetch.py", args=args)
            if not res.ok:
                await con.execute("UPDATE gsc_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?", (res.stderr, run_id))
                raise RuntimeError(f"gsc pass-a failed: {res.stderr}")
            data = self._parse_script_json(
                res.stdout,
                fallback="{}",
                context=f"gsc pass-a parse failed job_id={job_id} task_id={task_id} script_run_id={res.script_run_id}",
            )
            rows = data.get("rows", []) or []
            for row in rows:
                keys = row.get("keys", [])
                if not keys:
                    continue
                query_text = keys[0].strip()
                if not query_text:
                    continue
                query_id = await self._get_or_create_query(con, query_text, source_type="gsc", query_class="keyword")
                await con.execute(
                    """
                    INSERT OR REPLACE INTO gsc_query_metrics
                    (gsc_run_id, query_id, clicks, impressions, ctr, position)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        run_id,
                        query_id,
                        float(row.get("clicks", 0.0)),
                        float(row.get("impressions", 0.0)),
                        float(row.get("ctr", 0.0)),
                        float(row.get("position", 0.0)),
                    ),
                )
            await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
            return len(rows), res.script_run_id

        if pass_type == "pass_b":
            args = ["pass-b", "--site-url", site_url, "--start-date", day, "--end-date", day, "--all-rows", "--page-size", "25000"]
            if auth_json:
                args += ["--auth-json", auth_json]
            res = await self._run_script(con, job_id=job_id, script_name="gsc_fetch.py", args=args)
            if not res.ok:
                await con.execute("UPDATE gsc_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?", (res.stderr, run_id))
                raise RuntimeError(f"gsc pass-b failed: {res.stderr}")
            data = self._parse_script_json(
                res.stdout,
                fallback="{}",
                context=f"gsc pass-b parse failed job_id={job_id} task_id={task_id} script_run_id={res.script_run_id}",
            )
            rows = data.get("rows", []) or []
            for row in rows:
                keys = row.get("keys", [])
                if not keys:
                    continue
                purl = keys[0]
                await con.execute(
                    """
                    INSERT OR REPLACE INTO gsc_page_metrics
                    (gsc_run_id, page_url, clicks, impressions, ctr, position)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        run_id,
                        purl,
                        float(row.get("clicks", 0.0)),
                        float(row.get("impressions", 0.0)),
                        float(row.get("ctr", 0.0)),
                        float(row.get("position", 0.0)),
                    ),
                )
                await con.execute(
                    """
                    INSERT INTO gsc_known_pages(property_id, page_url, first_seen_day, last_seen_day)
                    VALUES (?, ?, ?, ?)
                    ON CONFLICT(property_id, page_url) DO UPDATE SET last_seen_day=excluded.last_seen_day
                    """,
                    (property_id, purl, day, day),
                )
            await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
            return len(rows), res.script_run_id

        if pass_type == "pass_c":
            if not page_url:
                await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
                return 0, None
            args = ["pass-c", "--site-url", site_url, "--page-url", page_url, "--start-date", day, "--end-date", day, "--all-rows", "--page-size", "25000"]
            if auth_json:
                args += ["--auth-json", auth_json]
            res = await self._run_script(con, job_id=job_id, script_name="gsc_fetch.py", args=args)
            if not res.ok:
                await con.execute("UPDATE gsc_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?", (res.stderr, run_id))
                raise RuntimeError(f"gsc pass-c failed: {res.stderr}")
            data = self._parse_script_json(
                res.stdout,
                fallback="{}",
                context=f"gsc pass-c parse failed job_id={job_id} task_id={task_id} script_run_id={res.script_run_id}",
            )
            rows = data.get("rows", []) or []
            for row in rows:
                keys = row.get("keys", [])
                if not keys:
                    continue
                query_text = keys[0].strip()
                if not query_text:
                    continue
                query_id = await self._get_or_create_query(con, query_text, source_type="gsc", query_class="keyword")
                await con.execute(
                    """
                    INSERT OR REPLACE INTO gsc_page_query_metrics
                    (gsc_run_id, page_url, query_id, clicks, impressions, ctr, position)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        run_id,
                        page_url,
                        query_id,
                        float(row.get("clicks", 0.0)),
                        float(row.get("impressions", 0.0)),
                        float(row.get("ctr", 0.0)),
                        float(row.get("position", 0.0)),
                    ),
                )
            await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
            return len(rows), res.script_run_id

        if pass_type == "inspect":
            if not page_url:
                await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
                return 0, None
            args = ["inspect", "--site-url", site_url, "--page-url", page_url]
            if auth_json:
                args += ["--auth-json", auth_json]
            res = await self._run_script(con, job_id=job_id, script_name="gsc_fetch.py", args=args)
            if not res.ok:
                await con.execute("UPDATE gsc_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?", (res.stderr, run_id))
                raise RuntimeError(f"gsc inspect failed: {res.stderr}")
            data = self._parse_script_json(
                res.stdout,
                fallback="{}",
                context=f"gsc inspect parse failed job_id={job_id} task_id={task_id} script_run_id={res.script_run_id}",
            )
            idx = (data.get("inspectionResult", {}) or {}).get("indexStatusResult", {}) or {}
            await con.execute(
                """
                INSERT INTO gsc_url_inspections
                (gsc_run_id, page_url, status, coverage_state, robots_txt_state, indexing_state, last_crawl_time, raw_json, inspected_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
                """,
                (
                    run_id,
                    page_url,
                    idx.get("status"),
                    idx.get("coverageState"),
                    idx.get("robotsTxtState"),
                    idx.get("indexingState"),
                    idx.get("lastCrawlTime"),
                    json.dumps(data),
                ),
            )
            await con.execute("UPDATE gsc_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?", (run_id,))
            return 1, res.script_run_id

        raise ValueError(f"Unsupported gsc task pass_type={pass_type}")

    async def _get_day_pass_b_pages(self, con: aiosqlite.Connection, property_id: int, day: str) -> list[str]:
        cur = await con.execute(
            """
            SELECT m.page_url
            FROM gsc_page_metrics m
            JOIN gsc_runs r ON r.id=m.gsc_run_id
            WHERE r.property_id=? AND r.pass_type='pass_b' AND r.status='succeeded'
              AND r.start_date=? AND r.end_date=?
            ORDER BY m.impressions DESC, m.clicks DESC, m.page_url ASC
            """,
            (property_id, day, day),
        )
        rows = await cur.fetchall()
        return [str(r["page_url"]) for r in rows]

    async def _get_missing_pages_for_day(self, con: aiosqlite.Connection, property_id: int, day: str) -> list[str]:
        known_cur = await con.execute(
            """
            SELECT page_url
            FROM gsc_known_pages
            WHERE property_id=?
            ORDER BY last_seen_day ASC, page_url ASC
            """,
            (property_id,),
        )
        known_rows = await known_cur.fetchall()
        today_pages = set(await self._get_day_pass_b_pages(con, property_id, day))
        missing = [str(r["page_url"]) for r in known_rows if str(r["page_url"]) not in today_pages]
        return missing

    async def _select_keywords_for_enrichment(self, con: aiosqlite.Connection, query_ids: list[int] | None, max_age_days: int | None = None) -> list[dict[str, Any]]:
        if query_ids:
            placeholders = ",".join(["?"] * len(query_ids))
            cur = await con.execute(
                f"""
                SELECT q.id, q.query_text
                FROM queries q
                WHERE q.id IN ({placeholders})
                  AND q.query_class='keyword'
                """,
                tuple(query_ids),
            )
            rows = await cur.fetchall()
            return [dict(r) for r in rows]
        stale_condition = ""
        if max_age_days is not None:
            stale_condition = f"OR datetime(s.fetched_at) < datetime('now', '-{int(max_age_days)} days')"
        cur = await con.execute(
            f"""
            SELECT q.id, q.query_text
            FROM queries q
            LEFT JOIN query_seranking_current s ON s.query_id=q.id
            WHERE q.query_class='keyword'
              AND q.is_active=1
              AND (q.seranking_status!='ready' OR s.query_id IS NULL {stale_condition})
            ORDER BY q.id
            """
        )
        rows = await cur.fetchall()
        return [dict(r) for r in rows]

    async def _handle_seranking_enrich(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        query_ids = payload.get("query_ids")
        max_age_days = payload.get("max_age_days")  # Re-enrich if data older than X days
        selected = await self._select_keywords_for_enrichment(con, query_ids, max_age_days)
        if not selected:
            return
        batch_size = int(payload.get("batch_size", 200))
        for i in range(0, len(selected), batch_size):
            batch = selected[i : i + batch_size]
            keywords = [row["query_text"] for row in batch]
            res = await self._run_script(
                con,
                job_id=job["id"],
                script_name="get_keyword_data.py",
                args=keywords,
            )
            if not res.ok:
                raise RuntimeError(f"seranking script failed: {res.stderr}")
            rows = self._parse_script_json(
                res.stdout,
                fallback="[]",
                context=f"seranking parse failed job_id={job['id']} script_run_id={res.script_run_id}",
            )
            metrics_by_keyword = {str(r.get("keyword", "")).lower(): r for r in rows}
            for row in batch:
                query_id = int(row["id"])
                kw = row["query_text"]
                m = metrics_by_keyword.get(kw.lower())
                if not m or m.get("error"):
                    await con.execute(
                        "UPDATE queries SET seranking_status='failed', updated_at=datetime('now') WHERE id=?",
                        (query_id,),
                    )
                    continue
                volume = int(m.get("volume", 0) or 0)
                cpc = float(m.get("cpc", 0.0) or 0.0)
                competition = float(m.get("competition", 0.0) or 0.0)
                difficulty = int(m.get("difficulty", 0) or 0)
                await con.execute(
                    """
                    INSERT OR REPLACE INTO query_seranking_current
                    (query_id, volume, cpc, competition, difficulty, fetched_at, source_run_id)
                    VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
                    """,
                    (query_id, volume, cpc, competition, difficulty, res.script_run_id),
                )
                await con.execute(
                    """
                    INSERT INTO query_seranking_history
                    (query_id, volume, cpc, competition, difficulty, fetched_at, source_run_id)
                    VALUES (?, ?, ?, ?, ?, datetime('now'), ?)
                    """,
                    (query_id, volume, cpc, competition, difficulty, res.script_run_id),
                )
                await con.execute(
                    "UPDATE queries SET seranking_status='ready', updated_at=datetime('now') WHERE id=?",
                    (query_id,),
                )
            await con.commit()

    async def _handle_prioritize(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        query_ids = payload.get("query_ids")
        if query_ids:
            placeholders = ",".join(["?"] * len(query_ids))
            cur = await con.execute(
                f"""
                SELECT q.id, q.query_text AS keyword, s.volume, s.difficulty, s.cpc, s.competition
                FROM queries q
                JOIN query_seranking_current s ON s.query_id=q.id
                WHERE q.id IN ({placeholders})
                  AND q.query_class='keyword'
                """,
                tuple(query_ids),
            )
        else:
            cur = await con.execute(
                """
                SELECT q.id, q.query_text AS keyword, s.volume, s.difficulty, s.cpc, s.competition
                FROM queries q
                JOIN query_seranking_current s ON s.query_id=q.id
                WHERE q.query_class='keyword'
                  AND q.is_active=1
                  AND q.priority_status!='ready'
                ORDER BY q.id
                """
            )
        rows = [dict(r) for r in await cur.fetchall()]
        if not rows:
            return
        batch_size = int(payload.get("batch_size", 200))
        for i in range(0, len(rows), batch_size):
            batch = rows[i : i + batch_size]
            with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False, encoding="utf-8") as tmpf:
                json.dump(batch, tmpf)
                tmp_path = tmpf.name
            try:
                res = await self._run_script(
                    con,
                    job_id=job["id"],
                    script_name="prioritize_keywords.py",
                    args=["--input-json", tmp_path, "--json"],
                )
            finally:
                Path(tmp_path).unlink(missing_ok=True)

            if not res.ok:
                raise RuntimeError(f"prioritize script failed: {res.stderr}")
            data = self._parse_script_json(
                res.stdout,
                fallback="{}",
                context=f"prioritize parse failed job_id={job['id']} script_run_id={res.script_run_id}",
            )
            result_rows = data.get("results", []) or []
            by_keyword = {str(r.get("keyword", "")).lower(): r for r in result_rows}
            for item in batch:
                query_id = int(item["id"])
                match = by_keyword.get(str(item["keyword"]).lower())
                if not match:
                    await con.execute(
                        "UPDATE queries SET priority_status='failed', updated_at=datetime('now') WHERE id=?",
                        (query_id,),
                    )
                    continue
                score = float(match.get("priority_score", 0.0))
                reason = str(match.get("priority_reason", ""))
                await con.execute(
                    """
                    INSERT OR REPLACE INTO query_priority_current
                    (query_id, priority_score, priority_reason, prioritized_at, source_run_id)
                    VALUES (?, ?, ?, datetime('now'), ?)
                    """,
                    (query_id, score, reason, res.script_run_id),
                )
                await con.execute(
                    """
                    INSERT INTO query_priority_history
                    (query_id, priority_score, priority_reason, prioritized_at, source_run_id)
                    VALUES (?, ?, ?, datetime('now'), ?)
                    """,
                    (query_id, score, reason, res.script_run_id),
                )
                await con.execute(
                    "UPDATE queries SET priority_status='ready', updated_at=datetime('now') WHERE id=?",
                    (query_id,),
                )
            await con.commit()

    async def _handle_serp_check(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        domain = payload.get("domain")
        if not domain:
            raise ValueError("serp_check requires domain")
        query_ids = payload.get("query_ids")
        if query_ids:
            placeholders = ",".join(["?"] * len(query_ids))
            cur = await con.execute(
                f"SELECT id, query_text FROM queries WHERE id IN ({placeholders}) AND query_class='keyword' AND is_active=1",
                tuple(query_ids),
            )
        else:
            cur = await con.execute(
                "SELECT id, query_text FROM queries WHERE query_class='keyword' AND is_active=1 ORDER BY id"
            )
        rows = [dict(r) for r in await cur.fetchall()]
        if not rows:
            return
        run_key = f"serp:{domain}:{datetime.utcnow().isoformat()}"
        cur = await con.execute(
            """
            INSERT INTO serp_runs (job_id, run_key, domain, status, started_at)
            VALUES (?, ?, ?, 'running', datetime('now'))
            """,
            (job["id"], run_key, domain),
        )
        serp_run_id = int(cur.lastrowid)
        await con.commit()

        keywords = [r["query_text"] for r in rows]
        keyword_id_map = {r["query_text"].lower(): int(r["id"]) for r in rows}
        batch_size = int(payload.get("batch_size", 200))
        try:
            for i in range(0, len(keywords), batch_size):
                batch = keywords[i : i + batch_size]
                res = await self._run_script(
                    con,
                    job_id=job["id"],
                    script_name="check_rankings.py",
                    args=[domain, *batch, "--json"],
                )
                if not res.ok:
                    raise RuntimeError(res.stderr)
                data = self._parse_script_json(
                    res.stdout,
                    fallback="{}",
                    context=f"serp parse failed job_id={job['id']} script_run_id={res.script_run_id}",
                )
                for item in data.get("results", []) or []:
                    kw = str(item.get("keyword", ""))
                    qid = keyword_id_map.get(kw.lower())
                    if not qid:
                        continue
                    rank = item.get("rank")
                    url = item.get("url")
                    is_found = 1 if rank is not None else 0
                    await con.execute(
                        """
                        INSERT OR REPLACE INTO serp_results
                        (serp_run_id, query_id, rank, url, is_found, raw_json)
                        VALUES (?, ?, ?, ?, ?, ?)
                        """,
                        (serp_run_id, qid, rank, url, is_found, json.dumps(item)),
                    )
                await con.commit()
            await con.execute(
                "UPDATE serp_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?",
                (serp_run_id,),
            )
            await con.commit()
        except Exception as exc:
            await con.execute(
                "UPDATE serp_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?",
                (str(exc), serp_run_id),
            )
            await con.commit()
            raise

    async def _handle_ai_visibility_check(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        domain = payload.get("domain")
        if not domain:
            raise ValueError("ai_visibility_check requires domain")
        query_ids = payload.get("query_ids")
        if query_ids:
            placeholders = ",".join(["?"] * len(query_ids))
            cur = await con.execute(
                f"SELECT id, query_text FROM queries WHERE id IN ({placeholders}) AND query_class='ai_visibility' AND is_active=1",
                tuple(query_ids),
            )
        else:
            cur = await con.execute(
                "SELECT id, query_text FROM queries WHERE query_class='ai_visibility' AND is_active=1 ORDER BY id"
            )
        rows = [dict(r) for r in await cur.fetchall()]
        if not rows:
            return
        run_key = f"ai:{domain}:{datetime.utcnow().isoformat()}"
        cur = await con.execute(
            """
            INSERT INTO ai_visibility_runs (job_id, run_key, domain, status, started_at)
            VALUES (?, ?, ?, 'running', datetime('now'))
            """,
            (job["id"], run_key, domain),
        )
        ai_run_id = int(cur.lastrowid)
        await con.commit()

        queries = [r["query_text"] for r in rows]
        query_id_map = {r["query_text"].lower(): int(r["id"]) for r in rows}
        batch_size = int(payload.get("batch_size", 100))
        concurrency = int(payload.get("concurrency", 20))
        try:
            for i in range(0, len(queries), batch_size):
                batch = queries[i : i + batch_size]
                args = [*batch, "--domain", domain, "--concurrency", str(concurrency), "--json"]
                res = await self._run_script(
                    con,
                    job_id=job["id"],
                    script_name="google_search_test.py",
                    args=args,
                )
                if not res.ok:
                    raise RuntimeError(res.stderr)
                data = self._parse_script_json(
                    res.stdout,
                    fallback="{}",
                    context=f"ai_visibility parse failed job_id={job['id']} script_run_id={res.script_run_id}",
                )
                for item in data.get("results", []) or []:
                    qtext = str(item.get("query", ""))
                    qid = query_id_map.get(qtext.lower())
                    if not qid:
                        continue
                    found = item.get("found")
                    if found is None:
                        found = False
                    await con.execute(
                        """
                        INSERT OR REPLACE INTO ai_visibility_results
                        (ai_run_id, query_id, is_visible, citation_urls_json, raw_json)
                        VALUES (?, ?, ?, ?, ?)
                        """,
                        (
                            ai_run_id,
                            qid,
                            1 if bool(found) else 0,
                            json.dumps(item.get("urls", [])),
                            json.dumps(item),
                        ),
                    )
                await con.commit()
            await con.execute(
                "UPDATE ai_visibility_runs SET status='succeeded', finished_at=datetime('now'), error_text=NULL WHERE id=?",
                (ai_run_id,),
            )
            await con.commit()
        except Exception as exc:
            await con.execute(
                "UPDATE ai_visibility_runs SET status='failed', finished_at=datetime('now'), error_text=? WHERE id=?",
                (str(exc), ai_run_id),
            )
            await con.commit()
            raise

    async def _handle_full_refresh(self, con: aiosqlite.Connection, job: dict[str, Any], payload: dict[str, Any]) -> None:
        if payload.get("gsc"):
            await self._handle_gsc_sync(con, job, payload["gsc"])
        if payload.get("seranking", True):
            await self._handle_seranking_enrich(con, job, payload.get("seranking_payload", {}))
        if payload.get("prioritize", True):
            await self._handle_prioritize(con, job, payload.get("prioritize_payload", {}))
        if payload.get("serp"):
            await self._handle_serp_check(con, job, payload["serp"])
        if payload.get("ai_visibility"):
            await self._handle_ai_visibility_check(con, job, payload["ai_visibility"])
