export default {
  lesson: 'day-34-event-loop',
  minutes: 30,
  intro: 'Predict the order of sync code, microtasks (promises) and macrotasks (timers), and avoid blocking the main thread.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these schedule a **microtask**? (choose all that apply)',
      options: ['Promise.then callback', 'queueMicrotask(fn)', 'setTimeout(fn, 0)', 'The code after an await', 'setInterval(fn, 10)'],
      answers: [0, 1, 3],
      explain: 'Promise reactions (`then`/`catch`/`finally`, the continuation after `await`) and `queueMicrotask` are **microtasks**. Timers (`setTimeout`, `setInterval`) and UI events are **macrotasks**.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Sync vs microtask vs macrotask. What is printed?',
      code: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
queueMicrotask(() => console.log("4"));
console.log("5");`,
      expected: '1\n5\n3\n4\n2',
      explain: 'First all synchronous code runs (1, 5). Then the event loop **drains the whole microtask queue** in order (3, 4). Only then does it take the next macrotask, the timer (2).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'async/await and the promise executor. What is printed?',
      code: `async function task() {
  console.log("A");
  await null;
  console.log("B");
}
setTimeout(() => console.log("C"), 0);
new Promise((resolve) => {
  console.log("D");
  resolve();
}).then(() => console.log("E"));
task();
console.log("F");`,
      expected: 'D\nA\nF\nE\nB\nC',
      explain: 'The **executor** of `new Promise` runs synchronously (D). `task()` runs synchronously up to `await` (A). Then "F". Microtasks in queue order: the `.then` (E) was queued before the await continuation (B). The timer (C) runs last.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Microtasks are drained between macrotasks. What is printed?',
      code: `setTimeout(() => {
  console.log("timeout 1");
  Promise.resolve().then(() => console.log("micro inside 1"));
}, 0);
setTimeout(() => console.log("timeout 2"), 0);`,
      expected: 'timeout 1\nmicro inside 1\ntimeout 2',
      explain: 'After **each** macrotask the event loop empties the microtask queue before picking the next macrotask. So the promise created inside timeout 1 runs before timeout 2.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `schedule()` so that the console shows exactly:\n```\nsync\nmicro\nmacro\n```\nYou must log `"macro"` with **setTimeout**, `"micro"` with **Promise.resolve().then** (or queueMicrotask) and `"sync"` directly, and write the lines in this order inside the function: first the setTimeout, then the promise, then the sync log.',
      example: { title: 'scheduling work', code: 'setTimeout(() => console.log("later"), 0);\nqueueMicrotask(() => console.log("soon"));\nconsole.log("now");' },
      starter: 'function schedule() {\n  // TODO: setTimeout first, then the promise, then the sync log\n}\nschedule();',
      solution: 'function schedule() {\n  setTimeout(() => console.log("macro"), 0);\n  Promise.resolve().then(() => console.log("micro"));\n  console.log("sync");\n}\nschedule();',
      tests: [{ call: 'new Promise((r) => setTimeout(r, 30))', log: 'sync\nmicro\nmacro', msg: 'Console shows sync, micro, macro' }],
      explain: 'The order you **write** the lines does not decide the order they **run**: sync code first, then microtasks, then macrotasks. That is the core rule of the event loop.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Do not block the event loop. Write `sumInChunks(numbers, chunkSize)` that returns a **Promise** of the sum, but adds at most `chunkSize` numbers at a time and then continues in the next macrotask with `setTimeout(next, 0)`, so the page stays responsive.\n\nThe test also checks that a timer scheduled before the work gets a chance to run in between.',
      example: { title: 'processing in chunks', code: 'function work(i) {\n  // do part of the job...\n  if (moreToDo) setTimeout(() => work(i + 100), 0);\n}' },
      starter: 'function sumInChunks(numbers, chunkSize) {\n  // TODO: return new Promise(...) and process chunk by chunk\n}',
      solution: 'function sumInChunks(numbers, chunkSize) {\n  return new Promise((resolve) => {\n    let i = 0;\n    let total = 0;\n    function next() {\n      const end = Math.min(i + chunkSize, numbers.length);\n      for (; i < end; i++) total += numbers[i];\n      if (i < numbers.length) setTimeout(next, 0);\n      else resolve(total);\n    }\n    next();\n  });\n}',
      tests: [
        { call: 'sumInChunks([1, 2, 3, 4, 5, 6, 7], 3)', expect: 28 },
        { call: 'sumInChunks([], 5)', expect: 0 },
        { call: '(() => { let ticked = false; setTimeout(() => { ticked = true; }, 0); return sumInChunks(Array.from({ length: 1000 }, () => 1), 100).then((s) => s === 1000 && ticked); })()', expect: true, msg: 'Other timers can run between chunks' },
      ],
      explain: 'One long loop blocks the single main thread: no clicks, no rendering until it finishes. Splitting the work and yielding with `setTimeout(next, 0)` lets the browser handle other tasks between chunks.',
    },
  ],
};
