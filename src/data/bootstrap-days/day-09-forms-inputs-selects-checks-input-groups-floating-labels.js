export default {
  id: 'day-09-forms-inputs-selects-checks-input-groups-floating-labels',
  title: 'Forms: Inputs, Selects, Checks, Input Groups, Floating Labels and Layout',
  module: 'Module 2: Components',
  day: 9,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Style every kind of form control with Bootstrap: text inputs, textareas, file and colour inputs, selects, checkboxes, radios, switches, ranges, input groups, floating labels, and arrange them with grid, horizontal and inline layouts.',
  objectives: [
    'Style inputs, textareas, selects and file inputs with form-control and form-select',
    'Create checkboxes, radios, switches and inline checks with form-check',
    'Use input groups for prefixes/suffixes and floating labels for compact forms',
    'Lay out forms with the grid: stacked, multi-column, horizontal and inline',
    'Use helper text, sizing, readonly, disabled fieldsets and range inputs correctly',
  ],
  theory: [
    {
      heading: 'Form Controls: form-control and form-select',
      content: 'Every text-like input gets `.form-control`: `<input type="text|email|password|number|date|search|tel|url">`, `<textarea>` and `<input type="file">`.\n\n- `.form-label` on `<label>` (with `for` matching the input `id`)\n- `.form-text` for help text below (link it with `aria-describedby`)\n- Sizes: `.form-control-lg`, `.form-control-sm`\n- `readonly` attribute; `.form-control-plaintext` shows a readonly value as plain text\n- `.form-control-color` for `<input type="color">`\n- `<select class="form-select">`, with `multiple` or `size` options, sizes `.form-select-lg/sm`\n- `<datalist>` works with `.form-control` for autocomplete suggestions\n\nAnalogy: `.form-control` is a standard uniform; whatever input type, it looks consistent: full width, padding, rounded border and a blue focus glow.',
      syntax: `<div class="mb-3">
  <label for="email" class="form-label">Email address</label>
  <input type="email" class="form-control" id="email" aria-describedby="emailHelp" placeholder="name@example.com">
  <div id="emailHelp" class="form-text">We'll never share your email.</div>
</div>`,
      tip: 'A placeholder is NOT a label. Placeholders disappear when typing and have low contrast. Always include a <label> (visible or .visually-hidden).',
    },
    {
      heading: 'Checks, Radios, Switches and Range',
      content: 'Wrap each input + label in `.form-check`:\n\n- Input: `.form-check-input`; label: `.form-check-label`\n- Radios in a group share the same `name`\n- **Switch**: add `.form-switch` to the wrapper and `role="switch"` to the checkbox\n- **Inline**: `.form-check-inline`\n- **Reverse** (label on the left): `.form-check-reverse`\n- Without labels: `.form-check-input` with `aria-label`\n- Indeterminate state: set `checkbox.indeterminate = true` with JS\n- Toggle buttons: `.btn-check` (Day 6)\n\n**Range**: `<input type="range" class="form-range" min="0" max="100" step="5">`.',
    },
    {
      heading: 'Input Groups',
      content: 'Input groups attach text, icons or buttons to the side of an input:\n\n```\n<div class="input-group">\n  <span class="input-group-text">@</span>\n  <input type="text" class="form-control" placeholder="Username">\n</div>\n```\n\n- Text on either or both sides: `.input-group-text`\n- Buttons: `<button class="btn btn-outline-secondary">` directly inside\n- Dropdown buttons inside an input group\n- Multiple inputs: two `.form-control` inside one group\n- Checkbox/radio in front: `<div class="input-group-text"><input class="form-check-input mt-0" type="checkbox"></div>`\n- Sizes: `.input-group-lg`, `.input-group-sm`\n- `.flex-nowrap` to prevent wrapping\n\nTypical uses: currency (Rs / .00), username (@), search with button, password with show/hide button, URL prefixes.',
    },
    {
      heading: 'Floating Labels',
      content: 'Floating labels place the label inside the input; when you type or focus, it floats up and shrinks.\n\n```\n<div class="form-floating mb-3">\n  <input type="email" class="form-control" id="fEmail" placeholder="name@example.com">\n  <label for="fEmail">Email address</label>\n</div>\n```\n\nRules:\n1. Wrapper `.form-floating`\n2. The **input comes before the label** in the HTML\n3. The input **must have a placeholder** (any text; it is hidden) because the CSS uses `:placeholder-shown`\n4. Works with `<textarea>` (set a height via style) and `<select class="form-select">`\n5. Can be used inside input groups (`.form-floating` inside `.input-group`)',
      tip: 'Floating label not floating? You probably forgot the placeholder or put the label before the input.',
    },
    {
      heading: 'Form Layout',
      content: '- **Stacked** (default): each control in `.mb-3`\n- **Grid**: `.row.g-3` with `.col-md-6` etc. for multi-column forms\n- **Horizontal**: `.row` per field with `<label class="col-sm-2 col-form-label">` and the control in `.col-sm-10`\n- **Inline / auto-sized**: `.row.row-cols-lg-auto.g-3.align-items-center`\n- `.col-form-label-lg/sm` match label padding to input sizes\n- **Disabled**: `disabled` on an input, or `<fieldset disabled>` to disable everything inside\n- Group related fields with `<fieldset>` and `<legend class="col-form-label">` (required for radio groups for accessibility)',
      points: [
        'Every input needs an id and a label with matching for',
        'Use the correct type (email, tel, number, date) for mobile keyboards and built-in validation',
        'Coming next (Day 10): form validation with HTML5 attributes, Bootstrap styles and JS',
      ],
    },
  ],
  examples: [
    {
      title: 'Registration Form with Grid Layout and All Control Types',
      scenario: 'A student registration form with two-column fields on md+, selects, radios, checkboxes, a switch, file upload and range.',
      steps: [
        'Create form.row.g-3 with col-md-6 fields for first/last name',
        'Add email with help text, date, gender radios (inline), course select',
        'Add interests checkboxes, a newsletter switch, a file input and a range with live value',
        'On submit, prevent reload and log the FormData as an object',
      ],
      code: `<form class="row g-3">
  <div class="col-md-6">
    <label for="fn" class="form-label">First name</label>
    <input id="fn" name="first" class="form-control">
  </div>
  <div class="col-md-6">
    <label for="course" class="form-label">Course</label>
    <select id="course" name="course" class="form-select">
      <option selected disabled value="">Choose...</option>
      <option>Web Development</option>
    </select>
  </div>
  <div class="col-12">
    <div class="form-check form-switch">
      <input class="form-check-input" type="checkbox" role="switch" id="news" name="news">
      <label class="form-check-label" for="news">Subscribe to newsletter</label>
    </div>
  </div>
</form>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:720px">
  <h4 class="mb-3">Student Registration</h4>
  <form id="reg" class="row g-3">
    <div class="col-md-6"><label for="fn" class="form-label">First name</label><input id="fn" name="first" class="form-control" value="Asha"></div>
    <div class="col-md-6"><label for="ln" class="form-label">Last name</label><input id="ln" name="last" class="form-control" value="Patil"></div>
    <div class="col-md-8">
      <label for="em" class="form-label">Email</label>
      <input id="em" name="email" type="email" class="form-control" aria-describedby="emHelp" placeholder="you@example.com">
      <div id="emHelp" class="form-text">We send the admission letter here.</div>
    </div>
    <div class="col-md-4"><label for="dob" class="form-label">Date of birth</label><input id="dob" name="dob" type="date" class="form-control"></div>
    <fieldset class="col-md-6">
      <legend class="col-form-label pt-0">Gender</legend>
      <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="gender" id="gF" value="female" checked><label class="form-check-label" for="gF">Female</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="gender" id="gM" value="male"><label class="form-check-label" for="gM">Male</label></div>
      <div class="form-check form-check-inline"><input class="form-check-input" type="radio" name="gender" id="gO" value="other"><label class="form-check-label" for="gO">Other</label></div>
    </fieldset>
    <div class="col-md-6">
      <label for="course" class="form-label">Course</label>
      <select id="course" name="course" class="form-select">
        <option value="web">Web Development</option><option value="data">Data Science</option><option value="java">Java Full Stack</option>
      </select>
    </div>
    <fieldset class="col-12">
      <legend class="col-form-label pt-0">Interests</legend>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="interests" value="frontend" id="i1" checked><label class="form-check-label" for="i1">Frontend</label></div>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="interests" value="backend" id="i2"><label class="form-check-label" for="i2">Backend</label></div>
      <div class="form-check"><input class="form-check-input" type="checkbox" name="interests" value="design" id="i3" disabled><label class="form-check-label" for="i3">Design (full)</label></div>
    </fieldset>
    <div class="col-md-6"><label for="photo" class="form-label">Photo</label><input id="photo" name="photo" type="file" class="form-control form-control-sm" accept="image/*"></div>
    <div class="col-md-6">
      <label for="hrs" class="form-label">Study hours per week: <strong id="hrsVal">10</strong></label>
      <input id="hrs" name="hours" type="range" class="form-range" min="0" max="40" step="2" value="10">
    </div>
    <div class="col-12">
      <div class="form-check form-switch"><input class="form-check-input" type="checkbox" role="switch" id="news" name="news" checked><label class="form-check-label" for="news">Subscribe to newsletter</label></div>
    </div>
    <div class="col-12"><button class="btn btn-primary" type="submit">Register</button></div>
  </form>
</div>`,
        js: `document.getElementById('hrs').addEventListener('input', function (e) {
  document.getElementById('hrsVal').textContent = e.target.value;
});
document.getElementById('reg').addEventListener('submit', function (e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = {};
  fd.forEach(function (v, k) {
    if (v instanceof File) v = v.name || '(none)';
    if (k in data) data[k] = [].concat(data[k], v); else data[k] = v;
  });
  console.log(JSON.stringify(data, null, 2));
});`,
      },
      result: 'A tidy two-column form (single column on phones) with every control type. Moving the range updates the hour count. Submitting logs a JSON object like {"first":"Asha","last":"Patil",...,"interests":"frontend","news":"on"}.',
      explanation: 'row g-3 + col-md-* gives the responsive grid. fieldset/legend group radios and checkboxes for screen readers. FormData collects values by name; unchecked boxes are omitted and disabled inputs are never submitted.',
    },
    {
      title: 'Input Groups: Currency, Username, Search and Password Toggle',
      scenario: 'Build common real-world input groups including a show/hide password button.',
      steps: [
        'Create @username with a left addon',
        'Create Rs amount .00 with addons on both sides',
        'Create a search box with an attached button',
        'Create a password field with an eye button that toggles the type with JS',
      ],
      code: `<div class="input-group">
  <input type="password" id="pw" class="form-control" placeholder="Password" aria-label="Password">
  <button class="btn btn-outline-secondary" type="button" id="togglePw" aria-label="Show password">
    <i class="bi bi-eye" aria-hidden="true"></i>
  </button>
</div>`,
      playground: {
        libs: ['bootstrap', 'bootstrap-icons'],
        html: `<div class="container py-3" style="max-width:520px">
  <div class="input-group mb-3">
    <span class="input-group-text" id="at">@</span>
    <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="at">
  </div>
  <div class="input-group mb-3">
    <span class="input-group-text">Rs</span>
    <input type="number" class="form-control" aria-label="Amount in rupees" value="500">
    <span class="input-group-text">.00</span>
  </div>
  <div class="input-group mb-3">
    <input type="search" class="form-control" placeholder="Search courses" aria-label="Search courses">
    <button class="btn btn-primary" type="button"><i class="bi bi-search" aria-hidden="true"></i> Search</button>
  </div>
  <div class="input-group mb-3">
    <span class="input-group-text"><i class="bi bi-lock" aria-hidden="true"></i></span>
    <input type="password" id="pw" class="form-control" value="secret123" aria-label="Password">
    <button class="btn btn-outline-secondary" type="button" id="togglePw" aria-label="Show password"><i class="bi bi-eye" aria-hidden="true"></i></button>
  </div>
  <div class="input-group input-group-sm mb-3">
    <span class="input-group-text">https://</span>
    <input type="text" class="form-control" placeholder="example" aria-label="Site">
    <span class="input-group-text">.com</span>
  </div>
  <div class="input-group">
    <div class="input-group-text"><input class="form-check-input mt-0" type="checkbox" aria-label="Enable coupon"></div>
    <input type="text" class="form-control" placeholder="Coupon code" aria-label="Coupon code">
    <button class="btn btn-success" type="button">Apply</button>
  </div>
</div>`,
        js: `const pw = document.getElementById('pw');
const btn = document.getElementById('togglePw');
btn.addEventListener('click', function () {
  const show = pw.type === 'password';
  pw.type = show ? 'text' : 'password';
  btn.innerHTML = '<i class="bi ' + (show ? 'bi-eye-slash' : 'bi-eye') + '" aria-hidden="true"></i>';
  btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  console.log('Password visible:', show);
});`,
      },
      result: 'Six joined input groups: @username, Rs 500 .00, search with button, password with lock icon and eye toggle (click to reveal "secret123"), a small URL field and a coupon field with checkbox and Apply button.',
      explanation: 'The .input-group is a flex container; children lose their inner border radius so they look like one control. Changing input.type between password and text reveals or hides characters.',
    },
    {
      title: 'Floating Labels Login Form',
      scenario: 'A modern compact login card using floating labels for input, select and textarea.',
      steps: [
        'Wrap each control in .form-floating',
        'Write the input BEFORE the label and give it a placeholder',
        'Add a floating select and a floating textarea with fixed height',
        'Add a "Remember me" checkbox and submit button',
      ],
      code: `<div class="form-floating mb-3">
  <input type="email" class="form-control" id="lEmail" placeholder="name@example.com">
  <label for="lEmail">Email address</label>
</div>
<div class="form-floating">
  <select class="form-select" id="role"><option>Student</option><option>Teacher</option></select>
  <label for="role">Login as</label>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-4">
  <form class="mx-auto border rounded-4 p-4 shadow-sm" style="max-width:380px" onsubmit="event.preventDefault(); console.log('Logging in as', this.email.value, '/', this.role.value)">
    <h4 class="mb-3 text-center">Sign in</h4>
    <div class="form-floating mb-3">
      <input type="email" class="form-control" id="lEmail" name="email" placeholder="name@example.com">
      <label for="lEmail">Email address</label>
    </div>
    <div class="form-floating mb-3">
      <input type="password" class="form-control" id="lPw" name="pw" placeholder="Password">
      <label for="lPw">Password</label>
    </div>
    <div class="form-floating mb-3">
      <select class="form-select" id="role" name="role">
        <option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option>
      </select>
      <label for="role">Login as</label>
    </div>
    <div class="form-floating mb-3">
      <textarea class="form-control" id="note" placeholder="Note" style="height: 90px"></textarea>
      <label for="note">Note for admin (optional)</label>
    </div>
    <div class="form-check mb-3"><input class="form-check-input" type="checkbox" id="rem"><label class="form-check-label" for="rem">Remember me</label></div>
    <button class="btn btn-primary w-100 py-2" type="submit">Sign in</button>
  </form>
</div>`,
      },
      result: 'A centred card where labels sit inside the fields and slide up when you click or type. Submitting logs "Logging in as ... / student".',
      explanation: 'The CSS uses .form-control:focus ~ label and :not(:placeholder-shown) ~ label to float the label, which is why the label must come after the input and a placeholder must exist.',
    },
    {
      title: 'Horizontal Form, Inline Form and Disabled Fieldset',
      scenario: 'An admin settings form with labels beside inputs, a one-line filter bar, and a section disabled until the user enables editing.',
      steps: [
        'Horizontal: .row.mb-3 > label.col-sm-3.col-form-label + div.col-sm-9',
        'Inline: .row.row-cols-lg-auto.g-2.align-items-center',
        'Wrap fields in <fieldset disabled id="fs"> and enable it with a switch via JS',
        'Show a readonly plaintext field',
      ],
      code: `<div class="row mb-3">
  <label for="hEmail" class="col-sm-3 col-form-label">Email</label>
  <div class="col-sm-9"><input type="email" class="form-control" id="hEmail"></div>
</div>
<form class="row row-cols-lg-auto g-2 align-items-center">...</form>
<fieldset disabled>...</fieldset>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:680px">
  <h6>Inline filter bar</h6>
  <form class="row row-cols-lg-auto g-2 align-items-center mb-4" onsubmit="event.preventDefault()">
    <div class="col-12"><label class="visually-hidden" for="q">Search</label><input id="q" class="form-control" placeholder="Name"></div>
    <div class="col-12"><label class="visually-hidden" for="st">Status</label><select id="st" class="form-select"><option>All</option><option>Active</option><option>Blocked</option></select></div>
    <div class="col-12"><button class="btn btn-dark">Filter</button></div>
  </form>
  <div class="form-check form-switch mb-3">
    <input class="form-check-input" type="checkbox" role="switch" id="edit">
    <label class="form-check-label" for="edit">Enable editing</label>
  </div>
  <fieldset id="fs" disabled>
    <div class="row mb-3">
      <label class="col-sm-3 col-form-label">User ID</label>
      <div class="col-sm-9"><input type="text" readonly class="form-control-plaintext" value="USR-1024"></div>
    </div>
    <div class="row mb-3">
      <label for="hName" class="col-sm-3 col-form-label">Name</label>
      <div class="col-sm-9"><input id="hName" class="form-control" value="Rahul Sharma"></div>
    </div>
    <div class="row mb-3">
      <label for="hEmail" class="col-sm-3 col-form-label">Email</label>
      <div class="col-sm-9"><input id="hEmail" type="email" class="form-control" value="rahul@example.com"></div>
    </div>
    <div class="row mb-3">
      <label for="hColor" class="col-sm-3 col-form-label">Theme colour</label>
      <div class="col-sm-9"><input id="hColor" type="color" class="form-control form-control-color" value="#0d6efd"></div>
    </div>
    <div class="row"><div class="col-sm-9 offset-sm-3"><button type="button" class="btn btn-primary">Save</button></div></div>
  </fieldset>
</div>`,
        js: `document.getElementById('edit').addEventListener('change', function (e) {
  document.getElementById('fs').disabled = !e.target.checked;
  console.log('Editing', e.target.checked ? 'enabled' : 'disabled');
});`,
      },
      result: 'A single-line filter bar on wide screens (stacked on narrow), then a horizontal form whose inputs are greyed out until the "Enable editing" switch is turned on. The User ID is shown as plain read-only text.',
      explanation: 'row-cols-lg-auto makes each column content-width from lg. col-form-label vertically aligns labels with inputs. Setting fieldset.disabled toggles all descendant controls at once.',
    },
  ],
  interview: [
    { q: 'Which class do you use for text inputs and which for selects?', a: '.form-control for inputs, textareas and file inputs; .form-select for <select> elements.', level: 'Easy' },
    { q: 'How do you create a toggle switch in Bootstrap?', a: 'A checkbox inside <div class="form-check form-switch"> with class form-check-input and role="switch", plus a .form-check-label.', level: 'Easy' },
    { q: 'What are the requirements for floating labels?', a: 'Wrap in .form-floating, put the input/select/textarea before the label, and give the input a placeholder because the floating effect relies on :placeholder-shown.', level: 'Medium' },
    { q: 'What is an input group?', a: 'A .input-group wrapper that joins an input with addons (.input-group-text), buttons or dropdowns on either side into one control, e.g. "@" + username or input + Search button.', level: 'Easy' },
    { q: 'How do you build a horizontal form?', a: 'Each field is a .row; the label gets .col-sm-* .col-form-label and the input is wrapped in a .col-sm-* column.', level: 'Medium' },
    { q: 'How do you disable a whole group of form fields?', a: 'Wrap them in <fieldset disabled>. All controls inside become disabled (and are not submitted).', level: 'Easy' },
    { q: 'Why should you not use placeholder instead of a label?', a: 'Placeholders vanish when typing, have low contrast, and are not reliably announced as labels by assistive technologies. Use a visible label or a visually-hidden one.', level: 'Medium' },
    { q: 'What is .form-control-plaintext?', a: 'Used with readonly inputs to remove the form-control border and background, showing the value as plain text aligned with other form fields.', level: 'Medium' },
    { q: 'How do you link help text to an input for screen readers?', a: 'Give the help text an id and add aria-describedby="thatId" to the input.', level: 'Medium' },
    { q: 'How do you make radio buttons appear on one line?', a: 'Add .form-check-inline to each .form-check wrapper.', level: 'Easy' },
    { q: 'How can you put a checkbox at the start of an input group?', a: '<div class="input-group-text"><input class="form-check-input mt-0" type="checkbox" aria-label="..."></div> followed by the input.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Build a contact form: name and email side-by-side on md, subject select, message textarea, "Send me a copy" checkbox and submit.',
      hint: 'row g-3, col-md-6, form-select, textarea rows="4".',
      solution: `<form class="row g-3">
  <div class="col-md-6"><label for="cn" class="form-label">Name</label><input id="cn" class="form-control"></div>
  <div class="col-md-6"><label for="ce" class="form-label">Email</label><input id="ce" type="email" class="form-control"></div>
  <div class="col-12"><label for="cs" class="form-label">Subject</label>
    <select id="cs" class="form-select"><option>General</option><option>Support</option><option>Billing</option></select></div>
  <div class="col-12"><label for="cm" class="form-label">Message</label><textarea id="cm" class="form-control" rows="4"></textarea></div>
  <div class="col-12"><div class="form-check"><input id="cc" class="form-check-input" type="checkbox"><label for="cc" class="form-check-label">Send me a copy</label></div></div>
  <div class="col-12"><button class="btn btn-primary">Send</button></div>
</form>`,
    },
    {
      task: 'Create a price filter with two number inputs (min, max) in one input group with Rs prefix and a "Go" button.',
      hint: 'Two form-control in one input-group.',
      solution: `<div class="input-group">
  <span class="input-group-text">Rs</span>
  <input type="number" class="form-control" placeholder="Min" aria-label="Minimum price">
  <input type="number" class="form-control" placeholder="Max" aria-label="Maximum price">
  <button class="btn btn-outline-primary" type="button">Go</button>
</div>`,
    },
    {
      task: 'Create a floating-label address form: street, city (col-md-6), state select (col-md-4), PIN (col-md-2).',
      hint: 'Each col contains .form-floating; inputs need placeholder.',
      solution: `<form class="row g-2">
  <div class="col-12 form-floating"><input id="st" class="form-control" placeholder="Street"><label for="st">Street</label></div>
  <div class="col-md-6 form-floating"><input id="ct" class="form-control" placeholder="City"><label for="ct">City</label></div>
  <div class="col-md-4 form-floating"><select id="sta" class="form-select"><option>Maharashtra</option><option>Karnataka</option></select><label for="sta">State</label></div>
  <div class="col-md-2 form-floating"><input id="pin" class="form-control" placeholder="PIN" inputmode="numeric"><label for="pin">PIN</label></div>
</form>`,
    },
    {
      task: 'Add a "Select all" checkbox that checks/unchecks three item checkboxes and shows the indeterminate state when only some are checked.',
      hint: 'checkbox.indeterminate = true when 0 < checked < total.',
      solution: `<div class="form-check"><input class="form-check-input" type="checkbox" id="all"><label class="form-check-label" for="all">Select all</label></div>
<div class="ms-4">
  <div class="form-check"><input class="form-check-input item" type="checkbox" id="a1"><label class="form-check-label" for="a1">Item 1</label></div>
  <div class="form-check"><input class="form-check-input item" type="checkbox" id="a2"><label class="form-check-label" for="a2">Item 2</label></div>
  <div class="form-check"><input class="form-check-input item" type="checkbox" id="a3"><label class="form-check-label" for="a3">Item 3</label></div>
</div>
<script>
const all = document.getElementById('all');
const items = [...document.querySelectorAll('.item')];
all.addEventListener('change', () => items.forEach(i => i.checked = all.checked));
items.forEach(i => i.addEventListener('change', () => {
  const n = items.filter(x => x.checked).length;
  all.checked = n === items.length;
  all.indeterminate = n > 0 && n < items.length;
}));
</script>`,
    },
  ],
  quiz: [
    { question: 'Which class styles a <select> element?', options: ['form-control', 'form-select', 'select-control', 'custom-select'], answer: 1, explanation: 'Bootstrap 5 uses form-select (custom-select was Bootstrap 4).' },
    { question: 'In a floating label, which order is correct?', options: ['label then input', 'input inside label', 'input then label', 'Any order'], answer: 2, explanation: 'The sibling selector ~ requires the input to come first.' },
    { question: 'Which class turns a checkbox into a switch?', options: ['form-switch on the .form-check wrapper', 'form-toggle', 'switch-input', 'btn-check'], answer: 0, explanation: 'Add form-switch to the wrapper div.' },
    { question: 'Which element adds a static "@" before an input in an input group?', options: ['<span class="input-addon">', '<span class="addon-text">', '<span class="form-text">', '<span class="input-group-text">'], answer: 3, explanation: 'input-group-text styles addons.' },
    { question: 'Which class vertically aligns a label beside an input in a horizontal form?', options: ['form-label', 'col-form-label', 'label-inline', 'align-middle'], answer: 1, explanation: 'col-form-label adds matching padding-top/bottom.' },
  ],
};
