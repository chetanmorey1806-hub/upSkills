export default {
  id: 'day-25-transitions-and-transforms',
  title: 'Transitions and Transforms (translate, rotate, scale, skew)',
  module: 'Module 6: Visual Effects & Animation',
  day: 25,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Transforms move, rotate, scale and skew elements without disturbing the layout; transitions animate the change smoothly from one state to another. Together they create polished hover effects, buttons, cards and menus.',
  objectives: [
    'Apply 2D transforms: translate, rotate, scale, skew and combine them in the right order',
    'Change the pivot point with transform-origin and try basic 3D with perspective',
    'Animate property changes with transition-property, duration, timing-function and delay',
    'Know which properties are cheap to animate (transform, opacity) for 60fps performance',
  ],
  theory: [
    {
      heading: 'What is a transform?',
      content: `The \`transform\` property visually changes an element's shape or position **without affecting the layout** around it. Neighbours don't move; the element is drawn somewhere else, like a sticker you slide around on glass.

2D transform functions:
- \`translate(x, y)\` / \`translateX()\` / \`translateY()\` – move
- \`rotate(45deg)\` – turn clockwise (negative = anticlockwise; also \`turn\` units: \`0.5turn\`)
- \`scale(1.2)\` / \`scale(x, y)\` – grow/shrink (1 = original)
- \`skew(10deg, 0)\` / \`skewX()\` – slant

Percentages in translate refer to the **element's own size**: \`translateX(100%)\` moves it by its own width.`,
      syntax: `.box { transform: translateX(50px) rotate(15deg) scale(1.1); }`,
      tip: 'Modern CSS also has individual properties: translate: 10px 0; rotate: 15deg; scale: 1.1; – easier to animate separately.',
    },
    {
      heading: 'Order and transform-origin',
      content: `Multiple functions are applied **right to left** (each one changes the coordinate system for the next). So \`rotate(45deg) translateX(100px)\` is different from \`translateX(100px) rotate(45deg)\`.

Also, a second \`transform\` declaration **replaces** the first – it doesn't add. On hover you must repeat everything you want to keep.

\`transform-origin\` sets the pivot point. Default is the center (\`50% 50%\`).
- \`transform-origin: top left;\` – rotate like a door hinge in the corner
- \`transform-origin: bottom center;\` – scale from the bottom (e.g. bars in a chart)`,
      syntax: `.door { transform-origin: left center; transform: rotateY(-60deg); }`,
    },
    {
      heading: '3D basics: perspective',
      content: `Transforms can also be 3D: \`rotateX()\`, \`rotateY()\`, \`translateZ()\`, \`rotate3d()\`.

To see depth, the parent needs \`perspective\` (distance of the viewer, e.g. \`800px\` – smaller = stronger effect). Use \`transform-style: preserve-3d\` to keep children in 3D space and \`backface-visibility: hidden\` to hide the back of a flipped card.

Classic use: flip cards that show a back face on hover.`,
      syntax: `.scene { perspective: 800px; }
.card  { transform-style: preserve-3d; transition: transform .6s; }
.scene:hover .card { transform: rotateY(180deg); }`,
    },
    {
      heading: 'Transitions: animating between states',
      content: `A **transition** tells the browser: "when this property changes, animate it over time instead of jumping."

Sub-properties:
- \`transition-property\` – what to animate (\`transform\`, \`background-color\`, \`all\`)
- \`transition-duration\` – how long (\`0.3s\`, \`200ms\`)
- \`transition-timing-function\` – speed curve: \`ease\` (default), \`linear\`, \`ease-in\`, \`ease-out\`, \`ease-in-out\`, \`cubic-bezier()\`, \`steps()\`
- \`transition-delay\` – wait before starting

Shorthand: \`transition: transform 0.3s ease-out 0s;\`
Multiple: \`transition: transform .3s, opacity .2s;\`

Put the transition on the **base** state (not just \`:hover\`) so it animates both in **and** out.`,
      syntax: `.btn {
  transition: transform 200ms ease-out, box-shadow 200ms;
}
.btn:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgb(0 0 0 / .2); }`,
      tip: 'Avoid transition: all – it animates things you didn\'t intend and is slower. List properties explicitly.',
    },
    {
      heading: 'Performance and accessibility',
      content: `Not all properties are equal:
- **Cheap (GPU-composited):** \`transform\`, \`opacity\` → smooth 60fps
- **Expensive (trigger layout/reflow):** \`width\`, \`height\`, \`top\`, \`left\`, \`margin\`

So animate \`transform: translateX()\` instead of \`left\`, and \`scale()\` instead of \`width\`.

Properties like \`display\` can't be transitioned (discrete); use \`opacity\` + \`visibility\` for fade in/out.

Respect users who get dizzy from motion:
\`@media (prefers-reduced-motion: reduce) { * { transition-duration: 0.01ms !important; } }\`

**Coming next:** Day 26 – keyframe animations that run on their own, without hover.`,
    },
  ],
  examples: [
    {
      title: 'Transform functions gallery',
      scenario: 'Hover each box to see translate, rotate, scale and skew in action.',
      steps: [
        'Create four boxes with labels',
        'Add a transition on all boxes',
        'Give each a different transform on :hover',
        'Run and hover each box',
      ],
      code: `.box { transition: transform .4s ease; }
.t:hover { transform: translateY(-20px); }
.r:hover { transform: rotate(45deg); }
.s:hover { transform: scale(1.3); }
.k:hover { transform: skewX(-20deg); }`,
      playground: {
        html: `<div class="row">
  <div class="box t">translate</div>
  <div class="box r">rotate</div>
  <div class="box s">scale</div>
  <div class="box k">skew</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 40px 16px; }
.row { display: flex; gap: 24px; flex-wrap: wrap; justify-content: center; }
.box { width: 100px; height: 100px; display: grid; place-items: center; color: #fff; font-weight: 700; border-radius: 12px; cursor: pointer; transition: transform .4s ease; }
.t { background: #2563eb; } .r { background: #db2777; } .s { background: #16a34a; } .k { background: #ea580c; }
.t:hover { transform: translateY(-20px); }
.r:hover { transform: rotate(45deg); }
.s:hover { transform: scale(1.3); }
.k:hover { transform: skewX(-20deg); }`,
      },
      result: 'Hovering moves the blue box up, rotates the pink one, enlarges the green one and slants the orange one – smoothly, and back again on mouse-out.',
      explanation: 'The transition on the base .box state animates both directions. Neighbouring boxes don\'t move because transforms don\'t affect layout.',
    },
    {
      title: 'Lift-on-hover product card',
      scenario: 'A product card that rises, casts a deeper shadow and zooms its image when hovered.',
      steps: [
        'Create a card with an image inside an overflow:hidden wrapper',
        'Transition transform and box-shadow on the card',
        'On hover translateY(-6px) the card and scale(1.08) the image',
        'Run and hover',
      ],
      code: `.card { transition: transform .25s ease-out, box-shadow .25s; }
.card:hover { transform: translateY(-6px); box-shadow: 0 16px 30px rgb(0 0 0 / .18); }
.card:hover img { transform: scale(1.08); }`,
      playground: {
        html: `<article class="card">
  <div class="media"><img src="https://picsum.photos/seed/shoe/400/300" alt="Product"></div>
  <div class="body"><h3>Running Shoes</h3><p>₹2,999</p></div>
</article>`,
        css: `body { font-family: system-ui, sans-serif; padding: 40px; background: #f1f5f9; }
.card { width: 240px; background: #fff; border-radius: 14px; overflow: hidden; box-shadow: 0 2px 6px rgb(0 0 0 / .08); transition: transform .25s ease-out, box-shadow .25s; cursor: pointer; }
.card:hover { transform: translateY(-6px); box-shadow: 0 16px 30px rgb(0 0 0 / .18); }
.media { overflow: hidden; }
.media img { display: block; width: 100%; transition: transform .5s ease; }
.card:hover .media img { transform: scale(1.08); }
.body { padding: 12px 16px; }
.body h3 { margin: 0 0 4px; }`,
      },
      result: 'On hover the card floats up with a bigger shadow, and the photo zooms in gently inside its frame.',
      explanation: 'Only transform and box-shadow animate. overflow: hidden on .media clips the zoomed image so it stays inside the card.',
    },
    {
      title: 'Timing functions race',
      scenario: 'Compare linear, ease, ease-in, ease-out and steps() by hovering the track.',
      steps: [
        'Create a .track containing five balls',
        'Give each ball a different transition-timing-function',
        'On .track:hover translate every ball to the right',
        'Run and hover the track',
      ],
      code: `.track:hover .ball { transform: translateX(220px); }
.linear { transition-timing-function: linear; }
.steps  { transition-timing-function: steps(5); }`,
      playground: {
        html: `<p>Hover the grey area ↓</p>
<div class="track">
  <div class="ball linear">linear</div>
  <div class="ball ease">ease</div>
  <div class="ball in">ease-in</div>
  <div class="ball out">ease-out</div>
  <div class="ball steps">steps(5)</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
.track { max-width: 320px; background: #e5e7eb; padding: 10px; border-radius: 10px; display: grid; gap: 8px; }
.ball { width: 80px; padding: 6px 0; text-align: center; font-size: 12px; color: #fff; background: #7c3aed; border-radius: 999px; transition: transform 2s; }
.track:hover .ball { transform: translateX(220px); }
.linear { transition-timing-function: linear; }
.ease { transition-timing-function: ease; }
.in { transition-timing-function: ease-in; }
.out { transition-timing-function: ease-out; }
.steps { transition-timing-function: steps(5); }`,
      },
      result: 'All five pills travel to the right over 2 seconds but at different speeds; the steps(5) pill jumps in five discrete steps.',
      explanation: 'The same duration and distance with different easing curves shows how timing functions change the "feel" of motion.',
    },
    {
      title: '3D flip card',
      scenario: 'A flash card that flips over on hover to reveal the answer.',
      steps: [
        'Wrap front and back faces in .card inside .scene',
        'Give .scene perspective and .card preserve-3d with a transition',
        'Rotate the back face 180deg and hide backfaces',
        'Rotate .card on hover. Run and hover',
      ],
      code: `.scene { perspective: 800px; }
.card { transform-style: preserve-3d; transition: transform .6s; }
.scene:hover .card { transform: rotateY(180deg); }
.face { backface-visibility: hidden; }
.back { transform: rotateY(180deg); }`,
      playground: {
        html: `<div class="scene">
  <div class="card">
    <div class="face front">What does CSS stand for?</div>
    <div class="face back">Cascading Style Sheets</div>
  </div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 260px; }
.scene { width: 260px; height: 160px; perspective: 800px; }
.card { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .6s; }
.scene:hover .card { transform: rotateY(180deg); }
.face { position: absolute; inset: 0; display: grid; place-items: center; padding: 16px; text-align: center; border-radius: 14px; color: #fff; font-weight: 700; backface-visibility: hidden; }
.front { background: #0284c7; }
.back { background: #059669; transform: rotateY(180deg); }`,
      },
      result: 'A blue card with a question flips in 3D to a green card showing the answer when hovered.',
      explanation: 'perspective gives depth, preserve-3d keeps both faces in 3D space, and backface-visibility hides whichever face points away.',
    },
  ],
  interview: [
    { q: 'What is the difference between a transition and an animation?', a: 'A transition animates between two states when a property changes (needs a trigger like :hover or a class change). A keyframe animation can run automatically, loop, and define many intermediate steps.', level: 'Easy' },
    { q: 'Does transform affect document layout?', a: 'No. Transforms are applied visually after layout; surrounding elements keep their positions.', level: 'Easy' },
    { q: 'Why animate transform instead of top/left?', a: 'transform and opacity can be handled by the GPU compositor without recalculating layout or repainting, giving smoother 60fps animations. top/left trigger layout on every frame.', level: 'Medium' },
    { q: 'What is transform-origin?', a: 'The pivot point for transforms like rotate and scale. Default is the element center (50% 50%).', level: 'Easy' },
    { q: 'Does the order of transform functions matter?', a: 'Yes. Functions are applied right to left, each changing the coordinate system, so translate then rotate differs from rotate then translate.', level: 'Medium' },
    { q: 'Where should you put the transition property – on :hover or the base state?', a: 'On the base state, so the change animates both when entering and leaving the hover state.', level: 'Medium' },
    { q: 'Can you transition display: none to block?', a: 'Traditionally no, display is discrete. Use opacity and visibility (or transform) instead. Newer browsers support transition-behavior: allow-discrete with @starting-style.', level: 'Hard' },
    { q: 'What are timing functions?', a: 'They define the speed curve of a transition: linear, ease, ease-in, ease-out, ease-in-out, cubic-bezier() and steps().', level: 'Easy' },
    { q: 'What does perspective do?', a: 'Sets the distance between the viewer and the z=0 plane, giving 3D-transformed children a sense of depth. Smaller values create stronger distortion.', level: 'Medium' },
    { q: 'How do you respect users who prefer reduced motion?', a: 'Use @media (prefers-reduced-motion: reduce) to disable or shorten transitions and animations.', level: 'Medium' },
    { q: 'What does translate(-50%, -50%) use as the reference for percentages?', a: 'The element\'s own width and height (its border box).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a button that grows 5% and changes colour smoothly on hover and shrinks slightly when clicked (:active).',
      hint: 'transition on base; scale(1.05) on hover; scale(.97) on active.',
      solution: `<style>
  .btn { padding: 12px 24px; background: #2563eb; color: #fff; border: 0; border-radius: 8px; transition: transform .15s, background-color .2s; }
  .btn:hover { transform: scale(1.05); background: #1d4ed8; }
  .btn:active { transform: scale(.97); }
</style>
<button class="btn">Click me</button>`,
    },
    {
      task: 'Make an animated underline that grows from the left under a link on hover.',
      hint: '::after with scaleX(0) → scaleX(1) and transform-origin: left.',
      solution: `<style>
  a.fancy { position: relative; text-decoration: none; color: #111; }
  a.fancy::after { content: ""; position: absolute; left: 0; bottom: -3px; width: 100%; height: 2px; background: crimson; transform: scaleX(0); transform-origin: left; transition: transform .3s; }
  a.fancy:hover::after { transform: scaleX(1); }
</style>
<a class="fancy" href="#">Hover me</a>`,
    },
    {
      task: 'Create a hamburger icon (3 bars) that turns into an X when a checkbox is checked.',
      hint: 'Rotate the first and last bars ±45deg, fade the middle one.',
      solution: `<style>
  #m { display: none; }
  label { display: inline-grid; gap: 5px; cursor: pointer; }
  label span { width: 30px; height: 3px; background: #111; transition: transform .3s, opacity .3s; }
  #m:checked + label span:nth-child(1) { transform: translateY(8px) rotate(45deg); }
  #m:checked + label span:nth-child(2) { opacity: 0; }
  #m:checked + label span:nth-child(3) { transform: translateY(-8px) rotate(-45deg); }
</style>
<input type="checkbox" id="m"><label for="m"><span></span><span></span><span></span></label>`,
    },
    {
      task: 'Build a tooltip that fades and slides up into view on hover without using display.',
      hint: 'opacity 0 + visibility hidden + translateY(6px) → opacity 1 + visible + translateY(0).',
      solution: `<style>
  .tip { position: relative; display: inline-block; }
  .tip .text { position: absolute; bottom: 120%; left: 50%; transform: translate(-50%, 6px); background: #111; color: #fff; padding: 6px 10px; border-radius: 6px; white-space: nowrap; opacity: 0; visibility: hidden; transition: opacity .2s, transform .2s, visibility .2s; }
  .tip:hover .text { opacity: 1; visibility: visible; transform: translate(-50%, 0); }
</style>
<p style="margin-top:60px"><span class="tip">Hover me<span class="text">Hello tooltip!</span></span></p>`,
    },
  ],
  quiz: [
    { question: 'Which transform function moves an element?', options: ['rotate()', 'scale()', 'translate()', 'skew()'], answer: 2, explanation: 'translate() moves along the X and/or Y axis.' },
    { question: 'Which pair of properties is cheapest to animate?', options: ['width and height', 'transform and opacity', 'margin and padding', 'top and left'], answer: 1, explanation: 'They can be composited on the GPU without layout.' },
    { question: 'transition: transform 0.3s ease-in 0.1s – what is 0.1s?', options: ['Delay', 'Duration', 'Iteration count', 'Timing function'], answer: 0, explanation: 'The second time value in the shorthand is the delay.' },
    { question: 'What is the default transform-origin?', options: ['top left', '0 0', 'bottom center', '50% 50% (center)'], answer: 3, explanation: 'Transforms pivot around the element\'s center by default.' },
    { question: 'Which property is required on a parent to see 3D depth?', options: ['z-index', 'perspective', 'transform-origin', 'backface-visibility'], answer: 1, explanation: 'perspective defines viewer distance for 3D children.' },
  ],
};
