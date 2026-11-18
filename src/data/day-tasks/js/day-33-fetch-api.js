const MOCK = `// --- practice server (do not change): a fake fetch so no real network is used ---
const DB = { users: [{ id: 1, name: "Asha" }, { id: 2, name: "Ravi" }] };
function fetch(url, options = {}) {
  const method = options.method || "GET";
  return new Promise((resolve) => setTimeout(() => {
    const reply = (status, data) => resolve({
      ok: status >= 200 && status < 300, status,
      json: () => Promise.resolve(JSON.parse(JSON.stringify(data))),
    });
    if (url === "/api/users" && method === "GET") return reply(200, DB.users);
    if (url === "/api/users" && method === "POST") {
      const body = JSON.parse(options.body || "{}");
      if (!options.headers || options.headers["Content-Type"] !== "application/json") return reply(415, { error: "Send JSON" });
      if (!body.name) return reply(400, { error: "Name is required" });
      return reply(201, { id: 3, ...body });
    }
    const m = url.match(/^\\/api\\/users\\/(\\d+)$/);
    if (m) { const u = DB.users.find((x) => x.id === Number(m[1])); return u ? reply(200, u) : reply(404, { error: "Not found" }); }
    reply(404, { error: "Not found" });
  }, 10));
}
// --- your code below ---
`;

export default {
  lesson: 'day-33-fetch-api',
  minutes: 40,
  intro: 'Make GET and POST requests with fetch, parse JSON, check response.ok and handle loading and error states. (A practice server replaces the real network.)',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'The server replies with **404 Not Found**. What does `fetch()` do?',
      options: ['It rejects, so .catch runs', 'It resolves normally with response.ok === false, so you must check it yourself', 'It retries automatically', 'It throws a SyntaxError'],
      answer: 1,
      explain: 'This is the big fetch gotcha: fetch only **rejects on network failure**. HTTP errors like 404 or 500 still resolve; you must check `response.ok` (true for 200-299) or `response.status` and throw yourself.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match HTTP methods to their usual REST meaning. Which pairs are correct? (choose all that apply)',
      options: ['GET → read data', 'POST → create a new resource', 'PUT → replace a resource', 'PATCH → partially update a resource', 'DELETE → read data'],
      answers: [0, 1, 2, 3],
      explain: 'GET reads, POST creates, PUT replaces, PATCH updates some fields and DELETE removes. Status codes follow: 200 OK, 201 Created, 400 Bad Request, 404 Not Found, 500 Server Error.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'GET request. Write `async function getUserNames()` that fetches `/api/users`, parses the JSON with `await response.json()` and returns an **array of names**.',
      example: { title: 'basic GET', code: 'const res = await fetch("/api/products");\nconst products = await res.json();' },
      starter: MOCK + '\nasync function getUserNames() {\n  // TODO\n}',
      solution: MOCK + '\nasync function getUserNames() {\n  const res = await fetch("/api/users");\n  const users = await res.json();\n  return users.map((u) => u.name);\n}',
      tests: [{ call: 'getUserNames()', expect: ['Asha', 'Ravi'] }],
      explain: '`fetch` resolves to a **Response**; the body has to be read separately with `await res.json()` (which is also a promise). Forgetting the second await gives a Promise instead of data.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Check `response.ok`. Write `async function getUser(id)` that fetches `/api/users/<id>`. If the response is not ok, **throw** `new Error("HTTP " + status)`; otherwise return the user object. Then write `async function userLabel(id)` that returns the user\'s name, or `"Error: <message>"` using try/catch.',
      example: { title: 'checking ok', code: 'const res = await fetch(url);\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nreturn res.json();' },
      starter: MOCK + '\nasync function getUser(id) {\n  // TODO\n}\n\nasync function userLabel(id) {\n  // TODO\n}',
      solution: MOCK + '\nasync function getUser(id) {\n  const res = await fetch(`/api/users/${id}`);\n  if (!res.ok) throw new Error("HTTP " + res.status);\n  return res.json();\n}\n\nasync function userLabel(id) {\n  try {\n    const user = await getUser(id);\n    return user.name;\n  } catch (err) {\n    return "Error: " + err.message;\n  }\n}',
      tests: [
        { call: 'getUser(2)', expect: { id: 2, name: 'Ravi' } },
        { call: 'userLabel(1)', expect: 'Asha' },
        { call: 'userLabel(99)', expect: 'Error: HTTP 404' },
      ],
      explain: 'Without the `ok` check, a 404 would go on to parse `{ error: "Not found" }` and your code would show `undefined` as the name. Throwing turns HTTP errors into normal exceptions that one catch handles.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'POST request. Write `async function createUser(name)` that sends `{ name }` to `/api/users` with method `POST`, header `"Content-Type": "application/json"` and a JSON body. Return the created user (status 201). If the response is not ok, throw an Error with the server\'s `error` text.',
      example: { title: 'sending JSON', code: 'await fetch("/api/orders", {\n  method: "POST",\n  headers: { "Content-Type": "application/json" },\n  body: JSON.stringify({ item: "Pen", qty: 2 }),\n});' },
      starter: MOCK + '\nasync function createUser(name) {\n  // TODO\n}',
      solution: MOCK + '\nasync function createUser(name) {\n  const res = await fetch("/api/users", {\n    method: "POST",\n    headers: { "Content-Type": "application/json" },\n    body: JSON.stringify({ name }),\n  });\n  const data = await res.json();\n  if (!res.ok) throw new Error(data.error);\n  return data;\n}',
      tests: [
        { call: 'createUser("Meena")', expect: { id: 3, name: 'Meena' } },
        { call: 'createUser("").catch((e) => e.message)', expect: 'Name is required' },
      ],
      explain: 'The body must be a **string**, so use `JSON.stringify`; sending the raw object would send "[object Object]". The Content-Type header tells the server how to read it.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 8,
      q: 'Loading, success and error states in the UI. When `#load` is clicked:\n1. Show `Loading...` in `#status` immediately\n2. Call the global `fakeApi()` (already on the page; it returns a promise of names)\n3. On success: show each name as an `<li>` in `#users` and set `#status` to `Loaded 2 users`\n4. On error: set `#status` to `Something went wrong`',
      example: { title: 'three UI states', code: 'status.textContent = "Loading...";\ntry {\n  const data = await api();\n  status.textContent = "Done";\n} catch {\n  status.textContent = "Failed";\n}' },
      html: '<button id="load">Load users</button>\n<p id="status"></p>\n<ul id="users"></ul>\n<small id="seen" hidden></small>\n<script>\nfunction fakeApi() {\n  document.getElementById("seen").textContent = document.getElementById("status").textContent;\n  return Promise.resolve(["Asha", "Ravi"]);\n}\n</script>',
      starter: '// fakeApi() is already defined on the page\n// TODO\n',
      solution: 'const statusEl = document.getElementById("status");\nconst list = document.getElementById("users");\ndocument.getElementById("load").addEventListener("click", async () => {\n  statusEl.textContent = "Loading...";\n  list.innerHTML = "";\n  try {\n    const names = await fakeApi();\n    names.forEach((n) => {\n      const li = document.createElement("li");\n      li.textContent = n;\n      list.append(li);\n    });\n    statusEl.textContent = `Loaded ${names.length} users`;\n  } catch (err) {\n    statusEl.textContent = "Something went wrong";\n  }\n});',
      actions: [{ click: '#load', wait: 200 }],
      checks: [
        { sel: '#seen', textEq: 'Loading...', msg: 'While the request runs, #status should say "Loading..." (set it before calling fakeApi)' },
        { sel: '#users li', count: 2, msg: 'After loading, #users should list 2 names' },
        { sel: '#users li', index: 0, textEq: 'Asha', msg: 'The first <li> should be Asha' },
        { sel: '#status', textEq: 'Loaded 2 users', msg: 'After loading #status should say "Loaded 2 users"' },
      ],
      explain: 'Set the loading state **before** awaiting so the user gets instant feedback, then replace it with success or error. Leaving a UI stuck on "Loading..." when a request fails is a very common bug, which try/catch prevents.',
    },
  ],
};
