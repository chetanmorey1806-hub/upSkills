export default {
  id: "day-13-pseudo-classes",
  title: "Pseudo-classes: :hover, :focus, :active, :nth-child, :first-child, :not and :checked",
  module: "Module 3: Selectors & Cascade",
  day: 13,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Pseudo-classes select elements based on their state (hovered, focused, checked) or their position in the document (first, last, nth). Learn the most-used ones to build interactive, zebra-striped and accessible interfaces without JavaScript.",
  objectives: [
    "Style user-interaction states with :hover, :focus, :focus-visible and :active",
    "Select elements by position with :first-child, :last-child, :nth-child() and :nth-of-type()",
    "Exclude elements with :not()",
    "Build form and toggle styles with :checked, :disabled and :required",
  ],
  theory: [
    {
      heading: "What Is a Pseudo-class?",
      content: "A pseudo-class is a keyword added to a selector with a **single colon** that targets elements in a special **state** or **position**, without needing extra classes in your HTML.\n\nExamples: `a:hover`, `li:first-child`, `input:checked`.\n\nAnalogy: a class is a permanent name tag; a pseudo-class is a temporary condition, like 'the person currently speaking' or 'the third person in the queue'.",
      syntax: `selector:pseudo-class { property: value; }`,
    },
    {
      heading: "User Action States: :hover, :focus, :focus-visible, :active",
      content: "- `:hover` - mouse pointer is over the element\n- `:focus` - element has keyboard/mouse focus (inputs, links, buttons)\n- `:focus-visible` - focus that the browser thinks should be visible (keyboard navigation), great for focus rings that don't appear on mouse clicks\n- `:active` - element is being pressed (mouse button down)\n- `:focus-within` - element contains a focused child (e.g. highlight a whole form group)\n\nFor links, write them in **LVHA** order to avoid overrides: `:link`, `:visited`, `:hover`, `:active` ('LoVe HAte').",
      syntax: `a:link    { color: #2563eb; }
a:visited { color: #7c3aed; }
a:hover   { text-decoration: underline; }
a:active  { color: #dc2626; }
button:focus-visible { outline: 3px solid orange; }`,
      tip: "Touch screens have no real hover. Never hide essential information behind :hover only.",
    },
    {
      heading: "Structural: :first-child, :last-child, :only-child",
      content: "- `:first-child` - element that is the **first child** of its parent\n- `:last-child` - the last child\n- `:only-child` - the only child\n- `:first-of-type` / `:last-of-type` - first/last among siblings of the **same tag**\n\nImportant: `p:first-child` means 'a p that is the first child', NOT 'the first p'. If an h2 comes first, `p:first-child` matches nothing; use `p:first-of-type` instead.",
      syntax: `li:first-child { border-top: none; }
li:last-child  { border-bottom: none; }
article p:first-of-type { font-size: 1.2rem; }`,
    },
    {
      heading: ":nth-child() and :nth-of-type()",
      content: "`:nth-child(An+B)` selects children by position (counting starts at **1**):\n- `:nth-child(3)` - the 3rd child\n- `:nth-child(odd)` / `(2n+1)` - 1st, 3rd, 5th...\n- `:nth-child(even)` / `(2n)` - 2nd, 4th, 6th...\n- `:nth-child(3n)` - every 3rd: 3, 6, 9...\n- `:nth-child(n+4)` - from the 4th onwards\n- `:nth-child(-n+3)` - the first three\n- `:nth-last-child(2)` - second from the end\n\n`:nth-of-type()` works the same but counts only siblings of the same tag.\n\nHow to read An+B: n takes values 0, 1, 2, 3...; calculate A×n+B for each and keep positive results.",
      syntax: `tr:nth-child(even) { background: #f1f5f9; }   /* zebra stripes */
.grid > div:nth-child(3n) { margin-right: 0; }
li:nth-child(-n+3) { font-weight: bold; }      /* top 3 */`,
    },
    {
      heading: ":not() - Exclusion",
      content: "`:not(selector)` matches elements that do NOT match the selector inside.\n\n- `li:not(:last-child)` - every item except the last (great for separators)\n- `button:not(.primary)` - all non-primary buttons\n- `input:not([type=\"checkbox\"])` - all inputs except checkboxes\n\nModern browsers accept a list: `:not(.a, .b)`. Specificity of :not() equals its most specific argument.",
      syntax: `li:not(:last-child) { border-bottom: 1px solid #e5e7eb; }`,
    },
    {
      heading: "Form States: :checked, :disabled, :required, :valid, :invalid",
      content: "- `:checked` - checked checkbox, radio, or selected <option>\n- `:disabled` / `:enabled` - form controls with or without the disabled attribute\n- `:required` / `:optional`\n- `:valid` / `:invalid` - based on HTML validation (type=email, pattern...)\n- `:placeholder-shown` - input currently showing its placeholder\n\nCombined with sibling combinators (Day 12), `:checked` powers CSS-only toggles, tabs and accordions.\n\nComing next: pseudo-elements (Day 14).",
      syntax: `input:checked + label { text-decoration: line-through; }
button:disabled { opacity: 0.5; cursor: not-allowed; }
input:invalid:not(:placeholder-shown) { border-color: red; }`,
    },
  ],
  examples: [
    {
      title: "Interactive Button States",
      scenario: "A button should react to hover, keyboard focus and click press.",
      steps: [
        "Create two buttons",
        "Add :hover (darker), :active (pressed down) and :focus-visible (focus ring)",
        "Click Run, hover, click and press Tab",
      ],
      code: `.btn:hover  { background: #1d4ed8; }
.btn:active { transform: translateY(2px); }
.btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }`,
      playground: {
        html: `<button class="btn">Hover, click or Tab to me</button>
<button class="btn">Second button</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 24px; }
.btn { background: #3b82f6; color: white; border: none; padding: 12px 22px; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px; }
.btn:hover  { background: #1d4ed8; }
.btn:active { transform: translateY(2px); background: #1e3a8a; }
.btn:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }`,
      },
      result: "Hover darkens the button, pressing moves it down slightly and makes it even darker, and tabbing shows an amber ring (but mouse clicks do not show the ring).",
      explanation: "Each pseudo-class matches only while that state is true, so styles switch automatically without JavaScript.",
    },
    {
      title: "Zebra Table with :nth-child and Row Hover",
      scenario: "Make a data table easier to read with alternating rows and hover highlighting.",
      steps: [
        "Create a table with several rows",
        "Use tbody tr:nth-child(even) for stripes",
        "Use tbody tr:hover for highlighting",
        "Highlight the top 3 rows with :nth-child(-n+3)",
        "Click Run",
      ],
      code: `tbody tr:nth-child(even) { background: #f1f5f9; }
tbody tr:nth-child(-n+3) td:first-child { font-weight: bold; }
tbody tr:hover { background: #fef9c3; }`,
      playground: {
        html: `<table>
  <thead><tr><th>Rank</th><th>Player</th><th>Score</th></tr></thead>
  <tbody>
    <tr><td>1</td><td>Asha</td><td>980</td></tr>
    <tr><td>2</td><td>Ben</td><td>940</td></tr>
    <tr><td>3</td><td>Chen</td><td>910</td></tr>
    <tr><td>4</td><td>Dia</td><td>870</td></tr>
    <tr><td>5</td><td>Eli</td><td>850</td></tr>
    <tr><td>6</td><td>Fay</td><td>820</td></tr>
  </tbody>
</table>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
table { border-collapse: collapse; width: 320px; }
th, td { padding: 8px 12px; text-align: left; }
thead { background: #0f172a; color: white; }
tbody tr:nth-child(even) { background: #f1f5f9; }
tbody tr:nth-child(-n+3) td:first-child { font-weight: bold; color: #b45309; }
tbody tr:hover { background: #fef9c3; }`,
      },
      result: "Rows alternate white and light grey; ranks 1-3 are bold amber; hovering any row turns it yellow.",
      explanation: "even = 2n; -n+3 produces 3, 2, 1 (positive results only). :hover is written last so it overrides the stripe color.",
    },
    {
      title: "first-child, last-child, :not() and first-of-type",
      scenario: "Style a list with separators between items, and understand why p:first-child can fail.",
      steps: [
        "Create a list and add borders with li:not(:last-child)",
        "Round the first and last items' corners",
        "Create an article starting with an h3 and compare p:first-child vs p:first-of-type",
        "Click Run",
      ],
      code: `li:not(:last-child) { border-bottom: 1px solid #cbd5e1; }
li:first-child { border-radius: 8px 8px 0 0; }
li:last-child  { border-radius: 0 0 8px 8px; }
article p:first-child   { color: red; }    /* matches nothing here */
article p:first-of-type { color: green; }`,
      playground: {
        html: `<ul>
  <li>Inbox</li><li>Starred</li><li>Sent</li><li>Trash</li>
</ul>
<article>
  <h3>Article title</h3>
  <p>First paragraph: green via :first-of-type (p:first-child does not match because h3 is first).</p>
  <p>Second paragraph.</p>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
ul { list-style: none; padding: 0; width: 220px; }
li { background: #e0e7ff; padding: 10px 14px; }
li:not(:last-child) { border-bottom: 1px solid #a5b4fc; }
li:first-child { border-radius: 8px 8px 0 0; }
li:last-child  { border-radius: 0 0 8px 8px; }
article p:first-child   { color: red; }
article p:first-of-type { color: green; font-weight: bold; }`,
      },
      result: "A rounded list with dividers between items but none after Trash. In the article, the first paragraph is green and bold; nothing is red.",
      explanation: ":first-child checks position among ALL siblings; :first-of-type checks among siblings of the same tag. :not(:last-child) avoids an extra border at the bottom.",
    },
    {
      title: "CSS-only To-Do with :checked and :disabled",
      scenario: "Cross out completed tasks and dim a disabled item without JavaScript.",
      steps: [
        "Create checkboxes, each followed by a label",
        "Use input:checked + label to strike through",
        "Use input:disabled + label to dim",
        "Click Run and tick the boxes",
      ],
      code: `input:checked + label  { text-decoration: line-through; color: #9ca3af; }
input:disabled + label { opacity: 0.5; cursor: not-allowed; }`,
      playground: {
        html: `<h3>Today</h3>
<div><input type="checkbox" id="t1"><label for="t1">Learn pseudo-classes</label></div>
<div><input type="checkbox" id="t2" checked><label for="t2">Review combinators</label></div>
<div><input type="checkbox" id="t3"><label for="t3">Build a zebra table</label></div>
<div><input type="checkbox" id="t4" disabled><label for="t4">Locked task (disabled)</label></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; font-size: 18px; }
div { padding: 6px 0; }
input { width: 18px; height: 18px; vertical-align: middle; margin-right: 8px; accent-color: #16a34a; }
input:checked + label  { text-decoration: line-through; color: #9ca3af; }
input:disabled + label { opacity: 0.5; cursor: not-allowed; }
div:focus-within { background: #f0fdf4; }`,
      },
      result: "'Review combinators' starts crossed out. Ticking any box crosses out its label; the disabled task is faded and can't be clicked. The row with focus gets a light green background.",
      explanation: ":checked updates live as the user clicks. Combined with + it styles the label next to it. :focus-within styles the parent row while its input is focused.",
    },
  ],
  interview: [
    { q: "What is a pseudo-class?", a: "A keyword with a single colon that selects elements based on state or position, e.g. :hover, :focus, :nth-child(2), :checked.", level: "Easy" },
    { q: "What is the difference between :focus and :focus-visible?", a: ":focus matches any focused element. :focus-visible matches only when the browser decides focus should be visible, typically keyboard navigation, so you can show focus rings for keyboard users without showing them on mouse clicks.", level: "Medium" },
    { q: "What is the LVHA order and why does it matter?", a: ":link, :visited, :hover, :active. These have equal specificity, so later rules win; this order ensures hover and active states are not overridden by link/visited.", level: "Medium" },
    { q: "Difference between :nth-child(2) and :nth-of-type(2)?", a: ":nth-child(2) is the second child regardless of type (and must also match the selector). :nth-of-type(2) is the second sibling of that element type.", level: "Medium" },
    { q: "Why might p:first-child not select the first paragraph?", a: "Because it requires the p to be the very first child of its parent. If a heading comes first, it doesn't match. Use p:first-of-type.", level: "Medium" },
    { q: "Which elements does li:nth-child(3n+1) select?", a: "The 1st, 4th, 7th, 10th... items (n = 0, 1, 2, 3...).", level: "Medium" },
    { q: "How do you select the first three items?", a: "li:nth-child(-n+3)", level: "Hard" },
    { q: "What does :not() do? Give an example.", a: "It selects elements not matching its argument, e.g. li:not(:last-child) { border-bottom: 1px solid; } to add separators except after the last item.", level: "Easy" },
    { q: "How can you build a toggle without JavaScript?", a: "Use a hidden checkbox and :checked with a sibling combinator: #toggle:checked ~ .menu { display: block; }.", level: "Hard" },
    { q: "What is :focus-within?", a: "Matches an element if it or any descendant has focus. Useful for highlighting a form group or keeping dropdowns open while navigating with keyboard.", level: "Medium" },
    { q: "What is the specificity of a pseudo-class?", a: "Same as a class (0,1,0). Exceptions: :not(), :is() and :has() take the specificity of their most specific argument, and :where() is always 0.", level: "Hard" },
  ],
  practice: [
    {
      task: "Make navigation links change color and show an underline on hover, and show an orange outline on keyboard focus.",
      hint: ":hover and :focus-visible.",
      solution: `nav a { color: #111; text-decoration: none; }
nav a:hover { color: #2563eb; text-decoration: underline; }
nav a:focus-visible { outline: 2px solid orange; outline-offset: 2px; }`,
    },
    {
      task: "In a 9-item product grid, remove the right margin from every 3rd item and give the first item a 'featured' border.",
      hint: ":nth-child(3n) and :first-child",
      solution: `.grid > .item { display: inline-block; width: 30%; margin-right: 5%; }
.grid > .item:nth-child(3n) { margin-right: 0; }
.grid > .item:first-child { border: 3px solid gold; }`,
    },
    {
      task: "Style all buttons except those with class .ghost with a solid blue background.",
      hint: "button:not(.ghost)",
      solution: `button:not(.ghost) { background: #2563eb; color: white; border: none; }
button.ghost { background: transparent; border: 1px solid #2563eb; color: #2563eb; }`,
    },
    {
      task: "Show a red border on an email input only when the user typed an invalid email (not while empty), and green when valid.",
      hint: ":invalid:not(:placeholder-shown) and :valid:not(:placeholder-shown).",
      solution: `<input type="email" placeholder="you@example.com">
<style>
input { border: 2px solid #ccc; padding: 8px; }
input:invalid:not(:placeholder-shown) { border-color: #dc2626; }
input:valid:not(:placeholder-shown)   { border-color: #16a34a; }
</style>`,
    },
    {
      task: "Build CSS-only radio 'tabs': three radio buttons, and the panel matching the checked radio is shown.",
      hint: "#tab1:checked ~ .p1 { display: block; } with all panels hidden by default.",
      solution: `<input type="radio" name="t" id="tab1" checked><label for="tab1">One</label>
<input type="radio" name="t" id="tab2"><label for="tab2">Two</label>
<input type="radio" name="t" id="tab3"><label for="tab3">Three</label>
<div class="p p1">Panel one</div>
<div class="p p2">Panel two</div>
<div class="p p3">Panel three</div>
<style>
.p { display: none; padding: 12px; border: 1px solid #ccc; }
#tab1:checked ~ .p1, #tab2:checked ~ .p2, #tab3:checked ~ .p3 { display: block; }
</style>`,
    },
  ],
  quiz: [
    { question: "Which pseudo-class applies while the mouse is over an element?", options: [":active", ":focus", ":hover", ":visited"], answer: 2, explanation: ":hover matches during pointer hover." },
    { question: "li:nth-child(odd) selects:", options: ["1st, 3rd, 5th...", "2nd, 4th, 6th...", "Only the 1st", "Every 3rd"], answer: 0, explanation: "odd = 2n+1." },
    { question: "Which selects all list items except the last?", options: ["li:last-child", "li:nth-last-child(1)", "li:only-child", "li:not(:last-child)"], answer: 3, explanation: ":not() excludes the last child." },
    { question: "Which matches a ticked checkbox?", options: [":selected", ":checked", ":on", ":active"], answer: 1, explanation: ":checked matches checked checkboxes and radios." },
    { question: "Counting in :nth-child() starts at:", options: ["0", "-1", "1", "Depends on browser"], answer: 2, explanation: "The first child is position 1." },
  ],
};
