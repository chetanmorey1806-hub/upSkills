export default {
  lesson: 'day-39-higher-order-functions',
  minutes: 35,
  intro: 'Write higher-order functions, curry functions, keep functions pure, update data immutably and compose pipelines.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these functions are **pure**? (choose all that apply)',
      options: ['const add = (a, b) => a + b;', 'const addToCart = (item) => { cart.push(item); };', 'const withGst = (price) => price * 1.18;', 'const now = () => Date.now();', 'const fullName = (u) => `${u.first} ${u.last}`;'],
      answers: [0, 2, 4],
      explain: 'A pure function returns the **same output for the same input** and has **no side effects**. `addToCart` changes an outside array (side effect) and `Date.now()` gives a different result every call.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write your own higher-order function `myFilter(arr, test)` that returns a new array with the items for which `test(item, index)` returns true. Do **not** use the built-in `filter`.',
      example: { title: 'a HOF takes a function', code: 'function repeat(n, action) {\n  for (let i = 0; i < n; i++) action(i);\n}\nrepeat(3, console.log);' },
      starter: 'function myFilter(arr, test) {\n  // TODO\n}',
      solution: 'function myFilter(arr, test) {\n  const result = [];\n  for (let i = 0; i < arr.length; i++) {\n    if (test(arr[i], i)) result.push(arr[i]);\n  }\n  return result;\n}',
      tests: [
        { call: 'myFilter([5, 12, 8, 20], (n) => n > 10)', expect: [12, 20] },
        { call: 'myFilter(["a", "b", "c"], (x, i) => i !== 1)', expect: ['a', 'c'], msg: 'test also receives the index' },
        { call: 'myFilter([], () => true)', expect: [] },
      ],
      explain: 'A higher-order function takes and/or returns functions. Here the **what** (the test) is supplied by the caller, while the **how** (looping, collecting) lives in `myFilter`, which is exactly how the built-in works.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Currying. Write `discount(percent)(price)` as a curried arrow function returning the discounted price, and create `const diwaliSale = discount(30)`.',
      example: { title: 'curried function', code: 'const add = (a) => (b) => a + b;\nconst add10 = add(10);\nadd10(5); // 15' },
      starter: 'const discount = null; // TODO\nconst diwaliSale = null; // TODO',
      solution: 'const discount = (percent) => (price) => price - (price * percent) / 100;\nconst diwaliSale = discount(30);',
      tests: [
        { call: 'discount(10)(500)', expect: 450 },
        { call: 'diwaliSale(1000)', expect: 700 },
        { call: '[100, 200].map(discount(50))', expect: [50, 100], msg: 'Curried functions plug straight into map' },
      ],
      explain: 'Currying turns `f(a, b)` into `f(a)(b)`. Each call returns a new function that remembers the earlier argument (a closure), so you can make specialised versions like `diwaliSale`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Immutable update. Write `markPaid(orders, id)` that returns a **new** array where the order with that `id` is replaced by a **copy** with `paid: true`. The original array and original order objects must not change.',
      example: { title: 'map + spread', code: 'const updated = users.map((u) =>\n  u.id === 2 ? { ...u, active: false } : u\n);' },
      starter: 'function markPaid(orders, id) {\n  const order = orders.find((o) => o.id === id);\n  order.paid = true; // TODO: this mutates! make it immutable\n  return orders;\n}',
      solution: 'function markPaid(orders, id) {\n  return orders.map((o) => (o.id === id ? { ...o, paid: true } : o));\n}',
      tests: [
        { call: 'markPaid([{ id: 1, paid: false }, { id: 2, paid: false }], 2)', expect: [{ id: 1, paid: false }, { id: 2, paid: true }] },
        { call: '(() => { const list = [{ id: 1, paid: false }]; const out = markPaid(list, 1); return [list[0].paid, out !== list, out[0] !== list[0]]; })()', expect: [false, true, true], msg: 'Originals untouched; new array and new object returned' },
      ],
      explain: 'Immutability means creating new versions instead of editing. React and Redux compare references to detect changes, so mutating the old object would make the UI miss the update.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Composition. Write `pipe(...fns)` that returns a function which passes its input through every function **from left to right**. Use `reduce`.\n\n`pipe(trim, lower, slug)("  Hello World ")` → `"hello-world"`',
      example: { title: 'manual pipeline', code: 'const result = c(b(a(x))); // pipe(a, b, c)(x)' },
      starter: 'function pipe(...fns) {\n  // TODO\n}',
      solution: 'function pipe(...fns) {\n  return (input) => fns.reduce((value, fn) => fn(value), input);\n}',
      tests: [
        { call: 'pipe((s) => s.trim(), (s) => s.toLowerCase(), (s) => s.replaceAll(" ", "-"))("  Hello World ")', expect: 'hello-world' },
        { call: 'pipe((n) => n + 1, (n) => n * 2)(5)', expect: 12, msg: 'Left to right: (5 + 1) * 2' },
        { call: 'pipe()(7)', expect: 7 },
      ],
      explain: 'reduce starts with the input and feeds each result into the next function. `compose` is the same but right-to-left (`reduceRight`). Small pure functions combined this way are easy to test and reuse.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Shallow copy vs deep copy vs freeze. What is printed?',
      code: `const user = { name: "Asha", address: { city: "Pune" } };
const shallow = { ...user };
const deep = structuredClone(user);
shallow.address.city = "Mumbai";
console.log(user.address.city);
console.log(deep.address.city);
const frozen = Object.freeze({ score: 10 });
frozen.score = 99;
console.log(frozen.score);`,
      expected: 'Mumbai\nPune\n10',
      explain: 'Spread copies only the top level, so `shallow.address` is the **same** object as `user.address`. `structuredClone` makes a deep copy. `Object.freeze` silently ignores changes (throws in strict mode), and it is also only shallow.',
    },
  ],
};
