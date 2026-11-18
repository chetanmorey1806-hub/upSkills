export default {
  lesson: 'day-19-json',
  minutes: 25,
  intro: 'Convert objects to JSON and back, pretty-print and filter fields, and parse untrusted JSON safely.',
  tasks: [
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid JSON**? (choose all that apply)',
      options: ['{"name": "Asha", "age": 20}', "{'name': 'Asha'}", '{name: "Asha"}', '[1, 2, 3]', '{"active": true, "phone": null}', '{"a": 1,}'],
      answers: [0, 3, 4],
      explain: 'JSON needs **double quotes** around keys and strings, allows no trailing commas, and has no `undefined`, functions or comments. Arrays, `true/false` and `null` are fine.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What JSON loses. What is printed?',
      code: `const data = { name: "Pen", price: 10, discount: undefined, show() {}, rating: NaN };
console.log(JSON.stringify(data));
console.log(JSON.stringify([1, undefined, 3]));
console.log(typeof JSON.stringify(data));`,
      expected: '{"name":"Pen","price":10,"rating":null}\n[1,null,3]\nstring',
      explain: 'Properties with `undefined` or function values are **dropped** from objects; in arrays they become `null`. `NaN` and `Infinity` become `null`. The result of stringify is always a **string**.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `toJSONText(product)` that returns the product as a JSON string **pretty-printed with 2 spaces** of indentation.',
      example: { title: 'stringify arguments', code: 'JSON.stringify(value, replacer, space);\nJSON.stringify({ a: 1 }, null, 4);' },
      starter: 'function toJSONText(product) {\n  // TODO\n}',
      solution: 'function toJSONText(product) {\n  return JSON.stringify(product, null, 2);\n}',
      tests: [
        { call: 'toJSONText({ name: "Pen", price: 10 })', expect: '{\n  "name": "Pen",\n  "price": 10\n}' },
      ],
      explain: 'The third argument is the indentation. The second (replacer) must be `null` when you do not need it; skipping it by writing `JSON.stringify(product, 2)` treats 2 as a replacer and does not indent.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Hide sensitive data before sending. Write `safeJSON(user)` that returns a JSON string containing **only** the `name` and `email` fields. Use the **replacer array** argument of `JSON.stringify`.',
      example: { title: 'replacer array', code: 'JSON.stringify({ a: 1, b: 2, c: 3 }, ["a", "c"]); // \'{"a":1,"c":3}\'' },
      starter: 'function safeJSON(user) {\n  // TODO\n}',
      solution: 'function safeJSON(user) {\n  return JSON.stringify(user, ["name", "email"]);\n}',
      tests: [
        { call: 'safeJSON({ name: "Asha", email: "asha@mail.in", password: "123", otp: 4455 })', expect: '{"name":"Asha","email":"asha@mail.in"}' },
      ],
      explain: 'An array replacer acts as a whitelist of keys to keep. This is a quick way to avoid leaking passwords or OTPs into logs or storage.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Parse untrusted JSON safely. Write `safeParse(text, fallback)` that returns `JSON.parse(text)`, or returns `fallback` if the text is not valid JSON. Use `try/catch`.',
      example: { title: 'catching a parse error', code: 'try {\n  JSON.parse("{bad json}");\n} catch (err) {\n  console.log("Invalid:", err.name); // SyntaxError\n}' },
      starter: 'function safeParse(text, fallback) {\n  return JSON.parse(text); // TODO: make it safe\n}',
      solution: 'function safeParse(text, fallback) {\n  try {\n    return JSON.parse(text);\n  } catch (err) {\n    return fallback;\n  }\n}',
      tests: [
        { call: 'safeParse(\'{"city":"Pune"}\', {})', expect: { city: 'Pune' } },
        { call: 'safeParse("{city: Pune}", { city: "Unknown" })', expect: { city: 'Unknown' } },
        { call: 'safeParse("", [])', expect: [] },
        { call: 'safeParse("[1,2]", null)', expect: [1, 2] },
      ],
      explain: '`JSON.parse` **throws** a SyntaxError on invalid input (including an empty string). Data from localStorage, files or APIs can be broken, so always wrap parsing in try/catch and provide a sensible default.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'An API sends orders as JSON text. Write `orderTotal(json)` that parses the text (an array of `{ item, price, qty }`) and returns the total amount.',
      example: { title: 'parse then use', code: 'const arr = JSON.parse(\'[{"n":1},{"n":2}]\');\narr[1].n; // 2' },
      starter: 'function orderTotal(json) {\n  // TODO\n}',
      solution: 'function orderTotal(json) {\n  const orders = JSON.parse(json);\n  let total = 0;\n  for (const o of orders) total += o.price * o.qty;\n  return total;\n}',
      tests: [
        { call: 'orderTotal(\'[{"item":"Tea","price":20,"qty":3},{"item":"Samosa","price":15,"qty":2}]\')', expect: 90 },
        { call: 'orderTotal("[]")', expect: 0 },
      ],
      explain: 'JSON text is just a string; you cannot read `json[0].price` until you `JSON.parse` it into real arrays and objects. Treating the raw string like an array is a very common mistake.',
    },
  ],
};
