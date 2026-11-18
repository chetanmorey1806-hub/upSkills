export default {
  lesson: 'day-13-closures',
  minutes: 30,
  intro: 'Use closures for private state, function factories, once() and memoisation, and predict closure output.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which sentence best defines a **closure**?',
      options: ['A function that closes the browser tab', 'A function together with the variables it remembers from the scope where it was created', 'A function that has no parameters', 'A copy of all global variables'],
      answer: 1,
      explain: 'A closure = a function + its lexical environment. The inner function keeps access to the outer function\'s variables **even after the outer function has returned**.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Each call makes a new "backpack". What is printed?',
      code: `function makeCounter() {
  let count = 0;
  return () => ++count;
}
const c1 = makeCounter();
const c2 = makeCounter();
c1();
c1();
console.log(c1());
console.log(c2());`,
      expected: '3\n1',
      explain: 'Every call to `makeCounter` creates a **separate** `count`. `c1` has been called three times (3), while `c2` has its own fresh counter (1).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Bank account with private balance. Write `createAccount(initial)` that returns an object with:\n- `deposit(amount)` → adds and returns the new balance\n- `withdraw(amount)` → if enough money, subtracts and returns the new balance, otherwise returns `"Insufficient funds"`\n- `getBalance()` → returns the balance\n\nThe balance must live in a local variable (not as a property), so nobody can change it directly.',
      example: { title: 'private variable via closure', code: 'function createLikes() {\n  let likes = 0;\n  return {\n    like() { likes++; return likes; },\n  };\n}' },
      starter: 'function createAccount(initial) {\n  // TODO: let balance = ...\n  return {};\n}',
      solution: 'function createAccount(initial) {\n  let balance = initial;\n  return {\n    deposit(amount) { balance += amount; return balance; },\n    withdraw(amount) {\n      if (amount > balance) return "Insufficient funds";\n      balance -= amount;\n      return balance;\n    },\n    getBalance() { return balance; },\n  };\n}',
      tests: [
        { call: 'createAccount(1000).deposit(500)', expect: 1500 },
        { call: '(() => { const a = createAccount(1000); a.withdraw(300); return a.getBalance(); })()', expect: 700 },
        { call: 'createAccount(100).withdraw(500)', expect: 'Insufficient funds' },
        { call: '(() => { const a = createAccount(100); a.balance = 999999; return a.getBalance(); })()', expect: 100, msg: 'Setting a.balance from outside must not change the real balance' },
      ],
      explain: 'The methods close over `balance`, so they can read and update it, but outside code has no way to reach it. Storing it as `this.balance` or a property would make it public and editable.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Function factory: write `makeDiscount(percent)` that returns a **function** taking a price and returning the discounted price.\n\n`const festive = makeDiscount(20); festive(500)` → `400`',
      example: { title: 'a factory', code: 'function makeMultiplier(x) {\n  return (n) => n * x;\n}\nconst triple = makeMultiplier(3);\ntriple(5); // 15' },
      starter: 'function makeDiscount(percent) {\n  // TODO: return a function\n}',
      solution: 'function makeDiscount(percent) {\n  return (price) => price - (price * percent) / 100;\n}',
      tests: [
        { call: 'makeDiscount(20)(500)', expect: 400 },
        { call: 'makeDiscount(10)(250)', expect: 225 },
        { call: '(() => { const a = makeDiscount(50); const b = makeDiscount(0); return [a(100), b(100)]; })()', expect: [50, 100] },
      ],
      explain: 'The returned function remembers `percent` from the call that created it. Each factory call creates an independent function with its own `percent`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `once(fn)` that returns a new function which calls `fn` only the **first** time and returns its result. Every later call returns that same first result without calling `fn` again.',
      example: { title: 'remembering a flag', code: 'function makeToggle() {\n  let done = false;\n  return () => {\n    if (done) return "already";\n    done = true;\n    return "now";\n  };\n}' },
      starter: 'function once(fn) {\n  // TODO\n}',
      solution: 'function once(fn) {\n  let called = false;\n  let result;\n  return (...args) => {\n    if (!called) {\n      called = true;\n      result = fn(...args);\n    }\n    return result;\n  };\n}',
      tests: [
        { call: '(() => { let n = 0; const pay = once(() => ++n); pay(); pay(); pay(); return n; })()', expect: 1, msg: 'fn runs only once' },
        { call: '(() => { const init = once((x) => x * 2); return [init(5), init(100)]; })()', expect: [10, 10], msg: 'Later calls return the first result' },
      ],
      explain: '`called` and `result` live in the closure, so they survive between calls. This is used for "Pay now" buttons or initialisation code that must not run twice.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Memoisation: write `memoSquare()` that returns a function `square(n)`. It returns `n * n`, but it stores results in a private cache object. Also return how many times the real calculation ran via `square.calls` (a property on the function).\n\nIf the same `n` is asked again, the cached value is returned and `calls` does not increase.',
      example: { title: 'a cache in a closure', code: 'const cache = {};\nif (key in cache) return cache[key];\ncache[key] = value;' },
      starter: 'function memoSquare() {\n  const cache = {};\n  const square = (n) => {\n    // TODO: use the cache, count real calculations\n  };\n  square.calls = 0;\n  return square;\n}',
      solution: 'function memoSquare() {\n  const cache = {};\n  const square = (n) => {\n    if (n in cache) return cache[n];\n    square.calls++;\n    cache[n] = n * n;\n    return cache[n];\n  };\n  square.calls = 0;\n  return square;\n}',
      tests: [
        { call: 'memoSquare()(9)', expect: 81 },
        { call: '(() => { const sq = memoSquare(); sq(4); sq(4); sq(5); sq(4); return sq.calls; })()', expect: 2, msg: 'Repeated inputs come from the cache' },
      ],
      explain: 'The cache is private to each memoised function because it is created inside `memoSquare`. Check the cache **before** computing; computing first and caching afterwards saves nothing.',
    },
  ],
};
