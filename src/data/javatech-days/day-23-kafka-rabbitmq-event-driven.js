export default {
  id: 'day-23-kafka-rabbitmq-event-driven',
  title: 'Messaging with Apache Kafka and RabbitMQ: Event-Driven Microservices',
  module: 'Module 6: Microservices, Messaging & APIs',
  day: 23,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: 'Learn asynchronous communication between microservices. Understand Kafka topics, partitions, offsets, producers, consumers and consumer groups, use KafkaTemplate and @KafkaListener in Spring Boot, then build the same idea with RabbitMQ exchanges, queues and bindings, and design an event-driven order flow.',
  objectives: [
    'Explain synchronous vs asynchronous communication and when to use a message broker',
    'Describe Kafka topics, partitions, offsets, brokers, replication and consumer groups',
    'Produce and consume JSON events with KafkaTemplate and @KafkaListener, including error handling and dead-letter topics',
    'Use RabbitMQ direct, topic and fanout exchanges with RabbitTemplate and @RabbitListener',
    'Design an event-driven order flow (order-service -> inventory, notification) and compare Kafka vs RabbitMQ',
  ],
  theory: [
    {
      heading: '1. Synchronous vs Asynchronous Communication',
      content: 'With REST/Feign, order-service calls email-service and WAITS for the reply. If email-service is down, placing an order fails, even though email is not critical. With messaging, order-service just drops an "OrderPlaced" message into a broker and returns to the customer immediately. Email, inventory and analytics services read the message whenever they are ready. Analogy: a phone call (sync) vs a WhatsApp message (async) — the receiver does not need to be online at the moment you send.',
      points: [
        'Loose coupling: producer does not know who consumes the event',
        'Resilience: broker stores messages while a consumer is down; it catches up later',
        'Scalability: add more consumers to process faster; absorb traffic spikes (Big Billion Day sale)',
        'Cost: eventual consistency, duplicate messages, harder debugging; use REST when you need an immediate answer (e.g., "is this coupon valid?")',
      ],
    },
    {
      heading: '2. Apache Kafka Core Concepts',
      content: 'Kafka is a distributed commit log. A TOPIC (e.g., order-events) is like a named register book. A topic is split into PARTITIONS; each partition is an ordered, append-only list where every message gets a number called OFFSET (0, 1, 2 ...). Messages are NOT deleted when read; they are kept for a retention period (default 7 days), so new consumers can replay history. A BROKER is one Kafka server; a CLUSTER has many brokers. Each partition is REPLICATED (replication factor 3 = copies on 3 brokers), one is LEADER, others are followers.',
      points: [
        'Message = key + value + headers + timestamp. Same key always goes to the same partition, so order is guaranteed per key (e.g., all events of order 101 stay in order)',
        'Ordering is guaranteed only inside one partition, not across the whole topic',
        'Modern Kafka (3.3+) runs in KRaft mode without ZooKeeper; Kafka 4.0 removed ZooKeeper completely',
        'acks=all + idempotent producer (default in recent clients) gives no data loss and no producer-side duplicates',
      ],
      syntax: `Topic: order-events (3 partitions)
Partition 0: [0:order101-CREATED] [1:order104-CREATED] [2:order101-PAID]
Partition 1: [0:order102-CREATED] [1:order105-CREATED]
Partition 2: [0:order103-CREATED]
key=order101 -> hash(key) % 3 = 0 -> always partition 0`,
    },
    {
      heading: '3. Consumer Groups and Offsets',
      content: 'Consumers join a CONSUMER GROUP using a group id. Kafka divides partitions among members of a group: each partition is read by exactly ONE consumer in the group. Different groups each get ALL messages. So inventory-service (group "inventory") and email-service (group "email") both receive every order event, while 3 instances of inventory-service share the work. Each group stores its committed offset ("I have read up to offset 57 in partition 0") so after restart it continues from there.',
      points: [
        '3 partitions + 3 consumers in one group = each reads 1 partition (best parallelism)',
        '3 partitions + 5 consumers = 2 consumers sit idle; partitions limit parallelism',
        'Rebalance: when a consumer joins/leaves, partitions are reassigned',
        'auto-offset-reset=earliest: a NEW group starts from the beginning; latest: only new messages',
        'Delivery guarantee in practice: at-least-once, so consumers must be IDEMPOTENT (processing the same message twice gives same result)',
      ],
      tip: 'Common interview trap: "Will two consumers in the same group get the same message?" No. Different groups? Yes, both get it.',
    },
    {
      heading: '4. Kafka in Spring Boot',
      content: 'Add spring-kafka. Spring Boot auto-configures a ProducerFactory, KafkaTemplate, ConsumerFactory and listener container from spring.kafka.* properties. Send with kafkaTemplate.send(topic, key, value) — it returns a CompletableFuture<SendResult>. Receive with @KafkaListener(topics, groupId) on a bean method. For JSON, use JsonSerializer / JsonDeserializer and trust your packages. Failed messages can be retried and then sent to a dead-letter topic (DLT) with DefaultErrorHandler + DeadLetterPublishingRecoverer.',
      syntax: `kafkaTemplate.send("order-events", event.orderId().toString(), event);

@KafkaListener(topics = "order-events", groupId = "inventory")
public void onOrder(OrderEvent event) { ... }

@Bean NewTopic orderTopic() {
    return TopicBuilder.name("order-events").partitions(3).replicas(1).build();
}`,
    },
    {
      heading: '5. RabbitMQ: Exchanges, Queues and Bindings',
      content: 'RabbitMQ is a traditional message broker (AMQP protocol). A producer never sends directly to a queue; it sends to an EXCHANGE with a ROUTING KEY. The exchange uses BINDINGS (rules) to decide which QUEUE(s) get the message. A consumer reads from a queue and ACKs; after ack the message is removed. Analogy: the exchange is the post office sorting desk, the routing key is the PIN code, queues are the delivery bags.',
      points: [
        'Direct exchange: routing key must match binding key exactly (order.created -> order-queue)',
        'Topic exchange: patterns with * (one word) and # (zero or more words): order.* matches order.created, order.# matches order.payment.failed',
        'Fanout exchange: ignores routing key, copies to ALL bound queues (broadcast)',
        'Headers exchange: routes on message headers (rarely used)',
        'Dead letter exchange (DLX): rejected/expired messages go to a separate queue for investigation',
      ],
    },
    {
      heading: '6. Kafka vs RabbitMQ and Event-Driven Patterns',
      content: 'Both move messages, but their design is different. Kafka is a log: high throughput (millions/sec), keeps messages for replay, consumers pull and track offsets; ideal for event streaming, activity tracking, analytics, CDC. RabbitMQ is a smart router: flexible routing, per-message acks, priorities, delayed messages; ideal for task queues and command-style work (send this email, generate this PDF). In event-driven microservices, services publish facts ("OrderPlaced", "PaymentFailed") and others react. A Saga uses such events to manage a business transaction across services with compensating actions (if payment fails, release the reserved stock).',
      points: [
        'Outbox pattern: save the order AND the event in the same DB transaction (outbox table), then a relay publishes it — avoids "DB saved but message lost"',
        'Event naming: past tense (OrderPlaced), include an eventId for idempotency and a version for schema changes',
        'Choreography (services react to events) vs Orchestration (one coordinator tells each service what to do)',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Run Kafka (KRaft) and Kafka UI with Docker, Use CLI Tools',
      scenario: 'Start a single-node Kafka for development and try topics, producer and consumer from the command line.',
      steps: [
        'Install Docker Desktop and create a folder kafka-lab with the docker-compose.yml below',
        'Run docker compose up -d and wait ~20 seconds',
        'Create a topic with 3 partitions using kafka-topics.sh inside the container',
        'Open two terminals: one console consumer, one console producer; type messages',
        'Open http://localhost:8085 (Kafka UI) to see topics, partitions and messages graphically',
      ],
      code: `# ===== docker-compose.yml =====
services:
  kafka:
    image: apache/kafka:3.8.0
    container_name: kafka
    ports:
      - "9092:9092"
    environment:
      KAFKA_NODE_ID: 1
      KAFKA_PROCESS_ROLES: broker,controller
      KAFKA_LISTENERS: PLAINTEXT://:9092,CONTROLLER://:9093,INTERNAL://:29092
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://localhost:9092,INTERNAL://kafka:29092
      KAFKA_LISTENER_SECURITY_PROTOCOL_MAP: PLAINTEXT:PLAINTEXT,CONTROLLER:PLAINTEXT,INTERNAL:PLAINTEXT
      KAFKA_INTER_BROKER_LISTENER_NAME: INTERNAL
      KAFKA_CONTROLLER_LISTENER_NAMES: CONTROLLER
      KAFKA_CONTROLLER_QUORUM_VOTERS: 1@kafka:9093
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_REPLICATION_FACTOR: 1
      KAFKA_TRANSACTION_STATE_LOG_MIN_ISR: 1
      KAFKA_NUM_PARTITIONS: 3

  kafka-ui:
    image: provectuslabs/kafka-ui:latest
    ports:
      - "8085:8080"
    environment:
      KAFKA_CLUSTERS_0_NAME: local
      KAFKA_CLUSTERS_0_BOOTSTRAPSERVERS: kafka:29092
    depends_on:
      - kafka

# ===== Commands =====
docker compose up -d

docker exec -it kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \\
  --create --topic demo --partitions 3 --replication-factor 1

docker exec -it kafka /opt/kafka/bin/kafka-topics.sh --bootstrap-server localhost:9092 \\
  --describe --topic demo

# Terminal 1 - consumer in group g1
docker exec -it kafka /opt/kafka/bin/kafka-console-consumer.sh \\
  --bootstrap-server localhost:9092 --topic demo --group g1 --from-beginning

# Terminal 2 - producer with keys (key:value)
docker exec -it kafka /opt/kafka/bin/kafka-console-producer.sh \\
  --bootstrap-server localhost:9092 --topic demo \\
  --property parse.key=true --property key.separator=:
> order101:CREATED
> order102:CREATED
> order101:PAID

# Check lag of the group
docker exec -it kafka /opt/kafka/bin/kafka-consumer-groups.sh \\
  --bootstrap-server localhost:9092 --describe --group g1`,
      result: `Created topic demo.

Topic: demo  PartitionCount: 3  ReplicationFactor: 1
  Topic: demo  Partition: 0  Leader: 1  Replicas: 1  Isr: 1
  Topic: demo  Partition: 1  Leader: 1  Replicas: 1  Isr: 1
  Topic: demo  Partition: 2  Leader: 1  Replicas: 1  Isr: 1

Terminal 1 (consumer) prints:
CREATED
CREATED
PAID

GROUP  TOPIC  PARTITION  CURRENT-OFFSET  LOG-END-OFFSET  LAG  CONSUMER-ID ...
g1     demo   0          ...             ...             0    console-consumer-...
(which partition each key lands in depends on the key hash)`,
      explanation: 'KRaft mode means Kafka manages its own metadata; no ZooKeeper container is needed. Two listeners are used: localhost:9092 for apps on your laptop and kafka:29092 for other containers (Kafka UI). Both order101 messages land in the same partition, so CREATED is always read before PAID for that order. LAG 0 means the group has read everything.',
    },
    {
      title: 'Example 2: Spring Boot Producer and Consumer with JSON Events',
      scenario: 'order-service publishes OrderPlacedEvent; inventory-service (group inventory) and notification-service (group notification) both consume it.',
      steps: [
        'start.spring.io: create order-service with Spring Web + Spring for Apache Kafka; create inventory-service with Spring for Apache Kafka',
        'Put the OrderPlacedEvent record in both projects with the same package (or a shared library jar)',
        'Add the application.yml for producer and consumer',
        'Run Kafka from Example 1, then run both apps (IntelliJ: Services tool window lets you run many Spring Boot apps together; Eclipse STS: Boot Dashboard)',
        'POST http://localhost:8081/api/orders from Postman with JSON body',
      ],
      code: `<!-- pom.xml (both) -->
<dependency>
  <groupId>org.springframework.kafka</groupId>
  <artifactId>spring-kafka</artifactId>
</dependency>

// ===== shared: OrderPlacedEvent.java =====
package com.shop.events;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

public record OrderPlacedEvent(String eventId, Long orderId, String customerEmail,
                               List<Item> items, BigDecimal total, Instant occurredAt) {
    public record Item(String productId, int qty) {}
}

# ===== order-service application.yml =====
server:
  port: 8081
spring:
  kafka:
    bootstrap-servers: localhost:9092
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
      acks: all

// ===== order-service: KafkaTopicConfig.java =====
@Configuration
public class KafkaTopicConfig {
    @Bean
    public NewTopic orderEvents() {
        return TopicBuilder.name("order-events").partitions(3).replicas(1).build();
    }
}

// ===== order-service: OrderController.java =====
package com.shop.order;

import com.shop.events.OrderPlacedEvent;
import org.slf4j.*;
import org.springframework.http.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private static final Logger log = LoggerFactory.getLogger(OrderController.class);
    private final KafkaTemplate<String, OrderPlacedEvent> kafka;
    private final AtomicLong ids = new AtomicLong(100);

    public OrderController(KafkaTemplate<String, OrderPlacedEvent> kafka) { this.kafka = kafka; }

    public record OrderRequest(String email, List<OrderPlacedEvent.Item> items, BigDecimal total) {}

    @PostMapping
    public ResponseEntity<Map<String, Object>> place(@RequestBody OrderRequest req) {
        long orderId = ids.incrementAndGet();
        // 1. save order in DB (skipped here)
        var event = new OrderPlacedEvent(UUID.randomUUID().toString(), orderId,
                req.email(), req.items(), req.total(), Instant.now());
        kafka.send("order-events", String.valueOf(orderId), event)
             .whenComplete((res, ex) -> {
                 if (ex == null) {
                     log.info("Sent order {} to partition {} offset {}", orderId,
                         res.getRecordMetadata().partition(), res.getRecordMetadata().offset());
                 } else {
                     log.error("Failed to send order {}", orderId, ex);
                 }
             });
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(Map.of("orderId", orderId, "status", "PLACED"));
    }
}

# ===== inventory-service application.yml =====
server:
  port: 8083
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: inventory
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.springframework.kafka.support.serializer.JsonDeserializer
      properties:
        spring.json.trusted.packages: com.shop.events
        spring.json.value.default.type: com.shop.events.OrderPlacedEvent
        spring.json.use.type.headers: false

// ===== inventory-service: OrderEventsListener.java =====
package com.shop.inventory;

import com.shop.events.OrderPlacedEvent;
import org.slf4j.*;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.*;
import org.springframework.stereotype.Component;

@Component
public class OrderEventsListener {
    private static final Logger log = LoggerFactory.getLogger(OrderEventsListener.class);

    @KafkaListener(topics = "order-events", groupId = "inventory", concurrency = "3")
    public void onOrderPlaced(@Payload OrderPlacedEvent event,
                              @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
                              @Header(KafkaHeaders.OFFSET) long offset) {
        log.info("[inventory] order {} from p{}@{}", event.orderId(), partition, offset);
        event.items().forEach(i ->
            log.info("[inventory] reserve {} x {}", i.qty(), i.productId()));
    }
}

// notification-service: same listener with groupId = "notification"
// that logs "Email sent to ..." instead.

// Postman body:
// {"email":"ravi@example.com","items":[{"productId":"P100","qty":2}],"total":998.00}`,
      result: `HTTP 202 Accepted
{"orderId":101,"status":"PLACED"}

order-service log:
INFO  Sent order 101 to partition 2 offset 0

inventory-service log:
INFO  [inventory] order 101 from p2@0
INFO  [inventory] reserve 2 x P100

notification-service log:
INFO  [notification] Email sent to ravi@example.com for order 101
(partition number depends on the key hash)`,
      explanation: 'The controller returns 202 immediately; Kafka delivery happens asynchronously and whenComplete logs the partition and offset. Because inventory and notification use different group ids, BOTH receive the event. concurrency = "3" starts 3 consumer threads, one per partition. spring.json.use.type.headers=false plus default.type lets the consumer deserialize even if the producer class lives in another package.',
    },
    {
      title: 'Example 3: Retry and Dead-Letter Topic for Poison Messages',
      scenario: 'If an event has qty <= 0, processing throws an exception. We want 2 retries, then send the message to order-events.DLT instead of blocking the partition forever.',
      steps: [
        'Add the KafkaErrorConfig class to inventory-service',
        'Add validation in the listener that throws IllegalArgumentException for bad quantity',
        'Send an order with qty 0 from Postman',
        'Check logs and see the message in topic order-events.DLT in Kafka UI',
      ],
      code: `// KafkaErrorConfig.java (inventory-service)
package com.shop.inventory;

import org.springframework.context.annotation.*;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.*;
import org.springframework.util.backoff.FixedBackOff;

@Configuration
public class KafkaErrorConfig {
    @Bean
    public DefaultErrorHandler errorHandler(KafkaTemplate<Object, Object> template) {
        var recoverer = new DeadLetterPublishingRecoverer(template);   // -> <topic>.DLT, same partition
        var handler = new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 2)); // 2 retries, 1s apart
        handler.addNotRetryableExceptions(NullPointerException.class);
        return handler;
    }
}
// Spring Boot automatically plugs a single DefaultErrorHandler bean into the listener container factory.

# inventory-service application.yml additions: the DLT publisher needs a producer
spring:
  kafka:
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer

// Listener change
@KafkaListener(topics = "order-events", groupId = "inventory")
public void onOrderPlaced(OrderPlacedEvent event) {
    for (var i : event.items()) {
        if (i.qty() <= 0) {
            throw new IllegalArgumentException("Invalid qty for " + i.productId());
        }
    }
    log.info("[inventory] order {} reserved", event.orderId());
}

// Optional: read the DLT for alerts
@KafkaListener(topics = "order-events.DLT", groupId = "inventory-dlt")
public void dlt(OrderPlacedEvent event,
                @Header(KafkaHeaders.DLT_EXCEPTION_MESSAGE) String error) {
    log.error("[DLT] order {} failed: {}", event.orderId(), error);
}`,
      result: `WARN  ... Listener failed; ... IllegalArgumentException: Invalid qty for P100   (attempt 1)
WARN  ... (attempt 2 after 1s)
WARN  ... (attempt 3 after 1s)
ERROR [DLT] order 102 failed: Listener method ... threw exception; Invalid qty for P100

Kafka UI -> Topics -> order-events.DLT -> Messages: 1 message with headers
kafka_dlt-exception-message, kafka_dlt-original-topic=order-events, kafka_dlt-original-offset=...`,
      explanation: 'Without an error handler a "poison" message would be retried again and again and the partition would be stuck. FixedBackOff(1000, 2) means 1 original attempt + 2 retries. Then DeadLetterPublishingRecoverer copies the record to order-events.DLT with diagnostic headers, and the consumer commits the offset and moves on. In real projects the DLT is monitored and messages are fixed and replayed.',
    },
    {
      title: 'Example 4: RabbitMQ Topic Exchange with Spring AMQP',
      scenario: 'Route order.created to both email and inventory queues, and order.cancelled only to inventory, using a topic exchange.',
      steps: [
        'Run RabbitMQ with the management UI: docker run -d --name rabbit -p 5672:5672 -p 15672:15672 rabbitmq:3.13-management',
        'Open http://localhost:15672 (user guest / password guest)',
        'start.spring.io: Spring Web + Spring for RabbitMQ; add the config, producer and listeners below',
        'Call POST /api/rabbit/created/101 and POST /api/rabbit/cancelled/101 from Postman',
        'In the management UI, open Exchanges > shop.orders > Bindings to see the routing rules',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-amqp</artifactId>
</dependency>

# application.yml
spring:
  rabbitmq:
    host: localhost
    port: 5672
    username: guest
    password: guest

// RabbitConfig.java
package com.shop.rabbit;

import org.springframework.amqp.core.*;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.*;

@Configuration
public class RabbitConfig {
    public static final String EXCHANGE = "shop.orders";

    @Bean TopicExchange ordersExchange() { return new TopicExchange(EXCHANGE); }

    @Bean Queue emailQueue()     { return QueueBuilder.durable("email.queue").build(); }
    @Bean Queue inventoryQueue() { return QueueBuilder.durable("inventory.queue").build(); }

    @Bean Binding emailBinding() {
        return BindingBuilder.bind(emailQueue()).to(ordersExchange()).with("order.created");
    }
    @Bean Binding inventoryBinding() {
        return BindingBuilder.bind(inventoryQueue()).to(ordersExchange()).with("order.*");
    }

    @Bean MessageConverter jsonConverter() { return new Jackson2JsonMessageConverter(); }
}

// OrderMessage.java
public record OrderMessage(Long orderId, String status) {}

// RabbitProducerController.java
@RestController
@RequestMapping("/api/rabbit")
public class RabbitProducerController {
    private final RabbitTemplate rabbit;
    public RabbitProducerController(RabbitTemplate rabbit) { this.rabbit = rabbit; }

    @PostMapping("/{status}/{id}")
    public String publish(@PathVariable String status, @PathVariable Long id) {
        String routingKey = "order." + status;            // order.created / order.cancelled
        rabbit.convertAndSend(RabbitConfig.EXCHANGE, routingKey, new OrderMessage(id, status));
        return "Published " + routingKey;
    }
}

// Listeners.java
@Component
public class Listeners {
    private static final Logger log = LoggerFactory.getLogger(Listeners.class);

    @RabbitListener(queues = "email.queue")
    public void email(OrderMessage m) {
        log.info("[email] order {} {}", m.orderId(), m.status());
    }

    @RabbitListener(queues = "inventory.queue")
    public void inventory(OrderMessage m) {
        log.info("[inventory] order {} {}", m.orderId(), m.status());
    }
}`,
      result: `POST /api/rabbit/created/101    -> Published order.created
  [email] order 101 created
  [inventory] order 101 created

POST /api/rabbit/cancelled/101  -> Published order.cancelled
  [inventory] order 101 cancelled
  (email.queue does not receive it: its binding key is exactly order.created)`,
      explanation: 'Spring Boot auto-declares the exchange, queues and bindings defined as beans when the app connects. The topic exchange compares the routing key with each binding pattern: order.* matches both keys, order.created matches only one. The Jackson2JsonMessageConverter bean is picked automatically by RabbitTemplate and listeners, so records travel as JSON. The order of the two log lines for the first call can vary because two listener threads run in parallel.',
    },
  ],
  interview: [
    { q: 'What is Apache Kafka?', a: 'A distributed, fault-tolerant event streaming platform that stores records in partitioned, replicated, append-only topics (commit log). Producers write, consumers pull and track offsets; data is retained for a configured time so it can be replayed.', level: 'Easy' },
    { q: 'What is a partition and why does Kafka use partitions?', a: 'A partition is an ordered, immutable sequence of records inside a topic. Partitions allow parallelism (each consumer in a group reads different partitions) and scaling across brokers. Order is guaranteed only within a partition.', level: 'Easy' },
    { q: 'What is an offset?', a: 'A sequential id of a record within a partition. Consumer groups commit offsets to the internal __consumer_offsets topic to remember how far they have read.', level: 'Easy' },
    { q: 'Explain consumer groups.', a: 'Consumers with the same group.id share partitions of a topic; each partition goes to exactly one member. Different groups receive all messages independently. More consumers than partitions leaves some idle.', level: 'Medium' },
    { q: 'How do you guarantee ordering for all events of one order?', a: 'Use the orderId as the message key. The default partitioner hashes the key, so all events of that order go to the same partition and are consumed in order.', level: 'Medium' },
    { q: 'What delivery semantics does Kafka provide?', a: 'At-most-once (commit before processing), at-least-once (commit after processing, the common default) and exactly-once (idempotent producer + transactions, read-process-write within Kafka). Consumers with external side effects should be idempotent.', level: 'Hard' },
    { q: 'What is a dead-letter topic/queue?', a: 'A separate topic/queue where messages that keep failing after retries are sent, so they do not block processing. In Spring Kafka use DefaultErrorHandler with DeadLetterPublishingRecoverer; in RabbitMQ configure a dead-letter exchange.', level: 'Medium' },
    { q: 'Explain RabbitMQ exchange types.', a: 'Direct (exact routing key match), Topic (pattern match with * and #), Fanout (broadcast to all bound queues), Headers (match on header values). Producers publish to exchanges; bindings connect exchanges to queues.', level: 'Medium' },
    { q: 'Kafka vs RabbitMQ — how do you choose?', a: 'Kafka: high-throughput event streaming, retention and replay, many independent consumer groups, ordering per partition. RabbitMQ: complex routing, per-message ack and removal, priorities/TTL, work queues and RPC style. Many companies use both.', level: 'Medium' },
    { q: 'What is the Outbox pattern?', a: 'To avoid the dual-write problem (DB commit succeeds but message publish fails), the service writes the business row and an event row into an outbox table in the same local transaction; a separate relay (poller or Debezium CDC) publishes outbox rows to the broker.', level: 'Hard' },
    { q: 'What is the Saga pattern?', a: 'A way to manage a business transaction spanning multiple services as a sequence of local transactions, each publishing an event; if a step fails, compensating transactions undo previous steps (e.g., cancel order, release stock). Can be choreography or orchestration based.', level: 'Hard' },
    { q: 'What does KafkaTemplate.send() return and why is it important?', a: 'A CompletableFuture<SendResult<K,V>>. Sending is asynchronous; you should attach whenComplete to log failures or call get() (blocking) when you must be sure the message was written before continuing.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a topic "payment-events" with 6 partitions programmatically and write a producer endpoint that sends a PaymentEvent with key = paymentId, blocking until Kafka confirms.',
      hint: 'TopicBuilder bean; kafkaTemplate.send(...).get(5, TimeUnit.SECONDS).',
      solution: `public record PaymentEvent(String paymentId, Long orderId, String status) {}

@Configuration
public class PaymentTopicConfig {
    @Bean
    public NewTopic paymentEvents() {
        return TopicBuilder.name("payment-events").partitions(6).replicas(1).build();
    }
}

@RestController
@RequestMapping("/api/payments")
public class PaymentController {
    private final KafkaTemplate<String, PaymentEvent> kafka;
    public PaymentController(KafkaTemplate<String, PaymentEvent> kafka) { this.kafka = kafka; }

    @PostMapping("/{orderId}/success")
    public String success(@PathVariable Long orderId) throws Exception {
        var event = new PaymentEvent(UUID.randomUUID().toString(), orderId, "SUCCESS");
        SendResult<String, PaymentEvent> r =
            kafka.send("payment-events", event.paymentId(), event).get(5, TimeUnit.SECONDS);
        return "Stored at partition " + r.getRecordMetadata().partition()
             + " offset " + r.getRecordMetadata().offset();
    }
}`,
    },
    {
      task: 'Make a Kafka consumer idempotent: if the same eventId arrives twice, process it only once.',
      hint: 'Store processed eventIds in a table with a unique constraint.',
      solution: `@Entity
@Table(name = "processed_events")
public class ProcessedEvent {
    @Id
    private String eventId;
    private Instant processedAt = Instant.now();
    protected ProcessedEvent() {}
    public ProcessedEvent(String eventId) { this.eventId = eventId; }
}

public interface ProcessedEventRepository extends JpaRepository<ProcessedEvent, String> {}

@Component
public class IdempotentInventoryListener {
    private final ProcessedEventRepository processed;
    private final StockService stock;

    public IdempotentInventoryListener(ProcessedEventRepository processed, StockService stock) {
        this.processed = processed; this.stock = stock;
    }

    @KafkaListener(topics = "order-events", groupId = "inventory")
    @Transactional
    public void on(OrderPlacedEvent e) {
        if (processed.existsById(e.eventId())) {
            return;                               // duplicate: ignore
        }
        e.items().forEach(i -> stock.reserve(i.productId(), i.qty()));
        processed.save(new ProcessedEvent(e.eventId()));   // same DB transaction
    }
}`,
    },
    {
      task: 'Using RabbitMQ, create a fanout exchange "notifications" that broadcasts to sms.queue and push.queue, plus listeners for both.',
      hint: 'FanoutExchange; BindingBuilder.bind(q).to(fanout) has no .with().',
      solution: `@Configuration
public class FanoutConfig {
    @Bean FanoutExchange notifications() { return new FanoutExchange("notifications"); }
    @Bean Queue smsQueue()  { return new Queue("sms.queue", true); }
    @Bean Queue pushQueue() { return new Queue("push.queue", true); }
    @Bean Binding smsBind()  { return BindingBuilder.bind(smsQueue()).to(notifications()); }
    @Bean Binding pushBind() { return BindingBuilder.bind(pushQueue()).to(notifications()); }
}

@Component
public class NotifyListeners {
    @RabbitListener(queues = "sms.queue")
    public void sms(String msg)  { System.out.println("SMS: " + msg); }

    @RabbitListener(queues = "push.queue")
    public void push(String msg) { System.out.println("PUSH: " + msg); }
}

// producer
rabbitTemplate.convertAndSend("notifications", "", "Your order 101 is shipped");
// Output (order may vary):
// SMS: Your order 101 is shipped
// PUSH: Your order 101 is shipped`,
    },
    {
      task: 'Configure a RabbitMQ queue with a dead-letter exchange so that messages rejected by the listener go to "orders.dlq".',
      hint: 'x-dead-letter-exchange argument on the main queue; throw AmqpRejectAndDontRequeueException.',
      solution: `@Configuration
public class DlqConfig {
    @Bean DirectExchange ordersDlx() { return new DirectExchange("orders.dlx"); }
    @Bean Queue ordersDlq() { return QueueBuilder.durable("orders.dlq").build(); }
    @Bean Binding dlqBinding() {
        return BindingBuilder.bind(ordersDlq()).to(ordersDlx()).with("orders.dead");
    }

    @Bean Queue ordersQueue() {
        return QueueBuilder.durable("orders.queue")
                .withArgument("x-dead-letter-exchange", "orders.dlx")
                .withArgument("x-dead-letter-routing-key", "orders.dead")
                .build();
    }
}

@Component
public class OrdersListener {
    @RabbitListener(queues = "orders.queue")
    public void handle(OrderMessage m) {
        if (m.orderId() == null) {
            throw new AmqpRejectAndDontRequeueException("orderId missing");
        }
        System.out.println("Processed " + m.orderId());
    }
}
// Rejected messages now appear in orders.dlq (see management UI > Queues).`,
    },
    {
      task: 'Design (write the event list and flow) for a choreography Saga: order -> payment -> inventory -> shipping, including compensation when inventory is not available.',
      hint: 'Each service listens to the previous event and publishes the next one; failure events trigger undo.',
      solution: `Topics/events:
1. order-service      : saves order (PENDING)          -> publishes OrderCreated
2. payment-service    : on OrderCreated, charge card   -> PaymentCompleted | PaymentFailed
3. inventory-service  : on PaymentCompleted, reserve   -> StockReserved | StockUnavailable
4. shipping-service   : on StockReserved, create AWB   -> ShipmentCreated
5. order-service      : on ShipmentCreated             -> order status CONFIRMED

Compensation:
- PaymentFailed     -> order-service sets order CANCELLED
- StockUnavailable  -> payment-service refunds (publishes PaymentRefunded)
                    -> order-service sets order CANCELLED and notifies customer

Rules:
- every event has eventId, orderId (as Kafka key), occurredAt, version
- each consumer is idempotent (processed_events table)
- each service publishes via the Outbox table to avoid lost events`,
    },
  ],
  quiz: [
    {
      question: 'In Kafka, message ordering is guaranteed:',
      options: ['Across the whole topic', 'Within a single partition', 'Across all topics in a cluster', 'Never'],
      answer: 1,
      explanation: 'Order is maintained per partition; use the same key to keep related messages together.',
    },
    {
      question: 'A topic has 4 partitions and a consumer group has 6 consumers. How many consumers are idle?',
      options: ['0', '4', '2', '6'],
      answer: 2,
      explanation: 'Each partition goes to one consumer in the group, so only 4 are active and 2 are idle.',
    },
    {
      question: 'Which annotation consumes Kafka messages in Spring?',
      options: ['@RabbitListener', '@JmsListener', '@EventListener', '@KafkaListener'],
      answer: 3,
      explanation: '@KafkaListener(topics=..., groupId=...) on a bean method.',
    },
    {
      question: 'Which RabbitMQ exchange sends a copy to every bound queue ignoring the routing key?',
      options: ['Fanout', 'Direct', 'Topic', 'Headers'],
      answer: 0,
      explanation: 'Fanout exchange is a broadcast.',
    },
    {
      question: 'With a topic exchange, which routing key matches the binding pattern "order.#"?',
      options: ['payment.order', 'orders.created', 'order.payment.failed', 'None of these'],
      answer: 2,
      explanation: '# matches zero or more words, so order.payment.failed matches. "orders" is a different word.',
    },
  ],
};
