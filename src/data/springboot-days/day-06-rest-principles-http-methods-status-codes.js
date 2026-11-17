export default {
  id: 'day-06-rest-principles-http-methods-status-codes',
  title: 'REST Principles, HTTP Methods and Status Codes',
  module: 'Module 2: REST APIs',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn what REST is, its six constraints, how to design clean resource URLs, which HTTP method to use for each operation, which status code to return, and how to inspect requests and responses in Postman.',
  objectives: [
    'Explain REST, resources, representations and statelessness',
    'Design RESTful URLs using nouns, plural names and nesting',
    'Map CRUD operations to GET, POST, PUT, PATCH and DELETE and know safe/idempotent methods',
    'Choose correct HTTP status codes (2xx, 3xx, 4xx, 5xx)',
    'Use Postman to send requests with headers, query params, path variables and JSON bodies',
  ],
  theory: [
    {
      heading: 'What is REST?',
      content:
        'REST (REpresentational State Transfer) is an architectural style for building web services, defined by Roy Fielding in 2000. In REST everything is a RESOURCE (student, course, order) identified by a URL. Clients work with REPRESENTATIONS of resources, usually JSON, using standard HTTP methods.\n\nAnalogy: a library. Each book (resource) has a unique shelf number (URL). You can look at a book (GET), donate a new one (POST), replace it (PUT), fix a page (PATCH), or remove it (DELETE). The librarian does not remember you between visits (stateless) - you show your card every time.\n\nA REST API (or RESTful web service) is an API that follows these rules. Spring Boot is one of the most popular ways to build them in Java.',
    },
    {
      heading: 'The 6 REST Constraints',
      content: 'An API is truly RESTful when it follows these constraints:',
      points: [
        'Client-Server: UI (React/Android) and server (Spring Boot) are separate and evolve independently',
        'Stateless: every request carries all information needed (e.g. JWT token); the server stores no client session',
        'Cacheable: responses say whether they can be cached (Cache-Control, ETag)',
        'Uniform Interface: resources identified by URLs, manipulated through representations, standard methods, self-descriptive messages, HATEOAS (links)',
        'Layered System: client cannot tell if it talks to the server directly or through a load balancer / API gateway',
        'Code on Demand (optional): server can send executable code (e.g. JavaScript)',
      ],
    },
    {
      heading: 'Designing Resource URLs',
      content:
        'Good URL design makes an API easy to guess and use.\n\nGOOD:\n  GET    /api/students            -> list students\n  GET    /api/students/7          -> one student\n  POST   /api/students            -> create\n  PUT    /api/students/7          -> replace\n  PATCH  /api/students/7          -> partial update\n  DELETE /api/students/7          -> delete\n  GET    /api/students/7/courses  -> courses of student 7 (nested)\n  GET    /api/students?city=Pune&page=0&size=10  -> filter + paging with query params\n\nBAD:\n  /api/getAllStudents, /api/createStudent, /api/deleteStudent?id=7  (verbs in URL)',
      points: [
        'Use nouns, not verbs (the HTTP method is the verb)',
        'Use plural nouns: /students not /student',
        'Lowercase and hyphens: /course-categories',
        'Path variable identifies a resource (/students/7); query parameter filters/sorts/pages a collection (?city=Pune)',
        'Version the API: /api/v1/students',
      ],
    },
    {
      heading: 'HTTP Methods',
      content:
        'Safe = does not change data. Idempotent = calling it 1 time or 10 times leaves the server in the same state.\n\nGET     read                     safe: yes  idempotent: yes  body: no\nPOST    create / action          safe: no   idempotent: NO   body: yes\nPUT     replace whole resource   safe: no   idempotent: yes  body: yes\nPATCH   update some fields       safe: no   idempotent: not guaranteed  body: yes\nDELETE  remove                   safe: no   idempotent: yes  body: usually no\nHEAD    like GET without body; OPTIONS lists allowed methods (used by CORS preflight)',
      tip: 'Interview trick: Why is POST not idempotent? Sending POST /students twice creates TWO students. Sending PUT /students/7 twice leaves student 7 with the same data.',
    },
    {
      heading: 'HTTP Status Codes',
      content:
        'The status code tells the client what happened, before it reads the body.\n\n1xx Informational, 2xx Success, 3xx Redirection, 4xx Client error (your fault), 5xx Server error (our fault).',
      points: [
        '200 OK - successful GET/PUT/PATCH with body',
        '201 Created - successful POST; add Location header with the new resource URL',
        '204 No Content - successful DELETE (or update) with no body',
        '301/302 Redirect, 304 Not Modified (caching)',
        '400 Bad Request - invalid JSON or validation failed',
        '401 Unauthorized - not logged in / missing or invalid token',
        '403 Forbidden - logged in but not allowed (wrong role)',
        '404 Not Found - resource or URL does not exist',
        '405 Method Not Allowed - e.g. DELETE on a GET-only URL',
        '409 Conflict - duplicate email, version conflict',
        '415 Unsupported Media Type - sent text instead of JSON (missing Content-Type: application/json)',
        '500 Internal Server Error - unhandled exception; 503 Service Unavailable - server down/overloaded',
      ],
    },
    {
      heading: 'Anatomy of an HTTP Request and Response',
      content:
        'Request:\n  POST /api/students HTTP/1.1                 <- method, path, version\n  Host: localhost:8080\n  Content-Type: application/json              <- format of the body I am sending\n  Accept: application/json                    <- format I want back\n  Authorization: Bearer eyJhbGciOi...         <- credentials\n  (blank line)\n  {"name":"Ravi","email":"ravi@mail.com"}     <- body\n\nResponse:\n  HTTP/1.1 201 Created\n  Location: /api/students/7\n  Content-Type: application/json\n  (blank line)\n  {"id":7,"name":"Ravi","email":"ravi@mail.com"}\n\nIn Postman: choose the method in the dropdown, type the URL, Params tab for query params, Headers tab for headers, Body > raw > JSON for the body, then Send. The response panel shows status, time, size, body and headers.',
    },
  ],
  examples: [
    {
      title: 'Pure Java: Status Code Classifier',
      scenario: 'A small Java program that classifies HTTP status codes into categories and shows which methods are idempotent - useful for memorising.',
      steps: [
        'IntelliJ: New > Java Class > Main (or Eclipse: New > Class > Main)',
        'Type the code and Run ▶',
      ],
      code: `public class Main {
    static String category(int code) {
        if (code >= 100 && code < 200) return "Informational";
        if (code < 300) return "Success";
        if (code < 400) return "Redirection";
        if (code < 500) return "Client Error";
        if (code < 600) return "Server Error";
        return "Unknown";
    }

    static boolean idempotent(String method) {
        return switch (method) {
            case "GET", "PUT", "DELETE", "HEAD", "OPTIONS" -> true;
            default -> false;
        };
    }

    public static void main(String[] args) {
        int[] codes = {200, 201, 204, 302, 400, 404, 409, 500};
        for (int c : codes) {
            System.out.println(c + " -> " + category(c));
        }
        String[] methods = {"GET", "POST", "PUT", "PATCH", "DELETE"};
        for (String m : methods) {
            System.out.println(m + " idempotent? " + idempotent(m));
        }
    }
}`,
      java: {
        files: {
          'Main.java': `public class Main {
    static String category(int code) {
        if (code >= 100 && code < 200) return "Informational";
        if (code < 300) return "Success";
        if (code < 400) return "Redirection";
        if (code < 500) return "Client Error";
        if (code < 600) return "Server Error";
        return "Unknown";
    }

    static boolean idempotent(String method) {
        return switch (method) {
            case "GET", "PUT", "DELETE", "HEAD", "OPTIONS" -> true;
            default -> false;
        };
    }

    public static void main(String[] args) {
        int[] codes = {200, 201, 204, 302, 400, 404, 409, 500};
        for (int c : codes) {
            System.out.println(c + " -> " + category(c));
        }
        String[] methods = {"GET", "POST", "PUT", "PATCH", "DELETE"};
        for (String m : methods) {
            System.out.println(m + " idempotent? " + idempotent(m));
        }
    }
}`,
        },
      },
      result: `200 -> Success
201 -> Success
204 -> Success
302 -> Redirection
400 -> Client Error
404 -> Client Error
409 -> Client Error
500 -> Server Error
GET idempotent? true
POST idempotent? false
PUT idempotent? true
PATCH idempotent? false
DELETE idempotent? true`,
      explanation: 'The first digit of a status code tells its class. PATCH is shown as false because it is not guaranteed to be idempotent (e.g. "increment stock by 1").',
    },
    {
      title: 'A RESTful Book API Showing Correct Methods and Status Codes',
      scenario: 'Build an in-memory Book API in Spring Boot that returns 200, 201 (with Location), 204, 404 and 409 correctly. We will learn the annotations in detail on Day 7; today focus on URLs, methods and status codes.',
      steps: [
        'Use the student-api project (Spring Web). Create package book',
        'Create Book record and BookController (IntelliJ: right-click package > New > Java Class; STS: New > Class)',
        'Run the application',
        'In Postman create a Collection "Book API" (Collections > + ) and add the requests shown in the result',
        'For POST/PUT: Body > raw > JSON (Postman adds Content-Type: application/json automatically)',
      ],
      code: `// ===== book/Book.java =====
package com.example.studentapi.book;

public record Book(Long id, String title, String author, String isbn) { }

// ===== book/BookController.java =====
package com.example.studentapi.book;

import java.net.URI;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/books")
public class BookController {

    private final Map<Long, Book> books = new LinkedHashMap<>();
    private final AtomicLong idGen = new AtomicLong();

    public BookController() {
        long id = idGen.incrementAndGet();
        books.put(id, new Book(id, "Clean Code", "Robert Martin", "9780132350884"));
    }

    @GetMapping                                   // GET /api/v1/books -> 200
    public Collection<Book> all() {
        return books.values();
    }

    @GetMapping("/{id}")                          // GET /api/v1/books/1 -> 200 or 404
    public ResponseEntity<Book> one(@PathVariable Long id) {
        Book b = books.get(id);
        return b == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(b);
    }

    @PostMapping                                  // POST -> 201 + Location, or 409 duplicate ISBN
    public ResponseEntity<?> create(@RequestBody Book req) {
        boolean exists = books.values().stream().anyMatch(b -> b.isbn().equals(req.isbn()));
        if (exists) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "ISBN already exists"));
        }
        long id = idGen.incrementAndGet();
        Book saved = new Book(id, req.title(), req.author(), req.isbn());
        books.put(id, saved);
        return ResponseEntity.created(URI.create("/api/v1/books/" + id)).body(saved);
    }

    @PutMapping("/{id}")                          // PUT -> 200 or 404
    public ResponseEntity<Book> replace(@PathVariable Long id, @RequestBody Book req) {
        if (!books.containsKey(id)) return ResponseEntity.notFound().build();
        Book updated = new Book(id, req.title(), req.author(), req.isbn());
        books.put(id, updated);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")                       // DELETE -> 204 or 404
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        return books.remove(id) == null
                ? ResponseEntity.notFound().build()
                : ResponseEntity.noContent().build();
    }
}`,
      result: `1) GET http://localhost:8080/api/v1/books
   200 OK
   [ { "id": 1, "title": "Clean Code", "author": "Robert Martin", "isbn": "9780132350884" } ]

2) POST http://localhost:8080/api/v1/books
   Body: { "title": "Effective Java", "author": "Joshua Bloch", "isbn": "9780134685991" }
   201 Created
   Headers: Location: /api/v1/books/2
   { "id": 2, "title": "Effective Java", "author": "Joshua Bloch", "isbn": "9780134685991" }

3) Same POST again
   409 Conflict
   { "error": "ISBN already exists" }

4) PUT http://localhost:8080/api/v1/books/2
   Body: { "title": "Effective Java 3rd Ed", "author": "Joshua Bloch", "isbn": "9780134685991" }
   200 OK
   { "id": 2, "title": "Effective Java 3rd Ed", "author": "Joshua Bloch", "isbn": "9780134685991" }

5) DELETE http://localhost:8080/api/v1/books/2  -> 204 No Content (empty body)
6) GET    http://localhost:8080/api/v1/books/2  -> 404 Not Found
7) PATCH  http://localhost:8080/api/v1/books/1  -> 405 Method Not Allowed (no PATCH mapping)`,
      explanation: 'Each operation returns the status code a client expects. The duplicate POST shows that POST is not idempotent unless you guard it. Request 7 shows Spring automatically returns 405 when the URL exists but the method is not mapped.',
    },
    {
      title: 'Path Variables vs Query Parameters vs Headers',
      scenario: 'One endpoint that reads a path variable, optional query parameters and a custom header, to understand where each piece of request data comes from.',
      steps: [
        'Add the method to a new controller SearchController',
        'Postman: GET http://localhost:8080/api/v1/authors/42/books?sort=title&limit=5',
        'Headers tab: add key X-Client-App with value mobile',
        'Send and compare; then remove the query params to see defaults',
      ],
      code: `package com.example.studentapi.book;

import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class SearchController {

    @GetMapping("/authors/{authorId}/books")
    public Map<String, Object> booksOfAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "10") int limit,
            @RequestHeader(value = "X-Client-App", defaultValue = "web") String clientApp) {

        Map<String, Object> m = new LinkedHashMap<>();
        m.put("authorId", authorId);
        m.put("sort", sort);
        m.put("limit", limit);
        m.put("clientApp", clientApp);
        return m;
    }
}`,
      result: `GET http://localhost:8080/api/v1/authors/42/books?sort=title&limit=5
Header: X-Client-App: mobile
200 OK
{ "authorId": 42, "sort": "title", "limit": 5, "clientApp": "mobile" }

GET http://localhost:8080/api/v1/authors/42/books   (no params, no header)
200 OK
{ "authorId": 42, "sort": "id", "limit": 10, "clientApp": "web" }

GET http://localhost:8080/api/v1/authors/abc/books
400 Bad Request  (abc cannot be converted to Long)`,
      explanation: 'The path variable identifies WHICH resource (author 42). Query parameters change HOW the collection is returned. Headers carry metadata (client type, auth token, content type). LinkedHashMap keeps the JSON key order predictable.',
    },
  ],
  interview: [
    { q: 'What is REST?', a: 'An architectural style for distributed systems where resources are identified by URIs and manipulated through representations (JSON/XML) using standard HTTP methods, with stateless communication.', level: 'Easy' },
    { q: 'What does stateless mean in REST?', a: 'The server does not keep client session state between requests. Every request must contain all information needed (e.g. auth token). This makes horizontal scaling easy.', level: 'Easy' },
    { q: 'Difference between PUT and PATCH?', a: 'PUT replaces the whole resource with the request body (missing fields become null/default) and is idempotent. PATCH updates only the fields sent and is not guaranteed idempotent.', level: 'Medium' },
    { q: 'Difference between PUT and POST?', a: 'POST creates a new resource under a collection (server assigns the id) and is not idempotent. PUT replaces/creates a resource at a known URI and is idempotent.', level: 'Medium' },
    { q: 'What are safe and idempotent methods?', a: 'Safe: does not modify state (GET, HEAD, OPTIONS). Idempotent: repeating the request gives the same server state (GET, PUT, DELETE, HEAD, OPTIONS). POST is neither.', level: 'Medium' },
    { q: 'Which status code for a successful create? What header should accompany it?', a: '201 Created with a Location header pointing to the new resource, e.g. Location: /api/students/7.', level: 'Easy' },
    { q: 'Difference between 401 and 403?', a: '401 Unauthorized means the client is not authenticated (no/invalid credentials). 403 Forbidden means the client is authenticated but lacks permission.', level: 'Medium' },
    { q: 'When do you return 400, 404, 409, 415?', a: '400 for malformed input/validation errors, 404 when a resource does not exist, 409 for conflicts like duplicate unique values, 415 when the Content-Type is not supported (e.g. missing application/json).', level: 'Medium' },
    { q: 'Path variable vs query parameter?', a: 'Path variable identifies a specific resource (/students/7). Query parameters filter, sort, search or paginate a collection (/students?city=Pune&page=0).', level: 'Easy' },
    { q: 'What is HATEOAS?', a: 'Hypermedia As The Engine Of Application State: responses include links to related actions/resources (e.g. self, orders) so clients can navigate the API dynamically. Spring HATEOAS supports it.', level: 'Hard' },
    { q: 'Is DELETE idempotent if the second call returns 404?', a: 'Yes. Idempotency is about server state, not the response code. After the first delete the resource is gone; further deletes do not change state.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Design RESTful URLs and methods for an e-commerce Order resource: list orders, get one, place order, cancel order, list items of an order, list orders of a customer.',
      hint: 'Use nouns and nesting; cancel can be a PATCH of status or a sub-resource action.',
      solution: `GET    /api/v1/orders                      -> list orders (200)
GET    /api/v1/orders/{orderId}            -> one order (200 / 404)
POST   /api/v1/orders                      -> place order (201 + Location)
PATCH  /api/v1/orders/{orderId}            -> body {"status":"CANCELLED"} (200)
   (alternative: POST /api/v1/orders/{orderId}/cancellation -> 201)
GET    /api/v1/orders/{orderId}/items      -> items of an order (200)
GET    /api/v1/customers/{customerId}/orders?status=DELIVERED&page=0&size=10 (200)`,
    },
    {
      task: 'Write the status code you would return for: (a) login with wrong password, (b) student with id 99 not found, (c) register with existing email, (d) user role tries admin API, (e) delete success, (f) NullPointerException in service.',
      hint: 'Think: client error vs server error.',
      solution: `(a) 401 Unauthorized
(b) 404 Not Found
(c) 409 Conflict
(d) 403 Forbidden
(e) 204 No Content
(f) 500 Internal Server Error`,
    },
    {
      task: 'Add a PATCH /api/v1/books/{id} endpoint to BookController that updates only the title sent in {"title":"..."}.',
      hint: 'Read a Map<String,String> body; keep other fields from the existing book.',
      solution: `@PatchMapping("/{id}")
public ResponseEntity<Book> patchTitle(@PathVariable Long id, @RequestBody Map<String, String> body) {
    Book old = books.get(id);
    if (old == null) return ResponseEntity.notFound().build();
    String title = body.getOrDefault("title", old.title());
    Book updated = new Book(id, title, old.author(), old.isbn());
    books.put(id, updated);
    return ResponseEntity.ok(updated);
}
// PATCH /api/v1/books/1  {"title":"Clean Code (2nd)"}
// 200 {"id":1,"title":"Clean Code (2nd)","author":"Robert Martin","isbn":"9780132350884"}`,
    },
    {
      task: 'In Postman, create an environment "local" with variable baseUrl = http://localhost:8080 and rewrite the Book requests to use {{baseUrl}}.',
      hint: 'Environments icon (top-right) > + > add variable; select the environment in the dropdown.',
      solution: `Environment "local":
  baseUrl = http://localhost:8080

Requests:
  GET    {{baseUrl}}/api/v1/books
  POST   {{baseUrl}}/api/v1/books
  PUT    {{baseUrl}}/api/v1/books/2
  DELETE {{baseUrl}}/api/v1/books/2

Switching to an environment "server" with baseUrl=http://10.0.0.5:8080 runs the same collection against the server.`,
    },
  ],
  quiz: [
    {
      question: 'Which HTTP method is NOT idempotent?',
      options: ['GET', 'PUT', 'POST', 'DELETE'],
      answer: 2,
      explanation: 'Repeating POST creates duplicates.',
    },
    {
      question: 'Best URL to get orders of customer 5?',
      options: ['/api/customers/5/orders', '/api/getOrdersByCustomer?id=5', '/api/customer/orders/get/5', '/api/orders/customer5'],
      answer: 0,
      explanation: 'Nouns, plural, nested resource.',
    },
    {
      question: 'A logged-in user without ADMIN role calls an admin API. Status?',
      options: ['401', '404', '400', '403'],
      answer: 3,
      explanation: 'Authenticated but not authorized = 403 Forbidden.',
    },
    {
      question: 'Client sends XML but API accepts only JSON. Status?',
      options: ['405', '415', '406', '500'],
      answer: 1,
      explanation: '415 Unsupported Media Type relates to the request Content-Type.',
    },
    {
      question: 'Which is TRUE about REST statelessness?',
      options: ['Server stores login session in memory', 'Client must log in once per day', 'Each request carries all info needed to process it', 'Only GET is allowed'],
      answer: 2,
      explanation: 'No client context is stored on the server between requests.',
    },
  ],
};
