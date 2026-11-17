export default {
  id: 'day-19-json',
  title: 'JSON: JSON.stringify and JSON.parse',
  module: 'Module 3: Objects & Data Structures',
  day: 19,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'JSON is the text format that web servers, APIs and localStorage use to exchange data. Today you learn the JSON syntax rules, how to convert objects to JSON text with JSON.stringify and back with JSON.parse, and how to handle pretty printing, filtering, revivers and invalid JSON safely.',
  objectives: [
    'Explain what JSON is and how it differs from a JavaScript object literal',
    'Convert values to JSON strings with JSON.stringify, including pretty printing and filtering',
    'Convert JSON strings back to values with JSON.parse and use a reviver',
    'Know which values JSON cannot represent (undefined, functions, Date, NaN) and what happens to them',
    'Parse untrusted JSON safely with try/catch',
  ],
  theory: [
    {
      heading: 'What is JSON?',
      content: "**JSON** (JavaScript Object Notation) is a lightweight **text format** for storing and sending data. It looks like JavaScript objects, but it is just a **string**.\n\nAnalogy: a JavaScript object is a built piece of furniture; JSON is the flat-pack box with instructions. You cannot send furniture over the internet, so you pack it into text (stringify), send it, and the other side assembles it again (parse).\n\nJSON is language independent: Python, Java, PHP and C# all read and write it. Almost every REST API returns JSON, and `localStorage` can only store strings, so JSON is how we save objects there.",
      points: [
        'File extension .json, MIME type application/json',
        'Supported types: string, number, boolean, null, object, array',
        'NOT supported: undefined, functions, Symbol, Date (becomes string), NaN/Infinity (become null), BigInt (throws)',
      ],
    },
    {
      heading: 'JSON Syntax Rules (vs JS Objects)',
      content: "JSON is stricter than a JavaScript object literal:\n\n1. Keys MUST be in **double quotes**: `{\"name\": \"Asha\"}`\n2. Strings MUST use double quotes (no single quotes, no backticks)\n3. **No trailing commas**\n4. **No comments**\n5. No functions, no `undefined`\n\nMost \"Unexpected token\" errors when parsing come from breaking one of these rules.",
      syntax: `// Valid JSON text
{
  "name": "Asha",
  "age": 22,
  "skills": ["HTML", "CSS"],
  "isAdmin": false,
  "manager": null
}

// INVALID JSON (but valid JS object literal)
{ name: 'Asha', age: 22, }`,
    },
    {
      heading: 'JSON.stringify(): Object to String',
      content: "`JSON.stringify(value, replacer, space)` converts a JavaScript value into a JSON string.\n\n- **value**: the object/array/primitive to convert\n- **replacer** (optional): an array of keys to keep, or a function `(key, value) => newValue` to transform/skip values\n- **space** (optional): a number (or string) for indentation, used for **pretty printing**\n\nWhat happens to special values:\n- Object properties with `undefined`, functions or Symbols are **skipped**\n- In arrays, those become `null`\n- `NaN` and `Infinity` become `null`\n- `Date` becomes an ISO string (because Date has a `toJSON` method)",
      syntax: `const user = { name: 'Asha', age: 22, password: 'x' };
JSON.stringify(user);                      // '{"name":"Asha","age":22,"password":"x"}'
JSON.stringify(user, ['name', 'age']);     // only these keys
JSON.stringify(user, null, 2);             // pretty, 2-space indent
JSON.stringify({ a: undefined, f() {} });  // '{}'
JSON.stringify([undefined, NaN]);          // '[null,null]'`,
      tip: 'If an object has a `toJSON()` method, JSON.stringify uses its return value. That is how Date turns into an ISO string.',
    },
    {
      heading: 'JSON.parse(): String to Object',
      content: "`JSON.parse(text, reviver)` converts a JSON string back into a JavaScript value.\n\n- If the text is not valid JSON, it throws a **SyntaxError**. Always wrap parsing of external data (API, localStorage, user input) in `try...catch`.\n- The optional **reviver** function `(key, value) => newValue` lets you transform values while parsing, for example converting date strings back into Date objects.\n\nNote: parsing produces a brand new object, so `JSON.parse(JSON.stringify(obj))` was an old trick for deep cloning. It loses Dates, functions and undefined, so prefer `structuredClone()` today.",
      syntax: `const text = '{"name":"Asha","joined":"2024-01-15T00:00:00.000Z"}';
const obj = JSON.parse(text);
obj.name; // 'Asha'

const withDate = JSON.parse(text, (key, value) =>
  key === 'joined' ? new Date(value) : value
);

try {
  JSON.parse("{name: 'bad'}");
} catch (err) {
  console.log('Invalid JSON:', err.name); // SyntaxError
}`,
    },
    {
      heading: 'Real-World Uses',
      content: "- **APIs**: `fetch()` responses are JSON text; `response.json()` parses it (Day 33). When sending, you `JSON.stringify` the body.\n- **localStorage**: only stores strings, so save with `JSON.stringify` and load with `JSON.parse` (Day 28).\n- **Config files**: `package.json` is JSON.\n- **Logging / debugging**: `JSON.stringify(obj, null, 2)` prints a readable snapshot of an object.",
    },
  ],
  examples: [
    {
      title: 'Stringify and Parse a Product',
      scenario: 'An online shop must send a product to the server as text, and the server sends it back. Convert both ways and prove the types.',
      steps: [
        'Create a `product` object',
        'Convert it with JSON.stringify and check typeof',
        'Convert back with JSON.parse and read a property',
        'Show that the parsed object is a new object',
        'Run it',
      ],
      code: `const product = { id: 101, name: 'Laptop', price: 55000, tags: ['electronics', 'sale'], inStock: true };

const json = JSON.stringify(product);
console.log(json);
console.log(typeof json);

const back = JSON.parse(json);
console.log(back.tags[1]);
console.log(back === product);`,
      playground: {
        js: `const product = { id: 101, name: 'Laptop', price: 55000, tags: ['electronics', 'sale'], inStock: true };

const json = JSON.stringify(product);
console.log(json);
console.log(typeof json);

const back = JSON.parse(json);
console.log(typeof back, back.tags[1]);
console.log(back === product);`,
      },
      result: `{"id":101,"name":"Laptop","price":55000,"tags":["electronics","sale"],"inStock":true}
string
object sale
false`,
      explanation: 'stringify produces one line of text with double-quoted keys. parse rebuilds a real object (typeof "object") with the same data, but it is a new object in memory, so === is false.',
    },
    {
      title: 'Pretty Print and Filter Sensitive Fields',
      scenario: 'You want to log a user for debugging but must never print the password. Use the replacer array and indentation.',
      steps: [
        'Create a `user` object with a password',
        'Stringify with replacer [\'name\', \'email\'] and space 2',
        'Then use a replacer function to mask the password instead',
        'Run it and compare formats',
      ],
      code: `const user = { name: 'Ravi', email: 'ravi@mail.com', password: 'secret123' };

console.log(JSON.stringify(user, ['name', 'email'], 2));

const masked = JSON.stringify(user, (key, value) =>
  key === 'password' ? '***' : value
);
console.log(masked);`,
      playground: {
        js: `const user = { name: 'Ravi', email: 'ravi@mail.com', password: 'secret123' };

console.log(JSON.stringify(user, ['name', 'email'], 2));

const masked = JSON.stringify(user, (key, value) =>
  key === 'password' ? '***' : value
);
console.log(masked);`,
      },
      result: `{
  "name": "Ravi",
  "email": "ravi@mail.com"
}
{"name":"Ravi","email":"ravi@mail.com","password":"***"}`,
      explanation: 'A replacer array is a whitelist of keys. The number 2 indents nested levels by 2 spaces. A replacer function is called for every key; returning "***" replaces the password, returning value keeps others unchanged.',
    },
    {
      title: 'What JSON Loses: undefined, Functions, NaN, Date',
      scenario: 'A developer stores an object with a function, undefined, NaN and a Date, then reads it back and is confused. Show exactly what happens.',
      steps: [
        'Create an object with mixed special values',
        'Stringify it and log the text',
        'Parse it back and check the type of `created`',
        'Use a reviver to restore the Date',
        'Run it',
      ],
      code: `const data = {
  title: 'Note',
  draft: undefined,
  save() {},
  score: NaN,
  created: new Date(Date.UTC(2024, 0, 15)),
  list: [1, undefined, () => {}],
};
const text = JSON.stringify(data);
console.log(text);

const plain = JSON.parse(text);
console.log(typeof plain.created);

const revived = JSON.parse(text, (k, v) => (k === 'created' ? new Date(v) : v));
console.log(revived.created.getUTCFullYear());`,
      playground: {
        js: `const data = {
  title: 'Note',
  draft: undefined,
  save() {},
  score: NaN,
  created: new Date(Date.UTC(2024, 0, 15)),
  list: [1, undefined, () => {}],
};
const text = JSON.stringify(data);
console.log(text);

const plain = JSON.parse(text);
console.log(typeof plain.created);

const revived = JSON.parse(text, (k, v) => (k === 'created' ? new Date(v) : v));
console.log(revived.created instanceof Date, revived.created.getUTCFullYear());`,
      },
      result: `{"title":"Note","score":null,"created":"2024-01-15T00:00:00.000Z","list":[1,null,null]}
string
true 2024`,
      explanation: 'Object keys with undefined or function values are dropped (draft, save). NaN becomes null. Date becomes an ISO string via toJSON. Inside arrays, undefined and functions become null to keep positions. After parse, created is just a string; the reviver turns it back into a Date.',
    },
    {
      title: 'Safe Parsing with try/catch',
      scenario: 'Data from a user or a server might be broken. Write safeParse(text, fallback) that never crashes your app.',
      steps: [
        'Write safeParse using try/catch around JSON.parse',
        'Test with valid JSON',
        'Test with single quotes, trailing comma and empty string',
        'Run and see the fallback used',
      ],
      code: `function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log('Bad JSON -> ' + err.name);
    return fallback;
  }
}

console.log(safeParse('{"ok":true}').ok);
console.log(safeParse("{'ok':true}", {}));
console.log(safeParse('[1,2,]', []));
console.log(safeParse('', 'empty'));`,
      playground: {
        js: `function safeParse(text, fallback = null) {
  try {
    return JSON.parse(text);
  } catch (err) {
    console.log('Bad JSON -> ' + err.name);
    return fallback;
  }
}

console.log(safeParse('{"ok":true}').ok);
console.log(JSON.stringify(safeParse("{'ok':true}", {})));
console.log(safeParse('[1,2,]', []).length);
console.log(safeParse('', 'empty'));
console.log(safeParse('42') + 1);`,
      },
      result: `true
Bad JSON -> SyntaxError
{}
Bad JSON -> SyntaxError
0
Bad JSON -> SyntaxError
empty
43`,
      explanation: 'Single quotes, trailing commas and empty strings are all invalid JSON, so JSON.parse throws a SyntaxError which we catch and replace with the fallback. "42" is valid JSON (a number), so it parses to 42 and 42 + 1 = 43.',
    },
  ],
  interview: [
    { q: 'What is JSON?', a: 'JavaScript Object Notation: a lightweight, language-independent text format for data exchange. It supports strings, numbers, booleans, null, arrays and objects, with double-quoted keys and strings.', level: 'Easy' },
    { q: 'Difference between a JSON string and a JavaScript object?', a: 'JSON is text (typeof "string") following strict rules (double quotes, no trailing commas, no functions/undefined). A JS object is an in-memory data structure. JSON.stringify converts object -> JSON; JSON.parse converts JSON -> object.', level: 'Easy' },
    { q: 'What is the output?\nconsole.log(JSON.stringify({ a: undefined, b: () => 1, c: null }));', a: '{"c":null}. Properties with undefined or function values are omitted; null is kept.', level: 'Medium' },
    { q: 'What is the output?\nconsole.log(JSON.stringify([undefined, function(){}, NaN, 1]));', a: '[null,null,null,1]. In arrays, unsupported values become null to preserve indexes; NaN also becomes null.', level: 'Medium' },
    { q: 'What happens when you JSON.parse invalid JSON?', a: 'It throws a SyntaxError (e.g. Unexpected token). Always use try/catch when parsing data you do not control.', level: 'Easy' },
    { q: 'What are the second and third parameters of JSON.stringify?', a: 'replacer: an array of allowed keys or a function (key, value) to transform/omit values. space: number of spaces (max 10) or a string used for indentation (pretty printing).', level: 'Medium' },
    { q: 'What is a reviver in JSON.parse?', a: 'An optional function (key, value) => newValue called for each parsed value, used to transform data while parsing, for example converting ISO date strings into Date objects.', level: 'Medium' },
    { q: 'What is the output?\nconst d = JSON.parse(JSON.stringify({ when: new Date(0) }));\nconsole.log(typeof d.when);', a: 'string. Date is serialized via toJSON to "1970-01-01T00:00:00.000Z" and parse does not convert it back.', level: 'Medium' },
    { q: 'Is JSON.parse(JSON.stringify(obj)) a good deep clone?', a: 'It works only for plain JSON-safe data. It loses functions and undefined, converts Dates to strings, NaN/Infinity to null, fails on BigInt and circular references. Prefer structuredClone(obj).', level: 'Hard' },
    { q: 'What is the output?\nconsole.log(JSON.parse("true"), JSON.parse("\\"hi\\""), JSON.parse("5") * 2);', a: 'true hi 10. JSON text can be any JSON value, not only objects: true, a string, or a number.', level: 'Hard' },
    { q: 'What does JSON.stringify do with circular references?', a: 'It throws a TypeError ("Converting circular structure to JSON") because JSON cannot represent cycles.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an array of 3 students (name, marks). Convert it to pretty JSON with 4-space indentation and log it. Then parse it back and log the second student\'s name.',
      hint: 'JSON.stringify(arr, null, 4) and JSON.parse(text)[1].name.',
      solution: `const students = [
  { name: 'Asha', marks: 88 },
  { name: 'Ravi', marks: 75 },
  { name: 'Meera', marks: 92 },
];
const text = JSON.stringify(students, null, 4);
console.log(text);
console.log(JSON.parse(text)[1].name); // Ravi`,
    },
    {
      task: 'Write isValidJSON(text) that returns true or false.',
      hint: 'try { JSON.parse(text); return true; } catch { return false; }',
      solution: `function isValidJSON(text) {
  try {
    JSON.parse(text);
    return true;
  } catch {
    return false;
  }
}
console.log(isValidJSON('{"a":1}')); // true
console.log(isValidJSON("{a:1}"));   // false`,
    },
    {
      task: 'Given an order object with fields id, customer, cardNumber, total, produce a JSON string that hides cardNumber except the last 4 digits (e.g. "**** 4242").',
      hint: 'Use a replacer function that checks key === "cardNumber".',
      solution: `const order = { id: 9, customer: 'Ali', cardNumber: '4111111111114242', total: 1999 };
const json = JSON.stringify(order, (key, value) =>
  key === 'cardNumber' ? '**** ' + value.slice(-4) : value
);
console.log(json); // {"id":9,"customer":"Ali","cardNumber":"**** 4242","total":1999}`,
    },
    {
      task: 'Parse this API text and print each todo title with a tick if completed: \'[{"title":"Learn JSON","completed":true},{"title":"Build app","completed":false}]\'',
      hint: 'JSON.parse then forEach; use a ternary for the tick.',
      solution: `const text = '[{"title":"Learn JSON","completed":true},{"title":"Build app","completed":false}]';
const todos = JSON.parse(text);
todos.forEach(t => console.log((t.completed ? '[x] ' : '[ ] ') + t.title));`,
    },
    {
      task: 'Write a function that parses an event JSON like \'{"name":"Meetup","date":"2025-03-10T10:00:00.000Z"}\' and returns an object where date is a real Date.',
      hint: 'Use a reviver: (k, v) => k === "date" ? new Date(v) : v.',
      solution: `function parseEvent(text) {
  return JSON.parse(text, (k, v) => (k === 'date' ? new Date(v) : v));
}
const ev = parseEvent('{"name":"Meetup","date":"2025-03-10T10:00:00.000Z"}');
console.log(ev.date instanceof Date);     // true
console.log(ev.date.getUTCHours());       // 10`,
    },
  ],
  quiz: [
    { question: 'Which is valid JSON?', options: ["{'a': 1}", '{"a": 1}', '{a: 1}', '{"a": 1,}'], answer: 1, explanation: 'JSON requires double-quoted keys and no trailing commas.' },
    { question: 'What does JSON.stringify({ x: undefined }) return?', options: ['"{}"', '"{\\"x\\":undefined}"', '"{\\"x\\":null}"', 'It throws'], answer: 0, explanation: 'Properties with undefined values are omitted.' },
    { question: 'JSON.parse("{bad}") will...', options: ['return null', 'return undefined', 'throw a SyntaxError', 'return {}'], answer: 2, explanation: 'Invalid JSON throws a SyntaxError.' },
    { question: 'What does the third argument in JSON.stringify(obj, null, 2) do?', options: ['Limits depth to 2', 'Keeps only 2 keys', 'Repeats output twice', 'Indents with 2 spaces'], answer: 3, explanation: 'The space argument pretty-prints the output.' },
    { question: 'After JSON.parse(JSON.stringify({ d: new Date() })), what is typeof result.d?', options: ['"object"', '"string"', '"number"', '"undefined"'], answer: 1, explanation: 'Dates become ISO strings and are not converted back without a reviver.' },
  ],
};
