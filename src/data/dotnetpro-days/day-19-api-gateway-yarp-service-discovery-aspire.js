const yarpProgram = `// ===== Gateway/Gateway.csproj =====
// dotnet new web -n Gateway
// cd Gateway
// dotnet add package Yarp.ReverseProxy
// dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer

// ===== Gateway/Program.cs =====
using System.Text;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// 1. YARP reads routes and clusters from appsettings.json ("ReverseProxy" section)
builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));

// 2. Authentication at the gateway: validate the JWT ONCE, at the edge
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateLifetime = true,
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
        };
    });

// 3. Named authorization policy used by a route ("AuthorizationPolicy": "customer")
builder.Services.AddAuthorization(o =>
    o.AddPolicy("customer", p => p.RequireAuthenticatedUser().RequireRole("Customer")));

// 4. Rate limiting: 100 requests per minute per client IP
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("per-ip", httpContext =>
        RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new FixedWindowRateLimiterOptions
            {
                PermitLimit = 100,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapGet("/", () => "ShopKart API Gateway is running");
app.MapReverseProxy();          // all matching requests are forwarded to the clusters

app.Run();`;

const yarpConfig = `// ===== Gateway/appsettings.json =====
{
  "Jwt": { "Issuer": "shopkart-auth", "Audience": "shopkart-api", "Key": "a-very-long-development-only-secret-key-123456" },
  "ReverseProxy": {
    "Routes": {
      "catalog-route": {
        "ClusterId": "catalog-cluster",
        "RateLimiterPolicy": "per-ip",
        "Match": { "Path": "/catalog/{**catch-all}" },
        "Transforms": [ { "PathPattern": "/api/products/{**catch-all}" } ]
      },
      "orders-route": {
        "ClusterId": "orders-cluster",
        "AuthorizationPolicy": "customer",
        "RateLimiterPolicy": "per-ip",
        "Match": { "Path": "/orders/{**catch-all}", "Methods": [ "GET", "POST" ] },
        "Transforms": [
          { "PathPattern": "/api/orders/{**catch-all}" },
          { "RequestHeader": "X-Forwarded-By", "Set": "shopkart-gateway" }
        ]
      }
    },
    "Clusters": {
      "catalog-cluster": {
        "LoadBalancingPolicy": "RoundRobin",
        "HealthCheck": {
          "Active": { "Enabled": "true", "Interval": "00:00:10", "Timeout": "00:00:05",
                      "Policy": "ConsecutiveFailures", "Path": "/health" }
        },
        "Destinations": {
          "catalog-1": { "Address": "http://localhost:5101/" },
          "catalog-2": { "Address": "http://localhost:5102/" }
        }
      },
      "orders-cluster": {
        "LoadBalancingPolicy": "LeastRequests",
        "Destinations": {
          "orders-1": { "Address": "http://localhost:5201/" }
        }
      }
    }
  }
}

// ===== Requests through the gateway (port 5000) =====
// GET  http://localhost:5000/catalog/7          -> http://localhost:5101/api/products/7   (or 5102, round robin)
// GET  http://localhost:5000/orders/15          -> 401 Unauthorized  (no token)
// GET  http://localhost:5000/orders/15
//      Authorization: Bearer eyJhbGciOi...      -> http://localhost:5201/api/orders/15
// 101st request in one minute from the same IP -> 429 Too Many Requests`;

const lbCode = `using System;
using System.Collections.Generic;
using System.Linq;

var destinations = new[] { "catalog-1", "catalog-2", "catalog-3" };

Console.WriteLine("RoundRobin:");
int next = 0;
for (int req = 1; req <= 5; req++)
{
    string d = destinations[next];
    next = (next + 1) % destinations.Length;
    Console.WriteLine($"  request {req} -> {d}");
}

Console.WriteLine("LeastRequests:");
var active = new Dictionary<string, int> { ["catalog-1"] = 4, ["catalog-2"] = 1, ["catalog-3"] = 2 };
for (int req = 1; req <= 3; req++)
{
    // OrderBy is a stable sort: on a tie the earlier destination wins
    string d = destinations.OrderBy(x => active[x]).First();
    active[d]++;
    Console.WriteLine($"  request {req} -> {d} (now {active[d]} active)");
}

Console.WriteLine("RoundRobin with catalog-2 unhealthy:");
var healthy = destinations.Where(x => x != "catalog-2").ToArray();   // active health check failed
next = 0;
for (int req = 1; req <= 4; req++)
{
    string d = healthy[next];
    next = (next + 1) % healthy.Length;
    Console.WriteLine($"  request {req} -> {d}");
}
`;

const rateCode = `using System;
using System.Collections.Generic;

const int PermitLimit = 3;
const int WindowSeconds = 10;
var windows = new Dictionary<string, (int WindowStart, int Count)>();

// (second the request arrives, client id from API key / IP)
var requests = new (int Second, string Client)[]
{
    (1, "app-android"), (2, "app-android"), (3, "partner-x"),
    (4, "app-android"), (5, "app-android"), (9, "partner-x"),
    (11, "app-android"), (12, "app-android")
};

foreach (var (second, client) in requests)
{
    int windowStart = second / WindowSeconds * WindowSeconds;   // 0-9 -> 0, 10-19 -> 10
    if (!windows.TryGetValue(client, out var w) || w.WindowStart != windowStart)
        w = (windowStart, 0);                                    // new window for this client

    if (w.Count < PermitLimit)
    {
        w.Count++;
        windows[client] = w;
        Console.WriteLine($"t={second,2}s {client,-11} -> 200 OK ({w.Count}/{PermitLimit})");
    }
    else
    {
        windows[client] = w;
        Console.WriteLine($"t={second,2}s {client,-11} -> 429 Too Many Requests");
    }
}
`;

const aspireCode = `// ===== Create the solution =====
// dotnet new install Aspire.ProjectTemplates
// dotnet new aspire-starter -n ShopKart          (or add to an existing solution:)
// Visual Studio: right-click the API project > Add > .NET Aspire Orchestrator Support

// ===== ShopKart.AppHost/AppHost.cs (Program.cs in older templates) =====
var builder = DistributedApplication.CreateBuilder(args);

var sql      = builder.AddSqlServer("sql").AddDatabase("catalogdb");   // runs a SQL Server container
var cache    = builder.AddRedis("cache");                               // runs a Redis container
var rabbit   = builder.AddRabbitMQ("messaging");

var catalog = builder.AddProject<Projects.Catalog_Api>("catalog-api")
                     .WithReference(sql).WaitFor(sql)
                     .WithReference(cache)
                     .WithReplicas(2);                                   // two instances

var ordering = builder.AddProject<Projects.Ordering_Api>("ordering-api")
                      .WithReference(catalog)                            // service discovery info
                      .WithReference(rabbit);

builder.AddProject<Projects.Gateway>("gateway")
       .WithReference(catalog)
       .WithReference(ordering)
       .WithExternalHttpEndpoints();

builder.Build().Run();

// ===== Ordering.Api/Program.cs =====
var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();     // OpenTelemetry, health checks, service discovery, resilience

// "catalog-api" is a LOGICAL name; service discovery resolves it to the real address
builder.Services.AddHttpClient<CatalogClient>(c => c.BaseAddress = new Uri("https+http://catalog-api"));
builder.AddSqlServerDbContext<OrderingDb>("orderingdb");   // Aspire client integration

var app = builder.Build();
app.MapDefaultEndpoints();        // /health and /alive (in Development)
app.Run();

// ===== Gateway: YARP + Aspire service discovery =====
// dotnet add package Microsoft.Extensions.ServiceDiscovery.Yarp
// builder.Services.AddReverseProxy()
//        .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
//        .AddServiceDiscoveryDestinationResolver();
// appsettings: "Destinations": { "d1": { "Address": "https+http://catalog-api" } }`;

export default {
  id: 'day-19-api-gateway-yarp-service-discovery-aspire',
  title: 'API Gateway with YARP: Routes, Clusters, Load Balancing, Auth and Rate Limiting, Service Discovery and .NET Aspire',
  module: 'Module 5: Microservices with .NET',
  day: 19,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Put a single entry point in front of your microservices with YARP (Yet Another Reverse Proxy) from Microsoft: configure routes and clusters, load balance across instances, validate JWTs and apply rate limits at the gateway. Learn how services find each other (service discovery) and how .NET Aspire runs, connects and monitors a whole microservice solution on your laptop.',
  objectives: [
    'Explain the API Gateway pattern, Backend for Frontend and how YARP compares with Ocelot',
    'Configure YARP routes, clusters, path transforms and load balancing policies in appsettings.json',
    'Apply authentication, authorization policies and rate limiting at the gateway',
    'Explain client-side and server-side service discovery',
    'Describe .NET Aspire: AppHost, ServiceDefaults, resources, WithReference and the dashboard',
  ],
  theory: [
    {
      heading: 'Why an API Gateway?',
      content:
        'Without a gateway, the Angular or mobile app must know the address of every service (catalog at :5101, orders at :5201, payments at :5301), handle CORS for each, send the token to each and deal with internal changes. If you split a service into two, every client must be updated.\n\nAn **API Gateway** is a single entry point (for example https://api.shopkart.in) that sits in front of all services. The client calls the gateway; the gateway **routes** each request to the right internal service. Because every request passes through it, it is the natural place for **cross-cutting concerns**: authentication, rate limiting, CORS, SSL termination, request logging, response caching and header transforms.\n\n**Backend for Frontend (BFF)**: instead of one gateway for all clients, create one per client type (web BFF, mobile BFF), each shaped for that UI. **Gateway aggregation**: the gateway calls several services and combines results into one response, so the mobile app makes one request instead of five.',
      points: [
        'Gateway = reverse proxy + cross-cutting concerns at the edge',
        'Hides internal service addresses and topology from clients',
        'Risk: it can become a bottleneck or single point of failure, so run several instances behind a load balancer',
        'Keep business logic OUT of the gateway; it should route and protect, not calculate prices',
      ],
    },
    {
      heading: 'YARP: routes, clusters, destinations and transforms',
      content:
        '**YARP** is Microsoft\'s open-source reverse proxy library, built on ASP.NET Core and used inside Microsoft (Azure App Service and others). You add the NuGet package `Yarp.ReverseProxy` to a normal ASP.NET Core app, so all ASP.NET Core features (middleware, auth, rate limiting, logging) work with it.\n\nThree key ideas:\n- A **route** matches incoming requests (by path, HTTP method, host, headers) and points to a cluster. Example: `/catalog/{**catch-all}` -> catalog-cluster.\n- A **cluster** is a group of **destinations**, the real addresses of the instances of one service (http://localhost:5101, http://localhost:5102). The cluster decides how to load balance and how to check health.\n- **Transforms** change the request on its way: remove a prefix (`PathRemovePrefix`), rewrite the path (`PathPattern`), add or remove headers.\n\nConfiguration usually lives in the `ReverseProxy` section of appsettings.json, loaded with `LoadFromConfig`. It reloads when the file changes. You can also load routes from code or a database with `LoadFromMemory` or a custom `IProxyConfigProvider`.',
      syntax: `builder.Services.AddReverseProxy()
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"));
var app = builder.Build();
app.MapReverseProxy();`,
      points: [
        '{**catch-all} captures the rest of the path, including slashes',
        'A route can set AuthorizationPolicy, RateLimiterPolicy, CorsPolicy, OutputCachePolicy and Timeout',
        'Ocelot is an older, popular .NET gateway configured with ocelot.json (Routes with DownstreamPathTemplate / UpstreamPathTemplate); it is community-maintained, while YARP is maintained by Microsoft and has better performance',
        'Cloud alternatives: Azure API Management, AWS API Gateway, Kong, NGINX, Envoy',
      ],
    },
    {
      heading: 'Load balancing and health checks in YARP',
      content:
        'When a cluster has several destinations, the `LoadBalancingPolicy` chooses one for each request:\n- **PowerOfTwoChoices** (default): pick two random destinations and send to the one with fewer active requests. Good balance, cheap to compute.\n- **RoundRobin**: 1, 2, 3, 1, 2, 3 ... in order.\n- **LeastRequests**: send to the destination with the fewest requests in progress (looks at all destinations).\n- **Random** and **FirstAlphabetical** (always the first one, used for active/passive failover).\n\n**Health checks** keep traffic away from broken instances. **Active** checks: YARP calls each destination\'s `/health` endpoint every few seconds and marks it unhealthy after failures. **Passive** checks: YARP watches real traffic and marks a destination unhealthy when requests to it fail. Unhealthy destinations get no traffic until they recover.\n\n**Session affinity** (sticky sessions) sends one user\'s requests to the same destination using a cookie; avoid it if your services are stateless (they should be).',
      points: [
        'LoadBalancingPolicy is set per cluster',
        'Active health check config: Enabled, Interval, Timeout, Policy, Path',
        'Stateless services + load balancing = horizontal scaling',
      ],
    },
    {
      heading: 'Authentication, authorization and rate limiting at the gateway',
      content:
        'A common design: the gateway validates the JWT (signature, issuer, audience, expiry) using the normal `AddAuthentication().AddJwtBearer()`. A route can require a named policy with `"AuthorizationPolicy": "customer"`. Requests without a valid token get **401** and never reach the services; valid tokens without the right role get **403**. YARP forwards the Authorization header by default, so the services can still read the user\'s claims. Services should still validate tokens themselves (defence in depth, zero trust), because internal traffic can also be attacked.\n\n**Rate limiting** protects services from abuse and overload. ASP.NET Core\'s built-in rate limiter (`AddRateLimiter`, `UseRateLimiter`) offers fixed window, sliding window, token bucket and concurrency limiters. Partition by client (IP, API key, user id) so one noisy client does not block everyone. A YARP route uses it via `"RateLimiterPolicy": "per-ip"`. Rejected requests return **429 Too Many Requests** (you must set `RejectionStatusCode`, the default is 503).',
      points: [
        'Order of middleware: UseAuthentication -> UseAuthorization -> UseRateLimiter -> MapReverseProxy',
        'Fixed window: N requests per window; resets at the window boundary',
        'Token bucket: allows short bursts, refills tokens at a steady rate',
        'Add a Retry-After header for well-behaved clients',
      ],
      tip: 'Never put your JWT signing key in appsettings.json in production. Use user-secrets locally and Azure Key Vault or environment variables on servers.',
    },
    {
      heading: 'Service discovery basics',
      content:
        'In the cloud, service instances come and go: containers restart with new IP addresses, autoscaling adds five more catalog instances during a sale. Hard-coding http://10.0.4.17:8080 does not work. **Service discovery** lets a caller use a logical name ("catalog-api") and resolve it to the current healthy addresses.\n\n- **Server-side discovery**: the caller sends the request to a load balancer or platform DNS, which knows the instances. Kubernetes Services and Azure Container Apps work like this: http://catalog-api resolves through DNS to a virtual IP that balances across pods.\n- **Client-side discovery**: the caller asks a **service registry** (Consul, Eureka) for the list of instances and chooses one itself.\n\nIn .NET, `Microsoft.Extensions.ServiceDiscovery` adds discovery to HttpClient: you write `https+http://catalog-api` as the base address (prefer https, fall back to http), and the address is resolved from configuration (`Services:catalog-api:https:0`), DNS SRV records or Kubernetes. .NET Aspire configures this for you, and YARP can use it through `AddServiceDiscoveryDestinationResolver()`.',
    },
    {
      heading: '.NET Aspire overview',
      content:
        '**.NET Aspire** is Microsoft\'s stack for building and running distributed (microservice) apps. Running five APIs, SQL Server, Redis and RabbitMQ on your laptop normally means many terminals, docker commands and copied connection strings. Aspire replaces that with C# code.\n\n- **AppHost project**: an orchestrator written in C#. You declare **resources** (projects, containers like SQL Server/Redis/RabbitMQ, executables) and how they connect with `WithReference`. Press F5 on the AppHost and everything starts in the right order (`WaitFor`), with connection strings and service addresses injected as environment variables.\n- **ServiceDefaults project**: shared extension methods (`builder.AddServiceDefaults()`, `app.MapDefaultEndpoints()`) that add OpenTelemetry logging, tracing and metrics, health checks (/health, /alive), service discovery and standard HTTP resilience to every service with one line.\n- **Integrations**: NuGet packages like `Aspire.Hosting.SqlServer` (AppHost side) and `Aspire.Microsoft.EntityFrameworkCore.SqlServer` (service side) that wire up resources with health checks and telemetry.\n- **Dashboard**: a web UI opened automatically when the AppHost starts. It shows all resources and their state, console logs, structured logs, distributed traces across services, and metrics.\n\nFor deployment, Aspire can generate manifests for Azure Container Apps (`azd up`), Docker Compose or Kubernetes. Aspire is mainly a development-time orchestrator; it does not replace Kubernetes in production.',
      points: [
        'AppHost = orchestration in C#; ServiceDefaults = shared observability + resilience + discovery',
        'WithReference(x) injects connection strings or service discovery info for x',
        'Dashboard = logs, traces, metrics in one place during development',
      ],
      tip: 'Interviewers increasingly ask "Have you used .NET Aspire?". Even a one-line answer, "AppHost orchestrates projects and containers, ServiceDefaults adds OpenTelemetry and health checks, the dashboard shows traces", stands out.',
    },
  ],
  examples: [
    {
      title: 'A YARP gateway with JWT auth and rate limiting (Program.cs)',
      scenario:
        'ShopKart has a Catalog API (two instances) and an Orders API. Build one gateway that validates JWTs once at the edge, applies a per-IP rate limit and forwards requests to the right service.',
      steps: [
        'In a terminal: dotnet new web -n Gateway, then cd Gateway',
        'dotnet add package Yarp.ReverseProxy and dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer',
        'Replace Program.cs with the code below',
        'Add the ReverseProxy section from the next example to appsettings.json',
        'Run the two Catalog instances on ports 5101/5102 and Orders on 5201, then press F5 on Gateway',
      ],
      code: yarpProgram,
      result: `info: Microsoft.Hosting.Lifetime[14]
      Now listening on: http://localhost:5000
GET http://localhost:5000/            -> 200 "ShopKart API Gateway is running"
GET http://localhost:5000/orders/15   -> 401 Unauthorized (no token, Orders API never called)`,
      explanation:
        'AddReverseProxy + MapReverseProxy turn the app into a proxy. Because YARP is just ASP.NET Core, the normal JWT authentication, authorization policies and rate limiter apply to proxied routes. The "per-ip" policy partitions limits by client IP so one abusive client gets 429 without affecting others.',
    },
    {
      title: 'Routes, clusters, transforms and health checks (appsettings.json)',
      scenario:
        'Map public paths /catalog/* and /orders/* to the internal APIs, rewrite the paths, require the "customer" policy on orders, round-robin across two catalog instances and actively health-check them.',
      steps: [
        'Open Gateway/appsettings.json',
        'Add the ReverseProxy section exactly as shown',
        'Restart the gateway (config also hot-reloads on save)',
        'In Postman call GET http://localhost:5000/catalog/7 several times and watch both catalog consoles receive requests',
        'Stop catalog-2: within about 10 seconds the active health check marks it unhealthy and all traffic goes to catalog-1',
      ],
      code: yarpConfig,
      result: `GET /catalog/7    -> forwarded to http://localhost:5101/api/products/7
GET /catalog/7    -> forwarded to http://localhost:5102/api/products/7
GET /orders/15    (no token)            -> 401
GET /orders/15    (token, role Admin)   -> 403
GET /orders/15    (token, role Customer)-> forwarded to http://localhost:5201/api/orders/15`,
      explanation:
        'The route Match.Path decides which cluster handles a request; PathPattern rewrites /catalog/7 to /api/products/7 so internal URLs stay hidden. RoundRobin alternates destinations. AuthorizationPolicy runs before proxying, so 401/403 come from the gateway itself. HealthCheck.Active polls /health on each destination every 10 seconds.',
    },
    {
      title: 'How load balancing policies choose a destination (console simulation)',
      scenario:
        'Understand RoundRobin and LeastRequests and what happens when a destination becomes unhealthy, by simulating the gateway\'s choice in a console app.',
      steps: [
        'Create a Console App named LoadBalancerDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Trace the LeastRequests section on paper: active counts start at 4, 1, 2',
      ],
      code: lbCode,
      csharp: { files: { 'Program.cs': lbCode }, stdin: '' },
      result: `RoundRobin:
  request 1 -> catalog-1
  request 2 -> catalog-2
  request 3 -> catalog-3
  request 4 -> catalog-1
  request 5 -> catalog-2
LeastRequests:
  request 1 -> catalog-2 (now 2 active)
  request 2 -> catalog-2 (now 3 active)
  request 3 -> catalog-3 (now 3 active)
RoundRobin with catalog-2 unhealthy:
  request 1 -> catalog-1
  request 2 -> catalog-3
  request 3 -> catalog-1
  request 4 -> catalog-3`,
      explanation:
        'RoundRobin cycles through the array with a modulo counter. LeastRequests picks the smallest active count: catalog-2 has 1, then 2 (tied with catalog-3 at 2, and the stable OrderBy keeps catalog-2 first), then catalog-3 with 2 wins over catalog-2 with 3. When a health check removes catalog-2, only healthy destinations take part. In a real gateway the active count goes down again when each response finishes.',
    },
    {
      title: 'Fixed-window rate limiting per client (console simulation)',
      scenario:
        'The gateway allows 3 requests per 10 seconds per client. Simulate a burst from the Android app and a partner integration to see when 429 is returned and when the window resets.',
      steps: [
        'Create a Console App named RateLimitDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Change PermitLimit to 2 and predict which lines become 429',
      ],
      code: rateCode,
      csharp: { files: { 'Program.cs': rateCode }, stdin: '' },
      result: `t= 1s app-android -> 200 OK (1/3)
t= 2s app-android -> 200 OK (2/3)
t= 3s partner-x   -> 200 OK (1/3)
t= 4s app-android -> 200 OK (3/3)
t= 5s app-android -> 429 Too Many Requests
t= 9s partner-x   -> 200 OK (2/3)
t=11s app-android -> 200 OK (1/3)
t=12s app-android -> 200 OK (2/3)`,
      explanation:
        'Each client has its own window (this is what RateLimitPartition does). app-android uses its 3 permits by t=4, so t=5 is rejected with 429. partner-x is unaffected. At t=11 the integer division gives window start 10, a new window, so the counter resets. A weakness of fixed windows: a client can send 3 at t=9 and 3 at t=10 (6 in 2 seconds); sliding window or token bucket limiters smooth this out.',
    },
    {
      title: '.NET Aspire AppHost wiring services, databases and the gateway',
      scenario:
        'Run SQL Server, Redis, RabbitMQ, two Catalog instances, Ordering and the YARP gateway with one F5, with service discovery and the Aspire dashboard.',
      steps: [
        'Install the templates: dotnet new install Aspire.ProjectTemplates (Docker Desktop must be running)',
        'In Visual Studio: right-click Ordering.Api > Add > .NET Aspire Orchestrator Support (creates AppHost and ServiceDefaults)',
        'Add hosting packages to AppHost: dotnet add package Aspire.Hosting.SqlServer, Aspire.Hosting.Redis, Aspire.Hosting.RabbitMQ',
        'Write AppHost.cs as shown, set AppHost as the startup project and press F5',
        'The dashboard opens (https://localhost:17xxx): open Resources, Console logs, Traces and Metrics',
      ],
      code: aspireCode,
      result: `Aspire dashboard > Resources
  sql           Container  Running
  catalogdb     Database   Running
  cache         Container  Running
  messaging     Container  Running
  catalog-api   Project    Running (2 replicas)
  ordering-api  Project    Running
  gateway       Project    Running   http://localhost:5000
Traces: GET /orders -> gateway -> ordering-api -> catalog-api (one trace, three services)`,
      explanation:
        'Each Add* call declares a resource. WithReference(sql) injects ConnectionStrings__catalogdb into Catalog; WithReference(catalog) injects services__catalog-api__https__0 so "https+http://catalog-api" resolves through service discovery. AddServiceDefaults switches on OpenTelemetry, which is why the dashboard can show one trace across all services. WaitFor(sql) delays Catalog until SQL Server is healthy.',
    },
  ],
  interview: [
    { q: 'What is an API Gateway and why use one?', a: 'A single entry point in front of microservices that routes requests to the right service and handles cross-cutting concerns: authentication, rate limiting, CORS, SSL termination, logging, caching and request aggregation. Clients get one stable URL and do not need to know internal addresses.', level: 'Easy' },
    { q: 'What is YARP?', a: 'Yet Another Reverse Proxy: an open-source, high-performance reverse proxy library from Microsoft built on ASP.NET Core. You add the Yarp.ReverseProxy package to an ASP.NET Core app and configure routes and clusters in code or appsettings.json.', level: 'Easy' },
    { q: 'Explain routes, clusters and destinations in YARP.', a: 'A route matches incoming requests (path, method, host, headers) and points to a cluster. A cluster is a set of destinations (instance addresses) for one service, with load balancing, health check and HTTP client settings. A destination is one backend address.', level: 'Medium' },
    { q: 'YARP vs Ocelot?', a: 'Both are .NET gateways. Ocelot is configured with ocelot.json (Upstream/Downstream templates) and has built-in aggregation and Consul integration, but is community-maintained. YARP is maintained by Microsoft, is faster, very customizable through ASP.NET Core middleware and integrates with Aspire service discovery. New projects usually choose YARP.', level: 'Medium' },
    { q: 'What load balancing policies does YARP support and which is the default?', a: 'PowerOfTwoChoices (default), RoundRobin, LeastRequests, Random and FirstAlphabetical. PowerOfTwoChoices picks two random destinations and chooses the one with fewer active requests.', level: 'Medium' },
    { q: 'Difference between active and passive health checks?', a: 'Active checks periodically call a health endpoint (/health) on each destination. Passive checks observe real proxied traffic and mark a destination unhealthy when requests fail. Unhealthy destinations are removed from load balancing until they recover.', level: 'Medium' },
    { q: 'If the gateway validates JWTs, should services validate them too?', a: 'Yes, ideally. Validating at the gateway rejects bad traffic early, but services should still validate tokens and authorize (defence in depth / zero trust) because internal networks can be compromised or services may be called directly.', level: 'Hard' },
    { q: 'What status code does rate limiting return and how do you configure it in ASP.NET Core?', a: '429 Too Many Requests. Register AddRateLimiter with a limiter (fixed window, sliding window, token bucket or concurrency), set RejectionStatusCode = 429 (default is 503), call app.UseRateLimiter() and apply the policy with RequireRateLimiting or YARP\'s RateLimiterPolicy.', level: 'Medium' },
    { q: 'Fixed window vs token bucket rate limiting?', a: 'Fixed window counts requests in fixed time slots and resets at the boundary, which allows bursts at the edges (end of one window + start of next). Token bucket adds tokens at a steady rate up to a maximum; each request takes a token, which allows controlled bursts and a smooth average rate.', level: 'Hard' },
    { q: 'What is service discovery? Client-side vs server-side?', a: 'A way for services to find current addresses of other services by logical name. Server-side: the caller hits a load balancer/DNS (Kubernetes Service) that knows the instances. Client-side: the caller queries a registry (Consul, Eureka) and picks an instance itself.', level: 'Medium' },
    { q: 'What is the Backend for Frontend (BFF) pattern?', a: 'A separate gateway/API per client type (web, mobile, partner). Each BFF shapes and aggregates data exactly as its UI needs, so the mobile app is not forced to use an API designed for the web app.', level: 'Medium' },
    { q: 'What is .NET Aspire? Name its main parts.', a: 'An opinionated stack for building and running distributed .NET apps. AppHost: C# orchestrator declaring projects and containers and their references. ServiceDefaults: shared setup for OpenTelemetry, health checks, service discovery and resilience. Integrations: NuGet packages for SQL Server, Redis, RabbitMQ etc. Dashboard: logs, traces and metrics in one UI.', level: 'Medium' },
    { q: 'What does WithReference do in an Aspire AppHost?', a: 'It passes connection information of one resource to another as environment variables: a connection string (ConnectionStrings__name) for databases/caches, or service discovery endpoints (services__name__https__0) for projects, so code can use logical names.', level: 'Hard' },
    { q: 'Can the API Gateway become a single point of failure? How do you avoid it?', a: 'Yes. Run multiple gateway instances behind a cloud load balancer, keep the gateway stateless and thin (no business logic), monitor it closely and use timeouts so a slow service cannot exhaust gateway resources.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a third route to the YARP config: /payments/{**catch-all} -> payments-cluster at http://localhost:5301/, rewritten to /api/payments/{**catch-all}, requiring the "customer" policy.',
      hint: 'Copy orders-route and add a payments-cluster under Clusters.',
      solution: `"payments-route": {
  "ClusterId": "payments-cluster",
  "AuthorizationPolicy": "customer",
  "Match": { "Path": "/payments/{**catch-all}" },
  "Transforms": [ { "PathPattern": "/api/payments/{**catch-all}" } ]
}
// under Clusters:
"payments-cluster": {
  "Destinations": { "payments-1": { "Address": "http://localhost:5301/" } }
}`,
    },
    {
      task: 'Change the catalog route so that /catalog/7 is forwarded as /7 instead of /api/products/7 using a prefix-removal transform.',
      hint: 'Use the PathRemovePrefix transform.',
      solution: `"Transforms": [ { "PathRemovePrefix": "/catalog" } ]`,
    },
    {
      task: 'Write an Ocelot route (ocelot.json) equivalent to the catalog-route, so you can recognise Ocelot config in older projects.',
      hint: 'Ocelot uses UpstreamPathTemplate (public) and DownstreamPathTemplate (internal).',
      solution: `{
  "Routes": [
    {
      "UpstreamPathTemplate": "/catalog/{everything}",
      "UpstreamHttpMethod": [ "GET" ],
      "DownstreamPathTemplate": "/api/products/{everything}",
      "DownstreamScheme": "http",
      "DownstreamHostAndPorts": [
        { "Host": "localhost", "Port": 5101 },
        { "Host": "localhost", "Port": 5102 }
      ],
      "LoadBalancerOptions": { "Type": "RoundRobin" }
    }
  ],
  "GlobalConfiguration": { "BaseUrl": "http://localhost:5000" }
}
// Program.cs: builder.Configuration.AddJsonFile("ocelot.json");
//             builder.Services.AddOcelot(); ... await app.UseOcelot();`,
    },
    {
      task: 'Replace the fixed-window "per-ip" limiter with a token bucket that allows bursts of 20 and refills 10 tokens every 10 seconds.',
      hint: 'RateLimitPartition.GetTokenBucketLimiter with TokenBucketRateLimiterOptions.',
      solution: `o.AddPolicy("per-ip", ctx =>
    RateLimitPartition.GetTokenBucketLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 20,
            TokensPerPeriod = 10,
            ReplenishmentPeriod = TimeSpan.FromSeconds(10),
            AutoReplenishment = true,
            QueueLimit = 0
        }));`,
    },
    {
      task: 'In an Aspire AppHost, add a PostgreSQL database "paymentsdb" and a Payments.Api project that references it and waits for it.',
      hint: 'AddPostgres(...).AddDatabase(...), AddProject<Projects.Payments_Api>, WithReference, WaitFor.',
      solution: `// dotnet add package Aspire.Hosting.PostgreSQL
var pg = builder.AddPostgres("pg").AddDatabase("paymentsdb");
builder.AddProject<Projects.Payments_Api>("payments-api")
       .WithReference(pg)
       .WaitFor(pg);
// In Payments.Api: builder.AddNpgsqlDbContext<PaymentsDb>("paymentsdb");`,
    },
  ],
  quiz: [
    {
      question: 'In YARP, what is a cluster?',
      options: [
        'A group of destinations (instances) for one backend service, with load balancing settings',
        'A pattern that matches incoming request paths',
        'A Kubernetes node pool',
        'A list of JWT signing keys',
      ],
      answer: 0,
      explanation: 'Routes match requests; clusters hold destinations plus load balancing and health check settings.',
    },
    {
      question: 'Which is the default load balancing policy in YARP?',
      options: ['RoundRobin', 'LeastRequests', 'FirstAlphabetical', 'PowerOfTwoChoices'],
      answer: 3,
      explanation: 'PowerOfTwoChoices picks two random destinations and uses the less busy one.',
    },
    {
      question: 'A request reaches the gateway without a token on a route with "AuthorizationPolicy": "customer". What happens?',
      options: [
        'It is forwarded and the service returns 401',
        'The gateway returns 401 and the service is never called',
        'The gateway returns 429',
        'The gateway returns 200 with an empty body',
      ],
      answer: 1,
      explanation: 'Authorization runs in the gateway pipeline before proxying, so unauthenticated requests stop at the edge.',
    },
    {
      question: 'What does builder.AddServiceDefaults() in an Aspire service set up?',
      options: [
        'Only Swagger',
        'The SQL Server container',
        'OpenTelemetry, health checks, service discovery and HTTP resilience',
        'The YARP routes',
      ],
      answer: 2,
      explanation: 'ServiceDefaults is a shared project whose extension method configures observability, health endpoints, discovery and resilience for every service.',
    },
    {
      question: 'Why is http://catalog-api better than http://10.0.4.17:8080 in a microservice config?',
      options: [
        'It is shorter',
        'It is always faster',
        'A logical name is resolved by service discovery to the current healthy instances, which change over time',
        'IP addresses are not allowed in HttpClient',
      ],
      answer: 2,
      explanation: 'Containers restart and scale with new IPs; service discovery maps the stable logical name to current addresses.',
    },
  ],
};
