export default {
  lesson: 'day-02-variables-var-let-const',
  minutes: 25,
  intro: 'Practise declaring variables with let and const, see why var is avoided, and follow naming rules.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You store the **GST rate (18)** that never changes in your program. Which declaration is best?',
      options: ['var gstRate = 18;', 'let gstRate = 18;', 'const gstRate = 18;', 'gstRate = 18;'],
      answer: 2,
      explain: 'Use **const** for values that are never reassigned. It protects you from accidentally changing them. `let` is for values that change (like a running total). `var` is the old way and writing without a keyword creates an accidental global.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid** variable names in JavaScript? (choose all that apply)',
      options: ['studentName', '2ndPlace', '_count', '$price', 'total-marks', 'let'],
      answers: [0, 2, 3],
      explain: 'Names may contain letters, digits, `_` and `$`, but **cannot start with a digit**, cannot contain `-` (that is minus) and cannot be reserved words like `let`. Use camelCase such as `studentName`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `const marks = [70, 80];
marks.push(90);
console.log(marks.length);

let city = "Pune";
city = "Mumbai";
console.log(city);`,
      expected: '3\nMumbai',
      explain: '`const` stops **reassignment** of the variable, but the array it points to can still change, so `push` works and the length becomes 3. `let` allows reassignment, so `city` becomes "Mumbai".',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed? (`var` vs `let` in a block)',
      code: `if (true) {
  var a = "var leaks";
  let b = "let stays";
}
console.log(a);
console.log(typeof b);`,
      expected: 'var leaks\nundefined',
      explain: '`var` ignores block `{ }` scope, so `a` is visible outside the `if`. `let` is **block-scoped**, so `b` does not exist outside; `typeof` of an undeclared name safely gives "undefined" instead of throwing.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Shopping bill: complete the function `billTotal(price, qty)`.\n- Store the GST rate **0.18** in a `const`\n- Use a `let` variable `total` that starts as `price * qty`\n- Add the GST to `total` and **return** it',
      example: { title: 'const + let working together', code: 'const discount = 50;\nlet amount = 500;\namount = amount - discount; // 450' },
      starter: 'function billTotal(price, qty) {\n  // TODO: const gst = ...\n  // TODO: let total = ...\n  // TODO: add GST and return total\n}',
      solution: 'function billTotal(price, qty) {\n  const gst = 0.18;\n  let total = price * qty;\n  total = total + total * gst;\n  return total;\n}',
      tests: [
        { call: 'billTotal(100, 2)', expect: 236 },
        { call: 'billTotal(50, 1)', expect: 59 },
        { call: 'billTotal(0, 5)', expect: 0 },
      ],
      explain: 'The rate never changes so it is `const`; the total changes so it is `let`. 100 × 2 = 200, plus 18% (36) = 236. A common mistake is declaring `total` with `const` and then trying to reassign it, which throws a TypeError.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Swap two values. Complete `swap(a, b)` so it **returns an array** `[b, a]` after swapping the two variables using a temporary variable (or any other method).',
      example: { title: 'using a temp variable', code: 'let cup1 = "tea", cup2 = "coffee";\nlet temp = cup1;\ncup1 = cup2;\ncup2 = temp;' },
      starter: 'function swap(a, b) {\n  // TODO: swap a and b\n  return [a, b];\n}',
      solution: 'function swap(a, b) {\n  let temp = a;\n  a = b;\n  b = temp;\n  return [a, b];\n}',
      tests: [
        { call: 'swap(1, 2)', expect: [2, 1] },
        { call: 'swap("Asha", "Ravi")', expect: ['Ravi', 'Asha'] },
      ],
      explain: 'Without a temporary variable, `a = b` would overwrite `a` and lose its value. Save it in `temp` first. (You can also write `[a, b] = [b, a]`, which you will learn properly on the destructuring day.)',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the variable name **total marks of student** in camelCase.',
      accept: ['totalMarksOfStudent'],
      caseSensitive: true,
      explain: 'camelCase starts with a lowercase letter and every following word starts with a capital: `totalMarksOfStudent`. JavaScript is case-sensitive, so `TotalMarks` and `totalmarks` are different variables.',
    },
  ],
};
