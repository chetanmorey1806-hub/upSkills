export default {
  id: 'day-11-modal-offcanvas-toasts-tooltips-popovers',
  title: 'JavaScript Components: Modal, Offcanvas, Toasts, Tooltips and Popovers',
  module: 'Module 2: Components',
  day: 11,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Use Bootstrap\'s overlay components: modals (dialogs), offcanvas side panels, toast notifications, tooltips and popovers. Learn both the data-attribute API and the JavaScript API (constructors, getOrCreateInstance, methods, options and events).',
  objectives: [
    'Open and close modals via data attributes and JavaScript; use sizes, scrollable, centred and static backdrop options',
    'Build an offcanvas sidebar and an offcanvas navbar menu',
    'Show toast notifications from JavaScript and stack them in a toast container',
    'Initialise tooltips and popovers (they are opt-in) and configure placement, trigger and html',
    'Use component events like show.bs.modal and hidden.bs.toast to run code at the right time',
  ],
  theory: [
    {
      heading: 'Two Ways to Use Bootstrap JS Components',
      content: '**1. Data API (no JS code)**: add `data-bs-toggle="modal"` and `data-bs-target="#id"` to a button. The bundle listens for clicks and does the rest.\n\n**2. JavaScript API**: create or get an instance and call methods:\n\n```\nconst modal = new bootstrap.Modal("#myModal", { backdrop: "static" });\nmodal.show();\nbootstrap.Modal.getOrCreateInstance("#myModal").hide();\nbootstrap.Modal.getInstance(el); // null if none exists\n```\n\nCommon methods: `show()`, `hide()`, `toggle()`, `dispose()`.\n\n**Events** follow the pattern `{action}.bs.{component}`:\n- `show.bs.modal` – fires immediately when show is called (can `preventDefault()`)\n- `shown.bs.modal` – after the transition finished\n- `hide.bs.modal`, `hidden.bs.modal`\n\nOptions can be passed in JS or as data attributes, e.g. `data-bs-backdrop="static"`.',
      tip: 'Use getOrCreateInstance instead of new each time; creating many instances on the same element causes duplicate listeners and bugs.',
    },
    {
      heading: 'Modal',
      content: 'A **modal** is a dialog box on top of the page with a dark backdrop; the page behind is blocked until it closes.\n\nStructure:\n```\n.modal.fade#id (tabindex="-1", aria-labelledby)\n  .modal-dialog            ← size & position\n    .modal-content\n      .modal-header (.modal-title + .btn-close[data-bs-dismiss="modal"])\n      .modal-body\n      .modal-footer\n```\n\nOptions:\n- Sizes: `.modal-sm`, `.modal-lg`, `.modal-xl`, `.modal-fullscreen`, `.modal-fullscreen-md-down`\n- `.modal-dialog-centered` – vertically centred\n- `.modal-dialog-scrollable` – body scrolls instead of the page\n- `data-bs-backdrop="static"` + `data-bs-keyboard="false"` – clicking outside or pressing Esc does not close it (for important confirmations)\n- Pass data to a modal: read `event.relatedTarget` (the button that opened it) inside `show.bs.modal`\n\nAnalogy: a modal is a bank teller window shutter: everything else stops until you deal with this one thing.',
      tip: 'Place modal HTML as a direct child of <body> (or at least not inside a fixed/transformed parent) to avoid z-index and positioning issues.',
    },
    {
      heading: 'Offcanvas',
      content: 'An **offcanvas** is a hidden panel that slides in from an edge: `.offcanvas-start` (left), `.offcanvas-end` (right), `.offcanvas-top`, `.offcanvas-bottom`.\n\n```\n<div class="offcanvas offcanvas-start" tabindex="-1" id="menu" aria-labelledby="menuLabel">\n  <div class="offcanvas-header">\n    <h5 class="offcanvas-title" id="menuLabel">Menu</h5>\n    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>\n  </div>\n  <div class="offcanvas-body">...</div>\n</div>\n```\n\nTrigger: `data-bs-toggle="offcanvas" data-bs-target="#menu"`.\n\nOptions: `data-bs-scroll="true"` (allow body scroll), `data-bs-backdrop="false"` or `"static"`.\n\nResponsive offcanvas: `.offcanvas-lg` behaves as offcanvas below lg and as normal visible content from lg up – perfect for sidebars and mobile menus. Navbars can use `.offcanvas` instead of `.collapse` for slide-in mobile menus.',
    },
    {
      heading: 'Toasts',
      content: '**Toasts** are small, lightweight notifications (like Android toasts or push notifications).\n\n- Markup: `.toast` (role="alert", aria-live="assertive", aria-atomic="true") with `.toast-header` and `.toast-body`\n- Stack and position them inside `.toast-container.position-fixed.bottom-0.end-0.p-3`\n- Toasts are **not shown automatically**; call `bootstrap.Toast.getOrCreateInstance(el).show()`\n- Options: `autohide` (default true), `delay` (default 5000 ms), `animation`\n- Colour: `.text-bg-success` on the toast with a `.btn-close-white`\n\nFor status messages that are not urgent use `role="status" aria-live="polite"`.',
    },
    {
      heading: 'Tooltips and Popovers (opt-in!)',
      content: 'Tooltips show a small text bubble on hover/focus; popovers show a larger box with a title and content, by default on click.\n\nFor performance they are **opt-in**: data attributes alone do nothing until you initialise them:\n\n```\ndocument.querySelectorAll(\'[data-bs-toggle="tooltip"]\')\n  .forEach(el => new bootstrap.Tooltip(el));\ndocument.querySelectorAll(\'[data-bs-toggle="popover"]\')\n  .forEach(el => new bootstrap.Popover(el));\n```\n\nAttributes:\n- Tooltip: `data-bs-toggle="tooltip" data-bs-title="Text"` (or `title`), `data-bs-placement="top|right|bottom|left"`\n- Popover: `data-bs-toggle="popover" data-bs-title="Title" data-bs-content="Body"`\n- `data-bs-trigger="focus"` – dismiss on next click (use on `<a tabindex="0">` or button)\n- `data-bs-html="true"` – allow HTML (sanitised by Bootstrap\'s allowList)\n- `data-bs-custom-class` – extra CSS class for theming\n\nBoth depend on **Popper** (in the bundle). Disabled buttons don\'t fire events: wrap them in a `<span tabindex="0">` with the tooltip.',
      points: [
        'Modal, offcanvas, dropdown, collapse, tab, alert work with data attributes automatically',
        'Tooltip, popover and toast need JavaScript to initialise or show',
        'Coming next (Day 12): carousel, accordion, collapse, dropdowns and tables',
      ],
    },
  ],
  examples: [
    {
      title: 'Modal: Basic, Centred/Scrollable and Static Confirm with Dynamic Data',
      scenario: 'A user list where clicking "Delete" opens a static confirmation modal showing the chosen user\'s name, and a terms modal that scrolls.',
      steps: [
        'Create one confirm modal with data-bs-backdrop="static" and data-bs-keyboard="false"',
        'Each delete button sets data-bs-toggle="modal", data-bs-target and data-user',
        'In show.bs.modal read event.relatedTarget to insert the name',
        'On confirm, remove the row and hide the modal via getInstance',
        'Add a second, centred scrollable modal opened by a button',
      ],
      code: `<button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" data-user="Asha">Delete</button>

<div class="modal fade" id="confirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="confirmTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="confirmTitle">Delete user?</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">Are you sure you want to delete <strong id="who"></strong>?</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" id="yes">Delete</button>
      </div>
    </div>
  </div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <ul class="list-group mb-3" id="users">
    <li class="list-group-item d-flex justify-content-between align-items-center">Asha <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" data-user="Asha">Delete</button></li>
    <li class="list-group-item d-flex justify-content-between align-items-center">Rahul <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" data-user="Rahul">Delete</button></li>
    <li class="list-group-item d-flex justify-content-between align-items-center">Neha <button class="btn btn-danger btn-sm" data-bs-toggle="modal" data-bs-target="#confirmModal" data-user="Neha">Delete</button></li>
  </ul>
  <button class="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#termsModal">Read terms (scrollable)</button>
</div>

<div class="modal fade" id="confirmModal" data-bs-backdrop="static" data-bs-keyboard="false" tabindex="-1" aria-labelledby="confirmTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered">
    <div class="modal-content">
      <div class="modal-header">
        <h1 class="modal-title fs-5" id="confirmTitle">Delete user?</h1>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">Are you sure you want to delete <strong id="who"></strong>? This cannot be undone.</div>
      <div class="modal-footer">
        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
        <button type="button" class="btn btn-danger" id="yes">Yes, delete</button>
      </div>
    </div>
  </div>
</div>

<div class="modal fade" id="termsModal" tabindex="-1" aria-labelledby="termsTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-dialog-scrollable modal-lg">
    <div class="modal-content">
      <div class="modal-header"><h1 class="modal-title fs-5" id="termsTitle">Terms and Conditions</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
      <div class="modal-body" id="termsBody"></div>
      <div class="modal-footer"><button type="button" class="btn btn-primary" data-bs-dismiss="modal">I agree</button></div>
    </div>
  </div>
</div>`,
        js: `const confirmEl = document.getElementById('confirmModal');
let target = null;
confirmEl.addEventListener('show.bs.modal', function (event) {
  target = event.relatedTarget;
  document.getElementById('who').textContent = target.getAttribute('data-user');
});
document.getElementById('yes').addEventListener('click', function () {
  const name = target.getAttribute('data-user');
  target.closest('li').remove();
  bootstrap.Modal.getInstance(confirmEl).hide();
  console.log('Deleted', name);
});
confirmEl.addEventListener('hidden.bs.modal', function () { console.log('Confirm modal closed'); });
let t = '';
for (let i = 1; i <= 25; i++) t += '<p>' + i + '. Clause text: you agree to learn Bootstrap every day.</p>';
document.getElementById('termsBody').innerHTML = t;`,
      },
      result: 'Clicking Delete opens a centred dialog naming the user; clicking outside or pressing Esc does not close it. "Yes, delete" removes that row and closes the modal. The terms modal is large, centred and its body scrolls.',
      explanation: 'event.relatedTarget in show.bs.modal is the trigger button, so one modal serves many rows. Static backdrop prevents accidental dismissal. getInstance returns the instance the data API created.',
    },
    {
      title: 'Offcanvas Sidebar and Offcanvas Mobile Navbar',
      scenario: 'A shopping app with a filter panel sliding from the left and a cart panel sliding from the right, plus a navbar whose mobile menu slides in.',
      steps: [
        'Create two offcanvas panels: offcanvas-start (filters) and offcanvas-end (cart)',
        'Trigger them with data-bs-toggle="offcanvas"',
        'Build a navbar-expand-md whose menu uses .offcanvas instead of .collapse',
        'Listen to shown.bs.offcanvas to log which panel opened',
      ],
      code: `<button class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#filters" aria-controls="filters">Filters</button>
<div class="offcanvas offcanvas-start" tabindex="-1" id="filters" aria-labelledby="filtersLabel">
  <div class="offcanvas-header">
    <h5 class="offcanvas-title" id="filtersLabel">Filters</h5>
    <button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
  </div>
  <div class="offcanvas-body">...</div>
</div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<nav class="navbar navbar-expand-md bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="#">MiniShop</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#navMenu" aria-controls="navMenu" aria-label="Open menu"><span class="navbar-toggler-icon"></span></button>
    <div class="offcanvas offcanvas-end" tabindex="-1" id="navMenu" aria-labelledby="navMenuLabel">
      <div class="offcanvas-header"><h5 class="offcanvas-title" id="navMenuLabel">Menu</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
      <div class="offcanvas-body">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item"><a class="nav-link active" aria-current="page" href="#">Home</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Shop</a></li>
          <li class="nav-item"><a class="nav-link" href="#">Contact</a></li>
        </ul>
      </div>
    </div>
  </div>
</nav>
<div class="container py-3 d-flex gap-2">
  <button class="btn btn-outline-primary" data-bs-toggle="offcanvas" data-bs-target="#filters" aria-controls="filters"><i class="bi bi-funnel" aria-hidden="true"></i> Filters</button>
  <button class="btn btn-primary" data-bs-toggle="offcanvas" data-bs-target="#cart" aria-controls="cart"><i class="bi bi-cart" aria-hidden="true"></i> Cart (2)</button>
</div>
<div class="offcanvas offcanvas-start" tabindex="-1" id="filters" aria-labelledby="filtersLabel">
  <div class="offcanvas-header"><h5 class="offcanvas-title" id="filtersLabel">Filters</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
  <div class="offcanvas-body">
    <div class="form-check"><input class="form-check-input" type="checkbox" id="f1"><label class="form-check-label" for="f1">In stock</label></div>
    <div class="form-check"><input class="form-check-input" type="checkbox" id="f2"><label class="form-check-label" for="f2">Free delivery</label></div>
    <label for="price" class="form-label mt-3">Max price</label><input type="range" class="form-range" id="price">
    <button class="btn btn-primary w-100 mt-3" data-bs-dismiss="offcanvas">Apply</button>
  </div>
</div>
<div class="offcanvas offcanvas-end" tabindex="-1" id="cart" aria-labelledby="cartLabel">
  <div class="offcanvas-header"><h5 class="offcanvas-title" id="cartLabel">Your cart</h5><button type="button" class="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button></div>
  <div class="offcanvas-body">
    <ul class="list-group mb-3"><li class="list-group-item d-flex justify-content-between">Headphones <span>Rs 2,999</span></li><li class="list-group-item d-flex justify-content-between">Mouse <span>Rs 599</span></li></ul>
    <button class="btn btn-success w-100">Checkout</button>
  </div>
</div>`,
        js: `document.querySelectorAll('.offcanvas').forEach(function (el) {
  el.addEventListener('shown.bs.offcanvas', function () { console.log('Opened offcanvas:', el.id); });
});`,
      },
      result: 'Filters slides in from the left with checkboxes and a range; Cart slides in from the right with items. Below 768px the navbar hamburger opens the menu as a right-side panel instead of a dropdown.',
      explanation: 'The Offcanvas plugin adds .show and a backdrop, traps focus inside the panel and returns focus to the trigger on close. In a navbar-expand-md, the .offcanvas becomes a normal inline menu from md up.',
    },
    {
      title: 'Toast Notifications from JavaScript',
      scenario: 'Show stacked "Added to cart" toasts in the bottom-right corner that auto-hide after 3 seconds.',
      steps: [
        'Add a .toast-container position-fixed bottom-0 end-0 p-3',
        'Write showToast(msg, color) that builds a toast element and appends it',
        'Call bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show()',
        'Remove the element on hidden.bs.toast',
      ],
      code: `function showToast(msg, color = 'success') {
  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-' + color + ' border-0';
  el.setAttribute('role', 'status'); el.setAttribute('aria-live', 'polite'); el.setAttribute('aria-atomic', 'true');
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + msg + '</div>' +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
  document.getElementById('toasts').append(el);
  el.addEventListener('hidden.bs.toast', () => el.remove());
  bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show();
}`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3 d-flex flex-wrap gap-2">
  <button class="btn btn-success" onclick="showToast('Added to cart', 'success')">Add to cart</button>
  <button class="btn btn-danger" onclick="showToast('Payment failed', 'danger')">Fail payment</button>
  <button class="btn btn-dark" id="staticBtn">Show header toast</button>
</div>
<div class="toast-container position-fixed bottom-0 end-0 p-3" id="toasts">
  <div class="toast" id="headerToast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-autohide="false">
    <div class="toast-header">
      <i class="bi bi-bell-fill text-primary me-2" aria-hidden="true"></i>
      <strong class="me-auto">EduPortal</strong>
      <small>just now</small>
      <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
    <div class="toast-body">Your assignment was graded: <b>A</b>. (autohide off)</div>
  </div>
</div>`,
        js: `function showToast(msg, color) {
  color = color || 'success';
  const el = document.createElement('div');
  el.className = 'toast align-items-center text-bg-' + color + ' border-0';
  el.setAttribute('role', 'status');
  el.setAttribute('aria-live', 'polite');
  el.setAttribute('aria-atomic', 'true');
  el.innerHTML = '<div class="d-flex"><div class="toast-body">' + msg + '</div>' +
    '<button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button></div>';
  document.getElementById('toasts').append(el);
  el.addEventListener('hidden.bs.toast', function () { el.remove(); console.log('Toast removed:', msg); });
  bootstrap.Toast.getOrCreateInstance(el, { delay: 3000 }).show();
}
window.showToast = showToast;
document.getElementById('staticBtn').addEventListener('click', function () {
  bootstrap.Toast.getOrCreateInstance(document.getElementById('headerToast')).show();
});`,
      },
      result: 'Each click stacks a green or red toast in the bottom-right that disappears after 3 seconds (console logs removal). The header toast with bell icon stays until closed.',
      explanation: 'Toasts are hidden by default; Toast.show() fades them in and, with autohide, schedules hide after delay. data-bs-autohide="false" keeps the static one open. The container stacks multiple toasts with spacing.',
    },
    {
      title: 'Tooltips and Popovers (with Initialisation)',
      scenario: 'Add hover hints to icon buttons and click-to-open help popovers, including a dismiss-on-next-click popover and a tooltip on a disabled button.',
      steps: [
        'Add data-bs-toggle="tooltip" with data-bs-title and placement on buttons',
        'Add data-bs-toggle="popover" with title and content',
        'Initialise all tooltips and popovers with querySelectorAll + new bootstrap.Tooltip / Popover',
        'Wrap the disabled button in a focusable span carrying the tooltip',
      ],
      code: `<button class="btn btn-secondary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Edit">Edit</button>
<button class="btn btn-info" data-bs-toggle="popover" data-bs-title="Help" data-bs-content="Popover body text">Help</button>
<script>
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
document.querySelectorAll('[data-bs-toggle="popover"]').forEach(el => new bootstrap.Popover(el));
</script>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-5 text-center">
  <div class="d-flex justify-content-center flex-wrap gap-2 mb-4">
    <button class="btn btn-outline-secondary" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Tooltip on top">Top</button>
    <button class="btn btn-outline-secondary" data-bs-toggle="tooltip" data-bs-placement="right" data-bs-title="Tooltip on right">Right</button>
    <button class="btn btn-outline-secondary" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="Tooltip on bottom">Bottom</button>
    <button class="btn btn-outline-secondary" data-bs-toggle="tooltip" data-bs-placement="left" data-bs-title="Tooltip on left">Left</button>
    <button class="btn btn-primary" aria-label="Download" data-bs-toggle="tooltip" data-bs-title="Download report"><i class="bi bi-download" aria-hidden="true"></i></button>
    <button class="btn btn-dark" data-bs-toggle="tooltip" data-bs-html="true" data-bs-title="<em>Rich</em> <b>HTML</b> tooltip">HTML</button>
  </div>
  <div class="d-flex justify-content-center flex-wrap gap-2">
    <button type="button" class="btn btn-info" data-bs-toggle="popover" data-bs-title="What is GST?" data-bs-content="Goods and Services Tax added to the price at checkout.">Click for popover</button>
    <a tabindex="0" class="btn btn-warning" role="button" data-bs-toggle="popover" data-bs-trigger="focus" data-bs-placement="bottom" data-bs-title="Dismissible" data-bs-content="Click anywhere else to close me.">Dismiss on next click</a>
    <span class="d-inline-block" tabindex="0" data-bs-toggle="tooltip" data-bs-title="You need admin rights">
      <button class="btn btn-secondary" type="button" disabled>Disabled</button>
    </span>
  </div>
</div>`,
        js: `const tips = Array.from(document.querySelectorAll('[data-bs-toggle="tooltip"]')).map(function (el) { return new bootstrap.Tooltip(el); });
const pops = Array.from(document.querySelectorAll('[data-bs-toggle="popover"]')).map(function (el) { return new bootstrap.Popover(el); });
console.log('Initialised', tips.length, 'tooltips and', pops.length, 'popovers');
document.querySelector('[data-bs-title="What is GST?"]').addEventListener('shown.bs.popover', function () { console.log('GST popover shown'); });`,
      },
      result: 'Hovering each button shows a dark tooltip on the chosen side (HTML one renders italic/bold). The cyan button toggles a popover with title and body; the yellow one closes when you click elsewhere; hovering the disabled button still shows its tooltip.',
      explanation: 'Tooltips and popovers are opt-in for performance, so the JS creates instances. Popper computes positions and flips them if there is no room. Disabled elements do not fire mouse events, so the wrapper span receives them.',
    },
  ],
  interview: [
    { q: 'Which Bootstrap components must be initialised manually with JavaScript?', a: 'Tooltips and popovers (opt-in for performance) and toasts (must be shown via Toast.show()). Modals, offcanvas, collapse, dropdowns and tabs work through the data API.', level: 'Medium' },
    { q: 'How do you open a modal with JavaScript?', a: 'const m = bootstrap.Modal.getOrCreateInstance("#myModal"); m.show(); — or new bootstrap.Modal(el, options).show().', level: 'Easy' },
    { q: 'How do you prevent a modal from closing when clicking outside or pressing Esc?', a: 'Use data-bs-backdrop="static" and data-bs-keyboard="false" (or options { backdrop: "static", keyboard: false }).', level: 'Easy' },
    { q: 'How can one modal show different data for different buttons?', a: 'Listen for show.bs.modal; event.relatedTarget is the clicked button. Read its data-* attributes and update the modal content.', level: 'Medium' },
    { q: 'Difference between show.bs.modal and shown.bs.modal?', a: 'show fires immediately when show() is called (can be cancelled with preventDefault); shown fires after the CSS transition completes and the modal is visible. Use shown to focus inputs.', level: 'Medium' },
    { q: 'What is getOrCreateInstance and why use it?', a: 'A static method that returns the existing component instance for an element or creates a new one. It avoids duplicate instances and listeners.', level: 'Medium' },
    { q: 'Modal vs Offcanvas?', a: 'A modal is a centred dialog demanding attention (confirmations, forms). An offcanvas slides from an edge and is used for navigation menus, filters, carts or side content.', level: 'Easy' },
    { q: 'What does .offcanvas-lg do?', a: 'The element acts as an offcanvas panel below the lg breakpoint and is displayed as normal page content from lg upward — ideal for responsive sidebars.', level: 'Hard' },
    { q: 'How do you show a tooltip on a disabled button?', a: 'Disabled elements do not trigger mouse/focus events, so wrap the button in a <span class="d-inline-block" tabindex="0"> and put the tooltip on the span.', level: 'Medium' },
    { q: 'How do you make a popover close when the user clicks elsewhere?', a: 'Use data-bs-trigger="focus" on a focusable element (button or <a tabindex="0" role="button">).', level: 'Medium' },
    { q: 'Which library positions tooltips, popovers and dropdowns?', a: 'Popper.js (v2), included in bootstrap.bundle.js.', level: 'Easy' },
    { q: 'What accessibility features do Bootstrap modals provide?', a: 'Focus is moved into the modal and trapped there, Esc closes it, focus returns to the trigger on close, and aria-modal/role="dialog" are set. You must add aria-labelledby pointing to the title.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a "Subscribe" modal containing an email form that opens automatically 2 seconds after page load.',
      hint: 'setTimeout + bootstrap.Modal.getOrCreateInstance(el).show().',
      solution: `<div class="modal fade" id="sub" tabindex="-1" aria-labelledby="subTitle" aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered"><div class="modal-content">
    <div class="modal-header"><h1 class="modal-title fs-5" id="subTitle">Join our newsletter</h1>
      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
    <div class="modal-body"><input type="email" class="form-control" placeholder="Email" aria-label="Email"></div>
    <div class="modal-footer"><button class="btn btn-primary" data-bs-dismiss="modal">Subscribe</button></div>
  </div></div>
</div>
<script>
setTimeout(() => bootstrap.Modal.getOrCreateInstance('#sub').show(), 2000);
</script>`,
    },
    {
      task: 'Make a modal with a form where the input gets focus automatically when the modal opens.',
      hint: 'shown.bs.modal + input.focus().',
      solution: `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#nameModal">Rename</button>
<div class="modal fade" id="nameModal" tabindex="-1" aria-labelledby="nmTitle" aria-hidden="true">
  <div class="modal-dialog"><div class="modal-content">
    <div class="modal-header"><h1 class="modal-title fs-5" id="nmTitle">Rename file</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div>
    <div class="modal-body"><input id="newName" class="form-control" aria-label="New name"></div>
  </div></div>
</div>
<script>
document.getElementById('nameModal').addEventListener('shown.bs.modal', () => document.getElementById('newName').focus());
</script>`,
    },
    {
      task: 'Build a bottom offcanvas "Cookie preferences" panel with Accept and Reject buttons that close it and show a toast with the choice.',
      hint: 'offcanvas-bottom, data-bs-dismiss="offcanvas", Toast.show().',
      solution: `<button class="btn btn-outline-dark" data-bs-toggle="offcanvas" data-bs-target="#cookies">Cookie settings</button>
<div class="offcanvas offcanvas-bottom" tabindex="-1" id="cookies" aria-labelledby="ckTitle">
  <div class="offcanvas-header"><h5 class="offcanvas-title" id="ckTitle">Cookie preferences</h5></div>
  <div class="offcanvas-body">
    <p>We use cookies to improve your experience.</p>
    <button class="btn btn-success choice" data-bs-dismiss="offcanvas" data-v="accepted">Accept</button>
    <button class="btn btn-outline-secondary choice" data-bs-dismiss="offcanvas" data-v="rejected">Reject</button>
  </div>
</div>
<div class="toast-container position-fixed top-0 end-0 p-3">
  <div id="ckToast" class="toast text-bg-dark" role="status" aria-live="polite"><div class="toast-body" id="ckMsg"></div></div>
</div>
<script>
document.querySelectorAll('.choice').forEach(b => b.addEventListener('click', () => {
  document.getElementById('ckMsg').textContent = 'Cookies ' + b.dataset.v;
  bootstrap.Toast.getOrCreateInstance('#ckToast').show();
}));
</script>`,
    },
    {
      task: 'Add tooltips to five social icons and initialise them; make one tooltip appear on the bottom with a custom class.',
      hint: 'data-bs-custom-class + CSS .tooltip-pink { --bs-tooltip-bg: #d63384; }.',
      solution: `<div class="d-flex gap-3 fs-3">
  <a href="#" data-bs-toggle="tooltip" data-bs-title="Facebook" aria-label="Facebook"><i class="bi bi-facebook" aria-hidden="true"></i></a>
  <a href="#" data-bs-toggle="tooltip" data-bs-title="Instagram" data-bs-placement="bottom" data-bs-custom-class="tooltip-pink" aria-label="Instagram"><i class="bi bi-instagram" aria-hidden="true"></i></a>
  <a href="#" data-bs-toggle="tooltip" data-bs-title="YouTube" aria-label="YouTube"><i class="bi bi-youtube" aria-hidden="true"></i></a>
  <a href="#" data-bs-toggle="tooltip" data-bs-title="LinkedIn" aria-label="LinkedIn"><i class="bi bi-linkedin" aria-hidden="true"></i></a>
  <a href="#" data-bs-toggle="tooltip" data-bs-title="GitHub" aria-label="GitHub"><i class="bi bi-github" aria-hidden="true"></i></a>
</div>
<style>.tooltip-pink { --bs-tooltip-bg: #d63384; --bs-tooltip-color: #fff; }</style>
<script>
document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => new bootstrap.Tooltip(el));
</script>`,
    },
  ],
  quiz: [
    { question: 'Which attribute opens a modal from a button?', options: ['data-bs-open="modal"', 'data-bs-toggle="modal"', 'data-modal="show"', 'href="#modal"'], answer: 1, explanation: 'data-bs-toggle="modal" with data-bs-target.' },
    { question: 'Tooltips appear only after:', options: ['Adding the title attribute', 'Loading Popper CSS', 'Initialising them with new bootstrap.Tooltip()', 'Adding .tooltip-show'], answer: 2, explanation: 'Tooltips are opt-in.' },
    { question: 'Which class makes an offcanvas slide in from the right?', options: ['offcanvas-end', 'offcanvas-right', 'offcanvas-start', 'offcanvas-r'], answer: 0, explanation: 'Bootstrap 5 uses start/end.' },
    { question: 'Which event fires after a toast has finished hiding?', options: ['hide.bs.toast', 'close.bs.toast', 'toast.hidden', 'hidden.bs.toast'], answer: 3, explanation: 'Past tense events fire after transitions.' },
    { question: 'Which class keeps a modal body scrollable while the header and footer stay fixed?', options: ['modal-scroll', 'modal-body-scroll', 'modal-dialog-scrollable', 'overflow-modal'], answer: 2, explanation: 'Applied to .modal-dialog.' },
  ],
};
