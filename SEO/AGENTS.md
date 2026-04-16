# SEO Agents Guide

## Scope

These instructions apply to everything under `SEO/`.

This directory contains the SEO automation system for ContHunt:

- `backend/`: FastAPI job API and worker loop
- `frontend/`: Next.js dashboard UI
- `scripts/`: standalone data collection and enrichment scripts
- `data/`: SQLite database and schema artifacts
- `docs/`: product, workflow, and domain context

Prefer the instructions in this file over broader repo guidance when working inside `SEO/`.

## Working Model

Most work in `SEO/` falls into one of these paths:

1. Dashboard UI work in `frontend/`
2. Job/API work in `backend/`
3. Data pipeline work in `scripts/`
4. Data inspection in `data/`

Before changing code, identify which layer owns the behavior. Avoid fixing a backend problem in the frontend or baking script-specific assumptions into the API unless that coupling is intentional.

## Environment

Use the existing virtualenv in `SEO/.venv` for Python work when possible.

Common setup:

```bash
cd /Users/nirmal/Desktop/conthunt-lp
source SEO/.venv/bin/activate
set -a; source SEO/.env; set +a
```

The dashboard job runner is usually executed from repo root:

```bash
python SEO/scripts/run_dashboard_jobs.py
```

Equivalent explicit command:

```bash
SEO/.venv/bin/python SEO/scripts/run_dashboard_jobs.py
```

## Backend Notes

- Backend entrypoint: `SEO/backend/app/main.py`
- Default API base used by the job runner: `http://localhost:8010/api`
- The runner will reuse an already-running backend or start one automatically with `uvicorn`
- Backend settings are defined in `SEO/backend/app/settings.py`

Important environment variables:

- `AUTOSEO_DB_PATH`
- `AUTOSEO_SCRIPTS_DIR`
- `AUTOSEO_SCHEMA_V2_PATH`
- `AUTOSEO_PYTHON_BIN`
- `AUTOSEO_WORKER_POLL_SECONDS`

When changing API contracts, also inspect the matching consumers in `frontend/src/lib/api.ts` and relevant dashboard components.

## Script Notes

Key scripts:

- `SEO/scripts/run_dashboard_jobs.py`: enqueue and monitor the daily dashboard jobs
- `SEO/scripts/gsc_fetch.py`: Google Search Console ingestion
- `SEO/scripts/check_rankings.py`: rank checking
- `SEO/scripts/prioritize_keywords.py`: keyword prioritization
- `SEO/scripts/get_keyword_data.py`: keyword refresh helper

Some scripts depend on secrets from `SEO/.env` and the service account file at `SEO/service_account_credentials.json`.

Do not hardcode new credentials in source files. Read them from environment variables or existing local secret files.

## Data Safety

- Primary local database: `SEO/data/keywords.db`
- Schema snapshot: `SEO/data/schema_dump.sql`

Treat `keywords.db` as a working data store, not disposable fixture data.

When inspecting the database, prefer read-only queries first. Example:

```bash
sqlite3 SEO/data/keywords.db "SELECT query_text, volume FROM query_seranking_current ORDER BY volume DESC LIMIT 10;"
```

Do not delete, rebuild, or overwrite the database unless the user explicitly asks for it.

## Frontend Notes

- App root: `SEO/frontend/src/app`
- Shared API client/types: `SEO/frontend/src/lib`
- Dashboard components: `SEO/frontend/src/components/dashboard`

Preserve the existing dashboard structure and component boundaries unless there is a clear simplification. If backend response shapes change, update the frontend types in the same pass.

## Change Guidelines

- Keep backend, frontend, and scripts loosely coupled
- Prefer small targeted fixes over broad refactors
- Preserve existing job names and API endpoints unless the user asked for breaking changes
- Add brief comments only when the logic is not obvious
- Validate assumptions against real code paths before editing

## Verification

Choose the narrowest useful verification for the layer you changed:

- Backend: run the relevant Python entrypoint or API path
- Scripts: run the script with constrained scope if possible
- Frontend: run lint or the relevant local UI check

If you cannot fully verify because external APIs or credentials are required, state that explicitly.
