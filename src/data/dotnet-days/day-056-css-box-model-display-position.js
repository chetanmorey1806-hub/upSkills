const boxHtml = `<div class="box content-box">content-box</div>
<div class="box border-box">border-box</div>`;

const boxCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.box {
  width: 200px;
  padding: 20px;
  border: 5px solid #2563eb;
  margin: 10px 0;
  background: #dbeafe;
}
.content-box { box-sizing: content-box; }  /* default */
.border-box  { box-sizing: border-box; }`;

const boxJs = `document.querySelectorAll('.box').forEach(function (el) {
  console.log(el.textContent + ': offsetWidth = ' + el.offsetWidth + 'px');
});`;

const displayHtml = `<p>Inline: <span class="inl">span one</span> <span class="inl">span two</span> (width ignored)</p>
<p>Inline-block: <span class="ib">box A</span> <span class="ib">box B</span> (width works, stays in line)</p>
<div class="blk">Block: div takes the full width</div>
<div class="blk">Block: starts on a new line</div>
<span class="as-block">A span turned into a block</span>
<p>Hidden with display:none -> [<span class="gone">I take no space</span>]</p>
<p>Hidden with visibility:hidden -> [<span class="invisible">I still take space</span>]</p>`;

const displayCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.inl { background: #fde68a; width: 300px; padding: 4px; }      /* width has no effect on inline */
.ib  { display: inline-block; width: 100px; height: 40px; background: #bbf7d0; text-align: center; line-height: 40px; }
.blk { background: #bfdbfe; margin: 4px 0; padding: 6px; }
.as-block { display: block; background: #fbcfe8; padding: 6px; }
.gone { display: none; }
.invisible { visibility: hidden; }`;

const displayJs = `console.log('span display: ' + getComputedStyle(document.querySelector('.inl')).display);
console.log('div display: ' + getComputedStyle(document.querySelector('.blk')).display);
console.log('.gone offsetWidth: ' + document.querySelector('.gone').offsetWidth);
console.log('.invisible offsetWidth > 0: ' + (document.querySelector('.invisible').offsetWidth > 0));`;

const positionHtml = `<div class="container">
  <div class="item static">static</div>
  <div class="item relative">relative (top 10, left 30)</div>
  <div class="item absolute">absolute</div>
  <div class="badge">3</div>
</div>
<div class="sticky">sticky: I stick to the top while you scroll</div>
<p class="filler">Scroll inside the preview. Scroll inside the preview. Scroll inside the preview.</p>
<p class="filler">More content to scroll...</p>
<p class="filler">More content to scroll...</p>
<button class="fab">+</button>`;

const positionCss = `body { font-family: "Segoe UI", Arial, sans-serif; margin: 0; padding: 10px; }
.container {
  position: relative;            /* becomes the reference for absolute children */
  height: 200px;
  border: 2px dashed #64748b;
  margin-bottom: 10px;
}
.item { width: 200px; padding: 8px; margin: 6px; background: #e0e7ff; }
.relative { position: relative; top: 10px; left: 30px; background: #fde68a; }
.absolute { position: absolute; right: 10px; bottom: 10px; background: #fecaca; }
.badge {
  position: absolute; top: -12px; right: -12px;
  width: 24px; height: 24px; border-radius: 50%;
  background: #dc2626; color: white; text-align: center; line-height: 24px; font-size: 12px;
}
.sticky { position: sticky; top: 0; background: #0f172a; color: white; padding: 8px; z-index: 5; }
.filler { height: 150px; background: #f1f5f9; margin: 8px 0; padding: 8px; }
.fab {
  position: fixed; right: 20px; bottom: 20px;      /* relative to the browser window */
  width: 50px; height: 50px; border-radius: 50%;
  border: none; background: #2563eb; color: white; font-size: 24px;
}`;

const floatHtml = `<div class="article">
  <img src="https://picsum.photos/id/0/160/120" alt="Laptop" class="left">
  <p>The image is floated left, so this paragraph text wraps around its right side. Float was originally made for exactly this: pictures inside text, like a magazine. Long text keeps flowing under the image once it passes the bottom edge of the picture.</p>
</div>
<div class="clearfix wrapper">
  <div class="col">Float left 1</div>
  <div class="col">Float left 2</div>
  <div class="col">Float left 3</div>
</div>
<p class="after">I come after the floated columns. The wrapper contains them because of the clearfix.</p>
<div class="scroll-box">overflow: auto shows a scrollbar only when needed. Line 1<br>Line 2<br>Line 3<br>Line 4<br>Line 5<br>Line 6</div>
<div class="hidden-box">overflow: hidden cuts off anything that does not fit inside this small box, so the rest of this sentence is invisible.</div>`;

const floatCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.left { float: left; margin: 0 12px 8px 0; border-radius: 6px; }
.article { overflow: auto; }   /* also contains the float */
.wrapper { background: #e2e8f0; padding: 6px; margin-top: 10px; }
.col { float: left; width: 30%; margin-right: 3%; background: #c7d2fe; padding: 10px; box-sizing: border-box; }
.clearfix::after { content: ""; display: block; clear: both; }
.after { background: #fef9c3; padding: 6px; }
.scroll-box { height: 80px; overflow: auto; border: 1px solid #94a3b8; padding: 6px; margin-bottom: 10px; }
.hidden-box { height: 40px; width: 220px; overflow: hidden; border: 1px solid #94a3b8; padding: 6px; }`;

const zHtml = `<div class="stage">
  <div class="card red">z-index: 1</div>
  <div class="card green">z-index: 3</div>
  <div class="card blue">z-index: 2</div>
</div>
<button id="open">Open modal</button>
<div class="overlay" id="overlay">
  <div class="modal">
    <h3>Modal dialog</h3>
    <p>The overlay has z-index 1000 so it covers everything.</p>
    <button id="close">Close</button>
  </div>
</div>`;

const zCss = `body { font-family: "Segoe UI", Arial, sans-serif; }
.stage { position: relative; height: 170px; }
.card { position: absolute; width: 140px; height: 90px; padding: 8px; color: white; font-weight: 600; border-radius: 8px; }
.red   { background: #dc2626; top: 0;    left: 0;    z-index: 1; }
.green { background: #16a34a; top: 30px; left: 60px;  z-index: 3; }
.blue  { background: #2563eb; top: 60px; left: 120px; z-index: 2; }
.overlay {
  display: none;                       /* hidden until opened */
  position: fixed; inset: 0;           /* top/right/bottom/left = 0 -> full screen */
  background: rgba(0, 0, 0, 0.6);
  z-index: 1000;
}
.overlay.show { display: block; }
.modal { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
         width: 260px; background: white; padding: 16px; border-radius: 10px; }`;

const zJs = `const overlay = document.getElementById('overlay');
document.getElementById('open').addEventListener('click', function () { overlay.classList.add('show'); });
document.getElementById('close').addEventListener('click', function () { overlay.classList.remove('show'); });
['red', 'green', 'blue'].forEach(function (c) {
  console.log(c + ' z-index = ' + getComputedStyle(document.querySelector('.' + c)).zIndex);
});`;

const layoutHtml = `<header class="site-header">
  <div class="logo">Skyline Academy</div>
  <nav>
    <a href="#">Home</a><a href="#">Courses</a><a href="#">Students</a><a href="#">Contact</a>
  </nav>
</header>
<div class="page clearfix">
  <aside class="sidebar">
    <h3>Modules</h3>
    <ul><li>C# Basics</li><li>OOPs</li><li>SQL Server</li><li>Frontend</li><li>ASP.NET Core</li></ul>
  </aside>
  <main class="content">
    <h2>Day 56: Box Model and Layout</h2>
    <p>This page is built with display, position, float and overflow only, the classic technique used before Flexbox and Grid.</p>
    <div class="notice">New batch starts Monday <span class="new">NEW</span></div>
  </main>
</div>
<footer class="site-footer">&copy; 2026 Skyline Academy</footer>`;

const layoutCss = `* { box-sizing: border-box; }
body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; color: #1f2937; }
.site-header { position: sticky; top: 0; z-index: 10; background: #1e3a8a; color: white; padding: 12px 20px; overflow: hidden; }
.logo { float: left; font-size: 20px; font-weight: 700; }
nav { float: right; }
nav a { display: inline-block; color: white; text-decoration: none; padding: 4px 10px; margin-left: 4px; border-radius: 4px; }
nav a:hover { background: rgba(255, 255, 255, 0.2); }
.page { max-width: 960px; margin: 20px auto; padding: 0 16px; }
.clearfix::after { content: ""; display: block; clear: both; }
.sidebar { float: left; width: 30%; background: #f1f5f9; padding: 16px; border-radius: 8px; }
.sidebar ul { padding-left: 18px; margin: 0; }
.content { float: right; width: 67%; }
.content h2 { margin-top: 0; }
.notice { position: relative; padding: 16px; border: 2px solid #f59e0b; border-radius: 8px; background: #fffbeb; }
.new { position: absolute; top: -10px; right: 10px; background: #dc2626; color: white; font-size: 11px; padding: 2px 8px; border-radius: 999px; }
.site-footer { clear: both; background: #0f172a; color: #cbd5e1; text-align: center; padding: 14px; }`;

export default {
  id: 'day-056-css-box-model-display-position',
  title: 'CSS Box Model, Display, Position, Float, Overflow and Z-index',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 56,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand how every element is a box (content, padding, border, margin), how box-sizing changes width maths, how display, position (static, relative, absolute, fixed, sticky), float, overflow and z-index control where boxes go, and build a classic header-sidebar-content-footer webpage layout.',
  objectives: [
    'Calculate the real width of an element with content-box and border-box',
    'Choose between block, inline, inline-block and none display values',
    'Use relative, absolute, fixed and sticky positioning with top/right/bottom/left',
    'Wrap text around images with float and fix float collapse with clear/clearfix',
    'Control overflowing content and stacking order with overflow and z-index',
  ],
  theory: [
    {
      heading: 'The CSS box model',
      content: "Every element is drawn as a rectangle with four layers, from inside to outside:\n1. **Content**: the text/image, sized by `width` and `height`.\n2. **Padding**: space around the content, inside the border.\n3. **Border**: the line around the padding.\n4. **Margin**: space outside the border, separating it from other boxes.\n\nWith the default `box-sizing: content-box`, `width` sets ONLY the content, so:\n**total width = width + padding-left + padding-right + border-left + border-right** (margin is extra space outside).\nExample: width 200 + padding 20+20 + border 5+5 = **250px**.\n\nWith `box-sizing: border-box`, `width` INCLUDES padding and border, so the box is exactly 200px and the content shrinks to 150px. Almost every project (and Bootstrap) starts with `*, *::before, *::after { box-sizing: border-box; }`.",
      syntax: '*, *::before, *::after { box-sizing: border-box; }',
      tip: 'Chrome F12 > Elements > Computed shows the box model diagram with exact numbers for each layer.',
    },
    {
      heading: 'display: block, inline, inline-block, none',
      content: "- **block** (`div`, `p`, `h1`-`h6`, `ul`, `section`, `form`): starts on a new line, takes the full available width, respects width/height/margin/padding.\n- **inline** (`span`, `a`, `strong`, `img`*, `label`): flows inside text, width and height are ignored, vertical margins do not push other lines.\n- **inline-block**: sits in the line like inline, but width/height/padding work like block. Good for buttons and nav links.\n- **none**: removes the element completely (takes no space; screen readers skip it).\n- `visibility: hidden`: invisible but still takes its space.\n- Also: `flex`, `grid` (Day 57), `inline-flex`, `table`.\n\n*`img` is an inline replaced element, so width/height do work on it.",
    },
    {
      heading: 'position: static, relative, absolute, fixed, sticky',
      content: "- **static** (default): normal flow; top/left are ignored.\n- **relative**: stays in the flow (its original space is kept), but is shifted visually by `top/right/bottom/left`. Most often used just to become the **containing block** for absolute children.\n- **absolute**: removed from the flow (others act as if it does not exist). Positioned relative to the nearest ancestor whose position is not static; if none, relative to the page. Used for badges, tooltips, dropdowns, overlays.\n- **fixed**: removed from the flow and positioned relative to the browser **viewport**; it does not move when scrolling (chat buttons, back-to-top, fixed navbars).\n- **sticky**: behaves like relative until scrolling reaches the given offset (e.g. `top: 0`), then sticks like fixed inside its parent (sticky headers, table headers).\n\n`inset: 0` is shorthand for top/right/bottom/left all 0.",
      syntax: '.card  { position: relative; }\n.badge { position: absolute; top: -8px; right: -8px; }\n.navbar { position: sticky; top: 0; }\n.chat-btn { position: fixed; right: 20px; bottom: 20px; }',
      tip: 'If an absolute element jumps to the page corner, you forgot position: relative on its parent.',
    },
    {
      heading: 'float and clear',
      content: "`float: left | right` pushes an element to one side and lets text and inline content wrap around it, originally for images inside articles. Floats are taken out of normal flow, so a parent that contains only floats **collapses to zero height**.\n\nFixes:\n- `clear: both` on the next element moves it below the floats.\n- **Clearfix** on the parent: `.clearfix::after { content: \"\"; display: block; clear: both; }`.\n- Or `overflow: auto` / `display: flow-root` on the parent.\n\nBefore Flexbox, whole page layouts (sidebars, columns, Bootstrap 3 grid) were built with floats. Today use Flexbox/Grid for layout and float only for wrapping text around images.",
    },
    {
      heading: 'overflow',
      content: "What happens when content is bigger than its box (fixed height/width):\n- `visible` (default): spills outside the box.\n- `hidden`: clipped; the extra part is invisible (also used to clip children to rounded corners).\n- `scroll`: always shows scrollbars.\n- `auto`: shows a scrollbar only when needed (best for tables and chat windows).\n- `overflow-x` / `overflow-y` control each direction separately, e.g. a wide table: `overflow-x: auto`.",
      syntax: '.table-wrapper { overflow-x: auto; }\n.chat-body { height: 300px; overflow-y: auto; }',
    },
    {
      heading: 'z-index and stacking',
      content: "When positioned elements overlap, `z-index` decides which is on top: **higher number = closer to the viewer**. It works only on positioned elements (relative, absolute, fixed, sticky) and on flex/grid items. Without z-index, later elements in the HTML are painted on top of earlier ones.\n\nA parent with position + z-index (or opacity < 1, transform...) creates a **stacking context**: its children can never appear above an element that is above the parent, no matter how big their z-index is.\n\nTypical scale: content 1, dropdown 100, sticky header 10-1000, modal overlay 1000+. Bootstrap uses 1000 (dropdown), 1020 (sticky), 1030 (fixed), 1050 (modal).",
      tip: 'z-index: 9999 not working? Check that the element is positioned and that its parent is not trapped in a lower stacking context.',
    },
  ],
  examples: [
    {
      title: 'content-box vs border-box width maths',
      scenario: 'Two boxes with the same CSS width: 200px, padding 20px and border 5px. Why are they different sizes?',
      steps: ['Create box.html with two divs', 'Give both the same width, padding and border', 'Set box-sizing content-box on the first and border-box on the second', 'Run and compare in F12 > Computed; read the console'],
      code: boxCss,
      playground: { html: boxHtml, css: boxCss, js: boxJs },
      result: 'The first box is visibly wider than the second.\nConsole:\ncontent-box: offsetWidth = 250px\nborder-box: offsetWidth = 200px',
      explanation: 'content-box: 200 + 20 + 20 + 5 + 5 = 250px. border-box: padding and border are taken from inside the 200px, so the content area becomes 200 - 40 - 10 = 150px. offsetWidth includes border and padding but not margin.',
    },
    {
      title: 'display values side by side',
      scenario: 'See why width does not work on a span, how inline-block fixes it, and the difference between display:none and visibility:hidden.',
      steps: ['Create display.html with spans, divs and hidden elements', 'Apply the CSS', 'Run, then read the console values'],
      code: displayCss,
      playground: { html: displayHtml, css: displayCss, js: displayJs },
      result: 'Yellow spans are only as wide as their text; green inline-blocks are 100x40 boxes in one line; blue divs fill the full width; the pink span acts as a block; the first [] is empty and tight, the second [] shows an empty gap.\nConsole:\nspan display: inline\ndiv display: block\n.gone offsetWidth: 0\n.invisible offsetWidth > 0: true',
      explanation: 'Inline elements ignore width/height. display:none removes the box entirely (0 size) while visibility:hidden keeps the space.',
    },
    {
      title: 'All five position values',
      scenario: 'A notification badge, an absolutely placed item, a sticky bar and a fixed floating action button in one page.',
      steps: ['Create position.html', 'Make .container position: relative so absolute children use it as reference', 'Add relative, absolute, sticky and fixed elements', 'Scroll inside the preview and watch the sticky bar and fixed button'],
      code: positionCss,
      playground: { html: positionHtml, css: positionCss, js: '' },
      result: 'The yellow relative box is shifted 10px down and 30px right while its original space stays empty; the red absolute box sits in the bottom-right corner of the dashed container; a red "3" badge sits on the container\'s top-right corner; the dark sticky bar sticks to the top while scrolling; the round blue + button stays in the window\'s bottom-right corner.',
      explanation: 'absolute uses the nearest positioned ancestor (.container). Negative top/right make the badge hang over the corner. fixed ignores all parents and uses the viewport.',
    },
    {
      title: 'float, clearfix and overflow',
      scenario: 'Wrap text around an image, make three floated columns and stop the parent from collapsing, and compare overflow auto and hidden.',
      steps: ['Create float.html', 'Float the image left with a right margin', 'Float three columns left and add the clearfix class to the wrapper', 'Remove the clearfix class and see the grey wrapper collapse', 'Add the overflow boxes'],
      code: floatCss,
      playground: { html: floatHtml, css: floatCss, js: '' },
      result: 'Paragraph text wraps around the right side of the image; three purple columns in one row inside a grey wrapper; the yellow paragraph appears below them; a box with a vertical scrollbar; a small box whose text is cut off.',
      explanation: 'Without .clearfix the wrapper height would be just its padding because floats do not count toward the parent height. clear: both in ::after forces the parent to extend below the floats.',
    },
    {
      title: 'z-index and a modal overlay',
      scenario: 'Three overlapping cards with different z-index values, plus a full-screen modal on top of everything.',
      steps: ['Create zindex.html', 'Position three cards absolutely so they overlap and give z-index 1, 3, 2', 'Create a fixed overlay with z-index 1000 and a centred modal', 'Click Open modal and Close'],
      code: zCss + '\n\n// script.js\n' + zJs,
      playground: { html: zHtml, css: zCss, js: zJs },
      result: 'Green card on top, blue in the middle, red at the back. Clicking "Open modal" darkens the whole screen with a white centred dialog; Close hides it.\nConsole:\nred z-index = 1\ngreen z-index = 3\nblue z-index = 2',
      explanation: 'Although blue comes last in the HTML, green has the higher z-index so it is drawn on top. The overlay uses position: fixed + inset: 0 to cover the viewport; top/left 50% plus translate(-50%, -50%) centres the modal.',
    },
    {
      title: 'Project: Create a webpage layout',
      scenario: 'Day 56 task: a classic layout with a sticky header (logo left, menu right), sidebar, main content with a badge, and footer, using only box model, display, position and float.',
      steps: ['Create layout.html with header, .page (aside + main) and footer', 'Add * { box-sizing: border-box } so the 30% + 67% widths include padding', 'Float the logo left and nav right, the sidebar left and content right', 'Clear the floats with .clearfix and clear: both on the footer', 'Make the header sticky with z-index 10 and position the NEW badge absolutely'],
      code: '<!-- layout.html -->\n' + layoutHtml + '\n\n/* layout.css */\n' + layoutCss,
      playground: { html: layoutHtml, css: layoutCss, js: '' },
      result: 'A dark-blue header with "Skyline Academy" on the left and four menu links on the right (highlight on hover) that stays at the top on scroll; a grey Modules sidebar on the left (30%) and the Day 56 content on the right (67%); a yellow notice box with a red NEW pill on its top edge; a dark footer across the bottom.',
      explanation: 'border-box keeps 30% + 67% + gaps under 100% even with padding. overflow: hidden on the header contains the floated logo and nav. On Day 57 the same layout becomes much simpler with Flexbox/Grid and responsive media queries.',
    },
  ],
  interview: [
    { q: 'Explain the CSS box model.', a: 'Every element is a box made of content, padding, border and margin (inside to outside). width/height size the content by default; padding and border add to it; margin is outside space.', level: 'Easy' },
    { q: 'content-box vs border-box?', a: 'content-box (default): width = content only, padding and border are added. border-box: width includes padding and border, so the declared width is the final width.', level: 'Medium' },
    { q: 'A div has width 300px, padding 10px, border 2px, margin 20px, content-box. Total space it occupies horizontally?', a: 'Box: 300 + 20 + 4 = 324px; with margins 324 + 40 = 364px.', level: 'Medium' },
    { q: 'Difference between display: none and visibility: hidden?', a: 'display:none removes the element from layout (no space); visibility:hidden hides it but keeps its space.', level: 'Easy' },
    { q: 'block vs inline vs inline-block?', a: 'block: new line, full width, accepts width/height. inline: flows in text, ignores width/height. inline-block: flows in line but accepts width/height/padding.', level: 'Easy' },
    { q: 'relative vs absolute positioning?', a: 'relative keeps the element in flow and offsets it from its normal position; absolute removes it from flow and positions it relative to the nearest positioned ancestor.', level: 'Medium' },
    { q: 'fixed vs sticky?', a: 'fixed is always relative to the viewport and never scrolls; sticky scrolls normally until a threshold, then sticks within its parent container.', level: 'Medium' },
    { q: 'Why does a parent collapse when its children are floated, and how do you fix it?', a: 'Floats are out of normal flow so they do not contribute to parent height. Fix with a clearfix (::after with clear: both), overflow: auto, or display: flow-root.', level: 'Medium' },
    { q: 'Why might z-index not work?', a: 'The element is not positioned (static), or it is inside a parent that forms a lower stacking context (position+z-index, opacity < 1, transform), so it cannot rise above elements outside that context.', level: 'Hard' },
    { q: 'overflow auto vs scroll?', a: 'auto shows scrollbars only when content overflows; scroll always shows them.', level: 'Easy' },
    { q: 'How do you centre a fixed-width block horizontally?', a: 'margin: 0 auto; (with a width). For an absolutely positioned element: left: 50%; transform: translateX(-50%).', level: 'Medium' },
  ],
  practice: [
    { task: 'Calculate the rendered width of: width 250px; padding 15px; border 3px; with content-box and with border-box. Then verify in DevTools.', hint: 'Add padding and border twice (both sides).', solution: 'content-box: 250 + 30 + 6 = 286px\nborder-box: 250px (content = 250 - 30 - 6 = 214px)' },
    { task: 'Create a product card with a "SALE" ribbon in its top-left corner.', hint: 'Card position: relative; ribbon position: absolute.', solution: '<div class="card"><span class="ribbon">SALE</span><img src="https://picsum.photos/240/160" alt=""><h3>Headphones</h3></div>\n\n.card { position: relative; width: 240px; border: 1px solid #ddd; }\n.ribbon { position: absolute; top: 8px; left: 8px; background: #dc2626; color: #fff; padding: 2px 8px; font-size: 12px; }\n.card img { display: block; width: 100%; }' },
    { task: 'Add a "Back to top" button that always stays at the bottom-right of the window.', hint: 'position: fixed.', solution: '<a href="#" class="to-top">Top</a>\n\n.to-top { position: fixed; right: 20px; bottom: 20px; background: #0f172a; color: #fff; padding: 10px 14px; border-radius: 6px; text-decoration: none; z-index: 100; }' },
    { task: 'Make a horizontal menu from a ul using inline-block links, and a sticky header that contains it.', hint: 'li display inline-block; header position sticky; top 0.', solution: 'header { position: sticky; top: 0; background: #1e3a8a; z-index: 10; }\nheader ul { margin: 0; padding: 10px; list-style: none; }\nheader li { display: inline-block; }\nheader a { display: inline-block; padding: 8px 12px; color: #fff; text-decoration: none; }' },
    { task: 'Build a 2-column float layout (sidebar 25%, content 75%) with a footer that stays below both.', hint: 'border-box + clear: both on footer.', solution: '* { box-sizing: border-box; }\n.sidebar { float: left; width: 25%; padding: 10px; }\n.content { float: left; width: 75%; padding: 10px; }\nfooter { clear: both; }' },
  ],
  quiz: [
    { question: 'With box-sizing: content-box, width 100px, padding 10px and border 1px, the rendered width is?', options: ['100px', '111px', '122px', '120px'], answer: 2, explanation: '100 + 10*2 + 1*2 = 122px.' },
    { question: 'An absolute element is positioned relative to?', options: ['Its nearest positioned ancestor', 'Always the body', 'Its previous sibling', 'The viewport always'], answer: 0, explanation: 'The nearest ancestor with position other than static; if none, the initial containing block.' },
    { question: 'Which keeps an element in place while the page scrolls, relative to the viewport?', options: ['relative', 'absolute', 'static', 'fixed'], answer: 3, explanation: 'fixed uses the viewport as reference.' },
    { question: 'Which display value ignores width and height?', options: ['block', 'inline', 'inline-block', 'flex'], answer: 1, explanation: 'Non-replaced inline elements ignore width and height.' },
    { question: 'Which declaration stops content spilling out, adding a scrollbar only when needed?', options: ['overflow: visible', 'overflow: hidden', 'overflow: auto', 'z-index: auto'], answer: 2, explanation: 'auto adds scrollbars only when content overflows.' },
  ],
};
