export default {
  id: 'extra-04-progress-meter',
  title: 'Progress and Meter Tags: <progress> vs <meter>',
  module: 'Extra: Elements & Attributes',
  extraNo: 4,
  level: 'Beginner',
  duration: '1 hour',
  summary: '<progress> shows how far a task has gone (downloads, uploads, steps), while <meter> shows a measurement inside a known range (disk usage, battery, score). Both are native, accessible and need no images.',
  objectives: [
    'Explain the difference between <progress> and <meter>',
    'Use value and max on <progress>, including the indeterminate state',
    'Use min, max, low, high and optimum on <meter>',
    'Update both elements from JavaScript and label them accessibly',
  ],
  theory: [
    {
      heading: '<progress>: how much of a task is done',
      content: `\`<progress>\` represents the completion of a task, like the loading bar when you install an app.

Attributes:
- \`max\` – the total amount of work (default 1).
- \`value\` – how much is done (between 0 and max).

If you leave out \`value\`, the bar becomes **indeterminate**: it shows an animation meaning "working, but I don't know how long". This is useful while waiting for a server response.

The text between the tags is a fallback for very old browsers and is also a nice place for the human-readable percentage.`,
      syntax: `<progress value="70" max="100">70%</progress>
<progress>Loading...</progress>   <!-- indeterminate -->`,
    },
    {
      heading: '<meter>: a measurement in a known range',
      content: `\`<meter>\` (also called a gauge) shows a **scalar value within a known range**, like the fuel gauge in a car or the battery icon on a phone. It is not about a task finishing.

Attributes:
- \`min\` / \`max\` – range (defaults 0 and 1)
- \`value\` – the current measurement (required)
- \`low\` / \`high\` – boundaries that split the range into low, medium and high zones
- \`optimum\` – which zone is "good"

The browser colors the bar (usually green / yellow / red) depending on which zone \`value\` is in compared to \`optimum\`.`,
      syntax: `<meter min="0" max="100" low="20" high="80" optimum="100" value="15">15%</meter>`,
      tip: 'Do not use <meter> for progress of a task, and do not use it when there is no maximum (e.g. a person\'s weight).',
    },
    {
      heading: 'How meter colors are decided',
      content: `The browser compares the zone of \`value\` with the zone of \`optimum\`:
- Same zone → good (green)
- Neighbouring zone → so-so (yellow)
- Opposite zone → bad (red)

Examples:
1. Battery: optimum high (100), low=20, high=80. Value 15 → red, 50 → yellow, 90 → green.
2. Disk usage: optimum low (0), low=60, high=90. Value 95 → red, 70 → yellow, 30 → green.`,
    },
    {
      heading: 'Accessibility and styling',
      content: `- Give each bar a visible label with \`<label for="id">\` (both elements are labelable), or with \`aria-label\`.
- Screen readers announce the value, e.g. "70 percent".
- Styling is browser-specific: use \`appearance: none\` plus pseudo-elements like \`::-webkit-progress-value\`, \`::-moz-progress-bar\`, \`::-webkit-meter-optimum-value\`. The simplest cross-browser tweak is \`accent-color\` for progress and width/height for both.`,
      syntax: `<label for="upload">Upload:</label>
<progress id="upload" value="30" max="100">30%</progress>`,
    },
  ],
  examples: [
    {
      title: 'Progress vs meter side by side',
      scenario: 'A dashboard shows a file download progress and a battery level, so you can compare both elements.',
      steps: [
        'Create index.html',
        'Add a labelled <progress> with value and max',
        'Add an indeterminate <progress>',
        'Add three <meter> elements for battery levels 15, 50 and 90',
        'Click Run and compare the colors',
      ],
      code: `<label for="dl">Download</label>
<progress id="dl" value="45" max="100">45%</progress>

<progress>Waiting...</progress>

<meter min="0" max="100" low="20" high="80" optimum="100" value="15">15%</meter>`,
      playground: {
        html: `<h3>&lt;progress&gt;</h3>
<p><label for="dl">Download:</label> <progress id="dl" value="45" max="100">45%</progress> 45%</p>
<p><label for="wait">Waiting for server:</label> <progress id="wait">Working…</progress> (indeterminate)</p>
<h3>&lt;meter&gt; – battery (higher is better)</h3>
<p>15% <meter min="0" max="100" low="20" high="80" optimum="100" value="15">15%</meter></p>
<p>50% <meter min="0" max="100" low="20" high="80" optimum="100" value="50">50%</meter></p>
<p>90% <meter min="0" max="100" low="20" high="80" optimum="100" value="90">90%</meter></p>
<h3>&lt;meter&gt; – disk used (lower is better)</h3>
<p>95% <meter min="0" max="100" low="60" high="90" optimum="0" value="95">95%</meter></p>
<p>30% <meter min="0" max="100" low="60" high="90" optimum="0" value="30">30%</meter></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
progress, meter { width: 200px; height: 18px; vertical-align: middle; }
progress { accent-color: royalblue; }`,
      },
      result: 'A partly filled download bar, an animated indeterminate bar, battery meters colored red/yellow/green, and disk meters red (95%) and green (30%).',
      explanation: 'progress only knows value/max. meter compares value against low/high and optimum to choose a color: for battery optimum=100 (high is good), for disk optimum=0 (low is good).',
    },
    {
      title: 'Simulated file upload with JavaScript',
      scenario: 'Clicking Upload fills a progress bar step by step and shows the percentage.',
      steps: [
        'Add a <progress value="0" max="100"> and an <output> for the text',
        'Add an Upload button',
        'In JS, use setInterval to add 10 to value every 200ms',
        'Stop at 100 and log "Done"',
        'Click Run and press Upload',
      ],
      code: `const bar = document.getElementById('bar');
const timer = setInterval(() => {
  bar.value += 10;
  if (bar.value >= bar.max) clearInterval(timer);
}, 200);`,
      playground: {
        html: `<label for="bar">Uploading photo.jpg</label><br>
<progress id="bar" value="0" max="100">0%</progress>
<output id="pct">0%</output>
<p><button id="start">Upload</button></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
progress { width: 260px; height: 20px; accent-color: seagreen; }`,
        js: `const bar = document.getElementById('bar');
const pct = document.getElementById('pct');
document.getElementById('start').addEventListener('click', () => {
  bar.value = 0;
  const timer = setInterval(() => {
    bar.value += 10;
    pct.textContent = bar.value + '%';
    bar.textContent = bar.value + '%';
    if (bar.value >= bar.max) {
      clearInterval(timer);
      console.log('Upload done');
    }
  }, 200);
});`,
      },
      result: 'The bar fills from 0 to 100% in two seconds, the percentage updates next to it, and the console says "Upload done".',
      explanation: 'bar.value is a number property; changing it redraws the bar. The interval is cleared when value reaches max.',
    },
    {
      title: 'Password strength meter',
      scenario: 'As the user types a password, a <meter> shows how strong it is (0 to 4 points).',
      steps: [
        'Add a password input and a <meter min="0" max="4" low="2" high="3" optimum="4">',
        'On input, give 1 point each for: length ≥ 8, a number, an uppercase letter, a symbol',
        'Set meter.value to the score and show a word',
        'Click Run and type different passwords',
      ],
      code: `<meter id="strength" min="0" max="4" low="2" high="3" optimum="4" value="0"></meter>`,
      playground: {
        html: `<label for="pw">Password</label><br>
<input id="pw" type="password" autocomplete="new-password">
<p><meter id="strength" min="0" max="4" low="2" high="3" optimum="4" value="0"></meter>
<span id="word">Too weak</span></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
meter { width: 220px; height: 16px; }`,
        js: `const words = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
document.getElementById('pw').addEventListener('input', (e) => {
  const v = e.target.value;
  let score = 0;
  if (v.length >= 8) score++;
  if (/[0-9]/.test(v)) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  document.getElementById('strength').value = score;
  document.getElementById('word').textContent = words[score];
  console.log('Score:', score);
});`,
      },
      result: 'Typing "abc" shows red/Too weak; "abcdefg1" yellow; "Abcdefg1!" green/Strong.',
      explanation: 'A strength score is a measurement in a known range (0–4) where higher is better, so <meter> with optimum=4 is the right element, not <progress>.',
    },
  ],
  interview: [
    { q: 'What is the difference between <progress> and <meter>?', a: '<progress> shows completion of a task over time (download, steps). <meter> shows a scalar measurement within a known range (disk usage, battery, score). Progress is about "how much done"; meter is about "how much there is".', level: 'Easy' },
    { q: 'What is an indeterminate progress bar and how do you create one?', a: 'A progress bar that indicates activity without a known completion amount. Create it by omitting the value attribute: <progress></progress>. In JS, removeAttribute("value") makes it indeterminate again.', level: 'Medium' },
    { q: 'What do low, high and optimum mean on <meter>?', a: 'low and high split the min–max range into low, medium and high regions. optimum says which region is preferred. The browser uses them to show good/average/poor coloring.', level: 'Medium' },
    { q: 'What are the default min and max of <meter>?', a: 'min defaults to 0 and max to 1. The default max of <progress> is also 1.', level: 'Medium' },
    { q: 'Should you use <meter> to show a page loading percentage?', a: 'No. Loading is task progress, so use <progress>. Using meter there is semantically wrong and announced incorrectly by assistive technology.', level: 'Easy' },
    { q: 'How do you make these elements accessible?', a: 'Give them a label (<label for> or aria-label/aria-labelledby), keep fallback text inside, and optionally show the value as visible text so it does not rely on color alone.', level: 'Medium' },
    { q: 'How can you style a progress bar across browsers?', a: 'Simple: width, height and accent-color. Full control: appearance:none plus vendor pseudo-elements ::-webkit-progress-bar, ::-webkit-progress-value and ::-moz-progress-bar.', level: 'Hard' },
    { q: 'Why not just use a div with a colored inner div?', a: 'A custom div bar has no semantics; screen readers will not announce progress unless you add role="progressbar" and aria-valuenow/min/max manually. Native elements give this for free.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Show a 5-step checkout progress: "Step 2 of 5" using <progress>.',
      hint: 'value="2" max="5".',
      solution: `<label for="steps">Checkout: Step 2 of 5</label>
<progress id="steps" value="2" max="5">Step 2 of 5</progress>`,
    },
    {
      task: 'Display exam scores for three students using <meter> where 0–100, below 40 is low, above 75 is high, and higher is better.',
      hint: 'low="40" high="75" optimum="100".',
      solution: `<p>Asha <meter min="0" max="100" low="40" high="75" optimum="100" value="88">88</meter> 88</p>
<p>Ravi <meter min="0" max="100" low="40" high="75" optimum="100" value="60">60</meter> 60</p>
<p>Mina <meter min="0" max="100" low="40" high="75" optimum="100" value="30">30</meter> 30</p>`,
    },
    {
      task: 'Create a range slider (0–100) that updates a <meter> showing "CPU usage" where lower is better.',
      hint: 'optimum="0", update meter.value on input.',
      solution: `<input id="cpu" type="range" min="0" max="100" value="20">
<meter id="m" min="0" max="100" low="50" high="85" optimum="0" value="20"></meter>
<script>
  document.getElementById('cpu').addEventListener('input', (e) => {
    document.getElementById('m').value = e.target.value;
  });
</script>`,
    },
    {
      task: 'Show an indeterminate progress bar for 2 seconds, then turn it into a full (100%) bar.',
      hint: 'Start with <progress max="100"> without value; then set value = 100.',
      solution: `<progress id="p" max="100">Loading…</progress>
<script>
  setTimeout(() => { document.getElementById('p').value = 100; }, 2000);
</script>`,
    },
  ],
  quiz: [
    { question: 'Which element best shows "disk 70% full"?', options: ['<progress>', '<meter>', '<range>', '<gauge>'], answer: 1, explanation: 'Disk usage is a measurement within a known range, so <meter>.' },
    { question: 'How do you make an indeterminate progress bar?', options: ['value="-1"', 'value="auto"', 'Omit the value attribute', 'Add the indeterminate attribute'], answer: 2, explanation: 'A <progress> without value is indeterminate.' },
    { question: 'Which attribute tells <meter> which region is the "good" one?', options: ['best', 'high', 'good', 'optimum'], answer: 3, explanation: 'optimum indicates the preferred value/region.' },
    { question: 'What is the default max of <progress>?', options: ['1', '100', '10', 'No default'], answer: 0, explanation: 'Both progress and meter default to max 1.' },
    { question: 'Which is the right element for "Step 3 of 4" in a sign-up wizard?', options: ['<meter value="3" max="4">', '<progress value="3" max="4">', '<output>3/4</output> only', '<input type="range">'], answer: 1, explanation: 'Completion of a multi-step task is progress.' },
  ],
};
