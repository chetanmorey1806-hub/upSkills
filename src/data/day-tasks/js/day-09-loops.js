export default {
  lesson: 'day-09-loops',
  minutes: 30,
  intro: 'Repeat work with for, while, for...of and for...in, and control loops with break and continue.',
  tasks: [
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue;
  if (i > 7) break;
  console.log(i);
}`,
      expected: '1\n3\n5\n7',
      explain: '`continue` skips the rest of the current round (even numbers are skipped), `break` leaves the loop completely. When i reaches 9, `i > 7` is true and the loop stops before printing.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'for...of vs for...in. What is printed?',
      code: `const fruits = ["apple", "mango"];
for (const x of fruits) console.log(x);
for (const x in fruits) console.log(x);`,
      expected: 'apple\nmango\n0\n1',
      explain: '`for...of` gives the **values** of an array. `for...in` gives the **keys** (for arrays: the indexes as strings "0", "1"). Use for...of for arrays and for...in for object keys.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `while` and `do...while`?',
      options: ['There is no difference', 'do...while always runs its body at least once, because the condition is checked after the body', 'while always runs at least once', 'do...while cannot use break'],
      answer: 1,
      explain: '`do...while` checks the condition **after** each run, so the body runs at least once even if the condition is false at the start. It is useful for menus or "ask again until valid" input.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Print the **multiplication table** of `n` from 1 to 10 using a `for` loop. Each line must look like `7 x 1 = 7`.\n\nComplete `printTable(n)`; the tests call `printTable(7)`.',
      example: { title: 'a for loop with a template literal', code: 'for (let i = 1; i <= 3; i++) {\n  console.log(`Step ${i}`);\n}' },
      starter: 'function printTable(n) {\n  // TODO\n}\nprintTable(7);',
      solution: 'function printTable(n) {\n  for (let i = 1; i <= 10; i++) {\n    console.log(`${n} x ${i} = ${n * i}`);\n  }\n}\nprintTable(7);',
      tests: [{ log: '7 x 1 = 7\n7 x 2 = 14\n7 x 3 = 21\n7 x 4 = 28\n7 x 5 = 35\n7 x 6 = 42\n7 x 7 = 49\n7 x 8 = 56\n7 x 9 = 63\n7 x 10 = 70', msg: 'Prints the 10 lines of the table of 7' }],
      explain: 'A for loop has three parts: start (`let i = 1`), condition (`i <= 10`) and update (`i++`). Writing `i < 10` is an **off-by-one** error that would skip the last line.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `sumOfDigits(n)` that returns the sum of the digits of a positive whole number using a **while** loop.\n\nExample: `sumOfDigits(4821)` → `15`',
      example: { title: 'peeling off the last digit', code: 'let n = 4821;\nconst last = n % 10;       // 1\nn = Math.floor(n / 10);    // 482' },
      starter: 'function sumOfDigits(n) {\n  let sum = 0;\n  // TODO: while loop\n  return sum;\n}',
      solution: 'function sumOfDigits(n) {\n  let sum = 0;\n  while (n > 0) {\n    sum += n % 10;\n    n = Math.floor(n / 10);\n  }\n  return sum;\n}',
      tests: [
        { call: 'sumOfDigits(4821)', expect: 15 },
        { call: 'sumOfDigits(7)', expect: 7 },
        { call: 'sumOfDigits(1001)', expect: 2 },
      ],
      explain: '`n % 10` gives the last digit and `Math.floor(n / 10)` removes it. The loop runs while digits are left. Forgetting to change `n` inside the loop creates an **infinite loop**.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Shop stock: write `totalStock(stock)` that receives an object like `{ pens: 40, books: 12 }` and returns the total of all values using **for...in**.',
      example: { title: 'looping over object keys', code: 'const prices = { tea: 10, coffee: 20 };\nfor (const item in prices) {\n  console.log(item, prices[item]);\n}' },
      starter: 'function totalStock(stock) {\n  let total = 0;\n  // TODO\n  return total;\n}',
      solution: 'function totalStock(stock) {\n  let total = 0;\n  for (const item in stock) {\n    total += stock[item];\n  }\n  return total;\n}',
      tests: [
        { call: 'totalStock({ pens: 40, books: 12 })', expect: 52 },
        { call: 'totalStock({ a: 1, b: 2, c: 3 })', expect: 6 },
        { call: 'totalStock({})', expect: 0 },
      ],
      explain: 'for...in gives each **key**; read the value with bracket notation `stock[item]`. Writing `stock.item` looks for a key literally named "item" and gives undefined.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `firstNegative(numbers)` that returns the **first negative number** in the array using a `for...of` loop and returns early, or `null` if there is none.',
      example: { title: 'stop when found', code: 'for (const name of names) {\n  if (name.startsWith("R")) return name;\n}\nreturn null;' },
      starter: 'function firstNegative(numbers) {\n  // TODO\n}',
      solution: 'function firstNegative(numbers) {\n  for (const n of numbers) {\n    if (n < 0) return n;\n  }\n  return null;\n}',
      tests: [
        { call: 'firstNegative([4, 9, -2, -8])', expect: -2 },
        { call: 'firstNegative([1, 2, 3])', expect: null },
        { call: 'firstNegative([-5])', expect: -5 },
      ],
      explain: '`return` inside a loop stops the loop **and** the function, just like `break` plus a result. The `return null` after the loop only runs if nothing matched. Putting `return null` inside an else branch would stop at the very first item.',
    },
  ],
};
