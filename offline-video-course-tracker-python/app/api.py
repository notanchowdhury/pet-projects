"""JSON API, kept wire-compatible with the original Next.js routes."""

import mimetypes
import sqlite3
from pathlib import Path
from typing import Annotated, Any, Literal

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel, Field

from app import repository
from app.database import get_db

router = APIRouter(prefix="/api")

Db = Annotated[sqlite3.Connection, Depends(get_db)]

CONTENT_TYPES = {
    ".mp4": "video/mp4",
    ".webm": "video/webm",
    ".ogg": "video/ogg",
    ".mov": "video/quicktime",
    ".avi": "video/x-msvideo",
    ".mkv": "video/x-matroska",
}


class ClientVideo(BaseModel):
    id: str = Field(min_length=1)
    title: str
    filename: str
    section: str = ""


class ClientCourseData(BaseModel):
    videos: list[ClientVideo] = Field(min_length=1)


class CreateCourse(BaseModel):
    name: str
    path: str | None = None
    type: Literal["server", "client"] = "server"
    courseData: ClientCourseData | None = None


class UpdateCourse(BaseModel):
    name: str


class ProgressUpdate(BaseModel):
    videoId: str
    completed: bool | None = None
    watchTime: int | None = Field(default=None, ge=0)
    duration: int | None = Field(default=None, ge=0)
    # Distinguish "not sent" from an explicit null, which clears the notes.
    notes: str | None = Field(default=None)


def bad_request(message: str) -> HTTPException:
    return HTTPException(status_code=400, detail=message)


@router.get("/courses")
def list_courses(db: Db) -> list[dict[str, Any]]:
    return repository.list_courses(db)


@router.post("/courses")
def create_course(body: CreateCourse, db: Db) -> dict[str, Any]:
    name = body.name.strip()
    if not name:
        raise bad_request("Course name is required")

    course_id = repository.new_course_id()

    if body.type == "server":
        if not body.path or not body.path.strip():
            raise bad_request("Course path is required for server courses")

        course_path = Path(body.path.strip()).expanduser()
        if not course_path.is_dir():
            raise bad_request("Directory does not exist")

        repository.insert_course(db, course_id, name, str(course_path), "server")
        repository.scan_and_add_videos(db, course_id, course_path)
    else:
        if body.courseData is None:
            raise bad_request("Course data is required for client courses")

        # Local files stay in the browser's IndexedDB; only metadata is stored here.
        repository.insert_course(db, course_id, name, "client://local", "client")
        for video in body.courseData.videos:
            repository.insert_video(
                db,
                video_id=video.id,
                course_id=course_id,
                title=video.title,
                filename=video.filename,
                filepath="client://local",
                section=video.section,
                blob_url="true",
            )

    return {"success": True, "courseId": course_id}


@router.get("/courses/{course_id}")
def get_course(course_id: str, db: Db) -> dict[str, Any]:
    course = repository.get_course(db, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")

    return course


@router.patch("/courses/{course_id}")
def update_course(course_id: str, body: UpdateCourse, db: Db) -> dict[str, Any]:
    name = body.name.strip()
    if not name:
        raise bad_request("Course name is required")

    cursor = db.execute(
        "UPDATE courses SET name = ?, updatedAt = ? WHERE id = ?", (name, repository.now_iso(), course_id)
    )
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Course not found")

    return {"success": True}


@router.delete("/courses/{course_id}")
def delete_course(course_id: str, db: Db) -> dict[str, Any]:
    # video_progress rows go with it through ON DELETE CASCADE.
    db.execute("DELETE FROM courses WHERE id = ?", (course_id,))

    return {"success": True}


@router.get("/courses/{course_id}/videos")
def list_course_videos(course_id: str, db: Db) -> list[dict[str, Any]]:
    return repository.list_videos(db, course_id)


@router.post("/progress")
def update_progress(body: ProgressUpdate, db: Db) -> dict[str, Any]:
    updates: list[str] = []
    values: list[Any] = []

    if body.completed is not None:
        updates.append("completed = ?")
        values.append(1 if body.completed else 0)

    if body.watchTime is not None:
        updates.append("watchTime = ?")
        values.append(body.watchTime)

    if "notes" in body.model_fields_set:
        updates.append("notes = ?")
        values.append(body.notes)

    if body.duration is not None:
        updates.append("duration = ?")
        values.append(body.duration)

    updates.append("updatedAt = ?")
    values.append(repository.now_iso())
    values.append(body.videoId)

    cursor = db.execute(f"UPDATE video_progress SET {', '.join(updates)} WHERE id = ?", values)
    if cursor.rowcount == 0:
        raise HTTPException(status_code=404, detail="Video not found")

    return {"success": True}


@router.get("/video/{video_id}", response_model=None)
def serve_video(video_id: str, db: Db) -> FileResponse | JSONResponse:
    row = db.execute(
        """SELECT vp.filename, vp.filepath, vp.blobUrl, c.type
           FROM video_progress vp JOIN courses c ON c.id = vp.courseId
           WHERE vp.id = ?""",
        (video_id,),
    ).fetchone()

    if row is None:
        raise HTTPException(status_code=404, detail="Video not found")

    if row["type"] == "client":
        # The file itself lives in the browser's IndexedDB under the same id.
        return JSONResponse({"type": "client", "blobUrl": row["blobUrl"] or row["filepath"]})

    filepath = Path(row["filepath"])
    if not filepath.is_file():
        raise HTTPException(status_code=404, detail="Video file not found")

    suffix = filepath.suffix.lower()
    media_type = CONTENT_TYPES.get(suffix) or mimetypes.guess_type(filepath.name)[0] or "video/mp4"

    # FileResponse streams the file and honours Range requests, so seeking works.
    return FileResponse(filepath, media_type=media_type, content_disposition_type="inline")
