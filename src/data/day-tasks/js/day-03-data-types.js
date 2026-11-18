export default {
  lesson: 'day-03-data-types',
  minutes: 25,
  intro: 'Identify primitive and reference types, use typeof correctly, and tell null and undefined apart.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **primitive** types in JavaScript? (choose all that apply)',
      options: ['string', 'number', 'boolean', 'array', 'undefined', 'bigint', 'object'],
      answers: [0, 1, 2, 4, 5],
      explain: 'The 7 primitives are **string, number, boolean, undefined, null, bigint and symbol**. Arrays and functions are special kinds of **object**, which is the reference type.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `typeof null` return?',
      options: ['"null"', '"undefined"', '"object"', '"number"'],
      answer: 2,
      explain: '`typeof null` is **"object"**. This is a famous bug from the first version of JavaScript that can never be fixed. To check for null, compare directly: `value === null`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `console.log(typeof 42);
console.log(typeof "42");
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof [1, 2]);
console.log(typeof function () {});`,
      expected: 'number\nstring\nboolean\nundefined\nobject\nfunction',
      explain: 'Arrays are objects, so `typeof [1, 2]` is "object" (use `Array.isArray` to detect arrays). Functions are also objects, but `typeof` reports them as "function".',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Copy by value vs copy by reference. What is printed?',
      code: `let a = 10;
let b = a;
b = 20;
console.log(a);

const s1 = { name: "Asha" };
const s2 = s1;
s2.name = "Ravi";
console.log(s1.name);`,
      expected: '10\nRavi',
      explain: 'Primitives are **copied by value**: `b` gets its own copy, so `a` stays 10. Objects are **copied by reference**: `s1` and `s2` point to the same object, so changing `s2.name` also changes what `s1` sees.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `getType(value)` that returns a correct type name:\n- `"null"` for `null`\n- `"array"` for arrays\n- otherwise whatever `typeof` returns',
      example: { title: 'checking types', code: 'Array.isArray([1, 2]);  // true\ntypeof "hi";            // "string"\nlet x = null;\nx === null;             // true' },
      starter: 'function getType(value) {\n  // TODO: handle null and arrays first\n  return typeof value;\n}',
      solution: 'function getType(value) {\n  if (value === null) return "null";\n  if (Array.isArray(value)) return "array";\n  return typeof value;\n}',
      tests: [
        { call: 'getType(null)', expect: 'null' },
        { call: 'getType([1, 2, 3])', expect: 'array' },
        { call: 'getType({ a: 1 })', expect: 'object' },
        { call: 'getType("Delhi")', expect: 'string' },
        { call: 'getType(undefined)', expect: 'undefined' },
        { call: 'getType(5)', expect: 'number' },
      ],
      explain: 'Check the special cases **before** `typeof`, because `typeof null` and `typeof []` both say "object". `Array.isArray` is the reliable array test and `=== null` is the reliable null test.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'A form field can be **missing** (`undefined`), **intentionally empty** (`null`) or filled. Write `describePhone(phone)` that returns:\n- `"not provided"` if phone is `undefined`\n- `"cleared by user"` if phone is `null`\n- otherwise `"Phone: "` + phone',
      example: { title: 'strict comparisons', code: 'let x;\nconsole.log(x === undefined); // true\nlet y = null;\nconsole.log(y === null);      // true' },
      starter: 'function describePhone(phone) {\n  // TODO\n}',
      solution: 'function describePhone(phone) {\n  if (phone === undefined) return "not provided";\n  if (phone === null) return "cleared by user";\n  return "Phone: " + phone;\n}',
      tests: [
        { call: 'describePhone(undefined)', expect: 'not provided' },
        { call: 'describePhone()', expect: 'not provided' },
        { call: 'describePhone(null)', expect: 'cleared by user' },
        { call: 'describePhone("9876543210")', expect: 'Phone: 9876543210' },
      ],
      explain: '`undefined` means "no value was given yet" (JavaScript sets it automatically), while `null` is a value **you** assign on purpose to mean "empty". Using `===` keeps them apart; `==` would treat them as equal.',
    },
  ],
};
