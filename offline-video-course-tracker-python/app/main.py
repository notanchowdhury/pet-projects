"""FastAPI application: server-rendered pages plus the JSON API."""

import argparse
import os
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app import repository
from app.api import router as api_router
from app.database import connect, init_database

BASE_DIR = Path(__file__).resolve().parent

templates = Jinja2Templates(directory=BASE_DIR / "templates")


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    init_database()
    yield


app = FastAPI(title="Video Course Tracker", lifespan=lifespan)
app.mount("/static", StaticFiles(directory=BASE_DIR / "static"), name="static")
app.include_router(api_router)


# The frontend reads errors from an `error` field, as the original API returned them.
@app.exception_handler(HTTPException)
async def http_exception_handler(_: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse({"error": exc.detail}, status_code=exc.status_code)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(_: Request, exc: RequestValidationError) -> JSONResponse:
    first = exc.errors()[0] if exc.errors() else {}
    field = ".".join(str(part) for part in first.get("loc", ())[1:])
    message = f"{field}: {first.get('msg', 'Invalid request')}" if field else first.get("msg", "Invalid request")

    return JSONResponse({"error": message}, status_code=400)


@app.get("/", response_class=HTMLResponse)
def courses_page(request: Request) -> HTMLResponse:
    with connect() as db:
        courses = repository.list_courses(db)

    return templates.TemplateResponse(request, "index.html", {"courses": courses})


@app.get("/course/{course_id}", response_class=HTMLResponse)
def course_page(request: Request, course_id: str) -> HTMLResponse:
    with connect() as db:
        course = repository.get_course(db, course_id)
        if course is None:
            return templates.TemplateResponse(request, "not_found.html", status_code=404)

        videos = repository.list_videos(db, course_id)

    return templates.TemplateResponse(request, "course.html", {"course": course, "videos": videos})


def run() -> None:
    import uvicorn

    parser = argparse.ArgumentParser(description="Video Course Tracker")
    parser.add_argument("--host", default=os.environ.get("HOST", "127.0.0.1"))
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", "8000")))
    parser.add_argument("--reload", action="store_true", help="Restart on code changes (development)")
    args = parser.parse_args()

    uvicorn.run("app.main:app", host=args.host, port=args.port, reload=args.reload)


if __name__ == "__main__":
    run()
