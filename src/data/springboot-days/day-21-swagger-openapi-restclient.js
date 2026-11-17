export default {
  id: 'day-21-swagger-openapi-restclient',
  title: 'Swagger / OpenAPI Documentation, Calling External APIs (RestClient / WebClient)',
  module: 'Module 5: Advanced',
  day: 21,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Generate interactive API documentation with springdoc-openapi (Swagger UI), document a JWT-secured API, and call other REST services from Spring Boot using the modern RestClient (blocking) and WebClient (reactive).',
  objectives: [
    'Explain OpenAPI vs Swagger and add springdoc-openapi to a Spring Boot 3 project',
    'Document endpoints with @Tag, @Operation, @ApiResponse, @Schema',
    'Configure JWT Bearer authentication in Swagger UI and permit docs URLs in Spring Security',
    'Call external REST APIs with RestClient (GET/POST, error handling, timeouts)',
    'Know when to use WebClient and how RestTemplate fits in',
  ],
  theory: [
    {
      heading: '1. OpenAPI and Swagger',
      content: 'OpenAPI Specification (OAS 3) is a standard JSON/YAML description of a REST API: endpoints, parameters, request/response schemas, security. Swagger UI is a web page that reads this description and lets you try requests from the browser. Analogy: OpenAPI is the restaurant menu card (structured description); Swagger UI is a waiter who lets you order straight from the menu.',
      points: [
        'springdoc-openapi scans your controllers at runtime and generates the spec automatically',
        'Spring Boot 3 needs springdoc-openapi-starter-webmvc-ui 2.x (the old springfox and springdoc 1.x do NOT work with Boot 3)',
        'Spec URL: /v3/api-docs (JSON), /v3/api-docs.yaml; UI: /swagger-ui.html (redirects to /swagger-ui/index.html)',
        'Frontend teams and testers use the spec to generate clients (openapi-generator) and mock servers',
      ],
    },
    {
      heading: '2. Documenting with Annotations',
      content: 'Without annotations you already get endpoints and schemas. Annotations add human-friendly descriptions, examples and response codes.',
      syntax: `@Tag(name = "Products", description = "Product catalogue operations")
@Operation(summary = "Get product by id", description = "Returns 404 if not found")
@ApiResponses({
    @ApiResponse(responseCode = "200", description = "Found"),
    @ApiResponse(responseCode = "404", description = "Not found")
})
@Parameter(description = "Product id", example = "1")
@Schema(description = "Price in INR", example = "499.0")   // on DTO fields
@Hidden                                                       // hide an endpoint`,
      tip: 'Global info (title, version, contact) goes into an OpenAPI @Bean or @OpenAPIDefinition. Disable docs in production with springdoc.api-docs.enabled=false if the API is private.',
    },
    {
      heading: '3. Swagger UI with JWT Security',
      content: 'If your API uses JWT, Swagger UI needs an "Authorize" button. Declare a security scheme of type HTTP bearer and apply it. Also permit the docs URLs in your SecurityFilterChain; otherwise Swagger UI itself returns 401.',
      syntax: `@SecurityScheme(name = "bearerAuth", type = SecuritySchemeType.HTTP,
                scheme = "bearer", bearerFormat = "JWT")
@OpenAPIDefinition(security = @SecurityRequirement(name = "bearerAuth"))

.requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()`,
    },
    {
      heading: '4. Calling Other APIs: RestTemplate, RestClient, WebClient',
      content: 'Applications often call other services: payment gateways, weather APIs, other microservices. Spring offers three HTTP clients.',
      points: [
        'RestTemplate – old, blocking, template-method style; in maintenance mode (still works)',
        'RestClient – Spring 6.1 / Boot 3.2+, blocking, modern fluent API. Recommended for normal Spring MVC apps',
        'WebClient – from spring-webflux, non-blocking/reactive (Mono/Flux), good for many parallel calls or streaming',
        'HTTP Interface clients (@HttpExchange) – declare a Java interface; Spring generates the client (backed by RestClient or WebClient)',
      ],
      syntax: `RestClient client = RestClient.builder().baseUrl("https://api.example.com").build();
User u = client.get().uri("/users/{id}", 1).retrieve().body(User.class);`,
    },
    {
      heading: '5. Robust External Calls',
      content: 'External services are slow or fail sometimes. Always set connect/read timeouts, handle 4xx/5xx with onStatus(), map responses to records, and never let a remote failure crash your API — return a friendly error or a fallback. Analogy: when you call a shop and nobody answers, you hang up after 30 seconds instead of waiting forever.',
      points: [
        'Inject RestClient.Builder (auto-configured by Boot with Jackson converters) and build one client per remote service',
        'retrieve().onStatus(HttpStatusCode::is4xxClientError, (req, res) -> { throw ... })',
        'Default errors: HttpClientErrorException (4xx), HttpServerErrorException (5xx), ResourceAccessException (timeout/connection)',
        'For retries and circuit breakers use Spring Retry or Resilience4j (Day 22)',
      ],
    },
  ],
  examples: [
    {
      title: 'Example 1: Add Swagger UI to the Product API',
      scenario: 'The frontend team wants live documentation of the Product API with try-it-out support.',
      steps: [
        'Open the product-api project. Add the springdoc dependency (2.8.x for Boot 3.4/3.5; 2.6.x for Boot 3.3; check the springdoc compatibility table)',
        'IntelliJ: Maven tool window > Reload All Maven Projects; STS: right-click project > Maven > Update Project',
        'Create config/OpenApiConfig.java with API info',
        'Annotate ProductController and ProductDto as below',
        'Run the app and open http://localhost:8080/swagger-ui.html',
        'Expand GET /api/products/{id} > Try it out > id = 1 > Execute; see the curl command, URL and response',
      ],
      code: `<!-- ===== pom.xml ===== -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.8.6</version>
</dependency>

# ===== application.properties =====
springdoc.swagger-ui.path=/swagger-ui.html
springdoc.swagger-ui.operationsSorter=method
springdoc.swagger-ui.tagsSorter=alpha

// ===== config/OpenApiConfig.java =====
package com.shop.product.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import org.springframework.context.annotation.*;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI productOpenApi() {
        return new OpenAPI().info(new Info()
                .title("Product Catalogue API")
                .version("v1")
                .description("CRUD API for products used by the shop frontend")
                .contact(new Contact().name("Backend Team").email("backend@example.com"))
                .license(new License().name("Apache 2.0")));
    }
}

// ===== dto/ProductDto.java =====
package com.shop.product.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;

public record ProductDto(
    @Schema(description = "Generated id", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
    Long id,
    @Schema(description = "Product name", example = "Wireless Mouse")
    @NotBlank String name,
    @Schema(description = "Price in INR", example = "799.0")
    @Positive Double price) {}

// ===== controller/ProductController.java =====
package com.shop.product.controller;

import com.shop.product.dto.ProductDto;
import com.shop.product.service.ProductService;
import io.swagger.v3.oas.annotations.*;
import io.swagger.v3.oas.annotations.responses.*;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products", description = "Create, read, update and delete products")
public class ProductController {
    private final ProductService service;
    public ProductController(ProductService service) { this.service = service; }

    @Operation(summary = "List all products")
    @GetMapping
    public List<ProductDto> all() { return service.all(); }

    @Operation(summary = "Get product by id", description = "Returns 404 when the id does not exist")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Product found"),
        @ApiResponse(responseCode = "404", description = "Product not found")
    })
    @GetMapping("/{id}")
    public ProductDto get(@Parameter(description = "Product id", example = "1")
                          @PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Create a product")
    @ApiResponse(responseCode = "201", description = "Created")
    @PostMapping
    public ResponseEntity<ProductDto> create(@Valid @RequestBody ProductDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(service.create(dto));
    }

    @Operation(summary = "Delete a product")
    @ApiResponse(responseCode = "204", description = "Deleted")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}`,
      result: `Browser: http://localhost:8080/swagger-ui.html
  Product Catalogue API  v1  (OAS 3.0)
  Products – Create, read, update and delete products
    GET    /api/products        List all products
    POST   /api/products        Create a product
    GET    /api/products/{id}   Get product by id
    DELETE /api/products/{id}   Delete a product
  Schemas: ProductDto { id integer($int64) readOnly, name* string, price number($double) }

http://localhost:8080/v3/api-docs  -> {"openapi":"3.0.1","info":{"title":"Product Catalogue API",...},"paths":{...}}`,
      explanation: 'springdoc reads Spring MVC mappings, Jackson types and Bean Validation (@NotBlank → required "*", @Positive → minimum). Annotations only enrich the generated spec. Try it out sends real requests to your running API.',
    },
    {
      title: 'Example 2: Swagger UI for a JWT-secured API',
      scenario: 'The API from Day 18/19 requires a Bearer token. Testers must log in and call secured endpoints from Swagger UI.',
      steps: [
        'Add the @SecurityScheme / @OpenAPIDefinition annotations on a config class',
        'Permit Swagger URLs in SecurityFilterChain',
        'Run, open /swagger-ui.html, call POST /api/auth/login with valid credentials and copy the token',
        'Click the green Authorize 🔒 button, paste ONLY the token (Swagger adds "Bearer "), Authorize, Close',
        'Now call GET /api/profile — the request includes Authorization: Bearer ...',
      ],
      code: `// ===== config/OpenApiSecurityConfig.java =====
package com.demo.secure.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.*;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
    info = @Info(title = "Secure Shop API", version = "v1"),
    security = @SecurityRequirement(name = "bearerAuth"))
@SecurityScheme(
    name = "bearerAuth",
    type = SecuritySchemeType.HTTP,
    scheme = "bearer",
    bearerFormat = "JWT")
public class OpenApiSecurityConfig { }

// ===== SecurityConfig.java (rules) =====
.authorizeHttpRequests(auth -> auth
    .requestMatchers("/api/auth/**").permitAll()
    .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
    .requestMatchers("/api/admin/**").hasRole("ADMIN")
    .anyRequest().authenticated())

// ===== AuthController.java: mark login as public in docs =====
@Operation(summary = "Login and receive a JWT", security = {})   // no lock icon
@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest req) { ... }`,
      result: `Swagger UI shows an "Authorize" button and a lock icon on each operation.

Before authorizing:  GET /api/profile -> 401 {"error":"Unauthorized",...}
After authorizing:   GET /api/profile -> 200 {"username":"sita","authorities":"[ROLE_USER]"}
Curl shown by Swagger:
curl -X GET 'http://localhost:8080/api/profile' -H 'Authorization: Bearer eyJhbGciOi...'`,
      explanation: 'The security scheme tells Swagger UI how to send credentials. security = {} on the login operation removes the requirement for that endpoint in the docs. Permitting /v3/api-docs/** and /swagger-ui/** lets the UI load without a token.',
    },
    {
      title: 'Example 3: Calling an External API with RestClient (and WebClient)',
      scenario: 'Our app shows posts from a public API (https://jsonplaceholder.typicode.com) and creates a post there. Remote errors must become clean responses.',
      steps: [
        'RestClient needs only spring-boot-starter-web (Boot 3.2+). For WebClient add spring-boot-starter-webflux',
        'Add the base URL and timeouts to application.properties',
        'Create config/HttpClientConfig with a RestClient bean',
        'Create client/PostClient service and controller/ExternalController',
        'Run and open http://localhost:8080/api/external/posts/1 (internet required)',
        'IntelliJ tip: Endpoints tool window lists your mappings; STS: Boot Dashboard > right-click app > Show Request Mappings',
      ],
      code: `# ===== application.properties =====
external.posts.base-url=https://jsonplaceholder.typicode.com

// ===== config/HttpClientConfig.java =====
package com.shop.product.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class HttpClientConfig {
    @Bean
    public RestClient postsRestClient(RestClient.Builder builder,
                                      @Value("\${external.posts.base-url}") String baseUrl) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(3000);   // ms
        factory.setReadTimeout(5000);      // ms
        return builder.baseUrl(baseUrl)
                .requestFactory(factory)
                .defaultHeader("Accept", "application/json")
                .build();
    }
}

// ===== client/PostClient.java =====
package com.shop.product.client;

import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.*;
import java.util.List;

@Service
public class PostClient {
    public record Post(Long id, Long userId, String title, String body) {}
    public record NewPost(Long userId, String title, String body) {}

    public static class RemoteApiException extends RuntimeException {
        public RemoteApiException(String msg) { super(msg); }
    }

    private final RestClient client;
    public PostClient(RestClient postsRestClient) { this.client = postsRestClient; }

    public Post getPost(long id) {
        return client.get()
                .uri("/posts/{id}", id)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError, (req, res) -> {
                    throw new RemoteApiException("Post " + id + " not found (" + res.getStatusCode() + ")");
                })
                .body(Post.class);
    }

    public List<Post> postsOfUser(long userId) {
        return client.get()
                .uri(uri -> uri.path("/posts").queryParam("userId", userId).build())
                .retrieve()
                .body(new ParameterizedTypeReference<List<Post>>() {});
    }

    public ResponseEntity<Post> create(NewPost p) {
        return client.post()
                .uri("/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body(p)
                .retrieve()
                .toEntity(Post.class);
    }
}

// ===== controller/ExternalController.java =====
package com.shop.product.controller;

import com.shop.product.client.PostClient;
import com.shop.product.client.PostClient.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.ResourceAccessException;
import java.util.*;

@RestController
@RequestMapping("/api/external")
public class ExternalController {
    private final PostClient posts;
    public ExternalController(PostClient posts) { this.posts = posts; }

    @GetMapping("/posts/{id}")
    public Post one(@PathVariable long id) { return posts.getPost(id); }

    @GetMapping("/users/{userId}/post-count")
    public Map<String, Object> count(@PathVariable long userId) {
        return Map.of("userId", userId, "posts", posts.postsOfUser(userId).size());
    }

    @PostMapping("/posts")
    public ResponseEntity<Post> create(@RequestBody NewPost p) {
        ResponseEntity<Post> remote = posts.create(p);
        return ResponseEntity.status(remote.getStatusCode()).body(remote.getBody());
    }

    @ExceptionHandler(RemoteApiException.class)
    public ResponseEntity<Map<String, String>> remote(RemoteApiException ex) {
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(ResourceAccessException.class)
    public ResponseEntity<Map<String, String>> timeout(ResourceAccessException ex) {
        return ResponseEntity.status(HttpStatus.GATEWAY_TIMEOUT)
                .body(Map.of("error", "Remote service is not reachable"));
    }
}

// ===== OPTIONAL: same GET with WebClient (needs spring-boot-starter-webflux) =====
@Bean
WebClient postsWebClient(WebClient.Builder b) {
    return b.baseUrl("https://jsonplaceholder.typicode.com").build();
}

public Mono<Post> getPostReactive(long id) {
    return webClient.get().uri("/posts/{id}", id)
            .retrieve()
            .bodyToMono(Post.class)
            .timeout(Duration.ofSeconds(5));
}
// In a Spring MVC app you may call .block() to wait for the result.`,
      result: `GET /api/external/posts/1
-> {"id":1,"userId":1,"title":"sunt aut facere repellat provident occaecati excepturi optio reprehenderit","body":"quia et suscipit..."}

GET /api/external/users/1/post-count
-> {"userId":1,"posts":10}

POST /api/external/posts {"userId":1,"title":"Hello","body":"From Spring Boot"}
-> 201 {"id":101,"userId":1,"title":"Hello","body":"From Spring Boot"}
   (jsonplaceholder fakes the create; id is always 101)

GET /api/external/posts/9999
-> 502 {"error":"Post 9999 not found (404 NOT_FOUND)"}`,
      explanation: 'RestClient converts JSON to Java records automatically using Jackson. ParameterizedTypeReference keeps generic type info for List<Post>. onStatus converts remote 4xx into our own exception, which @ExceptionHandler turns into 502 Bad Gateway. Timeouts protect our API from hanging forever. WebClient does the same reactively, returning Mono/Flux.',
    },
  ],
  interview: [
    { q: 'What is the difference between OpenAPI and Swagger?', a: 'OpenAPI is the specification (format) for describing REST APIs. Swagger is the set of tools (Swagger UI, Swagger Editor, Codegen) built around it; the spec was earlier called the Swagger Specification.', level: 'Easy' },
    { q: 'Which library adds OpenAPI docs to Spring Boot 3?', a: 'springdoc-openapi-starter-webmvc-ui (v2.x). Springfox is unmaintained and incompatible with Spring Boot 3.', level: 'Easy' },
    { q: 'What are the default springdoc URLs?', a: '/v3/api-docs for JSON spec, /v3/api-docs.yaml for YAML, and /swagger-ui.html (redirecting to /swagger-ui/index.html) for the UI.', level: 'Easy' },
    { q: 'How do you add JWT support to Swagger UI?', a: 'Declare a @SecurityScheme(type = HTTP, scheme = "bearer", bearerFormat = "JWT") and apply it with @SecurityRequirement (globally via @OpenAPIDefinition or per operation). Also permit the docs URLs in Spring Security.', level: 'Medium' },
    { q: 'RestTemplate vs RestClient vs WebClient?', a: 'RestTemplate: classic blocking client, maintenance mode. RestClient: modern blocking fluent client (Spring 6.1+), recommended for MVC apps. WebClient: non-blocking reactive client from WebFlux, best for high concurrency/streaming.', level: 'Medium' },
    { q: 'How do you handle error responses with RestClient?', a: 'Use retrieve().onStatus(predicate, handler) to throw custom exceptions, or catch HttpClientErrorException/HttpServerErrorException; use exchange() for full manual control.', level: 'Medium' },
    { q: 'Why set timeouts on HTTP clients?', a: 'Without timeouts a slow remote service can block threads indefinitely, exhausting the server thread pool and causing cascading failures.', level: 'Medium' },
    { q: 'How do you deserialize a generic list with RestClient?', a: 'body(new ParameterizedTypeReference<List<Post>>() {}) because Java erases generic types at runtime.', level: 'Hard' },
    { q: 'What is an HTTP Interface (@HttpExchange) client?', a: 'A declarative Java interface with @GetExchange/@PostExchange methods. HttpServiceProxyFactory creates an implementation backed by RestClient or WebClient — similar idea to OpenFeign.', level: 'Hard' },
    { q: 'How can you hide an endpoint from Swagger?', a: 'Annotate it with @Hidden, or configure springdoc.paths-to-exclude / packages-to-scan.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Document an EmployeeController with @Tag, @Operation and response codes 200/404, and add @Schema examples to EmployeeDto.',
      hint: 'Follow Example 1.',
      solution: `@Tag(name = "Employees")
@RestController
@RequestMapping("/api/employees")
public class EmployeeController {
    @Operation(summary = "Get employee")
    @ApiResponses({ @ApiResponse(responseCode = "200", description = "Found"),
                    @ApiResponse(responseCode = "404", description = "Not found") })
    @GetMapping("/{id}")
    public EmployeeDto get(@PathVariable Long id) { return service.get(id); }
}

public record EmployeeDto(
    @Schema(example = "7") Long id,
    @Schema(example = "Asha Rao") String name,
    @Schema(example = "IT") String department) {}`,
    },
    {
      task: 'Use RestClient to fetch a user from https://jsonplaceholder.typicode.com/users/{id} and return only name and email.',
      hint: 'Create a record with only the fields you need; Jackson ignores unknown properties by default in Spring Boot.',
      solution: `public record RemoteUser(String name, String email) {}

@GetMapping("/api/external/users/{id}")
public RemoteUser user(@PathVariable long id) {
    return restClient.get().uri("/users/{id}", id).retrieve().body(RemoteUser.class);
}`,
    },
    {
      task: 'Create an HTTP Interface client for the posts API.',
      hint: '@GetExchange on an interface + HttpServiceProxyFactory with RestClientAdapter.',
      solution: `public interface PostsApi {
    @GetExchange("/posts/{id}")
    PostClient.Post get(@PathVariable long id);
}

@Bean
PostsApi postsApi(RestClient postsRestClient) {
    HttpServiceProxyFactory f = HttpServiceProxyFactory
            .builderFor(RestClientAdapter.create(postsRestClient)).build();
    return f.createClient(PostsApi.class);
}`,
    },
    {
      task: 'Disable Swagger UI and api-docs in the prod profile.',
      hint: 'application-prod.properties.',
      solution: `# application-prod.properties
springdoc.api-docs.enabled=false
springdoc.swagger-ui.enabled=false`,
    },
  ],
  quiz: [
    { question: 'Default URL of the OpenAPI JSON in springdoc:', options: ['/swagger.json', '/api-docs/v2', '/openapi', '/v3/api-docs'], answer: 3, explanation: '/v3/api-docs.' },
    { question: 'Which annotation groups endpoints in Swagger UI?', options: ['@Tag', '@Group', '@Api', '@Category'], answer: 0, explanation: '@Tag(name = "...").' },
    { question: 'RestClient was introduced in:', options: ['Spring 4', 'Spring 5.0', 'Spring Framework 6.1 / Boot 3.2', 'Spring Boot 1.5'], answer: 2, explanation: 'RestClient arrived in Spring 6.1.' },
    { question: 'WebClient returns a single value as:', options: ['Optional', 'Mono', 'Flux', 'Future'], answer: 1, explanation: 'Mono = 0..1, Flux = 0..N.' },
    { question: 'Why must /swagger-ui/** be permitted in Spring Security?', options: ['For CORS', 'To enable CSRF', 'For faster loading', 'Otherwise the UI requires authentication and returns 401'], answer: 3, explanation: 'Docs resources are protected by anyRequest().authenticated().' },
  ],
};
