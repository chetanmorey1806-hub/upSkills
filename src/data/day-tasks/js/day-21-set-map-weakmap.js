export default {
  lesson: 'day-21-set-map-weakmap',
  minutes: 30,
  intro: 'Remove duplicates with Set, count and look up with Map, and know when WeakMap is useful.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const tags = new Set(["js", "css", "js", "html", "css"]);
console.log(tags.size);
tags.add("js");
tags.delete("css");
console.log(tags.has("css"));
console.log([...tags].join(","));`,
      expected: '3\nfalse\njs,html',
      explain: 'A Set stores each value **only once**, so the duplicates are ignored (size 3) and adding "js" again does nothing. Sets keep **insertion order**, which is why spread gives "js,html".',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 4,
      q: 'Write `uniqueEmails(emails)` that returns an **array** of the emails without duplicates (keep the first-seen order). Use a `Set`.',
      example: { title: 'array → Set → array', code: 'const unique = [...new Set([1, 1, 2])]; // [1, 2]' },
      starter: 'function uniqueEmails(emails) {\n  // TODO\n}',
      solution: 'function uniqueEmails(emails) {\n  return [...new Set(emails)];\n}',
      tests: [
        { call: 'uniqueEmails(["a@x.in", "b@x.in", "a@x.in", "c@x.in", "b@x.in"])', expect: ['a@x.in', 'b@x.in', 'c@x.in'] },
        { call: 'Array.isArray(uniqueEmails(["x"]))', expect: true, msg: 'Returns a real array, not a Set' },
      ],
      explain: '`new Set(array)` drops duplicates, and spread `[...set]` (or `Array.from(set)`) turns it back into an array. Returning the Set itself would break code that expects array methods like `map`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Skills comparison. Write `commonSkills(a, b)` that returns an array of skills present in **both** arrays (in the order of `a`). Use a Set for fast `has` lookups.',
      example: { title: 'set intersection', code: 'const setB = new Set(b);\na.filter((x) => setB.has(x));' },
      starter: 'function commonSkills(a, b) {\n  // TODO\n}',
      solution: 'function commonSkills(a, b) {\n  const setB = new Set(b);\n  return a.filter((s) => setB.has(s));\n}',
      tests: [
        { call: 'commonSkills(["HTML", "CSS", "JS", "React"], ["JS", "Node", "HTML"])', expect: ['HTML', 'JS'] },
        { call: 'commonSkills(["Excel"], ["Power BI"])', expect: [] },
      ],
      explain: '`set.has(x)` is very fast compared with `array.includes(x)` on big lists. Filtering `a` while checking membership in a Set of `b` gives the intersection.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Word frequency. Write `wordCount(text)` that splits the text on spaces and returns a **Map** from each lowercase word to how many times it appears.',
      example: { title: 'counting with a Map', code: 'const m = new Map();\nm.set("tea", (m.get("tea") || 0) + 1);' },
      starter: 'function wordCount(text) {\n  const counts = new Map();\n  // TODO\n  return counts;\n}',
      solution: 'function wordCount(text) {\n  const counts = new Map();\n  for (const w of text.toLowerCase().split(" ")) {\n    counts.set(w, (counts.get(w) || 0) + 1);\n  }\n  return counts;\n}',
      tests: [
        { call: 'Object.fromEntries(wordCount("Chai and more chai and SAMOSA"))', expect: { chai: 2, and: 2, more: 1, samosa: 1 } },
        { call: 'wordCount("a A a").get("a")', expect: 3 },
        { call: 'wordCount("x") instanceof Map', expect: true, msg: 'Returns a Map' },
      ],
      explain: 'Use `map.get` / `map.set`, not `map[key] = ...` (that adds a normal property and the Map stays empty). `get` returns undefined for a new word, hence `|| 0`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You want to attach extra data to DOM element objects without stopping them from being garbage collected when they are removed. Which collection fits best?',
      options: ['Array', 'Map', 'WeakMap', 'Set'],
      answer: 2,
      explain: 'A **WeakMap** only accepts objects as keys and holds them **weakly**: if nothing else references the key object, it can be garbage collected along with its entry. A Map would keep the object alive forever.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Map vs plain object keys. What is printed?',
      code: `const m = new Map();
m.set(1, "number one");
m.set("1", "string one");
console.log(m.size);

const o = {};
o[1] = "number one";
o["1"] = "string one";
console.log(Object.keys(o).length);`,
      expected: '2\n1',
      explain: 'A Map keeps keys with their real type, so `1` and `"1"` are different keys. Plain object keys are always **converted to strings**, so `o[1]` and `o["1"]` are the same property.',
    },
  ],
};
