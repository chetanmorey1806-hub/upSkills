export default {
  id: 'day-22-html5-input-attributes',
  title: 'HTML5 Input Attributes: datalist, autocomplete, autofocus, multiple, step',
  module: 'Module 5: HTML5 Advanced Topics',
  day: 22,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "HTML5 added attributes that make forms smarter without JavaScript: suggestion lists with <datalist>, browser autofill with autocomplete, focusing a field on load with autofocus, selecting many values with multiple, and controlling number increments with step.",
  objectives: [
    'Create suggestion lists with <datalist> and the list attribute',
    'Use autocomplete values (on/off and tokens like email, name, new-password) correctly',
    'Apply autofocus responsibly',
    'Use multiple on email, file and select inputs',
    'Control numeric, range and date increments with step',
  ],
  theory: [
    {
      heading: '<datalist> and the list attribute',
      content: "`<datalist>` gives an input a **dropdown of suggestions** while still letting the user type anything. Connect them by matching the input's `list` attribute to the datalist's `id`.\n\nAnalogy: a `<select>` is a menu where you must choose one dish; a `<datalist>` is a waiter suggesting dishes, but you can still order something else.",
      syntax: `<label for="city">City</label>
<input id="city" name="city" list="cities">
<datalist id="cities">
  <option value="Mumbai">
  <option value="Delhi">
  <option value="Bengaluru">
</datalist>`,
      tip: 'Datalist only suggests. If the value MUST be from the list, use <select> or validate it.',
    },
    {
      heading: 'autocomplete',
      content: "`autocomplete` tells the browser whether (and how) to autofill a field from saved data. Put it on `<form>` (default for all fields) or individual inputs.\n\n- `autocomplete=\"off\"`: do not autofill (e.g. one-time codes, search boxes)\n- `autocomplete=\"on\"`: browser decides\n- **Tokens** that describe the field, which give much better autofill:\n  - `name`, `given-name`, `family-name`\n  - `email`, `tel`, `street-address`, `postal-code`, `country`\n  - `username`, `current-password`, `new-password`, `one-time-code`\n  - `cc-number`, `cc-exp`, `bday`",
      syntax: `<input type="email" name="email" autocomplete="email">
<input type="password" name="pwd" autocomplete="new-password">`,
      tip: 'Using correct tokens is also an accessibility requirement (WCAG 1.3.5 Identify Input Purpose). Many browsers ignore autocomplete="off" on login fields for password managers.',
    },
    {
      heading: 'autofocus',
      content: "`autofocus` is a boolean attribute that puts the cursor in a field as soon as the page loads, so the user can type immediately (e.g. Google search box).\n\nRules:\n- Only **one** element per page should have it.\n- Avoid it on long pages or on mobile, because it scrolls the page and opens the keyboard, which can confuse screen reader users.",
      syntax: `<input type="search" name="q" autofocus>`,
    },
    {
      heading: 'multiple',
      content: "`multiple` lets a control accept more than one value:\n- `<input type=\"email\" multiple>`: comma-separated emails, each validated.\n- `<input type=\"file\" multiple>`: select several files (Ctrl/Cmd+click).\n- `<select multiple>`: choose several options (Ctrl/Cmd+click); displays as a list box.",
      syntax: `<input type="file" name="photos" accept="image/*" multiple>
<select name="skills" multiple size="4">...</select>`,
      tip: 'When submitted, a multiple select sends the same name several times: skills=html&skills=css. Server frameworks often need the name as skills[] (PHP) to read an array.',
    },
    {
      heading: 'step (with min and max)',
      content: "`step` defines the allowed **increment** for `number`, `range`, `date`, `time` and `datetime-local` inputs. The arrows/slider move by that amount, and validation rejects values that are not on a valid step.\n\n- `step=\"0.01\"`: money with paisa/cents\n- `step=\"5\"` with `min=\"0\"`: 0, 5, 10…\n- `step=\"any\"`: allow any decimal\n- For `time`, step is in **seconds** (`step=\"900\"` = 15 minutes); for `date` it is in **days** (`step=\"7\"` = weekly).\n\nValid values are counted from `min` (the step base): with `min=\"1\" step=\"2\"`, valid values are 1, 3, 5…",
      syntax: `<input type="number" name="price" min="0" step="0.01">
<input type="range" min="0" max="100" step="10">`,
      tip: 'Common bug: <input type="number"> defaults to step="1", so typing 9.99 shows "Please enter a valid value". Add step="0.01" or step="any".',
    },
  ],
  examples: [
    {
      title: 'City search with datalist suggestions',
      scenario: 'A travel site wants suggestions for popular cities but allows any city.',
      steps: [
        'Create index.html with a <form>',
        'Add <input list="cities"> with a label',
        'Add <datalist id="cities"> with several options',
        'Click Run, then click the input or type "B"',
      ],
      code: `<input id="city" list="cities" name="city">
<datalist id="cities">
  <option value="Bengaluru"><option value="Bhopal">
  <option value="Chennai"><option value="Delhi">
</datalist>`,
      playground: {
        html: `<form id="f">
  <label for="city">Destination city</label><br>
  <input id="city" name="city" list="cities" placeholder="Start typing...">
  <datalist id="cities">
    <option value="Bengaluru">
    <option value="Bhopal">
    <option value="Chennai">
    <option value="Delhi">
    <option value="Goa">
    <option value="Jaipur">
  </datalist>
  <button>Search</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
input { padding: 6px; width: 200px; }`,
        js: `document.getElementById('f').addEventListener('submit', e => {
  e.preventDefault();
  console.log('Searching flights to:', new FormData(e.target).get('city'));
});`,
      },
      result: 'Clicking or typing in the input shows a suggestion dropdown (typing B shows Bengaluru and Bhopal). Submitting logs the chosen or typed city.',
      explanation: 'list="cities" links to the datalist id. The browser filters suggestions as you type, but free text like "Shimla" is still accepted.',
    },
    {
      title: 'Signup form with autocomplete tokens and autofocus',
      scenario: 'Help users fill in a registration form quickly with browser autofill.',
      steps: [
        'Add name, email, phone and password inputs',
        'Give each the correct autocomplete token',
        'Put autofocus on the first field',
        'Click Run and focus a field to see autofill suggestions (if your browser has saved data)',
      ],
      code: `<input name="fullname" autocomplete="name" autofocus>
<input type="email" name="email" autocomplete="email">
<input type="tel" name="phone" autocomplete="tel">
<input type="password" name="pwd" autocomplete="new-password">`,
      playground: {
        html: `<form id="signup">
  <label>Full name <input name="fullname" autocomplete="name" autofocus></label>
  <label>Email <input type="email" name="email" autocomplete="email"></label>
  <label>Phone <input type="tel" name="phone" autocomplete="tel"></label>
  <label>Password <input type="password" name="pwd" autocomplete="new-password"></label>
  <label>OTP <input name="otp" inputmode="numeric" autocomplete="one-time-code"></label>
  <button>Create account</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
label { display: block; margin-bottom: 8px; }
input { display: block; padding: 6px; width: 220px; }`,
        js: `console.log('Focused element on load:', document.activeElement.name || document.activeElement.tagName);
document.querySelectorAll('input').forEach(i => console.log(i.name, '→ autocomplete =', i.autocomplete));`,
      },
      result: 'The Full name field is focused (some playgrounds block autofocus inside iframes, then BODY is logged). The console lists each field with its autocomplete token.',
      explanation: 'Tokens tell the browser exactly which saved value belongs in each field. new-password lets password managers suggest a strong password; one-time-code lets phones autofill SMS codes.',
    },
    {
      title: 'multiple on email, file and select',
      scenario: 'An invite form accepts several emails, several attachments and several skills.',
      steps: [
        'Add <input type="email" multiple>',
        'Add <input type="file" multiple accept="image/*">',
        'Add <select multiple size="4">',
        'Click Run, fill in and submit; check the console',
      ],
      code: `<input type="email" name="invite" multiple>
<input type="file" name="files" multiple>
<select name="skills" multiple size="4">...</select>`,
      playground: {
        html: `<form id="inv">
  <label>Invite (comma separated)<br><input type="email" name="invite" multiple value="a@x.com, b@y.com" size="30"></label><br><br>
  <label>Photos<br><input type="file" name="files" accept="image/*" multiple></label><br><br>
  <label>Skills (Ctrl/Cmd + click)<br>
    <select name="skills" multiple size="4">
      <option selected>HTML</option><option selected>CSS</option><option>JavaScript</option><option>React</option>
    </select>
  </label><br><br>
  <button>Send</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `document.getElementById('inv').addEventListener('submit', e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  console.log('Emails:', fd.get('invite'));
  console.log('Files chosen:', fd.getAll('files').filter(f => f.name).map(f => f.name));
  console.log('Skills:', fd.getAll('skills'));
});`,
      },
      result: 'Submitting logs both emails, the names of any chosen files, and Skills: ["HTML","CSS"] (or whatever you select).',
      explanation: 'multiple changes each control to accept a list. getAll() reads every value submitted under the same name.',
    },
    {
      title: 'step for money, ranges and time',
      scenario: 'A booking form needs price in paisa, volume in steps of 10, and 15-minute time slots.',
      steps: [
        'Add <input type="number" step="0.01">',
        'Add <input type="range" step="10"> with an <output>',
        'Add <input type="time" step="900">',
        'Click Run and try the arrows; enter 9.999 to see validation',
      ],
      code: `<input type="number" min="0" step="0.01" value="9.99">
<input type="range" min="0" max="100" step="10">
<input type="time" step="900" min="09:00" max="18:00">`,
      playground: {
        html: `<form id="b">
  <label>Price &#8377; <input type="number" name="price" min="0" step="0.01" value="9.99"></label><br><br>
  <label>Volume <input type="range" id="vol" name="vol" min="0" max="100" step="10" value="50"></label>
  <output id="out">50</output><br><br>
  <label>Slot <input type="time" name="slot" step="900" min="09:00" max="18:00" value="09:00"></label><br><br>
  <button>Book</button>
</form>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }`,
        js: `const vol = document.getElementById('vol');
vol.addEventListener('input', () => document.getElementById('out').textContent = vol.value);
document.getElementById('b').addEventListener('submit', e => {
  e.preventDefault();
  console.log(Object.fromEntries(new FormData(e.target)));
});`,
      },
      result: 'Price arrows change by 0.01, the slider jumps in tens with the value shown beside it, and the time picker offers 15-minute increments. Entering 9.999 makes the browser block submission with a "valid value" message.',
      explanation: 'step defines legal values starting from min. For time inputs, step is in seconds, so 900 = 15 minutes.',
    },
  ],
  interview: [
    { q: 'What is <datalist> and how is it different from <select>?', a: '<datalist> provides suggestions for an <input> (linked via list attribute) while still allowing free text. <select> restricts the user to the listed options.', level: 'Easy' },
    { q: 'How do you link an input to a datalist?', a: 'Set the input list attribute equal to the datalist id: <input list="x"> <datalist id="x">.', level: 'Easy' },
    { q: 'What does autocomplete="off" do, and is it always respected?', a: 'It asks the browser not to autofill the field. Browsers may ignore it for login/password fields so password managers still work.', level: 'Medium' },
    { q: 'Name some autocomplete tokens.', a: 'name, email, tel, street-address, postal-code, country, username, current-password, new-password, one-time-code, cc-number, bday.', level: 'Medium' },
    { q: 'What are the drawbacks of autofocus?', a: 'It can disorient screen reader and keyboard users, scroll the page unexpectedly and pop up mobile keyboards. Use only once per page and only when the field is the main purpose.', level: 'Medium' },
    { q: 'Which input types support the multiple attribute?', a: 'email and file (plus the <select> element).', level: 'Easy' },
    { q: 'Why does <input type="number"> reject 9.99?', a: 'The default step is 1, so only whole numbers are valid. Add step="0.01" or step="any".', level: 'Medium' },
    { q: 'What unit does step use for type="time" and type="date"?', a: 'Seconds for time (step="900" = 15 min) and days for date (step="7" = weekly).', level: 'Hard' },
    { q: 'How is a multiple select submitted?', a: 'The same name is sent once per selected option, e.g. skills=html&skills=css. In JS use FormData.getAll("skills").', level: 'Hard' },
    { q: 'What does step="any" mean?', a: 'Any value is allowed (no step validation), and the spin buttons use a step of 1.', level: 'Medium' },
  ],
  practice: [
    { task: 'Create a "Favourite browser" input with datalist suggestions Chrome, Firefox, Safari, Edge.', hint: 'list + datalist id.', solution: `<label for="b">Favourite browser</label>
<input id="b" name="browser" list="browsers">
<datalist id="browsers">
  <option value="Chrome"><option value="Firefox"><option value="Safari"><option value="Edge">
</datalist>` },
    { task: 'Build a login form with correct autocomplete tokens for username and password.', hint: 'username, current-password.', solution: `<form>
  <label>Username <input name="user" autocomplete="username"></label>
  <label>Password <input type="password" name="pwd" autocomplete="current-password"></label>
  <button>Login</button>
</form>` },
    { task: 'Create an upload field accepting multiple PDF files only.', hint: 'accept=".pdf" multiple.', solution: `<input type="file" name="docs" accept=".pdf,application/pdf" multiple>` },
    { task: 'Create a weight input in kg with 0.5 kg steps from 0 to 200, and a rating slider 1–5.', hint: 'min, max, step.', solution: `<label>Weight (kg) <input type="number" name="w" min="0" max="200" step="0.5"></label>
<label>Rating <input type="range" name="r" min="1" max="5" step="1"></label>` },
  ],
  quiz: [
    { question: 'Which attribute connects an input to a <datalist>?', options: ['for', 'data', 'list', 'options'], answer: 2, explanation: 'list="datalistId".' },
    { question: 'Best autocomplete token for a sign-up password field:', options: ['password', 'new-password', 'off', 'secret'], answer: 1, explanation: 'new-password tells password managers to suggest a new strong password.' },
    { question: 'Which input type does NOT support multiple?', options: ['email', 'file', 'number', 'Both email and file support it'], answer: 2, explanation: 'multiple works on email and file inputs (and select).' },
    { question: 'To allow prices like 49.95 in a number input use:', options: ['step="0.01"', 'step="1"', 'decimal="2"', 'precision="2"'], answer: 0, explanation: 'Default step is 1; 0.01 allows two decimal places.' },
    { question: 'How many elements should have autofocus on a page?', options: ['Every input', 'All required inputs', 'Two', 'At most one'], answer: 3, explanation: 'Only one element can receive focus on load.' },
  ],
};
