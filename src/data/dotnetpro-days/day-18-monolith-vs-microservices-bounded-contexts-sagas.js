const sagaCode = `using System;
using System.Collections.Generic;

Console.WriteLine("=== Order 1001: all steps succeed ===");
RunSaga(1001, failAt: null);
Console.WriteLine();
Console.WriteLine("=== Order 1002: payment fails ===");
RunSaga(1002, failAt: "ChargePayment");

// Orchestrated saga: each step has a matching compensating action
void RunSaga(int orderId, string? failAt)
{
    var steps = new List<(string Name, string Compensation)>
    {
        ("CreateOrder", "CancelOrder"),          // Ordering service
        ("ReserveStock", "ReleaseStock"),        // Inventory service
        ("ChargePayment", "RefundPayment"),      // Payment service
        ("ScheduleDelivery", "CancelDelivery")   // Shipping service
    };

    var done = new Stack<string>();              // compensations run in REVERSE order
    foreach (var (name, compensation) in steps)
    {
        if (name == failAt)
        {
            Console.WriteLine($"  {name} FAILED");
            while (done.Count > 0)
                Console.WriteLine($"  compensate: {done.Pop()}");
            Console.WriteLine($"Order {orderId} status: Cancelled");
            return;
        }
        Console.WriteLine($"  {name} OK");
        done.Push(compensation);
    }
    Console.WriteLine($"Order {orderId} status: Confirmed");
}
`;

const contextsCode = `using System;

// The SAME real-world customer, modelled differently in each bounded context.
var sale = new Sales.Customer(42, "Asha Patil", "Gold", 15000);
var parcel = new Shipping.Customer(42, "Asha Patil", "Flat 12, MG Road", "Pune", "411001");
var ticket = new Support.Customer(42, "Asha Patil", 2);

Console.WriteLine($"Sales    -> {sale.Name}, tier {sale.LoyaltyTier}, credit limit {sale.CreditLimit}");
Console.WriteLine($"Shipping -> {parcel.Name}, ship to {parcel.AddressLine}, {parcel.City} {parcel.Pincode}");
Console.WriteLine($"Support  -> {ticket.Name}, open tickets {ticket.OpenTickets}");
Console.WriteLine($"Same id {sale.Id} links them; each service stores only what it needs.");

namespace Sales
{
    public record Customer(int Id, string Name, string LoyaltyTier, int CreditLimit);
}

namespace Shipping
{
    public record Customer(int Id, string Name, string AddressLine, string City, string Pincode);
}

namespace Support
{
    public record Customer(int Id, string Name, int OpenTickets);
}
`;

const outboxCode = `using System;
using System.Collections.Generic;

// Order service database: orders table + outbox table (same database)
var orders = new List<string>();
var outbox = new Queue<string>();

// Inventory service database: its OWN stock table
var stock = new Dictionary<string, int> { ["MOUSE"] = 10, ["KEYBOARD"] = 5 };
var processed = new HashSet<string>();      // for idempotent consumers

PlaceOrder("ORD-1", "MOUSE", 2);
PlaceOrder("ORD-2", "KEYBOARD", 1);
outbox.Enqueue("ORD-1|MOUSE|2");            // broker delivers ORD-1 a second time
Console.WriteLine("Broker redelivered ORD-1 (at-least-once delivery)");
Console.WriteLine($"Before relay: MOUSE={stock["MOUSE"]}, KEYBOARD={stock["KEYBOARD"]}, outbox={outbox.Count}");

// Background relay publishes outbox rows; Inventory consumes the events
while (outbox.Count > 0)
{
    string evt = outbox.Dequeue();
    string[] parts = evt.Split('|');
    if (!processed.Add(parts[0]))
    {
        Console.WriteLine($"Inventory skipped duplicate {parts[0]}");
        continue;
    }
    stock[parts[1]] -= int.Parse(parts[2]);
    Console.WriteLine($"Inventory handled {parts[0]}: {parts[1]} -{parts[2]}");
}
Console.WriteLine($"After relay:  MOUSE={stock["MOUSE"]}, KEYBOARD={stock["KEYBOARD"]}, outbox={outbox.Count}");

void PlaceOrder(string id, string sku, int qty)
{
    // ONE local transaction: save the order AND the event together
    orders.Add(id);
    outbox.Enqueue($"{id}|{sku}|{qty}");
    Console.WriteLine($"Order service saved {id} and OrderPlaced event");
}
`;

const commsCode = `// ===== Ordering.Api/Program.cs : SYNCHRONOUS call to Catalog (HTTP) =====
builder.Services.AddHttpClient<CatalogClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["Services:Catalog"]!));   // e.g. http://catalog-api

public class CatalogClient(HttpClient http)
{
    public async Task<ProductDto?> GetProductAsync(int id) =>
        await http.GetFromJsonAsync<ProductDto>($"/api/products/{id}");
}

public record ProductDto(int Id, string Name, decimal Price, int Stock);

// Inside the endpoint: the order cannot be priced without Catalog -> caller WAITS
app.MapPost("/api/orders", async (CreateOrderDto dto, CatalogClient catalog,
                                  OrderingDb db, IPublishEndpoint bus) =>
{
    var product = await catalog.GetProductAsync(dto.ProductId);       // sync HTTP
    if (product is null) return Results.BadRequest("Unknown product");

    var order = new Order { ProductId = product.Id, Qty = dto.Qty,
                            Total = product.Price * dto.Qty, Status = "Pending" };
    db.Orders.Add(order);
    await db.SaveChangesAsync();

    // ASYNCHRONOUS: tell the world what happened, do not wait for anyone
    await bus.Publish(new OrderPlaced(order.Id, product.Id, dto.Qty, order.Total));
    return Results.Accepted($"/api/orders/{order.Id}", new { order.Id, order.Status });
});

public record OrderPlaced(int OrderId, int ProductId, int Qty, decimal Total);

// ===== Ordering.Api/Program.cs : MassTransit + RabbitMQ registration =====
// dotnet add package MassTransit.RabbitMQ
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((ctx, cfg) =>
    {
        cfg.Host("rabbitmq", "/", h => { h.Username("guest"); h.Password("guest"); });
        cfg.ConfigureEndpoints(ctx);
    });
});

// ===== Notification.Api : a CONSUMER in another service =====
public class OrderPlacedConsumer(ILogger<OrderPlacedConsumer> log) : IConsumer<OrderPlaced>
{
    public Task Consume(ConsumeContext<OrderPlaced> context)
    {
        log.LogInformation("Send SMS for order {OrderId}, amount {Total}",
            context.Message.OrderId, context.Message.Total);
        return Task.CompletedTask;
    }
}
// builder.Services.AddMassTransit(x => { x.AddConsumer<OrderPlacedConsumer>(); x.UsingRabbitMq(...); });

// ===== docker-compose.yml (excerpt) =====
// services:
//   rabbitmq:
//     image: rabbitmq:3-management     # UI at http://localhost:15672 (guest/guest)
//     ports: ["5672:5672", "15672:15672"]
//   catalog-api:   { build: ./Catalog.Api }
//   ordering-api:  { build: ./Ordering.Api, environment: { Services__Catalog: "http://catalog-api:8080" } }
//   notification-api: { build: ./Notification.Api }`;

export default {
  id: 'day-18-monolith-vs-microservices-bounded-contexts-sagas',
  title: 'Monolith vs Microservices: Bounded Contexts, Database per Service, Sync vs Async Communication and Sagas',
  module: 'Module 5: Microservices with .NET',
  day: 18,
  level: 'Advanced',
  duration: '2.5 hours',
  summary:
    'Understand what microservices really are, how to split a system using bounded contexts, why each service owns its own database, when to call another service over HTTP/gRPC and when to publish an event, and how to keep data consistent across services with sagas, the outbox pattern and eventual consistency. Also learn when a modular monolith is the better choice.',
  objectives: [
    'Compare a monolith, a modular monolith and microservices with real trade-offs',
    'Split a domain into bounded contexts and explain database per service',
    'Choose between synchronous (HTTP/gRPC) and asynchronous (events, message broker) communication',
    'Keep data consistent across services with sagas (orchestration and choreography), compensation, the outbox pattern and idempotent consumers',
    'Explain clearly when NOT to use microservices',
  ],
  theory: [
    {
      heading: 'Monolith, modular monolith and microservices',
      content:
        'A **monolith** is one application that is built, tested and deployed as a single unit. An online shop like a small Flipkart clone would have one ASP.NET Core project with controllers for products, orders, payments and users, all sharing one SQL Server database. This is simple: one repository, one deployment, one debugger session, and a database transaction can update orders and stock together.\n\nProblems appear when the app and the team grow. 60 developers push to the same code base, one small change in payments needs a full redeploy of everything, the whole app must scale even if only search is busy, and a memory leak in reports can crash checkout.\n\n**Microservices** split the system into small, independently deployable services, each owning one business capability (Catalog, Ordering, Payment, Shipping, Notification). Each service has its own code, its own database and its own deployment pipeline, and is usually owned by one small team. Services talk over the network using HTTP, gRPC or messages.\n\nA **modular monolith** sits in between: one deployable app, but the code is split into strongly separated modules (separate projects, separate DbContexts or schemas, communication only through public interfaces). It gives most of the design benefits without the network and operations cost, and it can be split into microservices later.',
      points: [
        'Monolith: simple to build, test, deploy and debug; hard to scale teams and parts independently',
        'Microservices: independent deployment and scaling, technology freedom, fault isolation; but network failures, distributed data and complex operations',
        'Modular monolith: clear module boundaries inside one deployment, the recommended starting point for most new systems',
        'Microservices are an organisational choice as much as a technical one (Conway\'s law: systems mirror team structure)',
      ],
      tip: 'In interviews never say "microservices are always better". Say "it depends on team size, scale and domain complexity", then list the trade-offs. That answer shows real experience.',
    },
    {
      heading: 'Bounded contexts: where to draw the service boundaries',
      content:
        'The hardest part of microservices is deciding the boundaries. Domain-Driven Design (DDD) gives us the **bounded context**: a boundary inside which a model and its words have one clear meaning.\n\nTake the word **Customer** in an e-commerce company. For Sales, a customer has a loyalty tier and a credit limit. For Shipping, a customer is a name, address and pincode. For Support, a customer is a list of open tickets. Trying to build one giant Customer class for everyone creates a huge, fragile model that every team fights over. Instead, each bounded context keeps its own small Customer model, and they are linked by an id.\n\nGood services usually follow business capabilities (Catalog, Ordering, Payment), not technical layers (a "DatabaseService" or a "ValidationService" is a bad split). A good boundary has **high cohesion** (things that change together live together) and **low coupling** (a change in one service rarely forces a change in another).',
      points: [
        'Ubiquitous language: developers and business people use the same words inside a context',
        'One bounded context usually maps to one microservice (sometimes one context = a few services)',
        'Context map: documents how contexts relate (upstream/downstream, shared ids, anti-corruption layer)',
        'Anti-corruption layer: a translator that keeps another system\'s model from leaking into yours',
        'Bad sign: two services that must always be deployed together, a "distributed monolith"',
      ],
    },
    {
      heading: 'Database per service',
      content:
        'Each microservice owns its data and is the **only** one allowed to read or write its tables. Ordering has OrderingDb, Catalog has CatalogDb, Payment has PaymentDb. They can even use different technologies (SQL Server for orders, Redis for the cart, Elasticsearch for search). This is called **polyglot persistence**.\n\nWhy so strict? If Ordering runs SQL joins directly against Catalog\'s tables, Catalog can no longer change its schema without breaking Ordering. The services are then coupled through the database and cannot be deployed independently.\n\nThe cost: no more cross-service joins and no more single ACID transaction across services. If Ordering needs product names, it either calls Catalog\'s API, or keeps a small local copy (a read model) that is updated from Catalog\'s ProductPriceChanged events.',
      points: [
        'Options: separate database server, separate database, or separate schema with separate logins (minimum)',
        'Data needed by others is shared through APIs or events, never through shared tables',
        'Local read models (data duplication) are normal and accepted in microservices',
        'Reports across services use a separate reporting database or data warehouse fed by events',
      ],
      tip: 'A shared database between "microservices" is the most common anti-pattern seen in Indian service companies. Call it out in design discussions.',
    },
    {
      heading: 'Synchronous vs asynchronous communication',
      content:
        '**Synchronous** (request/response): the caller sends a request and waits for the reply. In .NET this is HTTP with HttpClient (REST/JSON) or gRPC (binary Protobuf over HTTP/2, faster, ideal for internal service-to-service calls). Use it when you need the answer right now, for example "what is the current price of product 7?" while placing an order.\n\nThe danger is **temporal coupling**: if Catalog is down or slow, Ordering is down or slow too. A chain of five sync calls multiplies the failure chance and the latency.\n\n**Asynchronous** (messaging/events): the sender publishes a message to a broker (RabbitMQ, Azure Service Bus, Kafka) and continues without waiting. Ordering publishes **OrderPlaced**; Inventory, Payment, Notification and Analytics each consume it in their own time. If Notification is down for 10 minutes, its messages wait in the queue and are processed when it comes back.\n\nCommands vs events: a **command** ("ChargePayment") is sent to one specific receiver and asks it to do something. An **event** ("OrderPlaced") is a fact about the past, published to anyone interested; the publisher does not know who listens.',
      points: [
        'Sync HTTP/gRPC: simple, immediate answer, but temporal coupling and cascading failures',
        'Async events: loose coupling, absorbs load spikes, failures are isolated; but eventual consistency and harder debugging',
        '.NET tools: HttpClient/IHttpClientFactory, Grpc.Net.Client, MassTransit or NServiceBus on RabbitMQ / Azure Service Bus, Confluent.Kafka',
        'Rule of thumb: queries can be sync; state changes that others react to should be events',
      ],
    },
    {
      heading: 'Data consistency: sagas, outbox and eventual consistency',
      content:
        'Placing an order touches Ordering, Inventory, Payment and Shipping, each with its own database. We cannot use one database transaction across them (distributed transactions with two-phase commit are slow, fragile and not supported by most brokers and cloud databases). Instead we use a **saga**: a sequence of local transactions, one per service. If a step fails, the saga runs **compensating actions** that undo the earlier steps (ReleaseStock, RefundPayment, CancelOrder). Compensations are business undo operations, not database rollbacks.\n\nTwo styles:\n- **Orchestration**: a central orchestrator (an OrderSaga state machine, for example with MassTransit) tells each service what to do and decides the next step. Easy to follow and monitor.\n- **Choreography**: no central brain; each service reacts to events and publishes its own (OrderPlaced -> StockReserved -> PaymentCompleted). Very loosely coupled, but the flow is hard to see when there are many steps.\n\n**Eventual consistency**: for a short time, services may disagree (order is Confirmed but stock not yet reduced). Given time and no new updates, all of them become consistent. The UI must handle this, for example showing "Order received, confirming..." instead of "Done".\n\n**Outbox pattern**: saving the order and publishing the event are two operations; if the app crashes between them, the event is lost. The fix: in the same local transaction, save the order AND an OutboxMessage row. A background relay reads the outbox table and publishes to the broker, retrying until it succeeds. Since the relay may publish a message twice, consumers must be **idempotent** (store processed message ids and ignore duplicates).',
      points: [
        'Saga = series of local transactions + compensating actions',
        'Orchestration (central coordinator) vs choreography (services react to each other\'s events)',
        'Outbox: save data + event in one transaction, publish later; MassTransit and NServiceBus have built-in outbox support',
        'Brokers give at-least-once delivery, so handlers must be idempotent',
        'CAP theorem: during a network partition you choose consistency or availability; most microservices choose availability + eventual consistency',
      ],
    },
    {
      heading: 'When NOT to use microservices',
      content:
        'Microservices solve **scaling of teams and parts**, but they add real costs: network latency, partial failures, distributed tracing, many pipelines, many databases, versioning of contracts, container orchestration (Kubernetes), and on-call for all of it.\n\nAvoid them when:\n- the team is small (fewer than about 10-15 developers) or it is a startup still finding product-market fit,\n- the domain is not well understood yet (wrong boundaries are very expensive to fix across services),\n- the app has low traffic and a single database handles it easily,\n- strong immediate consistency is required everywhere (for example a core banking ledger),\n- you do not have DevOps maturity: CI/CD, containers, monitoring, centralised logging.\n\nThe usual sensible path: start with a **well-structured modular monolith**, measure, and extract a service only when there is a clear reason (a module needs independent scaling, a separate team, or a different release cycle). This is called the **strangler fig** approach when you gradually replace parts of an old monolith.',
      tip: 'Famous examples: Amazon Prime Video moved one monitoring workload from serverless microservices back to a monolith and cut cost by about 90 percent. Use stories like this to show balanced thinking.',
    },
  ],
  examples: [
    {
      title: 'Orchestrated saga with compensating actions',
      scenario:
        'An e-commerce order goes through four services. Simulate the saga orchestrator: run each step, remember its compensation, and when payment fails, undo the completed steps in reverse order.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it SagaDemo (.NET 8 or later)',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
        'Change failAt to "ScheduleDelivery" and predict the output before running again',
      ],
      code: sagaCode,
      csharp: { files: { 'Program.cs': sagaCode }, stdin: '' },
      result: `=== Order 1001: all steps succeed ===
  CreateOrder OK
  ReserveStock OK
  ChargePayment OK
  ScheduleDelivery OK
Order 1001 status: Confirmed

=== Order 1002: payment fails ===
  CreateOrder OK
  ReserveStock OK
  ChargePayment FAILED
  compensate: ReleaseStock
  compensate: CancelOrder
Order 1002 status: Cancelled`,
      explanation:
        'After each successful step its compensation is pushed on a Stack. When ChargePayment fails, the stack holds ReleaseStock (top) and CancelOrder, so Pop() undoes the most recent step first, exactly like a real saga. RefundPayment is not run because the payment never succeeded. In production the orchestrator is a persisted state machine (MassTransit saga or Azure Durable Functions), so it survives restarts, and each step is a message to another service.',
    },
    {
      title: 'One customer, three bounded contexts',
      scenario:
        'Sales, Shipping and Support all talk about "Customer" but need different data. Model each context with its own small record in its own namespace, linked only by the customer id.',
      steps: [
        'Create a Console App named BoundedContexts',
        'Paste the code: top-level statements first, then the three namespaces',
        'Press Ctrl+F5',
        'Notice that Shipping.Customer has no credit limit and Sales.Customer has no pincode',
      ],
      code: contextsCode,
      csharp: { files: { 'Program.cs': contextsCode }, stdin: '' },
      result: `Sales    -> Asha Patil, tier Gold, credit limit 15000
Shipping -> Asha Patil, ship to Flat 12, MG Road, Pune 411001
Support  -> Asha Patil, open tickets 2
Same id 42 links them; each service stores only what it needs.`,
      explanation:
        'Each namespace stands for a bounded context (in real life a separate service with its own database). The models are small and change independently: adding a pincode validation in Shipping never touches Sales. Only the id (42) is shared. This is the opposite of one huge Customer table that every module edits.',
    },
    {
      title: 'Outbox pattern, eventual consistency and an idempotent consumer',
      scenario:
        'The Order service must save an order and publish OrderPlaced reliably. The Inventory service owns stock in its own database and must not reduce stock twice when the broker redelivers a message.',
      steps: [
        'Create a Console App named OutboxDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Look at the "Before relay" line: orders exist but stock has not changed yet (eventual consistency)',
        'Remove the processed.Add check and run again: MOUSE becomes 6, a real double-deduction bug',
      ],
      code: outboxCode,
      csharp: { files: { 'Program.cs': outboxCode }, stdin: '' },
      result: `Order service saved ORD-1 and OrderPlaced event
Order service saved ORD-2 and OrderPlaced event
Broker redelivered ORD-1 (at-least-once delivery)
Before relay: MOUSE=10, KEYBOARD=5, outbox=3
Inventory handled ORD-1: MOUSE -2
Inventory handled ORD-2: KEYBOARD -1
Inventory skipped duplicate ORD-1
After relay:  MOUSE=8, KEYBOARD=4, outbox=0`,
      explanation:
        'PlaceOrder writes the order and the event together (in a real app: one SaveChangesAsync with Orders and OutboxMessages in the same DbContext). Between "Before relay" and "After relay" the two services disagree: that window is eventual consistency. HashSet.Add returns false for an id already seen, so the duplicate ORD-1 is skipped and stock is reduced only once. In production the processed ids are stored in the consumer\'s database (an Inbox table).',
    },
    {
      title: 'Sync HTTP call plus async event with MassTransit and RabbitMQ',
      scenario:
        'Ordering needs the product price right now (sync call to Catalog), but Notification only needs to know that an order was placed (async event). Wire both in ASP.NET Core.',
      steps: [
        'Create three Web API projects: Catalog.Api, Ordering.Api, Notification.Api (File > New > Project > ASP.NET Core Web API)',
        'In Ordering.Api and Notification.Api run: dotnet add package MassTransit.RabbitMQ',
        'Start RabbitMQ: docker run -d -p 5672:5672 -p 15672:15672 rabbitmq:3-management',
        'Add the code below, set Services:Catalog in appsettings.json to the Catalog URL, and start all three projects (Solution > Properties > Multiple startup projects)',
        'POST /api/orders from Swagger with {"productId": 7, "qty": 2} and watch the Notification console log',
      ],
      code: commsCode,
      result: `POST /api/orders  {"productId":7,"qty":2}
-> 202 Accepted  { "id": 15, "status": "Pending" }

Notification.Api console:
info: OrderPlacedConsumer[0]
      Send SMS for order 15, amount 1998.00

RabbitMQ UI (http://localhost:15672) > Exchanges shows an exchange named after the OrderPlaced message type.`,
      explanation:
        'GetFromJsonAsync is a synchronous dependency: if Catalog is down, the POST fails, so in real code it needs a timeout and retry (Day 21). bus.Publish does not wait for the Notification service; MassTransit creates an exchange per message type and a queue per consumer. If Notification is stopped, the message waits in its queue. Returning 202 Accepted tells the client that processing continues in the background.',
    },
  ],
  interview: [
    { q: 'What is a microservice?', a: 'A small, independently deployable service that owns one business capability and its own data, communicates over the network (HTTP, gRPC or messages) and is usually owned by one small team.', level: 'Easy' },
    { q: 'Monolith vs microservices: give three advantages and three disadvantages of microservices.', a: 'Advantages: independent deployment, independent scaling, fault isolation (plus technology freedom and team autonomy). Disadvantages: network latency and partial failures, distributed data consistency, much higher operational complexity (monitoring, tracing, many pipelines, Kubernetes).', level: 'Easy' },
    { q: 'What is a modular monolith and why is it often recommended first?', a: 'One deployable application split into strongly isolated modules (separate projects, own DbContext/schema, communication only through public interfaces or in-process events). You get clean boundaries without network cost, and a module can later be extracted into a microservice when there is a real need.', level: 'Medium' },
    { q: 'What is a bounded context?', a: 'A DDD term for a boundary within which a domain model and its terms have one consistent meaning. "Customer" in Sales (credit limit, tier) differs from "Customer" in Shipping (address). Each context keeps its own model; contexts are linked by ids and integrate through APIs or events.', level: 'Medium' },
    { q: 'Why should each microservice have its own database?', a: 'So that a service can change its schema and deploy independently. A shared database couples services through tables: one schema change can break others, and you get a distributed monolith. Data needed by others is exposed via APIs or events.', level: 'Easy' },
    { q: 'How do you show a report that needs data from Orders and Customers when they are in different databases?', a: 'Do not join across service databases. Options: API composition (a BFF or gateway calls both and merges), or better for reports, build a read model / reporting database (CQRS) updated from events published by both services.', level: 'Medium' },
    { q: 'When do you choose synchronous HTTP/gRPC and when asynchronous messaging?', a: 'Use sync when the caller needs the answer immediately to continue (price lookup, validation). Use async events when other services only need to react to something that happened (order placed -> email, analytics, stock). Async reduces temporal coupling and absorbs spikes; sync is simpler but spreads failures.', level: 'Medium' },
    { q: 'Difference between a command and an event?', a: 'A command asks one specific receiver to do something and may be rejected (ChargePayment). An event states a fact that already happened (OrderPlaced), is published to any number of subscribers, and the publisher does not know who consumes it. Commands are named in imperative, events in past tense.', level: 'Medium' },
    { q: 'What is a saga? Orchestration vs choreography?', a: 'A saga keeps data consistent across services using a sequence of local transactions, each with a compensating action to undo it if a later step fails. Orchestration uses a central coordinator that sends commands and tracks state (easy to understand and monitor). Choreography has services reacting to each other\'s events with no coordinator (loosely coupled, but the overall flow is hard to see and debug).', level: 'Hard' },
    { q: 'Why not use a distributed transaction (2PC) across services?', a: 'Two-phase commit locks resources across services while waiting for all participants, so it is slow and reduces availability; if the coordinator fails, participants stay blocked. Most brokers, NoSQL stores and cloud databases do not support it. Sagas with compensation are the standard alternative.', level: 'Hard' },
    { q: 'Explain the outbox pattern.', a: 'Saving data and publishing a message are two separate operations; a crash between them loses the event (or publishes an event for data that was rolled back). With the outbox, the service saves the business data and an OutboxMessage row in the SAME local transaction. A background process publishes outbox rows to the broker and marks them sent, retrying on failure. This gives at-least-once publishing, so consumers must be idempotent.', level: 'Hard' },
    { q: 'What is an idempotent consumer and how do you implement one?', a: 'A handler that produces the same result even if the same message is processed more than once. Implement it by storing processed message ids (an Inbox table with a unique key) in the same transaction as the business change, and skipping ids already present; or by designing naturally idempotent operations (set status = Paid instead of balance -= 100).', level: 'Hard' },
    { q: 'What is eventual consistency? How do you handle it in the UI?', a: 'After an update, services may briefly show different data, but they converge if no new updates arrive. The UI shows intermediate states ("Order received, payment pending"), uses polling or SignalR to refresh status, and avoids promising final results immediately.', level: 'Medium' },
    { q: 'What is a distributed monolith?', a: 'A system split into services that are still tightly coupled: shared database, chains of synchronous calls, or services that must be deployed together. It has all the costs of microservices and none of the benefits.', level: 'Medium' },
    { q: 'When would you NOT use microservices?', a: 'Small team, early-stage product, unclear domain boundaries, low traffic, need for strong consistency everywhere, or no DevOps maturity (CI/CD, containers, centralised logging, tracing). In those cases a modular monolith is cheaper and faster to deliver.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Identify bounded contexts for a food delivery app like Swiggy. List at least 5 services, the main data each owns, and one event each publishes.',
      hint: 'Think in business capabilities: who owns menus, orders, payments, delivery partners, notifications?',
      solution: `Restaurant/Catalog : restaurants, menus, prices        -> MenuItemPriceChanged
Ordering           : orders, order items, order status  -> OrderPlaced, OrderCancelled
Payment            : payments, refunds, UPI references   -> PaymentCompleted, PaymentFailed
Delivery           : delivery partners, assignments, live location -> DeliveryAssigned, OrderDelivered
Notification       : templates, sent SMS/push log        -> (mostly consumes events)
Customer/Identity  : users, addresses, login             -> CustomerRegistered

Each owns its own database. Ordering keeps a copy of the menu price at order time
(it must not change if the restaurant updates the price later).`,
    },
    {
      task: 'Extend the saga console example so that ScheduleDelivery can fail. Print the compensations and confirm that RefundPayment, ReleaseStock and CancelOrder run in that order.',
      hint: 'Only change the argument: RunSaga(1003, failAt: "ScheduleDelivery").',
      solution: `RunSaga(1003, failAt: "ScheduleDelivery");

// Output:
//   CreateOrder OK
//   ReserveStock OK
//   ChargePayment OK
//   ScheduleDelivery FAILED
//   compensate: RefundPayment
//   compensate: ReleaseStock
//   compensate: CancelOrder
// Order 1003 status: Cancelled`,
    },
    {
      task: 'Write an EF Core entity and the code to save an Order and an OutboxMessage in one transaction.',
      hint: 'Both DbSets live in the same OrderingDbContext, so one SaveChangesAsync is one transaction.',
      solution: `public class OutboxMessage
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string Type { get; set; } = "";
    public string Payload { get; set; } = "";
    public DateTime OccurredUtc { get; set; } = DateTime.UtcNow;
    public DateTime? ProcessedUtc { get; set; }
}

// in OrderingDbContext: public DbSet<OutboxMessage> OutboxMessages => Set<OutboxMessage>();

var order = new Order { CustomerId = 42, Total = 1998m, Status = "Pending" };
db.Orders.Add(order);
db.OutboxMessages.Add(new OutboxMessage
{
    Type = nameof(OrderPlaced),
    Payload = JsonSerializer.Serialize(new OrderPlaced(order.Id, 7, 2, 1998m))
});
await db.SaveChangesAsync();   // both rows or neither

// A BackgroundService reads rows where ProcessedUtc == null,
// publishes them with IPublishEndpoint and sets ProcessedUtc.`,
    },
    {
      task: 'For each case choose sync or async and justify: (a) check stock before showing "Add to cart" (b) send order confirmation email (c) update analytics dashboard (d) validate a coupon during checkout.',
      hint: 'Does the caller need the answer to continue?',
      solution: `(a) Sync (HTTP/gRPC) - the page needs the stock number now, or keep a local read model.
(b) Async - publish OrderPlaced; email can be sent seconds later and retried.
(c) Async - analytics consumes events; it must never slow down checkout.
(d) Sync - checkout cannot continue without knowing if the coupon is valid.`,
    },
    {
      task: 'Write a short note (5-6 lines) for your team lead arguing for a modular monolith for a new college ERP built by 4 developers.',
      hint: 'Mention team size, deployment, transactions, cost and a future path.',
      solution: `With 4 developers, microservices would add a broker, many databases, many pipelines and
distributed tracing before we deliver features. A modular monolith (Admissions, Fees, Exams,
Attendance as separate projects with their own DbContext) gives clean boundaries, one deployment,
simple debugging and real database transactions for fee payments. If Exams later needs separate
scaling during results week, we can extract it as a service because its boundary is already clean.`,
    },
  ],
  quiz: [
    {
      question: 'Which statement about database per service is correct?',
      options: [
        'Services may join each other\'s tables if they are on the same server',
        'Only the owning service reads and writes its data; others use its API or events',
        'All services must use SQL Server',
        'It means every table goes into a separate database',
      ],
      answer: 1,
      explanation: 'Data ownership is the core rule. Shared tables couple services. Different services may use different storage technologies.',
    },
    {
      question: 'In a saga, what happens when the third step fails?',
      options: [
        'The database rolls back all services automatically',
        'Nothing; the order stays half finished',
        'Compensating actions undo the completed steps, usually in reverse order',
        'The saga retries step one',
      ],
      answer: 2,
      explanation: 'There is no global transaction. Each completed local transaction is undone by a business compensation (ReleaseStock, CancelOrder).',
    },
    {
      question: 'Which communication fits "send an SMS after an order is placed"?',
      options: [
        'Publish an OrderPlaced event to a message broker',
        'A synchronous gRPC call inside the checkout request',
        'A shared database table both services edit',
        'A distributed 2PC transaction',
      ],
      answer: 0,
      explanation: 'The SMS does not need to finish before checkout returns. An event decouples the services and the message waits if Notification is down.',
    },
    {
      question: 'Why must message consumers be idempotent?',
      options: [
        'Because events are encrypted',
        'Because brokers and the outbox give at-least-once delivery, so duplicates can arrive',
        'Because consumers run on the UI thread',
        'Because HTTP is stateless',
      ],
      answer: 1,
      explanation: 'Retries and redelivery mean the same message may be handled twice. Idempotency prevents double charging or double stock deduction.',
    },
    {
      question: 'Which situation is the strongest reason to stay with a (modular) monolith?',
      options: [
        'Search traffic is 50 times higher than checkout traffic',
        'Ten teams want to release independently every day',
        'One module needs Python for machine learning',
        'A team of 4 is building a new product with unclear requirements',
      ],
      answer: 3,
      explanation: 'Small teams and unclear domains are classic reasons to avoid microservices. The other options are typical reasons to extract services.',
    },
  ],
};
