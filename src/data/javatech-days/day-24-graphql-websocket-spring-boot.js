export default {
  id: 'day-24-graphql-websocket-spring-boot',
  title: 'GraphQL and WebSocket (STOMP) with Spring Boot',
  module: 'Module 6: Microservices, Messaging & APIs',
  day: 24,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Go beyond REST: build a GraphQL API with Spring for GraphQL (schema-first, @QueryMapping, @MutationMapping, @SchemaMapping, GraphiQL) and a real-time group chat using WebSocket with the STOMP protocol and a simple browser client.',
  objectives: [
    'Explain GraphQL vs REST, over-fetching/under-fetching and the role of a schema',
    'Write a .graphqls schema with types, queries, mutations, inputs and non-null fields',
    'Implement resolvers with @QueryMapping, @MutationMapping, @Argument and @SchemaMapping and test in GraphiQL',
    'Explain WebSocket vs HTTP polling, and STOMP destinations, message broker and @MessageMapping',
    'Build a working chat room with Spring Boot + SockJS/STOMP JavaScript client',
  ],
  theory: [
    {
      heading: '1. Why GraphQL? (Over-fetching and Under-fetching)',
      content: 'With REST, the server decides the shape of each response. A mobile app showing only book titles still downloads description, price, ISBN... (over-fetching). A page showing a book with its author and reviews must call /books/1, /authors/7 and /books/1/reviews (under-fetching, many round trips). GraphQL (created by Facebook) exposes ONE endpoint, usually POST /graphql. The client sends a query describing exactly which fields it wants, and the server returns JSON in exactly that shape. Analogy: REST is a fixed thali; GraphQL is a buffet where you put only what you want on your plate.',
      points: [
        'Query = read, Mutation = write, Subscription = real-time push (over WebSocket)',
        'Strongly typed schema is the contract between frontend and backend',
        'Introspection lets tools like GraphiQL auto-complete fields',
        'Downsides: HTTP caching is harder (everything is POST /graphql), N+1 queries risk, need query depth/complexity limits',
        'Errors normally come with HTTP 200 and an "errors" array in the body',
      ],
    },
    {
      heading: '2. GraphQL Schema Language',
      content: 'Spring for GraphQL is schema-first: you write src/main/resources/graphql/schema.graphqls. Built-in scalar types are Int, Float, String, Boolean and ID. "!" means non-null. [Book!]! means a non-null list of non-null books. "input" types are used for mutation arguments.',
      syntax: `type Query {
  books: [Book!]!
  bookById(id: ID!): Book
}

type Mutation {
  addBook(input: BookInput!): Book!
}

type Book {
  id: ID!
  title: String!
  price: Float
  author: Author!
}

type Author {
  id: ID!
  name: String!
}

input BookInput {
  title: String!
  price: Float
  authorId: ID!
}`,
    },
    {
      heading: '3. Spring for GraphQL Controllers',
      content: 'Add spring-boot-starter-graphql plus spring-boot-starter-web. A normal @Controller (not @RestController) contains handler methods. @QueryMapping binds a method to a field of type Query with the same name; @MutationMapping does the same for Mutation; @Argument binds a GraphQL argument (input types are converted to Java records/classes). @SchemaMapping(typeName="Book", field="author") resolves a nested field only when the client asks for it. @BatchMapping solves the N+1 problem by loading authors for all books in one call.',
      points: [
        'Method name must match the schema field name (or give name = "...")',
        'Enable the browser IDE: spring.graphql.graphiql.enabled=true then open /graphiql',
        'Validation: @Argument @Valid works with Bean Validation',
        'Exceptions: implement DataFetcherExceptionResolverAdapter to convert exceptions to GraphQL errors (NOT_FOUND, BAD_REQUEST)',
        'Security: Spring Security protects /graphql like any endpoint; @PreAuthorize works on controller methods',
      ],
    },
    {
      heading: '4. WebSocket Basics',
      content: 'HTTP is request-response: the server cannot speak until the client asks. For chat, live cricket scores, stock tickers or delivery tracking, polling every second wastes resources. WebSocket starts as an HTTP request with header "Upgrade: websocket" (status 101 Switching Protocols) and then keeps ONE TCP connection open where both sides can send messages at any time (full-duplex). Analogy: HTTP is sending letters; WebSocket is an open phone line.',
      points: [
        'URLs use ws:// or wss:// (secure, use in production)',
        'Raw WebSocket only sends frames; it does not say who should receive what',
        'SockJS is a fallback library that emulates WebSocket when proxies block it',
        'Scaling: with many servers, use an external broker (RabbitMQ/ActiveMQ STOMP relay) or Redis pub/sub so users on different servers see the same messages',
      ],
    },
    {
      heading: '5. STOMP over WebSocket in Spring',
      content: 'STOMP (Simple Text Oriented Messaging Protocol) adds commands (CONNECT, SUBSCRIBE, SEND) and destinations on top of WebSocket, like HTTP adds methods and URLs on top of TCP. Spring configuration has three parts: the endpoint where clients connect (/ws), the application prefix (/app) for messages that go to @MessageMapping methods, and the broker prefix (/topic for broadcast, /queue for one user) for messages delivered to subscribers.',
      syntax: `Client SEND  /app/chat.send   -> @MessageMapping("/chat.send") method
Method returns value             -> @SendTo("/topic/public")
Broker delivers to every client SUBSCRIBEd to /topic/public

Server can also push anytime:
simpMessagingTemplate.convertAndSend("/topic/scores", score);
simpMessagingTemplate.convertAndSendToUser("ravi", "/queue/notify", msg);`,
      tip: 'Do not confuse @MessageMapping (STOMP, /app prefix added by client) with @RequestMapping (HTTP). The client sends to "/app/chat.send" but the annotation says only "/chat.send".',
    },
  ],
  examples: [
    {
      title: 'Example 1: Book Catalogue GraphQL API with Queries and Mutation',
      scenario: 'Create a GraphQL API for books and authors with in-memory data and test it in GraphiQL.',
      steps: [
        'start.spring.io: Spring Boot 3.3.x, Java 17, dependencies Spring Web + Spring for GraphQL; open in IntelliJ or Eclipse STS',
        'Create src/main/resources/graphql/schema.graphqls with the schema from theory section 2',
        'Create records Book, Author, BookInput and BookController',
        'Add spring.graphql.graphiql.enabled=true to application.properties and run the app',
        'Open http://localhost:8080/graphiql and run the queries below (Ctrl+Enter)',
        'Postman alternative: New > GraphQL request, URL http://localhost:8080/graphql; it reads the schema automatically',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-graphql</artifactId>
</dependency>
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-web</artifactId>
</dependency>

# application.properties
spring.graphql.graphiql.enabled=true

// Author.java
package com.lib.graphql;
public record Author(String id, String name) {}

// Book.java
package com.lib.graphql;
public record Book(String id, String title, Double price, String authorId) {}

// BookInput.java
package com.lib.graphql;
public record BookInput(String title, Double price, String authorId) {}

// BookController.java
package com.lib.graphql;

import org.springframework.graphql.data.method.annotation.*;
import org.springframework.stereotype.Controller;
import java.util.*;
import java.util.concurrent.atomic.AtomicInteger;

@Controller
public class BookController {

    private final Map<String, Author> authors = new LinkedHashMap<>();
    private final Map<String, Book> books = new LinkedHashMap<>();
    private final AtomicInteger seq = new AtomicInteger(2);

    public BookController() {
        authors.put("a1", new Author("a1", "R. K. Narayan"));
        authors.put("a2", new Author("a2", "Herbert Schildt"));
        books.put("1", new Book("1", "Malgudi Days", 250.0, "a1"));
        books.put("2", new Book("2", "Java: The Complete Reference", 899.0, "a2"));
    }

    @QueryMapping
    public List<Book> books() {
        return new ArrayList<>(books.values());
    }

    @QueryMapping
    public Book bookById(@Argument String id) {
        return books.get(id);                 // null -> "bookById": null
    }

    @MutationMapping
    public Book addBook(@Argument BookInput input) {
        String id = String.valueOf(seq.incrementAndGet());
        Book b = new Book(id, input.title(), input.price(), input.authorId());
        books.put(id, b);
        return b;
    }

    // Resolves Book.author only when the client requests it
    @SchemaMapping(typeName = "Book", field = "author")
    public Author author(Book book) {
        return authors.get(book.authorId());
    }
}

# ===== GraphiQL queries =====
query {
  books { title }
}

query {
  bookById(id: "2") { title price author { name } }
}

mutation {
  addBook(input: { title: "Head First Java", price: 650, authorId: "a2" }) {
    id
    title
    author { name }
  }
}`,
      result: `Query 1:
{"data":{"books":[{"title":"Malgudi Days"},{"title":"Java: The Complete Reference"}]}}

Query 2:
{"data":{"bookById":{"title":"Java: The Complete Reference","price":899.0,"author":{"name":"Herbert Schildt"}}}}

Mutation:
{"data":{"addBook":{"id":"3","title":"Head First Java","author":{"name":"Herbert Schildt"}}}}`,
      explanation: 'The first query asked only for title, so price and author were never resolved (no over-fetching). The second query got the book and its author in one round trip; Spring called author(Book) because "author" was requested. seq starts at 2 and incrementAndGet returns 3 for the new book. Spring maps the BookInput GraphQL input object to the Java record automatically, and the Java field authorId stays hidden because the schema type Book does not declare it.',
    },
    {
      title: 'Example 2: GraphQL with Spring Data JPA, Variables, @BatchMapping and Error Handling',
      scenario: 'Load books from MySQL, avoid N+1 author queries and return a clean NOT_FOUND error.',
      steps: [
        'Add spring-boot-starter-data-jpa and mysql-connector-j; configure the datasource',
        'Create Author and Book entities with repositories',
        'Replace @SchemaMapping with @BatchMapping to fetch all authors in one query',
        'Add an exception resolver for BookNotFoundException',
        'In GraphiQL use the Variables panel at the bottom for {"id": "99"}',
      ],
      code: `# application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/library
spring.datasource.username=root
spring.datasource.password=root
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.graphql.graphiql.enabled=true

// Author.java
@Entity
public class Author {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    // getters, setters
}

// Book.java
@Entity
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private Double price;
    @ManyToOne(fetch = FetchType.LAZY)
    private Author author;
    // getters, setters
}

public interface BookRepository extends JpaRepository<Book, Long> {}
public interface AuthorRepository extends JpaRepository<Author, Long> {}

public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(Long id) { super("Book " + id + " not found"); }
}

// BookGraphController.java
@Controller
public class BookGraphController {
    private final BookRepository bookRepo;
    public BookGraphController(BookRepository bookRepo) { this.bookRepo = bookRepo; }

    @QueryMapping
    public List<Book> books() { return bookRepo.findAll(); }

    @QueryMapping
    public Book bookById(@Argument Long id) {
        return bookRepo.findById(id).orElseThrow(() -> new BookNotFoundException(id));
    }

    // ONE call for all books in the response instead of one query per book
    @BatchMapping(typeName = "Book", field = "author")
    public Map<Book, Author> author(List<Book> books) {
        Map<Book, Author> result = new LinkedHashMap<>();
        for (Book b : books) {
            result.put(b, b.getAuthor());   // in real code: authorRepo.findAllById(ids) once
        }
        return result;
    }
}

// GraphQlErrorConfig.java
@Component
public class GraphQlErrorConfig extends DataFetcherExceptionResolverAdapter {
    @Override
    protected GraphQLError resolveToSingleError(Throwable ex, DataFetchingEnvironment env) {
        if (ex instanceof BookNotFoundException) {
            return GraphqlErrorBuilder.newError(env)
                    .errorType(ErrorType.NOT_FOUND)
                    .message(ex.getMessage())
                    .build();
        }
        return null;   // let other resolvers / default handle it
    }
}

# GraphiQL - query with variable
query GetBook($id: ID!) {
  bookById(id: $id) { title author { name } }
}
# Variables panel:
{ "id": "99" }`,
      result: `{
  "errors": [
    {
      "message": "Book 99 not found",
      "locations": [{"line": 2, "column": 3}],
      "path": ["bookById"],
      "extensions": {"classification": "NOT_FOUND"}
    }
  ],
  "data": {"bookById": null}
}
(HTTP status is still 200 OK - GraphQL reports errors inside the body)`,
      explanation: 'Variables keep queries reusable and safe (no string concatenation). @BatchMapping receives the list of all Book objects that need an author and returns a map, so the framework does not call the resolver once per book (N+1 problem). ErrorType.NOT_FOUND comes from org.springframework.graphql.execution.ErrorType. Because bookById is nullable in the schema, data.bookById becomes null and the error is listed separately.',
    },
    {
      title: 'Example 3: Real-time Group Chat with WebSocket + STOMP',
      scenario: 'Build a chat room where every connected browser instantly sees messages and join notifications.',
      steps: [
        'start.spring.io: Spring Web + WebSocket dependencies; open the project',
        'Create WebSocketConfig, ChatMessage record and ChatController',
        'Create src/main/resources/static/index.html with the JavaScript client (uses @stomp/stompjs from a CDN)',
        'Run the app and open http://localhost:8080 in TWO browser windows (or one normal + one incognito)',
        'Enter different names, send messages and watch both windows update instantly',
        'Open browser DevTools > Network > WS to see the frames (CONNECT, SUBSCRIBE, SEND, MESSAGE)',
      ],
      code: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>

// WebSocketConfig.java
package com.chat;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.*;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("http://localhost:*");  // React dev server etc.
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.setApplicationDestinationPrefixes("/app");   // client -> @MessageMapping
        registry.enableSimpleBroker("/topic", "/queue");      // in-memory broker -> subscribers
    }
}

// ChatMessage.java
package com.chat;
public record ChatMessage(String type, String sender, String content, String time) {}

// ChatController.java
package com.chat;

import org.springframework.messaging.handler.annotation.*;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {
    private static final DateTimeFormatter HM = DateTimeFormatter.ofPattern("HH:mm");

    @MessageMapping("/chat.send")          // client sends to /app/chat.send
    @SendTo("/topic/public")
    public ChatMessage send(@Payload ChatMessage msg) {
        return new ChatMessage("CHAT", msg.sender(), msg.content(), LocalTime.now().format(HM));
    }

    @MessageMapping("/chat.join")
    @SendTo("/topic/public")
    public ChatMessage join(@Payload ChatMessage msg, SimpMessageHeaderAccessor headers) {
        headers.getSessionAttributes().put("username", msg.sender());
        return new ChatMessage("JOIN", msg.sender(), msg.sender() + " joined the chat",
                LocalTime.now().format(HM));
    }
}

<!-- src/main/resources/static/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"><title>Batch Chat</title>
  <script src="https://cdn.jsdelivr.net/npm/@stomp/stompjs@7.0.0/bundles/stomp.umd.min.js"></script>
</head>
<body>
  <input id="name" placeholder="Your name"> <button onclick="connect()">Join</button>
  <ul id="messages"></ul>
  <input id="text" placeholder="Type a message"> <button onclick="sendMsg()">Send</button>
<script>
  let client;
  function connect() {
    const name = document.getElementById('name').value;
    client = new StompJs.Client({ brokerURL: 'ws://' + location.host + '/ws' });
    client.onConnect = function () {
      client.subscribe('/topic/public', function (frame) {
        const m = JSON.parse(frame.body);
        const li = document.createElement('li');
        li.textContent = '[' + m.time + '] ' + (m.type === 'JOIN' ? m.content : m.sender + ': ' + m.content);
        document.getElementById('messages').appendChild(li);
      });
      client.publish({ destination: '/app/chat.join',
                       body: JSON.stringify({ type: 'JOIN', sender: name }) });
    };
    client.activate();
  }
  function sendMsg() {
    const box = document.getElementById('text');
    client.publish({ destination: '/app/chat.send',
      body: JSON.stringify({ type: 'CHAT', sender: document.getElementById('name').value, content: box.value }) });
    box.value = '';
  }
</script>
</body>
</html>`,
      result: `Window 1 (Asha) and Window 2 (Vikram) both show:
[10:42] Asha joined the chat
[10:42] Vikram joined the chat
[10:43] Asha: Hi everyone, is the Kafka assignment done?
[10:43] Vikram: Almost, partitions part pending
(times show the server clock)

DevTools > Network > ws > Messages:
>> CONNECT ...  << CONNECTED version:1.2
>> SUBSCRIBE destination:/topic/public
>> SEND destination:/app/chat.send {"type":"CHAT",...}
<< MESSAGE destination:/topic/public {"type":"CHAT","sender":"Asha",...}`,
      explanation: 'The browser connects once to ws://localhost:8080/ws. A SEND to /app/chat.send is routed to the @MessageMapping("/chat.send") method; its return value goes to /topic/public via @SendTo, and the simple broker pushes it to every subscriber. The JS client uses string concatenation to keep the code beginner-friendly. For production behind a load balancer, replace enableSimpleBroker with enableStompBrokerRelay (RabbitMQ with STOMP plugin) so all servers share subscriptions.',
    },
    {
      title: 'Example 4: Server Push — Live Cricket Score with SimpMessagingTemplate',
      scenario: 'The server pushes a score update every 5 seconds to everyone subscribed to /topic/score, without any client request.',
      steps: [
        'Reuse WebSocketConfig from Example 3',
        'Add @EnableScheduling on the main class',
        'Create ScoreBroadcaster with @Scheduled(fixedRate = 5000)',
        'In the HTML client subscribe to /topic/score and print the text',
      ],
      code: `// LiveScoreApplication.java
@SpringBootApplication
@EnableScheduling
public class LiveScoreApplication {
    public static void main(String[] args) { SpringApplication.run(LiveScoreApplication.class, args); }
}

// ScoreBroadcaster.java
package com.chat;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class ScoreBroadcaster {
    private final SimpMessagingTemplate messaging;
    private int runs = 0, balls = 0, wickets = 0;
    private final int[] pattern = {1, 4, 0, 6, 2, -1};   // -1 = wicket

    public ScoreBroadcaster(SimpMessagingTemplate messaging) { this.messaging = messaging; }

    @Scheduled(fixedRate = 5000)
    public void pushScore() {
        int r = pattern[balls % pattern.length];
        if (r == -1) wickets++; else runs += r;
        balls++;
        String overs = (balls / 6) + "." + (balls % 6);
        messaging.convertAndSend("/topic/score",
                "IND " + runs + "/" + wickets + " (" + overs + " ov)");
    }
}

// client side (inside onConnect)
client.subscribe('/topic/score', function (f) {
  document.getElementById('score').textContent = f.body;
});`,
      result: `Every 5 seconds the page updates (no refresh):
IND 1/0 (0.1 ov)
IND 5/0 (0.2 ov)
IND 5/0 (0.3 ov)
IND 11/0 (0.4 ov)
IND 13/0 (0.5 ov)
IND 13/1 (1.0 ov)
IND 14/1 (1.1 ov)`,
      explanation: 'Trace: ball1 +1=1; ball2 +4=5; ball3 +0=5; ball4 +6=11; ball5 +2=13; ball6 wicket -> 13/1 and balls=6 gives 1.0 overs; ball7 uses pattern[0]=1 -> 14/1 (1.1). SimpMessagingTemplate lets any bean (scheduler, Kafka listener, REST controller) push to WebSocket subscribers. A common real design: a Kafka consumer receives "OrderShipped" and pushes it to /user/queue/notifications for that user.',
    },
  ],
  interview: [
    { q: 'What is GraphQL and how is it different from REST?', a: 'GraphQL is a query language and runtime for APIs with a single endpoint and a typed schema. Clients ask for exactly the fields they need, in one request, avoiding over- and under-fetching. REST has multiple resource URLs with server-defined responses and uses HTTP verbs/status codes and caching naturally.', level: 'Easy' },
    { q: 'What are Query, Mutation and Subscription?', a: 'Query reads data, Mutation changes data (create/update/delete), Subscription keeps a long-lived connection (usually WebSocket) to push events to the client.', level: 'Easy' },
    { q: 'What does @SchemaMapping do?', a: 'It binds a controller method to a field of a schema type (typeName + field), used for nested fields like Book.author. The parent object (Book) is passed as a method parameter. @QueryMapping and @MutationMapping are shortcuts for typeName Query/Mutation.', level: 'Medium' },
    { q: 'What is the N+1 problem in GraphQL and how does Spring solve it?', a: 'Fetching 50 books then resolving author for each book makes 1 + 50 calls. @BatchMapping (built on DataLoader) collects all parent objects and loads children in one batch call.', level: 'Hard' },
    { q: 'What HTTP status does a GraphQL error usually return?', a: '200 OK with an "errors" array in the response body (and partial "data"). Transport-level failures like bad JSON or authentication can still return 4xx.', level: 'Medium' },
    { q: 'How do you secure a GraphQL API?', a: 'Authenticate /graphql with Spring Security (JWT), authorize fields with @PreAuthorize, limit query depth/complexity, disable introspection/GraphiQL in production if needed, and validate inputs.', level: 'Hard' },
    { q: 'What is WebSocket?', a: 'A protocol giving a persistent, full-duplex TCP connection between client and server, established via an HTTP Upgrade handshake (101 Switching Protocols). Both sides can send messages anytime with low overhead.', level: 'Easy' },
    { q: 'Why use STOMP with WebSocket?', a: 'Raw WebSocket only transfers frames. STOMP adds a messaging protocol with commands (CONNECT, SUBSCRIBE, SEND) and destinations, enabling pub/sub routing, @MessageMapping methods and broker integration in Spring.', level: 'Medium' },
    { q: 'Explain /app and /topic prefixes in Spring WebSocket config.', a: 'setApplicationDestinationPrefixes("/app") routes client messages to @MessageMapping methods; enableSimpleBroker("/topic","/queue") lets the broker deliver messages to subscribers. /topic is used for broadcast, /queue for point-to-point/user messages by convention.', level: 'Medium' },
    { q: 'How do you send a message to one specific user?', a: 'Use SimpMessagingTemplate.convertAndSendToUser(username, "/queue/notify", payload) or @SendToUser; the client subscribes to /user/queue/notify. The user is identified by the authenticated Principal of the WebSocket session.', level: 'Hard' },
    { q: 'How do you scale a WebSocket application to many servers?', a: 'Use a full external broker via enableStompBrokerRelay (RabbitMQ/ActiveMQ) or Redis pub/sub so a message published on one node reaches subscribers connected to other nodes; use sticky sessions or let the broker handle it.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a query booksByMaxPrice(max: Float!): [Book!]! to the Example 1 API.',
      hint: 'Update the schema and add a @QueryMapping method with @Argument Double max.',
      solution: `# schema.graphqls (add inside type Query)
type Query {
  books: [Book!]!
  bookById(id: ID!): Book
  booksByMaxPrice(max: Float!): [Book!]!
}

// BookController.java
@QueryMapping
public List<Book> booksByMaxPrice(@Argument Double max) {
    return books.values().stream()
            .filter(b -> b.price() != null && b.price() <= max)
            .toList();
}

# GraphiQL
query { booksByMaxPrice(max: 300) { title price } }
# -> {"data":{"booksByMaxPrice":[{"title":"Malgudi Days","price":250.0}]}}`,
    },
    {
      task: 'Add deleteBook(id: ID!): Boolean! mutation that returns true if the book existed.',
      hint: 'Map.remove returns the old value or null.',
      solution: `# schema
type Mutation {
  addBook(input: BookInput!): Book!
  deleteBook(id: ID!): Boolean!
}

// controller
@MutationMapping
public boolean deleteBook(@Argument String id) {
    return books.remove(id) != null;
}

# test
mutation { deleteBook(id: "1") }   # {"data":{"deleteBook":true}}
mutation { deleteBook(id: "1") }   # {"data":{"deleteBook":false}}`,
    },
    {
      task: 'Write a JUnit test for the GraphQL controller using @GraphQlTest and GraphQlTester.',
      hint: 'spring-graphql-test dependency; graphQlTester.document(...).execute().path(...).',
      solution: `<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.graphql</groupId>
  <artifactId>spring-graphql-test</artifactId>
  <scope>test</scope>
</dependency>

// BookControllerTest.java
@GraphQlTest(BookController.class)
class BookControllerTest {

    @Autowired
    GraphQlTester graphQlTester;

    @Test
    void shouldReturnBookTitle() {
        graphQlTester.document("{ bookById(id: \\"1\\") { title author { name } } }")
                .execute()
                .path("bookById.title").entity(String.class).isEqualTo("Malgudi Days")
                .path("bookById.author.name").entity(String.class).isEqualTo("R. K. Narayan");
    }
}`,
    },
    {
      task: 'Add a "typing..." indicator to the chat: clients send to /app/chat.typing and others see "Asha is typing..." on /topic/typing.',
      hint: 'New @MessageMapping method with @SendTo("/topic/typing").',
      solution: `// ChatController.java
@MessageMapping("/chat.typing")
@SendTo("/topic/typing")
public String typing(@Payload ChatMessage msg) {
    return msg.sender() + " is typing...";
}

// index.html additions
document.getElementById('text').addEventListener('input', function () {
  client.publish({ destination: '/app/chat.typing',
    body: JSON.stringify({ type: 'TYPING', sender: document.getElementById('name').value }) });
});
// inside onConnect:
client.subscribe('/topic/typing', function (f) {
  const el = document.getElementById('typing');
  el.textContent = f.body;
  setTimeout(function () { el.textContent = ''; }, 1500);
});
// and add <div id="typing"></div> in the body`,
    },
    {
      task: 'Broadcast a "user left" message when a WebSocket session disconnects.',
      hint: 'Listen for SessionDisconnectEvent and read the username saved in session attributes during join.',
      solution: `@Component
public class WebSocketEventListener {
    private final SimpMessagingTemplate messaging;
    public WebSocketEventListener(SimpMessagingTemplate messaging) { this.messaging = messaging; }

    @EventListener
    public void onDisconnect(SessionDisconnectEvent event) {
        StompHeaderAccessor acc = StompHeaderAccessor.wrap(event.getMessage());
        Object user = acc.getSessionAttributes() == null ? null
                    : acc.getSessionAttributes().get("username");
        if (user != null) {
            messaging.convertAndSend("/topic/public",
                new ChatMessage("LEAVE", user.toString(), user + " left the chat",
                    LocalTime.now().format(DateTimeFormatter.ofPattern("HH:mm"))));
        }
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Where does Spring for GraphQL look for schema files by default?',
      options: ['src/main/resources/static', 'src/main/resources/graphql', 'src/main/java/graphql', 'src/main/resources/templates'],
      answer: 1,
      explanation: 'Files ending with .graphqls or .gqls in classpath:graphql/ are loaded.',
    },
    {
      question: 'Which annotation handles a GraphQL write operation?',
      options: ['@QueryMapping', '@PostMapping', '@MutationMapping', '@MessageMapping'],
      answer: 2,
      explanation: '@MutationMapping maps a method to a field of type Mutation.',
    },
    {
      question: 'The HTTP status code returned during a successful WebSocket handshake is:',
      options: ['101 Switching Protocols', '200 OK', '201 Created', '204 No Content'],
      answer: 0,
      explanation: 'The server answers the Upgrade request with 101 and the protocol switches to WebSocket.',
    },
    {
      question: 'With setApplicationDestinationPrefixes("/app") and @MessageMapping("/chat.send"), the client must send to:',
      options: ['/chat.send', '/topic/chat.send', '/ws/chat.send', '/app/chat.send'],
      answer: 3,
      explanation: 'The prefix /app is added by the client; Spring strips it before matching @MessageMapping.',
    },
    {
      question: 'Which Spring for GraphQL feature fixes the N+1 problem for nested fields?',
      options: ['@SchemaMapping', '@BatchMapping', '@Argument', '@SendTo'],
      answer: 1,
      explanation: '@BatchMapping loads child data for many parents in a single call.',
    },
  ],
};
