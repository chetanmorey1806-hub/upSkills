export default {
  lesson: 'day-059-javascript-intro-variables-operators-conditions',
  minutes: 22,
  intro: 'Practise JavaScript basics: let/const, data types, typeof, operators (including === vs ==) and if/else / ternary conditions.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print in the browser console? (one line per console.log)',
      example: { title: 'typeof', code: 'console.log(typeof 42);      // number\nconsole.log(typeof "hi");    // string\nconsole.log(typeof true);    // boolean' },
      code: `let course = "C#";
const days = 120;
let price;
console.log(typeof course);
console.log(typeof days);
console.log(typeof price);
console.log(typeof null);
console.log("5" + 3);
console.log("5" - 3);`,
      expected: `string
number
undefined
object
53
2`,
      explain: 'A declared but unassigned variable is `undefined`. `typeof null` is `"object"` (a famous historical bug). With `+` and a string, JS **concatenates** ("53"); with `-` it converts the string to a number (2). Unlike C#, JavaScript does not stop you mixing types.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with `const gst = 18; gst = 28;`?',
      options: ['gst becomes 28', 'TypeError: Assignment to constant variable', 'gst stays 18 silently', 'It creates a second variable'],
      answer: 1,
      explain: '`const` cannot be reassigned (similar to C# `const`/`readonly`). Use `let` for values that change. Avoid `var`: it is function-scoped and hoisted, which causes surprising bugs.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write a function `calculateTotal(price, qty)` that returns the bill amount **with 18% GST** added: `price * qty * 1.18`, **rounded to 2 decimals** as a number (use `Math.round(x * 100) / 100`).',
      example: { title: 'a simple function with arithmetic', code: 'function area(l, b) {\n  return l * b;\n}\narea(4, 5); // 20' },
      starter: 'function calculateTotal(price, qty) {\n  // TODO\n}\n',
      solution: 'function calculateTotal(price, qty) {\n  const total = price * qty * 1.18;\n  return Math.round(total * 100) / 100;\n}',
      tests: [
        { call: 'calculateTotal(100, 2)', expect: 236 },
        { call: 'calculateTotal(499, 1)', expect: 588.82 },
        { call: 'calculateTotal(0, 5)', expect: 0 },
      ],
      explain: '100 × 2 × 1.18 = 236. Floating-point maths can produce values like 588.8199999…, so round with `Math.round(x * 100) / 100`. (`toFixed(2)` returns a **string**, not a number.)',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `getGrade(marks)` using **if / else if / else**:\n- 90 and above → `"A+"`\n- 75 to 89 → `"A"`\n- 60 to 74 → `"B"`\n- 35 to 59 → `"C"`\n- below 35 → `"Fail"`\n- if marks is less than 0 or greater than 100 → `"Invalid"`',
      example: { title: 'else-if ladder', code: 'function size(n) {\n  if (n > 100) return "big";\n  else if (n > 10) return "medium";\n  else return "small";\n}' },
      starter: 'function getGrade(marks) {\n  // TODO\n}\n',
      solution: 'function getGrade(marks) {\n  if (marks < 0 || marks > 100) return "Invalid";\n  if (marks >= 90) return "A+";\n  else if (marks >= 75) return "A";\n  else if (marks >= 60) return "B";\n  else if (marks >= 35) return "C";\n  else return "Fail";\n}',
      tests: [
        { call: 'getGrade(95)', expect: 'A+' },
        { call: 'getGrade(90)', expect: 'A+' },
        { call: 'getGrade(75)', expect: 'A' },
        { call: 'getGrade(60)', expect: 'B' },
        { call: 'getGrade(35)', expect: 'C' },
        { call: 'getGrade(34)', expect: 'Fail' },
        { call: 'getGrade(105)', expect: 'Invalid' },
        { call: 'getGrade(-1)', expect: 'Invalid' },
      ],
      explain: 'Check invalid input first, then the ranges from highest to lowest so each `else if` only needs a lower bound. Boundaries (90, 75, 60, 35) are where most bugs hide: `>=` vs `>`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `canVote(age, hasVoterId)` that returns `"Eligible"` when age is **18 or more AND** hasVoterId is true; otherwise returns `"Not eligible"`. Use the **ternary operator** `? :`.',
      example: { title: 'ternary', code: 'const label = stock > 0 ? "In stock" : "Sold out";' },
      starter: 'function canVote(age, hasVoterId) {\n  // TODO\n}\n',
      solution: 'function canVote(age, hasVoterId) {\n  return age >= 18 && hasVoterId ? "Eligible" : "Not eligible";\n}',
      tests: [
        { call: 'canVote(18, true)', expect: 'Eligible' },
        { call: 'canVote(30, false)', expect: 'Not eligible' },
        { call: 'canVote(17, true)', expect: 'Not eligible' },
      ],
      explain: '`&&` requires both conditions. The ternary `condition ? a : b` returns one of two values, the same as in C#.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which expressions are **true** in JavaScript? (choose all that apply)',
      options: ['5 == "5"', '5 === "5"', '0 == false', 'null === undefined', '"abc" !== "ABC"', 'NaN === NaN'],
      answers: [0, 2, 4],
      explain: '`==` converts types before comparing (5 == "5", 0 == false), while `===` also compares the type, so `5 === "5"` is false. `null === undefined` is false (different types). `NaN` is never equal to anything, even itself; use `Number.isNaN()`. Prefer `===` always.',
    },
  ],
};
