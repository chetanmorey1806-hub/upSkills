export default {
  id: 'day-05-type-conversion-coercion',
  title: 'Type Conversion and Coercion, == vs ===, Truthy and Falsy',
  module: 'Module 1: JavaScript Basics',
  day: 5,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'JavaScript often changes one type into another, sometimes because you asked (conversion) and sometimes automatically (coercion). Learn the rules, why == can surprise you, why === is safer, and which values count as truthy or falsy.',
  objectives: [
    'Convert values explicitly with Number(), String() and Boolean()',
    'Predict implicit coercion with +, -, *, / and comparisons',
    'Explain the difference between == and === with examples',
    'Memorise the falsy values and use truthiness in conditions',
    'Answer common output-based coercion interview questions',
  ],
  theory: [
    {
      heading: 'Conversion vs coercion',
      content: '**Type conversion** (explicit / type casting) is when **you** change the type on purpose: `Number("42")`.\n\n**Type coercion** (implicit) is when **JavaScript** changes the type automatically because an operator needs it: `"5" * 2` becomes `10`.\n\nAnalogy: conversion is you exchanging rupees for dollars at a counter. Coercion is a shop automatically converting your money at its own rate, sometimes not the rate you expected.\n\nWhy does this matter? Values from HTML inputs, URLs and prompts are **always strings**. If you add two input values without converting, `"10" + "20"` gives `"1020"`, not 30.',
    },
    {
      heading: 'Explicit conversion: Number(), String(), Boolean()',
      content: '**To number** with `Number(value)` (or unary plus `+value`):\n- `Number("42")` is 42, `Number("3.5")` is 3.5\n- `Number("")` is 0, `Number("  7  ")` is 7 (spaces are trimmed)\n- `Number("12px")` is **NaN** (the whole string must be numeric; parseInt handles "12px", Day 7)\n- `Number(true)` is 1, `Number(false)` is 0\n- `Number(null)` is 0, `Number(undefined)` is NaN\n\n**To string** with `String(value)` or `value.toString()` or a template literal:\n- `String(123)` is "123", `String(null)` is "null", `String([1,2])` is "1,2"\n- `null.toString()` throws an error, so `String()` is safer.\n\n**To boolean** with `Boolean(value)` or double NOT `!!value`:\n- See the falsy list below. Everything else becomes true.',
      syntax: `console.log(Number("42") + 1);  // 43
console.log(+"7" + 3);          // 10
console.log(String(99) + 1);    // "991"
console.log(Boolean("hello"));  // true
console.log(!!0);               // false`,
    },
    {
      heading: 'Implicit coercion rules with operators',
      content: '**The + operator is special.** If **either side is a string**, + joins them as strings.\n- `"5" + 2` is "52", `2 + "5"` is "25"\n- `1 + 2 + "3"` is "33" (left to right: 1+2=3, then 3+"3")\n- `"1" + 2 + 3` is "123"\n\n**Other maths operators (-, *, /, %) only work on numbers**, so they convert strings to numbers:\n- `"10" - 2` is 8, `"6" * "2"` is 12, `"abc" - 1` is NaN\n\n**Booleans and null** become numbers in maths: `true + 1` is 2, `null + 5` is 5, `undefined + 5` is NaN.\n\n**Comparisons** `<, >` between a string and a number convert the string to a number: `"10" > 9` is true. Two strings are compared alphabetically: `"10" > "9"` is false.',
      tip: 'Memory trick: "+ loves strings, the others love numbers".',
    },
    {
      heading: '== vs ===',
      content: '`===` **strict equality**: no conversion. Same type and same value, otherwise false.\n\n`==` **loose equality**: if types differ, JavaScript converts them first, using rules that are hard to remember:\n- `5 == "5"` is true (string converted to number)\n- `0 == ""` is true\n- `0 == false` is true\n- `"1" == true` is true (true becomes 1)\n- `null == undefined` is true, but `null == 0` is false\n- `NaN == NaN` is false (NaN equals nothing, not even itself)\n\nThese surprises cause real bugs, so the professional rule is: **always use === and !==**. The only common exception some teams allow is `value == null`, which checks for both null and undefined at once.',
      syntax: `console.log(5 == "5");   // true
console.log(5 === "5");  // false
console.log(0 == false); // true
console.log(0 === false);// false`,
    },
    {
      heading: 'Truthy and falsy values',
      content: 'In an `if`, `while`, `&&`, `||`, `!` or ternary, any value is treated as a boolean. Values that act as false are **falsy**; everything else is **truthy**.\n\n**The falsy list** (memorise it, there are only 8):\n1. `false`\n2. `0`\n3. `-0`\n4. `0n` (bigint zero)\n5. `""` (empty string)\n6. `null`\n7. `undefined`\n8. `NaN`\n\n**Everything else is truthy**, including some surprises:\n- `"0"` (a non-empty string)\n- `"false"` (a non-empty string)\n- `" "` (a string with a space)\n- `[]` (empty array) and `{}` (empty object)\n- `-1` and `Infinity`',
      points: [
        'Check an empty array with arr.length === 0, not if (arr)',
        'if (name) is a quick way to check that a string is not empty',
        'Be careful: if (count) is false when count is 0, which might be a valid value',
      ],
    },
    {
      heading: 'Best practices to avoid coercion bugs',
      content: '- Convert input **as soon as you receive it**: `const qty = Number(input.value);`\n- Use `===` and `!==` everywhere.\n- Use `Number.isNaN(x)` to check a failed conversion.\n- Use template literals for building strings so the intention is clear: `` `Total: ${total}` `` (Day 6).\n- Use `??` instead of `||` when 0 or "" are valid values (Day 4).\n\nComing next (Day 6): strings and their methods.',
    },
  ],
  examples: [
    {
      title: 'Adding two input values correctly',
      scenario: 'A form gives you two quantities as strings "10" and "20". Show the bug and then the fix.',
      steps: [
        'Store the values as strings (like input.value would give)',
        'Add them directly and see the bug',
        'Convert with Number() and with unary + and add again',
        'Click Run',
      ],
      code: `const qty1 = "10";
const qty2 = "20";
console.log(qty1 + qty2);
console.log(Number(qty1) + Number(qty2));
console.log(+qty1 + +qty2);
console.log(Number("12px"), Number(""), Number("  7 "));`,
      playground: {
        js: `const qty1 = "10";
const qty2 = "20";
console.log(qty1 + qty2);
console.log(Number(qty1) + Number(qty2));
console.log(+qty1 + +qty2);
console.log(Number("12px"), Number(""), Number("  7 "));`,
      },
      result: `1020
30
30
NaN 0 7`,
      explanation: 'With two strings, + concatenates: "1020". After converting with Number() (or unary +) both are numbers and + adds them. Number() requires the whole string to be numeric, so "12px" is NaN; an empty string becomes 0; surrounding spaces are ignored.',
    },
    {
      title: 'Predict implicit coercion',
      scenario: 'Common interview lines: guess each result before clicking Run.',
      steps: [
        'Read each expression and write down your guess',
        'Click Run',
        'Compare and re-read the "+ loves strings" rule for any you missed',
      ],
      code: `console.log("5" + 2);
console.log("5" - 2);
console.log("5" * "2");
console.log(1 + 2 + "3");
console.log("1" + 2 + 3);
console.log(true + 1);
console.log(null + 5);
console.log(undefined + 5);
console.log("abc" * 2);
console.log("10" > 9, "10" > "9");`,
      playground: {
        js: `console.log("5" + 2);
console.log("5" - 2);
console.log("5" * "2");
console.log(1 + 2 + "3");
console.log("1" + 2 + 3);
console.log(true + 1);
console.log(null + 5);
console.log(undefined + 5);
console.log("abc" * 2);
console.log("10" > 9, "10" > "9");`,
      },
      result: `52
3
10
33
123
2
5
NaN
NaN
true false`,
      explanation: '+ with a string concatenates; - and * convert to numbers. Evaluation is left to right: 1 + 2 = 3, then 3 + "3" = "33"; but "1" + 2 = "12", then "12" + 3 = "123". true is 1, null is 0, undefined is NaN. "abc" cannot become a number, so NaN. "10" > 9 compares numbers (10 > 9) but "10" > "9" compares text, and "1" comes before "9".',
    },
    {
      title: '== vs === side by side',
      scenario: 'Print a comparison table showing why loose equality is confusing.',
      steps: [
        'Make an array of pairs [a, b]',
        'Loop over them and print a == b and a === b',
        'Click Run and study the differences',
      ],
      code: `const show = (v) => (typeof v === "string" ? '"' + v + '"' : String(v));
const pairs = [[5, "5"], [0, ""], [0, false], ["1", true], [null, undefined], [null, 0], [NaN, NaN]];
for (const [a, b] of pairs) {
  console.log(show(a), "vs", show(b), "| ==", a == b, "| ===", a === b);
}`,
      playground: {
        js: `const show = (v) => (typeof v === "string" ? '"' + v + '"' : String(v));
const pairs = [[5, "5"], [0, ""], [0, false], ["1", true], [null, undefined], [null, 0], [NaN, NaN]];
for (const [a, b] of pairs) {
  console.log(show(a), "vs", show(b), "| ==", a == b, "| ===", a === b);
}`,
      },
      result: `5 vs "5" | == true | === false
0 vs "" | == true | === false
0 vs false | == true | === false
"1" vs true | == true | === false
null vs undefined | == true | === false
null vs 0 | == false | === false
NaN vs NaN | == false | === false`,
      explanation: 'With ==, different types are converted (strings and booleans to numbers), so many pairs become equal. === never converts, so all are false. null only loosely equals undefined, not 0. NaN is never equal to anything, even itself. The small show() helper wraps strings in quotes so you can see which values are strings. (Arrow functions like show are covered on Day 10.)',
    },
    {
      title: 'Truthy and falsy checker',
      scenario: 'Check a list of tricky values to see which ones an if statement treats as true.',
      steps: [
        'Put tricky values in an array',
        'For each value, print it and Boolean(value)',
        'Notice "0", "false", [] and {} are truthy',
      ],
      code: `const show = (v) => (typeof v === "string" ? '"' + v + '"' : Array.isArray(v) ? "[]" : typeof v === "object" && v !== null ? "{}" : String(v));
const values = [0, "", "0", "false", " ", null, undefined, NaN, [], {}, -1];
for (const v of values) {
  console.log(show(v), "->", Boolean(v));
}`,
      playground: {
        js: `const show = (v) => (typeof v === "string" ? '"' + v + '"' : Array.isArray(v) ? "[]" : typeof v === "object" && v !== null ? "{}" : String(v));
const values = [0, "", "0", "false", " ", null, undefined, NaN, [], {}, -1];
for (const v of values) {
  console.log(show(v), "->", Boolean(v));
}`,
      },
      result: `0 -> false
"" -> false
"0" -> true
"false" -> true
" " -> true
null -> false
undefined -> false
NaN -> false
[] -> true
{} -> true
-1 -> true`,
      explanation: 'Only values from the falsy list (0, "", null, undefined, NaN, false, -0, 0n) are false. Any non-empty string, including "0", "false" and " ", is truthy. Empty arrays and objects are truthy too.',
    },
  ],
  interview: [
    { q: 'What is the difference between type conversion and type coercion?', a: 'Conversion is explicit: the developer calls Number(), String(), Boolean() etc. Coercion is implicit: JavaScript converts automatically when an operator or comparison needs a different type, e.g. "5" * 2 becomes 10.', level: 'Easy' },
    { q: 'List all falsy values in JavaScript.', a: 'false, 0, -0, 0n, "" (empty string), null, undefined and NaN. Everything else, including "0", "false", [] and {}, is truthy.', level: 'Easy' },
    { q: 'Why is === preferred over ==?', a: '=== does not convert types, so comparisons are predictable. == applies complex coercion rules (0 == "" is true, "1" == true is true), which leads to bugs. Use === and convert explicitly if needed.', level: 'Easy' },
    { q: 'How do you check whether a conversion failed and produced NaN?', a: 'Use Number.isNaN(value). You cannot use value === NaN because NaN is not equal to itself. The global isNaN() also coerces its argument first (isNaN("abc") is true), so Number.isNaN is more precise.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log([] + []);\nconsole.log([] + {});\nconsole.log([1, 2] + [3]);', a: 'It prints:\n(an empty string)\n[object Object]\n1,23\nArrays and objects are converted to strings for +: [] becomes "", {} becomes "[object Object]", [1,2] becomes "1,2" and [3] becomes "3".', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconsole.log("3" + 4 + 5);\nconsole.log(3 + 4 + "5");\nconsole.log("3" - 4 + 5);', a: 'It prints:\n345\n75\n4\nLeft to right: "3"+4 = "34", +5 = "345". 3+4 = 7, then 7+"5" = "75". "3"-4 = -1 (number), then -1 + 5 = 4.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log(null == 0, null >= 0, undefined == 0);', a: 'false true false. For ==, null only equals undefined. But >= converts null to the number 0, so 0 >= 0 is true. undefined == 0 is false.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nif ("0") console.log("A");\nif ([]) console.log("B");\nif (0) console.log("C");\nconsole.log(!!"false");', a: 'It prints:\nA\nB\ntrue\n"0" and [] are truthy, 0 is falsy so C is not printed, and "false" is a non-empty string so !! gives true.', level: 'Medium' },
    { q: 'What does the unary + operator do?', a: 'It converts its operand to a number, like Number(). +"42" is 42, +"" is 0, +true is 1, +"abc" is NaN.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log(NaN === NaN, Number.isNaN(NaN), isNaN("hello"), Number.isNaN("hello"));', a: 'false true true false. NaN is never equal to itself. Global isNaN converts "hello" to NaN first and returns true; Number.isNaN does not convert, and "hello" is a string, not NaN, so false.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'You receive price = "499" and qty = "3" as strings. Calculate the correct total and print "Total: 1497".',
      hint: 'Convert with Number() before multiplying (* would coerce anyway, but be explicit).',
      solution: `const price = "499";
const qty = "3";
const total = Number(price) * Number(qty);
console.log("Total: " + total);`,
    },
    {
      task: 'Write a function-free snippet that reads an input string and prints "Invalid number" if it cannot be converted, otherwise prints the number doubled. Test with "21" and "abc".',
      hint: 'Use Number.isNaN after converting.',
      solution: `for (const input of ["21", "abc"]) {
  const n = Number(input);
  if (Number.isNaN(n)) {
    console.log("Invalid number");
  } else {
    console.log(n * 2);
  }
}
// 42, Invalid number`,
    },
    {
      task: 'Given a list of usernames ["asha", "", "  ", null, "ravi"], print only those that are truthy AND not just spaces.',
      hint: 'Use if (name && name.trim()).',
      solution: `const names = ["asha", "", "  ", null, "ravi"];
for (const name of names) {
  if (name && name.trim()) {
    console.log(name);
  }
}
// asha, ravi`,
    },
    {
      task: 'Rewrite these loose comparisons using === with explicit conversion so they still give true: "10" == 10, true == 1.',
      hint: 'Number("10") === 10, Number(true) === 1.',
      solution: `console.log(Number("10") === 10); // true
console.log(Number(true) === 1);  // true`,
    },
  ],
  quiz: [
    { question: 'What is "8" - "3"?', options: ['"83"', '5', 'NaN', '"5"'], answer: 1, explanation: '- converts both strings to numbers.' },
    { question: 'Which value is truthy?', options: ['0', '""', 'null', '"0"'], answer: 3, explanation: 'Any non-empty string is truthy, including "0".' },
    { question: 'What is 0 == false?', options: ['true', 'false', 'TypeError', 'undefined'], answer: 0, explanation: '== converts false to 0, so 0 == 0 is true.' },
    { question: 'What does Number("12px") return?', options: ['12', '"12"', 'NaN', '0'], answer: 2, explanation: 'Number requires the entire string to be numeric.' },
    { question: 'What is 1 + "1" - 1?', options: ['1', '11', '"111"', '10'], answer: 3, explanation: '1 + "1" = "11", then "11" - 1 = 10.' },
  ],
};
