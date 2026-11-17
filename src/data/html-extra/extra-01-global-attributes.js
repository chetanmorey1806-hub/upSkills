export default {
  id: 'extra-01-global-attributes',
  title: 'Global Attributes: id, class, style, title, lang, hidden, contenteditable, draggable, tabindex, accesskey',
  module: 'Extra: Elements & Attributes',
  extraNo: 1,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Global attributes are attributes that you can put on (almost) ANY HTML element. Knowing them well lets you identify, style, describe, hide, edit and make elements keyboard-friendly without extra JavaScript.',
  objectives: [
    'Define what a global attribute is and list the most common ones',
    'Use id, class, style, title and lang correctly and know when to use each',
    'Hide content with hidden and make content editable with contenteditable',
    'Control keyboard focus with tabindex and shortcuts with accesskey',
    'Avoid common mistakes such as duplicate ids and positive tabindex values',
  ],
  theory: [
    {
      heading: 'What is a global attribute?',
      content: `Most attributes belong to specific elements: \`href\` only makes sense on \`<a>\`, \`src\` on \`<img>\`. A **global attribute** is different: it is allowed on every HTML element, from \`<p>\` to \`<section>\` to \`<button>\`.

Think of global attributes like the basic details every employee in a company has (employee ID, department, name badge), no matter what their job is. Specific attributes are like job-specific tools: only the driver gets car keys.

The most used global attributes are:
- \`id\` – a unique name for one element
- \`class\` – a group name shared by many elements
- \`style\` – inline CSS for one element
- \`title\` – extra advisory text, shown as a tooltip on hover
- \`lang\` – the human language of the content
- \`hidden\` – the element is not relevant right now and is not shown
- \`contenteditable\` – the user can edit the text directly
- \`draggable\` – the element can be dragged
- \`tabindex\` – controls whether/how the element gets keyboard focus
- \`accesskey\` – a keyboard shortcut to focus/activate the element`,
      tip: 'data-* attributes and ARIA attributes (role, aria-*) are also global. They get their own lessons.',
    },
    {
      heading: 'id vs class',
      content: `An \`id\` is like a passport number: it must be **unique in the whole page**. Use it for things you need to find exactly one of: a link target (\`<a href="#contact">\`), a \`<label for="email">\`, or \`document.getElementById()\`.

A \`class\` is like a team jersey: many players can wear the same one, and one player can wear several (\`class="card featured"\`). Use classes for styling and for selecting groups of elements.

Rules:
- id values must not contain spaces and must be unique.
- class values are a space-separated list.
- Both are case-sensitive: \`Card\` and \`card\` are different.`,
      syntax: `<section id="pricing">
  <div class="card featured">Pro plan</div>
  <div class="card">Free plan</div>
</section>
<a href="#pricing">Jump to pricing</a>`,
      tip: 'Common mistake: using the same id twice. The page still renders, but getElementById returns only the first one, label/for breaks and accessibility tools get confused.',
    },
    {
      heading: 'style, title and lang',
      content: `**style** writes CSS directly on one element: \`<p style="color: red;">\`. It is handy for quick tests or values set by JavaScript, but for real projects prefer a stylesheet with classes, because inline styles are hard to reuse and have very high specificity.

**title** gives advisory information that the browser shows as a tooltip when you hover. Do not put essential information only in \`title\`: touch-screen users and many keyboard users never see it.

**lang** tells browsers, search engines and screen readers which language the text is in. Put \`lang="en"\` on \`<html>\` and override it on parts in another language, e.g. \`<span lang="fr">bonjour</span>\`. A screen reader will then pronounce it with a French voice.`,
      syntax: `<html lang="en">
...
<p>We say <span lang="hi">namaste</span> to greet.</p>
<abbr title="HyperText Markup Language">HTML</abbr>`,
    },
    {
      heading: 'hidden and contenteditable',
      content: `**hidden** is a boolean attribute. When present, the browser does not render the element (it acts like \`display: none\`). Screen readers also skip it. It means "this is not relevant right now", for example a success message that appears only after submit. You remove it with JavaScript: \`el.hidden = false\`.

**contenteditable** turns any element into an editable area, like a mini text editor. Values: \`"true"\` (or empty), \`"false"\`, and \`"plaintext-only"\` (no rich formatting). The edited content is NOT submitted with a form automatically; you read it with \`el.textContent\` or \`el.innerHTML\` in JavaScript.`,
      syntax: `<p id="msg" hidden>Saved!</p>
<div contenteditable="true">Click and type here...</div>`,
      tip: 'A CSS rule like display:flex on the same element overrides hidden. If hidden "does not work", check your CSS.',
    },
    {
      heading: 'draggable, tabindex and accesskey',
      content: `**draggable="true"** lets the user drag an element (links and images are draggable by default). Actually dropping it somewhere needs the Drag and Drop API (covered in a later extra lesson).

**tabindex** controls keyboard focus with the Tab key:
- \`tabindex="0"\` – add a normally non-focusable element (like a \`<div>\`) to the natural Tab order.
- \`tabindex="-1"\` – focusable only by JavaScript (\`el.focus()\`), not by Tab. Useful for error summaries or modal headings.
- \`tabindex="1"\` or more – jumps the queue. **Avoid it**: it breaks the logical order of the page.

**accesskey** defines a shortcut key, e.g. \`accesskey="s"\`. The modifier differs per browser/OS (Alt+S on Chrome Windows, Alt+Shift+S on Firefox, Ctrl+Option+S on Mac). Shortcuts can clash with screen-reader or browser shortcuts, so use them sparingly.`,
      points: [
        'Prefer real interactive elements (<button>, <a>) over <div tabindex="0">.',
        'Never use positive tabindex values in production.',
        'accesskey is optional extra help, never the only way to do something.',
      ],
    },
  ],
  examples: [
    {
      title: 'id, class, style, title and lang together',
      scenario: 'Build a small profile card that uses the identification and description global attributes.',
      steps: [
        'Create index.html',
        'Add a <section> with id="profile" and two cards with a shared class',
        'Give one card an extra class and an inline style',
        'Add a title tooltip and a span with a different lang',
        'Click Run and hover over the abbreviation',
      ],
      code: `<section id="profile">
  <div class="card highlight">
    <h2>Asha</h2>
    <p>Works with <abbr title="HyperText Markup Language">HTML</abbr> daily.</p>
    <p>Favourite word: <span lang="fr">merci</span></p>
  </div>
  <div class="card" style="border-color: orange;">
    <h2>Ravi</h2>
  </div>
</section>`,
      playground: {
        html: `<section id="profile">
  <div class="card highlight">
    <h2>Asha</h2>
    <p>Works with <abbr title="HyperText Markup Language">HTML</abbr> daily (hover it).</p>
    <p>Favourite word: <span lang="fr">merci</span></p>
  </div>
  <div class="card" style="border-color: orange;">
    <h2>Ravi</h2>
    <p>This card has an inline style.</p>
  </div>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#profile { display: flex; gap: 12px; flex-wrap: wrap; }
.card { border: 2px solid #999; border-radius: 8px; padding: 12px; width: 220px; }
.highlight { background: #e6fffa; border-color: teal; }
abbr { text-decoration: underline dotted; cursor: help; }`,
        js: `console.log('Element with id profile:', document.getElementById('profile').tagName);
console.log('Number of .card elements:', document.querySelectorAll('.card').length);
console.log('lang of span:', document.querySelector('[lang]').lang);`,
      },
      result: 'Two cards side by side; the first is teal (class highlight), the second has an orange border (inline style). Hovering "HTML" shows a tooltip. The console prints SECTION, 2 and fr.',
      explanation: 'id="profile" is unique and is used by CSS (#profile) and getElementById. class="card" is shared by both cards; class="card highlight" adds a second class. The style attribute overrides the border colour only for Ravi. title produces the tooltip and lang="fr" marks the French word.',
    },
    {
      title: 'Show a hidden message and edit text in place',
      scenario: 'A note-taking box: the user edits text directly, presses Save, and a hidden "Saved" message appears.',
      steps: [
        'Create a div with contenteditable="true"',
        'Add a paragraph with the hidden attribute',
        'Add a Save button',
        'In JS, read textContent and set hidden = false on click',
        'Click Run, edit the text and press Save',
      ],
      code: `<div id="note" contenteditable="true">Click here and type your note...</div>
<button id="save">Save</button>
<p id="saved" hidden>Saved!</p>`,
      playground: {
        html: `<h3>My note</h3>
<div id="note" contenteditable="true">Click here and type your note...</div>
<button id="save">Save</button>
<p id="saved" hidden>Saved!</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#note { border: 2px dashed #888; padding: 10px; min-height: 60px; margin-bottom: 8px; }
#note:focus { outline: 3px solid royalblue; }
#saved { color: green; font-weight: bold; }`,
        js: `const note = document.getElementById('note');
const saved = document.getElementById('saved');
document.getElementById('save').addEventListener('click', () => {
  console.log('Note text:', note.textContent);
  saved.hidden = false;
  setTimeout(() => { saved.hidden = true; }, 1500);
});`,
      },
      result: 'You can type inside the dashed box. Pressing Save logs the text to the console and shows "Saved!" for 1.5 seconds.',
      explanation: 'contenteditable="true" makes the div editable. hidden keeps the message out of view until JavaScript sets saved.hidden = false. The setTimeout hides it again.',
    },
    {
      title: 'Keyboard focus with tabindex and accesskey',
      scenario: 'See the difference between tabindex="0", tabindex="-1" and a normal div, and try an accesskey shortcut.',
      steps: [
        'Add three boxes: one with tabindex="0", one with tabindex="-1", one with none',
        'Add a button with accesskey="f" that focuses the -1 box',
        'Click inside the preview and press Tab several times',
        'Press the button (or Alt+F / Alt+Shift+F) and watch the focus',
      ],
      code: `<div tabindex="0">I am in the Tab order</div>
<div id="skip" tabindex="-1">Only focusable by JS</div>
<div>Not focusable at all</div>
<button accesskey="f" id="focusBtn">Focus the -1 box (accesskey f)</button>`,
      playground: {
        html: `<p>Click here first, then press <kbd>Tab</kbd> repeatedly.</p>
<div class="box" tabindex="0">tabindex="0": I am in the Tab order</div>
<div class="box" id="skip" tabindex="-1">tabindex="-1": only focusable by JS</div>
<div class="box">no tabindex: never focusable</div>
<button accesskey="f" id="focusBtn">Focus the -1 box (accesskey f)</button>
<p draggable="true" class="box">draggable="true": try dragging me</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { border: 1px solid #aaa; padding: 8px; margin: 6px 0; border-radius: 6px; }
.box:focus { outline: 3px solid crimson; background: #fff3f3; }
[draggable="true"] { cursor: grab; }`,
        js: `document.getElementById('focusBtn').addEventListener('click', () => {
  document.getElementById('skip').focus();
});
document.addEventListener('focusin', (e) => {
  console.log('Focused:', e.target.textContent.trim().slice(0, 30));
});`,
      },
      result: 'Pressing Tab moves focus to the tabindex="0" box and then to the button; it skips the -1 box and the plain box. Clicking the button focuses the -1 box (red outline). The console logs each focused element.',
      explanation: 'tabindex="0" adds a div to the natural order. tabindex="-1" removes it from Tab but still allows el.focus(). accesskey gives the button a keyboard shortcut whose modifier depends on browser/OS. draggable="true" makes the paragraph draggable.',
    },
  ],
  interview: [
    { q: 'What is a global attribute in HTML?', a: 'An attribute that can be used on any HTML element, regardless of its type. Examples: id, class, style, title, lang, hidden, tabindex, contenteditable, draggable, accesskey, data-*, and dir.', level: 'Easy' },
    { q: 'What is the difference between id and class?', a: 'id must be unique in the document and identifies one element (used for fragment links, label for, getElementById). class can be shared by many elements and an element can have multiple classes; it is mainly used for styling and grouping.', level: 'Easy' },
    { q: 'What happens if two elements have the same id?', a: 'The HTML is invalid. Browsers still render it, but getElementById and #fragment links target only the first, label for and aria references may point to the wrong element, and CSS #id rules apply to both, causing confusing bugs.', level: 'Medium' },
    { q: 'Why should you set the lang attribute?', a: 'It tells screen readers which pronunciation rules to use, helps search engines serve the right language, and enables correct hyphenation, quotes and spell-checking. Set it on <html> and override on parts in other languages.', level: 'Easy' },
    { q: 'What does the hidden attribute do and how is it different from CSS visibility:hidden?', a: 'hidden removes the element from rendering (like display:none) and from the accessibility tree; it takes no space. visibility:hidden hides it but still reserves its space in the layout.', level: 'Medium' },
    { q: 'Explain tabindex values 0, -1 and positive numbers.', a: '0 puts the element into the natural tab order based on its DOM position. -1 makes it focusable only programmatically via focus(). Positive values force an element earlier in the order; they are an anti-pattern because they break the logical reading order.', level: 'Medium' },
    { q: 'Is content inside a contenteditable element submitted with a form?', a: 'No. Only form controls (input, textarea, select, etc.) with a name are submitted. You must read contenteditable content with JavaScript (textContent / innerHTML) and send it yourself or copy it into a hidden input.', level: 'Medium' },
    { q: 'Why should important information not be placed only in the title attribute?', a: 'The tooltip appears only on mouse hover. Touch users, most keyboard users and many screen-reader configurations never get it, so the information becomes inaccessible.', level: 'Medium' },
    { q: 'What are the drawbacks of accesskey?', a: 'The modifier keys differ by browser and OS, keys can conflict with browser or assistive-technology shortcuts, and users rarely discover them. Use them only as an optional extra.', level: 'Hard' },
    { q: 'Why is inline style usually discouraged?', a: 'It mixes content with presentation, cannot be reused, is hard to maintain, has very high specificity so it is hard to override, and cannot use media queries or pseudo-classes. It is fine for values set dynamically by JavaScript.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a page with three sections having ids intro, skills, contact and a navigation with links that jump to each section.',
      hint: 'Use href="#intro" etc. on <a> tags.',
      solution: `<nav>
  <a href="#intro">Intro</a> |
  <a href="#skills">Skills</a> |
  <a href="#contact">Contact</a>
</nav>
<section id="intro"><h2>Intro</h2><p>Hello!</p></section>
<section id="skills"><h2>Skills</h2><p>HTML, CSS</p></section>
<section id="contact"><h2>Contact</h2><p>me@example.com</p></section>`,
    },
    {
      task: 'Make three buttons that share class "btn" and give the middle one an extra class "primary". Style both classes.',
      hint: 'class="btn primary" applies two classes.',
      solution: `<style>
  .btn { padding: 8px 14px; border: 1px solid #555; border-radius: 6px; }
  .primary { background: royalblue; color: white; }
</style>
<button class="btn">Cancel</button>
<button class="btn primary">Save</button>
<button class="btn">Help</button>`,
    },
    {
      task: 'Build an FAQ answer that is hidden until a "Show answer" button is clicked.',
      hint: 'Use the hidden attribute and toggle el.hidden in JavaScript.',
      solution: `<p>What is HTML?</p>
<button id="show">Show answer</button>
<p id="answer" hidden>HTML is the markup language for web pages.</p>
<script>
  document.getElementById('show').addEventListener('click', () => {
    const a = document.getElementById('answer');
    a.hidden = !a.hidden;
  });
</script>`,
    },
    {
      task: 'Create an editable heading (contenteditable) and a button that logs its current text to the console.',
      hint: 'Read element.textContent.',
      solution: `<h1 id="title" contenteditable="true">Edit my title</h1>
<button id="log">Log title</button>
<script>
  document.getElementById('log').addEventListener('click', () => {
    console.log(document.getElementById('title').textContent);
  });
</script>`,
    },
    {
      task: 'Write a paragraph in English that contains a Spanish phrase and an abbreviation with a tooltip.',
      hint: 'Use lang="es" on a span and title on <abbr>.',
      solution: `<p lang="en">At the party everyone said <span lang="es">feliz cumpleaños</span>, and we used the
<abbr title="Cascading Style Sheets">CSS</abbr> trick for the banner.</p>`,
    },
  ],
  quiz: [
    { question: 'Which attribute must be unique in the whole document?', options: ['class', 'id', 'title', 'lang'], answer: 1, explanation: 'Only id must be unique. class values can be shared by many elements.' },
    { question: 'Which tabindex value makes an element focusable ONLY via JavaScript?', options: ['0', '1', '-1', 'auto'], answer: 2, explanation: 'tabindex="-1" removes the element from Tab order but el.focus() still works.' },
    { question: 'What does the hidden attribute do?', options: ['Makes text transparent but keeps its space', 'Removes the element from rendering, like display:none', 'Deletes the element from the DOM', 'Hides only from screen readers'], answer: 1, explanation: 'hidden stops rendering the element, it takes no space, and it is also hidden from assistive technology. It stays in the DOM.' },
    { question: 'Which attribute lets a user type directly into a <div>?', options: ['editable', 'draggable', 'spellcheck', 'contenteditable'], answer: 3, explanation: 'contenteditable="true" makes any element editable.' },
    { question: 'Where should you put lang="en" for an English page?', options: ['On the <html> element', 'On every <p>', 'On <body> only in the CSS', 'In a <meta name="lang">'], answer: 0, explanation: 'Set the page language on <html>; override on individual elements for other languages.' },
  ],
};
