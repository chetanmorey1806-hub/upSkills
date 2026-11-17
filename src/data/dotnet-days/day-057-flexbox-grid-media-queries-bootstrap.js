const flexHtml = `<h4>justify-content: space-between; align-items: center</h4>
<div class="flex row1">
  <div class="item">A</div><div class="item tall">B (tall)</div><div class="item">C</div>
</div>
<h4>flex-wrap: wrap; gap: 10px; items grow with flex: 1 1 120px</h4>
<div class="flex row2">
  <div class="item grow">1</div><div class="item grow">2</div><div class="item grow">3</div>
  <div class="item grow">4</div><div class="item grow">5</div>
</div>
<h4>flex-direction: column; perfect centering</h4>
<div class="flex center-box">
  <div class="item">I am centred</div>
</div>`;

const flexCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
h4 { margin: 14px 0 4px; font-size: 14px; color: #334155; }
.flex { display: flex; border: 2px dashed #94a3b8; padding: 8px; }
.item { background: #6366f1; color: white; padding: 12px 16px; border-radius: 6px; }
.row1 { justify-content: space-between; align-items: center; height: 100px; }
.tall { height: 70px; }
.row2 { flex-wrap: wrap; gap: 10px; }
.grow { flex: 1 1 120px; text-align: center; }   /* grow, shrink, basis */
.center-box { height: 120px; flex-direction: column; justify-content: center; align-items: center; }`;

const gridHtml = `<div class="grid">
  <header>Header</header>
  <nav>Sidebar</nav>
  <main>Main content</main>
  <aside>Ads</aside>
  <footer>Footer</footer>
</div>
<h4>Auto-fit cards: resize the preview</h4>
<div class="cards">
  <div class="card">Card 1</div><div class="card">Card 2</div><div class="card">Card 3</div>
  <div class="card">Card 4</div><div class="card">Card 5</div><div class="card">Card 6</div>
</div>`;

const gridCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.grid {
  display: grid;
  grid-template-columns: 150px 1fr 120px;      /* 3 columns: fixed, flexible, fixed */
  grid-template-rows: 50px 160px 40px;
  grid-template-areas:
    "header header header"
    "nav    main   aside"
    "footer footer footer";
  gap: 8px;
}
.grid > * { padding: 10px; color: white; border-radius: 6px; }
header { grid-area: header; background: #1e3a8a; }
nav    { grid-area: nav;    background: #0f766e; }
main   { grid-area: main;   background: #7c3aed; }
aside  { grid-area: aside;  background: #b45309; }
footer { grid-area: footer; background: #334155; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; }
.card { background: #e0e7ff; padding: 24px; text-align: center; border-radius: 8px; }
.card:first-child { grid-column: span 2; background: #c7d2fe; }`;

const gridJs = `const cols = getComputedStyle(document.querySelector('.grid')).gridTemplateColumns;
console.log('grid columns: ' + cols.split(' ').length);
console.log('cards per row now: ' + getComputedStyle(document.querySelector('.cards')).gridTemplateColumns.split(' ').length);`;

const mqHtml = `<div class="banner">Resize the preview window</div>
<div class="products">
  <div class="p">Laptop</div><div class="p">Mouse</div><div class="p">Keyboard</div><div class="p">Monitor</div>
</div>
<p id="size"></p>`;

const mqCss = `/* Mobile-first: base styles are for small screens */
body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 10px; }
img { max-width: 100%; height: auto; }
.banner { padding: 16px; text-align: center; color: white; background: #dc2626; font-size: 18px; }
.products { display: grid; grid-template-columns: 1fr; gap: 10px; margin-top: 10px; }
.p { background: #f1f5f9; padding: 20px; border-radius: 6px; text-align: center; }

/* Tablet: 576px and wider */
@media (min-width: 576px) {
  .banner { background: #d97706; }
  .products { grid-template-columns: repeat(2, 1fr); }
}
/* Desktop: 992px and wider */
@media (min-width: 992px) {
  .banner { background: #16a34a; font-size: 24px; }
  .products { grid-template-columns: repeat(4, 1fr); }
}`;

const mqJs = `function show() {
  const w = window.innerWidth;
  const label = w >= 992 ? 'desktop (4 columns, green)' : w >= 576 ? 'tablet (2 columns, orange)' : 'mobile (1 column, red)';
  document.getElementById('size').textContent = 'Width: ' + w + 'px -> ' + label;
  console.log('Width: ' + w + 'px -> ' + label);
}
window.addEventListener('resize', show);
show();`;

const navHtml = `<header class="navbar">
  <a href="#" class="brand">Skyline<span>Academy</span></a>
  <button class="toggle" id="toggle" aria-label="Open menu" aria-expanded="false">&#9776;</button>
  <nav class="menu" id="menu">
    <a href="#" class="active">Home</a>
    <a href="#">Courses</a>
    <a href="#">Students</a>
    <a href="#">Contact</a>
    <a href="#" class="login">Login</a>
  </nav>
</header>
<main class="hero">
  <h1>Responsive Navbar</h1>
  <p>Wide screen: menu in one row. Below 768px: hamburger button opens a vertical menu.</p>
</main>`;

const navCss = `* { box-sizing: border-box; }
body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; }
.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  padding: 12px 20px;
  background: #0f172a;
}
.brand { color: white; font-size: 20px; font-weight: 700; text-decoration: none; }
.brand span { color: #38bdf8; }
.menu { display: flex; gap: 6px; align-items: center; }
.menu a { color: #cbd5e1; text-decoration: none; padding: 8px 12px; border-radius: 6px; }
.menu a:hover, .menu a.active { background: #1e293b; color: white; }
.menu .login { background: #0284c7; color: white; }
.toggle { display: none; background: none; border: 1px solid #475569; color: white; font-size: 22px; padding: 2px 10px; border-radius: 6px; cursor: pointer; }
.hero { padding: 40px 20px; text-align: center; }

/* Mobile and small tablets */
@media (max-width: 767.98px) {
  .toggle { display: block; }
  .menu {
    display: none;            /* hidden until the button is clicked */
    flex-direction: column;
    align-items: stretch;
    width: 100%;              /* forces the menu onto its own row (flex-wrap) */
    margin-top: 10px;
  }
  .menu.open { display: flex; }
}`;

const navJs = `const toggle = document.getElementById('toggle');
const menu = document.getElementById('menu');
toggle.addEventListener('click', function () {
  const isOpen = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(isOpen));
  console.log('menu open: ' + isOpen);
});`;

const bsHtml = `<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">

<nav class="navbar navbar-expand-md navbar-dark bg-primary">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">Skyline Academy</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
            aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Courses</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Students</a></li>
        <li class="nav-item"><a class="btn btn-light btn-sm ms-md-2 mt-2 mt-md-0" href="#">Login</a></li>
      </ul>
    </div>
  </div>
</nav>

<div class="container my-4">
  <div class="row g-3">
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm"><div class="card-body">
        <h5 class="card-title">C# Basics</h5><p class="card-text">15 days</p>
        <a href="#" class="btn btn-primary">Enroll</a></div></div>
    </div>
    <div class="col-12 col-md-6 col-lg-4">
      <div class="card h-100 shadow-sm"><div class="card-body">
        <h5 class="card-title">SQL Server</h5><p class="card-text">12 days</p>
        <a href="#" class="btn btn-success">Enroll</a></div></div>
    </div>
    <div class="col-12 col-md-12 col-lg-4">
      <div class="card h-100 shadow-sm"><div class="card-body">
        <h5 class="card-title">ASP.NET Core</h5><p class="card-text">15 days</p>
        <a href="#" class="btn btn-outline-primary">Enroll</a></div></div>
    </div>
  </div>
  <div class="d-flex justify-content-between align-items-center mt-3 p-3 bg-light border rounded">
    <span class="text-muted">Utility classes: d-flex, justify-content-between, p-3, mt-3</span>
    <span class="badge text-bg-danger">New</span>
  </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>`;

export default {
  id: 'day-057-flexbox-grid-media-queries-bootstrap',
  title: 'Flexbox, CSS Grid, Media Queries, Responsive Design and Bootstrap 5 Intro',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 57,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Lay out pages the modern way with Flexbox (one dimension) and CSS Grid (two dimensions), make them adapt to phones, tablets and desktops with the viewport meta tag and media queries, get a first look at Bootstrap 5 (the CSS framework already included in ASP.NET Core MVC templates), and build a responsive navbar.',
  objectives: [
    'Use flex container properties (direction, justify-content, align-items, wrap, gap) and flex item properties (flex-grow, flex-shrink, flex-basis)',
    'Create page layouts with grid-template-columns/rows, fr units, repeat(), minmax() and grid-template-areas',
    'Write mobile-first media queries with breakpoints and the viewport meta tag',
    'Use Bootstrap 5 containers, the 12-column grid, utilities and components',
    'Build a responsive navbar with a hamburger toggle, both by hand and with Bootstrap',
  ],
  theory: [
    {
      heading: 'Flexbox: the container',
      content: "`display: flex` on a parent makes its direct children **flex items** laid out along a **main axis** (row by default) and a **cross axis** (perpendicular).\n\n- `flex-direction`: `row` (default), `row-reverse`, `column`, `column-reverse`.\n- `justify-content` (main axis): `flex-start`, `center`, `flex-end`, `space-between`, `space-around`, `space-evenly`.\n- `align-items` (cross axis): `stretch` (default), `center`, `flex-start`, `flex-end`, `baseline`.\n- `flex-wrap: wrap`: let items move to the next line instead of shrinking.\n- `align-content`: spacing between wrapped lines.\n- `gap: 10px`: space between items (no margins needed).\n\nPerfect centering in 3 lines: `display:flex; justify-content:center; align-items:center;`",
      syntax: '.navbar {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  gap: 12px;\n}',
      tip: 'When flex-direction is column, the axes swap: justify-content becomes vertical and align-items horizontal.',
    },
    {
      heading: 'Flexbox: the items',
      content: "- `flex-grow`: share of EXTRA space an item takes (0 = do not grow).\n- `flex-shrink`: how much it shrinks when space is short (0 = never shrink).\n- `flex-basis`: starting size before growing/shrinking (`200px`, `25%`, `auto`).\n- Shorthand `flex: grow shrink basis`: `flex: 1` = `1 1 0%` (equal columns), `flex: 0 0 250px` = fixed 250px sidebar.\n- `order`: change visual order without changing HTML.\n- `align-self`: override align-items for one item.\n- `margin-left: auto` on one item pushes it (and everything after it) to the right end.",
    },
    {
      heading: 'CSS Grid',
      content: "`display: grid` builds rows AND columns at once (two-dimensional).\n- `grid-template-columns: 200px 1fr 1fr` : `fr` = fraction of the remaining space.\n- `repeat(3, 1fr)` = three equal columns.\n- `minmax(200px, 1fr)` : at least 200px, at most one fraction.\n- `repeat(auto-fit, minmax(200px, 1fr))` : as many columns as fit, a responsive card grid WITHOUT media queries.\n- `grid-template-rows`, `gap`, `row-gap`, `column-gap`.\n- Items: `grid-column: 1 / 3` (from line 1 to line 3) or `grid-column: span 2`; `grid-row: span 2`.\n- `grid-template-areas` with named areas + `grid-area: header` on items: draw the layout in text.\n\n**Flexbox vs Grid**: Flexbox for one row/column of items (navbar, toolbar, button group); Grid for full page layouts and card galleries. They are often combined.",
      syntax: '.page {\n  display: grid;\n  grid-template-columns: 220px 1fr;\n  grid-template-areas: "header header" "side main" "footer footer";\n  gap: 16px;\n}',
    },
    {
      heading: 'Responsive design and media queries',
      content: "Responsive design = one page that adapts to every screen size.\n1. **Viewport meta tag** (in every page's head; ASP.NET Core's _Layout.cshtml already has it): `<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">`. Without it phones zoom out and show a tiny desktop page.\n2. **Fluid sizes**: %, fr, rem, vw, `max-width: 100%` on images.\n3. **Media queries** apply CSS only when a condition is true.\n\n**Mobile-first**: write base CSS for phones, then add `min-width` queries for bigger screens (recommended, and what Bootstrap does). Desktop-first uses `max-width`.\n\nCommon breakpoints (Bootstrap 5): sm 576px, md 768px, lg 992px, xl 1200px, xxl 1400px.\n\nOther features: `orientation: landscape`, `prefers-color-scheme: dark`, `print`.",
      syntax: '/* phones first */\n.grid { grid-template-columns: 1fr; }\n@media (min-width: 768px) { .grid { grid-template-columns: repeat(2, 1fr); } }\n@media (min-width: 992px) { .grid { grid-template-columns: repeat(4, 1fr); } }',
      tip: 'Test with Chrome DevTools device toolbar: F12 then Ctrl+Shift+M, pick iPhone/iPad or drag the width.',
    },
    {
      heading: 'Bootstrap 5 introduction',
      content: "**Bootstrap** is the most popular CSS framework: ready-made responsive grid, utility classes and components. Every new ASP.NET Core MVC / Razor Pages project already includes it under `wwwroot/lib/bootstrap` and links it in `Views/Shared/_Layout.cshtml`, so you will use it on Days 66-77.\n\nAdd it to any page via CDN:\n`<link href=\"https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css\" rel=\"stylesheet\">` and before `</body>` `<script src=\".../bootstrap.bundle.min.js\"></script>` (needed for navbar toggle, dropdowns, modals).\n\n- **Layout**: `.container` (centred, max-width per breakpoint), `.container-fluid` (full width), `.row` + `.col-*`. The grid has **12 columns**: `col-12 col-md-6 col-lg-4` = full width on phones, half on tablets, one third on desktop. `g-3` sets gutters.\n- **Utilities**: spacing `m-*`/`p-*` (`mt-3`, `px-2`, `ms-auto`), `d-flex`, `justify-content-between`, `align-items-center`, `text-center`, `text-muted`, `bg-primary`, `fw-bold`, `rounded`, `shadow`, `d-none d-md-block` (responsive show/hide).\n- **Components**: `btn btn-primary`, `card`, `navbar`, `alert`, `badge`, `table table-striped`, `form-control`, `modal`.\n- Colour names: primary, secondary, success, danger, warning, info, light, dark.",
      tip: 'Bootstrap is built with Flexbox and media queries, exactly what you learned today. Knowing raw CSS lets you override it easily in site.css.',
    },
  ],
  examples: [
    {
      title: 'Flexbox playground',
      scenario: 'Practise the main flex properties: alignment, wrapping cards and centering.',
      steps: ['Create flex.html in VS Code', 'Make three .flex containers with child items', 'Apply justify-content, align-items, flex-wrap, gap and flex shorthand', 'Change the values in the CSS panel (e.g. space-evenly, flex-end) and watch the result'],
      code: flexCss,
      playground: { html: flexHtml, css: flexCss, js: '' },
      result: 'Row 1: A at the far left, B in the middle, C at the far right, all vertically centred. Row 2: five equal purple boxes that wrap to a second line when the preview is narrow, with 10px gaps. Row 3: one box perfectly centred horizontally and vertically.',
      explanation: 'space-between puts the free space between items. flex: 1 1 120px means each item starts at 120px, grows to fill extra space and wraps when less than 120px is available.',
    },
    {
      title: 'CSS Grid page layout and auto-fit cards',
      scenario: 'Draw a header/sidebar/main/ads/footer layout with named areas and a card gallery that adjusts its column count automatically.',
      steps: ['Create grid.html', 'Define grid-template-columns, rows and areas on .grid', 'Assign grid-area to each child', 'Add the .cards grid with repeat(auto-fit, minmax(140px, 1fr))', 'Resize the preview and read the console'],
      code: gridCss,
      playground: { html: gridHtml, css: gridCss, js: gridJs },
      result: 'A 3-column layout: blue header across the top, teal sidebar, purple main, brown ads, grey footer across the bottom. Below, cards in as many columns as fit (Card 1 spans two columns).\nConsole (preview about 700px wide):\ngrid columns: 3\ncards per row now: 4\n(The second number changes with the preview width.)',
      explanation: 'grid-template-areas lets you read the layout like a picture. auto-fit + minmax creates as many 140px+ columns as fit, then stretches them equally, so the gallery is responsive without any media query.',
    },
    {
      title: 'Mobile-first media queries',
      scenario: 'A product list that shows 1 column on phones, 2 on tablets and 4 on desktops, with a banner that changes colour at each breakpoint.',
      steps: ['Create responsive.html with the viewport meta tag in head', 'Write base (mobile) CSS first', 'Add @media (min-width: 576px) and (min-width: 992px) blocks', 'Open F12 > Ctrl+Shift+M and drag the width; or resize the preview'],
      code: '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n\n' + mqCss,
      playground: { html: mqHtml, css: mqCss, js: mqJs },
      result: 'Below 576px: red banner, 1 column. 576-991px: orange banner, 2 columns. 992px and wider: green larger banner, 4 columns. The text and console show e.g. "Width: 640px -> tablet (2 columns, orange)" and update while resizing.',
      explanation: 'Mobile-first: base rules serve phones; each min-width query adds changes for larger screens and later rules override earlier ones because they have equal specificity.',
    },
    {
      title: 'Project: Responsive navbar (pure CSS + small JS)',
      scenario: 'Day 57 task: a navbar with brand on the left and links on the right; below 768px the links hide behind a hamburger button.',
      steps: ['Create navbar.html with header.navbar, brand link, toggle button and nav.menu', 'Style .navbar with display:flex, justify-content: space-between, flex-wrap: wrap', 'Add a max-width: 767.98px media query that shows the toggle and stacks/hides the menu', 'Add a click listener that toggles the .open class (DOM events are covered on Day 61)', 'Resize the preview narrow and click the button'],
      code: '<!-- navbar.html -->\n' + navHtml + '\n\n/* navbar.css */\n' + navCss + '\n\n// navbar.js\n' + navJs,
      playground: { html: navHtml, css: navCss, js: navJs },
      result: 'Wide: dark bar with "SkylineAcademy" (Academy in light blue) on the left and Home, Courses, Students, Contact and a blue Login link on the right. Narrow (<768px): links disappear and a hamburger button appears; clicking it shows the links stacked vertically under the bar and logs "menu open: true", clicking again hides them ("menu open: false").',
      explanation: 'flex-wrap plus width: 100% on the menu pushes it onto its own line on mobile. Toggling a CSS class from JS keeps styling in CSS. aria-expanded tells screen readers whether the menu is open.',
    },
    {
      title: 'Bootstrap 5 responsive navbar and grid',
      scenario: 'Build the same navbar and a 3-card course row with Bootstrap classes only, the way ASP.NET Core MVC views are styled.',
      steps: ['Create bootstrap.html and add the Bootstrap 5 CSS link from the CDN', 'Paste the navbar markup with navbar-expand-md and a collapse div', 'Add a .container with .row g-3 and three col-12 col-md-6 col-lg-4 cards', 'Add bootstrap.bundle.min.js before </body> so the toggler works', 'Resize: 1 card per row on phones, 2 on tablets, 3 on desktop (internet connection needed for the CDN)'],
      code: bsHtml,
      playground: { html: bsHtml, css: '', js: '' },
      result: 'A blue Bootstrap navbar with "Skyline Academy" on the left and links plus a white Login button on the right; below 768px they collapse into a hamburger that slides the menu open. Three shadowed course cards with coloured Enroll buttons: stacked on phones, 2 + 1 on tablets, 3 in a row on desktop. A light box with grey text on the left and a red "New" badge on the right.',
      explanation: 'navbar-expand-md = expanded from md (768px) up, collapsed below. col-12 col-md-6 col-lg-4 means 12/12, 6/12 and 4/12 of the row at each breakpoint. ms-auto pushes the nav to the right (margin-start auto). No custom CSS was written.',
    },
  ],
  interview: [
    { q: 'Flexbox vs Grid: when do you use which?', a: 'Flexbox is one-dimensional (a row OR a column), ideal for navbars, toolbars, centering. Grid is two-dimensional (rows AND columns), ideal for page layouts and card galleries. They are often combined.', level: 'Easy' },
    { q: 'justify-content vs align-items?', a: 'justify-content aligns items along the main axis (horizontal in a row), align-items along the cross axis (vertical in a row). With flex-direction: column they swap.', level: 'Easy' },
    { q: 'What does flex: 1 mean?', a: 'flex: 1 1 0%: grow 1, shrink 1, basis 0, so all items with flex: 1 share the space equally.', level: 'Medium' },
    { q: 'How do you centre a div horizontally and vertically?', a: 'Parent: display: flex; justify-content: center; align-items: center; (or display: grid; place-items: center;).', level: 'Easy' },
    { q: 'What is the fr unit?', a: 'A fraction of the free space in a grid container. 1fr 2fr gives the second column twice the space of the first.', level: 'Medium' },
    { q: 'Explain repeat(auto-fit, minmax(200px, 1fr)).', a: 'Creates as many columns as fit with a minimum of 200px each, then stretches them equally to fill the row; a responsive grid without media queries.', level: 'Hard' },
    { q: 'Why is the viewport meta tag needed?', a: 'Without it mobile browsers render the page at about 980px width and zoom out. width=device-width makes the layout width equal to the device width so media queries work.', level: 'Medium' },
    { q: 'Mobile-first vs desktop-first?', a: 'Mobile-first writes base styles for small screens and adds min-width media queries for larger ones; desktop-first starts big and uses max-width queries. Mobile-first is recommended and used by Bootstrap.', level: 'Medium' },
    { q: 'How does the Bootstrap grid work?', a: '.container > .row > .col-*. Each row has 12 columns; classes like col-md-6 take 6/12 from the md breakpoint up. Below that breakpoint columns stack full width unless a smaller class (col-6) is given.', level: 'Medium' },
    { q: 'What are Bootstrap 5 breakpoints?', a: 'xs <576px (no infix), sm >=576px, md >=768px, lg >=992px, xl >=1200px, xxl >=1400px.', level: 'Medium' },
    { q: 'Where is Bootstrap in an ASP.NET Core MVC project?', a: 'In wwwroot/lib/bootstrap (installed by the template via LibMan), linked in Views/Shared/_Layout.cshtml together with site.css and bootstrap.bundle.min.js.', level: 'Medium' },
    { q: 'How do you hide an element on mobile but show it on desktop in Bootstrap?', a: 'class="d-none d-md-block" (hidden by default, displayed from md up). In plain CSS use a media query.', level: 'Easy' },
  ],
  practice: [
    { task: 'Create a footer with three equal columns using Flexbox that stack vertically below 600px.', hint: 'flex: 1 on children; media query switching flex-direction to column.', solution: '.footer { display: flex; gap: 20px; }\n.footer > div { flex: 1; }\n@media (max-width: 600px) { .footer { flex-direction: column; } }' },
    { task: 'Build a photo gallery with CSS Grid that shows as many 180px+ columns as fit.', hint: 'auto-fill/auto-fit + minmax.', solution: '.gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 10px; }\n.gallery img { width: 100%; height: 150px; object-fit: cover; border-radius: 6px; }' },
    { task: 'Make a dashboard layout with grid-template-areas: header on top, sidebar 220px on the left, main on the right, footer at the bottom; on screens below 768px put the sidebar under the header.', hint: 'Redefine grid-template-areas inside the media query.', solution: '.dash { display: grid; grid-template-columns: 220px 1fr; grid-template-areas: "h h" "s m" "f f"; gap: 10px; }\nheader { grid-area: h; } aside { grid-area: s; } main { grid-area: m; } footer { grid-area: f; }\n@media (max-width: 767.98px) { .dash { grid-template-columns: 1fr; grid-template-areas: "h" "s" "m" "f"; } }' },
    { task: 'Using Bootstrap 5, create a row of 4 student cards: 1 per row on phones, 2 on md, 4 on lg.', hint: 'col-12 col-md-6 col-lg-3.', solution: '<div class="container"><div class="row g-3">\n  <div class="col-12 col-md-6 col-lg-3"><div class="card"><div class="card-body">Riya</div></div></div>\n  <div class="col-12 col-md-6 col-lg-3"><div class="card"><div class="card-body">Arjun</div></div></div>\n  <div class="col-12 col-md-6 col-lg-3"><div class="card"><div class="card-body">Neha</div></div></div>\n  <div class="col-12 col-md-6 col-lg-3"><div class="card"><div class="card-body">Kabir</div></div></div>\n</div></div>' },
    { task: 'Add a "Logout" link that is pushed to the far right of a flex navbar while other links stay left.', hint: 'margin-left: auto.', solution: '.nav { display: flex; gap: 10px; }\n.nav .logout { margin-left: auto; }' },
  ],
  quiz: [
    { question: 'Which property lets flex items move to a new line?', options: ['flex-direction: column', 'flex-wrap: wrap', 'align-content: wrap', 'display: inline-flex'], answer: 1, explanation: 'flex-wrap: wrap allows multiple lines.' },
    { question: 'grid-template-columns: 1fr 2fr 1fr in a 800px wide grid (no gap). Width of the middle column?', options: ['200px', '266px', '400px', '600px'], answer: 2, explanation: '4 fractions: 800 / 4 = 200; the middle takes 2 fractions = 400px.' },
    { question: 'Which media query targets screens 768px and wider?', options: ['@media (max-width: 768px)', '@media (width < 768px)', '@media screen and (orientation: portrait)', '@media (min-width: 768px)'], answer: 3, explanation: 'min-width: 768px is true from 768px upwards.' },
    { question: 'In Bootstrap, how many columns does a row have?', options: ['12', '10', '16', '24'], answer: 0, explanation: 'The Bootstrap grid is based on 12 columns.' },
    { question: 'In flex-direction: row, which property centres items vertically?', options: ['justify-content: center', 'text-align: center', 'align-items: center', 'vertical-align: middle'], answer: 2, explanation: 'align-items works on the cross axis, which is vertical for a row.' },
  ],
};
