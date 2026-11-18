export default {
  lesson: 'day-38-call-apply-bind',
  minutes: 35,
  intro: 'Apply the four this-binding rules and use call, apply and bind to borrow methods, fix callbacks and pre-fill arguments.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `call` and `apply`?',
      options: ['call is synchronous, apply is async', 'call takes arguments one by one; apply takes them as an array', 'apply returns a new function, call does not', 'There is no difference'],
      answer: 1,
      explain: '`fn.call(thisArg, a, b)` vs `fn.apply(thisArg, [a, b])`: both call the function **immediately** with the chosen `this`. Memory trick: **A**pply = **A**rray. `bind` is the one that returns a new function.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The binding rules. What is printed?',
      code: `"use strict";
function whoAmI() {
  return this ? this.name : "no this";
}
const asha = { name: "Asha", whoAmI };
const ravi = { name: "Ravi" };
console.log(asha.whoAmI());
console.log(whoAmI());
console.log(whoAmI.call(ravi));
const bound = whoAmI.bind(ravi);
console.log(bound.call(asha));`,
      expected: 'Asha\nno this\nRavi\nRavi',
      explain: 'Implicit binding: left of the dot (Asha). Default binding in strict mode: `undefined`. Explicit binding with `call`: Ravi. A **bound** function ignores later `call`/`apply`; its `this` is fixed forever (only `new` can override it).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Method borrowing. `student` has no `introduce` method, but `teacher` does. Write `introduceStudent()` that calls `teacher.introduce` **with `student` as `this`** using `call`, passing the greeting `"Hi"`, and returns the result.',
      example: { title: 'borrowing with call', code: 'const a = { n: "A", show(prefix) { return prefix + this.n; } };\nconst b = { n: "B" };\na.show.call(b, ">> "); // ">> B"' },
      starter: 'const teacher = {\n  name: "Meena Ma\'am",\n  introduce(greeting) {\n    return `${greeting}, I am ${this.name}`;\n  },\n};\nconst student = { name: "Asha" };\n\nfunction introduceStudent() {\n  // TODO\n}',
      solution: 'const teacher = {\n  name: "Meena Ma\'am",\n  introduce(greeting) {\n    return `${greeting}, I am ${this.name}`;\n  },\n};\nconst student = { name: "Asha" };\n\nfunction introduceStudent() {\n  return teacher.introduce.call(student, "Hi");\n}',
      tests: [{ call: 'introduceStudent()', expect: 'Hi, I am Asha' }],
      explain: '`call` runs the function right now with the `this` you choose. Writing `teacher.introduce("Hi")` would use teacher as `this` and print the teacher\'s name.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Use `apply`. Write `maxOf(numbers)` that returns the largest number by calling `Math.max.apply(null, numbers)` (the pre-spread way).',
      example: { title: 'apply with an array', code: 'function add(a, b) { return a + b; }\nadd.apply(null, [2, 3]); // 5' },
      starter: 'function maxOf(numbers) {\n  // TODO\n}',
      solution: 'function maxOf(numbers) {\n  return Math.max.apply(null, numbers);\n}',
      tests: [
        { call: 'maxOf([12, 99, 45])', expect: 99 },
        { call: 'maxOf([-3, -1])', expect: -1 },
      ],
      explain: '`apply` spreads the array into separate arguments; `Math.max` does not use `this`, so `null` is fine. Today `Math.max(...numbers)` does the same, but you will still meet `apply` in older code and interviews.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Fix a lost `this` with `bind`. `runLater(fn)` calls `fn()` without any object (like setTimeout or an event would). Write `getBoundLabel()` that returns a **bound** version of `product.label` so that `runLater(getBoundLabel())` returns `"Laptop: ₹55000"`.',
      example: { title: 'bind for callbacks', code: 'const timer = { s: 0, tick() { this.s++; } };\nsetInterval(timer.tick.bind(timer), 1000);' },
      starter: '"use strict";\nconst product = {\n  name: "Laptop",\n  price: 55000,\n  label() {\n    return `${this.name}: ₹${this.price}`;\n  },\n};\nfunction runLater(fn) {\n  return fn();\n}\n\nfunction getBoundLabel() {\n  return product.label; // TODO: this loses `this`\n}',
      solution: '"use strict";\nconst product = {\n  name: "Laptop",\n  price: 55000,\n  label() {\n    return `${this.name}: ₹${this.price}`;\n  },\n};\nfunction runLater(fn) {\n  return fn();\n}\n\nfunction getBoundLabel() {\n  return product.label.bind(product);\n}',
      tests: [{ call: 'runLater(getBoundLabel())', expect: 'Laptop: ₹55000' }],
      explain: 'Passing `product.label` passes only the function; when it is called later as `fn()`, `this` is undefined. `bind(product)` returns a new function whose `this` is permanently `product`. An arrow wrapper `() => product.label()` also works.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Partial application with bind. Given `function price(gstRate, amount)`, create two functions using `bind` (with `null` as `this`):\n- `withGst5` → GST rate 5 pre-filled\n- `withGst18` → GST rate 18 pre-filled',
      example: { title: 'pre-filling arguments', code: 'function multiply(a, b) { return a * b; }\nconst double = multiply.bind(null, 2);\ndouble(7); // 14' },
      starter: 'function price(gstRate, amount) {\n  return amount + (amount * gstRate) / 100;\n}\n// TODO: const withGst5 = ...\n// TODO: const withGst18 = ...\n',
      solution: 'function price(gstRate, amount) {\n  return amount + (amount * gstRate) / 100;\n}\nconst withGst5 = price.bind(null, 5);\nconst withGst18 = price.bind(null, 18);',
      tests: [
        { call: 'withGst5(200)', expect: 210 },
        { call: 'withGst18(1000)', expect: 1180 },
      ],
      explain: 'Extra arguments to `bind` are fixed in front of the ones passed later. This creates specialised functions from a general one without writing new code.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Interview classic: implement your own `myCall`. Add `Function.prototype.myCall = function (ctx, ...args) { ... }` that calls the function with `this = ctx` and the given args, and returns the result. Hint: temporarily store the function on `ctx` under a `Symbol()` key, call it as a method, then delete it.',
      example: { title: 'the trick', code: 'const key = Symbol();\nctx[key] = this;       // this = the function\nconst result = ctx[key](...args); // implicit binding\ndelete ctx[key];' },
      starter: 'Function.prototype.myCall = function (ctx, ...args) {\n  // TODO\n};',
      solution: 'Function.prototype.myCall = function (ctx, ...args) {\n  const key = Symbol();\n  ctx[key] = this;\n  const result = ctx[key](...args);\n  delete ctx[key];\n  return result;\n};',
      tests: [
        { call: '(function (a, b) { return this.x + a + b; }).myCall({ x: 1 }, 2, 3)', expect: 6 },
        { call: '(() => { const o = { n: "Asha" }; (function () { return this.n; }).myCall(o); return Object.getOwnPropertySymbols(o).length; })()', expect: 0, msg: 'The temporary key is removed afterwards' },
      ],
      explain: 'Inside `myCall`, `this` is the function being called. Attaching it to `ctx` and calling `ctx[key]()` uses **implicit binding** to make `this` = ctx. A Symbol key avoids overwriting any real property.',
    },
  ],
};
