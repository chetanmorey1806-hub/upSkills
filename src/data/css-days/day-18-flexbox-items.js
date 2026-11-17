export default {
  id: 'day-18-flexbox-items',
  title: 'Flexbox: Item Properties (flex-grow, flex-shrink, flex-basis, order, align-self)',
  module: 'Module 4: Layout',
  day: 18,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Yesterday you controlled the flex container; today you control each individual flex item: how much it grows, how much it shrinks, its starting size, its visual order and its own alignment.',
  objectives: [
    'Use flex-grow to share extra space and flex-shrink to share missing space',
    'Set an item\'s starting size with flex-basis and understand how it relates to width',
    'Read and write the flex shorthand (flex: 1, flex: 0 0 200px, flex: auto, flex: none)',
    'Reorder items visually with order and override alignment with align-self',
  ],
  theory: [
    {
      heading: 'flex-basis: the starting size',
      content: `\`flex-basis\` sets the **initial main-size** of an item **before** free space is shared out. In a row it acts like width; in a column it acts like height.

- \`flex-basis: auto\` (default) – use the item's \`width\`/\`height\` if set, otherwise its content size
- \`flex-basis: 200px\` / \`30%\` – start at that size
- \`flex-basis: 0\` – start from zero, so ALL space is shared by flex-grow ratios

Analogy: flex-basis is how big each guest's plate is before dessert (extra space) gets shared out.`,
      syntax: `.sidebar { flex-basis: 250px; }`,
      tip: 'If both width and flex-basis are set, flex-basis wins (in a row). min-width/max-width still clamp it.',
    },
    {
      heading: 'flex-grow: sharing extra space',
      content: `When the container is **bigger** than the sum of the items' basis sizes, there's **positive free space**. \`flex-grow\` is a unitless number saying what **share** of that space an item takes.

- \`flex-grow: 0\` (default) – don't grow
- \`flex-grow: 1\` on all items – share space equally
- One item \`flex-grow: 2\`, others \`1\` – that item gets twice as much **extra** space (not twice the total width!)

Example: container 600px, three items with basis 100px → 300px free. Grows 1, 1, 1 → each gets +100 → 200px each. Grows 2, 1, 1 → +150, +75, +75.`,
      syntax: `.search-input { flex-grow: 1; } /* fill remaining space */`,
    },
    {
      heading: 'flex-shrink: sharing missing space',
      content: `When items are **too big** for the container there's **negative free space**. \`flex-shrink\` decides who gives up space.

- \`flex-shrink: 1\` (default) – all items shrink proportionally (weighted by their basis)
- \`flex-shrink: 0\` – this item refuses to shrink (great for logos, icons, avatars)
- Higher numbers shrink faster

Items never shrink below their **min-content** size by default (\`min-width: auto\`). A long word or URL can therefore overflow. Fix with \`min-width: 0\` on the item.`,
      syntax: `.avatar { flex-shrink: 0; width: 48px; }`,
      tip: 'Squashed icons in a flex row? Add flex-shrink: 0 to the icon.',
    },
    {
      heading: 'The flex shorthand',
      content: `Always prefer the \`flex\` shorthand: \`flex: <grow> <shrink> <basis>\`.

Common values you must know by heart:
- \`flex: 1\` → \`1 1 0%\` – grow and shrink equally from zero → **equal-width columns**
- \`flex: auto\` → \`1 1 auto\` – grow/shrink but start from content size
- \`flex: none\` → \`0 0 auto\` – fully rigid
- \`flex: 0 0 200px\` → fixed 200px, never grows or shrinks
- \`flex: initial\` → \`0 1 auto\` – the default`,
      syntax: `.col { flex: 1; }             /* equal columns */
.fixed { flex: 0 0 240px; }  /* fixed sidebar */`,
    },
    {
      heading: 'order and align-self',
      content: `\`order\` (integer, default 0) changes the **visual** order. Lower numbers come first; equal values keep source order. Negative numbers are allowed.

**Accessibility warning:** order only changes what you see. Screen readers and the Tab key still follow the HTML source, so don't use order to fix content that is logically in the wrong place.

\`align-self\` overrides the container's \`align-items\` for **one** item: \`auto | flex-start | flex-end | center | baseline | stretch\`.

Bonus trick: \`margin-left: auto\` (or \`margin-top: auto\` in a column) on a flex item absorbs all free space and pushes it to the far end – perfect for a "Logout" link on the right.

**Coming next:** Day 19 – CSS Grid, for two-dimensional layouts.`,
      syntax: `.featured { order: -1; }       /* show first */
.badge { align-self: flex-start; }`,
    },
  ],
  examples: [
    {
      title: 'Search bar: input grows, button stays fixed',
      scenario: 'A search form where the input fills all available width and the button keeps its natural size.',
      steps: [
        'Create a form with an input and a button',
        'Make the form display: flex with gap',
        'Give the input flex: 1 and the button flex: none',
        'Run and resize – only the input stretches',
      ],
      code: `.search { display: flex; gap: 8px; }
.search input { flex: 1; min-width: 0; }
.search button { flex: none; }`,
      playground: {
        html: `<form class="search" onsubmit="return false">
  <input type="search" placeholder="Search products...">
  <button>Search</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 20px; }
.search { display: flex; gap: 8px; max-width: 600px; }
.search input { flex: 1; min-width: 0; padding: 12px; border: 2px solid #94a3b8; border-radius: 8px; font: inherit; }
.search button { flex: none; padding: 12px 20px; background: #16a34a; color: #fff; border: 0; border-radius: 8px; font: inherit; }`,
      },
      result: 'A wide search field with a green button; when you narrow the preview only the field shrinks.',
      explanation: 'flex: 1 makes the input absorb all free space. flex: none keeps the button rigid. min-width: 0 lets the input shrink below its default intrinsic size.',
    },
    {
      title: 'flex-grow ratios visualised',
      scenario: 'See how different flex-grow values split the extra space.',
      steps: [
        'Create three rows of three boxes each with flex-basis: 60px',
        'Row 1: no grow; Row 2: all grow 1; Row 3: middle grows 3',
        'Run and compare widths',
      ],
      code: `.r2 > div { flex-grow: 1; }
.r3 > div { flex-grow: 1; }
.r3 > div:nth-child(2) { flex-grow: 3; }`,
      playground: {
        html: `<p>flex-grow: 0 (default)</p>
<div class="row r1"><div>A</div><div>B</div><div>C</div></div>
<p>flex-grow: 1 on all</p>
<div class="row r2"><div>A</div><div>B</div><div>C</div></div>
<p>flex-grow: 1, 3, 1</p>
<div class="row r3"><div>1</div><div>3</div><div>1</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
p { font-family: monospace; margin: 12px 0 4px; }
.row { display: flex; gap: 6px; background: #f1f5f9; padding: 6px; }
.row > div { flex-basis: 60px; padding: 14px 0; text-align: center; color: #fff; background: #f97316; border-radius: 4px; }
.r2 > div { flex-grow: 1; }
.r3 > div { flex-grow: 1; }
.r3 > div:nth-child(2) { flex-grow: 3; background: #dc2626; }`,
      },
      result: 'Row 1 boxes stay small; Row 2 boxes are equal and fill the row; Row 3 middle box is much wider.',
      explanation: 'Each row starts with 60px items. The remaining width is split by grow ratios: 1:1:1 for row 2, 1:3:1 for row 3 – the red box receives three-fifths of the free space.',
    },
    {
      title: 'Fixed sidebar + fluid content (flex shorthand)',
      scenario: 'A dashboard where the sidebar is always 200px and the main area takes the rest.',
      steps: [
        'Create a .layout container with aside and main',
        'aside: flex: 0 0 200px; main: flex: 1',
        'Run and resize the preview',
      ],
      code: `.layout { display: flex; }
aside { flex: 0 0 200px; }
main { flex: 1; }`,
      playground: {
        html: `<div class="layout">
  <aside>Sidebar<br>(always 200px)</aside>
  <main>Main content grows and shrinks with the window.</main>
</div>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.layout { display: flex; min-height: 220px; }
aside { flex: 0 0 200px; background: #1e293b; color: #fff; padding: 16px; }
main { flex: 1; background: #e0f2fe; padding: 16px; }`,
      },
      result: 'A dark 200px sidebar on the left and a light blue main area filling the remaining width.',
      explanation: 'flex: 0 0 200px means no grow, no shrink, basis 200px. flex: 1 gives main all remaining space.',
    },
    {
      title: 'order, align-self and margin auto',
      scenario: 'A toolbar where a "Featured" item is moved first visually, one item aligns to the bottom, and a Logout link is pushed to the far right.',
      steps: [
        'Create a toolbar with five items',
        'Give the .featured item order: -1',
        'Give the .low item align-self: flex-end',
        'Give .logout margin-left: auto',
        'Run and observe',
      ],
      code: `.featured { order: -1; }
.low { align-self: flex-end; }
.logout { margin-left: auto; }`,
      playground: {
        html: `<div class="bar">
  <div>Home</div>
  <div class="low">Low</div>
  <div class="featured">★ Featured</div>
  <div>Blog</div>
  <div class="logout">Logout</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.bar { display: flex; align-items: flex-start; gap: 8px; height: 100px; padding: 8px; background: #fef3c7; border-radius: 8px; }
.bar > div { padding: 10px 14px; background: #fff; border: 1px solid #d97706; border-radius: 6px; }
.featured { order: -1; background: #d97706 !important; color: #fff; }
.low { align-self: flex-end; }
.logout { margin-left: auto; }`,
      },
      result: 'The "★ Featured" item appears first even though it is third in HTML, "Low" sits at the bottom of the bar, and "Logout" is pushed to the far right.',
      explanation: 'order: -1 is lower than everyone else\'s 0. align-self overrides align-items for one item. margin-left: auto eats all leftover main-axis space.',
    },
  ],
  interview: [
    { q: 'What does flex: 1 mean?', a: 'It is shorthand for flex-grow: 1; flex-shrink: 1; flex-basis: 0%. Items with flex: 1 share the container space equally.', level: 'Easy' },
    { q: 'Difference between flex-basis and width?', a: 'flex-basis sets the initial main-axis size used by the flex algorithm and overrides width in a row container. width is a general property; it is used when flex-basis is auto.', level: 'Medium' },
    { q: 'If one item has flex-grow: 2 and another 1, is the first item twice as wide?', a: 'Not necessarily. It receives twice as much of the extra (free) space. Only with flex-basis: 0 would the final sizes be in a 2:1 ratio.', level: 'Hard' },
    { q: 'How do you stop an icon from being squashed in a flex row?', a: 'Set flex-shrink: 0 (or flex: none) on the icon.', level: 'Easy' },
    { q: 'Why might a flex item with long text overflow instead of shrinking?', a: 'Flex items have min-width: auto, so they cannot shrink below their min-content width. Set min-width: 0 (or overflow: hidden) on the item.', level: 'Hard' },
    { q: 'What does the order property do and what is its accessibility concern?', a: 'It changes the visual order of flex items (default 0, lower first). It does not change DOM order, so keyboard and screen-reader order may not match the visual order.', level: 'Medium' },
    { q: 'What is align-self?', a: 'An item-level property that overrides the container\'s align-items for that single item on the cross axis.', level: 'Easy' },
    { q: 'Difference between flex: auto and flex: 1?', a: 'flex: auto is 1 1 auto (start from content size then share), flex: 1 is 1 1 0% (start from zero), so flex: 1 gives equal widths regardless of content.', level: 'Medium' },
    { q: 'What does flex: none mean?', a: '0 0 auto – the item neither grows nor shrinks; it keeps its content/width size.', level: 'Easy' },
    { q: 'How do you push one flex item to the end of the row?', a: 'Give it margin-left: auto (or margin-inline-start: auto). Auto margins absorb free space in flexbox.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create three equal-width pricing columns that stay equal regardless of text length.',
      hint: 'flex: 1 on each column.',
      solution: `<style>
  .plans { display: flex; gap: 12px; }
  .plans div { flex: 1; padding: 20px; border: 1px solid #ccc; border-radius: 8px; }
</style>
<div class="plans"><div>Basic</div><div>Pro plan with a much longer description text</div><div>Team</div></div>`,
    },
    {
      task: 'Build a chat message row: a 40px avatar that never shrinks and a message bubble that fills the rest.',
      hint: 'flex: 0 0 40px for the avatar; flex: 1 for the bubble.',
      solution: `<style>
  .msg { display: flex; gap: 10px; align-items: flex-start; }
  .msg .avatar { flex: 0 0 40px; height: 40px; border-radius: 50%; background: tomato; }
  .msg .bubble { flex: 1; background: #eef; padding: 10px; border-radius: 10px; }
</style>
<div class="msg"><div class="avatar"></div><div class="bubble">Hello! This message can be very long and the avatar will stay round.</div></div>`,
    },
    {
      task: 'In a card with a column layout, push the "Buy" button to the bottom of the card.',
      hint: 'flex-direction: column on the card, margin-top: auto on the button.',
      solution: `<style>
  .card { display: flex; flex-direction: column; height: 260px; width: 200px; padding: 12px; border: 1px solid #ddd; }
  .card button { margin-top: auto; }
</style>
<div class="card"><h3>Shoes</h3><p>Comfy running shoes.</p><button>Buy</button></div>`,
    },
    {
      task: 'On a row of 4 boxes, show the last box first using order and make the second box align to the center vertically.',
      hint: 'order: -1; align-self: center.',
      solution: `<style>
  .row { display: flex; height: 120px; gap: 6px; align-items: flex-start; }
  .row div { padding: 10px; background: #ddd; }
  .row div:last-child { order: -1; }
  .row div:nth-child(2) { align-self: center; }
</style>
<div class="row"><div>1</div><div>2</div><div>3</div><div>4</div></div>`,
    },
  ],
  quiz: [
    { question: 'flex: 1 is equivalent to…', options: ['1 0 auto', '1 1 0%', '0 1 auto', '1 1 auto'], answer: 1, explanation: 'flex: 1 expands to flex-grow 1, flex-shrink 1, flex-basis 0%.' },
    { question: 'Which property prevents an item from shrinking?', options: ['flex-grow: 0', 'flex-basis: 0', 'flex-shrink: 0', 'order: 0'], answer: 2, explanation: 'flex-shrink: 0 means the item does not give up space.' },
    { question: 'What is the default value of order?', options: ['0', '1', '-1', 'auto'], answer: 0, explanation: 'All flex items start with order: 0.' },
    { question: 'Which property overrides align-items for a single item?', options: ['justify-self', 'align-content', 'place-items', 'align-self'], answer: 3, explanation: 'align-self applies only to the item it is set on.' },
    { question: 'What does flex: 0 0 250px create?', options: ['An item that grows from 250px', 'A fixed 250px item that neither grows nor shrinks', 'An item hidden at 250px', 'An item that only shrinks'], answer: 1, explanation: 'grow 0, shrink 0, basis 250px = rigid 250px.' },
  ],
};
