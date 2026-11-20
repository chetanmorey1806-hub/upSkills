export default {
  lesson: 'day-17-masstransit-rabbitmq-events',
  minutes: 25,
  intro: 'Practise MassTransit publish/subscribe, consumers, retry and error queues, the transactional outbox, idempotent consumers and broker selection.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Complete the consumer class so MassTransit calls it for every \`OrderPlaced\` event:
\`public class SendConfirmationConsumer : ______<OrderPlaced>\``,
      example: { title: 'the method you then implement', code: 'public async Task Consume(ConsumeContext<OrderPlaced> context)\n{\n    var order = context.Message;\n    ...\n}' },
      accept: ['IConsumer'],
      caseSensitive: true,
      explain: 'Consumers implement IConsumer<T> with Task Consume(ConsumeContext<T>). Returning normally means success (MassTransit acks the message); throwing triggers the retry policy and finally the _error queue.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The Order API must announce "an order was placed" so that the Notification, Inventory and Loyalty services can all react. Which call is right?',
      options: [
        'await sendEndpoint.Send(new OrderPlaced { ... }) to the notification queue',
        'await publishEndpoint.Publish(new OrderPlaced { ... })',
        'An HTTP POST to each of the three services',
        'await bus.Request<OrderPlaced, OrderResponse>(...)'
      ],
      answer: 1,
      explain: 'Publish sends an EVENT to the message-type exchange; every service with a consumer for OrderPlaced gets its own copy, and the publisher does not know who listens. Send is for COMMANDS to one specific queue, and request/response expects a single reply.',
    },
    {
      type: 'output',
      mins: 6,
      q: 'This console program imitates a MassTransit consumer with an inbox (duplicate check), retries for timeouts (RetryLimit = 2) and an error queue. Write the exact output.',
      example: { title: 'how to trace it', text: 'A TimeoutException is retried only while attempt <= RetryLimit. Any other exception, or a timeout after the last retry, goes to the error queue. A successfully processed MessageId is stored in the inbox.' },
      code: `using System;
using System.Collections.Generic;

var inbox = new HashSet<string>();
int errors = 0;
var timeouts = new Dictionary<string, int> { ["m-8"] = 3 };
const int RetryLimit = 2;

var deliveries = new List<(string Id, int Amount)> { ("m-7", 100), ("m-8", 250), ("m-7", 100), ("m-9", 0) };

foreach (var m in deliveries)
{
    for (int attempt = 1; ; attempt++)
    {
        try { Consume(m.Id, m.Amount); break; }
        catch (TimeoutException) when (attempt <= RetryLimit)
        {
            Console.WriteLine($"{m.Id}: retry {attempt}");
        }
        catch (Exception ex)
        {
            errors++;
            Console.WriteLine($"{m.Id}: to error queue ({ex.Message})");
            break;
        }
    }
}
Console.WriteLine($"done={inbox.Count} errors={errors}");

void Consume(string id, int amount)
{
    if (inbox.Contains(id)) { Console.WriteLine($"{id}: duplicate, skipped"); return; }
    if (amount <= 0) throw new ArgumentException("invalid amount");
    if (timeouts.TryGetValue(id, out int left) && left > 0)
    {
        timeouts[id] = left - 1;
        throw new TimeoutException("timeout");
    }
    inbox.Add(id);
    Console.WriteLine($"{id}: done");
}`,
      expected: `m-7: done
m-8: retry 1
m-8: retry 2
m-8: to error queue (timeout)
m-7: duplicate, skipped
m-9: to error queue (invalid amount)
done=1 errors=2`,
      explain: 'm-8 times out 3 times: attempts 1 and 2 are retried, attempt 3 fails the filter (3 <= 2 is false) so it goes to the error queue. The second m-7 is recognised by the inbox and skipped - that is an idempotent consumer. m-9 throws ArgumentException, which is never retried (like r.Ignore<ArgumentException>()). Only m-7 was processed.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The Order API saves the order and then publishes OrderPlaced. During a deployment the app crashed between the two lines, so customers never got confirmations. Which pattern fixes this?',
      options: [
        'Publish first, then save the order',
        'Wrap both lines in try/catch',
        'Transactional outbox: store the message in an outbox table in the same DB transaction, publish it later',
        'Increase the RabbitMQ prefetch count'
      ],
      answer: 2,
      explain: 'This is the dual-write problem: the database and the broker cannot share a transaction. The outbox writes the business row and the message row in ONE SaveChanges; a delivery service publishes outbox rows and retries until the broker accepts them. Publishing first has the opposite bug (events for orders that were never saved).',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which statements about MassTransit on RabbitMQ are TRUE? Select all that apply.',
      options: [
        'With the kebab-case formatter, OrderPlacedConsumer gets a queue named order-placed',
        'Messages that still fail after all retries are moved to the order-placed_error queue',
        'UseMessageRetry with r.Ignore<ArgumentException>() retries ArgumentException 3 extra times',
        'A Fault<OrderPlaced> event is published when a consumer finally fails, so you can alert support',
        'The outbox guarantees that every message is delivered exactly once, so consumers need no duplicate checks'
      ],
      answers: [0, 1, 3],
      explain: 'Kebab-case naming drops "Consumer" and lower-cases the name. Final failures go to <queue>_error and publish Fault<T>. Ignore<T> means "do NOT retry this exception". The outbox gives at-least-once delivery, so duplicates are still possible and consumers must be idempotent.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A ride-hailing company needs to ingest 50,000 GPS events per second, keep them for 7 days and let new analytics jobs **replay** past events. Which platform fits best?',
      options: ['RabbitMQ classic queues', 'Azure Service Bus queues', 'Apache Kafka (or Azure Event Hubs)', 'Hangfire'],
      answer: 2,
      explain: 'Kafka is a partitioned, replicated log: it handles very high throughput, keeps messages for a retention period and lets consumers re-read from any offset. RabbitMQ and Service Bus delete messages once they are acknowledged, which suits commands and business events between services.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Enable the MassTransit Entity Framework outbox for the order database. Complete the registration method name:
\`x.______<OrderDbContext>(o => { o.UseSqlServer(); o.UseBusOutbox(); });\``,
      example: { title: 'DbContext entities needed', code: 'modelBuilder.AddInboxStateEntity();\nmodelBuilder.AddOutboxMessageEntity();\nmodelBuilder.AddOutboxStateEntity();' },
      accept: ['AddEntityFrameworkOutbox'],
      caseSensitive: true,
      explain: 'AddEntityFrameworkOutbox (package MassTransit.EntityFrameworkCore) stores outgoing messages in the OutboxMessage table. UseBusOutbox makes Publish/Send in controllers and endpoints go through the outbox, and a hosted delivery service sends them to RabbitMQ after SaveChanges commits.',
    },
  ],
};
