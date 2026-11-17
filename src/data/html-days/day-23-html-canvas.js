export default {
  id: 'day-23-html-canvas',
  title: 'HTML Canvas Introduction: <canvas>, Basic Shapes, Lines, Rectangles',
  module: 'Module 5: HTML5 Advanced Topics',
  day: 23,
  level: 'Intermediate',
  duration: '2 hours',
  summary: "<canvas> is a blank bitmap drawing surface that you paint on with JavaScript. It powers games, charts, image editors and signature pads. Today you set up a canvas, understand its coordinate system, and draw rectangles, lines and simple shapes.",
  objectives: [
    'Create a <canvas> and get its 2D rendering context',
    'Understand the canvas coordinate system (origin at top-left)',
    'Draw filled, stroked and cleared rectangles',
    'Draw lines and triangles with paths (beginPath, moveTo, lineTo, stroke, fill)',
    'Draw circles with arc and style with fillStyle, strokeStyle and lineWidth',
  ],
  theory: [
    {
      heading: 'What is <canvas>?',
      content: "`<canvas>` creates a rectangular area of pixels. HTML only creates the empty surface; **all drawing happens in JavaScript**.\n\nAnalogy: `<canvas>` is a blank **painting canvas** on an easel, and JavaScript is the **brush**. Once paint is on the canvas, it is just pixels: the canvas does not remember that you drew \"a circle\". To move it, you clear and repaint.\n\nThe default size is **300 × 150** pixels. Set size with the `width` and `height` **attributes**, not CSS (CSS only stretches the bitmap and makes it blurry).",
      syntax: `<canvas id="board" width="400" height="200">
  Fallback text: your browser does not support canvas.
</canvas>`,
      tip: 'Canvas content is invisible to screen readers. Add meaningful fallback content or an aria-label / role="img" describing the drawing.',
    },
    {
      heading: 'Getting the 2D context',
      content: "To draw, grab the element and ask for its **rendering context**, the object that holds all the drawing methods.",
      syntax: `const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');   // the paintbrush`,
      points: [
        "getContext('2d') → 2D drawing API (today's topic)",
        "getContext('webgl') → 3D graphics (advanced)",
      ],
    },
    {
      heading: 'The coordinate system',
      content: "The origin `(0, 0)` is the **top-left corner**. `x` increases to the **right**, `y` increases **downwards** (opposite of school maths graphs!).\n\nSo on a 400×200 canvas, the bottom-right corner is (400, 200) and the centre is (200, 100).",
      tip: 'Beginners often expect y to grow upwards. Remember: y = 0 is the TOP.',
    },
    {
      heading: 'Rectangles',
      content: "Rectangles are the only shape with direct methods:\n- `fillRect(x, y, width, height)`: solid rectangle using `fillStyle`\n- `strokeRect(x, y, width, height)`: outline using `strokeStyle` and `lineWidth`\n- `clearRect(x, y, width, height)`: erases to transparent\n\nStyle properties are set BEFORE drawing, like dipping the brush in paint first.",
      syntax: `ctx.fillStyle = 'teal';
ctx.fillRect(20, 20, 150, 80);
ctx.strokeStyle = 'red';
ctx.lineWidth = 4;
ctx.strokeRect(200, 20, 150, 80);
ctx.clearRect(50, 40, 40, 40);`,
    },
    {
      heading: 'Paths: lines and triangles',
      content: "Every other shape is drawn as a **path**:\n\n1. `ctx.beginPath()`: start a new path (forget the old one)\n2. `ctx.moveTo(x, y)`: lift the pen and move it\n3. `ctx.lineTo(x, y)`: draw a line to this point\n4. `ctx.closePath()`: optional, draws back to the start\n5. `ctx.stroke()` to outline or `ctx.fill()` to fill\n\nLine styling: `lineWidth`, `lineCap` (`butt`, `round`, `square`), `lineJoin` (`miter`, `round`, `bevel`).",
      syntax: `ctx.beginPath();
ctx.moveTo(50, 150);
ctx.lineTo(150, 50);
ctx.lineTo(250, 150);
ctx.closePath();
ctx.stroke();`,
      tip: 'Forgetting beginPath() is the #1 canvas bug: every new stroke() redraws all previous lines in the new colour.',
    },
    {
      heading: 'Circles and text',
      content: "`ctx.arc(x, y, radius, startAngle, endAngle)` draws an arc. Angles are in **radians**: a full circle is `0` to `Math.PI * 2`.\n\nYou can also write text: `ctx.font = '20px sans-serif'; ctx.fillText('Hello', x, y);`\n\n**Canvas vs SVG** (coming tomorrow): canvas is pixel-based, fast for thousands of objects and games; SVG is vector-based, scalable and each shape is a DOM element.",
      syntax: `ctx.beginPath();
ctx.arc(200, 100, 50, 0, Math.PI * 2);
ctx.fillStyle = 'gold';
ctx.fill();`,
    },
  ],
  examples: [
    {
      title: 'First canvas: rectangles',
      scenario: 'Draw a filled rectangle, an outlined rectangle, and erase a hole.',
      steps: [
        'Create index.html with <canvas id="c" width="400" height="200">',
        'In JS get the 2d context',
        'Use fillRect, strokeRect and clearRect',
        'Click Run',
      ],
      code: `const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = 'teal';
ctx.fillRect(20, 20, 150, 100);
ctx.strokeStyle = 'crimson';
ctx.lineWidth = 5;
ctx.strokeRect(210, 20, 150, 100);
ctx.clearRect(60, 50, 40, 40);`,
      playground: {
        html: `<canvas id="c" width="400" height="160" role="img" aria-label="A teal rectangle with a hole and a red outlined rectangle">
  Your browser does not support canvas.
</canvas>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
canvas { border: 1px solid #94a3b8; max-width: 100%; }`,
        js: `const canvas = document.getElementById('c');
const ctx = canvas.getContext('2d');
ctx.fillStyle = 'teal';
ctx.fillRect(20, 20, 150, 100);
ctx.strokeStyle = 'crimson';
ctx.lineWidth = 5;
ctx.strokeRect(210, 20, 150, 100);
ctx.clearRect(60, 50, 40, 40);
console.log('Canvas size:', canvas.width, 'x', canvas.height);`,
      },
      result: 'A teal rectangle with a transparent square hole on the left and a red outlined rectangle on the right. Console: Canvas size: 400 x 160.',
      explanation: 'Each method takes (x, y, width, height) measured from the top-left. Style properties apply to every drawing call after they are set.',
    },
    {
      title: 'Lines, line caps and a triangle',
      scenario: 'Draw three lines with different caps and a filled triangle.',
      steps: [
        'Loop over three lineCap values and draw a thick horizontal line for each',
        'Draw a triangle path with moveTo/lineTo/closePath',
        'Fill and stroke it',
        'Click Run',
      ],
      code: `ctx.beginPath();
ctx.moveTo(260, 140);
ctx.lineTo(320, 30);
ctx.lineTo(380, 140);
ctx.closePath();
ctx.fillStyle = '#facc15';
ctx.fill();
ctx.stroke();`,
      playground: {
        html: `<canvas id="c" width="400" height="160"></canvas>`,
        css: `body { padding: 12px; }
canvas { border: 1px solid #94a3b8; max-width: 100%; }`,
        js: `const ctx = document.getElementById('c').getContext('2d');
ctx.lineWidth = 14;
ctx.strokeStyle = '#2563eb';
['butt', 'round', 'square'].forEach((cap, i) => {
  ctx.beginPath();
  ctx.lineCap = cap;
  ctx.moveTo(40, 40 + i * 40);
  ctx.lineTo(200, 40 + i * 40);
  ctx.stroke();
  console.log('Drew line with lineCap =', cap);
});
// triangle
ctx.beginPath();
ctx.moveTo(260, 140);
ctx.lineTo(320, 30);
ctx.lineTo(380, 140);
ctx.closePath();
ctx.fillStyle = '#facc15';
ctx.fill();
ctx.lineWidth = 3;
ctx.strokeStyle = '#92400e';
ctx.lineJoin = 'round';
ctx.stroke();`,
      },
      result: 'Three thick blue lines (flat, rounded and square ends) and a yellow triangle with a brown outline.',
      explanation: 'beginPath() starts a fresh path for each line so earlier lines are not restroked. round and square caps extend beyond the end point by half the line width.',
    },
    {
      title: 'Smiley face with arcs',
      scenario: 'Combine circles and arcs to draw a smiley.',
      steps: [
        'Draw a yellow full circle for the face',
        'Draw two small filled circles for eyes',
        'Draw a half-circle arc (0 to PI) for the mouth',
        'Click Run',
      ],
      code: `ctx.beginPath();
ctx.arc(100, 100, 80, 0, Math.PI * 2);
ctx.fill();
ctx.beginPath();
ctx.arc(100, 110, 45, 0, Math.PI);   // mouth
ctx.stroke();`,
      playground: {
        html: `<canvas id="c" width="200" height="200" role="img" aria-label="Smiley face"></canvas>`,
        css: `body { padding: 12px; }`,
        js: `const ctx = document.getElementById('c').getContext('2d');
// face
ctx.beginPath();
ctx.arc(100, 100, 80, 0, Math.PI * 2);
ctx.fillStyle = '#fde047';
ctx.fill();
ctx.lineWidth = 3;
ctx.stroke();
// eyes
ctx.fillStyle = '#111';
[70, 130].forEach(x => {
  ctx.beginPath();
  ctx.arc(x, 75, 10, 0, Math.PI * 2);
  ctx.fill();
});
// mouth
ctx.beginPath();
ctx.arc(100, 110, 45, 0, Math.PI);
ctx.stroke();
console.log('Full circle = 2 * PI radians =', (Math.PI * 2).toFixed(4));`,
      },
      result: 'A yellow smiley with two black eyes and a smiling mouth.',
      explanation: 'arc(x, y, r, start, end) uses radians: 0 is the 3 o\'clock position, and angles grow clockwise, so 0 to PI is the lower half of the circle, which forms the smile.',
    },
    {
      title: 'Simple bar chart from data',
      scenario: 'Draw a monthly sales bar chart with labels using fillRect and fillText.',
      steps: [
        'Create an array of sales values',
        'Loop and draw a bar for each value (taller = more sales)',
        'Write the month name under each bar with fillText',
        'Click Run',
      ],
      code: `data.forEach((d, i) => {
  const h = d.value * 2;
  ctx.fillRect(40 + i * 70, 180 - h, 40, h);
  ctx.fillText(d.month, 40 + i * 70, 195);
});`,
      playground: {
        html: `<canvas id="c" width="400" height="210" role="img" aria-label="Bar chart of sales: Jan 40, Feb 65, Mar 50, Apr 80, May 70"></canvas>`,
        css: `body { padding: 12px; }
canvas { border: 1px solid #e2e8f0; max-width: 100%; }`,
        js: `const ctx = document.getElementById('c').getContext('2d');
const data = [
  { month: 'Jan', value: 40 }, { month: 'Feb', value: 65 }, { month: 'Mar', value: 50 },
  { month: 'Apr', value: 80 }, { month: 'May', value: 70 }
];
ctx.font = '13px sans-serif';
data.forEach((d, i) => {
  const h = d.value * 2;
  const x = 40 + i * 70;
  ctx.fillStyle = '#0ea5e9';
  ctx.fillRect(x, 180 - h, 40, h);
  ctx.fillStyle = '#0f172a';
  ctx.fillText(d.month, x + 8, 198);
  ctx.fillText(d.value, x + 10, 175 - h);
});
// baseline
ctx.beginPath();
ctx.moveTo(30, 180);
ctx.lineTo(390, 180);
ctx.stroke();
console.log('Highest month:', data.reduce((a, b) => (b.value > a.value ? b : a)).month);`,
      },
      result: 'Five blue bars of different heights with month labels below and values above. Console: Highest month: Apr.',
      explanation: 'Because y grows downwards, a bar of height h starts at y = baseline - h. This is exactly how chart libraries like Chart.js draw on canvas.',
    },
  ],
  interview: [
    { q: 'What is the HTML <canvas> element?', a: 'A resolution-dependent bitmap drawing surface. HTML provides the area; JavaScript draws graphics on it through a rendering context.', level: 'Easy' },
    { q: 'How do you start drawing on a canvas?', a: "Select the element and call getContext('2d') to get the CanvasRenderingContext2D, then use its methods like fillRect.", level: 'Easy' },
    { q: 'What is the default size of a canvas?', a: '300 pixels wide by 150 pixels high.', level: 'Easy' },
    { q: 'Why should you set canvas size via attributes instead of CSS?', a: 'Attributes set the bitmap resolution. CSS only scales the displayed element, stretching the bitmap and making drawings blurry or distorted.', level: 'Medium' },
    { q: 'Explain the canvas coordinate system.', a: 'Origin (0,0) is the top-left; x increases to the right and y increases downward.', level: 'Easy' },
    { q: 'What are the three rectangle methods?', a: 'fillRect (filled), strokeRect (outline), clearRect (erase to transparent). All take x, y, width, height.', level: 'Easy' },
    { q: 'Why is beginPath() important?', a: 'It resets the current path. Without it, subsequent stroke()/fill() calls redraw all previously added sub-paths.', level: 'Medium' },
    { q: 'How do you draw a circle?', a: 'ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill() or ctx.stroke().', level: 'Medium' },
    { q: 'Difference between Canvas and SVG?', a: 'Canvas is raster/immediate mode (pixels, no DOM per shape, great for games and many objects). SVG is vector/retained mode (each shape is a DOM element, scalable, accessible, easy events, good for icons and charts with few elements).', level: 'Hard' },
    { q: 'Is canvas content accessible?', a: 'Not by default; it is just pixels. Provide fallback content inside the tag, role="img" with aria-label, or an equivalent HTML table/description.', level: 'Medium' },
  ],
  practice: [
    { task: 'Draw a house: a square body (fillRect), a triangle roof (path) and a door (fillRect).', hint: 'Roof starts at the top-left corner of the body.', solution: `<canvas id="c" width="300" height="250"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = '#f59e0b'; ctx.fillRect(75, 120, 150, 110);
ctx.beginPath(); ctx.moveTo(60, 120); ctx.lineTo(150, 40); ctx.lineTo(240, 120); ctx.closePath();
ctx.fillStyle = '#b91c1c'; ctx.fill();
ctx.fillStyle = '#78350f'; ctx.fillRect(135, 170, 30, 60);
</script>` },
    { task: 'Draw a 4x4 chessboard of 50px squares.', hint: 'Nested loops; colour depends on (row + col) % 2.', solution: `<canvas id="c" width="200" height="200"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
for (let r = 0; r < 4; r++) {
  for (let c = 0; c < 4; c++) {
    ctx.fillStyle = (r + c) % 2 === 0 ? '#eee' : '#333';
    ctx.fillRect(c * 50, r * 50, 50, 50);
  }
}
</script>` },
    { task: 'Draw an X across the canvas from corner to corner with red 5px lines.', hint: 'Two moveTo/lineTo pairs in one path.', solution: `<canvas id="c" width="200" height="200"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
ctx.strokeStyle = 'red'; ctx.lineWidth = 5;
ctx.beginPath();
ctx.moveTo(0, 0); ctx.lineTo(200, 200);
ctx.moveTo(200, 0); ctx.lineTo(0, 200);
ctx.stroke();
</script>` },
    { task: 'Draw a traffic light: a dark rectangle with red, yellow and green circles.', hint: 'Three arcs with different fillStyle.', solution: `<canvas id="c" width="120" height="300"></canvas>
<script>
const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = '#222'; ctx.fillRect(20, 10, 80, 280);
['red', 'yellow', 'lime'].forEach((col, i) => {
  ctx.beginPath(); ctx.arc(60, 60 + i * 90, 30, 0, Math.PI * 2);
  ctx.fillStyle = col; ctx.fill();
});
</script>` },
  ],
  quiz: [
    { question: 'Which call returns the 2D drawing API?', options: ["canvas.getContext('2d')", "canvas.draw('2d')", "canvas.context2D()", "document.get2D()"], answer: 0, explanation: "getContext('2d') returns a CanvasRenderingContext2D." },
    { question: 'Where is (0, 0) on a canvas?', options: ['Centre', 'Bottom-left', 'Top-left', 'Bottom-right'], answer: 2, explanation: 'The origin is the top-left corner; y grows downward.' },
    { question: 'Which draws only the outline of a rectangle?', options: ['fillRect', 'clearRect', 'outlineRect', 'strokeRect'], answer: 3, explanation: 'strokeRect draws the border using strokeStyle.' },
    { question: 'A full circle with arc() goes from 0 to:', options: ['360', 'Math.PI * 2', 'Math.PI', '100'], answer: 1, explanation: 'Angles are in radians; 2π is 360°.' },
    { question: 'Setting canvas width with CSS only (no attribute) causes:', options: ['A blurry/stretched drawing', 'An error', 'Better quality', 'The canvas to disappear'], answer: 0, explanation: 'The 300x150 bitmap is stretched to the CSS size.' },
  ],
};
