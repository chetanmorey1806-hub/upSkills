export default {
  id: 'day-21-centering-and-layout-patterns',
  title: 'Centering Techniques and Common Layout Patterns (Navbar, Holy Grail, Card Grid)',
  module: 'Module 4: Layout',
  day: 21,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Pull together everything from Module 4: master every way to center things in CSS and learn the reusable layout patterns found on almost every website – navbar, holy grail, card grid and sticky footer.',
  objectives: [
    'Center text, inline, block and unknown-size elements horizontally and vertically using the right technique',
    'Choose between Flexbox and Grid for a given layout problem',
    'Build a responsive navbar, a holy-grail layout and a card grid from scratch',
    'Create a sticky footer that stays at the bottom on short pages',
  ],
  theory: [
    {
      heading: 'Horizontal centering: pick the right tool',
      content: `"How do I center a div?" is the most famous CSS question. The answer depends on **what** you are centering:

- **Inline content / text** inside a block → \`text-align: center\` on the parent
- **A block element with a width** → \`margin: 0 auto\` (or \`margin-inline: auto\`)
- **Anything inside a flex container** → \`justify-content: center\`
- **Anything inside a grid container** → \`justify-content: center\` / \`justify-items: center\` / \`place-items: center\``,
      syntax: `.container { max-width: 960px; margin-inline: auto; } /* page wrapper */
.title { text-align: center; }`,
      tip: 'margin: auto only centers horizontally in normal block flow, and only if the element has a width smaller than its parent.',
    },
    {
      heading: 'Vertical (and both-axis) centering',
      content: `Vertical centering used to be hard. Today you have three reliable options:

1. **Grid (shortest):** \`display: grid; place-items: center;\`
2. **Flexbox:** \`display: flex; justify-content: center; align-items: center;\`
3. **Absolute + transform** (for overlays/badges on top of other content):
   \`position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);\`
   – top/left move the element's top-left corner to the centre; translate(-50%,-50%) shifts it back by half its own size.

Bonus: \`position: absolute; inset: 0; margin: auto;\` centers an element **with a known size**.

Remember: vertical centering needs the parent to have a **height** (e.g. \`min-height: 100vh\`).`,
      syntax: `.parent { display: grid; place-items: center; min-height: 100vh; }`,
    },
    {
      heading: 'Flexbox or Grid?',
      content: `Simple rule of thumb:
- **Flexbox** = content-out, **one direction**. Navbars, toolbars, button groups, centering, a row of tags, media objects (image + text).
- **Grid** = layout-in, **two directions**. Page skeletons, card galleries, dashboards, forms with aligned labels.

They work great together: a Grid page layout whose header uses Flexbox inside.`,
      points: [
        'Need items to wrap by their own content size? → Flexbox',
        'Need columns to line up across rows? → Grid',
        'Need overlapping items in the same cell? → Grid',
      ],
    },
    {
      heading: 'Pattern 1 & 2: Navbar and Holy Grail',
      content: `**Navbar:** logo on the left, links on the right, all vertically centered → Flexbox with \`justify-content: space-between; align-items: center\`. On small screens, wrap or stack with a media query (Day 22).

**Holy Grail:** header, footer, and three columns (nav, main, aside) where the footer stays at the bottom → Grid with \`grid-template-areas\` and \`grid-template-rows: auto 1fr auto; min-height: 100vh\`.

The name comes from the early 2000s when this layout was so hard with floats that it was called the "holy grail" of CSS.`,
      syntax: `body {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr auto;
}`,
    },
    {
      heading: 'Pattern 3 & 4: Card grid and Sticky footer',
      content: `**Card grid:** \`repeat(auto-fit, minmax(min(250px, 100%), 1fr))\` + gap. Inside each card, use Flexbox column with \`margin-top: auto\` on the button so all buttons line up at the bottom.

**Sticky footer:** on short pages the footer should sit at the bottom of the screen, not halfway up. Make the body a column flex (or grid with \`auto 1fr auto\`) of at least 100vh and let \`main\` grow.

**Coming next:** Module 5 – Responsive Design with media queries and mobile-first CSS.`,
      syntax: `body { min-height: 100vh; display: flex; flex-direction: column; }
main { flex: 1; }`,
    },
  ],
  examples: [
    {
      title: 'Five ways to center',
      scenario: 'Compare text-align, margin auto, flexbox, grid and absolute+transform in one demo.',
      steps: [
        'Create five .demo boxes, each 120px tall',
        'Apply a different centering technique to each',
        'Run and confirm every red dot / box is centered as expected',
      ],
      code: `.t  { text-align: center; }
.m .child { width: 80px; margin: 0 auto; }
.f  { display: flex; justify-content: center; align-items: center; }
.g  { display: grid; place-items: center; }
.a  { position: relative; }
.a .child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`,
      playground: {
        html: `<div class="demo t"><span>text-align (horizontal only)</span></div>
<div class="demo m"><div class="child">margin auto</div></div>
<div class="demo f"><div class="child">flexbox</div></div>
<div class="demo g"><div class="child">grid</div></div>
<div class="demo a"><div class="child">absolute</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; display: grid; gap: 10px; }
.demo { height: 90px; background: #f1f5f9; border: 2px dashed #94a3b8; border-radius: 8px; }
.child, .t span { background: #ef4444; color: #fff; padding: 8px; border-radius: 6px; font-size: 13px; }
.t { text-align: center; }
.m .child { width: 100px; margin: 0 auto; text-align: center; }
.f { display: flex; justify-content: center; align-items: center; }
.g { display: grid; place-items: center; }
.a { position: relative; }
.a .child { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); }`,
      },
      result: 'Five dashed boxes. The first two are centered only horizontally; flexbox, grid and absolute are centered both ways.',
      explanation: 'text-align and margin:auto handle horizontal only. Flex, grid and absolute+translate center on both axes.',
    },
    {
      title: 'Holy grail + sticky footer with Grid',
      scenario: 'A complete page skeleton where the footer always sits at the bottom even with little content.',
      steps: [
        'Make body a grid with rows auto 1fr auto and min-height 100vh',
        'Put a .middle grid with areas nav / main / aside in the 1fr row',
        'Run – the footer sticks to the bottom of the preview',
      ],
      code: `body { min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; }
.middle { display: grid; grid-template-columns: 150px 1fr 150px; }`,
      playground: {
        html: `<header>Header</header>
<div class="middle">
  <nav>Nav</nav>
  <main>Main content (short page)</main>
  <aside>Aside</aside>
</div>
<footer>Footer – always at the bottom</footer>`,
        css: `* { box-sizing: border-box; }
body { margin: 0; min-height: 100vh; display: grid; grid-template-rows: auto 1fr auto; font-family: system-ui, sans-serif; }
header, footer { padding: 16px; background: #111827; color: #fff; }
.middle { display: grid; grid-template-columns: 150px 1fr 150px; gap: 8px; padding: 8px; }
nav { background: #fde68a; padding: 12px; }
main { background: #dbeafe; padding: 12px; }
aside { background: #fbcfe8; padding: 12px; }`,
      },
      result: 'Dark header at top, three coloured columns filling the middle, dark footer at the very bottom of the preview.',
      explanation: 'The 1fr middle row absorbs all spare height, pushing the footer down. The inner grid splits the middle into three columns.',
    },
    {
      title: 'Responsive navbar pattern',
      scenario: 'Logo left, links in the middle, CTA button right; wraps gracefully on narrow screens.',
      steps: [
        'Create header with logo, nav links and a button',
        'Use flex with align-items center, gap and flex-wrap',
        'Push the button right with margin-left: auto',
        'Run and resize',
      ],
      code: `.nav { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; }
.nav .cta { margin-left: auto; }`,
      playground: {
        html: `<header class="nav">
  <a class="logo" href="#">◆ Brand</a>
  <a href="#">Features</a>
  <a href="#">Pricing</a>
  <a href="#">Docs</a>
  <a class="cta" href="#">Sign up</a>
</header>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
.nav { display: flex; align-items: center; gap: 24px; flex-wrap: wrap; padding: 14px 24px; border-bottom: 1px solid #e5e7eb; }
.nav a { color: #374151; text-decoration: none; }
.nav .logo { font-weight: 800; font-size: 1.25rem; color: #4f46e5; }
.nav .cta { margin-left: auto; background: #4f46e5; color: #fff; padding: 8px 16px; border-radius: 999px; }`,
      },
      result: 'Brand logo, three links next to it, and a purple "Sign up" pill on the far right.',
      explanation: 'gap spaces items, margin-left: auto on the CTA consumes the remaining space so it sits at the end.',
    },
    {
      title: 'Card grid with aligned buttons',
      scenario: 'Pricing cards with different text lengths, but every "Choose" button is lined up at the bottom.',
      steps: [
        'Make the container a responsive auto-fit grid',
        'Make each card a flex column',
        'Give the button margin-top: auto',
        'Run',
      ],
      code: `.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.card { display: flex; flex-direction: column; }
.card button { margin-top: auto; }`,
      playground: {
        html: `<div class="cards">
  <div class="card"><h3>Free</h3><p>Basic features.</p><button>Choose</button></div>
  <div class="card"><h3>Pro</h3><p>Everything in Free plus analytics, exports, priority support and a custom domain.</p><button>Choose</button></div>
  <div class="card"><h3>Team</h3><p>Collaboration tools for teams.</p><button>Choose</button></div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f8fafc; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; }
.card { display: flex; flex-direction: column; padding: 16px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
.card h3 { margin: 0; }
.card button { margin-top: auto; padding: 10px; border: 0; border-radius: 8px; background: #0ea5e9; color: #fff; font: inherit; }`,
      },
      result: 'Three equal-height cards; all three blue buttons line up at the same bottom edge.',
      explanation: 'Grid rows stretch cards to equal height; the flex column + margin-top: auto pushes each button to the bottom.',
    },
  ],
  interview: [
    { q: 'How do you center a div horizontally and vertically?', a: 'Most concise: parent { display: grid; place-items: center; }. Alternatives: flex with justify-content and align-items center, or absolute positioning with top/left 50% and transform: translate(-50%, -50%).', level: 'Easy' },
    { q: 'Why does margin: 0 auto not center vertically?', a: 'In normal block flow, auto vertical margins resolve to 0. Auto margins only center vertically inside flex/grid containers or absolutely positioned elements with inset set.', level: 'Medium' },
    { q: 'Why is translate(-50%, -50%) needed with top: 50%; left: 50%?', a: 'top/left position the element\'s top-left corner at the centre. translate percentages refer to the element\'s own size, so shifting by -50% moves its centre to the centre point.', level: 'Medium' },
    { q: 'When would you choose Flexbox over Grid?', a: 'For one-dimensional, content-driven layouts like navbars, button groups or aligning items in a row/column. Grid is better for two-dimensional layouts where rows and columns must align.', level: 'Medium' },
    { q: 'What is the holy grail layout?', a: 'A page with header, footer and three columns (left nav, main, right aside) where the main column is fluid and the footer sits at the bottom. Easily built with Grid template areas.', level: 'Medium' },
    { q: 'How do you make a sticky footer?', a: 'Make body at least 100vh tall and a flex column (main { flex: 1 }) or a grid with grid-template-rows: auto 1fr auto.', level: 'Medium' },
    { q: 'How do you center text inside a button?', a: 'text-align: center for horizontal; for vertical use equal padding or display: inline-flex with align-items/justify-content center.', level: 'Easy' },
    { q: 'How do you line up buttons at the bottom of cards of different heights?', a: 'Make each card a flex column and add margin-top: auto to the button. With a grid parent, cards in a row already share equal height.', level: 'Hard' },
    { q: 'Can Grid and Flexbox be combined?', a: 'Yes. A grid item can itself be a flex container (and vice versa). Typical: grid for the page, flex inside the header.', level: 'Easy' },
    { q: 'How do you center a fixed-size modal?', a: 'position: fixed; inset: 0; margin: auto; width: 400px; height: fit-content; or position fixed with top/left 50% and translate(-50%,-50%).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Center a 300×200 modal in the viewport over a semi-transparent overlay.',
      hint: 'Overlay: position fixed, inset 0, display grid, place-items center.',
      solution: `<style>
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.5); display: grid; place-items: center; }
  .modal { width: 300px; height: 200px; background: #fff; border-radius: 12px; padding: 16px; }
</style>
<div class="overlay"><div class="modal">Hello modal</div></div>`,
    },
    {
      task: 'Build a media object: an 80px image on the left and title + text on the right, vertically centered.',
      hint: 'flex + align-items: center + flex-shrink: 0 on the image.',
      solution: `<style>
  .media { display: flex; gap: 12px; align-items: center; }
  .media img { width: 80px; height: 80px; border-radius: 50%; flex-shrink: 0; }
</style>
<div class="media"><img src="https://picsum.photos/seed/m/160" alt=""><div><h4>Jane Doe</h4><p>Frontend developer</p></div></div>`,
    },
    {
      task: 'Create a full-height hero section with a centered heading and button.',
      hint: 'min-height: 100vh; display: grid; place-content: center; text-align: center.',
      solution: `<style>
  .hero { min-height: 100vh; display: grid; place-content: center; text-align: center; gap: 16px; background: #0f172a; color: #fff; }
</style>
<section class="hero"><h1>Build faster</h1><button>Get started</button></section>`,
    },
    {
      task: 'Build a sticky-footer layout using Flexbox instead of Grid.',
      hint: 'body column flex, main flex: 1.',
      solution: `<style>
  body { margin: 0; min-height: 100vh; display: flex; flex-direction: column; }
  main { flex: 1; }
  header, footer { background: #333; color: #fff; padding: 12px; }
</style>
<header>Header</header><main>Short content</main><footer>Footer</footer>`,
    },
  ],
  quiz: [
    { question: 'Which is the shortest way to center a child on both axes?', options: ['margin: auto', 'text-align: center', 'display: grid; place-items: center', 'vertical-align: middle'], answer: 2, explanation: 'Two declarations on the parent center the child both ways.' },
    { question: 'For a page wrapper with max-width, which centers it horizontally?', options: ['margin-inline: auto', 'align-items: center', 'float: center', 'position: center'], answer: 0, explanation: 'Auto inline margins split the leftover space equally.' },
    { question: 'Which layout is best suited to Flexbox?', options: ['A dashboard with aligned rows and columns', 'A horizontal navbar', 'A photo mosaic with spanning tiles', 'A calendar month view'], answer: 1, explanation: 'Navbars are one-dimensional rows.' },
    { question: 'grid-template-rows: auto 1fr auto on a 100vh body is used for…', options: ['A card grid', 'Centering text', 'Equal columns', 'A sticky footer layout'], answer: 3, explanation: 'The 1fr middle row grows, pushing the footer to the bottom.' },
    { question: 'In absolute centering, translate(-50%, -50%) percentages are relative to…', options: ['The parent', 'The element itself', 'The viewport', 'The body font size'], answer: 1, explanation: 'Transform percentages refer to the element\'s own border box.' },
  ],
};
