export default {
  lesson: 'day-22-dom-selecting-elements',
  minutes: 30,
  intro: 'Select elements with getElementById, querySelector and querySelectorAll, loop over NodeLists and move around the DOM tree.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `document.querySelector(".item")` return when the page has **five** elements with class `item`?',
      options: ['An array of all five', 'A NodeList of all five', 'Only the first matching element', 'null'],
      answer: 2,
      explain: '`querySelector` returns the **first** match (or `null` if nothing matches). Use `querySelectorAll` to get all matches as a NodeList.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: ['getElementById takes the id without the # sign', 'querySelectorAll returns a static NodeList that supports forEach', 'getElementsByClassName returns a live HTMLCollection', 'A NodeList has map and filter built in', 'querySelector accepts any CSS selector like "#menu li.active"'],
      answers: [0, 1, 2, 4],
      explain: '`getElementById("menu")` takes a plain id, while `querySelector("#menu")` takes a CSS selector. A NodeList has `forEach` but **not** `map`/`filter`; convert it with `Array.from()` or `[...list]` first.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 5,
      q: 'Select the heading with id `title` using **getElementById** and change its text to `Welcome, Asha!`. Then select the **first** paragraph with class `note` using **querySelector** and change its text to `Selected!`.',
      example: { title: 'selecting and changing text', code: 'const box = document.getElementById("box");\nbox.textContent = "Hello";\nconst firstLink = document.querySelector("nav a");' },
      html: '<h1 id="title">Welcome</h1>\n<p class="note">Note one</p>\n<p class="note">Note two</p>',
      starter: '// TODO: select #title and the first .note\n',
      solution: 'document.getElementById("title").textContent = "Welcome, Asha!";\ndocument.querySelector(".note").textContent = "Selected!";',
      checks: [
        { sel: '#title', textEq: 'Welcome, Asha!', msg: 'The #title heading should say "Welcome, Asha!"' },
        { sel: '.note', index: 0, textEq: 'Selected!', msg: 'The first .note paragraph should say "Selected!"' },
        { sel: '.note', index: 1, textEq: 'Note two', msg: 'The second .note paragraph must not change' },
      ],
      explain: '`getElementById` needs just the id, `querySelector` needs a CSS selector (`.note` for a class). Because querySelector returns only the first match, the second paragraph stays the same.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 6,
      q: 'There is a list of prices. Use **querySelectorAll** to get every `.price` element, add up their numbers (convert the text with `Number`) and write the total into the `#total` span.',
      example: { title: 'looping over a NodeList', code: 'document.querySelectorAll("li").forEach((li) => {\n  console.log(li.textContent);\n});' },
      html: '<ul>\n  <li>Pen: ₹<span class="price">10</span></li>\n  <li>Notebook: ₹<span class="price">45</span></li>\n  <li>Bag: ₹<span class="price">799</span></li>\n</ul>\n<p>Total: ₹<span id="total">0</span></p>',
      starter: '// TODO: sum all .price values into #total\n',
      solution: 'let total = 0;\ndocument.querySelectorAll(".price").forEach((el) => {\n  total += Number(el.textContent);\n});\ndocument.getElementById("total").textContent = total;',
      checks: [{ sel: '#total', textEq: '854', msg: '#total should show 854 (10 + 45 + 799)' }],
      explain: '`textContent` is always a **string**, so convert it with `Number()` before adding; otherwise `0 + "10"` joins text and you end up with "01045799". NodeLists support `forEach` directly.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 6,
      q: 'Traversing the tree. Start **from the button** `#buy`:\n1. Use `closest(".card")` to find the card around it and give that card the attribute `data-selected="yes"` with `setAttribute`\n2. Use `previousElementSibling` on the button to get the `<h3>` and write its text into `#picked`',
      example: { title: 'moving around', code: 'const li = btn.closest("li");\nconst prev = btn.previousElementSibling;\nconst parent = btn.parentElement;' },
      html: '<div class="card" id="c1">\n  <div class="body">\n    <h3>Wireless Mouse</h3>\n    <button id="buy">Buy</button>\n  </div>\n</div>\n<p>You picked: <span id="picked"></span></p>',
      starter: 'const btn = document.getElementById("buy");\n// TODO\n',
      solution: 'const btn = document.getElementById("buy");\nconst card = btn.closest(".card");\ncard.setAttribute("data-selected", "yes");\ndocument.getElementById("picked").textContent = btn.previousElementSibling.textContent;',
      checks: [
        { sel: '#c1', attr: { name: 'data-selected', value: 'yes' }, msg: 'The .card around the button needs data-selected="yes"' },
        { sel: '#picked', textEq: 'Wireless Mouse', msg: '#picked should show the h3 text "Wireless Mouse"' },
      ],
      explain: '`closest(selector)` walks **up** from the element (including itself) until it finds a match, so it works no matter how deep the button is. `previousElementSibling` gives the element just before it at the same level. `parentElement` here would be `.body`, not the card.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Live vs static collections. The page has `<ul><li class="x">A</li><li class="x">B</li></ul>`. What is printed?',
      code: `const live = document.getElementsByClassName("x");
const fixed = document.querySelectorAll(".x");
const li = document.createElement("li");
li.className = "x";
document.querySelector("ul").append(li);
console.log(live.length);
console.log(fixed.length);`,
      expected: '3\n2',
      explain: 'An HTMLCollection from `getElementsByClassName` is **live**: it updates automatically when the DOM changes. A NodeList from `querySelectorAll` is a **static snapshot** taken at the moment of the call.',
    },
  ],
};
