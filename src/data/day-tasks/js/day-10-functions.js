export default {
  lesson: 'day-10-functions',
  minutes: 25,
  intro: 'Write function declarations, expressions and arrow functions that return values, and pass functions as callbacks.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'return vs console.log. What is printed?',
      code: `function add(a, b) {
  console.log(a + b);
}
const result = add(2, 3);
console.log(result);`,
      expected: '5\nundefined',
      explain: '`add` **prints** 5 but does not `return` anything, so the call evaluates to `undefined`. If you want to use the result later, the function must `return` it.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which call works **before** the function is defined in the file?',
      options: ['A function declaration: function greet() {}', 'A function expression: const greet = function () {}', 'An arrow function: const greet = () => {}', 'None of them'],
      answer: 0,
      explain: 'Function **declarations** are hoisted completely, so you can call them above their definition. Expressions and arrow functions stored in `const` are not available before that line (ReferenceError).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Rewrite `function square(n) { return n * n; }` as a **one-line arrow function** stored in `const square`.',
      accept: ['const square = n => n * n', 'const square = (n) => n * n', 'const square = n => n * n;', 'const square = (n) => n * n;', 'const square = (n) => { return n * n; }', 'const square = n => { return n * n; }', 'const square = (n) => { return n * n }'],
      explain: 'With one expression, an arrow function returns it **implicitly**: `n => n * n`. If you use curly braces you must write `return` yourself; `(n) => { n * n }` returns undefined.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write three versions of the same function:\n- a **declaration** `areaDecl(l, w)`\n- an **expression** `areaExpr` (using `function`)\n- an **arrow** function `areaArrow`\n\nAll return the area of a rectangle (`l * w`).',
      example: { title: 'three styles', code: 'function hi1(n) { return "Hi " + n; }\nconst hi2 = function (n) { return "Hi " + n; };\nconst hi3 = (n) => "Hi " + n;' },
      starter: '// TODO: areaDecl, areaExpr, areaArrow\n',
      solution: 'function areaDecl(l, w) {\n  return l * w;\n}\nconst areaExpr = function (l, w) {\n  return l * w;\n};\nconst areaArrow = (l, w) => l * w;',
      tests: [
        { call: 'areaDecl(4, 5)', expect: 20 },
        { call: 'areaExpr(3, 7)', expect: 21 },
        { call: 'areaArrow(10, 2)', expect: 20 },
      ],
      explain: 'All three create a function value. The differences: declarations are hoisted, expressions are not, and arrow functions have a shorter syntax (and no own `this`, which you will see on Day 17).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `calculateEMI(principal, ratePerMonth, months)` that returns the simple monthly amount: `(principal + principal * ratePerMonth * months) / months`, rounded with `Math.round`.',
      example: { title: 'parameters in, value out', code: 'function percent(part, whole) {\n  return (part / whole) * 100;\n}\npercent(45, 50); // 90' },
      starter: 'function calculateEMI(principal, ratePerMonth, months) {\n  // TODO\n}',
      solution: 'function calculateEMI(principal, ratePerMonth, months) {\n  const total = principal + principal * ratePerMonth * months;\n  return Math.round(total / months);\n}',
      tests: [
        { call: 'calculateEMI(12000, 0.01, 12)', expect: 1120 },
        { call: 'calculateEMI(5000, 0.02, 10)', expect: 600 },
      ],
      explain: 'Parameters (`principal`, `ratePerMonth`, `months`) are placeholders; arguments are the real values passed in the call. Breaking the formula into a named `total` variable keeps it readable. Brackets matter: dividing only `principal * ratePerMonth * months` by months gives a wrong answer.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Functions are values. Write `applyTwice(fn, value)` that calls the callback `fn` on `value`, then calls `fn` again on that result, and returns the final result.',
      example: { title: 'passing a function', code: 'function run(fn) {\n  return fn(10);\n}\nrun((x) => x + 1); // 11' },
      starter: 'function applyTwice(fn, value) {\n  // TODO\n}',
      solution: 'function applyTwice(fn, value) {\n  return fn(fn(value));\n}',
      tests: [
        { call: 'applyTwice((x) => x * 2, 5)', expect: 20 },
        { call: 'applyTwice((s) => s + "!", "Hi")', expect: 'Hi!!' },
      ],
      explain: 'A function passed as an argument is a **callback**. Call it with `fn(value)` (with brackets). Passing or returning `fn` without brackets just hands over the function itself instead of calling it.',
    },
  ],
};
