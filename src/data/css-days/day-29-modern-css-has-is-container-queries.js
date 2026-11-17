export default {
  id: 'day-29-modern-css-has-is-container-queries',
  title: 'Modern CSS: :has(), :is()/:where(), Container Queries, Nesting, Best Practices and Performance',
  module: 'Module 7: Professional CSS',
  day: 29,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'CSS has evolved fast. Learn the modern features now supported in all major browsers – the :has() "parent selector", :is() and :where() for shorter selectors, container queries for truly reusable components, native nesting – plus best practices for clean, fast CSS.',
  objectives: [
    'Select parents and previous elements with :has()',
    'Shorten selector lists with :is() and control specificity with :where()',
    'Make components respond to their container size with container-type and @container',
    'Write native CSS nesting and apply performance/best-practice guidelines',
  ],
  theory: [
    {
      heading: ':has() – the "parent selector"',
      content: `For 20 years developers asked: "Can I style a parent based on its children?" Now you can with **:has()**.

\`A:has(B)\` matches **A** if it contains something matching **B** (B is a relative selector).

Examples:
- \`.card:has(img)\` – cards that contain an image
- \`form:has(:invalid)\` – a form with any invalid field
- \`label:has(+ input:focus)\` – a label whose **next sibling** input is focused (selecting a previous sibling!)
- \`body:has(dialog[open])\` – lock scrolling when a modal is open
- \`li:has(input:checked)\` – highlight a checked to-do item

Analogy: :has() lets you look **down or forward** from an element and decide its style based on what you find.`,
      syntax: `.field:has(input:invalid) { border-color: crimson; }
.card:has(.badge) { padding-top: 32px; }`,
      tip: 'Avoid very broad :has() rules like *:has(*) – they can be slow because the browser re-checks ancestors on every DOM change.',
    },
    {
      heading: ':is() and :where()',
      content: `Both take a **selector list** and match if any of them match – they make long selectors short:

\`:is(header, main, footer) a:hover { ... }\`
= \`header a:hover, main a:hover, footer a:hover { ... }\`

The difference is **specificity**:
- \`:is()\` takes the specificity of its **most specific** argument (\`:is(#id, .a)\` = ID level!)
- \`:where()\` always has **zero** specificity

Use **:where()** for resets and library defaults that should be easy to override; use **:is()** for normal grouping.

Bonus: an invalid selector inside :is()/:where() is ignored instead of breaking the whole rule (forgiving selector list).`,
      syntax: `:where(ul, ol)[class] { list-style: none; padding: 0; } /* easy to override */
article :is(h1, h2, h3) { line-height: 1.2; }`,
    },
    {
      heading: 'Container queries',
      content: `Media queries ask: "How wide is the **viewport**?" But a card may sit in a wide main column **or** a narrow sidebar on the same screen. **Container queries** ask: "How wide is **my container**?"

Steps:
1. Mark the parent as a container: \`container-type: inline-size;\` (optionally \`container-name: card;\`)
2. Write \`@container (min-width: 400px) { ... }\` rules for the children

Container query units: \`cqw\` (1% of container width), \`cqh\`, \`cqi\`, \`cqmin\` – great for fluid text inside a component.

This makes components **truly reusable** – they adapt wherever you drop them.`,
      syntax: `.card-wrap { container-type: inline-size; container-name: card; }

@container card (min-width: 400px) {
  .card { display: grid; grid-template-columns: 150px 1fr; }
}`,
      tip: 'An element cannot query itself – the container must be an ancestor of the elements you style.',
    },
    {
      heading: 'Native CSS nesting',
      content: `Like Sass, but built into the browser (supported in all modern browsers since 2023):

- Nest rules inside a parent
- \`&\` refers to the parent selector: \`&:hover\`, \`&.active\`, \`.dark &\`
- Nest media and container queries directly inside a rule
- A nested selector without \`&\` is treated as a descendant (\`.card { p { } }\` = \`.card p\`)

Difference from Sass: native nesting **cannot** concatenate strings, so \`&__title\` (BEM) does **not** work in plain CSS – write \`.card__title\` separately.`,
      syntax: `.btn {
  padding: 8px 16px;
  &:hover { background: #4338ca; }
  &.btn--ghost { background: transparent; }
  .icon { margin-right: 6px; }
  @media (min-width: 768px) { padding: 12px 24px; }
}`,
    },
    {
      heading: 'Best practices and performance',
      content: `**Writing clean CSS**
- Use a consistent naming convention (BEM) and design tokens (CSS variables)
- Keep specificity low; avoid IDs and \`!important\` in styles
- Mobile-first, use relative units (rem, %, fr), logical properties (\`margin-inline\`, \`padding-block\`)
- Always keep visible \`:focus-visible\` styles for keyboard users; check colour contrast
- Lint with **Stylelint**, format with **Prettier**

**Performance**
- Animate only \`transform\` and \`opacity\`
- Minify and compress CSS; remove unused CSS (PurgeCSS / Tailwind)
- Inline **critical CSS** for above-the-fold content, load the rest normally
- Avoid \`@import\` in plain CSS (it blocks parallel downloads) – use \`<link>\` or a bundler
- Use \`font-display: swap\` for web fonts, and set image width/height or aspect-ratio to prevent layout shift (CLS)
- \`content-visibility: auto\` lets the browser skip rendering off-screen sections

**Coming next:** Day 30 – build a complete responsive website and take the final test.`,
    },
  ],
  examples: [
    {
      title: ':has() – style parents from their children',
      scenario: 'A to-do list where checked items are struck through, a form field that turns red when its input is invalid, and cards that change layout if they contain an image.',
      steps: [
        'Create a list with checkboxes; style li:has(input:checked)',
        'Create a .field with an email input; style .field:has(input:invalid)',
        'Create two cards, one with an image; style .card:has(img)',
        'Run, tick boxes and type an invalid email',
      ],
      code: `li:has(input:checked) { text-decoration: line-through; opacity: .6; }
.field:has(input:invalid) { border-color: #dc2626; }
.card:has(img) { display: grid; grid-template-columns: 80px 1fr; }`,
      playground: {
        html: `<h3>To-do</h3>
<ul class="todo">
  <li><label><input type="checkbox"> Learn :has()</label></li>
  <li><label><input type="checkbox" checked> Learn Grid</label></li>
  <li><label><input type="checkbox"> Build project</label></li>
</ul>

<div class="field"><label>Email <input type="email" placeholder="type an invalid email"></label></div>

<div class="card"><p>Card without image</p></div>
<div class="card"><img src="https://picsum.photos/seed/has/160/160" alt=""><p>Card with image → grid layout</p></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.todo { list-style: none; padding: 0; }
.todo li { padding: 8px 12px; margin-bottom: 6px; background: #f1f5f9; border-radius: 6px; transition: .2s; }
.todo li:has(input:checked) { text-decoration: line-through; opacity: .55; background: #dcfce7; }

.field { padding: 12px; border: 2px solid #cbd5e1; border-radius: 8px; margin: 16px 0; }
.field input { margin-left: 8px; padding: 6px; }
.field:has(input:invalid) { border-color: #dc2626; background: #fef2f2; }
.field:has(input:focus) { box-shadow: 0 0 0 3px rgb(59 130 246 / .3); }

.card { padding: 12px; border: 1px solid #e2e8f0; border-radius: 10px; margin-bottom: 10px; }
.card:has(img) { display: grid; grid-template-columns: 80px 1fr; gap: 12px; align-items: center; background: #eef2ff; }
.card img { width: 80px; border-radius: 8px; }`,
      },
      result: 'Ticking a box strikes through and greens its row; typing an invalid email turns the field box red; the card with an image becomes a two-column layout.',
      explanation: 'Each rule styles an ancestor (li, .field, .card) based on a descendant\'s state or existence – impossible without :has() or JavaScript before.',
    },
    {
      title: 'Container queries: one card, two layouts',
      scenario: 'The same card component is placed in a narrow sidebar and a wide main area; it adapts to each container, not the viewport.',
      steps: [
        'Wrap each card location in an element with container-type: inline-size',
        'Write a base stacked card style',
        'Add @container (min-width: 380px) to switch to a horizontal layout',
        'Run – both cards are on the same screen but look different',
      ],
      code: `.slot { container-type: inline-size; }
@container (min-width: 380px) {
  .card { grid-template-columns: 140px 1fr; }
  .card h3 { font-size: 1.4rem; }
}`,
      playground: {
        html: `<div class="layout">
  <aside class="slot">
    <article class="card">
      <img src="https://picsum.photos/seed/cq/300/200" alt="">
      <div><h3>Sidebar card</h3><p>Narrow container → stacked.</p></div>
    </article>
  </aside>
  <main class="slot">
    <article class="card">
      <img src="https://picsum.photos/seed/cq/300/200" alt="">
      <div><h3>Main card</h3><p>Wide container → side by side. Same HTML and CSS!</p></div>
    </article>
  </main>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; background: #f8fafc; }
.layout { display: grid; grid-template-columns: 200px 1fr; gap: 16px; align-items: start; }
.slot { container-type: inline-size; }
.card { display: grid; gap: 10px; padding: 12px; background: #fff; border: 1px solid #e2e8f0; border-radius: 12px; }
.card img { width: 100%; aspect-ratio: 3 / 2; object-fit: cover; border-radius: 8px; display: block; }
.card h3 { margin: 0; font-size: 1rem; }
.card p { margin: 4px 0 0; color: #64748b; font-size: 14px; }
@container (min-width: 380px) {
  .card { grid-template-columns: 140px 1fr; align-items: center; }
  .card h3 { font-size: 1.4rem; color: #4f46e5; }
}`,
      },
      result: 'In the 200px sidebar the card is stacked (image on top); in the wide main area the same card shows the image beside the text with a bigger purple title.',
      explanation: 'Each .slot is a query container. The @container rule checks the width of the nearest container, so the component adapts to wherever it is placed.',
    },
    {
      title: ':is() vs :where() specificity',
      scenario: 'Prove that :where() has zero specificity and is easy to override, while :is() takes its strongest argument.',
      steps: [
        'Style links inside :is(#hero, .box) red',
        'Style links inside :where(#hero, .box) green',
        'Override both with a simple .box a { color: blue }',
        'Run and see which override succeeds',
      ],
      code: `:is(#a, .box-is) a  { color: red; }    /* specificity 1,0,1 */
:where(#b, .box-where) a { color: green; } /* specificity 0,0,1 */
.box-is a, .box-where a { color: blue; }    /* 0,1,1 */`,
      playground: {
        html: `<div class="box-is"><a href="#">Inside :is() – override FAILS (stays red)</a></div>
<div class="box-where"><a href="#">Inside :where() – override WORKS (blue)</a></div>
<hr>
<nav><a href="#">nav link</a></nav>
<footer><a href="#">footer link</a></footer>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; line-height: 2; }
:is(#a, .box-is) a { color: red; }
:where(#b, .box-where) a { color: green; }
.box-is a, .box-where a { color: blue; font-weight: 700; }

/* :is() for short grouping */
:is(nav, footer) a { color: #9333ea; text-transform: uppercase; }`,
      },
      result: 'The first link stays red (the :is() rule has ID specificity), the second is blue (overridden), and the nav/footer links are purple uppercase.',
      explanation: ':is(#a, .box-is) counts as an ID even though .box-is matched, so a class-level override loses. :where() contributes 0, so any later rule wins.',
    },
    {
      title: 'Native CSS nesting',
      scenario: 'Write a button and a card with nested hover, modifiers and an inline media query – no Sass needed.',
      steps: [
        'Write .btn with nested &:hover, &.ghost and a nested .icon rule',
        'Write .panel with a nested media query',
        'Run and hover the buttons',
      ],
      code: `.btn {
  background: #0f766e;
  &:hover { background: #115e59; }
  &.ghost { background: transparent; color: #0f766e; }
  .icon { margin-right: 6px; }
}`,
      playground: {
        html: `<div class="panel">
  <h3>Native nesting</h3>
  <button class="btn"><span class="icon">✔</span>Save</button>
  <button class="btn ghost"><span class="icon">✖</span>Cancel</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.panel {
  padding: 16px;
  border: 1px solid #ccfbf1;
  border-radius: 12px;
  background: #f0fdfa;
  h3 { margin-top: 0; color: #0f766e; }
  @media (min-width: 500px) { padding: 32px; }
}
.btn {
  padding: 10px 18px;
  border: 2px solid #0f766e;
  border-radius: 8px;
  background: #0f766e;
  color: #fff;
  font: inherit;
  cursor: pointer;
  transition: background .2s;
  &:hover { background: #115e59; }
  &.ghost {
    background: transparent;
    color: #0f766e;
    &:hover { background: #ccfbf1; }
  }
  .icon { margin-right: 6px; }
}`,
      },
      result: 'A mint panel with a solid teal Save button and an outline Cancel button; both change colour on hover; the panel gets more padding on wider screens.',
      explanation: '& refers to the parent selector. Nested selectors without & become descendants. Media queries can be nested directly inside the rule they affect.',
    },
  ],
  interview: [
    { q: 'What does :has() do?', a: 'It is a relational pseudo-class: A:has(B) matches A if B (a relative selector) matches relative to A – e.g. a descendant or following sibling. It enables parent and previous-sibling selection.', level: 'Easy' },
    { q: 'How can :has() select a previous sibling?', a: 'Using a sibling combinator inside it: h2:has(+ p) selects an h2 immediately followed by a p.', level: 'Medium' },
    { q: 'Difference between :is() and :where()?', a: 'Both match any selector in their list. :is() takes the specificity of its most specific argument; :where() always has zero specificity.', level: 'Medium' },
    { q: 'When would you use :where()?', a: 'For resets, base styles or library defaults that consumers should be able to override easily with any selector.', level: 'Medium' },
    { q: 'What are container queries and why are they useful?', a: 'They apply styles based on the size of an ancestor container (declared with container-type) instead of the viewport, making components adapt wherever they are placed.', level: 'Medium' },
    { q: 'What does container-type: inline-size mean?', a: 'It makes the element a query container for its inline (width in horizontal writing) dimension, enabling @container width queries for its descendants.', level: 'Hard' },
    { q: 'Can an element query its own size with @container?', a: 'No. Container queries style descendants of the container, not the container itself.', level: 'Hard' },
    { q: 'Native CSS nesting vs Sass nesting?', a: 'Both support nested rules and &. Native nesting runs in the browser without compilation but cannot concatenate selectors (&__title doesn\'t work); Sass can.', level: 'Medium' },
    { q: 'Name some ways to improve CSS performance.', a: 'Minify and remove unused CSS, inline critical CSS, avoid @import chains, animate only transform/opacity, reserve image space to avoid layout shift, use font-display: swap, and content-visibility: auto for long pages.', level: 'Medium' },
    { q: 'What are logical properties?', a: 'Direction-agnostic properties like margin-inline, padding-block, inset-inline-start that adapt to writing mode/direction instead of physical left/right/top/bottom.', level: 'Medium' },
    { q: 'Why avoid @import in plain CSS files?', a: 'Imported stylesheets are discovered only after the parent is downloaded and parsed, creating sequential, render-blocking requests.', level: 'Hard' },
    { q: 'What is critical CSS?', a: 'The minimal CSS needed to render above-the-fold content, inlined in the <head> so the first paint is fast while the rest of the CSS loads.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Highlight a pricing card in a list when its radio button is selected using :has().',
      hint: '.plan:has(input:checked) { border-color: ... }',
      solution: `<style>
  .plan { display: block; padding: 12px; margin: 6px 0; border: 2px solid #ddd; border-radius: 8px; cursor: pointer; }
  .plan:has(input:checked) { border-color: #4f46e5; background: #eef2ff; }
</style>
<label class="plan"><input type="radio" name="p"> Basic</label>
<label class="plan"><input type="radio" name="p"> Pro</label>`,
    },
    {
      task: 'Use :is() to give all headings h1–h4 inside article and section the same font family in one rule.',
      hint: ':is(article, section) :is(h1, h2, h3, h4)',
      solution: `<style>
  :is(article, section) :is(h1, h2, h3, h4) { font-family: Georgia, serif; }
</style>`,
    },
    {
      task: 'Build a product tile that shows a compact single column under 300px container width and a two-column layout above it, using container queries.',
      hint: 'Wrapper: container-type: inline-size; @container (min-width: 300px).',
      solution: `<style>
  .tile-wrap { container-type: inline-size; }
  .tile { display: grid; gap: 8px; }
  @container (min-width: 300px) { .tile { grid-template-columns: 1fr 2fr; } }
</style>
<div class="tile-wrap" style="width: 50%"><div class="tile"><img src="https://picsum.photos/seed/x/200" alt="" style="width:100%"><p>Product info</p></div></div>`,
    },
    {
      task: 'Rewrite this with native nesting: .nav {} .nav a {} .nav a:hover {} .nav.dark {}',
      hint: 'Use & for :hover and .dark.',
      solution: `.nav {
  display: flex;
  a {
    color: #333;
    &:hover { color: #4f46e5; }
  }
  &.dark { background: #111; }
}`,
    },
  ],
  quiz: [
    { question: 'Which selector styles a .card only if it contains an <img>?', options: ['.card > img', '.card:has(img)', 'img < .card', '.card:is(img)'], answer: 1, explanation: ':has(img) matches the card when an img is inside it.' },
    { question: 'What is the specificity of :where(#id, .class)?', options: ['0,0,0', '1,0,0', '0,1,0', '1,1,0'], answer: 0, explanation: ':where() always contributes zero specificity.' },
    { question: 'Which property enables an element as a size query container?', options: ['display: container', 'container-query: on', 'container-type: inline-size', 'contain: layout'], answer: 2, explanation: 'container-type: inline-size (or size) creates a query container.' },
    { question: 'In native CSS nesting, what does & represent?', options: ['The html element', 'A variable', 'Any child', 'The parent selector'], answer: 3, explanation: '& refers to the enclosing rule\'s selector.' },
    { question: 'Which practice helps CSS performance?', options: ['Animating top/left instead of transform', 'Chaining many @import rules', 'Removing unused CSS and minifying', 'Using !important everywhere'], answer: 2, explanation: 'Smaller CSS downloads and parses faster.' },
  ],
};
