# speedtest-dotnet

A self-hosted network speed test server in a single executable. Run it on any machine, open the page in a browser, and measure **latency**, **download** and **upload** throughput between the two.

This is a .NET 10 port of my earlier Go implementation. It keeps the same command-line interface, HTTP API and web UI, so the two are drop-in replacements for each other.

## Features

- **Single file, no dependencies** – a trimmed, self-contained executable (~13 MB) with the web UI embedded
- **Latency, download and upload** measured from the browser, scaled from Kbps to Gbps
- **Low CPU cost** – download data comes from one 64 KB random buffer generated at startup and reused
- **No upload size limit** – Kestrel's default 30 MB request body limit is disabled, matching Go's `net/http`
- **Cross-platform** – Linux, macOS and Windows on x64 and arm64
- **Optional white-labelling** – `--no-branding` hides the "Get started" section

## Quick start

Requires the [.NET 10 SDK](https://dotnet.microsoft.com/download).

```bash
cd speedtest-dotnet
dotnet run -c Release
```

Open <http://localhost:8080> and start a test.

## Usage

```text
speedtest [--no-branding] [port]

  --no-branding  Hide the "Get started" section in the web UI
  port           Port to listen on (default: 8080)
  -h, --help     Show help
  -v, --version  Show version
```

```bash
speedtest                  # listen on :8080
speedtest 3000             # listen on :3000
speedtest --no-branding    # hide install instructions
```

The server listens on all network interfaces, so other devices on your network can reach it at `http://<host-ip>:<port>`.

## HTTP API

| Method | Path | Description | Response |
| --- | --- | --- | --- |
| `GET` | `/api/ping` | Latency probe | `{"time": <unix ms>}` |
| `GET` | `/api/download?size=<bytes>` | Streams random bytes. `size` defaults to 25 MB; values outside 1 B – 100 MB fall back to the default | `application/octet-stream` |
| `POST` | `/api/upload` | Reads and discards the request body. Any other method returns `405` | `{"bytes": <n>, "elapsed": <seconds>}` |
| `*` | any other path | Web UI | `text/html` |

`/api/ping` and `/api/download` send `Cache-Control: no-store`.

## Building a release binary

```bash
# Pick a runtime identifier: linux-x64, linux-arm64, osx-x64, osx-arm64, win-x64, win-arm64
dotnet publish -c Release -r linux-x64 -o dist
./dist/speedtest
```

Publishing produces a trimmed, compressed, self-contained single file. No .NET runtime is needed on the target machine.

## Docker

```bash
dotnet publish -c Release -r linux-x64 -o dist
cp dist/speedtest speedtest-linux-amd64
docker build --build-arg TARGETARCH=amd64 -t speedtest-dotnet .
docker run --rm -p 8080:8080 speedtest-dotnet
```

The image is based on `mcr.microsoft.com/dotnet/runtime-deps:10.0-noble-chiseled`. Unlike a static Go binary, a .NET executable needs libc, so `FROM scratch` is not an option.

## Project structure

```text
speedtest-dotnet/
├── Program.cs          # Argument parsing, Kestrel setup and all endpoints
├── Speedtest.csproj    # Single-file, self-contained, trimmed publish settings
├── TrimmerRoots.xml    # Keeps a type the trimmer wrongly removes (see below)
├── Dockerfile          # Runtime image for the published Linux binary
└── web/
    └── index.html      # Web UI, embedded as a resource at build time
```

## Implementation notes

| Go original | .NET port |
| --- | --- |
| `//go:embed web/*` | `<EmbeddedResource>` with a logical name of `web/index.html` |
| `http.ServeMux` with a `/` catch-all | Minimal API endpoints plus a lowest-precedence `{**path}` route |
| `crypto/rand` buffer filled in `init()` | `RandomNumberGenerator.GetBytes(65536)` at startup |
| `io.Copy(io.Discard, r.Body)` | Read loop into a 64 KB buffer, counting bytes |
| Static binary via `CGO_ENABLED=0` | `PublishSingleFile` + `SelfContained` + `PublishTrimmed` |

**Trimming workaround:** with full trimming, ILLink removes `X509Certificate2Collection.GetEnumerator`, and Kestrel fails at startup with a `TypeLoadException`. `TrimmerRoots.xml` keeps that type. Removing the file brings the crash back.

## Releases

Releases are built by [`.github/workflows/speedtest-dotnet-release.yml`](../.github/workflows/speedtest-dotnet-release.yml) when a tag matching `speedtest-dotnet/v*` is pushed:

```bash
git tag speedtest-dotnet/v0.1.0
git push origin speedtest-dotnet/v0.1.0
```

The workflow publishes binaries for six platforms, adds a SHA-256 checksum file and pushes a multi-arch image to GHCR.
