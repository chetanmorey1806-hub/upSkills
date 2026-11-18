export default {
  lesson: 'day-40-debounce-throttle',
  minutes: 35,
  intro: 'Rate-limit high-frequency events by implementing debounce and throttle with closures and timers.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A search box calls the API on every keystroke. You want ONE call after the user **stops typing** for 300 ms. Which technique?',
      options: ['Throttle', 'Debounce', 'setInterval', 'Promise.all'],
      answer: 1,
      explain: '**Debounce** waits until the events stop for a set time, then runs once (search, auto-save, resize end). **Throttle** runs at most once every X ms while events keep coming (scroll position, infinite scroll, game input).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which situations suit **throttle** better than debounce? (choose all that apply)',
      options: ['Updating a "scroll progress" bar while scrolling', 'Validating a username after the user stops typing', 'Sending the mouse position for a live cursor at most every 100 ms', 'Saving a draft 1 second after the last change', 'Preventing a "Fire" button in a game from firing more than twice per second'],
      answers: [0, 2, 4],
      explain: 'Throttle gives **regular updates during** continuous activity. Debounce gives **one update after** activity ends, which suits validation and auto-save.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Implement `debounce(fn, delay)`. It returns a function that, when called repeatedly, only runs `fn` once, `delay` ms after the **last** call, with the **last** arguments.\n\nThe test types "j", "ja", "jav", "java" quickly and expects one call with "java".',
      example: { title: 'reset the timer on every call', code: 'let timer;\nreturn (...args) => {\n  clearTimeout(timer);\n  timer = setTimeout(() => { /* run */ }, delay);\n};' },
      starter: 'function debounce(fn, delay) {\n  // TODO\n  return fn; // runs immediately every time: not debounced\n}',
      solution: 'function debounce(fn, delay) {\n  let timer;\n  return function (...args) {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn.apply(this, args), delay);\n  };\n}',
      tests: [
        { call: 'new Promise((res) => { const calls = []; const search = debounce((q) => calls.push(q), 40); ["j", "ja", "jav", "java"].forEach((q) => search(q)); setTimeout(() => res(calls), 120); })', expect: ['java'], msg: 'Only one call, with the last value' },
        { call: 'new Promise((res) => { const calls = []; const f = debounce((q) => calls.push(q), 20); f("a"); setTimeout(() => f("b"), 60); setTimeout(() => res(calls), 140); })', expect: ['a', 'b'], msg: 'Calls separated by a pause each run' },
      ],
      explain: 'Each call cancels the previous pending timer and starts a new one, so `fn` only runs when the calls stop. The `timer` variable lives in the closure. Using `fn.apply(this, args)` keeps the right `this` and arguments.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Implement `throttle(fn, interval, now = Date.now)` using **timestamps**: the returned function runs `fn` immediately on the first call, then ignores calls until `interval` ms have passed since the last run. Read the time by calling `now()` (it defaults to `Date.now`; the test passes a fake clock so results never depend on device speed).\n\nWith interval 100 and calls at times 0, 50, 99, 100, 150, 199, 250, `fn` should run at 0, 100 and 250 only.',
      example: { title: 'remember the last run', code: 'let last = -Infinity;\nreturn (...args) => {\n  const t = now(); // e.g. Date.now()\n  if (t - last >= interval) { /* run and update last */ }\n};' },
      starter: 'function throttle(fn, interval, now = Date.now) {\n  // TODO\n  return fn;\n}',
      solution: 'function throttle(fn, interval, now = Date.now) {\n  let last = -Infinity;\n  return function (...args) {\n    const t = now();\n    if (t - last >= interval) {\n      last = t;\n      fn.apply(this, args);\n    }\n  };\n}',
      tests: [
        { call: '(() => { let time = 0; const runs = []; const onScroll = throttle(() => runs.push(time), 100, () => time); for (const t of [0, 50, 99, 100, 150, 199, 250]) { time = t; onScroll(); } return runs; })()', expect: [0, 100, 250], msg: 'With a fake clock: runs at 0, 100 and 250 only' },
        { call: '(() => { let got = null; const t = throttle((x) => { got = x; }, 1000); t("first"); t("second"); return got; })()', expect: 'first', msg: 'The first call runs immediately; the next is ignored' },
      ],
      explain: 'Throttle compares the current time with the last time `fn` ran (start `last` at `-Infinity` so the very first call always runs, even when the clock starts at 0). If enough time has passed, run and remember the time; otherwise drop the call. Unlike debounce, it does not wait for the events to stop.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Add `cancel()`. Write `debounceWithCancel(fn, delay)` that works like debounce and the returned function also has a `.cancel()` method that clears any pending call (e.g. when a component is closed).',
      example: { title: 'attaching a method to a function', code: 'const debounced = (...args) => { /* ... */ };\ndebounced.cancel = () => clearTimeout(timer);\nreturn debounced;' },
      starter: 'function debounceWithCancel(fn, delay) {\n  let timer;\n  const debounced = (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n  // TODO: debounced.cancel\n  return debounced;\n}',
      solution: 'function debounceWithCancel(fn, delay) {\n  let timer;\n  const debounced = (...args) => {\n    clearTimeout(timer);\n    timer = setTimeout(() => fn(...args), delay);\n  };\n  debounced.cancel = () => clearTimeout(timer);\n  return debounced;\n}',
      tests: [
        { call: 'new Promise((res) => { let ran = false; const save = debounceWithCancel(() => { ran = true; }, 30); save(); save.cancel(); setTimeout(() => res(ran), 80); })', expect: false, msg: 'A cancelled call never runs' },
        { call: 'new Promise((res) => { let ran = 0; const save = debounceWithCancel(() => { ran++; }, 20); save(); setTimeout(() => res(ran), 60); })', expect: 1, msg: 'Without cancel it still runs once' },
      ],
      explain: 'Functions are objects, so you can attach a `cancel` method that shares the same closure variable `timer`. Cancelling pending work prevents updates to UI that no longer exists.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed? (`debounce` resets on every call; delay 50 ms)',
      code: `function debounce(fn, delay) {
  let t;
  return (x) => { clearTimeout(t); t = setTimeout(() => fn(x), delay); };
}
const log = debounce((x) => console.log("saved " + x), 50);
log(1);
log(2);
setTimeout(() => log(3), 100);
console.log("typing...");`,
      expected: 'typing...\nsaved 2\nsaved 3',
      explain: '`log(1)` is cancelled by `log(2)`, which runs 50 ms later. At 100 ms the burst is over, so `log(3)` starts a new timer and runs too. The synchronous "typing..." prints first.',
    },
  ],
};
