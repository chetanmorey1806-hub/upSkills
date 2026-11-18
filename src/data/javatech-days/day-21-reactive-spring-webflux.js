export default {
  id: 'day-21-reactive-spring-webflux',
  title: 'Reactive Programming with Spring WebFlux: Mono, Flux, Operators, Functional Endpoints and WebClient',
  module: 'Module 5: Spring Ecosystem Extras',
  day: 21,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Understand blocking vs non-blocking I/O and the reactive streams model, work with Project Reactor Mono and Flux and their operators, build annotated and functional WebFlux endpoints with reactive MongoDB, call other services with WebClient, and decide when WebFlux is better than Spring MVC.',
  objectives: [
    'Explain blocking vs non-blocking I/O, the event loop and backpressure in simple words',
    'Create and transform Mono and Flux using map, filter, flatMap, zip, onErrorResume and more',
    'Build a reactive REST API with @RestController and with RouterFunction/HandlerFunction',
    'Call external APIs with WebClient (retrieve, bodyToMono/Flux, error handling, timeouts)',
    'Choose correctly between Spring MVC and Spring WebFlux and avoid common mistakes like block()',
  ],
  theory: [
    {
      heading: 'Blocking vs Non-Blocking I/O',
      content:
        'Spring MVC uses the thread-per-request model: Tomcat has a pool of about 200 threads. Each request takes one thread, and while the code waits for the database or another API (I/O), that thread just sits idle (blocked). With 200 slow requests in progress, request number 201 must wait.\n\nSpring WebFlux uses a non-blocking, event-loop model (Netty by default): a few threads (usually = number of CPU cores) handle thousands of connections. When code waits for I/O, the thread is released to handle other requests; when the data arrives, a callback continues the work.\n\nAnalogy: A blocking restaurant has one waiter per table who stands next to the kitchen until the food is ready - you need many waiters. A non-blocking restaurant has a few waiters who take an order, give it to the kitchen, and serve other tables; when the kitchen rings the bell, any free waiter delivers the food.\n\nNon-blocking does not make one request faster. It lets the SAME hardware handle MANY MORE concurrent requests, especially when most time is spent waiting for I/O.',
      points: [
        'WebFlux runs on Netty (default), Undertow, or Servlet 3.1+ containers',
        'Whole chain must be non-blocking: a single JDBC call or Thread.sleep blocks an event-loop thread and hurts everyone',
        'Java 21 virtual threads (spring.threads.virtual.enabled=true in Boot 3.2+) give MVC apps high concurrency with simple blocking code - an alternative to WebFlux for many projects',
      ],
    },
    {
      heading: 'Reactive Streams and Project Reactor',
      content:
        'Reactive Streams is a standard (also in Java 9 as java.util.concurrent.Flow) with 4 interfaces: Publisher, Subscriber, Subscription, Processor.\n\nThe flow: Subscriber subscribes -> Publisher calls onSubscribe(subscription) -> Subscriber calls request(n) -> Publisher sends at most n items with onNext(item) -> finally onComplete() or onError(e).\n\nBackpressure: the subscriber controls the speed by requesting only as many items as it can handle - like a student telling the teacher "give me 5 questions at a time".\n\nProject Reactor is the library Spring uses. It has two Publisher types:\n- Mono<T>: 0 or 1 item (like Optional, but async). Example: find student by id.\n- Flux<T>: 0 to N items (like a List/Stream, but async and possibly infinite). Example: all students, live stock prices.\n\nMOST IMPORTANT RULE: Nothing happens until you subscribe. Building a Mono/Flux only describes a pipeline. In WebFlux, the framework subscribes when it writes the response - you just return the Mono/Flux from the controller.',
      syntax: 'Mono<String> m = Mono.just("Hello");\nMono<String> empty = Mono.empty();\nMono<String> err = Mono.error(new RuntimeException("Boom"));\nFlux<Integer> f = Flux.just(1, 2, 3);\nFlux<Integer> r = Flux.range(1, 5);\nFlux<String> fromList = Flux.fromIterable(List.of("a", "b"));\nFlux<Long> ticks = Flux.interval(Duration.ofSeconds(1));   // 0, 1, 2 ... every second\nf.subscribe(System.out::println);',
    },
    {
      heading: 'Common Operators',
      content:
        'Operators return a NEW Mono/Flux; they never change the original (like Java Streams).\n\nTransform: map (sync 1-to-1), flatMap (async: each item -> a Mono/Flux, results merged, order not guaranteed), concatMap (like flatMap but keeps order), flatMapMany (Mono -> Flux).\nFilter: filter, take(n), skip(n), distinct, takeWhile.\nCombine: zip (pair items from sources, waits for all), merge (interleave as they come), concat (one after another), zipWith.\nCollect: collectList (Flux<T> -> Mono<List<T>>), count, reduce.\nError handling: onErrorReturn(value), onErrorResume(e -> fallback Mono), onErrorMap(e -> new MyException()), retry(n), timeout(Duration).\nEmpty handling: defaultIfEmpty(value), switchIfEmpty(otherMono).\nSide effects (logging): doOnNext, doOnError, doOnSubscribe, log().\nThreads: subscribeOn(Schedulers.boundedElastic()) to run unavoidable blocking code on a separate pool; publishOn to switch threads downstream.',
      points: [
        'map vs flatMap: if your function returns a plain value use map; if it returns a Mono/Flux (e.g. a DB or WebClient call) use flatMap',
        'switchIfEmpty(Mono.error(...)) is the reactive way to throw "not found"',
        'Never call block() inside a WebFlux handler - it blocks the event loop and throws IllegalStateException on Netty threads',
      ],
      tip: 'Common mistake: using map with a function that returns a Mono gives Mono<Mono<T>>. If you see nested Mono types, you needed flatMap.',
    },
    {
      heading: 'WebFlux Programming Models',
      content:
        'Dependency: spring-boot-starter-webflux (do NOT add spring-boot-starter-web too - if both are present Boot picks MVC on Tomcat).\n\n1. Annotated controllers - same annotations as MVC (@RestController, @GetMapping, @PathVariable, @RequestBody) but return Mono/Flux.\n\n2. Functional endpoints - routes are defined as beans with RouterFunction, and logic lives in HandlerFunctions that take a ServerRequest and return Mono<ServerResponse>. Lightweight, explicit, easy to test.\n\nData access must also be reactive:\n- Reactive MongoDB: spring-boot-starter-data-mongodb-reactive with ReactiveMongoRepository.\n- SQL: R2DBC (spring-boot-starter-data-r2dbc + r2dbc-mysql / r2dbc-postgresql) with ReactiveCrudRepository. JPA/Hibernate (classic) and JDBC are blocking.\n- Redis: ReactiveRedisTemplate.\n\nStreaming: return Flux with produces = MediaType.TEXT_EVENT_STREAM_VALUE to push Server-Sent Events (SSE) to the browser.',
    },
    {
      heading: 'WebClient',
      content:
        'WebClient is the non-blocking HTTP client from WebFlux (it replaces RestTemplate for reactive code, and can be used in MVC apps too).\n\nCreate: WebClient.builder().baseUrl("https://api.example.com").build() - inject WebClient.Builder (auto-configured) to get Boot settings.\n\nCall:\nwebClient.get().uri("/users/{id}", 1)\n    .retrieve()\n    .onStatus(HttpStatusCode::is4xxClientError, r -> Mono.error(new NotFound()))\n    .bodyToMono(User.class)\n    .timeout(Duration.ofSeconds(3))\n    .retry(2);\n\nretrieve() is the simple way; exchangeToMono() gives full control of the response. bodyToFlux() for JSON arrays/streams. A 4xx/5xx response gives WebClientResponseException by default.',
    },
    {
      heading: 'WebFlux vs Spring MVC - When to Use Which',
      content:
        'Choose Spring MVC (default for most projects) when: the team knows blocking code, you use JPA/JDBC, the app is a normal CRUD business app, or traffic is moderate. With Java 21 virtual threads MVC scales very well.\n\nChoose WebFlux when: very high concurrency with lots of waiting (API gateways - Spring Cloud Gateway is built on WebFlux), streaming data (SSE, live dashboards, chat), calling many remote services in parallel, and the full stack can be reactive (R2DBC, reactive Mongo/Redis).\n\nCosts of WebFlux: harder to learn and debug (long stack traces), every library must be non-blocking, ThreadLocal-based features (MDC logging, some security code) need special handling.',
      points: [
        'MVC: Servlet API, Tomcat, thread-per-request, blocking, imperative style',
        'WebFlux: Reactive Streams, Netty, event loop, non-blocking, declarative/functional style',
        'Both can use @RestController and WebClient',
      ],
    },
  ],
  examples: [
    {
      title: 'Mono and Flux Basics with Operators (Reactor Playground)',
      scenario: 'Practise creating and transforming Mono and Flux in a small Spring Boot app before building an API.',
      steps: [
        'start.spring.io: Maven, Spring Boot 3.3.x, Java 17, Artifact reactive-demo. Dependencies: Spring Reactive Web, Spring Data Reactive MongoDB, Validation > GENERATE',
        'IntelliJ: File > Open > reactive-demo. STS: File > Import > Existing Maven Projects',
        'Create class ReactorPlayground implementing CommandLineRunner (runs at startup)',
        'Run the app and read the console output',
      ],
      code: `<!-- pom.xml -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-webflux</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-mongodb-reactive</artifactId>
</dependency>
<dependency>
    <groupId>io.projectreactor</groupId>
    <artifactId>reactor-test</artifactId>
    <scope>test</scope>
</dependency>

// ReactorPlayground.java
package com.example.reactivedemo;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import java.util.List;

@Component
public class ReactorPlayground implements CommandLineRunner {

    @Override
    public void run(String... args) {
        // 1. Nothing happens without subscribe
        Flux<Integer> numbers = Flux.range(1, 6)
                .doOnNext(n -> System.out.println("emit " + n));
        System.out.println("Pipeline built, not subscribed yet");

        // 2. filter + map + collectList
        numbers.filter(n -> n % 2 == 0)
               .map(n -> n * n)
               .collectList()
               .subscribe(list -> System.out.println("Squares of even: " + list));

        // 3. Mono with empty handling
        Mono.justOrEmpty((String) null)
            .defaultIfEmpty("Guest")
            .map(String::toUpperCase)
            .subscribe(name -> System.out.println("Hello " + name));

        // 4. zip two sources
        Flux<String> names = Flux.just("Ravi", "Sneha", "Amit");
        Flux<Integer> marks = Flux.just(78, 91, 64);
        Flux.zip(names, marks, (n, m) -> n + "=" + m)
            .subscribe(System.out::println);

        // 5. error handling
        Flux.just("10", "x", "30")
            .map(Integer::parseInt)
            .onErrorResume(e -> {
                System.out.println("Error: " + e.getMessage());
                return Flux.just(-1);
            })
            .subscribe(v -> System.out.println("value " + v),
                       e -> System.out.println("never printed"),
                       () -> System.out.println("completed"));

        // 6. reduce
        Flux.fromIterable(List.of(78, 91, 64))
            .reduce(0, Integer::sum)
            .subscribe(total -> System.out.println("Total marks: " + total));
    }
}`,
      result: `Pipeline built, not subscribed yet
emit 1
emit 2
emit 3
emit 4
emit 5
emit 6
Squares of even: [4, 16, 36]
Hello GUEST
Ravi=78
Sneha=91
Amit=64
value 10
Error: For input string: "x"
value -1
completed
Total marks: 233
(followed by the usual "Netty started on port 8080" startup log)`,
      explanation: 'Line 1 prints before any "emit" because Flux.range does nothing until subscribe(). These sources are synchronous (just/range/fromIterable on the calling thread), so the output order is fixed. onErrorResume replaces the failed stream with Flux.just(-1): after "x" fails, "30" is NOT processed - an error always terminates the original sequence. 78 + 91 + 64 = 233.',
    },
    {
      title: 'Reactive CRUD API with @RestController and Reactive MongoDB',
      scenario: 'Build a non-blocking Student API: Netty + WebFlux + ReactiveMongoRepository.',
      steps: [
        'Start MongoDB: docker run -d --name mongo -p 27017:27017 mongo:7',
        'Add the property spring.data.mongodb.uri to application.properties',
        'Create Student, StudentRepository (ReactiveMongoRepository), StudentService and StudentController',
        'Run the app (log shows Netty started on port 8080) and test with Postman',
      ],
      code: `# application.properties
spring.data.mongodb.uri=mongodb://localhost:27017/reactive_db

// Student.java
@Document(collection = "students")
public class Student {
    @Id
    private String id;
    @NotBlank private String name;
    @NotBlank private String course;
    @Min(0) @Max(100) private int marks;
    public Student() { }
    public Student(String id, String name, String course, int marks) {
        this.id = id; this.name = name; this.course = course; this.marks = marks;
    }
    // getters and setters
}

// StudentRepository.java
public interface StudentRepository extends ReactiveMongoRepository<Student, String> {
    Flux<Student> findByCourse(String course);
    Flux<Student> findByMarksGreaterThanEqual(int marks);
}

// StudentService.java
@Service
public class StudentService {
    private final StudentRepository repo;
    public StudentService(StudentRepository repo) { this.repo = repo; }

    public Flux<Student> all() { return repo.findAll(); }

    public Mono<Student> get(String id) {
        return repo.findById(id)
                .switchIfEmpty(Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "Student not found: " + id)));
    }

    public Mono<Student> create(Student s) { s.setId(null); return repo.save(s); }

    public Mono<Student> update(String id, Student s) {
        return get(id)                         // Mono<Student> (or 404 error)
                .flatMap(existing -> {         // flatMap because save returns a Mono
                    existing.setName(s.getName());
                    existing.setCourse(s.getCourse());
                    existing.setMarks(s.getMarks());
                    return repo.save(existing);
                });
    }

    public Mono<Void> delete(String id) { return get(id).flatMap(repo::delete); }
}

// StudentController.java
@RestController
@RequestMapping("/api/students")
public class StudentController {
    private final StudentService service;
    public StudentController(StudentService service) { this.service = service; }

    @GetMapping
    public Flux<Student> all(@RequestParam(required = false) String course) {
        return service.all().filter(s -> course == null || s.getCourse().equalsIgnoreCase(course));
    }

    @GetMapping("/{id}")
    public Mono<Student> one(@PathVariable String id) { return service.get(id); }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Mono<Student> create(@Valid @RequestBody Student s) { return service.create(s); }

    @PutMapping("/{id}")
    public Mono<Student> update(@PathVariable String id, @Valid @RequestBody Student s) {
        return service.update(id, s);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public Mono<Void> delete(@PathVariable String id) { return service.delete(id); }
}`,
      result: `Console:
o.s.b.web.embedded.netty.NettyWebServer : Netty started on port 8080 (http)
Started ReactiveDemoApplication in 2.311 seconds

POST /api/students  {"name":"Ravi","course":"Java","marks":78}
201 Created
{ "id": "66b2a91fd3c4e15a2b7c9e01", "name": "Ravi", "course": "Java", "marks": 78 }

GET /api/students/unknown-id
404 Not Found
{ "timestamp": "2025-06-10T10:15:30.120+00:00", "path": "/api/students/unknown-id", "status": 404, "error": "Not Found", "requestId": "3f2a1c7b-1" }`,
      explanation: 'The code looks like MVC, but every method returns Mono/Flux and nothing blocks: the repository returns a publisher, WebFlux subscribes and writes the JSON when MongoDB answers. switchIfEmpty turns an empty Mono into a 404 error. update uses flatMap because repo.save() returns Mono<Student>; using map would produce Mono<Mono<Student>>. The id values are generated, so yours will differ.',
    },
    {
      title: 'Functional Endpoints with RouterFunction and HandlerFunction',
      scenario: 'Expose the same student read/create operations using the functional style under /fn/students.',
      steps: [
        'Create StudentHandler as a @Component with methods that take ServerRequest and return Mono<ServerResponse>',
        'Create StudentRouter @Configuration with a RouterFunction bean',
        'Run and call GET http://localhost:8080/fn/students and POST http://localhost:8080/fn/students',
      ],
      code: `// StudentHandler.java
package com.example.reactivedemo.fn;

import com.example.reactivedemo.Student;
import com.example.reactivedemo.StudentRepository;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.server.*;
import reactor.core.publisher.Mono;
import java.net.URI;

@Component
public class StudentHandler {
    private final StudentRepository repo;
    public StudentHandler(StudentRepository repo) { this.repo = repo; }

    public Mono<ServerResponse> all(ServerRequest req) {
        return ServerResponse.ok().contentType(MediaType.APPLICATION_JSON)
                .body(repo.findAll(), Student.class);
    }

    public Mono<ServerResponse> one(ServerRequest req) {
        String id = req.pathVariable("id");
        return repo.findById(id)
                .flatMap(s -> ServerResponse.ok().bodyValue(s))
                .switchIfEmpty(ServerResponse.notFound().build());
    }

    public Mono<ServerResponse> create(ServerRequest req) {
        return req.bodyToMono(Student.class)
                .flatMap(repo::save)
                .flatMap(saved -> ServerResponse
                        .created(URI.create("/fn/students/" + saved.getId()))
                        .bodyValue(saved));
    }
}

// StudentRouter.java
package com.example.reactivedemo.fn;

import org.springframework.context.annotation.*;
import org.springframework.web.reactive.function.server.*;
import static org.springframework.web.reactive.function.server.RequestPredicates.*;

@Configuration
public class StudentRouter {

    @Bean
    public RouterFunction<ServerResponse> studentRoutes(StudentHandler h) {
        return RouterFunctions.route()
                .path("/fn/students", builder -> builder
                        .GET("", h::all)
                        .GET("/{id}", h::one)
                        .POST("", accept(org.springframework.http.MediaType.APPLICATION_JSON), h::create))
                .build();
    }
}`,
      result: `POST /fn/students  {"name":"Sneha","course":"Python","marks":91}
201 Created
Location: /fn/students/66b2aa07d3c4e15a2b7c9e02
{ "id": "66b2aa07d3c4e15a2b7c9e02", "name": "Sneha", "course": "Python", "marks": 91 }

GET /fn/students/doesnotexist -> 404 Not Found (empty body)

GET /fn/students
[ { "id": "66b2a91fd3c4e15a2b7c9e01", "name": "Ravi", "course": "Java", "marks": 78 },
  { "id": "66b2aa07d3c4e15a2b7c9e02", "name": "Sneha", "course": "Python", "marks": 91 } ]`,
      explanation: 'The router maps HTTP method + path to a handler method reference - all routes are visible in one place, with no annotations on the handler. ServerResponse.created() sets the Location header. Functional and annotated endpoints can live in the same application.',
    },
    {
      title: 'WebClient: Calling External APIs in Parallel with Timeout and Fallback',
      scenario: 'Build a profile endpoint that calls two public APIs (user and posts) at the same time and combines the results.',
      steps: [
        'Create WebClientConfig with a WebClient bean (base URL https://jsonplaceholder.typicode.com - a free fake REST API)',
        'Create records User and Post, and ProfileService using Mono.zip',
        'Call GET http://localhost:8080/api/profile/1 and compare the time with two sequential calls',
      ],
      code: `// WebClientConfig.java
@Configuration
public class WebClientConfig {
    @Bean
    public WebClient placeholderClient(WebClient.Builder builder) {
        return builder.baseUrl("https://jsonplaceholder.typicode.com").build();
    }
}

// records
public record User(Long id, String name, String email) { }
public record Post(Long id, Long userId, String title) { }
public record Profile(User user, int postCount, List<String> titles) { }

// ProfileService.java
@Service
public class ProfileService {
    private static final Logger log = LoggerFactory.getLogger(ProfileService.class);
    private final WebClient client;
    public ProfileService(WebClient placeholderClient) { this.client = placeholderClient; }

    public Mono<User> user(Long id) {
        return client.get().uri("/users/{id}", id)
                .retrieve()
                .onStatus(HttpStatusCode::is4xxClientError,
                          r -> Mono.error(new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found")))
                .bodyToMono(User.class)
                .timeout(Duration.ofSeconds(3));
    }

    public Mono<List<Post>> posts(Long userId) {
        return client.get().uri(uri -> uri.path("/posts").queryParam("userId", userId).build())
                .retrieve()
                .bodyToFlux(Post.class)
                .take(3)                                  // only first 3 posts
                .collectList()
                .timeout(Duration.ofSeconds(3))
                .doOnError(e -> log.warn("Posts service failed: {}", e.toString()))
                .onErrorReturn(List.of());                // fallback: empty list
    }

    public Mono<Profile> profile(Long id) {
        return Mono.zip(user(id), posts(id))              // both calls start together
                .map(t -> new Profile(t.getT1(), t.getT2().size(),
                        t.getT2().stream().map(Post::title).toList()));
    }
}

// ProfileController.java
@RestController
public class ProfileController {
    private final ProfileService service;
    public ProfileController(ProfileService service) { this.service = service; }

    @GetMapping("/api/profile/{id}")
    public Mono<Profile> profile(@PathVariable Long id) { return service.profile(id); }
}`,
      result: `GET /api/profile/1  -> 200 OK
{
  "user": { "id": 1, "name": "Leanne Graham", "email": "Sincere@april.biz" },
  "postCount": 3,
  "titles": [
    "sunt aut facere repellat provident occaecati excepturi optio reprehenderit",
    "qui est esse",
    "ea molestias quasi exercitationem repellat qui ipsa sit aut"
  ]
}
GET /api/profile/999 -> 404 Not Found ("User not found")
If the posts call is slower than 3 s -> log "Posts service failed: java.util.concurrent.TimeoutException ..." and postCount 0, titles [].`,
      explanation: 'Mono.zip subscribes to both calls at once, so total time is about the slower of the two instead of their sum. retrieve() + onStatus maps a 404 from the remote API to our own 404. timeout + onErrorReturn give graceful degradation: the profile still works when the posts service is slow. The data shown is what jsonplaceholder returns for user 1; requires internet access.',
    },
    {
      title: 'Server-Sent Events Stream and Testing with StepVerifier',
      scenario: 'Push a live price tick every second to the browser and unit-test a Flux without starting the server.',
      steps: [
        'Add the PriceController below and open http://localhost:8080/api/prices/stream in Chrome (or curl -N)',
        'Create src/test/java/.../FluxTest.java and run it: right-click > Run \'FluxTest\'',
      ],
      code: `// PriceController.java
@RestController
public class PriceController {
    @GetMapping(value = "/api/prices/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<String> prices() {
        return Flux.interval(Duration.ofSeconds(1))
                .map(i -> "TCS price: " + (3800 + i * 5))
                .take(5);
    }
}

// FluxTest.java (JUnit 5 + reactor-test)
import org.junit.jupiter.api.Test;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.test.StepVerifier;

class FluxTest {

    @Test
    void evenSquares() {
        Flux<Integer> flux = Flux.range(1, 6).filter(n -> n % 2 == 0).map(n -> n * n);
        StepVerifier.create(flux)
                .expectNext(4, 16, 36)
                .verifyComplete();
    }

    @Test
    void errorIsReported() {
        Mono<Integer> mono = Mono.just("x").map(Integer::parseInt);
        StepVerifier.create(mono)
                .expectError(NumberFormatException.class)
                .verify();
    }
}`,
      result: `Browser / curl -N output (one line per second):
data:TCS price: 3800

data:TCS price: 3805

data:TCS price: 3810

data:TCS price: 3815

data:TCS price: 3820

Then the stream completes.

Test run: Tests passed: 2 of 2`,
      explanation: 'Flux.interval emits 0, 1, 2... every second; map turns i into a price 3800 + i*5 and take(5) stops after five items. With text/event-stream each item is sent immediately as an SSE "data:" line instead of waiting for the whole list. StepVerifier subscribes to the publisher and checks each signal - the standard way to test reactive code.',
    },
  ],
  interview: [
    { q: 'What is reactive programming?', a: 'A programming style based on asynchronous data streams and the propagation of change. You declare a pipeline of operations on data that arrives over time; the code reacts to events (next item, error, completion) instead of waiting. It is non-blocking and supports backpressure.', level: 'Easy' },
    { q: 'Difference between Mono and Flux?', a: 'Both are Reactor Publishers. Mono emits 0 or 1 item then completes (or errors) - for single results like findById. Flux emits 0 to N items (can be infinite) - for lists and streams.', level: 'Easy' },
    { q: 'What does "nothing happens until you subscribe" mean?', a: 'Creating a Mono/Flux and applying operators only builds a description of the work. Data starts flowing only when something subscribes. In WebFlux the framework subscribes to the publisher returned by the controller; in plain code you call subscribe(). Forgetting this is why "my save did not run" bugs happen.', level: 'Medium' },
    { q: 'What is backpressure?', a: 'A mechanism where the consumer tells the producer how many items it can handle (Subscription.request(n)), so a fast producer does not overwhelm a slow consumer. Reactor also offers strategies like onBackpressureBuffer, onBackpressureDrop and limitRate.', level: 'Medium' },
    { q: 'map vs flatMap in Reactor?', a: 'map applies a synchronous function T -> R one to one. flatMap applies an asynchronous function T -> Publisher<R> and flattens the inner publishers into one stream, running them concurrently (order not guaranteed; use concatMap to keep order). Use flatMap when calling a repository or WebClient.', level: 'Medium' },
    { q: 'Spring MVC vs Spring WebFlux?', a: 'MVC: Servlet API, blocking I/O, thread-per-request on Tomcat, imperative code, works with JPA/JDBC. WebFlux: Reactive Streams, non-blocking I/O, event loop on Netty, returns Mono/Flux, needs reactive drivers (R2DBC, reactive Mongo). WebFlux scales better for I/O-heavy high-concurrency and streaming; MVC is simpler for typical CRUD apps.', level: 'Medium' },
    { q: 'Why should you not call block() in a WebFlux application?', a: 'block() waits synchronously for the result, which blocks an event-loop thread. Since there are only a few such threads, the whole server can freeze. Reactor detects it on Netty threads and throws IllegalStateException ("block()/blockFirst()/blockLast() are blocking, which is not supported in thread reactor-http-nio-2").', level: 'Medium' },
    { q: 'Can you use JPA/Hibernate with WebFlux?', a: 'Classic JPA and JDBC are blocking, so they should not be called on event-loop threads. Options: use R2DBC (reactive SQL) or reactive NoSQL drivers, or wrap blocking calls with Mono.fromCallable(...).subscribeOn(Schedulers.boundedElastic()) as a temporary solution (this loses most benefits).', level: 'Hard' },
    { q: 'What is WebClient and how is it different from RestTemplate?', a: 'WebClient is a non-blocking, reactive HTTP client with a fluent API that returns Mono/Flux and supports streaming, timeouts and retries. RestTemplate is blocking and in maintenance mode. For blocking-style code in Spring 6.1+, RestClient is the modern synchronous alternative.', level: 'Easy' },
    { q: 'What are functional endpoints in WebFlux?', a: 'An alternative to annotated controllers: routes are defined with RouterFunction beans (RouterFunctions.route().GET(path, handler)) and logic in HandlerFunctions that take ServerRequest and return Mono<ServerResponse>. They are explicit, lightweight and easy to compose and test.', level: 'Medium' },
    { q: 'How do you handle errors in a reactive pipeline?', a: 'Errors are signals that terminate the sequence. Use onErrorReturn (static fallback), onErrorResume (fallback publisher), onErrorMap (convert exception), retry/retryWhen (re-subscribe), doOnError (logging), timeout. In WebFlux controllers, @ExceptionHandler/@ControllerAdvice also work, and ResponseStatusException sets the HTTP status.', level: 'Hard' },
    { q: 'Are virtual threads a replacement for WebFlux?', a: 'For many applications yes: Java 21 virtual threads let blocking MVC code handle very high concurrency cheaply, with simple debugging. WebFlux still shines for streaming, backpressure, composing many async calls and reactive gateways. The choice depends on the workload and team skills.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Given Flux.just("apple", "banana", "cherry", "date", "elderberry"), produce a Mono<List<String>> of the uppercase names that have more than 5 letters, and print it. Write the expected output.',
      hint: 'filter -> map -> collectList -> subscribe.',
      solution: `Flux.just("apple", "banana", "cherry", "date", "elderberry")
    .filter(f -> f.length() > 5)
    .map(String::toUpperCase)
    .collectList()
    .subscribe(list -> System.out.println(list));

// Output:
// [BANANA, CHERRY, ELDERBERRY]
// (apple = 5 letters and date = 4 letters are removed)`,
    },
    {
      task: 'Add an endpoint GET /api/students/top?min=75 to the reactive API that returns students with marks >= min sorted by marks descending, and an endpoint GET /api/students/stats that returns { "count": n, "average": x } using reactive operators.',
      hint: 'Use repo.findByMarksGreaterThanEqual(min).sort(...). For stats: collectList() then map to a Map, or use Mono.zip(count, average).',
      solution: `@GetMapping("/top")
public Flux<Student> top(@RequestParam(defaultValue = "75") int min) {
    return repo.findByMarksGreaterThanEqual(min)
               .sort(Comparator.comparingInt(Student::getMarks).reversed());
}

@GetMapping("/stats")
public Mono<Map<String, Object>> stats() {
    return repo.findAll()
            .collectList()
            .map(list -> {
                double avg = list.stream().mapToInt(Student::getMarks).average().orElse(0);
                return Map.<String, Object>of("count", list.size(), "average", avg);
            });
}
// With Ravi 78 and Sneha 91: /top?min=75 -> [Sneha 91, Ravi 78]; /stats -> {"count":2,"average":84.5}`,
    },
    {
      task: 'Write a WebClient call to https://jsonplaceholder.typicode.com/todos?userId=1 that returns the number of completed todos. Add a 2-second timeout and retry twice before falling back to -1.',
      hint: 'bodyToFlux(Todo.class).filter(Todo::completed).count() returns Mono<Long>.',
      solution: `public record Todo(Long id, Long userId, String title, boolean completed) { }

@Service
public class TodoService {
    private final WebClient client;
    public TodoService(WebClient.Builder builder) {
        this.client = builder.baseUrl("https://jsonplaceholder.typicode.com").build();
    }

    public Mono<Long> completedCount(Long userId) {
        return client.get()
                .uri(uri -> uri.path("/todos").queryParam("userId", userId).build())
                .retrieve()
                .bodyToFlux(Todo.class)
                .filter(Todo::completed)
                .count()
                .timeout(Duration.ofSeconds(2))
                .retry(2)
                .onErrorReturn(-1L);
    }
}

@RestController
public class TodoController {
    private final TodoService service;
    public TodoController(TodoService service) { this.service = service; }

    @GetMapping("/api/todos/{userId}/completed")
    public Mono<Map<String, Long>> completed(@PathVariable Long userId) {
        return service.completedCount(userId).map(c -> Map.of("completed", c));
    }
}
// For userId 1 jsonplaceholder currently returns 20 todos, 11 completed -> {"completed":11}`,
    },
    {
      task: 'Convert this blocking MVC method into a reactive one: public List<String> namesOfCourse(String c) { return repo.findAll().stream().filter(s -> s.getCourse().equals(c)).map(Student::getName).toList(); } and write a StepVerifier test with in-memory data.',
      hint: 'Return Flux<String>; for testing, use Flux.just(...) instead of the repository.',
      solution: `// Service (reactive)
public Flux<String> namesOfCourse(String course) {
    return repo.findByCourse(course)        // or repo.findAll().filter(...)
               .map(Student::getName);
}

// Pure logic + test
class NamesTest {
    Flux<String> namesOfCourse(Flux<Student> source, String course) {
        return source.filter(s -> s.getCourse().equals(course)).map(Student::getName);
    }

    @Test
    void javaStudents() {
        Flux<Student> data = Flux.just(
            new Student("1", "Ravi", "Java", 78),
            new Student("2", "Sneha", "Python", 91),
            new Student("3", "Amit", "Java", 64));
        StepVerifier.create(namesOfCourse(data, "Java"))
                .expectNext("Ravi", "Amit")
                .verifyComplete();
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which Reactor type should a findById method return?', options: ['Flux<Student>', 'Mono<Student>', 'Optional<Student>', 'List<Student>'], answer: 1, explanation: 'Mono represents 0 or 1 item, exactly what a lookup by id returns.' },
    { question: 'What is the default embedded server for Spring WebFlux?', options: ['Netty', 'Tomcat', 'Jetty', 'WebLogic'], answer: 0, explanation: 'spring-boot-starter-webflux uses Reactor Netty by default.' },
    { question: 'repo.findById(id).map(s -> repo.save(s)) returns which type?', options: ['Mono<Student>', 'Flux<Student>', 'Student', 'Mono<Mono<Student>>'], answer: 3, explanation: 'save returns a Mono, so map wraps it again. Use flatMap to get Mono<Student>.' },
    { question: 'Which statement about WebFlux is TRUE?', options: ['It makes every single request faster', 'You must call block() in every controller', 'It handles many concurrent I/O-bound requests with few threads', 'It works best with JDBC and JPA'], answer: 2, explanation: 'Non-blocking I/O improves scalability under concurrency, not single-request latency; JDBC/JPA are blocking.' },
    { question: 'Which operator provides a fallback publisher when an error occurs?', options: ['doOnError', 'switchIfEmpty', 'defaultIfEmpty', 'onErrorResume'], answer: 3, explanation: 'onErrorResume(e -> fallback) switches to another publisher on error. switchIfEmpty/defaultIfEmpty handle EMPTY, not errors.' },
  ],
};
