export default {
  id: 'day-17-block-vs-inline-elements',
  title: 'Block-Level vs Inline Elements, <div> and <span>',
  module: 'Module 4: Semantic HTML & Advanced Elements',
  day: 17,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: "Every HTML element has a default display behaviour: block elements start on a new line and take the full width, inline elements sit inside a line of text. Understanding this, plus the two generic containers <div> and <span>, is the foundation of all page layout.",
  objectives: [
    'Define block-level and inline elements and list common examples of each',
    'Predict how elements will flow on the page by default',
    'Use <div> and <span> as generic containers correctly',
    'Know the nesting rules: block inside inline is (mostly) invalid',
  ],
  theory: [
    {
      heading: 'Block-level elements',
      content: "A **block-level** element:\n- always starts on a **new line**\n- stretches to take the **full available width** of its parent\n- respects `width`, `height`, `margin` and `padding` on all sides\n\nAnalogy: block elements are like **bricks stacked in a wall**, one row each.\n\nCommon block elements: `<div>`, `<p>`, `<h1>`–`<h6>`, `<ul>`, `<ol>`, `<li>`, `<table>`, `<form>`, `<header>`, `<footer>`, `<section>`, `<article>`, `<nav>`, `<main>`, `<blockquote>`, `<pre>`, `<hr>`.",
    },
    {
      heading: 'Inline elements',
      content: "An **inline** element:\n- does **not** start on a new line; it flows with the text\n- is only as wide as its content\n- ignores `width` and `height`; vertical margins do not push other lines away\n\nAnalogy: inline elements are like **words in a sentence**; they sit side by side and wrap to the next line when there is no space.\n\nCommon inline elements: `<span>`, `<a>`, `<strong>`, `<em>`, `<b>`, `<i>`, `<img>`, `<code>`, `<small>`, `<mark>`, `<label>`, `<input>`, `<button>`, `<sub>`, `<sup>`, `<br>`.",
      tip: '<img>, <input> and <button> are inline but "replaced"/inline-block-like: they accept width and height. That is why images sit next to text unless you change display.',
    },
    {
      heading: '<div>: the generic block container',
      content: "`<div>` (division) is a block element with **no meaning**. Use it to group elements for styling or layout (e.g. a flex row, a card wrapper) when no semantic element fits.\n\nRule of thumb: first ask \"is there a semantic tag for this?\" (header, nav, article…). If not, use `<div>`.",
      syntax: `<div class="card">
  <h3>Title</h3>
  <p>Description</p>
</div>`,
    },
    {
      heading: '<span>: the generic inline container',
      content: "`<span>` is an inline element with **no meaning**. Use it to target a piece of text inside a line, e.g. to colour one word or attach a class for JavaScript.\n\nIf the text is important, prefer `<strong>`; if it is emphasised, prefer `<em>`; if highlighted, `<mark>`. Use `<span>` when you only need a styling hook.",
      syntax: `<p>Price: <span class="price">₹499</span> only today!</p>`,
    },
    {
      heading: 'Nesting rules and changing display',
      content: "- Block elements can contain inline elements and other blocks (e.g. `<div>` inside `<div>`).\n- Inline elements should contain only text or other inline elements. `<span><div>…</div></span>` is invalid.\n- Exception: in HTML5, `<a>` may wrap block content (e.g. a whole card) as long as it contains no other interactive elements.\n- `<p>` cannot contain block elements: `<p><div>x</div></p>` makes the browser auto-close the paragraph.\n\nThe default can be changed with CSS `display: block | inline | inline-block | flex | none`. CSS changes appearance only; it does not change the HTML content model.",
      tip: 'Interview favourite: inline-block = flows inline like text, but accepts width/height like a block (great for buttons and badges).',
    },
  ],
  examples: [
    {
      title: 'Seeing block vs inline with outlines',
      scenario: 'Visualise how much space block and inline elements take.',
      steps: [
        'Create index.html with two <div>s, a <p>, and several <span>s',
        'Add CSS outlines so every element box is visible',
        'Click Run and compare the widths',
      ],
      code: `<div>Block div 1</div>
<div>Block div 2</div>
<p>Paragraph with <span>span one</span> and <span>span two</span> inline.</p>`,
      playground: {
        html: `<div>Block div 1</div>
<div>Block div 2</div>
<p>Paragraph with <span>span one</span> and <span>span two</span> and <a href="#">a link</a> inline.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
div { outline: 2px solid #2563eb; margin: 4px 0; }
p { outline: 2px solid #16a34a; }
span, a { outline: 2px dashed #dc2626; }`,
        js: `document.querySelectorAll('div, span').forEach(el => {
  console.log(el.tagName, '→ display:', getComputedStyle(el).display, '| width:', Math.round(el.getBoundingClientRect().width) + 'px');
});`,
      },
      result: 'Blue outlines stretch across the whole width (blocks). Red dashed outlines wrap only the words (inline). The console lists DIV display: block with a large width and SPAN display: inline with small widths.',
      explanation: 'Blocks fill their parent horizontally and stack vertically. Inline elements shrink to their content and flow within the line of text.',
    },
    {
      title: 'Width and height do not apply to inline elements',
      scenario: 'A developer sets width: 200px on a <span> and wonders why nothing happens.',
      steps: [
        'Create two badges: one <span>, one <span> with display:inline-block',
        'Give both width: 120px and padding',
        'Click Run and compare',
      ],
      code: `.badge { width: 120px; height: 40px; background: gold; }
.ib { display: inline-block; }`,
      playground: {
        html: `<p>Inline: <span class="badge">NEW</span> text continues</p>
<p>Inline-block: <span class="badge ib">NEW</span> text continues</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.badge { width: 120px; height: 40px; background: gold; padding: 4px; text-align: center; }
.ib { display: inline-block; line-height: 40px; }`,
      },
      result: 'The first badge is only as wide as "NEW". The second is a 120px-wide gold box that still sits in the line of text.',
      explanation: 'Pure inline boxes ignore width and height. inline-block keeps inline flow but creates a box that respects dimensions.',
    },
    {
      title: 'Highlighting words with <span> and grouping with <div>',
      scenario: 'Build a pricing card: a <div> card containing a price where only the amount is coloured.',
      steps: [
        'Create a <div class="card">',
        'Inside, add an h3 and a <p> containing <span class="amount">',
        'Style .card and .amount; use JS to change the amount',
      ],
      code: `<div class="card">
  <h3>Pro Plan</h3>
  <p>Only <span class="amount">₹299</span> per month</p>
</div>`,
      playground: {
        html: `<div class="card">
  <h3>Pro Plan</h3>
  <p>Only <span class="amount" id="amt">&#8377;299</span> per month</p>
  <button id="sale">Apply sale</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { max-width: 260px; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; }
.amount { color: #dc2626; font-weight: 700; font-size: 1.3em; }`,
        js: `document.getElementById('sale').addEventListener('click', () => {
  document.getElementById('amt').textContent = '₹199';
  console.log('Price updated via the span hook');
});`,
      },
      result: 'A card with a red, bold price. Clicking "Apply sale" changes ₹299 to ₹199 and logs a message.',
      explanation: 'The <div> groups the card content into one block for styling. The <span> wraps just the amount so CSS and JS can target it without breaking the sentence.',
    },
  ],
  interview: [
    { q: 'What is the difference between block-level and inline elements?', a: 'Block elements start on a new line and take the full width; they accept width/height/margins. Inline elements flow within text, take only content width, and ignore width/height and vertical margins.', level: 'Easy' },
    { q: 'Name five block and five inline elements.', a: 'Block: div, p, h1, ul, section. Inline: span, a, strong, em, img (img is inline replaced).', level: 'Easy' },
    { q: 'Difference between <div> and <span>?', a: 'Both are non-semantic generic containers. <div> is block-level (groups sections), <span> is inline (wraps text within a line).', level: 'Easy' },
    { q: 'What is inline-block?', a: 'A display value where the element flows inline like text but its box respects width, height, padding and vertical margin like a block.', level: 'Medium' },
    { q: 'Can you put a <div> inside a <span>?', a: 'No, it is invalid HTML: inline (phrasing) elements should only contain phrasing content. Use a div wrapper or change display with CSS.', level: 'Medium' },
    { q: 'Can an <a> tag wrap a <div>?', a: 'Yes in HTML5. <a> has a transparent content model, so it can wrap block content if its parent allows it and it contains no interactive elements.', level: 'Hard' },
    { q: 'What happens if you put a <div> inside a <p>?', a: 'The parser auto-closes the <p> before the <div>, producing an empty paragraph and unexpected layout. <p> may only contain phrasing content.', level: 'Hard' },
    { q: 'Does setting display: block on a <span> make it a block element in HTML?', a: 'It changes rendering only. The HTML content model (what it may contain) is unchanged.', level: 'Medium' },
    { q: 'Why does an <img> sit next to text?', a: 'Because <img> is an inline (replaced) element. To put it on its own line, use display:block or wrap it in a block element.', level: 'Medium' },
    { q: 'When should you avoid <div>?', a: 'When a semantic element fits (header, nav, main, article, section, button, etc.). Overusing divs ("div soup") hurts accessibility and readability.', level: 'Easy' },
  ],
  practice: [
    { task: 'Write a paragraph where the word "urgent" is wrapped in a span styled red.', hint: 'Use a class on the span.', solution: `<style>.urgent { color: red; }</style>
<p>This is an <span class="urgent">urgent</span> message.</p>` },
    { task: 'Create three <div> boxes that sit side by side using display:inline-block, each 100px wide.', hint: 'Divs are block by default; change display.', solution: `<style>.box { display: inline-block; width: 100px; height: 60px; background: #93c5fd; margin: 4px; }</style>
<div class="box">1</div><div class="box">2</div><div class="box">3</div>` },
    { task: 'Make a navigation where each <a> link looks like a button of fixed width 120px.', hint: 'Links are inline; width needs inline-block.', solution: `<style>nav a { display: inline-block; width: 120px; padding: 8px; text-align: center; background: #0f766e; color: #fff; text-decoration: none; }</style>
<nav><a href="#">Home</a><a href="#">About</a></nav>` },
    { task: 'Fix the invalid markup: <span><p>Hello</p></span>', hint: 'Swap the wrapper.', solution: `<div><p>Hello</p></div>
<!-- or -->
<p><span>Hello</span></p>` },
  ],
  quiz: [
    { question: 'Which element is inline by default?', options: ['<div>', '<p>', '<span>', '<section>'], answer: 2, explanation: '<span> is the generic inline element.' },
    { question: 'A block element by default:', options: ['Takes the full available width', 'Only wraps its text', 'Ignores margins', 'Cannot contain inline elements'], answer: 0, explanation: 'Blocks stretch to fill their container width and start on a new line.' },
    { question: 'Which display value lets an element sit inline yet accept width and height?', options: ['inline', 'block', 'none', 'inline-block'], answer: 3, explanation: 'inline-block combines inline flow with box sizing.' },
    { question: 'Which is INVALID HTML?', options: ['<div><span>x</span></div>', '<span><div>x</div></span>', '<p><em>x</em></p>', '<li><a href="#">x</a></li>'], answer: 1, explanation: 'Block content inside an inline <span> is not allowed.' },
    { question: 'What does <div> mean semantically?', options: ['Navigation', 'Main content', 'Nothing; it is a generic container', 'A division error'], answer: 2, explanation: '<div> carries no semantic meaning.' },
  ],
};
