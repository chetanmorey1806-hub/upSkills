export default {
  id: 'day-14-arrays-basics',
  title: 'Arrays: Creating, Accessing, push/pop/shift/unshift/splice/slice, includes/indexOf',
  module: 'Module 2: Functions & Arrays',
  day: 14,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Arrays store ordered lists: products in a cart, students in a class, messages in a chat. Learn to create arrays, read and update items by index, add and remove items at both ends with push/pop/shift/unshift, edit the middle with splice, copy parts with slice, and search with includes and indexOf.',
  objectives: [
    'Create arrays with literals, Array.of and Array.from and read items by index (including at(-1))',
    'Add and remove items with push, pop, shift and unshift and know what each returns',
    'Insert, delete and replace items in the middle with splice',
    'Copy part of an array with slice and explain slice vs splice',
    'Search arrays with includes, indexOf and lastIndexOf and know which methods mutate',
  ],
  theory: [
    {
      heading: 'What is an array?',
      content: 'An **array** is an **ordered list** of values stored in a single variable.\n\nAnalogy: a train. Each **coach** has a number starting at **0** (the index), and each coach carries a value (the element). You can add coaches at the end or the front, remove them, or look inside coach number 3.\n\n- Arrays can hold any types, even mixed: `[1, "two", true, null, { id: 1 }, [5, 6]]`, but in practice keep one type per array.\n- `arr.length` is the number of items.\n- Arrays are **objects** (reference type): `typeof []` is "object"; use `Array.isArray()` to check (Day 3).\n- Copying an array variable copies the reference, not the items.',
      syntax: `const fruits = ["apple", "banana", "mango"];
const empty = [];
const nums = Array.of(1, 2, 3);           // [1, 2, 3]
const letters = Array.from("abc");        // ["a", "b", "c"]
const zeros = new Array(3).fill(0);       // [0, 0, 0]
console.log(fruits.length);               // 3`,
      tip: 'new Array(3) creates an EMPTY array of length 3, not [3]. Use literals [] or Array.of() to avoid this trap.',
    },
    {
      heading: 'Accessing and updating items',
      content: '- Indexes start at **0**: `fruits[0]` is the first item, `fruits[fruits.length - 1]` the last.\n- `fruits.at(-1)` (ES2022) also gives the last item; negative numbers count from the end.\n- Reading an index that does not exist gives **undefined** (no error).\n- Update an item by assigning: `fruits[1] = "kiwi";` (works even with const, because the array itself is changed, not the variable).\n- Assigning beyond the end creates **holes** (empty slots): avoid it, use push.\n- Setting `arr.length = 0` empties the array.',
      syntax: `const colors = ["red", "green", "blue"];
console.log(colors[0]);      // "red"
console.log(colors.at(-1));  // "blue"
console.log(colors[10]);     // undefined
colors[1] = "yellow";        // ["red", "yellow", "blue"]`,
    },
    {
      heading: 'Adding and removing at the ends: push, pop, unshift, shift',
      content: 'Four methods change the array **in place** (they **mutate** it):\n\n- `push(item, ...)`: add to the **end**. Returns the **new length**.\n- `pop()`: remove from the **end**. Returns the **removed item**.\n- `unshift(item, ...)`: add to the **start**. Returns the **new length**.\n- `shift()`: remove from the **start**. Returns the **removed item**.\n\nMemory trick: **push/pop** work at the **back** (like a stack of plates). **shift/unshift** work at the **front** and shift every other item\'s index, so they are slower for very large arrays.\n\nCalling pop() or shift() on an empty array returns undefined.',
      syntax: `const queue = ["A", "B"];
queue.push("C");      // returns 3  -> ["A", "B", "C"]
queue.unshift("Z");   // returns 4  -> ["Z", "A", "B", "C"]
queue.pop();          // returns "C"
queue.shift();        // returns "Z" -> ["A", "B"]`,
      tip: 'Stack (LIFO, last in first out) = push + pop. Queue (FIFO, first in first out) = push + shift.',
    },
    {
      heading: 'splice: change the middle (mutates)',
      content: '`arr.splice(start, deleteCount, item1, item2, ...)` is the Swiss army knife for editing arrays **in place**.\n\n- **Delete**: `arr.splice(2, 1)` removes 1 item at index 2.\n- **Insert**: `arr.splice(2, 0, "x")` removes 0 items and inserts "x" at index 2.\n- **Replace**: `arr.splice(2, 1, "x")` removes 1 item and inserts "x" in its place.\n- **Remove everything from an index**: `arr.splice(2)`.\n- Negative start counts from the end.\n\nIt **returns an array of the removed items** (empty array if nothing was removed).\n\nES2023 added `toSpliced()`, which does the same but returns a **new** array and leaves the original unchanged.',
      syntax: `const list = ["a", "b", "c", "d"];
const removed = list.splice(1, 2, "X");
// removed = ["b", "c"], list = ["a", "X", "d"]`,
    },
    {
      heading: 'slice: copy a part (does not mutate)',
      content: '`arr.slice(start, end)` returns a **new array** with items from start **up to but not including** end. The original array is **not changed**.\n\n- `arr.slice(1, 3)`: items at index 1 and 2\n- `arr.slice(2)`: from index 2 to the end\n- `arr.slice(-2)`: the last 2 items\n- `arr.slice()`: a shallow copy of the whole array (same as `[...arr]`)\n\n**slice vs splice** (very common interview question):\n- slice = **copy** a piece, original unchanged, arguments (start, end)\n- splice = **cut/insert** in place, original changed, arguments (start, deleteCount, ...items), returns removed items\n\nMemory trick: splice has a "p" for "**p**ermanent change".',
    },
    {
      heading: 'Searching: includes, indexOf, lastIndexOf; and join',
      content: '- `includes(value)`: true/false. Best for "does it exist?" checks.\n- `indexOf(value)`: index of the **first** match, or **-1** if not found.\n- `lastIndexOf(value)`: index of the **last** match.\n- All use strict equality (===), so `[1, 2].includes("1")` is false.\n- Difference: `[NaN].includes(NaN)` is **true** but `[NaN].indexOf(NaN)` is **-1**.\n- They compare objects by **reference**: `[{ id: 1 }].includes({ id: 1 })` is false. To search objects by a property use `find`/`findIndex` (Day 15).\n\nOther useful basics:\n- `join(separator)`: array to string: `["a", "b"].join("-")` is "a-b"\n- `concat(other)`: merge into a new array (or use spread)\n- `reverse()`: reverses **in place** (mutates)\n\n**Mutating** methods: push, pop, shift, unshift, splice, reverse, sort, fill. **Non-mutating**: slice, concat, includes, indexOf, join, and the methods on Day 15 like map and filter.\n\nComing next (Day 15): forEach, map, filter, reduce and friends.',
    },
  ],
  examples: [
    {
      title: 'Reading and updating a class list',
      scenario: 'A teacher keeps the list of students in an array and needs to read the first, last and a missing position, then fix a spelling mistake.',
      steps: [
        'Create an array of student names',
        'Read items with [0], [length - 1] and at(-1)',
        'Read an index that does not exist',
        'Update one item and print the whole array with join',
      ],
      code: `const students = ["Asha", "Ravi", "Meeraa", "Kiran"];
console.log(students.length);
console.log(students[0], students[students.length - 1], students.at(-1));
console.log(students[10]);
students[2] = "Meera";
console.log(students.join(", "));
console.log(Array.isArray(students), typeof students);`,
      playground: {
        js: `const students = ["Asha", "Ravi", "Meeraa", "Kiran"];
console.log(students.length);
console.log(students[0], students[students.length - 1], students.at(-1));
console.log(students[10]);
students[2] = "Meera";
console.log(students.join(", "));
console.log(Array.isArray(students), typeof students);`,
      },
      result: `4
Asha Kiran Kiran
undefined
Asha, Ravi, Meera, Kiran
true object`,
      explanation: 'Indexes start at 0, so the last index is length - 1, which at(-1) gives more simply. A missing index returns undefined, not an error. Even though students is a const, we can change an item inside it. typeof says "object", so Array.isArray is the reliable check.',
    },
    {
      title: 'Stack and queue with push, pop, shift, unshift',
      scenario: 'Model browser history as a stack and a printer queue as a queue, and look at what each method returns.',
      steps: [
        'Use push and pop for the history stack',
        'Use push and shift for the print queue',
        'Use unshift to add an urgent job to the front',
        'Log return values and the arrays as JSON',
      ],
      code: `const history = ["home"];
console.log(history.push("products"));
console.log(history.push("cart"));
console.log(history.pop());
console.log(JSON.stringify(history));

const printQueue = ["doc1", "doc2"];
printQueue.push("doc3");
console.log(printQueue.shift());
console.log(printQueue.unshift("URGENT"));
console.log(JSON.stringify(printQueue));
console.log([].pop());`,
      playground: {
        js: `const history = ["home"];
console.log(history.push("products"));
console.log(history.push("cart"));
console.log(history.pop());
console.log(JSON.stringify(history));

const printQueue = ["doc1", "doc2"];
printQueue.push("doc3");
console.log(printQueue.shift());
console.log(printQueue.unshift("URGENT"));
console.log(JSON.stringify(printQueue));
console.log([].pop());`,
      },
      result: `2
3
cart
["home","products"]
doc1
3
["URGENT","doc2","doc3"]
undefined`,
      explanation: 'push and unshift return the new length (2, 3 and 3). pop and shift return the item they removed ("cart", "doc1"). The stack removes the newest item (LIFO); the queue removes the oldest (FIFO). Popping an empty array returns undefined. JSON.stringify is used to print arrays the same way in every console.',
    },
    {
      title: 'splice vs slice',
      scenario: 'Edit a playlist: remove a song, insert a song and replace a song with splice; then take the top 3 with slice without changing the list.',
      steps: [
        'Remove one item with splice(index, 1) and log what was removed',
        'Insert with splice(index, 0, item)',
        'Replace with splice(index, 1, item)',
        'Copy parts with slice and confirm the original is unchanged',
      ],
      code: `const playlist = ["Song A", "Song B", "Song C", "Song D", "Song E"];

const removed = playlist.splice(1, 1);
console.log("removed:", JSON.stringify(removed));
console.log(JSON.stringify(playlist));

playlist.splice(2, 0, "New Song");
console.log(JSON.stringify(playlist));

playlist.splice(0, 1, "Song A (Live)");
console.log(JSON.stringify(playlist));

const top3 = playlist.slice(0, 3);
const lastTwo = playlist.slice(-2);
console.log("top3:", JSON.stringify(top3));
console.log("lastTwo:", JSON.stringify(lastTwo));
console.log("length still:", playlist.length);`,
      playground: {
        js: `const playlist = ["Song A", "Song B", "Song C", "Song D", "Song E"];

const removed = playlist.splice(1, 1);
console.log("removed:", JSON.stringify(removed));
console.log(JSON.stringify(playlist));

playlist.splice(2, 0, "New Song");
console.log(JSON.stringify(playlist));

playlist.splice(0, 1, "Song A (Live)");
console.log(JSON.stringify(playlist));

const top3 = playlist.slice(0, 3);
const lastTwo = playlist.slice(-2);
console.log("top3:", JSON.stringify(top3));
console.log("lastTwo:", JSON.stringify(lastTwo));
console.log("length still:", playlist.length);`,
      },
      result: `removed: ["Song B"]
["Song A","Song C","Song D","Song E"]
["Song A","Song C","New Song","Song D","Song E"]
["Song A (Live)","Song C","New Song","Song D","Song E"]
top3: ["Song A (Live)","Song C","New Song"]
lastTwo: ["Song D","Song E"]
length still: 5`,
      explanation: 'splice changes playlist itself and returns an array of removed items. With deleteCount 0 it only inserts; with 1 plus a new item it replaces. slice returns new arrays and never touches the original, so the length stays 5.',
    },
    {
      title: 'Searching with includes and indexOf',
      scenario: 'Check whether a product is already in the wishlist, find positions of repeated tags, and see the NaN and object edge cases.',
      steps: [
        'Use includes for a yes/no check',
        'Use indexOf and lastIndexOf to find positions',
        'Remove an item safely only if indexOf finds it',
        'Test NaN and objects',
      ],
      code: `const wishlist = ["phone", "watch", "laptop"];
console.log(wishlist.includes("watch"), wishlist.includes("Watch"));

const tags = ["js", "css", "js", "html"];
console.log(tags.indexOf("js"), tags.lastIndexOf("js"), tags.indexOf("react"));

const idx = wishlist.indexOf("watch");
if (idx !== -1) wishlist.splice(idx, 1);
console.log(wishlist.join(" | "));

console.log([NaN].includes(NaN), [NaN].indexOf(NaN));
console.log([{ id: 1 }].includes({ id: 1 }));
console.log([1, 2, 3].includes("2"));`,
      playground: {
        js: `const wishlist = ["phone", "watch", "laptop"];
console.log(wishlist.includes("watch"), wishlist.includes("Watch"));

const tags = ["js", "css", "js", "html"];
console.log(tags.indexOf("js"), tags.lastIndexOf("js"), tags.indexOf("react"));

const idx = wishlist.indexOf("watch");
if (idx !== -1) wishlist.splice(idx, 1);
console.log(wishlist.join(" | "));

console.log([NaN].includes(NaN), [NaN].indexOf(NaN));
console.log([{ id: 1 }].includes({ id: 1 }));
console.log([1, 2, 3].includes("2"));`,
      },
      result: `true false
0 2 -1
phone | laptop
true -1
false
false`,
      explanation: 'Searches are case-sensitive and use strict equality, so "Watch" and "2" are not found. indexOf returns -1 when missing, so always check before using the index with splice (splice(-1, 1) would delete the LAST item!). includes can find NaN but indexOf cannot. Two separate objects are never equal, so includes on objects compares references.',
    },
  ],
  interview: [
    { q: 'What is the difference between slice and splice?', a: 'slice(start, end) returns a new array with a portion of the original and does not modify it. splice(start, deleteCount, ...items) modifies the original array in place by removing/inserting items and returns an array of the removed items.', level: 'Easy' },
    { q: 'What do push, pop, shift and unshift return?', a: 'push and unshift return the new length of the array. pop and shift return the removed element (or undefined if the array was empty).', level: 'Easy' },
    { q: 'What is the difference between includes and indexOf?', a: 'includes returns a boolean; indexOf returns the position or -1. includes uses SameValueZero, so it finds NaN; indexOf uses strict equality and cannot find NaN.', level: 'Medium' },
    { q: 'Which array methods mutate the original array?', a: 'push, pop, shift, unshift, splice, sort, reverse, fill and copyWithin. Non-mutating alternatives: slice, concat, spread, map, filter, and ES2023 toSorted, toReversed, toSpliced, with.', level: 'Medium' },
    { q: 'How do you remove a specific item from an array?', a: 'Find its index with indexOf (or findIndex for objects), check it is not -1, then splice(index, 1). Or create a new array without it using filter (Day 15): arr.filter(x => x !== item).', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconst a = [1, 2, 3];\nconsole.log(a.push(4), a.pop(), a.length);', a: '4 4 3. push returns the new length 4, pop removes and returns 4, then the length is back to 3.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst arr = [10, 20, 30, 40, 50];\nconst s = arr.slice(1, 3);\nconst sp = arr.splice(1, 3);\nconsole.log(s.join(), "|", sp.join(), "|", arr.join());', a: '20,30 | 20,30,40 | 10,50. slice(1, 3) copies indexes 1-2. splice(1, 3) removes three items from index 1, leaving 10 and 50 in arr.', level: 'Hard' },
    { q: 'Output-based: what does this print?\nconst x = [1, 2, 3];\nx[5] = 6;\nconsole.log(x.length, x[4]);', a: '6 undefined. Assigning index 5 extends the length to 6 and leaves empty slots at 3 and 4, which read as undefined.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst nums = [1, 2, 3];\nconst copy = nums;\ncopy.push(4);\nconst clone = nums.slice();\nclone.push(5);\nconsole.log(nums.length, copy.length, clone.length);', a: '4 4 5. copy is the same array as nums; clone is an independent copy made after the first push.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconsole.log([1, 2, 3].indexOf(4), [1, 2, 3].at(-1), new Array(3).length, Array.of(3).length);', a: '-1 3 3 1. 4 is not found. at(-1) is the last item. new Array(3) creates 3 empty slots, while Array.of(3) creates [3].', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a shopping list ["milk", "bread"]. Add "eggs" at the end and "butter" at the start, then remove the last item and print the list and its length.',
      hint: 'push, unshift, pop.',
      solution: `const list = ["milk", "bread"];
list.push("eggs");
list.unshift("butter");
list.pop();
console.log(list.join(", "), list.length); // butter, milk, bread 3`,
    },
    {
      task: 'Given const days = ["Mon", "Tue", "Thu", "Fri"], insert "Wed" in the correct place using splice.',
      hint: 'Index 2, delete 0 items.',
      solution: `const days = ["Mon", "Tue", "Thu", "Fri"];
days.splice(2, 0, "Wed");
console.log(days.join(" ")); // Mon Tue Wed Thu Fri`,
    },
    {
      task: 'Write a function removeItem(arr, item) that removes the first occurrence of item from arr (mutating) and returns true if removed, false if not found.',
      hint: 'indexOf then splice; guard against -1.',
      solution: `function removeItem(arr, item) {
  const i = arr.indexOf(item);
  if (i === -1) return false;
  arr.splice(i, 1);
  return true;
}
const cart = ["pen", "book", "pen"];
console.log(removeItem(cart, "pen"), cart.join()); // true book,pen
console.log(removeItem(cart, "bag"));              // false`,
    },
    {
      task: 'Paginate an array of 10 numbers (1 to 10): print page 1, 2 and 3 with 4 items per page using slice.',
      hint: 'start = (page - 1) * size; end = start + size.',
      solution: `const items = Array.from({ length: 10 }, (_, i) => i + 1);
const size = 4;
for (let page = 1; page <= 3; page++) {
  const start = (page - 1) * size;
  console.log("Page", page, items.slice(start, start + size).join(","));
}
// Page 1 1,2,3,4 / Page 2 5,6,7,8 / Page 3 9,10`,
    },
    {
      task: 'Write a function addUnique(arr, value) that pushes value only if it is not already in the array. Use it to build a list of unique tags from ["js", "css", "js", "html", "css"].',
      hint: 'if (!arr.includes(value)) arr.push(value);',
      solution: `function addUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value);
  return arr;
}
const unique = [];
for (const tag of ["js", "css", "js", "html", "css"]) {
  addUnique(unique, tag);
}
console.log(unique.join(", ")); // js, css, html`,
    },
  ],
  quiz: [
    { question: 'What does [5, 6, 7].push(8) return?', options: ['[5, 6, 7, 8]', '8', '4', 'undefined'], answer: 2, explanation: 'push returns the new length.' },
    { question: 'Which method removes the FIRST item of an array?', options: ['shift()', 'pop()', 'unshift()', 'slice(1)'], answer: 0, explanation: 'shift removes and returns the first element.' },
    { question: 'Which method does NOT change the original array?', options: ['splice', 'reverse', 'push', 'slice'], answer: 3, explanation: 'slice returns a new array.' },
    { question: 'const a = ["x","y","z"]; a.splice(1, 1); What is a?', options: ['["y"]', '["x","z"]', '["x","y"]', '["z"]'], answer: 1, explanation: 'One item at index 1 ("y") is removed.' },
    { question: 'What does ["a","b"].indexOf("c") return?', options: ['undefined', 'null', 'false', '-1'], answer: 3, explanation: 'indexOf returns -1 when not found.' },
  ],
};
