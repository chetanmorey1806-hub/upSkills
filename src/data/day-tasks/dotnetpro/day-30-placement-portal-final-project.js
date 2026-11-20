export default {
  lesson: 'day-30-placement-portal-final-project',
  minutes: 30,
  intro: 'Revise the whole advanced course through the College Placement Portal: Clean Architecture, CQRS, caching, messaging and cloud deployment.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Placement Portal\'s Clean Architecture, which project is allowed to reference `Microsoft.EntityFrameworkCore.SqlServer`, `Dapper` and `RabbitMQ.Client`?',
      options: ['Placement.Domain', 'Placement.Application', 'Placement.Infrastructure', 'All projects'],
      answer: 2,
      explain: 'Infrastructure implements the interfaces declared by Application (IAppDbContext, IReadDb, IEventBus) using concrete technologies. Domain has no dependencies, and Application depends only on Domain plus small libraries such as MediatR and FluentValidation. This is the dependency rule: dependencies point inward.',
    },
    {
      type: 'output',
      mins: 6,
      q: 'Trace this C# cache-aside + CQRS program and write its exact console output.',
      example: { title: 'Remember', text: 'A method call inside `Console.WriteLine(string.Join(...))` runs (and prints) BEFORE the joined line is printed.' },
      code: `var db = new List<(int Id, string Name, int Percent)> { (1, "Asha", 84), (2, "Ravi", 71), (3, "Neha", 68) };
var cache = new Dictionary<string, List<string>>();
var events = new List<string>();

List<string> GetEligible(int min)
{
    string key = "eligible:" + min;
    if (cache.TryGetValue(key, out var hit)) { Console.WriteLine("HIT " + key); return hit; }
    Console.WriteLine("MISS " + key);
    var names = db.Where(s => s.Percent >= min).OrderBy(s => s.Name).Select(s => s.Name).ToList();
    cache[key] = names;
    return names;
}

string Apply(int id, int min)
{
    var s = db.First(x => x.Id == id);
    if (s.Percent < min) return "Rejected " + s.Name;
    events.Add("applied:" + id);
    cache.Clear();                      // a write invalidates cached reads
    return "Applied " + s.Name;
}

Console.WriteLine(string.Join(",", GetEligible(70)));
Console.WriteLine(Apply(3, 70));
Console.WriteLine(string.Join(",", GetEligible(70)));
Console.WriteLine(Apply(2, 70));
Console.WriteLine(string.Join(",", GetEligible(70)));
Console.WriteLine(events.Count);`,
      expected: `MISS eligible:70
Asha,Ravi
Rejected Neha
HIT eligible:70
Asha,Ravi
Applied Ravi
MISS eligible:70
Asha,Ravi
1`,
      explain: 'First query: MISS, then the DB result Asha,Ravi (84 and 71 are >= 70) is cached. Neha (68) is rejected, so the cache is NOT cleared and the next query is a HIT. Ravi\'s application succeeds: one event is added and the cache is cleared, so the third query is a MISS again. Only one event exists. This is exactly the cache-aside + invalidation-on-write pattern used by the CachingBehavior and command handlers.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the MediatR interface that a caching, validation or logging step implements so that it wraps EVERY request:
\`\`\`
public class CachingBehavior<TRequest, TResponse> : ______<TRequest, TResponse>
    where TRequest : notnull
\`\`\``,
      example: { title: 'Registration', code: `cfg.AddOpenBehavior(typeof(CachingBehavior<,>));` },
      accept: ['IPipelineBehavior'],
      caseSensitive: true,
      explain: '`IPipelineBehavior<TRequest, TResponse>` has `Handle(request, next, ct)`. Code before `await next()` runs before the handler, and code after it runs after. Behaviors run in registration order (Logging -> Validation -> Caching -> Handler), much like ASP.NET Core middleware.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A query result is cached in Redis with a TTL of 300 seconds (cache-aside). A command removes the key at t = 250. Queries arrive at t = 0, 100, 260, 400 and 600 seconds. Write HIT or MISS for each query, one per line.',
      example: { title: 'Cache-aside', text: 'On a MISS the result is loaded from SQL and stored with a fresh TTL (expires at t + 300). A removed or expired key is a MISS.' },
      code: `t=0    GET eligible drives
t=100  GET eligible drives
t=250  POST apply  -> cache.RemoveByPrefixAsync("drives:")
t=260  GET eligible drives
t=400  GET eligible drives
t=600  GET eligible drives`,
      expected: `MISS
HIT
MISS
HIT
MISS`,
      explain: 't=0 is a MISS and stores the key until 300. t=100 is a HIT. The command at 250 deletes the key, so t=260 is a MISS and stores it until 560. t=400 is a HIT. At t=600 the key has expired (560), so it is a MISS. Invalidation on writes keeps data fresh, and the TTL is the safety net.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Why does the portal publish `StudentApplied` to RabbitMQ and send the email from a background Worker? Select all correct reasons and practices.',
      options: [
        'The Apply API stays fast and does not fail when the SMTP server is down',
        'Failed messages can go to a dead-letter queue and be retried later',
        'Delivery is at-least-once, so the consumer should be idempotent (track the MessageId)',
        'RabbitMQ guarantees each message is delivered exactly once, so no duplicate handling is needed',
        'The consumer should ack the message only after the email is sent successfully',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Queues decouple slow or unreliable side effects from the request. Brokers give at-least-once delivery: a crash before the ack causes a redelivery, so consumers must be idempotent. Manual ack after success plus a dead-letter queue means nothing is lost silently. "Exactly once" is not something RabbitMQ promises.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The API saves the Application row with EF Core and then publishes the event to RabbitMQ. Sometimes the broker is down right after SaveChanges, so the email is never sent. Which pattern fixes this?',
      options: ['Singleton', 'Outbox', 'Repository', 'Strategy'],
      answer: 1,
      explain: 'With the Outbox pattern, the event is written to an OutboxMessages table in the SAME database transaction as the Application row. A background publisher sends unsent rows to RabbitMQ and marks them sent. The data and the event can then never disagree.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Mixed revision: select all statements that are TRUE.',
      options: [
        'gRPC uses HTTP/2 and Protocol Buffers and is well suited for internal service-to-service calls',
        'In Kubernetes, a failing readiness probe restarts the container',
        'Azure deployment slot settings marked as sticky stay with their slot during a swap',
        'Dapper is a good fit for the read side of CQRS because it maps hand-written SQL straight to DTOs',
        'Angular route guards are enough to secure admin API endpoints',
      ],
      answers: [0, 2, 3],
      explain: 'Readiness failures only remove the pod from Service endpoints. Liveness failures cause restarts. Guards run in the browser, so the API must use [Authorize]. The other three are core facts you should be able to explain with an example from the Placement Portal.',
    },
  ],
};
