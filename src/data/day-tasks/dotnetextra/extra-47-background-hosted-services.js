export default {
  lesson: 'extra-47-background-hosted-services',
  minutes: 25,
  intro: 'Run background work with BackgroundService and IHostedService, respect cancellation and use scoped services safely.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the method a \`BackgroundService\` must override:
\`protected override async Task ______(CancellationToken stoppingToken)\``,
      example: { title: 'register it', code: 'builder.Services.AddHostedService<ReminderWorker>();' },
      accept: ['ExecuteAsync'],
      caseSensitive: true,
      explain: '`BackgroundService` implements `IHostedService` for you; you only override `ExecuteAsync`. The host calls it at startup and signals `stoppingToken` when the app shuts down.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Register the worker so it starts with the app:
\`builder.Services.______<InvoiceEmailWorker>();\``,
      example: { title: 'registration', code: 'builder.Services.AddHostedService<CleanupWorker>();' },
      accept: ['AddHostedService'],
      caseSensitive: true,
      explain: '`AddHostedService<T>()` registers the worker as a singleton hosted service; the host starts it before the app begins handling requests and stops it gracefully on shutdown.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A queue-processing worker is simulated below. What does it print?',
      example: { title: 'cancellation-aware loop', code: `while (!stoppingToken.IsCancellationRequested)
{
    await DoWorkAsync(stoppingToken);
}` },
      code: `var queue = new Queue<string>(new[] { "INV-1", "INV-2", "INV-3", "INV-4" });
var cts = new CancellationTokenSource();
int sent = 0;

await ExecuteAsync(cts.Token);
Console.WriteLine($"Stopped after {sent}");

async Task ExecuteAsync(CancellationToken token)
{
    Console.WriteLine("Worker started");
    while (!token.IsCancellationRequested && queue.TryDequeue(out var inv))
    {
        await Task.Yield();
        sent++;
        Console.WriteLine($"Emailed {inv}");
        if (sent == 3) cts.Cancel();   // simulate app shutdown
    }
}`,
      expected: `Worker started
Emailed INV-1
Emailed INV-2
Emailed INV-3
Stopped after 3`,
      explain: 'The loop checks the token before each item. After the third email the token is cancelled (like the host stopping), so the loop ends and INV-4 stays in the queue for the next run. Always pass and check the token so shutdown is fast and clean.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Inside a hosted service you need `AppDbContext` (registered as **scoped**). What is the correct approach?',
      options: ['Inject `AppDbContext` into the worker constructor', 'Inject `IServiceScopeFactory`, create a scope per unit of work and resolve `AppDbContext` from it', 'Make AppDbContext a singleton', 'Use `new AppDbContext()` once and keep it forever'],
      answer: 1,
      explain: 'Hosted services are singletons, so a scoped DbContext cannot be injected directly (captive dependency). Create `using var scope = _scopeFactory.CreateScope();` for each iteration and resolve the DbContext inside, so it is disposed after each batch.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements are TRUE? Select all that apply.',
      options: ['`PeriodicTimer` with `await timer.WaitForNextTickAsync(token)` is a clean way to run work every N minutes', 'An unhandled exception in `ExecuteAsync` stops the host by default in .NET 6+', 'Hosted services are a full replacement for a durable job scheduler with retries across restarts', 'Long blocking work at the start of `ExecuteAsync` before the first `await` can delay app startup', '`Task.Delay(TimeSpan.FromMinutes(5), stoppingToken)` wakes up early when the app stops'],
      answers: [0, 1, 3, 4],
      explain: 'PeriodicTimer and cancellable delays make loops responsive to shutdown. Since .NET 6 an unhandled exception stops the host (`BackgroundServiceExceptionBehavior.StopHost`), so wrap work in try/catch. Synchronous work before the first await blocks startup. For persistent, retried jobs use Hangfire/Quartz or a queue.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which task suits a background hosted service **best**?',
      options: ['Calculating a value the current HTTP response needs immediately', 'Sending queued confirmation emails every minute', 'Validating a form field', 'Rendering a Razor view'],
      answer: 1,
      explain: 'Background services handle work that should not block requests: sending emails, cleanup, polling, report generation. Anything the current response needs must run in the request itself.',
    },
  ],
};
