export default {
  id: 'day-04-operators',
  title: 'Operators: Arithmetic, Assignment, Comparison, Logical, Ternary, Nullish (??), Optional Chaining (?.)',
  module: 'Module 1: JavaScript Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Operators are the symbols that do work on values: maths, assigning, comparing and combining conditions. Learn all the everyday operators, including the modern nullish coalescing (??) and optional chaining (?.) that make code safer.',
  objectives: [
    'Use arithmetic operators including %, ** and increment/decrement',
    'Use assignment shortcuts such as +=, -=, *=, ||=, ??=',
    'Compare values with ===, !==, <, >, <=, >=',
    'Combine conditions with &&, || and ! and understand short-circuiting',
    'Write ternary expressions and use ?? and ?. to handle missing values safely',
  ],
  theory: [
    {
      heading: 'Arithmetic operators',
      content: 'Arithmetic operators do maths on numbers.\n\n- `+` addition (also joins strings)\n- `-` subtraction\n- `*` multiplication\n- `/` division (always gives decimals if needed: `7 / 2` is `3.5`)\n- `%` **remainder** (modulus): `7 % 3` is `1`. Very useful: `n % 2 === 0` checks if n is even.\n- `**` exponent (power): `2 ** 3` is `8`\n- `++` increment by 1, `--` decrement by 1\n\n**Precedence** follows school maths (BODMAS): `**` first, then `* / %`, then `+ -`. Use brackets to make the order clear.\n\n**Prefix vs postfix**: `x++` returns the **old** value then adds 1; `++x` adds 1 then returns the **new** value.',
      syntax: `let x = 5;
console.log(x++); // 5  (then x becomes 6)
console.log(++x); // 7
console.log(10 % 4); // 2
console.log(2 + 3 * 4); // 14
console.log((2 + 3) * 4); // 20`,
      tip: 'Dividing by zero does not crash in JS: 5 / 0 is Infinity and 0 / 0 is NaN.',
    },
    {
      heading: 'Assignment operators',
      content: '`=` puts a value into a variable. Compound operators combine maths and assignment:\n\n- `x += 5` same as `x = x + 5`\n- `x -= 5`, `x *= 5`, `x /= 5`, `x %= 5`, `x **= 2`\n\n**Logical assignment** (ES2021):\n- `a ||= b` assigns b only if a is **falsy**\n- `a &&= b` assigns b only if a is **truthy**\n- `a ??= b` assigns b only if a is **null or undefined**',
      syntax: `let total = 100;
total += 50;   // 150
total *= 2;    // 300

let nickname = null;
nickname ??= "Guest"; // "Guest"`,
    },
    {
      heading: 'Comparison operators',
      content: 'Comparison operators return a **boolean** (true or false).\n\n- `===` strict equal (same value **and** same type)\n- `!==` strict not equal\n- `==` / `!=` loose equality (converts types first; Day 5 explains why to avoid it)\n- `>`, `<`, `>=`, `<=`\n\nStrings are compared **alphabetically** by character code: `"apple" < "banana"` is true, but `"Zebra" < "apple"` is also true because uppercase letters come before lowercase ones. Comparing `"10" < "9"` as strings is **true** (it compares "1" with "9"), so convert to numbers first.',
      syntax: `console.log(5 === 5);    // true
console.log(5 === "5");  // false (different types)
console.log(5 !== 3);    // true
console.log(10 >= 10);   // true`,
      tip: 'Always use === and !== in your code. It avoids surprising type conversions.',
    },
    {
      heading: 'Logical operators: &&, ||, !',
      content: '- `&&` (AND): true only if **both** sides are true. "Logged in AND is admin".\n- `||` (OR): true if **at least one** side is true. "Weekend OR holiday".\n- `!` (NOT): flips true to false and vice versa.\n\n**Short-circuit evaluation:** JS stops as soon as it knows the answer.\n- `a && b`: if a is falsy, returns a (and never looks at b); otherwise returns b.\n- `a || b`: if a is truthy, returns a; otherwise returns b.\n\nSo these operators return one of the **original values**, not always true/false. That is why `"" || "Guest"` gives `"Guest"`, a common way to give defaults. Falsy values are `false, 0, "", null, undefined, NaN` (Day 5).',
      syntax: `const age = 20, hasId = true;
console.log(age >= 18 && hasId); // true
console.log(false || "default"); // "default"
console.log(0 && "never seen");  // 0
console.log(!true);              // false`,
    },
    {
      heading: 'Ternary operator  condition ? a : b',
      content: 'The ternary is a one-line if/else that **returns a value**.\n\n`condition ? valueIfTrue : valueIfFalse`\n\nAnalogy: a railway switch. The condition decides which track the value takes.\n\nUse it for short choices, such as a label or a CSS class. For long logic, use if/else (Day 8). Avoid nesting many ternaries; it becomes unreadable.',
      syntax: `const marks = 72;
const result = marks >= 40 ? "Pass" : "Fail";
console.log(result); // "Pass"`,
    },
    {
      heading: 'Nullish coalescing (??) and optional chaining (?.)',
      content: '**?? (nullish coalescing)** returns the right side only when the left side is `null` or `undefined`.\n\nWhy not `||`? Because `||` also replaces **valid** falsy values like `0` or `""`. If a user sets volume to 0, `volume || 50` wrongly gives 50, but `volume ?? 50` correctly keeps 0.\n\n**?. (optional chaining)** safely reads deep properties. If the value before `?.` is null or undefined, the whole expression stops and returns `undefined` instead of throwing **TypeError: Cannot read properties of undefined**.\n\n- `user?.address?.city`\n- `user.getName?.()` (call only if the method exists)\n- `arr?.[0]` (index only if arr exists)\n\nThey are often used together: `user?.address?.city ?? "Unknown"`.',
      syntax: `const settings = { volume: 0 };
console.log(settings.volume || 50); // 50 (wrong!)
console.log(settings.volume ?? 50); // 0  (correct)

const user = { name: "Asha" };
console.log(user.address?.city);              // undefined
console.log(user.address?.city ?? "Unknown"); // "Unknown"`,
      tip: 'You cannot mix ?? with || or && without brackets: a || b ?? c is a SyntaxError. Write (a || b) ?? c.',
    },
  ],
  examples: [
    {
      title: 'Even/odd and bill split with arithmetic operators',
      scenario: 'Friends split a restaurant bill. Find each share, the leftover rupees, and whether the number of people is even.',
      steps: [
        'Store the bill and the number of people',
        'Use / and Math.floor for the share, % for the remainder',
        'Use % 2 to check even/odd and ** for a power example',
        'Click Run',
      ],
      code: `const bill = 1250;
const people = 3;
console.log("Exact share:", bill / people);
console.log("Whole share:", Math.floor(bill / people));
console.log("Leftover:", bill % people);
console.log("Even group?", people % 2 === 0);
console.log("Tip at 10%:", bill * 0.1);
console.log("2 ** 5 =", 2 ** 5);`,
      playground: {
        js: `const bill = 1250;
const people = 3;
console.log("Exact share:", bill / people);
console.log("Whole share:", Math.floor(bill / people));
console.log("Leftover:", bill % people);
console.log("Even group?", people % 2 === 0);
console.log("Tip at 10%:", bill * 0.1);
console.log("2 ** 5 =", 2 ** 5);`,
      },
      result: `Exact share: 416.6666666666667
Whole share: 416
Leftover: 2
Even group? false
Tip at 10%: 125
2 ** 5 = 32`,
      explanation: '/ gives a decimal. Math.floor removes the decimal part (Day 7). % gives the remainder: 3 x 416 = 1248, so 2 is left over. 3 % 2 is 1, not 0, so the group is odd. ** is power.',
    },
    {
      title: 'Prefix vs postfix increment',
      scenario: 'A ticket counter: understand exactly what value x++ and ++x give back, a very common output question.',
      steps: [
        'Start with let tickets = 10',
        'Log tickets++ and then tickets',
        'Log ++tickets',
        'Compute a = tickets-- + 1 and log both values',
      ],
      code: `let tickets = 10;
console.log(tickets++);
console.log(tickets);
console.log(++tickets);
let a = tickets-- + 1;
console.log(a, tickets);`,
      playground: {
        js: `let tickets = 10;
console.log(tickets++);
console.log(tickets);
console.log(++tickets);
let a = tickets-- + 1;
console.log(a, tickets);`,
      },
      result: `10
11
12
13 11`,
      explanation: 'tickets++ returns the old value 10 and then increases to 11. ++tickets increases first to 12 and returns 12. tickets-- returns 12 (so a = 12 + 1 = 13) and then tickets becomes 11.',
    },
    {
      title: 'Login check with comparison, logical and ternary operators',
      scenario: 'Decide what a visitor sees: they must be 18+ AND have verified email; admins OR moderators see a tools link.',
      steps: [
        'Create variables for age, emailVerified and role',
        'Combine conditions with && and ||',
        'Use ! to flip a boolean',
        'Use a ternary to pick a message',
      ],
      code: `const age = 19;
const emailVerified = true;
const role = "moderator";

const canEnter = age >= 18 && emailVerified;
const showTools = role === "admin" || role === "moderator";
console.log("Can enter:", canEnter);
console.log("Show tools:", showTools);
console.log("Is guest:", !canEnter);
console.log(canEnter ? "Welcome!" : "Access denied");
console.log("" || "Anonymous", 0 && "skip", "A" && "B");`,
      playground: {
        js: `const age = 19;
const emailVerified = true;
const role = "moderator";

const canEnter = age >= 18 && emailVerified;
const showTools = role === "admin" || role === "moderator";
console.log("Can enter:", canEnter);
console.log("Show tools:", showTools);
console.log("Is guest:", !canEnter);
console.log(canEnter ? "Welcome!" : "Access denied");
console.log("" || "Anonymous", 0 && "skip", "A" && "B");`,
      },
      result: `Can enter: true
Show tools: true
Is guest: false
Welcome!
Anonymous 0 B`,
      explanation: 'Both conditions are true, so && gives true. role matches the second comparison, so || gives true. ! flips true to false. The ternary picks "Welcome!". The last line shows short-circuiting: "" is falsy so || returns "Anonymous"; 0 is falsy so && returns 0 immediately; "A" is truthy so && returns the second value "B".',
    },
    {
      title: '?? and ?. with API data',
      scenario: 'An API returns user data where some fields may be missing or zero. Show safe defaults without breaking valid zero values.',
      steps: [
        'Create a user object with a nested profile and a 0 value',
        'Compare || and ?? on the zero value',
        'Use ?. to read missing nested properties and methods safely',
        'Use ??= to fill a missing value',
      ],
      code: `const user = {
  name: "Kiran",
  stats: { posts: 0 },
};

console.log(user.stats.posts || "No data");
console.log(user.stats.posts ?? "No data");
console.log(user.address?.city);
console.log(user.address?.city ?? "City not set");
console.log(user.getAge?.());
user.theme ??= "light";
console.log(user.theme);`,
      playground: {
        js: `const user = {
  name: "Kiran",
  stats: { posts: 0 },
};

console.log(user.stats.posts || "No data");
console.log(user.stats.posts ?? "No data");
console.log(user.address?.city);
console.log(user.address?.city ?? "City not set");
console.log(user.getAge?.());
user.theme ??= "light";
console.log(user.theme);`,
      },
      result: `No data
0
undefined
City not set
undefined
light`,
      explanation: 'posts is 0, a real value, but || treats 0 as falsy and wrongly shows "No data". ?? only falls back on null/undefined, so it keeps 0. user.address is undefined; without ?. reading .city would throw a TypeError, with ?. it just returns undefined. getAge does not exist, so ?.() skips the call. ??= sets theme because it was undefined.',
    },
  ],
  interview: [
    { q: 'What is the difference between == and ===?', a: '=== (strict equality) compares value and type without conversion. == (loose equality) converts types before comparing, e.g. 5 == "5" is true but 5 === "5" is false. Prefer ===.', level: 'Easy' },
    { q: 'What does the % operator do? Give a use case.', a: '% returns the remainder of a division: 10 % 3 is 1. Use cases: checking even/odd (n % 2 === 0), cycling through items (index % length), or running something every nth time.', level: 'Easy' },
    { q: 'What is short-circuit evaluation?', a: '&& and || stop evaluating as soon as the result is known. a && b returns a if a is falsy, else b. a || b returns a if a is truthy, else b. The right side is not even evaluated when it is not needed, which is used for defaults (name || "Guest") and guards (user && user.name).', level: 'Medium' },
    { q: 'What is the difference between || and ???', a: '|| returns the right side when the left is any falsy value (false, 0, "", null, undefined, NaN). ?? returns the right side only when the left is null or undefined. So 0 || 10 is 10 but 0 ?? 10 is 0.', level: 'Medium' },
    { q: 'What is optional chaining?', a: 'The ?. operator reads a property, index or calls a method only if the value on its left is not null/undefined; otherwise it returns undefined instead of throwing a TypeError. Example: user?.address?.city, arr?.[0], obj.method?.().', level: 'Easy' },
    { q: 'Output-based: what does this print?\nlet i = 5;\nconsole.log(i++ + ++i);', a: '12. i++ gives 5 (i becomes 6), then ++i makes i 7 and gives 7. 5 + 7 = 12.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log(null || "a");\nconsole.log(null ?? "a");\nconsole.log("" ?? "a");\nconsole.log(0 || null);', a: 'It prints:\na\na\n(an empty string, shown as a blank line)\nnull\n"" is not null/undefined, so ?? keeps the empty string. 0 || null: 0 is falsy, so || returns the right side null.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log(2 + 3 * 2 ** 2);\nconsole.log(17 % 5, -17 % 5);', a: 'It prints:\n14\n2 -2\n** first: 2 ** 2 = 4, then 3 * 4 = 12, then 2 + 12 = 14. The remainder takes the sign of the left operand, so -17 % 5 is -2.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst x = 7;\nconsole.log(x > 5 ? x > 10 ? "big" : "medium" : "small");', a: 'medium. 7 > 5 is true, so the inner ternary runs: 7 > 10 is false, so "medium". (Nested ternaries are legal but hard to read.)', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst o = {};\nconsole.log(o.a?.b);\nconsole.log(o.a.b);', a: 'The first line prints undefined. The second throws TypeError: Cannot read properties of undefined (reading \'b\') because o.a is undefined and there is no ?. guard.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Given seconds = 3725, compute and print hours, minutes and remaining seconds using / , Math.floor and %.',
      hint: 'hours = Math.floor(s / 3600); minutes = Math.floor((s % 3600) / 60); secs = s % 60.',
      solution: `const s = 3725;
const hours = Math.floor(s / 3600);
const minutes = Math.floor((s % 3600) / 60);
const secs = s % 60;
console.log(hours + "h " + minutes + "m " + secs + "s"); // 1h 2m 5s`,
    },
    {
      task: 'Write a ternary that prints "Free shipping" if cartTotal >= 500, otherwise "Add X more for free shipping" with the correct X.',
      hint: 'X = 500 - cartTotal.',
      solution: `const cartTotal = 420;
const msg = cartTotal >= 500 ? "Free shipping" : "Add " + (500 - cartTotal) + " more for free shipping";
console.log(msg); // Add 80 more for free shipping`,
    },
    {
      task: 'A config object may or may not contain config.ui.fontSize (it can legally be 0). Print the font size or 16 as default, safely.',
      hint: 'Combine ?. and ??.',
      solution: `const config1 = { ui: { fontSize: 0 } };
const config2 = {};
console.log(config1.ui?.fontSize ?? 16); // 0
console.log(config2.ui?.fontSize ?? 16); // 16`,
    },
    {
      task: 'Check if a year is a leap year: divisible by 4 and not by 100, OR divisible by 400. Test 2024, 1900 and 2000.',
      hint: '(y % 4 === 0 && y % 100 !== 0) || y % 400 === 0',
      solution: `for (const y of [2024, 1900, 2000]) {
  const leap = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
  console.log(y, leap);
}
// 2024 true, 1900 false, 2000 true`,
    },
    {
      task: 'Use compound assignment to update a wallet: start 1000, add 250, subtract 75, double it, then take 10% off. Print after each step.',
      hint: '+=, -=, *=, and *= 0.9',
      solution: `let wallet = 1000;
wallet += 250; console.log(wallet); // 1250
wallet -= 75;  console.log(wallet); // 1175
wallet *= 2;   console.log(wallet); // 2350
wallet *= 0.9; console.log(wallet); // 2115`,
    },
  ],
  quiz: [
    { question: 'What is 15 % 4?', options: ['3', '3.75', '4', '0'], answer: 0, explanation: '15 = 4 x 3 + 3, so the remainder is 3.' },
    { question: 'What does 0 ?? 100 return?', options: ['100', 'null', '0', 'undefined'], answer: 2, explanation: '?? only replaces null or undefined; 0 is kept.' },
    { question: 'What does "Hi" && 0 && "Bye" return?', options: ['"Hi"', '"Bye"', 'false', '0'], answer: 3, explanation: '&& returns the first falsy value, which is 0.' },
    { question: 'let n = 3; const m = n++; What are m and n?', options: ['m=4, n=4', 'm=3, n=4', 'm=3, n=3', 'm=4, n=3'], answer: 1, explanation: 'Postfix returns the old value (3) then increments n to 4.' },
    { question: 'What does user?.profile?.age return if user is undefined?', options: ['TypeError', 'null', 'undefined', '0'], answer: 2, explanation: 'Optional chaining short-circuits to undefined.' },
  ],
};
