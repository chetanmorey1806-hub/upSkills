export default {
  id: 'day-26-html-accessibility',
  title: 'HTML Accessibility: ARIA Basics, alt Text, Labels, Semantic Structure',
  module: 'Module 6: Professional HTML Development',
  day: 26,
  level: 'Advanced',
  duration: '2 hours',
  summary: "Accessibility (a11y) means everyone, including people using screen readers, keyboards, magnifiers or voice control, can use your website. Most accessibility comes free from correct HTML: semantic structure, good alt text and proper labels. ARIA fills the gaps when HTML alone is not enough.",
  objectives: [
    'Explain what web accessibility is, who benefits and what WCAG is',
    'Write good alt text for informative, functional and decorative images',
    'Label every form control correctly',
    'Build a semantic, keyboard-friendly page structure',
    'Apply the basic rules of ARIA (roles, aria-label, aria-labelledby, aria-describedby, aria-expanded, aria-live)',
  ],
  theory: [
    {
      heading: 'What is web accessibility?',
      content: "Web accessibility means designing websites so that **people with disabilities** can perceive, understand, navigate and interact with them. Over 1 billion people live with some disability: visual (blind, low vision, colour blind), hearing, motor (cannot use a mouse) or cognitive.\n\nIt also helps everyone: captions in a noisy train, keyboard shortcuts for power users, readable text in bright sunlight. This is called the **curb-cut effect**: ramps built for wheelchairs help parents with prams too.\n\n**WCAG** (Web Content Accessibility Guidelines) is the international standard. Its four principles are **POUR**: Perceivable, Operable, Understandable, Robust. Most laws (e.g. ADA in the USA, RPwD Act in India, EU Accessibility Act) refer to WCAG level **AA**.",
    },
    {
      heading: 'alt text for images',
      content: "Screen readers read the `alt` attribute aloud instead of showing the image.\n\n- **Informative image**: describe the meaning. `alt=\"Bar chart: sales doubled from 2025 to 2026\"`\n- **Functional image** (inside a link/button): describe the action. `alt=\"Search\"`, not \"magnifying glass\".\n- **Decorative image**: use an **empty** alt `alt=\"\"` so the reader skips it.\n- **Complex image** (chart, map): short alt plus a longer description nearby.\n\nNever start with \"image of\" or \"picture of\": screen readers already say \"image\". Never omit alt completely: the reader may read the file name, like \"IMG_2034.jpg\".",
      tip: 'alt="" (empty) and no alt at all are very different. Empty means "decorative, skip it"; missing is an error.',
    },
    {
      heading: 'Labels for form controls',
      content: "Every input needs an accessible name. The best way is a visible `<label>`:\n\n1. Explicit: `<label for=\"email\">Email</label> <input id=\"email\">`\n2. Implicit: `<label>Email <input></label>`\n\nClicking a label also focuses the input, a bigger click target for everyone.\n\n**Placeholder is not a label**: it disappears when typing and often has low contrast. Group related radio buttons and checkboxes with `<fieldset>` and `<legend>`. Link help or error text using `aria-describedby`.",
      syntax: `<label for="pwd">Password</label>
<input id="pwd" type="password" aria-describedby="pwd-help" required>
<p id="pwd-help">At least 8 characters.</p>`,
    },
    {
      heading: 'Semantic structure and keyboard access',
      content: "- Use **landmarks**: `<header>`, `<nav>`, `<main>`, `<footer>`, `<aside>`.\n- Use a **logical heading order**: one h1, then h2, h3 (never skip levels just for size).\n- Use `<button>` for actions and `<a href>` for navigation. A `<div onclick>` is NOT focusable or announced as a button.\n- Everything clickable must work with the keyboard: **Tab** to move, **Enter/Space** to activate, visible **focus outline** (never `outline: none` without a replacement).\n- Add a **skip link** (\"Skip to main content\") as the first focusable element.\n- Set `<html lang=\"en\">` so the reader uses the right pronunciation.\n- Ensure colour contrast at least **4.5:1** for normal text, and never use colour alone to convey meaning.",
      tip: 'Quick test: unplug your mouse and try to use your page with only Tab, Shift+Tab, Enter and Space.',
    },
    {
      heading: 'ARIA basics',
      content: "**ARIA** (Accessible Rich Internet Applications) is a set of attributes that adds accessibility information when HTML has no native element for it.\n\n**First rule of ARIA: do not use ARIA if a native HTML element can do the job.** `<button>` beats `<div role=\"button\" tabindex=\"0\">`. \"No ARIA is better than bad ARIA.\"\n\nThree kinds:\n1. **Roles**: what it is. `role=\"alert\"`, `role=\"tablist\"`, `role=\"dialog\"`, `role=\"img\"`\n2. **Properties**: names and relations. `aria-label`, `aria-labelledby`, `aria-describedby`, `aria-required`\n3. **States**: current condition. `aria-expanded`, `aria-checked`, `aria-hidden`, `aria-current=\"page\"`, `aria-invalid`\n\n**Live regions** announce updates: `aria-live=\"polite\"` (wait until the user is idle) or `role=\"alert\"` (announce immediately).",
      syntax: `<button aria-label="Close dialog">×</button>
<button aria-expanded="false" aria-controls="menu">Menu</button>
<nav><a href="/" aria-current="page">Home</a></nav>
<div aria-live="polite" id="status"></div>`,
      tip: 'ARIA only changes what assistive technology announces. It does not add keyboard behaviour or styles: you must still write that yourself.',
    },
  ],
  examples: [
    {
      title: 'Accessible vs inaccessible button',
      scenario: 'Compare a <div> pretending to be a button with a real <button>.',
      steps: [
        'Create a <div class="btn" onclick> and a real <button>',
        'Click Run, then press Tab repeatedly',
        'Notice the div is never focused and Enter does nothing on it',
      ],
      code: `<!-- Bad -->
<div class="btn" onclick="save()">Save</div>
<!-- Good -->
<button type="button" onclick="save()">Save</button>`,
      playground: {
        html: `<p>Press Tab to move focus, Enter to activate.</p>
<div class="btn" id="bad">Save (div)</div>
<button type="button" class="btn" id="good">Save (button)</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.btn { display: inline-block; padding: 8px 14px; background: #2563eb; color: #fff; border: 0; border-radius: 6px; cursor: pointer; font: inherit; margin: 4px; }
.btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }`,
        js: `document.getElementById('bad').addEventListener('click', () => console.log('div clicked (mouse only!)'));
document.getElementById('good').addEventListener('click', () => console.log('button activated (mouse OR keyboard)'));
console.log('div tabIndex:', document.getElementById('bad').tabIndex, '| button tabIndex:', document.getElementById('good').tabIndex);`,
      },
      result: 'Both look identical. Tab only focuses the real button (orange outline); Enter/Space activate it. The div works only with a mouse. Console: div tabIndex: -1 | button tabIndex: 0.',
      explanation: 'Native <button> is focusable, announced as "button", and fires click on Enter/Space for free. A div needs role, tabindex and key handlers to imitate this, so just use <button>.',
    },
    {
      title: 'Accessible form with labels, fieldset and error message',
      scenario: 'Build a sign-up form usable with a screen reader, with an announced error.',
      steps: [
        'Give each input a <label for>',
        'Group the radio buttons with <fieldset> and <legend>',
        'Connect hint text with aria-describedby',
        'On invalid submit, set aria-invalid and show an error in a role="alert" region',
        'Click Run and submit an empty form',
      ],
      code: `<label for="email">Email</label>
<input id="email" type="email" aria-describedby="email-hint" required>
<p id="email-hint">We never share your email.</p>
<div role="alert" id="error"></div>`,
      playground: {
        html: `<form id="f" novalidate>
  <label for="email">Email (required)</label>
  <input id="email" name="email" type="email" autocomplete="email" aria-describedby="email-hint" required>
  <p id="email-hint" class="hint">We never share your email.</p>
  <fieldset>
    <legend>Preferred contact</legend>
    <label><input type="radio" name="c" value="email" checked> Email</label>
    <label><input type="radio" name="c" value="phone"> Phone</label>
  </fieldset>
  <div role="alert" id="error" class="error"></div>
  <button>Sign up</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
input[type=email] { display: block; padding: 6px; width: 240px; }
input[aria-invalid="true"] { border: 2px solid #dc2626; }
.hint { font-size: 13px; color: #475569; margin: 4px 0 10px; }
.error { color: #b91c1c; font-weight: 600; min-height: 1.2em; }
fieldset { margin-bottom: 10px; }`,
        js: `const f = document.getElementById('f'), email = document.getElementById('email'), err = document.getElementById('error');
f.addEventListener('submit', e => {
  e.preventDefault();
  if (!email.checkValidity()) {
    email.setAttribute('aria-invalid', 'true');
    err.textContent = 'Error: please enter a valid email address.';
    email.focus();
    console.log('Announced error to screen readers');
  } else {
    email.removeAttribute('aria-invalid');
    err.textContent = '';
    console.log('Submitted', email.value);
  }
});`,
      },
      result: 'Submitting empty shows a red error message, a red border on the email field, and moves focus to it. With a valid email the console logs the value.',
      explanation: 'label for/id gives the input its name. aria-describedby makes the reader also announce the hint. role="alert" announces the error immediately, and aria-invalid tells assistive tech the field is wrong. Colour is not the only signal: the text says "Error".',
    },
    {
      title: 'Disclosure menu with aria-expanded and a skip link',
      scenario: 'A mobile menu button must tell screen reader users if the menu is open.',
      steps: [
        'Add a skip link as the first element',
        'Add <button aria-expanded="false" aria-controls="menu">',
        'Toggle the hidden attribute on the menu and update aria-expanded in JS',
        'Mark the current page link with aria-current="page"',
        'Click Run, press Tab to reveal the skip link, then toggle the menu',
      ],
      code: `<a class="skip" href="#main">Skip to main content</a>
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>`,
      playground: {
        html: `<a class="skip" href="#main">Skip to main content</a>
<header>
  <nav aria-label="Main">
    <button id="toggle" aria-expanded="false" aria-controls="menu">&#9776; Menu</button>
    <ul id="menu" hidden>
      <li><a href="#" aria-current="page">Home</a></li>
      <li><a href="#">Courses</a></li>
      <li><a href="#">Contact</a></li>
    </ul>
  </nav>
</header>
<main id="main" tabindex="-1"><h1>Welcome</h1><p>Main content starts here.</p></main>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.skip { position: absolute; left: -9999px; }
.skip:focus { left: 8px; top: 8px; background: #111; color: #fff; padding: 8px; z-index: 10; }
[aria-current="page"] { font-weight: 700; text-decoration: underline; }
#toggle { padding: 6px 12px; }`,
        js: `const btn = document.getElementById('toggle'), menu = document.getElementById('menu');
btn.addEventListener('click', () => {
  const open = btn.getAttribute('aria-expanded') === 'true';
  btn.setAttribute('aria-expanded', String(!open));
  menu.hidden = open;
  console.log('Menu is now', open ? 'collapsed' : 'expanded', '(aria-expanded=' + !open + ')');
});`,
      },
      result: 'Pressing Tab first reveals a black "Skip to main content" link. The Menu button shows/hides the list and logs the aria-expanded state. Home is bold because it is the current page.',
      explanation: 'aria-expanded tells screen readers "Menu, button, collapsed/expanded". aria-current="page" announces "current page". The skip link lets keyboard users bypass repeated navigation.',
    },
    {
      title: 'Live region for dynamic updates',
      scenario: 'Announce "Item added to cart" to screen reader users without moving focus.',
      steps: [
        'Add <div aria-live="polite"> as a status region',
        'When a button is clicked, update the text content of the region',
        'Click Run and click Add to cart',
      ],
      code: `<div id="status" aria-live="polite"></div>
status.textContent = 'Wireless Mouse added to cart. 1 item in cart.';`,
      playground: {
        html: `<button id="add">Add Wireless Mouse to cart</button>
<p>Cart: <span id="count">0</span> items</p>
<div id="status" class="status" aria-live="polite"></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.status { margin-top: 8px; color: #166534; }`,
        js: `let n = 0;
document.getElementById('add').addEventListener('click', () => {
  n++;
  document.getElementById('count').textContent = n;
  const msg = 'Wireless Mouse added to cart. ' + n + ' item' + (n > 1 ? 's' : '') + ' in cart.';
  document.getElementById('status').textContent = msg;
  console.log('Screen reader will announce:', msg);
});`,
      },
      result: 'Each click updates the count and shows a green status message, which screen readers announce politely.',
      explanation: 'The live region must exist in the page before its text changes. aria-live="polite" waits until the user stops typing/listening; use role="alert" only for urgent messages.',
    },
  ],
  interview: [
    { q: 'What is web accessibility?', a: 'Designing and building websites so that people with disabilities (visual, auditory, motor, cognitive) can perceive, understand, navigate and interact with them.', level: 'Easy' },
    { q: 'What is WCAG and what does POUR stand for?', a: 'Web Content Accessibility Guidelines from W3C. POUR: Perceivable, Operable, Understandable, Robust. Levels A, AA (common legal target) and AAA.', level: 'Medium' },
    { q: 'How do you write alt text for a decorative image?', a: 'Use an empty alt attribute (alt="") so screen readers skip it. Do not omit the attribute.', level: 'Easy' },
    { q: 'Why is a placeholder not a substitute for a label?', a: 'It disappears on typing, often has poor contrast, is not reliably announced, and does not give a click target. Use <label>.', level: 'Easy' },
    { q: 'What is the first rule of ARIA?', a: 'If a native HTML element or attribute provides the semantics and behaviour you need, use it instead of adding ARIA.', level: 'Medium' },
    { q: 'Difference between aria-label, aria-labelledby and aria-describedby?', a: 'aria-label gives a name as a string; aria-labelledby names the element using another element text (by id); aria-describedby adds extra description (hints, errors) read after the name.', level: 'Medium' },
    { q: 'What does aria-hidden="true" do?', a: 'Removes the element and its children from the accessibility tree (screen readers ignore it). Never put it on focusable elements.', level: 'Medium' },
    { q: 'What is an ARIA live region?', a: 'An element with aria-live (polite/assertive) or role="alert"/"status" whose content changes are announced automatically by screen readers.', level: 'Hard' },
    { q: 'Why should you not use <div onclick> as a button?', a: 'It is not focusable, not announced as a button, and does not respond to Enter/Space. <button> provides all this natively.', level: 'Easy' },
    { q: 'What is a skip link?', a: 'A link at the very start of the page ("Skip to main content") that lets keyboard users jump past repeated navigation to the main content.', level: 'Medium' },
    { q: 'Why is outline: none on :focus a problem?', a: 'Keyboard users lose track of where focus is. If removing default outlines, provide a clearly visible custom focus style (e.g. :focus-visible).', level: 'Medium' },
    { q: 'How would you test accessibility?', a: 'Keyboard-only navigation, a screen reader (NVDA, VoiceOver, TalkBack), automated tools (Lighthouse, axe DevTools, WAVE), contrast checkers, and zoom to 200%.', level: 'Hard' },
  ],
  practice: [
    { task: 'Write alt text for: (a) company logo linking to home, (b) decorative divider, (c) photo of a red sports car on a product page.', hint: 'Functional, decorative, informative.', solution: `<a href="/"><img src="logo.svg" alt="TechNova home"></a>
<img src="divider.png" alt="">
<img src="car.jpg" alt="Red two-door sports car, side view, with black alloy wheels">` },
    { task: 'Make this accessible: <input placeholder="Search"><div onclick="go()">🔍</div>', hint: 'Label + real button with accessible name.', solution: `<form role="search" onsubmit="go(); return false;">
  <label for="q">Search</label>
  <input id="q" type="search" name="q">
  <button type="submit" aria-label="Search">🔍</button>
</form>` },
    { task: 'Create an icon-only close button and a dialog heading linked with aria-labelledby.', hint: 'role="dialog" aria-labelledby="id-of-h2".', solution: `<div role="dialog" aria-modal="true" aria-labelledby="dlg-title">
  <h2 id="dlg-title">Delete file?</h2>
  <p>This cannot be undone.</p>
  <button type="button" aria-label="Close">&times;</button>
</div>` },
    { task: 'Fix the heading structure: <h1>Shop</h1><h4>Offers</h4><h2>Products</h2><h5>Shoes</h5>', hint: 'Do not skip levels.', solution: `<h1>Shop</h1>
<h2>Offers</h2>
<h2>Products</h2>
<h3>Shoes</h3>` },
    { task: 'Add a skip link and a main landmark to a page with a long nav.', hint: 'href="#main", id="main".', solution: `<a class="skip-link" href="#main">Skip to main content</a>
<nav>...many links...</nav>
<main id="main"><h1>Page title</h1></main>` },
  ],
  quiz: [
    { question: 'Correct alt for a purely decorative image:', options: ['alt="image"', 'No alt attribute', 'alt=""', 'alt="decorative image"'], answer: 2, explanation: 'Empty alt tells assistive tech to skip the image.' },
    { question: 'Which is the best accessible button?', options: ['<div onclick="x()">Save</div>', '<span role="button">Save</span>', '<a onclick="x()">Save</a>', '<button type="button">Save</button>'], answer: 3, explanation: 'Native button is focusable and keyboard-operable by default.' },
    { question: 'Which attribute tells a screen reader a menu is open?', options: ['aria-expanded="true"', 'aria-open', 'role="open"', 'data-open'], answer: 0, explanation: 'aria-expanded reflects the open/closed state of a disclosure.' },
    { question: 'The first rule of ARIA is:', options: ['Always add role to every element', 'Prefer native HTML elements over ARIA', 'Use aria-hidden on images', 'ARIA replaces labels'], answer: 1, explanation: 'Native semantics are more robust than ARIA.' },
    { question: 'Minimum WCAG AA contrast for normal text:', options: ['2:1', '3:1', '4.5:1', '10:1'], answer: 2, explanation: '4.5:1 for normal text, 3:1 for large text.' },
  ],
};
