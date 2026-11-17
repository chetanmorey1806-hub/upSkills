export default {
  id: 'day-11-parameters-default-rest-spread',
  title: 'Parameters: Default, Rest, Spread, the arguments Object',
  module: 'Module 2: Functions & Arrays',
  day: 11,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Make functions flexible. Learn default parameter values for missing arguments, rest parameters to accept any number of arguments, the spread operator to expand arrays into arguments or copy/merge arrays, and the older arguments object you will meet in legacy code.',
  objectives: [
    'Give parameters default values and know when defaults apply (undefined only)',
    'Collect any number of arguments into an array with rest parameters',
    'Use spread (...) to pass arrays as arguments and to copy or merge arrays',
    'Tell rest and spread apart by where the ... appears',
    'Explain the arguments object and why rest parameters replace it',
  ],
  theory: [
    {
      heading: 'Default parameters',
      content: 'If a caller does not pass an argument, that parameter is `undefined`. **Default parameters** let you provide a fallback value right in the function signature:\n\n`function greet(name = "Guest") { ... }`\n\nKey rules:\n- The default is used only when the argument is **undefined** (missing or explicitly `undefined`). Passing `null`, `0` or `""` does **not** trigger the default.\n- Defaults can use **earlier parameters**: `function box(w, h = w) {}`.\n- Defaults can be **expressions or function calls**, evaluated at call time.\n\nBefore ES2015 people wrote `name = name || "Guest";`, which wrongly replaces 0 and "".',
      syntax: `function greet(name = "Guest", greeting = "Hello") {
  return \`\${greeting}, \${name}!\`;
}
greet();                  // "Hello, Guest!"
greet("Asha");            // "Hello, Asha!"
greet(undefined, "Hi");   // "Hi, Guest!"
greet(null);              // "Hello, null!"`,
      tip: 'Put parameters with defaults at the end. If a default comes first, callers must pass undefined to skip it.',
    },
    {
      heading: 'Rest parameters (...args)',
      content: 'Sometimes you do not know how many arguments will be passed: `sum(1, 2)`, `sum(1, 2, 3, 4)`. A **rest parameter** gathers "the rest" of the arguments into a **real array**:\n\n`function sum(...numbers) { }`\n\nRules:\n- Only **one** rest parameter is allowed and it must be the **last** parameter: `function log(level, ...messages)`.\n- It is always an array (empty if nothing was passed), so you can use `length`, loops and array methods.\n\nAnalogy: rest is a **bag** that collects all the remaining items handed to you.',
      syntax: `function sum(...numbers) {
  let total = 0;
  for (const n of numbers) total += n;
  return total;
}
sum();          // 0
sum(5, 10, 15); // 30`,
    },
    {
      heading: 'Spread operator (...)',
      content: '**Spread** looks the same (`...`) but does the **opposite** of rest: it **expands** an array (or any iterable) into individual values.\n\nAnalogy: rest **packs** items into a bag; spread **unpacks** the bag onto the table.\n\nCommon uses:\n- **Pass an array as separate arguments**: `Math.max(...[3, 9, 2])` is 9.\n- **Copy an array** (shallow copy): `const copy = [...original];`\n- **Merge arrays**: `const all = [...a, ...b];`\n- **Add items while copying**: `const more = [0, ...nums, 99];`\n- **Turn a string into characters**: `[..."hey"]` gives `["h", "e", "y"]`\n- Objects can be spread too: `{ ...obj }` (Day 18).\n\n**How to tell them apart:** `...` in a **function definition / on the left side** collects = **rest**. `...` in a **function call or array literal / on the right side** expands = **spread**.',
      syntax: `const a = [1, 2];
const b = [3, 4];
const merged = [...a, ...b];   // [1, 2, 3, 4]
const copy = [...a];           // new array
console.log(Math.max(...merged)); // 4`,
      tip: 'Spread makes a SHALLOW copy: nested arrays/objects inside are still shared references.',
    },
    {
      heading: 'The arguments object (legacy)',
      content: 'Every **regular** function (not arrow) has a special local variable `arguments` containing all passed arguments.\n\n- It is **array-like**: it has `length` and indexes (`arguments[0]`), but it is **not a real array**, so it has no `map`, `filter` or `reduce`.\n- Convert it with `Array.from(arguments)` or `[...arguments]`.\n- **Arrow functions do not have their own** `arguments`.\n\nModern code uses **rest parameters** instead, because they are real arrays, clearly visible in the signature and work in arrow functions. You still need to know arguments for interviews and old code.',
      syntax: `function oldSum() {
  let total = 0;
  for (let i = 0; i < arguments.length; i++) {
    total += arguments[i];
  }
  return total;
}
oldSum(1, 2, 3); // 6`,
    },
    {
      heading: 'Putting it together',
      content: 'A real-world function often mixes all of these:\n\n`function createOrder(customer, discount = 0, ...items) { }`\n\n- `customer` is required\n- `discount` is optional with a default\n- `items` collects any number of products\n\nAnd a caller can spread an existing array into it: `createOrder("Asha", 10, ...cartItems)`.\n\n`function.length` gives the number of parameters **before** the first default or rest parameter, a small interview trivia point.\n\nComing next (Day 12): scope and hoisting.',
    },
  ],
  examples: [
    {
      title: 'Default parameters in a greeting and price function',
      scenario: 'An e-commerce site shows a greeting and calculates price with an optional discount and quantity.',
      steps: [
        'Write greet(name = "Guest")',
        'Write price(amount, qty = 1, discount = 0)',
        'Call them with missing, undefined, null and 0 arguments',
        'Click Run',
      ],
      code: `function greet(name = "Guest") {
  return "Welcome, " + name;
}
function price(amount, qty = 1, discount = 0) {
  return amount * qty - discount;
}

console.log(greet());
console.log(greet("Asha"));
console.log(greet(undefined));
console.log(greet(null));
console.log(price(500));
console.log(price(500, 3));
console.log(price(500, 3, 200));
console.log(price(500, 0));`,
      playground: {
        js: `function greet(name = "Guest") {
  return "Welcome, " + name;
}
function price(amount, qty = 1, discount = 0) {
  return amount * qty - discount;
}

console.log(greet());
console.log(greet("Asha"));
console.log(greet(undefined));
console.log(greet(null));
console.log(price(500));
console.log(price(500, 3));
console.log(price(500, 3, 200));
console.log(price(500, 0));`,
      },
      result: `Welcome, Guest
Welcome, Asha
Welcome, Guest
Welcome, null
500
1500
1300
0`,
      explanation: 'Defaults apply for a missing argument or explicit undefined. null is a real value, so no default is used. price(500, 0) keeps qty = 0 (a valid value), which || based defaults would have wrongly changed to 1.',
    },
    {
      title: 'Rest parameters: average of any number of marks',
      scenario: 'A teacher wants one function that calculates the average for any number of marks, and a logger that takes a level plus any number of messages.',
      steps: [
        'Write average(...marks) using a loop',
        'Handle the case of no marks',
        'Write log(level, ...messages) and join the messages',
        'Click Run',
      ],
      code: `function average(...marks) {
  if (marks.length === 0) return 0;
  let total = 0;
  for (const m of marks) total += m;
  return total / marks.length;
}
console.log(average(80, 90));
console.log(average(70, 85, 90, 95));
console.log(average());

function log(level, ...messages) {
  console.log(\`[\${level.toUpperCase()}]\`, messages.join(" | "), "(" + messages.length + " parts)");
}
log("info", "Server started", "port 3000");
log("warn", "Disk almost full");`,
      playground: {
        js: `function average(...marks) {
  if (marks.length === 0) return 0;
  let total = 0;
  for (const m of marks) total += m;
  return total / marks.length;
}
console.log(average(80, 90));
console.log(average(70, 85, 90, 95));
console.log(average());

function log(level, ...messages) {
  console.log(\`[\${level.toUpperCase()}]\`, messages.join(" | "), "(" + messages.length + " parts)");
}
log("info", "Server started", "port 3000");
log("warn", "Disk almost full");`,
      },
      result: `85
85
0
[INFO] Server started | port 3000 (2 parts)
[WARN] Disk almost full (1 parts)`,
      explanation: 'marks is a real array, so length and for...of work. With no arguments it is an empty array, which we guard against to avoid 0 / 0 = NaN. In log, the first argument goes to level and the rest are collected into messages.',
    },
    {
      title: 'Spread: copy, merge and pass arrays as arguments',
      scenario: 'Merge two class lists, make a safe copy before modifying, find the highest score with Math.max, and split a word into letters.',
      steps: [
        'Merge two arrays with [...a, ...b]',
        'Copy an array and push into the copy only',
        'Spread an array into Math.max',
        'Spread a string into characters',
      ],
      code: `const classA = ["Asha", "Ravi"];
const classB = ["Meera", "Kiran"];
const all = [...classA, ...classB];
console.log(all.join(", "));

const copy = [...classA];
copy.push("New Student");
console.log(classA.length, copy.length);

const scores = [67, 92, 85];
console.log(Math.max(scores));
console.log(Math.max(...scores));
console.log([0, ...scores, 100].join(" "));
console.log([..."hello"].join("-"));`,
      playground: {
        js: `const classA = ["Asha", "Ravi"];
const classB = ["Meera", "Kiran"];
const all = [...classA, ...classB];
console.log(all.join(", "));

const copy = [...classA];
copy.push("New Student");
console.log(classA.length, copy.length);

const scores = [67, 92, 85];
console.log(Math.max(scores));
console.log(Math.max(...scores));
console.log([0, ...scores, 100].join(" "));
console.log([..."hello"].join("-"));`,
      },
      result: `Asha, Ravi, Meera, Kiran
2 3
NaN
92
0 67 92 85 100
h-e-l-l-o`,
      explanation: 'Spread inside [ ] unpacks the items into a new array. Because copy is a new array, pushing into it leaves classA with 2 items. Math.max expects separate numbers; given one array it returns NaN, but with ...scores it receives 67, 92, 85. Strings are iterable, so [..."hello"] gives one item per character.',
    },
    {
      title: 'arguments object vs rest parameters',
      scenario: 'Compare the old arguments object with modern rest parameters and see why arrow functions need rest.',
      steps: [
        'Write a regular function that reads arguments',
        'Check whether arguments is a real array',
        'Convert it with Array.from',
        'Write the same with an arrow function and rest',
      ],
      code: `function oldWay() {
  console.log(arguments.length, Array.isArray(arguments));
  const arr = Array.from(arguments);
  console.log(Array.isArray(arr), arr.join("+"));
}
oldWay(1, 2, 3);

const newWay = (...args) => {
  console.log(args.length, Array.isArray(args), args.join("+"));
};
newWay(4, 5);

function withDefaults(a, b = 2, ...rest) {}
console.log(withDefaults.length);`,
      playground: {
        js: `function oldWay() {
  console.log(arguments.length, Array.isArray(arguments));
  const arr = Array.from(arguments);
  console.log(Array.isArray(arr), arr.join("+"));
}
oldWay(1, 2, 3);

const newWay = (...args) => {
  console.log(args.length, Array.isArray(args), args.join("+"));
};
newWay(4, 5);

function withDefaults(a, b = 2, ...rest) {}
console.log(withDefaults.length);`,
      },
      result: `3 false
true 1+2+3
2 true 4+5
1`,
      explanation: 'arguments has a length but is not an array, so we convert it with Array.from before using array methods. Arrow functions have no arguments object; the rest parameter args is a real array from the start. function.length counts only parameters before the first default value, so it is 1.',
    },
  ],
  interview: [
    { q: 'What are default parameters? When is the default used?', a: 'Values specified in the function signature (function f(x = 10)) that are used when the argument is undefined, either missing or explicitly passed as undefined. null, 0, false and "" do not trigger the default.', level: 'Easy' },
    { q: 'What is the difference between rest and spread?', a: 'Both use ... syntax. Rest collects multiple elements into an array (in function parameters or destructuring). Spread expands an iterable into individual elements (in function calls, array literals, object literals). Rest packs, spread unpacks.', level: 'Easy' },
    { q: 'What is the arguments object? How is it different from rest parameters?', a: 'arguments is an array-like object available in regular (non-arrow) functions containing all passed arguments. It has length and indexes but no array methods. Rest parameters create a real array, only contain the unnamed extra arguments, are explicit in the signature and work in arrow functions.', level: 'Medium' },
    { q: 'How do you copy an array? Is the copy deep?', a: '[...arr], arr.slice() or Array.from(arr). These are shallow copies: top-level items are copied, but nested objects/arrays are still shared references. For deep copies use structuredClone(arr).', level: 'Medium' },
    { q: 'Why must the rest parameter be last?', a: 'Because it collects all remaining arguments; anything after it could never receive a value. function f(...a, b) is a SyntaxError.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nfunction f(a, b = a * 2, c = a + b) {\n  return [a, b, c].join(",");\n}\nconsole.log(f(1));\nconsole.log(f(1, 5));', a: 'It prints:\n1,2,3\n1,5,6\nDefaults can use earlier parameters: b = 2, c = 1 + 2. When b is passed as 5, c = 1 + 5.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfunction g(x = 10) {\n  return x;\n}\nconsole.log(g(undefined), g(null), g(0), g(""));', a: '10 null 0 (followed by an empty string). Only undefined triggers the default.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst nums = [1, 2, 3];\nconst copy = nums;\nconst clone = [...nums];\nnums.push(4);\nconsole.log(copy.length, clone.length);', a: '4 3. copy references the same array, so it sees the push. clone is a new array created before the push.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfunction h(first, ...others) {\n  console.log(first, others.length);\n}\nh();\nh(1);\nh(1, 2, 3);', a: 'It prints:\nundefined 0\n1 0\n1 2\nWith no arguments, first is undefined and others is an empty array; others is never undefined.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfunction regular() {\n  const inner = () => arguments.length;\n  return inner(99);\n}\nconsole.log(regular(1, 2, 3));', a: '3. Arrow functions have no own arguments object, so inner uses the arguments of the surrounding regular function (1, 2, 3), not its own argument 99.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write createUser(name, role = "viewer", active = true) that returns a string like "Asha (viewer) active". Call it with 1, 2 and 3 arguments.',
      hint: 'Use a ternary for active/inactive.',
      solution: `function createUser(name, role = "viewer", active = true) {
  return \`\${name} (\${role}) \${active ? "active" : "inactive"}\`;
}
console.log(createUser("Asha"));
console.log(createUser("Ravi", "admin"));
console.log(createUser("Meera", "editor", false));`,
    },
    {
      task: 'Write multiplyAll(...nums) that returns the product of all numbers (1 if none).',
      hint: 'Start the result at 1.',
      solution: `function multiplyAll(...nums) {
  let product = 1;
  for (const n of nums) product *= n;
  return product;
}
console.log(multiplyAll(2, 3, 4)); // 24
console.log(multiplyAll());        // 1`,
    },
    {
      task: 'Given const week1 = [120, 90] and const week2 = [150, 60, 30], create one merged array of expenses, find the max and min with spread, and print them.',
      hint: '[...week1, ...week2], Math.max(...all)',
      solution: `const week1 = [120, 90];
const week2 = [150, 60, 30];
const all = [...week1, ...week2];
console.log(all.join(","), Math.max(...all), Math.min(...all)); // 120,90,150,60,30 150 30`,
    },
    {
      task: 'Write a function joinWith(separator, ...words) that joins any number of words using the separator. joinWith("-", "a", "b", "c") gives "a-b-c".',
      hint: 'words is an array, so words.join(separator).',
      solution: `function joinWith(separator, ...words) {
  return words.join(separator);
}
console.log(joinWith("-", "a", "b", "c")); // a-b-c
console.log(joinWith(" & ", "Tom", "Jerry")); // Tom & Jerry`,
    },
    {
      task: 'Rewrite this legacy function using rest parameters: function maxOf() { return Math.max.apply(null, arguments); }',
      hint: 'const maxOf = (...nums) => Math.max(...nums);',
      solution: `const maxOf = (...nums) => Math.max(...nums);
console.log(maxOf(4, 11, 7)); // 11`,
    },
  ],
  quiz: [
    { question: 'function f(a = 5) { return a; } What is f(null)?', options: ['5', 'undefined', 'null', 'TypeError'], answer: 2, explanation: 'Defaults apply only for undefined; null is passed through.' },
    { question: 'In function f(...args), what is args when f() is called?', options: ['[]', 'undefined', 'null', 'An arguments object'], answer: 0, explanation: 'A rest parameter is always an array, empty if nothing was passed.' },
    { question: 'What does Math.max(...[4, 8, 2]) return?', options: ['NaN', '[8]', '4', '8'], answer: 3, explanation: 'Spread passes 4, 8, 2 as separate arguments.' },
    { question: 'Which statement is TRUE?', options: ['Arrow functions have their own arguments object', 'The rest parameter must be the last parameter', 'arguments is a real array', 'Spread makes a deep copy'], answer: 1, explanation: 'Only one rest parameter, and it must be last.' },
    { question: 'In const c = [...a, ...b];, the ... is used as:', options: ['Rest', 'Default', 'Spread', 'Optional chaining'], answer: 2, explanation: 'In an array literal, ... expands values: spread.' },
  ],
};
