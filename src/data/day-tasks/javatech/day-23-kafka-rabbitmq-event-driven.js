export default {
  lesson: 'day-23-kafka-rabbitmq-event-driven',
  minutes: 24,
  intro: 'Reason about Kafka partitions and consumer groups, write a listener, route RabbitMQ messages and choose between the two.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'After an order is placed, the order-service publishes an `OrderPlaced` event instead of calling inventory, email and analytics services directly. What is the main benefit?',
      options: [
        'The order is saved faster in MySQL',
        'Loose coupling: order-service does not wait for or even know the consumers; slow or down consumers do not break ordering',
        'Messages can never be lost',
        'No need for a database',
      ],
      answer: 1,
      explain: 'Asynchronous events decouple services: the producer publishes and moves on; consumers process at their own pace and new consumers can be added without changing the producer. The trade-off is eventual consistency and more moving parts.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Topic `orders` has **3 partitions**. Group `inventory` has 2 consumers, group `email` has 1 consumer and group `analytics` has 4 consumers. One message is produced. Type two lines: (1) how many consumers in total process this message, (2) how many consumers in `analytics` are idle (get no partition).',
      example: { title: 'the rules', text: 'Inside one group each partition is assigned to only ONE consumer. Every group gets its own copy of every message.' },
      code: 'orders (P0, P1, P2)\n inventory: c1, c2\n email:     c1\n analytics: c1, c2, c3, c4',
      expected: '3\n1',
      explain: 'Each **group** receives the message once, and inside a group only one consumer handles it → 3 consumers in total (one per group). With 3 partitions at most 3 consumers of a group can be busy, so the 4th analytics consumer is **idle**. More partitions = more parallelism.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'All events of order 501 (created, paid, shipped) must be processed **in order**. What do you do when sending?',
      options: [
        'Send them to different topics',
        'Use the order id as the message key, so all events of that order go to the same partition',
        'Use a random key',
        'Kafka always keeps order across all partitions',
      ],
      answer: 1,
      explain: 'Kafka guarantees order **only within a partition**. Messages with the same key hash to the same partition: `kafkaTemplate.send("orders", orderId, event)`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the annotation so this method consumes the `orders` topic as part of consumer group `inventory`:\n```\n???\npublic void onOrder(OrderEvent event) { ... }\n```',
      example: { title: 'sending', code: 'kafkaTemplate.send("orders", event.orderId(), event);' },
      accept: ['@KafkaListener(topics = "orders", groupId = "inventory")', '@KafkaListener(groupId = "inventory", topics = "orders")', '@KafkaListener(topics = {"orders"}, groupId = "inventory")'],
      explain: '`@KafkaListener(topics = "orders", groupId = "inventory")`. All instances of inventory-service share the group, so each message is processed once by one instance; offsets are committed so a restart continues where it stopped.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'RabbitMQ **topic exchange** with these bindings. For each routing key, type the queues that receive the message (in the order q1, q2, q3, separated by spaces), one line per key.',
      example: { title: 'wildcards', text: '* matches exactly ONE word; # matches ZERO or more words. Words are separated by dots.' },
      code: `bindings:
  q1  <-  "order.*"
  q2  <-  "order.#"
  q3  <-  "*.cancelled"

routing keys:
  1. order.created
  2. order.payment.failed
  3. order.cancelled`,
      expected: 'q1 q2\nq2\nq1 q2 q3',
      explain: '"order.created": `order.*` (one word after order) and `order.#` match. "order.payment.failed" has two words after order, so only `#` matches. "order.cancelled" matches all three, including `*.cancelled`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements comparing **Kafka** and **RabbitMQ** are TRUE? (choose all that apply)',
      options: [
        'Kafka keeps messages in a log for a retention period, so consumers can replay old events',
        'RabbitMQ routes messages through exchanges to queues and removes them once acknowledged',
        'Kafka is a good fit for high-volume event streams (clicks, logs, order events)',
        'RabbitMQ cannot be used from Spring Boot',
        'RabbitMQ is great for task queues with flexible routing (direct, topic, fanout)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Kafka = distributed **log** (replay, huge throughput). RabbitMQ = message **broker** with smart routing and per-message acks. Spring supports both (`spring-kafka`, `spring-boot-starter-amqp` with `@RabbitListener`).',
    },
  ],
};
