const es6Js = `// let / const are block-scoped
const course = '.NET Full Stack';
for (let i = 0; i < 2; i++) { /* i exists only inside this loop */ }
console.log(typeof i);                       // 'undefined' -> i is not visible here

// Arrow functions + template literals + default parameters
const fee = (amount, discount = 10) => amount - (amount * discount) / 100;
console.log(\`\${course} fee after discount: \${fee(40000)}\`);

// Array destructuring (with skip, default and swap)
const marks = [88, 92, 79];
const [csharp, sql, js = 0] = marks;
const [first, , third] = marks;
let a = 1, b = 2;
[a, b] = [b, a];
console.log(csharp, sql, js, '|', first, third, '| swapped:', a, b);

// Object destructuring (rename, default, nested)
const student = { id: 7, name: 'Riya', city: 'Pune', address: { pin: '411001' } };
const { name, city: hometown, phone = 'N/A', address: { pin } } = student;
console.log(name, hometown, phone, pin);

// Destructuring in function parameters
const describe = ({ name, city }) => \`\${name} lives in \${city}\`;
console.log(describe(student));

// Spread: copy / merge arrays and objects
const frontend = ['HTML', 'CSS'];
const all = [...frontend, 'JS', ...['C#', 'SQL']];
const updated = { ...student, city: 'Mumbai', email: 'riya@example.com' };
console.log(all);
console.log(student.city, '->', updated.city, '| has email:', 'email' in updated);
console.log(Math.max(...marks));

// Rest parameters: collect remaining arguments into an array
const total = (label, ...nums) => \`\${label}: \${nums.reduce((s, n) => s + n, 0)} (\${nums.length} values)\`;
console.log(total('Sum', 10, 20, 30, 40));
const { id, ...withoutId } = student;          // rest in destructuring
console.log(Object.keys(withoutId));

// Shorthand properties, optional chaining, nullish coalescing
const title = 'Developer';
const profile = { name, title };               // same as { name: name, title: title }
console.log(profile);
console.log(student.address?.pin, student.contact?.email, student.contact?.email ?? 'no email');`;

const modulesMathSrc = `// mathUtils.js
export const PASS_MARK = 35;
export function average(list) {
  return list.reduce((s, n) => s + n, 0) / list.length;
}
export default function grade(avg) {
  return avg >= 85 ? 'A+' : avg >= 70 ? 'A' : avg >= PASS_MARK ? 'Pass' : 'Fail';
}`;

const modulesMainSrc = `// main.js
import grade, { average, PASS_MARK } from './mathUtils.js';

const marks = [88, 92, 79];
const avg = average(marks);
console.log('Pass mark:', PASS_MARK);
console.log('Average:', avg.toFixed(2), 'Grade:', grade(avg));`;

const modulesHtmlFile = `<!-- index.html -->
<script type="module" src="js/main.js"></script>`;

const modulesPlayJs = `// The playground has only one JS panel, so we turn the "mathUtils.js" source into a real
// module file in memory (a Blob URL) and import it with dynamic import().
const mathUtilsSource = \`
export const PASS_MARK = 35;
export function average(list) {
  return list.reduce((s, n) => s + n, 0) / list.length;
}
export default function grade(avg) {
  return avg >= 85 ? 'A+' : avg >= 70 ? 'A' : avg >= PASS_MARK ? 'Pass' : 'Fail';
}\`;
const url = URL.createObjectURL(new Blob([mathUtilsSource], { type: 'text/javascript' }));

(async () => {
  const mod = await import(url);              // same as: import grade, { average, PASS_MARK } from './mathUtils.js'
  const { default: grade, average, PASS_MARK } = mod;
  const marks = [88, 92, 79];
  const avg = average(marks);
  console.log('Pass mark:', PASS_MARK);
  console.log('Average:', avg.toFixed(2), 'Grade:', grade(avg));
  console.log('Exports:', Object.keys(mod).sort().join(', '));
})();`;

const jsonJs = `const student = {
  id: 1,
  name: 'Riya',
  isActive: true,
  marks: [88, 92],
  address: { city: 'Pune' },
  joined: new Date(Date.UTC(2026, 0, 15)),
  sayHi() { return 'Hi'; },          // functions are NOT serialised
  nickname: undefined,               // undefined properties are skipped
};

// Object -> JSON string
const json = JSON.stringify(student);
console.log(json);
console.log(typeof json);

// Pretty print with 2-space indentation, only some keys
console.log(JSON.stringify({ id: 1, name: 'Riya' }, null, 2));
console.log(JSON.stringify(student, ['id', 'name']));

// JSON string -> object
const text = '{"id":2,"name":"Arjun","marks":[65,72],"isActive":false}';
const obj = JSON.parse(text);
console.log(obj.name, obj.marks[1], obj.isActive, typeof obj);

// Dates come back as strings
const back = JSON.parse(json);
console.log(typeof back.joined, back.joined.slice(0, 10));

// Invalid JSON throws a SyntaxError -> always use try/catch with external data
const bad = "{ name: 'Kabir' }";   // keys and strings must use double quotes in JSON
try {
  JSON.parse(bad);
} catch (err) {
  console.log('Error:', err.name);
}

// Deep copy trick (only for plain data)
const copy = JSON.parse(JSON.stringify({ a: { b: 1 } }));
copy.a.b = 99;
console.log('copy.a.b =', copy.a.b);`;

const storageHtml = `<input id="nameInput" placeholder="Your name">
<button id="save">Save</button>
<button id="clear">Clear</button>
<p id="greeting"></p>
<p class="note">Reload the preview (or run again): the name is remembered.</p>`;

const storageJs = `const KEY = 'dotnet-day62-username';

function show() {
  const name = localStorage.getItem(KEY);          // null if missing
  document.getElementById('greeting').textContent = name ? 'Welcome back, ' + name + '!' : 'Hello, guest!';
}

document.getElementById('save').addEventListener('click', () => {
  const name = document.getElementById('nameInput').value.trim();
  if (!name) return;
  localStorage.setItem(KEY, name);                 // values are always strings
  show();
  console.log('Saved:', name);
});

document.getElementById('clear').addEventListener('click', () => {
  localStorage.removeItem(KEY);
  show();
  console.log('Removed key');
});

// Objects and arrays must be stored as JSON
const settings = { theme: 'dark', fontSize: 16 };
localStorage.setItem('dotnet-day62-settings', JSON.stringify(settings));
const loaded = JSON.parse(localStorage.getItem('dotnet-day62-settings'));
console.log('theme:', loaded.theme, '| fontSize + 2 =', loaded.fontSize + 2);

// Numbers come back as strings!
localStorage.setItem('dotnet-day62-visits', 5);
console.log(typeof localStorage.getItem('dotnet-day62-visits'), localStorage.getItem('dotnet-day62-visits') + 1);

// Safe read helper with a default value
function load(key, fallback) {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}
console.log(load('dotnet-day62-missing', []));
show();`;

const fetchHtml = `<button id="loadBtn">Load users</button>
<button id="postBtn">Create post</button>
<p id="status"></p>
<ul id="users"></ul>`;

const fetchCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
button { padding: 8px 14px; margin-right: 6px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; }
#status { color: #475569; }
#users li { padding: 4px 0; }`;

const fetchJs = `const API = 'https://jsonplaceholder.typicode.com';
const statusEl = document.getElementById('status');

// GET with async/await
async function loadUsers() {
  statusEl.textContent = 'Loading...';
  try {
    const response = await fetch(\`\${API}/users?_limit=5\`);
    if (!response.ok) throw new Error(\`HTTP \${response.status}\`);   // fetch does not throw on 404/500
    const users = await response.json();                                // parse JSON body
    const list = document.getElementById('users');
    list.innerHTML = '';
    users.forEach(({ name, email, address: { city } }) => {
      const li = document.createElement('li');
      li.textContent = \`\${name} - \${email} (\${city})\`;
      list.appendChild(li);
    });
    statusEl.textContent = \`Loaded \${users.length} users\`;
    console.log('First user:', users[0].name);
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
    console.log('Failed:', err.message);
  }
}

// POST JSON
async function createPost() {
  const newPost = { title: 'Day 62', body: 'Learning fetch', userId: 1 };
  const response = await fetch(\`\${API}/posts\`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost),
  });
  const created = await response.json();
  console.log('Status:', response.status, '| new id:', created.id, '| title:', created.title);
}

// The same GET written with .then() promise chaining
function loadTodoWithThen() {
  return fetch(API + '/todos/1')
    .then(res => res.json())
    .then(todo => console.log('Todo 1:', todo.title))
    .catch(err => console.log('Failed:', err.message));
}

document.getElementById('loadBtn').addEventListener('click', loadUsers);
document.getElementById('postBtn').addEventListener('click', createPost);
loadTodoWithThen();`;

const recordsHtml = `<div class="app">
  <h2>Student Records</h2>
  <form id="studentForm" class="form">
    <input id="name" placeholder="Name" required>
    <input id="email" type="email" placeholder="Email" required>
    <select id="course">
      <option>.NET Full Stack</option><option>SQL Server</option><option>React</option>
    </select>
    <input id="marks" type="number" min="0" max="100" placeholder="Marks" required>
    <button type="submit">Save</button>
  </form>
  <div class="toolbar">
    <input id="search" placeholder="Search by name or course">
    <button id="importBtn" type="button">Import 3 from API</button>
    <button id="clearAll" type="button" class="danger">Clear all</button>
  </div>
  <table>
    <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Course</th><th>Marks</th><th></th></tr></thead>
    <tbody id="tbody"></tbody>
  </table>
  <p id="stats" class="stats"></p>
</div>`;

const recordsCss = `* { box-sizing: border-box; }
body { font-family: "Segoe UI", Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 10px; }
.app { max-width: 760px; margin: auto; background: white; padding: 16px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.app h2 { margin-top: 0; color: #1e3a8a; }
.form, .toolbar { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
.form input, .form select, .toolbar input { flex: 1 1 120px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
button { padding: 8px 14px; border: none; border-radius: 6px; background: #2563eb; color: white; cursor: pointer; }
button.danger { background: #dc2626; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: left; }
th { background: #eff6ff; }
td .del { background: #ef4444; padding: 2px 8px; }
.stats { font-weight: 600; color: #334155; }`;

const recordsJs = `const STORAGE_KEY = 'dotnet-day62-students';

// ---------- data layer (localStorage) ----------
const loadStudents = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? []; } catch { return []; }
};
const saveStudents = list => localStorage.setItem(STORAGE_KEY, JSON.stringify(list));

let students = loadStudents();
if (students.length === 0) {
  students = [
    { id: 1, name: 'Riya Sharma', email: 'riya@example.com', course: '.NET Full Stack', marks: 88 },
    { id: 2, name: 'Arjun Mehta', email: 'arjun@example.com', course: 'React', marks: 72 },
  ];
  saveStudents(students);
}
const nextId = () => Math.max(0, ...students.map(s => s.id)) + 1;

// ---------- UI ----------
const tbody = document.getElementById('tbody');

function render(filter = '') {
  const term = filter.trim().toLowerCase();
  const visible = students.filter(({ name, course }) =>
    name.toLowerCase().includes(term) || course.toLowerCase().includes(term));

  tbody.innerHTML = '';
  visible.forEach(({ id, name, email, course, marks }) => {
    const tr = document.createElement('tr');
    [id, name, email, course, marks].forEach(value => {
      const td = document.createElement('td');
      td.textContent = value;                           // safe: no HTML injection
      tr.appendChild(td);
    });
    const td = document.createElement('td');
    td.innerHTML = \`<button class="del" data-id="\${id}">Delete</button>\`;
    tr.appendChild(td);
    tbody.appendChild(tr);
  });

  const avg = students.length ? students.reduce((s, { marks }) => s + marks, 0) / students.length : 0;
  document.getElementById('stats').textContent =
    \`Total: \${students.length} | Showing: \${visible.length} | Average marks: \${avg.toFixed(1)}\`;
}

// Add a student (spread + shorthand properties)
document.getElementById('studentForm').addEventListener('submit', e => {
  e.preventDefault();
  const [name, email, course, marks] = ['name', 'email', 'course', 'marks']
    .map(id => document.getElementById(id).value.trim());
  const record = { id: nextId(), name, email, course, marks: Number(marks) };
  students = [...students, record];
  saveStudents(students);
  e.target.reset();
  render(document.getElementById('search').value);
  console.log('Saved:', JSON.stringify(record));
});

// Delete with event delegation
tbody.addEventListener('click', e => {
  if (!e.target.matches('.del')) return;
  const id = Number(e.target.dataset.id);
  students = students.filter(s => s.id !== id);
  saveStudents(students);
  render(document.getElementById('search').value);
  console.log('Deleted id', id);
});

document.getElementById('search').addEventListener('input', e => render(e.target.value));

document.getElementById('clearAll').addEventListener('click', () => {
  if (!confirm('Delete all records?')) return;
  students = [];
  saveStudents(students);
  render();
});

// Import from a REST API with fetch (later: your own ASP.NET Core Web API)
document.getElementById('importBtn').addEventListener('click', async () => {
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users?_limit=3');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const users = await res.json();
    const imported = users.map(({ name, email }, i) => ({
      id: nextId() + i, name, email, course: 'SQL Server', marks: 60 + i * 10,
    }));
    students = [...students, ...imported];
    saveStudents(students);
    render();
    console.log('Imported', imported.length, 'students');
  } catch (err) {
    console.log('Import failed:', err.message);
  }
});

render();
console.log('Loaded', students.length, 'students from localStorage');`;

export default {
  id: 'day-062-es6-json-localstorage-fetch',
  title: 'ES6+, Arrow Functions, Destructuring, Spread/Rest, Modules, JSON, Local Storage and Fetch API',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 62,
  level: 'Beginner',
  duration: '3 hours',
  summary: 'Finish the frontend module with modern JavaScript: let/const, arrow functions, template literals, destructuring, spread and rest, ES modules (import/export), JSON.stringify/parse, saving data in the browser with localStorage, and calling REST APIs with fetch and async/await. Then build a student records app that stores and displays data, the same pattern you will use with your ASP.NET Core Web API and React.',
  objectives: [
    'Use ES6+ syntax: let/const, arrow functions, template literals, default parameters, destructuring, spread, rest, optional chaining',
    'Split code into ES modules with named and default export/import',
    'Convert between objects and JSON and handle invalid JSON safely',
    'Store, read and remove data with localStorage (and know sessionStorage)',
    'Call APIs with fetch, async/await and promises, including POST with a JSON body and error handling',
  ],
  theory: [
    {
      heading: 'ES6 (ES2015) and modern JavaScript',
      content: "**ECMAScript** is the official standard behind JavaScript. **ES6 / ES2015** was the biggest update; since then a new version comes every year (ES2016 ... ES2025). Main features you already used or meet today:\n- `let` / `const` (block scope), arrow functions `() => {}`, template literals `` `${x}` ``, default parameters.\n- Destructuring, spread `...`, rest `...`, shorthand properties `{ name }`.\n- Classes (`class Student { constructor() {} }`), modules (`import` / `export`), Promises, `Map` / `Set`.\n- Later: `async/await` (ES2017), `?.` optional chaining and `??` (ES2020), `Array.prototype.at`, `structuredClone`.\n\nArrow function recap: shorter syntax, implicit return for one expression, return an object with brackets `() => ({ id: 1 })`, no own `this` (good inside callbacks, bad as object methods).",
    },
    {
      heading: 'Destructuring, spread and rest',
      content: "**Destructuring** unpacks values into variables:\n- Arrays (by position): `const [a, b = 0, ...others] = arr;` skip with commas `[first, , third]`; swap `[a, b] = [b, a]`.\n- Objects (by name): `const { name, city: hometown, phone = 'N/A' } = student;` (rename, default), nested `{ address: { pin } }`, in parameters `function show({ name, marks }) {}` (React props use this everywhere).\n\n**Spread** `...` expands an array/object: copy `[...arr]`, merge `[...a, ...b]`, `{ ...obj, city: 'Mumbai' }` (later keys win: immutable update), function arguments `Math.max(...marks)`. It is a **shallow** copy.\n\n**Rest** `...` collects the remaining items: parameters `function sum(...nums)` (like C# `params int[]`), `const { id, ...rest } = obj`.\n\nSame three dots: spread on the right side / in calls, rest on the left side / in parameter lists.",
      syntax: "const { name, ...others } = student;\nconst updated = { ...student, marks: 95 };\nconst sum = (...nums) => nums.reduce((a, b) => a + b, 0);",
    },
    {
      heading: 'ES modules: import and export',
      content: "Modules split code into files with their own scope; nothing leaks to global unless exported.\n- **Named exports**: `export const PI = 3.14; export function average() {}` imported with braces: `import { PI, average } from './math.js';` rename with `as`.\n- **Default export** (one per file): `export default function grade() {}` imported without braces and any name: `import grade from './math.js';`\n- Import everything: `import * as math from './math.js';`\n- In the browser: `<script type=\"module\" src=\"js/main.js\"></script>`. Modules are deferred automatically, run in strict mode, need the `.js` extension in the path and must be served over http (Live Server / ASP.NET Core), not opened as file://.\n- Dynamic import: `const mod = await import('./math.js');` loads on demand.\n- Node.js uses ES modules with `.mjs` or `\"type\": \"module\"` in package.json; React/Vite projects (Module 9) use them everywhere.",
    },
    {
      heading: 'JSON',
      content: "**JSON (JavaScript Object Notation)** is the text format used to exchange data between browser and server; ASP.NET Core Web API sends and receives JSON by default (System.Text.Json uses camelCase names).\n\nRules: keys and strings in **double quotes**, values can be string, number, boolean, null, array, object; no functions, no undefined, no comments, no trailing commas.\n\n- `JSON.stringify(obj)` object to string; `JSON.stringify(obj, null, 2)` pretty print; functions and undefined properties are skipped; Dates become ISO strings.\n- `JSON.parse(text)` string to object; throws `SyntaxError` on invalid JSON, so wrap external data in `try/catch`.",
      syntax: '{\n  "id": 1,\n  "name": "Riya",\n  "marks": [88, 92],\n  "isActive": true,\n  "address": { "city": "Pune" }\n}',
    },
    {
      heading: 'Web Storage: localStorage and sessionStorage',
      content: "Browsers can store small key-value data (about 5 MB per origin):\n- **localStorage**: survives page reloads and browser restarts until removed.\n- **sessionStorage**: same API but cleared when the tab is closed.\n\nAPI: `setItem(key, value)`, `getItem(key)` (returns `null` if missing), `removeItem(key)`, `clear()`, `length`, `key(i)`.\n\nValues are always **strings**: store objects/arrays with `JSON.stringify` and read with `JSON.parse`. Data is per origin (protocol + domain + port) and is visible to any script on the page, so **never store passwords or sensitive data**; storing JWT tokens there is common but XSS-sensitive (discussed on Day 107 and Day 113).\n\nCookies vs localStorage: cookies are sent to the server with every request (small, ~4 KB, can be HttpOnly); localStorage stays in the browser only.",
      tip: 'See and edit stored values in Chrome: F12 > Application > Local Storage.',
    },
    {
      heading: 'Fetch API, Promises and async/await',
      content: "`fetch(url, options)` makes HTTP requests from JavaScript (AJAX) and returns a **Promise**: an object that will later be fulfilled with a value or rejected with an error.\n\n- Promise style: `fetch(url).then(res => res.json()).then(data => ...).catch(err => ...)`.\n- **async/await** (cleaner): inside an `async` function, `const res = await fetch(url); const data = await res.json();` with `try/catch` for errors. Like C# `async Task` / `await` (Day 38).\n- `res.ok` is true for status 200-299; `res.status` gives the code. **fetch only rejects on network failure**, not on 404/500, so check `res.ok`.\n- POST/PUT: `fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })`. DELETE: `{ method: 'DELETE' }`. Auth header: `Authorization: 'Bearer ' + token`.\n- Calling your own ASP.NET Core Web API from another origin (e.g. React on port 5173) requires **CORS** to be enabled on the API (Day 96).\n\nComing next: Module 6 starts the server side with ASP.NET Core (Day 63). For more depth on everything in Module 5, use the full HTML, CSS and JavaScript courses in this app.",
      syntax: "async function getStudents() {\n  const res = await fetch('https://localhost:7001/api/students');\n  if (!res.ok) throw new Error('HTTP ' + res.status);\n  return await res.json();\n}",
    },
  ],
  examples: [
    {
      title: 'ES6 features tour',
      scenario: 'Use every modern syntax feature on student data and predict the output.',
      steps: ['Create es6.js in VS Code', 'Write each section (scope, arrows, destructuring, spread, rest, optional chaining)', 'Run it with: node es6.js, or in the playground console', 'Compare with the expected output'],
      code: es6Js,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: es6Js },
      result: "undefined\n.NET Full Stack fee after discount: 36000\n88 92 79 | 88 79 | swapped: 2 1\nRiya Pune N/A 411001\nRiya lives in Pune\n[ 'HTML', 'CSS', 'JS', 'C#', 'SQL' ]\nPune -> Mumbai | has email: true\n92\nSum: 100 (4 values)\n[ 'name', 'city', 'address' ]\n{ name: 'Riya', title: 'Developer' }\n411001 undefined no email\n(Output shown as printed by node; the playground console prints arrays/objects as JSON, e.g. [\"HTML\",\"CSS\",\"JS\",\"C#\",\"SQL\"].)",
      explanation: 'The loop variable i is block-scoped, so typeof i outside is "undefined". The spread copy changed city without touching the original (student.city is still Pune). ...nums collected 4 arguments; { id, ...withoutId } removed id. ?. returns undefined instead of throwing when contact does not exist and ?? supplies a default.',
    },
    {
      title: 'ES modules: export and import',
      scenario: 'Put calculation helpers in mathUtils.js and use them from main.js with named and default imports.',
      steps: ['Create js/mathUtils.js with export const, export function and export default', 'Create js/main.js that imports them', 'Load main.js with <script type="module"> and open the page through Live Server (modules do not work from file://)', 'The playground has a single JS panel, so it builds mathUtils.js as an in-memory module (Blob URL) and loads it with import()'],
      code: modulesMathSrc + '\n\n' + modulesMainSrc + '\n\n' + modulesHtmlFile,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: modulesPlayJs },
      result: 'Pass mark: 35\nAverage: 86.33 Grade: A+\nExports: PASS_MARK, average, default',
      explanation: 'The average of 88, 92, 79 is 259 / 3 = 86.33, which is >= 85 so grade returns A+. A default export appears on the module object under the key "default"; named exports keep their names. In a real project you write the static import line shown in main.js.',
    },
    {
      title: 'JSON.stringify and JSON.parse',
      scenario: 'Convert a student object to JSON (as sent to a Web API) and parse JSON text (as received from it), including the pitfalls.',
      steps: ['Create json.js', 'Stringify an object containing a function, undefined and a Date', 'Parse valid JSON and catch an invalid one', 'Run with node json.js or in the playground'],
      code: jsonJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: jsonJs },
      result: '{"id":1,"name":"Riya","isActive":true,"marks":[88,92],"address":{"city":"Pune"},"joined":"2026-01-15T00:00:00.000Z"}\nstring\n{\n  "id": 1,\n  "name": "Riya"\n}\n{"id":1,"name":"Riya"}\nArjun 72 false object\nstring 2026-01-15\nError: SyntaxError\ncopy.a.b = 99',
      explanation: 'sayHi and nickname disappear because functions and undefined are not valid JSON. The Date becomes an ISO string and stays a string after parsing. Single quotes and unquoted keys are invalid JSON, so JSON.parse throws a SyntaxError.',
    },
    {
      title: 'localStorage: remember the user',
      scenario: 'Save a name and settings in the browser so they survive a reload.',
      steps: ['Create storage.html with an input and Save/Clear buttons', 'Save with setItem, read with getItem, delete with removeItem', 'Store an object with JSON.stringify and read it back with JSON.parse', 'Type a name, Save, then run the playground again (or reload the page): the greeting remains', 'Open F12 > Application > Local Storage to see the keys'],
      code: storageJs,
      playground: { html: storageHtml, css: 'body { font-family: "Segoe UI", Arial, sans-serif; } .note { color: #64748b; font-size: 13px; }', js: storageJs },
      result: 'First run: "Hello, guest!".\nConsole:\ntheme: dark | fontSize + 2 = 18\nstring 51\n[]\nAfter typing Riya and clicking Save: "Welcome back, Riya!" and "Saved: Riya"; running again still shows "Welcome back, Riya!". Clear shows "Hello, guest!" and logs "Removed key".',
      explanation: 'getItem returns the string "5", so "5" + 1 = "51": always convert with Number() or JSON.parse. The parsed settings object is a real object again so fontSize + 2 = 18. The load helper returns the fallback for missing keys (null ?? []) or corrupt JSON.',
    },
    {
      title: 'Fetch API: GET and POST with async/await',
      scenario: 'Load users from a public test REST API and create a post with a JSON body. The same code works against your ASP.NET Core Web API later.',
      steps: ['Create fetch.html with two buttons, a status line and a list', 'Write loadUsers with async/await, res.ok check and try/catch', 'Write createPost using method POST, Content-Type header and JSON.stringify body', 'Run (internet connection needed), then click both buttons; watch F12 > Network for the requests'],
      code: fetchJs,
      playground: { html: fetchHtml, css: fetchCss, js: fetchJs },
      result: 'Console on load:\nTodo 1: delectus aut autem\nClicking "Load users": status "Loaded 5 users", a list starting with "Leanne Graham - Sincere@april.biz (Gwenborough)", and console "First user: Leanne Graham".\nClicking "Create post": Status: 201 | new id: 101 | title: Day 62\nWithout internet: "Error: Failed to fetch".',
      explanation: 'await pauses inside the async function until the Promise settles without freezing the page. jsonplaceholder returns 201 Created with a fake id 101 for POST (nothing is really saved). Destructuring in forEach pulls name, email and nested address.city.',
    },
    {
      title: 'Project: Store and display student records',
      scenario: 'Day 62 task: a mini student management app: add students from a form, save them in localStorage, display them in a table with search and delete, show statistics, and import records from a REST API with fetch.',
      steps: ['Create records.html with the form, toolbar and table', 'Write loadStudents/saveStudents with JSON + localStorage', 'Render rows with destructuring and createElement/textContent', 'Handle submit (preventDefault, spread to add), delete (event delegation + filter) and search (input event)', 'Add the Import button with fetch + async/await + map', 'Add records, reload the page and confirm they are still there'],
      code: '<!-- records.html -->\n' + recordsHtml + '\n\n// records.js\n' + recordsJs,
      playground: { html: recordsHtml, css: recordsCss, js: recordsJs },
      result: 'First run: a table with 1 Riya Sharma (.NET Full Stack, 88) and 2 Arjun Mehta (React, 72); stats "Total: 2 | Showing: 2 | Average marks: 80.0"; console "Loaded 2 students from localStorage".\nAdding Neha Verma, neha@example.com, SQL Server, 95 adds row 3, logs Saved: {"id":3,"name":"Neha Verma","email":"neha@example.com","course":"SQL Server","marks":95} and stats become "Total: 3 | Showing: 3 | Average marks: 85.0". Typing "react" in search shows only Arjun ("Showing: 1"). Delete removes a row. "Import 3 from API" adds Leanne Graham, Ervin Howell and Clementine Bauch with marks 60, 70, 80. Records survive a reload.',
      explanation: 'localStorage is the "database" here; on Day 105 the same functions will call your ASP.NET Core Web API with fetch/axios instead. students = [...students, record] creates a new array (immutable update, the style React uses). textContent for user data prevents XSS; data-id + delegation handles delete buttons created at any time.',
    },
  ],
  interview: [
    { q: 'What are the main features introduced in ES6?', a: 'let/const, arrow functions, template literals, default parameters, destructuring, spread/rest, classes, modules (import/export), Promises, Map/Set, for...of, Symbol, enhanced object literals.', level: 'Easy' },
    { q: 'Spread vs rest operator?', a: 'Both use ... . Spread expands an iterable/object into elements (in arrays, objects, function calls); rest collects multiple elements into one array/object (in parameter lists and destructuring patterns).', level: 'Medium' },
    { q: 'Output: const { a, ...r } = { a: 1, b: 2, c: 3 }; console.log(r);', a: '{ b: 2, c: 3 }', level: 'Medium' },
    { q: 'Is spread a deep copy?', a: 'No, a shallow copy: nested objects/arrays are still shared references. Use structuredClone(obj) (or JSON.parse(JSON.stringify(obj)) for plain data) for a deep copy.', level: 'Medium' },
    { q: 'Named export vs default export?', a: 'A module can have many named exports imported with exact names in braces; only one default export, imported without braces under any name.', level: 'Medium' },
    { q: 'What does JSON.stringify do with functions, undefined and Dates?', a: 'Functions and undefined properties are omitted (in arrays they become null); Dates are converted to ISO strings via toJSON.', level: 'Medium' },
    { q: 'localStorage vs sessionStorage vs cookies?', a: 'localStorage persists until cleared; sessionStorage is cleared when the tab closes; both ~5 MB and never sent to the server. Cookies are ~4 KB, sent with every request, can have expiry, HttpOnly and Secure flags.', level: 'Medium' },
    { q: 'Why does localStorage.getItem("count") + 1 give "51"?', a: 'localStorage stores strings only; "5" + 1 concatenates. Convert with Number() or store/parse JSON.', level: 'Easy' },
    { q: 'Does fetch reject on HTTP 404 or 500?', a: 'No. fetch only rejects on network errors (or CORS failures). Check response.ok / response.status and throw manually.', level: 'Hard' },
    { q: 'What is a Promise and what are its states?', a: 'An object representing a future result of an async operation. States: pending, fulfilled (resolved with a value), rejected (with a reason). Consumed with then/catch/finally or await.', level: 'Medium' },
    { q: 'async/await vs .then()?', a: 'Both work with Promises. async/await lets you write asynchronous code that reads top-to-bottom with normal try/catch; await can only be used inside async functions (or top-level in modules).', level: 'Medium' },
    { q: 'How do you send JSON to an ASP.NET Core API with fetch?', a: "fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dto) }). The API binds it with [FromBody]; enable CORS if the page is on a different origin.", level: 'Medium' },
    { q: 'Why should you not store passwords in localStorage?', a: 'Any JavaScript on the page (including injected XSS scripts or third-party libraries) can read it, and it is stored unencrypted on disk.', level: 'Easy' },
  ],
  practice: [
    { task: 'Using destructuring, write a function that receives an employee object and returns "Name (Dept) earns Salary" with a default dept of "General".', hint: 'Destructure in the parameter list with a default.', solution: 'const info = ({ name, dept = "General", salary }) => `${name} (${dept}) earns ${salary}`;\nconsole.log(info({ name: "Asha", salary: 65000 }));  // Asha (General) earns 65000' },
    { task: 'Merge two arrays of course names without duplicates, and update one property of an object without changing the original.', hint: 'Spread + new Set(); { ...obj, key: value }.', solution: 'const a = ["C#", "SQL"], b = ["SQL", "React"];\nconst merged = [...new Set([...a, ...b])];\nconsole.log(merged);  // [ "C#", "SQL", "React" ]\nconst s = { name: "Riya", marks: 80 };\nconst s2 = { ...s, marks: 90 };\nconsole.log(s.marks, s2.marks);  // 80 90' },
    { task: 'Write average(...nums) using rest parameters and export it from stats.js; import it in main.js.', hint: 'export function; import { average } from "./stats.js".', solution: '// stats.js\nexport function average(...nums) {\n  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;\n}\n\n// main.js\nimport { average } from "./stats.js";\nconsole.log(average(80, 90, 70));  // 80\n\n<!-- index.html -->\n<script type="module" src="main.js"></script>' },
    { task: 'Create a "visit counter" that shows how many times the page has been opened, stored in localStorage.', hint: 'Number(getItem) || 0, then +1 and setItem.', solution: 'const visits = (Number(localStorage.getItem("visits")) || 0) + 1;\nlocalStorage.setItem("visits", visits);\ndocument.body.insertAdjacentHTML("beforeend", "<p>You visited " + visits + " times</p>");' },
    { task: 'Fetch https://jsonplaceholder.typicode.com/posts?userId=1 and show the titles in a list, with a "Loading..." message and error handling.', hint: 'async function + try/catch + res.ok.', solution: 'async function loadPosts() {\n  const out = document.getElementById("out");\n  out.textContent = "Loading...";\n  try {\n    const res = await fetch("https://jsonplaceholder.typicode.com/posts?userId=1");\n    if (!res.ok) throw new Error("HTTP " + res.status);\n    const posts = await res.json();\n    out.innerHTML = "";\n    posts.forEach(({ title }) => {\n      const li = document.createElement("li");\n      li.textContent = title;\n      out.appendChild(li);\n    });\n  } catch (err) {\n    out.textContent = "Error: " + err.message;\n  }\n}\nloadPosts();' },
    { task: 'Extend the student records app with an Edit button that loads a record into the form and updates it on save.', hint: 'Keep editingId; on submit use map to replace the matching id.', solution: 'let editingId = null;\n// in render: add <button class="edit" data-id="${id}">Edit</button>\ntbody.addEventListener("click", e => {\n  if (!e.target.matches(".edit")) return;\n  const s = students.find(x => x.id === Number(e.target.dataset.id));\n  ["name", "email", "course", "marks"].forEach(k => document.getElementById(k).value = s[k]);\n  editingId = s.id;\n});\n// in submit handler:\nif (editingId !== null) {\n  students = students.map(s => s.id === editingId ? { ...s, name, email, course, marks: Number(marks) } : s);\n  editingId = null;\n} else {\n  students = [...students, record];\n}' },
  ],
  quiz: [
    { question: 'What does const [x, , z] = [1, 2, 3]; give for z?', options: ['2', '3', 'undefined', 'Error'], answer: 1, explanation: 'The empty slot skips 2, so z gets 3.' },
    { question: 'Which converts a JavaScript object into a JSON string?', options: ['JSON.parse()', 'JSON.toString()', 'JSON.stringify()', 'Object.toJSON()'], answer: 2, explanation: 'JSON.stringify serialises; JSON.parse does the reverse.' },
    { question: 'What type of value does localStorage.getItem return for an existing key?', options: ['Always a string', 'The original type', 'An object', 'A number'], answer: 0, explanation: 'Web Storage stores and returns strings only.' },
    { question: 'Which script tag is required to use import/export in the browser?', options: ['<script async>', '<script defer>', '<script lang="es6">', '<script type="module">'], answer: 3, explanation: 'type="module" enables ES module syntax.' },
    { question: 'When does fetch() reject its Promise?', options: ['On any non-200 status', 'On network failure', 'On 404 only', 'Never'], answer: 1, explanation: 'HTTP error statuses still resolve; check response.ok.' },
  ],
};
