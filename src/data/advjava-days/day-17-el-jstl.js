export default {
  id: 'day-17-el-jstl',
  title: 'Expression Language (EL) and JSTL',
  module: 'Module 3: JSP',
  day: 17,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Replace Java code in JSP with Expression Language (EL) and the JSP Standard Tag Library (JSTL 3.0). Learn EL syntax, implicit objects and operators, and the core, fmt and functions tag libraries on Tomcat 10.',
  objectives: [
    'Write EL expressions to read attributes, bean properties, lists and maps',
    'Use EL implicit objects (param, paramValues, header, cookie, sessionScope, initParam, pageContext) and operators (empty, ternary, eq, gt...)',
    'Add JSTL 3.0 to a Tomcat 10 project in Eclipse and IntelliJ',
    'Use c:out, c:set, c:if, c:choose, c:forEach, c:url, c:import, c:redirect, c:catch',
    'Format numbers and dates with fmt and use fn functions',
  ],
  theory: [
    {
      heading: 'What is Expression Language (EL)?',
      content:
        'EL is a simple language to read data inside JSP without Java code. Syntax: ${expression}. Instead of <%= ((Student) request.getAttribute("s")).getName() %> you write ${s.name}. EL is enabled by default (isELIgnored="false").\n\nHow EL finds a name: for ${s}, it searches page -> request -> session -> application scope (like pageContext.findAttribute). If nothing is found it prints an empty string, not "null", and does not throw NullPointerException.\n\nAnalogy: EL is like asking a receptionist "give me Ravi\'s phone number" instead of walking through every cabinet yourself.',
      syntax: '${student.name}          -> calls getName()\n${student["name"]}       -> same, bracket form\n${list[0]}              -> first element\n${map.key} / ${map["key-with-dash"]}\n${10 + 5}  ${a > b}  ${empty list}  ${age >= 18 ? "Adult" : "Minor"}',
      points: [
        'Dot operator calls the getter (property name, not field name).',
        'Bracket operator is needed for list indexes, map keys with special characters, or dynamic keys ${map[param.k]}.',
        'EL is null-safe: ${user.address.city} prints nothing if user is null.',
      ],
    },
    {
      heading: 'EL implicit objects and operators',
      content:
        'EL has its own 11 implicit objects (different from JSP implicit objects):\n- pageScope, requestScope, sessionScope, applicationScope - maps of attributes in each scope.\n- param - single request parameter (${param.name}); paramValues - array (${paramValues.hobby[0]}).\n- header, headerValues - request headers (${header["User-Agent"]}).\n- cookie - ${cookie.theme.value}.\n- initParam - context init parameters from web.xml.\n- pageContext - the PageContext object: ${pageContext.request.contextPath}.\n\nOperators:\n- Arithmetic: + - * / div % mod\n- Relational: == eq, != ne, < lt, > gt, <= le, >= ge\n- Logical: && and, || or, ! not\n- empty: true if null, empty string, empty collection/array/map\n- Conditional: a ? b : c\n- String concatenation (EL 3.0+): += as in ${"Hi " += name}',
      tip: 'Use ${pageContext.request.contextPath} to build links, e.g. href="${pageContext.request.contextPath}/students".',
    },
    {
      heading: 'What is JSTL and how to add it (Tomcat 10)',
      content:
        'JSTL (Jakarta Standard Tag Library) is a set of ready-made tags for loops, conditions, URLs, formatting and string functions. Tomcat does NOT include JSTL, so you must add two jars: the API and an implementation.\n\nMaven (IntelliJ or Eclipse Maven project), pom.xml:\n<dependency> jakarta.servlet.jsp.jstl : jakarta.servlet.jsp.jstl-api : 3.0.0 </dependency>\n<dependency> org.glassfish.web : jakarta.servlet.jsp.jstl : 3.0.1 </dependency>\n\nEclipse Dynamic Web Project without Maven: download jakarta.servlet.jsp.jstl-api-3.0.0.jar and jakarta.servlet.jsp.jstl-3.0.1.jar from Maven Central and copy them into src/main/webapp/WEB-INF/lib (Eclipse adds them to the build path automatically under "Web App Libraries").\n\nTaglib URIs for JSTL 3.0:\n- core: <%@ taglib prefix="c" uri="jakarta.tags.core" %>\n- formatting: <%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>\n- functions: <%@ taglib prefix="fn" uri="jakarta.tags.functions" %>\n- (also jakarta.tags.sql and jakarta.tags.xml - rarely used)',
      tip: 'If you see "The absolute uri: [jakarta.tags.core] cannot be resolved", the JSTL jars are missing in WEB-INF/lib (or Maven scope is wrong - it must be compile, not provided). If you use the old javax JSTL 1.2 jar on Tomcat 10 you get ClassNotFoundException: javax.servlet.jsp.tagext.TagSupport.',
    },
    {
      heading: 'JSTL core tags (c:)',
      content: 'The most used tags:',
      points: [
        '<c:out value="${x}" default="-"/> - prints with HTML escaping (prevents XSS). escapeXml="true" by default.',
        '<c:set var="total" value="${a + b}" scope="request"/> - creates/updates a scoped variable. Also target/property to set a bean/map property.',
        '<c:remove var="total" scope="request"/> - removes a variable.',
        '<c:if test="${cond}"> ... </c:if> - simple if (no else).',
        '<c:choose><c:when test=""/>...<c:otherwise/></c:choose> - if / else-if / else.',
        '<c:forEach items="${list}" var="s" varStatus="st"> - loop over collections/arrays/maps; or begin/end/step for numbers. st.index, st.count, st.first, st.last.',
        '<c:forTokens items="a,b,c" delims="," var="t"> - split a string.',
        '<c:url value="/students"><c:param name="id" value="5"/></c:url> - builds URL with context path, encoding and session id.',
        '<c:import url="..."/> - include content from a URL (even external).',
        '<c:redirect url="/login"/> - sendRedirect.',
        '<c:catch var="err"> ... </c:catch> - catch exceptions in the body.',
      ],
    },
    {
      heading: 'fmt and fn libraries',
      content:
        'fmt (formatting & i18n): <fmt:formatNumber value="${price}" type="currency" currencySymbol="Rs."/>, <fmt:formatNumber value="${x}" pattern="#,##0.00"/>, <fmt:formatDate value="${date}" pattern="dd-MM-yyyy"/> (works with java.util.Date, not LocalDate), <fmt:setLocale value="en_IN"/>, <fmt:parseNumber/>, <fmt:message key="..."/> with <fmt:setBundle basename="messages"/> for multi-language apps.\n\nfn (functions, used inside EL): ${fn:length(list)}, ${fn:toUpperCase(name)}, ${fn:contains(s, "java")}, ${fn:substring(s, 0, 3)}, ${fn:replace(s, "a", "b")}, ${fn:split(s, ",")}, ${fn:trim(s)}, ${fn:escapeXml(s)}, ${fn:startsWith(s, "A")}, ${fn:join(arr, "-")}.',
    },
    {
      heading: 'Common mistakes with EL/JSTL',
      content: 'Watch out for these:',
      points: [
        'Writing ${student.Name} - property names start with lower case (getName -> name).',
        'Using == between strings in Java scriptlets is wrong, but in EL eq/== compares values correctly.',
        'Forgetting the taglib directive - tags are printed as plain text.',
        'Using the JSTL 1.2 URI http://java.sun.com/jsp/jstl/core with Tomcat 10 - use jakarta.tags.core.',
        'Printing user input with ${...} directly in HTML - use <c:out> or fn:escapeXml to avoid XSS.',
        'Calling fmt:formatDate with a LocalDate - it needs java.util.Date; format LocalDate in Java or use ${d.format(...)} with EL method call.',
      ],
    },
  ],
  examples: [
    {
      title: 'Project setup: JSTL 3 on Tomcat 10 (Maven pom.xml)',
      scenario: 'Create a Maven web project with Servlet 6, JSP 3.1 and JSTL 3 dependencies, used by all following examples.',
      steps: [
        'IntelliJ IDEA Ultimate: File > New > Project > Jakarta EE > Name "el-jstl-demo", Template "Web application", Application server Tomcat 10.1, Language Java, Build system Maven, Group com.demo, JDK 17 > Next > Version "Jakarta EE 10", tick Servlet > Create.',
        'IntelliJ: open pom.xml, add the two JSTL dependencies below, click the Maven "Load Maven Changes" icon (Ctrl+Shift+O).',
        'Eclipse: File > New > Maven Project > tick "Create a simple project" > Group com.demo, Artifact el-jstl-demo, Packaging war > Finish. Paste the pom.xml below. Right-click project > Maven > Update Project. Right-click project > Properties > Project Facets > tick Dynamic Web Module 6.0 and Java 17 > Runtimes tab > Apache Tomcat v10.1 > Apply.',
        'Eclipse (no Maven alternative): put the two JSTL jars in src/main/webapp/WEB-INF/lib.',
        'Create the test JSP below in src/main/webapp and run on Tomcat 10.1.',
      ],
      code: `<!-- pom.xml -->
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
  <modelVersion>4.0.0</modelVersion>
  <groupId>com.demo</groupId>
  <artifactId>el-jstl-demo</artifactId>
  <version>1.0</version>
  <packaging>war</packaging>

  <properties>
    <maven.compiler.release>17</maven.compiler.release>
    <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
  </properties>

  <dependencies>
    <!-- Provided by Tomcat 10.1 -->
    <dependency>
      <groupId>jakarta.servlet</groupId>
      <artifactId>jakarta.servlet-api</artifactId>
      <version>6.0.0</version>
      <scope>provided</scope>
    </dependency>
    <dependency>
      <groupId>jakarta.servlet.jsp</groupId>
      <artifactId>jakarta.servlet.jsp-api</artifactId>
      <version>3.1.1</version>
      <scope>provided</scope>
    </dependency>
    <!-- JSTL 3.0: NOT provided by Tomcat, so default (compile) scope -->
    <dependency>
      <groupId>jakarta.servlet.jsp.jstl</groupId>
      <artifactId>jakarta.servlet.jsp.jstl-api</artifactId>
      <version>3.0.0</version>
    </dependency>
    <dependency>
      <groupId>org.glassfish.web</groupId>
      <artifactId>jakarta.servlet.jsp.jstl</artifactId>
      <version>3.0.1</version>
    </dependency>
  </dependencies>

  <build>
    <finalName>el-jstl-demo</finalName>
    <plugins>
      <plugin>
        <groupId>org.apache.maven.plugins</groupId>
        <artifactId>maven-war-plugin</artifactId>
        <version>3.4.0</version>
      </plugin>
    </plugins>
  </build>
</project>

<%-- src/main/webapp/test-jstl.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="msg" value="JSTL is working on Tomcat 10"/>
<h3><c:out value="\${msg}"/></h3>
<p>2 + 3 = \${2 + 3}</p>`,
      result: 'JSTL is working on Tomcat 10\n2 + 3 = 5',
      explanation: 'Servlet and JSP APIs are provided by Tomcat; JSTL must be packaged in WEB-INF/lib, so its scope is compile. If the heading shows, the setup is correct.',
    },
    {
      title: 'EL basics: beans, lists, maps, params and operators',
      scenario: 'A Servlet puts a Student bean, a list and a map into request scope and forwards to a JSP that shows everything using only EL.',
      steps: [
        'Create com.demo.model.Student (name, marks) and com.demo.web.ElDemoServlet mapped to /el.',
        'Create src/main/webapp/WEB-INF/views/el.jsp.',
        'Run http://localhost:8080/el-jstl-demo/el?city=Pune&hobby=chess&hobby=music',
      ],
      code: `// com/demo/model/Student.java
package com.demo.model;

public class Student {
    private String name;
    private int marks;
    public Student() { }
    public Student(String name, int marks) { this.name = name; this.marks = marks; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public int getMarks() { return marks; }
    public void setMarks(int marks) { this.marks = marks; }
}

// com/demo/web/ElDemoServlet.java
package com.demo.web;

import com.demo.model.Student;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.*;

@WebServlet("/el")
public class ElDemoServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setAttribute("student", new Student("Ravi", 82));
        req.setAttribute("subjects", List.of("Java", "SQL", "HTML"));
        Map<String, Integer> fees = new LinkedHashMap<>();
        fees.put("core-java", 5000);
        fees.put("spring", 8000);
        req.setAttribute("fees", fees);
        req.getSession().setAttribute("role", "trainer");
        req.getRequestDispatcher("/WEB-INF/views/el.jsp").forward(req, resp);
    }
}

<%-- WEB-INF/views/el.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<html><body>
  <p>Name: \${student.name}, Marks: \${student.marks}</p>
  <p>Result: \${student.marks >= 35 ? "Pass" : "Fail"}</p>
  <p>Grade A? \${student.marks gt 80 and student.marks le 100}</p>
  <p>First subject: \${subjects[0]}, count empty? \${empty subjects}</p>
  <p>Spring fee: \${fees.spring}, Core Java fee: \${fees["core-java"]}</p>
  <p>City param: \${param.city}, 2nd hobby: \${paramValues.hobby[1]}</p>
  <p>Role (session): \${sessionScope.role}</p>
  <p>Missing attribute prints nothing: [\${notThere.name}]</p>
  <p>Context path: \${pageContext.request.contextPath}</p>
  <p>Browser: \${header["User-Agent"]}</p>
  <p>Math: \${10 div 4}, \${10 mod 4}, \${"Hi " += student.name}</p>
</body></html>`,
      result: 'Name: Ravi, Marks: 82\nResult: Pass\nGrade A? true\nFirst subject: Java, count empty? false\nSpring fee: 8000, Core Java fee: 5000\nCity param: Pune, 2nd hobby: music\nRole (session): trainer\nMissing attribute prints nothing: []\nContext path: /el-jstl-demo\nBrowser: Mozilla/5.0 (...)\nMath: 2.5, 2, Hi Ravi',
      explanation: 'EL calls getters, indexes lists, reads maps by key (brackets for "core-java" because of the dash), and returns empty output for missing data. div always gives a decimal result (10 div 4 = 2.5).',
    },
    {
      title: 'JSTL core: if, choose, forEach with varStatus, url',
      scenario: 'Show a list of students in a table with serial numbers, a grade computed with c:choose, highlight toppers with c:if, and an edit link built with c:url.',
      steps: [
        'Create StudentListServlet (/students) that puts a List<Student> into request scope.',
        'Create WEB-INF/views/students.jsp using JSTL core.',
        'Run /students.',
      ],
      code: `// com/demo/web/StudentListServlet.java
package com.demo.web;

import com.demo.model.Student;
import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.List;

@WebServlet("/students")
public class StudentListServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        List<Student> list = List.of(
            new Student("Asha", 91),
            new Student("Ravi", 74),
            new Student("Kiran", 55),
            new Student("Meena", 30));
        req.setAttribute("students", list);
        req.getRequestDispatcher("/WEB-INF/views/students.jsp").forward(req, resp);
    }
}

<%-- WEB-INF/views/students.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<html><body>
<h3>Students (\${students.size()})</h3>
<c:if test="\${empty students}">
   <p>No students found.</p>
</c:if>
<table border="1">
  <tr><th>#</th><th>Name</th><th>Marks</th><th>Grade</th><th>Action</th></tr>
  <c:forEach items="\${students}" var="s" varStatus="st">
    <tr style="\${st.first ? 'font-weight:bold' : ''}">
      <td>\${st.count}</td>
      <td><c:out value="\${s.name}"/><c:if test="\${s.marks >= 90}"> &#9733;</c:if></td>
      <td>\${s.marks}</td>
      <td>
        <c:choose>
          <c:when test="\${s.marks >= 75}">Distinction</c:when>
          <c:when test="\${s.marks >= 60}">First Class</c:when>
          <c:when test="\${s.marks >= 35}">Pass</c:when>
          <c:otherwise>Fail</c:otherwise>
        </c:choose>
      </td>
      <td>
        <c:url var="editUrl" value="/edit">
          <c:param name="name" value="\${s.name}"/>
        </c:url>
        <a href="\${editUrl}">Edit</a>
      </td>
    </tr>
  </c:forEach>
</table>
<p>Numbers: <c:forEach begin="1" end="9" step="2" var="i">\${i} </c:forEach></p>
</body></html>`,
      result: 'Students (4)\n1 | Asha ★ | 91 | Distinction | Edit (bold row)\n2 | Ravi | 74 | First Class | Edit\n3 | Kiran | 55 | Pass | Edit\n4 | Meena | 30 | Fail | Edit\nNumbers: 1 3 5 7 9\nEdit link for Asha: /el-jstl-demo/edit?name=Asha',
      explanation: 'varStatus gives count (1-based), index (0-based), first and last. c:choose works like if/else-if/else and stops at the first true c:when. c:url adds the context path and URL-encodes parameters. ${students.size()} uses EL method invocation (EL 2.2+).',
    },
    {
      title: 'fmt and fn: currency, number, date and string functions',
      scenario: 'Display an invoice with Indian currency format, a formatted date and some string functions.',
      steps: [
        'Create InvoiceServlet (/invoice) that sets amount, java.util.Date and a customer name.',
        'Create WEB-INF/views/invoice.jsp with the fmt and fn taglibs.',
        'Run /invoice.',
      ],
      code: `// com/demo/web/InvoiceServlet.java
package com.demo.web;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.*;
import java.io.IOException;
import java.util.Date;

@WebServlet("/invoice")
public class InvoiceServlet extends HttpServlet {
    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp)
            throws ServletException, IOException {
        req.setAttribute("customer", "  ravi kumar  ");
        req.setAttribute("amount", 1234567.891);
        req.setAttribute("billDate", new Date());
        req.setAttribute("tags", new String[] {"java", "jsp", "jstl"});
        req.getRequestDispatcher("/WEB-INF/views/invoice.jsp").forward(req, resp);
    }
}

<%-- WEB-INF/views/invoice.jsp --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<fmt:setLocale value="en_IN"/>
<html><body>
  <h3>Invoice for \${fn:toUpperCase(fn:trim(customer))}</h3>
  <p>Name length (trimmed): \${fn:length(fn:trim(customer))}</p>
  <p>Amount: <fmt:formatNumber value="\${amount}" type="currency" currencySymbol="Rs. "/></p>
  <p>Pattern: <fmt:formatNumber value="\${amount}" pattern="#,##0.00"/></p>
  <p>Percent: <fmt:formatNumber value="0.185" type="percent" maxFractionDigits="1"/></p>
  <p>Date: <fmt:formatDate value="\${billDate}" pattern="dd-MM-yyyy HH:mm"/></p>
  <p>Tags: \${fn:join(tags, " | ")}</p>
  <p>Contains jsp? \${fn:contains(fn:join(tags, ","), "jsp")}</p>
  <p>Safe output: \${fn:escapeXml("<b>bold</b>")}</p>
</body></html>`,
      result: 'Invoice for RAVI KUMAR\nName length (trimmed): 10\nAmount: Rs. 12,34,567.89\nPattern: 12,34,567.89 (en_IN grouping; with en_US it would be 1,234,567.89)\nPercent: 18.5%\nDate: 17-11-2026 10:45 (current date/time)\nTags: java | jsp | jstl\nContains jsp? true\nSafe output: <b>bold</b> shown as text, not bold',
      explanation: 'fmt:setLocale en_IN makes number grouping follow the Indian lakh/crore style on Java 9+ (CLDR locale data). fn functions are called inside EL. fmt:formatDate requires java.util.Date. Exact grouping depends on the JDK locale data.',
    },
    {
      title: 'Converting a scriptlet page to EL + JSTL',
      scenario: 'Rewrite an old scriptlet-based login message page into a clean JSTL page.',
      steps: [
        'Compare the two versions below; create welcome.jsp with the JSTL version.',
        'Open /welcome.jsp?user=Asha&admin=true and /welcome.jsp.',
      ],
      code: `<%-- OLD: scriptlets --%>
<%
  String user = request.getParameter("user");
  if (user == null || user.isEmpty()) {
%>
   <p>Please log in.</p>
<% } else { %>
   <p>Welcome <%= user %></p>
   <% if ("true".equals(request.getParameter("admin"))) { %>
      <a href="admin.jsp">Admin panel</a>
   <% } %>
<% } %>

<%-- NEW: EL + JSTL (welcome.jsp) --%>
<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:choose>
  <c:when test="\${empty param.user}">
    <p>Please log in.</p>
  </c:when>
  <c:otherwise>
    <p>Welcome <c:out value="\${param.user}"/></p>
    <c:if test="\${param.admin eq 'true'}">
      <a href="<c:url value='/admin.jsp'/>">Admin panel</a>
    </c:if>
  </c:otherwise>
</c:choose>`,
      result: '/welcome.jsp?user=Asha&admin=true -> "Welcome Asha" and an "Admin panel" link.\n/welcome.jsp -> "Please log in."',
      explanation: 'No Java code, no null checks (empty handles null and ""), and c:out escapes HTML so a user value like <script> cannot run.',
    },
  ],
  interview: [
    { q: 'What is EL in JSP?', a: 'Expression Language, syntax ${...}, used to access data (attributes, bean properties, collections, parameters) and evaluate simple expressions without Java code.', level: 'Easy' },
    { q: 'How does EL search for ${user}?', a: 'It looks in page, request, session and application scopes in that order and uses the first match; if none, the result is null, printed as empty string.', level: 'Medium' },
    { q: 'Difference between the dot and bracket operators in EL?', a: 'Dot works for bean properties and simple map keys. Brackets also work for list/array indexes, map keys with special characters, and dynamic keys from another expression.', level: 'Medium' },
    { q: 'Name EL implicit objects.', a: 'pageScope, requestScope, sessionScope, applicationScope, param, paramValues, header, headerValues, cookie, initParam, pageContext.', level: 'Easy' },
    { q: 'What does the empty operator do?', a: 'Returns true if the value is null, an empty String, or an empty array/Collection/Map.', level: 'Easy' },
    { q: 'What is JSTL? Name its libraries.', a: 'Jakarta Standard Tag Library - standard custom tags. Libraries: core (c), formatting (fmt), functions (fn), SQL (sql), XML (x).', level: 'Easy' },
    { q: 'How do you add JSTL to a Tomcat 10 application?', a: 'Add jakarta.servlet.jsp.jstl-api 3.0.0 and the implementation org.glassfish.web:jakarta.servlet.jsp.jstl 3.0.1 to WEB-INF/lib (Maven compile scope), and use taglib uri="jakarta.tags.core".', level: 'Medium' },
    { q: 'Why use c:out instead of ${} directly?', a: 'c:out escapes XML/HTML characters by default (escapeXml=true), preventing XSS, and supports a default value.', level: 'Medium' },
    { q: 'How do you write if-else in JSTL?', a: 'c:choose with one or more c:when and an optional c:otherwise. c:if has no else.', level: 'Easy' },
    { q: 'What is varStatus in c:forEach?', a: 'A LoopTagStatus object with index (0-based), count (1-based), first, last, begin, end, step and current.', level: 'Medium' },
    { q: 'Why use c:url?', a: 'It prepends the context path, URL-encodes parameters with c:param, and adds the session id when cookies are disabled.', level: 'Medium' },
    { q: 'You get "The absolute uri: [jakarta.tags.core] cannot be resolved". Why?', a: 'The JSTL implementation jar is not in WEB-INF/lib (missing, or marked provided), or an old javax JSTL 1.2 jar is used.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a JSP that prints the multiplication table of ${param.n} (default 2) using c:forEach begin/end and c:set.',
      hint: 'c:set var="n" value="${empty param.n ? 2 : param.n}".',
      solution: `<%@ page contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<c:set var="n" value="\${empty param.n ? 2 : param.n}"/>
<h3>Table of \${n}</h3>
<c:forEach begin="1" end="10" var="i">
   \${n} x \${i} = \${n * i}<br>
</c:forEach>`,
    },
    {
      task: 'Given a Map<String, Integer> of product stock in request scope, list products and show "Out of stock" in red when value is 0, using c:forEach over the map.',
      hint: 'Each entry has .key and .value.',
      solution: `<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<ul>
<c:forEach items="\${stock}" var="e">
  <li>\${e.key}:
    <c:choose>
      <c:when test="\${e.value == 0}"><span style="color:red">Out of stock</span></c:when>
      <c:otherwise>\${e.value} left</c:otherwise>
    </c:choose>
  </li>
</c:forEach>
</ul>`,
    },
    {
      task: 'Create a page that reads a comma-separated "skills" parameter and shows each skill in upper case with its length, plus the total count.',
      hint: 'fn:split, c:forEach, fn:toUpperCase, fn:length.',
      solution: `<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fn" uri="jakarta.tags.functions" %>
<c:set var="arr" value="\${fn:split(param.skills, ',')}"/>
<p>Total skills: \${fn:length(arr)}</p>
<c:forEach items="\${arr}" var="s">
  \${fn:toUpperCase(fn:trim(s))} (\${fn:length(fn:trim(s))})<br>
</c:forEach>
<%-- ?skills=java, sql,html -> Total skills: 3 / JAVA (4) / SQL (3) / HTML (4) --%>`,
    },
    {
      task: 'Show a salary slip: basic from param, HRA 20%, DA 10%, total, all formatted with fmt:formatNumber pattern "#,##0.00".',
      hint: 'Use c:set for each computed value.',
      solution: `<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:set var="basic" value="\${empty param.basic ? 0 : param.basic}"/>
<c:set var="hra" value="\${basic * 0.20}"/>
<c:set var="da" value="\${basic * 0.10}"/>
<c:set var="total" value="\${basic + hra + da}"/>
<table border="1">
 <tr><td>Basic</td><td><fmt:formatNumber value="\${basic}" pattern="#,##0.00"/></td></tr>
 <tr><td>HRA</td><td><fmt:formatNumber value="\${hra}" pattern="#,##0.00"/></td></tr>
 <tr><td>DA</td><td><fmt:formatNumber value="\${da}" pattern="#,##0.00"/></td></tr>
 <tr><td>Total</td><td><fmt:formatNumber value="\${total}" pattern="#,##0.00"/></td></tr>
</table>
<%-- ?basic=30000 -> 30,000.00 / 6,000.00 / 3,000.00 / 39,000.00 --%>`,
    },
    {
      task: 'Use c:catch to safely parse a number parameter "age" and show an error message if it is not a number.',
      hint: 'fmt:parseNumber inside c:catch var="err".',
      solution: `<%@ taglib prefix="c" uri="jakarta.tags.core" %>
<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>
<c:catch var="err">
  <fmt:parseNumber var="age" value="\${param.age}" integerOnly="true"/>
</c:catch>
<c:choose>
  <c:when test="\${not empty err}">Invalid age: <c:out value="\${param.age}"/></c:when>
  <c:otherwise>Next year you will be \${age + 1}</c:otherwise>
</c:choose>`,
    },
  ],
  quiz: [
    {
      question: 'What does ${user.name} print when no attribute "user" exists in any scope?',
      options: ['null', 'An empty string', 'NullPointerException', 'The text ${user.name}'],
      answer: 1,
      explanation: 'EL is null-safe and renders null as empty.',
    },
    {
      question: 'Correct taglib directive for JSTL 3 core on Tomcat 10:',
      options: ['<%@ taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>', '<%@ taglib prefix="c" uri="javax.tags.core" %>', '<%@ taglib prefix="c" uri="jakarta.tags.core" %>', '<%@ include prefix="c" uri="jakarta.tags.core" %>'],
      answer: 2,
      explanation: 'JSTL 3.0 uses the jakarta.tags.* URIs.',
    },
    {
      question: 'Which EL implicit object gives all values of a multi-valued parameter?',
      options: ['paramValues', 'param', 'headerValues', 'requestScope'],
      answer: 0,
      explanation: 'paramValues.name is a String[].',
    },
    {
      question: 'Which JSTL construct provides else-if style branching?',
      options: ['c:if with else attribute', 'c:forEach', 'c:catch', 'c:choose / c:when / c:otherwise'],
      answer: 3,
      explanation: 'c:if has no else; use c:choose.',
    },
    {
      question: 'Which tag escapes HTML by default when printing a value?',
      options: ['<c:set>', '<c:out>', '<c:import>', '<fmt:message>'],
      answer: 1,
      explanation: 'c:out has escapeXml="true" by default.',
    },
  ],
};
