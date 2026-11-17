const transitionHtml = `<button class="btn">Hover me</button>
<div class="card">Hover the card: it lifts up</div>
<div class="bar"><div class="fill"></div></div>
<p>Hover the grey bar: the fill grows with different timing functions.</p>
<div class="lane"><div class="ball linear">linear</div></div>
<div class="lane"><div class="ball ease-in-out">ease-in-out</div></div>
<div class="lane"><div class="ball bounce">cubic-bezier</div></div>`;

const transitionCss = `body { font-family: "Segoe UI", Arial, sans-serif; padding: 10px; }
.btn {
  padding: 10px 24px; border: 2px solid #2563eb; border-radius: 6px;
  background: white; color: #2563eb; font-weight: 600; cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease;     /* property duration timing */
}
.btn:hover { background-color: #2563eb; color: white; }
.card {
  width: 240px; margin: 16px 0; padding: 20px; background: #f8fafc; border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}
.card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2); }
.bar { width: 300px; height: 14px; background: #e2e8f0; border-radius: 7px; overflow: hidden; }
.fill { width: 10%; height: 100%; background: #16a34a; transition: width 1s ease-out 0.2s; }  /* 0.2s delay */
.bar:hover .fill { width: 100%; }
.lane { width: 320px; background: #f1f5f9; margin: 6px 0; }
.ball { width: 110px; padding: 6px; font-size: 12px; color: white; background: #7c3aed; border-radius: 999px; text-align: center; transition: margin-left 1.5s; }
.linear { transition-timing-function: linear; }
.ease-in-out { transition-timing-function: ease-in-out; }
.bounce { transition-timing-function: cubic-bezier(0.68, -0.55, 0.27, 1.55); }
.lane:hover .ball { margin-left: 210px; }`;

const transformHtml = `<div class="row">
  <div class="box">original</div>
  <div class="box t1">translate(20px, 10px)</div>
  <div class="box t2">rotate(15deg)</div>
  <div class="box t3">scale(1.2)</div>
  <div class="box t4">skewX(-15deg)</div>
  <div class="box t5">combined</div>
</div>
<div class="flip">
  <div class="flip-inner">
    <div class="front">Hover to flip</div>
    <div class="back">Back side!</div>
  </div>
</div>`;

const transformCss = `body { font-family: "Segoe UI", Arial, sans-serif; padding: 20px; }
.row { display: flex; flex-wrap: wrap; gap: 30px; margin-bottom: 30px; }
.box { width: 110px; height: 70px; padding: 6px; font-size: 12px; background: #bfdbfe; border: 2px solid #2563eb; }
.t1 { transform: translate(20px, 10px); }
.t2 { transform: rotate(15deg); }
.t3 { transform: scale(1.2); }
.t4 { transform: skewX(-15deg); }
.t5 { transform: translateX(10px) rotate(-10deg) scale(0.9); transform-origin: top left; }
.flip { width: 200px; height: 120px; perspective: 600px; }
.flip-inner { position: relative; width: 100%; height: 100%; transition: transform 0.6s; transform-style: preserve-3d; }
.flip:hover .flip-inner { transform: rotateY(180deg); }
.front, .back { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
                border-radius: 10px; color: white; font-weight: 600; backface-visibility: hidden; }
.front { background: #0f766e; }
.back  { background: #be185d; transform: rotateY(180deg); }`;

const animHtml = `<div class="loader"></div>
<div class="pulse">Live</div>
<div class="slide">I slide in from the left once</div>
<div class="bounce-ball"></div>
<button id="pause">Pause / play the loader</button>`;

const animCss = `body { font-family: "Segoe UI", Arial, sans-serif; padding: 20px; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
@keyframes pulse {
  0%   { transform: scale(1);   opacity: 1; }
  50%  { transform: scale(1.15); opacity: 0.6; }
  100% { transform: scale(1);   opacity: 1; }
}
@keyframes slideIn { from { transform: translateX(-120%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-40px); } }

.loader {
  width: 40px; height: 40px; border: 5px solid #e2e8f0; border-top-color: #2563eb; border-radius: 50%;
  animation: spin 1s linear infinite;            /* name duration timing iteration */
}
.pulse { display: inline-block; margin: 20px 0; padding: 4px 14px; background: #dc2626; color: white; border-radius: 999px;
         animation: pulse 1.5s ease-in-out infinite; }
.slide { padding: 10px; background: #fef3c7; border-left: 4px solid #d97706;
         animation: slideIn 0.8s ease-out 0.3s both; }      /* delay 0.3s, fill-mode both */
.bounce-ball { width: 30px; height: 30px; margin: 50px 0 10px; border-radius: 50%; background: #16a34a;
               animation: bounce 0.8s ease-in-out infinite; }
.paused { animation-play-state: paused; }`;

const animJs = `const loader = document.querySelector('.loader');
document.getElementById('pause').addEventListener('click', function () {
  loader.classList.toggle('paused');
  console.log('animation-play-state: ' + getComputedStyle(loader).animationPlayState);
});`;

const pseudoHtml = `<ul class="list">
  <li>Riya - 92</li><li>Arjun - 81</li><li>Kabir - 31</li><li>Neha - 74</li><li>Dev - 66</li>
</ul>
<a href="https://example.com" class="link">Visit example.com</a>
<form class="f">
  <input type="email" placeholder="Email (required)" required>
  <input type="text" placeholder="Disabled" disabled>
  <label><input type="checkbox"> I agree</label>
</form>
<p class="intro">CSS pseudo-elements can add content and style parts of text without extra HTML.</p>
<blockquote class="quote">Practice every day.</blockquote>
<span class="required-label">Full name</span>
<p><span class="tip" data-tip="I am a CSS-only tooltip">Hover me for a tooltip</span></p>`;

const pseudoCss = `body { font-family: "Segoe UI", Arial, sans-serif; padding: 10px; }
/* Structural pseudo-classes */
.list li:first-child { font-weight: 700; color: #16a34a; }
.list li:last-child { color: #64748b; }
.list li:nth-child(even) { background: #f1f5f9; }
.list li:nth-child(3) { text-decoration: line-through; color: #dc2626; }
.list li:not(:first-child):hover { background: #fef9c3; }

/* User-action pseudo-classes */
.link:link { color: #2563eb; }
.link:visited { color: #7c3aed; }
.link:hover { color: #db2777; }
.link:active { color: #dc2626; }
.f input:not([type="checkbox"]) { display: block; margin: 8px 0; padding: 6px; border: 2px solid #cbd5e1; border-radius: 4px; }
.f input:focus { outline: none; border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.25); }
.f input:invalid { border-color: #f87171; }
.f input:disabled { background: #e2e8f0; cursor: not-allowed; }
.f label:has(input:checked) { color: #16a34a; font-weight: 600; }

/* Pseudo-elements */
.intro::first-letter { font-size: 2em; font-weight: 700; color: #2563eb; }
.intro::first-line { text-transform: uppercase; }
.intro::selection { background: #fde68a; }
.quote::before { content: "\\201C"; font-size: 2em; color: #94a3b8; }
.quote::after  { content: "\\201D"; font-size: 2em; color: #94a3b8; }
.required-label::after { content: " *"; color: #dc2626; }
.f input::placeholder { color: #94a3b8; font-style: italic; }
.tip { position: relative; border-bottom: 1px dashed #334155; cursor: help; }
.tip::after {
  content: attr(data-tip);
  position: absolute; left: 0; top: 130%; white-space: nowrap;
  background: #0f172a; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;
  opacity: 0; transition: opacity 0.2s;
}
.tip:hover::after { opacity: 1; }`;

const pseudoJs = `console.log('nth-child(even) rows: ' + document.querySelectorAll('.list li:nth-child(even)').length);
console.log('invalid inputs now: ' + document.querySelectorAll('.f input:invalid').length);
console.log('quote ::before content: ' + getComputedStyle(document.querySelector('.quote'), '::before').content);`;

const loginHtml = `<div class="scene">
  <span class="bubble b1"></span><span class="bubble b2"></span><span class="bubble b3"></span>
  <form class="login" novalidate>
    <h2>Welcome Back</h2>
    <p class="sub">Login to Student Portal</p>
    <div class="field">
      <input type="email" id="email" required placeholder=" ">
      <label for="email">Email</label>
    </div>
    <div class="field">
      <input type="password" id="pwd" required minlength="6" placeholder=" ">
      <label for="pwd">Password</label>
    </div>
    <label class="remember"><input type="checkbox"> Remember me</label>
    <button type="submit" class="btn-login"><span>Login</span></button>
    <p class="links"><a href="#">Forgot password?</a></p>
  </form>
</div>`;

const loginCss = `* { box-sizing: border-box; }
body { margin: 0; font-family: "Segoe UI", Arial, sans-serif; }
.scene {
  position: relative; min-height: 100vh; overflow: hidden;
  display: flex; align-items: center; justify-content: center;
  background: linear-gradient(-45deg, #1e3a8a, #7c3aed, #db2777, #0ea5e9);
  background-size: 400% 400%;
  animation: gradientMove 12s ease infinite;
}
@keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

.bubble { position: absolute; bottom: -120px; border-radius: 50%; background: rgba(255, 255, 255, 0.15); animation: rise 10s linear infinite; }
.b1 { left: 10%; width: 80px; height: 80px; }
.b2 { left: 45%; width: 40px; height: 40px; animation-duration: 7s; animation-delay: 2s; }
.b3 { left: 80%; width: 110px; height: 110px; animation-duration: 13s; animation-delay: 1s; }
@keyframes rise { to { transform: translateY(-120vh) rotate(360deg); } }

.login {
  position: relative; z-index: 1; width: 320px; padding: 32px 28px;
  background: rgba(255, 255, 255, 0.95); border-radius: 16px; box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
  animation: popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
@keyframes popIn { from { opacity: 0; transform: translateY(30px) scale(0.9); } to { opacity: 1; transform: none; } }
.login h2 { margin: 0; text-align: center; color: #1e293b; }
.sub { margin: 4px 0 20px; text-align: center; color: #64748b; font-size: 14px; }

/* Floating labels using :focus and :placeholder-shown */
.field { position: relative; margin-bottom: 18px; }
.field input { width: 100%; padding: 14px 12px 6px; border: 2px solid #cbd5e1; border-radius: 8px; font-size: 15px; transition: border-color 0.3s; }
.field label { position: absolute; left: 12px; top: 12px; color: #94a3b8; pointer-events: none; transition: all 0.2s ease; }
.field input:focus { outline: none; border-color: #7c3aed; }
.field input:focus + label,
.field input:not(:placeholder-shown) + label { top: 2px; font-size: 11px; color: #7c3aed; }
.field input:not(:placeholder-shown):invalid { border-color: #ef4444; }
.field input:not(:placeholder-shown):valid { border-color: #22c55e; }
.shake { animation: shake 0.4s; }
@keyframes shake { 0%, 100% { transform: translateX(0); } 25%, 75% { transform: translateX(-8px); } 50% { transform: translateX(8px); } }

.remember { display: block; font-size: 14px; color: #475569; margin-bottom: 16px; }
.btn-login {
  position: relative; overflow: hidden; width: 100%; padding: 12px; border: none; border-radius: 8px;
  background: linear-gradient(90deg, #7c3aed, #db2777); color: white; font-size: 16px; font-weight: 600; cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}
.btn-login:hover { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(124, 58, 237, 0.4); }
.btn-login:active { transform: translateY(0) scale(0.98); }
.btn-login::before {          /* shine effect */
  content: ""; position: absolute; top: 0; left: -75%; width: 50%; height: 100%;
  background: linear-gradient(120deg, transparent, rgba(255, 255, 255, 0.5), transparent);
  transform: skewX(-20deg);
}
.btn-login:hover::before { left: 125%; transition: left 0.7s; }
.links { text-align: center; margin: 14px 0 0; font-size: 14px; }
.links a { color: #7c3aed; text-decoration: none; position: relative; }
.links a::after { content: ""; position: absolute; left: 0; bottom: -2px; width: 100%; height: 2px; background: #7c3aed;
                  transform: scaleX(0); transform-origin: left; transition: transform 0.3s; }
.links a:hover::after { transform: scaleX(1); }`;

const loginJs = `const form = document.querySelector('.login');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.remove('shake');
    void form.offsetWidth;            // restart the animation
    form.classList.add('shake');
    console.log('Invalid: shake animation played');
  } else {
    console.log('Valid: logging in...');
  }
});`;

export default {
  id: 'day-058-css-transitions-transform-animations-pseudo',
  title: 'CSS Transitions, Transform, Animations, Pseudo-classes and Pseudo-elements',
  module: 'Module 5: Frontend Development – HTML, CSS, JavaScript',
  day: 58,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Make interfaces feel alive: smooth state changes with transitions, move/rotate/scale with transform, multi-step @keyframes animations, style states with pseudo-classes (:hover, :focus, :nth-child, :invalid ...) and generate content with pseudo-elements (::before, ::after ...). Then build an animated login page.',
  objectives: [
    'Write transitions with property, duration, timing function and delay',
    'Apply 2D/3D transforms: translate, rotate, scale, skew and transform-origin',
    'Create @keyframes animations and control them with the animation-* properties',
    'Use user-action, form and structural pseudo-classes',
    'Use ::before, ::after, ::first-letter, ::placeholder and ::selection',
  ],
  theory: [
    {
      heading: 'Transitions',
      content: "A **transition** animates a property smoothly when its value changes (usually on `:hover`, `:focus` or when JS adds a class) instead of jumping instantly.\n\n- `transition-property`: which property (`background-color`, `transform`, `all`).\n- `transition-duration`: `0.3s` or `300ms`.\n- `transition-timing-function`: `ease` (default), `linear`, `ease-in`, `ease-out`, `ease-in-out`, `cubic-bezier(...)`, `steps(4)`.\n- `transition-delay`: wait before starting.\n- Shorthand: `transition: transform 0.3s ease-out 0.1s;` several separated by commas.\n\nPut the transition on the **normal** state so it plays both on hover and when leaving.",
      syntax: '.btn { transition: background-color 0.3s ease; }\n.btn:hover { background-color: navy; }',
      tip: 'Animate transform and opacity whenever possible: the browser can do them on the GPU without recalculating layout, so they stay smooth (60 fps). Animating width, top or margin is slower.',
    },
    {
      heading: 'Transform (2D and 3D)',
      content: "`transform` changes how an element is drawn without affecting the layout around it.\n- `translate(x, y)`, `translateX()`, `translateY()`: move.\n- `rotate(45deg)`: spin clockwise.\n- `scale(1.2)` / `scale(x, y)`: resize.\n- `skew(10deg)`, `skewX()`: slant.\n- Combine in one declaration: `transform: translateX(10px) rotate(10deg) scale(.9);` (applied right to left; order matters).\n- `transform-origin`: the pivot point (default `center`; e.g. `top left`).\n- 3D: `rotateX()`, `rotateY()`, `perspective: 600px` on the parent, `transform-style: preserve-3d`, `backface-visibility: hidden` (card flip).\n\nCentering trick: `position:absolute; top:50%; left:50%; transform: translate(-50%,-50%);`",
    },
    {
      heading: '@keyframes animations',
      content: "Transitions go from A to B once on a change. **Animations** can have many steps, start by themselves and repeat.\n1. Define steps: `@keyframes name { from {...} to {...} }` or with percentages `0% {...} 50% {...} 100% {...}`.\n2. Attach: `animation: name duration timing delay iteration-count direction fill-mode;`\n\n- `animation-iteration-count`: `3` or `infinite`.\n- `animation-direction`: `normal`, `reverse`, `alternate` (back and forth).\n- `animation-fill-mode`: `forwards` (keep the last frame), `backwards` (apply first frame during the delay), `both`.\n- `animation-play-state`: `running` / `paused`.\n\nUse cases: loaders/spinners, pulsing badges, entrance effects, skeleton screens, error shake.",
      syntax: '@keyframes spin { to { transform: rotate(360deg); } }\n.loader { animation: spin 1s linear infinite; }',
      tip: 'Respect users who get motion sickness: @media (prefers-reduced-motion: reduce) { * { animation: none !important; transition: none !important; } }',
    },
    {
      heading: 'Pseudo-classes (state)',
      content: "A **pseudo-class** (single colon) selects an element in a particular state or position.\n- **User action**: `:hover`, `:active` (being clicked), `:focus` (has keyboard focus), `:focus-visible`, `:focus-within` (a child has focus).\n- **Links**: `:link`, `:visited` (order L-V-H-A: link, visited, hover, active).\n- **Forms**: `:checked`, `:disabled`, `:enabled`, `:required`, `:optional`, `:valid`, `:invalid`, `:placeholder-shown`, `:read-only`.\n- **Structural**: `:first-child`, `:last-child`, `:nth-child(2)`, `:nth-child(odd|even)`, `:nth-child(3n+1)`, `:nth-of-type()`, `:only-child`, `:empty`.\n- **Logic**: `:not(.x)`, `:is(h1, h2)`, `:has(img)` (parent selector, modern browsers).",
      syntax: 'tr:nth-child(even) { background: #f1f5f9; }\ninput:focus { border-color: #2563eb; }\nli:not(:last-child) { border-bottom: 1px solid #ddd; }',
    },
    {
      heading: 'Pseudo-elements (parts)',
      content: "A **pseudo-element** (double colon) styles a PART of an element or inserts generated content.\n- `::before` / `::after`: insert a virtual child at the start/end. **Requires `content`** (even `content: \"\"`). Used for icons, quotes, required stars, ribbons, underlines, overlays, tooltips (`content: attr(data-tip)`), clearfix.\n- `::first-letter`, `::first-line`: drop caps, upper-case first line.\n- `::placeholder`: style input placeholder text.\n- `::selection`: highlight colour when the user selects text.\n- `::marker`: list bullet/number.\n\nGenerated content is not in the DOM (cannot be selected by JS or copied) and screen readers may skip it, so never put important text in it.",
      tip: 'Pseudo-class = state (:hover), pseudo-element = part (::before). The single colon form :before still works for old browsers but write :: today.',
    },
  ],
  examples: [
    {
      title: 'Transitions on hover',
      scenario: 'A button that fades its colours, a card that lifts, a progress fill and three balls showing timing functions.',
      steps: ['Create transitions.html', 'Add transition on the normal state of each element', 'Add the :hover rules that change the values', 'Hover each element and compare speeds'],
      code: transitionCss,
      playground: { html: transitionHtml, css: transitionCss, js: '' },
      result: 'Button turns smoothly blue with white text; the card rises 8px with a bigger shadow; the green bar fills after a 0.2s pause over 1s; the three purple pills slide right: linear at a constant speed, ease-in-out slow-fast-slow, cubic-bezier overshooting and bouncing back.',
      explanation: 'Changing a property without transition jumps instantly. Because the transition is declared on the normal state, the reverse animation also plays when the mouse leaves.',
    },
    {
      title: 'Transform gallery and 3D card flip',
      scenario: 'Compare each transform function and build a flip card.',
      steps: ['Create transform.html', 'Apply one transform per box', 'Build .flip > .flip-inner > .front + .back', 'Add perspective, preserve-3d, backface-visibility and rotateY on hover'],
      code: transformCss,
      playground: { html: transformHtml, css: transformCss, js: '' },
      result: 'Six boxes: the original, one shifted right/down, one tilted 15 degrees, one 20% bigger, one slanted, one combined (moved, tilted left, smaller, pivoting from the top-left). A teal card that flips in 3D to a pink "Back side!" on hover.',
      explanation: 'Transformed boxes overlap neighbours because transform does not change layout space. backface-visibility: hidden hides each face when it points away, and the back starts pre-rotated 180deg.',
    },
    {
      title: '@keyframes: loader, pulse, slide-in, bounce',
      scenario: 'Four common UI animations and a button that pauses one using animation-play-state.',
      steps: ['Create animations.html', 'Define four @keyframes rules', 'Attach them with the animation shorthand', 'Click the button to pause/resume the spinner'],
      code: animCss + '\n\n// script.js\n' + animJs,
      playground: { html: animHtml, css: animCss, js: animJs },
      result: 'A spinning blue loader ring, a red "Live" badge pulsing, a yellow notice sliding in from the left after 0.3s and staying, and a green ball bouncing.\nConsole after clicking once:\nanimation-play-state: paused\n(and "running" after the second click)',
      explanation: 'fill-mode both keeps the slide element hidden during the delay (first frame) and in place after finishing (last frame). infinite repeats forever.',
    },
    {
      title: 'Pseudo-classes and pseudo-elements',
      scenario: 'Style a marks list by position, form fields by state, and add quotes, a required star, a drop cap and a CSS-only tooltip.',
      steps: ['Create pseudo.html', 'Add structural rules (:first-child, :nth-child) to the list', 'Add :focus, :invalid, :disabled to inputs', 'Add ::before/::after, ::first-letter and the data-tip tooltip', 'Read the console'],
      code: pseudoCss,
      playground: { html: pseudoHtml, css: pseudoCss, js: pseudoJs },
      result: 'Riya bold green, alternate rows grey, Kabir red struck through, Dev grey; hovering rows (except the first) turns them yellow. Email input has a red border while empty (invalid), blue glow on focus; disabled input greyed. Paragraph with a big blue first letter and upper-case first line; quote wrapped in big curly quotes; "Full name *" with a red star; hovering "Hover me" shows a dark tooltip.\nConsole:\nnth-child(even) rows: 2\ninvalid inputs now: 1\nquote ::before content: "“"',
      explanation: ':nth-child(even) matches Arjun and Neha (positions 2 and 4). Only the required empty email is :invalid (disabled fields are not validated). attr(data-tip) reads the attribute value into the ::after content.',
    },
    {
      title: 'Project: Animated login page',
      scenario: 'Day 58 task: a login page with an animated gradient background, floating bubbles, a pop-in card, floating labels, valid/invalid borders, a shining button and a shake on invalid submit.',
      steps: ['Create login.html with .scene, three .bubble spans and the form', 'Animate the background with a 400% gradient and background-position keyframes', 'Add popIn on the card and rise on the bubbles', 'Build floating labels with :focus + label and :not(:placeholder-shown) + label', 'Add the ::before shine and ::after underline effects', 'Add the small submit script; click Login with empty fields, then fill valid values'],
      code: '<!-- login.html -->\n' + loginHtml + '\n\n/* login.css */\n' + loginCss + '\n\n// login.js\n' + loginJs,
      playground: { html: loginHtml, css: loginCss, js: loginJs },
      result: 'A full-screen gradient slowly shifting between blue, purple, pink and sky blue with translucent bubbles rising. The white login card pops in with a slight bounce. Labels sit inside the inputs and float up in purple when focused or filled; borders turn green when valid and red when invalid. The button lifts with a light sweep on hover; "Forgot password?" gets an animated underline. Clicking Login with empty fields shakes the card and logs "Invalid: shake animation played"; with a valid email and 6+ character password it logs "Valid: logging in...".',
      explanation: 'placeholder=" " (a space) lets :placeholder-shown detect an empty input, which powers the floating labels without JS. void form.offsetWidth forces a reflow so removing and re-adding .shake restarts the animation. Real validation with JS comes on Day 61.',
    },
  ],
  interview: [
    { q: 'Difference between transition and animation?', a: 'A transition animates between two states when a property changes (needs a trigger like :hover). An animation uses @keyframes with any number of steps, can start automatically, loop, alternate and be paused.', level: 'Easy' },
    { q: 'Which properties are best to animate for performance?', a: 'transform and opacity: they can be composited on the GPU without layout or paint recalculation. Avoid animating width, height, top, left, margin.', level: 'Medium' },
    { q: 'What does animation-fill-mode: forwards do?', a: 'Keeps the styles of the last keyframe after the animation ends instead of jumping back to the original styles.', level: 'Medium' },
    { q: 'Does transform affect layout of other elements?', a: 'No. The element keeps its original space in the flow; only its drawing is moved/rotated/scaled, so it may overlap others.', level: 'Medium' },
    { q: 'Pseudo-class vs pseudo-element?', a: 'Pseudo-class (:hover, :nth-child) selects an element in a state/position; pseudo-element (::before, ::first-letter) selects or creates a part of an element.', level: 'Easy' },
    { q: 'Why does my ::before not show?', a: 'The content property is missing; ::before/::after are only generated when content is set (content: "" for decorative boxes). Also check display/size for empty content.', level: 'Easy' },
    { q: 'What does li:nth-child(3n+1) select?', a: 'Items 1, 4, 7, 10 ... (n = 0, 1, 2 ...).', level: 'Medium' },
    { q: 'What is the LVHA order and why?', a: ':link, :visited, :hover, :active. They have equal specificity, so later rules win; this order ensures hover and active states override link/visited colours.', level: 'Medium' },
    { q: 'How do you centre an absolutely positioned element of unknown size?', a: 'top: 50%; left: 50%; transform: translate(-50%, -50%);', level: 'Medium' },
    { q: 'What is :focus-within?', a: 'Matches an element if it or any descendant has focus, e.g. highlight a whole form group while one of its inputs is focused.', level: 'Hard' },
    { q: 'How do you respect users who prefer less motion?', a: 'Use the prefers-reduced-motion media query to disable or simplify animations and transitions.', level: 'Hard' },
  ],
  practice: [
    { task: 'Make a button that grows 10% and gets a shadow on hover over 0.25s, and shrinks slightly while clicked.', hint: 'transition on transform, :hover scale(1.1), :active scale(0.95).', solution: '.btn { transition: transform .25s, box-shadow .25s; }\n.btn:hover { transform: scale(1.1); box-shadow: 0 6px 14px rgba(0,0,0,.2); }\n.btn:active { transform: scale(.95); }' },
    { task: 'Create a three-dot "typing..." loader where each dot bounces one after another.', hint: 'One @keyframes; different animation-delay per dot.', solution: '<div class="dots"><span></span><span></span><span></span></div>\n\n.dots span { display: inline-block; width: 10px; height: 10px; margin: 0 3px; border-radius: 50%; background: #2563eb; animation: up .6s ease-in-out infinite alternate; }\n.dots span:nth-child(2) { animation-delay: .2s; }\n.dots span:nth-child(3) { animation-delay: .4s; }\n@keyframes up { to { transform: translateY(-10px); } }' },
    { task: 'Zebra-stripe a table, highlight the hovered row and make the first column bold.', hint: 'tbody tr:nth-child(even), tr:hover, td:first-child.', solution: 'tbody tr:nth-child(even) { background: #f8fafc; }\ntbody tr:hover { background: #fef9c3; }\ntd:first-child { font-weight: 700; }' },
    { task: 'Add a red * after every label of a required field, using only CSS (labels have class "req").', hint: '::after with content.', solution: 'label.req::after { content: " *"; color: #dc2626; }' },
    { task: 'Create an image card that zooms the image slightly and shows a dark caption overlay on hover.', hint: 'overflow hidden on card; scale on img; ::after or caption with opacity transition.', solution: '<div class="pic"><img src="https://picsum.photos/300/200" alt=""><span class="cap">Campus</span></div>\n\n.pic { position: relative; width: 300px; overflow: hidden; border-radius: 8px; }\n.pic img { display: block; width: 100%; transition: transform .4s; }\n.pic:hover img { transform: scale(1.1); }\n.cap { position: absolute; inset: auto 0 0 0; padding: 10px; background: rgba(0,0,0,.6); color: #fff; opacity: 0; transition: opacity .3s; }\n.pic:hover .cap { opacity: 1; }' },
  ],
  quiz: [
    { question: 'Which rule defines the steps of a CSS animation?', options: ['@animation', '@keyframes', '@frames', '@transition'], answer: 1, explanation: '@keyframes name { ... } defines the steps.' },
    { question: 'transition: opacity 0.5s ease 1s; What is 1s?', options: ['Duration', 'Iteration count', 'Delay', 'Timing function'], answer: 2, explanation: 'The first time value is duration, the second is delay.' },
    { question: 'Which selector inserts content after an element?', options: ['::after', ':after-content', ':last-child', '::marker'], answer: 0, explanation: '::after (with the content property) generates a last child.' },
    { question: 'Which pseudo-class matches an input that currently has keyboard focus?', options: [':active', ':hover', ':checked', ':focus'], answer: 3, explanation: ':focus matches the focused element.' },
    { question: 'transform: rotate(90deg) on a box. What happens to neighbouring elements?', options: ['They move to make room', 'They are rotated too', 'Nothing; layout is unchanged', 'They are hidden'], answer: 2, explanation: 'Transforms are visual only; the original layout space is kept.' },
  ],
};
