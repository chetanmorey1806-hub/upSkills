export default {
  id: 'day-28-localstorage-todo-app',
  title: 'localStorage / sessionStorage + Mini Project: To-Do App',
  module: 'Module 4: DOM & Events',
  day: 28,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Web Storage lets your page remember data in the browser: localStorage keeps it forever (until cleared), sessionStorage only for the current tab. Today you learn the Storage API, how to save objects with JSON, and then combine everything from Module 4 into a complete To-Do app that survives a page refresh.',
  objectives: [
    'Use setItem, getItem, removeItem, clear, key and length on localStorage and sessionStorage',
    'Explain the differences between localStorage, sessionStorage and cookies',
    'Store arrays/objects safely with JSON.stringify / JSON.parse and handle missing or broken data',
    'Structure a small app as state -> render -> events -> save',
    'Build a To-Do app with add, toggle, delete, filter, clear completed and persistence',
  ],
  theory: [
    {
      heading: 'What is Web Storage?',
      content: "The **Web Storage API** gives each website a small key-value store inside the browser (about **5 MB** per origin). Both keys and values are **strings**.\n\n- **localStorage**: data stays after closing the tab or restarting the browser, until your code or the user clears it. Shared by all tabs of the same origin.\n- **sessionStorage**: data lives only for the current **tab** session. Reloading keeps it; closing the tab deletes it. Each tab has its own copy.\n\nAnalogy: localStorage is a locker you rent long-term; sessionStorage is a cloakroom ticket that is thrown away when you leave.\n\nStorage is **per origin** (protocol + domain + port): `https://shop.com` cannot read the storage of `https://blog.com`.",
      points: [
        'Synchronous and simple, but blocks the main thread: keep data small',
        'Not secure: any script on the page can read it, so never store passwords or tokens you cannot afford to leak (XSS risk)',
        'Not sent to the server automatically (cookies are)',
        'Good for: theme preference, drafts, cart, to-do lists, last visited tab',
      ],
    },
    {
      heading: 'The Storage Methods',
      content: "Both objects share the same API:\n\n- `setItem(key, value)` - save (value converted to string)\n- `getItem(key)` - read; returns **`null`** if the key does not exist\n- `removeItem(key)` - delete one key\n- `clear()` - delete everything for this origin\n- `key(index)` and `length` - loop through keys\n\nYou can also see and edit stored data in DevTools > Application > Local Storage.",
      syntax: `localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');      // 'dark'
localStorage.getItem('missing');    // null
localStorage.setItem('visits', 5);
typeof localStorage.getItem('visits'); // 'string' -> '5'
localStorage.removeItem('theme');
localStorage.clear();

sessionStorage.setItem('step', '2'); // same API, tab-only`,
      tip: 'Use `getItem/setItem` instead of `localStorage.theme = ...`. Property access works but can clash with built-in names like `length` or `key`.',
    },
    {
      heading: 'Saving Objects and Arrays with JSON',
      content: "Because storage only holds strings, saving an object directly gives `\"[object Object]\"`. Use JSON:\n\n- **Save**: `localStorage.setItem('todos', JSON.stringify(todos))`\n- **Load**: `JSON.parse(localStorage.getItem('todos'))`\n\nHandle the first visit (key missing -> `null`) and corrupted data (invalid JSON -> exception) with a default value and `try/catch`. It is also good practice to wrap storage access in try/catch because it can throw when storage is disabled (some private modes, sandboxed iframes) or full (`QuotaExceededError`).",
      syntax: `function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}
function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Could not save', err.name);
  }
}
const todos = load('todos', []);`,
    },
    {
      heading: 'localStorage vs sessionStorage vs Cookies',
      content: "- **Lifetime**: localStorage = until cleared; sessionStorage = until tab closes; cookies = until their expiry date\n- **Size**: about 5 MB vs 5 MB vs about 4 KB per cookie\n- **Sent to server**: no vs no vs yes, with every HTTP request\n- **Scope**: all tabs of the origin vs one tab vs configurable path/domain\n- **Access**: JS only vs JS only vs JS and server (HttpOnly cookies are server-only, safer for auth)\n\nThe `storage` event fires in **other tabs** of the same origin when localStorage changes, which lets you sync tabs.",
    },
    {
      heading: 'App Architecture: State -> Render -> Events -> Save',
      content: "For the To-Do app we follow a pattern that will feel very familiar when you learn React:\n\n1. **State**: one array is the single source of truth: `[{ id, text, done }]`\n2. **Render**: a function that rebuilds the list UI from the state (never read data back from the DOM)\n3. **Events**: handlers change the **state** (add/toggle/delete), then call `render()` and `save()`\n4. **Persist**: `save()` writes the state to localStorage; on page load we `load()` it\n\nWe use **event delegation** for the list (Day 26), **textContent** for safety (Day 23) and **createElement** for items (Day 24).",
      syntax: `let todos = load('todos', []);

function update(newTodos) {
  todos = newTodos;
  save('todos', todos);
  render();
}
// add:    update([...todos, { id: Date.now(), text, done: false }]);
// toggle: update(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
// delete: update(todos.filter(t => t.id !== id));`,
    },
  ],
  examples: [
    {
      title: 'Remember Theme and Visit Count',
      scenario: 'A page remembers the user\'s theme (light/dark) and counts visits. Refresh the preview (or click Run again) and the values are still there.',
      steps: [
        'Create a safe storage helper that falls back to memory if localStorage is blocked',
        'On load, read "theme" and "visits" (default light and 0)',
        'Increase visits and save; apply the theme class',
        'Toggle button switches theme and saves it',
        'Click Run again to simulate a reload',
      ],
      code: `const theme = localStorage.getItem('theme') || 'light';
const visits = Number(localStorage.getItem('visits') || 0) + 1;
localStorage.setItem('visits', visits);
document.body.classList.toggle('dark', theme === 'dark');

toggleBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
});`,
      playground: {
        html: `<h2>Preferences demo</h2>
<p id="visits"></p>
<button id="toggle">Toggle theme</button>
<button id="reset">Clear storage</button>
<p id="note"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #fff; color: #222; transition: background .3s, color .3s; }
body.dark { background: #1e1e2e; color: #eee; }
button { padding: 8px 12px; border-radius: 6px; cursor: pointer; }
#note { font-size: .85rem; color: #888; }`,
        js: `// Safe wrapper: some sandboxed previews block localStorage
const memory = {};
const store = {
  get(key) {
    try { return localStorage.getItem(key); } catch { return key in memory ? memory[key] : null; }
  },
  set(key, value) {
    try { localStorage.setItem(key, value); } catch { memory[key] = String(value); }
  },
  clear() {
    try { localStorage.clear(); } catch { Object.keys(memory).forEach(k => delete memory[k]); }
  },
};
try { localStorage.getItem('x'); } catch {
  document.getElementById('note').textContent = 'localStorage is blocked in this preview, using memory instead (data resets on reload).';
}

const theme = store.get('theme') || 'light';
const visits = Number(store.get('visits') || 0) + 1;
store.set('visits', visits);

document.body.classList.toggle('dark', theme === 'dark');
document.getElementById('visits').textContent = 'You have opened this page ' + visits + ' time(s). Theme: ' + theme;
console.log('visits =', visits, typeof store.get('visits'));

document.getElementById('toggle').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  store.set('theme', isDark ? 'dark' : 'light');
  document.getElementById('visits').textContent = 'Theme saved: ' + (isDark ? 'dark' : 'light') + '. Click Run again to reload.';
});

document.getElementById('reset').addEventListener('click', () => {
  store.clear();
  document.body.classList.remove('dark');
  document.getElementById('visits').textContent = 'Storage cleared. Click Run again: visits start from 1.';
});`,
      },
      result: 'First run: "You have opened this page 1 time(s). Theme: light". Each time you click Run again the count increases (2, 3...). Toggle theme to dark, re-run, and the page starts dark. "Clear storage" resets everything. The console shows the visit count and "string", proving storage stores strings.',
      explanation: 'getItem returns null on the first visit, so `|| 0` and `|| "light"` provide defaults. Values come back as strings, so Number() is needed before adding. The store wrapper uses try/catch because storage access throws in some sandboxed iframes and private modes; the app still works using memory.',
    },
    {
      title: 'Saving an Array of Objects with JSON (and the [object Object] Bug)',
      scenario: 'A shopping cart must survive a reload. Show what goes wrong without JSON, and the correct save/load functions with defaults and error handling.',
      steps: [
        'Save an object directly with setItem and read it back',
        'Save the same data with JSON.stringify and read it with JSON.parse',
        'Write load(key, fallback) with try/catch and test with a missing key and broken JSON',
        'Click the buttons and watch the output',
      ],
      code: `localStorage.setItem('cart', { item: 'Pen' });
localStorage.getItem('cart');          // '[object Object]'  (data lost!)

localStorage.setItem('cart', JSON.stringify([{ item: 'Pen', qty: 2 }]));
JSON.parse(localStorage.getItem('cart'))[0].qty; // 2`,
      playground: {
        html: `<button id="wrong">1. Save object directly</button>
<button id="right">2. Save with JSON</button>
<button id="broken">3. Load broken / missing data</button>
<pre id="out">Click the buttons in order</pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { margin: 4px 4px 4px 0; padding: 6px 10px; }
pre { background: #f4f4f4; padding: 10px; border-radius: 6px; white-space: pre-wrap; }`,
        js: `const out = document.getElementById('out');
let storage;
try { localStorage.setItem('__test', '1'); localStorage.removeItem('__test'); storage = localStorage; }
catch { // fallback for sandboxed previews
  const m = {};
  storage = { getItem: k => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: k => { delete m[k]; } };
}

function load(key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (err) {
    return fallback;
  }
}

document.getElementById('wrong').addEventListener('click', () => {
  storage.setItem('cart', { item: 'Pen', qty: 2 });
  out.textContent = 'Stored value: ' + storage.getItem('cart') + '\\n(the object was converted with toString, data lost)';
});

document.getElementById('right').addEventListener('click', () => {
  const cart = [{ item: 'Pen', qty: 2 }, { item: 'Book', qty: 1 }];
  storage.setItem('cart', JSON.stringify(cart));
  const raw = storage.getItem('cart');
  const loaded = JSON.parse(raw);
  out.textContent = 'Stored string: ' + raw + '\\nLoaded: ' + loaded.length + ' items, first qty = ' + loaded[0].qty;
});

document.getElementById('broken').addEventListener('click', () => {
  storage.removeItem('wishlist');
  storage.setItem('settings', '{oops not json');
  const wishlist = load('wishlist', []);
  const settings = load('settings', { theme: 'light' });
  out.textContent = 'Missing key -> ' + JSON.stringify(wishlist) + '\\nBroken JSON -> ' + JSON.stringify(settings);
});`,
      },
      result: `Button 1: "Stored value: [object Object]" (data lost).
Button 2: "Stored string: [{"item":"Pen","qty":2},{"item":"Book","qty":1}]" and "Loaded: 2 items, first qty = 2".
Button 3: "Missing key -> []" and "Broken JSON -> {"theme":"light"}".`,
      explanation: 'setItem converts any value with String(), so an object becomes "[object Object]". JSON.stringify turns the array into a real JSON string that JSON.parse can rebuild. load() returns the fallback for a missing key (null) and catches the SyntaxError from broken JSON so the app never crashes.',
    },
    {
      title: 'Mini Project: To-Do App with Filters and Persistence',
      scenario: 'Build a complete To-Do app: add tasks, mark done, delete, filter All/Active/Completed, show items left, clear completed, and keep everything after reload using localStorage.',
      steps: [
        'HTML: a form (input + Add), filter buttons, an empty <ul>, a footer with count and "Clear completed"',
        'State: todos array loaded from storage, and the current filter',
        'render(): filter the todos, rebuild the <ul> with createElement, update the count and active filter button',
        'Events: form submit adds; ONE delegated click on the <ul> handles toggle and delete; filter buttons change the filter',
        'After every change: save() then render(). Add tasks, refresh with Run, and they are still there',
      ],
      code: `let todos = load('todos-v1', []);
let filter = 'all';

function setTodos(next) {
  todos = next;
  save('todos-v1', todos);
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  setTodos([...todos, { id: Date.now(), text, done: false }]);
  input.value = '';
});

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.target.matches('.toggle')) setTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  if (e.target.matches('.delete')) setTodos(todos.filter(t => t.id !== id));
});`,
      playground: {
        html: `<div class="app">
  <h1>My To-Dos</h1>
  <form id="todo-form">
    <input id="todo-input" placeholder="What needs to be done?" autocomplete="off" maxlength="80">
    <button type="submit">Add</button>
  </form>
  <div class="filters">
    <button data-filter="all" class="active">All</button>
    <button data-filter="active">Active</button>
    <button data-filter="completed">Completed</button>
  </div>
  <ul id="todo-list"></ul>
  <p id="empty">Nothing here yet. Add a task above!</p>
  <footer>
    <span id="count">0 items left</span>
    <button id="clear-completed">Clear completed</button>
  </footer>
  <small id="storage-note"></small>
</div>`,
        css: `* { box-sizing: border-box; }
body { font-family: system-ui, sans-serif; background: #f2f4f8; margin: 0; padding: 16px; }
.app { max-width: 420px; margin: auto; background: white; border-radius: 12px; padding: 16px; box-shadow: 0 4px 16px #0001; }
h1 { margin-top: 0; font-size: 1.4rem; }
form { display: flex; gap: 8px; }
#todo-input { flex: 1; min-width: 0; padding: 8px; border: 1px solid #ccc; border-radius: 6px; }
button { cursor: pointer; border: 1px solid #ccc; background: white; border-radius: 6px; padding: 6px 10px; }
form button { background: #4f46e5; color: white; border-color: #4f46e5; }
.filters { display: flex; gap: 6px; margin: 12px 0; flex-wrap: wrap; }
.filters .active { background: #eef; border-color: #4f46e5; color: #4f46e5; }
#todo-list { list-style: none; padding: 0; margin: 0; }
#todo-list li { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
#todo-list li span { flex: 1; word-break: break-word; }
#todo-list li.done span { text-decoration: line-through; color: #999; }
.delete { border: none; color: crimson; font-size: 1.1rem; }
#empty { color: #888; text-align: center; }
footer { display: flex; justify-content: space-between; align-items: center; margin-top: 12px; font-size: .9rem; }
#storage-note { color: #a66; }`,
        js: `// ---------- storage (with fallback for sandboxed previews) ----------
const KEY = 'todos-v1';
let canStore = true;
try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); } catch { canStore = false; }
if (!canStore) {
  document.getElementById('storage-note').textContent = 'Note: storage is blocked in this preview, so tasks reset on reload. Works normally in a real page.';
}

function load() {
  if (!canStore) return [];
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
function save() {
  if (canStore) localStorage.setItem(KEY, JSON.stringify(todos));
}

// ---------- state ----------
let todos = load();
let filter = 'all';

// ---------- DOM ----------
const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('count');
const empty = document.getElementById('empty');
const filters = document.querySelector('.filters');

// ---------- render ----------
function render() {
  const visible = todos.filter(t =>
    filter === 'active' ? !t.done : filter === 'completed' ? t.done : true
  );

  const fragment = document.createDocumentFragment();
  visible.forEach(t => {
    const li = document.createElement('li');
    li.dataset.id = t.id;
    li.classList.toggle('done', t.done);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'toggle';
    checkbox.checked = t.done;
    checkbox.setAttribute('aria-label', 'Mark ' + t.text + ' as done');

    const span = document.createElement('span');
    span.textContent = t.text; // safe: no innerHTML with user text

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = 'x';
    del.setAttribute('aria-label', 'Delete ' + t.text);

    li.append(checkbox, span, del);
    fragment.append(li);
  });
  list.replaceChildren(fragment);

  const left = todos.filter(t => !t.done).length;
  count.textContent = left + (left === 1 ? ' item left' : ' items left');
  empty.hidden = visible.length > 0;
  filters.querySelectorAll('button').forEach(b =>
    b.classList.toggle('active', b.dataset.filter === filter)
  );
}

function setTodos(next) {
  todos = next;
  save();
  render();
}

// ---------- events ----------
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  setTodos([...todos, { id: Date.now(), text, done: false }]);
  input.value = '';
  input.focus();
});

list.addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  const id = Number(li.dataset.id);
  if (e.target.matches('.toggle')) {
    setTodos(todos.map(t => (t.id === id ? { ...t, done: !t.done } : t)));
  } else if (e.target.matches('.delete')) {
    setTodos(todos.filter(t => t.id !== id));
  }
});

filters.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-filter]');
  if (!btn) return;
  filter = btn.dataset.filter;
  render();
});

document.getElementById('clear-completed').addEventListener('click', () => {
  setTodos(todos.filter(t => !t.done));
});

// seed example tasks on the very first visit
if (todos.length === 0 && !(canStore && localStorage.getItem(KEY))) {
  todos = [
    { id: 1, text: 'Learn localStorage', done: true },
    { id: 2, text: 'Build the To-Do app', done: false },
  ];
  save();
}
render();`,
      },
      result: 'The app starts with two sample tasks ("Learn localStorage" crossed out, "Build the To-Do app") and "1 item left". Typing a task and pressing Enter/Add appends it; ticking the checkbox crosses it out and updates the count; x deletes it. Active/Completed filter the list (the active filter button is highlighted). "Clear completed" removes all done tasks. Click Run again: your tasks are still there (when the preview allows localStorage).',
      explanation: 'The todos array is the single source of truth; the DOM is always rebuilt from it by render(), so the screen can never get out of sync with the data. Every change goes through setTodos(), which saves to localStorage and re-renders. One delegated listener on the <ul> handles all current and future items. Immutable updates (spread, map, filter) prepare you for React state. textContent keeps user-typed tasks safe from XSS.',
    },
  ],
  interview: [
    { q: 'Difference between localStorage and sessionStorage?', a: 'Both store string key/value pairs per origin (~5 MB) with the same API. localStorage persists until cleared and is shared across tabs; sessionStorage lasts only for the tab session and is separate for each tab.', level: 'Easy' },
    { q: 'Difference between localStorage and cookies?', a: 'Cookies are small (~4 KB), have expiry dates, and are sent to the server with every request (and can be HttpOnly). localStorage is larger (~5 MB), never sent automatically, and only accessible from JavaScript.', level: 'Medium' },
    { q: 'What is the output?\nlocalStorage.setItem("n", 10);\nconsole.log(localStorage.getItem("n") + 5);', a: '105. Values are stored as strings, so "10" + 5 concatenates. Use Number(localStorage.getItem("n")) + 5 for 15.', level: 'Easy' },
    { q: 'What is the output?\nlocalStorage.setItem("u", { name: "A" });\nconsole.log(localStorage.getItem("u"));', a: '[object Object]. The object is converted to a string with toString. Use JSON.stringify to save and JSON.parse to read.', level: 'Easy' },
    { q: 'What does getItem return for a missing key? And JSON.parse of that?', a: 'getItem returns null. JSON.parse(null) returns null too (null is converted to the string "null"), so you still need a fallback, e.g. JSON.parse(raw) ?? [].', level: 'Medium' },
    { q: 'Is it safe to store a JWT or password in localStorage?', a: 'Not for passwords ever. Tokens in localStorage can be stolen by any XSS script on the page. Sensitive tokens are safer in HttpOnly, Secure, SameSite cookies.', level: 'Medium' },
    { q: 'When can localStorage throw an error?', a: 'When storage is full (QuotaExceededError), when it is disabled (some privacy modes, browser settings, sandboxed iframes without allow-same-origin -> SecurityError). Wrap access in try/catch.', level: 'Hard' },
    { q: 'What is the storage event?', a: 'An event fired on window in OTHER tabs/windows of the same origin when localStorage changes. e.key, e.oldValue and e.newValue describe the change. Used to sync state across tabs.', level: 'Hard' },
    { q: 'Why render the to-do list from an array instead of reading data from the DOM?', a: 'A single source of truth (state) avoids the UI and data getting out of sync, makes saving/loading trivial (JSON of the array), and makes features like filtering and counts simple. This is the core idea behind React.', level: 'Medium' },
    { q: 'Is localStorage synchronous or asynchronous?', a: 'Synchronous: each call blocks the main thread until done. Fine for small data; for large data use IndexedDB (asynchronous).', level: 'Medium' },
    { q: 'How do you list all keys in localStorage?', a: 'Object.keys(localStorage), or loop for (let i = 0; i < localStorage.length; i++) localStorage.key(i).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a notes textarea that auto-saves to localStorage on every input and restores the text on page load. Show "Saved at <time>" after each save.',
      hint: 'textarea.value = localStorage.getItem("note") ?? ""; on input setItem and update the label.',
      solution: `<textarea id="note" rows="6" cols="40"></textarea>
<p id="status"></p>
<script>
const note = document.getElementById('note');
const statusEl = document.getElementById('status');
note.value = localStorage.getItem('note') ?? '';
note.addEventListener('input', () => {
  localStorage.setItem('note', note.value);
  statusEl.textContent = 'Saved at ' + new Date().toLocaleTimeString();
});
</script>`,
    },
    {
      task: 'Use sessionStorage to remember which step (1, 2 or 3) of a multi-step form the user is on. Reloading keeps the step; opening a new tab starts at step 1.',
      hint: 'let step = Number(sessionStorage.getItem("step")) || 1;',
      solution: `<h2 id="title"></h2>
<button id="prev">Back</button>
<button id="next">Next</button>
<script>
let step = Number(sessionStorage.getItem('step')) || 1;
function show() {
  document.getElementById('title').textContent = 'Step ' + step + ' of 3';
  sessionStorage.setItem('step', step);
}
document.getElementById('next').addEventListener('click', () => { step = Math.min(3, step + 1); show(); });
document.getElementById('prev').addEventListener('click', () => { step = Math.max(1, step - 1); show(); });
show();
</script>`,
    },
    {
      task: 'Extend the To-Do app: double-click a task text to edit it (replace the span with an input; Enter saves, Escape cancels). Save to localStorage.',
      hint: 'Delegate a dblclick listener on the list; on Enter call setTodos(todos.map(...)) with the new text.',
      solution: `// Add to the To-Do app JS
list.addEventListener('dblclick', (e) => {
  const span = e.target.closest('li span');
  if (!span) return;
  const li = span.closest('li');
  const id = Number(li.dataset.id);
  const editor = document.createElement('input');
  editor.value = span.textContent;
  span.replaceWith(editor);
  editor.focus();
  editor.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && editor.value.trim()) {
      setTodos(todos.map(t => (t.id === id ? { ...t, text: editor.value.trim() } : t)));
    } else if (ev.key === 'Escape') {
      render();
    }
  });
});`,
    },
    {
      task: 'Build a "Recently viewed products" list: clicking a product button adds its name to the front of a list saved in localStorage, without duplicates, keeping only the last 5.',
      hint: 'recent = [name, ...recent.filter(n => n !== name)].slice(0, 5);',
      solution: `<button class="p">Laptop</button><button class="p">Phone</button><button class="p">Watch</button>
<button class="p">Camera</button><button class="p">Tablet</button><button class="p">Speaker</button>
<ol id="recent"></ol>
<script>
let recent = JSON.parse(localStorage.getItem('recent') || '[]');
function render() {
  const ol = document.getElementById('recent');
  ol.replaceChildren(...recent.map(n => { const li = document.createElement('li'); li.textContent = n; return li; }));
}
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.p');
  if (!btn) return;
  const name = btn.textContent;
  recent = [name, ...recent.filter(n => n !== name)].slice(0, 5);
  localStorage.setItem('recent', JSON.stringify(recent));
  render();
});
render();
</script>`,
    },
  ],
  quiz: [
    { question: 'What does localStorage.getItem("unknown") return?', options: ['undefined', '""', 'null', 'It throws an error'], answer: 2, explanation: 'Missing keys return null.' },
    { question: 'How long does sessionStorage data last?', options: ['Until the browser tab is closed', 'Forever', '24 hours', 'Until the page is reloaded'], answer: 0, explanation: 'It survives reloads but is cleared when the tab closes.' },
    { question: 'How should you save an array in localStorage?', options: ['localStorage.setItem("a", arr)', 'localStorage.a = arr', 'localStorage.push(arr)', 'localStorage.setItem("a", JSON.stringify(arr))'], answer: 3, explanation: 'Storage only holds strings, so serialize with JSON.' },
    { question: 'Which is TRUE about localStorage?', options: ['It is sent to the server with every request', 'It is shared between all websites', 'It stores strings per origin and persists until cleared', 'It can store up to 4 KB'], answer: 2, explanation: 'Per-origin, string-only, persistent, ~5 MB.' },
    { question: 'In the To-Do app, why use one listener on the <ul> instead of one per item?', options: ['Event delegation handles items added later with a single listener', 'Buttons cannot have listeners', 'It is required by localStorage', 'It makes items bubble faster'], answer: 0, explanation: 'Delegation covers dynamic items and uses less memory.' },
  ],
};
