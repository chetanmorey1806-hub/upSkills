export default {
  lesson: 'day-26-event-object-bubbling-delegation',
  minutes: 35,
  intro: 'Use the event object, understand bubbling and capturing, delegate events for dynamic lists and cancel default actions.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A click listener is on a `<ul>` and the user clicks an `<li>` inside it. Inside the handler, what are `e.target` and `e.currentTarget`?',
      options: ['Both are the <ul>', 'Both are the <li>', 'target is the <li> (what was clicked), currentTarget is the <ul> (where the listener is)', 'target is the <ul>, currentTarget is the <li>'],
      answer: 2,
      explain: '`e.target` is the **deepest element actually clicked**. `e.currentTarget` is the element **whose listener is running** right now. This difference is what makes event delegation possible.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Bubbling vs capturing. The page is `<div id="outer"><button id="inner">Go</button></div>`. The button is clicked once. What is printed?',
      code: `const outer = document.getElementById("outer");
const inner = document.getElementById("inner");
outer.addEventListener("click", () => console.log("outer bubble"));
outer.addEventListener("click", () => console.log("outer capture"), { capture: true });
inner.addEventListener("click", () => console.log("inner"));
inner.click();`,
      expected: 'outer capture\ninner\nouter bubble',
      explain: 'An event travels in three phases: **capturing** (window → down to the target), **target**, then **bubbling** (back up). Capture listeners run on the way down, normal listeners run on the way up.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 7,
      q: 'Event delegation for a to-do list. Add **one** click listener to `#todos` (not to each item). When a `.delete` button inside any item is clicked, remove that whole `<li>`. It must also work for the item added later by the "Add" button.',
      example: { title: 'delegation with closest', code: 'menu.addEventListener("click", (e) => {\n  const link = e.target.closest(".menu-link");\n  if (!link) return;\n  console.log("You chose", link.textContent);\n});' },
      html: '<ul id="todos">\n  <li>Buy milk <button class="delete">✕</button></li>\n  <li>Pay fees <button class="delete">✕</button></li>\n</ul>\n<button id="add">Add</button>',
      starter: 'document.getElementById("add").addEventListener("click", () => {\n  document.getElementById("todos").insertAdjacentHTML("beforeend", \'<li id="late">Call mom <button class="delete">✕</button></li>\');\n});\n// TODO: one delegated listener on #todos\n',
      solution: 'document.getElementById("add").addEventListener("click", () => {\n  document.getElementById("todos").insertAdjacentHTML("beforeend", \'<li id="late">Call mom <button class="delete">✕</button></li>\');\n});\ndocument.getElementById("todos").addEventListener("click", (e) => {\n  const btn = e.target.closest(".delete");\n  if (!btn) return;\n  btn.closest("li").remove();\n});',
      actions: [{ click: '#add' }, { click: '#todos li:first-child .delete' }, { click: '#late .delete' }],
      checks: [
        { sel: '#todos li', count: 1, msg: 'After deleting two items only one <li> should remain' },
        { sel: '#todos li', text: 'Pay fees', msg: '"Pay fees" should be the remaining item' },
        { sel: '#late', notExists: true, msg: 'The item added later must also be deletable (delegation)' },
      ],
      explain: 'Clicks on the buttons **bubble up** to `#todos`, so one listener handles every item, including ones created later. `e.target.closest(".delete")` finds the button even if the click landed on something inside it, and returns null for clicks elsewhere.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 5,
      q: 'Cancel default actions. The link `#terms` must NOT navigate; instead it should show the text `Terms shown` in `#msg`. Use `e.preventDefault()`.',
      example: { title: 'preventDefault', code: 'form.addEventListener("submit", (e) => {\n  e.preventDefault(); // stop page reload\n});' },
      html: '<a id="terms" href="https://example.com/terms">Read terms</a>\n<p id="msg"></p>',
      starter: 'const link = document.getElementById("terms");\n// TODO\n',
      solution: 'const link = document.getElementById("terms");\nlink.addEventListener("click", (e) => {\n  e.preventDefault();\n  document.getElementById("msg").textContent = "Terms shown";\n});',
      actions: [{ click: '#terms' }],
      checks: [{ sel: '#msg', textEq: 'Terms shown', msg: 'Clicking the link should show "Terms shown" without leaving the page' }],
      explain: '`preventDefault()` cancels the browser\'s built-in action (following a link, submitting a form, ticking a checkbox), while your own code still runs. It does **not** stop bubbling; that is `stopPropagation()`.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 6,
      q: 'Clicking the **Like** button inside a card should only increase `#likes`; it must **not** also trigger the card\'s own click handler (which opens the details). Add a listener to `#like` that increases the like count and calls `e.stopPropagation()`.',
      example: { title: 'stopping the bubble', code: 'child.addEventListener("click", (e) => {\n  e.stopPropagation(); // parent listeners will not run\n});' },
      html: '<div id="card">\n  <h3>Goa Trip</h3>\n  <button id="like">♥ Like</button>\n</div>\n<p>Likes: <span id="likes">0</span></p>\n<p id="details"></p>',
      starter: 'document.getElementById("card").addEventListener("click", () => {\n  document.getElementById("details").textContent = "Opening details...";\n});\nlet likes = 0;\n// TODO\n',
      solution: 'document.getElementById("card").addEventListener("click", () => {\n  document.getElementById("details").textContent = "Opening details...";\n});\nlet likes = 0;\ndocument.getElementById("like").addEventListener("click", (e) => {\n  e.stopPropagation();\n  likes++;\n  document.getElementById("likes").textContent = likes;\n});',
      actions: [{ click: '#like' }, { click: '#like' }],
      checks: [
        { sel: '#likes', textEq: '2', msg: 'Two Like clicks should show 2 likes' },
        { sel: '#details', textEq: '', msg: 'The card\'s details must NOT open when Like is clicked' },
      ],
      explain: '`stopPropagation()` stops the event from bubbling to ancestors, so the card handler never sees the click. Use it sparingly: other code (like analytics or delegated menus) may rely on bubbling.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are useful properties of the **event object**? (choose all that apply)',
      options: ['e.type, e.g. "click"', 'e.key for keyboard events', 'e.clientX / e.clientY for mouse position', 'e.target for the element that started the event', 'e.innerHTML'],
      answers: [0, 1, 2, 3],
      explain: 'The browser passes an event object to every handler with details about what happened: its type, target, key, mouse coordinates, timeStamp and methods such as `preventDefault()`. `innerHTML` belongs to elements, not events.',
    },
  ],
};
