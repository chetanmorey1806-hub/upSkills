export default {
  lesson: 'day-06-strings-and-string-methods',
  minutes: 30,
  intro: 'Use template literals and string methods to clean, search and transform text like names, slugs and card numbers.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Strings are **immutable**. What does this print?\n```\nlet name = "asha";\nname.toUpperCase();\nconsole.log(name);\n```',
      options: ['ASHA', 'asha', 'Asha', 'undefined'],
      answer: 1,
      explain: 'String methods **return a new string**; they never change the original. Because the result of `toUpperCase()` was not saved, `name` is still "asha". Write `name = name.toUpperCase();` to keep it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const s = "JavaScript";
console.log(s.length);
console.log(s[0] + s[s.length - 1]);
console.log(s.slice(0, 4));
console.log(s.indexOf("S"));
console.log(s.includes("script"));`,
      expected: '10\nJt\nJava\n4\nfalse',
      explain: 'Indexes start at 0, so the last character is at `length - 1`. `slice(0, 4)` takes indexes 0-3 (end is excluded). `includes` is **case-sensitive**: "script" (lowercase s) is not in "JavaScript".',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the template literal so it produces `Hello, Asha! You scored 92.` given `const name = "Asha", score = 92;`\n\n```\nconst msg = `Hello, ____! You scored ${score}.`;\n```\nWhat goes in the blank?',
      accept: ['${name}', '${ name }'],
      explain: 'Inside backticks, `${expression}` inserts the value of any expression. Writing just `name` would print the word "name" literally. Template literals only work with **backticks**, not with quotes.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Clean a form input. Write `cleanEmail(email)` that removes spaces at both ends and converts the email to lowercase.',
      example: { title: 'chaining methods', code: 'const city = "  PUNE ";\ncity.trim().toLowerCase(); // "pune"' },
      starter: 'function cleanEmail(email) {\n  // TODO\n}',
      solution: 'function cleanEmail(email) {\n  return email.trim().toLowerCase();\n}',
      tests: [
        { call: 'cleanEmail("  Asha.Patil@Gmail.COM  ")', expect: 'asha.patil@gmail.com' },
        { call: 'cleanEmail("ravi@upskillr.in")', expect: 'ravi@upskillr.in' },
      ],
      explain: 'Each method returns a new string, so you can **chain** them: `trim()` then `toLowerCase()`. Forgetting `return` is the classic mistake: the function would then give `undefined`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `makeSlug(title)` that turns a blog title into a URL slug: trim it, make it lowercase and replace **every** space with `-`.\n\nExample: `"  Learn JavaScript Fast "` → `"learn-javascript-fast"`',
      example: { title: 'replace vs replaceAll', code: '"a b c".replace(" ", "_");    // "a_b c"  (only first)\n"a b c".replaceAll(" ", "_"); // "a_b_c"' },
      starter: 'function makeSlug(title) {\n  // TODO\n}',
      solution: 'function makeSlug(title) {\n  return title.trim().toLowerCase().replaceAll(" ", "-");\n}',
      tests: [
        { call: 'makeSlug("  Learn JavaScript Fast ")', expect: 'learn-javascript-fast' },
        { call: 'makeSlug("Top 10 Places in Goa")', expect: 'top-10-places-in-goa' },
        { call: 'makeSlug("Hello")', expect: 'hello' },
      ],
      explain: '`replace` with a string changes only the **first** match; `replaceAll` (or `split(" ").join("-")`) changes all of them. Trim first, otherwise leading spaces would become leading dashes.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Mask a card number. Write `maskCard(card)` that keeps only the **last 4 digits** and replaces the rest with `*`, keeping the same length.\n\nExample: `"1234567812345678"` → `"************5678"`',
      example: { title: 'slice and padStart', code: '"42".padStart(5, "0");   // "00042"\n"abcdef".slice(-2);       // "ef"' },
      starter: 'function maskCard(card) {\n  // TODO\n}',
      solution: 'function maskCard(card) {\n  const last4 = card.slice(-4);\n  return last4.padStart(card.length, "*");\n}',
      tests: [
        { call: 'maskCard("1234567812345678")', expect: '************5678' },
        { call: 'maskCard("98765")', expect: '*8765' },
      ],
      explain: '`slice(-4)` counts from the end and returns the last 4 characters. `padStart(totalLength, "*")` fills the front with stars until the string is as long as the original. Alternatively: `"*".repeat(card.length - 4) + last4`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `initials(fullName)` that returns the capital initials of a two-word name.\n\nExample: `"asha patil"` → `"AP"`',
      example: { title: 'split into words', code: '"red green".split(" "); // ["red", "green"]' },
      starter: 'function initials(fullName) {\n  // TODO\n}',
      solution: 'function initials(fullName) {\n  const parts = fullName.trim().split(" ");\n  return (parts[0][0] + parts[1][0]).toUpperCase();\n}',
      tests: [
        { call: 'initials("asha patil")', expect: 'AP' },
        { call: 'initials("Ravi Kumar")', expect: 'RK' },
      ],
      explain: '`split(" ")` gives an array of words, `[0]` on a word gives its first character, and `toUpperCase()` capitalises the result. Without `toUpperCase()`, lowercase names would give "ap".',
    },
  ],
};
