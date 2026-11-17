export default {
  id: 'day-15-jsp-scripting-directives',
  title: 'JSP Scripting Elements and Directives',
  module: 'Module 3: JSP',
  day: 15,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn the three scripting elements (scriptlet, expression, declaration), JSP comments, and the three directives (page, include, taglib) with all important page attributes.',
  objectives: [
    'Write scriptlets, expressions and declarations and know where each goes in the generated Servlet',
    'Differentiate JSP comments from HTML comments',
    'Use the page directive attributes: import, contentType, session, errorPage, isErrorPage, buffer, isELIgnored',
    'Reuse common parts with the include directive and understand static inclusion',
    'Declare tag libraries with the taglib directive',
  ],
  theory: [
    {
      heading: 'Scripting elements overview',
      content:
        'Scripting elements let you put Java code inside a JSP. There are three:\n1. Scriptlet <% code %> - any Java statements. Goes INSIDE _jspService().\n2. Expression <%= value %> - prints the value of one Java expression. Becomes out.print(value) inside _jspService().\n3. Declaration <%! members %> - declares fields and methods. Goes OUTSIDE _jspService(), as class members.\n\nAnalogy: think of the generated Servlet as a house. Declarations are the furniture fixed to the house (shared by everyone who visits). Scriptlets are the activities done during a visit (new for every visitor).',
      syntax: `<%! int visits = 0;                       // field (shared)
    String upper(String s) { return s.toUpperCase(); } %>
<% String name = "ravi"; visits++; %>       <!-- local variable -->
<p><%= upper(name) %> - visit <%= visits %></p>`,
    },
    {
      heading: 'Scriptlet rules and mistakes',
      content: 'A scriptlet contains complete Java statements and must end statements with ";". Curly braces can span several scriptlets, which lets you wrap HTML inside if/for blocks.',
      points: [
        'Expression must NOT end with a semicolon: <%= name; %> is a compile error because it becomes out.print(name;);',
        'You cannot declare a method inside a scriptlet (it is inside a method already). Use a declaration.',
        'Variables declared in a scriptlet are local to one request (thread-safe). Fields from <%! %> are shared across all requests (not thread-safe).',
        'Modern practice: avoid scriptlets; use EL and JSTL (Day 17). Scriptlets are still asked in interviews and seen in old projects.',
      ],
    },
    {
      heading: 'Comments in JSP',
      content:
        'JSP comment <%-- text --%> is removed during translation: it is not in the generated Servlet and not sent to the browser. HTML comment <!-- text --> is sent to the browser and visible in View Source; any <%= %> inside it is still executed. Java comments // or /* */ can be used inside scriptlets.',
      tip: 'Never put secret information in HTML comments. Use JSP comments for developer notes.',
    },
    {
      heading: 'page directive',
      content:
        'Directives give instructions to the JSP translator (they do not produce output). Syntax: <%@ directive attribute="value" %>. The page directive sets properties of the whole page.',
      syntax: `<%@ page import="java.util.*, java.time.LocalDate" %>
<%@ page contentType="text/html;charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page session="false" %>
<%@ page errorPage="error.jsp" %>
<%@ page isErrorPage="true" %>
<%@ page buffer="16kb" autoFlush="true" %>
<%@ page isELIgnored="false" %>
<%@ page language="java" extends="..." info="..." %>`,
      points: [
        'import - only attribute that may appear multiple times.',
        'contentType - MIME type and charset of the response (default text/html).',
        'session - default true; false means the implicit object session is not available.',
        'errorPage - URL of a page to forward to if an uncaught exception occurs.',
        'isErrorPage - true makes the implicit object exception available.',
        'buffer / autoFlush - output buffer size (default 8kb) and whether to flush automatically when full.',
        'isELIgnored - if true, EL like ${x} is printed literally (default false).',
        'isThreadSafe - deprecated; do not use.',
      ],
    },
    {
      heading: 'include directive (static include)',
      content:
        'The include directive <%@ include file="header.jsp" %> copies the content of the given file into the current JSP at TRANSLATION time - like copy-paste. One Servlet is generated containing both. Variables declared in the included file are visible in the main file. Fragments are commonly named .jspf (JSP fragment).\n\nCompare with the action <jsp:include page="..."/> (Day 16) which includes the OUTPUT at REQUEST time.',
      points: [
        'Static include is faster at runtime (no extra call).',
        'If the included file changes, older containers may not re-translate the parent; Tomcat tracks dependencies, but dynamic include is safer for frequently changing content.',
        'Path is relative to the current JSP, or absolute from context root if it starts with "/".',
      ],
    },
    {
      heading: 'taglib directive',
      content:
        'The taglib directive declares a tag library so you can use custom tags in the page. You give the library URI and a prefix. For JSTL 3.0 (Jakarta EE 10) the URIs are jakarta.tags.core, jakarta.tags.fmt, jakarta.tags.functions, etc.',
      syntax: `<%@ taglib uri="jakarta.tags.core" prefix="c" %>
<c:out value="Hello"/>`,
      tip: 'Old tutorials use uri="http://java.sun.com/jsp/jstl/core" with javax. With Tomcat 10 and JSTL 3 use uri="jakarta.tags.core".',
    },
  ],
  examples: [
    {
      title: 'All three scripting elements in one page',
      scenario: 'Show a site visit counter (declaration), a computed discount (method in declaration), and a loop over products (scriptlet + expression).',
      steps: [
        'Eclipse: in Dynamic Web Project "jsp-demo" (Tomcat 10.1) right-click src/main/webapp > New > JSP File > scripting.jsp.',
        'IntelliJ: in Jakarta EE Web application project right-click webapp > New > JSP/JSPX file > scripting.',
        'Type the code and run on server: http://localhost:8080/jsp-demo/scripting.jsp.',
      ],
      code: `<%@ page contentType="text/html;charset=UTF-8" %>
<%-- Declaration: class-level members --%>
<%!
    private int hits = 0;

    private double discounted(double price) {
        return price > 1000 ? price * 0.9 : price;
    }
%>
<%-- Scriptlet: runs per request --%>
<%
    hits++;
    String[] names = {"Mouse", "Keyboard", "Monitor"};
    double[] prices = {500, 1500, 9000};
%>
<html><body>
  <h3>Visit number: <%= hits %></h3>
  <table border="1">
    <tr><th>Product</th><th>Price</th><th>After discount</th></tr>
    <% for (int i = 0; i < names.length; i++) { %>
      <tr>
        <td><%= names[i] %></td>
        <td><%= prices[i] %></td>
        <td><%= discounted(prices[i]) %></td>
      </tr>
    <% } %>
  </table>
</body></html>`,
      result: 'Visit number: 1\nMouse | 500.0 | 500.0\nKeyboard | 1500.0 | 1350.0\nMonitor | 9000.0 | 8100.0\n(Visit number increases on each refresh, for all users.)',
      explanation: 'hits and discounted() are class members. names and prices are local to _jspService. 1500*0.9 = 1350.0 and 9000*0.9 = 8100.0; 500 is not above 1000 so unchanged. double values print with .0.',
    },
    {
      title: 'JSP comment vs HTML comment',
      scenario: 'See what reaches the browser.',
      steps: [
        'Create comments.jsp with the code below.',
        'Run it, then right-click > View Page Source in the browser.',
      ],
      code: `<%@ page contentType="text/html;charset=UTF-8" %>
<html><body>
<%-- JSP comment: TODO connect to database --%>
<!-- HTML comment: generated at <%= new java.util.Date() %> -->
<p>Check the page source.</p>
</body></html>`,
      result: 'Page source shows:\n<!-- HTML comment: generated at Tue Nov 17 10:40:12 IST 2026 -->\n<p>Check the page source.</p>\nThe JSP comment text "TODO connect to database" does not appear anywhere.',
      explanation: 'The JSP comment is dropped by the translator. The HTML comment is template text, so it is sent, and the expression inside it is evaluated.',
    },
    {
      title: 'page directive: errorPage and isErrorPage',
      scenario: 'Divide two numbers. If the divisor is zero, the ArithmeticException should show a friendly error page instead of a stack trace.',
      steps: [
        'Create divide.jsp and error.jsp in webapp.',
        'Open /divide.jsp?a=10&b=2 and /divide.jsp?a=10&b=0.',
      ],
      code: `<%-- divide.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" errorPage="error.jsp" %>
<%
    int a = Integer.parseInt(request.getParameter("a"));
    int b = Integer.parseInt(request.getParameter("b"));
%>
<h3><%= a %> / <%= b %> = <%= a / b %></h3>

<%-- error.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<html><body>
  <h2 style="color:red">Oops! Something went wrong.</h2>
  <p>Error type: <%= exception.getClass().getSimpleName() %></p>
  <p>Message: <%= exception.getMessage() %></p>
  <a href="divide.jsp?a=10&b=2">Try again</a>
</body></html>`,
      result: 'a=10&b=2: "10 / 2 = 5"\na=10&b=0: "Oops! Something went wrong." / "Error type: ArithmeticException" / "Message: / by zero"',
      explanation: 'errorPage forwards to error.jsp on any uncaught exception. isErrorPage="true" makes the implicit object exception available. Tomcat sends status 500 for the error page.',
    },
    {
      title: 'include directive: common header and footer fragments',
      scenario: 'All pages share a header with a site title variable and a footer. Use static include so the variable is shared.',
      steps: [
        'Create folder webapp/WEB-INF/fragments and files header.jspf and footer.jspf.',
        'Create about.jsp in webapp that includes both.',
        'Run /about.jsp. Then look at the generated about_jsp.java in Tomcat work folder: the header code is inside it.',
      ],
      code: `<%-- WEB-INF/fragments/header.jspf --%>
<%! private final String SITE = "TechAcademy"; %>
<html><head><title><%= SITE %></title></head><body>
<header><h1><%= SITE %></h1><hr></header>

<%-- WEB-INF/fragments/footer.jspf --%>
<footer><hr><small>&copy; 2026 <%= SITE %></small></footer>
</body></html>

<%-- about.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/fragments/header.jspf" %>
<h2>About <%= SITE %></h2>
<p>We teach Java Full Stack.</p>
<%@ include file="/WEB-INF/fragments/footer.jspf" %>`,
      result: 'TechAcademy (heading)\n---\nAbout TechAcademy\nWe teach Java Full Stack.\n---\n© 2026 TechAcademy',
      explanation: 'Because include is copy-paste at translation time, SITE declared in header.jspf is visible in about.jsp and footer.jspf. With <jsp:include> this would not compile. Fragments under WEB-INF cannot be opened directly.',
    },
  ],
  interview: [
    { q: 'What are the scripting elements in JSP?', a: 'Scriptlet <% %>, expression <%= %> and declaration <%! %>.', level: 'Easy' },
    { q: 'Difference between scriptlet and declaration?', a: 'Scriptlet code goes inside _jspService() (local, per request). Declaration code goes at class level (fields/methods shared across requests). Methods can only be declared in declarations.', level: 'Easy' },
    { q: 'Why does <%= name; %> fail?', a: 'An expression is converted to out.print(name;); and the semicolon inside the parentheses is a syntax error.', level: 'Medium' },
    { q: 'What are JSP directives? Name them.', a: 'Instructions to the translator that affect the whole page. page, include and taglib (plus tag, attribute, variable in tag files).', level: 'Easy' },
    { q: 'Which page directive attribute can appear more than once?', a: 'import.', level: 'Medium' },
    { q: 'Difference between include directive and jsp:include action?', a: 'Directive: static, at translation time, content merged into one Servlet, shares variables, faster. Action: dynamic, at request time, output of separate resource included, can pass parameters, picks up changes immediately.', level: 'Medium' },
    { q: 'Difference between JSP comment and HTML comment?', a: 'JSP comment <%-- --%> is removed at translation and never sent to the client. HTML comment <!-- --> is sent to the browser and visible in View Source; JSP code inside it still runs.', level: 'Easy' },
    { q: 'What does isErrorPage="true" do?', a: 'Marks the page as an error page and makes the implicit object exception available in it.', level: 'Easy' },
    { q: 'What is the default buffer size of a JSP and what is autoFlush?', a: '8kb. autoFlush="true" (default) flushes when the buffer is full; if false, an exception is thrown on overflow.', level: 'Hard' },
    { q: 'What does session="false" do?', a: 'Prevents the JSP from creating/joining a session; the implicit session object is not available (compile error if used).', level: 'Medium' },
    { q: 'Why are scriptlets discouraged today?', a: 'They mix Java logic with HTML, are hard to maintain and test, and break MVC. EL and JSTL give the same results with clean tags.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create factorial.jsp that declares a method long fact(int n) and shows factorials of 1 to 10 in a table.',
      hint: 'Method in <%! %>, loop in <% %>.',
      solution: `<%@ page contentType="text/html;charset=UTF-8" %>
<%!
  long fact(int n) {
      long f = 1;
      for (int i = 2; i <= n; i++) f *= i;
      return f;
  }
%>
<table border="1"><tr><th>n</th><th>n!</th></tr>
<% for (int n = 1; n <= 10; n++) { %>
  <tr><td><%= n %></td><td><%= fact(n) %></td></tr>
<% } %>
</table>
<%-- last row: 10 | 3628800 --%>`,
    },
    {
      task: 'Create a page that imports java.time.LocalDate and java.time.DayOfWeek and prints whether today is a weekend.',
      hint: 'Use two page directives or one with comma separated imports.',
      solution: `<%@ page contentType="text/html;charset=UTF-8" %>
<%@ page import="java.time.LocalDate" %>
<%@ page import="java.time.DayOfWeek" %>
<%
  DayOfWeek d = LocalDate.now().getDayOfWeek();
  boolean weekend = d == DayOfWeek.SATURDAY || d == DayOfWeek.SUNDAY;
%>
<h3>Today is <%= d %> - <%= weekend ? "Weekend!" : "Working day" %></h3>`,
    },
    {
      task: 'Create menu.jspf with navigation links and include it in three pages (home.jsp, courses.jsp, contact.jsp) using the include directive.',
      hint: 'Use request.getContextPath() inside the fragment for links.',
      solution: `<%-- WEB-INF/fragments/menu.jspf --%>
<nav>
  <a href="<%= request.getContextPath() %>/home.jsp">Home</a> |
  <a href="<%= request.getContextPath() %>/courses.jsp">Courses</a> |
  <a href="<%= request.getContextPath() %>/contact.jsp">Contact</a>
</nav>

<%-- home.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/fragments/menu.jspf" %>
<h2>Home</h2>

<%-- courses.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/fragments/menu.jspf" %>
<h2>Courses</h2>

<%-- contact.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ include file="/WEB-INF/fragments/menu.jspf" %>
<h2>Contact</h2>`,
    },
    {
      task: 'Create age.jsp that reads "dob" (yyyy-MM-dd), computes the age, and uses errorPage to handle an invalid date (DateTimeParseException).',
      hint: 'Period.between(LocalDate.parse(dob), LocalDate.now()).getYears().',
      solution: `<%-- age.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" errorPage="ageError.jsp"
         import="java.time.*" %>
<%
  LocalDate dob = LocalDate.parse(request.getParameter("dob"));
  int age = Period.between(dob, LocalDate.now()).getYears();
%>
<h3>You are <%= age %> years old.</h3>

<%-- ageError.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" isErrorPage="true" %>
<h3 style="color:red">Invalid date. Use format yyyy-MM-dd.</h3>
<p>(<%= exception.getClass().getSimpleName() %>)</p>`,
    },
  ],
  quiz: [
    {
      question: 'Where does code inside <%! %> go in the generated Servlet?',
      options: ['Inside _jspService()', 'At class level, outside _jspService()', 'Inside jspInit() only', 'It is not copied'],
      answer: 1,
      explanation: 'Declarations become fields and methods of the generated class.',
    },
    {
      question: 'Which is a correct JSP expression?',
      options: ['<%= name; %>', '<% = name %>', '<%= name %>', '<%! name %>'],
      answer: 2,
      explanation: 'No semicolon and no space between <% and =.',
    },
    {
      question: 'Which attribute makes the implicit object "exception" available?',
      options: ['isErrorPage="true"', 'errorPage="true"', 'exception="true"', 'isThreadSafe="false"'],
      answer: 0,
      explanation: 'Only pages with isErrorPage="true" get the exception object.',
    },
    {
      question: 'The include directive includes content at:',
      options: ['Request time', 'Deployment time only', 'Browser rendering time', 'Translation time'],
      answer: 3,
      explanation: 'It is a static, copy-paste include during translation.',
    },
    {
      question: 'For JSTL 3 on Tomcat 10, the correct core taglib URI is:',
      options: ['http://java.sun.com/jsp/jstl/core', 'jakarta.tags.core', 'javax.servlet.jsp.jstl.core', 'http://jakarta.ee/jstl'],
      answer: 1,
      explanation: 'JSTL 3.0 introduced the short URI jakarta.tags.core.',
    },
  ],
};
