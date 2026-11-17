export default {
  id: 'day-16-objects-basics',
  title: 'Objects: Creating, Accessing, Adding/Deleting Properties, Object.keys/values/entries',
  module: 'Module 3: Objects & Data Structures',
  day: 16,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: "Objects group related data under named keys (like a student's ID card). Today you learn how to create objects, read and change their properties, add and delete keys, and loop over them with Object.keys, Object.values and Object.entries.",
  objectives: [
    'Create objects with object literal syntax and understand key-value pairs',
    'Read and write properties with dot notation and bracket notation (including dynamic keys)',
    'Add, update and delete properties, and check if a key exists with `in` and `hasOwn`',
    'Loop over objects using Object.keys, Object.values, Object.entries and for...in',
    'Understand that objects are reference types (copying the variable does not copy the object)',
  ],
  theory: [
    {
      heading: 'What is an Object?',
      content: "An **object** is a collection of **key-value pairs** called **properties**. Think of an object like an ID card: it has labels (name, age, city) and a value written next to each label.\n\nArrays are great for ordered lists (`['red', 'green']`), but when each value has a *meaning*, an object is clearer: `{ name: 'Asha', age: 22 }` tells you exactly what 22 means.\n\nKeys are always strings (or Symbols). Values can be anything: numbers, strings, booleans, arrays, other objects, even functions.",
      syntax: `const student = {
  name: 'Asha',        // key: name, value: 'Asha'
  age: 22,
  isEnrolled: true,
  skills: ['HTML', 'CSS'],
  address: { city: 'Pune', pin: 411001 }, // nested object
  'favourite color': 'blue'               // key with a space needs quotes
};`,
      points: [
        'Object literal `{ }` is the most common way to create an object',
        'Each property is `key: value`, separated by commas',
        'A trailing comma after the last property is allowed and is good practice',
        'You can also write `new Object()`, but the literal is shorter and preferred',
      ],
    },
    {
      heading: 'Accessing Properties: Dot vs Bracket Notation',
      content: "**Dot notation** (`user.name`) is short and readable. Use it when you know the key name while writing the code and the key is a valid identifier.\n\n**Bracket notation** (`user['name']`) takes a string expression. Use it when:\n- the key has spaces or dashes: `user['favourite color']`\n- the key is stored in a variable: `user[field]`\n- the key is computed: `user['score' + 1]`\n\nReading a key that does not exist returns `undefined` (no error). But reading a property of `undefined` throws a TypeError, so use optional chaining `?.` for deep paths you are unsure about.",
      syntax: `const user = { name: 'Ravi', 'last-name': 'Kumar' };
user.name;            // 'Ravi'
user['last-name'];    // 'Kumar'
const field = 'name';
user[field];          // 'Ravi'  (uses the VALUE of field)
user.field;           // undefined (looks for a key literally called 'field')
user.address?.city;   // undefined, no crash`,
      tip: 'Common mistake: writing `obj.key` when the key is inside a variable. `obj.key` looks for a property literally named "key". Use `obj[key]`.',
    },
    {
      heading: 'Adding, Updating and Deleting Properties',
      content: "Objects are **mutable**: you can change them after creation, even if the variable is declared with `const`. `const` only stops you from re-assigning the variable to a different object; it does not freeze the object's contents.\n\n- **Add / update**: just assign. If the key exists it is updated, otherwise it is created.\n- **Delete**: use the `delete` operator. It removes the key completely.\n- **Check existence**: `'key' in obj` or `Object.hasOwn(obj, 'key')`. Do not rely on `obj.key !== undefined` because a key can exist with the value `undefined`.\n\nYou can also create keys dynamically with **computed property names**: `{ [field]: value }`.",
      syntax: `const car = { brand: 'Tata' };
car.model = 'Nexon';     // add
car.brand = 'Mahindra';  // update
delete car.model;        // delete
'brand' in car;          // true
Object.hasOwn(car, 'model'); // false

const key = 'color';
const bike = { [key]: 'red' }; // { color: 'red' }`,
      tip: 'Use `Object.freeze(obj)` if you want an object that cannot be changed (shallow freeze only).',
    },
    {
      heading: 'Object.keys, Object.values, Object.entries',
      content: "These three static methods turn an object into an **array**, so you can use all your array skills (map, filter, reduce, forEach) on objects.\n\n- `Object.keys(obj)` returns an array of keys\n- `Object.values(obj)` returns an array of values\n- `Object.entries(obj)` returns an array of `[key, value]` pairs\n\nThe reverse of `entries` is `Object.fromEntries(pairs)`, which builds an object from `[key, value]` pairs. Together they let you transform objects: entries, then map/filter, then fromEntries.",
      syntax: `const marks = { math: 90, science: 80, english: 70 };
Object.keys(marks);    // ['math', 'science', 'english']
Object.values(marks);  // [90, 80, 70]
Object.entries(marks); // [['math', 90], ['science', 80], ['english', 70]]
Object.keys(marks).length; // 3  (count properties)`,
    },
    {
      heading: 'Looping with for...in and for...of + entries',
      content: "`for...in` loops over the **keys** of an object. `for...of` does NOT work directly on plain objects (they are not iterable), but it works on `Object.entries(obj)`.\n\nModern code usually prefers `for (const [key, value] of Object.entries(obj))` because it gives both key and value with destructuring and ignores inherited properties.",
      syntax: `const prices = { tea: 10, coffee: 20 };
for (const item in prices) {
  console.log(item, prices[item]);
}
for (const [item, price] of Object.entries(prices)) {
  console.log(item + ' costs ' + price);
}`,
      tip: '`for (const x of obj)` on a plain object throws "obj is not iterable". Use Object.entries/keys/values first.',
    },
    {
      heading: 'Objects are Reference Types',
      content: "When you assign an object to another variable, you copy the **reference** (the address), not the object. Both variables point to the same object, so changing one changes what the other sees.\n\nTwo separately created objects are never equal with `===`, even if they look identical, because `===` compares references for objects.\n\nTo make a (shallow) copy use the spread operator `{ ...obj }` or `Object.assign({}, obj)`. Spread with objects is covered in depth on Day 18.",
      syntax: `const a = { score: 1 };
const b = a;        // same object
b.score = 99;
console.log(a.score); // 99
console.log({ x: 1 } === { x: 1 }); // false
const c = { ...a }; // new object (shallow copy)`,
    },
  ],
  examples: [
    {
      title: 'Student Profile: Create, Read, Update, Delete',
      scenario: 'A college portal stores a student record. We need to read fields, update the semester, add an email, and remove a temporary field.',
      steps: [
        'Create an object literal `student` with name, semester and a temporary `tempToken` key',
        'Read values with dot and bracket notation',
        'Update semester, add email, delete tempToken',
        'Print the final object and check key existence with `in`',
        'Click Run and read the console',
      ],
      code: `const student = { name: 'Asha', semester: 3, tempToken: 'abc123' };

console.log(student.name);        // dot notation
console.log(student['semester']); // bracket notation

student.semester = 4;                  // update
student.email = 'asha@college.edu';   // add
delete student.tempToken;             // delete

console.log(student);
console.log('tempToken' in student);
console.log(Object.keys(student).length);`,
      playground: {
        js: `const student = { name: 'Asha', semester: 3, tempToken: 'abc123' };

console.log(student.name);
console.log(student['semester']);

student.semester = 4;
student.email = 'asha@college.edu';
delete student.tempToken;

console.log(JSON.stringify(student));
console.log('tempToken' in student);
console.log(Object.keys(student).length);`,
      },
      result: `Asha
3
{"name":"Asha","semester":4,"email":"asha@college.edu"}
false
3`,
      explanation: 'Dot and bracket notation read the same property. Assigning to an existing key updates it; assigning to a new key adds it at the end. `delete` removes the key, so `in` returns false. Object.keys gives 3 keys left: name, semester, email. (JSON.stringify is used only to print the object on one line.)',
    },
    {
      title: 'Dynamic Keys with Bracket Notation',
      scenario: 'A settings form gives us a field name as a string (e.g. "theme"). We must update the correct key in the settings object without writing an if for every field.',
      steps: [
        'Create a `settings` object',
        'Write a function updateSetting(field, value) that uses `settings[field] = value`',
        'Call it with different field names',
        'Show that `settings.field` would be wrong',
        'Run and compare outputs',
      ],
      code: `const settings = { theme: 'light', fontSize: 14 };

function updateSetting(field, value) {
  settings[field] = value; // field is a variable
}

updateSetting('theme', 'dark');
updateSetting('language', 'en');

console.log(settings.theme);
console.log(settings.language);
console.log(settings.field); // wrong way`,
      playground: {
        js: `const settings = { theme: 'light', fontSize: 14 };

function updateSetting(field, value) {
  settings[field] = value;
}

updateSetting('theme', 'dark');
updateSetting('language', 'en');

console.log(settings.theme);
console.log(settings.language);
console.log(settings.field);

const key = 'volume';
const audio = { [key]: 80 };
console.log(audio.volume);`,
      },
      result: `dark
en
undefined
80`,
      explanation: '`settings[field]` evaluates the variable `field` first, so it becomes `settings["theme"]`. `settings.field` looks for a key literally named "field", which does not exist, so it is undefined. `{ [key]: 80 }` is a computed property name that creates the key "volume".',
    },
    {
      title: 'Shopping Cart Total with Object.entries',
      scenario: 'A cart stores item names as keys and quantities as values. A separate price list stores prices. Calculate each line total and the grand total.',
      steps: [
        'Create `cart` and `prices` objects',
        'Loop with `for (const [item, qty] of Object.entries(cart))`',
        'Print each line and add to the total',
        'Use Object.values + reduce to count total items',
        'Run it',
      ],
      code: `const cart = { pen: 3, notebook: 2, bag: 1 };
const prices = { pen: 10, notebook: 50, bag: 500 };

let total = 0;
for (const [item, qty] of Object.entries(cart)) {
  const line = qty * prices[item];
  total += line;
  console.log(item + ' x' + qty + ' = ' + line);
}
console.log('Total: ' + total);

const itemCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
console.log('Items: ' + itemCount);`,
      playground: {
        js: `const cart = { pen: 3, notebook: 2, bag: 1 };
const prices = { pen: 10, notebook: 50, bag: 500 };

let total = 0;
for (const [item, qty] of Object.entries(cart)) {
  const line = qty * prices[item];
  total += line;
  console.log(item + ' x' + qty + ' = ' + line);
}
console.log('Total: ' + total);

const itemCount = Object.values(cart).reduce((sum, q) => sum + q, 0);
console.log('Items: ' + itemCount);`,
      },
      result: `pen x3 = 30
notebook x2 = 100
bag x1 = 500
Total: 630
Items: 6`,
      explanation: 'Object.entries turns the cart into [["pen",3],["notebook",2],["bag",1]]. Destructuring `[item, qty]` gives both values per loop. `prices[item]` uses bracket notation because the key is in a variable. Object.values gives [3,2,1] which reduce adds to 6.',
    },
    {
      title: 'Reference Trap: Copy vs Same Object',
      scenario: 'A developer "copies" a user object, edits the copy, and is surprised the original changed. Show the bug and the fix.',
      steps: [
        'Create `original`',
        'Assign `const alias = original` and change alias',
        'Create a real copy with spread `{ ...original }` and change it',
        'Compare with ===',
        'Run and observe',
      ],
      code: `const original = { name: 'Ravi', points: 10 };

const alias = original;      // same reference
alias.points = 50;
console.log(original.points); // 50 !

const copy = { ...original }; // new object
copy.points = 0;
console.log(original.points); // still 50

console.log(alias === original);
console.log(copy === original);`,
      playground: {
        js: `const original = { name: 'Ravi', points: 10 };

const alias = original;
alias.points = 50;
console.log(original.points);

const copy = { ...original };
copy.points = 0;
console.log(original.points);

console.log(alias === original);
console.log(copy === original);
console.log({ a: 1 } === { a: 1 });`,
      },
      result: `50
50
true
false
false`,
      explanation: '`alias` holds the same reference as `original`, so changing alias.points changes the one shared object. Spread creates a brand-new object, so changing copy does not affect original. `===` on objects compares references, so two different objects with the same content are not equal.',
    },
    {
      title: 'Transform an Object: Apply 10% Discount',
      scenario: 'Convert a price list into a discounted price list without changing the original, using entries, map and fromEntries.',
      steps: [
        'Create `menu` with item prices',
        'Object.entries(menu) to get pairs',
        'map each pair to [name, price * 0.9]',
        'Object.fromEntries to build the new object',
        'Run and compare both objects',
      ],
      code: `const menu = { dosa: 80, idli: 40, vada: 30 };

const discounted = Object.fromEntries(
  Object.entries(menu).map(([name, price]) => [name, price * 0.9])
);

console.log(menu);
console.log(discounted);`,
      playground: {
        js: `const menu = { dosa: 80, idli: 40, vada: 30 };

const discounted = Object.fromEntries(
  Object.entries(menu).map(([name, price]) => [name, price * 0.9])
);

console.log(JSON.stringify(menu));
console.log(JSON.stringify(discounted));

const cheap = Object.fromEntries(
  Object.entries(menu).filter(([, price]) => price < 50)
);
console.log(JSON.stringify(Object.keys(cheap)));`,
      },
      result: `{"dosa":80,"idli":40,"vada":30}
{"dosa":72,"idli":36,"vada":27}
["idli","vada"]`,
      explanation: 'entries -> map/filter -> fromEntries is the standard pattern to transform objects. The original `menu` is untouched because map and filter return new arrays and fromEntries builds a new object.',
    },
  ],
  interview: [
    { q: 'What is an object in JavaScript?', a: 'An object is a collection of key-value pairs (properties). Keys are strings or Symbols; values can be any type, including functions (then called methods). Objects are reference types.', level: 'Easy' },
    { q: 'Difference between dot notation and bracket notation?', a: 'Dot notation (obj.key) uses a fixed identifier-style key. Bracket notation (obj["key"] or obj[variable]) accepts any string expression, so it works for keys with spaces/dashes, keys stored in variables, and computed keys.', level: 'Easy' },
    { q: 'What is the output?\nconst key = "a";\nconst o = { a: 1, key: 2 };\nconsole.log(o[key], o.key);', a: 'Output: 1 2. o[key] uses the value of the variable key ("a") so it reads o.a = 1. o.key reads the property literally named "key" = 2.', level: 'Medium' },
    { q: 'How do you check whether a property exists in an object?', a: 'Use "key" in obj (also checks the prototype chain) or Object.hasOwn(obj, "key") / obj.hasOwnProperty("key") (own properties only). Checking obj.key !== undefined is unreliable because a key can exist with value undefined.', level: 'Medium' },
    { q: 'Can you change a const object?', a: 'Yes, you can add, change and delete its properties. const only prevents re-assigning the variable to a new value. To prevent changes use Object.freeze(obj) (shallow).', level: 'Easy' },
    { q: 'What is the output?\nconst a = { n: 1 };\nconst b = a;\nb.n = 2;\nconsole.log(a.n, a === b);', a: 'Output: 2 true. b references the same object as a, so the change is visible through a, and they are the same reference.', level: 'Easy' },
    { q: 'What is the output?\nconsole.log({} === {});\nconsole.log(Object.keys({ x: 1, y: 2 }).length);', a: 'Output: false then 2. Two separate object literals are different references. Object.keys returns ["x","y"], length 2.', level: 'Easy' },
    { q: 'What do Object.keys, Object.values and Object.entries return?', a: 'All return arrays of the object\'s own enumerable properties: keys returns key strings, values returns values, entries returns [key, value] pairs. Object.fromEntries does the reverse of entries.', level: 'Easy' },
    { q: 'Why does for...of throw on a plain object?', a: 'for...of needs an iterable (array, string, Map, Set). Plain objects are not iterable. Use for...in, or for...of over Object.keys/values/entries(obj).', level: 'Medium' },
    { q: 'What is the output?\nconst o = { a: 1 };\ndelete o.a;\nconsole.log(o.a, "a" in o);', a: 'Output: undefined false. delete removes the property entirely, so reading it gives undefined and the in operator returns false.', level: 'Medium' },
    { q: 'What are computed property names?', a: 'Syntax that lets you use an expression as a key inside an object literal: const k = "id"; const o = { [k]: 5 } creates { id: 5 }. Useful when building objects from variables, e.g. form field names.', level: 'Medium' },
    { q: 'What is the output?\nconst o = { 2: "b", 1: "a", z: "z", y: "y" };\nconsole.log(Object.keys(o));', a: 'Output: ["1", "2", "z", "y"]. Integer-like keys are listed first in ascending numeric order, then string keys in insertion order. Also note numeric keys are converted to strings.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a `book` object with title, author, year and price. Print "<title> by <author> (<year>)". Then increase the price by 10% and add a `discount` property of 5.',
      hint: 'Use dot notation to read and assign. price * 1.1 for 10%.',
      solution: `const book = { title: 'Wings of Fire', author: 'A.P.J. Abdul Kalam', year: 1999, price: 300 };
console.log(book.title + ' by ' + book.author + ' (' + book.year + ')');
book.price = book.price * 1.1;
book.discount = 5;
console.log(book);`,
    },
    {
      task: 'Write a function countProps(obj) that returns how many own properties an object has, and a function hasKey(obj, key) that returns true/false.',
      hint: 'Object.keys(obj).length and Object.hasOwn(obj, key).',
      solution: `function countProps(obj) {
  return Object.keys(obj).length;
}
function hasKey(obj, key) {
  return Object.hasOwn(obj, key);
}
console.log(countProps({ a: 1, b: 2 })); // 2
console.log(hasKey({ a: 1 }, 'a'));       // true
console.log(hasKey({ a: 1 }, 'z'));       // false`,
    },
    {
      task: 'Given marks = { math: 78, science: 92, english: 65, history: 88 }, print the subject with the highest mark and the average mark.',
      hint: 'Loop over Object.entries and track the best pair; average = sum of Object.values / count.',
      solution: `const marks = { math: 78, science: 92, english: 65, history: 88 };
let best = ['', -Infinity];
for (const [subject, mark] of Object.entries(marks)) {
  if (mark > best[1]) best = [subject, mark];
}
const values = Object.values(marks);
const avg = values.reduce((s, m) => s + m, 0) / values.length;
console.log('Top: ' + best[0] + ' (' + best[1] + ')'); // Top: science (92)
console.log('Average: ' + avg);                       // Average: 80.75`,
    },
    {
      task: 'Write countWords(sentence) that returns an object where each word is a key and the value is how many times it appears. Example: "a b a" -> { a: 2, b: 1 }.',
      hint: 'Split by space, loop, and use counts[word] = (counts[word] || 0) + 1.',
      solution: `function countWords(sentence) {
  const counts = {};
  for (const word of sentence.toLowerCase().split(' ')) {
    if (!word) continue;
    counts[word] = (counts[word] || 0) + 1;
  }
  return counts;
}
console.log(countWords('the cat and the hat')); // { the: 2, cat: 1, and: 1, hat: 1 }`,
    },
    {
      task: 'Write removeEmpty(obj) that returns a NEW object without keys whose value is "", null or undefined. Do not modify the original.',
      hint: 'Object.entries -> filter -> Object.fromEntries.',
      solution: `function removeEmpty(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== '' && v !== null && v !== undefined)
  );
}
const form = { name: 'Asha', phone: '', city: null, age: 21 };
console.log(removeEmpty(form)); // { name: 'Asha', age: 21 }
console.log(form);              // unchanged`,
    },
  ],
  quiz: [
    { question: 'Which syntax must you use when the property name is stored in a variable `k`?', options: ['obj.k', 'obj[k]', 'obj->k', 'obj{k}'], answer: 1, explanation: 'Bracket notation evaluates the variable. obj.k looks for a key literally named "k".' },
    { question: 'What does `Object.entries({ a: 1, b: 2 })` return?', options: ['["a", "b"]', '[1, 2]', '{ a: 1, b: 2 }', '[["a", 1], ["b", 2]]'], answer: 3, explanation: 'entries returns an array of [key, value] pairs.' },
    { question: 'What is printed? `const o = { x: 1 }; const p = o; p.x = 5; console.log(o.x);`', options: ['5', '1', 'undefined', 'Error'], answer: 0, explanation: 'p and o reference the same object, so the change is visible through o.' },
    { question: 'Which operator removes a property from an object?', options: ['remove', 'pop', 'delete', 'unset'], answer: 2, explanation: 'delete obj.key removes the property completely.' },
    { question: 'What happens with `const user = {}; user.name = "A";`?', options: ['TypeError: assignment to constant', 'SyntaxError', 'It works: user becomes { name: "A" }', 'name is ignored silently'], answer: 2, explanation: 'const prevents reassignment of the variable, not mutation of the object.' },
  ],
};
