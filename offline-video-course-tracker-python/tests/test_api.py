from pathlib import Path

from fastapi.testclient import TestClient


def create_server_course(client: TestClient, course_dir: Path, name: str = "Docker") -> str:
    response = client.post("/api/courses", json={"name": name, "path": str(course_dir), "type": "server"})
    assert response.status_code == 200, response.text

    return response.json()["courseId"]


def test_server_course_scans_videos_into_sections(client: TestClient, course_dir: Path) -> None:
    course_id = create_server_course(client, course_dir)

    videos = client.get(f"/api/courses/{course_id}/videos").json()

    assert [(v["section"], v["title"]) for v in videos] == [
        ("", "welcome"),
        ("01 Basics", "2 images"),
        ("01 Basics", "10 containers"),
        ("02 Advanced", "networking"),
    ]
    assert all(v["completed"] is False and v["watchTime"] == 0 for v in videos)


def test_course_stats_follow_progress(client: TestClient, course_dir: Path) -> None:
    course_id = create_server_course(client, course_dir)
    videos = client.get(f"/api/courses/{course_id}/videos").json()

    client.post("/api/progress", json={"videoId": videos[0]["id"], "completed": True})

    course = client.get(f"/api/courses/{course_id}").json()
    assert (course["totalVideos"], course["completedVideos"], course["completionPercentage"]) == (4, 1, 25)
    assert client.get("/api/courses").json()[0]["id"] == course_id


def test_progress_updates_only_sent_fields(client: TestClient, course_dir: Path) -> None:
    course_id = create_server_course(client, course_dir)
    video_id = client.get(f"/api/courses/{course_id}/videos").json()[0]["id"]

    client.post("/api/progress", json={"videoId": video_id, "notes": "remember this", "duration": 120})
    client.post("/api/progress", json={"videoId": video_id, "watchTime": 42})

    video = client.get(f"/api/courses/{course_id}/videos").json()[0]
    assert (video["notes"], video["duration"], video["watchTime"], video["completed"]) == (
        "remember this", 120, 42, False
    )


def test_progress_for_unknown_video_is_404(client: TestClient) -> None:
    response = client.post("/api/progress", json={"videoId": "nope", "watchTime": 1})

    assert response.status_code == 404
    assert response.json() == {"error": "Video not found"}


def test_create_course_validation(client: TestClient, tmp_path: Path) -> None:
    missing = client.post("/api/courses", json={"name": "X", "path": str(tmp_path / "missing"), "type": "server"})
    blank = client.post("/api/courses", json={"name": "  ", "path": str(tmp_path), "type": "server"})
    no_data = client.post("/api/courses", json={"name": "X", "type": "client"})

    assert (missing.status_code, missing.json()["error"]) == (400, "Directory does not exist")
    assert (blank.status_code, blank.json()["error"]) == (400, "Course name is required")
    assert no_data.status_code == 400


def test_client_course_stores_metadata_only(client: TestClient) -> None:
    body = {
        "name": "Local",
        "type": "client",
        "courseData": {"videos": [{"id": "client_a", "title": "intro", "filename": "intro.mp4", "section": "S1"}]},
    }
    course_id = client.post("/api/courses", json=body).json()["courseId"]

    assert client.get(f"/api/courses/{course_id}").json()["path"] == "client://local"
    assert client.get("/api/video/client_a").json() == {"type": "client", "blobUrl": "true"}


def test_rename_and_delete_course_cascades(client: TestClient, course_dir: Path) -> None:
    course_id = create_server_course(client, course_dir)
    video_id = client.get(f"/api/courses/{course_id}/videos").json()[0]["id"]

    assert client.patch(f"/api/courses/{course_id}", json={"name": "Renamed"}).status_code == 200
    assert client.get(f"/api/courses/{course_id}").json()["name"] == "Renamed"

    client.delete(f"/api/courses/{course_id}")

    assert client.get(f"/api/courses/{course_id}").status_code == 404
    assert client.get(f"/api/video/{video_id}").status_code == 404
    assert client.patch(f"/api/courses/{course_id}", json={"name": "Gone"}).status_code == 404


def test_video_streaming_supports_range_requests(client: TestClient, course_dir: Path) -> None:
    course_id = create_server_course(client, course_dir)
    welcome = client.get(f"/api/courses/{course_id}/videos").json()[0]

    full = client.get(f"/api/video/{welcome['id']}")
    partial = client.get(f"/api/video/{welcome['id']}", headers={"Range": "bytes=2-5"})

    assert full.status_code == 200
    assert full.headers["content-type"] == "video/mp4"
    assert full.content == b"0123456789"
    assert partial.status_code == 206
    assert partial.content == b"2345"


def test_pages_render(client: TestClient, course_dir: Path) -> None:
    assert "No courses yet" in client.get("/").text

    course_id = create_server_course(client, course_dir, name="Docker <Fundamentals>")

    assert "Docker &lt;Fundamentals&gt;" in client.get("/").text
    course_page = client.get(f"/course/{course_id}")
    assert course_page.status_code == 200
    assert "Docker &lt;Fundamentals&gt; - Video Course Tracker" in course_page.text
    assert client.get("/course/missing").status_code == 404
