export default {
  lesson: 'day-17-object-methods-this',
  minutes: 30,
  intro: 'Write object methods that use this, see how this gets lost, and use arrow functions and method chaining correctly.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In a normal method call `cart.addItem()`, what is `this` inside `addItem`?',
      options: ['The global object', 'The function addItem itself', 'The object to the left of the dot: cart', 'undefined always'],
      answer: 2,
      explain: 'For regular functions, `this` is decided **at call time**: it is the object to the **left of the dot**. That is why the same method can work for many objects.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Arrow function as a method vs a regular method. What is printed?',
      code: `const user = {
  owner: "Asha",
  regular() {
    return this.owner;
  },
  arrow: () => this.owner,
};
console.log(user.regular());
console.log(user.arrow());`,
      expected: 'Asha\nundefined',
      explain: 'Arrow functions have **no own `this`**; they use `this` from the surrounding code. Here the surrounding code is the top level of the file, not the object, so `this.owner` is undefined. Arrows make bad object methods. Use the shorthand method syntax instead.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Complete the `account` object:\n- `deposit(amount)` adds to `this.balance` and returns the new balance\n- `withdraw(amount)` subtracts only if there is enough money and returns the new balance; otherwise returns `"Insufficient balance"`\n- `summary()` returns `"Asha: ₹<balance>"` using `this.owner` and `this.balance`',
      example: { title: 'a method using this', code: 'const counter = {\n  count: 0,\n  increment() {\n    this.count++;\n    return this.count;\n  },\n};' },
      starter: 'const account = {\n  owner: "Asha",\n  balance: 1000,\n  // TODO: deposit, withdraw, summary\n};',
      solution: 'const account = {\n  owner: "Asha",\n  balance: 1000,\n  deposit(amount) {\n    this.balance += amount;\n    return this.balance;\n  },\n  withdraw(amount) {\n    if (amount > this.balance) return "Insufficient balance";\n    this.balance -= amount;\n    return this.balance;\n  },\n  summary() {\n    return `${this.owner}: ₹${this.balance}`;\n  },\n};',
      tests: [
        { call: 'account.deposit(500)', expect: 1500 },
        { call: 'account.withdraw(300)', expect: 700 },
        { call: 'account.withdraw(5000)', expect: 'Insufficient balance' },
        { call: '(account.deposit(250), account.summary())', expect: 'Asha: ₹1250' },
      ],
      explain: 'Inside a method, `this.balance` refers to the property of the object the method was called on. Writing just `balance` would look for a variable named balance and throw a ReferenceError.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Losing `this`. What is printed? (the code runs in strict mode like modules and classes do)',
      code: `"use strict";
const shop = {
  name: "Sharma Stores",
  getName() {
    return this === undefined ? "lost this" : this.name;
  },
};
const fn = shop.getName;
console.log(shop.getName());
console.log(fn());`,
      expected: 'Sharma Stores\nlost this',
      explain: 'When the method is copied into `fn` and called without an object on the left (`fn()`), there is no "left of the dot", so `this` is `undefined` in strict mode. The same thing happens when you pass `shop.getName` as a callback.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Method chaining. Complete the `cart` object so that each of `add(name, price)` and `applyDiscount(percent)` **returns `this`**, and `total()` returns the sum of prices.\n\n`cart.add("Pen", 100).add("Book", 300).applyDiscount(10).total()` → `360`',
      example: { title: 'returning this', code: 'const builder = {\n  text: "",\n  add(word) {\n    this.text += word;\n    return this;\n  },\n};\nbuilder.add("Hi").add("!");' },
      starter: 'const cart = {\n  items: [],\n  discount: 0,\n  add(name, price) {\n    // TODO\n  },\n  applyDiscount(percent) {\n    // TODO\n  },\n  total() {\n    // TODO\n  },\n};',
      solution: 'const cart = {\n  items: [],\n  discount: 0,\n  add(name, price) {\n    this.items.push({ name, price });\n    return this;\n  },\n  applyDiscount(percent) {\n    this.discount = percent;\n    return this;\n  },\n  total() {\n    const sum = this.items.reduce((s, i) => s + i.price, 0);\n    return sum - (sum * this.discount) / 100;\n  },\n};',
      tests: [
        { call: 'cart.add("Pen", 100).add("Book", 300).applyDiscount(10).total()', expect: 360 },
        { call: 'cart.add("Bag", 50).total()', expect: 50 },
      ],
      explain: 'Returning `this` hands back the same object, so the next method can be called on it directly. If a method forgets `return this`, the chain breaks with "Cannot read properties of undefined".',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Fix the lost `this` in a callback. `team.listMembers()` should return strings like `"Asha (Team Alpha)"`, but the inner callback is a regular function so `this.name` breaks. Fix it with an **arrow function** inside the method.',
      example: { title: 'arrow keeps the outer this', code: 'const timer = {\n  label: "T1",\n  run() {\n    return [1, 2].map((n) => this.label + n);\n  },\n};' },
      starter: 'const team = {\n  name: "Team Alpha",\n  members: ["Asha", "Ravi"],\n  listMembers() {\n    return this.members.map(function (m) {\n      return `${m} (${this.name})`;\n    });\n  },\n};',
      solution: 'const team = {\n  name: "Team Alpha",\n  members: ["Asha", "Ravi"],\n  listMembers() {\n    return this.members.map((m) => `${m} (${this.name})`);\n  },\n};',
      tests: [{ call: 'team.listMembers()', expect: ['Asha (Team Alpha)', 'Ravi (Team Alpha)'] }],
      explain: 'A regular `function` callback gets its own `this` (undefined here). An arrow function has no own `this`, so it uses the `this` of `listMembers`, which is `team`. Arrows are great **inside** methods, bad **as** methods.',
    },
  ],
};
