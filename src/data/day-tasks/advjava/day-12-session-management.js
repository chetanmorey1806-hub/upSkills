export default {
  lesson: 'day-12-session-management',
  minutes: 22,
  intro: 'Remember users across stateless HTTP requests with cookies, HttpSession, URL rewriting and hidden form fields.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'In a filter you want the **existing** session only, without creating a new one if the user has none. Complete:\n`HttpSession session = request.getSession(____);`',
      example: { title: 'creating a session', code: 'HttpSession s = request.getSession(); // same as getSession(true): creates one if needed' },
      accept: ['false'],
      explain: '`getSession(false)` returns the current session or **null** if there is none, which is perfect for checking "is the user logged in?". `getSession()` / `getSession(true)` would create an empty session for every visitor.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A "remember my city" cookie should live for **7 days**. Complete: `cityCookie.setMaxAge(____);` (in seconds; a number or an expression)',
      example: { title: 'a 1-hour cookie', code: 'Cookie c = new Cookie("lang", "mr");\nc.setMaxAge(60 * 60); // 3600 seconds\nresponse.addCookie(c);' },
      accept: ['604800', '7*24*60*60', '60*60*24*7', '7*24*3600', '7*86400'],
      acceptRegex: ['^\\s*(604800|7\\s*\\*\\s*24\\s*\\*\\s*60\\s*\\*\\s*60|60\\s*\\*\\s*60\\s*\\*\\s*24\\s*\\*\\s*7|7\\s*\\*\\s*24\\s*\\*\\s*3600|24\\s*\\*\\s*60\\s*\\*\\s*60\\s*\\*\\s*7|7\\s*\\*\\s*86400)\\s*$'],
      explain: '`setMaxAge` takes **seconds**: 7 × 24 × 60 × 60 = 604800. A negative value (default) means a session cookie that disappears when the browser closes, and **0** deletes the cookie. Remember to `response.addCookie(c)`, otherwise nothing is sent.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The same browser makes 4 requests: `/cart`, `/cart`, `/logout`, `/cart`. What is printed?',
      example: { title: 'session attributes', code: 'session.setAttribute("user", "asha");\nString u = (String) session.getAttribute("user");\nsession.invalidate(); // destroys the session and all attributes' },
      code: `// CartServlet (/cart)
HttpSession s = req.getSession();
Integer items = (Integer) s.getAttribute("items");
items = (items == null) ? 1 : items + 1;
s.setAttribute("items", items);
System.out.println("isNew=" + s.isNew() + " items=" + items);

// LogoutServlet (/logout)
req.getSession().invalidate();
System.out.println("logged out");`,
      expected: 'isNew=true items=1\nisNew=false items=2\nlogged out\nisNew=true items=1',
      explain: 'Request 1 creates the session (`isNew()` is true until the browser sends the JSESSIONID back). Request 2 reuses it, so items becomes 2. `invalidate()` destroys the session and its attributes, so request 4 gets a **new** session and starts again at 1.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about the four session techniques are TRUE? (choose all that apply)',
      options: [
        'HttpSession data is stored on the server; the browser only keeps the JSESSIONID cookie',
        'URL rewriting (response.encodeURL) adds ;jsessionid=... to links when cookies are disabled',
        'Hidden form fields only work when the user submits a form',
        'Cookies are a safe place to store a user\'s password',
        'A cookie value can be read and changed by the user in the browser',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Cookies live on the client, so the user can see and edit them: never store passwords or trust a cookie like `role=admin`. Sensitive state belongs in the HttpSession on the server.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A 3-step admission form must carry the data typed on step 1 to step 3, but the college does not want server-side sessions for it. Which technique fits?',
      options: ['Hidden form fields', 'ServletConfig', 'Static variables in the servlet', 'request attributes'],
      answer: 0,
      explain: 'Each step\'s form can include the previous answers as `<input type="hidden" name="name" value="Asha">`, so they are posted again with the next form. Request attributes die after one request, and static variables would be shared by all users.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How do you make sessions expire after **15 minutes** of inactivity for the whole application in web.xml?',
      options: [
        '<session-config><session-timeout>15</session-timeout></session-config>',
        '<session-config><session-timeout>900</session-timeout></session-config>',
        '<cookie-max-age>15</cookie-max-age>',
        'session.setMaxAge(15)',
      ],
      answer: 0,
      explain: '`<session-timeout>` in web.xml is in **minutes**. The Java method `session.setMaxInactiveInterval(900)` is in **seconds** and applies to one session. Mixing up the two units is a classic mistake.',
    },
  ],
};
