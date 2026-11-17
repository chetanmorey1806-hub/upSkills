export default {
  id: 'day-03-html-elements-tags-attributes',
  title: 'HTML Elements, Tags, Attributes, Opening and Closing Tags, Nested Elements',
  module: 'Module 1: HTML Fundamentals',
  day: 3,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Understand the building blocks of every page: tags, elements and attributes. Learn the difference between them, which elements have no closing tag, and how to nest elements correctly.',
  objectives: [
    'Distinguish between a tag, an element and an attribute',
    'Write opening and closing tags correctly',
    'Identify void (empty) elements that have no closing tag',
    'Add attributes with correct syntax and quoting',
    'Nest elements properly without overlapping',
  ],
  theory: [
    {
      heading: 'Tags vs Elements',
      content: "People often use these words interchangeably, but interviewers like the precise difference.\n\n- A **tag** is the label written in angle brackets, for example `<p>` (opening tag) or `</p>` (closing tag).\n- An **element** is the complete unit: **opening tag + content + closing tag**.\n\nAnalogy: tags are the two slices of bread; the element is the whole sandwich including the filling.",
      syntax: '<p>This is the content</p>\n^^^                    ^^^^\nopening tag            closing tag\n\\________ whole thing = p element ________/',
      tip: 'Precise answer: "<p> is a tag; <p>Hello</p> is an element."',
    },
    {
      heading: 'Opening and closing tags',
      content: "- The **opening tag** starts an element: `<tagname>`.\n- The **closing tag** ends it: `</tagname>` (note the forward slash).\n- The content between them is what the element applies to.\n\nTag names are **case-insensitive**, but always write them in **lowercase** (industry convention, required by XHTML, easier to read).\n\nSome closing tags are technically optional in HTML (like `</p>` or `</li>`), because the parser can guess where they end. **Best practice: always close them anyway.** Relying on guessing leads to bugs.",
      syntax: '<h1>Welcome</h1>\n<p>Paragraph text</p>\n<strong>Important</strong>',
    },
    {
      heading: 'Void (empty) elements',
      content: "Some elements cannot have content, so they have **no closing tag**. These are called **void elements** (or empty elements).\n\nCommon void elements:\n- `<br>` line break\n- `<hr>` horizontal rule\n- `<img>` image\n- `<input>` form input\n- `<meta>` metadata\n- `<link>` link to external resource\n- Also: `<area>`, `<base>`, `<col>`, `<embed>`, `<source>`, `<track>`, `<wbr>`\n\nYou may see `<br />` with a slash (self-closing style from XHTML). In HTML5 both `<br>` and `<br />` are valid; the slash is ignored. Writing `</br>` or `<img></img>` is **wrong**.",
      tip: 'Common mistake: writing <img src="a.png"></img>. <img> is void: never add a closing tag.',
    },
    {
      heading: 'Attributes',
      content: "**Attributes** give extra information about an element or change its behaviour. They are written **inside the opening tag** as `name=\"value\"` pairs.\n\nRules:\n- Always in the **opening tag**, never in the closing tag.\n- Separate multiple attributes with **spaces**.\n- Wrap values in **double quotes** (single quotes also work; unquoted values break with spaces).\n- Attribute names are lowercase by convention.\n- The order of attributes does not matter.\n\n**Boolean attributes** need no value: their presence means true. Examples: `disabled`, `checked`, `required`, `hidden`. `<input disabled>` is the same as `<input disabled=\"disabled\">`. Note: `disabled=\"false\"` is still disabled!\n\n**Global attributes** work on any element: `id` (unique identifier), `class` (group name for styling), `style` (inline CSS), `title` (tooltip), `lang`, `hidden`. These are explored in depth in the Extra lessons.",
      syntax: '<a href="https://example.com" title="Visit example" target="_blank">Example</a>\n<img src="logo.png" alt="Company logo" width="120">\n<input type="checkbox" checked>',
      tip: 'Each id must be unique on the page; a class can be reused on many elements.',
    },
    {
      heading: 'Nested elements',
      content: "Elements can contain other elements. This is called **nesting**. The outer element is the **parent**, the inner one is the **child**.\n\nThe golden rule: **the last tag opened must be the first tag closed** (Last In, First Out), like stacking boxes inside each other: you must close the inner box before closing the outer box.\n\nCorrect: `<p>This is <strong>very</strong> important.</p>`\n\nWrong (overlapping): `<p>This is <strong>very important.</p></strong>`\n\nAlso, not every element can go inside every other element. For example a `<p>` cannot contain a `<div>` or another `<p>`; the browser will close the paragraph early. Use **indentation** (2 spaces per level) to make nesting easy to read.",
      syntax: '<body>\n  <div>\n    <h2>Title</h2>\n    <p>Text with a <a href="#">link</a>.</p>\n  </div>\n</body>',
    },
    {
      heading: 'Comments and whitespace',
      content: "Write notes for yourself with HTML comments: `<!-- this is a comment -->`. They are not displayed (but are visible in View Source, so never put secrets in them).\n\nHTML **collapses whitespace**: multiple spaces, tabs and new lines in your code display as a single space. That is why indentation does not change how the page looks. (Comments and entities are covered fully on Day 20.)",
    },
  ],
  examples: [
    {
      title: 'Anatomy of an element with attributes',
      scenario: 'Build a link to your college website and label each part.',
      steps: [
        'Create index.html with the boilerplate',
        'Add an <a> element with href, title and target attributes',
        'Hover over the link to see the title tooltip',
        'Click Run',
      ],
      code: `<p>
  Visit my
  <a href="https://example.com" title="Opens the college site" target="_blank">college website</a>
  for details.
</p>`,
      playground: {
        html: `<p>
  Visit my
  <a href="https://example.com" title="Opens the college site" target="_blank">college website</a>
  for details.
</p>
<p><small>Element: a | Attributes: href, title, target | Content: "college website"</small></p>`,
      },
      result: 'A sentence with a link. Hovering the link shows the tooltip "Opens the college site"; clicking opens example.com in a new tab.',
      explanation: '<a ...> is the opening tag containing three attributes. "college website" is the content. </a> is the closing tag. Together they form the a element.',
    },
    {
      title: 'Void elements in action',
      scenario: 'Create an address card that uses <br>, <hr>, <img> and <input> without closing tags.',
      steps: [
        'Add a heading and an image using <img>',
        'Write an address using <br> for line breaks',
        'Add a divider with <hr> and an <input>',
        'Click Run',
      ],
      code: `<h2>Contact Card</h2>
<img src="https://picsum.photos/80" alt="Profile photo" width="80" height="80">
<p>
  Ravi Kumar<br>
  12 MG Road<br>
  Bengaluru
</p>
<hr>
<input type="text" placeholder="Leave a message">`,
      playground: {
        html: `<h2>Contact Card</h2>
<img src="https://picsum.photos/80" alt="Profile photo" width="80" height="80">
<p>
  Ravi Kumar<br>
  12 MG Road<br>
  Bengaluru
</p>
<hr>
<input type="text" placeholder="Leave a message">`,
      },
      result: 'A small photo, a three-line address, a horizontal line and a text box.',
      explanation: '<img>, <br>, <hr> and <input> are void elements: they have attributes but no content and no closing tag. Adding </br> or </img> would be invalid.',
    },
    {
      title: 'Correct vs incorrect nesting',
      scenario: 'See how overlapping tags confuse the browser.',
      steps: [
        'Write a correctly nested sentence with <strong> and <em>',
        'Write the same sentence with overlapping tags',
        'Run and compare the generated HTML printed by the script',
      ],
      code: `<!-- Correct -->
<p><strong>Bold and <em>bold italic</em></strong> text</p>

<!-- Wrong: overlapping -->
<p><strong>Bold and <em>bold italic</strong></em> text</p>`,
      playground: {
        html: `<p id="good"><strong>Bold and <em>bold italic</em></strong> text</p>
<p id="bad"><strong>Bold and <em>bold italic</strong></em> text</p>
<pre id="out" style="background:#f4f4f4;padding:8px;white-space:pre-wrap"></pre>`,
        js: `const out = document.getElementById('out');
out.textContent = 'Correct parsed as:\\n' + document.getElementById('good').innerHTML +
  '\\n\\nOverlapping parsed as:\\n' + document.getElementById('bad').innerHTML;
console.log('Browser repaired the bad markup - do not rely on this.');`,
      },
      result: 'Both lines may look similar, but the grey box shows the browser had to rewrite the overlapping version to repair it.',
      explanation: 'In correct nesting, <em> is closed before <strong> because it was opened last. With overlapping tags, the browser runs an error-recovery algorithm and invents extra tags. Results can differ and break CSS selectors.',
    },
    {
      title: 'Boolean attributes and global attributes',
      scenario: 'Show disabled/checked inputs and use id, class, title and hidden.',
      steps: [
        'Add a checkbox with checked and a button with disabled',
        'Add paragraphs using class, title and hidden attributes',
        'Click Run and hover the paragraph',
      ],
      code: `<input type="checkbox" checked> Subscribed<br>
<button disabled>Cannot click</button>

<p id="intro" class="note" title="I am a tooltip">Hover over me</p>
<p hidden>You cannot see this paragraph.</p>`,
      playground: {
        html: `<input type="checkbox" checked> Subscribed<br>
<button disabled>Cannot click</button>
<p id="intro" class="note" title="I am a tooltip">Hover over me</p>
<p hidden>You cannot see this paragraph.</p>`,
        css: `.note { background: #fff7d6; padding: 6px; border-left: 4px solid orange; }`,
        js: `console.log('hidden paragraphs:', document.querySelectorAll('p[hidden]').length);
console.log('#intro class is', document.getElementById('intro').className);`,
      },
      result: 'A ticked checkbox, a greyed-out button, a yellow note with a tooltip on hover. The hidden paragraph is not shown; the console confirms it exists.',
      explanation: 'checked and disabled are boolean attributes: presence alone makes them true. class lets CSS style the paragraph, title gives a tooltip, hidden removes the element from display.',
    },
  ],
  interview: [
    { q: 'What is the difference between a tag and an element?', a: 'A tag is the markup in angle brackets such as <p> or </p>. An element is the complete structure: opening tag, content and closing tag, for example <p>Hello</p>. Void elements consist of just one tag.', level: 'Easy' },
    { q: 'What are attributes in HTML?', a: 'Attributes provide additional information or configuration for elements. They are written in the opening tag as name="value" pairs, e.g. <img src="a.png" alt="Logo">.', level: 'Easy' },
    { q: 'What are void (empty) elements? Give examples.', a: 'Elements that cannot have content and therefore have no closing tag: <br>, <hr>, <img>, <input>, <meta>, <link>, <source>, <area>, <base>, <col>, <embed>, <track>, <wbr>.', level: 'Easy' },
    { q: 'Is <br /> or <br> correct in HTML5?', a: 'Both are valid. In HTML5 the trailing slash on void elements is allowed but ignored. It came from XHTML syntax. </br> on its own is incorrect.', level: 'Medium' },
    { q: 'What is a boolean attribute?', a: 'An attribute whose presence means true and absence means false, e.g. disabled, checked, required, readonly, hidden. disabled="false" still disables the element because the attribute is present.', level: 'Medium' },
    { q: 'What is the difference between id and class?', a: 'id must be unique in the document and identifies one element (used for anchors, labels, JavaScript). class can be shared by many elements and an element can have multiple classes separated by spaces; it is mainly used for styling groups.', level: 'Easy' },
    { q: 'What does proper nesting mean?', a: 'Inner elements must be closed before their outer (parent) elements: the last opened tag is the first closed. Overlapping tags like <b><i>x</b></i> are invalid.', level: 'Easy' },
    { q: 'Are HTML attributes case-sensitive?', a: 'Attribute names are case-insensitive in HTML, but values may be case-sensitive (for example id and class values, and URLs). Lowercase names are the convention.', level: 'Medium' },
    { q: 'Can a <p> element contain a <div>?', a: 'No. <p> can only contain phrasing (inline-level) content. When the parser meets a <div> inside a <p>, it closes the paragraph automatically, leaving an empty or broken structure.', level: 'Hard' },
    { q: 'What are global attributes?', a: 'Attributes that can be used on any HTML element, such as id, class, style, title, lang, hidden, tabindex, data-*, contenteditable and draggable.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a paragraph about your favourite food in which one word is bold (<strong>) and one phrase is italic (<em>), correctly nested.',
      hint: 'Open <p>, then <strong>...</strong>, then <em>...</em>, then close </p>.',
      solution: `<p>My favourite food is <strong>biryani</strong>, especially <em>Hyderabadi style</em> with raita.</p>`,
    },
    {
      task: 'Create an image element of a random 200x150 photo with alt text, width and height attributes, and a title tooltip.',
      hint: 'Use https://picsum.photos/200/150. <img> has no closing tag.',
      solution: `<img src="https://picsum.photos/200/150" alt="Random landscape photo" width="200" height="150" title="Photo from picsum">`,
    },
    {
      task: 'Fix all errors: <P><B>Hello <I>World</B></I><BR></BR><IMG SRC=pic.png></IMG></P>',
      hint: 'Lowercase, correct nesting order, void elements without closing tags, quoted attribute, add alt.',
      solution: `<p><b>Hello <i>World</i></b><br><img src="pic.png" alt="Picture"></p>`,
    },
    {
      task: 'Create a disabled text input, a checked checkbox and a hidden paragraph. Give the first paragraph on the page an id of "top" and a class of "intro highlight".',
      hint: 'Multiple classes are separated by spaces in one class attribute.',
      solution: `<p id="top" class="intro highlight">Settings</p>
<input type="text" value="Read only name" disabled>
<input type="checkbox" checked> Receive newsletter
<p hidden>Secret note</p>`,
    },
    {
      task: 'Write a nested structure: a <div> containing an <h2>, a <p> with a link inside it, and an <hr>. Indent each level with 2 spaces.',
      hint: 'The <a> is a child of <p>, which is a child of <div>.',
      solution: `<div>
  <h2>Latest News</h2>
  <p>
    Read the full story on
    <a href="https://example.com/news">our news page</a>.
  </p>
  <hr>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which of these is a void element?', options: ['<p>', '<img>', '<div>', '<span>'], answer: 1, explanation: '<img> has no content and no closing tag.' },
    { question: 'Where are attributes written?', options: ['In the closing tag', 'Between the tags as content', 'In the opening tag', 'In a separate file'], answer: 2, explanation: 'Attributes always go inside the opening tag.' },
    { question: 'Which nesting is correct?', options: ['<b><i>Hi</b></i>', '<i><b>Hi</i></b>', '<b><i>Hi</i></b>', '<b>Hi<i></b></i>'], answer: 2, explanation: 'The last opened tag (<i>) must be closed first.' },
    { question: 'What does <button disabled="false"> do?', options: ['The button is disabled', 'The button is enabled', 'It causes an error', 'It hides the button'], answer: 0, explanation: 'Boolean attributes are true if present at all, regardless of the value.' },
    { question: '<p>Hello</p> as a whole is called a(n):', options: ['Tag', 'Attribute', 'Doctype', 'Element'], answer: 3, explanation: 'Opening tag + content + closing tag = element.' },
  ],
};
