export default {
  id: 'day-02-html-document-structure',
  title: 'HTML Document Structure: <!DOCTYPE html>, <html>, <head>, <body>, <title>',
  module: 'Module 1: HTML Fundamentals',
  day: 2,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Every HTML page follows the same basic skeleton. Today you learn each part of that skeleton, what it does and why leaving parts out causes problems.',
  objectives: [
    'Write the complete HTML5 boilerplate from memory',
    'Explain the purpose of <!DOCTYPE html> and standards mode vs quirks mode',
    'Differentiate between the <head> and the <body>',
    'Use the lang attribute, charset meta tag and <title> correctly',
    'Visualise an HTML document as a tree of parent and child elements',
  ],
  theory: [
    {
      heading: 'The HTML5 boilerplate',
      content: "Every web page starts with the same skeleton (often called **boilerplate**). Think of it like the format of a formal letter: there is always a sender address, a date, a greeting and a body, in a fixed order.\n\nThe minimum, correct HTML5 page looks like the code below. Memorise it. In VS Code you can type `!` and press **Tab** (Emmet) to generate it instantly.",
      syntax: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Page Title</title>\n</head>\n<body>\n  <!-- visible content goes here -->\n</body>\n</html>',
      points: [
        '<!DOCTYPE html> - document type declaration',
        '<html> - root element that wraps everything',
        '<head> - information about the page (not shown on the page)',
        '<body> - everything the user actually sees',
      ],
    },
    {
      heading: '<!DOCTYPE html>',
      content: "The **doctype** is the very first line of the file. It is **not an HTML tag**; it is an instruction that tells the browser: \"this document is written in modern HTML (HTML5)\".\n\nWhy it matters: if the doctype is missing, browsers switch to **quirks mode**, an old compatibility mode that imitates bugs from 1990s browsers. Layout and CSS (for example the box model and table sizing) may then behave differently. With the doctype, browsers use **standards mode**.\n\nOlder versions had long doctypes, for example HTML 4.01: `<!DOCTYPE HTML PUBLIC \"-//W3C//DTD HTML 4.01//EN\" \"http://www.w3.org/TR/html4/strict.dtd\">`. HTML5 simplified it to just `<!DOCTYPE html>`. It is case-insensitive, but uppercase DOCTYPE is the convention.",
      tip: 'Common mistake: putting a comment or blank text before the doctype in old browsers, or forgetting it entirely. Always make it line 1.',
    },
    {
      heading: 'The <html> root element',
      content: "`<html>` is the **root element**: every other element lives inside it. It has exactly two children: `<head>` and `<body>`.\n\nAlways add the **lang** attribute, for example `<html lang=\"en\">` (English) or `<html lang=\"hi\">` (Hindi). It helps:\n- **Screen readers** pronounce words with the correct accent\n- **Search engines** know the page language\n- **Browsers** offer translation and choose correct hyphenation and fonts",
      syntax: '<html lang="en">\n  <head>...</head>\n  <body>...</body>\n</html>',
    },
    {
      heading: 'The <head> section',
      content: "The `<head>` holds **metadata**: data about the page that is not displayed as page content. Think of it as the label on a parcel: it describes what is inside, but it is not the contents.\n\nCommon things inside `<head>`:\n- `<meta charset=\"UTF-8\">`: the character encoding. UTF-8 supports almost every language and emoji. Put it near the top so text is read correctly.\n- `<meta name=\"viewport\" ...>`: makes the page scale correctly on mobile phones.\n- `<title>`: the page title (see next section).\n- `<link>`: connects external files such as CSS stylesheets and favicons.\n- `<style>`: internal CSS.\n- `<script>`: JavaScript (can also be placed in the body).\n\nMeta tags are covered in depth on Day 25, and CSS/JS integration on Days 28-29.",
      tip: 'Never put visible content like <h1> or <p> inside <head>. The browser will move it to the body automatically, which hides your mistake but produces invalid HTML.',
    },
    {
      heading: 'The <title> element',
      content: "`<title>` is **required** in every valid HTML document and must be inside `<head>`. Its text appears:\n- In the **browser tab**\n- As the **clickable headline in Google search results**\n- As the default name when a user **bookmarks** the page\n- Announced by **screen readers** when the page loads\n\nGood titles are short (around 50-60 characters), unique per page and descriptive, for example `Contact Us | Sunrise Bakery` rather than `Page 1`.",
      syntax: '<title>Contact Us | Sunrise Bakery</title>',
    },
    {
      heading: 'The <body> section and the document tree',
      content: "`<body>` contains **all visible content**: headings, paragraphs, images, links, forms, videos. There is only **one** body per page.\n\nHTML documents form a **tree** (like a family tree):\n- `<html>` is the **root** (grandparent)\n- `<head>` and `<body>` are its **children** and **siblings** of each other\n- `<title>` is a child of `<head>`; `<h1>` and `<p>` are children of `<body>`\n\nThe browser turns this tree into the **DOM**. Proper nesting and indentation make the tree easy to see in your code.",
      syntax: 'html\n├── head\n│   ├── meta\n│   └── title\n└── body\n    ├── h1\n    └── p',
    },
  ],
  examples: [
    {
      title: 'Complete HTML5 boilerplate',
      scenario: 'Create the starting file for a bakery website.',
      steps: [
        'Create index.html',
        'Type ! and press Tab in VS Code, or type the code manually',
        'Change the title and add an <h1> and <p> inside <body>',
        'Save and open in the browser / click Run',
      ],
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home | Sunrise Bakery</title>
</head>
<body>
  <h1>Sunrise Bakery</h1>
  <p>Fresh bread every morning since 1998.</p>
</body>
</html>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Home | Sunrise Bakery</title>
</head>
<body>
  <h1>Sunrise Bakery</h1>
  <p>Fresh bread every morning since 1998.</p>
</body>
</html>`,
      },
      result: 'A heading "Sunrise Bakery" and a paragraph. In a real browser tab the title "Home | Sunrise Bakery" appears.',
      explanation: 'The doctype enables standards mode, lang="en" declares English, charset UTF-8 ensures characters display correctly, the viewport meta makes it mobile-friendly, the title names the tab, and body holds the visible content.',
    },
    {
      title: 'Reading the head with JavaScript',
      scenario: 'Prove that <head> content exists even though it is invisible on the page.',
      steps: [
        'Use the boilerplate with a title and lang attribute',
        'Add a small script that reads document.title and the lang attribute',
        'Click Run and check the page and the console',
      ],
      code: `<head>
  <meta charset="UTF-8">
  <title>Invisible but real</title>
</head>
<body>
  <p id="out"></p>
  <script>
    console.log(document.title);
    console.log(document.documentElement.lang);
  </script>
</body>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invisible but real</title>
</head>
<body>
  <h1>The head is not displayed</h1>
  <p id="out"></p>
</body>
</html>`,
        js: `const out = document.getElementById('out');
out.textContent = 'Title: "' + document.title + '" | Language: ' + document.documentElement.lang + ' | Charset: ' + document.characterSet;
console.log('Title:', document.title);
console.log('Mode:', document.compatMode === 'CSS1Compat' ? 'Standards mode' : 'Quirks mode');`,
      },
      result: 'The paragraph shows the title, language "en" and charset "UTF-8". The console prints the title and "Standards mode".',
      explanation: 'The <title> never appears inside the page, but the browser stores it. document.compatMode returns "CSS1Compat" in standards mode (doctype present) and "BackCompat" in quirks mode.',
    },
    {
      title: 'Visualising the document tree',
      scenario: 'Understand parent, child and sibling relationships by printing the tree.',
      steps: [
        'Create a page with a head (meta, title) and body (h1, p, p)',
        'Use indentation to show nesting',
        'Run the script that walks the tree and prints it',
      ],
      code: `<html>
  <head>
    <meta charset="UTF-8">
    <title>Tree</title>
  </head>
  <body>
    <h1>Family Tree</h1>
    <p>First child paragraph</p>
    <p>Second child paragraph</p>
  </body>
</html>`,
      playground: {
        html: `<h1>Family Tree</h1>
<p>First child paragraph</p>
<p>Second child paragraph</p>
<pre id="tree" style="background:#f4f4f4;padding:10px"></pre>`,
        js: `function walk(el, depth) {
  let line = '  '.repeat(depth) + el.tagName.toLowerCase() + '\\n';
  for (const child of el.children) {
    if (child.id === 'tree' || child.tagName === 'SCRIPT') continue;
    line += walk(child, depth + 1);
  }
  return line;
}
const text = walk(document.documentElement, 0);
document.getElementById('tree').textContent = text;
console.log(text);`,
      },
      result: 'A grey box showing the indented tree: html > head > (meta, title...) and body > h1, p, p.',
      explanation: 'The browser always builds html, head and body even if you omit them, then nests your elements inside. Each indented level is a child of the line above it. This tree is the DOM.',
    },
    {
      title: 'Common mistake: content inside <head>',
      scenario: 'See what the browser does when you put a heading in the head.',
      steps: [
        'Place an <h1> inside <head> by mistake',
        'Click Run',
        'Use the script output to see where the browser actually put it',
      ],
      code: `<head>
  <title>Wrong</title>
  <h1>I should not be here</h1>   <!-- invalid -->
</head>
<body>
  <p>Body text</p>
</body>`,
      playground: {
        html: `<!DOCTYPE html>
<html lang="en">
<head>
  <title>Wrong</title>
  <h1>I should not be here</h1>
</head>
<body>
  <p>Body text</p>
  <p id="info" style="color:crimson"></p>
</body>
</html>`,
        js: `const h1 = document.querySelector('h1');
document.getElementById('info').textContent = 'The browser moved the <h1> into: <' + h1.parentElement.tagName.toLowerCase() + '>';
console.log('h1 parent is', h1.parentElement.tagName);`,
      },
      result: 'The heading is still shown, and the red text says it was moved into <body>.',
      explanation: 'When the parser sees a visible element in the head, it closes the head and starts the body automatically. The page looks fine, but the HTML is invalid and the head may end earlier than you expected, so meta tags after it could be treated wrongly.',
    },
  ],
  interview: [
    { q: 'What is the purpose of <!DOCTYPE html>?', a: 'It tells the browser the document uses HTML5 so it renders in standards mode. Without it, browsers fall back to quirks mode, which emulates old, non-standard behaviour.', level: 'Easy' },
    { q: 'Is <!DOCTYPE html> an HTML tag?', a: 'No. It is a document type declaration (an instruction to the browser), not an element. It has no closing tag and does not appear in the DOM as an element.', level: 'Medium' },
    { q: 'What is quirks mode?', a: 'A rendering mode used when the doctype is missing or old. The browser emulates bugs of old browsers (for example different box model and table behaviour) for backward compatibility. Standards mode follows the current specifications.', level: 'Medium' },
    { q: 'What is the difference between <head> and <body>?', a: '<head> contains metadata (title, charset, viewport, links to CSS, scripts) that is not displayed as page content. <body> contains all the visible content the user sees and interacts with.', level: 'Easy' },
    { q: 'Why should you use the lang attribute on <html>?', a: 'It declares the page language so screen readers use correct pronunciation, search engines index the language correctly and browsers can offer translation and proper hyphenation.', level: 'Easy' },
    { q: 'Is <title> mandatory?', a: 'Yes, a valid HTML document must have exactly one <title> inside <head>. It shows in the browser tab, bookmarks, search results and is read by screen readers.', level: 'Easy' },
    { q: 'What does <meta charset="UTF-8"> do and where should it go?', a: 'It declares the character encoding as UTF-8, which supports nearly all characters and emoji. It should be the first element in <head> (within the first 1024 bytes) so the browser decodes the rest correctly.', level: 'Medium' },
    { q: 'What happens if you omit <html>, <head> and <body> tags?', a: 'The page usually still works because the HTML parser creates these elements automatically (their tags are optional in the spec). But writing them explicitly is best practice for readability and to place lang and metadata correctly.', level: 'Hard' },
    { q: 'What is the root element of an HTML document?', a: 'The <html> element. All other elements are its descendants. In JavaScript it is available as document.documentElement.', level: 'Easy' },
    { q: 'Can a page have more than one <body>?', a: 'No. A document has exactly one <head> and one <body>. Extra body tags are ignored or merged by the parser.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write the full HTML5 boilerplate from memory for a page titled "My Resume" in English.',
      hint: 'Doctype, html with lang, head with charset, viewport, title, then body.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Resume</title>
</head>
<body>
  <h1>My Resume</h1>
</body>
</html>`,
    },
    {
      task: 'Create a page in Hindi: set the correct lang attribute and add a heading "नमस्ते दुनिया".',
      hint: 'The language code for Hindi is "hi". UTF-8 is needed to display Devanagari.',
      solution: `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>नमस्ते</title>
</head>
<body>
  <h1>नमस्ते दुनिया</h1>
</body>
</html>`,
    },
    {
      task: 'Find and fix the four mistakes in this code: <html><title>Shop</title><head></head><body><p>Hi</p></body></html>',
      hint: 'Missing doctype, missing lang, title is outside head, missing charset.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Shop</title>
</head>
<body>
  <p>Hi</p>
</body>
</html>`,
    },
    {
      task: 'Create three pages (index.html, about.html, contact.html) each with a unique, descriptive title in the format "Page | Site Name".',
      hint: 'Only the <title> and <h1> need to change between pages.',
      solution: `<!-- index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Home | Green Leaf Cafe</title>
</head>
<body><h1>Welcome to Green Leaf Cafe</h1></body>
</html>

<!-- about.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>About Us | Green Leaf Cafe</title>
</head>
<body><h1>About Us</h1></body>
</html>

<!-- contact.html -->
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Contact | Green Leaf Cafe</title>
</head>
<body><h1>Contact Us</h1></body>
</html>`,
    },
  ],
  quiz: [
    { question: 'What must be the very first line of an HTML5 document?', options: ['<html>', '<head>', '<!DOCTYPE html>', '<meta charset="UTF-8">'], answer: 2, explanation: 'The doctype comes first to trigger standards mode.' },
    { question: 'Where should the <title> element be placed?', options: ['Inside <head>', 'Inside <body>', 'Before <!DOCTYPE html>', 'After </html>'], answer: 0, explanation: '<title> is metadata and belongs in <head>.' },
    { question: 'What happens when the doctype is missing?', options: ['The page will not load', 'The browser uses quirks mode', 'All CSS is ignored', 'JavaScript stops working'], answer: 1, explanation: 'Browsers fall back to quirks mode, emulating old rendering behaviour.' },
    { question: 'Which attribute declares the page language?', options: ['language on <body>', 'charset on <meta>', 'type on <html>', 'lang on <html>'], answer: 3, explanation: '<html lang="en"> declares English.' },
    { question: 'Which element contains all visible page content?', options: ['<head>', '<body>', '<meta>', '<title>'], answer: 1, explanation: 'Everything shown on the page goes inside <body>.' },
  ],
};
