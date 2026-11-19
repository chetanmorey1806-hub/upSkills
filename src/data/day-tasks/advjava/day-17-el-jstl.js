export default {
  lesson: 'day-17-el-jstl',
  minutes: 25,
  intro: 'Replace scriptlets with Expression Language and JSTL core, fmt and fn tags.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does each EL expression display? (one result per line)',
      example: { title: 'EL operators', text: '`div` = `/`, `mod` = `%`, `eq` = `==`, `gt` = `>`, `and`/`or`/`not`, and `empty x` is true for null, "", or an empty collection.' },
      code: `\${10 / 4}
\${7 mod 3}
\${empty ""}
\${"5" + 3}
\${10 gt 3 and 2 gt 5}`,
      expected: '2.5\n1\ntrue\n8\nfalse',
      explain: 'In EL `/` is always **decimal** division (2.5, unlike Java\'s int division 2). `+` is only arithmetic: the string "5" is converted to a number, giving 8 (not "53"). `empty ""` is true. `10 gt 3` is true but `2 gt 5` is false, so `and` gives false.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The servlet set `request.setAttribute("names", List.of("Asha", "Rohan", "Meera"))`. What visible text does this JSP produce? (one line per item)',
      example: { title: 'varStatus', text: '`st.index` starts at 0, `st.count` starts at 1, `st.first` / `st.last` are booleans.' },
      code: `<c:forEach items="\${names}" var="n" varStatus="st">
  <p>\${st.count}. \${n}<c:if test="\${st.last}"> (last)</c:if></p>
</c:forEach>`,
      expected: '1. Asha\n2. Rohan\n3. Meera (last)',
      explain: '`c:forEach` loops over the list, putting each element in `n`. `st.count` is 1-based, and `st.last` is true only for the final element, so only Meera gets "(last)".',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the attribute that names the loop variable:\n`<c:forEach items="${students}" ____="s"> ${s.name} </c:forEach>`',
      example: { title: 'counting loop', code: '<c:forEach begin="1" end="5" var="i">${i} </c:forEach>' },
      accept: ['var', 'var="s"'],
      caseSensitive: true,
      explain: '`items` is the collection and `var` is the name of the current element. `${s.name}` then calls `s.getName()`: EL uses the **property** name, not the getter method.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The attribute `marks` is **72**. What does this display?',
      example: { title: 'if / else in JSTL', text: '`c:if` has no else. For if / else-if / else use `c:choose` with `c:when` (first true one wins) and `c:otherwise`.' },
      code: `<c:choose>
  <c:when test="\${marks >= 75}">Distinction</c:when>
  <c:when test="\${marks >= 60}">First Class</c:when>
  <c:when test="\${marks >= 40}">Pass</c:when>
  <c:otherwise>Fail</c:otherwise>
</c:choose>`,
      expected: 'First Class',
      explain: '72 is not ≥ 75, but it is ≥ 60, so the second `c:when` runs and the rest are skipped, exactly like an if / else-if chain. Order the conditions from highest to lowest or a 90 would also be just "Pass".',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about EL and JSTL are TRUE? (choose all that apply)',
      options: [
        '${student.name} prints nothing (no exception) when student is null',
        '<c:out value="${comment}"/> escapes HTML characters, protecting against XSS',
        '<fmt:formatNumber value="${fees}" type="currency"/> formats a number as money',
        '${fn:length(names)} gives the size of a list',
        'JSTL works on Tomcat 10 without adding any JAR or dependency',
      ],
      answers: [0, 1, 2, 3],
      explain: 'EL is **null-safe** and prints empty text. Tomcat does not ship JSTL, so add `jakarta.servlet.jsp.jstl-api` and an implementation (e.g. `org.glassfish.web:jakarta.servlet.jsp.jstl`) version 3.x. Use `c:out` (or `fn:escapeXml`) for user-typed text.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A servlet did `request.setAttribute("course", "Java")` and a session attribute `course = "Python"` also exists. What does `${course}` print?',
      options: ['Python', 'Java', 'Both', 'Nothing, because the name is ambiguous'],
      answer: 1,
      explain: 'Without a scope prefix EL searches **page → request → session → application**, so the request value "Java" wins. Use `${sessionScope.course}` to read the session one explicitly.',
    },
  ],
};
