export default {
  id: 'day-09-description-and-nested-lists',
  title: 'Description Lists <dl>, <dt>, <dd> and Nested Lists',
  module: 'Module 2: Links, Images & Lists',
  day: 9,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Description lists pair terms with their descriptions, perfect for glossaries, FAQs and product specifications. Nested lists build hierarchies such as multi-level menus, outlines and folder trees.',
  objectives: [
    'Build description lists using <dl>, <dt> and <dd>',
    'Use multiple terms and multiple descriptions in a single group',
    'Create correctly nested lists inside <li> elements',
    'Mix ordered and unordered lists in a hierarchy',
    'Choose between <ul>, <ol> and <dl> for a given content type',
  ],
  theory: [
    {
      heading: 'Description list <dl>',
      content: "A **description list** (`<dl>`) represents a list of **name-value groups**. Think of a dictionary: a word, followed by its meaning.\n\n- `<dl>`: the description list container\n- `<dt>`: **description term** (the name, the word, the question)\n- `<dd>`: **description details** (the value, the definition, the answer)\n\nIn HTML4 it was called a \"definition list\". In HTML5 it is a \"description list\" because it is used for any key-value pairs, not only definitions.\n\nBy default, browsers show `<dt>` normally and `<dd>` indented on the next line.",
      syntax: '<dl>\n  <dt>HTML</dt>\n  <dd>The language that structures web pages.</dd>\n  <dt>CSS</dt>\n  <dd>The language that styles web pages.</dd>\n</dl>',
    },
    {
      heading: 'Real-world uses and grouping rules',
      content: "Great uses for `<dl>`:\n- **Glossaries** and dictionaries\n- **FAQs** (question in `<dt>`, answer in `<dd>`)\n- **Product specifications**: Brand / RAM / Storage\n- **Metadata**: Author, Published date, Category\n- **Contact details**: Phone, Email, Address\n\nGrouping rules:\n1. One term can have **several descriptions**: `<dt>Colour</dt><dd>Black</dd><dd>Blue</dd>`.\n2. Several terms can share **one description**: `<dt>Color</dt><dt>Colour</dt><dd>Spelling variants</dd>`.\n3. Direct children of `<dl>` must be `<dt>`/`<dd>` (or a `<div>` wrapping one complete group, useful for styling).\n4. `<dt>` holds short phrasing content (no headings). `<dd>` can contain paragraphs, lists, images.",
      tip: 'Do not use <dl> just to get indentation. Use it when the content truly is name-value pairs.',
    },
    {
      heading: 'Nested lists',
      content: "A **nested list** is a list inside a list item. It shows **hierarchy**: categories with sub-categories, chapters with sections, folders with files.\n\nThe key rule from Day 8: the inner list must be placed **inside an `<li>`**, right after that item's text, and **before** the closing `</li>`.\n\nBrowsers automatically change bullet style for deeper `<ul>` levels: disc, then circle, then square. Nested `<ol>`s restart at 1 unless you change it.\n\nYou can mix types freely: a `<ol>` of steps can contain a `<ul>` of options for one step.",
      syntax: '<ul>\n  <li>Fruits\n    <ul>\n      <li>Apple</li>\n      <li>Mango</li>\n    </ul>\n  </li>\n  <li>Vegetables</li>\n</ul>',
      tip: 'Common mistake: closing </li> before the inner list (<li>Fruits</li><ul>...</ul>). That puts the <ul> directly inside the outer <ul>, which is invalid.',
    },
    {
      heading: 'Choosing the right list',
      content: "Ask yourself:\n1. Is it a sequence where **order matters**? Use `<ol>`.\n2. Is it a collection where **order does not matter**? Use `<ul>`.\n3. Is it **pairs** of a name and its value/description? Use `<dl>`.\n4. Does it have **sub-levels**? Nest the right list inside an `<li>` (or inside a `<dd>`).\n\nAvoid nesting deeper than 3 levels: it becomes hard to read and to navigate with a screen reader.\n\nComing next (Day 10): HTML tables for real two-dimensional data.",
    },
  ],
  examples: [
    {
      title: 'Glossary of web terms',
      scenario: 'Create a glossary page for beginners.',
      steps: [
        'Create glossary.html',
        'Add a <dl> container',
        'Add a <dt> for each term followed by its <dd>',
        'Click Run',
      ],
      code: `<dl>
  <dt>Browser</dt>
  <dd>Software that displays web pages, e.g. Chrome or Firefox.</dd>
  <dt>Server</dt>
  <dd>A computer that stores websites and sends them to browsers.</dd>
  <dt>URL</dt>
  <dd>The address of a resource on the web.</dd>
</dl>`,
      playground: {
        html: `<h2>Web Glossary</h2>
<dl>
  <dt>Browser</dt>
  <dd>Software that displays web pages, e.g. Chrome or Firefox.</dd>
  <dt>Server</dt>
  <dd>A computer that stores websites and sends them to browsers.</dd>
  <dt>URL</dt>
  <dd>The address of a resource on the web.</dd>
</dl>`,
        css: `dt { font-weight: bold; margin-top: 8px; }`,
      },
      result: 'Each term appears in bold with its description indented on the line below.',
      explanation: '<dt> is the term, <dd> the description. The CSS only makes terms bold; by default the browser just indents <dd>.',
    },
    {
      title: 'Product specification sheet',
      scenario: 'Show smartphone specifications, including a spec with two values and a styled two-column layout.',
      steps: [
        'Create a <dl> with a class for styling',
        'Wrap each name-value group in a <div> (allowed in HTML5)',
        'Give "Colours" two <dd> values',
        'Add CSS grid to place names and values side by side',
        'Click Run',
      ],
      code: `<dl class="specs">
  <div><dt>Brand</dt><dd>Nova</dd></div>
  <div><dt>RAM</dt><dd>8 GB</dd></div>
  <div><dt>Storage</dt><dd>128 GB</dd></div>
  <div><dt>Colours</dt><dd>Midnight Black</dd><dd>Ocean Blue</dd></div>
</dl>`,
      playground: {
        html: `<h2>Nova X5 Specifications</h2>
<dl class="specs">
  <div><dt>Brand</dt><dd>Nova</dd></div>
  <div><dt>RAM</dt><dd>8 GB</dd></div>
  <div><dt>Storage</dt><dd>128 GB</dd></div>
  <div><dt>Battery</dt><dd>5000 mAh</dd></div>
  <div><dt>Colours</dt><dd>Midnight Black</dd><dd>Ocean Blue</dd></div>
</dl>`,
        css: `.specs { font-family: sans-serif; max-width: 360px; border: 1px solid #ddd; }
.specs div { display: grid; grid-template-columns: 120px 1fr; border-bottom: 1px solid #eee; padding: 6px 10px; }
.specs dt { font-weight: bold; color: #444; }
.specs dd { margin: 0; grid-column: 2; }`,
      },
      result: 'A neat two-column spec table: names on the left, values on the right; Colours shows two values stacked.',
      explanation: 'A <div> may wrap each dt/dd group inside <dl>, which makes styling rows easy. Multiple <dd> after one <dt> means the term has multiple values.',
    },
    {
      title: 'Multi-level category menu (nested lists)',
      scenario: 'An online store has categories with sub-categories.',
      steps: [
        'Create an outer <ul> of main categories',
        'Inside the Electronics <li>, after its text, add a nested <ul>',
        'Nest a third level under Mobiles',
        'Click Run and check the bullet styles',
      ],
      code: `<ul>
  <li>Electronics
    <ul>
      <li>Mobiles
        <ul>
          <li>Android</li>
          <li>iPhone</li>
        </ul>
      </li>
      <li>Laptops</li>
    </ul>
  </li>
  <li>Fashion
    <ul>
      <li>Men</li>
      <li>Women</li>
    </ul>
  </li>
</ul>`,
      playground: {
        html: `<ul id="menu">
  <li>Electronics
    <ul>
      <li>Mobiles
        <ul>
          <li>Android</li>
          <li>iPhone</li>
        </ul>
      </li>
      <li>Laptops</li>
    </ul>
  </li>
  <li>Fashion
    <ul>
      <li>Men</li>
      <li>Women</li>
    </ul>
  </li>
</ul>`,
        js: `document.querySelectorAll('#menu li').forEach(li => {
  let depth = 0, el = li.parentElement;
  while (el && el.id !== 'menu') { if (el.tagName === 'UL') depth++; el = el.parentElement; }
  console.log('level ' + (depth + 1) + ': ' + li.firstChild.textContent.trim());
});`,
      },
      result: 'Three levels with disc, circle and square bullets. The console lists each item with its level.',
      explanation: 'Each nested <ul> sits inside the <li> it belongs to. Browsers automatically vary bullet style per level so the hierarchy is visible.',
    },
    {
      title: 'Mixed nesting: ordered steps with options, and an FAQ',
      scenario: 'Installation instructions where one step has choices, followed by an FAQ in a description list.',
      steps: [
        'Write an <ol> of steps',
        'Inside step 2, nest a <ul> of options',
        'Add an FAQ using <dl> whose <dd> contains a list',
        'Click Run',
      ],
      code: `<ol>
  <li>Download VS Code.</li>
  <li>Choose your installer:
    <ul>
      <li>Windows: .exe</li>
      <li>macOS: .dmg</li>
      <li>Linux: .deb or .rpm</li>
    </ul>
  </li>
  <li>Run the installer.</li>
</ol>

<dl>
  <dt>Is VS Code free?</dt>
  <dd>Yes, it is free and open source.</dd>
</dl>`,
      playground: {
        html: `<h2>Install VS Code</h2>
<ol>
  <li>Download VS Code.</li>
  <li>Choose your installer:
    <ul>
      <li>Windows: .exe</li>
      <li>macOS: .dmg</li>
      <li>Linux: .deb or .rpm</li>
    </ul>
  </li>
  <li>Run the installer.</li>
  <li>Install the Live Server extension.</li>
</ol>
<h2>FAQ</h2>
<dl>
  <dt>Is VS Code free?</dt>
  <dd>Yes, it is free and open source.</dd>
  <dt>Which extensions should a beginner install?</dt>
  <dd>
    <ul>
      <li>Live Server</li>
      <li>Prettier</li>
    </ul>
  </dd>
</dl>`,
        css: `dt { font-weight: bold; margin-top: 10px; }`,
      },
      result: 'Numbered steps 1-4 with bulleted options under step 2, then an FAQ with bold questions and indented answers, one of which is a bulleted list.',
      explanation: 'Lists can be mixed: an <ol> can contain a <ul> inside an <li>. <dd> can contain block content like lists. Numbering continues correctly after the nested list.',
    },
  ],
  interview: [
    { q: 'What is a description list and which tags does it use?', a: 'A list of name-value groups. <dl> is the container, <dt> is the term/name, and <dd> is the description/value.', level: 'Easy' },
    { q: 'What do dt and dd stand for?', a: 'dt = description term, dd = description details (in HTML4: definition term and definition description).', level: 'Easy' },
    { q: 'Can a <dt> have more than one <dd>?', a: 'Yes. One term can have multiple descriptions, and multiple consecutive <dt> elements can share one <dd>.', level: 'Medium' },
    { q: 'Can you wrap dt/dd pairs in a div inside dl?', a: 'Yes, HTML5 (WHATWG) allows a <div> to wrap each complete group of <dt> and <dd> elements, which helps with styling. Nothing else may be a direct child.', level: 'Hard' },
    { q: 'Give three real-world use cases of a description list.', a: 'Glossaries, FAQs, product specifications, metadata (author/date), contact details, and key-value summaries like order details.', level: 'Easy' },
    { q: 'How do you create a nested list correctly?', a: 'Place the inner <ul>/<ol> inside the parent <li>, after its text and before </li>.', level: 'Easy' },
    { q: 'What is wrong with <ul><li>A</li><ul><li>B</li></ul></ul>?', a: 'The inner <ul> is a direct child of the outer <ul>, which is invalid. It must be inside the <li>: <ul><li>A<ul><li>B</li></ul></li></ul>.', level: 'Medium' },
    { q: 'Can you mix ordered and unordered lists when nesting?', a: 'Yes. Any list type can be nested inside an <li> of any other list type, or inside a <dd>.', level: 'Easy' },
    { q: 'How does the browser display nested unordered lists by default?', a: 'Each level is indented further and bullets change style: disc at level 1, circle at level 2 and square at level 3 and deeper.', level: 'Medium' },
    { q: 'When would you choose <dl> over a table?', a: 'For simple one-dimensional name-value pairs (like specs or metadata), <dl> is lighter and semantic. Use a table when data has multiple columns and rows (two-dimensional comparisons).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a glossary of five HTML terms (tag, element, attribute, void element, nesting) using a description list.',
      hint: 'One dt + dd pair per term.',
      solution: `<dl>
  <dt>Tag</dt><dd>Markup in angle brackets like &lt;p&gt;.</dd>
  <dt>Element</dt><dd>Opening tag, content and closing tag together.</dd>
  <dt>Attribute</dt><dd>Extra information inside the opening tag.</dd>
  <dt>Void element</dt><dd>An element with no content or closing tag, like &lt;br&gt;.</dd>
  <dt>Nesting</dt><dd>Placing elements inside other elements.</dd>
</dl>`,
    },
    {
      task: 'Create an order summary using <dl>: Order ID, Date, Items (two values: "T-shirt", "Jeans"), Total.',
      hint: 'Items gets two <dd> elements.',
      solution: `<dl>
  <dt>Order ID</dt><dd>#ORD-2026-1145</dd>
  <dt>Date</dt><dd>12 March 2026</dd>
  <dt>Items</dt><dd>T-shirt</dd><dd>Jeans</dd>
  <dt>Total</dt><dd>₹2,148</dd>
</dl>`,
    },
    {
      task: 'Build a nested course outline: an ordered list of 3 modules, each with an unordered list of 2 topics.',
      hint: 'Inner <ul> goes inside each module <li>.',
      solution: `<ol>
  <li>HTML Fundamentals
    <ul><li>Document structure</li><li>Elements and attributes</li></ul>
  </li>
  <li>Links, Images and Lists
    <ul><li>Links</li><li>Images</li></ul>
  </li>
  <li>Forms
    <ul><li>Input types</li><li>Validation</li></ul>
  </li>
</ol>`,
    },
    {
      task: 'Represent this folder structure as nested lists: project/ (index.html, css/ (style.css), js/ (app.js), images/ (logo.png, banner.jpg)).',
      hint: 'Folders become li elements with a nested ul.',
      solution: `<ul>
  <li>project/
    <ul>
      <li>index.html</li>
      <li>css/
        <ul><li>style.css</li></ul>
      </li>
      <li>js/
        <ul><li>app.js</li></ul>
      </li>
      <li>images/
        <ul><li>logo.png</li><li>banner.jpg</li></ul>
      </li>
    </ul>
  </li>
</ul>`,
    },
    {
      task: 'Fix this broken nested list: <ul><li>Tea</li><ul><li>Green</li><li>Black</ul><li>Coffee</li></ul>',
      hint: 'Move the inner <ul> inside the Tea <li> and close every <li>.',
      solution: `<ul>
  <li>Tea
    <ul>
      <li>Green</li>
      <li>Black</li>
    </ul>
  </li>
  <li>Coffee</li>
</ul>`,
    },
  ],
  quiz: [
    { question: 'Which tag holds the term in a description list?', options: ['<dd>', '<dl>', '<li>', '<dt>'], answer: 3, explanation: '<dt> = description term.' },
    { question: 'Which is the correct way to nest a list?', options: ['<ul><li>A</li><ul><li>B</li></ul></ul>', '<ul><li>A<ul><li>B</li></ul></li></ul>', '<ul><ul><li>B</li></ul></ul>', '<li><ul>A</ul></li>'], answer: 1, explanation: 'The nested list must be inside the parent <li>.' },
    { question: 'Which list is best for product specifications like "RAM: 8 GB"?', options: ['<dl>', '<ol>', '<ul>', '<menu>'], answer: 0, explanation: 'Name-value pairs fit a description list.' },
    { question: 'Can one <dt> have multiple <dd> elements?', options: ['No, never', 'Only inside a table', 'Yes', 'Only if they are nested'], answer: 2, explanation: 'A term can have several descriptions.' },
    { question: 'What bullet does a second-level nested <ul> show by default?', options: ['disc', 'square', 'none', 'circle'], answer: 3, explanation: 'Level 1 disc, level 2 circle, level 3 square.' },
  ],
};
