export default {
  id: 'day-30-complete-html-project',
  title: 'Complete HTML Project, Practical Test, Revision and Interview Questions',
  module: 'Module 6: Professional HTML Development',
  day: 30,
  level: 'Advanced',
  duration: '4 hours',
  summary: "Today you put all 30 days together: you build a complete, semantic, accessible and SEO-friendly multi-section website (\"Spice Route\" restaurant), take a timed practical test, revise every module with a cheat sheet, and practise 25 real HTML interview questions.",
  objectives: [
    'Plan and build a complete single-page website using semantic HTML, media, tables, forms, SVG and meta tags',
    'Apply accessibility, SEO and clean-code best practices in one project',
    'Self-check the project with an automated audit script',
    'Complete a practical test covering all six modules',
    'Revise key concepts and answer 25 common HTML interview questions confidently',
  ],
  theory: [
    {
      heading: 'Project brief: "Spice Route" restaurant website',
      content: "You are a junior front-end developer. The client, a restaurant called **Spice Route**, wants a one-page website. Requirements:\n\n1. **Head**: charset, viewport, title, description, theme-color, language set on `<html>`.\n2. **Header**: SVG logo, site name, and main `<nav>` with in-page links (`#menu`, `#gallery`, `#visit`, `#book`). Include a skip link.\n3. **Hero section**: h1, tagline, call-to-action link to the booking form.\n4. **Menu section**: a `<table>` with caption, `<thead>`, `<tbody>`, and prices using the ₹ entity.\n5. **Gallery section**: images inside `<figure>` + `<figcaption>`, with alt text, width/height and `loading=\"lazy\"`.\n6. **Video**: a `<video>` tour with poster, controls and multiple sources.\n7. **Visit us**: `<address>`, opening hours with `<time>`, an embedded Google Map `<iframe>` with title.\n8. **Booking form**: labels, fieldset/legend, email, tel, date, time with step, number with min/max, select, radio buttons, textarea, validation attributes.\n9. **FAQ**: `<details>`/`<summary>`.\n10. **Footer**: copyright entity, contact email link, back-to-top link.\n11. JavaScript: confirm the booking without reloading and announce it in a live region.",
      tip: 'Build it in this order: skeleton (semantic landmarks) → content → forms → media → meta/SEO → accessibility pass → CSS polish → validation.',
    },
    {
      heading: 'Planning: wireframe and folder structure',
      content: "Sketch the page first (a **wireframe**), then map each block to an element:\n\n- Logo + nav → `<header>` + `<nav>`\n- Big welcome → `<section class=\"hero\">`\n- Each topic block → `<section id=\"...\" aria-labelledby=\"...\">` with an h2\n- Dishes in gallery → `<figure>`\n- Sidebar of offers → `<aside>`\n- Bottom → `<footer>`",
      syntax: `spice-route/
├── index.html
├── css/style.css
├── js/main.js
├── images/  (logo.svg, dishes .webp)
└── videos/  (tour.webm, tour.mp4)`,
    },
    {
      heading: 'Revision cheat sheet: Modules 1–3',
      content: "**Module 1 – Fundamentals**: HTML = HyperText Markup Language (structure, not a programming language). Document: `<!DOCTYPE html>`, `<html lang>`, `<head>`, `<body>`. Elements = tags + content; attributes give extra info (`name=\"value\"`). Headings h1–h6 (one h1), `<p>`, `<br>`, `<hr>`. Formatting: `<strong>` (importance) vs `<b>` (style), `<em>` vs `<i>`, `<mark>`, `<small>`, `<del>`, `<ins>`, `<sub>`, `<sup>`.\n\n**Module 2 – Links, Images, Lists, Tables**: `<a href>`; absolute vs relative URLs; `target=\"_blank\"` + `rel=\"noopener\"`; `mailto:` / `tel:`. `<img src alt width height>`. `<ul>`, `<ol>` (type, start, reversed), `<li>`, `<dl>/<dt>/<dd>`, nested lists. Tables: `<table>`, `<caption>`, `<thead>`, `<tbody>`, `<tr>`, `<th scope>`, `<td>`, `colspan`, `rowspan`.\n\n**Module 3 – Forms**: `<form action method>`; GET (data in URL, bookmarkable) vs POST (data in body, for sensitive or large data). Input types: text, password, email, number, tel, date, time, radio, checkbox, file, color, range, hidden, submit, reset. `<label for>`, `<textarea>`, `<select>/<option>`, `<button>`, `<fieldset>/<legend>`. Validation: required, minlength, maxlength, min, max, pattern, placeholder, readonly, disabled.",
    },
    {
      heading: 'Revision cheat sheet: Modules 4–6',
      content: "**Module 4 – Semantic & Advanced**: `<header>`, `<nav>`, `<main>` (one), `<section>` (themed, with heading), `<article>` (self-contained), `<aside>`, `<footer>`. Block (full width, new line) vs inline (flows in text); `<div>` / `<span>` are generic. `<iframe src title loading sandbox>`; YouTube uses `/embed/ID`. `<audio>` / `<video>` with `<source>`, controls, autoplay (needs muted), loop, poster, `<track>`. Entities: `&lt;` `&gt;` `&amp;` `&copy;` `&nbsp;` `&#8377;`; comments `<!-- -->`.\n\n**Module 5 – HTML5**: short doctype, new semantics (figure, figcaption, time, mark, details, summary), datalist, autocomplete tokens, autofocus, multiple, step. Canvas (pixels, JS, getContext('2d'), fillRect, paths, arc). SVG (vectors, viewBox, rect, circle, line, polygon). Meta: charset, viewport, description, robots; SEO basics.\n\n**Module 6 – Professional**: accessibility (alt, labels, landmarks, keyboard, ARIA rules), best practices (indentation, lowercase, quoted attributes, folder structure, validation), CSS integration (inline > internal/external by order), JS integration (defer vs async, DOM, addEventListener).",
    },
    {
      heading: 'Practical test instructions (90 minutes)',
      content: "Complete the six tasks in the **Practice** section below without looking at the solutions. Marking scheme (100 marks):\n\n1. Semantic page skeleton with correct head – 15 marks\n2. Data table with caption, header cells, colspan/rowspan – 15 marks\n3. Accessible registration form with validation – 20 marks\n4. Media section: video + YouTube + map – 15 marks\n5. SVG badge and canvas drawing – 15 marks\n6. Fix-the-bugs task (invalid, inaccessible markup) – 20 marks\n\nPass mark: 60. Then run the audit script from Example 4 on your own page and fix every reported issue.",
      tip: 'Validate your final file at validator.w3.org and run Lighthouse (Accessibility + SEO). Aim for zero validator errors and 90+ scores.',
    },
    {
      heading: 'What next?',
      content: "You now know HTML end-to-end. Next steps:\n- **CSS course**: layouts with Flexbox and Grid, responsive design, animations.\n- **JavaScript course**: DOM manipulation, events, fetch APIs.\n- **HTML Extras**: global and data-* attributes, dialog, picture/srcset, Web Storage, Open Graph and JSON-LD.\n- Build 3 portfolio projects (restaurant, personal portfolio, landing page) and publish them free with GitHub Pages or Netlify.",
    },
  ],
  examples: [
    {
      title: 'Complete project: Spice Route restaurant one-page site',
      scenario: 'Build the full website described in the project brief, combining every module of the course.',
      steps: [
        'Create the folder structure and index.html with the full <head> (charset, viewport, title, description, theme-color)',
        'Add the skip link and <header> with an inline SVG logo and <nav>',
        'Build <main> with sections: hero, menu table, gallery figures, video, visit us (address, time, map iframe), booking form, FAQ',
        'Add the <footer> with entities and a back-to-top link',
        'Write CSS in css/style.css and JS in js/main.js (loaded with defer) for booking confirmation',
        'Click Run, navigate with the menu links and Tab key, and submit the booking form',
      ],
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Spice Route | Authentic Indian Restaurant in Pune</title>
  <meta name="description" content="Spice Route serves authentic North and South Indian food in Pune. View our menu, take a video tour and book a table online.">
  <meta name="theme-color" content="#9a3412">
  <link rel="stylesheet" href="css/style.css">
  <script src="js/main.js" defer></script>
</head>
<body>
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">...logo svg + nav...</header>
  <main id="main">
    <section class="hero">...</section>
    <section id="menu">...table...</section>
    <section id="gallery">...figures + video...</section>
    <section id="visit">...address + map iframe...</section>
    <section id="book">...form...</section>
    <section id="faq">...details...</section>
  </main>
  <footer class="site-footer">...</footer>
</body>
</html>`,
      playground: {
        html: `<a class="skip-link" href="#main">Skip to main content</a>

<header class="site-header" id="top">
  <a href="#top" class="brand" aria-label="Spice Route home">
    <svg viewBox="0 0 40 40" width="36" height="36" aria-hidden="true">
      <circle cx="20" cy="20" r="18" fill="#fde68a"/>
      <polygon points="20,6 25,17 36,18 27,25 30,35 20,29 10,35 13,25 4,18 15,17" fill="#9a3412"/>
    </svg>
    <span>Spice Route</span>
  </a>
  <nav aria-label="Main">
    <ul>
      <li><a href="#menu">Menu</a></li>
      <li><a href="#gallery">Gallery</a></li>
      <li><a href="#visit">Visit</a></li>
      <li><a href="#book">Book</a></li>
    </ul>
  </nav>
</header>

<main id="main">
  <section class="hero" aria-labelledby="hero-title">
    <h1 id="hero-title">Authentic Indian Flavours in Pune</h1>
    <p>Slow-cooked curries, tandoor breads and South Indian classics since 2010.</p>
    <a class="btn" href="#book">Book a table</a>
  </section>

  <section id="menu" aria-labelledby="menu-title">
    <h2 id="menu-title">Our Menu</h2>
    <table>
      <caption>Chef&apos;s specials (prices include GST)</caption>
      <thead>
        <tr><th scope="col">Dish</th><th scope="col">Type</th><th scope="col">Price</th></tr>
      </thead>
      <tbody>
        <tr><th scope="row">Paneer Tikka</th><td>Veg</td><td>&#8377;320</td></tr>
        <tr><th scope="row">Butter Chicken</th><td>Non-veg</td><td>&#8377;420</td></tr>
        <tr><th scope="row">Masala Dosa</th><td>Veg</td><td>&#8377;180</td></tr>
        <tr><td colspan="2"><strong>Thali of the day</strong> (serves 2)</td><td>&#8377;599</td></tr>
      </tbody>
    </table>
  </section>

  <section id="gallery" aria-labelledby="gallery-title">
    <h2 id="gallery-title">Gallery</h2>
    <div class="grid">
      <figure>
        <img src="https://picsum.photos/id/292/300/200" alt="Fresh vegetables and spices on a wooden table" width="300" height="200" loading="lazy">
        <figcaption>Fresh ingredients every morning</figcaption>
      </figure>
      <figure>
        <img src="https://picsum.photos/id/429/300/200" alt="Plated dish garnished with herbs" width="300" height="200" loading="lazy">
        <figcaption>Plated with care</figcaption>
      </figure>
    </div>
    <h3>Video tour</h3>
    <video controls width="400" preload="none" poster="https://picsum.photos/id/1080/400/225">
      <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.webm" type="video/webm">
      <source src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4" type="video/mp4">
      Your browser does not support video.
    </video>
  </section>

  <section id="visit" aria-labelledby="visit-title">
    <h2 id="visit-title">Visit Us</h2>
    <address>
      12 FC Road, Shivajinagar, Pune 411005<br>
      Phone: <a href="tel:+912012345678">+91 20 1234 5678</a><br>
      Email: <a href="mailto:hello@spiceroute.example">hello@spiceroute.example</a>
    </address>
    <p>Open daily <time datetime="12:00">12 PM</time> &ndash; <time datetime="23:00">11 PM</time></p>
    <iframe class="map" src="https://www.google.com/maps?q=FC+Road,Pune&output=embed" loading="lazy" title="Map showing Spice Route on FC Road, Pune"></iframe>
  </section>

  <section id="book" aria-labelledby="book-title">
    <h2 id="book-title">Book a Table</h2>
    <form id="booking">
      <fieldset>
        <legend>Your details</legend>
        <label for="name">Full name</label>
        <input id="name" name="name" autocomplete="name" required minlength="2">
        <label for="email">Email</label>
        <input id="email" name="email" type="email" autocomplete="email" required>
        <label for="phone">Phone (10 digits)</label>
        <input id="phone" name="phone" type="tel" autocomplete="tel" pattern="[0-9]{10}" aria-describedby="phone-hint" required>
        <small id="phone-hint">Example: 9876543210</small>
      </fieldset>
      <fieldset>
        <legend>Reservation</legend>
        <label for="date">Date</label>
        <input id="date" name="date" type="date" required>
        <label for="time">Time</label>
        <input id="time" name="time" type="time" min="12:00" max="22:30" step="1800" required>
        <label for="guests">Guests</label>
        <input id="guests" name="guests" type="number" min="1" max="12" value="2" required>
        <label for="area">Seating</label>
        <select id="area" name="area">
          <option>Indoor</option>
          <option>Rooftop</option>
        </select>
        <p>Food preference:</p>
        <label><input type="radio" name="pref" value="veg" checked> Veg</label>
        <label><input type="radio" name="pref" value="nonveg"> Non-veg</label>
        <label for="notes">Special requests</label>
        <textarea id="notes" name="notes" rows="2" maxlength="200"></textarea>
      </fieldset>
      <button type="submit" class="btn">Confirm booking</button>
    </form>
    <p id="status" role="status" aria-live="polite"></p>
  </section>

  <section id="faq" aria-labelledby="faq-title">
    <h2 id="faq-title">FAQ</h2>
    <details>
      <summary>Do you have Jain food?</summary>
      <p>Yes, most dishes can be made without onion and garlic.</p>
    </details>
    <details>
      <summary>Is parking available?</summary>
      <p>Free valet parking after 7 PM.</p>
    </details>
  </section>
</main>

<footer class="site-footer">
  <p>&copy; 2026 Spice Route. Made with &hearts; in Pune.</p>
  <a href="#top">Back to top &uarr;</a>
</footer>`,
        css: `:root { --brand: #9a3412; --bg: #fffbeb; }
* { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; line-height: 1.5; color: #1c1917; background: var(--bg); }
.skip-link { position: absolute; left: -9999px; }
.skip-link:focus { left: 8px; top: 8px; background: #000; color: #fff; padding: 8px; z-index: 10; }
.site-header { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 8px; padding: 10px 16px; background: var(--brand); }
.brand { display: flex; align-items: center; gap: 8px; color: #fff; font-weight: 700; text-decoration: none; font-size: 1.2rem; }
.site-header ul { display: flex; gap: 14px; list-style: none; margin: 0; padding: 0; }
.site-header nav a { color: #fff; text-decoration: none; }
.site-header nav a:hover, .site-header nav a:focus-visible { text-decoration: underline; }
main section { padding: 16px; max-width: 760px; margin: 0 auto; }
.hero { text-align: center; padding: 32px 16px; }
.btn { display: inline-block; background: var(--brand); color: #fff; border: 0; padding: 10px 16px; border-radius: 6px; text-decoration: none; cursor: pointer; font: inherit; }
table { width: 100%; border-collapse: collapse; background: #fff; }
caption { text-align: left; font-style: italic; padding-bottom: 6px; }
th, td { border: 1px solid #e7e5e4; padding: 6px 8px; text-align: left; }
thead th { background: #fed7aa; }
.grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; }
figure { margin: 0; }
img, video { max-width: 100%; height: auto; border-radius: 8px; }
figcaption { font-size: 14px; color: #57534e; }
.map { width: 100%; aspect-ratio: 16 / 9; border: 0; border-radius: 8px; }
fieldset { border: 1px solid #d6d3d1; border-radius: 8px; margin-bottom: 12px; background: #fff; }
label { display: block; margin-top: 8px; }
fieldset label:has(input[type=radio]) { display: inline-block; margin-right: 12px; }
input:not([type=radio]), select, textarea { width: 100%; padding: 6px; font: inherit; }
input:focus-visible, select:focus-visible, textarea:focus-visible, .btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
#status { font-weight: 600; color: #166534; }
details { background: #fff; border: 1px solid #e7e5e4; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
summary { cursor: pointer; font-weight: 600; }
.site-footer { display: flex; justify-content: space-between; flex-wrap: wrap; padding: 12px 16px; background: #292524; color: #fafaf9; }
.site-footer a { color: #fde68a; }`,
        js: `// js/main.js
const form = document.getElementById('booking');
const status = document.getElementById('status');
const dateInput = document.getElementById('date');
// do not allow past dates
dateInput.min = new Date().toISOString().split('T')[0];

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) { form.reportValidity(); return; }
  const data = Object.fromEntries(new FormData(form));
  const msg = 'Thank you, ' + data.name + '! Table for ' + data.guests + ' (' + data.area + ') booked on ' + data.date + ' at ' + data.time + '.';
  status.textContent = msg;
  console.log('Booking data:', data);
  form.reset();
});
console.log('Sections:', [...document.querySelectorAll('main section')].map(s => s.id || s.className).join(', '));`,
      },
      result: 'A complete restaurant site: brown header with SVG logo and nav, hero with CTA, a styled menu table, image gallery with captions, a video, address with an embedded map, a validated booking form, an FAQ accordion and a dark footer. Submitting a valid booking shows a green confirmation (announced to screen readers) and logs the data.',
      explanation: 'Every module appears: document structure and meta (M1, M5), links/images/tables (M2), forms and validation (M3), semantic landmarks, iframe, video and entities (M4), HTML5 elements, step, SVG and SEO (M5), accessibility (skip link, labels, aria-live, focus styles), clean structure and CSS/JS integration (M6).',
    },
    {
      title: 'Project part: accessible booking form in isolation',
      scenario: 'Focus on the form from the project and test its validation rules one by one.',
      steps: [
        'Copy the booking form fields into a new file',
        'Click Run and submit empty: notice the browser messages',
        'Type a 9-digit phone number: the pattern rule fails',
        'Choose 22:45 as time: it is outside the max and step',
        'Fill everything correctly and submit',
      ],
      code: `<input type="tel" pattern="[0-9]{10}" required>
<input type="time" min="12:00" max="22:30" step="1800" required>
<input type="number" min="1" max="12" required>`,
      playground: {
        html: `<form id="f">
  <label for="p">Phone (10 digits)</label>
  <input id="p" name="phone" type="tel" pattern="[0-9]{10}" required>
  <label for="t">Time (12:00–22:30, every 30 min)</label>
  <input id="t" name="time" type="time" min="12:00" max="22:30" step="1800" required>
  <label for="g">Guests (1–12)</label>
  <input id="g" name="guests" type="number" min="1" max="12" required>
  <button>Check</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
label { display: block; margin-top: 8px; }
input { padding: 6px; }
input:invalid:not(:placeholder-shown) { border: 2px solid #dc2626; }
input:valid { border: 2px solid #16a34a; }`,
        js: `const f = document.getElementById('f');
f.addEventListener('submit', e => {
  e.preventDefault();
  console.log('All valid! ', Object.fromEntries(new FormData(f)));
});
f.addEventListener('invalid', e => {
  const v = e.target.validity;
  const reason = Object.keys(Object.getPrototypeOf(v)).find(k => k !== 'valid' && v[k]) || 'invalid';
  console.log(e.target.name, '→', reason);
}, true);`,
      },
      result: 'Invalid fields get a red border and the browser shows a message; the console names the failing rule (valueMissing, patternMismatch, rangeOverflow, stepMismatch). Valid input logs the data.',
      explanation: 'HTML validation attributes handle most rules without JavaScript. The ValidityState object tells you exactly which constraint failed.',
    },
    {
      title: 'Project part: info card with SVG icon and canvas rating chart',
      scenario: 'Add an "Our ratings" card: an SVG star icon and a canvas bar chart of customer ratings.',
      steps: [
        'Draw an SVG star with polygon (fill="currentColor")',
        'Create a <canvas> with role="img" and an aria-label summarising the data',
        'Draw five horizontal bars for 5★ to 1★ counts',
        'Click Run',
      ],
      code: `<svg viewBox="0 0 24 24"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9"/></svg>
<canvas width="300" height="150" role="img" aria-label="..."></canvas>`,
      playground: {
        html: `<article class="card">
  <h2><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><polygon points="12,2 15,9 22,9 16,14 18,21 12,17 6,21 8,14 2,9 9,9" fill="currentColor"/></svg> Our ratings: 4.6 / 5</h2>
  <canvas id="c" width="300" height="140" role="img" aria-label="Ratings: 5 stars 120, 4 stars 45, 3 stars 12, 2 stars 4, 1 star 2"></canvas>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.card { max-width: 340px; border: 1px solid #e7e5e4; border-radius: 10px; padding: 12px; }
h2 { display: flex; align-items: center; gap: 6px; color: #b45309; font-size: 1.1rem; }`,
        js: `const ctx = document.getElementById('c').getContext('2d');
const counts = [120, 45, 12, 4, 2];
const max = Math.max(...counts);
ctx.font = '13px sans-serif';
counts.forEach((n, i) => {
  const y = 10 + i * 26;
  ctx.fillStyle = '#1c1917';
  ctx.fillText((5 - i) + '★', 0, y + 14);
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(30, y, (n / max) * 220, 18);
  ctx.fillStyle = '#1c1917';
  ctx.fillText(n, 36 + (n / max) * 220, y + 14);
});
const total = counts.reduce((a, b) => a + b, 0);
const avg = counts.reduce((s, n, i) => s + n * (5 - i), 0) / total;
console.log('Average rating:', avg.toFixed(2), 'from', total, 'reviews');`,
      },
      result: 'A card with an amber star icon heading and a horizontal bar chart of ratings. Console: Average rating: 4.64 from 183 reviews.',
      explanation: 'SVG suits small scalable icons; canvas suits data drawn by code. The aria-label on the canvas gives screen readers the same information as the picture.',
    },
    {
      title: 'Practical test self-audit script',
      scenario: 'Run an automated checklist against any page you build for the test (paste your HTML into the HTML panel).',
      steps: [
        'Paste your test page HTML into the HTML panel (a sample with some issues is provided)',
        'Click Run',
        'Read the PASS/FAIL list in the console and fix each FAIL',
        'Run again until every check passes',
      ],
      code: `check('Exactly one <h1>', document.querySelectorAll('h1').length === 1);
check('All images have alt', !document.querySelector('img:not([alt])'));
check('All inputs have labels', ...);`,
      playground: {
        html: `<header><nav><a href="#">Home</a></nav></header>
<main>
  <h1>Test Page</h1>
  <img src="https://picsum.photos/id/40/120/80" alt="Cat looking at camera" width="120" height="80">
  <form>
    <label for="e">Email</label><input id="e" type="email" required>
    <input type="text" placeholder="Name">
    <button>Send</button>
  </form>
  <table><tr><td>No header cells</td></tr></table>
</main>
<footer>&copy; 2026</footer>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `let pass = 0, fail = 0;
function check(name, ok) { ok ? pass++ : fail++; console.log((ok ? 'PASS ' : 'FAIL ') + name); }
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
check('Exactly one <h1>', $$('h1').length === 1);
check('Has <header>, <main>, <footer>', !!($('header') && $('main') && $('footer')));
check('Exactly one <main>', $$('main').length === 1);
check('Has <nav>', !!$('nav'));
check('All images have alt', $$('img').every(i => i.hasAttribute('alt')));
check('All images have width/height', $$('img').every(i => i.hasAttribute('width') && i.hasAttribute('height')));
const unlabeled = $$('input:not([type=hidden]):not([type=submit]), select, textarea').filter(el =>
  !(el.id && $('label[for="' + el.id + '"]')) && !el.closest('label') && !el.getAttribute('aria-label'));
check('All form controls have labels (' + unlabeled.length + ' missing)', unlabeled.length === 0);
check('Tables have <th> cells', $$('table').every(t => t.querySelector('th')));
check('Tables have <caption>', $$('table').every(t => t.querySelector('caption')));
const ids = $$('[id]').map(e => e.id);
check('IDs are unique', new Set(ids).size === ids.length);
check('No inline style attributes', !$('[style]'));
check('Links have text', $$('a').every(a => a.textContent.trim() || a.getAttribute('aria-label')));
console.log('Score: ' + pass + '/' + (pass + fail));`,
      },
      result: 'The console prints PASS/FAIL lines. For the sample: unlabelled Name input, table without <th> and without <caption> fail; the rest pass. Final line shows the score, e.g. Score: 9/12.',
      explanation: 'This mirrors the marking scheme: semantics, accessibility and clean code. Fix the sample by adding <label for="n">Name</label> with id="n", and a <caption> plus <th> cells in the table, then re-run for 12/12.',
    },
  ],
  interview: [
    { q: 'What is HTML and is it a programming language?', a: 'HyperText Markup Language, the standard markup language that structures web content. It is a markup language, not a programming language: it has no logic, loops or variables.', level: 'Easy' },
    { q: 'What is the purpose of <!DOCTYPE html>?', a: 'Tells the browser the document is HTML5 and triggers standards mode rendering instead of quirks mode.', level: 'Easy' },
    { q: 'Difference between an element, a tag and an attribute?', a: 'A tag is the markup (<p>, </p>); an element is the opening tag + content + closing tag; an attribute provides extra information inside the opening tag (class="x").', level: 'Easy' },
    { q: 'What are void (empty) elements? Give examples.', a: 'Elements with no content or closing tag: <br>, <hr>, <img>, <input>, <meta>, <link>, <source>, <track>, <wbr>, <area>, <col>, <embed>.', level: 'Easy' },
    { q: 'Difference between <strong> and <b>, <em> and <i>?', a: '<strong> means strong importance and <em> stress emphasis (semantic, read with emphasis by some screen readers). <b> and <i> are stylistic offsets without extra importance (e.g. keywords, foreign terms).', level: 'Medium' },
    { q: 'Absolute vs relative URLs?', a: 'Absolute includes the protocol and domain (https://site.com/a.html). Relative is resolved from the current page location (images/a.png, ../about.html, /contact).', level: 'Easy' },
    { q: 'Why add rel="noopener noreferrer" to target="_blank" links?', a: 'Prevents the new page from accessing window.opener (reverse tabnabbing) and optionally hides the referrer. Modern browsers imply noopener for _blank, but adding it is still good practice.', level: 'Medium' },
    { q: 'What is the difference between GET and POST?', a: 'GET appends data to the URL (visible, cached, bookmarkable, length-limited, for reading). POST sends data in the request body (not in URL, for creating/sensitive or large data, not cached).', level: 'Medium' },
    { q: 'How do colspan and rowspan work?', a: 'colspan="n" makes a cell span n columns horizontally; rowspan="n" makes it span n rows vertically. Remove the corresponding cells from the spanned positions.', level: 'Easy' },
    { q: 'Why use <thead>, <tbody> and <tfoot>?', a: 'They group table rows semantically, help accessibility, allow styling and scrolling bodies, and repeat headers when printing long tables.', level: 'Medium' },
    { q: 'How do you associate a label with an input?', a: 'Explicitly with <label for="id"> matching the input id, or implicitly by wrapping the input inside the <label>.', level: 'Easy' },
    { q: 'What is the difference between readonly and disabled?', a: 'readonly fields cannot be edited but are focusable and submitted. disabled fields cannot be focused or edited and are NOT submitted.', level: 'Medium' },
    { q: 'What is semantic HTML and why is it important?', a: 'Using elements that convey meaning (header, nav, main, article, footer). It improves accessibility (landmarks), SEO and maintainability.', level: 'Easy' },
    { q: 'Explain block vs inline vs inline-block.', a: 'Block: new line, full width, accepts all box properties. Inline: flows in text, content width, ignores width/height. Inline-block: flows inline but accepts width/height/vertical margin.', level: 'Medium' },
    { q: 'What is the difference between <div> and <section>?', a: '<div> is a meaningless generic container for styling. <section> is a semantic thematic grouping, normally with a heading, which appears in the document outline.', level: 'Medium' },
    { q: 'How do you embed a video that autoplays?', a: '<video autoplay muted loop playsinline> with <source> children. Browsers block autoplay with sound, so muted is required.', level: 'Medium' },
    { q: 'What does the sandbox attribute on an iframe do?', a: 'Restricts the embedded content (no scripts, forms, popups, same-origin access) unless specific tokens like allow-scripts are added.', level: 'Hard' },
    { q: 'What are data-* attributes?', a: 'Custom attributes (data-id="7") to store extra information on elements, readable in JS via element.dataset.id and in CSS via attribute selectors.', level: 'Medium' },
    { q: 'Difference between localStorage, sessionStorage and cookies?', a: 'localStorage persists until cleared (~5–10 MB); sessionStorage lasts for the tab session; cookies are small (~4 KB), sent to the server with every request and can have expiry and HttpOnly/secure flags.', level: 'Hard' },
    { q: 'Canvas vs SVG?', a: 'Canvas: raster, drawn with JS, no DOM per shape, great for games and many objects. SVG: vector XML, scalable, each shape is a DOM node with events, better for icons, logos and interactive charts.', level: 'Hard' },
    { q: 'What meta tags should every page have?', a: 'charset (UTF-8), viewport (width=device-width, initial-scale=1), and a description; plus a unique <title>. Optionally robots, theme-color, Open Graph tags.', level: 'Easy' },
    { q: 'How do you make a website accessible with HTML?', a: 'Semantic landmarks, logical headings, alt text, labelled form controls, native buttons/links, keyboard focus, sufficient contrast, lang attribute, captions for media, ARIA only when needed.', level: 'Medium' },
    { q: 'What is the difference between defer and async?', a: 'Both download scripts without blocking parsing. defer executes after parsing in document order; async executes as soon as downloaded in any order.', level: 'Medium' },
    { q: 'What is the DOM and how does it differ from HTML source?', a: 'The DOM is the live object tree built from the HTML. It can differ from source because of parser error correction and JavaScript changes.', level: 'Medium' },
    { q: 'How would you improve the loading performance of an HTML page?', a: 'Optimise and lazy-load images (loading="lazy", WebP, width/height), defer scripts, minimise render-blocking CSS, preload key assets, use caching/CDN, reduce DOM size.', level: 'Hard' },
    { q: 'What is the difference between id and class?', a: 'id must be unique per page and has higher CSS specificity; class can be reused on many elements and an element can have multiple classes.', level: 'Easy' },
    { q: 'What happens if you nest a <form> inside another <form>?', a: 'It is invalid: the parser ignores the inner <form> tag. Use the form attribute on controls (form="otherFormId") to associate controls with a different form.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'TEST 1 (15 marks): Write a complete semantic page skeleton for "City Library": full head (charset, viewport, title, description), skip link, header with nav (Books, Events, Contact), main with two sections, and a footer.',
      hint: 'One h1, sections with h2, lang on html.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>City Library | Books, Events and Study Rooms</title>
  <meta name="description" content="City Library offers 50,000 books, weekly reading events and free study rooms. Become a member today.">
</head>
<body>
  <a href="#main" class="skip-link">Skip to main content</a>
  <header>
    <h1>City Library</h1>
    <nav aria-label="Main">
      <ul>
        <li><a href="#books">Books</a></li>
        <li><a href="#events">Events</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </nav>
  </header>
  <main id="main">
    <section id="books"><h2>Books</h2><p>Over 50,000 titles.</p></section>
    <section id="events"><h2>Events</h2><p>Story time every Saturday.</p></section>
  </main>
  <footer id="contact">
    <p>&copy; 2026 City Library &middot; <a href="mailto:info@citylib.example">info@citylib.example</a></p>
  </footer>
</body>
</html>`,
    },
    {
      task: 'TEST 2 (15 marks): Build a timetable table with a caption, header row, row headers, one cell spanning 2 columns ("Lunch") and one cell spanning 2 rows ("Lab").',
      hint: 'Use scope on th; remove spanned cells.',
      solution: `<table>
  <caption>Class timetable – Monday & Tuesday</caption>
  <thead>
    <tr><th scope="col">Day</th><th scope="col">9 AM</th><th scope="col">10 AM</th><th scope="col">11 AM</th></tr>
  </thead>
  <tbody>
    <tr><th scope="row">Monday</th><td>HTML</td><td colspan="2">Lunch</td></tr>
    <tr><th scope="row">Tuesday</th><td>CSS</td><td rowspan="2">Lab</td><td>JS</td></tr>
    <tr><th scope="row">Wednesday</th><td>React</td><td>Git</td></tr>
  </tbody>
</table>`,
    },
    {
      task: 'TEST 3 (20 marks): Create an accessible student registration form: name (required, min 3), email, password (min 8, autocomplete new-password), date of birth, course (select), gender (radio in fieldset), terms checkbox (required), and submit button.',
      hint: 'Every control needs a label; radios grouped with fieldset/legend.',
      solution: `<form action="/register" method="post">
  <label for="n">Full name</label>
  <input id="n" name="name" required minlength="3" autocomplete="name">

  <label for="em">Email</label>
  <input id="em" name="email" type="email" required autocomplete="email">

  <label for="pw">Password</label>
  <input id="pw" name="password" type="password" required minlength="8" autocomplete="new-password" aria-describedby="pw-hint">
  <small id="pw-hint">At least 8 characters.</small>

  <label for="dob">Date of birth</label>
  <input id="dob" name="dob" type="date" required>

  <label for="course">Course</label>
  <select id="course" name="course" required>
    <option value="">-- Choose --</option>
    <option>Web Development</option>
    <option>Data Science</option>
  </select>

  <fieldset>
    <legend>Gender</legend>
    <label><input type="radio" name="gender" value="female" required> Female</label>
    <label><input type="radio" name="gender" value="male"> Male</label>
    <label><input type="radio" name="gender" value="other"> Other</label>
  </fieldset>

  <label><input type="checkbox" name="terms" required> I accept the terms</label>
  <button type="submit">Register</button>
</form>`,
    },
    {
      task: 'TEST 4 (15 marks): Create a media section containing a video with poster and two sources, a responsive YouTube embed, and a Google Map iframe, all with titles/fallbacks.',
      hint: 'youtube /embed/ URL; map output=embed; aspect-ratio CSS.',
      solution: `<section aria-labelledby="media-h">
  <h2 id="media-h">Media</h2>
  <video controls width="480" poster="https://picsum.photos/480/270">
    <source src="tour.webm" type="video/webm">
    <source src="tour.mp4" type="video/mp4">
    Your browser does not support video. <a href="tour.mp4">Download</a>.
  </video>
  <iframe style="width:100%;aspect-ratio:16/9;border:0"
    src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"
    title="Campus tour video" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>
  <iframe style="width:100%;aspect-ratio:4/3;border:0" loading="lazy"
    src="https://www.google.com/maps?q=Connaught+Place,New+Delhi&output=embed"
    title="Map of Connaught Place, New Delhi"></iframe>
</section>`,
    },
    {
      task: 'TEST 5 (15 marks): Draw (a) an SVG badge: a green circle with a white tick polyline, accessible title; (b) a canvas with a blue rectangle and a red diagonal line.',
      hint: 'role="img" + <title>; getContext("2d").',
      solution: `<svg viewBox="0 0 100 100" width="80" role="img" aria-labelledby="ok-t">
  <title id="ok-t">Verified</title>
  <circle cx="50" cy="50" r="45" fill="#16a34a"/>
  <polyline points="28,52 44,68 74,36" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

<canvas id="cv" width="200" height="120" role="img" aria-label="Blue rectangle crossed by a red line"></canvas>
<script>
  const ctx = document.getElementById('cv').getContext('2d');
  ctx.fillStyle = 'royalblue';
  ctx.fillRect(20, 20, 160, 80);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(200, 120);
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 4;
  ctx.stroke();
</script>`,
    },
    {
      task: 'TEST 6 (20 marks): Find and fix ALL problems: <HTML><body><center><h1>Shop</h1></center><h1>Deals</h1><img src="sale.jpg"><div onclick="buy()">Buy</div><input placeholder="Email"><p>Price < 500 & free delivery<p><span><div>Note</div></span><a href="#">click here</a></body>',
      hint: 'Look for: doctype/head/lang, obsolete tags, two h1s, missing alt, fake button, missing label, unescaped characters, unclosed p, invalid nesting, vague link.',
      solution: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Shop | Today's Deals</title>
  <style>h1 { text-align: center; }</style>
</head>
<body>
  <main>
    <h1>Shop</h1>
    <h2>Deals</h2>
    <img src="sale.jpg" alt="Big festive sale banner, up to 50% off" width="600" height="200">
    <button type="button" id="buy">Buy</button>
    <label for="email">Email</label>
    <input id="email" type="email" placeholder="you@example.com">
    <p>Price &lt; 500 &amp; free delivery</p>
    <div><span>Note</span></div>
    <a href="/deals">View all deals</a>
  </main>
  <script>
    document.getElementById('buy').addEventListener('click', () => buy());
  </script>
</body>
</html>`,
    },
  ],
  quiz: [
    { question: 'Which set of elements are all semantic landmarks?', options: ['<div>, <span>, <b>', '<header>, <nav>, <main>, <footer>', '<table>, <tr>, <td>', '<br>, <hr>, <img>'], answer: 1, explanation: 'header, nav, main and footer map to landmark roles.' },
    { question: 'Which form method should be used for a login form?', options: ['GET', 'PUT in HTML', 'POST', 'FETCH'], answer: 2, explanation: 'POST keeps credentials out of the URL.' },
    { question: 'An image that is purely decorative should have:', options: ['alt=""', 'No alt attribute', 'alt="image"', 'title only'], answer: 0, explanation: 'Empty alt tells screen readers to skip it.' },
    { question: 'Which pair is correct?', options: ['<canvas> = vector, <svg> = pixels', 'async = runs in order', 'readonly fields are not submitted', 'defer = runs after HTML parsing, in order'], answer: 3, explanation: 'defer preserves order and waits for parsing.' },
    { question: 'Which entity displays the Indian Rupee sign?', options: ['&rupee;', '&#8377;', '&inr;', '&#36;'], answer: 1, explanation: '₹ is U+20B9 = decimal 8377.' },
  ],
};
