export default {
  id: 'day-22-microservices-eureka-gateway-feign',
  title: 'Microservices Introduction: Service Discovery (Eureka), API Gateway, OpenFeign',
  module: 'Module 5: Advanced',
  day: 22,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Understand monolith vs microservices and build a small Spring Cloud system: a Eureka discovery server, two services that register with it, an OpenFeign client for service-to-service calls, and a Spring Cloud Gateway as the single entry point.',
  objectives: [
    'Compare monolith and microservices architecture with pros and cons',
    'Create a Eureka Server and register Eureka clients',
    'Call another service by name with OpenFeign (and client-side load balancing)',
    'Route external traffic through Spring Cloud Gateway',
    'Know supporting patterns: config server, circuit breaker (Resilience4j), distributed tracing',
  ],
  theory: [
    {
      heading: '1. Monolith vs Microservices',
      content: 'A monolith is one big application (one JAR, one database) containing all modules: users, products, orders, payments. Microservices split it into small independent services, each owning its data and deployed separately, talking over HTTP or messaging. Analogy: a monolith is a single giant restaurant kitchen; microservices are a food court — each stall (service) cooks one cuisine, can be upgraded or closed without shutting down the others.',
      points: [
        'Pros: independent deployment, scale only the busy service, team autonomy, technology freedom, fault isolation',
        'Cons: network calls, distributed data/transactions, more DevOps, harder debugging and testing',
        'Rule of thumb: start with a well-structured monolith; split when team size/scale demands',
      ],
    },
    {
      heading: '2. Service Discovery with Eureka',
      content: 'In the cloud, service instances start and stop and their IPs change. Hard-coding http://10.0.0.5:8081 breaks. A discovery server is a phone directory: each service REGISTERS itself (name, host, port) and sends heartbeats every 30 s; other services LOOK UP by name (ORDER-SERVICE) instead of IP. Netflix Eureka is integrated into Spring Cloud.',
      points: [
        'Eureka Server: @EnableEurekaServer + spring-cloud-starter-netflix-eureka-server',
        'Eureka Client: just add spring-cloud-starter-netflix-eureka-client and set eureka.client.service-url.defaultZone',
        'Dashboard at http://localhost:8761 shows registered instances',
        'Spring Cloud LoadBalancer picks one instance when several are registered (round-robin)',
      ],
    },
    {
      heading: '3. Inter-service Communication with OpenFeign',
      content: 'OpenFeign is a declarative HTTP client: you write an interface with Spring MVC annotations, and Feign generates the implementation. With @FeignClient(name = "product-service") Feign asks Eureka for the address and load-balances automatically.',
      syntax: `@FeignClient(name = "product-service")
public interface ProductClient {
    @GetMapping("/api/products/{id}")
    ProductDto getProduct(@PathVariable("id") Long id);
}
// enable with @EnableFeignClients on the main class`,
      tip: 'Always give @PathVariable("id") and @RequestParam("x") names explicitly in Feign interfaces.',
    },
    {
      heading: '4. API Gateway',
      content: 'Clients (React, mobile) should not know every service address. An API Gateway is the single front door: http://localhost:8080/api/products/** → product-service, /api/orders/** → order-service. It also handles cross-cutting concerns: authentication (JWT validation), CORS, rate limiting, logging. Spring Cloud Gateway is built on Spring WebFlux (reactive). Analogy: a hotel reception desk directing guests to the right department.',
      syntax: `spring:
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service        # lb = load-balanced via Eureka
          predicates:
            - Path=/api/products/**`,
      tip: 'Spring Cloud 2025.0 renamed the property prefix to spring.cloud.gateway.server.webflux.routes; the old prefix still works with a deprecation warning. Check the version you use.',
    },
    {
      heading: '5. Other Essential Patterns (Overview)',
      content: 'Real microservice systems need more pieces. Learn the names and purpose for interviews.',
      points: [
        'Config Server – central place (Git) for all services\' configuration',
        'Circuit Breaker (Resilience4j) – stop calling a failing service, return a fallback, retry later',
        'Distributed Tracing (Micrometer Tracing + Zipkin) – follow one request across services with a trace id',
        'Database per service – no shared tables; use events (Kafka/RabbitMQ) for data sync; Saga pattern for distributed transactions',
        'Containerization (Docker, Day 23) and orchestration (Kubernetes)',
      ],
    },
    {
      heading: '6. Versions and Project Layout',
      content: 'Spring Cloud versions are "release trains" that must match Spring Boot: Boot 3.4.x → Spring Cloud 2024.0.x; Boot 3.5.x → 2025.0.x. Import the BOM with dependencyManagement. Typical layout: four separate Spring Boot projects in one folder (or a Maven multi-module).',
      syntax: `microservices-demo/
  discovery-server/   (8761)
  product-service/    (8081)
  order-service/      (8082)
  api-gateway/        (8080)`,
    },
  ],
  examples: [
    {
      title: 'Example 1: Eureka Discovery Server',
      scenario: 'Create the phone directory every service will register with.',
      steps: [
        'IntelliJ: New Project > Spring Boot > name discovery-server > dependency "Eureka Server" (Spring Cloud Discovery) > Create',
        'STS: File > New > Spring Starter Project > discovery-server > Spring Cloud Discovery > Eureka Server > Finish',
        'Initializr adds the spring-cloud-dependencies BOM automatically; check pom.xml',
        'Add @EnableEurekaServer to the main class and the properties below',
        'Run and open http://localhost:8761 — "Instances currently registered with Eureka: No instances available"',
      ],
      code: `<!-- ===== discovery-server/pom.xml (important parts) ===== -->
<properties>
    <java.version>17</java.version>
    <spring-cloud.version>2024.0.1</spring-cloud.version>
</properties>
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-server</artifactId>
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

// ===== DiscoveryServerApplication.java =====
package com.demo.discovery;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.netflix.eureka.server.EnableEurekaServer;

@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}

# ===== application.yml =====
server:
  port: 8761
spring:
  application:
    name: discovery-server
eureka:
  client:
    register-with-eureka: false   # the server does not register itself
    fetch-registry: false`,
      result: `Console: Started DiscoveryServerApplication in 4.2 seconds
Browser http://localhost:8761:
  System Status ... Environment: test
  Instances currently registered with Eureka
    No instances available`,
      explanation: '@EnableEurekaServer turns this Boot app into a registry. register-with-eureka and fetch-registry are false because a standalone server should not register with itself.',
    },
    {
      title: 'Example 2: Product Service and Order Service with OpenFeign',
      scenario: 'order-service must fetch product details (name, price) from product-service to calculate the order total — without knowing its IP.',
      steps: [
        'Create product-service: starters Spring Web, Eureka Discovery Client (port 8081)',
        'Create order-service: starters Spring Web, Eureka Discovery Client, OpenFeign (port 8082)',
        'Add @EnableFeignClients to OrderServiceApplication',
        'Run discovery-server first, then product-service, then order-service. IntelliJ: open each project in the same window via File > New > Module from Existing Sources, then use the Services tool window (Alt+8) to start all; STS: Boot Dashboard can start several apps at once',
        'Refresh http://localhost:8761 — PRODUCT-SERVICE and ORDER-SERVICE appear',
        'Call POST http://localhost:8082/api/orders',
        'Optional: start a second product-service with VM option -Dserver.port=8083 (IntelliJ: Edit Configurations > Copy > Modify options > Add VM options) to see load balancing',
      ],
      code: `# ===== product-service/application.yml =====
server:
  port: 8081
spring:
  application:
    name: product-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

// ===== product-service: ProductController.java =====
package com.demo.product;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
public class ProductController {
    public record Product(Long id, String name, double price, int servedByPort) {}

    @Value("\${server.port}")
    private int port;

    private final Map<Long, String[]> data = Map.of(
            1L, new String[]{"Keyboard", "1200"},
            2L, new String[]{"Monitor", "9500"});

    @GetMapping("/{id}")
    public Product get(@PathVariable Long id) {
        String[] p = data.get(id);
        if (p == null) throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.NOT_FOUND, "No product " + id);
        return new Product(id, p[0], Double.parseDouble(p[1]), port);
    }
}

# ===== order-service/application.yml =====
server:
  port: 8082
spring:
  application:
    name: order-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

// ===== order-service: OrderServiceApplication.java =====
@SpringBootApplication
@EnableFeignClients
public class OrderServiceApplication {
    public static void main(String[] args) { SpringApplication.run(OrderServiceApplication.class, args); }
}

// ===== order-service: ProductClient.java =====
package com.demo.order;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "product-service")       // Eureka service id
public interface ProductClient {
    record ProductDto(Long id, String name, double price, int servedByPort) {}

    @GetMapping("/api/products/{id}")
    ProductDto getProduct(@PathVariable("id") Long id);
}

// ===== order-service: OrderController.java =====
package com.demo.order;

import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    public record OrderRequest(Long productId, int quantity) {}
    public record OrderResponse(String product, int quantity, double total, int productServedBy) {}

    private final ProductClient productClient;
    public OrderController(ProductClient productClient) { this.productClient = productClient; }

    @PostMapping
    public ResponseEntity<OrderResponse> place(@RequestBody OrderRequest req) {
        ProductClient.ProductDto p = productClient.getProduct(req.productId());
        OrderResponse res = new OrderResponse(p.name(), req.quantity(),
                p.price() * req.quantity(), p.servedByPort());
        return ResponseEntity.status(HttpStatus.CREATED).body(res);
    }
}`,
      result: `Eureka dashboard: PRODUCT-SERVICE (1) UP, ORDER-SERVICE (1) UP

POST http://localhost:8082/api/orders  {"productId":2,"quantity":3}
-> 201 {"product":"Monitor","quantity":3,"total":28500.0,"productServedBy":8081}

With a second product-service on 8083, repeating the call alternates:
productServedBy 8081, 8083, 8081, 8083 ... (round-robin)

POST {"productId":9,"quantity":1}
-> 500 (FeignException$NotFound: [404] during [GET] to [http://product-service/api/products/9])`,
      explanation: 'Feign resolves "product-service" through Eureka and Spring Cloud LoadBalancer, so no IP or port is hard-coded. 9500 × 3 = 28500.0. The 404 from the remote service surfaces as FeignException; in real code handle it with @ExceptionHandler(FeignException.NotFound.class) or a Resilience4j fallback.',
    },
    {
      title: 'Example 3: Spring Cloud Gateway as the Single Entry Point',
      scenario: 'The React frontend should call only http://localhost:8080. The gateway routes requests to the right service and adds a header.',
      steps: [
        'Create api-gateway: starters Gateway (Spring Cloud Routing, reactive) + Eureka Discovery Client. Do NOT add Spring Web (gateway is WebFlux)',
        'Configure routes in application.yml',
        'Optionally add a global logging filter',
        'Start order: discovery-server → product-service → order-service → api-gateway',
        'Call http://localhost:8080/api/products/1 and POST http://localhost:8080/api/orders',
      ],
      code: `# ===== api-gateway/application.yml =====
server:
  port: 8080
spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      routes:
        - id: product-service
          uri: lb://product-service
          predicates:
            - Path=/api/products/**
          filters:
            - AddResponseHeader=X-Gateway, spring-cloud-gateway
        - id: order-service
          uri: lb://order-service
          predicates:
            - Path=/api/orders/**
      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "http://localhost:5173"
            allowedMethods: "*"
            allowedHeaders: "*"
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

// ===== api-gateway: LoggingFilter.java =====
package com.demo.gateway;

import org.slf4j.*;
import org.springframework.cloud.gateway.filter.*;
import org.springframework.core.Ordered;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class LoggingFilter implements GlobalFilter, Ordered {
    private static final Logger log = LoggerFactory.getLogger(LoggingFilter.class);

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        log.info("Gateway -> {} {}", exchange.getRequest().getMethod(),
                 exchange.getRequest().getURI().getPath());
        return chain.filter(exchange);
    }

    @Override
    public int getOrder() { return -1; }   // run early
}`,
      result: `GET http://localhost:8080/api/products/1
-> 200 {"id":1,"name":"Keyboard","price":1200.0,"servedByPort":8081}
   Response header: X-Gateway: spring-cloud-gateway

POST http://localhost:8080/api/orders {"productId":1,"quantity":2}
-> 201 {"product":"Keyboard","quantity":2,"total":2400.0,"productServedBy":8081}

Gateway console:
INFO  LoggingFilter : Gateway -> GET /api/products/1
INFO  LoggingFilter : Gateway -> POST /api/orders`,
      explanation: 'Each route has a predicate (Path) and a destination uri. lb:// means "ask Eureka and load-balance". The frontend knows only port 8080; services can move or scale freely. CORS and (in real projects) JWT validation are handled once at the gateway.',
    },
  ],
  interview: [
    { q: 'What are microservices?', a: 'An architectural style where an application is built as a set of small, independently deployable services, each owning its own data and business capability, communicating over lightweight protocols (HTTP/REST, messaging).', level: 'Easy' },
    { q: 'What is service discovery and why is it needed?', a: 'A registry where service instances register their network location and clients look them up by name. Needed because instances scale up/down and IPs change dynamically in cloud/container environments.', level: 'Easy' },
    { q: 'Client-side vs server-side discovery?', a: 'Client-side: the client queries the registry and chooses an instance (Eureka + Spring Cloud LoadBalancer). Server-side: the client calls a load balancer/router that queries the registry (Kubernetes Service, AWS ALB).', level: 'Hard' },
    { q: 'What is OpenFeign?', a: 'A declarative REST client: you define an interface annotated with @FeignClient and Spring MVC mapping annotations; Spring Cloud generates the implementation, integrates Eureka lookup and load balancing.', level: 'Easy' },
    { q: 'What is an API Gateway and what does it do?', a: 'A single entry point for clients that routes requests to backend services and handles cross-cutting concerns: authentication, CORS, rate limiting, logging, request/response transformation.', level: 'Easy' },
    { q: 'What does lb:// mean in a gateway route?', a: 'Load-balanced URI: the gateway resolves the service name through the discovery client and chooses an instance via Spring Cloud LoadBalancer.', level: 'Medium' },
    { q: 'What is a circuit breaker?', a: 'A pattern that monitors calls to a remote service; after too many failures it "opens" and fails fast (returning a fallback) for a while, then half-opens to test recovery. Implemented with Resilience4j in Spring Cloud.', level: 'Medium' },
    { q: 'How do you handle transactions across microservices?', a: 'Avoid distributed 2PC; use the Saga pattern — a sequence of local transactions with compensating actions, coordinated by events (choreography) or an orchestrator.', level: 'Hard' },
    { q: 'Why "database per service"?', a: 'It keeps services loosely coupled and independently deployable; schema changes in one service cannot break another. Data is shared via APIs or events.', level: 'Medium' },
    { q: 'What is the role of Spring Cloud Config Server?', a: 'It serves externalized configuration (from Git/files/Vault) to all services, so configuration can change centrally per environment without rebuilding the services.', level: 'Medium' },
    { q: 'Why does Spring Cloud Gateway not work with spring-boot-starter-web?', a: 'The classic Spring Cloud Gateway is built on Spring WebFlux/Netty (reactive). Adding Spring MVC (Tomcat) conflicts. (A separate Gateway Server MVC variant exists for servlet stacks.)', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Resilience4j circuit breaker fallback to the Feign call so that orders still return a message when product-service is down.',
      hint: 'Add spring-cloud-starter-circuitbreaker-resilience4j, set spring.cloud.openfeign.circuitbreaker.enabled=true and give @FeignClient a fallback class.',
      solution: `# application.yml
spring:
  cloud:
    openfeign:
      circuitbreaker:
        enabled: true

@FeignClient(name = "product-service", fallback = ProductClientFallback.class)
public interface ProductClient { ... }

@Component
public class ProductClientFallback implements ProductClient {
    @Override
    public ProductDto getProduct(Long id) {
        return new ProductDto(id, "UNAVAILABLE", 0.0, -1);
    }
}`,
    },
    {
      task: 'Create a user-service (port 8084) that registers with Eureka and add a gateway route /api/users/**.',
      hint: 'Copy product-service settings; add a route block.',
      solution: `# user-service/application.yml
server:
  port: 8084
spring:
  application:
    name: user-service
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka

# api-gateway/application.yml (add route)
        - id: user-service
          uri: lb://user-service
          predicates:
            - Path=/api/users/**`,
    },
    {
      task: 'Handle FeignException.NotFound in order-service and return 404 with a JSON message.',
      hint: '@RestControllerAdvice with @ExceptionHandler(FeignException.NotFound.class).',
      solution: `@RestControllerAdvice
public class FeignErrors {
    @ExceptionHandler(FeignException.NotFound.class)
    public ResponseEntity<Map<String, String>> notFound(FeignException.NotFound ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", "Product does not exist"));
    }
}`,
    },
    {
      task: 'Use RestClient with @LoadBalanced instead of Feign to call product-service by name.',
      hint: 'Annotate a RestClient.Builder bean with @LoadBalanced.',
      solution: `@Bean
@LoadBalanced
RestClient.Builder lbRestClientBuilder() { return RestClient.builder(); }

@Service
public class ProductRestCaller {
    private final RestClient client;
    public ProductRestCaller(RestClient.Builder lbRestClientBuilder) {
        this.client = lbRestClientBuilder.baseUrl("http://product-service").build();
    }
    public ProductClient.ProductDto get(long id) {
        return client.get().uri("/api/products/{id}", id).retrieve()
                .body(ProductClient.ProductDto.class);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Annotation to make an app a Eureka registry:', options: ['@EnableDiscoveryClient', '@EnableEurekaServer', '@EnableFeignClients', '@EnableGateway'], answer: 1, explanation: '@EnableEurekaServer on the main class.' },
    { question: 'Default Eureka server port used in examples:', options: ['8761', '8080', '9090', '5432'], answer: 0, explanation: 'Convention is 8761.' },
    { question: 'In @FeignClient(name = "product-service"), the name is:', options: ['A Java package', 'A database name', 'The Eureka service id (spring.application.name)', 'A URL path'], answer: 2, explanation: 'Feign looks it up in the registry.' },
    { question: 'Spring Cloud Gateway (classic) is built on:', options: ['Servlet API', 'JSP', 'Struts', 'Spring WebFlux'], answer: 3, explanation: 'Reactive Netty-based stack.' },
    { question: 'Which pattern stops calling a failing service temporarily?', options: ['Saga', 'Circuit Breaker', 'CQRS', 'Sidecar'], answer: 1, explanation: 'Circuit breaker opens after repeated failures.' },
  ],
};
