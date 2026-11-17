export default {
  id: 'day-08-ordered-unordered-lists',
  title: 'Ordered Lists <ol>, Unordered Lists <ul>, List Items <li>',
  module: 'Module 2: Links, Images & Lists',
  day: 8,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Lists organise related items: steps in a recipe, features of a product, links in a menu. Learn ordered and unordered lists, their attributes (type, start, reversed, value) and why navigation menus are built with lists.',
  objectives: [
    'Create unordered lists with <ul> and ordered lists with <ol>',
    'Decide when order matters and choose the correct list type',
    'Use the type, start, reversed and value attributes on ordered lists',
    'Change bullet styles correctly with CSS list-style-type',
    'Build a navigation menu using a list of links',
  ],
  theory: [
    {
      heading: 'Why use lists?',
      content: "Lists group **related items** together. Compared with separate paragraphs, lists:\n- Are easier to **scan** for readers\n- Tell **screen readers** how many items there are (\"list, 5 items\") and let users jump past them\n- Give **search engines** structured content (Google often shows list snippets for \"steps to...\" queries)\n\nHTML has three list types: **unordered** (`<ul>`), **ordered** (`<ol>`) and **description** lists (`<dl>`, Day 9).",
    },
    {
      heading: 'Unordered list <ul>',
      content: "Use `<ul>` when the **order does not matter**: a shopping list, product features, skills. Each item is wrapped in `<li>` (list item). Browsers show a **bullet** (disc) before each item and indent the list.\n\nTo change the bullet style, use CSS `list-style-type`: `disc` (default), `circle`, `square` or `none`. The old `type` attribute on `<ul>` is **obsolete** in HTML5.",
      syntax: '<ul>\n  <li>Free delivery</li>\n  <li>7-day returns</li>\n  <li>Cash on delivery</li>\n</ul>',
      tip: 'Test: if shuffling the items does not change the meaning, use <ul>.',
    },
    {
      heading: 'Ordered list <ol>',
      content: "Use `<ol>` when **order matters**: step-by-step instructions, rankings, a top 10, a recipe method. Browsers number the items automatically (1, 2, 3...), so if you insert a new step, everything renumbers for you.\n\nAttributes of `<ol>` (these are valid HTML5 because the numbering carries meaning):\n- `type`: numbering style: `1` (default), `A` (A, B, C), `a` (a, b, c), `I` (I, II, III), `i` (i, ii, iii).\n- `start`: number to start from, e.g. `start=\"5\"`. Always written as a number even when type is A or I (`start=\"3\"` with type A starts at C).\n- `reversed`: boolean; counts down (great for countdowns: 3, 2, 1).\n\nAttribute of `<li>` inside `<ol>`:\n- `value`: sets the number of that item; following items continue from it.",
      syntax: '<ol type="I" start="4">\n  <li>Chapter four</li>   <!-- IV -->\n  <li>Chapter five</li>   <!-- V -->\n</ol>\n<ol reversed>\n  <li>Bronze</li>  <!-- 3 -->\n  <li>Silver</li>  <!-- 2 -->\n  <li>Gold</li>    <!-- 1 -->\n</ol>',
    },
    {
      heading: 'The list item <li> and nesting rules',
      content: "Strict rules (validators will complain otherwise):\n1. The **only** direct children allowed in `<ul>` or `<ol>` are `<li>` elements (plus `<script>`/`<template>`).\n2. `<li>` can contain almost anything: text, links, images, paragraphs, even another list.\n3. A nested list must go **inside an `<li>`**, not directly inside `<ul>`.\n\nWrong: `<ul><p>Hello</p></ul>` or `<ul><li>A</li><ul>...</ul></ul>`\n\nRight: `<ul><li>A<ul><li>A1</li></ul></li></ul>`\n\n(Nested lists are explored more on Day 9.)",
      tip: 'Common mistake: putting a heading or <br> directly inside <ul>. Put it before the list or inside an <li>.',
    },
    {
      heading: 'Lists for navigation menus',
      content: "Almost every website menu is an **unordered list of links** inside a `<nav>`. Why? A menu is semantically a list of destinations, and screen readers announce \"navigation, list, 5 items\", which helps users understand the menu.\n\nWith CSS you remove bullets (`list-style: none`), remove default padding, and lay items out horizontally (with flexbox, covered in the CSS course).",
      syntax: '<nav>\n  <ul>\n    <li><a href="index.html">Home</a></li>\n    <li><a href="shop.html">Shop</a></li>\n    <li><a href="contact.html">Contact</a></li>\n  </ul>\n</nav>',
    },
  ],
  examples: [
    {
      title: 'Shopping list vs recipe steps',
      scenario: 'A recipe page needs an unordered ingredients list and ordered cooking steps.',
      steps: [
        'Create recipe.html',
        'Add <h2>Ingredients</h2> followed by a <ul>',
        'Add <h2>Method</h2> followed by an <ol>',
        'Click Run',
      ],
      code: `<h2>Ingredients</h2>
<ul>
  <li>2 cups rice</li>
  <li>1 cup moong dal</li>
  <li>1 tsp turmeric</li>
  <li>Salt to taste</li>
</ul>

<h2>Method</h2>
<ol>
  <li>Wash rice and dal together.</li>
  <li>Add 5 cups of water, turmeric and salt.</li>
  <li>Pressure cook for 3 whistles.</li>
  <li>Serve hot with ghee.</li>
</ol>`,
      playground: {
        html: `<h1>Simple Khichdi</h1>
<h2>Ingredients</h2>
<ul>
  <li>2 cups rice</li>
  <li>1 cup moong dal</li>
  <li>1 tsp turmeric</li>
  <li>Salt to taste</li>
</ul>
<h2>Method</h2>
<ol>
  <li>Wash rice and dal together.</li>
  <li>Add 5 cups of water, turmeric and salt.</li>
  <li>Pressure cook for 3 whistles.</li>
  <li>Serve hot with ghee.</li>
</ol>`,
      },
      result: 'Ingredients with bullets and the method numbered 1 to 4.',
      explanation: 'Ingredients can be gathered in any order, so <ul>. Steps must be followed in sequence, so <ol>. The browser numbers automatically.',
    },
    {
      title: 'Ordered list attributes: type, start, reversed, value',
      scenario: 'Show a syllabus with Roman numerals, a continued list and a countdown.',
      steps: [
        'Create an <ol type="I">',
        'Create an <ol start="4"> that continues numbering',
        'Create an <ol reversed> countdown',
        'Use value on an <li> to jump a number',
        'Click Run',
      ],
      code: `<ol type="I">
  <li>HTML</li><li>CSS</li><li>JavaScript</li>
</ol>

<ol start="4">
  <li>React</li><li>Node.js</li>
</ol>

<ol reversed>
  <li>Three</li><li>Two</li><li>One</li>
</ol>

<ol>
  <li>First</li>
  <li value="10">Tenth</li>
  <li>Eleventh</li>
</ol>`,
      playground: {
        html: `<h3>type="I"</h3>
<ol type="I">
  <li>HTML</li><li>CSS</li><li>JavaScript</li>
</ol>
<h3>start="4"</h3>
<ol start="4">
  <li>React</li><li>Node.js</li>
</ol>
<h3>type="a" start="3"</h3>
<ol type="a" start="3">
  <li>Third letter</li><li>Fourth letter</li>
</ol>
<h3>reversed</h3>
<ol reversed>
  <li>Three</li><li>Two</li><li>One - Launch!</li>
</ol>
<h3>li value="10"</h3>
<ol>
  <li>First</li>
  <li value="10">Tenth</li>
  <li>Eleventh</li>
</ol>`,
      },
      result: 'I, II, III; then 4, 5; then c, d; then 3, 2, 1; then 1, 10, 11.',
      explanation: 'type changes the counter style, start sets the first number (as a number even for letters), reversed counts down, and value overrides one item with following items continuing from it.',
    },
    {
      title: 'Navigation menu from a list',
      scenario: 'Build the main menu of a website as a list of links and style it horizontally.',
      steps: [
        'Create <nav> with a <ul> inside',
        'Put an <a> in each <li>',
        'Add CSS to remove bullets and display items in a row',
        'Click Run',
      ],
      code: `<nav>
  <ul class="menu">
    <li><a href="#">Home</a></li>
    <li><a href="#">Courses</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
      playground: {
        html: `<nav>
  <ul class="menu">
    <li><a href="#">Home</a></li>
    <li><a href="#">Courses</a></li>
    <li><a href="#">Blog</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
        css: `.menu { list-style: none; padding: 0; margin: 0; display: flex; gap: 4px; background: #1e293b; }
.menu a { display: block; padding: 12px 16px; color: white; text-decoration: none; font-family: sans-serif; }
.menu a:hover { background: #334155; }`,
        js: `console.log('Menu items:', document.querySelectorAll('.menu li').length);`,
      },
      result: 'A dark horizontal menu bar with four links that highlight on hover; the console shows "Menu items: 4".',
      explanation: 'Semantically the menu is still a list, so screen readers announce the item count. CSS removes the bullets and padding and lays out items in a row. (Flexbox is taught in the CSS course.)',
    },
    {
      title: 'Changing bullets with CSS (not the type attribute)',
      scenario: 'Show square bullets, no bullets and an emoji bullet using modern CSS.',
      steps: [
        'Create three <ul> lists with different classes',
        'Use list-style-type in CSS',
        'Click Run',
      ],
      code: `ul.square { list-style-type: square; }
ul.none   { list-style-type: none; padding-left: 0; }
ul.emoji  { list-style-type: "✅ "; }`,
      playground: {
        html: `<ul class="square"><li>Square bullet</li><li>Another</li></ul>
<ul class="none"><li>No bullet</li><li>Another</li></ul>
<ul class="emoji"><li>Custom tick bullet</li><li>Another</li></ul>
<ul class="circle"><li>Circle bullet</li><li>Another</li></ul>`,
        css: `ul.square { list-style-type: square; }
ul.none { list-style-type: none; padding-left: 0; }
ul.emoji { list-style-type: "✅ "; }
ul.circle { list-style-type: circle; }`,
      },
      result: 'Four lists: square bullets, no bullets, tick-mark bullets, circle bullets.',
      explanation: 'Bullet appearance is presentation, so it belongs in CSS. <ul type="square"> is obsolete in HTML5. list-style-type also accepts a string, allowing emoji bullets.',
    },
  ],
  interview: [
    { q: 'What is the difference between <ul> and <ol>?', a: '<ul> is an unordered list where order does not matter (bullets by default). <ol> is an ordered list where sequence matters (numbers or letters by default).', level: 'Easy' },
    { q: 'What elements can be direct children of <ul> or <ol>?', a: 'Only <li> elements (and script-supporting elements like <script> and <template>). Any other content must be inside an <li>.', level: 'Medium' },
    { q: 'What attributes does <ol> support?', a: 'type (1, A, a, I, i), start (an integer starting value) and reversed (boolean, counts down).', level: 'Easy' },
    { q: 'How do you start an ordered list at 5?', a: '<ol start="5">. Alternatively set value="5" on the first <li>.', level: 'Easy' },
    { q: 'How do you change bullet style in an unordered list?', a: 'With CSS list-style-type (disc, circle, square, none, or a custom string) or list-style-image. The type attribute on <ul> is obsolete.', level: 'Easy' },
    { q: 'Why are navigation menus usually built with <ul>?', a: 'A menu is semantically a list of links. Screen readers announce it as a list with a number of items, giving context, and it degrades gracefully without CSS.', level: 'Medium' },
    { q: 'How do you nest a list correctly?', a: 'Place the inner <ul> or <ol> inside an <li> of the outer list, not directly inside the outer <ul>/<ol>.', level: 'Medium' },
    { q: 'What does the value attribute on <li> do?', a: 'In an ordered list it sets the ordinal value of that item; the following items continue counting from it.', level: 'Medium' },
    { q: 'If an <ol> has type="A" and start="3", what is the first marker?', a: 'C. start always takes an integer and is converted into the chosen counter style.', level: 'Hard' },
    { q: 'Why not just write numbers manually in paragraphs instead of using <ol>?', a: 'Manual numbers must be updated when items change, are not announced as a list by screen readers, and lack semantic structure for search engines. <ol> renumbers automatically.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create an unordered list of five skills you want to learn this year.',
      hint: 'One <li> per skill inside <ul>.',
      solution: `<h2>Skills for 2026</h2>
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
  <li>React</li>
  <li>Git</li>
</ul>`,
    },
    {
      task: 'Write the steps to make a UPI payment as an ordered list.',
      hint: 'Use <ol>. Order matters.',
      solution: `<h2>How to pay with UPI</h2>
<ol>
  <li>Open your UPI app.</li>
  <li>Scan the merchant QR code.</li>
  <li>Enter the amount.</li>
  <li>Enter your UPI PIN.</li>
  <li>Wait for the success message.</li>
</ol>`,
    },
    {
      task: 'Create a "Top 5 movies" countdown list that displays 5 to 1, and a list of exam sections lettered A to D.',
      hint: 'reversed for the countdown; type="A" for letters.',
      solution: `<h2>Top 5 Movies</h2>
<ol reversed>
  <li>Movie E</li>
  <li>Movie D</li>
  <li>Movie C</li>
  <li>Movie B</li>
  <li>Movie A</li>
</ol>
<h2>Exam Sections</h2>
<ol type="A">
  <li>Reasoning</li>
  <li>Quantitative Aptitude</li>
  <li>English</li>
  <li>General Awareness</li>
</ol>`,
    },
    {
      task: 'Fix the invalid list: <ul><h3>Fruits</h3><li>Apple<li>Mango</li><p>Banana</p></ul>',
      hint: 'Move the heading outside, close all li tags, wrap Banana in li.',
      solution: `<h3>Fruits</h3>
<ul>
  <li>Apple</li>
  <li>Mango</li>
  <li>Banana</li>
</ul>`,
    },
    {
      task: 'Build a footer link list (About, Careers, Privacy, Terms) with no bullets and no left padding.',
      hint: 'Use a <ul> of links plus CSS list-style: none; padding: 0;',
      solution: `<style>
  .footer-links { list-style: none; padding: 0; }
  .footer-links li { margin: 4px 0; }
</style>
<ul class="footer-links">
  <li><a href="about.html">About</a></li>
  <li><a href="careers.html">Careers</a></li>
  <li><a href="privacy.html">Privacy Policy</a></li>
  <li><a href="terms.html">Terms of Use</a></li>
</ul>`,
    },
  ],
  quiz: [
    { question: 'Which list should you use for step-by-step instructions?', options: ['<ul>', '<dl>', '<ol>', '<li>'], answer: 2, explanation: 'Order matters, so use an ordered list.' },
    { question: 'Which element represents each item in a list?', options: ['<li>', '<item>', '<lt>', '<dd>'], answer: 0, explanation: '<li> is the list item element for <ul> and <ol>.' },
    { question: 'What does <ol reversed> with 3 items display?', options: ['1, 2, 3', 'III, II, I', 'C, B, A', '3, 2, 1'], answer: 3, explanation: 'reversed counts down with the default numeric style.' },
    { question: 'How should you remove bullets from a <ul>?', options: ['<ul type="none">', 'CSS list-style-type: none', '<ul bullets="false">', '<ul nobullet>'], answer: 1, explanation: 'Bullet style is presentation and should be set in CSS.' },
    { question: 'What will <ol type="a" start="2"> show for its first item?', options: ['b', '2', 'a', 'B'], answer: 0, explanation: 'start=2 with lowercase letters gives "b".' },
  ],
};
