export default {
  lesson: 'day-45-final-javascript-project',
  minutes: 45,
  intro: 'Practical test: predict tricky output, then solve classic interview coding tasks used in the final project (groupBy, flatten, deep clone, memoize, Promise.all).',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Practical test part A: hoisting, closures, coercion and the event loop together. What is printed?',
      code: `console.log(typeof hoisted, typeof notYet);
var hoisted = 1;
var notYet = () => 2;

const fns = [];
for (let i = 0; i < 2; i++) fns.push(() => i);
console.log(fns[0]() + fns[1]());

console.log([] + [], [1] == 1, "3" * "4");

setTimeout(() => console.log("timeout"), 0);
Promise.resolve().then(() => console.log("promise"));
console.log("sync");`,
      expected: 'undefined undefined\n1\n true 12\nsync\npromise\ntimeout',
      explain: 'Both `var`s are hoisted as undefined (the arrow function is assigned later). `let` gives each iteration its own `i` (0 + 1 = 1). `[] + []` is an empty string, `[1] == 1` coerces to true, `"3" * "4"` is 12. Finally sync, then microtask, then macrotask.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In the Team Directory project, code is split into utils, storage, API, model, view and controller. What is the main benefit?',
      options: ['The app runs faster in the browser', 'Each part has one responsibility, so logic (model) can be tested without the DOM and the UI can change without touching data code', 'It avoids the need for functions', 'It removes the need for error handling'],
      answer: 1,
      explain: '**Separation of concerns**: pure model functions are easy to test, the view only renders, storage/API hide where data lives, and the controller wires events to actions. Mixing everything inside event handlers makes apps hard to change.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `groupBy(items, keyFn)` that returns an object whose keys are `keyFn(item)` and whose values are arrays of the matching items (in original order).',
      example: { title: 'reduce into groups', code: 'const byLength = words.reduce((acc, w) => {\n  (acc[w.length] ||= []).push(w);\n  return acc;\n}, {});' },
      starter: 'function groupBy(items, keyFn) {\n  // TODO\n}',
      solution: 'function groupBy(items, keyFn) {\n  return items.reduce((acc, item) => {\n    const key = keyFn(item);\n    if (!acc[key]) acc[key] = [];\n    acc[key].push(item);\n    return acc;\n  }, {});\n}',
      tests: [
        { call: 'groupBy([{ n: "Asha", team: "UI" }, { n: "Ravi", team: "API" }, { n: "Meena", team: "UI" }], (p) => p.team)', expect: { UI: [{ n: 'Asha', team: 'UI' }, { n: 'Meena', team: 'UI' }], API: [{ n: 'Ravi', team: 'API' }] } },
        { call: 'groupBy([1, 2, 3, 4, 5], (n) => (n % 2 ? "odd" : "even"))', expect: { odd: [1, 3, 5], even: [2, 4] } },
        { call: 'groupBy([], (x) => x)', expect: {} },
      ],
      explain: 'Create the array the first time a key appears, then push. Taking a **function** for the key (instead of a property name) makes it flexible: group by team, by first letter, by price range…',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `flatten(arr)` that flattens an array nested to **any depth** using recursion (do not use the built-in `flat`).\n\n`flatten([1, [2, [3, [4]], 5]])` → `[1, 2, 3, 4, 5]`',
      example: { title: 'recursion on arrays', code: 'function countAll(arr) {\n  let c = 0;\n  for (const x of arr) c += Array.isArray(x) ? countAll(x) : 1;\n  return c;\n}' },
      starter: 'function flatten(arr) {\n  // TODO\n}',
      solution: 'function flatten(arr) {\n  const out = [];\n  for (const item of arr) {\n    if (Array.isArray(item)) out.push(...flatten(item));\n    else out.push(item);\n  }\n  return out;\n}',
      tests: [
        { call: 'flatten([1, [2, [3, [4]], 5]])', expect: [1, 2, 3, 4, 5] },
        { call: 'flatten([[], ["a"], [[["b"]]]])', expect: ['a', 'b'] },
        { call: 'flatten([1, 2])', expect: [1, 2] },
      ],
      explain: 'For each item: if it is an array, flatten it recursively and spread the result in; otherwise push it. The base case is an item that is not an array. (`arr.flat(Infinity)` does the same in modern JS.)',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Write `deepClone(value)` that deep-copies plain objects and arrays (recursively); primitives are returned as they are. Do not use `structuredClone` or JSON.',
      example: { title: 'shape of the solution', code: 'if (value === null || typeof value !== "object") return value;\nif (Array.isArray(value)) return value.map(deepClone);\n// ... objects: copy each key' },
      starter: 'function deepClone(value) {\n  return value; // TODO: this is not a copy\n}',
      solution: 'function deepClone(value) {\n  if (value === null || typeof value !== "object") return value;\n  if (Array.isArray(value)) return value.map(deepClone);\n  const copy = {};\n  for (const key of Object.keys(value)) copy[key] = deepClone(value[key]);\n  return copy;\n}',
      tests: [
        { call: 'deepClone({ a: 1, b: { c: [1, 2, { d: 3 }] } })', expect: { a: 1, b: { c: [1, 2, { d: 3 }] } } },
        { call: '(() => { const src = { team: { members: ["Asha"] } }; const c = deepClone(src); c.team.members.push("Ravi"); return [src.team.members.length, c.team !== src.team]; })()', expect: [1, true], msg: 'Nested objects/arrays are new copies' },
        { call: 'deepClone(null)', expect: null },
        { call: 'deepClone("text")', expect: 'text' },
      ],
      explain: 'Remember `typeof null === "object"`, so check null first. Arrays need their own branch so they stay arrays. Spread `{ ...obj }` is only a shallow copy, which is the bug this function prevents.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write a generic `memoize(fn)` that caches results by the **arguments** (use `JSON.stringify(args)` as the key) and returns cached results for repeated calls.',
      example: { title: 'cache in a closure', code: 'const cache = new Map();\nreturn (...args) => {\n  const key = JSON.stringify(args);\n  // check, compute, store\n};' },
      starter: 'function memoize(fn) {\n  return fn; // TODO: add caching\n}',
      solution: 'function memoize(fn) {\n  const cache = new Map();\n  return (...args) => {\n    const key = JSON.stringify(args);\n    if (cache.has(key)) return cache.get(key);\n    const result = fn(...args);\n    cache.set(key, result);\n    return result;\n  };\n}',
      tests: [
        { call: 'memoize((a, b) => a * b)(6, 7)', expect: 42 },
        { call: '(() => { let calls = 0; const slowSquare = memoize((n) => { calls++; return n * n; }); slowSquare(9); slowSquare(9); slowSquare(3); slowSquare(9); return calls; })()', expect: 2, msg: 'fn runs once per distinct input' },
        { call: '(() => { let calls = 0; const add = memoize((a, b) => { calls++; return a + b; }); add(1, 2); add(2, 1); return calls; })()', expect: 2, msg: 'Different argument order is a different key' },
      ],
      explain: 'Using a `Map` that lives in the closure keeps the cache private per memoized function. Memoize only **pure** functions: caching a function that depends on time or outside state would return stale results.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: 'Polyfill `promiseAll(promises)`: return a Promise that resolves with an array of results **in the same order** as the input once all fulfil, rejects as soon as any rejects, and resolves to `[]` for an empty array. Plain values in the array count as already-fulfilled.',
      example: { title: 'counting finished items', code: 'let done = 0;\nitems.forEach((p, i) => {\n  Promise.resolve(p).then((v) => {\n    results[i] = v;\n    if (++done === items.length) resolve(results);\n  }, reject);\n});' },
      starter: 'function promiseAll(promises) {\n  // TODO\n}',
      solution: 'function promiseAll(promises) {\n  return new Promise((resolve, reject) => {\n    const results = [];\n    let done = 0;\n    if (promises.length === 0) return resolve(results);\n    promises.forEach((p, i) => {\n      Promise.resolve(p).then((value) => {\n        results[i] = value;\n        done++;\n        if (done === promises.length) resolve(results);\n      }, reject);\n    });\n  });\n}',
      tests: [
        { call: 'promiseAll([new Promise((r) => setTimeout(() => r("slow"), 30)), Promise.resolve("fast"), 42])', expect: ['slow', 'fast', 42], msg: 'Results keep input order' },
        { call: 'promiseAll([Promise.resolve(1), new Promise((_, rej) => setTimeout(() => rej(new Error("API down")), 10)), Promise.resolve(3)]).catch((e) => e.message)', expect: 'API down' },
        { call: 'promiseAll([])', expect: [] },
      ],
      explain: 'Store each result at its **index** (not with push) so order matches the input even when later promises finish first, and count completions to know when all are done. Forgetting the empty-array case leaves the promise pending forever.',
    },
  ],
};
