export default {
  id: 'day-13-input-types-radio-to-reset',
  title: 'Input Types: radio, checkbox, file, color, range, hidden, submit, reset',
  module: 'Module 3: HTML Forms',
  day: 13,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Continue exploring <input> with choice controls (radio, checkbox), special pickers (file, color, range), invisible data (hidden) and the buttons that submit or reset a form.',
  objectives: [
    'Create single-choice groups with radio buttons sharing the same name',
    'Create multiple-choice options with checkboxes and understand what is submitted',
    'Use file, color and range inputs and the values they produce',
    'Explain the purpose and the security limits of hidden inputs',
    'Use submit and reset inputs and know when reset is harmful',
  ],
  theory: [
    {
      heading: 'type="radio": choose exactly one',
      content: "Radio buttons let the user pick **only one option from a group**. They are named after old car radios where pressing one station button pops the others out.\n\nHow grouping works: all radios with the **same name** form one group. Selecting one automatically deselects the others.\n\n- Each radio needs its own **value**; that value is what gets submitted (`gender=female`). Without a value, the browser sends `on`, which is useless.\n- Use the boolean **checked** attribute to pre-select a default.\n- If nothing is selected, **nothing** is sent for that group.\n- Keyboard: Tab moves into the group, arrow keys move between options.",
      syntax: '<input type="radio" id="s" name="size" value="S"> <label for="s">Small</label>\n<input type="radio" id="m" name="size" value="M" checked> <label for="m">Medium</label>\n<input type="radio" id="l" name="size" value="L"> <label for="l">Large</label>',
      tip: 'Common mistake: different names on radios of the same question, which lets users select all of them.',
    },
    {
      heading: 'type="checkbox": choose zero, one or many',
      content: "Checkboxes are independent on/off switches. Use them for:\n- **Multiple selections** (\"Which toppings do you want?\")\n- A **single yes/no agreement** (\"I accept the terms\")\n\nSubmission rules:\n- Only **checked** boxes are sent. Unchecked boxes send **nothing at all** (not \"off\" or \"false\").\n- A checked box without a value sends `on`.\n- Checkboxes in one question usually share a name, so the server receives repeated keys: `topping=cheese&topping=olives`. (Some back ends like PHP expect `name=\"topping[]\"`.)\n\nRadio vs checkbox: if options are mutually exclusive, use radio; otherwise checkbox.",
      syntax: '<input type="checkbox" id="c1" name="topping" value="cheese" checked> <label for="c1">Cheese</label>\n<input type="checkbox" id="c2" name="topping" value="olives"> <label for="c2">Olives</label>\n<input type="checkbox" id="terms" name="terms" value="yes"> <label for="terms">I agree</label>',
    },
    {
      heading: 'type="file"',
      content: "Lets users choose **files from their device**: resumes, profile pictures, documents.\n\n- `accept` limits the file picker: `accept=\"image/*\"`, `accept=\".pdf,.docx\"`, `accept=\"image/png, image/jpeg\"`. It is only a **hint**; the server must still check the file type.\n- `multiple` allows selecting several files.\n- On mobile, `capture=\"user\"` or `capture=\"environment\"` can open the front/back camera directly.\n\n**Very important:** to actually upload files, the form must use `method=\"post\"` and `enctype=\"multipart/form-data\"`. With the default encoding, only the **file name** is sent, not its content. (Enctype is covered in detail in the Extra lessons.)\n\nFor security, JavaScript cannot set a file input's value, and the browser shows a fake path like `C:\\fakepath\\resume.pdf`.",
      syntax: '<form action="/upload" method="post" enctype="multipart/form-data">\n  <input type="file" name="resume" accept=".pdf,.doc,.docx">\n  <input type="file" name="photos" accept="image/*" multiple>\n</form>',
    },
    {
      heading: 'type="color" and type="range"',
      content: "**color** opens the operating system's colour picker. The value is always a **lowercase 7-character hex code** like `#ff5733`. Default is `#000000`. Use it for theme pickers, product customisation, drawing apps.\n\n**range** shows a **slider** for choosing a number where the exact value matters less than the approximate position: volume, brightness, price filters, rating.\n- `min` (default 0), `max` (default 100), `step` (default 1), `value` (default is the midpoint)\n- The slider does **not show its number** by default. Show it with an `<output>` element and a little JavaScript, or a label.\n\nIf an exact number matters (age, quantity), use type=\"number\" instead.",
      syntax: '<input type="color" name="theme" value="#0f766e">\n<input type="range" name="volume" min="0" max="100" step="5" value="50">',
    },
    {
      heading: 'type="hidden"',
      content: "A hidden input is **not displayed** at all, but its name and value **are submitted** with the form. Uses:\n- IDs the server needs but the user should not edit: `productId`, `orderId`\n- **CSRF tokens** (a random security token that proves the form came from your site)\n- Tracking the source page or step of a multi-step form\n\n**Security warning:** hidden is **not secret** and **not tamper-proof**. Anyone can see it in View Source and change it in DevTools. Never put prices, discounts, user roles or passwords in hidden fields and trust them. The server must re-check everything.",
      syntax: '<input type="hidden" name="productId" value="SKU-1042">',
    },
    {
      heading: 'type="submit" and type="reset"',
      content: "**submit** creates a button that **submits the form**. Its `value` is the button text (default \"Submit\"). If the submit input has a **name**, its name/value pair is also sent, which is handy when a form has two submit buttons (\"Save draft\" and \"Publish\").\n\nSubmit inputs can override form attributes: `formaction`, `formmethod`, `formnovalidate`, `formtarget`.\n\n**reset** restores every field to its **initial value** (the value in the HTML), not to empty. Usability experts advise **avoiding reset buttons**: users click them by accident and lose everything they typed.\n\n`<input type=\"submit\">` cannot contain HTML (only text). `<button>` can contain icons and markup and is usually preferred (Day 14).\n\nRelated: `type=\"button\"` creates a button that does nothing by itself (used with JavaScript), and `type=\"image\"` uses an image as a submit button.",
      syntax: '<input type="submit" value="Place Order">\n<input type="reset" value="Clear form">',
    },
  ],
  examples: [
    {
      title: 'Pizza order: radio and checkbox together',
      scenario: 'Customers choose one size (radio) and any number of toppings (checkbox).',
      steps: [
        'Create order.html with a form',
        'Add three radios with name="size" and different values; pre-check Medium',
        'Add four checkboxes with name="topping"',
        'Click Run, change options and click "Place order"',
      ],
      code: `<p>Size:</p>
<label><input type="radio" name="size" value="small"> Small</label>
<label><input type="radio" name="size" value="medium" checked> Medium</label>
<label><input type="radio" name="size" value="large"> Large</label>

<p>Toppings:</p>
<label><input type="checkbox" name="topping" value="cheese" checked> Extra cheese</label>
<label><input type="checkbox" name="topping" value="olives"> Olives</label>
<label><input type="checkbox" name="topping" value="paneer"> Paneer</label>
<label><input type="checkbox" name="topping" value="jalapeno"> Jalapeño</label>

<input type="submit" value="Place order">`,
      playground: {
        html: `<form id="f">
  <p><strong>Size:</strong></p>
  <label><input type="radio" name="size" value="small"> Small</label>
  <label><input type="radio" name="size" value="medium" checked> Medium</label>
  <label><input type="radio" name="size" value="large"> Large</label>
  <p><strong>Toppings:</strong></p>
  <label><input type="checkbox" name="topping" value="cheese" checked> Extra cheese</label>
  <label><input type="checkbox" name="topping" value="olives"> Olives</label>
  <label><input type="checkbox" name="topping" value="paneer"> Paneer</label>
  <label><input type="checkbox" name="topping" value="jalapeno"> Jalapeño</label>
  <p><input type="submit" value="Place order"></p>
</form>
<pre id="out"></pre>`,
        css: `body { font-family: sans-serif; } label { margin-right: 12px; }`,
        js: `document.getElementById('f').addEventListener('submit', (e) => {
  e.preventDefault();
  const qs = new URLSearchParams(new FormData(e.target)).toString();
  document.getElementById('out').textContent = 'Submitted: ' + qs;
  console.log(qs);
});`,
      },
      result: 'Only one size can be selected at a time. Submitting shows e.g. size=medium&topping=cheese&topping=paneer.',
      explanation: 'Radios share name="size" so they form one exclusive group. Checkboxes share name="topping" and each checked one adds another topping=value pair. Unchecked boxes are simply absent.',
    },
    {
      title: 'Color and range with live output',
      scenario: 'A profile theme customiser lets users pick a colour and font size and see a live preview.',
      steps: [
        'Add <input type="color"> and <input type="range" min="12" max="32">',
        'Add an <output> element to show the slider value',
        'Use a small script to update the preview when inputs change',
        'Click Run and move the slider / pick a colour',
      ],
      code: `<input type="color" id="theme" name="theme" value="#0f766e">
<input type="range" id="size" name="fontSize" min="12" max="32" value="18">
<output id="sizeOut">18</output>px`,
      playground: {
        html: `<form>
  <p><label>Theme colour: <input type="color" id="theme" name="theme" value="#0f766e"></label> <code id="hex">#0f766e</code></p>
  <p><label>Font size: <input type="range" id="size" name="fontSize" min="12" max="32" step="1" value="18"></label>
     <output id="sizeOut" for="size">18</output>px</p>
</form>
<div id="preview">Hello, this is your profile card preview.</div>`,
        css: `#preview { padding: 16px; border-radius: 8px; color: white; background: #0f766e; font-size: 18px; font-family: sans-serif; }`,
        js: `const theme = document.getElementById('theme');
const size = document.getElementById('size');
const preview = document.getElementById('preview');
theme.addEventListener('input', () => {
  preview.style.background = theme.value;
  document.getElementById('hex').textContent = theme.value;
  console.log('colour', theme.value);
});
size.addEventListener('input', () => {
  preview.style.fontSize = size.value + 'px';
  document.getElementById('sizeOut').value = size.value;
  console.log('size', size.value, typeof size.value);
});`,
      },
      result: 'Changing the colour updates the card background and shows the hex code; moving the slider changes the text size and the number next to it.',
      explanation: 'color always returns a #rrggbb string; range returns its number as a string (note typeof is "string"). <output> is the semantic element for showing a calculated result.',
    },
    {
      title: 'File input: accept, multiple and selected file info',
      scenario: 'A job portal accepts a PDF resume and up to several certificate images.',
      steps: [
        'Create a form with method="post" and enctype="multipart/form-data"',
        'Add a file input with accept=".pdf" and another with accept="image/*" multiple',
        'Click Run and choose files',
        'See the file names, sizes and types listed',
      ],
      code: `<form action="/apply" method="post" enctype="multipart/form-data">
  <input type="file" name="resume" accept=".pdf">
  <input type="file" name="certificates" accept="image/*" multiple>
  <input type="submit" value="Apply">
</form>`,
      playground: {
        html: `<form action="/apply" method="post" enctype="multipart/form-data">
  <p><label>Resume (PDF): <input type="file" name="resume" accept=".pdf"></label></p>
  <p><label>Certificates (images): <input type="file" name="certificates" accept="image/*" multiple></label></p>
</form>
<ul id="list"></ul>`,
        js: `document.querySelectorAll('input[type=file]').forEach(input => {
  input.addEventListener('change', () => {
    const list = document.getElementById('list');
    for (const file of input.files) {
      const li = document.createElement('li');
      li.textContent = input.name + ': ' + file.name + ' (' + Math.round(file.size / 1024) + ' KB, ' + (file.type || 'unknown') + ')';
      list.appendChild(li);
    }
    console.log(input.name, 'value =', input.value);
  });
});`,
      },
      result: 'The file picker filters to PDFs or images; selected file names, sizes and MIME types are listed, and the console shows a C:\\fakepath\\... value.',
      explanation: 'accept filters the picker, multiple allows selecting several files, and input.files is a FileList. The fake path protects the user\'s real folder structure. Without enctype="multipart/form-data", the server would receive only file names.',
    },
    {
      title: 'Hidden, submit with name, and reset',
      scenario: 'A blog editor has a hidden post ID, two submit buttons (Save draft / Publish) and a reset button.',
      steps: [
        'Add a hidden input name="postId"',
        'Add two submit inputs with the same name "action" and different values',
        'Add a reset input',
        'Edit the title, click each button and observe',
      ],
      code: `<input type="hidden" name="postId" value="481">
<input type="text" name="title" value="My first post">
<input type="submit" name="action" value="Save draft">
<input type="submit" name="action" value="Publish">
<input type="reset" value="Undo changes">`,
      playground: {
        html: `<form id="f">
  <input type="hidden" name="postId" value="481">
  <p><label>Title: <input type="text" name="title" value="My first post"></label></p>
  <input type="submit" name="action" value="Save draft">
  <input type="submit" name="action" value="Publish">
  <input type="reset" value="Undo changes">
</form>
<pre id="out"></pre>`,
        js: `const f = document.getElementById('f');
f.addEventListener('submit', (e) => {
  e.preventDefault();
  const data = new FormData(f, e.submitter); // include the clicked button
  const text = [...data].map(([k, v]) => k + '=' + v).join('\\n');
  document.getElementById('out').textContent = text;
  console.log(text);
});
f.addEventListener('reset', () => console.log('Form reset to initial values (title back to "My first post")'));`,
      },
      result: 'Clicking Publish shows postId=481, title=..., action=Publish. Undo changes restores the original title, not an empty field.',
      explanation: 'The hidden input is invisible but submitted. Only the clicked submit button\'s name/value is sent, so the server knows which action was chosen. Reset restores the initial HTML values.',
    },
  ],
  interview: [
    { q: 'How do you group radio buttons so only one can be selected?', a: 'Give all radios in the group the same name attribute. Each radio should have a different value.', level: 'Easy' },
    { q: 'What is the difference between radio buttons and checkboxes?', a: 'Radio buttons allow exactly one selection from a group of mutually exclusive options. Checkboxes are independent and allow zero, one or many selections.', level: 'Easy' },
    { q: 'What is submitted for an unchecked checkbox?', a: 'Nothing. Unchecked checkboxes are not included in the form data at all. A checked checkbox without a value sends "on".', level: 'Medium' },
    { q: 'What is required to upload a file with an HTML form?', a: 'A file input with a name, method="post" and enctype="multipart/form-data" on the form. Otherwise only the file name is sent.', level: 'Medium' },
    { q: 'Does the accept attribute guarantee the file type?', a: 'No. It only filters the file picker as a hint; users can override it and requests can be forged. The server must validate file type and size.', level: 'Medium' },
    { q: 'What value does input type="color" return?', a: 'A lowercase seven-character hexadecimal colour string such as #ff8800. The default is #000000.', level: 'Easy' },
    { q: 'What are the default min, max and value of a range input?', a: 'min 0, max 100, step 1, and the default value is the midpoint between min and max (50 by default).', level: 'Medium' },
    { q: 'Is it safe to store a product price in a hidden input?', a: 'No. Hidden inputs are visible in the source and editable in DevTools. The server must look up the price itself; hidden fields should only carry non-trusted data like IDs or CSRF tokens that the server verifies.', level: 'Hard' },
    { q: 'What does a reset button do and why is it often discouraged?', a: 'It restores all fields to their initial values. It is discouraged because users may click it accidentally and lose all entered data, with little benefit.', level: 'Medium' },
    { q: 'How can one form have two different submit actions?', a: 'Use two submit buttons with the same name and different values (the server checks which was clicked), or use formaction/formmethod on each button to send to different URLs.', level: 'Hard' },
    { q: 'What is the difference between <input type="submit"> and <button type="submit">?', a: 'Both submit the form. <input type="submit"> is void and only shows text from its value. <button> can contain HTML such as icons and formatted text, so it is more flexible.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a "Preferred contact method" question with radio options Email, Phone and WhatsApp, with Email selected by default.',
      hint: 'Same name, different values, checked on Email.',
      solution: `<p>Preferred contact method:</p>
<label><input type="radio" name="contact" value="email" checked> Email</label>
<label><input type="radio" name="contact" value="phone"> Phone</label>
<label><input type="radio" name="contact" value="whatsapp"> WhatsApp</label>`,
    },
    {
      task: 'Create a "Languages you know" checkbox group (HTML, CSS, JavaScript, Python) and a separate "I agree to the terms" checkbox.',
      hint: 'Group checkboxes share a name; the agreement has its own name.',
      solution: `<p>Languages you know:</p>
<label><input type="checkbox" name="lang" value="html"> HTML</label>
<label><input type="checkbox" name="lang" value="css"> CSS</label>
<label><input type="checkbox" name="lang" value="js"> JavaScript</label>
<label><input type="checkbox" name="lang" value="python"> Python</label>
<p><label><input type="checkbox" name="terms" value="accepted"> I agree to the terms</label></p>`,
    },
    {
      task: 'Build a profile picture upload form that only shows images in the picker and actually uploads the file to /profile/photo.',
      hint: 'post + multipart/form-data + accept="image/*".',
      solution: `<form action="/profile/photo" method="post" enctype="multipart/form-data">
  <label>Profile photo <input type="file" name="photo" accept="image/*"></label>
  <input type="submit" value="Upload">
</form>`,
    },
    {
      task: 'Create a product rating slider from 1 to 5 (step 1, default 3) that shows its current value next to it using <output>.',
      hint: 'oninput on the form or input can set output.value.',
      solution: `<form oninput="r.value = rating.value">
  <label>Rating: <input type="range" id="rating" name="rating" min="1" max="5" step="1" value="3"></label>
  <output name="r" for="rating">3</output> / 5
</form>`,
    },
    {
      task: 'Create a feedback form that sends a hidden field page="checkout", a single-line comment text field, a submit input labelled "Send feedback" and no reset button.',
      hint: 'Hidden input for page; type="submit" with a value.',
      solution: `<form action="/feedback" method="post">
  <input type="hidden" name="page" value="checkout">
  <p><label>Comment <input type="text" name="comment"></label></p>
  <input type="submit" value="Send feedback">
</form>`,
    },
  ],
  quiz: [
    { question: 'What makes radio buttons belong to the same group?', options: ['The same id', 'The same value', 'The same name', 'Being next to each other'], answer: 2, explanation: 'Radios with the same name form one exclusive group.' },
    { question: 'What does an unchecked checkbox send to the server?', options: ['Nothing', '"off"', '"false"', 'An empty string'], answer: 0, explanation: 'Unchecked checkboxes are omitted from form data.' },
    { question: 'Which enctype is needed to upload files?', options: ['text/plain', 'application/json', 'application/x-www-form-urlencoded', 'multipart/form-data'], answer: 3, explanation: 'Files require multipart/form-data with POST.' },
    { question: 'What is the default value of <input type="range"> (no attributes)?', options: ['0', '50', '100', '1'], answer: 1, explanation: 'The default is the midpoint of 0 and 100.' },
    { question: 'Which statement about type="hidden" is true?', options: ['Its value is encrypted', 'It is not submitted', 'It is submitted but can be viewed and changed by users', 'Only admins can see it'], answer: 2, explanation: 'Hidden fields are invisible on the page but fully visible and editable via source/DevTools.' },
  ],
};
