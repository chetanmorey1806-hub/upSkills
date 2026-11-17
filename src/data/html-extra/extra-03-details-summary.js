export default {
  id: 'extra-03-details-summary',
  title: 'Details and Summary: Native Accordions and Disclosure Widgets',
  module: 'Extra: Elements & Attributes',
  extraNo: 3,
  level: 'Beginner',
  duration: '1 hour',
  summary: 'The <details> and <summary> elements create a show/hide (disclosure) widget with zero JavaScript. They are perfect for FAQs, accordions and "read more" sections, and are keyboard and screen-reader friendly by default.',
  objectives: [
    'Build a disclosure widget with <details> and <summary>',
    'Open it by default with the open attribute',
    'Create an exclusive accordion using the name attribute',
    'Style the marker and react to the toggle event in JavaScript',
  ],
  theory: [
    {
      heading: 'What are <details> and <summary>?',
      content: `A **disclosure widget** is a piece of UI that hides extra content until the user asks for it, like a folded letter: you see the heading on the outside and unfold it to read more.

\`<details>\` is the container. \`<summary>\` is its **first child** and is the always-visible, clickable label. Everything else inside \`<details>\` is hidden until it is opened.

The browser handles everything for you: clicking, pressing Enter/Space, the little triangle marker, and telling screen readers whether it is expanded or collapsed.`,
      syntax: `<details>
  <summary>What is HTML?</summary>
  <p>HTML is the standard markup language for web pages.</p>
</details>`,
      tip: 'If you forget <summary>, the browser shows a default label "Details". Always write your own summary.',
    },
    {
      heading: 'The open attribute',
      content: `\`open\` is a boolean attribute. If it is present, the details are expanded. The browser adds/removes it automatically when the user clicks, so you can also read it: \`details.open\` is \`true\` or \`false\`.

Use \`<details open>\` when you want a section expanded on first load, for example the first FAQ question.`,
      syntax: `<details open>
  <summary>Shipping</summary>
  <p>Free over Rs 500.</p>
</details>`,
    },
    {
      heading: 'Exclusive accordions with name',
      content: `An **accordion** is a group of disclosures where opening one closes the others. Modern browsers support the \`name\` attribute on \`<details>\`: all details with the **same name** form a group, and only one of them can be open at a time. No JavaScript needed.

In older browsers the \`name\` attribute is simply ignored and each item opens independently, which is still usable (this is called progressive enhancement).`,
      syntax: `<details name="faq"><summary>Q1</summary>A1</details>
<details name="faq"><summary>Q2</summary>A2</details>`,
    },
    {
      heading: 'Styling and the toggle event',
      content: `**Styling:**
- The triangle is the \`::marker\` of the summary (in Safari it is \`::-webkit-details-marker\`).
- Remove it with \`summary { list-style: none; }\` and draw your own icon, e.g. with \`::before\`.
- Style the open state with \`details[open] summary { ... }\`.

**JavaScript:** \`<details>\` fires a \`toggle\` event after it opens or closes. Use it for analytics or to lazy-load content when it opens.`,
      syntax: `details.addEventListener('toggle', () => {
  console.log(details.open ? 'opened' : 'closed');
});`,
    },
    {
      heading: 'When to use (and not use) details',
      content: `Good for: FAQs, "show more" text, advanced settings in a form, code-solution reveals, sidebar filters.

Not good for:
- Navigation menus or dropdowns that must close when you click outside (use a button + JS or popover).
- Content that is critical for everyone to see (do not hide it).
- Ctrl+F: modern Chrome can search inside closed details and auto-opens them, but older browsers cannot find hidden text.`,
      tip: 'Do not put interactive elements like buttons or links inside <summary>; clicks get confusing for both mouse and screen-reader users.',
    },
  ],
  examples: [
    {
      title: 'A simple FAQ',
      scenario: 'Create an FAQ where each answer is hidden until its question is clicked; the first one starts open.',
      steps: [
        'Create index.html',
        'Add three <details> blocks each with a <summary> question',
        'Add the open attribute to the first one',
        'Click Run, then click the questions or Tab to them and press Enter',
      ],
      code: `<details open>
  <summary>Is the course free?</summary>
  <p>Yes, the first module is free.</p>
</details>
<details>
  <summary>Do I need to install anything?</summary>
  <p>Only a browser and a text editor.</p>
</details>`,
      playground: {
        html: `<h2>FAQ</h2>
<details open>
  <summary>Is the course free?</summary>
  <p>Yes, the first module is free.</p>
</details>
<details>
  <summary>Do I need to install anything?</summary>
  <p>Only a browser and a text editor such as VS Code.</p>
</details>
<details>
  <summary>How long does it take?</summary>
  <p>About 30 days at 1–2 hours per day.</p>
</details>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; max-width: 520px; }
details { border: 1px solid #ccc; border-radius: 6px; padding: 8px 12px; margin-bottom: 8px; }
summary { cursor: pointer; font-weight: 600; }
details[open] { background: #f5fbff; }`,
      },
      result: 'Three questions; the first is expanded. Clicking any question toggles its answer. Open items get a light blue background.',
      explanation: 'No JavaScript is used. <summary> is the clickable label; the open attribute controls the initial state and details[open] styles the expanded state.',
    },
    {
      title: 'Exclusive accordion with a custom +/- icon',
      scenario: 'Only one section may be open at a time, and the default triangle is replaced by a plus/minus sign.',
      steps: [
        'Give every <details> the same name="course"',
        'Hide the default marker with list-style: none',
        'Add summary::before with "+" and change it to "−" when open',
        'Click Run and open different sections',
      ],
      code: `<details name="course"><summary>Module 1</summary>...</details>
<details name="course"><summary>Module 2</summary>...</details>

summary { list-style: none; }
summary::-webkit-details-marker { display: none; }
summary::before { content: '+ '; }
details[open] summary::before { content: '− '; }`,
      playground: {
        html: `<details name="course" open>
  <summary>Module 1: Fundamentals</summary>
  <p>Document structure, elements, headings.</p>
</details>
<details name="course">
  <summary>Module 2: Links & Images</summary>
  <p>Anchors, image paths, lists, tables.</p>
</details>
<details name="course">
  <summary>Module 3: Forms</summary>
  <p>Inputs, labels, validation.</p>
</details>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; max-width: 520px; }
details { border-bottom: 1px solid #ddd; padding: 10px 0; }
summary { list-style: none; cursor: pointer; font-weight: 600; }
summary::-webkit-details-marker { display: none; }
summary::before { content: '+'; display: inline-block; width: 1.2em; color: teal; }
details[open] summary::before { content: '\\2212'; }
summary:focus-visible { outline: 2px solid teal; outline-offset: 2px; }`,
        js: `document.querySelectorAll('details').forEach((d) => {
  d.addEventListener('toggle', () => {
    console.log(d.querySelector('summary').textContent, d.open ? 'opened' : 'closed');
  });
});`,
      },
      result: 'Opening one module closes the previously open one (in browsers supporting name on details). Each summary shows + or − and the console logs toggles.',
      explanation: 'Same name = one group, only one open at a time. list-style:none and the webkit marker rule remove the triangle; ::before draws the icon and details[open] switches it. The toggle event fires after each change.',
    },
    {
      title: 'Open all / Close all buttons',
      scenario: 'A long help page needs buttons to expand or collapse every section at once.',
      steps: [
        'Add several <details> elements',
        'Add two buttons: Expand all and Collapse all',
        'In JS, loop over all details and set .open = true/false',
        'Click Run and use the buttons',
      ],
      code: `document.querySelectorAll('details').forEach(d => d.open = true);`,
      playground: {
        html: `<button id="expand">Expand all</button>
<button id="collapse">Collapse all</button>
<details><summary>Account</summary><p>Change your password and email.</p></details>
<details><summary>Billing</summary><p>View invoices and payment methods.</p></details>
<details><summary>Privacy</summary><p>Control who sees your profile.</p></details>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
details { margin: 8px 0; padding: 6px 10px; background: #f6f6f6; border-radius: 6px; }`,
        js: `const all = document.querySelectorAll('details');
document.getElementById('expand').onclick = () => all.forEach((d) => { d.open = true; });
document.getElementById('collapse').onclick = () => all.forEach((d) => { d.open = false; });
console.log('Sections:', all.length);`,
      },
      result: 'Expand all opens every section; Collapse all closes them all.',
      explanation: 'The open property mirrors the open attribute. Setting it from JavaScript opens/closes the widget exactly like a user click (and fires toggle).',
    },
  ],
  interview: [
    { q: 'What do <details> and <summary> do?', a: '<details> creates a native disclosure widget; <summary> is its visible clickable label. Content after the summary is hidden until the widget is opened. No JavaScript is required.', level: 'Easy' },
    { q: 'How do you make a <details> element open by default?', a: 'Add the boolean open attribute: <details open>.', level: 'Easy' },
    { q: 'What happens if <summary> is missing?', a: 'The browser shows a default label (usually "Details") so the user can still open it, but you lose control of the text. Always provide a summary as the first child.', level: 'Easy' },
    { q: 'How can you build an accordion where only one item is open?', a: 'Give all <details> elements the same name attribute; supporting browsers keep only one open. For older browsers, listen to the toggle event and close the others with JavaScript.', level: 'Medium' },
    { q: 'Which event fires when a details element opens or closes?', a: 'The toggle event, fired on the <details> element after its open state changes. Check details.open inside the handler.', level: 'Medium' },
    { q: 'How do you remove or replace the default triangle?', a: 'Set summary { list-style: none; } and summary::-webkit-details-marker { display: none; } for Safari, then add your own icon with ::before/::after, switching it with details[open].', level: 'Medium' },
    { q: 'Why is <details> better than a div toggled with JavaScript?', a: 'It is accessible by default (keyboard focusable, Enter/Space toggles, exposes expanded/collapsed state to screen readers), works without JS, and needs less code.', level: 'Medium' },
    { q: 'Should you put a link or button inside <summary>?', a: 'No. summary is already interactive; nesting interactive content causes conflicting click behaviour and poor screen-reader announcements.', level: 'Hard' },
    { q: 'Can you animate the opening of details?', a: 'Partly. Content can be faded in with CSS on details[open] > *. Smooth height animation of the content needs newer CSS like interpolate-size / ::details-content or JavaScript, so support varies.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a "Read more" section for a blog post where the long text is hidden until clicked.',
      hint: 'Use <summary>Read more</summary>.',
      solution: `<p>HTML is the skeleton of every web page.</p>
<details>
  <summary>Read more</summary>
  <p>It was created by Tim Berners-Lee in 1991 and is maintained today by WHATWG as a living standard.</p>
</details>`,
    },
    {
      task: 'Build a 4-question FAQ accordion where only one answer can be open, with the second question open initially.',
      hint: 'Same name on all, open on the second.',
      solution: `<details name="faq"><summary>Q1: What is CSS?</summary><p>Style language.</p></details>
<details name="faq" open><summary>Q2: What is JS?</summary><p>Programming language of the web.</p></details>
<details name="faq"><summary>Q3: What is DOM?</summary><p>Tree of page objects.</p></details>
<details name="faq"><summary>Q4: What is API?</summary><p>A way programs talk.</p></details>`,
    },
    {
      task: 'Style a details widget so the summary has an arrow ▶ that rotates 90° when open.',
      hint: 'Use summary::before with transform and transition.',
      solution: `<style>
  summary { list-style: none; cursor: pointer; }
  summary::-webkit-details-marker { display: none; }
  summary::before { content: '\\25B6'; display: inline-block; margin-right: 6px; transition: transform .2s; }
  details[open] summary::before { transform: rotate(90deg); }
</style>
<details><summary>Settings</summary><p>Dark mode, notifications...</p></details>`,
    },
    {
      task: 'Log to the console how many times a details element has been opened.',
      hint: 'Use the toggle event and a counter that increases only when details.open is true.',
      solution: `<details id="d"><summary>Click me</summary><p>Hello</p></details>
<script>
  let count = 0;
  const d = document.getElementById('d');
  d.addEventListener('toggle', () => {
    if (d.open) { count++; console.log('Opened', count, 'times'); }
  });
</script>`,
    },
  ],
  quiz: [
    { question: 'Which element is the clickable label of a disclosure widget?', options: ['<legend>', '<caption>', '<summary>', '<label>'], answer: 2, explanation: '<summary> must be the first child of <details> and acts as its label.' },
    { question: 'Which attribute makes <details> expanded on page load?', options: ['open', 'expanded', 'show', 'active'], answer: 0, explanation: 'open is the boolean attribute for the expanded state.' },
    { question: 'How do you group several details so only one is open at a time (modern browsers)?', options: ['Wrap them in <fieldset>', 'Give them the same name attribute', 'Use the group attribute', 'Give them the same id'], answer: 1, explanation: 'details elements sharing a name form an exclusive accordion.' },
    { question: 'Which event fires when a details element opens or closes?', options: ['change', 'click', 'open', 'toggle'], answer: 3, explanation: 'The toggle event fires on <details> after its state changes.' },
    { question: 'Which CSS removes the default triangle marker in most browsers?', options: ['details { marker: none; }', 'summary { list-style: none; }', 'summary { display: none; }', 'details { arrow: hidden; }'], answer: 1, explanation: 'The marker is a list marker; list-style:none removes it (plus ::-webkit-details-marker for Safari).' },
  ],
};
