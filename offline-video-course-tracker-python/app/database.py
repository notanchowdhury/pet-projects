"""SQLite storage for courses and per-video progress.

The schema matches the original Next.js app, so an existing ``data/video_progress.db``
can be reused as-is.
"""

import os
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

DATABASE_PATH = Path(os.environ.get("DATABASE_PATH", Path.cwd() / "data" / "video_progress.db"))

# Maximum time (s) a statement waits for a lock held by another connection before failing.
BUSY_TIMEOUT_S = 5.0

SCHEMA_SQL = """
  CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    path TEXT NOT NULL,
    type TEXT DEFAULT 'server',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS video_progress (
    id TEXT PRIMARY KEY,
    courseId TEXT NOT NULL,
    title TEXT NOT NULL,
    filename TEXT NOT NULL,
    filepath TEXT NOT NULL,
    duration INTEGER DEFAULT 0,
    section TEXT DEFAULT '',
    completed BOOLEAN DEFAULT FALSE,
    watchTime INTEGER DEFAULT 0,
    notes TEXT,
    blobUrl TEXT,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_video_progress_course ON video_progress(courseId);
  CREATE INDEX IF NOT EXISTS idx_video_progress_section ON video_progress(section);
  CREATE INDEX IF NOT EXISTS idx_video_progress_completed ON video_progress(completed);
  CREATE INDEX IF NOT EXISTS idx_courses_type ON courses(type);
"""

# Courses with their aggregated progress; append a WHERE clause before GROUP BY via format().
COURSE_STATS_SQL = """
  SELECT
    c.*,
    COUNT(vp.id) AS totalVideos,
    COUNT(CASE WHEN vp.completed = 1 THEN 1 END) AS completedVideos,
    CASE
      WHEN COUNT(vp.id) = 0 THEN 0
      ELSE CAST(ROUND((COUNT(CASE WHEN vp.completed = 1 THEN 1 END) * 100.0) / COUNT(vp.id)) AS INTEGER)
    END AS completionPercentage
  FROM courses c
  LEFT JOIN video_progress vp ON c.id = vp.courseId
  {where}
  GROUP BY c.id
  ORDER BY c.createdAt DESC
"""


def init_database() -> None:
    DATABASE_PATH.parent.mkdir(parents=True, exist_ok=True)

    with connect() as connection:
        # WAL lets readers proceed while a write is in progress (e.g. frequent progress updates).
        connection.execute("PRAGMA journal_mode = WAL")
        connection.executescript(SCHEMA_SQL)


@contextmanager
def connect() -> Iterator[sqlite3.Connection]:
    """Open a short-lived connection; commits on success and rolls back on error."""
    connection = sqlite3.connect(DATABASE_PATH, timeout=BUSY_TIMEOUT_S)
    connection.row_factory = sqlite3.Row

    # Enforce the ON DELETE CASCADE relationship between courses and video_progress.
    connection.execute("PRAGMA foreign_keys = ON")

    try:
        with connection:
            yield connection
    finally:
        connection.close()


def get_db() -> Iterator[sqlite3.Connection]:
    """FastAPI dependency yielding one connection per request."""
    with connect() as connection:
        yield connection
