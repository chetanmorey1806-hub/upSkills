export default {
  lesson: 'day-05-type-conversion-coercion',
  minutes: 25,
  intro: 'Convert values explicitly, predict implicit coercion, compare with == vs === and spot falsy values.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these values are **falsy**? (choose all that apply)',
      options: ['0', '"0"', '""', 'null', '[]', 'NaN', 'undefined', '"false"'],
      answers: [0, 2, 3, 5, 6],
      explain: 'The falsy values are `false, 0, -0, 0n, "", null, undefined, NaN`. Everything else is truthy, including the strings `"0"` and `"false"` and the empty array `[]`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Predict the implicit coercion. What is printed?',
      code: `console.log("5" + 3);
console.log("5" - 3);
console.log("5" * "2");
console.log(true + 1);
console.log("abc" * 2);`,
      expected: '53\n2\n10\n2\nNaN',
      explain: '`+` with a string **joins** text ("53"). Other maths operators (`-`, `*`, `/`) convert strings to numbers. `true` becomes 1. A string that is not a number becomes `NaN`.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `console.log(5 == "5");
console.log(5 === "5");
console.log(null == undefined);
console.log(null === undefined);`,
      expected: 'true\nfalse\ntrue\nfalse',
      explain: '`==` converts types before comparing, `===` does not (types must match). `null == undefined` is a special rule that gives true, but they are different types, so `===` gives false. Prefer `===`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `Number("")` return?',
      options: ['NaN', '0', 'undefined', '""'],
      answer: 1,
      explain: 'An empty (or whitespace-only) string converts to **0**, not NaN. This often hides bugs in forms where an empty input becomes 0. `Number("12px")` however gives NaN.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Input boxes always give **strings**. Write `addInputs(a, b)` that converts both strings to numbers and returns their sum.\n\nExample: `addInputs("10", "20")` → `30` (not `"1020"`).',
      example: { title: 'explicit conversion', code: 'const qty = Number("4");  // 4\nconst price = Number("2.5"); // 2.5\nconsole.log(qty * price); // 10' },
      starter: 'function addInputs(a, b) {\n  return a + b; // TODO: fix the bug\n}',
      solution: 'function addInputs(a, b) {\n  return Number(a) + Number(b);\n}',
      tests: [
        { call: 'addInputs("10", "20")', expect: 30 },
        { call: 'addInputs("2.5", "1.5")', expect: 4 },
        { call: 'addInputs("0", "7")', expect: 7 },
      ],
      explain: 'Because `"10" + "20"` joins text into "1020", convert first with `Number()` (or unary `+a`). This is the most common beginner bug with form inputs.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `checkValue(value)` that returns the string `"truthy"` or `"falsy"` for the given value. Use `Boolean()` (or `!!`) with a ternary.',
      example: { title: 'Boolean conversion', code: 'Boolean("hello"); // true\n!!0;              // false' },
      starter: 'function checkValue(value) {\n  // TODO\n}',
      solution: 'function checkValue(value) {\n  return Boolean(value) ? "truthy" : "falsy";\n}',
      tests: [
        { call: 'checkValue(0)', expect: 'falsy' },
        { call: 'checkValue("0")', expect: 'truthy' },
        { call: 'checkValue("")', expect: 'falsy' },
        { call: 'checkValue([])', expect: 'truthy' },
        { call: 'checkValue(null)', expect: 'falsy' },
        { call: 'checkValue(NaN)', expect: 'falsy' },
        { call: 'checkValue("false")', expect: 'truthy' },
      ],
      explain: '`Boolean(x)` applies the truthy/falsy rules. The traps are `"0"`, `"false"` and `[]`: they are all **truthy** because only an empty string is a falsy string and every object (including arrays) is truthy.',
    },
  ],
};
