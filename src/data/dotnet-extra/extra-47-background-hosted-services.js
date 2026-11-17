export default {
  id: 'extra-47-background-hosted-services',
  title: 'Background and Hosted Services',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 47,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Run work outside the HTTP request: IHostedService and BackgroundService lifecycle, periodic jobs with PeriodicTimer, using scoped services (DbContext) safely from a singleton worker, queued background work with System.Threading.Channels, graceful shutdown, the Worker Service template, and when to choose Hangfire or Quartz.NET.',
  objectives: [
    'Explain IHostedService (StartAsync/StopAsync) and BackgroundService (ExecuteAsync) and how the host starts and stops them',
    'Build a periodic cleanup job with PeriodicTimer and IServiceScopeFactory',
    'Build a queued email sender: the API returns 202 Accepted and a Channel-based worker does the slow work',
    'Handle cancellation, exceptions and graceful shutdown correctly',
    'Create a Worker Service project and know when to use a job scheduler library instead',
  ],
  theory: [
    {
      heading: 'Why background services?',
      content: 'Some work should not happen while the user waits for an HTTP response: sending emails, generating reports, cleaning expired data, syncing with another system, processing uploaded files. A hosted service is a class that the ASP.NET Core (or Generic Host) application starts when the app starts and stops when the app shuts down. It runs in the SAME process as your API. Analogy: the restaurant waiter (HTTP request) takes the order and returns immediately; the kitchen staff (background service) cooks in the back.',
      points: [
        'Registered with builder.Services.AddHostedService<MyWorker>() - always as a SINGLETON.',
        'Starts before the server begins accepting requests (StartAsync is called in registration order).',
        'If the app is stopped or recycled (IIS idle timeout!), the background work stops too - use a durable queue for critical jobs.',
        'Never use "fire and forget" Task.Run inside a controller: exceptions are lost and the DbContext of the request is already disposed.',
      ],
    },
    {
      heading: 'IHostedService and BackgroundService',
      content: 'IHostedService has two methods: StartAsync(CancellationToken) and StopAsync(CancellationToken). BackgroundService is an abstract base class that implements them for you; you override ExecuteAsync(CancellationToken stoppingToken), usually a loop that runs until stoppingToken is cancelled. ExecuteAsync runs synchronously until its first real await, so do not put long blocking code before the first await or app start-up will hang. .NET 8 adds IHostedLifecycleService (StartingAsync, StartedAsync, StoppingAsync, StoppedAsync) for fine-grained hooks.',
      syntax: `public class HeartbeatWorker(ILogger<HeartbeatWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            logger.LogInformation("Heartbeat at {Time}", DateTimeOffset.UtcNow);
            await Task.Delay(TimeSpan.FromSeconds(30), stoppingToken);
        }
    }
}
builder.Services.AddHostedService<HeartbeatWorker>();`,
    },
    {
      heading: 'Periodic work with PeriodicTimer and scoped services',
      content: 'PeriodicTimer (.NET 6+) is the modern way to tick at a fixed interval without overlapping runs: while (await timer.WaitForNextTickAsync(stoppingToken)) { ... }. A hosted service is a singleton, but DbContext is SCOPED; injecting AppDbContext directly into the worker throws "Cannot consume scoped service from singleton". Inject IServiceScopeFactory and create a new scope for every run, then resolve the DbContext from that scope.',
      syntax: `await using var scope = scopeFactory.CreateAsyncScope();
var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
int deleted = await db.Carts.Where(c => c.UpdatedAt < cutoff).ExecuteDeleteAsync(stoppingToken);`,
      tip: 'Wrap each run in try/catch and log errors. In .NET 6+ an unhandled exception in ExecuteAsync STOPS THE WHOLE HOST by default (BackgroundServiceExceptionBehavior.StopHost).',
    },
    {
      heading: 'Queued background work with Channels',
      content: 'System.Threading.Channels provides a fast, thread-safe, async producer/consumer queue. Register a singleton queue wrapping Channel<T>; controllers write jobs to it and return 202 Accepted immediately; a BackgroundService reads with await foreach (var job in channel.Reader.ReadAllAsync(stoppingToken)). Bounded channels (Channel.CreateBounded(100)) apply back-pressure so memory cannot explode.',
      points: [
        'Channel.CreateUnbounded<T>() - no limit; Channel.CreateBounded<T>(capacity) - writer waits (or drops) when full.',
        'Writer.TryWrite / WriteAsync to enqueue; Writer.Complete() to say no more items.',
        'An in-memory channel is lost on restart. For guaranteed delivery use Azure Service Bus, RabbitMQ, or Hangfire (stores jobs in SQL Server).',
      ],
    },
    {
      heading: 'Graceful shutdown, Worker Service and job libraries',
      content: 'On Ctrl+C, SIGTERM (Docker/Kubernetes) or IIS recycle, the host cancels stoppingToken and waits up to HostOptions.ShutdownTimeout (30 s default in .NET 8+) for StopAsync to finish. Pass the token to every async call so the worker stops quickly. For a process with NO web server, use the Worker Service template (dotnet new worker) and host it as a Windows Service (AddWindowsService) or Linux systemd service (AddSystemd).',
      syntax: `builder.Services.Configure<HostOptions>(o =>
{
    o.ShutdownTimeout = TimeSpan.FromSeconds(45);
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;
});`,
      points: [
        'Hangfire: persistent fire-and-forget, delayed and recurring (CRON) jobs stored in SQL Server, with a dashboard and retries.',
        'Quartz.NET: powerful scheduler with CRON triggers, clustering, misfire handling.',
        'Azure Functions / WebJobs: serverless background work in the cloud.',
      ],
    },
  ],
  examples: [
    {
      title: 'Periodic expired-cart cleanup with PeriodicTimer and a scoped DbContext',
      scenario: 'An e-commerce API stores shopping carts in SQL Server. Every 10 minutes, carts not updated for 24 hours must be deleted automatically.',
      steps: [
        'Open (or create) an ASP.NET Core Web API project named ShopApi with EF Core SqlServer installed',
        'Add the Cart entity and DbSet<Cart> Carts to AppDbContext; run Add-Migration AddCarts and Update-Database in Package Manager Console',
        'Right-click project > Add > New Folder "Workers" > Add > Class CartCleanupService.cs',
        'Register it in Program.cs with AddHostedService and add the "Cleanup" section to appsettings.json',
        'Press F5 and watch the console/Output window: the first run happens immediately, then every IntervalMinutes',
      ],
      code: `// Models/Cart.cs
namespace ShopApi.Models;
public class Cart
{
    public int Id { get; set; }
    public string UserId { get; set; } = "";
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}

// appsettings.json (part)
{
  "Cleanup": { "IntervalMinutes": 10, "CartLifetimeHours": 24 }
}

// Workers/CartCleanupService.cs
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
namespace ShopApi.Workers;

public class CartCleanupService(
    IServiceScopeFactory scopeFactory,
    IConfiguration config,
    ILogger<CartCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        int minutes = config.GetValue("Cleanup:IntervalMinutes", 10);
        int hours = config.GetValue("Cleanup:CartLifetimeHours", 24);
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(minutes));
        logger.LogInformation("Cart cleanup started, every {Minutes} min", minutes);

        do
        {
            try
            {
                await using var scope = scopeFactory.CreateAsyncScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var cutoff = DateTime.UtcNow.AddHours(-hours);
                int deleted = await db.Carts
                    .Where(c => c.UpdatedAt < cutoff)
                    .ExecuteDeleteAsync(stoppingToken);           // EF Core 7+ bulk delete
                logger.LogInformation("Deleted {Count} expired carts", deleted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Cart cleanup failed; will retry next tick");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public override async Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("Cart cleanup stopping");
        await base.StopAsync(cancellationToken);
    }
}

// Program.cs (relevant lines)
using Microsoft.EntityFrameworkCore;
using ShopApi.Data;
using ShopApi.Workers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddHostedService<CartCleanupService>();
builder.Services.Configure<HostOptions>(o => o.ShutdownTimeout = TimeSpan.FromSeconds(30));

var app = builder.Build();
app.MapControllers();
app.Run();`,
      result: `info: ShopApi.Workers.CartCleanupService[0]
      Cart cleanup started, every 10 min
info: ShopApi.Workers.CartCleanupService[0]
      Deleted 3 expired carts
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:7001
... 10 minutes later ...
info: ShopApi.Workers.CartCleanupService[0]
      Deleted 0 expired carts
(Ctrl+C)
info: Microsoft.Hosting.Lifetime[0]  Application is shutting down...
info: ShopApi.Workers.CartCleanupService[0]  Cart cleanup stopping

SQL sent by ExecuteDeleteAsync:
DELETE FROM [c] FROM [Carts] AS [c] WHERE [c].[UpdatedAt] < @cutoff`,
      explanation: 'The do/while runs once at start-up, then waits for each timer tick. A new DI scope per run gives a fresh DbContext (scoped) that is disposed after the run, avoiding the "scoped from singleton" error and memory growth. The catch keeps the worker alive after a database error, while OperationCanceledException is allowed through so shutdown works. Numbers of deleted carts depend on your data; the first log may appear before or after "Now listening".',
    },
    {
      title: 'Queued welcome emails with Channel<T>: API returns 202 Accepted',
      scenario: 'Sending an email takes 2-3 seconds. The registration API should respond instantly and let a background worker send the email.',
      steps: [
        'In ShopApi add folder Background with EmailQueue.cs and EmailSenderWorker.cs',
        'Add Controllers/NotificationsController.cs',
        'Register the queue as a singleton and the worker as a hosted service in Program.cs',
        'Press F5; in Swagger POST /api/notifications/welcome three times quickly',
        'Each request returns 202 in a few ms; the console shows the emails being sent one by one',
      ],
      code: `// Background/EmailQueue.cs
using System.Threading.Channels;
namespace ShopApi.Background;

public record EmailMessage(string To, string Subject, string Body);

public interface IEmailQueue
{
    ValueTask EnqueueAsync(EmailMessage message, CancellationToken ct = default);
    IAsyncEnumerable<EmailMessage> DequeueAllAsync(CancellationToken ct);
}

public class EmailQueue : IEmailQueue
{
    private readonly Channel<EmailMessage> _channel =
        Channel.CreateBounded<EmailMessage>(new BoundedChannelOptions(100)
        {
            FullMode = BoundedChannelFullMode.Wait,   // writers wait when 100 items are queued
            SingleReader = true
        });

    public ValueTask EnqueueAsync(EmailMessage message, CancellationToken ct = default) =>
        _channel.Writer.WriteAsync(message, ct);

    public IAsyncEnumerable<EmailMessage> DequeueAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}

// Background/EmailSenderWorker.cs
namespace ShopApi.Background;
public class EmailSenderWorker(IEmailQueue queue, ILogger<EmailSenderWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        await foreach (var msg in queue.DequeueAllAsync(stoppingToken))
        {
            try
            {
                await Task.Delay(2000, stoppingToken);   // pretend SMTP call (use MailKit in real apps)
                logger.LogInformation("Email '{Subject}' sent to {To}", msg.Subject, msg.To);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                logger.LogError(ex, "Failed to send email to {To}", msg.To);
            }
        }
    }
}

// Controllers/NotificationsController.cs
using Microsoft.AspNetCore.Mvc;
using ShopApi.Background;
namespace ShopApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController(IEmailQueue queue) : ControllerBase
{
    public record WelcomeRequest(string Email, string Name);

    [HttpPost("welcome")]
    public async Task<IActionResult> Welcome(WelcomeRequest req, CancellationToken ct)
    {
        await queue.EnqueueAsync(new EmailMessage(req.Email, "Welcome to ShopApi",
            "Hi " + req.Name + ", thanks for registering!"), ct);
        return Accepted(new { status = "queued", req.Email });
    }
}

// Program.cs (add)
builder.Services.AddSingleton<IEmailQueue, EmailQueue>();
builder.Services.AddHostedService<EmailSenderWorker>();`,
      result: `POST /api/notifications/welcome  {"email":"asha@example.com","name":"Asha"}
202 Accepted (8 ms)
{"status":"queued","email":"asha@example.com"}

POST ... ravi@example.com  -> 202 Accepted (3 ms)
POST ... meena@example.com -> 202 Accepted (2 ms)

Console (about 2 seconds apart):
info: ShopApi.Background.EmailSenderWorker[0] Email 'Welcome to ShopApi' sent to asha@example.com
info: ShopApi.Background.EmailSenderWorker[0] Email 'Welcome to ShopApi' sent to ravi@example.com
info: ShopApi.Background.EmailSenderWorker[0] Email 'Welcome to ShopApi' sent to meena@example.com`,
      explanation: 'The controller only writes to the channel (microseconds) and returns 202 Accepted, meaning "received, will be processed later". The singleton queue is shared between all requests and the worker. The worker reads items in FIFO order and processes them one at a time. Response times shown are typical examples. If the app restarts, queued but unsent emails are lost - for critical mail use a persistent queue.',
    },
    {
      title: 'Console simulation: BackgroundService lifecycle and graceful shutdown',
      scenario: 'See the exact order of StartAsync, ExecuteAsync, timer ticks, StopAsync and the finally block, without running a web server.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it WorkerLifecycleDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Threading;
using System.Threading.Tasks;

var host = new MiniHost(new CleanupWorker());
await host.RunAsync(ticksBeforeShutdown: 3);

abstract class MiniBackgroundService
{
    private Task? _executeTask;
    private CancellationTokenSource? _cts;

    public Task StartAsync()
    {
        _cts = new CancellationTokenSource();
        _executeTask = ExecuteAsync(_cts.Token);      // runs until its first await
        Console.WriteLine("StartAsync returned (app keeps starting)");
        return Task.CompletedTask;
    }

    public async Task StopAsync()
    {
        Console.WriteLine("StopAsync: signalling cancellation");
        _cts!.Cancel();
        try { await _executeTask!; }
        catch (OperationCanceledException) { }
    }

    protected abstract Task ExecuteAsync(CancellationToken stoppingToken);
}

class CleanupWorker : MiniBackgroundService
{
    public static readonly SemaphoreSlim Tick = new(0);   // plays the role of PeriodicTimer
    public static readonly SemaphoreSlim Done = new(0);   // lets the demo host wait for each run

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Console.WriteLine("Worker started");
        int run = 0;
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Tick.WaitAsync(stoppingToken);
                run++;
                Console.WriteLine("Run " + run + ": deleted " + (run * 2) + " expired carts");
                Done.Release();
            }
        }
        finally
        {
            Console.WriteLine("Worker stopping cleanly after " + run + " runs");
        }
    }
}

class MiniHost(MiniBackgroundService service)
{
    public async Task RunAsync(int ticksBeforeShutdown)
    {
        await service.StartAsync();
        Console.WriteLine("Application started. Press Ctrl+C to shut down.");
        for (int i = 0; i < ticksBeforeShutdown; i++)
        {
            CleanupWorker.Tick.Release();          // timer fires
            await CleanupWorker.Done.WaitAsync();  // wait until that run finished
        }
        await service.StopAsync();                 // Ctrl+C / SIGTERM
        Console.WriteLine("Application stopped");
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Threading;
using System.Threading.Tasks;

var host = new MiniHost(new CleanupWorker());
await host.RunAsync(ticksBeforeShutdown: 3);

abstract class MiniBackgroundService
{
    private Task? _executeTask;
    private CancellationTokenSource? _cts;

    public Task StartAsync()
    {
        _cts = new CancellationTokenSource();
        _executeTask = ExecuteAsync(_cts.Token);      // runs until its first await
        Console.WriteLine("StartAsync returned (app keeps starting)");
        return Task.CompletedTask;
    }

    public async Task StopAsync()
    {
        Console.WriteLine("StopAsync: signalling cancellation");
        _cts!.Cancel();
        try { await _executeTask!; }
        catch (OperationCanceledException) { }
    }

    protected abstract Task ExecuteAsync(CancellationToken stoppingToken);
}

class CleanupWorker : MiniBackgroundService
{
    public static readonly SemaphoreSlim Tick = new(0);   // plays the role of PeriodicTimer
    public static readonly SemaphoreSlim Done = new(0);   // lets the demo host wait for each run

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        Console.WriteLine("Worker started");
        int run = 0;
        try
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                await Tick.WaitAsync(stoppingToken);
                run++;
                Console.WriteLine("Run " + run + ": deleted " + (run * 2) + " expired carts");
                Done.Release();
            }
        }
        finally
        {
            Console.WriteLine("Worker stopping cleanly after " + run + " runs");
        }
    }
}

class MiniHost(MiniBackgroundService service)
{
    public async Task RunAsync(int ticksBeforeShutdown)
    {
        await service.StartAsync();
        Console.WriteLine("Application started. Press Ctrl+C to shut down.");
        for (int i = 0; i < ticksBeforeShutdown; i++)
        {
            CleanupWorker.Tick.Release();          // timer fires
            await CleanupWorker.Done.WaitAsync();  // wait until that run finished
        }
        await service.StopAsync();                 // Ctrl+C / SIGTERM
        Console.WriteLine("Application stopped");
    }
}
`,
        },
        stdin: '',
      },
      result: `Worker started
StartAsync returned (app keeps starting)
Application started. Press Ctrl+C to shut down.
Run 1: deleted 2 expired carts
Run 2: deleted 4 expired carts
Run 3: deleted 6 expired carts
StopAsync: signalling cancellation
Worker stopping cleanly after 3 runs
Application stopped`,
      explanation: '"Worker started" appears BEFORE "StartAsync returned" because ExecuteAsync runs synchronously until its first await (Tick.WaitAsync) - the same reason a blocking loop at the top of a real ExecuteAsync freezes app start-up. Each Release() is a timer tick. StopAsync cancels the token; the pending WaitAsync throws OperationCanceledException (or the while condition fails), the finally block runs, and StopAsync swallows the cancellation - that is graceful shutdown.',
    },
    {
      title: 'Console simulation: producer/consumer queue with Channel<T>',
      scenario: 'Model the email queue: "requests" enqueue jobs instantly, then a consumer drains the channel in order.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ChannelQueueDemo > Create',
        'Replace Program.cs with the code (System.Threading.Channels is part of .NET, no NuGet needed)',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Threading.Channels;
using System.Threading.Tasks;

var channel = Channel.CreateUnbounded<EmailJob>();

// Producers: three API requests, each returns immediately
foreach (var to in new[] { "asha@example.com", "ravi@example.com", "meena@example.com" })
{
    channel.Writer.TryWrite(new EmailJob(to, "Welcome"));
    Console.WriteLine("POST /register " + to + " -> 202 Accepted (queued)");
}
channel.Writer.Complete();                       // no more jobs in this demo
Console.WriteLine("Jobs waiting in queue: " + channel.Reader.Count);

// Consumer: the background worker
int sent = 0;
await foreach (var job in channel.Reader.ReadAllAsync())
{
    await Task.Delay(10);                        // pretend SMTP call
    sent++;
    Console.WriteLine("Worker sent '" + job.Subject + "' to " + job.To);
}
Console.WriteLine("Queue empty. Emails sent: " + sent);

record EmailJob(string To, string Subject);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Threading.Channels;
using System.Threading.Tasks;

var channel = Channel.CreateUnbounded<EmailJob>();

// Producers: three API requests, each returns immediately
foreach (var to in new[] { "asha@example.com", "ravi@example.com", "meena@example.com" })
{
    channel.Writer.TryWrite(new EmailJob(to, "Welcome"));
    Console.WriteLine("POST /register " + to + " -> 202 Accepted (queued)");
}
channel.Writer.Complete();                       // no more jobs in this demo
Console.WriteLine("Jobs waiting in queue: " + channel.Reader.Count);

// Consumer: the background worker
int sent = 0;
await foreach (var job in channel.Reader.ReadAllAsync())
{
    await Task.Delay(10);                        // pretend SMTP call
    sent++;
    Console.WriteLine("Worker sent '" + job.Subject + "' to " + job.To);
}
Console.WriteLine("Queue empty. Emails sent: " + sent);

record EmailJob(string To, string Subject);
`,
        },
        stdin: '',
      },
      result: `POST /register asha@example.com -> 202 Accepted (queued)
POST /register ravi@example.com -> 202 Accepted (queued)
POST /register meena@example.com -> 202 Accepted (queued)
Jobs waiting in queue: 3
Worker sent 'Welcome' to asha@example.com
Worker sent 'Welcome' to ravi@example.com
Worker sent 'Welcome' to meena@example.com
Queue empty. Emails sent: 3`,
      explanation: 'TryWrite on an unbounded channel always succeeds instantly, so all three "requests" finish before any email is sent. Writer.Complete() tells ReadAllAsync to end after the last item, so the await foreach loop terminates. Items come out in FIFO order. In the real app the producer and consumer run at the same time and the worker never calls Complete - it stops when stoppingToken is cancelled.',
    },
  ],
  interview: [
    { q: 'What is the difference between IHostedService and BackgroundService?', a: 'IHostedService is the interface with StartAsync and StopAsync. BackgroundService is an abstract class implementing it that starts a long-running ExecuteAsync(stoppingToken) task and cancels it in StopAsync.', level: 'Easy' },
    { q: 'What lifetime do hosted services have?', a: 'Singleton. AddHostedService registers them as singletons, so they cannot directly depend on scoped services such as DbContext.', level: 'Easy' },
    { q: 'How do you use DbContext inside a BackgroundService?', a: 'Inject IServiceScopeFactory, create a scope (CreateAsyncScope) for each unit of work, resolve AppDbContext from scope.ServiceProvider, and dispose the scope afterwards. Alternatively use IDbContextFactory<T>.', level: 'Medium' },
    { q: 'What happens if ExecuteAsync throws an unhandled exception in .NET 6+?', a: 'The host logs it and stops the application (BackgroundServiceExceptionBehavior.StopHost). Set it to Ignore or, better, catch and log exceptions inside the loop.', level: 'Medium' },
    { q: 'Why can a BackgroundService block application start-up?', a: 'ExecuteAsync is called from StartAsync and runs synchronously until its first incomplete await. Long synchronous work before that await delays the server start. Start with an await (or Task.Yield) and keep work async.', level: 'Hard' },
    { q: 'PeriodicTimer vs System.Threading.Timer?', a: 'PeriodicTimer is async-friendly (await WaitForNextTickAsync), never runs overlapping callbacks and supports cancellation. Timer fires callbacks on thread-pool threads that can overlap if a run takes longer than the interval.', level: 'Medium' },
    { q: 'What is a Channel<T> and why use it for background queues?', a: 'A thread-safe async producer/consumer queue from System.Threading.Channels. Producers write without blocking, consumers await items, bounded channels provide back-pressure. Ideal for an in-process work queue.', level: 'Medium' },
    { q: 'Why is HTTP 202 Accepted returned for queued work?', a: '202 means the request was accepted for processing but processing is not complete. Often a Location header points to a status endpoint the client can poll.', level: 'Easy' },
    { q: 'How long does the host wait during shutdown?', a: 'HostOptions.ShutdownTimeout - 30 seconds by default in .NET 8+ (5 seconds in older versions). After that remaining work is abandoned.', level: 'Medium' },
    { q: 'When would you choose Hangfire or Quartz over a BackgroundService?', a: 'When jobs must survive restarts, need retries, CRON schedules, a dashboard, or must run on exactly one node in a cluster.', level: 'Medium' },
    { q: 'Why is Task.Run(() => SendEmail()) in a controller a bad idea?', a: 'Exceptions are unobserved, the request\'s scoped services (DbContext) may be disposed, the host does not know about the work during shutdown, and there is no back-pressure.', level: 'Hard' },
  ],
  practice: [
    { task: 'Create a BackgroundService that logs the number of products with Stock < 5 every minute.', hint: 'PeriodicTimer + IServiceScopeFactory.', solution: 'using var timer = new PeriodicTimer(TimeSpan.FromMinutes(1)); while (await timer.WaitForNextTickAsync(ct)) { await using var scope = factory.CreateAsyncScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); int low = await db.Products.CountAsync(p => p.Stock < 5, ct); logger.LogWarning("{Count} products low on stock", low); }' },
    { task: 'Build a report-generation queue: POST /api/reports returns 202 with a reportId; GET /api/reports/{id} returns status Pending/Done.', hint: 'Use a ConcurrentDictionary<Guid, string> for statuses plus a Channel<Guid>.', solution: 'POST: var id = Guid.NewGuid(); statuses[id] = "Pending"; await channel.Writer.WriteAsync(id); return AcceptedAtAction(nameof(Status), new { id }, new { id }); Worker: await foreach (var id in reader.ReadAllAsync(ct)) { await GenerateAsync(id); statuses[id] = "Done"; } GET returns statuses.TryGetValue(id, out var s) ? Ok(new { id, status = s }) : NotFound();' },
    { task: 'Create a Worker Service that runs as a Windows Service and writes a heartbeat to a log file every 30 seconds.', hint: 'dotnet new worker -n HeartbeatService; install Microsoft.Extensions.Hosting.WindowsServices.', solution: 'var builder = Host.CreateApplicationBuilder(args); builder.Services.AddWindowsService(o => o.ServiceName = "Heartbeat"); builder.Services.AddHostedService<Worker>(); builder.Build().Run(); Publish, then: sc.exe create Heartbeat binPath= "C:\\svc\\HeartbeatService.exe" and sc.exe start Heartbeat.' },
    { task: 'Make the email worker retry a failed email up to 3 times with 1, 2 and 4 second delays.', hint: 'Loop with attempt counter and Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt))).', solution: 'for (int attempt = 0; attempt < 3; attempt++) { try { await sender.SendAsync(msg, ct); break; } catch (Exception ex) when (attempt < 2) { logger.LogWarning(ex, "Retry {Attempt}", attempt + 1); await Task.Delay(TimeSpan.FromSeconds(Math.Pow(2, attempt)), ct); } }' },
    { task: 'Implement IHostedLifecycleService to log "Warming cache" in StartingAsync and "Flushing logs" in StoppedAsync (.NET 8+).', hint: 'Implement all six methods; return Task.CompletedTask for the unused ones.', solution: 'public class LifecycleLogger(ILogger<LifecycleLogger> l) : IHostedLifecycleService { public Task StartingAsync(CancellationToken ct) { l.LogInformation("Warming cache"); return Task.CompletedTask; } public Task StoppedAsync(CancellationToken ct) { l.LogInformation("Flushing logs"); return Task.CompletedTask; } public Task StartAsync(CancellationToken ct) => Task.CompletedTask; public Task StartedAsync(CancellationToken ct) => Task.CompletedTask; public Task StopAsync(CancellationToken ct) => Task.CompletedTask; public Task StoppingAsync(CancellationToken ct) => Task.CompletedTask; }' },
  ],
  quiz: [
    { question: 'Which method do you override in a BackgroundService?', options: ['RunAsync', 'ExecuteAsync', 'InvokeAsync', 'HandleAsync'], answer: 1, explanation: 'BackgroundService calls the protected abstract ExecuteAsync(CancellationToken).' },
    { question: 'How do you register a hosted service?', options: ['builder.Services.AddScoped<Worker>()', 'app.UseHostedService<Worker>()', 'builder.Services.AddHostedService<Worker>()', 'app.MapWorker<Worker>()'], answer: 2, explanation: 'AddHostedService registers it as a singleton IHostedService.' },
    { question: 'Injecting AppDbContext directly into a hosted service constructor causes...', options: ['Nothing, it works fine', 'Faster queries', 'A compile error', 'A "cannot consume scoped service from singleton" error'], answer: 3, explanation: 'DbContext is scoped; use IServiceScopeFactory to create scopes.' },
    { question: 'Which type gives an async, thread-safe producer/consumer queue?', options: ['Channel<T>', 'List<T>', 'Dictionary<TKey,TValue>', 'StringBuilder'], answer: 0, explanation: 'System.Threading.Channels.Channel<T> is designed for this.' },
    { question: 'What status code best fits "the job is queued and will run later"?', options: ['200 OK', '201 Created', '202 Accepted', '204 No Content'], answer: 2, explanation: '202 Accepted signals asynchronous processing.' },
  ],
};
