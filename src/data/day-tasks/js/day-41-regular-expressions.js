export default {
  lesson: 'day-41-regular-expressions',
  minutes: 35,
  intro: 'Write regex patterns with classes, quantifiers, anchors and groups, and build practical validators and extractors.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does the pattern `/^\\d{6}$/` match?',
      options: ['Any text containing 6 digits somewhere', 'A string that is exactly 6 digits, like an Indian PIN code', 'Up to 6 digits', '6 or more letters'],
      answer: 1,
      explain: '`\\d` is a digit, `{6}` means exactly six, and the anchors `^` (start) and `$` (end) make the **whole** string match. Without anchors, "abc123456xyz" would also pass.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `const text = "Call 98765 43210 or 91234 56789";
console.log(/\\d+/.test(text));
console.log(text.match(/\\d+/g).length);
console.log("a-b_c d".split(/[-_ ]/).join("|"));
console.log("Hello".replace(/l/g, "L"));
console.log(/java/i.test("JAVASCRIPT"));`,
      expected: 'true\n4\na|b|c|d\nHeLLo\ntrue',
      explain: '`test` returns true/false. With the `g` flag, `match` returns **all** matches (4 digit groups). A character class `[-_ ]` matches any one of those characters. The `i` flag ignores case.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 5,
      q: 'Write `isValidMobile(text)` that returns true for a 10-digit Indian mobile number starting with **6, 7, 8 or 9** (no spaces, no +91). Use a regex with anchors.',
      example: { title: 'character class + quantifier', code: '/^[A-Z]{3}$/.test("ABC"); // true: exactly 3 capitals' },
      starter: 'function isValidMobile(text) {\n  // TODO\n}',
      solution: 'function isValidMobile(text) {\n  return /^[6-9]\\d{9}$/.test(text);\n}',
      tests: [
        { call: 'isValidMobile("9876543210")', expect: true },
        { call: 'isValidMobile("6123456789")', expect: true },
        { call: 'isValidMobile("5876543210")', expect: false, msg: 'Cannot start with 5' },
        { call: 'isValidMobile("98765")', expect: false },
        { call: 'isValidMobile("98765432101")', expect: false, msg: '11 digits is too long' },
        { call: 'isValidMobile("98765abcde")', expect: false },
      ],
      explain: '`[6-9]` is one digit from 6 to 9, followed by exactly nine more digits `\\d{9}`. Forgetting `^...$` lets longer strings that merely **contain** a valid number pass.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Password strength with **lookaheads**. Write `isStrong(pw)` that returns true only if the password has at least 8 characters, at least one uppercase letter, one lowercase letter and one digit.',
      example: { title: 'lookahead = "must contain"', code: '/^(?=.*\\d).{4,}$/.test("ab12"); // has a digit and 4+ chars' },
      starter: 'function isStrong(pw) {\n  // TODO\n}',
      solution: 'function isStrong(pw) {\n  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$/.test(pw);\n}',
      tests: [
        { call: 'isStrong("Upskillr2025")', expect: true },
        { call: 'isStrong("upskillr2025")', expect: false, msg: 'No uppercase' },
        { call: 'isStrong("UPSKILLR2025")', expect: false, msg: 'No lowercase' },
        { call: 'isStrong("Upskillr")', expect: false, msg: 'No digit' },
        { call: 'isStrong("Up1")', expect: false, msg: 'Too short' },
      ],
      explain: 'Each `(?=.*X)` checks "somewhere ahead there is X" without consuming characters, so several rules can be combined in one pattern. Then `.{8,}` enforces the length. Splitting into separate simple tests is equally fine and often more readable.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Named groups. Dates arrive as `"2025-08-15"`. Write `toIndianDate(iso)` that uses a regex with **named groups** `year`, `month`, `day` and returns `"15/08/2025"`. Return `null` if the input does not match `YYYY-MM-DD`.',
      example: { title: 'named groups', code: 'const m = "Asha-21".match(/^(?<name>\\w+)-(?<age>\\d+)$/);\nm.groups.name; // "Asha"' },
      starter: 'function toIndianDate(iso) {\n  // TODO\n}',
      solution: 'function toIndianDate(iso) {\n  const m = iso.match(/^(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})$/);\n  if (!m) return null;\n  const { year, month, day } = m.groups;\n  return `${day}/${month}/${year}`;\n}',
      tests: [
        { call: 'toIndianDate("2025-08-15")', expect: '15/08/2025' },
        { call: 'toIndianDate("1947-01-26")', expect: '26/01/1947' },
        { call: 'toIndianDate("15-08-2025")', expect: null },
      ],
      explain: '`(?<name>...)` captures a part and makes it available as `match.groups.name`. `match` returns `null` when there is no match, so check it before reading `.groups`. The same can be done with `replace(regex, "$<day>/$<month>/$<year>")`.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Extract data. Write `extractHashtags(post)` that returns an array of all hashtags (without the `#`) in lowercase, using `matchAll` with a capturing group (or `match` with `g`).\n\n`"Loving #JavaScript and #React at #UpSkillr!"` → `["javascript", "react", "upskillr"]`',
      example: { title: 'matchAll with groups', code: 'for (const m of "a1 b2".matchAll(/([a-z])(\\d)/g)) {\n  console.log(m[1], m[2]);\n}' },
      starter: 'function extractHashtags(post) {\n  // TODO\n}',
      solution: 'function extractHashtags(post) {\n  return [...post.matchAll(/#(\\w+)/g)].map((m) => m[1].toLowerCase());\n}',
      tests: [
        { call: 'extractHashtags("Loving #JavaScript and #React at #UpSkillr!")', expect: ['javascript', 'react', 'upskillr'] },
        { call: 'extractHashtags("No tags here")', expect: [] },
      ],
      explain: '`\\w+` matches letters, digits and underscore, so the tag stops at spaces and "!". `matchAll` needs the `g` flag and gives every match with its groups; `m[1]` is the text inside the parentheses (without `#`).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the regex that matches one or more **whitespace** characters so that `"  too   many  spaces ".trim().replace(/____/g, " ")` gives `"too many spaces"`.',
      accept: ['\\s+', '\\s{1,}', ' +', '\\s\\s*'],
      explain: '`\\s` matches any whitespace (space, tab, newline) and `+` means one or more. With the `g` flag every run of spaces is replaced by a single space.',
    },
  ],
};
