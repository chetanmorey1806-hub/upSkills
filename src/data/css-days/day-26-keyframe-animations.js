export default {
  id: 'day-26-keyframe-animations',
  title: 'Keyframe Animations',
  module: 'Module 6: Visual Effects & Animation',
  day: 26,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'With @keyframes you define multi-step animations that run on their own – loaders, pulsing badges, bouncing icons, entrance effects. Learn every animation sub-property and how to keep animations smooth and accessible.',
  objectives: [
    'Define animations with @keyframes using from/to and percentage steps',
    'Control animations with name, duration, timing-function, delay, iteration-count, direction, fill-mode and play-state',
    'Write the animation shorthand and run multiple animations on one element',
    'Build common UI animations (spinner, pulse, fade-in, typing) and respect prefers-reduced-motion',
  ],
  theory: [
    {
      heading: 'Transitions vs keyframe animations',
      content: `On Day 25, transitions animated from state A to state B when something **triggered** a change (like hover).

**Keyframe animations** are more powerful:
- They start **automatically** (on page load or when a class is added)
- They can have **many steps** (0%, 25%, 60%, 100%…)
- They can **loop** forever or a fixed number of times
- They can play **backwards** or alternate

Analogy: a transition is a door that swings when you push it. A keyframe animation is a cartoon flipbook – you draw each key page and the browser fills in the in-between frames ("tweening").`,
    },
    {
      heading: 'Defining @keyframes',
      content: `You give the animation a **name** and describe styles at points in time:

- \`from\` = \`0%\`, \`to\` = \`100%\`
- Any percentage in between: \`25%\`, \`50%\`…
- Several percentages can share styles: \`0%, 100% { ... }\`

The browser interpolates every frame between keyframes. Then you **attach** the animation to an element with the \`animation\` property.`,
      syntax: `@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-30px); }
}
.ball { animation: bounce 1s ease-in-out infinite; }`,
      tip: 'Keyframe names are case-sensitive and should be descriptive: fade-in, spin, pulse.',
    },
    {
      heading: 'The animation sub-properties',
      content: `- \`animation-name\` – which @keyframes to use
- \`animation-duration\` – length of one cycle (\`2s\`, \`500ms\`) – **required**, default is 0s (nothing happens)
- \`animation-timing-function\` – \`ease\`, \`linear\`, \`ease-in-out\`, \`steps(n)\`, \`cubic-bezier()\`
- \`animation-delay\` – wait before starting (negative values start part-way through!)
- \`animation-iteration-count\` – \`1\`, \`3\`, \`infinite\`
- \`animation-direction\` – \`normal\`, \`reverse\`, \`alternate\` (forward then back), \`alternate-reverse\`
- \`animation-fill-mode\` – what styles apply before/after: \`none\`, \`forwards\` (keep last frame), \`backwards\` (apply first frame during delay), \`both\`
- \`animation-play-state\` – \`running\` / \`paused\` (great on hover)`,
      syntax: `.box {
  animation-name: slide;
  animation-duration: 2s;
  animation-timing-function: ease-in-out;
  animation-delay: .5s;
  animation-iteration-count: infinite;
  animation-direction: alternate;
  animation-fill-mode: both;
}`,
    },
    {
      heading: 'The shorthand and multiple animations',
      content: `Shorthand order (flexible, but the **first time is duration, second time is delay**):

\`animation: name duration timing-function delay iteration-count direction fill-mode play-state;\`

Example: \`animation: fade-in 0.6s ease-out 0.2s 1 normal both;\`

Run several animations at once by separating with commas:

\`animation: spin 2s linear infinite, pulse 1s ease-in-out infinite alternate;\`

**Staggering:** give list items increasing delays (\`.item:nth-child(2) { animation-delay: .1s }\`) for a cascading entrance effect. With custom properties: \`animation-delay: calc(var(--i) * 100ms);\``,
    },
    {
      heading: 'Performance & accessibility',
      content: `Same rules as transitions:
- Animate \`transform\` and \`opacity\` for smooth 60fps
- Avoid animating \`width\`, \`height\`, \`top\`, \`margin\`, \`box-shadow\` on many elements
- \`will-change: transform\` can hint the browser, but use sparingly

Accessibility:
- Endless flashing (more than 3 flashes per second) can trigger seizures – never do it
- Respect \`prefers-reduced-motion\` – turn off decorative loops
- Don't hide important content behind long entrance animations

**Coming next:** Day 27 – shadows, gradients, filters and object-fit.`,
      syntax: `@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}`,
    },
  ],
  examples: [
    {
      title: 'Loading spinner',
      scenario: 'Show a spinner while data loads.',
      steps: [
        'Create a div.spinner with a circular border, one side coloured',
        'Define @keyframes spin from rotate(0) to rotate(360deg)',
        'Apply animation: spin 1s linear infinite',
        'Run',
      ],
      code: `@keyframes spin { to { transform: rotate(360deg); } }
.spinner { border: 6px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }`,
      playground: {
        html: `<div class="wrap">
  <div class="spinner" role="status" aria-label="Loading"></div>
  <p>Loading...</p>
</div>`,
        css: `body { font-family: system-ui, sans-serif; display: grid; place-items: center; min-height: 220px; }
.wrap { text-align: center; }
.spinner {
  width: 56px; height: 56px; margin: 0 auto;
  border: 6px solid #e5e7eb;
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }`,
      },
      result: 'A grey ring with a blue segment rotating continuously above the text "Loading...".',
      explanation: 'Only "to" is needed because the start (rotate 0) is the element\'s natural state. linear timing keeps the speed constant; infinite loops forever.',
    },
    {
      title: 'Staggered fade-up entrance',
      scenario: 'Feature cards slide up and fade in one after another when the page loads.',
      steps: [
        'Define @keyframes fade-up from opacity 0 + translateY(20px) to normal',
        'Apply it with fill-mode both',
        'Set animation-delay using a --i variable per card',
        'Run (click Run again to replay)',
      ],
      code: `@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}
.card { animation: fade-up .6s ease-out both; animation-delay: calc(var(--i) * 150ms); }`,
      playground: {
        html: `<div class="cards">
  <div class="card" style="--i:0">🚀 Fast</div>
  <div class="card" style="--i:1">🔐 Secure</div>
  <div class="card" style="--i:2">🌍 Global</div>
  <div class="card" style="--i:3">💡 Smart</div>
</div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 24px; background: #0f172a; }
.cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 12px; }
.card {
  padding: 28px 12px; text-align: center; color: #fff; font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #a855f7); border-radius: 12px;
  animation: fade-up .6s ease-out both;
  animation-delay: calc(var(--i) * 150ms);
}
@keyframes fade-up {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: none; }
}`,
      },
      result: 'Four purple cards appear one by one, each sliding up and fading in 150ms after the previous one.',
      explanation: 'fill-mode both keeps cards invisible during their delay (backwards) and visible after finishing (forwards). The --i inline variable creates the stagger.',
    },
    {
      title: 'Pulse, bounce and alternate direction',
      scenario: 'A notification badge pulses, an arrow bounces, and a bar slides back and forth.',
      steps: [
        'Define pulse (scale + fading ring), bounce and slide keyframes',
        'Use infinite loops; use alternate on the slide',
        'Hover the slider to pause it with animation-play-state',
        'Run',
      ],
      code: `@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgb(239 68 68 / .6); } 100% { box-shadow: 0 0 0 14px rgb(239 68 68 / 0); } }
@keyframes bounce { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.slider { animation: slide 1.5s ease-in-out infinite alternate; }
.slider:hover { animation-play-state: paused; }`,
      playground: {
        html: `<div class="row">
  <div class="bell">🔔<span class="badge">3</span></div>
  <div class="arrow">⬇️</div>
</div>
<div class="track"><div class="slider">hover to pause</div></div>`,
        css: `body { font-family: system-ui, sans-serif; padding: 30px; }
.row { display: flex; gap: 60px; align-items: center; font-size: 40px; margin-bottom: 30px; }
.bell { position: relative; }
.badge { position: absolute; top: -4px; right: -10px; width: 20px; height: 20px; font-size: 12px; display: grid; place-items: center; color: #fff; background: #ef4444; border-radius: 50%; animation: pulse 1.2s ease-out infinite; }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgb(239 68 68 / .6); } 100% { box-shadow: 0 0 0 14px rgb(239 68 68 / 0); } }
.arrow { animation: bounce 1s ease-in-out infinite; }
@keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
.track { width: 300px; background: #e5e7eb; border-radius: 999px; padding: 4px; }
.slider { width: 120px; padding: 6px; text-align: center; font-size: 12px; color: #fff; background: #10b981; border-radius: 999px; animation: slide 1.5s ease-in-out infinite alternate; }
.slider:hover { animation-play-state: paused; }
@keyframes slide { to { transform: translateX(172px); } }`,
      },
      result: 'The red badge emits a pulsing ring, the arrow bounces, and a green pill glides left-right in its track; hovering the pill freezes it.',
      explanation: 'alternate plays forward then backward so the slider does not jump back. play-state: paused stops it mid-animation.',
    },
    {
      title: 'Typewriter effect with steps()',
      scenario: 'A heading that types itself out with a blinking cursor.',
      steps: [
        'Give the text a monospace font, white-space: nowrap and overflow: hidden',
        'Animate width from 0 to the number of characters (in ch) with steps()',
        'Add a blinking border-right cursor with a second animation',
        'Run',
      ],
      code: `.typing {
  width: 20ch;
  white-space: nowrap; overflow: hidden;
  border-right: 3px solid;
  animation: typing 3s steps(20) both, blink .7s step-end infinite;
}
@keyframes typing { from { width: 0; } }
@keyframes blink { 50% { border-color: transparent; } }`,
      playground: {
        html: `<h1 class="typing">Hello, I am a coder.</h1>`,
        css: `body { display: grid; place-items: center; min-height: 200px; background: #111827; }
.typing {
  font-family: "Courier New", monospace;
  color: #34d399;
  width: 20ch;
  white-space: nowrap;
  overflow: hidden;
  border-right: 3px solid #34d399;
  animation: typing 3s steps(20) both, blink .7s step-end infinite;
}
@keyframes typing { from { width: 0; } }
@keyframes blink { 50% { border-color: transparent; } }`,
      },
      result: 'Green monospace text appears one character at a time like a typewriter, with a blinking cursor at the end.',
      explanation: 'steps(20) jumps the width in 20 discrete steps – one per character, since 1ch is one monospace character wide. Two comma-separated animations run at once.',
    },
  ],
  interview: [
    { q: 'What is @keyframes?', a: 'An at-rule that defines the intermediate steps of a CSS animation using from/to or percentages; it is applied to elements via animation-name.', level: 'Easy' },
    { q: 'What happens if you do not set animation-duration?', a: 'The default is 0s, so the animation completes instantly and appears not to run.', level: 'Easy' },
    { q: 'Explain animation-fill-mode.', a: 'It controls styles outside the active period: forwards keeps the last keyframe after the end, backwards applies the first keyframe during the delay, both does both, none does neither.', level: 'Medium' },
    { q: 'What does animation-direction: alternate do?', a: 'Plays the animation forward on odd iterations and backward on even ones, creating a smooth back-and-forth loop.', level: 'Easy' },
    { q: 'How do you pause a CSS animation on hover?', a: '.el:hover { animation-play-state: paused; }', level: 'Easy' },
    { q: 'How does the shorthand know which time is duration and which is delay?', a: 'The first time value is always the duration and the second is the delay.', level: 'Medium' },
    { q: 'What is the steps() timing function used for?', a: 'It divides the animation into a fixed number of discrete jumps instead of smooth interpolation – used for typewriter effects, sprite-sheet animations and clocks.', level: 'Medium' },
    { q: 'What does a negative animation-delay do?', a: 'Starts the animation immediately but as if it had already been running for that amount of time – useful for offsetting several looping elements.', level: 'Hard' },
    { q: 'How would you restart a CSS animation with JavaScript?', a: 'Remove the class (or set animation: none), force a reflow (e.g. read el.offsetWidth), and add the class again. Or use the Web Animations API.', level: 'Hard' },
    { q: 'How do you make animations accessible?', a: 'Avoid flashing more than 3 times per second, keep them short and purposeful, and reduce or disable them inside @media (prefers-reduced-motion: reduce).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a heartbeat animation: an ❤️ that scales to 1.3 and back twice quickly, then pauses, looping forever.',
      hint: 'Use percentages 0, 15, 30, 45, 100.',
      solution: `<style>
  .heart { display: inline-block; font-size: 60px; animation: beat 1.4s ease-in-out infinite; }
  @keyframes beat { 0%,45%,100% { transform: scale(1); } 15% { transform: scale(1.3); } 30% { transform: scale(1.1); } }
</style>
<span class="heart">❤️</span>`,
    },
    {
      task: 'Make a skeleton loading card with a shimmering gradient moving left to right.',
      hint: 'Animate background-position of a wide linear-gradient.',
      solution: `<style>
  .skeleton { height: 16px; margin: 8px 0; border-radius: 4px; background: linear-gradient(90deg, #eee 25%, #ddd 50%, #eee 75%); background-size: 200% 100%; animation: shimmer 1.2s linear infinite; }
  @keyframes shimmer { from { background-position: 200% 0; } to { background-position: -200% 0; } }
</style>
<div class="skeleton" style="width:60%"></div><div class="skeleton"></div><div class="skeleton" style="width:80%"></div>`,
    },
    {
      task: 'Create three dots that bounce one after another (a typing indicator).',
      hint: 'Same animation, different animation-delay.',
      solution: `<style>
  .dots span { display: inline-block; width: 10px; height: 10px; margin: 0 3px; background: #888; border-radius: 50%; animation: up .6s ease-in-out infinite alternate; }
  .dots span:nth-child(2) { animation-delay: .2s; }
  .dots span:nth-child(3) { animation-delay: .4s; }
  @keyframes up { to { transform: translateY(-10px); } }
</style>
<div class="dots"><span></span><span></span><span></span></div>`,
    },
    {
      task: 'Animate a background gradient that slowly shifts colours across a hero section.',
      hint: 'Large background-size and animate background-position with alternate.',
      solution: `<style>
  .hero { min-height: 200px; background: linear-gradient(120deg, #f472b6, #60a5fa, #34d399); background-size: 300% 300%; animation: shift 8s ease-in-out infinite alternate; }
  @keyframes shift { from { background-position: 0% 50%; } to { background-position: 100% 50%; } }
</style>
<section class="hero"></section>`,
    },
  ],
  quiz: [
    { question: 'Which keyword equals 100% in @keyframes?', options: ['end', 'to', 'last', 'finish'], answer: 1, explanation: 'from = 0%, to = 100%.' },
    { question: 'Which value makes an animation run forever?', options: ['forever', 'loop', 'infinite', '-1'], answer: 2, explanation: 'animation-iteration-count: infinite.' },
    { question: 'Which fill-mode keeps the final keyframe styles after the animation ends?', options: ['forwards', 'backwards', 'none', 'alternate'], answer: 0, explanation: 'forwards retains the last keyframe.' },
    { question: 'In "animation: fade 2s ease 1s", what is 1s?', options: ['Duration', 'Iteration count', 'Delay', 'Direction'], answer: 2, explanation: 'Second time value = delay.' },
    { question: 'Which property pauses a running animation?', options: ['animation-stop', 'animation-direction', 'animation-fill-mode', 'animation-play-state'], answer: 3, explanation: 'Set animation-play-state: paused.' },
  ],
};
