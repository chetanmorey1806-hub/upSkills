export default {
  id: 'day-05-utilities-spacing-sizing-display-flex-position',
  title: 'Utilities: Spacing, Sizing, Display, Flex, Position and Visibility',
  module: 'Module 1: Bootstrap Basics & Layout',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Master the utility classes that replace most hand-written CSS: margin/padding scale, width/height, responsive display, the full flexbox toolkit, positioning helpers and visibility classes.',
  objectives: [
    'Read and write spacing classes with the {property}{sides}-{breakpoint}-{size} formula',
    'Size elements with w-*, h-*, mw-100, vh-100 and min-vh-100',
    'Show and hide elements per breakpoint with d-none / d-md-block',
    'Build layouts with d-flex, justify-content-*, align-items-*, flex-wrap, gap and flex-grow',
    'Position elements with position-*, top/start/end/bottom-*, translate-middle, sticky-top and z-index',
  ],
  theory: [
    {
      heading: 'Spacing Utilities: Margin and Padding',
      content: 'Formula: **{property}{sides}-{size}** or **{property}{sides}-{breakpoint}-{size}**\n\n- property: `m` (margin) or `p` (padding)\n- sides: `t` top, `b` bottom, `s` start (left in LTR), `e` end (right), `x` left+right, `y` top+bottom, blank = all four\n- size: `0` = 0, `1` = .25rem, `2` = .5rem, `3` = 1rem, `4` = 1.5rem, `5` = 3rem, `auto` (margin only)\n- negative margins: `mt-n2`, `ms-n3` (only when enabled in Sass; not in the default CDN build)\n\nExamples: `mt-3` margin-top 1rem; `px-md-5` padding left/right 3rem from md; `mx-auto` centres a block with a width.\n\n**gap**: `gap-3`, `row-gap-2`, `column-gap-4` for flex and grid containers.\n\nAnalogy: padding is the bubble wrap inside a box; margin is the space between boxes on the shelf.',
      tip: 'Bootstrap 5 uses start/end instead of left/right (ms-, me-, ps-, pe-) to support right-to-left languages. ml-3 and mr-3 from Bootstrap 4 no longer exist.',
    },
    {
      heading: 'Sizing Utilities',
      content: '- Width relative to parent: `.w-25`, `.w-50`, `.w-75`, `.w-100`, `.w-auto`\n- Height relative to parent: `.h-25` … `.h-100`, `.h-auto` (the parent needs a height!)\n- Max: `.mw-100` (max-width: 100%), `.mh-100`\n- Viewport: `.vw-100`, `.vh-100`, `.min-vw-100`, `.min-vh-100`\n\nCommon uses:\n- `w-100` on buttons/inputs to fill a column\n- `min-vh-100` on a section to make a full-screen hero\n- `h-100` on cards inside columns so all cards in a row are equal height',
    },
    {
      heading: 'Display and Visibility',
      content: 'Display classes: `.d-{value}` and `.d-{breakpoint}-{value}` where value is `none`, `inline`, `inline-block`, `block`, `grid`, `inline-grid`, `table`, `flex`, `inline-flex`.\n\nResponsive hiding:\n- Hide on all: `d-none`\n- Hide only on xs: `d-none d-sm-block`\n- Visible only on lg+: `d-none d-lg-block`\n- Visible only below md: `d-md-none`\n- Print: `d-print-none`, `d-print-block`\n\nVisibility:\n- `.invisible` – `visibility: hidden`; the element **keeps its space**\n- `.visible`\n- `.visually-hidden` – hidden visually but **read by screen readers**; `.visually-hidden-focusable` shows when focused (skip links)',
      tip: 'd-none removes the element from layout (no space); invisible keeps the space. Neither stops the element from being downloaded, e.g. a hidden image still loads.',
    },
    {
      heading: 'Flex Utilities',
      content: 'Turn on flexbox with `.d-flex` (or `.d-inline-flex`, responsive `.d-md-flex`). Then:\n\n- Direction: `.flex-row`, `.flex-row-reverse`, `.flex-column`, `.flex-column-reverse`, responsive `.flex-md-row`\n- Main axis: `.justify-content-start | end | center | between | around | evenly`\n- Cross axis: `.align-items-start | end | center | baseline | stretch`\n- Single item: `.align-self-*`\n- Wrapping: `.flex-wrap`, `.flex-nowrap`, `.flex-wrap-reverse`\n- Multi-line: `.align-content-*`\n- Grow/shrink: `.flex-fill` (equal width items), `.flex-grow-1`, `.flex-shrink-0`\n- Ordering: `.order-0` … `.order-5`, `.order-first`, `.order-last`\n- Auto margins: `.ms-auto` pushes item to the end; `.mt-auto` in a column pushes it to the bottom\n- Spacing between items: `.gap-*`',
      syntax: `<div class="d-flex justify-content-between align-items-center gap-2">
  <span>Logo</span>
  <nav class="d-flex gap-3"><a href="#">Home</a><a href="#">About</a></nav>
</div>`,
    },
    {
      heading: 'Position Utilities',
      content: '- `.position-static | relative | absolute | fixed | sticky`\n- Edge positioning: `.top-0`, `.top-50`, `.top-100`, `.bottom-*`, `.start-*`, `.end-*` (values 0, 50, 100)\n- `.translate-middle` – translate(-50%, -50%) to centre an element on its coordinates; `.translate-middle-x`, `.translate-middle-y`\n- Helpers: `.fixed-top`, `.fixed-bottom`, `.sticky-top`, `.sticky-md-top`, `.sticky-bottom`\n- z-index (5.3): `.z-n1`, `.z-0`, `.z-1`, `.z-2`, `.z-3`\n\nClassic example: a notification badge on the top-right corner of a button: button `.position-relative`, badge `.position-absolute .top-0 .start-100 .translate-middle`.',
    },
    {
      heading: 'Other Handy Utilities',
      content: '- Overflow: `.overflow-auto`, `.overflow-hidden`, `.overflow-x-auto`, `.overflow-y-scroll`\n- Float (legacy): `.float-start`, `.float-end`, `.clearfix`\n- Vertical align (inline/table cells): `.align-middle`, `.align-top`\n- Object fit: `.object-fit-cover`, `.object-fit-contain`\n- Interactions: `.user-select-none`, `.pe-none` (pointer-events none)\n- Ratio helper: `.ratio .ratio-16x9` for responsive embeds\n- Stacks (5.1+): `.vstack` (vertical flex with gap), `.hstack` (horizontal)',
      points: [
        'Utilities have !important so they always win over component styles',
        'Prefer utilities for one-off tweaks; create a component class when the same 8+ utilities repeat everywhere',
        'Coming next (Day 6): buttons, badges, alerts, spinners and progress bars',
      ],
    },
  ],
  examples: [
    {
      title: 'Spacing Scale Visualised',
      scenario: 'See exactly how big each spacing step is by rendering p-0 to p-5 and margin variants.',
      steps: [
        'Generate six boxes with p-0 to p-5 using JS',
        'Give the inner content a coloured background so the padding is visible',
        'Add a box centred with mx-auto and w-50',
        'Run and compare sizes',
      ],
      code: `<div class="p-3 bg-warning-subtle"><div class="bg-warning">p-3</div></div>
<div class="mt-4 mx-auto w-50 bg-info-subtle text-center">mx-auto w-50</div>
<div class="d-flex gap-3"><div>A</div><div>B</div></div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="d-flex flex-wrap gap-3 align-items-start" id="pads"></div>
  <div class="mt-4 mx-auto w-50 p-2 bg-info-subtle border text-center">mx-auto w-50 (centred)</div>
  <div class="mt-3 px-5 py-1 bg-light border">px-5 py-1</div>
  <div class="mt-3 d-flex gap-4 border p-2"><div class="bg-success-subtle p-2">gap-4</div><div class="bg-success-subtle p-2">between</div><div class="bg-success-subtle p-2">items</div></div>
</div>`,
        js: `const pads = document.getElementById('pads');
for (let i = 0; i <= 5; i++) {
  const d = document.createElement('div');
  d.className = 'p-' + i + ' bg-warning-subtle border border-warning';
  d.innerHTML = '<div class="bg-warning px-1 small">p-' + i + '</div>';
  pads.appendChild(d);
}`,
      },
      result: 'Six yellow boxes whose pale padding grows from 0 to 3rem, a centred half-width box, a box with wide horizontal padding, and three items separated by gap-4.',
      explanation: 'The spacing scale is based on $spacer (1rem): 0, .25, .5, 1, 1.5, 3 rem. mx-auto works because the box has a width (w-50).',
    },
    {
      title: 'Responsive Display: Show/Hide by Breakpoint',
      scenario: 'Show a different message depending on screen size and a print-only line.',
      steps: [
        'Create four alerts with d-* combinations',
        'Add an .invisible box between two normal boxes to see that it keeps space',
        'Add a .visually-hidden span inside a button',
        'Run and resize the preview',
      ],
      code: `<div class="d-block d-md-none">Visible only below md (phones)</div>
<div class="d-none d-md-block d-lg-none">Visible only on md (tablets)</div>
<div class="d-none d-lg-block">Visible only on lg and up</div>
<button class="btn btn-danger">X <span class="visually-hidden">Delete item</span></button>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="alert alert-primary d-block d-md-none">Phone view (below 768px)</div>
  <div class="alert alert-success d-none d-md-block d-lg-none">Tablet view (768px – 991px)</div>
  <div class="alert alert-warning d-none d-lg-block">Desktop view (992px and up)</div>
  <div class="d-none d-print-block">This line appears only when printing.</div>
  <div class="d-flex gap-2 mb-3">
    <div class="p-3 bg-secondary-subtle">Box 1</div>
    <div class="p-3 bg-danger-subtle invisible">Invisible</div>
    <div class="p-3 bg-secondary-subtle">Box 3 (gap kept)</div>
  </div>
  <button class="btn btn-danger">X <span class="visually-hidden">Delete item</span></button>
  <small class="text-body-secondary ms-2">Screen readers announce "X Delete item"</small>
</div>`,
      },
      result: 'Only one of the three alerts is visible at a time depending on width. Box 3 sits after an empty gap left by the invisible box.',
      explanation: 'd-none hides on all sizes; d-md-block re-shows from 768px; d-lg-none hides again from 992px. invisible keeps layout space; visually-hidden clips the text off screen but keeps it in the accessibility tree.',
    },
    {
      title: 'Flexbox Utilities: Navbar, Centring and Sticky Footer Card',
      scenario: 'Use only flex utilities to build a header, a perfectly centred box and cards whose buttons align at the bottom.',
      steps: [
        'Header: d-flex justify-content-between align-items-center',
        'Centre box: d-flex justify-content-center align-items-center with a fixed height',
        'Cards: d-flex flex-column with mt-auto on the button so it sticks to the bottom',
        'Run',
      ],
      code: `<header class="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
  <strong>Brand</strong>
  <nav class="d-flex gap-3"><a class="link-light" href="#">Home</a><a class="link-light" href="#">Shop</a></nav>
</header>
<div class="d-flex justify-content-center align-items-center" style="height:150px">Centred</div>
<div class="d-flex flex-column h-100">
  <p>Text</p>
  <button class="btn btn-primary mt-auto">Buy</button>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<header class="d-flex justify-content-between align-items-center p-3 bg-dark text-white">
  <strong>Brand</strong>
  <nav class="d-flex gap-3"><a class="link-light" href="#">Home</a><a class="link-light" href="#">Shop</a><a class="link-light" href="#">Contact</a></nav>
</header>
<div class="container py-3">
  <div class="d-flex justify-content-center align-items-center bg-primary-subtle rounded mb-3" style="height:120px">
    <div class="p-2 bg-primary text-white rounded">Perfectly centred</div>
  </div>
  <div class="d-flex flex-wrap gap-2 mb-3">
    <div class="p-2 border flex-fill text-center">flex-fill</div>
    <div class="p-2 border flex-fill text-center">flex-fill longer</div>
    <div class="p-2 border flex-grow-1 bg-light text-center">flex-grow-1</div>
  </div>
  <div class="row g-3">
    <div class="col-6"><div class="d-flex flex-column h-100 border rounded p-3">
      <h6>Basic</h6><p class="small">Short text.</p>
      <button class="btn btn-outline-primary mt-auto">Choose</button></div></div>
    <div class="col-6"><div class="d-flex flex-column h-100 border rounded p-3">
      <h6>Pro</h6><p class="small">Much longer description that takes more lines so this card is taller than the other one.</p>
      <button class="btn btn-primary mt-auto">Choose</button></div></div>
  </div>
  <div class="hstack gap-2 mt-3"><span class="border p-1">hstack</span><span class="border p-1">item</span><span class="border p-1 ms-auto">ms-auto</span></div>
</div>`,
      },
      result: 'A dark header with brand left and links right, a blue box centred in a pale area, a stretchy flex row, two equal-height cards with buttons aligned at the bottom, and an hstack with the last item pushed right.',
      explanation: 'justify-content-between spreads items to the ends. Centring uses both axes. In a flex column, mt-auto absorbs all free vertical space, pushing the button to the bottom; h-100 makes both cards fill the row height.',
    },
    {
      title: 'Position Utilities: Notification Badge and Overlay',
      scenario: 'Place a counter badge on a button\'s corner and a centred label over an image.',
      steps: [
        'Make the button position-relative',
        'Add a span with position-absolute top-0 start-100 translate-middle',
        'Wrap an image in position-relative and put a label at top-50 start-50 translate-middle',
        'Add a sticky-top bar inside a scrollable box',
      ],
      code: `<button class="btn btn-primary position-relative">
  Inbox
  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9</span>
</button>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <button class="btn btn-primary position-relative me-4">
    Inbox
    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">9<span class="visually-hidden"> unread messages</span></span>
  </button>
  <button class="btn btn-secondary position-relative">
    Alerts
    <span class="position-absolute top-0 start-100 translate-middle p-2 bg-success border border-light rounded-circle"></span>
  </button>
  <div class="position-relative mt-4" style="max-width:400px">
    <img src="https://picsum.photos/id/1018/400/220" class="img-fluid rounded" alt="Mountains">
    <span class="position-absolute top-50 start-50 translate-middle bg-dark bg-opacity-75 text-white px-3 py-1 rounded">Explore</span>
    <span class="position-absolute bottom-0 end-0 m-2 badge text-bg-light">4K</span>
  </div>
  <div class="overflow-auto border mt-4" style="height:140px">
    <div class="sticky-top bg-warning p-2">sticky-top header (scroll me)</div>
    <p class="p-2">Line 1</p><p class="p-2">Line 2</p><p class="p-2">Line 3</p><p class="p-2">Line 4</p><p class="p-2">Line 5</p>
  </div>
</div>`,
      },
      result: 'Two buttons with a red counter pill and a green dot on their top-right corners, an image with a centred "Explore" label and a 4K tag in its bottom-right, and a scroll box whose yellow header stays at the top.',
      explanation: 'position-absolute is placed relative to the nearest position-relative ancestor. start-100 moves the badge to the right edge, translate-middle shifts it back by half its size so its centre sits exactly on the corner. sticky-top sets position: sticky; top: 0.',
    },
  ],
  interview: [
    { q: 'Explain the class "px-md-4".', a: 'Padding on the x-axis (left and right) of size 4 (1.5rem), applied from the md breakpoint (768px) upwards.', level: 'Easy' },
    { q: 'What are the default spacing scale values?', a: '0 = 0, 1 = .25rem, 2 = .5rem, 3 = 1rem, 4 = 1.5rem, 5 = 3rem, based on $spacer = 1rem.', level: 'Easy' },
    { q: 'Why does Bootstrap 5 use ms/me instead of ml/mr?', a: 'To support RTL languages: start/end map to left/right in LTR and right/left in RTL, so the same markup works in both directions.', level: 'Medium' },
    { q: 'How do you hide an element only on mobile?', a: 'class="d-none d-md-block" (hidden below md, block from md). For flex elements use d-md-flex.', level: 'Easy' },
    { q: 'Difference between d-none, invisible and visually-hidden?', a: 'd-none: display:none, no space and not read by screen readers. invisible: visibility:hidden, keeps space, not read. visually-hidden: off-screen clip, no visual but read by screen readers.', level: 'Medium' },
    { q: 'How do you centre a div horizontally and vertically using Bootstrap?', a: 'On the parent: d-flex justify-content-center align-items-center plus a height (e.g. min-vh-100). Or position-absolute top-50 start-50 translate-middle.', level: 'Easy' },
    { q: 'What does mt-auto do inside a flex column?', a: 'margin-top:auto absorbs all free space above the element, pushing it to the bottom of the flex container. Used to align card buttons at the bottom.', level: 'Medium' },
    { q: 'Why does h-100 sometimes not work?', a: 'Percentage heights need a parent with a defined height. If the parent height is auto, h-100 has nothing to be 100% of.', level: 'Medium' },
    { q: 'Why do Bootstrap utilities use !important?', a: 'Utilities are meant to override component styles in one class without specificity battles; !important guarantees they win.', level: 'Hard' },
    { q: 'What do .hstack and .vstack do?', a: 'Shortcuts for flex layouts: .hstack is a horizontal flex row with align-items center, .vstack is a vertical flex column; combine with gap-*.', level: 'Medium' },
    { q: 'How do you place a badge on the top-right corner of a button?', a: 'Make the button position-relative and add a badge with position-absolute top-0 start-100 translate-middle.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Build a full-screen hero section with content centred both ways.',
      hint: 'min-vh-100 d-flex align-items-center justify-content-center.',
      solution: `<section class="min-vh-100 d-flex flex-column align-items-center justify-content-center text-center bg-dark text-white">
  <h1 class="display-4">Hello!</h1>
  <p class="lead">Centred with flex utilities.</p>
</section>`,
    },
    {
      task: 'Create a toolbar that stacks vertically on mobile and becomes a horizontal row with space-between from md.',
      hint: 'd-flex flex-column flex-md-row justify-content-md-between gap-2.',
      solution: `<div class="d-flex flex-column flex-md-row justify-content-md-between gap-2 p-2 border">
  <button class="btn btn-outline-secondary">Filter</button>
  <input class="form-control w-auto" placeholder="Search">
  <button class="btn btn-primary">Add new</button>
</div>`,
    },
    {
      task: 'Create a "skip to main content" link that is invisible until focused with the keyboard.',
      hint: 'visually-hidden-focusable.',
      solution: `<a class="visually-hidden-focusable" href="#main">Skip to main content</a>
<nav>...</nav>
<main id="main">Main content</main>`,
    },
    {
      task: 'Place a "SALE" ribbon in the top-left corner of a product image and a heart button in the top-right.',
      hint: 'position-relative wrapper; position-absolute top-0 start-0 and top-0 end-0 with m-2.',
      solution: `<div class="position-relative d-inline-block">
  <img src="https://picsum.photos/id/26/300/200" class="rounded" alt="Product">
  <span class="position-absolute top-0 start-0 m-2 badge text-bg-danger">SALE</span>
  <button class="position-absolute top-0 end-0 m-2 btn btn-light btn-sm rounded-circle" aria-label="Add to wishlist">&#9825;</button>
</div>`,
    },
    {
      task: 'Make a chat layout: fixed-height box with scrollable messages and an input row pinned at the bottom.',
      hint: 'd-flex flex-column with height, flex-grow-1 overflow-auto on messages.',
      solution: `<div class="d-flex flex-column border rounded" style="height:300px">
  <div class="flex-grow-1 overflow-auto p-2">
    <p class="bg-light p-2 rounded w-75">Hi!</p>
    <p class="bg-primary text-white p-2 rounded w-75 ms-auto">Hello, how can I help?</p>
  </div>
  <div class="d-flex gap-2 p-2 border-top">
    <input class="form-control" placeholder="Type a message">
    <button class="btn btn-primary">Send</button>
  </div>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which class adds 1rem margin on the bottom?', options: ['mb-3', 'mb-1', 'mb-4', 'm-b-3'], answer: 0, explanation: 'Size 3 = 1rem.' },
    { question: 'Which combination shows an element only on lg screens and larger?', options: ['d-lg-none', 'd-none d-lg-block', 'd-block d-lg-none', 'visible-lg'], answer: 1, explanation: 'Hidden by default, displayed from lg.' },
    { question: 'Which class keeps the element\'s space but hides it?', options: ['d-none', 'visually-hidden', 'opacity-0 d-none', 'invisible'], answer: 3, explanation: 'invisible = visibility:hidden.' },
    { question: 'To spread three flex items so the first and last touch the edges, use:', options: ['justify-content-around', 'justify-content-center', 'justify-content-between', 'align-items-between'], answer: 2, explanation: 'space-between puts free space only between items.' },
    { question: '.translate-middle applies:', options: ['transform: translate(-50%, -50%)', 'margin: auto', 'top: 50%; left: 50%', 'position: absolute'], answer: 0, explanation: 'It only applies the transform; use top-50 start-50 for coordinates.' },
  ],
};
