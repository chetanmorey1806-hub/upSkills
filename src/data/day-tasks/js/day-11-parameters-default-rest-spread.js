export default {
  lesson: 'day-11-parameters-default-rest-spread',
  minutes: 25,
  intro: 'Use default parameters, collect arguments with rest, spread arrays into calls and copies, and compare with the old arguments object.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'When do default parameters apply? What is printed?',
      code: `function greet(name = "Guest") {
  return "Hello " + name;
}
console.log(greet());
console.log(greet(undefined));
console.log(greet(null));
console.log(greet(""));`,
      expected: 'Hello Guest\nHello Guest\nHello null\nHello ',
      explain: 'A default is used **only when the argument is `undefined`** (missing or passed as undefined). `null` and `""` are real values, so they are used as they are.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In `function f(a, ...rest) {}` and `Math.max(...nums)`, what is the `...` doing in each place?',
      options: ['Both are spread', 'Both are rest', 'In the parameter list it is rest (collects), in the call it is spread (expands)', 'In the parameter list it is spread, in the call it is rest'],
      answer: 2,
      explain: 'Same three dots, opposite jobs. In a **parameter list** they **collect** remaining arguments into an array (rest). In a **call or array/object literal** they **expand** an array into separate values (spread).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `price(amount, discount = 0, gst = 18)` that returns `amount - discount`, then adds `gst` percent of that value. Use **default parameters**.',
      example: { title: 'default parameters', code: 'function order(item, qty = 1) {\n  return item + " x " + qty;\n}\norder("Tea"); // "Tea x 1"' },
      starter: 'function price(amount, discount, gst) {\n  // TODO: add defaults and calculate\n}',
      solution: 'function price(amount, discount = 0, gst = 18) {\n  const base = amount - discount;\n  return base + (base * gst) / 100;\n}',
      tests: [
        { call: 'price(100)', expect: 118 },
        { call: 'price(200, 100)', expect: 118 },
        { call: 'price(100, 0, 5)', expect: 105 },
        { call: 'price(500, undefined, 0)', expect: 500 },
      ],
      explain: 'Defaults go right in the parameter list. Passing `undefined` (as in `price(500, undefined, 0)`) still uses the default for discount. Before ES6 people wrote `discount = discount || 0`, which wrongly replaced a real 0 too.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `average(...marks)` that accepts **any number** of marks and returns their average. Return `0` if no marks are given.',
      example: { title: 'rest parameter is a real array', code: 'function count(...items) {\n  return items.length;\n}\ncount("a", "b", "c"); // 3' },
      starter: 'function average() {\n  // TODO: use a rest parameter\n}',
      solution: 'function average(...marks) {\n  if (marks.length === 0) return 0;\n  let total = 0;\n  for (const m of marks) total += m;\n  return total / marks.length;\n}',
      tests: [
        { call: 'average(80, 90, 70)', expect: 80 },
        { call: 'average(50)', expect: 50 },
        { call: 'average()', expect: 0 },
        { call: 'average(1, 2, 3, 4)', expect: 2.5 },
      ],
      explain: '`...marks` collects all arguments into a real array, so `length` and `for...of` work. Without the empty check, `0 / 0` would give `NaN`. Rest must be the **last** parameter.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `mergeLists(a, b)` that returns a **new** array with all items of `a` followed by all items of `b`, using spread. The original arrays must not change.',
      example: { title: 'spread to copy and merge', code: 'const copy = [...original];\nconst all = [...first, 99, ...second];' },
      starter: 'function mergeLists(a, b) {\n  // TODO\n}',
      solution: 'function mergeLists(a, b) {\n  return [...a, ...b];\n}',
      tests: [
        { call: 'mergeLists(["Asha", "Ravi"], ["Meena"])', expect: ['Asha', 'Ravi', 'Meena'] },
        { call: '(() => { const x = [1]; const y = [2]; const r = mergeLists(x, y); return [x.length, y.length, r !== x]; })()', expect: [1, 1, true], msg: 'Original arrays are not changed and a new array is returned' },
      ],
      explain: '`[...a, ...b]` creates a brand-new array. Using `a.push(...b)` would modify `a`, which surprises whoever passed it in. Spread makes a **shallow** copy: nested objects are still shared.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `highest(nums)` that returns the biggest number in the array `nums` using `Math.max` and **spread**.',
      example: { title: 'spreading into a call', code: 'const parts = [2, 3];\nMath.pow(...parts); // 8' },
      starter: 'function highest(nums) {\n  return Math.max(nums); // TODO: fix\n}',
      solution: 'function highest(nums) {\n  return Math.max(...nums);\n}',
      tests: [
        { call: 'highest([45, 89, 12])', expect: 89 },
        { call: 'highest([-5, -2])', expect: -2 },
      ],
      explain: '`Math.max` expects separate numbers, not an array. `Math.max([45, 89])` returns NaN. Spreading `...nums` passes each element as its own argument.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'The old `arguments` object. What is printed?',
      code: `function show() {
  console.log(arguments.length);
  console.log(Array.isArray(arguments));
}
show("a", "b", "c");`,
      expected: '3\nfalse',
      explain: '`arguments` holds all passed values and has a `length`, but it is only **array-like**, not a real array (no map/filter). It also does not exist in arrow functions. Rest parameters replace it in modern code.',
    },
  ],
};
