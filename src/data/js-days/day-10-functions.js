export default {
  id: 'day-10-functions',
  title: 'Functions: Declaration, Expression, Arrow Functions, Return',
  module: 'Module 2: Functions & Arrays',
  day: 10,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Functions are reusable blocks of code with a name. Learn to define them as declarations, expressions and arrow functions, pass inputs (parameters) and get outputs with return, and understand why functions are "first-class" values in JavaScript.',
  objectives: [
    'Explain what a function is and why we use them (DRY, reuse, readability)',
    'Write function declarations, function expressions and arrow functions',
    'Understand parameters vs arguments and how return works',
    'Know the difference between returning a value and logging it',
    'Pass functions as values (callbacks) and recognise hoisting differences between declarations and expressions',
  ],
  theory: [
    {
      heading: 'What is a function?',
      content: 'A **function** is a named, reusable block of code that performs a task. You **define** it once and **call** (invoke) it as many times as you want.\n\nAnalogy: a function is like a **juicer machine**. You put fruit in (**inputs** = parameters), the machine does its work (the **body**), and juice comes out (**output** = return value). You do not need to know how the motor works every time you use it.\n\nWhy functions?\n- **DRY** (Don\'t Repeat Yourself): write logic once, reuse it.\n- **Readability**: `calculateTax(amount)` explains itself.\n- **Easy to fix**: fix a bug in one place.\n- **Testable**: test small pieces separately.',
    },
    {
      heading: 'Function declaration',
      content: 'The most common way to create a named function:\n\n`function name(parameters) { body }`\n\n- `function` keyword, then a **name** (camelCase, usually a verb: `getTotal`, `isValid`).\n- **Parameters** in brackets: placeholders for inputs.\n- Call it with brackets: `name(arguments)`. Without brackets (`name`) you are just referring to the function, not running it.\n\n**Hoisting:** function declarations are hoisted completely, so you can call them **before** the line where they are written (Day 12 explains why).',
      syntax: `console.log(add(2, 3)); // 5, works before the definition

function add(a, b) {
  return a + b;
}`,
    },
    {
      heading: 'Parameters, arguments and return',
      content: '**Parameters** are the variable names in the definition: `function greet(name)`. **Arguments** are the actual values passed when calling: `greet("Asha")`.\n\nIf you pass fewer arguments, missing parameters are `undefined`. Extra arguments are ignored (Day 11 covers defaults and rest).\n\n`return`:\n- **sends a value back** to the caller, so you can store or use it: `const total = add(2, 3);`\n- **stops** the function immediately; code after return does not run.\n- A function without return (or with an empty `return;`) returns **undefined**.\n\n**return vs console.log:** console.log only **displays** a value for the developer. return **hands the value back** so other code can use it. A function that only logs cannot be used in calculations.',
      syntax: `function square(n) {
  return n * n;
  console.log("never runs");
}
const result = square(4) + 1; // 17

function logSquare(n) {
  console.log(n * n);
}
const r = logSquare(4); // prints 16
console.log(r);         // undefined`,
      tip: 'Common mistake: putting the returned value on the next line. "return" followed by a newline returns undefined because JavaScript inserts a semicolon after return. Keep the value on the same line as return, or open a bracket on that line.',
    },
    {
      heading: 'Function expressions',
      content: 'Functions are **values** in JavaScript, so you can store one in a variable. That is a **function expression**:\n\n`const multiply = function (a, b) { return a * b; };`\n\n- Often **anonymous** (no name after `function`), but can be named for better stack traces.\n- **Not hoisted** like declarations: calling `multiply()` before this line throws **ReferenceError** (because const is in the TDZ, Day 12).\n- Useful when passing functions to other functions or choosing a function conditionally.',
      syntax: `const multiply = function (a, b) {
  return a * b;
};
console.log(multiply(3, 4)); // 12`,
    },
    {
      heading: 'Arrow functions (ES2015)',
      content: 'Arrow functions are a **shorter syntax** for function expressions:\n\n- Full form: `const add = (a, b) => { return a + b; };`\n- **Implicit return**: if the body is a single expression, drop the braces and `return`: `const add = (a, b) => a + b;`\n- **One parameter**: brackets optional: `const double = n => n * 2;`\n- **No parameters**: empty brackets required: `const hello = () => "Hi";`\n- **Returning an object** in one line: wrap it in brackets: `const make = () => ({ id: 1 });` (otherwise `{` is read as the function body).\n\nDifferences from regular functions (details on Days 17 and 38):\n- No own `this` (they use `this` from the surrounding code)\n- No `arguments` object\n- Cannot be used as constructors with `new`\n\nUse arrows for short callbacks and helpers; use declarations for main named functions.',
      syntax: `const add = (a, b) => a + b;
const isEven = n => n % 2 === 0;
const getTime = () => "10:30";
const makeUser = (name) => ({ name, active: true });`,
    },
    {
      heading: 'Functions are first-class values (callbacks)',
      content: 'In JavaScript functions are **first-class citizens**: you can store them in variables, put them in arrays/objects, **pass them as arguments**, and **return them** from other functions.\n\nA function passed into another function to be called later is a **callback**. You will use callbacks constantly: array methods (Day 15), events (Day 25), timers (Day 30).\n\nA function that takes or returns a function is a **higher-order function** (Day 39 goes deeper).\n\nComing next (Day 11): default, rest and spread parameters.',
      syntax: `function applyTwice(fn, value) {
  return fn(fn(value));
}
console.log(applyTwice(n => n + 3, 10)); // 16`,
    },
  ],
  examples: [
    {
      title: 'Three ways to write the same function',
      scenario: 'Calculate the price after GST using a declaration, an expression and an arrow function, and confirm they give the same result.',
      steps: [
        'Write a function declaration addGst(amount)',
        'Write the same logic as a function expression and as an arrow function',
        'Call all three with 1000',
        'Click Run',
      ],
      code: `function addGstDecl(amount) {
  return amount * 1.18;
}

const addGstExpr = function (amount) {
  return amount * 1.18;
};

const addGstArrow = (amount) => amount * 1.18;

console.log(addGstDecl(1000));
console.log(addGstExpr(1000));
console.log(addGstArrow(1000));
console.log(typeof addGstArrow);`,
      playground: {
        js: `function addGstDecl(amount) {
  return amount * 1.18;
}

const addGstExpr = function (amount) {
  return amount * 1.18;
};

const addGstArrow = (amount) => amount * 1.18;

console.log(addGstDecl(1000));
console.log(addGstExpr(1000));
console.log(addGstArrow(1000));
console.log(typeof addGstArrow);`,
      },
      result: `1180
1180
1180
function`,
      explanation: 'All three forms create a function that takes amount and returns amount x 1.18. The arrow version uses an implicit return because the body is one expression. typeof reports "function" because a function is a special kind of object.',
    },
    {
      title: 'return vs console.log',
      scenario: 'A beginner writes a function that logs the area instead of returning it, then tries to add two areas. See why it fails.',
      steps: [
        'Write areaLog that only logs',
        'Write areaReturn that returns',
        'Try to add two results from each',
        'Click Run and compare',
      ],
      code: `function areaLog(w, h) {
  console.log(w * h);
}
function areaReturn(w, h) {
  return w * h;
}

const a = areaLog(2, 3) + areaLog(4, 5);
console.log("Total with log:", a);

const b = areaReturn(2, 3) + areaReturn(4, 5);
console.log("Total with return:", b);`,
      playground: {
        js: `function areaLog(w, h) {
  console.log(w * h);
}
function areaReturn(w, h) {
  return w * h;
}

const a = areaLog(2, 3) + areaLog(4, 5);
console.log("Total with log:", a);

const b = areaReturn(2, 3) + areaReturn(4, 5);
console.log("Total with return:", b);`,
      },
      result: `6
20
Total with log: NaN
Total with return: 26`,
      explanation: 'areaLog prints 6 and 20 but returns undefined, and undefined + undefined is NaN. areaReturn hands back the numbers, so they can be added: 6 + 20 = 26. Rule: functions that calculate should return; let the caller decide whether to log.',
    },
    {
      title: 'Arrow function shortcuts and returning objects',
      scenario: 'Write small helper functions for a user list: check adults, build a full name and create a user object.',
      steps: [
        'Write a one-parameter arrow without brackets',
        'Write a no-parameter arrow',
        'Write an arrow that returns an object, wrapped in ( )',
        'Show what goes wrong without the brackets',
      ],
      code: `const isAdult = age => age >= 18;
const fullName = (first, last) => \`\${first} \${last}\`;
const now = () => "2026-01-01";
const makeUser = (name, age) => ({ name, age, adult: isAdult(age) });
const broken = (name) => { name: name };

console.log(isAdult(16), isAdult(30));
console.log(fullName("Asha", "Verma"));
console.log(now());
const u = makeUser("Ravi", 20);
console.log(u.name, u.age, u.adult);
console.log(broken("X"));`,
      playground: {
        js: `const isAdult = age => age >= 18;
const fullName = (first, last) => \`\${first} \${last}\`;
const now = () => "2026-01-01";
const makeUser = (name, age) => ({ name, age, adult: isAdult(age) });
const broken = (name) => { name: name };

console.log(isAdult(16), isAdult(30));
console.log(fullName("Asha", "Verma"));
console.log(now());
const u = makeUser("Ravi", 20);
console.log(u.name, u.age, u.adult);
console.log(broken("X"));`,
      },
      result: `false true
Asha Verma
2026-01-01
Ravi 20 true
undefined`,
      explanation: 'Single expressions are returned automatically. makeUser wraps the object in ( ) so it is returned. In broken, the { } is treated as a function body containing a label "name:", so nothing is returned and the result is undefined. { name, age } is shorthand for { name: name, age: age }.',
    },
    {
      title: 'Hoisting and callbacks',
      scenario: 'Call a declaration before it is defined, see that an expression cannot be called early, and pass functions as callbacks to a calculator.',
      steps: [
        'Call a function declaration above its definition',
        'Try calling a const function expression early inside try/catch',
        'Write calculate(a, b, operation) that receives a function',
        'Pass different arrow functions and click Run',
      ],
      code: `console.log(greet("Meera"));
function greet(name) {
  return "Hello, " + name;
}

try {
  sayBye();
} catch (err) {
  console.log(err.name);
}
const sayBye = () => "Bye";

function calculate(a, b, operation) {
  return operation(a, b);
}
console.log(calculate(10, 5, (x, y) => x + y));
console.log(calculate(10, 5, (x, y) => x * y));
console.log(calculate(10, 5, Math.max));`,
      playground: {
        js: `console.log(greet("Meera"));
function greet(name) {
  return "Hello, " + name;
}

try {
  sayBye();
} catch (err) {
  console.log(err.name);
}
const sayBye = () => "Bye";

function calculate(a, b, operation) {
  return operation(a, b);
}
console.log(calculate(10, 5, (x, y) => x + y));
console.log(calculate(10, 5, (x, y) => x * y));
console.log(calculate(10, 5, Math.max));`,
      },
      result: `Hello, Meera
ReferenceError
15
50
10`,
      explanation: 'Function declarations are hoisted with their body, so greet works before its line. sayBye is a const, which exists but is not initialised before its line (the Temporal Dead Zone), so calling it throws ReferenceError. calculate does not know what operation does; it just calls whatever function it receives. Even built-in functions like Math.max can be passed.',
    },
  ],
  interview: [
    { q: 'What is the difference between a function declaration and a function expression?', a: 'A declaration (function foo() {}) is hoisted with its body, so it can be called before it appears. An expression (const foo = function () {}) is created when that line runs; calling it earlier throws ReferenceError (const/let) or TypeError (var, because foo is undefined).', level: 'Easy' },
    { q: 'What are arrow functions and how are they different from regular functions?', a: 'A concise syntax: (a, b) => a + b, with implicit return for single expressions. They have no own this (lexical this), no arguments object, cannot be used with new, and have no prototype. They are ideal for short callbacks.', level: 'Medium' },
    { q: 'What is the difference between parameters and arguments?', a: 'Parameters are the names listed in the function definition; arguments are the actual values passed when the function is called.', level: 'Easy' },
    { q: 'What does a function return if there is no return statement?', a: 'undefined.', level: 'Easy' },
    { q: 'What does "functions are first-class citizens" mean?', a: 'Functions are values: they can be assigned to variables, stored in data structures, passed as arguments (callbacks) and returned from other functions.', level: 'Medium' },
    { q: 'What is a callback function?', a: 'A function passed as an argument to another function, which calls it later, e.g. arr.map(x => x * 2) or button.addEventListener("click", handleClick).', level: 'Easy' },
    { q: 'Output-based: what does this print?\nfunction f() {\n  return\n  42;\n}\nconsole.log(f());', a: 'undefined. Automatic semicolon insertion adds a semicolon right after return, so the function returns nothing and 42; is unreachable.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconst getObj = () => { a: 1 };\nconsole.log(getObj());\nconst getObj2 = () => ({ a: 1 });\nconsole.log(getObj2().a);', a: 'It prints:\nundefined\n1\nIn the first, the braces are a function body with a label a:, so nothing is returned. Wrapping the object in brackets returns it.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log(typeof hoisted, typeof notHoisted);\nfunction hoisted() {}\nvar notHoisted = function () {};', a: 'function undefined. The declaration is fully hoisted. var notHoisted is hoisted but initialised to undefined until its line runs.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nfunction sum(a, b) {\n  return a + b;\n}\nconsole.log(sum(1), sum(1, 2, 3));', a: 'NaN 3. In sum(1), b is undefined and 1 + undefined is NaN. In sum(1, 2, 3) the extra argument is ignored.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a function celsiusToF(c) that returns the Fahrenheit value. Write it as a declaration, then as a one-line arrow function.',
      hint: 'F = C * 9 / 5 + 32',
      solution: `function celsiusToF(c) {
  return c * 9 / 5 + 32;
}
const celsiusToFArrow = c => c * 9 / 5 + 32;
console.log(celsiusToF(100), celsiusToFArrow(0)); // 212 32`,
    },
    {
      task: 'Write isPrime(n) that returns true if n is a prime number. Test with 2, 9, 17 and 1.',
      hint: 'Return false for n < 2. Loop from 2 to Math.sqrt(n) and return false if any divides n.',
      solution: `function isPrime(n) {
  if (n < 2) return false;
  for (let i = 2; i <= Math.sqrt(n); i++) {
    if (n % i === 0) return false;
  }
  return true;
}
console.log(isPrime(2), isPrime(9), isPrime(17), isPrime(1)); // true false true false`,
    },
    {
      task: 'Write a function getGrade(marks) that returns "A", "B", "C" or "F" (90+, 75+, 40+, else). Use it inside a loop over [92, 80, 55, 30] to print each grade.',
      hint: 'Use early returns instead of else.',
      solution: `function getGrade(marks) {
  if (marks >= 90) return "A";
  if (marks >= 75) return "B";
  if (marks >= 40) return "C";
  return "F";
}
for (const m of [92, 80, 55, 30]) {
  console.log(m, getGrade(m));
}`,
    },
    {
      task: 'Write a higher-order function repeat(n, action) that calls action(i) n times with i from 1 to n. Use it to print "Step 1" ... "Step 3".',
      hint: 'Inside a for loop call action(i).',
      solution: `function repeat(n, action) {
  for (let i = 1; i <= n; i++) {
    action(i);
  }
}
repeat(3, i => console.log("Step " + i));`,
    },
    {
      task: 'Write an arrow function createProduct(name, price) that returns an object { name, price, priceWithTax } where priceWithTax is price * 1.18.',
      hint: 'Wrap the returned object in ( ).',
      solution: `const createProduct = (name, price) => ({ name, price, priceWithTax: price * 1.18 });
const p = createProduct("Mouse", 500);
console.log(p.name, p.priceWithTax); // Mouse 590`,
    },
  ],
  quiz: [
    { question: 'What does a function return when it has no return statement?', options: ['null', '0', 'undefined', 'An empty string'], answer: 2, explanation: 'Functions return undefined by default.' },
    { question: 'Which is a correct arrow function that returns double of n?', options: ['n => n * 2', 'n -> n * 2', 'function => n * 2', '(n) => { n * 2 }'], answer: 0, explanation: 'Option D has braces but no return, so it returns undefined.' },
    { question: 'Which can be called before it is defined in the code?', options: ['const f = () => {}', 'let f = function () {}', 'function f() {}', 'None of them'], answer: 2, explanation: 'Function declarations are fully hoisted.' },
    { question: 'How do you return an object literal from a one-line arrow function?', options: ['() => {a: 1}', '() => return {a: 1}', '() => [a: 1]', '() => ({a: 1})'], answer: 3, explanation: 'Wrap the object in brackets so { is not read as a function body.' },
    { question: 'A function passed as an argument to another function is called a...', options: ['constructor', 'callback', 'closure', 'module'], answer: 1, explanation: 'It is a callback.' },
  ],
};
