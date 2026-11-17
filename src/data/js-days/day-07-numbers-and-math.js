export default {
  id: 'day-07-numbers-and-math',
  title: 'Numbers, Math Object, toFixed, parseInt/parseFloat, NaN',
  module: 'Module 1: JavaScript Basics',
  day: 7,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Prices, scores, percentages and dice rolls all need numbers. Learn how JavaScript stores numbers, why 0.1 + 0.2 is not exactly 0.3, how to round and format with Math and toFixed, how to read numbers from text with parseInt/parseFloat, and how to detect NaN.',
  objectives: [
    'Understand the number type, integers vs decimals, Infinity and floating-point precision',
    'Use Math.round, floor, ceil, trunc, abs, min, max, pow, sqrt and random',
    'Format numbers with toFixed and toLocaleString',
    'Extract numbers from strings with parseInt, parseFloat and Number',
    'Detect invalid numbers with Number.isNaN and Number.isInteger',
  ],
  theory: [
    {
      heading: 'The number type',
      content: 'JavaScript has **one number type** for both integers and decimals: `42`, `-7`, `3.14` are all `number`. Internally numbers are 64-bit **floating point** (IEEE 754), like `double` in other languages.\n\nUseful facts:\n- Write big numbers readably with underscores: `1_000_000` is one million.\n- Scientific notation: `2.5e6` is 2,500,000.\n- `Infinity` and `-Infinity`: results like `1 / 0`.\n- `Number.MAX_SAFE_INTEGER` is 9007199254740991. Above that, integers lose precision; use **BigInt** (`123n`) for huge whole numbers.\n- `NaN` (Not a Number) is the result of invalid maths, but its type is still number.',
      syntax: `const salary = 1_200_000;
const distance = 3.84e5;   // 384000
console.log(10 / 0);       // Infinity
console.log("a" * 1);      // NaN`,
    },
    {
      heading: 'Floating-point precision: why 0.1 + 0.2 !== 0.3',
      content: 'Computers store numbers in **binary**. Some decimals like 0.1 cannot be stored exactly in binary, just like 1/3 cannot be written exactly in decimal (0.3333...). So small errors appear:\n\n`0.1 + 0.2` gives `0.30000000000000004`.\n\nThis is not a JavaScript bug; Python, Java and C behave the same.\n\nHow to handle it:\n- For display, round: `(0.1 + 0.2).toFixed(2)` gives "0.30".\n- For money, work in the **smallest unit** (paise/cents) as integers: store 1999 instead of 19.99.\n- To compare decimals, check if the difference is tiny: `Math.abs(a - b) < Number.EPSILON`.',
      tip: 'Interview favourite: "Why is 0.1 + 0.2 not equal to 0.3?" Answer: binary floating-point representation cannot store 0.1 and 0.2 exactly.',
    },
    {
      heading: 'The Math object',
      content: '`Math` is a built-in object full of maths helpers. You do not create it; just call `Math.something()`.\n\n**Rounding**\n- `Math.round(4.5)` is 5 (nearest integer; .5 rounds up)\n- `Math.floor(4.9)` is 4 (always down)\n- `Math.ceil(4.1)` is 5 (always up)\n- `Math.trunc(-4.7)` is -4 (just removes decimals). Compare `Math.floor(-4.7)` which is -5.\n\n**Other helpers**\n- `Math.abs(-7)` is 7 (distance from zero)\n- `Math.max(3, 9, 2)` is 9, `Math.min(3, 9, 2)` is 2. With an array use spread: `Math.max(...arr)`\n- `Math.pow(2, 3)` is 8 (same as `2 ** 3`), `Math.sqrt(16)` is 4, `Math.cbrt(27)` is 3\n- `Math.PI` is 3.141592653589793\n- `Math.random()` gives a random decimal from 0 (inclusive) up to 1 (exclusive)\n\n**Random integer between min and max (inclusive):**\n`Math.floor(Math.random() * (max - min + 1)) + min`',
      syntax: `const dice = Math.floor(Math.random() * 6) + 1; // 1 to 6
const area = Math.PI * 5 ** 2;
console.log(Math.round(area)); // 79`,
    },
    {
      heading: 'Formatting: toFixed and toLocaleString',
      content: '- `num.toFixed(digits)` rounds to a fixed number of decimal places and returns a **string**: `(3.14159).toFixed(2)` is "3.14". Convert back with Number() if you need to keep calculating.\n- `num.toLocaleString(locale)` adds thousand separators for display: `(1234567.891).toLocaleString("en-IN")` gives "12,34,567.891" (Indian grouping); "en-US" gives "1,234,567.891".\n- Currency: `price.toLocaleString("en-IN", { style: "currency", currency: "INR" })`.\n- `num.toString(2)` converts to binary, `toString(16)` to hex.',
      tip: 'Common mistake: (19.999).toFixed(2) + 1 gives "20.001" because toFixed returns a string. Wrap it: Number(x.toFixed(2)) + 1.',
    },
    {
      heading: 'parseInt, parseFloat and Number',
      content: 'All three turn strings into numbers, but behave differently:\n\n- `Number("42px")` is **NaN**: the whole string must be a valid number.\n- `parseInt("42px")` is **42**: reads digits from the start and stops at the first non-digit. Ignores decimals: `parseInt("3.99")` is 3.\n- `parseFloat("3.99kg")` is **3.99**: like parseInt but keeps the decimal part.\n- If the string does not **start** with a number, both give NaN: `parseInt("px42")` is NaN.\n\nAlways pass the **radix** (base) to parseInt: `parseInt("08", 10)`. You can parse other bases too: `parseInt("ff", 16)` is 255, `parseInt("101", 2)` is 5.\n\nUse **Number()** for strict validation (form fields) and **parseInt/parseFloat** when you expect units like "px" or "kg".',
      syntax: `parseInt("250px", 10);   // 250
parseFloat("12.5%");      // 12.5
Number("12.5%");          // NaN`,
    },
    {
      heading: 'NaN and number checks',
      content: '**NaN** appears when maths fails: `"abc" * 2`, `Number("hello")`, `0 / 0`, `Math.sqrt(-1)`.\n\nNaN is **contagious**: any maths with NaN gives NaN. And it is the only value **not equal to itself**: `NaN === NaN` is false.\n\nChecks:\n- `Number.isNaN(x)`: true only if x is actually NaN (recommended)\n- `isNaN(x)`: global version, converts x first, so `isNaN("hello")` is true (less precise)\n- `Number.isInteger(5.0)` is true, `Number.isInteger(5.5)` is false\n- `Number.isFinite(x)`: false for NaN and Infinity\n\nComing next (Day 8): making decisions with if/else and switch.',
    },
  ],
  examples: [
    {
      title: 'Rounding methods side by side',
      scenario: 'A teacher wants to see how different rounding methods treat the same marks, including negative values.',
      steps: [
        'Put test values in an array',
        'For each value print round, floor, ceil and trunc',
        'Click Run and compare, especially for negative numbers',
      ],
      code: `const values = [4.4, 4.5, 4.6, -4.5, -4.6];
for (const v of values) {
  console.log(v, "round:", Math.round(v), "floor:", Math.floor(v), "ceil:", Math.ceil(v), "trunc:", Math.trunc(v));
}`,
      playground: {
        js: `const values = [4.4, 4.5, 4.6, -4.5, -4.6];
for (const v of values) {
  console.log(v, "round:", Math.round(v), "floor:", Math.floor(v), "ceil:", Math.ceil(v), "trunc:", Math.trunc(v));
}`,
      },
      result: `4.4 round: 4 floor: 4 ceil: 5 trunc: 4
4.5 round: 5 floor: 4 ceil: 5 trunc: 4
4.6 round: 5 floor: 4 ceil: 5 trunc: 4
-4.5 round: -4 floor: -5 ceil: -4 trunc: -4
-4.6 round: -5 floor: -5 ceil: -4 trunc: -4`,
      explanation: 'floor always goes down the number line and ceil always up. trunc just cuts the decimals, so for negatives it moves toward zero (unlike floor). Math.round rounds .5 up toward +Infinity, so -4.5 becomes -4, a frequent surprise.',
    },
    {
      title: 'Shopping bill with precision fix and formatting',
      scenario: 'Add item prices with decimals, show the floating-point issue, then fix it for display and work in paise for accuracy.',
      steps: [
        'Add 0.1 and 0.2 and compare with 0.3',
        'Calculate a bill with GST and format with toFixed',
        'Redo the calculation in paise (integers)',
        'Format a large number with toLocaleString',
      ],
      code: `console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);

const subtotal = 199.99 + 49.5;
const withGst = subtotal * 1.18;
console.log(withGst.toFixed(2), typeof withGst.toFixed(2));

const paise = 19999 + 4950;
console.log(paise / 100);
console.log((1234567.5).toLocaleString("en-IN"));`,
      playground: {
        js: `console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);
console.log(Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON);

const subtotal = 199.99 + 49.5;
const withGst = subtotal * 1.18;
console.log(withGst.toFixed(2), typeof withGst.toFixed(2));

const paise = 19999 + 4950;
console.log(paise / 100);
console.log((1234567.5).toLocaleString("en-IN"));`,
      },
      result: `0.30000000000000004
false
true
294.40 string
249.49
12,34,567.5`,
      explanation: '0.1 + 0.2 is slightly more than 0.3 in binary, so === fails; comparing the difference with Number.EPSILON works. toFixed(2) rounds for display and returns a string. Adding integers (paise) is always exact, then dividing by 100 gives the rupee value. toLocaleString("en-IN") uses Indian lakh/crore grouping.',
    },
    {
      title: 'parseInt vs parseFloat vs Number',
      scenario: 'CSS sizes and form fields come as strings like "250px" or "12.5kg". See how each conversion function handles them.',
      steps: [
        'Create a list of input strings',
        'Print Number, parseInt (with radix 10) and parseFloat for each',
        'Also parse binary and hex',
        'Click Run',
      ],
      code: `const inputs = ["42", "42.9", "250px", "12.5kg", "px10", ""];
for (const s of inputs) {
  console.log(JSON.stringify(s), Number(s), parseInt(s, 10), parseFloat(s));
}
console.log(parseInt("ff", 16), parseInt("101", 2), (255).toString(16));`,
      playground: {
        js: `const inputs = ["42", "42.9", "250px", "12.5kg", "px10", ""];
for (const s of inputs) {
  console.log(JSON.stringify(s), Number(s), parseInt(s, 10), parseFloat(s));
}
console.log(parseInt("ff", 16), parseInt("101", 2), (255).toString(16));`,
      },
      result: `"42" 42 42 42
"42.9" 42.9 42 42.9
"250px" NaN 250 250
"12.5kg" NaN 12 12.5
"px10" NaN NaN NaN
"" 0 NaN NaN
255 5 ff`,
      explanation: 'Number is strict: any extra text gives NaN, but an empty string becomes 0. parseInt reads leading digits and drops decimals. parseFloat reads leading digits including the decimal point. If the string does not start with a number, both parse functions give NaN. The last line shows other bases: "ff" in hexadecimal is 255, "101" in binary is 5, and toString(16) converts 255 back to "ff". (JSON.stringify(s) is used only to show each input with its quotes.)',
    },
    {
      title: 'Random integer and number validation',
      scenario: 'Build a dice roller and an OTP generator, and validate that the results are correct whole numbers in range.',
      steps: [
        'Write a formula for a random integer between min and max',
        'Roll a dice 1000 times and check every roll is between 1 and 6',
        'Generate a 4-digit OTP and check its length',
        'Validate inputs with Number.isNaN and Number.isInteger',
      ],
      code: `let allValid = true;
for (let i = 0; i < 1000; i++) {
  const roll = Math.floor(Math.random() * 6) + 1;
  if (roll < 1 || roll > 6 || !Number.isInteger(roll)) allValid = false;
}
console.log("All dice rolls valid:", allValid);

const otp = Math.floor(Math.random() * 9000) + 1000;
console.log("OTP has 4 digits:", String(otp).length === 4);

console.log(Number.isNaN(Number("abc")), Number.isInteger(7.0), Number.isInteger(7.5));
console.log(Math.max(12, 45, 7), Math.min(...[12, 45, 7]), Math.sqrt(144), Math.abs(-9));`,
      playground: {
        js: `let allValid = true;
for (let i = 0; i < 1000; i++) {
  const roll = Math.floor(Math.random() * 6) + 1;
  if (roll < 1 || roll > 6 || !Number.isInteger(roll)) allValid = false;
}
console.log("All dice rolls valid:", allValid);

const otp = Math.floor(Math.random() * 9000) + 1000;
console.log("OTP has 4 digits:", String(otp).length === 4);

console.log(Number.isNaN(Number("abc")), Number.isInteger(7.0), Number.isInteger(7.5));
console.log(Math.max(12, 45, 7), Math.min(...[12, 45, 7]), Math.sqrt(144), Math.abs(-9));`,
      },
      result: `All dice rolls valid: true
OTP has 4 digits: true
true true false
45 7 12 9`,
      explanation: 'Math.random() * 6 gives 0 to 5.999..., floor makes it 0 to 5, +1 makes it 1 to 6. For the OTP, random * 9000 gives 0 to 8999, + 1000 gives 1000 to 9999, always 4 digits. The rolls themselves change every run, so we print checks instead of the raw values. 7.0 is the same as 7, so it is an integer. Math.min needs separate arguments, so we spread the array with ...',
    },
  ],
  interview: [
    { q: 'Why does 0.1 + 0.2 not equal 0.3 in JavaScript?', a: 'Numbers are IEEE 754 binary floating-point values. 0.1 and 0.2 cannot be represented exactly in binary, so their sum is 0.30000000000000004. Fix by rounding for display (toFixed), comparing with a tolerance (Number.EPSILON), or using integers (cents/paise) for money.', level: 'Medium' },
    { q: 'What is the difference between Math.floor, Math.ceil, Math.round and Math.trunc?', a: 'floor rounds down, ceil rounds up, round rounds to the nearest integer (.5 goes up toward +Infinity), trunc removes the decimal part (rounds toward zero). They differ for negatives: floor(-4.5) = -5, trunc(-4.5) = -4, round(-4.5) = -4.', level: 'Easy' },
    { q: 'What is the difference between parseInt and Number?', a: 'Number converts the whole string and returns NaN if any part is invalid ("12px" -> NaN, "" -> 0). parseInt reads digits from the start until a non-digit and ignores the rest ("12px" -> 12, "12.9" -> 12, "" -> NaN). Always pass a radix to parseInt.', level: 'Medium' },
    { q: 'How do you generate a random integer between 1 and 10?', a: 'Math.floor(Math.random() * 10) + 1. In general: Math.floor(Math.random() * (max - min + 1)) + min.', level: 'Easy' },
    { q: 'What does toFixed return?', a: 'A string, rounded to the given number of decimals: (2.345).toFixed(1) is "2.3". Convert with Number() if you need to do more maths.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log(typeof NaN, NaN === NaN, Number.isNaN(0 / 0));', a: 'number false true. NaN has type number, is never equal to itself, and 0 / 0 produces NaN.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log(parseInt("08.9abc"), parseFloat(".5"), Number(" 12 "), Number("1,000"));', a: '8 0.5 12 NaN. parseInt reads "08" -> 8. parseFloat accepts a leading dot. Number trims spaces. A comma is not valid in Number, so NaN.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log((5.678).toFixed(1) + 1);\nconsole.log(Number((5.678).toFixed(1)) + 1);', a: 'It prints:\n5.71\n6.7\ntoFixed returns the string "5.7", and "5.7" + 1 concatenates to "5.71". Converting back with Number gives 5.7 + 1 = 6.7.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log(Math.max(), Math.min());\nconsole.log(Math.max(1, "5", 3));', a: 'It prints:\n-Infinity Infinity\n5\nWith no arguments, max returns -Infinity and min returns Infinity (identity values). "5" is converted to the number 5.', level: 'Hard' },
    { q: 'What is Number.MAX_SAFE_INTEGER and why does it matter?', a: 'It is 2^53 - 1 = 9007199254740991, the largest integer that can be represented exactly. Beyond it, integers lose precision (9007199254740992 === 9007199254740993 is true). Use BigInt for larger integers such as big IDs.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Calculate the simple interest for principal 25000, rate 7.5% and 3 years, and print it with exactly 2 decimals.',
      hint: 'SI = P * R * T / 100, then toFixed(2).',
      solution: `const P = 25000, R = 7.5, T = 3;
const si = (P * R * T) / 100;
console.log("Interest:", si.toFixed(2)); // 5625.00`,
    },
    {
      task: 'Write code that returns a random element from the array ["red", "green", "blue", "yellow"].',
      hint: 'Random index = Math.floor(Math.random() * arr.length).',
      solution: `const colors = ["red", "green", "blue", "yellow"];
const index = Math.floor(Math.random() * colors.length);
console.log(colors[index]);`,
    },
    {
      task: 'Given width = "320px" and padding = "12.5px", calculate the total width (width + 2 * padding) as a number.',
      hint: 'parseFloat both.',
      solution: `const width = "320px";
const padding = "12.5px";
const total = parseFloat(width) + 2 * parseFloat(padding);
console.log(total + "px"); // 345px`,
    },
    {
      task: 'Convert a temperature from Celsius to Fahrenheit (F = C * 9/5 + 32) for 36.6 and round to 1 decimal as a number (not string).',
      hint: 'Math.round(x * 10) / 10 or Number(x.toFixed(1)).',
      solution: `const c = 36.6;
const f = c * 9 / 5 + 32;
console.log(Math.round(f * 10) / 10); // 97.9`,
    },
    {
      task: 'Validate a list of age inputs ["25", "abc", "17.5", "-3", "40"]: print "valid" only for whole numbers from 0 to 120.',
      hint: 'Number(), Number.isInteger and a range check.',
      solution: `const ages = ["25", "abc", "17.5", "-3", "40"];
for (const a of ages) {
  const n = Number(a);
  const ok = Number.isInteger(n) && n >= 0 && n <= 120;
  console.log(a, ok ? "valid" : "invalid");
}`,
    },
  ],
  quiz: [
    { question: 'What is Math.ceil(4.01)?', options: ['4', '4.1', '5', '4.01'], answer: 2, explanation: 'ceil always rounds up to the next integer.' },
    { question: 'What is parseInt("15.99px", 10)?', options: ['15', '15.99', '16', 'NaN'], answer: 0, explanation: 'parseInt reads leading digits and stops at the dot.' },
    { question: 'What type does (3.14159).toFixed(2) return?', options: ['number', 'float', 'bigint', 'string'], answer: 3, explanation: 'toFixed returns a string, "3.14".' },
    { question: 'Which correctly checks whether x is NaN?', options: ['x === NaN', 'Number.isNaN(x)', 'x == NaN', 'typeof x === "NaN"'], answer: 1, explanation: 'NaN is not equal to itself; use Number.isNaN.' },
    { question: 'Math.floor(Math.random() * 6) produces which range?', options: ['0 to 5', '1 to 6', '0 to 6', '1 to 5'], answer: 0, explanation: 'random() * 6 is 0 to 5.999..., floor gives 0 to 5. Add 1 for a dice.' },
  ],
};
