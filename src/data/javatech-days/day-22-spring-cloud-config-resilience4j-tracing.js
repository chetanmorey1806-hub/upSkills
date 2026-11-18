export default {
  id: 'day-22-spring-cloud-config-resilience4j-tracing',
  title: 'Spring Cloud Advanced: Config Server, Resilience4j and Distributed Tracing',
  module: 'Module 6: Microservices, Messaging & APIs',
  day: 22,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Make microservices production-ready: keep all configuration in one Git-backed Config Server, protect service-to-service calls with Resilience4j (circuit breaker, retry, rate limiter, time limiter), and follow one request across many services with Micrometer Tracing and Zipkin, plus the idea of centralized logging.',
  objectives: [
    'Build a Spring Cloud Config Server backed by a Git repository and connect client services with spring.config.import',
    'Refresh configuration at runtime with @RefreshScope and the /actuator/refresh endpoint',
    'Protect remote calls using Resilience4j @CircuitBreaker, @Retry, @RateLimiter and fallback methods',
    'Add Micrometer Tracing + Zipkin so every log line carries traceId and spanId',
    'Explain centralized logging (ELK / Loki + Grafana) and why it is needed in microservices',
  ],
  theory: [
    {
      heading: '1. Why Basic Microservices Are Not Enough',
      content: 'On the earlier Spring Boot track you built Eureka, Gateway and OpenFeign. That system works on your laptop, but in a real company three new problems appear. (1) Configuration: 20 services x 3 environments (dev, qa, prod) = 60 application.yml files. Changing one database password means redeploying many services. (2) Failures spread: if payment-service becomes slow, order-service threads wait for it, the thread pool fills up, and order-service also dies. This is called a cascading failure. (3) Debugging: one click on "Place Order" travels Gateway -> order-service -> inventory-service -> payment-service. When it fails, which log file do you open? Spring Cloud gives one answer to each problem: Config Server, Resilience4j and Micrometer Tracing.',
      points: [
        'Config Server = one central "settings office" for all services',
        'Resilience4j = "electric fuse" that cuts the line when a service keeps failing',
        'Distributed tracing = "courier tracking number" that follows one request through every service',
        'Centralized logging = all services send logs to one searchable place',
      ],
    },
    {
      heading: '2. Spring Cloud Config Server',
      content: 'Config Server is a small Spring Boot app with @EnableConfigServer. It reads property files from a Git repository (or a local folder with the "native" profile) and serves them over HTTP. A client service named order-service with profile prod asks for /order-service/prod and receives values from application.yml (shared by all), order-service.yml and order-service-prod.yml, merged with the most specific winning. Because the files live in Git, you get history, review and rollback of configuration for free.',
      syntax: `# Config Server URL pattern
GET http://localhost:8888/{application}/{profile}[/{label}]
GET http://localhost:8888/order-service/dev          # label = Git branch, default main

# Client side (Spring Boot 2.4+ / 3.x way)
spring:
  application:
    name: order-service
  config:
    import: "optional:configserver:http://localhost:8888"`,
      points: [
        'File priority (highest first): order-service-dev.yml > order-service.yml > application-dev.yml > application.yml',
        '"optional:" means the service still starts if Config Server is down (use without optional in prod if config is mandatory)',
        'Secrets: do not keep plain passwords in Git; use {cipher} encrypted values, Vault, or Kubernetes Secrets',
        '@RefreshScope beans reload values after POST /actuator/refresh; Spring Cloud Bus (Kafka/RabbitMQ) refreshes ALL instances at once',
      ],
      tip: 'The old bootstrap.yml approach is disabled by default in Spring Boot 3. Use spring.config.import in application.yml.',
    },
    {
      heading: '3. Circuit Breaker with Resilience4j',
      content: 'A circuit breaker sits around a remote call and watches results. It has three states. CLOSED: normal, calls go through and failures are counted in a sliding window (for example last 10 calls). If the failure rate crosses a threshold (say 50%), it goes OPEN: calls are NOT sent at all, the fallback method answers immediately, so threads are not blocked. After a wait duration (say 10 s) it goes HALF_OPEN: a few trial calls are allowed; if they succeed it goes back to CLOSED, otherwise OPEN again. Analogy: the MCB (fuse) in your house trips when there is a short circuit so the whole wiring does not burn; after the electrician fixes it you switch it on again.',
      syntax: `@CircuitBreaker(name = "paymentService", fallbackMethod = "paymentFallback")
public PaymentResponse pay(PaymentRequest req) {
    return paymentClient.pay(req);          // remote call (Feign/RestClient)
}

// same parameters + Throwable at the end, same return type
private PaymentResponse paymentFallback(PaymentRequest req, Throwable ex) {
    return new PaymentResponse("PENDING", "Payment service busy, will retry");
}`,
      points: [
        'Dependency: spring-cloud-starter-circuitbreaker-resilience4j plus spring-boot-starter-aop (annotations work through AOP proxies)',
        'Fallback method must be in the same class, same return type, same parameters + one exception parameter',
        'Self-invocation (calling the annotated method from the same class) bypasses the proxy, so the breaker does NOT work',
        'State visible at /actuator/circuitbreakers and /actuator/health when management.health.circuitbreakers.enabled=true',
      ],
    },
    {
      heading: '4. Retry, Rate Limiter, Time Limiter and Bulkhead',
      content: 'Resilience4j is a toolbox; each tool solves one type of problem. Retry: try again for temporary errors (network blip) with a wait between attempts, ideally exponential backoff (1s, 2s, 4s). Rate Limiter: allow only N calls per period, protecting your service or an external API with quota (e.g., SMS gateway allows 10 requests/second). Time Limiter: give up if a call takes longer than X seconds (works with CompletableFuture). Bulkhead: limit concurrent calls so one slow dependency cannot eat all threads, like compartments in a ship that stop water from flooding the whole ship.',
      points: [
        'Order when stacked on one method: Retry ( CircuitBreaker ( RateLimiter ( TimeLimiter ( Bulkhead ( call ) ) ) ) ) — Retry is the outermost',
        'Only retry idempotent or safe operations; retrying "debit Rs. 500" can charge the customer twice unless you use an idempotency key',
        'Rate limiter rejection throws RequestNotPermitted; circuit open throws CallNotPermittedException',
        'Configure everything in application.yml under resilience4j.* — no code change to tune numbers',
      ],
      tip: 'Interviewers love: "Retry vs Circuit Breaker?" Retry is optimistic (problem will go away in a second). Circuit breaker is pessimistic (service is down, stop hitting it).',
    },
    {
      heading: '5. Distributed Tracing with Micrometer Tracing and Zipkin',
      content: 'Spring Boot 3 replaced Spring Cloud Sleuth with Micrometer Tracing. When a request enters the first service, a traceId (one per whole request) is created. Each hop (each service or each important operation) gets its own spanId. The ids are passed to the next service in HTTP headers (W3C "traceparent" header by default) and automatically added to every log line. Spans are exported to Zipkin (or Jaeger/Tempo), which shows a timeline: gateway 120 ms -> order-service 100 ms -> payment-service 80 ms. You instantly see which service is slow.',
      syntax: `<!-- pom.xml of EVERY service -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
<dependency><groupId>io.micrometer</groupId><artifactId>micrometer-tracing-bridge-brave</artifactId></dependency>
<dependency><groupId>io.zipkin.reporter2</groupId><artifactId>zipkin-reporter-brave</artifactId></dependency>

# application.yml
management:
  tracing:
    sampling:
      probability: 1.0        # 100% in dev; 0.1 (10%) is common in prod
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans`,
      points: [
        'Run Zipkin: docker run -d -p 9411:9411 openzipkin/zipkin then open http://localhost:9411',
        'Log pattern in Boot 3.2+: [service-name,traceId,spanId] is added automatically when tracing is on',
        'Propagation works automatically for RestTemplate/RestClient/WebClient built from Spring builders and for OpenFeign (with feign-micrometer)',
        'Never create RestTemplate with "new RestTemplate()" if you want tracing — inject RestTemplateBuilder / RestClient.Builder',
      ],
    },
    {
      heading: '6. Centralized Logging (Concept)',
      content: 'With 10 services x 3 instances you have 30 log files on 30 containers that may be deleted any time. Centralized logging ships every log line to one store where you can search by traceId. Popular stacks: ELK (Elasticsearch + Logstash + Kibana), EFK (Fluent Bit/Fluentd instead of Logstash), and Grafana Loki + Grafana. Best practice is structured JSON logs (Spring Boot 3.4+ supports logging.structured.format.console=ecs or logstash). Then in Kibana/Grafana you type traceId=6f1c... and see the full story from all services in time order.',
      points: [
        'Apps write logs to stdout (12-factor rule); the platform agent (Fluent Bit, Promtail) collects them',
        'Always include traceId in logs — this connects tracing and logging',
        'Do NOT log passwords, OTPs, full card numbers or JWT tokens',
        'Observability = Logs + Metrics (Prometheus/Grafana) + Traces (Zipkin/Tempo)',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Config Server Backed by Git + Client with @RefreshScope',
      scenario: 'Create config-server on port 8888 that serves settings from a Git repo, and make order-service read a discount percentage that can be changed without restart.',
      steps: [
        'Create a Git repo "config-repo" (GitHub or local folder) with application.yml, order-service.yml and order-service-prod.yml; commit and push',
        'start.spring.io: Group com.shop, Artifact config-server, Java 17, Spring Boot 3.3.x, dependency "Config Server". Generate and open in IntelliJ (File > Open > pom.xml > Open as Project) or Eclipse STS (File > Import > Existing Maven Projects)',
        'Add @EnableConfigServer to the main class and the application.yml shown below; Run ▶ ConfigServerApplication',
        'Open http://localhost:8888/order-service/default in the browser to check the server',
        'In order-service add dependencies "Config Client" and "Actuator", set spring.config.import, add @RefreshScope controller, run it',
        'Change discount in Git, commit/push, then POST /actuator/refresh and call the API again',
      ],
      code: `# ===== config-repo/application.yml (shared by all services) =====
app:
  company: ShopKart
management:
  endpoints:
    web:
      exposure:
        include: health,info,refresh

# ===== config-repo/order-service.yml =====
order:
  discount-percent: 5
  max-items: 10

# ===== config-repo/order-service-prod.yml =====
order:
  discount-percent: 2

# ===== config-server: pom.xml (important parts) =====
<parent>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-parent</artifactId>
  <version>3.3.5</version>
</parent>
<properties>
  <java.version>17</java.version>
  <spring-cloud.version>2023.0.3</spring-cloud.version>
</properties>
<dependencies>
  <dependency>
    <groupId>org.springframework.cloud</groupId>
    <artifactId>spring-cloud-config-server</artifactId>
  </dependency>
</dependencies>
<dependencyManagement>
  <dependencies>
    <dependency>
      <groupId>org.springframework.cloud</groupId>
      <artifactId>spring-cloud-dependencies</artifactId>
      <version>\${spring-cloud.version}</version>
      <type>pom</type>
      <scope>import</scope>
    </dependency>
  </dependencies>
</dependencyManagement>

// ===== config-server: ConfigServerApplication.java =====
package com.shop.configserver;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.config.server.EnableConfigServer;

@SpringBootApplication
@EnableConfigServer
public class ConfigServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(ConfigServerApplication.class, args);
    }
}

# ===== config-server: application.yml =====
server:
  port: 8888
spring:
  application:
    name: config-server
  cloud:
    config:
      server:
        git:
          uri: https://github.com/your-user/config-repo
          default-label: main
          clone-on-start: true
# For a local folder instead of Git:
# spring.profiles.active: native
# spring.cloud.config.server.native.search-locations: file:///C:/config-repo

# ===== order-service: application.yml =====
spring:
  application:
    name: order-service
  profiles:
    active: dev
  config:
    import: "optional:configserver:http://localhost:8888"
server:
  port: 8081

// ===== order-service: DiscountController.java =====
package com.shop.order.web;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.context.config.annotation.RefreshScope;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RefreshScope
@RequestMapping("/api/orders")
public class DiscountController {

    @Value("\${order.discount-percent}")
    private int discountPercent;

    @Value("\${app.company}")
    private String company;

    @GetMapping("/discount")
    public Map<String, Object> discount() {
        return Map.of("company", company, "discountPercent", discountPercent);
    }
}

# ===== Commands =====
curl http://localhost:8888/order-service/default
curl http://localhost:8081/api/orders/discount
# edit order-service.yml in Git: discount-percent: 15 -> commit + push
curl -X POST http://localhost:8081/actuator/refresh
curl http://localhost:8081/api/orders/discount`,
      result: `GET http://localhost:8888/order-service/default
{"name":"order-service","profiles":["default"],"label":null,"version":"a91c3e...",
 "propertySources":[
   {"name":"https://github.com/your-user/config-repo/order-service.yml","source":{"order.discount-percent":5,"order.max-items":10}},
   {"name":"https://github.com/your-user/config-repo/application.yml","source":{"app.company":"ShopKart", ...}}]}

GET /api/orders/discount        -> {"company":"ShopKart","discountPercent":5}
POST /actuator/refresh          -> ["config.client.version","order.discount-percent"]
GET /api/orders/discount        -> {"company":"ShopKart","discountPercent":15}`,
      explanation: 'The client merges files from Config Server: order-service.yml gives discount 5 and application.yml gives company. Because the controller is @RefreshScope, the refresh endpoint destroys and re-creates the bean with new values, so no restart is needed. The refresh response lists changed keys. If you started order-service with profile prod, order-service-prod.yml would win and discount would be 2. In production, many instances are refreshed together with Spring Cloud Bus (/actuator/busrefresh).',
    },
    {
      title: 'Example 2: Circuit Breaker + Retry Around a Slow Payment Service',
      scenario: 'order-service calls payment-service through RestClient. When payment-service is down, orders should be saved as PAYMENT_PENDING instead of failing with 500.',
      steps: [
        'Add dependencies spring-cloud-starter-circuitbreaker-resilience4j, spring-boot-starter-aop and spring-boot-starter-actuator to order-service',
        'Create PaymentGateway service with @Retry and @CircuitBreaker and a fallback method',
        'Add the resilience4j configuration to application.yml',
        'Run order-service WITHOUT starting payment-service and call POST /api/orders 6 times from Postman',
        'Watch the console logs and GET /actuator/circuitbreakers to see the state change from CLOSED to OPEN',
        'Start payment-service, wait 10 seconds and call again: state goes HALF_OPEN and then CLOSED',
      ],
      code: `<!-- order-service pom.xml additions -->
<dependency>
  <groupId>org.springframework.cloud</groupId>
  <artifactId>spring-cloud-starter-circuitbreaker-resilience4j</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-aop</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>

# ===== application.yml =====
resilience4j:
  circuitbreaker:
    instances:
      paymentService:
        sliding-window-type: COUNT_BASED
        sliding-window-size: 4
        minimum-number-of-calls: 4
        failure-rate-threshold: 50
        wait-duration-in-open-state: 10s
        permitted-number-of-calls-in-half-open-state: 2
        automatic-transition-from-open-to-half-open-enabled: true
        register-health-indicator: true
  retry:
    instances:
      paymentService:
        max-attempts: 3
        wait-duration: 500ms
        enable-exponential-backoff: true
        exponential-backoff-multiplier: 2
        retry-exceptions:
          - org.springframework.web.client.ResourceAccessException
management:
  health:
    circuitbreakers:
      enabled: true
  endpoints:
    web:
      exposure:
        include: health,circuitbreakers,circuitbreakerevents

// ===== PaymentGateway.java =====
package com.shop.order.client;

import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
public class PaymentGateway {

    private static final Logger log = LoggerFactory.getLogger(PaymentGateway.class);
    private final RestClient restClient;

    public PaymentGateway(RestClient.Builder builder) {
        this.restClient = builder.baseUrl("http://localhost:8082").build();
    }

    public record PaymentRequest(Long orderId, double amount) {}
    public record PaymentResponse(String status, String message) {}

    @Retry(name = "paymentService")
    @CircuitBreaker(name = "paymentService", fallbackMethod = "fallback")
    public PaymentResponse pay(PaymentRequest req) {
        log.info("Calling payment-service for order {}", req.orderId());
        return restClient.post()
                .uri("/api/payments")
                .body(req)
                .retrieve()
                .body(PaymentResponse.class);
    }

    private PaymentResponse fallback(PaymentRequest req, Throwable ex) {
        log.warn("Fallback for order {} because {}", req.orderId(), ex.getClass().getSimpleName());
        return new PaymentResponse("PAYMENT_PENDING", "Payment service unavailable, we will retry");
    }
}

// ===== OrderController.java (uses the gateway) =====
@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final PaymentGateway paymentGateway;
    public OrderController(PaymentGateway paymentGateway) { this.paymentGateway = paymentGateway; }

    @PostMapping
    public PaymentGateway.PaymentResponse place(@RequestParam Long id, @RequestParam double amount) {
        return paymentGateway.pay(new PaymentGateway.PaymentRequest(id, amount));
    }
}`,
      result: `POST /api/orders?id=101&amount=499  (payment-service is down)
Response 200: {"status":"PAYMENT_PENDING","message":"Payment service unavailable, we will retry"}

Console (call 1):
INFO  Calling payment-service for order 101
INFO  Calling payment-service for order 101      <- retry after 500 ms
INFO  Calling payment-service for order 101      <- retry after 1000 ms
WARN  Fallback for order 101 because ResourceAccessException

... after enough failed calls ...
GET /actuator/circuitbreakers
{"circuitBreakers":{"paymentService":{"failureRate":"100.0%","state":"OPEN", ...}}}

Next POST (circuit OPEN) - no "Calling payment-service" line, answer is instant:
WARN  Fallback for order 105 because CallNotPermittedException`,
      explanation: 'With the default aspect order, Retry wraps CircuitBreaker, so each retry attempt is one call recorded by the breaker. Once the window of 4 calls has 50% or more failures the state is OPEN and calls fail fast with CallNotPermittedException; the fallback returns a friendly response, so order-service stays healthy. After 10 s the breaker automatically moves to HALF_OPEN and allows 2 trial calls. Note: when the circuit is OPEN, Retry does not retry CallNotPermittedException because we listed only ResourceAccessException in retry-exceptions.',
    },
    {
      title: 'Example 3: Rate Limiter for an OTP/SMS API',
      scenario: 'The SMS vendor allows only 2 requests per second from our account. Protect it so extra requests get HTTP 429 Too Many Requests.',
      steps: [
        'Use the same dependencies as Example 2',
        'Add resilience4j.ratelimiter config with limit-for-period 2 and refresh period 1s',
        'Annotate the service method with @RateLimiter and handle RequestNotPermitted in a @RestControllerAdvice',
        'In Postman, create the request and use Runner (Collection > Run) with 5 iterations and 0 ms delay',
      ],
      code: `# application.yml
resilience4j:
  ratelimiter:
    instances:
      smsApi:
        limit-for-period: 2
        limit-refresh-period: 1s
        timeout-duration: 0s      # do not wait for a permit, reject immediately

// SmsService.java
package com.shop.notify;

import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import org.springframework.stereotype.Service;

@Service
public class SmsService {
    @RateLimiter(name = "smsApi")
    public String sendOtp(String mobile) {
        // call vendor API here
        return "OTP sent to " + mobile;
    }
}

// SmsController.java
@RestController
@RequestMapping("/api/otp")
public class SmsController {
    private final SmsService smsService;
    public SmsController(SmsService smsService) { this.smsService = smsService; }

    @PostMapping("/{mobile}")
    public String send(@PathVariable String mobile) {
        return smsService.sendOtp(mobile);
    }
}

// RateLimitHandler.java
import io.github.resilience4j.ratelimiter.RequestNotPermitted;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestControllerAdvice
public class RateLimitHandler {
    @ExceptionHandler(RequestNotPermitted.class)
    public ResponseEntity<String> tooMany(RequestNotPermitted ex) {
        return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("Too many OTP requests. Please try after 1 second.");
    }
}`,
      result: `Postman Runner, 5 requests within the same second:
#1 POST /api/otp/9876543210 -> 200 OK  "OTP sent to 9876543210"
#2 POST /api/otp/9876543210 -> 200 OK  "OTP sent to 9876543210"
#3 POST /api/otp/9876543210 -> 429 Too Many Requests "Too many OTP requests. Please try after 1 second."
#4 -> 429
#5 -> 429
(after 1 second the next request is 200 OK again)`,
      explanation: 'Each refresh period (1 s) gives 2 permits. With timeout-duration 0s, a request that finds no permit fails at once with RequestNotPermitted, which our advice converts to 429. This is a per-instance limit; if you run 3 instances, the total becomes 6 per second. For a global limit use the API Gateway RequestRateLimiter filter with Redis.',
    },
    {
      title: 'Example 4: Distributed Tracing Across Two Services with Zipkin',
      scenario: 'Trace a request from order-service to inventory-service and see the timeline in Zipkin.',
      steps: [
        'Start Zipkin: docker run -d --name zipkin -p 9411:9411 openzipkin/zipkin',
        'Add actuator, micrometer-tracing-bridge-brave and zipkin-reporter-brave to BOTH services',
        'Set management.tracing.sampling.probability=1.0 in both',
        'In order-service create the RestClient from the injected RestClient.Builder (so trace headers are added)',
        'Call GET http://localhost:8081/api/orders/check/P100 and look at both consoles',
        'Open http://localhost:9411, click RUN QUERY and open the trace',
      ],
      code: `<!-- both services -->
<dependency><groupId>org.springframework.boot</groupId><artifactId>spring-boot-starter-actuator</artifactId></dependency>
<dependency><groupId>io.micrometer</groupId><artifactId>micrometer-tracing-bridge-brave</artifactId></dependency>
<dependency><groupId>io.zipkin.reporter2</groupId><artifactId>zipkin-reporter-brave</artifactId></dependency>

# order-service application.yml (inventory-service same, with its own name and port 8083)
spring:
  application:
    name: order-service
server:
  port: 8081
management:
  tracing:
    sampling:
      probability: 1.0
  zipkin:
    tracing:
      endpoint: http://localhost:9411/api/v2/spans

// order-service: StockCheckController.java
@RestController
@RequestMapping("/api/orders")
public class StockCheckController {
    private static final Logger log = LoggerFactory.getLogger(StockCheckController.class);
    private final RestClient inventory;

    public StockCheckController(RestClient.Builder builder) {
        this.inventory = builder.baseUrl("http://localhost:8083").build();
    }

    @GetMapping("/check/{productId}")
    public String check(@PathVariable String productId) {
        log.info("Checking stock for {}", productId);
        Integer qty = inventory.get().uri("/api/stock/{id}", productId)
                .retrieve().body(Integer.class);
        return productId + " available qty = " + qty;
    }
}

// inventory-service: StockController.java
@RestController
@RequestMapping("/api/stock")
public class StockController {
    private static final Logger log = LoggerFactory.getLogger(StockController.class);

    @GetMapping("/{id}")
    public int stock(@PathVariable String id) {
        log.info("Returning stock for {}", id);
        return 42;
    }
}`,
      result: `Browser: P100 available qty = 42

order-service console:
INFO [order-service,6650f1a2b3c4d5e6f708192a3b4c5d6e,1a2b3c4d5e6f7081] ... Checking stock for P100

inventory-service console:
INFO [inventory-service,6650f1a2b3c4d5e6f708192a3b4c5d6e,9f8e7d6c5b4a3921] ... Returning stock for P100

Zipkin UI -> trace 6650f1a2...:
order-service: http get /api/orders/check/{productId}   18.4ms
  └─ order-service: http get                             9.7ms
       └─ inventory-service: http get /api/stock/{id}    4.1ms
(ids and timings differ on your machine)`,
      explanation: 'The same traceId appears in both consoles while the spanId is different for each hop. RestClient.Builder injected by Spring is instrumented, so it adds the traceparent header automatically. In Zipkin you see a parent/child timeline; the widest bar is your slow part. In a real company you would copy the traceId from an error log and search it in Kibana/Grafana to read logs from all services.',
    },
  ],
  interview: [
    { q: 'What is Spring Cloud Config Server and why do we need it?', a: 'A central server (@EnableConfigServer) that serves configuration for all microservices from Git/Vault/file system over HTTP. It avoids duplicated properties, keeps environment-specific values in one place with version history, and allows runtime refresh without rebuilding services.', level: 'Easy' },
    { q: 'How does a Spring Boot 3 client connect to Config Server?', a: 'Add spring-cloud-starter-config and set spring.config.import=optional:configserver:http://host:8888 along with spring.application.name and active profile. bootstrap.yml is not used by default anymore.', level: 'Medium' },
    { q: 'What does @RefreshScope do?', a: 'Beans marked @RefreshScope are lazily created proxies; when /actuator/refresh is called (or a Bus refresh event arrives), the cached bean is discarded and recreated with new property values on next use. @ConfigurationProperties beans are re-bound automatically on refresh.', level: 'Medium' },
    { q: 'Explain the three states of a circuit breaker.', a: 'CLOSED: calls pass, failures counted. OPEN: failure rate crossed threshold, calls are rejected immediately (CallNotPermittedException) and fallback runs. HALF_OPEN: after wait duration, limited trial calls; success closes the circuit, failure reopens it.', level: 'Easy' },
    { q: 'What is a cascading failure?', a: 'When one slow/failed service causes callers to block, exhaust their threads or connections and fail too, spreading the outage across the system. Timeouts, circuit breakers and bulkheads prevent it.', level: 'Medium' },
    { q: 'Retry vs Circuit Breaker — when to use which?', a: 'Retry handles short transient failures by trying again a few times with backoff. Circuit breaker handles longer outages by stopping calls for a while. They are usually combined: Retry outside, CircuitBreaker inside. Retry only idempotent operations.', level: 'Medium' },
    { q: 'What are the rules for a Resilience4j fallback method?', a: 'Same class, same return type, same parameter list plus one Throwable (or specific exception) as the last parameter. You can have several fallbacks for different exception types; the most specific match is chosen.', level: 'Medium' },
    { q: 'Why might @CircuitBreaker not work at all in your code?', a: 'Missing spring-boot-starter-aop, method called from the same class (self-invocation bypasses the proxy), method is private/final, the class is not a Spring bean (created with new), or the instance name does not match configuration (then defaults are used).', level: 'Hard' },
    { q: 'What replaced Spring Cloud Sleuth in Spring Boot 3?', a: 'Micrometer Tracing (with Brave or OpenTelemetry bridge). Exporters such as zipkin-reporter-brave or OTLP send spans to Zipkin, Jaeger or Grafana Tempo.', level: 'Easy' },
    { q: 'What is the difference between traceId and spanId?', a: 'traceId identifies the complete end-to-end request and is the same in every service. spanId identifies one unit of work (one service hop or operation); spans have parent-child links forming a tree.', level: 'Easy' },
    { q: 'Why is sampling probability set below 1.0 in production?', a: 'Recording and exporting every span costs CPU, network and storage. Sampling (e.g., 10%) gives a statistically useful picture at lower cost. Errors can still be investigated through logs that contain traceIds.', level: 'Hard' },
    { q: 'What is centralized logging and which tools are used?', a: 'Collecting logs from all services/containers into one searchable store. Common stacks: ELK/EFK (Elasticsearch, Logstash/Fluentd, Kibana) and Grafana Loki. Apps log structured JSON to stdout with traceId; agents ship them.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Set up a Config Server using the native (local folder) profile instead of Git, serving product-service.yml with product.page-size=20.',
      hint: 'spring.profiles.active=native and spring.cloud.config.server.native.search-locations.',
      solution: `# config-server application.yml
server:
  port: 8888
spring:
  application:
    name: config-server
  profiles:
    active: native
  cloud:
    config:
      server:
        native:
          search-locations: file:./config-repo     # folder next to the jar

# ./config-repo/product-service.yml
product:
  page-size: 20

# product-service application.yml
spring:
  application:
    name: product-service
  config:
    import: "configserver:http://localhost:8888"

// product-service usage
@ConfigurationProperties(prefix = "product")
public record ProductProps(int pageSize) {}
// enable with @EnableConfigurationProperties(ProductProps.class) on main class

# test
curl http://localhost:8888/product-service/default
# -> ..."source":{"product.page-size":20}...`,
    },
    {
      task: 'Add a TimeLimiter so that a call to a slow report-service is cancelled after 2 seconds and a fallback "Report is being prepared" is returned.',
      hint: '@TimeLimiter works with CompletableFuture return type.',
      solution: `# application.yml
resilience4j:
  timelimiter:
    instances:
      reportService:
        timeout-duration: 2s
        cancel-running-future: true

// ReportClient.java
@Service
public class ReportClient {
    private final RestClient client;
    public ReportClient(RestClient.Builder b) { this.client = b.baseUrl("http://localhost:8090").build(); }

    @TimeLimiter(name = "reportService", fallbackMethod = "reportFallback")
    public CompletableFuture<String> monthlyReport(String month) {
        return CompletableFuture.supplyAsync(() ->
            client.get().uri("/reports/{m}", month).retrieve().body(String.class));
    }

    private CompletableFuture<String> reportFallback(String month, Throwable ex) {
        return CompletableFuture.completedFuture("Report is being prepared");
    }
}

// Controller: Spring MVC can return CompletableFuture directly
@GetMapping("/api/reports/{month}")
public CompletableFuture<String> report(@PathVariable String month) {
    return reportClient.monthlyReport(month);
}`,
    },
    {
      task: 'Write a Bulkhead configuration that allows at most 5 concurrent calls to inventory-service and makes the 6th caller wait up to 100 ms before being rejected.',
      hint: 'resilience4j.bulkhead.instances with max-concurrent-calls and max-wait-duration.',
      solution: `# application.yml
resilience4j:
  bulkhead:
    instances:
      inventoryService:
        max-concurrent-calls: 5
        max-wait-duration: 100ms

// InventoryClient.java
@Service
public class InventoryClient {
    private final RestClient client;
    public InventoryClient(RestClient.Builder b) { this.client = b.baseUrl("http://localhost:8083").build(); }

    @Bulkhead(name = "inventoryService", fallbackMethod = "busy")
    public Integer stock(String id) {
        return client.get().uri("/api/stock/{id}", id).retrieve().body(Integer.class);
    }

    private Integer busy(String id, Throwable ex) {   // BulkheadFullException
        return -1;   // caller shows "Stock info unavailable"
    }
}`,
    },
    {
      task: 'Add a custom span around a slow business method (calculateTax) so it appears separately in Zipkin.',
      hint: 'Use @Observed (needs ObservedAspect bean) or the Observation API.',
      solution: `// Config: enable @Observed
@Configuration
public class ObservationConfig {
    @Bean
    ObservedAspect observedAspect(ObservationRegistry registry) {
        return new ObservedAspect(registry);
    }
}

// TaxService.java
@Service
public class TaxService {
    @Observed(name = "tax.calculate", contextualName = "calculate-tax")
    public double calculateTax(double amount) {
        // pretend this is heavy logic
        return amount * 0.18;      // 18% GST
    }
}

// pom.xml needs spring-boot-starter-aop in addition to tracing dependencies.
// Zipkin now shows a child span "calculate-tax" under the HTTP span.`,
    },
    {
      task: 'Configure order-service to print JSON logs (with traceId) to the console, ready for an ELK/Loki pipeline.',
      hint: 'Spring Boot 3.4+: logging.structured.format.console.',
      solution: `# application.yml (Spring Boot 3.4 or newer)
logging:
  structured:
    format:
      console: ecs        # Elastic Common Schema; other options: logstash, gelf
  level:
    com.shop: INFO

# Sample output line (one JSON per line):
# {"@timestamp":"2026-11-18T10:15:02.114Z","log.level":"INFO","process.pid":4120,
#  "service.name":"order-service","log.logger":"com.shop.order.web.StockCheckController",
#  "message":"Checking stock for P100","traceId":"6650f1a2...","spanId":"1a2b3c4d..."}

# For Boot 3.2/3.3 use logstash-logback-encoder in logback-spring.xml:
# <encoder class="net.logstash.logback.encoder.LogstashEncoder"/>`,
    },
  ],
  quiz: [
    {
      question: 'Which annotation turns a Spring Boot application into a Config Server?',
      options: ['@EnableConfigClient', '@EnableConfigServer', '@ConfigServerApplication', '@EnableDiscoveryClient'],
      answer: 1,
      explanation: '@EnableConfigServer together with spring-cloud-config-server dependency.',
    },
    {
      question: 'In which circuit breaker state are calls rejected immediately without calling the remote service?',
      options: ['CLOSED', 'HALF_OPEN', 'DISABLED', 'OPEN'],
      answer: 3,
      explanation: 'In OPEN state the breaker throws CallNotPermittedException and the fallback runs.',
    },
    {
      question: 'Which exception does Resilience4j throw when the rate limiter has no permit available?',
      options: ['RequestNotPermitted', 'CallNotPermittedException', 'BulkheadFullException', 'TimeoutException'],
      answer: 0,
      explanation: 'RequestNotPermitted is thrown by the RateLimiter; map it to HTTP 429.',
    },
    {
      question: 'In Spring Boot 3, distributed tracing is provided by:',
      options: ['Spring Cloud Sleuth', 'Netflix Hystrix', 'Micrometer Tracing', 'Spring Cloud Bus'],
      answer: 2,
      explanation: 'Sleuth was replaced by Micrometer Tracing with Brave or OpenTelemetry bridges.',
    },
    {
      question: 'Which value stays the SAME in the logs of every service handling one user request?',
      options: ['spanId', 'traceId', 'thread name', 'port number'],
      answer: 1,
      explanation: 'traceId is shared by the whole request; each hop has its own spanId.',
    },
  ],
};
