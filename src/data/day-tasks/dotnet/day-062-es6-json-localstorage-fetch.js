export default {
  lesson: 'day-062-es6-json-localstorage-fetch',
  minutes: 35,
  intro: 'Use modern JavaScript (arrow functions, destructuring, spread/rest), convert JSON, save data in localStorage and call an API with fetch.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Destructuring and spread: what does this code print?',
      example: { title: 'destructuring with a default', code: 'const { city = "Pune" } = {};\nconsole.log(city); // Pune' },
      code: `const student = { name: "Asha", marks: 82, city: "Nagpur" };
const { name, ...rest } = student;
const updated = { ...student, marks: 90 };
const [first, , third] = [10, 20, 30];
console.log(name, Object.keys(rest).length);
console.log(updated.marks, student.marks);
console.log(first + third);`,
      expected: `Asha 2
90 82
40`,
      explain: '`...rest` collects the remaining properties (marks, city → 2 keys). Spreading into a new object copies the student and overrides `marks`, leaving the original at 82. Array destructuring skips the middle value with an empty slot, so 10 + 30 = 40.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`localStorage.setItem("cart", [1, 2])` and later `localStorage.getItem("cart")`. What comes back?',
      options: ['The array [1, 2]', 'The string "1,2"', 'null', 'An error is thrown'],
      answer: 1,
      explain: 'localStorage stores **strings only**, so the array is converted with `toString()` → `"1,2"`. Store objects/arrays with `JSON.stringify(...)` and read them back with `JSON.parse(...)`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The API returned the text `\'{"id":1,"name":"Ravi"}\'` in the variable `text`. Complete the line that turns it into a JavaScript object:\n`const obj = ______;`',
      example: { title: 'the other direction', code: 'const text = JSON.stringify({ id: 2 }); // \'{"id":2}\'' },
      accept: ['JSON.parse(text)', 'JSON.parse(text);'],
      caseSensitive: true,
      explain: '`JSON.parse` converts JSON text to an object; `JSON.stringify` does the reverse. With `fetch` you usually call `await res.json()`, which does the parse for you.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write an **arrow function** `toppers` that takes an array of `{ name, marks }` and a `cutoff`, and returns the **names** of students whose marks are `>= cutoff`, using `filter` and `map`.',
      example: { title: 'filter + map in one chain', code: 'const cheap = (items) => items.filter((i) => i.price < 100).map((i) => i.name);' },
      starter: 'const toppers = (students, cutoff) => {\n  // TODO\n};\n',
      solution: 'const toppers = (students, cutoff) => students.filter((s) => s.marks >= cutoff).map((s) => s.name);\n',
      tests: [
        { call: 'toppers([{ name: "Asha", marks: 91 }, { name: "Ravi", marks: 64 }, { name: "Meera", marks: 75 }], 75)', expect: ['Asha', 'Meera'] },
        { call: 'toppers([{ name: "Kiran", marks: 40 }], 50)', expect: [] },
      ],
      explain: '`filter` keeps the matching objects, `map` turns each into its name. An arrow function with an expression body returns automatically - with `{ }` you must write `return`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `addToCart(storage, item)` that reads the JSON array stored under key `"cart"` from `storage` (an object with `getItem`/`setItem`, like localStorage; missing key → empty array), pushes `item`, saves it back as JSON and returns the new length.',
      example: { title: 'read with a fallback', code: 'const prefs = JSON.parse(localStorage.getItem("prefs")) || {};' },
      starter: 'function addToCart(storage, item) {\n  // TODO\n}\n',
      solution: 'function addToCart(storage, item) {\n  const cart = JSON.parse(storage.getItem("cart")) || [];\n  cart.push(item);\n  storage.setItem("cart", JSON.stringify(cart));\n  return cart.length;\n}\n',
      tests: [
        { call: '(() => { const d = {}; const s = { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } }; addToCart(s, "Pen"); const n = addToCart(s, "Book"); return [n, d.cart]; })()', expect: [2, '["Pen","Book"]'], msg: 'Two calls must store ["Pen","Book"] as JSON and return 2' },
        { call: '(() => { const d = { cart: \'["Bag"]\' }; const s = { getItem: (k) => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); } }; return addToCart(s, "Pen"); })()', expect: 2, msg: 'An existing cart must be kept and extended' },
      ],
      explain: '`getItem` returns `null` for a missing key and `JSON.parse(null)` is `null`, so `|| []` gives a safe default. Always `JSON.stringify` before `setItem`, otherwise the array is saved as "Pen,Book" and cannot be parsed back.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 7,
      q: 'Write `async function loadStudents(fetchFn)` that calls `fetchFn("/api/students")`, throws `new Error("HTTP " + res.status)` if `res.ok` is false, and otherwise returns the parsed JSON array. (`fetchFn` behaves like `fetch`.)',
      example: { title: 'fetch with async/await', code: 'const res = await fetch("/api/courses");\nconst data = await res.json();' },
      starter: 'async function loadStudents(fetchFn) {\n  // TODO\n}\n',
      solution: 'async function loadStudents(fetchFn) {\n  const res = await fetchFn("/api/students");\n  if (!res.ok) throw new Error("HTTP " + res.status);\n  return await res.json();\n}\n',
      tests: [
        { call: 'loadStudents(async (u) => ({ ok: u === "/api/students", status: 200, json: async () => [{ id: 1, name: "Asha" }] }))', expect: [{ id: 1, name: 'Asha' }], msg: 'Call /api/students and return the parsed array' },
        { call: 'loadStudents(async () => ({ ok: false, status: 500, json: async () => ({}) })).then(() => "no error", (e) => e.message)', expect: 'HTTP 500', msg: 'A failed response must throw Error("HTTP 500")' },
      ],
      explain: '`fetch` does NOT reject on 404/500 - only on network failure - so check `res.ok` yourself. `res.json()` is also a Promise, so it needs `await` too.',
    },
  ],
};
