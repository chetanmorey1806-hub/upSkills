export default {
  id: 'day-12-carousel-accordion-collapse-dropdowns-tables',
  title: 'Carousel, Accordion, Collapse, Dropdowns and Tables',
  module: 'Module 2: Components',
  day: 12,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Finish the component tour: image carousels with indicators and captions, collapse panels and accordions for FAQs, dropdown menus with all their options, and styled responsive data tables.',
  objectives: [
    'Build a carousel with controls, indicators, captions, fade and auto-play options, and control it from JS',
    'Show/hide content with Collapse and build accordions (normal, flush, always-open)',
    'Create dropdowns with headers, dividers, forms, directions, alignment and auto-close behaviour',
    'Style tables with striped, hover, bordered, small, contextual rows and responsive wrappers',
  ],
  theory: [
    {
      heading: 'Carousel',
      content: 'A **carousel** is a slideshow that cycles through images or content.\n\n```\n.carousel.slide#id (data-bs-ride="carousel" to auto-play on load)\n  .carousel-indicators  (buttons with data-bs-target + data-bs-slide-to)\n  .carousel-inner\n    .carousel-item.active  (exactly ONE active)\n      img.d-block.w-100\n      .carousel-caption.d-none.d-md-block\n  button.carousel-control-prev (data-bs-slide="prev")\n  button.carousel-control-next (data-bs-slide="next")\n```\n\nOptions:\n- `.carousel-fade` – crossfade instead of slide\n- `data-bs-interval="3000"` on the carousel or individual items (ms); `false` to stop auto cycling\n- `data-bs-ride="carousel"` (auto-play immediately) vs `"true"` (start after first interaction)\n- `data-bs-pause="hover"` (default), `data-bs-wrap="false"`, `data-bs-touch="false"`\n- `.carousel-dark` was deprecated in 5.3; use `data-bs-theme="dark"` on the carousel\n\nJS: `bootstrap.Carousel.getOrCreateInstance(el).next() / prev() / to(2) / pause() / cycle()`; event `slid.bs.carousel` (event.to, event.from).',
      tip: 'If the carousel shows nothing, check that exactly one .carousel-item has .active. Use images of the same aspect ratio (or object-fit-cover with fixed height) to stop the height jumping.',
    },
    {
      heading: 'Collapse',
      content: '**Collapse** shows and hides content with a height animation.\n\n- Trigger: `<button data-bs-toggle="collapse" data-bs-target="#more" aria-expanded="false" aria-controls="more">` (or `<a href="#more">`)\n- Content: `<div class="collapse" id="more">` (add `.show` to start open)\n- Horizontal: `.collapse-horizontal` (child needs a width)\n- One trigger for many targets: `data-bs-target=".multi"` (a class selector)\n- JS: `bootstrap.Collapse.getOrCreateInstance(el, { toggle: false }).show()`\n- Events: `show.bs.collapse`, `shown.bs.collapse`, `hide.bs.collapse`, `hidden.bs.collapse`\n\nCollapse is also what powers the navbar\'s mobile menu (Day 7).',
    },
    {
      heading: 'Accordion',
      content: 'An **accordion** is a group of collapse panels where opening one closes the others (like an FAQ).\n\n```\n.accordion#faq\n  .accordion-item\n    h2.accordion-header\n      button.accordion-button(.collapsed) data-bs-toggle="collapse" data-bs-target="#q1"\n    #q1.accordion-collapse.collapse(.show) data-bs-parent="#faq"\n      .accordion-body\n```\n\n- `data-bs-parent="#faq"` makes it "only one open at a time". **Remove it** to allow several open panels (always open)\n- `.accordion-flush` removes outer borders and rounded corners\n- Closed buttons need the `.collapsed` class and `aria-expanded="false"` so the arrow icon points the right way\n\nAnalogy: a musical accordion folds and unfolds its sections; Bootstrap\'s accordion folds content sections.',
    },
    {
      heading: 'Dropdowns',
      content: 'A **dropdown** is a toggleable menu.\n\n```\n<div class="dropdown">\n  <button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Menu</button>\n  <ul class="dropdown-menu">\n    <li><h6 class="dropdown-header">Account</h6></li>\n    <li><a class="dropdown-item active" href="#">Profile</a></li>\n    <li><a class="dropdown-item disabled" aria-disabled="true">Billing</a></li>\n    <li><hr class="dropdown-divider"></li>\n    <li><button class="dropdown-item" type="button">Logout</button></li>\n  </ul>\n</div>\n```\n\nOptions:\n- Direction: wrapper `.dropup`, `.dropend`, `.dropstart`, `.dropdown-center`, `.dropup-center`\n- Alignment: `.dropdown-menu-end`, responsive `.dropdown-menu-lg-end`\n- Split button: `.btn-group` with a main button + `.dropdown-toggle.dropdown-toggle-split`\n- Dark menu: `data-bs-theme="dark"` on the menu (`.dropdown-menu-dark` is deprecated in 5.3)\n- Forms inside: `.dropdown-menu.p-4` with a form\n- Auto close: `data-bs-auto-close="true|false|inside|outside"` (e.g. `outside` keeps a filter menu open while clicking checkboxes)\n- Offset: `data-bs-offset="10,20"`\n\nEvents: `show.bs.dropdown`, `shown.bs.dropdown`, `hide.bs.dropdown`, `hidden.bs.dropdown`.',
    },
    {
      heading: 'Tables',
      content: 'Tables need the base class **`.table`** (opt-in, so tables in third-party widgets are not affected).\n\n- `.table-striped` (rows), `.table-striped-columns`\n- `.table-hover` – highlight row on hover\n- `.table-bordered` / `.table-borderless`\n- `.table-sm` – compact padding\n- Variants: `.table-dark`, `.table-primary`, … on the table, `<tr>` or `<td>`\n- `.table-active` – highlight a row/cell\n- `<thead class="table-light">` – light header\n- `.table-group-divider` – thicker border between thead and tbody\n- `.align-middle` – vertically centre cell content\n- `<caption>` + `.caption-top`\n- **Responsive**: wrap in `<div class="table-responsive">` (or `table-responsive-md`) for horizontal scrolling on small screens\n\nBootstrap tables don\'t sort or paginate; use JavaScript or a library (DataTables, Grid.js, TanStack Table).',
      points: [
        'Carousel, collapse, accordion and dropdowns need the JS bundle; tables are CSS only',
        'Keep ARIA attributes (aria-expanded, aria-controls) in sync – Bootstrap updates them automatically for its own triggers',
        'Coming next (Day 13): customising Bootstrap with Sass, CSS variables, themes and dark mode',
      ],
    },
  ],
  examples: [
    {
      title: 'Hero Carousel with Indicators, Captions and JS Controls',
      scenario: 'A homepage slider of three offers that auto-plays every 3 seconds, plus external buttons that pause and jump to a slide.',
      steps: [
        'Create .carousel.slide with id, data-bs-ride="carousel" and data-bs-interval="3000"',
        'Add indicators with data-bs-slide-to 0/1/2 and three .carousel-item (first active)',
        'Add captions and prev/next controls',
        'In JS log slid.bs.carousel and wire Pause / Play / "Go to 3" buttons',
      ],
      code: `<div id="hero" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
  <div class="carousel-indicators">
    <button type="button" data-bs-target="#hero" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
    <button type="button" data-bs-target="#hero" data-bs-slide-to="1" aria-label="Slide 2"></button>
  </div>
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="..." class="d-block w-100" alt="...">
      <div class="carousel-caption d-none d-md-block"><h5>Summer Sale</h5><p>Up to 50% off</p></div>
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#hero" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#hero" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span>
  </button>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div id="hero" class="carousel slide rounded overflow-hidden" data-bs-ride="carousel" data-bs-interval="3000">
    <div class="carousel-indicators">
      <button type="button" data-bs-target="#hero" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Slide 1"></button>
      <button type="button" data-bs-target="#hero" data-bs-slide-to="1" aria-label="Slide 2"></button>
      <button type="button" data-bs-target="#hero" data-bs-slide-to="2" aria-label="Slide 3"></button>
    </div>
    <div class="carousel-inner">
      <div class="carousel-item active">
        <img src="https://picsum.photos/id/1011/900/350" class="d-block w-100 object-fit-cover" style="height:280px" alt="Lake with boat">
        <div class="carousel-caption"><h5>Summer Sale</h5><p>Up to 50% off on travel gear.</p></div>
      </div>
      <div class="carousel-item">
        <img src="https://picsum.photos/id/1025/900/350" class="d-block w-100 object-fit-cover" style="height:280px" alt="Dog in blanket">
        <div class="carousel-caption"><h5>Pet Week</h5><p>Free delivery on pet supplies.</p></div>
      </div>
      <div class="carousel-item">
        <img src="https://picsum.photos/id/1035/900/350" class="d-block w-100 object-fit-cover" style="height:280px" alt="Waterfall">
        <div class="carousel-caption"><h5>New Arrivals</h5><p>Fresh styles every week.</p></div>
      </div>
    </div>
    <button class="carousel-control-prev" type="button" data-bs-target="#hero" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button>
    <button class="carousel-control-next" type="button" data-bs-target="#hero" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button>
  </div>
  <div class="d-flex gap-2 mt-3">
    <button class="btn btn-sm btn-outline-secondary" id="pause">Pause</button>
    <button class="btn btn-sm btn-outline-secondary" id="play">Play</button>
    <button class="btn btn-sm btn-outline-primary" id="go3">Go to slide 3</button>
    <span class="ms-auto small">Current slide: <b id="cur">1</b></span>
  </div>
</div>`,
        js: `const el = document.getElementById('hero');
const carousel = bootstrap.Carousel.getOrCreateInstance(el, { interval: 3000, ride: 'carousel' });
el.addEventListener('slid.bs.carousel', function (e) {
  document.getElementById('cur').textContent = e.to + 1;
  console.log('Slid from', e.from + 1, 'to', e.to + 1);
});
document.getElementById('pause').onclick = function () { carousel.pause(); console.log('Paused'); };
document.getElementById('play').onclick = function () { carousel.cycle(); console.log('Playing'); };
document.getElementById('go3').onclick = function () { carousel.to(2); };`,
      },
      result: 'Three image slides with white captions auto-advance every 3 seconds. Arrows and dots navigate; Pause stops cycling, Play resumes, "Go to slide 3" jumps there. The current slide number and console update on each slide.',
      explanation: 'The Carousel plugin moves .active between items with CSS transitions. getOrCreateInstance returns the instance created by data-bs-ride so the JS controls the same carousel. slid.bs.carousel provides from/to indexes.',
    },
    {
      title: 'FAQ Accordion, Always-Open Accordion and Collapse Toggles',
      scenario: 'An FAQ section where one answer opens at a time, a flush always-open variant, and a "Read more" collapse.',
      steps: [
        'Create .accordion#faq with three items; collapses use data-bs-parent="#faq"',
        'First item open: button without .collapsed and collapse with .show',
        'Create an .accordion-flush without data-bs-parent (always open)',
        'Add a "Read more" button toggling a .collapse paragraph and updating its text on events',
      ],
      code: `<div class="accordion" id="faq">
  <div class="accordion-item">
    <h2 class="accordion-header">
      <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#q1" aria-expanded="true" aria-controls="q1">What is Bootstrap?</button>
    </h2>
    <div id="q1" class="accordion-collapse collapse show" data-bs-parent="#faq">
      <div class="accordion-body">A front-end framework...</div>
    </div>
  </div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:720px">
  <h5>FAQ (one open at a time)</h5>
  <div class="accordion mb-4" id="faq">
    <div class="accordion-item">
      <h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#q1" aria-expanded="true" aria-controls="q1">What is Bootstrap?</button></h2>
      <div id="q1" class="accordion-collapse collapse show" data-bs-parent="#faq"><div class="accordion-body">A free front-end toolkit with a grid, components and utilities.</div></div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2" aria-expanded="false" aria-controls="q2">Do I need jQuery?</button></h2>
      <div id="q2" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">No. Bootstrap 5 uses plain JavaScript.</div></div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q3" aria-expanded="false" aria-controls="q3">Is it responsive?</button></h2>
      <div id="q3" class="accordion-collapse collapse" data-bs-parent="#faq"><div class="accordion-body">Yes, it is mobile-first with six breakpoints.</div></div>
    </div>
  </div>
  <h5>Flush, always open</h5>
  <div class="accordion accordion-flush mb-4 border">
    <div class="accordion-item">
      <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a1" aria-expanded="false" aria-controls="a1">Module 1</button></h2>
      <div id="a1" class="accordion-collapse collapse"><div class="accordion-body">Basics and layout.</div></div>
    </div>
    <div class="accordion-item">
      <h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#a2" aria-expanded="false" aria-controls="a2">Module 2</button></h2>
      <div id="a2" class="accordion-collapse collapse"><div class="accordion-body">Components.</div></div>
    </div>
  </div>
  <p>Bootstrap makes UI work fast.
    <span class="collapse" id="more"> It includes Sass sources, a utility API, RTL support and dark mode, so it scales from prototypes to production apps.</span>
  </p>
  <button class="btn btn-link p-0" id="moreBtn" type="button" data-bs-toggle="collapse" data-bs-target="#more" aria-expanded="false" aria-controls="more">Read more</button>
</div>`,
        js: `const more = document.getElementById('more');
const btn = document.getElementById('moreBtn');
more.addEventListener('shown.bs.collapse', function () { btn.textContent = 'Read less'; });
more.addEventListener('hidden.bs.collapse', function () { btn.textContent = 'Read more'; });
document.getElementById('faq').addEventListener('shown.bs.collapse', function (e) {
  console.log('Opened FAQ:', document.querySelector('[data-bs-target="#' + e.target.id + '"]').textContent);
});`,
      },
      result: 'Opening a question in the first accordion closes the others. In the flush accordion both modules can be open together. "Read more" expands hidden text and changes to "Read less".',
      explanation: 'data-bs-parent tells Collapse to hide siblings inside that parent when one shows. Without it each panel is independent. The collapse events update the button label.',
    },
    {
      title: 'Dropdowns: Split, Directions, Dark, Form Menu and Auto-close',
      scenario: 'Demonstrate the dropdown variations used in toolbars and filters, including a checkbox filter menu that stays open while you click.',
      steps: [
        'A split button using btn-group + dropdown-toggle-split',
        'dropup and dropend wrappers, and a right-aligned menu with dropdown-menu-end',
        'A dark menu with data-bs-theme="dark"',
        'A filter dropdown with checkboxes and data-bs-auto-close="outside"',
      ],
      code: `<div class="btn-group">
  <button type="button" class="btn btn-success">Save</button>
  <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false">
    <span class="visually-hidden">Toggle dropdown</span>
  </button>
  <ul class="dropdown-menu">
    <li><a class="dropdown-item" href="#">Save as draft</a></li>
  </ul>
</div>
<div class="dropdown">
  <button class="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside">Filter</button>
  <div class="dropdown-menu p-3">...checkboxes...</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-5">
  <div class="d-flex flex-wrap gap-2 align-items-start">
    <div class="btn-group">
      <button type="button" class="btn btn-success">Save</button>
      <button type="button" class="btn btn-success dropdown-toggle dropdown-toggle-split" data-bs-toggle="dropdown" aria-expanded="false"><span class="visually-hidden">Toggle dropdown</span></button>
      <ul class="dropdown-menu">
        <li><h6 class="dropdown-header">Save options</h6></li>
        <li><a class="dropdown-item" href="#">Save as draft</a></li>
        <li><a class="dropdown-item" href="#">Save and publish</a></li>
        <li><hr class="dropdown-divider"></li>
        <li><a class="dropdown-item disabled" aria-disabled="true">Schedule (Pro)</a></li>
      </ul>
    </div>
    <div class="btn-group dropup">
      <button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Dropup</button>
      <ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Opens upward</a></li></ul>
    </div>
    <div class="btn-group dropend">
      <button class="btn btn-secondary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Dropend</button>
      <ul class="dropdown-menu"><li><a class="dropdown-item" href="#">Opens right</a></li></ul>
    </div>
    <div class="dropdown">
      <button class="btn btn-dark dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Dark menu</button>
      <ul class="dropdown-menu" data-bs-theme="dark">
        <li><a class="dropdown-item active" href="#">Active</a></li><li><a class="dropdown-item" href="#">Another</a></li>
      </ul>
    </div>
    <div class="dropdown">
      <button class="btn btn-outline-dark dropdown-toggle" data-bs-toggle="dropdown" data-bs-auto-close="outside" aria-expanded="false">Filter (<span id="cnt">0</span>)</button>
      <form class="dropdown-menu p-3" style="min-width:200px" id="filter">
        <div class="form-check"><input class="form-check-input" type="checkbox" value="Mobiles" id="c1"><label class="form-check-label" for="c1">Mobiles</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" value="Laptops" id="c2"><label class="form-check-label" for="c2">Laptops</label></div>
        <div class="form-check"><input class="form-check-input" type="checkbox" value="Tablets" id="c3"><label class="form-check-label" for="c3">Tablets</label></div>
      </form>
    </div>
    <div class="dropdown ms-auto">
      <button class="btn btn-primary dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false">Account</button>
      <ul class="dropdown-menu dropdown-menu-end">
        <li><span class="dropdown-item-text small text-body-secondary">Signed in as asha</span></li>
        <li><a class="dropdown-item" href="#">Profile</a></li><li><button class="dropdown-item text-danger" type="button">Logout</button></li>
      </ul>
    </div>
  </div>
</div>`,
        js: `document.getElementById('filter').addEventListener('change', function () {
  const picked = Array.from(this.querySelectorAll('input:checked')).map(function (i) { return i.value; });
  document.getElementById('cnt').textContent = picked.length;
  console.log('Filters:', picked.join(', ') || 'none');
});
document.querySelectorAll('.dropdown-toggle').forEach(function (t) {
  t.addEventListener('shown.bs.dropdown', function () { console.log('Opened:', t.textContent.trim() || 'split toggle'); });
});`,
      },
      result: 'A split Save button with a header/divider/disabled item, menus opening up and to the right, a dark menu, a filter menu that stays open while ticking boxes (count updates), and an Account menu aligned to the right edge.',
      explanation: 'Popper positions each menu based on the wrapper class (dropup/dropend). data-bs-auto-close="outside" closes only when clicking outside, so inside clicks on checkboxes don\'t close it. dropdown-menu-end aligns the menu\'s right edge with the button.',
    },
    {
      title: 'Responsive Data Table with Search and Sorting',
      scenario: 'A student marks table: striped, hover, light header, contextual rows for fail/topper, responsive scroll, plus a live search box and click-to-sort header.',
      steps: [
        'Wrap a .table.table-striped.table-hover.align-middle in .table-responsive',
        'Render rows from a JS array; add table-danger to fails and table-success to the topper',
        'Filter rows on input in a search box',
        'Sort by marks when the header is clicked',
      ],
      code: `<div class="table-responsive">
  <table class="table table-striped table-hover align-middle">
    <caption>Class 10 results</caption>
    <thead class="table-light">
      <tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">Marks</th><th scope="col">Result</th></tr>
    </thead>
    <tbody class="table-group-divider">...</tbody>
  </table>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <input id="search" class="form-control mb-3" placeholder="Search by name" aria-label="Search students">
  <div class="table-responsive">
    <table class="table table-striped table-hover align-middle">
      <caption class="caption-top">Class 10 results (click Marks to sort)</caption>
      <thead class="table-light">
        <tr><th scope="col">#</th><th scope="col">Name</th><th scope="col">City</th><th scope="col" role="button" id="sortMarks">Marks &#8645;</th><th scope="col">Result</th><th scope="col">Email</th></tr>
      </thead>
      <tbody class="table-group-divider" id="rows"></tbody>
    </table>
  </div>
  <table class="table table-sm table-bordered table-dark w-auto mt-3">
    <tbody><tr><td>table-sm</td><td>table-bordered</td><td>table-dark</td></tr></tbody>
  </table>
</div>`,
        js: `const students = [
  { name: 'Asha', city: 'Pune', marks: 92 },
  { name: 'Rahul', city: 'Delhi', marks: 31 },
  { name: 'Neha', city: 'Mumbai', marks: 78 },
  { name: 'Vikram', city: 'Chennai', marks: 65 },
  { name: 'Sara', city: 'Kolkata', marks: 88 }
];
let asc = false;
function render(list) {
  const top = Math.max.apply(null, students.map(function (s) { return s.marks; }));
  document.getElementById('rows').innerHTML = list.map(function (s, i) {
    const pass = s.marks >= 35;
    const cls = !pass ? 'table-danger' : s.marks === top ? 'table-success' : '';
    return '<tr class="' + cls + '"><th scope="row">' + (i + 1) + '</th><td>' + s.name + '</td><td>' + s.city + '</td><td>' + s.marks +
      '</td><td><span class="badge ' + (pass ? 'text-bg-success' : 'text-bg-danger') + '">' + (pass ? 'Pass' : 'Fail') + '</span></td><td class="text-nowrap">' +
      s.name.toLowerCase() + '@school.example.com</td></tr>';
  }).join('');
}
function current() {
  const q = document.getElementById('search').value.toLowerCase();
  return students.filter(function (s) { return s.name.toLowerCase().includes(q); });
}
document.getElementById('search').addEventListener('input', function () { render(current()); });
document.getElementById('sortMarks').addEventListener('click', function () {
  asc = !asc;
  students.sort(function (a, b) { return asc ? a.marks - b.marks : b.marks - a.marks; });
  render(current());
  console.log('Sorted by marks', asc ? 'ascending' : 'descending');
});
render(students);`,
      },
      result: 'A striped table with a light header; Rahul\'s row is red (Fail) and Asha\'s green (topper). Typing filters rows; clicking "Marks" sorts ascending/descending. On narrow screens the table scrolls horizontally instead of breaking the layout.',
      explanation: 'All styling comes from table classes; contextual classes on <tr> colour the row. table-responsive adds overflow-x: auto. Sorting and filtering are plain JS that re-render the tbody.',
    },
  ],
  interview: [
    { q: 'What are the required parts of a Bootstrap carousel?', a: '.carousel.slide wrapper with an id, .carousel-inner, at least one .carousel-item with exactly one .active, and optionally controls (data-bs-slide prev/next) and indicators (data-bs-slide-to).', level: 'Easy' },
    { q: 'How do you change the carousel speed or stop autoplay?', a: 'Set data-bs-interval="5000" (ms) on the carousel or items; data-bs-interval="false" or omitting data-bs-ride stops auto cycling. JS: carousel.pause().', level: 'Medium' },
    { q: 'How do you make a crossfading carousel?', a: 'Add .carousel-fade to the .carousel element.', level: 'Easy' },
    { q: 'Collapse vs Accordion?', a: 'Collapse toggles a single element. An accordion is a styled group of collapses where data-bs-parent ensures only one panel is open at a time.', level: 'Easy' },
    { q: 'How do you allow multiple accordion panels to stay open?', a: 'Remove the data-bs-parent attribute from each .accordion-collapse.', level: 'Medium' },
    { q: 'Why must closed accordion buttons have the .collapsed class?', a: 'The class controls the arrow icon rotation and styling; Bootstrap toggles it later, but the initial state must be correct in the HTML along with aria-expanded="false".', level: 'Medium' },
    { q: 'How do you keep a dropdown open while clicking inside it?', a: 'Use data-bs-auto-close="outside" (or false to close only via the toggle).', level: 'Medium' },
    { q: 'How do you align a dropdown menu to the right?', a: 'Add .dropdown-menu-end to the .dropdown-menu (responsive variants like .dropdown-menu-lg-end exist).', level: 'Easy' },
    { q: 'What is a split button dropdown?', a: 'A .btn-group with a main action button and a separate .dropdown-toggle-split button that opens the menu of related actions.', level: 'Easy' },
    { q: 'Why do Bootstrap tables need the .table class?', a: 'Table styles are opt-in so third-party widgets using <table> (calendars, editors) are not affected.', level: 'Medium' },
    { q: 'How do you make a table responsive?', a: 'Wrap it in <div class="table-responsive"> (or .table-responsive-{bp}), which enables horizontal scrolling on smaller screens.', level: 'Easy' },
    { q: 'Does Bootstrap provide table sorting or pagination?', a: 'No. Use custom JavaScript or libraries such as DataTables, Grid.js or TanStack Table, and style them with Bootstrap classes.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Build a testimonial carousel with text-only slides (no images), fade effect, dark controls and a 4-second interval.',
      hint: 'carousel-fade, data-bs-theme="dark", text-center slides with padding.',
      solution: `<div id="testi" class="carousel slide carousel-fade" data-bs-ride="carousel" data-bs-interval="4000" data-bs-theme="dark">
  <div class="carousel-inner text-center py-5 px-5 bg-body-tertiary rounded">
    <div class="carousel-item active"><blockquote class="blockquote">"Great course!"</blockquote><p>– Asha</p></div>
    <div class="carousel-item"><blockquote class="blockquote">"Got my first job."</blockquote><p>– Rahul</p></div>
    <div class="carousel-item"><blockquote class="blockquote">"Clear explanations."</blockquote><p>– Neha</p></div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#testi" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button>
  <button class="carousel-control-next" type="button" data-bs-target="#testi" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button>
</div>`,
    },
    {
      task: 'Create a course syllabus accordion generated from a JS array of {title, topics[]} objects.',
      hint: 'Build HTML strings with unique ids; first item open.',
      solution: `<div class="accordion" id="syl"></div>
<script>
const mods = [
  { title: 'Basics', topics: ['Setup', 'Grid'] },
  { title: 'Components', topics: ['Buttons', 'Cards', 'Forms'] },
  { title: 'Advanced', topics: ['Sass', 'Dark mode'] }
];
document.getElementById('syl').innerHTML = mods.map((m, i) =>
  '<div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button' + (i ? ' collapsed' : '') +
  '" type="button" data-bs-toggle="collapse" data-bs-target="#m' + i + '" aria-expanded="' + (i === 0) + '" aria-controls="m' + i + '">' + m.title +
  '</button></h2><div id="m' + i + '" class="accordion-collapse collapse' + (i ? '' : ' show') + '" data-bs-parent="#syl"><div class="accordion-body"><ul>' +
  m.topics.map(t => '<li>' + t + '</li>').join('') + '</ul></div></div></div>'
).join('');
</script>`,
    },
    {
      task: 'Create a "Sort by" dropdown that updates its button label to the chosen option and marks it active.',
      hint: 'Listen to clicks on .dropdown-item; toggle .active.',
      solution: `<div class="dropdown">
  <button class="btn btn-outline-secondary dropdown-toggle" id="sortBtn" data-bs-toggle="dropdown" aria-expanded="false">Sort by: Newest</button>
  <ul class="dropdown-menu" id="sortMenu">
    <li><button class="dropdown-item active" type="button">Newest</button></li>
    <li><button class="dropdown-item" type="button">Price: Low to High</button></li>
    <li><button class="dropdown-item" type="button">Price: High to Low</button></li>
  </ul>
</div>
<script>
document.getElementById('sortMenu').addEventListener('click', e => {
  const item = e.target.closest('.dropdown-item');
  if (!item) return;
  document.querySelectorAll('#sortMenu .dropdown-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  document.getElementById('sortBtn').textContent = 'Sort by: ' + item.textContent;
});
</script>`,
    },
    {
      task: 'Build an orders table with a dark header, small padding, bordered cells, a status badge column and a total row using table-group-divider and fw-bold.',
      hint: 'thead class="table-dark", tfoot.',
      solution: `<div class="table-responsive">
<table class="table table-sm table-bordered align-middle">
  <thead class="table-dark"><tr><th>Order</th><th>Customer</th><th>Status</th><th class="text-end">Amount</th></tr></thead>
  <tbody>
    <tr><td>#1001</td><td>Asha</td><td><span class="badge text-bg-success">Delivered</span></td><td class="text-end">Rs 1,200</td></tr>
    <tr><td>#1002</td><td>Rahul</td><td><span class="badge text-bg-warning">Pending</span></td><td class="text-end">Rs 850</td></tr>
    <tr><td>#1003</td><td>Neha</td><td><span class="badge text-bg-danger">Cancelled</span></td><td class="text-end">Rs 0</td></tr>
  </tbody>
  <tfoot class="table-group-divider"><tr class="fw-bold"><td colspan="3">Total</td><td class="text-end">Rs 2,050</td></tr></tfoot>
</table>
</div>`,
    },
  ],
  quiz: [
    { question: 'Which attribute makes accordion items close others when opened?', options: ['data-bs-parent', 'data-bs-group', 'data-bs-single', 'data-accordion'], answer: 0, explanation: 'data-bs-parent points to the accordion container.' },
    { question: 'Which class right-aligns a dropdown menu?', options: ['dropdown-right', 'dropdown-menu-right', 'float-end', 'dropdown-menu-end'], answer: 3, explanation: 'Bootstrap 5 uses -end (Bootstrap 4 was -right).' },
    { question: 'How many .carousel-item elements must have .active initially?', options: ['None', 'All', 'Exactly one', 'At least two'], answer: 2, explanation: 'Exactly one item is shown at start.' },
    { question: 'Which wrapper makes a wide table scroll horizontally on phones?', options: ['table-scroll', 'table-responsive', 'overflow-table', 'table-mobile'], answer: 1, explanation: '.table-responsive adds overflow-x:auto.' },
    { question: 'Which event fires after a carousel finishes sliding?', options: ['slid.bs.carousel', 'slide.bs.carousel', 'changed.bs.carousel', 'next.bs.carousel'], answer: 0, explanation: 'slid (past tense) fires after the transition.' },
  ],
};
