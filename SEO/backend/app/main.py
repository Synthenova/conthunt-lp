from __future__ import annotations

import json
from contextlib import asynccontextmanager
from typing import Any

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from .db import connect
from .settings import get_settings
from .worker import JobWorker

settings = get_settings()
worker = JobWorker(settings)


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with connect(str(settings.db_path)) as con:
        # Schema execution removed; schema is now assumed to already exist in the DB.
        pass
    await worker.start()
    yield
    await worker.stop()


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def create_job(job_type: str, payload: dict[str, Any], requested_by: str | None = None, target_key: str | None = None) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        existing = await con.execute(
            """
            SELECT id, status
            FROM jobs
            WHERE job_type=? AND status IN ('queued', 'running')
            ORDER BY requested_at DESC, id DESC
            LIMIT 1
            """,
            (job_type,),
        )
        existing_row = await existing.fetchone()
        if existing_row is not None:
            raise HTTPException(
                status_code=409,
                detail=f"Job type '{job_type}' already has an active job (id={existing_row['id']}, status={existing_row['status']})",
            )

        cur = await con.execute(
            """
            INSERT INTO jobs (job_type, status, target_key, payload_json, requested_by, requested_at)
            VALUES (?, 'queued', ?, ?, ?, datetime('now'))
            """,
            (job_type, target_key, json.dumps(payload), requested_by),
        )
        job_id = int(cur.lastrowid)
        await con.commit()
        c = await con.execute("SELECT * FROM jobs WHERE id=?", (job_id,))
        row = await c.fetchone()
        return dict(row)


def _normalize_day_range(from_day_ago: int, to_day_ago: int) -> tuple[int, int]:
    if from_day_ago < 1 or to_day_ago < 1:
        raise HTTPException(status_code=400, detail="from_day_ago and to_day_ago must be >= 1")
    if from_day_ago > 60 or to_day_ago > 60:
        raise HTTPException(status_code=400, detail="from_day_ago and to_day_ago must be <= 60")
    if from_day_ago < to_day_ago:
        raise HTTPException(status_code=400, detail="from_day_ago must be >= to_day_ago")
    return from_day_ago, to_day_ago


def _sort_clause(sort_by: str, sort_dir: str, allowed: dict[str, str], default: str) -> str:
    key = allowed.get(sort_by, allowed[default])
    direction = "ASC" if sort_dir.lower() == "asc" else "DESC"
    return f" ORDER BY {key} {direction} "


def _parse_bool_int(value: int | None) -> int | None:
    if value is None:
        return None
    if value not in (0, 1):
        raise HTTPException(status_code=400, detail="Boolean query params must be 0 or 1")
    return value


@app.get("/api/health")
async def health() -> dict[str, Any]:
    return {"status": "ok"}


@app.get("/api/meta/summary")
async def meta_summary() -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT
                (SELECT COUNT(*) FROM queries) AS total_queries,
                (SELECT COUNT(*) FROM queries WHERE query_class='keyword') AS keyword_queries,
                (SELECT COUNT(*) FROM queries WHERE query_class='ai_visibility') AS ai_queries,
                (SELECT COUNT(*) FROM jobs WHERE status='queued') AS queued_jobs,
                (SELECT COUNT(*) FROM jobs WHERE status='running') AS running_jobs
            """
        )
        row = await cur.fetchone()
        return dict(row)


@app.get("/api/dashboard/overview")
async def dashboard_overview(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
) -> dict[str, Any]:
    from_day_ago, to_day_ago = _normalize_day_range(from_day_ago, to_day_ago)
    from_expr = f"-{from_day_ago} days"
    to_expr = f"-{to_day_ago} days"

    async with connect(str(settings.db_path)) as con:
        gsc_totals_cur = await con.execute(
            """
            WITH latest_pass_a AS (
              SELECT r.id, r.start_date
              FROM gsc_runs r
              JOIN (
                SELECT start_date, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date
              ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_a' AND r.status='succeeded'
            )
            SELECT
              COALESCE(SUM(m.impressions), 0.0) AS total_impressions,
              COALESCE(SUM(m.clicks), 0.0) AS total_clicks,
              CASE WHEN COALESCE(SUM(m.impressions), 0.0) > 0 THEN SUM(m.clicks) / SUM(m.impressions) ELSE 0 END AS ctr,
              COALESCE(AVG(m.position), 0.0) AS avg_position
            FROM latest_pass_a p
            JOIN gsc_query_metrics m ON m.gsc_run_id=p.id
            """,
            (from_expr, to_expr),
        )
        gsc_totals = dict(await gsc_totals_cur.fetchone())

        ai_totals_cur = await con.execute(
            """
            SELECT
              COALESCE(AVG(a.is_visible), 0.0) AS ai_visibility_rate
            FROM ai_visibility_results a
            JOIN ai_visibility_runs r ON r.id=a.ai_run_id
            WHERE r.status='succeeded'
              AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            """,
            (from_expr, to_expr),
        )
        ai_totals = dict(await ai_totals_cur.fetchone())

        tracked_cur = await con.execute(
            "SELECT COUNT(*) AS tracked_keywords FROM queries WHERE query_class='keyword' AND is_active=1"
        )
        tracked = dict(await tracked_cur.fetchone())

        gains_cur = await con.execute(
            """
            WITH serp_range AS (
              SELECT s.query_id, r.started_at, s.rank
              FROM serp_results s
              JOIN serp_runs r ON r.id=s.serp_run_id
              WHERE r.status='succeeded'
                AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            ),
            ranked AS (
              SELECT
                query_id,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at ASC) AS first_rank,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at DESC) AS last_rank
              FROM serp_range
            )
            SELECT
              SUM(CASE WHEN first_rank IS NOT NULL AND last_rank IS NOT NULL AND last_rank < first_rank THEN 1 ELSE 0 END) AS gainers,
              SUM(CASE WHEN first_rank IS NOT NULL AND last_rank IS NOT NULL AND last_rank > first_rank THEN 1 ELSE 0 END) AS losers
            FROM (SELECT DISTINCT query_id, first_rank, last_rank FROM ranked)
            """,
            (from_expr, to_expr),
        )
        gains = dict(await gains_cur.fetchone())

        gsc_daily_cur = await con.execute(
            """
            WITH latest_pass_a AS (
              SELECT r.id, r.start_date
              FROM gsc_runs r
              JOIN (
                SELECT start_date, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date
              ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_a' AND r.status='succeeded'
            )
            SELECT
              p.start_date AS day,
              COALESCE(SUM(m.impressions), 0.0) AS impressions,
              COALESCE(SUM(m.clicks), 0.0) AS clicks,
              COALESCE(AVG(m.position), 0.0) AS avg_position
            FROM latest_pass_a p
            JOIN gsc_query_metrics m ON m.gsc_run_id=p.id
            GROUP BY p.start_date
            ORDER BY p.start_date ASC
            """,
            (from_expr, to_expr),
        )
        gsc_daily = [dict(r) for r in await gsc_daily_cur.fetchall()]

        ai_daily_cur = await con.execute(
            """
            SELECT
              date(r.started_at) AS day,
              COALESCE(AVG(a.is_visible), 0.0) AS visibility_rate,
              COUNT(*) AS total_checks
            FROM ai_visibility_results a
            JOIN ai_visibility_runs r ON r.id=a.ai_run_id
            WHERE r.status='succeeded'
              AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            GROUP BY date(r.started_at)
            ORDER BY date(r.started_at) ASC
            """,
            (from_expr, to_expr),
        )
        ai_daily = [dict(r) for r in await ai_daily_cur.fetchall()]

        rank_buckets_cur = await con.execute(
            """
            WITH latest_serp AS (
              SELECT s.query_id, s.rank, r.started_at,
                     ROW_NUMBER() OVER (PARTITION BY s.query_id ORDER BY r.started_at DESC, r.id DESC) AS rn
              FROM serp_results s
              JOIN serp_runs r ON r.id=s.serp_run_id
              WHERE r.status='succeeded'
                AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            )
            SELECT
              SUM(CASE WHEN rank BETWEEN 1 AND 3 THEN 1 ELSE 0 END) AS top_3,
              SUM(CASE WHEN rank BETWEEN 4 AND 10 THEN 1 ELSE 0 END) AS top_10,
              SUM(CASE WHEN rank > 10 THEN 1 ELSE 0 END) AS beyond_10,
              SUM(CASE WHEN rank IS NULL THEN 1 ELSE 0 END) AS not_found
            FROM latest_serp
            WHERE rn=1
            """,
            (from_expr, to_expr),
        )
        rank_buckets = dict(await rank_buckets_cur.fetchone())

        top_moves_cur = await con.execute(
            """
            WITH serp_range AS (
              SELECT s.query_id, r.started_at, s.rank
              FROM serp_results s
              JOIN serp_runs r ON r.id=s.serp_run_id
              WHERE r.status='succeeded'
                AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            ),
            ranked AS (
              SELECT
                query_id,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at ASC) AS first_rank,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at DESC) AS last_rank
              FROM serp_range
            ),
            moves AS (
              SELECT DISTINCT
                q.id AS query_id,
                q.query_text,
                first_rank,
                last_rank,
                CASE
                  WHEN first_rank IS NULL OR last_rank IS NULL THEN NULL
                  ELSE first_rank - last_rank
                END AS delta
              FROM ranked r
              JOIN queries q ON q.id=r.query_id
              WHERE q.query_class='keyword'
            )
            SELECT * FROM moves
            WHERE delta IS NOT NULL
            ORDER BY delta DESC
            LIMIT 8
            """,
            (from_expr, to_expr),
        )
        top_gainers = [dict(r) for r in await top_moves_cur.fetchall()]

        top_losers_cur = await con.execute(
            """
            WITH serp_range AS (
              SELECT s.query_id, r.started_at, s.rank
              FROM serp_results s
              JOIN serp_runs r ON r.id=s.serp_run_id
              WHERE r.status='succeeded'
                AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            ),
            ranked AS (
              SELECT
                query_id,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at ASC) AS first_rank,
                FIRST_VALUE(rank) OVER (PARTITION BY query_id ORDER BY started_at DESC) AS last_rank
              FROM serp_range
            ),
            moves AS (
              SELECT DISTINCT
                q.id AS query_id,
                q.query_text,
                first_rank,
                last_rank,
                CASE
                  WHEN first_rank IS NULL OR last_rank IS NULL THEN NULL
                  ELSE first_rank - last_rank
                END AS delta
              FROM ranked r
              JOIN queries q ON q.id=r.query_id
              WHERE q.query_class='keyword'
            )
            SELECT * FROM moves
            WHERE delta IS NOT NULL
            ORDER BY delta ASC
            LIMIT 8
            """,
            (from_expr, to_expr),
        )
        top_losers = [dict(r) for r in await top_losers_cur.fetchall()]

        opportunities_cur = await con.execute(
            """
            WITH latest_pass_a AS (
              SELECT r.id
              FROM gsc_runs r
              JOIN (
                SELECT start_date, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date
              ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_a' AND r.status='succeeded'
            ),
            gsc_by_query AS (
              SELECT m.query_id, SUM(m.impressions) AS impressions, SUM(m.clicks) AS clicks
              FROM gsc_query_metrics m
              JOIN latest_pass_a p ON p.id=m.gsc_run_id
              GROUP BY m.query_id
            ),
            latest_serp AS (
              SELECT s.query_id, s.rank, ROW_NUMBER() OVER (PARTITION BY s.query_id ORDER BY r.started_at DESC, r.id DESC) AS rn
              FROM serp_results s
              JOIN serp_runs r ON r.id=s.serp_run_id
              WHERE r.status='succeeded'
                AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            )
            SELECT q.id AS query_id, q.query_text, g.impressions, g.clicks, ls.rank
            FROM gsc_by_query g
            JOIN queries q ON q.id=g.query_id
            LEFT JOIN latest_serp ls ON ls.query_id=g.query_id AND ls.rn=1
            WHERE q.query_class='keyword'
              AND (ls.rank IS NULL OR ls.rank > 10)
            ORDER BY g.impressions DESC, g.clicks DESC
            LIMIT 8
            """,
            (from_expr, to_expr, from_expr, to_expr),
        )
        opportunities = [dict(r) for r in await opportunities_cur.fetchall()]

        return {
            "range": {"from_day_ago": from_day_ago, "to_day_ago": to_day_ago},
            "kpis": {
                "total_impressions": gsc_totals["total_impressions"],
                "total_clicks": gsc_totals["total_clicks"],
                "ctr": gsc_totals["ctr"],
                "avg_position": gsc_totals["avg_position"],
                "ai_visibility_rate": ai_totals["ai_visibility_rate"],
                "tracked_keywords": tracked["tracked_keywords"],
                "gainers": gains.get("gainers") or 0,
                "losers": gains.get("losers") or 0,
            },
            "charts": {
                "gsc_daily": gsc_daily,
                "ai_daily": ai_daily,
                "rank_buckets": rank_buckets,
            },
            "insights": {
                "top_gainers": top_gainers,
                "top_losers": top_losers,
                "opportunities": opportunities,
            },
        }


@app.get("/api/queries/keyword-analytics")
async def keyword_analytics(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
    search: str | None = Query(default=None),
    source_type: str | None = Query(default=None),
    is_active: int | None = Query(default=None),
    seranking_status: str | None = Query(default=None),
    has_gsc_data: int | None = Query(default=None),
    volume_min: int | None = Query(default=None),
    volume_max: int | None = Query(default=None),
    difficulty_min: int | None = Query(default=None),
    difficulty_max: int | None = Query(default=None),
    priority_min: float | None = Query(default=None),
    priority_max: float | None = Query(default=None),
    sort_by: str = Query(default="priority_score"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    from_day_ago, to_day_ago = _normalize_day_range(from_day_ago, to_day_ago)
    has_gsc_data = _parse_bool_int(has_gsc_data)
    from_expr = f"-{from_day_ago} days"
    to_expr = f"-{to_day_ago} days"

    filters = ["q.query_class='keyword'"]
    params: list[Any] = [from_expr, to_expr, from_expr, to_expr]

    if search:
        filters.append("lower(q.query_text) LIKE ?")
        params.append(f"%{search.lower()}%")
    if source_type:
        filters.append("q.source_type=?")
        params.append(source_type)
    if is_active is not None:
        filters.append("q.is_active=?")
        params.append(is_active)
    if seranking_status:
        filters.append("q.seranking_status=?")
        params.append(seranking_status)
    if has_gsc_data is not None:
        if has_gsc_data == 1:
            filters.append("COALESCE(g.impressions, 0) > 0")
        else:
            filters.append("COALESCE(g.impressions, 0) = 0")
    if volume_min is not None:
        filters.append("COALESCE(s.volume, 0) >= ?")
        params.append(volume_min)
    if volume_max is not None:
        filters.append("COALESCE(s.volume, 0) <= ?")
        params.append(volume_max)
    if difficulty_min is not None:
        filters.append("COALESCE(s.difficulty, 0) >= ?")
        params.append(difficulty_min)
    if difficulty_max is not None:
        filters.append("COALESCE(s.difficulty, 0) <= ?")
        params.append(difficulty_max)
    if priority_min is not None:
        filters.append("COALESCE(p.priority_score, 0) >= ?")
        params.append(priority_min)
    if priority_max is not None:
        filters.append("COALESCE(p.priority_score, 0) <= ?")
        params.append(priority_max)

    where_sql = " AND ".join(filters)
    sort_sql = _sort_clause(
        sort_by,
        sort_dir,
        {
            "priority_score": "priority_score",
            "volume": "volume",
            "difficulty": "difficulty",
            "cpc": "cpc",
            "serp_rank": "serp_rank",
            "impressions": "impressions",
            "clicks": "clicks",
            "updated_at": "updated_at",
        },
        default="priority_score",
    )

    base_sql = f"""
    WITH latest_pass_a AS (
      SELECT r.id
      FROM gsc_runs r
      JOIN (
        SELECT start_date, MAX(started_at) AS max_started_at
        FROM gsc_runs
        WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
          AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
        GROUP BY start_date
      ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
      WHERE r.pass_type='pass_a' AND r.status='succeeded'
    ),
    gsc_by_query AS (
      SELECT m.query_id, SUM(m.impressions) AS impressions, SUM(m.clicks) AS clicks, AVG(m.position) AS avg_position
      FROM gsc_query_metrics m
      JOIN latest_pass_a p ON p.id=m.gsc_run_id
      GROUP BY m.query_id
    ),
    latest_serp AS (
      SELECT s.query_id, s.rank,
             ROW_NUMBER() OVER (PARTITION BY s.query_id ORDER BY r.started_at DESC, r.id DESC) AS rn
      FROM serp_results s
      JOIN serp_runs r ON r.id=s.serp_run_id
      WHERE r.status='succeeded'
        AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
    )
    SELECT
      q.id,
      q.query_text,
      q.query_class,
      q.source_type,
      q.is_active,
      q.seranking_status,
      q.priority_status,
      q.updated_at,
      s.volume,
      s.cpc,
      s.competition,
      s.difficulty,
      p.priority_score,
      p.priority_reason,
      COALESCE(g.impressions, 0) AS impressions,
      COALESCE(g.clicks, 0) AS clicks,
      COALESCE(g.avg_position, 0) AS avg_position,
      ls.rank AS serp_rank
    FROM queries q
    LEFT JOIN query_seranking_current s ON s.query_id=q.id
    LEFT JOIN query_priority_current p ON p.query_id=q.id
    LEFT JOIN gsc_by_query g ON g.query_id=q.id
    LEFT JOIN latest_serp ls ON ls.query_id=q.id AND ls.rn=1
    WHERE {where_sql}
    """

    async with connect(str(settings.db_path)) as con:
        count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM ({base_sql}) z", tuple(params))
        total = int((await count_cur.fetchone())["total"])
        list_cur = await con.execute(
            f"{base_sql} {sort_sql} LIMIT ? OFFSET ?",
            tuple([*params, limit, offset]),
        )
        items = [dict(r) for r in await list_cur.fetchall()]

        chart_cur = await con.execute(
            f"""
            SELECT
              SUM(CASE WHEN serp_rank BETWEEN 1 AND 3 THEN 1 ELSE 0 END) AS top_3,
              SUM(CASE WHEN serp_rank BETWEEN 4 AND 10 THEN 1 ELSE 0 END) AS top_10,
              SUM(CASE WHEN serp_rank > 10 THEN 1 ELSE 0 END) AS beyond_10,
              SUM(CASE WHEN serp_rank IS NULL THEN 1 ELSE 0 END) AS not_found
            FROM ({base_sql}) t
            """,
            tuple(params),
        )
        chart_summary = dict(await chart_cur.fetchone())

        return {"items": items, "total": total, "limit": limit, "offset": offset, "chart_summary": chart_summary}


@app.get("/api/queries/ai-analytics")
async def ai_analytics(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
    search: str | None = Query(default=None),
    source_type: str | None = Query(default=None),
    is_active: int | None = Query(default=None),
    visibility_state: str = Query(default="all"),
    volume_min: int | None = Query(default=None),
    volume_max: int | None = Query(default=None),
    priority_min: float | None = Query(default=None),
    priority_max: float | None = Query(default=None),
    sort_by: str = Query(default="visibility_rate"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    from_day_ago, to_day_ago = _normalize_day_range(from_day_ago, to_day_ago)
    from_expr = f"-{from_day_ago} days"
    to_expr = f"-{to_day_ago} days"

    filters = ["q.query_class='ai_visibility'"]
    params: list[Any] = [from_expr, to_expr]

    if search:
        filters.append("lower(q.query_text) LIKE ?")
        params.append(f"%{search.lower()}%")
    if source_type:
        filters.append("q.source_type=?")
        params.append(source_type)
    if is_active is not None:
        filters.append("q.is_active=?")
        params.append(is_active)
    if volume_min is not None:
        filters.append("COALESCE(s.volume, 0) >= ?")
        params.append(volume_min)
    if volume_max is not None:
        filters.append("COALESCE(s.volume, 0) <= ?")
        params.append(volume_max)
    if priority_min is not None:
        filters.append("COALESCE(p.priority_score, 0) >= ?")
        params.append(priority_min)
    if priority_max is not None:
        filters.append("COALESCE(p.priority_score, 0) <= ?")
        params.append(priority_max)
    if visibility_state == "visible":
        filters.append("COALESCE(a.visibility_rate, 0) > 0")
    elif visibility_state == "not_visible":
        filters.append("COALESCE(a.visibility_rate, 0) = 0")

    where_sql = " AND ".join(filters)
    sort_sql = _sort_clause(
        sort_by,
        sort_dir,
        {
            "visibility_rate": "visibility_rate",
            "volume": "volume",
            "priority_score": "priority_score",
            "updated_at": "updated_at",
        },
        default="visibility_rate",
    )

    base_sql = f"""
    WITH ai_by_query AS (
      SELECT a.query_id, AVG(a.is_visible) AS visibility_rate, COUNT(*) AS checks
      FROM ai_visibility_results a
      JOIN ai_visibility_runs r ON r.id=a.ai_run_id
      WHERE r.status='succeeded'
        AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
      GROUP BY a.query_id
    )
    SELECT
      q.id,
      q.query_text,
      q.query_class,
      q.source_type,
      q.is_active,
      q.updated_at,
      s.volume,
      p.priority_score,
      p.priority_reason,
      COALESCE(a.visibility_rate, 0) AS visibility_rate,
      COALESCE(a.checks, 0) AS checks
    FROM queries q
    LEFT JOIN query_seranking_current s ON s.query_id=q.id
    LEFT JOIN query_priority_current p ON p.query_id=q.id
    LEFT JOIN ai_by_query a ON a.query_id=q.id
    WHERE {where_sql}
    """

    async with connect(str(settings.db_path)) as con:
        count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM ({base_sql}) z", tuple(params))
        total = int((await count_cur.fetchone())["total"])
        list_cur = await con.execute(
            f"{base_sql} {sort_sql} LIMIT ? OFFSET ?",
            tuple([*params, limit, offset]),
        )
        items = [dict(r) for r in await list_cur.fetchall()]

        daily_cur = await con.execute(
            """
            SELECT
              date(r.started_at) AS day,
              AVG(a.is_visible) AS visibility_rate,
              COUNT(*) AS total_checks
            FROM ai_visibility_results a
            JOIN ai_visibility_runs r ON r.id=a.ai_run_id
            WHERE r.status='succeeded'
              AND date(r.started_at) BETWEEN date('now', ?) AND date('now', ?)
            GROUP BY date(r.started_at)
            ORDER BY day ASC
            """,
            (from_expr, to_expr),
        )
        chart_daily = [dict(r) for r in await daily_cur.fetchall()]

        return {"items": items, "total": total, "limit": limit, "offset": offset, "chart_daily": chart_daily}


async def _gsc_pass_analytics(
    *,
    pass_type: str,
    from_day_ago: int,
    to_day_ago: int,
    search: str | None,
    sort_by: str,
    sort_dir: str,
    limit: int,
    offset: int,
) -> dict[str, Any]:
    from_day_ago, to_day_ago = _normalize_day_range(from_day_ago, to_day_ago)
    from_expr = f"-{from_day_ago} days"
    to_expr = f"-{to_day_ago} days"

    async with connect(str(settings.db_path)) as con:
        if pass_type == "pass_a":
            filters: list[str] = []
            params: list[Any] = [from_expr, to_expr]
            if search:
                filters.append("lower(q.query_text) LIKE ?")
                params.append(f"%{search.lower()}%")
            where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
            sort_sql = _sort_clause(
                sort_by,
                sort_dir,
                {
                    "impressions": "impressions",
                    "clicks": "clicks",
                    "ctr": "ctr",
                    "position": "position",
                    "query_text": "query_text",
                },
                default="impressions",
            )
            base_sql = f"""
            WITH latest_runs AS (
              SELECT r.id, r.start_date
              FROM gsc_runs r
              JOIN (
                SELECT start_date, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date
              ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_a' AND r.status='succeeded'
            )
            SELECT
              q.id AS query_id,
              q.query_text,
              SUM(m.impressions) AS impressions,
              SUM(m.clicks) AS clicks,
              CASE WHEN SUM(m.impressions) > 0 THEN SUM(m.clicks) / SUM(m.impressions) ELSE 0 END AS ctr,
              AVG(m.position) AS position
            FROM latest_runs r
            JOIN gsc_query_metrics m ON m.gsc_run_id=r.id
            JOIN queries q ON q.id=m.query_id
            {where_sql}
            GROUP BY q.id, q.query_text
            """
            count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM ({base_sql}) z", tuple(params))
            total = int((await count_cur.fetchone())["total"])
            items_cur = await con.execute(f"{base_sql} {sort_sql} LIMIT ? OFFSET ?", tuple([*params, limit, offset]))
            items = [dict(r) for r in await items_cur.fetchall()]
            summary_cur = await con.execute(
                f"""
                SELECT
                  COUNT(*) AS rows_count,
                  COALESCE(SUM(impressions), 0) AS impressions,
                  COALESCE(SUM(clicks), 0) AS clicks,
                  CASE WHEN COALESCE(SUM(impressions), 0) > 0 THEN SUM(clicks) / SUM(impressions) ELSE 0 END AS ctr,
                  COALESCE(AVG(position), 0) AS position
                FROM ({base_sql}) t
                """,
                tuple(params),
            )
            summary = dict(await summary_cur.fetchone())
            trend_cur = await con.execute(
                """
                WITH latest_runs AS (
                  SELECT r.id, r.start_date
                  FROM gsc_runs r
                  JOIN (
                    SELECT start_date, MAX(started_at) AS max_started_at
                    FROM gsc_runs
                    WHERE pass_type='pass_a' AND status='succeeded' AND start_date=end_date
                      AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                    GROUP BY start_date
                  ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
                  WHERE r.pass_type='pass_a' AND r.status='succeeded'
                )
                SELECT r.start_date AS day, SUM(m.impressions) AS impressions, SUM(m.clicks) AS clicks, AVG(m.position) AS position
                FROM latest_runs r
                JOIN gsc_query_metrics m ON m.gsc_run_id=r.id
                GROUP BY r.start_date
                ORDER BY r.start_date ASC
                """,
                (from_expr, to_expr),
            )
            trend = [dict(r) for r in await trend_cur.fetchall()]
            return {"pass_type": pass_type, "items": items, "total": total, "limit": limit, "offset": offset, "summary": summary, "trend": trend}

        if pass_type == "pass_b":
            filters = []
            params = [from_expr, to_expr]
            if search:
                filters.append("lower(page_url) LIKE ?")
                params.append(f"%{search.lower()}%")
            where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
            sort_sql = _sort_clause(
                sort_by,
                sort_dir,
                {
                    "impressions": "impressions",
                    "clicks": "clicks",
                    "ctr": "ctr",
                    "position": "position",
                    "page_url": "page_url",
                },
                default="impressions",
            )
            base_sql = f"""
            WITH latest_runs AS (
              SELECT r.id, r.start_date
              FROM gsc_runs r
              JOIN (
                SELECT start_date, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_b' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date
              ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_b' AND r.status='succeeded'
            )
            SELECT
              m.page_url,
              SUM(m.impressions) AS impressions,
              SUM(m.clicks) AS clicks,
              CASE WHEN SUM(m.impressions) > 0 THEN SUM(m.clicks) / SUM(m.impressions) ELSE 0 END AS ctr,
              AVG(m.position) AS position
            FROM latest_runs r
            JOIN gsc_page_metrics m ON m.gsc_run_id=r.id
            {where_sql}
            GROUP BY m.page_url
            """
            count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM ({base_sql}) z", tuple(params))
            total = int((await count_cur.fetchone())["total"])
            items_cur = await con.execute(f"{base_sql} {sort_sql} LIMIT ? OFFSET ?", tuple([*params, limit, offset]))
            items = [dict(r) for r in await items_cur.fetchall()]
            summary_cur = await con.execute(
                f"""
                SELECT
                  COUNT(*) AS rows_count,
                  COALESCE(SUM(impressions), 0) AS impressions,
                  COALESCE(SUM(clicks), 0) AS clicks,
                  CASE WHEN COALESCE(SUM(impressions), 0) > 0 THEN SUM(clicks) / SUM(impressions) ELSE 0 END AS ctr,
                  COALESCE(AVG(position), 0) AS position
                FROM ({base_sql}) t
                """,
                tuple(params),
            )
            summary = dict(await summary_cur.fetchone())
            trend_cur = await con.execute(
                """
                WITH latest_runs AS (
                  SELECT r.id, r.start_date
                  FROM gsc_runs r
                  JOIN (
                    SELECT start_date, MAX(started_at) AS max_started_at
                    FROM gsc_runs
                    WHERE pass_type='pass_b' AND status='succeeded' AND start_date=end_date
                      AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                    GROUP BY start_date
                  ) x ON x.start_date=r.start_date AND x.max_started_at=r.started_at
                  WHERE r.pass_type='pass_b' AND r.status='succeeded'
                )
                SELECT r.start_date AS day, SUM(m.impressions) AS impressions, SUM(m.clicks) AS clicks, AVG(m.position) AS position
                FROM latest_runs r
                JOIN gsc_page_metrics m ON m.gsc_run_id=r.id
                GROUP BY r.start_date
                ORDER BY r.start_date ASC
                """,
                (from_expr, to_expr),
            )
            trend = [dict(r) for r in await trend_cur.fetchall()]
            return {"pass_type": pass_type, "items": items, "total": total, "limit": limit, "offset": offset, "summary": summary, "trend": trend}

        if pass_type == "pass_c":
            filters = []
            params = [from_expr, to_expr]
            if search:
                filters.append("(lower(m.page_url) LIKE ? OR lower(q.query_text) LIKE ?)")
                params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])
            where_sql = f"WHERE {' AND '.join(filters)}" if filters else ""
            sort_sql = _sort_clause(
                sort_by,
                sort_dir,
                {
                    "impressions": "impressions",
                    "clicks": "clicks",
                    "ctr": "ctr",
                    "position": "position",
                    "query_text": "query_text",
                    "page_url": "page_url",
                },
                default="impressions",
            )
            base_sql = f"""
            WITH latest_runs AS (
              SELECT r.id, r.start_date, r.page_url
              FROM gsc_runs r
              JOIN (
                SELECT start_date, page_url, MAX(started_at) AS max_started_at
                FROM gsc_runs
                WHERE pass_type='pass_c' AND status='succeeded' AND start_date=end_date
                  AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                GROUP BY start_date, page_url
              ) x ON x.start_date=r.start_date AND x.page_url=r.page_url AND x.max_started_at=r.started_at
              WHERE r.pass_type='pass_c' AND r.status='succeeded'
            )
            SELECT
              m.page_url,
              q.id AS query_id,
              q.query_text,
              SUM(m.impressions) AS impressions,
              SUM(m.clicks) AS clicks,
              CASE WHEN SUM(m.impressions) > 0 THEN SUM(m.clicks) / SUM(m.impressions) ELSE 0 END AS ctr,
              AVG(m.position) AS position
            FROM latest_runs r
            JOIN gsc_page_query_metrics m ON m.gsc_run_id=r.id
            JOIN queries q ON q.id=m.query_id
            {where_sql}
            GROUP BY m.page_url, q.id, q.query_text
            """
            count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM ({base_sql}) z", tuple(params))
            total = int((await count_cur.fetchone())["total"])
            items_cur = await con.execute(f"{base_sql} {sort_sql} LIMIT ? OFFSET ?", tuple([*params, limit, offset]))
            items = [dict(r) for r in await items_cur.fetchall()]
            summary_cur = await con.execute(
                f"""
                SELECT
                  COUNT(*) AS rows_count,
                  COALESCE(SUM(impressions), 0) AS impressions,
                  COALESCE(SUM(clicks), 0) AS clicks,
                  CASE WHEN COALESCE(SUM(impressions), 0) > 0 THEN SUM(clicks) / SUM(impressions) ELSE 0 END AS ctr,
                  COALESCE(AVG(position), 0) AS position
                FROM ({base_sql}) t
                """,
                tuple(params),
            )
            summary = dict(await summary_cur.fetchone())
            trend_cur = await con.execute(
                """
                WITH latest_runs AS (
                  SELECT r.id, r.start_date, r.page_url
                  FROM gsc_runs r
                  JOIN (
                    SELECT start_date, page_url, MAX(started_at) AS max_started_at
                    FROM gsc_runs
                    WHERE pass_type='pass_c' AND status='succeeded' AND start_date=end_date
                      AND date(start_date) BETWEEN date('now', ?) AND date('now', ?)
                    GROUP BY start_date, page_url
                  ) x ON x.start_date=r.start_date AND x.page_url=r.page_url AND x.max_started_at=r.started_at
                  WHERE r.pass_type='pass_c' AND r.status='succeeded'
                )
                SELECT r.start_date AS day, SUM(m.impressions) AS impressions, SUM(m.clicks) AS clicks, AVG(m.position) AS position
                FROM latest_runs r
                JOIN gsc_page_query_metrics m ON m.gsc_run_id=r.id
                GROUP BY r.start_date
                ORDER BY r.start_date ASC
                """,
                (from_expr, to_expr),
            )
            trend = [dict(r) for r in await trend_cur.fetchall()]
            return {"pass_type": pass_type, "items": items, "total": total, "limit": limit, "offset": offset, "summary": summary, "trend": trend}

    raise HTTPException(status_code=400, detail="Unsupported pass_type")


@app.get("/api/gsc/pass-a")
async def gsc_pass_a(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
    search: str | None = Query(default=None),
    sort_by: str = Query(default="impressions"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    return await _gsc_pass_analytics(
        pass_type="pass_a",
        from_day_ago=from_day_ago,
        to_day_ago=to_day_ago,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )


@app.get("/api/gsc/pass-b")
async def gsc_pass_b(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
    search: str | None = Query(default=None),
    sort_by: str = Query(default="impressions"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    return await _gsc_pass_analytics(
        pass_type="pass_b",
        from_day_ago=from_day_ago,
        to_day_ago=to_day_ago,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )


@app.get("/api/gsc/pass-c")
async def gsc_pass_c(
    from_day_ago: int = Query(default=60, ge=1, le=60),
    to_day_ago: int = Query(default=1, ge=1, le=60),
    search: str | None = Query(default=None),
    sort_by: str = Query(default="impressions"),
    sort_dir: str = Query(default="desc"),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    return await _gsc_pass_analytics(
        pass_type="pass_c",
        from_day_ago=from_day_ago,
        to_day_ago=to_day_ago,
        search=search,
        sort_by=sort_by,
        sort_dir=sort_dir,
        limit=limit,
        offset=offset,
    )


@app.get("/api/queries")
async def list_queries(
    query_class: str | None = Query(default=None),
    source_type: str | None = Query(default=None),
    is_active: int | None = Query(default=None),
    search: str | None = Query(default=None),
    limit: int = Query(default=50, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    sql = """
    SELECT
        q.id,
        q.query_text,
        q.query_class,
        q.source_type,
        q.is_active,
        q.seranking_status,
        q.priority_status,
        s.volume,
        s.cpc,
        s.competition,
        s.difficulty,
        p.priority_score,
        p.priority_reason
    FROM queries q
    LEFT JOIN query_seranking_current s ON s.query_id=q.id
    LEFT JOIN query_priority_current p ON p.query_id=q.id
    WHERE 1=1
    """
    params: list[Any] = []
    if query_class:
        sql += " AND q.query_class=?"
        params.append(query_class)
    if source_type:
        sql += " AND q.source_type=?"
        params.append(source_type)
    if is_active is not None:
        sql += " AND q.is_active=?"
        params.append(is_active)
    if search:
        sql += " AND lower(q.query_text) LIKE ?"
        params.append(f"%{search.lower()}%")
    sql += " ORDER BY q.id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])

    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(sql, tuple(params))
        items = [dict(r) for r in await cur.fetchall()]
        return {"items": items, "limit": limit, "offset": offset}


@app.get("/api/queries/{query_id}")
async def query_detail(query_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT
                q.*,
                s.volume, s.cpc, s.competition, s.difficulty, s.fetched_at,
                p.priority_score, p.priority_reason, p.prioritized_at
            FROM queries q
            LEFT JOIN query_seranking_current s ON s.query_id=q.id
            LEFT JOIN query_priority_current p ON p.query_id=q.id
            WHERE q.id=?
            """,
            (query_id,),
        )
        row = await cur.fetchone()
        if row is None:
            raise HTTPException(status_code=404, detail="query not found")

        serp_cur = await con.execute(
            """
            SELECT sr.rank, sr.url, sr.is_found, r.started_at
            FROM serp_results sr
            JOIN serp_runs r ON r.id=sr.serp_run_id
            WHERE sr.query_id=? AND r.status='succeeded'
            ORDER BY r.started_at DESC
            LIMIT 1
            """,
            (query_id,),
        )
        serp_latest = await serp_cur.fetchone()

        ai_cur = await con.execute(
            """
            SELECT ar.is_visible, ar.citation_urls_json, r.started_at
            FROM ai_visibility_results ar
            JOIN ai_visibility_runs r ON r.id=ar.ai_run_id
            WHERE ar.query_id=? AND r.status='succeeded'
            ORDER BY r.started_at DESC
            LIMIT 1
            """,
            (query_id,),
        )
        ai_latest = await ai_cur.fetchone()
        payload = dict(row)
        payload["latest_serp"] = dict(serp_latest) if serp_latest else None
        if ai_latest:
            ai = dict(ai_latest)
            ai["citation_urls"] = json.loads(ai.get("citation_urls_json") or "[]")
            payload["latest_ai_visibility"] = ai
        else:
            payload["latest_ai_visibility"] = None
        return payload


@app.patch("/api/queries/{query_id}")
async def update_query(query_id: int, body: dict[str, Any]) -> dict[str, Any]:
    allowed = {"is_active", "query_class"}
    fields = {k: v for k, v in body.items() if k in allowed}
    if not fields:
        raise HTTPException(status_code=400, detail="No updatable fields provided")
    sets = []
    params: list[Any] = []
    if "is_active" in fields:
        sets.append("is_active=?")
        params.append(1 if fields["is_active"] else 0)
    if "query_class" in fields:
        if fields["query_class"] not in {"keyword", "ai_visibility"}:
            raise HTTPException(status_code=400, detail="Invalid query_class")
        sets.append("query_class=?")
        params.append(fields["query_class"])
    sets.append("updated_at=datetime('now')")
    params.append(query_id)
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            f"UPDATE queries SET {', '.join(sets)} WHERE id=?",
            tuple(params),
        )
        await con.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=404, detail="query not found")
        c = await con.execute("SELECT * FROM queries WHERE id=?", (query_id,))
        row = await c.fetchone()
        return dict(row)


@app.get("/api/results/serp/latest")
async def latest_serp(limit: int = Query(default=200, ge=1, le=1000)) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        run_cur = await con.execute(
            "SELECT id, domain, started_at FROM serp_runs WHERE status='succeeded' ORDER BY started_at DESC LIMIT 1"
        )
        run_row = await run_cur.fetchone()
        if run_row is None:
            return {"run": None, "items": []}
        cur = await con.execute(
            """
            SELECT q.id AS query_id, q.query_text, sr.rank, sr.url, sr.is_found
            FROM serp_results sr
            JOIN queries q ON q.id=sr.query_id
            WHERE sr.serp_run_id=?
            ORDER BY sr.rank IS NULL, sr.rank ASC
            LIMIT ?
            """,
            (run_row["id"], limit),
        )
        items = [dict(r) for r in await cur.fetchall()]
        return {"run": dict(run_row), "items": items}


@app.get("/api/results/ai/latest")
async def latest_ai(limit: int = Query(default=200, ge=1, le=1000)) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        run_cur = await con.execute(
            "SELECT id, domain, started_at FROM ai_visibility_runs WHERE status='succeeded' ORDER BY started_at DESC LIMIT 1"
        )
        run_row = await run_cur.fetchone()
        if run_row is None:
            return {"run": None, "items": []}
        cur = await con.execute(
            """
            SELECT q.id AS query_id, q.query_text, ar.is_visible, ar.citation_urls_json
            FROM ai_visibility_results ar
            JOIN queries q ON q.id=ar.query_id
            WHERE ar.ai_run_id=?
            LIMIT ?
            """,
            (run_row["id"], limit),
        )
        items = []
        for r in await cur.fetchall():
            item = dict(r)
            item["citation_urls"] = json.loads(item.get("citation_urls_json") or "[]")
            items.append(item)
        return {"run": dict(run_row), "items": items}


@app.get("/api/results/gsc/latest")
async def latest_gsc(
    pass_type: str | None = Query(default=None, description="pass_a|pass_b|pass_c|inspect"),
    limit: int = Query(default=200, ge=1, le=1000),
) -> dict[str, Any]:
    valid_pass_types = {"pass_a", "pass_b", "pass_c", "inspect"}
    if pass_type is not None and pass_type not in valid_pass_types:
        raise HTTPException(status_code=400, detail="Invalid pass_type")

    async def fetch_for_pass(con, ptype: str) -> dict[str, Any]:
        run_cur = await con.execute(
            """
            SELECT r.id, r.property_id, p.site_url, r.pass_type, r.page_url, r.start_date, r.end_date, r.started_at
            FROM gsc_runs r
            JOIN gsc_properties p ON p.id=r.property_id
            WHERE r.status='succeeded' AND r.pass_type=?
            ORDER BY r.started_at DESC, r.id DESC
            LIMIT 1
            """,
            (ptype,),
        )
        run_row = await run_cur.fetchone()
        if run_row is None:
            return {"run": None, "items": []}

        run_id = int(run_row["id"])
        if ptype == "pass_a":
            cur = await con.execute(
                """
                SELECT q.id AS query_id, q.query_text, m.clicks, m.impressions, m.ctr, m.position
                FROM gsc_query_metrics m
                JOIN queries q ON q.id=m.query_id
                WHERE m.gsc_run_id=?
                ORDER BY m.impressions DESC, m.clicks DESC
                LIMIT ?
                """,
                (run_id, limit),
            )
            items = [dict(r) for r in await cur.fetchall()]
            return {"run": dict(run_row), "items": items}

        if ptype == "pass_b":
            cur = await con.execute(
                """
                SELECT page_url, clicks, impressions, ctr, position
                FROM gsc_page_metrics
                WHERE gsc_run_id=?
                ORDER BY impressions DESC, clicks DESC
                LIMIT ?
                """,
                (run_id, limit),
            )
            items = [dict(r) for r in await cur.fetchall()]
            return {"run": dict(run_row), "items": items}

        if ptype == "pass_c":
            cur = await con.execute(
                """
                SELECT m.page_url, q.id AS query_id, q.query_text, m.clicks, m.impressions, m.ctr, m.position
                FROM gsc_page_query_metrics m
                JOIN queries q ON q.id=m.query_id
                WHERE m.gsc_run_id=?
                ORDER BY m.impressions DESC, m.clicks DESC
                LIMIT ?
                """,
                (run_id, limit),
            )
            items = [dict(r) for r in await cur.fetchall()]
            return {"run": dict(run_row), "items": items}

        cur = await con.execute(
            """
            SELECT page_url, status, coverage_state, robots_txt_state, indexing_state, last_crawl_time, inspected_at
            FROM gsc_url_inspections
            WHERE gsc_run_id=?
            ORDER BY inspected_at DESC, id DESC
            LIMIT ?
            """,
            (run_id, limit),
        )
        items = [dict(r) for r in await cur.fetchall()]
        return {"run": dict(run_row), "items": items}

    async with connect(str(settings.db_path)) as con:
        if pass_type is not None:
            data = await fetch_for_pass(con, pass_type)
            return {"pass_type": pass_type, **data}

        results = {}
        for ptype in ["pass_a", "pass_b", "pass_c", "inspect"]:
            results[ptype] = await fetch_for_pass(con, ptype)
        return results


@app.get("/api/charts/serp/rank-trend")
async def serp_rank_trend(query_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT r.started_at, s.rank
            FROM serp_results s
            JOIN serp_runs r ON r.id=s.serp_run_id
            WHERE s.query_id=? AND r.status='succeeded'
            ORDER BY r.started_at ASC
            """,
            (query_id,),
        )
        points = [dict(r) for r in await cur.fetchall()]
        return {"query_id": query_id, "points": points}


@app.get("/api/charts/ai/visibility-trend")
async def ai_visibility_trend(query_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT r.started_at, a.is_visible
            FROM ai_visibility_results a
            JOIN ai_visibility_runs r ON r.id=a.ai_run_id
            WHERE a.query_id=? AND r.status='succeeded'
            ORDER BY r.started_at ASC
            """,
            (query_id,),
        )
        points = [dict(r) for r in await cur.fetchall()]
        return {"query_id": query_id, "points": points}


@app.get("/api/charts/gsc/query-trend")
async def gsc_query_trend(query_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT r.started_at, r.start_date, r.end_date, m.clicks, m.impressions, m.ctr, m.position
            FROM gsc_query_metrics m
            JOIN gsc_runs r ON r.id=m.gsc_run_id
            WHERE m.query_id=? AND r.status='succeeded'
            ORDER BY r.started_at ASC
            """,
            (query_id,),
        )
        points = [dict(r) for r in await cur.fetchall()]
        return {"query_id": query_id, "points": points}


@app.get("/api/jobs")
async def list_jobs(
    status: str | None = Query(default=None),
    job_type: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    sql = "SELECT * FROM jobs WHERE 1=1"
    params: list[Any] = []
    if status:
        sql += " AND status=?"
        params.append(status)
    if job_type:
        sql += " AND job_type=?"
        params.append(job_type)
    sql += " ORDER BY requested_at DESC, id DESC LIMIT ? OFFSET ?"
    params.extend([limit, offset])
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(sql, tuple(params))
        items = [dict(r) for r in await cur.fetchall()]
        return {"items": items, "limit": limit, "offset": offset}


@app.get("/api/jobs/{job_id}")
async def get_job(job_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute("SELECT * FROM jobs WHERE id=?", (job_id,))
        job = await cur.fetchone()
        if job is None:
            raise HTTPException(status_code=404, detail="job not found")
        s_cur = await con.execute("SELECT * FROM script_runs WHERE job_id=? ORDER BY id ASC", (job_id,))
        runs = [dict(r) for r in await s_cur.fetchall()]
        return {"job": dict(job), "script_runs": runs}


@app.post("/api/jobs/{job_id}/cancel")
async def cancel_job(job_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            "UPDATE jobs SET status='cancelled', finished_at=datetime('now'), error_text='cancelled by user' WHERE id=? AND status='queued'",
            (job_id,),
        )
        await con.commit()
        if cur.rowcount == 0:
            raise HTTPException(status_code=400, detail="Only queued jobs can be cancelled")
        return {"job_id": job_id, "status": "cancelled"}


@app.post("/api/jobs/gsc-sync")
async def enqueue_gsc_sync(body: dict[str, Any]) -> dict[str, Any]:
    site_url = body.get("site_url")
    window_days = body.get("window_days")
    if not site_url:
        raise HTTPException(status_code=400, detail="site_url is required")
    if window_days not in (1, 7, 30, 60):
        raise HTTPException(status_code=400, detail="window_days must be one of 1, 7, 30, 60")

    pass_a = body.get("pass_a") or {"mode": "top", "max_top_queries": 1000}
    pass_a_mode = pass_a.get("mode", "top")
    if pass_a_mode not in {"top", "all"}:
        raise HTTPException(status_code=400, detail="pass_a.mode must be 'top' or 'all'")
    if pass_a_mode == "top":
        max_top_queries = pass_a.get("max_top_queries")
        if not isinstance(max_top_queries, int) or max_top_queries < 1 or max_top_queries > 25000:
            raise HTTPException(status_code=400, detail="pass_a.max_top_queries must be an integer between 1 and 25000")

    pass_c = body.get("pass_c") or {"scope": "top_pages", "top_pages_limit": 100}
    pass_c_scope = pass_c.get("scope", "top_pages")
    if pass_c_scope not in {"none", "top_pages", "all_pages", "custom"}:
        raise HTTPException(status_code=400, detail="pass_c.scope must be one of none, top_pages, all_pages, custom")
    if pass_c_scope == "top_pages":
        top_pages_limit = pass_c.get("top_pages_limit")
        if not isinstance(top_pages_limit, int) or top_pages_limit < 1 or top_pages_limit > 1000:
            raise HTTPException(status_code=400, detail="pass_c.top_pages_limit must be an integer between 1 and 1000")
    if pass_c_scope == "custom":
        custom_pages = pass_c.get("custom_page_urls")
        if not isinstance(custom_pages, list) or not custom_pages:
            raise HTTPException(status_code=400, detail="pass_c.custom_page_urls must be a non-empty list when scope=custom")

    inspect = body.get("inspect") or {"enabled": True, "inspect_max_urls": 200, "custom_page_urls": []}
    inspect_enabled = inspect.get("enabled", True)
    if inspect_enabled:
        inspect_max_urls = inspect.get("inspect_max_urls")
        if not isinstance(inspect_max_urls, int) or inspect_max_urls < 1 or inspect_max_urls > 2000:
            raise HTTPException(status_code=400, detail="inspect.inspect_max_urls must be an integer between 1 and 2000")
        custom_inspect_pages = inspect.get("custom_page_urls")
        if custom_inspect_pages is not None and not isinstance(custom_inspect_pages, list):
            raise HTTPException(status_code=400, detail="inspect.custom_page_urls must be a list")

    target_key = f"gsc:{site_url}:window:{window_days}"
    job = await create_job("gsc_sync", body, requested_by=body.get("requested_by"), target_key=target_key)
    return job


@app.get("/api/jobs/{job_id}/gsc-progress")
async def get_gsc_progress(job_id: int) -> dict[str, Any]:
    async with connect(str(settings.db_path)) as con:
        job_cur = await con.execute("SELECT * FROM jobs WHERE id=?", (job_id,))
        job = await job_cur.fetchone()
        if job is None:
            raise HTTPException(status_code=404, detail="job not found")
        if job["job_type"] != "gsc_sync":
            raise HTTPException(status_code=400, detail="job is not gsc_sync")

        summary_cur = await con.execute(
            """
            SELECT
                COUNT(*) AS total_tasks,
                SUM(CASE WHEN status='queued' THEN 1 ELSE 0 END) AS queued_tasks,
                SUM(CASE WHEN status='running' THEN 1 ELSE 0 END) AS running_tasks,
                SUM(CASE WHEN status='succeeded' THEN 1 ELSE 0 END) AS succeeded_tasks,
                SUM(CASE WHEN status='failed' THEN 1 ELSE 0 END) AS failed_tasks,
                SUM(CASE WHEN status IN ('skipped_dedupe_24h','skipped_policy') THEN 1 ELSE 0 END) AS skipped_tasks
            FROM gsc_sync_tasks
            WHERE job_id=?
            """,
            (job_id,),
        )
        summary = dict(await summary_cur.fetchone())

        current_cur = await con.execute(
            """
            SELECT *
            FROM gsc_sync_tasks
            WHERE job_id=? AND status='running'
            ORDER BY started_at DESC, id DESC
            LIMIT 1
            """,
            (job_id,),
        )
        current_task = await current_cur.fetchone()

        tasks_cur = await con.execute(
            """
            SELECT *
            FROM gsc_sync_tasks
            WHERE job_id=?
            ORDER BY day ASC, pass_type ASC, page_url ASC, id ASC
            """,
            (job_id,),
        )
        tasks = [dict(r) for r in await tasks_cur.fetchall()]

        return {
            "job": dict(job),
            "summary": summary,
            "current_task": dict(current_task) if current_task else None,
            "tasks": tasks,
        }


@app.post("/api/jobs/seranking-enrich")
async def enqueue_seranking(body: dict[str, Any]) -> dict[str, Any]:
    job = await create_job("seranking_enrich", body, requested_by=body.get("requested_by"), target_key="seranking_enrich")
    return job


@app.post("/api/jobs/prioritize")
async def enqueue_prioritize(body: dict[str, Any]) -> dict[str, Any]:
    job = await create_job("prioritize", body, requested_by=body.get("requested_by"), target_key="prioritize")
    return job


@app.post("/api/jobs/serp-check")
async def enqueue_serp(body: dict[str, Any]) -> dict[str, Any]:
    domain = body.get("domain")
    if not domain:
        raise HTTPException(status_code=400, detail="domain is required")
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT id, started_at
            FROM serp_runs
            WHERE domain=? AND status='succeeded'
              AND datetime(started_at) >= datetime('now', '-24 hours')
            ORDER BY started_at DESC
            LIMIT 1
            """,
            (domain,),
        )
        recent = await cur.fetchone()
        if recent is not None:
            raise HTTPException(
                status_code=409,
                detail=f"SERP check already ran in the last 24h for domain '{domain}' (run id={recent['id']}, started_at={recent['started_at']})",
            )
    job = await create_job("serp_check", body, requested_by=body.get("requested_by"), target_key=f"serp:{domain}")
    return job


@app.post("/api/jobs/ai-visibility-check")
async def enqueue_ai_visibility(body: dict[str, Any]) -> dict[str, Any]:
    domain = body.get("domain")
    if not domain:
        raise HTTPException(status_code=400, detail="domain is required")
    async with connect(str(settings.db_path)) as con:
        cur = await con.execute(
            """
            SELECT id, started_at
            FROM ai_visibility_runs
            WHERE domain=? AND status='succeeded'
              AND datetime(started_at) >= datetime('now', '-24 hours')
            ORDER BY started_at DESC
            LIMIT 1
            """,
            (domain,),
        )
        recent = await cur.fetchone()
        if recent is not None:
            raise HTTPException(
                status_code=409,
                detail=f"AI visibility check already ran in the last 24h for domain '{domain}' (run id={recent['id']}, started_at={recent['started_at']})",
            )
    job = await create_job(
        "ai_visibility_check",
        body,
        requested_by=body.get("requested_by"),
        target_key=f"ai_visibility:{domain}",
    )
    return job


@app.post("/api/jobs/full-refresh")
async def enqueue_full_refresh(body: dict[str, Any]) -> dict[str, Any]:
    job = await create_job("full_refresh", body, requested_by=body.get("requested_by"), target_key="full_refresh")
    return job


@app.get("/api/content-actions")
async def list_content_actions(
    status: str | None = Query(default=None),
    action_type: str | None = Query(default=None),
    limit: int = Query(default=100, ge=1, le=500),
    offset: int = Query(default=0, ge=0),
) -> dict[str, Any]:
    filters: list[str] = []
    params: list[Any] = []
    if status is not None:
        filters.append("status=?")
        params.append(status)
    if action_type is not None:
        filters.append("action_type=?")
        params.append(action_type)

    where_clause = f"WHERE {' AND '.join(filters)}" if filters else ""

    async with connect(str(settings.db_path)) as con:
        count_cur = await con.execute(f"SELECT COUNT(*) AS total FROM content_actions {where_clause}", tuple(params))
        total = int((await count_cur.fetchone())["total"])

        query = f"SELECT * FROM content_actions {where_clause} ORDER BY priority_score DESC, created_at DESC LIMIT ? OFFSET ?"
        list_cur = await con.execute(query, tuple([*params, limit, offset]))
        items = [dict(r) for r in await list_cur.fetchall()]

        return {"items": items, "total": total, "limit": limit, "offset": offset}
