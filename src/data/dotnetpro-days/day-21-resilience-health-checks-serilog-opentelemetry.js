const retryCode = `using System;

const int TimeoutMs = 1000;     // timeout per attempt
const int MaxRetries = 3;       // 1 try + 3 retries = 4 attempts at most
const int BaseDelayMs = 200;    // exponential backoff: 200, 400, 800 ...

// Each tuple = (milliseconds the payment API takes, HTTP status it returns)
Run("Payment API recovers", new[] { (1500, 200), (40, 503), (300, 200) });
Run("Payment API is down", new[] { (40, 503), (40, 503), (40, 503), (40, 503) });
Run("Wrong order id", new[] { (30, 404) });

void Run(string name, (int Ms, int Status)[] responses)
{
    Console.WriteLine($"== {name} ==");
    int totalWait = 0;
    for (int attempt = 1; attempt <= responses.Length; attempt++)
    {
        var (ms, status) = responses[attempt - 1];
        if (ms <= TimeoutMs && status < 400)
        {
            Console.WriteLine($"  attempt {attempt}: HTTP {status} in {ms} ms -> success");
            break;
        }

        bool transient = ms > TimeoutMs || status >= 500 || status == 408 || status == 429;
        string problem = ms > TimeoutMs ? $"timeout after {TimeoutMs} ms" : $"HTTP {status}";
        if (!transient)
        {
            Console.WriteLine($"  attempt {attempt}: {problem} -> not transient, no retry");
            break;
        }
        if (attempt > MaxRetries)
        {
            Console.WriteLine($"  attempt {attempt}: {problem} -> giving up");
            break;
        }

        int delay = BaseDelayMs * (1 << (attempt - 1));   // 200, 400, 800
        totalWait += delay;
        Console.WriteLine($"  attempt {attempt}: {problem} -> retry in {delay} ms");
    }
    Console.WriteLine($"  total backoff wait: {totalWait} ms");
}
`;

const breakerCode = `using System;

var breaker = new CircuitBreaker(failureThreshold: 3, breakSeconds: 30);

// (time in seconds, does the payment service answer correctly?)
var calls = new (int Time, bool ServiceOk)[]
{
    (0, true), (1, false), (2, false), (3, false),   // 3 failures in a row -> Open
    (10, true), (20, true),                          // Open: fail fast, service NOT called
    (34, false),                                     // break over -> Half-Open trial fails
    (40, true),                                      // Open again
    (65, true),                                      // Half-Open trial succeeds -> Closed
    (66, true)
};

foreach (var (time, ok) in calls)
    Console.WriteLine($"t={time,2}s {breaker.Call(time, ok)}");

class CircuitBreaker(int failureThreshold, int breakSeconds)
{
    private string state = "Closed";
    private int failures;
    private int openedAt;

    public string Call(int now, bool serviceOk)
    {
        if (state == "Open")
        {
            if (now - openedAt < breakSeconds)
                return "Open      -> rejected fast (BrokenCircuitException)";
            state = "HalfOpen";                 // break time is over: allow ONE trial call
        }

        string before = state;
        if (serviceOk)
        {
            failures = 0;
            state = "Closed";
            return $"{before,-10}-> success" + (before == "HalfOpen" ? ", circuit Closed" : "");
        }

        failures++;
        if (before == "HalfOpen")
        {
            state = "Open";
            openedAt = now;
            return $"{before,-10}-> trial call failed, circuit OPEN again for {breakSeconds}s";
        }
        if (failures >= failureThreshold)
        {
            state = "Open";
            openedAt = now;
            return $"{before,-10}-> failure {failures}, circuit OPEN for {breakSeconds}s";
        }
        return $"{before,-10}-> failure {failures}";
    }
}
`;

const httpResilienceCode = `// dotnet add package Microsoft.Extensions.Http.Resilience
// ===== Orders.Api/Program.cs =====
using Microsoft.Extensions.Http.Resilience;
using Polly;

var builder = WebApplication.CreateBuilder(args);

// OPTION 1: the standard pipeline (recommended starting point)
// rate limiter -> total timeout -> retry -> circuit breaker -> attempt timeout
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri("https://localhost:7101"))
    .AddStandardResilienceHandler(o =>
    {
        o.Retry.MaxRetryAttempts = 3;                                   // retries 5xx, 408, 429, timeouts
        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(2);             // each try
        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(10);       // whole operation incl. retries
        o.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(10);   // must be >= 2 x attempt timeout
        o.CircuitBreaker.FailureRatio = 0.5;                            // open if 50% of calls fail ...
        o.CircuitBreaker.MinimumThroughput = 10;                        // ... and at least 10 calls were made
        o.CircuitBreaker.BreakDuration = TimeSpan.FromSeconds(15);
    });

// OPTION 2: build your own pipeline for the payment gateway
builder.Services.AddHttpClient<PaymentClient>(c => c.BaseAddress = new Uri("https://pay.example.in"))
    .AddResilienceHandler("payments", pipeline =>
    {
        pipeline.AddTimeout(TimeSpan.FromSeconds(10));                  // total
        pipeline.AddRetry(new HttpRetryStrategyOptions
        {
            MaxRetryAttempts = 2,
            BackoffType = DelayBackoffType.Exponential,
            UseJitter = true,                                           // random spread avoids retry storms
            Delay = TimeSpan.FromMilliseconds(300)
        });
        pipeline.AddCircuitBreaker(new HttpCircuitBreakerStrategyOptions
        {
            FailureRatio = 0.5,
            MinimumThroughput = 5,
            SamplingDuration = TimeSpan.FromSeconds(30),
            BreakDuration = TimeSpan.FromSeconds(20)
        });
        pipeline.AddTimeout(TimeSpan.FromSeconds(3));                   // per attempt
    });

var app = builder.Build();

app.MapGet("/orders/{id:int}/product", async (int id, CatalogClient catalog) =>
{
    try
    {
        return Results.Ok(await catalog.GetProductAsync(id));
    }
    catch (Polly.CircuitBreaker.BrokenCircuitException)
    {
        return Results.Problem("Catalog is temporarily unavailable", statusCode: 503);
    }
});

app.Run();

public class CatalogClient(HttpClient http)
{
    public Task<ProductDto?> GetProductAsync(int id) =>
        http.GetFromJsonAsync<ProductDto>($"/api/products/{id}");
}
public class PaymentClient(HttpClient http) { /* ... */ }
public record ProductDto(int Id, string Name, decimal Price);

// ===== Polly v8 without HttpClient (e.g. around a SQL call) =====
// var pipeline = new ResiliencePipelineBuilder()
//     .AddRetry(new RetryStrategyOptions { MaxRetryAttempts = 3, Delay = TimeSpan.FromMilliseconds(200),
//                                          BackoffType = DelayBackoffType.Exponential,
//                                          ShouldHandle = new PredicateBuilder().Handle<SqlException>() })
//     .AddTimeout(TimeSpan.FromSeconds(5))
//     .Build();
// var students = await pipeline.ExecuteAsync(async ct => await db.Students.ToListAsync(ct), token);`;

const healthCode = `// dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore
// ===== Orders.Api/Program.cs =====
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Diagnostics.HealthChecks;

builder.Services.AddHealthChecks()
    .AddCheck("self", () => HealthCheckResult.Healthy("App is running"), tags: ["live"])
    .AddDbContextCheck<OrdersDb>("orders-db", tags: ["ready"])
    .AddCheck<PaymentGatewayHealthCheck>("payment-gateway", tags: ["ready"]);

builder.Services.AddHttpClient("payment-health", c => c.BaseAddress = new Uri("https://pay.example.in"));

// ... var app = builder.Build();

// Liveness: "is the process alive?" -> only cheap self checks, never the database
app.MapHealthChecks("/health/live", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("live")
});

// Readiness: "can I take traffic?" -> dependencies (DB, payment gateway)
app.MapHealthChecks("/health/ready", new HealthCheckOptions
{
    Predicate = check => check.Tags.Contains("ready"),
    ResponseWriter = async (ctx, report) =>
    {
        ctx.Response.ContentType = "application/json";
        await ctx.Response.WriteAsJsonAsync(new
        {
            status = report.Status.ToString(),
            checks = report.Entries.Select(e => new
            {
                name = e.Key,
                status = e.Value.Status.ToString(),
                description = e.Value.Description,
                ms = (int)e.Value.Duration.TotalMilliseconds
            })
        });
    }
});

app.MapHealthChecks("/health");        // all checks, plain text: Healthy / Degraded / Unhealthy

// ===== PaymentGatewayHealthCheck.cs =====
public class PaymentGatewayHealthCheck(IHttpClientFactory factory) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context,
                                                          CancellationToken ct = default)
    {
        try
        {
            var client = factory.CreateClient("payment-health");
            var sw = System.Diagnostics.Stopwatch.StartNew();
            using var res = await client.GetAsync("/ping", ct);
            if (!res.IsSuccessStatusCode)
                return HealthCheckResult.Unhealthy($"Gateway returned {(int)res.StatusCode}");
            return sw.ElapsedMilliseconds > 1000
                ? HealthCheckResult.Degraded($"Slow: {sw.ElapsedMilliseconds} ms")
                : HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Gateway unreachable", ex);
        }
    }
}

// ===== Kubernetes deployment.yaml (excerpt) =====
// livenessProbe:
//   httpGet: { path: /health/live, port: 8080 }
//   periodSeconds: 10
//   failureThreshold: 3          # restart the container after 3 failures
// readinessProbe:
//   httpGet: { path: /health/ready, port: 8080 }
//   periodSeconds: 5             # remove the pod from the load balancer while not ready`;

const observabilityCode = `// dotnet add package Serilog.AspNetCore
// dotnet add package Serilog.Sinks.Seq
// dotnet add package OpenTelemetry.Extensions.Hosting
// dotnet add package OpenTelemetry.Instrumentation.AspNetCore
// dotnet add package OpenTelemetry.Instrumentation.Http
// dotnet add package OpenTelemetry.Exporter.OpenTelemetryProtocol
//
// Seq (log server):   docker run -d --name seq -e ACCEPT_EULA=Y -e SEQ_FIRSTRUN_NOAUTHENTICATION=true -p 5341:5341 -p 8081:80 datalust/seq
//                     UI: http://localhost:8081   ingestion: http://localhost:5341
// Jaeger (traces):    docker run -d --name jaeger -p 16686:16686 -p 4317:4317 jaegertracing/all-in-one
//                     UI: http://localhost:16686  OTLP gRPC: http://localhost:4317

// ===== Orders.Api/Program.cs =====
using System.Diagnostics;
using System.Diagnostics.Metrics;
using OpenTelemetry.Metrics;
using OpenTelemetry.Resources;
using OpenTelemetry.Trace;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// 1. Serilog: structured logs to console + Seq
builder.Host.UseSerilog((ctx, services, cfg) => cfg
    .ReadFrom.Configuration(ctx.Configuration)          // levels from appsettings "Serilog" section
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "Orders.Api")
    .WriteTo.Console()
    .WriteTo.Seq("http://localhost:5341"));

// 2. OpenTelemetry: traces + metrics exported over OTLP (Jaeger, Aspire dashboard, Grafana, Azure Monitor)
builder.Services.AddOpenTelemetry()
    .ConfigureResource(r => r.AddService("Orders.Api"))
    .WithTracing(t => t
        .AddAspNetCoreInstrumentation()          // a span for every incoming request
        .AddHttpClientInstrumentation()          // a span for every outgoing HttpClient call
        .AddSource(OrdersTelemetry.SourceName)   // our own spans
        .AddOtlpExporter())                      // default endpoint http://localhost:4317
    .WithMetrics(m => m
        .AddAspNetCoreInstrumentation()          // request duration, active requests
        .AddHttpClientInstrumentation()
        .AddMeter(OrdersTelemetry.SourceName)    // our own counters
        .AddOtlpExporter());

var app = builder.Build();
app.UseSerilogRequestLogging();   // ONE summary log line per request

app.MapPost("/api/orders", (CreateOrder dto, ILogger<Program> log) =>
{
    using var activity = OrdersTelemetry.Source.StartActivity("PlaceOrder");   // custom span
    activity?.SetTag("order.customer_id", dto.CustomerId);

    int orderId = Random.Shared.Next(1000, 9999);
    // STRUCTURED: {OrderId}, {CustomerId}, {Amount} become searchable properties
    log.LogInformation("Order {OrderId} placed by customer {CustomerId} for {Amount} via {PaymentMode}",
                       orderId, dto.CustomerId, dto.Amount, dto.PaymentMode);

    OrdersTelemetry.OrdersPlaced.Add(1, new KeyValuePair<string, object?>("payment.mode", dto.PaymentMode));
    return Results.Created($"/api/orders/{orderId}", new { orderId });
});

app.Run();

public record CreateOrder(int CustomerId, decimal Amount, string PaymentMode);

public static class OrdersTelemetry
{
    public const string SourceName = "Orders.Api";
    public static readonly ActivitySource Source = new(SourceName);
    private static readonly Meter Meter = new(SourceName);
    public static readonly Counter<int> OrdersPlaced = Meter.CreateCounter<int>("orders.placed");
}

// ===== appsettings.json =====
// "Serilog": {
//   "MinimumLevel": { "Default": "Information",
//                     "Override": { "Microsoft.AspNetCore": "Warning", "System.Net.Http": "Warning" } }
// }`;

export default {
  id: 'day-21-resilience-health-checks-serilog-opentelemetry',
  title: 'Resilience and Observability: Polly Retry, Circuit Breaker and Timeout, Health Checks, Serilog with Seq, OpenTelemetry',
  module: 'Module 5: Microservices with .NET',
  day: 21,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'In microservices, network calls fail all the time. Make HttpClient calls resilient with Polly and Microsoft.Extensions.Http.Resilience (retry with backoff, circuit breaker, timeouts), expose liveness and readiness health checks, write structured logs with Serilog and search them in Seq, and trace one request across many services with OpenTelemetry traces and metrics.',
  objectives: [
    'Explain transient faults and apply retry with exponential backoff and jitter, circuit breaker and timeout',
    'Configure AddStandardResilienceHandler and a custom resilience pipeline on HttpClient',
    'Add health checks with separate liveness and readiness endpoints, including a custom IHealthCheck',
    'Write structured logs with Serilog and query them in Seq',
    'Explain the three pillars of observability and set up OpenTelemetry tracing and metrics in ASP.NET Core',
  ],
  theory: [
    {
      heading: 'Why resilience? Transient faults and cascading failures',
      content:
        'Inside one monolith, a method call never fails because of the network. In microservices, every call to another service can fail: a pod is restarting, a deployment is rolling out, the network drops packets, SQL Azure throttles you for a second, or the service is overloaded during a Big Billion Days sale.\n\nMany of these are **transient faults**: they disappear if you try again a moment later (HTTP 503, 408, 429, timeouts, connection reset). Others are **not transient**: a 400 Bad Request or 404 will fail every time, so retrying only wastes resources.\n\nWithout protection, failures **cascade**: Payment is slow -> Orders waits on Payment and its threads pile up -> the Gateway waits on Orders -> the whole site is down because one dependency was slow. Resilience patterns stop this chain.\n\n**Polly** is the standard .NET resilience library. Polly v8 uses **resilience pipelines** made of strategies (retry, circuit breaker, timeout, fallback, hedging, rate limiter). `Microsoft.Extensions.Http.Resilience` is Microsoft\'s package built on Polly v8 that plugs pipelines into `IHttpClientFactory` with one line.',
      points: [
        'Retry: try again for transient faults',
        'Timeout: never wait forever',
        'Circuit breaker: stop calling a service that is clearly down, fail fast, give it time to recover',
        'Fallback: return a default (cached prices, "recommendations unavailable") instead of an error',
        'Bulkhead / concurrency limiter: limit parallel calls so one dependency cannot use all resources',
      ],
    },
    {
      heading: 'Retry, exponential backoff and jitter',
      content:
        'A **retry** policy re-executes a failed call. Three rules make retries safe:\n\n1. **Retry only transient errors**: 5xx, 408, 429, timeouts and HttpRequestException. Never retry 400/401/403/404.\n2. **Back off exponentially**: wait 200 ms, then 400 ms, then 800 ms. Immediate retries hammer a service that is already struggling. Respect the `Retry-After` header on 429/503.\n3. **Add jitter**: random variation in delays so that 1,000 clients that failed at the same moment do not all retry at the same moment (a "retry storm" or thundering herd).\n\nAlso limit the attempts (3 is common) and make sure the operation is **idempotent**. Retrying GET is safe. Retrying POST /payments could charge a customer twice unless the API supports an idempotency key. The standard resilience handler retries all HTTP methods by default; disable retries for unsafe methods (POST, PATCH, DELETE) with `o.Retry.DisableForUnsafeHttpMethods()` unless the API supports idempotency keys.',
      syntax: `pipeline.AddRetry(new HttpRetryStrategyOptions
{
    MaxRetryAttempts = 3,
    BackoffType = DelayBackoffType.Exponential,
    UseJitter = true,
    Delay = TimeSpan.FromMilliseconds(200)
});`,
      tip: 'Interview trap: "Will you add retries to a payment POST?" Answer: only with an idempotency key so the server can detect duplicates; otherwise disable retries for unsafe methods.',
    },
    {
      heading: 'Circuit breaker and timeouts',
      content:
        'A **circuit breaker** works like the MCB in your home: when too many failures happen, it "trips" and stops current flowing.\n\n- **Closed**: normal state; calls go through and failures are counted.\n- **Open**: the failure ratio crossed the threshold (for example 50% of at least 10 calls in 30 seconds). For the break duration, calls are rejected immediately with `BrokenCircuitException` without touching the failing service. This gives it time to recover and keeps your threads free.\n- **Half-Open**: after the break duration, a trial call is allowed. Success -> Closed. Failure -> Open again.\n\nWhile the circuit is open, return a quick fallback ("payment service busy, please retry in a minute", cached data, or 503) instead of making users wait.\n\n**Timeouts**: HttpClient\'s default timeout is 100 seconds, far too long for service-to-service calls. Use two levels: an **attempt timeout** (each try, e.g. 2 s) and a **total timeout** (whole operation including retries, e.g. 10 s). In Polly the order of strategies matters: the outer total timeout wraps the retry, which wraps the circuit breaker, which wraps the attempt timeout.\n\n`AddStandardResilienceHandler()` gives a good default pipeline: rate limiter -> total timeout (30 s) -> retry (3 attempts, exponential with jitter) -> circuit breaker -> attempt timeout (10 s).',
      points: [
        'Polly v8 circuit breaker is ratio-based: FailureRatio, MinimumThroughput, SamplingDuration, BreakDuration',
        'CircuitBreaker.SamplingDuration must be at least twice the AttemptTimeout (validated at startup)',
        'Use AddStandardHedgingHandler for read-only calls to multiple replicas (sends a second request if the first is slow)',
      ],
    },
    {
      heading: 'Health checks: /health, liveness and readiness',
      content:
        'A health check endpoint tells load balancers, Kubernetes, Azure App Service and monitoring tools whether an instance is OK. ASP.NET Core has it built in: `builder.Services.AddHealthChecks()` and `app.MapHealthChecks("/health")`. The result is **Healthy** (HTTP 200), **Degraded** (200, working but slow or partly broken) or **Unhealthy** (HTTP 503). The overall status is the worst of all checks.\n\nKubernetes uses two different questions:\n- **Liveness** (`/health/live`): "Is the process alive or stuck?" If it fails, the container is **restarted**. Keep it cheap and do NOT check the database here: if SQL Server is down, restarting all API pods does not fix SQL Server and only makes things worse.\n- **Readiness** (`/health/ready`): "Can this instance handle traffic now?" Checks the database, cache and critical dependencies. If it fails, the pod is **removed from the load balancer** but not restarted. Useful during startup (warming caches, running migrations) and during dependency outages.\n- A **startup probe** can protect slow-starting apps from being killed by liveness checks.\n\nUse tags (`tags: ["ready"]`) and the `Predicate` option to choose which checks run on which endpoint. Write custom checks by implementing `IHealthCheck`. Ready-made checks for SQL Server, Redis, RabbitMQ, etc. are in the open-source AspNetCore.Diagnostics.HealthChecks packages (for example `AspNetCore.HealthChecks.SqlServer`).',
      tip: 'Do not expose detailed health JSON (connection info, exception messages) publicly. Keep detailed endpoints internal or protect them with RequireAuthorization / RequireHost.',
    },
    {
      heading: 'Structured logging with Serilog and Seq',
      content:
        'Plain text logs like `"Order 5012 placed by 42"` are hard to search across 20 services. **Structured logging** keeps the values as named properties: the message template `"Order {OrderId} placed by customer {CustomerId}"` produces both a readable message and properties `OrderId = 5012`, `CustomerId = 42`. You can then query `OrderId = 5012` or `Amount > 10000` across all services.\n\nRules: always use message templates with placeholders, never string interpolation (`$"Order {id}"` loses the properties and allocates even when the level is disabled). Use PascalCase property names, and never log passwords, OTPs, full card numbers or Aadhaar numbers.\n\n**Serilog** is the most popular structured logging library for .NET. It plugs into `ILogger<T>`, so your code does not change. **Sinks** send logs to destinations: Console, File (rolling), Seq, Elasticsearch, Azure Application Insights, Grafana Loki. **Enrichers** add properties to every event (Application name, MachineName, CorrelationId). `UseSerilogRequestLogging()` writes one clean summary line per HTTP request instead of many noisy framework lines.\n\n**Seq** is a log server with a web UI for structured logs: run it in Docker, point the Seq sink at it, and query with filters like `Application = \'Orders.Api\' and @Level = \'Error\'`.',
      syntax: `// good: structured
log.LogInformation("Order {OrderId} placed for {Amount}", order.Id, order.Total);
// bad: interpolated, properties lost
log.LogInformation($"Order {order.Id} placed for {order.Total}");`,
    },
    {
      heading: 'Observability with OpenTelemetry: traces, metrics and logs',
      content:
        '**Observability** means you can understand what is happening inside the system from the outside. It has three pillars:\n- **Logs**: detailed events ("payment failed for order 5012").\n- **Metrics**: numbers over time (requests per second, error rate, p95 latency, orders placed per minute). Cheap to store, great for dashboards and alerts.\n- **Traces**: the full path of ONE request across services. A **trace** has a TraceId; each unit of work (incoming request, HttpClient call, SQL query) is a **span** with a start time and duration. You can see "this checkout took 3.2 s, of which 2.9 s was spent in Payment".\n\n**OpenTelemetry (OTel)** is the vendor-neutral CNCF standard for collecting all three. You instrument once and export with **OTLP** to any backend: Jaeger, Zipkin, Grafana Tempo/Prometheus, Seq, the .NET Aspire dashboard, Azure Monitor, Datadog or New Relic.\n\nIn .NET, OTel builds on built-in APIs: `System.Diagnostics.ActivitySource`/`Activity` for spans and `System.Diagnostics.Metrics.Meter` for metrics. Instrumentation packages create spans automatically for ASP.NET Core, HttpClient, gRPC, EF Core and SQL Client. **Context propagation**: HttpClient adds the W3C `traceparent` header to outgoing calls, so the next service continues the same trace. Logs written inside a request automatically carry the TraceId, so you can jump from a trace to its logs.',
      points: [
        'Trace -> spans (parent/child); TraceId is shared across all services for one request',
        'Metric types: Counter (only goes up), Histogram (durations, sizes), UpDownCounter, Gauge',
        '.NET Aspire ServiceDefaults configures OpenTelemetry for you and the Aspire dashboard shows it',
        'Sampling: keep 100% of traces in dev, a percentage in production to control cost',
      ],
    },
  ],
  examples: [
    {
      title: 'Retry with exponential backoff, only for transient faults',
      scenario:
        'The Orders service calls a payment API. Simulate three situations: the API recovers after a timeout and a 503, the API is completely down, and the request itself is wrong (404). See which ones are retried and how long the backoff waits are.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it RetryDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Change MaxRetries to 2 and predict the output of the "Payment API is down" scenario',
      ],
      code: retryCode,
      csharp: { files: { 'Program.cs': retryCode }, stdin: '' },
      result: `== Payment API recovers ==
  attempt 1: timeout after 1000 ms -> retry in 200 ms
  attempt 2: HTTP 503 -> retry in 400 ms
  attempt 3: HTTP 200 in 300 ms -> success
  total backoff wait: 600 ms
== Payment API is down ==
  attempt 1: HTTP 503 -> retry in 200 ms
  attempt 2: HTTP 503 -> retry in 400 ms
  attempt 3: HTTP 503 -> retry in 800 ms
  attempt 4: HTTP 503 -> giving up
  total backoff wait: 1400 ms
== Wrong order id ==
  attempt 1: HTTP 404 -> not transient, no retry
  total backoff wait: 0 ms`,
      explanation:
        'The delay is BaseDelayMs * 2^(attempt-1): 200, 400, 800 (1 << n is 2 to the power n). The first call takes 1500 ms, more than the 1000 ms timeout, so it counts as a transient failure. After MaxRetries (3) retries, the 4th attempt gives up and the error goes to the caller (where a circuit breaker or fallback can handle it). A 404 is not transient, so retrying is pointless. Polly does exactly this, plus random jitter on the delays.',
    },
    {
      title: 'Circuit breaker states: Closed, Open, Half-Open',
      scenario:
        'Build a tiny circuit breaker to see the state machine Polly uses: after 3 consecutive failures it opens for 30 seconds, rejects calls quickly, then lets one trial call through.',
      steps: [
        'Create a Console App named CircuitBreakerDemo (.NET 8+, it uses a primary constructor)',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Trace t=34 on paper: 34 - 3 = 31 seconds have passed, so the breaker moves to Half-Open',
      ],
      code: breakerCode,
      csharp: { files: { 'Program.cs': breakerCode }, stdin: '' },
      result: `t= 0s Closed    -> success
t= 1s Closed    -> failure 1
t= 2s Closed    -> failure 2
t= 3s Closed    -> failure 3, circuit OPEN for 30s
t=10s Open      -> rejected fast (BrokenCircuitException)
t=20s Open      -> rejected fast (BrokenCircuitException)
t=34s HalfOpen  -> trial call failed, circuit OPEN again for 30s
t=40s Open      -> rejected fast (BrokenCircuitException)
t=65s HalfOpen  -> success, circuit Closed
t=66s Closed    -> success`,
      explanation:
        'At t=10 and t=20 the service may actually be fine, but the breaker does not even try: it fails fast until 30 seconds pass. At t=34 the trial call fails, so the circuit opens again with a new start time of 34. At t=65 (31 seconds later) the trial succeeds and the circuit closes. {before,-10} left-aligns the state in 10 characters. Polly v8 uses a failure RATIO over a sampling window instead of consecutive failures, but the three states work the same way.',
    },
    {
      title: 'HttpClient resilience with Microsoft.Extensions.Http.Resilience',
      scenario:
        'Orders.Api calls Catalog (use the standard pipeline) and an external payment gateway (custom pipeline with fewer retries). When the Catalog circuit is open, return a clean 503 ProblemDetails.',
      steps: [
        'In Orders.Api run: dotnet add package Microsoft.Extensions.Http.Resilience',
        'Register the typed clients with AddStandardResilienceHandler and AddResilienceHandler as shown',
        'Run Catalog and Orders, then stop Catalog and call GET /orders/1/product repeatedly from Postman',
        'Watch the console: retries are logged by Polly; after enough failures the circuit opens and you get 503 immediately',
      ],
      code: httpResilienceCode,
      result: `Catalog running:   GET /orders/1/product -> 200 {"id":1,"name":"Wireless Mouse","price":599}
Catalog stopped:   first calls take a few seconds (3 retries with backoff) -> 503
                   console: warn: Polly[3] Execution attempt. Source: 'CatalogClient-standard//Standard-Retry' ... Result: 'Connection refused'
After circuit opens (failure ratio reached): -> 503 in about 1 ms
                   {"type":"https://tools.ietf.org/html/rfc9110#section-15.6.4","title":"Service Unavailable","status":503,"detail":"Catalog is temporarily unavailable", ...}`,
      explanation:
        'AddStandardResilienceHandler wraps the HttpClient in a ready pipeline. Only the options we change are overridden. The custom "payments" pipeline is ordered outer to inner: total timeout, retry, circuit breaker, attempt timeout; so each retry gets its own 3 s budget but everything stops after 10 s. When the breaker is open, Polly throws BrokenCircuitException without opening a connection, and we turn it into a fast 503.',
    },
    {
      title: 'Health checks with liveness and readiness endpoints',
      scenario:
        'Kubernetes must restart a frozen Orders pod but must NOT restart pods just because SQL Server is down. Expose /health/live (self only) and /health/ready (database + payment gateway), with a JSON report.',
      steps: [
        'dotnet add package Microsoft.Extensions.Diagnostics.HealthChecks.EntityFrameworkCore',
        'Register the checks with tags and map the three endpoints as shown',
        'Add PaymentGatewayHealthCheck.cs implementing IHealthCheck',
        'Press F5 and open /health/live and /health/ready in the browser',
        'Stop SQL Server (services.msc > SQL Server (MSSQLSERVER) > Stop) and refresh both endpoints',
      ],
      code: healthCode,
      result: `GET /health/live   -> 200  Healthy
GET /health/ready  -> 200
{"status":"Healthy","checks":[{"name":"orders-db","status":"Healthy","description":null,"ms":12},
                              {"name":"payment-gateway","status":"Healthy","description":null,"ms":85}]}

After stopping SQL Server:
GET /health/live   -> 200  Healthy          (pod is NOT restarted)
GET /health/ready  -> 503
{"status":"Unhealthy","checks":[{"name":"orders-db","status":"Unhealthy","description":null,"ms":2004}, ...]}`,
      explanation:
        'Predicate filters checks by tag, so liveness runs only "self". AddDbContextCheck runs a small query through the DbContext (CanConnectAsync). The overall status is the worst entry, and Unhealthy maps to HTTP 503, which Kubernetes and load balancers understand. The custom check returns Degraded when the gateway is slow: still HTTP 200, but visible in monitoring.',
    },
    {
      title: 'Serilog to Seq and OpenTelemetry traces and metrics',
      scenario:
        'Support asks: "Why did order 5012 take 3 seconds?" Add structured logging to Seq and OpenTelemetry tracing so you can find the order\'s logs and see where the time went across services.',
      steps: [
        'Start Seq and Jaeger with the docker run commands at the top of the code',
        'Add the NuGet packages listed and replace Program.cs',
        'Press F5 and POST /api/orders with {"customerId": 42, "amount": 2499.50, "paymentMode": "UPI"}',
        'Open Seq at http://localhost:8081 and search: OrderId = 5012 (use the id you got back)',
        'Open Jaeger at http://localhost:16686, choose service Orders.Api and click Find Traces',
      ],
      code: observabilityCode,
      result: `Console:
[10:15:02 INF] Order 5012 placed by customer 42 for 2499.50 via UPI
[10:15:02 INF] HTTP POST /api/orders responded 201 in 18.4211 ms

Seq event properties:
  OrderId 5012  CustomerId 42  Amount 2499.50  PaymentMode "UPI"
  Application "Orders.Api"  TraceId 4bf92f3577b34da6a3ce929d0e0e4736  SpanId 00f067aa0ba902b7

Jaeger trace 4bf92f35...:
  Orders.Api  POST /api/orders     18 ms
    Orders.Api  PlaceOrder          2 ms   tag order.customer_id=42`,
      explanation:
        'The message template keeps OrderId, CustomerId, Amount and PaymentMode as separate properties, so Seq can filter on them. Serilog adds TraceId and SpanId from the current Activity, linking logs to the trace. AddAspNetCoreInstrumentation creates the root span; StartActivity creates the child PlaceOrder span (it returns null if nobody listens, hence activity?.). If this endpoint called Payment with HttpClient, the traceparent header would carry the TraceId and Payment\'s spans would appear under the same trace. The order id is random, so your numbers will differ.',
    },
  ],
  interview: [
    { q: 'What is a transient fault? Give examples.', a: 'A temporary failure that is likely to succeed if retried after a short time: HTTP 503, 408, 429, timeouts, connection resets, SQL deadlocks or throttling. Validation errors (400) or not found (404) are not transient.', level: 'Easy' },
    { q: 'Why use exponential backoff and jitter in retries?', a: 'Exponential backoff increases the wait (200, 400, 800 ms) so a struggling service gets time to recover. Jitter adds randomness so many clients that failed together do not retry at the same instant and cause a retry storm.', level: 'Medium' },
    { q: 'Explain the circuit breaker states.', a: 'Closed: calls pass and failures are tracked. Open: after the failure threshold, calls are rejected immediately (BrokenCircuitException) for the break duration. Half-Open: after the break, trial calls are allowed; success closes the circuit, failure opens it again.', level: 'Medium' },
    { q: 'Retry vs circuit breaker: why do you need both?', a: 'Retry handles short glitches by trying again. If the dependency is really down, retries multiply load and waiting. The circuit breaker detects a sustained failure and stops calls completely for a while, failing fast and letting the service recover.', level: 'Medium' },
    { q: 'What does AddStandardResilienceHandler configure?', a: 'A Polly v8 pipeline on the HttpClient: concurrency rate limiter, total request timeout (30 s), retry (3 attempts, exponential backoff with jitter, for 5xx/408/429/timeouts), circuit breaker (failure ratio based) and per-attempt timeout (10 s). All options can be customised.', level: 'Hard' },
    { q: 'Is it safe to retry a POST request?', a: 'Not by default, because it is not idempotent: retrying a payment could charge twice. Use an idempotency key that the server stores to detect duplicates, or disable retries for unsafe methods (o.Retry.DisableForUnsafeHttpMethods()).', level: 'Hard' },
    { q: 'Difference between liveness and readiness probes?', a: 'Liveness answers "is the process alive?"; failure makes Kubernetes restart the container, so it must be cheap and not depend on external systems. Readiness answers "can it serve traffic now?"; it checks dependencies and failure only removes the pod from load balancing.', level: 'Medium' },
    { q: 'What HTTP status codes do ASP.NET Core health checks return?', a: 'Healthy and Degraded return 200, Unhealthy returns 503 by default (configurable with ResultStatusCodes). The overall status is the worst status among the executed checks.', level: 'Medium' },
    { q: 'What is structured logging and why is it better?', a: 'Logging with message templates whose placeholders become named properties (OrderId = 5012) instead of a flat string. Logs can be filtered, aggregated and correlated by property across services in tools like Seq, Elasticsearch or Application Insights.', level: 'Easy' },
    { q: 'Why should you not use string interpolation in log calls?', a: 'With $"..." the values are baked into a string, so the properties are lost for querying, and the string is built even when the log level is disabled. Use templates: LogInformation("Order {OrderId}", id).', level: 'Medium' },
    { q: 'What are sinks and enrichers in Serilog?', a: 'Sinks are destinations for log events (Console, File, Seq, Elasticsearch, Application Insights). Enrichers add properties to every event automatically (Application name, MachineName, ThreadId, CorrelationId, values from LogContext).', level: 'Easy' },
    { q: 'What are the three pillars of observability?', a: 'Logs (discrete events with details), metrics (numeric measurements aggregated over time for dashboards and alerts), and traces (end-to-end path of a request across services made of spans).', level: 'Easy' },
    { q: 'What is OpenTelemetry and how is it used in .NET?', a: 'A vendor-neutral standard and SDK for traces, metrics and logs. In .NET you call AddOpenTelemetry().WithTracing(...).WithMetrics(...), add instrumentation (AspNetCore, HttpClient, EF Core), your own ActivitySource and Meter, and export via OTLP to Jaeger, Prometheus/Grafana, Aspire dashboard or Azure Monitor.', level: 'Medium' },
    { q: 'How does a trace continue from one service to another?', a: 'Context propagation: the HttpClient (or gRPC) instrumentation adds the W3C traceparent header containing TraceId and parent SpanId. The receiving ASP.NET Core instrumentation reads it and creates its span as a child, so all spans share one TraceId.', level: 'Hard' },
    { q: 'What is the difference between a trace and a span?', a: 'A trace represents a whole request end to end and has one TraceId. A span is one timed operation inside it (an incoming request, an HTTP call, a DB query) with a SpanId, parent span, duration and tags. A trace is a tree of spans.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Configure the standard resilience handler for a WeatherClient so that it retries at most 2 times, each attempt times out after 1 second, and the whole call after 5 seconds.',
      hint: 'Set o.Retry.MaxRetryAttempts, o.AttemptTimeout.Timeout, o.TotalRequestTimeout.Timeout. Remember the sampling duration rule.',
      solution: `builder.Services.AddHttpClient<WeatherClient>(c => c.BaseAddress = new Uri("https://api.weather.example"))
    .AddStandardResilienceHandler(o =>
    {
        o.Retry.MaxRetryAttempts = 2;
        o.AttemptTimeout.Timeout = TimeSpan.FromSeconds(1);
        o.TotalRequestTimeout.Timeout = TimeSpan.FromSeconds(5);
        o.CircuitBreaker.SamplingDuration = TimeSpan.FromSeconds(5); // >= 2 x attempt timeout
    });`,
    },
    {
      task: 'Write a custom health check RedisCacheHealthCheck that returns Healthy when a PING succeeds, Degraded when it takes more than 200 ms, and Unhealthy on exception. Register it with the "ready" tag.',
      hint: 'Implement IHealthCheck; inject IConnectionMultiplexer (StackExchange.Redis); PingAsync returns a TimeSpan.',
      solution: `public class RedisCacheHealthCheck(IConnectionMultiplexer redis) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken ct = default)
    {
        try
        {
            TimeSpan latency = await redis.GetDatabase().PingAsync();
            return latency.TotalMilliseconds > 200
                ? HealthCheckResult.Degraded($"Redis slow: {latency.TotalMilliseconds:0} ms")
                : HealthCheckResult.Healthy();
        }
        catch (Exception ex)
        {
            return HealthCheckResult.Unhealthy("Redis unreachable", ex);
        }
    }
}

builder.Services.AddHealthChecks().AddCheck<RedisCacheHealthCheck>("redis", tags: ["ready"]);`,
    },
    {
      task: 'Configure Serilog from appsettings.json only (no code-based sinks): Console and a daily rolling file logs/orders-.txt, with Microsoft.AspNetCore at Warning.',
      hint: 'Serilog.Settings.Configuration is included in Serilog.AspNetCore; you also need Serilog.Sinks.File.',
      solution: `// Program.cs
builder.Host.UseSerilog((ctx, services, cfg) => cfg.ReadFrom.Configuration(ctx.Configuration));

// appsettings.json
"Serilog": {
  "Using": [ "Serilog.Sinks.Console", "Serilog.Sinks.File" ],
  "MinimumLevel": {
    "Default": "Information",
    "Override": { "Microsoft.AspNetCore": "Warning" }
  },
  "WriteTo": [
    { "Name": "Console" },
    { "Name": "File", "Args": { "path": "logs/orders-.txt", "rollingInterval": "Day" } }
  ],
  "Enrich": [ "FromLogContext" ]
}`,
    },
    {
      task: 'Add a custom histogram metric "orders.amount" (in rupees) and record each order amount with the payment mode as a tag.',
      hint: 'Meter.CreateHistogram<double>; Record(value, tag).',
      solution: `public static readonly Histogram<double> OrderAmount =
    Meter.CreateHistogram<double>("orders.amount", unit: "INR", description: "Order value");

// in the endpoint
OrdersTelemetry.OrderAmount.Record((double)dto.Amount,
    new KeyValuePair<string, object?>("payment.mode", dto.PaymentMode));
// .WithMetrics(m => m.AddMeter("Orders.Api")) already exports it`,
    },
    {
      task: 'Explain in 4-5 lines what you would check, in order, when users say "checkout is slow since 11 am".',
      hint: 'Metrics first, then traces, then logs.',
      solution: `1. Metrics dashboard: p95 latency and error rate of the checkout endpoint and its dependencies since 11:00.
2. Traces: open slow checkout traces and see which span takes the time (Payment? SQL query? Catalog?).
3. Logs: filter Seq by the TraceId of a slow trace (or by Application and @Level = 'Warning'/'Error') to read details.
4. Health/circuit breaker: check /health/ready of the suspected service and whether its circuit is open.
5. Correlate with deployments or config changes made around 11:00.`,
    },
  ],
  quiz: [
    {
      question: 'Which response should a retry policy NOT retry?',
      options: ['503 Service Unavailable', '429 Too Many Requests', '400 Bad Request', 'A request timeout'],
      answer: 2,
      explanation: '400 means the request itself is wrong; it will fail again every time. The others are transient.',
    },
    {
      question: 'While a circuit breaker is Open, what happens to new calls?',
      options: [
        'They are queued until the service recovers',
        'They fail immediately without calling the service',
        'They are retried 3 times',
        'They go to a different service automatically',
      ],
      answer: 1,
      explanation: 'Failing fast protects your threads and gives the failing service time to recover. Polly throws BrokenCircuitException.',
    },
    {
      question: 'Why should the liveness probe NOT check the database?',
      options: [
        'Database checks are not supported in ASP.NET Core',
        'Liveness probes cannot return 503',
        'The database password would be exposed',
        'If the DB is down, Kubernetes would restart all API pods, which does not fix the DB',
      ],
      answer: 3,
      explanation: 'Liveness failures trigger restarts. Dependency problems belong to readiness, which only takes the pod out of the load balancer.',
    },
    {
      question: 'Which log call is correctly structured?',
      options: [
        'log.LogInformation("Order {OrderId} paid", orderId);',
        'log.LogInformation($"Order {orderId} paid");',
        'log.LogInformation("Order " + orderId + " paid");',
        'Console.WriteLine($"Order {orderId} paid");',
      ],
      answer: 0,
      explanation: 'Only the message template keeps OrderId as a searchable property.',
    },
    {
      question: 'In OpenTelemetry, what links spans from different services into one trace?',
      options: [
        'The same log file',
        'A shared database table',
        'The TraceId propagated in the W3C traceparent header',
        'The machine name',
      ],
      answer: 2,
      explanation: 'Instrumented HttpClient/gRPC calls send traceparent; the next service continues the same TraceId.',
    },
  ],
};
