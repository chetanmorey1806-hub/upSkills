export default {
  lesson: 'day-060-javascript-loops-functions-arrays-objects',
  minutes: 26,
  intro: 'Practise JavaScript loops, arrow functions, string methods, arrays with map/filter/reduce and objects.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print? (one line per console.log)',
      example: { title: 'map and filter return new arrays', code: 'const n = [1, 2, 3];\nconsole.log(n.map(x => x * 10));   // [ 10, 20, 30 ]\nconsole.log(n.filter(x => x > 1)); // [ 2, 3 ]' },
      code: `const marks = [45, 82, 67, 91, 30];
const passed = marks.filter(m => m >= 35);
const total = marks.reduce((sum, m) => sum + m, 0);
console.log(passed.length);
console.log(total);
console.log(marks.includes(91));
console.log(marks.indexOf(67));
console.log(marks.slice(1, 3).join("-"));`,
      expected: `4
315
true
2
82-67`,
      explain: '`filter` keeps 4 marks ≥ 35, `reduce` adds everything (45 + 82 + 67 + 91 + 30 = 315). `slice(1, 3)` takes indexes 1 and 2 (the end is excluded) and `join("-")` glues them. JS prints booleans as lowercase `true`, unlike C#.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write an **arrow function** `countVowels` that takes a string and returns how many vowels (a, e, i, o, u, upper or lower case) it contains. Use a **loop** (for…of or for).',
      example: { title: 'looping over a string', code: 'const countSpaces = (text) => {\n  let n = 0;\n  for (const ch of text) {\n    if (ch === " ") n++;\n  }\n  return n;\n};' },
      starter: 'const countVowels = (text) => {\n  // TODO\n};\n',
      solution: 'const countVowels = (text) => {\n  let count = 0;\n  for (const ch of text.toLowerCase()) {\n    if ("aeiou".includes(ch)) count++;\n  }\n  return count;\n};',
      tests: [
        { call: 'countVowels("UpSkillr")', expect: 2 },
        { call: 'countVowels("ASP.NET Core")', expect: 4 },
        { call: 'countVowels("rhythm")', expect: 0 },
        { call: 'countVowels("")', expect: 0 },
      ],
      explain: '`for…of` walks through each character. Lower-casing first means you only compare with "aeiou". `"aeiou".includes(ch)` is a short way to check membership.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'You have an array of student objects `{ name, marks }`. Write `topStudents(list)` that returns the **names** of students with marks **≥ 75**, sorted **alphabetically**. Use `filter`, `map` and `sort`.',
      example: { title: 'chaining array methods', code: 'const cheapNames = products\n  .filter(p => p.price < 500)\n  .map(p => p.title)\n  .sort();' },
      starter: 'function topStudents(list) {\n  // TODO\n}\n',
      solution: 'function topStudents(list) {\n  return list\n    .filter((s) => s.marks >= 75)\n    .map((s) => s.name)\n    .sort();\n}',
      tests: [
        { call: 'topStudents([{ name: "Ravi", marks: 80 }, { name: "Asha", marks: 92 }, { name: "Om", marks: 40 }])', expect: ['Asha', 'Ravi'] },
        { call: 'topStudents([{ name: "Meena", marks: 75 }, { name: "Kiran", marks: 74 }])', expect: ['Meena'] },
        { call: 'topStudents([])', expect: [] },
      ],
      explain: 'Filter first (on the objects, while marks are still available), then map to names, then sort. `sort()` without a compare function sorts as strings, which is right for names (for numbers use `sort((a, b) => a - b)`). This is the JS equivalent of LINQ `Where/Select/OrderBy`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Create an object `cart` with:\n- `items`: an empty array\n- `addItem(name, price, qty)`: pushes `{ name, price, qty }` into `items`\n- `total()`: returns the sum of `price * qty` of all items\n- `count()`: returns the total quantity of all items',
      example: { title: 'object with methods', code: 'const wallet = {\n  balance: 0,\n  add(amount) { this.balance += amount; },\n  show() { return this.balance; },\n};' },
      starter: 'const cart = {\n  items: [],\n  // TODO: addItem, total, count\n};\n',
      solution: 'const cart = {\n  items: [],\n  addItem(name, price, qty) {\n    this.items.push({ name, price, qty });\n  },\n  total() {\n    return this.items.reduce((sum, i) => sum + i.price * i.qty, 0);\n  },\n  count() {\n    return this.items.reduce((sum, i) => sum + i.qty, 0);\n  },\n};',
      tests: [
        { call: '(cart.addItem("Pen", 10, 3), cart.addItem("Notebook", 50, 2), cart.total())', expect: 130 },
        { call: '(cart.addItem("Bag", 700, 1), cart.count())', expect: 1 },
        { call: 'cart.total()', expect: 0 },
        { call: '(cart.addItem("Pen", 10, 3), cart.items[0])', expect: { name: 'Pen', price: 10, qty: 3 } },
      ],
      explain: 'Inside a method, `this` refers to the `cart` object, so `this.items` is the shared array. `{ name, price, qty }` is shorthand for `{ name: name, price: price, qty: qty }`. `reduce` with a start value of 0 also works for an empty cart.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Loops with `break` and `continue`, and a `for…in` over an object. What does this print?',
      example: { title: 'for…in gives keys', code: 'const p = { a: 1, b: 2 };\nfor (const k in p) console.log(k + "=" + p[k]);\n// a=1\n// b=2' },
      code: `let out = "";
for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue;
  if (i > 7) break;
  out += i + " ";
}
console.log(out.trim());

const student = { name: "Asha", city: "Pune", year: 2 };
for (const key in student) {
  console.log(key + ": " + student[key]);
}`,
      expected: `1 3 5 7
name: Asha
city: Pune
year: 2`,
      explain: '`continue` skips even numbers; at i = 9, `i > 7` triggers `break`. `for…in` loops over an object\'s **keys** (in insertion order for string keys); `student[key]` reads the value with bracket notation.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about JavaScript arrays/functions are TRUE? (choose all that apply)',
      options: [
        'map returns a new array of the same length',
        'forEach returns a new array',
        'push adds to the end and returns the new length',
        'Arrow functions can be written as (a, b) => a + b',
        'const arr = [1, 2]; arr.push(3); is an error because arr is const',
      ],
      answers: [0, 2, 3],
      explain: '`forEach` returns `undefined`; use `map` when you need a new array. `const` prevents **reassigning** the variable, not changing the array\'s contents, so `push` on a const array is fine.',
    },
  ],
};
