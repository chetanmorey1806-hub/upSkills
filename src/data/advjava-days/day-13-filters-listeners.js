export default {
  id: 'day-13-filters-listeners',
  title: 'Filters and Listeners',
  module: 'Module 2: Servlets',
  day: 13,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Filters run code before and after Servlets (logging, authentication, encoding), and Listeners react to events such as application start, session creation and attribute changes.',
  objectives: [
    'Explain the Filter lifecycle and FilterChain',
    'Write filters with @WebFilter and web.xml, and control their order',
    'Build logging, encoding and authentication filters',
    'Use ServletContextListener, HttpSessionListener and attribute listeners',
    'Count active users with a session listener',
  ],
  theory: [
    {
      heading: 'What is a Filter?',
      content:
        'A Filter is an object that intercepts requests BEFORE they reach a Servlet/JSP and responses AFTER the Servlet finishes. It is used for cross-cutting work that many pages need: logging, authentication, setting character encoding, compression, measuring time, blocking IPs.\n\nAnalogy: a security check at an airport. Every passenger (request) passes through the check before reaching the gate (Servlet). The check can let you pass (chain.doFilter) or stop you (send error/redirect).\n\nDiagram in words:\nBrowser -> Filter1 (before) -> Filter2 (before) -> Servlet -> Filter2 (after) -> Filter1 (after) -> Browser.',
    },
    {
      heading: 'Filter interface and lifecycle',
      content:
        'jakarta.servlet.Filter has three methods. init(FilterConfig) runs once when the application starts (filters are created eagerly at deployment, unlike Servlets). doFilter(request, response, chain) runs for every matching request. destroy() runs once at shutdown. In Servlet 4.0+ init and destroy are default methods, so you only need doFilter. For HTTP you can extend jakarta.servlet.http.HttpFilter which gives doFilter(HttpServletRequest, HttpServletResponse, FilterChain).',
      syntax: `@WebFilter("/*")
public class MyFilter implements Filter {
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        // before Servlet
        chain.doFilter(req, res);   // pass to next filter or the Servlet
        // after Servlet
    }
}`,
      points: [
        'If you do NOT call chain.doFilter(), the request stops at this filter (use this to block).',
        'URL patterns: "/*" all, "/admin/*" folder, "*.jsp" extension, or servletNames = "X".',
        'dispatcherTypes lets a filter also run on FORWARD, INCLUDE or ERROR dispatches (default only REQUEST).',
      ],
    },
    {
      heading: 'Filter order',
      content:
        'When several filters match the same URL, the order is decided by <filter-mapping> order in web.xml. With @WebFilter annotations the order is NOT guaranteed by the specification (Tomcat uses class name order but you must not rely on it). So if order matters (e.g. encoding filter must run before auth filter), declare them in web.xml.',
      syntax: `<filter>
  <filter-name>encoding</filter-name>
  <filter-class>com.demo.EncodingFilter</filter-class>
  <init-param><param-name>encoding</param-name><param-value>UTF-8</param-value></init-param>
</filter>
<filter-mapping>
  <filter-name>encoding</filter-name>
  <url-pattern>/*</url-pattern>
</filter-mapping>`,
    },
    {
      heading: 'What is a Listener?',
      content:
        'A Listener is a class that the container calls automatically when an event happens in the web application. You do not call it; you just register it with @WebListener or <listener> in web.xml.\n\nAnalogy: a doorbell. When someone presses the button (event), the bell rings (listener method) automatically.\n\nMain listener interfaces:\n- ServletContextListener: contextInitialized / contextDestroyed (app start/stop) - load config, create DB pool, start schedulers.\n- HttpSessionListener: sessionCreated / sessionDestroyed - count online users.\n- ServletRequestListener: requestInitialized / requestDestroyed - per request.\n- ServletContextAttributeListener, HttpSessionAttributeListener, ServletRequestAttributeListener: attributeAdded / Removed / Replaced.\n- HttpSessionBindingListener: implemented by the object stored in session; valueBound / valueUnbound.\n- HttpSessionActivationListener: session moved between JVMs (clustering).',
    },
    {
      heading: 'Filter vs Servlet vs Listener',
      content:
        'Servlet: handles a request and produces a response (business entry point).\nFilter: wraps around Servlets to pre/post-process requests; does not usually produce the main response.\nListener: not tied to URLs; reacts to lifecycle events of the app, sessions, requests and attributes.',
      tip: 'A common interview line: "Filters are based on the Intercepting Filter / Chain of Responsibility pattern; Listeners are based on the Observer pattern."',
    },
    {
      heading: 'Common mistakes',
      content: 'Avoid these when writing filters and listeners:',
      points: [
        'Forgetting chain.doFilter() - every page becomes blank.',
        'Auth filter mapped to "/*" that also blocks login.html and CSS - user can never log in (redirect loop). Exclude public URLs.',
        'Casting ServletRequest to HttpServletRequest without checking in non-HTTP context (fine in web apps).',
        'Setting request encoding AFTER reading a parameter - it has no effect.',
        'Doing heavy work in sessionCreated - it runs for every visitor.',
      ],
    },
  ],
  examples: [
    {
      title: 'Logging and timing filter for all requests',
      scenario: 'Print the method, URI and time taken (ms) for every request to the Tomcat console.',
      steps: [
        'Eclipse: in project "filter-demo" (Dynamic Web Project, Tomcat 10.1) right-click src > New > Filter (Eclipse has a wizard; tick doFilter), name LogFilter, URL mapping /*.',
        'IntelliJ: right-click package > New > Filter (Jakarta EE plugin) or New > Java Class and add @WebFilter.',
        'Run on server; open any page; watch the Console (Eclipse) or Tomcat Localhost Log / Server tab (IntelliJ).',
      ],
      code: `package com.demo;

import jakarta.servlet.*;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebFilter("/*")
public class LogFilter implements Filter {

    @Override
    public void init(FilterConfig config) {
        System.out.println("LogFilter initialised");
    }

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        HttpServletRequest req = (HttpServletRequest) request;
        long start = System.currentTimeMillis();

        chain.doFilter(request, response);         // go to Servlet

        long time = System.currentTimeMillis() - start;
        HttpServletResponse resp = (HttpServletResponse) response;
        System.out.println(req.getMethod() + " " + req.getRequestURI()
                + " -> " + resp.getStatus() + " in " + time + " ms");
    }

    @Override
    public void destroy() {
        System.out.println("LogFilter destroyed");
    }
}`,
      result: 'Console at startup: LogFilter initialised\nFor each request, e.g.:\nGET /filter-demo/index.html -> 200 in 3 ms\nGET /filter-demo/hello -> 200 in 12 ms\n(times vary)',
      explanation: 'Code before chain.doFilter runs before the Servlet; code after runs once the response is produced. init runs at deployment, destroy when Tomcat stops or the app is undeployed.',
    },
    {
      title: 'Authentication filter protecting /admin/*',
      scenario: 'Any URL under /admin/ requires a logged-in session attribute "user". Otherwise redirect to the login page.',
      steps: [
        'Create AuthFilter extending HttpFilter with @WebFilter("/admin/*").',
        'Create AdminHomeServlet mapped to /admin/home and a simple LoginServlet (/login?user=x sets session attribute).',
        'Test: open /admin/home (redirected), then /login?user=ravi, then /admin/home (works).',
      ],
      code: `// AuthFilter.java
package com.demo;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebFilter;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebFilter("/admin/*")
public class AuthFilter extends HttpFilter {
    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        HttpSession session = req.getSession(false);
        boolean loggedIn = session != null && session.getAttribute("user") != null;
        if (loggedIn) {
            chain.doFilter(req, res);
        } else {
            res.sendRedirect(req.getContextPath() + "/login.html");
        }
    }
}

// LoginServlet.java (demo only - no password)
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.getSession().setAttribute("user", req.getParameter("user"));
        resp.sendRedirect(req.getContextPath() + "/admin/home");
    }
}

// AdminHomeServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/admin/home")
public class AdminHomeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");
        resp.getWriter().println("<h2>Admin Home - hello "
                + req.getSession().getAttribute("user") + "</h2>");
    }
}

<!-- webapp/login.html -->
<form action="login">User: <input name="user"><button>Login</button></form>`,
      result: '/admin/home without login -> browser lands on login.html.\nAfter /login?user=ravi -> "Admin Home - hello ravi".',
      explanation: 'The filter is mapped only to /admin/*, so login.html and /login stay public and there is no redirect loop. AdminHomeServlet contains no security code at all; the filter does it for every admin URL.',
    },
    {
      title: 'Encoding filter with init-param in web.xml (ordered filters)',
      scenario: 'Make sure all request parameters are read as UTF-8 (Hindi/Marathi names) and the encoding filter runs before the log filter.',
      steps: [
        'Remove @WebFilter from LogFilter (or keep only web.xml config) to control order.',
        'Open src/main/webapp/WEB-INF/web.xml and add the filter and filter-mapping blocks below.',
        'Create EncodingFilter.',
        'Restart Tomcat; submit a form with "राम" as name; it prints correctly.',
      ],
      code: `<!-- WEB-INF/web.xml -->
<?xml version="1.0" encoding="UTF-8"?>
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

  <filter>
    <filter-name>encodingFilter</filter-name>
    <filter-class>com.demo.EncodingFilter</filter-class>
    <init-param>
      <param-name>encoding</param-name>
      <param-value>UTF-8</param-value>
    </init-param>
  </filter>
  <filter>
    <filter-name>logFilter</filter-name>
    <filter-class>com.demo.LogFilter</filter-class>
  </filter>

  <!-- order of filter-mapping = order of execution -->
  <filter-mapping>
    <filter-name>encodingFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
  <filter-mapping>
    <filter-name>logFilter</filter-name>
    <url-pattern>/*</url-pattern>
  </filter-mapping>
</web-app>

// EncodingFilter.java
package com.demo;

import jakarta.servlet.*;
import java.io.IOException;

public class EncodingFilter implements Filter {
    private String encoding;

    @Override
    public void init(FilterConfig config) {
        encoding = config.getInitParameter("encoding");
        if (encoding == null) encoding = "UTF-8";
    }

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        req.setCharacterEncoding(encoding);
        res.setCharacterEncoding(encoding);
        chain.doFilter(req, res);
    }
}`,
      result: 'Execution order for every request: EncodingFilter -> LogFilter -> Servlet -> LogFilter (after) -> EncodingFilter (after). Non-English form input is displayed correctly.',
      explanation: 'FilterConfig.getInitParameter reads values from web.xml. Encoding must be set before any parameter is read, which is why this filter must be first.',
    },
    {
      title: 'Listeners: app start-up and online users counter',
      scenario: 'Print a message when the app starts/stops, store the start time in ServletContext, and count active sessions with HttpSessionListener.',
      steps: [
        'Create AppListener implementing ServletContextListener and SessionCounter implementing HttpSessionListener, both with @WebListener.',
        'Create OnlineServlet (/online) that calls request.getSession() and prints counts.',
        'Run; open /online in Chrome, then in Firefox or an Incognito window; refresh the first window.',
      ],
      code: `// AppListener.java
package com.demo;

import jakarta.servlet.ServletContextEvent;
import jakarta.servlet.ServletContextListener;
import jakarta.servlet.annotation.WebListener;
import java.time.LocalDateTime;

@WebListener
public class AppListener implements ServletContextListener {
    @Override
    public void contextInitialized(ServletContextEvent sce) {
        sce.getServletContext().setAttribute("startedAt", LocalDateTime.now().withNano(0));
        System.out.println("Application started");
    }

    @Override
    public void contextDestroyed(ServletContextEvent sce) {
        System.out.println("Application stopped");
    }
}

// SessionCounter.java
package com.demo;

import jakarta.servlet.annotation.WebListener;
import jakarta.servlet.http.HttpSessionEvent;
import jakarta.servlet.http.HttpSessionListener;
import java.util.concurrent.atomic.AtomicInteger;

@WebListener
public class SessionCounter implements HttpSessionListener {
    public static final AtomicInteger ACTIVE = new AtomicInteger();

    @Override
    public void sessionCreated(HttpSessionEvent se) {
        System.out.println("Session created: " + se.getSession().getId()
                + " active=" + ACTIVE.incrementAndGet());
    }

    @Override
    public void sessionDestroyed(HttpSessionEvent se) {
        System.out.println("Session destroyed, active=" + ACTIVE.decrementAndGet());
    }
}

// OnlineServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/online")
public class OnlineServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        req.getSession();   // ensures this visitor has a session
        resp.setContentType("text/html");
        resp.getWriter().println("<p>App started at: "
                + getServletContext().getAttribute("startedAt") + "</p>"
                + "<p>Users online: " + SessionCounter.ACTIVE.get() + "</p>");
    }
}`,
      result: 'Console: "Application started" at deployment.\nFirst browser /online: "Users online: 1". Second browser: "Users online: 2". Refresh first browser: still 2. After 30 minutes idle or invalidate(), console prints "Session destroyed, active=1".',
      explanation: 'The container calls listener methods automatically. AtomicInteger keeps the count thread-safe because many sessions can be created at the same time. Note that JSP pages create sessions by default, which also increases the count.',
    },
  ],
  interview: [
    { q: 'What is a Filter in Servlet?', a: 'An object that intercepts requests and responses for matching URLs to perform pre-processing and post-processing like authentication, logging, encoding, compression.', level: 'Easy' },
    { q: 'What are the lifecycle methods of a Filter?', a: 'init(FilterConfig) once at deployment, doFilter(request, response, chain) per request, destroy() once at shutdown.', level: 'Easy' },
    { q: 'What is FilterChain?', a: 'An object given by the container that represents the remaining filters and the target resource. chain.doFilter() passes the request to the next filter or, if it is the last one, to the Servlet.', level: 'Easy' },
    { q: 'What happens if a filter does not call chain.doFilter()?', a: 'The request does not reach the next filter or the Servlet. The filter must then produce the response itself (e.g. redirect or error).', level: 'Medium' },
    { q: 'How is the order of multiple filters decided?', a: 'By the order of <filter-mapping> elements in web.xml. For annotation-only filters the order is unspecified, so use web.xml when order matters.', level: 'Medium' },
    { q: 'When is a Filter instance created compared to a Servlet?', a: 'Filters are instantiated and initialised when the application is deployed. Servlets are by default created on the first request unless load-on-startup is set.', level: 'Medium' },
    { q: 'What is a Listener?', a: 'A class whose methods are called by the container when lifecycle events occur (context start/stop, session create/destroy, attribute changes, request start/end). It follows the Observer pattern.', level: 'Easy' },
    { q: 'Name the main listener interfaces.', a: 'ServletContextListener, ServletContextAttributeListener, HttpSessionListener, HttpSessionAttributeListener, HttpSessionBindingListener, HttpSessionActivationListener, HttpSessionIdListener, ServletRequestListener, ServletRequestAttributeListener.', level: 'Medium' },
    { q: 'Difference between HttpSessionAttributeListener and HttpSessionBindingListener?', a: 'HttpSessionAttributeListener is registered with the container and notified for ANY attribute added/removed/replaced in any session. HttpSessionBindingListener is implemented by the attribute object itself and notified only when THAT object is bound or unbound; it needs no registration.', level: 'Hard' },
    { q: 'Where would you initialise a database connection pool in a web app?', a: 'In ServletContextListener.contextInitialized(), storing the DataSource as a context attribute, and close it in contextDestroyed().', level: 'Medium' },
    { q: 'What are dispatcherTypes in a filter mapping?', a: 'They decide on which dispatches the filter runs: REQUEST (default), FORWARD, INCLUDE, ERROR, ASYNC. E.g. dispatcherTypes = {DispatcherType.REQUEST, DispatcherType.FORWARD}.', level: 'Hard' },
    { q: 'Which design patterns do Filters and Listeners follow?', a: 'Filters follow Intercepting Filter / Chain of Responsibility; Listeners follow the Observer pattern.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write an IP blocking filter that returns 403 for requests from 192.168.1.50 and lets all others through.',
      hint: 'request.getRemoteAddr(); response.sendError(403).',
      solution: `@WebFilter("/*")
public class IpBlockFilter extends HttpFilter {
    private static final java.util.Set<String> BLOCKED = java.util.Set.of("192.168.1.50");

    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        if (BLOCKED.contains(req.getRemoteAddr())) {
            res.sendError(HttpServletResponse.SC_FORBIDDEN, "Your IP is blocked");
            return;
        }
        chain.doFilter(req, res);
    }
}`,
    },
    {
      task: 'Write a filter that adds a header "X-App-Version: 1.0" and disables caching for all /secure/* pages.',
      hint: 'Set headers before chain.doFilter (before the response is committed).',
      solution: `@WebFilter("/secure/*")
public class NoCacheFilter extends HttpFilter {
    @Override
    protected void doFilter(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        res.setHeader("X-App-Version", "1.0");
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setDateHeader("Expires", 0);
        chain.doFilter(req, res);
    }
}`,
    },
    {
      task: 'Write an HttpSessionAttributeListener that logs every time "user" is added to or removed from a session.',
      hint: 'Implement attributeAdded and attributeRemoved; check event.getName().',
      solution: `@WebListener
public class UserAttrListener implements HttpSessionAttributeListener {
    @Override
    public void attributeAdded(HttpSessionBindingEvent e) {
        if ("user".equals(e.getName())) System.out.println("LOGIN: " + e.getValue());
    }
    @Override
    public void attributeRemoved(HttpSessionBindingEvent e) {
        if ("user".equals(e.getName())) System.out.println("LOGOUT: " + e.getValue());
    }
}`,
    },
    {
      task: 'Write a ServletContextListener that reads a context-param "appName" from web.xml at startup and stores it as a context attribute "title". Show it in a Servlet.',
      hint: '<context-param> in web.xml; sce.getServletContext().getInitParameter("appName").',
      solution: `<!-- web.xml -->
<context-param>
  <param-name>appName</param-name>
  <param-value>Student Portal</param-value>
</context-param>

@WebListener
public class TitleListener implements ServletContextListener {
    public void contextInitialized(ServletContextEvent sce) {
        ServletContext ctx = sce.getServletContext();
        ctx.setAttribute("title", ctx.getInitParameter("appName").toUpperCase());
    }
}

@WebServlet("/title")
public class TitleServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.getWriter().println(getServletContext().getAttribute("title")); // STUDENT PORTAL
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Which call passes the request to the next filter or Servlet?',
      options: ['chain.next()', 'chain.doFilter(req, res)', 'filter.forward()', 'super.doFilter()'],
      answer: 1,
      explanation: 'FilterChain.doFilter continues the chain.',
    },
    {
      question: 'How is filter order guaranteed?',
      options: ['Alphabetical class names', 'Order of @WebFilter annotations', 'Order of <filter-mapping> in web.xml', 'Random'],
      answer: 2,
      explanation: 'The specification guarantees order only through web.xml filter-mapping order.',
    },
    {
      question: 'Which listener is best to create a connection pool at application start?',
      options: ['ServletContextListener', 'HttpSessionListener', 'ServletRequestListener', 'HttpSessionBindingListener'],
      answer: 0,
      explanation: 'contextInitialized runs once when the app is deployed.',
    },
    {
      question: 'An auth filter mapped to "/*" redirects to login.html when not logged in. What problem occurs?',
      options: ['Nothing', 'Login page loads twice', 'Session is invalidated', 'Infinite redirect loop because login.html is also filtered'],
      answer: 3,
      explanation: 'The login page itself is protected, so the redirect repeats forever. Exclude public URLs.',
    },
    {
      question: 'Listeners in Servlets are an example of which design pattern?',
      options: ['Singleton', 'Factory', 'Observer', 'Builder'],
      answer: 2,
      explanation: 'Listeners subscribe to events and are notified by the container.',
    },
  ],
};
