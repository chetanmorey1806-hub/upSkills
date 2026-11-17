export default {
  id: 'day-24-dom-create-append-remove',
  title: 'Creating, Appending and Removing Elements',
  module: 'Module 4: DOM & Events',
  day: 24,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Real apps build UI from data: a list of products, chat messages, to-do items. Today you learn to create elements with createElement, insert them with append/prepend/before/after/insertAdjacentHTML, render lists from arrays efficiently with DocumentFragment, and remove or replace elements.',
  objectives: [
    'Create elements and text with document.createElement and set their content and attributes',
    'Insert nodes with append, prepend, before, after, appendChild and insertBefore',
    'Use insertAdjacentHTML and template strings safely for trusted markup',
    'Render a list from an array of objects and batch inserts with DocumentFragment',
    'Remove, replace and clone elements (remove, replaceWith, cloneNode, replaceChildren)',
  ],
  theory: [
    {
      heading: 'Creating Elements',
      content: "`document.createElement('tag')` creates a new element **in memory**. It is not visible until you attach it to the page.\n\nThink of it like building a piece of LEGO on your desk: you can add color, stickers and text first (set textContent, className, attributes), and only then snap it onto the model (append it to the DOM).\n\nYou can also create a plain text node with `document.createTextNode('text')`, but setting `textContent` is usually simpler.",
      syntax: `const li = document.createElement('li');   // <li></li> (not on page yet)
li.textContent = 'Buy milk';
li.className = 'task';
li.dataset.id = '1';
li.setAttribute('title', 'Task 1');
document.querySelector('ul').append(li);   // now visible`,
    },
    {
      heading: 'Inserting Elements',
      content: "Modern methods (accept elements AND strings, and multiple arguments):\n- `parent.append(a, b)` - add at the **end** inside parent\n- `parent.prepend(a)` - add at the **start** inside parent\n- `el.before(a)` - insert as a sibling **before** el\n- `el.after(a)` - insert as a sibling **after** el\n\nOlder methods you will still see:\n- `parent.appendChild(node)` - one node only, returns it\n- `parent.insertBefore(newNode, referenceNode)`\n\n**Important:** a node can only be in one place. Appending an element that is already in the DOM **moves** it; it does not copy it.",
      syntax: `const list = document.querySelector('#list');
list.append(newItem);              // last child
list.prepend(firstItem);           // first child
list.append('plain text', anotherLi); // strings become text nodes
existingItem.before(itemAbove);
existingItem.after(itemBelow);`,
      tip: 'To duplicate an element, use `el.cloneNode(true)` (true = deep: include children). Appending the original twice just moves it.',
    },
    {
      heading: 'insertAdjacentHTML and Template Strings',
      content: "`el.insertAdjacentHTML(position, htmlString)` parses an HTML string and inserts it WITHOUT destroying the existing children (unlike `innerHTML +=` which re-creates everything and loses event listeners and input values).\n\nPositions:\n- `'beforebegin'` - before the element\n- `'afterbegin'` - inside, before first child\n- `'beforeend'` - inside, after last child (most common)\n- `'afterend'` - after the element\n\nIt is convenient for building cards with template literals, but like innerHTML it parses HTML, so **never** insert raw user input. For user text, create elements and use textContent, or escape the text first.",
      syntax: `list.insertAdjacentHTML('beforeend', '<li class="task">New task</li>');

// Avoid: list.innerHTML += '<li>...</li>'; (rebuilds whole list)`,
    },
    {
      heading: 'Rendering Lists from Data + DocumentFragment',
      content: "The most common DOM pattern: you have an **array of data** and you need one element per item.\n\n1. Loop over the array (forEach / map)\n2. Create an element per item and fill it\n3. Add each to the container\n\nEvery insertion into the live page can cause the browser to recalculate layout. For many items, build them inside a **DocumentFragment** (an invisible, lightweight container) and append the fragment once. Alternatively, `container.replaceChildren(...elements)` clears and inserts in one call.\n\nThis \"data -> render\" idea is exactly what React automates later.",
      syntax: `const products = [{ name: 'Pen', price: 10 }, { name: 'Bag', price: 500 }];
const fragment = document.createDocumentFragment();
products.forEach(p => {
  const li = document.createElement('li');
  li.textContent = p.name + ' - Rs ' + p.price;
  fragment.append(li);
});
list.append(fragment); // one DOM update

// or: list.replaceChildren(...products.map(makeLi));`,
    },
    {
      heading: 'Removing, Replacing and Clearing',
      content: "- `el.remove()` - removes the element from the DOM (modern, simple)\n- `parent.removeChild(child)` - older way\n- `oldEl.replaceWith(newEl)` - swap one element for another\n- `parent.replaceChildren()` - with no arguments, removes all children (fast, clean way to clear)\n- `parent.innerHTML = ''` - also clears, commonly seen\n\nA removed element still exists in memory while a variable references it, so you can re-insert it later.",
      syntax: `document.querySelector('.ad-banner').remove();
oldCard.replaceWith(newCard);
list.replaceChildren();                // clear the list
const copy = card.cloneNode(true);     // deep clone`,
    },
  ],
  examples: [
    {
      title: 'Add and Remove Items in a Shopping List',
      scenario: 'The user types an item and clicks Add. Each new <li> gets its own Delete button that removes only that item.',
      steps: [
        'Create an input, an Add button and an empty <ul>',
        'On Add: createElement(\'li\'), set textContent from the input',
        'Create a Delete button, add a click listener that calls li.remove()',
        'append the button to the li and the li to the list; clear the input',
        'Add a few items and delete one',
      ],
      code: `function addItem(text) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = text;           // safe for user input

  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.addEventListener('click', () => li.remove());

  li.append(span, del);
  list.append(li);
}`,
      playground: {
        html: `<h2>Shopping List</h2>
<div class="row">
  <input id="item" placeholder="e.g. Milk">
  <button id="add">Add</button>
</div>
<ul id="list"></ul>
<p id="count">0 items</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.row { display: flex; gap: 8px; }
input { flex: 1; padding: 6px; min-width: 0; }
li { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
li button { background: #fee; border: 1px solid #f99; border-radius: 4px; cursor: pointer; }`,
        js: `const input = document.getElementById('item');
const list = document.getElementById('list');
const count = document.getElementById('count');

function updateCount() {
  const n = list.children.length;
  count.textContent = n + (n === 1 ? ' item' : ' items');
}

function addItem(text) {
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = text;

  const del = document.createElement('button');
  del.textContent = 'Delete';
  del.addEventListener('click', () => {
    li.remove();
    updateCount();
  });

  li.append(span, del);
  list.append(li);
  updateCount();
}

document.getElementById('add').addEventListener('click', () => {
  const text = input.value.trim();
  if (!text) return;
  addItem(text);
  input.value = '';
  input.focus();
});

addItem('Bread');
addItem('Eggs');`,
      },
      result: 'The list starts with "Bread" and "Eggs" (2 items). Typing "Milk" and clicking Add appends a new row at the bottom and the counter shows "3 items". Clicking Delete on any row removes just that row and updates the counter.',
      explanation: 'createElement builds the li in memory; append attaches span and button inside it, then attaches the li to the list. Each Delete button\'s listener closes over its own li variable, so li.remove() removes the correct row. textContent keeps user input safe.',
    },
    {
      title: 'Render Product Cards from an Array (DocumentFragment)',
      scenario: 'An array of product objects must be displayed as cards. A "Sort by price" button re-renders the grid in a new order.',
      steps: [
        'Create a products array of objects',
        'Write createCard(product) that returns a .card element',
        'Write render(list): build all cards in a DocumentFragment, then grid.replaceChildren(fragment)',
        'Call render on load and after sorting a copy of the array',
        'Click "Sort by price"',
      ],
      code: `function render(items) {
  const fragment = document.createDocumentFragment();
  items.forEach(p => fragment.append(createCard(p)));
  grid.replaceChildren(fragment); // clear + insert in one go
}`,
      playground: {
        html: `<button id="sort">Sort by price (low to high)</button>
<button id="reset">Original order</button>
<div id="grid" class="grid"></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 12px; margin-top: 12px; }
.card { border: 1px solid #ddd; border-radius: 8px; padding: 10px; text-align: center; }
.card img { width: 100%; height: auto; border-radius: 6px; background: #eee; }
.price { font-weight: bold; color: seagreen; }`,
        js: `const products = [
  { id: 1, name: 'Headphones', price: 1999 },
  { id: 2, name: 'Keyboard', price: 899 },
  { id: 3, name: 'Monitor', price: 8999 },
  { id: 4, name: 'Mouse', price: 499 },
];
const grid = document.getElementById('grid');

function createCard(p) {
  const card = document.createElement('div');
  card.className = 'card';
  card.dataset.id = p.id;

  const img = document.createElement('img');
  img.src = 'https://picsum.photos/seed/' + p.id + '/150/100';
  img.alt = p.name;
  img.width = 150;
  img.height = 100;

  const title = document.createElement('h4');
  title.textContent = p.name;

  const price = document.createElement('p');
  price.className = 'price';
  price.textContent = 'Rs ' + p.price;

  card.append(img, title, price);
  return card;
}

function render(items) {
  const fragment = document.createDocumentFragment();
  items.forEach(p => fragment.append(createCard(p)));
  grid.replaceChildren(fragment);
  console.log('Rendered:', items.map(p => p.name).join(', '));
}

document.getElementById('sort').addEventListener('click', () => {
  render([...products].sort((a, b) => a.price - b.price));
});
document.getElementById('reset').addEventListener('click', () => render(products));

render(products);`,
      },
      result: 'Four product cards appear in a responsive grid (Headphones, Keyboard, Monitor, Mouse). Clicking "Sort by price" re-renders them as Mouse (Rs 499), Keyboard, Headphones, Monitor. "Original order" restores the first order. The console logs the rendered order each time.',
      explanation: 'createCard turns one data object into one element. render builds all cards inside a DocumentFragment (off-screen) and replaceChildren clears the grid and inserts them in one DOM update. Sorting a copy ([...products]) keeps the original array order intact for the reset button.',
    },
    {
      title: 'Positions: prepend, before, after and insertAdjacentHTML',
      scenario: 'A notification feed: urgent messages go to the top, normal ones to the bottom, and a divider can be inserted after the first item. Visualise each insertion method.',
      steps: [
        'Create a #feed list with one existing item',
        '"Add urgent" uses feed.prepend(li)',
        '"Add normal" uses feed.insertAdjacentHTML(\'beforeend\', ...) with trusted markup',
        '"Add divider" uses firstItem.after(hr)',
        'Click the buttons in different orders',
      ],
      code: `feed.prepend(urgentLi);                                   // top
feed.insertAdjacentHTML('beforeend', '<li>Normal</li>');   // bottom
feed.firstElementChild.after(divider);                     // after first`,
      playground: {
        html: `<div class="btns">
  <button id="urgent">Add urgent (prepend)</button>
  <button id="normal">Add normal (insertAdjacentHTML)</button>
  <button id="divider">Add divider after first (after)</button>
</div>
<ul id="feed">
  <li>Welcome to the feed</li>
</ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.btns { display: flex; flex-wrap: wrap; gap: 8px; }
#feed { padding-left: 18px; }
#feed li { padding: 4px 0; }
.urgent { color: crimson; font-weight: bold; }
.divider { list-style: none; border-top: 2px dashed #aaa; margin: 6px 0; }`,
        js: `const feed = document.getElementById('feed');
let n = 0;

document.getElementById('urgent').addEventListener('click', () => {
  const li = document.createElement('li');
  li.className = 'urgent';
  li.textContent = 'Urgent #' + (++n);
  feed.prepend(li);
});

document.getElementById('normal').addEventListener('click', () => {
  // trusted, app-generated markup only (no user input)
  feed.insertAdjacentHTML('beforeend', '<li>Normal #' + (++n) + '</li>');
});

document.getElementById('divider').addEventListener('click', () => {
  const first = feed.firstElementChild;
  if (!first) return;
  const hr = document.createElement('li');
  hr.className = 'divider';
  first.after(hr);
  console.log('Items now:', feed.children.length);
});`,
      },
      result: '"Add urgent" puts a red bold "Urgent #n" item at the TOP of the list; "Add normal" adds "Normal #n" at the BOTTOM; "Add divider" inserts a dashed line right after the current first item. The existing items stay in place each time.',
      explanation: 'prepend inserts as the first child, insertAdjacentHTML("beforeend") parses and appends without rebuilding existing items, and after() inserts a sibling immediately following the reference element. All three keep existing nodes (and their listeners) untouched.',
    },
    {
      title: 'Move vs Clone, Replace and Clear',
      scenario: 'Two boxes (Todo and Done). Show that appending an existing element moves it, cloneNode copies it, replaceWith swaps it and replaceChildren clears a container.',
      steps: [
        'Create two lists: #todo with items and #done empty',
        '"Move first" appends todo\'s first item into done (it moves)',
        '"Clone first" appends todo.firstElementChild.cloneNode(true) (a copy)',
        '"Replace first" swaps the first todo item with a new element',
        '"Clear done" calls done.replaceChildren()',
      ],
      code: `done.append(todo.firstElementChild);            // MOVES it
done.append(todo.firstElementChild.cloneNode(true)); // copies it
todo.firstElementChild.replaceWith(newLi);      // swaps
done.replaceChildren();                         // clears`,
      playground: {
        html: `<div class="cols">
  <div><h3>Todo</h3><ul id="todo"><li>Learn DOM</li><li>Practice</li><li>Build project</li></ul></div>
  <div><h3>Done</h3><ul id="done"></ul></div>
</div>
<div class="btns">
  <button id="move">Move first</button>
  <button id="clone">Clone first</button>
  <button id="replace">Replace first</button>
  <button id="clear">Clear done</button>
</div>
<p id="status"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.cols { display: flex; gap: 24px; flex-wrap: wrap; }
.cols > div { flex: 1; min-width: 140px; border: 1px solid #ddd; border-radius: 8px; padding: 0 12px; }
.btns { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.new { color: darkorange; }`,
        js: `const todo = document.getElementById('todo');
const done = document.getElementById('done');
const statusEl = document.getElementById('status');

function report(action) {
  statusEl.textContent = action + ' | Todo: ' + todo.children.length + ', Done: ' + done.children.length;
  console.log(statusEl.textContent);
}

document.getElementById('move').addEventListener('click', () => {
  if (todo.firstElementChild) done.append(todo.firstElementChild);
  report('Moved');
});
document.getElementById('clone').addEventListener('click', () => {
  if (todo.firstElementChild) done.append(todo.firstElementChild.cloneNode(true));
  report('Cloned');
});
document.getElementById('replace').addEventListener('click', () => {
  if (!todo.firstElementChild) return;
  const li = document.createElement('li');
  li.className = 'new';
  li.textContent = 'Replaced item';
  todo.firstElementChild.replaceWith(li);
  report('Replaced');
});
document.getElementById('clear').addEventListener('click', () => {
  done.replaceChildren();
  report('Cleared');
});`,
      },
      result: '"Move first" moves "Learn DOM" from Todo to Done (Todo: 2, Done: 1). "Clone first" copies the current first Todo item into Done while it also stays in Todo. "Replace first" swaps the first Todo item for an orange "Replaced item". "Clear done" empties the Done list.',
      explanation: 'A DOM node has exactly one parent, so append on an existing node moves it. cloneNode(true) creates an independent deep copy (note: event listeners are not cloned). replaceWith swaps in place and replaceChildren() with no arguments removes every child.',
    },
  ],
  interview: [
    { q: 'How do you create a new element and add it to the page?', a: 'const el = document.createElement("div"); set its content/attributes (el.textContent = "Hi"); then insert it with parent.append(el) (or prepend/before/after/appendChild).', level: 'Easy' },
    { q: 'Difference between append and appendChild?', a: 'append accepts multiple nodes and strings and returns undefined. appendChild accepts exactly one Node (no strings) and returns the appended node. append is the modern choice.', level: 'Medium' },
    { q: 'What happens if you append an element that is already in the DOM somewhere else?', a: 'It is moved, not copied: a node can have only one parent. Use cloneNode(true) to copy.', level: 'Medium' },
    { q: 'Page: <ul id="a"><li id="x">X</li></ul><ul id="b"></ul>\nconst x = document.getElementById("x");\ndocument.getElementById("b").append(x);\nconsole.log(document.getElementById("a").children.length, document.getElementById("b").children.length);', a: '0 1. The li was moved from list a to list b.', level: 'Medium' },
    { q: 'Why is "container.innerHTML += newHtml" in a loop a bad idea?', a: 'Each time it serializes and re-parses ALL existing content, which is slow, destroys existing elements (losing event listeners, focus and input values) and can introduce XSS if any part is user input. Use append, insertAdjacentHTML or a DocumentFragment.', level: 'Medium' },
    { q: 'What is a DocumentFragment and why use it?', a: 'A lightweight container not part of the live DOM. You append many nodes to it, then insert the fragment once; its children move into the DOM in a single operation, reducing reflows.', level: 'Medium' },
    { q: 'How do you remove an element? How do you remove all children?', a: 'el.remove() (or parent.removeChild(el)). Clear all children with parent.replaceChildren() or parent.innerHTML = "" (or loop while firstChild removeChild).', level: 'Easy' },
    { q: 'What are the four positions of insertAdjacentHTML?', a: '"beforebegin" (before the element), "afterbegin" (inside, first), "beforeend" (inside, last), "afterend" (after the element).', level: 'Medium' },
    { q: 'What is the output?\nconst d = document.createElement("div");\nd.textContent = "hi";\nconsole.log(document.body.contains(d));', a: 'false. createElement only creates the element in memory; it is not part of the document until appended.', level: 'Easy' },
    { q: 'Does cloneNode(true) copy event listeners added with addEventListener?', a: 'No. It copies the element, attributes and (with true) all descendants, but not listeners added via addEventListener. Inline onclick attributes are copied as attributes.', level: 'Hard' },
    { q: 'What is the output?\n<ul id="l"><li>1</li></ul>\nconst l = document.getElementById("l");\nl.append("two", document.createElement("li"));\nconsole.log(l.childNodes.length, l.children.length);', a: '3 2. append added a text node "two" and a new li. childNodes counts all nodes (li, text, li) = 3; children counts only elements = 2.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Given const fruits = ["Apple", "Mango", "Banana"], render them as <li> elements inside an empty <ul id="fruits"> using createElement and a loop.',
      hint: 'forEach -> createElement("li") -> textContent -> append.',
      solution: `<ul id="fruits"></ul>
<script>
const fruits = ['Apple', 'Mango', 'Banana'];
const ul = document.getElementById('fruits');
fruits.forEach(f => {
  const li = document.createElement('li');
  li.textContent = f;
  ul.append(li);
});
</script>`,
    },
    {
      task: 'Build a comment box: textarea + "Post" button. Each comment is added at the TOP of the comments list with the current time, and has a "x" button to remove it.',
      hint: 'Use prepend and new Date().toLocaleTimeString(). Use textContent for the comment text.',
      solution: `<textarea id="text" rows="3" placeholder="Write a comment"></textarea>
<button id="post">Post</button>
<div id="comments"></div>
<script>
const text = document.getElementById('text');
const comments = document.getElementById('comments');
document.getElementById('post').addEventListener('click', () => {
  const value = text.value.trim();
  if (!value) return;
  const div = document.createElement('div');
  const p = document.createElement('p');
  p.textContent = value;
  const time = document.createElement('small');
  time.textContent = new Date().toLocaleTimeString();
  const del = document.createElement('button');
  del.textContent = 'x';
  del.addEventListener('click', () => div.remove());
  div.append(p, time, del);
  comments.prepend(div);
  text.value = '';
});
</script>`,
    },
    {
      task: 'Create a table of students from an array of objects ({ name, marks }) with a header row, using createElement for table, tr, th and td.',
      hint: 'Build the header from Object.keys(students[0]).',
      solution: `<div id="out"></div>
<script>
const students = [{ name: 'Asha', marks: 88 }, { name: 'Ravi', marks: 75 }];
const table = document.createElement('table');
const header = document.createElement('tr');
Object.keys(students[0]).forEach(key => {
  const th = document.createElement('th');
  th.textContent = key;
  header.append(th);
});
table.append(header);
students.forEach(s => {
  const tr = document.createElement('tr');
  Object.values(s).forEach(v => {
    const td = document.createElement('td');
    td.textContent = v;
    tr.append(td);
  });
  table.append(tr);
});
document.getElementById('out').append(table);
</script>`,
    },
    {
      task: 'Add a "Duplicate" button that clones a .card (deep) and appends the copy below the original, changing the copy\'s heading to "Copy N".',
      hint: 'card.cloneNode(true), then copy.querySelector("h3").textContent = ...; card.after(copy) or container.append(copy).',
      solution: `<div id="cards"><div class="card"><h3>Original</h3><p>Card body</p></div></div>
<button id="dup">Duplicate</button>
<script>
let n = 0;
const original = document.querySelector('.card');
document.getElementById('dup').addEventListener('click', () => {
  const copy = original.cloneNode(true);
  copy.querySelector('h3').textContent = 'Copy ' + (++n);
  document.getElementById('cards').append(copy);
});
</script>`,
    },
  ],
  quiz: [
    { question: 'After `const p = document.createElement("p")`, is p visible on the page?', options: ['Yes, at the end of body', 'Yes, at the top of body', 'No, until you insert it with append or similar', 'Only after setting textContent'], answer: 2, explanation: 'createElement only creates the node in memory.' },
    { question: 'Which method inserts an element as the FIRST child of a parent?', options: ['parent.prepend(el)', 'parent.append(el)', 'parent.after(el)', 'parent.before(el)'], answer: 0, explanation: 'prepend inserts inside the parent at the start.' },
    { question: 'What does `el.remove()` do?', options: ['Hides the element with CSS', 'Removes only its children', 'Deletes the variable el', 'Removes the element from the DOM'], answer: 3, explanation: 'remove() detaches the element from its parent.' },
    { question: 'What is the main benefit of a DocumentFragment?', options: ['It makes elements invisible', 'It lets you insert many nodes in one DOM operation', 'It sanitizes HTML', 'It clones nodes automatically'], answer: 1, explanation: 'Build off-DOM, insert once to reduce reflows.' },
    { question: 'Which insertAdjacentHTML position adds content inside the element after its last child?', options: ['afterend', 'afterbegin', 'beforeend', 'beforebegin'], answer: 2, explanation: '"beforeend" = just before the closing tag, inside the element.' },
  ],
};
