export default {
  id: 'day-27-html-best-practices',
  title: 'HTML Best Practices: Code Indentation, Clean Code, File Structure',
  module: 'Module 6: Professional HTML Development',
  day: 27,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "Professional HTML is not just HTML that works; it is HTML that a teammate can read, change and trust six months later. Today you learn consistent indentation, naming and formatting rules, clean-code habits, validation, and how to organise the files and folders of a real project.",
  objectives: [
    'Indent and format HTML consistently',
    'Follow clean-code rules: lowercase, quoted attributes, meaningful names, no inline styles',
    'Organise a project folder with clear file and folder naming',
    'Validate HTML and use tools like Prettier and the W3C validator',
  ],
  theory: [
    {
      heading: 'Why best practices matter',
      content: "Code is read far more often than it is written. Clean HTML:\n- is easier to **debug** (you can spot a missing closing tag)\n- is easier for **teams** to work on together\n- renders consistently in all browsers\n- is better for **SEO and accessibility**\n- makes CSS and JavaScript simpler\n\nAnalogy: a messy kitchen can still produce food, but a clean, labelled kitchen lets any chef walk in and cook quickly without mistakes.",
    },
    {
      heading: 'Indentation and formatting',
      content: "- Indent each **nested** element by **2 spaces** (most common; 4 is also fine). Pick one and never mix tabs and spaces.\n- One block element per line; short inline elements may stay on the same line.\n- Blank lines between major sections improve scanning.\n- Keep lines reasonably short (around 80–120 characters); break long attribute lists onto multiple lines.\n- Use a formatter like **Prettier** (VS Code: Format Document, Shift+Alt+F) so the whole team is consistent automatically.",
      syntax: `<!-- Bad -->
<ul><li><a href="/">Home</a></li><li><a href="/about">About</a>
</li></ul>

<!-- Good -->
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
</ul>`,
    },
    {
      heading: 'Clean code rules',
      content: "1. Always declare `<!DOCTYPE html>`, `<html lang>`, `<meta charset>` and viewport.\n2. Use **lowercase** tag and attribute names.\n3. Always **quote attribute values** with double quotes.\n4. **Close** all non-void elements; do not leave `<p>` or `<li>` open.\n5. Use **semantic elements** instead of div soup.\n6. Keep structure (HTML), style (CSS) and behaviour (JS) **separate**: no inline `style=` or `onclick=` in production code.\n7. Use meaningful, kebab-case class names describing purpose: `product-card`, `btn-primary`, not `red-box` or `div1`.\n8. IDs must be **unique** on the page.\n9. Always add `alt` to images, and `width`/`height` to prevent layout shift.\n10. Remove commented-out dead code and unused files before committing.\n11. Use `<button type=\"button\">` for non-submit buttons inside forms.",
      tip: 'Boolean attributes need no value: write required, not required="true". And never use <br><br><br> or &nbsp;&nbsp; for spacing: that is CSS work.',
    },
    {
      heading: 'Project file and folder structure',
      content: "A clean static website structure:",
      syntax: `my-website/
├── index.html          ← home page MUST be index.html
├── about.html
├── contact.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── images/
│   ├── logo.svg
│   └── hero-banner.webp
├── fonts/
└── README.md`,
      points: [
        'File names: lowercase, kebab-case, no spaces (about-us.html, not About Us.html). Servers on Linux are case-sensitive.',
        'Use relative paths: <link rel="stylesheet" href="css/style.css">',
        'Load CSS in <head>; load JS at the end of <body> or with defer',
        'Keep images optimised (WebP/AVIF, correct size) and named descriptively',
      ],
    },
    {
      heading: 'Validation and tooling',
      content: "- **W3C Markup Validator** (validator.w3.org): finds unclosed tags, duplicate IDs, invalid nesting.\n- **Browser DevTools**: Elements panel shows how the browser actually parsed your HTML.\n- **Lighthouse** (in Chrome DevTools): audits performance, accessibility, SEO and best practices.\n- **VS Code extensions**: Prettier (formatting), HTMLHint (linting), Live Server (auto reload).\n- **Emmet**: type `ul>li*3` and press Tab to generate markup quickly.\n- **Git**: version control so you can track and undo changes.",
      tip: 'Validate before you debug CSS: many "CSS bugs" are actually invalid HTML (e.g. a <div> inside a <p>).',
    },
  ],
  examples: [
    {
      title: 'Refactoring messy HTML into clean code',
      scenario: 'A product card was written quickly with uppercase tags, inline styles and unquoted attributes. Clean it up.',
      steps: [
        'Look at the messy version in the code block',
        'Convert tags to lowercase, quote attributes, indent by 2 spaces',
        'Move inline styles to a CSS class and use semantic elements',
        'Click Run to see the clean version working',
      ],
      code: `<!-- Messy -->
<DIV style="border:1px solid #ccc;padding:10px"><IMG src=shoe.jpg><B>Running Shoe</B><br><br>
<FONT color=green>₹2,499</FONT><div onclick="buy()">Buy</div></DIV>

<!-- Clean -->
<article class="product-card">
  <img src="shoe.jpg" alt="Blue running shoe" width="200" height="140">
  <h3 class="product-card__title">Running Shoe</h3>
  <p class="product-card__price">₹2,499</p>
  <button type="button" class="btn-primary">Buy now</button>
</article>`,
      playground: {
        html: `<article class="product-card">
  <img src="https://picsum.photos/id/21/200/140" alt="Pair of shoes on the floor" width="200" height="140">
  <h3 class="product-card__title">Running Shoe</h3>
  <p class="product-card__price">&#8377;2,499</p>
  <button type="button" class="btn-primary">Buy now</button>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.product-card { max-width: 220px; border: 1px solid #ccc; border-radius: 8px; padding: 10px; }
.product-card img { max-width: 100%; height: auto; border-radius: 6px; }
.product-card__title { margin: 8px 0 4px; }
.product-card__price { color: green; font-weight: 600; margin: 0 0 8px; }
.btn-primary { background: #2563eb; color: #fff; border: 0; padding: 8px 12px; border-radius: 6px; cursor: pointer; }`,
        js: `document.querySelector('.btn-primary').addEventListener('click', () => console.log('Added Running Shoe to cart'));`,
      },
      result: 'A tidy product card with image, heading, green price and a blue "Buy now" button that logs a message when clicked.',
      explanation: 'Same result, but now the markup is semantic (article, h3, button), accessible (alt, real button), styles live in CSS, behaviour in JS, and names describe purpose.',
    },
    {
      title: 'Mini HTML linter',
      scenario: 'Write a small script that detects common bad practices in the current page.',
      steps: [
        'Create a page with deliberate mistakes: duplicate id, image without alt, inline style, empty link',
        'Write JS checks for each problem',
        'Click Run and read the console report',
      ],
      code: `// duplicate IDs
const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
ids.filter((id, i) => ids.indexOf(id) !== i);`,
      playground: {
        html: `<h1 id="title">Store</h1>
<p id="title" style="color:red">Duplicate id and inline style!</p>
<img src="https://picsum.photos/id/30/120/80">
<a href="#"></a>
<button>Submit?</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `const report = [];
const ids = [...document.querySelectorAll('[id]')].map(e => e.id);
const dupes = [...new Set(ids.filter((id, i) => ids.indexOf(id) !== i))];
dupes.forEach(id => report.push('Duplicate id: #' + id));
document.querySelectorAll('img:not([alt])').forEach(() => report.push('Image without alt'));
document.querySelectorAll('img:not([width]), img:not([height])').forEach(() => report.push('Image without width/height (layout shift)'));
document.querySelectorAll('[style]').forEach(el => report.push('Inline style on <' + el.tagName.toLowerCase() + '>'));
document.querySelectorAll('a').forEach(a => { if (!a.textContent.trim() && !a.getAttribute('aria-label')) report.push('Empty link'); });
document.querySelectorAll('button:not([type])').forEach(() => report.push('Button without explicit type'));
console.log('Lint issues:', report.length);
report.forEach(r => console.log(' - ' + r));`,
      },
      result: 'Console lists: Duplicate id: #title, Image without alt, Image without width/height, Inline style on <p>, Empty link, Button without explicit type.',
      explanation: 'Real tools (HTMLHint, axe, the W3C validator) automate exactly these kinds of checks. Running them regularly keeps a codebase clean.',
    },
    {
      title: 'Well-structured page skeleton with linked assets',
      scenario: 'Show the standard head and body order for a multi-file project.',
      steps: [
        'Write the head: charset, viewport, title, description, then CSS link',
        'Write a semantic body with header, main, footer',
        'Load the script last with defer',
        'Click Run (the playground provides CSS/JS inline in place of the external files)',
      ],
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>About Us | GreenLeaf</title>
  <meta name="description" content="Meet the GreenLeaf team.">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/main.js" defer></script>
</head>
<body>
  <header class="site-header">...</header>
  <main>...</main>
  <footer class="site-footer">...</footer>
</body>
</html>`,
      playground: {
        html: `<header class="site-header">
  <a class="logo" href="#">GreenLeaf</a>
  <nav aria-label="Main">
    <ul class="nav-list">
      <li><a href="#">Home</a></li>
      <li><a href="#" aria-current="page">About</a></li>
    </ul>
  </nav>
</header>

<main class="page">
  <h1>About Us</h1>
  <p>We plant 10,000 trees every year.</p>
</main>

<footer class="site-footer">
  <p>&copy; 2026 GreenLeaf</p>
</footer>`,
        css: `/* css/style.css */
body { margin: 0; font-family: system-ui, sans-serif; }
.site-header { display: flex; justify-content: space-between; align-items: center; padding: 10px 16px; background: #166534; }
.site-header a { color: #fff; text-decoration: none; }
.nav-list { display: flex; gap: 12px; list-style: none; margin: 0; padding: 0; }
.page { padding: 16px; }
.site-footer { padding: 10px 16px; background: #f0fdf4; }`,
        js: `// js/main.js
console.log('Page title heading:', document.querySelector('h1').textContent);
console.log('Sections in order:', [...document.body.children].map(e => e.tagName.toLowerCase()).filter(t => t !== 'script').join(' > '));`,
      },
      result: 'A green header with logo and nav, an About Us main section and a light footer. Console: Sections in order: header > main > footer.',
      explanation: 'The HTML has a predictable order and indentation, blank lines separate sections, and CSS/JS are kept in their own files (simulated by the playground panels).',
    },
  ],
  interview: [
    { q: 'Name five HTML best practices.', a: 'Use the HTML5 doctype and lang; semantic elements; lowercase tags and quoted attributes; consistent indentation; alt text on images; separate CSS/JS from HTML; unique IDs; validate the markup.', level: 'Easy' },
    { q: 'Why avoid inline styles?', a: 'They mix presentation with structure, cannot be reused, are hard to override (high specificity) and make maintenance difficult. Use classes in external CSS.', level: 'Easy' },
    { q: 'Why must the home page be named index.html?', a: 'Web servers serve index.html by default when a directory URL (like example.com/) is requested.', level: 'Easy' },
    { q: 'Why use lowercase, hyphenated file names?', a: 'Many servers are case-sensitive (About.html ≠ about.html), spaces become %20 in URLs, and kebab-case is readable and SEO friendly.', level: 'Medium' },
    { q: 'Where should you place CSS and JavaScript references?', a: 'CSS <link> in <head> so the page renders styled. JS at the end of <body> or in <head> with defer so it does not block HTML parsing.', level: 'Medium' },
    { q: 'What is the W3C validator used for?', a: 'Checking HTML against the standard: unclosed or misnested tags, duplicate IDs, obsolete elements, invalid attributes.', level: 'Easy' },
    { q: 'Why add width and height to <img>?', a: 'The browser reserves space before the image loads, preventing Cumulative Layout Shift (CLS), a Core Web Vitals metric.', level: 'Medium' },
    { q: 'What is BEM naming?', a: 'Block__Element--Modifier convention for class names (e.g. card__title--large) that makes CSS structure explicit and avoids conflicts.', level: 'Medium' },
    { q: 'Why specify type="button" on buttons?', a: 'The default type inside a form is submit, so a plain <button> unexpectedly submits the form.', level: 'Medium' },
    { q: 'What tools help keep HTML clean in a team?', a: 'Prettier (formatting), HTMLHint/ESLint plugins (linting), EditorConfig (indent settings), W3C validator, Lighthouse, code reviews and Git.', level: 'Hard' },
  ],
  practice: [
    { task: 'Re-indent and clean: <BODY><DIV CLASS=box><H2>Hi</H2><P>Text<P>More</DIV></BODY>', hint: 'Lowercase, quotes, close <p>, 2-space indent.', solution: `<body>
  <div class="box">
    <h2>Hi</h2>
    <p>Text</p>
    <p>More</p>
  </div>
</body>` },
    { task: 'Design the folder structure for a restaurant site with home, menu and contact pages, one stylesheet, one script and images.', hint: 'index.html at the root.', solution: `restaurant/
├── index.html
├── menu.html
├── contact.html
├── css/style.css
├── js/main.js
└── images/
    ├── logo.svg
    └── paneer-tikka.webp` },
    { task: 'Replace inline style and onclick with a class and an event listener.', hint: 'Original: <p style="color:red" onclick="alert(1)">Warn</p>', solution: `<p class="warning" id="warn">Warn</p>
<style>.warning { color: red; }</style>
<script>
  document.getElementById('warn').addEventListener('click', () => alert(1));
</script>` },
    { task: 'Write the <head> of a page linking css/style.css and js/app.js correctly with defer.', hint: 'Relative paths.', solution: `<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard | MyApp</title>
  <link rel="stylesheet" href="css/style.css">
  <script src="js/app.js" defer></script>
</head>` },
  ],
  quiz: [
    { question: 'Which file name is best practice?', options: ['About Us.html', 'ABOUT.HTML', 'about-us.html', 'about_us page.html'], answer: 2, explanation: 'Lowercase kebab-case with no spaces.' },
    { question: 'Default file served for a folder URL is:', options: ['home.html', 'main.html', 'default.htm only', 'index.html'], answer: 3, explanation: 'Servers look for index.html by default.' },
    { question: 'Which is the cleanest markup?', options: ['<IMG SRC=a.jpg>', '<img src="a.jpg" alt="Sunset over sea">', '<img src=a.jpg alt=>', '<Img Src="a.jpg">'], answer: 1, explanation: 'Lowercase, quoted attributes, meaningful alt.' },
    { question: 'Where should a regular stylesheet <link> go?', options: ['Inside <head>', 'At the end of the body', 'Inside <footer>', 'After </html>'], answer: 0, explanation: 'Styles belong in head so the page renders styled.' },
    { question: 'Which tool checks HTML against the standard?', options: ['Photoshop', 'npm', 'W3C Markup Validator', 'Google Fonts'], answer: 2, explanation: 'validator.w3.org validates markup.' },
  ],
};
