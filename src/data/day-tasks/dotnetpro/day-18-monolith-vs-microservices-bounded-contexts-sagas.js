export default {
  lesson: 'day-18-monolith-vs-microservices-bounded-contexts-sagas',
  minutes: 25,
  intro: 'Decide when microservices make sense, draw boundaries with bounded contexts, choose sync or async communication, and trace sagas, compensations and idempotent consumers.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'A team of **4 developers** is building a new college ERP. Requirements change every week and traffic is about 200 users a day. What is the best architecture to start with?',
      options: [
        '12 microservices on Kubernetes with RabbitMQ',
        'A modular monolith with clear module boundaries (separate projects and DbContexts)',
        'One microservice per database table',
        'A shared-database set of services so joins still work',
      ],
      answer: 1,
      explain: 'A small team with an unclear, changing domain gets almost none of the benefits of microservices and pays all the costs (network failures, many pipelines, distributed data). A **modular monolith** keeps clean boundaries and can be split later. One service per table and a shared database are classic anti-patterns.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which are signs of a **distributed monolith** (services that are split but still tightly coupled)? Select all that apply.',
      options: [
        'Orders service runs SQL joins directly on the Catalog database tables',
        'Every release requires deploying 5 services together in a fixed order',
        'Notification service consumes OrderPlaced events from a queue',
        'Checkout makes a chain of 6 synchronous HTTP calls before it can respond',
        'Each service has its own database and CI/CD pipeline',
      ],
      answers: [0, 1, 3],
      explain: 'Shared tables, lock-step deployments and long synchronous call chains couple services together, so you pay for microservices without independence. Consuming events and having a database plus pipeline per service are signs of **healthy** microservices.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This orchestrator remembers each completed step\'s compensation on a `Stack`. **ScheduleDelivery** fails. Write the exact output.',
      example: { title: 'Stack is last in, first out', code: 'var s = new Stack<string>();\ns.Push("A"); s.Push("B");\nConsole.WriteLine(s.Pop());   // B' },
      code: `var done = new Stack<string>();
string[] steps = { "CreateOrder", "ReserveStock", "ChargePayment", "ScheduleDelivery" };
string[] undo  = { "CancelOrder", "ReleaseStock", "RefundPayment", "CancelDelivery" };
string failAt = "ScheduleDelivery";

for (int i = 0; i < steps.Length; i++)
{
    if (steps[i] == failAt)
    {
        Console.WriteLine($"{steps[i]} FAILED");
        while (done.Count > 0) Console.WriteLine($"undo {done.Pop()}");
        break;
    }
    Console.WriteLine($"{steps[i]} OK");
    done.Push(undo[i]);
}`,
      expected: `CreateOrder OK
ReserveStock OK
ChargePayment OK
ScheduleDelivery FAILED
undo RefundPayment
undo ReleaseStock
undo CancelOrder`,
      explain: 'Three steps succeed and push CancelOrder, ReleaseStock, RefundPayment. When delivery fails, Pop() returns them in **reverse** order, which is how a saga undoes work: the most recent step first. CancelDelivery is never run because that step never succeeded. A common mistake is to undo in the original order.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The broker delivers messages **at least once**, so duplicates arrive. The Inventory consumer is idempotent. Write the exact output.',
      example: { title: 'HashSet.Add returns false for duplicates', code: 'var seen = new HashSet<string>();\nConsole.WriteLine(seen.Add("x"));  // True\nConsole.WriteLine(seen.Add("x"));  // False' },
      code: `var processed = new HashSet<string>();
int stock = 10;
string[] messages = { "ORD-1:3", "ORD-2:2", "ORD-1:3", "ORD-3:1", "ORD-2:2" };

foreach (var m in messages)
{
    var parts = m.Split(':');
    if (!processed.Add(parts[0]))
    {
        Console.WriteLine($"skip {parts[0]}");
        continue;
    }
    stock -= int.Parse(parts[1]);
}
Console.WriteLine($"stock = {stock}");`,
      expected: `skip ORD-1
skip ORD-2
stock = 4`,
      explain: 'Only the first ORD-1 (3), ORD-2 (2) and ORD-3 (1) reduce stock: 10 - 3 - 2 - 1 = 4. The repeated ORD-1 and ORD-2 are skipped because their ids are already in the set. Without the check, stock would wrongly become -1. In production the processed ids live in the consumer\'s database (an inbox table).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Saving an order and publishing `OrderPlaced` are two operations, and a crash between them loses the event. The fix is to save the order **and** an event row in the same local transaction, and let a background relay publish the rows later. What is this pattern called? (one word) The ______ pattern.',
      example: { title: 'Hint', text: 'The table is often named OutboxMessages.' },
      accept: ['outbox', 'transactional outbox', 'the outbox'],
      explain: 'The **transactional outbox** pattern makes "save data" and "record the event" atomic. The relay retries until the broker accepts the message, so publishing is at-least-once and consumers must be idempotent. Its partner on the consumer side is the inbox (processed-message table).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which message is an **event** (not a command)?',
      options: ['ChargePayment', 'ReserveStock', 'OrderPlaced', 'SendInvoiceEmail'],
      answer: 2,
      explain: 'Events describe something that **already happened** (past tense) and are published to any number of subscribers who may react. Commands are imperative requests to one specific receiver, which may reject them. Naming messages correctly makes the design clearer.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The Ordering service needs the product name to show on the order page, but products live in the Catalog service\'s own database. Which approach respects **database per service**?',
      options: [
        'Give Ordering a read-only login to the Catalog database and join the tables',
        'Move both tables into one shared database',
        'Copy the product name into the order when it is placed (or keep a local read model updated from Catalog events)',
        'Store all product data in the Angular front end',
      ],
      answer: 2,
      explain: 'Each service owns its data. Ordering can store a snapshot (name and price at order time, which is also correct for business reasons) or keep a small read model fed by ProductUpdated events, or call Catalog\'s API. Reading another service\'s tables couples the services through the schema.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In one saga style there is **no central coordinator**: each service listens to events and publishes its own (OrderPlaced -> StockReserved -> PaymentCompleted). What is this style called?',
      example: { title: 'The other style', text: 'With a central coordinator that sends commands, it is called orchestration.' },
      accept: ['choreography', 'choreography saga', 'choreographed', 'choreographed saga'],
      explain: '**Choreography** is very loosely coupled but the overall flow is spread across services and hard to follow when there are many steps. **Orchestration** puts the flow in one place (a saga state machine), which is easier to monitor and change.',
    },
  ],
};
