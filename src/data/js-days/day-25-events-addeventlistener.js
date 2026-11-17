export default {
  id: 'day-25-events-addeventlistener',
  title: 'Events and addEventListener (click, input, change, keydown, submit)',
  module: 'Module 4: DOM & Events',
  day: 25,
  level: 'Beginner',
  duration: '1.5 hours',
  summary: 'Events are how a page reacts to the user: clicks, typing, selecting, pressing keys, submitting forms. Today you learn addEventListener, the most important event types (click, input, change, keydown, submit), how to remove listeners and the options once/passive.',
  objectives: [
    'Explain what an event is and the event-driven model of the browser',
    'Attach handlers with addEventListener and know why it beats onclick attributes/properties',
    'Use click, dblclick, input, change, keydown/keyup, submit, focus/blur and mouseenter in real UI',
    'Remove listeners with removeEventListener and use the { once: true } option',
    'Understand `this` and arrow functions inside event handlers',
  ],
  theory: [
    {
      heading: 'What is an Event?',
      content: "An **event** is a signal that something happened: the user clicked, typed a key, the page finished loading, a form was submitted.\n\nJavaScript in the browser is **event-driven**: you register functions (**event handlers** or **listeners**) that say \"when X happens to this element, run this code\". Then your code waits. It is like a doorbell: you do not stand at the door all day; the bell (event) tells you when to open it (handler).",
      points: [
        'Mouse: click, dblclick, mousedown, mouseup, mouseenter, mouseleave, mousemove, contextmenu',
        'Keyboard: keydown, keyup',
        'Form: input, change, submit, focus, blur, reset',
        'Window/document: load, DOMContentLoaded, resize, scroll',
      ],
    },
    {
      heading: 'addEventListener',
      content: "`element.addEventListener(type, handler, options)`\n\n- **type**: event name as a string WITHOUT \"on\": `'click'`, not `'onclick'`\n- **handler**: the function to call. Pass the function itself, do NOT call it: `handleClick`, not `handleClick()`\n- **options** (optional): `{ once: true }` (auto-remove after first run), `{ passive: true }` (promise not to call preventDefault, good for scroll/touch performance), `{ capture: true }` (Day 26)\n\nThe browser calls your handler with an **event object** (often named `e` or `event`) containing details: `e.target` (element that triggered it), `e.key` (for keyboard), `e.type` and more. Day 26 covers it in depth.",
      syntax: `const btn = document.querySelector('#save');

function handleSave(e) {
  console.log('Saved!', e.type); // 'click'
}
btn.addEventListener('click', handleSave);

// inline arrow function
btn.addEventListener('click', () => console.log('Also runs'));`,
      tip: 'Common mistake: `btn.addEventListener(\'click\', handleSave())` runs handleSave immediately and passes its return value (undefined) as the listener.',
    },
    {
      heading: 'Why Not onclick?',
      content: "There are three ways to attach handlers:\n\n1. **HTML attribute**: `<button onclick=\"save()\">` - mixes HTML and JS, needs global functions, avoid.\n2. **DOM property**: `btn.onclick = save` - only ONE handler per event; assigning again overwrites the previous one.\n3. **addEventListener** - allows **many** handlers for the same event, supports options, can be removed precisely. This is the recommended way.",
      syntax: `btn.onclick = () => console.log('A');
btn.onclick = () => console.log('B'); // A is replaced, only B runs

btn.addEventListener('click', () => console.log('A'));
btn.addEventListener('click', () => console.log('B')); // both run`,
    },
    {
      heading: 'input vs change, keydown, submit',
      content: "- **input**: fires on **every** change to the value of an input/textarea (each keystroke, paste, delete). Use for live search, character counters, live previews.\n- **change**: fires when the change is **committed**: for text inputs when they lose focus after editing; for checkbox, radio, select and color immediately when the selection changes.\n- **keydown**: fires when a key is pressed (repeats if held). Use `e.key` (`'Enter'`, `'Escape'`, `'a'`, `'ArrowUp'`) to know which key. `keyup` fires on release. (`keypress` is deprecated.)\n- **submit**: fires on the `<form>` (not the button) when the user clicks a submit button or presses Enter in a field. The browser would normally reload/navigate, so call `e.preventDefault()` to handle it with JS.\n- **focus / blur**: when a field gains/loses focus.",
      syntax: `search.addEventListener('input', (e) => console.log(e.target.value));
country.addEventListener('change', (e) => console.log('Selected', e.target.value));
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});
form.addEventListener('submit', (e) => {
  e.preventDefault(); // stop page reload
});`,
      tip: 'Listen for "submit" on the form instead of "click" on the button: it also catches the Enter key and works with built-in validation.',
    },
    {
      heading: 'Removing Listeners and the once Option',
      content: "`removeEventListener(type, handler)` removes a listener, but only if you pass the **same function reference** that you added. An anonymous arrow function cannot be removed because you have no reference to it.\n\nFor \"only the first time\" behaviour, use `{ once: true }` instead of removing manually.",
      syntax: `function onScroll() { /* ... */ }
window.addEventListener('scroll', onScroll, { passive: true });
window.removeEventListener('scroll', onScroll); // works (same reference)

btn.addEventListener('click', () => {}, { once: true }); // runs once

// Does NOT work: different function objects
btn.addEventListener('click', () => go());
btn.removeEventListener('click', () => go());`,
    },
    {
      heading: 'this Inside Handlers',
      content: "With a **regular function** handler, `this` is the element the listener is attached to (same as `e.currentTarget`). With an **arrow function**, `this` comes from the outer scope, so use `e.currentTarget` instead. Modern code usually uses arrow functions + `e.currentTarget` / `e.target` for clarity.",
      syntax: `btn.addEventListener('click', function () {
  this.textContent = 'Clicked'; // this === btn
});
btn.addEventListener('click', (e) => {
  e.currentTarget.textContent = 'Clicked'; // safe in arrows
});`,
    },
  ],
  examples: [
    {
      title: 'Click Counter with Multiple Listeners and once',
      scenario: 'A like button counts clicks. A second listener shows a one-time "Thanks for your first like!" message using { once: true }. A Reset button removes the counting listener.',
      steps: [
        'Create a Like button, a Reset button and a message paragraph',
        'Add a named handler countLike for click',
        'Add a second click listener with { once: true }',
        'Reset calls removeEventListener with the same named function',
        'Click Like several times, then Reset, then Like again',
      ],
      code: `function countLike() {
  likes++;
  likeBtn.textContent = 'Like (' + likes + ')';
}
likeBtn.addEventListener('click', countLike);
likeBtn.addEventListener('click', () => {
  msg.textContent = 'Thanks for your first like!';
}, { once: true });

resetBtn.addEventListener('click', () => {
  likeBtn.removeEventListener('click', countLike);
});`,
      playground: {
        html: `<button id="like">Like (0)</button>
<button id="stop">Stop counting</button>
<p id="msg"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { padding: 8px 14px; font-size: 1rem; border-radius: 6px; cursor: pointer; }
#like { background: #ffe4ec; border: 1px solid #f48fb1; }
#msg { color: seagreen; font-weight: bold; }`,
        js: `const likeBtn = document.getElementById('like');
const stopBtn = document.getElementById('stop');
const msg = document.getElementById('msg');
let likes = 0;

function countLike() {
  likes++;
  likeBtn.textContent = 'Like (' + likes + ')';
  console.log('likes =', likes);
}

likeBtn.addEventListener('click', countLike);

likeBtn.addEventListener('click', () => {
  msg.textContent = 'Thanks for your first like!';
  console.log('once-listener ran');
}, { once: true });

stopBtn.addEventListener('click', () => {
  likeBtn.removeEventListener('click', countLike);
  msg.textContent = 'Counting stopped. Clicking Like does nothing now.';
});`,
      },
      result: 'First click on Like: the button shows "Like (1)" and the message "Thanks for your first like!" appears (the once-listener runs only this time). More clicks increase the count. After "Stop counting", clicks on Like no longer change the number.',
      explanation: 'addEventListener allows two listeners on the same button. { once: true } removes the second listener automatically after its first call. removeEventListener works because we pass the same named function reference countLike.',
    },
    {
      title: 'Live Character Counter: input vs change',
      scenario: 'A tweet box shows remaining characters live (input event) and logs the final text only when the user leaves the box (change event).',
      steps: [
        'Create a textarea with maxlength 50, a counter and a log',
        'On input: update the remaining count and color it red under 10',
        'On change: write "Committed: <text>" to the log',
        'Type, then click outside the textarea',
        'Watch which handler runs when',
      ],
      code: `box.addEventListener('input', () => {
  const left = 50 - box.value.length;
  counter.textContent = left + ' characters left';
  counter.classList.toggle('warn', left < 10);
});
box.addEventListener('change', () => {
  log.textContent = 'Committed: ' + box.value;
});`,
      playground: {
        html: `<label for="tweet">What is happening?</label>
<textarea id="tweet" maxlength="50" rows="3"></textarea>
<p id="counter">50 characters left</p>
<p id="log">change event has not fired yet (type, then click outside)</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
textarea { display: block; width: 100%; max-width: 360px; box-sizing: border-box; padding: 8px; }
#counter { color: #555; }
#counter.warn { color: crimson; font-weight: bold; }
#log { background: #f4f4f4; padding: 8px; border-radius: 6px; }`,
        js: `const box = document.getElementById('tweet');
const counter = document.getElementById('counter');
const log = document.getElementById('log');
const MAX = 50;

box.addEventListener('input', () => {
  const left = MAX - box.value.length;
  counter.textContent = left + ' characters left';
  counter.classList.toggle('warn', left < 10);
});

box.addEventListener('change', () => {
  log.textContent = 'Committed: ' + box.value;
  console.log('change fired with', box.value.length, 'characters');
});`,
      },
      result: 'While typing, the counter updates on every keystroke (e.g. "38 characters left") and turns red below 10. The grey box only updates to "Committed: ..." when you click outside the textarea after editing.',
      explanation: 'input fires for every value change, perfect for live feedback. change fires for text fields only when the edit is committed (on blur), so it is better for "save when done" logic.',
    },
    {
      title: 'Keyboard Shortcuts with keydown and e.key',
      scenario: 'Move a box with the arrow keys and reset with Escape. Show the last key pressed.',
      steps: [
        'Create a stage with an absolutely positioned box',
        'Listen for keydown on document',
        'Use a switch on e.key for ArrowUp/Down/Left/Right and Escape',
        'Prevent default scrolling for arrow keys',
        'Click inside the preview first (so it has focus), then press the arrow keys',
      ],
      code: `document.addEventListener('keydown', (e) => {
  switch (e.key) {
    case 'ArrowRight': x += 20; break;
    case 'ArrowLeft':  x -= 20; break;
    case 'ArrowUp':    y -= 20; break;
    case 'ArrowDown':  y += 20; break;
    case 'Escape':     x = 0; y = 0; break;
    default: return;
  }
  e.preventDefault();
  move();
});`,
      playground: {
        html: `<p>Click here first, then use the <kbd>Arrow keys</kbd>. <kbd>Esc</kbd> resets.</p>
<div id="stage"><div id="box"></div></div>
<p>Last key: <strong id="key">none</strong></p>
<button id="right">Move right (button)</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#stage { position: relative; height: 180px; border: 2px dashed #bbb; border-radius: 8px; overflow: hidden; }
#box { position: absolute; width: 40px; height: 40px; background: royalblue; border-radius: 8px; transition: transform .1s; }
kbd { background: #eee; border: 1px solid #ccc; border-radius: 4px; padding: 0 4px; }`,
        js: `const box = document.getElementById('box');
const keyLabel = document.getElementById('key');
let x = 0, y = 0;

function move() {
  box.style.transform = 'translate(' + x + 'px, ' + y + 'px)';
}

document.addEventListener('keydown', (e) => {
  keyLabel.textContent = e.key;
  switch (e.key) {
    case 'ArrowRight': x += 20; break;
    case 'ArrowLeft': x = Math.max(0, x - 20); break;
    case 'ArrowUp': y = Math.max(0, y - 20); break;
    case 'ArrowDown': y += 20; break;
    case 'Escape': x = 0; y = 0; break;
    default: return;
  }
  e.preventDefault();
  move();
});

document.getElementById('right').addEventListener('click', () => {
  x += 20;
  move();
});`,
      },
      result: 'After clicking inside the preview, pressing ArrowRight moves the blue box 20px right, ArrowDown moves it down, and so on. Escape sends it back to the corner. "Last key" shows the key name (e.g. ArrowRight, Escape, a). The button also moves it right.',
      explanation: 'keydown gives the pressed key in e.key as a readable string. The switch handles only the keys we care about; default returns early so other keys behave normally. preventDefault stops arrow keys from scrolling the page. The preview must have focus to receive key events.',
    },
    {
      title: 'Form submit, select change and focus/blur',
      scenario: 'A newsletter form: the select updates a preview immediately (change), the email field highlights while focused, and submitting shows a thank-you message without reloading.',
      steps: [
        'Create a <form> with an email input, a topic <select> and a submit button',
        'Listen for change on the select to update a preview',
        'Listen for focus/blur on the email to toggle a class',
        'Listen for submit on the FORM and call e.preventDefault()',
        'Fill the form and press Enter or click Subscribe',
      ],
      code: `form.addEventListener('submit', (e) => {
  e.preventDefault();            // no page reload
  result.textContent = 'Subscribed ' + email.value + ' to ' + topic.value;
});
topic.addEventListener('change', () => preview.textContent = topic.value);
email.addEventListener('focus', () => email.classList.add('active'));
email.addEventListener('blur', () => email.classList.remove('active'));`,
      playground: {
        html: `<form id="news">
  <label>Email <input type="email" id="email" required placeholder="you@mail.com"></label>
  <label>Topic
    <select id="topic">
      <option>JavaScript</option>
      <option>CSS</option>
      <option>React</option>
    </select>
  </label>
  <button type="submit">Subscribe</button>
</form>
<p>You will get: <strong id="preview">JavaScript</strong> tips</p>
<p id="result"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
form { display: grid; gap: 10px; max-width: 320px; }
input, select { width: 100%; padding: 6px; box-sizing: border-box; }
input.active { outline: 3px solid #ffd54f; }
#result { color: seagreen; font-weight: bold; }`,
        js: `const form = document.getElementById('news');
const email = document.getElementById('email');
const topic = document.getElementById('topic');
const preview = document.getElementById('preview');
const result = document.getElementById('result');

topic.addEventListener('change', () => {
  preview.textContent = topic.value;
});

email.addEventListener('focus', () => email.classList.add('active'));
email.addEventListener('blur', () => email.classList.remove('active'));

form.addEventListener('submit', (e) => {
  e.preventDefault();
  result.textContent = 'Subscribed ' + email.value + ' to ' + topic.value + ' tips!';
  console.log('submit handled without reload');
  form.reset();
  preview.textContent = topic.value;
});`,
      },
      result: 'Choosing "React" in the select immediately changes the preview to "React". The email box gets a yellow outline while focused. Entering a valid email and clicking Subscribe (or pressing Enter) shows "Subscribed you@mail.com to React tips!" without reloading, and the form resets. An empty/invalid email is blocked by the browser\'s built-in validation first.',
      explanation: 'The submit event fires on the form for both the button click and Enter key. preventDefault stops the default navigation so JS can handle the data. required/type="email" validation runs before submit fires. change on a select fires right away when the option changes.',
    },
  ],
  interview: [
    { q: 'What is an event listener?', a: 'A function registered to run when a specific event (click, input, submit...) happens on a target. Registered with target.addEventListener(type, handler, options).', level: 'Easy' },
    { q: 'Difference between addEventListener and the onclick property?', a: 'onclick holds only one handler (assigning again overwrites). addEventListener supports multiple handlers per event, options (once, passive, capture) and precise removal with removeEventListener.', level: 'Easy' },
    { q: 'What is the output when the button is clicked once?\nbtn.onclick = () => console.log("A");\nbtn.onclick = () => console.log("B");\nbtn.addEventListener("click", () => console.log("C"));\nbtn.addEventListener("click", () => console.log("D"));', a: 'B, C, D (each on its own line). The second onclick assignment replaced the first; both addEventListener handlers run. Listeners run in the order they were registered (the onclick property counts as registered when first set).', level: 'Medium' },
    { q: 'Difference between the input and change events?', a: 'input fires on every value change (each keystroke). change fires when the value is committed: on blur for text inputs, immediately for checkbox/radio/select.', level: 'Medium' },
    { q: 'What is wrong with btn.addEventListener("click", sayHi())?', a: 'sayHi() is called immediately during registration and its return value (usually undefined) is passed as the listener, so nothing happens on click. Pass the reference: sayHi or () => sayHi().', level: 'Easy' },
    { q: 'Why does removeEventListener sometimes not work?', a: 'You must pass the same function reference (and same capture option) used in addEventListener. Two identical-looking arrow functions are different objects, so an anonymous listener cannot be removed.', level: 'Medium' },
    { q: 'Why listen to "submit" on the form instead of "click" on the button?', a: 'submit also fires when the user presses Enter in a field, runs after built-in validation, and is the semantic event for sending a form. Call e.preventDefault() to stop the page reload.', level: 'Medium' },
    { q: 'What does { once: true } do?', a: 'The listener is automatically removed after it runs the first time.', level: 'Easy' },
    { q: 'What is `this` inside an event handler?', a: 'For a regular function, this is the element the listener is attached to (e.currentTarget). For an arrow function, this is inherited from the surrounding scope, so use e.currentTarget instead.', level: 'Medium' },
    { q: 'How do you detect that the Enter key was pressed?', a: 'Listen to keydown and check e.key === "Enter". (keyCode/which are deprecated.)', level: 'Easy' },
    { q: 'What is a passive listener?', a: '{ passive: true } tells the browser the handler will not call preventDefault, so it can start scrolling immediately without waiting for JS. Recommended for scroll, wheel and touch listeners.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a button that toggles a paragraph between visible and hidden, and changes its own label between "Hide" and "Show".',
      hint: 'Use classList.toggle("hidden") and its return value.',
      solution: `<style>.hidden { display: none; }</style>
<button id="toggle">Hide</button>
<p id="text">Now you see me!</p>
<script>
const btn = document.getElementById('toggle');
const text = document.getElementById('text');
btn.addEventListener('click', () => {
  const hidden = text.classList.toggle('hidden');
  btn.textContent = hidden ? 'Show' : 'Hide';
});
</script>`,
    },
    {
      task: 'Build a live name preview: as the user types in an input, show "Hello, <name>!" below it. If the input is empty show "Hello, stranger!".',
      hint: 'Use the input event and trim().',
      solution: `<input id="name" placeholder="Your name">
<p id="greet">Hello, stranger!</p>
<script>
const nameInput = document.getElementById('name');
const greet = document.getElementById('greet');
nameInput.addEventListener('input', () => {
  const name = nameInput.value.trim();
  greet.textContent = 'Hello, ' + (name || 'stranger') + '!';
});
</script>`,
    },
    {
      task: 'Add an input that adds a list item when the user presses Enter (keydown), and clears the input afterwards. Escape should clear the input without adding.',
      hint: 'if (e.key === "Enter") ... else if (e.key === "Escape") ...',
      solution: `<input id="task" placeholder="Type and press Enter">
<ul id="tasks"></ul>
<script>
const task = document.getElementById('task');
const tasks = document.getElementById('tasks');
task.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && task.value.trim()) {
    const li = document.createElement('li');
    li.textContent = task.value.trim();
    tasks.append(li);
    task.value = '';
  } else if (e.key === 'Escape') {
    task.value = '';
  }
});
</script>`,
    },
    {
      task: 'Create a color picker (input type="color") and a range slider (1-50). Use change/input events to set a box\'s background color and border-radius live.',
      hint: 'Use input for both so updates are live; style.borderRadius = value + "px".',
      solution: `<input type="color" id="color" value="#4caf50">
<input type="range" id="radius" min="0" max="50" value="8">
<div id="box" style="width:120px;height:120px;background:#4caf50;border-radius:8px"></div>
<script>
const box = document.getElementById('box');
document.getElementById('color').addEventListener('input', (e) => {
  box.style.backgroundColor = e.target.value;
});
document.getElementById('radius').addEventListener('input', (e) => {
  box.style.borderRadius = e.target.value + 'px';
});
</script>`,
    },
  ],
  quiz: [
    { question: 'Which is the correct way to listen for clicks?', options: ['btn.addEventListener("onclick", fn)', 'btn.addEventListener("click", fn)', 'btn.addEventListener("click", fn())', 'btn.listen("click", fn)'], answer: 1, explanation: 'Event names have no "on" prefix and you pass the function reference.' },
    { question: 'Which event fires on EVERY keystroke in a text input?', options: ['change', 'submit', 'blur', 'input'], answer: 3, explanation: 'input fires on each value change; change waits for commit.' },
    { question: 'Where should you listen for the submit event?', options: ['On the <form> element', 'On the submit <button>', 'On every <input>', 'On window only'], answer: 0, explanation: 'submit is fired on the form.' },
    { question: 'What does e.preventDefault() do in a submit handler?', options: ['Stops other listeners', 'Clears the form', 'Stops the browser from submitting/reloading the page', 'Validates the inputs'], answer: 2, explanation: 'It cancels the default action (navigation).' },
    { question: 'How can a listener run only the first time the event occurs?', options: ['{ capture: true }', '{ passive: true }', '{ single: true }', '{ once: true }'], answer: 3, explanation: 'once removes the listener after the first call.' },
  ],
};
