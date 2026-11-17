export default {
  id: 'extra-09-local-session-storage',
  title: 'Local Storage and Session Storage (Web Storage API)',
  module: 'Extra: HTML5 Browser APIs',
  extraNo: 9,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'The Web Storage API lets a page save small amounts of key/value data in the browser. localStorage keeps data until it is deleted; sessionStorage keeps it only for the current tab session. Use it for preferences, drafts and simple caches.',
  objectives: [
    'Explain the difference between localStorage, sessionStorage and cookies',
    'Use setItem, getItem, removeItem, clear, key and length',
    'Store objects and arrays safely with JSON.stringify / JSON.parse',
    'Listen for the storage event to sync between tabs',
    'Know the limits and security rules (same origin, ~5 MB, no secrets)',
  ],
  theory: [
    {
      heading: 'What is Web Storage?',
      content: `Web Storage is a small "locker" the browser gives each website. A page can put values in it and find them again later, even after a reload, without a server.

There are two lockers:
- **localStorage** – permanent locker. Data survives reloads, closing the tab and restarting the browser. Shared by all tabs of the same origin.
- **sessionStorage** – temporary locker for one tab. Survives reloads in that tab, but is deleted when the tab is closed. Each tab has its own copy.

Both store **strings only**, as key/value pairs, and are scoped to the **origin** (protocol + domain + port). \`https://shop.com\` cannot read the storage of \`https://blog.com\`.`,
    },
    {
      heading: 'The API',
      content: `Both objects share the same methods:
- \`setItem(key, value)\` – save (value is converted to a string)
- \`getItem(key)\` – read; returns \`null\` if the key does not exist
- \`removeItem(key)\` – delete one key
- \`clear()\` – delete everything for this origin
- \`key(index)\` and \`length\` – loop over all keys

The API is **synchronous** (it blocks briefly), so keep the data small.`,
      syntax: `localStorage.setItem('theme', 'dark');
localStorage.getItem('theme');      // "dark"
localStorage.getItem('missing');    // null
localStorage.removeItem('theme');
sessionStorage.setItem('step', 2);  // stored as "2"`,
    },
    {
      heading: 'Storing objects and arrays with JSON',
      content: `Because values are strings, \`setItem('user', { name: 'Asha' })\` saves the useless text \`"[object Object]"\`.

Always convert:
- Save: \`localStorage.setItem('user', JSON.stringify(user))\`
- Load: \`const user = JSON.parse(localStorage.getItem('user'))\`

Guard against missing or broken data: \`JSON.parse(localStorage.getItem('cart') ?? '[]')\`, and wrap parsing in try/catch if the data might be corrupted.`,
      tip: 'Numbers and booleans come back as strings: getItem("count") returns "5", and "false" is truthy! Convert with Number() or compare with === "true".',
    },
    {
      heading: 'localStorage vs sessionStorage vs cookies',
      content: `Compare them point by point (localStorage / sessionStorage / cookies):
- **Lifetime**: until deleted / until the tab closes / until the expiry date you set
- **Size**: about 5 MB per origin / about 5 MB / about 4 KB per cookie
- **Sent to the server**: no / no / yes, with every request
- **Shared across tabs**: yes / no (each tab has its own) / yes
- **Readable from JS**: yes / yes / yes, unless the cookie is HttpOnly

Use localStorage for preferences (theme, language), sessionStorage for one-time flows (multi-step form progress), and cookies (set by the server, HttpOnly) for login sessions.`,
      tip: 'Never store passwords, tokens or personal data in Web Storage: any script on the page (including an XSS attack) can read it.',
    },
    {
      heading: 'The storage event and errors',
      content: `When localStorage changes in **another tab** of the same origin, each other tab receives a \`storage\` event with \`key\`, \`oldValue\`, \`newValue\` and \`storageArea\`. This is how you keep tabs in sync (e.g. log out everywhere). The tab that made the change does not get the event.

Things that can throw errors:
- Exceeding the quota → \`QuotaExceededError\`.
- Storage blocked (private mode in some browsers, disabled cookies, or a **sandboxed iframe without same-origin**, like many online playgrounds) → \`SecurityError\` just by touching \`localStorage\`.

So production code should wrap storage access in try/catch.`,
      syntax: `window.addEventListener('storage', (e) => {
  console.log(e.key, 'changed from', e.oldValue, 'to', e.newValue);
});`,
    },
  ],
  examples: [
    {
      title: 'Remember the theme (with a safe fallback)',
      scenario: 'A dark/light toggle that remembers the choice after reload. The code is written defensively so it still works in a sandbox where storage is blocked.',
      steps: [
        'Create a button and some text',
        'Write a safeStorage helper that tries localStorage and falls back to an in-memory object',
        'On load, read the saved theme and apply it',
        'On click, toggle the theme and save it',
        'Click Run, toggle, then press Run again to see it remembered (if storage is allowed)',
      ],
      code: `const saved = localStorage.getItem('theme') ?? 'light';
document.body.dataset.theme = saved;
btn.addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  localStorage.setItem('theme', next);
});`,
      playground: {
        html: `<h2>Theme memory</h2>
<p>Toggle the theme, then re-run the playground.</p>
<button id="toggle">Toggle theme</button>
<p id="note"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; transition: background .3s, color .3s; }
body[data-theme="dark"] { background: #1d1f27; color: #f2f2f2; }
body[data-theme="light"] { background: #ffffff; color: #222; }`,
        js: `function getStore() {
  try {
    const k = '__test__';
    localStorage.setItem(k, '1');
    localStorage.removeItem(k);
    return { store: localStorage, real: true };
  } catch (err) {
    const mem = {};
    return {
      real: false,
      store: {
        getItem: (k) => (k in mem ? mem[k] : null),
        setItem: (k, v) => { mem[k] = String(v); },
        removeItem: (k) => { delete mem[k]; },
      },
    };
  }
}
const { store, real } = getStore();
document.getElementById('note').textContent = real
  ? 'Using real localStorage – your choice survives reloads.'
  : 'localStorage is blocked in this sandbox, using memory fallback (choice resets on reload).';
document.body.dataset.theme = store.getItem('theme') ?? 'light';
console.log('Loaded theme:', document.body.dataset.theme, '| real storage:', real);
document.getElementById('toggle').addEventListener('click', () => {
  const next = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
  document.body.dataset.theme = next;
  store.setItem('theme', next);
  console.log('Saved theme:', next);
});`,
      },
      result: 'The button switches between light and dark. If the playground allows storage, re-running keeps the last theme; otherwise a note explains that a memory fallback is used.',
      explanation: 'getItem returns null for a missing key, so ?? gives a default. The try/catch detects environments where localStorage throws a SecurityError (sandboxed iframes, some private modes) and keeps the app working.',
    },
    {
      title: 'Saving an array with JSON (shopping cart)',
      scenario: 'Add products to a cart stored as a JSON array, and see what happens if you forget JSON.stringify.',
      steps: [
        'Create buttons for products and a cart list',
        'Load the cart with JSON.parse(store.getItem("cart") ?? "[]")',
        'On click push the item, save with JSON.stringify, and re-render',
        'Add a "Wrong way" button that saves the array without stringify',
        'Click Run and compare the console outputs',
      ],
      code: `const cart = JSON.parse(localStorage.getItem('cart') ?? '[]');
cart.push({ id: 1, name: 'Pen', qty: 1 });
localStorage.setItem('cart', JSON.stringify(cart));`,
      playground: {
        html: `<button data-name="Pen">Add Pen</button>
<button data-name="Notebook">Add Notebook</button>
<button id="clear">Clear cart</button>
<button id="wrong">Wrong way (no stringify)</button>
<ul id="cart"></ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { margin: 2px; }`,
        js: `let store;
try { localStorage.setItem('__t', '1'); localStorage.removeItem('__t'); store = localStorage; }
catch (e) { const m = {}; store = { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); }, removeItem: (k) => { delete m[k]; } }; console.log('(storage blocked: using memory fallback)'); }

function load() {
  try { return JSON.parse(store.getItem('cart') ?? '[]'); }
  catch (err) { console.log('Corrupted cart data, resetting'); return []; }
}
function render() {
  const cart = load();
  document.getElementById('cart').innerHTML = cart.map((i) => '<li>' + i.name + ' × ' + i.qty + '</li>').join('');
}
document.querySelectorAll('[data-name]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const cart = load();
    const found = cart.find((i) => i.name === btn.dataset.name);
    if (found) found.qty++; else cart.push({ name: btn.dataset.name, qty: 1 });
    store.setItem('cart', JSON.stringify(cart));
    console.log('Stored string:', store.getItem('cart'));
    render();
  });
});
document.getElementById('clear').onclick = () => { store.removeItem('cart'); render(); };
document.getElementById('wrong').onclick = () => {
  store.setItem('cart', [{ name: 'Pen', qty: 1 }]);
  console.log('Without stringify the stored value is:', store.getItem('cart'));
  render();
};
render();`,
      },
      result: 'Adding items updates the list and logs a JSON string like [{"name":"Pen","qty":2}]. The "Wrong way" button stores "[object Object]", which fails to parse, so the cart resets.',
      explanation: 'Web Storage only keeps strings. JSON.stringify turns the array into text and JSON.parse turns it back. Without stringify, the array is converted with toString() and the data is lost.',
    },
    {
      title: 'sessionStorage for a multi-step form + listing all keys',
      scenario: 'Remember which step of a wizard the user is on for this tab only, and list everything in storage.',
      steps: [
        'Create Next/Back buttons and a step label',
        'Save the step number in sessionStorage on change',
        'Read it back with Number(getItem("step") ?? 1)',
        'Loop with length and key(i) to list keys',
        'Click Run and press Next a few times',
      ],
      code: `let step = Number(sessionStorage.getItem('step') ?? 1);
sessionStorage.setItem('step', step + 1);
for (let i = 0; i < sessionStorage.length; i++) {
  const k = sessionStorage.key(i);
  console.log(k, sessionStorage.getItem(k));
}`,
      playground: {
        html: `<h3 id="label"></h3>
<button id="back">Back</button>
<button id="next">Next</button>
<pre id="dump"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
pre { background: #f4f4f4; padding: 8px; }`,
        js: `let ss;
try { ss = window.sessionStorage; ss.setItem('__t', '1'); ss.removeItem('__t'); }
catch (e) {
  const m = {};
  ss = { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); },
    get length() { return Object.keys(m).length; }, key: (i) => Object.keys(m)[i] ?? null };
  console.log('(sessionStorage blocked in this sandbox: using memory fallback)');
}
let step = Number(ss.getItem('wizardStep') ?? 1);
function show() {
  document.getElementById('label').textContent = 'Step ' + step + ' of 3';
  ss.setItem('wizardStep', step);
  let out = 'sessionStorage contents (' + ss.length + ' keys):\\n';
  for (let i = 0; i < ss.length; i++) {
    const k = ss.key(i);
    out += k + ' = ' + ss.getItem(k) + ' (' + typeof ss.getItem(k) + ')\\n';
  }
  document.getElementById('dump').textContent = out;
}
document.getElementById('next').onclick = () => { if (step < 3) step++; show(); };
document.getElementById('back').onclick = () => { if (step > 1) step--; show(); };
show();`,
      },
      result: 'The label shows "Step N of 3", Next/Back change it, and the dump shows wizardStep = N (string). In a normal browser tab the step survives reloads but not closing the tab.',
      explanation: 'sessionStorage has the same API as localStorage but is per-tab and temporary. The number is stored as a string, so Number() converts it back. length and key(i) let you iterate.',
    },
  ],
  interview: [
    { q: 'What is the difference between localStorage and sessionStorage?', a: 'Both store string key/value pairs per origin. localStorage persists until explicitly cleared and is shared across tabs; sessionStorage is per tab and cleared when the tab/window is closed.', level: 'Easy' },
    { q: 'How is Web Storage different from cookies?', a: 'Cookies are sent with every HTTP request to the server, are limited to ~4 KB, can have an expiry and can be HttpOnly. Web Storage is ~5 MB, never sent automatically, and always readable by JavaScript.', level: 'Medium' },
    { q: 'How do you store an object in localStorage?', a: 'localStorage.setItem("key", JSON.stringify(obj)) and read with JSON.parse(localStorage.getItem("key")).', level: 'Easy' },
    { q: 'What does getItem return for a key that does not exist?', a: 'null (not undefined).', level: 'Easy' },
    { q: 'What is the storage limit?', a: 'Typically about 5 MB per origin for each of localStorage and sessionStorage (varies by browser). Exceeding it throws QuotaExceededError.', level: 'Medium' },
    { q: 'Is it safe to store a JWT or password in localStorage?', a: 'No. Any JavaScript running on the page, including injected XSS code or third-party scripts, can read it. Prefer HttpOnly, Secure, SameSite cookies for auth tokens.', level: 'Medium' },
    { q: 'What is the storage event?', a: 'An event fired on window in other tabs/windows of the same origin when localStorage changes. It provides key, oldValue, newValue, url and storageArea. It does not fire in the tab that made the change.', level: 'Hard' },
    { q: 'Is the Web Storage API synchronous or asynchronous?', a: 'Synchronous. Large reads/writes can block the main thread, so for big data use IndexedDB.', level: 'Medium' },
    { q: 'Why can accessing localStorage throw an error?', a: 'It can throw SecurityError when storage is blocked (sandboxed iframes without allow-same-origin, disabled cookies, some private modes) and QuotaExceededError when full. Wrap access in try/catch.', level: 'Hard' },
    { q: 'What does localStorage.setItem("n", 5); typeof localStorage.getItem("n") return?', a: '"string" – all values are converted to strings.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Make a textarea that auto-saves a draft to localStorage on every input and restores it on load.',
      hint: 'Use the input event and getItem on load.',
      solution: `<textarea id="draft" rows="5" cols="40"></textarea>
<script>
  const t = document.getElementById('draft');
  t.value = localStorage.getItem('draft') ?? '';
  t.addEventListener('input', () => localStorage.setItem('draft', t.value));
</script>`,
    },
    {
      task: 'Count how many times the user visited the page (localStorage) and how many times they reloaded in this tab (sessionStorage).',
      hint: 'Use Number(getItem(...) ?? 0) + 1.',
      solution: `<p id="out"></p>
<script>
  const visits = Number(localStorage.getItem('visits') ?? 0) + 1;
  const reloads = Number(sessionStorage.getItem('reloads') ?? 0) + 1;
  localStorage.setItem('visits', visits);
  sessionStorage.setItem('reloads', reloads);
  document.getElementById('out').textContent = 'Total visits: ' + visits + ', this tab: ' + reloads;
</script>`,
    },
    {
      task: 'Write saveJSON(key, value) and loadJSON(key, fallback) helpers that never throw.',
      hint: 'Use try/catch around both.',
      solution: `<script>
  function saveJSON(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); return true; }
    catch (e) { console.warn('Save failed', e.name); return false; }
  }
  function loadJSON(key, fallback) {
    try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw); }
    catch (e) { return fallback; }
  }
  saveJSON('prefs', { lang: 'en' });
  console.log(loadJSON('prefs', {}));
</script>`,
    },
    {
      task: 'Show a "Welcome!" banner only once per browser: after the user closes it, never show it again.',
      hint: 'Store a flag like "welcomeDismissed" = "true".',
      solution: `<div id="banner" hidden>Welcome! <button id="x">×</button></div>
<script>
  const b = document.getElementById('banner');
  if (localStorage.getItem('welcomeDismissed') !== 'true') b.hidden = false;
  document.getElementById('x').onclick = () => {
    b.hidden = true;
    localStorage.setItem('welcomeDismissed', 'true');
  };
</script>`,
    },
    {
      task: 'Log a message in every other open tab when the "theme" key changes.',
      hint: 'window.addEventListener("storage", ...) and check e.key.',
      solution: `<script>
  window.addEventListener('storage', (e) => {
    if (e.key === 'theme') console.log('Theme changed in another tab to', e.newValue);
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'Which storage is cleared when the browser tab is closed?', options: ['localStorage', 'sessionStorage', 'Cookies with an expiry date', 'IndexedDB'], answer: 1, explanation: 'sessionStorage lives only for the lifetime of the tab.' },
    { question: 'What does localStorage.getItem("unknownKey") return?', options: ['undefined', '""', 'false', 'null'], answer: 3, explanation: 'Missing keys return null.' },
    { question: 'What is stored by localStorage.setItem("u", {a:1})?', options: ['"[object Object]"', '{"a":1}', 'An object', 'An error is thrown'], answer: 0, explanation: 'The object is converted with toString(). Use JSON.stringify.' },
    { question: 'Which is TRUE about Web Storage?', options: ['It is sent to the server with every request', 'It can store about 4 KB', 'It is scoped to the origin and only readable by JS', 'It is asynchronous'], answer: 2, explanation: 'It is per origin, synchronous, ~5 MB and never sent automatically.' },
    { question: 'Which event lets other tabs react to a localStorage change?', options: ['change', 'storage', 'update', 'message'], answer: 1, explanation: 'The storage event fires in other same-origin tabs.' },
  ],
};
