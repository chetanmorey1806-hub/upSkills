export default {
  lesson: 'day-07-numbers-and-math',
  minutes: 25,
  intro: 'Round, format and parse numbers, fix floating-point surprises and validate numeric input.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `console.log(Math.round(4.5));
console.log(Math.floor(-4.5));
console.log(Math.ceil(4.1));
console.log(Math.trunc(-4.9));
console.log(Math.max(3, 9, 2));`,
      expected: '5\n-5\n5\n-4\n9',
      explain: '`round` goes to the nearest integer (x.5 rounds up). `floor` always goes **down** (-4.5 → -5), `ceil` always goes up, and `trunc` just cuts off the decimals (-4.9 → -4).',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `console.log(parseInt("42px"));
console.log(parseFloat("3.75kg"));
console.log(Number("42px"));
console.log((0.1 + 0.2).toFixed(2));
console.log(typeof (9.5).toFixed(1));`,
      expected: '42\n3.75\nNaN\n0.30\nstring',
      explain: '`parseInt`/`parseFloat` read digits from the start and stop at the first invalid character; `Number` needs the whole string to be numeric. `toFixed` returns a **string**, so convert it back with `Number()` before doing more maths.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is `0.1 + 0.2 === 0.3` **false** in JavaScript?',
      options: ['Because JavaScript has a bug in its + operator', 'Because numbers are stored in binary floating-point, so 0.1 and 0.2 cannot be stored exactly', 'Because 0.3 is a string', 'Because === does not work with numbers'],
      answer: 1,
      explain: 'Numbers are 64-bit binary floating-point (IEEE 754). Many decimals like 0.1 cannot be represented exactly, so `0.1 + 0.2` is `0.30000000000000004`. Round money values (or work in paise as integers).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Shopping bill: write `finalBill(amount)` that adds **18% GST** to `amount` and returns the result rounded to **2 decimals as a number** (not a string).',
      example: { title: 'rounding to 2 decimals', code: 'Number((12.3456).toFixed(2)); // 12.35\nMath.round(12.3456 * 100) / 100; // 12.35' },
      starter: 'function finalBill(amount) {\n  // TODO\n}',
      solution: 'function finalBill(amount) {\n  return Number((amount * 1.18).toFixed(2));\n}',
      tests: [
        { call: 'finalBill(100)', expect: 118 },
        { call: 'finalBill(99.99)', expect: 117.99 },
        { call: 'finalBill(10.5)', expect: 12.39 },
        { call: 'typeof finalBill(50)', expect: 'number' },
      ],
      explain: '`toFixed(2)` rounds but returns a string like "117.99"; wrapping it in `Number()` gives a real number. Returning the plain string is the usual mistake, and so is forgetting to round at all (99.99 × 1.18 = 117.9882).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `randomInt(min, max)` that returns a random **whole number** between `min` and `max` (both included). Use `Math.random()` and `Math.floor()`.',
      example: { title: 'random dice', code: 'Math.floor(Math.random() * 6) + 1; // 1 to 6' },
      starter: 'function randomInt(min, max) {\n  // TODO\n}',
      solution: 'function randomInt(min, max) {\n  return Math.floor(Math.random() * (max - min + 1)) + min;\n}',
      tests: [
        { call: '(() => { for (let i = 0; i < 500; i++) { const r = randomInt(5, 10); if (r < 5 || r > 10 || !Number.isInteger(r)) return false; } return true; })()', expect: true, msg: 'Always an integer between 5 and 10' },
        { call: '(() => { const seen = {}; for (let i = 0; i < 2000; i++) seen[randomInt(1, 3)] = true; return Object.keys(seen).sort().join(","); })()', expect: '1,2,3', msg: 'Can return min and max (1, 2 and 3 all appear)' },
        { call: 'randomInt(7, 7)', expect: 7 },
      ],
      explain: '`Math.random()` gives 0 (inclusive) to 1 (exclusive). Multiply by the **count** of possible values `(max - min + 1)`, floor it, then shift by `min`. Forgetting the `+ 1` means `max` can never appear.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Validate a quantity typed by the user. Write `isValidQty(text)` that returns `true` only if `Number(text)` is a **whole number greater than 0**. Use `Number.isInteger`.',
      example: { title: 'number checks', code: 'Number.isNaN(Number("abc")); // true\nNumber.isInteger(4.0);        // true\nNumber.isInteger(4.5);        // false' },
      starter: 'function isValidQty(text) {\n  // TODO\n}',
      solution: 'function isValidQty(text) {\n  const n = Number(text);\n  return Number.isInteger(n) && n > 0;\n}',
      tests: [
        { call: 'isValidQty("3")', expect: true },
        { call: 'isValidQty("2.5")', expect: false },
        { call: 'isValidQty("abc")', expect: false },
        { call: 'isValidQty("0")', expect: false },
        { call: 'isValidQty("-4")', expect: false },
      ],
      explain: '`Number("abc")` is NaN and `Number.isInteger(NaN)` is false, so one check rejects text and decimals. Add `n > 0` to reject zero and negatives. Note: comparing `n === NaN` never works; use `Number.isNaN`.',
    },
  ],
};
