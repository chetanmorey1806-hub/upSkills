export default {
  id: 'day-13-closures',
  title: 'Closures and Lexical Scope',
  module: 'Module 2: Functions & Arrays',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'A closure is a function that remembers the variables from the place where it was created, even after that outer function has finished. Learn how closures work, why they are used for private data, function factories, once-only functions and memoisation, and how they explain the famous loop + setTimeout question.',
  objectives: [
    'Define a closure in simple words and in interview-ready words',
    'Explain how lexical scope makes closures possible',
    'Use closures to create private variables (counters, bank accounts)',
    'Build function factories, once() and simple memoisation with closures',
    'Predict output of closure questions including loops with var vs let',
  ],
  theory: [
    {
      heading: 'Recap: lexical scope',
      content: 'On Day 12 you learned that an inner function can read variables from its outer function, because scope is decided by **where the code is written** (lexical scope). In the snippet below, `inner` reads `secret` from `outer`.\n\nThe interesting question is: what happens if `inner` is **returned** and called **later**, after `outer` has already finished running? Normally local variables disappear when a function ends. But here they do not. That is a closure.',
      syntax: `function outer() {
  const secret = 42;
  function inner() {
    console.log(secret); // inner can see outer's variable
  }
  inner();
}`,
    },
    {
      heading: 'What is a closure?',
      content: '**Simple definition:** a closure is a function **together with the variables it remembers** from the scope where it was created.\n\n**Interview definition:** "A closure is the combination of a function and its lexical environment. It allows a function to access variables from its outer scope even after the outer function has returned."\n\nAnalogy: a closure is like a **backpack**. When a function is created inside another function, it packs a backpack with the outer variables it uses. Wherever the function goes (returned, passed as a callback, stored in an object), it carries the backpack and can open it any time.\n\nImportant details:\n- The closure keeps a **live reference** to the variables, not a snapshot copy. If the variable changes, the closure sees the new value.\n- **Each call** of the outer function creates a **new, separate** backpack.\n- In JavaScript, **every function** is technically a closure, but we usually use the word when a function outlives its outer scope.',
      syntax: `function makeGreeter(greeting) {
  return function (name) {
    return greeting + ", " + name;
  };
}
const hello = makeGreeter("Hello");
const namaste = makeGreeter("Namaste");
hello("Asha");    // "Hello, Asha"
namaste("Ravi");  // "Namaste, Ravi"`,
    },
    {
      heading: 'Use case 1: private data (encapsulation)',
      content: 'JavaScript objects expose all their properties. With a closure you can hide a variable so that **only specific functions** can read or change it. This is called **data privacy** or **encapsulation**, and it was the main way to make private state before class private fields (`#field`).\n\nPattern: an outer function declares a variable, then returns an object of functions (methods) that use it. Code outside can only call the methods; it cannot touch the variable directly.\n\nThis pattern is known as the **module pattern**.',
      syntax: `function createCounter() {
  let count = 0; // private
  return {
    increment: () => ++count,
    getCount: () => count,
  };
}
const c = createCounter();
c.increment();
c.increment();
console.log(c.getCount()); // 2
console.log(c.count);      // undefined (not accessible)`,
    },
    {
      heading: 'Use case 2: function factories, once and memoisation',
      content: '**Function factory**: a function that builds and returns customised functions. `makeMultiplier(3)` returns a function that triples numbers. Each returned function remembers its own factor.\n\n**once()**: wrap a function so it runs only the first time (e.g. a "Pay" button that must not charge twice). The closure remembers a `called` flag.\n\n**Memoisation (caching)**: remember results of expensive calls in a cache object kept in a closure; next time with the same input, return the cached value instantly.\n\nOther everyday closures you will meet: event handlers that remember data (Day 25), debounce/throttle timers (Day 40), React hooks (React course).',
      syntax: `function makeMultiplier(factor) {
  return (n) => n * factor;
}
const double = makeMultiplier(2);
const triple = makeMultiplier(3);
double(5); // 10
triple(5); // 15`,
    },
    {
      heading: 'Closures in loops',
      content: 'Closures capture **variables**, not values. With `var` in a loop there is only **one** variable shared by all iterations, so every closure sees the final value. With `let` each iteration gets a **new** variable, so each closure remembers its own value.\n\nThe classic question:\n\n`for (var i = 0; i < 3; i++) { setTimeout(() => console.log(i), 100); }` prints **3, 3, 3**.\n\nFixes:\n1. Use `let i` (best).\n2. Create a new scope per iteration with a function (an IIFE: Immediately Invoked Function Expression) that receives i as a parameter. This was the pre-ES2015 fix.',
      syntax: `for (var i = 0; i < 3; i++) {
  (function (j) {
    setTimeout(() => console.log(j), 100); // 0, 1, 2
  })(i);
}`,
    },
    {
      heading: 'Memory and common mistakes',
      content: '- Closures keep their variables alive as long as the closure itself is reachable. That is how they work, but holding big data (large arrays, DOM nodes) in long-lived closures can waste memory. Remove listeners/timers you no longer need.\n- Remember each factory call creates **separate** state: two counters do not share a count.\n- A closure sees the **latest** value of a variable, not the value at the time the function was created (unless that variable never changes).\n\nComing next (Day 14): arrays.',
      tip: 'Interview tip: when asked "Where have you used closures?", mention private counters/state, function factories, once(), memoisation, event handlers, debounce and React hooks.',
    },
  ],
  examples: [
    {
      title: 'A counter with private state',
      scenario: 'Create independent click counters for two buttons, where the count cannot be changed directly from outside.',
      steps: [
        'Write createCounter() with a private let count',
        'Return an object with increment, decrement and value methods',
        'Create two counters and call methods on each',
        'Try to read count directly',
      ],
      code: `function createCounter(start = 0) {
  let count = start;
  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    value() { return count; },
  };
}

const likes = createCounter();
const stock = createCounter(10);
likes.increment();
likes.increment();
stock.decrement();
console.log("likes:", likes.value());
console.log("stock:", stock.value());
console.log("direct access:", likes.count);`,
      playground: {
        js: `function createCounter(start = 0) {
  let count = start;
  return {
    increment() { count++; return count; },
    decrement() { count--; return count; },
    value() { return count; },
  };
}

const likes = createCounter();
const stock = createCounter(10);
likes.increment();
likes.increment();
stock.decrement();
console.log("likes:", likes.value());
console.log("stock:", stock.value());
console.log("direct access:", likes.count);`,
      },
      result: `likes: 2
stock: 9
direct access: undefined`,
      explanation: 'createCounter has finished running, but the three methods still remember count through a closure. Each call to createCounter creates a new count, so likes and stock are independent. count is not a property of the returned object, so likes.count is undefined: the data is private.',
    },
    {
      title: 'Function factory: discount calculators',
      scenario: 'A shop needs several discount functions (10%, 25%, festival 50%). Create them from one factory.',
      steps: [
        'Write makeDiscount(percent) that returns a function of price',
        'Create three discount functions',
        'Apply each to the same price',
        'Click Run',
      ],
      code: `function makeDiscount(percent) {
  return function (price) {
    return price - (price * percent) / 100;
  };
}

const regular = makeDiscount(10);
const member = makeDiscount(25);
const festival = makeDiscount(50);

console.log(regular(2000));
console.log(member(2000));
console.log(festival(2000));
console.log(makeDiscount(5)(100));`,
      playground: {
        js: `function makeDiscount(percent) {
  return function (price) {
    return price - (price * percent) / 100;
  };
}

const regular = makeDiscount(10);
const member = makeDiscount(25);
const festival = makeDiscount(50);

console.log(regular(2000));
console.log(member(2000));
console.log(festival(2000));
console.log(makeDiscount(5)(100));`,
      },
      result: `1800
1500
1000
95`,
      explanation: 'Each returned function remembers its own percent. makeDiscount(5)(100) calls the factory and immediately calls the returned function with 100, a pattern called currying (Day 39).',
    },
    {
      title: 'once() and memoisation with closures',
      scenario: 'Prevent a payment function from running twice, and cache results of a slow square calculation.',
      steps: [
        'Write once(fn) that remembers whether fn was already called',
        'Write memoSquare that stores results in a cache object',
        'Call both several times and observe the logs',
        'Click Run',
      ],
      code: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
const pay = once((amount) => {
  console.log("Charging", amount);
  return "paid " + amount;
});
console.log(pay(500));
console.log(pay(500));
console.log(pay(999));

function createMemoSquare() {
  const cache = {};
  return function (n) {
    if (n in cache) {
      console.log("from cache:", n);
      return cache[n];
    }
    console.log("computing:", n);
    cache[n] = n * n;
    return cache[n];
  };
}
const square = createMemoSquare();
console.log(square(9));
console.log(square(9));`,
      playground: {
        js: `function once(fn) {
  let called = false;
  let result;
  return function (...args) {
    if (!called) {
      called = true;
      result = fn(...args);
    }
    return result;
  };
}
const pay = once((amount) => {
  console.log("Charging", amount);
  return "paid " + amount;
});
console.log(pay(500));
console.log(pay(500));
console.log(pay(999));

function createMemoSquare() {
  const cache = {};
  return function (n) {
    if (n in cache) {
      console.log("from cache:", n);
      return cache[n];
    }
    console.log("computing:", n);
    cache[n] = n * n;
    return cache[n];
  };
}
const square = createMemoSquare();
console.log(square(9));
console.log(square(9));`,
      },
      result: `Charging 500
paid 500
paid 500
paid 500
computing: 9
81
from cache: 9
81`,
      explanation: 'once keeps called and result in its closure. The first call runs the real function; later calls just return the saved result, so the customer is charged once (even pay(999) returns the first result). The memo function keeps a private cache object; the second square(9) finds 9 in the cache and skips the computation.',
    },
    {
      title: 'Closures capture variables, not values',
      scenario: 'Show that a closure sees later changes, and compare var vs let in a loop that creates functions.',
      steps: [
        'Create a function that reads an outer variable, then change the variable before calling it',
        'Create functions in a var loop and a let loop',
        'Fix the var loop with an IIFE',
        'Call all functions and compare',
      ],
      code: `let message = "Hello";
const show = () => message;
message = "Updated";
console.log(show());

const varFns = [];
for (var i = 0; i < 3; i++) varFns.push(() => i);

const letFns = [];
for (let j = 0; j < 3; j++) letFns.push(() => j);

const iifeFns = [];
for (var k = 0; k < 3; k++) {
  (function (copy) {
    iifeFns.push(() => copy);
  })(k);
}
console.log(varFns.map((f) => f()).join(" "));
console.log(letFns.map((f) => f()).join(" "));
console.log(iifeFns.map((f) => f()).join(" "));`,
      playground: {
        js: `let message = "Hello";
const show = () => message;
message = "Updated";
console.log(show());

const varFns = [];
for (var i = 0; i < 3; i++) varFns.push(() => i);

const letFns = [];
for (let j = 0; j < 3; j++) letFns.push(() => j);

const iifeFns = [];
for (var k = 0; k < 3; k++) {
  (function (copy) {
    iifeFns.push(() => copy);
  })(k);
}
console.log(varFns.map((f) => f()).join(" "));
console.log(letFns.map((f) => f()).join(" "));
console.log(iifeFns.map((f) => f()).join(" "));`,
      },
      result: `Updated
3 3 3
0 1 2
0 1 2`,
      explanation: 'show reads message when it is called, not when it was created, so it sees "Updated". All var functions share one i that ends at 3. let creates a fresh j per iteration. The IIFE creates a new function scope per iteration with its own parameter copy, which is how this was fixed before let existed. (map is covered on Day 15; here it just calls each function.)',
    },
  ],
  interview: [
    { q: 'What is a closure?', a: 'A closure is a function bundled with its lexical environment: it can access variables from the scope where it was defined even after that outer function has returned. Example: a function returned from makeCounter() still reads and updates count.', level: 'Easy' },
    { q: 'Give practical uses of closures.', a: 'Private state (counters, module pattern), function factories (makeMultiplier), once() wrappers, memoisation/caching, event handlers that remember data, debounce/throttle, partial application/currying, and React hooks like useState.', level: 'Medium' },
    { q: 'Does a closure capture the value or the variable?', a: 'The variable (a live reference). If the variable changes after the closure is created, the closure sees the new value when it runs.', level: 'Medium' },
    { q: 'How do closures help with data privacy?', a: 'Variables declared inside the outer function are not accessible from outside; only the returned inner functions can use them. This hides implementation details and prevents direct modification.', level: 'Medium' },
    { q: 'Can closures cause memory problems?', a: 'Yes, if long-lived closures (global handlers, timers, caches) reference large data, that data cannot be garbage-collected. Remove listeners and clear timers/caches when no longer needed.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nfunction outer() {\n  let x = 0;\n  return () => ++x;\n}\nconst a = outer();\nconst b = outer();\nconsole.log(a(), a(), b(), a());', a: '1 2 1 3. a and b each have their own x. a increments its x three times; b increments a separate x once.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(function () { console.log(i); }, 0);\n}', a: '3 3 3 (each on its own line). All callbacks close over the same var i, which is 3 when they run. Fix with let or an IIFE.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nlet count = 1;\nfunction getCount() { return count; }\ncount = 5;\nconsole.log(getCount());', a: '5. The function reads the current value of count when called.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nfunction makeAdder(x) {\n  return function (y) {\n    return x + y;\n  };\n}\nconst add5 = makeAdder(5);\nconsole.log(add5(2), makeAdder(10)(1), add5(add5(1)));', a: '7 11 11. add5 remembers x = 5: 5 + 2 = 7. makeAdder(10)(1) = 11. add5(add5(1)) = add5(6) = 11.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfunction counter() {\n  let n = 0;\n  return { inc: () => n++, get: () => n };\n}\nconst c = counter();\nc.inc();\nc.inc();\nc.n = 100;\nconsole.log(c.get(), c.n);', a: '2 100. c.n = 100 creates a new public property on the object; the private n in the closure is untouched and is 2.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a function createBankAccount(initial) with private balance and methods deposit(amount), withdraw(amount) (refuse if insufficient funds) and getBalance().',
      hint: 'Keep let balance inside the outer function and return an object of methods.',
      solution: `function createBankAccount(initial = 0) {
  let balance = initial;
  return {
    deposit(amount) {
      balance += amount;
      return balance;
    },
    withdraw(amount) {
      if (amount > balance) return "Insufficient funds";
      balance -= amount;
      return balance;
    },
    getBalance() {
      return balance;
    },
  };
}
const acc = createBankAccount(1000);
acc.deposit(500);
console.log(acc.withdraw(2000)); // Insufficient funds
console.log(acc.withdraw(300));  // 1200
console.log(acc.getBalance());   // 1200`,
    },
    {
      task: 'Write makePower(exp) that returns a function raising a number to exp. Create square and cube and test them.',
      hint: 'return n => n ** exp;',
      solution: `function makePower(exp) {
  return (n) => n ** exp;
}
const square = makePower(2);
const cube = makePower(3);
console.log(square(4), cube(2)); // 16 8`,
    },
    {
      task: 'Write createIdGenerator(prefix) that returns a function producing "prefix-1", "prefix-2", ... on each call.',
      hint: 'Keep a private counter.',
      solution: `function createIdGenerator(prefix) {
  let id = 0;
  return () => \`\${prefix}-\${++id}\`;
}
const nextOrder = createIdGenerator("ORD");
console.log(nextOrder(), nextOrder(), nextOrder()); // ORD-1 ORD-2 ORD-3`,
    },
    {
      task: 'Write a function limitCalls(fn, max) that allows fn to run at most max times; later calls return "Limit reached".',
      hint: 'Count calls in the closure.',
      solution: `function limitCalls(fn, max) {
  let calls = 0;
  return (...args) => {
    if (calls >= max) return "Limit reached";
    calls++;
    return fn(...args);
  };
}
const sendOtp = limitCalls((phone) => "OTP sent to " + phone, 2);
console.log(sendOtp("98xxxx"));
console.log(sendOtp("98xxxx"));
console.log(sendOtp("98xxxx")); // Limit reached`,
    },
    {
      task: 'Fix this so it logs 1, 2, 3 (after one second): for (var i = 1; i <= 3; i++) { setTimeout(() => console.log(i), 1000); } Give two fixes.',
      hint: 'let, or an IIFE that receives i.',
      solution: `// Fix 1: let
for (let i = 1; i <= 3; i++) {
  setTimeout(() => console.log(i), 1000);
}

// Fix 2: IIFE
for (var j = 1; j <= 3; j++) {
  (function (n) {
    setTimeout(() => console.log(n), 1000);
  })(j);
}`,
    },
  ],
  quiz: [
    { question: 'A closure is best described as:', options: ['A function with its remembered outer variables', 'A function that closes the browser', 'A loop that ends early', 'An object with no methods'], answer: 0, explanation: 'A closure = function + its lexical environment.' },
    { question: 'function f(){ let n = 0; return () => ++n; } const g = f(); g(); What does g() return the second time?', options: ['1', '0', 'undefined', '2'], answer: 3, explanation: 'n persists between calls: 1, then 2.' },
    { question: 'Two counters created by calling createCounter() twice:', options: ['Share the same count', 'Have independent counts', 'Throw an error', 'Reset each other'], answer: 1, explanation: 'Each call creates a new scope.' },
    { question: 'Which change makes for (var i...) { setTimeout(() => console.log(i)) } print 0,1,2?', options: ['Use const instead of var', 'Use a while loop', 'Use let instead of var', 'Add break'], answer: 2, explanation: 'let creates a new binding each iteration (const would fail on i++).' },
    { question: 'Closures are possible because JavaScript uses:', options: ['Dynamic scope', 'Global scope only', 'Lexical scope', 'Block scope only'], answer: 2, explanation: 'Functions remember the scope where they were defined.' },
  ],
};
