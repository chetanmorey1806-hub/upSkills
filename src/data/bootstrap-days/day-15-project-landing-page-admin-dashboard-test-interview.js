export default {
  id: 'day-15-project-landing-page-admin-dashboard-test-interview',
  title: 'Project: Responsive Landing Page + Admin Dashboard, Practical Test and Interview Questions',
  module: 'Module 3: Professional Bootstrap',
  day: 15,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Put the whole course together: build a complete responsive SaaS landing page (navbar, hero, features, pricing, testimonials carousel, FAQ, contact form, footer) and a working admin dashboard (offcanvas sidebar, KPI cards, chart, data table with search/pagination, modals, toasts, dark mode), then take a practical test and revise with 30 interview questions.',
  objectives: [
    'Plan a multi-section responsive page and map each section to Bootstrap components and grid patterns',
    'Build a landing page that works from 320px to 1400px+ with no custom media queries',
    'Build an admin dashboard layout with a responsive offcanvas sidebar, KPI cards, tables and modals',
    'Wire components with the Bootstrap JS API (Modal, Toast, Tooltip, Offcanvas) and handle forms with validation',
    'Prepare for Bootstrap interviews and a timed practical test',
  ],
  theory: [
    {
      heading: 'Project Planning: From Design to Bootstrap Components',
      content: 'Before writing code, break the design into **sections** and pick the Bootstrap tool for each. This is exactly how professional front-end developers work.\n\n**Landing page (marketing site)**\n1. Navbar – `navbar navbar-expand-lg sticky-top` with brand, links, CTA button\n2. Hero – `container` + `row align-items-center` with text (`display-4`, `lead`) and image (`img-fluid`), `min-vh-75` style height\n3. Logos / trust bar – `d-flex flex-wrap justify-content-center gap-4 opacity-50`\n4. Features – `row row-cols-1 row-cols-md-3 g-4` + Bootstrap Icons in feature boxes\n5. Pricing – cards with `h-100`, a highlighted `border-primary` plan, monthly/yearly toggle with `btn-check`\n6. Testimonials – carousel\n7. FAQ – accordion\n8. Contact – validated form\n9. Footer – grid of link lists\n\n**Admin dashboard (web app)**\n1. Top navbar with brand, search and user dropdown\n2. Sidebar – `offcanvas-lg` so it is a fixed column on desktop and a slide-in panel on mobile\n3. KPI cards – `row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3`\n4. Chart area – canvas or CSS bars inside a card\n5. Recent orders table – `table-responsive`, search, status badges, pagination\n6. Actions – "Add product" modal with form, toast notifications, tooltips',
      tip: 'Sketch on paper first: draw boxes for each section at phone width and desktop width. If you can draw the grid, you can code it.',
    },
    {
      heading: 'Layout Patterns Used in This Project',
      content: '- **Section spacing**: `py-5` on each `<section>`; alternate backgrounds with `bg-body-tertiary` for rhythm\n- **Hero split**: `col-lg-6` text + `col-lg-6` image; on mobile the image goes on top with `order-first order-lg-last` or below by default\n- **Centred section headers**: `text-center mx-auto` with `style="max-width: 640px"` (or `col-lg-8 mx-auto`)\n- **Equal-height cards**: `row g-4` + `card h-100` + `d-flex flex-column` + `mt-auto` buttons\n- **Sticky navbar** with in-page links: give sections `id`s and add `scroll-margin-top` so headings are not hidden under the navbar\n- **Dashboard shell**: `d-flex` wrapper → sidebar (`offcanvas-lg` with fixed width on lg) + `main` (`flex-grow-1 overflow-auto`)\n- **Data cards**: `card` + `card-body` + `d-flex justify-content-between align-items-center` for number + icon',
      syntax: `<!-- Dashboard shell -->
<div class="d-flex">
  <aside class="offcanvas-lg offcanvas-start bg-dark" data-bs-theme="dark" id="sidebar" style="width:240px">
    ...nav links...
  </aside>
  <main class="flex-grow-1 p-3">...</main>
</div>`,
    },
    {
      heading: 'Interactivity Checklist (Bootstrap JS)',
      content: 'Components that work with data attributes only:\n- Navbar collapse, dropdowns, offcanvas, modal, carousel, accordion/collapse, tabs, dismissible alerts\n\nComponents that need a line of JS:\n- **Tooltips/Popovers**: `document.querySelectorAll(\'[data-bs-toggle="tooltip"]\').forEach(el => new bootstrap.Tooltip(el))`\n- **Toasts**: `bootstrap.Toast.getOrCreateInstance(el).show()`\n- **Form validation**: `novalidate` + `checkValidity()` + `was-validated`\n- **Closing a modal after saving**: `bootstrap.Modal.getInstance(modalEl).hide()`\n- **Closing the mobile sidebar after a click**: `bootstrap.Offcanvas.getInstance(el)?.hide()`\n\nPattern for dynamic data: keep data in a JS array → `render()` function builds HTML → event delegation for buttons inside generated rows.',
    },
    {
      heading: 'Quality Checklist Before Submitting a Project',
      content: '**Responsive**\n- Test at 360, 768, 992, 1200, 1400px (DevTools device mode)\n- No horizontal scrollbar (`row` always inside `container`; wide tables in `table-responsive`)\n- Touch targets at least ~44px (use default button sizes)\n\n**Accessibility**\n- One `<h1>`, logical heading order\n- Alt text on images, labels on inputs, `aria-label` on icon buttons\n- Focus visible, everything works with keyboard\n- Colour contrast checked; dark mode readable\n\n**Code quality**\n- Semantic tags: header, nav, main, section, footer\n- Minimal custom CSS; reuse utilities; customise via CSS variables\n- Bootstrap version pinned; JS bundle loaded once at the end of body\n- No console errors\n\n**Performance**\n- Images sized correctly, `loading="lazy"` for below-the-fold images\n- Only needed Sass/JS in production (npm build) or CDN with SRI',
    },
    {
      heading: 'Practical Test (90 minutes) – Instructions',
      content: 'Attempt this timed test after finishing the two projects. Use only Bootstrap 5.3 (CDN) and Bootstrap Icons; custom CSS max 20 lines.\n\n1. **(10 marks)** Build a responsive navbar for "FoodieHub" that collapses below md, has 4 links, a cart icon button with a badge, and a dark theme.\n2. **(15 marks)** Build a restaurant card grid (1/2/4 per row at xs/md/xl) from a JS array of 8 items with image, name, rating stars, price and "Order" button aligned at the bottom.\n3. **(15 marks)** Clicking "Order" opens ONE modal showing the selected dish name and a quantity input (1–10, validated). Confirming closes the modal and shows a toast "2 x Paneer Tikka added".\n4. **(10 marks)** Add a filter bar: veg/non-veg segmented control (btn-check radios) and a search input that filters the cards live.\n5. **(10 marks)** Add an FAQ accordion with 3 questions and a footer with 3 columns that stack on mobile.\n6. **(10 marks)** Add a dark-mode toggle that persists in localStorage.\n7. **(10 marks)** Accessibility: labels, aria-labels on icon buttons, alt text, aria-current on the active nav link, focusable controls only.\n8. **(10 marks)** Code quality: semantic HTML, no layout breaks at 360px, no console errors.\n9. **(10 marks)** Viva: explain the grid classes you used for task 2 and how the modal receives the dish name.\n\nPassing score: 60/100. A model solution for tasks 1–3 is in the Practice section.',
      points: [
        'Read all tasks first and plan the HTML skeleton (5 minutes)',
        'Build structure → layout → components → JS → polish',
        'Test the mobile view continuously, not just at the end',
      ],
    },
  ],
  examples: [
    {
      title: 'Project 1: Responsive SaaS Landing Page (Complete)',
      scenario: 'Build "TaskFlow", a landing page for a task-management SaaS with sticky navbar, hero, logos bar, features with icons, monthly/yearly pricing toggle, testimonial carousel, FAQ accordion, validated contact form and footer.',
      steps: [
        'Create the sticky navbar with navbar-expand-lg, in-page anchor links and a CTA button',
        'Build the hero with row align-items-center: text in col-lg-6, image in col-lg-6',
        'Add the features grid (row-cols-1 row-cols-md-3) with Bootstrap Icons',
        'Add pricing cards with h-100 and a btn-check Monthly/Yearly switch that updates prices via JS',
        'Add a testimonial carousel and an FAQ accordion',
        'Add a validated contact form (novalidate + was-validated) and a success toast',
        'Add a responsive footer and test at phone, tablet and desktop widths',
      ],
      code: `<!-- Key structure (full version in the playground) -->
<nav class="navbar navbar-expand-lg bg-body sticky-top border-bottom">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#">TaskFlow</a>
    <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#lpNav" aria-controls="lpNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="lpNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
      </ul>
      <a href="#contact" class="btn btn-primary ms-lg-3">Start free</a>
    </div>
  </div>
</nav>

<header class="py-5">
  <div class="container">
    <div class="row align-items-center g-5">
      <div class="col-lg-6 text-center text-lg-start">
        <h1 class="display-4 fw-bold">Organise work. Ship faster.</h1>
        <p class="lead text-body-secondary">Tasks, boards and reports for growing teams.</p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center justify-content-lg-start">
          <a class="btn btn-primary btn-lg px-4" href="#pricing">Get started</a>
          <a class="btn btn-outline-secondary btn-lg px-4" href="#features">See features</a>
        </div>
      </div>
      <div class="col-lg-6"><img src="..." class="img-fluid rounded-4 shadow" alt="TaskFlow board"></div>
    </div>
  </div>
</header>

<section id="pricing" class="py-5 bg-body-tertiary">
  <div class="btn-group" role="group" aria-label="Billing period">
    <input type="radio" class="btn-check" name="billing" id="monthly" value="monthly" checked>
    <label class="btn btn-outline-primary" for="monthly">Monthly</label>
    <input type="radio" class="btn-check" name="billing" id="yearly" value="yearly">
    <label class="btn btn-outline-primary" for="yearly">Yearly (-20%)</label>
  </div>
  <div class="row row-cols-1 row-cols-md-3 g-4">
    <div class="col"><div class="card h-100">...<span class="price" data-monthly="0" data-yearly="0"></span>...</div></div>
  </div>
</section>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<a class="visually-hidden-focusable" href="#main">Skip to main content</a>
<nav class="navbar navbar-expand-lg bg-body sticky-top border-bottom">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#"><i class="bi bi-check2-square text-primary" aria-hidden="true"></i> TaskFlow</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#lpNav" aria-controls="lpNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="lpNav">
      <ul class="navbar-nav ms-auto mb-2 mb-lg-0">
        <li class="nav-item"><a class="nav-link" href="#features">Features</a></li>
        <li class="nav-item"><a class="nav-link" href="#pricing">Pricing</a></li>
        <li class="nav-item"><a class="nav-link" href="#reviews">Reviews</a></li>
        <li class="nav-item"><a class="nav-link" href="#faq">FAQ</a></li>
      </ul>
      <a href="#contact" class="btn btn-primary ms-lg-3">Start free</a>
    </div>
  </div>
</nav>

<main id="main">
<header class="py-5">
  <div class="container">
    <div class="row align-items-center g-5">
      <div class="col-lg-6 text-center text-lg-start">
        <span class="badge bg-primary-subtle text-primary-emphasis rounded-pill mb-3 px-3 py-2">New: AI task summaries</span>
        <h1 class="display-4 fw-bold lh-1 mb-3">Organise work. Ship faster.</h1>
        <p class="lead text-body-secondary mb-4">Tasks, boards and reports for growing teams. Free for up to 5 users.</p>
        <div class="d-grid gap-2 d-sm-flex justify-content-sm-center justify-content-lg-start">
          <a class="btn btn-primary btn-lg px-4" href="#pricing">Get started</a>
          <a class="btn btn-outline-secondary btn-lg px-4" href="#features">See features</a>
        </div>
      </div>
      <div class="col-lg-6">
        <img src="https://picsum.photos/id/180/800/520" class="img-fluid rounded-4 shadow" alt="Team working on laptops with TaskFlow board">
      </div>
    </div>
  </div>
</header>

<div class="border-top border-bottom py-3 bg-body-tertiary">
  <div class="container d-flex flex-wrap justify-content-center gap-4 fs-4 text-body-secondary">
    <i class="bi bi-amazon" aria-label="Amazon" role="img"></i><i class="bi bi-google" aria-label="Google" role="img"></i>
    <i class="bi bi-spotify" aria-label="Spotify" role="img"></i><i class="bi bi-slack" aria-label="Slack" role="img"></i>
    <i class="bi bi-dropbox" aria-label="Dropbox" role="img"></i>
  </div>
</div>

<section id="features" class="py-5">
  <div class="container">
    <div class="text-center mx-auto mb-5" style="max-width:640px">
      <h2 class="fw-bold">Everything your team needs</h2>
      <p class="text-body-secondary">Replace five tools with one simple workspace.</p>
    </div>
    <div class="row row-cols-1 row-cols-md-3 g-4">
      <div class="col"><div class="p-4 border rounded-4 h-100">
        <div class="d-inline-flex align-items-center justify-content-center bg-primary text-white rounded-3 fs-4 mb-3" style="width:3rem;height:3rem"><i class="bi bi-kanban" aria-hidden="true"></i></div>
        <h3 class="h5">Kanban boards</h3><p class="text-body-secondary mb-0">Drag tasks across stages and see progress at a glance.</p></div></div>
      <div class="col"><div class="p-4 border rounded-4 h-100">
        <div class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-3 fs-4 mb-3" style="width:3rem;height:3rem"><i class="bi bi-bar-chart-line" aria-hidden="true"></i></div>
        <h3 class="h5">Reports</h3><p class="text-body-secondary mb-0">Weekly burndown and workload charts generated automatically.</p></div></div>
      <div class="col"><div class="p-4 border rounded-4 h-100">
        <div class="d-inline-flex align-items-center justify-content-center bg-warning text-dark rounded-3 fs-4 mb-3" style="width:3rem;height:3rem"><i class="bi bi-bell" aria-hidden="true"></i></div>
        <h3 class="h5">Smart reminders</h3><p class="text-body-secondary mb-0">Never miss a deadline with email and push alerts.</p></div></div>
    </div>
  </div>
</section>

<section id="pricing" class="py-5 bg-body-tertiary">
  <div class="container">
    <div class="text-center mb-4">
      <h2 class="fw-bold">Simple pricing</h2>
      <div class="btn-group mt-2" role="group" aria-label="Billing period">
        <input type="radio" class="btn-check" name="billing" id="monthly" value="monthly" checked>
        <label class="btn btn-outline-primary" for="monthly">Monthly</label>
        <input type="radio" class="btn-check" name="billing" id="yearly" value="yearly">
        <label class="btn btn-outline-primary" for="yearly">Yearly (-20%)</label>
      </div>
    </div>
    <div class="row row-cols-1 row-cols-md-3 g-4 text-center">
      <div class="col"><div class="card h-100 shadow-sm"><div class="card-header py-3"><h3 class="h5 my-0">Free</h3></div>
        <div class="card-body d-flex flex-column"><p class="display-6 fw-bold">Rs <span class="price" data-monthly="0" data-yearly="0">0</span><small class="fs-6 text-body-secondary">/user/mo</small></p>
        <ul class="list-unstyled mb-4"><li>5 users</li><li>3 boards</li><li>Email support</li></ul>
        <button class="btn btn-outline-primary w-100 mt-auto">Sign up free</button></div></div></div>
      <div class="col"><div class="card h-100 shadow border-primary border-2"><div class="card-header py-3 text-bg-primary border-primary"><h3 class="h5 my-0">Pro <span class="badge text-bg-light">Popular</span></h3></div>
        <div class="card-body d-flex flex-column"><p class="display-6 fw-bold">Rs <span class="price" data-monthly="299" data-yearly="239">299</span><small class="fs-6 text-body-secondary">/user/mo</small></p>
        <ul class="list-unstyled mb-4"><li>Unlimited users</li><li>Unlimited boards</li><li>Reports</li><li>Priority support</li></ul>
        <button class="btn btn-primary w-100 mt-auto">Start trial</button></div></div></div>
      <div class="col"><div class="card h-100 shadow-sm"><div class="card-header py-3"><h3 class="h5 my-0">Enterprise</h3></div>
        <div class="card-body d-flex flex-column"><p class="display-6 fw-bold">Rs <span class="price" data-monthly="699" data-yearly="559">699</span><small class="fs-6 text-body-secondary">/user/mo</small></p>
        <ul class="list-unstyled mb-4"><li>SSO and audit logs</li><li>Dedicated manager</li></ul>
        <button class="btn btn-outline-primary w-100 mt-auto">Contact sales</button></div></div></div>
    </div>
  </div>
</section>

<section id="reviews" class="py-5">
  <div class="container" style="max-width:760px">
    <h2 class="fw-bold text-center mb-4">Loved by teams</h2>
    <div id="reviewCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000" data-bs-theme="dark">
      <div class="carousel-indicators position-static mt-3 order-last">
        <button type="button" data-bs-target="#reviewCarousel" data-bs-slide-to="0" class="active" aria-current="true" aria-label="Review 1"></button>
        <button type="button" data-bs-target="#reviewCarousel" data-bs-slide-to="1" aria-label="Review 2"></button>
        <button type="button" data-bs-target="#reviewCarousel" data-bs-slide-to="2" aria-label="Review 3"></button>
      </div>
      <div class="carousel-inner text-center px-5">
        <div class="carousel-item active"><blockquote class="blockquote fs-5">"We cut our weekly meeting time in half."</blockquote><p class="text-body-secondary">Priya, Product Manager</p></div>
        <div class="carousel-item"><blockquote class="blockquote fs-5">"Setup took 10 minutes. The team loved it."</blockquote><p class="text-body-secondary">Arjun, CTO</p></div>
        <div class="carousel-item"><blockquote class="blockquote fs-5">"Reports alone are worth the price."</blockquote><p class="text-body-secondary">Meera, Agency Owner</p></div>
      </div>
      <button class="carousel-control-prev" type="button" data-bs-target="#reviewCarousel" data-bs-slide="prev"><span class="carousel-control-prev-icon" aria-hidden="true"></span><span class="visually-hidden">Previous</span></button>
      <button class="carousel-control-next" type="button" data-bs-target="#reviewCarousel" data-bs-slide="next"><span class="carousel-control-next-icon" aria-hidden="true"></span><span class="visually-hidden">Next</span></button>
    </div>
  </div>
</section>

<section id="faq" class="py-5 bg-body-tertiary">
  <div class="container" style="max-width:760px">
    <h2 class="fw-bold text-center mb-4">FAQ</h2>
    <div class="accordion" id="faqAcc">
      <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#f1" aria-expanded="true" aria-controls="f1">Is there a free plan?</button></h3>
        <div id="f1" class="accordion-collapse collapse show" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, free forever for up to 5 users.</div></div></div>
      <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f2" aria-expanded="false" aria-controls="f2">Can I cancel anytime?</button></h3>
        <div id="f2" class="accordion-collapse collapse" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, cancel from settings with one click.</div></div></div>
      <div class="accordion-item"><h3 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#f3" aria-expanded="false" aria-controls="f3">Do you offer student discounts?</button></h3>
        <div id="f3" class="accordion-collapse collapse" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, 50% off with a valid student email.</div></div></div>
    </div>
  </div>
</section>

<section id="contact" class="py-5">
  <div class="container" style="max-width:640px">
    <h2 class="fw-bold text-center mb-4">Contact us</h2>
    <form id="contactForm" class="row g-3 needs-validation" novalidate>
      <div class="col-md-6"><label for="cName" class="form-label">Name</label><input id="cName" class="form-control" required minlength="2" autocomplete="name"><div class="invalid-feedback">Please enter your name.</div></div>
      <div class="col-md-6"><label for="cEmail" class="form-label">Work email</label><input id="cEmail" type="email" class="form-control" required autocomplete="email"><div class="invalid-feedback">Enter a valid email.</div></div>
      <div class="col-12"><label for="cTeam" class="form-label">Team size</label><select id="cTeam" class="form-select" required><option value="" selected disabled>Choose...</option><option>1-10</option><option>11-50</option><option>51+</option></select><div class="invalid-feedback">Choose a team size.</div></div>
      <div class="col-12"><label for="cMsg" class="form-label">Message</label><textarea id="cMsg" class="form-control" rows="3" required minlength="10"></textarea><div class="invalid-feedback">At least 10 characters.</div></div>
      <div class="col-12"><button class="btn btn-primary w-100" type="submit">Send message</button></div>
    </form>
  </div>
</section>
</main>

<footer class="bg-dark text-white-50 py-5" data-bs-theme="dark">
  <div class="container">
    <div class="row g-4">
      <div class="col-md-4"><h5 class="text-white">TaskFlow</h5><p class="small">Made with Bootstrap 5.3.</p></div>
      <div class="col-6 col-md-2"><h6 class="text-white">Product</h6><ul class="list-unstyled small"><li><a class="link-secondary" href="#features">Features</a></li><li><a class="link-secondary" href="#pricing">Pricing</a></li></ul></div>
      <div class="col-6 col-md-2"><h6 class="text-white">Company</h6><ul class="list-unstyled small"><li><a class="link-secondary" href="#">About</a></li><li><a class="link-secondary" href="#">Careers</a></li></ul></div>
      <div class="col-md-4"><h6 class="text-white">Follow</h6><div class="d-flex gap-3 fs-5">
        <a class="link-secondary" href="#" aria-label="X"><i class="bi bi-twitter-x" aria-hidden="true"></i></a>
        <a class="link-secondary" href="#" aria-label="LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a>
        <a class="link-secondary" href="#" aria-label="GitHub"><i class="bi bi-github" aria-hidden="true"></i></a></div></div>
    </div>
    <hr class="border-secondary"><p class="small mb-0">&copy; 2026 TaskFlow</p>
  </div>
</footer>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="sentToast" class="toast text-bg-success" role="status" aria-live="polite" aria-atomic="true">
    <div class="d-flex"><div class="toast-body"><i class="bi bi-check-circle me-1" aria-hidden="true"></i>Thanks! We will reply within 24 hours.</div>
    <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>
  </div>
</div>`,
        css: `section[id] { scroll-margin-top: 70px; }
#reviewCarousel { display: flex; flex-direction: column; }`,
        js: `// Pricing toggle
document.querySelectorAll('input[name="billing"]').forEach(function (r) {
  r.addEventListener('change', function () {
    document.querySelectorAll('.price').forEach(function (p) { p.textContent = p.dataset[r.value]; });
    console.log('Billing:', r.value);
  });
});
// Close mobile menu after clicking a link
document.querySelectorAll('#lpNav .nav-link').forEach(function (a) {
  a.addEventListener('click', function () {
    const c = bootstrap.Collapse.getInstance(document.getElementById('lpNav'));
    if (c) c.hide();
  });
});
// Contact form validation + toast
const form = document.getElementById('contactForm');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (form.checkValidity()) {
    bootstrap.Toast.getOrCreateInstance(document.getElementById('sentToast')).show();
    console.log('Message sent from', document.getElementById('cEmail').value);
    form.reset();
    form.classList.remove('was-validated');
  } else {
    form.classList.add('was-validated');
    form.querySelector(':invalid').focus();
  }
});`,
      },
      result: 'A complete one-page site: sticky navbar (hamburger below lg) with working anchor links, a split hero, a logos bar, three feature boxes, pricing cards whose prices switch between monthly and yearly, an auto-playing testimonial carousel, an FAQ accordion, a contact form that shows red errors or a green success toast, and a dark footer. Everything reflows to a single column on phones.',
      explanation: 'Every section combines techniques from earlier days: grid (Day 2–3), utilities (Day 5), buttons/btn-check (Day 6), navbar (Day 7), cards and icons (Day 8), forms/validation (Day 9–10), toasts (Day 11), carousel/accordion (Day 12) and adaptive colours (Day 13). Only two lines of custom CSS were needed.',
    },
    {
      title: 'Project 2: Admin Dashboard (Sidebar, KPIs, Chart, Orders Table, Modal, Dark Mode)',
      scenario: 'Build "ShopAdmin": a responsive dashboard with an offcanvas-lg sidebar, KPI cards, a CSS bar chart, an orders table with search, status filter and pagination, an "Add order" modal with validation, tooltips, toasts and a dark-mode toggle.',
      steps: [
        'Create the top navbar with a sidebar toggle (visible below lg), search and a user dropdown',
        'Create the shell: d-flex with aside.offcanvas-lg (sidebar) and main.flex-grow-1',
        'Add four KPI cards in row-cols-1 row-cols-sm-2 row-cols-xl-4, computed from data',
        'Add a weekly sales bar chart built from progress-like divs',
        'Render the orders table from an array with search, status filter, pagination and delete buttons with tooltips',
        'Add an "Add order" modal with a validated form; on save push to the array, re-render, hide modal and show a toast',
        'Add a dark-mode switch that sets data-bs-theme on <html>',
      ],
      code: `// Core data + render pattern
const orders = [ { id: 1001, customer: 'Asha', amount: 1200, status: 'Delivered' }, /* ... */ ];
let page = 1; const perPage = 5;

function filtered() {
  const q = search.value.toLowerCase();
  const s = statusFilter.value;
  return orders.filter(o => o.customer.toLowerCase().includes(q) && (s === 'All' || o.status === s));
}

function renderTable() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  page = Math.min(page, pages);
  tbody.innerHTML = list.slice((page - 1) * perPage, page * perPage).map(rowHtml).join('');
  // re-create tooltips for new buttons
  tbody.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
  renderPager(pages);
  renderKpis();
}

// Save from modal
saveBtn.addEventListener('click', () => {
  if (!orderForm.checkValidity()) { orderForm.classList.add('was-validated'); return; }
  orders.unshift({ id: nextId++, customer: cust.value, amount: +amt.value, status: st.value });
  bootstrap.Modal.getInstance(orderModal).hide();
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
  renderTable();
});`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<nav class="navbar bg-body-tertiary border-bottom sticky-top">
  <div class="container-fluid">
    <div class="d-flex align-items-center">
      <button class="btn btn-outline-secondary d-lg-none me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#sidebar" aria-controls="sidebar" aria-label="Open sidebar"><i class="bi bi-list" aria-hidden="true"></i></button>
      <a class="navbar-brand fw-bold" href="#"><i class="bi bi-shop text-primary" aria-hidden="true"></i> ShopAdmin</a>
    </div>
    <div class="d-flex align-items-center gap-3">
      <div class="form-check form-switch mb-0">
        <input class="form-check-input" type="checkbox" role="switch" id="darkSwitch">
        <label class="form-check-label small" for="darkSwitch"><i class="bi bi-moon-stars" aria-hidden="true"></i><span class="visually-hidden">Dark mode</span></label>
      </div>
      <div class="dropdown">
        <button class="btn btn-sm btn-light border dropdown-toggle" data-bs-toggle="dropdown" aria-expanded="false"><i class="bi bi-person-circle" aria-hidden="true"></i> Admin</button>
        <ul class="dropdown-menu dropdown-menu-end"><li><a class="dropdown-item" href="#">Profile</a></li><li><hr class="dropdown-divider"></li><li><a class="dropdown-item text-danger" href="#">Logout</a></li></ul>
      </div>
    </div>
  </div>
</nav>

<div class="d-flex">
  <aside class="offcanvas-lg offcanvas-start bg-dark border-end" data-bs-theme="dark" tabindex="-1" id="sidebar" aria-labelledby="sidebarLabel" style="width:220px">
    <div class="offcanvas-header"><h5 class="offcanvas-title text-white" id="sidebarLabel">Menu</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" data-bs-target="#sidebar" aria-label="Close"></button></div>
    <div class="offcanvas-body p-0">
      <nav class="nav nav-pills flex-column p-2 w-100" id="sideNav">
        <a class="nav-link active" aria-current="page" href="#"><i class="bi bi-speedometer2 me-2" aria-hidden="true"></i>Dashboard</a>
        <a class="nav-link text-white-50" href="#"><i class="bi bi-receipt me-2" aria-hidden="true"></i>Orders</a>
        <a class="nav-link text-white-50" href="#"><i class="bi bi-box-seam me-2" aria-hidden="true"></i>Products</a>
        <a class="nav-link text-white-50" href="#"><i class="bi bi-people me-2" aria-hidden="true"></i>Customers</a>
        <a class="nav-link text-white-50" href="#"><i class="bi bi-gear me-2" aria-hidden="true"></i>Settings</a>
      </nav>
    </div>
  </aside>

  <main class="flex-grow-1 p-3 overflow-hidden">
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
      <h1 class="h4 mb-0">Dashboard</h1>
      <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#orderModal"><i class="bi bi-plus-lg" aria-hidden="true"></i> Add order</button>
    </div>

    <div class="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-3" id="kpis"></div>

    <div class="row g-3 mb-3">
      <div class="col-lg-7">
        <div class="card h-100"><div class="card-header bg-transparent fw-semibold">Weekly sales (Rs thousand)</div>
          <div class="card-body"><div class="d-flex align-items-end gap-2" style="height:160px" id="chart"></div></div></div>
      </div>
      <div class="col-lg-5">
        <div class="card h-100"><div class="card-header bg-transparent fw-semibold">Top categories</div>
          <ul class="list-group list-group-flush" id="cats"></ul></div>
      </div>
    </div>

    <div class="card">
      <div class="card-header bg-transparent d-flex flex-wrap gap-2 align-items-center">
        <span class="fw-semibold me-auto">Recent orders</span>
        <label for="search" class="visually-hidden">Search customer</label>
        <input id="search" class="form-control form-control-sm w-auto" placeholder="Search customer">
        <label for="statusFilter" class="visually-hidden">Status filter</label>
        <select id="statusFilter" class="form-select form-select-sm w-auto"><option>All</option><option>Delivered</option><option>Pending</option><option>Cancelled</option></select>
      </div>
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0">
          <thead class="table-light"><tr><th scope="col">Order</th><th scope="col">Customer</th><th scope="col" class="text-end">Amount</th><th scope="col">Status</th><th scope="col" class="text-end">Action</th></tr></thead>
          <tbody id="tbody"></tbody>
        </table>
      </div>
      <div class="card-footer bg-transparent d-flex justify-content-between align-items-center">
        <small class="text-body-secondary" id="info"></small>
        <nav aria-label="Orders pages"><ul class="pagination pagination-sm mb-0" id="pager"></ul></nav>
      </div>
    </div>
  </main>
</div>

<div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="orderTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <form class="modal-content needs-validation" id="orderForm" novalidate>
      <div class="modal-header"><h2 class="modal-title fs-5" id="orderTitle">Add order</h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">
        <div class="form-floating mb-3"><input id="cust" class="form-control" placeholder="Customer" required minlength="2"><label for="cust">Customer name</label><div class="invalid-feedback">Enter a customer name.</div></div>
        <div class="input-group has-validation mb-3"><span class="input-group-text">Rs</span>
          <div class="form-floating"><input id="amt" type="number" class="form-control" placeholder="Amount" required min="1" max="100000"><label for="amt">Amount</label>
          <div class="invalid-feedback">Amount must be 1 – 100000.</div></div></div>
        <div class="form-floating"><select id="st" class="form-select"><option>Pending</option><option>Delivered</option><option>Cancelled</option></select><label for="st">Status</label></div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button type="submit" class="btn btn-primary">Save order</button></div>
    </form>
  </div>
</div>

<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="toast" class="toast align-items-center border-0" role="status" aria-live="polite" aria-atomic="true">
    <div class="d-flex"><div class="toast-body" id="toastMsg"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>
  </div>
</div>`,
        js: `const orders = [
  { id: 1012, customer: 'Asha Patil', amount: 1200, status: 'Delivered' },
  { id: 1011, customer: 'Rahul Verma', amount: 850, status: 'Pending' },
  { id: 1010, customer: 'Neha Joshi', amount: 4300, status: 'Delivered' },
  { id: 1009, customer: 'Vikram Rao', amount: 560, status: 'Cancelled' },
  { id: 1008, customer: 'Sara Khan', amount: 2200, status: 'Delivered' },
  { id: 1007, customer: 'Imran Shaikh', amount: 990, status: 'Pending' },
  { id: 1006, customer: 'Pooja Nair', amount: 3150, status: 'Delivered' },
  { id: 1005, customer: 'Karan Mehta', amount: 720, status: 'Delivered' }
];
const sales = [12, 18, 9, 22, 30, 26, 34];
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const cats = [['Electronics', 42, 'primary'], ['Fashion', 28, 'success'], ['Home', 18, 'warning'], ['Books', 12, 'info']];
const badge = { Delivered: 'success', Pending: 'warning', Cancelled: 'danger' };
let nextId = 1013, page = 1;
const perPage = 5;
const $ = function (id) { return document.getElementById(id); };
const inr = function (n) { return 'Rs ' + n.toLocaleString('en-IN'); };

function renderKpis() {
  const revenue = orders.filter(function (o) { return o.status === 'Delivered'; }).reduce(function (s, o) { return s + o.amount; }, 0);
  const pending = orders.filter(function (o) { return o.status === 'Pending'; }).length;
  const customers = new Set(orders.map(function (o) { return o.customer; })).size;
  const k = [
    ['Revenue', inr(revenue), 'bi-currency-rupee', 'primary'],
    ['Orders', orders.length, 'bi-receipt', 'success'],
    ['Pending', pending, 'bi-hourglass-split', 'warning'],
    ['Customers', customers, 'bi-people', 'info']
  ];
  $('kpis').innerHTML = k.map(function (x) {
    return '<div class="col"><div class="card h-100"><div class="card-body d-flex justify-content-between align-items-center">' +
      '<div><div class="text-body-secondary small">' + x[0] + '</div><div class="fs-4 fw-bold">' + x[1] + '</div></div>' +
      '<div class="bg-' + x[3] + '-subtle text-' + x[3] + '-emphasis rounded-3 d-flex align-items-center justify-content-center fs-4" style="width:3rem;height:3rem">' +
      '<i class="bi ' + x[2] + '" aria-hidden="true"></i></div></div></div></div>';
  }).join('');
}

function renderChart() {
  const max = Math.max.apply(null, sales);
  $('chart').innerHTML = sales.map(function (v, i) {
    return '<div class="flex-fill d-flex flex-column align-items-center h-100 justify-content-end">' +
      '<small class="text-body-secondary">' + v + '</small>' +
      '<div class="w-100 bg-primary rounded-top" style="height:' + (v / max * 80) + '%" data-bs-toggle="tooltip" data-bs-title="' + days[i] + ': Rs ' + v + 'k"></div>' +
      '<small>' + days[i] + '</small></div>';
  }).join('');
  $('cats').innerHTML = cats.map(function (c) {
    return '<li class="list-group-item"><div class="d-flex justify-content-between small"><span>' + c[0] + '</span><span>' + c[1] + '%</span></div>' +
      '<div class="progress" role="progressbar" aria-label="' + c[0] + '" aria-valuenow="' + c[1] + '" aria-valuemin="0" aria-valuemax="100" style="height:6px">' +
      '<div class="progress-bar bg-' + c[2] + '" style="width:' + c[1] + '%"></div></div></li>';
  }).join('');
}

function filtered() {
  const q = $('search').value.toLowerCase();
  const s = $('statusFilter').value;
  return orders.filter(function (o) { return o.customer.toLowerCase().includes(q) && (s === 'All' || o.status === s); });
}

function initTooltips(root) {
  root.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(function (el) { bootstrap.Tooltip.getOrCreateInstance(el); });
}

function renderTable() {
  const list = filtered();
  const pages = Math.max(1, Math.ceil(list.length / perPage));
  page = Math.min(page, pages);
  document.querySelectorAll('#tbody [data-bs-toggle="tooltip"]').forEach(function (el) { const t = bootstrap.Tooltip.getInstance(el); if (t) t.dispose(); });
  const rows = list.slice((page - 1) * perPage, page * perPage);
  $('tbody').innerHTML = rows.length ? rows.map(function (o) {
    return '<tr><td>#' + o.id + '</td><td>' + o.customer + '</td><td class="text-end">' + inr(o.amount) + '</td>' +
      '<td><span class="badge text-bg-' + badge[o.status] + '">' + o.status + '</span></td>' +
      '<td class="text-end"><button class="btn btn-sm btn-outline-danger" data-del="' + o.id + '" data-bs-toggle="tooltip" data-bs-title="Delete order #' + o.id + '" aria-label="Delete order ' + o.id + '">' +
      '<i class="bi bi-trash" aria-hidden="true"></i></button></td></tr>';
  }).join('') : '<tr><td colspan="5" class="text-center text-body-secondary py-4">No orders found</td></tr>';
  $('info').textContent = 'Showing ' + rows.length + ' of ' + list.length + ' orders';
  let p = '';
  for (let i = 1; i <= pages; i++) {
    p += '<li class="page-item' + (i === page ? ' active' : '') + '"><a class="page-link" href="#" data-page="' + i + '"' + (i === page ? ' aria-current="page"' : '') + '>' + i + '</a></li>';
  }
  $('pager').innerHTML = p;
  initTooltips($('tbody'));
  renderKpis();
}

function toast(msg, color) {
  const el = $('toast');
  el.className = 'toast align-items-center border-0 text-bg-' + color;
  $('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(el, { delay: 2500 }).show();
}

$('search').addEventListener('input', function () { page = 1; renderTable(); });
$('statusFilter').addEventListener('change', function () { page = 1; renderTable(); });
$('pager').addEventListener('click', function (e) {
  const a = e.target.closest('[data-page]');
  if (!a) return;
  e.preventDefault();
  page = Number(a.dataset.page);
  renderTable();
});
$('tbody').addEventListener('click', function (e) {
  const b = e.target.closest('[data-del]');
  if (!b) return;
  const id = Number(b.dataset.del);
  const idx = orders.findIndex(function (o) { return o.id === id; });
  const t = bootstrap.Tooltip.getInstance(b); if (t) t.dispose();
  orders.splice(idx, 1);
  renderTable();
  toast('Order #' + id + ' deleted', 'danger');
  console.log('Deleted order', id);
});

const form = $('orderForm');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
  const o = { id: nextId++, customer: $('cust').value.trim(), amount: Number($('amt').value), status: $('st').value };
  orders.unshift(o);
  bootstrap.Modal.getInstance($('orderModal')).hide();
  form.reset();
  form.classList.remove('was-validated');
  page = 1;
  renderTable();
  toast('Order #' + o.id + ' added for ' + o.customer, 'success');
  console.log('Added', JSON.stringify(o));
});
$('orderModal').addEventListener('shown.bs.modal', function () { $('cust').focus(); });

$('sideNav').addEventListener('click', function (e) {
  const a = e.target.closest('.nav-link');
  if (!a) return;
  e.preventDefault();
  document.querySelectorAll('#sideNav .nav-link').forEach(function (l) { l.classList.remove('active'); l.classList.add('text-white-50'); l.removeAttribute('aria-current'); });
  a.classList.add('active'); a.classList.remove('text-white-50'); a.setAttribute('aria-current', 'page');
  const oc = bootstrap.Offcanvas.getInstance($('sidebar')); if (oc) oc.hide();
});

$('darkSwitch').addEventListener('change', function (e) {
  document.documentElement.setAttribute('data-bs-theme', e.target.checked ? 'dark' : 'light');
  try { localStorage.setItem('shopadmin-theme', e.target.checked ? 'dark' : 'light'); } catch (err) {}
});
try {
  if (localStorage.getItem('shopadmin-theme') === 'dark') { $('darkSwitch').checked = true; document.documentElement.setAttribute('data-bs-theme', 'dark'); }
} catch (err) {}

renderChart();
initTooltips($('chart'));
renderTable();
console.log('Dashboard ready with', orders.length, 'orders');`,
      },
      result: 'A full admin screen: on wide previews a dark sidebar sits on the left; on narrow ones it hides behind a menu button and slides in. Four KPI cards show revenue, orders, pending and customers. A blue bar chart shows weekly sales with tooltips; category progress bars sit beside it. The orders table supports search, status filter, pagination and delete (with tooltip and red toast). "Add order" opens a validated modal; saving adds the row, updates KPIs and shows a green toast. The moon switch toggles dark mode and remembers it.',
      explanation: 'The page follows a data → render → delegate pattern: arrays hold state, render functions build HTML strings, and single delegated listeners handle dynamic buttons. offcanvas-lg gives a sidebar that is static on lg+ and an offcanvas below. Tooltips are disposed before rows are replaced to avoid orphaned popups. Modal.getInstance hides the modal opened via the data API.',
    },
    {
      title: 'Practical Test Model Solution: FoodieHub Cards + Order Modal + Toast (Tasks 1–3)',
      scenario: 'Model answer for the first three practical-test tasks: dark collapsing navbar with cart badge, an 8-item responsive card grid from an array, one shared order modal with validated quantity and a confirmation toast that also updates the cart badge.',
      steps: [
        'Navbar: navbar-expand-md bg-dark data-bs-theme="dark" with a cart button + badge',
        'Grid: row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4, cards from a dishes array',
        'Order buttons carry data-bs-toggle="modal", data-bs-target and data-dish',
        'In show.bs.modal read relatedTarget to fill the dish name; validate quantity 1–10',
        'On confirm: hide modal, show toast "2 x Paneer Tikka added", update cart badge',
      ],
      code: `orderModal.addEventListener('show.bs.modal', e => {
  current = e.relatedTarget.dataset.dish;
  dishName.textContent = current;
  qty.value = 1;
  form.classList.remove('was-validated');
});
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) return form.classList.add('was-validated');
  cart += Number(qty.value);
  cartBadge.textContent = cart;
  bootstrap.Modal.getInstance(orderModal).hide();
  toastMsg.textContent = qty.value + ' x ' + current + ' added';
  bootstrap.Toast.getOrCreateInstance(toastEl).show();
});`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<nav class="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand fw-bold" href="#"><i class="bi bi-egg-fried" aria-hidden="true"></i> FoodieHub</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#fhNav" aria-controls="fhNav" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="fhNav">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Offers</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
      </ul>
      <button class="btn btn-outline-light position-relative" aria-label="Cart">
        <i class="bi bi-cart3" aria-hidden="true"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cartBadge">0</span>
      </button>
    </div>
  </div>
</nav>
<div class="container py-4">
  <div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4" id="dishes"></div>
</div>
<div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="omTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <form class="modal-content" id="omForm" novalidate>
      <div class="modal-header"><h2 class="modal-title fs-5" id="omTitle">Order <span id="dishName"></span></h2><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body">
        <label for="qty" class="form-label">Quantity</label>
        <input id="qty" type="number" class="form-control" min="1" max="10" required value="1">
        <div class="invalid-feedback">Quantity must be between 1 and 10.</div>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button><button class="btn btn-success" type="submit">Add to cart</button></div>
    </form>
  </div>
</div>
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="fhToast" class="toast text-bg-success border-0" role="status" aria-live="polite" aria-atomic="true">
    <div class="d-flex"><div class="toast-body" id="toastMsg"></div><button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>
  </div>
</div>`,
        js: `const dishes = [
  ['Paneer Tikka', 249, 4.5, 1080], ['Veg Biryani', 199, 4, 1060], ['Masala Dosa', 129, 4.5, 1059], ['Butter Chicken', 329, 5, 1074],
  ['Chole Bhature', 149, 3.5, 1068], ['Pav Bhaji', 119, 4, 1070], ['Fish Curry', 299, 4, 1062], ['Gulab Jamun', 89, 4.5, 1067]
];
function stars(r) {
  let s = '';
  for (let i = 1; i <= 5; i++) s += '<i class="bi ' + (r >= i ? 'bi-star-fill' : r >= i - 0.5 ? 'bi-star-half' : 'bi-star') + '" aria-hidden="true"></i>';
  return s + '<span class="visually-hidden">Rated ' + r + ' out of 5</span>';
}
document.getElementById('dishes').innerHTML = dishes.map(function (d) {
  return '<div class="col"><div class="card h-100 shadow-sm">' +
    '<img src="https://picsum.photos/id/' + d[3] + '/400/250" class="card-img-top object-fit-cover" style="height:160px" alt="' + d[0] + '">' +
    '<div class="card-body d-flex flex-column"><h3 class="h6 card-title">' + d[0] + '</h3>' +
    '<div class="text-warning small mb-1">' + stars(d[2]) + '</div><p class="fw-bold mb-3">Rs ' + d[1] + '</p>' +
    '<button class="btn btn-primary mt-auto" data-bs-toggle="modal" data-bs-target="#orderModal" data-dish="' + d[0] + '">Order</button></div></div></div>';
}).join('');

let cart = 0, current = '';
const modalEl = document.getElementById('orderModal');
const form = document.getElementById('omForm');
const qty = document.getElementById('qty');
modalEl.addEventListener('show.bs.modal', function (e) {
  current = e.relatedTarget.dataset.dish;
  document.getElementById('dishName').textContent = current;
  qty.value = 1;
  form.classList.remove('was-validated');
});
modalEl.addEventListener('shown.bs.modal', function () { qty.focus(); qty.select(); });
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
  cart += Number(qty.value);
  document.getElementById('cartBadge').textContent = cart;
  bootstrap.Modal.getInstance(modalEl).hide();
  const msg = qty.value + ' x ' + current + ' added';
  document.getElementById('toastMsg').textContent = msg;
  bootstrap.Toast.getOrCreateInstance(document.getElementById('fhToast')).show();
  console.log(msg, '| cart total items:', cart);
});`,
      },
      result: 'A dark FoodieHub navbar with a cart badge and eight dish cards (1/2/4 per row). Clicking Order opens a small modal titled with that dish; entering 0 or 11 shows a red error; entering 2 for Paneer Tikka closes the modal, shows "2 x Paneer Tikka added" and the cart badge becomes 2.',
      explanation: 'One modal serves all cards because show.bs.modal exposes the trigger (relatedTarget) and its data-dish. min/max/required plus checkValidity give validation without extra code. Modal.getInstance hides the instance created by the data API, and the toast confirms the action.',
    },
  ],
  interview: [
    { q: 'What is Bootstrap and why would you choose it for a project?', a: 'An open-source front-end toolkit with a responsive grid, components and utilities. Choose it for fast development, consistent design, built-in responsiveness and accessibility, and a large community, especially for admin panels, dashboards and MVPs.', level: 'Easy' },
    { q: 'What are the main changes in Bootstrap 5 compared to 4?', a: 'No jQuery, no IE, data-bs-* attributes, start/end instead of left/right, xxl breakpoint, utility API, offcanvas, floating labels, CSS variables, new form classes (form-select, form-check), gutters g-*, and 5.3 color modes.', level: 'Medium' },
    { q: 'Explain the Bootstrap grid system.', a: 'A flexbox-based 12-column system: container → row → col. Columns use .col-{bp}-{n} classes that apply from that breakpoint upward; rows wrap when the total exceeds 12; gutters come from column padding offset by row negative margins.', level: 'Easy' },
    { q: 'List the breakpoints and their widths.', a: 'xs <576, sm ≥576, md ≥768, lg ≥992, xl ≥1200, xxl ≥1400 px.', level: 'Easy' },
    { q: 'Difference between .container, .container-fluid and .container-md?', a: '.container has responsive fixed max-widths, .container-fluid is always 100%, .container-md is 100% until md then fixed.', level: 'Easy' },
    { q: 'How would you build a layout that shows 1 card on mobile, 2 on tablets and 4 on desktops?', a: '<div class="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4"> with .col children (or col-12 col-md-6 col-lg-3 on each column).', level: 'Easy' },
    { q: 'How do you make all cards in a row the same height with buttons aligned at the bottom?', a: 'Add h-100 to each card, make card-body d-flex flex-column, and add mt-auto to the button.', level: 'Medium' },
    { q: 'How do you hide an element on mobile but show it on desktop?', a: 'class="d-none d-lg-block" (or d-lg-flex for flex containers).', level: 'Easy' },
    { q: 'Explain the spacing utility naming convention.', a: '{m|p}{t|b|s|e|x|y|blank}-{bp?}-{0-5|auto}: e.g. mt-3, px-md-4, mx-auto. Scale: 0, .25, .5, 1, 1.5, 3 rem.', level: 'Easy' },
    { q: 'What is the difference between offset-* and order-*?', a: 'offset-* adds margin-left to move a column right; order-* changes visual order via the flex order property without changing the DOM.', level: 'Medium' },
    { q: 'How does the navbar collapse work?', a: 'navbar-expand-{bp} decides when the menu is horizontal. Below it, .navbar-collapse is hidden; the .navbar-toggler with data-bs-toggle="collapse" and data-bs-target toggles it via the Collapse plugin.', level: 'Medium' },
    { q: 'Which components need manual JavaScript initialisation?', a: 'Tooltips and popovers (opt-in), and toasts (need .show()). Others work via data attributes.', level: 'Medium' },
    { q: 'How do you pass data to a modal from the button that opened it?', a: 'Listen to show.bs.modal on the modal; event.relatedTarget is the trigger button. Read its data-* attributes and update the modal content.', level: 'Medium' },
    { q: 'What is getOrCreateInstance?', a: 'A static method on each component class that returns the existing instance for an element or creates one, preventing duplicate instances.', level: 'Medium' },
    { q: 'Explain Bootstrap form validation.', a: 'Use HTML5 constraints, add novalidate to the form, on submit call checkValidity(), prevent submission if invalid, and add .was-validated to show :valid/:invalid styles and feedback. For server errors use .is-invalid on fields.', level: 'Medium' },
    { q: 'How do floating labels work?', a: '.form-floating wrapper, the input before the label and a placeholder on the input; CSS uses :placeholder-shown and :focus to move the label.', level: 'Medium' },
    { q: 'What is an input group?', a: 'A .input-group wrapper that attaches text (.input-group-text), buttons or dropdowns to an input, forming one control (e.g. currency or search).', level: 'Easy' },
    { q: 'How do you customise Bootstrap\'s primary colour properly?', a: 'Best: override $primary in Sass before importing Bootstrap and recompile. At runtime/CDN: override component CSS variables like --bs-btn-bg for buttons and --bs-primary/--bs-primary-rgb for utilities.', level: 'Medium' },
    { q: 'How do you implement dark mode in Bootstrap 5.3?', a: 'Set data-bs-theme="dark" on <html> or any element; use adaptive classes (bg-body-tertiary, text-body-emphasis); toggle with JS and persist with localStorage; respect prefers-color-scheme for auto.', level: 'Medium' },
    { q: 'What is the difference between Sass variables and CSS variables in Bootstrap?', a: 'Sass variables are compile-time and generate static CSS; CSS variables (--bs-*) live in the browser and can change at runtime or per scope.', level: 'Medium' },
    { q: 'How can you reduce Bootstrap\'s bundle size?', a: 'Import only needed Sass partials, remove unused utilities via the utility API, PurgeCSS, and import only required JS plugins (e.g. bootstrap/js/dist/modal).', level: 'Hard' },
    { q: 'Why shouldn\'t you use Bootstrap JS directly in React?', a: 'It manipulates the DOM outside React\'s control, causing state mismatches. Use react-bootstrap (state-controlled components) or wrap plugins in useEffect with cleanup.', level: 'Medium' },
    { q: 'How do you make a sidebar that is fixed on desktop and slides in on mobile?', a: 'Use .offcanvas-lg (or another breakpoint) on the sidebar: below lg it behaves as an offcanvas toggled by a button; from lg it is rendered as normal content in a flex layout.', level: 'Hard' },
    { q: 'How do you make a table work on small screens?', a: 'Wrap it in .table-responsive for horizontal scrolling; optionally hide less important columns with d-none d-md-table-cell or switch to a card layout on mobile.', level: 'Medium' },
    { q: 'What accessibility practices should a Bootstrap project follow?', a: 'Semantic HTML, labels for inputs, aria-label for icon buttons, aria-hidden on decorative icons, aria-current for active links, sufficient contrast, keyboard operability, skip links (.visually-hidden-focusable), and correct ARIA on dynamic components.', level: 'Medium' },
    { q: 'What is .stretched-link?', a: 'A class that makes a link\'s clickable area cover its nearest positioned ancestor (e.g. the whole card) via an ::after pseudo-element.', level: 'Medium' },
    { q: 'Difference between .d-none, .invisible and .visually-hidden?', a: 'd-none removes it from layout and accessibility tree; invisible hides it but keeps its space; visually-hidden hides it visually but keeps it readable by screen readers.', level: 'Medium' },
    { q: 'How do you create a responsive embedded video?', a: 'Wrap the iframe in <div class="ratio ratio-16x9">.', level: 'Easy' },
    { q: 'What is the Bootstrap utility API used for?', a: 'Generating, modifying or removing utility classes through the $utilities Sass map, e.g. adding cursor or opacity-on-hover utilities with responsive and state variants.', level: 'Hard' },
    { q: 'Bootstrap vs Tailwind: when would you choose each?', a: 'Bootstrap for fast, consistent UIs with ready components (admin panels, prototypes, teams familiar with it). Tailwind for highly custom designs with utility-first styling and small purged CSS. Bootstrap needs more overriding for unique designs; Tailwind needs building components yourself.', level: 'Medium' },
    { q: 'A dropdown or tooltip throws "Popper is not defined". Why?', a: 'You loaded bootstrap.min.js without Popper. Load bootstrap.bundle.min.js (includes Popper) or include Popper before Bootstrap JS.', level: 'Easy' },
    { q: 'Walk through how you would build an admin dashboard with Bootstrap.', a: 'Top navbar with toggler; d-flex shell with an offcanvas-lg sidebar and main area; KPI cards with row-cols grid; chart in a card; table-responsive orders table with filters and pagination; modals with validated forms for CRUD; toasts for feedback; tooltips on icon actions; dark mode via data-bs-theme; accessibility checks.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Practical test tasks 1–3 (model solution): FoodieHub navbar, 8-dish card grid from an array, one shared order modal with quantity validation and a confirmation toast.',
      hint: 'See the third example; key parts are row-cols, data-dish on buttons, show.bs.modal + relatedTarget, checkValidity, Modal.getInstance().hide(), Toast.show().',
      solution: `<!-- Navbar -->
<nav class="navbar navbar-expand-md bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="#">FoodieHub</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#fh" aria-controls="fh" aria-expanded="false" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="fh">
      <ul class="navbar-nav me-auto">
        <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Offers</a></li>
        <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
      </ul>
      <button class="btn btn-outline-light position-relative" aria-label="Cart"><i class="bi bi-cart3" aria-hidden="true"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" id="cartBadge">0</span></button>
    </div>
  </div>
</nav>

<!-- Grid -->
<div class="container py-4"><div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4" id="dishes"></div></div>

<!-- Modal -->
<div class="modal fade" id="orderModal" tabindex="-1" aria-labelledby="omTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-sm">
    <form class="modal-content" id="omForm" novalidate>
      <div class="modal-header"><h2 class="modal-title fs-5" id="omTitle">Order <span id="dishName"></span></h2>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body"><label for="qty" class="form-label">Quantity</label>
        <input id="qty" type="number" class="form-control" min="1" max="10" required value="1">
        <div class="invalid-feedback">Quantity must be between 1 and 10.</div></div>
      <div class="modal-footer"><button class="btn btn-success" type="submit">Add to cart</button></div>
    </form>
  </div>
</div>

<!-- Toast -->
<div class="toast-container position-fixed bottom-0 end-0 p-3">
  <div id="fhToast" class="toast text-bg-success" role="status" aria-live="polite"><div class="toast-body" id="toastMsg"></div></div>
</div>

<script>
const dishes = [['Paneer Tikka', 249], ['Veg Biryani', 199], ['Masala Dosa', 129], ['Butter Chicken', 329],
                ['Chole Bhature', 149], ['Pav Bhaji', 119], ['Fish Curry', 299], ['Gulab Jamun', 89]];
document.getElementById('dishes').innerHTML = dishes.map(([name, price], i) =>
  '<div class="col"><div class="card h-100"><img src="https://picsum.photos/400/250?' + i + '" class="card-img-top" alt="' + name + '">' +
  '<div class="card-body d-flex flex-column"><h3 class="h6">' + name + '</h3><p class="fw-bold">Rs ' + price + '</p>' +
  '<button class="btn btn-primary mt-auto" data-bs-toggle="modal" data-bs-target="#orderModal" data-dish="' + name + '">Order</button></div></div></div>'
).join('');

let cart = 0, current = '';
const modalEl = document.getElementById('orderModal');
const form = document.getElementById('omForm');
modalEl.addEventListener('show.bs.modal', e => {
  current = e.relatedTarget.dataset.dish;
  document.getElementById('dishName').textContent = current;
  form.reset();
  form.classList.remove('was-validated');
});
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
  const q = Number(document.getElementById('qty').value);
  cart += q;
  document.getElementById('cartBadge').textContent = cart;
  bootstrap.Modal.getInstance(modalEl).hide();
  document.getElementById('toastMsg').textContent = q + ' x ' + current + ' added';
  bootstrap.Toast.getOrCreateInstance('#fhToast').show();
});
</script>`,
    },
    {
      task: 'Practical test task 4: add a Veg / Non-veg / All segmented control and a live search that filter the dish cards.',
      hint: 'Store a veg flag per dish; btn-check radios; render() filters by both values.',
      solution: `<div class="d-flex flex-wrap gap-2 mb-3">
  <div class="btn-group" role="group" aria-label="Diet filter">
    <input type="radio" class="btn-check" name="diet" id="dAll" value="all" checked><label class="btn btn-outline-dark" for="dAll">All</label>
    <input type="radio" class="btn-check" name="diet" id="dVeg" value="veg"><label class="btn btn-outline-success" for="dVeg">Veg</label>
    <input type="radio" class="btn-check" name="diet" id="dNon" value="nonveg"><label class="btn btn-outline-danger" for="dNon">Non-veg</label>
  </div>
  <label for="q" class="visually-hidden">Search dishes</label>
  <input id="q" class="form-control w-auto" placeholder="Search dishes">
</div>
<div class="row row-cols-1 row-cols-md-2 row-cols-xl-4 g-4" id="dishes"></div>
<script>
const dishes = [
  { name: 'Paneer Tikka', veg: true }, { name: 'Veg Biryani', veg: true }, { name: 'Butter Chicken', veg: false },
  { name: 'Fish Curry', veg: false }, { name: 'Masala Dosa', veg: true }, { name: 'Chicken 65', veg: false }
];
function render() {
  const diet = document.querySelector('input[name="diet"]:checked').value;
  const q = document.getElementById('q').value.toLowerCase();
  const list = dishes.filter(d =>
    (diet === 'all' || (diet === 'veg') === d.veg) && d.name.toLowerCase().includes(q));
  document.getElementById('dishes').innerHTML = list.length
    ? list.map(d => '<div class="col"><div class="card h-100"><div class="card-body">' +
        '<span class="badge ' + (d.veg ? 'text-bg-success' : 'text-bg-danger') + '">' + (d.veg ? 'Veg' : 'Non-veg') + '</span>' +
        '<h3 class="h6 mt-2">' + d.name + '</h3></div></div></div>').join('')
    : '<p class="text-body-secondary">No dishes match.</p>';
}
document.querySelectorAll('input[name="diet"]').forEach(r => r.addEventListener('change', render));
document.getElementById('q').addEventListener('input', render);
render();
</script>`,
    },
    {
      task: 'Practical test task 6: a dark-mode toggle button with sun/moon icons that persists in localStorage and applies before first paint.',
      hint: 'Inline script in <head> reads localStorage and sets data-bs-theme; button toggles and saves.',
      solution: `<!-- in <head>, before CSS, to avoid a flash -->
<script>
  (function () {
    var t = localStorage.getItem('theme') ||
      (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    document.documentElement.setAttribute('data-bs-theme', t);
  })();
</script>

<!-- in the navbar -->
<button class="btn btn-outline-secondary" id="themeBtn" aria-label="Toggle dark mode">
  <i class="bi" id="themeIcon" aria-hidden="true"></i>
</button>

<script>
const root = document.documentElement;
const icon = document.getElementById('themeIcon');
function paint() {
  const dark = root.getAttribute('data-bs-theme') === 'dark';
  icon.className = 'bi ' + (dark ? 'bi-sun-fill' : 'bi-moon-stars-fill');
}
document.getElementById('themeBtn').addEventListener('click', () => {
  const next = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
  root.setAttribute('data-bs-theme', next);
  localStorage.setItem('theme', next);
  paint();
});
paint();
</script>`,
    },
    {
      task: 'Extend the admin dashboard: add an "Edit" button per row that opens the same modal pre-filled with the order, and saves changes instead of adding a new order.',
      hint: 'Keep an editingId variable; in the Edit click handler fill the form and call Modal.getOrCreateInstance().show(); on submit update or insert based on editingId.',
      solution: `// inside rowHtml add:
// '<button class="btn btn-sm btn-outline-primary me-1" data-edit="' + o.id + '" aria-label="Edit order ' + o.id + '"><i class="bi bi-pencil" aria-hidden="true"></i></button>'

let editingId = null;
const modal = bootstrap.Modal.getOrCreateInstance('#orderModal');

document.getElementById('tbody').addEventListener('click', e => {
  const b = e.target.closest('[data-edit]');
  if (!b) return;
  const o = orders.find(x => x.id === Number(b.dataset.edit));
  editingId = o.id;
  document.getElementById('orderTitle').textContent = 'Edit order #' + o.id;
  document.getElementById('cust').value = o.customer;
  document.getElementById('amt').value = o.amount;
  document.getElementById('st').value = o.status;
  modal.show();
});

document.getElementById('orderModal').addEventListener('hidden.bs.modal', () => {
  editingId = null;
  document.getElementById('orderTitle').textContent = 'Add order';
  form.reset();
  form.classList.remove('was-validated');
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.classList.add('was-validated'); return; }
  const data = {
    customer: document.getElementById('cust').value.trim(),
    amount: Number(document.getElementById('amt').value),
    status: document.getElementById('st').value
  };
  if (editingId) {
    Object.assign(orders.find(o => o.id === editingId), data);
    toast('Order #' + editingId + ' updated', 'primary');
  } else {
    orders.unshift({ id: nextId++, ...data });
    toast('Order added', 'success');
  }
  modal.hide();
  renderTable();
});`,
    },
    {
      task: 'Make the landing page footer and hero fully keyboard- and screen-reader-friendly: add a skip link, ensure one h1, aria-labels on social icons and aria-current on the active nav link. List the changes.',
      hint: 'visually-hidden-focusable, heading levels, aria-label on icon links, aria-hidden on icons.',
      solution: `<!-- 1. Skip link as the first element in <body> -->
<a class="visually-hidden-focusable" href="#main">Skip to main content</a>

<!-- 2. Active nav link -->
<a class="nav-link active" aria-current="page" href="#">Home</a>

<!-- 3. Exactly one h1 (hero), sections use h2, cards use h3 -->
<h1 class="display-4 fw-bold">Organise work. Ship faster.</h1>
<h2 class="fw-bold">Simple pricing</h2>
<h3 class="h5">Kanban boards</h3>

<!-- 4. Main landmark target -->
<main id="main">...</main>

<!-- 5. Social icon links -->
<a class="link-secondary" href="https://github.com/" aria-label="TaskFlow on GitHub">
  <i class="bi bi-github" aria-hidden="true"></i>
</a>

<!-- 6. Images with meaningful alt; decorative ones alt="" -->
<img src="hero.jpg" class="img-fluid" alt="Team planning tasks on a TaskFlow board">`,
    },
  ],
  quiz: [
    { question: 'Which class combination makes a sidebar static on desktop but an offcanvas on mobile?', options: ['offcanvas d-lg-block', 'offcanvas-lg offcanvas-start', 'collapse-lg sidebar', 'offcanvas-start d-none d-lg-flex'], answer: 1, explanation: 'Responsive offcanvas classes like offcanvas-lg switch behaviour at the breakpoint.' },
    { question: 'In a pricing section, what makes three cards equal height with buttons at the bottom?', options: ['card-group only', 'align-items-end on the row', 'h-100 on cards + d-flex flex-column on body + mt-auto on the button', 'Fixed height in px'], answer: 2, explanation: 'Flex column with mt-auto pushes the button down; h-100 equalises heights.' },
    { question: 'You add table rows dynamically that contain tooltip buttons. What must you do?', options: ['Nothing, tooltips auto-initialise', 'Reload the page', 'Use data-toggle instead', 'Initialise tooltips for the new elements (and dispose old ones)'], answer: 3, explanation: 'Tooltips are opt-in and must be created for new elements.' },
    { question: 'Which is the correct way to close a modal after saving a form inside it?', options: ['bootstrap.Modal.getInstance(modalEl).hide()', 'modalEl.style.display = "none"', 'modalEl.remove()', 'modalEl.classList.remove("show")'], answer: 0, explanation: 'Use the component API so the backdrop, focus and body classes are cleaned up.' },
    { question: 'Which attribute on <html> switches the entire Bootstrap 5.3 page to dark mode?', options: ['class="dark"', 'data-theme="dark"', 'data-bs-theme="dark"', 'theme="dark"'], answer: 2, explanation: 'Color modes are driven by data-bs-theme.' },
  ],
};
