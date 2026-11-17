export default {
  id: 'day-03-data-types',
  title: 'Data Types: Primitive vs Reference, typeof, null vs undefined',
  module: 'Module 1: JavaScript Basics',
  day: 3,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Every value in JavaScript has a type. Learn the 7 primitive types and the reference type (objects, arrays, functions), how they are copied differently, how to check a type with typeof, and the difference between null and undefined.',
  objectives: [
    'List the 7 primitive types and the reference (object) type',
    'Explain the difference between copying a primitive and copying a reference',
    'Use typeof correctly, including its quirks (null and functions)',
    'Explain the difference between null and undefined and when each appears',
    'Use Array.isArray to detect arrays',
  ],
  theory: [
    {
      heading: 'What is a data type?',
      content: 'A **data type** tells JavaScript what kind of value something is and what you can do with it. You can multiply numbers, but you cannot multiply two names. You can make text uppercase, but not a number.\n\nJavaScript is **dynamically typed**: the type belongs to the **value**, not to the variable. The same variable can hold a number now and a string later.\n\nJavaScript has **8 types** in total:\n- **7 primitive types**: string, number, bigint, boolean, undefined, null, symbol\n- **1 non-primitive (reference) type**: object (which includes arrays, functions, dates, and plain objects)',
      syntax: `let data = 42;       // number
data = "forty-two";  // now a string (allowed in JS)
data = true;         // now a boolean`,
    },
    {
      heading: 'The 7 primitive types',
      content: '- **string**: text in quotes: `"Hello"`, `\'Hi\'`, or backticks `` `Hi` ``\n- **number**: integers and decimals: `42`, `3.14`, `-7`, plus special values `Infinity`, `-Infinity` and `NaN` (Not a Number)\n- **bigint**: very large integers with an `n` at the end: `9007199254740993n`\n- **boolean**: only `true` or `false`, used for yes/no decisions\n- **undefined**: a variable that has been declared but **not given a value**\n- **null**: an intentional "**empty / no value**" set by the programmer\n- **symbol**: a unique identifier, `Symbol("id")` (advanced, Day 42)\n\nPrimitives are **immutable**: you cannot change the value itself. `"hello".toUpperCase()` returns a **new** string; the original is untouched.',
      tip: 'Numbers and strings look similar on screen but are different: 5 is a number, "5" is a string.',
    },
    {
      heading: 'Reference type: object',
      content: 'Anything that is not a primitive is an **object**. Objects can hold **many values** together.\n\n- **Plain object**: `{ name: "Asha", age: 21 }` (key-value pairs)\n- **Array**: `[10, 20, 30]` (ordered list)\n- **Function**: `function greet() {}` (a callable object)\n- Also Date, Map, Set, RegExp, etc.\n\nAnalogy: a primitive is like **writing a number on a sticky note** and handing someone a copy. An object is like a **house**: the variable stores the **address** of the house, not the house itself. If you give someone the address, you both visit and change the **same** house.',
      syntax: `const user = { name: "Asha", age: 21 };
const marks = [78, 85, 92];
function sayHi() { return "Hi"; }`,
    },
    {
      heading: 'Copy by value vs copy by reference',
      content: 'This is one of the most asked interview topics.\n\n**Primitives are copied by value**: `let b = a;` makes an independent copy. Changing b does not affect a.\n\n**Objects are copied by reference**: `let obj2 = obj1;` copies only the address. Both variables point to the **same** object, so a change through one is visible through the other.\n\nThe same rule applies to **comparison**: two primitives are equal if their values are equal. Two objects are equal only if they are the **same object** in memory: `[1] === [1]` is `false` because they are two different arrays.\n\nTo make a real (shallow) copy of an array or object, use spread: `const copy = [...arr]` or `const copy = { ...obj }` (Day 11 and 18).',
      syntax: `let a = 10;
let b = a;   // copy of the value
b = 20;
console.log(a); // 10

const p1 = { score: 1 };
const p2 = p1; // copy of the reference
p2.score = 99;
console.log(p1.score); // 99`,
    },
    {
      heading: 'The typeof operator',
      content: '`typeof value` returns a **string** with the type name.\n\n- `typeof "hi"` is `"string"`\n- `typeof 42` is `"number"` (also `typeof NaN` is `"number"`!)\n- `typeof 10n` is `"bigint"`\n- `typeof true` is `"boolean"`\n- `typeof undefined` is `"undefined"`\n- `typeof Symbol()` is `"symbol"`\n- `typeof {}` is `"object"`\n- `typeof []` is `"object"` (arrays are objects)\n- `typeof function(){}` is `"function"` (special case)\n- `typeof null` is `"object"`. This is a **famous bug** from the first version of JavaScript that can never be fixed because it would break old websites.\n\nTo check for an array use `Array.isArray(value)`. To check for null use `value === null`.',
      tip: 'typeof always returns a string, so typeof typeof 1 is "string".',
    },
    {
      heading: 'null vs undefined',
      content: 'Both mean "no value", but they are used differently.\n\n**undefined** means "a value has **not been assigned yet**". JavaScript gives it automatically:\n- a declared variable without a value: `let x;`\n- a missing object property: `user.phone`\n- a function parameter that was not passed\n- a function that does not return anything\n\n**null** means "**intentionally empty**". The programmer sets it on purpose: `let selectedUser = null;` (no user selected yet).\n\nAnalogy: undefined is an **empty box nobody has touched**. null is a box where someone put a note that says "**deliberately empty**".\n\nComparison: `null == undefined` is `true` (loose equality treats them as equal) but `null === undefined` is `false` (different types). Day 5 explains == vs ===.',
      points: [
        'typeof undefined is "undefined"; typeof null is "object"',
        'Number(undefined) is NaN; Number(null) is 0',
        'Use null yourself; let JavaScript use undefined',
      ],
    },
  ],
  examples: [
    {
      title: 'Checking types with typeof',
      scenario: 'You receive values from a form and an API and want to see what type each one really is.',
      steps: [
        'Create variables of different types',
        'Log typeof for each',
        'Pay special attention to null, arrays and functions',
        'Click Run',
      ],
      code: `console.log(typeof "Asha");
console.log(typeof 21);
console.log(typeof 3.5);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof [1, 2]);
console.log(typeof { a: 1 });
console.log(typeof function () {});
console.log(typeof 100n);
console.log(typeof NaN);`,
      playground: {
        js: `console.log(typeof "Asha");
console.log(typeof 21);
console.log(typeof 3.5);
console.log(typeof true);
console.log(typeof undefined);
console.log(typeof null);
console.log(typeof [1, 2]);
console.log(typeof { a: 1 });
console.log(typeof function () {});
console.log(typeof 100n);
console.log(typeof NaN);`,
      },
      result: `string
number
number
boolean
undefined
object
object
object
function
bigint
number`,
      explanation: 'Integers and decimals are both "number". null shows "object" because of a historic bug. Arrays are a kind of object, so typeof cannot tell them apart; use Array.isArray. Functions get their own answer "function". NaN is still of type number, it just represents an invalid numeric result.',
    },
    {
      title: 'Copy by value vs copy by reference',
      scenario: 'Two students start with the same score. Then two team members share the same scoreboard object. Watch what changes.',
      steps: [
        'Copy a number into another variable and change the copy',
        'Copy an object into another variable and change a property through the copy',
        'Make a real copy with spread and change it',
        'Click Run and compare the original values',
      ],
      code: `let scoreA = 50;
let scoreB = scoreA;
scoreB = 80;
console.log("scoreA:", scoreA, "scoreB:", scoreB);

const board1 = { points: 10 };
const board2 = board1;
board2.points = 99;
console.log("board1.points:", board1.points);

const board3 = { ...board1 };
board3.points = 5;
console.log("board1.points:", board1.points, "board3.points:", board3.points);
console.log(board1 === board2, board1 === board3);`,
      playground: {
        js: `let scoreA = 50;
let scoreB = scoreA;
scoreB = 80;
console.log("scoreA:", scoreA, "scoreB:", scoreB);

const board1 = { points: 10 };
const board2 = board1;
board2.points = 99;
console.log("board1.points:", board1.points);

const board3 = { ...board1 };
board3.points = 5;
console.log("board1.points:", board1.points, "board3.points:", board3.points);
console.log(board1 === board2, board1 === board3);`,
      },
      result: `scoreA: 50 scoreB: 80
board1.points: 99
board1.points: 99 board3.points: 5
true false`,
      explanation: 'Numbers are copied by value, so scoreA is untouched. board2 holds the same address as board1, so changing board2.points changes the one shared object. The spread { ...board1 } creates a brand-new object, so board3 is independent. === on objects compares addresses: board1 and board2 are the same object (true), board3 is a different object (false).',
    },
    {
      title: 'null vs undefined in real code',
      scenario: 'A profile page: some data is not loaded yet (undefined) and some is intentionally empty (null).',
      steps: [
        'Declare a variable without a value',
        'Create a user object with middleName set to null',
        'Read a property that does not exist',
        'Compare null and undefined with == and ===, and convert them to numbers',
      ],
      code: `let loadedAt;
const user = { name: "Ravi", middleName: null };

console.log(loadedAt);
console.log(user.middleName);
console.log(user.phone);
console.log(null == undefined);
console.log(null === undefined);
console.log(Number(null), Number(undefined));`,
      playground: {
        js: `let loadedAt;
const user = { name: "Ravi", middleName: null };

console.log(loadedAt);
console.log(user.middleName);
console.log(user.phone);
console.log(null == undefined);
console.log(null === undefined);
console.log(Number(null), Number(undefined));`,
      },
      result: `undefined
null
undefined
true
false
0 NaN`,
      explanation: 'loadedAt was never assigned, so it is undefined. middleName was set to null on purpose (the user has no middle name). phone does not exist on the object, so reading it gives undefined. Loose == treats null and undefined as equal; strict === does not because their types differ. As numbers, null becomes 0 but undefined becomes NaN.',
    },
    {
      title: 'Detecting arrays and null correctly',
      scenario: 'Write small checks that correctly identify an array, a plain object and null, since typeof alone is not enough.',
      steps: [
        'Put several values in an array',
        'Loop over them with for...of (you will learn loops on Day 9; here just read along)',
        'For each, print typeof, Array.isArray and whether it is null',
        'Click Run',
      ],
      code: `const values = [[1, 2], { id: 1 }, null];
for (const v of values) {
  console.log(typeof v, Array.isArray(v), v === null);
}`,
      playground: {
        js: `const values = [[1, 2], { id: 1 }, null];
for (const v of values) {
  console.log(typeof v, Array.isArray(v), v === null);
}`,
      },
      result: `object true false
object false false
object false true`,
      explanation: 'All three report typeof "object". Array.isArray is true only for the array, and v === null is true only for null. In real code: use Array.isArray for arrays, === null for null, and typeof for the other primitives.',
    },
  ],
  interview: [
    { q: 'What are the data types in JavaScript?', a: 'There are 8: seven primitives (string, number, bigint, boolean, undefined, null, symbol) and one non-primitive type, object (which includes arrays, functions, dates, maps, etc.).', level: 'Easy' },
    { q: 'What is the difference between primitive and reference types?', a: 'Primitives hold a single immutable value and are copied and compared by value. Objects are stored as references: assigning an object to another variable copies the reference, so both point to the same object, and === compares references (identity), not contents.', level: 'Medium' },
    { q: 'Why does typeof null return "object"?', a: 'It is a bug from the first implementation of JavaScript (values were tagged by type bits, and null used the object tag). It was never fixed because fixing it would break existing websites. Use value === null to check for null.', level: 'Medium' },
    { q: 'What is the difference between null and undefined?', a: 'undefined means a value has not been assigned (declared variable without value, missing property, missing argument, function with no return). null is an explicit assignment meaning "no value / empty" set by the developer. typeof undefined is "undefined", typeof null is "object"; null == undefined is true but null === undefined is false.', level: 'Easy' },
    { q: 'How do you check if a value is an array?', a: 'Array.isArray(value). typeof returns "object" for arrays, so it cannot distinguish them.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log(typeof typeof 42);', a: 'It prints: string\ntypeof 42 is "number", which is a string, and typeof "number" is "string".', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log([1, 2] === [1, 2]);\nconst a = [1, 2];\nconst b = a;\nconsole.log(a === b);', a: 'It prints:\nfalse\ntrue\nThe first compares two different array objects (different references). In the second, b references the same array as a.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nlet s = "hello";\ns.toUpperCase();\nconsole.log(s);', a: 'hello. Strings are immutable primitives; toUpperCase returns a new string, which was not saved. You need s = s.toUpperCase().', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst o1 = { n: 1 };\nconst o2 = o1;\no2.n = 2;\nconsole.log(o1.n);\nlet x = 1;\nlet y = x;\ny = 2;\nconsole.log(x);', a: 'It prints:\n2\n1\nObjects are shared by reference, so o1.n changed. Numbers are copied by value, so x stays 1.', level: 'Medium' },
    { q: 'What is NaN and what is its type?', a: 'NaN means "Not a Number": the result of an invalid numeric operation such as "abc" * 2 or 0 / 0. typeof NaN is "number". NaN is the only value not equal to itself (NaN === NaN is false); use Number.isNaN(value) to test it.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create one variable of each primitive type (string, number, bigint, boolean, undefined, null, symbol) and print the typeof each.',
      hint: 'A bigint ends with n, a symbol is Symbol("x").',
      solution: `const s = "text";
const n = 7;
const big = 12345678901234567890n;
const b = false;
let u;
const nothing = null;
const sym = Symbol("id");
console.log(typeof s, typeof n, typeof big, typeof b, typeof u, typeof nothing, typeof sym);
// string number bigint boolean undefined object symbol`,
    },
    {
      task: 'Prove that arrays are copied by reference: create an array, assign it to another variable, push into the second one, and print the first one. Then make an independent copy with spread and prove it is independent.',
      hint: 'const copy = [...original];',
      solution: `const original = [1, 2];
const sameRef = original;
sameRef.push(3);
console.log(original.join(",")); // 1,2,3

const copy = [...original];
copy.push(4);
console.log(original.join(","), "|", copy.join(",")); // 1,2,3 | 1,2,3,4`,
    },
    {
      task: 'Write code that prints a correct "real type" for the values 5, "5", null, [5] and { v: 5 } using typeof, === null and Array.isArray.',
      hint: 'Check null first, then arrays, then fall back to typeof.',
      solution: `const items = [5, "5", null, [5], { v: 5 }];
for (const item of items) {
  let type = typeof item;
  if (item === null) type = "null";
  else if (Array.isArray(item)) type = "array";
  console.log(type);
}
// number, string, null, array, object`,
    },
    {
      task: 'Create a product object with a discount property set to null and no stock property. Print both properties and explain in a comment why one is null and the other undefined.',
      hint: 'null is set by you; undefined comes from a missing property.',
      solution: `const product = { name: "Pen", discount: null };
console.log(product.discount); // null: we set it intentionally (no discount)
console.log(product.stock);    // undefined: the property does not exist`,
    },
  ],
  quiz: [
    { question: 'What does typeof [] return?', options: ['"array"', '"list"', '"object"', '"undefined"'], answer: 2, explanation: 'Arrays are objects; use Array.isArray to detect them.' },
    { question: 'Which is NOT a primitive type?', options: ['symbol', 'object', 'bigint', 'boolean'], answer: 1, explanation: 'object is the only non-primitive type.' },
    { question: 'What is typeof null?', options: ['"object"', '"null"', '"undefined"', '"empty"'], answer: 0, explanation: 'A historic bug: typeof null is "object".' },
    { question: 'let a = {x:1}; let b = a; b.x = 5; What is a.x?', options: ['1', 'undefined', 'Error', '5'], answer: 3, explanation: 'a and b reference the same object.' },
    { question: 'What is the value of a declared but unassigned variable?', options: ['null', 'undefined', '0', '""'], answer: 1, explanation: 'JavaScript automatically uses undefined for unassigned variables.' },
  ],
};
