export default {
  lesson: 'day-19-api-gateway-yarp-service-discovery-aspire',
  minutes: 25,
  intro: 'Configure a YARP gateway in your head: routes, clusters, load balancing, auth and rate limiting, then connect services with service discovery and .NET Aspire.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'In YARP\'s `ReverseProxy` configuration, what does a **cluster** contain?',
      options: [
        'The path pattern that incoming requests must match',
        'The destinations (instance addresses) of one service plus load balancing and health check settings',
        'The JWT signing key',
        'The list of Angular routes',
      ],
      answer: 1,
      explain: 'A **route** matches requests (Match.Path, methods, headers) and points to a ClusterId. The **cluster** holds the Destinations and decides how to pick one (LoadBalancingPolicy) and how to check health. Mixing up the two is the most common YARP config mistake.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the gateway\'s Program.cs so that matching requests are forwarded to the clusters:
\`\`\`csharp
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
var app = builder.Build();
app.UseAuthentication();
app.UseAuthorization();
app.______();
app.Run();
\`\`\``,
      example: { title: 'Similar endpoint mapping', code: 'app.MapControllers();\napp.MapHealthChecks("/health");' },
      accept: ['MapReverseProxy', 'MapReverseProxy()'],
      caseSensitive: true,
      explain: '`AddReverseProxy()` registers YARP\'s services, but nothing is proxied until `app.MapReverseProxy()` adds the proxy endpoints to the routing table. Because it is a normal endpoint, authorization and rate limiting middleware run before it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A cluster has three destinations and uses RoundRobin. The active health check has marked **api-1** unhealthy. Write the output.',
      example: { title: 'Modulo cycles through an array', code: 'int next = 0;\nnext = (next + 1) % 3;   // 1, 2, 0, 1, ...' },
      code: `string[] all = { "api-1", "api-2", "api-3" };
var healthy = all.Where(d => d != "api-1").ToArray();
int next = 0;
for (int r = 1; r <= 3; r++)
{
    Console.WriteLine($"{r} -> {healthy[next]}");
    next = (next + 1) % healthy.Length;
}`,
      expected: `1 -> api-2
2 -> api-3
3 -> api-2`,
      explain: 'Unhealthy destinations are removed from load balancing, so only api-2 and api-3 remain and RoundRobin alternates between them. When api-1 passes its health checks again it rejoins the rotation.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The gateway uses a **fixed window** limiter: 2 requests per 10-second window (windows are 0-9 s, 10-19 s, ...), no queue, rejection code 429. One client sends requests at seconds **1, 2, 3, 9, 10, 11, 12**. Write the status code of each request, one per line.',
      example: { title: 'Limiter setup', code: `o.RejectionStatusCode = 429;
o.AddFixedWindowLimiter("api", w =>
{
    w.PermitLimit = 2;
    w.Window = TimeSpan.FromSeconds(10);
    w.QueueLimit = 0;
});` },
      code: 'Requests at: 1, 2, 3, 9 (window 0-9 s) and 10, 11, 12 (window 10-19 s)',
      expected: `200
200
429
429
200
200
429`,
      explain: 'In the first window only the requests at 1 s and 2 s fit; 3 s and 9 s are rejected. At 10 s a new window starts and the counter resets, so 10 s and 11 s pass and 12 s is rejected. Remember to set RejectionStatusCode, because the default is 503.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which responsibilities belong in an **API gateway**? Select all that apply.',
      options: [
        'Validating JWTs and rejecting unauthenticated requests early',
        'Calculating GST and discounts for an order',
        'Rate limiting per client or API key',
        'Routing /catalog/* and /orders/* to the right internal services',
        'Running EF Core migrations for every service',
      ],
      answers: [0, 2, 3],
      explain: 'Gateways handle **cross-cutting edge concerns**: routing, authentication, rate limiting, CORS, SSL termination, logging. Business rules (prices, GST) belong in the owning service, and each service manages its own database. A gateway full of business logic becomes a bottleneck and a new monolith.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `In a .NET Aspire AppHost, give Catalog the connection string of the SQL database:
\`\`\`csharp
var db = builder.AddSqlServer("sql").AddDatabase("catalogdb");
builder.AddProject<Projects.Catalog_Api>("catalog-api")
       .______(db)
       .WaitFor(db);
\`\`\``,
      example: { title: 'Another AppHost line', code: 'builder.AddProject<Projects.Gateway>("gateway").WithExternalHttpEndpoints();' },
      accept: ['WithReference'],
      caseSensitive: true,
      explain: '`WithReference(db)` injects `ConnectionStrings__catalogdb` into the Catalog process; for a project reference it injects service discovery endpoints instead. `WaitFor(db)` only controls start order, it does not pass any connection information.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A YARP cluster has no `LoadBalancingPolicy` set. Which policy is used?',
      options: ['RoundRobin', 'PowerOfTwoChoices', 'FirstAlphabetical', 'Random'],
      answer: 1,
      explain: '**PowerOfTwoChoices** is the default: pick two random destinations and send the request to the one with fewer active requests. It balances load well without scanning every destination. Set RoundRobin or LeastRequests explicitly when you need them.',
    },
  ],
};
