export default {
  id: "day-08-servlet-lifecycle",
  title: "Servlet Introduction, Servlet Lifecycle, GenericServlet vs HttpServlet",
  module: "Module 2: Servlets",
  day: 8,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn what a servlet is, the Servlet API hierarchy (Servlet, GenericServlet, HttpServlet), how the container manages a servlet through init, service and destroy, and why one servlet object serves many requests on multiple threads.",
  objectives: [
    "Define a servlet and its role in a Java web application",
    "Describe the Servlet interface hierarchy and its five methods",
    "Explain the servlet lifecycle and when init, service and destroy run",
    "Compare GenericServlet and HttpServlet and write one of each",
    "Use load-on-startup and understand servlet thread safety"
  ],
  theory: [
    {
      heading: "What is a Servlet?",
      content: "A servlet is a Java class that runs inside a servlet container (Tomcat), receives a request and builds a response, usually HTML or JSON. Analogy: Tomcat is a call centre building; servlets are trained employees, each handling one type of call (/login, /register). The building gives them a desk, a phone and a schedule; the employee only handles the conversation.\n\nBefore servlets, CGI scripts started a new OS process per request, which was slow. Servlets are loaded once and each request runs as a lightweight thread, so they are fast and scalable.",
      points: [
        "Servlets are server-side, platform-independent Java components.",
        "The container creates the servlet object; you never write new MyServlet().",
        "A servlet has no main() method; the container calls its lifecycle methods.",
        "Modern frameworks (Spring MVC's DispatcherServlet) are themselves servlets."
      ]
    },
    {
      heading: "Servlet API Hierarchy (diagram in words)",
      content: "jakarta.servlet.Servlet (interface: init, service, destroy, getServletConfig, getServletInfo)\n      ^ implements\njakarta.servlet.GenericServlet (abstract class, protocol-independent; only service() is abstract; also implements ServletConfig)\n      ^ extends\njakarta.servlet.http.HttpServlet (abstract class, HTTP-specific; its service() reads the HTTP method and calls doGet, doPost, doPut, doDelete, doHead, doOptions, doTrace)\n      ^ extends\nYour class, e.g. LoginServlet",
      points: [
        "Servlet interface: you must implement all 5 methods (too much boilerplate).",
        "GenericServlet: you implement only service(ServletRequest, ServletResponse). Works for any protocol but has no HTTP features.",
        "HttpServlet: you override only the doXxx methods you need. Gives HttpServletRequest/HttpServletResponse with headers, cookies, sessions, redirects. Used in 99 percent of real code.",
        "HttpServlet is abstract even though it has no abstract methods, so you are forced to extend it."
      ]
    },
    {
      heading: "The Servlet Lifecycle",
      content: "The container controls the servlet's life in these stages:\n\n1. Loading and instantiation: the class is loaded and ONE object is created with the no-arg constructor, either at the first request (default, lazy) or at server start (load-on-startup).\n2. init(ServletConfig): called exactly ONCE after the object is created. Put one-time setup here (open a pool, read config). If init throws an exception the servlet is not put into service.\n3. service(request, response): called for EVERY request, each on its own thread. In HttpServlet, service() dispatches to doGet/doPost etc.\n4. destroy(): called ONCE when the app is undeployed/reloaded or the server stops. Release resources here.\n5. Garbage collection: the object becomes eligible for GC.\n\nAnalogy: a shop. init = opening the shutter in the morning (once), service = serving each customer (many times), destroy = closing the shutter at night (once).",
      points: [
        "Lifecycle methods are called by the container, never by you.",
        "Override the no-arg init(), not init(ServletConfig); if you override init(ServletConfig), call super.init(config) or getServletConfig() returns null.",
        "Do not use the constructor for setup: ServletConfig is not available yet.",
        "destroy() is not guaranteed if the JVM is killed (kill -9)."
      ]
    },
    {
      heading: "Single Instance, Multiple Threads: Thread Safety",
      content: "By default there is only ONE object of each servlet, and Tomcat uses a thread pool (default max 200 threads) to call service() on it for concurrent requests. So instance variables are shared by all users, like a single whiteboard in a classroom that everyone writes on at the same time. Local variables inside doGet are private to each thread and safe.",
      points: [
        "Keep servlets stateless: use local variables, request attributes or the session.",
        "If you must share data (e.g. a counter), use AtomicInteger or synchronized blocks.",
        "SingleThreadModel was deprecated and removed in Servlet 6.0; do not use it."
      ],
      tip: "Interview trap: 'How many objects of a servlet are created for 1000 requests?' Answer: one (per servlet declaration), with 1000 threads/requests sharing it."
    },
    {
      heading: "load-on-startup",
      content: "By default a servlet is created on its first request, so the first user waits for init(). With load-on-startup the container creates and initializes it when the application starts.",
      syntax: "<servlet>\n    <servlet-name>lifecycle</servlet-name>\n    <servlet-class>com.course.web.LifecycleServlet</servlet-class>\n    <load-on-startup>1</load-on-startup>\n</servlet>\n\n// or with annotation\n@WebServlet(urlPatterns = \"/life\", loadOnStartup = 1)",
      points: [
        "A value of 0 or more = load at startup; smaller numbers load first.",
        "Negative or missing = load lazily on the first request.",
        "Use for servlets with heavy init, e.g. a front controller or one that warms a cache."
      ]
    }
  ],
  examples: [
    {
      title: "Lifecycle servlet: watch init, service and destroy in the console",
      scenario: "Print a message in each lifecycle method and observe when Tomcat calls them.",
      steps: [
        "Use the student-web project from Day 7 (Tomcat 10.1 already configured)",
        "Create class LifecycleServlet in package com.course.web (Eclipse: New > Class, superclass jakarta.servlet.http.HttpServlet; IntelliJ: New > Java Class)",
        "Add the <servlet> and <servlet-mapping> entries below to WEB-INF/web.xml",
        "Run on Tomcat (Eclipse: Run As > Run on Server; IntelliJ: Run the Tomcat configuration)",
        "Open http://localhost:8080/student-web/life three times, then stop the server (Eclipse Servers view red square; IntelliJ red Stop button)",
        "Read the Eclipse Console / IntelliJ 'Server' (Tomcat Localhost Log) output"
      ],
      code: `// ===== com/course/web/LifecycleServlet.java =====
package com.course.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

public class LifecycleServlet extends HttpServlet {

    private final AtomicInteger hits = new AtomicInteger();

    public LifecycleServlet() {
        System.out.println("1. Constructor called");
    }

    @Override
    public void init() throws ServletException {
        System.out.println("2. init() called once. Servlet name: " + getServletName());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        int n = hits.incrementAndGet();
        System.out.println("3. doGet() request #" + n + " on thread " + Thread.currentThread().getName());
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<h3>Request number " + n + " served by the same servlet object</h3>");
    }

    @Override
    public void destroy() {
        System.out.println("4. destroy() called once. Total hits: " + hits.get());
    }
}

<!-- ===== add to WEB-INF/web.xml ===== -->
<servlet>
    <servlet-name>lifecycle</servlet-name>
    <servlet-class>com.course.web.LifecycleServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>lifecycle</servlet-name>
    <url-pattern>/life</url-pattern>
</servlet-mapping>`,
      result: "Browser (3rd visit): Request number 3 served by the same servlet object\n\nConsole:\n1. Constructor called\n2. init() called once. Servlet name: lifecycle\n3. doGet() request #1 on thread http-nio-8080-exec-1\n3. doGet() request #2 on thread http-nio-8080-exec-2\n3. doGet() request #3 on thread http-nio-8080-exec-3\n4. destroy() called once. Total hits: 3\n\n(Thread names may differ; Tomcat picks any free worker thread.)",
      explanation: "The constructor and init() run only on the first request because there is no load-on-startup. Each request runs doGet on a Tomcat worker thread, all on the same object, so the counter keeps increasing. AtomicInteger keeps the counter correct under concurrent requests. destroy() runs when the server stops or the app is redeployed."
    },
    {
      title: "GenericServlet: protocol-independent servlet",
      scenario: "Write a servlet by extending GenericServlet and implementing only service().",
      steps: [
        "Create class WelcomeGenericServlet in com.course.web",
        "Type the code; note the imports come from jakarta.servlet (not .http)",
        "Map it in web.xml to /generic (snippet included) and restart/redeploy",
        "Open http://localhost:8080/student-web/generic?name=Ravi"
      ],
      code: `// ===== com/course/web/WelcomeGenericServlet.java =====
package com.course.web;

import jakarta.servlet.GenericServlet;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class WelcomeGenericServlet extends GenericServlet {

    @Override
    public void service(ServletRequest req, ServletResponse res)
            throws ServletException, IOException {
        res.setContentType("text/html;charset=UTF-8");
        String name = req.getParameter("name");
        PrintWriter out = res.getWriter();
        out.println("<h2>Welcome " + (name == null ? "Guest" : name) + "</h2>");
        out.println("<p>Handled by GenericServlet.service()</p>");
        out.println("<p>Protocol: " + req.getProtocol() + "</p>");
    }
}

<!-- ===== web.xml ===== -->
<servlet>
    <servlet-name>generic</servlet-name>
    <servlet-class>com.course.web.WelcomeGenericServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>generic</servlet-name>
    <url-pattern>/generic</url-pattern>
</servlet-mapping>`,
      result: "Welcome Ravi\nHandled by GenericServlet.service()\nProtocol: HTTP/1.1",
      explanation: "GenericServlet's service() receives every request regardless of GET or POST, because it does not know about HTTP methods. ServletRequest has getParameter, but no getMethod, getSession or cookies; for those you need HttpServletRequest from HttpServlet."
    },
    {
      title: "Implementing the Servlet interface directly (all five methods)",
      scenario: "See what GenericServlet and HttpServlet save you from by implementing jakarta.servlet.Servlet by hand.",
      steps: [
        "Create class RawServlet in com.course.web",
        "Type the code and map it to /raw in web.xml with <load-on-startup>1</load-on-startup>",
        "Restart Tomcat and watch the console: init runs during startup, before any request",
        "Open http://localhost:8080/student-web/raw"
      ],
      code: `// ===== com/course/web/RawServlet.java =====
package com.course.web;

import jakarta.servlet.Servlet;
import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import java.io.IOException;

public class RawServlet implements Servlet {

    private ServletConfig config;

    @Override
    public void init(ServletConfig config) throws ServletException {
        this.config = config;                // we must store it ourselves
        System.out.println("RawServlet init at startup: " + config.getServletName());
    }

    @Override
    public ServletConfig getServletConfig() {
        return config;
    }

    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        res.setContentType("text/plain");
        res.getWriter().println("Hello from a class that implements Servlet directly");
    }

    @Override
    public String getServletInfo() {
        return "RawServlet v1.0";
    }

    @Override
    public void destroy() {
        System.out.println("RawServlet destroyed");
    }
}

<!-- ===== web.xml ===== -->
<servlet>
    <servlet-name>raw</servlet-name>
    <servlet-class>com.course.web.RawServlet</servlet-class>
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>raw</servlet-name>
    <url-pattern>/raw</url-pattern>
</servlet-mapping>`,
      result: "Console at server startup (before any browser request):\nRawServlet init at startup: raw\n\nBrowser: Hello from a class that implements Servlet directly\n\nConsole when server stops:\nRawServlet destroyed",
      explanation: "Implementing the interface forces you to write all five methods and to store the ServletConfig yourself. GenericServlet does this boilerplate; HttpServlet adds HTTP dispatching on top. load-on-startup 1 made Tomcat create and initialize the servlet while deploying the application."
    },
    {
      title: "HttpServlet dispatching: doGet vs doPost from one page",
      scenario: "One servlet with doGet and doPost; an HTML page sends the same URL by GET (link) and POST (form) to show that HttpServlet.service() picks the right method.",
      steps: [
        "Create src/main/webapp/methods.html and class MethodServlet in com.course.web",
        "MethodServlet uses @WebServlet so no web.xml entry is needed (details on Day 10)",
        "Redeploy and open http://localhost:8080/student-web/methods.html",
        "Click the link, then go back and click the button; compare the outputs"
      ],
      code: `<!-- ===== src/main/webapp/methods.html ===== -->
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>GET vs POST</title></head>
<body>
    <a href="method?city=Pune">Send GET request</a>
    <form action="method" method="post">
        <input type="hidden" name="city" value="Delhi">
        <button type="submit">Send POST request</button>
    </form>
</body>
</html>

// ===== com/course/web/MethodServlet.java =====
package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/method")
public class MethodServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        write(resp, "doGet", req.getParameter("city"), req.getQueryString());
    }

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        write(resp, "doPost", req.getParameter("city"), req.getQueryString());
    }

    private void write(HttpServletResponse resp, String method, String city, String qs)
            throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<p>Handled by " + method + ", city = " + city
                + ", query string = " + qs + "</p>");
    }
}`,
      result: "Clicking the link (URL shows /method?city=Pune):\nHandled by doGet, city = Pune, query string = city=Pune\n\nClicking the button (URL shows /method):\nHandled by doPost, city = Delhi, query string = null",
      explanation: "HttpServlet.service() reads req.getMethod() and calls doGet or doPost. GET parameters travel in the URL so getQueryString() returns them; POST parameters travel in the body, so the query string is null, yet getParameter() reads both the same way."
    }
  ],
  interview: [
    { q: "What is a servlet?", a: "A Java class that runs in a servlet container, handles client requests and generates dynamic responses. It extends HttpServlet (usually) and is managed by the container's lifecycle.", level: "Easy" },
    { q: "Explain the servlet lifecycle.", a: "The container loads the class, creates one instance, calls init() once, calls service() for every request (dispatching to doGet/doPost in HttpServlet), and calls destroy() once before removing the servlet; then it is garbage collected.", level: "Easy" },
    { q: "How many times are init(), service() and destroy() called?", a: "init() once, service() once per request, destroy() once.", level: "Easy" },
    { q: "Difference between GenericServlet and HttpServlet?", a: "GenericServlet is protocol independent and requires implementing service(ServletRequest, ServletResponse). HttpServlet extends GenericServlet, is HTTP specific, and its service() dispatches to doGet/doPost/etc. with HttpServletRequest/Response supporting headers, cookies, sessions and redirects.", level: "Medium" },
    { q: "Why is HttpServlet abstract when it has no abstract methods?", a: "To prevent direct instantiation; it is meaningless on its own because the default doXxx methods just return 405/400 errors. You must subclass it and override at least one doXxx method.", level: "Hard" },
    { q: "Can we write a constructor in a servlet?", a: "Yes, a public no-arg constructor (the container uses it). But ServletConfig/ServletContext are not available yet, so initialization should be done in init().", level: "Medium" },
    { q: "What is load-on-startup?", a: "A web.xml element (or loadOnStartup attribute) telling the container to create and initialize the servlet at application startup instead of on the first request. Non-negative values load at startup in ascending order.", level: "Medium" },
    { q: "Are servlets thread safe?", a: "No, not automatically. One instance handles many concurrent requests on different threads, so instance variables are shared. Keep servlets stateless or protect shared state with synchronization/atomic classes.", level: "Medium" },
    { q: "What happens if you override service() in an HttpServlet?", a: "Your service() receives every request and doGet/doPost are never called unless you call super.service(req, resp).", level: "Hard" },
    { q: "What is the difference between init() and init(ServletConfig)?", a: "init(ServletConfig) is the lifecycle method called by the container; GenericServlet's version stores the config and then calls the no-arg init(). Override the no-arg init() for convenience; if you override init(ServletConfig), call super.init(config).", level: "Hard" },
    { q: "What happens if doPost is not overridden and a POST arrives?", a: "HttpServlet's default doPost sends HTTP 405 Method Not Allowed (or 400 for HTTP/1.0).", level: "Medium" }
  ],
  practice: [
    {
      task: "Create a servlet that loads a list of course names in init() (once) and prints them on every GET request.",
      hint: "Store the list in a final-like instance field initialized in init(); it is read-only so it is thread safe.",
      solution: `package com.course.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.List;

@WebServlet("/courses")
public class CourseListServlet extends HttpServlet {
    private List<String> courses;

    @Override
    public void init() throws ServletException {
        courses = List.of("Core Java", "Advanced Java", "Spring Boot", "React");
        System.out.println("Courses loaded: " + courses.size());
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Our Courses</h2><ol>");
        for (String c : courses) {
            out.println("<li>" + c + "</li>");
        }
        out.println("</ol>");
    }
}`
    },
    {
      task: "Write a GenericServlet that prints the sum of two numbers sent as parameters a and b (e.g. /sum?a=4&b=6).",
      hint: "Integer.parseInt(req.getParameter(\"a\")); handle missing values with a message.",
      solution: `package com.course.web;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebServlet;
import java.io.IOException;

@WebServlet("/sum")
public class SumServlet extends GenericServlet {
    @Override
    public void service(ServletRequest req, ServletResponse res) throws ServletException, IOException {
        res.setContentType("text/plain");
        String a = req.getParameter("a");
        String b = req.getParameter("b");
        if (a == null || b == null) {
            res.getWriter().println("Please pass a and b, e.g. /sum?a=4&b=6");
            return;
        }
        int sum = Integer.parseInt(a) + Integer.parseInt(b);
        res.getWriter().println(a + " + " + b + " = " + sum);
    }
}`
    },
    {
      task: "Demonstrate the thread-safety problem: write a servlet with a plain int counter and a second with AtomicInteger; hit both 1000 times in parallel and compare.",
      hint: "Use a load tool like 'ab -n 1000 -c 50 URL' (Apache Bench) or a small Java client; the plain int will often show less than 1000.",
      solution: `package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.concurrent.atomic.AtomicInteger;

@WebServlet(urlPatterns = {"/unsafe", "/safe"})
public class CounterServlet extends HttpServlet {
    private int unsafeCount = 0;                       // shared, not thread safe
    private final AtomicInteger safeCount = new AtomicInteger();

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain");
        if (req.getServletPath().equals("/unsafe")) {
            unsafeCount++;                             // read-modify-write race
            resp.getWriter().println("unsafe=" + unsafeCount);
        } else {
            resp.getWriter().println("safe=" + safeCount.incrementAndGet());
        }
    }
}
// Test: ab -n 1000 -c 50 http://localhost:8080/student-web/unsafe
//       ab -n 1000 -c 50 http://localhost:8080/student-web/safe
// Then open each URL once more: safe shows 1001, unsafe often shows a smaller number.`
    },
    {
      task: "Write a servlet that overrides service() in HttpServlet, logs the method and URI, and then still lets doGet run.",
      hint: "Call super.service(req, resp) after logging.",
      solution: `package com.course.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/logged")
public class LoggingServlet extends HttpServlet {

    @Override
    protected void service(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        System.out.println("Incoming " + req.getMethod() + " " + req.getRequestURI());
        super.service(req, resp);          // without this, doGet is never called
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain");
        resp.getWriter().println("doGet still executed");
    }
}`
    }
  ],
  quiz: [
    { question: "How many times is init() called for a servlet?", options: ["Once per request", "Once per user", "Once in its lifetime", "Twice: at start and end"], answer: 2, explanation: "init() runs exactly once after the servlet object is created." },
    { question: "Which class dispatches requests to doGet and doPost?", options: ["HttpServlet", "GenericServlet", "Servlet", "ServletConfig"], answer: 0, explanation: "HttpServlet.service() checks the HTTP method and calls the matching doXxx." },
    { question: "By default, when is a servlet instance created?", options: ["When Tomcat is installed", "When the WAR is built", "On every request", "On the first request to it"], answer: 3, explanation: "Without load-on-startup, servlets are created lazily on first request." },
    { question: "Which method must be implemented when extending GenericServlet?", options: ["doGet()", "service()", "init()", "destroy()"], answer: 1, explanation: "service(ServletRequest, ServletResponse) is GenericServlet's only abstract method." },
    { question: "Why should servlets avoid mutable instance variables?", options: ["They are not allowed by the compiler", "They slow down Tomcat startup", "One instance is shared by many request threads", "They are reset after every request"], answer: 2, explanation: "Concurrent threads share the single servlet instance, causing race conditions." }
  ]
};
