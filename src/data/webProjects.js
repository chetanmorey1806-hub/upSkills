// Web Development final projects. Students build them in the browser (HTML/CSS/JS or React) and
// automated checks run inside a fresh, sandboxed copy of their page.
// Test helpers (see components/webProjectRunner.js): $, $$, wait, click, type, select, submit, btn,
// text, visible, expect, mockFetch, SRC ({html, css, js, jsx}). A test passes unless it throws or returns false.
// `seed` pre-fills the page's localStorage before the student's code runs.

const RUBRIC = [
  ['Automated checks pass', 50],
  ['Milestones completed', 20],
  ['Design & responsiveness: looks good on mobile and desktop', 10],
  ['Code quality: semantic HTML, clean CSS, readable JS', 10],
  ['Presentation: can explain how it works in an interview', 10],
];

export const WEB_PROJECTS = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: 'web-portfolio', icon: '👤', level: 'Beginner', hours: '4-6 hours', track: 'HTML & CSS', mode: 'web',
    title: 'Personal Portfolio Website',
    summary: 'A one-page portfolio with navigation, about, skills, projects and a contact form: semantic HTML, Flexbox/Grid and a responsive layout.',
    skills: ['Semantic HTML', 'Forms', 'Flexbox / Grid', 'Media queries'],
    story: 'Recruiters look at your portfolio before your resume. Build a clean one-page site that introduces you, lists your skills and projects and lets people contact you. It must work on a phone too.',
    requirements: [
      'A `<nav>` inside the `<header>` with links to `#about`, `#skills`, `#projects` and `#contact`',
      'Four `<section>`s with those ids, each with an `<h2>` heading',
      'In `#about`: your photo (`<img>` with meaningful `alt` text) and a short introduction',
      'In `#skills`: a list (`<ul>`/`<li>`) of at least 5 skills',
      'In `#projects`: at least 3 cards with class `project-card`, each with an `<h3>` and a `<p>`',
      'In `#contact`: a `<form>` with a name `<input>`, an `<input type="email">`, a `<textarea>` and a submit button; all fields `required`',
      'A `<footer>` with a © copyright line',
      'Use Flexbox or CSS Grid for layout and at least one `@media` query for small screens',
    ],
    milestones: [
      { title: 'Structure', tasks: ['Header, nav and the four sections with headings', 'Footer with copyright'] },
      { title: 'Content', tasks: ['About text and photo with alt', 'Skills list and 3 project cards', 'Contact form with required fields'] },
      { title: 'Styling', tasks: ['Colours, fonts and spacing', 'Flexbox nav and a Grid for project cards', 'Hover effects on links and cards'] },
      { title: 'Responsive & publish', tasks: ['@media query: single column on phones', 'Publish on GitHub Pages and add the link to your resume'] },
    ],
    hints: ['`<a href="#about">About</a>` jumps to `<section id="about">`.', 'Use `display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));` for cards.', '`@media (max-width: 600px) { ... }` styles apply only on small screens.', 'Add `scroll-behavior: smooth;` to `html` for smooth scrolling.'],
    starter: {
      html: `<header>
  <h1>Your Name</h1>
  <nav>
    <!-- TODO: links to #about, #skills, #projects, #contact -->
  </nav>
</header>

<main>
  <section id="about">
    <h2>About me</h2>
    <!-- TODO: photo with alt text + short introduction -->
  </section>

  <!-- TODO: #skills section with a list of 5+ skills -->
  <!-- TODO: #projects section with 3 .project-card items -->
  <!-- TODO: #contact section with a form -->
</main>

<!-- TODO: footer with © -->
`,
      css: `* { box-sizing: border-box; }
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  color: #1f2937;
}

/* TODO: style the header and nav with Flexbox */
/* TODO: project cards with CSS Grid */
/* TODO: @media query for phones */
`,
      js: '',
    },
    solution: {
      html: `<header class="site-header">
  <h1 class="logo">Riya Patil</h1>
  <nav>
    <a href="#about">About</a>
    <a href="#skills">Skills</a>
    <a href="#projects">Projects</a>
    <a href="#contact">Contact</a>
  </nav>
</header>

<main>
  <section id="about" class="about">
    <img src="https://placehold.co/160x160/4f46e5/ffffff?text=RP" alt="Photo of Riya Patil">
    <div>
      <h2>About me</h2>
      <p>I am a web developer fresher who loves building clean, responsive websites with HTML, CSS, JavaScript and React.</p>
    </div>
  </section>

  <section id="skills">
    <h2>Skills</h2>
    <ul class="skills">
      <li>HTML5</li><li>CSS3</li><li>JavaScript</li><li>React</li><li>Git &amp; GitHub</li><li>Bootstrap</li>
    </ul>
  </section>

  <section id="projects">
    <h2>Projects</h2>
    <div class="grid">
      <article class="project-card"><h3>To-Do App</h3><p>Tasks saved in localStorage with filters.</p></article>
      <article class="project-card"><h3>Weather App</h3><p>Live weather using the Fetch API.</p></article>
      <article class="project-card"><h3>Expense Tracker</h3><p>React app with totals and categories.</p></article>
    </div>
  </section>

  <section id="contact">
    <h2>Contact</h2>
    <form class="contact-form">
      <input type="text" name="name" placeholder="Your name" required>
      <input type="email" name="email" placeholder="Your email" required>
      <textarea name="message" rows="4" placeholder="Message" required></textarea>
      <button type="submit">Send</button>
    </form>
  </section>
</main>

<footer>© 2026 Riya Patil. All rights reserved.</footer>
`,
      css: `* { box-sizing: border-box; }
html { scroll-behavior: smooth; }
body { margin: 0; font-family: system-ui, sans-serif; color: #1f2937; line-height: 1.6; }
.site-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 32px; background: #111827; color: #fff; position: sticky; top: 0; }
.logo { margin: 0; font-size: 1.4rem; }
nav { display: flex; gap: 20px; }
nav a { color: #cbd5e1; text-decoration: none; }
nav a:hover { color: #fff; }
section { padding: 48px 32px; max-width: 1000px; margin: 0 auto; }
.about { display: flex; gap: 32px; align-items: center; }
.about img { border-radius: 50%; }
.skills { display: flex; flex-wrap: wrap; gap: 10px; list-style: none; padding: 0; }
.skills li { background: #eef2ff; color: #4338ca; padding: 6px 14px; border-radius: 99px; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; }
.project-card { padding: 20px; border: 1px solid #e5e7eb; border-radius: 12px; transition: transform .2s; }
.project-card:hover { transform: translateY(-4px); }
.contact-form { display: grid; gap: 12px; max-width: 480px; }
.contact-form input, .contact-form textarea { padding: 10px; border: 1px solid #d1d5db; border-radius: 8px; font: inherit; }
.contact-form button { padding: 10px; border: 0; border-radius: 8px; background: #4f46e5; color: #fff; font-weight: 600; cursor: pointer; }
footer { text-align: center; padding: 24px; background: #f3f4f6; }
@media (max-width: 600px) {
  .site-header { flex-direction: column; gap: 8px; }
  .about { flex-direction: column; text-align: center; }
  section { padding: 32px 16px; }
}
`,
      js: '',
    },
    tests: [
      { name: 'Navigation links to all four sections', code: `const hrefs = $$('nav a').map((a) => a.getAttribute('href'));
for (const h of ['#about', '#skills', '#projects', '#contact']) expect(hrefs.includes(h), 'No nav link with href="' + h + '"');` },
      { name: 'Four sections exist, each with an <h2>', code: `for (const id of ['about', 'skills', 'projects', 'contact']) {
  const s = $('section#' + id);
  expect(s, 'Missing <section id="' + id + '">');
  expect(s.querySelector('h2'), 'Section #' + id + ' needs an <h2> heading');
}` },
      { name: 'Profile photo has meaningful alt text', code: `const img = $('#about img');
expect(img, 'Add an <img> inside #about');
expect((img.getAttribute('alt') || '').trim().length >= 3, 'The image needs alt text that describes it');` },
      { name: 'Skills list has at least 5 items', code: `const n = $$('#skills li').length;
expect(n >= 5, 'Found ' + n + ' skills; add at least 5 <li> items in #skills');` },
      { name: 'At least 3 project cards with title and description', code: `const cards = $$('.project-card');
expect(cards.length >= 3, 'Found ' + cards.length + ' .project-card elements; need 3');
cards.forEach((c, i) => expect(c.querySelector('h3') && c.querySelector('p'), 'Card ' + (i + 1) + ' needs an <h3> and a <p>'));` },
      { name: 'Contact form has required name, email and message fields', code: `const f = $('#contact form');
expect(f, 'Add a <form> inside #contact');
const email = f.querySelector('input[type=email]');
const name = [...f.querySelectorAll('input')].find((i) => i.type === 'text' || /name/i.test(i.name || i.id || i.placeholder || ''));
const msg = f.querySelector('textarea');
expect(name && email && msg, 'Form needs a name input, an email input and a textarea');
expect(name.required && email.required && msg.required, 'Mark all three fields as required');
expect(f.querySelector('button, input[type=submit]'), 'Add a submit button');` },
      { name: 'Footer with copyright', code: `const ft = $('footer');
expect(ft, 'Add a <footer>');
expect(/©|copyright/i.test(ft.textContent), 'Footer should contain © or "Copyright"');` },
      { name: 'Layout uses Flexbox or CSS Grid', code: `const uses = $$('body *').some((e) => /flex|grid/.test(getComputedStyle(e).display));
expect(uses, 'Use display: flex or display: grid somewhere in your layout');` },
      { name: 'Responsive: has a media query', code: `expect(/@media[^{]*\\((max|min)-width/i.test(SRC.css), 'Add an @media (max-width: …) rule for small screens');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: 'web-bootstrap-landing', icon: '🎓', level: 'Beginner', hours: '4-6 hours', track: 'Bootstrap 5', mode: 'web', libs: ['bootstrap', 'bootstrap-icons'],
    title: 'Coaching Institute Landing Page (Bootstrap 5)',
    summary: 'A responsive marketing page for a coaching institute using Bootstrap: navbar, hero, course cards in a grid, an enrolment modal and an FAQ accordion.',
    skills: ['Bootstrap grid', 'Components', 'Modal & accordion', 'Responsive navbar'],
    story: 'A local coaching institute wants a modern website to show its courses and collect enquiries. They want it fast, mobile-friendly and consistent, so you will use Bootstrap 5 components.',
    requirements: [
      'A responsive `.navbar` with `.navbar-brand`, a `.navbar-toggler` button, a `.navbar-collapse` and at least 3 `.nav-link`s',
      'A hero section `#hero` with an `<h1>` and a call-to-action `.btn`',
      'A `#courses` section with at least 3 `.card`s placed in a `.row` using `col-md-*` (or `col-lg-*`) columns',
      'An enrol button with `data-bs-toggle="modal" data-bs-target="#enrollModal"` that opens a `.modal` with id `enrollModal` containing a form with at least 2 inputs',
      'An FAQ `.accordion` with at least 3 `.accordion-item`s',
      'A footer',
    ],
    milestones: [
      { title: 'Layout', tasks: ['Navbar with brand, links and toggler', 'Hero section with heading and button'] },
      { title: 'Components', tasks: ['3+ course cards in a responsive grid', 'Enrolment modal with a form', 'FAQ accordion'] },
      { title: 'Polish', tasks: ['Bootstrap Icons on cards/buttons', 'Test at phone width: navbar collapses, cards stack', 'Publish on GitHub Pages / Netlify'] },
    ],
    hints: ['Bootstrap 5 and Bootstrap Icons are already loaded in this project.', 'Cards in `<div class="row g-4">` with each card in `<div class="col-md-4">` sit 3 per row on tablets and stack on phones.', 'Copy the modal and accordion markup from getbootstrap.com docs, then change the text.'],
    starter: {
      html: `<nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="#">BrightFuture Academy</a>
    <!-- TODO: navbar-toggler button + navbar-collapse with 3 nav-links -->
  </div>
</nav>

<section id="hero" class="py-5 text-center">
  <!-- TODO: h1 + call-to-action button -->
</section>

<section id="courses" class="container py-5">
  <h2 class="mb-4">Our Courses</h2>
  <!-- TODO: .row with 3+ .card in col-md-4 columns -->
</section>

<!-- TODO: FAQ accordion, enrolment modal (#enrollModal), footer -->
`,
      css: `#hero { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #fff; }
`,
      js: '',
    },
    solution: {
      html: `<nav class="navbar navbar-expand-lg bg-dark" data-bs-theme="dark">
  <div class="container">
    <a class="navbar-brand" href="#"><i class="bi bi-mortarboard-fill"></i> BrightFuture Academy</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-label="Toggle navigation"><span class="navbar-toggler-icon"></span></button>
    <div class="collapse navbar-collapse" id="mainNav">
      <ul class="navbar-nav ms-auto">
        <li class="nav-item"><a class="nav-link active" href="#hero">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="#courses">Courses</a></li>
        <li class="nav-item"><a class="nav-link" href="#faq">FAQ</a></li>
      </ul>
    </div>
  </div>
</nav>

<section id="hero" class="py-5 text-center">
  <div class="container py-4">
    <h1 class="display-5 fw-bold">Crack your dream job with expert coaching</h1>
    <p class="lead">Live classes, practice tests and placement support.</p>
    <button class="btn btn-light btn-lg" data-bs-toggle="modal" data-bs-target="#enrollModal">Enrol now</button>
  </div>
</section>

<section id="courses" class="container py-5">
  <h2 class="mb-4">Our Courses</h2>
  <div class="row g-4">
    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title"><i class="bi bi-code-slash"></i> Web Development</h5><p class="card-text">HTML, CSS, JavaScript and React in 3 months.</p></div></div></div>
    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title"><i class="bi bi-cup-hot"></i> Java Full Stack</h5><p class="card-text">Core Java, Spring Boot and projects.</p></div></div></div>
    <div class="col-md-4"><div class="card h-100 shadow-sm"><div class="card-body"><h5 class="card-title"><i class="bi bi-bar-chart"></i> Data Analytics</h5><p class="card-text">Excel, SQL and Power BI dashboards.</p></div></div></div>
  </div>
</section>

<section id="faq" class="container pb-5">
  <h2 class="mb-4">FAQ</h2>
  <div class="accordion" id="faqAcc">
    <div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#q1">Are classes online?</button></h2><div id="q1" class="accordion-collapse collapse show" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, live online with recordings.</div></div></div>
    <div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q2">Do you help with placements?</button></h2><div id="q2" class="accordion-collapse collapse" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, mock interviews and referrals.</div></div></div>
    <div class="accordion-item"><h2 class="accordion-header"><button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#q3">Is there a free demo?</button></h2><div id="q3" class="accordion-collapse collapse" data-bs-parent="#faqAcc"><div class="accordion-body">Yes, the first class is free.</div></div></div>
  </div>
</section>

<div class="modal fade" id="enrollModal" tabindex="-1" aria-hidden="true">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h5 class="modal-title">Enrol now</h5><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
    <div class="modal-body">
      <form>
        <input class="form-control mb-2" placeholder="Full name" required>
        <input class="form-control mb-2" type="tel" placeholder="Mobile number" required>
        <select class="form-select mb-2"><option>Web Development</option><option>Java Full Stack</option><option>Data Analytics</option></select>
        <button class="btn btn-primary w-100" type="submit">Submit</button>
      </form>
    </div>
  </div></div>
</div>

<footer class="bg-dark text-white-50 text-center py-3">© 2026 BrightFuture Academy</footer>
`,
      css: `#hero { background: linear-gradient(135deg, #4f46e5, #06b6d4); color: #fff; }
.card { transition: transform .2s; }
.card:hover { transform: translateY(-4px); }
`,
      js: '',
    },
    tests: [
      { name: 'Responsive navbar with brand, toggler and 3+ links', code: `expect($('.navbar .navbar-brand'), 'Add a .navbar-brand inside the .navbar');
expect($('.navbar .navbar-toggler'), 'Add a .navbar-toggler button for phones');
expect($('.navbar .navbar-collapse'), 'Wrap the links in a .navbar-collapse');
expect($$('.navbar .nav-link').length >= 3, 'Add at least 3 .nav-link items');` },
      { name: 'Hero section with heading and button', code: `expect($('#hero h1'), 'Add an <h1> inside #hero');
expect($('#hero .btn'), 'Add a call-to-action .btn inside #hero');` },
      { name: 'At least 3 course cards in a responsive grid', code: `const cards = $$('#courses .card');
expect(cards.length >= 3, 'Found ' + cards.length + ' cards in #courses; need 3');
expect($('#courses .row'), 'Put the cards inside a .row');
cards.forEach((c, i) => expect(/col-(sm|md|lg|xl)-/.test(c.closest('[class*="col-"]')?.className || ''), 'Card ' + (i + 1) + ' should be inside a col-md-* (or col-lg-*) column'));` },
      { name: 'Bootstrap is working', code: `expect(window.bootstrap, 'Bootstrap JS did not load (check your internet connection)');
expect(getComputedStyle($('.btn')).paddingTop !== '0px', 'Bootstrap CSS is not applied');` },
      { name: 'Enrolment modal with a form', code: `const m = $('#enrollModal');
expect(m && m.classList.contains('modal'), 'Add a .modal with id="enrollModal"');
expect(m.querySelectorAll('input, select, textarea').length >= 2, 'The modal form needs at least 2 fields');
expect($('[data-bs-target="#enrollModal"]'), 'Add a button with data-bs-toggle="modal" data-bs-target="#enrollModal"');` },
      { name: 'Clicking "Enrol" opens the modal', code: `await click('[data-bs-target="#enrollModal"]');
await wait(700);
expect($('#enrollModal').classList.contains('show'), 'The modal did not open when its button was clicked');` },
      { name: 'FAQ accordion with 3+ items', code: `const n = $$('.accordion .accordion-item').length;
expect(n >= 3, 'Found ' + n + ' accordion items; need 3');` },
      { name: 'Footer present', code: `expect($('footer'), 'Add a <footer>');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: 'web-calculator', icon: '🧮', level: 'Beginner', hours: '3-5 hours', track: 'JavaScript', mode: 'web',
    title: 'Calculator App',
    summary: 'A working calculator with a display, digit and operator buttons, decimals, clear and divide-by-zero handling: DOM events and logic in JavaScript.',
    skills: ['DOM events', 'Event delegation', 'String & number logic', 'CSS Grid'],
    story: 'Every interview panel loves asking "build a calculator". Build one that looks good, handles decimals and never crashes, even when someone divides by zero.',
    requirements: [
      'A display with id `display` (an `<input>` or a `<div>`)',
      'Buttons whose text is the digits `0`–`9`, `.`, `+`, `-`, `×` (or `*`), `÷` (or `/`), `=` and `C`',
      'Clicking digits shows them on the display (e.g. 1 then 2 shows `12`)',
      '`=` shows the result; results like 0.1 + 0.2 should not show long decimals',
      '`C` clears the display (empty or `0`)',
      'Dividing by zero shows `Error` (not Infinity)',
    ],
    milestones: [
      { title: 'UI', tasks: ['Display and a 4-column button grid with CSS Grid', 'Different colours for operators and the = button'] },
      { title: 'Logic', tasks: ['Append digits and operators to the display', 'Calculate on = (handle ×, ÷ and decimals)', 'Clear button and divide-by-zero error'] },
      { title: 'Extras', tasks: ['Keyboard support (numbers, Enter, Backspace, Escape)', 'Publish and add to your portfolio'] },
    ],
    hints: ['Use ONE click listener on the buttons container and read `e.target.textContent` (event delegation).', 'Replace × with * and ÷ with / before calculating.', 'Never use eval() on raw user input; check the expression with a regex like `/^[0-9+\\-*/.]+$/` first.', '`parseFloat(result.toFixed(10))` removes floating-point noise.'],
    starter: {
      html: `<div class="calc">
  <input id="display" readonly>
  <div class="keys">
    <button>C</button><button>÷</button><button>×</button><button>-</button>
    <button>7</button><button>8</button><button>9</button><button>+</button>
    <button>4</button><button>5</button><button>6</button><button>=</button>
    <button>1</button><button>2</button><button>3</button><button>.</button>
    <button>0</button>
  </div>
</div>
`,
      css: `.calc { width: 280px; margin: 40px auto; font-family: system-ui; }
#display { width: 100%; height: 56px; font-size: 1.6rem; text-align: right; padding: 0 12px; }
/* TODO: 4-column grid for .keys */
`,
      js: `const display = document.getElementById('display');
const keys = document.querySelector('.keys');

// TODO: listen for clicks on the buttons (event delegation)
// TODO: digits and operators -> append to display
// TODO: '=' -> calculate, 'C' -> clear, divide by zero -> 'Error'
`,
    },
    solution: {
      html: `<div class="calc">
  <input id="display" readonly aria-label="Display">
  <div class="keys">
    <button class="fn">C</button><button class="op">÷</button><button class="op">×</button><button class="op">-</button>
    <button>7</button><button>8</button><button>9</button><button class="op">+</button>
    <button>4</button><button>5</button><button>6</button><button class="eq">=</button>
    <button>1</button><button>2</button><button>3</button><button>.</button>
    <button class="zero">0</button>
  </div>
</div>
`,
      css: `body { background: #0f172a; font-family: system-ui; }
.calc { width: 300px; margin: 40px auto; padding: 16px; border-radius: 20px; background: #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,.4); }
#display { width: 100%; height: 64px; font-size: 2rem; text-align: right; padding: 0 12px; border: 0; border-radius: 12px; background: #0f172a; color: #fff; margin-bottom: 12px; box-sizing: border-box; }
.keys { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.keys button { height: 56px; border: 0; border-radius: 12px; font-size: 1.3rem; background: #334155; color: #fff; cursor: pointer; }
.keys button:active { transform: scale(.96); }
.keys .op { background: #4f46e5; }
.keys .fn { background: #ef4444; }
.keys .eq { background: #22c55e; grid-row: span 2; height: auto; }
.keys .zero { grid-column: span 2; }
`,
      js: `const display = document.getElementById('display');
const keys = document.querySelector('.keys');
let justCalculated = false;

function calculate(expr) {
  const clean = expr.replace(/×/g, '*').replace(/÷/g, '/');
  if (!/^[0-9+\\-*/.]+$/.test(clean)) return 'Error';
  if (/\\/0(?![.\\d])/.test(clean)) return 'Error';
  try {
    const result = Function('"use strict"; return (' + clean + ')')();
    if (!Number.isFinite(result)) return 'Error';
    return String(parseFloat(result.toFixed(10)));
  } catch (e) {
    return 'Error';
  }
}

function press(key) {
  if (key === 'C') { display.value = ''; return; }
  if (key === '=') { display.value = calculate(display.value); justCalculated = true; return; }
  if (display.value === 'Error') display.value = '';
  if (justCalculated && /[0-9.]/.test(key)) display.value = '';
  justCalculated = false;
  display.value += key;
}

keys.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') press(e.target.textContent.trim());
});

document.addEventListener('keydown', (e) => {
  const map = { '*': '×', '/': '÷', Enter: '=', Escape: 'C' };
  const k = map[e.key] || e.key;
  if (/^[0-9.+\\-×÷=C]$/.test(k)) press(k);
  if (e.key === 'Backspace') display.value = display.value.slice(0, -1);
});
`,
    },
    tests: [
      { name: 'Display and all digit buttons exist', code: `expect($('#display'), 'Add an element with id="display"');
for (let d = 0; d <= 9; d++) btn(String(d));
btn('+'); btn('-'); btn('×', '*', 'x'); btn('÷', '/'); btn('='); btn('C', 'AC', 'Clear');` },
      { name: 'Typing 1 then 2 shows 12', code: `await click(btn('1')); await click(btn('2'));
expect(text('#display') === '12', 'Expected "12" but display shows "' + text('#display') + '"');` },
      { name: '7 + 8 = 15', code: `for (const k of ['7', '+', '8']) await click(btn(k));
await click(btn('='));
expect(text('#display') === '15', 'Expected 15, got "' + text('#display') + '"');` },
      { name: '9 × 6 = 54', code: `await click(btn('9')); await click(btn('×', '*', 'x')); await click(btn('6')); await click(btn('='));
expect(text('#display') === '54', 'Expected 54, got "' + text('#display') + '"');` },
      { name: '8 ÷ 2 = 4', code: `await click(btn('8')); await click(btn('÷', '/')); await click(btn('2')); await click(btn('='));
expect(text('#display') === '4', 'Expected 4, got "' + text('#display') + '"');` },
      { name: 'Decimals: 1.5 + 2 = 3.5', code: `for (const k of ['1', '.', '5', '+', '2']) await click(btn(k));
await click(btn('='));
expect(text('#display') === '3.5', 'Expected 3.5, got "' + text('#display') + '"');` },
      { name: 'C clears the display', code: `await click(btn('5')); await click(btn('C', 'AC', 'Clear'));
const v = text('#display');
expect(v === '' || v === '0', 'After C the display should be empty or 0, got "' + v + '"');` },
      { name: 'Divide by zero shows Error', code: `await click(btn('5')); await click(btn('÷', '/')); await click(btn('0')); await click(btn('='));
expect(/error/i.test(text('#display')), 'Expected "Error", got "' + text('#display') + '"');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: 'web-todo', icon: '✅', level: 'Intermediate', hours: '5-7 hours', track: 'JavaScript', mode: 'web',
    title: 'To-Do List with localStorage',
    summary: 'Add, complete and delete tasks with a live counter, and keep them after a page refresh using localStorage and JSON.',
    skills: ['DOM manipulation', 'Arrays of objects', 'localStorage & JSON', 'Rendering from state'],
    story: 'The most common fresher project, done properly: data lives in an array, the screen is re-drawn from that array, and everything is saved so nothing is lost on refresh.',
    requirements: [
      'A form `#todo-form` with an input `#todo-input` and a submit button',
      'Submitting adds a `<li>` to `#todo-list` with the task text, then clears the input; empty text is ignored',
      'Each `<li>` has an `<input type="checkbox">` that marks it done (the `<li>` gets class `done`) and a button with class `delete` that removes it',
      '`#count` shows how many tasks are left (not done), e.g. "2 tasks left"',
      'Save the tasks to localStorage under the key `todos` as a JSON array of `{ text, done }` objects, and load them when the page opens',
    ],
    milestones: [
      { title: 'Add & show', tasks: ['Form adds tasks to an array and re-renders the list', 'Ignore empty input and clear the box after adding'] },
      { title: 'Update & delete', tasks: ['Checkbox toggles done (strike-through style)', 'Delete button removes the task', 'Counter of tasks left'] },
      { title: 'Persist', tasks: ['Save to localStorage("todos") on every change', 'Load saved tasks on start'] },
      { title: 'Extras', tasks: ['Filters: All / Active / Completed', 'Publish and add to your portfolio'] },
    ],
    hints: ['Keep one array: `let todos = JSON.parse(localStorage.getItem("todos")) || [];`', 'Write one `render()` function that rebuilds the whole list from the array; call it after every change.', '`e.preventDefault()` stops the form from reloading the page.', 'Store `{ text, done }` objects, not just strings.'],
    starter: {
      html: `<div class="app">
  <h1>My Tasks</h1>
  <form id="todo-form">
    <input id="todo-input" placeholder="What needs to be done?" autocomplete="off">
    <button type="submit">Add</button>
  </form>
  <ul id="todo-list"></ul>
  <p id="count"></p>
</div>
`,
      css: `.app { max-width: 420px; margin: 40px auto; font-family: system-ui; }
.done span { text-decoration: line-through; color: #9ca3af; }
`,
      js: `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('count');

let todos = []; // TODO: load from localStorage('todos')

function render() {
  // TODO: rebuild the <li> items from the todos array (checkbox, text, delete button)
  // TODO: update the "tasks left" counter
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: add a task, save, render
});

render();
`,
    },
    solution: {
      html: `<div class="app">
  <h1>My Tasks</h1>
  <form id="todo-form">
    <input id="todo-input" placeholder="What needs to be done?" autocomplete="off">
    <button type="submit">Add</button>
  </form>
  <ul id="todo-list"></ul>
  <p id="count"></p>
</div>
`,
      css: `body { background: #f1f5f9; }
.app { max-width: 440px; margin: 40px auto; font-family: system-ui; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
#todo-form { display: flex; gap: 8px; }
#todo-input { flex: 1; padding: 10px; border: 1px solid #cbd5e1; border-radius: 8px; }
#todo-form button { padding: 10px 16px; border: 0; border-radius: 8px; background: #4f46e5; color: #fff; }
#todo-list { list-style: none; padding: 0; }
#todo-list li { display: flex; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
#todo-list li span { flex: 1; }
.done span { text-decoration: line-through; color: #9ca3af; }
.delete { border: 0; background: none; color: #ef4444; cursor: pointer; font-size: 1.1rem; }
#count { color: #64748b; }
`,
      js: `const form = document.getElementById('todo-form');
const input = document.getElementById('todo-input');
const list = document.getElementById('todo-list');
const count = document.getElementById('count');

let todos = JSON.parse(localStorage.getItem('todos') || '[]');

function save() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

function render() {
  list.innerHTML = '';
  todos.forEach((todo, i) => {
    const li = document.createElement('li');
    if (todo.done) li.classList.add('done');

    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = todo.done;
    box.addEventListener('change', () => { todos[i].done = box.checked; save(); render(); });

    const span = document.createElement('span');
    span.textContent = todo.text;

    const del = document.createElement('button');
    del.className = 'delete';
    del.textContent = '✕';
    del.title = 'Delete';
    del.addEventListener('click', () => { todos.splice(i, 1); save(); render(); });

    li.append(box, span, del);
    list.appendChild(li);
  });
  const left = todos.filter((t) => !t.done).length;
  count.textContent = left + (left === 1 ? ' task' : ' tasks') + ' left';
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  todos.push({ text, done: false });
  input.value = '';
  save();
  render();
});

render();
`,
    },
    tests: [
      { name: 'Adds a task to the list', code: `await type('#todo-input', 'Buy milk');
await submit('#todo-form');
const items = $$('#todo-list li');
expect(items.length === 1, 'Expected 1 task in #todo-list, found ' + items.length);
expect(items[0].textContent.includes('Buy milk'), 'The new <li> should contain the task text');` },
      { name: 'Clears the input after adding', code: `await type('#todo-input', 'Read a book');
await submit('#todo-form');
expect(text('#todo-input') === '', 'The input should be empty after adding a task');` },
      { name: 'Ignores empty tasks', code: `await type('#todo-input', '   ');
await submit('#todo-form');
expect($$('#todo-list li').length === 0, 'Empty or blank text should not create a task');` },
      { name: 'Checkbox marks a task as done', code: `await type('#todo-input', 'Practice JS'); await submit('#todo-form');
await click('#todo-list li input[type=checkbox]');
expect($('#todo-list li').classList.contains('done'), 'After ticking the checkbox the <li> should have class "done"');` },
      { name: 'Delete button removes a task', code: `await type('#todo-input', 'Task A'); await submit('#todo-form');
await type('#todo-input', 'Task B'); await submit('#todo-form');
await click('#todo-list li .delete');
const items = $$('#todo-list li');
expect(items.length === 1, 'Expected 1 task after deleting, found ' + items.length);` },
      { name: 'Counter shows tasks left', code: `for (const t of ['One', 'Two', 'Three']) { await type('#todo-input', t); await submit('#todo-form'); }
await click('#todo-list li input[type=checkbox]');
expect(/\\b2\\b/.test(text('#count')), '#count should say 2 tasks left, it says "' + text('#count') + '"');` },
      { name: 'Saves tasks to localStorage("todos")', code: `await type('#todo-input', 'Persist me'); await submit('#todo-form');
const raw = localStorage.getItem('todos');
expect(raw, 'Nothing saved under localStorage key "todos"');
const data = JSON.parse(raw);
expect(Array.isArray(data) && data.some((t) => t.text === 'Persist me'), 'localStorage "todos" should be an array of { text, done } objects');` },
      { name: 'Loads saved tasks when the page opens', seed: { todos: '[{"text":"From storage","done":true},{"text":"Still to do","done":false}]' }, code: `const items = $$('#todo-list li');
expect(items.length === 2, 'Expected the 2 saved tasks to appear on load, found ' + items.length);
expect(items[0].classList.contains('done'), 'A saved task with done: true should have class "done"');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: 'web-quiz', icon: '❓', level: 'Intermediate', hours: '5-7 hours', track: 'JavaScript', mode: 'web',
    title: 'Quiz App',
    summary: 'A multiple-choice quiz: start screen, one question at a time, instant right/wrong feedback, score and restart.',
    skills: ['Arrays of objects', 'Dynamic buttons', 'State (current question, score)', 'Show / hide screens'],
    story: 'Make a quiz that companies could use for a quick aptitude round: questions come from an array, answers are checked instantly and the final score is shown with a restart option.',
    requirements: [
      'A global array `questions` with at least 5 objects: `{ question, answers: [4 strings], correct: index }`',
      'A `#start-btn` button; clicking it shows the first question in `#question`',
      'Answers are buttons with class `answer-btn` inside `#answers`',
      'Clicking an answer: the chosen button gets class `correct` or `wrong`; if wrong, the correct button also gets `correct`; all answer buttons become disabled',
      'A `#next-btn` button goes to the next question',
      'After the last question, `#result` shows the score as `X/Y` (e.g. `5/5`) and a `#restart-btn` starts again',
    ],
    milestones: [
      { title: 'Data & screens', tasks: ['questions array with 5+ questions', 'Start screen, question screen and result screen'] },
      { title: 'Game logic', tasks: ['Show question and answer buttons', 'Mark right/wrong and disable buttons', 'Next button and score'] },
      { title: 'Finish', tasks: ['Result screen with score and restart', 'Progress text like "Question 2 of 5"', 'Publish and add to your portfolio'] },
    ],
    hints: ['Keep two variables: `current` (question index) and `score`.', 'Create answer buttons with `document.createElement("button")` inside a loop.', 'Use `button.disabled = true` after an answer is chosen.', 'Hide/show screens with `element.hidden = true/false`.'],
    starter: {
      html: `<div class="quiz">
  <h1>JavaScript Quiz</h1>
  <button id="start-btn">Start quiz</button>
  <div id="quiz-box" hidden>
    <p id="progress"></p>
    <h2 id="question"></h2>
    <div id="answers"></div>
    <button id="next-btn" hidden>Next</button>
  </div>
  <div id="result" hidden></div>
</div>
`,
      css: `.quiz { max-width: 520px; margin: 40px auto; font-family: system-ui; }
.correct { background: #bbf7d0; }
.wrong { background: #fecaca; }
`,
      js: `const questions = [
  { question: 'Which keyword declares a constant?', answers: ['var', 'let', 'const', 'static'], correct: 2 },
  // TODO: add at least 4 more questions
];

let current = 0;
let score = 0;

// TODO: start button -> show quiz box and first question
// TODO: showQuestion(): fill #question and create .answer-btn buttons in #answers
// TODO: on answer click: add correct/wrong classes, disable buttons, update score, show #next-btn
// TODO: next -> next question or show result "X/Y" with a #restart-btn
`,
    },
    solution: {
      html: `<div class="quiz">
  <h1>JavaScript Quiz</h1>
  <p class="intro">5 quick questions. Ready?</p>
  <button id="start-btn" class="primary">Start quiz</button>
  <div id="quiz-box" hidden>
    <p id="progress"></p>
    <h2 id="question"></h2>
    <div id="answers"></div>
    <button id="next-btn" class="primary" hidden>Next</button>
  </div>
  <div id="result" hidden></div>
</div>
`,
      css: `body { background: #eef2ff; font-family: system-ui; }
.quiz { max-width: 540px; margin: 40px auto; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
#answers { display: grid; gap: 10px; margin: 16px 0; }
.answer-btn { padding: 12px; border: 1px solid #c7d2fe; border-radius: 10px; background: #fff; text-align: left; font-size: 1rem; cursor: pointer; }
.answer-btn:hover:not(:disabled) { background: #eef2ff; }
.correct { background: #bbf7d0 !important; border-color: #22c55e; }
.wrong { background: #fecaca !important; border-color: #ef4444; }
.primary { padding: 10px 20px; border: 0; border-radius: 10px; background: #4f46e5; color: #fff; font-size: 1rem; cursor: pointer; }
#progress { color: #6b7280; margin: 0; }
#result { text-align: center; font-size: 1.3rem; }
`,
      js: `const questions = [
  { question: 'Which keyword declares a constant?', answers: ['var', 'let', 'const', 'static'], correct: 2 },
  { question: 'What does DOM stand for?', answers: ['Document Object Model', 'Data Object Method', 'Digital Order Model', 'Document Oriented Markup'], correct: 0 },
  { question: 'Which method adds an item to the end of an array?', answers: ['shift()', 'push()', 'pop()', 'unshift()'], correct: 1 },
  { question: 'What is typeof null?', answers: ['"null"', '"undefined"', '"object"', '"number"'], correct: 2 },
  { question: 'Which operator checks value AND type?', answers: ['==', '=', '!=', '==='], correct: 3 },
];

const startBtn = document.getElementById('start-btn');
const box = document.getElementById('quiz-box');
const qEl = document.getElementById('question');
const answersEl = document.getElementById('answers');
const nextBtn = document.getElementById('next-btn');
const progress = document.getElementById('progress');
const result = document.getElementById('result');
const intro = document.querySelector('.intro');

let current = 0;
let score = 0;

function start() {
  current = 0;
  score = 0;
  startBtn.hidden = true;
  if (intro) intro.hidden = true;
  result.hidden = true;
  box.hidden = false;
  showQuestion();
}

function showQuestion() {
  const q = questions[current];
  progress.textContent = 'Question ' + (current + 1) + ' of ' + questions.length;
  qEl.textContent = q.question;
  answersEl.innerHTML = '';
  nextBtn.hidden = true;
  q.answers.forEach((ans, i) => {
    const b = document.createElement('button');
    b.className = 'answer-btn';
    b.textContent = ans;
    b.addEventListener('click', () => choose(i));
    answersEl.appendChild(b);
  });
}

function choose(i) {
  const q = questions[current];
  const buttons = answersEl.querySelectorAll('.answer-btn');
  buttons.forEach((b) => { b.disabled = true; });
  if (i === q.correct) {
    score++;
    buttons[i].classList.add('correct');
  } else {
    buttons[i].classList.add('wrong');
    buttons[q.correct].classList.add('correct');
  }
  nextBtn.hidden = false;
}

function next() {
  current++;
  if (current < questions.length) showQuestion();
  else showResult();
}

function showResult() {
  box.hidden = true;
  result.hidden = false;
  result.innerHTML = '<h2>Your score: ' + score + '/' + questions.length + '</h2><button id="restart-btn" class="primary">Restart</button>';
  document.getElementById('restart-btn').addEventListener('click', start);
}

startBtn.addEventListener('click', start);
nextBtn.addEventListener('click', next);
`,
    },
    tests: [
      { name: 'questions array has 5+ valid questions', code: `expect(typeof questions !== 'undefined' && Array.isArray(questions), 'Declare a global array named questions');
expect(questions.length >= 5, 'Add at least 5 questions (found ' + questions.length + ')');
questions.forEach((q, i) => {
  expect(q.question && Array.isArray(q.answers) && q.answers.length === 4, 'Question ' + (i + 1) + ' needs a question text and exactly 4 answers');
  expect(Number.isInteger(q.correct) && q.correct >= 0 && q.correct < 4, 'Question ' + (i + 1) + ' needs a correct index 0-3');
});` },
      { name: 'Start shows the first question with 4 answer buttons', code: `await click('#start-btn');
expect(text('#question') === questions[0].question, '#question should show the first question');
expect($$('#answers .answer-btn').length === 4, 'Expected 4 .answer-btn buttons in #answers');` },
      { name: 'Correct answer is marked "correct"', code: `await click('#start-btn');
const b = $$('#answers .answer-btn')[questions[0].correct];
await click(b);
expect(b.classList.contains('correct'), 'The chosen correct answer should get class "correct"');` },
      { name: 'Wrong answer is marked and buttons are disabled', code: `await click('#start-btn');
const wrongIdx = (questions[0].correct + 1) % 4;
const btns = $$('#answers .answer-btn');
await click(btns[wrongIdx]);
expect(btns[wrongIdx].classList.contains('wrong'), 'A wrong answer should get class "wrong"');
expect(btns[questions[0].correct].classList.contains('correct'), 'The right answer should be highlighted with class "correct"');
expect(btns.every((b) => b.disabled), 'All answer buttons should be disabled after answering');` },
      { name: 'Next goes to question 2', code: `await click('#start-btn');
await click($$('#answers .answer-btn')[0]);
await click('#next-btn');
expect(text('#question') === questions[1].question, 'After Next, #question should show question 2');` },
      { name: 'All correct answers give a full score', code: `await click('#start-btn');
for (let i = 0; i < questions.length; i++) {
  await click($$('#answers .answer-btn')[questions[i].correct]);
  await click('#next-btn');
}
const n = questions.length;
expect(visible('#result'), '#result should be visible after the last question');
expect(text('#result').includes(n + '/' + n), '#result should show ' + n + '/' + n + ', it shows "' + text('#result') + '"');` },
      { name: 'Restart starts the quiz again', code: `await click('#start-btn');
for (let i = 0; i < questions.length; i++) { await click($$('#answers .answer-btn')[0]); await click('#next-btn'); }
await click('#restart-btn');
expect(text('#question') === questions[0].question, 'After restart the first question should show again');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: 'web-form-validation', icon: '📝', level: 'Intermediate', hours: '4-6 hours', track: 'JavaScript', mode: 'web',
    title: 'Registration Form with Validation',
    summary: 'A sign-up form that validates name, email, password strength and password confirmation in JavaScript with clear inline error messages.',
    skills: ['Form events', 'Regular expressions', 'Inline errors', 'Accessible forms'],
    story: 'Real forms must stop bad data before it reaches the server and tell users exactly what to fix. Build a registration form with friendly, inline validation.',
    requirements: [
      'A `<form id="reg-form" novalidate>` with inputs `#name`, `#email`, `#password`, `#confirm` and a submit button',
      'Each field has an error element with id `<field>-error` (e.g. `#email-error`) that shows the message',
      'Rules: name at least 3 characters; valid email; password at least 8 characters with at least one number; confirm must match password',
      'An invalid field gets class `invalid`; a fixed field loses it and its error is cleared',
      'When everything is valid, show `#success` (hidden before) with a success message',
    ],
    milestones: [
      { title: 'Form', tasks: ['Labels, inputs and error elements for 4 fields', 'Nice styling with red/green states'] },
      { title: 'Validation', tasks: ['Validate all fields on submit', 'Email regex and password rule', 'Show success message when valid'] },
      { title: 'Extras', tasks: ['Validate each field as the user types (input event)', 'Show/hide password toggle', 'Publish and add to your portfolio'] },
    ],
    hints: ['`novalidate` turns off the browser\'s own popups so your JavaScript messages show.', 'Email regex: `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/`', 'Password with a number: `/\\d/.test(pw)`', 'Write one helper `setError(field, message)` that sets the text and toggles the `invalid` class.'],
    starter: {
      html: `<form id="reg-form" novalidate>
  <h1>Create account</h1>
  <label>Name <input id="name"></label>
  <small id="name-error" class="error"></small>
  <!-- TODO: email, password, confirm fields with their -error elements -->
  <button type="submit">Register</button>
  <p id="success" hidden></p>
</form>
`,
      css: `#reg-form { max-width: 380px; margin: 40px auto; font-family: system-ui; display: grid; gap: 6px; }
.error { color: #dc2626; min-height: 1em; }
.invalid { border-color: #dc2626; }
`,
      js: `const form = document.getElementById('reg-form');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  // TODO: validate name, email, password, confirm
  // TODO: show errors or #success
});
`,
    },
    solution: {
      html: `<form id="reg-form" novalidate>
  <h1>Create account</h1>
  <label for="name">Full name</label>
  <input id="name" autocomplete="name">
  <small id="name-error" class="error"></small>

  <label for="email">Email</label>
  <input id="email" type="email" autocomplete="email">
  <small id="email-error" class="error"></small>

  <label for="password">Password</label>
  <input id="password" type="password" autocomplete="new-password">
  <small id="password-error" class="error"></small>

  <label for="confirm">Confirm password</label>
  <input id="confirm" type="password" autocomplete="new-password">
  <small id="confirm-error" class="error"></small>

  <button type="submit">Register</button>
  <p id="success" hidden>🎉 Registration successful!</p>
</form>
`,
      css: `body { background: #f8fafc; font-family: system-ui; }
#reg-form { max-width: 400px; margin: 40px auto; display: grid; gap: 4px; background: #fff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
label { font-weight: 600; margin-top: 8px; }
input { padding: 10px; border: 1.5px solid #cbd5e1; border-radius: 8px; font-size: 1rem; }
input.invalid { border-color: #dc2626; background: #fef2f2; }
.error { color: #dc2626; min-height: 1.1em; font-size: .85rem; }
button { margin-top: 12px; padding: 12px; border: 0; border-radius: 8px; background: #4f46e5; color: #fff; font-size: 1rem; cursor: pointer; }
#success { color: #16a34a; font-weight: 600; text-align: center; }
`,
      js: `const form = document.getElementById('reg-form');
const success = document.getElementById('success');

const rules = {
  name: (v) => (v.trim().length >= 3 ? '' : 'Name must be at least 3 characters.'),
  email: (v) => (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(v.trim()) ? '' : 'Enter a valid email address.'),
  password: (v) => (v.length >= 8 && /\\d/.test(v) ? '' : 'Password needs 8+ characters and at least one number.'),
  confirm: (v) => (v && v === document.getElementById('password').value ? '' : 'Passwords do not match.'),
};

function check(field) {
  const input = document.getElementById(field);
  const msg = rules[field](input.value);
  document.getElementById(field + '-error').textContent = msg;
  input.classList.toggle('invalid', !!msg);
  return !msg;
}

Object.keys(rules).forEach((f) => {
  document.getElementById(f).addEventListener('input', () => { if (document.getElementById(f).classList.contains('invalid')) check(f); });
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const results = Object.keys(rules).map(check);
  const ok = results.every(Boolean);
  success.hidden = !ok;
  if (ok) form.querySelectorAll('input').forEach((i) => i.classList.remove('invalid'));
});
`,
    },
    tests: [
      { name: 'Empty form shows an error for every field', code: `await submit('#reg-form');
for (const f of ['name', 'email', 'password', 'confirm']) {
  expect($('#' + f), 'Missing input #' + f);
  expect(text('#' + f + '-error').length > 0, 'Expected an error message in #' + f + '-error');
}
expect(!visible('#success'), '#success must stay hidden when the form is invalid');` },
      { name: 'Name shorter than 3 characters is rejected', code: `await type('#name', 'Al'); await submit('#reg-form');
expect(text('#name-error').length > 0, 'A 2-letter name should show an error');
await type('#name', 'Alok'); await submit('#reg-form');
expect(text('#name-error') === '', 'A valid name should clear #name-error');` },
      { name: 'Email format is checked', code: `await type('#email', 'abc@'); await submit('#reg-form');
expect(text('#email-error').length > 0, '"abc@" should be rejected');
await type('#email', 'abc@mail.com'); await submit('#reg-form');
expect(text('#email-error') === '', 'A valid email should clear #email-error');` },
      { name: 'Password needs 8+ characters and a number', code: `await type('#password', 'abcdefgh'); await submit('#reg-form');
expect(text('#password-error').length > 0, '"abcdefgh" (no number) should be rejected');
await type('#password', 'abc12345'); await submit('#reg-form');
expect(text('#password-error') === '', '"abc12345" should be accepted');` },
      { name: 'Confirm password must match', code: `await type('#password', 'abc12345'); await type('#confirm', 'abc12346'); await submit('#reg-form');
expect(text('#confirm-error').length > 0, 'Mismatched passwords should show an error');` },
      { name: 'Invalid fields get class "invalid"', code: `await submit('#reg-form');
expect($('#email').classList.contains('invalid'), 'An invalid #email should have class "invalid"');
await type('#email', 'ok@mail.com'); await submit('#reg-form');
expect(!$('#email').classList.contains('invalid'), 'A fixed #email should lose class "invalid"');` },
      { name: 'Valid form shows #success', code: `await type('#name', 'Riya Patil'); await type('#email', 'riya@mail.com');
await type('#password', 'secret123'); await type('#confirm', 'secret123');
await submit('#reg-form');
expect(visible('#success') && text('#success').length > 0, '#success should be visible with a message');
for (const f of ['name', 'email', 'password', 'confirm']) expect(text('#' + f + '-error') === '', 'No errors expected, but #' + f + '-error says "' + text('#' + f + '-error') + '"');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: 'web-github-finder', icon: '🔎', level: 'Advanced', hours: '5-7 hours', track: 'JavaScript (Fetch API)', mode: 'web',
    title: 'GitHub Profile Finder (Fetch API)',
    summary: 'Search any GitHub user and show their avatar, name, followers and repositories using fetch, async/await and proper loading and error states.',
    skills: ['Fetch API', 'async / await', 'Error handling', 'Loading states'],
    story: 'Working with real APIs is a daily job. Call the public GitHub API, show a profile card and handle every case: empty input, user not found and network errors.',
    requirements: [
      'An input `#username` and a button `#search-btn`',
      'On click, call `fetch("https://api.github.com/users/" + username)` (use async/await)',
      'Show the profile in `#profile`: avatar `<img>` (from `avatar_url`), name (or login), `followers` and `public_repos`',
      'If the user does not exist (status 404), show "User not found" in `#error`',
      'If the input is empty, do not call the API; show a message in `#error`',
      'If the network fails, show an error message in `#error`',
    ],
    milestones: [
      { title: 'Fetch', tasks: ['Search button calls the API with async/await', 'Show the profile card'] },
      { title: 'States', tasks: ['Loading text while fetching', 'Empty input, 404 and network errors handled'] },
      { title: 'Extras', tasks: ['Search with the Enter key', 'Show the latest 5 repositories (repos_url)', 'Publish and add to your portfolio'] },
    ],
    hints: ['`const res = await fetch(url); if (!res.ok) { ... }` – check `res.status === 404`.', 'Wrap the call in try/catch to handle network errors.', 'Clear `#error` and `#profile` at the start of every search.'],
    starter: {
      html: `<div class="finder">
  <h1>GitHub Profile Finder</h1>
  <input id="username" placeholder="Enter a GitHub username">
  <button id="search-btn">Search</button>
  <p id="error"></p>
  <div id="profile"></div>
</div>
`,
      css: `.finder { max-width: 480px; margin: 40px auto; font-family: system-ui; }
#error { color: #dc2626; }
`,
      js: `const input = document.getElementById('username');
const btn = document.getElementById('search-btn');
const errorEl = document.getElementById('error');
const profile = document.getElementById('profile');

btn.addEventListener('click', async () => {
  // TODO: read the username (empty -> error, no API call)
  // TODO: fetch https://api.github.com/users/<username>
  // TODO: 404 -> "User not found"; ok -> show avatar, name, followers, public_repos
  // TODO: catch network errors
});
`,
    },
    solution: {
      html: `<div class="finder">
  <h1>GitHub Profile Finder</h1>
  <div class="bar">
    <input id="username" placeholder="Enter a GitHub username" autocomplete="off">
    <button id="search-btn">Search</button>
  </div>
  <p id="loading" hidden>Loading…</p>
  <p id="error"></p>
  <div id="profile"></div>
</div>
`,
      css: `body { background: #0d1117; color: #e6edf3; font-family: system-ui; }
.finder { max-width: 480px; margin: 40px auto; }
.bar { display: flex; gap: 8px; }
#username { flex: 1; padding: 10px; border-radius: 8px; border: 1px solid #30363d; background: #161b22; color: #e6edf3; }
#search-btn { padding: 10px 16px; border: 0; border-radius: 8px; background: #238636; color: #fff; cursor: pointer; }
#error { color: #f85149; }
.card { display: flex; gap: 16px; align-items: center; padding: 16px; border: 1px solid #30363d; border-radius: 12px; background: #161b22; }
.card img { width: 96px; height: 96px; border-radius: 50%; }
.card a { color: #58a6ff; }
`,
      js: `const input = document.getElementById('username');
const btn = document.getElementById('search-btn');
const errorEl = document.getElementById('error');
const profile = document.getElementById('profile');
const loading = document.getElementById('loading');

async function search() {
  const name = input.value.trim();
  errorEl.textContent = '';
  profile.innerHTML = '';
  if (!name) {
    errorEl.textContent = 'Please enter a username.';
    return;
  }
  loading.hidden = false;
  try {
    const res = await fetch('https://api.github.com/users/' + encodeURIComponent(name));
    if (res.status === 404) {
      errorEl.textContent = 'User not found';
      return;
    }
    if (!res.ok) throw new Error('GitHub returned ' + res.status);
    const user = await res.json();
    profile.innerHTML =
      '<div class="card">' +
      '<img src="' + user.avatar_url + '" alt="Avatar of ' + user.login + '">' +
      '<div><h2>' + (user.name || user.login) + '</h2>' +
      '<p>Followers: ' + user.followers + ' · Repos: ' + user.public_repos + '</p>' +
      '<a href="' + user.html_url + '" target="_blank" rel="noreferrer">View profile</a></div>' +
      '</div>';
  } catch (err) {
    errorEl.textContent = 'Something went wrong: ' + err.message;
  } finally {
    loading.hidden = true;
  }
}

btn.addEventListener('click', search);
input.addEventListener('keydown', (e) => { if (e.key === 'Enter') search(); });
`,
    },
    tests: [
      { name: 'Calls the GitHub users API with the username', code: `const calls = mockFetch(() => ({ status: 200, body: { login: 'octocat', name: 'The Octocat', avatar_url: 'https://example.com/a.png', followers: 10, public_repos: 2, html_url: '#' } }));
await type('#username', 'octocat');
await click('#search-btn');
await wait(150);
expect(calls.length === 1, 'Expected exactly one fetch call, got ' + calls.length);
expect(/api\\.github\\.com\\/users\\/octocat/.test(calls[0]), 'fetch URL should be https://api.github.com/users/octocat, got ' + calls[0]);` },
      { name: 'Shows avatar, name, followers and repos', code: `mockFetch(() => ({ status: 200, body: { login: 'octocat', name: 'The Octocat', avatar_url: 'https://example.com/avatar.png', followers: 4321, public_repos: 87, html_url: '#' } }));
await type('#username', 'octocat'); await click('#search-btn'); await wait(200);
const p = text('#profile');
expect(p.includes('The Octocat'), '#profile should show the name');
expect(p.includes('4321'), '#profile should show the followers count');
expect(p.includes('87'), '#profile should show public_repos');
const img = $('#profile img');
expect(img && img.src.includes('avatar.png'), '#profile should show the avatar image');` },
      { name: '404 shows "User not found"', code: `mockFetch(() => ({ status: 404, body: { message: 'Not Found' } }));
await type('#username', 'no-such-user-xyz'); await click('#search-btn'); await wait(200);
expect(/not found/i.test(text('#error')), '#error should say User not found, it says "' + text('#error') + '"');` },
      { name: 'Empty input does not call the API', code: `const calls = mockFetch(() => ({ status: 200, body: {} }));
await type('#username', '   '); await click('#search-btn'); await wait(150);
expect(calls.length === 0, 'fetch should not be called for an empty username');
expect(text('#error').length > 0, 'Show a message in #error for empty input');` },
      { name: 'Network error is handled', code: `mockFetch(() => new Error('Network down'));
await type('#username', 'octocat'); await click('#search-btn'); await wait(200);
expect(text('#error').length > 0, 'Show an error message in #error when fetch fails');` },
    ],
    rubric: RUBRIC,
  },

  /* ------------------------------------------------------------------ 8 */
  {
    id: 'web-react-expense', icon: '💰', level: 'Advanced', hours: '6-8 hours', track: 'React', mode: 'react',
    title: 'Expense Tracker (React)',
    summary: 'A React app to add, list, filter and delete expenses with a live total: components, useState, controlled forms and derived data.',
    skills: ['React components', 'useState', 'Controlled forms', 'Lists & keys', 'Derived state'],
    story: 'React is the most asked frontend skill. Build an expense tracker where every number on screen is calculated from state, just like real dashboards.',
    requirements: [
      'A component named `App` (React 18 is loaded; use `const { useState } = React;`)',
      'A form with inputs `name="title"`, `name="amount"` (number) and a `<select name="category">` with Food, Travel, Bills, Shopping, Other',
      'Submitting adds the expense to a list `<ul className="expenses">` with one `<li>` per expense showing title and amount',
      '`#total` shows the sum of the visible expenses',
      'Each `<li>` has a button with class `delete` that removes it',
      'An empty title or amount ≤ 0 shows a message in `#error` and adds nothing',
      'A `<select id="filter">` with All + the categories shows only that category (and its total)',
    ],
    milestones: [
      { title: 'Components', tasks: ['App with ExpenseForm and ExpenseList components', 'Controlled form inputs with useState'] },
      { title: 'Features', tasks: ['Add, delete and total', 'Validation message', 'Category filter'] },
      { title: 'Extras', tasks: ['Save expenses to localStorage with useEffect', 'Build it with Vite in VS Code and deploy on Netlify/Vercel'] },
    ],
    hints: ['Keep expenses in `useState([])`; never change the array directly – use `[...expenses, newOne]` and `filter()`.', 'Total: `visible.reduce((sum, e) => sum + e.amount, 0)`.', 'Convert the amount with `Number(amount)` before saving.', 'Give every `<li>` a `key` (e.g. `id: Date.now()`).'],
    starter: {
      jsx: `const { useState } = React;

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];

function App() {
  const [expenses, setExpenses] = useState([]);
  const [title, setTitle] = useState('');
  // TODO: amount, category, filter and error state

  function addExpense(e) {
    e.preventDefault();
    // TODO: validate, then add { id, title, amount, category }
  }

  return (
    <div className="app">
      <h1>Expense Tracker</h1>
      <form onSubmit={addExpense}>
        <input name="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
        {/* TODO: amount input, category select, submit button */}
      </form>
      {/* TODO: #error, #filter select, ul.expenses list with delete buttons, #total */}
    </div>
  );
}
`,
      css: `.app { max-width: 480px; margin: 0 auto; font-family: system-ui; }
`,
    },
    solution: {
      jsx: `const { useState } = React;

const CATEGORIES = ['Food', 'Travel', 'Bills', 'Shopping', 'Other'];

function ExpenseForm({ onAdd }) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [error, setError] = useState('');

  function submit(e) {
    e.preventDefault();
    const value = Number(amount);
    if (!title.trim() || !(value > 0)) {
      setError('Enter a title and an amount greater than 0.');
      return;
    }
    onAdd({ id: Date.now() + Math.random(), title: title.trim(), amount: value, category });
    setTitle('');
    setAmount('');
    setError('');
  }

  return (
    <form onSubmit={submit} className="form">
      <input name="title" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <input name="amount" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select name="category" value={category} onChange={(e) => setCategory(e.target.value)}>
        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
      </select>
      <button type="submit">Add</button>
      {error && <p id="error">{error}</p>}
    </form>
  );
}

function App() {
  const [expenses, setExpenses] = useState([]);
  const [filter, setFilter] = useState('All');

  const visible = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter);
  const total = visible.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="app">
      <h1>💰 Expense Tracker</h1>
      <ExpenseForm onAdd={(exp) => setExpenses([...expenses, exp])} />
      <div className="bar">
        <select id="filter" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option>All</option>
          {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <span>Total: ₹<b id="total">{total}</b></span>
      </div>
      <ul className="expenses">
        {visible.map((e) => (
          <li key={e.id}>
            <span>{e.title} <small>({e.category})</small></span>
            <span>₹{e.amount}</span>
            <button className="delete" onClick={() => setExpenses(expenses.filter((x) => x.id !== e.id))}>✕</button>
          </li>
        ))}
      </ul>
      {visible.length === 0 && <p className="empty">No expenses yet.</p>}
    </div>
  );
}
`,
      css: `body { background: #f1f5f9; }
.app { max-width: 500px; margin: 0 auto; font-family: system-ui; background: #fff; padding: 20px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,.08); }
.form { display: grid; grid-template-columns: 2fr 1fr 1fr auto; gap: 8px; }
.form input, .form select, .bar select { padding: 8px; border: 1px solid #cbd5e1; border-radius: 8px; }
.form button { border: 0; border-radius: 8px; background: #4f46e5; color: #fff; padding: 8px 14px; }
#error { grid-column: 1 / -1; color: #dc2626; margin: 0; }
.bar { display: flex; justify-content: space-between; align-items: center; margin: 16px 0 8px; }
.expenses { list-style: none; padding: 0; }
.expenses li { display: grid; grid-template-columns: 1fr auto auto; gap: 12px; align-items: center; padding: 10px 0; border-bottom: 1px solid #e2e8f0; }
.delete { border: 0; background: none; color: #ef4444; cursor: pointer; }
.empty { color: #64748b; text-align: center; }
@media (max-width: 480px) { .form { grid-template-columns: 1fr 1fr; } }
`,
    },
    tests: [
      { name: 'Form has title, amount and category fields', code: `expect($('input[name=title]'), 'Add <input name="title">');
expect($('input[name=amount]'), 'Add <input name="amount">');
const sel = $('select[name=category]');
expect(sel, 'Add <select name="category">');
const opts = [...sel.options].map((o) => o.value);
for (const c of ['Food', 'Travel', 'Bills', 'Shopping', 'Other']) expect(opts.includes(c), 'Category select is missing "' + c + '"');` },
      { name: 'Adding an expense shows it in the list', code: `await type('input[name=title]', 'Lunch');
await type('input[name=amount]', '250');
await submit('form');
const items = $$('ul.expenses li');
expect(items.length === 1, 'Expected 1 <li> in ul.expenses, found ' + items.length);
expect(items[0].textContent.includes('Lunch') && items[0].textContent.includes('250'), 'The <li> should show the title and amount');` },
      { name: 'Total adds up the expenses', code: `await type('input[name=title]', 'Lunch'); await type('input[name=amount]', '250'); await submit('form');
await type('input[name=title]', 'Bus'); await type('input[name=amount]', '100'); await submit('form');
expect(/350/.test(text('#total')), '#total should show 350, it shows "' + text('#total') + '"');` },
      { name: 'Delete removes an expense and updates the total', code: `await type('input[name=title]', 'Lunch'); await type('input[name=amount]', '250'); await submit('form');
await type('input[name=title]', 'Bus'); await type('input[name=amount]', '100'); await submit('form');
await click('ul.expenses li .delete');
expect($$('ul.expenses li').length === 1, 'One expense should remain after delete');
expect(/100/.test(text('#total')), '#total should be 100 after deleting Lunch, it shows "' + text('#total') + '"');` },
      { name: 'Invalid input shows #error and adds nothing', code: `await type('input[name=title]', 'Nothing'); await type('input[name=amount]', '0'); await submit('form');
expect($$('ul.expenses li').length === 0, 'An amount of 0 must not be added');
expect(text('#error').length > 0, 'Show a validation message in #error');` },
      { name: 'Category filter shows only that category', code: `await type('input[name=title]', 'Pizza'); await type('input[name=amount]', '300'); await select('select[name=category]', 'Food'); await submit('form');
await type('input[name=title]', 'Train'); await type('input[name=amount]', '500'); await select('select[name=category]', 'Travel'); await submit('form');
await select('#filter', 'Travel');
const items = $$('ul.expenses li');
expect(items.length === 1 && items[0].textContent.includes('Train'), 'Filter "Travel" should show only Train');
expect(/500/.test(text('#total')), 'Total should be 500 for Travel, it shows "' + text('#total') + '"');` },
    ],
    rubric: RUBRIC,
  },
];

export const WEB_CUSTOM_PROJECT = {
  id: 'web-custom', icon: '💡', level: 'Any level', hours: 'You decide', track: 'HTML / CSS / JS', mode: 'web',
  title: 'Your Own Website Idea',
  summary: 'Build any website you like (restaurant site, weather app, game, blog …). Write your own milestones, build it here with live preview and submit it for a self-review score.',
  skills: ['Planning', 'Design', 'Everything you learned'],
  story: 'Pick an idea you care about. Plan the pages and features as milestones, build it here and submit it with a self-review.',
  requirements: ['Write 3–8 milestones for your idea in the Brief tab', 'Build it in the Code tab with live preview', 'Submit with a self-review'],
  milestones: [],
  hints: ['Start small: get one page working, then add features one milestone at a time.'],
  starter: { html: '<h1>My Website</h1>\n<p>Describe your idea here, then start building.</p>\n', css: 'body { font-family: system-ui; padding: 24px; }\n', js: '' },
  tests: null,
  rubric: RUBRIC,
};

export const findWebProject = (id) => (id === WEB_CUSTOM_PROJECT.id ? WEB_CUSTOM_PROJECT : WEB_PROJECTS.find((p) => p.id === id));
