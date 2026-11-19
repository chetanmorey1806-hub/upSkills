export default {
  lesson: 'day-16-jsp-implicit-objects-actions',
  minutes: 22,
  intro: 'Use the nine JSP implicit objects, the four scopes and standard actions such as jsp:include, jsp:forward and jsp:useBean.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **JSP implicit objects** (available without declaring them)? (choose all that apply)',
      options: ['request', 'session', 'application', 'pageContext', 'exception', 'context', 'cookie'],
      answers: [0, 1, 2, 3, 4],
      explain: 'The 9 implicit objects are **request, response, out, session, application, config, pageContext, page, exception** (`exception` only in pages with `isErrorPage="true"`). There is no `context` or `cookie` object: use `application` and `request.getCookies()`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Order the four scopes from **smallest** (shortest-lived) to **largest**.',
      options: [
        'request → page → session → application',
        'page → request → session → application',
        'page → session → request → application',
        'application → session → request → page',
      ],
      answer: 1,
      explain: '**page** (this JSP only) → **request** (survives a forward/include) → **session** (one user across requests) → **application** (everyone, until the app stops). Choose the smallest scope that does the job.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this JSP print?',
      example: { title: 'findAttribute', text: '`pageContext.findAttribute(name)` searches page → request → session → application and returns the **first** match (or null).' },
      code: `<%
    application.setAttribute("city", "Mumbai");
    session.setAttribute("city", "Pune");
    request.setAttribute("city", "Nashik");
%>
<%= pageContext.findAttribute("city") %>
<%= session.getAttribute("city") %>
<%= pageContext.findAttribute("state") %>`,
      expected: 'Nashik\nPune\nnull',
      explain: 'There is no page-scope "city", so the search finds the **request** value first (Nashik). Asking a specific scope returns that scope\'s value (Pune). A missing attribute gives null, which `<%= %>` prints as the text "null" (EL would print nothing).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `A form posts fields \`name\`, \`email\` and \`marks\` that match the Student bean's properties. Fill the value that copies **all** matching request parameters into the bean:
\`\`\`
<jsp:useBean id="s" class="com.upskillr.model.Student" scope="request" />
<jsp:setProperty name="s" property="____" />
\`\`\``,
      example: { title: 'one property', code: '<jsp:setProperty name="s" property="name" param="studentName" />\n<jsp:getProperty name="s" property="name" />' },
      accept: ['*', '"*"'],
      explain: '`property="*"` matches every request parameter to the bean setter with the same name (`setName`, `setEmail`, `setMarks`) and converts types like int automatically. The bean needs a public no-arg constructor and getters/setters.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'To use the `exception` implicit object, `error.jsp` must declare itself an error page:\n`<%@ page isErrorPage="____" %>`',
      example: { title: 'pointing to the error page', code: '<%@ page errorPage="error.jsp" %>' },
      accept: ['true'],
      explain: 'Only pages with `isErrorPage="true"` get the `exception` object (e.g. `<%= exception.getMessage() %>`). The page that might fail names it with `errorPage="error.jsp"`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main difference between `<%@ include file="menu.jsp" %>` and `<jsp:include page="menu.jsp" />`?',
      options: [
        'There is no difference',
        'The directive copies the source at translation time; the action includes the output at request time, so changes to menu.jsp always show',
        'The action is faster because it happens at translation time',
        'Only the directive can pass parameters with jsp:param',
      ],
      answer: 1,
      explain: '`<jsp:include>` is **dynamic**: menu.jsp is a separate servlet called on every request, and you can pass `<jsp:param>` values to it. The directive is **static** text copying. `<jsp:forward>` works like RequestDispatcher.forward.',
    },
  ],
};
