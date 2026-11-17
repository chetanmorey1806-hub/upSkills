export default {
  id: "day-07-box-model",
  title: "The CSS Box Model: Content, Padding, Border and Margin",
  module: "Module 2: Box Model & Positioning",
  day: 7,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Every element on a web page is a rectangular box. Learn the four layers of the box model, how the browser calculates an element's total size, and how to inspect boxes in DevTools.",
  objectives: [
    "Name and describe the four areas of the box model",
    "Calculate the total rendered width and height of an element",
    "Use DevTools to inspect content, padding, border and margin",
    "Understand how padding and margin differ in behavior and purpose",
  ],
  theory: [
    {
      heading: "Everything Is a Box",
      content: "The browser draws every element (headings, paragraphs, images, even inline words) as a rectangular box. The **box model** describes the layers of that box, from inside to outside:\n\n1. **Content** - the text or image itself (sized by width/height)\n2. **Padding** - transparent space between content and border; it shows the element's background\n3. **Border** - a line around the padding\n4. **Margin** - transparent space outside the border that pushes other elements away; it never shows the background\n\nAnalogy: a framed photo on a wall. The photo is the content, the white mat around it is padding, the wooden frame is the border, and the empty wall space between frames is the margin.",
    },
    {
      heading: "Content Area",
      content: "The content area holds the actual content. Its size is set by `width` and `height` (or determined by the content if they are auto).\n\nBy default (`box-sizing: content-box`), width and height apply to the **content area only**. Padding and border are added on top. We will switch this behavior with box-sizing on Day 9.",
      syntax: `.box { width: 200px; height: 100px; }`,
    },
    {
      heading: "Padding and Border",
      content: "**Padding** is the inner breathing room. It increases the clickable and colored area of an element. Padding can't be negative.\n\n**Border** sits outside padding. A border needs width, style and color; `border-style` is required or no border is drawn (default style is none).\n\nBoth take one to four values in clockwise order (top, right, bottom, left). Details on Day 8.",
      syntax: `.box {
  padding: 20px;
  border: 5px solid #1d4ed8;
}`,
    },
    {
      heading: "Margin",
      content: "**Margin** is outer space. It separates the element from its neighbours and is always transparent.\n\n- Margins can be **negative** to pull elements closer or overlap\n- `margin: 0 auto` centers a block that has a width\n- Vertical margins of adjacent blocks can **collapse** into one (Day 8)\n\nPadding vs margin: use padding for space **inside** the box (affects background), margin for space **between** boxes.",
      syntax: `.box { margin: 30px; }`,
    },
    {
      heading: "Calculating Total Size",
      content: "With the default content-box model:\n\n**Total width** = width + padding-left + padding-right + border-left + border-right\n**Space occupied** = total width + margin-left + margin-right\n\nExample: width 200px, padding 20px, border 5px, margin 30px\n- Visible box width = 200 + 20 + 20 + 5 + 5 = **250px**\n- Space taken in layout = 250 + 30 + 30 = **310px**",
      tip: "Common mistake: setting width: 100% and then adding padding. The element becomes wider than its parent and overflows. Day 9's box-sizing: border-box fixes this.",
    },
    {
      heading: "Inspecting the Box Model in DevTools",
      content: "Right-click any element → **Inspect**. In the Styles/Computed panel you will see a nested diagram: margin (orange), border (yellow), padding (green), content (blue). Hovering an element in the Elements panel highlights each layer on the page.\n\nThis is the fastest way to debug unexpected spacing: you can see whether gaps come from margin or padding.",
      points: [
        "Chrome/Edge: F12 → Elements → Computed",
        "Firefox: F12 → Inspector → Layout",
        "You can edit values directly in the diagram to experiment",
      ],
    },
  ],
  examples: [
    {
      title: "Visualizing the Four Layers",
      scenario: "Build a box where every layer is clearly visible.",
      steps: [
        "Create a wrapper with a striped background (to reveal margin) and a .box inside",
        "Give .box width, padding, a thick border and margin",
        "Click Run and identify each layer",
      ],
      code: `.box {
  width: 200px;
  padding: 20px;
  border: 8px solid #1d4ed8;
  margin: 30px;
  background: #bfdbfe;
}`,
      playground: {
        html: `<div class="wrapper">
  <div class="box"><div class="content">Content (200px wide)</div></div>
</div>
<p>Striped area = margin. Light blue around the yellow = padding. Dark blue = border.</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.wrapper { display: inline-block; background: repeating-linear-gradient(45deg, #fed7aa 0 8px, #ffedd5 8px 16px); }
.box { width: 200px; padding: 20px; border: 8px solid #1d4ed8; margin: 30px; background: #bfdbfe; }
.content { background: #fef08a; padding: 10px 0; text-align: center; }`,
      },
      result: "Orange stripes (margin) surround a dark blue border, inside which is light blue padding around a yellow content area.",
      explanation: "The background of .box paints the content and padding areas. The margin is transparent, so the wrapper's stripes show through it.",
    },
    {
      title: "Total Width Calculation",
      scenario: "Two boxes both have width: 200px, but one has padding and border. Measure the difference.",
      steps: [
        "Create .a with width 200px only",
        "Create .b with width 200px, padding 20px and border 5px",
        "Click Run; use a JS snippet to print each offsetWidth",
      ],
      code: `.a { width: 200px; }
.b { width: 200px; padding: 20px; border: 5px solid; }
/* .b renders 250px wide */`,
      playground: {
        html: `<div class="a">A: width 200px</div>
<div class="b">B: width 200px + padding 20 + border 5</div>
<p id="out"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
div { background: #a7f3d0; margin-bottom: 10px; }
.a { width: 200px; }
.b { width: 200px; padding: 20px; border: 5px solid #047857; }`,
        js: `const a = document.querySelector('.a').offsetWidth;
const b = document.querySelector('.b').offsetWidth;
document.getElementById('out').textContent = 'A = ' + a + 'px, B = ' + b + 'px';
console.log('A:', a, 'B:', b);`,
      },
      result: "Box B is visibly wider. The text and console show A = 200px, B = 250px.",
      explanation: "With content-box sizing, padding (20+20) and border (5+5) are added to the 200px width: 200 + 40 + 10 = 250.",
    },
    {
      title: "Padding vs Margin on Buttons",
      scenario: "Understand which space is clickable and colored.",
      steps: [
        "Create two button-like links",
        "Give the first large padding, the second large margin and little padding",
        "Click Run and hover over each",
      ],
      code: `.pad    { padding: 20px 40px; margin: 0; }
.margin { padding: 4px 8px; margin: 20px 40px; }`,
      playground: {
        html: `<a href="#" class="btn pad">Big padding</a>
<a href="#" class="btn margin">Big margin</a>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; background: #f1f5f9; }
.btn { display: inline-block; background: #7c3aed; color: white; text-decoration: none; border-radius: 6px; }
.btn:hover { background: #5b21b6; }
.pad    { padding: 20px 40px; margin: 0; }
.margin { padding: 4px 8px; margin: 20px 40px; }`,
      },
      result: "The first button is a large purple clickable area. The second is a small purple button surrounded by empty space that is not clickable and not colored.",
      explanation: "Padding is part of the element (background + clicks). Margin is outside space that only pushes neighbours away.",
    },
  ],
  interview: [
    { q: "What is the CSS box model?", a: "A model in which every element is a rectangular box made of content, padding, border and margin, from inside to outside. It determines an element's size and spacing.", level: "Easy" },
    { q: "What is the difference between padding and margin?", a: "Padding is space inside the border; it shows the element's background and is part of its clickable area. Margin is space outside the border; it is transparent and separates elements. Margins can be negative and can collapse; padding cannot.", level: "Easy" },
    { q: "Calculate the rendered width: width 300px, padding 10px, border 2px, margin 20px (content-box).", a: "Visible width = 300 + 10×2 + 2×2 = 324px. Total space including margin = 324 + 40 = 364px.", level: "Medium" },
    { q: "Does the background color extend under padding? Under margin?", a: "It covers content, padding and (by default) the area under the border; it never covers margin.", level: "Easy" },
    { q: "Can padding be negative? Can margin be negative?", a: "Padding cannot be negative. Margin can be negative.", level: "Medium" },
    { q: "Why might width: 100% plus padding overflow its parent?", a: "With content-box, padding and border are added to the 100% width, so the total is wider than the parent.", level: "Medium" },
    { q: "Why doesn't my border show when I set border-width and border-color?", a: "border-style defaults to none. A style such as solid is required.", level: "Medium" },
    { q: "How do inline elements (like span) behave with the box model?", a: "Horizontal padding, border and margin push neighbours; vertical padding and border are drawn but don't affect line height/layout, and vertical margins are ignored. Width and height don't apply.", level: "Hard" },
    { q: "How can you see the box model of an element in the browser?", a: "Open DevTools, inspect the element, and view the box model diagram in the Computed (Chrome) or Layout (Firefox) panel.", level: "Easy" },
  ],
  practice: [
    {
      task: "Create a 250px wide card with 16px padding, a 2px solid grey border and 24px margin. Calculate its rendered width.",
      hint: "Rendered = width + 2×padding + 2×border.",
      solution: `<div class="card">Card</div>
<style>.card { width: 250px; padding: 16px; border: 2px solid grey; margin: 24px; }</style>
<!-- Rendered width = 250 + 32 + 4 = 286px; space incl. margin = 334px -->`,
    },
    {
      task: "Make a box whose border is 10px wide, padding is a different color than content. (Hint: use an inner div for content.)",
      hint: "The outer box background shows in padding; give the inner div another color.",
      solution: `<div class="outer"><div class="inner">Content</div></div>
<style>
.outer { padding: 20px; border: 10px solid black; background: lightgreen; width: 200px; }
.inner { background: khaki; }
</style>`,
    },
    {
      task: "Place three boxes vertically with 20px of space between them using margin, and 15px of inner space using padding.",
      hint: "margin-bottom: 20px; padding: 15px.",
      solution: `<div class="b">One</div><div class="b">Two</div><div class="b">Three</div>
<style>.b { padding: 15px; margin-bottom: 20px; background: #e0e7ff; }</style>`,
    },
    {
      task: "Use JavaScript to log the offsetWidth of an element with width 120px, padding 10px, border 3px and verify it equals 146.",
      hint: "offsetWidth includes padding and border.",
      solution: `<div id="x" style="width:120px;padding:10px;border:3px solid">X</div>
<script>console.log(document.getElementById('x').offsetWidth); // 146</script>`,
    },
  ],
  quiz: [
    { question: "What is the correct order of the box model from inside out?", options: ["Content, margin, border, padding", "Padding, content, border, margin", "Content, padding, border, margin", "Margin, border, padding, content"], answer: 2, explanation: "Content → padding → border → margin." },
    { question: "Which area is always transparent?", options: ["Margin", "Padding", "Content", "Border"], answer: 0, explanation: "Margin never shows the element's background." },
    { question: "width 100px, padding 10px, border 1px (content-box). Rendered width?", options: ["100px", "111px", "120px", "122px"], answer: 3, explanation: "100 + 20 + 2 = 122px." },
    { question: "Which can be negative?", options: ["padding", "margin", "border-width", "width"], answer: 1, explanation: "Only margin accepts negative values here." },
    { question: "Which tool lets you see an element's box model?", options: ["View Source", "Browser history", "Bookmarks", "DevTools Computed/Layout panel"], answer: 3, explanation: "DevTools shows the box model diagram." },
  ],
};
