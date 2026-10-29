using System.Diagnostics;
using System.Globalization;
using System.Security.Cryptography;

// Pre-generated random buffer — filled once at startup, reused for all downloads.
// Avoids per-request RNG overhead that pins CPU at 100%.
byte[] downloadBuf = RandomNumberGenerator.GetBytes(65536);

int port = 8080;
bool noBranding = false;

const string usage = "Usage: speedtest [--no-branding] [port]";

// Simple arg parsing: speedtest [--no-branding] [port]
foreach (var arg in args)
{
    switch (arg)
    {
        case "-h" or "--help" or "help":
            Console.Error.Write($"{usage}\n\n  --no-branding  Hide the \"Get started\" section in the web UI\n  port           Port to listen on (default: 8080)\n\nExamples:\n  speedtest                # listen on :8080\n  speedtest 3000           # listen on :3000\n  speedtest --no-branding  # hide install instructions\n");
            return 0;
        case "-v" or "--version" or "version":
            Console.WriteLine("speedtest v0.1.0");
            return 0;
        case "--no-branding":
            noBranding = true;
            break;
        default:
            if (!int.TryParse(arg, NumberStyles.None, CultureInfo.InvariantCulture, out var p) || p < 1 || p > 65535)
            {
                Console.Error.Write($"Error: invalid port \"{arg}\"\n\n{usage}\n");
                return 1;
            }
            port = p;
            break;
    }
}

// Prepare HTML (strip branding section if requested)
byte[] htmlData = ReadEmbedded("web/index.html");
if (noBranding)
{
    htmlData = StripInstallSection(htmlData);
}

var builder = WebApplication.CreateSlimBuilder();
builder.Logging.ClearProviders();
builder.WebHost.ConfigureKestrel(o =>
{
    o.ListenAnyIP(port);
    o.AddServerHeader = false;
    o.Limits.MaxRequestBodySize = null; // uploads are unbounded, like Go's net/http
});

var app = builder.Build();

// Download endpoint - streams random data for speed measurement
app.MapGet("/api/download", async (HttpContext ctx) =>
{
    int size = 25 * 1024 * 1024;
    var sizeStr = ctx.Request.Query["size"].ToString();
    if (sizeStr != "" && int.TryParse(sizeStr, out var s) && s > 0 && s <= 100 * 1024 * 1024)
    {
        size = s;
    }

    var res = ctx.Response;
    res.ContentType = "application/octet-stream";
    res.ContentLength = size;
    res.Headers.CacheControl = "no-store";

    // Reuse pre-generated buffer — no per-request randomness needed
    int remaining = size;
    try
    {
        while (remaining > 0)
        {
            int n = Math.Min(downloadBuf.Length, remaining);
            await res.Body.WriteAsync(downloadBuf.AsMemory(0, n), ctx.RequestAborted);
            remaining -= n;
        }
    }
    catch (OperationCanceledException)
    {
        // client disconnected
    }
});

// Upload endpoint - consumes posted data
app.Map("/api/upload", async (HttpContext ctx) =>
{
    if (!HttpMethods.IsPost(ctx.Request.Method))
    {
        ctx.Response.StatusCode = StatusCodes.Status405MethodNotAllowed;
        ctx.Response.ContentType = "text/plain; charset=utf-8";
        await ctx.Response.WriteAsync("method not allowed\n");
        return;
    }

    var sw = Stopwatch.StartNew();
    long n = 0;
    var buf = new byte[65536];
    try
    {
        int read;
        while ((read = await ctx.Request.Body.ReadAsync(buf, ctx.RequestAborted)) > 0)
        {
            n += read;
        }
    }
    catch (Exception e) when (e is IOException or OperationCanceledException or BadHttpRequestException)
    {
        // match Go: ignore copy errors, report what was read
    }
    double elapsed = sw.Elapsed.TotalSeconds;

    ctx.Response.ContentType = "application/json";
    await ctx.Response.WriteAsync(string.Create(CultureInfo.InvariantCulture, $"{{\"bytes\":{n},\"elapsed\":{elapsed:F4}}}"));
});

// Ping endpoint for latency measurement
app.Map("/api/ping", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "application/json";
    ctx.Response.Headers.CacheControl = "no-store";
    await ctx.Response.WriteAsync($"{{\"time\":{DateTimeOffset.UtcNow.ToUnixTimeMilliseconds()}}}");
});

// Serve embedded web UI (catch-all, like Go's "/" pattern)
app.Map("{**path}", async (HttpContext ctx) =>
{
    ctx.Response.ContentType = "text/html; charset=utf-8";
    await ctx.Response.Body.WriteAsync(htmlData);
});

try
{
    await app.StartAsync();
}
catch (Exception e)
{
    Log($"Failed to start server: {e.Message}\nTry a different port: speedtest <port>");
    return 1;
}
Log($"Speedtest server running on http://localhost:{port}");
await app.WaitForShutdownAsync();
return 0;

static void Log(string msg) =>
    Console.Error.WriteLine($"{DateTime.Now:yyyy/MM/dd HH:mm:ss} {msg}");

static byte[] ReadEmbedded(string name)
{
    using var stream = typeof(Program).Assembly.GetManifestResourceStream(name)
        ?? throw new InvalidOperationException($"missing embedded resource {name}");
    using var ms = new MemoryStream();
    stream.CopyTo(ms);
    return ms.ToArray();
}

// StripInstallSection removes the "Get started" install div from HTML
static byte[] StripInstallSection(byte[] html)
{
    ReadOnlySpan<byte> marker = "<div class=\"install\">"u8;
    int start = html.AsSpan().IndexOf(marker);
    if (start == -1)
    {
        return html;
    }
    // Find the closing </div> at the same indentation level (6 spaces)
    ReadOnlySpan<byte> closing = "\n      </div>"u8;
    int end = html.AsSpan(start + marker.Length).IndexOf(closing);
    if (end == -1)
    {
        return html;
    }
    end = start + marker.Length + end + closing.Length;
    return [.. html.AsSpan(0, start), .. html.AsSpan(end)];
}
