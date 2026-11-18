export default {
  lesson: 'day-42-iterators-generators-symbols',
  minutes: 35,
  intro: 'Use Symbols as unique keys, make objects iterable, and write generators for lazy and async sequences.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Symbols are unique and hidden from normal loops. What is printed?',
      code: `const id1 = Symbol("id");
const id2 = Symbol("id");
console.log(id1 === id2);
const user = { name: "Asha", [id1]: 101 };
console.log(Object.keys(user).join(","));
console.log(user[id1]);
console.log(JSON.stringify(user));`,
      expected: 'false\nname\n101\n{"name":"Asha"}',
      explain: 'Every `Symbol()` is unique, even with the same description. Symbol-keyed properties are skipped by `Object.keys`, `for...in` and `JSON.stringify`, which makes them good for hidden metadata that will not clash with other keys.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Generators pause and resume. What is printed?',
      code: `function* steps() {
  console.log("start");
  yield "step 1";
  yield "step 2";
  return "finished";
}
const it = steps();
console.log("created");
console.log(it.next().value);
console.log(it.next().value);
const last = it.next();
console.log(last.value, last.done);
console.log(it.next().done);`,
      expected: 'created\nstart\nstep 1\nstep 2\nfinished true\ntrue',
      explain: 'Calling a generator function does **not** run its body; it returns an iterator. Each `next()` runs until the next `yield`. The `return` value comes with `done: true`, and after that `next()` keeps returning `done: true`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Make an object iterable **by hand** (no generator). Give `range` a `[Symbol.iterator]()` method that returns an iterator object with `next()`, producing numbers from `from` to `to` (inclusive), so that `[...range]` and `for...of` work.',
      example: { title: 'the iterator protocol', code: 'const it = {\n  next() {\n    return done ? { done: true, value: undefined } : { done: false, value: x };\n  },\n};' },
      starter: 'const range = {\n  from: 3,\n  to: 7,\n  // TODO: [Symbol.iterator]() { ... }\n};',
      solution: 'const range = {\n  from: 3,\n  to: 7,\n  [Symbol.iterator]() {\n    let current = this.from;\n    const last = this.to;\n    return {\n      next() {\n        if (current <= last) return { done: false, value: current++ };\n        return { done: true, value: undefined };\n      },\n    };\n  },\n};',
      tests: [
        { call: '[...range]', expect: [3, 4, 5, 6, 7] },
        { call: '(() => { let s = 0; for (const n of range) s += n; return s; })()', expect: 25 },
        { call: '(() => { const [a, b] = range; return a + b; })()', expect: 7, msg: 'Destructuring also uses the iterator' },
      ],
      explain: 'An **iterable** has a `[Symbol.iterator]` method that returns an **iterator**: an object whose `next()` returns `{ value, done }`. Spread, `for...of`, destructuring and `Array.from` all use this protocol.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Same idea with a generator. Write `function* evens(limit)` that yields 0, 2, 4, … up to and including `limit`.',
      example: { title: 'generator function', code: 'function* countdown(n) {\n  while (n > 0) yield n--;\n}\n[...countdown(3)]; // [3, 2, 1]' },
      starter: 'function* evens(limit) {\n  // TODO\n}',
      solution: 'function* evens(limit) {\n  for (let n = 0; n <= limit; n += 2) yield n;\n}',
      tests: [
        { call: '[...evens(10)]', expect: [0, 2, 4, 6, 8, 10] },
        { call: '[...evens(5)]', expect: [0, 2, 4] },
        { call: 'evens(4).next()', expect: { value: 0, done: false } },
      ],
      explain: 'A generator automatically implements the iterator protocol, so you only write the logic and `yield` each value. Much shorter than the hand-written iterator above.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Lazy, infinite sequences. Write `function* idGenerator(prefix)` that yields `prefix + "001"`, `prefix + "002"`, … **forever**, and `take(iterable, n)` that returns an array of the first `n` values (stop the loop with `break`).',
      example: { title: 'infinite generator', code: 'function* naturals() {\n  let n = 1;\n  while (true) yield n++;\n}' },
      starter: 'function* idGenerator(prefix) {\n  // TODO\n}\n\nfunction take(iterable, n) {\n  // TODO\n}',
      solution: 'function* idGenerator(prefix) {\n  let n = 1;\n  while (true) {\n    yield prefix + String(n).padStart(3, "0");\n    n++;\n  }\n}\n\nfunction take(iterable, n) {\n  const out = [];\n  if (n <= 0) return out;\n  for (const value of iterable) {\n    out.push(value);\n    if (out.length === n) break;\n  }\n  return out;\n}',
      tests: [
        { call: 'take(idGenerator("STU"), 3)', expect: ['STU001', 'STU002', 'STU003'] },
        { call: '(() => { const ids = idGenerator("EMP"); ids.next(); return ids.next().value; })()', expect: 'EMP002' },
        { call: 'take(idGenerator("X"), 0)', expect: [] },
      ],
      explain: 'Generators are **lazy**: values are produced only when asked, so `while (true)` is safe as long as the consumer stops. Spreading `[...idGenerator("X")]` would run forever, which is why `take` with `break` is needed.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Async generators. `fetchPage(page)` (given) returns a promise of `{ items, hasMore }`. Write `async function* allItems()` that yields every item from page 1, 2, … while `hasMore` is true. Then write `async function collect()` that uses **for await...of** to return all items in an array.',
      example: { title: 'for await', code: 'async function* ticks() {\n  yield 1;\n  yield 2;\n}\nfor await (const t of ticks()) console.log(t);' },
      starter: 'const PAGES = { 1: ["Asha", "Ravi"], 2: ["Meena", "John"], 3: ["Zoya"] };\nfunction fetchPage(page) {\n  return new Promise((r) => setTimeout(() => r({ items: PAGES[page], hasMore: page < 3 }), 10));\n}\n\nasync function* allItems() {\n  // TODO\n}\n\nasync function collect() {\n  // TODO\n}',
      solution: 'const PAGES = { 1: ["Asha", "Ravi"], 2: ["Meena", "John"], 3: ["Zoya"] };\nfunction fetchPage(page) {\n  return new Promise((r) => setTimeout(() => r({ items: PAGES[page], hasMore: page < 3 }), 10));\n}\n\nasync function* allItems() {\n  let page = 1;\n  while (true) {\n    const data = await fetchPage(page);\n    yield* data.items;\n    if (!data.hasMore) break;\n    page++;\n  }\n}\n\nasync function collect() {\n  const all = [];\n  for await (const item of allItems()) all.push(item);\n  return all;\n}',
      tests: [{ call: 'collect()', expect: ['Asha', 'Ravi', 'Meena', 'John', 'Zoya'] }],
      explain: 'An async generator can `await` inside and `yield` values one by one; the consumer uses `for await...of`. `yield*` delegates to another iterable (here the page array), yielding each item. This is a clean way to hide pagination from the rest of the app.',
    },
  ],
};
