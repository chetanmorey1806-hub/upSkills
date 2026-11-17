export default {
  id: 'day-17-flexbox-container',
  title: 'Flexbox: Container Properties (display:flex, flex-direction, justify-content, align-items, flex-wrap, gap)',
  module: 'Module 4: Layout',
  day: 17,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Flexbox is a one-dimensional layout system that lines up items in a row or a column and distributes space between them. Today you learn every property that goes on the flex container.',
  objectives: [
    'Turn any element into a flex container with display: flex and understand main axis vs cross axis',
    'Change direction with flex-direction and wrap items with flex-wrap / flex-flow',
    'Distribute space with justify-content and align items with align-items and align-content',
    'Add consistent spacing with gap instead of margins',
  ],
  theory: [
    {
      heading: 'What is Flexbox and why do we need it?',
      content: `**Flexbox (Flexible Box Layout)** is a CSS layout module designed to arrange items in **one dimension** – either a row or a column – and to share free space between them.

Before Flexbox, centering something vertically or making equal-height columns needed floats, tables or hacks. Flexbox solves these in one or two lines.

Analogy: imagine a bookshelf (the **container**) and books (the **items**). Flexbox lets you decide whether books stand left-to-right or stack top-to-bottom, whether they bunch at one end, spread out evenly, or sit centered.

Only the **direct children** of a flex container become flex items. Grandchildren are not affected.`,
      syntax: `.container {
  display: flex;        /* block-level flex container */
}
.inline-container {
  display: inline-flex; /* flex container that flows inline like a word */
}`,
    },
    {
      heading: 'Main axis and cross axis',
      content: `Every flex container has two axes:

- **Main axis** – the direction items are placed in. With the default \`flex-direction: row\` it runs left → right.
- **Cross axis** – perpendicular to the main axis. For a row, it runs top → bottom.

This matters because \`justify-content\` always works on the **main axis** and \`align-items\` always works on the **cross axis**. When you switch to \`flex-direction: column\`, the axes swap – so justify-content now controls vertical placement.

\`flex-direction\` values:
- \`row\` (default) – left to right
- \`row-reverse\` – right to left
- \`column\` – top to bottom
- \`column-reverse\` – bottom to top`,
      tip: 'Common mistake: using justify-content to center vertically in a row. In a row, vertical = cross axis, so use align-items.',
    },
    {
      heading: 'justify-content: spacing along the main axis',
      content: `\`justify-content\` decides what to do with **leftover space** on the main axis.

- \`flex-start\` (default) – items packed at the start
- \`flex-end\` – packed at the end
- \`center\` – packed in the middle
- \`space-between\` – first item at start, last at end, equal gaps between
- \`space-around\` – equal space around each item (edges get half-size gaps)
- \`space-evenly\` – all gaps, including edges, exactly equal

A navbar with the logo on the left and links on the right is the classic \`space-between\` use case.`,
      syntax: `.navbar {
  display: flex;
  justify-content: space-between;
}`,
    },
    {
      heading: 'align-items and align-content: the cross axis',
      content: `\`align-items\` aligns items **inside their line** along the cross axis:
- \`stretch\` (default) – items stretch to fill the container height (that's why flex columns are equal height!)
- \`flex-start\` / \`flex-end\` – top / bottom (in a row)
- \`center\` – vertically centered (in a row)
- \`baseline\` – aligns the first line of text in each item

\`align-content\` only works when there are **multiple lines** (flex-wrap: wrap). It distributes the lines themselves, accepting the same values as justify-content plus stretch.`,
      syntax: `.hero {
  display: flex;
  justify-content: center; /* horizontal */
  align-items: center;     /* vertical */
  min-height: 300px;
}`,
      tip: 'Perfect centering in Flexbox = display:flex + justify-content:center + align-items:center. Remember the container needs a height for vertical centering to be visible.',
    },
    {
      heading: 'flex-wrap, flex-flow and gap',
      content: `By default flex items stay on **one line** and shrink to fit (\`flex-wrap: nowrap\`). That can squash items on small screens.

- \`flex-wrap: wrap\` – items move to new lines when there's no room
- \`flex-wrap: wrap-reverse\` – new lines go above

\`flex-flow\` is a shorthand for direction + wrap: \`flex-flow: row wrap;\`

\`gap\` adds space **between** items only (not at the outer edges). It replaces the old trick of margins on items plus negative margin on the container.
- \`gap: 16px\` – same row and column gap
- \`row-gap: 20px; column-gap: 10px;\` – separate values

**Coming next:** Day 18 – properties you put on the flex *items* (flex-grow, flex-shrink, flex-basis, order, align-self).`,
      syntax: `.tags {
  display: flex;
  flex-flow: row wrap;
  gap: 8px 12px; /* row-gap column-gap */
}`,
    },
  ],
  examples: [
    {
      title: 'Responsive navbar with space-between',
      scenario: 'A website header needs the logo on the left and menu links on the right, vertically centered.',
      steps: [
        'Create a <nav> containing a logo div and a <ul> of links',
        'Make nav a flex container with justify-content: space-between and align-items: center',
        'Make the <ul> a flex container too, with gap',
        'Run and resize the preview',
      ],
      code: `nav { display: flex; justify-content: space-between; align-items: center; }
nav ul { display: flex; gap: 20px; list-style: none; }`,
      playground: {
        html: `<nav>
  <div class="logo">Shop<span>Ly</span></div>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Products</a></li>
    <li><a href="#">About</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #0f172a;
}
.logo { color: #fff; font-size: 1.5rem; font-weight: 800; }
.logo span { color: #38bdf8; }
nav ul { display: flex; gap: 20px; list-style: none; margin: 0; padding: 0; }
nav a { color: #cbd5e1; text-decoration: none; }
nav a:hover { color: #fff; }`,
      },
      result: 'A dark bar with the logo on the far left and four links evenly spaced on the far right.',
      explanation: 'space-between pushes the two children (logo, ul) to opposite ends. align-items: center vertically aligns the logo text with the links. The nested flex on ul plus gap spaces the links.',
    },
    {
      title: 'justify-content playground: compare all values',
      scenario: 'See the difference between every justify-content value side by side.',
      steps: [
        'Create six .row containers each with three .box items',
        'Give each row a different justify-content value',
        'Run and compare where the free space goes',
      ],
      code: `.row { display: flex; }
.start   { justify-content: flex-start; }
.between { justify-content: space-between; }
.evenly  { justify-content: space-evenly; }`,
      playground: {
        html: `<p>flex-start</p><div class="row" style="justify-content:flex-start"><b>1</b><b>2</b><b>3</b></div>
<p>flex-end</p><div class="row" style="justify-content:flex-end"><b>1</b><b>2</b><b>3</b></div>
<p>center</p><div class="row" style="justify-content:center"><b>1</b><b>2</b><b>3</b></div>
<p>space-between</p><div class="row" style="justify-content:space-between"><b>1</b><b>2</b><b>3</b></div>
<p>space-around</p><div class="row" style="justify-content:space-around"><b>1</b><b>2</b><b>3</b></div>
<p>space-evenly</p><div class="row" style="justify-content:space-evenly"><b>1</b><b>2</b><b>3</b></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 8px; }
p { margin: 10px 0 4px; font-size: 13px; color: #475569; font-family: monospace; }
.row { display: flex; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 4px; }
.row b { width: 50px; padding: 10px 0; text-align: center; background: #6366f1; color: #fff; border-radius: 4px; }`,
      },
      result: 'Six grey strips showing three purple boxes placed at the start, end, center, and distributed with different spacing patterns.',
      explanation: 'Each row has the same items but a different strategy for the leftover horizontal space. space-around gives half-gaps at the edges; space-evenly makes every gap identical.',
    },
    {
      title: 'Perfectly centered login card',
      scenario: 'Center a card both horizontally and vertically inside the full viewport.',
      steps: [
        'Give body min-height: 100vh and display: flex',
        'Add justify-content: center and align-items: center',
        'Place a .card inside',
        'Run – the card stays in the middle at any size',
      ],
      code: `body {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}`,
      playground: {
        html: `<div class="card">
  <h2>Welcome back</h2>
  <input placeholder="Email">
  <input placeholder="Password" type="password">
  <button>Log in</button>
</div>`,
        css: `* { box-sizing: border-box; }
body {
  margin: 0;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #a5b4fc, #f0abfc);
  font-family: system-ui, sans-serif;
}
.card {
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 280px;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,.15);
}
.card h2 { margin: 0 0 4px; }
input, button { padding: 10px; border-radius: 6px; border: 1px solid #cbd5e1; font: inherit; }
button { background: #4f46e5; color: #fff; border: none; cursor: pointer; }`,
      },
      result: 'A white login card sits exactly in the center of a purple-pink gradient background.',
      explanation: 'The body is the flex container; its one child (the card) is centered on both axes. Inside the card, flex-direction: column stacks the inputs, and gap spaces them evenly.',
    },
    {
      title: 'Wrapping tag list with flex-wrap and gap',
      scenario: 'A list of skill tags must wrap onto new lines instead of overflowing on narrow screens.',
      steps: [
        'Create a .tags container with many <span> tags',
        'Add display: flex, flex-wrap: wrap and gap',
        'Run and narrow the preview to watch the tags wrap',
        'Change wrap to nowrap to see the overflow problem',
      ],
      code: `.tags { display: flex; flex-wrap: wrap; gap: 8px; }`,
      playground: {
        html: `<h3>Skills</h3>
<div class="tags">
  <span>HTML</span><span>CSS</span><span>JavaScript</span><span>React</span>
  <span>Node.js</span><span>Git</span><span>Flexbox</span><span>Grid</span>
  <span>Accessibility</span><span>TypeScript</span><span>Figma</span><span>REST APIs</span>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 360px;
  padding: 12px;
  border: 2px dashed #94a3b8;
}
.tags span { padding: 6px 12px; background: #dcfce7; color: #166534; border-radius: 999px; font-size: 14px; }`,
      },
      result: 'Green pill-shaped tags flow across several lines inside a dashed box with even 8px spacing.',
      explanation: 'flex-wrap: wrap lets items move to a new line when the 360px container is full. gap adds space between tags and between lines without extra margins at the edges.',
    },
  ],
  interview: [
    { q: 'What is Flexbox?', a: 'A one-dimensional CSS layout model that arranges child items along a main axis (row or column) and distributes free space and alignment between them.', level: 'Easy' },
    { q: 'What is the difference between the main axis and the cross axis?', a: 'The main axis follows flex-direction (horizontal for row, vertical for column). The cross axis is perpendicular to it. justify-content works on the main axis, align-items on the cross axis.', level: 'Easy' },
    { q: 'How do you center a div horizontally and vertically using Flexbox?', a: 'On the parent: display: flex; justify-content: center; align-items: center; and make sure the parent has a height (e.g. min-height: 100vh).', level: 'Easy' },
    { q: 'What is the difference between space-between, space-around and space-evenly?', a: 'space-between puts no space at edges and equal space between items; space-around gives each item equal space on both sides so edge gaps are half of inner gaps; space-evenly makes all gaps including edges equal.', level: 'Medium' },
    { q: 'What is the difference between align-items and align-content?', a: 'align-items aligns items within each flex line on the cross axis. align-content distributes multiple lines in the container and only has an effect when flex-wrap is wrap and there is extra cross-axis space.', level: 'Medium' },
    { q: 'What is the default value of flex-wrap and what problem can it cause?', a: 'nowrap. All items stay on one line and shrink, which can squash or overflow content on small screens.', level: 'Easy' },
    { q: 'Why are flex columns equal height by default?', a: 'Because align-items defaults to stretch, so every item stretches to the height of the tallest one in the line.', level: 'Medium' },
    { q: 'What is the difference between display: flex and display: inline-flex?', a: 'Both make a flex container for children. flex makes the container block-level (full width, new line); inline-flex makes it inline-level so it sits in text flow and is only as wide as its content.', level: 'Medium' },
    { q: 'Why is gap better than margins for spacing flex items?', a: 'gap only adds space between items, never at the outer edges, so no negative margins or :last-child resets are needed, and it works the same with wrapping.', level: 'Medium' },
    { q: 'If flex-direction is column, which property centers items horizontally?', a: 'align-items: center, because in a column the cross axis is horizontal.', level: 'Hard' },
    { q: 'What is flex-flow?', a: 'Shorthand for flex-direction and flex-wrap, e.g. flex-flow: column wrap.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a footer with three link groups spread evenly across the width.',
      hint: 'display: flex; justify-content: space-evenly;',
      solution: `<style>
  footer { display: flex; justify-content: space-evenly; padding: 24px; background: #111; color: #eee; }
  footer div { display: flex; flex-direction: column; gap: 6px; }
</style>
<footer>
  <div><b>Company</b><span>About</span><span>Careers</span></div>
  <div><b>Help</b><span>FAQ</span><span>Support</span></div>
  <div><b>Legal</b><span>Privacy</span><span>Terms</span></div>
</footer>`,
    },
    {
      task: 'Create a 200px tall box with an icon centered inside using Flexbox.',
      hint: 'Use both justify-content and align-items.',
      solution: `<style>
  .box { height: 200px; display: flex; justify-content: center; align-items: center; background: #eef; font-size: 48px; }
</style>
<div class="box">★</div>`,
    },
    {
      task: 'Make a vertical sidebar menu using flex-direction: column with 10px gap and the last item pushed to the bottom.',
      hint: 'Give the container a height and use justify-content: space-between on a wrapper, or margin-top: auto on the last item.',
      solution: `<style>
  .side { display: flex; flex-direction: column; gap: 10px; height: 300px; width: 180px; padding: 12px; background: #1e293b; }
  .side a { color: #fff; }
  .side .logout { margin-top: auto; }
</style>
<nav class="side"><a href="#">Dashboard</a><a href="#">Orders</a><a href="#">Settings</a><a class="logout" href="#">Logout</a></nav>`,
    },
    {
      task: 'Create a photo strip of 8 thumbnails that wraps and has 12px row gap and 6px column gap.',
      hint: 'flex-wrap: wrap; gap: 12px 6px;',
      solution: `<style>
  .strip { display: flex; flex-wrap: wrap; gap: 12px 6px; }
  .strip img { width: 100px; height: 80px; object-fit: cover; }
</style>
<div class="strip">
  <img src="https://picsum.photos/seed/1/200/160" alt=""><img src="https://picsum.photos/seed/2/200/160" alt="">
  <img src="https://picsum.photos/seed/3/200/160" alt=""><img src="https://picsum.photos/seed/4/200/160" alt="">
  <img src="https://picsum.photos/seed/5/200/160" alt=""><img src="https://picsum.photos/seed/6/200/160" alt="">
  <img src="https://picsum.photos/seed/7/200/160" alt=""><img src="https://picsum.photos/seed/8/200/160" alt="">
</div>`,
    },
  ],
  quiz: [
    { question: 'Which property controls alignment on the main axis?', options: ['align-items', 'justify-content', 'align-content', 'flex-wrap'], answer: 1, explanation: 'justify-content always works along the main axis.' },
    { question: 'What is the default flex-direction?', options: ['column', 'row-reverse', 'column-reverse', 'row'], answer: 3, explanation: 'Flex items flow in a row (left to right in LTR languages) by default.' },
    { question: 'Which justify-content value makes ALL gaps (including edges) equal?', options: ['space-evenly', 'space-around', 'space-between', 'center'], answer: 0, explanation: 'space-evenly distributes identical space everywhere.' },
    { question: 'align-content has an effect only when…', options: ['flex-direction is column', 'there is a single item', 'items wrap onto multiple lines', 'gap is set'], answer: 2, explanation: 'align-content distributes flex lines, so it needs more than one line.' },
    { question: 'Which elements become flex items when you set display: flex on a parent?', options: ['All descendants', 'Only direct children', 'Only block elements', 'Only elements with a class'], answer: 1, explanation: 'Only direct children participate in the flex layout.' },
  ],
};
