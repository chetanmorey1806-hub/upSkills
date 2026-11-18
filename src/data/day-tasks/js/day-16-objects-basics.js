export default {
  lesson: 'day-16-objects-basics',
  minutes: 30,
  intro: 'Create objects, read and change properties with dot and bracket notation, loop with Object.keys/values/entries and avoid the reference trap.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You have `const field = "email";` and an object `user`. How do you read the property whose name is stored in `field`?',
      options: ['user.field', 'user[field]', 'user["field"]', 'user->field'],
      answer: 1,
      explain: 'Bracket notation evaluates the expression inside: `user[field]` becomes `user["email"]`. `user.field` and `user["field"]` both look for a key literally called "field".',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const student = { name: "Asha", age: 20 };
student.city = "Pune";
delete student.age;
console.log(Object.keys(student).join(","));
console.log("age" in student);
console.log(student.marks);
const copy = student;
copy.name = "Ravi";
console.log(student.name);`,
      expected: 'name,city\nfalse\nundefined\nRavi',
      explain: 'Adding a property is just assigning it; `delete` removes it. Reading a missing key gives `undefined` (no error). `copy = student` copies the **reference**, so both names point to the same object.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `makeStudent(name, marks)` that returns an object with `name`, `marks` and a property `passed` which is `true` when marks >= 40.',
      example: { title: 'object literal', code: 'const product = {\n  name: "Pen",\n  price: 10,\n  inStock: true,\n};' },
      starter: 'function makeStudent(name, marks) {\n  // TODO\n}',
      solution: 'function makeStudent(name, marks) {\n  return { name: name, marks: marks, passed: marks >= 40 };\n}',
      tests: [
        { call: 'makeStudent("Asha", 78)', expect: { name: 'Asha', marks: 78, passed: true } },
        { call: 'makeStudent("Ravi", 20)', expect: { name: 'Ravi', marks: 20, passed: false } },
      ],
      explain: 'An object literal groups related data as key: value pairs. A value can be any expression, like `marks >= 40`. When the variable name equals the key you can use the shorthand `{ name, marks }`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `updateField(profile, key, value)` that sets the property named by `key` to `value` and returns the profile. If `value` is `null`, **delete** that property instead.',
      example: { title: 'dynamic keys', code: 'const settings = {};\nconst k = "theme";\nsettings[k] = "dark"; // { theme: "dark" }' },
      starter: 'function updateField(profile, key, value) {\n  // TODO\n  return profile;\n}',
      solution: 'function updateField(profile, key, value) {\n  if (value === null) delete profile[key];\n  else profile[key] = value;\n  return profile;\n}',
      tests: [
        { call: 'updateField({ name: "Asha" }, "city", "Nagpur")', expect: { name: 'Asha', city: 'Nagpur' } },
        { call: 'updateField({ name: "Asha", phone: "99" }, "phone", null)', expect: { name: 'Asha' } },
        { call: 'updateField({ age: 20 }, "age", 21)', expect: { age: 21 } },
      ],
      explain: 'Because the key arrives in a variable, you must use **bracket notation** `profile[key]`. `profile.key = value` would create a property named "key".',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Shopping cart: `cart` is an object like `{ pen: 2, notebook: 3 }` (quantities) and `prices` is `{ pen: 10, notebook: 45 }`. Write `cartTotal(cart, prices)` that uses `Object.entries(cart)` to return the total bill.',
      example: { title: 'Object.entries', code: 'const ages = { asha: 20, ravi: 22 };\nfor (const [name, age] of Object.entries(ages)) {\n  console.log(name, age);\n}' },
      starter: 'function cartTotal(cart, prices) {\n  let total = 0;\n  // TODO\n  return total;\n}',
      solution: 'function cartTotal(cart, prices) {\n  let total = 0;\n  for (const [item, qty] of Object.entries(cart)) {\n    total += qty * prices[item];\n  }\n  return total;\n}',
      tests: [
        { call: 'cartTotal({ pen: 2, notebook: 3 }, { pen: 10, notebook: 45 })', expect: 155 },
        { call: 'cartTotal({}, { pen: 10 })', expect: 0 },
      ],
      explain: '`Object.entries` gives `[key, value]` pairs, which you can unpack in the loop. Look up each price with `prices[item]` (bracket notation again, because `item` is a variable).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Apply a 10% discount. Write `discounted(prices)` that returns a **new object** with the same keys and every price reduced by 10%. The original object must not change.',
      example: { title: 'building a new object in a loop', code: 'const doubled = {};\nfor (const key of Object.keys(scores)) {\n  doubled[key] = scores[key] * 2;\n}' },
      starter: 'function discounted(prices) {\n  const result = {};\n  // TODO\n  return result;\n}',
      solution: 'function discounted(prices) {\n  const result = {};\n  for (const key of Object.keys(prices)) {\n    result[key] = prices[key] * 0.9;\n  }\n  return result;\n}',
      tests: [
        { call: 'discounted({ shirt: 500, jeans: 1000 })', expect: { shirt: 450, jeans: 900 } },
        { call: '(() => { const p = { cap: 200 }; discounted(p); return p.cap; })()', expect: 200, msg: 'Original prices stay the same' },
      ],
      explain: 'Writing into a fresh `result` object keeps the original safe. Changing `prices[key]` directly would also change the caller\'s object, because objects are passed by reference.',
    },
  ],
};
