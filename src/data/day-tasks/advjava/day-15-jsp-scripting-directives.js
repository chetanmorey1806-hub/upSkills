export default {
  lesson: 'day-15-jsp-scripting-directives',
  minutes: 22,
  intro: 'Use scriptlets, expressions, declarations and JSP comments, and the page, include and taglib directives.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'A scriptlet sets `String name = "Asha";`. Write the JSP **expression tag** that prints the variable `name` into the page.',
      example: { title: 'expression tag', code: '<%= new java.util.Date() %>' },
      accept: ['<%= name %>', '<%=name%>', '<%= name%>', '<%=name %>'],
      caseSensitive: true,
      explain: 'The expression tag is `<%= expression %>` with **no semicolon** inside, because it becomes `out.print(name);`. Writing `<%= name; %>` produces `out.print(name;);` and fails to compile.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This page is opened **3 times** (the JSP is not reloaded in between). What does the third visit display?',
      example: { title: 'declaration vs scriptlet', text: '`<%! ... %>` declares a **field** of the generated servlet class (one copy for everyone). `<% ... %>` code goes **inside** `_jspService()`, so its variables are local and are created again on every request.' },
      code: `<%! int count = 0; %>
<%
    int local = 0;
    count++;
    local++;
%>
count=<%= count %> local=<%= local %>`,
      expected: 'count=3 local=1',
      explain: '`count` is an instance field (declaration), so it survives between requests: 1, 2, 3. `local` is a local variable inside `_jspService`, reset to 0 every time, so it is always 1. Declaration fields are shared by all users and threads, so avoid them for user data.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the page directive so the JSP can use `ArrayList` and `List` without full names:\n`<%@ page ____="java.util.*" %>`',
      example: { title: 'other page attributes', code: '<%@ page contentType="text/html; charset=UTF-8" errorPage="error.jsp" %>' },
      accept: ['import'],
      caseSensitive: true,
      explain: '`import` is the only page attribute that may appear more than once, and it can list several packages separated by commas: `<%@ page import="java.util.*, com.upskillr.model.Student" %>`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which comment is **not sent to the browser** (it is removed during translation)?',
      options: ['<!-- note -->', '<%-- note --%>', '// note (outside a scriptlet)', '/* note */ (outside a scriptlet)'],
      answer: 1,
      explain: '`<%-- --%>` is a **JSP comment**: dropped during translation, invisible in View Source. `<!-- -->` is an HTML comment: it is sent to the browser and visible in View Source (and any `<%= %>` inside it still runs). `//` and `/* */` work only inside scriptlets.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`<%@ include file="header.jsp" %>` is called a **static** include. Why?',
      options: [
        'It includes only images',
        'The content of header.jsp is copied into the page at translation time, producing one servlet',
        'It runs header.jsp on every request as a separate servlet',
        'It caches the HTML in the browser',
      ],
      answer: 1,
      explain: 'The include **directive** pastes the file\'s text before compilation, so both files share variables and become one servlet. The `<jsp:include>` **action** (next day) includes the other page\'s output at request time.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the taglib directive for the JSTL core library on Tomcat 10 (JSTL 3.0):\n`<%@ taglib prefix="c" uri="____" %>`',
      example: { title: 'another tag library', code: '<%@ taglib prefix="fmt" uri="jakarta.tags.fmt" %>' },
      accept: ['jakarta.tags.core', 'http://java.sun.com/jsp/jstl/core'],
      explain: 'Jakarta Standard Tag Library 3.0 uses the short URI `jakarta.tags.core` (the old `http://java.sun.com/jsp/jstl/core` is still accepted for compatibility). The prefix (`c`) is your choice, but `c` is the universal convention.',
    },
  ],
};
