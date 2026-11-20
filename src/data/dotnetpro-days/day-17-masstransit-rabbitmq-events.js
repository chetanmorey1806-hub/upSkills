const setupCode = `// ===== Solution layout =====
// ShopSystem.sln
//   Contracts/            Class Library  - message contracts shared by both services
//   OrderService/         ASP.NET Core Web API - PUBLISHES OrderPlaced
//   NotificationService/  Worker Service - CONSUMES OrderPlaced, sends email/SMS
//
// docker run -d --name rabbitmq --hostname rabbit-dev -p 5672:5672 -p 15672:15672 \`
//   -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 rabbitmq:4-management
//
// dotnet add OrderService package MassTransit.RabbitMQ
// dotnet add NotificationService package MassTransit.RabbitMQ
// (MassTransit v8 is open source, Apache 2.0. v9+ needs a commercial license - check before choosing.)

// ===== Contracts/OrderPlaced.cs =====
namespace Contracts;

// Events are named in the PAST tense: something that already happened
public record OrderPlaced
{
    public Guid OrderId { get; init; }
    public string CustomerEmail { get; init; } = "";
    public string CustomerMobile { get; init; } = "";
    public decimal Total { get; init; }
    public DateTime PlacedAtUtc { get; init; }
}

// ===== OrderService/Program.cs =====
using Contracts;
using MassTransit;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h =>
        {
            h.Username("admin");
            h.Password("admin123");
        });
        cfg.ConfigureEndpoints(context);
    });
});

var app = builder.Build();

app.MapPost("/api/orders", async (CreateOrderRequest req, IPublishEndpoint publisher, CancellationToken ct) =>
{
    var orderId = Guid.NewGuid();
    // ... save the order to the database ...

    await publisher.Publish(new OrderPlaced
    {
        OrderId = orderId,
        CustomerEmail = req.Email,
        CustomerMobile = req.Mobile,
        Total = req.Total,
        PlacedAtUtc = DateTime.UtcNow
    }, ct);

    return Results.Accepted($"/api/orders/{orderId}", new { orderId });
});

app.Run();

public record CreateOrderRequest(string Email, string Mobile, decimal Total);

// ===== NotificationService/Consumers/OrderPlacedConsumer.cs =====
using Contracts;
using MassTransit;

public class OrderPlacedConsumer(ILogger<OrderPlacedConsumer> logger) : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        var msg = context.Message;
        logger.LogInformation("Order {OrderId}: sending confirmation to {Email} for Rs {Total}",
            msg.OrderId, msg.CustomerEmail, msg.Total);
        await Task.Delay(300, context.CancellationToken);     // send email + SMS...
        // returning normally = success -> MassTransit ACKs the message
        // throwing = failure -> retry policy, then the _error queue
    }
}

// ===== NotificationService/Program.cs =====
using MassTransit;

var builder = Host.CreateApplicationBuilder(args);

builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();                 // OrderPlacedConsumer -> queue "order-placed"
    x.AddConsumer<OrderPlacedConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("admin"); h.Password("admin123"); });
        cfg.ConfigureEndpoints(context);                   // creates queues + bindings for every consumer
    });
});

builder.Build().Run();

// ===== A SECOND subscriber (e.g. LoyaltyService) just adds its own consumer =====
// public class AddLoyaltyPointsConsumer : IConsumer<OrderPlaced> { ... }
// -> gets its own queue "add-loyalty-points"; both services receive every OrderPlaced event`;

const retryCode = `// ===== NotificationService/Consumers/PaymentReceiptConsumer.cs =====
using Contracts;
using MassTransit;

public class PaymentReceiptConsumer(IReceiptSender sender) : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        if (context.Message.Total <= 0)
            throw new ArgumentException("Total must be positive");      // permanent error - do not retry

        await sender.SendAsync(context.Message);                        // may throw TimeoutException (transient)
    }
}

// ===== Consumer definition: retry policy for THIS consumer's endpoint =====
public class PaymentReceiptConsumerDefinition : ConsumerDefinition<PaymentReceiptConsumer>
{
    public PaymentReceiptConsumerDefinition()
    {
        EndpointName = "payment-receipts";
        ConcurrentMessageLimit = 8;                                     // process max 8 at a time
    }

    protected override void ConfigureConsumer(IReceiveEndpointConfigurator endpointConfigurator,
        IConsumerConfigurator<PaymentReceiptConsumer> consumerConfigurator, IRegistrationContext context)
    {
        // 2nd level: redeliver later (minutes) if all immediate retries failed
        // needs the RabbitMQ delayed-exchange plugin + cfg.UseDelayedMessageScheduler()
        endpointConfigurator.UseDelayedRedelivery(r => r.Intervals(
            TimeSpan.FromMinutes(5), TimeSpan.FromMinutes(15)));

        // 1st level: retry in memory a few times quickly
        endpointConfigurator.UseMessageRetry(r =>
        {
            r.Intervals(500, 1000, 2000);                               // ms between attempts
            r.Ignore<ArgumentException>();                              // permanent -> straight to _error
        });
    }
}

// ===== React to final failures: Fault<T> =====
public class PaymentReceiptFaultConsumer(ILogger<PaymentReceiptFaultConsumer> logger)
    : IConsumer<Fault<OrderPlaced>>
{
    public Task Consume(ConsumeContext<Fault<OrderPlaced>> context)
    {
        var ex = context.Message.Exceptions.FirstOrDefault();
        logger.LogError("Receipt FAILED for order {OrderId}: {Error}",
            context.Message.Message.OrderId, ex?.Message);
        // e.g. create a support ticket, alert on Slack/Teams
        return Task.CompletedTask;
    }
}

// ===== Program.cs registration =====
builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();
    x.AddConsumer<PaymentReceiptConsumer, PaymentReceiptConsumerDefinition>();
    x.AddConsumer<PaymentReceiptFaultConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("admin"); h.Password("admin123"); });
        cfg.UseDelayedMessageScheduler();
        cfg.ConfigureEndpoints(context);
    });
});

// Queues MassTransit creates for this endpoint:
//   payment-receipts           normal messages
//   payment-receipts_error     messages that failed after all retries (dead-letter queue)
//   payment-receipts_skipped   messages that arrived but no consumer handles their type
// To re-process: fix the bug, then in the RabbitMQ UI use the Shovel plugin to move
// messages from payment-receipts_error back to payment-receipts.`;

const outboxCode = `// ===== Problem: dual write =====
// await db.SaveChangesAsync();          // 1. order saved
// await publisher.Publish(new OrderPlaced { ... });   // 2. app crashes HERE -> event never sent!
// (or the reverse order: event sent, but SaveChanges fails -> consumers act on an order that does not exist)

// ===== Solution: transactional outbox =====
// dotnet add package MassTransit.EntityFrameworkCore

// ===== OrderService/Data/OrderDbContext.cs =====
using MassTransit;
using Microsoft.EntityFrameworkCore;

public class OrderDbContext(DbContextOptions<OrderDbContext> options) : DbContext(options)
{
    public DbSet<Order> Orders => Set<Order>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.AddInboxStateEntity();      // de-duplication of CONSUMED messages
        modelBuilder.AddOutboxMessageEntity();   // messages waiting to be published
        modelBuilder.AddOutboxStateEntity();     // delivery state
    }
}

public class Order
{
    public Guid Id { get; set; }
    public string CustomerEmail { get; set; } = "";
    public decimal Total { get; set; }
    public string Status { get; set; } = "Placed";
}

// ===== OrderService/Program.cs =====
builder.Services.AddDbContext<OrderDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Orders")));

builder.Services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<OrderDbContext>(o =>
    {
        o.UseSqlServer();                       // SQL Server locking statements
        o.UseBusOutbox();                       // Publish/Send from controllers go to the outbox table
        o.QueryDelay = TimeSpan.FromSeconds(1); // how often the delivery service checks the table
    });

    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("admin"); h.Password("admin123"); });
        cfg.ConfigureEndpoints(context);
    });
});

// Add-Migration AddOutbox ; Update-Database   -> creates InboxState, OutboxMessage, OutboxState tables

// ===== Endpoint: ONE SaveChanges commits the order AND the message =====
app.MapPost("/api/orders", async (CreateOrderRequest req, OrderDbContext db,
                                  IPublishEndpoint publisher, CancellationToken ct) =>
{
    var order = new Order { Id = Guid.NewGuid(), CustomerEmail = req.Email, Total = req.Total };
    db.Orders.Add(order);

    await publisher.Publish(new OrderPlaced
    {
        OrderId = order.Id, CustomerEmail = order.CustomerEmail,
        Total = order.Total, PlacedAtUtc = DateTime.UtcNow
    }, ct);                                       // NOT sent yet - added to OutboxMessage

    await db.SaveChangesAsync(ct);                // order row + outbox row in the SAME transaction
    return Results.Accepted($"/api/orders/{order.Id}", new { order.Id });
});
// A background delivery service reads OutboxMessage and publishes to RabbitMQ, retrying until it succeeds.

// ===== Consumer side: inbox for idempotency (NotificationService with its own DbContext) =====
builder.Services.AddMassTransit(x =>
{
    x.AddEntityFrameworkOutbox<NotificationDbContext>(o => o.UseSqlServer());
    x.AddConfigureEndpointsCallback((context, name, cfg) =>
    {
        cfg.UseEntityFrameworkOutbox<NotificationDbContext>(context);   // inbox: skip already-consumed MessageIds
    });
    x.AddConsumer<OrderPlacedConsumer>();
    x.UsingRabbitMq((context, cfg) => { /* host... */ cfg.ConfigureEndpoints(context); });
});`;

const idempotentCode = `// ===== Manual idempotent consumer (works with any broker, easy to explain in interviews) =====
// SQL: CREATE TABLE ProcessedMessages (MessageId UNIQUEIDENTIFIER PRIMARY KEY, ProcessedAtUtc DATETIME2 NOT NULL);

public class ProcessedMessage
{
    public Guid MessageId { get; set; }
    public DateTime ProcessedAtUtc { get; set; }
}

public class ChargeLoyaltyPointsConsumer(LoyaltyDbContext db, ILogger<ChargeLoyaltyPointsConsumer> logger)
    : IConsumer<OrderPlaced>
{
    public async Task Consume(ConsumeContext<OrderPlaced> context)
    {
        Guid messageId = context.MessageId ?? throw new InvalidOperationException("MessageId missing");

        // 1. Already handled? (redelivery, retry after a crash, duplicate publish)
        if (await db.ProcessedMessages.AnyAsync(p => p.MessageId == messageId))
        {
            logger.LogInformation("Duplicate {MessageId} ignored", messageId);
            return;                                       // ACK it - nothing to do
        }

        // 2. Do the work AND record the id in ONE transaction
        await using var tx = await db.Database.BeginTransactionAsync();
        var account = await db.Accounts.SingleAsync(a => a.Email == context.Message.CustomerEmail);
        account.Points += (int)(context.Message.Total / 100);   // 1 point per Rs 100
        db.ProcessedMessages.Add(new ProcessedMessage { MessageId = messageId, ProcessedAtUtc = DateTime.UtcNow });

        try
        {
            await db.SaveChangesAsync();
            await tx.CommitAsync();
        }
        catch (DbUpdateException) when (await db.ProcessedMessages.AnyAsync(p => p.MessageId == messageId))
        {
            // two consumers raced on the same message; the PRIMARY KEY stopped the second one
            logger.LogInformation("Concurrent duplicate {MessageId} ignored", messageId);
        }
    }
}

// Other ways to be idempotent:
// - natural keys: INSERT invoice with UNIQUE(OrderId) -> second insert fails harmlessly
// - "set" operations instead of "add": UPDATE Orders SET Status='Shipped' (safe to repeat)
// - check current state: if (order.Status == "Paid") return;`;

const simCode = `using System;
using System.Collections.Generic;

var inbox = new HashSet<string>();          // processed MessageIds (a DB table in real life)
var errorQueue = new List<string>();        // MassTransit moves failed messages to <queue>_error
var gatewayTimeouts = new Dictionary<string, int> { ["m-2"] = 2, ["m-4"] = 5 };
const int RetryLimit = 3;                   // r.Immediate(3): 1 try + 3 retries, only for TimeoutException

var deliveries = new List<OrderPlaced>
{
    new("m-1", 101, 500),
    new("m-1", 101, 500),                   // the same message delivered again (redelivery)
    new("m-2", 102, 1200),
    new("m-3", 103, -50),                   // bad data -> permanent error
    new("m-4", 104, 300)                    // gateway down for too long
};

foreach (var msg in deliveries)
{
    Console.WriteLine($"Deliver {msg.MessageId} (order {msg.OrderId})");
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            Consume(msg);
            break;                                              // success -> ack
        }
        catch (TimeoutException ex) when (attempt <= RetryLimit)
        {
            Console.WriteLine($"  attempt {attempt} failed: {ex.Message}, retrying");
        }
        catch (Exception ex)                                    // ignored type or retries exhausted
        {
            errorQueue.Add(msg.MessageId);
            Console.WriteLine($"  moved to order-placed_error: {ex.Message}");
            break;
        }
    }
}
Console.WriteLine($"Summary: processed {inbox.Count}, error queue {errorQueue.Count}");

void Consume(OrderPlaced m)
{
    if (inbox.Contains(m.MessageId))
    {
        Console.WriteLine($"  skip: {m.MessageId} already processed (idempotent)");
        return;
    }
    if (m.Amount <= 0) throw new ArgumentException("amount must be positive");
    if (gatewayTimeouts.TryGetValue(m.MessageId, out int left) && left > 0)
    {
        gatewayTimeouts[m.MessageId] = left - 1;
        throw new TimeoutException("payment gateway timeout");
    }
    inbox.Add(m.MessageId);
    Console.WriteLine($"  charged Rs {m.Amount} for order {m.OrderId}");
}

record OrderPlaced(string MessageId, int OrderId, int Amount);
`;

export default {
  id: 'day-17-masstransit-rabbitmq-events',
  title: 'MassTransit with RabbitMQ: Publish/Subscribe Events, Retries, Error Queues, Outbox and Idempotent Consumers',
  module: 'Module 4: Caching, Background Jobs & Messaging',
  day: 17,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Use MassTransit, the most popular .NET messaging framework, to publish events from one service and consume them in another over RabbitMQ without writing low-level channel code. Configure consumers, retry and redelivery policies, error (dead-letter) queues and Fault<T> handlers, solve the dual-write problem with the transactional outbox, make consumers idempotent, and compare RabbitMQ with Azure Service Bus and Kafka.',
  objectives: [
    'Explain what MassTransit adds on top of RabbitMQ.Client and how it maps messages to exchanges and queues',
    'Publish an event from a Web API and consume it in a separate worker service',
    'Configure message retry, delayed redelivery, Ignore rules, _error queues and Fault<T> consumers',
    'Explain the dual-write problem and implement the EF Core transactional outbox and inbox',
    'Write idempotent consumers and choose between RabbitMQ, Azure Service Bus and Kafka',
  ],
  theory: [
    {
      heading: 'Why MassTransit?',
      content:
        'Day 16 showed raw RabbitMQ.Client: you declared exchanges and queues, serialized JSON, acked and nacked by hand, and wrote your own retry and dead-letter logic. MassTransit is an open-source distributed application framework that does all this plumbing for you. You define message contracts (C# records), write consumers (classes implementing IConsumer<T>) and call Publish or Send. MassTransit creates the topology (exchanges, queues, bindings), serializes messages (JSON envelope with MessageId, CorrelationId, headers), manages connections and channels, acks on success, applies retry policies, moves failed messages to error queues, supports the outbox pattern, sagas (state machines for long-running workflows), request/response and test harnesses. The same code can switch transports (RabbitMQ, Azure Service Bus, Amazon SQS, ActiveMQ, in-memory) mostly by changing UsingRabbitMq to UsingAzureServiceBus. Alternatives: NServiceBus (commercial), Wolverine, Rebus, Brighter. Licensing note: MassTransit v8 is Apache 2.0; from v9 MassTransit moved to a commercial license, so many teams stay on v8 or budget for it.',
      points: [
        'Message contract = a record/class (or interface) in a shared Contracts project',
        'Event (Publish): "OrderPlaced" - past tense, zero or many subscribers',
        'Command (Send): "SendInvoice" - imperative, exactly one receiver endpoint',
        'Consumer = class with Consume(ConsumeContext<T>); returning = success, throwing = failure',
      ],
    },
    {
      heading: 'Publish/subscribe and the RabbitMQ topology MassTransit creates',
      content:
        'When a consumer for OrderPlaced is registered and ConfigureEndpoints(context) runs, MassTransit creates: a fanout exchange named after the message type (Contracts:OrderPlaced), a receive endpoint exchange and queue named from the consumer (with SetKebabCaseEndpointNameFormatter, OrderPlacedConsumer becomes "order-placed"), and a binding between them. When the Order API calls IPublishEndpoint.Publish(new OrderPlaced { ... }), the message goes to the Contracts:OrderPlaced exchange and is copied to every subscribed service\'s queue. If the Notification service and the Loyalty service both consume OrderPlaced, each gets its own copy; if you run 3 instances of the Notification service, they compete on the same queue and each message is processed once by that service. Message types must have the same full name (namespace + class) on both sides, which is why a shared Contracts library is used.',
      syntax: `builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();
    x.AddConsumer<OrderPlacedConsumer>();
    x.UsingRabbitMq((context, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("guest"); h.Password("guest"); });
        cfg.ConfigureEndpoints(context);
    });
});
await publishEndpoint.Publish(new OrderPlaced { ... });`,
    },
    {
      heading: 'Retries, redelivery, error queues and faults',
      content:
        'When a consumer throws, MassTransit applies the configured middleware in order. UseMessageRetry retries in memory immediately or after short intervals (Immediate(3), Interval(3, TimeSpan.FromSeconds(2)), Intervals(500, 1000, 2000), Exponential(...)) - good for transient glitches like a deadlock or a short timeout. UseDelayedRedelivery (second-level retry) puts the message back on the broker to retry after minutes or hours - good for "the payment gateway is down for 20 minutes". Use Ignore<T>() or Handle<T>() to skip retries for permanent errors such as validation failures. If all retries fail, the message is moved to the "<queue>_error" queue with headers containing the exception details - this is MassTransit\'s dead-letter queue - and a Fault<T> event is published, which you can consume to alert support. Messages with no matching consumer go to "<queue>_skipped". Nothing is lost: you can fix the bug and move messages from _error back to the main queue.',
      points: [
        'Retry only transient errors; retrying bad data just wastes time',
        'Order matters: configure UseDelayedRedelivery before UseMessageRetry so each redelivery gets the immediate retries again',
        'Delayed redelivery on RabbitMQ needs the delayed message exchange plugin (rabbitmq_delayed_message_exchange) and cfg.UseDelayedMessageScheduler()',
        'ConcurrentMessageLimit / PrefetchCount control how many messages a consumer processes in parallel',
      ],
    },
    {
      heading: 'The transactional outbox pattern',
      content:
        'The dual-write problem: an API must save the order to SQL Server AND publish OrderPlaced to RabbitMQ. These are two different systems with no shared transaction. If the app crashes between the two steps, either the order exists but nobody is notified, or (if you publish first) consumers react to an order that was never saved. The outbox pattern fixes this: instead of publishing directly, the message is inserted into an OutboxMessage table in the SAME database transaction as the business data. A background delivery service then reads the outbox table and publishes to the broker, retrying until the broker confirms, and marks rows as delivered. Either both the order and its message are committed, or neither is. With MassTransit: AddEntityFrameworkOutbox<TDbContext>(o => { o.UseSqlServer(); o.UseBusOutbox(); }) plus modelBuilder.AddOutboxMessageEntity(), AddOutboxStateEntity() and AddInboxStateEntity(). Note that the outbox guarantees AT-LEAST-ONCE delivery - a message can still be published twice (crash after publish, before marking delivered) - so consumers must be idempotent.',
      syntax: `x.AddEntityFrameworkOutbox<OrderDbContext>(o =>
{
    o.UseSqlServer();
    o.UseBusOutbox();
});
// endpoint: db.Orders.Add(order); await publisher.Publish(evt); await db.SaveChangesAsync();`,
    },
    {
      heading: 'Idempotent consumers and the inbox',
      content:
        'An operation is idempotent if doing it twice has the same effect as doing it once. Message systems deliver at least once: redelivery after a crash, retries, outbox re-publishing and network glitches all create duplicates. A consumer that adds loyalty points or charges a card must not do it twice. Techniques: (1) store processed MessageIds in a table with a primary key and skip duplicates (an "inbox" - MassTransit\'s UseEntityFrameworkOutbox on the receive endpoint does this for you with the InboxState table), (2) rely on natural unique keys (one invoice per OrderId, UNIQUE constraint), (3) use set-style updates (Status = "Shipped") instead of increments, and (4) check current state before acting. Do the business change and the "processed" record in the same transaction.',
      tip: 'Interview line: "Exactly-once delivery is practically impossible across systems; we build exactly-once PROCESSING with at-least-once delivery plus idempotent consumers."',
    },
    {
      heading: 'RabbitMQ vs Azure Service Bus vs Kafka',
      content:
        'RabbitMQ is an open-source message broker with flexible routing (exchanges), per-message acknowledgements and low latency; you host it yourself (Docker/Kubernetes) or use a managed offering (CloudAMQP, Amazon MQ). Azure Service Bus is a fully managed enterprise broker in Azure with queues, topics and subscriptions (pub/sub with filters), built-in dead-letter queues, duplicate detection, sessions (FIFO per key), scheduled messages and transactions; no servers to manage, pay per use; MassTransit supports it with MassTransit.Azure.ServiceBus.Core and x.UsingAzureServiceBus. Apache Kafka is a distributed commit log, not a classic queue: messages are appended to partitioned topics and kept for a retention period (days or forever), consumers track their own offsets, consumer groups scale by partitions, ordering is guaranteed per partition and you can replay history. Kafka handles millions of events per second and is used for event streaming, analytics, logs and event sourcing; it is heavier to operate (Azure Event Hubs and Confluent Cloud offer Kafka-compatible managed services). In .NET use Confluent.Kafka, or MassTransit\'s Kafka "rider".',
      points: [
        'Task/command queues and business events between microservices: RabbitMQ or Azure Service Bus',
        'Already on Azure and want zero maintenance: Azure Service Bus',
        'High-volume event streams, replay, analytics pipelines, activity tracking: Kafka',
        'Messages in RabbitMQ/ASB are removed once acknowledged; in Kafka they stay until retention expires',
      ],
    },
  ],
  examples: [
    {
      title: 'Publish/subscribe between two services: OrderService and NotificationService',
      scenario:
        'A Flipkart-style shop: when an order is placed, the Order API must not call the notification system directly. It publishes an OrderPlaced event; a separate Notification worker consumes it and sends email/SMS. Later a Loyalty service will subscribe without any change to the Order API.',
      steps: [
        'Run RabbitMQ in Docker (command in the code comments) and open http://localhost:15672',
        'Create a blank solution ShopSystem with Contracts (Class Library), OrderService (ASP.NET Core Web API, empty) and NotificationService (Worker Service)',
        'Reference Contracts from both services; install MassTransit.RabbitMQ in both',
        'Add the code below, set both services as startup projects (right-click solution > Configure Startup Projects > Multiple) and press F5',
        'POST https://localhost:7001/api/orders with {"email":"asha@gmail.com","mobile":"9876543210","total":1598}',
        'In the RabbitMQ UI check Exchanges (Contracts:OrderPlaced, order-placed) and Queues (order-placed)',
      ],
      code: setupCode,
      result: `OrderService:   POST /api/orders -> 202 Accepted {"orderId":"3f6c2a5e-..."}
NotificationService console:
info: MassTransit[0] Bus started: rabbitmq://localhost/
info: OrderPlacedConsumer[0] Order 3f6c2a5e-...: sending confirmation to asha@gmail.com for Rs 1598
RabbitMQ UI:
  Exchanges: Contracts:OrderPlaced (fanout) -> order-placed (fanout) -> queue order-placed
  Queues: order-placed  Ready 0  Unacked 0  (message consumed and acked)
Stop NotificationService and post 3 orders -> order-placed shows Ready 3; start it again -> all 3 processed`,
      explanation:
        'The Order API only knows the contract and IPublishEndpoint - it does not know who listens. ConfigureEndpoints in the consumer service created the queue order-placed (kebab-case from OrderPlacedConsumer) and bound it to the message-type exchange. Because the queue is durable and messages are persistent by default, orders published while the notification service is down are processed when it comes back. Adding a LoyaltyService with its own consumer creates a second queue bound to the same exchange: both receive every event.',
    },
    {
      title: 'Retries, delayed redelivery, Ignore rules, the _error queue and Fault<T>',
      scenario:
        'Sending payment receipts calls an SMS gateway that sometimes times out for a few seconds and is sometimes down for 20 minutes. Invalid totals must not be retried. Support must be alerted when a receipt finally fails.',
      steps: [
        'Enable the delayed exchange plugin (rabbitmq_delayed_message_exchange) in the RabbitMQ container, or remove UseDelayedRedelivery for a quick test',
        'Add PaymentReceiptConsumer, its ConsumerDefinition and PaymentReceiptFaultConsumer to NotificationService',
        'Register them as shown and run',
        'Make IReceiptSender throw TimeoutException every time, publish an order and watch the logs',
        'Publish an order with Total = 0 and check the payment-receipts_error queue in the UI (Get messages shows MT-Fault-* headers)',
      ],
      code: retryCode,
      result: `Order with Total 1598, gateway always timing out:
  attempt 1 fails -> retry after 500 ms -> after 1000 ms -> after 2000 ms (4 tries)
  delayed redelivery after 5 min (4 more tries), after 15 min (4 more tries)
  -> message moved to payment-receipts_error
  fail: PaymentReceiptFaultConsumer[0] Receipt FAILED for order 3f6c...: The operation has timed out.
Order with Total 0:
  ArgumentException is ignored by the retry policy -> moved to payment-receipts_error immediately
  RabbitMQ UI > payment-receipts_error > Get messages: headers MT-Fault-ExceptionType = System.ArgumentException,
  MT-Fault-Message = Total must be positive`,
      explanation:
        'Immediate retries handle short glitches without touching the broker. Delayed redelivery returns the message to RabbitMQ with a delay, so the consumer is free for other messages while the gateway recovers; each redelivery runs the immediate retries again. Ignore<ArgumentException>() skips pointless retries for bad data. After the final failure the message is safe in the _error queue with exception headers, and the Fault<OrderPlaced> event lets you alert support automatically.',
    },
    {
      title: 'Transactional outbox with EF Core: never lose an OrderPlaced event',
      scenario:
        'Auditors found orders in the database for which customers never got a confirmation, because the API crashed between SaveChanges and Publish during a deployment. Fix it with the MassTransit Entity Framework outbox.',
      steps: [
        'dotnet add OrderService package MassTransit.EntityFrameworkCore (plus Microsoft.EntityFrameworkCore.SqlServer and .Tools)',
        'Update OrderDbContext with the three Add...Entity() calls and register AddEntityFrameworkOutbox in Program.cs',
        'Package Manager Console: Add-Migration AddOutbox, then Update-Database',
        'Change the endpoint so Publish happens BEFORE SaveChangesAsync, as shown',
        'Stop RabbitMQ (docker stop rabbitmq), post an order, look at the OutboxMessage table in SSMS, then docker start rabbitmq and watch it get delivered',
      ],
      code: outboxCode,
      result: `RabbitMQ stopped, POST /api/orders -> 202 Accepted (the API still works!)
SSMS: SELECT MessageType, SentTime FROM OutboxMessage;
  urn:message:Contracts:OrderPlaced   2026-11-20 10:15:02
docker start rabbitmq
  -> delivery service publishes the message within a few seconds, the row is removed
  -> NotificationService logs: sending confirmation to asha@gmail.com for Rs 1598
If SaveChangesAsync throws (e.g. constraint error): neither the order nor the message is stored`,
      explanation:
        'With UseBusOutbox, IPublishEndpoint.Publish inside a request writes to the OutboxMessage table through the DbContext instead of calling RabbitMQ. SaveChangesAsync commits the order and the message atomically. The bus outbox delivery service (a hosted service) publishes pending rows and retries while the broker is down. On the consumer side, UseEntityFrameworkOutbox on endpoints adds an inbox (InboxState) that records consumed MessageIds, so a re-published message is not processed twice.',
    },
    {
      title: 'An idempotent consumer with a ProcessedMessages table',
      scenario:
        'The loyalty service adds 1 point per Rs 100 of every order. A redelivered message once gave a customer double points. Make the consumer safe to run any number of times.',
      steps: [
        'Create the ProcessedMessages table (or add the entity and a migration) in LoyaltyDbContext',
        'Add ChargeLoyaltyPointsConsumer and register it with x.AddConsumer<ChargeLoyaltyPointsConsumer>()',
        'Test: publish one order, then use RabbitMQ UI to publish the same message body with the same message_id header again',
      ],
      code: idempotentCode,
      result: `First delivery : account asha@gmail.com Points 120 -> 135 (Total 1598 / 100 = 15)
                 ProcessedMessages: 1 row (MessageId 7b1e...)
Second delivery: info: Duplicate 7b1e... ignored   (points stay 135, message acked)`,
      explanation:
        'MassTransit gives every message a MessageId that stays the same across retries and redeliveries. The consumer checks it first and records it in the same transaction as the business change, so either both happen or neither. The primary key on MessageId protects against two instances processing the same message at the same moment. (int)(1598 / 100) = (int)15.98 = 15 points.',
    },
    {
      title: 'Console demo: retries, idempotency and the error queue',
      scenario:
        'Predict how a MassTransit consumer behaves for a normal message, a duplicate, a transient failure that recovers, a permanent error and a transient failure that never recovers.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it ConsumerPipelineDemo',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 and compare each block with the scenario list in the comments',
      ],
      code: simCode,
      csharp: { files: { 'Program.cs': simCode }, stdin: '' },
      result: `Deliver m-1 (order 101)
  charged Rs 500 for order 101
Deliver m-1 (order 101)
  skip: m-1 already processed (idempotent)
Deliver m-2 (order 102)
  attempt 1 failed: payment gateway timeout, retrying
  attempt 2 failed: payment gateway timeout, retrying
  charged Rs 1200 for order 102
Deliver m-3 (order 103)
  moved to order-placed_error: amount must be positive
Deliver m-4 (order 104)
  attempt 1 failed: payment gateway timeout, retrying
  attempt 2 failed: payment gateway timeout, retrying
  attempt 3 failed: payment gateway timeout, retrying
  moved to order-placed_error: payment gateway timeout
Summary: processed 2, error queue 2`,
      explanation:
        'm-1 is processed once and the duplicate is skipped thanks to the inbox set. m-2 times out twice and succeeds on attempt 3. m-3 throws ArgumentException, which the filter does not retry (like r.Ignore<ArgumentException>()), so it goes straight to the error queue. m-4 times out 4 times: attempts 1-3 match "attempt <= RetryLimit" and are retried; on attempt 4 the filter is false, so the general catch moves it to the error queue. Only m-1 and m-2 were processed.',
    },
  ],
  interview: [
    { q: 'What is MassTransit and why use it instead of RabbitMQ.Client directly?', a: 'A .NET distributed application framework over brokers (RabbitMQ, Azure Service Bus, SQS...). It handles topology, serialization, connection management, acks, retries, error queues, outbox/inbox, sagas and testing, so you write only contracts and consumers, and you can switch transports with little code change.', level: 'Easy' },
    { q: 'Publish vs Send in MassTransit?', a: 'Publish broadcasts an event to all subscribers of that message type (0..n consumers) via the type exchange. Send delivers a command to one specific endpoint/queue address via ISendEndpointProvider.GetSendEndpoint(uri).', level: 'Easy' },
    { q: 'How does MassTransit name queues and exchanges on RabbitMQ?', a: 'An exchange per message type using its full name (Namespace:Type), and a queue + exchange per receive endpoint named from the consumer by the endpoint name formatter (kebab-case: OrderPlacedConsumer -> order-placed). The type exchange is bound to the endpoint exchange.', level: 'Medium' },
    { q: 'What happens when a MassTransit consumer throws an exception?', a: 'The retry policy (UseMessageRetry, then UseDelayedRedelivery if configured) runs. If it still fails, the message is moved to the <queue>_error queue with fault headers and a Fault<T> event is published.', level: 'Medium' },
    { q: 'Immediate retry vs delayed redelivery?', a: 'Message retry re-runs the consumer in memory after short intervals while holding the message - good for brief transient errors. Delayed redelivery returns the message to the broker to be delivered again after minutes/hours - good for longer outages, without blocking the consumer.', level: 'Medium' },
    { q: 'Which errors should not be retried and how do you configure that?', a: 'Permanent errors like validation failures, ArgumentException, business rule violations. Use r.Ignore<T>() (or Handle<T>() to retry only specific types) in UseMessageRetry.', level: 'Medium' },
    { q: 'What is the dual-write problem?', a: 'Writing to two systems (database and message broker) without a shared transaction. A crash between them leaves them inconsistent: data saved but event lost, or event published but data not saved.', level: 'Medium' },
    { q: 'Explain the transactional outbox pattern.', a: 'Store outgoing messages in an outbox table in the same database transaction as the business data. A separate relay/delivery process reads the table and publishes to the broker, retrying until successful, then marks/deletes the rows. Guarantees at-least-once publishing without distributed transactions.', level: 'Hard' },
    { q: 'What is an idempotent consumer and how do you implement one?', a: 'A consumer that produces the same result no matter how many times it processes the same message. Implement with a processed-message-id table (inbox) with a unique key, natural unique constraints, set-based updates, or state checks, recording the id in the same transaction as the work.', level: 'Medium' },
    { q: 'Can a message broker guarantee exactly-once delivery?', a: 'Not practically across a network and separate systems. Brokers offer at-most-once or at-least-once. Exactly-once processing is achieved by at-least-once delivery plus idempotent consumers (or transactional features within one system, like Kafka transactions).', level: 'Hard' },
    { q: 'What is a dead-letter queue in MassTransit terms?', a: 'The <queue>_error queue, holding messages that failed after all retries, with exception details in headers. _skipped holds messages with no consumer for their type. You can inspect and move messages back for reprocessing after fixing the issue.', level: 'Medium' },
    { q: 'RabbitMQ vs Kafka?', a: 'RabbitMQ is a message broker: smart routing via exchanges, per-message ack, messages removed after consumption, great for task queues and service events. Kafka is a distributed log: partitioned topics, messages retained for a period, consumers track offsets and can replay, very high throughput, ordering per partition, used for event streaming and analytics.', level: 'Medium' },
    { q: 'When would you choose Azure Service Bus?', a: 'When running on Azure and you want a fully managed enterprise broker with topics/subscriptions, built-in DLQ, duplicate detection, sessions for ordered processing, scheduled messages and no servers to maintain.', level: 'Medium' },
    { q: 'How do you guarantee message ordering?', a: 'Ordering is generally per queue with a single consumer and no parallelism (prefetch 1/concurrency 1), which limits throughput. Azure Service Bus sessions and Kafka partitions provide ordering per key (e.g. per OrderId) while still scaling. Retries and redelivery can break ordering, so design consumers to tolerate it where possible (version numbers, state checks).', level: 'Hard' },
    { q: 'What is a saga in MassTransit?', a: 'A state machine (MassTransitStateMachine) that coordinates a long-running business process across services by reacting to events and storing state (e.g. Order: Submitted -> PaymentReceived -> Shipped), including compensations when a step fails.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a second subscriber service "InventoryService" that consumes OrderPlaced and logs "Reserving stock for order <id>". Verify that both NotificationService and InventoryService receive every order.',
      hint: 'New Worker Service, reference Contracts, AddConsumer<ReserveStockConsumer>(), same RabbitMQ host. Check the new queue in the UI.',
      solution: `public class ReserveStockConsumer(ILogger<ReserveStockConsumer> log) : IConsumer<OrderPlaced>
{
    public Task Consume(ConsumeContext<OrderPlaced> context)
    {
        log.LogInformation("Reserving stock for order {OrderId}", context.Message.OrderId);
        return Task.CompletedTask;
    }
}

// InventoryService/Program.cs
builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();
    x.AddConsumer<ReserveStockConsumer>();            // queue "reserve-stock"
    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host("localhost", "/", h => { h.Username("admin"); h.Password("admin123"); });
        cfg.ConfigureEndpoints(ctx);
    });
});
// RabbitMQ UI: exchange Contracts:OrderPlaced now has 2 bindings (order-placed, reserve-stock)`,
    },
    {
      task: 'Configure the OrderPlacedConsumer endpoint to retry 5 times with exponential backoff (min 1 s, max 30 s, delta 2 s) and never retry ValidationException.',
      hint: 'Use a ConsumerDefinition or AddConsumer<T>((context, c) => c.UseMessageRetry(...)) and r.Exponential(...) + r.Ignore<ValidationException>().',
      solution: `x.AddConsumer<OrderPlacedConsumer>((context, c) =>
    c.UseMessageRetry(r =>
    {
        r.Exponential(5, TimeSpan.FromSeconds(1), TimeSpan.FromSeconds(30), TimeSpan.FromSeconds(2));
        r.Ignore<ValidationException>();
    }));`,
    },
    {
      task: 'Send a command (not an event) "GenerateInvoice" from OrderService directly to the queue "generate-invoice".',
      hint: 'Inject ISendEndpointProvider and call GetSendEndpoint(new Uri("queue:generate-invoice")).',
      solution: `public record GenerateInvoice(Guid OrderId, decimal Total);

app.MapPost("/api/orders/{id:guid}/invoice", async (Guid id, ISendEndpointProvider sendProvider) =>
{
    var endpoint = await sendProvider.GetSendEndpoint(new Uri("queue:generate-invoice"));
    await endpoint.Send(new GenerateInvoice(id, 1598m));
    return Results.Accepted();
});
// Consumer in the invoice service: IConsumer<GenerateInvoice>, endpoint name "generate-invoice"`,
    },
    {
      task: 'Write a short comparison (for a design document) recommending a broker for: (a) a college ERP on-premises sending emails and PDFs, (b) a startup fully on Azure with 5 microservices, (c) a ride-hailing app tracking 50,000 driver GPS updates per second for analytics.',
      hint: 'Think about hosting, management effort, throughput and replay needs.',
      solution: `(a) RabbitMQ (Docker/VM on-premises): free, simple task queues, good .NET support with MassTransit.
(b) Azure Service Bus: fully managed, topics/subscriptions for events, built-in DLQ and duplicate detection,
    MassTransit UsingAzureServiceBus keeps code transport-agnostic.
(c) Kafka (or Azure Event Hubs with Kafka API): very high throughput, partitioned by driverId for ordering,
    retention allows replay for analytics and new consumers.`,
    },
    {
      task: 'In the ConsumerPipelineDemo, change RetryLimit to 4 and predict the output lines for m-4 (gateway fails 5 times).',
      hint: 'Attempts 1-4 are retried; attempt 5 fails and the filter attempt <= 4 is false.',
      solution: `Deliver m-4 (order 104)
  attempt 1 failed: payment gateway timeout, retrying
  attempt 2 failed: payment gateway timeout, retrying
  attempt 3 failed: payment gateway timeout, retrying
  attempt 4 failed: payment gateway timeout, retrying
  moved to order-placed_error: payment gateway timeout`,
    },
  ],
  quiz: [
    {
      question: 'In MassTransit, which interface does a class implement to handle OrderPlaced messages?',
      options: ['IHandler<OrderPlaced>', 'IConsumer<OrderPlaced>', 'IMessageReceiver<OrderPlaced>', 'IHostedService'],
      answer: 1,
      explanation: 'Consumers implement IConsumer<T> with Task Consume(ConsumeContext<T> context).',
    },
    {
      question: 'With SetKebabCaseEndpointNameFormatter, where does a message go after OrderPlacedConsumer fails all retries?',
      options: ['order-placed_error', 'order-placed_skipped', 'It is deleted', 'dead-letters'],
      answer: 0,
      explanation: 'Faulted messages are moved to <endpoint>_error; _skipped is for messages with no matching consumer.',
    },
    {
      question: 'What problem does the transactional outbox solve?',
      options: ['Slow JSON serialization', 'Saving data and publishing a message atomically (the dual-write problem)', 'Message ordering in Kafka', 'Authentication between services'],
      answer: 1,
      explanation: 'The message is stored in the same DB transaction as the business data and published afterwards by a relay.',
    },
    {
      question: 'Why must consumers be idempotent even with the outbox pattern?',
      options: ['Because MassTransit encrypts messages', 'Because delivery is at-least-once, so duplicates can occur', 'Because RabbitMQ deletes messages randomly', 'They do not need to be'],
      answer: 1,
      explanation: 'Retries, redeliveries and outbox re-publishing can deliver the same message more than once.',
    },
    {
      question: 'Which platform keeps messages for a retention period so that new consumers can replay old events?',
      options: ['RabbitMQ classic queue', 'Azure Service Bus queue', 'Apache Kafka', 'IMemoryCache'],
      answer: 2,
      explanation: 'Kafka is a distributed log; consumers track offsets and can re-read retained messages. Queues delete messages after acknowledgement.',
    },
  ],
};
