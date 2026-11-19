const UI = `<button class="btn">Buy now</button>
<div class="card">Course card</div>
<div class="loader"></div>
<p class="price">999</p>
<ul class="steps">
  <li>Register</li>
  <li>Pay</li>
  <li>Learn</li>
  <li>Get certified</li>
</ul>
<input class="field" type="text" placeholder="Name">`;

export default {
  lesson: 'day-058-css-transitions-transform-animations-pseudo',
  minutes: 24,
  intro: 'Practise CSS transitions, 2D transforms, keyframe animations, pseudo-classes (:hover, :focus, :nth-child) and pseudo-elements (::before, ::after).',
  tasks: [
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Smooth button and card effects:\n- `.btn`: `background-color: #0d6efd` and `transition: background-color 0.3s ease`\n- `.btn:hover`: `background-color: #0b5ed7`\n- `.card`: `transform: translateY(-5px)` (lifts it a little) and `transition: transform 0.2s`',
      html: UI,
      example: { title: 'transition + hover', code: '.link { color: gray; transition: color 0.25s ease-in-out; }\n.link:hover { color: black; }\n.tile { transform: scale(1.05); }' },
      starter: '.btn {\n  /* TODO */\n}\n',
      solution: '.btn { background-color: #0d6efd; transition: background-color 0.3s ease; }\n.btn:hover { background-color: #0b5ed7; }\n.card { transform: translateY(-5px); transition: transform 0.2s; }',
      checks: [
        { sel: '.btn', style: { 'background-color': 'rgb(13, 110, 253)', 'transition-property': 'background-color', 'transition-duration': '0.3s' }, msg: '.btn needs background #0d6efd and a 0.3s background-color transition' },
        { sel: '.card', style: { transform: 'matrix(1, 0, 0, 1, 0, -5)' }, msg: '.card must be moved up with transform: translateY(-5px)' },
        { sel: '.card', style: { 'transition-property': 'transform', 'transition-duration': '0.2s' }, msg: '.card needs transition: transform 0.2s' },
      ],
      explain: 'A **transition** animates a property change (e.g. on :hover) instead of jumping. Put `transition` on the normal state so it works both ways. Transforms like `translateY` move an element visually without affecting layout; browsers report them as a matrix.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 6,
      q: 'Create a spinning loader with **@keyframes**:\n- define `@keyframes spin` from `transform: rotate(0deg)` to `transform: rotate(360deg)`\n- `.loader`: `width: 40px`, `height: 40px`, `border: 4px solid #ddd`, `border-top-color: #0d6efd`, `border-radius: 50%` and `animation: spin 1s linear infinite`',
      html: UI,
      example: { title: 'keyframe animation', code: '@keyframes pulse {\n  from { opacity: 1; }\n  to { opacity: 0.3; }\n}\n.dot { animation: pulse 2s ease-in-out infinite alternate; }' },
      starter: '@keyframes spin {\n  /* TODO */\n}\n',
      solution: '@keyframes spin {\n  from { transform: rotate(0deg); }\n  to { transform: rotate(360deg); }\n}\n.loader {\n  width: 40px;\n  height: 40px;\n  border: 4px solid #ddd;\n  border-top-color: #0d6efd;\n  border-radius: 50%;\n  animation: spin 1s linear infinite;\n}',
      checks: [
        { sel: '.loader', style: { 'animation-name': 'spin', 'animation-duration': '1s', 'animation-timing-function': 'linear', 'animation-iteration-count': 'infinite' }, msg: '.loader needs animation: spin 1s linear infinite' },
        { sel: '.loader', style: { 'border-top-color': 'rgb(13, 110, 253)', 'border-top-left-radius': '50%' }, msg: '.loader needs a blue top border and border-radius 50%' },
        { sel: '.loader', style: { width: '40px', height: '40px' }, msg: '.loader must be 40px × 40px' },
      ],
      explain: '`@keyframes` defines the steps; `animation` attaches them with a duration, timing function and iteration count. A circle (`border-radius: 50%`) with one coloured border side that rotates forever is the classic CSS spinner.',
    },
    {
      type: 'code',
      lang: 'css',
      mins: 5,
      q: 'Pseudo-classes and pseudo-elements:\n- `.price::before`: `content: "₹"` (show the rupee sign before the price)\n- `.steps li:nth-child(even)`: `background-color: #f1f3f5`\n- `.field:focus`: `outline: 2px solid #198754`',
      html: UI,
      example: { title: 'pseudo selectors', code: '.required::after { content: " *"; color: red; }\ntr:nth-child(odd) { background: #fafafa; }\ninput:focus { border-color: blue; }' },
      starter: '.price::before {\n  /* TODO */\n}\n',
      solution: '.price::before { content: "₹"; }\n.steps li:nth-child(even) { background-color: #f1f3f5; }\n.field:focus { outline: 2px solid #198754; }',
      checks: [
        { sel: '.steps li', index: 1, style: { 'background-color': 'rgb(241, 243, 245)' }, msg: 'The 2nd li (even) needs background #f1f3f5' },
        { sel: '.steps li', index: 3, style: { 'background-color': 'rgb(241, 243, 245)' }, msg: 'The 4th li (even) needs background #f1f3f5' },
        { sel: '.steps li', index: 0, style: { 'background-color': 'rgba(0, 0, 0, 0)' }, msg: 'Odd items (1st, 3rd) must keep a transparent background' },
      ],
      explain: '**Pseudo-elements** (`::before`, `::after`) create extra content that is not in the HTML and need the `content` property. **Pseudo-classes** select a state or position: `:nth-child(even)` = 2nd, 4th … and `:focus` = the field being typed in.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is animating `transform` and `opacity` recommended over animating `width`, `top` or `margin`?',
      options: [
        'transform and opacity are the only properties that can be animated',
        'They can be handled by the GPU (compositor) without recalculating layout, so animations stay smooth',
        'width cannot be animated at all',
        'There is no difference',
      ],
      answer: 1,
      explain: 'Changing width/top/margin forces the browser to recompute **layout** for every frame, which can stutter on phones. Transform and opacity changes are composited, giving 60 fps animations.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the transform function that makes an element **10% bigger** in both directions: `transform: ________;`',
      example: { title: 'transform functions', code: 'transform: rotate(45deg);\ntransform: translateX(20px);\ntransform: skewX(10deg);' },
      accept: ['scale(1.1)', 'scale(1.1, 1.1)', 'scale(110%)'],
      acceptRegex: ['^scale\\s*\\(\\s*(1\\.1|110%)\\s*(,\\s*(1\\.1|110%)\\s*)?\\)\\s*;?$'],
      explain: '`scale(1.1)` multiplies width and height by 1.1 (10% bigger) around the centre (`transform-origin`). `scale(0.9)` would shrink it. Several functions can be combined: `transform: translateY(-4px) scale(1.05);`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        '::before and ::after need a content property to appear',
        ':hover is a pseudo-class; ::first-letter is a pseudo-element',
        'transition-duration: 0s means the change happens instantly',
        'animation-iteration-count: infinite repeats the animation forever',
        'transform: translateX(50px) also pushes the neighbouring elements 50px',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Transforms are **visual only**: the element keeps its original space in the layout, so neighbours do not move. All other statements are true.',
    },
  ],
};
