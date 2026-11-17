export default {
  id: "day-10-display-visibility",
  title: "Display Property: block, inline, inline-block, none; and visibility",
  module: "Module 2: Box Model & Positioning",
  day: 10,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "The display property decides how an element's box behaves in the page flow. Learn block, inline and inline-block, how to hide elements with display: none versus visibility: hidden, and when to use each.",
  objectives: [
    "Describe how block, inline and inline-block boxes flow and size",
    "Change an element's display type to build navbars and button rows",
    "Hide elements correctly with display: none, visibility: hidden or opacity: 0",
    "Know the default display value of common HTML elements",
  ],
  theory: [
    {
      heading: "What display Controls",
      content: "Every element has a default display value set by the browser. The display value decides:\n- Does the element start on a **new line**?\n- Does it take the **full width** or only as much as its content?\n- Do **width, height** and vertical margin/padding work?\n\nAnalogy: block elements are like bricks stacked in a wall, each taking a full row. Inline elements are like words in a sentence, flowing one after another and wrapping at the end of a line.\n\nOther values like `flex` and `grid` (Days 17-20) create layout containers; today we focus on the basics.",
    },
    {
      heading: "display: block",
      content: "Block elements:\n- Always start on a new line\n- Stretch to fill the full width of their parent by default\n- Respect width, height, margin and padding on all sides\n\nDefault block elements: div, p, h1-h6, ul, ol, li, section, article, header, footer, nav, form, table (table has its own display type).",
      syntax: `a.button-link { display: block; } /* full-width clickable link */`,
    },
    {
      heading: "display: inline",
      content: "Inline elements:\n- Do NOT start on a new line; they sit inside text\n- Take only the width of their content\n- **Ignore width and height**\n- Horizontal margin/padding push neighbours; vertical padding is painted but doesn't move surrounding lines, and vertical margins are ignored\n\nDefault inline elements: span, a, strong, em, b, i, code, label, abbr. (img, input and button are 'replaced' or inline-block-like elements: they flow inline but DO accept width/height.)",
      syntax: `li { display: inline; }  /* list items side by side */`,
      tip: "Common mistake: setting width/height on a <span> or <a> and wondering why nothing changes. Change its display to inline-block or block first.",
    },
    {
      heading: "display: inline-block",
      content: "inline-block is a hybrid:\n- Flows **inline** (sits next to other elements, wraps like text)\n- But behaves like a **block** inside: width, height and all margins/padding work\n\nPerfect for buttons, badges, navigation links and simple card rows.\n\nQuirk: spaces/newlines between inline-block elements in HTML render as a small gap (~4px), because they are treated like spaces between words. Flexbox later solves this cleanly.",
      syntax: `.nav a { display: inline-block; padding: 10px 16px; }`,
    },
    {
      heading: "Hiding: display: none vs visibility: hidden vs opacity: 0",
      content: "Three ways to make something invisible, with different side effects:\n\n- `display: none` - element is **removed from layout** completely. Takes no space, not clickable, hidden from screen readers.\n- `visibility: hidden` - element is invisible but **still takes its space** (a blank hole). Not clickable, hidden from screen readers. Children can override with visibility: visible.\n- `opacity: 0` - fully transparent but **still takes space and is still clickable** and readable by screen readers.\n\n`visibility: collapse` is used for table rows/columns.\n\nAnalogy: display none = the chair is taken out of the room; visibility hidden = the chair is invisible but you still can't put anything in its spot.",
      points: [
        "Use display: none for menus, modals and tabs that are closed",
        "Use visibility: hidden when you must keep the layout from jumping",
        "For screen-reader-only text, use a 'visually-hidden' class, not display: none",
      ],
    },
    {
      heading: "Other Display Values (Preview)",
      content: "- `flex` / `inline-flex` - one-dimensional layout (Day 17)\n- `grid` / `inline-grid` - two-dimensional layout (Day 19)\n- `flow-root` - a block that contains floats and stops margin collapse (seen on Day 8)\n- `contents` - the element's box disappears, children act as if they belong to the grandparent\n- `list-item`, `table`, `table-cell` - mimic lists and tables\n\nComing next: the position property (Day 11).",
    },
  ],
  examples: [
    {
      title: "Block vs Inline vs Inline-Block",
      scenario: "Apply the same width, height and margin to three elements with different display values and observe.",
      steps: [
        "Create three groups of two spans each",
        "Set display: block, inline and inline-block on each group",
        "Give all spans width 120px, height 50px, margin 8px",
        "Click Run",
      ],
      code: `span { width: 120px; height: 50px; margin: 8px; }
.block  span { display: block; }
.inline span { display: inline; }
.ib     span { display: inline-block; }`,
      playground: {
        html: `<h4>display: block</h4>
<div class="block"><span>One</span><span>Two</span></div>
<h4>display: inline</h4>
<div class="inline">Text before <span>One</span><span>Two</span> text after</div>
<h4>display: inline-block</h4>
<div class="ib">Text before <span>One</span><span>Two</span> text after</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
h4 { margin: 14px 0 4px; }
span { width: 120px; height: 50px; margin: 8px; padding: 4px; background: #a5b4fc; border: 2px solid #4338ca; }
.block  span { display: block; }
.inline span { display: inline; }
.ib     span { display: inline-block; }`,
      },
      result: "Block spans stack vertically, each 120×50. Inline spans sit inside the text line and ignore width/height. Inline-block spans sit inline but are 120×50 boxes with margins all around.",
      explanation: "Only block and inline-block honour width/height and vertical margins. Inline boxes size to their content.",
    },
    {
      title: "Horizontal Navbar with inline-block",
      scenario: "Turn a vertical list of links into a horizontal navigation bar with padded clickable links.",
      steps: [
        "Create a <ul> of links inside <nav>",
        "Set li to display: inline-block",
        "Set a to display: inline-block with padding",
        "Click Run and hover the links",
      ],
      code: `nav li { display: inline-block; }
nav a  { display: inline-block; padding: 12px 18px; }`,
      playground: {
        html: `<nav>
  <ul>
    <li><a href="#">Home</a></li>
    <li><a href="#">Courses</a></li>
    <li><a href="#">Pricing</a></li>
    <li><a href="#">Contact</a></li>
  </ul>
</nav>`,
        css: `body { margin: 0; font-family: system-ui, sans-serif; }
nav { background: #0f172a; }
nav ul { list-style: none; margin: 0; padding: 0 8px; }
nav li { display: inline-block; }
nav a { display: inline-block; padding: 14px 18px; color: #e2e8f0; text-decoration: none; }
nav a:hover { background: #1e293b; color: #38bdf8; }`,
      },
      result: "A dark horizontal bar with four links in a row; hovering highlights a full padded rectangle.",
      explanation: "List items are block by default (stacked). inline-block puts them on one line while still allowing padding to create big clickable areas.",
    },
    {
      title: "display: none vs visibility: hidden vs opacity: 0",
      scenario: "Hide the middle box in three rows using different techniques and compare the layout.",
      steps: [
        "Create three rows, each with boxes A, B, C",
        "Hide B with display: none, visibility: hidden and opacity: 0",
        "Click Run, then click where B was in each row",
      ],
      code: `.row1 .b { display: none; }
.row2 .b { visibility: hidden; }
.row3 .b { opacity: 0; }`,
      playground: {
        html: `<p>display: none</p>
<div class="row row1"><div class="box">A</div><div class="box b">B</div><div class="box">C</div></div>
<p>visibility: hidden</p>
<div class="row row2"><div class="box">A</div><div class="box b">B</div><div class="box">C</div></div>
<p>opacity: 0</p>
<div class="row row3"><div class="box">A</div><div class="box b">B</div><div class="box">C</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
p { margin: 12px 0 4px; font-weight: bold; }
.box { display: inline-block; width: 70px; height: 50px; line-height: 50px; text-align: center; background: #fca5a5; margin-right: 6px; cursor: pointer; }
.row1 .b { display: none; }
.row2 .b { visibility: hidden; }
.row3 .b { opacity: 0; }`,
        js: `document.querySelectorAll('.box').forEach(function (box) {
  box.addEventListener('click', function () {
    console.log('Clicked', box.textContent, 'in', box.parentElement.className);
  });
});`,
      },
      result: "Row 1: C moves next to A (no gap). Row 2: an empty gap remains where B was. Row 3: a gap remains too, and clicking it logs 'Clicked B in row row3' in the console; clicking the row 2 gap logs nothing.",
      explanation: "display: none removes the box; visibility: hidden keeps space but disables interaction; opacity: 0 keeps space and interaction.",
    },
    {
      title: "Toggle a Menu with display",
      scenario: "Show and hide a dropdown panel by toggling a class that switches display.",
      steps: [
        "Create a button and a .panel with display: none",
        "Write a .panel.open { display: block; } rule",
        "Toggle the open class with a small JS click handler",
        "Click Run and press the button",
      ],
      code: `.panel { display: none; }
.panel.open { display: block; }`,
      playground: {
        html: `<button id="toggle">Menu</button>
<div class="panel" id="panel">
  <a href="#">Profile</a>
  <a href="#">Settings</a>
  <a href="#">Logout</a>
</div>
<p>Content below moves when the menu opens because display: none takes no space.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { padding: 8px 16px; }
.panel { display: none; border: 1px solid #cbd5e1; width: 180px; margin-top: 6px; }
.panel.open { display: block; }
.panel a { display: block; padding: 10px; color: #0f172a; text-decoration: none; }
.panel a:hover { background: #f1f5f9; }`,
        js: `document.getElementById('toggle').addEventListener('click', function () {
  document.getElementById('panel').classList.toggle('open');
});`,
      },
      result: "Clicking Menu shows a stacked list of links and pushes the paragraph down; clicking again hides it.",
      explanation: "The JS only toggles a class; CSS decides visibility. Links use display: block so each fills the row and has a full-width hover area.",
    },
  ],
  interview: [
    { q: "What is the difference between block, inline and inline-block?", a: "Block starts on a new line, fills available width and respects all box properties. Inline flows within text, sizes to content and ignores width/height and vertical margins. Inline-block flows inline but respects width, height, margins and padding.", level: "Easy" },
    { q: "display: none vs visibility: hidden?", a: "display: none removes the element from the layout (no space). visibility: hidden hides it but keeps its space. Both remove it from the accessibility tree and from interaction.", level: "Easy" },
    { q: "How is opacity: 0 different from visibility: hidden?", a: "opacity: 0 is still interactive (clickable, focusable) and read by screen readers; visibility: hidden is not.", level: "Medium" },
    { q: "Name five default block and five default inline elements.", a: "Block: div, p, h1, ul, section. Inline: span, a, strong, em, code.", level: "Easy" },
    { q: "Why doesn't width work on a <span>?", a: "span is inline by default, and inline boxes ignore width and height. Use inline-block or block.", level: "Easy" },
    { q: "Why do gaps appear between inline-block elements?", a: "Whitespace (spaces/newlines) between them in HTML is rendered as a text space. Fix by removing whitespace, using font-size: 0 on the parent, or better, using flexbox.", level: "Medium" },
    { q: "How do you hide content visually but keep it for screen readers?", a: "Use a visually-hidden class: position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; margin: -1px; padding: 0; border: 0.", level: "Hard" },
    { q: "Can a child be visible inside a visibility: hidden parent?", a: "Yes, by setting visibility: visible on the child. That is not possible with display: none.", level: "Hard" },
    { q: "What does display: contents do?", a: "Removes the element's own box so its children are laid out as if they were direct children of its parent. Useful in grid/flex layouts but be careful with accessibility of semantic elements.", level: "Hard" },
    { q: "Is <img> inline or block?", a: "It is an inline replaced element: it flows inline but accepts width and height. It sits on the text baseline, which causes a small gap below it unless set to display: block or vertical-align: middle.", level: "Medium" },
  ],
  practice: [
    {
      task: "Make a <span class=\"chip\"> 100px wide and 32px tall with a background color.",
      hint: "Change display first.",
      solution: `<span class="chip">Chip</span>
<style>.chip { display: inline-block; width: 100px; height: 32px; line-height: 32px; text-align: center; background: #fde68a; }</style>`,
    },
    {
      task: "Turn a footer list of five links into a horizontal row with 12px spacing using inline-block.",
      hint: "li { display: inline-block; margin-right: 12px; }",
      solution: `<ul class="links">
  <li><a href="#">About</a></li><li><a href="#">Jobs</a></li><li><a href="#">Press</a></li><li><a href="#">Help</a></li><li><a href="#">Legal</a></li>
</ul>
<style>
.links { list-style: none; padding: 0; }
.links li { display: inline-block; margin-right: 12px; }
</style>`,
    },
    {
      task: "Create an image gallery of three 150px images that sit side by side using inline-block wrappers with captions underneath.",
      hint: "Each figure is inline-block; img is display: block inside.",
      solution: `<figure class="g"><img src="https://picsum.photos/150?1" alt="Photo 1"><figcaption>One</figcaption></figure>
<figure class="g"><img src="https://picsum.photos/150?2" alt="Photo 2"><figcaption>Two</figcaption></figure>
<figure class="g"><img src="https://picsum.photos/150?3" alt="Photo 3"><figcaption>Three</figcaption></figure>
<style>
.g { display: inline-block; margin: 0 8px 0 0; text-align: center; }
.g img { display: block; width: 150px; height: 150px; }
</style>`,
    },
    {
      task: "Build a 'Show answer' button that reveals a hidden answer paragraph using display toggling, and an alternative version using visibility to avoid layout shift.",
      hint: "Toggle a class with JS.",
      solution: `<button id="b">Show answer</button>
<p id="a" class="answer">Paris</p>
<p>Next question...</p>
<style>
.answer { display: none; }
.answer.show { display: block; }
/* Alternative without layout shift:
.answer { visibility: hidden; }
.answer.show { visibility: visible; } */
</style>
<script>
document.getElementById('b').onclick = () => document.getElementById('a').classList.toggle('show');
</script>`,
    },
  ],
  quiz: [
    { question: "Which display value ignores width and height?", options: ["block", "inline-block", "inline", "flow-root"], answer: 2, explanation: "Inline boxes size to their content." },
    { question: "Which hiding method keeps the element's space?", options: ["visibility: hidden", "display: none", "removing the element", "display: contents"], answer: 0, explanation: "visibility: hidden leaves a blank space." },
    { question: "What is the default display of <a>?", options: ["block", "inline", "inline-block", "flex"], answer: 1, explanation: "Links are inline." },
    { question: "Which element is block-level by default?", options: ["span", "strong", "a", "p"], answer: 3, explanation: "Paragraphs are block elements." },
    { question: "Which keeps an element clickable while invisible?", options: ["display: none", "visibility: hidden", "opacity: 0", "visibility: collapse"], answer: 2, explanation: "opacity: 0 still receives pointer events." },
  ],
};
