export default {
  id: 'day-07-navbar-navs-tabs-breadcrumbs-pagination',
  title: 'Navbar and Navs/Tabs, Breadcrumbs, Pagination',
  module: 'Module 2: Components',
  day: 7,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Build the navigation layer of a website: responsive collapsing navbars with brand, links, dropdowns and search, nav tabs and pills with switchable panes, breadcrumbs for location and pagination for long lists.',
  objectives: [
    'Build a responsive navbar with navbar-expand-*, brand, toggler and collapse',
    'Add dropdowns, a search form and dark/light themes to a navbar; make it fixed or sticky',
    'Create nav tabs and pills, and switch content with tab panes via data-bs-toggle="tab"',
    'Add accessible breadcrumbs and pagination, and drive pagination from JavaScript',
  ],
  theory: [
    {
      heading: 'Navbar Anatomy',
      content: 'A navbar is the top navigation bar. Its key parts:\n\n- `<nav class="navbar navbar-expand-lg">` – **navbar-expand-{bp}** says from which breakpoint the menu is shown horizontally; below it, it collapses behind a hamburger button\n- `.container` or `.container-fluid` inside to align content\n- `.navbar-brand` – logo/site name\n- `.navbar-toggler` – the hamburger button with `data-bs-toggle="collapse"` and `data-bs-target="#id"`\n- `.collapse .navbar-collapse` with the matching **id** – the part that hides on small screens\n- `.navbar-nav` (a `<ul>`) with `.nav-item` and `.nav-link`; mark the current page with `.active` and `aria-current="page"`\n- Optional: `.navbar-text`, a `<form class="d-flex">`, dropdowns\n\nAnalogy: the navbar is a folding shop shutter. On a wide street (desktop) it is fully open; on a narrow lane (mobile) it folds up and you press a button to open it.',
      syntax: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <a class="navbar-brand" href="#">Brand</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav"
            aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">About</a></li>
      </ul>
    </div>
  </div>
</nav>`,
      tip: 'If the hamburger does nothing, check: (1) the bundle JS is loaded, (2) data-bs-target="#mainNav" matches the collapse id exactly, (3) you used data-bs-* (Bootstrap 5), not data-toggle (Bootstrap 4).',
    },
    {
      heading: 'Navbar Colours, Placement and Extras',
      content: '- **Colour**: in 5.3 use a background like `.bg-body-tertiary`, `.bg-dark`, `.bg-primary`, and add `data-bs-theme="dark"` for light text on dark backgrounds (`.navbar-dark` is deprecated)\n- **Placement**: `.fixed-top` (stays at top, add body padding-top to avoid hiding content), `.fixed-bottom`, `.sticky-top` (scrolls until it reaches the top, then sticks)\n- **Alignment**: `.ms-auto` on `.navbar-nav` pushes links to the right; `.me-auto` pushes what follows to the right\n- **Dropdown** in a navbar: `<li class="nav-item dropdown">` with `.nav-link.dropdown-toggle` and `data-bs-toggle="dropdown"`\n- **Scrolling nav**: `.navbar-nav-scroll` limits collapsed height with scroll\n- **Offcanvas navbar**: replace collapse with an offcanvas (Day 11)',
    },
    {
      heading: 'Navs: Base, Tabs, Pills and Underline',
      content: 'The `.nav` component is a lightweight flex list of links:\n\n- `.nav-tabs` – folder-tab look\n- `.nav-pills` – rounded active background\n- `.nav-underline` (5.3) – underline on active item\n- Alignment: `.justify-content-center`, `.justify-content-end`, `.flex-column` (vertical)\n- Fill: `.nav-fill` (items fill space, proportional) and `.nav-justified` (equal widths)\n- Disabled: `.nav-link.disabled` with `aria-disabled="true"`\n\nA nav can be a `<ul>` or a `<nav>` with direct `<a class="nav-link">` children.',
    },
    {
      heading: 'Tabs with Content Panes (JavaScript Tab component)',
      content: 'To switch content without reloading:\n\n1. Buttons in the nav get `data-bs-toggle="tab"` (or `"pill"`) and `data-bs-target="#paneId"`, plus `role="tab"`, `aria-controls`, `aria-selected`\n2. Content goes in `<div class="tab-content">` with children `.tab-pane` (`role="tabpanel"`, matching ids)\n3. The initially visible pane has `.show .active`; add `.fade` for a fade animation\n\nJS API: `bootstrap.Tab.getOrCreateInstance(triggerEl).show()`. Events: `show.bs.tab`, `shown.bs.tab` (event.target = new tab, event.relatedTarget = previous tab).',
      tip: 'Use <button> elements for tab triggers (not <a href="#">) so the page does not jump and keyboard users get correct semantics.',
    },
    {
      heading: 'Breadcrumbs',
      content: 'Breadcrumbs show the user where they are in a hierarchy (Home / Products / Laptops).\n\n```\n<nav aria-label="breadcrumb">\n  <ol class="breadcrumb">\n    <li class="breadcrumb-item"><a href="#">Home</a></li>\n    <li class="breadcrumb-item active" aria-current="page">Laptops</li>\n  </ol>\n</nav>\n```\n\nChange the separator with the CSS variable: `style="--bs-breadcrumb-divider: \'>\';"`. Breadcrumbs are purely CSS.',
    },
    {
      heading: 'Pagination',
      content: 'Pagination splits long lists into pages:\n\n- `<nav aria-label="..."><ul class="pagination">` with `.page-item` and `.page-link`\n- Current page: `.active` on `.page-item` + `aria-current="page"` on the link\n- Disabled (e.g. Previous on page 1): `.disabled` on `.page-item`\n- Sizes: `.pagination-lg`, `.pagination-sm`\n- Alignment: `.justify-content-center` / `-end` on the `ul`\n\nPagination is CSS only; the logic of which items to show is your JavaScript or server code.',
      points: [
        'Tabs, collapse and dropdowns need the JS bundle; navs, breadcrumbs and pagination are CSS only',
        'Use aria-current="page" to mark the current link in navbars, breadcrumbs and pagination',
        'Coming next (Day 8): cards, list groups, images and Bootstrap Icons',
      ],
    },
  ],
  examples: [
    {
      title: 'Responsive Dark Navbar with Dropdown and Search',
      scenario: 'Create the main site navbar for an online store: collapses into a hamburger below md, has a Categories dropdown and a search form.',
      steps: [
        'Create nav.navbar.navbar-expand-md.bg-dark with data-bs-theme="dark"',
        'Add brand, toggler (data-bs-target="#storeNav") and the collapse div with id storeNav',
        'Add nav items, one with a dropdown',
        'Add a d-flex search form; resize the preview below 768px and click the hamburger',
      ],
      code: `<nav class="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">ShopKart</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#storeNav"
            aria-controls="storeNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="storeNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Categories</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Mobiles</a></li>
            <li><a class="dropdown-item" href="#">Laptops</a></li>
          </ul>
        </li>
      </ul>
      <form class="d-flex" role="search">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-light" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>`,
      playground: {
        libs: ['bootstrap'],
        html: `<nav class="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
  <div class="container-fluid">
    <a class="navbar-brand fw-bold" href="#">ShopKart</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#storeNav"
            aria-controls="storeNav" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="storeNav">
      <ul class="navbar-nav me-auto mb-2 mb-md-0">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Deals</a></li>
        <li class="nav-item dropdown">
          <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">Categories</a>
          <ul class="dropdown-menu">
            <li><a class="dropdown-item" href="#">Mobiles</a></li>
            <li><a class="dropdown-item" href="#">Laptops</a></li>
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item" href="#">All categories</a></li>
          </ul>
        </li>
        <li class="nav-item"><a class="nav-link disabled" aria-disabled="true">Coming soon</a></li>
      </ul>
      <form class="d-flex" role="search" onsubmit="event.preventDefault(); console.log('Search:', this.q.value)">
        <input name="q" class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-light" type="submit">Search</button>
      </form>
    </div>
  </div>
</nav>
<div class="container py-4"><p>Resize the preview below 768px to see the hamburger menu.</p></div>`,
        js: `document.getElementById('storeNav').addEventListener('shown.bs.collapse', function () { console.log('Menu opened'); });
document.getElementById('storeNav').addEventListener('hidden.bs.collapse', function () { console.log('Menu closed'); });`,
      },
      result: 'A dark navbar with brand, links, a Categories dropdown and a search box. Below 768px the links collapse behind a hamburger icon that slides the menu open/closed (console logs Menu opened/closed).',
      explanation: 'navbar-expand-md shows the horizontal menu from md upwards. The toggler\'s data-bs-target points at the collapse id; the Collapse plugin animates its height. data-bs-theme="dark" switches the navbar to light text and a light toggler icon.',
    },
    {
      title: 'Tabs and Pills with Content Panes',
      scenario: 'A product page with Description / Specifications / Reviews tabs, plus a vertical pills settings menu.',
      steps: [
        'Create ul.nav.nav-tabs with buttons using data-bs-toggle="tab" and data-bs-target',
        'Create .tab-content with three .tab-pane.fade elements; the first has show active',
        'Log the active tab on shown.bs.tab',
        'Repeat with d-flex + nav-pills flex-column for vertical tabs',
      ],
      code: `<ul class="nav nav-tabs" role="tablist">
  <li class="nav-item" role="presentation">
    <button class="nav-link active" data-bs-toggle="tab" data-bs-target="#desc" type="button" role="tab" aria-controls="desc" aria-selected="true">Description</button>
  </li>
  <li class="nav-item" role="presentation">
    <button class="nav-link" data-bs-toggle="tab" data-bs-target="#specs" type="button" role="tab" aria-controls="specs" aria-selected="false">Specifications</button>
  </li>
</ul>
<div class="tab-content border border-top-0 p-3">
  <div class="tab-pane fade show active" id="desc" role="tabpanel">...</div>
  <div class="tab-pane fade" id="specs" role="tabpanel">...</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <ul class="nav nav-tabs" id="prodTabs" role="tablist">
    <li class="nav-item" role="presentation"><button class="nav-link active" id="desc-tab" data-bs-toggle="tab" data-bs-target="#desc" type="button" role="tab" aria-controls="desc" aria-selected="true">Description</button></li>
    <li class="nav-item" role="presentation"><button class="nav-link" id="specs-tab" data-bs-toggle="tab" data-bs-target="#specs" type="button" role="tab" aria-controls="specs" aria-selected="false">Specifications</button></li>
    <li class="nav-item" role="presentation"><button class="nav-link" id="rev-tab" data-bs-toggle="tab" data-bs-target="#rev" type="button" role="tab" aria-controls="rev" aria-selected="false">Reviews <span class="badge text-bg-secondary">3</span></button></li>
  </ul>
  <div class="tab-content border border-top-0 rounded-bottom p-3 mb-4">
    <div class="tab-pane fade show active" id="desc" role="tabpanel" aria-labelledby="desc-tab">Lightweight 14-inch laptop with all-day battery.</div>
    <div class="tab-pane fade" id="specs" role="tabpanel" aria-labelledby="specs-tab"><ul class="mb-0"><li>16 GB RAM</li><li>512 GB SSD</li><li>1.2 kg</li></ul></div>
    <div class="tab-pane fade" id="rev" role="tabpanel" aria-labelledby="rev-tab">"Great value!" – Ravi</div>
  </div>
  <div class="d-flex align-items-start gap-3">
    <div class="nav flex-column nav-pills" role="tablist" aria-orientation="vertical">
      <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#p-profile" type="button" role="tab">Profile</button>
      <button class="nav-link" data-bs-toggle="pill" data-bs-target="#p-security" type="button" role="tab">Security</button>
      <button class="nav-link" data-bs-toggle="pill" data-bs-target="#p-billing" type="button" role="tab">Billing</button>
    </div>
    <div class="tab-content flex-grow-1 border rounded p-3">
      <div class="tab-pane fade show active" id="p-profile" role="tabpanel">Edit your name and photo.</div>
      <div class="tab-pane fade" id="p-security" role="tabpanel">Change password, enable 2FA.</div>
      <div class="tab-pane fade" id="p-billing" role="tabpanel">Manage cards and invoices.</div>
    </div>
  </div>
  <ul class="nav nav-underline mt-4">
    <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Underline</a></li>
    <li class="nav-item"><a class="nav-link" href="#">Nav</a></li>
    <li class="nav-item"><a class="nav-link" href="#">5.3</a></li>
  </ul>
</div>`,
        js: `document.querySelectorAll('[data-bs-toggle="tab"], [data-bs-toggle="pill"]').forEach(function (btn) {
  btn.addEventListener('shown.bs.tab', function (e) {
    console.log('Now showing:', e.target.textContent.trim(), '| previous:', e.relatedTarget ? e.relatedTarget.textContent.trim() : '-');
  });
});`,
      },
      result: 'Clicking each tab fades in its pane (console logs current and previous tab). Vertical pills on the left switch the settings panel. An underline nav is shown at the bottom.',
      explanation: 'The Tab plugin removes .active/.show from the old trigger and pane and adds them to the new ones, updating aria-selected. shown.bs.tab fires after the transition, with relatedTarget as the previous tab.',
    },
    {
      title: 'Breadcrumbs with Custom Divider',
      scenario: 'Show the user\'s location on a product detail page, with default "/" and custom ">" separators.',
      steps: [
        'Wrap an ol.breadcrumb inside nav aria-label="breadcrumb"',
        'Mark the last item active with aria-current="page"',
        'Create a second breadcrumb with --bs-breadcrumb-divider: \'>\'',
        'Run',
      ],
      code: `<nav aria-label="breadcrumb">
  <ol class="breadcrumb">
    <li class="breadcrumb-item"><a href="#">Home</a></li>
    <li class="breadcrumb-item"><a href="#">Electronics</a></li>
    <li class="breadcrumb-item active" aria-current="page">Laptops</li>
  </ol>
</nav>
<nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">...</nav>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <nav aria-label="breadcrumb">
    <ol class="breadcrumb">
      <li class="breadcrumb-item"><a href="#">Home</a></li>
      <li class="breadcrumb-item"><a href="#">Electronics</a></li>
      <li class="breadcrumb-item active" aria-current="page">Laptops</li>
    </ol>
  </nav>
  <nav style="--bs-breadcrumb-divider: '>';" aria-label="breadcrumb">
    <ol class="breadcrumb bg-body-tertiary p-2 rounded">
      <li class="breadcrumb-item"><a href="#" class="link-secondary">Dashboard</a></li>
      <li class="breadcrumb-item"><a href="#" class="link-secondary">Users</a></li>
      <li class="breadcrumb-item active" aria-current="page">Edit user</li>
    </ol>
  </nav>
</div>`,
      },
      result: 'Two breadcrumb trails: "Home / Electronics / Laptops" and a grey-boxed "Dashboard > Users > Edit user", with the last item not clickable.',
      explanation: 'The separator is generated with ::before content from --bs-breadcrumb-divider, so it is not read as text in the HTML. aria-current tells assistive tech which page is current.',
    },
    {
      title: 'Working Pagination Driven by JavaScript',
      scenario: 'Display 23 students 5 per page with Previous/Next and numbered page buttons that update the list.',
      steps: [
        'Create an empty ul.list-group and an empty ul.pagination',
        'Write render(page) to slice the data and rebuild the pagination items',
        'Disable Previous on page 1 and Next on the last page',
        'Use event delegation on the pagination to change pages',
      ],
      code: `<nav aria-label="Students pages">
  <ul class="pagination justify-content-center">
    <li class="page-item disabled"><a class="page-link">Previous</a></li>
    <li class="page-item active"><a class="page-link" href="#" aria-current="page">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:520px">
  <ul class="list-group mb-3" id="list"></ul>
  <nav aria-label="Students pages">
    <ul class="pagination justify-content-center" id="pager"></ul>
  </nav>
  <nav aria-label="Small example"><ul class="pagination pagination-sm justify-content-center">
    <li class="page-item active" aria-current="page"><span class="page-link">1</span></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
  </ul></nav>
</div>`,
        js: `const students = Array.from({ length: 23 }, function (_, i) { return 'Student ' + (i + 1); });
const perPage = 5;
const pages = Math.ceil(students.length / perPage);
let current = 1;
function item(label, page, opts) {
  opts = opts || {};
  const cls = 'page-item' + (opts.active ? ' active' : '') + (opts.disabled ? ' disabled' : '');
  const aria = opts.active ? ' aria-current="page"' : '';
  return '<li class="' + cls + '"><a class="page-link" href="#" data-page="' + page + '"' + aria + '>' + label + '</a></li>';
}
function render(page) {
  current = page;
  document.getElementById('list').innerHTML = students.slice((page - 1) * perPage, page * perPage)
    .map(function (s) { return '<li class="list-group-item">' + s + '</li>'; }).join('');
  let html = item('&laquo; Prev', page - 1, { disabled: page === 1 });
  for (let p = 1; p <= pages; p++) html += item(p, p, { active: p === page });
  html += item('Next &raquo;', page + 1, { disabled: page === pages });
  document.getElementById('pager').innerHTML = html;
  console.log('Page', page, 'of', pages);
}
document.getElementById('pager').addEventListener('click', function (e) {
  const a = e.target.closest('a[data-page]');
  if (!a) return;
  e.preventDefault();
  const p = Number(a.dataset.page);
  if (p >= 1 && p <= pages && p !== current) render(p);
});
render(1);`,
      },
      result: 'A list of 5 students with pagination "« Prev 1 2 3 4 5 Next »". Clicking numbers or Next changes the list; Prev is disabled on page 1 and Next on page 5 (which shows 3 students).',
      explanation: 'Bootstrap only styles pagination (.active, .disabled pointer-events none). The JS slices the array and regenerates items. Event delegation means one listener handles all dynamically created links.',
    },
  ],
  interview: [
    { q: 'What does navbar-expand-lg mean?', a: 'The navbar shows its full horizontal menu from the lg breakpoint (992px) up; below it, the .navbar-collapse content is hidden behind the toggler button.', level: 'Easy' },
    { q: 'Why is my navbar toggler not working?', a: 'Common causes: JS bundle not loaded, data-bs-target not matching the collapse id, using Bootstrap 4 attributes (data-toggle), or duplicate ids.', level: 'Medium' },
    { q: 'How do you create a dark navbar in Bootstrap 5.3?', a: 'Use a dark background (bg-dark or bg-primary) and add data-bs-theme="dark" to the nav. The older .navbar-dark class is deprecated in 5.3.', level: 'Medium' },
    { q: 'Difference between fixed-top and sticky-top?', a: 'fixed-top removes the navbar from normal flow and pins it to the viewport (content goes under it, so add body padding). sticky-top keeps it in flow and sticks only after scrolling to it.', level: 'Medium' },
    { q: 'How do you align navbar links to the right?', a: 'Add .ms-auto to the .navbar-nav (pushes it to the end in the flex container).', level: 'Easy' },
    { q: 'Difference between nav-tabs and nav-pills?', a: 'Both are styles of .nav: tabs look like folder tabs connected to content, pills have rounded filled backgrounds for the active link.', level: 'Easy' },
    { q: 'How do tab panes work in Bootstrap 5?', a: 'Triggers have data-bs-toggle="tab" and data-bs-target="#pane". Panes are .tab-pane inside .tab-content. The Tab plugin toggles .active/.show and aria-selected; first pane has .show .active.', level: 'Medium' },
    { q: 'How do you show a specific tab with JavaScript?', a: 'bootstrap.Tab.getOrCreateInstance(document.querySelector("#specs-tab")).show();', level: 'Medium' },
    { q: 'How do you change the breadcrumb divider?', a: 'Set the CSS variable --bs-breadcrumb-divider on the nav/ol, e.g. style="--bs-breadcrumb-divider: \'>\';" or via Sass $breadcrumb-divider.', level: 'Medium' },
    { q: 'Does Bootstrap pagination handle page switching?', a: 'No. It only provides styling. Page changes must be implemented with server-side links or JavaScript that renders the correct data.', level: 'Easy' },
    { q: 'What ARIA attributes should pagination and breadcrumbs have?', a: 'Wrap them in <nav aria-label="..."> and mark the current item with aria-current="page". Disabled links should not be focusable.', level: 'Medium' },
    { q: 'Difference between nav-fill and nav-justified?', a: 'nav-fill makes items fill available space proportional to their content; nav-justified makes all items equal width.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a light navbar for a college site with brand left, links right (Home, Courses, Admissions, Contact), collapsing below lg.',
      hint: 'navbar-expand-lg bg-body-tertiary, ms-auto on navbar-nav.',
      solution: `<nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <a class="navbar-brand" href="#">ABC College</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#collegeNav" aria-controls="collegeNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="collegeNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Courses</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Admissions</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
      </ul>
    </div>
  </div>
</nav>`,
    },
    {
      task: 'Create a login/register switcher using nav-pills nav-justified with two panes containing forms.',
      hint: 'data-bs-toggle="pill", tab-content.',
      solution: `<ul class="nav nav-pills nav-justified mb-3" role="tablist">
  <li class="nav-item" role="presentation"><button class="nav-link active" data-bs-toggle="pill" data-bs-target="#login" type="button" role="tab">Login</button></li>
  <li class="nav-item" role="presentation"><button class="nav-link" data-bs-toggle="pill" data-bs-target="#register" type="button" role="tab">Register</button></li>
</ul>
<div class="tab-content">
  <div class="tab-pane fade show active" id="login" role="tabpanel"><input class="form-control mb-2" placeholder="Email"><button class="btn btn-primary w-100">Login</button></div>
  <div class="tab-pane fade" id="register" role="tabpanel"><input class="form-control mb-2" placeholder="Name"><input class="form-control mb-2" placeholder="Email"><button class="btn btn-success w-100">Create account</button></div>
</div>`,
    },
    {
      task: 'Write a function buildBreadcrumb(["Home","Blog","CSS","Flexbox"]) that renders a breadcrumb where all but the last are links.',
      hint: 'map with index check.',
      solution: `<nav aria-label="breadcrumb"><ol class="breadcrumb" id="bc"></ol></nav>
<script>
function buildBreadcrumb(parts) {
  document.getElementById('bc').innerHTML = parts.map((p, i) =>
    i === parts.length - 1
      ? '<li class="breadcrumb-item active" aria-current="page">' + p + '</li>'
      : '<li class="breadcrumb-item"><a href="#">' + p + '</a></li>'
  ).join('');
}
buildBreadcrumb(['Home', 'Blog', 'CSS', 'Flexbox']);
</script>`,
    },
    {
      task: 'Make a sticky-top navbar with a primary background and white text, and a long page below it to test scrolling.',
      hint: 'sticky-top bg-primary data-bs-theme="dark".',
      solution: `<nav class="navbar sticky-top bg-primary" data-bs-theme="dark">
  <div class="container"><a class="navbar-brand" href="#">Sticky Nav</a></div>
</nav>
<div class="container" style="height:2000px"><p class="mt-3">Scroll down...</p></div>`,
    },
    {
      task: 'Create a large, centred pagination with Previous disabled, page 1 active, pages 2–3 and Next.',
      hint: 'pagination pagination-lg justify-content-center.',
      solution: `<nav aria-label="Page navigation">
  <ul class="pagination pagination-lg justify-content-center">
    <li class="page-item disabled"><a class="page-link">Previous</a></li>
    <li class="page-item active"><a class="page-link" href="#" aria-current="page">1</a></li>
    <li class="page-item"><a class="page-link" href="#">2</a></li>
    <li class="page-item"><a class="page-link" href="#">3</a></li>
    <li class="page-item"><a class="page-link" href="#">Next</a></li>
  </ul>
</nav>`,
    },
  ],
  quiz: [
    { question: 'Which class goes on the element that hides on small screens in a navbar?', options: ['navbar-toggler', 'collapse navbar-collapse', 'navbar-nav', 'navbar-hide'], answer: 1, explanation: 'The .collapse.navbar-collapse div is toggled by the hamburger.' },
    { question: 'Which attribute value turns a button into a tab trigger?', options: ['data-bs-toggle="tab"', 'data-bs-tab="true"', 'role="tab" only', 'data-toggle="tab"'], answer: 0, explanation: 'Bootstrap 5 data API uses data-bs-toggle="tab" (or "pill").' },
    { question: 'Which classes should the initially visible fading tab pane have?', options: ['active', 'show', 'fade only', 'fade show active'], answer: 3, explanation: 'fade for animation, show for opacity, active for display.' },
    { question: 'Breadcrumb separators are produced by:', options: ['Text in the HTML', 'JavaScript', 'CSS ::before with --bs-breadcrumb-divider', 'Images'], answer: 2, explanation: 'Pure CSS pseudo-elements.' },
    { question: 'To pin a navbar to the top that stays in document flow until scrolled, use:', options: ['fixed-top', 'position-absolute', 'navbar-top', 'sticky-top'], answer: 3, explanation: 'sticky-top = position: sticky; top: 0.' },
  ],
};
