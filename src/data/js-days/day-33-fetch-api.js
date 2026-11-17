const ex1 = `// GET request: fetch -> check ok -> parse JSON
async function getTodo() {
  const response = await fetch('https://jsonplaceholder.typicode.com/todos/1');
  console.log('status:', response.status, response.ok);
  console.log('content-type:', response.headers.get('content-type'));

  const todo = await response.json();   // body is read ONCE, returns a promise
  console.log('title:', todo.title);
  console.log('completed:', todo.completed);
}
getTodo();`;

const ex2 = `// fetch does NOT reject on 404 - you must check response.ok
async function getPost(id) {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts/' + id);
    if (!res.ok) {
      throw new Error('HTTP error ' + res.status);
    }
    const post = await res.json();
    console.log('Post', id + ':', post.title.slice(0, 30) + '...');
  } catch (err) {
    console.log('Post', id, 'failed ->', err.message);
  }
}

async function main() {
  await getPost(1);       // exists
  await getPost(99999);   // 404 - fetch still RESOLVES
}
main();`;

const ex3 = `// POST, PUT, PATCH, DELETE with JSON bodies
const API = 'https://jsonplaceholder.typicode.com/posts';

async function crud() {
  // CREATE
  const created = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Learning fetch', body: 'It is fun', userId: 1 }),
  });
  const newPost = await created.json();
  console.log('POST ->', created.status, newPost);

  // UPDATE part of a resource
  const patched = await fetch(API + '/1', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Updated title' }),
  });
  const patchedPost = await patched.json();
  console.log('PATCH ->', patched.status, patchedPost.title);

  // DELETE
  const deleted = await fetch(API + '/1', { method: 'DELETE' });
  console.log('DELETE ->', deleted.status);
}
crud();`;

const ex4html = `<div class="app">
  <h2>Users</h2>
  <button id="load">Load users</button>
  <button id="fail">Load (broken URL)</button>
  <p id="status"></p>
  <ul id="list"></ul>
</div>`;

const ex4css = `.app { font-family: system-ui, sans-serif; max-width: 420px; }
button { padding: 8px 12px; margin-right: 6px; cursor: pointer; }
#status { min-height: 1.5em; font-weight: 600; }
.loading { color: #b26a00; }
.error { color: #c62828; }
.ok { color: #2e7d32; }
li { padding: 4px 0; border-bottom: 1px solid #eee; }`;

const ex4js = `const statusEl = document.querySelector('#status');
const list = document.querySelector('#list');

function setStatus(text, type) {
  statusEl.textContent = text;
  statusEl.className = type;
}

async function loadUsers(url) {
  setStatus('Loading...', 'loading');     // 1. loading state
  list.innerHTML = '';
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Server responded ' + res.status);
    const users = await res.json();
    users.forEach((u) => {
      const li = document.createElement('li');
      li.textContent = u.name + ' (' + u.email + ')';
      list.appendChild(li);
    });
    setStatus('Loaded ' + users.length + ' users', 'ok');   // 2. success state
  } catch (err) {
    setStatus('Could not load users: ' + err.message, 'error'); // 3. error state
  }
}

document.querySelector('#load').addEventListener('click', () =>
  loadUsers('https://jsonplaceholder.typicode.com/users'));
document.querySelector('#fail').addEventListener('click', () =>
  loadUsers('https://jsonplaceholder.typicode.com/userzzz'));`;

const ex5 = `// Query strings, a reusable request helper and AbortController timeout
async function request(path, { params = {}, timeout = 5000 } = {}) {
  const url = new URL('https://jsonplaceholder.typicode.com' + path);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(timer);
  }
}

async function main() {
  const comments = await request('/comments', { params: { postId: 1 } });
  console.log('Comments on post 1:', comments.length);
  console.log('First by:', comments[0].email);

  try {
    await request('/photos', { timeout: 1 });   // abort almost immediately
  } catch (err) {
    console.log('Aborted?', err.name);
  }
}
main();`;

export default {
  id: 'day-33-fetch-api',
  title: 'Fetch API, REST APIs, JSON Data, Loading and Error States',
  module: 'Module 5: Asynchronous JavaScript',
  day: 33,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'The Fetch API is the modern, promise-based way to talk to servers from JavaScript. You will learn what a REST API is, how to GET and send JSON data, and how to show proper loading, success and error states in a UI.',
  objectives: [
    'Explain REST APIs, HTTP methods and status codes in simple terms',
    'Make GET requests with fetch and parse JSON responses',
    'Send data with POST, PUT, PATCH and DELETE including headers and a JSON body',
    'Handle HTTP errors correctly by checking response.ok',
    'Build a UI with loading, success and error states, and cancel requests with AbortController',
  ],
  theory: [
    {
      heading: 'Client, Server and REST APIs',
      content:
        'Your web page (the **client**) often needs data that lives on a **server**: products, users, weather. An **API** (Application Programming Interface) is the menu of requests the server accepts.\n\n**REST** is a popular style for web APIs. Think of a library:\n- Each thing is a **resource** with its own URL: `/users`, `/users/1`, `/posts?userId=1`\n- You use **HTTP methods** as verbs to say what you want to do with it\n\nHTTP methods (CRUD):\n- `GET` – read data (Read)\n- `POST` – create a new resource (Create)\n- `PUT` – replace a resource completely (Update)\n- `PATCH` – update part of a resource (Update)\n- `DELETE` – remove a resource (Delete)\n\nIn this lesson we use **JSONPlaceholder** (https://jsonplaceholder.typicode.com), a free fake REST API for practice. It accepts POST/PUT/DELETE but does not really save the changes.',
    },
    {
      heading: 'HTTP Status Codes',
      content:
        'Every response comes with a 3-digit status code:\n- **2xx success** – 200 OK, 201 Created, 204 No Content\n- **3xx redirect** – 301 Moved Permanently, 304 Not Modified\n- **4xx client error** – 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found\n- **5xx server error** – 500 Internal Server Error, 503 Service Unavailable\n\n`response.ok` is `true` when the status is in the 200–299 range.',
      tip: 'Remember: 4xx means "you (the client) did something wrong", 5xx means "the server broke".',
    },
    {
      heading: 'Making a GET Request',
      content:
        '`fetch(url)` returns a promise that resolves to a **Response** object as soon as the headers arrive. The body is a stream, so reading it is another async step:\n\n- `response.json()` – parse body as JSON → JS object/array\n- `response.text()` – body as a string\n- `response.blob()` – binary data such as images\n\nUseful Response properties: `status`, `ok`, `statusText`, `headers.get(name)`, `url`.',
      syntax: `const response = await fetch('https://jsonplaceholder.typicode.com/users');
const users = await response.json();
console.log(users[0].name);`,
      tip: 'The body can be read only once. Calling response.json() twice throws "body stream already read".',
    },
    {
      heading: 'fetch Error Handling: the Big Gotcha',
      content:
        '`fetch` **only rejects on network failure** (no internet, DNS error, CORS blocked, aborted). A **404 or 500 is still a resolved promise**! You must check `response.ok` yourself and throw.\n\nCorrect pattern:\n1. `try` the fetch\n2. `if (!response.ok) throw new Error(...)`\n3. Parse the body\n4. `catch` shows an error message to the user',
      syntax: `try {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const data = await res.json();
} catch (err) {
  console.error('Request failed:', err.message);
}`,
    },
    {
      heading: 'Sending Data: POST, PUT, PATCH, DELETE',
      content:
        'Pass an **options object** as the second argument:\n- `method` – "POST", "PUT", "PATCH", "DELETE"\n- `headers` – e.g. `{ "Content-Type": "application/json" }` tells the server the body is JSON; auth tokens go here as `Authorization: "Bearer <token>"`\n- `body` – a **string**, so use `JSON.stringify(obj)` (Day 19)\n\nThe server usually answers POST with **201 Created** and the new object (with an id).',
      syntax: `const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Hi', userId: 1 }),
});
const created = await res.json(); // { id: 101, ... }`,
      tip: 'Forgetting JSON.stringify sends "[object Object]" as the body. Forgetting the Content-Type header makes many servers ignore the body.',
    },
    {
      heading: 'Loading, Success and Error States in the UI',
      content:
        'Real apps never just "show data". A good data-loading UI has three states:\n1. **Loading** – show a spinner/"Loading..." and maybe disable the button\n2. **Success** – render the data (or an "empty" message if the list is empty)\n3. **Error** – show a friendly message and ideally a Retry button\n\n`finally` is perfect to re-enable buttons or hide spinners.\n\n**AbortController** lets you cancel a request – for timeouts, or when the user navigates away or types a new search. Pass `signal: controller.signal` to fetch and call `controller.abort()`; the fetch rejects with an `AbortError`.\n\n**CORS**: browsers block reading responses from another domain unless that server allows it with `Access-Control-Allow-Origin` headers. JSONPlaceholder allows everyone.',
      tip: 'Coming next (Day 34): what actually happens inside the engine while you are awaiting – the event loop.',
    },
  ],
  examples: [
    {
      title: 'Basic GET request and the Response object',
      scenario: 'Fetch a single to-do item and inspect the status, headers and JSON body.',
      steps: [
        'Write an async function',
        'await fetch() the URL and log status / ok / content-type',
        'await response.json() and log fields',
        'Click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        'status: 200 true\ncontent-type: application/json; charset=utf-8\ntitle: delectus aut autem\ncompleted: false',
      explanation:
        'The first await gives a Response as soon as headers arrive (status 200, ok true). The second await reads and parses the JSON body into a normal JS object.',
    },
    {
      title: 'Why you must check response.ok',
      scenario: 'Request an existing post and a post that does not exist (404).',
      steps: [
        'Write getPost(id) with try/catch',
        'Throw manually when !res.ok',
        'Call it with 1 and 99999, then click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result: 'Post 1: sunt aut facere repellat provi...\nPost 99999 failed -> HTTP error 404',
      explanation:
        'For id 99999 the server returns 404. fetch still resolves; only our "if (!res.ok) throw" turns it into an error the catch block can handle. Without that check you would try to show an empty object.',
    },
    {
      title: 'Creating, updating and deleting with fetch',
      scenario: 'Perform CRUD operations on the posts resource with JSON bodies.',
      steps: [
        'POST with method, Content-Type header and JSON.stringify body',
        'PATCH /posts/1 with only the changed field',
        'DELETE /posts/1',
        'Click Run and read the status codes',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        "POST -> 201 { title: 'Learning fetch', body: 'It is fun', userId: 1, id: 101 }\nPATCH -> 200 Updated title\nDELETE -> 200\n(In the browser console the object is shown expandable.)",
      explanation:
        'POST returns 201 Created and echoes the object with a new id (101). PATCH returns the updated post. DELETE returns 200. JSONPlaceholder fakes the changes, so a later GET would still show the original data.',
    },
    {
      title: 'User list with loading, success and error states',
      scenario: 'A button loads users into a list, showing "Loading...", then the data or a friendly error.',
      steps: [
        'Create the HTML: buttons, a status paragraph and an empty list',
        'Write setStatus(text, type) to switch CSS classes',
        'In loadUsers: set loading → fetch → check ok → render list → success, catch → error',
        'Click "Load users", then "Load (broken URL)"',
      ],
      code: ex4js,
      playground: { html: ex4html, css: ex4css, js: ex4js },
      result:
        '"Load users" shows orange "Loading..." then 10 users (Leanne Graham (Sincere@april.biz) ...) and green "Loaded 10 users". The broken button shows red "Could not load users: Server responded 404".',
      explanation:
        'The UI moves through explicit states. The 404 is converted to an error by the ok check, so the same catch block handles both HTTP errors and network failures.',
    },
    {
      title: 'Query parameters, a reusable helper and AbortController',
      scenario: 'Build a small request() helper that adds query params, checks errors and aborts slow requests.',
      steps: [
        'Use the URL object and searchParams to build ?postId=1 safely',
        'Create an AbortController and abort it with setTimeout',
        'Clear the timer in finally',
        'Call it normally and with a 1 ms timeout, click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result: 'Comments on post 1: 5\nFirst by: Eliseo@gardner.biz\nAborted? AbortError',
      explanation:
        'url.searchParams encodes parameters correctly. The second call aborts after 1 ms, so fetch rejects with an error whose name is "AbortError". finally clears the timer in both cases so no stray timeouts remain.',
    },
  ],
  interview: [
    {
      q: 'What is the Fetch API?',
      a: 'A modern, promise-based browser (and Node 18+) API for making HTTP requests. fetch(url, options) returns a promise resolving to a Response object.',
      level: 'Easy',
    },
    {
      q: 'Does fetch reject on a 404 or 500 response?',
      a: 'No. fetch only rejects on network errors or aborts. For HTTP errors it resolves normally; you must check response.ok (status 200-299) or response.status and throw yourself.',
      level: 'Medium',
    },
    {
      q: 'Why do we need two awaits: await fetch() and await response.json()?',
      a: 'fetch resolves when the response HEADERS arrive. The body is streamed afterwards, so reading/parsing it (json(), text(), blob()) is a second asynchronous operation.',
      level: 'Medium',
    },
    {
      q: 'How do you send JSON with fetch?',
      a: 'fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })',
      level: 'Easy',
    },
    {
      q: 'What is REST?',
      a: 'Representational State Transfer: an architectural style where resources are identified by URLs and manipulated with standard HTTP methods (GET, POST, PUT, PATCH, DELETE). It is stateless – each request carries all the information needed.',
      level: 'Easy',
    },
    {
      q: 'What is the difference between PUT and PATCH?',
      a: 'PUT replaces the entire resource with the body you send. PATCH applies a partial update – only the fields you send are changed.',
      level: 'Medium',
    },
    {
      q: 'How do you cancel a fetch request?',
      a: 'Create an AbortController, pass controller.signal in the fetch options, and call controller.abort(). The fetch promise rejects with a DOMException named "AbortError". AbortSignal.timeout(ms) is a shortcut for timeouts.',
      level: 'Medium',
    },
    {
      q: 'What is CORS?',
      a: 'Cross-Origin Resource Sharing: a browser security mechanism. A page can only read responses from another origin if that server sends headers like Access-Control-Allow-Origin. It is enforced by the browser, not by fetch on the server side.',
      level: 'Medium',
    },
    {
      q: 'Name common HTTP status codes and their meaning.',
      a: '200 OK, 201 Created, 204 No Content, 301 Moved Permanently, 304 Not Modified, 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 500 Internal Server Error, 503 Service Unavailable.',
      level: 'Easy',
    },
    {
      q: 'Which UI states should a data-loading component handle?',
      a: 'Loading (spinner, disabled button), success (render data), empty (no items), and error (friendly message, retry). Clean up loading indicators in finally.',
      level: 'Medium',
    },
    {
      q: 'fetch vs XMLHttpRequest?',
      a: 'XMLHttpRequest is the older event/callback-based API. fetch is promise-based, cleaner, supports streams and AbortController, and works with async/await. XHR is still used for upload progress events.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Fetch all todos from https://jsonplaceholder.typicode.com/todos and log how many are completed and how many are pending.',
      hint: 'filter on todo.completed.',
      solution: `async function stats() {
  const res = await fetch('https://jsonplaceholder.typicode.com/todos');
  const todos = await res.json();
  const done = todos.filter((t) => t.completed).length;
  console.log('Completed:', done, 'Pending:', todos.length - done); // 90 / 110
}
stats();`,
    },
    {
      task: 'Write getJSON(url) that fetches, throws "HTTP <status>" when not ok, and returns the parsed JSON. Use it to load /users/2.',
      hint: 'Make it an async function and return await res.json().',
      solution: `async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}

getJSON('https://jsonplaceholder.typicode.com/users/2')
  .then((u) => console.log(u.name))   // Ervin Howell
  .catch((e) => console.log(e.message));`,
    },
    {
      task: 'Build a small form (title input + Add button) that POSTs a new post to JSONPlaceholder and shows "Created post #<id>" below the form.',
      hint: 'Listen to submit, preventDefault, fetch with POST, read json().id.',
      solution: `<form id="f"><input id="title" required placeholder="Title"><button>Add</button></form>
<p id="msg"></p>
<script>
document.querySelector('#f').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.querySelector('#msg');
  msg.textContent = 'Saving...';
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: document.querySelector('#title').value, userId: 1 }),
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const post = await res.json();
    msg.textContent = 'Created post #' + post.id;
  } catch (err) {
    msg.textContent = 'Error: ' + err.message;
  }
});
</script>`,
    },
    {
      task: 'Make a "Load photo" button that shows a loading text, then displays the thumbnail of photo 1 from /photos/1 (use the thumbnailUrl field) or an error message.',
      hint: 'Create an <img> and set its src to the URL from the JSON.',
      solution: `<button id="btn">Load photo</button><p id="s"></p><div id="box"></div>
<script>
document.querySelector('#btn').addEventListener('click', async () => {
  const s = document.querySelector('#s');
  s.textContent = 'Loading...';
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/photos/1');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const photo = await res.json();
    const img = document.createElement('img');
    img.src = photo.thumbnailUrl;
    img.alt = photo.title;
    document.querySelector('#box').replaceChildren(img);
    s.textContent = photo.title;
  } catch (e) {
    s.textContent = 'Failed: ' + e.message;
  }
});
</script>`,
    },
    {
      task: 'Fetch /users and /posts in parallel and log each user name with their number of posts.',
      hint: 'Promise.all with two fetches, then filter posts by userId.',
      solution: `async function report() {
  const base = 'https://jsonplaceholder.typicode.com';
  const [users, posts] = await Promise.all([
    fetch(base + '/users').then((r) => r.json()),
    fetch(base + '/posts').then((r) => r.json()),
  ]);
  users.forEach((u) => {
    const count = posts.filter((p) => p.userId === u.id).length;
    console.log(u.name + ': ' + count);
  });
}
report();`,
    },
  ],
  quiz: [
    {
      question: 'What does fetch() resolve to?',
      options: ['The JSON data', 'A Response object', 'A string', 'An XMLHttpRequest'],
      answer: 1,
      explanation: 'You then call response.json() / text() to read the body.',
    },
    {
      question: 'The server returns 404. What does fetch do?',
      options: [
        'Rejects with an error',
        'Retries automatically',
        'Resolves; response.ok is false',
        'Throws a SyntaxError',
      ],
      answer: 2,
      explanation: 'fetch only rejects on network failures. Check response.ok.',
    },
    {
      question: 'Which HTTP method is used to create a new resource?',
      options: ['GET', 'DELETE', 'PATCH', 'POST'],
      answer: 3,
      explanation: 'POST creates; servers usually reply 201 Created.',
    },
    {
      question: 'How must a JavaScript object be sent as the fetch body?',
      options: ['JSON.stringify(obj)', 'obj directly', 'obj.toString()', 'JSON.parse(obj)'],
      answer: 0,
      explanation: 'The body must be a string (or FormData/Blob); JSON.stringify converts the object.',
    },
    {
      question: 'What is used to cancel an in-progress fetch?',
      options: ['clearTimeout', 'AbortController', 'Promise.race only', 'response.cancel()'],
      answer: 1,
      explanation: 'Pass controller.signal to fetch and call controller.abort().',
    },
  ],
};
