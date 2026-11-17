export default {
  id: 'day-22-dom-selecting-elements',
  title: 'DOM Introduction and Selecting Elements (getElementById, querySelector, querySelectorAll)',
  module: 'Module 4: DOM & Events',
  day: 22,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'The DOM (Document Object Model) is the live, tree-shaped JavaScript representation of your HTML page. Before you can change anything on a page you must select it. Today you learn what the DOM is and how to find elements with getElementById, querySelector, querySelectorAll and friends.',
  objectives: [
    'Explain what the DOM is, how it relates to HTML, and the node tree (parent, child, sibling)',
    'Select single elements with getElementById and querySelector',
    'Select multiple elements with querySelectorAll and loop over a NodeList',
    'Know the difference between a static NodeList and a live HTMLCollection (getElementsByClassName/TagName)',
    'Navigate the tree with parentElement, children, closest and sibling properties',
  ],
  theory: [
    {
      heading: 'What is the DOM?',
      content: "When the browser loads an HTML file, it reads the text and builds a **tree of objects** in memory. That tree is the **DOM (Document Object Model)**. JavaScript cannot touch your HTML file directly; it talks to this tree.\n\nAnalogy: the HTML file is the architect's blueprint; the DOM is the actual building. JavaScript is the interior designer working inside the building: moving furniture, painting walls. If you change the DOM, the page on screen updates immediately (the file on disk never changes).\n\nThe entry point is the global `document` object. `document.documentElement` is `<html>`, `document.head` and `document.body` are what you expect, and `document.title` is the tab title.",
      syntax: `<!-- HTML -->
<body>
  <h1>Shop</h1>
  <ul>
    <li>Pen</li>
    <li>Book</li>
  </ul>
</body>

// DOM tree
// document
//  └─ html
//      ├─ head
//      └─ body
//          ├─ h1  -> text 'Shop'
//          └─ ul
//              ├─ li -> text 'Pen'
//              └─ li -> text 'Book'`,
      points: [
        'Every tag becomes an **element node**; text inside becomes a **text node**',
        'Relationships: parent (ul is parent of li), children, siblings (the two li)',
        'The DOM is a browser API, not part of the JavaScript language itself (Node.js has no document)',
      ],
    },
    {
      heading: 'Where to Put Your Script',
      content: "JavaScript can only select elements that already exist in the DOM. If your `<script>` runs in the `<head>` before the body is parsed, `document.querySelector('h1')` returns `null`.\n\nSolutions:\n1. Put `<script src=\"app.js\"></script>` just before `</body>`\n2. Use `<script src=\"app.js\" defer></script>` in the head (recommended; runs after parsing)\n3. Use `type=\"module\"` scripts (deferred automatically)\n4. Wait for the `DOMContentLoaded` event",
      tip: 'If you see "Cannot read properties of null", the selector found nothing: check the spelling, the # or . prefix, and whether the script ran before the element existed.',
    },
    {
      heading: 'getElementById and querySelector',
      content: "**`document.getElementById('id')`** returns the element with that id, or `null`. Pass the id WITHOUT `#`. It is the fastest selector.\n\n**`document.querySelector('css selector')`** returns the **first** element matching any CSS selector, or `null`. You can use everything you learned in CSS: `#id`, `.class`, `tag`, `[attr]`, `ul > li`, `li:first-child`, `input[type=\"email\"]`...\n\nYou can also call `querySelector` on any element to search **only inside it**: `card.querySelector('.price')`.",
      syntax: `const title = document.getElementById('title');     // no #
const sameTitle = document.querySelector('#title');  // with #
const firstBtn = document.querySelector('.btn');     // first .btn
const emailInput = document.querySelector('form input[type="email"]');
const card = document.querySelector('.card');
const price = card.querySelector('.price');          // search inside card`,
      tip: 'Common mistake: `getElementById(\'#title\')` returns null because the # is treated as part of the id.',
    },
    {
      heading: 'querySelectorAll and NodeList',
      content: "**`document.querySelectorAll('selector')`** returns **all** matching elements as a **NodeList** (empty if none, never null).\n\nA NodeList looks like an array but is not one:\n- It has `length`, index access `list[0]` and `forEach`\n- It works with `for...of`\n- It does NOT have `map`, `filter`, `reduce`. Convert first: `Array.from(list)` or `[...list]`\n\nThe NodeList from `querySelectorAll` is **static**: a snapshot. Elements added later are not included automatically.",
      syntax: `const items = document.querySelectorAll('.item');
items.length;
items.forEach(item => console.log(item.textContent));
for (const item of items) { /* ... */ }
const texts = [...items].map(i => i.textContent); // convert to array`,
    },
    {
      heading: 'Older Methods: getElementsByClassName / TagName',
      content: "`getElementsByClassName('item')` and `getElementsByTagName('li')` return an **HTMLCollection**, which is **live**: it updates automatically when matching elements are added or removed. It has no `forEach` (use `for...of` or `Array.from`).\n\nIn modern code `querySelector` / `querySelectorAll` are preferred because they accept any CSS selector and behave predictably. You will still see the older methods in existing projects.",
      syntax: `const live = document.getElementsByClassName('item'); // HTMLCollection (live)
const snap = document.querySelectorAll('.item');        // NodeList (static)
// after adding a new .item element:
// live.length increases, snap.length stays the same`,
    },
    {
      heading: 'Traversing the DOM',
      content: "Once you have one element, you can move around the tree:\n\n- `el.parentElement` - the parent\n- `el.children` - child elements (HTMLCollection)\n- `el.firstElementChild`, `el.lastElementChild`\n- `el.nextElementSibling`, `el.previousElementSibling`\n- `el.closest('selector')` - nearest ancestor (or itself) matching a selector; very useful in event handling\n- `el.matches('selector')` - does this element match? true/false\n\nAvoid `childNodes`, `firstChild` and `nextSibling` for elements: they include whitespace **text nodes**.",
      syntax: `const li = document.querySelector('li');
li.parentElement;          // <ul>
li.nextElementSibling;     // next <li>
li.closest('.card');       // the card containing this li
li.matches('.active');     // true/false`,
    },
  ],
  examples: [
    {
      title: 'Select by id, class and CSS selector',
      scenario: 'A product page needs the title, the first price and the email input. Select each and highlight what was found when the student clicks a button.',
      steps: [
        'Create index.html with a heading (id="title"), two .price elements and a form',
        'In the script, select them with getElementById and querySelector',
        'On button click, add an outline to each selected element and print its text',
        'Click Run, then click "Find elements"',
      ],
      code: `const title = document.getElementById('title');
const firstPrice = document.querySelector('.price');
const email = document.querySelector('form input[type="email"]');
const missing = document.querySelector('.does-not-exist');

console.log(title.textContent);      // Wireless Mouse
console.log(firstPrice.textContent); // Rs 499
console.log(email.placeholder);      // you@mail.com
console.log(missing);                // null`,
      playground: {
        html: `<h1 id="title">Wireless Mouse</h1>
<p class="price">Rs 499</p>
<p class="price old">Rs 799</p>
<form>
  <input type="text" placeholder="Your name">
  <input type="email" placeholder="you@mail.com">
</form>
<button id="find">Find elements</button>
<pre id="out"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.found { outline: 3px solid orange; outline-offset: 2px; }
.old { text-decoration: line-through; color: gray; }
pre { background: #f4f4f4; padding: 8px; }`,
        js: `const out = document.getElementById('out');

document.getElementById('find').addEventListener('click', () => {
  const title = document.getElementById('title');
  const firstPrice = document.querySelector('.price');
  const email = document.querySelector('form input[type="email"]');
  const missing = document.querySelector('.does-not-exist');

  [title, firstPrice, email].forEach(el => el.classList.add('found'));

  out.textContent =
    'title: ' + title.textContent + '\\n' +
    'first .price: ' + firstPrice.textContent + '\\n' +
    'email placeholder: ' + email.placeholder + '\\n' +
    'missing: ' + missing;
  console.log('Selected 3 elements, missing =', missing);
});`,
      },
      result: 'After clicking "Find elements": the heading, the first price (Rs 499) and the email input get an orange outline, and the box shows "title: Wireless Mouse", "first .price: Rs 499", "email placeholder: you@mail.com", "missing: null". The second price is NOT outlined because querySelector returns only the first match.',
      explanation: 'getElementById takes the id without #. querySelector takes any CSS selector and returns the first match, so only "Rs 499" is chosen. A selector that matches nothing returns null - calling a method on it would throw, which is why you should check for null on optional elements.',
    },
    {
      title: 'querySelectorAll: Loop and Convert to Array',
      scenario: 'A cart lists items with data-price attributes. Select all items, highlight them one by one and calculate the total using an array method.',
      steps: [
        'Create a <ul> of <li class="item" data-price="...">',
        'Select all with querySelectorAll(\'.item\')',
        'Use forEach to number each item',
        'Convert to an array with [...items] and reduce to get the total',
        'Click "Calculate total"',
      ],
      code: `const items = document.querySelectorAll('.item');
console.log(items.length);            // 3
items.forEach((li, i) => {
  li.textContent = (i + 1) + '. ' + li.textContent;
});
const total = [...items].reduce((sum, li) => sum + Number(li.dataset.price), 0);
console.log(total);                   // 1150`,
      playground: {
        html: `<h2>My Cart</h2>
<ul id="cart">
  <li class="item" data-price="250">Notebook</li>
  <li class="item" data-price="400">Water bottle</li>
  <li class="item" data-price="500">Backpack</li>
</ul>
<button id="calc">Calculate total</button>
<p id="total">Total: ?</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.item { padding: 4px 8px; margin: 4px 0; border-left: 4px solid transparent; }
.item.checked { border-color: seagreen; background: #e8f6ee; }
#total { font-weight: bold; font-size: 1.2rem; }`,
        js: `document.getElementById('calc').addEventListener('click', () => {
  const items = document.querySelectorAll('.item');
  console.log('NodeList length:', items.length);

  items.forEach(li => li.classList.add('checked'));

  const total = [...items].reduce((sum, li) => sum + Number(li.dataset.price), 0);
  document.getElementById('total').textContent = 'Total: Rs ' + total;
  console.log('Has map?', typeof items.map, '| Array has map?', typeof [...items].map);
});`,
      },
      result: 'Clicking "Calculate total" highlights all three items in green and shows "Total: Rs 1150". The console prints "NodeList length: 3" and "Has map? undefined | Array has map? function".',
      explanation: 'querySelectorAll returns a NodeList, which supports forEach but not map/reduce. Spreading it into an array ([...items]) unlocks every array method. dataset.price reads the data-price attribute as a string, so Number() converts it before adding.',
    },
    {
      title: 'Live HTMLCollection vs Static NodeList',
      scenario: 'Prove the difference between getElementsByClassName (live) and querySelectorAll (static) by adding new elements with a button.',
      steps: [
        'Create a list with two .task items',
        'Store both a live collection and a static NodeList at page load',
        'On each click, add a new .task item',
        'Display both lengths after each click',
        'Click "Add task" a few times',
      ],
      code: `const live = document.getElementsByClassName('task');  // HTMLCollection
const snapshot = document.querySelectorAll('.task');    // NodeList

// add a new <li class="task"> ...
console.log(live.length);     // 3 (updated automatically)
console.log(snapshot.length); // 2 (still the old snapshot)`,
      playground: {
        html: `<ul id="list">
  <li class="task">Task 1</li>
  <li class="task">Task 2</li>
</ul>
<button id="add">Add task</button>
<p id="info"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#info { background: #fff8e1; padding: 8px; border-radius: 6px; }`,
        js: `const live = document.getElementsByClassName('task');
const snapshot = document.querySelectorAll('.task');
const info = document.getElementById('info');

function show() {
  info.textContent = 'Live HTMLCollection: ' + live.length + ' | Static NodeList: ' + snapshot.length;
}
show();

document.getElementById('add').addEventListener('click', () => {
  const li = document.createElement('li');
  li.className = 'task';
  li.textContent = 'Task ' + (live.length + 1);
  document.getElementById('list').append(li);
  show();
  console.log('live =', live.length, 'snapshot =', snapshot.length);
});`,
      },
      result: 'Initially: "Live HTMLCollection: 2 | Static NodeList: 2". After one click a "Task 3" item appears and the text becomes "Live HTMLCollection: 3 | Static NodeList: 2". Each further click increases only the live count.',
      explanation: 'getElementsByClassName returns a live collection that re-checks the DOM whenever you read it. querySelectorAll took a snapshot when it ran, so it never sees new elements unless you call it again. (Creating elements is covered properly on Day 24.)',
    },
    {
      title: 'Traversing with closest, parentElement and siblings',
      scenario: 'Each product card has a "Details" button. When clicked, use traversal (not ids) to find the card, its name and the next card.',
      steps: [
        'Create three .card divs, each with an h3 and a button',
        'Select all buttons with querySelectorAll and add a click listener to each',
        'Inside the listener, use btn.closest(\'.card\') to get the card',
        'Use card.querySelector(\'h3\') and card.nextElementSibling',
        'Click any "Details" button',
      ],
      code: `btn.closest('.card');                 // the card containing the button
card.querySelector('h3').textContent; // name inside that card
card.nextElementSibling;              // the next card or null
btn.parentElement;                    // direct parent`,
      playground: {
        html: `<div class="cards">
  <div class="card"><h3>Laptop</h3><button class="details">Details</button></div>
  <div class="card"><h3>Phone</h3><button class="details">Details</button></div>
  <div class="card"><h3>Tablet</h3><button class="details">Details</button></div>
</div>
<p id="msg">Click a Details button</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.cards { display: flex; gap: 12px; flex-wrap: wrap; }
.card { border: 1px solid #ccc; border-radius: 8px; padding: 12px; min-width: 120px; }
.card.selected { border-color: royalblue; box-shadow: 0 0 0 3px #c7d7ff; }
#msg { margin-top: 12px; font-weight: bold; }`,
        js: `const buttons = document.querySelectorAll('.details');
const msg = document.getElementById('msg');

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.card').forEach(c => c.classList.remove('selected'));

    const card = btn.closest('.card');
    card.classList.add('selected');

    const name = card.querySelector('h3').textContent;
    const next = card.nextElementSibling;
    const nextName = next ? next.querySelector('h3').textContent : 'none (last card)';

    msg.textContent = 'Selected: ' + name + ' | Next card: ' + nextName;
    console.log(btn.parentElement === card); // true
  });
});`,
      },
      result: 'Clicking Details on "Phone" outlines the Phone card in blue and shows "Selected: Phone | Next card: Tablet". Clicking on "Tablet" shows "Next card: none (last card)". The console logs true each time.',
      explanation: 'closest walks UP the tree from the button to the nearest .card. querySelector on the card searches only inside that card, so the same code works for every card without ids. nextElementSibling returns null for the last card, so we check before using it.',
    },
  ],
  interview: [
    { q: 'What is the DOM?', a: 'The Document Object Model is a tree of objects the browser builds from HTML. Each element, attribute and text becomes a node. JavaScript reads and changes the page through this API; changes are reflected on screen immediately.', level: 'Easy' },
    { q: 'Is the DOM part of JavaScript?', a: 'No. The DOM is a Web API provided by the browser. JavaScript (the language) can use it in browsers; Node.js has no document object by default.', level: 'Medium' },
    { q: 'Difference between getElementById and querySelector?', a: 'getElementById takes only an id (without #) and is slightly faster. querySelector takes any CSS selector and returns the first match. Both return null when nothing matches.', level: 'Easy' },
    { q: 'What does querySelectorAll return? Can you call map on it?', a: 'A static NodeList. It supports length, indexing, forEach and for...of, but not map/filter/reduce. Convert with Array.from(list) or [...list].', level: 'Easy' },
    { q: 'What is the output if there is no element with class "x"?\nconsole.log(document.querySelector(".x"));\nconsole.log(document.querySelectorAll(".x").length);', a: 'null then 0. querySelector returns null when nothing matches; querySelectorAll returns an empty NodeList.', level: 'Easy' },
    { q: 'Difference between HTMLCollection and NodeList?', a: 'HTMLCollection (from getElementsByClassName/TagName, children) is live and contains only elements. NodeList from querySelectorAll is static and has forEach. childNodes returns a live NodeList that can include text nodes.', level: 'Medium' },
    { q: 'Page has <li class="a">1</li><li class="a">2</li>.\nconst live = document.getElementsByClassName("a");\nconst stat = document.querySelectorAll(".a");\n// a third li.a is appended\nconsole.log(live.length, stat.length);', a: '3 2. The live HTMLCollection reflects the new element; the static NodeList is a snapshot taken earlier.', level: 'Hard' },
    { q: 'Why might document.querySelector("button") return null even though the button exists in the HTML?', a: 'The script ran before the button was parsed (script in <head> without defer), or the selector is misspelled. Fix with defer, placing the script at the end of body, or DOMContentLoaded.', level: 'Medium' },
    { q: 'What does element.closest(selector) do?', a: 'Starting from the element itself, walks up the ancestors and returns the first one matching the selector, or null. Commonly used in event delegation to find the card/row containing the clicked element.', level: 'Medium' },
    { q: 'Difference between children and childNodes?', a: 'children returns only element nodes (HTMLCollection). childNodes returns all nodes including text (whitespace) and comment nodes (NodeList).', level: 'Medium' },
    { q: 'How do you select an input with name="email" inside a form with id "signup"?', a: 'document.querySelector(\'#signup input[name="email"]\') or document.getElementById("signup").elements.email.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a page with an h1, three paragraphs (one with class "intro") and a button. On button click, log the h1 text, the .intro text and the number of paragraphs.',
      hint: 'getElementById / querySelector / querySelectorAll(\'p\').length.',
      solution: `<!-- HTML -->
<h1 id="heading">Welcome</h1>
<p class="intro">Intro text</p>
<p>Second</p>
<p>Third</p>
<button id="btn">Inspect</button>

<script>
document.getElementById('btn').addEventListener('click', () => {
  console.log(document.getElementById('heading').textContent);
  console.log(document.querySelector('.intro').textContent);
  console.log(document.querySelectorAll('p').length);
});
</script>`,
    },
    {
      task: 'Given a list of 5 <li> elements, use querySelectorAll and a loop to make every even-numbered item (2nd, 4th) bold.',
      hint: 'forEach((li, i) => { if (i % 2 === 1) li.style.fontWeight = "bold"; }). Or use the CSS selector li:nth-child(even).',
      solution: `<ul>
  <li>One</li><li>Two</li><li>Three</li><li>Four</li><li>Five</li>
</ul>
<script>
document.querySelectorAll('li:nth-child(even)').forEach(li => {
  li.style.fontWeight = 'bold';
});
</script>`,
    },
    {
      task: 'Select all links (<a>) on a page and log an array of their href values using map.',
      hint: 'Convert the NodeList to an array first.',
      solution: `<a href="https://example.com">Example</a>
<a href="https://developer.mozilla.org">MDN</a>
<script>
const hrefs = Array.from(document.querySelectorAll('a')).map(a => a.href);
console.log(hrefs);
</script>`,
    },
    {
      task: 'In a table of students, each row has a "Show" button. When clicked, show the name from the first cell of THAT row using closest(\'tr\').',
      hint: 'btn.closest("tr").querySelector("td").textContent.',
      solution: `<table>
  <tr><td>Asha</td><td><button class="show">Show</button></td></tr>
  <tr><td>Ravi</td><td><button class="show">Show</button></td></tr>
</table>
<p id="out"></p>
<script>
document.querySelectorAll('.show').forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.closest('tr').querySelector('td').textContent;
    document.getElementById('out').textContent = 'You picked ' + name;
  });
});
</script>`,
    },
  ],
  quiz: [
    { question: 'What does document.getElementById("#menu") return if the element is <nav id="menu">?', options: ['The nav element', 'An empty NodeList', 'null', 'An error'], answer: 2, explanation: 'getElementById expects the id without #, so it looks for id "#menu" and finds nothing.' },
    { question: 'Which method returns ALL elements matching a CSS selector?', options: ['querySelector', 'querySelectorAll', 'getElementById', 'closest'], answer: 1, explanation: 'querySelectorAll returns a NodeList of every match.' },
    { question: 'Which of these works directly on a NodeList from querySelectorAll?', options: ['forEach', 'map', 'filter', 'reduce'], answer: 0, explanation: 'NodeList has forEach; convert to an array for map/filter/reduce.' },
    { question: 'Which collection updates automatically when new matching elements are added?', options: ['NodeList from querySelectorAll', 'An array from Array.from', 'The result of querySelector', 'HTMLCollection from getElementsByClassName'], answer: 3, explanation: 'HTMLCollections are live.' },
    { question: 'What does btn.closest(".card") do?', options: ['Finds the nearest .card ancestor (or btn itself)', 'Finds the next sibling .card', 'Finds the first .card child', 'Removes the card'], answer: 0, explanation: 'closest walks up the DOM tree looking for a match.' },
  ],
};
