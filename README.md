# Pet Projects

Small, self-contained projects I build to explore languages, frameworks and ideas. Each project lives in its own folder with its own README, build instructions and CI.

## Projects

| Project | Description | Stack |
| --- | --- | --- |
| [speedtest-dotnet](speedtest-dotnet/) | Self-hosted network speed test server (latency, download, upload) in a single executable. A port of a Go project to .NET. | C#, .NET 10, ASP.NET Core |
| [jobpilot-germany](jobpilot-germany/) | Tailors a résumé and cover letter to German job ads: translates the ad, extracts requirements, scores fit and tracks applications. Users bring their own Claude / OpenAI / Gemini API key. | Node.js, Express, Prisma, PostgreSQL / SQLite, Docker |
| [offline-video-course-tracker-python](offline-video-course-tracker-python/) | Track progress through video courses stored on disk or in the browser: resume playback, mark videos complete, keep notes. A port of a Next.js project to Python. | Python, FastAPI, Jinja2, SQLite |
| [german-a2-bootcamp](german-a2-bootcamp/) | German study app with a strict 30-day A2 plan: grammar lessons and quizzes, vocabulary drills, writing and speaking tasks, a mistake notebook, plus A1–B2 course vocabulary. | TypeScript, React, Vite, Tailwind CSS |

## Repository layout

```text
pet-projects/
├── .github/workflows/   # CI and release workflows, one set per project
└── <project>/           # Each project is independent
```

Workflows are scoped by path, so a change to one project only builds that project. Releases are tagged per project as `<project>/v<version>`.

## Author

**Notan Chowdhury**
