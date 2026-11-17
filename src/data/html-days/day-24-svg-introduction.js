export default {
  id: 'day-24-svg-introduction',
  title: 'SVG Introduction: <svg>, Shapes, Circle, Rectangle, Line, Polygon',
  module: 'Module 5: HTML5 Advanced Topics',
  day: 24,
  level: 'Intermediate',
  duration: '2 hours',
  summary: "SVG (Scalable Vector Graphics) describes images with XML-like tags instead of pixels, so they stay perfectly sharp at any size. You will write inline <svg> and draw circles, rectangles, lines and polygons, then style them with attributes and CSS.",
  objectives: [
    'Explain vector vs raster graphics and when to use SVG',
    'Create inline <svg> with width, height and viewBox',
    'Draw <circle>, <rect>, <line>, <ellipse>, <polyline> and <polygon>',
    'Style shapes with fill, stroke and stroke-width (attributes and CSS)',
    'Add text and accessibility (<title>, role="img")',
  ],
  theory: [
    {
      heading: 'What is SVG?',
      content: "**SVG** stands for Scalable Vector Graphics. Instead of storing millions of coloured pixels (like JPG/PNG), an SVG stores **instructions**: \"draw a circle at (50, 50) with radius 40, coloured red\".\n\nAnalogy: a PNG is a **photograph** of a drawing; zoom in and it becomes blocky. An SVG is the **recipe** for the drawing; the browser re-cooks it perfectly at any size.\n\nUse SVG for logos, icons, illustrations, charts, maps and animations. Use JPG/PNG/WebP for photos.\n\nWays to use SVG:\n- Inline `<svg>` in HTML (today, styleable with CSS and JS)\n- `<img src=\"logo.svg\" alt=\"...\">`\n- CSS `background-image: url(icon.svg)`",
    },
    {
      heading: 'The <svg> element, coordinates and viewBox',
      content: "Like canvas, the origin `(0,0)` is the **top-left** and y grows downward.\n\n- `width` / `height`: the size on the page.\n- `viewBox=\"minX minY width height\"`: the internal coordinate system. With `viewBox=\"0 0 100 100\"` you draw in a 100×100 world, and the browser scales that world to whatever width/height the SVG has. This is what makes SVGs responsive.",
      syntax: `<svg width="200" height="200" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" fill="tomato" />
</svg>`,
      tip: 'xmlns is required for standalone .svg files but optional for inline SVG in HTML5. Always include viewBox; without it the SVG cannot scale properly.',
    },
    {
      heading: 'Basic shapes',
      content: "- `<rect x y width height rx ry>`: rectangle (`rx` rounds the corners)\n- `<circle cx cy r>`: circle with centre (cx, cy) and radius r\n- `<ellipse cx cy rx ry>`: oval\n- `<line x1 y1 x2 y2>`: straight line (needs a `stroke` to be visible!)\n- `<polyline points=\"x,y x,y ...\">`: open connected lines\n- `<polygon points=\"x,y x,y ...\">`: closed shape (last point joins the first): triangles, stars, hexagons\n- `<path d=\"...\">`: any shape with commands (advanced)",
      syntax: `<rect x="10" y="10" width="80" height="50" rx="8" fill="steelblue" />
<line x1="10" y1="80" x2="190" y2="80" stroke="black" stroke-width="2" />
<polygon points="100,10 40,198 190,78 10,78 160,198" fill="gold" />`,
      tip: 'A <line> has no fill area. If you forget stroke, it is invisible: the most common SVG beginner bug.',
    },
    {
      heading: 'Styling: fill, stroke and CSS',
      content: "Presentation attributes:\n- `fill`: inside colour (`none` for hollow)\n- `stroke`: outline colour\n- `stroke-width`: outline thickness\n- `opacity`, `fill-opacity`, `stroke-dasharray` (dashed lines), `stroke-linecap`\n\nBecause inline SVG shapes are real DOM elements, you can style them with CSS classes, `:hover` effects and transitions. Using `fill: currentColor` makes an icon take the text colour of its parent.",
      syntax: `.icon { fill: currentColor; }
circle:hover { fill: orange; }`,
    },
    {
      heading: 'Text, grouping and accessibility',
      content: "- `<text x y>`: text that scales with the graphic\n- `<g>`: groups shapes so you can style or transform them together (`transform=\"translate(20,10)\"`)\n- `<title>` as the first child gives the SVG an accessible name (and a tooltip)\n\nFor a meaningful inline SVG use `role=\"img\"` and `aria-labelledby` pointing to the title. For a decorative SVG use `aria-hidden=\"true\"`.\n\n**SVG vs Canvas**: SVG = vector, DOM nodes, scalable, events per shape, best for a moderate number of shapes. Canvas = pixels, very fast for thousands of objects, no DOM.",
      syntax: `<svg viewBox="0 0 100 100" role="img" aria-labelledby="t">
  <title id="t">Green tick</title>
  <polyline points="20,55 40,75 80,30" fill="none" stroke="green" stroke-width="8" />
</svg>`,
    },
  ],
  examples: [
    {
      title: 'All basic shapes on one canvas',
      scenario: 'Draw a rectangle, circle, ellipse, line, polyline and polygon side by side.',
      steps: [
        'Create index.html with <svg viewBox="0 0 400 200">',
        'Add each shape element with fill/stroke',
        'Click Run and resize the preview: shapes stay sharp',
      ],
      code: `<svg viewBox="0 0 400 200" width="100%">
  <rect x="10" y="10" width="80" height="60" rx="8" fill="#0ea5e9"/>
  <circle cx="160" cy="40" r="30" fill="#f97316"/>
  <ellipse cx="260" cy="40" rx="50" ry="25" fill="#a855f7"/>
  <line x1="10" y1="110" x2="120" y2="180" stroke="#111" stroke-width="4"/>
  <polyline points="150,180 180,110 210,160 240,110" fill="none" stroke="#16a34a" stroke-width="4"/>
  <polygon points="320,110 380,180 260,180" fill="#facc15" stroke="#92400e" stroke-width="3"/>
</svg>`,
      playground: {
        html: `<svg viewBox="0 0 400 200" width="100%" style="max-width:500px" role="img" aria-labelledby="t1">
  <title id="t1">Basic SVG shapes</title>
  <rect x="10" y="10" width="80" height="60" rx="8" fill="#0ea5e9"/>
  <circle cx="160" cy="40" r="30" fill="#f97316"/>
  <ellipse cx="260" cy="40" rx="50" ry="25" fill="#a855f7"/>
  <line x1="10" y1="110" x2="120" y2="180" stroke="#111" stroke-width="4"/>
  <polyline points="150,180 180,110 210,160 240,110" fill="none" stroke="#16a34a" stroke-width="4"/>
  <polygon points="320,110 380,180 260,180" fill="#facc15" stroke="#92400e" stroke-width="3"/>
</svg>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
svg { border: 1px solid #e2e8f0; }`,
        js: `document.querySelectorAll('svg > *:not(title)').forEach(s => console.log('Shape:', s.tagName));`,
      },
      result: 'A blue rounded rectangle, orange circle, purple ellipse, black diagonal line, green zig-zag and yellow triangle. Console lists all six tag names.',
      explanation: 'Each tag is a DOM element with geometry attributes. viewBox defines a 400x200 world that scales to the available width.',
    },
    {
      title: 'Scalable logo badge with text and a group',
      scenario: 'Create a company badge that looks crisp at 50px and 300px.',
      steps: [
        'Draw a circle and a polygon star inside a <g>',
        'Add <text> with text-anchor="middle"',
        'Render the same SVG at two sizes using different width values',
        'Click Run',
      ],
      code: `<svg viewBox="0 0 100 100" width="60">
  <g>
    <circle cx="50" cy="50" r="46" fill="#1e3a8a"/>
    <polygon points="50,15 59,40 85,40 64,55 72,80 50,65 28,80 36,55 15,40 41,40" fill="#fbbf24"/>
  </g>
  <text x="50" y="96" text-anchor="middle" font-size="10" fill="white">STAR</text>
</svg>`,
      playground: {
        html: `<template id="logo">
  <svg viewBox="0 0 100 100" role="img" aria-label="Star Co. logo">
    <g>
      <circle cx="50" cy="50" r="46" fill="#1e3a8a"/>
      <polygon points="50,12 59,38 86,38 64,54 72,80 50,64 28,80 36,54 14,38 41,38" fill="#fbbf24"/>
    </g>
    <text x="50" y="93" text-anchor="middle" font-size="9" font-family="sans-serif" fill="white">STAR CO.</text>
  </svg>
</template>
<div id="row"></div>`,
        css: `body { padding: 12px; }
#row { display: flex; align-items: center; gap: 16px; }`,
        js: `const tpl = document.getElementById('logo');
[48, 120, 220].forEach(size => {
  const svg = tpl.content.firstElementChild.cloneNode(true);
  svg.setAttribute('width', size);
  document.getElementById('row').appendChild(svg);
});
console.log('Same SVG rendered at 48px, 120px and 220px');`,
      },
      result: 'The same blue badge with a gold star and "STAR CO." text appears at three sizes, all perfectly sharp.',
      explanation: 'Because SVG stores shapes not pixels, only the width changes and viewBox maps the 100x100 drawing to it. A raster image would blur when enlarged.',
    },
    {
      title: 'Interactive icons styled with CSS',
      scenario: 'Build a row of SVG icons that change colour on hover and inherit text colour.',
      steps: [
        'Draw three simple icons (home, heart triangle, check) with fill="currentColor" or stroke="currentColor"',
        'Wrap each in a <button> with a label',
        'Add CSS color and :hover rules',
        'Click Run and hover the buttons',
      ],
      code: `<button class="ico"><svg viewBox="0 0 24 24" aria-hidden="true">
  <polygon points="12,3 2,12 5,12 5,21 19,21 19,12 22,12" fill="currentColor"/>
</svg> Home</button>
.ico { color: #334155; } .ico:hover { color: #2563eb; }`,
      playground: {
        html: `<button class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><polygon points="12,3 2,12 5,12 5,21 19,21 19,12 22,12" fill="currentColor"/></svg> Home</button>
<button class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="2"/><line x1="12" y1="7" x2="12" y2="13" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="16.5" r="1.3" fill="currentColor"/></svg> Info</button>
<button class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><polyline points="4,13 9,18 20,6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg> Done</button>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.ico { display: inline-flex; align-items: center; gap: 6px; color: #334155; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 15px; }
.ico svg { width: 20px; height: 20px; transition: transform .2s; }
.ico:hover { color: #2563eb; }
.ico:hover svg { transform: scale(1.2); }`,
        js: `document.querySelectorAll('.ico').forEach(b => b.addEventListener('click', () => console.log('Clicked', b.textContent.trim())));`,
      },
      result: 'Three buttons with Home, Info and Done icons. Hovering turns icon and text blue and enlarges the icon; clicks are logged.',
      explanation: 'currentColor makes the SVG use the CSS color of its parent, so one CSS rule recolours both text and icon. aria-hidden hides the decorative icon because the button text already gives the meaning.',
    },
    {
      title: 'SVG bar chart that reacts to clicks',
      scenario: 'Draw a small chart with rects and show which bar was clicked.',
      steps: [
        'Generate <rect> bars with JavaScript using createElementNS',
        'Attach a click listener to each bar',
        'Click Run and click a bar',
      ],
      code: `const NS = 'http://www.w3.org/2000/svg';
const r = document.createElementNS(NS, 'rect');
r.setAttribute('height', value);`,
      playground: {
        html: `<svg id="chart" viewBox="0 0 300 160" width="100%" style="max-width:420px" role="img" aria-label="Sales chart"></svg>
<p id="info">Click a bar</p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
rect { fill: #14b8a6; cursor: pointer; }
rect:hover { fill: #0f766e; }`,
        js: `const NS = 'http://www.w3.org/2000/svg';
const svg = document.getElementById('chart');
const data = [30, 80, 55, 120, 95];
data.forEach((v, i) => {
  const r = document.createElementNS(NS, 'rect');
  r.setAttribute('x', 20 + i * 55);
  r.setAttribute('y', 150 - v);
  r.setAttribute('width', 40);
  r.setAttribute('height', v);
  r.addEventListener('click', () => {
    document.getElementById('info').textContent = 'Bar ' + (i + 1) + ' value: ' + v;
    console.log('Clicked bar', i + 1, v);
  });
  svg.appendChild(r);
});`,
      },
      result: 'Five teal bars. Hovering darkens a bar; clicking shows "Bar 4 value: 120" etc. below the chart.',
      explanation: 'SVG elements must be created with createElementNS and the SVG namespace (createElement("rect") would create an unknown HTML element). Unlike canvas, each bar is its own element with its own events.',
    },
  ],
  interview: [
    { q: 'What is SVG?', a: 'Scalable Vector Graphics: an XML-based format describing 2D graphics with shapes and paths, which scale without losing quality.', level: 'Easy' },
    { q: 'Vector vs raster images?', a: 'Raster (JPG, PNG) stores a fixed grid of pixels and blurs when scaled up. Vector (SVG) stores geometric instructions and stays sharp at any size. Photos suit raster; logos and icons suit vector.', level: 'Easy' },
    { q: 'What does viewBox do?', a: 'Defines the internal coordinate system (min-x, min-y, width, height) that is scaled to fit the SVG viewport, enabling responsive scaling.', level: 'Medium' },
    { q: 'List the basic SVG shape elements.', a: 'rect, circle, ellipse, line, polyline, polygon, and the general-purpose path.', level: 'Easy' },
    { q: 'Difference between polyline and polygon?', a: 'polyline draws connected segments and stays open; polygon automatically closes the shape by joining the last point to the first.', level: 'Medium' },
    { q: 'Why is my SVG <line> invisible?', a: 'Lines have no fill area; you must set stroke (and usually stroke-width).', level: 'Medium' },
    { q: 'What is currentColor?', a: 'A CSS keyword equal to the element current color value. Using fill="currentColor" lets SVG icons inherit the text colour.', level: 'Medium' },
    { q: 'Ways to include SVG in a web page?', a: 'Inline <svg>, <img src="x.svg">, CSS background-image, <object>/<embed>. Only inline (and object) allows styling internal parts with page CSS/JS.', level: 'Medium' },
    { q: 'SVG vs Canvas: when to use which?', a: 'SVG: scalable graphics with fewer objects needing interactivity/accessibility (icons, charts, maps). Canvas: pixel-level, high-performance drawing with many objects (games, particle effects, image processing).', level: 'Hard' },
    { q: 'How do you create SVG elements with JavaScript?', a: "document.createElementNS('http://www.w3.org/2000/svg', 'circle') — SVG elements need the SVG namespace.", level: 'Hard' },
    { q: 'How do you make an inline SVG accessible?', a: 'Add role="img" and a <title> (referenced with aria-labelledby) or aria-label; decorative SVGs get aria-hidden="true".', level: 'Medium' },
  ],
  practice: [
    { task: 'Draw the Indian flag using three <rect>s and a <circle> for the chakra (outline only).', hint: 'viewBox="0 0 300 200", each stripe height 66.6.', solution: `<svg viewBox="0 0 300 200" width="300">
  <rect width="300" height="66.67" fill="#FF9933"/>
  <rect y="66.67" width="300" height="66.67" fill="#ffffff"/>
  <rect y="133.33" width="300" height="66.67" fill="#138808"/>
  <circle cx="150" cy="100" r="28" fill="none" stroke="#000080" stroke-width="4"/>
</svg>` },
    { task: 'Draw a right-angled triangle with polygon and a dashed outline.', hint: 'stroke-dasharray="6 4".', solution: `<svg viewBox="0 0 200 200" width="200">
  <polygon points="20,180 180,180 20,20" fill="#bae6fd" stroke="#0369a1" stroke-width="3" stroke-dasharray="6 4"/>
</svg>` },
    { task: 'Make a traffic light SVG: rounded dark rect + 3 circles.', hint: 'rect rx for rounded corners.', solution: `<svg viewBox="0 0 80 200" width="80">
  <rect x="5" y="5" width="70" height="190" rx="15" fill="#222"/>
  <circle cx="40" cy="45" r="22" fill="red"/>
  <circle cx="40" cy="100" r="22" fill="gold"/>
  <circle cx="40" cy="155" r="22" fill="limegreen"/>
</svg>` },
    { task: 'Create a circle that changes colour on hover using CSS only.', hint: 'Use a class and :hover with fill.', solution: `<style>.dot { fill: #94a3b8; transition: fill .3s; } .dot:hover { fill: #e11d48; }</style>
<svg viewBox="0 0 100 100" width="120"><circle class="dot" cx="50" cy="50" r="40"/></svg>` },
  ],
  quiz: [
    { question: 'SVG stands for:', options: ['Simple Visual Graphics', 'Scalable Vector Graphics', 'Styled Vector Grid', 'Standard Video Graphics'], answer: 1, explanation: 'Scalable Vector Graphics.' },
    { question: 'Attributes defining a circle are:', options: ['x, y, r', 'cx, cy, r', 'x1, y1, radius', 'cx, cy, width'], answer: 1, explanation: 'cx and cy are the centre; r is the radius.' },
    { question: 'Which shape automatically closes?', options: ['polyline', 'line', 'path without Z', 'polygon'], answer: 3, explanation: 'polygon joins the last point back to the first.' },
    { question: 'Which attribute lets an SVG scale responsively?', options: ['viewBox', 'scale', 'zoom', 'responsive'], answer: 0, explanation: 'viewBox defines the internal coordinate system to scale.' },
    { question: 'Best format for a company logo:', options: ['JPG', 'BMP', 'SVG', 'GIF'], answer: 2, explanation: 'Logos need sharpness at every size, which vector SVG provides.' },
  ],
};
