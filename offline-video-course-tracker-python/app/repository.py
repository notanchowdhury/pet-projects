"""Queries shared by the JSON API and the server-rendered pages."""

import base64
import re
import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from app.database import COURSE_STATS_SQL

VIDEO_EXTENSIONS = {".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"}


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def new_course_id() -> str:
    return f"course_{uuid.uuid4().hex}"


def title_from_filename(filename: str) -> str:
    return re.sub(r"[-_]", " ", Path(filename).stem)


def natural_key(text: str) -> list[Any]:
    """Sort key that orders "2 intro" before "10 outro"."""
    return [int(part) if part.isdigit() else part.lower() for part in re.split(r"(\d+)", text)]


def course_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    return dict(row)


def video_to_dict(row: sqlite3.Row) -> dict[str, Any]:
    video = dict(row)
    video["completed"] = bool(video["completed"])
    video["duration"] = video["duration"] or 0
    video["watchTime"] = video["watchTime"] or 0
    video["section"] = video["section"] or ""

    return video


def list_courses(db: sqlite3.Connection) -> list[dict[str, Any]]:
    rows = db.execute(COURSE_STATS_SQL.format(where="")).fetchall()

    return [course_to_dict(row) for row in rows]


def get_course(db: sqlite3.Connection, course_id: str) -> dict[str, Any] | None:
    row = db.execute(COURSE_STATS_SQL.format(where="WHERE c.id = ?"), (course_id,)).fetchone()

    return course_to_dict(row) if row else None


def list_videos(db: sqlite3.Connection, course_id: str) -> list[dict[str, Any]]:
    rows = db.execute("SELECT * FROM video_progress WHERE courseId = ?", (course_id,)).fetchall()
    videos = [video_to_dict(row) for row in rows]
    videos.sort(key=lambda v: (natural_key(v["section"]), natural_key(v["filename"])))

    return videos


def insert_course(db: sqlite3.Connection, course_id: str, name: str, path: str, course_type: str) -> None:
    timestamp = now_iso()
    db.execute(
        "INSERT INTO courses (id, name, path, type, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?)",
        (course_id, name, path, course_type, timestamp, timestamp),
    )


def insert_video(
    db: sqlite3.Connection,
    *,
    video_id: str,
    course_id: str,
    title: str,
    filename: str,
    filepath: str,
    section: str,
    blob_url: str | None = None,
) -> None:
    timestamp = now_iso()
    db.execute(
        """INSERT OR IGNORE INTO video_progress
           (id, courseId, title, filename, filepath, duration, section, completed, watchTime, notes, blobUrl,
            createdAt, updatedAt)
           VALUES (?, ?, ?, ?, ?, 0, ?, 0, 0, NULL, ?, ?, ?)""",
        (video_id, course_id, title, filename, filepath, section, blob_url, timestamp, timestamp),
    )


def scan_and_add_videos(db: sqlite3.Connection, course_id: str, course_path: Path) -> int:
    """Recursively add every video under ``course_path``; the parent folder name becomes the section."""
    added = 0

    for file in sorted(course_path.rglob("*")):
        if not file.is_file() or file.suffix.lower() not in VIDEO_EXTENSIONS:
            continue

        section = "" if file.parent == course_path else file.parent.name
        full_path = str(file)
        video_id = f"{course_id}_{base64.b64encode(full_path.encode()).decode()}"

        insert_video(
            db,
            video_id=video_id,
            course_id=course_id,
            title=title_from_filename(file.name),
            filename=file.name,
            filepath=full_path,
            section=section,
        )
        added += 1

    return added
