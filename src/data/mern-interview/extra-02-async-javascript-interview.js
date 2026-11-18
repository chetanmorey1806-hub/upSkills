export default {
  id: 'extra-02-async-javascript-interview',
  title: 'Async JavaScript Interview: Event Loop, Microtasks vs Macrotasks, Promises, async/await and Output Puzzles',
  module: 'Interview: JavaScript',
  extraNo: 2,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Async JavaScript is the most-asked topic after closures in MERN interviews. Revise the event loop, task queues, promises, the Promise combinators and async/await, then practise the classic "predict the output" puzzles until you can solve them in under a minute.',
  objectives: [
    'Explain the call stack, Web APIs, task (macrotask) queue, microtask queue and the event loop',
    'Solve output-order puzzles mixing setTimeout, promises, queueMicrotask and async/await',
    'Explain promise states, chaining and error handling, and compare Promise.all, allSettled, race and any',
    'Write correct async/await code: sequential vs parallel, try/catch, the forEach trap',
    'Answer callback hell, AbortController and "is JavaScript single-threaded?" questions',
  ],
  theory: [
    {
      heading: 'Single thread, call stack and the event loop',
      content: `JavaScript runs your code on **one main thread** with one **call stack**, so only one piece of JS runs at a time. It still handles many things "at once" because slow work (timers, network, file I/O) is handed to the **runtime** – Web APIs in the browser, libuv in Node.js – which runs it in the background.

When that background work finishes, its callback is placed in a queue. The **event loop** is a loop that keeps doing:
1. Run the current task until the call stack is empty.
2. Run ALL microtasks in the microtask queue (including new ones added while draining).
3. (Browser) render if needed.
4. Take the NEXT macrotask from the task queue and repeat.

So: **synchronous code → all microtasks → one macrotask → all microtasks → next macrotask...**

Analogy: a single cashier (the thread). Customers who need a coffee made (async work) step aside; the barista (Web API) prepares it, then they rejoin a queue. VIP customers (microtasks) are always served before the normal queue.`,
      tip: 'How to answer "What is the event loop?": define it in one line ("the mechanism that moves callbacks from the queues to the call stack when the stack is empty"), then draw stack → Web APIs → queues → loop, then say "microtasks have priority over macrotasks".',
    },
    {
      heading: 'Microtasks vs macrotasks',
      content: `**Macrotasks (tasks):** \`setTimeout\`, \`setInterval\`, I/O callbacks, UI events (click), \`MessageChannel\`, and in Node \`setImmediate\`.

**Microtasks:** promise reactions (\`.then/.catch/.finally\`), code after \`await\`, \`queueMicrotask()\`, \`MutationObserver\`. In Node.js, \`process.nextTick\` callbacks run even before promise microtasks.

Key rules for puzzles:
- The body of \`new Promise(executor)\` runs **synchronously**.
- An \`async\` function runs synchronously until its first \`await\`; the rest is a microtask.
- Each \`.then\` in a chain is scheduled only after the previous one runs, so chained thens interleave with other microtasks.
- \`setTimeout(fn, 0)\` means "at least 0 ms", and always after the current microtasks. Browsers clamp nested timers to ~4 ms.
- A microtask that keeps scheduling microtasks can **starve** the macrotask queue and freeze the UI.`,
      syntax: `console.log(1);
setTimeout(() => console.log(2));
Promise.resolve().then(() => console.log(3));
console.log(4);
// 1 4 3 2`,
      tip: 'Solve puzzles with 3 columns on paper: SYNC output, MICROTASK queue, MACROTASK queue. Fill them line by line, then drain.',
    },
    {
      heading: 'Callbacks, callback hell and promises',
      content: `A **callback** is a function passed to another function to be called later. Nested callbacks for dependent steps create **callback hell** (pyramid of doom) and **inversion of control** (you trust a library to call your callback exactly once).

A **Promise** is an object representing the eventual result of an async operation. States: **pending → fulfilled** (with a value) or **pending → rejected** (with a reason). Once settled it never changes (immutable).

- \`.then(onFulfilled, onRejected)\` returns a NEW promise → enables **chaining**.
- Returning a value from then passes it to the next then; returning a promise makes the chain wait for it.
- Throwing inside then → the chain jumps to the next \`.catch\`.
- \`.finally\` runs on both outcomes (cleanup: hide loader) and passes the result through.
- An unhandled rejection logs a warning in browsers and **crashes** Node.js (default since Node 15).

Create one: \`new Promise((resolve, reject) => {...})\`; shortcuts \`Promise.resolve(v)\`, \`Promise.reject(err)\`. Convert Node callback APIs with \`util.promisify\`.`,
      syntax: `getUser(1)
  .then((user) => getOrders(user.id))   // returns a promise -> chain waits
  .then((orders) => console.log(orders.length))
  .catch((err) => console.error('Failed:', err.message))
  .finally(() => console.log('done'));`,
    },
    {
      heading: 'Promise combinators: all, allSettled, race, any',
      content: `- **Promise.all(list)** – waits for all; resolves with an array of values IN INPUT ORDER; rejects as soon as ANY rejects (fail-fast). Use for parallel calls that all must succeed (dashboard data).
- **Promise.allSettled(list)** – waits for all; never rejects; gives \`{status, value}\` / \`{status, reason}\` objects. Use when partial success is fine (sending 50 emails).
- **Promise.race(list)** – settles with the FIRST settled promise (fulfil or reject). Use for timeouts.
- **Promise.any(list)** – resolves with the first FULFILLED promise; rejects with an **AggregateError** only if all reject. Use for fastest mirror/CDN.
- **Promise.withResolvers()** (ES2024) – returns \`{ promise, resolve, reject }\` so you can resolve from outside.

Note: none of these cancel the other promises. Promise.all does not stop the remaining requests on failure; use AbortController for real cancellation.`,
      tip: 'Common follow-up: "Write Promise.all yourself" – it is solved in the next topic (coding round). Know it by heart.',
    },
    {
      heading: 'async/await',
      content: `\`async\` functions always return a promise. \`await\` pauses only that function (not the thread) until the promise settles, then resumes it as a microtask. It is syntax sugar over promises that makes async code read like sync code.

- Errors: use **try/catch/finally** around awaits (or \`.catch\` on the returned promise).
- **Sequential vs parallel:** \`await a(); await b();\` runs one after another. For independent work start both first: \`const [x, y] = await Promise.all([a(), b()]);\`
- **forEach does not wait** for async callbacks – use \`for...of\` (sequential) or \`Promise.all(arr.map(...))\` (parallel).
- **Top-level await** works in ES modules (and Node ESM), not in classic scripts or CommonJS.
- Returning \`await promise\` inside try is needed if you want the catch to handle its rejection.
- Cancel fetches with **AbortController**: \`fetch(url, { signal })\` then \`controller.abort()\`; or \`AbortSignal.timeout(5000)\`.`,
      syntax: `async function loadDashboard(id) {
  try {
    const [user, orders] = await Promise.all([
      fetch('/api/users/' + id).then((r) => r.json()),
      fetch('/api/orders?user=' + id).then((r) => r.json()),
    ]);
    return { user, orders };
  } catch (err) {
    console.error('Dashboard failed', err);
    throw err;
  }
}`,
      tip: 'Mention "fetch only rejects on network errors, not on 404/500 – check response.ok". Interviewers love this detail.',
    },
  ],
  examples: [
    {
      title: 'Puzzle 1: sync code, promises, queueMicrotask and setTimeout',
      scenario: 'The most common event-loop question. Predict the order before running.',
      steps: ['Write SYNC / MICRO / MACRO columns', 'Fill them line by line', 'Run and compare'],
      code: `console.log("1: script start");
setTimeout(() => console.log("2: setTimeout"), 0);
Promise.resolve()
  .then(() => console.log("3: promise 1"))
  .then(() => console.log("4: promise 2"));
queueMicrotask(() => console.log("5: queueMicrotask"));
console.log("6: script end");`,
      playground: {
        html: '<p>Open the console to see the output order.</p>',
        js: `console.log("1: script start");
setTimeout(() => console.log("2: setTimeout"), 0);
Promise.resolve()
  .then(() => console.log("3: promise 1"))
  .then(() => console.log("4: promise 2"));
queueMicrotask(() => console.log("5: queueMicrotask"));
console.log("6: script end");`,
      },
      result: `1: script start
6: script end
3: promise 1
5: queueMicrotask
4: promise 2
2: setTimeout`,
      explanation: `Sync lines 1 and 6 print first. Microtask queue at the end of the script: [promise 1, queueMicrotask]. "promise 2" is NOT in the queue yet – it is added only when "promise 1" finishes. So the order is 3, 5, then 4. Only after the microtask queue is empty does the event loop take the setTimeout macrotask (2).`,
    },
    {
      title: 'Puzzle 2: async/await and the Promise executor',
      scenario: 'Checks that you know async functions run synchronously until the first await, and that the executor is synchronous.',
      steps: ['Mark which lines are synchronous', 'Remember: code after await becomes a microtask', 'Run'],
      code: `async function a() {
  console.log("A1");
  await b();
  console.log("A2");
}
async function b() {
  console.log("B");
}
console.log("start");
setTimeout(() => console.log("timeout"), 0);
a();
new Promise((resolve) => {
  console.log("P executor");
  resolve();
}).then(() => console.log("P then"));
console.log("end");`,
      playground: {
        html: '<p>Open the console to see the output order.</p>',
        js: `async function a() {
  console.log("A1");
  await b();
  console.log("A2");
}
async function b() {
  console.log("B");
}
console.log("start");
setTimeout(() => console.log("timeout"), 0);
a();
new Promise((resolve) => {
  console.log("P executor");
  resolve();
}).then(() => console.log("P then"));
console.log("end");`,
      },
      result: `start
A1
B
P executor
end
A2
P then
timeout`,
      explanation: `a() prints A1 and calls b() synchronously (B). The await pauses a and queues its continuation (A2) as a microtask. The Promise executor runs immediately (P executor) and its then is queued after A2. "end" finishes the sync part. Microtasks run in order: A2, P then. Finally the timer macrotask: timeout.`,
    },
    {
      title: 'Puzzle 3: microtasks inside macrotasks',
      scenario: 'Harder version: a timer schedules a promise, and a promise schedules a timer.',
      steps: ['Track the queues after each step', 'After EVERY macrotask, drain microtasks', 'Run'],
      code: `console.log("A");
setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);
Promise.resolve().then(() => {
  console.log("D");
  setTimeout(() => console.log("E"), 0);
});
setTimeout(() => console.log("F"), 0);
(async () => {
  console.log("G");
  await null;
  console.log("H");
})();
console.log("I");`,
      playground: {
        html: '<p>Open the console to see the output order.</p>',
        js: `console.log("A");
setTimeout(() => {
  console.log("B");
  Promise.resolve().then(() => console.log("C"));
}, 0);
Promise.resolve().then(() => {
  console.log("D");
  setTimeout(() => console.log("E"), 0);
});
setTimeout(() => console.log("F"), 0);
(async () => {
  console.log("G");
  await null;
  console.log("H");
})();
console.log("I");`,
      },
      result: `A
G
I
D
H
B
C
F
E`,
      explanation: `Sync: A, G (async IIFE runs until await), I. Microtasks: D (which adds timer E to the END of the macrotask queue), then H. Macrotask queue is now [B-timer, F-timer, E-timer]. Run B → it queues microtask C → microtasks drain before the next task → C. Then F, then E.`,
    },
    {
      title: 'Promise.all vs allSettled vs race vs any',
      scenario: 'See exactly how each combinator behaves with success and failure.',
      steps: ['Read the wait() helper (resolves or rejects after ms)', 'Run', 'Match each line with the theory'],
      code: `const wait = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));

async function main() {
  console.log("all:", await Promise.all([wait(30, "A"), wait(10, "B")]));
  try {
    await Promise.all([wait(10, "ok"), wait(20, "boom", true)]);
  } catch (e) {
    console.log("all failed:", e.message);
  }
  const settled = await Promise.allSettled([wait(10, "ok"), wait(20, "boom", true)]);
  console.log("allSettled:", settled.map((r) => r.status + ":" + (r.value ?? r.reason.message)).join(", "));
  console.log("race:", await Promise.race([wait(30, "slow"), wait(10, "fast")]));
  console.log("any:", await Promise.any([wait(10, "x", true), wait(20, "first success")]));
  try {
    await Promise.any([wait(10, "e1", true), wait(5, "e2", true)]);
  } catch (e) {
    console.log("any failed:", e.constructor.name, e.errors.map((x) => x.message));
  }
}
main();`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `const wait = (ms, value, fail = false) =>
  new Promise((resolve, reject) =>
    setTimeout(() => (fail ? reject(new Error(value)) : resolve(value)), ms));

async function main() {
  console.log("all:", await Promise.all([wait(30, "A"), wait(10, "B")]));
  try {
    await Promise.all([wait(10, "ok"), wait(20, "boom", true)]);
  } catch (e) {
    console.log("all failed:", e.message);
  }
  const settled = await Promise.allSettled([wait(10, "ok"), wait(20, "boom", true)]);
  console.log("allSettled:", settled.map((r) => r.status + ":" + (r.value ?? r.reason.message)).join(", "));
  console.log("race:", await Promise.race([wait(30, "slow"), wait(10, "fast")]));
  console.log("any:", await Promise.any([wait(10, "x", true), wait(20, "first success")]));
  try {
    await Promise.any([wait(10, "e1", true), wait(5, "e2", true)]);
  } catch (e) {
    console.log("any failed:", e.constructor.name, e.errors.map((x) => x.message));
  }
}
main();`,
      },
      result: `all: [ 'A', 'B' ]
all failed: boom
allSettled: fulfilled:ok, rejected:boom
race: fast
any: first success
any failed: AggregateError [ 'e1', 'e2' ]`,
      explanation: `Promise.all keeps INPUT order (A before B) even though B finished first, and rejects with the first error. allSettled reports every outcome. race returns whichever settles first. any skips rejections and returns the first success; when all fail it rejects with AggregateError whose errors array is in input order (e1, e2), not finishing order. (The browser console may format arrays as Array(2).)`,
    },
    {
      title: 'Sequential vs parallel await, and the forEach trap',
      scenario: 'A practical question: "Your API calls are slow, how do you speed them up?"',
      steps: ['Compare the for...of version with the Promise.all version', 'Run and check the timing flags', 'Notice what forEach returns'],
      code: `const fakeFetch = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, name: "User" + id }), 50));

async function sequential(ids) {
  const t = Date.now();
  const out = [];
  for (const id of ids) out.push(await fakeFetch(id));
  return { names: out.map((u) => u.name), slow: Date.now() - t >= 140 };
}
async function parallel(ids) {
  const t = Date.now();
  const out = await Promise.all(ids.map(fakeFetch));
  return { names: out.map((u) => u.name), fast: Date.now() - t < 100 };
}
(async () => {
  console.log("sequential", await sequential([1, 2, 3]));
  console.log("parallel", await parallel([1, 2, 3]));
  const r = [1, 2, 3].forEach(async (id) => await fakeFetch(id));
  console.log("forEach returns:", r);
})();`,
      playground: {
        html: '<p>Open the console to see the output.</p>',
        js: `const fakeFetch = (id) =>
  new Promise((resolve) => setTimeout(() => resolve({ id, name: "User" + id }), 50));

async function sequential(ids) {
  const t = Date.now();
  const out = [];
  for (const id of ids) out.push(await fakeFetch(id));
  return { names: out.map((u) => u.name), slow: Date.now() - t >= 140 };
}
async function parallel(ids) {
  const t = Date.now();
  const out = await Promise.all(ids.map(fakeFetch));
  return { names: out.map((u) => u.name), fast: Date.now() - t < 100 };
}
(async () => {
  console.log("sequential", await sequential([1, 2, 3]));
  console.log("parallel", await parallel([1, 2, 3]));
  const r = [1, 2, 3].forEach(async (id) => await fakeFetch(id));
  console.log("forEach returns:", r);
})();`,
      },
      result: `sequential { names: [ 'User1', 'User2', 'User3' ], slow: true }
parallel { names: [ 'User1', 'User2', 'User3' ], fast: true }
forEach returns: undefined`,
      explanation: `for...of with await waits ~50 ms per call (~150 ms total). Promise.all starts all three at once, so the total is ~50 ms. forEach ignores the promises returned by the async callback – it returns undefined and cannot be awaited, so code after it runs before the fetches finish. Use for...of when order/rate matters, Promise.all when calls are independent.`,
    },
  ],
  interview: [
    { level: 'Easy', q: 'Is JavaScript single-threaded? Then how does it do async work?', a: `Yes, JavaScript executes on a single main thread with one call stack, so only one piece of JS code runs at a time.
Async work is possible because the RUNTIME (browser Web APIs or Node's libuv thread pool and OS) does slow tasks like timers, network and file I/O in the background. When they finish, their callbacks go into queues, and the event loop pushes them onto the call stack when it is empty.
For CPU-heavy work you can use real extra threads: Web Workers in the browser, worker_threads in Node.` },
    { level: 'Easy', q: 'What is the event loop?', a: `The event loop is the mechanism that coordinates the call stack and the callback queues. Repeatedly: when the call stack is empty, it runs all pending microtasks, (in browsers) lets the page render, then takes the next macrotask from the task queue and runs it.
Example: console.log(1); setTimeout(() => console.log(2)); Promise.resolve().then(() => console.log(3)); console.log(4); → 1 4 3 2.
It is what lets single-threaded JS stay non-blocking.` },
    { level: 'Medium', q: 'What is the difference between microtasks and macrotasks? Give examples.', a: `Macrotasks: setTimeout, setInterval, I/O, UI events, setImmediate (Node), MessageChannel.
Microtasks: promise .then/.catch/.finally callbacks, continuation after await, queueMicrotask, MutationObserver (and process.nextTick in Node, which runs even earlier).
Priority: after each macrotask (and after the main script), the event loop empties the ENTIRE microtask queue before taking the next macrotask. That is why a resolved promise's then always runs before a setTimeout(fn, 0).
Risk: endlessly scheduling microtasks starves timers and rendering.` },
    { level: 'Easy', q: 'Why does setTimeout(fn, 0) not run immediately?', a: `0 ms is the MINIMUM delay, not a guarantee. The callback is put into the macrotask queue after the timer expires and runs only when (1) the current synchronous code finishes, (2) all microtasks are drained, and (3) earlier macrotasks have run. Browsers also clamp nested timers (depth > 5) to at least 4 ms. So setTimeout(fn, 0) means "run after the current work".` },
    { level: 'Easy', q: 'What is a callback and what is callback hell?', a: `A callback is a function passed as an argument to be executed later, e.g. fs.readFile(path, (err, data) => {...}) or button.addEventListener('click', handler).
Callback hell is deeply nested callbacks for dependent async steps:
login(u, () => getProfile(() => getOrders(() => getInvoice(() => {...}))));
Problems: hard to read, repetitive error handling at each level, and inversion of control.
Solutions: named functions, promises with chaining, and async/await.` },
    { level: 'Easy', q: 'What is a Promise? What are its states?', a: `A Promise is an object representing the eventual completion or failure of an async operation and its resulting value.
States: pending (initial), fulfilled (resolve(value) was called), rejected (reject(reason) was called). Fulfilled and rejected are "settled"; a settled promise never changes again.
const p = new Promise((resolve, reject) => { setTimeout(() => resolve('done'), 1000); });
p.then(v => console.log(v)).catch(e => console.error(e));` },
    { level: 'Medium', q: 'How does promise chaining work?', a: `.then() always returns a NEW promise, so you can call .then again on it.
- If the handler returns a value, the next then receives it.
- If the handler returns a promise, the chain waits for it and passes its result on.
- If the handler throws (or returns a rejected promise), the chain skips to the nearest .catch.
fetch('/api/user').then(r => r.json()).then(user => fetch('/api/orders/' + user.id)).then(r => r.json()).then(orders => console.log(orders)).catch(err => console.error(err));
A common bug is forgetting to RETURN the inner promise, which breaks the chain.` },
    { level: 'Medium', q: 'Promise.all vs Promise.allSettled vs Promise.race vs Promise.any?', a: `- all: resolves with all values (input order) when ALL succeed; rejects immediately on the first rejection. Use for parallel requests that all must succeed.
- allSettled: waits for all; returns [{status:'fulfilled', value} | {status:'rejected', reason}]. Use when you need every outcome (bulk emails, partial dashboards).
- race: settles with the first promise to settle (success OR failure). Use for timeouts.
- any: resolves with the first SUCCESS; rejects with AggregateError if all fail. Use for the fastest of several mirrors.
None of them cancel the remaining promises.` },
    { level: 'Medium', q: 'How do you add a timeout to a fetch call?', a: `Option 1 (modern): AbortSignal.timeout
const res = await fetch(url, { signal: AbortSignal.timeout(5000) }); // throws TimeoutError after 5 s
Option 2: AbortController
const c = new AbortController(); const t = setTimeout(() => c.abort(), 5000);
try { const res = await fetch(url, { signal: c.signal }); } finally { clearTimeout(t); }
Option 3: Promise.race with a rejecting timer – but this does not actually stop the request; abort does.` },
    { level: 'Easy', q: 'What is async/await? How is it related to promises?', a: `async/await is syntax built on top of promises.
- An async function always returns a promise (a returned value is wrapped with Promise.resolve; a thrown error becomes a rejection).
- await pauses the async function until the promise settles and gives its value (or throws its error) – without blocking the main thread.
async function getUser(id) {
  const res = await fetch('/api/users/' + id);
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.json();
}
It makes async code read top-to-bottom like sync code and lets you use normal try/catch and loops.` },
    { level: 'Easy', q: 'How do you handle errors with async/await?', a: `Wrap awaits in try/catch (and finally for cleanup):
async function save(data) {
  setLoading(true);
  try {
    const res = await fetch('/api/items', { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } });
    if (!res.ok) throw new Error('Server error ' + res.status);
    return await res.json();
  } catch (err) {
    console.error(err);
    throw err;
  } finally {
    setLoading(false);
  }
}
Alternatively call save().catch(handler). In Express 5, rejected promises in async route handlers are passed to error middleware automatically.` },
    { level: 'Medium', q: 'How do you run multiple async calls in parallel with async/await?', a: `Start the promises first, then await them together:
const [user, posts] = await Promise.all([getUser(id), getPosts(id)]);
Writing const user = await getUser(); const posts = await getPosts(); runs them one after another and is slower when they are independent.
Use sequential awaits only when a step depends on the previous result or you must limit load (rate limits). For large lists, use a concurrency limit (batches or a pool) instead of firing thousands of requests at once.` },
    { level: 'Medium', q: 'Why does await not work inside forEach?', a: `forEach calls the callback and ignores its return value. An async callback returns a promise, which forEach throws away, so forEach finishes immediately and cannot be awaited.
// Wrong
items.forEach(async (i) => await save(i)); console.log('done'); // prints before saves finish
// Sequential
for (const i of items) await save(i);
// Parallel
await Promise.all(items.map((i) => save(i)));
Same issue with filter/reduce/some using async callbacks.` },
    { level: 'Medium', q: 'What is the output? console.log("A"); setTimeout(() => console.log("B")); Promise.resolve().then(() => console.log("C")); console.log("D");', a: `A D C B.
A and D are synchronous. The then callback (C) is a microtask; the timer (B) is a macrotask. After the script finishes, all microtasks run first (C), then the event loop takes the timer (B).` },
    { level: 'Hard', q: 'What is the output? async function f() { console.log(1); await null; console.log(2); } f(); console.log(3);', a: `1 3 2.
f runs synchronously until the first await, printing 1. await null schedules the rest of f as a microtask and returns control to the caller, so 3 prints. When the call stack is empty, the microtask resumes f and prints 2.
Key rule: code BEFORE the first await is synchronous; code AFTER it is asynchronous, even when awaiting a non-promise value.` },
    { level: 'Medium', q: 'Is the Promise constructor executor synchronous or asynchronous?', a: `Synchronous. new Promise(executor) calls the executor immediately, during construction.
console.log(1);
new Promise((res) => { console.log(2); res(); }).then(() => console.log(4));
console.log(3);
// 1 2 3 4
Only the then/catch/finally handlers are asynchronous (microtasks). Also, calling resolve twice or calling reject after resolve has no effect.` },
    { level: 'Hard', q: 'What happens to an unhandled promise rejection?', a: `If a rejected promise has no catch handler by the time the microtask queue is processed:
- Browser: an "Uncaught (in promise)" error is logged and an unhandledrejection event fires on window.
- Node.js (15+): the process crashes by default (--unhandled-rejections=throw), after an 'unhandledRejection' event on process.
Best practice: always end chains with .catch or wrap awaits in try/catch, add a global process.on('unhandledRejection') logger in servers, and use Express 5 or an async wrapper so route errors reach error middleware.` },
    { level: 'Medium', q: 'What is the difference between process.nextTick, setImmediate and setTimeout in Node.js?', a: `- process.nextTick(fn): runs right after the current operation, before promise microtasks and before the event loop continues. Overuse can starve I/O.
- Promise microtasks: run after the nextTick queue.
- setTimeout(fn, 0): timers phase of the event loop.
- setImmediate(fn): check phase, right after the poll (I/O) phase.
Inside an I/O callback, setImmediate always runs before setTimeout 0; at the top level of the main module their order is not guaranteed.
Order example at top level: sync → nextTick → promise → (timeout/immediate).` },
    { level: 'Medium', q: 'How do you convert a callback-based function into a promise?', a: `Wrap it in new Promise:
function readFileAsync(path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', (err, data) => (err ? reject(err) : resolve(data)));
  });
}
In Node use util.promisify(fs.readFile) or the built-in promise APIs: import { readFile } from 'node:fs/promises'.
Browser example: promisify setTimeout: const sleep = (ms) => new Promise((r) => setTimeout(r, ms));` },
    { level: 'Hard', q: 'What does .finally() do and what value does it pass on?', a: `finally(cb) runs cb when the promise settles, whether fulfilled or rejected. The callback receives no arguments and its return value is IGNORED – the original value or error passes through to the next handler. Exception: if the finally callback throws or returns a rejected promise, that rejection replaces the result.
Promise.resolve(5).finally(() => 10).then(v => console.log(v)); // 5
Use it for cleanup: hide loaders, close DB connections, clear timers.` },
    { level: 'Hard', q: 'What is the difference between return and return await inside an async function?', a: `Outside try/catch they behave the same (an async function adopts the returned promise).
Inside try/catch they differ:
async function f() { try { return fetchData(); } catch (e) { /* NOT reached if fetchData rejects */ } }
async function g() { try { return await fetchData(); } catch (e) { /* reached */ } }
With return await, the rejection is thrown inside the try block, so catch handles it. return await also gives better stack traces.` },
    { level: 'Medium', q: 'Does await block the main thread?', a: `No. await only suspends the current async function. Control returns to the caller, and the event loop continues running other code, events and rendering. When the awaited promise settles, the function resumes as a microtask.
However, CPU-heavy synchronous code (a huge loop, JSON.parse of a giant string) DOES block the thread, async or not. Move such work to Web Workers / worker_threads or split it into chunks.` },
    { level: 'Hard', q: 'How would you limit concurrency, e.g. call an API for 1000 ids but at most 5 at a time?', a: `Use a worker pool: start N workers that each pull the next id from a shared index.
async function mapLimit(items, limit, fn) {
  const results = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}
Libraries: p-limit, p-map. This avoids rate limiting (HTTP 429) and memory spikes.` },
    { level: 'Hard', q: 'How do you implement retry with exponential backoff?', a: `async function retry(fn, retries = 3, delay = 500) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      const wait = delay * 2 ** attempt + Math.random() * 100; // backoff + jitter
      await new Promise((r) => setTimeout(r, wait));
    }
  }
}
Retry only transient errors (network errors, 429, 503), not 400/401. Jitter prevents many clients retrying at the same moment.` },
    { level: 'Medium', q: 'What is the difference between fetch and axios regarding errors?', a: `fetch rejects only on network failures (DNS, offline, CORS block, abort). For HTTP errors like 404 or 500 it RESOLVES; you must check response.ok / response.status yourself. You also call res.json() manually and stringify the body.
axios rejects for any status outside 2xx (configurable with validateStatus), parses JSON automatically, supports interceptors (attach JWT, refresh token), timeouts and request cancellation via AbortController.
const res = await fetch(url); if (!res.ok) throw new Error(res.status);` },
    { level: 'Medium', q: 'What is AbortController and where do you use it in React?', a: `AbortController lets you cancel async operations that accept a signal (fetch, event listeners, many Node APIs).
useEffect(() => {
  const controller = new AbortController();
  fetch('/api/search?q=' + q, { signal: controller.signal })
    .then((r) => r.json()).then(setResults)
    .catch((e) => { if (e.name !== 'AbortError') setError(e); });
  return () => controller.abort();
}, [q]);
This prevents race conditions (an old slow response overwriting a newer one) and setting state after unmount.` },
    { level: 'Hard', q: 'What is a race condition in frontend async code and how do you prevent it?', a: `A race condition happens when the result depends on the order in which async operations finish. Example: typing "re" then "react" in a search box; the "re" request returns AFTER "react" and overwrites the correct results.
Fixes:
1. Abort the previous request with AbortController (best).
2. Ignore stale responses: keep a request id or an "ignore" flag set in the useEffect cleanup.
3. Debounce input to reduce requests.
4. Use libraries like TanStack Query that handle this.` },
  ],
  practice: [
    {
      task: 'Write sleep(ms) that returns a promise, then use it to print "Ready", "Set", "Go" one second apart using async/await.',
      hint: 'new Promise(resolve => setTimeout(resolve, ms)).',
      solution: `const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function countdown() {
  for (const word of ['Ready', 'Set', 'Go']) {
    console.log(word);
    await sleep(1000);
  }
}
countdown();`,
    },
    {
      task: 'Write withTimeout(promise, ms) that rejects with Error("Timeout") if the promise does not settle within ms. Clear the timer when done.',
      hint: 'Promise.race with a timer promise; clear the timer in finally.',
      solution: `function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Timeout')), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

const slow = new Promise((r) => setTimeout(() => r('data'), 2000));
withTimeout(slow, 500).then(console.log).catch((e) => console.log(e.message)); // Timeout
withTimeout(Promise.resolve('fast'), 500).then(console.log);                  // fast`,
    },
    {
      task: 'Convert this callback-hell code into (a) a promise chain and (b) async/await: getUser(1, (u) => getOrders(u.id, (o) => getDetails(o[0], (d) => console.log(d)))). Assume promise versions getUserP, getOrdersP, getDetailsP exist.',
      hint: 'Return each promise inside then. With async/await, use try/catch.',
      solution: `// (a) Promise chain
getUserP(1)
  .then((u) => getOrdersP(u.id))
  .then((orders) => getDetailsP(orders[0]))
  .then((details) => console.log(details))
  .catch((err) => console.error('Failed:', err));

// (b) async/await
async function showFirstOrder() {
  try {
    const user = await getUserP(1);
    const orders = await getOrdersP(user.id);
    const details = await getDetailsP(orders[0]);
    console.log(details);
  } catch (err) {
    console.error('Failed:', err);
  }
}
showFirstOrder();`,
    },
    {
      task: 'Write retry(fn, retries, delay) that calls an async fn and retries on failure with exponential backoff (delay, 2*delay, 4*delay...). Test it with a function that fails twice then succeeds.',
      hint: 'Loop with try/catch, await a sleep between attempts.',
      solution: `const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function retry(fn, retries = 3, delay = 100) {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt >= retries) throw err;
      console.log('Attempt ' + (attempt + 1) + ' failed, retrying in ' + delay * 2 ** attempt + 'ms');
      await sleep(delay * 2 ** attempt);
    }
  }
}

let calls = 0;
const flaky = async () => {
  calls++;
  if (calls < 3) throw new Error('Network error');
  return 'Success on call ' + calls;
};
retry(flaky).then(console.log).catch(console.error);
// Attempt 1 failed, retrying in 100ms
// Attempt 2 failed, retrying in 200ms
// Success on call 3`,
    },
    {
      task: 'Predict the output, then verify: console.log(1); setTimeout(() => console.log(2), 0); Promise.resolve().then(() => { console.log(3); return Promise.resolve(); }).then(() => console.log(4)); Promise.resolve().then(() => console.log(5)).then(() => console.log(6)).then(() => console.log(7)).then(() => console.log(8)); console.log(9);',
      hint: 'Returning a promise from then costs extra microtask ticks before the next then runs.',
      solution: `// Output:
// 1
// 9
// 3
// 5
// 6
// 7
// 4
// 8
// 2
// Explanation: 1 and 9 are sync. Microtasks interleave: 3, 5, then 6.
// Because the first chain RETURNED a promise from then, resolving with it
// takes 2 extra microtask ticks, so 4 is delayed until after 6 and 7
// (it runs between 7 and 8).
// The setTimeout (2) runs last because it is a macrotask.`,
    },
  ],
  quiz: [
    {
      question: 'What is printed? console.log("a"); setTimeout(() => console.log("b"), 0); Promise.resolve().then(() => console.log("c")); console.log("d");',
      options: ['a b c d', 'a d b c', 'a d c b', 'a c d b'],
      answer: 2,
      explanation: 'Sync code first (a, d), then all microtasks (c), then the macrotask (b).',
    },
    {
      question: 'Which one is a microtask?',
      options: ['A promise .then callback', 'setTimeout callback', 'setInterval callback', 'A click event handler'],
      answer: 0,
      explanation: 'Promise reactions, await continuations and queueMicrotask are microtasks; timers and UI events are macrotasks.',
    },
    {
      question: 'Promise.any([...]) rejects when:',
      options: ['The first promise rejects', 'Any one promise rejects', 'It never rejects', 'All of the promises reject (with an AggregateError)'],
      answer: 3,
      explanation: 'Promise.any resolves with the first fulfilled value and rejects only when every promise rejects.',
    },
    {
      question: 'What does an async function return?',
      options: ['Whatever value is in the return statement, synchronously', 'Always a Promise', 'undefined until awaited', 'A generator object'],
      answer: 1,
      explanation: 'An async function always returns a promise; returned values are wrapped and thrown errors become rejections.',
    },
    {
      question: 'fetch("/api/missing") returns HTTP 404. What happens?',
      options: ['The promise rejects with a 404 error', 'fetch throws synchronously', 'The promise resolves; response.ok is false', 'The browser retries automatically'],
      answer: 2,
      explanation: 'fetch only rejects on network failure or abort. HTTP error statuses resolve normally, so you must check response.ok.',
    },
  ],
};
