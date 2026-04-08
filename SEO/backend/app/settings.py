from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    app_name: str
    db_path: Path
    scripts_dir: Path
    schema_path: Path
    python_bin: str
    worker_poll_seconds: float


def get_settings() -> Settings:
    repo_root = Path(__file__).resolve().parents[2]
    db_path = Path(os.getenv("AUTOSEO_DB_PATH", str(repo_root / "data" / "keywords.db"))).resolve()
    scripts_dir = Path(os.getenv("AUTOSEO_SCRIPTS_DIR", str(repo_root / "scripts"))).resolve()
    schema_path = Path(os.getenv("AUTOSEO_SCHEMA_V2_PATH", str(repo_root / "data" / "schema_v2.sql"))).resolve()
    return Settings(
        app_name="autoseo-backend",
        db_path=db_path,
        scripts_dir=scripts_dir,
        schema_path=schema_path,
        python_bin=os.getenv("AUTOSEO_PYTHON_BIN", "python"),
        worker_poll_seconds=float(os.getenv("AUTOSEO_WORKER_POLL_SECONDS", "1.0")),
    )
