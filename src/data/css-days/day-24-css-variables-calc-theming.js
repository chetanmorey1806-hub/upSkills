export default {
  id: 'day-24-css-variables-calc-theming',
  title: 'CSS Variables (Custom Properties) and calc(), Theming / Dark Mode',
  module: 'Module 5: Responsive Design',
  day: 24,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'CSS custom properties let you store values like colours and spacing once and reuse them everywhere; calc() lets you do maths with mixed units. Together they power design systems, responsive spacing and light/dark themes.',
  objectives: [
    'Declare custom properties with --name and read them with var(), including fallbacks',
    'Understand scope and inheritance of variables (:root vs component level)',
    'Use calc() to combine units and compute sizes from variables',
    'Build a light/dark theme using variables, prefers-color-scheme and a data-theme attribute',
  ],
  theory: [
    {
      heading: 'What are CSS custom properties?',
      content: `A **custom property** (commonly called a CSS variable) is a property whose name starts with two dashes. You set it once and read it with \`var()\`.

Why use them?
- **Single source of truth** – change the brand colour in one place
- **Readable** – \`var(--color-primary)\` explains intent better than \`#4f46e5\`
- **Dynamic** – unlike Sass variables, they live in the browser, can change in media queries and can be updated by JavaScript at runtime

Analogy: variables are like labelled jars in a kitchen. Recipes say "add a spoon from the SUGAR jar" – change what's in the jar and every recipe changes.`,
      syntax: `:root {
  --color-primary: #4f46e5;
  --radius: 8px;
  --space: 16px;
}
.button {
  background: var(--color-primary);
  border-radius: var(--radius);
  padding: var(--space);
}`,
      tip: 'Names are case-sensitive: --Main and --main are different variables.',
    },
    {
      heading: 'Scope, inheritance and fallbacks',
      content: `Custom properties **inherit** like \`color\` does. Where you declare them decides who can see them:

- On \`:root\` (the \`<html>\` element) → global, every element can use it
- On \`.card\` → only \`.card\` and its descendants see it; you can **override** a global variable locally

\`var(--name, fallback)\` – the fallback is used if the variable isn't defined:
\`color: var(--text, #111);\`

If a variable holds an invalid value for the property (e.g. \`--size: red\` used in \`width\`), the property becomes **invalid at computed-value time** and falls back to its inherited/initial value – not to the previous declaration.`,
      syntax: `.card { --card-bg: white; background: var(--card-bg); }
.card.highlight { --card-bg: #fef3c7; } /* just change the variable */`,
    },
    {
      heading: 'calc(): maths in CSS',
      content: `\`calc()\` performs \`+ - * /\` with **mixed units**, computed by the browser:

- \`width: calc(100% - 250px);\` – fill the space next to a 250px sidebar
- \`height: calc(100vh - 64px);\` – full height minus a header
- \`padding: calc(var(--space) * 2);\` – scale a variable
- \`font-size: calc(1rem + 0.5vw);\`

Rules:
- **Spaces are required** around \`+\` and \`-\` (\`calc(100%-20px)\` is invalid)
- For \`*\` one side must be a plain number; for \`/\` the right side must be a number
- You can nest calc and use variables inside it`,
      syntax: `:root { --header-h: 64px; }
main { min-height: calc(100vh - var(--header-h)); }`,
    },
    {
      heading: 'Building a theme with variables',
      content: `Professional design systems use **semantic tokens** – variables named by purpose, not colour:

\`--bg\`, \`--surface\`, \`--text\`, \`--text-muted\`, \`--primary\`, \`--border\`

Components only use these tokens. To create a dark theme, you only **redefine the tokens** – no component CSS changes.

Two ways to trigger dark mode:
1. **Automatic** – follow the OS with \`@media (prefers-color-scheme: dark)\`
2. **Manual toggle** – a \`data-theme="dark"\` attribute on \`<html>\` that JavaScript switches (and saves to localStorage)

Also set \`color-scheme: light dark;\` so native form controls and scrollbars match the theme.`,
      syntax: `:root { --bg: #fff; --text: #111; }
@media (prefers-color-scheme: dark) {
  :root { --bg: #0f172a; --text: #e2e8f0; }
}
[data-theme="dark"] { --bg: #0f172a; --text: #e2e8f0; }
body { background: var(--bg); color: var(--text); }`,
    },
    {
      heading: 'Variables + media queries + JavaScript',
      content: `Because custom properties are live, you can:

- **Change them in media queries** – e.g. \`--gutter: 16px\` on mobile, \`32px\` on desktop; every component using \`var(--gutter)\` updates
- **Read/write them in JS** –
  \`document.documentElement.style.setProperty('--primary', 'tomato')\`
  \`getComputedStyle(el).getPropertyValue('--primary')\`

This is how colour pickers, "accent colour" settings and theme toggles work on real sites.

**Coming next:** Module 6 – Day 25 transitions and transforms.`,
      syntax: `:root { --gutter: 16px; }
@media (min-width: 768px) { :root { --gutter: 32px; } }`,
    },
  ],
  examples: [
    {
      title: 'Design tokens on :root',
      scenario: 'Define brand colours, radius and spacing once and use them in buttons and cards.',
      steps: [
        'Declare variables on :root',
        'Use var() in .btn and .card',
        'Run, then change --primary to another colour and run again',
      ],
      code: `:root { --primary: #4f46e5; --radius: 10px; --space: 16px; }
.btn { background: var(--primary); border-radius: var(--radius); padding: calc(var(--space) / 2) var(--space); }`,
      playground: {
        html: `<div class="card">
  <h3>Design tokens</h3>
  <p>Change <code>--primary</code> once and every component updates.</p>
  <button class="btn">Primary</button>
  <button class="btn outline">Outline</button>
</div>`,
        css: `:root {
  --primary: #4f46e5;
  --radius: 10px;
  --space: 16px;
  --border: #e2e8f0;
}
body { font-family: system-ui, sans-serif; padding: var(--space); }
.card { padding: calc(var(--space) * 1.5); border: 1px solid var(--border); border-radius: var(--radius); max-width: 360px; }
.card h3 { margin-top: 0; color: var(--primary); }
.btn { background: var(--primary); color: #fff; border: 2px solid var(--primary); border-radius: var(--radius); padding: calc(var(--space) / 2) var(--space); font: inherit; }
.btn.outline { background: transparent; color: var(--primary); }`,
      },
      result: 'A card with an indigo heading, a solid indigo button and an outline indigo button – all from one variable.',
      explanation: 'Every colour/space value comes from :root. calc() derives half and 1.5× spacing from one --space token.',
    },
    {
      title: 'Local override: component variants',
      scenario: 'Create success, warning and danger alerts by only changing one variable per variant.',
      steps: [
        'Create .alert using var(--tone)',
        'Define --tone per modifier class',
        'Run',
      ],
      code: `.alert { border-left: 6px solid var(--tone); background: color-mix(in srgb, var(--tone) 12%, white); }
.alert.success { --tone: #16a34a; }`,
      playground: {
        html: `<div class="alert">Default info alert</div>
<div class="alert success">Saved successfully</div>
<div class="alert warning">Your trial ends soon</div>
<div class="alert danger">Payment failed</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; display: grid; gap: 10px; }
.alert {
  --tone: #2563eb;
  padding: 12px 16px;
  border-left: 6px solid var(--tone);
  background: color-mix(in srgb, var(--tone) 12%, white);
  color: var(--tone);
  border-radius: 6px;
  font-weight: 600;
}
.alert.success { --tone: #16a34a; }
.alert.warning { --tone: #d97706; }
.alert.danger  { --tone: #dc2626; }`,
      },
      result: 'Four alerts in blue, green, amber and red, each with a matching light background and border.',
      explanation: 'The component CSS is written once. Each variant only redefines --tone, which cascades to border, background and text colour.',
    },
    {
      title: 'Dark mode toggle with data-theme',
      scenario: 'A page that follows the OS theme and also has a toggle button.',
      steps: [
        'Define light tokens on :root and dark tokens on [data-theme="dark"]',
        'Use only tokens in component CSS',
        'Add a button that toggles data-theme on <html> with JavaScript',
        'Run and click the button',
      ],
      code: `:root { --bg: #f8fafc; --surface: #fff; --text: #0f172a; }
[data-theme="dark"] { --bg: #0f172a; --surface: #1e293b; --text: #e2e8f0; }
body { background: var(--bg); color: var(--text); transition: background .3s, color .3s; }`,
      playground: {
        html: `<button id="toggle">🌙 Toggle theme</button>
<article class="card">
  <h2>Theme with variables</h2>
  <p class="muted">Only the tokens change. The component CSS never changes.</p>
</article>`,
        css: `:root {
  color-scheme: light;
  --bg: #f8fafc; --surface: #ffffff; --text: #0f172a; --muted: #64748b; --primary: #0ea5e9; --border: #e2e8f0;
}
[data-theme="dark"] {
  color-scheme: dark;
  --bg: #0f172a; --surface: #1e293b; --text: #e2e8f0; --muted: #94a3b8; --primary: #38bdf8; --border: #334155;
}
body { margin: 0; padding: 20px; min-height: 100vh; font-family: system-ui, sans-serif; background: var(--bg); color: var(--text); transition: background .3s, color .3s; }
.card { margin-top: 16px; padding: 20px; background: var(--surface); border: 1px solid var(--border); border-radius: 12px; }
.card h2 { margin-top: 0; color: var(--primary); }
.muted { color: var(--muted); }
#toggle { padding: 10px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); color: var(--text); cursor: pointer; font: inherit; }`,
        js: `const root = document.documentElement;
const btn = document.getElementById('toggle');
btn.addEventListener('click', () => {
  const dark = root.dataset.theme === 'dark';
  root.dataset.theme = dark ? 'light' : 'dark';
  btn.textContent = dark ? '🌙 Toggle theme' : '☀️ Toggle theme';
  console.log('Theme is now', root.dataset.theme);
});`,
      },
      result: 'Clicking the button smoothly switches the page between a light and a dark theme; the console logs the new theme.',
      explanation: 'JS only flips one attribute. The [data-theme="dark"] selector redefines the tokens, and every var() reference updates automatically.',
    },
    {
      title: 'calc() layout: sidebar and header offsets',
      scenario: 'A content area that fills the height below a fixed header and the width beside a sidebar.',
      steps: [
        'Define --header-h and --sidebar-w',
        'Use calc(100% - var(--sidebar-w)) and calc(100vh - var(--header-h))',
        'Run',
      ],
      code: `main {
  width: calc(100% - var(--sidebar-w));
  height: calc(100vh - var(--header-h));
}`,
      playground: {
        html: `<header>Header (60px)</header>
<div class="wrap">
  <aside>Sidebar (180px)</aside>
  <main>width: calc(100% - 180px)<br>height: calc(100vh - 60px)</main>
</div>`,
        css: `:root { --header-h: 60px; --sidebar-w: 180px; }
* { box-sizing: border-box; }
body { margin: 0; font-family: monospace; }
header { height: var(--header-h); background: #18181b; color: #fff; padding: 20px; }
.wrap { display: flex; }
aside { width: var(--sidebar-w); height: calc(100vh - var(--header-h)); background: #a855f7; color: #fff; padding: 12px; }
main { width: calc(100% - var(--sidebar-w)); height: calc(100vh - var(--header-h)); background: #fae8ff; padding: 12px; }`,
      },
      result: 'A black header, purple sidebar and pink main area that together exactly fill the preview without scrollbars.',
      explanation: 'calc() subtracts the variable sizes from 100% / 100vh so the parts add up perfectly.',
    },
  ],
  interview: [
    { q: 'What are CSS custom properties?', a: 'User-defined properties starting with -- that store values and are read with var(). They cascade and inherit and can change at runtime.', level: 'Easy' },
    { q: 'Difference between CSS variables and Sass variables?', a: 'Sass variables are compiled away at build time and are static. CSS variables exist in the browser, follow the cascade, can be scoped to elements, changed in media queries and updated by JavaScript.', level: 'Medium' },
    { q: 'How do you provide a fallback for a CSS variable?', a: 'var(--name, fallbackValue), e.g. color: var(--brand, #333).', level: 'Easy' },
    { q: 'Why declare global variables on :root?', a: ':root matches the <html> element, the top of the tree, so all elements inherit the variables. It also has higher specificity than html.', level: 'Easy' },
    { q: 'Why is calc(100%-20px) invalid?', a: 'The + and - operators require whitespace on both sides; otherwise -20px is parsed as a negative number token.', level: 'Medium' },
    { q: 'How do you implement dark mode with CSS variables?', a: 'Use semantic tokens for colours; redefine them inside @media (prefers-color-scheme: dark) and/or a [data-theme="dark"] selector toggled by JavaScript. Components only reference tokens.', level: 'Medium' },
    { q: 'How do you change a CSS variable with JavaScript?', a: 'element.style.setProperty(\'--name\', value); read it with getComputedStyle(element).getPropertyValue(\'--name\').', level: 'Medium' },
    { q: 'What happens when a variable has an invalid value for the property using it?', a: 'The declaration becomes invalid at computed-value time, and the property uses its inherited value (if inherited) or initial value – not the previous valid declaration.', level: 'Hard' },
    { q: 'What does color-scheme: dark do?', a: 'Tells the browser the element supports a dark scheme so built-in UI like form controls, scrollbars and default colours render in dark style.', level: 'Hard' },
    { q: 'Can you use CSS variables inside media query conditions?', a: 'No. var() cannot be used in the media query condition (e.g. @media (min-width: var(--bp)) is invalid), but you can redefine variables inside media queries.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a spacing scale --space-1 to --space-4 (4, 8, 16, 32px) and use them for card padding and gaps.',
      hint: 'Define on :root, use var().',
      solution: `<style>
  :root { --space-1: 4px; --space-2: 8px; --space-3: 16px; --space-4: 32px; }
  .stack { display: grid; gap: var(--space-3); padding: var(--space-4); }
  .card { padding: var(--space-3); border: 1px solid #ddd; }
</style>
<div class="stack"><div class="card">A</div><div class="card">B</div></div>`,
    },
    {
      task: 'Make a button component whose colour is controlled by a --btn-color variable, with primary and danger variants.',
      hint: 'Variant classes only set --btn-color.',
      solution: `<style>
  .btn { --btn-color: #2563eb; background: var(--btn-color); color: #fff; border: 0; padding: 8px 16px; border-radius: 6px; }
  .btn.danger { --btn-color: #dc2626; }
</style>
<button class="btn">Save</button> <button class="btn danger">Delete</button>`,
    },
    {
      task: 'Add automatic dark mode using prefers-color-scheme for --bg and --text.',
      hint: 'Redefine tokens inside the media query.',
      solution: `<style>
  :root { --bg: #fff; --text: #111; color-scheme: light dark; }
  @media (prefers-color-scheme: dark) { :root { --bg: #111; --text: #eee; } }
  body { background: var(--bg); color: var(--text); }
</style>`,
    },
    {
      task: 'Create a 3-column flex row where each item width is calculated as one third minus the gap, using a --gap variable.',
      hint: 'flex: 0 0 calc((100% - 2 * var(--gap)) / 3)',
      solution: `<style>
  .row { --gap: 12px; display: flex; flex-wrap: wrap; gap: var(--gap); }
  .row div { flex: 0 0 calc((100% - 2 * var(--gap)) / 3); background: #cde; padding: 12px; box-sizing: border-box; }
</style>
<div class="row"><div>1</div><div>2</div><div>3</div><div>4</div><div>5</div><div>6</div></div>`,
    },
  ],
  quiz: [
    { question: 'How do you declare a CSS custom property?', options: ['$color: red;', '--color: red;', '@color: red;', 'var-color: red;'], answer: 1, explanation: 'Custom properties start with two dashes.' },
    { question: 'Which is a valid calc() expression?', options: ['calc(100%-20px)', 'calc(100% + 20)', 'calc(100% - 20px)', 'calc(100% * 20px)'], answer: 2, explanation: 'Spaces around - are required and units must be compatible.' },
    { question: 'In var(--accent, orange), "orange" is…', options: ['The fallback value', 'The variable name', 'An error', 'The inherited value'], answer: 0, explanation: 'The second argument is used if --accent is not defined.' },
    { question: 'Which can CSS variables do that Sass variables cannot?', options: ['Store colours', 'Be used in selectors', 'Do maths', 'Change at runtime via JavaScript'], answer: 3, explanation: 'CSS variables live in the browser and can be updated dynamically.' },
    { question: 'Where are global design tokens usually declared?', options: ['body', ':root', '*', 'head'], answer: 1, explanation: ':root is the document root, so everything inherits from it.' },
  ],
};
