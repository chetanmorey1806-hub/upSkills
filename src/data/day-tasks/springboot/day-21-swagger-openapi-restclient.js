export default {
  lesson: 'day-21-swagger-openapi-restclient',
  minutes: 22,
  intro: 'Document your API with springdoc-openapi and Swagger UI, and call external REST services with RestClient and WebClient.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Which dependency artifactId adds OpenAPI docs + Swagger UI to a Spring Boot 3 **MVC** app?',
      example: { title: 'groupId', code: '<groupId>org.springdoc</groupId>' },
      accept: ['springdoc-openapi-starter-webmvc-ui'],
      explain: '`springdoc-openapi-starter-webmvc-ui` scans your controllers and generates the OpenAPI JSON plus Swagger UI. The old `springfox` library does not work with Spring Boot 3.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'After adding springdoc (default settings, port 8080), which URLs work? (choose all that apply)',
      options: ['http://localhost:8080/swagger-ui.html', 'http://localhost:8080/swagger-ui/index.html', 'http://localhost:8080/v3/api-docs', 'http://localhost:8080/swagger', 'http://localhost:8080/api-docs.xml'],
      answers: [0, 1, 2],
      explain: '`/swagger-ui.html` redirects to `/swagger-ui/index.html` (the interactive UI) and `/v3/api-docs` returns the raw OpenAPI JSON that tools like Postman can import. If Spring Security is on, remember to permit these paths.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the annotation that gives this endpoint a short description in Swagger UI:\n```\n???\n@GetMapping("/{id}")\npublic StudentDto getOne(@PathVariable Long id) { ... }\n```',
      example: { title: 'grouping endpoints', code: '@Tag(name = "Students", description = "Student management APIs")\n@RestController\npublic class StudentController { ... }' },
      accept: ['@Operation(summary = "Get a student by id")', '@Operation(summary = "Get student by id")', '@Operation(summary="Get one student")'],
      acceptRegex: ['^@Operation\\s*\\(\\s*summary\\s*=\\s*".+"\\s*(,.*)?\\)$'],
      explain: '`@Operation(summary = "...")` (from `io.swagger.v3.oas.annotations`) describes one endpoint; `@ApiResponse` documents status codes and `@Tag` groups a controller. Good docs reduce questions from frontend developers.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'In a normal blocking Spring MVC app on Boot 3.2+, which client is recommended for calling another REST API?',
      options: ['RestTemplate (only option, still actively enhanced)', 'RestClient - a modern fluent, synchronous client', 'WebClient is mandatory for any HTTP call', 'HttpURLConnection'],
      answer: 1,
      explain: '**RestClient** (Spring 6.1) has a fluent API like WebClient but is blocking - perfect for MVC apps. `RestTemplate` is in maintenance mode. **WebClient** is the reactive, non-blocking client (needs WebFlux) - use it for reactive apps or many parallel calls.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which two full URLs does this code request? Type each on its own line.',
      example: { title: 'URI templates', code: '.uri("/cities/{name}", "Pune")   // → /cities/Pune' },
      code: `RestClient client = RestClient.builder()
        .baseUrl("https://api.upskillr.in")
        .build();

User u = client.get()
        .uri("/users/{id}", 3)
        .retrieve()
        .body(User.class);

List<Post> posts = client.get()
        .uri("/posts?userId={u}&page={p}", u.getId(), 2)
        .retrieve()
        .body(new ParameterizedTypeReference<>() {});
// the user returned has id 3`,
      expected: 'https://api.upskillr.in/users/3\nhttps://api.upskillr.in/posts?userId=3&page=2',
      explain: 'The base URL is prefixed to every `uri(...)`. `{id}` and `{u}`, `{p}` placeholders are filled in order with the given arguments, so the second call becomes `/posts?userId=3&page=2`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices make calls to external APIs **robust**? (choose all that apply)',
      options: [
        'Set connect and read timeouts',
        'Handle 4xx/5xx with .onStatus(...) and map them to your own exceptions',
        'Retry temporary failures a limited number of times',
        'Wait forever for a slow server',
        'Keep API keys in configuration/environment variables, not in code',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Without timeouts one slow partner API can block all your threads. Map errors with `onStatus`, retry only temporary failures (with limits/backoff) and keep secrets out of source code.',
    },
  ],
};
