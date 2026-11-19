export default {
  lesson: 'day-10-webxml-annotations-config-context',
  minutes: 22,
  intro: 'Register servlets with web.xml and @WebServlet, apply URL-pattern rules, and use ServletConfig vs ServletContext.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Complete the missing tag name (both places) in web.xml:
\`\`\`
<servlet-mapping>
  <servlet-name>hello</servlet-name>
  <____>/hello</____>
</servlet-mapping>
\`\`\``,
      example: { title: 'the servlet part', code: '<servlet>\n  <servlet-name>hello</servlet-name>\n  <servlet-class>com.upskillr.HelloServlet</servlet-class>\n</servlet>' },
      accept: ['url-pattern', '<url-pattern>'],
      explain: '`<servlet>` gives a name and a class; `<servlet-mapping>` links that same name to a `<url-pattern>`. The two `<servlet-name>` values must match exactly or Tomcat fails to start. The annotation equivalent is `@WebServlet("/hello")`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Three servlets are mapped to `/admin/*`, `*.do` and `/`. Which one handles the request `/admin/report.do`?',
      options: ['The servlet mapped to *.do', 'The servlet mapped to /admin/*', 'The servlet mapped to /', 'Tomcat returns 404'],
      answer: 1,
      explain: 'Matching order: **exact match** → **longest path prefix** (`/admin/*`) → **extension** (`*.do`) → **default** (`/`). A path-prefix mapping wins over an extension mapping, so `/admin/*` gets it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which of these URL patterns is **invalid**?',
      options: ['/students', '/api/*', '*.jsp', '/admin/*.do'],
      answer: 3,
      explain: 'A pattern is either exact (`/students`), path prefix ending in `/*`, extension starting with `*.`, or the default `/`. Mixing path and extension (`/admin/*.do`) is not allowed and Tomcat refuses to deploy the app.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The servlet is declared with \`@WebServlet(urlPatterns = "/report", initParams = @WebInitParam(name = "pageSize", value = "10"))\`. Complete the line in \`init()\` that reads it:
\`String size = getServletConfig().____("pageSize");\``,
      example: { title: 'an application-wide value', code: 'String db = getServletContext().getInitParameter("dbUrl"); // from <context-param>' },
      accept: ['getInitParameter', 'getInitParameter("pageSize")', 'getInitParameter("pageSize");'],
      caseSensitive: true,
      explain: 'Both ServletConfig and ServletContext have `getInitParameter(name)`. **ServletConfig** reads `<init-param>`/`@WebInitParam` of ONE servlet; **ServletContext** reads `<context-param>` shared by the whole app. Init parameters are always Strings, so convert with `Integer.parseInt`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Two servlets share a visit counter stored in the **ServletContext**. The browser requests `/home`, then `/about`, then `/home`. What is printed?',
      example: { title: 'context attributes', code: 'ServletContext ctx = getServletContext();\nctx.setAttribute("appName", "UpSkillr");\nString n = (String) ctx.getAttribute("appName");' },
      code: `// both HomeServlet (/home) and AboutServlet (/about) contain:
protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
    ServletContext ctx = getServletContext();
    Integer visits = (Integer) ctx.getAttribute("visits");
    visits = (visits == null) ? 1 : visits + 1;
    ctx.setAttribute("visits", visits);
    System.out.println(getServletName() + ": " + visits);
}
// servlet names: "home" and "about"`,
      expected: 'home: 1\nabout: 2\nhome: 3',
      explain: 'There is **one ServletContext per web application**, so both servlets read and write the same `visits` attribute: 1, 2, 3. If each servlet used its own instance field instead, home would print 1 and 2 and about 1.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **ServletConfig vs ServletContext** are TRUE? (choose all that apply)',
      options: [
        'There is one ServletConfig per servlet',
        'There is one ServletContext per web application',
        'ServletContext can store attributes shared by all servlets and JSPs',
        'ServletConfig is the right place for the database URL used by every servlet',
        'ServletContext is created when the application is deployed and destroyed when it is undeployed',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Settings used by **every** servlet (like the database URL) belong in `<context-param>` and are read from the ServletContext. ServletConfig is only for settings of a single servlet, such as its page size.',
    },
  ],
};
