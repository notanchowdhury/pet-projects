# Self-contained single-file binaries need libc, so use the minimal chiseled runtime-deps image instead of scratch.
FROM mcr.microsoft.com/dotnet/runtime-deps:10.0-noble-chiseled

ARG TARGETARCH

COPY speedtest-linux-${TARGETARCH} /speedtest

ENTRYPOINT ["/speedtest"]
