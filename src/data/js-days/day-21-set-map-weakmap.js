export default {
  id: 'day-21-set-map-weakmap',
  title: 'Set, Map, WeakMap Basics',
  module: 'Module 3: Objects & Data Structures',
  day: 21,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Set stores unique values, Map stores key-value pairs where keys can be ANY type, and WeakMap attaches private data to objects without stopping them from being garbage collected. Today you learn when to use each instead of plain arrays and objects.',
  objectives: [
    'Create a Set, add/delete/check values and remove duplicates from an array',
    'Create a Map, use set/get/has/delete/size and iterate it in insertion order',
    'Choose between Map and a plain object',
    'Understand WeakMap (and WeakSet) and why their keys must be objects',
    'Convert between Set/Map and arrays/objects',
  ],
  theory: [
    {
      heading: 'Set: A Collection of Unique Values',
      content: "A **Set** is like a guest list at a party: each person appears only once, no matter how many times you try to add them.\n\n- `new Set(iterable)` creates a set (duplicates are dropped)\n- `add(value)` adds (returns the set, so it can be chained)\n- `has(value)` checks membership - very fast, even for large sets\n- `delete(value)` removes, `clear()` empties\n- `size` is the count (a property, not a method; not `length`)\n\nUniqueness uses **SameValueZero** comparison: like `===`, except `NaN` equals `NaN`. Two different objects with the same content are still two separate values.",
      syntax: `const tags = new Set(['js', 'css', 'js']);
tags.size;          // 2
tags.add('html').add('css');  // chaining; css ignored
tags.has('js');     // true
tags.delete('css'); // true
[...tags];          // ['js', 'html']

const unique = [...new Set([1, 2, 2, 3, 3])]; // [1, 2, 3]`,
      tip: 'The one-liner `[...new Set(array)]` is the most common way to remove duplicates in interviews and real code.',
    },
    {
      heading: 'Iterating Sets and Set Operations',
      content: "Sets keep **insertion order** and are iterable with `for...of` and `forEach`. They have no indexes (`set[0]` does not work); convert to an array if you need indexes or map/filter.\n\nClassic set operations using arrays:\n- **Union**: `new Set([...a, ...b])`\n- **Intersection**: `[...a].filter(x => b.has(x))`\n- **Difference**: `[...a].filter(x => !b.has(x))`\n\nModern browsers (2024+) also include built-in methods: `a.union(b)`, `a.intersection(b)`, `a.difference(b)`.",
      syntax: `const a = new Set([1, 2, 3]);
const b = new Set([2, 3, 4]);
for (const n of a) console.log(n);
const both = [...a].filter(x => b.has(x)); // [2, 3]`,
    },
    {
      heading: 'Map: Key-Value Pairs with Any Key Type',
      content: "A **Map** stores key-value pairs like an object, but:\n\n1. Keys can be **any type**: numbers, booleans, objects, even functions. Object keys are always converted to strings.\n2. It remembers **insertion order** reliably.\n3. It has a `size` property.\n4. It is directly **iterable**: `for (const [key, value] of map)`.\n5. It has no inherited keys (an object has `toString`, `constructor` from its prototype).\n6. It is optimised for frequent additions and removals.\n\nMethods: `set(key, value)` (chainable), `get(key)`, `has(key)`, `delete(key)`, `clear()`, `keys()`, `values()`, `entries()`, `forEach()`.",
      syntax: `const prices = new Map();
prices.set('apple', 120).set('banana', 40);
prices.get('apple');   // 120
prices.has('mango');   // false
prices.size;           // 2

const visits = new Map([[1, 'one'], ['1', 'string one']]);
visits.get(1);   // 'one'   (number key)
visits.get('1'); // 'string one' (different key!)`,
      tip: 'Do not use `map[key] = value` on a Map. That sets a normal property on the Map object and `get()` will not see it. Always use `set` and `get`.',
    },
    {
      heading: 'Map vs Object: When to Use Which',
      content: "**Use an object** when:\n- you have a fixed shape with known string keys (a user record, config)\n- you need JSON (JSON.stringify works with objects, not Maps)\n\n**Use a Map** when:\n- keys are not strings (objects, numbers) or come from user data\n- you add/remove keys often (caches, counters, lookups)\n- you need the size or guaranteed order\n\nConversion: `new Map(Object.entries(obj))` and `Object.fromEntries(map)`.",
      syntax: `const obj = { a: 1, b: 2 };
const m = new Map(Object.entries(obj)); // object -> Map
const back = Object.fromEntries(m);     // Map -> object
JSON.stringify(m);                      // '{}'  (Maps are not JSON friendly)
JSON.stringify([...m]);                 // '[["a",1],["b",2]]'`,
    },
    {
      heading: 'WeakMap and WeakSet',
      content: "A **WeakMap** is a Map where:\n- keys **must be objects** (not primitives)\n- keys are held **weakly**: if nothing else references the key object, it can be garbage collected and its entry disappears automatically\n- it is **not iterable** and has **no size** (because entries can vanish at any time)\n- methods: `set`, `get`, `has`, `delete` only\n\n**Use case**: attaching extra data (metadata, cache, private data) to objects you do not own, such as DOM elements, without causing memory leaks. When the element is removed and forgotten, the data goes too.\n\n**WeakSet** is the same idea for sets: only objects, weakly held, used to \"mark\" objects (e.g. already processed).",
      syntax: `const clickCount = new WeakMap();
const button = { id: 'buy' }; // imagine a DOM element
clickCount.set(button, 1);
clickCount.get(button); // 1
// clickCount.set('buy', 1); // TypeError: Invalid value used as weak map key

const seen = new WeakSet();
seen.add(button);
seen.has(button); // true`,
    },
  ],
  examples: [
    {
      title: 'Remove Duplicate Emails with Set',
      scenario: 'A newsletter signup list has duplicate emails. Remove duplicates, check membership and count unique subscribers.',
      steps: [
        'Create an array of emails with duplicates',
        'Create a Set from it and spread back to an array',
        'Use has() to check if an email exists',
        'Add a new one and try adding a duplicate',
        'Run it',
      ],
      code: `const signups = ['a@x.com', 'b@x.com', 'a@x.com', 'c@x.com', 'b@x.com'];
const unique = new Set(signups);
console.log(unique.size);
console.log([...unique]);
console.log(unique.has('c@x.com'));
unique.add('d@x.com').add('a@x.com');
console.log(unique.size);`,
      playground: {
        js: `const signups = ['a@x.com', 'b@x.com', 'a@x.com', 'c@x.com', 'b@x.com'];
const unique = new Set(signups);
console.log(unique.size);
console.log([...unique].join(', '));
console.log(unique.has('c@x.com'));
unique.add('d@x.com').add('a@x.com');
console.log(unique.size);
console.log(new Set([NaN, NaN, {}, {}]).size);`,
      },
      result: `3
a@x.com, b@x.com, c@x.com
true
4
3`,
      explanation: 'The Set keeps the first occurrence of each email, in insertion order. Adding "a@x.com" again is ignored, so size goes from 3 to 4 only for d@x.com. In the last line NaN is treated as equal to NaN (counted once) but two {} are different objects (counted twice), so size is 3.',
    },
    {
      title: 'Common and Different Skills (Set Operations)',
      scenario: 'Compare the skills of two candidates: skills both have, skills only Asha has, and all skills combined.',
      steps: [
        'Create two Sets of skills',
        'Union with spread into a new Set',
        'Intersection and difference with filter + has',
        'Print results',
        'Run it',
      ],
      code: `const asha = new Set(['HTML', 'CSS', 'JS', 'React']);
const ravi = new Set(['JS', 'Node', 'CSS', 'SQL']);

const all = new Set([...asha, ...ravi]);
const common = [...asha].filter(s => ravi.has(s));
const onlyAsha = [...asha].filter(s => !ravi.has(s));

console.log('All:', [...all].join(', '));
console.log('Common:', common.join(', '));
console.log('Only Asha:', onlyAsha.join(', '));`,
      playground: {
        js: `const asha = new Set(['HTML', 'CSS', 'JS', 'React']);
const ravi = new Set(['JS', 'Node', 'CSS', 'SQL']);

const all = new Set([...asha, ...ravi]);
const common = [...asha].filter(s => ravi.has(s));
const onlyAsha = [...asha].filter(s => !ravi.has(s));

console.log('All:', [...all].join(', '));
console.log('Common:', common.join(', '));
console.log('Only Asha:', onlyAsha.join(', '));`,
      },
      result: `All: HTML, CSS, JS, React, Node, SQL
Common: CSS, JS
Only Asha: HTML, React`,
      explanation: 'Spreading both sets into one new Set gives the union without duplicates. filter + has gives intersection and difference. has() on a Set is fast (no full scan like array.includes).',
    },
    {
      title: 'Word Frequency Counter with Map',
      scenario: 'Count how many times each word appears in a sentence and print them in order of first appearance, then find the most frequent word.',
      steps: [
        'Split the sentence into words',
        'For each word: map.set(word, (map.get(word) || 0) + 1)',
        'Iterate with for...of and destructuring',
        'Find the max using spread + reduce',
        'Run it',
      ],
      code: `const text = 'the cat and the dog and the bird';
const freq = new Map();
for (const word of text.split(' ')) {
  freq.set(word, (freq.get(word) || 0) + 1);
}
for (const [word, count] of freq) {
  console.log(word + ': ' + count);
}
const [topWord, topCount] = [...freq].reduce((best, cur) => (cur[1] > best[1] ? cur : best));
console.log('Most frequent: ' + topWord + ' (' + topCount + ')');
console.log('Unique words: ' + freq.size);`,
      playground: {
        js: `const text = 'the cat and the dog and the bird';
const freq = new Map();
for (const word of text.split(' ')) {
  freq.set(word, (freq.get(word) || 0) + 1);
}
for (const [word, count] of freq) {
  console.log(word + ': ' + count);
}
const [topWord, topCount] = [...freq].reduce((best, cur) => (cur[1] > best[1] ? cur : best));
console.log('Most frequent: ' + topWord + ' (' + topCount + ')');
console.log('Unique words: ' + freq.size);`,
      },
      result: `the: 3
cat: 1
and: 2
dog: 1
bird: 1
Most frequent: the (3)
Unique words: 5`,
      explanation: 'get returns undefined for a new word, so `|| 0` starts the count at 0. Iterating a Map yields [key, value] pairs in insertion order. [...freq] converts it to an array of pairs so reduce can find the largest count.',
    },
    {
      title: 'Objects as Keys: Map vs Plain Object, and WeakMap',
      scenario: 'Store extra data per user object. Show that a plain object turns object keys into "[object Object]" and collides, while Map and WeakMap keep them separate.',
      steps: [
        'Create two user objects',
        'Use them as keys in a plain object and log its keys',
        'Use them as keys in a Map and read back',
        'Use a WeakMap and try a string key in try/catch',
        'Run it',
      ],
      code: `const u1 = { name: 'Asha' };
const u2 = { name: 'Ravi' };

const plain = {};
plain[u1] = 'admin';
plain[u2] = 'guest';
console.log(Object.keys(plain), plain[u1]);

const roles = new Map([[u1, 'admin'], [u2, 'guest']]);
console.log(roles.get(u1), roles.get(u2), roles.size);

const meta = new WeakMap();
meta.set(u1, { lastLogin: '2024-01-15' });
console.log(meta.get(u1).lastLogin, meta.has(u2));
try {
  meta.set('u3', 1);
} catch (e) {
  console.log(e.name);
}`,
      playground: {
        js: `const u1 = { name: 'Asha' };
const u2 = { name: 'Ravi' };

const plain = {};
plain[u1] = 'admin';
plain[u2] = 'guest';
console.log(JSON.stringify(Object.keys(plain)), plain[u1]);

const roles = new Map([[u1, 'admin'], [u2, 'guest']]);
console.log(roles.get(u1), roles.get(u2), roles.size);

const meta = new WeakMap();
meta.set(u1, { lastLogin: '2024-01-15' });
console.log(meta.get(u1).lastLogin, meta.has(u2));
try {
  meta.set('u3', 1);
} catch (e) {
  console.log(e.name);
}`,
      },
      result: `["[object Object]"] guest
admin guest 2
2024-01-15 false
TypeError`,
      explanation: 'Plain object keys are converted to strings; both users become "[object Object]", so the second assignment overwrites the first and plain[u1] returns "guest". Map uses the object reference itself as the key, so both are stored. WeakMap also uses object keys but rejects primitives with a TypeError.',
    },
  ],
  interview: [
    { q: 'What is a Set?', a: 'A built-in collection of unique values of any type, kept in insertion order. Methods: add, has, delete, clear, forEach; property size.', level: 'Easy' },
    { q: 'How do you remove duplicates from an array?', a: '[...new Set(arr)] or Array.from(new Set(arr)). Works for primitives; objects are compared by reference.', level: 'Easy' },
    { q: 'What is the output?\nconst s = new Set([1, "1", 1, true, "true"]);\nconsole.log(s.size);', a: '4. Set uses strict-style comparison (SameValueZero), so 1 and "1" differ, and true and "true" differ. Only the duplicate 1 is removed.', level: 'Medium' },
    { q: 'Differences between Map and Object?', a: 'Map keys can be any type (objects, numbers); object keys are strings/Symbols. Map has size, is directly iterable, keeps insertion order, has no prototype keys and is optimised for frequent add/delete. Objects are better for fixed records and JSON.', level: 'Medium' },
    { q: 'What is the output?\nconst m = new Map();\nm.set(1, "a");\nm.set("1", "b");\nconsole.log(m.get(1), m.size);', a: 'a 2. The number 1 and the string "1" are different Map keys.', level: 'Medium' },
    { q: 'What is the output?\nconst m = new Map();\nm["x"] = 5;\nconsole.log(m.get("x"), m.size);', a: 'undefined 0. Bracket assignment sets a regular property on the Map object, not a Map entry. Use m.set("x", 5).', level: 'Hard' },
    { q: 'What is a WeakMap and when would you use it?', a: 'A Map whose keys must be objects and are held weakly, so entries are removed when the key object is garbage collected. It is not iterable and has no size. Used for caching or attaching private/meta data to objects (e.g. DOM nodes) without memory leaks.', level: 'Medium' },
    { q: 'Why is WeakMap not iterable?', a: 'Because entries can disappear at any time when keys are garbage collected; iteration or size would give unpredictable results depending on GC timing.', level: 'Hard' },
    { q: 'What is the output?\nconst a = {}; const b = {};\nconst o = {};\no[a] = 1; o[b] = 2;\nconsole.log(o[a]);', a: '2. Both objects become the string key "[object Object]", so the second assignment overwrites the first.', level: 'Medium' },
    { q: 'How do you convert a Map to an object and back?', a: 'Object.fromEntries(map) converts Map -> object (keys become strings). new Map(Object.entries(obj)) converts object -> Map.', level: 'Easy' },
    { q: 'Set.has vs Array.includes performance?', a: 'Set.has is on average O(1) (hash lookup) while Array.includes is O(n) (scans the array). For many lookups, convert the array to a Set first.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write hasDuplicates(arr) that returns true if the array contains any duplicate value.',
      hint: 'Compare new Set(arr).size with arr.length.',
      solution: `function hasDuplicates(arr) {
  return new Set(arr).size !== arr.length;
}
console.log(hasDuplicates([1, 2, 3]));    // false
console.log(hasDuplicates([1, 2, 2, 3])); // true`,
    },
    {
      task: 'Given two arrays of student IDs (attended Monday, attended Tuesday), print the IDs that attended both days and the IDs that attended only Monday.',
      hint: 'Make a Set from Tuesday, then filter Monday with has / !has.',
      solution: `const monday = [101, 102, 103, 104];
const tuesday = new Set([102, 104, 105]);
const both = monday.filter(id => tuesday.has(id));
const onlyMon = monday.filter(id => !tuesday.has(id));
console.log(both);    // [102, 104]
console.log(onlyMon); // [101, 103]`,
    },
    {
      task: 'Build a phone book using a Map: add 3 contacts, update one number, delete one, and print all remaining contacts as "name: number".',
      hint: 'set to add/update, delete to remove, for...of to print.',
      solution: `const phoneBook = new Map();
phoneBook.set('Asha', '98765').set('Ravi', '91234').set('Meera', '99887');
phoneBook.set('Ravi', '90000'); // update
phoneBook.delete('Meera');
for (const [name, number] of phoneBook) {
  console.log(name + ': ' + number);
}`,
    },
    {
      task: 'Group words by their first letter using a Map: ["apple","avocado","banana","blueberry","cherry"] -> a: [apple, avocado], b: [...], c: [...].',
      hint: 'If the Map does not have the letter yet, set it to []; then push.',
      solution: `const words = ['apple', 'avocado', 'banana', 'blueberry', 'cherry'];
const groups = new Map();
for (const w of words) {
  const letter = w[0];
  if (!groups.has(letter)) groups.set(letter, []);
  groups.get(letter).push(w);
}
groups.forEach((list, letter) => console.log(letter + ': ' + list.join(', ')));`,
    },
    {
      task: 'Write a memoized square function using a Map cache that logs "computing" only the first time for each number.',
      hint: 'Check cache.has(n) before computing.',
      solution: `const cache = new Map();
function slowSquare(n) {
  if (cache.has(n)) return cache.get(n);
  console.log('computing ' + n);
  const result = n * n;
  cache.set(n, result);
  return result;
}
console.log(slowSquare(4)); // computing 4, 16
console.log(slowSquare(4)); // 16 (from cache)`,
    },
  ],
  quiz: [
    { question: 'What is `new Set([1, 1, 2, 2, 3]).size`?', options: ['5', '2', '3', '1'], answer: 2, explanation: 'Only unique values are kept: 1, 2, 3.' },
    { question: 'Which method reads a value from a Map?', options: ['map.get(key)', 'map[key]', 'map.read(key)', 'map.value(key)'], answer: 0, explanation: 'Use get/set. Bracket access does not read Map entries.' },
    { question: 'Which is TRUE about WeakMap?', options: ['Keys can be strings', 'It has a size property', 'It can be looped with for...of', 'Keys must be objects and are held weakly'], answer: 3, explanation: 'WeakMap keys are objects, held weakly; no size, not iterable.' },
    { question: 'Main advantage of Map over a plain object?', options: ['It can be converted to JSON directly', 'Keys can be any type, including objects', 'It uses less syntax', 'It is always faster for every operation'], answer: 1, explanation: 'Maps accept any key type and keep insertion order.' },
    { question: 'How do you get an array of unique values from `arr`?', options: ['arr.unique()', 'new Set(arr).toArray()', '[...new Set(arr)]', 'Set.from(arr)'], answer: 2, explanation: 'Spread the Set back into an array.' },
  ],
};
