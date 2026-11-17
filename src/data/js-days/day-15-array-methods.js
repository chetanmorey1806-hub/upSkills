export default {
  id: 'day-15-array-methods',
  title: 'Array Methods: forEach, map, filter, reduce, find, some, every, sort',
  module: 'Module 2: Functions & Arrays',
  day: 15,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Modern JavaScript processes lists with callback-based array methods instead of manual loops. Learn forEach, map, filter, reduce, find/findIndex, some, every and sort: what each returns, when to use which, how to chain them, and the classic sort() trap with numbers.',
  objectives: [
    'Use forEach for side effects and know it returns undefined',
    'Transform arrays with map and select items with filter',
    'Combine values into one result with reduce (sum, count, group)',
    'Search with find/findIndex and test with some/every',
    'Sort numbers, strings and objects correctly with a compare function, and chain methods',
  ],
  theory: [
    {
      heading: 'Callback methods: the big picture',
      content: 'Each of these methods takes a **callback function** (Day 10) and calls it **once for every item** in the array. The callback receives up to three arguments: `(item, index, array)`. Usually you only need `item`.\n\nAnalogy: an array is a **conveyor belt** of products in a factory. Each method is a different station:\n- **forEach**: a worker who looks at each item and does something (prints a label). Produces nothing new.\n- **map**: a painting station. Every item goes in, a changed item comes out. Same count.\n- **filter**: a quality check. Only items that pass go through. Same or fewer items.\n- **reduce**: a packing station. All items are combined into **one** box (a total, an object...).\n- **find**: a search. Stops at the first matching item.\n- **some/every**: an inspector answering yes/no.\n- **sort**: rearranges the belt.\n\nExcept for sort (and forEach which returns nothing), these methods **do not change the original array**.',
      syntax: `const prices = [100, 250, 80];
prices.forEach((p, i) => console.log(i, p));
const withTax = prices.map(p => p * 1.18);
const cheap = prices.filter(p => p < 200);
const total = prices.reduce((sum, p) => sum + p, 0);`,
    },
    {
      heading: 'forEach and map',
      content: '**forEach(callback)** runs the callback for each item. It always **returns undefined**, so you cannot chain after it. Use it for **side effects**: logging, updating the DOM, pushing into another array. You **cannot break** out of forEach (use a for...of loop if you need break).\n\n**map(callback)** returns a **new array of the same length**, where each item is whatever the callback **returns**.\n- `[1, 2, 3].map(n => n * 2)` gives `[2, 4, 6]`\n- Great for transforming data: prices to prices with tax, users to names, data to HTML strings.\n- **Common mistake**: forgetting to return inside braces: `arr.map(n => { n * 2 })` gives `[undefined, undefined, ...]`.\n- **Common mistake**: using map just to loop (ignoring the result). Use forEach for that.',
      syntax: `const users = [{ name: "Asha", age: 21 }, { name: "Ravi", age: 17 }];
const names = users.map(u => u.name);          // ["Asha", "Ravi"]
const labels = users.map((u, i) => \`\${i + 1}. \${u.name}\`);`,
    },
    {
      heading: 'filter, find, findIndex, some, every',
      content: '**filter(callback)** returns a **new array** with only the items for which the callback returns a **truthy** value. If nothing matches you get `[]`.\n\n**find(callback)** returns the **first item** that matches, or **undefined**. Stops searching as soon as it finds one.\n\n**findIndex(callback)** returns the **index** of the first match, or **-1**. (Also `findLast` and `findLastIndex` in ES2023 search from the end.)\n\n**some(callback)** returns **true** if **at least one** item matches (like ||). Stops at the first match.\n\n**every(callback)** returns **true** if **all** items match (like &&). Stops at the first failure. Note: `[].every(...)` is **true** and `[].some(...)` is **false** for an empty array.\n\nUse find/findIndex instead of indexOf when searching **objects by a property**.',
      syntax: `const products = [
  { id: 1, name: "Pen", stock: 0 },
  { id: 2, name: "Book", stock: 5 },
];
products.filter(p => p.stock > 0);     // [{ id: 2, ... }]
products.find(p => p.id === 2);        // { id: 2, ... }
products.findIndex(p => p.id === 9);   // -1
products.some(p => p.stock === 0);     // true
products.every(p => p.stock > 0);      // false`,
    },
    {
      heading: 'reduce',
      content: '**reduce(callback, initialValue)** walks through the array and **accumulates** a single result.\n\nThe callback receives `(accumulator, item, index, array)` and must **return the new accumulator**. The return value of the last call is the final result.\n\nTrace for `[5, 10, 15].reduce((sum, n) => sum + n, 0)`:\n1. sum = 0 (initial), n = 5 -> returns 5\n2. sum = 5, n = 10 -> returns 15\n3. sum = 15, n = 15 -> returns 30\n\nResult: 30.\n\nThe result can be **any type**: a number (total), a string, an object (counting or grouping), or an array.\n\n**Always pass an initial value.** Without it, reduce uses the first item as the accumulator, and on an **empty array** it throws **TypeError: Reduce of empty array with no initial value**.',
      syntax: `const cart = [{ price: 100, qty: 2 }, { price: 50, qty: 3 }];
const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0); // 350

const fruits = ["apple", "kiwi", "apple"];
const counts = fruits.reduce((acc, f) => {
  acc[f] = (acc[f] || 0) + 1;
  return acc;
}, {});  // { apple: 2, kiwi: 1 }`,
    },
    {
      heading: 'sort and the compare function',
      content: '**sort()** sorts the array **in place** (mutates it) and also returns it.\n\n**The trap:** by default, sort converts items to **strings** and compares them alphabetically. So `[10, 1, 5, 100].sort()` gives `[1, 10, 100, 5]`.\n\nFor numbers, pass a **compare function** `(a, b) => ...`:\n- return a **negative** number: a comes first\n- return **positive**: b comes first\n- return **0**: keep their order\n\nSo:\n- Ascending: `arr.sort((a, b) => a - b)`\n- Descending: `arr.sort((a, b) => b - a)`\n- Objects by number: `users.sort((a, b) => a.age - b.age)`\n- Strings properly (including accents/case rules): `names.sort((a, b) => a.localeCompare(b))`\n\nTo sort **without changing** the original: `[...arr].sort(...)` or ES2023 `arr.toSorted(...)`. Sort is **stable** (equal items keep their original order).',
      tip: 'Interview classic: [1, 2, 10].sort() returns [1, 10, 2]. Always pass a compare function for numbers.',
    },
    {
      heading: 'Chaining and choosing the right method',
      content: 'Because map, filter and sort return arrays, you can **chain** them:\n\n`orders.filter(o => o.paid).map(o => o.amount).reduce((s, a) => s + a, 0)`\n\nRead it like a sentence: "take the paid orders, get their amounts, add them up".\n\nQuick chooser:\n- Need a **new array, same length, changed items**? map\n- Need **some of the items**? filter\n- Need **one item**? find (its position? findIndex)\n- Need **yes/no**? some / every (or includes for simple values)\n- Need **one value from all items** (total, object, string)? reduce\n- Need to **do something** for each item, no result? forEach\n- Need a **different order**? sort (copy first if the original must stay)\n\nComing next (Day 16, Module 3): objects in depth.',
    },
  ],
  examples: [
    {
      title: 'forEach vs map on a product list',
      scenario: 'An online store needs to print each product, and also create a new list of prices including 18% GST without changing the original.',
      steps: [
        'Create an array of product objects',
        'Use forEach to print a line per product',
        'Use map to create an array of prices with GST',
        'Show that forEach returns undefined and the original is unchanged',
      ],
      code: `const products = [
  { name: "Mouse", price: 500 },
  { name: "Keyboard", price: 1200 },
  { name: "Monitor", price: 9000 },
];

const out = products.forEach((p, i) => {
  console.log(\`\${i + 1}. \${p.name}: Rs. \${p.price}\`);
});
console.log("forEach returned:", out);

const withGst = products.map((p) => p.price * 1.18);
console.log(JSON.stringify(withGst));

const names = products.map((p) => p.name.toUpperCase());
console.log(JSON.stringify(names));
console.log(products[0].price);`,
      playground: {
        js: `const products = [
  { name: "Mouse", price: 500 },
  { name: "Keyboard", price: 1200 },
  { name: "Monitor", price: 9000 },
];

const out = products.forEach((p, i) => {
  console.log(\`\${i + 1}. \${p.name}: Rs. \${p.price}\`);
});
console.log("forEach returned:", out);

const withGst = products.map((p) => p.price * 1.18);
console.log(JSON.stringify(withGst));

const names = products.map((p) => p.name.toUpperCase());
console.log(JSON.stringify(names));
console.log(products[0].price);`,
      },
      result: `1. Mouse: Rs. 500
2. Keyboard: Rs. 1200
3. Monitor: Rs. 9000
forEach returned: undefined
[590,1416,10620]
["MOUSE","KEYBOARD","MONITOR"]
500`,
      explanation: 'forEach runs the callback for each product (with its index) and returns undefined. map builds a brand-new array from what each callback returns, keeping the same length (3). The original product prices are not modified.',
    },
    {
      title: 'filter, find, findIndex, some and every',
      scenario: 'An HR dashboard needs: employees in the IT department, the first employee earning above 80k, whether anyone is on probation, and whether everyone has an email.',
      steps: [
        'Create an employees array of objects',
        'Use filter for all IT employees and map to get their names',
        'Use find and findIndex to search by condition',
        'Use some and every for yes/no answers, including on an empty array',
      ],
      code: `const employees = [
  { name: "Asha", dept: "IT", salary: 85000, probation: false, email: "asha@co.in" },
  { name: "Ravi", dept: "HR", salary: 50000, probation: true, email: "ravi@co.in" },
  { name: "Meera", dept: "IT", salary: 95000, probation: false, email: "" },
];

const it = employees.filter((e) => e.dept === "IT");
console.log(it.length, it.map((e) => e.name).join(", "));

const rich = employees.find((e) => e.salary > 80000);
console.log(rich.name);
console.log(employees.find((e) => e.dept === "Sales"));
console.log(employees.findIndex((e) => e.name === "Meera"));

console.log(employees.some((e) => e.probation));
console.log(employees.every((e) => e.email));
console.log([].some((x) => x), [].every((x) => x));`,
      playground: {
        js: `const employees = [
  { name: "Asha", dept: "IT", salary: 85000, probation: false, email: "asha@co.in" },
  { name: "Ravi", dept: "HR", salary: 50000, probation: true, email: "ravi@co.in" },
  { name: "Meera", dept: "IT", salary: 95000, probation: false, email: "" },
];

const it = employees.filter((e) => e.dept === "IT");
console.log(it.length, it.map((e) => e.name).join(", "));

const rich = employees.find((e) => e.salary > 80000);
console.log(rich.name);
console.log(employees.find((e) => e.dept === "Sales"));
console.log(employees.findIndex((e) => e.name === "Meera"));

console.log(employees.some((e) => e.probation));
console.log(employees.every((e) => e.email));
console.log([].some((x) => x), [].every((x) => x));`,
      },
      result: `2 Asha, Meera
Asha
undefined
2
true
false
false true`,
      explanation: 'filter returns every matching item (2 IT employees). find returns only the first match (Asha, even though Meera also earns more than 80k) and undefined if nothing matches. findIndex returns the position 2. some is true because Ravi is on probation. every is false because Meera\'s email is an empty (falsy) string. For an empty array, some is false and every is true ("vacuous truth").',
    },
    {
      title: 'reduce: total, max and counting',
      scenario: 'Compute a shopping cart total, find the most expensive item, and count orders by status, each with one reduce.',
      steps: [
        'Sum price * qty with reduce and an initial value 0',
        'Find the max price item by keeping the best so far in the accumulator',
        'Count statuses into an object accumulator',
        'Show the empty-array error without an initial value',
      ],
      code: `const cart = [
  { item: "Shirt", price: 799, qty: 2 },
  { item: "Shoes", price: 2499, qty: 1 },
  { item: "Socks", price: 99, qty: 5 },
];
const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
console.log("Total:", total);

const costliest = cart.reduce((best, c) => (c.price > best.price ? c : best));
console.log("Costliest:", costliest.item);

const statuses = ["paid", "pending", "paid", "failed", "paid"];
const counts = statuses.reduce((acc, s) => {
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify(counts));

try {
  [].reduce((a, b) => a + b);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
console.log([].reduce((a, b) => a + b, 0));`,
      playground: {
        js: `const cart = [
  { item: "Shirt", price: 799, qty: 2 },
  { item: "Shoes", price: 2499, qty: 1 },
  { item: "Socks", price: 99, qty: 5 },
];
const total = cart.reduce((sum, c) => sum + c.price * c.qty, 0);
console.log("Total:", total);

const costliest = cart.reduce((best, c) => (c.price > best.price ? c : best));
console.log("Costliest:", costliest.item);

const statuses = ["paid", "pending", "paid", "failed", "paid"];
const counts = statuses.reduce((acc, s) => {
  acc[s] = (acc[s] || 0) + 1;
  return acc;
}, {});
console.log(JSON.stringify(counts));

try {
  [].reduce((a, b) => a + b);
} catch (err) {
  console.log(err.name + ": " + err.message);
}
console.log([].reduce((a, b) => a + b, 0));`,
      },
      result: `Total: 4592
Costliest: Shoes
{"paid":3,"pending":1,"failed":1}
TypeError: Reduce of empty array with no initial value
0`,
      explanation: '799 x 2 + 2499 + 99 x 5 = 1598 + 2499 + 495 = 4592. For the max, no initial value is given, so the first item is the starting "best" and each item is compared with it. The counting reduce starts with {} and adds 1 to the key for each status; it must return acc every time. reduce on an empty array without an initial value throws; with 0 as the initial value it safely returns 0.',
    },
    {
      title: 'sort numbers, strings and objects + chaining',
      scenario: 'Sort exam scores correctly, sort student names, rank students by marks without changing the original list, then chain filter/map/reduce to get the average of passing students.',
      steps: [
        'Call sort() without a compare function on numbers and see the bug',
        'Sort ascending and descending with (a, b) => a - b and b - a',
        'Sort names with localeCompare and objects by a property on a copy',
        'Chain filter, map and reduce',
      ],
      code: `const scores = [40, 100, 9, 25, 1000];
console.log(JSON.stringify([...scores].sort()));
console.log(JSON.stringify([...scores].sort((a, b) => a - b)));
console.log(JSON.stringify([...scores].sort((a, b) => b - a)));

const names = ["ravi", "Asha", "meera", "Kiran"];
console.log(JSON.stringify([...names].sort()));
console.log(JSON.stringify([...names].sort((a, b) => a.localeCompare(b))));

const students = [
  { name: "Asha", marks: 72 },
  { name: "Ravi", marks: 35 },
  { name: "Meera", marks: 91 },
  { name: "Kiran", marks: 58 },
];
const ranked = [...students].sort((a, b) => b.marks - a.marks).map((s) => s.name);
console.log(ranked.join(" > "));
console.log(students[0].name);

const passed = students.filter((s) => s.marks >= 40);
const avg = passed.map((s) => s.marks).reduce((sum, m) => sum + m, 0) / passed.length;
console.log("Pass average:", avg.toFixed(1));`,
      playground: {
        js: `const scores = [40, 100, 9, 25, 1000];
console.log(JSON.stringify([...scores].sort()));
console.log(JSON.stringify([...scores].sort((a, b) => a - b)));
console.log(JSON.stringify([...scores].sort((a, b) => b - a)));

const names = ["ravi", "Asha", "meera", "Kiran"];
console.log(JSON.stringify([...names].sort()));
console.log(JSON.stringify([...names].sort((a, b) => a.localeCompare(b))));

const students = [
  { name: "Asha", marks: 72 },
  { name: "Ravi", marks: 35 },
  { name: "Meera", marks: 91 },
  { name: "Kiran", marks: 58 },
];
const ranked = [...students].sort((a, b) => b.marks - a.marks).map((s) => s.name);
console.log(ranked.join(" > "));
console.log(students[0].name);

const passed = students.filter((s) => s.marks >= 40);
const avg = passed.map((s) => s.marks).reduce((sum, m) => sum + m, 0) / passed.length;
console.log("Pass average:", avg.toFixed(1));`,
      },
      result: `[100,1000,25,40,9]
[9,25,40,100,1000]
[1000,100,40,25,9]
["Asha","Kiran","meera","ravi"]
["Asha","Kiran","meera","ravi"]
Meera > Asha > Kiran > Ravi
Asha
Pass average: 73.7`,
      explanation: 'Default sort compares strings: "100" < "1000" < "25" < "40" < "9" character by character, which is wrong for numbers. a - b sorts ascending, b - a descending. Default string sort puts uppercase before lowercase (here it happens to match localeCompare, but with names like "zoe" and "Ben" mixed case can give odd orders, so localeCompare is the safe choice). Sorting a copy ([...students]) leaves the original order intact. The chain keeps passing students (72, 91, 58), extracts marks, sums them (221) and divides by 3 = 73.666..., shown as 73.7.',
    },
  ],
  interview: [
    { q: 'What is the difference between forEach and map?', a: 'Both call a function for each element. forEach returns undefined and is used for side effects. map returns a new array of the same length containing the callback\'s return values, and is used for transforming data. map can be chained; forEach cannot.', level: 'Easy' },
    { q: 'What is the difference between filter and find?', a: 'filter returns a new array of all elements that pass the test (possibly empty). find returns the first element that passes, or undefined, and stops searching early.', level: 'Easy' },
    { q: 'Explain reduce with an example.', a: 'reduce(callback, initial) accumulates a single value. The callback (acc, item) returns the new accumulator for the next step. Example: [1, 2, 3].reduce((sum, n) => sum + n, 0) returns 6. It can also build objects (counting, grouping) or arrays.', level: 'Medium' },
    { q: 'Why does [1, 2, 10].sort() give [1, 10, 2]? How do you fix it?', a: 'Without a compare function, sort converts elements to strings and compares UTF-16 code units, so "10" comes before "2". Fix with a numeric compare function: arr.sort((a, b) => a - b).', level: 'Medium' },
    { q: 'Which of these methods mutate the original array: map, filter, sort, reduce, forEach?', a: 'Only sort mutates the array in place. map, filter and reduce return new values; forEach returns undefined (though the callback itself could mutate items). Use [...arr].sort() or toSorted() to sort without mutation.', level: 'Medium' },
    { q: 'What do some and every return for an empty array?', a: 'some returns false (no element satisfies the test) and every returns true (vacuous truth: no element fails the test).', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconst r = [1, 2, 3].map(n => { n * 2 });\nconsole.log(r);', a: '[undefined, undefined, undefined]. With braces the arrow function needs an explicit return; without it each callback returns undefined.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log(["1", "2", "3"].map(parseInt));', a: '[1, NaN, NaN]. map passes (item, index), so the calls are parseInt("1", 0) = 1 (radix 0 means default 10), parseInt("2", 1) = NaN (invalid radix), parseInt("3", 2) = NaN ("3" is not a binary digit). Use .map(Number) or .map(s => parseInt(s, 10)).', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconst nums = [5, 1, 4];\nconst sorted = nums.sort((a, b) => a - b);\nconsole.log(nums.join(), sorted === nums);', a: '1,4,5 true. sort mutates the original array and returns the same array reference.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst total = [1, 2, 3, 4]\n  .filter(n => n % 2 === 0)\n  .map(n => n * 10)\n  .reduce((s, n) => s + n, 0);\nconsole.log(total);', a: '60. filter keeps [2, 4], map gives [20, 40], reduce adds them: 60.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconst res = [10, 20, 30].forEach(n => n * 2);\nconsole.log(res, [3, 4].find(n => n > 5), [3, 4].findIndex(n => n > 3));', a: 'undefined undefined 1. forEach always returns undefined; find returns undefined when nothing matches; findIndex finds 4 at index 1.', level: 'Medium' },
    { q: 'How do you remove duplicates from an array?', a: 'Simplest: [...new Set(arr)] (Set is Day 21). With array methods: arr.filter((item, index) => arr.indexOf(item) === index), which keeps only the first occurrence of each value.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Given const temps = [22, 35, 18, 40, 29], create an array of temperatures in Fahrenheit using map, and an array of only the "hot" days (above 30 C) using filter.',
      hint: 'F = C * 9 / 5 + 32',
      solution: `const temps = [22, 35, 18, 40, 29];
const fahrenheit = temps.map(c => c * 9 / 5 + 32);
const hot = temps.filter(c => c > 30);
console.log(fahrenheit.join(", ")); // 71.6, 95, 64.4, 104, 84.2
console.log(hot.join(", "));        // 35, 40`,
    },
    {
      task: 'Given a users array of { name, age, active }, print the names of active adults (18+) in alphabetical order, joined by commas.',
      hint: 'filter -> map -> sort with localeCompare -> join.',
      solution: `const users = [
  { name: "Zara", age: 25, active: true },
  { name: "Arjun", age: 16, active: true },
  { name: "Bina", age: 30, active: false },
  { name: "Dev", age: 19, active: true },
];
const result = users
  .filter(u => u.active && u.age >= 18)
  .map(u => u.name)
  .sort((a, b) => a.localeCompare(b))
  .join(", ");
console.log(result); // Dev, Zara`,
    },
    {
      task: 'Use reduce to group words by their first letter: ["apple", "avocado", "banana", "blueberry", "cherry"] becomes { a: [...], b: [...], c: [...] }.',
      hint: 'acc[key] = acc[key] || []; acc[key].push(word); return acc;',
      solution: `const words = ["apple", "avocado", "banana", "blueberry", "cherry"];
const grouped = words.reduce((acc, word) => {
  const key = word[0];
  acc[key] = acc[key] || [];
  acc[key].push(word);
  return acc;
}, {});
console.log(JSON.stringify(grouped));
// {"a":["apple","avocado"],"b":["banana","blueberry"],"c":["cherry"]}`,
    },
    {
      task: 'Given an inventory of { name, qty }, use some to check if any item is out of stock, every to check if all items have qty >= 5, and find to get the first item with qty below 5.',
      hint: 'some(i => i.qty === 0), every(i => i.qty >= 5), find(i => i.qty < 5).',
      solution: `const inventory = [
  { name: "Pen", qty: 50 },
  { name: "Pencil", qty: 3 },
  { name: "Eraser", qty: 0 },
];
console.log(inventory.some(i => i.qty === 0));   // true
console.log(inventory.every(i => i.qty >= 5));   // false
console.log(inventory.find(i => i.qty < 5).name); // Pencil`,
    },
    {
      task: 'Sort products by price ascending and, for equal prices, by name alphabetically, without modifying the original array.',
      hint: 'Return a.price - b.price || a.name.localeCompare(b.name).',
      solution: `const products = [
  { name: "Cable", price: 199 },
  { name: "Adapter", price: 199 },
  { name: "Charger", price: 799 },
  { name: "Bag", price: 99 },
];
const sorted = [...products].sort((a, b) => a.price - b.price || a.name.localeCompare(b.name));
console.log(sorted.map(p => p.name).join(", ")); // Bag, Adapter, Cable, Charger
console.log(products[0].name);                    // Cable (original unchanged)`,
    },
    {
      task: 'Implement your own myMap(arr, fn) and myFilter(arr, fn) using a for loop, then test them against the built-in methods.',
      hint: 'Create a result array and push fn(item, i, arr) (map) or the item if fn(...) is truthy (filter).',
      solution: `function myMap(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) result.push(fn(arr[i], i, arr));
  return result;
}
function myFilter(arr, fn) {
  const result = [];
  for (let i = 0; i < arr.length; i++) if (fn(arr[i], i, arr)) result.push(arr[i]);
  return result;
}
const nums = [1, 2, 3, 4];
console.log(myMap(nums, n => n * 3).join(), nums.map(n => n * 3).join());           // 3,6,9,12 3,6,9,12
console.log(myFilter(nums, n => n > 2).join(), nums.filter(n => n > 2).join());   // 3,4 3,4`,
    },
  ],
  quiz: [
    { question: 'What does [1, 2, 3].map(n => n * 2) return?', options: ['[2, 4, 6]', '6', 'undefined', '[1, 2, 3]'], answer: 0, explanation: 'map returns a new array of transformed values.' },
    { question: 'What does forEach return?', options: ['A new array', 'The original array', 'undefined', 'The number of items'], answer: 2, explanation: 'forEach always returns undefined.' },
    { question: 'Which method returns the FIRST matching element?', options: ['filter', 'some', 'findIndex', 'find'], answer: 3, explanation: 'find returns the first element that passes the test (or undefined).' },
    { question: 'What is [3, 20, 100].sort() ?', options: ['[3, 20, 100]', '[100, 20, 3]', '[100, 3, 20]', '[20, 3, 100]'], answer: 2, explanation: 'Default sort compares strings: "100" < "20" < "3".' },
    { question: 'What is [1, 2, 3].reduce((a, b) => a + b, 10)?', options: ['6', '16', '10', '123'], answer: 1, explanation: 'Starting from 10: 10 + 1 + 2 + 3 = 16.' },
  ],
};
