export default {
  id: 'day-28-html-with-css-integration',
  title: 'HTML with CSS Integration: External CSS, Internal CSS, Inline CSS',
  module: 'Module 6: Professional HTML Development',
  day: 28,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: "HTML builds the structure; CSS (Cascading Style Sheets) makes it look good. There are three ways to connect CSS to HTML: inline style attributes, an internal <style> block, and an external .css file linked with <link>. Today you learn each one, when to use it, and which one wins when they conflict.",
  objectives: [
    'Add CSS with the style attribute, the <style> element, and <link rel="stylesheet">',
    'Explain the pros and cons of each method',
    'Predict which style wins using the cascade order (inline > internal/external by order) and specificity basics',
    'Connect HTML to CSS using element, class and id selectors',
  ],
  theory: [
    {
      heading: 'Why separate HTML and CSS?',
      content: "Think of a house: **HTML is the walls and rooms** (structure), **CSS is the paint, furniture and decoration** (presentation), and JavaScript (tomorrow) is the **electricity** (behaviour).\n\nKeeping them separate means you can repaint the whole house (redesign the site) without rebuilding walls. One CSS file can style hundreds of HTML pages.\n\nA CSS rule has a **selector** and a **declaration block**:",
      syntax: `selector {
  property: value;
  property: value;
}

/* example */
h1 { color: navy; font-size: 32px; }`,
    },
    {
      heading: '1. Inline CSS',
      content: "Written directly on an element with the `style` attribute.\n\n**Pros**: quick to test, highest priority, useful for values set by JavaScript (e.g. `element.style.width`) or HTML emails.\n**Cons**: cannot be reused, mixes style with structure, hard to maintain, cannot use `:hover` or media queries.",
      syntax: `<p style="color: crimson; font-weight: bold;">Inline styled text</p>`,
    },
    {
      heading: '2. Internal CSS',
      content: "Written inside a `<style>` element, normally in the `<head>`. It applies to the whole **current page only**.\n\n**Pros**: no extra file to download, good for single-page demos or page-specific styles, supports all selectors and media queries.\n**Cons**: not shared across pages; duplicated if you copy it to every page.",
      syntax: `<head>
  <style>
    body { font-family: Arial, sans-serif; }
    .highlight { background: yellow; }
  </style>
</head>`,
    },
    {
      heading: '3. External CSS (recommended)',
      content: "Styles live in a separate `.css` file connected with `<link>` in the `<head>`.\n\n**Pros**: one file styles the whole website, browser **caches** it (faster next pages), clean separation, team-friendly.\n**Cons**: one extra HTTP request (negligible), and if the path is wrong nothing gets styled.",
      syntax: `<!-- index.html -->
<head>
  <link rel="stylesheet" href="css/style.css">
</head>

/* css/style.css  (no <style> tags inside a .css file!) */
body { margin: 0; font-family: system-ui, sans-serif; }`,
      tip: 'Common mistakes: writing <style> tags inside the .css file, a wrong relative path (style.css vs css/style.css), or forgetting rel="stylesheet". Check the Network tab in DevTools for a 404.',
    },
    {
      heading: 'Which style wins? The cascade (basics)',
      content: "When several rules target the same element and property:\n\n1. **Inline** styles beat stylesheet rules (except `!important`).\n2. Between internal and external, there is **no fixed winner**: the one that comes **later** in the document wins if specificity is equal.\n3. More **specific** selectors win: id (`#title`) > class (`.title`) > element (`h1`).\n4. `!important` overrides normal rules (use rarely).\n\nThe word **Cascading** means styles flow down and the browser resolves conflicts by origin, specificity and order. (Full specificity is covered in the CSS course.)",
      points: [
        'Selectors connect CSS to HTML: element (p), class (.card → class="card"), id (#logo → id="logo")',
        'One element can have many classes: class="btn btn-primary"',
        'Also possible: @import url("other.css"); inside CSS, but it is slower than multiple <link> tags',
      ],
    },
  ],
  examples: [
    {
      title: 'All three methods on one page',
      scenario: 'Style three paragraphs using inline, internal and "external" CSS.',
      steps: [
        'Create index.html and css/style.css (in the playground, the CSS panel acts as the external file)',
        'Add an inline style on the first paragraph',
        'Add a <style> block in the HTML for the second',
        'Put the rule for the third in the CSS panel',
        'Click Run',
      ],
      code: `<p style="color: crimson;">1. Inline CSS</p>
<style> .internal { color: green; } </style>
<p class="internal">2. Internal CSS</p>
<p class="external">3. External CSS</p>

/* style.css */
.external { color: royalblue; }`,
      playground: {
        html: `<style>
  .internal { color: green; font-style: italic; }
</style>
<p style="color: crimson; font-weight: bold;">1. Inline CSS (style attribute)</p>
<p class="internal">2. Internal CSS (&lt;style&gt; block)</p>
<p class="external">3. External CSS (linked .css file)</p>`,
        css: `/* Acts like css/style.css */
body { font-family: system-ui, sans-serif; padding: 12px; }
.external { color: royalblue; text-decoration: underline; }`,
        js: `document.querySelectorAll('p').forEach(p => console.log(p.textContent.slice(0, 2), getComputedStyle(p).color));`,
      },
      result: 'Paragraph 1 is bold crimson, 2 is italic green, 3 is underlined royal blue. The console prints each computed colour.',
      explanation: 'All three methods produce real styles. In a real project, the CSS panel content would be in css/style.css and linked with <link rel="stylesheet" href="css/style.css">.',
    },
    {
      title: 'Conflict: which colour wins?',
      scenario: 'The same heading is targeted by external, internal and inline rules. Predict the winner.',
      steps: [
        'Give an h1 a colour in the external CSS',
        'Give it another colour in an internal <style>',
        'Add an inline colour',
        'Click Run, then use the buttons to remove the inline style and see the next winner',
      ],
      code: `/* external */ h1 { color: blue; }
<style> h1 { color: green; } </style>
<h1 style="color: red;">Who wins?</h1>`,
      playground: {
        html: `<style>
  h1 { color: green; } /* internal: comes after the CSS panel in this playground */
</style>
<h1 id="h" style="color: red;">Who wins?</h1>
<button id="rm">Remove inline style</button>
<button id="imp">Add !important to external</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
h1 { color: blue; }`,
        js: `const h = document.getElementById('h');
const log = () => console.log('Winner colour:', getComputedStyle(h).color);
log();
document.getElementById('rm').onclick = () => { h.removeAttribute('style'); log(); };
document.getElementById('imp').onclick = () => {
  const s = document.createElement('style');
  s.textContent = 'h1 { color: blue !important; }';
  document.head.prepend(s);
  log();
};`,
      },
      result: 'Initially red (inline wins). After removing the inline style it turns green (the internal block comes later than the CSS panel). Adding !important to the blue rule makes it blue even though it is earlier.',
      explanation: 'Inline beats normal stylesheet rules. With equal specificity, the later rule wins. !important jumps above normal declarations. This is the cascade in action.',
    },
    {
      title: 'One external stylesheet, many pages (simulated)',
      scenario: 'Show how changing one shared CSS file restyles every page.',
      steps: [
        'Imagine index.html and about.html both linking theme.css',
        'In the playground, two "pages" share the same CSS classes',
        'Click "Switch theme" to swap the shared stylesheet',
        'Click Run',
      ],
      code: `<!-- index.html and about.html -->
<link rel="stylesheet" href="css/theme.css">`,
      playground: {
        html: `<link id="theme" rel="stylesheet" href="data:text/css,.page%7Bbackground:%23ecfeff;border-color:%230891b2%7D.page h2%7Bcolor:%230e7490%7D">
<section class="page"><h2>index.html</h2><p>Home page content</p></section>
<section class="page"><h2>about.html</h2><p>About page content</p></section>
<button id="sw">Switch theme (edit theme.css)</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.page { border: 2px solid; border-radius: 8px; padding: 8px 12px; margin-bottom: 10px; }`,
        js: `const light = 'data:text/css,' + encodeURIComponent('.page{background:#ecfeff;border-color:#0891b2}.page h2{color:#0e7490}');
const dark = 'data:text/css,' + encodeURIComponent('.page{background:#1e1b4b;border-color:#a78bfa;color:#e0e7ff}.page h2{color:#c4b5fd}');
let isDark = false;
document.getElementById('sw').onclick = () => {
  isDark = !isDark;
  document.getElementById('theme').href = isDark ? dark : light;
  console.log('theme.css now:', isDark ? 'dark' : 'light', '→ every page updated');
};`,
      },
      result: 'Two "pages" share a cyan theme. Clicking the button swaps the linked stylesheet and both pages change to a dark purple theme at once.',
      explanation: 'A <link rel="stylesheet"> loads CSS from a URL. Here a data: URL stands in for css/theme.css. Every page that links the same file updates together: the main benefit of external CSS.',
    },
  ],
  interview: [
    { q: 'What are the three ways to add CSS to HTML?', a: 'Inline (style attribute), internal (<style> element in the document), and external (separate .css file linked with <link rel="stylesheet">).', level: 'Easy' },
    { q: 'Which method is best for large websites and why?', a: 'External CSS: one file styles all pages, it is cached by the browser, keeps HTML clean and is easy to maintain.', level: 'Easy' },
    { q: 'What is the priority order among inline, internal and external CSS?', a: 'Inline has the highest priority. Internal and external have equal origin priority; with equal specificity, whichever appears later in the document wins. !important can override.', level: 'Medium' },
    { q: 'Write the tag to link an external stylesheet.', a: '<link rel="stylesheet" href="css/style.css"> placed in the <head>.', level: 'Easy' },
    { q: 'Can you write HTML <style> tags inside a .css file?', a: 'No. A .css file contains only CSS rules; <style> tags there are invalid and break the stylesheet.', level: 'Easy' },
    { q: 'When is inline CSS acceptable?', a: 'HTML emails, quick prototypes, or dynamic values set by JavaScript (e.g. element.style.transform). Avoid it for general styling.', level: 'Medium' },
    { q: 'What does "cascading" mean in CSS?', a: 'The algorithm that resolves conflicting declarations by origin and importance, specificity, and source order, and passes inherited values down the tree.', level: 'Medium' },
    { q: 'Difference between <link> and @import?', a: '<link> is HTML and lets the browser download stylesheets in parallel. @import is CSS and loads files sequentially (slower). Prefer <link>.', level: 'Hard' },
    { q: 'Why might my external CSS not apply?', a: 'Wrong path or file name (case-sensitive), missing rel="stylesheet", link placed incorrectly, browser cache, CSS syntax error, or a more specific/later rule overriding it.', level: 'Medium' },
    { q: 'What is the difference between class and id selectors?', a: 'Class (.name) can be reused on many elements and an element can have many classes; id (#name) must be unique per page and has higher specificity.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a page whose h1 is styled inline in orange, paragraphs styled internally in grey, and a .note class defined in external css/style.css.', hint: 'Three methods in one page.', solution: `<!-- index.html -->
<head>
  <link rel="stylesheet" href="css/style.css">
  <style> p { color: grey; } </style>
</head>
<body>
  <h1 style="color: orange;">My Page</h1>
  <p>Normal paragraph</p>
  <p class="note">Important note</p>
</body>

/* css/style.css */
.note { background: #fef9c3; padding: 8px; border-left: 4px solid #eab308; }` },
    { task: 'Convert these inline styles to an external class: <button style="background:green;color:white;padding:8px">OK</button>', hint: 'Create .btn-success.', solution: `<button class="btn-success">OK</button>

/* style.css */
.btn-success { background: green; color: white; padding: 8px; }` },
    { task: 'Predict and test: external p {color: blue} is linked AFTER an internal <style> p {color: red}. What colour?', hint: 'Same specificity: later wins.', solution: `<head>
  <style> p { color: red; } </style>
  <link rel="stylesheet" href="style.css"> <!-- p { color: blue; } -->
</head>
<!-- Result: blue, because the external link comes later -->` },
    { task: 'Link two stylesheets: base.css for all pages and contact.css only for the contact page.', hint: 'Order: general first, specific later.', solution: `<!-- contact.html -->
<head>
  <link rel="stylesheet" href="css/base.css">
  <link rel="stylesheet" href="css/contact.css">
</head>` },
  ],
  quiz: [
    { question: 'Which attribute adds inline CSS?', options: ['css', 'class', 'style', 'font'], answer: 2, explanation: 'style="property: value".' },
    { question: 'Correct way to link an external stylesheet:', options: ['<style src="style.css">', '<link rel="stylesheet" href="style.css">', '<css href="style.css">', '<script href="style.css">'], answer: 1, explanation: '<link> with rel="stylesheet" and href.' },
    { question: 'Which has the highest priority (without !important)?', options: ['Inline style', 'External stylesheet', 'Internal style', 'Browser default'], answer: 0, explanation: 'Inline declarations override stylesheet rules.' },
    { question: 'Main advantage of external CSS:', options: ['Highest priority', 'Works without a browser', 'No selectors needed', 'One file can style many pages and is cached'], answer: 3, explanation: 'Reuse and caching make external CSS ideal.' },
    { question: 'Internal CSS is written inside:', options: ['<css>', '<link>', '<style>', '<head-style>'], answer: 2, explanation: 'The <style> element, usually in the head.' },
  ],
};
