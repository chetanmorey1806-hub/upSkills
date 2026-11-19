const PAGE = `<header class="top">
  <h1 id="brand">UpSkillr</h1>
  <nav>
    <a href="#" class="active">Home</a>
    <a href="#">Courses</a>
    <a href="https://learn.microsoft.com">Docs</a>
  </nav>
</header>
<main>
  <p class="intro">Learn full stack .NET in 120 days.</p>
  <ul class="topics">
    <li>C#</li>
    <li>SQL Server</li>
    <li>ASP.NET Core</li>
    <li>React</li>
  </ul>
  <p>Batches start every month.</p>
  <input type="text" placeholder="Name">
  <input type="email" placeholder="Email">
</main>`;

export default {
  lesson: 'day-054-css-introduction-selectors',
  minutes: 22,
  intro: 'Practise the three ways to add CSS and the main selectors: element, class, id, grouping, descendant, child, attribute and simple pseudo-classes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which way of adding CSS is best for a website with many pages?',
      options: [
        'Inline CSS: style="..." on every element',
        'Internal CSS: a <style> block in every page',
        'External CSS: one .css file linked with <link rel="stylesheet" href="site.css"> in every page',
        'CSS cannot be shared between pages',
      ],
      answer: 2,
      explain: 'An **external stylesheet** is written once, cached by the browser and reused by all pages; change it once and the whole site updates. Inline styles are hard to maintain and have very high priority.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Using the given HTML, write CSS with **element, id and class selectors**:\n- every `p`: `color: #333333`\n- the element with id `brand`: `color: #0d6efd`\n- elements with class `intro`: `font-size: 20px`\n- `h1` and `li` together (grouping selector): `font-family: Arial, sans-serif`',
      html: PAGE,
      example: { title: 'basic selectors', code: 'h2 { color: green; }\n#logo { width: 80px; }\n.note { font-style: italic; }\nh2, h3 { margin: 0; }' },
      starter: 'p {\n  /* TODO */\n}\n',
      solution: 'p { color: #333333; }\n#brand { color: #0d6efd; }\n.intro { font-size: 20px; }\nh1, li { font-family: Arial, sans-serif; }',
      checks: [
        { sel: 'main > p:last-of-type', style: { color: 'rgb(51, 51, 51)' }, msg: 'Paragraphs must be color #333333' },
        { sel: '#brand', style: { color: 'rgb(13, 110, 253)' }, msg: '#brand must be color #0d6efd' },
        { sel: '.intro', style: { 'font-size': '20px' }, msg: '.intro must have font-size 20px' },
        { sel: 'h1', style: { 'font-family': 'Arial, sans-serif' }, msg: 'h1 must use Arial, sans-serif' },
        { sel: 'li', style: { 'font-family': 'Arial, sans-serif' }, msg: 'li must use Arial, sans-serif' },
      ],
      explain: '`p` selects by tag, `#brand` by id (unique), `.intro` by class (reusable). A comma groups selectors so they share one rule, avoiding repetition.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Combinators and attribute selectors:\n- links **inside** `nav` (descendant): `text-decoration: none`\n- the link with class `active` inside nav: `font-weight: 700`\n- `li` that are **direct children** of `.topics`: `color: green`\n- links whose `href` **starts with** `https`: `color: purple`',
      html: PAGE,
      example: { title: 'combinators', code: 'footer a { color: gray; }        /* descendant */\n.menu > li { display: inline; }  /* direct child */\ninput[type="email"] { width: 200px; }\na[href$=".pdf"] { color: red; }   /* ends with */' },
      starter: 'nav a {\n  /* TODO */\n}\n',
      solution: 'nav a { text-decoration: none; }\nnav a.active { font-weight: 700; }\n.topics > li { color: green; }\na[href^="https"] { color: purple; }',
      checks: [
        { sel: 'nav a', style: { 'text-decoration-line': 'none' }, msg: 'Links inside nav must have no underline' },
        { sel: 'nav a.active', style: { 'font-weight': '700' }, msg: 'The active link must be bold (700)' },
        { sel: '.topics > li', style: { color: 'rgb(0, 128, 0)' }, msg: 'Direct li children of .topics must be green' },
        { sel: 'a[href^="https"]', style: { color: 'rgb(128, 0, 128)' }, msg: 'Links starting with https must be purple' },
        { sel: 'nav a.active', style: { 'text-decoration-line': 'none' }, msg: 'The active link should also have no underline' },
      ],
      explain: 'A space means "anywhere inside", `>` means "direct child only". `[attr^="x"]` = starts with, `[attr$="x"]` = ends with, `[attr*="x"]` = contains. `a.active` (no space) means an `<a>` that **has** the class active.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 4,
      q: 'Pseudo-classes:\n- the **first** `li` in `.topics`: `color: red`\n- the **last** `li` in `.topics`: `color: blue`\n- `input[type="email"]`: `border: 2px solid orange`',
      html: PAGE,
      example: { title: 'structural pseudo-classes', code: 'tr:first-child { font-weight: bold; }\ntr:nth-child(even) { background: #eee; }\nli:last-child { border: none; }' },
      starter: '.topics li:first-child {\n  /* TODO */\n}\n',
      solution: '.topics li:first-child { color: red; }\n.topics li:last-child { color: blue; }\ninput[type="email"] { border: 2px solid orange; }',
      checks: [
        { sel: '.topics li', index: 0, style: { color: 'rgb(255, 0, 0)' }, msg: 'The first li must be red' },
        { sel: '.topics li', index: 3, style: { color: 'rgb(0, 0, 255)' }, msg: 'The last li must be blue' },
        { sel: '.topics li', index: 1, style: { color: 'rgb(0, 0, 0)' }, msg: 'Only the first and last li should change colour' },
        { sel: 'input[type="email"]', style: { 'border-top-width': '2px', 'border-top-style': 'solid', 'border-top-color': 'rgb(255, 165, 0)' }, msg: 'The email input needs border: 2px solid orange' },
      ],
      explain: '`:first-child` / `:last-child` / `:nth-child(n)` select by position among siblings. The attribute selector targets only the email input, leaving the text input unchanged.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which rule wins for `<h1 id="brand" class="title">`?\n```\nh1 { color: black; }\n.title { color: green; }\n#brand { color: blue; }\n```',
      options: ['black', 'green', 'blue', 'The last rule in the file'],
      answer: 2,
      explain: '**Specificity**: id (1,0,0) beats class (0,1,0) beats element (0,0,1), regardless of order. Source order only decides between rules of equal specificity. Inline styles beat all of these, and `!important` beats inline.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the selector that selects **every** element on the page (used e.g. for `box-sizing: border-box`).',
      example: { title: 'reset rule', code: '? { margin: 0; padding: 0; }' },
      accept: ['*'],
      explain: 'The **universal selector** `*` matches all elements. A very common reset is `*, *::before, *::after { box-sizing: border-box; }`.',
    },
  ],
};
