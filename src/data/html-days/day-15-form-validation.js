export default {
  id: 'day-15-form-validation',
  title: 'Form Validation: required, minlength, maxlength, min, max, pattern, placeholder, readonly, disabled',
  module: 'Module 3: HTML Forms',
  day: 15,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'HTML5 can validate forms without a single line of JavaScript. Learn the validation attributes, how to write pattern regular expressions, how placeholder, readonly and disabled differ, and why server-side validation is still mandatory.',
  objectives: [
    'Make fields mandatory with required',
    'Limit text length with minlength and maxlength, and numbers/dates with min and max',
    'Enforce custom formats with pattern and a helpful title',
    'Differentiate placeholder, readonly and disabled (including what gets submitted)',
    'Style valid/invalid fields and explain client-side vs server-side validation',
  ],
  theory: [
    {
      heading: 'What is form validation and why does it matter?',
      content: "**Validation** means checking that user input is **complete and in the correct format** before it is used. Example: an email must contain @, a password must be at least 8 characters, an age must be between 18 and 60.\n\nThere are two places validation happens:\n- **Client-side** (in the browser): instant feedback, fewer wasted requests, better user experience. HTML5 attributes do this for free.\n- **Server-side** (on the back end): the **real security check**. Client-side checks can be bypassed by disabling them, editing HTML in DevTools, or sending requests with Postman/curl.\n\nRule: **client-side validation is for user convenience; server-side validation is for security. Always do both.**\n\nWhen a field is invalid, the browser **blocks submission**, focuses the first invalid field and shows a message bubble. The text of that bubble depends on the browser and language.",
      tip: 'Interview line: "Never trust the client." HTML validation improves UX but does not protect your server.',
    },
    {
      heading: 'required',
      content: "`required` is a **boolean** attribute that makes a field **mandatory**. The form will not submit while it is empty.\n\nWorks on: text-like inputs, checkbox (must be ticked, e.g. \"I accept the terms\"), radio (put it on at least one radio in the group; one must be chosen), file, `<select>` (the selected option's value must not be empty) and `<textarea>`.\n\nGood UX: mark required fields visually, for example with an asterisk inside the label, and explain the asterisk at the top of the form.",
      syntax: '<label for="name">Name *</label>\n<input id="name" name="name" required>\n\n<label><input type="checkbox" name="terms" required> I accept the terms</label>',
    },
    {
      heading: 'minlength / maxlength and min / max',
      content: "**Length** of text (`text`, `email`, `password`, `tel`, `url`, `search`, `textarea`):\n- `minlength=\"8\"`: at least 8 characters (only checked if the user typed something; combine with `required` to block empty values).\n- `maxlength=\"20\"`: the browser **stops typing** after 20 characters.\n\n**Range** of values (`number`, `range`, `date`, `time`, `month`, `week`, `datetime-local`):\n- `min` and `max`: lowest and highest allowed value, e.g. `min=\"18\" max=\"60\"` or `min=\"2026-01-01\"`.\n- `step` decides which values in between are allowed (`step=\"5\"` with min 0 allows 0, 5, 10...).\n\nDo not confuse them: **minlength/maxlength = number of characters**, **min/max = value**. `maxlength` on a number input does nothing.",
      syntax: '<input type="password" name="pwd" minlength="8" maxlength="32" required>\n<input type="number" name="age" min="18" max="60">\n<input type="date" name="travel" min="2026-01-01" max="2026-12-31">',
    },
    {
      heading: 'pattern',
      content: "`pattern` checks the value against a **regular expression** (regex), a mini-language for describing text formats. It works on text, tel, email, url, password and search inputs.\n\nKey facts:\n- The pattern must match the **entire value** (the browser adds `^` and `$` automatically).\n- Empty values pass unless the field is also `required`.\n- Add a **title** attribute describing the expected format; many browsers show it in the error bubble.\n\nUseful regex building blocks:\n- `[0-9]` or `\\d` one digit, `[A-Z]` one capital letter, `[a-z]` lowercase letter\n- `{6}` exactly 6 times, `{2,4}` 2 to 4 times, `+` one or more, `?` optional\n\nCommon Indian examples:\n- 6-digit PIN code: `[0-9]{6}`\n- 10-digit mobile starting with 6-9: `[6-9][0-9]{9}`\n- PAN card: `[A-Z]{5}[0-9]{4}[A-Z]`\n- Username 4-12 letters, digits or underscore: `[A-Za-z0-9_]{4,12}`",
      syntax: '<input type="tel" name="mobile" pattern="[6-9][0-9]{9}"\n       title="10-digit mobile number starting with 6, 7, 8 or 9" required>',
      tip: 'Regex is covered in depth in the JavaScript course (Day 41). For now, copy and adapt the common patterns above.',
    },
    {
      heading: 'placeholder',
      content: "`placeholder` shows **hint text** inside an empty field, such as an example format: `placeholder=\"e.g. 560001\"`. It disappears as soon as the user types.\n\nPlaceholder is **not validation** and **not a label**:\n- It vanishes while typing, so users forget what the field was for.\n- Default grey text often fails colour contrast for low-vision users.\n- It is **never submitted**: an empty field with a placeholder submits an empty string.\n\nUse it for short examples of the format; keep the real instructions in the `<label>`.",
      syntax: '<label for="pin">PIN code</label>\n<input id="pin" name="pin" placeholder="e.g. 560001" pattern="[0-9]{6}">',
    },
    {
      heading: 'readonly vs disabled',
      content: "Both prevent the user from changing a value, but they behave differently:\n\n**readonly**\n- The user **cannot edit** but **can focus, select and copy** the text.\n- It is **submitted** with the form.\n- Works on text-like inputs and textarea (not on checkbox, radio, select, file).\n- Skipped by validation.\n- Use for values the user should see and send but not change: order ID, auto-calculated total, verified email.\n\n**disabled**\n- The control is **greyed out**, **cannot be focused** or clicked.\n- It is **not submitted** at all.\n- Works on all form controls, `<button>`, `<option>`, `<optgroup>`, `<fieldset>`.\n- Skipped by validation.\n- Use for options that are **not available right now**: a Submit button until terms are accepted, an out-of-stock size.\n\nRemember that both can be changed in DevTools, so the server must still verify values.",
      syntax: '<input name="orderId" value="ORD-7781" readonly>   <!-- sent -->\n<input name="coupon" value="SAVE10" disabled>        <!-- NOT sent -->',
    },
    {
      heading: 'Styling validation states and turning validation off',
      content: "CSS pseudo-classes let you style fields by validation state:\n- `:required` / `:optional`\n- `:valid` / `:invalid`\n- `:user-invalid` (modern browsers): invalid **only after the user has interacted**, so the form does not look red before typing\n- `:in-range` / `:out-of-range` for min/max\n- `:read-only`, `:disabled`, `:placeholder-shown`\n\nTo skip browser validation:\n- `novalidate` on `<form>` disables all built-in validation (often used when JavaScript shows custom messages).\n- `formnovalidate` on a specific submit button, e.g. a \"Save draft\" button that should save incomplete data.\n\nComing next (Module 4): semantic HTML and page structure.",
      syntax: 'input:user-invalid { border-color: crimson; }\ninput:valid { border-color: seagreen; }\n\n<form novalidate> ... </form>\n<button type="submit" formnovalidate>Save draft</button>',
    },
  ],
  examples: [
    {
      title: 'Sign-up form with required, minlength and maxlength',
      scenario: 'A sign-up form must have a name, a valid email, and a password of 8-20 characters.',
      steps: [
        'Create signup.html with a form',
        'Add required to every field',
        'Add minlength="8" and maxlength="20" to the password',
        'Click Run and press Create account with empty or short values',
        'Read the browser messages, then fill correctly',
      ],
      code: `<form action="/signup" method="post">
  <label for="n">Name *</label>
  <input id="n" name="name" required>

  <label for="e">Email *</label>
  <input type="email" id="e" name="email" required>

  <label for="p">Password * (8-20 characters)</label>
  <input type="password" id="p" name="password" minlength="8" maxlength="20" required>

  <button type="submit">Create account</button>
</form>`,
      playground: {
        html: `<form id="f" action="/signup" method="post">
  <p><label for="n">Name *</label><br><input id="n" name="name" required></p>
  <p><label for="e">Email *</label><br><input type="email" id="e" name="email" required></p>
  <p><label for="p">Password * (8-20 characters)</label><br>
     <input type="password" id="p" name="password" minlength="8" maxlength="20" required></p>
  <button type="submit">Create account</button>
</form>
<p id="msg"></p>`,
        css: `body { font-family: sans-serif; }
input { padding: 6px; border: 2px solid #cbd5e1; border-radius: 4px; }
input:user-invalid { border-color: crimson; }
input:valid { border-color: seagreen; }`,
        js: `const f = document.getElementById('f');
f.addEventListener('submit', (e) => {
  e.preventDefault(); // only reached when every field is valid
  document.getElementById('msg').textContent = 'Account created for ' + f.name.value;
});
f.querySelectorAll('input').forEach(i => i.addEventListener('blur', () => {
  console.log(i.name, i.validity.valid ? 'valid' : 'invalid: ' + i.validationMessage);
}));`,
      },
      result: 'Empty fields block submission with "Please fill out this field". A 5-character password shows a "lengthen this text to 8 characters" message. Valid fields turn green, touched invalid ones red.',
      explanation: 'required blocks empty values, type="email" checks the format, minlength/maxlength limit the password length. :user-invalid only turns red after interaction. The submit event only fires when all checks pass.',
    },
    {
      title: 'pattern with title for Indian formats',
      scenario: 'A KYC form needs a 10-digit mobile number, a 6-digit PIN code and a PAN number.',
      steps: [
        'Add a tel input with pattern="[6-9][0-9]{9}" and a title',
        'Add a PIN input with pattern="[0-9]{6}"',
        'Add a PAN input with pattern="[A-Z]{5}[0-9]{4}[A-Z]"',
        'Click Run and test valid and invalid values',
      ],
      code: `<input type="tel" name="mobile" pattern="[6-9][0-9]{9}"
       title="10 digits, starting with 6-9" required>
<input name="pin" pattern="[0-9]{6}" title="6-digit PIN code" placeholder="e.g. 560001" required>
<input name="pan" pattern="[A-Z]{5}[0-9]{4}[A-Z]" title="Format: ABCDE1234F" required>`,
      playground: {
        html: `<form id="f">
  <p><label>Mobile <input type="tel" name="mobile" pattern="[6-9][0-9]{9}" title="10 digits, starting with 6-9" value="5123456789" required></label></p>
  <p><label>PIN code <input name="pin" pattern="[0-9]{6}" title="6-digit PIN code" placeholder="e.g. 560001" required></label></p>
  <p><label>PAN <input name="pan" pattern="[A-Z]{5}[0-9]{4}[A-Z]" title="Format: ABCDE1234F" value="ABCDE1234F" required></label></p>
  <button type="submit">Verify</button>
</form>
<pre id="out"></pre>`,
        css: `input:invalid { background: #fff1f2; } input:valid { background: #f0fdf4; }`,
        js: `const f = document.getElementById('f');
function report() {
  const lines = [...f.elements].filter(el => el.name).map(el =>
    el.name.padEnd(7) + JSON.stringify(el.value).padEnd(14) + (el.validity.patternMismatch ? 'pattern mismatch' : el.validity.valueMissing ? 'missing' : 'ok'));
  document.getElementById('out').textContent = lines.join('\\n');
}
f.addEventListener('input', report);
f.addEventListener('submit', (e) => { e.preventDefault(); console.log('All valid:', Object.fromEntries(new FormData(f))); });
report();`,
      },
      result: 'The mobile 5123456789 shows "pattern mismatch" (starts with 5), the empty PIN shows "missing", the PAN shows "ok". Fixing the values makes all lines "ok" and allows submission.',
      explanation: 'pattern must match the whole value. validity.patternMismatch and validity.valueMissing are the same flags the browser uses for its messages. title text is shown in the bubble to explain the expected format.',
    },
    {
      title: 'min, max and step on numbers and dates',
      scenario: 'A train booking form: passengers 1-6, age 5-120, travel date within the booking window.',
      steps: [
        'Add a number input for passengers with min="1" max="6"',
        'Add an age input with min="5" max="120"',
        'Add a date input with min and max dates',
        'Enter out-of-range values and try to submit',
      ],
      code: `<input type="number" name="passengers" min="1" max="6" value="1" required>
<input type="number" name="age" min="5" max="120" required>
<input type="date" name="travel" min="2026-11-17" max="2027-01-15" required>`,
      playground: {
        html: `<form id="f">
  <p><label>Passengers (1-6) <input type="number" name="passengers" min="1" max="6" value="8" required></label></p>
  <p><label>Age (5-120) <input type="number" name="age" min="5" max="120" value="30" required></label></p>
  <p><label>Travel date <input type="date" name="travel" min="2026-11-17" max="2027-01-15" value="2027-02-01" required></label></p>
  <p><label>Fare (step 0.5) <input type="number" name="fare" min="0" step="0.5" value="99.25"></label></p>
  <button type="submit">Book</button>
</form>`,
        css: `input:out-of-range, input:invalid { outline: 2px solid crimson; }
input:in-range:valid { outline: 2px solid seagreen; }`,
        js: `for (const el of document.getElementById('f').elements) {
  if (!el.name) continue;
  const v = el.validity;
  console.log(el.name, '=', el.value, v.rangeOverflow ? '-> above max' : v.rangeUnderflow ? '-> below min' : v.stepMismatch ? '-> step mismatch' : '-> ok');
}
document.getElementById('f').addEventListener('submit', e => { e.preventDefault(); console.log('Booked!'); });`,
      },
      result: 'Passengers 8 and date 2027-02-01 are outlined red (above max); fare 99.25 is red (step mismatch); age is green. The console explains each.',
      explanation: 'min/max check the value range; step checks allowed increments from min (0, 0.5, 1.0 ...). The browser exposes these as validity.rangeOverflow, rangeUnderflow and stepMismatch.',
    },
    {
      title: 'placeholder vs readonly vs disabled: what gets submitted?',
      scenario: 'A checkout form shows an order ID (readonly), an expired coupon (disabled) and a GSTIN field with only a placeholder.',
      steps: [
        'Add a readonly order ID input with a value',
        'Add a disabled coupon input with a value',
        'Add an empty GSTIN input with a placeholder',
        'Click Run, try to edit each, then submit',
      ],
      code: `<input name="orderId" value="ORD-7781" readonly>
<input name="coupon" value="DIWALI50" disabled>
<input name="gstin" placeholder="e.g. 27ABCDE1234F1Z5">`,
      playground: {
        html: `<form id="f">
  <p><label>Order ID (readonly) <input name="orderId" value="ORD-7781" readonly></label></p>
  <p><label>Coupon (disabled) <input name="coupon" value="DIWALI50" disabled></label></p>
  <p><label>GSTIN (placeholder only) <input name="gstin" placeholder="e.g. 27ABCDE1234F1Z5"></label></p>
  <label><input type="checkbox" id="agree"> I agree to the terms</label>
  <p><button type="submit" id="pay" disabled>Pay now</button></p>
</form>
<pre id="out"></pre>`,
        css: `input[readonly] { background: #f1f5f9; }
input:disabled, button:disabled { opacity: 0.5; cursor: not-allowed; }`,
        js: `const f = document.getElementById('f');
document.getElementById('agree').addEventListener('change', (e) => {
  document.getElementById('pay').disabled = !e.target.checked;
});
f.addEventListener('submit', (e) => {
  e.preventDefault();
  const sent = [...new FormData(f)].map(([k, v]) => k + '=' + JSON.stringify(v));
  document.getElementById('out').textContent = 'Submitted:\\n' + sent.join('\\n');
  console.log(sent);
});`,
      },
      result: 'Order ID can be selected but not edited; coupon cannot even be focused. "Pay now" is disabled until the box is ticked. Submitting shows orderId="ORD-7781" and gstin="" but no coupon.',
      explanation: 'readonly values are submitted; disabled values are not. Placeholder text is never a value, so gstin submits an empty string. Enabling the button via the checkbox is a common UX pattern.',
    },
    {
      title: 'novalidate and formnovalidate',
      scenario: 'A blog editor: "Publish" must validate, but "Save draft" should save even incomplete posts.',
      steps: [
        'Add a required title and a required body with minlength',
        'Add a normal submit button "Publish"',
        'Add a second submit button with formnovalidate: "Save draft"',
        'Leave fields empty and click each button',
      ],
      code: `<form>
  <input name="title" required>
  <textarea name="body" minlength="50" required></textarea>
  <button type="submit" name="action" value="publish">Publish</button>
  <button type="submit" name="action" value="draft" formnovalidate>Save draft</button>
</form>`,
      playground: {
        html: `<form id="f">
  <p><label>Title <input name="title" required></label></p>
  <p><label>Body (min 50 chars)<br><textarea name="body" rows="4" cols="40" minlength="50" required></textarea></label></p>
  <button type="submit" name="action" value="publish">Publish</button>
  <button type="submit" name="action" value="draft" formnovalidate>Save draft</button>
</form>
<p id="msg"></p>`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const action = e.submitter.value;
  document.getElementById('msg').textContent = action === 'draft' ? 'Draft saved (validation skipped).' : 'Post published!';
  console.log('Submitted via', action);
});`,
      },
      result: 'With empty fields, Publish shows "Please fill out this field"; Save draft succeeds and shows "Draft saved (validation skipped)."',
      explanation: 'formnovalidate on one submit button skips validation only for that button. novalidate on the <form> would skip it for all buttons (useful when JavaScript handles validation itself).',
    },
  ],
  interview: [
    { q: 'What is the difference between client-side and server-side validation?', a: 'Client-side validation runs in the browser (HTML5 attributes, JavaScript) and gives instant feedback. Server-side validation runs on the server and is the real security barrier, because client-side checks can be bypassed. Both should be used.', level: 'Easy' },
    { q: 'What does the required attribute do on a checkbox and on a radio group?', a: 'On a checkbox, it must be checked to submit. On a radio group, if any radio in the group has required, one radio of that group must be selected.', level: 'Medium' },
    { q: 'What is the difference between maxlength and max?', a: 'maxlength limits the number of characters in text-like fields and textarea. max limits the value of number, range and date/time inputs.', level: 'Easy' },
    { q: 'Does minlength block an empty field?', a: 'No. minlength is only checked when the user has entered a value. Combine it with required to also block empty input.', level: 'Medium' },
    { q: 'How does the pattern attribute work?', a: 'It takes a regular expression that must match the entire value (anchored automatically). It applies to text, tel, email, url, password and search inputs. Empty values pass unless required. A title attribute should describe the expected format.', level: 'Medium' },
    { q: 'Write a pattern for a 6-digit Indian PIN code.', a: 'pattern="[0-9]{6}" (or \\d{6}). It matches exactly six digits because the browser anchors the pattern to the whole value.', level: 'Easy' },
    { q: 'What is the difference between readonly and disabled?', a: 'readonly: cannot be edited but can be focused, copied, and IS submitted. disabled: greyed out, not focusable, NOT submitted, and also works on buttons, selects and fieldsets. Both are excluded from constraint validation.', level: 'Medium' },
    { q: 'Is placeholder a substitute for a label?', a: 'No. It disappears on typing, often has poor contrast and is not reliably announced. It should only provide a short format example in addition to a label. It is never submitted as a value.', level: 'Easy' },
    { q: 'How do you disable HTML5 validation for a form or a single button?', a: 'Add novalidate to the <form> to disable it for the whole form, or formnovalidate to a specific submit button (e.g. "Save draft").', level: 'Medium' },
    { q: 'What CSS pseudo-classes relate to validation?', a: ':valid, :invalid, :user-valid, :user-invalid, :required, :optional, :in-range, :out-of-range, :read-only, :read-write, :disabled, :enabled and :placeholder-shown.', level: 'Hard' },
    { q: 'What is the ValidityState object?', a: 'The element.validity object in JavaScript with boolean flags such as valueMissing, typeMismatch, patternMismatch, tooShort, tooLong, rangeUnderflow, rangeOverflow, stepMismatch and valid. It reflects the HTML validation constraints.', level: 'Hard' },
    { q: 'Why is it unsafe to rely only on maxlength to limit input?', a: 'A user can remove the attribute in DevTools or send a request directly. The server must enforce length limits (and database constraints) independently.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a login form where username (4-15 chars) and password (min 8 chars) are required.',
      hint: 'required + minlength + maxlength.',
      solution: `<form action="/login" method="post">
  <p><label for="u">Username *</label><br>
     <input id="u" name="username" minlength="4" maxlength="15" required></p>
  <p><label for="p">Password *</label><br>
     <input type="password" id="p" name="password" minlength="8" required></p>
  <button type="submit">Log in</button>
</form>`,
    },
    {
      task: 'Create a mobile number field that accepts exactly 10 digits starting with 6-9, with a helpful title and placeholder.',
      hint: 'type="tel", pattern="[6-9][0-9]{9}".',
      solution: `<label for="m">Mobile number</label>
<input type="tel" id="m" name="mobile" pattern="[6-9][0-9]{9}"
       title="Enter a 10-digit mobile number starting with 6, 7, 8 or 9"
       placeholder="e.g. 9876543210" required>`,
    },
    {
      task: 'Create a hotel booking form: guests 1-4, check-in date not before 2026-12-01, and a required "I agree" checkbox.',
      hint: 'number with min/max, date with min, checkbox with required.',
      solution: `<form action="/book" method="post">
  <p><label>Guests <input type="number" name="guests" min="1" max="4" value="1" required></label></p>
  <p><label>Check-in <input type="date" name="checkin" min="2026-12-01" required></label></p>
  <p><label><input type="checkbox" name="agree" value="yes" required> I agree to the hotel policy</label></p>
  <button type="submit">Book now</button>
</form>`,
    },
    {
      task: 'Create a profile edit form where the email is shown but cannot be changed and is still submitted, and the "Account type" field is shown greyed out and not submitted.',
      hint: 'readonly vs disabled.',
      solution: `<form action="/profile" method="post">
  <p><label>Email <input type="email" name="email" value="asha@mail.com" readonly></label></p>
  <p><label>Account type <input name="accountType" value="Premium" disabled></label></p>
  <p><label>Display name <input name="displayName" value="Asha" required></label></p>
  <button type="submit">Save</button>
</form>`,
    },
    {
      task: 'Style a form so required fields show a red left border only after the user interacts and leaves them invalid, and valid fields show a green border.',
      hint: 'Use :user-invalid and :valid.',
      solution: `<style>
  input { border: 1px solid #94a3b8; padding: 6px; }
  input:user-invalid { border-left: 4px solid crimson; }
  input:valid { border-left: 4px solid seagreen; }
</style>
<form>
  <p><label>Name <input name="name" required></label></p>
  <p><label>Email <input type="email" name="email" required></label></p>
  <button type="submit">Submit</button>
</form>`,
    },
    {
      task: 'Create a username field that only allows lowercase letters, digits and underscores, 5 to 12 characters long.',
      hint: 'Character class [a-z0-9_] with {5,12}.',
      solution: `<label for="un">Username</label>
<input id="un" name="username" pattern="[a-z0-9_]{5,12}"
       title="5-12 characters: lowercase letters, digits or underscore" required>`,
    },
  ],
  quiz: [
    { question: 'Which attribute makes a field mandatory?', options: ['mandatory', 'validate', 'needed', 'required'], answer: 3, explanation: 'required is the boolean attribute for mandatory fields.' },
    { question: 'Which attribute limits a number input to values of 100 or less?', options: ['maxlength="100"', 'max="100"', 'limit="100"', 'pattern="100"'], answer: 1, explanation: 'max sets the highest allowed value; maxlength is for characters.' },
    { question: 'Which field value is NOT submitted with the form?', options: ['A disabled input', 'A readonly input', 'A hidden input', 'A required input'], answer: 0, explanation: 'Disabled controls are excluded from submission.' },
    { question: 'Which pattern matches exactly 6 digits?', options: ['[0-9]+', '[6]', '[0-9]{6}', '{6}[0-9]'], answer: 2, explanation: '[0-9]{6} means a digit repeated exactly 6 times.' },
    { question: 'Why is server-side validation still needed?', options: ['HTML validation does not work in Chrome', 'Server validation is faster', 'Placeholders are sent to the server', 'Client-side validation can be bypassed'], answer: 3, explanation: 'Users can edit HTML or send requests directly, so the server must re-check everything.' },
  ],
};
