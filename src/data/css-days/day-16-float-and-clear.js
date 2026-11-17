export default {
  id: 'day-16-float-and-clear',
  title: 'Float and Clear (Legacy Layouts)',
  module: 'Module 4: Layout',
  day: 16,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'Learn how `float` pushes an element to the left or right so text wraps around it, how `clear` stops that wrapping, and how to fix the famous "collapsed parent" problem. Floats are legacy for page layout but still the right tool for wrapping text around images.',
  objectives: [
    'Explain what float does and how surrounding inline content wraps around a floated element',
    'Use clear: left | right | both to stop elements from wrapping',
    'Fix a collapsed parent using the clearfix hack and display: flow-root',
    'Recognise why floats were used for old column layouts and why Flexbox/Grid replaced them',
  ],
  theory: [
    {
      heading: 'What is float?',
      content: `The \`float\` property takes an element out of the normal top-to-bottom flow and pushes it to the **left** or **right** edge of its container. Text and inline content then **wrap around** it.

Real-world analogy: think of a newspaper or magazine. A photo sits on the left side of a column and the article text flows around it. That is exactly what float was invented for in CSS 1 (1996).

Values:
- \`float: left\` – element moves to the left edge, content wraps on its right
- \`float: right\` – element moves to the right edge, content wraps on its left
- \`float: none\` – the default, no floating
- \`float: inline-start\` / \`inline-end\` – logical values that respect writing direction (left-to-right vs right-to-left languages)`,
      syntax: `img.thumb {
  float: left;
  margin: 0 16px 8px 0; /* space between image and text */
}`,
      tip: 'Always add a margin on the side facing the text, otherwise the words touch the image.',
    },
    {
      heading: 'How floated elements behave',
      content: `When an element floats, a few things change automatically:

1. It becomes **block-level** (a floated \`<span>\` can now take width and height).
2. If you don't give it a width, it **shrinks to fit** its content.
3. It is removed from normal flow for **block boxes** – the next block sits behind it – but **line boxes** (text) shorten to avoid it, which is why text wraps.
4. Several floats in a row sit **side by side** until there is no room; then the next one drops to a new line.

This "side by side" behaviour is why, before Flexbox (2012+), developers built entire multi-column websites with \`float: left\` on every column.`,
      points: [
        'Floats only move horizontally – there is no float: top or float: center.',
        'A floated element ignores vertical-align.',
        'Floats can overlap the background of following block elements, but not their text.',
      ],
    },
    {
      heading: 'clear: stopping the wrap',
      content: `Sometimes you want an element to start **below** a float instead of next to it – for example a footer under two floated columns. That is what \`clear\` does.

- \`clear: left\` – move below any left floats above me
- \`clear: right\` – move below any right floats
- \`clear: both\` – move below all floats (most common)
- \`clear: none\` – default

Analogy: \`clear: both\` is like saying "I want my own fresh line, below every picture."`,
      syntax: `.footer {
  clear: both;
}`,
    },
    {
      heading: 'The collapsed parent problem',
      content: `This is the #1 float bug and a classic interview question. If a container only holds floated children, the container's height becomes **zero**, because floats are out of normal flow. Its background and border "collapse" and the following content slides up.

Three fixes:
1. **display: flow-root** (modern, recommended) – makes the parent a new *Block Formatting Context* (BFC) which always contains its floats.
2. **Clearfix hack** – add an invisible pseudo-element after the children that clears them.
3. **overflow: hidden / auto** – also creates a BFC, but can clip shadows and dropdowns, so be careful.`,
      syntax: `/* Modern fix */
.container { display: flow-root; }

/* Classic clearfix */
.clearfix::after {
  content: "";
  display: block;
  clear: both;
}`,
      tip: 'In interviews say: "Floats are taken out of normal flow, so the parent doesn\'t see their height. Fix it with display: flow-root or a clearfix."',
    },
    {
      heading: 'Floats today: when to use them',
      content: `In modern CSS, **do not use floats for page layout**. Use Flexbox (Day 17–18) and Grid (Day 19–20) – they are easier, have no collapse bug and support vertical alignment.

Floats are still the right choice for:
- Wrapping text around an image or a pull-quote
- Drop caps together with \`::first-letter\`
- Shaping text with \`shape-outside\` (e.g. text that follows a circle)

You will still see floats in old codebases, WordPress themes and Bootstrap 3, so you must be able to read and fix them.

**Coming next:** Day 17 – Flexbox container properties, the modern way to place items in a row.`,
    },
  ],
  examples: [
    {
      title: 'Magazine-style image with wrapping text',
      scenario: 'A blog article needs an author photo on the left with the paragraph flowing around it.',
      steps: [
        'Create index.html with an <img> followed by a long paragraph inside an <article>',
        'Give the image float: left and a right/bottom margin',
        'Click Run and watch the text wrap around the picture',
        'Change float: left to float: right and run again',
      ],
      code: `.article img {
  float: left;
  width: 140px;
  margin: 0 16px 8px 0;
  border-radius: 8px;
}`,
      playground: {
        html: `<article class="article">
  <img src="https://picsum.photos/seed/float/280/280" alt="Random landscape">
  <h2>Floating images like a magazine</h2>
  <p>CSS floats were created so that text can flow around images, just like in printed newspapers and magazines. The image is pushed to the left edge of the article, and every line of text becomes shorter so that it fits beside the picture. Once the text goes below the bottom of the image, the lines return to full width automatically. This is still the best use of float today, even though we no longer build page layouts with it. Keep reading to see how the lines become full width again below the picture. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; line-height: 1.6; }
.article { max-width: 560px; }
.article img {
  float: left;
  width: 140px;
  margin: 0 16px 8px 0;
  border-radius: 8px;
}
h2 { margin-top: 0; }`,
      },
      result: 'The photo sits on the left; the heading and paragraph wrap around its right side, then become full width below it.',
      explanation: '`float: left` moves the image to the left edge and shortens the line boxes beside it. The margin creates breathing room between picture and text.',
    },
    {
      title: 'Collapsed parent and three fixes',
      scenario: 'A grey box contains two floated cards but the grey background disappears. Compare a broken container with flow-root and clearfix versions.',
      steps: [
        'Create three .box containers, each with two floated .card children',
        'Leave the first box without a fix – notice it has no height',
        'Add display: flow-root to the second box',
        'Add the .clearfix class to the third box',
        'Click Run and compare all three',
      ],
      code: `.card { float: left; width: 45%; }
.fixed-flowroot { display: flow-root; }
.clearfix::after { content: ""; display: block; clear: both; }`,
      playground: {
        html: `<h3>1. Broken (collapsed parent)</h3>
<div class="box">
  <div class="card">Card A</div>
  <div class="card">Card B</div>
</div>
<h3 style="clear:both">2. Fixed with display: flow-root</h3>
<div class="box fixed-flowroot">
  <div class="card">Card A</div>
  <div class="card">Card B</div>
</div>
<h3>3. Fixed with clearfix</h3>
<div class="box clearfix">
  <div class="card">Card A</div>
  <div class="card">Card B</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.box { background: #e2e8f0; border: 3px dashed #64748b; padding: 8px; margin-bottom: 8px; }
.card { float: left; width: 45%; margin: 4px; padding: 20px; background: #0ea5e9; color: #fff; border-radius: 6px; }
.fixed-flowroot { display: flow-root; }
.clearfix::after { content: ""; display: block; clear: both; }`,
      },
      result: 'Box 1 is a thin dashed line with cards spilling out; boxes 2 and 3 wrap neatly around the cards with grey background visible.',
      explanation: 'Floats leave normal flow, so box 1 calculates its height as 0 (only padding). flow-root creates a Block Formatting Context that contains floats; the clearfix ::after element clears the floats from inside, forcing the parent to stretch.',
    },
    {
      title: 'Legacy two-column layout with a cleared footer',
      scenario: 'Understand how old websites built a sidebar + content layout using floats and clear.',
      steps: [
        'Create header, aside, main and footer elements',
        'Float the aside left at 30% and main right at 66%',
        'Give the footer clear: both',
        'Run, then remove clear: both to see the footer jump up',
      ],
      code: `aside { float: left; width: 30%; }
main  { float: right; width: 66%; }
footer { clear: both; }`,
      playground: {
        html: `<header>Header</header>
<aside>Sidebar<br>Link 1<br>Link 2<br>Link 3</aside>
<main>Main content. This is how layouts were built before Flexbox and Grid. Each column is floated and has a percentage width.</main>
<footer>Footer (clear: both)</footer>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
header, aside, main, footer { padding: 16px; color: #fff; border-radius: 6px; margin-bottom: 8px; box-sizing: border-box; }
header { background: #334155; }
aside { float: left; width: 30%; background: #7c3aed; }
main { float: right; width: 66%; background: #0d9488; min-height: 120px; }
footer { clear: both; background: #ea580c; }`,
      },
      result: 'Purple sidebar on the left, teal content on the right, orange footer below both.',
      explanation: 'The two floats sit side by side because 30% + 66% fit in 100%. Without clear: both the footer would slide up behind the floats.',
    },
    {
      title: 'Text that follows a circle with shape-outside',
      scenario: 'A modern use of float: make text hug a round avatar.',
      steps: [
        'Float a circular element left',
        'Add shape-outside: circle(50%)',
        'Run and see the text follow the curve',
      ],
      code: `.avatar {
  float: left;
  width: 150px; height: 150px;
  border-radius: 50%;
  shape-outside: circle(50%);
  margin-right: 12px;
}`,
      playground: {
        html: `<div class="avatar"></div>
<p>Notice how each line of this paragraph starts at a different position, following the curve of the circle instead of a straight rectangular edge. shape-outside only works on floated elements, which is one reason floats are still useful in modern CSS. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</p>`,
        css: `body { font-family: Georgia, serif; padding: 16px; line-height: 1.5; max-width: 480px; }
.avatar {
  float: left;
  width: 150px; height: 150px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f472b6, #6366f1);
  shape-outside: circle(50%);
  margin-right: 12px;
}`,
      },
      result: 'A gradient circle with the paragraph text curving around its right edge.',
      explanation: 'shape-outside changes the wrapping area from the default rectangle to a circle. It requires the element to be floated.',
    },
  ],
  interview: [
    { q: 'What does the float property do?', a: 'It removes an element from normal block flow and pushes it to the left or right of its container, allowing inline content such as text to wrap around it.', level: 'Easy' },
    { q: 'What does clear: both do?', a: 'It forces the element to start below any preceding left and right floats instead of sitting beside them.', level: 'Easy' },
    { q: 'Why does a parent containing only floated children collapse to zero height?', a: 'Floated elements are taken out of normal flow, so the parent does not include them when calculating its auto height.', level: 'Medium' },
    { q: 'What is a clearfix?', a: 'A technique that adds a pseudo-element after the children with content: ""; display: block; clear: both; so the parent expands to contain its floats.', level: 'Medium' },
    { q: 'What is the modern way to contain floats?', a: 'display: flow-root on the parent. It creates a new Block Formatting Context without side effects like clipping (overflow: hidden) or extra markup.', level: 'Medium' },
    { q: 'What is a Block Formatting Context (BFC)?', a: 'An independent layout region where floats are contained and margins of children do not collapse with outside elements. Created by display: flow-root, overflow other than visible, floats, absolute positioning, flex/grid items, etc.', level: 'Hard' },
    { q: 'Can you center an element with float?', a: 'No. float only accepts left, right, none (and logical inline-start/inline-end). Use margin: auto, Flexbox or Grid to center.', level: 'Easy' },
    { q: 'What happens to display when you float an inline element like span?', a: 'It is blockified – its computed display becomes block, so width and height apply.', level: 'Medium' },
    { q: 'Why are floats no longer recommended for page layout?', a: 'They need clearing hacks, cannot align vertically, have source-order issues and are fragile. Flexbox and Grid were designed specifically for layout.', level: 'Easy' },
    { q: 'What is shape-outside?', a: 'A property that defines a non-rectangular wrap area (circle, ellipse, polygon, image alpha) for a floated element so text flows around that shape.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a product description with an image floated right and 12px gap to the text.',
      hint: 'Use float: right and margin-left.',
      solution: `<style>
  .product img { float: right; width: 160px; margin: 0 0 8px 12px; }
</style>
<div class="product">
  <img src="https://picsum.photos/seed/p/320/320" alt="Product">
  <p>Long product description text goes here and wraps around the photo on the right side...</p>
</div>`,
    },
    {
      task: 'Build three floated boxes of equal width inside a container and make sure the container keeps its background.',
      hint: 'width: calc(33.333% - margin) and display: flow-root on parent.',
      solution: `<style>
  .row { display: flow-root; background: #eee; padding: 8px; }
  .col { float: left; width: calc(33.333% - 8px); margin: 4px; background: teal; color: #fff; padding: 16px; box-sizing: border-box; }
</style>
<div class="row">
  <div class="col">1</div><div class="col">2</div><div class="col">3</div>
</div>`,
    },
    {
      task: 'Write a reusable .clearfix class and apply it to a navigation bar whose links are floated left.',
      hint: '::after with content, display and clear.',
      solution: `<style>
  .clearfix::after { content: ""; display: block; clear: both; }
  nav { background: #222; }
  nav a { float: left; color: #fff; padding: 12px 16px; text-decoration: none; }
</style>
<nav class="clearfix"><a href="#">Home</a><a href="#">About</a><a href="#">Contact</a></nav>`,
    },
    {
      task: 'Make a drop cap: float the first letter of a paragraph to the left with a large font size.',
      hint: 'p::first-letter { float: left; font-size: 3em; }',
      solution: `<style>
  p::first-letter { float: left; font-size: 3.5em; line-height: 1; margin-right: 6px; color: crimson; font-weight: bold; }
</style>
<p>Once upon a time, in a land far away, CSS floats were used for everything...</p>`,
    },
  ],
  quiz: [
    { question: 'Which value is NOT valid for float?', options: ['left', 'right', 'center', 'none'], answer: 2, explanation: 'There is no float: center. Use other techniques for centering.' },
    { question: 'Which property makes an element move below floats?', options: ['float: none', 'clear', 'display: block', 'position: static'], answer: 1, explanation: 'clear: left/right/both moves the element below the respective floats.' },
    { question: 'What is the cleanest modern fix for a parent that collapses around floats?', options: ['height: 100%', 'overflow: visible', 'position: relative', 'display: flow-root'], answer: 3, explanation: 'flow-root creates a Block Formatting Context that contains its floats with no side effects.' },
    { question: 'What is still a good modern use case for float?', options: ['Wrapping text around an image', 'Building a 12-column grid', 'Vertically centering a box', 'Creating a sticky header'], answer: 0, explanation: 'Text wrapping is the original and still valid purpose of float.' },
    { question: 'A floated <span> without explicit width will…', options: ['Stay inline and ignore width', 'Shrink to fit its content and become block-level', 'Take 100% width', 'Disappear'], answer: 1, explanation: 'Floats are blockified and shrink-to-fit by default.' },
  ],
};
