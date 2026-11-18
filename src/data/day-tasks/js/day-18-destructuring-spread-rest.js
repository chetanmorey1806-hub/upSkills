export default {
  lesson: 'day-18-destructuring-spread-rest',
  minutes: 30,
  intro: 'Unpack arrays and objects with destructuring, and copy, merge and omit object fields with spread and rest.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const toppers = ["Asha", "Ravi", "Meena", "John"];
const [first, , third, ...others] = toppers;
console.log(first, third);
console.log(others.length);

let a = 1, b = 2;
[a, b] = [b, a];
console.log(a, b);`,
      expected: 'Asha Meena\n1\n2 1',
      explain: 'Array destructuring is **by position**; an empty slot `, ,` skips an item and `...others` collects the rest (only "John"). `[a, b] = [b, a]` swaps without a temp variable.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Object destructuring with rename, default and nesting. What is printed?',
      code: `const emp = { name: "Ravi", dept: { city: "Pune" } };
const { name: fullName, salary = 30000, dept: { city } } = emp;
console.log(fullName);
console.log(salary);
console.log(city);`,
      expected: 'Ravi\n30000\nPune',
      explain: '`name: fullName` reads `name` into a new variable called `fullName`. `salary = 30000` is used because `emp.salary` is undefined. `dept: { city }` reaches inside the nested object.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Use **parameter destructuring**. Write `formatUser({ name, city = "Unknown" })` that returns `"<name> from <city>"`.',
      example: { title: 'destructuring in the parameter list', code: 'function area({ width, height }) {\n  return width * height;\n}\narea({ width: 3, height: 4 }); // 12' },
      starter: 'function formatUser(user) {\n  // TODO: destructure name and city (default "Unknown")\n}',
      solution: 'function formatUser({ name, city = "Unknown" }) {\n  return `${name} from ${city}`;\n}',
      tests: [
        { call: 'formatUser({ name: "Asha", city: "Nashik" })', expect: 'Asha from Nashik' },
        { call: 'formatUser({ name: "Ravi" })', expect: 'Ravi from Unknown' },
      ],
      explain: 'Destructuring right in the parameters shows exactly which fields the function needs and lets you set defaults. Order does not matter for objects, only key names do.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Merge settings. Write `mergeSettings(defaults, userSettings)` that returns a **new** object where user settings override the defaults. Use object spread.',
      example: { title: 'later spread wins', code: 'const a = { x: 1, y: 2 };\nconst b = { y: 9 };\nconst c = { ...a, ...b }; // { x: 1, y: 9 }' },
      starter: 'function mergeSettings(defaults, userSettings) {\n  // TODO\n}',
      solution: 'function mergeSettings(defaults, userSettings) {\n  return { ...defaults, ...userSettings };\n}',
      tests: [
        { call: 'mergeSettings({ theme: "light", lang: "en", fontSize: 14 }, { theme: "dark" })', expect: { theme: 'dark', lang: 'en', fontSize: 14 } },
        { call: '(() => { const d = { a: 1 }; mergeSettings(d, { a: 2 }); return d.a; })()', expect: 1, msg: 'defaults object is not changed' },
      ],
      explain: 'When keys collide, the **last** spread wins, so put user settings after defaults. Spread creates a **shallow** copy: nested objects are still shared, so changing `copy.nested.x` would affect the original.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Remove a sensitive field. Write `publicProfile(user)` that returns a new object with every field **except** `password`, using object **rest**.',
      example: { title: 'rest to omit a field', code: 'const { id, ...withoutId } = product;' },
      starter: 'function publicProfile(user) {\n  // TODO\n}',
      solution: 'function publicProfile(user) {\n  const { password, ...rest } = user;\n  return rest;\n}',
      tests: [
        { call: 'publicProfile({ name: "Asha", email: "a@x.in", password: "secret" })', expect: { name: 'Asha', email: 'a@x.in' } },
        { call: '(() => { const u = { name: "R", password: "p" }; publicProfile(u); return u.password; })()', expect: 'p', msg: 'The original user still has its password' },
      ],
      explain: '`const { password, ...rest } = user` pulls out `password` and gathers everything else into a **new** object `rest`. Using `delete user.password` would damage the caller\'s object.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `minMax(nums)` that returns an object `{ min, max }`. Then the caller can destructure it. Use `Math.min`/`Math.max` with spread and **shorthand properties**.',
      example: { title: 'shorthand properties', code: 'const total = 10, count = 2;\nreturn { total, count }; // { total: 10, count: 2 }' },
      starter: 'function minMax(nums) {\n  // TODO\n}',
      solution: 'function minMax(nums) {\n  const min = Math.min(...nums);\n  const max = Math.max(...nums);\n  return { min, max };\n}',
      tests: [
        { call: 'minMax([45, 12, 99, 30])', expect: { min: 12, max: 99 } },
        { call: '(() => { const { max } = minMax([1, 5]); return max; })()', expect: 5 },
      ],
      explain: 'Returning an object lets a function give back several named values, and the caller destructures just what it needs. `{ min, max }` is shorthand for `{ min: min, max: max }`.',
    },
  ],
};
