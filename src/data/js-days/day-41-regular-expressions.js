const ex1 = `// Creating regex and the basic methods
const literal = /cat/i;                         // literal syntax, i = ignore case
const dynamic = new RegExp('dog', 'g');         // constructor: useful for variables

const text = 'The Cat sat. The dog barked at another dog.';

console.log('test:', literal.test(text));                    // true / false
console.log('search:', text.search(/sat/));                  // index or -1
console.log('match (no g):', text.match(/dog/).index);       // first match + details
console.log('match (g):', text.match(dynamic));              // all matches
console.log('replace first:', text.replace(/dog/, 'puppy'));
console.log('replaceAll:', text.replaceAll(/dog/g, 'puppy'));
console.log('split:', 'a, b;c  d'.split(/[,;\\s]+/));

// Building a regex from user input: escape special characters!
const userInput = 'C++';
const escaped = userInput.replace(/[.*+?^\${}()|[\\]\\\\]/g, '\\\\$&');
console.log('escaped pattern:', escaped, '->', new RegExp(escaped).test('I love C++'));`;

const ex2 = `// Character classes, quantifiers and anchors
const tests = [
  [/\\d+/,            'Order 4521 shipped',  'one or more digits'],
  [/^\\d{6}$/,        '411001',              'exactly 6 digits (PIN code)'],
  [/^\\d{6}$/,        '41100A',              'exactly 6 digits (fails)'],
  [/^[A-Z][a-z]+$/,  'Asha',                'capital then lowercase letters'],
  [/colou?r/,        'color and colour',    'u is optional (?)'],
  [/\\bcat\\b/,        'concatenate',         'whole word only (\\\\b)'],
  [/^\\s*$/,          '    ',                'blank / whitespace only'],
  [/[aeiou]{2,}/,    'beautiful',           '2+ vowels in a row'],
  [/[^0-9]/,         '12345',               'any NON-digit (fails)'],
];

tests.forEach(([re, str, meaning]) => {
  const m = str.match(re);
  console.log(String(re).padEnd(16), (re.test(str) ? 'MATCH ' : 'no    '), JSON.stringify(m ? m[0] : null).padEnd(8), '-', meaning);
});`;

const ex3 = `// Groups: capture parts of a match
const date = '2024-08-15';
const m = date.match(/(\\d{4})-(\\d{2})-(\\d{2})/);
console.log('full:', m[0], '| year:', m[1], '| month:', m[2], '| day:', m[3]);

// Named groups (?<name>...) are easier to read
const { groups } = date.match(/(?<year>\\d{4})-(?<month>\\d{2})-(?<day>\\d{2})/);
console.log('named:', groups.day + '/' + groups.month + '/' + groups.year);

// Use groups in replace with $1, $2 ...
console.log('swap names:', 'Sharma, Rahul'.replace(/(\\w+), (\\w+)/, '$2 $1'));

// matchAll + g flag: every match WITH its groups
const log = 'user=asha age=25 city=pune';
for (const match of log.matchAll(/(\\w+)=(\\w+)/g)) {
  console.log('  key:', match[1], 'value:', match[2]);
}

// Replace with a function for computed replacements
const prices = 'Pen 20, Book 350, Bag 900';
const withTax = prices.replace(/\\d+/g, (num) => Math.round(num * 1.18));
console.log('with tax:', withTax);

// Non-capturing group (?:...) and alternation |
console.log(/^(?:https?|ftp):\\/\\//.test('https://site.com'), /^(?:https?|ftp):\\/\\//.test('mailto:x'));`;

const ex4 = `// Real-world validators (simple, practical versions)
const patterns = {
  email: /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/,
  indianMobile: /^[6-9]\\d{9}$/,
  pinCode: /^[1-9]\\d{5}$/,
  // 8+ chars, at least one lowercase, uppercase, digit and special char (lookaheads)
  strongPassword: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[^A-Za-z0-9]).{8,}$/,
  username: /^[a-z0-9_]{3,16}$/,
  hexColor: /^#([0-9a-f]{3}|[0-9a-f]{6})$/i,
};

const samples = {
  email: ['asha@gmail.com', 'asha@gmail', 'a b@x.com'],
  indianMobile: ['9876543210', '1234567890', '98765'],
  pinCode: ['411001', '011001'],
  strongPassword: ['Pass@1234', 'password', 'Passw0rd'],
  username: ['asha_25', 'A$', 'ok'],
  hexColor: ['#fff', '#1E88E5', '#12345'],
};

for (const [name, values] of Object.entries(samples)) {
  const results = values.map((v) => v + ' ' + (patterns[name].test(v) ? 'OK' : 'X'));
  console.log(name.padEnd(15), results.join(' | '));
}`;

const ex5html = `<form id="signup" novalidate>
  <label>Email <input id="email" placeholder="you@example.com"></label>
  <small id="email-msg"></small>
  <label>Mobile <input id="mobile" placeholder="10-digit mobile"></label>
  <small id="mobile-msg"></small>
  <label>Password <input id="password" type="password" placeholder="Strong password"></label>
  <ul id="rules">
    <li data-rule="len">At least 8 characters</li>
    <li data-rule="lower">A lowercase letter</li>
    <li data-rule="upper">An uppercase letter</li>
    <li data-rule="digit">A number</li>
    <li data-rule="special">A special character</li>
  </ul>
  <button>Create account</button>
  <p id="result"></p>
</form>`;

const ex5css = `form { font-family: system-ui, sans-serif; display: grid; gap: 6px; max-width: 320px; }
label { display: grid; gap: 4px; font-weight: 600; }
input { padding: 8px; font-size: 15px; border: 2px solid #ccc; border-radius: 6px; }
input.valid { border-color: #2e7d32; }
input.invalid { border-color: #c62828; }
small { color: #c62828; min-height: 1em; }
#rules { margin: 0; padding-left: 18px; color: #999; font-size: 14px; }
#rules li.pass { color: #2e7d32; }
#rules li.pass::marker { content: '\\2713  '; }
button { padding: 10px; font-size: 15px; }`;

const ex5js = `const rules = {
  len: /.{8,}/,
  lower: /[a-z]/,
  upper: /[A-Z]/,
  digit: /\\d/,
  special: /[^A-Za-z0-9]/,
};
const emailRe = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/;
const mobileRe = /^[6-9]\\d{9}$/;

function check(input, re, msgEl, message) {
  const ok = re.test(input.value.trim());
  input.classList.toggle('valid', ok);
  input.classList.toggle('invalid', !ok && input.value !== '');
  msgEl.textContent = ok || input.value === '' ? '' : message;
  return ok;
}

const email = document.querySelector('#email');
const mobile = document.querySelector('#mobile');
const password = document.querySelector('#password');

email.addEventListener('input', () =>
  check(email, emailRe, document.querySelector('#email-msg'), 'Enter a valid email'));
mobile.addEventListener('input', () =>
  check(mobile, mobileRe, document.querySelector('#mobile-msg'), '10 digits, starting with 6-9'));

function checkPassword() {
  let passed = 0;
  document.querySelectorAll('#rules li').forEach((li) => {
    const ok = rules[li.dataset.rule].test(password.value);
    li.classList.toggle('pass', ok);
    if (ok) passed++;
  });
  return passed === Object.keys(rules).length;
}
password.addEventListener('input', checkPassword);

document.querySelector('#signup').addEventListener('submit', (e) => {
  e.preventDefault();
  const ok = emailRe.test(email.value.trim()) && mobileRe.test(mobile.value.trim()) && checkPassword();
  document.querySelector('#result').textContent = ok ? 'Account created!' : 'Please fix the errors above.';
});`;

export default {
  id: 'day-41-regular-expressions',
  title: 'Regular Expressions Basics',
  module: 'Module 6: Advanced JavaScript',
  day: 41,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Regular expressions (regex) are patterns for finding, validating and replacing text. You will learn the core syntax – character classes, quantifiers, anchors, groups and flags – and use it for real tasks like validating emails, mobile numbers and passwords.',
  objectives: [
    'Create regex with literal and RegExp constructor syntax and use flags g, i, m',
    'Use test, match, matchAll, replace, replaceAll, search and split',
    'Write patterns with character classes, quantifiers and anchors',
    'Extract data with capturing and named groups',
    'Build practical validators for forms (email, phone, password)',
  ],
  theory: [
    {
      heading: 'What is a Regular Expression?',
      content:
        'A **regular expression** is a **pattern** that describes text. Instead of searching for one exact word, you describe its **shape**: "6 digits", "starts with a capital letter", "something@something.something".\n\nAnalogy: `Ctrl+F` finds exact words; regex is `Ctrl+F` with superpowers – like asking "find every phone number" without knowing the numbers.\n\nCreate a regex in two ways:\n- **Literal**: `/pattern/flags` – use when the pattern is fixed\n- **Constructor**: `new RegExp("pattern", "flags")` – use when building the pattern from a variable (remember to double the backslashes in the string: `"\\\\d"`)\n\n**Flags**:\n- `g` – global: find **all** matches, not just the first\n- `i` – case-**i**nsensitive\n- `m` – multiline: `^` and `$` match at each line\n- `s` – dot also matches newlines; `u` – full Unicode; `y` – sticky',
    },
    {
      heading: 'Regex Methods',
      content:
        'On the **regex**:\n- `re.test(str)` → `true`/`false` – perfect for validation\n- `re.exec(str)` → match details or `null` (step through matches with g)\n\nOn the **string**:\n- `str.match(re)` → without g: first match with groups and index; with g: array of all matched strings; `null` if none\n- `str.matchAll(re)` → iterator of every match **with groups** (needs g)\n- `str.replace(re, replacement)` / `replaceAll(re, ...)` → new string; replacement can be a string with `$1`, `$<name>`, `$&` or a **function**\n- `str.search(re)` → index of first match or -1\n- `str.split(re)` → split by a pattern',
      tip: 'A regex with the g flag remembers lastIndex between test() calls, so reusing one global regex for validation can give alternating true/false. Do not use g for test()-based validation.',
    },
    {
      heading: 'Character Classes and Special Characters',
      content:
        '- `.` – any character except newline\n- `\\d` digit [0-9], `\\D` non-digit\n- `\\w` word char [A-Za-z0-9_], `\\W` non-word\n- `\\s` whitespace (space, tab, newline), `\\S` non-whitespace\n- `[abc]` – one of a, b, c; `[a-z]` – a range; `[A-Za-z0-9]` – combined\n- `[^abc]` – any character **except** a, b, c\n- **Escaping**: special characters `. * + ? ^ $ { } ( ) | [ ] \\ /` must be escaped with `\\` to match them literally: `\\.` matches a real dot',
      syntax: `/\\d\\d:\\d\\d/      // 10:45
/[aeiou]/        // any vowel
/[^0-9]/         // any non-digit
/3\\.14/          // the literal text 3.14`,
    },
    {
      heading: 'Quantifiers and Anchors',
      content:
        '**Quantifiers** say how many times the previous item repeats:\n- `*` – 0 or more\n- `+` – 1 or more\n- `?` – 0 or 1 (optional)\n- `{n}` – exactly n; `{n,}` – n or more; `{n,m}` – between n and m\n\nQuantifiers are **greedy** (match as much as possible). Add `?` to make them **lazy**: `<.+?>` stops at the first `>`.\n\n**Anchors** match positions, not characters:\n- `^` – start of string, `$` – end of string\n- `\\b` – word boundary\n\nFor validation always use `^...$`, otherwise `/\\d{6}/` would also accept "abc1234567xyz".',
      tip: 'Most common validation bug: forgetting ^ and $. /\\d{10}/.test("phone 98765432101234") is true!',
    },
    {
      heading: 'Groups, Alternation and Lookaheads',
      content:
        '- `( )` – **capturing group**: groups items and remembers the matched part → `match[1]`, `$1`\n- `(?<name> )` – **named group** → `match.groups.name`, `$<name>`\n- `(?: )` – **non-capturing group**: groups without remembering\n- `a|b` – **alternation**: a OR b (`/^(jpg|png|gif)$/`)\n- `(?=...)` – **positive lookahead**: "followed by", without consuming characters. Used for password rules: `(?=.*\\d)` = "somewhere ahead there is a digit"\n- `(?!...)` – negative lookahead: "not followed by"',
    },
    {
      heading: 'Practical Advice',
      content:
        '- Keep validation regex **simple and readable**. A perfect email regex is huge; a simple one plus a confirmation email is better.\n- Combine regex with HTML attributes: `<input pattern="[0-9]{6}">` (Day 15 of HTML) uses the same syntax.\n- Test patterns at regex101.com, which explains every part.\n- Escape user input before building a `new RegExp` from it.\n- Very complex nested quantifiers like `(a+)+` can freeze the page on some inputs ("catastrophic backtracking").',
      tip: 'Coming next (Day 42): iterators, generators and symbols – the machinery behind for...of and matchAll.',
    },
  ],
  examples: [
    {
      title: 'Creating regex and using the main methods',
      scenario: 'Search, count, replace and split text with regex.',
      steps: [
        'Create one regex with the literal syntax and one with new RegExp',
        'Try test, search, match (with and without g), replace, replaceAll and split',
        'Escape user input before using it in new RegExp',
        'Click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        "test: true\nsearch: 8\nmatch (no g): 17\nmatch (g): [ 'dog', 'dog' ]\nreplace first: The Cat sat. The puppy barked at another dog.\nreplaceAll: The Cat sat. The puppy barked at another puppy.\nsplit: [ 'a', 'b', 'c', 'd' ]\nescaped pattern: C\\+\\+ -> true",
      explanation:
        '/cat/i matches "Cat" because of the i flag. Without g, match returns details of the first match (index 17). With g it returns all matched strings. replace without g changes only the first match. In "C++" the + signs are special, so we escape them before building the RegExp.',
    },
    {
      title: 'Character classes, quantifiers and anchors',
      scenario: 'A table of small patterns showing what each part means.',
      steps: [
        'Create an array of [regex, text, meaning]',
        'For each, print whether it matches and what was matched',
        'Change the texts and observe, click Run',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        '/\\d+/            MATCH  "4521"   - one or more digits\n/^\\d{6}$/        MATCH  "411001" - exactly 6 digits (PIN code)\n/^\\d{6}$/        no     null     - exactly 6 digits (fails)\n/^[A-Z][a-z]+$/  MATCH  "Asha"   - capital then lowercase letters\n/colou?r/        MATCH  "color"  - u is optional (?)\n/\\bcat\\b/        no     null     - whole word only (\\b)\n/^\\s*$/          MATCH  "    "   - blank / whitespace only\n/[aeiou]{2,}/    MATCH  "eau"    - 2+ vowels in a row\n/[^0-9]/         no     null     - any NON-digit (fails)',
      explanation:
        '^ and $ force the whole string to match. \\b requires a word boundary, so "cat" inside "concatenate" is rejected. {2,} is greedy and grabs "eau". [^0-9] needs at least one non-digit character.',
    },
    {
      title: 'Capturing groups, named groups and replace',
      scenario: 'Extract date parts, swap names, parse key=value pairs and add tax to prices.',
      steps: [
        'Capture year, month, day with ( ) and then with (?<name> )',
        'Swap "Last, First" using $2 $1',
        'Loop over key=value pairs with matchAll',
        'Replace numbers using a function, click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        'full: 2024-08-15 | year: 2024 | month: 08 | day: 15\nnamed: 15/08/2024\nswap names: Rahul Sharma\n  key: user value: asha\n  key: age value: 25\n  key: city value: pune\nwith tax: Pen 24, Book 413, Bag 1062\ntrue false',
      explanation:
        'Each ( ) group is numbered left to right. Named groups make code self-documenting. matchAll gives full match objects for every match. A replacement function receives the matched text and returns the new text.',
    },
    {
      title: 'Real-world validators',
      scenario: 'Validate emails, Indian mobile numbers, PIN codes, strong passwords, usernames and hex colours.',
      steps: [
        'Store one regex per field in an object',
        'Use ^ and $ in every pattern',
        'Use lookaheads for password rules',
        'Test good and bad samples, click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'email           asha@gmail.com OK | asha@gmail X | a b@x.com X\nindianMobile    9876543210 OK | 1234567890 X | 98765 X\npinCode         411001 OK | 011001 X\nstrongPassword  Pass@1234 OK | password X | Passw0rd X\nusername        asha_25 OK | A$ X | ok X\nhexColor        #fff OK | #1E88E5 OK | #12345 X',
      explanation:
        'Mobile numbers must start with 6-9 and have exactly 10 digits. Passw0rd fails only because it has no special character – each (?=.*...) lookahead checks one rule independently. "ok" fails the {3,16} length rule.',
    },
    {
      title: 'Live sign-up form validation',
      scenario: 'Validate fields as the user types and show a password checklist.',
      steps: [
        'Create the form with email, mobile and password fields and a rules list',
        'Store one small regex per password rule',
        'On input, test each regex and toggle CSS classes',
        'On submit, block the form unless everything passes',
      ],
      code: ex5js,
      playground: { html: ex5html, css: ex5css, js: ex5js },
      result:
        'Typing an invalid email shows a red border and "Enter a valid email"; a valid one turns green. Each password rule turns green with a tick as it is satisfied (e.g. "Pass@1234" passes all five). Submitting with errors shows "Please fix the errors above.", otherwise "Account created!".',
      explanation:
        'Splitting the password into five small regexes gives friendlier feedback than one big lookahead pattern. The same test() call powers both live feedback and the final submit check.',
    },
  ],
  interview: [
    {
      q: 'What is a regular expression?',
      a: 'A pattern used to match character combinations in strings, used for validation, searching, extracting and replacing text. In JS it is a RegExp object.',
      level: 'Easy',
    },
    {
      q: 'Two ways to create a regex in JavaScript?',
      a: 'Literal: /ab+c/i (compiled once, best for fixed patterns). Constructor: new RegExp("ab+c", "i") (for dynamic patterns built from strings; backslashes must be doubled).',
      level: 'Easy',
    },
    {
      q: 'What do the g, i and m flags do?',
      a: 'g = find all matches (global), i = case-insensitive, m = multiline (^ and $ match at line breaks).',
      level: 'Easy',
    },
    {
      q: 'Difference between test() and match()?',
      a: 'regex.test(str) returns a boolean. str.match(regex) returns match data (array with groups and index, or all matches with g) or null.',
      level: 'Easy',
    },
    {
      q: 'Why should validation patterns use ^ and $?',
      a: 'Without anchors the regex can match a substring anywhere, so invalid input that merely contains a valid part would pass. ^...$ forces the whole string to match.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between greedy and lazy quantifiers?',
      a: 'Greedy (*, +, {n,}) match as much as possible; lazy (*?, +?) match as little as possible. "<b>x</b>".match(/<.+>/)[0] is the whole string, while /<.+?>/ gives "<b>".',
      level: 'Medium',
    },
    {
      q: 'What are capturing groups and named groups?',
      a: 'Parentheses ( ) capture the matched part for later use (match[1], $1). Named groups (?<year>\\d{4}) are accessed via match.groups.year or $<year>. (?: ) groups without capturing.',
      level: 'Medium',
    },
    {
      q: 'What is a lookahead? Give a use case.',
      a: '(?=X) asserts that X follows the current position without consuming characters. Used for password rules: /^(?=.*[A-Z])(?=.*\\d).{8,}$/ requires an uppercase letter and a digit anywhere.',
      level: 'Hard',
    },
    {
      q: 'Why can a global regex give inconsistent test() results?',
      a: 'With g (or y), the regex stores lastIndex after a match and the next test() continues from there, so calling test repeatedly on the same string can alternate true/false. Avoid g for validation or reset lastIndex = 0.',
      level: 'Hard',
    },
    {
      q: 'Write a regex for a 10-digit Indian mobile number starting with 6-9.',
      a: '/^[6-9]\\d{9}$/',
      level: 'Easy',
    },
    {
      q: 'How do you replace all occurrences of a word in a string?',
      a: 'str.replace(/word/g, "new") or str.replaceAll("word", "new"). replaceAll with a regex requires the g flag.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Write a function countVowels(str) using a regex.',
      hint: 'match(/[aeiou]/gi) returns null when there are none.',
      solution: `function countVowels(str) {
  return (str.match(/[aeiou]/gi) || []).length;
}
console.log(countVowels('JavaScript Regex')); // 5`,
    },
    {
      task: 'Extract all hashtags from a tweet: "Learning #JavaScript and #regex today #100DaysOfCode".',
      hint: '/#\\w+/g',
      solution: `const tweet = 'Learning #JavaScript and #regex today #100DaysOfCode';
console.log(tweet.match(/#\\w+/g)); // [ '#JavaScript', '#regex', '#100DaysOfCode' ]`,
    },
    {
      task: 'Convert dates from DD/MM/YYYY to YYYY-MM-DD in a whole paragraph of text.',
      hint: 'Capture three groups and reorder with $3-$2-$1.',
      solution: `const text = 'Joined on 15/08/2023, renewed 01/01/2024.';
const iso = text.replace(/(\\d{2})\\/(\\d{2})\\/(\\d{4})/g, '$3-$2-$1');
console.log(iso); // Joined on 2023-08-15, renewed 2024-01-01.`,
    },
    {
      task: 'Write toCamelCase("hello-world_from js") → "helloWorldFromJs" using replace with a function.',
      hint: 'Match a separator followed by a letter: /[-_\\s]+(\\w)/g',
      solution: `function toCamelCase(str) {
  return str.toLowerCase().replace(/[-_\\s]+(\\w)/g, (_, ch) => ch.toUpperCase());
}
console.log(toCamelCase('hello-world_from js')); // helloWorldFromJs`,
    },
    {
      task: 'Mask all but the last 4 digits of a card number "4111 1111 1111 1234" → "**** **** **** 1234".',
      hint: 'Replace digits that are followed by at least 4 more digits (lookahead), ignoring spaces.',
      solution: `const card = '4111 1111 1111 1234';
const masked = card.replace(/\\d(?=(?:\\s?\\d){4})/g, '*');
console.log(masked); // **** **** **** 1234`,
    },
  ],
  quiz: [
    {
      question: 'What does \\d match?',
      options: ['Any letter', 'A digit 0-9', 'A dot', 'Whitespace'],
      answer: 1,
      explanation: '\\d is shorthand for [0-9].',
    },
    {
      question: 'Which quantifier means "zero or one"?',
      options: ['*', '+', '{2}', '?'],
      answer: 3,
      explanation: '? makes the previous item optional.',
    },
    {
      question: 'What does /^\\d{4}$/.test("12345") return?',
      options: ['false', 'true', 'null', '"1234"'],
      answer: 0,
      explanation: 'Anchors require exactly four digits for the whole string.',
    },
    {
      question: 'Which flag makes a regex case-insensitive?',
      options: ['g', 'm', 'i', 's'],
      answer: 2,
      explanation: 'i = ignore case.',
    },
    {
      question: 'In "Sharma, Rahul".replace(/(\\w+), (\\w+)/, "$2 $1"), what is $2?',
      options: ['Sharma', 'Rahul', ', ', 'The whole match'],
      answer: 1,
      explanation: '$2 is the second capturing group.',
    },
  ],
};
