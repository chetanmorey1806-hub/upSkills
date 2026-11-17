export default {
  id: "day-10-webxml-annotations-config-context",
  title: "web.xml vs @WebServlet, ServletConfig and ServletContext",
  module: "Module 2: Servlets",
  day: 10,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Compare XML-based and annotation-based servlet configuration, master URL patterns, and use ServletConfig for servlet-specific settings and ServletContext for application-wide settings and shared data such as database configuration.",
  objectives: [
    "Configure servlets with web.xml and with @WebServlet, and know when to use each",
    "Write correct URL patterns: exact, path (/*), extension (*.do) and default (/)",
    "Read servlet init parameters through ServletConfig",
    "Use ServletContext for context parameters, shared attributes and server information",
    "Explain the differences between ServletConfig and ServletContext for interviews"
  ],
  theory: [
    {
      heading: "Two Ways to Register a Servlet",
      content: "The container must know three things about a servlet: its class, its name and its URL. You can say this in XML (web.xml) or in an annotation on the class (@WebServlet, Servlet 3.0+). Analogy: a new employee's desk number can be written in the office register at reception (web.xml, central, editable without touching the employee) or on a badge the employee wears (annotation, right next to the code).",
      syntax: "<!-- web.xml -->\n<servlet>\n    <servlet-name>report</servlet-name>\n    <servlet-class>com.course.web.ReportServlet</servlet-class>\n    <init-param>\n        <param-name>pageSize</param-name>\n        <param-value>20</param-value>\n    </init-param>\n    <load-on-startup>1</load-on-startup>\n</servlet>\n<servlet-mapping>\n    <servlet-name>report</servlet-name>\n    <url-pattern>/report</url-pattern>\n</servlet-mapping>\n\n// annotation\n@WebServlet(name = \"report\", urlPatterns = {\"/report\"}, loadOnStartup = 1,\n        initParams = @WebInitParam(name = \"pageSize\", value = \"20\"))\npublic class ReportServlet extends HttpServlet { }",
      points: [
        "@WebServlet(\"/x\") is shorthand for @WebServlet(urlPatterns = \"/x\") (value and urlPatterns are the same; use only one).",
        "web.xml pros: all URLs in one file, change settings without recompiling, required for some features in older containers, overrides annotations.",
        "Annotation pros: less XML, configuration lives next to the code, faster to write; most modern projects use it.",
        "If both declare the same servlet-name, web.xml values win (web.xml overrides annotations).",
        "<web-app metadata-complete=\"true\"> tells Tomcat to ignore annotations entirely (faster startup, but @WebServlet stops working)."
      ]
    },
    {
      heading: "URL Patterns and Matching Rules",
      content: "A url-pattern decides which requests reach a servlet. The container tries patterns in this order and picks the first match:\n\n1. Exact match: /login matches only /login\n2. Longest path match: /admin/* matches /admin, /admin/users, /admin/users/5\n3. Extension match: *.do matches /save.do, /a/b/c.do\n4. Default servlet: / handles everything nothing else matched (Tomcat's default servlet serves static files this way)\n\nFor /admin/users/5 mapped by /admin/*: getServletPath() = /admin, getPathInfo() = /users/5.",
      points: [
        "Patterns must start with / or *. ; 'login' without a slash causes deployment failure: Invalid url-pattern.",
        "/* also catches JSPs and static files; avoid it for normal servlets (filters often use it).",
        "Two servlets with the same exact pattern cause deployment failure: 'The servlets named [a] and [b] are both mapped to the url-pattern [/x] which is not permitted'.",
        "One servlet can have several patterns: urlPatterns = {\"/students\", \"/students/*\"}."
      ]
    },
    {
      heading: "ServletConfig: Settings for ONE Servlet",
      content: "ServletConfig is an object created by the container for each servlet, holding that servlet's name and init parameters. Analogy: a personal instruction card handed to one employee (e.g. 'your shift is 9 to 5'). Other employees cannot see it.",
      syntax: "// inside the servlet (GenericServlet implements ServletConfig)\nString size = getInitParameter(\"pageSize\");\nServletConfig cfg = getServletConfig();\nString name = cfg.getServletName();\nEnumeration<String> names = cfg.getInitParameterNames();",
      points: [
        "One ServletConfig per servlet declaration.",
        "Available from init() onward, not in the constructor.",
        "Values are always Strings; convert yourself.",
        "Use for: page size, upload folder, admin email, feature flags for that servlet."
      ]
    },
    {
      heading: "ServletContext: Settings and Data for the WHOLE Application",
      content: "ServletContext is ONE object per web application, shared by all servlets, filters, listeners and JSPs. Analogy: the notice board in the office lobby; everyone can read it and anyone can pin a note on it.\n\nIt provides: context init parameters (<context-param> in web.xml), application-scoped attributes (setAttribute/getAttribute), server info, resource access (getRealPath, getResourceAsStream), logging, and request dispatching.",
      syntax: "ServletContext ctx = getServletContext();       // in a servlet\nString url = ctx.getInitParameter(\"dbUrl\");      // from <context-param>\nctx.setAttribute(\"visits\", counter);             // share an object\nObject v = ctx.getAttribute(\"visits\");\nctx.getServerInfo();                              // Apache Tomcat/10.1.x\nctx.getContextPath();                             // /student-web\nctx.getRealPath(\"/WEB-INF/data.txt\");            // disk path\nctx.log(\"message\");                               // Tomcat log",
      points: [
        "Context params can only be declared in web.xml (or programmatically), not with @WebServlet.",
        "Attributes in ServletContext are shared by all users and threads; use thread-safe objects.",
        "ServletContext lives from application start to undeploy.",
        "Get it from: getServletContext() in servlets, req.getServletContext(), or ServletContextEvent in listeners (Day 13)."
      ]
    },
    {
      heading: "ServletConfig vs ServletContext (interview table in words)",
      content: "A quick comparison to memorise.",
      points: [
        "Scope: ServletConfig = one servlet; ServletContext = whole web app.",
        "Count: one ServletConfig per servlet; one ServletContext per application (per JVM).",
        "Declared in: <init-param> inside <servlet> (or @WebInitParam); ServletContext uses <context-param> directly under <web-app>.",
        "Access: getServletConfig() / getInitParameter(); getServletContext() / getServletContext().getInitParameter().",
        "Attributes: ServletConfig has none; ServletContext supports setAttribute/getAttribute/removeAttribute.",
        "Example: upload folder for one servlet -> ServletConfig. Database URL used by every servlet -> ServletContext."
      ],
      tip: "Never put real production passwords in web.xml inside source control. Use environment variables or Tomcat JNDI DataSources in real projects."
    }
  ],
  examples: [
    {
      title: "ServletConfig with web.xml init-param",
      scenario: "A ReportServlet reads its page size and report title from init parameters, so they can be changed in web.xml without recompiling.",
      steps: [
        "In student-web, create class ReportServlet in com.course.web (no annotation)",
        "Add the <servlet> block with two <init-param> entries and the <servlet-mapping> to WEB-INF/web.xml",
        "Redeploy and open http://localhost:8080/student-web/report",
        "Change pageSize to 50 in web.xml, restart the server (Eclipse: right-click server > Restart; IntelliJ: Restart server) and refresh"
      ],
      code: `<!-- ===== WEB-INF/web.xml (inside <web-app>) ===== -->
<servlet>
    <servlet-name>report</servlet-name>
    <servlet-class>com.course.web.ReportServlet</servlet-class>
    <init-param>
        <param-name>pageSize</param-name>
        <param-value>20</param-value>
    </init-param>
    <init-param>
        <param-name>title</param-name>
        <param-value>Monthly Student Report</param-value>
    </init-param>
</servlet>
<servlet-mapping>
    <servlet-name>report</servlet-name>
    <url-pattern>/report</url-pattern>
</servlet-mapping>

// ===== com/course/web/ReportServlet.java =====
package com.course.web;

import jakarta.servlet.ServletConfig;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;

public class ReportServlet extends HttpServlet {

    private int pageSize;
    private String title;

    @Override
    public void init() throws ServletException {
        ServletConfig cfg = getServletConfig();
        pageSize = Integer.parseInt(cfg.getInitParameter("pageSize"));
        title = cfg.getInitParameter("title");
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>" + title + "</h2>");
        out.println("<p>Servlet name: " + getServletName() + "</p>");
        out.println("<p>Page size: " + pageSize + "</p>");
        out.println("<p>All init params: "
                + Collections.list(getServletConfig().getInitParameterNames()) + "</p>");
    }
}`,
      result: "Monthly Student Report\nServlet name: report\nPage size: 20\nAll init params: [pageSize, title]\n\n(After changing pageSize to 50 and restarting: Page size: 50)",
      explanation: "The container builds a ServletConfig from the <init-param> elements and passes it to init(). Reading values once in init() and storing them in fields is efficient and thread safe because they never change. The order of getInitParameterNames is not guaranteed by the spec; Tomcat usually returns declaration order."
    },
    {
      title: "Same configuration with @WebServlet and @WebInitParam",
      scenario: "Rewrite a servlet using only annotations: multiple URL patterns, init params and load-on-startup, with no web.xml entry.",
      steps: [
        "Create class UploadInfoServlet in com.course.web with the annotations shown",
        "Do NOT add anything to web.xml (make sure web.xml does not have metadata-complete=\"true\")",
        "Redeploy; note the init message in the console at startup (loadOnStartup = 2)",
        "Open both http://localhost:8080/student-web/upload-info and /student-web/files/info"
      ],
      code: `package com.course.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebInitParam;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;

@WebServlet(
    name = "uploadInfo",
    urlPatterns = {"/upload-info", "/files/info"},
    loadOnStartup = 2,
    initParams = {
        @WebInitParam(name = "uploadDir", value = "/tmp/uploads"),
        @WebInitParam(name = "maxSizeMb", value = "5")
    }
)
public class UploadInfoServlet extends HttpServlet {

    @Override
    public void init() throws ServletException {
        System.out.println("uploadInfo initialised at startup, dir = " + getInitParameter("uploadDir"));
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        resp.getWriter().println("Requested via : " + req.getServletPath());
        resp.getWriter().println("Upload folder : " + getInitParameter("uploadDir"));
        resp.getWriter().println("Max size (MB) : " + getInitParameter("maxSizeMb"));
    }
}`,
      result: "Console at startup:\nuploadInfo initialised at startup, dir = /tmp/uploads\n\n/student-web/upload-info:\nRequested via : /upload-info\nUpload folder : /tmp/uploads\nMax size (MB) : 5\n\n/student-web/files/info:\nRequested via : /files/info\nUpload folder : /tmp/uploads\nMax size (MB) : 5",
      explanation: "One servlet object answers both URLs. getInitParameter is a shortcut inherited from GenericServlet for getServletConfig().getInitParameter. To override the folder on a server without recompiling, you could declare a <servlet> with servlet-name uploadInfo in web.xml and its <init-param> would win."
    },
    {
      title: "ServletContext: context-param shared by all servlets and an application-wide visit counter",
      scenario: "Store the database URL and the college name once in web.xml as context parameters, read them from two different servlets, and keep a site-wide visit counter in a ServletContext attribute.",
      steps: [
        "Add the two <context-param> elements directly inside <web-app> in web.xml (outside any <servlet>)",
        "Create HomeServlet and AboutServlet in com.course.web",
        "Redeploy; open /student-web/home in Chrome and /student-web/about in another browser (e.g. Firefox)",
        "Refresh both a few times: the visit counter is shared across servlets and users"
      ],
      code: `<!-- ===== WEB-INF/web.xml (directly inside <web-app>) ===== -->
<context-param>
    <param-name>collegeName</param-name>
    <param-value>Sunrise Institute of Technology</param-value>
</context-param>
<context-param>
    <param-name>dbUrl</param-name>
    <param-value>jdbc:mysql://localhost:3306/college_db</param-value>
</context-param>

// ===== com/course/web/HomeServlet.java =====
package com.course.web;

import jakarta.servlet.ServletContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/home")
public class HomeServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ServletContext ctx = getServletContext();
        int visits = VisitCounter.next(ctx);

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h1>Welcome to " + ctx.getInitParameter("collegeName") + "</h1>");
        out.println("<p>Total site visits: " + visits + "</p>");
        out.println("<p>Server: " + ctx.getServerInfo() + "</p>");
        out.println("<p>Servlet API: " + ctx.getMajorVersion() + "." + ctx.getMinorVersion() + "</p>");
        out.println("<a href='about'>About</a>");
    }
}

// ===== com/course/web/AboutServlet.java =====
package com.course.web;

import jakarta.servlet.ServletContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/about")
public class AboutServlet extends HttpServlet {

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ServletContext ctx = req.getServletContext();
        int visits = VisitCounter.next(ctx);

        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h1>About " + ctx.getInitParameter("collegeName") + "</h1>");
        out.println("<p>Database: " + ctx.getInitParameter("dbUrl") + "</p>");
        out.println("<p>Context path: " + ctx.getContextPath() + "</p>");
        out.println("<p>Total site visits: " + visits + "</p>");
        out.println("<a href='home'>Home</a>");
    }
}

// ===== com/course/web/VisitCounter.java =====
package com.course.web;

import jakarta.servlet.ServletContext;
import java.util.concurrent.atomic.AtomicInteger;

public final class VisitCounter {
    private static final String KEY = "visitCounter";

    private VisitCounter() { }

    public static int next(ServletContext ctx) {
        AtomicInteger counter = (AtomicInteger) ctx.getAttribute(KEY);
        if (counter == null) {
            synchronized (ctx) {                       // create only once, safely
                counter = (AtomicInteger) ctx.getAttribute(KEY);
                if (counter == null) {
                    counter = new AtomicInteger();
                    ctx.setAttribute(KEY, counter);
                }
            }
        }
        return counter.incrementAndGet();
    }
}`,
      result: "1st request /home (Chrome):\nWelcome to Sunrise Institute of Technology\nTotal site visits: 1\nServer: Apache Tomcat/10.1.x\nServlet API: 6.0\n\n2nd request /about (Firefox):\nAbout Sunrise Institute of Technology\nDatabase: jdbc:mysql://localhost:3306/college_db\nContext path: /student-web\nTotal site visits: 2\n\n3rd request /home (Chrome again): Total site visits: 3",
      explanation: "Both servlets read the same context parameters and the same attribute, proving ServletContext is shared application-wide and across browsers/users. The counter is an AtomicInteger stored once (double-checked inside a synchronized block), so concurrent requests never lose a count. The counter resets when the application is redeployed because ServletContext is recreated. On Day 13 a ServletContextListener will create such shared objects at startup instead."
    },
    {
      title: "URL pattern matching: exact, path, extension and pathInfo",
      scenario: "Map three servlets with different pattern types and see which one Tomcat picks for each URL.",
      steps: [
        "Create PatternServlet (one class) and register it three times in web.xml with different names and patterns as shown",
        "Redeploy",
        "Open each test URL listed in the result and compare the servlet name, servlet path and path info"
      ],
      code: `<!-- ===== WEB-INF/web.xml ===== -->
<servlet>
    <servlet-name>exactUsers</servlet-name>
    <servlet-class>com.course.web.PatternServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>exactUsers</servlet-name>
    <url-pattern>/admin/users</url-pattern>
</servlet-mapping>

<servlet>
    <servlet-name>adminPath</servlet-name>
    <servlet-class>com.course.web.PatternServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>adminPath</servlet-name>
    <url-pattern>/admin/*</url-pattern>
</servlet-mapping>

<servlet>
    <servlet-name>doExtension</servlet-name>
    <servlet-class>com.course.web.PatternServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>doExtension</servlet-name>
    <url-pattern>*.do</url-pattern>
</servlet-mapping>

// ===== com/course/web/PatternServlet.java =====
package com.course.web;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;

public class PatternServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain");
        PrintWriter out = resp.getWriter();
        out.println("Servlet name : " + getServletName());
        out.println("Servlet path : " + req.getServletPath());
        out.println("Path info    : " + req.getPathInfo());
    }
}`,
      result: "/student-web/admin/users     -> Servlet name : exactUsers   | Servlet path : /admin/users | Path info : null\n/student-web/admin/users/7   -> Servlet name : adminPath    | Servlet path : /admin       | Path info : /users/7\n/student-web/admin           -> Servlet name : adminPath    | Servlet path : /admin       | Path info : null\n/student-web/save.do         -> Servlet name : doExtension  | Servlet path : /save.do     | Path info : null\n/student-web/admin/save.do   -> Servlet name : adminPath    | Servlet path : /admin       | Path info : /save.do",
      explanation: "The same class is registered three times, so Tomcat creates three separate instances, each with its own ServletConfig and name. Exact match beats path match; path match (/admin/*) beats extension match (*.do), which is why /admin/save.do goes to adminPath. getPathInfo returns the part after the servlet path, useful for REST-like URLs such as /students/7."
    }
  ],
  interview: [
    { q: "What is the difference between web.xml configuration and @WebServlet?", a: "web.xml is an external XML deployment descriptor (central, changeable without recompiling, overrides annotations). @WebServlet (Servlet 3.0+) declares name, URL patterns, init params and load-on-startup directly on the class, reducing XML. Both can be used together.", level: "Easy" },
    { q: "If both web.xml and @WebServlet configure the same servlet, which wins?", a: "web.xml. For the same servlet-name, values in web.xml override annotation values (e.g. url-patterns, init params).", level: "Medium" },
    { q: "What does metadata-complete=\"true\" do?", a: "It tells the container that web.xml is complete, so annotations like @WebServlet, @WebFilter and @WebListener are not scanned and are ignored.", level: "Hard" },
    { q: "What is ServletConfig?", a: "An object created per servlet by the container that provides the servlet's name, its init parameters and a reference to the ServletContext. Obtained with getServletConfig().", level: "Easy" },
    { q: "What is ServletContext?", a: "One object per web application shared by all servlets, filters and JSPs. It provides context init parameters, application-scoped attributes, resource access, server information and logging.", level: "Easy" },
    { q: "Difference between ServletConfig and ServletContext?", a: "ServletConfig is per servlet, holds init-params declared inside <servlet>, and has no attributes. ServletContext is per application, holds <context-param> values, supports setAttribute/getAttribute and lives for the whole application.", level: "Medium" },
    { q: "Difference between init parameters and context parameters?", a: "Init parameters (<init-param> / @WebInitParam) belong to a single servlet and are read via ServletConfig. Context parameters (<context-param>) belong to the whole app and are read via ServletContext.getInitParameter.", level: "Medium" },
    { q: "Explain the URL pattern types and their precedence.", a: "Exact (/login) first, then longest path prefix (/admin/*), then extension (*.do), then the default servlet (/). The first match in that order handles the request.", level: "Hard" },
    { q: "What is the difference between getServletPath() and getPathInfo()?", a: "getServletPath returns the part of the URL that matched the servlet mapping; getPathInfo returns the extra path after it (or null). For /admin/* and URL /admin/users/7: servlet path /admin, path info /users/7.", level: "Medium" },
    { q: "Are ServletContext attributes thread safe?", a: "Setting/getting attributes is safe, but the objects stored are shared by all request threads, so they must be immutable or thread-safe (AtomicInteger, ConcurrentHashMap) or protected by synchronization.", level: "Hard" },
    { q: "Can context parameters be declared with annotations?", a: "No. There is no annotation for context-param; use web.xml or set them programmatically in a ServletContainerInitializer / ServletContextListener.", level: "Medium" }
  ],
  practice: [
    {
      task: "Move the database URL, user and password into <context-param> entries and change DBUtil-style code so a servlet builds its Connection from those values.",
      hint: "Read the three params in init() via getServletContext().getInitParameter and keep them in fields.",
      solution: `<!-- web.xml -->
<context-param><param-name>dbUrl</param-name><param-value>jdbc:mysql://localhost:3306/college_db</param-value></context-param>
<context-param><param-name>dbUser</param-name><param-value>root</param-value></context-param>
<context-param><param-name>dbPass</param-name><param-value>root</param-value></context-param>

// CountStudentsServlet.java
package com.course.web;

import jakarta.servlet.ServletContext;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.sql.*;

@WebServlet("/count")
public class CountStudentsServlet extends HttpServlet {
    private String url, user, pass;

    @Override
    public void init() throws ServletException {
        ServletContext ctx = getServletContext();
        url  = ctx.getInitParameter("dbUrl");
        user = ctx.getInitParameter("dbUser");
        pass = ctx.getInitParameter("dbPass");
        try {
            Class.forName("com.mysql.cj.jdbc.Driver");
        } catch (ClassNotFoundException e) {
            throw new ServletException(e);
        }
    }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        try (Connection con = DriverManager.getConnection(url, user, pass);
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery("SELECT COUNT(*) FROM students")) {
            rs.next();
            resp.setContentType("text/plain");
            resp.getWriter().println("Students in DB: " + rs.getInt(1));
        } catch (SQLException e) {
            throw new ServletException(e);
        }
    }
}`
    },
    {
      task: "Create a servlet mapped to /students/* that shows 'All students' for /students and 'Student with id N' for /students/N, using getPathInfo().",
      hint: "pathInfo is null or \"/\" for the list; otherwise substring(1) gives the id.",
      solution: `package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;

@WebServlet("/students/*")
public class StudentPathServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain");
        String info = req.getPathInfo();
        if (info == null || info.equals("/")) {
            resp.getWriter().println("All students");
            return;
        }
        try {
            int id = Integer.parseInt(info.substring(1));
            resp.getWriter().println("Student with id " + id);
        } catch (NumberFormatException e) {
            resp.sendError(HttpServletResponse.SC_BAD_REQUEST, "Id must be a number");
        }
    }
}`
    },
    {
      task: "Write an admin servlet that lists every context parameter and every ServletContext attribute name.",
      hint: "Use Collections.list(ctx.getInitParameterNames()) and ctx.getAttributeNames().",
      solution: `package com.course.web;

import jakarta.servlet.ServletContext;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;
import java.util.Collections;

@WebServlet("/admin/context")
public class ContextInfoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        ServletContext ctx = getServletContext();
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h3>Context parameters</h3><ul>");
        for (String n : Collections.list(ctx.getInitParameterNames())) {
            out.println("<li>" + n + " = " + ctx.getInitParameter(n) + "</li>");
        }
        out.println("</ul><h3>Attributes</h3><ul>");
        for (String n : Collections.list(ctx.getAttributeNames())) {
            out.println("<li>" + n + "</li>");
        }
        out.println("</ul>");
    }
}`
    },
    {
      task: "Read a text file stored in WEB-INF (e.g. WEB-INF/notice.txt) through ServletContext.getResourceAsStream and display it.",
      hint: "Files in WEB-INF cannot be opened from the browser, but code can read them; use BufferedReader with UTF-8.",
      solution: `// src/main/webapp/WEB-INF/notice.txt
// Exams start on 1st December.
// Fee last date: 25th November.

package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.*;
import java.nio.charset.StandardCharsets;

@WebServlet("/notice")
public class NoticeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/plain;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        try (InputStream in = getServletContext().getResourceAsStream("/WEB-INF/notice.txt")) {
            if (in == null) {
                out.println("Notice file not found");
                return;
            }
            BufferedReader br = new BufferedReader(new InputStreamReader(in, StandardCharsets.UTF_8));
            String line;
            while ((line = br.readLine()) != null) {
                out.println(line);
            }
        }
    }
}`
    }
  ],
  quiz: [
    { question: "How many ServletContext objects exist per web application?", options: ["One per servlet", "One per request", "One per user session", "One for the whole application"], answer: 3, explanation: "ServletContext is application-wide and shared by all components." },
    { question: "Where are context parameters declared?", options: ["<context-param> in web.xml", "@WebInitParam", "<init-param> inside <servlet>", "@WebServlet(contextParams=...)"], answer: 0, explanation: "Only web.xml (or programmatic code) can declare context params." },
    { question: "A servlet is mapped to /admin/* and the URL is /app/admin/report. What does getPathInfo() return?", options: ["/admin/report", "/report", "/admin", "null"], answer: 1, explanation: "The servlet path is /admin; the remaining part /report is the path info." },
    { question: "Which configuration wins if web.xml and @WebServlet configure the same servlet name?", options: ["The annotation", "Whichever is compiled last", "web.xml", "Deployment fails"], answer: 2, explanation: "The deployment descriptor overrides annotation metadata." },
    { question: "Which object would you use to read a servlet-specific init parameter?", options: ["ServletContext", "ServletConfig", "HttpSession", "HttpServletResponse"], answer: 1, explanation: "Init parameters of one servlet are exposed through its ServletConfig." }
  ]
};
