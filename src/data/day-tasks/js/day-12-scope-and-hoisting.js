export default {
  lesson: 'day-12-scope-and-hoisting',
  minutes: 25,
  intro: 'Predict how scope, the scope chain, hoisting and the Temporal Dead Zone affect your variables.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'Hoisting of var and functions. What is printed?',
      code: `console.log(a);
var a = 5;
console.log(sayHi());
function sayHi() {
  return "Hi";
}`,
      expected: 'undefined\nHi',
      explain: '`var a` is hoisted and initialised with `undefined`, so reading it early gives undefined (the `= 5` happens later). Function declarations are hoisted **with their body**, so `sayHi()` works before its line.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens here?\n```\nconsole.log(total);\nlet total = 10;\n```',
      options: ['Prints undefined', 'Prints 10', 'ReferenceError: Cannot access \'total\' before initialization', 'Prints null'],
      answer: 2,
      explain: '`let` and `const` are hoisted too, but they stay **uninitialised** until their line runs. The time between the start of the scope and that line is the **Temporal Dead Zone (TDZ)**; touching the variable there throws a ReferenceError.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Scope chain and shadowing. What is printed?',
      code: `const city = "Delhi";
function outer() {
  const city = "Pune";
  function inner() {
    console.log(city);
  }
  inner();
}
outer();
console.log(city);`,
      expected: 'Pune\nDelhi',
      explain: '`inner` has no own `city`, so JavaScript looks one level out and finds `outer`\'s "Pune". The inner `city` **shadows** the global one, but only inside `outer`; outside, the global "Delhi" is unchanged.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The classic var-in-loop question. What is printed?',
      code: `for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log("var", i), 0);
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log("let", j), 0);
}`,
      expected: 'var 3\nvar 3\nvar 3\nlet 0\nlet 1\nlet 2',
      explain: '`var` is function-scoped: there is ONE `i`, and when the timers run the loop has finished and `i` is 3. `let` creates a **new binding for every iteration**, so each callback remembers its own `j`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Fix the scope bug. `countPassed(marks)` should return how many marks are 40 or above, but `count` is declared inside the loop block, so it resets every time and is not visible at the `return`. Move the declaration to the right scope.',
      example: { title: 'declare in the scope where you use it', code: 'let sum = 0;            // outside the loop\nfor (const n of [1, 2]) {\n  sum += n;\n}\nconsole.log(sum); // 3' },
      starter: 'function countPassed(marks) {\n  for (const m of marks) {\n    let count = 0;\n    if (m >= 40) count++;\n  }\n  return count;\n}',
      solution: 'function countPassed(marks) {\n  let count = 0;\n  for (const m of marks) {\n    if (m >= 40) count++;\n  }\n  return count;\n}',
      tests: [
        { call: 'countPassed([35, 40, 78, 12, 90])', expect: 3 },
        { call: 'countPassed([])', expect: 0 },
      ],
      explain: 'A `let` inside `{ }` exists only inside that block and is recreated on every loop round. Declaring the counter in the **function scope** (before the loop) lets it keep its value and be returned.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: ['let and const are block-scoped', 'var is block-scoped', 'An inner function can read variables of its outer function', 'An outer function can read variables declared inside an inner function', 'Variables declared without let/const/var in sloppy mode become accidental globals'],
      answers: [0, 2, 4],
      explain: 'Scope lookup goes **outward only**: inner can see outer, never the opposite. `var` is function-scoped (it ignores blocks). Assigning to an undeclared name in non-strict code creates a global, which is why you should always declare variables.',
    },
  ],
};
