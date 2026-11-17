const loopsJs = `// for: multiplication table of 7 (first 5 rows)
for (let i = 1; i <= 5; i++) {
  console.log('7 x ' + i + ' = ' + 7 * i);
}

// while: sum of digits of 4815
let num = 4815, sum = 0;
while (num > 0) {
  sum += num % 10;
  num = Math.floor(num / 10);
}
console.log('Sum of digits:', sum);

// do...while runs at least once
let attempts = 0;
do {
  attempts++;
} while (attempts < 0);
console.log('do-while ran', attempts, 'time(s)');

// for...of: values of an array (or characters of a string)
const subjects = ['C#', 'SQL', 'JS'];
for (const s of subjects) {
  console.log('Subject:', s);
}

// for...in: keys of an object
const student = { name: 'Riya', age: 21, city: 'Pune' };
for (const key in student) {
  console.log(key + ' = ' + student[key]);
}

// break and continue: odd numbers 1..15, stop at the first number above 10
let odds = '';
for (let n = 1; n <= 15; n++) {
  if (n % 2 === 0) continue;   // skip even
  if (n > 10) break;           // stop the loop
  odds += n + ' ';
}
console.log('Odd numbers:', odds.trim());

// nested loop: star triangle
for (let row = 1; row <= 4; row++) {
  let line = '';
  for (let col = 1; col <= row; col++) line += '* ';
  console.log(line.trim());
}`;

const funcsJs = `// 1. Function declaration (hoisted: can be called before it is written)
console.log(add(2, 3));
function add(a, b) {
  return a + b;
}

// 2. Function expression
const subtract = function (a, b) {
  return a - b;
};

// 3. Arrow functions
const multiply = (a, b) => a * b;          // implicit return
const square = n => n * n;                 // one parameter: no brackets needed
const greet = () => 'Hello!';
const describe = (name, marks) => {
  const result = marks >= 35 ? 'passed' : 'failed';
  return name + ' ' + result;
};
console.log(subtract(10, 4), multiply(3, 4), square(9), greet());
console.log(describe('Arjun', 72), '|', describe('Kabir', 20));

// 4. Default parameters and missing arguments
function welcome(name = 'Guest', course = '.NET') {
  return 'Welcome ' + name + ' to ' + course;
}
console.log(welcome('Neha', 'React'));
console.log(welcome());
console.log(add(5));             // b is undefined -> NaN

// 5. Scope: block-scoped let inside the function
let counter = 100;
function demoScope() {
  let counter = 1;                // different variable (shadows the outer one)
  if (true) { let inner = 'inside block'; console.log(inner); }
  return counter;
}
console.log(demoScope(), counter);

// 6. Callback: passing a function to another function
function calculate(a, b, operation) {
  return operation(a, b);
}
console.log(calculate(6, 7, multiply), calculate(6, 7, (x, y) => x + y));

// 7. Recursion: factorial
const factorial = n => (n <= 1 ? 1 : n * factorial(n - 1));
console.log('5! =', factorial(5));`;

const stringsJs = `const name = '  Riya Sharma  ';
const clean = name.trim();
console.log('[' + clean + ']', clean.length);
console.log(clean.toUpperCase(), clean.toLowerCase());
console.log(clean.charAt(0), clean[5], clean.at(-1));
console.log(clean.indexOf('Sharma'), clean.includes('Riya'), clean.startsWith('Ri'), clean.endsWith('ma'));
console.log(clean.slice(0, 4), clean.substring(5), clean.slice(-6));
console.log(clean.replace('Riya', 'Priya'), 'a-b-c'.replaceAll('-', '+'));
console.log('C#,SQL,JS'.split(','));
console.log('5'.padStart(3, '0'), 'ab'.repeat(3));

// Reverse a string and check palindrome
const reverse = s => s.split('').reverse().join('');
console.log(reverse('dotnet'));
const isPalindrome = s => {
  const t = s.toLowerCase().replaceAll(' ', '');
  return t === reverse(t);
};
console.log(isPalindrome('Madam'), isPalindrome('Never odd or even'), isPalindrome('Hello'));

// Count vowels
let vowels = 0;
for (const ch of 'Full Stack Developer'.toLowerCase()) {
  if ('aeiou'.includes(ch)) vowels++;
}
console.log('Vowels:', vowels);

// Template literal
const course = 'ASP.NET Core', days = 15;
console.log(\`\${course} takes \${days} days (\${days * 2} hours of labs)\`);`;

const arraysJs = `const marks = [78, 92, 45, 66, 30];
console.log('length:', marks.length, 'first:', marks[0], 'last:', marks[marks.length - 1]);

// Adding / removing
const list = ['C#', 'SQL'];
list.push('JS');            // end
list.unshift('HTML');       // start
console.log(list);
console.log(list.pop(), list.shift(), list);
const langs = ['a', 'b', 'c', 'd', 'e'];
langs.splice(1, 2, 'X');    // remove 2 items from index 1 and insert 'X'
console.log(langs, langs.slice(1, 3));
console.log(marks.indexOf(45), marks.includes(100), marks.join(' | '));

// forEach
marks.forEach((m, i) => console.log('Student ' + (i + 1) + ': ' + m));

// map, filter, reduce, find, findIndex, some, every
const withGrace = marks.map(m => m + 5);
const passed = marks.filter(m => m >= 35);
const total = marks.reduce((sum, m) => sum + m, 0);
console.log('map +5:', withGrace);
console.log('filter >=35:', passed);
console.log('reduce total:', total, 'average:', total / marks.length);
console.log('find >90:', marks.find(m => m > 90), 'findIndex <35:', marks.findIndex(m => m < 35));
console.log('some <35:', marks.some(m => m < 35), 'every >=30:', marks.every(m => m >= 30));
console.log('max:', Math.max(...marks), 'min:', Math.min(...marks));

// sort: numbers need a compare function!
console.log([10, 9, 100, 1].sort());
console.log([10, 9, 100, 1].sort((a, b) => a - b));
console.log([...marks].sort((a, b) => b - a), 'original kept:', marks);

// chaining
const result = marks.filter(m => m >= 35).map(m => m * 2).reduce((a, b) => a + b, 0);
console.log('chained:', result);`;

const objectsJs = `// Object literal with properties and a method
const student = {
  id: 101,
  name: 'Riya',
  marks: { csharp: 88, sql: 92, js: 79 },
  skills: ['C#', 'SQL'],
  getTotal: function () {
    return this.marks.csharp + this.marks.sql + this.marks.js;
  },
};
console.log(student.name, student['id'], student.marks.sql, student.skills[1]);
console.log('Total:', student.getTotal());

// add, update, delete properties
student.city = 'Pune';
student.name = 'Riya Sharma';
delete student.id;
console.log(Object.keys(student));
console.log('has city?', 'city' in student, '| email:', student.email);

// Object.values / Object.entries
console.log(Object.values(student.marks));
for (const [subject, m] of Object.entries(student.marks)) {
  console.log(subject + ': ' + m);
}

// Objects are copied by reference
const copyRef = student;
copyRef.city = 'Mumbai';
console.log('student.city after changing copyRef:', student.city);

// Array of objects (like rows from a database / JSON from an API)
const employees = [
  { name: 'Asha', dept: 'IT', salary: 65000 },
  { name: 'Ravi', dept: 'HR', salary: 42000 },
  { name: 'Meena', dept: 'IT', salary: 72000 },
  { name: 'John', dept: 'Sales', salary: 50000 },
];
const itNames = employees.filter(e => e.dept === 'IT').map(e => e.name);
const payroll = employees.reduce((sum, e) => sum + e.salary, 0);
const top = employees.reduce((best, e) => (e.salary > best.salary ? e : best));
console.log('IT team:', itNames);
console.log('Payroll:', payroll, '| Top earner:', top.name);
const sorted = [...employees].sort((a, b) => a.name.localeCompare(b.name)).map(e => e.name);
console.log('Sorted by name:', sorted);`;

const marksHtml = `<div class="app">
  <h2>Student Marks Calculator</h2>
  <div class="form">
    <input id="name" placeholder="Student name">
    <input id="csharp" type="number" min="0" max="100" placeholder="C#">
    <input id="sql" type="number" min="0" max="100" placeholder="SQL">
    <input id="js" type="number" min="0" max="100" placeholder="JS">
    <button id="add">Add</button>
  </div>
  <p id="msg" class="msg"></p>
  <table>
    <thead><tr><th>Name</th><th>C#</th><th>SQL</th><th>JS</th><th>Total</th><th>%</th><th>Grade</th></tr></thead>
    <tbody id="rows"></tbody>
  </table>
  <p id="summary" class="summary"></p>
</div>`;

const marksCss = `body { font-family: "Segoe UI", Arial, sans-serif; background: #f8fafc; }
.app { max-width: 680px; margin: 10px auto; background: white; padding: 16px; border-radius: 10px; box-shadow: 0 4px 14px rgba(0,0,0,.08); }
.app h2 { margin-top: 0; color: #1e3a8a; }
.form { display: flex; flex-wrap: wrap; gap: 6px; }
.form input { flex: 1 1 90px; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.form #name { flex-basis: 160px; }
.form button { padding: 8px 16px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; }
.msg { color: #b91c1c; min-height: 1em; }
table { width: 100%; border-collapse: collapse; }
th, td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; text-align: center; }
th { background: #eff6ff; }
td:first-child, th:first-child { text-align: left; }
tr.fail td { color: #b91c1c; }
.summary { font-weight: 600; background: #f0fdf4; padding: 8px; border-radius: 6px; }`;

const marksCoreJs = `const students = [
  { name: 'Riya', marks: [88, 92, 79] },
  { name: 'Arjun', marks: [65, 58, 72] },
  { name: 'Kabir', marks: [30, 41, 25] },
];

function getTotal(marks) {
  return marks.reduce((sum, m) => sum + m, 0);
}
function getPercentage(marks) {
  return Math.round((getTotal(marks) / (marks.length * 100)) * 10000) / 100;
}
function getGrade(marks) {
  if (marks.some(m => m < 35)) return 'Fail';
  const p = getPercentage(marks);
  if (p >= 85) return 'A+';
  if (p >= 70) return 'A';
  if (p >= 60) return 'B';
  return 'C';
}
function getSummary(list) {
  const passed = list.filter(s => getGrade(s.marks) !== 'Fail');
  const topper = list.reduce((best, s) => (getTotal(s.marks) > getTotal(best.marks) ? s : best));
  const classAvg = list.reduce((sum, s) => sum + getPercentage(s.marks), 0) / list.length;
  return 'Students: ' + list.length + ' | Passed: ' + passed.length + ' | Topper: ' + topper.name +
         ' | Class average: ' + classAvg.toFixed(2) + '%';
}`;

const marksDomJs = marksCoreJs + `

function render() {
  const rows = students.map(s => {
    const grade = getGrade(s.marks);
    return '<tr class="' + (grade === 'Fail' ? 'fail' : '') + '"><td>' + s.name + '</td>' +
      s.marks.map(m => '<td>' + m + '</td>').join('') +
      '<td>' + getTotal(s.marks) + '</td><td>' + getPercentage(s.marks) + '</td><td>' + grade + '</td></tr>';
  });
  document.getElementById('rows').innerHTML = rows.join('');
  document.getElementById('summary').textContent = getSummary(students);
}

document.getElementById('add').addEventListener('click', () => {
  const name = document.getElementById('name').value.trim();
  const marks = ['csharp', 'sql', 'js'].map(id => Number(document.getElementById(id).value));
  const msg = document.getElementById('msg');
  if (name === '') { msg.textContent = 'Enter a name'; return; }
  if (marks.some(m => isNaN(m) || m < 0 || m > 100)) { msg.textContent = 'Marks must be 0 to 100'; return; }
  msg.textContent = '';
  students.push({ name: name, marks: marks });
  render();
  console.log('Added ' + name + ': total ' + getTotal(marks) + ', grade ' + getGrade(marks));
});

render();
students.forEach(s => console.log(s.name + ': total ' + getTotal(s.marks) + ', ' + getPercentage(s.marks) + '%, ' + getGrade(s.marks)));
console.log(getSummary(students));`;

export default {
  id: 'day-060-javascript-loops-functions-arrays-objects',
  title: 'JavaScript Loops, Functions, Arrays, Strings, Objects and Array Methods',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 60,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Repeat work with for, while, do-while, for...of and for...in; organise code into functions (declarations, expressions, arrow functions, default parameters, callbacks); process text with string methods; store lists in arrays and records in objects; and master map, filter, reduce, find, some, every and sort. Then build a student marks calculator.',
  objectives: [
    'Choose the right loop and use break and continue',
    'Write function declarations, expressions and arrow functions with parameters, defaults and return values',
    'Use common string methods (trim, slice, split, replace, includes...)',
    'Create and modify arrays and use forEach, map, filter, reduce, find, some, every and sort',
    'Model data as objects and arrays of objects and process them like database rows',
  ],
  theory: [
    {
      heading: 'Loops',
      content: "- `for (init; condition; update)`: when you know how many times.\n- `while (condition)`: repeats while true; may run zero times.\n- `do { } while (condition)`: runs at least once.\n- `for (const item of array)`: loops over **values** of arrays, strings, Maps, Sets (like C# `foreach`).\n- `for (const key in object)`: loops over **keys** (property names) of an object. Do not use for...in on arrays.\n- `break` exits the loop; `continue` skips to the next iteration.\n- Array method `arr.forEach(fn)` is another way to loop (cannot break).",
      syntax: 'for (let i = 0; i < 5; i++) { console.log(i); }\nfor (const s of students) { console.log(s); }\nfor (const key in obj) { console.log(key, obj[key]); }',
      tip: 'An infinite loop (condition never false) freezes the browser tab. Always make sure the loop variable changes.',
    },
    {
      heading: 'Functions',
      content: "A function is a reusable block of code (like a C# method).\n- **Declaration**: `function add(a, b) { return a + b; }`, hoisted (can be called before its line).\n- **Expression**: `const add = function (a, b) { ... };` not hoisted.\n- **Arrow function** (ES6): `const add = (a, b) => a + b;` One expression = implicit return; with `{ }` you need `return`. One parameter needs no brackets: `n => n * 2`. Arrow functions do not have their own `this`.\n- **Parameters vs arguments**: missing arguments are `undefined`; extra ones are ignored. **Default parameters**: `function f(x = 10)`.\n- No `return` means the function returns `undefined`.\n- **Scope**: variables declared inside a function/block are local; inner code can read outer variables (closure).\n- **Callback**: a function passed to another function (`setTimeout(fn, 1000)`, `arr.map(fn)`, event listeners).\n- Functions are values: store them in variables, pass and return them.",
    },
    {
      heading: 'Strings and string methods',
      content: "Strings are immutable; methods return NEW strings.\n- `length`, `[i]`, `charAt(i)`, `at(-1)` (last char)\n- `toUpperCase()`, `toLowerCase()`, `trim()`, `trimStart()`, `trimEnd()`\n- `indexOf()`, `lastIndexOf()`, `includes()`, `startsWith()`, `endsWith()`\n- `slice(start, end)` (negative allowed), `substring(start, end)`\n- `replace(a, b)` (first match), `replaceAll(a, b)`\n- `split(',')` string to array, `array.join(',')` array to string\n- `padStart(3, '0')`, `repeat(n)`\n- Template literals: `` `Hello ${name}` ``, multi-line strings allowed.",
    },
    {
      heading: 'Arrays',
      content: "An array is an ordered list: `const marks = [78, 92, 45];` index starts at 0, `marks.length` gives the count, items can be any type.\n\n**Mutating methods** (change the array): `push` (add end), `pop` (remove end), `unshift` (add start), `shift` (remove start), `splice(start, deleteCount, ...items)`, `sort`, `reverse`.\n\n**Non-mutating**: `slice(start, end)`, `concat`, `indexOf`, `includes`, `join`, spread copy `[...arr]`.\n\n`const` arrays can still be changed with push etc.; only reassignment is blocked.",
      tip: 'sort() converts items to strings by default, so [10, 9, 100, 1].sort() gives [1, 10, 100, 9]. Always pass (a, b) => a - b for numbers.',
    },
    {
      heading: 'Array methods: forEach, map, filter, reduce and friends',
      content: "These take a callback `(item, index, array) => ...` and are the JS version of C# LINQ:\n- `forEach(fn)`: run code for each item (returns nothing).\n- `map(fn)`: NEW array with each item transformed (LINQ `Select`).\n- `filter(fn)`: NEW array with items where fn returns true (LINQ `Where`).\n- `reduce((acc, item) => ..., start)`: combine all items into one value: sum, max, object (LINQ `Aggregate`/`Sum`).\n- `find(fn)` / `findIndex(fn)`: first matching item / its index (`FirstOrDefault`); undefined / -1 if none.\n- `some(fn)` (`Any`), `every(fn)` (`All`).\n- `sort(compareFn)`: `(a, b) => a - b` ascending, `b - a` descending, `a.name.localeCompare(b.name)` for text.\n- Methods can be **chained**: `marks.filter(...).map(...).reduce(...)`.",
      syntax: 'const total = students\n  .filter(s => s.marks >= 35)\n  .map(s => s.marks)\n  .reduce((sum, m) => sum + m, 0);',
    },
    {
      heading: 'Objects',
      content: "An object groups related data as **key: value** pairs (properties) plus functions (methods).\n- Create: `const s = { name: 'Riya', age: 21 };`\n- Read: dot `s.name` or bracket `s['name']` (bracket for dynamic keys: `s[key]`).\n- Add/update: `s.city = 'Pune'`; delete: `delete s.age`. Missing property = `undefined`.\n- Methods use `this` to refer to the object (use a normal function, not an arrow, for methods).\n- `Object.keys(o)`, `Object.values(o)`, `Object.entries(o)`; `'key' in o`.\n- Objects (and arrays) are **reference types**: `const b = a` copies the reference, so changing b changes a. Copy with `{ ...a }`.\n- **Array of objects** is exactly what you will receive as JSON from your ASP.NET Core Web API (Module 8).",
    },
  ],
  examples: [
    {
      title: 'All loop types',
      scenario: 'Multiplication table, digit sum, do-while, for...of, for...in, break/continue and a star pattern.',
      steps: ['Create loops.js', 'Write each loop', 'Run in the playground or in a terminal with: node loops.js', 'Change the limits and observe'],
      code: loopsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: loopsJs },
      result: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\nSum of digits: 18\ndo-while ran 1 time(s)\nSubject: C#\nSubject: SQL\nSubject: JS\nname = Riya\nage = 21\ncity = Pune\nOdd numbers: 1 3 5 7 9\n*\n* *\n* * *\n* * * *',
      explanation: '4+8+1+5 = 18. The do-while body ran once although the condition was false from the start. continue skips even numbers; the loop breaks at 11, so only 1-9 are collected.',
    },
    {
      title: 'Functions: declaration, expression, arrow, defaults, callbacks',
      scenario: 'Write the same kind of logic in every function style and see hoisting, default parameters, scope and callbacks.',
      steps: ['Create functions.js', 'Call add() before its declaration to see hoisting', 'Write expression and arrow versions', 'Pass functions as arguments to calculate()', 'Run and check the output'],
      code: funcsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: funcsJs },
      result: '5\n6 12 81 Hello!\nArjun passed | Kabir failed\nWelcome Neha to React\nWelcome Guest to .NET\nNaN\ninside block\n1 100\n42 13\n5! = 120',
      explanation: 'add works before its definition because declarations are hoisted. add(5) gives 5 + undefined = NaN. The inner counter shadows the outer one, which stays 100. calculate receives a function and calls it.',
    },
    {
      title: 'String methods, reverse and palindrome',
      scenario: 'Clean up a name, search and cut strings, reverse text, check palindromes and count vowels.',
      steps: ['Create strings.js', 'Try each string method', 'Write reverse and isPalindrome as arrow functions', 'Run and compare'],
      code: stringsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: stringsJs },
      result: "[Riya Sharma] 11\nRIYA SHARMA riya sharma\nR S a\n5 true true true\nRiya Sharma Sharma\nPriya Sharma a+b+c\n[ 'C#', 'SQL', 'JS' ]\n005 ababab\ntentod\ntrue true false\nVowels: 6\nASP.NET Core takes 15 days (30 hours of labs)\n(Output shown as printed by node; the playground console prints arrays/objects as JSON, e.g. [\"C#\",\"SQL\",\"JS\"].)",
      explanation: "trim removes outer spaces so the length is 11. slice(-6) takes the last 6 characters. split('') + reverse() + join('') reverses a string. 'Full Stack Developer' has u, a, e, e, o, e = 6 vowels.",
    },
    {
      title: 'Arrays and array methods',
      scenario: 'Manage a marks list: add/remove items, then use map, filter, reduce, find, some, every and sort.',
      steps: ['Create arrays.js', 'Try push/pop/shift/unshift/splice/slice', 'Use the callback methods on the marks array', 'Notice the sort() trap with numbers', 'Run and compare'],
      code: arraysJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: arraysJs },
      result: "length: 5 first: 78 last: 30\n[ 'HTML', 'C#', 'SQL', 'JS' ]\nJS HTML [ 'C#', 'SQL' ]\n[ 'a', 'X', 'd', 'e' ] [ 'X', 'd' ]\n2 false 78 | 92 | 45 | 66 | 30\nStudent 1: 78\nStudent 2: 92\nStudent 3: 45\nStudent 4: 66\nStudent 5: 30\nmap +5: [ 83, 97, 50, 71, 35 ]\nfilter >=35: [ 78, 92, 45, 66 ]\nreduce total: 311 average: 62.2\nfind >90: 92 findIndex <35: 4\nsome <35: true every >=30: true\nmax: 92 min: 30\n[ 1, 10, 100, 9 ]\n[ 1, 9, 10, 100 ]\n[ 92, 78, 66, 45, 30 ] original kept: [ 78, 92, 45, 66, 30 ]\nchained: 562\n(Output shown as printed by node; the playground console prints arrays as JSON, e.g. [83,97,50,71,35].)",
      explanation: 'splice(1, 2, "X") removed b and c and inserted X. map/filter return new arrays; reduce starts at 0 and adds each mark (311). Default sort compares as strings ("100" < "9"). Copying with [...marks] before sorting keeps the original order. Chained: (78+92+45+66) x 2 = 562.',
    },
    {
      title: 'Objects and arrays of objects',
      scenario: 'Model a student with nested marks and a method, then query an employee list like a database table.',
      steps: ['Create objects.js', 'Create the student object and call its method', 'Add, update and delete properties; loop with Object.entries', 'Filter, map, reduce and sort the employees array', 'Run and compare'],
      code: objectsJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: objectsJs },
      result: "Riya 101 92 SQL\nTotal: 259\n[ 'name', 'marks', 'skills', 'getTotal', 'city' ]\nhas city? true | email: undefined\n[ 88, 92, 79 ]\ncsharp: 88\nsql: 92\njs: 79\nstudent.city after changing copyRef: Mumbai\nIT team: [ 'Asha', 'Meena' ]\nPayroll: 229000 | Top earner: Meena\nSorted by name: [ 'Asha', 'John', 'Meena', 'Ravi' ]\n(Output shown as printed by node; the playground console prints arrays as JSON, e.g. [\"Asha\",\"Meena\"].)",
      explanation: 'this inside getTotal refers to student. Deleting id removes it from Object.keys; new keys are added at the end. copyRef points to the same object, so the change is visible through student. The employee queries are the JS equivalent of LINQ Where/Select/Sum/MaxBy/OrderBy.',
    },
    {
      title: 'Project: Student marks calculator',
      scenario: 'Day 60 task: keep students in an array of objects, compute total, percentage and grade with functions and array methods, show a table and a class summary, and add new students from a form.',
      steps: ['Create marks.html with inputs for name and three subjects, a table and a summary paragraph', 'Store students as [{ name, marks: [..] }]', 'Write getTotal (reduce), getPercentage, getGrade (some + if) and getSummary (filter + reduce)', 'Render rows with map + join into tbody.innerHTML', 'Add a student, e.g. Neha 90 85 95, and watch the table and summary update'],
      code: '<!-- marks.html -->\n' + marksHtml + '\n\n// marks.js\n' + marksDomJs,
      playground: { html: marksHtml, css: marksCss, js: marksDomJs },
      result: 'A table with Riya (88, 92, 79, 259, 86.33, A+), Arjun (65, 58, 72, 195, 65, B) and Kabir in red (30, 41, 25, 96, 32, Fail) and the summary line.\nConsole:\nRiya: total 259, 86.33%, A+\nArjun: total 195, 65%, B\nKabir: total 96, 32%, Fail\nStudents: 3 | Passed: 2 | Topper: Riya | Class average: 61.11%\nAdding Neha with 90, 85, 95 logs "Added Neha: total 270, grade A+" and the summary becomes "Students: 4 | Passed: 3 | Topper: Neha | Class average: 68.33%".',
      explanation: 'A student fails if any subject is below 35 (some). Percentage = total / 300 x 100 rounded to 2 decimals. The class average is (86.33 + 65 + 32) / 3 = 61.11. DOM details (innerHTML, events) are covered fully on Day 61.',
    },
  ],
  interview: [
    { q: 'for...of vs for...in?', a: 'for...of iterates values of iterables (arrays, strings, Maps, Sets). for...in iterates enumerable property keys of an object (and for arrays gives string indexes, so avoid it there).', level: 'Easy' },
    { q: 'Function declaration vs function expression?', a: 'Declarations are hoisted completely and can be called before they appear; expressions (assigned to a variable) are only available after that line runs.', level: 'Medium' },
    { q: 'What are arrow functions and how are they different?', a: 'Shorter syntax (x => x * 2) with implicit return for single expressions. They do not have their own this, arguments or prototype and cannot be used as constructors, so do not use them as object methods that need this.', level: 'Medium' },
    { q: 'map vs forEach?', a: 'map returns a new array of transformed values; forEach returns undefined and is used only for side effects.', level: 'Easy' },
    { q: 'Explain reduce with an example.', a: 'reduce combines array items into one value using an accumulator: [1, 2, 3].reduce((sum, n) => sum + n, 0) returns 6. The second argument is the initial accumulator.', level: 'Medium' },
    { q: 'Output of [10, 1, 5, 100].sort()?', a: '[1, 10, 100, 5]: default sort compares strings. Use sort((a, b) => a - b) for numeric order.', level: 'Medium' },
    { q: 'slice vs splice?', a: 'slice(start, end) returns a copy of part of the array without changing it; splice(start, deleteCount, ...items) changes the original by removing/inserting items and returns the removed items.', level: 'Medium' },
    { q: 'find vs filter?', a: 'find returns the first matching element (or undefined); filter returns an array of all matches (possibly empty).', level: 'Easy' },
    { q: 'Dot notation vs bracket notation?', a: 'obj.name for fixed valid identifiers; obj["first-name"] or obj[variable] for keys with special characters or dynamic keys.', level: 'Easy' },
    { q: 'What happens: const a = {x: 1}; const b = a; b.x = 2; console.log(a.x)?', a: '2. Objects are reference types; a and b point to the same object. Use { ...a } or structuredClone(a) to copy.', level: 'Medium' },
    { q: 'How do you reverse a string in JavaScript?', a: 'str.split("").reverse().join("") (or [...str].reverse().join("") to handle emoji correctly).', level: 'Easy' },
    { q: 'Which array methods correspond to LINQ Where, Select, Any, All, FirstOrDefault?', a: 'filter, map, some, every, find.', level: 'Medium' },
  ],
  practice: [
    { task: 'Print the multiplication table of any number from 1 to 10 using a for loop.', hint: 'for (let i = 1; i <= 10; i++).', solution: 'const n = 9;\nfor (let i = 1; i <= 10; i++) {\n  console.log(n + " x " + i + " = " + n * i);\n}' },
    { task: 'Write isPrime(n) and print all primes between 1 and 50.', hint: 'Check divisors up to Math.sqrt(n).', solution: 'function isPrime(n) {\n  if (n < 2) return false;\n  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return false;\n  return true;\n}\nconst primes = [];\nfor (let i = 1; i <= 50; i++) if (isPrime(i)) primes.push(i);\nconsole.log(primes.join(" "));\n// 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47' },
    { task: 'Print the first 10 Fibonacci numbers using an array.', hint: 'Start with [0, 1] and push the sum of the last two.', solution: 'const fib = [0, 1];\nwhile (fib.length < 10) fib.push(fib[fib.length - 1] + fib[fib.length - 2]);\nconsole.log(fib.join(", "));  // 0, 1, 1, 2, 3, 5, 8, 13, 21, 34' },
    { task: 'Given products [{name, price, qty}], print the cart total and the names of items costing more than 500.', hint: 'reduce with price * qty; filter + map.', solution: 'const cart = [\n  { name: "Mouse", price: 450, qty: 2 },\n  { name: "Keyboard", price: 1200, qty: 1 },\n  { name: "USB Cable", price: 150, qty: 3 },\n];\nconst total = cart.reduce((s, p) => s + p.price * p.qty, 0);\nconst costly = cart.filter(p => p.price > 500).map(p => p.name);\nconsole.log(total, costly);  // 2550 [ "Keyboard" ]' },
    { task: 'Count how many times each word appears in a sentence.', hint: 'split(" ") and an object as a counter.', solution: 'const text = "the cat and the dog and the bird";\nconst counts = {};\nfor (const w of text.split(" ")) counts[w] = (counts[w] || 0) + 1;\nconsole.log(counts);  // { the: 3, cat: 1, and: 2, dog: 1, bird: 1 }' },
    { task: 'Extend the marks calculator: add a "Sort by total" button and a "Show toppers" button (percentage >= 85).', hint: 'students.sort((a, b) => getTotal(b.marks) - getTotal(a.marks)); filter for toppers.', solution: '// <button id="sortBtn">Sort by total</button> <button id="topBtn">Show toppers</button>\ndocument.getElementById("sortBtn").addEventListener("click", () => {\n  students.sort((a, b) => getTotal(b.marks) - getTotal(a.marks));\n  render();\n});\ndocument.getElementById("topBtn").addEventListener("click", () => {\n  const toppers = students.filter(s => getPercentage(s.marks) >= 85).map(s => s.name);\n  alert("Toppers: " + (toppers.join(", ") || "none"));\n});' },
  ],
  quiz: [
    { question: 'What does [1, 2, 3].map(n => n * 2) return?', options: ['[2, 4, 6]', '12', '[1, 2, 3]', 'undefined'], answer: 0, explanation: 'map returns a new array with each element transformed.' },
    { question: 'Which loop always runs its body at least once?', options: ['for', 'while', 'for...of', 'do...while'], answer: 3, explanation: 'do...while checks the condition after the body.' },
    { question: 'What does [5, 12, 8].filter(n => n > 6) return?', options: ['[5]', '[12, 8]', '12', 'true'], answer: 1, explanation: 'filter keeps elements where the callback returns true.' },
    { question: 'What does "JavaScript".slice(0, 4) return?', options: ['"Java"', '"JavaS"', '"Script"', '"ava"'], answer: 0, explanation: 'slice(0, 4) takes indexes 0, 1, 2, 3.' },
    { question: 'What is returned by a function that has no return statement?', options: ['null', '0', 'undefined', 'An error'], answer: 2, explanation: 'Functions without return give undefined.' },
  ],
};
