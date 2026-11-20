const dockerCode = `# ===== Run RabbitMQ with the management UI =====
docker run -d --name rabbitmq --hostname rabbit-dev \`
  -p 5672:5672 -p 15672:15672 \`
  -e RABBITMQ_DEFAULT_USER=admin -e RABBITMQ_DEFAULT_PASS=admin123 \`
  -v rabbitmq-data:/var/lib/rabbitmq \`
  rabbitmq:4-management
# (Linux/macOS: use \\ instead of the PowerShell back-tick for line continuation)

docker ps
docker logs -f rabbitmq            # wait for "Server startup complete"

# 5672  = AMQP port your .NET apps connect to
# 15672 = management UI -> http://localhost:15672  (login admin / admin123; default image user is guest/guest, localhost only)
# --hostname matters: RabbitMQ stores data per node name, keep it fixed so the volume is reused

# ===== docker-compose.yml alternative =====
services:
  rabbitmq:
    image: rabbitmq:4-management
    hostname: rabbit-dev
    ports: [ "5672:5672", "15672:15672" ]
    environment:
      RABBITMQ_DEFAULT_USER: admin
      RABBITMQ_DEFAULT_PASS: admin123
    volumes: [ "rabbitmq-data:/var/lib/rabbitmq" ]
volumes:
  rabbitmq-data:

# ===== Useful CLI inside the container =====
docker exec rabbitmq rabbitmqctl list_queues name messages consumers
docker exec rabbitmq rabbitmqctl list_exchanges name type
docker exec rabbitmq rabbitmqctl list_bindings`;

const producerCode = `// ===== Create the project =====
// dotnet new console -n OrderProducer
// cd OrderProducer
// dotnet add package RabbitMQ.Client          (version 7.x - fully async API)

// ===== OrderProducer/Program.cs =====
using System.Text;
using System.Text.Json;
using RabbitMQ.Client;

var factory = new ConnectionFactory
{
    HostName = "localhost",
    UserName = "admin",
    Password = "admin123",
    ClientProvidedName = "order-producer"       // shows in the management UI
};

// A connection is a TCP connection (expensive: create once per app).
// A channel is a lightweight virtual connection inside it (use one per thread/task).
await using IConnection connection = await factory.CreateConnectionAsync();
await using IChannel channel = await connection.CreateChannelAsync();

// Declare is idempotent: creates the queue only if it does not exist
await channel.QueueDeclareAsync(
    queue: "orders",
    durable: true,          // queue definition survives a broker restart
    exclusive: false,
    autoDelete: false,
    arguments: null);

var orders = new[]
{
    new OrderPlaced(1001, "Asha Patil", 1598m),
    new OrderPlaced(1002, "Ravi Kumar", 249m),
    new OrderPlaced(1003, "Neha Shah", 2499m)
};

foreach (var order in orders)
{
    byte[] body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(order));

    var props = new BasicProperties
    {
        Persistent = true,                       // message written to disk (DeliveryMode = 2)
        ContentType = "application/json",
        MessageId = Guid.NewGuid().ToString(),   // useful for de-duplication later
        Type = nameof(OrderPlaced)
    };

    // exchange "" = the default exchange: routes to the queue whose NAME equals the routing key
    await channel.BasicPublishAsync(exchange: string.Empty, routingKey: "orders",
                                    mandatory: true, basicProperties: props, body: body);
    Console.WriteLine($"Sent order {order.OrderId} ({order.Customer}, Rs {order.Amount})");
}

public record OrderPlaced(int OrderId, string Customer, decimal Amount);`;

const consumerCode = `// ===== dotnet new worker -n InvoiceWorker ; dotnet add package RabbitMQ.Client =====
// ===== InvoiceWorker/OrderConsumer.cs =====
using System.Text;
using System.Text.Json;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;

public class OrderConsumer(ILogger<OrderConsumer> logger) : BackgroundService
{
    private IConnection? connection;
    private IChannel? channel;

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        var factory = new ConnectionFactory { HostName = "localhost", UserName = "admin", Password = "admin123" };
        connection = await factory.CreateConnectionAsync(stoppingToken);
        channel = await connection.CreateChannelAsync(cancellationToken: stoppingToken);

        // Dead-letter setup: rejected messages go to exchange "orders.dlx" -> queue "orders.dead"
        await channel.ExchangeDeclareAsync("orders.dlx", ExchangeType.Fanout, durable: true);
        await channel.QueueDeclareAsync("orders.dead", durable: true, exclusive: false, autoDelete: false);
        await channel.QueueBindAsync("orders.dead", "orders.dlx", routingKey: "");

        // NOTE: arguments must match the first declaration; delete the old "orders" queue in the UI
        // if you created it without these arguments in the producer demo.
        await channel.QueueDeclareAsync("orders", durable: true, exclusive: false, autoDelete: false,
            arguments: new Dictionary<string, object?> { ["x-dead-letter-exchange"] = "orders.dlx" });

        // Fair dispatch: give this consumer at most 5 unacknowledged messages at a time
        await channel.BasicQosAsync(prefetchSize: 0, prefetchCount: 5, global: false);

        var consumer = new AsyncEventingBasicConsumer(channel);
        consumer.ReceivedAsync += async (_, ea) =>
        {
            string json = Encoding.UTF8.GetString(ea.Body.ToArray());
            try
            {
                var order = JsonSerializer.Deserialize<OrderPlaced>(json)
                            ?? throw new InvalidDataException("Empty message");
                if (order.Amount <= 0) throw new InvalidDataException($"Bad amount for order {order.OrderId}");

                await Task.Delay(500, stoppingToken);                 // create invoice PDF...
                logger.LogInformation("Invoice created for order {Id}", order.OrderId);

                // ACK only after the work is done -> if we crash before this, RabbitMQ redelivers
                await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
            }
            catch (InvalidDataException ex)
            {
                logger.LogWarning("Rejecting message: {Reason}", ex.Message);
                // requeue: false -> goes to the dead-letter exchange instead of looping forever
                await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Temporary failure, requeueing");
                await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: true);
            }
        };

        // autoAck: false = manual acknowledgements (safe). autoAck: true = message deleted on delivery.
        await channel.BasicConsumeAsync(queue: "orders", autoAck: false, consumer: consumer,
                                        cancellationToken: stoppingToken);

        await Task.Delay(Timeout.Infinite, stoppingToken);           // keep the service alive
    }

    public override async Task StopAsync(CancellationToken ct)
    {
        if (channel is not null) await channel.CloseAsync(ct);
        if (connection is not null) await connection.CloseAsync(ct);
        await base.StopAsync(ct);
    }
}

public record OrderPlaced(int OrderId, string Customer, decimal Amount);

// ===== Program.cs =====
// var builder = Host.CreateApplicationBuilder(args);
// builder.Services.AddHostedService<OrderConsumer>();
// builder.Build().Run();`;

const exchangeCode = `// ===== Topic exchange: route application logs by "service.level" =====
using System.Text;
using RabbitMQ.Client;

var factory = new ConnectionFactory { HostName = "localhost", UserName = "admin", Password = "admin123" };
await using var connection = await factory.CreateConnectionAsync();
await using var channel = await connection.CreateChannelAsync();

await channel.ExchangeDeclareAsync("logs.topic", ExchangeType.Topic, durable: true);

// queue + binding key; * = exactly one word, # = zero or more words
var bindings = new (string Queue, string Key)[]
{
    ("all-errors",   "*.error"),
    ("payment-logs", "payment.#"),
    ("everything",   "#")
};
foreach (var (queue, key) in bindings)
{
    await channel.QueueDeclareAsync(queue, durable: true, exclusive: false, autoDelete: false);
    await channel.QueueBindAsync(queue, "logs.topic", key);
}

foreach (var key in new[] { "payment.error", "inventory.error", "payment.upi.success" })
{
    await channel.BasicPublishAsync("logs.topic", key, Encoding.UTF8.GetBytes($"log for {key}"));
    Console.WriteLine($"Published {key}");
}

// ===== Fanout exchange: every bound queue gets a copy (routing key ignored) =====
await channel.ExchangeDeclareAsync("student.registered", ExchangeType.Fanout, durable: true);
foreach (var q in new[] { "send-welcome-email", "create-library-card", "notify-hostel" })
{
    await channel.QueueDeclareAsync(q, durable: true, exclusive: false, autoDelete: false);
    await channel.QueueBindAsync(q, "student.registered", routingKey: "");
}
await channel.BasicPublishAsync("student.registered", "", Encoding.UTF8.GetBytes("{\\"studentId\\":501}"));

// ===== Direct exchange: exact routing key match =====
await channel.ExchangeDeclareAsync("payments.direct", ExchangeType.Direct, durable: true);
await channel.QueueDeclareAsync("upi-payments", durable: true, exclusive: false, autoDelete: false);
await channel.QueueBindAsync("upi-payments", "payments.direct", "upi");
await channel.BasicPublishAsync("payments.direct", "upi", Encoding.UTF8.GetBytes("Rs 499 via UPI"));     // -> upi-payments
await channel.BasicPublishAsync("payments.direct", "card", Encoding.UTF8.GetBytes("Rs 999 via card"));   // -> dropped (no binding)`;

const routingSimCode = `using System;
using System.Collections.Generic;
using System.Linq;

// How RabbitMQ exchanges decide which queues receive a message
var bindings = new List<(string Exchange, string Queue, string Key)>
{
    ("orders.direct", "invoice-queue", "order.created"),
    ("orders.direct", "refund-queue",  "order.cancelled"),
    ("notify.fanout", "email-queue",   ""),
    ("notify.fanout", "sms-queue",     ""),
    ("logs.topic",    "all-errors",    "*.error"),
    ("logs.topic",    "payment-logs",  "payment.#"),
    ("logs.topic",    "everything",    "#")
};
var types = new Dictionary<string, string>
{
    ["orders.direct"] = "direct",
    ["notify.fanout"] = "fanout",
    ["logs.topic"] = "topic"
};

Publish("orders.direct", "order.created");
Publish("orders.direct", "order.shipped");
Publish("notify.fanout", "anything");
Publish("logs.topic", "payment.error");
Publish("logs.topic", "inventory.error");
Publish("logs.topic", "payment.upi.success");
Publish("logs.topic", "payment");

void Publish(string exchange, string routingKey)
{
    var queues = bindings
        .Where(b => b.Exchange == exchange && Matches(types[exchange], b.Key, routingKey))
        .Select(b => b.Queue)
        .ToList();
    string target = queues.Count == 0 ? "(no queue - message dropped)" : string.Join(", ", queues);
    Console.WriteLine($"{exchange,-14} key={routingKey,-20} -> {target}");
}

bool Matches(string type, string bindingKey, string routingKey) => type switch
{
    "fanout" => true,                                   // ignores the key
    "direct" => bindingKey == routingKey,               // exact match
    "topic"  => TopicMatch(bindingKey.Split('.'), 0, routingKey.Split('.'), 0),
    _ => false
};

// * = exactly one word, # = zero or more words
bool TopicMatch(string[] p, int i, string[] w, int j)
{
    if (i == p.Length) return j == w.Length;
    if (p[i] == "#")
        return TopicMatch(p, i + 1, w, j) || (j < w.Length && TopicMatch(p, i, w, j + 1));
    if (j == w.Length) return false;
    return (p[i] == "*" || p[i] == w[j]) && TopicMatch(p, i + 1, w, j + 1);
}
`;

export default {
  id: 'day-16-rabbitmq-messaging-basics',
  title: 'Messaging Basics with RabbitMQ: Queues, Exchanges, Bindings, Acknowledgements and RabbitMQ.Client',
  module: 'Module 4: Caching, Background Jobs & Messaging',
  day: 16,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Learn why distributed systems use message queues, and build producers and consumers in .NET with RabbitMQ. Run RabbitMQ in Docker, understand exchanges (default, direct, fanout, topic), queues, bindings and routing keys, use manual acknowledgements, prefetch, durable queues and persistent messages, and send poison messages to a dead-letter queue.',
  objectives: [
    'Explain why message queues are used: decoupling, load levelling, reliability and async processing',
    'Run RabbitMQ with the management UI in Docker and read queues and messages in the UI',
    'Write a producer and a consumer with RabbitMQ.Client 7 (async API)',
    'Choose between direct, fanout and topic exchanges and design bindings with routing keys',
    'Make messaging reliable with durable queues, persistent messages, manual acks, prefetch and dead-lettering',
  ],
  theory: [
    {
      heading: 'Why message queues?',
      content:
        'In a synchronous design, the Order API calls the Invoice service, the Email service and the Inventory service over HTTP one after another. If the email service is down, the order fails; if it is slow, the customer waits. With a message broker the Order API saves the order, publishes an "OrderPlaced" message and returns immediately. Other services consume the message in their own time. Benefits: decoupling (the producer does not know who consumes), reliability (messages wait safely in the queue if a consumer is down), load levelling (a Big Billion Days sale spike is queued and processed at a steady rate), scaling (add more consumers to process faster - competing consumers) and async processing. Costs: more infrastructure, eventual consistency (data is not updated everywhere instantly), duplicate messages and harder debugging.',
      points: [
        'Producer (publisher) = sends messages; Consumer (subscriber) = receives and processes them',
        'Broker = the server in the middle: RabbitMQ, Azure Service Bus, Amazon SQS, Apache Kafka',
        'Queue = point-to-point work distribution (each message handled by ONE consumer)',
        'Publish/subscribe = one event delivered to MANY subscribers (each gets its own queue)',
        'Message = headers/properties + body (usually JSON bytes)',
      ],
    },
    {
      heading: 'RabbitMQ building blocks: exchanges, queues, bindings',
      content:
        'RabbitMQ implements AMQP 0-9-1. Producers never publish directly to a queue - they publish to an EXCHANGE with a ROUTING KEY. A BINDING is a rule linking an exchange to a queue (with a binding key). The exchange type decides how the routing key is matched. A QUEUE stores messages until a consumer takes them. Your app opens one TCP CONNECTION and creates lightweight CHANNELS inside it for publishing and consuming. A virtual host (vhost) is a separate namespace for exchanges and queues (like a database inside SQL Server). The default exchange ("") is a special direct exchange where every queue is automatically bound by its own name, so publishing with routingKey "orders" to exchange "" puts the message in the "orders" queue - that is why simple examples seem to publish "to a queue".',
      points: [
        'Direct exchange: delivers to queues whose binding key EQUALS the routing key (e.g. "upi", "card")',
        'Fanout exchange: copies the message to ALL bound queues, ignores the routing key (broadcast an event)',
        'Topic exchange: pattern match on dot-separated words; * = exactly one word, # = zero or more words ("payment.#", "*.error")',
        'Headers exchange: routes on message header values (rarely used)',
        'A message that matches no binding is dropped (or returned to the producer if mandatory: true)',
      ],
    },
    {
      heading: 'Acknowledgements, prefetch and redelivery',
      content:
        'With autoAck: true RabbitMQ deletes the message as soon as it is delivered - if the consumer crashes while processing, the message is lost. With manual acknowledgements (autoAck: false) the consumer calls BasicAckAsync after the work is done; until then the message is "unacked" and if the consumer\'s channel closes, RabbitMQ redelivers it to another consumer (with the Redelivered flag set). BasicNackAsync/BasicRejectAsync with requeue: true puts it back in the queue; requeue: false discards it or sends it to a dead-letter exchange. Prefetch (BasicQosAsync prefetchCount) limits how many unacked messages a consumer can hold, so work is spread fairly between consumers and a slow consumer is not flooded. Because of redelivery, delivery is "at least once" - consumers must be idempotent (processing the same message twice must not charge a customer twice).',
      syntax: `await channel.BasicQosAsync(0, prefetchCount: 10, global: false);
await channel.BasicConsumeAsync("orders", autoAck: false, consumer);
await channel.BasicAckAsync(ea.DeliveryTag, multiple: false);
await channel.BasicNackAsync(ea.DeliveryTag, multiple: false, requeue: false);`,
    },
    {
      heading: 'Durability: durable queues and persistent messages',
      content:
        'Three settings together make messages survive a broker restart: the exchange is durable, the queue is durable (durable: true when declaring) and each message is persistent (BasicProperties.Persistent = true, delivery mode 2). A durable queue with non-persistent messages keeps the queue but loses the messages. For stronger guarantees use publisher confirms (the broker confirms each message was safely stored; enabled on the channel in RabbitMQ.Client 7 with CreateChannelOptions) and quorum queues (x-queue-type: quorum), which replicate data across a RabbitMQ cluster and are the recommended queue type for production. Classic mirrored queues are removed in RabbitMQ 4.',
      points: [
        'durable = definition survives restart; persistent = message survives restart',
        'exclusive: true = queue used by one connection only and deleted when it closes (temporary reply queues)',
        'autoDelete: true = deleted when the last consumer unsubscribes',
        'Message TTL (x-message-ttl) and queue length limits (x-max-length) protect the broker',
      ],
    },
    {
      heading: 'Dead-letter queues and poison messages',
      content:
        'A poison message is one that can never be processed (invalid JSON, a negative amount, a missing customer). If you nack it with requeue: true it loops forever and blocks the queue. Instead, configure the queue with the argument x-dead-letter-exchange (and optionally x-dead-letter-routing-key). Messages rejected with requeue: false, messages whose TTL expires, and messages dropped because the queue is full are re-published to the dead-letter exchange, which routes them to a dead-letter queue (DLQ). Operations staff inspect the DLQ in the management UI, fix the cause and move messages back (the shovel plugin or a small tool). Separate permanent errors (dead-letter immediately) from transient errors (retry later, with a limit).',
      tip: 'Interview line: "Ack after processing, nack without requeue for poison messages so they go to the DLQ, make consumers idempotent because delivery is at-least-once."',
    },
  ],
  examples: [
    {
      title: 'Run RabbitMQ in Docker and explore the management UI',
      scenario:
        'Set up a local RabbitMQ broker for the team so everyone can develop messaging features without installing Erlang and RabbitMQ on Windows.',
      steps: [
        'Install and start Docker Desktop',
        'Run the docker run command below in PowerShell (or use the docker-compose.yml with docker compose up -d)',
        'Open http://localhost:15672 and log in with admin / admin123',
        'Explore the tabs: Overview (message rates), Connections, Channels, Exchanges (see amq.direct, amq.fanout, amq.topic), Queues',
        'Queues > Add a new queue "test" (Durable), open it, use "Publish message" and then "Get messages"',
      ],
      code: dockerCode,
      result: `PS> docker ps
CONTAINER ID  IMAGE                  PORTS                                              NAMES
3f2a91c0d1e4  rabbitmq:4-management  0.0.0.0:5672->5672/tcp, 0.0.0.0:15672->15672/tcp  rabbitmq
PS> docker exec rabbitmq rabbitmqctl list_queues name messages consumers
Timeout: 60.0 seconds ...
Listing queues for vhost / ...
name    messages    consumers
test    1           0`,
      explanation:
        'Port 5672 is the AMQP port used by .NET clients; 15672 is the web UI from the -management image. The named volume keeps queues and persistent messages when the container is recreated, and a fixed hostname keeps the node name stable so the data directory is reused. The default guest/guest user only works from localhost, which is why we set our own user.',
    },
    {
      title: 'Producer: publish persistent order messages with RabbitMQ.Client',
      scenario:
        'An e-commerce Order API must hand new orders to an invoicing system without calling it directly. Start with a console producer that publishes three OrderPlaced messages to a durable "orders" queue.',
      steps: [
        'dotnet new console -n OrderProducer, then dotnet add package RabbitMQ.Client',
        'Replace Program.cs with the code below',
        'Run with Ctrl+F5 (RabbitMQ container must be running)',
        'Open the management UI > Queues > orders: Ready = 3. Click "Get messages" (Ack mode: Nack requeue true) to see the JSON',
      ],
      code: producerCode,
      result: `Sent order 1001 (Asha Patil, Rs 1598)
Sent order 1002 (Ravi Kumar, Rs 249)
Sent order 1003 (Neha Shah, Rs 2499)
Management UI > Queues > orders: Ready 3, Unacked 0, Total 3
Get messages -> Payload: {"OrderId":1001,"Customer":"Asha Patil","Amount":1598}
                Properties: delivery_mode: 2, content_type: application/json, type: OrderPlaced`,
      explanation:
        'QueueDeclareAsync is safe to call every time; it only creates the queue if missing (but it fails if the queue exists with different settings). Publishing to the default exchange "" with routing key "orders" delivers to the queue named "orders". Persistent = true sets delivery_mode 2 so messages survive a broker restart because the queue is also durable. The connection and channel are disposed with await using. Nobody is consuming yet, so the messages wait in the queue - this is the decoupling benefit.',
    },
    {
      title: 'Consumer worker: manual acks, prefetch and a dead-letter queue',
      scenario:
        'An InvoiceWorker service consumes the orders queue, creates invoices, and must never lose a message if it crashes. Bad messages (amount <= 0) must not block the queue but go to a dead-letter queue for the support team.',
      steps: [
        'dotnet new worker -n InvoiceWorker, then dotnet add package RabbitMQ.Client',
        'Delete the existing "orders" queue in the UI (Queues > orders > Delete) because we now declare it with a dead-letter argument',
        'Add OrderConsumer.cs and register it with AddHostedService in Program.cs',
        'Run the worker, then run OrderProducer again; also publish {"OrderId":1004,"Customer":"Test","Amount":0} from the UI',
        'Start a SECOND instance of the worker (dotnet run in another terminal) and publish 20 messages: they are shared between both (competing consumers)',
      ],
      code: consumerCode,
      result: `info: OrderConsumer[0] Invoice created for order 1001
info: OrderConsumer[0] Invoice created for order 1002
info: OrderConsumer[0] Invoice created for order 1003
warn: OrderConsumer[0] Rejecting message: Bad amount for order 1004
Management UI: orders -> Ready 0, Unacked 0 | orders.dead -> Ready 1 (order 1004, header x-death: reason rejected)
Two workers running: worker A logs orders 2001, 2003, 2005...; worker B logs 2002, 2004, 2006...`,
      explanation:
        'Each message is acknowledged only after the invoice is created; if the worker is killed in the middle, the unacked message returns to the queue and is redelivered. The poison message is nacked with requeue: false, so RabbitMQ re-publishes it to orders.dlx, which routes it to orders.dead (with an x-death header describing why). prefetchCount 5 limits unacked messages per consumer. With two workers on one queue, RabbitMQ distributes messages round-robin - this is how you scale consumers horizontally.',
    },
    {
      title: 'Exchanges in code: topic, fanout and direct',
      scenario:
        'A college platform needs: logs routed by service and level (topic), a "student registered" event that three departments must all receive (fanout), and payments routed by method (direct).',
      steps: [
        'Create a console app ExchangesDemo with the RabbitMQ.Client package',
        'Paste the code and run it',
        'In the UI open Exchanges > logs.topic > Bindings, and Queues to count messages in each queue',
      ],
      code: exchangeCode,
      result: `Published payment.error
Published inventory.error
Published payment.upi.success
Queues after running:
  all-errors          2   (payment.error, inventory.error)
  payment-logs        2   (payment.error, payment.upi.success)
  everything          3
  send-welcome-email  1   create-library-card 1   notify-hostel 1
  upi-payments        1   (the "card" message matched no binding and was dropped)`,
      explanation:
        'The producer only knows the exchange name and a routing key; bindings decide the queues, so new consumers can be added without changing the producer. "*.error" matches exactly two words ending in error; "payment.#" matches anything starting with payment; "#" matches everything. The fanout exchange copies one registration event to three queues (publish/subscribe). The direct exchange needs an exact key match.',
    },
    {
      title: 'Console demo: how exchanges route messages (no broker needed)',
      scenario:
        'Simulate direct, fanout and topic routing rules in plain C#, including the * and # wildcards, to predict which queues receive each message.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it RoutingDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Add your own bindings (for example "order.*" on logs.topic) and predict the output before running',
      ],
      code: routingSimCode,
      csharp: { files: { 'Program.cs': routingSimCode }, stdin: '' },
      result: `orders.direct  key=order.created        -> invoice-queue
orders.direct  key=order.shipped        -> (no queue - message dropped)
notify.fanout  key=anything             -> email-queue, sms-queue
logs.topic     key=payment.error        -> all-errors, payment-logs, everything
logs.topic     key=inventory.error      -> all-errors, everything
logs.topic     key=payment.upi.success  -> payment-logs, everything
logs.topic     key=payment              -> payment-logs, everything`,
      explanation:
        'Direct: only the exact key "order.created" has a binding; "order.shipped" matches nothing and is dropped. Fanout ignores the key and copies to both queues. Topic: "*.error" needs exactly two words, so it matches payment.error and inventory.error but not payment.upi.success. "payment.#" matches "payment" itself too, because # can match zero words. "#" matches everything. {exchange,-14} and {routingKey,-20} left-align the text in fixed-width columns.',
    },
  ],
  interview: [
    { q: 'Why use a message broker instead of direct HTTP calls between services?', a: 'Decoupling (producer does not know consumers), resilience (messages wait if a consumer is down), load levelling during spikes, easy horizontal scaling with competing consumers and asynchronous processing so users do not wait.', level: 'Easy' },
    { q: 'What are exchanges, queues and bindings in RabbitMQ?', a: 'Producers publish to an exchange with a routing key. Bindings connect exchanges to queues with a binding key/pattern. Queues store messages until consumers receive them.', level: 'Easy' },
    { q: 'Explain direct, fanout and topic exchanges.', a: 'Direct routes to queues whose binding key equals the routing key. Fanout broadcasts to all bound queues ignoring the key. Topic matches dot-separated patterns where * is exactly one word and # is zero or more words.', level: 'Easy' },
    { q: 'What is the default exchange?', a: 'A nameless ("") direct exchange to which every queue is automatically bound using its queue name, so publishing with routing key "orders" delivers to the "orders" queue.', level: 'Medium' },
    { q: 'autoAck true vs false?', a: 'autoAck true removes the message as soon as it is delivered - lost if the consumer crashes. autoAck false (manual ack) keeps it until the consumer calls BasicAck after processing; unacked messages are redelivered if the consumer disconnects.', level: 'Easy' },
    { q: 'What do durable and persistent mean?', a: 'A durable queue/exchange definition survives a broker restart. A persistent message (delivery mode 2) is written to disk. You need both for messages to survive a restart.', level: 'Medium' },
    { q: 'What is prefetch (QoS)?', a: 'The maximum number of unacknowledged messages a consumer (channel) may have. It gives fair dispatch among consumers and prevents one consumer from being flooded. Typical values 10-100 depending on processing time.', level: 'Medium' },
    { q: 'Connection vs channel in RabbitMQ?', a: 'A connection is a TCP connection - expensive, create one per application and reuse it. A channel is a lightweight virtual connection multiplexed over it; use separate channels for concurrent publishing/consuming. Channels are not meant to be shared across threads for publishing.', level: 'Medium' },
    { q: 'What is a dead-letter queue and how do you configure it?', a: 'A queue that receives messages rejected without requeue, expired by TTL or dropped by length limits. Set x-dead-letter-exchange (and optionally x-dead-letter-routing-key) on the source queue and bind a DLQ to that exchange.', level: 'Medium' },
    { q: 'What delivery guarantee does RabbitMQ give with manual acks, and what does it mean for your code?', a: 'At-least-once: a message can be delivered more than once (e.g. consumer crashed after doing the work but before ack). Consumers must be idempotent, e.g. by storing processed message ids.', level: 'Hard' },
    { q: 'What happens if you nack a poison message with requeue: true?', a: 'It goes back to the queue and is redelivered immediately, failing again in an endless loop that wastes CPU and can block other messages. Use requeue: false with a DLQ, or a retry count header.', level: 'Hard' },
    { q: 'What are publisher confirms?', a: 'A mode where the broker acknowledges each published message once it has been safely handled (written to disk for persistent messages / replicated for quorum queues). The producer can retry on nack/timeout, avoiding silent message loss.', level: 'Hard' },
    { q: 'What are quorum queues?', a: 'Replicated durable queues based on the Raft consensus algorithm, the recommended queue type for data safety in RabbitMQ clusters (declared with x-queue-type: quorum). They replace classic mirrored queues, removed in RabbitMQ 4.', level: 'Hard' },
    { q: 'How do you scale consumers?', a: 'Run more consumer instances on the same queue (competing consumers). RabbitMQ distributes messages round-robin subject to prefetch. Ordering across consumers is not guaranteed.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a console producer that reads lines typed by the user ("upi 499", "card 1299", "cash 50") and publishes each amount to a direct exchange "payments.direct" with the method as routing key.',
      hint: 'Split the line, ExchangeDeclareAsync with ExchangeType.Direct, BasicPublishAsync(exchange, method, body).',
      solution: `var factory = new ConnectionFactory { HostName = "localhost", UserName = "admin", Password = "admin123" };
await using var conn = await factory.CreateConnectionAsync();
await using var ch = await conn.CreateChannelAsync();
await ch.ExchangeDeclareAsync("payments.direct", ExchangeType.Direct, durable: true);

string? line;
while (!string.IsNullOrWhiteSpace(line = Console.ReadLine()))
{
    var parts = line.Split(' ');
    await ch.BasicPublishAsync("payments.direct", parts[0], Encoding.UTF8.GetBytes(parts[1]));
    Console.WriteLine($"Published Rs {parts[1]} with key {parts[0]}");
}`,
    },
    {
      task: 'Write a consumer for the queue "upi-payments" that prints each amount, acknowledges it, and handles 3 unacked messages at most.',
      hint: 'BasicQosAsync(0, 3, false), AsyncEventingBasicConsumer, autoAck: false, BasicAckAsync.',
      solution: `await ch.QueueDeclareAsync("upi-payments", durable: true, exclusive: false, autoDelete: false);
await ch.QueueBindAsync("upi-payments", "payments.direct", "upi");
await ch.BasicQosAsync(0, 3, false);

var consumer = new AsyncEventingBasicConsumer(ch);
consumer.ReceivedAsync += async (_, ea) =>
{
    Console.WriteLine($"UPI payment Rs {Encoding.UTF8.GetString(ea.Body.ToArray())}");
    await ch.BasicAckAsync(ea.DeliveryTag, false);
};
await ch.BasicConsumeAsync("upi-payments", autoAck: false, consumer);
Console.ReadLine();`,
    },
    {
      task: 'Design topic bindings for a food-delivery app with routing keys "<city>.<service>.<event>" (e.g. pune.food.delivered, mumbai.grocery.cancelled). Give the binding keys for: (a) all Pune events, (b) all cancelled events in any city/service, (c) all food events, (d) everything.',
      hint: '* = exactly one word, # = zero or more words.',
      solution: `(a) pune.#            (or pune.*.*)
(b) *.*.cancelled
(c) *.food.*
(d) #`,
    },
    {
      task: 'Add a message TTL of 30 minutes and a maximum length of 10,000 messages to the "otp-sms" queue, with expired/overflow messages going to "otp-sms.dlx".',
      hint: 'Queue arguments: x-message-ttl (milliseconds), x-max-length, x-dead-letter-exchange.',
      solution: `await ch.ExchangeDeclareAsync("otp-sms.dlx", ExchangeType.Fanout, durable: true);
await ch.QueueDeclareAsync("otp-sms.dead", durable: true, exclusive: false, autoDelete: false);
await ch.QueueBindAsync("otp-sms.dead", "otp-sms.dlx", "");

await ch.QueueDeclareAsync("otp-sms", durable: true, exclusive: false, autoDelete: false,
    arguments: new Dictionary<string, object?>
    {
        ["x-message-ttl"] = 30 * 60 * 1000,
        ["x-max-length"] = 10000,
        ["x-dead-letter-exchange"] = "otp-sms.dlx"
    });`,
    },
    {
      task: 'In the RoutingDemo console program, append the binding ("logs.topic", "order-logs", "order.*") at the END of the bindings list and publish "order.created.v2" and "order.paid". Predict the two output lines.',
      hint: 'order.* needs exactly two words.',
      solution: `logs.topic     key=order.created.v2     -> everything
logs.topic     key=order.paid           -> everything, order-logs`,
    },
  ],
  quiz: [
    {
      question: 'Which exchange type delivers a copy of every message to all bound queues regardless of the routing key?',
      options: ['Direct', 'Topic', 'Fanout', 'Default'],
      answer: 2,
      explanation: 'Fanout broadcasts to all bound queues and ignores routing keys.',
    },
    {
      question: 'With binding key "*.error" on a topic exchange, which routing key matches?',
      options: ['payment.error', 'payment.upi.error', 'error', 'payment.errors'],
      answer: 0,
      explanation: '* matches exactly one word, so only two-word keys ending in "error" match.',
    },
    {
      question: 'A consumer with autoAck: false crashes after receiving a message but before calling BasicAckAsync. What happens?',
      options: ['The message is lost', 'RabbitMQ redelivers the message to a consumer', 'The message goes to the dead-letter queue automatically', 'The queue is deleted'],
      answer: 1,
      explanation: 'Unacked messages return to the queue when the channel/connection closes and are redelivered (Redelivered = true).',
    },
    {
      question: 'What is needed for messages to survive a RabbitMQ restart?',
      options: ['Only a durable queue', 'Only persistent messages', 'A durable queue AND persistent messages', 'autoAck: true'],
      answer: 2,
      explanation: 'The queue definition and the messages must both be stored on disk.',
    },
    {
      question: 'Which docker command starts RabbitMQ with the management UI on port 15672?',
      options: ['docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:4-management', 'docker run rabbitmq-ui', 'docker start rabbitmq --ui', 'docker run -p 15672 rabbitmq:alpine'],
      answer: 0,
      explanation: 'The -management image includes the UI plugin; map 5672 for AMQP and 15672 for the UI.',
    },
  ],
};
