export default {
  id: 'day-19-css-grid-basics',
  title: 'CSS Grid Basics: grid-template-columns/rows, fr Unit, gap, repeat()',
  module: 'Module 4: Layout',
  day: 19,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'CSS Grid is a two-dimensional layout system that controls rows AND columns at the same time. Today you learn to define tracks, use the fr unit, add gaps, use repeat() and place items on grid lines.',
  objectives: [
    'Create a grid container and define columns and rows with grid-template-columns / grid-template-rows',
    'Use the fr unit to share free space and combine it with px, % and auto',
    'Simplify track lists with repeat() and add spacing with gap',
    'Place items using grid line numbers with grid-column and grid-row',
  ],
  theory: [
    {
      heading: 'What is CSS Grid?',
      content: `**CSS Grid Layout** lets you divide a container into **rows and columns** and place items into the resulting cells. It is **two-dimensional**, while Flexbox is one-dimensional.

Analogy: Flexbox is a single shelf of books; Grid is a spreadsheet or a chessboard where you control both rows and columns.

Vocabulary:
- **Grid container** – element with \`display: grid\`
- **Grid items** – its direct children
- **Grid lines** – the dividing lines, numbered from 1
- **Grid track** – a single row or column
- **Grid cell** – one intersection of a row and column
- **Grid area** – a rectangle of one or more cells`,
      syntax: `.grid {
  display: grid;
  grid-template-columns: 200px 200px 200px;
}`,
    },
    {
      heading: 'Defining columns and rows',
      content: `\`grid-template-columns\` lists the **width** of each column, separated by spaces. The number of values = number of columns.

\`grid-template-rows\` lists the **height** of each row. Rows you don't define are created automatically (**implicit rows**) and sized by \`grid-auto-rows\` (default \`auto\` = fit content).

You can mix units: \`px\`, \`%\`, \`em\`, \`auto\`, \`fr\`.`,
      syntax: `.page {
  display: grid;
  grid-template-columns: 250px auto 150px;
  grid-template-rows: 80px 1fr 60px;
  grid-auto-rows: 120px; /* any extra rows */
}`,
    },
    {
      heading: 'The fr unit',
      content: `**fr** = "fraction of the free space". After fixed sizes (px, auto content) are subtracted, the remaining space is divided by the total number of fr.

- \`1fr 1fr 1fr\` → three equal columns
- \`2fr 1fr\` → first column twice as wide as second
- \`250px 1fr\` → fixed sidebar + fluid content

Why not percentages? \`33.33%\` columns plus a gap overflow the container, because % ignores the gap. **fr is calculated after the gap is removed**, so it always fits.`,
      tip: 'Prefer fr over % in grids. 3 × 33.33% + 2 gaps = more than 100% → horizontal scrollbar!',
    },
    {
      heading: 'repeat() and gap',
      content: `\`repeat(count, size)\` saves typing:
- \`repeat(4, 1fr)\` = \`1fr 1fr 1fr 1fr\`
- \`repeat(3, 100px 1fr)\` = six tracks alternating
- \`200px repeat(2, 1fr)\` – mix with other values

\`gap\` (formerly \`grid-gap\`) sets space between tracks:
- \`gap: 20px\` – rows and columns
- \`gap: 10px 30px\` – row-gap then column-gap
- \`row-gap\`, \`column-gap\` individually

Gaps never appear on the outer edges.`,
      syntax: `.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}`,
    },
    {
      heading: 'Placing items with line numbers',
      content: `By default items fill cells one by one (auto-placement). You can also place them explicitly using **line numbers**:

- \`grid-column: 1 / 3\` – start at column line 1, end at line 3 (covers 2 columns)
- \`grid-row: 2 / 4\` – rows 2 and 3
- \`grid-column: 1 / -1\` – from the first to the **last** line (full width), negative numbers count from the end

A 3-column grid has **4** column lines. Remember: lines, not cells!

**Coming next:** Day 20 – named areas, \`span\`, auto-fit/auto-fill and minmax() for responsive grids without media queries.`,
      syntax: `.header { grid-column: 1 / -1; }  /* full width */
.sidebar { grid-row: 2 / 4; }`,
    },
  ],
  examples: [
    {
      title: 'Three equal columns with fr and gap',
      scenario: 'A features section with six feature cards in three equal columns.',
      steps: [
        'Create a .features container with six .card divs',
        'Set display: grid and grid-template-columns: repeat(3, 1fr)',
        'Add gap: 16px',
        'Run – the cards form a 3 × 2 grid',
      ],
      code: `.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}`,
      playground: {
        html: `<section class="features">
  <div class="card">⚡ Fast</div>
  <div class="card">🔒 Secure</div>
  <div class="card">📱 Responsive</div>
  <div class="card">☁️ Cloud</div>
  <div class="card">🎨 Themes</div>
  <div class="card">💬 Support</div>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f8fafc; }
.features {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
.card { padding: 28px 12px; text-align: center; background: #fff; border: 2px solid #c7d2fe; border-radius: 10px; font-weight: 600; }`,
      },
      result: 'Six white cards arranged in two rows of three equal columns with 16px spacing.',
      explanation: 'repeat(3, 1fr) creates three columns that each take one third of the free space after the two 16px gaps are subtracted. The 4th–6th items automatically flow into a new implicit row.',
    },
    {
      title: 'Mixing fixed and flexible tracks',
      scenario: 'Compare 1fr 1fr 1fr, 2fr 1fr and 150px 1fr side by side.',
      steps: [
        'Create three grids with the same items',
        'Give each a different grid-template-columns',
        'Run and compare column widths',
      ],
      code: `.g1 { grid-template-columns: 1fr 1fr 1fr; }
.g2 { grid-template-columns: 2fr 1fr; }
.g3 { grid-template-columns: 150px 1fr; }`,
      playground: {
        html: `<p>1fr 1fr 1fr</p><div class="g g1"><div>1fr</div><div>1fr</div><div>1fr</div></div>
<p>2fr 1fr</p><div class="g g2"><div>2fr</div><div>1fr</div></div>
<p>150px 1fr</p><div class="g g3"><div>150px</div><div>1fr (rest)</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
p { font-family: monospace; margin: 12px 0 4px; }
.g { display: grid; gap: 8px; }
.g div { padding: 16px; background: #14b8a6; color: #fff; text-align: center; border-radius: 6px; }
.g1 { grid-template-columns: 1fr 1fr 1fr; }
.g2 { grid-template-columns: 2fr 1fr; }
.g3 { grid-template-columns: 150px 1fr; }`,
      },
      result: 'Row 1: three equal boxes. Row 2: a box twice as wide as its neighbour. Row 3: a fixed 150px box and a box filling the rest.',
      explanation: 'fr distributes free space proportionally; fixed tracks are reserved first.',
    },
    {
      title: 'Page layout with line-based placement',
      scenario: 'Build a header / sidebar / content / footer layout using grid lines.',
      steps: [
        'Create header, aside, main, footer inside .page',
        'Define 2 columns (200px 1fr) and 3 rows (auto 1fr auto)',
        'Span header and footer across both columns with grid-column: 1 / -1',
        'Run',
      ],
      code: `.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  min-height: 300px;
}
header, footer { grid-column: 1 / -1; }`,
      playground: {
        html: `<div class="page">
  <header>Header (1 / -1)</header>
  <aside>Sidebar</aside>
  <main>Main content</main>
  <footer>Footer (1 / -1)</footer>
</div>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-rows: auto 1fr auto;
  gap: 8px;
  min-height: 320px;
  padding: 8px;
}
.page > * { padding: 16px; border-radius: 6px; color: #fff; }
header, footer { grid-column: 1 / -1; }
header { background: #7c3aed; }
aside { background: #db2777; }
main { background: #2563eb; }
footer { background: #475569; }`,
      },
      result: 'A purple full-width header, a pink sidebar and blue main side by side, and a grey full-width footer.',
      explanation: 'grid-column: 1 / -1 stretches from the first to the last column line. The middle row is 1fr so it fills the remaining height of the 320px container.',
    },
    {
      title: 'Explicit rows and grid-auto-rows',
      scenario: 'A photo gallery where every row is exactly 120px tall no matter how many photos are added.',
      steps: [
        'Create a grid with repeat(4, 1fr) columns',
        'Set grid-auto-rows: 120px',
        'Add 8 images with object-fit: cover',
        'Run',
      ],
      code: `.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 120px;
  gap: 6px;
}`,
      playground: {
        html: `<div class="gallery">
  <img src="https://picsum.photos/seed/g1/300/200" alt="">
  <img src="https://picsum.photos/seed/g2/300/200" alt="">
  <img src="https://picsum.photos/seed/g3/300/200" alt="">
  <img src="https://picsum.photos/seed/g4/300/200" alt="">
  <img src="https://picsum.photos/seed/g5/300/200" alt="">
  <img src="https://picsum.photos/seed/g6/300/200" alt="">
  <img src="https://picsum.photos/seed/g7/300/200" alt="">
  <img src="https://picsum.photos/seed/g8/300/200" alt="">
</div>`,
        css: `body { padding: 12px; }
.gallery {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 120px;
  gap: 6px;
}
.gallery img { width: 100%; height: 100%; object-fit: cover; border-radius: 6px; }`,
      },
      result: 'Eight photos in a neat 4 × 2 grid, each cell exactly 120px tall.',
      explanation: 'Rows are created implicitly by auto-placement; grid-auto-rows gives every implicit row the same height.',
    },
  ],
  interview: [
    { q: 'What is CSS Grid and how does it differ from Flexbox?', a: 'Grid is a two-dimensional layout system controlling rows and columns together. Flexbox is one-dimensional (one row or column at a time). Grid is layout-first (define tracks then place content); Flexbox is content-first.', level: 'Easy' },
    { q: 'What is the fr unit?', a: 'A flexible length representing a fraction of the free space in the grid container after fixed tracks and gaps are subtracted.', level: 'Easy' },
    { q: 'Why is 1fr usually better than 33.33% for columns?', a: 'Percentages are calculated from the container width and ignore gaps, so they can overflow. fr divides only the remaining space after gaps.', level: 'Medium' },
    { q: 'What does repeat(3, 1fr) mean?', a: 'It is shorthand for 1fr 1fr 1fr – three equal-width tracks.', level: 'Easy' },
    { q: 'How many grid lines does a 4-column grid have?', a: 'Five column lines (numbered 1 to 5, or -5 to -1).', level: 'Medium' },
    { q: 'What does grid-column: 1 / -1 do?', a: 'Makes the item span from the first column line to the last, i.e. the full width of the explicit grid.', level: 'Medium' },
    { q: 'What is the difference between explicit and implicit grid?', a: 'The explicit grid is defined by grid-template-columns/rows. Extra tracks created automatically when items do not fit are the implicit grid, sized by grid-auto-rows/grid-auto-columns.', level: 'Hard' },
    { q: 'What does grid-auto-rows do?', a: 'Sets the size of implicitly created rows.', level: 'Medium' },
    { q: 'Is grid-gap still valid?', a: 'It is an older alias kept for compatibility. The standard property is gap (with row-gap and column-gap), which also works for Flexbox.', level: 'Easy' },
    { q: 'Which elements become grid items?', a: 'Only the direct children of the grid container (unless subgrid or display: contents is used).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a 4-column product grid with 20px gap containing 8 product cards.',
      hint: 'repeat(4, 1fr)',
      solution: `<style>
  .products { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
  .products div { padding: 30px; background: #f3f4f6; text-align: center; }
</style>
<div class="products"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div><div>8</div></div>`,
    },
    {
      task: 'Build a layout with a 240px left sidebar, fluid content and a 180px right ad column.',
      hint: 'grid-template-columns: 240px 1fr 180px;',
      solution: `<style>
  .wrap { display: grid; grid-template-columns: 240px 1fr 180px; gap: 12px; min-height: 200px; }
  .wrap > * { background: #ddd; padding: 12px; }
</style>
<div class="wrap"><aside>Left</aside><main>Content</main><aside>Ads</aside></div>`,
    },
    {
      task: 'In a 3-column grid, make the first item span two columns and the fourth item span two rows.',
      hint: 'grid-column: 1 / 3; grid-row: span 2 or line numbers.',
      solution: `<style>
  .g { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 80px; gap: 8px; }
  .g div { background: steelblue; color: #fff; padding: 8px; }
  .g div:nth-child(1) { grid-column: 1 / 3; }
  .g div:nth-child(4) { grid-row: 2 / 4; }
</style>
<div class="g"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>`,
    },
    {
      task: 'Make a calendar month grid: 7 equal columns, rows 80px tall, 1px gap with a grey background showing as lines.',
      hint: 'Set the container background to grey and gap: 1px; items white.',
      solution: `<style>
  .cal { display: grid; grid-template-columns: repeat(7, 1fr); grid-auto-rows: 80px; gap: 1px; background: #ccc; border: 1px solid #ccc; }
  .cal div { background: #fff; padding: 4px; }
</style>
<div class="cal">
  <div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div><div>7</div>
  <div>8</div><div>9</div><div>10</div><div>11</div><div>12</div><div>13</div><div>14</div>
</div>`,
    },
  ],
  quiz: [
    { question: 'What does 1fr represent?', options: ['1 pixel', '1% of the viewport', 'One fraction of the free space', 'One font size'], answer: 2, explanation: 'fr = fraction of the remaining free space in the grid container.' },
    { question: 'grid-template-columns: repeat(2, 100px 1fr) creates how many columns?', options: ['2', '4', '3', '1'], answer: 1, explanation: 'The pattern "100px 1fr" is repeated twice = 4 tracks.' },
    { question: 'Which places an item across the full width of the grid?', options: ['grid-column: 1 / -1', 'grid-column: all', 'grid-row: 1 / -1', 'width: 100%'], answer: 0, explanation: 'Line 1 to line -1 spans every column.' },
    { question: 'Which property sizes rows that are created automatically?', options: ['grid-template-rows', 'row-gap', 'grid-auto-flow', 'grid-auto-rows'], answer: 3, explanation: 'grid-auto-rows controls implicit row size.' },
    { question: 'Grid is best described as a ___ layout system.', options: ['one-dimensional', 'two-dimensional', 'float-based', 'table-based'], answer: 1, explanation: 'Grid controls rows and columns simultaneously.' },
  ],
};
