const helloHtml = `<h1 id="title">Hello from HTML</h1>
<p>Open the console panel below (in a real browser: F12 > Console).</p>
<button onclick="greet()">Click me</button>`;

const helloJs = `// Single-line comment
/* Multi-line
   comment */
console.log('Hello, JavaScript!');
console.log('2 + 3 =', 2 + 3);
console.log('Title text:', document.getElementById('title').textContent);

function greet() {
  console.log('Button clicked');
  alert('Welcome to Day 59!');
}`;

const varsJs = `// var (old, function-scoped), let (can change), const (cannot be reassigned)
var college = 'Skyline';
let age = 21;
const PI = 3.14159;
age = 22;                 // allowed with let
// PI = 3;                // TypeError: Assignment to constant variable.

// Primitive data types
let studentName = 'Riya';      // string
let marks = 88.5;              // number (integers and decimals are the same type)
let isPassed = true;           // boolean
let address;                   // undefined (declared, no value)
let phone = null;              // null (intentionally empty)
let bigId = 9007199254740993n; // bigint
let id = Symbol('id');         // symbol

console.log(typeof studentName, typeof marks, typeof isPassed);
console.log(typeof address, typeof phone, typeof bigId, typeof id);

// Reference types
let subjects = ['C#', 'SQL', 'JS'];
let student = { name: 'Riya', age: age };
console.log(typeof subjects, Array.isArray(subjects), typeof student);
console.log(typeof function () {});

// Template literal (backticks) and dynamic typing
let info = \`\${studentName} is \${age} years old and scored \${marks}\`;
console.log(info);
let x = 10;
x = 'ten';                     // same variable can hold another type
console.log(x, typeof x);
console.log(college, PI);`;

const opsJs = `let a = 17, b = 5;
// Arithmetic
console.log('a + b =', a + b);
console.log('a - b =', a - b);
console.log('a * b =', a * b);
console.log('a / b =', a / b);
console.log('a % b =', a % b);
console.log('a ** 2 =', a ** 2);

// Increment / assignment
let count = 5;
console.log('count++ ->', count++, 'now', count);
console.log('++count ->', ++count);
count += 10; count -= 2; count *= 2;
console.log('after += -= *= :', count);

// String concatenation vs number conversion
console.log('5' + 3, '5' - 3, '5' * '2', Number('5') + 3);
console.log(0.1 + 0.2, (0.1 + 0.2).toFixed(2));

// Comparison: == converts types, === does not
console.log(5 == '5', 5 === '5', 5 != '5', 5 !== '5');
console.log(null == undefined, null === undefined);
console.log(10 > 9, '10' > '9', 10 > '9');

// Logical
let age = 20, hasId = false;
console.log(age >= 18 && hasId, age >= 18 || hasId, !hasId);

// Truthy / falsy, ?? and ternary
console.log(Boolean(''), Boolean('0'), Boolean(0), Boolean([]));
let nick = '' || 'Guest';
let score = 0 ?? 100;
console.log(nick, score);
console.log(age >= 18 ? 'Adult' : 'Minor');`;

const condJs = `function getGrade(marks) {
  if (marks < 0 || marks > 100) {
    return 'Invalid marks';
  } else if (marks >= 90) {
    return 'A+';
  } else if (marks >= 75) {
    return 'A';
  } else if (marks >= 60) {
    return 'B';
  } else if (marks >= 35) {
    return 'C';
  } else {
    return 'Fail';
  }
}
[95, 80, 61, 35, 20, 105].forEach(function (m) {
  console.log(m + ' -> ' + getGrade(m));
});

// Nested if
let age = 25, hasLicence = true;
if (age >= 18) {
  if (hasLicence) {
    console.log('You can drive');
  } else {
    console.log('Get a licence first');
  }
} else {
  console.log('Too young to drive');
}

// switch (uses ===)
function dayName(n) {
  switch (n) {
    case 1: return 'Monday';
    case 2: return 'Tuesday';
    case 3: return 'Wednesday';
    case 6:
    case 7: return 'Weekend';
    default: return 'Other day';
  }
}
console.log(dayName(1), dayName(7), dayName('1'));

// Ternary chain: even / odd / zero
let n = 0;
console.log(n === 0 ? 'Zero' : n % 2 === 0 ? 'Even' : 'Odd');`;

const calcHtml = `<div class="calc">
  <h2>Calculator</h2>
  <input type="number" id="num1" placeholder="First number">
  <select id="op">
    <option value="+">+ Add</option>
    <option value="-">- Subtract</option>
    <option value="*">x Multiply</option>
    <option value="/">/ Divide</option>
    <option value="%">% Modulus</option>
  </select>
  <input type="number" id="num2" placeholder="Second number">
  <button id="calcBtn">Calculate</button>
  <div id="result" class="result">Result will appear here</div>
</div>`;

const calcCss = `body { font-family: "Segoe UI", Arial, sans-serif; background: #f1f5f9; }
.calc { max-width: 300px; margin: 20px auto; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,.1); }
.calc h2 { margin-top: 0; text-align: center; color: #1e3a8a; }
.calc input, .calc select, .calc button { display: block; width: 100%; box-sizing: border-box; margin: 8px 0; padding: 10px; font-size: 16px; border: 1px solid #cbd5e1; border-radius: 6px; }
.calc button { background: #2563eb; color: white; border: none; cursor: pointer; }
.calc button:hover { background: #1d4ed8; }
.result { margin-top: 10px; padding: 12px; text-align: center; font-weight: 600; background: #eff6ff; border-radius: 6px; }
.error { background: #fee2e2; color: #b91c1c; }`;

const calcCoreJs = `function calculate(a, b, op) {
  if (isNaN(a) || isNaN(b)) {
    return 'Please enter both numbers';
  }
  let result;
  switch (op) {
    case '+': result = a + b; break;
    case '-': result = a - b; break;
    case '*': result = a * b; break;
    case '/':
      if (b === 0) return 'Cannot divide by zero';
      result = a / b;
      break;
    case '%':
      if (b === 0) return 'Cannot divide by zero';
      result = a % b;
      break;
    default: return 'Unknown operator';
  }
  // round to at most 2 decimals, without trailing zeros
  return Math.round(result * 100) / 100;
}`;

const calcDomJs = calcCoreJs + `

document.getElementById('calcBtn').addEventListener('click', function () {
  const a = parseFloat(document.getElementById('num1').value);
  const b = parseFloat(document.getElementById('num2').value);
  const op = document.getElementById('op').value;
  const answer = calculate(a, b, op);
  const box = document.getElementById('result');
  if (typeof answer === 'string') {
    box.textContent = answer;
    box.className = 'result error';
  } else {
    box.textContent = a + ' ' + op + ' ' + b + ' = ' + answer;
    box.className = 'result';
  }
  console.log(box.textContent);
});

// quick self-test in the console
console.log(calculate(12, 4, '+'), calculate(12, 4, '-'), calculate(12, 4, '*'), calculate(10, 3, '/'), calculate(10, 3, '%'));
console.log(calculate(5, 0, '/'));
console.log(calculate(NaN, 2, '+'));`;

export default {
  id: 'day-059-javascript-intro-variables-operators-conditions',
  title: 'JavaScript Introduction, Variables, Data Types, Operators and Conditions',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 59,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Start programming the browser: what JavaScript is and where to put it, the console, var/let/const, primitive and reference data types, arithmetic/comparison/logical operators (and why === beats ==), if/else, switch and the ternary operator; then build a working calculator.',
  objectives: [
    'Explain what JavaScript does and add it with <script> tags or an external .js file',
    'Declare variables with let and const and identify the 7 primitive types with typeof',
    'Use arithmetic, assignment, comparison, logical, ?? and ternary operators correctly',
    'Write decisions with if / else if / else, nested if and switch',
    'Build a calculator that reads inputs, validates them and shows the result',
  ],
  theory: [
    {
      heading: 'What is JavaScript and where does it go?',
      content: "**JavaScript (JS)** is the programming language of the web browser: HTML = structure, CSS = presentation, JS = behaviour (react to clicks, validate forms, call APIs, update the page). It is interpreted/JIT-compiled by the browser engine (V8 in Chrome/Edge), is dynamically typed and is **not** related to Java. With **Node.js** it also runs on servers.\n\nWays to add JS:\n1. **Internal**: `<script> ... </script>`, usually just before `</body>` so the HTML is already loaded.\n2. **External** (best): `<script src=\"js/site.js\"></script>`. ASP.NET Core MVC templates already have `wwwroot/js/site.js` linked at the end of `_Layout.cshtml`. With `defer` it can go in `<head>`.\n3. Inline event attribute: `<button onclick=\"greet()\">` (fine for demos, avoid in real apps).\n\nOutput: `console.log()` (F12 > Console), `alert()`, `prompt()`, `confirm()`, or change the page via the DOM (Day 61).",
      syntax: '<script src="js/site.js" defer></script>\n\n// site.js\nconsole.log("Hello");',
      tip: 'Statements end with ; (optional but recommended). JS is case-sensitive: myName and myname are different variables.',
    },
    {
      heading: 'Variables: var, let, const',
      content: "- `let`: value can change; **block-scoped** (lives only inside its `{ }`).\n- `const`: cannot be reassigned; also block-scoped; must be initialised. Objects/arrays declared with const can still have their contents changed.\n- `var`: old (pre-2015); **function-scoped**, can be redeclared, is hoisted as `undefined`. Avoid it.\n\nRule: use `const` by default, `let` when the value must change, never `var`.\n\nNaming: camelCase (`studentName`), start with a letter, `_` or `$`, no reserved words (`class`, `let`, `return`).",
      syntax: 'const maxMarks = 100;\nlet total = 0;\ntotal = total + 85;',
    },
    {
      heading: 'Data types and typeof',
      content: "JS is **dynamically typed**: the type belongs to the value, not the variable.\n\n**7 primitive types** (immutable, copied by value): `string` ('Riya', \"Riya\", `Riya`), `number` (integers AND decimals, plus `NaN`, `Infinity`), `boolean`, `undefined` (declared but no value), `null` (intentionally empty), `bigint` (`123n`), `symbol`.\n\n**Reference type**: `object` (including arrays, functions, dates); copied by reference.\n\n`typeof` returns the type as a string. Quirks to remember: `typeof null` is `'object'` (historic bug), `typeof []` is `'object'` (use `Array.isArray`), `typeof function(){}` is `'function'`.\n\nConversion: `Number('42')`, `parseInt('42px')` = 42, `parseFloat('3.5')`, `String(42)`, `(42).toString()`, `Boolean(x)`. Invalid numbers give `NaN`; test with `isNaN()` or `Number.isNaN()`.\n\n**Template literals** use backticks and `${expression}`: `Hello ${name}` (just like C# `$\"Hello {name}\"`).",
    },
    {
      heading: 'Operators',
      content: "- **Arithmetic**: `+ - * / % **` (`**` = power). `/` always gives decimals: `17 / 5` = 3.4.\n- **Increment/decrement**: `x++` (use then add), `++x` (add then use), `x--`.\n- **Assignment**: `= += -= *= /= %=`.\n- **String +**: if either side is a string, `+` concatenates: `'5' + 3` = `'53'`, but `'5' - 3` = 2.\n- **Comparison**: `> < >= <=`, `==` / `!=` (loose, converts types: `5 == '5'` is true), `===` / `!==` (strict, type and value: `5 === '5'` is false). **Always use === in real code.**\n- **Logical**: `&&` (AND), `||` (OR), `!` (NOT). They short-circuit and return one of the operands.\n- **Falsy values**: `false, 0, '', null, undefined, NaN` (and `0n`). Everything else is truthy, including `'0'` and `[]`.\n- `a || b`: b if a is falsy; `a ?? b` (nullish coalescing): b only if a is null/undefined.\n- **Ternary**: `condition ? valueIfTrue : valueIfFalse`.",
      tip: '0.1 + 0.2 is 0.30000000000000004 (binary floating point, same as double in C#). Round for display with toFixed(2).',
    },
    {
      heading: 'Conditions: if, else if, else, switch',
      content: "- `if (condition) { ... }` runs the block when the condition is truthy.\n- `else if` chains are checked top to bottom; the first true branch runs.\n- `else` handles everything else.\n- Nested ifs: an if inside another if.\n- `switch (value)` compares with **===** against each `case`; `break` stops fall-through; `default` is the else. Grouped cases share code.\n- Ternary for short choices, but do not nest too deeply (hard to read).",
      syntax: 'if (marks >= 35) {\n  console.log("Pass");\n} else {\n  console.log("Fail");\n}\n\nswitch (op) {\n  case "+": result = a + b; break;\n  default: result = NaN;\n}',
      tip: 'Compared with C#: switch in JS can switch on any value (strings, numbers) but uses strict equality, so switch(\'1\') does not match case 1.',
    },
  ],
  examples: [
    {
      title: 'First script: console, comments and a click',
      scenario: 'Add JavaScript to a page, print to the console and react to a button click.',
      steps: ['In VS Code create index.html and js/app.js', 'Link the script before </body>: <script src="js/app.js"></script>', 'Write console.log statements and a greet function', 'Open with Live Server, press F12 > Console, click the button'],
      code: '<!-- index.html -->\n' + helloHtml + '\n<script src="js/app.js"></script>\n\n// js/app.js\n' + helloJs,
      playground: { html: helloHtml, css: 'body { font-family: "Segoe UI", Arial, sans-serif; }', js: helloJs },
      result: 'Console:\nHello, JavaScript!\n2 + 3 = 5\nTitle text: Hello from HTML\nClicking the button logs "Button clicked" and shows an alert "Welcome to Day 59!".',
      explanation: 'console.log accepts several values separated by commas and prints them with spaces. Because the script runs after the HTML, getElementById finds the h1.',
    },
    {
      title: 'Variables and data types',
      scenario: 'Store student details in variables and inspect their types.',
      steps: ['Create variables.js', 'Declare with var, let and const', 'Print typeof for each value', 'Run it in the playground, or in a terminal with: node variables.js'],
      code: varsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: varsJs },
      result: 'string number boolean\nundefined object bigint symbol\nobject true object\nfunction\nRiya is 22 years old and scored 88.5\nten string\nSkyline 3.14159',
      explanation: 'typeof null is "object" (a known JS bug kept for compatibility) and arrays are objects, so use Array.isArray. The template literal inserts values with ${...}. The variable x first held a number and then a string: dynamic typing.',
    },
    {
      title: 'Operators in action',
      scenario: 'Predict each output before running: arithmetic, ++, string conversion, == vs ===, logical, truthy/falsy, ?? and ternary.',
      steps: ['Create operators.js', 'Write each group of operators', 'Predict the output on paper', 'Run: node operators.js or use the playground console'],
      code: opsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: opsJs },
      result: "a + b = 22\na - b = 12\na * b = 85\na / b = 3.4\na % b = 2\na ** 2 = 289\ncount++ -> 5 now 6\n++count -> 7\nafter += -= *= : 30\n53 2 10 8\n0.30000000000000004 0.30\ntrue false false true\ntrue false\ntrue false true\nfalse true true\nfalse true false true\nGuest 0\nAdult",
      explanation: "'5' + 3 concatenates to '53' but '5' - 3 converts to numbers. '10' > '9' compares strings character by character ('1' < '9') so it is false, while 10 > '9' converts to numbers. '' || 'Guest' uses the fallback because '' is falsy; 0 ?? 100 keeps 0 because 0 is not null/undefined. count: 7 + 10 - 2 = 15, x2 = 30.",
    },
    {
      title: 'Conditions: grades, nested if and switch',
      scenario: 'Convert marks to a grade, check driving eligibility and map day numbers to names.',
      steps: ['Create conditions.js', 'Write getGrade with an else-if ladder', 'Add the nested if and the switch with grouped cases', 'Run and compare with the expected output'],
      code: condJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: condJs },
      result: '95 -> A+\n80 -> A\n61 -> B\n35 -> C\n20 -> Fail\n105 -> Invalid marks\nYou can drive\nMonday Weekend Other day\nZero',
      explanation: "The invalid check comes first so 105 does not become A+. Order matters in else-if ladders: test the highest range first. dayName('1') hits default because switch uses === and '1' (string) is not 1 (number).",
    },
    {
      title: 'Project: Calculator',
      scenario: 'Day 59 task: read two numbers and an operator from the page, validate, calculate with switch and show the result (with errors in red).',
      steps: ['Create calculator.html with two number inputs, a select and a button', 'Write calculate(a, b, op) with switch and checks for NaN and division by zero', 'On button click read .value, convert with parseFloat, call calculate and show the answer', 'Test 12 + 4, 10 / 3, 5 / 0 and an empty input'],
      code: '<!-- calculator.html -->\n' + calcHtml + '\n\n// calculator.js\n' + calcDomJs,
      playground: { html: calcHtml, css: calcCss, js: calcDomJs },
      result: 'Console on load:\n16 8 48 3.33 1\nCannot divide by zero\nPlease enter both numbers\nOn the page: entering 12, + and 4 and clicking Calculate shows "12 + 4 = 16"; 5 / 0 shows "Cannot divide by zero" in a red box; an empty field shows "Please enter both numbers".',
      explanation: 'Input values are always strings, so parseFloat converts them (an empty input gives NaN). Without conversion "12" + "4" would be "124". Math.round(x * 100) / 100 rounds 3.333... to 3.33.',
    },
  ],
  interview: [
    { q: 'What is JavaScript and how is it different from Java?', a: 'JavaScript is a dynamically typed, interpreted/JIT-compiled scripting language that runs in browsers (and Node.js) to add behaviour to web pages. Java is a statically typed, compiled, class-based language running on the JVM. They are unrelated apart from the name.', level: 'Easy' },
    { q: 'Difference between var, let and const?', a: 'var is function-scoped, hoisted with undefined and can be redeclared. let and const are block-scoped and in the temporal dead zone before declaration. const cannot be reassigned (but object contents can change).', level: 'Medium' },
    { q: 'List the primitive data types in JavaScript.', a: 'string, number, boolean, undefined, null, bigint, symbol. Everything else is an object.', level: 'Easy' },
    { q: 'What is typeof null and why?', a: '"object". It is a bug from the first JS implementation kept for backward compatibility. Check null with value === null.', level: 'Medium' },
    { q: '== vs ===?', a: '== compares after type coercion (5 == "5" is true); === compares type and value without coercion (5 === "5" is false). Prefer ===.', level: 'Easy' },
    { q: 'null vs undefined?', a: 'undefined means a variable was declared but not assigned (or a missing property/argument); null is an explicit "no value" assigned by the programmer. null == undefined is true, null === undefined is false.', level: 'Medium' },
    { q: 'Output of: console.log("5" + 3, "5" - 3, true + 1)?', a: '53 2 2. + with a string concatenates; - converts to numbers; true converts to 1.', level: 'Medium' },
    { q: 'What are falsy values?', a: 'false, 0, -0, 0n, "" (empty string), null, undefined and NaN. Everything else (including "0", [], {}) is truthy.', level: 'Medium' },
    { q: '|| vs ??', a: 'a || b returns b when a is any falsy value; a ?? b returns b only when a is null or undefined, so 0 ?? 5 is 0 but 0 || 5 is 5.', level: 'Medium' },
    { q: 'Why is 0.1 + 0.2 !== 0.3?', a: 'Numbers are IEEE-754 binary doubles; 0.1 and 0.2 cannot be represented exactly, so the sum is 0.30000000000000004. Round (toFixed) or compare with a tolerance (Number.EPSILON).', level: 'Hard' },
    { q: 'Output: let x = 5; console.log(x++ + ++x);', a: '12. x++ returns 5 (x becomes 6), then ++x makes x 7 and returns 7; 5 + 7 = 12.', level: 'Hard' },
    { q: 'Does switch use == or ===?', a: 'Strict equality (===), so case 1 does not match "1".', level: 'Medium' },
  ],
  practice: [
    { task: 'Even or odd: print whether a number is even or odd using the ternary operator.', hint: 'n % 2 === 0.', solution: 'const n = 7;\nconsole.log(n % 2 === 0 ? n + " is even" : n + " is odd");  // 7 is odd' },
    { task: 'Largest of three numbers using if / else if.', hint: 'Compare with &&.', solution: 'const a = 12, b = 45, c = 30;\nlet max;\nif (a >= b && a >= c) max = a;\nelse if (b >= a && b >= c) max = b;\nelse max = c;\nconsole.log("Largest:", max);  // Largest: 45' },
    { task: 'Check a leap year: divisible by 4 and not by 100, or divisible by 400.', hint: 'Combine && and ||.', solution: 'function isLeap(y) { return (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0; }\nconsole.log(isLeap(2024), isLeap(1900), isLeap(2000));  // true false true' },
    { task: 'Electricity bill: first 100 units at 5, next 100 at 7, above 200 at 10 per unit. Compute for 250 units.', hint: 'Else-if on ranges, add slabs.', solution: 'const units = 250;\nlet bill;\nif (units <= 100) bill = units * 5;\nelse if (units <= 200) bill = 100 * 5 + (units - 100) * 7;\nelse bill = 100 * 5 + 100 * 7 + (units - 200) * 10;\nconsole.log("Bill:", bill);  // Bill: 1700' },
    { task: 'Extend the calculator with a ** (power) option and a Clear button that empties inputs and the result.', hint: 'Add case "**" and set .value = "" on click.', solution: '// HTML: <option value="**">^ Power</option> and <button id="clearBtn">Clear</button>\n// in switch: case "**": result = a ** b; break;\ndocument.getElementById("clearBtn").addEventListener("click", function () {\n  document.getElementById("num1").value = "";\n  document.getElementById("num2").value = "";\n  document.getElementById("result").textContent = "Result will appear here";\n});' },
  ],
  quiz: [
    { question: 'Which keyword declares a variable that cannot be reassigned?', options: ['var', 'let', 'const', 'static'], answer: 2, explanation: 'const prevents reassignment.' },
    { question: 'What is the output of typeof [1, 2, 3]?', options: ['"object"', '"array"', '"list"', '"undefined"'], answer: 0, explanation: 'Arrays are objects; use Array.isArray to detect them.' },
    { question: 'What does "10" + 5 evaluate to?', options: ['15', '"105"', 'NaN', 'Error'], answer: 1, explanation: 'With a string operand + concatenates.' },
    { question: 'Which of these is truthy?', options: ['0', '""', 'null', '"0"'], answer: 3, explanation: 'A non-empty string, even "0", is truthy.' },
    { question: 'What does 5 === "5" return?', options: ['true', 'Error', 'undefined', 'false'], answer: 3, explanation: 'Strict equality compares type too: number vs string.' },
  ],
};
