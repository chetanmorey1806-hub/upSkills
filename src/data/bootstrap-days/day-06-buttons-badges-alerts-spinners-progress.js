export default {
  id: 'day-06-buttons-badges-alerts-spinners-progress',
  title: 'Buttons, Button Groups, Badges, Alerts, Spinners and Progress',
  module: 'Module 2: Components',
  day: 6,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn Bootstrap\'s most-used feedback and action components: button variants, sizes and states, button groups and toolbars, badges, dismissible alerts, loading spinners and progress bars, including how to control them with JavaScript.',
  objectives: [
    'Create solid, outline, sized, block, disabled and toggle buttons',
    'Group buttons with btn-group, btn-group-vertical, btn-toolbar and radio/checkbox toggle groups',
    'Use badges inside headings and buttons, including pill and positioned badges',
    'Show alerts (with links, headings and close buttons) and create them dynamically with JS',
    'Indicate loading with spinners and progress bars, and update progress from JavaScript',
  ],
  theory: [
    {
      heading: 'Buttons',
      content: 'Every button needs the base class `.btn` plus a variant:\n\n- **Solid**: `.btn-primary`, `.btn-secondary`, `.btn-success`, `.btn-danger`, `.btn-warning`, `.btn-info`, `.btn-light`, `.btn-dark`, `.btn-link`\n- **Outline**: `.btn-outline-primary` etc. – transparent until hover\n- **Sizes**: `.btn-lg`, `.btn-sm` (or custom via CSS variables)\n- **Full width**: `w-100`, or a stack: `<div class="d-grid gap-2">` around buttons; responsive: `d-grid d-md-block`\n- **Disabled**: `disabled` attribute on `<button>`; for `<a>` use `.disabled` + `aria-disabled="true"` + `tabindex="-1"`\n- **Toggle**: `data-bs-toggle="button"` toggles the `.active` class; add `aria-pressed`\n\n`.btn` works on `<button>`, `<a>` and `<input type="submit">`. Use `<button type="button">` for actions and `<a>` for navigation.',
      tip: 'Always set type="button" on buttons that are not meant to submit a form. The default type inside a form is "submit".',
    },
    {
      heading: 'Button Groups and Toolbars',
      content: '- `.btn-group` – joins buttons together with shared borders (add `role="group"` and `aria-label`)\n- `.btn-group-vertical` – stacks them vertically\n- `.btn-group-lg`, `.btn-group-sm` – size the whole group\n- `.btn-toolbar` – combines several groups (role="toolbar")\n- **Radio/checkbox toggle buttons**: hidden inputs with `.btn-check` followed by labels with `.btn` classes. This gives a segmented control that works with forms and keyboard.',
      syntax: `<div class="btn-group" role="group" aria-label="View mode">
  <input type="radio" class="btn-check" name="view" id="v1" checked>
  <label class="btn btn-outline-primary" for="v1">List</label>
  <input type="radio" class="btn-check" name="view" id="v2">
  <label class="btn btn-outline-primary" for="v2">Grid</label>
</div>`,
    },
    {
      heading: 'Badges',
      content: 'A **badge** is a small count or label. In 5.3 combine `.badge` with a background helper:\n\n- `<span class="badge text-bg-primary">New</span>`\n- Pill: `.rounded-pill`\n- In headings it scales with the font size: `<h3>Inbox <span class="badge text-bg-secondary">4</span></h3>`\n- In buttons: counters\n- Positioned: `position-absolute top-0 start-100 translate-middle` on a `position-relative` parent\n\nAdd a `.visually-hidden` text explaining the number for screen readers ("4 unread messages").',
    },
    {
      heading: 'Alerts',
      content: 'Alerts give contextual feedback messages: `.alert` + `.alert-{color}` + `role="alert"`.\n\n- Links inside: `.alert-link` (bold, matching colour)\n- Rich content: `.alert-heading`, paragraphs, `<hr>`\n- Dismissible: `.alert-dismissible .fade .show` plus a `<button class="btn-close" data-bs-dismiss="alert">`\n- JavaScript: `bootstrap.Alert.getOrCreateInstance(el).close()`; events `close.bs.alert` and `closed.bs.alert`\n\nAnalogy: alerts are the sticky notes a website puts in front of you: green "done", yellow "careful", red "something failed".',
      tip: 'When you insert an alert dynamically, role="alert" makes screen readers announce it immediately. Do not overuse it for non-urgent messages.',
    },
    {
      heading: 'Spinners',
      content: 'Spinners are pure CSS loading indicators:\n\n- `.spinner-border` – rotating ring\n- `.spinner-grow` – pulsing dot\n- Colour: `text-primary`, `text-success`…\n- Size: `.spinner-border-sm`, `.spinner-grow-sm`, or custom `style="width:3rem;height:3rem"`\n- Accessibility: `role="status"` and a `.visually-hidden` "Loading..." text\n- Inside buttons: `<button disabled><span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Saving...</button>`',
    },
    {
      heading: 'Progress Bars',
      content: 'Bootstrap 5.3 progress markup puts the ARIA attributes on the wrapper:\n\n```\n<div class="progress" role="progressbar" aria-label="Upload" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100">\n  <div class="progress-bar" style="width: 40%">40%</div>\n</div>\n```\n\n- Height: set `style="height: 8px"` on `.progress`\n- Colours: `.bg-success`, `.text-bg-warning` on `.progress-bar`\n- Striped: `.progress-bar-striped`; animated: `.progress-bar-animated`\n- Multiple bars: wrap several `.progress` in `.progress-stacked`, each with its own width\n\nTo update with JS, change `style.width`, the text and `aria-valuenow`.',
      points: [
        'Spinners and progress bars are CSS-only; no JavaScript component to initialise',
        'Alerts, toggle buttons and close buttons use the JS bundle via data attributes',
        'Coming next (Day 7): navbar, navs and tabs, breadcrumbs, pagination',
      ],
    },
  ],
  examples: [
    {
      title: 'Button Showcase: Variants, Sizes, States and Block Buttons',
      scenario: 'Create a reference page of all button styles you will use in projects.',
      steps: [
        'Generate solid and outline buttons for each theme colour with JS',
        'Add lg/sm sizes and a disabled button',
        'Add a toggle button with data-bs-toggle="button"',
        'Add a d-grid block button stack',
      ],
      code: `<button type="button" class="btn btn-primary">Primary</button>
<button type="button" class="btn btn-outline-danger">Outline danger</button>
<button type="button" class="btn btn-success btn-lg">Large</button>
<button type="button" class="btn btn-secondary btn-sm" disabled>Disabled</button>
<button type="button" class="btn btn-outline-dark" data-bs-toggle="button" aria-pressed="false">Toggle me</button>
<div class="d-grid gap-2"><button class="btn btn-primary">Full width</button></div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="d-flex flex-wrap gap-2 mb-2" id="solid"></div>
  <div class="d-flex flex-wrap gap-2 mb-3" id="outline"></div>
  <div class="d-flex flex-wrap gap-2 align-items-center mb-3">
    <button type="button" class="btn btn-success btn-lg">Large</button>
    <button type="button" class="btn btn-success">Default</button>
    <button type="button" class="btn btn-success btn-sm">Small</button>
    <button type="button" class="btn btn-secondary" disabled>Disabled</button>
    <a class="btn btn-link" href="#">btn-link</a>
    <button type="button" class="btn btn-outline-dark" data-bs-toggle="button" aria-pressed="false" id="tg">Toggle me</button>
  </div>
  <div class="d-grid gap-2 d-md-block">
    <button class="btn btn-primary" type="button">Block on mobile</button>
    <button class="btn btn-outline-primary" type="button">Inline from md</button>
  </div>
</div>`,
        js: `const colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];
colors.forEach(function (c) {
  document.getElementById('solid').insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-' + c + '">' + c + '</button>');
  document.getElementById('outline').insertAdjacentHTML('beforeend', '<button type="button" class="btn btn-outline-' + c + '">' + c + '</button>');
});
document.getElementById('tg').addEventListener('click', function () {
  console.log('Toggle active:', this.classList.contains('active'));
});`,
      },
      result: 'Rows of coloured solid and outline buttons, three sizes, a faded disabled button, a toggle button that stays dark when active (console logs true/false), and two buttons that are full width on mobile but inline on md+.',
      explanation: 'The data-bs-toggle="button" data API flips .active and aria-pressed on click. d-grid makes children stretch; d-md-block cancels the grid from md so buttons sit inline.',
    },
    {
      title: 'Button Groups, Toolbar and Segmented Radio Control',
      scenario: 'Build a text-editor toolbar and a List/Grid view switch that reports the chosen value.',
      steps: [
        'Create a btn-toolbar with two btn-groups (formatting and alignment)',
        'Create a radio segmented control using btn-check inputs',
        'Listen to change events and print the selected view',
        'Add a vertical group',
      ],
      code: `<div class="btn-toolbar gap-2" role="toolbar" aria-label="Editor">
  <div class="btn-group" role="group" aria-label="Format">
    <button class="btn btn-outline-secondary">B</button>
    <button class="btn btn-outline-secondary">I</button>
  </div>
</div>
<div class="btn-group" role="group" aria-label="View">
  <input type="radio" class="btn-check" name="view" id="list" value="list" checked>
  <label class="btn btn-outline-primary" for="list">List</label>
  <input type="radio" class="btn-check" name="view" id="grid" value="grid">
  <label class="btn btn-outline-primary" for="grid">Grid</label>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="btn-toolbar gap-2 mb-3" role="toolbar" aria-label="Editor toolbar">
    <div class="btn-group" role="group" aria-label="Formatting">
      <button type="button" class="btn btn-outline-secondary fw-bold">B</button>
      <button type="button" class="btn btn-outline-secondary fst-italic">I</button>
      <button type="button" class="btn btn-outline-secondary text-decoration-underline">U</button>
    </div>
    <div class="btn-group btn-group-sm" role="group" aria-label="Alignment">
      <button type="button" class="btn btn-outline-dark">Left</button>
      <button type="button" class="btn btn-outline-dark">Center</button>
      <button type="button" class="btn btn-outline-dark">Right</button>
    </div>
  </div>
  <div class="btn-group mb-2" role="group" aria-label="View mode">
    <input type="radio" class="btn-check" name="view" id="list" value="list" checked>
    <label class="btn btn-outline-primary" for="list">List</label>
    <input type="radio" class="btn-check" name="view" id="grid" value="grid">
    <label class="btn btn-outline-primary" for="grid">Grid</label>
    <input type="radio" class="btn-check" name="view" id="map" value="map">
    <label class="btn btn-outline-primary" for="map">Map</label>
  </div>
  <p>Selected view: <strong id="out">list</strong></p>
  <div class="btn-group-vertical" role="group" aria-label="Vertical">
    <button type="button" class="btn btn-success">Top</button>
    <button type="button" class="btn btn-success">Middle</button>
    <button type="button" class="btn btn-success">Bottom</button>
  </div>
</div>`,
        js: `document.querySelectorAll('input[name="view"]').forEach(function (r) {
  r.addEventListener('change', function () {
    document.getElementById('out').textContent = r.value;
    console.log('View changed to', r.value);
  });
});`,
      },
      result: 'A joined B/I/U group next to a smaller alignment group, a three-part segmented switch that highlights the selected option and updates the "Selected view" text, and a vertical green group.',
      explanation: '.btn-check visually hides the real radio input; the label styled as a button reflects :checked state. Because they are real radios, they work with keyboard arrows and forms.',
    },
    {
      title: 'Badges and Dismissible / Dynamic Alerts',
      scenario: 'Show notification counts and create alerts from JavaScript when the user clicks buttons.',
      steps: [
        'Add badges in a heading and in a button',
        'Add a static dismissible alert with heading and alert-link',
        'Write a showAlert(type, msg) JS function that inserts a dismissible alert',
        'Auto-close it after 3 seconds using bootstrap.Alert',
      ],
      code: `function showAlert(type, msg) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' + msg +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  const el = wrap.firstElementChild;
  document.getElementById('alerts').append(el);
  setTimeout(() => bootstrap.Alert.getOrCreateInstance(el).close(), 3000);
}`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <h4>Messages <span class="badge text-bg-secondary">4</span> <span class="badge rounded-pill text-bg-danger">New</span></h4>
  <button type="button" class="btn btn-primary mb-3">
    Notifications <span class="badge text-bg-light">12</span>
  </button>
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    <h5 class="alert-heading">Well done!</h5>
    Your profile was updated. <a href="#" class="alert-link">View profile</a>.
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
  <div class="d-flex gap-2 mb-3">
    <button class="btn btn-outline-success btn-sm" onclick="showAlert('success','Saved!')">Success</button>
    <button class="btn btn-outline-warning btn-sm" onclick="showAlert('warning','Low balance.')">Warning</button>
    <button class="btn btn-outline-danger btn-sm" onclick="showAlert('danger','Upload failed.')">Danger</button>
  </div>
  <div id="alerts"></div>
</div>`,
        js: `function showAlert(type, msg) {
  const wrap = document.createElement('div');
  wrap.innerHTML = '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' + msg +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
  const el = wrap.firstElementChild;
  document.getElementById('alerts').append(el);
  el.addEventListener('closed.bs.alert', function () { console.log('Alert closed:', msg); });
  setTimeout(function () { bootstrap.Alert.getOrCreateInstance(el).close(); }, 3000);
}
window.showAlert = showAlert;`,
      },
      result: 'A heading with grey and red pill badges, a button with a counter, a green dismissible alert, and three buttons that each add a coloured alert which fades out after 3 seconds (console logs when closed).',
      explanation: 'data-bs-dismiss works for dynamically added alerts because Bootstrap uses event delegation on document. Alert.getOrCreateInstance creates or reuses the component instance; close() removes .show (fade) then removes the element and fires closed.bs.alert.',
    },
    {
      title: 'Spinners, Loading Button and Live Progress Bar',
      scenario: 'Simulate a file upload: the button shows a spinner and the progress bar fills to 100%.',
      steps: [
        'Show border and grow spinners in several colours',
        'Create a progress bar with role="progressbar" on the wrapper',
        'On button click, disable the button, show a small spinner and increase width with setInterval',
        'At 100% switch the bar to green and restore the button',
      ],
      code: `<div class="progress" role="progressbar" aria-label="Upload" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100">
  <div class="progress-bar progress-bar-striped progress-bar-animated" style="width:0%">0%</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3">
  <div class="d-flex gap-3 align-items-center mb-4">
    <div class="spinner-border text-primary" role="status"><span class="visually-hidden">Loading...</span></div>
    <div class="spinner-border spinner-border-sm text-danger" role="status"><span class="visually-hidden">Loading...</span></div>
    <div class="spinner-grow text-success" role="status"><span class="visually-hidden">Loading...</span></div>
    <div class="spinner-grow spinner-grow-sm text-warning" role="status"><span class="visually-hidden">Loading...</span></div>
  </div>
  <button id="up" class="btn btn-primary mb-3" type="button">Upload file</button>
  <div id="prog" class="progress mb-3" role="progressbar" aria-label="Upload progress" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="height: 22px">
    <div id="bar" class="progress-bar progress-bar-striped progress-bar-animated" style="width: 0%">0%</div>
  </div>
  <div class="progress-stacked">
    <div class="progress" role="progressbar" aria-label="HTML" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100" style="width: 40%"><div class="progress-bar bg-warning">HTML 40%</div></div>
    <div class="progress" role="progressbar" aria-label="CSS" aria-valuenow="35" aria-valuemin="0" aria-valuemax="100" style="width: 35%"><div class="progress-bar bg-info">CSS 35%</div></div>
    <div class="progress" role="progressbar" aria-label="JS" aria-valuenow="25" aria-valuemin="0" aria-valuemax="100" style="width: 25%"><div class="progress-bar bg-success">JS 25%</div></div>
  </div>
</div>`,
        js: `const btn = document.getElementById('up');
const bar = document.getElementById('bar');
const prog = document.getElementById('prog');
btn.addEventListener('click', function () {
  let p = 0;
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Uploading...';
  bar.classList.remove('bg-success');
  const t = setInterval(function () {
    p += 10;
    bar.style.width = p + '%';
    bar.textContent = p + '%';
    prog.setAttribute('aria-valuenow', p);
    if (p >= 100) {
      clearInterval(t);
      bar.classList.add('bg-success');
      btn.disabled = false;
      btn.textContent = 'Upload again';
      console.log('Upload complete');
    }
  }, 300);
});`,
      },
      result: 'Four animated spinners. Clicking Upload shows a spinner inside the disabled button while a striped bar fills in 10% steps and turns green at 100%. Below, a stacked bar shows three coloured segments.',
      explanation: 'Progress is driven only by the width style of .progress-bar. aria-valuenow keeps screen readers in sync. .progress-stacked lets multiple .progress elements share one track (5.3 markup).',
    },
  ],
  interview: [
    { q: 'What classes are needed for a Bootstrap button?', a: 'The base .btn plus a variant like .btn-primary or .btn-outline-primary; optionally a size .btn-lg/.btn-sm.', level: 'Easy' },
    { q: 'How do you disable an anchor styled as a button?', a: 'Add .disabled class, aria-disabled="true" and tabindex="-1" (and ideally remove href). Anchors do not support the disabled attribute.', level: 'Medium' },
    { q: 'How do you make a full-width button that is inline on larger screens?', a: 'Wrap buttons in <div class="d-grid gap-2 d-md-block">; on mobile they stretch, from md they display inline.', level: 'Medium' },
    { q: 'What is .btn-check used for?', a: 'It visually hides a checkbox/radio input so a following <label class="btn"> acts as a toggle button, keeping native form and keyboard behaviour.', level: 'Medium' },
    { q: 'Difference between .btn-group and .btn-toolbar?', a: '.btn-group joins individual buttons into one control; .btn-toolbar combines multiple button groups (and inputs) into a toolbar.', level: 'Easy' },
    { q: 'How do you create a dismissible alert?', a: 'Add .alert-dismissible .fade .show to the alert and include <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close">. The JS bundle handles closing.', level: 'Easy' },
    { q: 'How do you close an alert programmatically?', a: 'bootstrap.Alert.getOrCreateInstance(element).close(). Listen to closed.bs.alert to run code after it is removed.', level: 'Medium' },
    { q: 'How do you make spinners accessible?', a: 'Add role="status" and a .visually-hidden text like "Loading...". When inside a button with visible text, mark the spinner aria-hidden="true".', level: 'Medium' },
    { q: 'How do you update a progress bar with JavaScript?', a: 'Change the .progress-bar style width (e.g. "60%"), update its text, and update aria-valuenow on the element with role="progressbar".', level: 'Easy' },
    { q: 'What changed in progress bar markup in Bootstrap 5.3?', a: 'role="progressbar" and aria-* attributes move to the outer .progress element, and multiple bars use a .progress-stacked wrapper with several .progress children.', level: 'Hard' },
    { q: 'What is the difference between badge text-bg-primary and badge bg-primary?', a: 'text-bg-primary also sets a contrasting text colour automatically; bg-primary only sets the background so you may need text-white/dark yourself.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a "Delete" button that, when clicked, shows a spinner for 2 seconds then turns into a disabled "Deleted" success button.',
      hint: 'setTimeout, change className and innerHTML.',
      solution: `<button id="del" class="btn btn-danger" type="button">Delete</button>
<script>
const del = document.getElementById('del');
del.addEventListener('click', () => {
  del.disabled = true;
  del.innerHTML = '<span class="spinner-border spinner-border-sm" aria-hidden="true"></span> Deleting...';
  setTimeout(() => {
    del.className = 'btn btn-success';
    del.textContent = 'Deleted';
  }, 2000);
});
</script>`,
    },
    {
      task: 'Build a pagination-like rating selector (1–5) using radio btn-check inside a btn-group.',
      hint: 'Five radio inputs with btn-check and labels btn-outline-warning.',
      solution: `<div class="btn-group" role="group" aria-label="Rating">
  <input type="radio" class="btn-check" name="r" id="r1"><label class="btn btn-outline-warning" for="r1">1</label>
  <input type="radio" class="btn-check" name="r" id="r2"><label class="btn btn-outline-warning" for="r2">2</label>
  <input type="radio" class="btn-check" name="r" id="r3" checked><label class="btn btn-outline-warning" for="r3">3</label>
  <input type="radio" class="btn-check" name="r" id="r4"><label class="btn btn-outline-warning" for="r4">4</label>
  <input type="radio" class="btn-check" name="r" id="r5"><label class="btn btn-outline-warning" for="r5">5</label>
</div>`,
    },
    {
      task: 'Show a cart icon button with a red counter badge in its corner and visually hidden text "items in cart".',
      hint: 'position-relative + position-absolute top-0 start-100 translate-middle.',
      solution: `<button type="button" class="btn btn-outline-dark position-relative">
  Cart
  <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
    3 <span class="visually-hidden">items in cart</span>
  </span>
</button>`,
    },
    {
      task: 'Create a skills section with four progress bars (HTML 90, CSS 80, JS 70, React 60) with different colours and labels.',
      hint: 'One .progress per skill; colours via bg-*.',
      solution: `<div class="mb-2">HTML</div>
<div class="progress mb-3" role="progressbar" aria-label="HTML" aria-valuenow="90" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-danger" style="width:90%">90%</div></div>
<div class="mb-2">CSS</div>
<div class="progress mb-3" role="progressbar" aria-label="CSS" aria-valuenow="80" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-primary" style="width:80%">80%</div></div>
<div class="mb-2">JavaScript</div>
<div class="progress mb-3" role="progressbar" aria-label="JS" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar text-bg-warning" style="width:70%">70%</div></div>
<div class="mb-2">React</div>
<div class="progress" role="progressbar" aria-label="React" aria-valuenow="60" aria-valuemin="0" aria-valuemax="100"><div class="progress-bar bg-info" style="width:60%">60%</div></div>`,
    },
    {
      task: 'Write a form submit handler that shows a red dismissible alert if the input is empty and a green one otherwise.',
      hint: 'Build the alert HTML string and insert it into a container.',
      solution: `<form id="f" class="d-flex gap-2 mb-2"><input id="name" class="form-control" placeholder="Name"><button class="btn btn-primary">Send</button></form>
<div id="msg"></div>
<script>
document.getElementById('f').addEventListener('submit', e => {
  e.preventDefault();
  const v = document.getElementById('name').value.trim();
  const type = v ? 'success' : 'danger';
  const text = v ? 'Thanks, ' + v + '!' : 'Name is required.';
  document.getElementById('msg').innerHTML =
    '<div class="alert alert-' + type + ' alert-dismissible fade show" role="alert">' + text +
    '<button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button></div>';
});
</script>`,
    },
  ],
  quiz: [
    { question: 'Which class creates a transparent button with a coloured border?', options: ['btn-border-primary', 'btn-primary-outline', 'btn-outline-primary', 'btn-ghost-primary'], answer: 2, explanation: 'Outline variants are btn-outline-{color}.' },
    { question: 'Which attribute closes an alert via the data API?', options: ['data-bs-dismiss="alert"', 'data-close="alert"', 'data-bs-toggle="alert"', 'onclick="close()"'], answer: 0, explanation: 'data-bs-dismiss="alert" on a button inside the alert.' },
    { question: 'What makes a progress bar animate its stripes?', options: ['progress-animated', 'progress-bar-striped progress-bar-animated', 'bar-move', 'progress-bar-live'], answer: 1, explanation: 'Both classes are required: stripes, then animation.' },
    { question: 'Which spinner is a pulsing dot?', options: ['spinner-border', 'spinner-dot', 'spinner-pulse', 'spinner-grow'], answer: 3, explanation: 'spinner-grow scales a circle in and out.' },
    { question: 'A button inside a form without a type attribute will:', options: ['Do nothing', 'Submit the form', 'Reset the form', 'Throw an error'], answer: 1, explanation: 'The default type is submit.' },
  ],
};
