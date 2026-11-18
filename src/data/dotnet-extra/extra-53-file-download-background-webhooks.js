export default {
  id: 'extra-53-file-download-background-webhooks',
  title: 'File Download API, Background Processing and Webhooks',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 53,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Serve files safely and efficiently from ASP.NET Core (File, PhysicalFile, streams, CSV/Excel export, range requests, Content-Disposition, path-traversal protection), run long jobs in the background with the 202 Accepted + status + download pattern, and integrate with other systems through webhooks: receiving them securely (HMAC signature, timestamp tolerance, idempotency) and sending them reliably (signing, retries with exponential backoff).',
  objectives: [
    'Return files with File(), PhysicalFile() and FileStreamResult, choosing inline vs attachment and the right content type',
    'Export data as CSV and Excel and download it from React with axios (responseType blob)',
    'Implement the asynchronous request-reply pattern: POST -> 202 + jobId, GET status, GET download',
    'Receive webhooks safely: verify HMAC-SHA256 signatures, reject replays, process each event once',
    'Send webhooks with signatures, timeouts and retry with exponential backoff',
  ],
  theory: [
    {
      heading: 'File results in ASP.NET Core',
      content: 'ControllerBase has helpers that set Content-Type, Content-Length and Content-Disposition for you. File(byte[] | Stream, contentType, fileDownloadName) returns data you already have in memory or a stream; PhysicalFile(fullPath, contentType, name) streams a file from disk efficiently; Minimal APIs use Results.File / TypedResults.PhysicalFile. When you pass a fileDownloadName, the response has Content-Disposition: attachment; filename=..., so the browser downloads it; without a name the browser may show it inline (PDF, images). enableRangeProcessing: true supports HTTP Range requests so videos can be seeked and large downloads resumed (206 Partial Content).',
      syntax: `return File(bytes, "text/csv", "products.csv");                       // attachment
return File(pdfStream, "application/pdf");                              // inline view
return PhysicalFile(fullPath, "video/mp4", enableRangeProcessing: true); // 206 support`,
      points: [
        'Use FileExtensionContentTypeProvider to map .pdf, .xlsx, .png to the correct MIME type.',
        'Stream big files (PhysicalFile, FileStream) - do not load 2 GB into a byte[].',
        'Store uploads OUTSIDE wwwroot and serve them through an authorized endpoint.',
      ],
    },
    {
      heading: 'Security for downloads',
      content: 'The most common bug is path traversal: GET /api/files/..%2F..%2Fappsettings.json. Never combine user input directly with a folder path. Take only the file NAME (Path.GetFileName), build the full path, call Path.GetFullPath and check that it still starts with your storage root; better, store files under random names (GUIDs) and keep the original name in the database. Check authorization: the logged-in user must own the file. For public links, use short-lived signed URLs (an expiry time plus an HMAC of the path) or Azure Blob SAS tokens.',
      tip: 'Set the X-Content-Type-Options: nosniff header and never serve user-uploaded HTML/SVG inline from your main domain - it can run scripts (stored XSS).',
    },
    {
      heading: 'Background processing: the asynchronous request-reply pattern',
      content: 'Generating a 100,000-row report or a ZIP of invoices can take minutes - longer than browser or gateway timeouts. Instead: 1) POST /api/reports returns 202 Accepted with a jobId and Location header; 2) a BackgroundService (see Extra 47) processes the queue and updates the job status; 3) the client polls GET /api/reports/{id} (Pending, Running 40%, Completed, Failed) or receives a SignalR/webhook notification; 4) GET /api/reports/{id}/download returns the file when ready (409 or 404 before that). Store job state in a database for multi-server apps.',
      syntax: `[HttpPost] public async Task<IActionResult> Create(ReportRequest r)
{
    var job = store.Create(r);
    await queue.EnqueueAsync(job.Id);
    return AcceptedAtAction(nameof(Status), new { id = job.Id }, new { job.Id, job.Status });
}`,
    },
    {
      heading: 'Webhooks: receiving events',
      content: 'A webhook is an HTTP POST that another system (payment gateway, GitHub, courier) sends to YOUR URL when something happens - "push" instead of polling. Because anyone on the internet can call that URL, you must verify it. Providers sign the raw request body with a shared secret using HMAC-SHA256 and put the signature (and usually a timestamp) in a header. Your endpoint recomputes the HMAC over the exact raw body, compares with CryptographicOperations.FixedTimeEquals, rejects old timestamps (replay attacks), and remembers processed event ids (the provider may deliver the same event more than once). Reply 2xx fast and do heavy work in the background.',
      points: [
        'Read the RAW body string before deserializing - re-serialized JSON may differ by a space and break the signature.',
        'Idempotency: unique index on EventId; if it already exists return 200 and do nothing.',
        'Return 2xx only after the event is safely stored, otherwise the provider retries.',
        'Test locally with tools like ngrok / Visual Studio Dev Tunnels (View > Dev Tunnels) to expose localhost.',
      ],
    },
    {
      heading: 'Webhooks: sending events',
      content: 'When YOUR system notifies partners (order shipped, report ready), you are the provider. Let partners register a URL and secret, sign every payload, include an event id and timestamp, set a short timeout, and retry failures (5xx, timeouts) with exponential backoff (1 s, 2 s, 4 s, 8 s...) plus jitter. After N failures mark the subscription unhealthy and alert. In .NET 8+ the Microsoft.Extensions.Http.Resilience package adds retries, timeouts and circuit breakers to IHttpClientFactory clients with AddStandardResilienceHandler().',
      syntax: `builder.Services.AddHttpClient("webhooks", c => c.Timeout = TimeSpan.FromSeconds(10))
       .AddStandardResilienceHandler();   // retry + circuit breaker + timeouts`,
      tip: 'Send webhooks from a background queue, never inside the user\'s request - a slow partner must not slow down your checkout.',
    },
  ],
  examples: [
    {
      title: 'File download API: safe disk downloads, CSV and Excel export, inline PDF, React download',
      scenario: 'The Product API must let users download uploaded documents, export the product list as CSV or Excel, and view an invoice PDF in the browser.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API; name FilesApi; .NET 8/10 > Create',
        'Package Manager Console: Install-Package ClosedXML (for Excel export)',
        'Create a folder Storage in the project root (NOT in wwwroot) and copy a sample brochure.pdf into it',
        'Add Controllers/FilesController.cs and Controllers/ExportController.cs and the "Storage:Root" setting in appsettings.json',
        'Press F5; open https://localhost:7001/api/files/brochure.pdf and https://localhost:7001/api/export/products.xlsx in the browser',
      ],
      code: `// appsettings.json (part)
{ "Storage": { "Root": "Storage" } }

// Controllers/FilesController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.StaticFiles;
namespace FilesApi.Controllers;

[ApiController]
[Route("api/files")]
public class FilesController(IWebHostEnvironment env, IConfiguration config) : ControllerBase
{
    private static readonly FileExtensionContentTypeProvider Types = new();

    [HttpGet("{fileName}")]
    public IActionResult Download(string fileName, bool inline = false)
    {
        string root = Path.GetFullPath(Path.Combine(env.ContentRootPath, config["Storage:Root"]!));
        string safeName = Path.GetFileName(fileName);                      // strips ../ parts
        string fullPath = Path.GetFullPath(Path.Combine(root, safeName));

        if (!fullPath.StartsWith(root + Path.DirectorySeparatorChar, StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { message = "Invalid file name" });       // path traversal attempt
        if (!System.IO.File.Exists(fullPath))
            return NotFound();

        if (!Types.TryGetContentType(fullPath, out var contentType))
            contentType = "application/octet-stream";

        Response.Headers["X-Content-Type-Options"] = "nosniff";
        return inline
            ? PhysicalFile(fullPath, contentType, enableRangeProcessing: true)            // view in browser
            : PhysicalFile(fullPath, contentType, safeName, enableRangeProcessing: true); // download
    }
}

// Controllers/ExportController.cs
using System.Globalization;
using System.Text;
using ClosedXML.Excel;
using Microsoft.AspNetCore.Mvc;
namespace FilesApi.Controllers;

[ApiController]
[Route("api/export")]
public class ExportController : ControllerBase
{
    private static readonly List<ProductRow> Products =
        [new(1, "Pen", 10.5m, 100), new(2, "Book, Hardcover", 250m, 3), new(3, "Bag", 799m, 12)];

    [HttpGet("products.csv")]
    public IActionResult Csv()
    {
        var sb = new StringBuilder();
        sb.AppendLine("Id,Name,Price,Stock");
        foreach (var p in Products)
            sb.AppendLine(string.Join(",", p.Id, Quote(p.Name),
                p.Price.ToString(CultureInfo.InvariantCulture), p.Stock));
        byte[] bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(sb.ToString())).ToArray(); // BOM so Excel shows UTF-8
        return File(bytes, "text/csv", "products-" + DateTime.UtcNow.ToString("yyyyMMdd") + ".csv");
    }

    [HttpGet("products.xlsx")]
    public IActionResult Excel()
    {
        using var workbook = new XLWorkbook();
        var sheet = workbook.Worksheets.Add("Products");
        sheet.Cell(1, 1).InsertTable(Products, "ProductsTable", true);
        sheet.Columns().AdjustToContents();
        using var ms = new MemoryStream();
        workbook.SaveAs(ms);
        return File(ms.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "products.xlsx");
    }

    [HttpGet("invoice/{id:int}.pdf")]
    public IActionResult Invoice(int id, [FromServices] IWebHostEnvironment env)
    {
        var path = Path.Combine(env.ContentRootPath, "Storage", "brochure.pdf");   // demo: any PDF
        var stream = System.IO.File.OpenRead(path);                                 // disposed by the framework
        return File(stream, "application/pdf");                                     // no name -> inline
    }

    private static string Quote(string s) => s.Contains(',') ? "\\"" + s + "\\"" : s;
}
public record ProductRow(int Id, string Name, decimal Price, int Stock);

// React: download with axios (blob) and trigger the browser save dialog
import api from "./api";
export async function downloadProductsExcel() {
  const res = await api.get("/export/products.xlsx", { responseType: "blob" });
  const url = URL.createObjectURL(res.data);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.xlsx";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}`,
      result: `GET /api/files/brochure.pdf
200  Content-Type: application/pdf
     Content-Disposition: attachment; filename=brochure.pdf; filename*=UTF-8''brochure.pdf
     Accept-Ranges: bytes

GET /api/files/brochure.pdf?inline=true          -> PDF opens inside the browser tab
GET /api/files/brochure.pdf   Range: bytes=0-1023 -> 206 Partial Content, Content-Range: bytes 0-1023/48213
GET /api/files/..%2Fappsettings.json             -> 404 (nothing outside Storage can be reached)
GET /api/files/missing.pdf                       -> 404

GET /api/export/products.csv   -> products-20261117.csv
Id,Name,Price,Stock
1,Pen,10.5,100
2,"Book, Hardcover",250,3
3,Bag,799,12

GET /api/export/products.xlsx  -> products.xlsx with a formatted Excel table (Id, Name, Price, Stock)
GET /api/export/invoice/5.pdf  -> displayed inline (no Content-Disposition attachment)`,
      explanation: 'Path.GetFileName removes any directory part, and the GetFullPath + StartsWith check is a second safety net. PhysicalFile streams from disk without loading the whole file and, with enableRangeProcessing, answers Range requests with 206. Passing a download name produces Content-Disposition: attachment. The CSV quotes the name that contains a comma and uses invariant culture so 10.5 never becomes 10,5. In C# the quote is written as "\\"" (escaped quote). The date in the CSV file name and the file size are examples. In React, responseType "blob" keeps the binary intact and an object URL triggers the save dialog.',
    },
    {
      title: 'Background report generation: 202 Accepted, status polling and download',
      scenario: 'A sales report takes about a minute. The API must accept the request instantly, generate the CSV in a background worker, show progress, and allow downloading when it is finished.',
      steps: [
        'In FilesApi add folder Reports with ReportJob.cs, ReportJobStore.cs, ReportQueue.cs and ReportWorker.cs',
        'Add Controllers/ReportsController.cs and register the services in Program.cs',
        'Press F5; POST /api/reports in Swagger, copy the id from the response',
        'Call GET /api/reports/{id} a few times to see progress, then GET /api/reports/{id}/download',
      ],
      code: `// Reports/ReportJob.cs
namespace FilesApi.Reports;
public enum JobStatus { Pending, Running, Completed, Failed }
public class ReportJob
{
    public Guid Id { get; } = Guid.NewGuid();
    public string ReportType { get; init; } = "sales";
    public JobStatus Status { get; set; } = JobStatus.Pending;
    public int Progress { get; set; }
    public string? FilePath { get; set; }
    public string? Error { get; set; }
    public DateTime CreatedAt { get; } = DateTime.UtcNow;
}

// Reports/ReportJobStore.cs  (use a DB table in multi-server apps)
using System.Collections.Concurrent;
namespace FilesApi.Reports;
public class ReportJobStore
{
    private readonly ConcurrentDictionary<Guid, ReportJob> _jobs = new();
    public ReportJob Create(string type) { var j = new ReportJob { ReportType = type }; _jobs[j.Id] = j; return j; }
    public ReportJob? Get(Guid id) => _jobs.TryGetValue(id, out var j) ? j : null;
}

// Reports/ReportQueue.cs
using System.Threading.Channels;
namespace FilesApi.Reports;
public class ReportQueue
{
    private readonly Channel<Guid> _channel = Channel.CreateBounded<Guid>(50);
    public ValueTask EnqueueAsync(Guid id, CancellationToken ct = default) => _channel.Writer.WriteAsync(id, ct);
    public IAsyncEnumerable<Guid> ReadAllAsync(CancellationToken ct) => _channel.Reader.ReadAllAsync(ct);
}

// Reports/ReportWorker.cs
using System.Text;
namespace FilesApi.Reports;
public class ReportWorker(ReportQueue queue, ReportJobStore store, IWebHostEnvironment env,
                          ILogger<ReportWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        string folder = Path.Combine(env.ContentRootPath, "Storage", "reports");
        Directory.CreateDirectory(folder);

        await foreach (var id in queue.ReadAllAsync(stoppingToken))
        {
            var job = store.Get(id);
            if (job is null) continue;
            try
            {
                job.Status = JobStatus.Running;
                var sb = new StringBuilder();
                sb.AppendLine("Month,Revenue");
                string[] months = ["2026-08", "2026-09", "2026-10", "2026-11"];
                for (int i = 0; i < months.Length; i++)
                {
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);  // pretend heavy SQL work
                    sb.AppendLine(months[i] + "," + (100000 + i * 12500));
                    job.Progress = (i + 1) * 100 / months.Length;
                }
                job.FilePath = Path.Combine(folder, job.Id + ".csv");
                await File.WriteAllTextAsync(job.FilePath, sb.ToString(), stoppingToken);
                job.Status = JobStatus.Completed;
                logger.LogInformation("Report {Id} completed", job.Id);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                job.Status = JobStatus.Failed;
                job.Error = "Report generation failed";
                logger.LogError(ex, "Report {Id} failed", job.Id);
            }
        }
    }
}

// Controllers/ReportsController.cs
using FilesApi.Reports;
using Microsoft.AspNetCore.Mvc;
namespace FilesApi.Controllers;

[ApiController]
[Route("api/reports")]
public class ReportsController(ReportJobStore store, ReportQueue queue) : ControllerBase
{
    public record CreateReportRequest(string ReportType);

    [HttpPost]
    public async Task<IActionResult> Create(CreateReportRequest req, CancellationToken ct)
    {
        var job = store.Create(req.ReportType);
        await queue.EnqueueAsync(job.Id, ct);
        return AcceptedAtAction(nameof(Status), new { id = job.Id },
            new { job.Id, status = job.Status.ToString() });
    }

    [HttpGet("{id:guid}")]
    public IActionResult Status(Guid id) => store.Get(id) is { } j
        ? Ok(new
          {
              j.Id, status = j.Status.ToString(), j.Progress, j.Error,
              downloadUrl = j.Status == JobStatus.Completed ? Url.Action(nameof(Download), new { id }) : null
          })
        : NotFound();

    [HttpGet("{id:guid}/download")]
    public IActionResult Download(Guid id)
    {
        var j = store.Get(id);
        if (j is null) return NotFound();
        if (j.Status != JobStatus.Completed) return Conflict(new { message = "Report is not ready yet", status = j.Status.ToString() });
        return PhysicalFile(j.FilePath!, "text/csv", j.ReportType + "-report.csv");
    }
}

// Program.cs (add)
builder.Services.AddSingleton<ReportJobStore>();
builder.Services.AddSingleton<ReportQueue>();
builder.Services.AddHostedService<ReportWorker>();`,
      result: `POST /api/reports {"reportType":"sales"}
202 Accepted   Location: https://localhost:7001/api/reports/3f2c9a7e-1b4d-4e0a-9d1e-6c2b7f1a8e55
{"id":"3f2c9a7e-1b4d-4e0a-9d1e-6c2b7f1a8e55","status":"Pending"}

GET /api/reports/3f2c...8e55            -> {"id":"3f2c...","status":"Running","progress":50,"error":null,"downloadUrl":null}
GET /api/reports/3f2c...8e55/download   -> 409 {"message":"Report is not ready yet","status":"Running"}
GET /api/reports/3f2c...8e55   (20 s)   -> {"status":"Completed","progress":100,"downloadUrl":"/api/reports/3f2c.../download"}
GET /api/reports/3f2c...8e55/download   -> 200 sales-report.csv
Month,Revenue
2026-08,100000
2026-09,112500
2026-10,125000
2026-11,137500`,
      explanation: 'The POST only creates a job and writes its id to the channel, so it returns 202 in milliseconds with a Location header pointing to the status endpoint (AcceptedAtAction). The worker updates Status and Progress on the shared singleton job object while it works. Download returns 409 Conflict until the job is Completed. GUIDs differ on every run. Revenue values come from 100000 + i * 12500.',
    },
    {
      title: 'Webhooks in and out: verify a payment webhook, notify partners with signed, retried webhooks',
      scenario: 'A payment gateway calls /webhooks/payments when a payment succeeds. The shop verifies the signature, ignores duplicates, marks the order paid, and then sends its own signed "order.paid" webhook to a partner warehouse system.',
      steps: [
        'In the ShopApi project: Install-Package Microsoft.Extensions.Http.Resilience',
        'Add Webhooks/WebhookSignature.cs, Webhooks/WebhookSender.cs and the ProcessedWebhook entity + DbSet; run Add-Migration Webhooks and Update-Database',
        'Add the "Webhooks" section to User Secrets (right-click project > Manage User Secrets)',
        'Map the /webhooks/payments endpoint in Program.cs; press F5',
        'To receive real webhooks from the internet, use View > Dev Tunnels (Visual Studio) to create a public HTTPS URL for localhost',
      ],
      code: `// secrets.json
{ "Webhooks": { "PaymentSecret": "whsec_test_123", "OutgoingSecret": "partner_secret_456",
                "WarehouseUrl": "https://warehouse.example.com/hooks/shop" } }

// Webhooks/WebhookSignature.cs
using System.Security.Cryptography;
using System.Text;
namespace ShopApi.Webhooks;
public static class WebhookSignature
{
    public static string Sign(string secret, long timestamp, string body)
    {
        using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(secret));
        var hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(timestamp + "." + body));
        return Convert.ToHexString(hash).ToLowerInvariant();
    }

    // header format: t=1763372400,v1=<hex>
    public static bool Verify(string secret, string header, string body, long nowUnix, int toleranceSeconds = 300)
    {
        var parts = header.Split(',', StringSplitOptions.RemoveEmptyEntries)
                          .Select(p => p.Split('=', 2))
                          .Where(p => p.Length == 2)
                          .ToDictionary(p => p[0].Trim(), p => p[1].Trim());
        if (!parts.TryGetValue("t", out var t) || !long.TryParse(t, out var ts)) return false;
        if (Math.Abs(nowUnix - ts) > toleranceSeconds) return false;              // replay protection
        if (!parts.TryGetValue("v1", out var given)) return false;
        var expected = Sign(secret, ts, body);
        return CryptographicOperations.FixedTimeEquals(
            Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(given));     // constant-time compare
    }
}

// Models/ProcessedWebhook.cs  (unique index on EventId => idempotency)
public class ProcessedWebhook
{
    public int Id { get; set; }
    public string EventId { get; set; } = "";
    public DateTime ReceivedAt { get; set; }
}
// in OnModelCreating: mb.Entity<ProcessedWebhook>().HasIndex(w => w.EventId).IsUnique();

// Webhooks/WebhookSender.cs
using System.Text;
using System.Text.Json;
namespace ShopApi.Webhooks;
public class WebhookSender(IHttpClientFactory factory, IConfiguration config, ILogger<WebhookSender> logger)
{
    public async Task SendAsync(string eventType, object data, CancellationToken ct = default)
    {
        string eventId = "evt_" + Guid.NewGuid().ToString("N");
        string body = JsonSerializer.Serialize(new { id = eventId, type = eventType, createdAt = DateTime.UtcNow, data });
        long ts = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        string sig = WebhookSignature.Sign(config["Webhooks:OutgoingSecret"]!, ts, body);

        using var request = new HttpRequestMessage(HttpMethod.Post, config["Webhooks:WarehouseUrl"])
        {
            Content = new StringContent(body, Encoding.UTF8, "application/json")
        };
        request.Headers.Add("X-Signature", "t=" + ts + ",v1=" + sig);
        request.Headers.Add("X-Event-Id", eventId);

        var client = factory.CreateClient("webhooks");      // retries with backoff configured below
        var response = await client.SendAsync(request, ct);
        logger.LogInformation("Webhook {EventId} -> {Status}", eventId, (int)response.StatusCode);
        response.EnsureSuccessStatusCode();
    }
}

// Program.cs (relevant parts)
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using ShopApi.Webhooks;

builder.Services.AddHttpClient("webhooks", c => c.Timeout = TimeSpan.FromSeconds(30))
    .AddStandardResilienceHandler(o =>
    {
        o.Retry.MaxRetryAttempts = 4;                        // 1 try + 4 retries
        o.Retry.BackoffType = Polly.DelayBackoffType.Exponential;
        o.Retry.UseJitter = true;
        o.Retry.Delay = TimeSpan.FromSeconds(1);
    });
builder.Services.AddScoped<WebhookSender>();
...
app.MapPost("/webhooks/payments", async (HttpRequest request, IConfiguration config,
                                         AppDbContext db, WebhookSender sender, ILogger<Program> logger) =>
{
    using var reader = new StreamReader(request.Body);
    string rawBody = await reader.ReadToEndAsync();               // RAW body for the signature
    string header = request.Headers["X-Signature"].ToString();

    if (!WebhookSignature.Verify(config["Webhooks:PaymentSecret"]!, header, rawBody,
                                 DateTimeOffset.UtcNow.ToUnixTimeSeconds()))
        return Results.Unauthorized();

    using var doc = JsonDocument.Parse(rawBody);
    string eventId = doc.RootElement.GetProperty("id").GetString()!;
    string type = doc.RootElement.GetProperty("type").GetString()!;

    if (await db.ProcessedWebhooks.AnyAsync(w => w.EventId == eventId))
        return Results.Ok(new { duplicate = true });              // already handled: still 200

    db.ProcessedWebhooks.Add(new ProcessedWebhook { EventId = eventId, ReceivedAt = DateTime.UtcNow });
    if (type == "payment.succeeded")
    {
        int orderId = doc.RootElement.GetProperty("orderId").GetInt32();
        var order = await db.Orders.FindAsync(orderId);
        if (order is not null) order.Status = "Paid";
    }
    await db.SaveChangesAsync();                                   // unique index blocks races
    logger.LogInformation("Webhook {EventId} ({Type}) processed", eventId, type);

    // notify the partner (in production: enqueue and send from a BackgroundService)
    _ = Task.Run(() => sender.SendAsync("order.paid", new { orderId = 1001 }));
    return Results.Ok();
}).DisableAntiforgery();`,
      result: `Gateway -> POST /webhooks/payments
X-Signature: t=1763372400,v1=<64 hex chars = HMAC-SHA256(secret, "1763372400." + raw body)>
{"id":"evt_1001","type":"payment.succeeded","amount":49900,"orderId":1001}
<- 200 OK                    (order 1001 status = Paid)

Same request delivered again       <- 200 {"duplicate":true}   (nothing changed)
Body changed to "amount":100       <- 401 Unauthorized        (signature mismatch)
Request replayed 10 minutes later  <- 401 Unauthorized        (timestamp outside tolerance)

Outgoing to warehouse (log):
info: ShopApi.Webhooks.WebhookSender[0] Webhook evt_5c1e... -> 200
(if the warehouse returns 503, the resilience handler retries after ~1 s, ~2 s, ~4 s, ~8 s with jitter)`,
      explanation: 'The signature is computed over timestamp + "." + raw body with the shared secret; any change to the body or a different secret produces a different HMAC, and FixedTimeEquals avoids timing attacks. The timestamp check stops attackers from replaying a captured request later. The ProcessedWebhooks table with a unique EventId makes the handler idempotent, so duplicate deliveries are harmless. The next console example computes real signatures step by step. Task.Run is used only to keep the demo short - production code should enqueue the outgoing webhook for a BackgroundService, as the tip in the theory says.',
    },
    {
      title: 'Console simulation: HMAC-SHA256 webhook signatures',
      scenario: 'Sign a payment event like a gateway does and verify genuine, tampered, wrong-secret and replayed requests using the real .NET crypto APIs.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it WebhookSignatureDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

const string secret = "whsec_test_123";
string payload = JsonSerializer.Serialize(new { id = "evt_1001", type = "payment.succeeded", amount = 49900 });
long timestamp = 1763372400;          // Unix seconds when the gateway sent it (fixed for the demo)
string signature = Sign(secret, timestamp, payload);

Console.WriteLine("Payload : " + payload);
Console.WriteLine("Header  : X-Signature: t=" + timestamp + ",v1=" + signature);

Check("Genuine request", secret, payload, timestamp + 10);
Check("Tampered amount=100", secret, payload.Replace("49900", "100"), timestamp + 10);
Check("Wrong secret", "wrong_secret", payload, timestamp + 10);
Check("Replay after 301 s", secret, payload, timestamp + 301);

void Check(string label, string receiverSecret, string body, long now)
{
    if (Math.Abs(now - timestamp) > 300)
    {
        Console.WriteLine(label.PadRight(20) + " -> 401 rejected: timestamp outside 5 min tolerance");
        return;
    }
    string expected = Sign(receiverSecret, timestamp, body);
    bool ok = CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(signature));
    Console.WriteLine(label.PadRight(20) + " -> expected " + expected.Substring(0, 16) + "... " + (ok ? "200 valid" : "401 invalid signature"));
}

static string Sign(string key, long ts, string body)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
    byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(ts + "." + body));
    return Convert.ToHexString(hash).ToLowerInvariant();
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

const string secret = "whsec_test_123";
string payload = JsonSerializer.Serialize(new { id = "evt_1001", type = "payment.succeeded", amount = 49900 });
long timestamp = 1763372400;          // Unix seconds when the gateway sent it (fixed for the demo)
string signature = Sign(secret, timestamp, payload);

Console.WriteLine("Payload : " + payload);
Console.WriteLine("Header  : X-Signature: t=" + timestamp + ",v1=" + signature);

Check("Genuine request", secret, payload, timestamp + 10);
Check("Tampered amount=100", secret, payload.Replace("49900", "100"), timestamp + 10);
Check("Wrong secret", "wrong_secret", payload, timestamp + 10);
Check("Replay after 301 s", secret, payload, timestamp + 301);

void Check(string label, string receiverSecret, string body, long now)
{
    if (Math.Abs(now - timestamp) > 300)
    {
        Console.WriteLine(label.PadRight(20) + " -> 401 rejected: timestamp outside 5 min tolerance");
        return;
    }
    string expected = Sign(receiverSecret, timestamp, body);
    bool ok = CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(signature));
    Console.WriteLine(label.PadRight(20) + " -> expected " + expected.Substring(0, 16) + "... " + (ok ? "200 valid" : "401 invalid signature"));
}

static string Sign(string key, long ts, string body)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
    byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(ts + "." + body));
    return Convert.ToHexString(hash).ToLowerInvariant();
}
`,
        },
        stdin: '',
      },
      result: `Payload : {"id":"evt_1001","type":"payment.succeeded","amount":49900}
Header  : X-Signature: t=1763372400,v1=9fa48a2c963504edff7ce97aac6c6c7704b485ba951c08bc5e9a808b32b8ae33
Genuine request      -> expected 9fa48a2c963504ed... 200 valid
Tampered amount=100  -> expected ce9c297b9d4e6409... 401 invalid signature
Wrong secret         -> expected 3460ea321d031f09... 401 invalid signature
Replay after 301 s   -> 401 rejected: timestamp outside 5 min tolerance`,
      explanation: 'HMAC is deterministic: the same secret, timestamp and body always give the same 64-hex-character signature, so the receiver can recompute it. Changing one number in the body or using a different secret gives a completely different value. The replayed request has a perfect signature but is 301 seconds old, so the tolerance check rejects it before any HMAC work. FixedTimeEquals compares in constant time so attackers cannot guess the signature byte by byte.',
    },
    {
      title: 'Console simulation: job status flow and download',
      scenario: 'Walk through POST -> 202, polling the status while a worker advances the job, and downloading the CSV only when it is completed.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReportJobDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var jobs = new Dictionary<string, Job>();
int nextId = 1;

string Post(string type)
{
    var job = new Job("job-" + nextId++, type);
    jobs[job.Id] = job;
    Console.WriteLine("POST /api/reports -> 202 Accepted, Location: /api/reports/" + job.Id);
    return job.Id;
}
void Status(string id)
{
    var j = jobs[id];
    Console.WriteLine("GET  /api/reports/" + id + " -> 200 status=" + j.Status + " progress=" + j.Progress + "%");
}
void Download(string id)
{
    var j = jobs[id];
    if (j.Status != "Completed")
    {
        Console.WriteLine("GET  /api/reports/" + id + "/download -> 409 Conflict (not ready)");
        return;
    }
    Console.WriteLine("GET  /api/reports/" + id + "/download -> 200 text/csv, attachment; filename=" + j.Type + "-report.csv");
    foreach (var line in j.Csv) Console.WriteLine("     " + line);
}
void WorkerTick()
{
    foreach (var j in jobs.Values) j.Advance();
    Console.WriteLine("     (worker tick)");
}

string id = Post("sales");
Status(id);
Download(id);
WorkerTick();
Status(id);
WorkerTick();
Status(id);
Download(id);

class Job(string id, string type)
{
    public string Id { get; } = id;
    public string Type { get; } = type;
    public string Status { get; private set; } = "Pending";
    public int Progress { get; private set; }
    public List<string> Csv { get; } = new();

    public void Advance()
    {
        if (Status == "Pending") { Status = "Running"; Progress = 50; }
        else if (Status == "Running")
        {
            Status = "Completed";
            Progress = 100;
            Csv.Add("Month,Revenue");
            Csv.Add("2026-09,120000");
            Csv.Add("2026-10,135500");
        }
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var jobs = new Dictionary<string, Job>();
int nextId = 1;

string Post(string type)
{
    var job = new Job("job-" + nextId++, type);
    jobs[job.Id] = job;
    Console.WriteLine("POST /api/reports -> 202 Accepted, Location: /api/reports/" + job.Id);
    return job.Id;
}
void Status(string id)
{
    var j = jobs[id];
    Console.WriteLine("GET  /api/reports/" + id + " -> 200 status=" + j.Status + " progress=" + j.Progress + "%");
}
void Download(string id)
{
    var j = jobs[id];
    if (j.Status != "Completed")
    {
        Console.WriteLine("GET  /api/reports/" + id + "/download -> 409 Conflict (not ready)");
        return;
    }
    Console.WriteLine("GET  /api/reports/" + id + "/download -> 200 text/csv, attachment; filename=" + j.Type + "-report.csv");
    foreach (var line in j.Csv) Console.WriteLine("     " + line);
}
void WorkerTick()
{
    foreach (var j in jobs.Values) j.Advance();
    Console.WriteLine("     (worker tick)");
}

string id = Post("sales");
Status(id);
Download(id);
WorkerTick();
Status(id);
WorkerTick();
Status(id);
Download(id);

class Job(string id, string type)
{
    public string Id { get; } = id;
    public string Type { get; } = type;
    public string Status { get; private set; } = "Pending";
    public int Progress { get; private set; }
    public List<string> Csv { get; } = new();

    public void Advance()
    {
        if (Status == "Pending") { Status = "Running"; Progress = 50; }
        else if (Status == "Running")
        {
            Status = "Completed";
            Progress = 100;
            Csv.Add("Month,Revenue");
            Csv.Add("2026-09,120000");
            Csv.Add("2026-10,135500");
        }
    }
}
`,
        },
        stdin: '',
      },
      result: `POST /api/reports -> 202 Accepted, Location: /api/reports/job-1
GET  /api/reports/job-1 -> 200 status=Pending progress=0%
GET  /api/reports/job-1/download -> 409 Conflict (not ready)
     (worker tick)
GET  /api/reports/job-1 -> 200 status=Running progress=50%
     (worker tick)
GET  /api/reports/job-1 -> 200 status=Completed progress=100%
GET  /api/reports/job-1/download -> 200 text/csv, attachment; filename=sales-report.csv
     Month,Revenue
     2026-09,120000
     2026-10,135500`,
      explanation: 'The POST returns immediately with the job location; nothing has been generated yet. Each worker tick moves the job forward (Pending -> Running -> Completed), which is what the BackgroundService does in the real API. Download refuses with 409 until the job is Completed, then returns the file as an attachment. The client logic is simply: poll status until Completed (or Failed), then follow downloadUrl.',
    },
    {
      title: 'Console simulation: webhook retries with backoff and an idempotent receiver',
      scenario: 'The partner endpoint is down for the first two attempts. The sender retries with exponential backoff; later the same event is delivered again and the receiver ignores the duplicate.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it WebhookRetryDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Collections.Generic;

var receiver = new WebhookReceiver(failFirst: 2);
var sender = new WebhookSender(receiver, maxAttempts: 5);

sender.Deliver("evt_2001", "order.shipped");
Console.WriteLine("-- sender lost the 200 response and sends evt_2001 again --");
sender.Deliver("evt_2001", "order.shipped");
sender.Deliver("evt_2002", "order.delivered");
Console.WriteLine("Processed events: " + string.Join(", ", receiver.Processed));

class WebhookReceiver(int failFirst)
{
    private int _failuresLeft = failFirst;
    public List<string> Processed { get; } = new();

    public int Receive(string eventId, string type)
    {
        if (_failuresLeft > 0)
        {
            _failuresLeft--;
            Console.WriteLine("   receiver: 503 Service Unavailable");
            return 503;
        }
        if (Processed.Contains(eventId))
        {
            Console.WriteLine("   receiver: duplicate " + eventId + " ignored -> 200 OK");
            return 200;
        }
        Processed.Add(eventId);
        Console.WriteLine("   receiver: processed " + type + " (" + eventId + ") -> 200 OK");
        return 200;
    }
}

class WebhookSender(WebhookReceiver receiver, int maxAttempts)
{
    public void Deliver(string eventId, string type)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            Console.WriteLine("attempt " + attempt + ": POST /hooks (" + eventId + ")");
            int status = receiver.Receive(eventId, type);
            if (status >= 200 && status < 300)
            {
                Console.WriteLine("   -> delivered after " + attempt + " attempt(s)");
                return;
            }
            int delaySeconds = (int)Math.Pow(2, attempt - 1);   // 1, 2, 4, 8 ...
            Console.WriteLine("   -> retry in " + delaySeconds + " s");
        }
        Console.WriteLine("   -> giving up, moved to dead-letter list");
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var receiver = new WebhookReceiver(failFirst: 2);
var sender = new WebhookSender(receiver, maxAttempts: 5);

sender.Deliver("evt_2001", "order.shipped");
Console.WriteLine("-- sender lost the 200 response and sends evt_2001 again --");
sender.Deliver("evt_2001", "order.shipped");
sender.Deliver("evt_2002", "order.delivered");
Console.WriteLine("Processed events: " + string.Join(", ", receiver.Processed));

class WebhookReceiver(int failFirst)
{
    private int _failuresLeft = failFirst;
    public List<string> Processed { get; } = new();

    public int Receive(string eventId, string type)
    {
        if (_failuresLeft > 0)
        {
            _failuresLeft--;
            Console.WriteLine("   receiver: 503 Service Unavailable");
            return 503;
        }
        if (Processed.Contains(eventId))
        {
            Console.WriteLine("   receiver: duplicate " + eventId + " ignored -> 200 OK");
            return 200;
        }
        Processed.Add(eventId);
        Console.WriteLine("   receiver: processed " + type + " (" + eventId + ") -> 200 OK");
        return 200;
    }
}

class WebhookSender(WebhookReceiver receiver, int maxAttempts)
{
    public void Deliver(string eventId, string type)
    {
        for (int attempt = 1; attempt <= maxAttempts; attempt++)
        {
            Console.WriteLine("attempt " + attempt + ": POST /hooks (" + eventId + ")");
            int status = receiver.Receive(eventId, type);
            if (status >= 200 && status < 300)
            {
                Console.WriteLine("   -> delivered after " + attempt + " attempt(s)");
                return;
            }
            int delaySeconds = (int)Math.Pow(2, attempt - 1);   // 1, 2, 4, 8 ...
            Console.WriteLine("   -> retry in " + delaySeconds + " s");
        }
        Console.WriteLine("   -> giving up, moved to dead-letter list");
    }
}
`,
        },
        stdin: '',
      },
      result: `attempt 1: POST /hooks (evt_2001)
   receiver: 503 Service Unavailable
   -> retry in 1 s
attempt 2: POST /hooks (evt_2001)
   receiver: 503 Service Unavailable
   -> retry in 2 s
attempt 3: POST /hooks (evt_2001)
   receiver: processed order.shipped (evt_2001) -> 200 OK
   -> delivered after 3 attempt(s)
-- sender lost the 200 response and sends evt_2001 again --
attempt 1: POST /hooks (evt_2001)
   receiver: duplicate evt_2001 ignored -> 200 OK
   -> delivered after 1 attempt(s)
attempt 1: POST /hooks (evt_2002)
   receiver: processed order.delivered (evt_2002) -> 200 OK
   -> delivered after 1 attempt(s)
Processed events: evt_2001, evt_2002`,
      explanation: 'The delay doubles after each failure (2^(attempt-1) seconds): 1 s, then 2 s - a real sender also adds random jitter and actually waits. Because networks can lose responses, "at least once" delivery means duplicates WILL happen; the receiver keeps processed event ids and answers 200 without doing the work twice. That is why every webhook must carry a unique event id.',
    },
  ],
  interview: [
    { q: 'Difference between File(), PhysicalFile() and FileStreamResult?', a: 'File(byte[]/Stream, type, name) returns in-memory data or a stream; PhysicalFile(path, type, name) streams a file from an absolute disk path efficiently; FileStreamResult is the result type created by File(stream, ...). VirtualFile serves from the web root file provider.', level: 'Medium' },
    { q: 'How do you force a download instead of showing the file inline?', a: 'Provide a file download name (File(bytes, type, "report.pdf")), which sets Content-Disposition: attachment; filename=... Without a name the browser may render it inline.', level: 'Easy' },
    { q: 'What does enableRangeProcessing do?', a: 'Allows HTTP Range requests: the server returns 206 Partial Content for byte ranges, enabling video seeking and resumable downloads.', level: 'Medium' },
    { q: 'How do you prevent path traversal in a download endpoint?', a: 'Use only Path.GetFileName of the input, combine with a fixed root, call Path.GetFullPath and verify it starts with the root; better, store files with generated names and look them up by id in the database.', level: 'Hard' },
    { q: 'What is the asynchronous request-reply pattern?', a: 'The client POSTs a job and gets 202 Accepted with a status URL; a background worker processes it; the client polls the status endpoint (or gets a notification) and downloads the result when Completed.', level: 'Medium' },
    { q: 'What is a webhook?', a: 'An HTTP callback: a system sends an HTTP POST to a URL you registered when an event occurs, instead of you polling its API.', level: 'Easy' },
    { q: 'How do you verify that a webhook really comes from the provider?', a: 'Recompute the HMAC-SHA256 of the raw body (often timestamp + "." + body) with the shared secret and compare it to the signature header using a constant-time comparison; also check the timestamp tolerance and, optionally, the source IP.', level: 'Medium' },
    { q: 'Why must webhook handlers be idempotent?', a: 'Providers deliver at least once and retry on timeouts, so the same event can arrive several times. Store processed event ids (unique index) and skip duplicates while still returning 2xx.', level: 'Medium' },
    { q: 'Why should a webhook receiver respond quickly?', a: 'Providers have short timeouts and will retry (creating duplicates) if you are slow. Persist the event, return 2xx, then process heavy work in the background.', level: 'Easy' },
    { q: 'What is exponential backoff with jitter?', a: 'Retry delays grow exponentially (1, 2, 4, 8 s...) to give the failing service time to recover; jitter adds randomness so many clients do not retry at the same moment.', level: 'Medium' },
    { q: 'Why use CryptographicOperations.FixedTimeEquals instead of == for signatures?', a: '== may stop at the first different character, leaking timing information that lets an attacker guess the signature gradually. FixedTimeEquals always takes the same time.', level: 'Hard' },
    { q: 'Output question: retry delay = 2^(attempt-1) seconds. What is the delay after the 4th failed attempt?', a: '8 seconds (2^3).', level: 'Easy' },
  ],
  practice: [
    { task: 'Add GET /api/files/zip?names=a.pdf,b.pdf that returns several files as one ZIP download.', hint: 'Use System.IO.Compression.ZipArchive over a MemoryStream.', solution: 'using var ms = new MemoryStream(); using (var zip = new ZipArchive(ms, ZipArchiveMode.Create, true)) { foreach (var n in names.Split(\',\').Select(Path.GetFileName)) { var path = Path.Combine(root, n!); if (System.IO.File.Exists(path)) zip.CreateEntryFromFile(path, n!); } } return File(ms.ToArray(), "application/zip", "files.zip");' },
    { task: 'Create signed, expiring download links: /api/files/{name}?exp=1763380000&sig=... valid for 10 minutes.', hint: 'sig = HMAC(secret, name + "|" + exp); reject if expired or signature differs.', solution: 'string Sign(string name, long exp) => WebhookSignature.Sign(secret, exp, name); Create link: var exp = DateTimeOffset.UtcNow.AddMinutes(10).ToUnixTimeSeconds(); var url = $"/api/files/{name}?exp={exp}&sig={Sign(name, exp)}"; In Download: if (exp < DateTimeOffset.UtcNow.ToUnixTimeSeconds() || !CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(Sign(name, exp)), Encoding.UTF8.GetBytes(sig))) return Forbid();' },
    { task: 'Stream a large CSV export of 1 million orders without loading all rows into memory.', hint: 'Use AsAsyncEnumerable() and write to Response.Body with a StreamWriter.', solution: 'Response.ContentType = "text/csv"; Response.Headers.ContentDisposition = "attachment; filename=orders.csv"; await using var w = new StreamWriter(Response.Body); await w.WriteLineAsync("Id,Total"); await foreach (var o in db.Orders.AsNoTracking().AsAsyncEnumerable()) await w.WriteLineAsync(o.Id + "," + o.Total.ToString(CultureInfo.InvariantCulture)); return new EmptyResult();' },
    { task: 'Notify the user via SignalR when their report job completes instead of polling.', hint: 'Store the user id on the job; inject IHubContext into the worker.', solution: 'job.UserId = User.FindFirstValue(ClaimTypes.NameIdentifier); in ReportWorker after Completed: await hub.Clients.User(job.UserId!).SendAsync("ReportReady", job.Id, "/api/reports/" + job.Id + "/download");' },
    { task: 'Build a webhook subscription API: partners POST {url, secret, events[]}; store them; send each event only to subscribers of that event type.', hint: 'Table WebhookSubscriptions(Id, Url, Secret, Events, IsActive).', solution: 'POST /api/webhooks/subscriptions saves the row (validate https URL). When an event occurs: var subs = await db.WebhookSubscriptions.Where(s => s.IsActive && s.Events.Contains(type)).ToListAsync(); foreach (var s in subs) await queue.EnqueueAsync(new OutgoingWebhook(s.Url, s.Secret, type, payload)); the worker signs with s.Secret and retries; after 10 consecutive failures set IsActive = false.' },
  ],
  quiz: [
    { question: 'Which header makes the browser download a file with a given name?', options: ['Content-Type: application/download', 'Content-Disposition: attachment; filename=report.pdf', 'Accept: attachment', 'X-Download: true'], answer: 1, explanation: 'Content-Disposition attachment triggers the save dialog.' },
    { question: 'Which status code does a Range request get when partial content is returned?', options: ['200', '202', '204', '206'], answer: 3, explanation: '206 Partial Content.' },
    { question: 'A long job was queued. What should the POST return?', options: ['202 Accepted with a status URL', '200 OK with the finished file', '201 Created with the file', '500 because it is slow'], answer: 0, explanation: '202 signals asynchronous processing; the Location header points to the status endpoint.' },
    { question: 'What does a webhook receiver compute to verify the sender?', options: ['MD5 of the URL', 'Base64 of the body', 'HMAC-SHA256 of the raw body with the shared secret', 'A random GUID'], answer: 2, explanation: 'Only someone with the shared secret can produce the same HMAC.' },
    { question: 'The same webhook event id arrives twice. The receiver should...', options: ['Process it twice', 'Return 500 so the provider stops', 'Delete the first one', 'Return 200 and skip processing the duplicate'], answer: 3, explanation: 'Idempotent handling acknowledges duplicates without repeating side effects.' },
  ],
};
