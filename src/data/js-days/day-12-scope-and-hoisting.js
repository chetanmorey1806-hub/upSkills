export default {
  id: 'day-12-scope-and-hoisting',
  title: 'Scope (Global, Function, Block) and Hoisting, Temporal Dead Zone (TDZ)',
  module: 'Module 2: Functions & Arrays',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Scope decides where a variable can be seen; hoisting decides when it exists. Learn global, function and block scope, the scope chain and shadowing, how var, let, const and functions are hoisted, and what the Temporal Dead Zone is. These are among the most asked JavaScript interview topics.',
  objectives: [
    'Define scope and identify global, function and block scope',
    'Explain the scope chain, variable lookup and shadowing',
    'Describe how JavaScript creates variables before running code (hoisting)',
    'Explain the Temporal Dead Zone for let, const and class',
    'Predict output for hoisting and scope questions, including the var-in-loop problem',
  ],
  theory: [
    {
      heading: 'What is scope?',
      content: '**Scope** is the region of code where a variable is **accessible**.\n\nAnalogy: think of a **house with rooms**. Things in the **living room** (global scope) can be seen from every room. Things inside a **bedroom** (function scope) are private to that room. Things inside a **cupboard** in the bedroom (block scope) are only visible when the cupboard is open.\n\nInner rooms can see outward, but outer rooms cannot see inward.\n\nJavaScript has three main kinds of scope:\n1. **Global scope**: declared outside any function or block. Visible everywhere.\n2. **Function scope**: declared inside a function. Visible only inside that function.\n3. **Block scope**: declared with let/const inside `{ }` (if, for, while, or a bare block). Visible only inside those braces.\n\n(ES modules also have **module scope**: top-level variables in a module are private to that file, Day 35.)',
    },
    {
      heading: 'Global, function and block scope in code',
      content: '- `var` is **function-scoped**: it ignores `if`/`for` blocks but stays inside functions.\n- `let` and `const` are **block-scoped**.\n- Function parameters are local to the function.\n\n**Avoid global variables**: any code (including other scripts) can change them, causing hard-to-find bugs and name clashes. Keep variables in the smallest scope that works.\n\n**Accidental globals**: assigning to an undeclared variable (`total = 5;` without let/const) in non-strict mode silently creates a global. In **strict mode** (`"use strict";`, and always in modules and classes) it throws ReferenceError. Always declare your variables.',
      syntax: `const appName = "Shop";        // global

function checkout() {
  const tax = 0.18;            // function scope
  if (true) {
    let discount = 50;         // block scope
    var note = "thanks";       // function scope (var ignores the block)
    console.log(appName, tax, discount); // all visible
  }
  console.log(note);           // "thanks"
  // console.log(discount);    // ReferenceError
}
checkout();
// console.log(tax);           // ReferenceError`,
    },
    {
      heading: 'Scope chain, lexical scope and shadowing',
      content: 'When JavaScript needs a variable, it looks in the **current scope** first. If not found, it looks in the **outer** scope, then the next outer one, all the way to global. This lookup path is the **scope chain**. If it is not found anywhere: **ReferenceError: x is not defined**.\n\nThe chain is decided by **where the code is written** (not where it is called). This is called **lexical scope** (lexical = based on the source text). It is the foundation of closures (Day 13).\n\n**Shadowing**: an inner variable with the **same name** as an outer one "hides" the outer one inside that scope. The outer variable is not changed.',
      syntax: `const level = "global";
function outer() {
  const level = "outer";   // shadows global
  function inner() {
    console.log(level);    // "outer" (nearest one wins)
  }
  inner();
}
outer();
console.log(level);        // "global"`,
    },
    {
      heading: 'Hoisting: how JavaScript prepares code',
      content: 'Before running a scope, the JavaScript engine does a **creation phase**: it scans the code and registers all declarations. Then it executes line by line. The visible effect is called **hoisting**: declarations behave as if they were "moved to the top" of their scope. (Nothing actually moves; memory is set up first.)\n\nHow each kind is hoisted:\n- **Function declarations**: hoisted **with their full body**. You can call them before the line.\n- **var**: hoisted and **initialised to undefined**. Using it early gives undefined, not an error.\n- **let and const**: hoisted but **not initialised**. Using them early throws **ReferenceError** (TDZ).\n- **class** declarations: like let (TDZ).\n- **Function expressions / arrow functions**: follow the rules of the variable that holds them (var gives undefined -> calling it is a TypeError; let/const -> ReferenceError).',
      syntax: `console.log(a); // undefined
var a = 5;

sayHi();        // works
function sayHi() { console.log("Hi"); }

// console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 10;`,
      tip: 'Only the declaration is hoisted, never the assignment. var a = 5 behaves like: var a; (top) ... a = 5; (original line).',
    },
    {
      heading: 'The Temporal Dead Zone (TDZ)',
      content: 'The **Temporal Dead Zone** is the time between **entering a scope** and the **line where a let/const/class is declared**. During this time the variable exists (the engine knows about it) but **cannot be accessed**. Any access throws **ReferenceError: Cannot access \'x\' before initialization**.\n\nWhy does it exist? To catch bugs. With var you silently get undefined; with let/const you get a clear error.\n\nThe TDZ also explains shadowing surprises: if a block declares `let x`, then **inside that block** every use of x before its declaration refers to the **inner** x (in its TDZ), not the outer one.\n\n"Temporal" means it is about **time** (execution order), not position: a function defined above the declaration can use the variable if it is **called** after the declaration line.',
      syntax: `let x = "outer";
{
  // console.log(x); // ReferenceError: inner x is in TDZ
  let x = "inner";
  console.log(x);    // "inner"
}`,
    },
    {
      heading: 'The classic var-in-loop problem',
      content: 'Because `var` is function-scoped, a loop with var has **one shared variable** for all iterations. Functions created inside the loop (callbacks, timers) all see its **final value**.\n\n`let` creates a **new binding for each iteration**, so each callback remembers its own value.\n\nThis is one of the most famous interview questions and the reason to always use let in loops. You will see the setTimeout version of it on Days 13 and 30.\n\nComing next (Day 13): closures, which build directly on lexical scope.',
      syntax: `const fns = [];
for (var i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns[0](), fns[1](), fns[2]()); // 3 3 3

const fns2 = [];
for (let j = 0; j < 3; j++) {
  fns2.push(() => j);
}
console.log(fns2[0](), fns2[1](), fns2[2]()); // 0 1 2`,
    },
  ],
  examples: [
    {
      title: 'Global, function and block scope',
      scenario: 'A billing function uses variables at different levels. Check which variables are visible where.',
      steps: [
        'Declare a global const',
        'Inside a function declare a const, and inside an if block a let and a var',
        'Log variables inside and outside the block and function',
        'Use typeof to check variables that are not in scope without throwing',
      ],
      code: `const shop = "QuickMart";

function bill() {
  const items = 3;
  if (items > 0) {
    let blockMsg = "has items";
    var funcMsg = "var escapes block";
    console.log(shop, items, blockMsg);
  }
  console.log(funcMsg);
  console.log(typeof blockMsg);
}
bill();
console.log(typeof items, typeof funcMsg, typeof shop);`,
      playground: {
        js: `const shop = "QuickMart";

function bill() {
  const items = 3;
  if (items > 0) {
    let blockMsg = "has items";
    var funcMsg = "var escapes block";
    console.log(shop, items, blockMsg);
  }
  console.log(funcMsg);
  console.log(typeof blockMsg);
}
bill();
console.log(typeof items, typeof funcMsg, typeof shop);`,
      },
      result: `QuickMart 3 has items
var escapes block
undefined
undefined undefined string`,
      explanation: 'Inside the block everything outward is visible. After the block, funcMsg (var) is still available because var is function-scoped, but blockMsg (let) is gone. Outside the function, neither items nor funcMsg exist. typeof returns "undefined" for names that are not in scope, instead of throwing.',
    },
    {
      title: 'Scope chain and shadowing',
      scenario: 'Three nested levels each declare a variable called theme. Follow the lookup.',
      steps: [
        'Declare theme globally',
        'Shadow it inside a function, and again inside a nested function',
        'Log at each level and after the calls',
        'Also read a variable that only exists globally from the deepest level',
      ],
      code: `const theme = "light";
const version = "1.0";

function page() {
  const theme = "dark";
  function widget() {
    const theme = "high-contrast";
    console.log("widget:", theme, version);
  }
  widget();
  console.log("page:", theme);
}
page();
console.log("global:", theme);`,
      playground: {
        js: `const theme = "light";
const version = "1.0";

function page() {
  const theme = "dark";
  function widget() {
    const theme = "high-contrast";
    console.log("widget:", theme, version);
  }
  widget();
  console.log("page:", theme);
}
page();
console.log("global:", theme);`,
      },
      result: `widget: high-contrast 1.0
page: dark
global: light`,
      explanation: 'Each scope uses the nearest theme it can find. widget does not declare version, so the lookup walks up the scope chain (widget -> page -> global) and finds "1.0". Shadowing never changes the outer variables: global theme stays "light".',
    },
    {
      title: 'Hoisting of var, let, const and functions',
      scenario: 'Predict what happens when variables and functions are used before their declaration lines.',
      steps: [
        'Log a var before declaring it',
        'Call a function declaration before it is written',
        'Access a let and call a var function expression before their lines inside try/catch',
        'Click Run',
      ],
      code: `console.log(score);
var score = 90;
console.log(score);

console.log(add(2, 3));
function add(a, b) {
  return a + b;
}

try {
  console.log(total);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
let total = 100;

try {
  multiply(2, 3);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
var multiply = function (a, b) {
  return a * b;
};`,
      playground: {
        js: `console.log(score);
var score = 90;
console.log(score);

console.log(add(2, 3));
function add(a, b) {
  return a + b;
}

try {
  console.log(total);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
let total = 100;

try {
  multiply(2, 3);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
var multiply = function (a, b) {
  return a * b;
};`,
      },
      result: `undefined
90
5
ReferenceError: Cannot access 'total' before initialization
TypeError: multiply is not a function`,
      explanation: 'var score is created as undefined during the creation phase, so the first log prints undefined. add is fully hoisted. total is a let in its TDZ, so reading it throws ReferenceError. multiply is a var holding undefined until its line runs, so calling undefined() throws TypeError: multiply is not a function. (Browsers word messages slightly differently; Chrome matches this output.)',
    },
    {
      title: 'TDZ with shadowing and the var-in-loop problem',
      scenario: 'Two classic interview traps: a block that shadows an outer variable, and callbacks created in a var loop.',
      steps: [
        'Declare an outer let, then read the same name in a block before its inner declaration',
        'Create functions in a loop with var and with let',
        'Call all the stored functions',
        'Click Run',
      ],
      code: `let city = "Pune";
{
  try {
    console.log(city);
  } catch (err) {
    console.log("TDZ:", err.name);
  }
  let city = "Goa";
  console.log(city);
}
console.log(city);

const withVar = [];
for (var i = 1; i <= 3; i++) {
  withVar.push(() => i);
}
const withLet = [];
for (let k = 1; k <= 3; k++) {
  withLet.push(() => k);
}
console.log("var:", withVar[0](), withVar[1](), withVar[2]());
console.log("let:", withLet[0](), withLet[1](), withLet[2]());`,
      playground: {
        js: `let city = "Pune";
{
  try {
    console.log(city);
  } catch (err) {
    console.log("TDZ:", err.name);
  }
  let city = "Goa";
  console.log(city);
}
console.log(city);

const withVar = [];
for (var i = 1; i <= 3; i++) {
  withVar.push(() => i);
}
const withLet = [];
for (let k = 1; k <= 3; k++) {
  withLet.push(() => k);
}
console.log("var:", withVar[0](), withVar[1](), withVar[2]());
console.log("let:", withLet[0](), withLet[1](), withLet[2]());`,
      },
      result: `TDZ: ReferenceError
Goa
Pune
var: 4 4 4
let: 1 2 3`,
      explanation: 'Inside the block, the name city refers to the inner let city from the start of the block, which is in its TDZ until its line, so the first read throws even though an outer city exists. With var there is one i shared by all functions; after the loop it is 4, so all return 4. With let, each iteration gets its own k, so each function remembers 1, 2 and 3.',
    },
  ],
  interview: [
    { q: 'What is scope in JavaScript? What types exist?', a: 'Scope is the region where a variable is accessible. Types: global scope, function scope (var, parameters, inner functions), block scope (let/const/class inside { }), and module scope for ES modules.', level: 'Easy' },
    { q: 'What is hoisting?', a: 'During the creation phase, the engine registers declarations in their scope before executing code. Function declarations are hoisted with their body, var is hoisted and initialised to undefined, and let/const/class are hoisted but uninitialised (TDZ). Only declarations are hoisted, not assignments.', level: 'Medium' },
    { q: 'What is the Temporal Dead Zone?', a: 'The period from the start of a scope until a let/const/class declaration is executed. Accessing the variable in that period throws ReferenceError: Cannot access \'x\' before initialization.', level: 'Medium' },
    { q: 'What is lexical scope and the scope chain?', a: 'Lexical scope means a function\'s access to variables is determined by where it is written in the source code. When a variable is used, JS searches the current scope, then each enclosing scope outward to global; this path is the scope chain. If not found, it throws ReferenceError.', level: 'Medium' },
    { q: 'What is variable shadowing?', a: 'Declaring a variable in an inner scope with the same name as one in an outer scope. Inside the inner scope, the inner variable hides the outer one; the outer variable is unaffected.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log(x);\nvar x = 1;\nfunction test() {\n  console.log(x);\n  var x = 2;\n}\ntest();', a: 'It prints:\nundefined\nundefined\nThe global x is hoisted as undefined. Inside test, the local var x is hoisted to the top of the function as undefined, shadowing the global x.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nvar a = 1;\nfunction foo() {\n  a = 2;\n  return;\n  function a() {}\n}\nfoo();\nconsole.log(a);', a: '1. The function declaration a() inside foo is hoisted, creating a local variable a in foo. The assignment a = 2 changes that local a, not the global one.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nfor (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}', a: 'It prints 3 three times. var i is a single function-scoped variable; by the time the callbacks run, the loop has finished and i is 3. Using let prints 0, 1, 2 because each iteration gets a new binding.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log(typeof f1, typeof f2);\nfunction f1() {}\nvar f2 = () => {};', a: 'function undefined. f1 is a hoisted declaration; f2 is a var that is undefined until its assignment runs.', level: 'Medium' },
    { q: 'Output-based: what happens?\nlet n = 1;\nfunction show() {\n  console.log(n);\n  let n = 2;\n}\nshow();', a: 'It throws ReferenceError: Cannot access \'n\' before initialization. Inside show, n refers to the local let n, which is in its TDZ at the console.log line; the outer n is shadowed.', level: 'Hard' },
    { q: 'How does "use strict" affect undeclared variables?', a: 'In strict mode, assigning to an undeclared variable throws ReferenceError instead of silently creating a global. ES modules and classes are always strict.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a function counterDemo() that declares a let count inside an if block and tries to log it after the block. Fix it so count is accessible after the block.',
      hint: 'Declare count before the if block (in the function scope).',
      solution: `function counterDemo() {
  let count = 0;
  if (true) {
    count = 5;
  }
  console.log(count); // 5
}
counterDemo();`,
    },
    {
      task: 'Predict, then run: var a = "global"; function f() { console.log(a); var a = "local"; console.log(a); } f(); Write the outputs as comments and explain.',
      hint: 'The local var a is hoisted to the top of f as undefined.',
      solution: `var a = "global";
function f() {
  console.log(a); // undefined (local a is hoisted)
  var a = "local";
  console.log(a); // local
}
f();`,
    },
    {
      task: 'Fix this bug so the functions return 0, 1, 2: const fns = []; for (var i = 0; i < 3; i++) { fns.push(() => i); }',
      hint: 'Change var to let.',
      solution: `const fns = [];
for (let i = 0; i < 3; i++) {
  fns.push(() => i);
}
console.log(fns[0](), fns[1](), fns[2]()); // 0 1 2`,
    },
    {
      task: 'Demonstrate shadowing: create a global const color = "red", a function that declares its own color = "blue" and logs it, and log the global color after calling the function.',
      hint: 'The global must still be "red".',
      solution: `const color = "red";
function paint() {
  const color = "blue";
  console.log("inside:", color); // blue
}
paint();
console.log("outside:", color); // red`,
    },
    {
      task: 'Show that the TDZ is about time, not position: write a function that reads a let variable declared BELOW the function, and call the function AFTER the declaration.',
      hint: 'The function body runs only when called.',
      solution: `function readLater() {
  return message;
}
const message = "I exist now";
console.log(readLater()); // I exist now`,
    },
  ],
  quiz: [
    { question: 'Which keyword creates a function-scoped (not block-scoped) variable?', options: ['let', 'const', 'var', 'class'], answer: 2, explanation: 'var ignores blocks and is scoped to the function.' },
    { question: 'console.log(v); var v = 3; prints:', options: ['undefined', '3', 'ReferenceError', 'null'], answer: 0, explanation: 'var is hoisted and initialised with undefined.' },
    { question: 'console.log(c); const c = 3; results in:', options: ['undefined', '3', 'null', 'ReferenceError'], answer: 3, explanation: 'const is in the Temporal Dead Zone before its declaration.' },
    { question: 'Lexical scope means variable access is decided by:', options: ['Where the function is called', 'Where the code is written', 'The order of function calls', 'The type of the variable'], answer: 1, explanation: 'Scope is based on the physical position of code in the source.' },
    { question: 'Which can be called before its line in the code?', options: ['const f = () => 1', 'let f = function () {}', 'function f() {}', 'var f = () => 1'], answer: 2, explanation: 'Only function declarations are hoisted with their body.' },
  ],
};
