# AutoSEO Backend

Run locally (from repository root):

```bash
conda activate seo
pip install -r autoseo/backend/requirements.txt
uvicorn autoseo.backend.app.main:app --reload --port 8001
```

The API uses `autoseo/data/keywords.db` by default.

Optional env vars:

- `AUTOSEO_DB_PATH`
- `AUTOSEO_SCRIPTS_DIR`
- `AUTOSEO_SCHEMA_V2_PATH`
- `AUTOSEO_PYTHON_BIN`
- `AUTOSEO_WORKER_POLL_SECONDS`
