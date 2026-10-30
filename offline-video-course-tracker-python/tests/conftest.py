from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app import database
from app.main import app


@pytest.fixture
def client(tmp_path: Path, monkeypatch: pytest.MonkeyPatch) -> Iterator[TestClient]:
    monkeypatch.setattr(database, "DATABASE_PATH", tmp_path / "test.db")

    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def course_dir(tmp_path: Path) -> Path:
    """A course folder with a root video, two sections and a non-video file."""
    root = tmp_path / "Docker Course"
    (root / "01 Basics").mkdir(parents=True)
    (root / "02 Advanced").mkdir()

    (root / "welcome.mp4").write_bytes(b"0123456789")
    (root / "01 Basics" / "10_containers.mp4").write_bytes(b"x")
    (root / "01 Basics" / "2-images.webm").write_bytes(b"x")
    (root / "02 Advanced" / "networking.mkv").write_bytes(b"x")
    (root / "02 Advanced" / "slides.pdf").write_bytes(b"x")

    return root
