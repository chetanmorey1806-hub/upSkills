export default {
  id: 'day-11-introduction-to-html-forms',
  title: 'Introduction to HTML Forms: <form>, action, method, GET and POST',
  module: 'Module 3: HTML Forms',
  day: 11,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Forms are how websites collect information: logins, searches, sign-ups, payments. Learn how the <form> element works, what action and method do, and the important differences between GET and POST.',
  objectives: [
    'Explain what a form is and how form data travels to a server',
    'Use the <form> element with action and method attributes',
    'Understand the role of the name attribute in name=value pairs',
    'Compare GET and POST and choose the right one',
    'Read a submitted query string and recognise URL encoding',
  ],
  theory: [
    {
      heading: 'What is an HTML form?',
      content: "A **form** is a section of a page that collects **user input** and sends it somewhere (usually a **server**) for processing. Examples: Google search box, login page, registration, checkout, feedback, OTP entry.\n\nAnalogy: a paper application form at a bank. You fill in boxes (inputs), each box has a label (\"Name\", \"Account number\"), and when you submit it, the form goes to a specific counter (the **action**) using a specific delivery method (the **method**).\n\nHTML only builds the form and sends the data. **Processing** (saving to a database, checking a password) is done by server-side code (Node.js, PHP, Python, Java) or by JavaScript.",
    },
    {
      heading: 'The <form> element',
      content: "`<form>` is the container for all the controls (inputs, checkboxes, buttons). When the user clicks a **submit button** or presses **Enter** in a text field, the browser:\n1. Collects every control inside the form that has a **name** attribute.\n2. Builds **name=value pairs**: `username=riya&city=Pune`.\n3. Sends them to the URL in **action** using the HTTP **method**.\n4. Loads the server's response as a new page.\n\nRules:\n- Forms **cannot be nested** inside other forms.\n- A control **without a name is not sent**. This is the most common beginner bug.\n- The form has no visual appearance by itself; it is a logical container.",
      syntax: '<form action="/search" method="get">\n  <input type="text" name="q">\n  <button type="submit">Search</button>\n</form>',
      tip: 'If a field is missing on the server, first check: does the input have a name attribute?',
    },
    {
      heading: 'The action attribute',
      content: "`action` is the **URL** where the form data is sent. It can be:\n- A relative URL: `action=\"/register\"` or `action=\"submit.php\"`\n- An absolute URL: `action=\"https://api.example.com/contact\"`\n- **Omitted**: the data is sent to the **current page URL** (common when the same page both shows and processes the form).\n\nThe page at that URL must have server-side code that reads the data. For testing without a server, you can use services like httpbin.org, or intercept submission with JavaScript (as our playgrounds do).",
      syntax: '<form action="https://httpbin.org/get" method="get"> ... </form>',
    },
    {
      heading: 'The method attribute: GET',
      content: "`method` sets **how** data is sent. The two values used in HTML forms are **get** (default) and **post**. (There is also `dialog`, used inside `<dialog>` elements.)\n\nWith **GET**, data is added to the **URL** as a **query string** after a `?`:\n\n`https://shop.com/search?q=red+shoes&size=8`\n\n- Visible in the address bar, browser **history**, server logs\n- Can be **bookmarked and shared** (a search result link)\n- URL length is limited (around 2,000 characters is a safe limit)\n- Only text data (no file uploads)\n- Should be used for **reading/fetching** data that does not change anything on the server\n\nNotice **URL encoding**: spaces become `+` (or `%20`), `@` becomes `%40`, and so on.",
      tip: 'Use GET for searches and filters: users can bookmark and share the results page.',
    },
    {
      heading: 'The method attribute: POST',
      content: "With **POST**, data is sent in the **body** of the HTTP request, not in the URL.\n\n- **Not visible** in the URL, not saved in history or bookmarks\n- No practical size limit; can send **files** (with `enctype=\"multipart/form-data\"`, covered in the Extra lessons)\n- Used for actions that **change data** on the server: sign-up, login, payment, posting a comment\n- Refreshing after a POST makes the browser warn \"Confirm form resubmission\" (to avoid double payments)\n\n**Important security point:** POST is **not encryption**. Anyone can see POST data in DevTools or on the network. Only **HTTPS** encrypts data in transit. Passwords must use POST **and** HTTPS.",
      syntax: '<form action="/login" method="post">\n  <input type="text" name="username">\n  <input type="password" name="password">\n  <button type="submit">Log in</button>\n</form>',
    },
    {
      heading: 'GET vs POST summary',
      content: "- **Data location**: GET = URL query string; POST = request body\n- **Visibility**: GET visible in URL; POST hidden from URL\n- **Bookmark / share**: GET yes; POST no\n- **Caching / history**: GET can be cached and stored in history; POST is not cached by default\n- **Size**: GET limited by URL length; POST practically unlimited\n- **Data types**: GET text only; POST text and files\n- **Use for**: GET = searching, filtering, reading; POST = creating, updating, logging in, payments\n- **Idempotent** (repeating has the same effect): GET yes (should be); POST no\n\nComing next (Day 12): the different input types you put inside forms.",
    },
  ],
  examples: [
    {
      title: 'A search form using GET',
      scenario: 'Build a product search box and see the query string the browser would create.',
      steps: [
        'Create search.html',
        'Add <form action="/search" method="get">',
        'Add a text input with name="q" and a number input with name="size"',
        'Add a submit button',
        'Click Run, type "red shoes", submit and read the generated URL',
      ],
      code: `<form action="/search" method="get">
  <input type="text" name="q" placeholder="Search products">
  <input type="number" name="size" placeholder="Size">
  <button type="submit">Search</button>
</form>`,
      playground: {
        html: `<form id="f" action="/search" method="get">
  <input type="text" name="q" placeholder="Search products" value="red shoes">
  <input type="number" name="size" placeholder="Size" value="8">
  <button type="submit">Search</button>
</form>
<p>URL the browser would request:</p>
<code id="out">(submit the form)</code>`,
        css: `body { font-family: sans-serif; } code { background: #f1f5f9; padding: 6px; display: inline-block; word-break: break-all; }`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault(); // stop the real navigation inside the playground
  const params = new URLSearchParams(new FormData(e.target));
  const url = e.target.getAttribute('action') + '?' + params.toString();
  document.getElementById('out').textContent = url;
  console.log('GET', url);
});`,
      },
      result: 'After submitting, the page shows /search?q=red+shoes&size=8 and the console logs it.',
      explanation: 'Each named input becomes name=value, pairs are joined with &, and the whole string follows ? in the URL. The space in "red shoes" is encoded as +. JavaScript prevents real navigation only so you can see the result inside the playground.',
    },
    {
      title: 'Missing name attribute bug',
      scenario: 'A registration form loses the email field. Find out why.',
      steps: [
        'Create a form with three inputs, but leave name off the email input',
        'Submit and inspect which fields were collected',
        'Add name="email" and submit again',
      ],
      code: `<form>
  <input type="text" name="fullname" value="Riya Sen">
  <input type="email" value="riya@mail.com">   <!-- no name! -->
  <input type="text" name="city" value="Pune">
  <button>Register</button>
</form>`,
      playground: {
        html: `<form id="f">
  <p>Name: <input type="text" name="fullname" value="Riya Sen"></p>
  <p>Email (no name): <input id="email" type="email" value="riya@mail.com"></p>
  <p>City: <input type="text" name="city" value="Pune"></p>
  <button type="submit">Register</button>
  <button type="button" id="fix">Add name="email"</button>
</form>
<pre id="out"></pre>`,
        js: `const form = document.getElementById('f');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const pairs = [...new FormData(form).entries()].map(([k, v]) => k + '=' + v);
  document.getElementById('out').textContent = 'Sent data:\\n' + pairs.join('\\n');
  console.log(pairs);
});
document.getElementById('fix').addEventListener('click', () => {
  document.getElementById('email').name = 'email';
  console.log('name="email" added. Submit again.');
});`,
      },
      result: 'First submit sends only fullname and city. After clicking "Add name", the email is also sent.',
      explanation: 'The browser only includes controls that have a name. The name becomes the key the server uses to read the value (for example req.body.email in Node.js).',
    },
    {
      title: 'Login form using POST',
      scenario: 'Build a login form that must not show the password in the URL.',
      steps: [
        'Create login.html',
        'Add <form action="/login" method="post">',
        'Add username and password inputs with names',
        'Click Run and submit: the script shows the request body and the clean URL',
      ],
      code: `<form action="/login" method="post">
  <label>Username <input type="text" name="username"></label>
  <label>Password <input type="password" name="password"></label>
  <button type="submit">Log in</button>
</form>`,
      playground: {
        html: `<form id="f" action="/login" method="post">
  <p><label>Username <input type="text" name="username" value="riya"></label></p>
  <p><label>Password <input type="password" name="password" value="s3cret!"></label></p>
  <button type="submit">Log in</button>
</form>
<pre id="out"></pre>`,
        css: `body { font-family: sans-serif; } pre { background: #f1f5f9; padding: 8px; }`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const body = new URLSearchParams(new FormData(e.target)).toString();
  const text = 'POST ' + e.target.getAttribute('action') + '  (URL has no data)\\n' +
               'Content-Type: application/x-www-form-urlencoded\\n\\n' +
               'Body: ' + body;
  document.getElementById('out').textContent = text;
  console.log(text);
});`,
      },
      result: 'The output shows "POST /login" with a clean URL, and the data username=riya&password=s3cret%21 in the request body.',
      explanation: 'With POST, data travels in the request body, so it is not stored in history or visible in the URL. Note the ! is encoded as %21. The data is still readable in DevTools, which is why HTTPS is required for real logins.',
    },
    {
      title: 'Same form, two methods: side-by-side comparison',
      scenario: 'Switch a feedback form between GET and POST and compare the resulting request.',
      steps: [
        'Build a form with name and message fields',
        'Add radio-style buttons to switch the method',
        'Submit with each method and compare',
      ],
      code: `<form action="/feedback" method="get">...</form>
<form action="/feedback" method="post">...</form>`,
      playground: {
        html: `<form id="f" action="/feedback" method="get">
  <p><input name="name" value="Aman Gupta"></p>
  <p><input name="message" value="Great course & clear notes!"></p>
  <button type="submit">Send with GET</button>
  <button type="button" id="toggle">Switch to POST</button>
</form>
<pre id="out"></pre>`,
        js: `const f = document.getElementById('f');
const submitBtn = f.querySelector('[type=submit]');
document.getElementById('toggle').addEventListener('click', (e) => {
  f.method = f.method === 'get' ? 'post' : 'get';
  submitBtn.textContent = 'Send with ' + f.method.toUpperCase();
  e.target.textContent = 'Switch to ' + (f.method === 'get' ? 'POST' : 'GET');
});
f.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new URLSearchParams(new FormData(f)).toString();
  const out = f.method === 'get'
    ? 'GET /feedback?' + data + '\\n(body: empty)'
    : 'POST /feedback\\n(body: ' + data + ')';
  document.getElementById('out').textContent = out;
  console.log(out);
});`,
      },
      result: 'GET shows the data after ? in the URL; POST shows the same data in the body. The & in the message is encoded as %26.',
      explanation: 'form.method reflects the method attribute. The encoding is identical (application/x-www-form-urlencoded); only the location changes. The & inside the message must be encoded so it is not confused with the pair separator.',
    },
  ],
  interview: [
    { q: 'What is the purpose of the <form> element?', a: 'It groups input controls and defines how and where their data is submitted (via action and method). On submit, the browser collects named controls and sends them as name=value pairs.', level: 'Easy' },
    { q: 'What does the action attribute do?', a: 'It specifies the URL that processes the form data. If omitted, the data is submitted to the current page URL.', level: 'Easy' },
    { q: 'What is the default method of a form?', a: 'GET.', level: 'Easy' },
    { q: 'What are the differences between GET and POST?', a: 'GET appends data to the URL query string, is visible, bookmarkable, cacheable, length-limited and suitable for retrieving data. POST sends data in the request body, is not shown in the URL or history, supports large data and files, and is used for actions that change server state.', level: 'Medium' },
    { q: 'Is POST secure for sending passwords?', a: 'POST alone is not secure; it only hides data from the URL. Data is still plain text on the network unless HTTPS is used. Passwords must be sent with POST over HTTPS.', level: 'Medium' },
    { q: 'Why is the name attribute important on form controls?', a: 'Only controls with a name are included in the submitted data. The name becomes the key for the value on the server.', level: 'Easy' },
    { q: 'What is a query string?', a: 'The part of a URL after ?, containing key=value pairs separated by &, e.g. ?q=shoes&size=8. GET forms create it automatically.', level: 'Easy' },
    { q: 'What is URL encoding and why is it needed?', a: 'Converting characters that are unsafe or reserved in URLs into a % code (or + for space in form data), e.g. & to %26, @ to %40. Without it, values containing & or = would break the name=value structure.', level: 'Medium' },
    { q: 'Can forms be nested?', a: 'No. A <form> cannot contain another <form>. To associate a control outside a form with it, use the form attribute on the control: <input form="formId">.', level: 'Hard' },
    { q: 'What does "idempotent" mean in the context of GET and POST?', a: 'Repeating an idempotent request has the same effect as making it once. GET should be idempotent (just reads data). POST is not; repeating it may create duplicate orders or comments, which is why browsers warn before resubmitting.', level: 'Hard' },
    { q: 'Which method would you use for a search form and why?', a: 'GET, because searching does not change data and users benefit from bookmarkable/shareable result URLs and browser back/forward working naturally.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a Google-style search form that sends the text field as "q" to https://www.google.com/search using GET.',
      hint: 'action is the Google URL; the input name must be q.',
      solution: `<form action="https://www.google.com/search" method="get">
  <input type="text" name="q" placeholder="Search Google">
  <button type="submit">Search</button>
</form>`,
    },
    {
      task: 'Create a sign-up form (name, email, password) that posts to /register.',
      hint: 'Use method="post" and give every input a name.',
      solution: `<form action="/register" method="post">
  <p><label>Name <input type="text" name="name"></label></p>
  <p><label>Email <input type="email" name="email"></label></p>
  <p><label>Password <input type="password" name="password"></label></p>
  <button type="submit">Create account</button>
</form>`,
    },
    {
      task: 'A form with fields city="New Delhi" and type="2 BHK" uses GET to /flats. Write the exact URL that will be requested.',
      hint: 'Spaces become +.',
      solution: `/flats?city=New+Delhi&type=2+BHK`,
    },
    {
      task: 'For each case choose GET or POST and explain: (a) filter products by price, (b) place an order, (c) change password, (d) view page 3 of blog posts.',
      hint: 'Does it change data on the server? Should it be bookmarkable?',
      solution: `(a) GET - only reads data; the filtered URL can be shared.
(b) POST - creates an order; must not be repeated by refresh.
(c) POST - changes data and contains a secret.
(d) GET - reads data; ?page=3 is bookmarkable.`,
    },
    {
      task: 'Build a newsletter form that sends to https://httpbin.org/post with POST and a hidden-from-URL email field, then test it in a real browser to see the echoed form data.',
      hint: 'httpbin echoes back what it receives under "form".',
      solution: `<form action="https://httpbin.org/post" method="post">
  <label>Email <input type="email" name="email"></label>
  <button type="submit">Subscribe</button>
</form>
<!-- After submit, httpbin shows: "form": { "email": "you@example.com" } -->`,
    },
  ],
  quiz: [
    { question: 'Which attribute specifies where form data is sent?', options: ['method', 'href', 'action', 'target'], answer: 2, explanation: 'action holds the URL that processes the data.' },
    { question: 'What is the default value of the method attribute?', options: ['get', 'post', 'put', 'send'], answer: 0, explanation: 'Forms use GET by default.' },
    { question: 'Which method adds form data to the URL?', options: ['POST', 'Both', 'Neither', 'GET'], answer: 3, explanation: 'GET appends data as a query string.' },
    { question: 'An input has no name attribute. What happens on submit?', options: ['Its value is sent with key "input"', 'Its value is not sent', 'The form throws an error', 'The id is used as the name'], answer: 1, explanation: 'Only named controls are submitted.' },
    { question: 'Which method should a payment form use?', options: ['GET', 'POST over HTTPS', 'GET over HTTPS', 'No method needed'], answer: 1, explanation: 'Payments change server state and contain sensitive data: POST with HTTPS.' },
  ],
};
