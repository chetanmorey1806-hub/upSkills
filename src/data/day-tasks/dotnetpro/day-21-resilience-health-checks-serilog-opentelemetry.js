export default {
  lesson: 'day-21-resilience-health-checks-serilog-opentelemetry',
  minutes: 30,
  intro: 'Trace retry backoff and circuit breaker states, configure HttpClient resilience, design liveness and readiness checks, and write structured logs and traces correctly.',
  tasks: [
    {
      type: 'multi',
      mins: 3,
      q: 'The Orders service calls the Payment API. Which failures are **transient** and worth retrying? Select all that apply.',
      options: [
        '503 Service Unavailable',
        '400 Bad Request (invalid card number format)',
        'Request timeout after 2 seconds',
        '429 Too Many Requests',
        '404 Not Found (order id does not exist)',
      ],
      answers: [0, 2, 3],
      explain: '503, timeouts and 429 are temporary conditions that often succeed a moment later (respect Retry-After for 429). 400 and 404 are caused by the request itself and will fail every time, so retrying just adds load and delay.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this exponential backoff loop print?',
      example: { title: 'Powers of two', code: 'Math.Pow(2, 0) = 1, Math.Pow(2, 1) = 2, Math.Pow(2, 2) = 4' },
      code: `int baseDelayMs = 100;
int total = 0;
for (int attempt = 1; attempt <= 3; attempt++)
{
    int delay = baseDelayMs * (int)Math.Pow(2, attempt - 1);
    total += delay;
    Console.WriteLine($"retry {attempt} after {delay} ms");
}
Console.WriteLine($"total {total} ms");`,
      expected: `retry 1 after 100 ms
retry 2 after 200 ms
retry 3 after 400 ms
total 700 ms`,
      explain: 'The delay doubles each time: 100 x 1, 100 x 2, 100 x 4, adding up to 700 ms. Real policies (Polly UseJitter = true) add a random spread to these numbers so many clients do not retry at the same moment.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A simplified circuit breaker opens after **2** failures and stays open for **10** seconds, then allows a trial call (Half-Open). Write the output.',
      example: { title: 'States', text: 'Closed: calls go through. Open: calls are rejected without calling the service. Half-Open: one trial call decides Closed or Open.' },
      code: `string state = "Closed"; int failures = 0; int openedAt = 0;
var calls = new (int T, bool Ok)[] { (0, false), (1, false), (5, true), (12, true) };

foreach (var (t, ok) in calls)
{
    if (state == "Open" && t - openedAt < 10) { Console.WriteLine($"{t}: rejected"); continue; }
    if (state == "Open") state = "HalfOpen";
    if (ok) { failures = 0; state = "Closed"; Console.WriteLine($"{t}: success, {state}"); }
    else
    {
        failures++;
        if (failures >= 2 || state == "HalfOpen") { state = "Open"; openedAt = t; }
        Console.WriteLine($"{t}: failure, {state}");
    }
}`,
      expected: `0: failure, Closed
1: failure, Open
5: rejected
12: success, Closed`,
      explain: 'The second failure (t=1) opens the circuit. At t=5 only 4 seconds have passed, so the call is rejected immediately even though the service might be fine (fail fast). At t=12, 11 seconds have passed: the breaker goes Half-Open, the trial succeeds and the circuit closes.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Add Microsoft\'s ready-made pipeline (rate limiter, total timeout, retry, circuit breaker, attempt timeout) to a typed HttpClient:
\`\`\`csharp
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri("https://catalog"))
    .______();
\`\`\``,
      example: { title: 'Custom pipeline instead', code: '.AddResilienceHandler("payments", p => { p.AddRetry(new HttpRetryStrategyOptions()); });' },
      accept: ['AddStandardResilienceHandler', 'AddStandardResilienceHandler()'],
      caseSensitive: true,
      explain: '`AddStandardResilienceHandler()` from Microsoft.Extensions.Http.Resilience wraps the client in a Polly v8 pipeline with sensible defaults; pass a lambda to change options such as Retry.MaxRetryAttempts or AttemptTimeout.Timeout.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'SQL Server goes down for 5 minutes. You want Kubernetes to **stop sending traffic** to the API pods but **not restart** them. Where should the database health check be registered?',
      options: [
        'Only on the liveness endpoint (/health/live)',
        'Only on the readiness endpoint (/health/ready)',
        'On both endpoints',
        'Nowhere; health checks cannot check databases',
      ],
      answer: 1,
      explain: 'A failing **readiness** probe removes the pod from the load balancer without restarting it. If the database check were on **liveness**, Kubernetes would restart every pod again and again, which does not fix SQL Server and slows recovery.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'ASP.NET Core\'s health check enum is `Unhealthy = 0, Degraded = 1, Healthy = 2`, and the overall status is the **worst** entry. What is printed?',
      example: { title: 'Default status codes', code: 'Healthy   -> 200\nDegraded  -> 200\nUnhealthy -> 503' },
      code: `var results = new[] { HealthStatus.Healthy, HealthStatus.Degraded, HealthStatus.Healthy };
var overall = results.Min();
int http = overall == HealthStatus.Unhealthy ? 503 : 200;
Console.WriteLine(overall);
Console.WriteLine(http);`,
      expected: `Degraded
200`,
      explain: 'The lowest enum value is the worst status, so Min() gives Degraded. Degraded still returns HTTP 200 by default (the app works, maybe slowly), so load balancers keep sending traffic while monitoring shows the warning. Only Unhealthy returns 503.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which log line keeps **OrderId** and **Amount** as searchable properties in Seq?',
      options: [
        'log.LogInformation($"Order {orderId} paid {amount}");',
        'log.LogInformation("Order " + orderId + " paid " + amount);',
        'log.LogInformation("Order {OrderId} paid {Amount}", orderId, amount);',
        'Console.WriteLine($"Order {orderId} paid {amount}");',
      ],
      answer: 2,
      explain: 'Only a **message template** with placeholders and separate arguments produces structured properties. Interpolation and concatenation bake the values into one string, so you cannot filter `OrderId = 5012`, and the string is built even when the level is disabled.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'OpenTelemetry continues the same trace in the next service by sending a W3C HTTP header that carries the TraceId and parent span id. What is the header name?',
      example: { title: 'Its format', code: '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01' },
      accept: ['traceparent', 'traceparent header'],
      explain: 'HttpClient and gRPC instrumentation add `traceparent` automatically; the receiving ASP.NET Core app reads it and creates its spans as children. That is how Jaeger or the Aspire dashboard shows one request across many services.',
    },
  ],
};
