const basicForm = `<form action="https://httpbin.org/get" method="get">
  <label for="name">Student Name</label><br>
  <input type="text" id="name" name="name" placeholder="Riya Sharma"><br><br>

  <label for="email">Email</label><br>
  <input type="email" id="email" name="email"><br><br>

  <button type="submit">Search</button>
  <button type="reset">Clear</button>
</form>`;

const basicJs = `// Demo only: show what would be sent instead of leaving the page
document.querySelector('form').addEventListener('submit', function (e) {
  e.preventDefault();
  const data = new FormData(e.target);
  const query = new URLSearchParams(data).toString();
  console.log('GET would request: ' + e.target.action + '?' + query);
});`;

const inputTypes = `<form>
  <p><label>Text: <input type="text" name="name"></label></p>
  <p><label>Password: <input type="password" name="pwd"></label></p>
  <p><label>Email: <input type="email" name="email"></label></p>
  <p><label>Mobile: <input type="tel" name="mobile"></label></p>
  <p><label>Age: <input type="number" name="age" min="16" max="60" step="1"></label></p>
  <p><label>Date of Birth: <input type="date" name="dob"></label></p>
  <p><label>Class time: <input type="time" name="time"></label></p>
  <p><label>Favourite colour: <input type="color" name="color" value="#2563eb"></label></p>
  <p><label>Confidence (0-10): <input type="range" name="conf" min="0" max="10" value="7"></label></p>
  <p><label>Photo: <input type="file" name="photo" accept="image/*"></label></p>
  <p><label>Portfolio URL: <input type="url" name="site"></label></p>
  <p><label>Search: <input type="search" name="q"></label></p>
  <input type="hidden" name="batchId" value="B2026">
  <input type="submit" value="Submit"> <input type="reset" value="Reset">
</form>`;

const inputTypesJs = `const inputs = document.querySelectorAll('input');
console.log('Number of inputs: ' + inputs.length);
inputs.forEach(function (i) { console.log(i.name + ' -> ' + i.type); });`;

const regForm = `<h1>Student Registration</h1>
<form id="regForm" action="/Students/Register" method="post">
  <fieldset>
    <legend>Personal Details</legend>

    <label for="fullName">Full Name *</label>
    <input type="text" id="fullName" name="FullName" required minlength="3" maxlength="50" placeholder="e.g. Riya Sharma">

    <label for="email">Email *</label>
    <input type="email" id="email" name="Email" required>

    <label for="mobile">Mobile (10 digits) *</label>
    <input type="tel" id="mobile" name="Mobile" required pattern="[6-9][0-9]{9}" title="10 digit number starting with 6-9">

    <label for="age">Age *</label>
    <input type="number" id="age" name="Age" required min="16" max="60">

    <p>Gender *</p>
    <label><input type="radio" name="Gender" value="Female" required> Female</label>
    <label><input type="radio" name="Gender" value="Male"> Male</label>
    <label><input type="radio" name="Gender" value="Other"> Other</label>
  </fieldset>

  <fieldset>
    <legend>Course Details</legend>

    <label for="course">Course *</label>
    <select id="course" name="Course" required>
      <option value="">-- Select course --</option>
      <optgroup label="Microsoft">
        <option value="dotnet" selected>.NET Full Stack</option>
        <option value="azure">Azure Fundamentals</option>
      </optgroup>
      <optgroup label="Data">
        <option value="sql">SQL Server</option>
        <option value="pbi">Power BI</option>
      </optgroup>
    </select>

    <p>Skills you already know</p>
    <label><input type="checkbox" name="Skills" value="HTML"> HTML</label>
    <label><input type="checkbox" name="Skills" value="CSS"> CSS</label>
    <label><input type="checkbox" name="Skills" value="CSharp" checked> C#</label>

    <label for="address">Address</label>
    <textarea id="address" name="Address" rows="3" cols="40" maxlength="200"></textarea>

    <label for="batch">Batch</label>
    <input type="text" id="batch" name="Batch" value="Morning-2026" readonly>

    <label for="fees">Fees (fixed)</label>
    <input type="text" id="fees" value="45000" disabled>
  </fieldset>

  <label><input type="checkbox" name="Terms" required> I accept the terms *</label><br>
  <button type="submit">Register</button>
  <button type="reset">Reset</button>
</form>`;

const regCss = `body { font-family: Segoe UI, sans-serif; max-width: 520px; margin: 16px auto; }
fieldset { margin-bottom: 12px; border-radius: 6px; }
label { display: inline-block; margin: 6px 8px 2px 0; }
input[type=text], input[type=email], input[type=tel], input[type=number], select, textarea { display: block; width: 100%; padding: 6px; box-sizing: border-box; }
input:invalid { border-color: #dc2626; }`;

const regJs = `const form = document.getElementById('regForm');
form.addEventListener('submit', function (e) {
  e.preventDefault(); // demo only; a real form posts to the ASP.NET Core action
  const data = new FormData(form);
  console.log('Form is valid, sending:');
  for (const [key, value] of data.entries()) console.log(key + ' = ' + value);
});
form.addEventListener('invalid', function (e) {
  console.log('Invalid: ' + e.target.name + ' -> ' + e.target.validationMessage);
}, true);`;

const novalidateHtml = `<form id="f" novalidate>
  <input type="email" id="mail" required placeholder="Email">
  <button>Check</button>
</form>
<p id="msg"></p>`;

const novalidateJs = `const mail = document.getElementById('mail');
function report(value) {
  mail.value = value;
  console.log(JSON.stringify(value) + ' valid=' + mail.checkValidity() +
    ' valueMissing=' + mail.validity.valueMissing + ' typeMismatch=' + mail.validity.typeMismatch);
}
report('');
report('riya');
report('riya@example.com');
document.getElementById('f').addEventListener('submit', function (e) {
  e.preventDefault();
  document.getElementById('msg').textContent = mail.checkValidity() ? 'OK' : mail.validationMessage;
});`;

export default {
  id: 'day-053-html-forms-input-types-validation',
  title: 'HTML Forms: Input Types, Labels, Select, Radio, Checkbox and Validation',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 53,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Forms are how users send data to your ASP.NET Core application. Learn form, action and method (GET/POST), every common input type, labels, select, radio, checkbox, textarea, fieldset and built-in HTML5 validation, and build a full Student Registration form.',
  objectives: [
    'Explain form, action, method and the difference between GET and POST',
    'Use text, password, email, number, tel, date, time, color, range, file, hidden, submit and reset inputs',
    'Connect labels to inputs and use select/option, radio, checkbox, textarea, fieldset and legend',
    'Apply required, minlength, maxlength, min, max, pattern, placeholder, readonly and disabled',
    'Understand why the name attribute matters for ASP.NET Core model binding',
  ],
  theory: [
    {
      heading: 'The <form> element: action and method',
      content: "A **form** collects user input and sends it to a server.\n\n- `action`: URL that receives the data, e.g. `/Students/Register` (an MVC controller action).\n- `method`:\n  - **GET** (default): data goes in the URL query string `?name=Riya&age=21`. Visible, bookmarkable, limited length. Use for **search/filter**.\n  - **POST**: data goes in the request **body**. Not shown in the URL. Use for **creating/updating data, passwords, files**.\n- `enctype=\"multipart/form-data\"` is required when uploading files.\n\nOnly fields with a **`name`** attribute are sent. ASP.NET Core **model binding** matches `name=\"FullName\"` to a C# property `public string FullName { get; set; }`.",
      syntax: '<form action="/Students/Register" method="post">\n  <input name="FullName">\n  <button type="submit">Save</button>\n</form>',
      tip: 'Missing name attribute is the number-one reason a value arrives as null in a .NET controller.',
    },
    {
      heading: 'Input types',
      content: "`<input type=\"...\">` changes the control and the mobile keyboard:\n- `text`, `password` (masked), `email` (checks @ format), `tel` (phone keypad, no format check), `url`, `search`\n- `number` (spin box, `min`/`max`/`step`), `range` (slider)\n- `date`, `time`, `datetime-local`, `month`, `week` (native pickers)\n- `color` (colour picker), `file` (upload; `accept`, `multiple`)\n- `radio` (choose one), `checkbox` (choose many)\n- `hidden` (sent but not shown, e.g. an Id)\n- `submit`, `reset`, `button`",
      points: ['Unsupported types fall back to type="text"', 'value sets the default value', 'autocomplete, autofocus and multiple are useful extra attributes'],
    },
    {
      heading: 'Labels and accessibility',
      content: "Every input needs a `<label>`. Two ways:\n1. **Explicit**: `<label for=\"email\">Email</label><input id=\"email\">` (for must equal the input id).\n2. **Implicit**: wrap the input: `<label><input type=\"checkbox\"> C#</label>`.\n\nClicking the label focuses/toggles the input (bigger click target) and screen readers announce it. A **placeholder is not a label**: it disappears when typing.",
    },
    {
      heading: 'Select, radio, checkbox, textarea, fieldset',
      content: "- **`<select>`** drop-down with `<option value=\"...\">`. `selected` pre-selects, `multiple` allows many, `<optgroup label>` groups options. An empty first option + `required` forces a choice.\n- **Radio buttons**: same `name` = one group, only one can be selected. Each needs a `value`.\n- **Checkboxes**: independent on/off; same name sends several values (`Skills=HTML&Skills=CSS`), which binds to `List<string> Skills` in C#. `checked` pre-ticks.\n- **`<textarea rows cols>`**: multi-line text; default text goes between the tags (not in value).\n- **`<fieldset>` + `<legend>`**: group related fields with a caption.\n- **`<button>`** types: `submit` (default inside a form), `reset`, `button` (does nothing without JS).",
      syntax: '<select name="Course" required>\n  <option value="">-- Select --</option>\n  <option value="dotnet">.NET</option>\n</select>\n<label><input type="radio" name="Gender" value="F"> Female</label>',
    },
    {
      heading: 'HTML5 built-in validation',
      content: "The browser checks these before submitting and shows a message:\n- `required`: cannot be empty.\n- `minlength` / `maxlength`: text length.\n- `min` / `max` / `step`: numbers and dates.\n- `pattern`: regular expression the whole value must match, e.g. `[6-9][0-9]{9}`; `title` explains the rule.\n- `type=\"email\"` / `type=\"url\"`: format check.\n\nOther attributes: `placeholder` (hint), `readonly` (cannot edit but **is submitted**), `disabled` (cannot edit and **is NOT submitted**). `novalidate` on the form turns browser validation off.\n\nCSS can style `:valid` / `:invalid`, and JS can call `checkValidity()` (Day 61).",
      tip: 'Client-side validation is for user experience only. Anyone can bypass it, so ALWAYS validate again on the server with Data Annotations ([Required], [Range]) in ASP.NET Core (Day 70).',
    },
  ],
  examples: [
    {
      title: 'Form basics: action, method GET, label, submit and reset',
      scenario: 'A search form that sends name and email using GET so you can see the query string.',
      steps: ['Create search.html', 'Add a form with action and method="get"', 'Add labelled text and email inputs with name attributes', 'Add submit and reset buttons', 'Run, type values and press Search; read the console'],
      code: basicForm,
      playground: { html: basicForm, css: 'body { font-family: Segoe UI, sans-serif; }', js: basicJs },
      result: 'Typing Riya and riya@example.com then pressing Search logs:\nGET would request: https://httpbin.org/get?name=Riya&email=riya%40example.com\nReset clears both fields.',
      explanation: 'With GET the browser builds name=value pairs from each named field into the URL; @ is encoded as %40. The demo JS prevents navigation so you can see the URL.',
    },
    {
      title: 'Tour of input types',
      scenario: 'See how each input type looks and which one to use for each student field.',
      steps: ['Create inputs.html', 'Add one labelled input of each type', 'Run and click each control (date picker, colour picker, slider, file chooser)', 'Check the console list of name and type'],
      code: inputTypes,
      playground: { html: inputTypes, css: 'body { font-family: Segoe UI, sans-serif; } p { margin: 6px 0; }', js: inputTypesJs },
      result: 'Console:\nNumber of inputs: 15\nname -> text\npwd -> password\nemail -> email\nmobile -> tel\nage -> number\ndob -> date\ntime -> time\ncolor -> color\nconf -> range\nphoto -> file\nsite -> url\nq -> search\nbatchId -> hidden\n -> submit\n -> reset\nThe page shows each control; the hidden input is invisible.',
      explanation: 'Each type gives a different widget and keyboard. Submit/reset inputs have no name so they are not sent and print an empty name.',
    },
    {
      title: 'Complete Student Registration form with validation',
      scenario: 'Day 53 project: the registration form that will later post to StudentsController.Register in ASP.NET Core.',
      steps: ['Create register.html', 'Add two fieldsets with legends', 'Add text, email, tel (pattern), number (min/max), radio group, select with optgroup, checkboxes, textarea, readonly and disabled fields', 'Add required to mandatory fields and a terms checkbox', 'Run, press Register with empty fields, then fill it correctly'],
      code: regForm + '\n\n<style>\n' + regCss + '\n</style>',
      playground: { html: regForm, css: regCss, js: regJs },
      result: 'Pressing Register while empty shows the browser bubble "Please fill out this field." on Full Name, and the console lists every invalid field (e.g. "Invalid: FullName -> Please fill out this field."). With valid data (e.g. Riya Sharma, riya@example.com, 9876543210, 21, Female, .NET Full Stack, C# checked, terms ticked) the console shows:\nForm is valid, sending:\nFullName = Riya Sharma\nEmail = riya@example.com\nMobile = 9876543210\nAge = 21\nGender = Female\nCourse = dotnet\nSkills = CSharp\nAddress = \nBatch = Morning-2026\nTerms = on\n(Fees is not listed because it is disabled.)',
      explanation: 'The browser blocks submission until every constraint passes. readonly Batch is sent, disabled Fees is not. Checked checkbox without a value attribute sends "on". Field names match C# property names for model binding. Exact message text varies by browser.',
    },
    {
      title: 'Validation states from JavaScript (checkValidity)',
      scenario: 'Understand what the browser checks for type="email" required.',
      steps: ['Create validity.html', 'Add an email input with required and a form with novalidate', 'Use JS to test three values and print validity flags', 'Run and read the console'],
      code: novalidateHtml + '\n<script>\n' + novalidateJs + '\n</script>',
      playground: { html: novalidateHtml, css: '', js: novalidateJs },
      result: 'Console:\n"" valid=false valueMissing=true typeMismatch=false\n"riya" valid=false valueMissing=false typeMismatch=true\n"riya@example.com" valid=true valueMissing=false typeMismatch=false',
      explanation: 'An empty required field triggers valueMissing; text without @ triggers typeMismatch. novalidate lets our own code decide what to show (preview of Day 61).',
    },
  ],
  interview: [
    { q: 'Difference between GET and POST in forms?', a: 'GET sends data in the URL query string (visible, cached, bookmarkable, length-limited) and is for reading/searching. POST sends data in the request body and is for creating/updating data, passwords and files.', level: 'Easy' },
    { q: 'Why is the name attribute important?', a: 'Only fields with name are submitted; the name becomes the key. ASP.NET Core model binding maps it to parameters or model properties.', level: 'Easy' },
    { q: 'How do you connect a label to an input?', a: 'Use <label for="id"> matching the input id, or wrap the input inside the label.', level: 'Easy' },
    { q: 'Radio vs checkbox?', a: 'Radio buttons with the same name allow exactly one choice; checkboxes allow zero or many independent choices.', level: 'Easy' },
    { q: 'readonly vs disabled?', a: 'readonly: user cannot edit, value is submitted, focusable. disabled: cannot edit or focus and the value is NOT submitted.', level: 'Medium' },
    { q: 'Which enctype is needed for file upload?', a: 'multipart/form-data with method="post".', level: 'Medium' },
    { q: 'List HTML5 validation attributes.', a: 'required, minlength, maxlength, min, max, step, pattern, and type-based checks like email and url.', level: 'Easy' },
    { q: 'Is client-side validation enough?', a: 'No. It can be bypassed (DevTools, Postman). Always validate on the server, e.g. Data Annotations and ModelState.IsValid in ASP.NET Core.', level: 'Medium' },
    { q: 'What value does a checked checkbox send if it has no value attribute?', a: '"on". Unchecked checkboxes send nothing at all.', level: 'Hard' },
    { q: 'How do multiple checkboxes with the same name bind in ASP.NET Core?', a: 'They send repeated keys (Skills=HTML&Skills=CSS) which bind to a collection like List<string> Skills or string[] Skills.', level: 'Hard' },
    { q: 'What does the pattern attribute do?', a: 'Specifies a regular expression the entire value must match; title gives the hint shown with the error.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a login form with email, password (min 8 chars), a remember-me checkbox and a Login button using POST.', hint: 'minlength="8", method="post".', solution: '<form action="/Account/Login" method="post">\n  <label for="em">Email</label>\n  <input type="email" id="em" name="Email" required>\n  <label for="pw">Password</label>\n  <input type="password" id="pw" name="Password" required minlength="8">\n  <label><input type="checkbox" name="RememberMe" value="true"> Remember me</label>\n  <button type="submit">Login</button>\n</form>' },
    { task: 'Create a course feedback form with a 1-5 rating (radio), comments textarea and a select for the trainer.', hint: 'Same name for all radios.', solution: '<form method="post">\n  <p>Rating</p>\n  <label><input type="radio" name="Rating" value="1" required>1</label>\n  <label><input type="radio" name="Rating" value="2">2</label>\n  <label><input type="radio" name="Rating" value="3">3</label>\n  <label><input type="radio" name="Rating" value="4">4</label>\n  <label><input type="radio" name="Rating" value="5">5</label>\n  <label for="tr">Trainer</label>\n  <select id="tr" name="Trainer" required><option value="">--</option><option>Mr. Rao</option><option>Ms. Iyer</option></select>\n  <label for="c">Comments</label>\n  <textarea id="c" name="Comments" rows="4"></textarea>\n  <button>Send</button>\n</form>' },
    { task: 'Add a PIN code field that accepts exactly 6 digits.', hint: 'pattern="[0-9]{6}".', solution: '<label for="pin">PIN code</label>\n<input id="pin" name="Pin" inputmode="numeric" pattern="[0-9]{6}" title="6 digits" required>' },
    { task: 'Create an employee form with photo upload (images only) and joining date not before 2020-01-01.', hint: 'enctype, accept, min on date.', solution: '<form action="/Employees/Create" method="post" enctype="multipart/form-data">\n  <input type="text" name="Name" required>\n  <input type="date" name="JoiningDate" min="2020-01-01" required>\n  <input type="file" name="Photo" accept="image/*">\n  <button>Save</button>\n</form>' },
    { task: 'Create a multi-select of subjects where the student can pick several.', hint: 'select multiple; hold Ctrl to choose many.', solution: '<label for="subj">Subjects</label>\n<select id="subj" name="Subjects" multiple size="4">\n  <option>C#</option><option>SQL</option><option>HTML</option><option>React</option>\n</select>' },
  ],
  quiz: [
    { question: 'Which method should a registration form with a password use?', options: ['GET', 'POST', 'PUT', 'HEAD'], answer: 1, explanation: 'POST keeps data out of the URL.' },
    { question: 'Which field value is NOT submitted?', options: ['readonly', 'hidden', 'disabled', 'required'], answer: 2, explanation: 'Disabled controls are excluded from submission.' },
    { question: 'How do radio buttons become one group?', options: ['Same id', 'Same value', 'Same class', 'Same name'], answer: 3, explanation: 'Radios sharing a name are mutually exclusive.' },
    { question: 'Which attribute uses a regular expression?', options: ['pattern', 'regex', 'match', 'format'], answer: 0, explanation: 'pattern holds the regex the value must fully match.' },
    { question: 'What groups related controls with a caption?', options: ['<group> + <title>', '<section> + <h2>', '<fieldset> + <legend>', '<div> + <label>'], answer: 2, explanation: 'fieldset draws a group box and legend is its caption.' },
  ],
};
