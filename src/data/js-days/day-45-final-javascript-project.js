const projectHtml = `<div class="app">
  <header>
    <h1>Team Directory</h1>
    <p class="sub">Final JavaScript project &middot; data from JSONPlaceholder</p>
  </header>

  <section class="toolbar">
    <input id="search" type="search" placeholder="Search name, email or city..." aria-label="Search users">
    <select id="sort" aria-label="Sort users">
      <option value="name">Sort: Name (A-Z)</option>
      <option value="progress">Sort: Task progress</option>
      <option value="city">Sort: City</option>
    </select>
    <label class="fav-only"><input id="favOnly" type="checkbox"> Favourites only</label>
  </section>

  <p id="status" role="status"></p>
  <ul id="users" class="grid"></ul>

  <footer id="summary"></footer>
</div>`;

const projectCss = `:root { --brand: #3949ab; --ok: #2e7d32; --bad: #c62828; --muted: #666; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; background: #f4f6fb; color: #222; }
.app { max-width: 900px; margin: 0 auto; padding: 16px; }
header h1 { margin: 0; color: var(--brand); }
.sub { margin: 4px 0 16px; color: var(--muted); }
.toolbar { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-bottom: 8px; }
.toolbar input[type=search] { flex: 1 1 220px; padding: 10px; border: 1px solid #ccd; border-radius: 8px; font-size: 15px; }
.toolbar select { padding: 9px; border-radius: 8px; border: 1px solid #ccd; }
.fav-only { font-size: 14px; }
#status { min-height: 1.4em; font-weight: 600; }
#status.error { color: var(--bad); }
#status.loading { color: #b26a00; }
.grid { list-style: none; padding: 0; display: grid; gap: 12px; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); }
.card { background: #fff; border-radius: 12px; padding: 14px; box-shadow: 0 2px 6px rgba(0,0,0,.08); position: relative; }
.card h3 { margin: 0 0 4px; font-size: 17px; padding-right: 32px; }
.card p { margin: 2px 0; font-size: 14px; color: var(--muted); }
.bar { height: 8px; background: #e3e6f0; border-radius: 4px; margin-top: 8px; overflow: hidden; }
.bar span { display: block; height: 100%; background: var(--ok); }
.fav { position: absolute; top: 10px; right: 10px; border: 0; background: none; font-size: 22px; cursor: pointer; color: #bbb; }
.fav[aria-pressed=true] { color: #f9a825; }
.retry { margin-left: 8px; }
footer { color: var(--muted); font-size: 14px; margin-top: 12px; }`;

const projectJs = `// ===================== utils (pure helpers) =====================
const debounce = (fn, delay) => {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); };
};
const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// ===================== storage (localStorage with safety) =====================
const storage = {
  load(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
  },
  save(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode / blocked */ }
  },
};

// ===================== api (fetch + error handling) =====================
const API = 'https://jsonplaceholder.typicode.com';
async function getJSON(path, signal) {
  const res = await fetch(API + path, { signal });
  if (!res.ok) throw new Error('HTTP ' + res.status + ' for ' + path);
  return res.json();
}

// ===================== model (class with private state) =====================
class UserStore {
  #users = [];
  #favs;

  constructor(favIds = []) { this.#favs = new Set(favIds); }

  setData(users, todos) {
    // group todos by userId with reduce, then attach progress to each user (immutably)
    const stats = todos.reduce((acc, t) => {
      acc[t.userId] ??= { done: 0, total: 0 };
      acc[t.userId].total++;
      if (t.completed) acc[t.userId].done++;
      return acc;
    }, {});
    this.#users = users.map((u) => {
      const s = stats[u.id] ?? { done: 0, total: 0 };
      return { ...u, city: u.address?.city ?? '-', progress: s.total ? Math.round((s.done / s.total) * 100) : 0 };
    });
  }

  toggleFav(id) {
    this.#favs.has(id) ? this.#favs.delete(id) : this.#favs.add(id);
    return [...this.#favs];
  }
  isFav(id) { return this.#favs.has(id); }
  get count() { return this.#users.length; }

  query({ text = '', sort = 'name', favOnly = false } = {}) {
    const q = text.trim().toLowerCase();
    const sorters = {
      name: (a, b) => a.name.localeCompare(b.name),
      city: (a, b) => a.city.localeCompare(b.city),
      progress: (a, b) => b.progress - a.progress,
    };
    return this.#users
      .filter((u) => !favOnly || this.isFav(u.id))
      .filter((u) => !q || [u.name, u.email, u.city].some((f) => f.toLowerCase().includes(q)))
      .toSorted(sorters[sort]);
  }
}

// ===================== view (DOM rendering) =====================
const $ = (sel) => document.querySelector(sel);
const store = new UserStore(storage.load('favs', []));
const state = { text: '', sort: 'name', favOnly: false };

function setStatus(text, type = '') {
  $('#status').className = type;
  $('#status').innerHTML = text;
}

function render() {
  const users = store.query(state);
  $('#users').innerHTML = users.map((u) => \`
    <li class="card">
      <button class="fav" data-id="\${u.id}" aria-pressed="\${store.isFav(u.id)}" title="Toggle favourite">&#9733;</button>
      <h3>\${escapeHtml(u.name)}</h3>
      <p>\${escapeHtml(u.email)}</p>
      <p>\${escapeHtml(u.city)} &middot; \${escapeHtml(u.company.name)}</p>
      <p>Tasks done: \${u.progress}%</p>
      <div class="bar"><span style="width:\${u.progress}%"></span></div>
    </li>\`).join('');
  if (store.count) setStatus(users.length ? '' : 'No users match your filters.');
  $('#summary').textContent = 'Showing ' + users.length + ' of ' + store.count + ' users';
}

// ===================== controller (events + async flow) =====================
async function init() {
  setStatus('Loading team...', 'loading');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  try {
    const [users, todos] = await Promise.all([
      getJSON('/users', controller.signal),
      getJSON('/todos', controller.signal),
    ]);
    store.setData(users, todos);
    setStatus('');
    render();
  } catch (err) {
    const msg = err.name === 'AbortError' ? 'Request timed out.' : err.message;
    setStatus('Could not load data: ' + escapeHtml(msg) + ' <button class="retry">Retry</button>', 'error');
  } finally {
    clearTimeout(timer);
  }
}

$('#search').addEventListener('input', debounce((e) => { state.text = e.target.value; render(); }, 250));
$('#sort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
$('#favOnly').addEventListener('change', (e) => { state.favOnly = e.target.checked; render(); });

// Event delegation: one listener for all favourite buttons (and the retry button)
document.addEventListener('click', (e) => {
  const favBtn = e.target.closest('.fav');
  if (favBtn) {
    storage.save('favs', store.toggleFav(Number(favBtn.dataset.id)));
    render();
  }
  if (e.target.closest('.retry')) init();
});

init();`;

const coreLogic = `// Core logic of an Expense Tracker - pure, testable, no DOM
class ExpenseTracker {
  #expenses = [];
  #nextId = 1;

  add(title, amount, category, date) {
    if (!title.trim()) throw new Error('Title is required');
    if (!(amount > 0)) throw new RangeError('Amount must be positive');
    const expense = Object.freeze({ id: this.#nextId++, title, amount, category, date });
    this.#expenses = [...this.#expenses, expense];      // immutable update
    return expense;
  }

  remove(id) {
    this.#expenses = this.#expenses.filter((e) => e.id !== id);
  }

  get total() {
    return this.#expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  byCategory() {
    return this.#expenses.reduce((acc, { category, amount }) => {
      acc[category] = (acc[category] ?? 0) + amount;
      return acc;
    }, {});
  }

  byMonth() {
    const map = new Map();
    for (const e of this.#expenses) {
      const month = e.date.slice(0, 7);                  // "2024-08"
      map.set(month, (map.get(month) ?? 0) + e.amount);
    }
    return Object.fromEntries(map);
  }

  topN(n) {
    return this.#expenses.toSorted((a, b) => b.amount - a.amount).slice(0, n).map((e) => e.title);
  }

  *[Symbol.iterator]() { yield* this.#expenses; }
}

const rupees = (n) => 'Rs. ' + n.toLocaleString('en-IN');
const tracker = new ExpenseTracker();
tracker.add('Groceries', 2450, 'Food', '2024-08-02');
tracker.add('Metro card', 500, 'Travel', '2024-08-05');
const movie = tracker.add('Movie', 700, 'Fun', '2024-08-10');
tracker.add('Rent', 15000, 'Home', '2024-09-01');
tracker.add('Dinner', 1200, 'Food', '2024-09-03');

console.log('Total:', rupees(tracker.total));
console.log('By category:', tracker.byCategory());
console.log('By month:', tracker.byMonth());
console.log('Top 2:', tracker.topN(2));

tracker.remove(movie.id);
console.log('After removing movie:', rupees(tracker.total), '| items:', [...tracker].length);

try { tracker.add('Free', -5, 'Misc', '2024-09-04'); } catch (e) { console.log(e.name + ':', e.message); }
try { movie.amount = 1; } catch (e) { /* frozen object: ignored or TypeError */ }
console.log('Frozen expense unchanged:', movie.amount);`;

const testA = `// PRACTICAL TEST - PART A: predict the output, then run to check
// Q1 Hoisting & TDZ
console.log('Q1:', typeof hoistedVar, typeof hoistedFn);
var hoistedVar = 1;
function hoistedFn() {}

// Q2 Closures in loops
const withVar = [], withLet = [];
for (var i = 0; i < 3; i++) withVar.push(() => i);
for (let j = 0; j < 3; j++) withLet.push(() => j);
console.log('Q2:', withVar.map((f) => f()).join(''), withLet.map((f) => f()).join(''));

// Q3 Coercion
console.log('Q3:', 1 + '2', '5' - 2, [] + [], [] == false, null == 0, null ?? 'x');

// Q4 this
const obj = {
  name: 'obj',
  regular() { return this.name; },
  arrow: () => this === obj,
  nested() { return [1].map(() => this.name)[0]; },
};
console.log('Q4:', obj.regular(), obj.arrow(), obj.nested());

// Q5 References vs values
const a = { n: 1 };
const b = a;
b.n = 2;
let x = 1;
let y = x;
y = 2;
console.log('Q5:', a.n, x);

// Q6 Array methods
console.log('Q6:', [1, 2, 3, 4].filter((n) => n % 2).map((n) => n * 10).reduce((s, n) => s + n, 0),
  [10, 1, 2].sort(), ['b', 'a'].toSorted());

// Q7 Destructuring & spread
const { p = 5, q = 6, ...others } = { q: 0, r: 1, s: 2 };
console.log('Q7:', p, q, others);

// Q8 Event loop (async - prints last)
console.log('Q8 start');
setTimeout(() => console.log('Q8 timeout'), 0);
Promise.resolve().then(() => console.log('Q8 promise'));
(async () => {
  console.log('Q8 async body');
  await null;
  console.log('Q8 after await');
})();
console.log('Q8 end');`;

const testB = `// PRACTICAL TEST - PART B: coding tasks (solutions)

// B1. groupBy(array, keyFn)
const groupBy = (arr, keyFn) =>
  arr.reduce((acc, item) => ((acc[keyFn(item)] ??= []).push(item), acc), {});
console.log('B1:', groupBy(['apple', 'avocado', 'banana', 'cherry'], (w) => w[0]));

// B2. flatten deeply without .flat()
const flatten = (arr) => arr.reduce((acc, v) => acc.concat(Array.isArray(v) ? flatten(v) : v), []);
console.log('B2:', flatten([1, [2, [3, [4]], 5]]));

// B3. deep clone (objects, arrays, dates)
function deepClone(value) {
  if (value === null || typeof value !== 'object') return value;
  if (value instanceof Date) return new Date(value);
  if (Array.isArray(value)) return value.map(deepClone);
  return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, deepClone(v)]));
}
const original = { user: { tags: ['a'] }, when: new Date(0) };
const copy = deepClone(original);
copy.user.tags.push('b');
console.log('B3:', original.user.tags, copy.user.tags, copy.when instanceof Date);

// B4. memoize
function memoize(fn) {
  const cache = new Map();
  return (n) => cache.has(n) ? cache.get(n) : (cache.set(n, fn(n)), cache.get(n));
}
let calls = 0;
const slowSquare = (n) => { calls++; return n * n; };
const fastSquare = memoize(slowSquare);
fastSquare(9); fastSquare(9); fastSquare(9);
console.log('B4:', fastSquare(9), 'computed', calls, 'time(s)');

// B5. Promise.all polyfill
function promiseAll(items) {
  return new Promise((resolve, reject) => {
    const results = [];
    let done = 0;
    if (items.length === 0) return resolve(results);
    items.forEach((item, i) => {
      Promise.resolve(item).then((value) => {
        results[i] = value;                       // keep input order
        if (++done === items.length) resolve(results);
      }, reject);
    });
  });
}
const later = (ms, v) => new Promise((r) => setTimeout(() => r(v), ms));
promiseAll([later(30, 'slow'), 'plain', later(10, 'fast')]).then((r) => console.log('B5:', r));
promiseAll([later(10, 'ok'), Promise.reject(new Error('boom'))]).catch((e) => console.log('B5 reject:', e.message));`;

const revision = `// Rapid revision: one line per module, run to recall the key behaviour
const log = (label, ...v) => console.log(label.padEnd(26), ...v);

// Module 1 - Basics
log('M1 typeof null / NaN:', typeof null, typeof NaN);
log('M1 0.1 + 0.2 === 0.3:', 0.1 + 0.2 === 0.3, (0.1 + 0.2).toFixed(2));
// Module 2 - Functions & Arrays
const counter = (() => { let c = 0; return () => ++c; })();
counter(); counter();
log('M2 closure counter:', counter());
log('M2 [1,2,3].includes(2):', [1, 2, 3].includes(2));
// Module 3 - Objects & Data structures
log('M3 JSON round trip:', JSON.parse(JSON.stringify({ d: new Date(0), u: undefined })));
log('M3 Set dedupe:', [...new Set([1, 1, 2, 3, 3])]);
// Module 4 - DOM (browser only): querySelector, addEventListener, event delegation
log('M4 remember:', 'e.target vs e.currentTarget, preventDefault, stopPropagation');
// Module 5 - Async
log('M5 order:', 'sync -> microtasks (promises/await) -> macrotasks (timers)');
// Module 6 - Advanced
class A { static who() { return 'A'; } hi() { return 'hi from ' + this.constructor.name; } }
class B extends A {}
log('M6 class/proto:', new B().hi(), Object.getPrototypeOf(B) === A);
log('M6 bind partial:', ((a, b) => a * b).bind(null, 3)(4));
log('M6 regex test:', /^[6-9]\\d{9}$/.test('9876543210'));
// Module 7 - Professional
function* ids() { let i = 1; while (true) yield i++; }
const gen = ids();
log('M7 generator:', gen.next().value, gen.next().value);
log('M7 ?? vs ||:', 0 ?? 'x', 0 || 'x');`;

export default {
  id: 'day-45-final-javascript-project',
  title: 'Final JavaScript Project, Practical Test, Interview Questions',
  module: 'Module 7: Professional JavaScript',
  day: 45,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'The capstone day: build a complete Team Directory app that combines fetch, async/await, classes, closures, debounce, event delegation and localStorage; take a two-part practical test (output prediction + coding tasks); and revise with 30 interview questions including output-based ones.',
  objectives: [
    'Plan and build a complete multi-feature JavaScript application from scratch',
    'Organise code into layers: utils, storage, API, model, view and controller',
    'Combine async data loading, state, filtering/sorting, persistence and error handling',
    'Predict the output of tricky code involving hoisting, closures, coercion, this and the event loop',
    'Solve classic interview coding tasks (groupBy, flatten, deep clone, memoize, Promise.all polyfill)',
  ],
  theory: [
    {
      heading: 'Final Project Brief: Team Directory',
      content:
        'You will build a **Team Directory** web app – the kind of internal dashboard companies really use.\n\n**Requirements**\n1. Load users and their to-dos from `https://jsonplaceholder.typicode.com/users` and `/todos` **in parallel**\n2. Show each user in a card: name, email, city, company and a **task-progress bar** (% of to-dos completed)\n3. **Search** by name, email or city – **debounced** so it does not re-render on every keystroke\n4. **Sort** by name, city or progress\n5. Mark users as **favourites** (star button); favourites are saved in **localStorage** and survive a refresh\n6. "Favourites only" filter\n7. Proper **loading**, **empty** and **error** states with a **Retry** button and a request **timeout**\n8. Safe rendering: escape user data before putting it in innerHTML\n\n**Concepts used** (with the day you learned them): fetch & loading states (33), Promise.all (31), async/await (32), AbortController (33), classes & #private (36), reduce/map/filter (15), closures & debounce (13, 40), event delegation (26), localStorage (28), destructuring/spread (18), optional chaining & nullish (4), template literals (6), Set (21), try/catch (29).',
    },
    {
      heading: 'Architecture: Separate the Responsibilities',
      content:
        'Even in one file, organise the code in **layers**. In a Vite project (Day 44) each layer becomes its own ES module (Day 35):\n\n- `utils.js` – small pure helpers: `debounce`, `escapeHtml`\n- `storage.js` – read/write localStorage safely (try/catch, JSON)\n- `api.js` – `getJSON(path)` with `response.ok` checks\n- `UserStore.js` – the **model**: a class that owns the data and answers queries (filter, sort, favourites). No DOM code here, so it is easy to test.\n- `view.js` – turns data into HTML\n- `main.js` – the **controller**: wires events to the store and view, runs `init()`\n\nThis is the same idea behind MVC and behind React (state → render). Keep **state** in one place (`state = { text, sort, favOnly }`) and always **re-render from state** instead of patching the DOM in many places.',
      syntax: `team-directory/
  index.html
  src/
    main.js        // controller: events + init()
    api.js         // fetch helpers
    storage.js     // localStorage helpers
    UserStore.js   // model class
    view.js        // render functions
    utils.js       // debounce, escapeHtml
    style.css`,
    },
    {
      heading: 'Build Plan (Step by Step)',
      content:
        '1. **HTML skeleton**: header, toolbar (search, sort select, favourites checkbox), status line, empty `<ul>`, footer\n2. **API**: write `getJSON()` and test it in the console\n3. **Model**: `UserStore.setData(users, todos)` computes progress with `reduce`; `query({ text, sort, favOnly })` returns a filtered, sorted **copy** (`toSorted`)\n4. **Render**: map users to card HTML with a template literal and `join("")`; escape text\n5. **Init flow**: show "Loading..." → `await Promise.all([...])` → render; `catch` shows an error with Retry; `finally` clears the timeout\n6. **Events**: debounced input, sort change, checkbox change\n7. **Favourites**: one delegated click listener; toggle in a `Set`; save the array to localStorage\n8. **Polish**: empty-state message, summary counter, accessibility (`aria-label`, `role="status"`, `aria-pressed`)\n9. **Test**: turn off the network in DevTools to see the error state; type fast to see debounce; refresh to see favourites persist',
      tip: 'Build in small steps and console.log after each one. A working simple version is better than a half-finished complex one.',
    },
    {
      heading: 'Practical Test Instructions',
      content:
        '**Time: 90 minutes. Total: 100 marks.**\n\n**Part A – Output prediction (40 marks)**: 8 questions (Q1–Q8 in Example 3). Write your answer on paper first, then run. 5 marks each; partial marks for correct reasoning.\n\n**Part B – Coding (40 marks)**: implement `groupBy`, `flatten`, `deepClone`, `memoize` and a `Promise.all` polyfill (Example 4). 8 marks each: 5 for correctness, 3 for clean code and edge cases (empty arrays, rejection, input order).\n\n**Part C – Mini feature (20 marks)**: add **one** feature to the Team Directory project, for example:\n- a "Clear favourites" button\n- show the number of pending tasks on each card\n- remember the last search text and sort order in localStorage\n- a dark-mode toggle saved in localStorage\n\nPass mark: 60. Score 85+ = interview ready.',
    },
    {
      heading: 'Course Revision Map',
      content:
        '- **Module 1 Basics**: var/let/const, 7 primitives + objects, typeof, `==` vs `===`, truthy/falsy, strings, numbers, conditionals\n- **Module 2 Functions & Arrays**: loops, declarations vs expressions vs arrows, default/rest/spread, scope, hoisting & TDZ, **closures**, array methods (map/filter/reduce)\n- **Module 3 Objects & Data**: objects, `this` in methods, destructuring, JSON, Date, Set/Map/WeakMap\n- **Module 4 DOM & Events**: selecting, changing, creating elements, addEventListener, **bubbling/capturing/delegation**, forms, localStorage\n- **Module 5 Async**: try/catch, timers, callbacks → **promises** → **async/await**, fetch, **event loop**\n- **Module 6 Advanced**: ES modules, classes, **prototypes**, call/apply/bind, HOFs/currying/purity, debounce/throttle, regex\n- **Module 7 Professional**: iterators/generators/symbols, browser APIs, tooling (npm, Vite, ESLint, Prettier), modern ES features',
    },
    {
      heading: 'How to Answer Interview Questions',
      content:
        '1. **Define** the concept in one sentence ("A closure is a function that remembers variables from the scope where it was created").\n2. **Explain why** it matters or where it is used (data privacy, debounce, React hooks).\n3. **Show a tiny example** – write 3–5 lines of code.\n4. Mention a **pitfall** (var in loops, losing this, forgetting await in forEach).\n\nFor **output questions**: go line by line, write the call stack and the microtask/macrotask queues on paper, and remember coercion rules (`+` with a string concatenates, other math operators convert to numbers).\n\n**Next steps after this course**: build 2–3 portfolio projects (weather app, expense tracker, quiz app), learn **TypeScript**, then **React** (the React course in this series), and practise on LeetCode/Frontend Mentor.',
    },
  ],
  examples: [
    {
      title: 'Final Project: Team Directory app',
      scenario: 'A complete app that loads users and to-dos, shows progress cards, and supports debounced search, sorting, favourites with localStorage, and loading/error states.',
      steps: [
        'Create the HTML skeleton: header, toolbar (search, sort, favourites checkbox), status, list and footer',
        'Add the CSS: a responsive card grid with auto-fill/minmax and a progress bar',
        'Write the utils, storage and api layers (debounce, escapeHtml, safe localStorage, getJSON)',
        'Write the UserStore class: setData() computes progress with reduce, query() filters and sorts a copy',
        'Write render() and setStatus(), then init() with Promise.all, AbortController timeout, try/catch/finally',
        'Wire events: debounced search, sort change, favourites checkbox and one delegated click listener',
        'Click Run, try searching "south", sort by progress, star a few users, tick "Favourites only", then refresh',
      ],
      code: projectJs,
      playground: { html: projectHtml, css: projectCss, js: projectJs },
      result:
        '"Loading team..." appears briefly, then 10 user cards (Chelsey Dietrich, Clementina DuBuque, Clementine Bauch, Ervin Howell, Glenna Reichert, Kurtis Weissnat, Leanne Graham, ...) each with city, company and a green progress bar (e.g. Leanne Graham: Tasks done: 55%). Typing "south" shows only users whose city contains it (e.g. South Elvis, South Christy). Sorting by progress puts the highest % first. Stars turn yellow, "Favourites only" filters them, and they are still starred after a refresh. With the network off you see a red "Could not load data: ..." message with a Retry button. Footer: "Showing 10 of 10 users".',
      explanation:
        'The UserStore class keeps data private and returns new sorted arrays (no mutation). render() always rebuilds the list from state, so every control simply updates state and calls render(). One delegated listener handles all star buttons, even ones created later. escapeHtml protects innerHTML from injected markup. Promise.all loads both endpoints in parallel, AbortController enforces a timeout, and finally always clears the timer.',
    },
    {
      title: 'Project core logic: an Expense Tracker model (pure, testable)',
      scenario: 'Before building any UI, write and test the business logic in plain JavaScript.',
      steps: [
        'Create class ExpenseTracker with #private expenses and an id counter',
        'add() validates input, freezes each expense and updates the array immutably',
        'Add total (getter), byCategory() with reduce, byMonth() with Map, topN() with toSorted',
        'Make the class iterable with a generator method, click Run',
      ],
      code: coreLogic,
      playground: { js: coreLogic },
      result:
        "Total: Rs. 19,850\nBy category: { Food: 3650, Travel: 500, Fun: 700, Home: 15000 }\nBy month: { '2024-08': 3650, '2024-09': 16200 }\nTop 2: [ 'Rent', 'Groceries' ]\nAfter removing movie: Rs. 19,150 | items: 4\nRangeError: Amount must be positive\nFrozen expense unchanged: 700",
      explanation:
        'Because the model has no DOM code, you can test every method with console.log (or a test runner like Vitest). toLocaleString("en-IN") formats with Indian digit grouping. Object.freeze prevents accidental edits, and the generator makes [...tracker] work. Plugging this model into a form and list later is just the view layer.',
    },
    {
      title: 'Practical Test Part A: predict the output',
      scenario: 'Eight questions covering hoisting, closures, coercion, this, references, array methods, destructuring and the event loop.',
      steps: [
        'Read each question block and write your predicted output on paper',
        'Remember: Q8 is asynchronous, so some of its lines print after everything else',
        'Click Run and compare; give yourself 5 marks per fully correct line',
      ],
      code: testA,
      playground: { js: testA },
      result:
        "Q1: undefined function\nQ2: 333 012\nQ3: 12 3  true false x\nQ4: obj false obj\nQ5: 2 1\nQ6: 40 [ 1, 10, 2 ] [ 'a', 'b' ]\nQ7: 5 0 { r: 1, s: 2 }\nQ8 start\nQ8 async body\nQ8 end\nQ8 promise\nQ8 after await\nQ8 timeout",
      explanation:
        'Q1: var is hoisted as undefined, function declarations are hoisted completely. Q2: var has ONE shared i (3 after the loop); let creates a new j for every iteration. Q3: 1 + "2" concatenates to "12"; "5" - 2 converts to numbers = 3; [] + [] is an empty string (the double space); [] == false → "" == 0 → true; null == 0 is false (null only loosely equals undefined); null ?? "x" gives "x". Q4: regular method → this is obj; the arrow function takes this from the outer scope, so it is NOT obj (false); the arrow inside nested() borrows this from nested, so obj. Q5: objects are copied by reference, primitives by value. Q6: odd numbers 1, 3 → 10 + 30 = 40; default sort compares strings, so 10 comes before 2. Q7: defaults apply only for undefined, so p = 5 but q stays 0. Q8: sync code (start, async body up to await, end) → microtasks in queue order (promise, after await) → the timer last.',
    },
    {
      title: 'Practical Test Part B: classic coding tasks',
      scenario: 'Implement five functions that are frequently asked in JavaScript interviews.',
      steps: [
        'B1 groupBy with reduce and ??=',
        'B2 recursive flatten with reduce + concat',
        'B3 deepClone handling primitives, Date, arrays and objects',
        'B4 memoize with a Map cache',
        'B5 Promise.all polyfill that keeps input order and rejects fast, then click Run',
      ],
      code: testB,
      playground: { js: testB },
      result:
        "B1: { a: [ 'apple', 'avocado' ], b: [ 'banana' ], c: [ 'cherry' ] }\nB2: [ 1, 2, 3, 4, 5 ]\nB3: [ 'a' ] [ 'a', 'b' ] true\nB4: 81 computed 1 time(s)\nB5 reject: boom\nB5: [ 'slow', 'plain', 'fast' ]",
      explanation:
        'groupBy creates each bucket on demand with ??=. flatten recurses into nested arrays. deepClone copies every level, so pushing to the copy does not affect the original. memoize computes 9*9 only once. The polyfill stores results by index (input order, not finishing order) and calls reject on the first failure – that is why "B5 reject" prints before the slower successful result.',
    },
    {
      title: 'Rapid revision script: one concept per module',
      scenario: 'A quick runnable recap to refresh the most-asked behaviours from all seven modules before an interview.',
      steps: [
        'Read each line and say the expected value out loud',
        'Click Run',
        'For every line you got wrong, go back to that module\'s day and redo one practice task',
      ],
      code: revision,
      playground: { js: revision },
      result:
        "M1 typeof null / NaN:      object number\nM1 0.1 + 0.2 === 0.3:      false 0.30\nM2 closure counter:        3\nM2 [1,2,3].includes(2):    true\nM3 JSON round trip:        { d: '1970-01-01T00:00:00.000Z' }\nM3 Set dedupe:             [ 1, 2, 3 ]\nM4 remember:               e.target vs e.currentTarget, preventDefault, stopPropagation\nM5 order:                  sync -> microtasks (promises/await) -> macrotasks (timers)\nM6 class/proto:            hi from B true\nM6 bind partial:           12\nM6 regex test:             true\nM7 generator:              1 2\nM7 ?? vs ||:               0 x",
      explanation:
        'typeof null is a historic bug ("object"). Floating-point math is not exact. JSON turns Dates into strings and drops undefined. Set removes duplicates. Classes link constructors through prototypes (Object.getPrototypeOf(B) === A). ?? only replaces null/undefined, so 0 stays.',
    },
  ],
  interview: [
    { q: 'What is the difference between var, let and const?', a: 'var is function-scoped, hoisted and initialised as undefined, and can be redeclared. let and const are block-scoped and in the TDZ until declared. const cannot be reassigned (but objects it points to can be mutated).', level: 'Easy' },
    { q: 'What is a closure? Give a real use case.', a: 'A function bundled with references to variables from the scope where it was created, so it can use them after that scope finished. Uses: private counters, debounce/throttle timers, memoize caches, function factories, React hooks.', level: 'Medium' },
    { q: 'Explain == vs ===.', a: '=== compares value and type without conversion. == converts types first (coercion), causing surprises like "0" == false → true. Always prefer ===.', level: 'Easy' },
    { q: 'What is hoisting?', a: 'During the creation phase, declarations are registered before code runs. Function declarations are fully hoisted; var is hoisted as undefined; let/const/class are hoisted but uninitialised (TDZ → ReferenceError if accessed early).', level: 'Medium' },
    { q: 'Explain event bubbling, capturing and delegation.', a: 'Events travel down from window to the target (capturing), then back up (bubbling). Delegation attaches one listener to a parent and uses event.target/closest() to handle events from many (even future) children.', level: 'Medium' },
    { q: 'What are promises and how do they improve on callbacks?', a: 'Objects representing a future value with states pending/fulfilled/rejected. They allow flat chaining, central error handling with catch, and combinators like Promise.all – avoiding nested callback hell.', level: 'Easy' },
    { q: 'Explain the event loop.', a: 'JS runs one task at a time on the call stack. Async callbacks wait in queues. After each macrotask (script, timer, event) the engine drains all microtasks (promise callbacks, await continuations), may render, then takes the next macrotask.', level: 'Medium' },
    { q: 'What is the difference between a shallow and a deep copy?', a: 'A shallow copy ({...obj}) copies top-level properties; nested objects are shared. A deep copy (structuredClone) duplicates every level.', level: 'Medium' },
    { q: 'How does this work in JavaScript?', a: 'Determined by the call site: new → new object; call/apply/bind → given object; obj.method() → obj; plain call → undefined (strict) or global. Arrow functions inherit this lexically.', level: 'Medium' },
    { q: 'What is prototypal inheritance?', a: 'Objects inherit from other objects through the [[Prototype]] link. Property lookups walk the prototype chain. Classes are syntax sugar over this mechanism.', level: 'Medium' },
    { q: 'Debounce vs throttle?', a: 'Debounce runs once after events stop for X ms (search input). Throttle runs at most once every X ms during continuous events (scroll).', level: 'Medium' },
    { q: 'What are ES modules and why use them?', a: 'Files with their own scope that share code via export/import. They avoid globals, make dependencies explicit, enable tree shaking and lazy loading with import().', level: 'Easy' },
    { q: 'How do you handle errors in async/await code?', a: 'Wrap awaits in try/catch (finally for cleanup) or attach .catch() to the returned promise. For fetch, also check response.ok because HTTP errors do not reject.', level: 'Easy' },
    { q: 'What is the difference between map, forEach, filter and reduce?', a: 'forEach just iterates (returns undefined). map returns a new array of transformed items. filter returns a new array of items that pass a test. reduce combines all items into one value.', level: 'Easy' },
    { q: 'What are generators used for?', a: 'Functions that can pause with yield and resume with next(). Used for lazy/infinite sequences, custom iterables, pagination and step-by-step control flows.', level: 'Medium' },
    { q: 'localStorage vs sessionStorage vs cookies?', a: 'localStorage persists until cleared (~5-10 MB, per origin). sessionStorage lasts for the tab session. Cookies are small (~4 KB), sent with every HTTP request and can have expiry/HttpOnly/Secure flags – used for auth sessions.', level: 'Medium' },
    { q: 'How do you prevent XSS when rendering user data?', a: 'Use textContent instead of innerHTML, or escape &, <, >, ", \' before inserting HTML. Never insert untrusted strings as HTML; sanitise with a library like DOMPurify if HTML is required.', level: 'Hard' },
    { q: 'Output?\nconsole.log([1, 2, 3] + [4]);', a: '"1,2,34". Arrays convert to strings ("1,2,3" and "4") and + concatenates them.', level: 'Medium' },
    { q: 'Output?\nconsole.log(typeof typeof 1);', a: '"string". typeof 1 is "number", and typeof "number" is "string".', level: 'Easy' },
    { q: 'Output?\nlet a = 1;\nfunction f() { console.log(a); let a = 2; }\nf();', a: 'ReferenceError: Cannot access \'a\' before initialization. The inner let a shadows the outer a and is in the TDZ when logged.', level: 'Hard' },
    { q: 'Output?\nconsole.log(0.1 + 0.2 === 0.3, Number.EPSILON > Math.abs(0.1 + 0.2 - 0.3));', a: 'false true. Floating-point rounding makes 0.1 + 0.2 = 0.30000000000000004; compare with a tolerance instead.', level: 'Medium' },
    { q: 'Output?\nfor (var i = 0; i < 3; i++) setTimeout(() => console.log(i));', a: '3 3 3. The timers run after the loop finished and all share the same var i. Using let prints 0 1 2.', level: 'Medium' },
    { q: 'Output?\nconsole.log(1);\nsetTimeout(() => console.log(2));\nPromise.resolve().then(() => console.log(3));\n(async () => { console.log(4); await 0; console.log(5); })();\nconsole.log(6);', a: '1 4 6 3 5 2. Sync logs first (1, 4 from the async body, 6), then microtasks in order (3, 5), then the timer (2).', level: 'Hard' },
    { q: 'Output?\nconst o = { x: 1, getX() { return this.x; } };\nconst g = o.getX;\nconsole.log(o.getX(), g.call({ x: 9 }));', a: '1 9. The first call uses implicit binding (o). call sets this explicitly to { x: 9 }.', level: 'Medium' },
    { q: 'Output?\nconsole.log([10, 1, 3].sort(), [10, 1, 3].sort((a, b) => a - b));', a: '[1, 10, 3] [1, 3, 10]. Default sort compares as strings; pass a comparator for numbers.', level: 'Medium' },
    { q: 'Output?\nconst p = Promise.reject(new Error("x"));\np.catch(e => e.message).then(v => console.log("then:", v));', a: '"then: x". catch handles the rejection and returns the message, which the next then receives as a normal value.', level: 'Medium' },
    { q: 'Output?\nconst { a = 10, b = 20 } = { a: null, b: undefined };\nconsole.log(a, b);', a: 'null 20. Default values apply only when the value is undefined, not null.', level: 'Medium' },
    { q: 'Output?\nfunction* g() { const x = yield 1; yield x * 2; }\nconst it = g();\nconsole.log(it.next().value, it.next(5).value, it.next().done);', a: '1 10 true. The value passed to next(5) becomes x; the generator then finishes.', level: 'Hard' },
    { q: 'Output?\nconsole.log("b" + "a" + +"a" + "a");', a: '"baNaNa". +"a" converts to NaN, which is then concatenated as a string.', level: 'Medium' },
    { q: 'Output?\nconsole.log(null ?? "A", 0 || "B", "" ?? "C", undefined?.x);', a: 'A B  undefined – null ?? "A" → "A"; 0 || "B" → "B"; "" ?? "C" → "" (empty string is not nullish, printed as an empty gap); undefined?.x → undefined.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Part C option 1: add a "Clear favourites" button to the Team Directory that empties the favourites Set, saves it and re-renders.',
      hint: 'Add a clearFavs() method to UserStore that returns [] after this.#favs.clear().',
      solution: `// In UserStore:
clearFavs() {
  this.#favs.clear();
  return [];
}

// HTML (inside .toolbar):
// <button id="clearFavs">Clear favourites</button>

// Controller:
document.querySelector('#clearFavs').addEventListener('click', () => {
  storage.save('favs', store.clearFavs());
  render();
});`,
    },
    {
      task: 'Part C option 2: remember the last search text, sort option and favourites-only flag in localStorage, and restore them on page load.',
      hint: 'Save the state object in each handler; on start, merge the saved object into state and set the input values.',
      solution: `const saved = storage.load('ui-state', {});
Object.assign(state, saved);
document.querySelector('#search').value = state.text;
document.querySelector('#sort').value = state.sort;
document.querySelector('#favOnly').checked = state.favOnly;

function saveState() { storage.save('ui-state', state); }

// call saveState() inside each handler, e.g.
document.querySelector('#sort').addEventListener('change', (e) => {
  state.sort = e.target.value;
  saveState();
  render();
});`,
    },
    {
      task: 'Build a Quiz App: fetch 5 questions from a local array, show one at a time with 4 options, track the score, and show the result with a "Play again" button.',
      hint: 'Keep state = { index, score }. Render the current question; on option click check the answer, increase index, render again.',
      solution: `<div id="quiz"></div>
<script>
const questions = [
  { q: 'typeof null?', options: ['null', 'object', 'undefined', 'number'], answer: 1 },
  { q: '2 + "2"?', options: ['4', '22', 'NaN', 'Error'], answer: 1 },
  { q: 'Which is block scoped?', options: ['var', 'let', 'both', 'none'], answer: 1 },
  { q: '[1,2,3].at(-1)?', options: ['1', 'undefined', '3', '-1'], answer: 2 },
  { q: 'Microtask example?', options: ['setTimeout', 'click', 'then()', 'setInterval'], answer: 2 },
];
const state = { index: 0, score: 0 };
const box = document.querySelector('#quiz');

function render() {
  if (state.index === questions.length) {
    box.innerHTML = '<h2>Score: ' + state.score + ' / ' + questions.length + '</h2><button id="again">Play again</button>';
    return;
  }
  const { q, options } = questions[state.index];
  box.innerHTML = '<h3>' + (state.index + 1) + '. ' + q + '</h3>' +
    options.map((o, i) => '<button data-i="' + i + '">' + o + '</button>').join(' ');
}

box.addEventListener('click', (e) => {
  if (e.target.id === 'again') { state.index = 0; state.score = 0; return render(); }
  const i = e.target.dataset.i;
  if (i === undefined) return;
  if (Number(i) === questions[state.index].answer) state.score++;
  state.index++;
  render();
});
render();
</script>`,
    },
    {
      task: 'Write a function promisePool(tasks, limit) that runs async task functions with at most "limit" running at the same time and resolves with all results in order.',
      hint: 'Start "limit" workers; each worker takes the next index until none are left.',
      solution: `async function promisePool(tasks, limit) {
  const results = [];
  let next = 0;
  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

const wait = (ms, v) => () => new Promise((r) => setTimeout(() => r(v), ms));
promisePool([wait(300, 'a'), wait(100, 'b'), wait(200, 'c'), wait(50, 'd')], 2)
  .then((r) => console.log(r)); // [ 'a', 'b', 'c', 'd' ]`,
    },
    {
      task: 'Write an EventEmitter class with on(event, fn), off(event, fn), once(event, fn) and emit(event, ...args).',
      hint: 'Store listeners in a Map of event → Set of functions. once wraps fn and removes itself.',
      solution: `class EventEmitter {
  #events = new Map();
  on(name, fn) {
    if (!this.#events.has(name)) this.#events.set(name, new Set());
    this.#events.get(name).add(fn);
    return () => this.off(name, fn);   // return an unsubscribe function
  }
  off(name, fn) { this.#events.get(name)?.delete(fn); }
  once(name, fn) {
    const wrapper = (...args) => { this.off(name, wrapper); fn(...args); };
    this.on(name, wrapper);
  }
  emit(name, ...args) {
    [...(this.#events.get(name) ?? [])].forEach((fn) => fn(...args));
  }
}

const bus = new EventEmitter();
bus.on('login', (u) => console.log('Welcome', u));
bus.once('login', () => console.log('First login bonus!'));
bus.emit('login', 'Asha'); // Welcome Asha, First login bonus!
bus.emit('login', 'Asha'); // Welcome Asha`,
    },
    {
      task: 'Write a function deepEqual(a, b) that compares two values including nested objects and arrays.',
      hint: 'Handle primitives with ===, then compare key counts and recurse into each key.',
      solution: `function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
  if (Array.isArray(a) !== Array.isArray(b)) return false;
  const keysA = Object.keys(a), keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((k) => deepEqual(a[k], b[k]));
}
console.log(deepEqual({ x: [1, { y: 2 }] }, { x: [1, { y: 2 }] })); // true
console.log(deepEqual({ x: 1 }, { x: '1' }));                       // false`,
    },
  ],
  quiz: [
    {
      question: 'Which feature of the final project prevents an API call on every keystroke?',
      options: ['Throttle on scroll', 'Event delegation', 'Debounced input handler', 'Promise.all'],
      answer: 2,
      explanation: 'The search handler is wrapped in debounce(…, 250).',
    },
    {
      question: 'Why does the project use one click listener on document for all star buttons?',
      options: [
        'Event delegation works for elements created later and needs only one listener',
        'Buttons cannot have their own listeners',
        'It makes requests faster',
        'It is required by localStorage',
      ],
      answer: 0,
      explanation: 'Cards are re-rendered often; delegation avoids re-attaching listeners.',
    },
    {
      question: 'What is the output of: for (var i = 0; i < 3; i++) setTimeout(() => console.log(i));',
      options: ['0 1 2', '3 3 3', '0 0 0', 'undefined x3'],
      answer: 1,
      explanation: 'One shared var i is 3 when the timers run.',
    },
    {
      question: 'Which correctly loads two independent endpoints in parallel?',
      options: [
        'await getJSON(a); await getJSON(b);',
        '[a, b].forEach(async (p) => await getJSON(p))',
        'getJSON(a).then(() => getJSON(b))',
        'await Promise.all([getJSON(a), getJSON(b)])',
      ],
      answer: 3,
      explanation: 'Promise.all starts both and waits for both.',
    },
    {
      question: 'Output of: console.log(null ?? "A", 0 || "B")',
      options: ['null 0', 'A 0', 'A B', 'null B'],
      answer: 2,
      explanation: '?? replaces null; || replaces any falsy value such as 0.',
    },
  ],
};
