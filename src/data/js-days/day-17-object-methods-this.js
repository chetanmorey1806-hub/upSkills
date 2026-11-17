export default {
  id: 'day-17-object-methods-this',
  title: 'Object Methods and the this Keyword',
  module: 'Module 3: Objects & Data Structures',
  day: 17,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Objects can hold functions (methods) that act on their own data. The `this` keyword lets a method refer to the object it was called on. Today you learn method syntax, how `this` is decided at call time, and why arrow functions behave differently.',
  objectives: [
    'Define methods using the shorthand method syntax',
    'Use `this` inside a method to read and update the object\'s own properties',
    'Explain the rule: `this` is the object to the LEFT of the dot at call time',
    'Recognise how `this` is lost when a method is extracted or used as a callback',
    'Know why arrow functions do not have their own `this` and when that is useful',
  ],
  theory: [
    {
      heading: 'What is a Method?',
      content: "A **method** is simply a property whose value is a function. If an object is a noun (a bank account), methods are the verbs it can do (deposit, withdraw).\n\nES2015 added **method shorthand**: instead of `greet: function () { }` you can write `greet() { }`. Both create a normal function; the shorthand is the modern style.",
      syntax: `const calculator = {
  add: function (a, b) { return a + b; }, // old style
  subtract(a, b) { return a - b; },        // shorthand (preferred)
};
calculator.add(2, 3);      // 5
calculator.subtract(9, 4); // 5`,
      points: [
        'Call a method with obj.method(args)',
        'Forgetting the () gives you the function itself, not its result',
        'Built-in methods you already use: "abc".toUpperCase(), [1,2].push(3), Math.max()',
      ],
    },
    {
      heading: 'The this Keyword',
      content: "Inside a method, `this` refers to **the object the method was called on**. It lets one method work with the object's own data without hard-coding the variable name.\n\nAnalogy: when a person says \"my name\", the word \"my\" depends on who is speaking. `this` is JavaScript's \"my\".\n\n**Golden rule for regular functions:** look at the call site. If it is called as `obj.method()`, then `this` is `obj` (the thing left of the dot). `this` is decided when the function is **called**, not where it is written.",
      syntax: `const account = {
  owner: 'Meera',
  balance: 1000,
  deposit(amount) {
    this.balance += amount; // this === account here
    return this.balance;
  },
  summary() {
    return this.owner + ' has Rs ' + this.balance;
  },
};
account.deposit(500);  // 1500
account.summary();     // 'Meera has Rs 1500'`,
      tip: 'Use `this.balance` rather than `account.balance` inside methods. If the object is renamed or copied, `this` still works.',
    },
    {
      heading: 'Losing this: Extracted Methods and Callbacks',
      content: "Because `this` depends on HOW a function is called, it can get \"lost\":\n\n1. **Extracting a method**: `const f = account.summary; f();` calls the function with nothing left of the dot. In strict mode (modules, classes) `this` is `undefined`; in sloppy scripts it is the global object. Either way `this.owner` is wrong or throws.\n2. **Passing as a callback**: `setTimeout(account.summary, 100)` also calls it without the object.\n\nFixes: wrap it in an arrow function `() => account.summary()`, or use `account.summary.bind(account)`. (`call`, `apply` and `bind` are covered in depth on Day 38.)",
      syntax: `'use strict';
const user = { name: 'Ali', hi() { return 'Hi ' + this.name; } };
const hi = user.hi;
// hi(); -> TypeError: Cannot read properties of undefined
const fixed = user.hi.bind(user);
fixed(); // 'Hi Ali'`,
    },
    {
      heading: 'Arrow Functions and this',
      content: "Arrow functions do **not** have their own `this`. They use the `this` of the surrounding (enclosing) code, called **lexical this**.\n\n- Do NOT use an arrow function as an object method that needs `this`: `{ name: 'A', hi: () => this.name }` will not see the object.\n- DO use arrow functions **inside** a method (e.g. in forEach/map callbacks) because they inherit the method's `this`. This is exactly where regular functions would lose it.",
      syntax: `const team = {
  name: 'Blue',
  members: ['Asha', 'Ravi'],
  list() {
    // arrow callback: this is still team
    return this.members.map(m => m + ' (' + this.name + ')');
  },
  bad: () => typeof this, // arrow method: this is NOT team
};`,
      tip: 'Rule of thumb: methods = regular/shorthand functions; callbacks inside methods = arrow functions.',
    },
    {
      heading: 'this in Other Places (quick overview)',
      content: "- **Top level of a module or strict function call**: `this` is `undefined`.\n- **Top level of a classic browser script**: `this` is `window`.\n- **Event listener with a regular function**: `this` is the element that the listener is attached to (Day 25).\n- **Constructor / class**: `this` is the new object being created (Day 36).\n\nFor today, focus on the method rule: `obj.method()` means `this === obj`.",
    },
    {
      heading: 'Method Chaining by Returning this',
      content: "If each method returns `this`, you can call methods one after another in a single expression: `cart.add('pen').add('book').total()`. This is called **method chaining** and is used by libraries such as jQuery and many builders.",
      syntax: `const counter = {
  value: 0,
  inc() { this.value++; return this; },
  dec() { this.value--; return this; },
};
counter.inc().inc().dec().value; // 1`,
    },
  ],
  examples: [
    {
      title: 'Bank Account with Methods',
      scenario: 'Build a bank account object that can deposit, withdraw (with insufficient balance check) and print a statement.',
      steps: [
        'Create `account` with owner and balance',
        'Add deposit, withdraw and statement methods using `this`',
        'Call them in order',
        'Try to withdraw more than the balance',
        'Run and read the console',
      ],
      code: `const account = {
  owner: 'Meera',
  balance: 1000,
  deposit(amount) {
    this.balance += amount;
  },
  withdraw(amount) {
    if (amount > this.balance) {
      console.log('Insufficient balance');
      return;
    }
    this.balance -= amount;
  },
  statement() {
    console.log(this.owner + ': Rs ' + this.balance);
  },
};

account.deposit(500);
account.withdraw(300);
account.withdraw(5000);
account.statement();`,
      playground: {
        js: `const account = {
  owner: 'Meera',
  balance: 1000,
  deposit(amount) {
    this.balance += amount;
  },
  withdraw(amount) {
    if (amount > this.balance) {
      console.log('Insufficient balance');
      return;
    }
    this.balance -= amount;
  },
  statement() {
    console.log(this.owner + ': Rs ' + this.balance);
  },
};

account.deposit(500);
account.withdraw(300);
account.withdraw(5000);
account.statement();`,
      },
      result: `Insufficient balance
Meera: Rs 1200`,
      explanation: 'Each method is called as account.method(), so `this` is account. 1000 + 500 - 300 = 1200. The 5000 withdrawal fails the check and returns early without changing the balance.',
    },
    {
      title: 'Losing this and Fixing It',
      scenario: 'A method is passed around as a standalone function and breaks. Show why, and fix it with an arrow wrapper and bind.',
      steps: [
        'Create `user` with a greet() method that uses this.name',
        'Store user.greet in a variable and call it inside try/catch (strict mode)',
        'Fix with an arrow wrapper',
        'Fix with bind',
        'Run and compare',
      ],
      code: `'use strict';
const user = {
  name: 'Ali',
  greet() { return 'Hello, ' + this.name; },
};

const loose = user.greet;     // just the function, no object
try {
  loose();
} catch (e) {
  console.log('Error: ' + e.constructor.name);
}

const wrapped = () => user.greet();
const bound = user.greet.bind(user);
console.log(wrapped());
console.log(bound());`,
      playground: {
        js: `'use strict';
const user = {
  name: 'Ali',
  greet() { return 'Hello, ' + this.name; },
};

console.log(user.greet());

const loose = user.greet;
try {
  loose();
} catch (e) {
  console.log('Error: ' + e.constructor.name);
}

const wrapped = () => user.greet();
const bound = user.greet.bind(user);
console.log(wrapped());
console.log(bound());`,
      },
      result: `Hello, Ali
Error: TypeError
Hello, Ali
Hello, Ali`,
      explanation: '`loose()` has nothing to the left of the dot, so in strict mode `this` is undefined and reading `this.name` throws a TypeError. The arrow wrapper calls `user.greet()` properly, and `bind(user)` returns a new function whose `this` is permanently user.',
    },
    {
      title: 'Arrow Function as Method vs Inside Method',
      scenario: 'A team object lists members with the team name. Compare a regular callback, an arrow callback and an arrow method.',
      steps: [
        'Create `team` with name and members',
        'Method withArrow() uses members.map with an arrow callback',
        'Method arrowMethod is defined as an arrow function',
        'Call both and log',
        'Run it',
      ],
      code: `const team = {
  name: 'Blue',
  members: ['Asha', 'Ravi'],
  withArrow() {
    return this.members.map(m => m + '-' + this.name);
  },
  arrowMethod: () => typeof this,
};
console.log(team.withArrow());
console.log(team.arrowMethod());`,
      playground: {
        js: `'use strict';
const team = {
  name: 'Blue',
  members: ['Asha', 'Ravi'],
  withArrow() {
    return this.members.map(m => m + '-' + this.name).join(', ');
  },
  withRegular() {
    return this.members.map(function (m) {
      return m + '-' + (this ? this.name : 'no this');
    }).join(', ');
  },
  arrowMethod: () => this === team,
};
console.log(team.withArrow());
console.log(team.withRegular());
console.log(team.arrowMethod());`,
      },
      result: `Asha-Blue, Ravi-Blue
Asha-no this, Ravi-no this
false`,
      explanation: 'The arrow callback inherits `this` from withArrow(), which is team. The regular function callback is called by map without an object, so its `this` is undefined in strict mode. The arrow method takes `this` from the outer (top-level) scope, not team, so the comparison is false.',
    },
    {
      title: 'Method Chaining Shopping Cart',
      scenario: 'Create a cart where add() returns `this` so calls can be chained, and total() computes the bill.',
      steps: [
        'Create `cart` with an items array',
        'add(name, price, qty) pushes an item and returns this',
        'total() uses reduce on this.items',
        'Chain add calls then call total',
        'Run it',
      ],
      code: `const cart = {
  items: [],
  add(name, price, qty = 1) {
    this.items.push({ name, price, qty });
    return this; // enables chaining
  },
  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
};
const bill = cart.add('Pen', 10, 3).add('Bag', 500).total();
console.log('Items: ' + cart.items.length);
console.log('Total: Rs ' + bill);`,
      playground: {
        js: `const cart = {
  items: [],
  add(name, price, qty = 1) {
    this.items.push({ name, price, qty });
    return this;
  },
  total() {
    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  },
};
const bill = cart.add('Pen', 10, 3).add('Bag', 500).total();
console.log('Items: ' + cart.items.length);
console.log('Total: Rs ' + bill);`,
      },
      result: `Items: 2
Total: Rs 530`,
      explanation: 'cart.add(...) returns cart itself, so `.add(...)` can be called again on the result. 3 x 10 + 1 x 500 = 530. The reduce arrow callback uses `i`, not `this`, so it is safe.',
    },
  ],
  interview: [
    { q: 'What is a method in JavaScript?', a: 'A method is a function stored as a property of an object. It is called with obj.method() and usually uses `this` to work with the object\'s data.', level: 'Easy' },
    { q: 'How is the value of `this` determined in a regular function?', a: 'By how the function is called (call site), not where it is defined. obj.fn() sets this = obj. A plain call fn() sets this = undefined in strict mode (global object in sloppy mode). new, call/apply/bind and event listeners have their own rules.', level: 'Medium' },
    { q: 'What is the output?\nconst o = { x: 10, getX() { return this.x; } };\nconst g = o.getX;\nconsole.log(o.getX());\nconsole.log(g());   // non-strict script', a: '10 then undefined. o.getX() has this = o. g() is a plain call; in a non-strict script this = globalThis, which has no x, so undefined. (In strict mode it would throw a TypeError.)', level: 'Medium' },
    { q: 'Why should you not use an arrow function as an object method that uses this?', a: 'Arrow functions do not have their own `this`; they capture `this` from the enclosing scope where the object literal is written (often module/global). So this.prop will not refer to the object.', level: 'Medium' },
    { q: 'What is the output (code inside an ES module)?\nconst obj = {\n  name: "JS",\n  regular() { return this.name; },\n  arrow: () => this?.name,\n};\nconsole.log(obj.regular(), obj.arrow());', a: 'JS undefined. regular() is called on obj so this = obj. The arrow uses the outer this, which is undefined at the top level of a module, so this?.name is undefined. (In a classic browser script the outer this is window, and window.name is an empty string, so you would see "JS" and an empty string.)', level: 'Hard' },
    { q: 'Why are arrow functions useful inside methods?', a: 'Callbacks like map/forEach/setTimeout call your function without an object, so a regular callback loses `this`. An arrow callback inherits the method\'s `this`, so this.prop still works.', level: 'Medium' },
    { q: 'What is method chaining and how is it implemented?', a: 'Calling multiple methods in one expression: obj.a().b().c(). Each method returns `this` (the same object) so the next method can be called on it.', level: 'Easy' },
    { q: 'What is the output?\nconst c = { n: 0, inc() { this.n++; return this; } };\nconsole.log(c.inc().inc().n);', a: '2. Each inc() increments n and returns c, so the chain calls inc twice and then reads n.', level: 'Easy' },
    { q: 'What is the output?\nconst person = { name: "Sam", hi() { setTimeout(function () { console.log(this === person); }, 0); } };\nperson.hi();', a: 'false. The regular function is called by setTimeout, not as person.method(), so this is not person (it is globalThis in browsers / a Timeout object in Node). Use an arrow function to fix.', level: 'Hard' },
    { q: 'How can you fix a method that loses `this` when passed as a callback?', a: 'Wrap it: () => obj.method(), or bind it: obj.method.bind(obj). In classes you can also use arrow-function class fields.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a `rectangle` object with width, height and methods area(), perimeter() and describe() that returns "Rectangle 4x5, area 20".',
      hint: 'Use this.width and this.height in each method.',
      solution: `const rectangle = {
  width: 4,
  height: 5,
  area() { return this.width * this.height; },
  perimeter() { return 2 * (this.width + this.height); },
  describe() {
    return 'Rectangle ' + this.width + 'x' + this.height + ', area ' + this.area();
  },
};
console.log(rectangle.describe()); // Rectangle 4x5, area 20
console.log(rectangle.perimeter()); // 18`,
    },
    {
      task: 'Create a `counter` object with value, increment(), decrement(), reset() and make all of them chainable.',
      hint: 'Return this at the end of each method.',
      solution: `const counter = {
  value: 0,
  increment() { this.value++; return this; },
  decrement() { this.value--; return this; },
  reset() { this.value = 0; return this; },
};
console.log(counter.increment().increment().decrement().value); // 1
console.log(counter.reset().value); // 0`,
    },
    {
      task: 'Create a `playlist` object with name and songs array, and a method print() that logs "<playlist name>: <song>" for each song using forEach.',
      hint: 'Use an arrow function inside forEach so this still refers to playlist.',
      solution: `const playlist = {
  name: 'Chill',
  songs: ['Song A', 'Song B'],
  print() {
    this.songs.forEach(song => console.log(this.name + ': ' + song));
  },
};
playlist.print();
// Chill: Song A
// Chill: Song B`,
    },
    {
      task: 'Fix the bug: const timer = { label: "Tea", start() { setTimeout(function () { console.log(this.label + " ready"); }, 100); } }; timer.start(); prints "undefined ready".',
      hint: 'Change the callback into an arrow function.',
      solution: `const timer = {
  label: 'Tea',
  start() {
    setTimeout(() => {
      console.log(this.label + ' ready');
    }, 100);
  },
};
timer.start(); // Tea ready`,
    },
    {
      task: 'Create a `student` object with name, marks array and methods average() and grade() (A for >= 80, B for >= 60, else C).',
      hint: 'grade() can call this.average().',
      solution: `const student = {
  name: 'Kiran',
  marks: [70, 85, 90],
  average() {
    return this.marks.reduce((s, m) => s + m, 0) / this.marks.length;
  },
  grade() {
    const avg = this.average();
    if (avg >= 80) return 'A';
    if (avg >= 60) return 'B';
    return 'C';
  },
};
console.log(student.average()); // 81.66666666666667
console.log(student.grade());   // A`,
    },
  ],
  quiz: [
    { question: 'In `shop.open()`, what is `this` inside open (a regular method)?', options: ['window', 'undefined', 'shop', 'open'], answer: 2, explanation: 'For a regular function called as obj.method(), this is the object left of the dot.' },
    { question: 'Which is the modern method shorthand?', options: ['greet: => {}', 'greet() {}', 'function greet: {}', 'method greet {}'], answer: 1, explanation: 'Shorthand method syntax is name() { ... } inside the object literal.' },
    { question: 'Why does an arrow function as a method fail to see the object via this?', options: ['Arrow functions cannot be stored in objects', 'Arrow functions have no own this; they use the enclosing scope\'s this', 'Arrow functions always set this to the object', 'Arrow functions are always strict'], answer: 1, explanation: 'Arrow functions use lexical this from where they are written.' },
    { question: 'What makes method chaining possible?', options: ['Each method returns this', 'Each method returns undefined', 'Using arrow functions', 'Using const'], answer: 0, explanation: 'Returning the object lets the next method be called on it.' },
    { question: "In strict mode, `const f = obj.show; f();` where show uses this.x. What happens?", options: ['Prints obj.x', 'Prints window.x', 'Returns null', 'TypeError because this is undefined'], answer: 3, explanation: 'Plain call in strict mode gives this = undefined, so this.x throws.' },
  ],
};
