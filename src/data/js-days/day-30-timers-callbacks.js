export default {
  id: 'day-30-timers-callbacks',
  title: 'Timers: setTimeout, setInterval, Callbacks and Callback Hell',
  module: 'Module 5: Asynchronous JavaScript',
  day: 30,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'JavaScript runs one thing at a time, yet pages show countdowns, auto-save drafts and wait for servers without freezing. Today you learn the first asynchronous tools: setTimeout and setInterval (and how to cancel them), what callbacks are, the error-first callback pattern, and why deeply nested callbacks ("callback hell") led to Promises.',
  objectives: [
    'Understand synchronous vs asynchronous code and why JavaScript needs async',
    'Schedule code with setTimeout and repeat it with setInterval; cancel with clearTimeout / clearInterval',
    'Predict output order when timers are mixed with normal code (including the 0 ms delay)',
    'Write and use callback functions, including the error-first (err, data) pattern',
    'Recognise callback hell and techniques to reduce it (named functions, early returns), leading into Promises',
  ],
  theory: [
    {
      heading: 'Synchronous vs Asynchronous',
      content: "**Synchronous** code runs line by line; each line waits for the previous one to finish. JavaScript in the browser has a **single main thread**, so a slow synchronous task (a huge loop) **freezes** the page: no clicks, no scrolling.\n\n**Asynchronous** code says \"start this now, and call me back when it is done\". Meanwhile, JavaScript keeps running other code. Timers, network requests (fetch), file reading and user events are all asynchronous.\n\nAnalogy: ordering at a restaurant. Synchronous = the waiter stands at the kitchen until your food is ready, ignoring every other table. Asynchronous = the waiter gives the order to the kitchen, serves other tables, and comes back when the kitchen rings the bell (callback).\n\nThe browser (or Node.js) provides the timers; when a timer finishes, its callback is put in a **queue** and runs only after the current code has finished. The full **event loop** is explained on Day 34.",
    },
    {
      heading: 'setTimeout and clearTimeout',
      content: "`setTimeout(callback, delayMs, ...args)` runs `callback` **once**, after **at least** `delayMs` milliseconds. Extra arguments are passed to the callback.\n\nIt returns a **timer id**. Pass that id to `clearTimeout(id)` to cancel the timer before it fires.\n\nImportant facts:\n- The delay is a **minimum**, not a guarantee: if the main thread is busy, the callback waits.\n- `setTimeout(fn, 0)` does NOT run immediately; it runs after the current synchronous code finishes.\n- Pass the function, do not call it: `setTimeout(greet, 1000)`, not `setTimeout(greet(), 1000)`.",
      syntax: `const id = setTimeout(() => {
  console.log('Runs after 2 seconds');
}, 2000);

clearTimeout(id); // cancel it (nothing will be printed)

setTimeout((name) => console.log('Hi ' + name), 500, 'Asha'); // extra args`,
    },
    {
      heading: 'setInterval and clearInterval',
      content: "`setInterval(callback, intervalMs)` runs `callback` **repeatedly**, every `intervalMs` milliseconds, until you stop it with `clearInterval(id)`.\n\nUses: clocks, countdowns, slideshows, polling a server, auto-save.\n\nAlways keep the id and clear the interval when it is no longer needed (countdown reached zero, component removed, user clicked Stop). Forgotten intervals keep running and waste CPU or cause bugs.\n\nIf each run might take longer than the interval (e.g. a network request), prefer a **recursive setTimeout**: schedule the next run only after the current one finishes.",
      syntax: `let count = 3;
const timer = setInterval(() => {
  console.log(count);
  count--;
  if (count === 0) {
    clearInterval(timer);
    console.log('Go!');
  }
}, 1000);

// recursive setTimeout (guaranteed gap between runs)
function poll() {
  console.log('checking...');
  setTimeout(poll, 5000);
}`,
      tip: 'Timers in background tabs may be slowed down by the browser (often to once per second or less) to save battery. Do not rely on intervals for exact timing; compare with Date.now() for accurate clocks.',
    },
    {
      heading: 'Callbacks',
      content: "A **callback** is a function passed as an argument to another function, to be called later. You already used many: `arr.map(x => x * 2)`, `btn.addEventListener('click', handler)`, `setTimeout(fn, 1000)`.\n\n- **Synchronous callbacks** run immediately during the call (map, forEach, filter).\n- **Asynchronous callbacks** run later (timers, events, network).\n\nNode.js popularised the **error-first callback** convention: the callback's first parameter is an error (or `null` if everything is fine), the second is the result: `callback(err, data)`. The caller always checks the error first.",
      syntax: `function loadUser(id, callback) {
  setTimeout(() => {
    if (id <= 0) {
      callback(new Error('Invalid id'), null);
      return;
    }
    callback(null, { id, name: 'User ' + id });
  }, 500);
}

loadUser(1, (err, user) => {
  if (err) return console.log('Error:', err.message);
  console.log('Got', user.name);
});`,
    },
    {
      heading: 'Callback Hell (Pyramid of Doom)',
      content: "When async steps depend on each other (login -> get profile -> get orders -> get order details), each step must start inside the previous step's callback. The code drifts right into a **pyramid**:\n\n- hard to read and change\n- error handling is repeated at every level\n- easy to forget a return or call a callback twice\n- `try/catch` around the outer call does not catch errors inside the callbacks\n\nThis problem is called **callback hell**. Ways to reduce it:\n1. Use **named functions** instead of nested anonymous ones\n2. Use **early returns** for errors\n3. Keep functions small\n4. Best: use **Promises** (Day 31) and **async/await** (Day 32), which turn the pyramid into a flat chain.",
      syntax: `login('asha', (err, user) => {
  if (err) return handle(err);
  getProfile(user.id, (err, profile) => {
    if (err) return handle(err);
    getOrders(profile.id, (err, orders) => {
      if (err) return handle(err);
      getDetails(orders[0], (err, details) => {
        if (err) return handle(err);
        console.log(details); // 4 levels deep...
      });
    });
  });
});`,
    },
  ],
  examples: [
    {
      title: 'Predict the Order: setTimeout vs Normal Code',
      scenario: 'Classic interview question: in which order do the logs appear when timers with different delays (including 0) are mixed with synchronous code?',
      steps: [
        'Write console.log statements and three setTimeout calls with delays 100, 0 and 10',
        'Predict the order before running',
        'Click Run and compare',
      ],
      code: `console.log('1: script start');
setTimeout(() => console.log('2: timeout 100ms'), 100);
setTimeout(() => console.log('3: timeout 0ms'), 0);
setTimeout(() => console.log('4: timeout 10ms'), 10);
console.log('5: script end');`,
      playground: {
        js: `console.log('1: script start');
setTimeout(() => console.log('2: timeout 100ms'), 100);
setTimeout(() => console.log('3: timeout 0ms'), 0);
setTimeout(() => console.log('4: timeout 10ms'), 10);
console.log('5: script end');`,
      },
      result: `1: script start
5: script end
3: timeout 0ms
4: timeout 10ms
2: timeout 100ms`,
      explanation: 'All synchronous code runs first (1 and 5). Timer callbacks wait in a queue until the call stack is empty, then run in order of their expiry time: 0ms, then 10ms, then 100ms. Even a 0 ms timeout never interrupts the code that is currently running.',
    },
    {
      title: 'Countdown with setInterval and clearInterval',
      scenario: 'A rocket launch countdown from 5 to 1 then "Liftoff!", stopping the interval at zero. A second timer shows how clearTimeout cancels a scheduled message.',
      steps: [
        'Store the interval id from setInterval',
        'Decrease the counter each second and log it',
        'When it reaches 0, clearInterval and log Liftoff',
        'Schedule an "abort" message with setTimeout and cancel it with clearTimeout',
        'Click Run and wait 5 seconds',
      ],
      code: `let seconds = 5;
const timerId = setInterval(() => {
  console.log('T-minus ' + seconds);
  seconds--;
  if (seconds === 0) {
    clearInterval(timerId);
    console.log('Liftoff!');
  }
}, 1000);`,
      playground: {
        js: `let seconds = 5;
console.log('Countdown started');

const timerId = setInterval(() => {
  console.log('T-minus ' + seconds);
  seconds--;
  if (seconds === 0) {
    clearInterval(timerId);
    console.log('Liftoff!');
  }
}, 1000);

const abortId = setTimeout(() => console.log('ABORT MISSION'), 3000);
clearTimeout(abortId);
console.log('Abort message cancelled');`,
      },
      result: `Countdown started
Abort message cancelled
T-minus 5
T-minus 4
T-minus 3
T-minus 2
T-minus 1
Liftoff!
(one "T-minus" line per second; "ABORT MISSION" never appears)`,
      explanation: 'setInterval returns an id that clearInterval uses to stop the repetition once the count reaches zero; without it the interval would continue forever. The abort timeout is cancelled immediately with clearTimeout, so its callback never runs. The two synchronous logs appear first because the interval callback only runs after 1 second.',
    },
    {
      title: 'Stopwatch in the Page (Start / Stop / Reset)',
      scenario: 'Build a stopwatch UI. Start begins an interval, Stop clears it, Reset sets it back to zero. Prevent multiple intervals when Start is clicked twice, and use Date.now() for accurate time.',
      steps: [
        'Create a time display and three buttons',
        'On Start: if already running, return; save startTime and begin setInterval every 100ms',
        'Each tick: elapsed = Date.now() - startTime + previous elapsed; format as mm:ss.t',
        'On Stop: clearInterval and remember the elapsed time; on Reset: stop and set 0',
        'Click Start, Stop, Start again, then Reset',
      ],
      code: `function start() {
  if (intervalId !== null) return;          // already running
  startTime = Date.now() - elapsed;
  intervalId = setInterval(() => {
    elapsed = Date.now() - startTime;
    display.textContent = format(elapsed);
  }, 100);
}
function stop() {
  clearInterval(intervalId);
  intervalId = null;
}`,
      playground: {
        html: `<div class="watch">
  <p id="display">00:00.0</p>
  <div class="btns">
    <button id="start">Start</button>
    <button id="stop">Stop</button>
    <button id="reset">Reset</button>
  </div>
  <small id="state">stopped</small>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.watch { max-width: 280px; text-align: center; border: 1px solid #ddd; border-radius: 12px; padding: 16px; }
#display { font-size: 2.5rem; font-variant-numeric: tabular-nums; margin: 0 0 12px; }
.btns { display: flex; gap: 8px; justify-content: center; }
button { padding: 8px 12px; border-radius: 6px; cursor: pointer; border: 1px solid #ccc; }
#start { background: #e8f6ee; } #stop { background: #fdecea; }`,
        js: `const display = document.getElementById('display');
const stateEl = document.getElementById('state');
let intervalId = null;
let startTime = 0;
let elapsed = 0;

function format(ms) {
  const totalTenths = Math.floor(ms / 100);
  const tenths = totalTenths % 10;
  const totalSeconds = Math.floor(totalTenths / 10);
  const s = String(totalSeconds % 60).padStart(2, '0');
  const m = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  return m + ':' + s + '.' + tenths;
}

function start() {
  if (intervalId !== null) return;
  startTime = Date.now() - elapsed;
  intervalId = setInterval(() => {
    elapsed = Date.now() - startTime;
    display.textContent = format(elapsed);
  }, 100);
  stateEl.textContent = 'running (interval id ' + intervalId + ')';
}

function stop() {
  clearInterval(intervalId);
  intervalId = null;
  stateEl.textContent = 'stopped at ' + format(elapsed);
}

function reset() {
  stop();
  elapsed = 0;
  display.textContent = format(0);
  stateEl.textContent = 'reset';
}

document.getElementById('start').addEventListener('click', start);
document.getElementById('stop').addEventListener('click', stop);
document.getElementById('reset').addEventListener('click', reset);
console.log(format(83456)); // 01:23.4`,
      },
      result: 'Clicking Start makes the display count up in tenths of a second (00:01.3, 00:02.7 ...). Clicking Start again does nothing extra (no double speed). Stop freezes the time; Start continues from where it stopped; Reset returns to 00:00.0. The console shows 01:23.4 from the format test.',
      explanation: 'The interval only redraws the display; the real elapsed time is computed from Date.now(), so the stopwatch stays accurate even if ticks are delayed. The guard `if (intervalId !== null) return` prevents stacking multiple intervals - a very common bug. clearInterval plus resetting the id to null makes Stop/Start reliable.',
    },
    {
      title: 'Error-First Callbacks and Callback Hell',
      scenario: 'Simulate an online shop backend: login -> get orders -> get order details, each step async with setTimeout. See the nested pyramid, then the same flow flattened with named functions.',
      steps: [
        'Write three fake async functions using setTimeout and error-first callbacks',
        'Call them nested (callback hell) and log the result',
        'Rewrite the flow with named step functions and early returns',
        'Trigger an error by using a wrong password',
        'Click Run and read the console',
      ],
      code: `login('asha', 'secret', (err, user) => {
  if (err) return console.log('Error:', err.message);
  getOrders(user.id, (err, orders) => {
    if (err) return console.log('Error:', err.message);
    getDetails(orders[0], (err, details) => {
      if (err) return console.log('Error:', err.message);
      console.log('Nested result:', details);
    });
  });
});`,
      playground: {
        js: `function login(username, password, callback) {
  setTimeout(() => {
    if (password !== 'secret') return callback(new Error('Wrong password for ' + username));
    callback(null, { id: 7, username });
  }, 50);
}
function getOrders(userId, callback) {
  setTimeout(() => callback(null, ['ORD-1', 'ORD-2']), 50);
}
function getDetails(orderId, callback) {
  setTimeout(() => callback(null, orderId + ': 2 items, Rs 1499'), 50);
}

// 1) Callback hell: each step nested inside the previous one
login('asha', 'secret', (err, user) => {
  if (err) return console.log('Error:', err.message);
  getOrders(user.id, (err, orders) => {
    if (err) return console.log('Error:', err.message);
    getDetails(orders[0], (err, details) => {
      if (err) return console.log('Error:', err.message);
      console.log('Nested result: ' + details);

      // 2) Same flow with named functions (flatter, easier to read)
      runFlat('ravi', 'wrong');
    });
  });
});

function runFlat(username, password) {
  login(username, password, onLogin);

  function onLogin(err, user) {
    if (err) return fail(err);
    getOrders(user.id, onOrders);
  }
  function onOrders(err, orders) {
    if (err) return fail(err);
    getDetails(orders[0], onDetails);
  }
  function onDetails(err, details) {
    if (err) return fail(err);
    console.log('Flat result: ' + details);
  }
  function fail(err) {
    console.log('Flat flow failed: ' + err.message);
  }
}

console.log('Requests started... (this line prints first)');`,
      },
      result: `Requests started... (this line prints first)
Nested result: ORD-1: 2 items, Rs 1499
Flat flow failed: Wrong password for ravi`,
      explanation: 'Each fake API calls back later via setTimeout, so the synchronous log prints first. The nested version works but grows to the right with repeated error checks. The flat version uses named functions and a single fail() handler; with the wrong password, login calls back with an Error first, and the early return stops the chain. Promises (Day 31) solve this even more cleanly with .then chains.',
    },
  ],
  interview: [
    { q: 'What is the difference between setTimeout and setInterval?', a: 'setTimeout runs a callback once after a minimum delay. setInterval runs it repeatedly at the given interval until cleared. Both return an id used by clearTimeout / clearInterval.', level: 'Easy' },
    { q: 'What is the output?\nconsole.log("A");\nsetTimeout(() => console.log("B"), 0);\nconsole.log("C");', a: 'A C B. The timeout callback is queued and only runs after the current synchronous code has finished, even with 0 ms delay.', level: 'Easy' },
    { q: 'What is the output?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', a: '3 3 3. var is function-scoped, so all callbacks share the same i, which is 3 when they run after the loop ends.', level: 'Medium' },
    { q: 'How do you fix the previous loop to print 0 1 2?', a: 'Use let (block-scoped, a new binding per iteration): for (let i = 0; i < 3; i++) setTimeout(() => console.log(i), 0). Or pass i as the third argument of setTimeout, or use a closure (IIFE).', level: 'Medium' },
    { q: 'What is the output?\nsetTimeout(() => console.log("t1"), 20);\nsetTimeout(() => console.log("t2"), 10);\nconsole.log("sync");', a: 'sync t2 t1. Synchronous code first, then timers by expiry time: 10 ms before 20 ms.', level: 'Easy' },
    { q: 'Is the delay in setTimeout guaranteed?', a: 'No, it is a minimum. The callback runs only when the call stack is empty and earlier tasks are done, so a busy main thread delays it. Browsers also clamp nested timers (>= 4 ms after 5 levels) and throttle background tabs.', level: 'Medium' },
    { q: 'What is a callback function?', a: 'A function passed as an argument to another function, to be called by it later (e.g. after an event, timer or async operation) or immediately (e.g. map, forEach).', level: 'Easy' },
    { q: 'What is the error-first callback pattern?', a: 'A Node.js convention where the callback signature is (err, result). If something failed, err is an Error; otherwise err is null and result holds the data. The caller always checks err first.', level: 'Medium' },
    { q: 'What is callback hell and how can you avoid it?', a: 'Deeply nested callbacks for dependent async steps, forming a pyramid that is hard to read, debug and handle errors in. Avoid with named functions, modularisation, early returns and, best, Promises and async/await.', level: 'Medium' },
    { q: 'What is the output?\nconst id = setTimeout(() => console.log("hi"), 100);\nclearTimeout(id);\nconsole.log(typeof id === "number" || typeof id === "object");', a: 'true only; "hi" is never printed because the timer was cancelled. In browsers the id is a number, in Node.js it is a Timeout object, so the expression is true in both.', level: 'Hard' },
    { q: 'What is the output?\nlet n = 0;\nconst t = setInterval(() => {\n  n++;\n  console.log(n);\n  if (n === 3) clearInterval(t);\n}, 10);', a: '1 2 3 (one per tick). The interval stops itself after the third run.', level: 'Easy' },
    { q: 'Why might you prefer recursive setTimeout over setInterval?', a: 'Recursive setTimeout schedules the next run only after the current one finishes, guaranteeing a gap and avoiding overlapping runs when the task (e.g. a network call) takes longer than the interval. It also makes it easy to change the delay each time.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write delayedGreeting(name, ms) that logs "Hello, <name>!" after ms milliseconds, and call it for three names with delays 300, 100 and 200. Predict the order.',
      hint: 'setTimeout with extra argument or closure. Order follows the delays.',
      solution: `function delayedGreeting(name, ms) {
  setTimeout(() => console.log('Hello, ' + name + '!'), ms);
}
delayedGreeting('Asha', 300);
delayedGreeting('Ravi', 100);
delayedGreeting('Meera', 200);
// Hello, Ravi! -> Hello, Meera! -> Hello, Asha!`,
    },
    {
      task: 'Build a digital clock on a page that updates every second (HH:MM:SS) and a button to pause/resume it.',
      hint: 'Use setInterval with a function that formats new Date(); store the id; clearInterval to pause.',
      solution: `<h1 id="clock"></h1>
<button id="toggle">Pause</button>
<script>
const clock = document.getElementById('clock');
const btn = document.getElementById('toggle');
let id = null;
const pad = n => String(n).padStart(2, '0');
function tick() {
  const d = new Date();
  clock.textContent = pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
}
function startClock() { tick(); id = setInterval(tick, 1000); btn.textContent = 'Pause'; }
function pauseClock() { clearInterval(id); id = null; btn.textContent = 'Resume'; }
btn.addEventListener('click', () => (id ? pauseClock() : startClock()));
startClock();
</script>`,
    },
    {
      task: 'Show a "Session will expire" warning 5 seconds after the last click anywhere on the page. Every click should reset the timer.',
      hint: 'On each click: clearTimeout(id); id = setTimeout(showWarning, 5000);',
      solution: `<p id="warn"></p>
<script>
let idleId;
function resetIdle() {
  clearTimeout(idleId);
  document.getElementById('warn').textContent = '';
  idleId = setTimeout(() => {
    document.getElementById('warn').textContent = 'Session will expire soon. Click anywhere to stay active.';
  }, 5000);
}
document.addEventListener('click', resetIdle);
resetIdle();
</script>`,
    },
    {
      task: 'Write an error-first async function divideLater(a, b, callback) that calls back after 200ms with an Error if b is 0, otherwise with the result. Use it for (10, 2) and (5, 0).',
      hint: 'setTimeout(() => b === 0 ? callback(new Error(...)) : callback(null, a / b), 200)',
      solution: `function divideLater(a, b, callback) {
  setTimeout(() => {
    if (b === 0) return callback(new Error('Cannot divide by zero'));
    callback(null, a / b);
  }, 200);
}
function print(err, result) {
  if (err) return console.log('Error:', err.message);
  console.log('Result:', result);
}
divideLater(10, 2, print); // Result: 5
divideLater(5, 0, print);  // Error: Cannot divide by zero`,
    },
    {
      task: 'Create a text "typewriter" effect: reveal the string "Learning async JavaScript..." one character every 80ms inside a <p>, then stop the interval.',
      hint: 'Keep an index; on each tick add text[index++]; clearInterval when index === text.length.',
      solution: `<p id="type"></p>
<script>
const text = 'Learning async JavaScript...';
const p = document.getElementById('type');
let index = 0;
const id = setInterval(() => {
  p.textContent += text[index];
  index++;
  if (index === text.length) clearInterval(id);
}, 80);
</script>`,
    },
  ],
  quiz: [
    { question: 'What does setTimeout(fn, 0) do?', options: ['Runs fn immediately, before the next line', 'Runs fn after the current synchronous code finishes', 'Never runs fn', 'Runs fn every 0 ms'], answer: 1, explanation: '0 ms timeouts are queued and run after the current code completes.' },
    { question: 'How do you stop an interval created with const id = setInterval(fn, 1000)?', options: ['clearTimeout(fn)', 'stopInterval(id)', 'clearInterval(id)', 'id.stop()'], answer: 2, explanation: 'clearInterval takes the id returned by setInterval.' },
    { question: 'In an error-first callback, what is the first argument when everything succeeds?', options: ['null', 'The result', 'true', 'An empty Error'], answer: 0, explanation: 'err is null on success; the result is the second argument.' },
    { question: 'What is printed? console.log(1); setTimeout(() => console.log(2), 10); setTimeout(() => console.log(3), 0); console.log(4);', options: ['1 2 3 4', '1 3 2 4', '1 4 2 3', '1 4 3 2'], answer: 3, explanation: 'Sync logs first (1, 4), then timers by delay (3 at 0 ms, 2 at 10 ms).' },
    { question: 'What is "callback hell"?', options: ['A callback that throws an error', 'Deeply nested callbacks that are hard to read and maintain', 'A callback that is never called', 'Using too many setInterval calls'], answer: 1, explanation: 'The pyramid of nested async callbacks; Promises and async/await fix it.' },
  ],
};
