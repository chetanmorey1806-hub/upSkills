export default {
  id: 'day-02-variables-var-let-const',
  title: 'Variables: var, let, const and Naming Rules',
  module: 'Module 1: JavaScript Basics',
  day: 2,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Variables are named boxes that store values. Learn how to declare them with let, const and the old var, how they differ in reassignment, redeclaration and scope, and the rules and conventions for naming them.',
  objectives: [
    'Explain what a variable is and why programs need them',
    'Declare and use variables with let and const',
    'Understand how var differs from let/const (redeclaration, block scope)',
    'Know when to choose const vs let and why var is avoided today',
    'Follow JavaScript naming rules and camelCase conventions',
  ],
  theory: [
    {
      heading: 'What is a variable?',
      content: 'A **variable** is a named container that stores a value so you can use it later.\n\nAnalogy: a variable is like a **labelled box** in a storeroom. The label is the variable name (`price`), and what is inside the box is the value (`499`). Whenever you need the price, you look for the box with that label instead of remembering the number.\n\nWithout variables you would repeat values everywhere. With variables you write the value **once** and change it in **one place**.\n\nCreating a variable has two parts:\n1. **Declaration**: creating the box: `let price;`\n2. **Assignment / initialisation**: putting a value in it with `=`: `price = 499;`\n\nUsually you do both in one line: `let price = 499;`',
      syntax: `let price = 499;        // declare + assign
let quantity;           // declared, value is undefined
quantity = 3;           // assign later
console.log(price * quantity); // 1497`,
      tip: 'In JavaScript = means "assign" (put a value in), not "equals". Comparing uses === (Day 4).',
    },
    {
      heading: 'let: a variable that can change',
      content: 'Use `let` when the value **will change** later, such as a counter, a score or a running total.\n\n- You can **reassign** a let variable: `score = score + 10;`\n- You **cannot redeclare** the same name in the same block: `let score = 1; let score = 2;` gives a **SyntaxError**.\n- let is **block-scoped**: a variable declared inside `{ }` (for example inside an if or a loop) exists only inside those braces.\n- If you declare without a value, it is `undefined`.',
      syntax: `let score = 0;
score = score + 10;
score += 5;      // short form of score = score + 5
console.log(score); // 15`,
    },
    {
      heading: 'const: a variable that will not be reassigned',
      content: 'Use `const` (constant) when the variable should **always point to the same value**.\n\n- Must be **initialised** when declared: `const PI;` is a SyntaxError.\n- **Cannot be reassigned**: `PI = 3;` throws **TypeError: Assignment to constant variable.**\n- Also block-scoped like let.\n\n**Important:** const protects the **binding** (the label), not the **contents**. If a const holds an array or object, you can still change what is inside it (push items, change properties). You just cannot point the label at a new array.\n\n**Best practice:** use `const` by default. Switch to `let` only when you know you must reassign. This makes code easier to read: a reader knows a const never changes.',
      syntax: `const PI = 3.14159;
const cart = ["pen"];
cart.push("book");     // allowed: changing contents
console.log(cart);     // ["pen", "book"]
// cart = [];          // TypeError: Assignment to constant variable.`,
      tip: 'Common mistake: thinking const makes an array or object read-only. It does not. (Object.freeze does, but that is a later topic.)',
    },
    {
      heading: 'var: the old way (and why we avoid it)',
      content: 'Before ES2015, `var` was the only way to declare variables. You will still see it in old code and interview questions.\n\nProblems with var:\n- **Function-scoped, not block-scoped**: a var declared inside an `if` or `for` block leaks outside it.\n- **Can be redeclared** silently: `var x = 1; var x = 2;` gives no error, so you can accidentally overwrite a variable.\n- **Hoisted with undefined**: you can use a var before its line and get `undefined` instead of an error (details on Day 12).\n- A global var becomes a property of `window` in browsers.\n\nModern rule: **never use var** in new code. Use const, or let when needed.',
      syntax: `if (true) {
  var a = 1;
  let b = 2;
}
console.log(a); // 1   (var leaked out of the block)
// console.log(b); // ReferenceError: b is not defined`,
    },
    {
      heading: 'Comparison table: var vs let vs const',
      content: '- **Scope**: var = function scope; let = block scope; const = block scope\n- **Reassign**: var = yes; let = yes; const = no\n- **Redeclare in same scope**: var = yes; let = no; const = no\n- **Must initialise**: var = no; let = no; const = yes\n- **Use before declaration**: var = gives undefined; let/const = ReferenceError (Temporal Dead Zone, Day 12)\n- **Introduced**: var = 1995; let/const = ES2015',
      points: [
        'Default choice: const',
        'Need to reassign (counters, totals, flags that flip)? let',
        'var: only to understand legacy code',
      ],
    },
    {
      heading: 'Naming rules and conventions',
      content: '**Rules** (breaking them causes a SyntaxError):\n- Names can contain letters, digits, `_` and `$`.\n- A name **cannot start with a digit**: `1name` is invalid, `name1` is fine.\n- No spaces or hyphens: `first-name` is invalid (it looks like subtraction).\n- Cannot be a **reserved keyword**: `let`, `const`, `if`, `for`, `class`, `return`, `function`, `new`, etc.\n- Names are **case-sensitive**: `age`, `Age` and `AGE` are three different variables.\n\n**Conventions** (not enforced, but every professional follows them):\n- Use **camelCase** for variables and functions: `firstName`, `totalPrice`, `isLoggedIn`.\n- Use **UPPER_SNAKE_CASE** for fixed configuration constants: `MAX_USERS`, `API_URL`.\n- Use **meaningful names**: `userAge` beats `x`.\n- Booleans often start with `is`, `has`, `can`: `isAdmin`, `hasPaid`.',
      syntax: `// valid
let firstName = "Asha";
let _count = 0;
let $price = 10;
const MAX_LOGIN_ATTEMPTS = 3;

// invalid
// let 2ndPlace = "B";   // starts with digit
// let first-name = "A"; // hyphen
// let class = "10A";    // reserved word`,
    },
  ],
  examples: [
    {
      title: 'Shopping bill with const and let',
      scenario: 'A shop sells a notebook at a fixed price. The quantity changes as the customer adds more. Calculate the bill each time.',
      steps: [
        'Open the playground',
        'Declare the fixed price with const and the changing quantity with let',
        'Reassign quantity and print the total each time',
        'Click Run and check the totals',
      ],
      code: `const PRICE = 45;
let quantity = 2;
console.log("Total:", PRICE * quantity);

quantity = 5;
console.log("Total:", PRICE * quantity);

quantity += 1;
console.log("Quantity:", quantity, "Total:", PRICE * quantity);`,
      playground: {
        js: `const PRICE = 45;
let quantity = 2;
console.log("Total:", PRICE * quantity);

quantity = 5;
console.log("Total:", PRICE * quantity);

quantity += 1;
console.log("Quantity:", quantity, "Total:", PRICE * quantity);`,
      },
      result: `Total: 90
Total: 225
Quantity: 6 Total: 270`,
      explanation: 'PRICE never changes, so it is a const (in UPPER_SNAKE_CASE because it is a fixed setting). quantity changes, so it is let. quantity += 1 is short for quantity = quantity + 1.',
    },
    {
      title: 'const blocks reassignment but not changes inside an array',
      scenario: 'You keep a list of tasks in a const array. You want to see what is allowed and what throws an error.',
      steps: [
        'Declare const tasks as an array',
        'push a new task (allowed)',
        'Try to reassign tasks inside try/catch so the error is printed instead of stopping the program',
        'Click Run',
      ],
      code: `const tasks = ["Study"];
tasks.push("Exercise");
console.log(tasks.length, tasks.join(", "));

try {
  tasks = ["Sleep"];
} catch (err) {
  console.log(err.name + ": " + err.message);
}`,
      playground: {
        js: `const tasks = ["Study"];
tasks.push("Exercise");
console.log(tasks.length, tasks.join(", "));

try {
  tasks = ["Sleep"];
} catch (err) {
  console.log(err.name + ": " + err.message);
}`,
      },
      result: `2 Study, Exercise
TypeError: Assignment to constant variable.`,
      explanation: 'push changes the array the label points to, which is fine. Writing tasks = [...] tries to point the label at a different array, which const forbids, so a TypeError is thrown. try/catch (covered on Day 29) lets us print the error instead of crashing.',
    },
    {
      title: 'var leaks out of blocks, let does not',
      scenario: 'Show why var is risky: a variable declared inside an if block is still visible outside it.',
      steps: [
        'Write an if block that declares one var and one let',
        'Log both outside the block, using typeof for the let so no error is thrown',
        'Redeclare a var to see that no error happens',
        'Click Run',
      ],
      code: `if (true) {
  var city = "Delhi";
  let pin = 110001;
}
console.log(city);
console.log(typeof pin);

var city = "Mumbai"; // redeclared silently!
console.log(city);`,
      playground: {
        js: `if (true) {
  var city = "Delhi";
  let pin = 110001;
}
console.log(city);
console.log(typeof pin);

var city = "Mumbai"; // redeclared silently!
console.log(city);`,
      },
      result: `Delhi
undefined
Mumbai`,
      explanation: 'city was declared with var, so it ignores the block braces and is visible outside. pin was declared with let, so outside the block it does not exist; typeof on an undeclared name safely returns "undefined" (using pin directly would throw ReferenceError). Finally var allowed redeclaring city without any warning, which is exactly the kind of bug let/const prevent.',
    },
    {
      title: 'Swapping two variables',
      scenario: 'A classic interview task: swap the values of two variables, first with a temporary variable, then with modern array destructuring.',
      steps: [
        'Declare a and b with let (they will be reassigned)',
        'Swap using a temp variable and log',
        'Swap back using [a, b] = [b, a] and log',
        'Click Run',
      ],
      code: `let a = 10;
let b = 20;

let temp = a;
a = b;
b = temp;
console.log("After temp swap:", a, b);

[a, b] = [b, a];
console.log("After destructuring swap:", a, b);`,
      playground: {
        js: `let a = 10;
let b = 20;

let temp = a;
a = b;
b = temp;
console.log("After temp swap:", a, b);

[a, b] = [b, a];
console.log("After destructuring swap:", a, b);`,
      },
      result: `After temp swap: 20 10
After destructuring swap: 10 20`,
      explanation: 'With a temp box we save a, copy b into a, then put the saved value into b. The second way builds a small array [b, a] and unpacks it back into a and b in one line. Destructuring is covered fully on Day 18; here it is just a handy trick.',
    },
  ],
  interview: [
    { q: 'What is a variable in JavaScript?', a: 'A variable is a named reference to a value stored in memory. You declare it with let, const or var and can use the name later to read or (for let/var) update the value.', level: 'Easy' },
    { q: 'What are the differences between var, let and const?', a: 'var is function-scoped, can be redeclared and reassigned, and is hoisted initialised to undefined. let is block-scoped, can be reassigned but not redeclared in the same scope. const is block-scoped, must be initialised, and cannot be reassigned or redeclared. let and const are in the Temporal Dead Zone before their declaration line.', level: 'Easy' },
    { q: 'Can you change an array declared with const?', a: 'Yes, you can change its contents (push, pop, change items) because const only prevents reassigning the variable to a different value. const arr = []; arr.push(1) works, but arr = [2] throws TypeError.', level: 'Medium' },
    { q: 'Why should we avoid var?', a: 'var is not block-scoped (it leaks out of if/for blocks), allows silent redeclaration, is hoisted as undefined so bugs appear as undefined instead of errors, and global vars attach to window. let/const avoid all these problems.', level: 'Medium' },
    { q: 'Which of these names are valid: _user, $el, 2fast, first-name, userName2, class?', a: 'Valid: _user, $el, userName2. Invalid: 2fast (starts with a digit), first-name (hyphen not allowed), class (reserved keyword).', level: 'Easy' },
    { q: 'Output-based: what does this print?\nlet x = 5;\nx = x + 2;\nx += 3;\nconsole.log(x);', a: '10. x becomes 7 after x + 2, then x += 3 makes it 10.', level: 'Easy' },
    { q: 'Output-based: what happens?\nconst n = 1;\nn++;\nconsole.log(n);', a: 'It throws TypeError: Assignment to constant variable. n++ tries to reassign n, which is not allowed for const, so console.log never runs.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nvar a = 1;\n{\n  var a = 2;\n}\nconsole.log(a);\nlet b = 1;\n{\n  let b = 2;\n}\nconsole.log(b);', a: 'It prints:\n2\n1\nThe inner var a is the same variable as the outer one (var ignores blocks), so it is overwritten to 2. The inner let b is a new variable that exists only inside the block, so the outer b stays 1.', level: 'Hard' },
    { q: 'What is the value of a variable declared with let but not assigned?', a: 'undefined. Example: let x; console.log(x); prints undefined.', level: 'Easy' },
    { q: 'What naming convention is used for JavaScript variables?', a: 'camelCase for variables and functions (totalPrice, isLoggedIn), PascalCase for classes and React components (UserCard), and UPPER_SNAKE_CASE for fixed configuration constants (MAX_RETRIES).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Store your name, age and city in variables (choose const or let correctly). Then increase age by 1 for your birthday and print a sentence using the variables.',
      hint: 'Name and city do not change: const. Age changes: let.',
      solution: `const name = "Priya";
const city = "Jaipur";
let age = 22;
age = age + 1;
console.log(name, "is now", age, "and lives in", city);`,
    },
    {
      task: 'Create a const GST_RATE = 0.18 and a let amount = 1000. Calculate tax and final amount. Then change amount to 2500 and calculate again.',
      hint: 'tax = amount * GST_RATE; final = amount + tax',
      solution: `const GST_RATE = 0.18;
let amount = 1000;
console.log("Tax:", amount * GST_RATE, "Final:", amount + amount * GST_RATE);
amount = 2500;
console.log("Tax:", amount * GST_RATE, "Final:", amount + amount * GST_RATE);`,
    },
    {
      task: 'Fix the invalid variable names: let 1stPlayer = "A"; let player-score = 50; let new = true;',
      hint: 'No leading digit, no hyphens, no reserved words.',
      solution: `let firstPlayer = "A";
let playerScore = 50;
let isNew = true;
console.log(firstPlayer, playerScore, isNew);`,
    },
    {
      task: 'Write a counter: start at 0, add 1 three times using three different syntaxes (count = count + 1, count += 1, count++), and print the value after each step.',
      hint: 'The counter must be declared with let.',
      solution: `let count = 0;
count = count + 1;
console.log(count); // 1
count += 1;
console.log(count); // 2
count++;
console.log(count); // 3`,
    },
    {
      task: 'Swap two variables first = "left" and second = "right" without a temporary variable and print them.',
      hint: 'Use [first, second] = [second, first];',
      solution: `let first = "left";
let second = "right";
[first, second] = [second, first];
console.log(first, second); // right left`,
    },
  ],
  quiz: [
    { question: 'Which keyword should be your default choice for declaring variables?', options: ['var', 'let', 'const', 'static'], answer: 2, explanation: 'Use const by default and let only when you need to reassign.' },
    { question: 'What does this do: const x = 5; x = 10;', options: ['x becomes 10', 'TypeError: Assignment to constant variable.', 'x stays 5 silently', 'SyntaxError at x = 10'], answer: 1, explanation: 'Reassigning a const throws a TypeError at runtime.' },
    { question: 'Which variable name is valid?', options: ['user-name', '9lives', '_total$', 'function'], answer: 2, explanation: 'Letters, digits (not first), _ and $ are allowed. Hyphens, leading digits and keywords are not.' },
    { question: 'What is printed? if (true) { var v = 3; } console.log(v);', options: ['ReferenceError', 'undefined', 'null', '3'], answer: 3, explanation: 'var is function-scoped, so v is visible outside the if block.' },
    { question: 'Which statement about const is true?', options: ['Items can be pushed into a const array', 'A const must be all uppercase', 'const variables are function-scoped', 'const can be declared without a value'], answer: 0, explanation: 'const prevents reassignment of the binding, not mutation of the array.' },
  ],
};
