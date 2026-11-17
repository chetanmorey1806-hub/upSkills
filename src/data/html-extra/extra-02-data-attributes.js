export default {
  id: 'extra-02-data-attributes',
  title: 'Custom Data Attributes (data-*) and the dataset API',
  module: 'Extra: Elements & Attributes',
  extraNo: 2,
  level: 'Beginner',
  duration: '1 hour',
  summary: 'data-* attributes let you store your own extra information on any HTML element in a valid, standard way. JavaScript reads it with element.dataset and CSS can select or display it.',
  objectives: [
    'Write valid custom data attributes with the data- prefix',
    'Read and write them in JavaScript with dataset and understand camelCase conversion',
    'Select and display data attributes from CSS with [data-*] and attr()',
    'Know when data-* is the right tool and when it is not',
  ],
  theory: [
    {
      heading: 'Why data-* exists',
      content: `Sometimes an element needs extra information that is not visible text: a product id, a price, a category, the state of a tab. Before HTML5, developers invented fake attributes like \`<li productid="42">\`. That is **invalid HTML** and could clash with future attributes.

HTML5 added a safe "pocket" for your own data: any attribute that starts with \`data-\`. Think of it like a sticky note you attach to an element: the browser ignores it for display, but your JavaScript and CSS can read it.`,
      syntax: `<li data-product-id="42" data-price="499" data-category="books">HTML Book</li>`,
    },
    {
      heading: 'Naming rules',
      content: `- Must start with \`data-\` followed by at least one character.
- Use lowercase letters, digits, hyphens (and dots/underscores are allowed but uncommon). No uppercase letters: HTML attribute names are lowercased anyway.
- The value is always a **string**. \`data-price="499"\` gives the string "499", not the number 499.
- You can put as many as you like on one element.`,
      tip: 'Need to store an object? Store JSON: data-config=\'{"theme":"dark"}\' and parse it with JSON.parse(el.dataset.config).',
    },
    {
      heading: 'Reading and writing with dataset',
      content: `Every element has a \`dataset\` object that holds all its data-* attributes. The names are converted from kebab-case to **camelCase**:
- \`data-price\` → \`el.dataset.price\`
- \`data-product-id\` → \`el.dataset.productId\`

Writing \`el.dataset.status = 'done'\` creates/updates \`data-status="done"\` in the HTML. \`delete el.dataset.status\` removes it. You can also use \`getAttribute('data-price')\` and \`setAttribute(...)\`.`,
      syntax: `const item = document.querySelector('li');
item.dataset.productId;          // "42"
Number(item.dataset.price) + 1;   // 500
item.dataset.inCart = 'true';     // adds data-in-cart="true"
delete item.dataset.category;     // removes data-category`,
    },
    {
      heading: 'Using data-* in CSS',
      content: `CSS can **select** elements by data attributes with attribute selectors, and can **show** the value with \`attr()\` inside the \`content\` of a pseudo-element.

This is very common for state: JavaScript changes \`data-state="open"\` and CSS reacts with \`[data-state="open"] { ... }\`.`,
      syntax: `[data-status="done"] { text-decoration: line-through; }
.badge::after { content: attr(data-count); }`,
    },
    {
      heading: 'When NOT to use data-*',
      content: `- Do not store secret data (passwords, tokens): anyone can view the page source.
- Do not use data-* when a real attribute exists: use \`disabled\`, \`hidden\`, \`href\`, \`aria-expanded\` etc.
- Text that users must read belongs in the content, not in a data attribute: screen readers do not read data-* values.
- For large data sets, keep data in JavaScript, not in hundreds of attributes.`,
    },
  ],
  examples: [
    {
      title: 'Product list with prices in data attributes',
      scenario: 'A shop list stores the price on each item. Clicking an item adds its price to a total.',
      steps: [
        'Create a <ul> with <li> items that have data-price and data-product-id',
        'Add a total paragraph',
        'In JS, listen for clicks and read dataset.price',
        'Convert the string to a number and update the total',
        'Click Run and click the items',
      ],
      code: `<ul id="products">
  <li data-product-id="p1" data-price="250">Notebook</li>
  <li data-product-id="p2" data-price="40">Pen</li>
</ul>
<script>
  li.dataset.price      // "250" (string)
  li.dataset.productId  // "p1"
</script>`,
      playground: {
        html: `<h3>Click products to add them</h3>
<ul id="products">
  <li data-product-id="p1" data-price="250">Notebook</li>
  <li data-product-id="p2" data-price="40">Pen</li>
  <li data-product-id="p3" data-price="120">Highlighter set</li>
</ul>
<p>Total: Rs <strong id="total">0</strong></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
li { cursor: pointer; padding: 6px; }
li:hover { background: #eef; }
li[data-in-cart="true"] { color: green; font-weight: bold; }`,
        js: `let total = 0;
document.getElementById('products').addEventListener('click', (e) => {
  const li = e.target.closest('li');
  if (!li) return;
  total += Number(li.dataset.price);
  li.dataset.inCart = 'true';
  document.getElementById('total').textContent = total;
  console.log('Added', li.dataset.productId, 'price', li.dataset.price, typeof li.dataset.price);
});`,
      },
      result: 'Clicking an item adds its price to the total and turns it green and bold. The console shows the product id, the price and "string".',
      explanation: 'dataset.price is a string, so Number() converts it before adding. Setting dataset.inCart creates data-in-cart="true", which the CSS attribute selector li[data-in-cart="true"] styles.',
    },
    {
      title: 'Tabs controlled by data-tab and data-state',
      scenario: 'Buttons say which panel they open using data-tab; CSS shows the active panel through data-state.',
      steps: [
        'Create buttons with data-tab="html|css|js"',
        'Create panels with matching data-panel values',
        'In JS, on click set data-state="active" on the correct panel and button',
        'Style [data-state="active"] in CSS',
        'Click Run and switch tabs',
      ],
      code: `<button data-tab="css">CSS</button>
<div data-panel="css" data-state="hidden">...</div>

[data-panel][data-state="hidden"] { display: none; }`,
      playground: {
        html: `<div class="tabs">
  <button data-tab="html" data-state="active">HTML</button>
  <button data-tab="css">CSS</button>
  <button data-tab="js">JS</button>
</div>
<div data-panel="html" data-state="active">HTML gives structure.</div>
<div data-panel="css">CSS gives style.</div>
<div data-panel="js">JS gives behaviour.</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
[data-panel] { display: none; padding: 12px; border: 1px solid #ccc; }
[data-panel][data-state="active"] { display: block; }
button[data-state="active"] { background: teal; color: white; }`,
        js: `const buttons = document.querySelectorAll('[data-tab]');
const panels = document.querySelectorAll('[data-panel]');
buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.tab;
    buttons.forEach((b) => delete b.dataset.state);
    panels.forEach((p) => {
      if (p.dataset.panel === name) p.dataset.state = 'active';
      else delete p.dataset.state;
    });
    btn.dataset.state = 'active';
    console.log('Active tab:', name);
  });
});`,
      },
      result: 'Only one panel is visible at a time; the matching button is highlighted teal.',
      explanation: 'The link between button and panel is data-tab = data-panel. JS only changes data-state; all visual work is done in CSS using attribute selectors. delete el.dataset.state removes the attribute.',
    },
    {
      title: 'Showing a data value with CSS attr()',
      scenario: 'Notification icons show an unread count stored in data-count without extra markup.',
      steps: [
        'Add spans with class="badge" and data-count',
        'Use .badge::after { content: attr(data-count) } in CSS',
        'Add a button that increases the count via dataset',
        'Click Run and press the button',
      ],
      code: `<span class="badge" data-count="3">Inbox</span>
.badge::after { content: attr(data-count); }`,
      playground: {
        html: `<span class="badge" id="inbox" data-count="3">Inbox</span>
<span class="badge" data-count="12">Updates</span>
<p><button id="add">New message</button></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.badge { display: inline-block; margin-right: 24px; position: relative; padding: 6px 10px; background: #eee; border-radius: 6px; }
.badge::after { content: attr(data-count); position: absolute; top: -8px; right: -12px; background: crimson; color: white; border-radius: 999px; font-size: 12px; padding: 2px 6px; }`,
        js: `document.getElementById('add').addEventListener('click', () => {
  const inbox = document.getElementById('inbox');
  inbox.dataset.count = Number(inbox.dataset.count) + 1;
  console.log('Inbox count is now', inbox.dataset.count);
});`,
      },
      result: 'Each badge shows a red bubble with its count. Clicking "New message" increases the Inbox bubble.',
      explanation: 'attr(data-count) reads the attribute value as text for the ::after content. Updating dataset.count updates the attribute, and CSS re-renders automatically.',
    },
  ],
  interview: [
    { q: 'What are data-* attributes?', a: 'Custom attributes, prefixed with data-, that let developers store private extra data on standard HTML elements in a valid way. The browser does not use them for rendering; scripts and CSS can read them.', level: 'Easy' },
    { q: 'How do you access data-user-id in JavaScript?', a: 'element.dataset.userId (kebab-case is converted to camelCase), or element.getAttribute("data-user-id").', level: 'Easy' },
    { q: 'What type of value does dataset return?', a: 'Always a string. Convert it with Number(), parseInt(), JSON.parse() or a comparison like === "true" when you need another type.', level: 'Easy' },
    { q: 'How do you remove a data attribute?', a: 'delete element.dataset.name or element.removeAttribute("data-name").', level: 'Medium' },
    { q: 'How can CSS use data attributes?', a: 'With attribute selectors like [data-state="open"] for styling, and with attr(data-x) inside the content property of ::before/::after to display the value.', level: 'Medium' },
    { q: 'Why not just invent an attribute like productid="5"?', a: 'It is invalid HTML, validators flag it, it may clash with a future standard attribute, and it has no dataset API support. data-productid is valid and future-proof.', level: 'Medium' },
    { q: 'Are data attributes good for storing sensitive information?', a: 'No. They are visible in page source and dev tools, so anyone can read or modify them. Always validate on the server.', level: 'Easy' },
    { q: 'Can screen readers read data-* attribute values?', a: 'No, they are not exposed to assistive technology. Important text must be in the content or in proper ARIA attributes.', level: 'Medium' },
    { q: 'How would you store an object in a data attribute?', a: 'Serialize it as JSON: data-config=\'{"a":1}\', then JSON.parse(el.dataset.config). Set it with el.dataset.config = JSON.stringify(obj).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create three color swatches with data-color values. Clicking a swatch changes the page background to that color.',
      hint: 'document.body.style.background = el.dataset.color',
      solution: `<button data-color="lightpink">Pink</button>
<button data-color="lightblue">Blue</button>
<button data-color="lightgreen">Green</button>
<script>
  document.querySelectorAll('[data-color]').forEach((b) => {
    b.addEventListener('click', () => {
      document.body.style.background = b.dataset.color;
    });
  });
</script>`,
    },
    {
      task: 'Make a to-do list where each item has data-done="false". Clicking toggles it to "true" and CSS strikes it through.',
      hint: 'li[data-done="true"] { text-decoration: line-through; }',
      solution: `<style>li[data-done="true"] { text-decoration: line-through; color: gray; }</style>
<ul id="todos">
  <li data-done="false">Learn data-*</li>
  <li data-done="false">Practice dataset</li>
</ul>
<script>
  document.getElementById('todos').addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    li.dataset.done = li.dataset.done === 'true' ? 'false' : 'true';
  });
</script>`,
    },
    {
      task: 'Show a tooltip-like label using ::after and attr(data-tip) when hovering a word.',
      hint: 'Show the ::after only on :hover.',
      solution: `<style>
  .tip { position: relative; border-bottom: 1px dotted; }
  .tip:hover::after { content: attr(data-tip); position: absolute; left: 0; top: 1.4em;
    background: #333; color: #fff; padding: 4px 8px; white-space: nowrap; border-radius: 4px; }
</style>
<p>Learn <span class="tip" data-tip="A markup language">HTML</span> first.</p>`,
    },
    {
      task: 'Store a JSON config on a div and log the parsed object.',
      hint: 'Use single quotes around the attribute value so you can use double quotes inside the JSON.',
      solution: `<div id="widget" data-config='{"theme":"dark","size":3}'>Widget</div>
<script>
  const cfg = JSON.parse(document.getElementById('widget').dataset.config);
  console.log(cfg.theme, cfg.size); // dark 3
</script>`,
    },
  ],
  quiz: [
    { question: 'Which is a valid custom data attribute?', options: ['dataPrice="10"', 'data-price="10"', 'price-data="10"', 'x-price="10"'], answer: 1, explanation: 'Custom data attributes must start with data-.' },
    { question: 'How do you read data-order-total in JavaScript?', options: ['el.dataset.order-total', 'el.data.orderTotal', 'el.dataset.orderTotal', 'el.dataset["order_total"]'], answer: 2, explanation: 'Hyphenated names are converted to camelCase on dataset.' },
    { question: 'What does el.dataset.qty return for data-qty="5"?', options: ['The number 5', 'undefined', 'true', 'The string "5"'], answer: 3, explanation: 'dataset values are always strings.' },
    { question: 'Which CSS shows the value of data-label inside an element?', options: ['::after { content: attr(data-label); }', '::after { content: data(label); }', '::after { content: var(data-label); }', '::after { text: attr(label); }'], answer: 0, explanation: 'attr() in the content property reads an attribute value as a string.' },
    { question: 'Which is NOT a good use for data-* attributes?', options: ['Storing a product id', 'Storing a UI state like data-state="open"', 'Storing a user password', 'Linking a tab button to a panel'], answer: 2, explanation: 'data-* values are visible to anyone; never store secrets in them.' },
  ],
};
