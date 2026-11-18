const selectHtml = `<h1 id="title">Student Portal</h1>
<p class="info">First info paragraph</p>
<p class="info">Second info paragraph</p>
<ul id="courses">
  <li>C#</li><li>SQL Server</li><li>JavaScript</li>
</ul>
<img id="logo" src="https://picsum.photos/id/0/120/60" alt="Logo">
<div id="box"></div>`;

const selectCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.highlight { background: #fef08a; padding: 4px; border-radius: 4px; }
.done { color: #16a34a; font-weight: 600; }`;

const selectJs = `// 1. Selecting elements
const title = document.getElementById('title');
const firstInfo = document.querySelector('.info');          // first match
const allInfo = document.querySelectorAll('.info');         // NodeList of all matches
const items = document.querySelectorAll('#courses li');
console.log('title:', title.textContent);
console.log('first .info:', firstInfo.textContent);
console.log('.info count:', allInfo.length, '| li count:', items.length);

// 2. Changing text and HTML
title.textContent = 'Welcome, Riya';
document.getElementById('box').innerHTML = '<strong>Batch:</strong> .NET Full Stack (Day 61)';

// 3. Changing styles and classes
title.style.color = '#1d4ed8';
title.style.borderBottom = '3px solid #1d4ed8';
allInfo.forEach(p => p.classList.add('highlight'));
items[0].classList.add('done');
items[1].classList.toggle('done');
console.log('li[1] has done?', items[1].classList.contains('done'));

// 4. Attributes
const logo = document.getElementById('logo');
logo.setAttribute('alt', 'Skyline Academy logo');
logo.width = 160;
console.log('alt:', logo.getAttribute('alt'), '| width:', logo.width);

// 5. Traversing
const list = document.getElementById('courses');
console.log('first child:', list.firstElementChild.textContent, '| last child:', list.lastElementChild.textContent);
console.log('parent of li:', items[2].parentElement.id, '| next of C#:', items[0].nextElementSibling.textContent);`;

const createHtml = `<div class="app">
  <h3>Course list</h3>
  <div class="row">
    <input id="courseInput" placeholder="New course, e.g. React">
    <button id="addBtn">Add</button>
  </div>
  <ul id="list"></ul>
  <p id="count"></p>
</div>`;

const createCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.app { max-width: 360px; }
.row { display: flex; gap: 6px; }
.row input { flex: 1; padding: 8px; border: 1px solid #cbd5e1; border-radius: 6px; }
.row button { padding: 8px 14px; background: #2563eb; color: white; border: none; border-radius: 6px; }
#list { padding: 0; list-style: none; }
#list li { display: flex; justify-content: space-between; align-items: center; padding: 8px; margin: 6px 0; background: #f1f5f9; border-radius: 6px; }
#list li button { background: #ef4444; color: white; border: none; border-radius: 4px; padding: 2px 8px; cursor: pointer; }`;

const createJs = `const input = document.getElementById('courseInput');
const list = document.getElementById('list');

function updateCount() {
  document.getElementById('count').textContent = 'Total courses: ' + list.children.length;
}

function addCourse(name) {
  const li = document.createElement('li');          // create
  const span = document.createElement('span');
  span.textContent = name;                          // textContent is safe from HTML injection
  const del = document.createElement('button');
  del.textContent = 'x';
  del.addEventListener('click', function () {
    li.remove();                                    // remove
    updateCount();
    console.log('Removed: ' + name);
  });
  li.append(span, del);
  list.appendChild(li);                             // insert into the page
  updateCount();
}

document.getElementById('addBtn').addEventListener('click', function () {
  const name = input.value.trim();
  if (name === '') { input.focus(); return; }
  addCourse(name);
  console.log('Added: ' + name);
  input.value = '';
});

['C#', 'SQL Server', 'JavaScript'].forEach(addCourse);
console.log(document.getElementById('count').textContent);`;

const eventsHtml = `<button id="btn">Click me</button>
<input id="nameBox" placeholder="Type your name">
<p>Hello, <span id="echo">stranger</span>!</p>
<select id="city"><option>Pune</option><option>Mumbai</option><option>Delhi</option></select>
<div id="hoverBox" class="box">Hover over me</div>
<ul id="menu">
  <li data-page="home">Home</li><li data-page="courses">Courses</li><li data-page="contact">Contact</li>
</ul>
<a href="https://example.com" id="link">This link is blocked by preventDefault</a>
<p id="log" class="log"></p>`;

const eventsCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.box { margin: 10px 0; padding: 16px; background: #e0e7ff; border-radius: 8px; transition: background .2s; }
.box.over { background: #c7d2fe; }
#menu li { cursor: pointer; padding: 4px; }
#menu li.active { color: white; background: #2563eb; border-radius: 4px; }
.log { color: #475569; font-size: 14px; }`;

const eventsJs = `const log = msg => {
  document.getElementById('log').textContent = msg;
  console.log(msg);
};

// click + event object
let clicks = 0;
document.getElementById('btn').addEventListener('click', function (e) {
  clicks++;
  log('click #' + clicks + ' on ' + e.target.id + ' at x=' + e.clientX);
});

// input: fires on every keystroke
document.getElementById('nameBox').addEventListener('input', e => {
  document.getElementById('echo').textContent = e.target.value || 'stranger';
});

// keydown: detect Enter
document.getElementById('nameBox').addEventListener('keydown', e => {
  if (e.key === 'Enter') log('Enter pressed, name = ' + e.target.value);
});

// change: fires when the selection is committed
document.getElementById('city').addEventListener('change', e => log('City changed to ' + e.target.value));

// mouseenter / mouseleave
const box = document.getElementById('hoverBox');
box.addEventListener('mouseenter', () => box.classList.add('over'));
box.addEventListener('mouseleave', () => box.classList.remove('over'));

// Event delegation: ONE listener on the parent handles all li (even ones added later)
document.getElementById('menu').addEventListener('click', e => {
  if (e.target.tagName !== 'LI') return;
  document.querySelectorAll('#menu li').forEach(li => li.classList.remove('active'));
  e.target.classList.add('active');
  log('Navigate to: ' + e.target.dataset.page);
});

// preventDefault: stop the browser's default action
document.getElementById('link').addEventListener('click', e => {
  e.preventDefault();
  log('Link click prevented');
});

console.log('Listeners attached');`;

const regHtml = `<form id="regForm" class="reg" novalidate>
  <h2>Student Registration</h2>

  <div class="field">
    <label for="fullName">Full Name *</label>
    <input id="fullName" name="fullName" type="text">
    <small class="error"></small>
  </div>

  <div class="field">
    <label for="email">Email *</label>
    <input id="email" name="email" type="email">
    <small class="error"></small>
  </div>

  <div class="field">
    <label for="phone">Mobile *</label>
    <input id="phone" name="phone" type="tel" placeholder="10 digits">
    <small class="error"></small>
  </div>

  <div class="field">
    <label for="password">Password *</label>
    <input id="password" name="password" type="password">
    <small class="hint">Min 8 chars, 1 upper case, 1 number</small>
    <small class="error"></small>
  </div>

  <div class="field">
    <label for="confirm">Confirm Password *</label>
    <input id="confirm" name="confirm" type="password">
    <small class="error"></small>
  </div>

  <div class="field">
    <label for="course">Course *</label>
    <select id="course" name="course">
      <option value="">-- Select --</option>
      <option>.NET Full Stack</option>
      <option>SQL Server</option>
      <option>React</option>
    </select>
    <small class="error"></small>
  </div>

  <div class="field">
    <span class="label">Gender *</span>
    <label class="inline"><input type="radio" name="gender" value="Female"> Female</label>
    <label class="inline"><input type="radio" name="gender" value="Male"> Male</label>
    <small class="error" id="genderError"></small>
  </div>

  <div class="field">
    <label class="inline"><input type="checkbox" id="terms"> I accept the terms *</label>
    <small class="error" id="termsError"></small>
  </div>

  <button type="submit">Register</button>
  <div id="success" class="success" hidden></div>
</form>`;

const regCss = `* { box-sizing: border-box; }
body { font-family: "Segoe UI", Arial, sans-serif; background: #f1f5f9; }
.reg { max-width: 380px; margin: 16px auto; padding: 20px; background: white; border-radius: 12px; box-shadow: 0 6px 18px rgba(0,0,0,.08); }
.reg h2 { margin-top: 0; text-align: center; color: #1e3a8a; }
.field { margin-bottom: 12px; }
.field label, .field .label { display: block; font-weight: 600; margin-bottom: 4px; color: #334155; }
.field label.inline { display: inline; font-weight: normal; margin-right: 12px; }
.field input:not([type="radio"]):not([type="checkbox"]), .field select {
  width: 100%; padding: 8px; border: 2px solid #cbd5e1; border-radius: 6px; }
.field.invalid input:not([type="radio"]):not([type="checkbox"]), .field.invalid select { border-color: #ef4444; }
.field.valid input, .field.valid select { border-color: #22c55e; }
.error { display: block; color: #dc2626; font-size: 12px; min-height: 14px; }
.hint { display: block; color: #64748b; font-size: 12px; }
button[type="submit"] { width: 100%; padding: 10px; background: #2563eb; color: white; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; }
.success { margin-top: 12px; padding: 10px; background: #dcfce7; color: #166534; border-radius: 6px; }`;

const regRulesJs = `// Validation rules: each returns an error message or '' when valid
const rules = {
  fullName: v => v.trim() === '' ? 'Full name is required'
               : !/^[A-Za-z ]{3,50}$/.test(v.trim()) ? 'Only letters and spaces, 3 to 50 characters' : '',
  email: v => v.trim() === '' ? 'Email is required'
            : !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/.test(v.trim()) ? 'Enter a valid email address' : '',
  phone: v => !/^[6-9]\\d{9}$/.test(v) ? 'Enter a valid 10-digit mobile number' : '',
  password: v => v.length < 8 ? 'Password must be at least 8 characters'
               : !/[A-Z]/.test(v) ? 'Add at least one upper-case letter'
               : !/\\d/.test(v) ? 'Add at least one number' : '',
  course: v => v === '' ? 'Please select a course' : '',
};`;

const regDomJs = regRulesJs + `

const form = document.getElementById('regForm');

function showResult(input, message) {
  const field = input.closest('.field');
  field.querySelector('.error').textContent = message;
  field.classList.toggle('invalid', message !== '');
  field.classList.toggle('valid', message === '');
  return message === '';
}

function validateField(input) {
  if (input.id === 'confirm') {
    const pwd = document.getElementById('password').value;
    const msg = input.value === '' ? 'Please confirm the password'
              : input.value !== pwd ? 'Passwords do not match' : '';
    return showResult(input, msg);
  }
  return showResult(input, rules[input.id](input.value));
}

// Live validation: when the user leaves a field, and while typing after an error
['fullName', 'email', 'phone', 'password', 'confirm', 'course'].forEach(id => {
  const input = document.getElementById(id);
  input.addEventListener('blur', () => validateField(input));
  input.addEventListener('input', () => {
    if (input.closest('.field').classList.contains('invalid')) validateField(input);
  });
});

form.addEventListener('submit', function (e) {
  e.preventDefault();                       // stop the page from reloading
  let ok = true;
  ['fullName', 'email', 'phone', 'password', 'confirm', 'course'].forEach(id => {
    if (!validateField(document.getElementById(id))) ok = false;
  });

  const gender = form.querySelector('input[name="gender"]:checked');
  document.getElementById('genderError').textContent = gender ? '' : 'Please select gender';
  if (!gender) ok = false;

  const terms = document.getElementById('terms').checked;
  document.getElementById('termsError').textContent = terms ? '' : 'You must accept the terms';
  if (!terms) ok = false;

  const success = document.getElementById('success');
  if (!ok) {
    success.hidden = true;
    form.querySelector('.invalid input, .invalid select')?.focus();
    console.log('Form has errors');
    return;
  }
  const data = Object.fromEntries(new FormData(form));
  delete data.password; delete data.confirm;    // never log passwords
  success.textContent = 'Registered successfully: ' + data.fullName + ' (' + data.course + ')';
  success.hidden = false;
  console.log('Submitted:', JSON.stringify(data));
  form.reset();
  form.querySelectorAll('.field').forEach(f => f.classList.remove('valid'));
});`;

const rulesTestJs = regRulesJs + `

console.log(JSON.stringify(rules.fullName('')));
console.log(rules.fullName('Ri'));
console.log(JSON.stringify(rules.fullName('Riya Sharma')));
console.log(rules.email('riya@'), '|', JSON.stringify(rules.email('riya@example.com')));
console.log(rules.phone('12345'), '|', JSON.stringify(rules.phone('9876543210')));
console.log(rules.password('abc'));
console.log(rules.password('abcdefgh'));
console.log(rules.password('Abcdefgh'));
console.log(JSON.stringify(rules.password('Abcdefg1')));
console.log(rules.course(''));`;

export default {
  id: 'day-061-dom-manipulation-events-form-validation',
  title: 'DOM Manipulation, Events, Event Listeners and Form Validation',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 61,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Connect JavaScript to the page: understand the DOM tree, select elements, change their text, HTML, styles, classes and attributes, create and remove elements, react to user actions with addEventListener (click, input, change, keydown, submit), use the event object, preventDefault and event delegation, and validate a registration form with JavaScript and regular expressions.',
  objectives: [
    'Explain the DOM and select elements with getElementById, querySelector and querySelectorAll',
    'Change content, styles, classes and attributes and create/remove elements',
    'Handle events with addEventListener and use the event object, preventDefault and delegation',
    'Validate form fields with JavaScript, regular expressions and inline error messages',
    'Explain why client-side validation must be repeated on the server (ASP.NET Core)',
  ],
  theory: [
    {
      heading: 'What is the DOM?',
      content: "When the browser loads HTML it builds the **DOM (Document Object Model)**: a tree of objects (nodes) where every element, attribute and piece of text is an object JavaScript can read and change. `document` is the root object.\n\n```\ndocument\n └─ html\n     ├─ head ─ title\n     └─ body\n         ├─ h1#title\n         └─ ul#courses ─ li, li, li\n```\n\nChanging the DOM instantly changes what the user sees, without reloading the page. Scripts must run after the elements exist: put `<script>` at the end of body, use `defer`, or listen for `DOMContentLoaded`.",
      tip: 'In Chrome press F12 > Elements to see the live DOM; select an element and type $0 in the Console to get it as a JS object.',
    },
    {
      heading: 'Selecting elements',
      content: "- `document.getElementById('title')`: one element by id (or null).\n- `document.querySelector('.info')`: the FIRST element matching any CSS selector (`#id`, `.class`, `form input[type=email]`).\n- `document.querySelectorAll('li')`: a **NodeList** of all matches; loop with `forEach` or `for...of`.\n- Older: `getElementsByClassName`, `getElementsByTagName` (live HTMLCollections).\n- Traversal: `parentElement`, `children`, `firstElementChild`, `lastElementChild`, `nextElementSibling`, `previousElementSibling`, `closest('.field')` (nearest ancestor matching a selector).",
      syntax: "const form = document.querySelector('#regForm');\nconst inputs = form.querySelectorAll('input');",
    },
    {
      heading: 'Changing elements',
      content: "- **Text**: `el.textContent = 'Hi'` (plain text, safe).\n- **HTML**: `el.innerHTML = '<b>Hi</b>'` (parses HTML; **never** put user input in innerHTML: XSS risk).\n- **Form values**: `input.value`, `checkbox.checked`, `select.value`.\n- **Styles**: `el.style.color = 'red'` (camelCase: `backgroundColor`). Better: toggle CSS classes.\n- **Classes**: `el.classList.add('x')`, `remove`, `toggle`, `contains`; `toggle('x', condition)`.\n- **Attributes**: `getAttribute`, `setAttribute`, `removeAttribute`, `hasAttribute`; `data-*` attributes via `el.dataset.page`; `el.hidden = true`.\n- **Create/insert/remove**: `document.createElement('li')`, `parent.appendChild(el)`, `parent.append(a, b)`, `parent.prepend(el)`, `el.before()/after()`, `el.remove()`, `el.cloneNode(true)`.",
    },
    {
      heading: 'Events and event listeners',
      content: "An **event** is something that happens: click, key press, typing, form submit, page load. Register code with:\n`element.addEventListener('click', handler)`; remove with `removeEventListener`. Prefer this over `onclick=\"...\"` attributes (keeps JS separate and allows several handlers).\n\nCommon events: `click`, `dblclick`, `mouseenter`/`mouseleave`, `mouseover`, `keydown`/`keyup`, `input` (every change in a text box), `change` (select/checkbox or when a text box loses focus after a change), `focus`/`blur`, `submit` (on the form), `DOMContentLoaded`, `load`, `resize`, `scroll`.\n\nThe handler receives an **event object** `e`: `e.target` (element that triggered it), `e.currentTarget` (element the listener is on), `e.key` (keyboard), `e.clientX/Y` (mouse), `e.preventDefault()` (stop the default action like submitting a form or following a link), `e.stopPropagation()`.\n\n**Bubbling**: events travel from the target up through its ancestors. **Event delegation** uses this: put ONE listener on a parent and check `e.target`; it also works for children added later.",
      syntax: "form.addEventListener('submit', function (e) {\n  e.preventDefault();\n  // validate, then send with fetch (Day 62)\n});",
    },
    {
      heading: 'Form validation with JavaScript',
      content: "Two layers in the browser:\n1. **HTML5 validation** (Day 53): `required`, `minlength`, `pattern`, `type=email`. The JS **Constraint Validation API** exposes it: `input.checkValidity()`, `input.validity.valueMissing`, `input.validationMessage`, `input.setCustomValidity('msg')`, `form.reportValidity()`.\n2. **Custom JS validation**: add `novalidate` to the form, handle `submit`, call `e.preventDefault()`, check each field, show messages next to fields, and only submit when everything is valid.\n\n**Regular expressions** for patterns: `/^[6-9]\\d{9}$/.test(phone)` (Indian mobile), `/^[^\\s@]+@[^\\s@]+\\.[^\\s@]{2,}$/` (simple email), `/[A-Z]/` (has upper case), `/\\d/` (has digit). `^` = start, `$` = end, `\\d` = digit, `{9}` = exactly 9, `[...]` = character set, `+` = one or more.\n\nGood UX: validate on `blur` and re-validate on `input` after an error, show red/green borders, focus the first invalid field, disable double submit.\n\n**Security**: client-side validation is only for user convenience; anyone can bypass it (DevTools, Postman). ALWAYS validate again on the server with Data Annotations / ModelState in ASP.NET Core (Day 70, Day 92).",
      tip: 'jQuery Unobtrusive Validation in ASP.NET Core MVC turns your [Required]/[EmailAddress] attributes into exactly this kind of client-side check automatically.',
    },
  ],
  examples: [
    {
      title: 'Select and change elements',
      scenario: 'Read and modify the heading, paragraphs, list items and an image using the main DOM APIs.',
      steps: ['Create dom.html with the elements and dom.js linked at the end of body', 'Select elements with getElementById, querySelector and querySelectorAll', 'Change textContent, innerHTML, style, classList and attributes', 'Open the page and F12 > Elements to see the changes in the live DOM'],
      code: selectJs,
      playground: { html: selectHtml, css: selectCss, js: selectJs },
      result: 'Heading now reads "Welcome, Riya" in blue with a blue underline; both info paragraphs highlighted yellow; C# and SQL Server green and bold; a box shows "Batch: .NET Full Stack (Day 61)"; the logo is 160px wide.\nConsole:\ntitle: Student Portal\nfirst .info: First info paragraph\n.info count: 2 | li count: 3\nli[1] has done? true\nalt: Skyline Academy logo | width: 160\nfirst child: C# | last child: JavaScript\nparent of li: courses | next of C#: SQL Server',
      explanation: 'The first log happens before textContent is changed, so it prints the original title. toggle adds the class when missing (so li[1] gets done). querySelectorAll returns a NodeList, which supports forEach.',
    },
    {
      title: 'Create and remove elements',
      scenario: 'A course list where users add items from an input and delete them with an x button.',
      steps: ['Create list.html with an input, Add button, empty ul and a count paragraph', 'Write addCourse(name) using createElement, textContent, append and appendChild', 'Attach a click listener to each delete button that calls li.remove()', 'Add and remove a few courses'],
      code: createJs,
      playground: { html: createHtml, css: createCss, js: createJs },
      result: 'Three courses (C#, SQL Server, JavaScript) each with a red x button and "Total courses: 3".\nConsole on load:\nTotal courses: 3\nTyping React and clicking Add logs "Added: React" and shows "Total courses: 4"; clicking x next to SQL Server logs "Removed: SQL Server" and shows 3.',
      explanation: 'Elements created with createElement exist only in memory until appended. textContent is used for the user-typed name so HTML tags in the input are shown as text, not executed. input.focus() helps when the user clicks Add with an empty box.',
    },
    {
      title: 'Events: click, input, keydown, change, hover, delegation, preventDefault',
      scenario: 'One page demonstrating the most-used events and the event object.',
      steps: ['Create events.html', 'Attach listeners with addEventListener for each element', 'Use e.target, e.key and e.target.dataset', 'Use ONE listener on the ul for all menu items (delegation)', 'Interact with every element and watch the console'],
      code: eventsJs,
      playground: { html: eventsHtml, css: eventsCss, js: eventsJs },
      result: 'Console on load: Listeners attached\nClicking the button: "click #1 on btn at x=..." (x depends on the mouse position). Typing "Neha" updates "Hello, Neha!" live; pressing Enter logs "Enter pressed, name = Neha". Choosing Mumbai logs "City changed to Mumbai". Hovering the box darkens it. Clicking Courses highlights it blue and logs "Navigate to: courses". Clicking the link does not open the site and logs "Link click prevented".',
      explanation: 'input fires on each keystroke, change only when the value is committed. Delegation: the li click bubbles up to the ul listener, and e.target tells which li was clicked; data-page is read via dataset.page.',
    },
    {
      title: 'Validation rules with regular expressions (testable in Node)',
      scenario: 'Before wiring the form, write and test the rule functions on their own.',
      steps: ['Create rules.js with one function per field that returns an error message or an empty string', 'Use regular expressions with .test()', 'Run: node rules.js (or the playground console) and check every case'],
      code: rulesTestJs,
      playground: { html: '<p>Open the console panel.</p>', css: '', js: rulesTestJs },
      result: '"Full name is required"\nOnly letters and spaces, 3 to 50 characters\n""\nEnter a valid email address | ""\nEnter a valid 10-digit mobile number | ""\nPassword must be at least 8 characters\nAdd at least one upper-case letter\nAdd at least one number\n""\nPlease select a course',
      explanation: "Each rule returns an error message, or an empty string when the value is valid (JSON.stringify prints the empty string as \"\" so you can see it). 'Ri' fails the {3,50} length in the regex. The password rules are checked in order, so the first problem found is reported. Keeping rules as pure functions makes them easy to test and reuse for both blur and submit.",
    },
    {
      title: 'Project: Registration form with validation',
      scenario: 'Day 61 task: validate name, email, mobile, password strength, confirm password, course, gender and terms with inline messages, red/green borders and a success message.',
      steps: ['Create register.html with novalidate on the form and a <small class="error"> under each field', 'Create register.js with the rules object and validateField/showResult functions', 'Validate on blur and re-validate on input after an error', 'On submit: preventDefault, validate all, focus the first invalid field or show success', 'Test: submit empty, then fix fields one by one; finally submit valid data'],
      code: '<!-- register.html -->\n' + regHtml + '\n\n// register.js\n' + regDomJs,
      playground: { html: regHtml, css: regCss, js: regDomJs },
      result: 'Clicking Register with an empty form shows red borders and messages under every field ("Full name is required", "Email is required", "Enter a valid 10-digit mobile number", "Password must be at least 8 characters", "Please confirm the password", "Please select a course", "Please select gender", "You must accept the terms"), focuses Full Name and logs "Form has errors". Fixing a field turns its border green while typing. With valid data (Riya Sharma, riya@example.com, 9876543210, Secret123 twice, .NET Full Stack, Female, terms ticked) a green box shows "Registered successfully: Riya Sharma (.NET Full Stack)" and the console logs:\nSubmitted: {"fullName":"Riya Sharma","email":"riya@example.com","phone":"9876543210","course":".NET Full Stack","gender":"Female"}',
      explanation: 'novalidate disables the browser bubbles so our own messages are used. closest(".field") finds the wrapper for each input. FormData collects all named fields (the terms checkbox has no name so it is not included). The same rules must be enforced on the server with [Required], [EmailAddress], [RegularExpression] in ASP.NET Core.',
    },
  ],
  interview: [
    { q: 'What is the DOM?', a: 'The Document Object Model is the browser\'s in-memory tree representation of the HTML page; each element/text is a node object that JavaScript can read and modify, which updates the page.', level: 'Easy' },
    { q: 'getElementById vs querySelector vs querySelectorAll?', a: 'getElementById returns one element by id; querySelector returns the first element matching any CSS selector; querySelectorAll returns a static NodeList of all matches.', level: 'Easy' },
    { q: 'textContent vs innerHTML vs innerText?', a: 'textContent gets/sets raw text (fast, safe). innerHTML gets/sets HTML markup (parses tags; XSS risk with user input). innerText returns rendered visible text (respects CSS, slower).', level: 'Medium' },
    { q: 'What is event bubbling?', a: 'After an event fires on the target element it propagates up through each ancestor to document, triggering their listeners for the same event. stopPropagation() stops it. (Capturing is the opposite phase, top-down.)', level: 'Medium' },
    { q: 'What is event delegation and why use it?', a: 'Attaching one listener to a common parent and using e.target to identify the child. It uses fewer listeners and automatically works for elements added later.', level: 'Medium' },
    { q: 'What does preventDefault do?', a: 'Stops the browser\'s default action for the event, e.g. submitting a form/reloading the page, following a link, or checking a checkbox.', level: 'Easy' },
    { q: 'input vs change event?', a: 'input fires immediately on every change to the value; change fires when the change is committed (on blur for text inputs, immediately for select/checkbox/radio).', level: 'Medium' },
    { q: 'e.target vs e.currentTarget?', a: 'target is the element where the event originated; currentTarget is the element whose listener is currently running (the one you attached it to).', level: 'Hard' },
    { q: 'Why is client-side validation not enough?', a: 'It can be bypassed by disabling JS or sending requests directly (Postman/curl). It only improves UX; the server (ASP.NET Core ModelState/Data Annotations) must validate again.', level: 'Medium' },
    { q: 'Why does document.getElementById return null in my script?', a: 'The script ran before the element was parsed (script in head without defer). Move it to the end of body, add defer, or use DOMContentLoaded. Or the id is misspelled.', level: 'Easy' },
    { q: 'Write a regex for a 10-digit Indian mobile number starting with 6-9.', a: '/^[6-9]\\d{9}$/', level: 'Medium' },
    { q: 'How do you read the selected radio button value?', a: "document.querySelector('input[name=\"gender\"]:checked')?.value (null when none is selected).", level: 'Medium' },
  ],
  practice: [
    { task: 'Make a dark-mode toggle button that adds/removes a "dark" class on body and changes its own text.', hint: 'classList.toggle returns true/false.', solution: '<button id="theme">Dark mode</button>\n\nbody.dark { background: #0f172a; color: #e2e8f0; }\n\ndocument.getElementById("theme").addEventListener("click", e => {\n  const dark = document.body.classList.toggle("dark");\n  e.target.textContent = dark ? "Light mode" : "Dark mode";\n});' },
    { task: 'Character counter: show "45 / 200" under a textarea while typing and turn it red above 200.', hint: 'input event + value.length.', solution: '<textarea id="msg"></textarea><p id="cnt">0 / 200</p>\n\nconst msg = document.getElementById("msg"), cnt = document.getElementById("cnt");\nmsg.addEventListener("input", () => {\n  cnt.textContent = msg.value.length + " / 200";\n  cnt.style.color = msg.value.length > 200 ? "red" : "";\n});' },
    { task: 'Show/hide password: a checkbox that switches the password input type between password and text.', hint: 'input.type = checked ? "text" : "password".', solution: '<input type="password" id="pwd"> <label><input type="checkbox" id="show"> Show</label>\n\ndocument.getElementById("show").addEventListener("change", e => {\n  document.getElementById("pwd").type = e.target.checked ? "text" : "password";\n});' },
    { task: 'Build a table of students from an array and highlight a row when clicked (use delegation on tbody).', hint: 'closest("tr").', solution: 'const students = [{ n: "Riya", m: 88 }, { n: "Arjun", m: 72 }];\nconst tbody = document.querySelector("tbody");\nstudents.forEach(s => {\n  const tr = document.createElement("tr");\n  tr.innerHTML = "<td></td><td></td>";\n  tr.cells[0].textContent = s.n; tr.cells[1].textContent = s.m;\n  tbody.appendChild(tr);\n});\ntbody.addEventListener("click", e => {\n  const tr = e.target.closest("tr");\n  if (tr) tr.classList.toggle("selected");\n});' },
    { task: 'Add an "age" field (must be 18-60) and a "date of joining" field (cannot be in the future) to the registration form validation.', hint: 'Number(value) range check; new Date(value) > new Date().', solution: 'rules.age = v => v === "" ? "Age is required" : (Number(v) < 18 || Number(v) > 60) ? "Age must be 18 to 60" : "";\nrules.doj = v => v === "" ? "Date is required" : new Date(v) > new Date() ? "Date cannot be in the future" : "";\n// add "age" and "doj" to the id lists used for blur/input and submit' },
  ],
  quiz: [
    { question: 'Which method returns ALL elements matching a CSS selector?', options: ['getElementById', 'querySelector', 'querySelectorAll', 'getElement'], answer: 2, explanation: 'querySelectorAll returns a NodeList of every match.' },
    { question: 'How do you stop a form from reloading the page on submit?', options: ['return true', 'e.preventDefault()', 'e.stopPropagation()', 'form.reset()'], answer: 1, explanation: 'preventDefault cancels the default submit navigation.' },
    { question: 'Which is the safest way to display user-typed text?', options: ['el.textContent = text', 'el.innerHTML = text', 'document.write(text)', 'eval(text)'], answer: 0, explanation: 'textContent never parses HTML, preventing XSS.' },
    { question: 'Which event fires on every keystroke in a text box?', options: ['change', 'submit', 'blur', 'input'], answer: 3, explanation: 'input fires whenever the value changes.' },
    { question: 'Where must validation ALWAYS be done for security?', options: ['Only in HTML attributes', 'Only in JavaScript', 'On the server', 'In CSS'], answer: 2, explanation: 'Client checks can be bypassed; the server must validate.' },
  ],
};
