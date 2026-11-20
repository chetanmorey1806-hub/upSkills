const otpCleanupCode = `// ===== Services/OtpCleanupService.cs =====
// Deletes expired OTP rows every 5 minutes while the app is running.
public class OtpCleanupService(
    IServiceScopeFactory scopeFactory,                 // BackgroundService is a SINGLETON
    ILogger<OtpCleanupService> logger) : BackgroundService
{
    private readonly TimeSpan period = TimeSpan.FromMinutes(5);

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        logger.LogInformation("OTP cleanup started");
        using var timer = new PeriodicTimer(period);

        // run once at startup, then on every tick
        do
        {
            try
            {
                // DbContext is SCOPED -> create a scope for each run
                using var scope = scopeFactory.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                int deleted = await db.Otps
                    .Where(o => o.ExpiresAt < DateTime.UtcNow)
                    .ExecuteDeleteAsync(stoppingToken);

                logger.LogInformation("Removed {Count} expired OTPs", deleted);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                // never let one failure kill the loop (and in .NET 8 an unhandled
                // exception here stops the whole host by default)
                logger.LogError(ex, "OTP cleanup failed");
            }
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }

    public override Task StopAsync(CancellationToken cancellationToken)
    {
        logger.LogInformation("OTP cleanup stopping (app is shutting down)");
        return base.StopAsync(cancellationToken);
    }
}

// ===== Program.cs =====
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddHostedService<OtpCleanupService>();

// Optional: how to behave when a BackgroundService throws (.NET 6+)
builder.Services.Configure<HostOptions>(o =>
{
    o.BackgroundServiceExceptionBehavior = BackgroundServiceExceptionBehavior.Ignore;  // default: StopHost
    o.ShutdownTimeout = TimeSpan.FromSeconds(30);                                      // time to finish work
});

// ===== The raw interface (what BackgroundService implements for you) =====
public interface IHostedService
{
    Task StartAsync(CancellationToken cancellationToken);   // called at app start
    Task StopAsync(CancellationToken cancellationToken);    // called at graceful shutdown
}

// ===== Worker Service template (no web server) =====
// dotnet new worker -n ReportWorker
// var builder = Host.CreateApplicationBuilder(args);
// builder.Services.AddHostedService<Worker>();
// builder.Build().Run();
// Can run as a Windows Service (AddWindowsService) or a Linux systemd service (AddSystemd)`;

const queueCode = `// ===== Services/BackgroundTaskQueue.cs =====
using System.Threading.Channels;

public interface IBackgroundTaskQueue
{
    ValueTask QueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem);
    ValueTask<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken ct);
}

public class BackgroundTaskQueue : IBackgroundTaskQueue
{
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> channel =
        Channel.CreateBounded<Func<IServiceProvider, CancellationToken, Task>>(
            new BoundedChannelOptions(500) { FullMode = BoundedChannelFullMode.Wait });

    public ValueTask QueueAsync(Func<IServiceProvider, CancellationToken, Task> workItem) =>
        channel.Writer.WriteAsync(workItem);

    public ValueTask<Func<IServiceProvider, CancellationToken, Task>> DequeueAsync(CancellationToken ct) =>
        channel.Reader.ReadAsync(ct);
}

// ===== Services/QueuedWorker.cs =====
public class QueuedWorker(IBackgroundTaskQueue queue, IServiceScopeFactory scopes,
                          ILogger<QueuedWorker> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            try
            {
                var work = await queue.DequeueAsync(stoppingToken);
                using var scope = scopes.CreateScope();
                await work(scope.ServiceProvider, stoppingToken);
            }
            catch (OperationCanceledException) { break; }
            catch (Exception ex) { logger.LogError(ex, "Queued work item failed"); }
        }
    }
}

// ===== Program.cs =====
builder.Services.AddSingleton<IBackgroundTaskQueue, BackgroundTaskQueue>();
builder.Services.AddHostedService<QueuedWorker>();
builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();

// ===== Endpoint: respond immediately, do the slow work in the background =====
app.MapPost("/api/reports/marksheet/{studentId:int}", async (int studentId, IBackgroundTaskQueue queue) =>
{
    await queue.QueueAsync(async (sp, ct) =>
    {
        var email = sp.GetRequiredService<IEmailSender>();
        await Task.Delay(3000, ct);                                   // generate PDF...
        await email.SendAsync($"student{studentId}@college.in", "Your marksheet", "PDF attached");
    });
    return Results.Accepted(value: new { message = "Marksheet will be emailed in a few minutes" });
});
// Warning: an in-memory queue is LOST if the app restarts. For important jobs use Hangfire or a message broker.`;

const hangfireCode = `// ===== NuGet =====
// dotnet add package Hangfire.Core
// dotnet add package Hangfire.AspNetCore
// dotnet add package Hangfire.SqlServer

// ===== appsettings.json =====
// "ConnectionStrings": { "Hangfire": "Server=.;Database=SchoolJobs;Trusted_Connection=True;TrustServerCertificate=True" }

// ===== Program.cs =====
using Hangfire;
using Hangfire.Dashboard;

builder.Services.AddHangfire(config => config
    .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
    .UseSimpleAssemblyNameTypeSerializer()
    .UseRecommendedSerializerSettings()
    .UseSqlServerStorage(builder.Configuration.GetConnectionString("Hangfire")));   // jobs are stored in SQL Server

builder.Services.AddHangfireServer(options => options.WorkerCount = 5);           // processes jobs
builder.Services.AddScoped<FeeReminderService>();

var app = builder.Build();

app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = [new AdminOnlyDashboardFilter()]       // dashboard is local-only by default
});

// 1. Fire-and-forget: run once, as soon as possible
app.MapPost("/api/students/{id:int}/welcome", (int id, IBackgroundJobClient jobs) =>
{
    string jobId = jobs.Enqueue<FeeReminderService>(s => s.SendWelcomeEmailAsync(id));
    return Results.Accepted(value: new { jobId });
});

// 2. Delayed: run once after a delay
app.MapPost("/api/admissions/{id:int}", (int id, IBackgroundJobClient jobs) =>
{
    jobs.Schedule<FeeReminderService>(s => s.SendFeeReminderAsync(id), TimeSpan.FromDays(3));
    return Results.Ok();
});

// 3. Recurring: CRON schedule (every day at 09:00 India time)
RecurringJob.AddOrUpdate<FeeReminderService>(
    "daily-fee-reminders",
    s => s.SendAllPendingRemindersAsync(),
    "0 9 * * *",                                           // or Cron.Daily(9)
    new RecurringJobOptions { TimeZone = TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata") });

// 4. Continuation: run B after A succeeds
// var a = BackgroundJob.Enqueue(() => Console.WriteLine("Generate report"));
// BackgroundJob.ContinueJobWith(a, () => Console.WriteLine("Email report"));

app.Run();

// ===== Services/FeeReminderService.cs =====
public class FeeReminderService(AppDbContext db, IEmailSender email, ILogger<FeeReminderService> logger)
{
    [AutomaticRetry(Attempts = 3)]                         // default is 10 retries with growing delays
    public async Task SendWelcomeEmailAsync(int studentId)
    {
        var s = await db.Students.FindAsync(studentId) ?? throw new InvalidOperationException("Student not found");
        await email.SendAsync(s.Email, "Welcome!", $"Hi {s.Name}, welcome to the college.");
    }

    public async Task SendFeeReminderAsync(int studentId) { /* ... */ }

    public async Task SendAllPendingRemindersAsync()
    {
        var pending = await db.Students.Where(s => s.FeeDue > 0).ToListAsync();
        foreach (var s in pending)
            await email.SendAsync(s.Email, "Fee reminder", $"Rs {s.FeeDue} is pending.");
        logger.LogInformation("Sent {Count} fee reminders", pending.Count);
    }
}

// ===== Dashboard security =====
public class AdminOnlyDashboardFilter : IDashboardAuthorizationFilter
{
    public bool Authorize(DashboardContext context) =>
        context.GetHttpContext().User.IsInRole("Admin");
}`;

const quartzCode = `// ===== Quartz.NET: advanced scheduler (CRON, calendars, clustering) =====
// dotnet add package Quartz.Extensions.Hosting
using Quartz;

builder.Services.AddQuartz(q =>
{
    var jobKey = new JobKey("MonthlyAttendanceReport");
    q.AddJob<AttendanceReportJob>(o => o.WithIdentity(jobKey));
    q.AddTrigger(t => t
        .ForJob(jobKey)
        .WithIdentity("monthly-trigger")
        .WithCronSchedule("0 0 7 1 * ?",                       // Quartz CRON has SECONDS first: 07:00 on day 1
            c => c.InTimeZone(TimeZoneInfo.FindSystemTimeZoneById("Asia/Kolkata"))));
});
builder.Services.AddQuartzHostedService(o => o.WaitForJobsToComplete = true);

[DisallowConcurrentExecution]                                   // never run two copies at once
public class AttendanceReportJob(AppDbContext db, ILogger<AttendanceReportJob> logger) : IJob
{
    public async Task Execute(IJobExecutionContext context)
    {
        int students = await db.Students.CountAsync(context.CancellationToken);
        logger.LogInformation("Attendance report generated for {Count} students", students);
    }
}

// Choosing a tool:
// BackgroundService  - simple loops / queues inside your app, no extra infrastructure, no persistence
// Hangfire           - persistent jobs in SQL Server/Redis, automatic retries, built-in dashboard
// Quartz.NET         - rich scheduling (CRON with seconds, calendars, misfire rules), clustering
// Azure Functions / WebJobs - serverless timers and queue triggers in the cloud`;

const consoleCode = `using System;
using System.Threading;
using System.Threading.Channels;
using System.Threading.Tasks;

int smtpTimeoutsLeft = 1;            // the SMTP server is slow once
var channel = Channel.CreateUnbounded<EmailJob>();

// 1. "API requests" put jobs on the queue and return 202 immediately
var jobs = new[]
{
    new EmailJob("asha@college.in", "Fee receipt"),
    new EmailJob("bad-address", "Welcome"),
    new EmailJob("ravi@college.in", "Hall ticket")
};
foreach (var job in jobs)
{
    await channel.Writer.WriteAsync(job);
    Console.WriteLine($"API: queued '{job.Subject}' -> 202 Accepted");
}
channel.Writer.Complete();           // no more jobs (so the demo ends)

// 2. The background worker processes them one by one
await RunWorkerAsync(channel.Reader, CancellationToken.None);

// 3. A periodic job with PeriodicTimer (like a BackgroundService loop)
using var timer = new PeriodicTimer(TimeSpan.FromMilliseconds(100));
int tick = 0;
while (tick < 3 && await timer.WaitForNextTickAsync())
{
    tick++;
    Console.WriteLine($"Cleanup tick {tick}: removed {tick * 2} expired OTPs");
}

async Task RunWorkerAsync(ChannelReader<EmailJob> reader, CancellationToken ct)
{
    await foreach (var job in reader.ReadAllAsync(ct))
    {
        for (int attempt = 1; ; attempt++)
        {
            try
            {
                Send(job);
                Console.WriteLine($"Worker: sent '{job.Subject}' to {job.To} (attempt {attempt})");
                break;
            }
            catch (TimeoutException ex) when (attempt < 3)      // transient -> retry
            {
                Console.WriteLine($"Worker: attempt {attempt} failed ({ex.Message}), retrying");
            }
            catch (Exception ex)                                // permanent -> give up
            {
                Console.WriteLine($"Worker: dropped '{job.Subject}': {ex.Message}");
                break;
            }
        }
    }
    Console.WriteLine("Worker: queue empty, stopping");
}

void Send(EmailJob job)
{
    if (!job.To.Contains('@')) throw new FormatException("invalid address");
    if (job.To.StartsWith("ravi") && smtpTimeoutsLeft > 0)
    {
        smtpTimeoutsLeft--;
        throw new TimeoutException("SMTP timeout");
    }
}

record EmailJob(string To, string Subject);
`;

export default {
  id: 'day-15-background-services-hangfire',
  title: 'Background Work in .NET: IHostedService, BackgroundService, PeriodicTimer, Queues, Hangfire and Quartz.NET',
  module: 'Module 4: Caching, Background Jobs & Messaging',
  day: 15,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Move slow and scheduled work out of the HTTP request. Build hosted services with BackgroundService and PeriodicTimer, use scoped services such as DbContext safely inside them, create an in-memory work queue with Channels, then use Hangfire for persistent fire-and-forget, delayed and recurring jobs with a dashboard, and see when Quartz.NET is the better scheduler.',
  objectives: [
    'Explain IHostedService and BackgroundService and the host start/stop lifecycle',
    'Write a periodic background job with PeriodicTimer and graceful cancellation',
    'Use scoped services (DbContext) inside a singleton background service with IServiceScopeFactory',
    'Queue work from an API and process it in the background with System.Threading.Channels',
    'Use Hangfire for fire-and-forget, delayed, recurring and continuation jobs and secure its dashboard; compare with Quartz.NET',
  ],
  theory: [
    {
      heading: 'Why background processing?',
      content:
        'An HTTP request should finish fast (ideally under a second). Many real tasks are slow or must happen on a schedule: sending emails and SMS, generating PDF marksheets or invoices, resizing images, importing Excel files, calling slow third-party APIs, cleaning expired OTPs, sending daily fee reminders, syncing data at midnight. If you do these inside the request, users wait, requests time out and a failure loses the work. Instead, the API saves the request, returns 202 Accepted (or 200) and a background worker does the job. Options in .NET: hosted services (built in), in-memory queues with Channels, job libraries (Hangfire, Quartz.NET), message brokers (RabbitMQ, Azure Service Bus - Days 16-17) and cloud services (Azure Functions, AWS Lambda).',
      points: [
        'Fire-and-forget: do once, as soon as possible (welcome email)',
        'Delayed: do once, later (reminder after 3 days)',
        'Recurring: on a schedule (every night at 2 AM)',
        'Never use Task.Run(...) without awaiting inside a controller for important work - it is lost on restart and exceptions are swallowed',
      ],
    },
    {
      heading: 'IHostedService and BackgroundService',
      content:
        'IHostedService has two methods: StartAsync (called when the app starts) and StopAsync (called on graceful shutdown, e.g. Ctrl+C, deployment, container stop). Register it with builder.Services.AddHostedService<T>(). Hosted services are singletons. BackgroundService is an abstract base class that implements IHostedService for you; you only override ExecuteAsync(CancellationToken stoppingToken) and write a loop. The stoppingToken is cancelled when the app shuts down, so pass it to every async call and stop cleanly. Hosted services run in ASP.NET Core apps and in the Worker Service template (dotnet new worker), which can run as a Windows Service or Linux systemd service. In .NET 8+ an unhandled exception in ExecuteAsync stops the whole host by default (BackgroundServiceExceptionBehavior.StopHost), so catch and log errors inside the loop.',
      syntax: `public class Worker : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // do work
            await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
        }
    }
}
builder.Services.AddHostedService<Worker>();`,
      points: [
        'StartAsync of all hosted services runs before the app starts serving requests - do not block in it',
        'Long work in StopAsync is limited by HostOptions.ShutdownTimeout (default 30 s since .NET 8)',
        'In IIS the app pool can be recycled or idle-stopped - set "Always Running" or use a Windows Service for reliable jobs',
      ],
    },
    {
      heading: 'PeriodicTimer and scoped services inside background services',
      content:
        'PeriodicTimer (.NET 6+) is the modern way to run code at an interval in async code: await timer.WaitForNextTickAsync(stoppingToken) waits for the next tick, never overlaps runs (if one run takes longer than the period, ticks are not queued up) and returns false when the timer is disposed. A background service is a singleton, but DbContext and most business services are scoped. Injecting a scoped service into a singleton constructor throws "Cannot consume scoped service from singleton" (scope validation in Development). The fix: inject IServiceScopeFactory and create a scope for each unit of work: using var scope = scopeFactory.CreateScope(); var db = scope.ServiceProvider.GetRequiredService<AppDbContext>(); The scope (and its DbContext) is disposed at the end of each run, so you never keep a stale DbContext for days.',
      syntax: `using var timer = new PeriodicTimer(TimeSpan.FromMinutes(5));
while (await timer.WaitForNextTickAsync(stoppingToken))
{
    using var scope = scopeFactory.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    ...
}`,
      points: [
        'Prefer PeriodicTimer over System.Threading.Timer callbacks in async code (no overlapping, no async void)',
        'One scope per iteration / per message, like one scope per HTTP request',
        'With several app instances every instance runs the same loop - use a distributed lock or Hangfire/Quartz clustering if a job must run only once',
      ],
    },
    {
      heading: 'Queue-based background work with Channels',
      content:
        'System.Threading.Channels gives a fast, thread-safe, async producer/consumer queue. An API endpoint (producer) writes a work item to the channel and returns 202 immediately; a BackgroundService (consumer) reads items with ReadAsync/ReadAllAsync and processes them. A bounded channel with FullMode = Wait applies back-pressure when the queue is full. Separate transient errors (timeouts - retry with backoff) from permanent errors (bad data - log and drop). Limitation: the queue lives in memory, so queued items are lost if the process restarts or crashes. For anything important (payments, emails that must go out) use a persistent store: Hangfire (database), or a message broker (RabbitMQ / Azure Service Bus).',
    },
    {
      heading: 'Hangfire: persistent background jobs with a dashboard',
      content:
        'Hangfire (packages Hangfire.Core, Hangfire.AspNetCore and a storage package such as Hangfire.SqlServer) stores jobs in a database, so they survive restarts and can be processed by any server. It serializes the method call (type, method and arguments) and a Hangfire server inside your app picks it up. Job types: BackgroundJob.Enqueue (fire-and-forget), BackgroundJob.Schedule (delayed), RecurringJob.AddOrUpdate with a CRON expression (recurring) and BackgroundJob.ContinueJobWith (continuations). Failed jobs are retried automatically (10 times by default, configurable with [AutomaticRetry]). The dashboard (UseHangfireDashboard("/hangfire")) shows enqueued, processing, succeeded, failed and scheduled jobs and lets you retry or delete them; outside localhost you must add an authorization filter. Keep job arguments small (pass ids, not whole objects) and make jobs idempotent because they may run more than once.',
      syntax: `jobs.Enqueue<EmailService>(s => s.SendWelcomeAsync(studentId));
jobs.Schedule<EmailService>(s => s.SendReminderAsync(id), TimeSpan.FromDays(3));
RecurringJob.AddOrUpdate<ReportService>("daily-report", s => s.RunAsync(), Cron.Daily(9));
BackgroundJob.ContinueJobWith(parentId, () => Notify());`,
      points: [
        'CRON format (5 parts): minute hour day-of-month month day-of-week; "0 9 * * *" = 09:00 every day; "*/15 * * * *" = every 15 minutes',
        'Inject IBackgroundJobClient / IRecurringJobManager instead of static classes for testability',
        'Hangfire Pro adds batches; open-source Hangfire covers most needs',
      ],
    },
    {
      heading: 'Quartz.NET and choosing the right tool',
      content:
        'Quartz.NET is a full-featured scheduler: jobs implement IJob, triggers define when they run (simple intervals or CRON with seconds), calendars exclude holidays, misfire rules decide what to do if the app was down at the scheduled time, and clustering with a database store ensures a job runs on only one node. Register with Quartz.Extensions.Hosting: AddQuartz(...) and AddQuartzHostedService(). Choose: BackgroundService for simple in-app loops and queues; Hangfire when you want persistence, retries and a dashboard with minimal code; Quartz.NET for complex scheduling rules; a message broker when separate services must communicate; Azure Functions timer/queue triggers for serverless.',
    },
  ],
  examples: [
    {
      title: 'BackgroundService + PeriodicTimer + scoped DbContext: delete expired OTPs',
      scenario:
        'A banking-style login sends OTPs that expire after 5 minutes. Old rows pile up in the Otps table. Run a cleanup every 5 minutes inside the Web API using EF Core safely.',
      steps: [
        'Open your Web API with AppDbContext containing DbSet<Otp> Otps (Id, Mobile, Code, ExpiresAt)',
        'Add Services/OtpCleanupService.cs',
        'Register it with builder.Services.AddHostedService<OtpCleanupService>() in Program.cs',
        'Run with F5 and watch the console/Output window; insert a few expired rows in SSMS to see them removed',
        'Press Ctrl+C in the console window to see the graceful shutdown log',
      ],
      code: otpCleanupCode,
      result: `info: OtpCleanupService[0] OTP cleanup started
info: OtpCleanupService[0] Removed 12 expired OTPs
info: Microsoft.Hosting.Lifetime[14] Now listening on: https://localhost:7200
... 5 minutes later ...
info: OtpCleanupService[0] Removed 3 expired OTPs
(Ctrl+C)
info: Microsoft.Hosting.Lifetime[0] Application is shutting down...
info: OtpCleanupService[0] OTP cleanup stopping (app is shutting down)`,
      explanation:
        'The do/while runs once at startup and then on every tick. A new scope is created per run, so each run gets a fresh DbContext - injecting AppDbContext directly into the singleton would fail at startup. ExecuteDeleteAsync (EF Core 7+) deletes in one SQL statement. The try/catch keeps the loop alive if SQL Server is temporarily down; OperationCanceledException is allowed to end the loop during shutdown.',
    },
    {
      title: 'Queue work from an API with Channels: email marksheets in the background',
      scenario:
        'Generating and emailing a marksheet PDF takes several seconds. The API should respond instantly with 202 Accepted and process the work in the background.',
      steps: [
        'Add BackgroundTaskQueue.cs and QueuedWorker.cs to the Services folder',
        'Register the queue as a singleton and the worker as a hosted service',
        'Add the POST endpoint and call it from Swagger/Postman several times quickly',
        'Watch the logs: responses come back immediately, emails are sent one after another',
      ],
      code: queueCode,
      result: `POST /api/reports/marksheet/101 -> 202 Accepted (12 ms)
  {"message":"Marksheet will be emailed in a few minutes"}
POST /api/reports/marksheet/102 -> 202 Accepted (9 ms)
... 3 s later: email sent to student101@college.in
... 6 s later: email sent to student102@college.in`,
      explanation:
        'The endpoint only writes a delegate to the channel. The worker dequeues each item, creates a DI scope (so IEmailSender and DbContext are scoped correctly) and runs it. Errors are logged without stopping the worker. Because the channel is in memory, pending marksheets are lost if the app restarts - acceptable for a demo, not for payments. That is the motivation for Hangfire next.',
    },
    {
      title: 'Hangfire: fire-and-forget, delayed and recurring fee reminders with a dashboard',
      scenario:
        'A college ERP must send a welcome email on admission (now), a fee reminder 3 days after admission (delayed) and a reminder to all students with pending fees every day at 9 AM IST (recurring), with a dashboard for the admin to retry failed jobs.',
      steps: [
        'Create an empty database SchoolJobs in SSMS (Hangfire creates its own tables in the HangFire schema)',
        'Install the NuGet packages Hangfire.Core, Hangfire.AspNetCore, Hangfire.SqlServer',
        'Add the connection string and the Program.cs code; add FeeReminderService and the dashboard filter',
        'Run the API, call POST /api/students/5/welcome and POST /api/admissions/5',
        'Open https://localhost:7200/hangfire and check Jobs > Succeeded, Scheduled and Recurring Jobs',
      ],
      code: hangfireCode,
      result: `POST /api/students/5/welcome -> 202 {"jobId":"17"}
Dashboard > Jobs > Succeeded: #17 FeeReminderService.SendWelcomeEmailAsync(5)   (ran within a second)
Dashboard > Jobs > Scheduled: FeeReminderService.SendFeeReminderAsync(5)  enqueue in 3 days
Dashboard > Recurring Jobs: daily-fee-reminders  CRON 0 9 * * *  Next execution: tomorrow 09:00 (Asia/Kolkata)
If the SMTP server is down: job goes to "Failed" after 3 retries -> admin clicks "Requeue" after fixing it
SSMS: tables HangFire.Job, HangFire.State, HangFire.Set, ... created automatically`,
      explanation:
        'Hangfire stores each job (method + serialized arguments) in SQL Server, so jobs survive restarts and any server running AddHangfireServer can process them. Jobs receive only the student id and load fresh data themselves. [AutomaticRetry(Attempts = 3)] overrides the default of 10 retries. The dashboard is accessible only from localhost by default; the custom filter allows Admin users in production.',
    },
    {
      title: 'Quartz.NET: monthly report with a CRON trigger',
      scenario:
        'The principal wants an attendance report generated at 7 AM on the 1st of every month, never two copies running at the same time.',
      steps: [
        'dotnet add package Quartz.Extensions.Hosting',
        'Add AttendanceReportJob and the AddQuartz/AddQuartzHostedService registration',
        'For testing change the CRON to "0 * * * * ?" (every minute) and run the app',
      ],
      code: quartzCode,
      result: `info: Quartz.Core.QuartzScheduler[0] Scheduler QuartzScheduler_$_NON_CLUSTERED started.
(with the test CRON, every minute)
info: AttendanceReportJob[0] Attendance report generated for 1240 students`,
      explanation:
        'Quartz CRON expressions have 6-7 fields starting with SECONDS ("0 0 7 1 * ?" = second 0, minute 0, hour 7, day 1, any month, any weekday), unlike Hangfire\'s 5-field Unix CRON. [DisallowConcurrentExecution] prevents overlapping runs. Jobs get constructor injection from the DI container (scoped per execution).',
    },
    {
      title: 'Console demo: producer/consumer queue with retries and a PeriodicTimer',
      scenario:
        'See background-processing ideas in plain C#: the API queues jobs and returns at once, a worker retries transient errors but drops permanent ones, and a periodic task ticks three times.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it BackgroundDemo (.NET 8+)',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: consoleCode,
      csharp: { files: { 'Program.cs': consoleCode }, stdin: '' },
      result: `API: queued 'Fee receipt' -> 202 Accepted
API: queued 'Welcome' -> 202 Accepted
API: queued 'Hall ticket' -> 202 Accepted
Worker: sent 'Fee receipt' to asha@college.in (attempt 1)
Worker: dropped 'Welcome': invalid address
Worker: attempt 1 failed (SMTP timeout), retrying
Worker: sent 'Hall ticket' to ravi@college.in (attempt 2)
Worker: queue empty, stopping
Cleanup tick 1: removed 2 expired OTPs
Cleanup tick 2: removed 4 expired OTPs
Cleanup tick 3: removed 6 expired OTPs`,
      explanation:
        'All three jobs are queued first (the API never waits). The worker reads them in FIFO order. "bad-address" throws FormatException - a permanent error - so it is dropped without retrying (in real life: log it or send it to a dead-letter store). The first SMTP call for Ravi times out (transient), the exception filter "when (attempt < 3)" retries and attempt 2 succeeds. ReadAllAsync ends because Complete() was called. PeriodicTimer then ticks every 100 ms; the loop stops after 3 ticks.',
    },
  ],
  interview: [
    { q: 'What is the difference between IHostedService and BackgroundService?', a: 'IHostedService is the interface with StartAsync and StopAsync. BackgroundService is an abstract class implementing it that runs your ExecuteAsync loop in the background and cancels the stoppingToken on shutdown, so you only write the loop.', level: 'Easy' },
    { q: 'How do you register a hosted service?', a: 'builder.Services.AddHostedService<MyWorker>(); It is registered as a singleton and started by the host.', level: 'Easy' },
    { q: 'How do you use a DbContext inside a BackgroundService?', a: 'Inject IServiceScopeFactory, create a scope per unit of work (using var scope = factory.CreateScope()) and resolve the DbContext from scope.ServiceProvider. Injecting it directly fails because a singleton cannot consume a scoped service.', level: 'Medium' },
    { q: 'Why is PeriodicTimer preferred over Task.Delay loops or System.Threading.Timer?', a: 'It is async-friendly, supports cancellation, does not overlap runs or queue missed ticks, and avoids async void timer callbacks. Task.Delay loops drift by the duration of the work; Timer callbacks can overlap and run on thread-pool threads.', level: 'Medium' },
    { q: 'What happens if ExecuteAsync throws an unhandled exception in .NET 8?', a: 'By default (BackgroundServiceExceptionBehavior.StopHost) the exception is logged and the host stops - the whole app shuts down. Catch exceptions inside the loop or set the behaviour to Ignore.', level: 'Medium' },
    { q: 'What is graceful shutdown in a background service?', a: 'When the app stops, the stoppingToken is cancelled and StopAsync is called; the service should finish or abandon the current item quickly and exit. The host waits up to HostOptions.ShutdownTimeout.', level: 'Medium' },
    { q: 'Why not just use Task.Run in a controller for background work?', a: 'The work is not tracked: it is lost on app restart, exceptions are unobserved, it may use disposed scoped services (the request scope ends), and there is no retry or monitoring.', level: 'Medium' },
    { q: 'What job types does Hangfire support?', a: 'Fire-and-forget (Enqueue), delayed (Schedule), recurring (RecurringJob.AddOrUpdate with CRON), continuations (ContinueJobWith); batches in Hangfire Pro.', level: 'Easy' },
    { q: 'How does Hangfire survive an app restart?', a: 'Jobs and their states are stored in persistent storage (SQL Server, Redis, PostgreSQL). On restart the Hangfire server continues processing enqueued and scheduled jobs; jobs that were running are re-queued after a timeout.', level: 'Medium' },
    { q: 'Why should Hangfire jobs be idempotent and take small arguments?', a: 'Jobs may run more than once (retries, server crash during processing). Arguments are serialized to the database, so pass ids and reload fresh data rather than large or stale objects.', level: 'Hard' },
    { q: 'How do you secure the Hangfire dashboard?', a: 'By default it only allows local requests. In production pass DashboardOptions with Authorization = new[] { new MyFilter() } implementing IDashboardAuthorizationFilter (e.g. check Admin role), or put it behind authentication middleware.', level: 'Medium' },
    { q: 'Hangfire vs Quartz.NET?', a: 'Hangfire: simple API, persistent storage, automatic retries and a built-in dashboard - great for fire-and-forget and simple recurring jobs. Quartz.NET: richer scheduling (seconds in CRON, calendars, misfire handling, job/trigger model, clustering) but no built-in dashboard.', level: 'Medium' },
    { q: 'Your API runs on 3 instances and a BackgroundService sends a daily report. What problem do you get?', a: 'Each instance runs the service, so the report is sent 3 times. Solutions: use a distributed lock (Redis/SQL), Hangfire/Quartz clustering (job runs on one server), a dedicated single worker deployment, or a cloud scheduler.', level: 'Hard' },
    { q: 'What is back-pressure in a bounded Channel?', a: 'When the channel is full, BoundedChannelFullMode decides what happens: Wait makes producers await until space is available (slowing them down), or DropOldest/DropNewest/DropWrite discard items. It prevents unbounded memory growth.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a BackgroundService that every 10 minutes marks orders as "Cancelled" if they are still "PendingPayment" after 30 minutes.',
      hint: 'PeriodicTimer + IServiceScopeFactory + ExecuteUpdateAsync.',
      solution: `public class PendingOrderCanceller(IServiceScopeFactory scopes, ILogger<PendingOrderCanceller> log) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken ct)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromMinutes(10));
        while (await timer.WaitForNextTickAsync(ct))
        {
            try
            {
                using var scope = scopes.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                var cutoff = DateTime.UtcNow.AddMinutes(-30);
                int n = await db.Orders
                    .Where(o => o.Status == "PendingPayment" && o.CreatedAt < cutoff)
                    .ExecuteUpdateAsync(s => s.SetProperty(o => o.Status, "Cancelled"), ct);
                log.LogInformation("Cancelled {Count} unpaid orders", n);
            }
            catch (Exception ex) when (ex is not OperationCanceledException)
            {
                log.LogError(ex, "Cancel job failed");
            }
        }
    }
}
// builder.Services.AddHostedService<PendingOrderCanceller>();`,
    },
    {
      task: 'Write Hangfire CRON expressions for: (a) every 15 minutes, (b) every Monday at 08:30, (c) 1st of every month at midnight, (d) every weekday at 18:00.',
      hint: 'Five fields: minute hour day-of-month month day-of-week (0 = Sunday).',
      solution: `(a) */15 * * * *
(b) 30 8 * * 1
(c) 0 0 1 * *
(d) 0 18 * * 1-5`,
    },
    {
      task: 'Add a Hangfire continuation: after a job generates a monthly salary slip PDF for an employee, a second job emails it.',
      hint: 'Enqueue returns the job id; pass it to ContinueJobWith.',
      solution: `app.MapPost("/api/payroll/{empId:int}/slip", (int empId, IBackgroundJobClient jobs) =>
{
    string generateId = jobs.Enqueue<PayrollService>(s => s.GenerateSlipAsync(empId));
    jobs.ContinueJobWith<PayrollService>(generateId, s => s.EmailSlipAsync(empId));
    return Results.Accepted(value: new { generateId });
});`,
    },
    {
      task: 'Convert the in-memory Channel queue into one that limits parallelism: process up to 3 work items at the same time.',
      hint: 'Start 3 consumer loops (Task.WhenAll) in ExecuteAsync, each reading from the same channel.',
      solution: `protected override Task ExecuteAsync(CancellationToken stoppingToken)
{
    var consumers = Enumerable.Range(1, 3).Select(n => ConsumeAsync(n, stoppingToken));
    return Task.WhenAll(consumers);
}

private async Task ConsumeAsync(int workerNo, CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        try
        {
            var work = await queue.DequeueAsync(ct);
            using var scope = scopes.CreateScope();
            await work(scope.ServiceProvider, ct);
        }
        catch (OperationCanceledException) { break; }
        catch (Exception ex) { logger.LogError(ex, "Worker {No} failed", workerNo); }
    }
}`,
    },
    {
      task: 'Predict the BackgroundDemo console output if smtpTimeoutsLeft starts at 3 instead of 1 (only the worker part).',
      hint: 'Ravi times out on attempts 1, 2 and 3. The filter "when (attempt < 3)" is false on attempt 3, so the general catch handles it.',
      solution: `Worker: sent 'Fee receipt' to asha@college.in (attempt 1)
Worker: dropped 'Welcome': invalid address
Worker: attempt 1 failed (SMTP timeout), retrying
Worker: attempt 2 failed (SMTP timeout), retrying
Worker: dropped 'Hall ticket': SMTP timeout
Worker: queue empty, stopping`,
    },
  ],
  quiz: [
    {
      question: 'Which method do you override when you inherit from BackgroundService?',
      options: ['StartAsync only', 'ExecuteAsync', 'RunAsync', 'Configure'],
      answer: 1,
      explanation: 'BackgroundService implements StartAsync/StopAsync and calls your ExecuteAsync(CancellationToken).',
    },
    {
      question: 'Injecting AppDbContext (scoped) into a BackgroundService constructor causes what?',
      options: ['It works perfectly', 'A compile error', 'An error: cannot consume scoped service from singleton (with scope validation)', 'The DbContext becomes transient'],
      answer: 2,
      explanation: 'Hosted services are singletons. Use IServiceScopeFactory and create a scope per run.',
    },
    {
      question: 'Which Hangfire call schedules a job to run once, 3 days from now?',
      options: ['BackgroundJob.Enqueue', 'RecurringJob.AddOrUpdate', 'BackgroundJob.ContinueJobWith', 'BackgroundJob.Schedule'],
      answer: 3,
      explanation: 'Schedule takes a delay (TimeSpan) or a DateTimeOffset for delayed jobs.',
    },
    {
      question: 'What does the Hangfire CRON expression "0 9 * * *" mean?',
      options: ['Every 9 minutes', 'Every day at 09:00', 'At second 9 of every minute', 'On the 9th of every month'],
      answer: 1,
      explanation: 'Fields: minute=0, hour=9, any day, any month, any weekday.',
    },
    {
      question: 'Why is an in-memory Channel queue NOT enough for payment confirmation emails?',
      options: ['Channels are slow', 'Queued items are lost if the process restarts or crashes', 'Channels cannot be used with async code', 'Channels only work in console apps'],
      answer: 1,
      explanation: 'In-memory queues have no persistence. Use Hangfire storage or a durable message broker for important work.',
    },
  ],
};
