from __future__ import annotations

from contextlib import asynccontextmanager

import aiosqlite


@asynccontextmanager
async def connect(db_path: str):
    con = await aiosqlite.connect(db_path)
    con.row_factory = aiosqlite.Row
    await con.execute("PRAGMA foreign_keys = ON")
    try:
        yield con
    finally:
        await con.close()
