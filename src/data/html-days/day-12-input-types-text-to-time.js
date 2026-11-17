export default {
  id: 'day-12-input-types-text-to-time',
  title: 'Input Types: text, password, email, number, tel, date, time',
  module: 'Module 3: HTML Forms',
  day: 12,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'The <input> element changes completely based on its type. Learn the seven most common text-like input types, what each one does on desktop and mobile, and how built-in browser checks save you from writing code.',
  objectives: [
    'Use the <input> element with the type, name, id and value attributes',
    'Choose between text, password, email, number, tel, date and time',
    'Explain how input types change mobile keyboards and built-in validation',
    'Read the value format each type submits (e.g. date as YYYY-MM-DD)',
    'Avoid common mistakes such as using number for phone numbers',
  ],
  theory: [
    {
      heading: 'The <input> element',
      content: "`<input>` is a **void element** (no closing tag) and the most versatile form control. Its **type** attribute decides what kind of control appears. If type is missing or misspelt, the browser falls back to **text**.\n\nKey attributes you will use on every input:\n- `type`: what kind of input\n- `name`: the key sent to the server (Day 11)\n- `id`: unique identifier, used to connect a `<label>` (Day 14)\n- `value`: the initial/current value\n- `placeholder`: hint text shown when empty (Day 15)\n\nWhy different types matter: the right type gives users the **right keyboard on mobile**, a **built-in picker**, and **free validation** before the form is sent.",
      syntax: '<input type="text" id="city" name="city" value="Pune">',
    },
    {
      heading: 'type="text" and type="password"',
      content: "**text** is a single-line text box for any short text: names, cities, usernames. Line breaks are not allowed (use `<textarea>` for multi-line, Day 14).\n\n**password** hides characters as dots so people nearby cannot read them. Facts to know:\n- The value is **not encrypted**; it is sent as plain text unless the page uses **HTTPS**. Always use `method=\"post\"`.\n- Password managers recognise it; help them with `autocomplete=\"current-password\"` (login) or `autocomplete=\"new-password\"` (sign-up).\n- Many sites add a \"show password\" toggle by switching the type to text with JavaScript.",
      syntax: '<input type="text" name="username">\n<input type="password" name="password" autocomplete="current-password">',
    },
    {
      heading: 'type="email" and type="tel"',
      content: "**email** expects an email address.\n- On submit, the browser checks the format (something@something) and shows an error bubble if wrong.\n- Mobile keyboards show the **@** and **.** keys.\n- Add the boolean `multiple` attribute to allow comma-separated addresses.\n- It only checks the **format**, not whether the mailbox exists.\n\n**tel** is for telephone numbers.\n- Mobile phones show a **numeric dial pad**.\n- It does **no format validation** by default, because phone formats differ worldwide (+91 98765 43210, (020) 1234-5678). Add a `pattern` attribute if you need rules (Day 15).",
      syntax: '<input type="email" name="email">\n<input type="tel" name="phone">',
      tip: 'Common mistake: using type="number" for phone numbers. Numbers drop leading zeros and the + sign, show spinner arrows, and may display in scientific notation. Use tel.',
    },
    {
      heading: 'type="number"',
      content: "**number** accepts numeric values only and shows **up/down spinner** arrows on desktop and a numeric keyboard on mobile.\n\nUseful attributes (covered in depth on Day 15 and Day 22):\n- `min` and `max`: allowed range\n- `step`: increment size (default 1; `step=\"0.01\"` for prices; `step=\"any\"` for any decimal)\n\nUse number for **quantities that you would do maths with**: age, quantity, marks, price. Do **not** use it for identifiers like phone numbers, PIN codes, credit card or Aadhaar numbers; they are \"numeric strings\", not quantities. For those, use `type=\"text\"` with `inputmode=\"numeric\"`.",
      syntax: '<input type="number" name="qty" min="1" max="10" value="1">',
    },
    {
      heading: 'type="date" and type="time"',
      content: "**date** shows a **calendar picker**. The user sees the date in their local format (e.g. 25/12/2026 in India), but the **value submitted is always ISO format `YYYY-MM-DD`** (2026-12-25). This makes server processing easy and consistent.\n\n**time** shows a time picker (hours and minutes, optionally seconds). The display may be 12-hour with AM/PM depending on the user's locale, but the **value is always 24-hour `HH:MM`** (e.g. 14:30).\n\nBoth accept `min`, `max` and `step`. Related types you will meet later: `datetime-local`, `month`, `week`.",
      syntax: '<input type="date" name="dob" min="1950-01-01" max="2026-12-31">\n<input type="time" name="slot" min="09:00" max="18:00">',
    },
  ],
  examples: [
    {
      title: 'All seven input types on one page',
      scenario: 'Create a reference page to try each type (open it on your phone too).',
      steps: [
        'Create inputs.html',
        'Add one labelled input per type',
        'Click Run, then click into each field to see its behaviour',
        'Click "Show values" to see what each field would submit',
      ],
      code: `<input type="text" name="fullname">
<input type="password" name="pwd">
<input type="email" name="email">
<input type="number" name="age">
<input type="tel" name="phone">
<input type="date" name="dob">
<input type="time" name="slot">`,
      playground: {
        html: `<form id="f">
  <p><label>Text: <input type="text" name="fullname" value="Riya Sen"></label></p>
  <p><label>Password: <input type="password" name="pwd" value="hello123"></label></p>
  <p><label>Email: <input type="email" name="email" value="riya@mail.com"></label></p>
  <p><label>Number: <input type="number" name="age" value="21"></label></p>
  <p><label>Tel: <input type="tel" name="phone" value="+91 98765 43210"></label></p>
  <p><label>Date: <input type="date" name="dob" value="2005-08-15"></label></p>
  <p><label>Time: <input type="time" name="slot" value="14:30"></label></p>
  <button type="button" id="show">Show values</button>
</form>
<pre id="out"></pre>`,
        css: `body { font-family: sans-serif; } label { display: inline-block; min-width: 260px; }`,
        js: `document.getElementById('show').addEventListener('click', () => {
  const lines = [...new FormData(document.getElementById('f'))].map(([k, v]) => k.padEnd(9) + '= ' + v);
  document.getElementById('out').textContent = lines.join('\\n');
  console.log(lines.join('\\n'));
});`,
      },
      result: 'Seven inputs: the password shows dots, number has spinners, date opens a calendar, time opens a time picker. "Show values" lists dob=2005-08-15 and slot=14:30.',
      explanation: 'Each type gives a different UI, but they all submit plain strings. Notice the date value is always YYYY-MM-DD and time is 24-hour HH:MM, regardless of how they look on screen.',
    },
    {
      title: 'Built-in email validation',
      scenario: 'A newsletter form should reject badly formatted emails without any JavaScript validation code.',
      steps: [
        'Add a form with an <input type="email" name="email">',
        'Type "riya.mail.com" and press Subscribe',
        'See the browser error bubble',
        'Fix it to riya@mail.com and submit again',
      ],
      code: `<form>
  <input type="email" name="email">
  <button type="submit">Subscribe</button>
</form>`,
      playground: {
        html: `<form id="f">
  <label>Email: <input type="email" name="email" value="riya.mail.com"></label>
  <button type="submit">Subscribe</button>
</form>
<p id="msg"></p>`,
        js: `const input = document.querySelector('input[type=email]');
input.addEventListener('input', () => {
  console.log(JSON.stringify(input.value), 'valid format?', input.validity.valid);
});
console.log('Initial value valid?', input.validity.valid, '-', input.validationMessage);
document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault(); // only runs when the browser's checks pass
  document.getElementById('msg').textContent = 'Subscribed: ' + input.value;
});`,
      },
      result: 'Pressing Subscribe with "riya.mail.com" shows a browser message like "Please include an \'@\' in the email address". After fixing it, "Subscribed: riya@mail.com" appears.',
      explanation: 'type="email" adds automatic format validation. The submit event only fires when all fields are valid. validity.valid lets JavaScript check the same rule. Server-side validation is still required because browser checks can be bypassed.',
    },
    {
      title: 'Show / hide password toggle',
      scenario: 'Login pages often let users reveal their password to check for typos.',
      steps: [
        'Add a password input',
        'Add a checkbox labelled "Show password"',
        'With a tiny script, switch the type between password and text',
        'Click Run and toggle the checkbox',
      ],
      code: `<input type="password" id="pwd" name="password">
<label><input type="checkbox" id="toggle"> Show password</label>

<script>
  toggle.addEventListener('change', () => {
    pwd.type = toggle.checked ? 'text' : 'password';
  });
</script>`,
      playground: {
        html: `<p><label for="pwd">Password</label><br>
<input type="password" id="pwd" name="password" value="MyS3cret!" autocomplete="current-password"></p>
<label><input type="checkbox" id="toggle"> Show password</label>`,
        js: `const pwd = document.getElementById('pwd');
const toggle = document.getElementById('toggle');
toggle.addEventListener('change', () => {
  pwd.type = toggle.checked ? 'text' : 'password';
  console.log('input type is now', pwd.type);
});`,
      },
      result: 'The password displays as dots; ticking "Show password" reveals MyS3cret!, unticking hides it again.',
      explanation: 'The value never changes; only the type, which controls how it is displayed. This proves type="password" is a visual mask, not encryption.',
    },
    {
      title: 'Why phone numbers must not use type="number"',
      scenario: 'Compare number and tel fields with the same Indian phone number and a PIN code with a leading zero.',
      steps: [
        'Add a number input and a tel input, both with the value 09876543210',
        'Add a PIN code field using text + inputmode="numeric"',
        'Click Run and read the console',
      ],
      code: `<input type="number" name="phone1" value="09876543210">
<input type="tel" name="phone2" value="09876543210">
<input type="text" inputmode="numeric" name="pin" value="011001">`,
      playground: {
        html: `<p>number: <input type="number" id="n" value="09876543210"></p>
<p>tel: <input type="tel" id="t" value="09876543210"></p>
<p>PIN (text + inputmode): <input type="text" inputmode="numeric" id="p" value="011001"></p>`,
        js: `const n = document.getElementById('n');
const t = document.getElementById('t');
console.log('number valueAsNumber:', n.valueAsNumber, '(leading zero lost if used as a number)');
console.log('tel value:', t.value, '(kept exactly as typed)');
console.log('PIN value:', document.getElementById('p').value);
n.value = '+919876543210';
console.log('number with + sign ->', JSON.stringify(n.value), '(rejected, empty string)');`,
      },
      result: 'The console shows the number field treats the value as 9876543210 and rejects "+91...", while tel keeps 09876543210 exactly.',
      explanation: 'type="number" is for quantities; it cannot hold "+" or spaces and loses meaning of leading zeros. type="tel" keeps the exact text and still shows a dial pad on mobile. inputmode="numeric" gives a numeric keyboard for codes like PIN without number semantics.',
    },
    {
      title: 'Appointment booking with date and time limits',
      scenario: 'A clinic accepts bookings only within 2026 and between 9 AM and 6 PM.',
      steps: [
        'Add a date input with min and max',
        'Add a time input with min and max',
        'Submit with a time outside the range to see the browser message',
      ],
      code: `<input type="date" name="day" min="2026-01-01" max="2026-12-31" required>
<input type="time" name="slot" min="09:00" max="18:00" required>`,
      playground: {
        html: `<form id="f">
  <p><label>Date: <input type="date" name="day" min="2026-01-01" max="2026-12-31" value="2026-12-20" required></label></p>
  <p><label>Time: <input type="time" name="slot" min="09:00" max="18:00" value="20:00" required></label></p>
  <button type="submit">Book</button>
</form>
<p id="msg"></p>`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const d = new FormData(e.target);
  document.getElementById('msg').textContent = 'Booked for ' + d.get('day') + ' at ' + d.get('slot');
  console.log(Object.fromEntries(d));
});`,
      },
      result: 'Clicking Book with 20:00 shows an error like "Value must be 18:00 or earlier". After choosing 11:30, it shows "Booked for 2026-12-20 at 11:30".',
      explanation: 'min and max on date/time inputs restrict the picker and trigger validation. The submitted values are in the standard formats. (required and min/max are explored fully on Day 15.)',
    },
  ],
  interview: [
    { q: 'What happens if you give an input an unknown type like type="phone"?', a: 'The browser ignores the invalid value and falls back to type="text".', level: 'Easy' },
    { q: 'Is type="password" secure?', a: 'It only masks characters on screen. The value is plain text in the DOM and in the request; real security needs HTTPS, POST and proper server-side hashing.', level: 'Medium' },
    { q: 'What does type="email" give you over type="text"?', a: 'Automatic format validation on submit, an email-optimised keyboard on mobile (with @), autofill hints, and support for the multiple attribute.', level: 'Easy' },
    { q: 'Why should you use type="tel" and not type="number" for phone numbers?', a: 'Phone numbers are identifiers, not quantities. number treats the value as a quantity (leading zeros become meaningless), rejects + and spaces, shows spinners and can increment the value. tel accepts any characters and shows a dial pad on mobile.', level: 'Medium' },
    { q: 'In what format does type="date" submit its value?', a: 'Always ISO 8601 YYYY-MM-DD (e.g. 2026-03-15), regardless of how the date is displayed to the user.', level: 'Medium' },
    { q: 'In what format does type="time" submit its value?', a: '24-hour HH:MM (or HH:MM:SS if step allows seconds), e.g. 14:30, even if the UI shows 2:30 PM.', level: 'Medium' },
    { q: 'Does type="email" verify that the email address exists?', a: 'No. It only checks that the text matches a valid email format. Verifying existence requires sending a confirmation email from the server.', level: 'Easy' },
    { q: 'What is inputmode and how is it different from type?', a: 'inputmode is a hint for which virtual keyboard to show (numeric, decimal, tel, email, url, search) without changing the input semantics or validation. type changes the control behaviour and validation.', level: 'Hard' },
    { q: 'Why is client-side validation not enough?', a: 'Users can disable it, edit the HTML in DevTools or send requests directly with tools like curl or Postman. The server must always validate data again.', level: 'Medium' },
    { q: 'What does the step attribute do on type="number"?', a: 'It defines the allowed increment and the spinner step. Default is 1 (whole numbers). step="0.01" allows two decimals; step="any" allows any decimal.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a login form with a username (text) and password field that posts to /login.',
      hint: 'Give each input a name; password uses type="password".',
      solution: `<form action="/login" method="post">
  <p><label>Username <input type="text" name="username" autocomplete="username"></label></p>
  <p><label>Password <input type="password" name="password" autocomplete="current-password"></label></p>
  <button type="submit">Log in</button>
</form>`,
    },
    {
      task: 'Build a contact form with full name, email and mobile number using the most suitable types.',
      hint: 'text, email, tel.',
      solution: `<form action="/contact" method="post">
  <p><label>Full name <input type="text" name="fullname"></label></p>
  <p><label>Email <input type="email" name="email"></label></p>
  <p><label>Mobile <input type="tel" name="mobile"></label></p>
  <button type="submit">Send</button>
</form>`,
    },
    {
      task: 'Create an order form where quantity can only be 1 to 5, and price per item accepts two decimal places.',
      hint: 'number with min, max and step.',
      solution: `<form>
  <p><label>Quantity <input type="number" name="qty" min="1" max="5" value="1"></label></p>
  <p><label>Price (₹) <input type="number" name="price" min="0" step="0.01" value="199.99"></label></p>
  <button type="submit">Add to cart</button>
</form>`,
    },
    {
      task: 'Create an event registration form with a date of birth (must be on or before 2010-12-31), an event date in June 2026, and a preferred time between 10:00 and 16:00.',
      hint: 'Use min and max with ISO formats.',
      solution: `<form action="/event" method="post">
  <p><label>Date of birth <input type="date" name="dob" max="2010-12-31"></label></p>
  <p><label>Event date <input type="date" name="eventDate" min="2026-06-01" max="2026-06-30"></label></p>
  <p><label>Preferred time <input type="time" name="time" min="10:00" max="16:00"></label></p>
  <button type="submit">Register</button>
</form>`,
    },
    {
      task: 'Pick the best type for each and write the input: age, Aadhaar number (12 digits), office email, alarm time, birthday, OTP (6 digits).',
      hint: 'Ask: is it a quantity or an identifier?',
      solution: `<input type="number" name="age" min="0" max="120">
<input type="text" name="aadhaar" inputmode="numeric">
<input type="email" name="workEmail">
<input type="time" name="alarm">
<input type="date" name="birthday">
<input type="text" name="otp" inputmode="numeric" autocomplete="one-time-code">`,
    },
  ],
  quiz: [
    { question: 'What does a browser use if the type attribute is missing?', options: ['password', 'hidden', 'text', 'number'], answer: 2, explanation: 'text is the default input type.' },
    { question: 'Which type is best for a mobile number?', options: ['tel', 'number', 'phone', 'mobile'], answer: 0, explanation: 'tel keeps the exact text and shows a dial pad on phones.' },
    { question: 'A user picks 5 March 2026 in a date input. What value is submitted?', options: ['05/03/2026', '03/05/2026', '5 March 2026', '2026-03-05'], answer: 3, explanation: 'Date inputs always submit YYYY-MM-DD.' },
    { question: 'Which input type automatically checks for an @ symbol?', options: ['text', 'email', 'url', 'tel'], answer: 1, explanation: 'type="email" validates the email format.' },
    { question: 'What does type="password" do?', options: ['Encrypts the value', 'Sends the value via POST automatically', 'Masks the characters on screen', 'Stores the password in a cookie'], answer: 2, explanation: 'It only hides the characters visually.' },
  ],
};
