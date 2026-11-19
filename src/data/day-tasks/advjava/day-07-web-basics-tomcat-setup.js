export default {
  lesson: 'day-07-web-basics-tomcat-setup',
  minutes: 18,
  intro: 'Check how HTTP requests and responses work, what Tomcat is, and the standard Java web project structure.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A student opens `http://localhost:8080/college/reslt.jsp` (typo in the file name). Which HTTP status code does Tomcat return?',
      options: ['200 OK', '302 Found', '404 Not Found', '500 Internal Server Error'],
      answer: 2,
      explain: '**404** means the server has no resource at that URL. **500** means the resource exists but your code threw an exception, **302** is a redirect and **200** is success. Remember the families: 2xx success, 3xx redirect, 4xx client error, 5xx server error.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **HTTP** are TRUE? (choose all that apply)',
      options: [
        'HTTP is stateless: each request is independent and the server does not remember the previous one',
        'A GET request sends form data in the URL query string',
        'Every HTTP response starts with a status line such as HTTP/1.1 200 OK',
        'The Content-Type header tells the browser what kind of body is coming (e.g. text/html)',
        'A POST request can never carry any data',
      ],
      answers: [0, 1, 2, 3],
      explain: 'POST carries its data in the request **body** (which is why it is used for forms with passwords or large data). Statelessness is the reason we will later need cookies and sessions. Headers such as `Content-Type: text/html; charset=UTF-8` describe the body.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is **Apache Tomcat**?',
      options: [
        'A full Jakarta EE application server with EJB and JMS',
        'A web server and servlet container that runs Servlets and JSPs',
        'A database for Java applications',
        'A Java compiler',
      ],
      answer: 1,
      explain: 'Tomcat is a **servlet container** (plus a basic web server): it implements Servlet, JSP, EL and WebSocket. Full application servers such as WildFly or GlassFish add EJB, JMS, JTA and more. For Servlet/JSP and Spring apps Tomcat is enough.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Your servlet imports `javax.servlet.http.HttpServlet` and Tomcat **10.1** refuses to load it. Why?',
      options: [
        'Tomcat 10+ uses the jakarta.servlet packages (Jakarta EE 9+), so the import must be jakarta.servlet.http.HttpServlet',
        'Tomcat 10 does not support servlets any more',
        'HttpServlet was renamed to WebServlet',
        'You must use Java 6 with Tomcat 10',
      ],
      answer: 0,
      explain: 'When Java EE moved to the Eclipse Foundation the package names changed from `javax.*` to **`jakarta.*`**. Tomcat 9 = javax, Tomcat 10/10.1/11 = jakarta. Mixing an old javax tutorial with Tomcat 10 is the most common setup error.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In a Maven WAR project, what is the path of the deployment descriptor, relative to `src/main/webapp`?',
      example: { title: 'where things go', text: '`src/main/java` → Java classes · `src/main/resources` → properties files · `src/main/webapp` → JSP, HTML, CSS and the protected folder' },
      accept: ['WEB-INF/web.xml', '/WEB-INF/web.xml', 'src/main/webapp/WEB-INF/web.xml', 'webapp/WEB-INF/web.xml'],
      explain: 'The deployment descriptor is `WEB-INF/web.xml`. Everything inside **WEB-INF** (web.xml, `classes`, `lib`) cannot be requested directly from the browser, which is why protected JSP views are also placed there later in the course.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The app is deployed with context path `/college` and this servlet is mapped to `/students`. The browser requests:\n`http://localhost:8080/college/students?id=5`\n\nWhat does the servlet print to the console?',
      example: { title: 'URL parts', text: 'For `http://localhost:8080/shop/cart?item=7` with the servlet mapped to `/cart`: context path `/shop`, servlet path `/cart`, query string `item=7`.' },
      code: `protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    System.out.println(req.getMethod());
    System.out.println(req.getContextPath());
    System.out.println(req.getServletPath());
    System.out.println(req.getQueryString());
}`,
      expected: 'GET\n/college\n/students\nid=5',
      explain: 'Typing a URL in the address bar sends a **GET**. The context path identifies the web application (`/college`), the servlet path is the part that matched the mapping (`/students`) and the query string is everything after `?`, without the `?` itself.',
    },
  ],
};
