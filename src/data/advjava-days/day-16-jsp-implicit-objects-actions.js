export default {
  id: 'day-16-jsp-implicit-objects-actions',
  title: 'JSP Implicit Objects and Action Tags',
  module: 'Module 3: JSP',
  day: 16,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Use the nine implicit objects that every JSP gets for free, understand the four scopes, and use standard action tags such as jsp:include, jsp:forward, jsp:param and jsp:useBean / setProperty / getProperty.',
  objectives: [
    'List the 9 implicit objects with their types and uses',
    'Explain page, request, session and application scopes and use pageContext to access them',
    'Use jsp:include and jsp:forward with jsp:param',
    'Create a JavaBean and use jsp:useBean, jsp:setProperty and jsp:getProperty',
    'Choose between include directive and include action',
  ],
  theory: [
    {
      heading: 'The 9 implicit objects',
      content:
        'Implicit objects are variables that the container creates in _jspService() so you can use them in scriptlets and expressions without declaring them.\n\n1. request - HttpServletRequest: parameters, headers, attributes.\n2. response - HttpServletResponse: redirect, headers, cookies.\n3. out - JspWriter: writes to the response (buffered).\n4. session - HttpSession: user data (not available if session="false").\n5. application - ServletContext: app-wide data and init params.\n6. config - ServletConfig: init params of this JSP (if mapped in web.xml).\n7. pageContext - PageContext: access to all scopes and other implicit objects.\n8. page - Object: this, the current Servlet instance (rarely used).\n9. exception - Throwable: only in error pages (isErrorPage="true").',
      tip: 'Memory trick: "R-R-O-S-A-C-P-P-E" - Request, Response, Out, Session, Application, Config, PageContext, Page, Exception.',
    },
    {
      heading: 'Four scopes',
      content:
        'An attribute (name/value object) can be stored in four scopes, from shortest to longest life:\n1. page - only this JSP during this request (pageContext.setAttribute).\n2. request - this request, including forwarded/included resources (request.setAttribute).\n3. session - this user across many requests until logout/timeout (session.setAttribute).\n4. application - all users until the app stops (application.setAttribute).\n\nAnalogy: page = a sticky note on your desk; request = a file passed along one office queue; session = your personal locker; application = the notice board everyone sees.',
      syntax: `pageContext.setAttribute("x", 1, PageContext.SESSION_SCOPE);
Object v = pageContext.findAttribute("x");  // searches page -> request -> session -> application`,
    },
    {
      heading: 'out vs response.getWriter()',
      content:
        'out is a JspWriter, a buffered writer with methods print, println, newLine, clear, flush and getRemaining. It buffers output (default 8kb), so you can still forward or set headers until the buffer is flushed. In JSP always use out (or expressions) instead of response.getWriter(), otherwise output order gets mixed and you may get IllegalStateException.',
    },
    {
      heading: 'Standard action tags',
      content:
        'Action tags are XML-style tags with prefix jsp that perform actions at request time.',
      points: [
        '<jsp:include page="x.jsp"/> - includes the OUTPUT of another resource at request time (dynamic).',
        '<jsp:forward page="x.jsp"/> - forwards the request (like RequestDispatcher.forward). Code after it does not run.',
        '<jsp:param name="n" value="v"/> - adds a request parameter inside include/forward.',
        '<jsp:useBean id="s" class="com.x.Student" scope="request"/> - finds or creates a bean.',
        '<jsp:setProperty name="s" property="*"/> - sets bean properties from request parameters with matching names.',
        '<jsp:getProperty name="s" property="name"/> - prints a bean property.',
        'Others: <jsp:element>, <jsp:attribute>, <jsp:body>, <jsp:text>, <jsp:plugin> (obsolete).',
      ],
    },
    {
      heading: 'JavaBeans and useBean',
      content:
        'A JavaBean is a simple Java class that follows rules: public class, public no-argument constructor, private fields, public getters/setters (getName/setName, isActive for boolean), and ideally implements Serializable. It must be in a package (beans in the default package cannot be used from JSP).\n\njsp:useBean looks for an attribute named id in the given scope. If found it uses it; if not, it creates a new object with the no-arg constructor and stores it in that scope. The body of useBean runs only when the bean is newly created.',
      syntax: `<jsp:useBean id="emp" class="com.demo.Employee" scope="session">
   <jsp:setProperty name="emp" property="company" value="TCS"/>  <!-- only first time -->
</jsp:useBean>
<jsp:setProperty name="emp" property="*"/>       <!-- all matching params -->
<jsp:setProperty name="emp" property="name" param="empName"/>
<jsp:getProperty name="emp" property="name"/>`,
      points: [
        'property="*" matches parameter names to property names and converts types (String to int, double, boolean).',
        'scope default is page.',
        'Bean classes go under src/main/java in a package and compile to WEB-INF/classes.',
      ],
    },
    {
      heading: 'include directive vs jsp:include action',
      content:
        'Directive <%@ include file %>: translation time, content copied, one Servlet, shared variables, cannot pass parameters, slightly faster.\nAction <jsp:include page/>: request time, separate resources, output combined, can pass <jsp:param>, page attribute can be an expression, changes visible immediately.\n\nRule of thumb: static content that rarely changes (header with declarations) -> directive. Dynamic content or needs parameters -> action.',
    },
  ],
  examples: [
    {
      title: 'Exploring implicit objects and scopes',
      scenario: 'One page that uses request, session, application, pageContext, out and config, and a counter at each scope.',
      steps: [
        'Eclipse: in project "jsp-demo" (Dynamic Web Project, Tomcat 10.1) create webapp/implicit.jsp. IntelliJ: right-click webapp > New > JSP/JSPX file.',
        'Run /implicit.jsp?city=Pune. Refresh, then open in another browser (or Incognito).',
      ],
      code: `<%@ page contentType="text/html;charset=UTF-8" %>
<%
    // page scope counter (always 1)
    Integer p = (Integer) pageContext.getAttribute("pc");
    p = (p == null) ? 1 : p + 1;
    pageContext.setAttribute("pc", p);

    // session scope counter (per user)
    Integer s = (Integer) session.getAttribute("sc");
    s = (s == null) ? 1 : s + 1;
    session.setAttribute("sc", s);

    // application scope counter (all users)
    Integer a;
    synchronized (application) {
        a = (Integer) application.getAttribute("ac");
        a = (a == null) ? 1 : a + 1;
        application.setAttribute("ac", a);
    }
%>
<html><body>
  <p>City parameter (request): <%= request.getParameter("city") %></p>
  <p>Client IP: <%= request.getRemoteAddr() %></p>
  <p>Session id: <%= session.getId() %></p>
  <p>Server info (application): <%= application.getServerInfo() %></p>
  <p>Servlet name (config): <%= config.getServletName() %></p>
  <hr>
  <p>Page count: <%= p %></p>
  <p>Session count: <%= s %></p>
  <p>Application count: <%= a %></p>
  <% out.println("<p>Written using out.println</p>"); %>
</body></html>`,
      result: 'First load: City parameter (request): Pune / Server info: Apache Tomcat/10.1.x / Servlet name (config): jsp / Page count: 1 / Session count: 1 / Application count: 1 / Written using out.println\nAfter 2 refreshes: Page 1, Session 3, Application 3.\nNew browser: Page 1, Session 1, Application 4.',
      explanation: 'Page scope dies after the page; session scope lives per user; application scope is shared by all users. config.getServletName() returns "jsp" because the JSP is served by Tomcat\'s default JspServlet unless mapped in web.xml.',
    },
    {
      title: 'jsp:include with jsp:param',
      scenario: 'A reusable banner.jsp shows a title passed as a parameter. Two pages include it with different titles.',
      steps: [
        'Create webapp/WEB-INF/parts/banner.jsp.',
        'Create home.jsp and offers.jsp that include it with different parameters.',
        'Run both pages.',
      ],
      code: `<%-- WEB-INF/parts/banner.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<div style="background:#1e3a8a;color:white;padding:10px">
  <h2><%= request.getParameter("title") %></h2>
  <small><%= request.getParameter("subtitle") %></small>
</div>

<%-- home.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<html><body>
<jsp:include page="/WEB-INF/parts/banner.jsp">
    <jsp:param name="title" value="Welcome to ShopEasy"/>
    <jsp:param name="subtitle" value="Best prices daily"/>
</jsp:include>
<p>Home page content.</p>
</body></html>

<%-- offers.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<html><body>
<jsp:include page="/WEB-INF/parts/banner.jsp">
    <jsp:param name="title" value="Today's Offers"/>
    <jsp:param name="subtitle" value="Up to 50% off"/>
</jsp:include>
<p>Offers list...</p>
</body></html>`,
      result: 'home.jsp: blue banner "Welcome to ShopEasy" / "Best prices daily", then "Home page content."\noffers.jsp: blue banner "Today\'s Offers" / "Up to 50% off", then "Offers list..."',
      explanation: 'jsp:param values are added as request parameters only for the included page. banner.jsp is a separate Servlet called at request time.',
    },
    {
      title: 'jsp:useBean with property="*" (registration form)',
      scenario: 'A form submits name, age and email. A Student bean is filled automatically with jsp:setProperty property="*" and displayed with jsp:getProperty.',
      steps: [
        'Create package com.demo.model and class Student (Eclipse: src/main/java > New > Class; IntelliJ: src/main/java > New > Java Class com.demo.model.Student).',
        'Create register.html and showStudent.jsp in webapp.',
        'Run /register.html, fill Ravi, 21, ravi@mail.com and submit.',
      ],
      code: `// src/main/java/com/demo/model/Student.java
package com.demo.model;

import java.io.Serializable;

public class Student implements Serializable {
    private String name;
    private int age;
    private String email;

    public Student() { }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getAge() { return age; }
    public void setAge(int age) { this.age = age; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public boolean isAdult() { return age >= 18; }
}

<!-- webapp/register.html -->
<form action="showStudent.jsp" method="post">
  Name: <input name="name"><br>
  Age: <input name="age" type="number"><br>
  Email: <input name="email"><br>
  <button>Register</button>
</form>

<%-- webapp/showStudent.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<% request.setCharacterEncoding("UTF-8"); %>
<jsp:useBean id="student" class="com.demo.model.Student" scope="request"/>
<jsp:setProperty name="student" property="*"/>
<html><body>
  <h3>Registration Details</h3>
  <p>Name: <jsp:getProperty name="student" property="name"/></p>
  <p>Age: <jsp:getProperty name="student" property="age"/></p>
  <p>Email: <jsp:getProperty name="student" property="email"/></p>
  <p>Adult: <%= student.isAdult() ? "Yes" : "No" %></p>
</body></html>`,
      result: 'Registration Details\nName: Ravi\nAge: 21\nEmail: ravi@mail.com\nAdult: Yes',
      explanation: 'property="*" calls setName("Ravi"), setAge(21) (String converted to int) and setEmail(...). useBean also creates a scripting variable named student, so it can be used in expressions.',
    },
    {
      title: 'jsp:forward based on a condition',
      scenario: 'A role.jsp page forwards admins to admin.jsp and everyone else to user.jsp, passing a greeting parameter.',
      steps: [
        'Create role.jsp, and WEB-INF/views/admin.jsp and WEB-INF/views/user.jsp.',
        'Open /role.jsp?role=admin&name=Asha and /role.jsp?role=guest&name=Kiran.',
      ],
      code: `<%-- role.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<% if ("admin".equals(request.getParameter("role"))) { %>
    <jsp:forward page="/WEB-INF/views/admin.jsp">
        <jsp:param name="greet" value="Welcome back, boss"/>
    </jsp:forward>
<% } else { %>
    <jsp:forward page="/WEB-INF/views/user.jsp">
        <jsp:param name="greet" value="Hello"/>
    </jsp:forward>
<% } %>

<%-- WEB-INF/views/admin.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<h2>Admin Panel</h2>
<p><%= request.getParameter("greet") %>, <%= request.getParameter("name") %></p>

<%-- WEB-INF/views/user.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<h2>User Home</h2>
<p><%= request.getParameter("greet") %>, <%= request.getParameter("name") %></p>`,
      result: 'role=admin&name=Asha -> "Admin Panel" / "Welcome back, boss, Asha"\nrole=guest&name=Kiran -> "User Home" / "Hello, Kiran"\nThe address bar still shows role.jsp?... in both cases.',
      explanation: 'jsp:forward clears the buffer and forwards on the server. The original parameters (name) and the extra jsp:param (greet) are both visible in the target.',
    },
  ],
  interview: [
    { q: 'List the 9 JSP implicit objects.', a: 'request, response, out, session, application, config, pageContext, page, exception.', level: 'Easy' },
    { q: 'What is the type of the out object?', a: 'jakarta.servlet.jsp.JspWriter, a buffered writer (not PrintWriter).', level: 'Medium' },
    { q: 'Which implicit object is not available in every JSP?', a: 'exception (only when isErrorPage="true"); session is also unavailable when session="false".', level: 'Medium' },
    { q: 'What are the four scopes in JSP?', a: 'page, request, session, application - from shortest to longest lifetime.', level: 'Easy' },
    { q: 'What is pageContext used for?', a: 'It gives access to all scopes (setAttribute with scope, findAttribute), all other implicit objects, and forward/include helpers. It is also what EL uses internally.', level: 'Medium' },
    { q: 'What does pageContext.findAttribute("x") do?', a: 'Searches for attribute x in page, then request, then session, then application scope, and returns the first match or null.', level: 'Medium' },
    { q: 'What are JSP action tags? Name some.', a: 'XML tags executed at request time: jsp:include, jsp:forward, jsp:param, jsp:useBean, jsp:setProperty, jsp:getProperty, jsp:element, jsp:attribute, jsp:body, jsp:text.', level: 'Easy' },
    { q: 'What are the rules of a JavaBean?', a: 'Public class in a package, public no-arg constructor, private properties with public getters/setters (is for boolean), preferably Serializable.', level: 'Easy' },
    { q: 'How does jsp:useBean work?', a: 'It looks up the attribute with the given id in the given scope. If it exists it is reused; otherwise a new instance is created with the no-arg constructor and stored in the scope. Body content runs only on creation.', level: 'Medium' },
    { q: 'What does property="*" do in jsp:setProperty?', a: 'Sets every bean property whose name matches a request parameter name, with automatic type conversion. Parameters that are empty are skipped.', level: 'Medium' },
    { q: 'Difference between include directive and jsp:include?', a: 'Directive is static (translation time, merged into one Servlet, shares variables). Action is dynamic (request time, separate resources, supports jsp:param).', level: 'Medium' },
    { q: 'Difference between jsp:forward and response.sendRedirect?', a: 'jsp:forward is server-side, same request, URL unchanged, attributes kept. sendRedirect is client-side, new request, URL changes.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create headers.jsp that prints all request headers in a table using request.getHeaderNames().',
      hint: 'Enumeration<String> names = request.getHeaderNames(); while hasMoreElements.',
      solution: `<%@ page contentType="text/html;charset=UTF-8" import="java.util.Enumeration" %>
<table border="1"><tr><th>Header</th><th>Value</th></tr>
<%
  Enumeration<String> names = request.getHeaderNames();
  while (names.hasMoreElements()) {
      String n = names.nextElement();
%>
  <tr><td><%= n %></td><td><%= request.getHeader(n) %></td></tr>
<% } %>
</table>`,
    },
    {
      task: 'Create a Product bean (id, name, price) and productForm.html + product.jsp that fills the bean with property="*" and shows the price with 18% GST.',
      hint: 'Add a getter getPriceWithGst() in the bean; use jsp:getProperty property="priceWithGst".',
      solution: `package com.demo.model;
public class Product implements java.io.Serializable {
    private int id; private String name; private double price;
    public Product() {}
    public int getId() { return id; }   public void setId(int id) { this.id = id; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public double getPrice() { return price; } public void setPrice(double p) { this.price = p; }
    public double getPriceWithGst() { return Math.round(price * 1.18 * 100) / 100.0; }
}

<!-- productForm.html -->
<form action="product.jsp" method="post">
 Id <input name="id"> Name <input name="name"> Price <input name="price">
 <button>Save</button>
</form>

<%-- product.jsp --%>
<jsp:useBean id="p" class="com.demo.model.Product" scope="request"/>
<jsp:setProperty name="p" property="*"/>
<p><jsp:getProperty name="p" property="name"/> costs
   <jsp:getProperty name="p" property="priceWithGst"/> with GST</p>
<%-- price 100 -> 118.0 --%>`,
    },
    {
      task: 'Use jsp:useBean with scope="session" to build a page that remembers the user\'s preferred language across requests (lang parameter).',
      hint: 'A Prefs bean with property lang; setProperty only when the parameter is present.',
      solution: `package com.demo.model;
public class Prefs implements java.io.Serializable {
    private String lang = "English";
    public Prefs() {}
    public String getLang() { return lang; }
    public void setLang(String lang) { this.lang = lang; }
}

<%-- lang.jsp --%>
<jsp:useBean id="prefs" class="com.demo.model.Prefs" scope="session"/>
<jsp:setProperty name="prefs" property="lang" param="lang"/>
<p>Your language: <jsp:getProperty name="prefs" property="lang"/></p>
<a href="lang.jsp?lang=Hindi">Hindi</a> | <a href="lang.jsp?lang=Marathi">Marathi</a> | <a href="lang.jsp">Keep</a>
<%-- If the lang param is missing, setProperty with param does nothing, so the old value stays. --%>`,
    },
    {
      task: 'Create layout.jsp that includes header.jsp, a content page chosen by parameter "p" (home or about), and footer.jsp using jsp:include with an expression in the page attribute.',
      hint: 'page="<%= ... %>" is allowed for jsp:include (request-time attribute). Validate p.',
      solution: `<%@ page contentType="text/html;charset=UTF-8" %>
<%
  String p = request.getParameter("p");
  if (!"about".equals(p)) p = "home";
  String content = "/WEB-INF/pages/" + p + ".jsp";
%>
<html><body>
<jsp:include page="/WEB-INF/pages/header.jsp"/>
<jsp:include page="<%= content %>"/>
<jsp:include page="/WEB-INF/pages/footer.jsp"/>
</body></html>`,
    },
  ],
  quiz: [
    {
      question: 'Which implicit object represents ServletContext?',
      options: ['config', 'pageContext', 'application', 'page'],
      answer: 2,
      explanation: 'application is the ServletContext of the web app.',
    },
    {
      question: 'Which scope lives the longest?',
      options: ['application', 'session', 'request', 'page'],
      answer: 0,
      explanation: 'Application scope lasts until the app is stopped.',
    },
    {
      question: 'jsp:setProperty property="*" sets properties from:',
      options: ['Session attributes', 'Cookies', 'Init parameters', 'Request parameters with matching names'],
      answer: 3,
      explanation: 'It matches request parameter names to bean property names.',
    },
    {
      question: 'Which tag includes another resource at REQUEST time?',
      options: ['<%@ include file="x.jsp" %>', '<jsp:include page="x.jsp"/>', '<%@ taglib %>', '<jsp:useBean/>'],
      answer: 1,
      explanation: 'The action tag is dynamic; the directive is static.',
    },
    {
      question: 'What happens to the body of <jsp:useBean>...</jsp:useBean> when the bean already exists in the scope?',
      options: ['It runs every time', 'It throws an exception', 'It is skipped', 'It replaces the bean'],
      answer: 2,
      explanation: 'The body runs only when the bean is newly created.',
    },
  ],
};
