export default {
  id: 'extra-08-form-submission-enctype-formdata',
  title: 'Form Submission, Enctype and FormData',
  module: 'Extra: Forms Advanced',
  extraNo: 8,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn exactly what the browser sends when a form is submitted, how the enctype attribute changes the body format (urlencoded, multipart, plain text), why file uploads need multipart/form-data, and how the FormData API lets JavaScript read and send form data with fetch.',
  objectives: [
    'Describe the form submission process: successful controls, name/value pairs, action and method',
    'Choose the correct enctype for normal forms and file uploads',
    'Use button-level overrides like formaction, formmethod and formenctype',
    'Read, modify and send form data using the FormData API and fetch',
    'Convert FormData to URLSearchParams or a plain object/JSON',
  ],
  theory: [
    {
      heading: 'What happens when you press Submit',
      content: `When a form is submitted, the browser:
1. Runs built-in validation (required, pattern, type=email...). If something fails, it stops and shows a message.
2. Fires the \`submit\` event (JavaScript can cancel it with \`preventDefault()\`).
3. Collects the **successful controls**: inputs that have a \`name\`, are not \`disabled\`, and (for checkboxes/radios) are checked.
4. Encodes them as name=value pairs using the form's \`enctype\`.
5. Sends them to \`action\` using \`method\` (GET puts them in the URL, POST in the request body) and loads the response as a new page.

Think of it like posting a parcel: the form fields are the items, \`enctype\` is the packaging type, \`method\` is the delivery service and \`action\` is the address.`,
      tip: 'Most common bug: an input without a name attribute. It is shown on screen but is NEVER submitted.',
    },
    {
      heading: 'The three enctype values',
      content: `\`enctype\` only matters for **POST** (GET always puts data in the URL query string).

- \`application/x-www-form-urlencoded\` (default) – \`name=Asha+K&city=Pune\`. Special characters are percent-encoded. Compact and fine for text.
- \`multipart/form-data\` – the body is split into parts separated by a random **boundary** string; each part has its own headers. **Required for file uploads** (\`<input type="file">\`), because files are binary and can be large. Without it, only the file *name* is sent.
- \`text/plain\` – \`name=Asha K\` lines, not reliably parseable. Only for debugging; avoid in real apps.`,
      syntax: `<form action="/upload" method="post" enctype="multipart/form-data">
  <input type="text" name="title">
  <input type="file" name="photo" accept="image/*">
  <button>Upload</button>
</form>`,
    },
    {
      heading: 'Per-button overrides',
      content: `A submit button can override the form's settings just for that click:
- \`formaction\` – a different URL
- \`formmethod\` – get/post/dialog
- \`formenctype\` – a different encoding
- \`formtarget\` – open the response in a new tab (\`_blank\`)
- \`formnovalidate\` – skip validation (e.g. "Save draft")

The clicked button's own \`name\`/\`value\` is also included in the data, which lets the server know which button was pressed.`,
      syntax: `<button type="submit" name="action" value="publish">Publish</button>
<button type="submit" name="action" value="draft" formnovalidate>Save draft</button>`,
    },
    {
      heading: 'The FormData API',
      content: `\`FormData\` is a JavaScript object that holds name/value pairs exactly like the browser would submit them, including files.

- \`new FormData(formElement)\` – grab all successful controls of a form.
- \`new FormData(form, submitter)\` – also include the clicked button.
- \`fd.get(name)\`, \`fd.getAll(name)\` (for multiple checkboxes), \`fd.has(name)\`
- \`fd.append(name, value)\`, \`fd.set(name, value)\`, \`fd.delete(name)\`
- \`for (const [k, v] of fd)\` – loop over entries.

You can send it with \`fetch(url, { method: 'POST', body: fd })\`. The browser automatically uses **multipart/form-data** and sets the boundary. **Do not set the Content-Type header yourself**, or the boundary will be missing.`,
      syntax: `form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const res = await fetch('/api/signup', { method: 'POST', body: fd });
});`,
    },
    {
      heading: 'Converting FormData',
      content: `Many APIs expect JSON or URL-encoded data instead of multipart:
- **URL-encoded**: \`new URLSearchParams(fd)\` → \`name=Asha&city=Pune\` (use as fetch body; the Content-Type is set to urlencoded automatically). Files are not supported here.
- **Plain object / JSON**: \`Object.fromEntries(fd)\` → \`{ name: 'Asha', city: 'Pune' }\`, then \`JSON.stringify(obj)\` with header \`Content-Type: application/json\`. Note: for repeated names (checkbox groups) Object.fromEntries keeps only the last value; use \`fd.getAll()\` for those.`,
      tip: 'In this course playground the page runs in a sandboxed iframe without a backend, so we intercept submit with JavaScript and either display the data or send it to https://jsonplaceholder.typicode.com (a fake API that echoes back).',
    },
  ],
  examples: [
    {
      title: 'See exactly what a form would send',
      scenario: 'A sign-up form with text, radio, checkboxes, a disabled field and an un-named field. We print what is submitted in urlencoded format.',
      steps: [
        'Create a form with several fields, one disabled and one without name',
        'Add a submit event listener and call preventDefault()',
        'Create new FormData(form, e.submitter)',
        'Print each entry and the URLSearchParams string',
        'Click Run, fill the form and press Submit',
      ],
      code: `form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form, e.submitter);
  for (const [name, value] of fd) console.log(name, '=', value);
  console.log(new URLSearchParams(fd).toString());
});`,
      playground: {
        html: `<form id="signup" action="/signup" method="post">
  <p><label>Name <input name="name" value="Asha K"></label></p>
  <p>Plan:
    <label><input type="radio" name="plan" value="free" checked> Free</label>
    <label><input type="radio" name="plan" value="pro"> Pro</label></p>
  <p>Interests:
    <label><input type="checkbox" name="topic" value="html" checked> HTML</label>
    <label><input type="checkbox" name="topic" value="css" checked> CSS</label>
    <label><input type="checkbox" name="topic" value="js"> JS</label></p>
  <p><label>Referral (disabled) <input name="ref" value="ABC" disabled></label></p>
  <p><label>Nickname (no name attr) <input value="Ashu"></label></p>
  <button name="action" value="join">Join</button>
</form>
<pre id="out"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
pre { background: #f4f4f4; padding: 10px; white-space: pre-wrap; }`,
        js: `const form = document.getElementById('signup');
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form, e.submitter);
  const lines = [];
  for (const [name, value] of fd) lines.push(name + ' = ' + value);
  const encoded = new URLSearchParams(fd).toString();
  document.getElementById('out').textContent =
    'Entries:\\n' + lines.join('\\n') + '\\n\\nurlencoded body:\\n' + encoded +
    '\\n\\ntopic getAll: ' + JSON.stringify(fd.getAll('topic'));
  console.log(encoded);
});`,
      },
      result: 'The output lists name, plan, topic (twice), action=join and the body "name=Asha+K&plan=free&topic=html&topic=css&action=join". ref and the nickname are missing.',
      explanation: 'Disabled controls and controls without a name are not "successful" so they are skipped. Unchecked checkboxes are skipped. The submitter button is included because we passed e.submitter. URLSearchParams shows the default urlencoded format (space becomes +).',
    },
    {
      title: 'File upload preview with multipart FormData',
      scenario: 'Choose a file and see how FormData represents it (name, size, type) and what a multipart request would look like.',
      steps: [
        'Create a form with enctype="multipart/form-data" and a file input',
        'On submit, prevent default and build FormData',
        'Read fd.get("photo") which is a File object',
        'Print its name, size and type and a sketch of the multipart body',
        'Click Run, pick any small file and press Upload',
      ],
      code: `<form id="up" method="post" enctype="multipart/form-data">
  <input name="title" value="My photo">
  <input type="file" name="photo">
  <button>Upload</button>
</form>`,
      playground: {
        html: `<form id="up" action="/upload" method="post" enctype="multipart/form-data">
  <p><label>Title <input name="title" value="My photo"></label></p>
  <p><input type="file" name="photo" required></p>
  <button>Upload</button>
</form>
<pre id="out">Pick a file and click Upload.</pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
pre { background: #f4f4f4; padding: 10px; white-space: pre-wrap; font-size: 13px; }`,
        js: `const form = document.getElementById('up');
console.log('form.enctype =', form.enctype);
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const file = fd.get('photo');
  const boundary = '----WebKitFormBoundaryDemo123';
  const sketch = [
    '--' + boundary,
    'Content-Disposition: form-data; name="title"',
    '',
    fd.get('title'),
    '--' + boundary,
    'Content-Disposition: form-data; name="photo"; filename="' + file.name + '"',
    'Content-Type: ' + (file.type || 'application/octet-stream'),
    '',
    '<' + file.size + ' bytes of binary data>',
    '--' + boundary + '--'
  ].join('\\n');
  document.getElementById('out').textContent =
    'File object: ' + file.name + ', ' + file.size + ' bytes, ' + (file.type || 'unknown type') +
    '\\n\\nApproximate multipart body:\\n' + sketch;
  console.log('Is File?', file instanceof File);
});`,
      },
      result: 'After choosing a file the output shows the file details and a sketch of the multipart body with boundaries, Content-Disposition headers and the binary placeholder.',
      explanation: 'With multipart/form-data each field becomes a separate part, so binary file content can be sent safely. fd.get() on a file input returns a File object. In a real app you would send fd with fetch to a server.',
    },
    {
      title: 'Send FormData with fetch (and as JSON)',
      scenario: 'Submit a contact form without reloading the page, once as multipart and once as JSON, to a fake API.',
      steps: [
        'Create a contact form with name and message',
        'Add two buttons with value="multipart" and value="json"',
        'On submit, build FormData and check e.submitter.value',
        'Send with fetch to jsonplaceholder: body: fd OR JSON.stringify(Object.fromEntries(fd))',
        'Click Run and try both buttons',
      ],
      code: `const fd = new FormData(form);
// multipart (do NOT set Content-Type yourself)
await fetch(url, { method: 'POST', body: fd });
// JSON
await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(Object.fromEntries(fd)),
});`,
      playground: {
        html: `<form id="contact">
  <p><label>Name <input name="name" required value="Ravi"></label></p>
  <p><label>Message <textarea name="message" required>Hello!</textarea></label></p>
  <button value="multipart">Send as multipart</button>
  <button value="json">Send as JSON</button>
</form>
<p id="status"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
textarea { display: block; width: 260px; height: 60px; }`,
        js: `const form = document.getElementById('contact');
const status = document.getElementById('status');
const url = 'https://jsonplaceholder.typicode.com/posts';
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const mode = e.submitter.value;
  status.textContent = 'Sending as ' + mode + '…';
  try {
    const options = mode === 'json'
      ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.fromEntries(fd)) }
      : { method: 'POST', body: fd };
    const res = await fetch(url, options);
    const data = await res.json();
    status.textContent = 'Server replied ' + res.status + ': ' + JSON.stringify(data);
    console.log(mode, data);
  } catch (err) {
    status.textContent = 'Network error: ' + err.message;
  }
});`,
      },
      result: 'Both buttons send the data without a page reload. The JSON version replies 201 with {"name":"Ravi","message":"Hello!","id":101}; the multipart version replies 201 with {"id":101} (the fake API only parses JSON).',
      explanation: 'e.submitter tells which button submitted the form. Passing FormData as body makes fetch use multipart/form-data with an automatic boundary. Object.fromEntries converts it to a plain object for JSON APIs.',
    },
  ],
  interview: [
    { q: 'Which form controls are included when a form is submitted?', a: 'Successful controls: those with a name, not disabled, inside the form (or linked with form="id"), and for checkboxes/radios only when checked. The submitter button\'s name/value is included too. Unnamed and disabled fields are not sent.', level: 'Medium' },
    { q: 'What are the possible values of enctype?', a: 'application/x-www-form-urlencoded (default), multipart/form-data (required for files), and text/plain (debugging only).', level: 'Easy' },
    { q: 'Why do file uploads require multipart/form-data?', a: 'Files are binary and can be large. Multipart splits the body into parts with headers (filename, content type) separated by a boundary, so binary data can be sent alongside text fields. With urlencoded only the filename would be sent.', level: 'Medium' },
    { q: 'Does enctype affect GET requests?', a: 'No. GET always encodes data as a urlencoded query string in the URL; files cannot be uploaded with GET.', level: 'Medium' },
    { q: 'What is FormData?', a: 'A Web API object representing form fields as name/value pairs (including File objects). It can be built from a <form> or manually and sent directly with fetch or XMLHttpRequest.', level: 'Easy' },
    { q: 'Why should you not set Content-Type when sending FormData with fetch?', a: 'The browser must generate the multipart boundary and include it in the Content-Type header. If you set it manually, the boundary is missing and the server cannot parse the body.', level: 'Hard' },
    { q: 'How do you convert FormData to JSON?', a: 'JSON.stringify(Object.fromEntries(formData)). For fields with multiple values use formData.getAll(name). Files cannot be represented in JSON directly.', level: 'Medium' },
    { q: 'What is the difference between fd.append() and fd.set()?', a: 'append adds another value even if the name exists (multiple values); set replaces all existing values for that name with one value.', level: 'Medium' },
    { q: 'What are formaction and formnovalidate?', a: 'Attributes on submit buttons that override the form\'s action URL or disable validation for that particular submission, e.g. a "Save draft" button.', level: 'Medium' },
    { q: 'How do you know which submit button was clicked in JavaScript?', a: 'Use event.submitter in the submit event handler, and pass it to new FormData(form, event.submitter) to include its name/value.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a job application form that uploads a resume (PDF only) and a name, with the correct method and enctype.',
      hint: 'method="post", enctype="multipart/form-data", accept=".pdf".',
      solution: `<form action="/apply" method="post" enctype="multipart/form-data">
  <label>Full name <input name="fullName" required></label>
  <label>Resume <input type="file" name="resume" accept=".pdf,application/pdf" required></label>
  <button>Apply</button>
</form>`,
    },
    {
      task: 'Add two buttons to a blog editor form: "Publish" (validates) and "Save draft" (skips validation and posts to /draft).',
      hint: 'Use formaction and formnovalidate on the draft button.',
      solution: `<form action="/publish" method="post">
  <input name="title" required placeholder="Title">
  <textarea name="body" required></textarea>
  <button>Publish</button>
  <button formaction="/draft" formnovalidate>Save draft</button>
</form>`,
    },
    {
      task: 'Intercept a search form and log the GET URL that the browser would navigate to.',
      hint: 'form.action + "?" + new URLSearchParams(new FormData(form)).',
      solution: `<form id="s" action="https://example.com/search">
  <input name="q" value="html forms">
  <select name="sort"><option>newest</option><option>popular</option></select>
  <button>Search</button>
</form>
<script>
  const s = document.getElementById('s');
  s.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log(s.action + '?' + new URLSearchParams(new FormData(s)));
  });
</script>`,
    },
    {
      task: 'Build FormData manually (without a form) with a name and a generated text file, then log all entries.',
      hint: 'fd.append("file", new Blob(["hi"], { type: "text/plain" }), "note.txt").',
      solution: `<script>
  const fd = new FormData();
  fd.append('name', 'Asha');
  fd.append('file', new Blob(['Hello file'], { type: 'text/plain' }), 'note.txt');
  for (const [k, v] of fd) console.log(k, v instanceof File ? v.name + ' (' + v.size + ' bytes)' : v);
</script>`,
    },
    {
      task: 'Send a feedback form to https://jsonplaceholder.typicode.com/posts as JSON and show "Thanks!" when the response is 201.',
      hint: 'Check res.status === 201.',
      solution: `<form id="f"><input name="rating" type="number" min="1" max="5" value="5"><button>Send</button></form>
<p id="msg"></p>
<script>
  document.getElementById('f').addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = JSON.stringify(Object.fromEntries(new FormData(e.target)));
    const res = await fetch('https://jsonplaceholder.typicode.com/posts', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body
    });
    if (res.status === 201) document.getElementById('msg').textContent = 'Thanks!';
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'Which enctype is required to upload files?', options: ['application/x-www-form-urlencoded', 'text/plain', 'application/json', 'multipart/form-data'], answer: 3, explanation: 'Only multipart/form-data sends file contents.' },
    { question: 'Which field will NOT be submitted?', options: ['<input name="a" value="1">', '<input value="2">', '<input name="c" value="3" readonly>', '<input type="hidden" name="d" value="4">'], answer: 1, explanation: 'Without a name, a control is never submitted. readonly and hidden fields are submitted.' },
    { question: 'What does new URLSearchParams(new FormData(form)).toString() produce?', options: ['A urlencoded string like a=1&b=2', 'A JSON string', 'A multipart body', 'An array of entries'], answer: 0, explanation: 'URLSearchParams serializes pairs in application/x-www-form-urlencoded format.' },
    { question: 'When sending FormData with fetch, what should you do with the Content-Type header?', options: ['Set it to multipart/form-data', 'Set it to application/json', 'Leave it unset so the browser adds it with the boundary', 'Set it to text/plain'], answer: 2, explanation: 'The browser needs to add the boundary parameter itself.' },
    { question: 'Which method returns all values of a repeated field like checkboxes named "topic"?', options: ['fd.get("topic")', 'fd.getAll("topic")', 'fd.values("topic")', 'fd.all("topic")'], answer: 1, explanation: 'getAll returns an array of every value for that name.' },
  ],
};
