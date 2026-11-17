export default {
  id: 'day-07-restcontroller-mappings-responseentity',
  title: '@RestController, @GetMapping/@PostMapping/@PutMapping/@DeleteMapping, @RequestBody, ResponseEntity',
  module: 'Module 2: REST APIs',
  day: 7,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Master the Spring Web annotations used in every REST API: @RestController, @RequestMapping and its shortcuts, @PathVariable, @RequestParam, @RequestHeader, @RequestBody, and full control over the response using ResponseEntity.',
  objectives: [
    'Explain @Controller vs @RestController and what @ResponseBody does',
    'Use @RequestMapping at class level and @GetMapping, @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping at method level',
    'Read data from path, query string, headers and JSON body',
    'Return custom status codes, headers and bodies with ResponseEntity',
    'Understand how Jackson converts JSON to Java objects and back',
  ],
  theory: [
    {
      heading: '@Controller vs @RestController',
      content:
        '@Controller is used for MVC web pages: methods return a VIEW name (like "home") which is resolved to an HTML template.\n@RestController = @Controller + @ResponseBody. Every method\'s return value is written DIRECTLY into the HTTP response body, converted to JSON by Jackson (via HttpMessageConverter).\n\nRequest flow in words:\nPostman -> embedded Tomcat -> DispatcherServlet (front controller) -> HandlerMapping finds the method for URL + HTTP method -> arguments resolved (@PathVariable, @RequestBody ...) -> your method runs -> return value -> HttpMessageConverter (Jackson) -> JSON response.',
      points: [
        'Analogy: DispatcherServlet is a hotel receptionist who reads your request and sends you to the right department (controller method)',
        'If you use @Controller and return an object without @ResponseBody, Spring looks for a view with that name and fails',
      ],
    },
    {
      heading: 'Request Mapping Annotations',
      content:
        '@RequestMapping maps URLs to classes/methods. At class level it sets a common prefix. The method-level shortcuts are clearer:\n@GetMapping = @RequestMapping(method = GET), @PostMapping, @PutMapping, @PatchMapping, @DeleteMapping.',
      syntax: '@RestController\n@RequestMapping("/api/students")\npublic class StudentController {\n    @GetMapping                 // GET /api/students\n    @GetMapping("/{id}")        // GET /api/students/5\n    @PostMapping                // POST /api/students\n    @PutMapping("/{id}")        // PUT /api/students/5\n    @DeleteMapping("/{id}")     // DELETE /api/students/5\n}',
      points: [
        'Multiple paths: @GetMapping({"/all", "/list"})',
        'Restrict content types: @PostMapping(consumes = "application/json", produces = "application/json")',
        'Regex in path: @GetMapping("/{id:[0-9]+}") matches digits only',
        'Two methods with the same URL + HTTP method -> startup error "Ambiguous mapping"',
      ],
    },
    {
      heading: 'Reading Request Data',
      content: 'Spring offers an annotation for each place data can come from:',
      points: [
        '@PathVariable: from the URL path /students/{id}. Name must match or use @PathVariable("id") Long studentId',
        '@RequestParam: from query string ?page=0&size=5. Required by default; use required=false or defaultValue',
        '@RequestHeader: from HTTP headers like Authorization, X-Request-Id',
        '@RequestBody: converts the JSON body into a Java object (Jackson). Needs Content-Type: application/json. Only ONE @RequestBody per method',
        '@CookieValue: from a cookie; HttpServletRequest: raw request if really needed',
        'Missing required @RequestParam -> 400 Bad Request; wrong type (abc for Long) -> 400',
      ],
    },
    {
      heading: 'ResponseEntity',
      content:
        'ResponseEntity<T> represents the whole HTTP response: status code + headers + body. Use it when you need anything other than 200 OK with a body.\n\nAnalogy: returning just an object is like handing over a letter. Returning ResponseEntity is like sending a courier package where you also choose the label (status), stickers (headers) and contents (body).',
      syntax: 'return ResponseEntity.ok(student);                                     // 200 + body\nreturn ResponseEntity.status(HttpStatus.CREATED).body(saved);          // 201\nreturn ResponseEntity.created(URI.create("/api/students/" + id)).body(saved); // 201 + Location\nreturn ResponseEntity.noContent().build();                             // 204\nreturn ResponseEntity.notFound().build();                              // 404\nreturn ResponseEntity.badRequest().body(Map.of("error", "Invalid"));  // 400\nreturn ResponseEntity.ok().header("X-Total-Count", "42").body(list);  // custom header',
      points: [
        'Alternative: @ResponseStatus(HttpStatus.CREATED) on the method for a fixed status',
        'ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(id).toUri() builds a full Location URL',
      ],
    },
    {
      heading: 'JSON Conversion with Jackson',
      content:
        'Jackson maps JSON fields to Java fields by NAME. For classes it needs a no-arg constructor + setters (or a constructor annotated for Jackson); records work out of the box. Unknown JSON fields are ignored by default in Spring Boot.\n\nUseful annotations: @JsonProperty("full_name") rename, @JsonIgnore hide a field, @JsonFormat(pattern="dd-MM-yyyy") for dates, @JsonInclude(NON_NULL) skip nulls.',
      points: [
        'Common mistake: sending JSON with Postman Body type "Text" instead of "JSON" -> 415 Unsupported Media Type',
        'Common mistake: malformed JSON (missing comma/quote) -> 400 "JSON parse error"',
        'Common mistake: private fields without getters in a class -> empty {} in response',
        'spring.jackson.property-naming-strategy=SNAKE_CASE changes all names globally',
      ],
    },
  ],
  examples: [
    {
      title: 'Product API with All Mapping Annotations and ResponseEntity',
      scenario: 'An in-memory Product REST API (no database yet) using every mapping annotation and returning correct status codes. We keep a simple service class so the controller stays thin.',
      steps: [
        'Project: Spring Boot 3.3.x, Java 17, dependencies: Spring Web, DevTools',
        'Create package product with Product.java, ProductService.java and ProductController.java',
        'IntelliJ: right-click package > New > Java Class; STS: right-click package > New > Class',
        'Run the app (IntelliJ ▶ on main / STS Run As > Spring Boot App)',
        'Create a Postman collection "Product API" and send the requests listed in the result, using Body > raw > JSON for POST/PUT/PATCH',
      ],
      code: `// ===== application.properties =====
spring.application.name=product-api
server.port=8080

// ===== product/Product.java =====
package com.example.productapi.product;

public class Product {
    private Long id;
    private String name;
    private double price;
    private int stock;

    public Product() { }

    public Product(Long id, String name, double price, int stock) {
        this.id = id; this.name = name; this.price = price; this.stock = stock;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getPrice() { return price; }
    public void setPrice(double price) { this.price = price; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
}

// ===== product/ProductService.java =====
package com.example.productapi.product;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.stereotype.Service;

@Service
public class ProductService {
    private final Map<Long, Product> store = new ConcurrentHashMap<>();
    private final AtomicLong seq = new AtomicLong();

    public ProductService() {
        save(new Product(null, "Laptop", 55000, 10));
        save(new Product(null, "Mouse", 499, 150));
    }

    public List<Product> findAll(Double maxPrice) {
        return store.values().stream()
                .filter(p -> maxPrice == null || p.getPrice() <= maxPrice)
                .sorted(Comparator.comparing(Product::getId))
                .toList();
    }

    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public Product save(Product p) {
        if (p.getId() == null) p.setId(seq.incrementAndGet());
        store.put(p.getId(), p);
        return p;
    }

    public boolean delete(Long id) {
        return store.remove(id) != null;
    }
}

// ===== product/ProductController.java =====
package com.example.productapi.product;

import java.net.URI;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService service;

    public ProductController(ProductService service) {
        this.service = service;
    }

    // GET /api/products?maxPrice=1000
    @GetMapping
    public ResponseEntity<List<Product>> getAll(@RequestParam(required = false) Double maxPrice) {
        List<Product> list = service.findAll(maxPrice);
        return ResponseEntity.ok()
                .header("X-Total-Count", String.valueOf(list.size()))
                .body(list);
    }

    // GET /api/products/1
    @GetMapping("/{id}")
    public ResponseEntity<Product> getOne(@PathVariable Long id) {
        return service.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // POST /api/products
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        product.setId(null);                       // server decides the id
        Product saved = service.save(product);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}").buildAndExpand(saved.getId()).toUri();
        return ResponseEntity.created(location).body(saved);
    }

    // PUT /api/products/1  (replace)
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        if (service.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        product.setId(id);
        return ResponseEntity.ok(service.save(product));
    }

    // PATCH /api/products/1/stock  body: {"stock": 25}
    @PatchMapping("/{id}/stock")
    public ResponseEntity<?> updateStock(@PathVariable Long id, @RequestBody Map<String, Integer> body) {
        Integer stock = body.get("stock");
        if (stock == null || stock < 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "stock must be 0 or more"));
        }
        return service.findById(id)
                .<ResponseEntity<?>>map(p -> { p.setStock(stock); return ResponseEntity.ok(p); })
                .orElse(ResponseEntity.notFound().build());
    }

    // DELETE /api/products/1
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return service.delete(id)
                ? ResponseEntity.noContent().build()
                : ResponseEntity.notFound().build();
    }
}`,
      result: `1) GET http://localhost:8080/api/products
   200 OK   Header X-Total-Count: 2
   [
     { "id": 1, "name": "Laptop", "price": 55000.0, "stock": 10 },
     { "id": 2, "name": "Mouse", "price": 499.0, "stock": 150 }
   ]

2) GET http://localhost:8080/api/products?maxPrice=1000
   200 OK   [ { "id": 2, "name": "Mouse", "price": 499.0, "stock": 150 } ]

3) POST http://localhost:8080/api/products
   Body: { "name": "Keyboard", "price": 1299, "stock": 40 }
   201 Created   Location: http://localhost:8080/api/products/3
   { "id": 3, "name": "Keyboard", "price": 1299.0, "stock": 40 }

4) PUT http://localhost:8080/api/products/3
   Body: { "name": "Mechanical Keyboard", "price": 3499, "stock": 20 }
   200 OK   { "id": 3, "name": "Mechanical Keyboard", "price": 3499.0, "stock": 20 }

5) PATCH http://localhost:8080/api/products/3/stock   Body: { "stock": 25 }
   200 OK   { "id": 3, "name": "Mechanical Keyboard", "price": 3499.0, "stock": 25 }

6) PATCH .../3/stock   Body: { "stock": -5 }
   400 Bad Request   { "error": "stock must be 0 or more" }

7) DELETE http://localhost:8080/api/products/3   -> 204 No Content
8) GET    http://localhost:8080/api/products/3   -> 404 Not Found`,
      explanation: 'The class-level @RequestMapping gives the /api/products prefix. Each method chooses its status via ResponseEntity. ServletUriComponentsBuilder builds a full Location URL from the current request. Jackson prints double values with a decimal point (55000.0).',
    },
    {
      title: '@RequestHeader, @PathVariable with Regex and @ResponseStatus',
      scenario: 'Read an API key header, accept only numeric ids, and return 201 with @ResponseStatus instead of ResponseEntity.',
      steps: [
        'Create DemoController in the controller package',
        'Postman: GET http://localhost:8080/api/demo/orders/15 with header X-API-KEY: abc123',
        'Try /api/demo/orders/abc - it will be 404 because the regex does not match',
        'Postman: POST http://localhost:8080/api/demo/feedback with a JSON body',
      ],
      code: `package com.example.productapi.controller;

import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/demo")
public class DemoController {

    @GetMapping("/orders/{id:[0-9]+}")
    public ResponseEntity<Map<String, Object>> order(@PathVariable Long id,
                                                     @RequestHeader("X-API-KEY") String apiKey) {
        if (!"abc123".equals(apiKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid API key"));
        }
        return ResponseEntity.ok(Map.of("orderId", id, "status", "SHIPPED"));
    }

    public record Feedback(String user, int rating, String comment) { }

    @PostMapping("/feedback")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> feedback(@RequestBody Feedback fb) {
        return Map.of("message", "Thanks " + fb.user() + ", you rated " + fb.rating() + "/5");
    }
}`,
      result: `GET /api/demo/orders/15   (X-API-KEY: abc123)
200 OK  { "orderId": 15, "status": "SHIPPED" }   (key order may vary with Map.of)

GET /api/demo/orders/15   (X-API-KEY: wrong)
401 Unauthorized  { "error": "Invalid API key" }

GET /api/demo/orders/15   (no header)
400 Bad Request  (Required request header 'X-API-KEY' is not present)

GET /api/demo/orders/abc  -> 404 Not Found

POST /api/demo/feedback
Body: { "user": "Meena", "rating": 5, "comment": "Great course" }
201 Created  { "message": "Thanks Meena, you rated 5/5" }`,
      explanation: 'A required @RequestHeader that is missing gives 400 automatically. The {id:[0-9]+} regex prevents non-numeric ids from even reaching the method. @ResponseStatus is handy when the status is always the same.',
    },
    {
      title: 'Customising JSON with Jackson Annotations',
      scenario: 'Hide a password, rename a field, format a date and skip null values in the JSON response.',
      steps: [
        'Create UserResponse class and UserDemoController',
        'Run and GET http://localhost:8080/api/users/demo in Postman',
        'Compare Java field names with the JSON keys',
      ],
      code: `// ===== UserResponse.java =====
package com.example.productapi.controller;

import java.time.LocalDate;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse {
    private Long id;
    @JsonProperty("full_name")
    private String fullName;
    @JsonIgnore
    private String password;
    @JsonFormat(pattern = "dd-MM-yyyy")
    private LocalDate joinedOn;
    private String phone;   // null -> skipped

    public UserResponse(Long id, String fullName, String password, LocalDate joinedOn, String phone) {
        this.id = id; this.fullName = fullName; this.password = password;
        this.joinedOn = joinedOn; this.phone = phone;
    }
    public Long getId() { return id; }
    public String getFullName() { return fullName; }
    public String getPassword() { return password; }
    public LocalDate getJoinedOn() { return joinedOn; }
    public String getPhone() { return phone; }
}

// ===== UserDemoController.java =====
package com.example.productapi.controller;

import java.time.LocalDate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class UserDemoController {
    @GetMapping("/api/users/demo")
    public UserResponse demo() {
        return new UserResponse(1L, "Ravi Kumar", "secret123", LocalDate.of(2024, 1, 15), null);
    }
}`,
      result: `GET http://localhost:8080/api/users/demo
200 OK
{
  "id": 1,
  "joinedOn": "15-01-2024",
  "full_name": "Ravi Kumar"
}
(password hidden by @JsonIgnore, phone skipped because it is null; key order may differ)`,
      explanation: 'Jackson uses getters to build JSON. @JsonProperty renamed fullName, @JsonIgnore removed password (never leak passwords!), @JsonFormat formatted the LocalDate and @JsonInclude(NON_NULL) dropped null fields.',
    },
  ],
  interview: [
    { q: 'Difference between @Controller and @RestController?', a: '@RestController = @Controller + @ResponseBody, so return values are serialized directly to the response body (JSON). @Controller returns view names for server-side rendering unless @ResponseBody is added.', level: 'Easy' },
    { q: 'What does @RequestBody do?', a: 'It tells Spring to read the HTTP request body and convert it (via HttpMessageConverter, usually Jackson) into the method parameter object.', level: 'Easy' },
    { q: 'Difference between @PathVariable and @RequestParam?', a: '@PathVariable extracts values from the URI path template (/users/{id}); @RequestParam extracts query string or form parameters (?page=1). @RequestParam supports required and defaultValue.', level: 'Easy' },
    { q: 'What is ResponseEntity and why use it?', a: 'A class representing the full HTTP response (status, headers, body). It lets you return 201 with Location, 204, 404, custom headers, etc., instead of always 200.', level: 'Easy' },
    { q: 'What is DispatcherServlet?', a: 'The front controller of Spring MVC. It receives all requests, finds the handler via HandlerMapping, invokes it through HandlerAdapter, and writes the result using message converters or view resolvers. Spring Boot auto-configures it.', level: 'Medium' },
    { q: 'What happens when the request Content-Type is text/plain but the method has @RequestBody Product?', a: 'No converter can read text/plain into Product, so Spring returns 415 Unsupported Media Type.', level: 'Medium' },
    { q: 'Can a method have two @RequestBody parameters?', a: 'No. The body stream can be read only once. Wrap both objects in one DTO instead.', level: 'Medium' },
    { q: 'How does Spring convert an object to JSON?', a: 'MappingJackson2HttpMessageConverter (auto-configured when Jackson is on the classpath) serializes the return value using an ObjectMapper, based on getters/record components and Jackson annotations.', level: 'Medium' },
    { q: 'What is the use of produces and consumes in mapping annotations?', a: 'consumes restricts the request Content-Type the method accepts; produces restricts/declares the response media type matched against the Accept header. Mismatches give 415 or 406.', level: 'Hard' },
    { q: 'What happens if two methods have the same URL and HTTP method?', a: 'Startup fails with IllegalStateException: Ambiguous mapping.', level: 'Medium' },
    { q: '@ResponseStatus vs ResponseEntity?', a: '@ResponseStatus sets a fixed status for a method or exception class; ResponseEntity allows choosing status and headers dynamically at runtime.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a CalculatorController with GET /api/calc/add?a=5&b=7 returning {"result":12} and GET /api/calc/divide/{a}/{b} returning 400 with an error message when b is 0.',
      hint: '@RequestParam for add, @PathVariable for divide, ResponseEntity for errors.',
      solution: `@RestController
@RequestMapping("/api/calc")
public class CalculatorController {

    @GetMapping("/add")
    public Map<String, Integer> add(@RequestParam int a, @RequestParam int b) {
        return Map.of("result", a + b);
    }

    @GetMapping("/divide/{a}/{b}")
    public ResponseEntity<Map<String, Object>> divide(@PathVariable int a, @PathVariable int b) {
        if (b == 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "Cannot divide by zero"));
        }
        return ResponseEntity.ok(Map.of("result", a / b));
    }
}
// GET /api/calc/add?a=5&b=7      -> 200 {"result":12}
// GET /api/calc/divide/10/0      -> 400 {"error":"Cannot divide by zero"}`,
    },
    {
      task: 'Create a TodoController (in-memory list) with GET all, POST create (201), PUT /{id}/done to mark done, DELETE /{id} (204).',
      hint: 'Use a record Todo(Long id, String title, boolean done) and a LinkedHashMap.',
      solution: `@RestController
@RequestMapping("/api/todos")
public class TodoController {
    public record Todo(Long id, String title, boolean done) { }

    private final Map<Long, Todo> todos = new LinkedHashMap<>();
    private long next = 1;

    @GetMapping
    public Collection<Todo> all() { return todos.values(); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Todo create(@RequestBody Todo req) {
        Todo t = new Todo(next++, req.title(), false);
        todos.put(t.id(), t);
        return t;
    }

    @PutMapping("/{id}/done")
    public ResponseEntity<Todo> done(@PathVariable Long id) {
        Todo t = todos.get(id);
        if (t == null) return ResponseEntity.notFound().build();
        Todo d = new Todo(id, t.title(), true);
        todos.put(id, d);
        return ResponseEntity.ok(d);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return todos.remove(id) != null ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }
}
// POST /api/todos {"title":"Learn ResponseEntity"} -> 201 {"id":1,"title":"Learn ResponseEntity","done":false}`,
    },
    {
      task: 'Add an endpoint GET /api/products/count that returns only a header X-Total-Count with the number of products and status 200 with empty body.',
      hint: 'ResponseEntity.ok().header(...).build().',
      solution: `@GetMapping("/count")
public ResponseEntity<Void> count() {
    int total = service.findAll(null).size();
    return ResponseEntity.ok().header("X-Total-Count", String.valueOf(total)).build();
}`,
    },
    {
      task: 'Make POST /api/products accept only JSON and produce only JSON. What status does Postman show if you send Body type Text?',
      hint: 'Use consumes and produces with MediaType constants.',
      solution: `@PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE,
             produces = MediaType.APPLICATION_JSON_VALUE)
public ResponseEntity<Product> create(@RequestBody Product product) { ... }

// Sending Body > raw > Text  -> 415 Unsupported Media Type`,
    },
  ],
  quiz: [
    {
      question: '@RestController is equal to:',
      options: ['@Component + @Service', '@Controller + @ResponseBody', '@Controller + @RequestMapping', '@Configuration + @ResponseBody'],
      answer: 1,
      explanation: 'It adds @ResponseBody to every handler method.',
    },
    {
      question: 'Which builds a 204 response?',
      options: ['ResponseEntity.ok().build()', 'ResponseEntity.created(uri).build()', 'ResponseEntity.accepted().build()', 'ResponseEntity.noContent().build()'],
      answer: 3,
      explanation: 'noContent() = 204 No Content.',
    },
    {
      question: 'URL /api/students?page=2 - how do you read page?',
      options: ['@RequestParam int page', '@PathVariable int page', '@RequestBody int page', '@RequestHeader int page'],
      answer: 0,
      explanation: 'Query string values are read with @RequestParam.',
    },
    {
      question: 'A required @RequestParam is missing. Response status?',
      options: ['404', '500', '400', '415'],
      answer: 2,
      explanation: 'MissingServletRequestParameterException maps to 400 Bad Request.',
    },
    {
      question: 'Which annotation hides a field from JSON output?',
      options: ['@JsonProperty', '@JsonIgnore', '@Transient only', '@JsonInclude'],
      answer: 1,
      explanation: '@JsonIgnore excludes the property during serialization and deserialization.',
    },
  ],
};
