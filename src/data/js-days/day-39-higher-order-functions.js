const ex1 = `// Higher-order functions: take a function and/or return a function

// 1. Takes a function as an argument
function repeat(times, action) {
  for (let i = 1; i <= times; i++) action(i);
}
repeat(3, (i) => console.log('Lap', i));

// 2. Returns a function
function makeGreeter(greeting) {
  return function (name) {
    return greeting + ', ' + name + '!';
  };
}
const hindiGreet = makeGreeter('Namaste');
const englishGreet = makeGreeter('Hello');
console.log(hindiGreet('Asha'), '|', englishGreet('Ravi'));

// 3. Built-in HOFs you already know: map / filter / reduce
const products = [
  { name: 'Pen', price: 20, inStock: true },
  { name: 'Bag', price: 900, inStock: false },
  { name: 'Book', price: 350, inStock: true },
];
const totalInStock = products
  .filter((p) => p.inStock)
  .map((p) => p.price)
  .reduce((sum, price) => sum + price, 0);
console.log('Total of in-stock items:', totalInStock);

// 4. A HOF that wraps (decorates) another function
function withLogging(fn) {
  return function (...args) {
    const result = fn(...args);
    console.log(fn.name + '(' + args.join(', ') + ') =', result);
    return result;
  };
}
const add = (a, b) => a + b;
const loggedAdd = withLogging(add);
loggedAdd(2, 3);`;

const ex2 = `// Currying: f(a, b, c) -> f(a)(b)(c)
const addNormal = (a, b, c) => a + b + c;
const addCurried = (a) => (b) => (c) => a + b + c;

console.log(addNormal(1, 2, 3), addCurried(1)(2)(3));

// Why? Create specialised functions from general ones
const discount = (percent) => (price) => price - (price * percent) / 100;
const festiveSale = discount(20);
const clearanceSale = discount(50);
console.log('Festive:', [500, 1200].map(festiveSale));
console.log('Clearance:', [500, 1200].map(clearanceSale));

// A generic curry helper (works for any fixed-arity function)
function curry(fn) {
  return function curried(...args) {
    if (args.length >= fn.length) return fn(...args);       // enough args -> call
    return (...more) => curried(...args, ...more);          // else wait for more
  };
}
const volume = (l, w, h) => l * w * h;
const cVolume = curry(volume);
console.log(cVolume(2)(3)(4), cVolume(2, 3)(4), cVolume(2)(3, 4), cVolume(2, 3, 4));

// Practical: a curried logger
const log = (level) => (module) => (msg) => '[' + level + '][' + module + '] ' + msg;
const authError = log('ERROR')('auth');
console.log(authError('Token expired'));`;

const ex3 = `// Pure vs impure functions
let taxRate = 0.18;

// IMPURE: depends on outside variable (taxRate) that can change
function priceWithTaxImpure(price) {
  return price + price * taxRate;
}

// PURE: output depends only on inputs, no side effects
function priceWithTax(price, rate) {
  return price + price * rate;
}

console.log(priceWithTaxImpure(100), priceWithTax(100, 0.18));
taxRate = 0.05;                                   // someone changes a global...
console.log(priceWithTaxImpure(100), priceWithTax(100, 0.18)); // impure result changed!

// IMPURE: mutates its argument (side effect)
function addItemImpure(cart, item) {
  cart.push(item);
  return cart;
}
// PURE: returns a NEW array, original untouched
function addItem(cart, item) {
  return [...cart, item];
}

const cart = ['Pen'];
const newCart = addItem(cart, 'Book');
console.log('pure ->', cart, newCart, cart === newCart);
addItemImpure(cart, 'Bag');
console.log('impure -> original changed:', cart);

// Other side effects: console.log, DOM changes, network, Math.random(), Date.now()
const rollDice = () => Math.floor(Math.random() * 6) + 1;   // impure (random)
console.log('dice is between 1 and 6:', rollDice() >= 1 && rollDice() <= 6);`;

const ex4 = `// Immutability: update data by creating copies instead of changing it
const user = {
  name: 'Asha',
  address: { city: 'Pune', pin: '411001' },
  skills: ['HTML', 'CSS'],
};

// Update objects/arrays with spread - each level you change must be copied
const updated = {
  ...user,
  address: { ...user.address, city: 'Mumbai' },
  skills: [...user.skills, 'JS'],
};
console.log(user.address.city, user.skills.length, '->', updated.address.city, updated.skills.length);

// Immutable array operations
const nums = [3, 1, 2];
const sorted = [...nums].sort((a, b) => a - b);  // copy before sort (sort mutates!)
const sorted2 = nums.toSorted((a, b) => a - b);  // ES2023: non-mutating version
const without1 = nums.filter((n) => n !== 1);    // remove
const replaced = nums.map((n) => (n === 2 ? 20 : n)); // replace
console.log(nums, sorted, sorted2, without1, replaced);

// Shallow copy trap: nested objects are still SHARED
const shallow = { ...user };
shallow.address.city = 'Delhi';
console.log('original city after shallow edit:', user.address.city);

// Deep copy with structuredClone
const deep = structuredClone(user);
deep.address.city = 'Chennai';
console.log('original city after deep edit:', user.address.city);

// Object.freeze prevents changes (shallow!)
const config = Object.freeze({ apiUrl: '/api', limits: { max: 10 } });
try {
  config.apiUrl = '/hacked';         // ignored (sloppy mode) or TypeError (strict mode)
} catch (e) {}
config.limits.max = 99;              // nested object is NOT frozen
console.log(config.apiUrl, config.limits.max, Object.isFrozen(config));`;

const ex5 = `// Function composition: build pipelines from small pure functions
const trim = (s) => s.trim();
const lower = (s) => s.toLowerCase();
const removeSpecial = (s) => s.replace(/[^a-z0-9\\s-]/g, '');
const spacesToDash = (s) => s.replace(/\\s+/g, '-');

// pipe: run left -> right   compose: run right -> left
const pipe = (...fns) => (input) => fns.reduce((value, fn) => fn(value), input);
const compose = (...fns) => (input) => fns.reduceRight((value, fn) => fn(value), input);

const slugify = pipe(trim, lower, removeSpecial, spacesToDash);
console.log(slugify('  Learn JavaScript: HOFs & Currying!  '));

const slugify2 = compose(spacesToDash, removeSpecial, lower, trim);
console.log(slugify2('  Hello World 2024 '));

// Data pipeline with reusable pure helpers
const orders = [
  { id: 1, amount: 250, status: 'paid' },
  { id: 2, amount: 900, status: 'pending' },
  { id: 3, amount: 1200, status: 'paid' },
];
const onlyPaid = (list) => list.filter((o) => o.status === 'paid');
const amounts = (list) => list.map((o) => o.amount);
const sum = (list) => list.reduce((a, b) => a + b, 0);
const paidRevenue = pipe(onlyPaid, amounts, sum);
console.log('Paid revenue:', paidRevenue(orders));`;

export default {
  id: 'day-39-higher-order-functions',
  title: 'Higher-Order Functions, Currying, Pure Functions, Immutability',
  module: 'Module 6: Advanced JavaScript',
  day: 39,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'Functional programming ideas make JavaScript code more predictable and reusable. You will learn functions that take or return functions, currying, pure functions without side effects, immutable updates and composing small functions into pipelines – the style used heavily in React and Redux.',
  objectives: [
    'Define first-class and higher-order functions and write your own',
    'Transform multi-argument functions with currying and build specialised functions',
    'Tell pure functions from impure ones and identify side effects',
    'Update objects and arrays immutably and understand shallow vs deep copies',
    'Compose small functions into pipelines with pipe/compose',
  ],
  theory: [
    {
      heading: 'Functions are First-Class Citizens',
      content:
        'In JavaScript, functions are **values**, just like numbers or strings. You can:\n- store a function in a variable or object property\n- pass a function as an argument\n- return a function from another function\n\nThis is called having **first-class functions**, and it makes higher-order functions possible.',
    },
    {
      heading: 'Higher-Order Functions (HOFs)',
      content:
        'A **higher-order function** is a function that **takes a function as an argument**, **returns a function**, or both.\n\nAnalogy: a coffee machine (HOF) that accepts a "recipe card" (function) and makes any drink. You don\'t need a new machine for every drink.\n\nYou already use HOFs every day:\n- `array.map / filter / reduce / forEach / sort / find`\n- `setTimeout(fn, ms)`, `addEventListener("click", fn)`\n- `promise.then(fn)`\n\nCommon reasons to write your own: **abstraction** (hide loops), **reuse** (one function, many behaviours), and **decorators/wrappers** that add logging, caching (memoize), timing or once-only behaviour to any function.',
      syntax: `// takes a function
const apply = (fn, value) => fn(value);
// returns a function (uses closure, Day 13)
const multiplier = (n) => (x) => x * n;
const triple = multiplier(3);
triple(5); // 15`,
    },
    {
      heading: 'Currying',
      content:
        '**Currying** transforms a function that takes several arguments into a chain of functions that each take **one** argument:\n\n`add(a, b, c)` → `add(a)(b)(c)`\n\nWhy is it useful?\n- **Specialisation / reuse**: `const festiveSale = discount(20)` – fix some arguments now, supply the rest later\n- Works nicely with `map`/`filter`, which pass one argument\n- Makes function composition easier\n\nCurrying relies on **closures**: each inner function remembers the arguments of the outer ones.\n\n**Currying vs partial application**: currying always produces one-argument functions; partial application (e.g. `fn.bind(null, 2)` from Day 38) pre-fills *some* arguments and returns a function taking the rest.',
      syntax: `const discount = (percent) => (price) => price - price * percent / 100;
const half = discount(50);
half(400); // 200`,
    },
    {
      heading: 'Pure Functions and Side Effects',
      content:
        'A **pure function**:\n1. Always returns the **same output for the same input** (deterministic)\n2. Has **no side effects** – it does not change anything outside itself\n\nA **side effect** is any observable change outside the function: modifying a global variable or argument, writing to the DOM, `console.log`, network requests, `localStorage`, or reading changing values like `Math.random()` / `Date.now()`.\n\nAnalogy: a calculator is pure (2 + 2 is always 4 and it doesn\'t change your bank balance). An ATM withdrawal is impure (it changes the world).\n\nBenefits of pure functions: easy to **test**, easy to **reason about**, safe to **cache** (memoize) and to run in any order.\n\nReal programs need side effects – the goal is to keep the core logic pure and push side effects to the edges (event handlers, API layer).',
      tip: 'Array methods that mutate: push, pop, shift, unshift, splice, sort, reverse, fill. Non-mutating: map, filter, reduce, slice, concat, toSorted, toReversed, toSpliced, with.',
    },
    {
      heading: 'Immutability',
      content:
        '**Immutability** means not changing existing data; instead you create a **new copy with the changes**. React and Redux depend on it: they detect changes by comparing references (`old !== new`).\n\nTools:\n- Objects: `{ ...obj, key: newValue }`\n- Arrays: `[...arr, item]`, `filter` to remove, `map` to replace, `toSorted()` instead of `sort()`\n- Nested data: copy **every level** you change: `{ ...user, address: { ...user.address, city } }`\n- `structuredClone(obj)` – a real **deep copy**\n- `Object.freeze(obj)` – make an object read-only (**shallow**: nested objects can still change)\n\n**Shallow vs deep copy**: spread copies only the top level; nested objects are still shared references (Day 18).',
      tip: 'const does NOT make a value immutable – it only prevents reassigning the variable. const arr = []; arr.push(1) works fine.',
    },
    {
      heading: 'Function Composition',
      content:
        '**Composition** means building a bigger function by chaining small ones, where the output of one becomes the input of the next – like an assembly line in a factory.\n\n- `pipe(f, g, h)(x)` = `h(g(f(x)))` – runs **left to right** (easier to read)\n- `compose(f, g, h)(x)` = `f(g(h(x)))` – runs **right to left** (mathematical style)\n\nBoth are tiny HOFs built with `reduce`.',
      syntax: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const slug = pipe(trim, lower, dashify);`,
      tip: 'Coming next (Day 40): debounce and throttle – two very practical higher-order functions.',
    },
  ],
  examples: [
    {
      title: 'Writing and using higher-order functions',
      scenario: 'Functions that accept actions, create greeters, process products and wrap other functions with logging.',
      steps: [
        'Write repeat(times, action) that calls the action',
        'Write makeGreeter that returns a new function',
        'Chain filter → map → reduce on products',
        'Write withLogging(fn) that wraps any function, click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        'Lap 1\nLap 2\nLap 3\nNamaste, Asha! | Hello, Ravi!\nTotal of in-stock items: 370\nadd(2, 3) = 5',
      explanation:
        'repeat receives behaviour as a parameter. makeGreeter returns functions that remember their greeting (closure). withLogging is a decorator: it returns a new function that calls the original and adds logging.',
    },
    {
      title: 'Currying and a generic curry helper',
      scenario: 'Create specialised discount functions and write curry() that works for any function.',
      steps: [
        'Compare addNormal(1,2,3) with addCurried(1)(2)(3)',
        'Create discount(percent)(price) and specialise it',
        'Write curry(fn) using fn.length',
        'Build a curried logger, click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        '6 6\nFestive: [ 400, 960 ]\nClearance: [ 250, 600 ]\n24 24 24 24\n[ERROR][auth] Token expired',
      explanation:
        'Both add styles give 6. discount(20) returns a function remembering 20 – perfect for map. curry() collects arguments until it has fn.length of them, so all call styles give 24.',
    },
    {
      title: 'Pure vs impure functions',
      scenario: 'See how hidden dependencies and mutations make functions unpredictable.',
      steps: [
        'Write an impure price function that reads a global taxRate',
        'Write a pure version that receives the rate as an argument',
        'Change the global and compare results',
        'Compare a mutating addItem with a pure one, click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        "118 118\n105 118\npure -> [ 'Pen' ] [ 'Pen', 'Book' ] false\nimpure -> original changed: [ 'Pen', 'Bag' ]\ndice is between 1 and 6: true",
      explanation:
        'The impure function returned a different value for the same input after a global changed. The pure addItem returns a new array, leaving the original untouched; the impure one modifies the caller\'s data.',
    },
    {
      title: 'Immutable updates, shallow vs deep copy, freeze',
      scenario: 'Update a nested user object without changing the original.',
      steps: [
        'Use nested spread to change the city and add a skill',
        'Use [...arr].sort, toSorted, filter and map for arrays',
        'Show the shallow copy trap and fix it with structuredClone',
        'Try changing a frozen object, click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'Pune 2 -> Mumbai 3\n[ 3, 1, 2 ] [ 1, 2, 3 ] [ 1, 2, 3 ] [ 3, 2 ] [ 3, 1, 20 ]\noriginal city after shallow edit: Delhi\noriginal city after deep edit: Delhi\n/api 99 true',
      explanation:
        'Nested spread copies each changed level, so user is untouched. A plain spread copy shares the nested address, so editing it changed the original (Delhi). structuredClone makes a full copy, so editing Chennai did not affect it. freeze blocked apiUrl but not the nested limits object (shallow). Writing to a frozen property is silently ignored in sloppy mode and throws a TypeError in strict mode, so we wrap it in try/catch.',
    },
    {
      title: 'Function composition with pipe and compose',
      scenario: 'Turn a blog title into a URL slug and compute revenue with a pipeline of small pure functions.',
      steps: [
        'Write tiny single-purpose functions (trim, lower, ...)',
        'Write pipe and compose with reduce / reduceRight',
        'Build slugify and a revenue pipeline',
        'Click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result: 'learn-javascript-hofs-currying\nhello-world-2024\nPaid revenue: 1450',
      explanation:
        'pipe feeds each function\'s output into the next, left to right; compose does the same right to left. Each helper is pure and testable on its own, and the pipelines read like a recipe.',
    },
  ],
  interview: [
    {
      q: 'What is a higher-order function?',
      a: 'A function that takes one or more functions as arguments and/or returns a function. Examples: map, filter, reduce, setTimeout, addEventListener, and custom decorators like debounce or memoize.',
      level: 'Easy',
    },
    {
      q: 'What does "functions are first-class citizens" mean?',
      a: 'Functions are values: they can be assigned to variables, stored in data structures, passed as arguments and returned from other functions.',
      level: 'Easy',
    },
    {
      q: 'What is currying? Write a curried sum.',
      a: 'Transforming f(a, b, c) into f(a)(b)(c), each call taking one argument and returning the next function.\nconst sum = (a) => (b) => (c) => a + b + c;\nsum(1)(2)(3); // 6',
      level: 'Medium',
    },
    {
      q: 'Implement infinite currying: sum(1)(2)(3)() → 6.',
      a: 'const sum = (a) => (b) => (b === undefined ? a : sum(a + b));\nEach call with an argument returns a new function with the running total; calling with no argument returns the total.',
      level: 'Hard',
    },
    {
      q: 'What is a pure function?',
      a: 'A function that always returns the same result for the same arguments and has no side effects (does not modify external state, I/O, DOM, globals or its arguments).',
      level: 'Easy',
    },
    {
      q: 'Give examples of side effects.',
      a: 'Mutating a global or an argument, DOM manipulation, console.log, HTTP requests, writing to storage, timers, and reading non-deterministic values like Math.random() or Date.now().',
      level: 'Easy',
    },
    {
      q: 'Why is immutability important in React/Redux?',
      a: 'They detect changes by reference comparison (prev !== next). Mutating state in place keeps the same reference, so components may not re-render. Immutable updates also make history/undo and debugging easier.',
      level: 'Medium',
    },
    {
      q: 'Difference between shallow and deep copy?',
      a: 'A shallow copy ({...obj}, Object.assign, slice) copies only top-level properties; nested objects are shared. A deep copy (structuredClone, or a recursive copy) duplicates all nested levels.',
      level: 'Medium',
    },
    {
      q: 'Does Object.freeze make an object deeply immutable?',
      a: 'No, it is shallow. Nested objects can still be modified unless frozen too (deep freeze with recursion).',
      level: 'Medium',
    },
    {
      q: 'What is function composition?',
      a: 'Combining functions so the output of one is the input of the next. pipe(f, g)(x) = g(f(x)); compose(f, g)(x) = f(g(x)). Implemented with reduce/reduceRight.',
      level: 'Medium',
    },
    {
      q: 'Implement a memoize HOF.',
      a: 'const memoize = (fn) => {\n  const cache = new Map();\n  return (n) => {\n    if (cache.has(n)) return cache.get(n);\n    const r = fn(n);\n    cache.set(n, r);\n    return r;\n  };\n};\nIt only works safely for pure functions.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Write once(fn) that returns a function which runs fn only the first time and returns the first result on later calls.',
      hint: 'Use a closure with a called flag and a stored result.',
      solution: `function once(fn) {
  let called = false, result;
  return function (...args) {
    if (!called) { called = true; result = fn(...args); }
    return result;
  };
}
const init = once(() => { console.log('Initialising...'); return 42; });
console.log(init(), init()); // logs "Initialising..." once, then 42 42`,
    },
    {
      task: 'Write your own myFilter(arr, predicate) higher-order function without using the built-in filter.',
      hint: 'Loop and push items where predicate returns true.',
      solution: `function myFilter(arr, predicate) {
  const out = [];
  for (let i = 0; i < arr.length; i++) {
    if (predicate(arr[i], i, arr)) out.push(arr[i]);
  }
  return out;
}
console.log(myFilter([1, 2, 3, 4, 5], (n) => n % 2 === 1)); // [1, 3, 5]`,
    },
    {
      task: 'Create a curried function greaterThan(n)(x) and use it with filter to get marks above 40 and above 75.',
      hint: 'const greaterThan = (n) => (x) => x > n;',
      solution: `const greaterThan = (n) => (x) => x > n;
const marks = [35, 42, 78, 90, 15, 66];
console.log(marks.filter(greaterThan(40))); // [42, 78, 90, 66]
console.log(marks.filter(greaterThan(75))); // [78, 90]`,
    },
    {
      task: 'Given a todos array, write pure functions toggleTodo(todos, id) and removeTodo(todos, id) that return new arrays without mutating the input.',
      hint: 'map with spread for toggle, filter for remove.',
      solution: `const toggleTodo = (todos, id) =>
  todos.map((t) => (t.id === id ? { ...t, done: !t.done } : t));
const removeTodo = (todos, id) => todos.filter((t) => t.id !== id);

const todos = [{ id: 1, text: 'Learn HOF', done: false }, { id: 2, text: 'Practice', done: false }];
const t2 = toggleTodo(todos, 1);
console.log(todos[0].done, t2[0].done, todos === t2); // false true false
console.log(removeTodo(t2, 2).length); // 1`,
    },
    {
      task: 'Use pipe to build a function that takes an array of numbers, removes negatives, squares each, and returns the sum.',
      hint: 'pipe(removeNeg, square, sum)',
      solution: `const pipe = (...fns) => (x) => fns.reduce((v, f) => f(v), x);
const removeNeg = (arr) => arr.filter((n) => n >= 0);
const square = (arr) => arr.map((n) => n * n);
const sum = (arr) => arr.reduce((a, b) => a + b, 0);
const sumOfSquares = pipe(removeNeg, square, sum);
console.log(sumOfSquares([1, -2, 3, -4, 5])); // 35`,
    },
  ],
  quiz: [
    {
      question: 'Which of these is NOT a higher-order function?',
      options: ['Array.prototype.map', 'setTimeout', 'Math.max', 'addEventListener'],
      answer: 2,
      explanation: 'Math.max takes numbers, not functions.',
    },
    {
      question: 'What is the curried form of f(a, b)?',
      options: ['f(a, b)()', 'f(a)(b)', 'f([a, b])', 'f.bind(a, b)'],
      answer: 1,
      explanation: 'Each call takes one argument.',
    },
    {
      question: 'Which function is pure?',
      options: [
        '(arr) => arr.push(1)',
        '() => Date.now()',
        '(x) => { console.log(x); return x; }',
        '(a, b) => a * b',
      ],
      answer: 3,
      explanation: 'Same input → same output, no side effects.',
    },
    {
      question: 'Which array method mutates the original array?',
      options: ['sort', 'map', 'toSorted', 'filter'],
      answer: 0,
      explanation: 'sort sorts in place; toSorted returns a new array.',
    },
    {
      question: 'Which creates a deep copy of a nested object?',
      options: ['{ ...obj }', 'Object.assign({}, obj)', 'structuredClone(obj)', 'Object.freeze(obj)'],
      answer: 2,
      explanation: 'structuredClone copies all nested levels.',
    },
  ],
};
