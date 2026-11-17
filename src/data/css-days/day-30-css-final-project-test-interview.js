export default {
  id: 'day-30-css-final-project-test-interview',
  title: 'Complete Responsive Website Project, Practical Test, Interview Questions',
  module: 'Module 7: Professional CSS',
  day: 30,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'The final day: build a complete, responsive, themeable landing page that uses everything from the course (box model, Flexbox, Grid, media queries, clamp(), variables, transitions, animations, BEM and modern selectors), then take a practical test and revise with 25 interview questions.',
  objectives: [
    'Plan and build a full responsive website from design tokens to finished sections',
    'Combine Flexbox and Grid, mobile-first media queries, fluid typography and CSS variables in one project',
    'Add polish: hover transitions, entrance animation, dark mode and accessible focus styles',
    'Pass a timed practical test and answer the most common CSS interview questions confidently',
  ],
  theory: [
    {
      heading: 'Project brief: "Brewly" coffee shop landing page',
      content: `You will build a one-page website for a fictional coffee shop called **Brewly**. It must look good from 320px phones to 1440px desktops.

**Sections**
1. **Header / navbar** – logo, links, "Order" button; links collapse into a hamburger menu on mobile
2. **Hero** – big fluid heading, sub-text, two buttons, image
3. **Features** – 3–4 cards in a responsive grid (auto-fit + minmax)
4. **Menu / pricing** – cards with aligned "Add" buttons, one featured card
5. **Testimonials** – quote cards
6. **Contact / newsletter form** – styled inputs with focus and validation states
7. **Footer** – multi-column links that stack on mobile

**Technical requirements**
- Mobile-first, at least two breakpoints
- Design tokens with CSS custom properties, plus a dark theme
- Flexbox for the navbar and small components, Grid for page sections
- \`clamp()\` for headings and section spacing
- Hover/focus transitions and one keyframe entrance animation, disabled for \`prefers-reduced-motion\`
- BEM class names, no IDs for styling, no \`!important\``,
    },
    {
      heading: 'Step-by-step build plan',
      content: `Professional developers don't start with colours – they start with structure.

1. **Write semantic HTML first**: \`header > nav\`, \`main > section\`, \`footer\`. Check it reads well with no CSS.
2. **Tokens** on \`:root\`: colours, spacing scale, radius, shadows, font sizes.
3. **Reset/base**: \`box-sizing: border-box\`, \`img { max-width: 100% }\`, body font and line-height.
4. **Layout helpers**: \`.container { width: min(100% - 2rem, 1100px); margin-inline: auto; }\`, \`.section { padding-block: clamp(3rem, 8vw, 6rem); }\`
5. **Components** one at a time (BEM): \`.btn\`, \`.nav\`, \`.card\`, \`.price\`, \`.form\`
6. **Responsive**: test at 360px, add \`min-width\` queries where the layout looks stretched
7. **Polish**: transitions, animation, dark mode, focus-visible
8. **Test**: keyboard navigation, zoom to 200%, DevTools Lighthouse (performance & accessibility)`,
      syntax: `styles.css order:
/* 1. tokens */ /* 2. reset/base */ /* 3. layout */
/* 4. components */ /* 5. utilities */ /* 6. media queries / dark theme */`,
    },
    {
      heading: 'Full-course revision cheat sheet',
      content: `**Module 1 – Basics:** inline/internal/external CSS; selectors (element, .class, #id, *, group); colours (hex, rgb, hsl); units (px, %, em, rem, vw, vh, ch); fonts and text; backgrounds.

**Module 2 – Box model & positioning:** content → padding → border → margin; \`box-sizing: border-box\`; margin collapsing; display block/inline/inline-block/none; position static/relative/absolute/fixed/sticky; z-index & stacking context.

**Module 3 – Selectors & cascade:** combinators (space, >, +, ~); attribute selectors; pseudo-classes (:hover, :focus, :nth-child, :not); pseudo-elements (::before, ::after); specificity (inline > ID > class/attr/pseudo-class > element); cascade order: origin/importance → layers → specificity → source order; inheritance.

**Module 4 – Layout:** floats (legacy); Flexbox (1D: justify-content main axis, align-items cross axis, flex: grow shrink basis); Grid (2D: fr, repeat, minmax, auto-fit, template areas); centering.

**Module 5 – Responsive:** viewport meta; mobile-first min-width queries; fluid images; clamp/min/max; custom properties & calc; dark mode.

**Module 6 – Effects:** transitions & transforms; @keyframes; shadows, gradients, filters, object-fit.

**Module 7 – Professional:** BEM; file structure; Sass; Tailwind/Bootstrap; :has(), :is()/:where(); container queries; nesting; performance.`,
    },
    {
      heading: 'Practical test (90 minutes)',
      content: `Do this without looking at notes, then compare with the **Practice** section solutions.

1. **Box model (10 marks):** A 300px-wide box with 20px padding and 5px border must stay exactly 300px wide.
2. **Flexbox (15 marks):** Navbar – logo left, links right, vertically centred, 24px gap between links.
3. **Grid (15 marks):** Responsive gallery with no media queries, min tile width 180px.
4. **Centering (10 marks):** Center a modal both ways over a full-screen overlay.
5. **Responsive (15 marks):** Two-column layout that stacks below 700px (mobile-first).
6. **Variables & theme (15 marks):** Light/dark theme with a toggle class on \`<html>\`.
7. **Animation (10 marks):** A button that lifts on hover and a spinner that rotates forever.
8. **Selectors (10 marks):** Zebra-striped table rows and a highlighted row on hover.

**Scoring:** 80+ excellent, 60–79 good (revise weak modules), below 60 – redo Modules 4–5 projects.`,
      tip: 'In live coding interviews, talk while you code: "I\'m using Grid here because it\'s two-dimensional…" Explaining your choice matters as much as the result.',
    },
    {
      heading: 'Final checklist before you ship',
      content: `- Semantic HTML and meaningful alt text
- Viewport meta tag present
- No horizontal scroll at 320px
- Text readable: body ≥ 16px, line-height ≈ 1.5, contrast ratio ≥ 4.5:1
- Visible \`:focus-visible\` outlines on every interactive element
- Images: \`max-width: 100%\`, width/height or aspect-ratio set
- Animations respect \`prefers-reduced-motion\`
- Dark mode tested
- CSS validated (W3C validator), linted (Stylelint), minified for production
- Lighthouse scores checked

**Congratulations!** You've completed the CSS course. Next step: JavaScript, to make these beautiful pages interactive.`,
    },
  ],
  examples: [
    {
      title: 'Complete project: Brewly responsive landing page',
      scenario: 'The full one-page website with header, hero, features, menu/pricing, testimonials, newsletter form, footer and a dark-mode toggle. Resize the preview to see the mobile and desktop layouts.',
      steps: [
        'Write the semantic HTML for all sections',
        'Add design tokens and a dark theme on :root / [data-theme="dark"]',
        'Add reset, .container and .section layout helpers',
        'Style each BEM component: nav, hero, card, price, quote, form, footer',
        'Add mobile-first media queries at 640px and 900px',
        'Add transitions, the fade-up animation and reduced-motion support',
        'Click Run; resize the preview; click the 🌙 button and the ☰ menu (on narrow widths)',
      ],
      code: `:root {
  --c-bg: #fffaf3; --c-surface: #fff; --c-text: #2b1d14; --c-muted: #7a6a5d;
  --c-primary: #b45309; --c-primary-dark: #92400e; --c-border: #f1e4d3;
  --radius: 14px; --shadow: 0 10px 30px rgb(60 30 0 / .12);
  --fs-hero: clamp(2.2rem, 1.2rem + 5vw, 4.2rem);
}
[data-theme="dark"] { --c-bg: #1a120c; --c-surface: #26190f; --c-text: #f6eadf; ... }

.nav { display: flex; align-items: center; justify-content: space-between; }
.hero { display: grid; gap: 2rem; }
@media (min-width: 900px) { .hero { grid-template-columns: 1.1fr 1fr; align-items: center; } }
.features__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 1.25rem; }`,
      playground: {
        html: `<header class="header">
  <div class="container nav">
    <a class="nav__logo" href="#">☕ Brewly</a>
    <input type="checkbox" id="nav-toggle" class="nav__toggle" aria-label="Toggle menu">
    <label for="nav-toggle" class="nav__burger" aria-hidden="true"><span></span><span></span><span></span></label>
    <ul class="nav__links">
      <li><a class="nav__link" href="#features">Why us</a></li>
      <li><a class="nav__link" href="#menu">Menu</a></li>
      <li><a class="nav__link" href="#reviews">Reviews</a></li>
      <li><a class="nav__link" href="#contact">Contact</a></li>
      <li><button class="theme-btn" id="theme" type="button" aria-label="Toggle dark mode">🌙</button></li>
      <li><a class="btn btn--primary btn--small" href="#menu">Order</a></li>
    </ul>
  </div>
</header>

<main>
  <section class="section hero-section">
    <div class="container hero">
      <div class="hero__text animate">
        <p class="eyebrow">Freshly roasted every morning</p>
        <h1 class="hero__title">Coffee that makes your <span>mornings</span> better.</h1>
        <p class="hero__sub">Single-origin beans, slow-brewed with love, delivered hot to your desk in 15 minutes.</p>
        <div class="hero__actions">
          <a class="btn btn--primary" href="#menu">See the menu</a>
          <a class="btn btn--ghost" href="#contact">Visit us</a>
        </div>
      </div>
      <img class="hero__img animate" style="--d:1" src="https://picsum.photos/seed/coffeehero/700/560" alt="Cup of coffee on a wooden table">
    </div>
  </section>

  <section class="section" id="features">
    <div class="container">
      <h2 class="section__title">Why people love Brewly</h2>
      <div class="features__grid">
        <article class="card animate" style="--d:0"><div class="card__icon">🌱</div><h3 class="card__title">Ethically sourced</h3><p class="card__text">Direct trade with farmers in Coorg and Chikmagalur.</p></article>
        <article class="card animate" style="--d:1"><div class="card__icon">🔥</div><h3 class="card__title">Roasted daily</h3><p class="card__text">Small batches roasted every morning for peak flavour.</p></article>
        <article class="card animate" style="--d:2"><div class="card__icon">🚴</div><h3 class="card__title">15-min delivery</h3><p class="card__text">Hot coffee at your door before your meeting starts.</p></article>
        <article class="card animate" style="--d:3"><div class="card__icon">♻️</div><h3 class="card__title">Zero plastic</h3><p class="card__text">Compostable cups and reusable bottle discounts.</p></article>
      </div>
    </div>
  </section>

  <section class="section section--alt" id="menu">
    <div class="container">
      <h2 class="section__title">Our menu</h2>
      <div class="menu__grid">
        <article class="price">
          <img class="price__img" src="https://picsum.photos/seed/espresso/400/260" alt="Espresso">
          <div class="price__body"><h3 class="price__name">Espresso</h3><p class="price__desc">Bold, rich, short.</p><p class="price__amount">₹120</p><button class="btn btn--primary price__btn">Add</button></div>
        </article>
        <article class="price price--featured">
          <span class="price__badge">Best seller</span>
          <img class="price__img" src="https://picsum.photos/seed/latte/400/260" alt="Latte">
          <div class="price__body"><h3 class="price__name">Caramel Latte</h3><p class="price__desc">Espresso, steamed milk, house caramel and a pinch of sea salt.</p><p class="price__amount">₹210</p><button class="btn btn--primary price__btn">Add</button></div>
        </article>
        <article class="price">
          <img class="price__img" src="https://picsum.photos/seed/coldbrew/400/260" alt="Cold brew">
          <div class="price__body"><h3 class="price__name">Cold Brew</h3><p class="price__desc">Steeped 18 hours.</p><p class="price__amount">₹180</p><button class="btn btn--primary price__btn">Add</button></div>
        </article>
      </div>
    </div>
  </section>

  <section class="section" id="reviews">
    <div class="container">
      <h2 class="section__title">What customers say</h2>
      <div class="quotes">
        <blockquote class="quote"><p>"Best latte in Bengaluru, and it arrives still hot."</p><footer class="quote__author">— Ananya, designer</footer></blockquote>
        <blockquote class="quote"><p>"Our whole office orders Brewly every day at 11."</p><footer class="quote__author">— Rahul, team lead</footer></blockquote>
        <blockquote class="quote"><p>"Finally, coffee without the plastic guilt."</p><footer class="quote__author">— Fatima, student</footer></blockquote>
      </div>
    </div>
  </section>

  <section class="section section--alt" id="contact">
    <div class="container contact">
      <div>
        <h2 class="section__title section__title--left">Get 20% off your first order</h2>
        <p class="hero__sub">Join our newsletter for weekly offers. No spam, ever.</p>
      </div>
      <form class="form" onsubmit="event.preventDefault(); this.querySelector('.form__msg').textContent = 'Thanks! Check your inbox ☕';">
        <label class="form__field">Name<input class="form__input" required placeholder="Your name"></label>
        <label class="form__field">Email<input class="form__input" type="email" required placeholder="you@example.com"></label>
        <button class="btn btn--primary" type="submit">Subscribe</button>
        <p class="form__msg" role="status"></p>
      </form>
    </div>
  </section>
</main>

<footer class="footer">
  <div class="container footer__grid">
    <div><a class="nav__logo" href="#">☕ Brewly</a><p class="footer__text">Great coffee, delivered.</p></div>
    <div><h4>Company</h4><a href="#">About</a><a href="#">Careers</a></div>
    <div><h4>Help</h4><a href="#">FAQ</a><a href="#">Delivery</a></div>
    <div><h4>Follow</h4><a href="#">Instagram</a><a href="#">X / Twitter</a></div>
  </div>
  <p class="footer__copy">© 2026 Brewly. Built with pure CSS.</p>
</footer>`,
        css: `/* ========== 1. TOKENS ========== */
:root {
  color-scheme: light;
  --c-bg: #fffaf3; --c-surface: #ffffff; --c-alt: #fdf1e3;
  --c-text: #2b1d14; --c-muted: #7a6a5d; --c-border: #f1e4d3;
  --c-primary: #b45309; --c-primary-dark: #92400e; --c-on-primary: #ffffff;
  --radius: 14px;
  --shadow: 0 10px 30px rgb(60 30 0 / .12);
  --fs-hero: clamp(2.2rem, 1.2rem + 5vw, 4.2rem);
  --fs-h2: clamp(1.6rem, 1.1rem + 2vw, 2.4rem);
  --space-section: clamp(3rem, 8vw, 6rem);
}
[data-theme="dark"] {
  color-scheme: dark;
  --c-bg: #1a120c; --c-surface: #26190f; --c-alt: #21160d;
  --c-text: #f6eadf; --c-muted: #c2ad99; --c-border: #3a2a1c;
  --c-primary: #f59e0b; --c-primary-dark: #d97706; --c-on-primary: #1a120c;
  --shadow: 0 10px 30px rgb(0 0 0 / .45);
}

/* ========== 2. RESET / BASE ========== */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, -apple-system, "Segoe UI", sans-serif; line-height: 1.6; background: var(--c-bg); color: var(--c-text); transition: background .3s, color .3s; }
img { max-width: 100%; display: block; }
a { color: inherit; }
h1, h2, h3, h4 { line-height: 1.15; margin: 0 0 .5em; }
:focus-visible { outline: 3px solid var(--c-primary); outline-offset: 3px; }

/* ========== 3. LAYOUT ========== */
.container { width: min(100% - 2rem, 1100px); margin-inline: auto; }
.section { padding-block: var(--space-section); }
.section--alt { background: var(--c-alt); }
.section__title { font-size: var(--fs-h2); text-align: center; margin-bottom: 2rem; }
.section__title--left { text-align: left; margin-bottom: .5rem; }

/* ========== 4. COMPONENTS ========== */
/* Button */
.btn { display: inline-block; padding: .8rem 1.4rem; border: 2px solid var(--c-primary); border-radius: 999px; font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; transition: transform .2s, background-color .2s, box-shadow .2s; }
.btn--primary { background: var(--c-primary); color: var(--c-on-primary); }
.btn--primary:hover { background: var(--c-primary-dark); transform: translateY(-2px); box-shadow: var(--shadow); }
.btn--ghost { background: transparent; color: var(--c-primary); }
.btn--ghost:hover { background: var(--c-primary); color: var(--c-on-primary); }
.btn--small { padding: .45rem 1rem; font-size: .9rem; }

/* Header / Nav */
.header { position: sticky; top: 0; z-index: 10; background: color-mix(in srgb, var(--c-bg) 85%, transparent); backdrop-filter: blur(10px); border-bottom: 1px solid var(--c-border); }
.nav { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; padding-block: .8rem; }
.nav__logo { font-weight: 800; font-size: 1.3rem; text-decoration: none; }
.nav__toggle { position: absolute; opacity: 0; pointer-events: none; }
.nav__burger { display: grid; gap: 5px; cursor: pointer; padding: 6px; }
.nav__burger span { width: 26px; height: 3px; background: var(--c-text); border-radius: 2px; transition: transform .3s, opacity .3s; }
.nav__links { list-style: none; margin: 0; padding: 0; width: 100%; display: none; flex-direction: column; gap: .75rem; padding-top: 1rem; }
.nav__toggle:checked ~ .nav__links { display: flex; }
.nav__toggle:checked + .nav__burger span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
.nav__toggle:checked + .nav__burger span:nth-child(2) { opacity: 0; }
.nav__toggle:checked + .nav__burger span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
.nav__toggle:focus-visible + .nav__burger { outline: 3px solid var(--c-primary); }
.nav__link { text-decoration: none; color: var(--c-muted); transition: color .2s; }
.nav__link:hover { color: var(--c-primary); }
.theme-btn { background: none; border: 1px solid var(--c-border); border-radius: 50%; width: 38px; height: 38px; cursor: pointer; font-size: 1.1rem; }

/* Hero */
.hero { display: grid; gap: 2rem; }
.eyebrow { color: var(--c-primary); font-weight: 700; text-transform: uppercase; letter-spacing: .1em; font-size: .8rem; margin: 0 0 .5rem; }
.hero__title { font-size: var(--fs-hero); }
.hero__title span { background: linear-gradient(90deg, var(--c-primary), #e11d48); -webkit-background-clip: text; background-clip: text; color: transparent; }
.hero__sub { color: var(--c-muted); font-size: 1.1rem; max-width: 50ch; }
.hero__actions { display: flex; flex-wrap: wrap; gap: .75rem; margin-top: 1.5rem; }
.hero__img { width: 100%; aspect-ratio: 5 / 4; object-fit: cover; border-radius: calc(var(--radius) * 2); box-shadow: var(--shadow); }

/* Feature cards */
.features__grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(220px, 100%), 1fr)); gap: 1.25rem; }
.card { padding: 1.5rem; background: var(--c-surface); border: 1px solid var(--c-border); border-radius: var(--radius); transition: transform .25s, box-shadow .25s; }
.card:hover { transform: translateY(-6px); box-shadow: var(--shadow); }
.card__icon { font-size: 2rem; width: 56px; height: 56px; display: grid; place-items: center; background: var(--c-alt); border-radius: 50%; margin-bottom: 1rem; }
.card__title { font-size: 1.15rem; }
.card__text { color: var(--c-muted); margin: 0; }

/* Menu / pricing */
.menu__grid { display: grid; gap: 1.5rem; }
.price { position: relative; display: flex; flex-direction: column; background: var(--c-surface); border: 2px solid var(--c-border); border-radius: var(--radius); overflow: hidden; }
.price__img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; transition: transform .5s; }
.price:hover .price__img { transform: scale(1.06); }
.price__body { display: flex; flex-direction: column; flex: 1; padding: 1.25rem; }
.price__desc { color: var(--c-muted); margin: 0 0 1rem; }
.price__amount { font-size: 1.6rem; font-weight: 800; margin: 0 0 1rem; color: var(--c-primary); }
.price__btn { margin-top: auto; }
.price--featured { border-color: var(--c-primary); box-shadow: var(--shadow); }
.price__badge { position: absolute; top: 12px; left: 12px; z-index: 1; background: var(--c-primary); color: var(--c-on-primary); font-size: .75rem; font-weight: 700; padding: .25rem .7rem; border-radius: 999px; }

/* Testimonials */
.quotes { display: grid; gap: 1.25rem; }
.quote { margin: 0; padding: 1.5rem; background: var(--c-surface); border-left: 5px solid var(--c-primary); border-radius: var(--radius); box-shadow: 0 2px 8px rgb(0 0 0 / .05); }
.quote p { font-size: 1.1rem; font-style: italic; margin: 0 0 .75rem; }
.quote__author { color: var(--c-muted); font-size: .9rem; }

/* Form */
.contact { display: grid; gap: 2rem; align-items: center; }
.form { display: grid; gap: 1rem; padding: 1.5rem; background: var(--c-surface); border-radius: var(--radius); box-shadow: var(--shadow); }
.form__field { display: grid; gap: .35rem; font-weight: 600; font-size: .9rem; }
.form__input { padding: .75rem 1rem; border: 2px solid var(--c-border); border-radius: 10px; font: inherit; background: var(--c-bg); color: var(--c-text); transition: border-color .2s, box-shadow .2s; }
.form__input:focus { outline: none; border-color: var(--c-primary); box-shadow: 0 0 0 4px color-mix(in srgb, var(--c-primary) 25%, transparent); }
.form__field:has(.form__input:not(:placeholder-shown):invalid) .form__input { border-color: #dc2626; }
.form__msg { margin: 0; color: var(--c-primary); font-weight: 600; min-height: 1.5em; }

/* Footer */
.footer { background: #1c120b; color: #e8d9c9; padding-top: 3rem; }
.footer__grid { display: grid; gap: 2rem; }
.footer__grid h4 { color: #fff; }
.footer__grid a:not(.nav__logo) { display: block; color: #c2ad99; text-decoration: none; margin-bottom: .4rem; }
.footer__grid a:hover { color: #f59e0b; }
.footer__text { color: #c2ad99; }
.footer__copy { text-align: center; margin: 2rem 0 0; padding: 1rem; border-top: 1px solid #3a2a1c; font-size: .85rem; }

/* ========== 5. ANIMATION ========== */
.animate { animation: fade-up .7s ease-out both; animation-delay: calc(var(--d, 0) * 120ms); }
@keyframes fade-up { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: none; } }
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; }
}

/* ========== 6. RESPONSIVE (mobile-first) ========== */
@media (min-width: 640px) {
  .menu__grid, .quotes { grid-template-columns: repeat(2, 1fr); }
  .footer__grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 900px) {
  .nav__burger { display: none; }
  .nav__links { display: flex; flex-direction: row; align-items: center; gap: 1.5rem; width: auto; padding-top: 0; }
  .hero { grid-template-columns: 1.1fr 1fr; align-items: center; }
  .menu__grid, .quotes { grid-template-columns: repeat(3, 1fr); }
  .contact { grid-template-columns: 1fr 1fr; }
  .footer__grid { grid-template-columns: 2fr 1fr 1fr 1fr; }
}`,
        js: `// Only JS in the project: the dark-mode toggle
const root = document.documentElement;
const btn = document.getElementById('theme');
btn.addEventListener('click', () => {
  const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = next;
  btn.textContent = next === 'dark' ? '☀️' : '🌙';
  console.log('Theme:', next);
});`,
      },
      result: 'A polished coffee-shop landing page. On narrow previews it shows a hamburger menu and single-column sections; on wide previews a horizontal nav, two-column hero, 3-column menu and 4-column footer. Cards lift on hover, sections fade in, and 🌙 switches to a warm dark theme.',
      explanation: 'Tokens drive every colour so dark mode is a single attribute switch. Flexbox handles the nav and buttons; Grid with auto-fit and media queries handles sections. clamp() keeps headings and section spacing fluid. The checkbox hack (:checked ~) opens the mobile menu without JavaScript. BEM keeps every selector flat and predictable.',
    },
    {
      title: 'Project part: CSS-only hamburger menu',
      scenario: 'Isolate the mobile navigation pattern used in the project to understand it in detail.',
      steps: [
        'Place a hidden checkbox before a label (burger) and the links list',
        'Hide the links by default on mobile',
        'Show them with .toggle:checked ~ .links',
        'Animate the three bars into an X',
        'At min-width 700px hide the burger and show links in a row',
        'Run at a narrow width and click ☰',
      ],
      code: `.toggle { position: absolute; opacity: 0; }
.links { display: none; }
.toggle:checked ~ .links { display: flex; }
@media (min-width: 700px) {
  .burger { display: none; }
  .links { display: flex; }
}`,
      playground: {
        html: `<nav class="nav">
  <strong>Logo</strong>
  <input type="checkbox" id="t" class="toggle" aria-label="Menu">
  <label for="t" class="burger"><span></span><span></span><span></span></label>
  <ul class="links"><li>Home</li><li>Shop</li><li>Blog</li><li>Contact</li></ul>
</nav>
<p style="padding:16px;font-family:system-ui">Make the preview narrow (&lt; 700px) and click the burger icon.</p>`,
        css: `body { margin: 0; }
.nav { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; padding: 12px 16px; background: #1e1b4b; color: #fff; font-family: system-ui, sans-serif; }
.toggle { position: absolute; opacity: 0; pointer-events: none; }
.burger { display: grid; gap: 5px; cursor: pointer; }
.burger span { width: 26px; height: 3px; background: #fff; transition: transform .3s, opacity .3s; }
.links { display: none; width: 100%; flex-direction: column; gap: 10px; list-style: none; margin: 12px 0 0; padding: 0; }
.toggle:checked ~ .links { display: flex; }
.toggle:checked + .burger span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
.toggle:checked + .burger span:nth-child(2) { opacity: 0; }
.toggle:checked + .burger span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
@media (min-width: 700px) {
  .burger { display: none; }
  .links { display: flex; flex-direction: row; width: auto; margin: 0; gap: 24px; }
}`,
      },
      result: 'On narrow screens a ☰ icon toggles a vertical menu and morphs into an ✕; on wide screens the links sit in a row and the icon is hidden.',
      explanation: 'The general sibling combinator (~) lets the checkbox state control the list; the adjacent sibling (+) controls the burger bars. A label linked by for= toggles the hidden checkbox.',
    },
    {
      title: 'Practical test solution: box model, centering and zebra table',
      scenario: 'Model answers for practical-test questions 1, 4 and 8 in one runnable file.',
      steps: [
        'Q1: use box-sizing: border-box on a 300px box with padding and border',
        'Q4: center a modal with an overlay using grid + place-items',
        'Q8: stripe table rows with :nth-child(even) and highlight on hover',
        'Run and inspect the box width in DevTools (should be 300px)',
      ],
      code: `.q1 { width: 300px; padding: 20px; border: 5px solid; box-sizing: border-box; }
.overlay { position: fixed; inset: 0; display: grid; place-items: center; }
tbody tr:nth-child(even) { background: #f1f5f9; }
tbody tr:hover { background: #fef3c7; }`,
      playground: {
        html: `<div class="q1">Q1: exactly 300px wide (border-box)</div>

<table>
  <thead><tr><th>Name</th><th>Module</th><th>Score</th></tr></thead>
  <tbody>
    <tr><td>Asha</td><td>Flexbox</td><td>92</td></tr>
    <tr><td>Ravi</td><td>Grid</td><td>85</td></tr>
    <tr><td>Meera</td><td>Responsive</td><td>88</td></tr>
    <tr><td>John</td><td>Animation</td><td>79</td></tr>
  </tbody>
</table>

<button class="open" onclick="document.querySelector('.overlay').hidden = false">Q4: open modal</button>
<div class="overlay" hidden onclick="if (event.target === this) this.hidden = true">
  <div class="modal"><h3>Centered modal</h3><p>Click outside to close.</p></div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; display: grid; gap: 20px; justify-items: start; }
.q1 { width: 300px; padding: 20px; border: 5px solid #4f46e5; box-sizing: border-box; background: #eef2ff; }

table { border-collapse: collapse; min-width: 300px; }
th, td { padding: 8px 14px; text-align: left; border-bottom: 1px solid #e2e8f0; }
thead { background: #1e293b; color: #fff; }
tbody tr:nth-child(even) { background: #f1f5f9; }
tbody tr:hover { background: #fef3c7; }

.open { padding: 10px 16px; border: 0; border-radius: 8px; background: #0ea5e9; color: #fff; font: inherit; cursor: pointer; }
.overlay { position: fixed; inset: 0; display: grid; place-items: center; background: rgb(0 0 0 / .5); }
.overlay[hidden] { display: none; }
.modal { width: min(90%, 320px); padding: 24px; background: #fff; border-radius: 14px; box-shadow: 0 20px 50px rgb(0 0 0 / .3); animation: pop .25s ease-out; }
@keyframes pop { from { transform: scale(.9); opacity: 0; } }`,
      },
      result: 'A purple box that measures exactly 300px, a zebra-striped table that highlights the hovered row, and a button that opens a perfectly centered modal over a dark overlay.',
      explanation: 'border-box includes padding and border inside the declared width. Grid place-items centers the modal on both axes. :nth-child(even) selects alternate rows; :hover overrides it because it comes later with equal specificity.',
    },
    {
      title: 'Practical test solution: lift button, spinner and theme',
      scenario: 'Model answers for practical-test questions 6 and 7.',
      steps: [
        'Define light tokens on :root and dark tokens on .dark',
        'Make a button that lifts on hover using transform and transition',
        'Make a spinner with @keyframes spin',
        'Add a JS toggle for the .dark class',
        'Run and click "Toggle theme"',
      ],
      code: `:root { --bg: #fff; --text: #111; }
:root.dark { --bg: #111827; --text: #f9fafb; }
.lift { transition: transform .2s, box-shadow .2s; }
.lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgb(0 0 0 / .2); }
.spinner { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }`,
      playground: {
        html: `<button class="lift" id="tt">Toggle theme</button>
<div class="spinner" aria-label="Loading" role="status"></div>
<p>Theme colours come from CSS variables.</p>`,
        css: `:root { --bg: #ffffff; --text: #111827; --accent: #7c3aed; }
:root.dark { --bg: #111827; --text: #f9fafb; --accent: #a78bfa; }
body { background: var(--bg); color: var(--text); font-family: system-ui, sans-serif; padding: 24px; display: grid; gap: 24px; justify-items: start; transition: background .3s, color .3s; }
.lift { padding: 12px 22px; border: 0; border-radius: 10px; background: var(--accent); color: #fff; font: inherit; cursor: pointer; transition: transform .2s, box-shadow .2s; }
.lift:hover { transform: translateY(-4px); box-shadow: 0 10px 20px rgb(0 0 0 / .2); }
.spinner { width: 48px; height: 48px; border: 5px solid color-mix(in srgb, var(--accent) 25%, transparent); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }`,
        js: `document.getElementById('tt').addEventListener('click', () => {
  document.documentElement.classList.toggle('dark');
  console.log('dark mode:', document.documentElement.classList.contains('dark'));
});`,
      },
      result: 'A purple button that rises on hover, a spinning loader, and the whole page switching between light and dark when the button is clicked.',
      explanation: 'The toggle only adds/removes a class on <html>; every colour reads from variables, so everything updates together. Transform-based hover and rotation keep animations smooth.',
    },
  ],
  interview: [
    { q: 'What is CSS and what does "cascading" mean?', a: 'CSS (Cascading Style Sheets) describes the presentation of HTML. "Cascading" refers to the algorithm that decides which rule wins when several apply: origin and importance, cascade layers, specificity, then source order.', level: 'Easy' },
    { q: 'What are the three ways to add CSS to a page and which is best?', a: 'Inline (style attribute), internal (<style> in head), external (<link rel="stylesheet">). External is preferred: reusable, cacheable and separates concerns.', level: 'Easy' },
    { q: 'Explain the CSS box model.', a: 'Every element is a box made of content, padding, border and margin (inside to outside). Width/height apply to the content box by default (content-box); with box-sizing: border-box they include padding and border.', level: 'Easy' },
    { q: 'How is specificity calculated?', a: 'As a tuple (IDs, classes/attributes/pseudo-classes, elements/pseudo-elements). Compare left to right; higher wins. Inline styles beat all selectors; !important beats normal declarations. :where() adds 0; :is()/:not()/:has() take their most specific argument.', level: 'Medium' },
    { q: 'Difference between em and rem?', a: 'em is relative to the font-size of the element itself (or its parent for font-size), so it compounds when nested. rem is relative to the root (html) font-size and stays consistent.', level: 'Easy' },
    { q: 'Difference between display: none, visibility: hidden and opacity: 0?', a: 'display: none removes the element from layout and accessibility tree. visibility: hidden keeps its space but hides it and it is not interactive. opacity: 0 keeps space and it remains interactive and accessible.', level: 'Medium' },
    { q: 'Explain the position values.', a: 'static (default, normal flow); relative (offset from its normal position, still occupies space, creates a containing block); absolute (removed from flow, positioned relative to the nearest positioned ancestor); fixed (relative to the viewport); sticky (relative until a scroll threshold, then sticks within its container).', level: 'Medium' },
    { q: 'What is a stacking context and why might z-index not work?', a: 'A stacking context is an isolated layer group; z-index only compares elements within the same context. z-index needs a positioned element (or flex/grid item), and a parent with transform, opacity < 1, filter or its own z-index creates a new context that caps its children.', level: 'Hard' },
    { q: 'What is margin collapsing?', a: 'Vertical margins of adjacent block elements (or a parent and its first/last child) combine into a single margin equal to the larger one. It doesn\'t happen in flex/grid containers, with padding/border between, or in a new BFC.', level: 'Medium' },
    { q: 'Flexbox vs Grid – when to use which?', a: 'Flexbox for one-dimensional, content-driven layouts (navbars, toolbars, aligning items in a row/column). Grid for two-dimensional layouts where rows and columns align (page skeletons, galleries, dashboards). They are often combined.', level: 'Easy' },
    { q: 'How do you center a div?', a: 'Parent: display: grid; place-items: center; or display: flex; justify-content: center; align-items: center. For block horizontal centering: margin-inline: auto with a width. For overlays: position absolute, top/left 50%, transform: translate(-50%, -50%).', level: 'Easy' },
    { q: 'What does flex: 1 mean?', a: 'flex-grow: 1, flex-shrink: 1, flex-basis: 0% – the item grows and shrinks, sharing space equally with other flex: 1 items.', level: 'Medium' },
    { q: 'Explain repeat(auto-fit, minmax(250px, 1fr)).', a: 'Creates as many columns as fit with each at least 250px and at most 1fr; auto-fit collapses empty tracks so items stretch – a responsive grid without media queries.', level: 'Medium' },
    { q: 'What is mobile-first design?', a: 'Writing base CSS for small screens and enhancing for larger screens with min-width media queries. It keeps mobile CSS lean and follows progressive enhancement.', level: 'Easy' },
    { q: 'What does the viewport meta tag do?', a: 'width=device-width, initial-scale=1 tells mobile browsers to use the device width as the layout viewport so responsive media queries work and text is not zoomed out.', level: 'Easy' },
    { q: 'What is clamp() and give a use case.', a: 'clamp(min, preferred, max) restricts a value to a range. Fluid typography: font-size: clamp(1.5rem, 1rem + 3vw, 3rem).', level: 'Medium' },
    { q: 'CSS variables vs Sass variables?', a: 'CSS custom properties are runtime, cascade, inherit, can be scoped and changed via media queries or JavaScript. Sass variables are compiled away and static.', level: 'Medium' },
    { q: 'How would you implement dark mode?', a: 'Define semantic colour tokens as CSS variables; override them under @media (prefers-color-scheme: dark) and/or a [data-theme="dark"] attribute toggled by JS (persisted in localStorage); set color-scheme for native controls.', level: 'Medium' },
    { q: 'Difference between transition and animation?', a: 'Transitions animate between two states when a property changes due to a trigger. @keyframes animations can run automatically, loop, alternate and have many intermediate steps.', level: 'Easy' },
    { q: 'Which properties should you animate for best performance and why?', a: 'transform and opacity – the browser can composite them on the GPU without recalculating layout or repainting, keeping 60fps.', level: 'Medium' },
    { q: 'Difference between pseudo-classes and pseudo-elements?', a: 'Pseudo-classes (single colon, e.g. :hover, :nth-child) select elements in a particular state or position. Pseudo-elements (double colon, e.g. ::before, ::first-letter) style a specific part of an element or insert generated content.', level: 'Easy' },
    { q: 'What is BEM and why use it?', a: 'Block__Element--Modifier naming. It keeps selectors as single classes (flat specificity), makes components self-documenting and avoids naming collisions in large codebases.', level: 'Medium' },
    { q: 'What is :has() and why is it significant?', a: 'A relational pseudo-class that selects an element based on its descendants or following siblings – effectively a parent selector, which CSS lacked for decades.', level: 'Medium' },
    { q: 'Media queries vs container queries?', a: 'Media queries respond to the viewport/device; container queries respond to the size of an ancestor container (container-type), making components adapt to where they are placed.', level: 'Hard' },
    { q: 'What is a Block Formatting Context (BFC)?', a: 'An independent layout region in which floats are contained and margins don\'t collapse with outside elements. Created by display: flow-root, overflow other than visible, floats, absolute positioning, inline-block, flex/grid items, etc.', level: 'Hard' },
    { q: 'How do you avoid layout shift (CLS) caused by CSS and images?', a: 'Set width/height attributes or aspect-ratio on images and embeds, reserve space for ads/dynamic content, use font-display with matching fallback fonts, and avoid inserting content above existing content.', level: 'Hard' },
    { q: 'How do you make CSS accessible?', a: 'Keep visible focus styles (:focus-visible), sufficient colour contrast, relative units so text scales, don\'t hide content only visually with display: none when it should be read, respect prefers-reduced-motion, and keep visual order consistent with DOM order.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Practical test Q2 – Flexbox navbar: logo left, links right, vertically centred, 24px gap between links.',
      hint: 'Two flex containers: nav (space-between) and the link list (gap).',
      solution: `<style>
  .nav { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; background: #111; color: #fff; }
  .nav ul { display: flex; gap: 24px; list-style: none; margin: 0; padding: 0; }
  .nav a { color: #fff; text-decoration: none; }
</style>
<nav class="nav"><strong>Logo</strong><ul><li><a href="#">Home</a></li><li><a href="#">About</a></li><li><a href="#">Contact</a></li></ul></nav>`,
    },
    {
      task: 'Practical test Q3 – Responsive gallery with no media queries; tiles at least 180px wide.',
      hint: 'repeat(auto-fit, minmax(min(180px, 100%), 1fr)).',
      solution: `<style>
  .gallery { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(180px, 100%), 1fr)); gap: 12px; }
  .gallery img { width: 100%; aspect-ratio: 1; object-fit: cover; border-radius: 8px; }
</style>
<div class="gallery">
  <img src="https://picsum.photos/seed/1/300" alt=""><img src="https://picsum.photos/seed/2/300" alt="">
  <img src="https://picsum.photos/seed/3/300" alt=""><img src="https://picsum.photos/seed/4/300" alt="">
  <img src="https://picsum.photos/seed/5/300" alt=""><img src="https://picsum.photos/seed/6/300" alt="">
</div>`,
    },
    {
      task: 'Practical test Q5 – Mobile-first two-column layout (content + sidebar) that stacks below 700px.',
      hint: 'Base: single column grid; @media (min-width: 700px) two columns.',
      solution: `<style>
  .layout { display: grid; gap: 16px; }
  @media (min-width: 700px) { .layout { grid-template-columns: 3fr 1fr; } }
  .layout > * { padding: 16px; background: #eee; }
</style>
<div class="layout"><main>Content</main><aside>Sidebar</aside></div>`,
    },
    {
      task: 'Build a responsive pricing section of 3 cards where the middle card is highlighted and all "Choose" buttons align at the bottom.',
      hint: 'Grid for the row, flex column inside each card, margin-top: auto on button, a --featured modifier.',
      solution: `<style>
  .plans { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); }
  .plan { display: flex; flex-direction: column; padding: 24px; border: 2px solid #e5e7eb; border-radius: 14px; }
  .plan--featured { border-color: #7c3aed; transform: scale(1.03); box-shadow: 0 10px 30px rgb(124 58 237 / .2); }
  .plan__btn { margin-top: auto; padding: 10px; border: 0; border-radius: 8px; background: #7c3aed; color: #fff; }
</style>
<section class="plans">
  <div class="plan"><h3>Free</h3><p>₹0</p><button class="plan__btn">Choose</button></div>
  <div class="plan plan--featured"><h3>Pro</h3><p>₹499 / month</p><p>Everything you need to grow, with analytics and priority support.</p><button class="plan__btn">Choose</button></div>
  <div class="plan"><h3>Team</h3><p>₹1,499</p><button class="plan__btn">Choose</button></div>
</section>`,
    },
    {
      task: 'Create a sticky header that gets a shadow, plus a hero with a fluid heading using clamp() and a gradient overlay background image.',
      hint: 'position: sticky; top: 0; and background: linear-gradient(...), url(...) center / cover.',
      solution: `<style>
  header { position: sticky; top: 0; z-index: 10; padding: 14px 20px; background: #fff; box-shadow: 0 2px 10px rgb(0 0 0 / .08); }
  .hero { min-height: 70vh; display: grid; place-items: center; text-align: center; color: #fff; padding: 20px;
    background: linear-gradient(rgb(0 0 0 / .55), rgb(0 0 0 / .25)), url(https://picsum.photos/seed/hero9/1400/800) center / cover; }
  .hero h1 { font-size: clamp(2rem, 1rem + 5vw, 4.5rem); margin: 0; }
</style>
<header>Brand</header>
<section class="hero"><h1>Adventure awaits</h1></section>
<p style="height:800px">Scroll to see the sticky header.</p>`,
    },
    {
      task: 'Write accessible, themeable form styles: labels above inputs, visible focus ring, red border for invalid input after typing, dark mode via prefers-color-scheme.',
      hint: 'Variables + :focus-visible + :not(:placeholder-shown):invalid + media query for dark.',
      solution: `<style>
  :root { --bg: #fff; --text: #111; --border: #d1d5db; --accent: #2563eb; color-scheme: light dark; }
  @media (prefers-color-scheme: dark) { :root { --bg: #111827; --text: #f9fafb; --border: #374151; --accent: #60a5fa; } }
  body { background: var(--bg); color: var(--text); font-family: system-ui; }
  .field { display: grid; gap: 4px; margin-bottom: 14px; max-width: 320px; }
  .field input { padding: 10px; border: 2px solid var(--border); border-radius: 8px; background: transparent; color: inherit; }
  .field input:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }
  .field input:not(:placeholder-shown):invalid { border-color: #dc2626; }
</style>
<form>
  <label class="field">Email <input type="email" placeholder="you@example.com" required></label>
  <label class="field">Phone <input type="tel" pattern="[0-9]{10}" placeholder="10 digits"></label>
</form>`,
    },
  ],
  quiz: [
    { question: 'Which combination is the modern, recommended way to build a responsive card grid without media queries?', options: ['float: left; width: 33%', 'display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr))', 'display: table-cell', 'display: inline-block; width: 30%'], answer: 1, explanation: 'auto-fit + minmax creates as many columns as fit and stretches them.' },
    { question: 'In the final project, why do all colours use var(--token)?', options: ['It makes CSS load faster', 'It is required by browsers', 'So a dark theme only needs to redefine the tokens', 'To increase specificity'], answer: 2, explanation: 'Semantic tokens let one attribute switch change the whole theme.' },
    { question: 'Which selector opens the CSS-only mobile menu?', options: ['.toggle:hover .links', '.links:checked', '.burger:active ~ .links', '.toggle:checked ~ .links'], answer: 3, explanation: 'The checked checkbox controls its later sibling via the ~ combinator.' },
    { question: 'Which pair of properties gives the smoothest hover animation?', options: ['transform and opacity', 'width and height', 'top and left', 'margin and padding'], answer: 0, explanation: 'They are GPU-composited and skip layout.' },
    { question: 'A mobile-first stylesheet mainly uses which media query form?', options: ['@media (max-width: ...)', '@media print', '@media (min-width: ...)', '@media (orientation: portrait)'], answer: 2, explanation: 'Base styles target mobile; min-width queries enhance larger screens.' },
  ],
};
