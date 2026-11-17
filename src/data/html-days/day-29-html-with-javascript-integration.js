export default {
  id: 'day-29-html-with-javascript-integration',
  title: 'HTML with JavaScript Integration: Script Tag, DOM Introduction',
  module: 'Module 6: Professional HTML Development',
  day: 29,
  level: 'Intermediate',
  duration: '2 hours',
  summary: "JavaScript adds behaviour to HTML: reacting to clicks, changing content and validating forms. Today you learn how to connect JS with the <script> tag (inline, internal, external, defer, async, module) and get your first look at the DOM, the live tree of objects the browser builds from your HTML.",
  objectives: [
    'Add JavaScript using internal <script> blocks and external .js files',
    'Explain where to place scripts and the difference between defer and async',
    'Describe the DOM as a tree of nodes built from HTML',
    'Select elements, change their content/styles and respond to events',
  ],
  theory: [
    {
      heading: 'Role of JavaScript',
      content: "If HTML is the **skeleton** and CSS is the **skin and clothes**, JavaScript is the **muscles and brain**: it makes the page *do* things.\n\nExamples: showing/hiding a menu, form validation before submit, image sliders, live search, loading data without reloading the page.\n\nJavaScript runs in the browser and talks to the page through the **DOM**.",
    },
    {
      heading: 'The <script> tag: three ways',
      content: "1. **Inline event attribute** (avoid in real projects): `<button onclick=\"alert('Hi')\">`\n2. **Internal script**: code inside `<script>...</script>`\n3. **External script** (recommended): `<script src=\"js/main.js\"></script>`. The .js file contains only JavaScript, no `<script>` tags.\n\nAn external `<script src>` must still have a closing `</script>` tag and must NOT contain code inside it (that code is ignored).",
      syntax: `<!-- internal -->
<script>
  console.log('Hello from internal JS');
</script>

<!-- external -->
<script src="js/main.js"></script>`,
      tip: 'type="text/javascript" is optional in HTML5. You may see it in old code; you do not need it.',
    },
    {
      heading: 'Where to place scripts: end of body, defer and async',
      content: "HTML is parsed from top to bottom. A normal `<script>` **pauses parsing** until it downloads and runs. If it runs in `<head>` and tries to find `#btn`, the button does not exist yet → `null` error.\n\nSolutions:\n- Put scripts **just before `</body>`** (classic approach).\n- Put them in `<head>` with **`defer`**: downloads in parallel, runs **after HTML is parsed**, in order. **Best default.**\n- **`async`**: downloads in parallel, runs **as soon as downloaded**, in any order. Good for independent scripts like analytics.\n- **`type=\"module\"`**: ES module, deferred by default, supports import/export.",
      syntax: `<head>
  <script src="js/main.js" defer></script>
  <script src="https://example.com/analytics.js" async></script>
</head>`,
      points: [
        'defer → order preserved, runs after parsing (DOM ready)',
        'async → order NOT guaranteed, runs whenever ready',
        'defer/async only work on external scripts (with src)',
      ],
    },
    {
      heading: 'What is the DOM?',
      content: "The **DOM (Document Object Model)** is the browser's in-memory representation of the page as a **tree of objects (nodes)**. Every element, attribute and piece of text becomes a node that JavaScript can read and change.\n\nAnalogy: your HTML file is the **architect's blueprint**; the DOM is the **actual building** built from it. JavaScript can repaint walls or add rooms in the building; the blueprint file on the server does not change.\n\n`document` is the root object. `document.documentElement` is `<html>`, `document.body` is `<body>`.",
      syntax: `html
├── head
│   └── title → "My Page"
└── body
    ├── h1 → "Hello"
    └── button#btn → "Click"`,
    },
    {
      heading: 'First DOM operations',
      content: "1. **Select**: `document.getElementById('id')`, `document.querySelector('.css-selector')`, `document.querySelectorAll('li')`\n2. **Change content**: `el.textContent = 'New text'` (safe), `el.innerHTML = '<b>HTML</b>'` (parses HTML; never use with user input → XSS risk)\n3. **Change style/class**: `el.style.color = 'red'`, `el.classList.add('active')` (preferred)\n4. **Attributes**: `img.src = '...'`, `el.setAttribute('aria-expanded', 'true')`\n5. **Events**: `el.addEventListener('click', function)`\n6. **Create**: `document.createElement('li')`, `parent.append(child)`\n\n(These are covered in depth in the JavaScript course; today is the introduction.)",
      tip: 'Prefer addEventListener over onclick="" attributes: it keeps HTML clean and allows multiple listeners.',
    },
  ],
  examples: [
    {
      title: 'Hello DOM: change text on click',
      scenario: 'Clicking a button changes a heading and its colour.',
      steps: [
        'Create index.html with an h1#title and a button#btn',
        'Create js/main.js (the JS panel) and select both elements',
        'Add a click event listener that changes textContent and a class',
        'Click Run, then click the button',
      ],
      code: `<h1 id="title">Hello</h1>
<button id="btn">Greet</button>
<script src="js/main.js" defer></script>

// js/main.js
const title = document.getElementById('title');
document.getElementById('btn').addEventListener('click', () => {
  title.textContent = 'Hello, DOM!';
  title.classList.toggle('highlight');
});`,
      playground: {
        html: `<h1 id="title">Hello</h1>
<button id="btn">Greet</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.highlight { color: #db2777; }`,
        js: `const title = document.getElementById('title');
let clicks = 0;
document.getElementById('btn').addEventListener('click', () => {
  clicks++;
  title.textContent = 'Hello, DOM! (' + clicks + ')';
  title.classList.toggle('highlight');
  console.log('Heading is now:', title.textContent);
});`,
      },
      result: 'Each click updates the heading text with a counter and toggles its pink colour. The console logs the new text.',
      explanation: 'JS selects nodes from the DOM, listens for an event, then modifies the node. The original HTML file never changes; only the live DOM does.',
    },
    {
      title: 'Why script position matters (null error)',
      scenario: 'Demonstrate what happens when JS runs before the element exists.',
      steps: [
        'Write a script that looks up #late before that element is created',
        'Then create the element and look it up again',
        'Click Run and read the console',
      ],
      code: `<head>
  <script src="main.js"></script>      <!-- runs too early: element not found -->
  <script src="main.js" defer></script> <!-- runs after parsing: works -->
</head>`,
      playground: {
        html: `<p>Open the console.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `// Simulates a script in <head> that runs before the element exists
console.log('Before element exists:', document.getElementById('late'));
try {
  document.getElementById('late').textContent = 'x';
} catch (e) {
  console.log('Error:', e.message);
}
// Now the "parser" reaches the element
const p = document.createElement('p');
p.id = 'late';
p.textContent = 'I was added later';
document.body.appendChild(p);
// Simulates a deferred script
console.log('After element exists:', document.getElementById('late').textContent);`,
      },
      result: 'Console shows: Before element exists: null, an error like "Cannot set properties of null", then After element exists: I was added later.',
      explanation: 'getElementById returns null when the element is not in the DOM yet. Using defer (or placing scripts before </body>) ensures the DOM is ready before your code runs.',
    },
    {
      title: 'Exploring the DOM tree',
      scenario: 'Print the tree structure of a small HTML fragment.',
      steps: [
        'Create a nested list inside a section',
        'Write a recursive function that walks element children',
        'Click Run and compare the console tree with the HTML',
      ],
      code: `function walk(node, depth) {
  console.log(' '.repeat(depth * 2) + node.tagName.toLowerCase());
  for (const child of node.children) walk(child, depth + 1);
}`,
      playground: {
        html: `<section id="root">
  <h2>Fruits</h2>
  <ul>
    <li>Apple</li>
    <li>Mango <em>(seasonal)</em></li>
  </ul>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `function walk(node, depth) {
  const text = node.children.length === 0 ? ' → "' + node.textContent.trim() + '"' : '';
  console.log(' '.repeat(depth * 2) + node.tagName.toLowerCase() + (node.id ? '#' + node.id : '') + text);
  for (const child of node.children) walk(child, depth + 1);
}
walk(document.getElementById('root'), 0);
console.log('Total nodes inside section (incl. text/whitespace):', document.getElementById('root').childNodes.length);`,
      },
      result: 'The console prints an indented tree: section#root → h2 "Fruits", ul → li "Apple", li → em "(seasonal)". It also shows that childNodes includes whitespace text nodes.',
      explanation: 'Every element is a node with parent/children. children contains only elements; childNodes also includes text nodes (even the whitespace from your indentation).',
    },
    {
      title: 'Interactive to-do list (create elements)',
      scenario: 'Add items to a list from an input, using createElement and events.',
      steps: [
        'Create a form with an input and a button, plus an empty <ul>',
        'On submit, prevent the page reload, create an <li>, set its text and append it',
        'Click Run and add a few tasks',
      ],
      code: `form.addEventListener('submit', e => {
  e.preventDefault();
  const li = document.createElement('li');
  li.textContent = input.value;
  list.append(li);
});`,
      playground: {
        html: `<form id="todo-form">
  <label for="task">New task</label>
  <input id="task" required placeholder="e.g. Revise HTML">
  <button>Add</button>
</form>
<ul id="list"></ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
li { padding: 4px 0; cursor: pointer; }
li.done { text-decoration: line-through; color: #94a3b8; }`,
        js: `const form = document.getElementById('todo-form');
const input = document.getElementById('task');
const list = document.getElementById('list');
form.addEventListener('submit', e => {
  e.preventDefault();
  const li = document.createElement('li');
  li.textContent = input.value.trim();
  li.addEventListener('click', () => li.classList.toggle('done'));
  list.append(li);
  console.log('Added:', li.textContent, '| total:', list.children.length);
  input.value = '';
  input.focus();
});`,
      },
      result: 'Typing a task and pressing Add (or Enter) adds it to the list; clicking a task strikes it through. The console logs each addition.',
      explanation: 'preventDefault stops the form from reloading the page. textContent (not innerHTML) is used for user input to avoid script injection. This is how every dynamic UI starts.',
    },
  ],
  interview: [
    { q: 'How do you include JavaScript in an HTML page?', a: 'With the <script> element: internal code between <script></script>, or an external file via <script src="file.js"></script>. Inline event attributes also exist but are discouraged.', level: 'Easy' },
    { q: 'What is the difference between defer and async?', a: 'Both download in parallel without blocking parsing. defer runs after the document is parsed, in order. async runs as soon as it is downloaded, in no guaranteed order.', level: 'Medium' },
    { q: 'Why place scripts at the end of <body>?', a: 'So HTML elements exist before the script runs and so the script download does not block rendering. Modern alternative: defer in <head>.', level: 'Easy' },
    { q: 'What is the DOM?', a: 'The Document Object Model: a tree-structured, programmable representation of the page that browsers build from HTML, which JavaScript can read and modify.', level: 'Easy' },
    { q: 'Is the DOM the same as the HTML source?', a: 'No. The DOM is the live structure in memory; it may differ from the source due to parser corrections (e.g. auto-inserted <tbody>) and JavaScript changes.', level: 'Medium' },
    { q: 'Difference between textContent and innerHTML?', a: 'textContent gets/sets plain text (safe, faster). innerHTML gets/sets HTML markup and parses it, which can lead to XSS if used with untrusted input.', level: 'Medium' },
    { q: 'getElementById vs querySelector?', a: 'getElementById selects by id only (fast). querySelector takes any CSS selector and returns the first match; querySelectorAll returns a static NodeList of all matches.', level: 'Easy' },
    { q: 'Why prefer addEventListener over onclick attributes?', a: 'Separates JS from HTML, allows multiple handlers for the same event, supports options (once, passive, capture), and is easier to remove.', level: 'Medium' },
    { q: 'Can a <script src> tag also contain inline code?', a: 'No. If src is present, the code inside the tags is ignored.', level: 'Medium' },
    { q: 'What does type="module" do on a script?', a: 'Loads it as an ES module: supports import/export, runs in strict mode, has its own scope and is deferred by default.', level: 'Hard' },
    { q: 'What is the difference between children and childNodes?', a: 'children returns only element nodes (HTMLCollection). childNodes returns all nodes including text and comment nodes (NodeList).', level: 'Hard' },
  ],
  practice: [
    { task: 'Create a button that changes the page background colour to a random colour on each click.', hint: 'document.body.style.background.', solution: `<button id="bg">Random background</button>
<script>
  document.getElementById('bg').addEventListener('click', () => {
    const hue = Math.floor(Math.random() * 360);
    document.body.style.background = 'hsl(' + hue + ', 70%, 85%)';
  });
</script>` },
    { task: 'Link an external script js/app.js in the head so it runs after the DOM is ready.', hint: 'defer.', solution: `<head>
  <script src="js/app.js" defer></script>
</head>` },
    { task: 'Make a character counter: show "N characters" below a textarea as the user types.', hint: 'input event + value.length.', solution: `<textarea id="msg"></textarea>
<p id="count">0 characters</p>
<script>
  const msg = document.getElementById('msg');
  msg.addEventListener('input', () => {
    document.getElementById('count').textContent = msg.value.length + ' characters';
  });
</script>` },
    { task: 'Show/hide a paragraph using a button and the hidden property.', hint: 'p.hidden = !p.hidden.', solution: `<button id="t">Toggle details</button>
<p id="d" hidden>Here are the details.</p>
<script>
  document.getElementById('t').addEventListener('click', () => {
    const d = document.getElementById('d');
    d.hidden = !d.hidden;
  });
</script>` },
  ],
  quiz: [
    { question: 'Which attribute makes an external script run after HTML parsing, in order?', options: ['async', 'defer', 'lazy', 'wait'], answer: 1, explanation: 'defer preserves order and waits for parsing to finish.' },
    { question: 'DOM stands for:', options: ['Data Object Model', 'Document Oriented Markup', 'Document Object Model', 'Display Object Manager'], answer: 2, explanation: 'Document Object Model.' },
    { question: 'What does document.getElementById("x") return if no element matches?', options: ['undefined', 'An empty array', 'false', 'null'], answer: 3, explanation: 'It returns null.' },
    { question: 'Safest way to insert user-typed text into an element:', options: ['el.textContent = value', 'el.innerHTML = value', 'document.write(value)', 'eval(value)'], answer: 0, explanation: 'textContent never parses HTML, preventing XSS.' },
    { question: 'Correct external script tag:', options: ['<script href="app.js">', '<script src="app.js"></script>', '<js src="app.js">', '<link rel="script" href="app.js">'], answer: 1, explanation: 'Use src and a closing </script> tag.' },
  ],
};
