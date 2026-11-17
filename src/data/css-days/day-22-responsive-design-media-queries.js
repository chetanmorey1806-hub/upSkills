export default {
  id: 'day-22-responsive-design-media-queries',
  title: 'Responsive Web Design, Viewport, Media Queries, Mobile-First',
  module: 'Module 5: Responsive Design',
  day: 22,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Responsive web design makes one website look good on phones, tablets and desktops. Learn the viewport meta tag, media query syntax, common breakpoints and why professionals write CSS mobile-first.',
  objectives: [
    'Explain responsive design and the role of the viewport meta tag',
    'Write media queries using min-width, max-width, ranges, orientation and feature queries like prefers-color-scheme',
    'Apply the mobile-first approach with min-width breakpoints',
    'Turn a single-column mobile layout into a multi-column desktop layout',
  ],
  theory: [
    {
      heading: 'What is Responsive Web Design?',
      content: `**Responsive Web Design (RWD)** means a single HTML page adapts its layout to the screen it is viewed on. The term was coined by Ethan Marcotte in 2010 and rests on three ideas:

1. **Fluid layouts** – widths in %, fr, flex instead of fixed px
2. **Flexible media** – images that never overflow (\`max-width: 100%\`)
3. **Media queries** – apply different CSS at different screen sizes

Analogy: water takes the shape of whatever glass you pour it into. A responsive site is the water; devices are the glasses.

Over 60% of web traffic comes from phones, and Google uses mobile-first indexing, so responsive design is not optional.`,
    },
    {
      heading: 'The viewport meta tag',
      content: `Without this tag, mobile browsers pretend the screen is ~980px wide and zoom the page out, so your media queries never fire and text is tiny.

Always put this in the \`<head>\`:

\`<meta name="viewport" content="width=device-width, initial-scale=1">\`

- \`width=device-width\` – layout width = device's CSS width (e.g. 390px on an iPhone)
- \`initial-scale=1\` – no zoom on load

Never add \`user-scalable=no\` or \`maximum-scale=1\` – blocking zoom hurts accessibility.`,
      syntax: `<meta name="viewport" content="width=device-width, initial-scale=1">`,
    },
    {
      heading: 'Media query syntax',
      content: `A media query wraps CSS that only applies when a condition is true.

- \`@media (min-width: 768px) { ... }\` – viewport **768px or wider**
- \`@media (max-width: 767px) { ... }\` – viewport **767px or narrower**
- \`@media (min-width: 600px) and (max-width: 900px)\` – a range
- Modern range syntax: \`@media (600px <= width <= 900px)\`
- \`@media (orientation: landscape)\`
- \`@media print\` – styles for printing
- \`@media (hover: hover)\` – device has a real mouse
- \`@media (prefers-color-scheme: dark)\` – user's OS is in dark mode
- \`@media (prefers-reduced-motion: reduce)\` – user wants less animation

Media types: \`all\` (default), \`screen\`, \`print\`.`,
      syntax: `@media (min-width: 768px) {
  .grid { grid-template-columns: repeat(2, 1fr); }
}`,
      tip: 'Media queries do not add specificity. Place them AFTER the base rules, or the base rules will override them.',
    },
    {
      heading: 'Mobile-first vs desktop-first',
      content: `**Desktop-first** writes desktop styles as the base and uses \`max-width\` queries to fix smaller screens.

**Mobile-first** writes **mobile styles as the base** (usually simple, one column) and uses \`min-width\` queries to **add** complexity as space grows.

Why mobile-first is preferred:
- Phones download less override CSS
- Simple stacked layout is the natural default for HTML
- Forces you to prioritise content
- Progressive enhancement: start small, enhance up`,
      syntax: `/* Mobile base */
.cards { display: grid; gap: 16px; }

/* Tablet */
@media (min-width: 640px) { .cards { grid-template-columns: 1fr 1fr; } }

/* Desktop */
@media (min-width: 1024px) { .cards { grid-template-columns: repeat(4, 1fr); } }`,
    },
    {
      heading: 'Choosing breakpoints',
      content: `A **breakpoint** is a width at which the layout changes. Common starting points (similar to Tailwind/Bootstrap):

- \`640px\` – large phones / small tablets
- \`768px\` – tablets
- \`1024px\` – laptops
- \`1280px\` – desktops

Better advice: **let the content decide**. Widen the browser until the design looks stretched or broken, and add a breakpoint there. Use DevTools Device Mode (Ctrl+Shift+M) to test.

You can also use \`em\` for breakpoints (\`48em\` = 768px) so they respect user font-size settings.

**Coming next:** Day 23 – responsive images and fluid typography with clamp().`,
    },
  ],
  examples: [
    {
      title: 'Mobile-first card grid with two breakpoints',
      scenario: 'A product list should show 1 column on phones, 2 on tablets, 4 on desktops.',
      steps: [
        'Write base CSS: grid with gap, one column',
        'Add @media (min-width: 500px) with 2 columns',
        'Add @media (min-width: 800px) with 4 columns',
        'Run and drag the preview width; watch the label change too',
      ],
      code: `.grid { display: grid; gap: 12px; }
@media (min-width: 500px) { .grid { grid-template-columns: repeat(2, 1fr); } }
@media (min-width: 800px) { .grid { grid-template-columns: repeat(4, 1fr); } }`,
      playground: {
        html: `<p class="label"></p>
<div class="grid">
  <div>Product 1</div><div>Product 2</div><div>Product 3</div><div>Product 4</div>
  <div>Product 5</div><div>Product 6</div><div>Product 7</div><div>Product 8</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.label::before { content: "📱 Mobile: 1 column"; font-weight: 700; }
.grid { display: grid; gap: 12px; }
.grid div { padding: 24px; background: #fef9c3; border: 2px solid #eab308; border-radius: 8px; text-align: center; }

@media (min-width: 500px) {
  .label::before { content: "📟 Tablet: 2 columns"; }
  .grid { grid-template-columns: repeat(2, 1fr); }
  .grid div { background: #dcfce7; border-color: #22c55e; }
}
@media (min-width: 800px) {
  .label::before { content: "🖥️ Desktop: 4 columns"; }
  .grid { grid-template-columns: repeat(4, 1fr); }
  .grid div { background: #dbeafe; border-color: #3b82f6; }
}`,
      },
      result: 'Narrow preview: yellow single column. Medium: green 2 columns. Wide: blue 4 columns. The label names the current mode.',
      explanation: 'Base styles serve mobile; each min-width query adds columns and changes colour when the viewport is wide enough. Later queries override earlier ones because they come later in the source.',
    },
    {
      title: 'Navbar that stacks on mobile',
      scenario: 'Links appear in a column on small screens and in a row on wider screens.',
      steps: [
        'Base: nav as flex column',
        'At min-width: 600px switch to flex row with space-between',
        'Run and resize',
      ],
      code: `.nav { display: flex; flex-direction: column; gap: 8px; }
@media (min-width: 600px) {
  .nav { flex-direction: row; justify-content: space-between; align-items: center; }
}`,
      playground: {
        html: `<nav class="nav">
  <strong class="logo">TravelGo</strong>
  <div class="links"><a href="#">Flights</a><a href="#">Hotels</a><a href="#">Cars</a></div>
</nav>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.nav { display: flex; flex-direction: column; gap: 8px; padding: 12px 16px; background: #065f46; color: #fff; }
.links { display: flex; flex-direction: column; gap: 6px; }
.links a { color: #d1fae5; text-decoration: none; padding: 6px 0; border-top: 1px solid #047857; }
@media (min-width: 600px) {
  .nav { flex-direction: row; justify-content: space-between; align-items: center; }
  .links { flex-direction: row; gap: 20px; }
  .links a { border: 0; }
}`,
      },
      result: 'Narrow: logo above a vertical list of links with separators. Wide: logo left, links in a row on the right.',
      explanation: 'The mobile layout is the default; one min-width query rearranges both the nav and its link group.',
    },
    {
      title: 'Layout switch with grid-template-areas',
      scenario: 'A blog page with sidebar below the article on mobile and beside it on desktop.',
      steps: [
        'Base: one-column grid areas header / main / sidebar / footer',
        'At 700px redefine areas to two columns',
        'Run and resize',
      ],
      code: `.page { display: grid; grid-template-areas: "header" "main" "sidebar" "footer"; }
@media (min-width: 700px) {
  .page { grid-template-columns: 3fr 1fr; grid-template-areas: "header header" "main sidebar" "footer footer"; }
}`,
      playground: {
        html: `<div class="page">
  <header>Header</header>
  <main>Article content</main>
  <aside>Sidebar</aside>
  <footer>Footer</footer>
</div>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.page { display: grid; gap: 8px; padding: 8px; grid-template-areas: "header" "main" "sidebar" "footer"; }
.page > * { padding: 20px; border-radius: 6px; color: #fff; }
header { grid-area: header; background: #1d4ed8; }
main { grid-area: main; background: #0f766e; min-height: 120px; }
aside { grid-area: sidebar; background: #b45309; }
footer { grid-area: footer; background: #374151; }
@media (min-width: 700px) {
  .page { grid-template-columns: 3fr 1fr; grid-template-areas: "header header" "main sidebar" "footer footer"; }
}`,
      },
      result: 'Mobile: everything stacks. Desktop: the orange sidebar moves to the right of the teal article.',
      explanation: 'Only the grid container changes in the media query – the items keep their grid-area names.',
    },
    {
      title: 'Feature queries: hover, reduced motion and print',
      scenario: 'Apply hover effects only on mouse devices, respect reduced-motion users and hide the button when printing.',
      steps: [
        'Add a .btn with a transition',
        'Put the hover effect inside @media (hover: hover)',
        'Disable transitions inside @media (prefers-reduced-motion: reduce)',
        'Hide .no-print inside @media print; press Ctrl+P to preview',
      ],
      code: `@media (hover: hover) { .btn:hover { transform: scale(1.08); } }
@media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
@media print { .no-print { display: none; } }`,
      playground: {
        html: `<p>Hover the button with a mouse. Try Ctrl+P – the button disappears in print preview.</p>
<button class="btn no-print">Hover me</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 24px; }
.btn { padding: 12px 24px; background: #9333ea; color: #fff; border: 0; border-radius: 8px; font: inherit; transition: transform .3s, background .3s; }
@media (hover: hover) {
  .btn:hover { transform: scale(1.08); background: #7e22ce; }
}
@media (prefers-reduced-motion: reduce) {
  * { transition: none !important; }
}
@media print {
  .no-print { display: none; }
}`,
      },
      result: 'On a desktop the purple button grows smoothly on hover; in print preview it is hidden.',
      explanation: 'Media features test device capabilities and user preferences, not just width.',
    },
  ],
  interview: [
    { q: 'What is responsive web design?', a: 'An approach where a single website adapts its layout and content to different screen sizes using fluid grids, flexible media and media queries.', level: 'Easy' },
    { q: 'Why is the viewport meta tag needed?', a: 'Without it mobile browsers render the page at a virtual ~980px width and scale it down, so media queries based on device width do not trigger and text is tiny.', level: 'Easy' },
    { q: 'What is mobile-first CSS?', a: 'Writing base styles for small screens and adding min-width media queries to enhance the layout for larger screens.', level: 'Easy' },
    { q: 'Why is mobile-first generally preferred?', a: 'Simpler default CSS, less overriding on mobile devices, progressive enhancement, and it forces content prioritisation.', level: 'Medium' },
    { q: 'Difference between min-width and max-width in media queries?', a: 'min-width applies when the viewport is at least that wide (used in mobile-first). max-width applies when it is at most that wide (desktop-first).', level: 'Easy' },
    { q: 'Do media queries increase specificity?', a: 'No. A rule inside a media query has the same specificity as outside, so source order decides. Place queries after base rules.', level: 'Medium' },
    { q: 'What is a breakpoint and how do you choose one?', a: 'A viewport width where the layout changes. Ideally choose where the content starts to look broken rather than targeting specific devices.', level: 'Medium' },
    { q: 'Name some media features other than width.', a: 'orientation, hover, pointer, prefers-color-scheme, prefers-reduced-motion, resolution, aspect-ratio, print media type.', level: 'Medium' },
    { q: 'Why should you never use user-scalable=no?', a: 'It prevents pinch-to-zoom, which hurts users with low vision and fails WCAG accessibility guidelines.', level: 'Medium' },
    { q: 'What is the modern range syntax for media queries?', a: '@media (400px <= width <= 800px) { ... } – equivalent to (min-width: 400px) and (max-width: 800px).', level: 'Hard' },
    { q: 'Why use em for breakpoints?', a: 'em-based media queries scale with the user\'s browser font-size setting, keeping layouts consistent when users zoom text.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Make a two-column "about" section (image + text) that stacks on screens below 600px – write it mobile-first.',
      hint: 'Base: block; @media (min-width: 600px): grid 1fr 1fr.',
      solution: `<style>
  .about img { width: 100%; }
  @media (min-width: 600px) {
    .about { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: center; }
  }
</style>
<section class="about"><img src="https://picsum.photos/seed/ab/600/400" alt=""><p>About us text...</p></section>`,
    },
    {
      task: 'Change the body font-size from 16px on mobile to 18px on screens ≥1024px.',
      hint: 'One min-width query.',
      solution: `<style>
  body { font-size: 16px; }
  @media (min-width: 1024px) { body { font-size: 18px; } }
</style>`,
    },
    {
      task: 'Hide a sidebar on phones and show it on tablets and up.',
      hint: 'display: none in the base, display: block at min-width 768px.',
      solution: `<style>
  .sidebar { display: none; }
  @media (min-width: 768px) { .sidebar { display: block; } }
</style>
<aside class="sidebar">Filters</aside>`,
    },
    {
      task: 'Write print styles that remove the nav and footer, use black text on white, and show link URLs after links.',
      hint: '@media print and a[href]::after { content: " (" attr(href) ")"; }',
      solution: `<style>
  @media print {
    nav, footer { display: none; }
    body { color: #000; background: #fff; }
    a[href]::after { content: " (" attr(href) ")"; }
  }
</style>`,
    },
  ],
  quiz: [
    { question: 'Which meta tag makes media queries work properly on phones?', options: ['<meta charset="utf-8">', '<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta name="responsive" content="true">', '<meta http-equiv="mobile">'], answer: 1, explanation: 'The viewport meta tag sets the layout width to the device width.' },
    { question: 'In mobile-first CSS you mainly use…', options: ['max-width queries', 'min-width queries', 'orientation queries', 'print queries'], answer: 1, explanation: 'Start small and add styles as the screen gets wider using min-width.' },
    { question: '@media (min-width: 768px) applies when the viewport is…', options: ['Exactly 768px', 'Smaller than 768px', '768px or wider', 'Only on tablets'], answer: 2, explanation: 'min-width means "at least".' },
    { question: 'Which media feature detects dark mode?', options: ['prefers-color-scheme', 'color-mode', 'theme', 'dark-mode'], answer: 0, explanation: 'prefers-color-scheme: dark matches when the OS uses a dark theme.' },
    { question: 'A media query placed BEFORE the base rule with the same selector will…', options: ['Always win', 'Throw an error', 'Have higher specificity', 'Be overridden by the later base rule'], answer: 3, explanation: 'Media queries add no specificity; the later rule wins.' },
  ],
};
