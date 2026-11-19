export default {
  lesson: 'day-09-doget-dopost-form-data',
  minutes: 25,
  intro: 'Send HTML form data to a servlet with GET and POST and read it with getParameter, getParameterValues and getParameterMap.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A registration form has a **password** field. Which `method` should the `<form>` use, and which servlet method handles it?',
      options: ['method="get" → doGet()', 'method="post" → doPost()', 'method="post" → doGet()', 'No method → doPost() (POST is the default)'],
      answer: 1,
      explain: 'Use **POST** for forms that change data or contain secrets: the data goes in the request body, not in the URL, browser history or server logs. The default form method is **GET**, so forgetting `method="post"` sends the password in the URL.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'A form has several checkboxes all named `hobby`. Complete the line that reads **all** checked values:\n`String[] hobbies = request.____("hobby");`',
      example: { title: 'single value', code: 'String city = request.getParameter("city");' },
      accept: ['getParameterValues', 'getParameterValues("hobby")', 'getParameterValues("hobby");'],
      caseSensitive: true,
      explain: '`getParameter` returns only the **first** value. `getParameterValues` returns a `String[]` of all values, or **null** when no checkbox was ticked, so always check for null before looping.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The browser requests `/register?name=Asha&city=` (city left empty, no age field). What does `doGet` print?',
      example: { title: 'missing vs empty', text: 'A field that is **sent but empty** gives `""`. A field that is **not sent at all** gives `null`.' },
      code: `String name = req.getParameter("name");
String city = req.getParameter("city");
String age  = req.getParameter("age");
System.out.println(name);
System.out.println("[" + city + "]");
System.out.println(age);
System.out.println(city.isEmpty());`,
      expected: 'Asha\n[]\nnull\ntrue',
      explain: '`city` was sent with no value, so it is the empty string `""` (prints `[]`, and `isEmpty()` is true). `age` was not sent, so `getParameter` returns **null**; calling `age.isEmpty()` would throw a NullPointerException. Validate with `if (age == null || age.isBlank())`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: '**The same idea in JavaScript** (not Java): a servlet container parses the query string for you. Write the two helpers the container provides, working on a raw query string such as `"name=Asha&hobby=chess&hobby=music"`:\n- `getParameter(query, key)` → the **first** value, or `null` if the key is missing\n- `getParameterValues(query, key)` → an **array** of all values, or `null` if the key is missing\n\nValues are URL-encoded (`Pune%20West` → `Pune West`).',
      example: { title: 'a handy built-in', code: 'const p = new URLSearchParams("a=1&b=2&b=3");\np.get("b");     // "2"\np.getAll("b");  // ["2", "3"]\np.has("c");     // false' },
      starter: 'function getParameter(query, key) {\n  // TODO\n}\n\nfunction getParameterValues(query, key) {\n  // TODO\n}\n',
      solution: 'function getParameter(query, key) {\n  const p = new URLSearchParams(query);\n  return p.has(key) ? p.get(key) : null;\n}\n\nfunction getParameterValues(query, key) {\n  const p = new URLSearchParams(query);\n  return p.has(key) ? p.getAll(key) : null;\n}\n',
      tests: [
        { call: 'getParameter("name=Asha&hobby=chess&hobby=music", "name")', expect: 'Asha' },
        { call: 'getParameter("name=Asha&hobby=chess&hobby=music", "hobby")', expect: 'chess', msg: 'getParameter returns only the FIRST value' },
        { call: 'getParameter("name=Asha", "age")', expect: null, msg: 'A missing key gives null' },
        { call: 'getParameter("city=Pune%20West", "city")', expect: 'Pune West', msg: 'Values must be URL-decoded' },
        { call: 'getParameterValues("name=Asha&hobby=chess&hobby=music", "hobby")', expect: ['chess', 'music'] },
        { call: 'getParameterValues("name=Asha", "hobby")', expect: null, msg: 'No values → null (like Java)' },
      ],
      explain: 'This mirrors `request.getParameter` / `request.getParameterValues` exactly: first value vs all values, and **null** when the parameter is absent. In Java you never parse the query string yourself; the container does it, including URL-decoding.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **doGet vs doPost** are TRUE? (choose all that apply)',
      options: [
        'GET data appears in the URL and can be bookmarked',
        'POST data travels in the request body',
        'Refreshing a page after a POST can submit the form again',
        'A GET request is the right choice for deleting a student record',
        'request.setCharacterEncoding("UTF-8") must be called before reading POST parameters to keep Hindi or Marathi text correct',
      ],
      answers: [0, 1, 2, 4],
      explain: 'GET should be safe (read only): search pages, links. Use POST for insert/update/delete. Set the encoding **before** the first `getParameter` call or non-English characters arrive garbled.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'After saving a student in `doPost`, the servlet calls `response.sendRedirect("students")` instead of showing the page directly. This is the **Post/Redirect/Get** pattern. What problem does it solve?',
      options: [
        'It makes the insert faster',
        'Pressing F5 (refresh) no longer re-submits the form and inserts a duplicate row',
        'It encrypts the form data',
        'It removes the need for validation',
      ],
      answer: 1,
      explain: 'After the redirect the browser\'s last request is a harmless **GET** of the list page, so refresh just reloads the list. Without PRG, refresh repeats the POST and the same student is inserted twice.',
    },
  ],
};
