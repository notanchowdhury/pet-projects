# Pet Projects

Small, self-contained projects I build to explore languages, frameworks and ideas. Each project lives in its own folder with its own README, build instructions and CI.

## Projects

| Project | Description | Stack |
| --- | --- | --- |
| [speedtest-dotnet](speedtest-dotnet/) | Self-hosted network speed test server (latency, download, upload) in a single executable. A port of a Go project to .NET. | C#, .NET 10, ASP.NET Core |
| [jobpilot-germany](jobpilot-germany/) | Tailors a résumé and cover letter to German job ads: translates the ad, extracts requirements, scores fit and tracks applications. Users bring their own Claude / OpenAI / Gemini API key. | Node.js, Express, Prisma, PostgreSQL / SQLite, Docker |

## Repository layout

```text
pet-projects/
├── .github/workflows/   # CI and release workflows, one set per project
└── <project>/           # Each project is independent
```

Workflows are scoped by path, so a change to one project only builds that project. Releases are tagged per project as `<project>/v<version>`.

## Author

**Notan Chowdhury**
