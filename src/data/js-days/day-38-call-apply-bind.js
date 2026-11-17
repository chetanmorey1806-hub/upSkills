const ex1 = `'use strict';
// The 4 binding rules of "this" (+ arrow functions)

// 1. Default binding: plain function call -> undefined in strict mode
function whoAmI() { return this; }
console.log('1. default:', whoAmI());

// 2. Implicit binding: obj.method() -> this = obj (the object before the dot)
const user = {
  name: 'Asha',
  hello() { return 'Hi from ' + this.name; },
};
console.log('2. implicit:', user.hello());

// Losing "this": the method is detached from its object
const detached = user.hello;
try {
  detached();
} catch (e) {
  console.log('   lost this ->', e.constructor.name);
}

// 3. Explicit binding: call / apply / bind
console.log('3. explicit:', user.hello.call({ name: 'Ravi' }));

// 4. new binding: this = the brand new object
function Car(brand) { this.brand = brand; }
console.log('4. new:', new Car('Tata').brand);

// Arrow functions have NO own this: they use this from the surrounding scope
const team = {
  name: 'Blue',
  members: ['A', 'B'],
  list() {
    return this.members.map((m) => m + ' of ' + this.name);  // arrow keeps outer this
  },
};
console.log('arrow:', team.list().join(', '));`;

const ex2 = `// call and apply: invoke a function NOW with a chosen "this"
function introduce(greeting, punctuation) {
  return greeting + ', I am ' + this.name + ' from ' + this.city + punctuation;
}

const asha = { name: 'Asha', city: 'Pune' };
const ravi = { name: 'Ravi', city: 'Delhi' };

// call: arguments one by one   (C for Comma)
console.log(introduce.call(asha, 'Hello', '!'));

// apply: arguments as an array  (A for Array)
console.log(introduce.apply(ravi, ['Namaste', '.']));

// Method borrowing: use Array methods on an array-like object
const arrayLike = { 0: 'a', 1: 'b', 2: 'c', length: 3 };
const joined = Array.prototype.join.call(arrayLike, '-');
const upper = Array.prototype.map.call(arrayLike, (s) => s.toUpperCase());
console.log(joined, upper);

// apply with Math.max (classic) vs modern spread
const scores = [45, 99, 72];
console.log(Math.max.apply(null, scores), Math.max(...scores));`;

const ex3 = `// bind: returns a NEW function with "this" (and optionally args) fixed forever
const counter = {
  count: 0,
  increment() {
    this.count++;
    return this.count;
  },
};

const inc = counter.increment;          // detached -> would lose this
const boundInc = counter.increment.bind(counter);
boundInc();
boundInc();
console.log('count after boundInc x2:', counter.count);

// bind for callbacks: setTimeout calls the function without an object
setTimeout(counter.increment.bind(counter), 10);
setTimeout(() => console.log('count after timer:', counter.count), 20);

// Partial application: pre-fill arguments
function multiply(a, b) { return a * b; }
const double = multiply.bind(null, 2);
const triple = multiply.bind(null, 3);
console.log('double(5) =', double(5), '| triple(5) =', triple(5));

// A bound function cannot be re-bound
function show() { return this.label; }
const first = show.bind({ label: 'first' });
const second = first.bind({ label: 'second' });
console.log('re-bind result:', second());`;

const ex4html = `<button id="btn">Clicked 0 times</button>
<button id="arrowBtn">Arrow handler</button>
<p id="log"></p>`;

const ex4css = `body { font-family: system-ui, sans-serif; }
button { padding: 8px 14px; margin: 4px; font-size: 15px; }`;

const ex4js = `const log = document.querySelector('#log');

// In a regular function event handler, this = the element (event.currentTarget)
document.querySelector('#arrowBtn').addEventListener('click', function () {
  log.textContent = 'regular fn: this is <' + this.tagName.toLowerCase() + '> #' + this.id;
});

// Class instance as a handler: methods must be bound (or use arrow fields)
class ClickCounter {
  constructor(button) {
    this.count = 0;
    this.button = button;
    // WITHOUT bind, "this" inside handleClick would be the button, not the instance
    this.handleClick = this.handleClick.bind(this);
    button.addEventListener('click', this.handleClick);
  }
  handleClick() {
    this.count++;
    this.button.textContent = 'Clicked ' + this.count + ' times';
  }
}
new ClickCounter(document.querySelector('#btn'));`;

const ex5 = `// Implementing call, apply and bind yourself (common interview task)
Function.prototype.myCall = function (context, ...args) {
  context = context ?? globalThis;
  const key = Symbol('fn');          // unique key so we don't overwrite anything
  context[key] = this;               // "this" is the function being called
  const result = context[key](...args);  // implicit binding does the trick
  delete context[key];
  return result;
};

Function.prototype.myApply = function (context, args = []) {
  return this.myCall(context, ...args);
};

Function.prototype.myBind = function (context, ...preset) {
  const fn = this;
  return function (...later) {
    return fn.myCall(context, ...preset, ...later);
  };
};

function describe(age, city) {
  return this.name + ' (' + age + ') from ' + city;
}
const person = { name: 'Meera' };

console.log(describe.myCall(person, 28, 'Mumbai'));
console.log(describe.myApply(person, [28, 'Chennai']));
const bound = describe.myBind(person, 28);
console.log(bound('Kolkata'));
console.log('person untouched:', Object.keys(person));`;

export default {
  id: 'day-38-call-apply-bind',
  title: 'call, apply, bind and this in Depth',
  module: 'Module 6: Advanced JavaScript',
  day: 38,
  level: 'Advanced',
  duration: '2 hours',
  summary:
    'The value of this depends on HOW a function is called, not where it is written. You will master the binding rules, fix "lost this" bugs, and control this explicitly with call, apply and bind.',
  objectives: [
    'Apply the four this binding rules: default, implicit, explicit, new',
    'Explain how arrow functions treat this differently',
    'Use call and apply to invoke functions with a chosen this and borrow methods',
    'Use bind to fix this for callbacks and to pre-fill arguments (partial application)',
    'Implement simple versions of call, apply and bind',
  ],
  theory: [
    {
      heading: 'this is Decided at Call Time',
      content:
        '`this` is a special keyword that refers to the **object that is executing the current function**. Unlike normal variables, its value is **not fixed when the function is written** – it is decided **each time the function is called**, based on **how** it is called.\n\nAnalogy: the word "me" in a sentence. "Give it to me" means a different person depending on who says it. `this` is the function\'s "me".\n\nTo find `this`, look at the **call site** (the line where the function is called), not the definition.',
    },
    {
      heading: 'The Four Binding Rules (in priority order)',
      content:
        '1. **new binding** – `new Fn()` → `this` is the newly created object.\n2. **Explicit binding** – `fn.call(obj)`, `fn.apply(obj)`, `fn.bind(obj)` → `this` is `obj`.\n3. **Implicit binding** – `obj.fn()` → `this` is the object **before the dot**.\n4. **Default binding** – plain `fn()` → `this` is `undefined` in strict mode (modules, classes), or the global object (`window`) in sloppy mode.\n\nIf several rules could apply, the higher one wins (new > bind > implicit > default).',
      syntax: `function show() { return this; }
const obj = { show };
new show();           // new object
show.call(obj);       // obj
obj.show();           // obj
show();               // undefined (strict) / window (sloppy)`,
    },
    {
      heading: 'Losing this (the most common bug)',
      content:
        'Implicit binding only works if you call the method **through the object**. The moment you take the function out of the object, the link is lost:\n\n- `const fn = user.hello; fn();` → default binding\n- `setTimeout(user.hello, 1000)` → the timer calls it without the object\n- `button.addEventListener("click", obj.method)` → `this` becomes the button\n- `arr.map(obj.method)` → called as a plain function\n\nFixes: `bind`, wrap in an arrow `() => user.hello()`, or use arrow-function class fields.',
      tip: 'In event listeners with a regular function, this is the element the listener is attached to (event.currentTarget). Arrow-function listeners do not get that.',
    },
    {
      heading: 'Arrow Functions and this',
      content:
        'Arrow functions **do not have their own `this`**. They use the `this` of the surrounding (lexical) scope at the time they are created, and call/apply/bind **cannot change** it.\n\n- Great for callbacks inside methods (`this.items.map(i => this.format(i))`)\n- Bad as object methods: `{ name: "A", hi: () => this.name }` → `this` is not the object\n- Cannot be used with `new`',
      tip: 'Rule of thumb: use regular functions (method shorthand) for object/class methods, arrows for callbacks inside them.',
    },
    {
      heading: 'call, apply and bind',
      content:
        'All three are methods available on every function (from `Function.prototype`):\n\n- `fn.call(thisArg, a, b)` – calls fn **immediately**; arguments listed one by one (**C**all = **C**omma)\n- `fn.apply(thisArg, [a, b])` – calls fn **immediately**; arguments as an **array** (**A**pply = **A**rray)\n- `fn.bind(thisArg, a)` – does **not** call; **returns a new function** with this (and any given args) permanently fixed\n\nUses:\n- **Method borrowing**: `Array.prototype.slice.call(arguments)` – use array methods on array-like objects\n- **Partial application**: `const double = multiply.bind(null, 2)`\n- **Fixing callbacks**: `setTimeout(obj.method.bind(obj), 100)`',
      syntax: `fn.call(obj, 1, 2);
fn.apply(obj, [1, 2]);
const bound = fn.bind(obj, 1);
bound(2);`,
      tip: 'A bound function cannot be re-bound; the first bind wins. But new on a bound function still creates a new object (new beats bind).',
    },
    {
      heading: 'this in Classes and Event Handlers',
      content:
        'Class bodies are strict, so a detached method gets `this === undefined` and crashes with "Cannot read properties of undefined".\n\nTwo common fixes in classes (you will see both in React class components and vanilla JS widgets):\n1. Bind in the constructor: `this.handleClick = this.handleClick.bind(this);`\n2. Arrow-function class field: `handleClick = () => { this.count++; };`',
      tip: 'Coming next (Day 39): functions that take or return other functions – higher-order functions, currying and pure functions.',
    },
  ],
  examples: [
    {
      title: 'The four binding rules and arrow functions',
      scenario: 'Call functions in different ways and see what this becomes each time.',
      steps: [
        'Turn on strict mode with "use strict"',
        'Call a function plainly, as a method, with call and with new',
        'Detach a method and call it',
        'Use an arrow callback inside a method, click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        '1. default: undefined\n2. implicit: Hi from Asha\n   lost this -> TypeError\n3. explicit: Hi from Ravi\n4. new: Tata\narrow: A of Blue, B of Blue',
      explanation:
        'Plain calls get undefined in strict mode, so the detached hello() crashes reading this.name. call forces this to the given object. new creates a fresh object. The arrow inside map borrows this from list(), which is team.',
    },
    {
      title: 'call and apply with method borrowing',
      scenario: 'Reuse one introduce function for many people and borrow array methods.',
      steps: [
        'Write introduce(greeting, punctuation) that uses this.name and this.city',
        'Call it with call (comma args) and apply (array args)',
        'Borrow join and map for an array-like object',
        'Use Math.max.apply and compare with spread, click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        "Hello, I am Asha from Pune!\nNamaste, I am Ravi from Delhi.\na-b-c [ 'A', 'B', 'C' ]\n99 99",
      explanation:
        'call and apply differ only in how arguments are passed. Array methods work on anything with indexes and a length, so we can borrow them. Spread (...) has mostly replaced apply for passing arrays as arguments.',
    },
    {
      title: 'bind for callbacks and partial application',
      scenario: 'Keep a counter working when its method is passed around, and create specialised functions.',
      steps: [
        'Bind counter.increment to counter and call it twice',
        'Pass a bound method to setTimeout',
        'Create double and triple with bind(null, n)',
        'Try re-binding a bound function, click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        'count after boundInc x2: 2\ndouble(5) = 10 | triple(5) = 15\nre-bind result: first\ncount after timer: 3',
      explanation:
        'bind returns a new function whose this is permanently counter, so it works even when called by setTimeout. Extra bind arguments are pre-filled. The second bind is ignored – the first one wins. The timer logs last because timers run after synchronous code.',
    },
    {
      title: 'this in event handlers and classes',
      scenario: 'A click-counter class whose method is used as an event listener.',
      steps: [
        'Attach a regular function listener and log this.tagName',
        'Create class ClickCounter and bind handleClick in the constructor',
        'Click both buttons',
        'Try removing the bind line and click again to see the bug',
      ],
      code: ex4js,
      playground: { html: ex4html, css: ex4css, js: ex4js },
      result:
        'Clicking "Arrow handler" shows "regular fn: this is <button> #arrowBtn". Clicking the first button updates its text to "Clicked 1 times", "Clicked 2 times"... Without bind it fails because this.count would be on the button and this.button undefined.',
      explanation:
        'The browser calls listeners with this = the element. For class methods we want this = the instance, so we bind it once in the constructor and keep the bound reference (also needed for removeEventListener).',
    },
    {
      title: 'Build your own call, apply and bind',
      scenario: 'A classic interview question: polyfill call, apply and bind.',
      steps: [
        'Add myCall to Function.prototype: temporarily attach the function to context with a Symbol key',
        'Implement myApply using myCall',
        'Implement myBind returning a closure that combines preset and later args',
        'Test all three, click Run',
      ],
      code: ex5,
      playground: { js: ex5 },
      result:
        'Meera (28) from Mumbai\nMeera (28) from Chennai\nMeera (28) from Kolkata\nperson untouched: [ \'name\' ]',
      explanation:
        'myCall uses implicit binding: calling context[key]() makes this = context. A Symbol key avoids clashing with real properties, and we delete it afterwards. myBind is a closure remembering fn, context and preset args.',
    },
  ],
  interview: [
    {
      q: 'How is the value of this determined?',
      a: 'By how the function is called: new → new object; call/apply/bind → given object; obj.fn() → obj; plain call → undefined (strict) or global object (sloppy). Arrow functions use the this of their enclosing scope.',
      level: 'Medium',
    },
    {
      q: 'Difference between call, apply and bind?',
      a: 'call and apply invoke the function immediately with a given this; call takes args individually, apply takes an array. bind returns a new function with this (and optionally some args) fixed, to be called later.',
      level: 'Easy',
    },
    {
      q: 'Can you change this of an arrow function with call or bind?',
      a: 'No. Arrow functions have lexical this; call/apply/bind ignore the thisArg (they can still pass arguments).',
      level: 'Medium',
    },
    {
      q: 'Output?\nconst obj = { name: "A", getName() { return this.name; } };\nconst f = obj.getName;\nconsole.log(f());',
      a: 'In strict mode it throws TypeError (this is undefined). In sloppy browser scripts it logs window.name (usually an empty string). The method lost its object.',
      level: 'Medium',
    },
    {
      q: 'Output?\nconst obj = { name: "A", greet: () => this.name };\nconsole.log(obj.greet());',
      a: 'Not "A". The arrow function takes this from the outer scope (module → undefined → TypeError; sloppy browser script → window.name, usually ""). Never use arrows as object methods that need this.',
      level: 'Medium',
    },
    {
      q: 'What is method borrowing?',
      a: 'Using a method from one object on another via call/apply, e.g. Array.prototype.slice.call(arguments) or Array.prototype.join.call(arrayLike, "-").',
      level: 'Easy',
    },
    {
      q: 'What is partial application with bind?',
      a: 'Pre-filling some arguments: const add5 = add.bind(null, 5); add5(10) → 15. The bound function receives the preset args first, then the new ones.',
      level: 'Medium',
    },
    {
      q: 'What is this inside a DOM event listener?',
      a: 'For a regular function listener, this is the element the listener is attached to (event.currentTarget). For an arrow function it is the outer this.',
      level: 'Easy',
    },
    {
      q: 'Can a bound function be re-bound?',
      a: 'No, the first bind wins: fn.bind(a).bind(b)() runs with this = a. However, calling a bound function with new ignores the bound this and creates a new object.',
      level: 'Hard',
    },
    {
      q: 'Implement Function.prototype.myBind.',
      a: 'Function.prototype.myBind = function (ctx, ...preset) {\n  const fn = this;\n  return function (...later) { return fn.apply(ctx, [...preset, ...later]); };\n};',
      level: 'Hard',
    },
    {
      q: 'How do you fix "this is undefined" in a class method used as a callback?',
      a: 'Bind it in the constructor (this.method = this.method.bind(this)), use an arrow-function class field (method = () => {...}), or wrap the call in an arrow at the call site (() => this.method()).',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a function fullName() that returns this.first + " " + this.last. Call it for two different objects using call.',
      hint: 'fullName.call(obj)',
      solution: `function fullName() { return this.first + ' ' + this.last; }
const a = { first: 'Asha', last: 'Patil' };
const b = { first: 'Ravi', last: 'Kumar' };
console.log(fullName.call(a)); // Asha Patil
console.log(fullName.call(b)); // Ravi Kumar`,
    },
    {
      task: 'Fix this bug so it prints "Tick 1", "Tick 2", "Tick 3": const clock = { n: 0, tick() { this.n++; console.log("Tick " + this.n); } }; setInterval(clock.tick, 500);',
      hint: 'bind or an arrow wrapper; stop after 3 with clearInterval.',
      solution: `const clock = {
  n: 0,
  tick() {
    this.n++;
    console.log('Tick ' + this.n);
    if (this.n === 3) clearInterval(this.id);
  },
};
clock.id = setInterval(clock.tick.bind(clock), 500);`,
    },
    {
      task: 'Use bind to create a function logError from a generic log(level, message) function so that logError("Disk full") prints "[ERROR] Disk full".',
      hint: 'log.bind(null, "ERROR")',
      solution: `function log(level, message) {
  console.log('[' + level + '] ' + message);
}
const logError = log.bind(null, 'ERROR');
const logInfo = log.bind(null, 'INFO');
logError('Disk full');  // [ERROR] Disk full
logInfo('Saved');       // [INFO] Saved`,
    },
    {
      task: 'Find the minimum and maximum of an array of numbers using Math.min/Math.max with apply, and again with spread.',
      hint: 'Math.max.apply(null, arr)',
      solution: `const nums = [12, 5, 88, 41];
console.log(Math.min.apply(null, nums), Math.max.apply(null, nums)); // 5 88
console.log(Math.min(...nums), Math.max(...nums));                   // 5 88`,
    },
    {
      task: 'Write a class Timer with a start() method that uses setInterval and an arrow function so this.seconds updates correctly; stop it after 3 seconds.',
      hint: 'Arrow functions inside methods keep the instance as this.',
      solution: `class Timer {
  seconds = 0;
  start() {
    this.id = setInterval(() => {
      this.seconds++;
      console.log('Seconds:', this.seconds);
      if (this.seconds === 3) clearInterval(this.id);
    }, 1000);
  }
}
new Timer().start();`,
    },
  ],
  quiz: [
    {
      question: 'What is this inside obj.method() (regular function)?',
      options: ['window', 'obj', 'undefined', 'The function itself'],
      answer: 1,
      explanation: 'Implicit binding: the object before the dot.',
    },
    {
      question: 'Which method takes arguments as an array?',
      options: ['call', 'bind', 'apply', 'map'],
      answer: 2,
      explanation: 'apply(thisArg, [args]).',
    },
    {
      question: 'What does bind return?',
      options: ['A new function', 'The result of the function', 'undefined', 'The this object'],
      answer: 0,
      explanation: 'bind does not call the function; it returns a bound copy.',
    },
    {
      question: 'In strict mode, what is this in a plain function call fn()?',
      options: ['window', 'globalThis', 'The caller', 'undefined'],
      answer: 3,
      explanation: 'Default binding gives undefined in strict mode.',
    },
    {
      question: 'Which has the highest priority when determining this?',
      options: ['Implicit binding', 'new binding', 'Default binding', 'Arrow function call'],
      answer: 1,
      explanation: 'new > explicit (bind/call/apply) > implicit > default.',
    },
  ],
};
