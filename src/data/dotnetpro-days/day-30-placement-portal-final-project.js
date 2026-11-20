const architectureCode = `================== COLLEGE PLACEMENT PORTAL - ARCHITECTURE ==================

   Students / TPO / Recruiters (browser)
                 |
                 v  HTTPS
   +-----------------------------+        +------------------------------+
   |  Angular 19+ SPA (or Blazor) |  JWT   |  Azure Static Web Apps /     |
   |  routes, guards, interceptor |------->|  nginx container (ui)        |
   +-----------------------------+        +------------------------------+
                 |  REST /api/*  (Authorization: Bearer <token>)
                 v
   +-------------------------------------------------------------------+
   |  Placement.Api  (ASP.NET Core 8/10, controllers, ProblemDetails)  |
   |    - Auth (JWT), CORS, rate limiting, health checks, OpenTelemetry|
   |    - Controllers only call  mediator.Send(command / query)        |
   +-------------------------------------------------------------------+
                 |  MediatR pipeline:  Logging -> Validation -> Caching -> Handler
                 v
   +-------------------------------------------------------------------+
   |  Placement.Application  (CQRS)                                    |
   |    Commands: RegisterStudent, CreateDrive, ApplyToDrive, ...      |
   |    Queries : GetEligibleDrives, GetDriveApplicants, Dashboard     |
   |    Interfaces: IAppDbContext, IReadDb, ICacheService, IEventBus,  |
   |                IEmailSender  (implemented in Infrastructure)      |
   +-------------------------------------------------------------------+
        |  depends on  (inner)                        ^ implements (outer)
        v                                             |
   +--------------------------+     +----------------------------------------+
   |  Placement.Domain        |     |  Placement.Infrastructure              |
   |  Entities, value objects |     |  EF Core (writes) + Dapper (reads)     |
   |  rules: Drive.Apply(...) |     |  Redis cache, RabbitMQ publisher,      |
   |  domain events           |     |  SMTP email, Blob storage              |
   +--------------------------+     +----------------------------------------+
                                        |            |             |
                       +----------------+    +-------+------+  +---+-----------+
                       v                     v              v  v               |
               +---------------+     +--------------+  +-------------+         |
               | SQL Server /  |     | Redis        |  | RabbitMQ    |         |
               | Azure SQL     |     | (cache)      |  | exchange:   |         |
               +---------------+     +--------------+  | placement   |         |
                                                       +------+------+         |
                                                              | StudentApplied |
                                                              v                |
                                         +-----------------------------------+ |
                                         | Placement.Worker (BackgroundService)| |
                                         |  - consumes StudentApplied        | |
                                         |  - sends confirmation email       |-+
                                         |  - nightly drive reminder job     |
                                         +-----------------------------------+

Deployment: docker compose (local)  ->  GitHub Actions  ->  Azure App Service (API, slots)
            + Azure SQL + Azure Cache for Redis + RabbitMQ (container / CloudAMQP) or Azure Service Bus
            + Key Vault (secrets) + Application Insights (monitoring) + Blob Storage (resumes)

Dependency rule: Domain <- Application <- Infrastructure / Api.  Inner layers never reference outer layers.`;

const structureCode = `PlacementPortal/
├── PlacementPortal.sln
├── docker-compose.yml / docker-compose.override.yml / .env
├── .github/workflows/placement-api.yml
├── src/
│   ├── Placement.Domain/                  # no NuGet dependencies at all
│   │   ├── Common/Entity.cs, IDomainEvent.cs
│   │   ├── Students/Student.cs
│   │   ├── Drives/Drive.cs, Application.cs, ApplicationStatus.cs
│   │   └── Drives/Events/StudentAppliedEvent.cs
│   ├── Placement.Application/             # MediatR, FluentValidation
│   │   ├── Abstractions/IAppDbContext.cs, IReadDb.cs, ICacheService.cs, IEventBus.cs, IEmailSender.cs
│   │   ├── Behaviors/LoggingBehavior.cs, ValidationBehavior.cs, CachingBehavior.cs
│   │   ├── Drives/Commands/ApplyToDrive/ApplyToDriveCommand.cs, ...Handler.cs, ...Validator.cs
│   │   ├── Drives/Commands/CreateDrive/...
│   │   ├── Drives/Queries/GetEligibleDrives/GetEligibleDrivesQuery.cs, ...Handler.cs, DriveDto.cs
│   │   └── DependencyInjection.cs         # services.AddApplication()
│   ├── Placement.Infrastructure/          # EF Core, Dapper, Redis, RabbitMQ, SMTP, Blob
│   │   ├── Persistence/PlacementDbContext.cs, Configurations/*.cs, Migrations/
│   │   ├── Persistence/SqlReadDb.cs       # Dapper
│   │   ├── Caching/RedisCacheService.cs
│   │   ├── Messaging/RabbitMqEventBus.cs
│   │   ├── Email/SmtpEmailSender.cs
│   │   └── DependencyInjection.cs         # services.AddInfrastructure(config)
│   ├── Placement.Api/                     # controllers, auth, Program.cs, Dockerfile
│   │   ├── Controllers/AuthController.cs, DrivesController.cs, StudentsController.cs
│   │   └── Program.cs
│   └── Placement.Worker/                  # BackgroundService: email consumer + reminders
│       ├── StudentAppliedConsumer.cs
│       └── Program.cs, Dockerfile
├── placement-ui/                          # Angular (or src/Placement.Blazor)
│   └── src/app/{auth,drives,students,admin}/...
└── tests/
    ├── Placement.Domain.Tests/            # xUnit: Drive.Apply rules
    ├── Placement.Application.Tests/       # handlers with Moq / NSubstitute
    └── Placement.Api.IntegrationTests/    # WebApplicationFactory + Testcontainers

# ===== Create it with the dotnet CLI =====
dotnet new sln -n PlacementPortal
dotnet new classlib -n Placement.Domain -o src/Placement.Domain
dotnet new classlib -n Placement.Application -o src/Placement.Application
dotnet new classlib -n Placement.Infrastructure -o src/Placement.Infrastructure
dotnet new webapi -n Placement.Api -o src/Placement.Api --use-controllers
dotnet new worker -n Placement.Worker -o src/Placement.Worker
dotnet sln add (Get-ChildItem -Recurse src/*.csproj)
dotnet add src/Placement.Application reference src/Placement.Domain
dotnet add src/Placement.Infrastructure reference src/Placement.Application
dotnet add src/Placement.Api reference src/Placement.Infrastructure
dotnet add src/Placement.Worker reference src/Placement.Infrastructure
dotnet add src/Placement.Application package MediatR
dotnet add src/Placement.Application package FluentValidation.DependencyInjectionExtensions
dotnet add src/Placement.Infrastructure package Microsoft.EntityFrameworkCore.SqlServer
dotnet add src/Placement.Infrastructure package Dapper
dotnet add src/Placement.Infrastructure package Microsoft.Extensions.Caching.StackExchangeRedis
dotnet add src/Placement.Infrastructure package RabbitMQ.Client
ng new placement-ui --style=css --ssr=false`;

const domainAppCode = `// ===== Domain/Drives/Drive.cs  (rules live in the domain, not in controllers) =====
namespace Placement.Domain.Drives;

public class Drive : Entity
{
    private readonly List<Application> _applications = [];
    public string Company { get; private set; } = "";
    public string Role { get; private set; } = "";
    public decimal PackageLpa { get; private set; }
    public decimal MinCgpa { get; private set; }
    public DateOnly LastDate { get; private set; }
    public IReadOnlyCollection<Application> Applications => _applications;

    private Drive() { }                                  // for EF Core
    public static Drive Create(string company, string role, decimal packageLpa, decimal minCgpa, DateOnly lastDate)
        => new() { Company = company, Role = role, PackageLpa = packageLpa, MinCgpa = minCgpa, LastDate = lastDate };

    public Result Apply(Student student, DateOnly today)
    {
        if (today > LastDate) return Result.Fail("Applications are closed");
        if (student.Cgpa < MinCgpa) return Result.Fail($"Minimum CGPA is {MinCgpa}");
        if (student.ActiveBacklogs > 0) return Result.Fail("Active backlogs are not allowed");
        if (_applications.Any(a => a.StudentId == student.Id)) return Result.Fail("Already applied");

        _applications.Add(new Application(student.Id, Id, ApplicationStatus.Applied));
        AddDomainEvent(new StudentAppliedEvent(student.Id, student.Email, student.Name, Id, Company));
        return Result.Ok();
    }
}

// ===== Application/Drives/Commands/ApplyToDrive =====
public record ApplyToDriveCommand(int StudentId, int DriveId) : IRequest<Result>;

public class ApplyToDriveValidator : AbstractValidator<ApplyToDriveCommand>
{
    public ApplyToDriveValidator()
    {
        RuleFor(x => x.StudentId).GreaterThan(0);
        RuleFor(x => x.DriveId).GreaterThan(0);
    }
}

public class ApplyToDriveHandler(IAppDbContext db, IEventBus bus, ICacheService cache, TimeProvider clock)
    : IRequestHandler<ApplyToDriveCommand, Result>
{
    public async Task<Result> Handle(ApplyToDriveCommand cmd, CancellationToken ct)
    {
        var student = await db.Students.FindAsync([cmd.StudentId], ct);
        var drive = await db.Drives.Include(d => d.Applications).FirstOrDefaultAsync(d => d.Id == cmd.DriveId, ct);
        if (student is null || drive is null) return Result.Fail("Student or drive not found");

        var result = drive.Apply(student, DateOnly.FromDateTime(clock.GetUtcNow().UtcDateTime));
        if (!result.Success) return result;

        await db.SaveChangesAsync(ct);                               // EF Core write (one transaction)
        await cache.RemoveByPrefixAsync("drives:", ct);              // invalidate read cache
        foreach (var e in drive.DomainEvents.OfType<StudentAppliedEvent>())
            await bus.PublishAsync("student.applied", e, ct);        // RabbitMQ (use an outbox in production)
        drive.ClearDomainEvents();
        return result;
    }
}

// ===== Application/Drives/Queries/GetEligibleDrives (read side: Dapper + cache) =====
public record DriveDto(int Id, string Company, string Role, decimal PackageLpa, decimal MinCgpa, DateOnly LastDate);

public interface ICacheableQuery { string CacheKey { get; } TimeSpan Ttl { get; } }

public record GetEligibleDrivesQuery(int StudentId) : IRequest<IReadOnlyList<DriveDto>>, ICacheableQuery
{
    public string CacheKey => $"drives:eligible:{StudentId}";
    public TimeSpan Ttl => TimeSpan.FromMinutes(5);
}

public class GetEligibleDrivesHandler(IReadDb readDb) : IRequestHandler<GetEligibleDrivesQuery, IReadOnlyList<DriveDto>>
{
    public async Task<IReadOnlyList<DriveDto>> Handle(GetEligibleDrivesQuery q, CancellationToken ct)
    {
        const string sql = """
            SELECT d.Id, d.Company, d.Role, d.PackageLpa, d.MinCgpa, d.LastDate
            FROM Drives d
            JOIN Students s ON s.Id = @StudentId
            WHERE d.MinCgpa <= s.Cgpa
              AND d.LastDate >= CAST(GETUTCDATE() AS date)
              AND s.ActiveBacklogs = 0
              AND NOT EXISTS (SELECT 1 FROM Applications a WHERE a.DriveId = d.Id AND a.StudentId = s.Id)
            ORDER BY d.PackageLpa DESC;
            """;
        using var conn = readDb.CreateConnection();                 // SqlConnection
        var rows = await conn.QueryAsync<DriveDto>(new CommandDefinition(sql, new { q.StudentId }, cancellationToken: ct));
        return rows.ToList();
    }
}

// ===== Application/Behaviors/CachingBehavior.cs  (cache-aside for every ICacheableQuery) =====
public class CachingBehavior<TRequest, TResponse>(ICacheService cache, ILogger<CachingBehavior<TRequest, TResponse>> log)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (request is not ICacheableQuery q) return await next();

        var cached = await cache.GetAsync<TResponse>(q.CacheKey, ct);
        if (cached is not null) { log.LogDebug("Cache hit {Key}", q.CacheKey); return cached; }

        var response = await next();
        await cache.SetAsync(q.CacheKey, response, q.Ttl, ct);
        return response;
    }
}

// ===== Application/DependencyInjection.cs =====
public static IServiceCollection AddApplication(this IServiceCollection services)
{
    services.AddMediatR(cfg =>
    {
        cfg.RegisterServicesFromAssembly(typeof(ApplyToDriveCommand).Assembly);
        cfg.AddOpenBehavior(typeof(LoggingBehavior<,>));
        cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
        cfg.AddOpenBehavior(typeof(CachingBehavior<,>));
    });
    services.AddValidatorsFromAssembly(typeof(ApplyToDriveCommand).Assembly);
    return services;
}

// ===== Api/Controllers/DrivesController.cs  (thin) =====
[ApiController, Route("api/drives"), Authorize]
public class DrivesController(ISender mediator) : ControllerBase
{
    [HttpGet("eligible")]
    public async Task<IActionResult> Eligible(CancellationToken ct) =>
        Ok(await mediator.Send(new GetEligibleDrivesQuery(User.GetStudentId()), ct));

    [HttpPost("{driveId:int}/apply")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> Apply(int driveId, CancellationToken ct)
    {
        var result = await mediator.Send(new ApplyToDriveCommand(User.GetStudentId(), driveId), ct);
        return result.Success ? NoContent() : Problem(title: result.Error, statusCode: 400);
    }

    [HttpPost, Authorize(Roles = "Admin")]
    public async Task<IActionResult> Create(CreateDriveCommand cmd, CancellationToken ct)
    {
        int id = await mediator.Send(cmd, ct);
        return CreatedAtAction(nameof(Eligible), new { id }, new { id });
    }
}`;

const infraCode = `// ===== Infrastructure/Caching/RedisCacheService.cs =====
public class RedisCacheService(IDistributedCache cache, IConnectionMultiplexer redis) : ICacheService
{
    public async Task<T?> GetAsync<T>(string key, CancellationToken ct)
    {
        var json = await cache.GetStringAsync(key, ct);
        return json is null ? default : JsonSerializer.Deserialize<T>(json);
    }

    public Task SetAsync<T>(string key, T value, TimeSpan ttl, CancellationToken ct) =>
        cache.SetStringAsync(key, JsonSerializer.Serialize(value),
            new DistributedCacheEntryOptions { AbsoluteExpirationRelativeToNow = ttl }, ct);

    public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct)
    {
        var server = redis.GetServer(redis.GetEndPoints()[0]);
        foreach (var key in server.Keys(pattern: "placement:" + prefix + "*"))   // InstanceName + prefix
            await redis.GetDatabase().KeyDeleteAsync(key);
    }
}

// ===== Infrastructure/Messaging/RabbitMqEventBus.cs  (RabbitMQ.Client 7, async API) =====
public class RabbitMqEventBus(IConnection connection) : IEventBus
{
    public async Task PublishAsync<T>(string routingKey, T message, CancellationToken ct)
    {
        await using var channel = await connection.CreateChannelAsync(cancellationToken: ct);
        await channel.ExchangeDeclareAsync("placement", ExchangeType.Topic, durable: true, cancellationToken: ct);

        var body = JsonSerializer.SerializeToUtf8Bytes(message);
        var props = new BasicProperties { Persistent = true, ContentType = "application/json", MessageId = Guid.NewGuid().ToString() };
        await channel.BasicPublishAsync("placement", routingKey, mandatory: false, basicProperties: props, body: body, cancellationToken: ct);
    }
}

// ===== Infrastructure/DependencyInjection.cs =====
public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration config)
{
    services.AddDbContext<PlacementDbContext>(o => o.UseSqlServer(config.GetConnectionString("PlacementDb"),
        sql => sql.EnableRetryOnFailure()));
    services.AddScoped<IAppDbContext>(sp => sp.GetRequiredService<PlacementDbContext>());
    services.AddSingleton<IReadDb>(new SqlReadDb(config.GetConnectionString("PlacementDb")!));

    services.AddStackExchangeRedisCache(o => { o.Configuration = config.GetConnectionString("Redis"); o.InstanceName = "placement:"; });
    services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(config.GetConnectionString("Redis")!));
    services.AddSingleton<ICacheService, RedisCacheService>();

    services.AddSingleton<IConnection>(_ =>
        new ConnectionFactory { HostName = config["RabbitMq:Host"]!, UserName = config["RabbitMq:User"]!, Password = config["RabbitMq:Password"]! }
            .CreateConnectionAsync().GetAwaiter().GetResult());
    services.AddSingleton<IEventBus, RabbitMqEventBus>();
    services.AddSingleton(TimeProvider.System);
    services.AddScoped<IEmailSender, SmtpEmailSender>();
    return services;
}

// ===== Worker/StudentAppliedConsumer.cs  (background email job) =====
public class StudentAppliedConsumer(IConnection connection, IServiceScopeFactory scopes, ILogger<StudentAppliedConsumer> log)
    : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);
        await channel.ExchangeDeclareAsync("placement", ExchangeType.Topic, durable: true, cancellationToken: stoppingToken);
        await channel.QueueDeclareAsync("email.student-applied", durable: true, exclusive: false, autoDelete: false,
            arguments: new Dictionary<string, object?> { ["x-dead-letter-exchange"] = "placement.dlx" }, cancellationToken: stoppingToken);
        await channel.QueueBindAsync("email.student-applied", "placement", "student.applied", cancellationToken: stoppingToken);
        await channel.BasicQosAsync(0, prefetchCount: 10, global: false, cancellationToken: stoppingToken);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            try
            {
                var evt = JsonSerializer.Deserialize<StudentAppliedEvent>(ea.Body.Span)!;
                using var scope = scopes.CreateScope();                       // scoped services inside a singleton
                var email = scope.ServiceProvider.GetRequiredService<IEmailSender>();
                await email.SendAsync(evt.Email, $"Applied to {evt.Company}",
                    $"Hi {evt.Name}, your application for {evt.Company} is received. All the best!", stoppingToken);
                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);  // remove from queue only after success
                log.LogInformation("Confirmation mail sent to {Email} for drive {DriveId}", evt.Email, evt.DriveId);
            }
            catch (Exception ex)
            {
                log.LogError(ex, "Email failed, sending message to dead-letter queue");
                await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
            }
        };
        await channel.BasicConsumeAsync("email.student-applied", autoAck: false, consumer, stoppingToken);
        await Task.Delay(Timeout.Infinite, stoppingToken);
    }
}

// Worker/Program.cs
var builder = Host.CreateApplicationBuilder(args);
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddHostedService<StudentAppliedConsumer>();
builder.Services.AddHostedService<DriveReminderJob>();     // PeriodicTimer: every day 06:00 IST
builder.Build().Run();`;

const uiDeployCode = `// ===== Angular: placement-ui/src/app/drives/eligible-drives.component.ts =====
import { Component, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { environment } from '../../environments/environment';

interface Drive { id: number; company: string; role: string; packageLpa: number; minCgpa: number; lastDate: string; }

@Component({
  selector: 'app-eligible-drives',
  standalone: true,
  imports: [DatePipe],
  template: \`
    <h2>Drives you can apply for</h2>
    @for (d of drives(); track d.id) {
      <div class="card">
        <b>{{ d.company }}</b> - {{ d.role }} - {{ d.packageLpa }} LPA (last date {{ d.lastDate | date:'dd MMM' }})
        <button (click)="apply(d)" [disabled]="busyId() === d.id">Apply</button>
      </div>
    } @empty { <p>No eligible drives right now.</p> }
    @if (message()) { <p>{{ message() }}</p> }
  \`
})
export class EligibleDrivesComponent {
  private http = inject(HttpClient);                       // authInterceptor (Day 26) adds the Bearer token
  drives = signal<Drive[]>([]);
  busyId = signal<number | null>(null);
  message = signal('');

  constructor() { this.load(); }

  load() {
    this.http.get<Drive[]>(environment.apiUrl + '/drives/eligible').subscribe(d => this.drives.set(d));
  }

  apply(d: Drive) {
    this.busyId.set(d.id);
    this.http.post<void>(environment.apiUrl + '/drives/' + d.id + '/apply', {}).subscribe({
      next: () => { this.message.set('Applied to ' + d.company + '. Check your email.'); this.load(); this.busyId.set(null); },
      error: (e: HttpErrorResponse) => { this.message.set(e.error?.title ?? 'Could not apply'); this.busyId.set(null); }
    });
  }
}

# ===== docker-compose.yml (whole system) =====
services:
  sqlserver:
    image: mcr.microsoft.com/mssql/server:2022-latest
    environment: { ACCEPT_EULA: "Y", MSSQL_SA_PASSWORD: "\${SA_PASSWORD}" }
    volumes: [ "sqldata:/var/opt/mssql" ]
    healthcheck:
      test: ["CMD-SHELL", "/opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P \\"$$MSSQL_SA_PASSWORD\\" -C -Q \\"SELECT 1\\""]
      interval: 10s
      retries: 10
  redis:
    image: redis:7-alpine
    healthcheck: { test: ["CMD", "redis-cli", "ping"], interval: 5s }
  rabbitmq:
    image: rabbitmq:3-management
    ports: [ "15672:15672" ]
    healthcheck: { test: ["CMD", "rabbitmq-diagnostics", "-q", "ping"], interval: 10s, retries: 10 }
  mailhog:
    image: mailhog/mailhog:v1.0.1
    ports: [ "8025:8025" ]
  api:
    build: { context: ., dockerfile: src/Placement.Api/Dockerfile }
    ports: [ "5080:8080" ]
    environment: &appenv
      ConnectionStrings__PlacementDb: "Server=sqlserver;Database=PlacementDb;User Id=sa;Password=\${SA_PASSWORD};TrustServerCertificate=True"
      ConnectionStrings__Redis: "redis:6379"
      RabbitMq__Host: "rabbitmq"
      RabbitMq__User: "guest"
      RabbitMq__Password: "guest"
      Email__SmtpHost: "mailhog"
      Email__SmtpPort: "1025"
    depends_on:
      sqlserver: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
  worker:
    build: { context: ., dockerfile: src/Placement.Worker/Dockerfile }
    environment: *appenv                     # YAML anchor: same settings as the API
    depends_on:
      rabbitmq: { condition: service_healthy }
  ui:
    build: ./placement-ui
    ports: [ "4200:80" ]
volumes:
  sqldata:

# ===== Azure deployment (summary of Day 29) =====
# API      -> App Service (Linux, S1) with staging slot, Managed Identity, health check /health/ready
# Worker   -> Azure Container Apps (or a second App Service / WebJob), scales on queue length
# UI       -> Azure Static Web Apps (navigationFallback to index.html)
# Data     -> Azure SQL (serverless in dev), Azure Cache for Redis, RabbitMQ on CloudAMQP or Azure Service Bus
# Secrets  -> Key Vault (Jwt--Key, ConnectionStrings--PlacementDb, Email--SmtpPassword)
# Monitor  -> Application Insights (OpenTelemetry in Api and Worker share operation ids)
# CI/CD    -> GitHub Actions: build + test -> EF migration bundle -> deploy staging -> approve -> swap`;

const simCode = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

// Mini CQRS demo without NuGet packages: a "mediator" with a pipeline,
// a cache-aside query, a command that writes, invalidates the cache and publishes an event.
CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

var db = new List<Student>
{
    new(1, "Asha", "CSE", 8.4m),
    new(2, "Ravi", "IT", 7.1m),
    new(3, "Neha", "ECE", 6.8m)
};
var cache = new Dictionary<string, object>();   // pretend Redis
var bus = new List<string>();                   // pretend RabbitMQ queue

var mediator = new Mediator();

mediator.Register<GetEligibleQuery, List<string>>(q =>
{
    string key = $"eligible:{q.MinCgpa}";
    if (cache.TryGetValue(key, out object? hit))
    {
        Console.WriteLine($"  cache HIT {key}");
        return (List<string>)hit;
    }
    Console.WriteLine($"  cache MISS {key} -> query DB");
    var names = db.Where(s => s.Cgpa >= q.MinCgpa)
                  .OrderByDescending(s => s.Cgpa)
                  .Select(s => s.Name)
                  .ToList();
    cache[key] = names;
    return names;
});

mediator.Register<ApplyToDriveCommand, string>(c =>
{
    var s = db.FirstOrDefault(x => x.Id == c.StudentId);
    if (s is null) return "NotFound";
    if (s.Cgpa < c.MinCgpa) return $"Rejected: {s.Name} CGPA {s.Cgpa} < {c.MinCgpa}";
    bus.Add($"StudentApplied:{s.Id}:{c.Company}");
    cache.Clear();                              // a write invalidates cached reads
    return $"Applied: {s.Name} -> {c.Company}";
});

Console.WriteLine("1) Query eligible (CGPA >= 7.0)");
var list = mediator.Send(new GetEligibleQuery(7.0m));
Console.WriteLine("   " + string.Join(", ", list));

Console.WriteLine("2) Same query again");
list = mediator.Send(new GetEligibleQuery(7.0m));
Console.WriteLine("   " + string.Join(", ", list));

Console.WriteLine("3) Commands");
Console.WriteLine("   " + mediator.Send(new ApplyToDriveCommand(2, "TCS", 7.0m)));
Console.WriteLine("   " + mediator.Send(new ApplyToDriveCommand(3, "TCS", 7.0m)));

Console.WriteLine("4) Query after a write");
list = mediator.Send(new GetEligibleQuery(7.0m));
Console.WriteLine("   " + string.Join(", ", list));

Console.WriteLine($"5) Events in queue: {bus.Count}");
foreach (var e in bus) Console.WriteLine("   " + e);

interface IRequest<TResponse> { }
record GetEligibleQuery(decimal MinCgpa) : IRequest<List<string>>;
record ApplyToDriveCommand(int StudentId, string Company, decimal MinCgpa) : IRequest<string>;
record Student(int Id, string Name, string Branch, decimal Cgpa);

class Mediator
{
    private readonly Dictionary<Type, Func<object, object>> _handlers = new();

    public void Register<TReq, TRes>(Func<TReq, TRes> handler) where TReq : IRequest<TRes>
        => _handlers[typeof(TReq)] = r => handler((TReq)r)!;

    public TRes Send<TRes>(IRequest<TRes> request)
    {
        string name = request.GetType().Name;
        Console.WriteLine($"[pipeline] -> {name}");          // like a MediatR logging behavior
        var result = (TRes)_handlers[request.GetType()](request);
        Console.WriteLine($"[pipeline] <- {name}");
        return result;
    }
}
`;

const milestonesCode = `MILESTONES (2-3 weeks for a team of 3, or 4-5 weeks alone)

M1  Setup (Day 1-2)
    - Solution with 5 projects + tests, references follow the dependency rule
    - docker compose with SQL Server, Redis, RabbitMQ, MailHog; README with "docker compose up"
    - GitHub repo, branch protection, PR template

M2  Domain + persistence (Day 3-5)
    - Entities: Student, Company, Drive, Application, Offer; value object Email; enum ApplicationStatus
    - EF Core configurations (Fluent API), first migration, seed 3 companies and 20 students
    - Unit tests for Drive.Apply rules (CGPA, backlog, last date, duplicate)

M3  CQRS API (Day 6-9)
    - Commands: RegisterStudent, CreateDrive, ApplyToDrive, ShortlistApplicant, ReleaseOffer
    - Queries (Dapper): GetEligibleDrives, GetDriveApplicants (paged), PlacementDashboard (branch-wise stats)
    - Behaviors: logging, FluentValidation, caching; ProblemDetails error handling
    - JWT auth with roles Student / Admin (TPO) / Recruiter; Swagger with Bearer support

M4  Async + background (Day 10-11)
    - RabbitMQ topic exchange "placement": student.applied, offer.released
    - Worker: confirmation emails, offer letters (PDF to Blob Storage), daily reminder job
    - Dead-letter queue + retry; idempotent consumer (store processed MessageId)

M5  UI (Day 12-15)
    - Angular: login, student dashboard, eligible drives, apply, my applications
    - TPO: create drive, applicants table with filters, shortlist, dashboard charts
    - Interceptor, guards, reactive forms with validators, lazy-loaded admin area
    (Blazor alternative: Blazor Web App with InteractiveServer pages calling the same API)

M6  Quality + DevOps (Day 16-18)
    - Integration tests with WebApplicationFactory + Testcontainers (SQL, Redis)
    - Dockerfiles for api, worker, ui; GitHub Actions: build, test, push images
    - Health checks, OpenTelemetry, structured logs

M7  Azure (Day 19-20)
    - App Service (API, staging slot), Container Apps (worker), Static Web Apps (UI)
    - Azure SQL, Azure Cache for Redis, Key Vault + Managed Identity, App Insights, Blob Storage
    - Budget alert, demo video, architecture diagram in README

API ENDPOINTS
POST /api/auth/login                    -> JWT
GET  /api/drives/eligible               Student   (cached 5 min)
POST /api/drives/{id}/apply             Student   -> event student.applied
POST /api/drives                        Admin
GET  /api/drives/{id}/applicants?page=1&pageSize=20&branch=CSE   Admin/Recruiter (Dapper)
PUT  /api/applications/{id}/status      Recruiter (Shortlisted/Rejected/Selected)
POST /api/offers                        Admin     -> event offer.released
GET  /api/dashboard/branch-stats        Admin     (cached, Dapper GROUP BY)
POST /api/students/{id}/resume          Student   (Blob Storage)

INTERVIEW PITCH (60 seconds)
"I built a College Placement Portal using Clean Architecture with CQRS. Writes go through MediatR
commands and EF Core with domain rules in the Drive entity; reads use Dapper queries cached in Redis
with a caching pipeline behavior. When a student applies, the API publishes a StudentApplied event to
RabbitMQ and a separate worker sends the confirmation email, so the API stays fast and email failures
do not affect applications. The UI is Angular with JWT, interceptors and guards. Everything runs with
docker compose locally and deploys to Azure App Service through GitHub Actions with a staging slot."`;

export default {
  id: 'day-30-placement-portal-final-project',
  title: 'Final Enterprise Project: College Placement Portal + Interview Revision',
  module: 'Module 7: DevOps & Cloud for .NET',
  day: 30,
  level: 'Advanced',
  duration: '6 hours (project: 3-5 weeks)',
  summary:
    'Bring the whole course together in one portfolio project: a College Placement Portal built with Clean Architecture and CQRS (MediatR), EF Core for writes and Dapper for reads, a Redis cache, RabbitMQ events, a background email worker, an Angular (or Blazor) UI, Docker compose and Azure deployment. You get the architecture diagram, folder structure, milestones, key code and a runnable CQRS console demo, followed by 30+ mixed interview questions across the advanced course.',
  objectives: [
    'Design an enterprise .NET solution with Clean Architecture layers and the dependency rule',
    'Implement CQRS with MediatR commands, queries and pipeline behaviors (logging, validation, caching)',
    'Combine EF Core (writes) with Dapper (reads), Redis cache-aside and cache invalidation',
    'Publish domain events to RabbitMQ and process them in a background worker that sends emails',
    'Run the full system with docker compose, deploy it to Azure, and explain it confidently in interviews',
  ],
  theory: [
    {
      heading: 'The project: what the College Placement Portal does',
      content:
        'Every engineering college in India has a Training and Placement Office (TPO). Today most of them use Excel sheets and WhatsApp groups. Your portal replaces that. Students register, upload a resume and see only the drives they are eligible for (CGPA, branch, no active backlogs, before the last date). They apply with one click and get a confirmation email. The TPO (Admin) creates drives, sees applicants, and views a branch-wise placement dashboard. Recruiters shortlist and select candidates, and selected students receive an offer letter. This is a realistic, explainable domain, and it naturally needs every technology from this course.',
      points: [
        'Roles: Student, Admin (TPO), Recruiter. Use JWT with role claims (Day 26) and [Authorize(Roles=...)]',
        'Core entities: Student, Company, Drive, Application (Applied/Shortlisted/Rejected/Selected), Offer',
        'Non-functional needs: fast reads on result day (cache), email must not slow the API (queue + worker), no data loss (SQL + volumes / Azure SQL backups), secure secrets (Key Vault)',
        'Keep the scope small enough to finish. A finished, deployed, well-explained project beats a half-done "microservices" project',
      ],
    },
    {
      heading: 'Clean Architecture layers and the dependency rule',
      content:
        'Clean Architecture puts business rules in the centre and technical details at the edges. Domain holds entities and rules (Drive.Apply checks CGPA, backlogs, last date and duplicates) and references nothing. Application holds use cases (commands, queries, handlers) and interfaces such as IAppDbContext, IReadDb, ICacheService, IEventBus and IEmailSender. It references only Domain. Infrastructure implements those interfaces with EF Core, Dapper, Redis, RabbitMQ and SMTP. Api (and Worker) are the entry points that wire everything up with DI. Dependencies always point inward, so you can swap RabbitMQ for Azure Service Bus by changing only Infrastructure, and you can unit test handlers with fakes.',
      points: [
        'Domain <- Application <- Infrastructure, and Api references Infrastructure only to call AddInfrastructure() in Program.cs',
        'Controllers stay thin: build a command or query, call mediator.Send, map the result to an HTTP response',
        'Use a Result type for expected business failures ("Already applied"). Use exceptions for unexpected failures',
        'Domain events (StudentAppliedEvent) record "something happened". Infrastructure publishes them after SaveChanges',
      ],
    },
    {
      heading: 'CQRS with MediatR, EF Core for writes and Dapper for reads',
      content:
        'CQRS (Command Query Responsibility Segregation) separates operations that CHANGE state (commands: ApplyToDrive) from operations that READ state (queries: GetEligibleDrives). Each request has one handler class, so code is small and focused. MediatR dispatches a request to its handler, and pipeline behaviors wrap every request like middleware: logging, validation (FluentValidation) and caching. The write side uses EF Core with rich domain entities, change tracking and transactions. The read side uses Dapper with hand-written SQL that returns DTOs directly. This is fast, there is no tracking, and complex joins and GROUP BY for dashboards are easy. Both sides can share one database. Separate read databases are an advanced option, not a requirement.',
      points: [
        'services.AddMediatR(cfg => { cfg.RegisterServicesFromAssembly(...); cfg.AddOpenBehavior(typeof(ValidationBehavior<,>)); })',
        'Behaviors run in the order registered: Logging -> Validation -> Caching -> Handler',
        'Commands return little (an id, a Result). Queries return DTOs, never entities',
        'Licensing note: MediatR 13+ needs a commercial licence for larger companies. Version 12 (MIT) or a small hand-written mediator (see the console demo) are alternatives. Interviewers like it when you know this',
      ],
    },
    {
      heading: 'Redis cache, RabbitMQ events and the background email job',
      content:
        'Reads such as "eligible drives" are requested thousands of times on drive day but change rarely. A caching behavior uses cache-aside: look in Redis, on a miss run the Dapper query and store the result with a TTL (5 minutes). When a student applies, the command handler removes the keys starting with drives: (invalidation), so nobody sees stale data for long. Sending email inside the HTTP request is slow and fragile. If SMTP is down, should the application fail? No. So after SaveChanges, the API publishes a StudentApplied message to a RabbitMQ topic exchange. A separate Worker (BackgroundService) consumes the queue, sends the email and ACKs only after success. Failed messages go to a dead-letter queue for retry or inspection.',
      points: [
        'Message durability: durable exchange and queue, persistent messages, manual ack, prefetch (BasicQos) to limit in-flight work',
        'At-least-once delivery means a message can arrive twice, so make consumers idempotent (store the processed MessageId)',
        'Outbox pattern: save the event in an OutboxMessages table in the SAME transaction as the data, and a background publisher sends it. This avoids "saved but not published"',
        'Scoped services (DbContext, IEmailSender) inside a singleton BackgroundService need IServiceScopeFactory.CreateScope()',
        'The daily reminder job uses PeriodicTimer or a Quartz/Hangfire schedule',
      ],
    },
    {
      heading: 'UI choice, Docker compose and Azure deployment',
      content:
        'For the UI, Angular (Days 25-26) is the common enterprise choice: standalone components, an HttpClient service, an authInterceptor and guards. Blazor is a good alternative if your team wants C# everywhere. A Blazor Web App with interactive server components can call the same API with HttpClient and use AuthenticationStateProvider. Locally, one docker compose file runs SQL Server, Redis, RabbitMQ (with the management UI), MailHog, the API, the Worker and the UI, with health checks so everything starts in order. In Azure: the API runs on App Service with a staging slot, the Worker on Container Apps, the UI on Static Web Apps, and Azure SQL, Azure Cache for Redis, RabbitMQ (CloudAMQP) or Azure Service Bus as dependencies. Key Vault and Managed Identity handle secrets, and Application Insights handles monitoring. GitHub Actions builds, tests, deploys to staging and swaps after approval.',
      points: [
        'Use the same image for every environment and change only configuration (environment variables, Key Vault)',
        'Run EF migrations from the pipeline with a migration bundle, not at app startup when there are many instances',
        'A README with an architecture diagram, "docker compose up" steps, screenshots and a live URL makes recruiters take the project seriously',
      ],
    },
  ],
  examples: [
    {
      title: 'Architecture diagram and folder structure',
      scenario:
        'Before writing code, the team lead asks for a one-page architecture and the solution layout, so that three freshers can work in parallel without stepping on each other.',
      steps: [
        'Read the text diagram top to bottom: browser -> Angular -> API -> MediatR pipeline -> Application -> Domain/Infrastructure -> SQL/Redis/RabbitMQ -> Worker',
        'Create the solution with the dotnet CLI commands in the second block (PowerShell)',
        'Open PlacementPortal.sln in Visual Studio and check the project references: right-click a project > Add > Project Reference',
        'Commit the empty structure and the docker-compose.yml as milestone M1',
      ],
      code: architectureCode + '\n\n' + structureCode,
      result: `PS> dotnet build PlacementPortal.sln
  Placement.Domain -> src/Placement.Domain/bin/Debug/net8.0/Placement.Domain.dll
  Placement.Application -> src/Placement.Application/bin/Debug/net8.0/Placement.Application.dll
  Placement.Infrastructure -> src/Placement.Infrastructure/bin/Debug/net8.0/Placement.Infrastructure.dll
  Placement.Api -> src/Placement.Api/bin/Debug/net8.0/Placement.Api.dll
  Placement.Worker -> src/Placement.Worker/bin/Debug/net8.0/Placement.Worker.dll
Build succeeded.
    0 Warning(s)
    0 Error(s)`,
      explanation:
        'The project references enforce the dependency rule at compile time. Domain cannot even see EF Core or RabbitMQ, so business rules stay pure and testable. Application defines interfaces, and Infrastructure implements them. Api and Worker are two hosts that share Application and Infrastructure. One team member can build Angular screens against Swagger while another writes Dapper queries.',
    },
    {
      title: 'Key code: domain rule, CQRS command and query, caching behavior, thin controller',
      scenario:
        'Implement the heart of the system: a student applies to the Infosys drive. The rule check lives in the Drive entity, the command saves with EF Core and publishes an event, and the "eligible drives" query uses Dapper and is cached in Redis.',
      steps: [
        'Add Drive.cs to Domain (plus Entity base with DomainEvents and a Result type)',
        'Add the ApplyToDrive command, validator and handler, and the GetEligibleDrives query, handler and DTO to Application',
        'Add the CachingBehavior and register MediatR, behaviors and validators in AddApplication()',
        'Add DrivesController to Api, run the API and call POST /api/drives/7/apply with a Student token from Swagger',
      ],
      code: domainAppCode,
      result: `POST /api/drives/7/apply  (student Ravi, CGPA 7.1, drive Infosys MinCgpa 6.5)
-> 204 No Content
   logs: Handling ApplyToDriveCommand ... Handled in 48 ms
         Removed 3 cache keys with prefix drives:
         Published student.applied (MessageId 9b1c...)

POST /api/drives/7/apply  (same student again)
-> 400 { "title": "Already applied", "status": 400 }

POST /api/drives/9/apply  (drive MinCgpa 8.0)
-> 400 { "title": "Minimum CGPA is 8.0", "status": 400 }

GET /api/drives/eligible  (first call)  -> 200, 41 ms  (Dapper query, then stored in Redis)
GET /api/drives/eligible  (second call) -> 200, 3 ms   (cache hit)`,
      explanation:
        'The controller knows nothing about EF, Redis or RabbitMQ. It only sends a command or query. Business rules are in Drive.Apply, so they are tested once and cannot be bypassed by another endpoint. The command side changes data and invalidates the cache. The query side reads with Dapper (no change tracking) and the CachingBehavior adds caching to any query that implements ICacheableQuery, without touching the handler. Exact timings will differ on your machine.',
    },
    {
      title: 'Infrastructure: Redis service, RabbitMQ publisher and background email worker',
      scenario:
        'Make the event flow real: the API publishes student.applied to RabbitMQ, and the Worker consumes it and sends a confirmation email (to MailHog locally) with manual ack and a dead-letter queue.',
      steps: [
        'Add RedisCacheService, RabbitMqEventBus and AddInfrastructure() to Infrastructure',
        'Create the Worker project (dotnet new worker), add StudentAppliedConsumer and register it with AddHostedService',
        'docker compose up -d rabbitmq redis mailhog, then run the API and the Worker (multiple startup projects in Visual Studio: right-click solution > Configure Startup Projects)',
        'Apply to a drive, then open http://localhost:15672 (queues) and http://localhost:8025 (emails)',
      ],
      code: infraCode,
      result: `RabbitMQ management UI > Queues
Name                    Ready  Unacked  Total
email.student-applied   0      0        0      (message consumed and acked)

Worker console:
info: StudentAppliedConsumer[0]
      Confirmation mail sent to ravi@gcoe.ac.in for drive 7

MailHog inbox (http://localhost:8025):
From: tpo@gcoe.ac.in  To: ravi@gcoe.ac.in
Subject: Applied to Infosys
Hi Ravi Kumar, your application for Infosys is received. All the best!

Stop MailHog and apply again -> SMTP error -> message moved to placement.dlx dead-letter queue, API still returned 204`,
      explanation:
        'The API and the email sending are decoupled. If SMTP fails, the student\'s application is still saved and the message waits in the dead-letter queue for a retry. autoAck: false plus BasicAckAsync after success means a crash in the middle redelivers the message instead of losing it. The consumer is a singleton BackgroundService, so it creates a DI scope for scoped services. The YAML anchor &appenv in compose (next example) gives API and Worker the same settings.',
    },
    {
      title: 'Angular screen, full docker compose and the Azure deployment map',
      scenario:
        'Finish the vertical slice: a student sees eligible drives in Angular and applies, and the whole system starts with one command. Then map each part to an Azure service.',
      steps: [
        'Add EligibleDrivesComponent with a lazy route /drives protected by authGuard (Day 26)',
        'Put the compose file in the solution root and SA_PASSWORD in .env',
        'docker compose up -d --build, then open http://localhost:4200, log in as a student and apply',
        'Follow the Azure map and the Day 29 workflow to deploy. Add the live URL to your README and resume',
      ],
      code: uiDeployCode,
      result: `PS> docker compose up -d --build
 ✔ Container placement-sqlserver-1  Healthy
 ✔ Container placement-redis-1      Healthy
 ✔ Container placement-rabbitmq-1   Healthy
 ✔ Container placement-mailhog-1    Started
 ✔ Container placement-api-1        Started
 ✔ Container placement-worker-1     Started
 ✔ Container placement-ui-1         Started

http://localhost:4200/drives
Drives you can apply for
[Infosys - Systems Engineer - 3.6 LPA (last date 28 Nov)]  [Apply]
[TCS - Ninja - 3.36 LPA (last date 02 Dec)]                [Apply]
Click Apply on Infosys -> "Applied to Infosys. Check your email." and the card disappears`,
      explanation:
        'The Angular component uses signals for state, and the authInterceptor from Day 26 adds the JWT automatically. After applying, it reloads the list, and the drive disappears because the query excludes drives already applied for (NOT EXISTS) and the cache was invalidated by the command. Compose starts the dependencies first because of the health check conditions. The Azure map reuses Days 27-29 without code changes, only configuration.',
    },
    {
      title: 'Runnable console demo: CQRS pipeline, cache-aside and events in plain C#',
      scenario:
        'Explain CQRS in an interview without any NuGet package. A tiny mediator sends queries and commands through a "pipeline" log. The query uses a dictionary as a cache, and a command invalidates it and adds an event to a list that acts as a queue.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it CqrsDemo (.NET 8 or later)',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and match each output line to the code',
        'Put a breakpoint (F9) in the GetEligibleQuery handler and press F5 to see that the second query never reaches the "DB"',
      ],
      code: simCode,
      csharp: { files: { 'Program.cs': simCode }, stdin: '' },
      result: `1) Query eligible (CGPA >= 7.0)
[pipeline] -> GetEligibleQuery
  cache MISS eligible:7.0 -> query DB
[pipeline] <- GetEligibleQuery
   Asha, Ravi
2) Same query again
[pipeline] -> GetEligibleQuery
  cache HIT eligible:7.0
[pipeline] <- GetEligibleQuery
   Asha, Ravi
3) Commands
[pipeline] -> ApplyToDriveCommand
[pipeline] <- ApplyToDriveCommand
   Applied: Ravi -> TCS
[pipeline] -> ApplyToDriveCommand
[pipeline] <- ApplyToDriveCommand
   Rejected: Neha CGPA 6.8 < 7.0
4) Query after a write
[pipeline] -> GetEligibleQuery
  cache MISS eligible:7.0 -> query DB
[pipeline] <- GetEligibleQuery
   Asha, Ravi
5) Events in queue: 1
   StudentApplied:2:TCS`,
      explanation:
        'The decimal 7.0m keeps its scale, so the cache key is "eligible:7.0" (InvariantCulture is set so a comma never appears). The first query misses and stores ["Asha", "Ravi"] (sorted by CGPA descending: 8.4, 7.1). The second query hits the cache and never touches the list. Ravi\'s command succeeds, adds one event and clears the cache. Neha\'s command is rejected by the rule (6.8 < 7.0), so no event is added. The third query misses again because of the invalidation. Every request passes through Send, which prints the "[pipeline]" lines before and after the handler, just like a MediatR logging behavior.',
    },
    {
      title: 'Milestones, endpoint list and the 60-second interview pitch',
      scenario:
        'Plan the build so it actually gets finished, and prepare how you will present it in a campus or lateral interview.',
      steps: [
        'Copy the milestones into GitHub Projects (one issue per bullet)',
        'Finish M1-M3 before starting the UI. A working API with Swagger is the backbone',
        'Practise the pitch aloud until it takes under 60 seconds, and be ready to go deep into any one box of the diagram',
      ],
      code: milestonesCode,
      result: `GitHub Projects board "Placement Portal"
Todo (21) | In progress (3) | Review (2) | Done (14)
Milestone M3 CQRS API: 9/12 issues closed

README badges: build passing | tests 126 passed | deployed: https://placement-api-gcoe.azurewebsites.net/health/ready`,
      explanation:
        'Interviewers do not expect every feature. They expect you to explain WHY each part exists: why CQRS (simple handlers, optimised reads), why Redis (drive-day load), why RabbitMQ (email must not block or fail the request), and why Docker and Azure slots (repeatable, zero-downtime releases). Milestones keep the project shippable at every stage.',
    },
  ],
  interview: [
    { q: 'ADO.NET: what is the difference between ExecuteReader, ExecuteScalar and ExecuteNonQuery?', a: 'ExecuteReader returns a forward-only SqlDataReader for row sets. ExecuteScalar returns the first column of the first row (COUNT, a new identity). ExecuteNonQuery returns the number of affected rows for INSERT/UPDATE/DELETE or DDL.', level: 'Easy' },
    { q: 'ADO.NET: why use SqlParameter instead of string concatenation, and why "using" for connections?', a: 'Parameters prevent SQL injection and let SQL Server reuse query plans. using (or await using) disposes the connection, which returns it to the connection pool even when an exception happens. Leaking connections exhausts the pool ("Timeout expired... max pool size").', level: 'Easy' },
    { q: 'ADO.NET: connected vs disconnected architecture?', a: 'Connected: SqlDataReader keeps the connection open while you read row by row. It is fast and uses little memory. Disconnected: SqlDataAdapter.Fill loads a DataSet/DataTable into memory and closes the connection. You can work offline and push changes back with Update().', level: 'Medium' },
    { q: 'Dapper vs EF Core - when do you use which?', a: 'EF Core: rich domain models, change tracking, migrations, LINQ and less SQL. It is good for writes and CRUD. Dapper: a micro-ORM that maps your SQL to objects with very low overhead. It is good for complex reads, reports, dashboards and stored procedures. Many projects use EF Core for commands and Dapper for queries (CQRS).', level: 'Medium' },
    { q: 'Dapper: how do you map a one-to-many join and run multiple result sets?', a: 'Multi-mapping: conn.QueryAsync<Drive, Application, Drive>(sql, (d, a) => {...}, splitOn: "Id"), grouping children into a dictionary. Multiple result sets: using var grid = await conn.QueryMultipleAsync(sql) then grid.ReadAsync<T>() for each set.', level: 'Hard' },
    { q: 'Clean Architecture: what is the dependency rule and why does it matter?', a: 'Source code dependencies point only inward: Infrastructure/UI -> Application -> Domain. Inner layers define interfaces, and outer layers implement them. Business rules do not depend on frameworks or databases, so they are testable and the infrastructure can be replaced.', level: 'Medium' },
    { q: 'Where do validation and business rules go in Clean Architecture?', a: 'Input or shape validation (required, ranges) goes in the Application layer, for example with FluentValidation in a pipeline behavior. Business invariants ("cannot apply after the last date", "minimum CGPA") go in Domain entities. API model validation is the first, outer check.', level: 'Medium' },
    { q: 'CQRS: what is it and is it the same as event sourcing?', a: 'CQRS separates commands (change state) from queries (read state), with different models and handlers, and sometimes different stores. Event sourcing stores state as a sequence of events. They are often used together but are independent. You can do CQRS on one normal SQL database.', level: 'Medium' },
    { q: 'MediatR: what are pipeline behaviors? Give examples.', a: 'IPipelineBehavior<TRequest,TResponse> wraps every request handler like middleware. Each behavior can run code before and after next(). Examples: logging and timing, FluentValidation, caching for queries, transactions for commands, authorization and retry.', level: 'Medium' },
    { q: 'Blazor: Server vs WebAssembly vs the .NET 8+ Blazor Web App render modes?', a: 'Blazor Server runs components on the server and sends UI diffs over SignalR: small download, needs a constant connection. WebAssembly runs .NET in the browser: works offline-ish, larger first download, and must call APIs. A .NET 8+ Blazor Web App mixes static SSR, InteractiveServer, InteractiveWebAssembly and InteractiveAuto per component or page.', level: 'Medium' },
    { q: 'Blazor: how do parent and child components communicate?', a: 'Parent to child: [Parameter] properties. Child to parent: an EventCallback<T> parameter the child invokes. Deep trees: [CascadingParameter] or a scoped state service with change notifications.', level: 'Medium' },
    { q: 'Caching: IMemoryCache vs IDistributedCache (Redis) vs HybridCache?', a: 'IMemoryCache is in-process and fastest, but each instance has its own copy, and it is lost on restart. IDistributedCache/Redis is shared by all instances and survives app restarts, at the cost of a network hop and serialisation. HybridCache (.NET 9) combines an L1 memory cache with an L2 distributed cache and prevents cache stampedes.', level: 'Medium' },
    { q: 'Caching: what is cache-aside and how do you avoid stale data?', a: 'Cache-aside: read the cache, on a miss read the database and store the result with a TTL. On writes, invalidate (remove) the affected keys or update them. Use short TTLs for volatile data, versioned keys, or event-based invalidation.', level: 'Medium' },
    { q: 'Caching: what is a cache stampede and how do you prevent it?', a: 'When a popular key expires, many requests miss at the same moment and all hit the database. Prevent it with locking or single-flight (only one request rebuilds, which HybridCache does), staggered or random TTLs, or refreshing ahead of expiry.', level: 'Hard' },
    { q: 'Messaging: queue vs topic (pub/sub)? Exchange types in RabbitMQ?', a: 'A queue delivers each message to ONE consumer (competing consumers). Pub/sub delivers a copy to EVERY subscriber. In RabbitMQ, producers publish to exchanges: direct (exact routing key), topic (wildcard patterns like student.*), fanout (all bound queues) and headers. Queues are bound to exchanges.', level: 'Medium' },
    { q: 'Messaging: what are at-least-once delivery, idempotency and dead-letter queues?', a: 'At-least-once: a message may be delivered more than once (for example, a crash before the ack), so consumers must be idempotent: processing twice has the same effect, for example by tracking the MessageId. A dead-letter queue receives messages that were rejected or failed too many times, so they can be inspected or retried.', level: 'Hard' },
    { q: 'What is the Outbox pattern?', a: 'Saving data and publishing a message are two systems, so one can fail. With an outbox you write the event into an Outbox table in the same database transaction as the business data. A background process reads unsent rows, publishes them and marks them sent. This guarantees that events are published if and only if the data was saved.', level: 'Hard' },
    { q: 'Microservices: when should you NOT use them?', a: 'For small teams, unclear domain boundaries, early-stage products, or when you cannot run distributed systems (monitoring, CI/CD, data consistency). A modular monolith with Clean Architecture is often better and can be split later.', level: 'Medium' },
    { q: 'Microservices: what are an API Gateway and service discovery? Name .NET tools.', a: 'An API gateway is the single entry point that routes requests to services and handles auth, rate limiting and aggregation (YARP, Ocelot, Azure API Management). Service discovery finds service addresses dynamically (Kubernetes DNS, Consul, .NET Aspire service discovery).', level: 'Medium' },
    { q: 'Microservices: how do you handle a transaction across services?', a: 'Avoid distributed (2PC) transactions. Use the Saga pattern: a sequence of local transactions coordinated by events (choreography) or by an orchestrator, with compensating actions to undo earlier steps on failure. Accept eventual consistency.', level: 'Hard' },
    { q: 'gRPC vs REST?', a: 'gRPC uses HTTP/2 and Protocol Buffers (binary, contract-first .proto files, generated clients). It is faster and smaller and supports streaming, which suits internal service-to-service calls. REST/JSON is human-readable, works everywhere including browsers, and is easy to cache, which suits public APIs. Browsers need gRPC-Web.', level: 'Medium' },
    { q: 'gRPC: what are the four call types?', a: 'Unary (one request, one response), server streaming (one request, a stream of responses), client streaming (a stream of requests, one response) and bidirectional streaming (both sides stream).', level: 'Easy' },
    { q: 'Angular: how does a JWT reach a .NET API on every request, and how are pages protected?', a: 'A functional HTTP interceptor (registered with provideHttpClient(withInterceptors([...]))) clones each request and adds Authorization: Bearer <token>. Route guards (CanActivateFn) block or redirect navigation in the UI. The real protection is [Authorize] on the API.', level: 'Medium' },
    { q: 'Angular: Observable vs Promise, and when must you unsubscribe?', a: 'Observables are lazy, can emit many values, are cancellable and have operators. Promises are eager and single-value. HttpClient observables complete after one value. Long-lived streams (valueChanges, interval, router events) must be unsubscribed with the async pipe or takeUntilDestroyed.', level: 'Medium' },
    { q: 'Docker: image vs container, and why multi-stage builds for .NET?', a: 'An image is a read-only layered template, and a container is a running instance with a writable layer. Multi-stage builds compile with the SDK image and copy only the publish output into the small aspnet runtime image. The result is smaller and more secure, with no SDK or source code.', level: 'Easy' },
    { q: 'Docker: how do containers in compose talk to each other and keep data?', a: 'They talk through a user-defined network using service names as DNS (Server=sqlserver). Data is kept in named volumes (sqldata:/var/opt/mssql), which survive container re-creation and docker compose down (but not down -v).', level: 'Easy' },
    { q: 'Kubernetes: Deployment vs Service vs Ingress?', a: 'A Deployment keeps N replicas of a pod template running and does rolling updates. A Service gives those pods a stable IP and DNS name and load-balances to ready pods. An Ingress routes external HTTP(S) by host and path to Services through an ingress controller.', level: 'Medium' },
    { q: 'Kubernetes: what do liveness and readiness probes do on failure?', a: 'Liveness failure: the kubelet restarts the container. Readiness failure: the pod is removed from Service endpoints (no traffic) but not restarted. Map them to /health/live and /health/ready in ASP.NET Core.', level: 'Medium' },
    { q: 'Azure: how do you keep secrets out of code and config for an App Service?', a: 'Store them in Key Vault. Enable a Managed Identity on the App Service, grant it the Key Vault Secrets User role, and load secrets with AddAzureKeyVault + DefaultAzureCredential or Key Vault references in app settings. Use Managed Identity for Azure SQL and Storage too (passwordless).', level: 'Medium' },
    { q: 'Azure: what are deployment slots and sticky settings?', a: 'Slots are live copies of an App Service (Standard tier+). Deploy to staging, warm up and test, then swap with production for zero-downtime release, and swap back to roll back. Sticky (slot) settings, like the staging database connection string, stay with their slot during a swap.', level: 'Medium' },
    { q: 'Azure + GitHub Actions: describe a secure CI/CD pipeline for this project.', a: 'On PR: restore, build, test. On main: publish once (artifact or container image), build an EF migration bundle, log in to Azure with OIDC (no stored secrets), deploy to the staging slot, smoke-test /health/ready, wait for environment approval, run migrations, swap to production, and monitor Application Insights.', level: 'Hard' },
    { q: 'Scenario: on result day the portal is slow. How do you investigate and fix it?', a: 'Check Application Insights (slow requests and dependencies, p95, Application Map) and SQL Query Store. Common fixes: cache hot queries in Redis, add missing indexes, use Dapper/AsNoTracking for reads, page results, move email/PDF work to the queue, scale out App Service or the K8s HPA, and enable output caching for public pages.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Implement the ShortlistApplicant command: a Recruiter changes an Application from Applied to Shortlisted. Put the status-change rule in the domain, and publish application.shortlisted.',
      hint: 'Add a method Application.Shortlist() that returns Result.Fail if the status is not Applied.',
      solution: `// Domain
public Result Shortlist()
{
    if (Status != ApplicationStatus.Applied) return Result.Fail($"Cannot shortlist from {Status}");
    Status = ApplicationStatus.Shortlisted;
    AddDomainEvent(new ApplicationShortlistedEvent(Id, StudentId, DriveId));
    return Result.Ok();
}
// Application
public record ShortlistApplicantCommand(int ApplicationId) : IRequest<Result>;
public class ShortlistApplicantHandler(IAppDbContext db, IEventBus bus) : IRequestHandler<ShortlistApplicantCommand, Result>
{
    public async Task<Result> Handle(ShortlistApplicantCommand c, CancellationToken ct)
    {
        var app = await db.Applications.FindAsync([c.ApplicationId], ct);
        if (app is null) return Result.Fail("Not found");
        var r = app.Shortlist();
        if (!r.Success) return r;
        await db.SaveChangesAsync(ct);
        await bus.PublishAsync("application.shortlisted", new { app.Id, app.StudentId, app.DriveId }, ct);
        return r;
    }
}`,
    },
    {
      task: 'Write the Dapper query for the TPO dashboard: for each branch show total students, placed students and placement percentage (one decimal).',
      hint: 'LEFT JOIN Offers, COUNT(DISTINCT ...), CAST(... AS decimal(5,1)).',
      solution: `const string sql = """
    SELECT s.Branch,
           COUNT(DISTINCT s.Id) AS Total,
           COUNT(DISTINCT o.StudentId) AS Placed,
           CAST(100.0 * COUNT(DISTINCT o.StudentId) / COUNT(DISTINCT s.Id) AS decimal(5,1)) AS PlacedPercent
    FROM Students s
    LEFT JOIN Offers o ON o.StudentId = s.Id
    GROUP BY s.Branch
    ORDER BY PlacedPercent DESC;
    """;
public record BranchStat(string Branch, int Total, int Placed, decimal PlacedPercent);
var stats = await conn.QueryAsync<BranchStat>(sql);`,
    },
    {
      task: 'Add a ValidationBehavior that runs all FluentValidation validators for a request and throws a ValidationException that the API turns into a 400 ProblemDetails.',
      hint: 'Inject IEnumerable<IValidator<TRequest>>.',
      solution: `public class ValidationBehavior<TRequest, TResponse>(IEnumerable<IValidator<TRequest>> validators)
    : IPipelineBehavior<TRequest, TResponse> where TRequest : notnull
{
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken ct)
    {
        if (!validators.Any()) return await next();
        var context = new ValidationContext<TRequest>(request);
        var results = await Task.WhenAll(validators.Select(v => v.ValidateAsync(context, ct)));
        var failures = results.SelectMany(r => r.Errors).Where(f => f is not null).ToList();
        if (failures.Count > 0) throw new ValidationException(failures);
        return await next();
    }
}
// Api: an IExceptionHandler maps ValidationException -> 400 ValidationProblemDetails`,
    },
    {
      task: 'Make the email consumer idempotent: if the same MessageId arrives twice, the email must be sent only once.',
      hint: 'Store processed message ids in a ProcessedMessages table (or Redis SET with NX) before or together with the side effect.',
      solution: `var messageId = ea.BasicProperties.MessageId!;
var db = scope.ServiceProvider.GetRequiredService<PlacementDbContext>();
if (await db.ProcessedMessages.AnyAsync(m => m.Id == messageId, ct))
{
    await channel.BasicAckAsync(ea.DeliveryTag, false);      // duplicate: ack and skip
    return;
}
await email.SendAsync(...);
db.ProcessedMessages.Add(new ProcessedMessage { Id = messageId, ProcessedAtUtc = DateTime.UtcNow });
await db.SaveChangesAsync(ct);
await channel.BasicAckAsync(ea.DeliveryTag, false);
// Redis alternative: await redisDb.StringSetAsync("msg:" + messageId, 1, TimeSpan.FromDays(7), When.NotExists) returns false for duplicates`,
    },
    {
      task: 'Build the "My Applications" page in Blazor instead of Angular (InteractiveServer), calling GET /api/applications/mine with a typed HttpClient.',
      hint: '@rendermode InteractiveServer, inject a service, load in OnInitializedAsync.',
      solution: `@page "/my-applications"
@rendermode InteractiveServer
@inject PlacementApiClient Api

<h3>My Applications</h3>
@if (apps is null) { <p>Loading...</p> }
else
{
    <table class="table">
        @foreach (var a in apps)
        {
            <tr><td>@a.Company</td><td>@a.Role</td><td>@a.Status</td></tr>
        }
    </table>
}

@code {
    private List<MyApplicationDto>? apps;
    protected override async Task OnInitializedAsync() => apps = await Api.GetMyApplicationsAsync();
}

// Program.cs: builder.Services.AddHttpClient<PlacementApiClient>(c => c.BaseAddress = new Uri(builder.Configuration["ApiUrl"]!))
//             .AddHttpMessageHandler<BearerTokenHandler>();`,
    },
    {
      task: 'Write the README "Architecture decisions" section: 5 decisions with one-line reasons (an interviewer will read it).',
      hint: 'Decision + why + trade-off.',
      solution: `1. Clean Architecture (4 projects): business rules independent of EF/RabbitMQ; trade-off: more projects/boilerplate.
2. CQRS with MediatR: small focused handlers + cross-cutting behaviors; trade-off: indirection, licensing (pinned v12).
3. EF Core for writes, Dapper for reads: domain model + fast reporting SQL; trade-off: two data access styles.
4. Redis cache-aside with prefix invalidation: drive-day read load; trade-off: up to 5 min staleness for other keys.
5. RabbitMQ + worker for email: API stays fast and resilient to SMTP failures; trade-off: eventual consistency, need idempotency/outbox.`,
    },
  ],
  quiz: [
    {
      question: 'In Clean Architecture, which project may reference EF Core and RabbitMQ.Client?',
      options: ['Domain', 'Application', 'Infrastructure', 'All of them'],
      answer: 2,
      explanation: 'Infrastructure implements the interfaces declared in Application using concrete technologies. Domain and Application stay framework-free.',
    },
    {
      question: 'In the portal, why is the confirmation email sent by a worker through RabbitMQ instead of inside the Apply API call?',
      options: ['RabbitMQ sends emails itself', 'So the API stays fast and an SMTP failure does not fail or slow down the student\'s application', 'Because EF Core cannot send emails', 'To avoid using JWT'],
      answer: 1,
      explanation: 'Queueing decouples the slow, unreliable side effect from the request. The worker retries or dead-letters failures.',
    },
    {
      question: 'In the console demo, why does step 4 show "cache MISS" again?',
      options: ['The cache TTL expired', 'The query used a different key', 'Ravi\'s successful ApplyToDriveCommand cleared the cache', 'Dictionaries cannot hold lists'],
      answer: 2,
      explanation: 'The command handler calls cache.Clear() after a successful write (invalidation). Neha\'s rejected command did not clear it, but Ravi\'s had already done so.',
    },
    {
      question: 'Which MediatR feature is the right place to add caching to every query that implements ICacheableQuery?',
      options: ['A pipeline behavior (IPipelineBehavior)', 'A notification handler', 'The controller constructor', 'appsettings.json'],
      answer: 0,
      explanation: 'Pipeline behaviors wrap every request, so a CachingBehavior can check "request is ICacheableQuery" and apply cache-aside without changing handlers.',
    },
    {
      question: 'Which pattern guarantees that the StudentApplied event is published if and only if the application row was saved?',
      options: ['Singleton pattern', 'Repository pattern', 'Outbox pattern', 'Decorator pattern'],
      answer: 2,
      explanation: 'The outbox stores the event in the same database transaction as the data, and a background publisher sends it later.',
    },
  ],
};
