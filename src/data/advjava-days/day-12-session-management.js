export default {
  id: 'day-12-session-management',
  title: 'Session Management: Cookies, HttpSession, URL Rewriting, Hidden Form Fields',
  module: 'Module 2: Servlets',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'HTTP is stateless, so the server forgets you after every request. Learn the four techniques Servlets use to remember a user across requests: cookies, HttpSession, URL rewriting and hidden form fields.',
  objectives: [
    'Explain why HTTP is stateless and why session tracking is needed',
    'Create, read and delete cookies with jakarta.servlet.http.Cookie',
    'Use HttpSession to store user data, set timeouts and log out with invalidate()',
    'Use URL rewriting (encodeURL) and hidden form fields when cookies are disabled',
    'Build a login/logout flow and a shopping cart using sessions',
  ],
  theory: [
    {
      heading: 'Stateless HTTP and the need for sessions',
      content:
        'HTTP is a stateless protocol: every request is independent and the server keeps no memory of previous requests. If you log in on request 1, on request 2 the server does not know who you are. Session management (session tracking) is the technique of identifying the same user across many requests.\n\nAnalogy: a cloakroom at a theatre. You give your coat and get a token number. Next time you show the token and get your coat back. The token is the session id; the coat rack is the server memory.\n\nFour techniques:\n1. Cookies - small data stored in the browser.\n2. HttpSession - data stored on the server, identified by a JSESSIONID.\n3. URL rewriting - session id appended to every URL.\n4. Hidden form fields - data carried inside forms.',
    },
    {
      heading: 'Cookies',
      content:
        'A cookie is a small name=value text (about 4 KB max) that the server sends in a Set-Cookie header. The browser stores it and sends it back automatically in the Cookie header with every request to the same site.\n\nTypes: non-persistent (session) cookie - no max age, deleted when the browser closes; persistent cookie - setMaxAge(seconds) > 0, stored on disk until expiry.',
      syntax: `Cookie c = new Cookie("theme", "dark");
c.setMaxAge(7 * 24 * 60 * 60); // 7 days
c.setHttpOnly(true);            // JavaScript cannot read it
c.setPath(request.getContextPath());
response.addCookie(c);

Cookie[] cookies = request.getCookies();  // may be null!
// delete: same name + same path, setMaxAge(0), addCookie again`,
      points: [
        'Advantages: simple, stored on client, no server memory.',
        'Disadvantages: user can disable or edit them, only text, size limit, not secure for sensitive data.',
        'request.getCookies() returns null when no cookies exist - always null-check.',
        'Cookie values cannot contain spaces, commas or semicolons without encoding.',
      ],
    },
    {
      heading: 'HttpSession',
      content:
        'HttpSession is the most used technique. The container creates a session object on the SERVER, gives it a unique id, and sends that id to the browser as a cookie called JSESSIONID. On each request the browser sends JSESSIONID back and the container finds the matching session object. You can store any Java object in it with setAttribute.\n\nDiagram in words:\nBrowser --login--> Server creates Session{id=A1B2, user=ravi} --Set-Cookie: JSESSIONID=A1B2--> Browser\nBrowser --GET /cart, Cookie: JSESSIONID=A1B2--> Server finds session A1B2 -> user=ravi.',
      syntax: `HttpSession session = request.getSession();        // get or create
HttpSession s2 = request.getSession(false);        // get only, null if none
session.setAttribute("user", "ravi");
String u = (String) session.getAttribute("user");
session.removeAttribute("user");
session.setMaxInactiveInterval(15 * 60);           // seconds
session.invalidate();                               // logout`,
      points: [
        'Default timeout in Tomcat is 30 minutes of inactivity; change in web.xml <session-config><session-timeout>15</session-timeout> (minutes).',
        'getSession(false) is used in protected pages to check if the user is logged in, without creating a new empty session.',
        'Useful methods: getId(), getCreationTime(), getLastAccessedTime(), isNew().',
        'Store only small, Serializable objects; sessions use server memory.',
      ],
      tip: 'After a successful login call request.changeSessionId() to prevent session fixation attacks.',
    },
    {
      heading: 'URL Rewriting',
      content:
        'If the user disables cookies, JSESSIONID cannot be stored. URL rewriting adds the session id into each link: /app/cart;jsessionid=A1B2. response.encodeURL(url) does this automatically ONLY when needed (when cookies are not supported). For redirects use response.encodeRedirectURL(url). You can also pass your own data in the query string (?user=ravi).',
      syntax: `String link = response.encodeURL(request.getContextPath() + "/cart");
out.println("<a href='" + link + "'>Cart</a>");
response.sendRedirect(response.encodeRedirectURL(request.getContextPath() + "/home"));`,
      points: [
        'Works even when cookies are disabled.',
        'Every link must be encoded - easy to forget.',
        'Session id appears in the URL, history and logs (security risk), so modern apps prefer cookies.',
      ],
    },
    {
      heading: 'Hidden Form Fields',
      content:
        'A hidden input <input type="hidden" name="step" value="2"> is not shown to the user but is submitted with the form. It is used in multi-step wizards (step 1 name, step 2 address) to carry earlier answers forward. It only works when moving between pages by submitting forms, not with normal links, and the user can see/change it via View Source, so never trust it for security.',
      syntax: `out.println("<form action='step2' method='post'>");
out.println("<input type='hidden' name='name' value='" + name + "'>");
out.println("City: <input name='city'><button>Next</button></form>");`,
    },
    {
      heading: 'Choosing a technique',
      content:
        'Quick comparison:\n- Cookie: stored on client, text only, survives browser restart if persistent. Use for preferences like theme or "remember me" token.\n- HttpSession: stored on server, any object, secure-ish, ends on timeout/invalidate. Use for login user, cart.\n- URL rewriting: fallback when cookies disabled.\n- Hidden fields: multi-step forms.',
      points: [
        'Common mistake: storing passwords in cookies.',
        'Common mistake: calling getSession() (true) on a protected page, which creates a session and the null check never fails.',
        'Common mistake: not invalidating session on logout.',
        'Common mistake: forgetting to null-check getCookies().',
      ],
    },
  ],
  examples: [
    {
      title: 'Cookie: remember visitor name and visit count',
      scenario: 'Greet a returning user by name and show how many times they visited, using persistent cookies.',
      steps: [
        'Eclipse: File > New > Dynamic Web Project "session-demo", runtime Tomcat v10.1 > Finish. IntelliJ: New Project > Jakarta EE > Web application, Tomcat 10.1, Jakarta EE 10.',
        'Create com.demo.VisitServlet with @WebServlet("/visit").',
        'Run on Tomcat. Open http://localhost:8080/session-demo/visit?name=Asha then refresh several times.',
        'Open DevTools (F12) > Application > Cookies to see visitorName and visits.',
      ],
      code: `package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/visit")
public class VisitServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String name = null;
        int visits = 0;

        Cookie[] cookies = req.getCookies();
        if (cookies != null) {
            for (Cookie c : cookies) {
                if ("visitorName".equals(c.getName())) name = c.getValue();
                if ("visits".equals(c.getName())) visits = Integer.parseInt(c.getValue());
            }
        }

        String newName = req.getParameter("name");
        if (newName != null && !newName.isBlank()) {
            name = newName.replaceAll("[^A-Za-z]", ""); // keep cookie-safe
        }
        visits++;

        Cookie nameCookie = new Cookie("visitorName", name == null ? "Guest" : name);
        nameCookie.setMaxAge(30 * 24 * 60 * 60);
        nameCookie.setHttpOnly(true);
        Cookie countCookie = new Cookie("visits", String.valueOf(visits));
        countCookie.setMaxAge(30 * 24 * 60 * 60);
        resp.addCookie(nameCookie);
        resp.addCookie(countCookie);

        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<h3>Hello " + (name == null ? "Guest" : name) + "</h3>");
        out.println("<p>You have visited " + visits + " time(s).</p>");
    }
}`,
      result: 'First request ?name=Asha: "Hello Asha" / "You have visited 1 time(s)."\nThird refresh (without name): "Hello Asha" / "You have visited 4 time(s)." Values survive closing the browser because maxAge is 30 days.',
      explanation: 'Cookies are read with getCookies(), modified, and sent back with addCookie(). The browser stores them and returns them automatically.',
    },
    {
      title: 'HttpSession: login, protected profile page and logout',
      scenario: 'Build a mini login system. Only logged-in users can see /profile. Logout destroys the session.',
      steps: [
        'Create webapp/login.html with a POST form to "login".',
        'Create LoginServlet, ProfileServlet and LogoutServlet in package com.demo.',
        'Optionally set timeout in WEB-INF/web.xml (Eclipse: right-click project > Java EE Tools > Generate Deployment Descriptor Stub; IntelliJ: Project Structure > Facets > Web > add web.xml).',
        'Run and test: open /profile directly (redirected to login), login, open /profile, then /logout.',
      ],
      code: `<!-- login.html -->
<form action="login" method="post">
  User: <input name="user"> Pass: <input type="password" name="pass">
  <button>Login</button>
</form>

<!-- WEB-INF/web.xml (optional) -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee" version="6.0">
  <session-config>
    <session-timeout>15</session-timeout>
  </session-config>
</web-app>

// LoginServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/login")
public class LoginServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String user = req.getParameter("user");
        String pass = req.getParameter("pass");
        if ("ravi".equals(user) && "ravi@123".equals(pass)) {
            HttpSession session = req.getSession();
            req.changeSessionId();                 // prevent session fixation
            session.setAttribute("loggedUser", user);
            session.setAttribute("loginTime", java.time.LocalTime.now().withNano(0));
            resp.sendRedirect(req.getContextPath() + "/profile");
        } else {
            resp.sendRedirect(req.getContextPath() + "/login.html");
        }
    }
}

// ProfileServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/profile")
public class ProfileServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);   // do NOT create
        if (session == null || session.getAttribute("loggedUser") == null) {
            resp.sendRedirect(req.getContextPath() + "/login.html");
            return;
        }
        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Profile of " + session.getAttribute("loggedUser") + "</h2>");
        out.println("<p>Logged in at " + session.getAttribute("loginTime") + "</p>");
        out.println("<p>Session id: " + session.getId() + "</p>");
        out.println("<a href='" + req.getContextPath() + "/logout'>Logout</a>");
    }
}

// LogoutServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        resp.sendRedirect(req.getContextPath() + "/login.html");
    }
}`,
      result: 'Open /profile before login -> redirected to login.html.\nLogin ravi / ravi@123 -> "Profile of ravi", "Logged in at 10:15:42" (your time), "Session id: 5F3C..." (random).\nClick Logout -> back to login; /profile again redirects to login.',
      explanation: 'getSession(false) returns null when no session exists, so unauthenticated users are rejected. invalidate() removes all attributes and destroys the session. The id and time differ on every run.',
    },
    {
      title: 'Shopping cart stored in HttpSession',
      scenario: 'Users add products to a cart by clicking links. The cart (a List) lives in the session, so it survives between requests.',
      steps: [
        'Create CartServlet mapped to /cart.',
        'Open /cart?add=Pen, /cart?add=Book, /cart?add=Pen and then /cart?clear=1.',
        'Open the same URL in an Incognito window to see that a different session has an empty cart.',
      ],
      code: `package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.List;

@WebServlet("/cart")
public class CartServlet extends HttpServlet {
    @Override
    @SuppressWarnings("unchecked")
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession session = req.getSession();
        List<String> cart = (List<String>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
            session.setAttribute("cart", cart);
        }

        String item = req.getParameter("add");
        if (item != null && !item.isBlank()) cart.add(item);
        if (req.getParameter("clear") != null) cart.clear();

        resp.setContentType("text/html");
        PrintWriter out = resp.getWriter();
        out.println("<h3>Your cart (" + cart.size() + " items)</h3><ol>");
        for (String c : cart) out.println("<li>" + c + "</li>");
        out.println("</ol>");
        String base = req.getContextPath() + "/cart";
        out.println("<a href='" + resp.encodeURL(base + "?add=Pen") + "'>Add Pen</a> | ");
        out.println("<a href='" + resp.encodeURL(base + "?add=Book") + "'>Add Book</a> | ");
        out.println("<a href='" + resp.encodeURL(base + "?clear=1") + "'>Clear</a>");
    }
}`,
      result: 'After add=Pen, add=Book, add=Pen:\nYour cart (3 items)\n1. Pen\n2. Book\n3. Pen\nAfter clear=1: Your cart (0 items). A new Incognito window starts with 0 items.',
      explanation: 'The List object is stored in the session once; later requests get the same object reference and modify it. encodeURL adds ;jsessionid=... only if the browser does not accept cookies.',
    },
    {
      title: 'Hidden form fields: two-step registration wizard',
      scenario: 'Step 1 asks the name, step 2 asks the city and carries the name in a hidden field; the final page shows both.',
      steps: [
        'Create step1.html with form action="step2".',
        'Create Step2Servlet (/step2) and FinishServlet (/finish).',
        'Run: open /step1.html, enter name, then city. Use right-click > View Page Source on step 2 to see the hidden field.',
      ],
      code: `<!-- step1.html -->
<form action="step2" method="post">
  Name: <input name="name"> <button>Next</button>
</form>

// Step2Servlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/step2")
public class Step2Servlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String name = req.getParameter("name");
        resp.setContentType("text/html");
        resp.getWriter().println(
            "<form action='finish' method='post'>"
          + "<input type='hidden' name='name' value='" + name + "'>"
          + "City: <input name='city'> <button>Finish</button></form>");
    }
}

// FinishServlet.java
package com.demo;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/finish")
public class FinishServlet extends HttpServlet {
    @Override
    protected void doPost(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html");
        resp.getWriter().println("<h3>Registered: " + req.getParameter("name")
                + " from " + req.getParameter("city") + "</h3>");
    }
}`,
      result: 'Enter "Kiran" then "Pune": final page shows "Registered: Kiran from Pune".',
      explanation: 'The server stored nothing; the hidden field carried the name from step 2 to the finish page. In production, escape values written into HTML.',
    },
  ],
  interview: [
    { q: 'Why is session management needed?', a: 'Because HTTP is stateless; each request is independent. Session tracking lets the server recognise the same user across multiple requests (login, cart).', level: 'Easy' },
    { q: 'What are the session tracking techniques in Servlets?', a: 'Cookies, HttpSession, URL rewriting and hidden form fields.', level: 'Easy' },
    { q: 'Difference between getSession() and getSession(false)?', a: 'getSession() / getSession(true) returns the existing session or creates a new one. getSession(false) returns the existing session or null; it never creates one.', level: 'Easy' },
    { q: 'What is JSESSIONID?', a: 'The cookie name Tomcat (and most containers) uses to store the session id in the browser. The container uses it to look up the server-side HttpSession.', level: 'Easy' },
    { q: 'Persistent vs non-persistent cookie?', a: 'A non-persistent (session) cookie has no max age and is deleted when the browser closes. A persistent cookie has setMaxAge(>0) and is stored until it expires.', level: 'Medium' },
    { q: 'How do you delete a cookie?', a: 'Create a cookie with the same name (and same path/domain), call setMaxAge(0) and add it to the response.', level: 'Medium' },
    { q: 'How do you set the session timeout?', a: 'session.setMaxInactiveInterval(seconds) for one session, or <session-timeout>minutes</session-timeout> in web.xml for all sessions. Default in Tomcat is 30 minutes.', level: 'Medium' },
    { q: 'What does session.invalidate() do?', a: 'Destroys the session and unbinds all its attributes. Any further call on that session object throws IllegalStateException.', level: 'Medium' },
    { q: 'What is the difference between encodeURL and encodeRedirectURL?', a: 'Both append the session id when cookies are not available. encodeURL is for links written into the page; encodeRedirectURL is for URLs passed to sendRedirect.', level: 'Hard' },
    { q: 'What is session fixation and how do you prevent it?', a: 'An attacker makes a victim use a session id known to the attacker, then the victim logs in and the attacker reuses that id. Prevent it by calling request.changeSessionId() (or invalidating and creating a new session) after login.', level: 'Hard' },
    { q: 'Cookies vs HttpSession?', a: 'Cookies store data in the browser as text with size limits and can be tampered with. HttpSession stores Java objects on the server; only the id travels to the browser. Session uses server memory, cookies do not.', level: 'Medium' },
    { q: 'What HttpOnly and Secure flags do on a cookie?', a: 'HttpOnly stops JavaScript (document.cookie) from reading the cookie, reducing XSS theft. Secure sends the cookie only over HTTPS.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a ThemeServlet: /theme?set=dark stores a persistent cookie "theme" for 1 year; /theme shows the page with black background if theme=dark else white.',
      hint: 'Read cookie, default "light". Background color depends on value.',
      solution: `@WebServlet("/theme")
public class ThemeServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        String theme = "light";
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) {
                if ("theme".equals(c.getName())) theme = c.getValue();
            }
        }
        String set = req.getParameter("set");
        if ("dark".equals(set) || "light".equals(set)) {
            theme = set;
            Cookie c = new Cookie("theme", theme);
            c.setMaxAge(365 * 24 * 60 * 60);
            resp.addCookie(c);
        }
        String bg = "dark".equals(theme) ? "black" : "white";
        String fg = "dark".equals(theme) ? "white" : "black";
        resp.setContentType("text/html");
        resp.getWriter().println("<body style='background:" + bg + ";color:" + fg + "'>"
            + "Current theme: " + theme + "</body>");
    }
}`,
    },
    {
      task: 'Write a SessionInfoServlet that prints session id, isNew(), creation time and last accessed time.',
      hint: 'Use java.util.Date or Instant.ofEpochMilli for the times.',
      solution: `@WebServlet("/sessioninfo")
public class SessionInfoServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession();
        resp.setContentType("text/plain");
        var out = resp.getWriter();
        out.println("Id: " + s.getId());
        out.println("New: " + s.isNew());
        out.println("Created: " + java.time.Instant.ofEpochMilli(s.getCreationTime()));
        out.println("Last access: " + java.time.Instant.ofEpochMilli(s.getLastAccessedTime()));
        out.println("Timeout (s): " + s.getMaxInactiveInterval());
    }
}`,
    },
    {
      task: 'Write a LogoutServlet that invalidates the session AND deletes a "rememberMe" cookie.',
      hint: 'Cookie with same name, setMaxAge(0), same path.',
      solution: `@WebServlet("/logout")
public class LogoutServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession(false);
        if (s != null) s.invalidate();
        Cookie c = new Cookie("rememberMe", "");
        c.setMaxAge(0);
        c.setPath(req.getContextPath().isEmpty() ? "/" : req.getContextPath());
        resp.addCookie(c);
        resp.sendRedirect(req.getContextPath() + "/login.html");
    }
}`,
    },
    {
      task: 'Build a page-hit counter per user using HttpSession, and a total counter for all users using ServletContext.',
      hint: 'Session attribute "myHits"; context attribute "totalHits" (synchronize on context).',
      solution: `@WebServlet("/hits")
public class HitServlet extends HttpServlet {
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        HttpSession s = req.getSession();
        Integer mine = (Integer) s.getAttribute("myHits");
        mine = (mine == null) ? 1 : mine + 1;
        s.setAttribute("myHits", mine);

        ServletContext ctx = getServletContext();
        int total;
        synchronized (ctx) {
            Integer t = (Integer) ctx.getAttribute("totalHits");
            total = (t == null) ? 1 : t + 1;
            ctx.setAttribute("totalHits", total);
        }
        resp.getWriter().println("Your hits: " + mine + ", total hits: " + total);
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'What does request.getSession(false) return when no session exists?',
      options: ['A new session', 'null', 'An exception is thrown', 'An empty session with isNew() false'],
      answer: 1,
      explanation: 'With false, the container does not create a session; it returns null.',
    },
    {
      question: 'Which technique stores data on the server side?',
      options: ['Cookies', 'Hidden form fields', 'URL rewriting', 'HttpSession'],
      answer: 3,
      explanation: 'HttpSession data is kept in server memory; only the id goes to the browser.',
    },
    {
      question: 'To delete a cookie you should:',
      options: ['Call cookie.delete()', 'Set its value to null', 'Add the same cookie with setMaxAge(0)', 'Call session.invalidate()'],
      answer: 2,
      explanation: 'A max age of 0 tells the browser to remove the cookie immediately.',
    },
    {
      question: 'The <session-timeout> value in web.xml is measured in:',
      options: ['Minutes', 'Seconds', 'Milliseconds', 'Hours'],
      answer: 0,
      explanation: 'web.xml uses minutes, while setMaxInactiveInterval() uses seconds.',
    },
    {
      question: 'Which method appends ;jsessionid to a link only when cookies are disabled?',
      options: ['response.addCookie()', 'response.encodeURL()', 'request.getRequestURL()', 'session.getId()'],
      answer: 1,
      explanation: 'encodeURL performs URL rewriting only when needed.',
    },
  ],
};
