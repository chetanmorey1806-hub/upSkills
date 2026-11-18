export default {
  id: 'day-13-customization-sass-css-variables-theming-dark-mode',
  title: 'Customization: Sass Variables, CSS Variables, Theming and Color Modes (Dark Mode)',
  module: 'Module 3: Professional Bootstrap',
  day: 13,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Make Bootstrap look like your brand instead of "default Bootstrap": override Sass variables and maps at build time, tweak CSS custom properties at runtime, create custom theme colours and components, and add a light/dark/auto colour-mode switcher with data-bs-theme.',
  objectives: [
    'Set up Bootstrap Sass with npm + Vite and override variables in the right order',
    'Add custom theme colours via the $theme-colors map and import only the parts you need',
    'Customise at runtime with root and component-level CSS variables (--bs-*)',
    'Use data-bs-theme for dark mode, build a light/dark/auto toggle and persist the choice',
    'Know the utility API and the main options like $enable-shadows, $enable-rounded',
  ],
  theory: [
    {
      heading: 'Three Levels of Customisation',
      content: '1. **Override with your own CSS** – quick tweaks after Bootstrap\'s CSS. Easy, but you fight specificity and you can\'t change things like breakpoints.\n2. **CSS custom properties (variables)** – Bootstrap 5.3 exposes `--bs-*` variables on `:root` and on components (`--bs-btn-bg`, `--bs-card-border-radius`). Change them in CSS or JS at **runtime**, no build needed.\n3. **Sass** – change the **source** variables (`$primary`, `$border-radius`, `$grid-breakpoints`) and recompile. Most powerful: every component, utility, hover shade and variant is regenerated consistently, and you can remove unused parts.\n\nAnalogy: CSS overrides are painting over a wall; CSS variables are swapping the light bulbs; Sass is changing the blueprint before the house is built.',
    },
    {
      heading: 'Sass Setup and Import Order',
      content: 'Install: `npm i bootstrap sass` (Vite compiles `.scss` automatically once `sass` is installed).\n\nIn `src/scss/styles.scss`:\n\n1. **Functions** first (needed by variables)\n2. **Your variable overrides** (no `!default`)\n3. Bootstrap **variables**, **variables-dark**, **maps**, **mixins**, **utilities**\n4. Optional map changes (e.g. add to `$theme-colors`)\n5. **Layout & components** you need (or simply `@import "bootstrap/scss/bootstrap"` for everything)\n\nWhy before? Bootstrap\'s variables use `!default`, meaning "use this value only if the variable isn\'t already set". So your value wins if it is defined **before** Bootstrap\'s variables file.',
      syntax: `// src/scss/styles.scss
// 1. Functions
@import "bootstrap/scss/functions";

// 2. Overrides (before variables!)
$primary: #6f42c1;
$font-family-sans-serif: "Poppins", system-ui, sans-serif;
$border-radius: .75rem;
$enable-shadows: true;
$enable-negative-margins: true;

// 3. Required parts
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";

// 4. Map changes: add a custom theme colour
$custom-colors: ("brand": #ff6b35);
$theme-colors: map-merge($theme-colors, $custom-colors);

@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";

// 5. Only what you use
@import "bootstrap/scss/root";
@import "bootstrap/scss/reboot";
@import "bootstrap/scss/type";
@import "bootstrap/scss/containers";
@import "bootstrap/scss/grid";
@import "bootstrap/scss/buttons";
@import "bootstrap/scss/card";
@import "bootstrap/scss/helpers";
@import "bootstrap/scss/utilities/api";`,
      tip: 'Adding "brand" to $theme-colors automatically generates .btn-brand, .btn-outline-brand, .text-bg-brand, .bg-brand, .alert-brand, .border-brand and more. That is the power of Sass maps.',
    },
    {
      heading: 'Useful Sass Variables, Options and the Utility API',
      content: 'Common variables:\n- Colours: `$primary`, `$secondary`, `$success`, `$body-bg`, `$body-color`, `$link-color`\n- Type: `$font-family-sans-serif`, `$font-size-base`, `$headings-font-weight`\n- Shape: `$border-radius`, `$border-radius-lg`, `$btn-border-radius`\n- Spacing: `$spacer`, `$spacers` map\n- Layout: `$grid-breakpoints`, `$container-max-widths`, `$grid-gutter-width`\n\nGlobal options (`$enable-*`): `$enable-shadows`, `$enable-gradients`, `$enable-rounded`, `$enable-negative-margins`, `$enable-dark-mode`, `$enable-cssgrid`, `$enable-reduced-motion`.\n\n**Utility API**: add or change utilities via the `$utilities` map:\n```\n$utilities: map-merge($utilities, (\n  "cursor": (property: cursor, class: cursor, responsive: true, values: auto pointer grab)\n));\n```\nThis generates `.cursor-pointer`, `.cursor-md-grab` etc. Place it after importing utilities and before utilities/api.\n\nMixins: `@include media-breakpoint-up(md) { ... }`, `@include button-variant(...)`.',
    },
    {
      heading: 'CSS Variables at Runtime',
      content: 'Bootstrap 5.3 compiles many values into CSS variables:\n\n- **Root level**: `--bs-primary`, `--bs-primary-rgb`, `--bs-body-bg`, `--bs-body-color`, `--bs-body-font-family`, `--bs-border-radius`, `--bs-link-color`…\n- **Component level**: `.btn { --bs-btn-padding-x; --bs-btn-bg; --bs-btn-hover-bg… }`, `.card { --bs-card-spacer-y; --bs-card-border-radius… }`, `.navbar`, `.table`, `.tooltip`, etc.\n\nYou can:\n- Override globally: `:root { --bs-body-font-family: "Inter", sans-serif; --bs-border-radius: 1rem; }`\n- Override per component class: `.btn-brand { --bs-btn-bg: ...; }`\n- Override per element inline: `style="--bs-card-border-radius: 0"`\n- Change from JS: `document.documentElement.style.setProperty("--bs-body-bg", "#fffbe6")`\n\nNote: utility classes like `.bg-primary` use `--bs-primary-rgb`, while `.btn-primary` has its own compiled colours, so changing `--bs-primary` alone does **not** recolour buttons. Override `--bs-btn-*` for that, or use Sass.',
      tip: 'Use CSS variables for user-facing theme switches (runtime), Sass for brand-level design decisions (build time).',
    },
    {
      heading: 'Color Modes: Dark Mode with data-bs-theme',
      content: 'Bootstrap 5.3 supports **color modes** via the `data-bs-theme` attribute:\n\n- `<html data-bs-theme="dark">` – the whole page is dark\n- On any element: `<div class="card" data-bs-theme="dark">` – only that part is dark\n- `data-bs-theme="light"` inside a dark page brings a light island back\n\nBootstrap redefines `--bs-body-bg`, `--bs-body-color`, `--bs-border-color`, `--bs-*-subtle`, `--bs-*-emphasis`, `--bs-secondary-bg` etc. under `[data-bs-theme=dark]`. That\'s why 5.3 recommends adaptive classes like `.bg-body`, `.bg-body-tertiary`, `.text-body-emphasis`, `.border` instead of fixed `.bg-white` / `.text-dark`.\n\n**Auto mode** (follow the OS): read `window.matchMedia("(prefers-color-scheme: dark)")`, set the attribute accordingly, listen for changes, and save the user\'s choice in `localStorage`. Run this script in `<head>` to avoid a white flash.\n\n**Custom colour modes**: you can add your own, e.g. `[data-bs-theme="blue"] { --bs-body-bg: #0a1931; ... }`.',
      syntax: `/* Custom dark tweaks */
[data-bs-theme="dark"] {
  --bs-body-bg: #0f172a;
  --bs-primary: #60a5fa;
  --bs-primary-rgb: 96, 165, 250;
}`,
      points: [
        'Sass option: $color-mode-type: media-query makes dark mode follow the OS automatically without an attribute',
        'Avoid hardcoded .bg-white/.text-dark in dark-mode-ready designs',
        'Coming next (Day 14): Bootstrap with React (react-bootstrap), best practices and accessibility',
      ],
    },
  ],
  examples: [
    {
      title: 'Brand Theme with Root and Component CSS Variables',
      scenario: 'Rebrand a page to purple with rounder corners and a different font without Sass, by overriding CSS variables.',
      steps: [
        'Write a :root block changing body font, radius and link colour variables',
        'Create .btn-brand and override --bs-btn-* variables',
        'Override --bs-card-* variables on a .card-brand class',
        'Run and compare the default and the brand components',
      ],
      code: `:root {
  --bs-body-font-family: Georgia, serif;
  --bs-border-radius: 1rem;
  --bs-link-color-rgb: 111, 66, 193;
  --bs-link-hover-color-rgb: 74, 44, 128;
}
.btn-brand {
  --bs-btn-bg: #6f42c1; --bs-btn-border-color: #6f42c1; --bs-btn-color: #fff;
  --bs-btn-hover-bg: #59359a; --bs-btn-hover-border-color: #59359a; --bs-btn-hover-color: #fff;
  --bs-btn-padding-x: 1.5rem;
  --bs-btn-border-radius: 50rem;
}
.card-brand { --bs-card-border-color: #6f42c1; --bs-card-cap-bg: #6f42c1; --bs-card-cap-color: #fff; }`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row g-4">
    <div class="col-md-6">
      <h6>Default Bootstrap</h6>
      <div class="card"><div class="card-header">Default card</div><div class="card-body">
        <p>Text with a <a href="#">link</a>.</p><button class="btn btn-primary">Primary</button></div></div>
    </div>
    <div class="col-md-6 brand-scope">
      <h6>Brand variables</h6>
      <div class="card card-brand"><div class="card-header">Brand card</div><div class="card-body">
        <p>Text with a <a href="#">link</a>.</p><button class="btn btn-brand">Brand button</button></div></div>
    </div>
  </div>
  <div class="mt-4">
    <label class="form-label" for="rad">Live --bs-border-radius: <b id="rv">1rem</b></label>
    <input type="range" class="form-range" id="rad" min="0" max="2" step="0.25" value="1">
  </div>
</div>`,
        css: `.brand-scope {
  --bs-body-font-family: Georgia, serif;
  font-family: var(--bs-body-font-family);
  --bs-border-radius: 1rem;
  --bs-link-color-rgb: 111, 66, 193;
  --bs-link-hover-color-rgb: 74, 44, 128;
}
.btn-brand {
  --bs-btn-bg: #6f42c1; --bs-btn-border-color: #6f42c1; --bs-btn-color: #fff;
  --bs-btn-hover-bg: #59359a; --bs-btn-hover-border-color: #59359a; --bs-btn-hover-color: #fff;
  --bs-btn-active-bg: #4a2c80; --bs-btn-active-border-color: #4a2c80; --bs-btn-active-color: #fff;
  --bs-btn-padding-x: 1.5rem;
  --bs-btn-border-radius: 50rem;
}
.card-brand {
  --bs-card-border-color: #6f42c1;
  --bs-card-cap-bg: #6f42c1;
  --bs-card-cap-color: #fff;
  --bs-card-border-radius: var(--bs-border-radius);
  --bs-card-inner-border-radius: calc(var(--bs-border-radius) - 1px);
}`,
        js: `document.getElementById('rad').addEventListener('input', function (e) {
  const v = e.target.value + 'rem';
  document.querySelector('.brand-scope').style.setProperty('--bs-border-radius', v);
  document.getElementById('rv').textContent = v;
  console.log('--bs-border-radius =', v);
});`,
      },
      result: 'Left: standard blue Bootstrap card and button. Right: a serif-font card with a purple header and border, purple links and a purple pill button. Dragging the slider changes the right card\'s corner radius live.',
      explanation: 'Components read their look from scoped CSS variables, so redefining variables on a class or wrapper restyles them without touching selectors or !important. setProperty changes them at runtime.',
    },
    {
      title: 'Light / Dark / Auto Colour Mode Switcher',
      scenario: 'Add a theme dropdown that switches the whole page between light, dark and auto (OS preference) and remembers the choice.',
      steps: [
        'Build a demo page using adaptive classes (bg-body-tertiary, text-body-secondary, border)',
        'Add a dropdown with three buttons carrying data-theme-value',
        'Write setTheme() that resolves "auto" with matchMedia and sets data-bs-theme on <html>',
        'Save the choice to localStorage and react to OS changes',
      ],
      code: `const getStored = () => localStorage.getItem('theme');
const resolve = t => t === 'auto'
  ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : t;
function setTheme(t) {
  document.documentElement.setAttribute('data-bs-theme', resolve(t));
  localStorage.setItem('theme', t);
}
setTheme(getStored() || 'auto');
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if ((getStored() || 'auto') === 'auto') setTheme('auto');
});`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<nav class="navbar bg-body-tertiary border-bottom">
  <div class="container">
    <span class="navbar-brand">ThemeDemo</span>
    <div class="dropdown">
      <button class="btn btn-outline-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false" aria-label="Toggle theme">
        <i class="bi bi-circle-half" id="themeIcon" aria-hidden="true"></i> <span id="themeLabel">Auto</span>
      </button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><button class="dropdown-item" data-theme-value="light"><i class="bi bi-sun-fill me-2" aria-hidden="true"></i>Light</button></li>
        <li><button class="dropdown-item" data-theme-value="dark"><i class="bi bi-moon-stars-fill me-2" aria-hidden="true"></i>Dark</button></li>
        <li><button class="dropdown-item" data-theme-value="auto"><i class="bi bi-circle-half me-2" aria-hidden="true"></i>Auto</button></li>
      </ul>
    </div>
  </div>
</nav>
<div class="container py-4">
  <div class="row g-3">
    <div class="col-md-6"><div class="card h-100"><div class="card-body">
      <h5 class="card-title text-body-emphasis">Adaptive card</h5>
      <p class="text-body-secondary">Uses bg-body / text-body classes, so it adapts automatically.</p>
      <div class="alert alert-primary py-2 mb-2">Subtle alert</div>
      <input class="form-control" placeholder="Inputs adapt too">
    </div></div></div>
    <div class="col-md-6"><div class="p-3 border rounded h-100" data-bs-theme="light" style="background:#fff;color:#212529">
      This box is forced <b>light</b> with data-bs-theme="light" even in dark mode.
      <button class="btn btn-primary btn-sm d-block mt-2">Button</button>
    </div></div>
  </div>
  <table class="table mt-3"><thead><tr><th>Mode</th><th>Body bg</th></tr></thead><tbody><tr><td id="m"></td><td id="bg"></td></tr></tbody></table>
</div>`,
        js: `const KEY = 'bs-demo-theme';
const mq = window.matchMedia('(prefers-color-scheme: dark)');
const icons = { light: 'bi-sun-fill', dark: 'bi-moon-stars-fill', auto: 'bi-circle-half' };
function getStored() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
function resolve(t) { return t === 'auto' ? (mq.matches ? 'dark' : 'light') : t; }
function setTheme(t) {
  const applied = resolve(t);
  document.documentElement.setAttribute('data-bs-theme', applied);
  try { localStorage.setItem(KEY, t); } catch (e) {}
  document.getElementById('themeLabel').textContent = t.charAt(0).toUpperCase() + t.slice(1);
  document.getElementById('themeIcon').className = 'bi ' + icons[t];
  document.querySelectorAll('[data-theme-value]').forEach(function (b) { b.classList.toggle('active', b.dataset.themeValue === t); });
  document.getElementById('m').textContent = t + ' -> ' + applied;
  document.getElementById('bg').textContent = getComputedStyle(document.body).backgroundColor;
  console.log('Theme:', t, '(applied:', applied + ')');
}
document.querySelectorAll('[data-theme-value]').forEach(function (b) {
  b.addEventListener('click', function () { setTheme(b.dataset.themeValue); });
});
mq.addEventListener('change', function () { if ((getStored() || 'auto') === 'auto') setTheme('auto'); });
setTheme(getStored() || 'auto');`,
      },
      result: 'Choosing Dark turns the navbar, card, alert, input and table dark; the right box stays light. Auto follows the operating-system setting. The table shows the chosen and applied mode and the body background colour; the choice is remembered on reload.',
      explanation: 'data-bs-theme on <html> swaps the root colour variables. Adaptive classes use those variables, so nothing else needs changing. A nested data-bs-theme="light" re-scopes the variables for that subtree.',
    },
    {
      title: 'Sass Custom Theme Colour (build) + Equivalent CSS Preview',
      scenario: 'Your company colour "brand" (#ff6b35) must be a full theme colour with buttons, alerts and text-bg utilities. With Sass this is generated; here we preview the result with equivalent CSS.',
      steps: [
        'In a Vite project run npm i bootstrap sass',
        'Create src/scss/styles.scss with functions, overrides, variables, the $theme-colors map-merge and the rest of Bootstrap',
        'Import the SCSS in main.js; Vite compiles it',
        'Use .btn-brand, .text-bg-brand, .alert-brand in HTML (the playground preview defines them with CSS variables)',
      ],
      code: `// src/scss/styles.scss
@import "bootstrap/scss/functions";

$primary: #0d6efd;
$enable-shadows: true;
$border-radius: .6rem;

@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";

$theme-colors: map-merge($theme-colors, ("brand": #ff6b35));

@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";

// custom utility: .cursor-pointer, .cursor-grab ...
$utilities: map-merge($utilities, (
  "cursor": (property: cursor, class: cursor, values: auto pointer grab)
));

@import "bootstrap/scss/bootstrap";   // rest of Bootstrap

// main.js
import './scss/styles.scss';
import * as bootstrap from 'bootstrap';

// package.json scripts (Vite handles SCSS automatically once "sass" is installed)
// "dev": "vite", "build": "vite build"`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <p class="small text-body-secondary">Preview of what Sass generates for "brand" (simulated with CSS here):</p>
  <div class="d-flex flex-wrap gap-2 mb-3">
    <button class="btn btn-brand">btn-brand</button>
    <button class="btn btn-outline-brand">btn-outline-brand</button>
    <span class="badge text-bg-brand align-self-center">text-bg-brand</span>
    <span class="text-brand fw-bold align-self-center">text-brand</span>
  </div>
  <div class="alert alert-brand">alert-brand: generated from the same colour.</div>
  <div class="p-3 border rounded cursor-pointer" title="cursor-pointer utility">Hover me: .cursor-pointer from the utility API</div>
</div>`,
        css: `:root { --bs-brand: #ff6b35; --bs-brand-rgb: 255, 107, 53; }
.btn-brand {
  --bs-btn-color: #000; --bs-btn-bg: #ff6b35; --bs-btn-border-color: #ff6b35;
  --bs-btn-hover-color: #000; --bs-btn-hover-bg: #ff8153; --bs-btn-hover-border-color: #ff7a49;
  --bs-btn-active-bg: #ff895d; --bs-btn-focus-shadow-rgb: 217, 91, 45;
}
.btn-outline-brand {
  --bs-btn-color: #ff6b35; --bs-btn-border-color: #ff6b35;
  --bs-btn-hover-color: #000; --bs-btn-hover-bg: #ff6b35; --bs-btn-hover-border-color: #ff6b35;
  --bs-btn-active-bg: #ff6b35; --bs-btn-active-color: #000;
}
.text-bg-brand { color: #000 !important; background-color: RGBA(255, 107, 53, var(--bs-bg-opacity, 1)) !important; }
.text-brand { color: rgba(var(--bs-brand-rgb), var(--bs-text-opacity, 1)) !important; }
.alert-brand { --bs-alert-color: #662b15; --bs-alert-bg: #ffe1d7; --bs-alert-border-color: #ffc4ae; }
.cursor-pointer { cursor: pointer !important; }`,
      },
      result: 'An orange solid button, an orange outline button, an orange badge, orange text and a peach "brand" alert, all consistent, plus a box that shows a pointer cursor.',
      explanation: 'In Sass, adding a key to $theme-colors loops through every component mixin (button-variant, alert-variant, utilities), generating all classes with correct hover/active shades and contrast colours. The CSS in the playground is a hand-written approximation of that output so you can see it without a build step.',
    },
    {
      title: 'Scoped Dark Sections and Custom Dark Palette',
      scenario: 'A light landing page with a dark "pricing" band, and a custom dark palette (navy instead of Bootstrap\'s grey).',
      steps: [
        'Wrap a section in data-bs-theme="dark" so its components become dark',
        'Override [data-bs-theme=dark] variables for a navy palette',
        'Use bg-body, text-body-emphasis and border inside the section',
        'Run: only the section is dark',
      ],
      code: `<section data-bs-theme="dark" class="bg-body text-body py-5">...</section>

[data-bs-theme="dark"] {
  --bs-body-bg: #0b1736;
  --bs-body-bg-rgb: 11, 23, 54;
  --bs-tertiary-bg: #13224a;
  --bs-border-color: #2a3c6b;
}`,
      playground: {
        libs: ['bootstrap'],
        html: `<section class="container py-4"><h4>Light section</h4><p class="text-body-secondary">Normal light theme content.</p></section>
<section data-bs-theme="dark" class="bg-body text-body py-4">
  <div class="container">
    <h4 class="text-body-emphasis">Pricing (dark section)</h4>
    <div class="row g-3">
      <div class="col-sm-6"><div class="card h-100"><div class="card-body"><h5>Starter</h5><p class="fs-3">Rs 0</p><button class="btn btn-outline-light w-100">Choose</button></div></div></div>
      <div class="col-sm-6"><div class="card h-100 border-primary"><div class="card-body"><h5>Pro <span class="badge text-bg-primary">Popular</span></h5><p class="fs-3">Rs 499</p><button class="btn btn-primary w-100">Choose</button></div></div></div>
    </div>
    <div class="bg-body-tertiary border rounded p-2 mt-3 small">bg-body-tertiary box inside dark section</div>
  </div>
</section>
<section class="container py-4"><p>Back to light.</p></section>`,
        css: `[data-bs-theme="dark"] {
  --bs-body-bg: #0b1736;
  --bs-body-bg-rgb: 11, 23, 54;
  --bs-tertiary-bg: #13224a;
  --bs-tertiary-bg-rgb: 19, 34, 74;
  --bs-border-color: #2a3c6b;
}`,
      },
      result: 'The page is light except a navy pricing band where cards, text, borders and the tertiary box are dark-themed.',
      explanation: 'data-bs-theme works on any element: Bootstrap\'s [data-bs-theme=dark] selector redefines the variables for that subtree. Your own [data-bs-theme="dark"] block, loaded after Bootstrap, overrides those values to create a custom palette.',
    },
  ],
  interview: [
    { q: 'What are the ways to customise Bootstrap?', a: 'Override with your own CSS after Bootstrap, change CSS custom properties (--bs-*) at runtime, or change Sass variables/maps and recompile (most powerful). You can also use the utility API to generate utilities.', level: 'Easy' },
    { q: 'Why must Sass variable overrides come before importing Bootstrap\'s variables?', a: 'Bootstrap variables are declared with !default, which only assigns if the variable is not already defined. Defining yours first makes them win.', level: 'Medium' },
    { q: 'How do you add a new theme colour like "brand"?', a: 'After importing variables, merge into the map: $theme-colors: map-merge($theme-colors, ("brand": #ff6b35)); then import maps and the rest. Bootstrap generates btn-brand, bg-brand, text-bg-brand, alert-brand, etc.', level: 'Medium' },
    { q: 'How do you reduce Bootstrap\'s CSS size?', a: 'Import only the Sass partials you use, remove unused utilities via the utility API or map-remove, and/or run PurgeCSS. For JS, import only needed components (import Modal from "bootstrap/js/dist/modal").', level: 'Hard' },
    { q: 'What is the difference between Sass variables and CSS variables in Bootstrap?', a: 'Sass variables exist only at compile time and produce static CSS. CSS variables exist in the browser and can be changed at runtime (per element, with JS, for themes). Bootstrap 5.3 uses Sass to generate many CSS variables.', level: 'Medium' },
    { q: 'Why doesn\'t changing --bs-primary recolour .btn-primary?', a: 'Buttons have their own compiled component variables (--bs-btn-bg etc.) generated from the Sass $primary value. You must override --bs-btn-* or recompile with Sass.', level: 'Hard' },
    { q: 'How do you enable dark mode in Bootstrap 5.3?', a: 'Set data-bs-theme="dark" on <html> (whole site) or on any element (section). Use adaptive classes like bg-body-tertiary and text-body-emphasis so content follows the mode.', level: 'Easy' },
    { q: 'How do you implement an "auto" theme that follows the OS?', a: 'Use window.matchMedia("(prefers-color-scheme: dark)") to resolve auto to dark/light, set data-bs-theme, listen to its change event, and store the user choice in localStorage. Run it early in <head> to avoid a flash.', level: 'Medium' },
    { q: 'What is the Bootstrap utility API?', a: 'A Sass map ($utilities) describing utilities (property, class prefix, values, responsive, state). You can add, modify or remove utilities and Bootstrap generates the classes.', level: 'Hard' },
    { q: 'What do $enable-shadows and $enable-gradients do?', a: 'Global Sass options; when true, components like buttons and form controls get box-shadows or gradient backgrounds respectively. Both default to false.', level: 'Medium' },
    { q: 'What does $color-mode-type: media-query do?', a: 'It generates dark-mode styles inside @media (prefers-color-scheme: dark) instead of the [data-bs-theme=dark] selector, so the page follows the OS without JS (but users can\'t toggle).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Using only CSS variables, make all cards on the page have no border, 1.5rem radius and a soft shadow.',
      hint: 'Override --bs-card-border-width and --bs-card-border-radius on .card.',
      solution: `.card {
  --bs-card-border-width: 0;
  --bs-card-border-radius: 1.5rem;
  --bs-card-inner-border-radius: 1.5rem;
  box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .08);
}`,
    },
    {
      task: 'Write a Sass file that sets primary to teal (#0d9488), body font to "Inter", disables rounded corners and compiles all of Bootstrap.',
      hint: 'functions → overrides → bootstrap.',
      solution: `// styles.scss
$primary: #0d9488;
$font-family-sans-serif: "Inter", system-ui, sans-serif;
$enable-rounded: false;

@import "bootstrap/scss/bootstrap";`,
    },
    {
      task: 'Add a simple dark mode toggle switch (form-switch) that toggles data-bs-theme on <html> between light and dark.',
      hint: 'change event → setAttribute.',
      solution: `<div class="form-check form-switch">
  <input class="form-check-input" type="checkbox" role="switch" id="dm">
  <label class="form-check-label" for="dm">Dark mode</label>
</div>
<script>
document.getElementById('dm').addEventListener('change', e => {
  document.documentElement.setAttribute('data-bs-theme', e.target.checked ? 'dark' : 'light');
});
</script>`,
    },
    {
      task: 'Use the utility API to add responsive opacity-hover utilities: .opacity-hover-50 etc. (hint: state: hover).',
      hint: 'map-merge $utilities with a new key and state: hover.',
      solution: `@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/variables-dark";
@import "bootstrap/scss/maps";
@import "bootstrap/scss/mixins";
@import "bootstrap/scss/utilities";

$utilities: map-merge($utilities, (
  "opacity-hover": (
    property: opacity,
    class: opacity-hover,
    state: hover,
    values: (25: .25, 50: .5, 75: .75, 100: 1)
  )
));

@import "bootstrap/scss/bootstrap";
// usage: <img class="opacity-hover-50-hover"> (state classes get the -hover suffix)`,
    },
  ],
  quiz: [
    { question: 'Which attribute switches Bootstrap 5.3 to dark mode?', options: ['class="dark"', 'data-theme="dark"', 'data-bs-theme="dark"', 'data-bs-mode="dark"'], answer: 2, explanation: 'Color modes use data-bs-theme.' },
    { question: 'Sass overrides must be placed:', options: ['Before importing Bootstrap variables', 'After importing all of Bootstrap', 'In a separate CSS file', 'Anywhere'], answer: 0, explanation: '!default only applies if not already defined.' },
    { question: 'Which map do you extend to add a new theme colour?', options: ['$colors-map', '$utilities', '$grays', '$theme-colors'], answer: 3, explanation: '$theme-colors drives component variants.' },
    { question: 'Which approach allows changing the theme at runtime without rebuilding?', options: ['Sass variables', 'CSS custom properties', 'Editing bootstrap.min.css', 'Mixins'], answer: 1, explanation: 'CSS variables live in the browser.' },
    { question: 'Which class adapts its background to light and dark mode?', options: ['bg-white', 'bg-light', 'bg-body-tertiary', 'bg-gray'], answer: 2, explanation: 'bg-body-* classes use mode-aware variables.' },
  ],
};
