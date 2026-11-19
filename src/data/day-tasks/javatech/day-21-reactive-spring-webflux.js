export default {
  lesson: 'day-21-reactive-spring-webflux',
  minutes: 24,
  intro: 'Work with Mono and Flux operators, write reactive endpoints and WebClient calls, and decide when WebFlux is worth it.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `Mono<T>` and `Flux<T>`?',
      options: ['Mono is blocking, Flux is non-blocking', 'Mono emits 0 or 1 item; Flux emits 0 to N items', 'Mono is for strings only', 'There is no difference'],
      answer: 1,
      explain: '**Mono** = at most one value (like an async Optional, e.g. findById). **Flux** = a stream of many values (e.g. findAll or live events). Both are lazy: nothing happens until someone subscribes.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this Reactor code print? (one line per println)',
      example: { title: 'operators', text: 'filter keeps matching items, map transforms each item, take(n) keeps only the first n.' },
      code: `Flux.range(1, 10)
    .filter(n -> n % 2 == 0)
    .map(n -> n * 10)
    .take(3)
    .subscribe(System.out::println);`,
      expected: '20\n40\n60',
      explain: '`range(1, 10)` emits 1..10, `filter` keeps 2, 4, 6, 8, 10, `map` makes 20, 40, ... and `take(3)` cancels after three items. Without `subscribe()` nothing would be printed at all.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (one line per println; `block()` is used here only in a test/main method)',
      example: { title: 'empty handling', code: 'Mono.empty().defaultIfEmpty("guest").block()   // "guest"' },
      code: `System.out.println(Mono.just("asha").map(String::toUpperCase).block());
System.out.println(Flux.just("Pune", "Mumbai", "Nagpur").collectList().block());
System.out.println(Mono.empty().defaultIfEmpty("none").block());
System.out.println(Flux.just(3, 5, 7).reduce(0, Integer::sum).block());`,
      expected: 'ASHA\n[Pune, Mumbai, Nagpur]\nnone\n15',
      explain: '`map` transforms the single value. `collectList` turns a Flux into a `Mono<List>`. An empty Mono uses the `defaultIfEmpty` value. `reduce` folds the stream into one sum: 0+3+5+7 = 15.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the return type of this annotated WebFlux endpoint that streams all students from reactive MongoDB:\n```\n@GetMapping("/api/students")\npublic ??? all() {\n    return repo.findAll();   // ReactiveMongoRepository\n}\n```',
      example: { title: 'one student', code: '@GetMapping("/api/students/{id}")\npublic Mono<Student> one(@PathVariable String id) { return repo.findById(id); }' },
      accept: ['Flux<Student>'],
      caseSensitive: true,
      explain: '`ReactiveMongoRepository.findAll()` returns `Flux<Student>` and WebFlux writes it as a JSON array (or as a stream with `text/event-stream`). Returning `List<Student>` would force blocking.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the WebClient call that reads one JSON user as a `Mono<User>`:\n```\nMono<User> user = webClient.get()\n        .uri("/users/{id}", 7)\n        .retrieve()\n        .???(User.class);\n```',
      example: { title: 'many items', code: '.retrieve().bodyToFlux(Order.class)' },
      accept: ['bodyToMono'],
      caseSensitive: true,
      explain: '`bodyToMono(User.class)` for one object, `bodyToFlux(X.class)` for a stream/array. `retrieve()` turns 4xx/5xx into `WebClientResponseException` unless you add `onStatus(...)`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about WebFlux vs Spring MVC are TRUE? (choose all that apply)',
      options: [
        'WebFlux runs on a small number of event-loop threads (Netty) and shines with many concurrent I/O-bound requests',
        'Calling .block() or a blocking JDBC repository inside a WebFlux handler wastes event-loop threads and should be avoided',
        'For a typical CRUD app with JPA/MySQL, Spring MVC (optionally with virtual threads) is usually simpler',
        'WebFlux makes CPU-heavy calculations faster',
        'Functional endpoints use RouterFunction and HandlerFunction instead of @RestController',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Reactive helps with **waiting**, not with CPU work. The whole chain must be non-blocking (R2DBC, reactive Mongo, WebClient) or the benefit disappears. Functional routes (`route().GET("/api/students", handler::all)`) are an alternative to annotations.',
    },
  ],
};
