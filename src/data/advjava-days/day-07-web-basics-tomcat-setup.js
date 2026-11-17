export default {
  id: "day-07-web-basics-tomcat-setup",
  title: "Web Application Basics, HTTP, Apache Tomcat Setup in Eclipse and IntelliJ, Project Structure",
  module: "Module 2: Servlets",
  day: 7,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Understand how the web works (client, server, HTTP request and response), what a servlet container is, install Apache Tomcat 10.1, configure it in Eclipse Enterprise Edition and IntelliJ IDEA, and learn the standard Java web project structure with WEB-INF and web.xml.",
  objectives: [
    "Explain client-server architecture and the HTTP request/response cycle",
    "Identify HTTP methods, headers and status codes",
    "Differentiate web server, servlet container and application server",
    "Install Tomcat 10.1 and run a web project from Eclipse and IntelliJ IDEA",
    "Describe the WAR project structure: webapp, WEB-INF, web.xml, classes and lib"
  ],
  theory: [
    {
      heading: "How the Web Works: Client, Server, URL",
      content: "A web application is software that runs on a server and is used through a browser. Analogy: a restaurant. The customer (browser/client) places an order (HTTP request) with the waiter; the kitchen (server) prepares it and the waiter brings back the dish (HTTP response). The menu card address is the URL.\n\nAnatomy of a URL:\nhttp://localhost:8080/student-web/hello?name=Asha\n- http        -> protocol\n- localhost   -> host (your own machine, IP 127.0.0.1)\n- 8080        -> port (Tomcat default)\n- /student-web -> context path (which web application)\n- /hello      -> resource path (which servlet/page)\n- ?name=Asha  -> query string (parameters)",
      points: [
        "Static content: fixed HTML/CSS/images, same for everyone.",
        "Dynamic content: generated per request by Java code (servlets/JSP) e.g. 'Welcome Asha, you have 3 pending fees'.",
        "Java web apps generate dynamic content using Servlets and JSP running inside a servlet container."
      ]
    },
    {
      heading: "HTTP Request and Response",
      content: "HTTP (HyperText Transfer Protocol) is a text-based, stateless, request-response protocol on top of TCP. Stateless means the server forgets you after each request (that is why we need sessions on Day 12).\n\nRequest = request line + headers + blank line + optional body:\nPOST /student-web/register HTTP/1.1\nHost: localhost:8080\nContent-Type: application/x-www-form-urlencoded\nContent-Length: 27\n\nname=Asha&course=Java\n\nResponse = status line + headers + blank line + body:\nHTTP/1.1 200 OK\nContent-Type: text/html;charset=UTF-8\n\n<html>...Registered...</html>",
      points: [
        "GET: read data; parameters go in the URL; can be bookmarked; limited length; should not change data.",
        "POST: send data in the body (forms, login); not shown in URL; used to create/change data.",
        "PUT (update), DELETE (remove), HEAD (headers only), OPTIONS, PATCH are mostly used in REST APIs.",
        "Status codes: 1xx info, 2xx success (200 OK, 201 Created), 3xx redirect (301, 302 Found, 304 Not Modified), 4xx client error (400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed), 5xx server error (500 Internal Server Error, 503 Service Unavailable).",
        "Important headers: Content-Type, Content-Length, Cookie / Set-Cookie, Location (redirects), User-Agent."
      ],
      tip: "Open the browser DevTools (F12) > Network tab, reload a page and click the request to see the real request and response headers."
    },
    {
      heading: "Web Server vs Servlet Container vs Application Server",
      content: "A web server (Apache HTTPD, Nginx) serves static files over HTTP. A servlet container (web container) is the part that runs Java servlets and JSPs: it creates servlet objects, calls their methods for each request, manages threads, sessions and the lifecycle. An application server (WildFly, GlassFish, Payara, WebLogic) implements the full Jakarta EE platform (servlets plus EJB, JMS, JTA, CDI...).\n\nApache Tomcat = web server + servlet container (Catalina) + JSP engine (Jasper). It is lightweight and the most popular choice; Spring Boot even embeds it.",
      points: [
        "Tomcat 9.x  -> Servlet 4.0, package javax.servlet.*, Java 8+",
        "Tomcat 10.1 -> Servlet 6.0 (Jakarta EE 10), package jakarta.servlet.*, Java 11+",
        "Tomcat 11.0 -> Servlet 6.1 (Jakarta EE 11), Java 17+",
        "Since Jakarta EE 9 the package changed from javax.servlet to jakarta.servlet. Code with javax imports compiles but gives 404/ClassNotFound on Tomcat 10. This is the number one setup mistake today."
      ],
      tip: "This course uses Tomcat 10.1 + Java 17 + jakarta.servlet-api 6.0.0."
    },
    {
      heading: "Installing Apache Tomcat 10.1",
      content: "Tomcat is just a ZIP; no installer is needed for development.",
      points: [
        "Download: tomcat.apache.org > Download > Tomcat 10 > 'Core: zip' (Windows) or 'tar.gz' (Linux/macOS). Do not use the Windows Service Installer for IDE work.",
        "Extract to a path without spaces, e.g. C:/dev/apache-tomcat-10.1.x or ~/dev/apache-tomcat-10.1.x.",
        "Make sure JAVA_HOME points to JDK 17 (Windows: System Properties > Environment Variables).",
        "Test outside the IDE: bin/startup.bat (Windows) or bin/startup.sh (Linux/macOS: chmod +x bin/*.sh first). Open http://localhost:8080 to see the Tomcat welcome page. Stop with bin/shutdown.bat or bin/shutdown.sh before using the IDE, otherwise port 8080 is busy.",
        "Tomcat folders: bin (scripts), conf (server.xml, tomcat-users.xml, web.xml), lib (shared JARs incl. servlet-api.jar), logs (catalina.out / localhost logs), webapps (deployed apps), work (compiled JSPs), temp."
      ],
      tip: "Error 'Address already in use: 8080'? Another Tomcat or app is running. Stop it, or change the port in conf/server.xml (Connector port=\"8080\") or in the IDE server settings."
    },
    {
      heading: "Java Web Project Structure (Maven WAR)",
      content: "A Java web application is packaged as a WAR (Web ARchive) file. Inside, WEB-INF is a private folder: the browser can never request anything inside it directly, so classes and configuration are safe.\n\nstudent-web/\n  pom.xml                        <- packaging war, dependencies\n  src/main/java/                 <- servlet and DAO source code\n      com/course/web/HelloServlet.java\n  src/main/resources/            <- db.properties etc. (copied to WEB-INF/classes)\n  src/main/webapp/               <- web root (public)\n      index.html                 <- http://localhost:8080/student-web/index.html\n      css/style.css\n      WEB-INF/\n          web.xml                <- deployment descriptor (optional with annotations)\n          lib/                   <- extra JARs (Maven fills this in the WAR)\n          classes/               <- compiled .class files (generated)\n\nEclipse 'Dynamic Web Project' (non-Maven) uses src/main/java and src/main/webapp too (older versions used WebContent).",
      points: [
        "Deployment descriptor web.xml: maps URLs to servlets, welcome files, error pages, init parameters, session timeout.",
        "Context path: usually the project name (/student-web); configurable in the IDE.",
        "Welcome file: index.html or index.jsp shown when the user opens only the context path.",
        "jakarta.servlet-api has scope 'provided' because Tomcat already contains it in its lib folder; packaging it inside the WAR causes conflicts."
      ]
    }
  ],
  examples: [
    {
      title: "Maven pom.xml for a Tomcat 10.1 web project",
      scenario: "The pom.xml used by every servlet day (Days 7 to 13). It packages a WAR and includes the Jakarta Servlet API and MySQL driver.",
      steps: [
        "Eclipse EE: File > New > Maven Project > tick 'Create a simple project' > Next > Group Id: com.course, Artifact Id: student-web, Packaging: war > Finish",
        "IntelliJ IDEA: File > New > Project > 'Maven Archetype' (left side) > JDK 17 > Archetype: org.apache.maven.archetypes:maven-archetype-webapp > Name: student-web > Create",
        "Replace the generated pom.xml with the code below and reload Maven (Eclipse: Maven > Update Project, IntelliJ: Load Maven Changes)",
        "Create the folder src/main/java if it does not exist (the IntelliJ archetype does not create it): right-click src/main > New > Directory > java"
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0
                             https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.course</groupId>
    <artifactId>student-web</artifactId>
    <version>1.0</version>
    <packaging>war</packaging>

    <properties>
        <maven.compiler.source>17</maven.compiler.source>
        <maven.compiler.target>17</maven.compiler.target>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
    </properties>

    <dependencies>
        <!-- Servlet API: provided by Tomcat 10.1 at runtime -->
        <dependency>
            <groupId>jakarta.servlet</groupId>
            <artifactId>jakarta.servlet-api</artifactId>
            <version>6.0.0</version>
            <scope>provided</scope>
        </dependency>

        <!-- MySQL JDBC driver: packaged into WEB-INF/lib -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>8.4.0</version>
        </dependency>
    </dependencies>

    <build>
        <finalName>student-web</finalName>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-war-plugin</artifactId>
                <version>3.4.0</version>
            </plugin>
        </plugins>
    </build>
</project>`,
      result: "Maven builds without errors. Running 'mvn package' (or Maven tool window > Lifecycle > package) creates target/student-web.war.",
      explanation: "packaging war tells Maven to build a web archive. scope provided = available for compiling but not copied into the WAR, because Tomcat supplies it. finalName gives a clean WAR name and default context path /student-web. maven-war-plugin 3.4.0 works with Java 17 and does not require web.xml."
    },
    {
      title: "web.xml, index.html and the first servlet",
      scenario: "Create the minimum files of a working web app: a deployment descriptor, a welcome page and a servlet mapped to /hello.",
      steps: [
        "Create folder src/main/webapp/WEB-INF (IntelliJ archetype already has it) and the file web.xml inside it with the content below",
        "Create src/main/webapp/index.html",
        "Create package com.course.web under src/main/java (right-click java > New > Package) and class HelloServlet in it",
        "Delete index.jsp if the IntelliJ archetype created one, so index.html is the welcome page"
      ],
      code: `<?xml version="1.0" encoding="UTF-8"?>
<!-- ===== src/main/webapp/WEB-INF/web.xml ===== -->
<web-app xmlns="https://jakarta.ee/xml/ns/jakartaee"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="https://jakarta.ee/xml/ns/jakartaee
                             https://jakarta.ee/xml/ns/jakartaee/web-app_6_0.xsd"
         version="6.0">

    <display-name>Student Web</display-name>

    <servlet>
        <servlet-name>hello</servlet-name>
        <servlet-class>com.course.web.HelloServlet</servlet-class>
    </servlet>
    <servlet-mapping>
        <servlet-name>hello</servlet-name>
        <url-pattern>/hello</url-pattern>
    </servlet-mapping>

    <welcome-file-list>
        <welcome-file>index.html</welcome-file>
    </welcome-file-list>
</web-app>

<!-- ===== src/main/webapp/index.html ===== -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Student Web</title>
</head>
<body>
    <h1>Student Web Application</h1>
    <p>Tomcat is serving this static page.</p>
    <a href="hello">Call HelloServlet</a>
</body>
</html>

// ===== src/main/java/com/course/web/HelloServlet.java =====
package com.course.web;

import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.io.PrintWriter;
import java.time.LocalTime;

public class HelloServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<html><body>");
        out.println("<h2>Hello from a Servlet!</h2>");
        out.println("<p>Server time: " + LocalTime.now().withNano(0) + "</p>");
        out.println("<p>Context path: " + req.getContextPath() + "</p>");
        out.println("<p>Method: " + req.getMethod() + "</p>");
        out.println("</body></html>");
    }
}`,
      result: "http://localhost:8080/student-web/        -> 'Student Web Application' page\nhttp://localhost:8080/student-web/hello   -> Hello from a Servlet!\n                                            Server time: 10:15:42 (current time)\n                                            Context path: /student-web\n                                            Method: GET",
      explanation: "web.xml declares the servlet (name + class) and maps it to /hello. The welcome file is shown for the bare context path. The href 'hello' is relative, so it resolves to /student-web/hello. Every import is jakarta.servlet, matching Tomcat 10.1."
    },
    {
      title: "Run on Tomcat 10.1 in Eclipse IDE for Enterprise Java and Web Developers",
      scenario: "Register Tomcat in Eclipse, deploy student-web and open it in the browser.",
      steps: [
        "Install 'Eclipse IDE for Enterprise Java and Web Developers' (not the plain Java edition; it lacks server tools)",
        "Window > Preferences > Server > Runtime Environments > Add... > Apache > Apache Tomcat v10.1 > tick 'Create a new local server' > Next",
        "Tomcat installation directory: Browse to the extracted apache-tomcat-10.1.x folder; JRE: choose JDK 17 > Finish > Apply and Close",
        "Open the Servers view (Window > Show View > Servers). The new 'Tomcat v10.1 Server at localhost' appears",
        "Right-click the student-web project > Properties > Project Facets: make sure 'Dynamic Web Module' 6.0 and Java 17 are ticked (Maven projects usually set this automatically after Maven > Update Project)",
        "Right-click the project > Run As > Run on Server > select Tomcat v10.1 > Finish",
        "Eclipse opens http://localhost:8080/student-web/ in its internal browser; copy the URL into Chrome if you prefer",
        "After changing Java code, Eclipse republishes automatically; if not, right-click the server > Clean... then Restart",
        "Alternative without Maven: File > New > Dynamic Web Project > Target runtime: Apache Tomcat v10.1 > Dynamic web module version 6.0 > Next > Next > tick 'Generate web.xml deployment descriptor' > Finish; put mysql-connector-j JAR in src/main/webapp/WEB-INF/lib"
      ],
      code: `Eclipse Servers view after deployment:

Tomcat v10.1 Server at localhost  [Started, Synchronized]
  └── student-web  [Synchronized]

Console (excerpt):
INFO: Server version name:   Apache Tomcat/10.1.x
INFO: Deploying web application directory ...student-web
INFO: Starting ProtocolHandler ["http-nio-8080"]
INFO: Server startup in [850] milliseconds`,
      result: "Browser at http://localhost:8080/student-web/ shows 'Student Web Application'; clicking the link shows 'Hello from a Servlet!'.",
      explanation: "Eclipse does not copy the project into Tomcat's webapps folder; it deploys to a private folder (.metadata/.plugins/org.eclipse.wst.server.core/tmp0/wtpwebapps) and runs Tomcat with its own configuration in the 'Servers' project. If you see 404, check: correct Tomcat version, jakarta imports, the URL contains the context path, and the project was added to the server."
    },
    {
      title: "Run on Tomcat 10.1 in IntelliJ IDEA (Ultimate and Community)",
      scenario: "Create a run configuration that builds the WAR and deploys it to Tomcat from IntelliJ.",
      steps: [
        "IntelliJ IDEA Ultimate: Run > Edit Configurations... > + (Add New Configuration) > Tomcat Server > Local",
        "Server tab: Application server > Configure... > Tomcat Home: select the apache-tomcat-10.1.x folder > OK. Set JRE to 17. HTTP port 8080",
        "Click 'Fix' at the bottom (or open the Deployment tab) > + > Artifact... > choose student-web:war exploded",
        "Deployment tab: set Application context to /student-web",
        "Server tab: 'On Update action' = Update classes and resources; 'On frame deactivation' = Update classes and resources (hot reload)",
        "Click OK, then click the green Run (or Debug) button. IntelliJ builds, starts Tomcat and opens the browser",
        "IntelliJ IDEA Community (no built-in Tomcat support): File > Settings > Plugins > Marketplace > search 'Smart Tomcat' > Install > restart",
        "Community: Run > Edit Configurations > + > Smart Tomcat > Tomcat Server: Configure > add the Tomcat folder; Deployment Directory: src/main/webapp; Context Path: /student-web > OK > Run",
        "Alternative for both: run 'mvn package' and copy target/student-web.war into Tomcat's webapps folder, then start Tomcat with bin/startup"
      ],
      code: `IntelliJ Run configuration (Ultimate) summary:

Name:                Tomcat 10.1
Application server:  Tomcat 10.1.x  (Tomcat Home = /path/apache-tomcat-10.1.x)
URL:                 http://localhost:8080/student-web/
JRE:                 17
HTTP port:           8080
Before launch:       Build, Build 'student-web:war exploded' artifact
Deployment:          student-web:war exploded
Application context: /student-web

Services / Run window (excerpt):
[2026-11-17 10:15:00] Artifact student-web:war exploded: Artifact is being deployed, please wait...
[2026-11-17 10:15:01] Artifact student-web:war exploded: Artifact is deployed successfully
[2026-11-17 10:15:01] Artifact student-web:war exploded: Deploy took 650 milliseconds`,
      result: "IntelliJ opens http://localhost:8080/student-web/ and the welcome page is displayed; /hello shows the servlet output.",
      explanation: "'war exploded' deploys the unpacked directory (target/student-web), which allows fast class/resource updates without rebuilding the WAR. If the context is left as '/', the URL becomes http://localhost:8080/hello, which confuses many students. Smart Tomcat runs Tomcat directly against your webapp folder and Maven output."
    },
    {
      title: "Seeing raw HTTP: request and response for the form submission",
      scenario: "Understand what the browser actually sends and what Tomcat returns, using browser DevTools and curl.",
      steps: [
        "Start the app on Tomcat from Eclipse or IntelliJ",
        "Open http://localhost:8080/student-web/hello in Chrome, press F12 > Network tab > reload > click 'hello' > view Headers",
        "Or run the curl command below in a terminal (Windows 10+ includes curl)",
        "Also try a wrong URL like /student-web/helo and note the 404 status"
      ],
      code: `$ curl -i http://localhost:8080/student-web/hello

HTTP/1.1 200
Content-Type: text/html;charset=UTF-8
Content-Length: 160
Date: Tue, 17 Nov 2026 04:45:42 GMT

<html><body>
<h2>Hello from a Servlet!</h2>
<p>Server time: 10:15:42</p>
<p>Context path: /student-web</p>
<p>Method: GET</p>
</body></html>

$ curl -i -X POST http://localhost:8080/student-web/hello
HTTP/1.1 405
Content-Type: text/html;charset=utf-8
...
HTTP Status 405 – Method Not Allowed ... HTTP method POST is not supported by this URL`,
      result: "GET returns status 200 with the HTML body. POST returns 405 Method Not Allowed because HelloServlet only overrides doGet. A misspelt URL returns 404 Not Found.",
      explanation: "Tomcat writes only the status code (no reason phrase like OK) in HTTP/1.1 responses. HttpServlet's default doPost sends 405, which proves the container is choosing the method based on the HTTP verb. Exact Content-Length and Date depend on your run."
    }
  ],
  interview: [
    { q: "What is HTTP and why is it called stateless?", a: "HyperText Transfer Protocol is a request-response protocol used by browsers and servers. It is stateless because each request is independent; the server does not remember previous requests unless we use cookies or sessions.", level: "Easy" },
    { q: "Difference between GET and POST?", a: "GET sends data in the URL query string, is bookmarkable, cached, limited in length and should be idempotent/read-only. POST sends data in the request body, is not shown in the URL, has no practical size limit and is used to create or change data.", level: "Easy" },
    { q: "What are common HTTP status codes?", a: "200 OK, 201 Created, 301/302 redirect, 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 500 Internal Server Error, 503 Service Unavailable.", level: "Easy" },
    { q: "What is a servlet container?", a: "The part of a server that manages servlets: loading classes, creating instances, calling init/service/destroy, mapping URLs, creating request/response objects, managing threads and sessions. Tomcat's container is called Catalina.", level: "Medium" },
    { q: "Difference between web server and application server?", a: "A web server serves static content over HTTP (Nginx, Apache HTTPD). A web container like Tomcat adds servlet/JSP support. A full application server (WildFly, WebLogic) supports the whole Jakarta EE stack like EJB, JMS and JTA.", level: "Medium" },
    { q: "What is the purpose of WEB-INF?", a: "It is a protected folder in a web app. Its contents (web.xml, classes, lib) cannot be accessed directly by the browser, only by the container and application code.", level: "Easy" },
    { q: "What is web.xml?", a: "The deployment descriptor in WEB-INF that configures the web app: servlet declarations and mappings, filters, listeners, welcome files, error pages, context and init parameters, session timeout. Since Servlet 3.0 it is optional when using annotations.", level: "Easy" },
    { q: "What is a WAR file?", a: "Web ARchive: a ZIP file with a defined structure (static files at root, WEB-INF/web.xml, WEB-INF/classes, WEB-INF/lib) that is deployed to a servlet container.", level: "Easy" },
    { q: "Why does my servlet give 404 on Tomcat 10 even though the code compiles?", a: "Most often it imports javax.servlet instead of jakarta.servlet. Tomcat 10+ only recognises jakarta.servlet classes. Other causes: wrong context path in URL, wrong url-pattern, project not deployed.", level: "Medium" },
    { q: "Why is jakarta.servlet-api declared with scope provided?", a: "The container already supplies the Servlet API JAR; provided means it is used for compilation but not packaged in the WAR, avoiding class loading conflicts.", level: "Medium" },
    { q: "What is a context path?", a: "The URL prefix that identifies a web application on the server, e.g. /student-web in http://localhost:8080/student-web/hello. req.getContextPath() returns it.", level: "Easy" }
  ],
  practice: [
    {
      task: "Install Tomcat 10.1, start it from the command line, open http://localhost:8080, then stop it. Write down the commands for your OS.",
      hint: "Use the scripts in the bin folder; on Linux/macOS make them executable first.",
      solution: `# Windows (Command Prompt)
cd C:/dev/apache-tomcat-10.1.x/bin
startup.bat
REM open http://localhost:8080 in browser
shutdown.bat

# Linux / macOS
cd ~/dev/apache-tomcat-10.1.x/bin
chmod +x *.sh
./startup.sh
# open http://localhost:8080 in browser
tail -f ../logs/catalina.out     # watch logs (Ctrl+C to stop watching)
./shutdown.sh`
    },
    {
      task: "Create an about.html page in src/main/webapp and a servlet TimeServlet mapped to /time in web.xml that prints the current date. Link both from index.html.",
      hint: "Add another <servlet> and <servlet-mapping> pair in web.xml.",
      solution: `<!-- web.xml additions -->
<servlet>
    <servlet-name>time</servlet-name>
    <servlet-class>com.course.web.TimeServlet</servlet-class>
</servlet>
<servlet-mapping>
    <servlet-name>time</servlet-name>
    <url-pattern>/time</url-pattern>
</servlet-mapping>

<!-- index.html links -->
<a href="about.html">About</a> | <a href="time">Today's date</a>

<!-- about.html -->
<!DOCTYPE html>
<html><head><meta charset="UTF-8"><title>About</title></head>
<body><h1>About this app</h1><p>Built with Servlets on Tomcat 10.1.</p></body></html>

// TimeServlet.java
package com.course.web;

import jakarta.servlet.http.*;
import java.io.IOException;
import java.time.LocalDate;

public class TimeServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        resp.getWriter().println("<h2>Today is " + LocalDate.now() + "</h2>");
    }
}`
    },
    {
      task: "Write a servlet /info that prints request details: method, request URI, context path, servlet path, query string, remote address and the User-Agent header.",
      hint: "Use req.getMethod(), getRequestURI(), getContextPath(), getServletPath(), getQueryString(), getRemoteAddr(), getHeader(\"User-Agent\").",
      solution: `package com.course.web;

import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.io.PrintWriter;

@WebServlet("/info")
public class RequestInfoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
        resp.setContentType("text/html;charset=UTF-8");
        PrintWriter out = resp.getWriter();
        out.println("<h2>Request Info</h2><ul>");
        out.println("<li>Method: " + req.getMethod() + "</li>");
        out.println("<li>Request URI: " + req.getRequestURI() + "</li>");
        out.println("<li>Context path: " + req.getContextPath() + "</li>");
        out.println("<li>Servlet path: " + req.getServletPath() + "</li>");
        out.println("<li>Query string: " + req.getQueryString() + "</li>");
        out.println("<li>Remote address: " + req.getRemoteAddr() + "</li>");
        out.println("<li>User-Agent: " + req.getHeader("User-Agent") + "</li>");
        out.println("</ul>");
    }
}`
    },
    {
      task: "Build the WAR with Maven and deploy it manually to a standalone Tomcat (outside the IDE).",
      hint: "mvn clean package creates target/student-web.war; copy it to TOMCAT/webapps and start Tomcat.",
      solution: `# from the project folder (or Maven tool window > Lifecycle > clean, package)
mvn clean package

# copy the WAR (Linux/macOS)
cp target/student-web.war ~/dev/apache-tomcat-10.1.x/webapps/

# start Tomcat; it auto-extracts webapps/student-web/
~/dev/apache-tomcat-10.1.x/bin/startup.sh

# open http://localhost:8080/student-web/
# to undeploy: stop Tomcat and delete webapps/student-web.war and webapps/student-web/`
    }
  ],
  quiz: [
    { question: "Which package must servlets use on Tomcat 10.1?", options: ["javax.servlet", "jakarta.servlet", "java.servlet", "org.apache.servlet"], answer: 1, explanation: "Tomcat 10+ implements Jakarta EE where the package is jakarta.servlet." },
    { question: "Which folder in a web app cannot be accessed directly from the browser?", options: ["webapp", "css", "WEB-INF", "images"], answer: 2, explanation: "WEB-INF is protected; only the container and code can read it." },
    { question: "What does HTTP status 405 mean?", options: ["Not Found", "Server Error", "Forbidden", "Method Not Allowed"], answer: 3, explanation: "The URL exists but does not support that HTTP method (e.g. POST without doPost)." },
    { question: "What is the default HTTP port of Tomcat?", options: ["8080", "80", "3306", "8443"], answer: 0, explanation: "Tomcat's HTTP connector listens on 8080 by default (8443 for HTTPS)." },
    { question: "Why is jakarta.servlet-api given scope 'provided' in pom.xml?", options: ["It is downloaded at runtime from the internet", "Tomcat already has it, so it should not be packaged in the WAR", "It is only needed for tests", "It makes the WAR executable"], answer: 1, explanation: "The container supplies the API; packaging it again can cause conflicts." }
  ]
};
