export default {
  id: 'day-27-form-handling-validation',
  title: 'Form Handling and Validation with JavaScript',
  module: 'Module 4: DOM & Events',
  day: 27,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Forms are how users send data. Today you learn to read form values (inputs, checkboxes, radios, selects) with .value, form.elements and FormData, and to validate them with JavaScript: required fields, email/password rules, matching passwords, showing inline error messages, and using the browser\'s Constraint Validation API.',
  objectives: [
    'Handle the submit event and read values with .value, .checked, form.elements and FormData',
    'Write custom validation rules (required, length, email pattern, password strength, match)',
    'Show accessible inline error messages and invalid styles',
    'Use the Constraint Validation API: checkValidity, validity, setCustomValidity, novalidate',
    'Validate live on input/blur and give a good user experience',
  ],
  theory: [
    {
      heading: 'Reading Form Values',
      content: "Each form control stores its current value in a property:\n\n- Text, email, password, number, textarea, select: `.value` (always a **string**; convert numbers with `Number()` or use `input.valueAsNumber`)\n- Checkbox and radio: `.checked` (boolean)\n- Selected radio in a group: `form.querySelector('input[name=\"plan\"]:checked')?.value`\n- Multiple select: `[...select.selectedOptions].map(o => o.value)`\n\n`form.elements` gives you every control by its `name` or `id`: `form.elements.email.value`. For a radio group, `form.elements.plan.value` returns the checked radio's value directly.",
      syntax: `const form = document.querySelector('#signup');
const name = form.elements.username.value.trim();
const age = Number(form.elements.age.value);
const agreed = form.elements.terms.checked;
const plan = form.elements.plan.value; // radio group`,
      tip: 'Always `trim()` text values so "   " (only spaces) does not pass a required check.',
    },
    {
      heading: 'FormData: Collect Everything at Once',
      content: "`new FormData(form)` reads all named controls in one go. It is the same data the browser would send on a normal submit.\n\n- `fd.get('email')` - one value\n- `fd.getAll('skills')` - all values for checkboxes with the same name\n- `Object.fromEntries(fd)` - convert to a plain object (only the last value for repeated names)\n\nOnly controls with a `name` attribute are included; unchecked checkboxes and disabled fields are skipped. FormData can be sent directly with `fetch` (Day 33).",
      syntax: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);  // { username: '...', email: '...' }
  data.skills = fd.getAll('skills');    // ['html', 'css']
  console.log(data);
});`,
    },
    {
      heading: 'Writing Custom Validation',
      content: "Client-side validation gives instant feedback, but it is only for **user experience**: anyone can bypass it, so the **server must validate again**.\n\nA clean pattern:\n1. On submit, `preventDefault()`\n2. Run a `validate(data)` function that returns an `errors` object, e.g. `{ email: 'Enter a valid email' }`\n3. Clear old errors, show new ones next to each field\n4. If there are no errors, process the data\n\nCommon rules:\n- required: `value.trim() !== ''`\n- length: `value.length >= 8`\n- email: simple regex `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/` (regex in detail on Day 41)\n- password strength: has a digit `/\\d/`, an uppercase `/[A-Z]/`\n- match: `password === confirm`\n- number range: `age >= 18 && age <= 100`",
      syntax: `function validate({ email, password, confirm }) {
  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) errors.email = 'Enter a valid email';
  if (password.length < 8) errors.password = 'At least 8 characters';
  if (password !== confirm) errors.confirm = 'Passwords do not match';
  return errors;
}
Object.keys(errors).length === 0; // valid?`,
    },
    {
      heading: 'Showing Errors Accessibly',
      content: "Good error messages:\n- appear **next to the field**, in plain language (\"Password needs a number\", not \"Invalid\")\n- use a visual style (red border) **and** text (not color alone)\n- set `aria-invalid=\"true\"` on the field and link the message with `aria-describedby` so screen readers read it\n- move focus to the **first invalid field** on submit\n- clear when the user fixes the problem\n\nValidate on **submit** first; after a field has been touched, re-validate it on `input` or `blur` so the error disappears as soon as it is fixed.",
      syntax: `function showError(input, message) {
  const errorEl = document.getElementById(input.id + '-error');
  errorEl.textContent = message;
  input.classList.toggle('invalid', Boolean(message));
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}`,
    },
    {
      heading: 'The Constraint Validation API',
      content: "HTML attributes like `required`, `minlength`, `type=\"email\"`, `min`, `max` and `pattern` already validate (HTML Day 15). JavaScript can use the same engine:\n\n- `input.checkValidity()` / `form.checkValidity()` - true/false\n- `form.reportValidity()` - checks and shows the browser's bubbles\n- `input.validity` - object with flags: `valueMissing`, `typeMismatch`, `tooShort`, `rangeUnderflow`, `patternMismatch`, `customError`, `valid`\n- `input.validationMessage` - the browser's message text\n- `input.setCustomValidity('message')` - mark a field invalid with your own message; set `''` to clear it\n\nAdd `novalidate` to the `<form>` to turn off the browser's popups but still use the API to show your own styled messages.\n\nCSS can style states with `:invalid`, `:valid` and `:user-invalid` (only after the user interacts).",
      syntax: `<form novalidate> ... <input type="email" id="email" required> ...

if (!email.checkValidity()) {
  if (email.validity.valueMissing) msg = 'Email is required';
  else if (email.validity.typeMismatch) msg = 'That is not an email';
}
confirm.setCustomValidity(confirm.value !== pwd.value ? 'Passwords must match' : '');`,
    },
  ],
  examples: [
    {
      title: 'Reading Every Kind of Control with FormData',
      scenario: 'A course enrollment form has text, number, select, radio and multiple checkboxes. On submit, collect everything into one object and display it as JSON.',
      steps: [
        'Create a form with named inputs: fullName, age, course (select), mode (radio), skills (checkboxes), terms',
        'Listen for submit and call e.preventDefault()',
        'Build an object with Object.fromEntries(new FormData(form))',
        'Fix skills with fd.getAll and age with Number, terms with .checked',
        'Fill the form and click Enroll',
      ],
      code: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.age = Number(data.age);
  data.skills = fd.getAll('skills');
  data.terms = form.elements.terms.checked;
  output.textContent = JSON.stringify(data, null, 2);
});`,
      playground: {
        html: `<form id="enroll">
  <label>Full name <input name="fullName" value="Asha Rao"></label>
  <label>Age <input name="age" type="number" value="21"></label>
  <label>Course
    <select name="course">
      <option value="js">JavaScript</option>
      <option value="react">React</option>
    </select>
  </label>
  <fieldset>
    <legend>Mode</legend>
    <label><input type="radio" name="mode" value="online" checked> Online</label>
    <label><input type="radio" name="mode" value="offline"> Offline</label>
  </fieldset>
  <fieldset>
    <legend>Skills</legend>
    <label><input type="checkbox" name="skills" value="html" checked> HTML</label>
    <label><input type="checkbox" name="skills" value="css" checked> CSS</label>
    <label><input type="checkbox" name="skills" value="git"> Git</label>
  </fieldset>
  <label><input type="checkbox" name="terms" id="terms"> I accept the terms</label>
  <button type="submit">Enroll</button>
</form>
<pre id="output">Submit to see the collected data</pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: grid; gap: 10px; max-width: 360px; }
label { display: block; }
input:not([type=radio]):not([type=checkbox]), select { width: 100%; padding: 6px; box-sizing: border-box; }
fieldset { border: 1px solid #ccc; border-radius: 6px; }
pre { background: #1e1e2e; color: #a6e3a1; padding: 12px; border-radius: 8px; overflow: auto; }`,
        js: `const form = document.getElementById('enroll');
const output = document.getElementById('output');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const data = Object.fromEntries(fd);
  data.age = Number(data.age);
  data.skills = fd.getAll('skills');
  data.terms = form.elements.terms.checked;
  output.textContent = JSON.stringify(data, null, 2);
  console.log(data);
});`,
      },
      result: `With the default values, clicking Enroll shows:
{
  "fullName": "Asha Rao",
  "age": 21,
  "course": "js",
  "mode": "online",
  "skills": [
    "html",
    "css"
  ],
  "terms": false
}
Changing the radio, checkboxes or select and submitting again updates the JSON.`,
      explanation: 'FormData reads every named control. fromEntries keeps only the LAST value of repeated names (skills), so getAll is used to get the full array. Values are strings, so age is converted with Number. The unchecked "terms" checkbox is not in FormData at all, so we read .checked directly.',
    },
    {
      title: 'Signup Form with Custom Validation and Inline Errors',
      scenario: 'A signup form checks name, email, password strength and password confirmation. Errors show under each field, the first invalid field gets focus, and a success message appears when everything is valid.',
      steps: [
        'Create the form with novalidate and an error <small> under each input',
        'Write validate(values) returning an errors object',
        'On submit: preventDefault, validate, show/clear each error, focus the first invalid field',
        'After the first submit, re-validate live on input',
        'Submit empty, then fix fields one by one',
      ],
      code: `function validate(v) {
  const errors = {};
  if (v.name.length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL_RE.test(v.email)) errors.email = 'Enter a valid email like name@site.com';
  if (v.password.length < 8) errors.password = 'Use at least 8 characters';
  else if (!/\\d/.test(v.password) || !/[A-Z]/.test(v.password))
    errors.password = 'Include a number and an uppercase letter';
  if (v.confirm !== v.password) errors.confirm = 'Passwords do not match';
  return errors;
}`,
      playground: {
        html: `<form id="signup" novalidate>
  <div class="field">
    <label for="name">Name</label>
    <input id="name" name="name" aria-describedby="name-error">
    <small id="name-error" class="error"></small>
  </div>
  <div class="field">
    <label for="email">Email</label>
    <input id="email" name="email" type="email" aria-describedby="email-error">
    <small id="email-error" class="error"></small>
  </div>
  <div class="field">
    <label for="password">Password</label>
    <input id="password" name="password" type="password" aria-describedby="password-error">
    <small id="password-error" class="error"></small>
  </div>
  <div class="field">
    <label for="confirm">Confirm password</label>
    <input id="confirm" name="confirm" type="password" aria-describedby="confirm-error">
    <small id="confirm-error" class="error"></small>
  </div>
  <button type="submit">Create account</button>
</form>
<p id="success" role="status"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: grid; gap: 12px; max-width: 340px; }
.field { display: grid; gap: 4px; }
input { padding: 8px; border: 2px solid #ccc; border-radius: 6px; }
input.invalid { border-color: crimson; background: #fff5f5; }
input.valid { border-color: seagreen; }
.error { color: crimson; min-height: 1em; }
#success { color: seagreen; font-weight: bold; }`,
        js: `const form = document.getElementById('signup');
const success = document.getElementById('success');
const EMAIL_RE = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
const fields = ['name', 'email', 'password', 'confirm'];
let submittedOnce = false;

function getValues() {
  return {
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    password: form.elements.password.value,
    confirm: form.elements.confirm.value,
  };
}

function validate(v) {
  const errors = {};
  if (v.name.length < 2) errors.name = 'Name must be at least 2 characters';
  if (!EMAIL_RE.test(v.email)) errors.email = 'Enter a valid email like name@site.com';
  if (v.password.length < 8) errors.password = 'Use at least 8 characters';
  else if (!/\\d/.test(v.password) || !/[A-Z]/.test(v.password)) {
    errors.password = 'Include a number and an uppercase letter';
  }
  if (!v.confirm || v.confirm !== v.password) errors.confirm = 'Passwords do not match';
  return errors;
}

function showErrors(errors) {
  fields.forEach(f => {
    const input = form.elements[f];
    const msg = errors[f] || '';
    document.getElementById(f + '-error').textContent = msg;
    input.classList.toggle('invalid', Boolean(msg));
    input.classList.toggle('valid', !msg);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  });
}

form.addEventListener('submit', (e) => {
  e.preventDefault();
  submittedOnce = true;
  const values = getValues();
  const errors = validate(values);
  showErrors(errors);

  const firstBad = fields.find(f => errors[f]);
  if (firstBad) {
    form.elements[firstBad].focus();
    success.textContent = '';
    console.log('Errors:', Object.keys(errors).join(', '));
    return;
  }
  success.textContent = 'Welcome, ' + values.name + '! Account created.';
  console.log('Valid data:', { name: values.name, email: values.email });
});

form.addEventListener('input', () => {
  if (submittedOnce) showErrors(validate(getValues()));
});`,
      },
      result: 'Clicking "Create account" with empty fields shows four red messages, red borders, and puts the cursor in Name. As you type (after the first submit) each message disappears and the border turns green when that field becomes valid. "Password1" with a matching confirm passes; "password" shows "Include a number and an uppercase letter". When all are valid: "Welcome, <name>! Account created."',
      explanation: 'novalidate disables the browser popups so we control the UI. validate() is a pure function returning an errors object, which keeps logic testable. showErrors updates text, classes and aria-invalid for every field. Live re-validation only starts after the first submit, so users are not shouted at while they are still typing. One delegated input listener on the form covers all fields.',
    },
    {
      title: 'Constraint Validation API + setCustomValidity',
      scenario: 'Use the browser\'s built-in rules (required, type=email, minlength, min/max) but show our own messages, plus a custom rule (username "admin" is reserved) via setCustomValidity.',
      steps: [
        'Create a form with HTML validation attributes and novalidate',
        'On blur of each field, read input.validity flags and pick a friendly message',
        'For the username, call setCustomValidity when the value is "admin"',
        'On submit, check form.checkValidity()',
        'Try empty, too short, wrong email, age 10, and username admin',
      ],
      code: `function messageFor(input) {
  const v = input.validity;
  if (v.valueMissing) return 'This field is required';
  if (v.typeMismatch) return 'Please enter a valid ' + input.type;
  if (v.tooShort) return 'Use at least ' + input.minLength + ' characters';
  if (v.rangeUnderflow) return 'Minimum is ' + input.min;
  if (v.rangeOverflow) return 'Maximum is ' + input.max;
  if (v.customError) return input.validationMessage;
  return '';
}`,
      playground: {
        html: `<form id="f" novalidate>
  <label>Username <input name="username" required minlength="4"></label>
  <small class="err"></small>
  <label>Email <input name="email" type="email" required></label>
  <small class="err"></small>
  <label>Age <input name="age" type="number" min="18" max="60" required></label>
  <small class="err"></small>
  <button>Register</button>
</form>
<p id="result"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: grid; gap: 4px; max-width: 320px; }
label { display: grid; gap: 4px; margin-top: 8px; }
input { padding: 6px; border: 2px solid #ccc; border-radius: 6px; }
input.touched:invalid { border-color: crimson; }
input.touched:valid { border-color: seagreen; }
.err { color: crimson; min-height: 1em; }
#result { font-weight: bold; }`,
        js: `const form = document.getElementById('f');
const result = document.getElementById('result');

function messageFor(input) {
  const v = input.validity;
  if (v.valueMissing) return 'This field is required';
  if (v.typeMismatch) return 'Please enter a valid ' + input.type;
  if (v.tooShort) return 'Use at least ' + input.minLength + ' characters (you have ' + input.value.length + ')';
  if (v.rangeUnderflow) return 'Minimum is ' + input.min;
  if (v.rangeOverflow) return 'Maximum is ' + input.max;
  if (v.badInput) return 'Please enter a number';
  if (v.customError) return input.validationMessage;
  return '';
}

function check(input) {
  if (input.name === 'username') {
    input.setCustomValidity(input.value.trim().toLowerCase() === 'admin' ? '"admin" is reserved, choose another name' : '');
  }
  input.classList.add('touched');
  const errorEl = input.closest('label').nextElementSibling;
  errorEl.textContent = messageFor(input);
  return input.checkValidity();
}

form.addEventListener('focusout', (e) => {
  if (e.target.matches('input')) check(e.target);
});

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const inputs = [...form.querySelectorAll('input')];
  const allValid = inputs.map(check).every(Boolean);
  result.textContent = allValid ? 'Registered! form.checkValidity() = ' + form.checkValidity() : 'Please fix the errors above';
  result.style.color = allValid ? 'seagreen' : 'crimson';
  if (!allValid) form.querySelector('input:invalid').focus();
});`,
      },
      result: 'Leaving a field shows a friendly message: empty -> "This field is required", "abc" as username -> "Use at least 4 characters (you have 3)", "asha@" -> "Please enter a valid email", age 10 -> "Minimum is 18", username "admin" -> \'"admin" is reserved, choose another name\'. Borders turn red/green. Submitting with all valid values shows "Registered! form.checkValidity() = true".',
      explanation: 'HTML attributes define the rules and input.validity reports which one failed, so you do not re-implement them. setCustomValidity adds a custom rule that the browser treats like built-in ones (customError, and :invalid in CSS); passing "" clears it. focusout is used instead of blur because it bubbles, allowing one delegated listener on the form.',
    },
  ],
  interview: [
    { q: 'How do you get the value of a text input and a checkbox?', a: 'input.value for text-like controls (always a string). checkbox.checked for the checked state (boolean); checkbox.value is the value sent when checked.', level: 'Easy' },
    { q: 'Why is client-side validation not enough?', a: 'It only improves user experience. Users can disable JS, edit HTML or send requests directly (Postman/curl), so the server must always validate and sanitize again.', level: 'Easy' },
    { q: 'What is FormData?', a: 'A built-in object that collects key/value pairs from a form\'s named controls (new FormData(form)). Methods: get, getAll, set, append, has, delete, entries. It can be sent directly with fetch and supports files.', level: 'Medium' },
    { q: 'What is the output?\n<input id="age" value="20">\nconst v = document.getElementById("age").value;\nconsole.log(v + 1, typeof v);', a: '201 string. .value is always a string, so + concatenates. Use Number(v) + 1 or input.valueAsNumber for a number input.', level: 'Easy' },
    { q: 'Form has checkboxes name="c" with values a and b, both checked.\nconst fd = new FormData(form);\nconsole.log(fd.get("c"), fd.getAll("c"), Object.fromEntries(fd).c);', a: 'a ["a", "b"] b. get returns the first value, getAll returns all values, and Object.fromEntries keeps only the last value for duplicate keys.', level: 'Hard' },
    { q: 'What does the novalidate attribute do?', a: 'It disables the browser\'s automatic validation popups on submit, so the submit event always fires. The Constraint Validation API (validity, checkValidity) still works, allowing custom error UI.', level: 'Medium' },
    { q: 'What is setCustomValidity used for?', a: 'To mark a field invalid with a custom message (e.g. passwords do not match). The field then fails checkValidity and matches :invalid. Call setCustomValidity("") to make it valid again; forgetting this keeps it permanently invalid.', level: 'Medium' },
    { q: 'Name some properties of input.validity.', a: 'valueMissing, typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch, badInput, customError, valid.', level: 'Medium' },
    { q: 'How do you get the selected radio button value in a group named "plan"?', a: 'form.elements.plan.value, or document.querySelector(\'input[name="plan"]:checked\')?.value (undefined if none is selected).', level: 'Easy' },
    { q: 'What makes form errors accessible?', a: 'Visible text messages next to fields (not only color), aria-invalid="true" on invalid fields, aria-describedby linking the message, a role="alert"/status region for summaries, and moving focus to the first invalid field.', level: 'Medium' },
    { q: 'What is the output?\nconsole.log(/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test("a@b"), /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test("a@b.in"));', a: 'false true. The pattern requires a dot followed by at least one character after the @ part.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a login form (email, password). On submit, show "Email is required" or "Password must be at least 6 characters" under the field, otherwise show "Logged in as <email>".',
      hint: 'preventDefault, trim, check each rule, set textContent of error elements.',
      solution: `<form id="login" novalidate>
  <input id="email" placeholder="Email"><small id="emailErr"></small><br>
  <input id="pwd" type="password" placeholder="Password"><small id="pwdErr"></small><br>
  <button>Login</button>
</form>
<p id="msg"></p>
<script>
document.getElementById('login').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value.trim();
  const pwd = document.getElementById('pwd').value;
  const emailErr = email ? '' : 'Email is required';
  const pwdErr = pwd.length >= 6 ? '' : 'Password must be at least 6 characters';
  document.getElementById('emailErr').textContent = emailErr;
  document.getElementById('pwdErr').textContent = pwdErr;
  document.getElementById('msg').textContent = (!emailErr && !pwdErr) ? 'Logged in as ' + email : '';
});
</script>`,
    },
    {
      task: 'Add a live password strength meter: as the user types, show Weak / Medium / Strong based on length >= 8, has a number, has an uppercase letter, has a symbol (1-2 rules = Weak, 3 = Medium, 4 = Strong).',
      hint: 'Count rules with [cond1, cond2, ...].filter(Boolean).length on the input event.',
      solution: `<input id="pwd" type="password" placeholder="Password">
<p id="strength"></p>
<script>
const pwd = document.getElementById('pwd');
const out = document.getElementById('strength');
pwd.addEventListener('input', () => {
  const v = pwd.value;
  const score = [v.length >= 8, /\\d/.test(v), /[A-Z]/.test(v), /[^A-Za-z0-9]/.test(v)].filter(Boolean).length;
  out.textContent = !v ? '' : score <= 2 ? 'Weak' : score === 3 ? 'Medium' : 'Strong';
  out.style.color = score <= 2 ? 'crimson' : score === 3 ? 'orange' : 'seagreen';
});
</script>`,
    },
    {
      task: 'Disable the submit button until the "I agree" checkbox is checked AND the name field is not empty.',
      hint: 'Listen to input on the form; button.disabled = !(checked && name).',
      solution: `<form id="f">
  <input id="name" placeholder="Name">
  <label><input type="checkbox" id="agree"> I agree</label>
  <button id="go" disabled>Submit</button>
</form>
<script>
const f = document.getElementById('f');
const btn = document.getElementById('go');
f.addEventListener('input', () => {
  const ok = document.getElementById('name').value.trim() !== '' && document.getElementById('agree').checked;
  btn.disabled = !ok;
});
f.addEventListener('submit', (e) => { e.preventDefault(); alert('Submitted!'); });
</script>`,
    },
    {
      task: 'Build a "Confirm email" field that uses setCustomValidity so the browser blocks submission (with its own popup) when the two emails differ.',
      hint: 'On input of either field: confirm.setCustomValidity(confirm.value === email.value ? "" : "Emails do not match").',
      solution: `<form id="f">
  <input type="email" id="email" required placeholder="Email">
  <input type="email" id="confirm" required placeholder="Confirm email">
  <button>Save</button>
</form>
<script>
const email = document.getElementById('email');
const confirmEl = document.getElementById('confirm');
function sync() {
  confirmEl.setCustomValidity(confirmEl.value === email.value ? '' : 'Emails do not match');
}
email.addEventListener('input', sync);
confirmEl.addEventListener('input', sync);
document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('Saved', email.value);
});
</script>`,
    },
  ],
  quiz: [
    { question: 'What type is input.value for <input type="number">?', options: ['number', 'string', 'boolean', 'It depends on the browser'], answer: 1, explanation: 'value is always a string; use Number() or valueAsNumber.' },
    { question: 'How do you get ALL checked values of checkboxes named "skills" from FormData fd?', options: ['fd.get("skills")', 'fd.skills', 'fd.getAll("skills")', 'Object.fromEntries(fd).skills'], answer: 2, explanation: 'getAll returns every value for the name.' },
    { question: 'Which property tells you a required field is empty?', options: ['input.validity.valueMissing', 'input.validity.typeMismatch', 'input.isEmpty', 'input.required'], answer: 0, explanation: 'valueMissing is true when a required field has no value.' },
    { question: 'How do you clear a custom validation error?', options: ['input.setCustomValidity(null)', 'input.validity.reset()', 'input.removeAttribute("invalid")', 'input.setCustomValidity("")'], answer: 3, explanation: 'An empty string marks the field valid again.' },
    { question: 'Why must the server validate again?', options: ['Browsers do not support validation', 'Client-side checks can be bypassed', 'FormData is encrypted', 'JavaScript validation is too slow'], answer: 1, explanation: 'Users or attackers can skip client-side code entirely.' },
  ],
};
