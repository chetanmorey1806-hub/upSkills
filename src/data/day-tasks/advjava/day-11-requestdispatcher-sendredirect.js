export default {
  lesson: 'day-11-requestdispatcher-sendredirect',
  minutes: 20,
  intro: 'Practise forward, include and sendRedirect, and decide which one to use in a real application.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that gets a dispatcher for `result.jsp`:\n`RequestDispatcher rd = request.____("result.jsp");`',
      example: { title: 'forwarding', code: 'RequestDispatcher rd = request.getRequestDispatcher("/WEB-INF/views/list.jsp");\nrd.forward(request, response);' },
      accept: ['getRequestDispatcher', 'getRequestDispatcher("result.jsp")', 'getRequestDispatcher("result.jsp");'],
      caseSensitive: true,
      explain: '`request.getRequestDispatcher(path)` accepts relative or `/`-absolute paths inside the app. `ServletContext.getRequestDispatcher` also exists but needs a path starting with `/`. Then call `forward` or `include` on it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'HeaderServlet (`/page`) includes BodyServlet (`/body`). What does the **browser** show?',
      example: { title: 'include', text: '`include` runs the other resource and inserts its output at that point; control then **comes back** to the first servlet.' },
      code: `// HeaderServlet, mapped to /page
PrintWriter out = resp.getWriter();
out.println("Header");
req.setAttribute("page", "Home");
req.getRequestDispatcher("/body").include(req, resp);
out.println("Footer");

// BodyServlet, mapped to /body
PrintWriter out = resp.getWriter();
out.println("Body of " + req.getAttribute("page"));`,
      expected: 'Header\nBody of Home\nFooter',
      explain: 'The included servlet shares the **same request**, so it sees the attribute `page = "Home"`. Its output is placed between Header and Footer, and execution continues after `include`. This is how common headers, menus and footers are reused.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'SaveServlet forwards to ResultServlet. What does the **browser** show?',
      example: { title: 'forward', text: '`forward` hands the request over completely. Anything the first servlet wrote to the (uncommitted) buffer is **cleared**.' },
      code: `// SaveServlet
PrintWriter out = resp.getWriter();
out.println("Saving...");
req.setAttribute("msg", "Saved");
req.getRequestDispatcher("/result").forward(req, resp);

// ResultServlet, mapped to /result
resp.getWriter().println("Result: " + req.getAttribute("msg"));`,
      expected: 'Result: Saved',
      explain: 'On forward, the response buffer of the first servlet is reset, so "Saving..." never reaches the browser. The request attribute survives because it is the **same request object**. If the buffer had already been flushed, forward would throw `IllegalStateException`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'SaveServlet does `req.setAttribute("msg", "Saved"); resp.sendRedirect("result");`. What does ResultServlet get from `req.getAttribute("msg")`?',
      options: ['"Saved"', 'null', 'An IllegalStateException', '"result"'],
      answer: 1,
      explain: 'sendRedirect sends a **302** response; the browser then makes a **brand new request** to `result`, so request attributes are lost (null). To pass data across a redirect use the session, a query parameter (`result?msg=Saved`) or a flash attribute.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements compare **forward** and **sendRedirect** correctly? (choose all that apply)',
      options: [
        'forward happens inside the server; the browser URL does not change',
        'sendRedirect makes the browser send a second request, so the URL changes',
        'sendRedirect can send the user to another website such as https://google.com',
        'forward can send the user to another website',
        'forward is faster because there is only one request/response round trip',
      ],
      answers: [0, 1, 2, 4],
      explain: 'forward works only within the same application (or context) and is invisible to the browser. sendRedirect works with any URL, costs one extra round trip and is used after POST (Post/Redirect/Get) or for moving to other sites.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After a successful login POST, which should the LoginServlet use to show the dashboard?',
      options: [
        'forward to dashboard.jsp, so the URL still shows /login',
        'sendRedirect to /dashboard, so refresh does not re-post the password',
        'include dashboard.jsp',
        'Print the dashboard HTML with System.out.println',
      ],
      answer: 1,
      explain: 'Redirect after a successful POST: the address bar shows `/dashboard`, bookmarks work and refresh does not resend the login form. Use forward when you want to show a view with request data, e.g. showing the login page again with an error message.',
    },
  ],
};
