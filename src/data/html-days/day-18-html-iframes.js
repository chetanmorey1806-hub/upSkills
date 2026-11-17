export default {
  id: 'day-18-html-iframes',
  title: 'HTML Iframes: <iframe>, Google Maps Embed, YouTube Video Embed',
  module: 'Module 4: Semantic HTML & Advanced Elements',
  day: 18,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: "An <iframe> (inline frame) displays another web page inside your page, like a window cut into a wall. You will learn its key attributes, how to embed Google Maps and YouTube videos, and the security and accessibility rules every professional follows.",
  objectives: [
    'Explain what an iframe is and when to use it',
    'Use src, srcdoc, width, height, title, loading, allow and sandbox attributes',
    'Embed a Google Map and a YouTube video correctly',
    'Make iframes responsive and secure',
  ],
  theory: [
    {
      heading: 'What is an iframe?',
      content: "`<iframe>` stands for **inline frame**. It embeds a complete, separate HTML document inside the current page. The embedded page has its own DOM, CSS and JavaScript.\n\nAnalogy: your page is a room; an iframe is a **window** through which you see another building. You can choose the window size, but you cannot rearrange the furniture in the other building (because of the browser's *same-origin policy*).\n\nCommon uses: maps, videos, payment widgets, social posts, code playgrounds (this playground itself runs inside an iframe!).",
      syntax: `<iframe src="https://example.com" width="600" height="400" title="Example site"></iframe>`,
    },
    {
      heading: 'Important attributes',
      content: "- `src`: URL of the page to embed.\n- `srcdoc`: inline HTML to show instead of a URL (overrides `src`).\n- `width` / `height`: size in CSS pixels (default 300×150).\n- `title`: **required for accessibility**; screen readers announce it.\n- `loading=\"lazy\"`: load only when the user scrolls near it (faster pages).\n- `allow`: permissions policy, e.g. `allow=\"fullscreen; autoplay\"`.\n- `allowfullscreen`: lets videos go full screen.\n- `referrerpolicy`: controls the Referer header sent.\n- `sandbox`: applies extra restrictions (see below).\n- `name`: lets links target the iframe with `target=\"name\"`.",
      tip: 'Deprecated attributes like frameborder, scrolling and marginwidth should be replaced with CSS (border: 0; overflow).',
    },
    {
      heading: 'Embedding Google Maps',
      content: "1. Open Google Maps and search a place.\n2. Click **Share → Embed a map → Copy HTML**.\n3. Paste the `<iframe>` code into your page and add a meaningful `title`.\n\nFor quick demos you can also use the simple query URL: `https://www.google.com/maps?q=PLACE&output=embed`.",
      syntax: `<iframe
  src="https://www.google.com/maps?q=India+Gate,New+Delhi&output=embed"
  width="600" height="350" style="border:0"
  loading="lazy" referrerpolicy="no-referrer-when-downgrade"
  title="Map showing India Gate, New Delhi"></iframe>`,
    },
    {
      heading: 'Embedding YouTube videos',
      content: "On YouTube click **Share → Embed** and copy the code. The URL format is `https://www.youtube.com/embed/VIDEO_ID` (NOT the normal `watch?v=` URL, which refuses to load in iframes).\n\nUseful URL parameters: `?start=30` (start at 30 s), `?autoplay=1&mute=1` (browsers only allow autoplay when muted), `?controls=0`, `?loop=1&playlist=VIDEO_ID`.\n\nPrivacy-enhanced mode: use `https://www.youtube-nocookie.com/embed/VIDEO_ID`.",
      syntax: `<iframe width="560" height="315"
  src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE"
  title="YouTube video player"
  allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
  allowfullscreen></iframe>`,
      tip: 'Common mistake: pasting https://www.youtube.com/watch?v=ID into src. You will see "refused to connect" because YouTube blocks framing of the watch page.',
    },
    {
      heading: 'Security: sandbox and X-Frame-Options',
      content: "Embedding third-party content is a risk. The `sandbox` attribute (with no value) blocks scripts, forms, popups and same-origin access. You then re-enable only what you need:\n\n- `allow-scripts`\n- `allow-forms`\n- `allow-popups`\n- `allow-same-origin`\n\nMany sites (banks, Google search, Facebook) **refuse to be framed** using the `X-Frame-Options` or `Content-Security-Policy: frame-ancestors` headers. This protects against *clickjacking*. If an iframe shows \"refused to connect\", that is why.",
      tip: 'Never combine allow-scripts and allow-same-origin for untrusted content from your own origin: the framed page could remove its own sandbox.',
    },
    {
      heading: 'Responsive iframes',
      content: "Fixed `width=\"560\"` overflows on phones. Modern solution: set `width: 100%` and `aspect-ratio: 16 / 9` in CSS, with `height: auto`.",
      syntax: `iframe.video { width: 100%; height: auto; aspect-ratio: 16 / 9; border: 0; }`,
    },
  ],
  examples: [
    {
      title: 'Iframe with srcdoc (inline mini-page)',
      scenario: 'Show a small HTML document inside a frame without needing another file.',
      steps: [
        'Create index.html',
        'Add an <iframe> with a srcdoc attribute containing HTML',
        'Add title, width and height',
        'Click Run',
      ],
      code: `<iframe title="Inline demo" width="300" height="120"
  srcdoc="<h2 style='color:teal'>Hello from inside!</h2><p>I am a separate document.</p>"></iframe>`,
      playground: {
        html: `<h3>Parent page</h3>
<iframe id="f" title="Inline demo" width="320" height="130"
  srcdoc="<h2 style='color:teal;font-family:sans-serif'>Hello from inside!</h2><p style='font-family:sans-serif'>I am a separate document.</p>"></iframe>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
iframe { border: 2px solid #94a3b8; border-radius: 8px; }`,
        js: `const f = document.getElementById('f');
console.log('Default iframe size is 300x150; this one is', f.width + 'x' + f.height);`,
      },
      result: 'A bordered box showing a teal "Hello from inside!" heading, rendered as a separate document. Console logs the size.',
      explanation: 'srcdoc lets you embed inline HTML. Notice the quotes: the attribute uses double quotes so the inner HTML uses single quotes.',
    },
    {
      title: 'Embedding a Google Map',
      scenario: 'A restaurant website needs a "Find us" map.',
      steps: [
        'Create contact.html with a section "Find Us"',
        'Paste the Google Maps embed iframe',
        'Add title, loading="lazy" and make it responsive with CSS',
        'Click Run',
      ],
      code: `<iframe class="map"
  src="https://www.google.com/maps?q=Gateway+of+India,Mumbai&output=embed"
  loading="lazy" title="Map: Gateway of India, Mumbai"></iframe>`,
      playground: {
        html: `<section>
  <h2>Find Us</h2>
  <p>Near the Gateway of India, Mumbai.</p>
  <iframe class="map"
    src="https://www.google.com/maps?q=Gateway+of+India,Mumbai&output=embed"
    loading="lazy" referrerpolicy="no-referrer-when-downgrade"
    title="Map: Gateway of India, Mumbai"></iframe>
</section>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.map { width: 100%; aspect-ratio: 4 / 3; max-height: 320px; border: 0; border-radius: 10px; }`,
      },
      result: 'An interactive Google Map centred on the Gateway of India that fills the width of the preview (needs an internet connection).',
      explanation: 'The output=embed parameter returns a frame-friendly map page. width:100% plus aspect-ratio keeps it responsive; loading="lazy" delays loading until needed.',
    },
    {
      title: 'Responsive YouTube embed',
      scenario: 'Embed a tutorial video that scales on phones and desktops.',
      steps: [
        'Copy the video ID from the YouTube URL (the part after v=)',
        'Use https://www.youtube-nocookie.com/embed/VIDEO_ID as src',
        'Add title, allow and allowfullscreen',
        'Use CSS aspect-ratio: 16/9',
        'Click Run',
      ],
      code: `<iframe class="video"
  src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?start=5"
  title="YouTube video: IFrame API demo"
  allow="encrypted-media; picture-in-picture"
  allowfullscreen></iframe>`,
      playground: {
        html: `<h2>Watch the demo</h2>
<iframe class="video"
  src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?start=5"
  title="YouTube video: IFrame API demo"
  allow="encrypted-media; picture-in-picture"
  allowfullscreen></iframe>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
.video { width: 100%; max-width: 640px; height: auto; aspect-ratio: 16 / 9; border: 0; border-radius: 8px; }`,
      },
      result: 'A YouTube player at 16:9 that shrinks with the preview width and starts at 5 seconds when played.',
      explanation: 'The /embed/ URL is designed for iframes. ?start=5 sets the start time. aspect-ratio replaces the old "padding-bottom: 56.25%" hack.',
    },
    {
      title: 'Sandboxed iframe blocks scripts',
      scenario: 'Prove that sandbox disables JavaScript inside a frame.',
      steps: [
        'Create two iframes with the same srcdoc containing a script that writes text',
        'Give the first sandbox="allow-scripts" and the second an empty sandbox',
        'Click Run and compare',
      ],
      code: `<iframe sandbox="allow-scripts" srcdoc="..."></iframe>
<iframe sandbox srcdoc="..."></iframe>`,
      playground: {
        html: `<p>With allow-scripts:</p>
<iframe sandbox="allow-scripts" title="Scripts allowed" height="60"
  srcdoc="<p id='o'>Script did NOT run</p><script>document.getElementById('o').textContent='Script ran!'&lt;/script&gt;"></iframe>
<p>Fully sandboxed:</p>
<iframe sandbox title="Scripts blocked" height="60"
  srcdoc="<p id='o'>Script did NOT run</p><script>document.getElementById('o').textContent='Script ran!'&lt;/script&gt;"></iframe>`,
        css: `body { font-family: system-ui, sans-serif; padding: 12px; }
iframe { width: 100%; border: 1px solid #cbd5e1; }`,
      },
      result: 'The first frame shows "Script ran!", the second still shows "Script did NOT run".',
      explanation: 'An empty sandbox attribute removes all permissions. Adding allow-scripts re-enables only JavaScript. This is how you safely embed untrusted HTML.',
    },
  ],
  interview: [
    { q: 'What is an iframe?', a: 'An inline frame element that embeds another HTML document inside the current one, with its own separate browsing context (DOM, CSS, JS).', level: 'Easy' },
    { q: 'Why is the title attribute important on iframes?', a: 'Screen readers announce the title so users know what the frame contains. Accessibility guidelines (WCAG) require frames to have a name.', level: 'Easy' },
    { q: 'What is the difference between src and srcdoc?', a: 'src loads a document from a URL; srcdoc provides inline HTML directly. If both exist, srcdoc wins in supporting browsers.', level: 'Medium' },
    { q: 'What does the sandbox attribute do?', a: 'Applies restrictions to the framed content: blocks scripts, forms, popups, top navigation and treats it as a unique origin. Tokens like allow-scripts or allow-forms selectively lift restrictions.', level: 'Medium' },
    { q: 'Why does some website show "refused to connect" in an iframe?', a: 'It sends X-Frame-Options: DENY/SAMEORIGIN or a CSP frame-ancestors directive to prevent clickjacking, so browsers refuse to render it in a frame.', level: 'Medium' },
    { q: 'What is clickjacking?', a: 'An attack where a malicious page loads a legitimate site in a transparent iframe and tricks users into clicking hidden buttons. Prevented with X-Frame-Options / frame-ancestors.', level: 'Hard' },
    { q: 'How do you embed a YouTube video correctly?', a: 'Use an iframe with src="https://www.youtube.com/embed/VIDEO_ID" (or youtube-nocookie.com), plus title, allow and allowfullscreen attributes. The watch?v= URL will not work.', level: 'Easy' },
    { q: 'How do you make an iframe responsive?', a: 'CSS: width: 100%; height: auto; aspect-ratio: 16 / 9; (older approach: wrapper with padding-bottom: 56.25% and absolutely positioned iframe).', level: 'Medium' },
    { q: 'What does loading="lazy" do on an iframe?', a: 'Defers loading the frame until it is near the viewport, improving initial page load performance.', level: 'Easy' },
    { q: 'Can JavaScript in the parent read content inside a cross-origin iframe?', a: 'No. The same-origin policy blocks access to contentDocument of cross-origin frames. Communication must use window.postMessage.', level: 'Hard' },
  ],
  practice: [
    { task: 'Embed a Google Map of your city (use the q=...&output=embed URL) with a proper title and lazy loading.', hint: 'Replace spaces with + in the query.', solution: `<iframe src="https://www.google.com/maps?q=Pune,India&output=embed"
  width="600" height="400" style="border:0" loading="lazy"
  title="Map of Pune, India"></iframe>` },
    { task: 'Embed a YouTube video that starts at 1 minute and is fully responsive.', hint: 'start is in seconds.', solution: `<style>.yt { width: 100%; aspect-ratio: 16/9; border: 0; }</style>
<iframe class="yt" src="https://www.youtube-nocookie.com/embed/M7lc1UVf-VE?start=60"
  title="Tutorial video" allow="encrypted-media; picture-in-picture" allowfullscreen></iframe>` },
    { task: 'Create a mini "preview" iframe using srcdoc that shows a red heading saying Preview.', hint: 'Use single quotes inside the double-quoted srcdoc.', solution: `<iframe title="Preview" srcdoc="<h1 style='color:red'>Preview</h1>"></iframe>` },
    { task: 'Create a named iframe and two links that load different srcdoc-free pages into it using target.', hint: 'name="viewer" on iframe, target="viewer" on links. Use data: URLs.', solution: `<a href="data:text/html,<h1>Page One</h1>" target="viewer">One</a>
<a href="data:text/html,<h1>Page Two</h1>" target="viewer">Two</a>
<iframe name="viewer" title="Viewer" width="300" height="150"></iframe>` },
  ],
  quiz: [
    { question: 'Which YouTube URL works inside an iframe src?', options: ['youtube.com/watch?v=ID', 'youtu.be/ID', 'youtube.com/embed/ID', 'youtube.com/v/ID?watch'], answer: 2, explanation: 'Only the /embed/ URL is designed to be framed.' },
    { question: 'Default size of an iframe without width/height is:', options: ['300 x 150', '100% x 100%', '640 x 480', '0 x 0'], answer: 0, explanation: 'Like canvas, the default iframe size is 300 by 150 pixels.' },
    { question: 'An empty sandbox attribute:', options: ['Does nothing', 'Allows everything', 'Only blocks images', 'Applies all restrictions, including blocking scripts'], answer: 3, explanation: 'No tokens means every restriction applies.' },
    { question: 'Which attribute helps screen reader users understand an iframe?', options: ['name', 'title', 'id', 'loading'], answer: 1, explanation: 'title gives the frame an accessible name.' },
    { question: 'Sites block framing using:', options: ['X-Frame-Options header', 'alt attribute', 'robots.txt', 'meta keywords'], answer: 0, explanation: 'X-Frame-Options or CSP frame-ancestors prevent clickjacking.' },
  ],
};
