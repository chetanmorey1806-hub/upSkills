export default {
  id: 'day-18-destructuring-spread-rest',
  title: 'Destructuring (Arrays and Objects) and Spread/Rest with Objects',
  module: 'Module 3: Objects & Data Structures',
  day: 18,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Destructuring unpacks values from arrays and objects into variables in one line, and spread/rest copy, merge and collect object properties. These are used everywhere in modern JavaScript and React code.',
  objectives: [
    'Destructure arrays by position, skip items, use defaults and swap variables',
    'Destructure objects by key, rename variables, set defaults and handle nested objects',
    'Destructure function parameters for cleaner function signatures',
    'Use object spread to copy and merge objects (and understand shallow copy)',
    'Use object rest to pull out some properties and collect the remainder',
  ],
  theory: [
    {
      heading: 'Array Destructuring',
      content: "**Destructuring** means \"unpacking\". Array destructuring assigns items by **position**: the first variable gets index 0, the second gets index 1, and so on.\n\n- Skip an item with an empty slot: `const [first, , third] = arr`\n- Give a **default** for missing items: `const [a = 1] = []`\n- Collect the remaining items with **rest**: `const [head, ...tail] = arr`\n- **Swap** two variables without a temp: `[a, b] = [b, a]`",
      syntax: `const colors = ['red', 'green', 'blue', 'pink'];
const [first, second] = colors;       // 'red', 'green'
const [, , third] = colors;           // 'blue'
const [x, y, ...others] = colors;     // others = ['blue', 'pink']
const [p = 'none', q = 'none'] = ['A']; // p='A', q='none'

let a = 1, b = 2;
[a, b] = [b, a];                      // a=2, b=1`,
    },
    {
      heading: 'Object Destructuring',
      content: "Object destructuring picks values by **key name**, so order does not matter. The variable name must match the key, unless you **rename** it with `key: newName`.\n\n- Default value: `{ city = 'Unknown' }` (used only when the value is `undefined`)\n- Rename + default together: `{ city: town = 'Unknown' }`\n- **Nested**: `{ address: { pin } }` (note: `address` itself is NOT created as a variable here)\n\nAnalogy: you open a parcel and take out only the items you need by their label.",
      syntax: `const user = { name: 'Asha', age: 22, address: { city: 'Pune', pin: 411001 } };
const { name, age } = user;                 // 'Asha', 22
const { name: fullName } = user;            // rename -> fullName
const { country = 'India' } = user;         // default
const { address: { city } } = user;         // nested -> city = 'Pune'
const { address: { zip = '000' } = {} } = {}; // safe nested default`,
      tip: 'Defaults apply only for `undefined`, not for `null`. `const { a = 5 } = { a: null }` gives a = null.',
    },
    {
      heading: 'Destructuring in Function Parameters',
      content: "You can destructure directly in the parameter list. This makes functions self-documenting and lets callers pass an options object in any order. Add `= {}` as a default so calling the function with no argument does not crash.\n\nThis pattern is how React components receive props: `function Card({ title, price }) { }`.",
      syntax: `function createUser({ name, role = 'student', active = true } = {}) {
  return name + ' / ' + role + ' / ' + active;
}
createUser({ name: 'Ravi' });               // 'Ravi / student / true'
createUser({ role: 'admin', name: 'Meera' }); // order does not matter

// array destructuring in parameters (e.g. Object.entries)
Object.entries({ a: 1 }).forEach(([key, value]) => {});`,
    },
    {
      heading: 'Object Spread: Copy and Merge',
      content: "The **spread** syntax `...obj` inside an object literal copies all own enumerable properties into the new object.\n\n- **Copy**: `const copy = { ...original }`\n- **Merge**: `const merged = { ...defaults, ...userSettings }` (later keys win)\n- **Update immutably**: `const updated = { ...user, age: 23 }`\n\nSpread makes a **shallow copy**: top-level properties are copied, but nested objects/arrays are still shared references. For a deep copy use `structuredClone(obj)`.",
      syntax: `const defaults = { theme: 'light', fontSize: 14 };
const saved = { fontSize: 18 };
const settings = { ...defaults, ...saved }; // { theme: 'light', fontSize: 18 }

const user = { name: 'Asha', address: { city: 'Pune' } };
const copy = { ...user };
copy.address.city = 'Delhi';  // ALSO changes user.address.city (shared)
const deep = structuredClone(user); // fully independent`,
      tip: 'Order matters in merges: `{ ...a, ...b }` lets b override a; `{ x: 1, ...obj }` lets obj override x.',
    },
    {
      heading: 'Object Rest: Pick and Omit',
      content: "**Rest** looks like spread (`...`) but appears on the **left side** of destructuring. It collects \"everything else\" into a new object.\n\nA common use is removing a property without mutating: `const { password, ...safeUser } = user;` gives you `safeUser` without the password. The rest element must be the **last** item.\n\nHow to tell them apart: spread **expands** (right side / function call), rest **collects** (left side / parameters).",
      syntax: `const user = { id: 1, name: 'Asha', password: 'secret', role: 'admin' };
const { password, ...publicUser } = user;
// publicUser = { id: 1, name: 'Asha', role: 'admin' }

function logAll(first, ...restArgs) {} // rest parameters (Day 11)`,
    },
  ],
  examples: [
    {
      title: 'Array Destructuring: Top Scorers and Swap',
      scenario: 'A leaderboard array is sorted by score. Pull out the winner, runner-up and the remaining players, then swap two variables.',
      steps: [
        'Create a `leaderboard` array',
        'Destructure winner, runnerUp and ...rest',
        'Destructure with a default for a missing 6th player',
        'Swap two variables with [a, b] = [b, a]',
        'Run it',
      ],
      code: `const leaderboard = ['Asha', 'Ravi', 'Meera', 'Ali', 'Sam'];
const [winner, runnerUp, ...rest] = leaderboard;
console.log(winner, runnerUp);
console.log(rest);

const [, , , , , sixth = 'No one'] = leaderboard;
console.log(sixth);

let left = 'L', right = 'R';
[left, right] = [right, left];
console.log(left, right);`,
      playground: {
        js: `const leaderboard = ['Asha', 'Ravi', 'Meera', 'Ali', 'Sam'];
const [winner, runnerUp, ...rest] = leaderboard;
console.log(winner, runnerUp);
console.log(rest.join(', '));

const [, , , , , sixth = 'No one'] = leaderboard;
console.log(sixth);

let left = 'L', right = 'R';
[left, right] = [right, left];
console.log(left, right);`,
      },
      result: `Asha Ravi
Meera, Ali, Sam
No one
R L`,
      explanation: 'Positions 0 and 1 go to winner and runnerUp; ...rest collects the rest into a new array. Index 5 does not exist (undefined), so the default "No one" is used. The swap builds a temporary array [right, left] and destructures it back.',
    },
    {
      title: 'Object Destructuring: Rename, Default, Nested',
      scenario: 'An API returns a user profile. Extract the fields we need for a profile card with clean variable names.',
      steps: [
        'Create `apiUser` with nested address',
        'Destructure name as userName, age, and a default for country',
        'Destructure nested city from address',
        'Log the values',
        'Run it',
      ],
      code: `const apiUser = {
  name: 'Meera',
  age: 25,
  address: { city: 'Chennai', pin: 600001 },
  phone: null,
};
const {
  name: userName,
  age,
  country = 'India',
  phone = 'N/A',
  address: { city },
} = apiUser;

console.log(userName, age, country);
console.log(city);
console.log(phone);`,
      playground: {
        js: `const apiUser = {
  name: 'Meera',
  age: 25,
  address: { city: 'Chennai', pin: 600001 },
  phone: null,
};
const {
  name: userName,
  age,
  country = 'India',
  phone = 'N/A',
  address: { city },
} = apiUser;

console.log(userName, age, country);
console.log(city);
console.log(phone);
console.log(typeof address);`,
      },
      result: `Meera 25 India
Chennai
null
undefined`,
      explanation: '`name: userName` renames. `country` is missing (undefined) so its default "India" is used. `phone` is null, and defaults do NOT apply to null, so phone stays null. Nested destructuring creates `city` only; `address` is not declared as a variable, so typeof address is "undefined".',
    },
    {
      title: 'Merging Settings with Spread (and the Shallow Copy Trap)',
      scenario: 'An app has default settings and user-saved settings. Merge them so the user\'s choices win. Then show that nested objects are shared after spread.',
      steps: [
        'Create defaults and saved objects',
        'Merge with { ...defaults, ...saved }',
        'Make a spread copy of an object with a nested object and change the nested value',
        'Use structuredClone for a deep copy',
        'Run and compare',
      ],
      code: `const defaults = { theme: 'light', fontSize: 14, notifications: true };
const saved = { theme: 'dark', fontSize: 18 };
const settings = { ...defaults, ...saved };
console.log(settings);

const profile = { name: 'Ali', prefs: { lang: 'en' } };
const shallow = { ...profile };
shallow.prefs.lang = 'hi';
console.log(profile.prefs.lang); // 'hi' - shared!

const deep = structuredClone(profile);
deep.prefs.lang = 'ta';
console.log(profile.prefs.lang); // still 'hi'`,
      playground: {
        js: `const defaults = { theme: 'light', fontSize: 14, notifications: true };
const saved = { theme: 'dark', fontSize: 18 };
const settings = { ...defaults, ...saved };
console.log(JSON.stringify(settings));

const profile = { name: 'Ali', prefs: { lang: 'en' } };
const shallow = { ...profile };
shallow.name = 'Changed';
shallow.prefs.lang = 'hi';
console.log(profile.name, profile.prefs.lang);

const deep = structuredClone(profile);
deep.prefs.lang = 'ta';
console.log(profile.prefs.lang, deep.prefs.lang);`,
      },
      result: `{"theme":"dark","fontSize":18,"notifications":true}
Ali hi
hi ta`,
      explanation: 'In the merge, saved comes last so its theme and fontSize override defaults, while notifications is kept. The shallow copy has its own `name` (changing it does not affect profile) but `prefs` is the SAME nested object, so changing lang affects profile too. structuredClone copies nested levels, so deep is fully independent.',
    },
    {
      title: 'Removing a Field with Rest + Parameter Destructuring',
      scenario: 'Before sending a user to the frontend, remove the password. Then format a user card with a function that destructures its parameter.',
      steps: [
        'Destructure password out and collect the rest with ...safeUser',
        'Write formatCard({ name, role = "guest" }) with defaults',
        'Call it with safeUser and with an object missing role',
        'Run it',
      ],
      code: `const dbUser = { id: 7, name: 'Kiran', password: 'p@ss', role: 'admin' };
const { password, ...safeUser } = dbUser;
console.log(safeUser);

function formatCard({ name, role = 'guest' } = {}) {
  return name + ' [' + role + ']';
}
console.log(formatCard(safeUser));
console.log(formatCard({ name: 'Visitor' }));`,
      playground: {
        js: `const dbUser = { id: 7, name: 'Kiran', password: 'p@ss', role: 'admin' };
const { password, ...safeUser } = dbUser;
console.log(JSON.stringify(safeUser));
console.log('password' in dbUser);

function formatCard({ name, role = 'guest' } = {}) {
  return name + ' [' + role + ']';
}
console.log(formatCard(safeUser));
console.log(formatCard({ name: 'Visitor' }));
console.log(formatCard());`,
      },
      result: `{"id":7,"name":"Kiran","role":"admin"}
true
Kiran [admin]
Visitor [guest]
undefined [guest]`,
      explanation: 'Rest collects all keys except password into a new object; the original dbUser is not changed (password still in it). formatCard destructures its argument; role defaults to "guest". The `= {}` default means calling formatCard() with nothing does not throw - name is just undefined.',
    },
  ],
  interview: [
    { q: 'What is destructuring?', a: 'A syntax to unpack values from arrays (by position) or properties from objects (by key) into distinct variables, e.g. const [a, b] = arr; const { x, y } = obj.', level: 'Easy' },
    { q: 'What is the output?\nconst [a, , b = 5, c = 9] = [1, 2, undefined];\nconsole.log(a, b, c);', a: '1 5 9. a = 1, index 1 is skipped, index 2 is undefined so default 5 is used, index 3 does not exist so default 9 is used.', level: 'Medium' },
    { q: 'What is the output?\nconst { a = 10, b = 20 } = { a: null };\nconsole.log(a, b);', a: 'null 20. Defaults are used only for undefined. a is null, so it stays null; b is missing (undefined) so it gets 20.', level: 'Medium' },
    { q: 'How do you rename a variable while destructuring?', a: 'Use key: newName, e.g. const { name: userName } = user; creates userName, not name.', level: 'Easy' },
    { q: 'Difference between spread and rest?', a: 'Both use ... . Spread EXPANDS an iterable/object into elements/properties (right side: [...arr], { ...obj }, fn(...args)). Rest COLLECTS remaining items into an array/object (left side of destructuring or in function parameters).', level: 'Easy' },
    { q: 'What is the output?\nconst a = { x: 1, y: 2 };\nconst b = { ...a, x: 9 };\nconst c = { x: 9, ...a };\nconsole.log(b.x, c.x);', a: '9 1. Later properties win. In b, x: 9 comes after the spread. In c, the spread of a comes after, so a.x = 1 overwrites 9.', level: 'Medium' },
    { q: 'Is object spread a deep copy?', a: 'No, it is a shallow copy. Top-level values are copied, but nested objects/arrays are shared by reference. Use structuredClone() (or a library) for deep copies.', level: 'Medium' },
    { q: 'What is the output?\nconst o = { p: { q: 1 } };\nconst c = { ...o };\nc.p.q = 2;\nconsole.log(o.p.q, o === c, o.p === c.p);', a: '2 false true. c is a new object (so o !== c) but c.p points to the same nested object as o.p.', level: 'Hard' },
    { q: 'How do you swap two variables in one line?', a: '[a, b] = [b, a]; using array destructuring.', level: 'Easy' },
    { q: 'Why add "= {}" to a destructured parameter, e.g. function f({ x } = {})?', a: 'Without it, calling f() destructures undefined, which throws "Cannot destructure property x of undefined". The default empty object makes x simply undefined.', level: 'Medium' },
    { q: 'What is the output?\nconst { length } = "hello";\nconsole.log(length);', a: '5. Destructuring works on any value that can be converted to an object; a string has a length property.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Given const rgb = [255, 128, 0], destructure into red, green, blue and print "rgb(255, 128, 0)".',
      hint: 'const [red, green, blue] = rgb;',
      solution: `const rgb = [255, 128, 0];
const [red, green, blue] = rgb;
console.log('rgb(' + red + ', ' + green + ', ' + blue + ')');`,
    },
    {
      task: 'From const movie = { title: "3 Idiots", year: 2009, details: { director: "Rajkumar Hirani", rating: 8.4 } }, extract title, year as releaseYear, director and rating, and a language with default "Hindi".',
      hint: 'Combine rename, nested destructuring and defaults.',
      solution: `const movie = { title: '3 Idiots', year: 2009, details: { director: 'Rajkumar Hirani', rating: 8.4 } };
const { title, year: releaseYear, language = 'Hindi', details: { director, rating } } = movie;
console.log(title, releaseYear, language, director, rating);`,
    },
    {
      task: 'Write a function updateUser(user, changes) that returns a NEW user object with the changes applied, without modifying the original.',
      hint: 'return { ...user, ...changes };',
      solution: `function updateUser(user, changes) {
  return { ...user, ...changes };
}
const u = { name: 'Asha', age: 21 };
const u2 = updateUser(u, { age: 22, city: 'Pune' });
console.log(u);  // { name: 'Asha', age: 21 }
console.log(u2); // { name: 'Asha', age: 22, city: 'Pune' }`,
    },
    {
      task: 'Write omit(obj, key) that returns a copy of obj without the given key, using rest destructuring with a computed key.',
      hint: 'const { [key]: _, ...rest } = obj;',
      solution: `function omit(obj, key) {
  const { [key]: removed, ...rest } = obj;
  return rest;
}
console.log(omit({ a: 1, b: 2, c: 3 }, 'b')); // { a: 1, c: 3 }`,
    },
    {
      task: 'Write a function bookTicket({ from, to, seats = 1, travelClass = "Sleeper" }) that returns a summary string. Call it with only from and to, and with all options.',
      hint: 'Destructure in the parameter list with defaults, and add = {}.',
      solution: `function bookTicket({ from, to, seats = 1, travelClass = 'Sleeper' } = {}) {
  return from + ' -> ' + to + ', ' + seats + ' seat(s), ' + travelClass;
}
console.log(bookTicket({ from: 'Mumbai', to: 'Pune' }));
console.log(bookTicket({ to: 'Delhi', from: 'Agra', seats: 3, travelClass: 'AC' }));`,
    },
  ],
  quiz: [
    { question: 'What is `b` after `const [a, b = 2] = [1, null];`?', options: ['2', 'undefined', 'null', '1'], answer: 2, explanation: 'Defaults only apply to undefined; null is a real value.' },
    { question: 'Which line removes `pwd` from user without mutating it?', options: ['delete user.pwd', 'const { pwd, ...rest } = user;', 'const rest = user - pwd;', 'user.pwd = undefined'], answer: 1, explanation: 'Rest destructuring collects all other keys into a new object.' },
    { question: 'What is `{ ...{ a: 1 }, ...{ a: 2 } }.a`?', options: ['2', '1', '[1, 2]', 'undefined'], answer: 0, explanation: 'The later spread overwrites the same key.' },
    { question: 'Object spread creates a...', options: ['deep copy', 'frozen copy', 'reference to the same object', 'shallow copy'], answer: 3, explanation: 'Nested objects remain shared references.' },
    { question: 'How do you destructure the `name` key into a variable called `n`?', options: ['const { n: name } = obj', 'const { name as n } = obj', 'const { name: n } = obj', 'const [name: n] = obj'], answer: 2, explanation: 'The pattern is key: newVariableName.' },
  ],
};
