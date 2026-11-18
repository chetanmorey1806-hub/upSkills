export default {
  id: 'day-03-responsive-grid-breakpoints-offsets-order-nesting-gutters',
  title: 'Responsive Grid: Breakpoints, Column Sizing, Offsets, Order, Nesting and Gutters',
  module: 'Module 1: Bootstrap Basics & Layout',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Make layouts change with screen size using breakpoint-prefixed column classes, then control spacing and position with offsets, order, nested grids, gutters and alignment.',
  objectives: [
    'Name the six Bootstrap breakpoints and their pixel values',
    'Combine classes like col-12 col-md-6 col-lg-3 to build mobile-first responsive layouts',
    'Move columns with offset-*, ms-auto and reorder them with order-*',
    'Nest grids inside columns and control spacing with g-*, gx-*, gy-*',
    'Align columns vertically and horizontally with flex alignment classes on rows',
  ],
  theory: [
    {
      heading: 'The Six Breakpoints',
      content: 'A **breakpoint** is a screen width at which the layout is allowed to change. Bootstrap 5 has six tiers:\n\n- **xs** (no infix) – below 576px (phones in portrait)\n- **sm** – ≥ 576px (large phones)\n- **md** – ≥ 768px (tablets)\n- **lg** – ≥ 992px (laptops)\n- **xl** – ≥ 1200px (desktops)\n- **xxl** – ≥ 1400px (large desktops)\n\nBootstrap uses **min-width** media queries, so a class with a breakpoint applies **from that width and up**, until a larger breakpoint class overrides it.\n\nAnalogy: breakpoints are like clothing sizes S, M, L, XL. You define how the outfit (layout) looks at each size; anything bigger keeps the last size\'s outfit unless you say otherwise.',
      syntax: `/* What Bootstrap generates for col-md-6 (simplified) */
@media (min-width: 768px) {
  .col-md-6 { flex: 0 0 auto; width: 50%; }
}`,
      tip: 'There is no "col-xs-6" in Bootstrap 5. The extra-small tier has no infix: use col-6.',
    },
    {
      heading: 'Responsive Column Classes (Mobile-First)',
      content: 'The pattern is `.col-{breakpoint}-{number}`. You stack several classes on one column, smallest first:\n\n`<div class="col-12 col-sm-6 col-lg-3">`\n\n- below 576px: 12/12 = full width (stacked)\n- 576–991px: 6/12 = two per row\n- ≥ 992px: 3/12 = four per row\n\nIf you write only `col-md-6`, then below 768px the column has **no width class** and becomes 100% wide (columns are full width by default when no class matches). That is the "stack on mobile, side by side on desktop" behaviour.\n\nResponsive row-cols work too: `row-cols-1 row-cols-sm-2 row-cols-lg-4`.',
      points: [
        '.col-md (no number) = equal width from md and up, stacked below',
        '.col-lg-auto = content width from lg and up',
        'Always design the phone layout first, then add larger breakpoint classes',
      ],
    },
    {
      heading: 'Offsets and Auto Margins',
      content: '**Offsets** push a column to the right by a number of columns, using `margin-left`:\n\n- `.offset-3` – leaves 3 empty columns before it\n- `.offset-md-2` – offset only from md upwards; `.offset-md-0` resets it\n\nA common trick to centre: `col-md-6 offset-md-3` (3 + 6 + 3 = 12).\n\n**Auto margins** (flex margins) are more flexible:\n- `.ms-auto` on a column pushes it (and following columns) to the right\n- `.me-auto` pushes the next columns away to the right\n\nAlternatively, use `justify-content-center` on the row to centre columns.',
      syntax: `<div class="row">
  <div class="col-md-6 offset-md-3">Centred login box</div>
</div>
<div class="row">
  <div class="col-auto">Left</div>
  <div class="col-auto ms-auto">Pushed right</div>
</div>`,
    },
    {
      heading: 'Order Classes',
      content: 'Sometimes visual order should differ from HTML order, e.g. the image comes first on mobile but on the right on desktop.\n\n- `.order-first` (order: -1), `.order-last` (order: 6)\n- `.order-0` to `.order-5`\n- Responsive: `.order-md-2`, `.order-lg-first`\n\nOrder only changes the **visual** position; screen readers and the Tab key still follow the HTML order. Keep the HTML order logical for accessibility.',
      tip: 'Put the most important content first in the HTML (good for SEO and accessibility) and use order-* only for visual rearrangement on bigger screens.',
    },
    {
      heading: 'Nesting Grids',
      content: 'Any column can contain a **new .row** with its own columns. The nested row again has 12 columns, but relative to the **parent column\'s width**, not the page.\n\n- Do not add another .container inside; just a .row inside the .col\n- Example: a col-8 main area containing a nested row of col-6 + col-6 cards → each card is half of the main area (4/12 of the page)',
      syntax: `<div class="row">
  <div class="col-8">
    <div class="row">
      <div class="col-6">Nested half</div>
      <div class="col-6">Nested half</div>
    </div>
  </div>
  <div class="col-4">Sidebar</div>
</div>`,
    },
    {
      heading: 'Gutters and Alignment',
      content: '**Gutters** are the gaps between columns, made with column padding plus row negative margins. Default is 1.5rem (`--bs-gutter-x`).\n\n- `.g-0` to `.g-5` – horizontal + vertical gutters\n- `.gx-*` – horizontal only, `.gy-*` – vertical only (vertical gutters appear when columns wrap)\n- Responsive: `.g-md-4`\n- `.g-0` removes gutters (edge-to-edge image grids)\n\nGutter scale: 0 = 0, 1 = .25rem, 2 = .5rem, 3 = 1rem, 4 = 1.5rem, 5 = 3rem.\n\n**Alignment** (rows are flex containers):\n- Vertical: `.align-items-start | center | end` on the row, `.align-self-*` on a column\n- Horizontal: `.justify-content-start | center | end | between | around | evenly` on the row',
      points: [
        'Put backgrounds/borders on an inner div, not the .col itself, if you want visible gaps between coloured boxes',
        'Vertical alignment needs height: e.g. add min-vh-25 or style="min-height:150px" to the row to see the effect',
        'Coming next (Day 4): typography, colours, backgrounds, borders and shadows',
      ],
    },
  ],
  examples: [
    {
      title: 'Responsive Feature Cards: 1 → 2 → 4 per Row',
      scenario: 'Show four feature boxes: stacked on phones, two per row on tablets, four per row on laptops.',
      steps: [
        'Create a row with g-3',
        'Give each column col-12 col-sm-6 col-lg-3',
        'Put a bordered box inside each column',
        'Run and drag the preview width; the JS badge shows the active breakpoint',
      ],
      code: `<div class="row g-3">
  <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded">Fast</div></div>
  <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded">Secure</div></div>
  <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded">Responsive</div></div>
  <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded">Free</div></div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <p>Active breakpoint: <span id="bp" class="badge text-bg-dark"></span></p>
  <div class="row g-3">
    <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded bg-primary-subtle h-100"><h6>Fast</h6>Loads in under a second.</div></div>
    <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded bg-success-subtle h-100"><h6>Secure</h6>HTTPS everywhere.</div></div>
    <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded bg-warning-subtle h-100"><h6>Responsive</h6>Looks great on any device.</div></div>
    <div class="col-12 col-sm-6 col-lg-3"><div class="p-3 border rounded bg-danger-subtle h-100"><h6>Free</h6>Open source forever.</div></div>
  </div>
</div>`,
        js: `function bp() {
  const w = window.innerWidth;
  const name = w >= 1400 ? 'xxl' : w >= 1200 ? 'xl' : w >= 992 ? 'lg' : w >= 768 ? 'md' : w >= 576 ? 'sm' : 'xs';
  document.getElementById('bp').textContent = name + ' (' + w + 'px)';
}
bp(); window.addEventListener('resize', bp);`,
      },
      result: 'Narrow preview: four stacked boxes. Medium: a 2 × 2 grid. Wide (≥ 992px): four boxes in one row. The badge shows the current tier.',
      explanation: 'col-12 applies everywhere, col-sm-6 overrides it from 576px, col-lg-3 overrides again from 992px. min-width queries make larger classes win on larger screens.',
    },
    {
      title: 'Centred Login with Offsets and Auto Margins',
      scenario: 'Centre a login card on medium+ screens with offset, and build a toolbar with an item pushed right using ms-auto.',
      steps: [
        'Row 1: one column col-md-6 offset-md-3 containing the form',
        'Row 2: three col-auto columns, the last one with ms-auto',
        'Run at a wide width to see the centring and push',
      ],
      code: `<div class="row">
  <div class="col-md-6 offset-md-3">...login form...</div>
</div>
<div class="row">
  <div class="col-auto">Home</div>
  <div class="col-auto">Docs</div>
  <div class="col-auto ms-auto">Sign in</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row mb-4 bg-light py-2 rounded">
    <div class="col-auto fw-bold">Home</div>
    <div class="col-auto">Docs</div>
    <div class="col-auto ms-auto"><a href="#" class="btn btn-sm btn-primary">Sign in</a></div>
  </div>
  <div class="row">
    <div class="col-md-6 offset-md-3">
      <div class="border rounded p-4 shadow-sm">
        <h5 class="mb-3">Login</h5>
        <input class="form-control mb-2" placeholder="Email">
        <input class="form-control mb-3" type="password" placeholder="Password">
        <button class="btn btn-primary w-100">Login</button>
      </div>
    </div>
  </div>
  <div class="row mt-4">
    <div class="col-4 bg-info-subtle border p-2">col-4</div>
    <div class="col-4 offset-4 bg-info-subtle border p-2">col-4 offset-4</div>
  </div>
</div>`,
      },
      result: 'A toolbar with Sign in pushed to the right, a login card centred on md+ screens (full width on phones), and a row showing an empty 4-column gap.',
      explanation: 'offset-md-3 adds margin-left: 25% from md up, centring the 50% column. ms-auto (margin-left:auto) in a flex row absorbs free space, pushing the item to the far right.',
    },
    {
      title: 'Reordering Columns: Image First on Mobile, Right on Desktop',
      scenario: 'A product section where text comes first in HTML (good for SEO) but the image must appear on top on phones.',
      steps: [
        'Write the text column first and the image column second in HTML',
        'On the image column add order-first order-md-last',
        'Add col-md-6 to both',
        'Run narrow and wide',
      ],
      code: `<div class="row align-items-center">
  <div class="col-md-6"><h3>Smart Watch</h3><p>...</p></div>
  <div class="col-md-6 order-first order-md-last">
    <img src="https://picsum.photos/600/400" class="img-fluid rounded" alt="Watch">
  </div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row align-items-center g-4">
    <div class="col-md-6">
      <h3>Smart Watch X2</h3>
      <p class="text-secondary">Track steps, heart rate and sleep. 7-day battery life and water resistance up to 50 m.</p>
      <button class="btn btn-dark">Buy now</button>
    </div>
    <div class="col-md-6 order-first order-md-last">
      <img src="https://picsum.photos/id/175/600/400" class="img-fluid rounded shadow" alt="Smart watch">
    </div>
  </div>
</div>`,
      },
      result: 'Narrow: image on top, text below. Wide (≥ 768px): text left, image right, vertically centred.',
      explanation: 'order-first sets order:-1 on all sizes so the image moves to the top; order-md-last overrides it from md to order:6, so it moves after the text.',
    },
    {
      title: 'Nested Grid and Gutters',
      scenario: 'A dashboard: main area (col-lg-8) contains a nested 2 × 2 grid of stat boxes, next to a sidebar. Compare g-0 and g-4.',
      steps: [
        'Outer row with g-4: col-lg-8 and col-lg-4',
        'Inside the col-lg-8 add a new .row g-3 with four col-6 stat boxes',
        'Add a separate row with g-0 to compare gutterless columns',
        'Run and inspect the spacing',
      ],
      code: `<div class="row g-4">
  <div class="col-lg-8">
    <div class="row g-3">
      <div class="col-6"><div class="stat">Users</div></div>
      <div class="col-6"><div class="stat">Sales</div></div>
      <div class="col-6"><div class="stat">Orders</div></div>
      <div class="col-6"><div class="stat">Refunds</div></div>
    </div>
  </div>
  <div class="col-lg-4"><div class="stat">Sidebar</div></div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <h6>Nested grid (outer g-4, inner g-3)</h6>
  <div class="row g-4 mb-4">
    <div class="col-lg-8">
      <div class="row g-3">
        <div class="col-6"><div class="stat bg-primary text-white">Users<br><b>1,204</b></div></div>
        <div class="col-6"><div class="stat bg-success text-white">Sales<br><b>Rs 84k</b></div></div>
        <div class="col-6"><div class="stat bg-warning">Orders<br><b>312</b></div></div>
        <div class="col-6"><div class="stat bg-danger text-white">Refunds<br><b>7</b></div></div>
      </div>
    </div>
    <div class="col-lg-4"><div class="stat bg-light border h-100">Sidebar: recent activity</div></div>
  </div>
  <h6>g-0 (no gutters)</h6>
  <div class="row g-0">
    <div class="col-4"><img class="img-fluid" src="https://picsum.photos/id/10/300/200" alt=""></div>
    <div class="col-4"><img class="img-fluid" src="https://picsum.photos/id/11/300/200" alt=""></div>
    <div class="col-4"><img class="img-fluid" src="https://picsum.photos/id/12/300/200" alt=""></div>
  </div>
  <h6 class="mt-4">Vertical alignment (row height 120px)</h6>
  <div class="row align-items-center bg-light border" style="min-height:120px">
    <div class="col">center</div>
    <div class="col align-self-start">self-start</div>
    <div class="col align-self-end">self-end</div>
  </div>
</div>`,
        css: `.stat { padding: 1rem; border-radius: .5rem; text-align: center; }`,
      },
      result: 'Four coloured stat boxes in a 2 × 2 nested grid next to a sidebar (stacked under lg), three touching images with no gaps, and three labels aligned at middle, top and bottom.',
      explanation: 'The nested .row splits the col-lg-8 into its own 12 columns. g-3/g-4 set --bs-gutter-x and --bs-gutter-y. g-0 removes padding so images touch. align-items-center and align-self-* use flexbox cross-axis alignment.',
    },
  ],
  interview: [
    { q: 'List the Bootstrap 5 breakpoints.', a: 'xs <576px (no infix), sm ≥576px, md ≥768px, lg ≥992px, xl ≥1200px, xxl ≥1400px.', level: 'Easy' },
    { q: 'Does col-md-6 apply on phones?', a: 'No. It applies from 768px upwards. Below that, if no smaller class is present, the column is 100% wide.', level: 'Easy' },
    { q: 'Explain class="col-12 col-md-6 col-xl-4".', a: 'Full width below 768px, half width from 768px, one third from 1200px. Each larger breakpoint overrides the smaller one via min-width media queries.', level: 'Easy' },
    { q: 'How do you centre a column in Bootstrap?', a: 'Use offsets (col-md-6 offset-md-3), or justify-content-center on the row, or mx-auto on a column with a fixed width.', level: 'Medium' },
    { q: 'What is the difference between offset-* and ms-auto?', a: 'offset-N adds a fixed margin-left of N/12 width. ms-auto sets margin-left:auto, which in a flex row takes all remaining space, pushing the column to the right regardless of widths.', level: 'Medium' },
    { q: 'Do order-* classes affect accessibility?', a: 'Yes: they change only visual order. Screen readers and keyboard navigation follow DOM order, so large differences can confuse users. Keep the HTML order logical.', level: 'Medium' },
    { q: 'How does nesting work in the Bootstrap grid?', a: 'Place a new .row inside a .col; the nested row has its own 12 columns relative to the parent column width. No extra container is needed.', level: 'Easy' },
    { q: 'What are gutters and how do you change them?', a: 'Gutters are gaps between columns created by column padding and row negative margins. Use g-*, gx-*, gy-* (0–5) on the row, responsive versions like g-md-3, or set --bs-gutter-x.', level: 'Medium' },
    { q: 'Why are my vertical gutters not visible?', a: 'gy-* only adds space between wrapped lines of columns; if all columns fit on one line there is nothing to separate. Also if you style the .col itself, padding is inside the background; style an inner div instead.', level: 'Hard' },
    { q: 'How would you make a layout with 5 equal columns on desktop?', a: 'Use five .col elements (equal width flex) or row-cols-lg-5 on the row, since 12 is not divisible by 5.', level: 'Medium' },
    { q: 'Why is Bootstrap called mobile-first?', a: 'Its media queries use min-width; unprefixed classes target the smallest screens and larger breakpoints add overrides, so CSS for phones is the base.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a pricing section with 3 plans: stacked on mobile, 3 in a row from md. Centre them and add g-4.',
      hint: 'row g-4 justify-content-center, col-md-4.',
      solution: `<div class="container py-4">
  <div class="row g-4 justify-content-center text-center">
    <div class="col-md-4"><div class="border rounded p-4"><h5>Basic</h5><p class="fs-3">Rs 0</p></div></div>
    <div class="col-md-4"><div class="border border-primary rounded p-4"><h5>Pro</h5><p class="fs-3">Rs 499</p></div></div>
    <div class="col-md-4"><div class="border rounded p-4"><h5>Team</h5><p class="fs-3">Rs 1999</p></div></div>
  </div>
</div>`,
    },
    {
      task: 'Create a layout where the sidebar appears BELOW the content on mobile but on the LEFT on lg screens (sidebar written after content in HTML).',
      hint: 'order-lg-first on the sidebar column.',
      solution: `<div class="container">
  <div class="row g-3">
    <main class="col-lg-9"><div class="p-3 border">Main content</div></main>
    <aside class="col-lg-3 order-lg-first"><div class="p-3 bg-light border">Sidebar</div></aside>
  </div>
</div>`,
    },
    {
      task: 'Make a product grid using row-cols: 1 per row on xs, 2 on sm, 3 on md, 4 on xl.',
      hint: 'row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3.',
      solution: `<div class="container">
  <div class="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
    <div class="col"><div class="p-3 border">Item 1</div></div>
    <div class="col"><div class="p-3 border">Item 2</div></div>
    <div class="col"><div class="p-3 border">Item 3</div></div>
    <div class="col"><div class="p-3 border">Item 4</div></div>
    <div class="col"><div class="p-3 border">Item 5</div></div>
    <div class="col"><div class="p-3 border">Item 6</div></div>
    <div class="col"><div class="p-3 border">Item 7</div></div>
    <div class="col"><div class="p-3 border">Item 8</div></div>
  </div>
</div>`,
    },
    {
      task: 'Build a footer with three nested link groups inside a col-md-8 and a newsletter box in col-md-4.',
      hint: 'Inside col-md-8 add .row with three .col.',
      solution: `<footer class="container py-4 bg-dark text-white">
  <div class="row g-4">
    <div class="col-md-8">
      <div class="row">
        <div class="col"><h6>Company</h6><a class="d-block link-light" href="#">About</a><a class="d-block link-light" href="#">Careers</a></div>
        <div class="col"><h6>Help</h6><a class="d-block link-light" href="#">FAQ</a><a class="d-block link-light" href="#">Contact</a></div>
        <div class="col"><h6>Legal</h6><a class="d-block link-light" href="#">Privacy</a><a class="d-block link-light" href="#">Terms</a></div>
      </div>
    </div>
    <div class="col-md-4"><h6>Newsletter</h6><input class="form-control mb-2" placeholder="Email"><button class="btn btn-primary w-100">Subscribe</button></div>
  </div>
</footer>`,
    },
    {
      task: 'Make an edge-to-edge 3-column photo strip with no gutters that becomes 6 columns from lg.',
      hint: 'row g-0, col-4 col-lg-2.',
      solution: `<div class="container-fluid">
  <div class="row g-0">
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/20/300/300" alt=""></div>
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/21/300/300" alt=""></div>
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/22/300/300" alt=""></div>
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/23/300/300" alt=""></div>
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/24/300/300" alt=""></div>
    <div class="col-4 col-lg-2"><img class="img-fluid" src="https://picsum.photos/id/25/300/300" alt=""></div>
  </div>
</div>`,
    },
  ],
  quiz: [
    { question: 'What is the minimum width of the lg breakpoint?', options: ['768px', '992px', '1200px', '1024px'], answer: 1, explanation: 'lg starts at 992px.' },
    { question: 'Which class pushes a column right by 25% from md up?', options: ['offset-md-3', 'ms-md-3', 'offset-3-md', 'push-md-3'], answer: 0, explanation: 'offset-md-3 = margin-left: 25% from 768px.' },
    { question: 'Which class removes all gutters?', options: ['no-gutters', 'gap-0', 'p-0', 'g-0'], answer: 3, explanation: 'Bootstrap 5 uses g-0 (no-gutters was Bootstrap 4).' },
    { question: 'An element with class "order-md-last" moves:', options: ['To the end on all screens', 'To the end only below md', 'To the end from md upwards', 'Out of the row'], answer: 2, explanation: 'Responsive classes apply from that breakpoint upwards.' },
    { question: 'In a nested row inside a col-6, a nested col-6 is what fraction of the page row?', options: ['1/2', '1/4', '1/3', '1/6'], answer: 1, explanation: 'Half of a half = one quarter.' },
  ],
};
