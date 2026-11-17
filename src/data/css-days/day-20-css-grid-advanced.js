export default {
  id: 'day-20-css-grid-advanced',
  title: 'CSS Grid Advanced: grid-template-areas, Spanning, auto-fit/auto-fill, minmax()',
  module: 'Module 4: Layout',
  day: 20,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Level up your Grid skills: name regions of your layout with grid-template-areas, span items across tracks, and build fully responsive card grids without a single media query using repeat(auto-fit, minmax()).',
  objectives: [
    'Draw a page layout visually with grid-template-areas and grid-area',
    'Span items across multiple rows/columns with the span keyword',
    'Use minmax() to set flexible track size limits',
    'Explain and use the difference between auto-fit and auto-fill',
  ],
  theory: [
    {
      heading: 'grid-template-areas: draw your layout in ASCII',
      content: `\`grid-template-areas\` lets you **name** regions of the grid using strings. Each string is one row; each word is one cell. Repeating a name across cells makes that area span them.

Then each item says which area it goes into with \`grid-area: name\`.

Rules:
- Every row string must have the **same number of cells**
- Areas must be **rectangles** (no L-shapes)
- Use a dot \`.\` for an empty cell

Analogy: it's like drawing a floor plan of a house and labelling the rooms.`,
      syntax: `.page {
  display: grid;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    "header header"
    "sidebar main"
    "footer footer";
}
header { grid-area: header; }
aside  { grid-area: sidebar; }`,
      tip: 'Changing the layout for mobile becomes trivial – just redefine grid-template-areas inside a media query.',
    },
    {
      heading: 'Spanning with the span keyword',
      content: `Instead of calculating line numbers, use \`span N\`:

- \`grid-column: span 2\` – take 2 columns starting wherever auto-placement puts the item
- \`grid-row: span 3\` – take 3 rows
- \`grid-column: 2 / span 2\` – start at line 2, cover 2 columns

\`grid-auto-flow: dense\` tells the auto-placement algorithm to **backfill holes** left by large items with later, smaller items – great for masonry-like galleries (visual order may then differ from source order).`,
      syntax: `.featured { grid-column: span 2; grid-row: span 2; }
.gallery { grid-auto-flow: dense; }`,
    },
    {
      heading: 'minmax(min, max)',
      content: `\`minmax()\` defines a size **range** for a track: never smaller than *min*, never larger than *max*.

- \`minmax(200px, 1fr)\` – at least 200px, otherwise share free space
- \`minmax(100px, auto)\` – rows at least 100px but grow with content
- \`minmax(0, 1fr)\` – lets a column shrink below its content's min size (fixes overflow from long words / wide images)

Fun fact: \`1fr\` alone actually behaves like \`minmax(auto, 1fr)\`, which is why a long URL can push a 1fr column wider.`,
      syntax: `.cards { grid-template-columns: repeat(3, minmax(200px, 1fr)); }
.rows  { grid-auto-rows: minmax(120px, auto); }`,
    },
    {
      heading: 'auto-fit vs auto-fill: responsive without media queries',
      content: `Inside \`repeat()\` you can replace the number with \`auto-fill\` or \`auto-fit\`. The browser then creates **as many columns as fit**.

\`repeat(auto-fill, minmax(200px, 1fr))\`:
- Creates as many 200px+ columns as fit; **empty tracks are kept**, so few items stay at their minimum-ish width

\`repeat(auto-fit, minmax(200px, 1fr))\`:
- Same, but **empty tracks collapse to 0**, so the existing items **stretch** to fill the row

When the row is full, both behave identically. The difference only shows when there are fewer items than columns.

This one line is the famous **"RAM" pattern** (Repeat, Auto, Minmax) – a responsive card grid with zero media queries.

**Coming next:** Day 21 – centering techniques and classic layout patterns.`,
      syntax: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}`,
      tip: 'Use min(220px, 100%) as the minimum – repeat(auto-fit, minmax(min(220px, 100%), 1fr)) – so cards never overflow on tiny phones.',
    },
    {
      heading: 'Alignment in Grid',
      content: `Grid uses the same alignment vocabulary as Flexbox:

- \`justify-items\` / \`align-items\` – align items **inside their cells** (horizontal / vertical). Default \`stretch\`.
- \`justify-self\` / \`align-self\` – the same for one item
- \`justify-content\` / \`align-content\` – align the **whole grid** inside the container when tracks are smaller than it
- \`place-items: center\` – shorthand for align-items + justify-items (the shortest way to center anything!)`,
      syntax: `.box { display: grid; place-items: center; }`,
    },
  ],
  examples: [
    {
      title: 'Holy-grail page with grid-template-areas',
      scenario: 'Build a full page layout by literally drawing it with area names.',
      steps: [
        'Create header, nav, main, aside, footer inside .page',
        'Define grid-template-columns and grid-template-areas',
        'Assign grid-area to each element',
        'Run and read the CSS strings – they match what you see',
      ],
      code: `.page {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
}`,
      playground: {
        html: `<div class="page">
  <header>header</header>
  <nav>nav</nav>
  <main>main</main>
  <aside>aside</aside>
  <footer>footer</footer>
</div>`,
        css: `body { margin: 0; font-family: monospace; font-size: 18px; }
.page {
  display: grid;
  grid-template-columns: 160px 1fr 160px;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: 8px;
  min-height: 340px;
  padding: 8px;
}
.page > * { padding: 16px; color: #fff; border-radius: 6px; }
header { grid-area: header; background: #0f766e; }
nav    { grid-area: nav;    background: #9333ea; }
main   { grid-area: main;   background: #2563eb; }
aside  { grid-area: aside;  background: #c2410c; }
footer { grid-area: footer; background: #334155; }`,
      },
      result: 'A layout matching the ASCII drawing: full header, three columns (nav, main, aside), full footer.',
      explanation: 'Each string is a row; repeating "header" three times makes the header span all columns. grid-area links each element to its named region.',
    },
    {
      title: 'Responsive card grid with auto-fit + minmax (no media queries)',
      scenario: 'A blog listing that shows 1 column on phones, 2 on tablets and 3–4 on desktop automatically.',
      steps: [
        'Create a .grid with 6 .card articles',
        'Set grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr))',
        'Run and drag the preview width – columns appear and disappear',
      ],
      code: `.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 16px;
}`,
      playground: {
        html: `<div class="grid">
  <article class="card"><img src="https://picsum.photos/seed/c1/400/240" alt=""><h3>Post One</h3></article>
  <article class="card"><img src="https://picsum.photos/seed/c2/400/240" alt=""><h3>Post Two</h3></article>
  <article class="card"><img src="https://picsum.photos/seed/c3/400/240" alt=""><h3>Post Three</h3></article>
  <article class="card"><img src="https://picsum.photos/seed/c4/400/240" alt=""><h3>Post Four</h3></article>
  <article class="card"><img src="https://picsum.photos/seed/c5/400/240" alt=""><h3>Post Five</h3></article>
  <article class="card"><img src="https://picsum.photos/seed/c6/400/240" alt=""><h3>Post Six</h3></article>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f1f5f9; }
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
  gap: 16px;
}
.card { background: #fff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,.08); }
.card img { width: 100%; display: block; aspect-ratio: 5 / 3; object-fit: cover; }
.card h3 { margin: 0; padding: 12px; font-size: 1rem; }`,
      },
      result: 'Cards rearrange from 1 to 2 to 3+ columns as the preview gets wider, always filling the row.',
      explanation: 'The browser fits as many ≥200px columns as possible; 1fr lets them grow to share leftover space. min(200px, 100%) prevents overflow on very narrow screens.',
    },
    {
      title: 'auto-fill vs auto-fit with only 2 items',
      scenario: 'See the difference between the two keywords when there are fewer items than available columns.',
      steps: [
        'Create two grids with the same two items',
        'Use auto-fill on the first and auto-fit on the second',
        'Run in a wide preview',
      ],
      code: `.fill { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
.fit  { grid-template-columns: repeat(auto-fit,  minmax(120px, 1fr)); }`,
      playground: {
        html: `<p>auto-fill (empty tracks kept)</p>
<div class="g fill"><div>A</div><div>B</div></div>
<p>auto-fit (empty tracks collapse, items stretch)</p>
<div class="g fit"><div>A</div><div>B</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
p { font-family: monospace; margin: 14px 0 4px; }
.g { display: grid; gap: 8px; padding: 6px; background: repeating-linear-gradient(90deg, #f1f5f9 0 20px, #e2e8f0 20px 40px); }
.g div { padding: 18px; background: #e11d48; color: #fff; text-align: center; border-radius: 6px; }
.fill { grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); }
.fit  { grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); }`,
      },
      result: 'In the auto-fill grid the two red boxes are narrow, leaving empty space on the right. In the auto-fit grid they stretch across the full width.',
      explanation: 'auto-fill keeps empty column tracks reserved; auto-fit collapses them so the 1fr max lets real items expand.',
    },
    {
      title: 'Bento gallery with span and dense packing',
      scenario: 'Create a modern "bento box" photo gallery with some big tiles and no holes.',
      steps: [
        'Create a grid with repeat(4, 1fr) and grid-auto-rows: 100px',
        'Give .big span 2 columns and 2 rows, .wide span 2 columns',
        'Add grid-auto-flow: dense',
        'Run, then remove dense to see gaps appear',
      ],
      code: `.bento { grid-template-columns: repeat(4, 1fr); grid-auto-rows: 100px; grid-auto-flow: dense; }
.big  { grid-column: span 2; grid-row: span 2; }
.wide { grid-column: span 2; }`,
      playground: {
        html: `<div class="bento">
  <div>1</div><div class="wide">2 wide</div><div class="big">3 big</div>
  <div>4</div><div>5</div><div class="wide">6 wide</div><div>7</div><div>8</div><div>9</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.bento {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  grid-auto-rows: 100px;
  grid-auto-flow: dense;
  gap: 8px;
}
.bento div { display: grid; place-items: center; border-radius: 12px; color: #fff; font-weight: 700; background: #0891b2; }
.bento .big  { grid-column: span 2; grid-row: span 2; background: #7c3aed; }
.bento .wide { grid-column: span 2; background: #db2777; }`,
      },
      result: 'A tightly-packed mosaic of tiles of different sizes with no empty holes. Each label is centered in its tile.',
      explanation: 'span lets items cover multiple tracks; dense makes later small items fill earlier gaps. place-items: center centers the numbers inside each tile.',
    },
  ],
  interview: [
    { q: 'What is grid-template-areas?', a: 'A property that names regions of the grid with strings; items are placed into these regions using grid-area: name.', level: 'Easy' },
    { q: 'What are the rules for grid-template-areas strings?', a: 'Each row must have the same number of cells, each named area must form a rectangle, and a dot (.) marks an empty cell.', level: 'Medium' },
    { q: 'What does minmax(200px, 1fr) mean?', a: 'The track is at least 200px wide and at most 1fr (a share of the free space).', level: 'Easy' },
    { q: 'Difference between auto-fit and auto-fill?', a: 'Both create as many tracks as fit. auto-fill keeps empty tracks, auto-fit collapses them to zero so existing items stretch to fill the row. The difference is visible only when there are fewer items than tracks.', level: 'Hard' },
    { q: 'Write a responsive grid without media queries.', a: 'grid-template-columns: repeat(auto-fit, minmax(min(250px, 100%), 1fr)); gap: 1rem;', level: 'Medium' },
    { q: 'What does grid-column: span 3 do?', a: 'Makes the item cover three column tracks starting from its auto-placed or specified start line.', level: 'Easy' },
    { q: 'What does grid-auto-flow: dense do?', a: 'It makes the auto-placement algorithm fill earlier holes with later items that fit, which can change visual order relative to source order.', level: 'Medium' },
    { q: 'Why might a 1fr column overflow with a long word?', a: 'Because 1fr has an automatic minimum (minmax(auto, 1fr)), so it cannot shrink below its content min-size. Use minmax(0, 1fr).', level: 'Hard' },
    { q: 'What is the shortest way to center an item with Grid?', a: 'display: grid; place-items: center; on the parent.', level: 'Easy' },
    { q: 'What is the difference between justify-items and justify-content in grid?', a: 'justify-items aligns each item within its grid area; justify-content aligns the entire grid tracks within the container when there is extra space.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Use grid-template-areas to create a dashboard: header across top, sidebar left, two stats boxes side by side, a chart below them, footer.',
      hint: 'Use 3 columns: sidebar, stat1, stat2.',
      solution: `<style>
  .dash { display: grid; gap: 8px; grid-template-columns: 180px 1fr 1fr;
    grid-template-areas: "head head head" "side s1 s2" "side chart chart" "foot foot foot"; }
  .dash > * { background: #ddd; padding: 16px; }
  .h{grid-area:head}.sd{grid-area:side}.a{grid-area:s1}.b{grid-area:s2}.c{grid-area:chart}.f{grid-area:foot}
</style>
<div class="dash"><div class="h">Header</div><div class="sd">Side</div><div class="a">Sales</div><div class="b">Users</div><div class="c">Chart</div><div class="f">Footer</div></div>`,
    },
    {
      task: 'Make a team members grid that shows as many 180px+ cards per row as fit and stretches them.',
      hint: 'repeat(auto-fit, minmax(180px, 1fr))',
      solution: `<style>
  .team { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; }
  .team div { padding: 20px; background: #eef; text-align: center; }
</style>
<div class="team"><div>Asha</div><div>Ravi</div><div>Meera</div><div>John</div><div>Sara</div></div>`,
    },
    {
      task: 'Rewrite the dashboard so that on screens below 600px all areas stack in one column.',
      hint: 'Redefine grid-template-columns and grid-template-areas inside @media (max-width: 600px).',
      solution: `<style>
  @media (max-width: 600px) {
    .dash { grid-template-columns: 1fr; grid-template-areas: "head" "s1" "s2" "chart" "side" "foot"; }
  }
</style>`,
    },
    {
      task: 'Build a 3-column image gallery where the first image spans 2 rows and 2 columns.',
      hint: 'grid-column: span 2; grid-row: span 2; grid-auto-rows: 120px.',
      solution: `<style>
  .gal { display: grid; grid-template-columns: repeat(3, 1fr); grid-auto-rows: 120px; gap: 6px; }
  .gal img { width: 100%; height: 100%; object-fit: cover; }
  .gal img:first-child { grid-column: span 2; grid-row: span 2; }
</style>
<div class="gal">
  <img src="https://picsum.photos/seed/a/600/600" alt=""><img src="https://picsum.photos/seed/b/300/300" alt="">
  <img src="https://picsum.photos/seed/c/300/300" alt=""><img src="https://picsum.photos/seed/d/300/300" alt="">
  <img src="https://picsum.photos/seed/e/300/300" alt="">
</div>`,
    },
  ],
  quiz: [
    { question: 'Which character marks an empty cell in grid-template-areas?', options: ['_', '*', '.', '-'], answer: 2, explanation: 'A dot (or sequence of dots) represents an empty cell.' },
    { question: 'With fewer items than columns, which keyword makes items stretch to fill the row?', options: ['auto-fit', 'auto-fill', 'dense', 'span'], answer: 0, explanation: 'auto-fit collapses empty tracks so items can grow.' },
    { question: 'minmax(150px, 1fr) means the track is…', options: ['exactly 150px', 'at most 150px', 'between 150px and 1fr', 'always 1fr'], answer: 2, explanation: 'minimum 150px, maximum 1fr.' },
    { question: 'Which property assigns an element to a named area?', options: ['grid-name', 'area', 'grid-template', 'grid-area'], answer: 3, explanation: 'grid-area: header places the item in the "header" area.' },
    { question: 'What does place-items: center do on a grid container?', options: ['Centers the whole grid in the page', 'Centers each item inside its cell on both axes', 'Centers text only', 'Nothing in grid'], answer: 1, explanation: 'It sets align-items and justify-items to center.' },
  ],
};
