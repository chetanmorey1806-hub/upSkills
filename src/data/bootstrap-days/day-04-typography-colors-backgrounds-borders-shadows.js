export default {
  id: 'day-04-typography-colors-backgrounds-borders-shadows',
  title: 'Typography, Colors, Backgrounds, Borders and Shadows',
  module: 'Module 1: Bootstrap Basics & Layout',
  day: 4,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Style text, colours and boxes with Bootstrap: headings, display text, lead, font utilities, theme colours, text-bg helpers, subtle backgrounds, gradients, opacity, borders, rounded corners and shadows.',
  objectives: [
    'Use heading classes, display headings, lead text and inline text elements',
    'Apply font utilities: fs-*, fw-*, fst-*, text-* alignment, transform and wrapping',
    'Use the eight theme colours for text, backgrounds, links and text-bg-* combinations',
    'Add and customise borders, border radius and shadows',
  ],
  theory: [
    {
      heading: 'Headings, Display Headings and Lead',
      content: 'Bootstrap styles `<h1>`–`<h6>` with a responsive size scale, and provides classes `.h1`–`.h6` so you can make **any** element look like a heading without changing the semantic level. Example: an `<h2>` that should look smaller can use `class="h4"`.\n\n- **Display headings** `.display-1` … `.display-6` – very large, lighter headings for hero sections\n- `.lead` – a larger, lighter intro paragraph\n- Inline elements: `<mark>`, `<small>`/`.small`, `<del>`, `<abbr title>`, `.initialism`\n- `<blockquote class="blockquote">` + `<figcaption class="blockquote-footer">`\n- Lists: `.list-unstyled` (no bullets, no padding), `.list-inline` + `.list-inline-item`',
      tip: 'Choose heading tags for document structure (one h1 per page, then h2, h3…) and visual size via classes. Never skip heading levels just to get a smaller font.',
    },
    {
      heading: 'Font and Text Utilities',
      content: 'Utility classes change one CSS property each:\n\n- Size: `.fs-1` (largest) … `.fs-6`\n- Weight: `.fw-bold`, `.fw-bolder`, `.fw-semibold`, `.fw-medium`, `.fw-normal`, `.fw-light`, `.fw-lighter`\n- Style: `.fst-italic`, `.fst-normal`\n- Alignment: `.text-start`, `.text-center`, `.text-end`, responsive like `.text-md-start`\n- Transform: `.text-lowercase`, `.text-uppercase`, `.text-capitalize`\n- Decoration: `.text-decoration-underline`, `.text-decoration-line-through`, `.text-decoration-none`\n- Wrapping: `.text-wrap`, `.text-nowrap`, `.text-truncate` (ellipsis, needs block/inline-block), `.text-break`\n- Line height: `.lh-1`, `.lh-sm`, `.lh-base`, `.lh-lg`\n- Monospace: `.font-monospace`',
      points: [
        'text-truncate requires display: block or inline-block and a width limit',
        'Responsive text alignment: text-center text-lg-start',
      ],
    },
    {
      heading: 'Theme Colours and Text Colours',
      content: 'Bootstrap has eight **theme colours**: `primary` (blue), `secondary` (grey), `success` (green), `danger` (red), `warning` (yellow), `info` (cyan), `light`, `dark`.\n\n- Text: `.text-primary`, `.text-danger`, `.text-body`, `.text-body-secondary`, `.text-body-tertiary`, `.text-white`, `.text-black`\n- Emphasis (5.3): `.text-primary-emphasis` – darker readable shade for text on subtle backgrounds\n- Opacity: `.text-opacity-50` (with a text colour class)\n- Links: `.link-primary`, `.link-danger`, link utilities like `.link-underline-opacity-0`, `.link-offset-2`\n\nAnalogy: theme colours are like named paints in a paint shop; you say "primary" rather than mixing a hex code every time, and change the paint centrally later.',
      tip: '`.text-muted` still works but is deprecated in 5.3; use `.text-body-secondary`.',
    },
    {
      heading: 'Backgrounds and text-bg-*',
      content: '- `.bg-primary` … `.bg-dark`, `.bg-white`, `.bg-body`, `.bg-body-secondary`, `.bg-body-tertiary`, `.bg-transparent`\n- `.bg-primary-subtle` etc. – soft pastel backgrounds (pair with `.text-primary-emphasis` and `.border-primary-subtle`)\n- `.bg-gradient` – adds a subtle gradient overlay to a background colour\n- `.bg-opacity-10/25/50/75` – transparent backgrounds\n- `.text-bg-{color}` – sets background **and** a contrasting text colour automatically (e.g. `.text-bg-warning` gives dark text on yellow)\n\nAccessibility: colour alone must not convey meaning; add text or icons too, and ensure enough contrast (WCAG 4.5:1 for normal text).',
      syntax: `<div class="p-3 text-bg-success">Saved successfully</div>
<div class="p-3 bg-danger-subtle text-danger-emphasis border border-danger-subtle rounded">Soft error</div>
<div class="p-3 bg-primary bg-gradient text-white">Gradient</div>`,
    },
    {
      heading: 'Borders and Rounded Corners',
      content: 'Borders:\n- Add: `.border`, `.border-top`, `.border-end`, `.border-bottom`, `.border-start`\n- Remove: `.border-0`, `.border-top-0` …\n- Colour: `.border-primary`, `.border-danger-subtle`…\n- Width: `.border-1` … `.border-5`\n- Opacity: `.border-opacity-50`\n\nRadius:\n- `.rounded`, `.rounded-0` … `.rounded-5`\n- Sides: `.rounded-top`, `.rounded-end`, `.rounded-bottom`, `.rounded-start`\n- Shapes: `.rounded-circle` (needs equal width and height), `.rounded-pill`',
    },
    {
      heading: 'Shadows and Opacity',
      content: '- `.shadow-none`, `.shadow-sm` (subtle), `.shadow` (regular), `.shadow-lg` (large)\n- `.opacity-100`, `.opacity-75`, `.opacity-50`, `.opacity-25`, `.opacity-0` – affects the **whole element**, including children\n\nCombine utilities to create card-like boxes without writing CSS: `class="p-4 bg-body rounded-3 border shadow-sm"`.',
      points: [
        'Shadows give depth: use sm for cards, lg for modals/popups',
        'Use bg-opacity-* instead of opacity-* if text must stay fully visible',
        'Coming next (Day 5): spacing, sizing, display, flex, position and visibility utilities',
      ],
    },
  ],
  examples: [
    {
      title: 'Typography Showcase',
      scenario: 'Create an article header that uses display text, lead, h-classes, inline elements and a blockquote.',
      steps: [
        'Add a display-4 heading and a lead paragraph',
        'Add an h2 styled as .h4 to show semantic vs visual size',
        'Use mark, small, abbr and del inline',
        'Add a blockquote with footer',
      ],
      code: `<h1 class="display-4">Learning Bootstrap</h1>
<p class="lead">A quick guide to typography utilities.</p>
<h2 class="h4">Semantic h2, looks like h4</h2>
<p>You can <mark>highlight</mark>, write <small>small print</small>,
<del>strike old prices</del> and explain <abbr title="Cascading Style Sheets">CSS</abbr>.</p>
<figure>
  <blockquote class="blockquote"><p>Simplicity is the soul of efficiency.</p></blockquote>
  <figcaption class="blockquote-footer">Austin Freeman</figcaption>
</figure>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <h1 class="display-4">Learning Bootstrap</h1>
  <p class="lead">A quick guide to typography utilities.</p>
  <h2 class="h4">Semantic h2, looks like h4</h2>
  <p>You can <mark>highlight</mark>, write <small>small print</small>,
  <del>strike old prices</del> and explain <abbr title="Cascading Style Sheets">CSS</abbr>.</p>
  <figure>
    <blockquote class="blockquote"><p>Simplicity is the soul of efficiency.</p></blockquote>
    <figcaption class="blockquote-footer">Austin Freeman</figcaption>
  </figure>
  <p class="fs-5 fw-semibold fst-italic text-uppercase">fs-5 fw-semibold fst-italic text-uppercase</p>
  <p class="text-truncate border p-2" style="max-width:260px">This sentence is far too long to fit, so it is truncated with an ellipsis.</p>
  <ul class="list-inline">
    <li class="list-inline-item">HTML</li><li class="list-inline-item">CSS</li><li class="list-inline-item">Bootstrap</li>
  </ul>
</div>`,
      },
      result: 'A large light heading, larger intro text, a medium heading, highlighted/struck/small text, a quote with "— Austin Freeman", an uppercase italic line, a truncated line ending in "..." and an inline list.',
      explanation: 'display-* and lead come from the typography module. .h4 copies h4 sizing to an h2. text-truncate sets overflow:hidden; text-overflow:ellipsis; white-space:nowrap.',
    },
    {
      title: 'Theme Colour Palette',
      scenario: 'Generate swatches for all eight theme colours with text-bg-*, subtle backgrounds and text colours.',
      steps: [
        'Make a list of the 8 colour names in JS',
        'For each, create a column with a text-bg-{name} box and a bg-{name}-subtle box',
        'Append to a row-cols grid',
        'Run to compare solid and subtle variants',
      ],
      code: `<div class="p-2 text-bg-primary">primary</div>
<div class="p-2 bg-primary-subtle text-primary-emphasis border border-primary-subtle">primary subtle</div>
<p class="text-success">text-success</p>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="row row-cols-2 row-cols-md-4 g-2" id="pal"></div>
  <p class="mt-3">
    <span class="text-primary">primary</span> · <span class="text-success">success</span> ·
    <span class="text-danger">danger</span> · <span class="text-body-secondary">body-secondary</span> ·
    <a href="#" class="link-danger link-offset-2">link-danger</a>
  </p>
</div>`,
        js: `const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
const pal = document.getElementById('pal');
colors.forEach(function (c) {
  const col = document.createElement('div');
  col.className = 'col';
  col.innerHTML = '<div class="p-2 text-bg-' + c + ' rounded-top small">text-bg-' + c + '</div>' +
    '<div class="p-2 bg-' + c + '-subtle text-' + c + '-emphasis border border-' + c + '-subtle rounded-bottom small">' + c + '-subtle</div>';
  pal.appendChild(col);
});`,
      },
      result: 'Eight swatches, each a solid colour block with automatically contrasting text and a pastel block underneath, plus a line of coloured text.',
      explanation: 'text-bg-{color} sets background-color and color using the colour\'s contrast value, so warning/light get dark text. The -subtle and -emphasis variants (5.3) are designed to be paired for readable soft UI.',
    },
    {
      title: 'Borders, Radius and Shadows',
      scenario: 'Build a visual reference of border, rounded and shadow utilities.',
      steps: [
        'Create boxes with different border classes',
        'Create boxes with different rounded classes, including circle and pill',
        'Create boxes with shadow-sm, shadow and shadow-lg',
        'Run and compare',
      ],
      code: `<div class="border border-3 border-danger p-3">border-3 danger</div>
<div class="rounded-circle bg-info" style="width:80px;height:80px"></div>
<span class="rounded-pill bg-dark text-white px-3 py-1">pill</span>
<div class="shadow-lg p-3">shadow-lg</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <h6>Borders</h6>
  <div class="d-flex flex-wrap gap-3 mb-4">
    <div class="box border">border</div>
    <div class="box border-top border-primary border-3">border-top</div>
    <div class="box border border-danger border-3">border-3 danger</div>
    <div class="box border border-success border-opacity-25 border-5">opacity-25</div>
    <div class="box border border-end-0">border-end-0</div>
  </div>
  <h6>Rounded</h6>
  <div class="d-flex flex-wrap gap-3 align-items-center mb-4">
    <div class="box bg-secondary-subtle rounded-0">rounded-0</div>
    <div class="box bg-secondary-subtle rounded">rounded</div>
    <div class="box bg-secondary-subtle rounded-4">rounded-4</div>
    <div class="bg-info rounded-circle d-flex align-items-center justify-content-center" style="width:80px;height:80px">circle</div>
    <span class="bg-dark text-white rounded-pill px-3 py-1">rounded-pill</span>
  </div>
  <h6>Shadows</h6>
  <div class="d-flex flex-wrap gap-4">
    <div class="box shadow-none border">none</div>
    <div class="box shadow-sm">shadow-sm</div>
    <div class="box shadow">shadow</div>
    <div class="box shadow-lg">shadow-lg</div>
    <div class="box shadow bg-primary text-white opacity-50">opacity-50</div>
  </div>
</div>`,
        css: `.box { width: 120px; padding: 1rem .5rem; text-align: center; font-size: .85rem; background: #fff; }`,
      },
      result: 'Rows of white boxes showing different border sides/widths/colours, corner radii from square to circle and pill, and increasing shadow depth.',
      explanation: 'Each class sets a single property: border-3 sets border-width, border-danger sets --bs-border-color, rounded-4 sets border-radius from the radius scale, shadow-lg sets a larger box-shadow.',
    },
    {
      title: 'Profile Card Built Only with Utilities',
      scenario: 'Combine typography, colour, border and shadow utilities to make a team-member card without custom CSS.',
      steps: [
        'Create a bordered rounded box with shadow-sm and padding',
        'Add a circular avatar image',
        'Add name (fs-5 fw-semibold), role (text-body-secondary) and a skill badge row with rounded-pill',
        'Run',
      ],
      code: `<div class="text-center p-4 border rounded-4 shadow-sm bg-body" style="max-width:300px">
  <img src="https://picsum.photos/id/64/120" class="rounded-circle border border-4 border-primary-subtle mb-3" width="100" height="100" alt="Asha">
  <div class="fs-5 fw-semibold">Asha Patil</div>
  <div class="text-body-secondary small text-uppercase">Frontend Developer</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="mx-auto text-center p-4 border rounded-4 shadow-sm bg-body" style="max-width:300px">
    <img src="https://picsum.photos/id/64/120/120" class="rounded-circle border border-4 border-primary-subtle mb-3" width="100" height="100" alt="Asha Patil">
    <div class="fs-5 fw-semibold">Asha Patil</div>
    <div class="text-body-secondary small text-uppercase mb-3">Frontend Developer</div>
    <span class="bg-primary-subtle text-primary-emphasis rounded-pill px-2 py-1 small">HTML</span>
    <span class="bg-success-subtle text-success-emphasis rounded-pill px-2 py-1 small">CSS</span>
    <span class="bg-warning-subtle text-warning-emphasis rounded-pill px-2 py-1 small">JS</span>
    <p class="fst-italic text-body-tertiary mt-3 mb-0">"I love pixel-perfect UIs."</p>
  </div>
</div>`,
      },
      result: 'A centred white card with a circular photo ringed in pale blue, the name in semibold, an uppercase grey role, three pastel pill tags and an italic quote.',
      explanation: 'No custom CSS was needed: spacing (p-4, mb-3), radius (rounded-4, rounded-circle, rounded-pill), colour pairs (bg-*-subtle + text-*-emphasis) and typography utilities compose the design.',
    },
  ],
  interview: [
    { q: 'What is the difference between <h3> and class="h3"?', a: '<h3> is a semantic heading that affects document outline and accessibility; .h3 only applies h3 visual styles to any element without changing semantics.', level: 'Easy' },
    { q: 'What are display headings?', a: 'Classes .display-1 to .display-6 that give larger, lighter headings for hero sections; they are bigger than normal h1.', level: 'Easy' },
    { q: 'Name the Bootstrap theme colours.', a: 'primary, secondary, success, danger, warning, info, light, dark.', level: 'Easy' },
    { q: 'What does .text-bg-warning do compared to .bg-warning?', a: '.bg-warning only sets the background. .text-bg-warning sets the background and an automatically contrasting text colour (dark on yellow), ensuring readability.', level: 'Medium' },
    { q: 'What are the -subtle and -emphasis colour utilities in Bootstrap 5.3?', a: 'bg-{color}-subtle gives a light tint background, border-{color}-subtle a light border and text-{color}-emphasis a darker text shade. They work together for soft components and adapt to dark mode.', level: 'Medium' },
    { q: 'How do you truncate long text with an ellipsis?', a: 'Add .text-truncate to a block or inline-block element with a limited width; it sets overflow hidden, text-overflow ellipsis and white-space nowrap.', level: 'Easy' },
    { q: 'Difference between .opacity-50 and .bg-opacity-50?', a: '.opacity-50 makes the entire element including text and children 50% transparent; .bg-opacity-50 makes only the background colour transparent (works with bg-* classes through --bs-bg-opacity).', level: 'Medium' },
    { q: 'How do you make a perfect circle image?', a: 'Use .rounded-circle on an element with equal width and height (e.g. width="100" height="100"); otherwise it becomes an ellipse. Add object-fit-cover if the source isn\'t square.', level: 'Easy' },
    { q: 'What replaced .text-muted in Bootstrap 5.3?', a: '.text-body-secondary (and .text-body-tertiary) which adapt to color modes. .text-muted is deprecated.', level: 'Medium' },
    { q: 'Why should colour not be the only way to convey meaning?', a: 'Colour-blind users and screen readers cannot perceive it; add text, icons or visually hidden labels (e.g. "Error:") along with red colour.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a notice box with a soft yellow background, darker yellow text, a left border of width 4 and rounded corners.',
      hint: 'bg-warning-subtle text-warning-emphasis border-start border-4 border-warning rounded.',
      solution: `<div class="p-3 bg-warning-subtle text-warning-emphasis border-start border-4 border-warning rounded">
  <strong>Note:</strong> The exam schedule has changed.
</div>`,
    },
    {
      task: 'Make a hero heading that is centred on mobile and left-aligned from md, using display-5 and a lead paragraph.',
      hint: 'text-center text-md-start.',
      solution: `<section class="container py-5 text-center text-md-start">
  <h1 class="display-5 fw-bold">Grow your business</h1>
  <p class="lead text-body-secondary">Tools for small shops to sell online.</p>
</section>`,
    },
    {
      task: 'Display a price block: old price struck through in grey, new price large and green, discount pill in red.',
      hint: 'text-decoration-line-through, fs-3 text-success, badge-like rounded-pill.',
      solution: `<p>
  <span class="text-decoration-line-through text-body-secondary">Rs 2,999</span>
  <span class="fs-3 fw-bold text-success ms-2">Rs 1,999</span>
  <span class="bg-danger text-white rounded-pill px-2 py-1 small ms-2">33% OFF</span>
</p>`,
    },
    {
      task: 'Create three "stat tiles" with shadow-sm, rounded-3 and text-bg-primary / success / danger, showing a number in fs-2 fw-bold.',
      hint: 'Use a flex row with gap-3.',
      solution: `<div class="d-flex gap-3">
  <div class="p-3 rounded-3 shadow-sm text-bg-primary"><div class="fs-2 fw-bold">120</div>Students</div>
  <div class="p-3 rounded-3 shadow-sm text-bg-success"><div class="fs-2 fw-bold">95%</div>Pass rate</div>
  <div class="p-3 rounded-3 shadow-sm text-bg-danger"><div class="fs-2 fw-bold">4</div>Pending</div>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which class makes a paragraph stand out as an intro?', options: ['.lead', '.intro', '.display-p', '.fs-lead'], answer: 0, explanation: '.lead increases font-size and lightens weight.' },
    { question: 'Which class gives a pastel red background?', options: ['.bg-danger-light', '.bg-danger-subtle', '.bg-light-danger', '.bg-danger-50'], answer: 1, explanation: 'Bootstrap 5.3 uses -subtle for tinted backgrounds.' },
    { question: 'Which class creates the biggest shadow?', options: ['.shadow', '.shadow-sm', '.shadow-xl', '.shadow-lg'], answer: 3, explanation: '.shadow-lg is the largest built-in shadow.' },
    { question: 'Which class removes the default bullets and left padding from a list?', options: ['.list-none', '.list-inline', '.list-unstyled', '.no-bullets'], answer: 2, explanation: '.list-unstyled removes list-style and padding.' },
    { question: '.fs-1 compared to .fs-6 is:', options: ['Larger', 'Smaller', 'Same size, bolder', 'Same size, lighter'], answer: 0, explanation: 'fs-1 corresponds to h1 size, the largest.' },
  ],
};
