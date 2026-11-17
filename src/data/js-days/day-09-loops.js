export default {
  id: 'day-09-loops',
  title: 'Loops: for, while, do-while, for...of, for...in, break/continue',
  module: 'Module 2: Functions & Arrays',
  day: 9,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Loops repeat code without copy-pasting it: print 100 invoices, total a cart, search a list. Learn the classic for loop, while and do-while, the modern for...of for arrays and strings, for...in for object keys, and how break and continue control a loop.',
  objectives: [
    'Write for loops with an initialiser, condition and update',
    'Use while and do-while and explain how they differ',
    'Loop over arrays and strings with for...of and over object keys with for...in',
    'Control loops with break and continue, including nested loops',
    'Avoid infinite loops and off-by-one errors',
  ],
  theory: [
    {
      heading: 'Why loops?',
      content: 'A **loop** repeats a block of code while a condition is true.\n\nAnalogy: a teacher taking attendance does the same thing for every student: read name, wait for "present", mark it. Instead of writing that 60 times, you write it **once** inside a loop.\n\nEach single repetition is called an **iteration**.\n\nJavaScript loops:\n- `for`: when you know how many times (counting)\n- `while`: repeat while a condition is true (unknown count)\n- `do...while`: like while but runs **at least once**\n- `for...of`: go through **values** of an array, string, Map, Set\n- `for...in`: go through **keys** of an object\n- Array methods like forEach/map (Day 15)',
    },
    {
      heading: 'The for loop',
      content: 'The classic `for` loop has three parts inside the brackets, separated by semicolons:\n\n1. **Initialiser**: runs once at the start: `let i = 0`\n2. **Condition**: checked before every iteration; the loop stops when it is false: `i < 5`\n3. **Update**: runs after every iteration: `i++`\n\nFlow: init -> check -> body -> update -> check -> body -> update ... -> check is false -> exit.\n\nTo loop over an array by index, go from `0` to `arr.length - 1`, which is `i < arr.length`.',
      syntax: `for (let i = 0; i < 5; i++) {
  console.log("Iteration", i); // 0,1,2,3,4
}

const fruits = ["apple", "mango", "kiwi"];
for (let i = 0; i < fruits.length; i++) {
  console.log(i, fruits[i]);
}`,
      tip: 'Off-by-one error: using i <= arr.length reads one item too far and gives undefined. Use i < arr.length.',
    },
    {
      heading: 'while and do...while',
      content: '`while (condition) { ... }` checks the condition **before** each iteration. If it is false at the start, the body never runs. Use it when you do not know the number of iterations in advance, for example "keep dividing until the number is less than 10" or "retry until success".\n\n`do { ... } while (condition);` runs the body **first**, then checks. So it always runs **at least once**. Example: show a menu at least once, then repeat while the user does not choose Exit.\n\n**Infinite loop danger:** if the condition never becomes false (you forget `i++`), the loop runs forever and freezes the page. Always make sure something inside the loop moves toward the exit.',
      syntax: `let balance = 1000;
let years = 0;
while (balance < 2000) {
  balance *= 1.1;
  years++;
}
console.log(years); // 8

let n = 10;
do {
  console.log("runs once even though n > 5:", n);
} while (n < 5);`,
    },
    {
      heading: 'for...of: loop over values',
      content: '`for (const item of iterable)` gives you each **value** directly, no index needed. It works with arrays, strings, Maps, Sets and other iterables.\n\nIt is the cleanest way to loop over an array when you only need the values. Use `const` for the loop variable because a new binding is created for each iteration.\n\nNeed the index too? Use `for (const [i, item] of arr.entries())`.',
      syntax: `const marks = [70, 85, 90];
let total = 0;
for (const m of marks) {
  total += m;
}
console.log(total); // 245

for (const ch of "Hi!") {
  console.log(ch); // H, i, !
}`,
    },
    {
      heading: 'for...in: loop over object keys',
      content: '`for (const key in object)` gives you each **property name (key)** of an object. Use `object[key]` to read the value.\n\n**Do not use for...in on arrays**: it gives indexes as **strings** ("0", "1"), can include extra inherited properties, and the order is not something you should rely on for arrays. Use for...of or a classic for for arrays.\n\nMemory trick: for...**in** gives the keys (the labels **in** the object); for...**of** gives the values (the items **of** the list).',
      syntax: `const student = { name: "Asha", age: 21, city: "Pune" };
for (const key in student) {
  console.log(key, "=", student[key]);
}`,
    },
    {
      heading: 'break and continue',
      content: '- `break` **exits the loop immediately**. Use it when you found what you were searching for.\n- `continue` **skips the rest of the current iteration** and jumps to the next one. Use it to ignore invalid items.\n\nIn **nested loops**, break and continue affect only the **innermost** loop. To break out of an outer loop, you can use a **label**: `outer: for (...) { for (...) { break outer; } }`, though usually moving the code into a function and using `return` is cleaner.\n\nComing next (Day 10): functions.',
      syntax: `for (let i = 1; i <= 10; i++) {
  if (i % 2 === 0) continue; // skip even
  if (i > 7) break;          // stop after 7
  console.log(i);            // 1, 3, 5, 7
}`,
    },
  ],
  examples: [
    {
      title: 'Multiplication table and sum with for',
      scenario: 'Print the 7 times table and calculate the sum of numbers from 1 to 100.',
      steps: [
        'Write a for loop from 1 to 10 for the table',
        'Use a template literal to print each line',
        'Write another for loop that adds 1..100 into a total',
        'Click Run',
      ],
      code: `const n = 7;
for (let i = 1; i <= 10; i++) {
  console.log(\`\${n} x \${i} = \${n * i}\`);
}

let sum = 0;
for (let i = 1; i <= 100; i++) {
  sum += i;
}
console.log("Sum 1..100 =", sum);`,
      playground: {
        js: `const n = 7;
for (let i = 1; i <= 10; i++) {
  console.log(\`\${n} x \${i} = \${n * i}\`);
}

let sum = 0;
for (let i = 1; i <= 100; i++) {
  sum += i;
}
console.log("Sum 1..100 =", sum);`,
      },
      result: `7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70
Sum 1..100 = 5050`,
      explanation: 'The loop variable i starts at 1 and stops after 10 because the condition is i <= 10. The accumulator pattern (sum = 0 before the loop, sum += i inside) is used everywhere: totals, counts and averages.',
    },
    {
      title: 'while and do...while: digits and a retry menu',
      scenario: 'Count the digits of a number with while (unknown number of steps), and simulate a menu that must be shown at least once with do...while.',
      steps: [
        'Use while to divide the number by 10 until it reaches 0',
        'Use do...while with a list of simulated user choices',
        'Stop the do...while when the user chooses "exit"',
        'Click Run',
      ],
      code: `let num = 907345;
let digits = 0;
while (num > 0) {
  num = Math.floor(num / 10);
  digits++;
}
console.log("Digits:", digits);

const choices = ["balance", "deposit", "exit", "withdraw"];
let step = 0;
let choice;
do {
  choice = choices[step];
  console.log("Menu shown, user chose:", choice);
  step++;
} while (choice !== "exit");`,
      playground: {
        js: `let num = 907345;
let digits = 0;
while (num > 0) {
  num = Math.floor(num / 10);
  digits++;
}
console.log("Digits:", digits);

const choices = ["balance", "deposit", "exit", "withdraw"];
let step = 0;
let choice;
do {
  choice = choices[step];
  console.log("Menu shown, user chose:", choice);
  step++;
} while (choice !== "exit");`,
      },
      result: `Digits: 6
Menu shown, user chose: balance
Menu shown, user chose: deposit
Menu shown, user chose: exit`,
      explanation: 'Each division by 10 removes the last digit, so the loop runs 6 times. In do...while the body runs before the condition is checked; it stops right after "exit", so "withdraw" is never reached.',
    },
    {
      title: 'for...of vs for...in',
      scenario: 'Calculate the total of a cart (array of prices) and print the details of a product object.',
      steps: [
        'Use for...of on the array of prices',
        'Use for...of with entries() to get index and value',
        'Use for...in on a product object',
        'Click Run',
      ],
      code: `const prices = [250, 99, 1200];
let total = 0;
for (const p of prices) {
  total += p;
}
console.log("Total:", total);

for (const [i, p] of prices.entries()) {
  console.log("Item", i + 1, "costs", p);
}

const product = { name: "Keyboard", brand: "Logi", price: 1499 };
for (const key in product) {
  console.log(key + ": " + product[key]);
}`,
      playground: {
        js: `const prices = [250, 99, 1200];
let total = 0;
for (const p of prices) {
  total += p;
}
console.log("Total:", total);

for (const [i, p] of prices.entries()) {
  console.log("Item", i + 1, "costs", p);
}

const product = { name: "Keyboard", brand: "Logi", price: 1499 };
for (const key in product) {
  console.log(key + ": " + product[key]);
}`,
      },
      result: `Total: 1549
Item 1 costs 250
Item 2 costs 99
Item 3 costs 1200
name: Keyboard
brand: Logi
price: 1499`,
      explanation: 'for...of gives each value of the array. entries() gives [index, value] pairs, which we destructure into i and p. for...in gives each key of the object, and product[key] reads its value using bracket notation (because the key is in a variable).',
    },
    {
      title: 'break, continue and nested loops',
      scenario: 'Find the first negative transaction (stop searching once found), skip invalid entries while summing, and print a small pattern with nested loops.',
      steps: [
        'Loop over transactions and break at the first negative',
        'Loop again with continue to skip non-numbers',
        'Use nested loops to build a triangle of stars',
        'Click Run',
      ],
      code: `const tx = [500, 200, -150, 300, -20];
for (let i = 0; i < tx.length; i++) {
  if (tx[i] < 0) {
    console.log("First debit at index", i, ":", tx[i]);
    break;
  }
}

const entries = [10, "x", 20, null, 30];
let sum = 0;
for (const e of entries) {
  if (typeof e !== "number") continue;
  sum += e;
}
console.log("Valid sum:", sum);

for (let row = 1; row <= 3; row++) {
  let line = "";
  for (let col = 1; col <= row; col++) {
    line += "*";
  }
  console.log(line);
}`,
      playground: {
        js: `const tx = [500, 200, -150, 300, -20];
for (let i = 0; i < tx.length; i++) {
  if (tx[i] < 0) {
    console.log("First debit at index", i, ":", tx[i]);
    break;
  }
}

const entries = [10, "x", 20, null, 30];
let sum = 0;
for (const e of entries) {
  if (typeof e !== "number") continue;
  sum += e;
}
console.log("Valid sum:", sum);

for (let row = 1; row <= 3; row++) {
  let line = "";
  for (let col = 1; col <= row; col++) {
    line += "*";
  }
  console.log(line);
}`,
      },
      result: `First debit at index 2 : -150
Valid sum: 60
*
**
***`,
      explanation: 'break stops the loop as soon as the first negative value is found, so -20 is never checked. continue skips "x" and null and moves on to the next item. In the nested loop, the inner loop runs row times for each row, building 1, 2 and 3 stars.',
    },
  ],
  interview: [
    { q: 'What is the difference between while and do...while?', a: 'while checks the condition before each iteration, so the body may run zero times. do...while runs the body first and checks afterward, so it always runs at least once.', level: 'Easy' },
    { q: 'What is the difference between for...of and for...in?', a: 'for...of iterates over values of an iterable (arrays, strings, Map, Set). for...in iterates over enumerable property keys of an object (as strings), including inherited ones. Use for...of for arrays and for...in (or Object.keys) for objects.', level: 'Easy' },
    { q: 'What do break and continue do?', a: 'break exits the nearest enclosing loop (or switch) immediately. continue skips the remainder of the current iteration and proceeds with the next one. In nested loops they affect only the innermost loop unless a label is used.', level: 'Easy' },
    { q: 'What is an infinite loop and how do you avoid it?', a: 'A loop whose condition never becomes false, so it never ends and freezes the program. Avoid it by ensuring the loop variable is updated toward the exit condition and using a correct condition (e.g. remembering i++).', level: 'Easy' },
    { q: 'Why should for...in not be used with arrays?', a: 'It returns indexes as strings, may include inherited or custom properties added to the array, and is meant for objects. for...of, a classic for loop, or array methods are correct for arrays.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfor (let i = 0; i < 3; i++) {}\nconsole.log(typeof i);\nfor (var j = 0; j < 3; j++) {}\nconsole.log(j);', a: 'It prints:\nundefined\n3\nlet i exists only inside the loop, so outside it is not defined (typeof is safe). var j leaks out of the loop and holds the final value 3.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nfor (const k in ["a", "b"]) {\n  console.log(k, typeof k);\n}', a: 'It prints:\n0 string\n1 string\nfor...in gives keys, and array keys are string indexes.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nlet i = 0;\nwhile (i < 5) {\n  i++;\n  if (i === 3) continue;\n  if (i === 5) break;\n  console.log(i);\n}', a: 'It prints:\n1\n2\n4\ni = 3 is skipped by continue, and when i = 5 the loop breaks before logging.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nlet count = 0;\nfor (let i = 0; i < 3; i++) {\n  for (let j = 0; j < 3; j++) {\n    if (j === 1) break;\n    count++;\n  }\n}\nconsole.log(count);', a: '3. The inner break only stops the inner loop, after one count++ per outer iteration. 3 outer iterations x 1 = 3.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nlet x = 10;\ndo {\n  console.log(x);\n  x++;\n} while (x < 5);', a: '10. The body runs once before the condition 11 < 5 is checked and found false.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Print all even numbers from 2 to 20 using a for loop that increases by 2.',
      hint: 'for (let i = 2; i <= 20; i += 2)',
      solution: `for (let i = 2; i <= 20; i += 2) {
  console.log(i);
}`,
    },
    {
      task: 'Find the largest number in [34, 78, 12, 99, 45] using a for...of loop (no Math.max).',
      hint: 'Start with max = first item and update it when you see a bigger one.',
      solution: `const nums = [34, 78, 12, 99, 45];
let max = nums[0];
for (const n of nums) {
  if (n > max) max = n;
}
console.log(max); // 99`,
    },
    {
      task: 'Count the vowels in "Programming in JavaScript" using for...of over the string.',
      hint: '"aeiou".includes(ch.toLowerCase())',
      solution: `const text = "Programming in JavaScript";
let vowels = 0;
for (const ch of text) {
  if ("aeiou".includes(ch.toLowerCase())) vowels++;
}
console.log(vowels); // 7`,
    },
    {
      task: 'Reverse the number 12345 into 54321 using a while loop and % / Math.floor.',
      hint: 'reversed = reversed * 10 + n % 10; n = Math.floor(n / 10);',
      solution: `let n = 12345;
let reversed = 0;
while (n > 0) {
  reversed = reversed * 10 + (n % 10);
  n = Math.floor(n / 10);
}
console.log(reversed); // 54321`,
    },
    {
      task: 'Print FizzBuzz for 1 to 15 (Fizz for multiples of 3, Buzz for 5, FizzBuzz for both).',
      hint: 'Check % 15 first.',
      solution: `for (let i = 1; i <= 15; i++) {
  if (i % 15 === 0) console.log("FizzBuzz");
  else if (i % 3 === 0) console.log("Fizz");
  else if (i % 5 === 0) console.log("Buzz");
  else console.log(i);
}`,
    },
    {
      task: 'Given const scores = { asha: 82, ravi: 45, meera: 91 }, use for...in to print only students who scored 50 or more.',
      hint: 'scores[name] gives the score.',
      solution: `const scores = { asha: 82, ravi: 45, meera: 91 };
for (const name in scores) {
  if (scores[name] >= 50) {
    console.log(name, scores[name]);
  }
}`,
    },
  ],
  quiz: [
    { question: 'How many times does for (let i = 0; i < 5; i++) run?', options: ['4', '6', '5', 'Infinite'], answer: 2, explanation: 'i takes values 0,1,2,3,4: five iterations.' },
    { question: 'Which loop always runs its body at least once?', options: ['do...while', 'while', 'for', 'for...of'], answer: 0, explanation: 'do...while checks the condition after the body.' },
    { question: 'What does for...in give you when looping over an object?', options: ['Values', 'Keys', '[key, value] pairs', 'Indexes as numbers'], answer: 1, explanation: 'for...in iterates over property keys.' },
    { question: 'What does continue do?', options: ['Exits the loop', 'Restarts the loop from the first iteration', 'Pauses the loop', 'Skips to the next iteration'], answer: 3, explanation: 'continue skips the rest of the current iteration.' },
    { question: 'Which loop is best for reading values of an array?', options: ['for...in', 'do...while', 'for...of', 'switch'], answer: 2, explanation: 'for...of gives each value directly.' },
  ],
};
