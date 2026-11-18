const PIXEL = `
// --- checker line (do not change): reads one pixel of your drawing ---
const px = (x, y) => [...document.getElementById('c').getContext('2d').getImageData(x, y, 1, 1).data].join(',');`;

export default {
  lesson: 'day-23-html-canvas',
  minutes: 28,
  intro: 'Create a <canvas>, get its 2D context and draw rectangles, lines, triangles and circles with fill and stroke.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Where is the point (0, 0) on a canvas?',
      options: ['Centre', 'Bottom-left', 'Top-left', 'Bottom-right'],
      answer: 2,
      explain: 'The origin is the **top-left** corner. x grows to the right and **y grows downwards**, unlike school graphs where y grows upwards.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why should canvas size be set with the `width`/`height` **attributes** rather than only CSS?',
      options: ['CSS does not work on canvas', 'Attributes set the drawing resolution; CSS only stretches it, making drawings blurry/distorted', 'Attributes make it load faster', 'There is no difference'],
      answer: 1,
      explain: 'The attributes define how many pixels the canvas has (default 300×150). CSS scales that bitmap like an image, so mismatched sizes stretch and blur your drawing.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that gets the 2D drawing context:\n`const ctx = canvas.________(\'2d\');`',
      accept: ['getContext'],
      caseSensitive: true,
      explain: '`canvas.getContext(\'2d\')` returns the object with all drawing methods (`fillRect`, `arc`, `stroke`…). JavaScript is case-sensitive, so `getcontext` fails.',
    },
    {
      type: 'code',
      lang: 'html',
      mins: 4,
      q: 'Add a canvas for a **sales chart**: `<canvas id="chart">` with `width="400"`, `height="200"` and fallback text inside (shown in very old browsers).',
      example: { title: 'canvas with fallback', code: '<canvas id="game" width="320" height="240">\n  Your browser does not support canvas.\n</canvas>' },
      starter: '<!-- TODO: canvas -->\n',
      solution: '<canvas id="chart" width="400" height="200">\n  Sales chart: your browser does not support canvas.\n</canvas>',
      checks: [
        { sel: 'canvas#chart', count: 1, msg: 'Add <canvas id="chart">' },
        { sel: 'canvas#chart', prop: { width: 400 }, msg: 'Set width="400"' },
        { sel: 'canvas#chart', prop: { height: 200 }, msg: 'Set height="200"' },
        { sel: 'canvas#chart', nonEmpty: true, msg: 'Add fallback text inside the canvas' },
      ],
      explain: '`<canvas>` is just an empty bitmap until JavaScript draws on it. The content between the tags is fallback content and also helps describe the chart.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 6,
      q: 'Draw a **filled orange rectangle** on `#c`: set `ctx.fillStyle = \'orange\'` and call `fillRect(20, 20, 100, 60)`. The checker then reads the pixel at (50, 50) and writes it into `#out` (orange = 255,165,0,255).',
      html: '<canvas id="c" width="200" height="120" style="border:1px solid #ccc"></canvas>\n<p id="out"></p>',
      example: { title: 'a blue square', code: "const ctx = document.getElementById('c').getContext('2d');\nctx.fillStyle = 'blue';\nctx.fillRect(10, 10, 40, 40);" },
      starter: `const ctx = document.getElementById('c').getContext('2d');
// TODO: set the colour and draw the rectangle
${PIXEL}
document.getElementById('out').textContent = px(50, 50);`,
      solution: `const ctx = document.getElementById('c').getContext('2d');
ctx.fillStyle = 'orange';
ctx.fillRect(20, 20, 100, 60);
${PIXEL}
document.getElementById('out').textContent = px(50, 50);`,
      checks: [
        { sel: '#out', textEq: '255,165,0,255', msg: 'The pixel at (50, 50) must be orange: set fillStyle before calling fillRect(20, 20, 100, 60)' },
      ],
      explain: '`fillStyle` must be set **before** drawing; it affects the shapes drawn after it. `fillRect(x, y, width, height)` starts at the top-left corner (20, 20), so (50, 50) is inside the rectangle.',
    },
    {
      type: 'code',
      lang: 'dom',
      mins: 7,
      q: 'Draw a **filled green circle** with centre (100, 60) and radius 40 using a path: `beginPath()`, `arc(...)` from 0 to `Math.PI * 2`, `fillStyle = \'green\'`, `fill()`. The checker reads the centre pixel (green = 0,128,0,255).',
      html: '<canvas id="c" width="200" height="120" style="border:1px solid #ccc"></canvas>\n<p id="out"></p>',
      example: { title: 'a triangle path', code: "ctx.beginPath();\nctx.moveTo(10, 100);\nctx.lineTo(60, 20);\nctx.lineTo(110, 100);\nctx.closePath();\nctx.fill();" },
      starter: `const ctx = document.getElementById('c').getContext('2d');
// TODO: draw the circle
${PIXEL}
document.getElementById('out').textContent = px(100, 60);`,
      solution: `const ctx = document.getElementById('c').getContext('2d');
ctx.beginPath();
ctx.arc(100, 60, 40, 0, Math.PI * 2);
ctx.fillStyle = 'green';
ctx.fill();
${PIXEL}
document.getElementById('out').textContent = px(100, 60);`,
      checks: [
        { sel: '#out', textEq: '0,128,0,255', msg: 'The centre pixel must be green: draw arc(100, 60, 40, 0, Math.PI * 2) and call fill() with fillStyle = "green"' },
      ],
      explain: 'Angles in `arc` are in **radians**: a full circle is `0` to `Math.PI * 2` (not 360). A path is only visible after `fill()` or `stroke()`; forgetting that is the most common bug. `beginPath()` starts a fresh shape so earlier paths are not redrawn.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which canvas methods/properties are correctly described?',
      options: ['strokeRect(x, y, w, h) draws only the outline', 'clearRect(x, y, w, h) erases an area to transparent', 'lineWidth sets the thickness of strokes', 'moveTo draws a line to a point', 'fillText("Hi", x, y) writes text'],
      answers: [0, 1, 2, 4],
      explain: '`moveTo` only **moves the pen** without drawing; `lineTo` adds a line, and `stroke()` actually paints it.',
    },
  ],
};
