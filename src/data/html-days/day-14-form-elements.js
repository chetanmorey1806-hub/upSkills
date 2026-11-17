export default {
  id: 'day-14-form-elements',
  title: 'Form Elements: <label>, <textarea>, <select>, <option>, <button>, <fieldset>, <legend>',
  module: 'Module 3: HTML Forms',
  day: 14,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Go beyond <input>: connect labels to controls for accessibility, collect long text with <textarea>, build dropdowns with <select> and <option>, use the flexible <button>, and group related fields with <fieldset> and <legend>.',
  objectives: [
    'Associate labels with controls using for/id or wrapping',
    'Collect multi-line text with <textarea> and its rows, cols and maxlength attributes',
    'Build dropdowns with <select>, <option>, <optgroup>, selected and multiple',
    'Use <button> with the correct type and know why type matters',
    'Group related controls with <fieldset> and caption them with <legend>',
  ],
  theory: [
    {
      heading: '<label>: the name tag of every control',
      content: "A `<label>` gives a form control a **visible, accessible name**. Every input (except hidden and buttons) should have one.\n\nTwo ways to connect a label:\n1. **Explicit**: `for` on the label matches the `id` of the input. `<label for=\"email\">Email</label> <input id=\"email\">`\n2. **Implicit**: wrap the input inside the label. `<label>Email <input name=\"email\"></label>`\n\nBenefits:\n- **Screen readers** read the label when the input gets focus (\"Email, edit text\").\n- **Clicking the label focuses the input** or toggles a checkbox/radio, giving a much bigger click target (important on mobile).\n- Voice control users can say \"click Email\".\n\n**Placeholder is not a label.** It disappears when typing, has low contrast and is not reliably announced.",
      syntax: '<label for="fullname">Full name</label>\n<input type="text" id="fullname" name="fullname">\n\n<label><input type="checkbox" name="news"> Send me offers</label>',
      tip: 'Remember: for matches id, not name. A common bug is <label for="email"> with <input name="email"> but no id.',
    },
    {
      heading: '<textarea>: multi-line text',
      content: "`<textarea>` is for **long, multi-line text**: comments, addresses, messages, reviews. Unlike `<input>`, it has an **opening and closing tag**, and its **default text goes between the tags** (it has no value attribute).\n\nAttributes:\n- `rows` and `cols`: visible height (lines) and width (characters). CSS width/height are usually preferred for layout.\n- `name`, `id`, `placeholder`, `required`, `maxlength`, `minlength`, `readonly`, `disabled`\n- `wrap=\"hard\"` inserts line breaks into the submitted value at the cols width (rarely needed).\n\nUsers can resize it by dragging the corner; control this with CSS `resize: vertical` or `resize: none`.\n\nWhitespace gotcha: any spaces or new lines between the tags become part of the value. Write `<textarea></textarea>` with nothing in between for an empty box.",
      syntax: '<label for="msg">Message</label>\n<textarea id="msg" name="message" rows="5" cols="40" maxlength="500"></textarea>',
    },
    {
      heading: '<select> and <option>: dropdown lists',
      content: "`<select>` creates a **dropdown** list; each choice is an `<option>`. Use it when there are **many options** (more than about 5-7) and only space for one line, e.g. state, country, category.\n\n- The `value` attribute of the chosen option is submitted. If an option has no value, its **text** is submitted.\n- `selected` pre-selects an option. Without it, the **first** option is selected.\n- A placeholder-style first option: `<option value=\"\">-- Select a state --</option>`. Combined with `required`, the user must pick a real option.\n- `disabled` on an option makes it unselectable.\n- `<optgroup label=\"...\">` groups options under a bold heading.\n- `multiple` lets users pick several options (Ctrl/Cmd + click). `size=\"4\"` shows 4 rows as a list box.\n\nFor 2-4 options, radio buttons are often easier because all choices are visible.",
      syntax: '<label for="state">State</label>\n<select id="state" name="state" required>\n  <option value="">-- Select --</option>\n  <optgroup label="South">\n    <option value="KA">Karnataka</option>\n    <option value="TN">Tamil Nadu</option>\n  </optgroup>\n  <optgroup label="West">\n    <option value="MH" selected>Maharashtra</option>\n    <option value="GJ">Gujarat</option>\n  </optgroup>\n</select>',
    },
    {
      heading: '<button>',
      content: "`<button>` creates a clickable button. Unlike `<input type=\"submit\">`, it **can contain HTML**: icons, images, `<strong>` text.\n\nThe **type** attribute is critical:\n- `type=\"submit\"`: submits the form. **This is the default inside a form!**\n- `type=\"button\"`: does nothing by itself; used for JavaScript actions (show password, open menu, add row).\n- `type=\"reset\"`: resets the form.\n\nClassic bug: a \"Show details\" button inside a form without `type=\"button\"` **submits the form** and reloads the page. **Always write the type explicitly.**\n\nOther attributes: `name`/`value` (sent when it is the submitter), `disabled`, and `formaction`/`formmethod`/`formnovalidate` to override the form's settings.\n\nUse `<button>` for actions, `<a href>` for navigation.",
      syntax: '<button type="submit">Place order</button>\n<button type="button" onclick="alert(\'Hi\')">Say hi</button>\n<button type="reset">Clear</button>',
      tip: 'Do not make clickable <div>s. A real <button> is focusable with Tab, works with Enter/Space, and is announced as a button.',
    },
    {
      heading: '<fieldset> and <legend>',
      content: "`<fieldset>` groups **related controls** together and draws a border around them by default. `<legend>` (its first child) gives the group a **caption** shown on the border.\n\nWhen to use:\n- **Radio and checkbox groups**: the legend is the question (\"Payment method\"), each label is an answer. Screen readers announce \"Payment method, group\" then \"UPI, radio button\", giving context.\n- Long forms split into sections: \"Personal details\", \"Address\", \"Payment\".\n\nBonus: `<fieldset disabled>` disables **every control inside** it at once, which is handy for showing a section that is not yet available.\n\nComing next (Day 15): validation attributes such as required, minlength, pattern, readonly and disabled.",
      syntax: '<fieldset>\n  <legend>Payment method</legend>\n  <label><input type="radio" name="pay" value="upi"> UPI</label>\n  <label><input type="radio" name="pay" value="card"> Card</label>\n  <label><input type="radio" name="pay" value="cod"> Cash on delivery</label>\n</fieldset>',
    },
  ],
  examples: [
    {
      title: 'Labels: explicit, implicit and clicking behaviour',
      scenario: 'See how labels enlarge the click area and connect to controls.',
      steps: [
        'Add an input with an explicit <label for>',
        'Add a checkbox wrapped inside a <label>',
        'Add a checkbox with no label for comparison',
        'Click Run and click on the label texts',
      ],
      code: `<label for="city">City</label>
<input type="text" id="city" name="city">

<label><input type="checkbox" name="remember"> Remember me</label>

<input type="checkbox" name="nolabel"> No label (click this text - nothing happens)`,
      playground: {
        html: `<p><label for="city">City (click me)</label>
<input type="text" id="city" name="city"></p>
<p><label><input type="checkbox" name="remember"> Remember me (click the text)</label></p>
<p><input type="checkbox" name="nolabel"> No label (clicking this text does nothing)</p>`,
        css: `body { font-family: sans-serif; } label { cursor: pointer; }`,
        js: `document.querySelectorAll('input').forEach(i => {
  console.log(i.name, 'has', i.labels.length, 'label(s)');
});`,
      },
      result: 'Clicking "City" focuses the text box, clicking "Remember me" toggles the checkbox, clicking the unlabelled text does nothing. The console shows label counts 1, 1, 0.',
      explanation: 'The browser links a label to its control through for/id or nesting. input.labels exposes this link; screen readers use the same link to announce the control name.',
    },
    {
      title: 'Feedback form with textarea and character counter',
      scenario: 'A product review box limited to 200 characters with a live counter.',
      steps: [
        'Add <label> and <textarea> with rows and maxlength="200"',
        'Add a <p> to show the count',
        'Add a small script that updates the count on input',
        'Click Run and type',
      ],
      code: `<label for="review">Your review</label>
<textarea id="review" name="review" rows="5" maxlength="200" placeholder="What did you like?"></textarea>
<p><span id="count">0</span>/200</p>`,
      playground: {
        html: `<form>
  <label for="review">Your review</label><br>
  <textarea id="review" name="review" rows="5" cols="40" maxlength="200" placeholder="What did you like?"></textarea>
  <p><span id="count">0</span>/200 characters</p>
</form>`,
        css: `body { font-family: sans-serif; }
textarea { width: 100%; max-width: 420px; resize: vertical; font: inherit; padding: 8px; }`,
        js: `const review = document.getElementById('review');
review.addEventListener('input', () => {
  document.getElementById('count').textContent = review.value.length;
});
console.log('Initial value is empty:', review.value === '');`,
      },
      result: 'A 5-line text area that can only be resized vertically; the counter updates as you type and stops at 200.',
      explanation: 'maxlength prevents typing beyond 200 characters. Because nothing is written between the textarea tags, the initial value is empty. resize: vertical stops the box from breaking the layout sideways.',
    },
    {
      title: 'Dropdowns: placeholder option, optgroup and multiple',
      scenario: 'A delivery form asks for a state (grouped by region) and preferred delivery days (multiple).',
      steps: [
        'Create a <select> with a blank first option and required',
        'Group states with <optgroup>',
        'Create a second <select multiple size="4"> for days',
        'Click Run, choose options and press "Check"',
      ],
      code: `<select id="state" name="state" required>
  <option value="">-- Select state --</option>
  <optgroup label="South">
    <option value="KA">Karnataka</option>
    <option value="KL">Kerala</option>
  </optgroup>
  <optgroup label="North">
    <option value="DL">Delhi</option>
    <option value="PB">Punjab</option>
  </optgroup>
</select>

<select name="days" multiple size="4">
  <option value="mon">Monday</option>
  ...
</select>`,
      playground: {
        html: `<form id="f">
  <p><label for="state">State</label><br>
  <select id="state" name="state" required>
    <option value="">-- Select state --</option>
    <optgroup label="South">
      <option value="KA">Karnataka</option>
      <option value="KL">Kerala</option>
    </optgroup>
    <optgroup label="North">
      <option value="DL">Delhi</option>
      <option value="PB">Punjab</option>
      <option value="JK" disabled>Jammu &amp; Kashmir (not serviceable)</option>
    </optgroup>
  </select></p>
  <p><label for="days">Delivery days (Ctrl/Cmd + click for many)</label><br>
  <select id="days" name="days" multiple size="4">
    <option value="mon">Monday</option>
    <option value="tue" selected>Tuesday</option>
    <option value="wed">Wednesday</option>
    <option value="sat" selected>Saturday</option>
  </select></p>
  <button type="submit">Check</button>
</form>
<pre id="out"></pre>`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const qs = new URLSearchParams(new FormData(e.target)).toString();
  document.getElementById('out').textContent = qs;
  console.log(qs);
});`,
      },
      result: 'Submitting without a state shows "Please select an item in the list". After choosing Kerala: state=KL&days=tue&days=sat.',
      explanation: 'The empty-value first option plus required forces a real choice. optgroup labels are not selectable. The option value (KL), not its text, is submitted. A multiple select sends one pair per chosen option.',
    },
    {
      title: 'Button types: the accidental-submit bug',
      scenario: 'A form has a "Show tips" helper button that accidentally submits the form.',
      steps: [
        'Add a <button> without type inside a form (bug)',
        'Add a <button type="button"> (fixed)',
        'Add a <button type="submit"> with an icon inside',
        'Click each and read the console',
      ],
      code: `<form>
  <button>Show tips (no type - BUG)</button>
  <button type="button">Show tips (type="button")</button>
  <button type="submit"><span aria-hidden="true">✔</span> <strong>Save</strong></button>
</form>`,
      playground: {
        html: `<form id="f">
  <input name="note" value="Buy milk">
  <p>
    <button id="bug">Show tips (no type - BUG)</button>
    <button type="button" id="ok">Show tips (type="button")</button>
    <button type="submit"><span aria-hidden="true">✔</span> <strong>Save</strong></button>
  </p>
</form>
<p id="tips" hidden>Tip: keep notes short.</p>`,
        js: `const f = document.getElementById('f');
f.addEventListener('submit', (e) => {
  e.preventDefault();
  console.log('FORM SUBMITTED by:', e.submitter.textContent.trim());
});
document.getElementById('bug').addEventListener('click', () => { document.getElementById('tips').hidden = false; });
document.getElementById('ok').addEventListener('click', () => {
  document.getElementById('tips').hidden = false;
  console.log('Tips shown, no submit.');
});`,
      },
      result: 'The first button shows the tip AND logs "FORM SUBMITTED"; the second only shows the tip; the third submits with a tick icon and bold text.',
      explanation: 'A <button> inside a form defaults to type="submit". Without preventDefault, the bug would reload the page and lose the tip. <button> can contain markup like icons, which <input type="submit"> cannot.',
    },
    {
      title: 'Complete registration form with fieldset and legend',
      scenario: 'A course registration form grouped into sections using every element from today.',
      steps: [
        'Create a <fieldset> "Personal details" with labelled inputs',
        'Create a <fieldset> "Course" with a select and a radio group in a nested fieldset',
        'Add a textarea for comments',
        'Add submit and reset buttons',
        'Click Run and submit',
      ],
      code: `<form action="/register" method="post">
  <fieldset>
    <legend>Personal details</legend>
    <label for="name">Name</label> <input id="name" name="name">
    <label for="email">Email</label> <input type="email" id="email" name="email">
  </fieldset>
  <fieldset>
    <legend>Course</legend>
    <label for="course">Course</label>
    <select id="course" name="course">...</select>
    <fieldset>
      <legend>Batch</legend>
      <label><input type="radio" name="batch" value="morning"> Morning</label>
      <label><input type="radio" name="batch" value="evening"> Evening</label>
    </fieldset>
  </fieldset>
  <label for="notes">Comments</label>
  <textarea id="notes" name="notes"></textarea>
  <button type="submit">Register</button>
</form>`,
      playground: {
        html: `<form id="f" action="/register" method="post">
  <fieldset>
    <legend>Personal details</legend>
    <p><label for="name">Name</label><br><input id="name" name="name" value="Kavya Nair"></p>
    <p><label for="email">Email</label><br><input type="email" id="email" name="email" value="kavya@mail.com"></p>
  </fieldset>
  <fieldset>
    <legend>Course</legend>
    <p><label for="course">Course</label><br>
    <select id="course" name="course">
      <option value="web">Full Stack Web Development</option>
      <option value="data">Data Analytics</option>
      <option value="ui">UI/UX Design</option>
    </select></p>
    <fieldset>
      <legend>Batch</legend>
      <label><input type="radio" name="batch" value="morning" checked> Morning</label>
      <label><input type="radio" name="batch" value="evening"> Evening</label>
    </fieldset>
  </fieldset>
  <fieldset disabled>
    <legend>Payment (opens after approval)</legend>
    <label>Coupon <input name="coupon"></label>
  </fieldset>
  <p><label for="notes">Comments</label><br><textarea id="notes" name="notes" rows="3"></textarea></p>
  <button type="submit">Register</button>
  <button type="reset">Reset</button>
</form>
<pre id="out"></pre>`,
        css: `body { font-family: sans-serif; }
fieldset { border: 1px solid #cbd5e1; border-radius: 6px; margin-bottom: 12px; }
legend { font-weight: bold; padding: 0 6px; }
textarea { width: 100%; max-width: 400px; }`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(e.target));
  document.getElementById('out').textContent = JSON.stringify(data, null, 2);
  console.log(data);
});`,
      },
      result: 'A sectioned form with captioned borders. The Payment section is greyed out. Submitting shows name, email, course, batch and notes, but no coupon.',
      explanation: 'fieldset + legend group and caption related fields; nested fieldsets work too. fieldset disabled disables all its controls, and disabled controls are not submitted, which is why coupon is missing.',
    },
  ],
  interview: [
    { q: 'Why are labels important in forms?', a: 'They give controls an accessible name read by screen readers, increase the clickable area (clicking the label focuses/toggles the control) and make forms clearer for everyone, including voice control users.', level: 'Easy' },
    { q: 'What are the two ways to associate a label with an input?', a: 'Explicit: <label for="x"> matching the input id="x". Implicit: wrapping the input inside the <label> element.', level: 'Easy' },
    { q: 'Can a placeholder replace a label?', a: 'No. Placeholders disappear when typing, often have poor contrast, are not consistently announced by assistive technology, and are not translated by some tools. Use a visible label and optionally a placeholder as an example hint.', level: 'Medium' },
    { q: 'How do you set the default text of a <textarea>?', a: 'Put the text between the opening and closing tags. <textarea> has no value attribute in HTML (although the value property exists in JavaScript).', level: 'Easy' },
    { q: 'What is the default type of a <button> inside a form?', a: 'submit. That is why buttons used for JavaScript actions must have type="button", otherwise they submit the form.', level: 'Medium' },
    { q: 'What is the difference between <button> and <input type="submit">?', a: '<button> can contain HTML content (icons, formatted text) and has a closing tag; <input type="submit"> is a void element whose text comes from the value attribute. Both can submit a form.', level: 'Medium' },
    { q: 'What is submitted from a <select> if an <option> has no value attribute?', a: 'The text content of the selected option is submitted as the value.', level: 'Medium' },
    { q: 'How do you allow multiple selections in a dropdown and how is it submitted?', a: 'Add the multiple attribute to <select>. Each selected option is submitted as a separate name=value pair with the same name.', level: 'Medium' },
    { q: 'What is <optgroup> used for?', a: 'To group related options inside a <select> under a non-selectable label, e.g. states grouped by region.', level: 'Easy' },
    { q: 'What is the purpose of <fieldset> and <legend>?', a: '<fieldset> groups related form controls; <legend> provides its caption. Screen readers announce the legend as context for the controls inside, which is especially important for radio and checkbox groups.', level: 'Easy' },
    { q: 'What happens when you add disabled to a <fieldset>?', a: 'All form controls inside it become disabled (except those inside its first <legend>), and disabled controls are not submitted.', level: 'Hard' },
    { q: 'When would you choose radio buttons over a <select>?', a: 'When there are few options (about 2-5) that users benefit from seeing at once. A select is better for long lists where space is limited.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a contact form with labelled Name, Email and Message (textarea, 6 rows) fields and a submit button.',
      hint: 'Use for/id pairs and <button type="submit">.',
      solution: `<form action="/contact" method="post">
  <p><label for="name">Name</label><br><input type="text" id="name" name="name"></p>
  <p><label for="email">Email</label><br><input type="email" id="email" name="email"></p>
  <p><label for="message">Message</label><br><textarea id="message" name="message" rows="6"></textarea></p>
  <button type="submit">Send message</button>
</form>`,
    },
    {
      task: 'Create a "Select your city" dropdown with a placeholder option and cities grouped into "Maharashtra" (Mumbai, Pune) and "Karnataka" (Bengaluru, Mysuru). Pune should be selected by default.',
      hint: 'optgroup + selected.',
      solution: `<label for="city">Select your city</label>
<select id="city" name="city">
  <option value="">-- Select city --</option>
  <optgroup label="Maharashtra">
    <option value="mumbai">Mumbai</option>
    <option value="pune" selected>Pune</option>
  </optgroup>
  <optgroup label="Karnataka">
    <option value="bengaluru">Bengaluru</option>
    <option value="mysuru">Mysuru</option>
  </optgroup>
</select>`,
    },
    {
      task: 'Wrap a "Gender" radio group (Female, Male, Other, Prefer not to say) in a fieldset with a legend.',
      hint: 'The legend is the question; labels are the answers.',
      solution: `<fieldset>
  <legend>Gender</legend>
  <label><input type="radio" name="gender" value="female"> Female</label>
  <label><input type="radio" name="gender" value="male"> Male</label>
  <label><input type="radio" name="gender" value="other"> Other</label>
  <label><input type="radio" name="gender" value="na"> Prefer not to say</label>
</fieldset>`,
    },
    {
      task: 'Inside a form, create three buttons: one that submits with the text "Pay ₹499", one that clears the form, and one that runs JavaScript to print "Help" in the console without submitting.',
      hint: 'Use explicit types: submit, reset, button.',
      solution: `<form action="/pay" method="post">
  <input type="text" name="card" placeholder="Card holder">
  <button type="submit">Pay ₹499</button>
  <button type="reset">Clear</button>
  <button type="button" onclick="console.log('Help')">Help</button>
</form>`,
    },
    {
      task: 'Build a job application form with two fieldsets ("Personal info": name, phone; "Job": position select, experience select, cover letter textarea) and a submit button.',
      hint: 'Every control needs a label and a name.',
      solution: `<form action="/apply" method="post">
  <fieldset>
    <legend>Personal info</legend>
    <p><label for="fn">Full name</label><br><input id="fn" name="fullname"></p>
    <p><label for="ph">Phone</label><br><input type="tel" id="ph" name="phone"></p>
  </fieldset>
  <fieldset>
    <legend>Job</legend>
    <p><label for="pos">Position</label><br>
      <select id="pos" name="position">
        <option value="">-- Choose --</option>
        <option value="frontend">Frontend Developer</option>
        <option value="backend">Backend Developer</option>
        <option value="qa">QA Engineer</option>
      </select></p>
    <p><label for="exp">Experience</label><br>
      <select id="exp" name="experience">
        <option value="0">Fresher</option>
        <option value="1-3">1-3 years</option>
        <option value="3+">3+ years</option>
      </select></p>
    <p><label for="cover">Cover letter</label><br><textarea id="cover" name="cover" rows="6"></textarea></p>
  </fieldset>
  <button type="submit">Apply</button>
</form>`,
    },
  ],
  quiz: [
    { question: 'Which attribute on <label> connects it to an input?', options: ['name', 'id', 'for', 'link'], answer: 2, explanation: 'label for="x" points to the input with id="x".' },
    { question: 'How do you give a <textarea> default text?', options: ['Put the text between <textarea> and </textarea>', 'value="text"', 'placeholder="text"', 'default="text"'], answer: 0, explanation: 'Textarea content goes between its tags.' },
    { question: 'What is the default type of <button> inside a <form>?', options: ['button', 'reset', 'none', 'submit'], answer: 3, explanation: 'It defaults to submit.' },
    { question: 'Which element provides a caption for a <fieldset>?', options: ['<caption>', '<legend>', '<label>', '<title>'], answer: 1, explanation: '<legend> is the fieldset caption; <caption> is for tables.' },
    { question: 'Which attribute lets users choose several options in a <select>?', options: ['multiple', 'many', 'checkbox', 'selected'], answer: 0, explanation: 'The multiple boolean attribute allows several selections.' },
  ],
};
