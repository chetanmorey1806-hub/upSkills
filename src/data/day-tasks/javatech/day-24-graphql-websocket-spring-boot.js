export default {
  lesson: 'day-24-graphql-websocket-spring-boot',
  minutes: 24,
  intro: 'Write GraphQL queries and Spring for GraphQL controllers, and wire a STOMP-over-WebSocket chat.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'The mobile app needs only student names, but `GET /api/students` returns 20 fields; to show courses it must also call `/api/students/{id}/courses` for every student. Which GraphQL benefit solves this?',
      options: [
        'GraphQL is always faster than REST',
        'The client asks for exactly the fields it needs, including nested data, in one request (no over-fetching or under-fetching)',
        'GraphQL needs no server',
        'GraphQL uses XML',
      ],
      answer: 1,
      explain: 'REST endpoints return fixed shapes → **over-fetching** (too many fields) and **under-fetching** (extra round-trips). In GraphQL one `POST /graphql` query selects exactly `{ students { name courses { title } } }`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Student 2 is Ravi, Mumbai, 67 marks. What JSON does the server return for this query? (one line, no spaces)',
      example: { title: 'response shape', text: 'A GraphQL response is wrapped in "data" and mirrors the shape of the query, with only the requested fields.' },
      code: `# schema.graphqls
type Query { student(id: ID!): Student }
type Student { id: ID! name: String! city: String marks: Int }

# query
query {
  student(id: 2) {
    name
    marks
  }
}`,
      expected: '{"data":{"student":{"name":"Ravi","marks":67}}}',
      explain: 'Only `name` and `marks` were requested, so `id` and `city` are not sent. The result sits under `data`, and errors (if any) appear in an `errors` array - usually still with HTTP 200.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the controller annotations for the `student(id: ID!)` query field:\n```\n@Controller\npublic class StudentGraphController {\n    ???\n    public Student student(@Argument Long id) { return service.get(id); }\n}\n```',
      example: { title: 'a mutation', code: '@MutationMapping\npublic Student addStudent(@Argument StudentInput input) { ... }' },
      accept: ['@QueryMapping', '@QueryMapping("student")', '@QueryMapping(name = "student")', '@SchemaMapping(typeName = "Query", field = "student")'],
      explain: '`@QueryMapping` maps the method to the Query field with the same name (`student`). `@Argument` binds the GraphQL argument. `@SchemaMapping(typeName = "Student", field = "courses")` resolves nested fields.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'With this STOMP configuration and controller, type two lines: (1) the destination the browser **sends** a chat message to, (2) the destination it must **subscribe** to in order to receive messages.',
      example: { title: 'client side (stompjs)', code: 'client.subscribe("/topic/x", msg => show(JSON.parse(msg.body)));\nclient.publish({ destination: "/app/y", body: JSON.stringify(m) });' },
      code: `@Override
public void registerStompEndpoints(StompEndpointRegistry r) {
    r.addEndpoint("/ws");
}
@Override
public void configureMessageBroker(MessageBrokerRegistry r) {
    r.setApplicationDestinationPrefixes("/app");
    r.enableSimpleBroker("/topic");
}

@MessageMapping("/chat.send")
@SendTo("/topic/public")
public ChatMessage send(ChatMessage m) { return m; }`,
      expected: '/app/chat.send\n/topic/public',
      explain: 'Messages whose destination starts with the application prefix `/app` go to `@MessageMapping` methods, so the client sends to `/app/chat.send`. The return value is broadcast via the simple broker to `/topic/public`, which all chat clients subscribe to. The WebSocket connection itself opens at `/ws`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **WebSocket** are TRUE? (choose all that apply)',
      options: [
        'It starts as an HTTP request with an Upgrade header and then keeps one full-duplex connection open',
        'The server can push messages to the browser without the client asking each time',
        'STOMP adds frames like CONNECT, SUBSCRIBE and SEND on top of raw WebSocket',
        'It is the best choice for a normal CRUD form submit',
        'Live chat, notifications and live scores are typical use cases',
      ],
      answers: [0, 1, 2, 4],
      explain: 'WebSocket = persistent, two-way connection; ideal for real-time features. STOMP gives it a messaging protocol with destinations. Simple request/response CRUD stays REST (or GraphQL).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Where does Spring for GraphQL look for the schema file by default, and which URL serves the GraphiQL playground (when enabled)?',
      options: [
        'src/main/java/schema.json and /graphql-ui',
        'src/main/resources/graphql/*.graphqls and /graphiql',
        'The database and /swagger-ui.html',
        'static/index.html and /playground',
      ],
      answer: 1,
      explain: 'Schema-first: put `*.graphqls` files in `src/main/resources/graphql/`. Enable the browser IDE with `spring.graphql.graphiql.enabled=true` and open `/graphiql`; queries go to `POST /graphql`.',
    },
  ],
};
