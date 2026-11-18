export default {
  id: 'day-02-containers-grid-system-basics',
  title: 'Containers and Grid System Basics: Rows, Columns and the 12-Column Layout',
  module: 'Module 1: Bootstrap Basics & Layout',
  day: 2,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Understand the three container types and the container > row > column structure of the Bootstrap grid, and build equal, fixed-width and auto-width column layouts on a 12-column system.',
  objectives: [
    'Choose between .container, .container-fluid and responsive containers like .container-md',
    'Explain the container → row → col hierarchy and why it must be followed',
    'Build layouts with equal-width columns (.col) and numbered columns (.col-4, .col-8)',
    'Use .col-auto for content-sized columns and know what happens when columns exceed 12',
  ],
  theory: [
    {
      heading: 'Containers: the Outer Wrapper',
      content: 'A **container** is the outermost layout box. It centres your content horizontally and adds left/right padding (gutters) so text never touches the screen edge.\n\nThere are three kinds:\n\n- `.container`: a **fixed max-width** that changes at each breakpoint (540px at sm, 720px md, 960px lg, 1140px xl, 1320px xxl). Below 576px it is 100% wide.\n- `.container-fluid`: always **100% width** of the viewport.\n- `.container-{breakpoint}` (e.g. `.container-md`): 100% wide **until** that breakpoint, then behaves like `.container`.\n\nAnalogy: a container is the page margin of a notebook; the fluid container is a notebook with no margin.',
      points: [
        '.container max-widths: sm 540, md 720, lg 960, xl 1140, xxl 1320 (px)',
        'Containers have horizontal padding of calc(var(--bs-gutter-x) * .5) = 0.75rem by default',
        'You can nest containers, but you usually do not need to',
      ],
    },
    {
      heading: 'The Grid Hierarchy: container > row > col',
      content: 'Bootstrap\'s grid is built with **flexbox** and has 12 virtual columns per row.\n\n1. **Container** – centres and pads the content\n2. **Row** (`.row`) – a flex container (`display:flex; flex-wrap:wrap`) with **negative horizontal margins** that cancel the container padding\n3. **Columns** (`.col-*`) – direct children of the row, with horizontal padding (the gutter). Your content goes inside columns.\n\nWhy negative margins? The row pulls itself outwards by half a gutter on each side, and each column pushes its content inwards by half a gutter. The result: the first and last column content lines up exactly with content outside the grid.\n\nRule: **only columns may be direct children of rows**, and content goes inside columns.',
      syntax: `<div class="container">
  <div class="row">
    <div class="col">Column 1</div>
    <div class="col">Column 2</div>
    <div class="col">Column 3</div>
  </div>
</div>`,
      tip: 'Common mistake: putting .row directly inside <body> without a container. The negative margins then cause a horizontal scrollbar.',
    },
    {
      heading: 'The 12-Column System',
      content: 'Each row is divided into **12 equal parts**. A column class says how many parts it spans:\n\n- `.col-6` + `.col-6` = two halves\n- `.col-4` × 3 = three thirds\n- `.col-3` × 4 = four quarters\n- `.col-8` + `.col-4` = main content + sidebar\n\nWhy 12? Because 12 divides evenly by 1, 2, 3, 4, 6 and 12, so you can make halves, thirds, quarters and sixths.\n\nWidth of `.col-N` = N / 12 × 100%. So `.col-4` = 33.333%.',
      points: [
        'If the numbers in a row add up to more than 12, the extra columns wrap to a new line',
        'If they add up to less than 12, the remaining space is empty on the right',
        'Numbers without a breakpoint (col-4) apply on ALL screen sizes, including phones',
      ],
    },
    {
      heading: 'Equal-Width and Auto-Width Columns',
      content: 'You do not always need numbers:\n\n- `.col` – **equal width**: all `.col` siblings share the space equally (flex: 1 0 0%). Two cols = 50% each, five cols = 20% each.\n- `.col-auto` – **width of its content** (flex: 0 0 auto). Great for buttons or labels next to a flexible column.\n- Mixing works: `.col-6` + `.col` + `.col` → the numbered one takes 6/12, the others split the remaining 6/12.\n\nForcing a line break: insert `<div class="w-100"></div>` between columns to start a new line inside the same row.',
      syntax: `<div class="row">
  <div class="col-auto">Logo</div>
  <div class="col">Search bar fills the rest</div>
  <div class="col-auto">Login</div>
</div>`,
    },
    {
      heading: 'Row Columns (.row-cols-*)',
      content: 'Instead of setting the width on every column, you can set **how many columns per row** on the row itself:\n\n- `.row-cols-2` – every child column is 50%\n- `.row-cols-3` – every child column is 33.33%\n- `.row-cols-auto` – each column is content width\n\nThis is ideal for repeating items like product cards: write `.col` for each item and control the count from the row.',
      syntax: `<div class="row row-cols-3">
  <div class="col">A</div><div class="col">B</div><div class="col">C</div>
  <div class="col">D</div><div class="col">E</div><div class="col">F</div>
</div>`,
      tip: 'Coming next (Day 3): breakpoint prefixes like row-cols-md-3 and col-lg-4 to change these numbers per screen size.',
    },
  ],
  examples: [
    {
      title: 'Three Container Types Side by Side',
      scenario: 'See visually how .container, .container-fluid and .container-md differ in width.',
      steps: [
        'Create three containers with different classes',
        'Give each a coloured background and border so the width is visible',
        'Run and resize the preview width (narrow vs wide)',
      ],
      code: `<div class="container bg-primary-subtle border p-3 mb-2">.container (fixed max-width)</div>
<div class="container-fluid bg-success-subtle border p-3 mb-2">.container-fluid (always 100%)</div>
<div class="container-md bg-warning-subtle border p-3">.container-md (100% until 768px)</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="py-3">
  <div class="container bg-primary-subtle border border-primary p-3 mb-2">.container (fixed max-width per breakpoint)</div>
  <div class="container-fluid bg-success-subtle border border-success p-3 mb-2">.container-fluid (always 100% wide)</div>
  <div class="container-md bg-warning-subtle border border-warning p-3">.container-md (100% until md, then fixed)</div>
  <p class="text-center small text-muted mt-3" id="w"></p>
</div>`,
        js: `function show(){ document.getElementById('w').textContent = 'Viewport width: ' + window.innerWidth + 'px'; }
show(); window.addEventListener('resize', show);`,
      },
      result: 'Three coloured boxes. The green fluid one always touches both edges; the blue one has white space on both sides on wide screens; the yellow one is full width on narrow screens and fixed on wider ones.',
      explanation: 'Container max-widths are set by media queries at each breakpoint. The fluid container has no max-width. container-md only applies max-width from 768px up.',
    },
    {
      title: 'Halves, Thirds, Quarters and 8 + 4',
      scenario: 'Practise the 12-column math with the most common column splits.',
      steps: [
        'Create a container with four rows',
        'Row 1: two col-6; Row 2: three col-4; Row 3: four col-3; Row 4: col-8 + col-4',
        'Style the columns with a border and background to make them visible',
        'Run and check that every row totals 12',
      ],
      code: `<div class="container">
  <div class="row"><div class="col-6">6</div><div class="col-6">6</div></div>
  <div class="row"><div class="col-4">4</div><div class="col-4">4</div><div class="col-4">4</div></div>
  <div class="row"><div class="col-3">3</div><div class="col-3">3</div><div class="col-3">3</div><div class="col-3">3</div></div>
  <div class="row"><div class="col-8">8 (main)</div><div class="col-4">4 (sidebar)</div></div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3 demo">
  <div class="row"><div class="col-6">col-6</div><div class="col-6">col-6</div></div>
  <div class="row"><div class="col-4">col-4</div><div class="col-4">col-4</div><div class="col-4">col-4</div></div>
  <div class="row"><div class="col-3">col-3</div><div class="col-3">col-3</div><div class="col-3">col-3</div><div class="col-3">col-3</div></div>
  <div class="row"><div class="col-8">col-8 (main)</div><div class="col-4">col-4 (sidebar)</div></div>
  <div class="row"><div class="col-9">col-9</div><div class="col-4">col-4 wraps! (9+4 &gt; 12)</div></div>
</div>`,
        css: `.demo .row { margin-bottom: .5rem; }
.demo [class^="col"] { background: #e7f1ff; border: 1px solid #9ec5fe; padding: .6rem; text-align: center; }`,
      },
      result: 'Five rows of light-blue boxes: halves, thirds, quarters, a 2/3 + 1/3 split, and a last row where the col-4 drops to a new line because 9 + 4 = 13.',
      explanation: 'Each col-N gets flex: 0 0 auto and width: N/12 × 100%. The row has flex-wrap: wrap, so when the total exceeds 12 the overflow column wraps to the next line.',
    },
    {
      title: 'Equal (.col) and Auto (.col-auto) Columns',
      scenario: 'Build a search header: logo and button sized to content, search input filling the remaining width.',
      steps: [
        'Make a row with align-items-center',
        'Use col-auto for the logo and the button',
        'Use col for the input so it stretches',
        'Add a second row with five plain .col to see equal widths',
      ],
      code: `<div class="row align-items-center">
  <div class="col-auto fw-bold">ShopKart</div>
  <div class="col"><input class="form-control" placeholder="Search products"></div>
  <div class="col-auto"><button class="btn btn-primary">Search</button></div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row align-items-center g-2 mb-4 p-2 bg-light border rounded">
    <div class="col-auto fw-bold fs-5 text-primary">ShopKart</div>
    <div class="col"><input class="form-control" placeholder="Search products"></div>
    <div class="col-auto"><button class="btn btn-primary">Search</button></div>
  </div>
  <div class="row text-center">
    <div class="col border bg-info-subtle py-2">col</div>
    <div class="col border bg-info-subtle py-2">col</div>
    <div class="col border bg-info-subtle py-2">col</div>
    <div class="col border bg-info-subtle py-2">col</div>
    <div class="col border bg-info-subtle py-2">col</div>
  </div>
</div>`,
      },
      result: 'A header bar where the input stretches between the logo and the button, and below it five equal 20% boxes.',
      explanation: '.col-auto sizes to its content; .col takes all leftover space (flex-grow 1). Five .col siblings each get one fifth, something impossible with 12-based numbers alone.',
    },
    {
      title: 'Product Grid with row-cols',
      scenario: 'Show six product tiles three per row without writing a width on each tile.',
      steps: [
        'Add row-cols-3 and g-3 (gap) to the row',
        'Add six .col children each containing a bordered box',
        'Run: six tiles in two rows of three',
      ],
      code: `<div class="row row-cols-3 g-3">
  <div class="col"><div class="p-3 border rounded">Product 1</div></div>
  ...
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row row-cols-3 g-3" id="grid"></div>
</div>`,
        js: `const names = ['Headphones', 'Keyboard', 'Mouse', 'Monitor', 'Webcam', 'Speaker'];
const grid = document.getElementById('grid');
names.forEach(function (n, i) {
  const col = document.createElement('div');
  col.className = 'col';
  col.innerHTML = '<div class="p-3 border rounded bg-white shadow-sm text-center">' +
    '<div class="fw-semibold">' + n + '</div><div class="text-success">Rs ' + (999 + i * 500) + '</div></div>';
  grid.appendChild(col);
});`,
      },
      result: 'Six white tiles with name and price, arranged three per row with even gaps.',
      explanation: 'row-cols-3 sets every direct .col child to 33.33% width. g-3 sets both horizontal and vertical gutters to 1rem (more on gutters on Day 3).',
    },
  ],
  interview: [
    { q: 'What is the difference between .container and .container-fluid?', a: '.container has a responsive fixed max-width that changes at each breakpoint and is centred; .container-fluid is always 100% of the viewport width.', level: 'Easy' },
    { q: 'What does .container-lg do?', a: 'It is 100% wide below the lg breakpoint (992px) and gets the fixed .container max-widths from lg upwards.', level: 'Easy' },
    { q: 'Explain the Bootstrap grid hierarchy.', a: 'Container → row → column. Containers centre and pad, rows are flex containers with negative margins to offset gutters, and columns (direct children of rows) hold the content with padding gutters.', level: 'Easy' },
    { q: 'Why does .row have negative margins?', a: 'To cancel out the horizontal padding of the first and last columns so column content aligns with the container edges. Without a container, those negative margins cause horizontal overflow.', level: 'Medium' },
    { q: 'Why is the Bootstrap grid based on 12 columns?', a: '12 is divisible by 1, 2, 3, 4, 6 and 12, allowing halves, thirds, quarters and sixths with whole numbers.', level: 'Easy' },
    { q: 'What happens if column classes in a row add up to more than 12?', a: 'The row has flex-wrap: wrap, so the columns that do not fit move to a new line.', level: 'Easy' },
    { q: 'Difference between .col, .col-6 and .col-auto?', a: '.col shares available space equally with other .col siblings (flex-grow 1); .col-6 is fixed at 50% of the row; .col-auto takes only the width of its content.', level: 'Medium' },
    { q: 'What is .row-cols-* used for?', a: 'It sets the number of columns per row on the parent, so every child .col gets an equal width (e.g. row-cols-4 → 25% each). Useful for card grids.', level: 'Medium' },
    { q: 'Is the Bootstrap 5 grid built on flexbox or CSS grid?', a: 'Flexbox. Bootstrap 5.3 also has an opt-in CSS Grid system (enable $enable-cssgrid in Sass, then use .grid and .g-col-*), but it is experimental.', level: 'Hard' },
    { q: 'How do you force columns onto a new line inside the same row?', a: 'Insert an element with class .w-100 (width 100%) between the columns; it takes a full line and pushes the following columns down.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a blog layout: header row (col-12), content row with main (col-8) and sidebar (col-4), footer row (col-12).',
      hint: 'Three rows inside one container.',
      solution: `<div class="container">
  <div class="row"><div class="col-12 bg-dark text-white p-3">Header</div></div>
  <div class="row">
    <div class="col-8 p-3 border">Main article</div>
    <div class="col-4 p-3 border bg-light">Sidebar</div>
  </div>
  <div class="row"><div class="col-12 bg-secondary text-white p-3">Footer</div></div>
</div>`,
    },
    {
      task: 'Make a row with a col-auto label "Qty:", a flexible column with an input, and a col-auto "Add" button.',
      hint: 'col-auto, col, col-auto with align-items-center.',
      solution: `<div class="container">
  <div class="row align-items-center g-2">
    <div class="col-auto"><label for="q" class="col-form-label">Qty:</label></div>
    <div class="col"><input id="q" type="number" class="form-control" value="1"></div>
    <div class="col-auto"><button class="btn btn-success">Add</button></div>
  </div>
</div>`,
    },
    {
      task: 'Build a 4 × 2 image gallery using row-cols-4 with picsum images.',
      hint: 'row row-cols-4 g-2, img-fluid inside each col.',
      solution: `<div class="container">
  <div class="row row-cols-4 g-2">
    <div class="col"><img src="https://picsum.photos/300/200?1" class="img-fluid rounded" alt="1"></div>
    <div class="col"><img src="https://picsum.photos/300/200?2" class="img-fluid rounded" alt="2"></div>
    <div class="col"><img src="https://picsum.photos/300/200?3" class="img-fluid rounded" alt="3"></div>
    <div class="col"><img src="https://picsum.photos/300/200?4" class="img-fluid rounded" alt="4"></div>
    <div class="col"><img src="https://picsum.photos/300/200?5" class="img-fluid rounded" alt="5"></div>
    <div class="col"><img src="https://picsum.photos/300/200?6" class="img-fluid rounded" alt="6"></div>
    <div class="col"><img src="https://picsum.photos/300/200?7" class="img-fluid rounded" alt="7"></div>
    <div class="col"><img src="https://picsum.photos/300/200?8" class="img-fluid rounded" alt="8"></div>
  </div>
</div>`,
    },
    {
      task: 'In one row, show three columns on the first line and two on the second using .col and a .w-100 break.',
      hint: '3 × .col, then <div class="w-100"></div>, then 2 × .col.',
      solution: `<div class="container">
  <div class="row text-center">
    <div class="col border p-2">1</div><div class="col border p-2">2</div><div class="col border p-2">3</div>
    <div class="w-100"></div>
    <div class="col border p-2">4</div><div class="col border p-2">5</div>
  </div>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which class is always 100% of the viewport width?', options: ['.container', '.container-fluid', '.container-xl', '.row'], answer: 1, explanation: '.container-fluid has no max-width.' },
    { question: 'Width of .col-3?', options: ['3%', '30%', '25%', '33.33%'], answer: 2, explanation: '3/12 = 25%.' },
    { question: 'What should be the direct children of a .row?', options: ['Columns', 'Containers', 'Any element', 'Other rows'], answer: 0, explanation: 'Only .col-* elements should be direct children of rows.' },
    { question: 'A row contains .col-8 and .col-6. What happens?', options: ['Both shrink to fit', 'An error appears', 'col-6 is hidden', '.col-6 wraps to a new line'], answer: 3, explanation: '8 + 6 = 14 > 12 so the second column wraps.' },
    { question: 'Which class makes a column only as wide as its content?', options: ['.col', '.col-auto', '.col-fit', '.col-0'], answer: 1, explanation: '.col-auto uses flex: 0 0 auto; width: auto.' },
  ],
};
