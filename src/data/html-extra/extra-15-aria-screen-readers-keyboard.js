export default {
  id: 'extra-15-aria-screen-readers-keyboard',
  title: 'ARIA Roles, Screen Readers and Keyboard Accessibility',
  module: 'Extra: SEO & Accessibility',
  extraNo: 15,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Go beyond the basics: learn how screen readers interpret a page through the accessibility tree, how ARIA roles, states and properties fill gaps that native HTML cannot, how live regions announce updates, and how to build custom widgets that work fully with the keyboard.',
  objectives: [
    'Explain the accessibility tree, accessible name, role and state',
    'Apply the five rules of ARIA and know when NOT to use ARIA',
    'Use landmark, widget and live-region roles with the correct aria-* states',
    'Build keyboard-operable widgets (tabs, toggle buttons, menus) with roving tabindex and focus management',
    'Test with a screen reader and keyboard-only navigation',
  ],
  theory: [
    {
      heading: 'How screen readers "see" a page',
      content: `A **screen reader** (NVDA and JAWS on Windows, VoiceOver on Mac/iPhone, TalkBack on Android) reads the page aloud or sends it to a braille display. It does not look at pixels or CSS colours. It reads the **accessibility tree**, a simplified version of the DOM that the browser builds.

Each node in that tree has:
- a **role** – what it is (button, link, heading level 2, checkbox, navigation)
- a **name** – what it is called ("Save", "Search")
- a **state/value** – checked, expanded, disabled, current, "3 of 5"
- a **description** (optional) – extra help text

Native HTML gives you all of this for free: \`<button>Save</button>\` is announced as "Save, button". A \`<div onclick>\` is announced as just "Save" – the user does not know it is clickable and cannot reach it with Tab.

Screen-reader users navigate by **headings** (H key), **landmarks** (D/R key), **links**, **form fields** and **Tab**. So good headings and landmarks are like a table of contents for them.`,
    },
    {
      heading: 'ARIA and its five rules',
      content: `**ARIA** (Accessible Rich Internet Applications) is a set of attributes that change what the accessibility tree says. It changes **only semantics**, never behaviour: \`role="button"\` does not make a div focusable or clickable by keyboard.

The five rules of ARIA:
1. If a native HTML element exists with the semantics and behaviour you need, **use it** instead of ARIA ("No ARIA is better than bad ARIA").
2. Do not change native semantics unless you really must (no \`<h2 role="tab">\`; wrap instead).
3. All interactive ARIA controls must be **usable with the keyboard**.
4. Do not use \`role="presentation"\` or \`aria-hidden="true"\` on a focusable element.
5. All interactive elements must have an **accessible name**.

ARIA has three kinds of attributes:
- **Roles**: \`role="tablist"\`, \`role="dialog"\`, \`role="alert"\`...
- **Properties** (rarely change): \`aria-label\`, \`aria-labelledby\`, \`aria-describedby\`, \`aria-controls\`, \`aria-haspopup\`, \`aria-required\`
- **States** (change with interaction): \`aria-expanded\`, \`aria-pressed\`, \`aria-selected\`, \`aria-checked\`, \`aria-current\`, \`aria-disabled\`, \`aria-invalid\`, \`aria-hidden\``,
      tip: 'Studies of real websites find that pages WITH ARIA often have more accessibility errors than pages without it, because ARIA is easy to misuse. Reach for native HTML first.',
    },
    {
      heading: 'Roles you should know',
      content: `**Landmark roles** (mostly given by semantic HTML):
- \`banner\` = \`<header>\` (top-level), \`navigation\` = \`<nav>\`, \`main\` = \`<main>\`, \`contentinfo\` = \`<footer>\` (top-level), \`complementary\` = \`<aside>\`, \`search\` = \`<search>\` or \`role="search"\`, \`region\` = \`<section>\` with a name, \`form\` = \`<form>\` with a name.
- If you have two \`<nav>\` elements, name them: \`aria-label="Primary"\` and \`aria-label="Footer"\`.

**Widget roles** (for custom components): \`button\`, \`tab\` / \`tablist\` / \`tabpanel\`, \`menu\` / \`menuitem\`, \`switch\`, \`slider\`, \`combobox\`, \`listbox\` / \`option\`, \`dialog\`, \`tooltip\`.

**Live region roles**: \`status\` (polite), \`alert\` (assertive), \`log\`, \`timer\`, \`progressbar\`.`,
      syntax: `<nav aria-label="Primary">...</nav>
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
<div role="status" aria-live="polite"></div>`,
    },
    {
      heading: 'Accessible names and descriptions',
      content: `The browser computes the accessible name in this priority order:
1. \`aria-labelledby\` (points to the id(s) of visible text)
2. \`aria-label\` (a string)
3. Native label: \`<label for>\`, \`alt\` for images, \`<caption>\` for tables, \`<legend>\` for fieldsets
4. The element's text content (for buttons, links, headings)
5. \`title\` (last resort)

\`aria-describedby\` adds a description read after the name, e.g. password rules or an error message.

Rules of thumb:
- Icon-only buttons need a name: \`<button aria-label="Close">×</button>\`.
- Prefer visible text (and aria-labelledby) over aria-label so sighted and non-sighted users get the same words.
- \`aria-hidden="true"\` hides decorative things (icons next to text) from screen readers.`,
    },
    {
      heading: 'Live regions: announcing changes',
      content: `When content updates without a page load (toast "Saved", cart count, search results count, form errors), screen-reader users do not notice unless you announce it. A **live region** is an element the screen reader watches; when its text changes, it reads the new text.

- \`aria-live="polite"\` / \`role="status"\` – waits until the user is idle. Use for most messages.
- \`aria-live="assertive"\` / \`role="alert"\` – interrupts immediately. Use only for urgent errors.
- \`aria-atomic="true"\` – read the whole region, not just the changed part.

Important: the live region must **exist in the DOM before** the text changes. Adding a new element that already contains text is often not announced. Put an empty \`<div role="status">\` in the page at load and update its text later.`,
      syntax: `<div id="msg" role="status" aria-live="polite"></div>
<script>
  document.getElementById('msg').textContent = 'Item added to cart';
</script>`,
    },
    {
      heading: 'Keyboard accessibility',
      content: `Many people use only a keyboard (motor disabilities, power users, screen-reader users). Every action must work without a mouse.

Standard keys:
- **Tab / Shift+Tab** – move between interactive elements
- **Enter** – activate links and buttons; **Space** – activate buttons, toggle checkboxes
- **Arrow keys** – move *inside* a composite widget (tabs, menus, radio groups, listbox)
- **Escape** – close dialogs, menus, popups
- **Home / End** – first / last item in a widget

Key techniques:
- **Visible focus**: never \`outline: none\` without a replacement; use \`:focus-visible\` styles.
- **Logical order**: DOM order = visual order; avoid positive tabindex.
- **Skip link**: "Skip to main content" as the first focusable element.
- **Roving tabindex**: in a widget, only the active item has \`tabindex="0"\`; others have \`-1\`; arrow keys move focus and swap the values. One Tab stop per widget.
- **Focus management**: move focus into dialogs on open and back to the trigger on close; move focus to a new page heading after client-side navigation.
- **No keyboard traps** (except inside modal dialogs, with Escape to leave).

Testing: unplug the mouse, Tab through the page; then try a screen reader (NVDA is free; VoiceOver: Cmd+F5) and use Chrome DevTools → Accessibility pane and Lighthouse/axe.`,
    },
  ],
  examples: [
    {
      title: 'Accessible tabs with roving tabindex and arrow keys',
      scenario: 'Build a tabs widget that follows the WAI-ARIA Authoring Practices pattern: tablist/tab/tabpanel roles, aria-selected, aria-controls and arrow/Home/End navigation.',
      steps: [
        'Create a div role="tablist" with an aria-label',
        'Add <button role="tab"> elements with aria-selected, aria-controls and tabindex 0/-1',
        'Add div role="tabpanel" elements with aria-labelledby and tabindex="0"',
        'In JS, handle click and ArrowLeft/ArrowRight/Home/End keys to move focus and select',
        'Click Run, click the first tab, then use the arrow keys and Tab',
      ],
      code: `<div role="tablist" aria-label="Course topics">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">HTML</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">CSS</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0">...</div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden>...</div>`,
      playground: {
        html: `<div role="tablist" aria-label="Course topics">
  <button role="tab" id="tab-1" aria-selected="true" aria-controls="panel-1" tabindex="0">HTML</button>
  <button role="tab" id="tab-2" aria-selected="false" aria-controls="panel-2" tabindex="-1">CSS</button>
  <button role="tab" id="tab-3" aria-selected="false" aria-controls="panel-3" tabindex="-1">JavaScript</button>
</div>
<div role="tabpanel" id="panel-1" aria-labelledby="tab-1" tabindex="0"><p>HTML structures content.</p></div>
<div role="tabpanel" id="panel-2" aria-labelledby="tab-2" tabindex="0" hidden><p>CSS styles content.</p></div>
<div role="tabpanel" id="panel-3" aria-labelledby="tab-3" tabindex="0" hidden><p>JavaScript adds behaviour.</p></div>
<p><a href="#">A link after the widget (Tab reaches it in one step)</a></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
[role="tablist"] { display: flex; gap: 4px; border-bottom: 2px solid #ccc; }
[role="tab"] { border: none; background: #eee; padding: 8px 14px; border-radius: 6px 6px 0 0; cursor: pointer; font: inherit; }
[role="tab"][aria-selected="true"] { background: #0d9488; color: white; }
[role="tab"]:focus-visible, [role="tabpanel"]:focus-visible, a:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }
[role="tabpanel"] { padding: 12px; border: 1px solid #ccc; border-top: none; }`,
        js: `const tabs = [...document.querySelectorAll('[role="tab"]')];
function select(tab) {
  tabs.forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', String(selected));
    t.tabIndex = selected ? 0 : -1;
    document.getElementById(t.getAttribute('aria-controls')).hidden = !selected;
  });
  tab.focus();
  console.log('Selected tab:', tab.textContent, '| aria-selected=true, tabindex=0');
}
tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', (e) => {
    let next = null;
    if (e.key === 'ArrowRight') next = tabs[(i + 1) % tabs.length];
    if (e.key === 'ArrowLeft') next = tabs[(i - 1 + tabs.length) % tabs.length];
    if (e.key === 'Home') next = tabs[0];
    if (e.key === 'End') next = tabs[tabs.length - 1];
    if (next) { e.preventDefault(); select(next); }
  });
});`,
      },
      result: 'Arrow keys move between tabs (wrapping around), Home/End jump to first/last, the selected tab is teal and its panel shows. Pressing Tab from a tab goes to the panel, then to the link: the whole tab list is a single Tab stop.',
      explanation: 'Roles tell screen readers "tab 2 of 3, selected". aria-controls/aria-labelledby connect tabs and panels. Roving tabindex (0 on the active tab, -1 on the rest) keeps Tab order short while arrows navigate inside the widget, exactly as users expect from native tab controls.',
    },
    {
      title: 'Live region announcements and accessible names',
      scenario: 'An "Add to cart" page where icon-only buttons have accessible names, decorative icons are hidden, and every change is announced through a polite status region. A small inspector shows the computed role and name.',
      steps: [
        'Add an empty <div role="status" aria-live="polite"> at page load',
        'Create icon buttons with aria-label and an aria-hidden icon span',
        'Create a toggle button using aria-pressed',
        'On click, update the cart count and the status text',
        'Add a tiny inspector that prints role + name of each button on focus',
        'Click Run and use the buttons with Tab/Enter/Space',
      ],
      code: `<button class="icon" aria-label="Add to cart"><span aria-hidden="true">🛒</span></button>
<button aria-pressed="false">Add to wishlist</button>
<div role="status" aria-live="polite" class="visually-hidden"></div>`,
      playground: {
        html: `<h2>Wireless Mouse M2</h2>
<button id="add" class="icon" aria-label="Add to cart"><span aria-hidden="true">🛒</span></button>
<button id="remove" class="icon" aria-label="Remove from cart"><span aria-hidden="true">➖</span></button>
<button id="wish" aria-pressed="false"><span aria-hidden="true">♡</span> Wishlist</button>
<p>Cart: <span id="count">0</span> item(s)</p>
<div id="status" role="status" aria-live="polite" class="visually-hidden"></div>
<p class="inspect">Inspector (what a screen reader gets): <output id="inspect">focus a button</output></p>
<p class="inspect">Last announcement: <output id="said">–</output></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { font-size: 18px; padding: 6px 12px; margin-right: 6px; border-radius: 6px; border: 1px solid #888; background: #fff; }
button[aria-pressed="true"] { background: #fde2e4; border-color: crimson; }
button:focus-visible { outline: 3px solid #2563eb; outline-offset: 2px; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.inspect { font-size: 14px; color: #444; }
output { font-family: monospace; background: #f3f4f6; padding: 2px 6px; border-radius: 4px; }`,
        js: `let count = 0;
const status = document.getElementById('status');
function announce(msg) {
  status.textContent = msg;
  document.getElementById('said').textContent = msg;
  console.log('Screen reader would say:', msg);
}
function accessibleName(el) {
  return el.getAttribute('aria-label') ||
    [...el.childNodes].filter((n) => !(n.nodeType === 1 && n.getAttribute('aria-hidden') === 'true'))
      .map((n) => n.textContent).join('').trim();
}
document.getElementById('add').onclick = () => {
  count++;
  document.getElementById('count').textContent = count;
  announce('Added. Cart has ' + count + ' item' + (count === 1 ? '' : 's') + '.');
};
document.getElementById('remove').onclick = () => {
  if (count === 0) return announce('Cart is already empty.');
  count--;
  document.getElementById('count').textContent = count;
  announce('Removed. Cart has ' + count + ' item' + (count === 1 ? '' : 's') + '.');
};
const wish = document.getElementById('wish');
wish.onclick = () => {
  const on = wish.getAttribute('aria-pressed') !== 'true';
  wish.setAttribute('aria-pressed', String(on));
  wish.querySelector('span').textContent = on ? '♥' : '♡';
  announce(on ? 'Added to wishlist.' : 'Removed from wishlist.');
};
document.querySelectorAll('button').forEach((b) => b.addEventListener('focus', () => {
  const pressed = b.hasAttribute('aria-pressed') ? ', toggle button, ' + (b.getAttribute('aria-pressed') === 'true' ? 'pressed' : 'not pressed') : ', button';
  document.getElementById('inspect').textContent = '"' + accessibleName(b) + '"' + pressed;
}));`,
      },
      result: 'Focusing the cart icon shows "Add to cart", button (not "🛒"). The wishlist reads as a toggle button pressed/not pressed. Each action updates the hidden status region, so a screen reader politely announces e.g. "Added. Cart has 2 items."',
      explanation: 'aria-label gives icon-only buttons a name; aria-hidden hides the emoji so it is not read as "shopping cart emoji". aria-pressed turns a normal button into a toggle with state. The status region exists from page load and is visually hidden (not display:none, which would also hide it from screen readers).',
    },
    {
      title: 'Skip link and an accessible disclosure menu',
      scenario: 'A header with a "Skip to main content" link and a menu button using aria-expanded/aria-controls that closes with Escape and returns focus to the button.',
      steps: [
        'Add <a class="skip-link" href="#main"> as the first element; show it on focus',
        'Add a <button aria-expanded="false" aria-controls="menu"> and a hidden <ul id="menu">',
        'Toggle aria-expanded and hidden on click; focus the first link when opening',
        'Close on Escape and move focus back to the button',
        'Give <main id="main" tabindex="-1"> so the skip link can focus it',
        'Click Run, click inside the preview, press Tab once to see the skip link',
      ],
      code: `<a class="skip-link" href="#main">Skip to main content</a>
<button aria-expanded="false" aria-controls="menu">Menu</button>
<ul id="menu" hidden>...</ul>
<main id="main" tabindex="-1">...</main>`,
      playground: {
        html: `<a class="skip-link" href="#main">Skip to main content</a>
<header>
  <strong>CodeDaily</strong>
  <nav aria-label="Primary">
    <button id="menuBtn" aria-expanded="false" aria-controls="menu">Menu</button>
    <ul id="menu" hidden>
      <li><a href="#html">HTML</a></li>
      <li><a href="#css">CSS</a></li>
      <li><a href="#js">JavaScript</a></li>
    </ul>
  </nav>
</header>
<main id="main" tabindex="-1">
  <h1>Welcome</h1>
  <p>Main content starts here. <a href="#top">A link in main</a></p>
</main>`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; }
.skip-link { position: absolute; left: 8px; top: -60px; background: #111; color: #fff; padding: 8px 12px; border-radius: 4px; z-index: 10; }
.skip-link:focus { top: 8px; }
header { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 16px; background: #f1f5f9; }
nav { position: relative; }
#menu { position: absolute; right: 0; margin: 4px 0 0; padding: 6px; list-style: none; background: #fff; border: 1px solid #ccc; border-radius: 6px; min-width: 140px; }
#menu a { display: block; padding: 6px 8px; }
main { padding: 16px; }
main:focus { outline: none; }
:focus-visible { outline: 3px solid #f59e0b; outline-offset: 2px; }`,
        js: `const btn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
function setOpen(open) {
  btn.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  if (open) menu.querySelector('a').focus();
  console.log('Menu', open ? 'opened' : 'closed', '| aria-expanded =', btn.getAttribute('aria-expanded'));
}
btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') {
    setOpen(false);
    btn.focus();
  }
});
document.querySelector('.skip-link').addEventListener('click', (e) => {
  e.preventDefault();
  document.getElementById('main').focus();
  console.log('Focus moved to <main>; next Tab goes to the link inside main');
});`,
      },
      result: 'The first Tab reveals a black "Skip to main content" link; activating it moves focus to <main>, so the next Tab skips the header. The Menu button opens the list and focuses its first link; Escape closes it and returns focus to the button.',
      explanation: 'The skip link is off-screen until focused (not display:none, which would remove it from Tab order). tabindex="-1" on <main> lets it receive programmatic focus. aria-expanded tells screen readers whether the menu is open and aria-controls links button and list. Returning focus after Escape prevents the user from getting "lost".',
    },
  ],
  interview: [
    { q: 'What is the accessibility tree?', a: 'A tree the browser derives from the DOM that exposes each meaningful element\'s role, name, state and description to assistive technologies like screen readers, via platform accessibility APIs.', level: 'Medium' },
    { q: 'What is the first rule of ARIA?', a: 'If a native HTML element or attribute provides the semantics and behaviour you need, use it instead of repurposing an element and adding ARIA. No ARIA is better than bad ARIA.', level: 'Easy' },
    { q: 'Does role="button" make a div work like a button?', a: 'No. ARIA only changes semantics. You must also add tabindex="0", handle Enter and Space keydown, and manage disabled state. Using <button> gives all of this for free.', level: 'Medium' },
    { q: 'What is the difference between aria-label, aria-labelledby and aria-describedby?', a: 'aria-label sets the accessible name as a string; aria-labelledby sets the name from other elements\' text by id (takes priority); aria-describedby adds supplementary description read after the name.', level: 'Medium' },
    { q: 'What is a live region and the difference between polite and assertive?', a: 'An element whose content changes are announced by screen readers. polite (role="status") waits until the user is idle; assertive (role="alert") interrupts immediately and should be reserved for urgent messages.', level: 'Medium' },
    { q: 'What is roving tabindex?', a: 'A focus-management technique for composite widgets: only the current item has tabindex="0", others have -1; arrow keys move focus and update the tabindex values, so the whole widget is one Tab stop.', level: 'Hard' },
    { q: 'What does aria-hidden="true" do and when is it dangerous?', a: 'It removes an element and its children from the accessibility tree. It is dangerous on focusable elements or their ancestors: keyboard users can focus something that screen readers cannot perceive.', level: 'Medium' },
    { q: 'How do you hide content visually but keep it available to screen readers?', a: 'Use a "visually-hidden" (sr-only) CSS class: position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0 0 0 0); white-space:nowrap; margin:-1px; border:0. Do not use display:none or visibility:hidden, which hide it from everyone.', level: 'Medium' },
    { q: 'Why should you never remove the focus outline without a replacement?', a: 'Keyboard users rely on the focus indicator to know where they are. Use :focus-visible to show a clear custom outline for keyboard focus while avoiding it on mouse clicks.', level: 'Easy' },
    { q: 'What is a skip link?', a: 'A link, usually the first focusable element, that jumps to the main content so keyboard and screen-reader users can bypass repeated navigation. It is often visually hidden until focused.', level: 'Easy' },
    { q: 'Which ARIA states would you use for a menu button and a toggle button?', a: 'Menu/disclosure button: aria-expanded (true/false) plus aria-controls. Toggle button: aria-pressed (true/false). Tabs use aria-selected; checkboxes aria-checked; current page link aria-current="page".', level: 'Medium' },
    { q: 'How do you test keyboard and screen-reader accessibility?', a: 'Navigate with only Tab/Shift+Tab/Enter/Space/Arrows/Escape; check visible focus, logical order and no traps. Use NVDA/VoiceOver to listen to names, roles and states; use DevTools Accessibility pane, Lighthouse and axe for automated checks (which find only ~30–40% of issues).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Convert this inaccessible "button" into an accessible one: <div class="btn" onclick="save()">Save</div>.',
      hint: 'The best fix uses native HTML.',
      solution: `<!-- Best: native button -->
<button type="button" class="btn" onclick="save()">Save</button>

<!-- If you truly cannot change the element: -->
<div class="btn" role="button" tabindex="0" onclick="save()"
     onkeydown="if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); save(); }">Save</div>`,
    },
    {
      task: 'Create a password field with a description of the rules and an error message that is announced and linked via aria-describedby and aria-invalid.',
      hint: 'aria-describedby can list two ids separated by a space. Use role="alert" for the error.',
      solution: `<label for="pw">Password</label>
<input id="pw" type="password" aria-describedby="pw-rules pw-error" aria-invalid="false">
<p id="pw-rules">At least 8 characters, including a number.</p>
<p id="pw-error" role="alert"></p>
<script>
  const pw = document.getElementById('pw');
  pw.addEventListener('blur', () => {
    const ok = pw.value.length >= 8 && /\\d/.test(pw.value);
    pw.setAttribute('aria-invalid', String(!ok));
    document.getElementById('pw-error').textContent = ok ? '' : 'Password does not meet the rules.';
  });
</script>`,
    },
    {
      task: 'Build an accessible switch (on/off) for "Dark mode" using a button with role="switch" and aria-checked.',
      hint: 'Toggle aria-checked on click; Enter and Space work automatically on <button>.',
      solution: `<button id="dm" role="switch" aria-checked="false">Dark mode</button>
<script>
  const dm = document.getElementById('dm');
  dm.addEventListener('click', () => {
    const on = dm.getAttribute('aria-checked') !== 'true';
    dm.setAttribute('aria-checked', String(on));
    document.body.style.background = on ? '#111' : '#fff';
    document.body.style.color = on ? '#eee' : '#111';
  });
</script>`,
    },
    {
      task: 'Write a page skeleton with properly named landmarks: header, two navs (primary and footer), main, aside and footer, plus a skip link.',
      hint: 'Name duplicate landmarks with aria-label.',
      solution: `<a class="skip-link" href="#main">Skip to main content</a>
<header>
  <a href="/">CodeDaily</a>
  <nav aria-label="Primary"><a href="/html">HTML</a> <a href="/css">CSS</a></nav>
</header>
<main id="main" tabindex="-1">
  <h1>Lessons</h1>
</main>
<aside aria-label="Related lessons"><h2>Related</h2></aside>
<footer>
  <nav aria-label="Footer"><a href="/privacy">Privacy</a> <a href="/contact">Contact</a></nav>
</footer>`,
    },
    {
      task: 'Make a "Search results" count that is announced every time the user types in a filter box.',
      hint: 'Put an empty role="status" element in the page at load, update its text on input.',
      solution: `<label for="q">Filter fruits</label>
<input id="q">
<p id="count" role="status"></p>
<ul id="list"><li>Apple</li><li>Banana</li><li>Mango</li><li>Grapes</li></ul>
<script>
  const items = [...document.querySelectorAll('#list li')];
  document.getElementById('q').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    let n = 0;
    items.forEach((li) => { const show = li.textContent.toLowerCase().includes(q); li.hidden = !show; if (show) n++; });
    document.getElementById('count').textContent = n + ' result' + (n === 1 ? '' : 's');
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'What does adding role="button" to a <div> do?', options: ['Makes it focusable and keyboard-operable', 'Only changes how assistive technology announces it', 'Turns it into a <button> element', 'Nothing at all'], answer: 1, explanation: 'ARIA changes semantics only; you must add tabindex and key handling yourself.' },
    { question: 'Which attribute value announces a message immediately, interrupting the user?', options: ['aria-live="polite"', 'aria-live="off"', 'role="status"', 'aria-live="assertive"'], answer: 3, explanation: 'assertive (or role="alert") interrupts; use sparingly.' },
    { question: 'In a roving tabindex tab list, what tabindex does the selected tab have?', options: ['0', '-1', '1', 'none'], answer: 0, explanation: 'Only the active item has tabindex="0"; the others have -1.' },
    { question: 'Which has the highest priority when computing an accessible name?', options: ['title', 'Text content', 'aria-labelledby', 'placeholder'], answer: 2, explanation: 'aria-labelledby overrides aria-label, native labels and content.' },
    { question: 'Which is the correct way to hide a decorative icon inside a labelled button from screen readers?', options: ['role="presentation" on the button', 'aria-hidden="true" on the icon span', 'display:none on the button', 'tabindex="-1" on the icon'], answer: 1, explanation: 'aria-hidden on the non-focusable decorative icon removes it from the accessibility tree while the button keeps its name.' },
  ],
};
