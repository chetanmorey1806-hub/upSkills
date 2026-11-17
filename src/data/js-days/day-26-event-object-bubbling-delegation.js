export default {
  id: 'day-26-event-object-bubbling-delegation',
  title: 'Event Object, Bubbling, Capturing, Event Delegation, preventDefault',
  module: 'Module 4: DOM & Events',
  day: 26,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Every handler receives an event object full of useful details. Events travel through the DOM in three phases (capturing, target, bubbling), which makes event delegation possible: one listener on a parent that handles clicks for all children, even ones added later. You also learn preventDefault vs stopPropagation.',
  objectives: [
    'Use the event object: type, target, currentTarget, key, clientX/clientY, timeStamp',
    'Explain the three phases of event propagation: capturing, target and bubbling',
    'Use the capture option and stopPropagation correctly (and know when not to)',
    'Implement event delegation with e.target.closest() for dynamic lists',
    'Cancel default browser actions with preventDefault (links, forms, context menu)',
  ],
  theory: [
    {
      heading: 'The Event Object',
      content: "When an event fires, the browser creates an **event object** and passes it to your handler as the first argument. It describes what happened.\n\nMost-used properties:\n- `e.type` - the event name (`'click'`)\n- `e.target` - the element where the event **started** (the deepest element actually clicked)\n- `e.currentTarget` - the element whose listener is **running right now** (the one you attached the listener to)\n- `e.key`, `e.code`, `e.ctrlKey`, `e.shiftKey`, `e.altKey`, `e.metaKey` - keyboard info\n- `e.clientX`, `e.clientY` - mouse position in the viewport; `e.pageX`, `e.pageY` include scroll\n- `e.button` - which mouse button (0 left, 2 right)\n- `e.timeStamp`, `e.isTrusted` (true if caused by a real user)",
      syntax: `card.addEventListener('click', (e) => {
  console.log(e.type);           // 'click'
  console.log(e.target);         // maybe the <img> inside the card
  console.log(e.currentTarget);  // always card
  console.log(e.clientX, e.clientY);
});`,
      tip: '`e.target` vs `e.currentTarget` is a top interview question: target = where it happened, currentTarget = where the listener lives.',
    },
    {
      heading: 'Event Propagation: Capturing, Target, Bubbling',
      content: "When you click a button inside a div inside the body, the event does not only happen on the button. It travels through the tree in **three phases**:\n\n1. **Capturing phase**: from `window` DOWN through ancestors (`html` -> `body` -> `div`) to the target\n2. **Target phase**: at the clicked element itself\n3. **Bubbling phase**: from the target back UP through every ancestor to `window`\n\nBy default, `addEventListener` listens in the **bubbling** phase. Pass `{ capture: true }` (or `true` as the third argument) to listen in the capturing phase.\n\nAnalogy: dropping a stone in water. The ripple (bubble) spreads upwards to every parent container. Most events bubble; a few like `focus`, `blur`, `mouseenter`, `mouseleave` do not (use `focusin`/`focusout` if you need bubbling).",
      syntax: `// HTML: <div id="outer"><button id="inner">Click</button></div>
outer.addEventListener('click', () => console.log('outer bubble'));
outer.addEventListener('click', () => console.log('outer capture'), { capture: true });
inner.addEventListener('click', () => console.log('button'));
// Clicking the button logs:
// outer capture -> button -> outer bubble`,
    },
    {
      heading: 'stopPropagation',
      content: "`e.stopPropagation()` stops the event from travelling further (no more ancestors get it). `e.stopImmediatePropagation()` also stops other listeners on the same element.\n\nUse it sparingly: it breaks delegation, analytics and \"click outside to close\" logic that rely on bubbling. A common legitimate use is a button inside a clickable card, where clicking the button should not also trigger the card's click.\n\nOften a better alternative is checking `e.target` in the parent handler.",
      syntax: `card.addEventListener('click', () => openDetails());
deleteBtn.addEventListener('click', (e) => {
  e.stopPropagation(); // do not also open details
  deleteCard();
});`,
    },
    {
      heading: 'Event Delegation',
      content: "Instead of adding a listener to every child (100 list items = 100 listeners), add **one listener to the parent** and use `e.target` to find out which child was clicked. This works because events **bubble** up to the parent.\n\nBenefits:\n- Works automatically for children **added later** (dynamic lists, to-do apps)\n- Less memory, less setup code\n- One place to manage behaviour\n\nUse `e.target.closest('selector')` because the user might click an inner element (an icon inside the button). Also check the found element is inside your container.",
      syntax: `list.addEventListener('click', (e) => {
  const btn = e.target.closest('.delete');
  if (!btn || !list.contains(btn)) return; // click was not on a delete button
  btn.closest('li').remove();
});`,
      tip: 'Use data attributes to tell actions apart: `<button data-action=\"edit\">` and `switch (btn.dataset.action)` in one delegated handler.',
    },
    {
      heading: 'preventDefault: Cancelling Default Actions',
      content: "Many events have a **default browser action**: a link navigates, a form submits and reloads, a checkbox toggles, right-click opens the context menu, Space scrolls the page.\n\n`e.preventDefault()` cancels that default action but the event **still propagates**. `stopPropagation()` is the opposite: it stops propagation but the default action still happens. They are independent.\n\n`e.defaultPrevented` tells you whether some handler already cancelled it. Passive listeners cannot call preventDefault.",
      syntax: `link.addEventListener('click', (e) => {
  e.preventDefault();          // do not navigate
  showModal(link.href);
});
form.addEventListener('submit', (e) => e.preventDefault());
area.addEventListener('contextmenu', (e) => e.preventDefault()); // custom right-click menu`,
    },
  ],
  examples: [
    {
      title: 'target vs currentTarget',
      scenario: 'A profile card contains an image, a heading and a button. One listener on the card shows which element was actually clicked (target) and which element owns the listener (currentTarget).',
      steps: [
        'Create a .card div with an img, h3 and button inside',
        'Add ONE click listener to the card',
        'Print e.target.tagName and e.currentTarget.id',
        'Click on the image, the heading, the button and empty card space',
      ],
      code: `card.addEventListener('click', (e) => {
  out.textContent =
    'target: ' + e.target.tagName +
    ' | currentTarget: ' + e.currentTarget.id;
});`,
      playground: {
        html: `<div class="card" id="profile">
  <img src="https://picsum.photos/id/64/80/80" alt="Avatar" width="80" height="80">
  <h3>Priya Sharma</h3>
  <button>Follow</button>
</div>
<p id="out">Click anywhere on the card</p>
<p id="pos"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { border: 2px solid #ccc; border-radius: 12px; padding: 16px; max-width: 260px; text-align: center; cursor: pointer; }
.card img { border-radius: 50%; }
.flash { outline: 3px solid orange; }
#out { font-weight: bold; }`,
        js: `const card = document.getElementById('profile');
const out = document.getElementById('out');
const pos = document.getElementById('pos');

card.addEventListener('click', (e) => {
  out.textContent = 'target: ' + e.target.tagName + ' | currentTarget: ' + e.currentTarget.id;
  pos.textContent = 'type: ' + e.type + ' | clientX: ' + e.clientX + ', clientY: ' + e.clientY;

  document.querySelectorAll('.flash').forEach(el => el.classList.remove('flash'));
  e.target.classList.add('flash');
  console.log(e.target === e.currentTarget ? 'Clicked the card itself' : 'Clicked a child: ' + e.target.tagName);
});`,
      },
      result: 'Clicking the photo shows "target: IMG | currentTarget: profile" and outlines the image; clicking the name shows "target: H3"; clicking the button shows "target: BUTTON"; clicking empty space shows "target: DIV". currentTarget is always "profile". The second line shows the event type and mouse coordinates.',
      explanation: 'The click starts on the deepest element under the mouse (target) and bubbles up to the card, where our single listener runs (currentTarget). This bubbling is what makes delegation possible.',
    },
    {
      title: 'Visualising Capturing and Bubbling',
      scenario: 'Three nested boxes (grandparent > parent > child) each have a capturing AND a bubbling listener. Clicking the child prints the exact order. A checkbox lets you stop propagation at the parent.',
      steps: [
        'Create three nested divs',
        'For each box add a listener with { capture: true } and a normal one',
        'Log "capture: <name>" or "bubble: <name>" into a list',
        'If the checkbox is checked, call e.stopPropagation() in the parent\'s bubble listener',
        'Click the innermost box with and without the checkbox',
      ],
      code: `[grand, parent, child].forEach(box => {
  box.addEventListener('click', () => log('capture: ' + box.id), { capture: true });
  box.addEventListener('click', (e) => {
    log('bubble: ' + box.id);
    if (box === parent && stop.checked) e.stopPropagation();
  });
});`,
      playground: {
        html: `<label><input type="checkbox" id="stop"> stopPropagation() at parent (bubble)</label>
<div id="grandparent" class="box">grandparent
  <div id="parent" class="box">parent
    <div id="child" class="box">child (click me)</div>
  </div>
</div>
<button id="clear">Clear log</button>
<ol id="log"></ol>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { padding: 14px; margin: 8px 0; border-radius: 8px; cursor: pointer; }
#grandparent { background: #e3f2fd; }
#parent { background: #bbdefb; }
#child { background: #64b5f6; color: white; font-weight: bold; }
#log { font-family: monospace; }`,
        js: `const logEl = document.getElementById('log');
const stop = document.getElementById('stop');
const boxes = ['grandparent', 'parent', 'child'].map(id => document.getElementById(id));

function log(text) {
  const li = document.createElement('li');
  li.textContent = text;
  logEl.append(li);
  console.log(text);
}

boxes.forEach(box => {
  box.addEventListener('click', () => log('capture: ' + box.id), { capture: true });
  box.addEventListener('click', (e) => {
    log('bubble: ' + box.id);
    if (box.id === 'parent' && stop.checked) {
      e.stopPropagation();
      log('(stopped at parent)');
    }
  });
});

document.getElementById('clear').addEventListener('click', () => logEl.replaceChildren());`,
      },
      result: 'Clicking "child" logs: capture: grandparent, capture: parent, capture: child, bubble: child, bubble: parent, bubble: grandparent. With the checkbox ticked the log stops after "bubble: parent" and "(stopped at parent)" - grandparent\'s bubble listener never runs.',
      explanation: 'The event goes DOWN first (capturing listeners, outermost first), reaches the target, then goes back UP (bubbling listeners, innermost first). stopPropagation in the parent prevents the event from reaching grandparent during bubbling.',
    },
    {
      title: 'Event Delegation for a Dynamic To-Do List',
      scenario: 'A task list where items can be completed, deleted and NEW items are added later. Use ONE listener on the <ul> instead of one per button.',
      steps: [
        'Create a <ul id="tasks"> and an add form',
        'Each <li> contains a text span and buttons with data-action="done" / "delete"',
        'Add ONE click listener on the <ul>',
        'Use e.target.closest(\'button[data-action]\') and switch on dataset.action',
        'Add new tasks and check that their buttons work too',
      ],
      code: `tasks.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const li = btn.closest('li');
  if (btn.dataset.action === 'done') li.classList.toggle('done');
  if (btn.dataset.action === 'delete') li.remove();
});`,
      playground: {
        html: `<form id="addForm">
  <input id="newTask" placeholder="New task" required>
  <button type="submit">Add</button>
</form>
<ul id="tasks">
  <li><span>Read about bubbling</span> <button data-action="done">Done</button> <button data-action="delete">Delete</button></li>
  <li><span>Practice delegation</span> <button data-action="done">Done</button> <button data-action="delete">Delete</button></li>
</ul>
<p id="info"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: flex; gap: 8px; }
form input { flex: 1; min-width: 0; padding: 6px; }
#tasks { padding: 0; list-style: none; }
#tasks li { display: flex; gap: 6px; align-items: center; padding: 6px 0; border-bottom: 1px solid #eee; }
#tasks li span { flex: 1; }
#tasks li.done span { text-decoration: line-through; color: #999; }`,
        js: `const tasks = document.getElementById('tasks');
const form = document.getElementById('addForm');
const input = document.getElementById('newTask');
const info = document.getElementById('info');

// ONE listener handles every current and future button
tasks.addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn || !tasks.contains(btn)) return;
  const li = btn.closest('li');
  const text = li.querySelector('span').textContent;

  switch (btn.dataset.action) {
    case 'done':
      li.classList.toggle('done');
      info.textContent = 'Toggled: ' + text;
      break;
    case 'delete':
      li.remove();
      info.textContent = 'Deleted: ' + text;
      break;
  }
  console.log(btn.dataset.action, '->', text);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const li = document.createElement('li');
  const span = document.createElement('span');
  span.textContent = input.value.trim();
  li.append(span, ' ');
  li.insertAdjacentHTML('beforeend', '<button data-action="done">Done</button> <button data-action="delete">Delete</button>');
  tasks.append(li);
  input.value = '';
  info.textContent = 'Added - its buttons work without adding new listeners';
});`,
      },
      result: 'Clicking Done strikes through a task (click again to undo); Delete removes it. Adding "Buy milk" creates a new row whose Done/Delete buttons work immediately even though no listener was attached to them. The info line describes the last action.',
      explanation: 'Clicks on any button bubble up to the <ul>. closest() finds the actual button (even if an inner element was clicked) and the data-action attribute tells us what to do. Because the listener lives on the parent, newly added rows are covered automatically.',
    },
    {
      title: 'preventDefault: Links, Checkbox and Custom Right-Click Menu',
      scenario: 'Show three default actions being cancelled: a link that should not navigate, a "locked" checkbox that cannot be toggled, and a custom context menu instead of the browser\'s menu.',
      steps: [
        'Create a link, a checkbox and a right-click area with a hidden menu',
        'On link click: e.preventDefault() and show the href instead',
        'On checkbox click: preventDefault when "locked"',
        'On contextmenu: preventDefault and position a custom menu at clientX/clientY',
        'Try each one; click elsewhere to hide the menu',
      ],
      code: `link.addEventListener('click', (e) => {
  e.preventDefault();
  out.textContent = 'Blocked navigation to ' + link.href;
});
area.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.hidden = false;
});`,
      playground: {
        html: `<p><a id="link" href="https://example.com">Go to example.com</a></p>
<label><input type="checkbox" id="terms" checked> I agree (locked)</label>
<div id="area">Right-click inside this box</div>
<ul id="menu" hidden>
  <li data-cmd="Copy">Copy</li>
  <li data-cmd="Rename">Rename</li>
  <li data-cmd="Delete">Delete</li>
</ul>
<p id="out"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#area { margin-top: 12px; height: 120px; border: 2px dashed #999; border-radius: 8px; display: grid; place-items: center; user-select: none; }
#menu { position: fixed; margin: 0; padding: 4px 0; list-style: none; background: white; border: 1px solid #ccc; border-radius: 6px; box-shadow: 0 4px 12px #0003; }
#menu li { padding: 6px 16px; cursor: pointer; }
#menu li:hover { background: #eef; }
#out { font-weight: bold; color: #333; }`,
        js: `const link = document.getElementById('link');
const terms = document.getElementById('terms');
const area = document.getElementById('area');
const menu = document.getElementById('menu');
const out = document.getElementById('out');

link.addEventListener('click', (e) => {
  e.preventDefault();
  out.textContent = 'Blocked navigation to ' + link.href;
});

terms.addEventListener('click', (e) => {
  e.preventDefault();
  out.textContent = 'This checkbox is locked (defaultPrevented = ' + e.defaultPrevented + ')';
});

area.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  menu.style.left = e.clientX + 'px';
  menu.style.top = e.clientY + 'px';
  menu.hidden = false;
});

menu.addEventListener('click', (e) => {
  const item = e.target.closest('li[data-cmd]');
  if (!item) return;
  out.textContent = 'You chose: ' + item.dataset.cmd;
  menu.hidden = true;
});

document.addEventListener('click', (e) => {
  if (!menu.contains(e.target)) menu.hidden = true;
});`,
      },
      result: 'Clicking the link does not leave the page; it shows "Blocked navigation to https://example.com/". Clicking the checkbox does not untick it and shows the locked message. Right-clicking the dashed box opens a small custom menu at the mouse position; choosing an item shows "You chose: Rename" (etc.), and clicking elsewhere closes it.',
      explanation: 'preventDefault cancels each element\'s default action (navigation, toggling, native context menu) while our own code still runs. The document-level click listener closes the menu for clicks outside it - this only works because the click bubbles up to document, which is why stopPropagation should be used carefully.',
    },
  ],
  interview: [
    { q: 'Difference between e.target and e.currentTarget?', a: 'e.target is the element where the event originated (the deepest element clicked). e.currentTarget is the element whose listener is currently running (where addEventListener was called). They are equal only when the listener is on the clicked element itself.', level: 'Easy' },
    { q: 'What is event bubbling?', a: 'After an event fires on the target, it propagates upward through each ancestor (parent, grandparent... document, window), triggering their listeners for that event type in the bubbling phase.', level: 'Easy' },
    { q: 'What are the three phases of event propagation?', a: '1) Capturing: window down to the target\'s parent. 2) Target: on the target element. 3) Bubbling: from the target back up to window. addEventListener uses bubbling by default; { capture: true } listens during capturing.', level: 'Medium' },
    { q: '<div id="d"><button id="b">x</button></div>\nd.addEventListener("click", () => console.log("div"));\nd.addEventListener("click", () => console.log("div-capture"), true);\nb.addEventListener("click", () => console.log("btn"));\n// button clicked. Output?', a: 'div-capture, btn, div. The capturing listener on the div runs on the way down, then the target listener, then the div\'s bubbling listener.', level: 'Hard' },
    { q: 'What is event delegation and why use it?', a: 'Attaching a single listener to a common ancestor and using e.target (usually with closest()) to determine which child triggered the event. It handles dynamically added elements, uses less memory and centralises logic. It relies on bubbling.', level: 'Medium' },
    { q: 'Difference between preventDefault and stopPropagation?', a: 'preventDefault cancels the browser\'s default action (link navigation, form submit) but the event keeps propagating. stopPropagation stops the event from reaching other elements but the default action still occurs. They are independent; return false in addEventListener does neither.', level: 'Medium' },
    { q: 'Same HTML as before (div > button). The button listener calls e.stopPropagation(). Clicking the button prints?\nd.addEventListener("click", () => console.log("div"));\nb.addEventListener("click", (e) => { e.stopPropagation(); console.log("btn"); });', a: 'Only "btn". stopPropagation prevents the click from bubbling up to the div.', level: 'Medium' },
    { q: 'Why use e.target.closest(".item") instead of checking e.target.classList.contains("item") in delegation?', a: 'The user may click a child of .item (an icon, span or image), so e.target would be that child. closest() walks up to find the .item ancestor reliably.', level: 'Medium' },
    { q: 'Which events do not bubble?', a: 'focus, blur, mouseenter, mouseleave, load, scroll on elements (and some media events). Use focusin/focusout or mouseover/mouseout when you need bubbling versions.', level: 'Hard' },
    { q: 'What is stopImmediatePropagation?', a: 'It stops propagation to other elements AND prevents any remaining listeners on the same element from running.', level: 'Medium' },
    { q: 'What happens if you call preventDefault inside a passive listener?', a: 'It is ignored (and the browser logs a warning), because passive: true promised not to cancel the default action.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a 3x3 grid of colored squares. Use ONE listener on the grid container to log the color (data-color) of the clicked square and set a big preview box to that color.',
      hint: 'grid.addEventListener("click", e => { const sq = e.target.closest(".square"); ... })',
      solution: `<style>
#grid { display: grid; grid-template-columns: repeat(3, 50px); gap: 6px; }
.square { width: 50px; height: 50px; cursor: pointer; }
#preview { width: 168px; height: 60px; margin-top: 10px; border: 1px solid #ccc; }
</style>
<div id="grid"></div>
<div id="preview"></div>
<script>
const colors = ['red','orange','gold','green','teal','blue','purple','pink','gray'];
const grid = document.getElementById('grid');
colors.forEach(c => {
  const sq = document.createElement('div');
  sq.className = 'square';
  sq.dataset.color = c;
  sq.style.background = c;
  grid.append(sq);
});
grid.addEventListener('click', (e) => {
  const sq = e.target.closest('.square');
  if (!sq) return;
  document.getElementById('preview').style.background = sq.dataset.color;
  console.log(sq.dataset.color);
});
</script>`,
    },
    {
      task: 'Build a modal: clicking "Open" shows an overlay with a dialog box. Clicking the dark overlay closes it, but clicking inside the dialog does NOT. Do it by comparing e.target with the overlay (no stopPropagation).',
      hint: 'overlay.addEventListener("click", e => { if (e.target === overlay) close(); })',
      solution: `<style>
#overlay { position: fixed; inset: 0; background: #0008; display: none; place-items: center; }
#overlay.show { display: grid; }
.dialog { background: white; padding: 20px; border-radius: 8px; }
</style>
<button id="open">Open</button>
<div id="overlay"><div class="dialog">Hello! Click outside me to close.</div></div>
<script>
const overlay = document.getElementById('overlay');
document.getElementById('open').addEventListener('click', () => overlay.classList.add('show'));
overlay.addEventListener('click', (e) => {
  if (e.target === overlay) overlay.classList.remove('show');
});
</script>`,
    },
    {
      task: 'Make a table of products where each row has "+" and "-" buttons with data-action. Use a single delegated listener on <tbody> to update the quantity cell of that row (never below 0).',
      hint: 'const row = btn.closest("tr"); const qty = row.querySelector(".qty");',
      solution: `<table>
  <tbody id="rows">
    <tr><td>Pen</td><td class="qty">0</td><td><button data-action="inc">+</button><button data-action="dec">-</button></td></tr>
    <tr><td>Book</td><td class="qty">0</td><td><button data-action="inc">+</button><button data-action="dec">-</button></td></tr>
  </tbody>
</table>
<script>
document.getElementById('rows').addEventListener('click', (e) => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const qtyCell = btn.closest('tr').querySelector('.qty');
  let qty = Number(qtyCell.textContent);
  qty = btn.dataset.action === 'inc' ? qty + 1 : Math.max(0, qty - 1);
  qtyCell.textContent = qty;
});
</script>`,
    },
    {
      task: 'Create a navigation menu of <a> links with data-page. Clicking a link must NOT navigate; instead show "Page: <name>" in a content area and mark the link as active. Use delegation on the <nav>.',
      hint: 'e.preventDefault() inside the delegated handler after finding the link with closest("a").',
      solution: `<style>.active { font-weight: bold; text-decoration: underline; }</style>
<nav id="nav">
  <a href="/home" data-page="Home">Home</a> |
  <a href="/about" data-page="About">About</a> |
  <a href="/contact" data-page="Contact">Contact</a>
</nav>
<main id="content">Page: Home</main>
<script>
const nav = document.getElementById('nav');
nav.addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();
  nav.querySelectorAll('a').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
  document.getElementById('content').textContent = 'Page: ' + link.dataset.page;
});
</script>`,
    },
  ],
  quiz: [
    { question: 'A listener on a <ul> fires when an <li> is clicked. What is e.currentTarget?', options: ['The <li>', 'The <ul>', 'document', 'window'], answer: 1, explanation: 'currentTarget is the element the listener is attached to.' },
    { question: 'By default, addEventListener listens in which phase?', options: ['Capturing', 'Target only', 'Bubbling', 'Both capturing and bubbling'], answer: 2, explanation: 'The default (capture: false) is the bubbling phase.' },
    { question: 'Event delegation relies on...', options: ['Event bubbling', 'preventDefault', 'setTimeout', 'Capturing only'], answer: 0, explanation: 'Child events bubble up to the parent listener.' },
    { question: 'Which call stops a link from navigating?', options: ['e.stopPropagation()', 'e.stopImmediatePropagation()', 'return true', 'e.preventDefault()'], answer: 3, explanation: 'preventDefault cancels the default action.' },
    { question: 'Which event does NOT bubble?', options: ['click', 'focus', 'input', 'keydown'], answer: 1, explanation: 'focus/blur do not bubble; use focusin/focusout.' },
  ],
};
