const ex1 = `// The call stack: functions are pushed and popped (LIFO)
function multiply(a, b) {
  console.log('  multiply running (stack: main > square > multiply)');
  return a * b;
}
function square(n) {
  console.log(' square running (stack: main > square)');
  return multiply(n, n);
}
function main() {
  console.log('main running (stack: main)');
  const result = square(4);
  console.log('result =', result, '(back in main)');
}
main();

// Stack overflow: recursion with no base case
function forever(n) { return forever(n + 1); }
try {
  forever(0);
} catch (err) {
  console.log(err.name + ':', err.message);
}`;

const ex2 = `// Classic interview question: guess the order!
console.log('1: script start');

setTimeout(() => {
  console.log('2: setTimeout (macrotask)');
}, 0);

Promise.resolve()
  .then(() => console.log('3: promise then (microtask)'))
  .then(() => console.log('4: second then (microtask)'));

queueMicrotask(() => console.log('5: queueMicrotask (microtask)'));

console.log('6: script end');`;

const ex3 = `// async/await is promises underneath - where does code after await run?
async function task() {
  console.log('B: inside task, before await');
  await null;                       // everything below becomes a microtask
  console.log('E: inside task, after await');
}

console.log('A: start');
setTimeout(() => console.log('G: timeout'), 0);
task();
new Promise((resolve) => {
  console.log('C: promise executor (sync!)');
  resolve();
}).then(() => console.log('F: then callback'));
console.log('D: end');`;

const ex4 = `// Microtasks run COMPLETELY between every macrotask
setTimeout(() => {
  console.log('timeout 1');
  Promise.resolve().then(() => console.log('  microtask inside timeout 1'));
}, 0);

setTimeout(() => {
  console.log('timeout 2');
}, 0);

Promise.resolve().then(() => {
  console.log('microtask A');
  setTimeout(() => console.log('timeout 3 (scheduled by microtask A)'), 0);
  Promise.resolve().then(() => console.log('microtask B (scheduled by A)'));
});

console.log('sync');`;

const ex5html = `<button id="block">Block for 3 s (sync loop)</button>
<button id="chunk">Same work in chunks</button>
<p>Counter (should keep ticking): <strong id="tick">0</strong></p>
<p id="out"></p>`;

const ex5css = `body { font-family: system-ui, sans-serif; }
button { padding: 8px 12px; margin: 4px; }
#tick { font-size: 1.6rem; color: #1565c0; }`;

const ex5js = `let n = 0;
setInterval(() => { document.querySelector('#tick').textContent = ++n; }, 100);
const out = document.querySelector('#out');

// BAD: one long synchronous task freezes the page
document.querySelector('#block').addEventListener('click', () => {
  out.textContent = 'Blocking...';           // you will NOT even see this text
  const end = Date.now() + 3000;
  while (Date.now() < end) {}                  // call stack busy for 3 s
  out.textContent = 'Done blocking - the counter froze!';
});

// GOOD: split the work into small macrotasks so the browser can render between them
document.querySelector('#chunk').addEventListener('click', () => {
  let chunk = 0;
  function doChunk() {
    const end = Date.now() + 50;               // 50 ms of work
    while (Date.now() < end) {}
    chunk++;
    out.textContent = 'Chunk ' + chunk + ' / 60';
    if (chunk < 60) setTimeout(doChunk, 0);    // yield to the event loop
    else out.textContent = 'Done in chunks - the counter kept ticking!';
  }
  doChunk();
});`;

export default {
  id: 'day-34-event-loop',
  title: 'The Event Loop, Call Stack, Microtasks vs Macrotasks',
  module: 'Module 5: Asynchronous JavaScript',
  day: 34,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'JavaScript runs on a single thread, yet handles timers, network requests and clicks without freezing. The event loop is the mechanism that makes this possible; understanding it lets you predict the exact order of async output – a very common interview topic.',
  objectives: [
    'Describe the call stack, Web APIs, the task (macrotask) queue and the microtask queue',
    'Explain step by step how the event loop picks the next piece of work',
    'Predict the output order of code mixing sync code, promises, async/await and setTimeout',
    'Avoid blocking the main thread with long synchronous work',
  ],
  theory: [
    {
      heading: 'Single-Threaded JavaScript and the Call Stack',
      content:
        'JavaScript has **one main thread**, which means it can do only **one thing at a time**.\n\nThe **call stack** is how the engine tracks "where am I?". Think of a stack of plates:\n- When a function is called, a frame is **pushed** on top.\n- When it returns, the frame is **popped** off.\n- The engine always works on the **top** plate (Last In, First Out).\n\nIf a function calls itself forever, the stack grows until the engine stops it with **RangeError: Maximum call stack size exceeded** (stack overflow).\n\nWhile the stack is busy, nothing else can happen on that thread: no clicks are handled and the page cannot repaint. That is why a long loop "freezes" the page.',
    },
    {
      heading: 'Web APIs: Work Done Outside the Stack',
      content:
        'So how does `setTimeout(fn, 1000)` wait without freezing? The **browser** (or Node.js) provides **Web APIs** – timers, `fetch`, DOM events – implemented outside the JS engine.\n\nWhen you call `setTimeout`, JS just hands the callback and the delay to the browser\'s timer and moves on immediately. When the timer finishes, the browser puts the callback into a **queue**. It runs only when the call stack is empty.\n\nAnalogy: a restaurant with **one chef** (the main thread). The chef hands slow jobs (baking, deliveries) to helpers (Web APIs). When a helper finishes, they put a ticket on the counter (queue). The chef picks up a new ticket only when his hands are free.',
      tip: 'setTimeout(fn, 0) does NOT mean "run now". It means "run as soon as possible after the current code and all microtasks finish" – and browsers clamp nested timers to at least ~4 ms.',
    },
    {
      heading: 'Macrotasks vs Microtasks',
      content:
        'There are two kinds of queues:\n\n**Macrotask (task) queue** – one task is taken per loop turn:\n- `setTimeout`, `setInterval` callbacks\n- DOM events (click, keydown), network/IO callbacks, `MessageChannel`\n- running the main script itself is the first macrotask\n\n**Microtask queue** – **completely emptied** after every macrotask (and whenever the stack empties):\n- `.then / .catch / .finally` callbacks\n- code after `await` inside an async function\n- `queueMicrotask(fn)`, `MutationObserver`\n\nMicrotasks have **higher priority**: if a microtask schedules another microtask, that one also runs before any timer.',
      points: [
        'Promise executor (the function inside new Promise) is synchronous',
        'Code before the first await in an async function is synchronous',
        'Code after await is a microtask',
      ],
    },
    {
      heading: 'The Event Loop Algorithm',
      content:
        'The event loop is a never-ending loop that follows these rules:\n\n1. Run the current macrotask (at the start, the whole script) until the call stack is empty.\n2. Run **all** microtasks in the microtask queue, including new ones added while running them.\n3. If needed, the browser **renders** (style, layout, paint; `requestAnimationFrame` callbacks run just before this).\n4. Take the **next** macrotask from the task queue and go back to step 1.\n\nSo the priority for the code you write is:\n**synchronous code → microtasks (promises, await) → render → macrotasks (timers, events)**',
      syntax: `console.log('sync');                       // 1st
setTimeout(() => console.log('macro'));    // 3rd
Promise.resolve().then(() => console.log('micro')); // 2nd
// sync, micro, macro`,
    },
    {
      heading: 'How to Predict Output Order (Step-by-Step Method)',
      content:
        'For any "what is the output?" question:\n\n1. Go through the code top to bottom. Print every **synchronous** log immediately (including promise executors and code before the first await).\n2. Put every `.then` / after-`await` / `queueMicrotask` callback into a **microtask list** in the order they become ready.\n3. Put every `setTimeout`/`setInterval` callback into a **macrotask list** (ordered by delay, then by call order).\n4. When the script ends, run the microtask list completely (adding new microtasks to its end).\n5. Run the first macrotask, then empty microtasks again, then the next macrotask, and so on.',
      tip: 'A chained .then is only queued when the previous one finishes, so p.then(a).then(b) puts b in the queue AFTER other microtasks that were already waiting.',
    },
    {
      heading: 'Do Not Block the Event Loop',
      content:
        'Because rendering and event handling wait for the stack to empty, heavy synchronous work (huge loops, big JSON parsing, complex calculations) makes the page unresponsive.\n\nSolutions:\n- **Split work into chunks** with `setTimeout` so the browser can render in between\n- Use **Web Workers** to run heavy computation on a separate thread\n- Avoid endless microtask loops – they block rendering just like a while loop, because the microtask queue must empty before the next render\n\n`requestAnimationFrame(cb)` runs cb right before the next paint – ideal for animations.',
      tip: 'Coming next (Day 35): we leave async behind and organise code into ES modules.',
    },
  ],
  examples: [
    {
      title: 'Watching the call stack',
      scenario: 'Trace nested function calls and see a stack overflow error.',
      steps: [
        'Write main → square → multiply nested calls with logs',
        'Write a recursive function without a base case',
        'Wrap it in try/catch and click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        'main running (stack: main)\n square running (stack: main > square)\n  multiply running (stack: main > square > multiply)\nresult = 16 (back in main)\nRangeError: Maximum call stack size exceeded',
      explanation:
        'Each call pushes a frame; multiply returns first (LIFO), then square, then main continues. The endless recursion keeps pushing frames until the engine throws a RangeError.',
    },
    {
      title: 'Sync vs microtask vs macrotask order',
      scenario: 'The most common event-loop interview question.',
      steps: [
        'Write two console.log calls, a setTimeout(0), a promise chain and a queueMicrotask',
        'Write down your predicted order on paper',
        'Click Run and compare',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        '1: script start\n6: script end\n3: promise then (microtask)\n5: queueMicrotask (microtask)\n4: second then (microtask)\n2: setTimeout (macrotask)',
      explanation:
        'Sync logs 1 and 6 run first. Microtask queue after the script: [then-3, micro-5]. Running then-3 queues then-4 at the END, so 5 runs before 4. Only when microtasks are empty does the timer (2) run.',
    },
    {
      title: 'async/await and the promise executor in the event loop',
      scenario: 'Find out which parts of async functions and promises are synchronous.',
      steps: [
        'Write an async function with a log before and after await',
        'Add a setTimeout and a new Promise with a log inside the executor',
        'Predict the letters A–G in order, then click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        'A: start\nB: inside task, before await\nC: promise executor (sync!)\nD: end\nE: inside task, after await\nF: then callback\nG: timeout',
      explanation:
        'A, B (code before await), C (executor) and D are synchronous. await null queues the rest of task (E) as a microtask before resolve() queues F. Timer G is a macrotask, so it runs last.',
    },
    {
      title: 'Microtasks are drained between macrotasks',
      scenario: 'Timers and promises that schedule more timers and promises.',
      steps: [
        'Create two timeouts; the first queues a microtask',
        'Create a promise whose callback schedules another timeout and another microtask',
        'Click Run and follow the queues',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'sync\nmicrotask A\nmicrotask B (scheduled by A)\ntimeout 1\n  microtask inside timeout 1\ntimeout 2\ntimeout 3 (scheduled by microtask A)',
      explanation:
        'After "sync", the microtask queue is emptied completely: A, then B (added during A). Then timeout 1 runs and its microtask runs immediately after it – BEFORE timeout 2. Timeout 3 was queued last (during microtask A), so it runs last.',
    },
    {
      title: 'Blocking vs non-blocking work in the browser',
      scenario: 'See with your own eyes how a long loop freezes the page and how chunking fixes it.',
      steps: [
        'Create a counter that updates every 100 ms with setInterval',
        'Button 1 runs a 3-second while loop',
        'Button 2 runs the same total work in 50 ms chunks scheduled with setTimeout',
        'Click each button and watch the counter',
      ],
      code: ex5js,
      playground: { html: ex5html, css: ex5css, js: ex5js },
      result:
        'Button 1: the counter stops for 3 seconds, "Blocking..." never appears, then "Done blocking - the counter froze!". Button 2: the counter keeps ticking while "Chunk 1 / 60 ... 60 / 60" updates, ending with "Done in chunks - the counter kept ticking!".',
      explanation:
        'The while loop keeps the call stack busy, so no interval callbacks or repaints can happen. With chunking each setTimeout gives control back to the event loop, which can render and run the interval between chunks.',
    },
  ],
  interview: [
    {
      q: 'What is the event loop?',
      a: 'The mechanism that lets single-threaded JavaScript handle async work. It repeatedly: runs one macrotask until the call stack is empty, drains the microtask queue, lets the browser render, then picks the next macrotask.',
      level: 'Easy',
    },
    {
      q: 'What is the call stack?',
      a: 'A LIFO data structure tracking function execution. Calling a function pushes a frame; returning pops it. JavaScript runs whatever is on top, one thing at a time.',
      level: 'Easy',
    },
    {
      q: 'Difference between microtasks and macrotasks? Give examples.',
      a: 'Macrotasks: setTimeout, setInterval, DOM events, I/O – one per loop iteration. Microtasks: promise callbacks, code after await, queueMicrotask, MutationObserver – the whole queue is drained after each macrotask, so they have higher priority.',
      level: 'Medium',
    },
    {
      q: 'Output?\nconsole.log(1);\nsetTimeout(() => console.log(2), 0);\nPromise.resolve().then(() => console.log(3));\nconsole.log(4);',
      a: '1, 4, 3, 2. Sync first (1, 4), then the microtask (3), then the macrotask (2).',
      level: 'Easy',
    },
    {
      q: 'Output?\nsetTimeout(() => console.log("a"), 0);\nnew Promise(r => { console.log("b"); r(); }).then(() => console.log("c"));\nconsole.log("d");',
      a: 'b, d, c, a. The executor is synchronous so "b" logs immediately, then "d". The then callback (c) is a microtask, the timeout (a) is a macrotask.',
      level: 'Medium',
    },
    {
      q: 'Output?\nasync function f() { console.log(1); await undefined; console.log(2); }\nconsole.log(3); f(); console.log(4);',
      a: '3, 1, 4, 2. Code before await runs synchronously when f is called; code after await is a microtask that runs after the script finishes.',
      level: 'Medium',
    },
    {
      q: 'Does setTimeout(fn, 0) run immediately?',
      a: 'No. It queues fn as a macrotask after at least 0 ms (browsers clamp nested timers to ~4 ms). It runs only after the current script and ALL microtasks finish.',
      level: 'Easy',
    },
    {
      q: 'Is the delay in setTimeout guaranteed?',
      a: 'No, it is a minimum. If the call stack is busy or there are many queued tasks/microtasks, the callback runs later.',
      level: 'Medium',
    },
    {
      q: 'Can microtasks starve the page?',
      a: 'Yes. Because the microtask queue must be empty before rendering or the next macrotask, a microtask that keeps scheduling new microtasks forever freezes the page just like an infinite loop.',
      level: 'Hard',
    },
    {
      q: 'How do you keep the UI responsive during heavy computation?',
      a: 'Split the work into chunks scheduled with setTimeout (or scheduler.yield / requestIdleCallback), or move it to a Web Worker that runs on a separate thread.',
      level: 'Medium',
    },
    {
      q: 'Output?\nPromise.resolve().then(() => console.log("p1")).then(() => console.log("p2"));\nPromise.resolve().then(() => console.log("p3")).then(() => console.log("p4"));',
      a: 'p1, p3, p2, p4. Both first thens are queued first. p2 is queued only when p1 finishes, after p3 was already waiting; same for p4.',
      level: 'Hard',
    },
    {
      q: 'Where does requestAnimationFrame fit in the event loop?',
      a: 'rAF callbacks run once per frame, just before the browser paints, after the microtask checkpoint. It is the right place for visual updates and animations.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Predict, then run: console.log("A"); setTimeout(() => console.log("B")); Promise.resolve().then(() => console.log("C")); console.log("D");',
      hint: 'Sync → micro → macro.',
      solution: `console.log('A');
setTimeout(() => console.log('B'));
Promise.resolve().then(() => console.log('C'));
console.log('D');
// A, D, C, B`,
    },
    {
      task: 'Predict the output of a setTimeout that contains a promise and a promise that contains a setTimeout.',
      hint: 'Write the microtask and macrotask queues on paper after each step.',
      solution: `setTimeout(() => {
  console.log('T1');
  Promise.resolve().then(() => console.log('P-in-T1'));
}, 0);
Promise.resolve().then(() => {
  console.log('P1');
  setTimeout(() => console.log('T-in-P1'), 0);
});
console.log('S');
// S, P1, T1, P-in-T1, T-in-P1`,
    },
    {
      task: 'Write an async function and add logs 1..5 so that the output order is 1 2 3 4 5, using exactly one await and one setTimeout.',
      hint: 'Sync logs first, after-await is a microtask, setTimeout is last.',
      solution: `async function run() {
  console.log(2);
  await null;
  console.log(4);
}
console.log(1);
setTimeout(() => console.log(5), 0);
run();
console.log(3);
// 1 2 3 4 5`,
    },
    {
      task: 'Process an array of 100000 numbers (sum of squares) in chunks of 10000 using setTimeout so the UI stays responsive, then log the total.',
      hint: 'Keep an index; each chunk handles 10000 items and schedules the next chunk.',
      solution: `const nums = Array.from({ length: 100000 }, (_, i) => i + 1);
let i = 0, total = 0;
function chunk() {
  const end = Math.min(i + 10000, nums.length);
  for (; i < end; i++) total += nums[i] * nums[i];
  if (i < nums.length) setTimeout(chunk, 0);
  else console.log('Total:', total);
}
chunk();`,
    },
  ],
  quiz: [
    {
      question: 'Which runs first?',
      options: ['setTimeout(fn, 0) callback', 'Promise .then callback', 'A click handler queued earlier', 'They run in random order'],
      answer: 1,
      explanation: 'Microtasks (promise callbacks) run before the next macrotask (timers, events).',
    },
    {
      question: 'The function passed to new Promise(fn) runs...',
      options: ['as a microtask', 'as a macrotask', 'synchronously, immediately', 'after the first then'],
      answer: 2,
      explanation: 'The executor runs synchronously during the constructor call.',
    },
    {
      question: 'Which one is a MACROtask?',
      options: ['queueMicrotask', 'await continuation', '.catch callback', 'setInterval callback'],
      answer: 3,
      explanation: 'Timers are macrotasks; the others are microtasks.',
    },
    {
      question: 'Output of: console.log(1); setTimeout(()=>console.log(2)); Promise.resolve().then(()=>console.log(3)); console.log(4);',
      options: ['1 4 3 2', '1 2 3 4', '1 3 4 2', '1 4 2 3'],
      answer: 0,
      explanation: 'Sync (1, 4) → microtask (3) → macrotask (2).',
    },
    {
      question: 'What error does infinite recursion cause?',
      options: ['TypeError', 'RangeError: Maximum call stack size exceeded', 'SyntaxError', 'ReferenceError'],
      answer: 1,
      explanation: 'The call stack has a limited size; overflowing it throws a RangeError.',
    },
  ],
};
