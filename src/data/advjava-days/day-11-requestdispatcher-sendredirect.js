export default {
  id: 'day-11-requestdispatcher-sendredirect',
  title: 'RequestDispatcher (forward, include) vs sendRedirect',
  module: 'Module 2: Servlets',
  day: 11,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn how one Servlet hands work to another resource on the server (forward and include) and how to send the browser to a new URL (sendRedirect), and when to use each one.',
  objectives: [
    'Explain what a RequestDispatcher is and how to obtain one',
    'Use forward() and include() correctly and know their rules',
    'Use response.sendRedirect() and explain the two-request round trip',
    'Choose between forward and redirect, including the Post/Redirect/Get pattern',
    'Share data between Servlets using request attributes',
  ],
  theory: [
    {
      heading: 'Why do Servlets need to talk to each other?',
      content:
        'In a real web application one Servlet rarely does everything. A LoginServlet checks the password, then a WelcomeServlet (or a JSP) shows the home page. A ReportServlet wants a common header and footer added to every page. So we need a way to pass control from one web resource to another. Jakarta Servlet gives us two tools: RequestDispatcher (server-side, the browser does not know) and sendRedirect (client-side, the browser is told to go somewhere else).\n\nAnalogy: you call a company help desk. With forward, the receptionist silently transfers your call to the right person - you are still on the same phone call. With redirect, the receptionist says "Please hang up and dial 1800-XYZ" - you make a brand new call yourself.',
    },
    {
      heading: 'RequestDispatcher: forward()',
      content:
        'A RequestDispatcher is an object that can send a request to another resource (Servlet, JSP or HTML) in the SAME web application. forward() transfers full control: the target resource produces the whole response, and the output of the first Servlet is thrown away. The URL in the browser address bar does NOT change, because the browser made only one request.\n\nDiagram in words:\nBrowser --(1 request /login)--> LoginServlet --forward--> WelcomeServlet --(1 response)--> Browser. Address bar still shows /login.',
      syntax: `RequestDispatcher rd = request.getRequestDispatcher("/welcome");
request.setAttribute("user", name);   // share data
rd.forward(request, response);        // control never comes back to write output`,
      points: [
        'Same request and response objects are passed, so request attributes and parameters are visible in the target.',
        'Works only inside the same server/application (cannot forward to google.com).',
        'Call forward() BEFORE the response is committed (before flushing output), else IllegalStateException.',
        'Anything you wrote to the response buffer earlier is cleared.',
        'Path starting with "/" is relative to the context root.',
      ],
    },
    {
      heading: 'RequestDispatcher: include()',
      content:
        'include() runs another resource and inserts its output into the current response, then control COMES BACK to the first Servlet. Think of it like calling a method that prints something. It is used for common parts like a header, footer or menu.\n\nDiagram in words:\nBrowser -> PageServlet writes "<html>" -> include(/header) writes header -> PageServlet writes body -> include(/footer) -> PageServlet writes "</html>" -> Browser.',
      syntax: `RequestDispatcher rd = request.getRequestDispatcher("/header");
rd.include(request, response);   // header output added, then we continue`,
      points: [
        'The included resource cannot change status code or headers (those calls are ignored).',
        'Output from both resources is combined.',
        'Control returns to the caller after include().',
      ],
    },
    {
      heading: 'sendRedirect()',
      content:
        'response.sendRedirect(url) sends a 302 (Found) status with a Location header to the browser. The browser then makes a NEW request to that URL. So there are two request-response cycles, the address bar changes, and request attributes are lost (because it is a new request). It can go to any URL, even another website.\n\nDiagram in words:\n1) Browser --POST /save--> SaveServlet --302 Location: /list--> Browser\n2) Browser --GET /list--> ListServlet --200 page--> Browser. Address bar shows /list.',
      syntax: `response.sendRedirect(request.getContextPath() + "/list");   // same app
response.sendRedirect("https://www.google.com");               // external`,
      points: [
        'Use request.getContextPath() so the link works whatever the app is deployed as.',
        'Pass data via query string (?msg=saved) or session, not request attributes.',
        'Do not write output after calling sendRedirect; return from the method.',
      ],
    },
    {
      heading: 'forward vs sendRedirect: comparison',
      content:
        'Use this table to choose:\n- Who does the work: forward = server; redirect = browser.\n- Number of requests: forward = 1; redirect = 2.\n- URL in address bar: forward = unchanged; redirect = changes.\n- Request attributes: forward = kept; redirect = lost.\n- Target: forward = same app only; redirect = any URL.\n- Speed: forward is faster (no extra round trip).\n- Refresh (F5) behaviour: after forward from a POST, F5 re-submits the form; after redirect, F5 only repeats the harmless GET.',
      tip: 'Post/Redirect/Get (PRG) pattern: after a successful POST that changes data (insert, update, delete), always sendRedirect to a GET page. This stops duplicate form submissions when the user presses refresh.',
    },
    {
      heading: 'Getting a RequestDispatcher and common mistakes',
      content:
        'There are two ways: request.getRequestDispatcher(path) accepts relative or "/" paths; servletContext.getRequestDispatcher(path) requires a path starting with "/". There is also servletContext.getNamedDispatcher("servletName") which uses the Servlet name.',
      points: [
        'Mistake: writing out.println() then forward() - the text is lost or IllegalStateException if already flushed.',
        'Mistake: using request.setAttribute() and then sendRedirect() - attribute is null in the next page.',
        'Mistake: forgetting return after forward/redirect, so later code still runs.',
        'Mistake: sendRedirect("/list") without context path gives 404 when the app is not at the root.',
        'Files inside WEB-INF cannot be opened directly by the browser, but CAN be reached with forward. This is how we hide JSPs.',
      ],
    },
  ],
  examples: [
    {
      title: 'Login check with forward (success) and include (failure)',
      scenario: 'A login form posts to LoginServlet. If the password is correct, forward to WelcomeServlet with the user name as a request attribute. If wrong, show an error and include the login form again.',
      steps: [
        'Eclipse: File > New > Dynamic Web Project > name "dispatch-demo", Target runtime Apache Tomcat v10.1, Dynamic web module version 6.0 > Finish.',
        'IntelliJ (Ultimate): New Project > Jakarta EE > Template "Web application", Application server Tomcat 10.1, Build Maven, Version Jakarta EE 10 > Create.',
        'Create src/main/webapp/login.html (Eclipse: right-click webapp > New > HTML File).',
        'Create package com.demo and classes LoginServlet and WelcomeServlet (Eclipse: New > Servlet; IntelliJ: New > Servlet or Java Class).',
        'Eclipse: right-click project > Run As > Run on Server > Tomcat 10.1. IntelliJ: click Run with the Tomcat run configuration.',
        'Open http://localhost:8080/dispatch-demo/login.html, try admin/1234 and a wrong password.',
      ],
      code: `<!-- src/main/webapp/login.html -->
<!DOCTYPE html>
<html>
<body>
  <h3>Login</h3>
  <form action="login" method="post">
    User: <input type="text" name="user"><br>
    Pass: <input type="password" name="pass"><br>
    <button type="submit">Login</button>
  </form>
</body>
</html>

// src/main/java/com/demo/LoginServlet.java
package com.demo;

import jakarta.servlet.RequestDispatcher;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String user = request.getParameter("user");
        String pass = request.getParameter("pass");

        if ("admin".equals(user) && "1234".equals(pass)) {
            request.setAttribute("userName", user);
            RequestDispatcher rd = request.getRequestDispatcher("/welcome");
            rd.forward(request, response);
            return;
        }

        response.setContentType("text/html");
        PrintWriter out = response.getWriter();
        out.println("<p style='color:red'>Invalid user name or password</p>");
        RequestDispatcher rd = request.getRequestDispatcher("/login.html");
        rd.include(request, response);
    }
}

// src/main/java/com/demo/WelcomeServlet.java
package com.demo;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet("/welcome")
public class WelcomeServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response)
            throws ServletException, IOException {
        String name = (String) request.getAttribute("userName");
        response.setContentType("text/html");
        response.getWriter().println("<h2>Welcome, " + name + "!</h2>");
    }
}`,
      result: 'admin / 1234: page shows "Welcome, admin!" and the address bar still shows /dispatch-demo/login.\nWrong password: red text "Invalid user name or password" followed by the login form again.',
      explanation: 'forward() keeps the same request, so WelcomeServlet reads the attribute. Because forward passes the original POST, WelcomeServlet must implement doPost. include() adds the HTML file output under the error message and returns control.',
    },
    {
      title: 'Common header and footer with include()',
      scenario: 'Every page of a site must show the same header and footer. Write them once as Servlets and include them in a page Servlet.',
      steps: [
        'In the same project create HeaderServlet (/header), FooterServlet (/footer) and HomeServlet (/home).',
        'Restart/redeploy Tomcat (Eclipse: Servers view > right-click Tomcat > Restart; IntelliJ: Update application or Rerun).',
        'Open http://localhost:8080/dispatch-demo/home.',
      ],
      code: `// HeaderServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/header")
public class HeaderServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.getWriter().println("<header><h1>My Shop</h1><hr></header>");
    }
}

// FooterServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/footer")
public class FooterServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.getWriter().println("<footer><hr>&copy; 2026 My Shop</footer>");
    }
}

// HomeServlet.java
package com.demo;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/home")
public class HomeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<html><body>");
        req.getRequestDispatcher("/header").include(req, resp);
        out.println("<p>Welcome to our home page. Today's offer: 20% off!</p>");
        req.getRequestDispatcher("/footer").include(req, resp);
        out.println("</body></html>");
    }
}`,
      result: 'Browser shows:\nMy Shop (big heading)\n----------\nWelcome to our home page. Today\'s offer: 20% off!\n----------\n© 2026 My Shop',
      explanation: 'The content type is set in HomeServlet, because included resources cannot set headers. Each include() writes into the same response and then returns.',
    },
    {
      title: 'Post/Redirect/Get with sendRedirect',
      scenario: 'A feedback form is submitted with POST. After saving, redirect to a thank-you page so pressing F5 does not submit the feedback twice. Pass a message using the query string.',
      steps: [
        'Create feedback.html with a form (method="post", action="feedback").',
        'Create FeedbackServlet (/feedback) and ThanksServlet (/thanks).',
        'Run on Tomcat 10.1 and submit the form. Watch the address bar change to /thanks?name=...',
        'Open browser DevTools (F12) > Network tab to see the 302 response followed by a GET.',
      ],
      code: `<!-- feedback.html -->
<form action="feedback" method="post">
  Name: <input name="name"><br>
  Comment: <textarea name="comment"></textarea><br>
  <button>Send</button>
</form>

// FeedbackServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/feedback")
public class FeedbackServlet extends HttpServlet {
    // in-memory store for demo only
    static final List<String> FEEDBACK = new ArrayList<>();

    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String name = req.getParameter("name");
        String comment = req.getParameter("comment");
        synchronized (FEEDBACK) {
            FEEDBACK.add(name + ": " + comment);
        }
        String encoded = URLEncoder.encode(name, StandardCharsets.UTF_8);
        resp.sendRedirect(req.getContextPath() + "/thanks?name=" + encoded);
    }
}

// ThanksServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/thanks")
public class ThanksServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");
        resp.getWriter().println("<h3>Thank you, " + req.getParameter("name")
                + "! Total feedback stored: " + FeedbackServlet.FEEDBACK.size() + "</h3>");
    }
}`,
      result: 'After submitting name "Ravi": address bar shows /dispatch-demo/thanks?name=Ravi and the page says "Thank you, Ravi! Total feedback stored: 1". Pressing F5 reloads only the GET, so the count stays 1.',
      explanation: 'sendRedirect produces a 302 status. The browser makes a fresh GET, so request attributes would be lost; that is why the name travels in the query string. In real code you should HTML-escape user input before printing it to avoid XSS.',
    },
    {
      title: 'Hiding a page inside WEB-INF and reaching it with forward',
      scenario: 'Admin pages must not be opened directly by typing the URL. Put admin.html inside WEB-INF and let AdminServlet forward to it only when a key is correct.',
      steps: [
        'Create src/main/webapp/WEB-INF/views/admin.html (Eclipse: webapp/WEB-INF > New > Folder "views").',
        'Create AdminServlet mapped to /admin.',
        'Try http://localhost:8080/dispatch-demo/WEB-INF/views/admin.html (404) and /admin?key=secret (works).',
      ],
      code: `<!-- WEB-INF/views/admin.html -->
<h2>Admin Dashboard</h2>
<p>Only reachable through AdminServlet.</p>

// AdminServlet.java
package com.demo;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/admin")
public class AdminServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        if ("secret".equals(req.getParameter("key"))) {
            req.getRequestDispatcher("/WEB-INF/views/admin.html").forward(req, resp);
        } else {
            resp.sendError(HttpServletResponse.SC_FORBIDDEN, "Access denied");
        }
    }
}`,
      result: 'Direct URL to WEB-INF: HTTP 404 Not Found.\n/admin?key=secret: "Admin Dashboard" page.\n/admin: HTTP 403 Forbidden - Access denied.',
      explanation: 'The container never serves WEB-INF content to the browser, but forward() works on the server so it can reach it. This is the basis of MVC where JSPs live under WEB-INF.',
    },
  ],
  interview: [
    { q: 'What is RequestDispatcher?', a: 'An interface in jakarta.servlet that sends a request from one resource to another resource (Servlet, JSP, HTML) in the same web application. It has two methods: forward() and include().', level: 'Easy' },
    { q: 'Difference between forward() and include()?', a: 'forward() transfers control completely; the target produces the full response and control does not come back to write output. include() adds the target output to the current response and control returns to the caller.', level: 'Easy' },
    { q: 'Difference between forward() and sendRedirect()?', a: 'forward is server-side, one request, URL unchanged, request attributes kept, same app only. sendRedirect is client-side via 302 + Location header, two requests, URL changes, attributes lost, can go to any URL.', level: 'Easy' },
    { q: 'Which is faster, forward or sendRedirect? Why?', a: 'forward, because it happens inside the server without an extra network round trip to the browser.', level: 'Easy' },
    { q: 'What happens if you call forward() after the response is committed?', a: 'It throws IllegalStateException. The response is committed when the buffer is flushed, e.g. after out.flush() or writing more than the buffer size.', level: 'Medium' },
    { q: 'How do you pass data with sendRedirect?', a: 'Through the query string (URL-encoded), through HttpSession attributes, or cookies. Request attributes do not survive because the browser makes a new request.', level: 'Medium' },
    { q: 'What is the Post/Redirect/Get pattern?', a: 'After processing a POST that changes data, the server redirects to a GET URL. Refreshing the result page repeats the safe GET instead of re-submitting the POST, preventing duplicate inserts or payments.', level: 'Medium' },
    { q: 'Difference between request.getRequestDispatcher() and servletContext.getRequestDispatcher()?', a: 'ServletContext version needs an absolute path starting with "/" (relative to context root). Request version also accepts a path relative to the current request URL.', level: 'Medium' },
    { q: 'Can an included Servlet set response headers or status?', a: 'No. Calls like setStatus() or setHeader() from an included resource are ignored. Only the main (including) resource can set them.', level: 'Hard' },
    { q: 'Why put JSPs under WEB-INF?', a: 'Resources under WEB-INF cannot be requested directly by the browser, so users must go through a controller Servlet which forwards to them. This enforces MVC and security checks.', level: 'Medium' },
    { q: 'What HTTP status code does sendRedirect use?', a: '302 Found, with a Location header. For a permanent redirect you set 301 manually with setStatus(301) and setHeader("Location", url).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a CalcServlet (/calc) that reads two numbers a and b and forwards to ResultServlet (/result) which prints the sum. Pass the sum as a request attribute.',
      hint: 'request.setAttribute("sum", a + b); then getRequestDispatcher("/result").forward(...). ResultServlet must handle the same HTTP method.',
      solution: `@WebServlet("/calc")
public class CalcServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        int a = Integer.parseInt(req.getParameter("a"));
        int b = Integer.parseInt(req.getParameter("b"));
        req.setAttribute("sum", a + b);
        req.getRequestDispatcher("/result").forward(req, resp);
    }
}

@WebServlet("/result")
public class ResultServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");
        resp.getWriter().println("<h3>Sum = " + req.getAttribute("sum") + "</h3>");
    }
}
// Test: http://localhost:8080/dispatch-demo/calc?a=5&b=7  -> Sum = 12`,
    },
    {
      task: 'Create a SearchServlet that redirects to Google search for the text entered by the user.',
      hint: 'URL-encode the query and call sendRedirect("https://www.google.com/search?q=" + encoded).',
      solution: `@WebServlet("/search")
public class SearchServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String q = req.getParameter("q");
        String encoded = java.net.URLEncoder.encode(q == null ? "" : q,
                java.nio.charset.StandardCharsets.UTF_8);
        resp.sendRedirect("https://www.google.com/search?q=" + encoded);
    }
}`,
    },
    {
      task: 'Build a page Servlet that includes a MenuServlet showing links Home | Products | Contact, then prints the page content.',
      hint: 'Set content type first in the main Servlet; include("/menu").',
      solution: `@WebServlet("/menu")
public class MenuServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String c = req.getContextPath();
        resp.getWriter().println("<nav><a href='" + c + "/home'>Home</a> | <a href='"
            + c + "/products'>Products</a> | <a href='" + c + "/contact'>Contact</a></nav>");
    }
}

@WebServlet("/products")
public class ProductsServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        resp.setContentType("text/html");
        req.getRequestDispatcher("/menu").include(req, resp);
        resp.getWriter().println("<h2>Products</h2><ul><li>Pen</li><li>Book</li></ul>");
    }
}`,
    },
    {
      task: 'Write a RegisterServlet (POST) that validates that the email contains "@". If invalid, forward back to the form page with an error attribute; if valid, redirect to /success using PRG.',
      hint: 'Invalid -> setAttribute("error", ...) + forward to a FormServlet that prints the error. Valid -> sendRedirect.',
      solution: `@WebServlet("/register")
public class RegisterServlet extends HttpServlet {
    protected void doPost(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        String email = req.getParameter("email");
        if (email == null || !email.contains("@")) {
            req.setAttribute("error", "Please enter a valid email");
            req.getRequestDispatcher("/regform").forward(req, resp);
            return;
        }
        resp.sendRedirect(req.getContextPath() + "/success");
    }
}

@WebServlet("/regform")
public class RegFormServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        show(req, resp);
    }
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        show(req, resp);   // reached by forward from POST
    }
    private void show(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");
        Object err = req.getAttribute("error");
        var out = resp.getWriter();
        if (err != null) out.println("<p style='color:red'>" + err + "</p>");
        out.println("<form method='post' action='register'>Email: <input name='email'>"
                + "<button>Register</button></form>");
    }
}

@WebServlet("/success")
public class SuccessServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.getWriter().println("Registration successful");
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'After request.getRequestDispatcher("/b").forward(req, resp), what does the browser address bar show?',
      options: ['The URL of /b', 'The original URL', 'about:blank', 'The Location header value'],
      answer: 1,
      explanation: 'forward happens on the server; the browser made only one request, so the original URL stays.',
    },
    {
      question: 'Which method returns control to the calling Servlet after the target finishes?',
      options: ['forward()', 'sendRedirect()', 'include()', 'sendError()'],
      answer: 2,
      explanation: 'include() inserts output and returns to the caller.',
    },
    {
      question: 'A request attribute is set and then sendRedirect() is called. In the next page the attribute is:',
      options: ['Available', 'Available only for GET', 'Converted to a parameter', 'null'],
      answer: 3,
      explanation: 'Redirect causes a new request, so old request attributes are gone.',
    },
    {
      question: 'Which status code does sendRedirect send by default?',
      options: ['302', '200', '301', '404'],
      answer: 0,
      explanation: 'sendRedirect sets status 302 Found with a Location header.',
    },
    {
      question: 'Which of these can sendRedirect do that forward cannot?',
      options: ['Keep request attributes', 'Send the user to a different website', 'Reach files inside WEB-INF', 'Avoid an extra network round trip'],
      answer: 1,
      explanation: 'forward works only within the same application; redirect can go to any URL.',
    },
  ],
};
