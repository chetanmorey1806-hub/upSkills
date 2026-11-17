const ex1 = `// DEBOUNCE: run only after the calls STOP for "delay" ms
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);                       // cancel the previous plan
    timerId = setTimeout(() => fn.apply(this, args), delay);  // plan again
  };
}

const start = Date.now();
const t = () => Math.round((Date.now() - start) / 100) * 100 + 'ms';

const search = debounce((query) => {
  console.log('[' + t() + '] API call for "' + query + '"');
}, 300);

// Simulate a user typing "react" quickly (one key every 100 ms), then pausing
'react'.split('').forEach((_, i) => {
  setTimeout(() => {
    const typed = 'react'.slice(0, i + 1);
    console.log('[' + t() + '] typed: ' + typed);
    search(typed);
  }, i * 100);
});`;

const ex2 = `// THROTTLE: run at most once every "interval" ms (while calls keep coming)
function throttle(fn, interval) {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
}

const start = Date.now();
const t = () => Math.round((Date.now() - start) / 100) * 100 + 'ms';

const onScroll = throttle((pos) => {
  console.log('[' + t() + '] handle scroll at position ' + pos);
}, 250);

// Simulate scroll events every 100 ms for 1 second (10 events)
let fired = 0;
const id = setInterval(() => {
  fired++;
  onScroll(fired * 50);
  if (fired === 10) {
    clearInterval(id);
    console.log('Events fired: 10, handler ran only a few times');
  }
}, 100);`;

const ex3html = `<div class="demo">
  <label>Search users: <input id="q" placeholder="type e.g. le" autocomplete="off"></label>
  <p class="meta">Keystrokes: <b id="keys">0</b> &middot; API calls: <b id="calls">0</b></p>
  <p id="status"></p>
  <ul id="results"></ul>
</div>`;

const ex3css = `.demo { font-family: system-ui, sans-serif; max-width: 420px; }
input { padding: 8px; width: 220px; font-size: 15px; }
.meta { color: #555; }
#status { color: #b26a00; min-height: 1.2em; }
li { padding: 3px 0; }`;

const ex3js = `function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

let keys = 0, calls = 0;
const input = document.querySelector('#q');
const statusEl = document.querySelector('#status');
const list = document.querySelector('#results');

async function searchUsers(query) {
  calls++;
  document.querySelector('#calls').textContent = calls;
  if (!query.trim()) { list.innerHTML = ''; statusEl.textContent = ''; return; }
  statusEl.textContent = 'Searching for "' + query + '"...';
  try {
    const res = await fetch('https://jsonplaceholder.typicode.com/users');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const users = await res.json();
    const matches = users.filter((u) => u.name.toLowerCase().includes(query.toLowerCase()));
    list.innerHTML = '';
    matches.forEach((u) => {
      const li = document.createElement('li');
      li.textContent = u.name;
      list.appendChild(li);
    });
    statusEl.textContent = matches.length + ' match(es)';
  } catch (err) {
    statusEl.textContent = 'Error: ' + err.message;
  }
}

const debouncedSearch = debounce(searchUsers, 400);

input.addEventListener('input', (e) => {
  keys++;
  document.querySelector('#keys').textContent = keys;
  debouncedSearch(e.target.value);
});`;

const ex4html = `<div id="panel">
  <p>Move your mouse inside this box quickly</p>
  <p>Raw mousemove events: <b id="raw">0</b></p>
  <p>Throttled (every 200 ms): <b id="thr">0</b></p>
  <p>Debounced (after 300 ms still): <b id="deb">0</b></p>
  <p id="pos">x: -, y: -</p>
</div>`;

const ex4css = `#panel { font-family: system-ui, sans-serif; height: 220px; border: 2px dashed #7e57c2; border-radius: 12px; padding: 12px; background: #f3e5f5; user-select: none; }
b { color: #4a148c; font-size: 1.2rem; }`;

const ex4js = `function throttle(fn, interval) {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
}
function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}

const counts = { raw: 0, thr: 0, deb: 0 };
const show = (key) => { document.getElementById(key).textContent = ++counts[key]; };

const throttledMove = throttle((e) => {
  show('thr');
  document.querySelector('#pos').textContent = 'x: ' + e.offsetX + ', y: ' + e.offsetY;
}, 200);
const debouncedMove = debounce(() => show('deb'), 300);

document.querySelector('#panel').addEventListener('mousemove', (e) => {
  show('raw');
  throttledMove(e);
  debouncedMove();
});`;

const ex5 = `// Production-style versions: leading option, cancel and trailing throttle
function debounce(fn, delay, { leading = false } = {}) {
  let timerId;
  function debounced(...args) {
    const callNow = leading && !timerId;
    clearTimeout(timerId);
    timerId = setTimeout(() => {
      timerId = null;
      if (!leading) fn.apply(this, args);
    }, delay);
    if (callNow) fn.apply(this, args);
  }
  debounced.cancel = () => { clearTimeout(timerId); timerId = null; };
  return debounced;
}

// throttle that also runs once more at the end (trailing call) with the latest args
function throttle(fn, interval) {
  let lastRun = 0, trailingTimer = null, lastArgs;
  return function (...args) {
    lastArgs = args;
    const remaining = interval - (Date.now() - lastRun);
    if (remaining <= 0) {
      lastRun = Date.now();
      fn.apply(this, args);
    } else if (!trailingTimer) {
      trailingTimer = setTimeout(() => {
        lastRun = Date.now();
        trailingTimer = null;
        fn.apply(this, lastArgs);
      }, remaining);
    }
  };
}

// 1. Leading debounce: a "Pay" button that ignores double-clicks
const pay = debounce((n) => console.log('Payment submitted (click #' + n + ')'), 500, { leading: true });
[1, 2, 3].forEach((n) => setTimeout(() => pay(n), n * 50));       // 3 rapid clicks

// 2. cancel(): user leaves the page before the save happens
const autosave = debounce(() => console.log('Autosaved'), 200);
autosave();
autosave.cancel();
setTimeout(() => console.log('Autosave was cancelled - nothing saved'), 300);

// 3. Trailing throttle: the final position is never lost
const report = throttle((pos) => console.log('Resize handled at width', pos), 250);
[300, 400, 500, 600, 700].forEach((w, i) => setTimeout(() => report(w), 700 + i * 50));`;

export default {
  id: 'day-40-debounce-throttle',
  title: 'Debounce and Throttle',
  module: 'Module 6: Advanced JavaScript',
  day: 40,
  level: 'Advanced',
  duration: '1.5 hours',
  summary:
    'Some events fire dozens of times per second (typing, scrolling, resizing, mouse moves). Debounce and throttle are higher-order functions that limit how often an expensive handler runs, making apps faster and cheaper on APIs.',
  objectives: [
    'Explain why high-frequency events need rate limiting',
    'Implement debounce with closures and setTimeout/clearTimeout',
    'Implement throttle with timestamps',
    'Choose correctly between debounce and throttle for search, scroll, resize, buttons',
    'Add leading calls, trailing calls and cancel() to the basic versions',
  ],
  theory: [
    {
      heading: 'The Problem: Too Many Events',
      content:
        'Some browser events fire **very often**:\n- `input` / `keyup` – on every keystroke\n- `scroll`, `resize`, `mousemove` – up to 60+ times per second\n\nIf each event triggers something expensive – an **API request**, heavy DOM calculations, saving to the server – the app becomes slow, the server gets flooded with requests, and responses can arrive out of order.\n\nBoth **debounce** and **throttle** are **higher-order functions** (Day 39): they take your function and return a new "rate-limited" version, using **closures** (Day 13) to remember timers and timestamps between calls.',
    },
    {
      heading: 'Debounce: Wait Until They Stop',
      content:
        '**Debounce** delays running the function until **no new call has happened for X milliseconds**. Every new call **resets the timer**.\n\nAnalogy: a **lift (elevator) door**. It waits a few seconds before closing; every time someone else walks in, the waiting restarts. The lift only moves when people stop coming.\n\nResult: a burst of 20 calls → **1 execution** (after the burst ends).\n\nUse debounce for:\n- Search box suggestions / autocomplete (call the API after the user stops typing)\n- Form validation while typing (check if username is available)\n- Autosave drafts\n- Window resize → recalculate layout once at the end',
      syntax: `function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}`,
    },
    {
      heading: 'Throttle: At Most Once Every X ms',
      content:
        '**Throttle** guarantees the function runs **at most once per interval**, no matter how many times it is called. It runs **regularly during** a continuous burst.\n\nAnalogy: a **machine gun with a fixed fire rate**, or a tap that releases one drop every second however hard you press.\n\nResult: 1 second of continuous events with a 250 ms throttle → about **4 executions**.\n\nUse throttle for:\n- Scroll handlers (infinite scroll, "back to top" button, scroll progress bar)\n- Mouse move / drag tracking\n- Game controls (fire button)\n- Sending location/analytics updates regularly',
      syntax: `function throttle(fn, interval) {
  let lastRun = 0;
  return function (...args) {
    const now = Date.now();
    if (now - lastRun >= interval) {
      lastRun = now;
      fn.apply(this, args);
    }
  };
}`,
    },
    {
      heading: 'Debounce vs Throttle: How to Choose',
      content:
        'Ask: **"Do I need only the final result, or regular updates during the activity?"**\n\n- Only the final value (user finished typing / resizing) → **debounce**\n- Regular updates while it is happening (scroll position, drag) → **throttle**\n\nFor a burst of events for 1 second:\n- No limiting: every event → maybe 60 calls\n- Throttle 200 ms: ~5 calls spread evenly\n- Debounce 300 ms: 1 call, 300 ms after the last event',
      points: [
        'Search-as-you-type → debounce (300–500 ms)',
        'Infinite scroll → throttle (100–250 ms)',
        'Resize layout recalculation → debounce',
        'Prevent double form submit → leading debounce or disable the button',
      ],
    },
    {
      heading: 'Leading, Trailing and Cancel',
      content:
        'Libraries like **Lodash** (`_.debounce`, `_.throttle`) offer options:\n- **trailing** (default for debounce): run at the **end** of the burst\n- **leading**: run **immediately** on the first call, then ignore the rest of the burst – great for buttons (instant feedback, no double submit)\n- **cancel()**: drop a pending call (e.g. the component is removed or the user navigates away)\n- **flush()**: run the pending call right now\n\nA simple timestamp throttle can lose the **last** event; a **trailing throttle** schedules one final call so the last position/size is always handled.',
      tip: 'Common mistake: creating the debounced function INSIDE the event handler (input.oninput = () => debounce(search, 300)()). A new timer closure is created on every event, so nothing is ever debounced. Create it once, outside.',
    },
    {
      heading: 'Using this and arguments Correctly',
      content:
        'The returned wrapper should pass along **all arguments** (`...args`) and the correct **`this`** (`fn.apply(this, args)`), so the original function behaves as if called directly – for example, using `this` as the element in a regular-function event listener.\n\nIn React, a debounced function must be created once per component (with `useMemo`/`useRef`) for the same closure reason (React Day 18–19).',
      tip: 'Coming next (Day 41): regular expressions for validating and searching text.',
    },
  ],
  examples: [
    {
      title: 'Debounce a search while the user types',
      scenario: 'A user types "react" quickly. Without debounce we would call the API 5 times; with debounce only once.',
      steps: [
        'Write debounce(fn, delay) with clearTimeout + setTimeout',
        'Create a debounced search function (300 ms)',
        'Simulate typing one letter every 100 ms',
        'Click Run and count the API calls',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        '[0ms] typed: r\n[100ms] typed: re\n[200ms] typed: rea\n[300ms] typed: reac\n[400ms] typed: react\n[700ms] API call for "react"',
      explanation:
        'Each keystroke clears the previous timer and starts a new 300 ms one. Only after the last keystroke (400 ms) does 300 ms pass without a new call, so the API is called once, at ~700 ms, with the final text.',
    },
    {
      title: 'Throttle scroll events',
      scenario: 'Scroll events fire every 100 ms for one second; we only want to handle one every 250 ms.',
      steps: [
        'Write throttle(fn, interval) using Date.now() and lastRun',
        'Create a throttled scroll handler (250 ms)',
        'Fire 10 fake scroll events with setInterval',
        'Click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        '[100ms] handle scroll at position 50\n[400ms] handle scroll at position 200\n[700ms] handle scroll at position 350\n[1000ms] handle scroll at position 500\nEvents fired: 10, handler ran only a few times',
      explanation:
        'The first call runs immediately. Calls within 250 ms of the last run are ignored, so with events every 100 ms it runs every 300 ms. The handler runs regularly DURING the burst (4 times out of 10 events) instead of waiting for it to end. Timings can shift by a few ms in a real browser.',
    },
    {
      title: 'Live user search with a debounced fetch',
      scenario: 'Search JSONPlaceholder users as you type, counting keystrokes vs actual API calls.',
      steps: [
        'Create an input, counters, a status line and a results list',
        'Write an async searchUsers(query) with loading and error states',
        'Wrap it once: const debouncedSearch = debounce(searchUsers, 400)',
        'Call debouncedSearch inside the input listener and type quickly',
      ],
      code: ex3js,
      playground: { html: ex3html, css: ex3css, js: ex3js },
      result:
        'Typing "le" quickly shows Keystrokes: 2 but API calls: 1, then the list shows Leanne Graham, Clementine Bauch, Patricia Lebsack, Glenna Reichert, Clementina DuBuque and "5 match(es)".',
      explanation:
        'Every keystroke resets the 400 ms timer, so the request is only sent when the user pauses. Fewer requests also avoids out-of-order responses overwriting newer results.',
    },
    {
      title: 'See raw vs throttled vs debounced side by side',
      scenario: 'Move the mouse over a box and compare three counters.',
      steps: [
        'Create throttle and debounce helpers',
        'Count raw mousemove events',
        'Count calls of a 200 ms throttled and a 300 ms debounced handler',
        'Move the mouse continuously, then stop',
      ],
      code: ex4js,
      playground: { html: ex4html, css: ex4css, js: ex4js },
      result:
        'While moving for 2 seconds: raw climbs to ~100+, throttled to ~10 (5 per second) and the position text updates regularly; debounced stays the same until you stop moving, then goes up by 1.',
      explanation:
        'Throttle gives steady updates during the activity; debounce waits for the activity to end. This is the clearest way to remember the difference.',
    },
    {
      title: 'Leading debounce, cancel and trailing throttle',
      scenario: 'Prevent double payments, cancel a pending autosave and never miss the final resize.',
      steps: [
        'Add a leading option and a cancel method to debounce',
        'Write a throttle that schedules a trailing call',
        'Simulate 3 rapid clicks, a cancelled autosave and a burst of resizes',
        'Click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        'Payment submitted (click #1)\nAutosave was cancelled - nothing saved\nResize handled at width 300\nResize handled at width 700',
      explanation:
        'With leading: true the first click runs instantly and the next clicks in the 500 ms window are ignored. cancel() clears the pending autosave timer. The throttle runs on the first resize (300), ignores the next three, and its trailing timer runs once more with the LAST width (700).',
    },
  ],
  interview: [
    {
      q: 'What is debouncing?',
      a: 'A technique that delays executing a function until a specified time has passed since the last call. Every new call resets the timer, so a burst of calls results in one execution at the end.',
      level: 'Easy',
    },
    {
      q: 'What is throttling?',
      a: 'A technique that ensures a function runs at most once in a given interval, regardless of how many times it is called. It produces regular executions during a continuous burst.',
      level: 'Easy',
    },
    {
      q: 'Debounce vs throttle – when to use which?',
      a: 'Debounce when only the final state matters (search input, autosave, resize end, validation). Throttle when you need periodic updates during the activity (scroll, mousemove, drag, game input).',
      level: 'Medium',
    },
    {
      q: 'Implement debounce.',
      a: 'function debounce(fn, delay) {\n  let id;\n  return function (...args) {\n    clearTimeout(id);\n    id = setTimeout(() => fn.apply(this, args), delay);\n  };\n}',
      level: 'Medium',
    },
    {
      q: 'Implement throttle.',
      a: 'function throttle(fn, ms) {\n  let last = 0;\n  return function (...args) {\n    const now = Date.now();\n    if (now - last >= ms) { last = now; fn.apply(this, args); }\n  };\n}',
      level: 'Medium',
    },
    {
      q: 'Which JavaScript concept makes debounce work?',
      a: 'Closures. The returned function keeps access to timerId (and fn, delay) across calls, so each call can clear the previous timer.',
      level: 'Easy',
    },
    {
      q: 'Why use fn.apply(this, args) instead of fn() inside the wrapper?',
      a: 'To forward the original this (e.g. the element in an event listener or the object for a method) and all arguments (e.g. the event object), so the wrapped function behaves exactly like the original.',
      level: 'Medium',
    },
    {
      q: 'What are leading and trailing options?',
      a: 'Leading runs the function at the start of a burst; trailing runs it at the end. Debounce is trailing by default; leading debounce is useful for buttons. A throttle with trailing ensures the last call in a burst is not lost.',
      level: 'Hard',
    },
    {
      q: 'Why does this not work? input.addEventListener("input", () => debounce(search, 300)());',
      a: 'A brand-new debounced function (with its own timer) is created on every event, so no call is ever cancelled – search runs for every keystroke (just delayed). Create the debounced function once outside the handler.',
      level: 'Medium',
    },
    {
      q: 'Is requestAnimationFrame related to throttling?',
      a: 'Yes – rAF-based throttling runs a handler at most once per frame (~16 ms at 60 fps), aligned with painting. It is ideal for visual updates on scroll/mousemove.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Use debounce to log the window size only once after the user stops resizing for 500 ms.',
      hint: 'window.addEventListener("resize", debouncedFn).',
      solution: `function debounce(fn, delay) {
  let id;
  return (...args) => { clearTimeout(id); id = setTimeout(() => fn(...args), delay); };
}
window.addEventListener('resize', debounce(() => {
  console.log('Final size:', window.innerWidth + 'x' + window.innerHeight);
}, 500));`,
    },
    {
      task: 'Show a "Back to top" button only when scrolled more than 300px, checking the scroll position at most every 200 ms.',
      hint: 'throttle a scroll handler and toggle a class or hidden attribute.',
      solution: `<div style="height:3000px">Scroll down</div>
<button id="top" hidden style="position:fixed;bottom:20px;right:20px">Top</button>
<script>
function throttle(fn, ms) {
  let last = 0;
  return (...a) => { const now = Date.now(); if (now - last >= ms) { last = now; fn(...a); } };
}
const btn = document.querySelector('#top');
window.addEventListener('scroll', throttle(() => {
  btn.hidden = window.scrollY < 300;
}, 200));
btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
</script>`,
    },
    {
      task: 'Create a username field that checks availability (fake list: ["admin", "asha", "ravi"]) 500 ms after the user stops typing and shows "Available" or "Taken".',
      hint: 'Debounce the check function; read input.value.',
      solution: `<input id="u" placeholder="username"><span id="msg"></span>
<script>
const taken = ['admin', 'asha', 'ravi'];
function debounce(fn, d) { let id; return (...a) => { clearTimeout(id); id = setTimeout(() => fn(...a), d); }; }
const check = debounce((name) => {
  document.querySelector('#msg').textContent =
    !name ? '' : taken.includes(name.toLowerCase()) ? ' Taken' : ' Available';
}, 500);
document.querySelector('#u').addEventListener('input', (e) => check(e.target.value));
</script>`,
    },
    {
      task: 'Write a counter test in plain JS: call a 100 ms debounced function 5 times synchronously and a 100 ms throttled function 5 times synchronously; log how many times each ran.',
      hint: 'Debounced → 1 (after 100 ms). Throttled → 1 (first call only).',
      solution: `function debounce(fn, d) { let id; return () => { clearTimeout(id); id = setTimeout(fn, d); }; }
function throttle(fn, ms) { let last = 0; return () => { const n = Date.now(); if (n - last >= ms) { last = n; fn(); } }; }
let d = 0, t = 0;
const db = debounce(() => d++, 100);
const th = throttle(() => t++, 100);
for (let i = 0; i < 5; i++) { db(); th(); }
setTimeout(() => console.log('debounced ran', d, '| throttled ran', t), 200); // 1 | 1`,
    },
  ],
  quiz: [
    {
      question: 'Which technique is best for a search-as-you-type API call?',
      options: ['Throttle', 'Debounce', 'setInterval', 'No limiting'],
      answer: 1,
      explanation: 'You only need the final query after the user pauses.',
    },
    {
      question: 'Which technique is best for updating a scroll progress bar?',
      options: ['Debounce', 'Promise.all', 'Throttle', 'clearTimeout'],
      answer: 2,
      explanation: 'You want regular updates while scrolling.',
    },
    {
      question: 'What does a debounced function do when it is called again before the delay ends?',
      options: [
        'Runs immediately',
        'Throws an error',
        'Runs twice',
        'Cancels the pending call and restarts the timer',
      ],
      answer: 3,
      explanation: 'clearTimeout + new setTimeout.',
    },
    {
      question: 'Debounce and throttle are examples of...',
      options: ['Higher-order functions using closures', 'Built-in DOM methods', 'Promise combinators', 'Generators'],
      answer: 0,
      explanation: 'They take a function and return a new one that remembers timers via closure.',
    },
    {
      question: 'A 250 ms throttle receives continuous events for 1 second. About how many times does it run?',
      options: ['1', '4', '60', '0'],
      answer: 1,
      explanation: 'Roughly once every 250 ms → about 4 times.',
    },
  ],
};
