export default {
  id: "day-08-margin-padding-borders",
  title: "Margin, Padding, Borders, border-radius, Outline and Margin Collapsing",
  module: "Module 2: Box Model & Positioning",
  day: 8,
  level: "Beginner",
  duration: "2 hours",
  summary: "Go deep into spacing and borders: shorthand value patterns, individual sides, border styles, rounded corners, outlines for focus, and the famous margin collapsing behavior.",
  objectives: [
    "Write margin and padding using 1, 2, 3 and 4-value shorthands",
    "Style borders per side and create rounded shapes with border-radius",
    "Explain how outline differs from border and why it matters for accessibility",
    "Predict and prevent vertical margin collapsing",
  ],
  theory: [
    {
      heading: "Margin and Padding Shorthands",
      content: "Both margin and padding have four sides. The shorthand follows the **clock**: top, right, bottom, left (TRouBLe).\n\n- 1 value: `10px` → all sides\n- 2 values: `10px 20px` → top/bottom 10, left/right 20\n- 3 values: `10px 20px 30px` → top 10, left/right 20, bottom 30\n- 4 values: `10px 20px 30px 40px` → top, right, bottom, left\n\nOr target one side: `margin-top`, `padding-left`, etc. Modern logical properties like `margin-inline` (left+right) and `padding-block` (top+bottom) also respect writing direction.",
      syntax: `.card { padding: 16px 24px; }        /* v h */
.title { margin: 0 0 12px; }          /* top 0, sides 0, bottom 12 */
.center { margin: 0 auto; width: 600px; } /* horizontally centered */`,
      tip: "Remember TRouBLe: Top, Right, Bottom, Left.",
    },
    {
      heading: "Borders",
      content: "`border` shorthand = width style color, e.g. `2px solid #333`.\n\nStyles: solid, dashed, dotted, double, groove, ridge, inset, outset, none, hidden.\n\nYou can set each side (`border-bottom: 3px solid red`) or each sub-property (`border-width`, `border-style`, `border-color`), which also accept 1-4 values.",
      syntax: `.box   { border: 2px dashed #0ea5e9; }
.tab   { border-bottom: 3px solid #f97316; }
.mixed { border-width: 4px 1px; border-style: solid dotted; }`,
    },
    {
      heading: "border-radius",
      content: "`border-radius` rounds the corners. It takes 1-4 values starting at top-left and going clockwise.\n\n- `8px` - softly rounded card\n- `50%` on a square - perfect **circle** (avatars)\n- `999px` on a wide box - **pill** shape (tags, buttons)\n- `20px 0` - alternate corners\n- Elliptical corners with a slash: `50px / 20px`\n\nBackground and border both follow the rounded shape. Content that overflows the corner is clipped only with overflow: hidden.",
      syntax: `.card   { border-radius: 12px; }
.avatar { width: 80px; height: 80px; border-radius: 50%; }
.pill   { border-radius: 999px; }`,
    },
    {
      heading: "Outline",
      content: "`outline` looks like a border but:\n- It is drawn **outside** the border and does **not take up space** (no layout shift)\n- It cannot be set per side\n- `outline-offset` moves it away from the element\n\nBrowsers use outline to show **keyboard focus** on links, buttons and inputs. Removing it (`outline: none`) without providing an alternative makes your site unusable for keyboard users.",
      syntax: `button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }`,
      tip: "Never write *:focus { outline: none; } without a replacement focus style. It is one of the most common accessibility failures.",
    },
    {
      heading: "Margin Collapsing",
      content: "When **vertical** margins of block elements touch, they **collapse** into one margin equal to the **larger** of the two (not the sum).\n\nThree common cases:\n1. **Adjacent siblings**: h2 margin-bottom 30px + p margin-top 20px = gap of 30px, not 50px\n2. **Parent and first/last child**: a child's top margin can 'leak' out of a parent that has no padding/border, pushing the parent down\n3. **Empty blocks**: an empty element's own top and bottom margins collapse together\n\nMargins do NOT collapse when:\n- They are horizontal\n- The parent has padding or border between them\n- The parent is a flex or grid container, or has overflow other than visible, or is display: flow-root\n- Elements are floated or absolutely positioned",
      tip: "A simple team rule avoids surprises: only use margin-bottom (or only margin-top) for vertical spacing between elements.",
    },
  ],
  examples: [
    {
      title: "Shorthand Patterns Side by Side",
      scenario: "See exactly which side each shorthand value targets.",
      steps: [
        "Create four boxes with padding written using 1, 2, 3 and 4 values",
        "Give the inner content a different color so padding is visible",
        "Click Run",
      ],
      code: `.p1 { padding: 20px; }
.p2 { padding: 10px 40px; }
.p3 { padding: 5px 20px 40px; }
.p4 { padding: 5px 10px 30px 50px; }`,
      playground: {
        html: `<div class="box p1"><span>20px</span></div>
<div class="box p2"><span>10px 40px</span></div>
<div class="box p3"><span>5px 20px 40px</span></div>
<div class="box p4"><span>5px 10px 30px 50px</span></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.box { background: #fdba74; margin-bottom: 12px; display: inline-block; vertical-align: top; margin-right: 12px; }
.box span { display: block; background: #fff7ed; padding: 4px; }
.p1 { padding: 20px; }
.p2 { padding: 10px 40px; }
.p3 { padding: 5px 20px 40px; }
.p4 { padding: 5px 10px 30px 50px; }`,
      },
      result: "Four orange boxes where the orange padding area changes per side exactly as described by each shorthand.",
      explanation: "Values go clockwise from the top. Missing values copy their opposite side (left copies right, bottom copies top).",
    },
    {
      title: "Borders and border-radius Shapes",
      scenario: "Build a card, a circular avatar, a pill tag and a tab underline.",
      steps: [
        "Create elements for each shape",
        "Apply border styles and border-radius values",
        "Click Run",
      ],
      code: `.card   { border: 1px solid #e2e8f0; border-radius: 12px; }
.avatar { border: 3px solid #22c55e; border-radius: 50%; }
.pill   { border: 2px dashed #6366f1; border-radius: 999px; }
.tab    { border-bottom: 3px solid #f97316; }`,
      playground: {
        html: `<div class="card">
  <img class="avatar" src="https://picsum.photos/id/64/120/120" alt="User avatar">
  <h3>Asha Verma</h3>
  <span class="pill">Designer</span>
  <p><a class="tab" href="#">Profile</a> <a href="#" class="tab off">Posts</a></p>
  <div class="double">border: 4px double</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f8fafc; }
.card { background: white; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; width: 260px; text-align: center; }
.avatar { width: 90px; height: 90px; border: 3px solid #22c55e; border-radius: 50%; }
.pill { display: inline-block; padding: 4px 14px; border: 2px dashed #6366f1; border-radius: 999px; color: #4338ca; }
.tab { color: #111; text-decoration: none; padding-bottom: 4px; border-bottom: 3px solid #f97316; margin: 0 8px; }
.tab.off { border-bottom-color: transparent; color: #64748b; }
.double { border: 4px double #0f172a; padding: 8px; border-radius: 0 16px; }`,
      },
      result: "A rounded white card with a circular green-ringed avatar, a dashed pill tag, an orange-underlined active tab and a double-bordered box with alternate rounded corners.",
      explanation: "border-radius: 50% on a square turns it into a circle; 999px gives fully rounded ends; a single-side border creates underlines; two radius values apply to alternating corners.",
    },
    {
      title: "Outline for Focus (No Layout Shift)",
      scenario: "Compare a hover border that shifts layout with an outline that doesn't, and add an accessible focus ring.",
      steps: [
        "Create two rows of buttons",
        "Row 1: add a 4px border on hover; Row 2: add a 4px outline on hover",
        "Press Tab to move focus and see the focus-visible outline",
        "Click Run",
      ],
      code: `.b-border:hover  { border: 4px solid #ef4444; }
.b-outline:hover { outline: 4px solid #ef4444; }
button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }`,
      playground: {
        html: `<p>Hover - border (neighbours jump):</p>
<button class="b-border">One</button><button class="b-border">Two</button><button class="b-border">Three</button>
<p>Hover - outline (nothing moves):</p>
<button class="b-outline">One</button><button class="b-outline">Two</button><button class="b-outline">Three</button>
<p>Press Tab to see the focus ring.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
button { padding: 10px 18px; margin-right: 6px; border: 0; background: #e2e8f0; border-radius: 6px; font-size: 16px; }
.b-border:hover  { border: 4px solid #ef4444; }
.b-outline:hover { outline: 4px solid #ef4444; }
button:focus-visible { outline: 3px solid #f59e0b; outline-offset: 3px; }`,
      },
      result: "Hovering a button in row 1 makes it grow and pushes its neighbours. In row 2 a red ring appears with no movement. Tabbing shows an amber focus ring with a gap.",
      explanation: "Borders are part of the box size; outlines are painted outside without affecting layout. outline-offset adds space between element and outline.",
    },
    {
      title: "Margin Collapsing in Action (and the Fix)",
      scenario: "Two paragraphs with margin 30px and 20px: is the gap 50px or 30px? Also see a child's margin leak out of its parent.",
      steps: [
        "Create two siblings with margin-bottom 30px and margin-top 20px",
        "Create a parent containing a child with margin-top 40px",
        "Create a second parent with display: flow-root (or padding) to stop collapse",
        "Click Run and compare",
      ],
      code: `.first  { margin-bottom: 30px; }
.second { margin-top: 20px; }      /* gap = 30px, not 50px */

.parent  { background: #ddd; }
.child   { margin-top: 40px; }     /* leaks out of parent */
.fixed   { display: flow-root; }   /* contains the margin */`,
      playground: {
        html: `<div class="first">margin-bottom: 30px</div>
<div class="second">margin-top: 20px → gap is only 30px</div>
<hr>
<div class="parent"><div class="child">Child margin-top 40px leaks out (grey parent has no top gap)</div></div>
<div class="parent fixed"><div class="child">flow-root parent keeps the 40px inside</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.first, .second { background: #c7d2fe; padding: 8px; }
.first  { margin-bottom: 30px; }
.second { margin-top: 20px; }
.parent { background: #d1d5db; margin-top: 20px; }
.child  { margin-top: 40px; background: #fde68a; padding: 8px; }
.fixed  { display: flow-root; }`,
      },
      result: "The gap between the two blue blocks is 30px. In the first grey parent the yellow child sits at the top edge with the space appearing ABOVE the grey box. In the second, grey space appears inside the parent above the child.",
      explanation: "Adjacent vertical margins collapse to the larger value. A child's margin collapses through a parent with no padding/border; display: flow-root creates a new block formatting context that prevents it.",
    },
  ],
  interview: [
    { q: "Explain margin: 10px 20px 30px.", a: "Top 10px, left and right 20px, bottom 30px.", level: "Easy" },
    { q: "What is margin collapsing?", a: "When vertical margins of adjacent block elements (or a parent and its first/last child) touch, they combine into a single margin equal to the largest one instead of adding up.", level: "Medium" },
    { q: "How can you prevent margin collapsing between a parent and child?", a: "Add padding or a border to the parent, or make it a new block formatting context: display: flow-root, overflow: auto/hidden, or make it a flex/grid container.", level: "Hard" },
    { q: "Do horizontal margins collapse?", a: "No, only vertical (block-direction) margins collapse.", level: "Medium" },
    { q: "What is the difference between border and outline?", a: "Border is part of the box model and affects size/layout; it can be styled per side and follows border-radius. Outline is drawn outside the border, takes no space, cannot be per-side and is used mainly for focus indicators.", level: "Medium" },
    { q: "Why is outline: none dangerous?", a: "It removes the visible keyboard focus indicator, making the site inaccessible for keyboard users, unless a replacement focus style is provided (e.g. :focus-visible).", level: "Medium" },
    { q: "How do you make a circle with CSS?", a: "Give an element equal width and height and border-radius: 50%.", level: "Easy" },
    { q: "How do you center a block element horizontally with margin?", a: "Give it a width (or max-width) and margin: 0 auto (or margin-inline: auto).", level: "Easy" },
    { q: "What happens to margin: auto vertically in normal block flow?", a: "Vertical auto margins resolve to 0 in normal flow, so it doesn't vertically center (it does inside flex/grid containers).", level: "Hard" },
    { q: "What does 'border: 2px solid' use for color if no color is given?", a: "currentColor, the element's text color.", level: "Medium" },
  ],
  practice: [
    {
      task: "Give a section padding 40px top/bottom and 20px left/right using one shorthand declaration, and a 60px bottom margin.",
      hint: "Two-value padding.",
      solution: `section { padding: 40px 20px; margin-bottom: 60px; }`,
    },
    {
      task: "Create a circular 100px avatar with a 4px white border and an outer 2px blue outline offset by 2px.",
      hint: "border-radius: 50%; outline + outline-offset.",
      solution: `<img class="av" src="https://picsum.photos/100" alt="Avatar">
<style>
.av { width: 100px; height: 100px; border-radius: 50%; border: 4px solid white; outline: 2px solid #2563eb; outline-offset: 2px; }
</style>`,
    },
    {
      task: "Build a speech-bubble shape using border-radius with three rounded corners and one sharp corner (bottom-left).",
      hint: "border-radius: top-left top-right bottom-right bottom-left.",
      solution: `<div class="bubble">Hello!</div>
<style>
.bubble { display: inline-block; background: #22c55e; color: white; padding: 12px 18px; border-radius: 18px 18px 18px 0; }
</style>`,
    },
    {
      task: "Demonstrate that margin collapse disappears when you add 1px padding to the parent. Write two identical parents, one with padding-top: 1px.",
      hint: "Child has margin-top: 30px.",
      solution: `<div class="p"><div class="c">Collapses</div></div>
<div class="p pad"><div class="c">Contained</div></div>
<style>
.p { background: #eee; margin-bottom: 20px; }
.pad { padding-top: 1px; }
.c { margin-top: 30px; background: orange; }
</style>`,
    },
    {
      task: "Style text inputs with a 1px grey border, 8px radius and a visible 3px purple outline only for keyboard focus.",
      hint: "Use :focus-visible.",
      solution: `<input type="text" placeholder="Name">
<style>
input { border: 1px solid #9ca3af; border-radius: 8px; padding: 8px 12px; }
input:focus-visible { outline: 3px solid #7c3aed; outline-offset: 2px; }
</style>`,
    },
  ],
  quiz: [
    { question: "padding: 5px 10px 15px 20px - what is padding-left?", options: ["5px", "10px", "15px", "20px"], answer: 3, explanation: "Order: top, right, bottom, left." },
    { question: "Two siblings: margin-bottom 40px and margin-top 25px. Gap?", options: ["65px", "40px", "25px", "15px"], answer: 1, explanation: "Collapsed margin = the larger value." },
    { question: "Which property never affects layout size?", options: ["outline", "border", "padding", "margin"], answer: 0, explanation: "Outline is drawn outside without taking space." },
    { question: "What border-radius turns a square into a circle?", options: ["100px", "1em", "50%", "circle"], answer: 2, explanation: "50% of each side creates a circle." },
    { question: "Which stops parent-child margin collapse?", options: ["color: red", "display: flow-root", "font-size: 0", "margin: 0 auto"], answer: 1, explanation: "flow-root creates a new block formatting context." },
  ],
};
