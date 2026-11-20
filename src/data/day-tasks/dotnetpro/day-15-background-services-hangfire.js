export default {
  lesson: 'day-15-background-services-hangfire',
  minutes: 25,
  intro: 'Practise hosted services, PeriodicTimer, scoped services inside background work, retry logic and Hangfire job types and CRON schedules.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'You inherit from `BackgroundService`. Which method do you override to write the long-running loop?',
      options: ['StartAsync', 'ExecuteAsync(CancellationToken stoppingToken)', 'Run()', 'Configure(IApplicationBuilder app)'],
      answer: 1,
      explain: 'BackgroundService already implements IHostedService.StartAsync/StopAsync. It calls your ExecuteAsync and cancels stoppingToken on graceful shutdown, so pass the token to every await and exit the loop when it is cancelled.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A BackgroundService (singleton) needs the scoped AppDbContext each time its timer ticks. Complete the line that creates a new DI scope:
\`using var scope = ______.CreateScope();\``,
      example: { title: 'after creating the scope', code: 'var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();' },
      accept: ['scopeFactory', '_scopeFactory', 'serviceScopeFactory', '_serviceScopeFactory', 'scopes', '_scopes', 'services', '_services', 'serviceProvider', '_serviceProvider', 'provider'],
      acceptRegex: ['^_?[A-Za-z]*[Ss]cope[A-Za-z]*$', '^_?[A-Za-z]*[Pp]rovider$'],
      explain: 'Inject IServiceScopeFactory (or IServiceProvider) into the background service and create one scope per unit of work. Injecting AppDbContext directly into the singleton fails with "Cannot consume scoped service from singleton" and would keep one DbContext alive for days.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'A background worker processes report jobs with retries for transient errors. Write the exact output.',
      example: { title: 'tip: post-decrement', text: '`flaky-- > 0` compares the OLD value with 0 and then decreases flaky by 1.' },
      code: `using System;
using System.Collections.Generic;

int flaky = 2;
var queue = new Queue<string>(new[] { "report:101", "report:abc", "report:102" });
while (queue.Count > 0)
{
    string job = queue.Dequeue();
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            Run(job);
            Console.WriteLine($"{job} done on attempt {attempt}");
            break;
        }
        catch (TimeoutException) when (attempt < 3)
        {
            Console.WriteLine($"{job} timeout, retry");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"{job} failed: {ex.Message}");
            break;
        }
    }
}

void Run(string job)
{
    string id = job.Split(':')[1];
    if (!int.TryParse(id, out _)) throw new FormatException("bad id");
    if (id == "102" && flaky-- > 0) throw new TimeoutException();
}`,
      expected: `report:101 done on attempt 1
report:abc failed: bad id
report:102 timeout, retry
report:102 timeout, retry
report:102 done on attempt 3`,
      explain: '"abc" is not a number, so FormatException is thrown; it is not a TimeoutException, so the general catch prints "failed" without retrying (permanent error). For job 102, flaky is 2 then 1 - both are > 0, so attempts 1 and 2 time out and are retried; on attempt 3 flaky is 0, so the job succeeds.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'After admission, a fee reminder must be sent **once, 3 days later**, and it must survive app restarts. Which Hangfire call fits?',
      options: [
        'BackgroundJob.Enqueue(() => SendReminder(id))',
        'RecurringJob.AddOrUpdate("reminder", () => SendReminder(id), Cron.Daily)',
        'jobs.Schedule<FeeService>(s => s.SendReminderAsync(id), TimeSpan.FromDays(3))',
        'Task.Run(async () => { await Task.Delay(TimeSpan.FromDays(3)); await SendReminder(id); })'
      ],
      answer: 2,
      explain: 'Schedule creates a delayed job stored in Hangfire\'s database, so it runs after 3 days even if the app restarts. Enqueue runs immediately, AddOrUpdate repeats forever, and Task.Run with a delay is lost on any restart.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the 5-field (Hangfire/Unix) CRON expression for **every day at 09:30**.',
      example: { title: 'CRON fields', code: 'minute hour day-of-month month day-of-week\n0 18 * * 1-5   -> 18:00 Monday to Friday' },
      accept: ['30 9 * * *', '30 09 * * *'],
      explain: 'Fields are minute, hour, day of month, month, day of week. 09:30 every day is minute 30, hour 9 and * for the rest. A common mistake is writing the hour first ("9 30 * * *"), which means 30:09 and is invalid. Quartz.NET CRON is different: it starts with seconds ("0 30 9 * * ?").',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements are TRUE? Select all that apply.',
      options: [
        'PeriodicTimer.WaitForNextTickAsync never runs overlapping ticks if one run takes longer than the period',
        'In .NET 8, an unhandled exception in ExecuteAsync stops the whole host by default',
        'An in-memory Channel queue keeps queued jobs after the app restarts',
        'If the API runs on 3 instances, a BackgroundService that sends a daily report sends it 3 times unless you add a lock or use Hangfire/Quartz clustering',
        'The Hangfire dashboard is open to everyone on the internet by default'
      ],
      answers: [0, 1, 3],
      explain: 'PeriodicTimer waits for one tick at a time, and BackgroundServiceExceptionBehavior.StopHost is the default since .NET 6, so catch errors inside the loop. Channels are in memory and lose items on restart. Each instance runs its own hosted services. The Hangfire dashboard allows only local requests by default; you add an authorization filter for remote admins.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Generating a marksheet PDF takes 8 seconds. What should the Web API endpoint return after queueing the work for a background worker?',
      options: ['200 OK with the PDF after 8 seconds', '202 Accepted with a message or job id', '204 No Content', '500 because the work is not finished'],
      answer: 1,
      explain: '202 Accepted means "request received, processing will happen later". Return a job id or status URL so the client can check progress, and email/notify when the PDF is ready.',
    },
  ],
};
