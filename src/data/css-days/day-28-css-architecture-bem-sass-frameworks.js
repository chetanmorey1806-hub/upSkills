export default {
  id: 'day-28-css-architecture-bem-sass-frameworks',
  title: 'CSS Architecture: BEM, File Organization, Intro to Sass, Tailwind and Bootstrap',
  module: 'Module 7: Professional CSS',
  day: 28,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Real projects have thousands of lines of CSS written by many people. Learn how professionals keep CSS maintainable: the BEM naming convention, a clean folder structure, the Sass preprocessor, and when to reach for Tailwind CSS or Bootstrap.',
  objectives: [
    'Name classes with BEM (block__element--modifier) and explain why it avoids specificity problems',
    'Organise a stylesheet into layers/files (base, layout, components, utilities)',
    'Read and write basic Sass: variables, nesting, partials, mixins and @use',
    'Compare utility-first (Tailwind) and component frameworks (Bootstrap) with hand-written CSS',
  ],
  theory: [
    {
      heading: 'Why CSS architecture matters',
      content: `CSS is global: any rule can affect any element. On small pages that's fine, but on large projects it causes:
- **Naming collisions** – two developers both write \`.title\`
- **Specificity wars** – \`#main .sidebar ul li a\` then \`!important\` to override it
- **Fear of deleting** – nobody knows what a rule still styles
- **Duplication** – the same button styled five ways

CSS architecture is a set of **conventions** that make styles predictable, reusable and safe to change. Popular approaches: BEM, OOCSS, SMACSS, ITCSS, utility-first (Tailwind), CSS Modules / CSS-in-JS (React).

Analogy: a library without a catalogue system still holds books, but no one can find anything. Architecture is the catalogue.`,
    },
    {
      heading: 'BEM: Block, Element, Modifier',
      content: `**BEM** is a naming convention:

- **Block** – a standalone component: \`.card\`, \`.menu\`, \`.btn\`
- **Element** – a part of a block, joined with **two underscores**: \`.card__title\`, \`.card__image\`
- **Modifier** – a variant or state, joined with **two dashes**: \`.card--featured\`, \`.btn--large\`, \`.menu__item--active\`

Benefits:
- Every selector is a **single class** → low, flat specificity (0,1,0), no wars
- The class name tells you **where** it belongs
- Components are independent and portable

Rules: don't nest elements in names (\`.card__body__title\` ✗ → \`.card__title\` ✓). A modifier class is used **together** with the base class: \`class="btn btn--primary"\`.`,
      syntax: `<article class="card card--featured">
  <img class="card__image" src="..." alt="">
  <h3 class="card__title">Title</h3>
  <a class="card__link btn btn--small" href="#">Read</a>
</article>`,
      tip: 'Don\'t style by tag inside a block (.card h3). If the h3 becomes an h2 the style breaks. Use .card__title.',
    },
    {
      heading: 'Organising CSS files',
      content: `A common structure (inspired by ITCSS / 7-1 pattern), ordered from **generic to specific**:

1. \`settings/\` – variables, design tokens (\`--color-primary\`)
2. \`base/\` – reset/normalize, element defaults (\`body\`, \`a\`, \`h1\`)
3. \`layout/\` – page regions: header, footer, grid, container
4. \`components/\` – one file per BEM block: \`_button.scss\`, \`_card.scss\`
5. \`utilities/\` – single-purpose helpers: \`.u-hidden\`, \`.text-center\`
6. \`main.css\` / \`main.scss\` – imports everything in that order

Native CSS can enforce the order with **cascade layers**:
\`@layer reset, base, layout, components, utilities;\`
Rules in later layers win regardless of specificity.`,
      syntax: `styles/
├── settings/_tokens.scss
├── base/_reset.scss
├── base/_typography.scss
├── layout/_header.scss
├── components/_button.scss
├── components/_card.scss
├── utilities/_helpers.scss
└── main.scss`,
    },
    {
      heading: 'Intro to Sass',
      content: `**Sass** (SCSS syntax) is a **preprocessor**: you write \`.scss\` files and a tool compiles them into normal \`.css\` that browsers understand. Install with \`npm install -D sass\` (Vite supports it automatically).

Key features:
- **Variables**: \`$primary: #4f46e5;\` (compile-time, unlike CSS variables)
- **Nesting**: write child rules inside parents; \`&\` refers to the parent selector – perfect with BEM: \`&__title\`, \`&--featured\`
- **Partials & @use**: split into \`_card.scss\` files and \`@use 'components/card';\`
- **Mixins**: reusable chunks with parameters (\`@mixin\` / \`@include\`)
- **Functions & maths**: \`darken()\`, \`color.adjust()\`, loops (\`@each\`, \`@for\`)

Modern CSS now has custom properties and native nesting, so Sass is less essential than before – but it's still widely used.`,
      syntax: `$primary: #4f46e5;

@mixin flex-center { display: flex; justify-content: center; align-items: center; }

.card {
  padding: 16px;
  &__title { color: $primary; }
  &--featured { border: 2px solid $primary; }
  &:hover { box-shadow: 0 4px 12px rgba(0,0,0,.1); }
  .icon { @include flex-center; }
}`,
      tip: 'Avoid nesting more than 3 levels deep in Sass – it produces long, high-specificity selectors.',
    },
    {
      heading: 'Tailwind CSS and Bootstrap',
      content: `**Bootstrap** – a **component framework**. You get ready-made classes like \`.btn .btn-primary\`, \`.card\`, \`.navbar\`, a 12-column grid (\`.row\`, \`.col-md-6\`) and JS components (modals, dropdowns). Fast for prototypes and admin panels, but sites can look "Bootstrap-y" and you ship CSS you don't use.

**Tailwind CSS** – a **utility-first framework**. Each class does one thing: \`p-4\` (padding 1rem), \`bg-indigo-600\`, \`rounded-lg\`, \`flex\`, \`md:grid-cols-3\` (responsive), \`hover:bg-indigo-700\`. You compose designs in HTML; a build step removes unused classes so the final CSS is tiny.

Comparison:
- **Hand-written CSS + BEM** – full control, semantic class names, more CSS to write
- **Bootstrap** – fastest for standard UIs, harder to customise deeply
- **Tailwind** – very fast once learned, consistent design system, long class lists in HTML

All three still require you to understand **real CSS** (flex, grid, box model) – frameworks are shortcuts, not replacements.

**Coming next:** Day 29 – modern CSS: :has(), :is()/:where(), container queries and native nesting.`,
      syntax: `<!-- Bootstrap -->
<button class="btn btn-primary btn-lg">Save</button>

<!-- Tailwind -->
<button class="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Save</button>`,
    },
  ],
  examples: [
    {
      title: 'A BEM card component with modifiers',
      scenario: 'Build a reusable product card with a featured variant and button sizes – all with flat single-class selectors.',
      steps: [
        'Write HTML using block, block__element and block--modifier classes',
        'Style each class once with a single-class selector',
        'Create a second card with card--featured',
        'Run and compare the two cards',
      ],
      code: `.card { ... }
.card__image { ... }
.card__title { ... }
.card--featured { border-color: #f59e0b; }
.card--featured .card__badge { display: inline-block; }
.btn { ... }  .btn--primary { ... }  .btn--small { ... }`,
      playground: {
        html: `<div class="grid">
  <article class="card">
    <img class="card__image" src="https://picsum.photos/seed/bem1/400/240" alt="">
    <div class="card__body">
      <span class="card__badge">Featured</span>
      <h3 class="card__title">Basic Headphones</h3>
      <p class="card__price">₹1,499</p>
      <a class="btn btn--small" href="#">Details</a>
    </div>
  </article>
  <article class="card card--featured">
    <img class="card__image" src="https://picsum.photos/seed/bem2/400/240" alt="">
    <div class="card__body">
      <span class="card__badge">Featured</span>
      <h3 class="card__title">Pro Headphones</h3>
      <p class="card__price">₹4,999</p>
      <a class="btn btn--primary btn--small" href="#">Buy now</a>
    </div>
  </article>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f8fafc; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; }

/* Block */
.card { background: #fff; border: 2px solid #e2e8f0; border-radius: 12px; overflow: hidden; }
/* Elements */
.card__image { display: block; width: 100%; aspect-ratio: 5 / 3; object-fit: cover; }
.card__body { padding: 14px; }
.card__badge { display: none; font-size: 12px; font-weight: 700; color: #92400e; background: #fde68a; padding: 2px 8px; border-radius: 999px; }
.card__title { margin: 8px 0 4px; font-size: 1.1rem; }
.card__price { margin: 0 0 12px; color: #475569; }
/* Modifier */
.card--featured { border-color: #f59e0b; box-shadow: 0 8px 24px rgb(245 158 11 / .25); }
.card--featured .card__badge { display: inline-block; }

/* Another block: button */
.btn { display: inline-block; padding: 10px 18px; border-radius: 8px; border: 2px solid #4f46e5; color: #4f46e5; text-decoration: none; font-weight: 600; }
.btn--primary { background: #4f46e5; color: #fff; }
.btn--small { padding: 6px 12px; font-size: 14px; }`,
      },
      result: 'Two product cards; the second has an orange border, glow, a "Featured" badge and a solid purple button, while the first has an outline button.',
      explanation: 'Every selector is one class (except the deliberate modifier-to-element rule), so specificity stays low and predictable. Adding the --featured modifier changes the look without touching the base styles.',
    },
    {
      title: 'Sass source vs compiled CSS',
      scenario: 'Understand what a Sass file with variables, nesting and a mixin compiles to. The playground runs the compiled CSS.',
      steps: [
        'Read the SCSS in the code panel',
        'Note how &__title and &--dark expand to BEM class names',
        'Look at the compiled CSS in the playground – that is what the browser receives',
        'Run',
      ],
      code: `// _alert.scss
$radius: 8px;
$info: #0284c7;

@mixin tone($color) {
  border-left: 6px solid $color;
  color: $color;
}

.alert {
  padding: 12px 16px;
  border-radius: $radius;
  background: #f0f9ff;
  @include tone($info);

  &__title { font-weight: 700; margin: 0 0 4px; }
  &--dark  { background: #0c4a6e; color: #fff; }
}`,
      playground: {
        html: `<div class="alert">
  <p class="alert__title">Info</p>
  <p>Compiled from Sass – browsers only understand this plain CSS.</p>
</div>
<br>
<div class="alert alert--dark">
  <p class="alert__title">Dark variant</p>
  <p>Generated by the &amp;--dark rule.</p>
</div>`,
        css: `/* ===== Compiled output of _alert.scss ===== */
body { font-family: system-ui, sans-serif; padding: 16px; }
.alert {
  padding: 12px 16px;
  border-radius: 8px;
  background: #f0f9ff;
  border-left: 6px solid #0284c7;
  color: #0284c7;
}
.alert__title { font-weight: 700; margin: 0 0 4px; }
.alert--dark { background: #0c4a6e; color: #fff; }
.alert p { margin: 0; }`,
      },
      result: 'A light-blue info alert and a dark-blue variant, both with a thick left border.',
      explanation: 'Sass replaced $variables with values, inlined the mixin\'s declarations, and expanded & into the parent selector, producing flat BEM classes.',
    },
    {
      title: 'Utility-first approach (Tailwind-style) in plain CSS',
      scenario: 'See how utility classes compose a design directly in HTML – the same idea Tailwind generates for you automatically.',
      steps: [
        'Write a handful of single-purpose utility classes (p-4, flex, gap-3, rounded-lg…)',
        'Build a profile card using only these classes in HTML',
        'Run, then try changing a class like bg-indigo to bg-emerald',
      ],
      code: `<div class="flex items-center gap-3 p-4 bg-white rounded-lg shadow">
  <img class="w-12 h-12 rounded-full" ...>
  <div><p class="font-bold">Priya Sharma</p><p class="text-sm text-gray">Frontend Dev</p></div>
  <button class="ml-auto px-4 py-2 bg-indigo text-white rounded-lg">Follow</button>
</div>`,
      playground: {
        html: `<div class="flex items-center gap-3 p-4 bg-white rounded-lg shadow">
  <img class="w-12 h-12 rounded-full" src="https://picsum.photos/seed/user7/100/100" alt="Priya">
  <div>
    <p class="m-0 font-bold">Priya Sharma</p>
    <p class="m-0 text-sm text-gray">Frontend Developer</p>
  </div>
  <button class="ml-auto px-4 py-2 bg-indigo text-white rounded-lg">Follow</button>
</div>`,
        css: `/* A tiny hand-made subset of Tailwind-like utilities */
body { font-family: system-ui, sans-serif; padding: 24px; background: #f1f5f9; }
.flex { display: flex; } .items-center { align-items: center; } .gap-3 { gap: .75rem; }
.p-4 { padding: 1rem; } .px-4 { padding-inline: 1rem; } .py-2 { padding-block: .5rem; }
.m-0 { margin: 0; } .ml-auto { margin-left: auto; }
.w-12 { width: 3rem; } .h-12 { height: 3rem; }
.rounded-lg { border-radius: .5rem; } .rounded-full { border-radius: 9999px; }
.bg-white { background: #fff; } .bg-indigo { background: #4f46e5; } .bg-emerald { background: #059669; }
.text-white { color: #fff; } .text-gray { color: #64748b; } .text-sm { font-size: .875rem; }
.font-bold { font-weight: 700; }
.shadow { box-shadow: 0 1px 3px rgb(0 0 0 / .1), 0 4px 12px rgb(0 0 0 / .06); }
button { border: 0; font: inherit; cursor: pointer; }`,
      },
      result: 'A white profile row with a round avatar, name, job title and a purple "Follow" button on the right – styled entirely by utility classes.',
      explanation: 'Each class does exactly one thing. Tailwind ships hundreds of these (plus responsive and hover variants) and removes unused ones at build time.',
    },
    {
      title: 'Organising styles with cascade layers',
      scenario: 'Show how @layer makes the utilities layer win over components even with lower specificity.',
      steps: [
        'Declare layer order: reset, base, components, utilities',
        'Write a component rule with higher specificity',
        'Write a utility rule with lower specificity in a later layer',
        'Run – the utility still wins',
      ],
      code: `@layer reset, base, components, utilities;
@layer components { .card .title { color: crimson; } }
@layer utilities  { .text-teal { color: teal; } }`,
      playground: {
        html: `<div class="card">
  <h2 class="title">Component colour (crimson)</h2>
  <h2 class="title text-teal">Utility wins (teal)</h2>
</div>`,
        css: `@layer reset, base, components, utilities;

@layer reset { * { box-sizing: border-box; } h2 { margin: 0 0 8px; } }
@layer base { body { font-family: system-ui, sans-serif; padding: 20px; } }
@layer components {
  .card { padding: 16px; border: 1px solid #ddd; border-radius: 10px; }
  .card .title { color: crimson; } /* specificity 0,2,0 */
}
@layer utilities {
  .text-teal { color: teal; }      /* specificity 0,1,0 but later layer */
}`,
      },
      result: 'The first heading is crimson; the second is teal, even though the utility selector is less specific.',
      explanation: 'With cascade layers, layer order is checked before specificity. Utilities are declared last, so they override components.',
    },
  ],
  interview: [
    { q: 'What is BEM?', a: 'Block Element Modifier – a CSS class naming convention: .block, .block__element, .block--modifier. It keeps specificity flat and makes component relationships obvious.', level: 'Easy' },
    { q: 'Why does BEM avoid specificity problems?', a: 'Almost every rule is a single class selector (0,1,0), so no rule accidentally overpowers another and source order decides; there is no need for IDs, deep nesting or !important.', level: 'Medium' },
    { q: 'Is .card__body__title valid BEM?', a: 'It is discouraged. Elements belong to the block, not to other elements, so it should be .card__title regardless of DOM nesting.', level: 'Medium' },
    { q: 'What is a CSS preprocessor?', a: 'A tool that extends CSS with features like variables, nesting, mixins and functions, then compiles to plain CSS. Examples: Sass/SCSS, Less, Stylus.', level: 'Easy' },
    { q: 'Difference between Sass variables and CSS custom properties?', a: 'Sass variables ($x) are replaced at compile time and cannot change at runtime. CSS custom properties (--x) live in the browser, cascade, and can change with media queries or JavaScript.', level: 'Medium' },
    { q: 'What is a Sass mixin?', a: 'A reusable block of declarations defined with @mixin (optionally with parameters) and inserted with @include.', level: 'Easy' },
    { q: 'What is the difference between @use and @import in Sass?', a: '@use loads a module once, namespaces its members and is the modern recommended way; @import is deprecated because it dumps everything into global scope and can duplicate CSS.', level: 'Hard' },
    { q: 'What is utility-first CSS?', a: 'An approach where you style elements by composing many small single-purpose classes (e.g. p-4, flex, text-center) in HTML instead of writing custom component CSS. Tailwind is the best-known example.', level: 'Easy' },
    { q: 'Tailwind vs Bootstrap?', a: 'Bootstrap provides pre-built components (buttons, navbars, modals) with a default look. Tailwind provides low-level utilities to build any design; it has no pre-styled components and purges unused CSS for tiny bundles.', level: 'Medium' },
    { q: 'What are cascade layers (@layer)?', a: 'A native CSS feature that groups rules into ordered layers; later layers win over earlier ones regardless of selector specificity, making it easy to keep resets, components and utilities in a predictable order.', level: 'Hard' },
    { q: 'How would you organise CSS for a large project?', a: 'Settings/tokens → base/reset → layout → components (one file per component, BEM) → utilities; compile/import in that order, optionally with @layer, and follow a naming convention and linting (Stylelint).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Rewrite this markup with BEM: <div class="nav"><ul><li class="active"><a>Home</a></li></ul></div>.',
      hint: 'Block .nav, elements .nav__list, .nav__item, .nav__link, modifier .nav__item--active.',
      solution: `<nav class="nav">
  <ul class="nav__list">
    <li class="nav__item nav__item--active"><a class="nav__link" href="#">Home</a></li>
    <li class="nav__item"><a class="nav__link" href="#">About</a></li>
  </ul>
</nav>
<style>
  .nav__list { display: flex; gap: 16px; list-style: none; }
  .nav__link { text-decoration: none; color: #333; }
  .nav__item--active .nav__link { color: #4f46e5; font-weight: 700; }
</style>`,
    },
    {
      task: 'Write an SCSS button block with $primary variable, &--outline and &--large modifiers and a hover state.',
      hint: 'Use & for modifiers and :hover.',
      solution: `$primary: #2563eb;
.button {
  padding: 8px 16px;
  background: $primary;
  color: #fff;
  border: 2px solid $primary;
  &:hover { filter: brightness(1.1); }
  &--outline { background: transparent; color: $primary; }
  &--large { padding: 14px 28px; font-size: 1.125rem; }
}`,
    },
    {
      task: 'Create a Sass mixin "respond($bp)" that wraps content in a min-width media query, and use it on .grid.',
      hint: '@mixin respond($bp) { @media (min-width: $bp) { @content; } }',
      solution: `@mixin respond($bp) {
  @media (min-width: $bp) { @content; }
}
.grid {
  display: grid;
  @include respond(768px) { grid-template-columns: 1fr 1fr; }
}`,
    },
    {
      task: 'Write the folder structure and main.scss for a site with tokens, reset, header, footer, button and card.',
      hint: 'Use @use in generic-to-specific order.',
      solution: `// styles/main.scss
@use 'settings/tokens';
@use 'base/reset';
@use 'base/typography';
@use 'layout/header';
@use 'layout/footer';
@use 'components/button';
@use 'components/card';
@use 'utilities/helpers';`,
    },
  ],
  quiz: [
    { question: 'In BEM, what does .menu__item--active represent?', options: ['A block', 'An element with a modifier', 'A modifier of the block', 'A utility class'], answer: 1, explanation: 'menu = block, __item = element, --active = modifier on that element.' },
    { question: 'Sass files must be ___ before the browser can use them.', options: ['minified', 'compiled to CSS', 'renamed to .js', 'uploaded to a CDN'], answer: 1, explanation: 'Browsers only understand CSS; Sass is compiled.' },
    { question: 'Which framework is utility-first?', options: ['Bootstrap', 'Foundation', 'Tailwind CSS', 'Bulma'], answer: 2, explanation: 'Tailwind is built entirely from single-purpose utility classes.' },
    { question: 'In SCSS, what does & refer to?', options: ['The parent selector', 'The root element', 'A variable', 'The body tag'], answer: 0, explanation: '& inserts the parent selector, e.g. &__title → .card__title.' },
    { question: 'With @layer base, utilities; which wins for conflicting rules?', options: ['base, always', 'Whichever has higher specificity', 'The first one in the file', 'utilities, because it is the later layer'], answer: 3, explanation: 'Layer order beats specificity; later layers win.' },
  ],
};
