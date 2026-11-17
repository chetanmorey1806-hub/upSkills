export default {
  id: 'day-23-dom-content-attributes-styles',
  title: 'Changing Content, Attributes, Styles and classList',
  module: 'Module 4: DOM & Events',
  day: 23,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Once you have selected an element you can change what it says, its attributes (src, href, disabled, data-*), its inline styles and its CSS classes. Today you learn textContent vs innerHTML, getAttribute/setAttribute, dataset, element.style and the classList API.',
  objectives: [
    'Change text safely with textContent and HTML with innerHTML (and know the XSS risk)',
    'Read and change attributes with getAttribute, setAttribute, removeAttribute, properties and dataset',
    'Change inline styles with element.style and read final styles with getComputedStyle',
    'Add, remove, toggle and check CSS classes with classList',
    'Choose classList over inline styles for maintainable UI changes',
  ],
  theory: [
    {
      heading: 'Changing Content: textContent, innerText, innerHTML',
      content: "- **`textContent`** gets/sets the plain text of an element. Any `<` or `>` you set is shown literally, not parsed as HTML. It is fast and **safe**. Use it by default.\n- **`innerText`** is similar but respects CSS: it ignores hidden elements and triggers layout. Use only when you need the visible text.\n- **`innerHTML`** gets/sets the HTML markup inside an element. Setting it **parses** the string and replaces all children.\n\n**Security warning (XSS):** never put user input into `innerHTML`. If a user types `<img src=x onerror=\"alert('hacked')\">`, innerHTML will create that element and run the code. textContent would just display the text.",
      syntax: `const msg = document.querySelector('#msg');
msg.textContent = 'Saved!';               // plain text
msg.innerHTML = '<strong>Saved!</strong>'; // parsed as HTML
msg.textContent = '<strong>Hi</strong>';   // shows the tags literally

input.value = 'new text';  // form fields use .value, not textContent`,
      tip: 'Form controls (input, textarea, select) store what the user typed in `.value`, not in textContent.',
    },
    {
      heading: 'Attributes: getAttribute, setAttribute and Properties',
      content: "HTML attributes (`src`, `href`, `alt`, `disabled`, `id`...) can be changed in two ways:\n\n1. **Attribute methods**: `getAttribute(name)`, `setAttribute(name, value)`, `removeAttribute(name)`, `hasAttribute(name)`. They always work with strings and with any attribute (including custom ones like `aria-label`).\n2. **DOM properties**: most standard attributes are mirrored as properties: `img.src`, `a.href`, `input.disabled`, `el.id`. Properties have proper types (`disabled` is a boolean).\n\nNote: `a.getAttribute('href')` returns exactly what you wrote (`/about`), while `a.href` returns the full resolved URL (`https://site.com/about`).\n\nFor `class` use `className` or better `classList` (the word `class` is reserved in JS).",
      syntax: `const img = document.querySelector('img');
img.setAttribute('alt', 'A red car');
img.src = 'https://picsum.photos/200';
img.getAttribute('alt');      // 'A red car'

const btn = document.querySelector('button');
btn.disabled = true;           // property (boolean)
btn.removeAttribute('disabled'); // enable again
btn.setAttribute('aria-label', 'Close dialog');`,
    },
    {
      heading: 'data-* Attributes and dataset',
      content: "Custom data attributes let you store extra info on an element: `<button data-product-id=\"42\" data-price=\"499\">`.\n\nJavaScript reads them through `element.dataset`. Dashed names become **camelCase**: `data-product-id` -> `dataset.productId`. Values are always **strings**, so convert numbers with `Number()`.\n\nThis is the standard way to connect DOM elements to your data without hidden inputs or ids.",
      syntax: `<button id="buy" data-product-id="42" data-price="499">Buy</button>

const buy = document.getElementById('buy');
buy.dataset.productId;          // '42'
Number(buy.dataset.price) * 2;  // 998
buy.dataset.status = 'added';   // creates data-status="added"`,
    },
    {
      heading: 'Inline Styles with element.style',
      content: "`element.style` sets **inline styles** (like the `style=\"\"` attribute). CSS property names become **camelCase**: `background-color` -> `style.backgroundColor`, `font-size` -> `style.fontSize`. Values are strings and must include units: `'20px'`, not `20`.\n\n`element.style` only READS inline styles. To read the final style from all CSS rules use `getComputedStyle(element).propertyName`.\n\nTo remove an inline style, set it to an empty string: `el.style.color = ''`.\n\nInline styles have high specificity and scatter design decisions in JS. For anything more than a dynamic value (position, width from a calculation, a user-picked color), prefer classes.",
      syntax: `const box = document.querySelector('.box');
box.style.backgroundColor = 'tomato';
box.style.width = 200 + 'px';
box.style.setProperty('--accent', 'gold'); // CSS variable
getComputedStyle(box).width;               // '200px'
box.style.backgroundColor = '';            // remove inline style`,
      tip: 'Common mistake: `box.style.width = 200` (no unit) is ignored. Always add a unit string.',
    },
    {
      heading: 'classList: The Best Way to Change Appearance',
      content: "Keep styles in CSS and let JavaScript just switch classes on and off. The `classList` API makes this easy:\n\n- `add('a', 'b')` - add one or more classes\n- `remove('a')` - remove\n- `toggle('a')` - add if missing, remove if present; returns true if now present. `toggle('a', condition)` forces add/remove based on a boolean.\n- `contains('a')` - true/false\n- `replace('old', 'new')`\n\n`className` is the whole class string; assigning it replaces ALL classes, which is easy to get wrong. Prefer classList.",
      syntax: `const menu = document.querySelector('.menu');
menu.classList.add('open');
menu.classList.remove('hidden');
menu.classList.toggle('dark');          // switch
menu.classList.toggle('active', count > 0); // force by condition
menu.classList.contains('open');        // true`,
      points: [
        'Design stays in CSS: designers can change colors without touching JS',
        'Easy to animate with CSS transitions when classes change',
        'One class can change many properties at once',
      ],
    },
  ],
  examples: [
    {
      title: 'textContent vs innerHTML (and why XSS matters)',
      scenario: 'A comment box shows what the user typed. Compare rendering it with textContent (safe) and innerHTML (dangerous).',
      steps: [
        'Create an input, two buttons and two output divs',
        'Button 1 sets output1.textContent = input.value',
        'Button 2 sets output2.innerHTML = input.value',
        'Type <b>Hello</b> and click both buttons',
        'Compare the outputs',
      ],
      code: `safeBox.textContent = input.value;   // shows: <b>Hello</b>
unsafeBox.innerHTML = input.value;   // shows bold Hello (HTML parsed!)`,
      playground: {
        html: `<label>Your comment: <input id="comment" value="<b>Hello</b> world"></label>
<div class="row">
  <button id="safe">Show with textContent</button>
  <button id="unsafe">Show with innerHTML</button>
</div>
<h4>textContent output</h4>
<div id="safeBox" class="box"></div>
<h4>innerHTML output</h4>
<div id="unsafeBox" class="box"></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
input { width: 100%; max-width: 320px; padding: 6px; }
.row { display: flex; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
.box { border: 1px dashed #999; padding: 8px; min-height: 24px; }`,
        js: `const input = document.getElementById('comment');
const safeBox = document.getElementById('safeBox');
const unsafeBox = document.getElementById('unsafeBox');

document.getElementById('safe').addEventListener('click', () => {
  safeBox.textContent = input.value;
  console.log('textContent child elements:', safeBox.children.length);
});

document.getElementById('unsafe').addEventListener('click', () => {
  unsafeBox.innerHTML = input.value;
  console.log('innerHTML child elements:', unsafeBox.children.length);
});`,
      },
      result: 'With the default text "<b>Hello</b> world": the textContent box shows the literal characters <b>Hello</b> world, while the innerHTML box shows "Hello" in bold followed by "world". The console prints 0 child elements for textContent and 1 for innerHTML (a real <b> element was created).',
      explanation: 'textContent treats everything as text. innerHTML parses the string as HTML and creates elements - fine for trusted templates, but if the text came from a user it could include an <img onerror=...> that runs code (XSS). Rule: user input goes into textContent or .value.',
    },
    {
      title: 'Image Gallery: Change src, alt and data-* Attributes',
      scenario: 'Thumbnail buttons store the image id and caption in data attributes. Clicking one updates the main image src and alt and shows the caption.',
      steps: [
        'Create a main <img> and three buttons with data-id and data-caption',
        'Select all buttons and add click listeners',
        'Read btn.dataset.id and btn.dataset.caption',
        'Set img.src and img.setAttribute(\'alt\', ...); mark the active button',
        'Click the buttons',
      ],
      code: `const id = btn.dataset.id;
mainImg.src = 'https://picsum.photos/id/' + id + '/320/200';
mainImg.setAttribute('alt', btn.dataset.caption);
caption.textContent = btn.dataset.caption;`,
      playground: {
        html: `<img id="main" src="https://picsum.photos/id/10/320/200" alt="Forest" width="320" height="200">
<p id="caption">Forest</p>
<div class="thumbs">
  <button class="thumb active" data-id="10" data-caption="Forest">Forest</button>
  <button class="thumb" data-id="20" data-caption="Desk">Desk</button>
  <button class="thumb" data-id="29" data-caption="Mountains">Mountains</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
img { max-width: 100%; height: auto; border-radius: 8px; background: #ddd; display: block; }
.thumbs { display: flex; gap: 8px; flex-wrap: wrap; }
.thumb { padding: 6px 12px; border: 2px solid #ccc; border-radius: 6px; background: white; cursor: pointer; }
.thumb.active { border-color: teal; background: #e0f7f4; }`,
        js: `const mainImg = document.getElementById('main');
const caption = document.getElementById('caption');
const thumbs = document.querySelectorAll('.thumb');

thumbs.forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.id;
    mainImg.src = 'https://picsum.photos/id/' + id + '/320/200';
    mainImg.setAttribute('alt', btn.dataset.caption);
    caption.textContent = btn.dataset.caption;

    thumbs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    console.log('alt =', mainImg.getAttribute('alt'), '| src attr =', mainImg.getAttribute('src'));
  });
});`,
      },
      result: 'Clicking "Desk" loads a different photo, the caption changes to "Desk", the Desk button gets the teal active style, and the console prints: alt = Desk | src attr = https://picsum.photos/id/20/320/200.',
      explanation: 'dataset converts data-id and data-caption into dataset.id and dataset.caption. Setting img.src loads a new image; setAttribute updates alt for accessibility. Removing "active" from all buttons then adding it to the clicked one is the standard "single selection" pattern.',
    },
    {
      title: 'Font Size and Color with element.style',
      scenario: 'Accessibility controls let a reader increase/decrease text size and pick a highlight color. These are dynamic values, so inline styles are appropriate.',
      steps: [
        'Create an article paragraph, A- / A+ buttons and a color input',
        'Keep a fontSize variable in JS',
        'On click, change it and set p.style.fontSize = fontSize + "px"',
        'On color input, set p.style.backgroundColor',
        'Use getComputedStyle to display the final size',
      ],
      code: `let size = 16;
para.style.fontSize = size + 'px';          // needs a unit
para.style.backgroundColor = colorInput.value; // camelCase property
getComputedStyle(para).fontSize;            // e.g. '18px'`,
      playground: {
        html: `<div class="controls">
  <button id="smaller">A-</button>
  <button id="bigger">A+</button>
  <label>Highlight <input type="color" id="color" value="#fff3b0"></label>
  <button id="reset">Reset</button>
</div>
<p id="article">JavaScript can change how this paragraph looks without reloading the page. Try the buttons above.</p>
<small id="info"></small>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.controls { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; margin-bottom: 12px; }
#article { font-size: 16px; padding: 8px; border-radius: 6px; transition: all .2s; }`,
        js: `const para = document.getElementById('article');
const info = document.getElementById('info');
const colorInput = document.getElementById('color');
let size = 16;

function render() {
  para.style.fontSize = size + 'px';
  info.textContent = 'Computed font-size: ' + getComputedStyle(para).fontSize;
}

document.getElementById('bigger').addEventListener('click', () => {
  size = Math.min(size + 2, 32);
  render();
});
document.getElementById('smaller').addEventListener('click', () => {
  size = Math.max(size - 2, 10);
  render();
});
colorInput.addEventListener('input', () => {
  para.style.backgroundColor = colorInput.value;
});
document.getElementById('reset').addEventListener('click', () => {
  size = 16;
  para.style.fontSize = '';
  para.style.backgroundColor = '';
  info.textContent = 'Inline styles removed';
});
render();`,
      },
      result: 'A+ makes the paragraph text 2px bigger each click (max 32px) and A- smaller (min 10px); the small text shows e.g. "Computed font-size: 18px". Picking a color sets the paragraph background. Reset removes the inline styles so the CSS rules apply again.',
      explanation: 'style.fontSize maps to the CSS font-size property and needs a unit. The color input gives a hex string which is a valid CSS value. Setting a style to an empty string removes that inline style, letting the stylesheet take over. getComputedStyle returns the final value after all CSS is applied.',
    },
    {
      title: 'Dark Mode and FAQ Accordion with classList.toggle',
      scenario: 'A page has a dark mode switch and an FAQ where clicking a question opens/closes its answer. All visual rules live in CSS; JS only toggles classes.',
      steps: [
        'Write CSS for body.dark and .faq.open',
        'On the theme button click: document.body.classList.toggle(\'dark\')',
        'Use the boolean returned by toggle to update the button label',
        'For each FAQ question, toggle the "open" class on its parent .faq',
        'Click the theme button and the questions',
      ],
      code: `const isDark = document.body.classList.toggle('dark'); // true if added
themeBtn.textContent = isDark ? 'Light mode' : 'Dark mode';

question.closest('.faq').classList.toggle('open');`,
      playground: {
        html: `<button id="theme">Dark mode</button>
<h2>FAQ</h2>
<div class="faq">
  <button class="question">What is the DOM?</button>
  <p class="answer">A tree of objects that represents the page.</p>
</div>
<div class="faq">
  <button class="question">Why use classList?</button>
  <p class="answer">It keeps styling in CSS and logic in JS.</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #fff; color: #222; transition: background .3s, color .3s; }
body.dark { background: #1e1e2e; color: #eee; }
.faq { border-bottom: 1px solid #8884; }
.question { all: unset; cursor: pointer; display: block; width: 100%; padding: 10px 0; font-weight: 600; }
.question::before { content: '+ '; }
.faq.open .question::before { content: '- '; }
.answer { display: none; margin: 0 0 10px; }
.faq.open .answer { display: block; }`,
        js: `const themeBtn = document.getElementById('theme');

themeBtn.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  themeBtn.textContent = isDark ? 'Light mode' : 'Dark mode';
  console.log('dark?', document.body.classList.contains('dark'));
});

document.querySelectorAll('.question').forEach(q => {
  q.addEventListener('click', () => {
    const faq = q.closest('.faq');
    faq.classList.toggle('open');
    console.log(q.textContent, '->', faq.classList.contains('open') ? 'open' : 'closed');
  });
});`,
      },
      result: 'Clicking "Dark mode" switches the page to a dark background with light text and the button changes to "Light mode"; clicking again switches back. Clicking a question shows its answer (the + becomes -), clicking again hides it.',
      explanation: 'toggle adds the class if missing and removes it if present, and returns the new state. All visuals (colors, show/hide, +/- sign) are defined in CSS for .dark and .open, so JavaScript stays tiny and the design is easy to change.',
    },
  ],
  interview: [
    { q: 'Difference between textContent, innerText and innerHTML?', a: 'textContent: raw text of all nodes, fast, no HTML parsing. innerText: only visible (rendered) text, aware of CSS, slower (triggers layout). innerHTML: gets/sets HTML markup and parses it when setting, which can create XSS risks with user input.', level: 'Easy' },
    { q: 'Why is setting innerHTML with user input dangerous?', a: 'The string is parsed as HTML, so an attacker can inject elements with event handlers (e.g. <img src=x onerror="...">) that run JavaScript (Cross-Site Scripting). Use textContent, or sanitize the HTML (e.g. DOMPurify).', level: 'Medium' },
    { q: 'What is the output?\n<p id="p"></p>\ndocument.getElementById("p").textContent = "<i>hi</i>";\nconsole.log(document.getElementById("p").children.length);', a: '0. textContent does not parse HTML, so no <i> element is created; the text "<i>hi</i>" is displayed literally.', level: 'Medium' },
    { q: 'Difference between getAttribute("href") and the href property?', a: 'getAttribute returns the exact attribute string from HTML (e.g. "/about"). The href property returns the fully resolved absolute URL (e.g. "https://site.com/about").', level: 'Medium' },
    { q: 'How do you read data-user-id="7" in JavaScript?', a: 'element.dataset.userId (camelCase) which returns the string "7", or element.getAttribute("data-user-id").', level: 'Easy' },
    { q: 'What is the output?\n<div id="b" style="width:100px"></div>\nconst b = document.getElementById("b");\nb.style.width = 200;\nconsole.log(b.style.width);', a: '100px (in a normal standards-mode page with <!DOCTYPE html>). Assigning a number without a unit is invalid for width, so the browser ignores it and the old inline value remains. Use "200px". (Only old quirks-mode pages accept unitless lengths.)', level: 'Hard' },
    { q: 'Why can element.style.color return an empty string even when the text is red?', a: 'element.style only reflects inline styles. If the red comes from a stylesheet, use getComputedStyle(element).color.', level: 'Medium' },
    { q: 'What does classList.toggle return?', a: 'A boolean: true if the class is present after the call (it was added), false if it was removed. toggle(name, force) adds when force is true and removes when false.', level: 'Easy' },
    { q: 'What is the output?\n<p id="x" class="a b"></p>\nconst x = document.getElementById("x");\nx.className = "c";\nconsole.log(x.classList.contains("a"), x.classList.length);', a: 'false 1. Assigning className replaces the entire class string, so "a" and "b" are gone and only "c" remains. classList.add would have kept them.', level: 'Medium' },
    { q: 'Why prefer classList over element.style?', a: 'It keeps presentation in CSS (one place to change design), allows many style changes with one class, supports :hover/media queries/transitions, and keeps specificity sane. Use inline style only for truly dynamic values.', level: 'Easy' },
    { q: 'How do you disable and re-enable a button?', a: 'btn.disabled = true / false, or btn.setAttribute("disabled", "") and btn.removeAttribute("disabled"). Note setAttribute("disabled", "false") still disables it because the attribute is present.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a counter: a <span> showing 0 and a button "+1". Each click increases the number shown using textContent.',
      hint: 'Keep a count variable; set span.textContent = count.',
      solution: `<span id="count">0</span>
<button id="inc">+1</button>
<script>
let count = 0;
const span = document.getElementById('count');
document.getElementById('inc').addEventListener('click', () => {
  count++;
  span.textContent = count;
});
</script>`,
    },
    {
      task: 'Create a "Show password" checkbox that switches a password input between type="password" and type="text".',
      hint: 'input.type = checkbox.checked ? "text" : "password" (or setAttribute).',
      solution: `<input type="password" id="pwd" value="secret123">
<label><input type="checkbox" id="show"> Show password</label>
<script>
const pwd = document.getElementById('pwd');
document.getElementById('show').addEventListener('change', (e) => {
  pwd.type = e.target.checked ? 'text' : 'password';
});
</script>`,
    },
    {
      task: 'Make a traffic light: three circles (red, yellow, green) and a "Next" button that moves an "on" class from one light to the next in a loop.',
      hint: 'Keep an index; remove "on" from all, add to lights[index]; index = (index + 1) % 3.',
      solution: `<style>
.light { width: 40px; height: 40px; border-radius: 50%; background: #444; margin: 6px; opacity: .3; }
.light.on { opacity: 1; }
.red { background: red; } .yellow { background: gold; } .green { background: green; }
</style>
<div class="light red on"></div>
<div class="light yellow"></div>
<div class="light green"></div>
<button id="next">Next</button>
<script>
const lights = document.querySelectorAll('.light');
let index = 0;
document.getElementById('next').addEventListener('click', () => {
  lights[index].classList.remove('on');
  index = (index + 1) % lights.length;
  lights[index].classList.add('on');
});
</script>`,
    },
    {
      task: 'Build a progress bar: a .bar div inside a .track div and buttons "+10%" and "-10%". Update the bar width with style.width and show the percentage as text. Add a class "complete" (green) at 100%.',
      hint: 'Clamp the value between 0 and 100; use classList.toggle("complete", value === 100).',
      solution: `<style>
.track { width: 300px; max-width: 100%; height: 20px; background: #eee; border-radius: 10px; overflow: hidden; }
.bar { height: 100%; width: 0; background: royalblue; transition: width .3s; }
.bar.complete { background: seagreen; }
</style>
<div class="track"><div class="bar" id="bar"></div></div>
<p id="label">0%</p>
<button id="minus">-10%</button>
<button id="plus">+10%</button>
<script>
let value = 0;
const bar = document.getElementById('bar');
const label = document.getElementById('label');
function update(change) {
  value = Math.min(100, Math.max(0, value + change));
  bar.style.width = value + '%';
  label.textContent = value + '%';
  bar.classList.toggle('complete', value === 100);
}
document.getElementById('plus').addEventListener('click', () => update(10));
document.getElementById('minus').addEventListener('click', () => update(-10));
</script>`,
    },
  ],
  quiz: [
    { question: 'Which property is SAFEST for displaying user-typed text?', options: ['innerHTML', 'outerHTML', 'textContent', 'insertAdjacentHTML'], answer: 2, explanation: 'textContent never parses HTML, preventing XSS.' },
    { question: 'How do you set the CSS background-color via JS?', options: ['el.style.backgroundColor = "red"', 'el.style.background-color = "red"', 'el.css("background-color", "red")', 'el.style = backgroundColor("red")'], answer: 0, explanation: 'CSS properties become camelCase on element.style.' },
    { question: 'How do you read data-order-id from an element?', options: ['el.data.orderId', 'el.dataset["order-id"]', 'el.orderId', 'el.dataset.orderId'], answer: 3, explanation: 'dataset converts dashed names to camelCase.' },
    { question: 'What does el.classList.toggle("open") do if el already has class "open"?', options: ['Adds a second "open"', 'Removes "open" and returns false', 'Throws an error', 'Nothing'], answer: 1, explanation: 'toggle removes an existing class and returns false.' },
    { question: 'Which returns the final style applied from all CSS rules?', options: ['el.style', 'el.getAttribute("style")', 'getComputedStyle(el)', 'el.className'], answer: 2, explanation: 'getComputedStyle reads the resolved styles; el.style only shows inline styles.' },
  ],
};
