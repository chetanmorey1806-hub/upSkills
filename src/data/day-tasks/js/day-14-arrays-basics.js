export default {
  lesson: 'day-14-arrays-basics',
  minutes: 25,
  intro: 'Read, add, remove and search array items with push/pop/shift/unshift, splice, slice, includes and indexOf.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What do these methods return? What is printed?',
      code: `const q = ["Asha", "Ravi"];
console.log(q.push("Meena"));
console.log(q.shift());
console.log(q.unshift("Zoya"));
console.log(q.pop());
console.log(q.join(","));`,
      expected: '3\nAsha\n3\nMeena\nZoya,Ravi',
      explain: '`push` and `unshift` return the **new length**. `pop` and `shift` return the **removed item**. After all steps the array is ["Zoya", "Ravi"].',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the key difference between `slice` and `splice`?',
      options: ['They are the same', 'slice copies part of an array without changing it; splice changes the original array (remove/insert)', 'slice changes the array; splice copies it', 'splice only works on strings'],
      answer: 1,
      explain: '`slice(start, end)` returns a copy and leaves the original untouched. `splice(start, deleteCount, ...items)` **mutates** the array and returns the removed items.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What is printed?',
      code: `const marks = [55, 72, 90, 72];
console.log(marks.at(-1));
console.log(marks.indexOf(72));
console.log(marks.lastIndexOf(72));
console.log(marks.includes(100));
console.log(marks.indexOf(100));`,
      expected: '72\n1\n3\nfalse\n-1',
      explain: '`at(-1)` reads from the end. `indexOf` gives the first position, `lastIndexOf` the last. When an item is missing, `includes` gives false and `indexOf` gives **-1** (not 0, not false).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Class list. Write `updateClass(students)` that:\n1. adds `"Neha"` at the **end**\n2. adds `"Aarav"` at the **start**\n3. replaces the item at index 2 with `"Kiran"`\n\nand returns the same array.',
      example: { title: 'updating by index', code: 'const colours = ["red", "green"];\ncolours[1] = "blue";\ncolours.push("pink");' },
      starter: 'function updateClass(students) {\n  // TODO\n  return students;\n}',
      solution: 'function updateClass(students) {\n  students.push("Neha");\n  students.unshift("Aarav");\n  students[2] = "Kiran";\n  return students;\n}',
      tests: [
        { call: 'updateClass(["Asha", "Ravi", "Meena"])', expect: ['Aarav', 'Asha', 'Kiran', 'Meena', 'Neha'] },
        { call: 'updateClass(["X", "Y"])', expect: ['Aarav', 'X', 'Kiran', 'Neha'] },
      ],
      explain: 'Order matters: after `unshift`, every index moves up by one, so index 2 is now the old index 1. `push`/`unshift` add, and `arr[i] = value` replaces.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `removeItem(cart, item)` that removes the **first** occurrence of `item` from the `cart` array using `indexOf` + `splice`, and returns the cart. If the item is not found, return the cart unchanged.',
      example: { title: 'splice to delete', code: 'const a = ["x", "y", "z"];\na.splice(1, 1); // removes "y" → a is ["x", "z"]' },
      starter: 'function removeItem(cart, item) {\n  // TODO\n  return cart;\n}',
      solution: 'function removeItem(cart, item) {\n  const i = cart.indexOf(item);\n  if (i !== -1) cart.splice(i, 1);\n  return cart;\n}',
      tests: [
        { call: 'removeItem(["milk", "bread", "eggs"], "bread")', expect: ['milk', 'eggs'] },
        { call: 'removeItem(["tea", "sugar", "tea"], "tea")', expect: ['sugar', 'tea'] },
        { call: 'removeItem(["rice"], "dal")', expect: ['rice'], msg: 'Missing item: cart unchanged' },
      ],
      explain: 'Always check for `-1` first: `splice(-1, 1)` would delete the **last** item, a sneaky bug. `splice(index, 1)` deletes exactly one item at that index.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `topThree(ranked)` that returns a **new** array with the first three items of `ranked`, without changing the original. Use `slice`.',
      example: { title: 'slice copies', code: 'const days = ["Mon", "Tue", "Wed", "Thu"];\ndays.slice(1, 3); // ["Tue", "Wed"]' },
      starter: 'function topThree(ranked) {\n  // TODO\n}',
      solution: 'function topThree(ranked) {\n  return ranked.slice(0, 3);\n}',
      tests: [
        { call: 'topThree(["Asha", "Ravi", "Meena", "John", "Zoya"])', expect: ['Asha', 'Ravi', 'Meena'] },
        { call: '(() => { const r = [1, 2, 3, 4]; topThree(r); return r.length; })()', expect: 4, msg: 'Original array keeps all items' },
      ],
      explain: 'The `end` index of `slice` is **not included**, so `slice(0, 3)` gives indexes 0, 1, 2. Using `splice(0, 3)` would return the same items but also remove them from the original list.',
    },
  ],
};
