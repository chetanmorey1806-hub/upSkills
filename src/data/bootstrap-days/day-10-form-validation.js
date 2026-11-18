export default {
  id: 'day-10-form-validation',
  title: 'Form Validation: HTML5 Constraints, Bootstrap Validation Styles and JavaScript',
  module: 'Module 2: Components',
  day: 10,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Validate forms the Bootstrap way: use HTML5 constraint attributes, turn off the browser bubbles with novalidate, show styled feedback with .was-validated, .is-valid/.is-invalid and feedback messages, and add custom JavaScript rules like password match.',
  objectives: [
    'Use HTML5 constraints: required, type, minlength, maxlength, min, max, pattern',
    'Apply Bootstrap\'s validation pattern with novalidate, checkValidity() and .was-validated',
    'Show .valid-feedback, .invalid-feedback and tooltip feedback messages',
    'Validate manually with .is-valid / .is-invalid for server-side or custom rules',
    'Add custom rules with setCustomValidity() and give accessible error messages',
  ],
  theory: [
    {
      heading: 'Why Validate and Where',
      content: '**Validation** checks that user input is complete and in the right format before it is used.\n\n- **Client-side** (browser): instant feedback, fewer bad requests, better UX\n- **Server-side**: the real security check; client-side checks can be bypassed with DevTools or curl\n\nAlways do both. Bootstrap only helps with the **client-side display**.\n\nAnalogy: client-side validation is the receptionist checking you filled every field of the form; server-side validation is the bank manager verifying your documents. The receptionist saves time but the manager decides.',
      tip: 'Never trust client-side validation for security. A user can remove `required` in DevTools in seconds.',
    },
    {
      heading: 'HTML5 Constraint Validation',
      content: 'The browser understands these attributes and computes each field\'s `validity` state:\n\n- `required` – must not be empty\n- `type="email" | "url" | "number"` – format checks\n- `minlength`, `maxlength` – text length\n- `min`, `max`, `step` – numbers and dates\n- `pattern="[0-9]{10}"` – regular expression (whole value must match)\n\nJavaScript API:\n- `form.checkValidity()` / `input.checkValidity()` → true/false\n- `input.validity` → object with `valueMissing`, `typeMismatch`, `tooShort`, `patternMismatch`, `rangeUnderflow`, `customError`, `valid`…\n- `input.validationMessage` → browser\'s message text\n- `input.setCustomValidity("message")` → mark invalid with a custom message; `setCustomValidity("")` → valid again\n\nCSS pseudo-classes: `:valid`, `:invalid`, `:user-invalid`.',
    },
    {
      heading: 'The Bootstrap Validation Pattern',
      content: 'Bootstrap hides the browser\'s default tooltips and shows its own styled messages:\n\n1. Add `novalidate` to the `<form>` so the browser does not show its bubbles or block submit\n2. Add the class `needs-validation` (just a hook for your JS)\n3. On submit, call `form.checkValidity()`. If false, `event.preventDefault()` and `event.stopPropagation()`\n4. Add `.was-validated` to the form → Bootstrap now styles every field using `:valid` / `:invalid` (green/red border + icon) and shows the sibling `.valid-feedback` / `.invalid-feedback`\n\nThe feedback div must be a **sibling after the input** (inside the same parent), or inside `.input-group` with the class `has-validation` on the group.',
      syntax: `(() => {
  'use strict';
  const forms = document.querySelectorAll('.needs-validation');
  Array.from(forms).forEach(form => {
    form.addEventListener('submit', event => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    }, false);
  });
})();`,
    },
    {
      heading: 'Feedback Messages and Tooltips',
      content: '- `.invalid-feedback` – red text shown when the field is invalid\n- `.valid-feedback` – green text shown when valid (e.g. "Looks good!")\n- `.invalid-tooltip` / `.valid-tooltip` – floating tooltip style; the parent needs `position-relative`\n- Inside an input group: add `.has-validation` to `.input-group` so rounded corners are correct\n- Checks/radios: feedback goes after the label inside `.form-check`\n\nWrite **specific** messages: "Enter a 10-digit mobile number" is better than "Invalid input".',
    },
    {
      heading: 'Manual (Server-side / Custom) Validation with .is-valid and .is-invalid',
      content: 'Sometimes you don\'t want to style all fields at once (e.g. validate one field on blur) or the error comes from the server ("Email already taken").\n\n- Add `.is-invalid` or `.is-valid` directly to the input\n- The sibling `.invalid-feedback` shows when the input has `.is-invalid`\n- No `.was-validated` needed\n- Add `aria-invalid="true"` and link the message with `aria-describedby` for screen readers\n\nCustom rules (password confirmation, age > 18, username format) use `setCustomValidity()` so they integrate with `checkValidity()` and `:invalid` styling.',
      syntax: `confirm.addEventListener('input', () => {
  confirm.setCustomValidity(confirm.value === password.value ? '' : 'Passwords do not match');
});`,
    },
    {
      heading: 'Accessibility and UX Tips',
      content: '- Do not show red errors before the user has tried to submit or left the field\n- Keep messages next to the field and link them with `aria-describedby`\n- Focus the first invalid field after a failed submit: `form.querySelector(":invalid").focus()`\n- Don\'t rely on colour alone; Bootstrap adds icons and text\n- Use correct `type` and `autocomplete` attributes (email, tel, new-password)\n- Disable the submit button only while submitting, not as a validation method',
      points: [
        'novalidate + checkValidity() + was-validated = the Bootstrap trio',
        'is-valid/is-invalid = per-field manual control',
        'Coming next (Day 11): JS components – modal, offcanvas, toasts, tooltips, popovers',
      ],
    },
  ],
  examples: [
    {
      title: 'Bootstrap Validation with was-validated',
      scenario: 'A course signup form that shows green/red feedback for every field when the user clicks Submit.',
      steps: [
        'Add novalidate and class needs-validation to the form',
        'Add required, minlength, type="email", pattern and min/max attributes',
        'Put .valid-feedback / .invalid-feedback after each input',
        'In JS check validity on submit and add was-validated',
      ],
      code: `<form class="row g-3 needs-validation" novalidate>
  <div class="col-md-6">
    <label for="name" class="form-label">Full name</label>
    <input id="name" class="form-control" required minlength="3">
    <div class="valid-feedback">Looks good!</div>
    <div class="invalid-feedback">Name must be at least 3 characters.</div>
  </div>
  ...
</form>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:720px">
  <form id="signup" class="row g-3 needs-validation" novalidate>
    <div class="col-md-6">
      <label for="name" class="form-label">Full name</label>
      <input id="name" class="form-control" required minlength="3">
      <div class="valid-feedback">Looks good!</div>
      <div class="invalid-feedback">Name must be at least 3 characters.</div>
    </div>
    <div class="col-md-6">
      <label for="email" class="form-label">Email</label>
      <input id="email" type="email" class="form-control" required>
      <div class="invalid-feedback">Enter a valid email like name@example.com.</div>
    </div>
    <div class="col-md-6">
      <label for="mobile" class="form-label">Mobile</label>
      <div class="input-group has-validation">
        <span class="input-group-text">+91</span>
        <input id="mobile" type="tel" class="form-control" required pattern="[6-9][0-9]{9}">
        <div class="invalid-feedback">Enter a 10-digit mobile number starting with 6-9.</div>
      </div>
    </div>
    <div class="col-md-3">
      <label for="age" class="form-label">Age</label>
      <input id="age" type="number" class="form-control" required min="16" max="60">
      <div class="invalid-feedback">Age must be 16–60.</div>
    </div>
    <div class="col-md-3">
      <label for="batch" class="form-label">Batch</label>
      <select id="batch" class="form-select" required>
        <option selected disabled value="">Choose...</option><option>Morning</option><option>Evening</option>
      </select>
      <div class="invalid-feedback">Select a batch.</div>
    </div>
    <div class="col-12">
      <div class="form-check">
        <input class="form-check-input" type="checkbox" id="terms" required>
        <label class="form-check-label" for="terms">I agree to the terms</label>
        <div class="invalid-feedback">You must agree before submitting.</div>
      </div>
    </div>
    <div class="col-12"><button class="btn btn-primary" type="submit">Submit</button></div>
  </form>
  <div id="ok" class="alert alert-success mt-3 d-none">Form submitted successfully!</div>
</div>`,
        js: `const form = document.getElementById('signup');
form.addEventListener('submit', function (event) {
  event.preventDefault();
  if (!form.checkValidity()) {
    event.stopPropagation();
    const firstBad = form.querySelector(':invalid');
    if (firstBad) firstBad.focus();
    console.log('Invalid fields:', Array.from(form.querySelectorAll(':invalid')).map(function (el) { return el.id; }).join(', '));
  } else {
    document.getElementById('ok').classList.remove('d-none');
    console.log('All fields valid');
  }
  form.classList.add('was-validated');
});`,
      },
      result: 'Clicking Submit on the empty form turns all fields red with specific messages and focuses the first one. As you fix each field it turns green; when all are valid a green success alert appears.',
      explanation: 'novalidate disables browser bubbles. After .was-validated is added, Bootstrap CSS rules like .was-validated .form-control:invalid style the fields and reveal ~ .invalid-feedback. has-validation keeps input-group corners correct.',
    },
    {
      title: 'Custom Rule: Password Strength and Confirm Password',
      scenario: 'A change-password form where the new password needs 8+ characters with a number, and confirm must match.',
      steps: [
        'Use pattern for "at least 8 chars with a digit"',
        'On input of either field, call setCustomValidity on the confirm field',
        'Show a live strength progress bar',
        'Validate on submit with was-validated',
      ],
      code: `function checkMatch() {
  confirm.setCustomValidity(confirm.value === pw.value ? '' : 'Passwords do not match');
}
pw.addEventListener('input', checkMatch);
confirm.addEventListener('input', checkMatch);`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:420px">
  <form id="pwForm" class="needs-validation" novalidate>
    <div class="mb-3">
      <label for="pw" class="form-label">New password</label>
      <input id="pw" type="password" class="form-control" required pattern="(?=.*[0-9]).{8,}" autocomplete="new-password" aria-describedby="pwHelp">
      <div id="pwHelp" class="form-text">At least 8 characters including a number.</div>
      <div class="invalid-feedback">Password must be 8+ characters and contain a number.</div>
      <div class="progress mt-2" role="progressbar" aria-label="Password strength" style="height:6px">
        <div id="strength" class="progress-bar" style="width:0%"></div>
      </div>
    </div>
    <div class="mb-3">
      <label for="cpw" class="form-label">Confirm password</label>
      <input id="cpw" type="password" class="form-control" required autocomplete="new-password">
      <div class="invalid-feedback" id="cpwMsg">Please confirm your password.</div>
      <div class="valid-feedback">Passwords match.</div>
    </div>
    <button class="btn btn-success w-100">Change password</button>
  </form>
</div>`,
        js: `const pw = document.getElementById('pw');
const cpw = document.getElementById('cpw');
const bar = document.getElementById('strength');
function checkMatch() {
  if (cpw.value === '') { cpw.setCustomValidity(''); document.getElementById('cpwMsg').textContent = 'Please confirm your password.'; return; }
  const ok = cpw.value === pw.value;
  cpw.setCustomValidity(ok ? '' : 'Passwords do not match');
  document.getElementById('cpwMsg').textContent = ok ? '' : 'Passwords do not match.';
}
function strength() {
  const v = pw.value;
  let s = 0;
  if (v.length >= 8) s++;
  if (/[0-9]/.test(v)) s++;
  if (/[A-Z]/.test(v)) s++;
  if (/[^A-Za-z0-9]/.test(v)) s++;
  bar.style.width = (s * 25) + '%';
  bar.className = 'progress-bar ' + (s <= 1 ? 'bg-danger' : s <= 2 ? 'bg-warning' : s === 3 ? 'bg-info' : 'bg-success');
}
pw.addEventListener('input', function () { strength(); checkMatch(); });
cpw.addEventListener('input', checkMatch);
document.getElementById('pwForm').addEventListener('submit', function (e) {
  e.preventDefault();
  checkMatch();
  const f = e.target;
  console.log(f.checkValidity() ? 'Password changed' : 'Fix errors: ' + (pw.validationMessage || cpw.validationMessage));
  f.classList.add('was-validated');
});`,
      },
      result: 'Typing a password fills a red → yellow → blue → green strength bar. Submitting with mismatched passwords shows "Passwords do not match." under the confirm field; when they match it turns green with "Passwords match.".',
      explanation: 'setCustomValidity with a non-empty string sets validity.customError, making the field :invalid so Bootstrap styles it. Empty string clears it. The pattern uses a lookahead (?=.*[0-9]) for "contains a digit".',
    },
    {
      title: 'Manual is-valid / is-invalid on Blur (Simulated Server Check)',
      scenario: 'Check a username when the user leaves the field: show "already taken" as if returned by a server.',
      steps: [
        'No was-validated: we style fields manually',
        'On blur, call a fake async check with setTimeout',
        'Show a spinner while checking',
        'Add is-valid or is-invalid and aria-invalid accordingly',
      ],
      code: `input.classList.remove('is-valid', 'is-invalid');
input.classList.add(taken ? 'is-invalid' : 'is-valid');
input.setAttribute('aria-invalid', taken);`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:420px">
  <label for="user" class="form-label">Choose a username</label>
  <div class="input-group has-validation">
    <span class="input-group-text">@</span>
    <input id="user" class="form-control" aria-describedby="userFb" placeholder="try: admin, asha, rahul">
    <span class="input-group-text d-none" id="spin"><span class="spinner-border spinner-border-sm" aria-hidden="true"></span></span>
    <div id="userFb" class="invalid-feedback">That username is already taken.</div>
    <div class="valid-feedback">Username available!</div>
  </div>
  <p class="small text-body-secondary mt-3">Taken names: admin, asha, rahul. Press Tab to leave the field.</p>
</div>`,
        js: `const taken = ['admin', 'asha', 'rahul'];
const input = document.getElementById('user');
const spin = document.getElementById('spin');
function fakeServerCheck(name) {
  return new Promise(function (resolve) {
    setTimeout(function () { resolve(taken.includes(name.toLowerCase())); }, 600);
  });
}
input.addEventListener('blur', async function () {
  const v = input.value.trim();
  input.classList.remove('is-valid', 'is-invalid');
  if (!v) return;
  spin.classList.remove('d-none');
  const isTaken = await fakeServerCheck(v);
  spin.classList.add('d-none');
  input.classList.add(isTaken ? 'is-invalid' : 'is-valid');
  input.setAttribute('aria-invalid', String(isTaken));
  console.log(v, isTaken ? 'is taken' : 'is available');
});`,
      },
      result: 'Typing "admin" and pressing Tab shows a spinner, then a red border with "That username is already taken.". Typing "neha" shows green "Username available!".',
      explanation: 'Feedback elements are shown by .is-invalid ~ .invalid-feedback / .is-valid ~ .valid-feedback, independent of :valid. This is how you display server-side errors returned from an API.',
    },
    {
      title: 'Tooltip-style Feedback',
      scenario: 'A compact form where error messages float over the layout instead of pushing content down.',
      steps: [
        'Give each column position-relative',
        'Use .invalid-tooltip instead of .invalid-feedback',
        'Validate on submit with was-validated',
      ],
      code: `<div class="col-md-6 position-relative">
  <label for="city" class="form-label">City</label>
  <input id="city" class="form-control" required>
  <div class="invalid-tooltip">Please provide a city.</div>
</div>`,
      playground: {
        libs: ['bootstrap'],
        html: `<div class="container py-3" style="max-width:640px">
  <form id="tipForm" class="row g-4 needs-validation" novalidate>
    <div class="col-md-6 position-relative">
      <label for="city" class="form-label">City</label>
      <input id="city" class="form-control" required>
      <div class="invalid-tooltip">Please provide a city.</div>
      <div class="valid-tooltip">Great!</div>
    </div>
    <div class="col-md-6 position-relative">
      <label for="zip" class="form-label">PIN code</label>
      <input id="zip" class="form-control" required pattern="[0-9]{6}" inputmode="numeric">
      <div class="invalid-tooltip">PIN must be 6 digits.</div>
    </div>
    <div class="col-12 mt-5"><button class="btn btn-dark">Check</button></div>
  </form>
</div>`,
        js: `document.getElementById('tipForm').addEventListener('submit', function (e) {
  e.preventDefault();
  this.classList.add('was-validated');
  console.log('Valid:', this.checkValidity());
});`,
      },
      result: 'Clicking Check on empty fields shows red tooltip bubbles under the inputs without shifting the layout.',
      explanation: '.invalid-tooltip is absolutely positioned (top: 100%) relative to the nearest positioned parent, so the column needs position-relative.',
    },
  ],
  interview: [
    { q: 'Why does Bootstrap recommend novalidate on forms?', a: 'It disables the browser\'s native validation bubbles and auto-blocking, so you can call checkValidity() yourself and display consistent Bootstrap-styled feedback. The constraint API still works.', level: 'Medium' },
    { q: 'What does .was-validated do?', a: 'Added to the form, it activates styles based on :valid/:invalid pseudo-classes for all controls inside, showing green/red borders and the corresponding feedback elements.', level: 'Easy' },
    { q: 'Difference between .was-validated and .is-invalid?', a: '.was-validated (on the form) uses the browser\'s computed validity for every field. .is-invalid/.is-valid (on individual inputs) are manual, e.g. for server-side errors or per-field validation.', level: 'Medium' },
    { q: 'Where should .invalid-feedback be placed?', a: 'As a sibling after the input inside the same parent (Bootstrap uses the ~ selector). In input groups, inside the .input-group which should have .has-validation.', level: 'Medium' },
    { q: 'How do you implement "confirm password must match"?', a: 'On input events call confirm.setCustomValidity(confirm.value === pw.value ? "" : "Passwords do not match"). This makes the field :invalid and checkValidity() false.', level: 'Medium' },
    { q: 'Is client-side validation enough?', a: 'No. It improves UX but can be bypassed. The server must always validate and sanitise input.', level: 'Easy' },
    { q: 'Name some HTML5 validation attributes.', a: 'required, type (email/url/number), minlength, maxlength, min, max, step, pattern.', level: 'Easy' },
    { q: 'What is the ValidityState object?', a: 'input.validity has boolean flags like valueMissing, typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, badInput, customError and valid.', level: 'Hard' },
    { q: 'How do you show a tooltip-style validation message?', a: 'Use .invalid-tooltip/.valid-tooltip instead of -feedback and give the parent position-relative.', level: 'Easy' },
    { q: 'How do you make validation errors accessible?', a: 'Link messages with aria-describedby, set aria-invalid="true" on invalid fields, use clear text messages, and move focus to the first invalid field on submit.', level: 'Medium' },
    { q: 'Does pattern need ^ and $ anchors?', a: 'No, the pattern attribute is implicitly anchored: the whole value must match. Also it is ignored on empty values unless required is set.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Make a newsletter form (email + submit) using the Bootstrap validation trio with a specific error message.',
      hint: 'novalidate, checkValidity, was-validated.',
      solution: `<form id="nl" class="needs-validation" novalidate>
  <div class="input-group has-validation">
    <input type="email" class="form-control" required placeholder="Email" aria-label="Email">
    <button class="btn btn-primary">Subscribe</button>
    <div class="invalid-feedback">Please enter a valid email address.</div>
  </div>
</form>
<script>
document.getElementById('nl').addEventListener('submit', e => {
  if (!e.target.checkValidity()) { e.preventDefault(); e.stopPropagation(); }
  e.target.classList.add('was-validated');
});
</script>`,
    },
    {
      task: 'Validate an age field so that the user must be 18 or older, based on a date-of-birth input, using setCustomValidity.',
      hint: 'Compute age from the date; set message if < 18.',
      solution: `<form id="f" novalidate>
  <label for="dob" class="form-label">Date of birth</label>
  <input id="dob" type="date" class="form-control" required>
  <div class="invalid-feedback">You must be at least 18 years old.</div>
  <button class="btn btn-primary mt-2">Continue</button>
</form>
<script>
const dob = document.getElementById('dob');
dob.addEventListener('input', () => {
  const d = new Date(dob.value);
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  dob.setCustomValidity(age >= 18 ? '' : 'Too young');
});
document.getElementById('f').addEventListener('submit', e => {
  e.preventDefault();
  e.target.classList.add('was-validated');
});
</script>`,
    },
    {
      task: 'Validate each field on blur (not on submit) by toggling is-valid/is-invalid based on checkValidity().',
      hint: 'Loop over inputs, listen to blur.',
      solution: `<form id="f2" novalidate>
  <input class="form-control mb-1" required minlength="3" placeholder="Name" aria-label="Name"><div class="invalid-feedback">Min 3 characters.</div>
  <input class="form-control mb-1" type="email" required placeholder="Email" aria-label="Email"><div class="invalid-feedback">Invalid email.</div>
</form>
<script>
document.querySelectorAll('#f2 .form-control').forEach(inp => {
  inp.addEventListener('blur', () => {
    const ok = inp.checkValidity();
    inp.classList.toggle('is-valid', ok);
    inp.classList.toggle('is-invalid', !ok);
    inp.setAttribute('aria-invalid', String(!ok));
  });
});
</script>`,
    },
    {
      task: 'Create a radio group (Payment: UPI / Card / COD) that is required, with one invalid-feedback shown after the last option.',
      hint: 'required on at least one radio of the same name; feedback inside the last .form-check.',
      solution: `<form class="needs-validation" novalidate id="pay">
  <div class="form-check"><input class="form-check-input" type="radio" name="pay" id="p1" required><label class="form-check-label" for="p1">UPI</label></div>
  <div class="form-check"><input class="form-check-input" type="radio" name="pay" id="p2" required><label class="form-check-label" for="p2">Card</label></div>
  <div class="form-check"><input class="form-check-input" type="radio" name="pay" id="p3" required><label class="form-check-label" for="p3">Cash on delivery</label>
    <div class="invalid-feedback">Choose a payment method.</div></div>
  <button class="btn btn-primary mt-2">Pay</button>
</form>
<script>
document.getElementById('pay').addEventListener('submit', e => {
  e.preventDefault();
  e.target.classList.add('was-validated');
});
</script>`,
    },
  ],
  quiz: [
    { question: 'Which attribute stops the browser from showing its own validation popups?', options: ['novalidate', 'nocheck', 'validate="false"', 'formcheck'], answer: 0, explanation: 'novalidate on the form.' },
    { question: 'Which class on the form activates Bootstrap validation styles for all fields?', options: ['needs-validation', 'is-validated', 'validated', 'was-validated'], answer: 3, explanation: 'needs-validation is only a JS hook; was-validated triggers styles.' },
    { question: 'Which method marks a field invalid with your own message?', options: ['input.invalidate()', 'input.setCustomValidity("msg")', 'input.validity = false', 'input.error("msg")'], answer: 1, explanation: 'setCustomValidity sets customError.' },
    { question: 'To display a server error on one input without was-validated, add:', options: ['.invalid', '.has-error', '.is-invalid', '.error-input'], answer: 2, explanation: '.is-invalid shows the sibling .invalid-feedback.' },
    { question: 'Which class should the input-group have so validation feedback renders correctly?', options: ['has-validation', 'needs-validation', 'input-validation', 'group-valid'], answer: 0, explanation: 'has-validation fixes border radius with feedback.' },
  ],
};
