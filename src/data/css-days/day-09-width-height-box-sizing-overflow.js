export default {
  id: "day-09-width-height-box-sizing-overflow",
  title: "Width, Height, min/max Sizes, box-sizing and Overflow",
  module: "Module 2: Box Model & Positioning",
  day: 9,
  level: "Beginner",
  duration: "1.5 hours",
  summary: "Control element dimensions with width, height, min-width, max-width, min-height and max-height, switch to the intuitive border-box sizing model, and decide what happens when content is too big for its box.",
  objectives: [
    "Set fixed and flexible sizes with width and height",
    "Use min-* and max-* to build responsive, safe dimensions",
    "Apply box-sizing: border-box and explain why it is the industry default",
    "Handle overflowing content with overflow, overflow-x/y and text-overflow",
  ],
  theory: [
    {
      heading: "width and height",
      content: "`width` and `height` set the size of the box (the content box by default).\n\n- Default is `auto`: a block element stretches to fill its parent's width, and its height grows to fit its content\n- Accepts px, %, rem, vw, vh and keywords like `fit-content`, `min-content`, `max-content`\n- They do NOT apply to normal inline elements like <span> or <a> (Day 10)\n\nAvoid fixing heights on text containers: if content grows (translation, bigger font), it will overflow.",
      syntax: `.sidebar { width: 280px; }
.banner  { height: 200px; }
.tag     { width: fit-content; }`,
      tip: "Prefer letting height be auto and controlling space with padding. Fixed heights are the #1 cause of text spilling out of boxes.",
    },
    {
      heading: "min-width, max-width, min-height, max-height",
      content: "These set limits instead of exact sizes:\n\n- `max-width: 1200px` - grow with the screen but never wider than 1200px (perfect for page containers)\n- `min-width: 120px` - never smaller (buttons)\n- `min-height: 300px` - at least 300px tall but can grow with content (hero sections, cards)\n- `max-height: 200px` - cap height; combine with overflow for scroll areas\n\nPriority: min-width beats max-width, which beats width, when they conflict.",
      syntax: `.container { width: 90%; max-width: 1100px; margin: 0 auto; }
img { max-width: 100%; height: auto; }   /* responsive images */
.card { min-height: 250px; }`,
    },
    {
      heading: "box-sizing: content-box vs border-box",
      content: "**content-box** (default): width = content only. Padding and border are added outside, so a 300px box with 20px padding and 2px border is actually 344px wide.\n\n**border-box**: width = content + padding + border. A 300px box stays 300px; the content area shrinks to make room. This matches how humans think ('this card is 300px wide').\n\nAlmost every modern project starts with this reset:",
      syntax: `*, *::before, *::after {
  box-sizing: border-box;
}`,
      tip: "With border-box, width: 100% plus padding no longer overflows the parent. This single line prevents countless layout bugs.",
    },
    {
      heading: "overflow",
      content: "When content is bigger than its box, `overflow` decides what happens:\n- `visible` (default) - content spills out and may overlap other elements\n- `hidden` - extra content is clipped (cut off)\n- `scroll` - always shows scrollbars\n- `auto` - shows scrollbars only when needed (usually the best choice)\n- `clip` - like hidden but forbids programmatic scrolling\n\n`overflow-x` and `overflow-y` control each direction separately, e.g. a horizontally scrolling table wrapper.",
      syntax: `.chat  { height: 300px; overflow-y: auto; }
.table-wrap { overflow-x: auto; }`,
    },
    {
      heading: "Truncating Text with Ellipsis",
      content: "To show 'Very long product na...' on one line you need **three** properties together:\n\n1. `white-space: nowrap` - keep text on one line\n2. `overflow: hidden` - hide what doesn't fit\n3. `text-overflow: ellipsis` - draw the '...'\n\nThe element also needs a constrained width (explicit or from its parent).\n\nComing next: the display property (Day 10).",
      syntax: `.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}`,
    },
  ],
  examples: [
    {
      title: "content-box vs border-box",
      scenario: "Two boxes both declare width: 300px with padding 20px and border 5px. Which one is really 300px?",
      steps: [
        "Create a 300px ruler bar to compare against",
        "Create .content with box-sizing: content-box and .border with border-box",
        "Click Run and compare widths",
      ],
      code: `.box { width: 300px; padding: 20px; border: 5px solid; }
.content { box-sizing: content-box; } /* 350px wide */
.border  { box-sizing: border-box; }  /* 300px wide */`,
      playground: {
        html: `<div class="ruler">300px ruler</div>
<div class="box content">content-box</div>
<div class="box border">border-box</div>
<p id="out"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.ruler { width: 300px; background: #111; color: white; font-size: 12px; padding: 2px 0; box-sizing: border-box; text-align: center; }
.box { width: 300px; padding: 20px; border: 5px solid #be123c; margin-top: 10px; background: #ffe4e6; }
.content { box-sizing: content-box; }
.border  { box-sizing: border-box; }`,
        js: `document.getElementById('out').textContent =
  'content-box: ' + document.querySelector('.content').offsetWidth + 'px | border-box: ' + document.querySelector('.border').offsetWidth + 'px';`,
      },
      result: "The content-box box sticks out past the ruler (350px). The border-box box lines up exactly with the 300px ruler. Text below confirms 350px vs 300px.",
      explanation: "border-box includes padding and border inside the declared width, shrinking the content area instead of growing the box.",
    },
    {
      title: "Responsive Container with max-width",
      scenario: "Build a page container that is fluid on phones but stops growing on big screens, plus a responsive image.",
      steps: [
        "Create a .container with width: 90% and max-width: 600px",
        "Add an image with max-width: 100% and height: auto",
        "Click Run and resize the preview",
      ],
      code: `.container { width: 90%; max-width: 600px; margin: 0 auto; }
img { max-width: 100%; height: auto; display: block; }`,
      playground: {
        html: `<div class="container">
  <h2>Fluid but capped</h2>
  <img src="https://picsum.photos/id/1043/1200/600" alt="Forest landscape">
  <p>Resize the preview: on narrow screens the container is 90% wide; on wide screens it stops at 600px and stays centered. The large image never overflows.</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; margin: 0; background: #e2e8f0; }
.container { width: 90%; max-width: 600px; margin: 0 auto; background: white; padding: 16px; box-sizing: border-box; }
img { max-width: 100%; height: auto; display: block; border-radius: 8px; }`,
      },
      result: "A white centered column that shrinks with the window but never exceeds 600px, with a 1200px-wide image scaled down to fit.",
      explanation: "width: 90% makes it fluid; max-width caps it. max-width: 100% on images prevents them from being wider than their container; height: auto keeps the aspect ratio.",
    },
    {
      title: "Overflow Values Compared",
      scenario: "Put the same long text into four fixed-height boxes with different overflow values.",
      steps: [
        "Create four 100px-tall boxes with long text",
        "Set overflow to visible, hidden, scroll and auto",
        "Click Run",
      ],
      code: `.visible { overflow: visible; }
.hidden  { overflow: hidden; }
.scroll  { overflow: scroll; }
.auto    { overflow: auto; }`,
      playground: {
        html: `<div class="grid">
  <div class="box visible"><b>visible</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.</div>
  <div class="box hidden"><b>hidden</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.</div>
  <div class="box scroll"><b>scroll</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.</div>
  <div class="box auto"><b>auto</b> Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer nec odio. Praesent libero. Sed cursus ante dapibus diam. Sed nisi.</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 24px 16px; }
.box { height: 100px; border: 2px solid #0369a1; background: #e0f2fe; padding: 6px; font-size: 14px; }
.visible { overflow: visible; }
.hidden  { overflow: hidden; }
.scroll  { overflow: scroll; }
.auto    { overflow: auto; }`,
      },
      result: "'visible' text spills below its border; 'hidden' is cut off; 'scroll' always shows scrollbars; 'auto' shows a scrollbar only because the text is too long.",
      explanation: "overflow controls how content larger than the box is handled. auto is usually best for scrollable panels.",
    },
    {
      title: "Single-Line Ellipsis and min-width Button",
      scenario: "Product titles must stay on one line with '...', and buttons must never shrink below a usable width.",
      steps: [
        "Create a 220px product card with a long title",
        "Apply white-space: nowrap, overflow: hidden, text-overflow: ellipsis",
        "Give the button min-width: 140px",
        "Click Run",
      ],
      code: `.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.btn { min-width: 140px; }`,
      playground: {
        html: `<div class="card">
  <h3 class="title">Ultra Comfortable Ergonomic Wireless Keyboard with Backlight</h3>
  <p>$59.00</p>
  <button class="btn">Buy</button>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.card { width: 220px; border: 1px solid #d1d5db; border-radius: 10px; padding: 14px; box-sizing: border-box; }
.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin: 0 0 6px; }
.btn { min-width: 140px; padding: 8px; background: #16a34a; color: white; border: none; border-radius: 6px; }`,
      },
      result: "The title shows 'Ultra Comfortable Ergono...' on one line; the short 'Buy' button is still 140px wide.",
      explanation: "The three-property combo truncates text. min-width enforces a minimum size even when content is small.",
    },
  ],
  interview: [
    { q: "What is the difference between content-box and border-box?", a: "In content-box (default), width/height set only the content size; padding and border are added outside. In border-box, width/height include padding and border, so the box stays the declared size.", level: "Easy" },
    { q: "Why do developers use * { box-sizing: border-box; }?", a: "It makes sizing predictable: declared widths equal rendered widths, and width: 100% with padding doesn't overflow.", level: "Easy" },
    { q: "How do you make an image responsive?", a: "img { max-width: 100%; height: auto; } so it scales down with its container while keeping aspect ratio.", level: "Easy" },
    { q: "What is the difference between overflow hidden, scroll and auto?", a: "hidden clips extra content, scroll always shows scrollbars, auto shows scrollbars only when content overflows.", level: "Easy" },
    { q: "What three properties create a single-line ellipsis?", a: "white-space: nowrap; overflow: hidden; text-overflow: ellipsis; on an element with constrained width.", level: "Medium" },
    { q: "If width: 500px, max-width: 300px and min-width: 400px are all set, what is the width?", a: "400px. min-width overrides max-width, which overrides width.", level: "Hard" },
    { q: "Why prefer min-height over height for sections?", a: "min-height guarantees a minimum while allowing the box to grow if content is larger, preventing overflow.", level: "Medium" },
    { q: "Why might height: 100% have no effect?", a: "Percentage heights need a parent with a definite height; if the parent's height is auto, the percentage resolves to auto.", level: "Medium" },
    { q: "What is the side effect of overflow: hidden on a parent?", a: "It clips children (including shadows/dropdowns) and creates a new block formatting context, which contains floats and stops margin collapse.", level: "Hard" },
    { q: "What does width: fit-content do?", a: "Sizes the element to its content, but no bigger than the available space.", level: "Medium" },
  ],
  practice: [
    {
      task: "Add the global border-box reset and build a 100%-wide input with 12px padding that does not overflow a 300px form.",
      hint: "*, *::before, *::after { box-sizing: border-box; }",
      solution: `<form style="width:300px;border:1px solid #ccc;padding:10px">
  <input type="text" placeholder="Email">
</form>
<style>
*, *::before, *::after { box-sizing: border-box; }
input { width: 100%; padding: 12px; }
</style>`,
    },
    {
      task: "Create a centered article container that is 100% wide on phones, max 720px on desktop, with 16px side padding.",
      hint: "max-width + margin: 0 auto.",
      solution: `.article { max-width: 720px; margin: 0 auto; padding: 0 16px; }`,
    },
    {
      task: "Build a 250px-tall chat box that scrolls vertically when messages overflow, but never horizontally.",
      hint: "overflow-y: auto; overflow-x: hidden.",
      solution: `<div class="chat">
  <p>Hi!</p><p>Hello</p><p>How are you?</p><p>Fine.</p><p>Great!</p><p>See you</p><p>Bye</p><p>...</p>
</div>
<style>
.chat { height: 250px; overflow-y: auto; overflow-x: hidden; border: 1px solid #ccc; padding: 8px; width: 260px; }
</style>`,
    },
    {
      task: "Make a list of email subjects that truncate with an ellipsis inside a 280px column.",
      hint: "Apply the ellipsis trio to each <li>.",
      solution: `<ul class="inbox">
  <li>Your monthly statement for October is now available online</li>
  <li>Meeting rescheduled to Thursday afternoon because of the holiday</li>
</ul>
<style>
.inbox { width: 280px; padding: 0; list-style: none; }
.inbox li { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 8px; border-bottom: 1px solid #eee; }
</style>`,
    },
  ],
  quiz: [
    { question: "With box-sizing: border-box, width 200px and padding 20px, the rendered width is:", options: ["240px", "220px", "200px", "160px"], answer: 2, explanation: "border-box keeps the declared width." },
    { question: "Which overflow value shows scrollbars only when needed?", options: ["auto", "scroll", "visible", "hidden"], answer: 0, explanation: "auto adds scrollbars only on overflow." },
    { question: "Which declaration makes images shrink to fit their container?", options: ["width: auto", "min-width: 100%", "height: 100%", "max-width: 100%"], answer: 3, explanation: "max-width: 100% caps the image at container width." },
    { question: "What is the default value of overflow?", options: ["hidden", "visible", "auto", "scroll"], answer: 1, explanation: "Content spills out by default." },
    { question: "Which is NOT required for a text ellipsis?", options: ["white-space: nowrap", "overflow: hidden", "text-overflow: ellipsis", "position: absolute"], answer: 3, explanation: "Positioning is unrelated." },
  ],
};
