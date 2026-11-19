export default {
  lesson: 'day-08-servlet-lifecycle',
  minutes: 20,
  intro: 'Practise the Servlet API hierarchy, the init/service/destroy lifecycle and why one servlet object is shared by many threads.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the class header of a normal web servlet:\n`public class HelloServlet extends ____ { ... }`',
      example: { title: 'imports for Tomcat 10', code: 'import jakarta.servlet.http.HttpServlet;\nimport jakarta.servlet.http.HttpServletRequest;\nimport jakarta.servlet.http.HttpServletResponse;' },
      accept: ['HttpServlet', 'jakarta.servlet.http.HttpServlet'],
      caseSensitive: true,
      explain: 'Web servlets extend **HttpServlet**, which extends `GenericServlet`, which implements the `Servlet` interface. HttpServlet\'s `service()` reads the HTTP method and calls `doGet`, `doPost` etc., so you only override what you need.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The servlet is loaded on the **first request**. The browser then sends **3 GET requests** in total, and finally the app is stopped. What is printed on the Tomcat console?',
      example: { title: 'the lifecycle', text: 'Constructor (once) → `init()` (once) → `service()` for EVERY request → `destroy()` (once, when the app stops).' },
      code: `@WebServlet("/count")
public class CountServlet extends HttpServlet {
    private int hits = 0;

    public CountServlet() { System.out.println("constructor"); }

    @Override
    public void init() { System.out.println("init"); }

    @Override
    protected void doGet(HttpServletRequest req, HttpServletResponse resp) {
        hits++;
        System.out.println("request " + hits);
    }

    @Override
    public void destroy() { System.out.println("destroy after " + hits); }
}`,
      expected: 'constructor\ninit\nrequest 1\nrequest 2\nrequest 3\ndestroy after 3',
      explain: 'The container creates **one** object and calls `init()` once. Every request reuses that same object, so the instance field `hits` keeps growing (1, 2, 3). `destroy()` runs once on shutdown. Note: this shared field is not thread-safe if requests arrive at the same time.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about the Servlet API hierarchy are TRUE? (choose all that apply)',
      options: [
        'Servlet is an interface with init(), service(), destroy(), getServletConfig() and getServletInfo()',
        'GenericServlet is protocol-independent and implements Servlet and ServletConfig',
        'HttpServlet extends GenericServlet and adds doGet(), doPost(), doPut(), doDelete()',
        'HttpServlet is an interface, so you must implement all its methods',
        'If you do not override doPost(), a POST request gets 405 Method Not Allowed',
      ],
      answers: [0, 1, 2, 4],
      explain: 'HttpServlet is an **abstract class** (not an interface): you override only the doXxx methods you need. The default implementations send **405 Method Not Allowed**, which is exactly what you see when a form uses POST but you only wrote doGet.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Make Tomcat create and initialise this servlet when the application **starts**, not on the first request:\n`@WebServlet(urlPatterns = "/report", ____ = 1)`',
      example: { title: 'web.xml equivalent', code: '<servlet>\n  <servlet-name>report</servlet-name>\n  <servlet-class>com.upskillr.ReportServlet</servlet-class>\n  <load-on-startup>1</load-on-startup>\n</servlet>' },
      accept: ['loadOnStartup'],
      caseSensitive: true,
      explain: '`loadOnStartup` (or `<load-on-startup>` in web.xml) with a value **≥ 0** loads the servlet at deployment; lower numbers load first. Without it, the first user pays the cost of `init()` (for example, reading a big config or warming a cache).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is it dangerous to store the logged-in user\'s name in an **instance variable** of a servlet?',
      options: [
        'Instance variables are deleted after every request',
        'One servlet object serves all requests on many threads, so users would overwrite each other\'s value',
        'Servlets cannot have instance variables',
        'It makes the servlet load slower',
      ],
      answer: 1,
      explain: 'The container uses **one instance, many threads**. Asha\'s request could set `userName` and Rohan\'s request could read it a moment later. Keep per-request data in **local variables** (inside doGet/doPost) or in the request/session, and use instance fields only for read-only shared things.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Where should a servlet open a resource that is created once and reused for all requests (for example, reading a config file)?',
      options: ['In doGet()', 'In init()', 'In destroy()', 'In the HTML form'],
      answer: 1,
      explain: '`init()` runs **once** before any request, so it is the right place for one-time setup; release the resource in `destroy()`. Doing it in doGet would repeat the work on every request.',
    },
  ],
};
