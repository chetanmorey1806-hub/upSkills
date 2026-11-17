export default {
  id: 'day-06-strings-and-string-methods',
  title: 'Strings and String Methods, Template Literals',
  module: 'Module 1: JavaScript Basics',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Text is everywhere in web apps: names, messages, URLs, search boxes. Learn how to create strings, use template literals for clean string building, and the most used string methods for searching, slicing, changing case, trimming, splitting and replacing.',
  objectives: [
    'Create strings with single quotes, double quotes and backticks, and escape characters',
    'Use template literals for interpolation and multi-line strings',
    'Access characters and length; understand that strings are immutable',
    'Use common methods: toUpperCase, trim, includes, indexOf, slice, split, replace/replaceAll, padStart, repeat',
    'Chain string methods to solve real tasks like slugs, initials and masking',
  ],
  theory: [
    {
      heading: 'Creating strings and escape characters',
      content: 'A **string** is a sequence of characters (text). You can create one with:\n- single quotes `\'Hello\'`\n- double quotes `"Hello"`\n- backticks `` `Hello` `` (template literals, below)\n\nSingle and double quotes behave the same; pick one style and stay consistent.\n\n**Escape characters** start with a backslash `\\`:\n- `\\n` new line\n- `\\t` tab\n- `\\\'` and `\\"` quotes inside quotes\n- `\\\\` a real backslash\n\nTip: if your text contains an apostrophe, wrap it in double quotes or backticks so you do not need to escape it: `"It\'s fine"`.',
      syntax: `const a = 'single';
const b = "double";
const c = \`backtick\`;
const quote = "She said \\"Hi\\"";
const lines = "Line 1\\nLine 2";`,
    },
    {
      heading: 'Template literals',
      content: 'Template literals use **backticks** and solve two old problems.\n\n**1. Interpolation**: put any expression inside `${ }` and its value is inserted. No more `"Hello " + name + "!"` with many plus signs.\n\n**2. Multi-line strings**: just press Enter inside backticks. Great for HTML snippets.\n\nInside `${ }` you can write any expression: maths, ternaries, function calls.',
      syntax: `const name = "Asha";
const items = 3;
const price = 120;
console.log(\`Hi \${name}, you have \${items} items. Total: \${items * price}\`);
console.log(\`Status: \${items > 0 ? "Active" : "Empty"}\`);

const card = \`
<div class="card">
  <h2>\${name}</h2>
</div>\`;`,
      tip: 'Common mistake: using normal quotes with ${}. "Hi ${name}" prints the literal text ${name}. Interpolation only works inside backticks.',
    },
    {
      heading: 'Length, characters and immutability',
      content: '- `str.length` gives the number of characters (a property, no brackets).\n- Characters are indexed from **0**: `str[0]` is the first, `str[str.length - 1]` is the last.\n- `str.at(-1)` (ES2022) also gives the last character; negative numbers count from the end.\n- `str.charAt(i)` is the older method.\n\nStrings are **immutable**: you cannot change one character in place. `str[0] = "J"` silently does nothing. Every method **returns a new string**, so save the result: `name = name.toUpperCase();`',
      syntax: `const word = "JavaScript";
console.log(word.length);  // 10
console.log(word[0]);      // "J"
console.log(word.at(-1));  // "t"`,
    },
    {
      heading: 'Searching: includes, startsWith, endsWith, indexOf',
      content: '- `includes(text)`: true/false, does the string contain text?\n- `startsWith(text)` / `endsWith(text)`: check beginning or end (e.g. file extensions, URLs).\n- `indexOf(text)`: position of the first match, or **-1** if not found.\n- `lastIndexOf(text)`: position of the last match.\n\nAll are **case-sensitive**. For case-insensitive search, lowercase both sides first: `title.toLowerCase().includes(query.toLowerCase())`.',
      syntax: `const email = "asha@gmail.com";
email.includes("@");        // true
email.endsWith(".com");     // true
email.indexOf("@");         // 4
email.indexOf("#");         // -1`,
    },
    {
      heading: 'Extracting and transforming',
      content: '**Extracting**\n- `slice(start, end)`: from start up to (not including) end. Negative indexes count from the end. `slice(-3)` = last 3 characters.\n- `substring(start, end)`: like slice but no negative indexes (prefer slice).\n\n**Case and spaces**\n- `toUpperCase()`, `toLowerCase()`\n- `trim()`, `trimStart()`, `trimEnd()`: remove spaces at the ends (very important for form input)\n\n**Replacing**\n- `replace(a, b)`: replaces the **first** match only\n- `replaceAll(a, b)`: replaces every match\n\n**Splitting and joining**\n- `split(separator)`: string to **array**: `"a,b,c".split(",")` gives `["a","b","c"]`\n- `array.join(separator)`: array back to string\n\n**Padding and repeating**\n- `padStart(length, char)`, `padEnd(length, char)`: `"5".padStart(3, "0")` is "005"\n- `repeat(n)`: `"ab".repeat(3)` is "ababab"',
      tip: 'Method chaining: because each method returns a new string, you can chain them: input.trim().toLowerCase().replaceAll(" ", "-").',
    },
    {
      heading: 'Comparing strings',
      content: '`===` compares exactly, including case: `"Hello" === "hello"` is false.\n\nFor sorting names in different languages or ignoring case, use `a.localeCompare(b)`, which returns a negative number, 0 or positive. You will use it with `sort` on Day 15.\n\nComing next (Day 7): numbers and the Math object.',
    },
  ],
  examples: [
    {
      title: 'Greeting card with template literals',
      scenario: 'Build an order confirmation message for a customer using interpolation, an expression and a ternary.',
      steps: [
        'Create variables for name, item, quantity and price',
        'Build the message with backticks and ${}',
        'Add a multi-line template literal',
        'Click Run',
      ],
      code: `const customer = "Meera";
const item = "Headphones";
const qty = 2;
const price = 1499;

console.log(\`Hi \${customer}! You ordered \${qty} x \${item}.\`);
console.log(\`Total: Rs. \${qty * price}\`);
console.log(\`Delivery: \${qty * price > 2000 ? "Free" : "Rs. 50"}\`);
const receipt = \`--- Receipt ---
Item: \${item}
Qty: \${qty}\`;
console.log(receipt);`,
      playground: {
        js: `const customer = "Meera";
const item = "Headphones";
const qty = 2;
const price = 1499;

console.log(\`Hi \${customer}! You ordered \${qty} x \${item}.\`);
console.log(\`Total: Rs. \${qty * price}\`);
console.log(\`Delivery: \${qty * price > 2000 ? "Free" : "Rs. 50"}\`);
const receipt = \`--- Receipt ---
Item: \${item}
Qty: \${qty}\`;
console.log(receipt);`,
      },
      result: `Hi Meera! You ordered 2 x Headphones.
Total: Rs. 2998
Delivery: Free
--- Receipt ---
Item: Headphones
Qty: 2`,
      explanation: 'Everything inside ${ } is evaluated: variables, multiplication and even a ternary. The receipt string spans three lines because template literals keep real line breaks.',
    },
    {
      title: 'Cleaning and validating form input',
      scenario: 'A user typed an email with extra spaces and capital letters. Clean it and run basic checks.',
      steps: [
        'Store the raw input with spaces and mixed case',
        'Chain trim() and toLowerCase()',
        'Check includes("@"), endsWith and find the domain with indexOf + slice',
        'Click Run',
      ],
      code: `const raw = "   Ravi.Kumar@Gmail.COM  ";
const email = raw.trim().toLowerCase();
console.log(email);
console.log("Length before/after:", raw.length, email.length);
console.log("Has @:", email.includes("@"));
console.log("Is .com:", email.endsWith(".com"));
const at = email.indexOf("@");
console.log("User:", email.slice(0, at));
console.log("Domain:", email.slice(at + 1));`,
      playground: {
        js: `const raw = "   Ravi.Kumar@Gmail.COM  ";
const email = raw.trim().toLowerCase();
console.log(email);
console.log("Length before/after:", raw.length, email.length);
console.log("Has @:", email.includes("@"));
console.log("Is .com:", email.endsWith(".com"));
const at = email.indexOf("@");
console.log("User:", email.slice(0, at));
console.log("Domain:", email.slice(at + 1));`,
      },
      result: `ravi.kumar@gmail.com
Length before/after: 25 20
Has @: true
Is .com: true
User: ravi.kumar
Domain: gmail.com`,
      explanation: 'trim removes the 3 leading and 2 trailing spaces, toLowerCase normalises case so comparisons work. indexOf("@") finds position 10. slice(0, 10) takes characters 0 to 9, and slice(11) takes everything after the @.',
    },
    {
      title: 'Making a URL slug and initials',
      scenario: 'A blog needs a URL-friendly slug from a title, and a profile badge needs initials from a full name.',
      steps: [
        'Clean the title with trim and toLowerCase',
        'Replace spaces with hyphens using replaceAll',
        'Split a full name into words and take the first letter of each',
        'Click Run',
      ],
      code: `const title = "  Learn JavaScript Strings Today ";
const slug = title.trim().toLowerCase().replaceAll(" ", "-");
console.log(slug);

const fullName = "anita rao sharma";
const parts = fullName.split(" ");
console.log(parts.length, parts[1]);
const initials = parts[0][0] + parts[1][0] + parts[2][0];
console.log(initials.toUpperCase());
console.log("hello world".replace("o", "0"), "|", "hello world".replaceAll("o", "0"));`,
      playground: {
        js: `const title = "  Learn JavaScript Strings Today ";
const slug = title.trim().toLowerCase().replaceAll(" ", "-");
console.log(slug);

const fullName = "anita rao sharma";
const parts = fullName.split(" ");
console.log(parts.length, parts[1]);
const initials = parts[0][0] + parts[1][0] + parts[2][0];
console.log(initials.toUpperCase());
console.log("hello world".replace("o", "0"), "|", "hello world".replaceAll("o", "0"));`,
      },
      result: `learn-javascript-strings-today
3 rao
ARS
hell0 world | hell0 w0rld`,
      explanation: 'Chaining runs left to right: trim, then lowercase, then replace every space. split(" ") turns the name into an array of 3 words; parts[1][0] means "first character of the second word". replace changes only the first "o", replaceAll changes both.',
    },
    {
      title: 'Masking a card number and formatting with padStart',
      scenario: 'Show only the last 4 digits of a card number, and format an order number to always have 6 digits.',
      steps: [
        'Take the last 4 characters with slice(-4)',
        'Build the mask with "*".repeat()',
        'Pad an order number with padStart',
        'Click Run',
      ],
      code: `const card = "4111222233334444";
const last4 = card.slice(-4);
const masked = "*".repeat(card.length - 4) + last4;
console.log(masked);
console.log("Order #" + String(42).padStart(6, "0"));
console.log("Name".padEnd(10, ".") + "Asha");
console.log(card.at(0), card.at(-1));`,
      playground: {
        js: `const card = "4111222233334444";
const last4 = card.slice(-4);
const masked = "*".repeat(card.length - 4) + last4;
console.log(masked);
console.log("Order #" + String(42).padStart(6, "0"));
console.log("Name".padEnd(10, ".") + "Asha");
console.log(card.at(0), card.at(-1));`,
      },
      result: `************4444
Order #000042
Name......Asha
4 4`,
      explanation: 'slice(-4) counts from the end. repeat builds 12 stars (16 - 4). padStart only works on strings, so 42 is converted with String() first and padded to length 6 with zeros. padEnd adds dots to the right until the length is 10. at(0) and at(-1) give the first and last characters.',
    },
  ],
  interview: [
    { q: 'What are template literals and their advantages?', a: 'Strings written with backticks. They support interpolation with ${expression}, multi-line strings without \\n, and tagged templates. They make string building more readable than + concatenation.', level: 'Easy' },
    { q: 'Are strings mutable in JavaScript?', a: 'No. Strings are immutable primitives. Methods like toUpperCase or replace return a new string; the original stays the same. Assigning str[0] = "x" has no effect.', level: 'Easy' },
    { q: 'What is the difference between slice and substring?', a: 'Both extract part of a string from start up to end (exclusive). slice accepts negative indexes (counting from the end), substring treats negatives as 0 and swaps arguments if start > end. slice is generally preferred.', level: 'Medium' },
    { q: 'What is the difference between replace and replaceAll?', a: 'replace with a string pattern replaces only the first occurrence; replaceAll replaces every occurrence. (replace with a global regex /x/g also replaces all, covered on Day 41.)', level: 'Easy' },
    { q: 'How do you check whether a string contains another string, ignoring case?', a: 'Lowercase both and use includes: text.toLowerCase().includes(search.toLowerCase()).', level: 'Easy' },
    { q: 'How do you reverse a string?', a: 'Split into an array of characters, reverse, and join: str.split("").reverse().join(""). For example "abc" becomes "cba".', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst s = "JavaScript";\nconsole.log(s.slice(4), s.slice(-6, -3), s.indexOf("a"), s.lastIndexOf("a"));', a: 'Script Scr 1 3. slice(4) starts at index 4 ("S"). slice(-6, -3) is indexes 4 to 6: "Scr". The first "a" is at 1, the last at 3.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nlet name = "asha";\nname.toUpperCase();\nconsole.log(name);\nname[0] = "A";\nconsole.log(name);', a: 'It prints:\nasha\nasha\nThe toUpperCase result was not saved, and assigning to an index does nothing because strings are immutable.', level: 'Medium' },
    { q: 'Output-based: what does this print?\nconst a = 5, b = 10;\nconsole.log(`Sum: ${a + b}`);\nconsole.log("Sum: ${a + b}");', a: 'It prints:\nSum: 15\nSum: ${a + b}\nInterpolation works only in backtick strings; in double quotes ${...} is plain text.', level: 'Easy' },
    { q: 'Output-based: what does this print?\nconsole.log("a-b-c".split("-"));\nconsole.log("hello".split(""));', a: 'It prints the arrays ["a", "b", "c"] and ["h", "e", "l", "l", "o"]. split with an empty string separates every character.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write code that checks whether a word is a palindrome (reads the same backwards), ignoring case. Test "Level" and "Hello".',
      hint: 'Lowercase it, then compare with its reversed version (split, reverse, join).',
      solution: `for (const word of ["Level", "Hello"]) {
  const w = word.toLowerCase();
  const reversed = w.split("").reverse().join("");
  console.log(word, w === reversed);
}
// Level true, Hello false`,
    },
    {
      task: 'Capitalise the first letter of a word: "javascript" becomes "Javascript".',
      hint: 'word[0].toUpperCase() + word.slice(1)',
      solution: `const word = "javascript";
const cap = word[0].toUpperCase() + word.slice(1);
console.log(cap); // Javascript`,
    },
    {
      task: 'Count how many times the letter "a" appears in "banana and apple" (case-insensitive).',
      hint: 'split("a").length - 1 is a quick trick; or loop over characters.',
      solution: `const text = "banana and apple";
const count = text.toLowerCase().split("a").length - 1;
console.log(count); // 5`,
    },
    {
      task: 'Given a file name "report.final.PDF", print the extension in lowercase and check whether it is a pdf.',
      hint: 'Use lastIndexOf(".") and slice.',
      solution: `const file = "report.final.PDF";
const ext = file.slice(file.lastIndexOf(".") + 1).toLowerCase();
console.log(ext, ext === "pdf"); // pdf true`,
    },
    {
      task: 'Using a template literal, print a 3-line product card: name, price with "Rs." and a stock line that says "In stock" or "Out of stock" based on a stock number.',
      hint: 'Use a ternary inside ${}.',
      solution: `const product = "Water Bottle";
const price = 299;
const stock = 0;
console.log(\`Product: \${product}
Price: Rs. \${price}
\${stock > 0 ? "In stock" : "Out of stock"}\`);`,
    },
  ],
  quiz: [
    { question: 'What does "Hello".length return?', options: ['4', '5', '6', 'undefined'], answer: 1, explanation: 'H-e-l-l-o is 5 characters.' },
    { question: 'Which syntax correctly interpolates a variable?', options: ['"Hi ${name}"', "'Hi ${name}'", '`Hi ${name}`', '(Hi ${name})'], answer: 2, explanation: 'Only backtick template literals interpolate ${}.' },
    { question: 'What does "abcdef".slice(-2) return?', options: ['"ef"', '"ab"', '"abcd"', '"f"'], answer: 0, explanation: 'Negative index counts from the end: last 2 characters.' },
    { question: 'What does "a,b,c".split(",") return?', options: ['"abc"', '["a,b,c"]', '"a b c"', '["a", "b", "c"]'], answer: 3, explanation: 'split turns a string into an array using the separator.' },
    { question: 'What does "Hi".indexOf("z") return?', options: ['0', 'null', '-1', 'undefined'], answer: 2, explanation: 'indexOf returns -1 when the text is not found.' },
  ],
};
