#!/usr/bin/env python3

from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from typing import Any
from urllib import error, request


DEFAULT_API_BASE = "http://localhost:8010/api"
DEFAULT_POLL_SECONDS = 10
DEFAULT_HEALTH_WAIT_SECONDS = 30
DEFAULT_GSC_AUTH_JSON = str(Path(__file__).resolve().parents[1] / "service_account_credentials.json")


@dataclass
class JobStep:
    name: str
    endpoint: str
    payload: dict[str, Any]


class ApiError(RuntimeError):
    pass


@dataclass
class ManagedBackend:
    process: subprocess.Popen[str] | None
    started_by_script: bool
    log_path: Path | None


def _request_json(method: str, url: str, payload: dict[str, Any] | None = None) -> dict[str, Any]:
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")

    req = request.Request(url, data=data, headers=headers, method=method)
    try:
        with request.urlopen(req, timeout=60) as resp:
            raw = resp.read().decode("utf-8")
    except error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        detail = body
        try:
            parsed = json.loads(body)
            detail = parsed.get("detail", body)
        except json.JSONDecodeError:
            pass
        raise ApiError(f"{method} {url} failed with HTTP {exc.code}: {detail}") from exc
    except error.URLError as exc:
        raise ApiError(f"{method} {url} failed: {exc}") from exc

    try:
        return json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ApiError(f"{method} {url} returned invalid JSON: {raw[:400]}") from exc


def _healthcheck(api_base: str) -> bool:
    try:
        health = _request_json("GET", f"{api_base}/health")
    except ApiError:
        return False
    return health.get("status") == "ok"


def ensure_backend(
    api_base: str,
    *,
    backend_python: str,
    host: str,
    port: int,
    health_wait_seconds: int,
) -> ManagedBackend:
    if _healthcheck(api_base):
        print("[backend] reusing existing backend")
        return ManagedBackend(process=None, started_by_script=False, log_path=None)

    repo_root = Path(__file__).resolve().parents[1]
    log_path = repo_root / "backend.log"
    env = os.environ.copy()
    env.setdefault("AUTOSEO_PYTHON_BIN", backend_python)

    log_handle = log_path.open("a", encoding="utf-8")
    process = subprocess.Popen(
        [
            backend_python,
            "-m",
            "uvicorn",
            "backend.app.main:app",
            "--host",
            host,
            "--port",
            str(port),
        ],
        cwd=repo_root,
        env=env,
        stdout=log_handle,
        stderr=subprocess.STDOUT,
        text=True,
    )
    print(f"[backend] started pid={process.pid} log={log_path}")

    deadline = time.monotonic() + health_wait_seconds
    while time.monotonic() < deadline:
        if process.poll() is not None:
            raise ApiError(f"Backend exited during startup. Check log: {log_path}")
        if _healthcheck(api_base):
            print("[backend] healthcheck passed")
            return ManagedBackend(process=process, started_by_script=True, log_path=log_path)
        time.sleep(1)

    process.terminate()
    try:
        process.wait(timeout=10)
    except subprocess.TimeoutExpired:
        process.kill()
        process.wait(timeout=10)
    raise ApiError(f"Backend did not become healthy within {health_wait_seconds}s. Check log: {log_path}")


def stop_backend(managed: ManagedBackend) -> None:
    if not managed.started_by_script or managed.process is None:
        return
    print(f"[backend] stopping pid={managed.process.pid}")
    managed.process.terminate()
    try:
        managed.process.wait(timeout=15)
    except subprocess.TimeoutExpired:
        managed.process.kill()
        managed.process.wait(timeout=15)
    print("[backend] stopped")


def enqueue_job(api_base: str, step: JobStep) -> int:
    response = _request_json("POST", f"{api_base}/{step.endpoint}", step.payload)
    job_id = response.get("id")
    status = response.get("status")
    if not isinstance(job_id, int):
        raise ApiError(f"{step.name} enqueue did not return a valid job id: {response}")
    print(f"[enqueue] {step.name}: job_id={job_id} status={status}")
    return job_id


def get_job_status(api_base: str, job_id: int) -> dict[str, Any]:
    response = _request_json("GET", f"{api_base}/jobs/{job_id}")
    job = response.get("job")
    if not isinstance(job, dict):
        raise ApiError(f"Job {job_id} response missing 'job': {response}")
    return job


def wait_for_job(api_base: str, job_id: int, job_name: str, poll_seconds: int, max_wait_seconds: int | None) -> None:
    start = time.monotonic()
    print(f"[wait] {job_name}: polling job_id={job_id} every {poll_seconds}s")

    while True:
        job = get_job_status(api_base, job_id)
        status = str(job.get("status", "unknown"))
        finished_at = job.get("finished_at")

        if status == "succeeded":
            print(f"[done] {job_name}: succeeded finished_at={finished_at}")
            return
        if status in {"failed", "cancelled"}:
            error_text = (job.get("error_text") or "").strip()
            raise ApiError(f"{job_name} ended with status={status}: {error_text or 'no error text'}")

        elapsed = int(time.monotonic() - start)
        if max_wait_seconds is not None and elapsed >= max_wait_seconds:
            raise ApiError(f"{job_name} exceeded max_wait_seconds={max_wait_seconds}")

        print(f"[wait] {job_name}: status={status} elapsed={elapsed}s")
        time.sleep(poll_seconds)


def build_steps() -> list[JobStep]:
    return [
        JobStep(
            name="GSC Sync",
            endpoint="jobs/gsc-sync",
            payload={
                "site_url": "sc-domain:conthunt.app",
                "window_days": 7,
                "auth_json": DEFAULT_GSC_AUTH_JSON,
                "pass_a": {"mode": "top", "max_top_queries": 100},
                "pass_c": {"scope": "top_pages", "top_pages_limit": 100},
                "inspect": {"enabled": True, "inspect_max_urls": 200},
            },
        ),
        JobStep(
            name="SERP Rank Check",
            endpoint="jobs/serp-check",
            payload={"domain": "conthunt.app"},
        ),
        JobStep(
            name="AI Visibility Check",
            endpoint="jobs/ai-visibility-check",
            payload={"domain": "conthunt.app", "concurrency": 20},
        ),
        JobStep(
            name="Keyword Full Refresh",
            endpoint="jobs/full-refresh",
            payload={
                "seranking": True,
                "prioritize": True,
                "seranking_payload": {"batch_size": 50, "max_age_days": 30},
                "prioritize_payload": {"batch_size": 50},
            },
        ),
    ]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Enqueue and monitor the daily AutoSEO backend jobs.")
    parser.add_argument("--api-base", default=DEFAULT_API_BASE, help="Backend API base URL")
    parser.add_argument("--backend-python", default=sys.executable, help="Python executable used to start the backend")
    parser.add_argument("--backend-host", default="127.0.0.1", help="Host for the backend process started by this runner")
    parser.add_argument("--backend-port", type=int, default=8010, help="Port for the backend process started by this runner")
    parser.add_argument(
        "--health-wait-seconds",
        type=int,
        default=DEFAULT_HEALTH_WAIT_SECONDS,
        help="How long to wait for the backend healthcheck after starting it",
    )
    parser.add_argument(
        "--poll-seconds",
        type=int,
        default=DEFAULT_POLL_SECONDS,
        help="Polling interval in seconds while waiting for a job",
    )
    parser.add_argument(
        "--max-wait-seconds",
        type=int,
        default=None,
        help="Optional per-job timeout in seconds. Omit for no timeout.",
    )
    parser.add_argument(
        "--jobs",
        type=str,
        default=None,
        help="Comma-separated list of jobs to run. Options: gsc,serp,ai,refresh. Default: all jobs.",
    )
    parser.add_argument(
        "--skip",
        type=str,
        default=None,
        help="Comma-separated list of jobs to skip. Options: gsc,serp,ai,refresh.",
    )
    return parser.parse_args()


JOB_ALIASES = {
    "gsc": "GSC Sync",
    "serp": "SERP Rank Check",
    "ai": "AI Visibility Check",
    "refresh": "Keyword Full Refresh",
}


def filter_steps(steps: list[JobStep], jobs: str | None, skip: str | None) -> list[JobStep]:
    """Filter steps based on --jobs and --skip arguments."""
    if jobs is None and skip is None:
        return steps

    # Build set of job names to include
    if jobs:
        include_names = {JOB_ALIASES.get(j.strip().lower(), j.strip()) for j in jobs.split(",")}
    else:
        include_names = {step.name for step in steps}

    # Build set of job names to skip
    if skip:
        skip_names = {JOB_ALIASES.get(s.strip().lower(), s.strip()) for s in skip.split(",")}
    else:
        skip_names = set()

    return [step for step in steps if step.name in include_names and step.name not in skip_names]


def main() -> int:
    args = parse_args()
    api_base = args.api_base.rstrip("/")
    all_steps = build_steps()
    steps = filter_steps(all_steps, args.jobs, args.skip)
    managed_backend: ManagedBackend | None = None

    if not steps:
        print("[error] No jobs selected. Use --jobs or --skip to select jobs.", file=sys.stderr)
        return 1

    print(f"[start] api_base={api_base}")
    print(f"[jobs] running: {', '.join(s.name for s in steps)}")
    try:
        managed_backend = ensure_backend(
            api_base,
            backend_python=args.backend_python,
            host=args.backend_host,
            port=args.backend_port,
            health_wait_seconds=args.health_wait_seconds,
        )
        health = _request_json("GET", f"{api_base}/health")
        print(f"[health] status={health.get('status')}")
        for step in steps:
            job_id = enqueue_job(api_base, step)
            wait_for_job(api_base, job_id, step.name, args.poll_seconds, args.max_wait_seconds)
    except ApiError as exc:
        print(f"[error] {exc}", file=sys.stderr)
        return 1
    finally:
        if managed_backend is not None:
            stop_backend(managed_backend)

    print("[complete] all jobs finished successfully")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
