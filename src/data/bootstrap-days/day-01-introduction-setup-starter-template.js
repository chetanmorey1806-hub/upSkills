export default {
  id: 'day-01-introduction-setup-starter-template',
  title: 'Introduction to Bootstrap: Why Frameworks, Setup via CDN and npm, Starter Template',
  module: 'Module 1: Bootstrap Basics & Layout',
  day: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Learn what Bootstrap is, why CSS frameworks save time, how to add Bootstrap 5.3 through a CDN or npm, and how the official starter template is built.',
  objectives: [
    'Explain what a CSS framework is and when Bootstrap is (and is not) a good choice',
    'Add Bootstrap 5.3 CSS and the JS bundle to a page using the CDN',
    'Install Bootstrap with npm and import it in a Vite project',
    'Write the official starter template from memory and explain every line',
    'Combine Bootstrap classes with your own custom CSS safely',
  ],
  theory: [
    {
      heading: 'What is Bootstrap?',
      content: '**Bootstrap** is the most popular open-source front-end toolkit for building responsive, mobile-first websites. It gives you three things:\n\n- A **CSS file** with ready-made classes: a 12-column grid, typography, buttons, forms, cards, utilities like `mt-3` or `text-center`\n- A **JavaScript bundle** that powers interactive components: modals, dropdowns, tooltips, carousels, offcanvas menus\n- A **design system**: consistent colors, spacing scale, breakpoints and components that look good together\n\nAnalogy: writing a website with plain CSS is like building furniture from raw wood. Bootstrap is like a flat-pack furniture kit: the pieces are pre-cut and tested, you just assemble them with class names.\n\nBootstrap was created at Twitter by Mark Otto and Jacob Thornton in 2011. Bootstrap 5 (2021) removed the jQuery dependency, dropped Internet Explorer support and uses CSS custom properties. The current version is **Bootstrap 5.3**, which adds color modes (dark mode).',
      points: [
        'Bootstrap 5 does NOT need jQuery; components are written in vanilla JavaScript',
        'Popper.js (used for dropdowns, tooltips, popovers) is included in bootstrap.bundle.min.js',
        'Bootstrap is mobile-first: base styles target small screens, larger breakpoints add overrides',
      ],
    },
    {
      heading: 'Why Use a CSS Framework?',
      content: 'A framework solves problems every project has, so you do not solve them again:\n\n1. **Speed**: a responsive navbar, form or card grid takes minutes instead of hours\n2. **Consistency**: every button, margin and color follows one scale, so the UI looks professional\n3. **Responsiveness**: the grid and utilities already handle phones, tablets and desktops\n4. **Cross-browser testing**: Bootstrap normalises browser differences (Reboot)\n5. **Accessibility**: components ship with sensible ARIA attributes and keyboard support\n6. **Team work**: any developer who knows Bootstrap can read your markup immediately\n\nDownsides:\n- Sites can look "Bootstrappy" if you never customise them\n- You load CSS you may not use (solved with Sass imports or PurgeCSS)\n- Lots of classes in HTML ("class soup")\n\nAlternatives: **Tailwind CSS** (utility-first, no pre-built components), **Bulma**, **Foundation**, component libraries like **MUI** or **Chakra** for React.',
      tip: 'A framework does not replace CSS knowledge. When something looks wrong you still debug it with DevTools and plain CSS concepts like the box model and flexbox.',
    },
    {
      heading: 'Setup Method 1: CDN (quickest)',
      content: 'A **CDN** (Content Delivery Network) hosts the Bootstrap files on fast servers worldwide. You add one `<link>` in the `<head>` and one `<script>` before `</body>`.\n\n- `bootstrap.min.css` contains all styles\n- `bootstrap.bundle.min.js` contains all component JavaScript **plus Popper**\n- `integrity` (SRI hash) lets the browser verify the file was not tampered with; `crossorigin="anonymous"` is required for SRI\n\nThe CDN is perfect for learning, prototypes and small sites.',
      syntax: `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet"
      integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" crossorigin="anonymous">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" crossorigin="anonymous"></script>`,
      tip: 'Common mistake: loading bootstrap.min.js (without "bundle") and then wondering why dropdowns and tooltips throw "Popper is not defined". Use the bundle unless you load Popper yourself.',
    },
    {
      heading: 'Setup Method 2: npm (professional projects)',
      content: 'In real projects built with Vite, Webpack, React or Vue you install Bootstrap as a dependency so the version is locked in `package.json` and the files are bundled with your code.\n\n1. `npm create vite@latest my-site` and pick Vanilla\n2. `npm install bootstrap@5.3.3` (Popper comes as a dependency `@popperjs/core`)\n3. Import the CSS and JS in `main.js`\n4. Optionally install `sass` and import only the Sass parts you need (Day 13)',
      syntax: `// main.js
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';   // or import { Modal, Tooltip } from 'bootstrap';

// Example: open a modal from JS
// new bootstrap.Modal('#myModal').show();`,
      points: [
        'CDN: no build step, cached across sites, needs internet',
        'npm: version-locked, works offline, can tree-shake JS and customise Sass',
        'Download (zip) option exists too, for projects without npm',
      ],
    },
    {
      heading: 'The Starter Template Explained',
      content: 'Every Bootstrap page starts with the same skeleton:\n\n1. `<!doctype html>` puts the browser in standards mode (Bootstrap requires it)\n2. `<html lang="en">` helps screen readers and search engines\n3. `<meta charset="utf-8">` for correct characters\n4. `<meta name="viewport" content="width=device-width, initial-scale=1">` is **essential**: without it phones render the page at ~980px and shrink it, so responsive classes never kick in\n5. The Bootstrap CSS `<link>` in the head, **before** your own CSS so your rules can override it\n6. The JS bundle at the end of the body (or in the head with `defer`)',
      syntax: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Bootstrap demo</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="css/custom.css" rel="stylesheet"> <!-- your overrides AFTER Bootstrap -->
  </head>
  <body>
    <h1>Hello, world!</h1>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>`,
      tip: 'Forgetting the viewport meta tag is the #1 reason "Bootstrap is not responsive on my phone".',
    },
    {
      heading: 'How Bootstrap Classes Work + Customising',
      content: 'Bootstrap is just CSS: you add **class names** to HTML elements and the stylesheet does the rest. Classes follow patterns you will see all course long:\n\n- Component classes: `btn`, `card`, `navbar`, `alert`\n- Modifier classes: `btn-primary`, `btn-lg`, `alert-success`\n- Utility classes: `{property}{sides}-{breakpoint}-{size}` such as `mt-3`, `px-md-5`, `d-none d-lg-block`\n\nTo customise:\n- Add your own CSS **after** Bootstrap and use a class selector of equal or higher specificity\n- Override Bootstrap **CSS variables** like `--bs-primary` or `--bs-btn-bg`\n- Recompile with **Sass** variables (Day 13)\n\nBootstrap\'s **Reboot** (a modern normalize) sets `box-sizing: border-box` everywhere, a system font stack and removes the top margin of headings.',
      points: [
        'Avoid editing bootstrap.min.css directly; updates would erase your changes',
        'Avoid !important wars; prefer variables and well-scoped classes',
        'Coming next (Day 2): containers and the 12-column grid',
      ],
    },
  ],
  examples: [
    {
      title: 'Your First Bootstrap Page',
      scenario: 'Build a simple welcome section using only Bootstrap classes, no custom CSS.',
      steps: [
        'Create index.html using the starter template',
        'Add a container with a heading, lead paragraph and two buttons',
        'Use utility classes for spacing (py-5, mb-3) and text alignment (text-center)',
        'Click Run and resize the preview to see it stay centred',
      ],
      code: `<div class="container py-5 text-center">
  <h1 class="display-5 fw-bold mb-3">Welcome to Bootstrap 5</h1>
  <p class="lead text-secondary mb-4">Build responsive, mobile-first sites quickly with ready-made classes.</p>
  <a href="#" class="btn btn-primary btn-lg me-2">Get started</a>
  <a href="#" class="btn btn-outline-secondary btn-lg">Learn more</a>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-5 text-center">
  <h1 class="display-5 fw-bold mb-3">Welcome to Bootstrap 5</h1>
  <p class="lead text-secondary mb-4">Build responsive, mobile-first sites quickly with ready-made classes.</p>
  <a href="#" class="btn btn-primary btn-lg me-2">Get started</a>
  <a href="#" class="btn btn-outline-secondary btn-lg">Learn more</a>
</div>`,
      },
      result: 'A centred hero with a large bold heading, grey lead text and a solid blue button next to an outlined grey button.',
      explanation: '`container` centres content with a max-width. `py-5` adds large vertical padding. `display-5` is a big display heading, `fw-bold` sets bold weight, `lead` enlarges the paragraph. `btn btn-primary btn-lg` = base button + blue theme + large size; `me-2` adds right margin between the buttons.',
    },
    {
      title: 'Plain HTML vs Bootstrap (same markup, different look)',
      scenario: 'See how much Bootstrap changes default elements by comparing an unstyled form to one with Bootstrap classes.',
      steps: [
        'Write a tiny login form twice',
        'Leave the first form without classes',
        'Add form-control, form-label, btn classes to the second form',
        'Run and compare both columns',
      ],
      code: `<!-- Without classes -->
<form>
  <label>Email</label> <input type="email">
  <button>Login</button>
</form>

<!-- With Bootstrap -->
<form>
  <label for="em" class="form-label">Email</label>
  <input id="em" type="email" class="form-control mb-3" placeholder="you@example.com">
  <button class="btn btn-success w-100">Login</button>
</form>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="row g-4">
    <div class="col-sm-6">
      <h5>Without classes</h5>
      <form onsubmit="return false">
        <label>Email</label> <input type="email">
        <button>Login</button>
      </form>
    </div>
    <div class="col-sm-6">
      <h5>With Bootstrap classes</h5>
      <form class="border rounded p-3 shadow-sm" onsubmit="return false">
        <label for="em" class="form-label">Email</label>
        <input id="em" type="email" class="form-control mb-3" placeholder="you@example.com">
        <button class="btn btn-success w-100">Login</button>
      </form>
    </div>
  </div>
</div>`,
      },
      result: 'Left: a cramped default browser form. Right: a bordered card-like form with a full-width rounded input and a green full-width button.',
      explanation: '`form-control` gives inputs full width, padding, rounded border and a blue focus ring. `form-label` adds spacing below the label. `w-100` makes the button 100% wide. Reboot already improved the font of the left form too.',
    },
    {
      title: 'Checking that the JS Bundle Works',
      scenario: 'Interactive components need bootstrap.bundle.min.js. Verify it is loaded by opening a dismissible alert and a dropdown.',
      steps: [
        'Add a dismissible alert with a close button using data-bs-dismiss="alert"',
        'Add a dropdown using data-bs-toggle="dropdown"',
        'In the JS panel log the Bootstrap version via bootstrap.Tooltip.VERSION',
        'Run, click the dropdown and close the alert',
      ],
      code: `<div class="alert alert-warning alert-dismissible fade show" role="alert">
  JS bundle loaded? Click X to close me.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
</div>

<div class="dropdown">
  <button class="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Menu</button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Profile</a></li>
    <li><a class="dropdown-item" href="#">Settings</a></li>
  </ul>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <div class="alert alert-warning alert-dismissible fade show" role="alert">
    JS bundle loaded? Click <strong>X</strong> to close me.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  <div class="dropdown">
    <button class="btn btn-dark dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Menu</button>
    <ul class="dropdown-menu">
      <li><a class="dropdown-item" href="#">Profile</a></li>
      <li><a class="dropdown-item" href="#">Settings</a></li>
      <li><hr class="dropdown-divider"></li>
      <li><a class="dropdown-item text-danger" href="#">Logout</a></li>
    </ul>
  </div>
  <p class="mt-4 small text-muted" id="ver"></p>
</div>`,
        js: `const ok = typeof bootstrap !== 'undefined';
const msg = ok ? 'Bootstrap JS loaded, version ' + bootstrap.Tooltip.VERSION : 'Bootstrap JS NOT loaded';
document.getElementById('ver').textContent = msg;
console.log(msg);`,
      },
      result: 'Clicking Menu opens a dropdown list; clicking X fades out the alert. The console prints "Bootstrap JS loaded, version 5.3.3".',
      explanation: 'The data-bs-* attributes are the "data API": the bundle scans for them and wires up behaviour automatically, so no JS is needed. The global `bootstrap` object exposes each component class (Modal, Tooltip, Dropdown...) with a static VERSION.',
    },
    {
      title: 'Overriding Bootstrap with Custom CSS',
      scenario: 'Your brand colour is purple. Change the primary button colour without editing Bootstrap files.',
      steps: [
        'Add a normal btn-primary button',
        'Add a second button with an extra class btn-brand',
        'In custom CSS set Bootstrap button CSS variables on .btn-brand',
        'Run and hover both buttons',
      ],
      code: `.btn-brand {
  --bs-btn-bg: #6f42c1;
  --bs-btn-border-color: #6f42c1;
  --bs-btn-hover-bg: #59359a;
  --bs-btn-hover-border-color: #59359a;
  --bs-btn-color: #fff;
  --bs-btn-hover-color: #fff;
}`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-5 text-center">
  <button class="btn btn-primary me-2">Default primary</button>
  <button class="btn btn-primary btn-brand">Brand purple</button>
</div>`,
        css: `.btn-brand {
  --bs-btn-bg: #6f42c1;
  --bs-btn-border-color: #6f42c1;
  --bs-btn-hover-bg: #59359a;
  --bs-btn-hover-border-color: #59359a;
  --bs-btn-active-bg: #4a2c80;
  --bs-btn-color: #fff;
  --bs-btn-hover-color: #fff;
}`,
      },
      result: 'The first button is Bootstrap blue; the second is purple and darkens on hover.',
      explanation: 'Every Bootstrap 5.3 button reads its colours from local CSS variables (`--bs-btn-bg` etc.). Re-defining those variables on your own class changes all states cleanly, without !important and without fighting specificity.',
    },
  ],
  interview: [
    { q: 'What is Bootstrap?', a: 'Bootstrap is an open-source front-end framework (HTML, CSS and JS) for building responsive, mobile-first websites. It provides a grid system, pre-styled components (buttons, cards, navbars, modals) and utility classes.', level: 'Easy' },
    { q: 'What are the main differences between Bootstrap 4 and Bootstrap 5?', a: 'Bootstrap 5 dropped jQuery (vanilla JS), dropped IE support, added the xxl breakpoint, utilities API, CSS custom properties, offcanvas, floating labels, RTL support, renamed left/right utilities to start/end (ml-* → ms-*), and data attributes are namespaced (data-toggle → data-bs-toggle). 5.3 added color modes.', level: 'Medium' },
    { q: 'What is the difference between bootstrap.min.js and bootstrap.bundle.min.js?', a: 'The bundle includes Popper.js, which dropdowns, tooltips and popovers need for positioning. bootstrap.min.js does not, so you must load Popper separately before it.', level: 'Easy' },
    { q: 'Why is the viewport meta tag important in Bootstrap?', a: 'Without `<meta name="viewport" content="width=device-width, initial-scale=1">` mobile browsers render the page at a virtual desktop width and zoom out, so media queries for small screens never apply and the responsive layout breaks.', level: 'Easy' },
    { q: 'What does "mobile-first" mean in Bootstrap?', a: 'Base styles are written for the smallest screens and min-width media queries add changes for larger breakpoints. E.g. `col-12 col-md-6` is full width on phones and half width from md (768px) up.', level: 'Easy' },
    { q: 'What is a CDN and why use it for Bootstrap?', a: 'A Content Delivery Network serves files from servers close to the user. It needs no build setup, is fast and may already be cached. Downsides: depends on a third party and internet access; npm is preferred in build-tool projects.', level: 'Easy' },
    { q: 'What are the integrity and crossorigin attributes in the CDN link?', a: 'integrity holds a Subresource Integrity hash; the browser refuses the file if its hash differs (protection against tampered CDN files). crossorigin="anonymous" makes the request CORS-enabled without credentials, which SRI requires.', level: 'Medium' },
    { q: 'How do you install and use Bootstrap with npm?', a: '`npm install bootstrap`, then in your entry file `import "bootstrap/dist/css/bootstrap.min.css"` and `import * as bootstrap from "bootstrap"` (or import individual components). With Sass you can import `bootstrap/scss/bootstrap` after overriding variables.', level: 'Medium' },
    { q: 'How do you override Bootstrap styles correctly?', a: 'Load your CSS after Bootstrap, use classes with equal or higher specificity, override CSS variables (e.g. --bs-primary, --bs-btn-bg), or customise Sass variables and recompile. Avoid editing the Bootstrap source and avoid overusing !important.', level: 'Medium' },
    { q: 'What is Reboot in Bootstrap?', a: 'Reboot is Bootstrap\'s element-level reset built on Normalize.css. It sets box-sizing: border-box, a native system font stack, removes margin-top on headings, and normalises forms, tables and lists across browsers.', level: 'Medium' },
    { q: 'Bootstrap vs Tailwind CSS?', a: 'Bootstrap provides pre-built components plus utilities and is quickest for standard UIs. Tailwind is utility-first with no ready components, offering more design freedom and smaller builds via purging, but more classes per element. Choice depends on design uniqueness and team familiarity.', level: 'Medium' },
    { q: 'Does Bootstrap 5 need jQuery? Can you still use jQuery with it?', a: 'No, Bootstrap 5 is pure vanilla JS. If jQuery is present on the page, Bootstrap 5 still registers jQuery plugins (e.g. $(el).modal()) for compatibility, but it is not required.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create the official Bootstrap 5.3 starter template from memory with a "Hello, Bootstrap!" heading styled with text-primary.',
      hint: 'doctype, lang, charset, viewport, CSS link in head, bundle script before </body>.',
      solution: `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Starter</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
  <h1 class="text-primary text-center mt-5">Hello, Bootstrap!</h1>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`,
    },
    {
      task: 'Build a "Coming Soon" page: centred heading, a lead paragraph and a dark button, with large top padding.',
      hint: 'container, text-center, py-5, display-4, lead, btn btn-dark.',
      solution: `<div class="container text-center py-5">
  <h1 class="display-4 fw-bold">Coming Soon</h1>
  <p class="lead text-secondary">Our new store opens next month. Stay tuned!</p>
  <button class="btn btn-dark btn-lg">Notify me</button>
</div>`,
    },
    {
      task: 'Set up Bootstrap in a Vite project with npm and log the Bootstrap version in the console.',
      hint: 'npm install bootstrap; import CSS and JS in main.js; Tooltip.VERSION.',
      solution: `# terminal
npm create vite@latest bs-app -- --template vanilla
cd bs-app
npm install
npm install bootstrap@5.3.3

// src/main.js
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';
document.querySelector('#app').innerHTML = '<h1 class="text-success p-4">Bootstrap via npm</h1>';
console.log('Bootstrap', bootstrap.Tooltip.VERSION);`,
    },
    {
      task: 'Create three buttons (primary, success, danger) and change only the success button to a custom teal (#20c997) using CSS variables.',
      hint: 'Add a class like btn-teal and set --bs-btn-bg and --bs-btn-border-color.',
      solution: `<button class="btn btn-primary">Save</button>
<button class="btn btn-success btn-teal">Approve</button>
<button class="btn btn-danger">Delete</button>
<style>
.btn-teal {
  --bs-btn-bg: #20c997; --bs-btn-border-color: #20c997;
  --bs-btn-hover-bg: #199d76; --bs-btn-hover-border-color: #199d76;
}
</style>`,
    },
    {
      task: 'Write a short note (as HTML) comparing CDN vs npm setup in a Bootstrap table with two columns.',
      hint: 'table table-bordered, thead, tbody.',
      solution: `<table class="table table-bordered">
  <thead><tr><th>CDN</th><th>npm</th></tr></thead>
  <tbody>
    <tr><td>No build step</td><td>Needs a bundler (Vite/Webpack)</td></tr>
    <tr><td>Needs internet</td><td>Works offline</td></tr>
    <tr><td>Cannot customise Sass</td><td>Full Sass customisation</td></tr>
  </tbody>
</table>`,
    },
  ],
  quiz: [
    { question: 'Which file must you include for dropdowns and tooltips to work without loading Popper separately?', options: ['bootstrap.min.css', 'bootstrap.min.js', 'bootstrap.bundle.min.js', 'popper.css'], answer: 2, explanation: 'The bundle contains Popper.js plus all Bootstrap components.' },
    { question: 'Which meta tag makes Bootstrap layouts respond correctly on phones?', options: ['<meta name="viewport" content="width=device-width, initial-scale=1">', '<meta charset="utf-8">', '<meta name="description">', '<meta http-equiv="X-UA-Compatible">'], answer: 0, explanation: 'The viewport tag tells mobile browsers to use the real device width.' },
    { question: 'Bootstrap 5 depends on which library?', options: ['jQuery', 'Lodash', 'React', 'None for core components (Popper only for positioning)'], answer: 3, explanation: 'Bootstrap 5 removed jQuery; only Popper is needed and it is in the bundle.' },
    { question: 'Where should your custom stylesheet link be placed?', options: ['Before the Bootstrap CSS link', 'After the Bootstrap CSS link', 'At the end of body', 'Inside the script tag'], answer: 1, explanation: 'Later rules with equal specificity win, so your CSS must come after Bootstrap.' },
    { question: 'In Bootstrap 5, the attribute that triggers a component via the data API is:', options: ['data-toggle', 'bs-toggle', 'data-bs-toggle', 'toggle-bs'], answer: 2, explanation: 'Bootstrap 5 namespaces data attributes with data-bs-.' },
  ],
};
