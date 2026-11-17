const ex1html = `<nav>
  <a href="#home" data-page="home">Home</a>
  <a href="#about" data-page="about">About</a>
  <a href="#contact" data-page="contact">Contact</a>
</nav>
<main id="view"></main>
<p class="hint">Click links, then use the buttons below (they call history.back / forward).</p>
<button id="back">&larr; history.back()</button>
<button id="fwd">history.forward() &rarr;</button>
<p id="info"></p>`;

const ex1css = `body { font-family: system-ui, sans-serif; }
nav { display: flex; gap: 12px; margin-bottom: 10px; }
nav a { padding: 6px 12px; border-radius: 6px; text-decoration: none; color: #1565c0; }
nav a.active { background: #1565c0; color: #fff; }
#view { border: 1px solid #ddd; padding: 16px; border-radius: 8px; min-height: 60px; }
.hint, #info { color: #666; font-size: 14px; }`;

const ex1js = `const pages = {
  home: '<h2>Home</h2><p>Welcome to our mini single-page app.</p>',
  about: '<h2>About</h2><p>No page reloads: we use the History API.</p>',
  contact: '<h2>Contact</h2><p>Email: hello@example.com</p>',
};

function render(page) {
  document.querySelector('#view').innerHTML = pages[page] || '<h2>404</h2>';
  document.querySelectorAll('nav a').forEach((a) =>
    a.classList.toggle('active', a.dataset.page === page));
  document.querySelector('#info').textContent =
    'history.length = ' + history.length + ' | state = ' + JSON.stringify(history.state);
}

function navigate(page) {
  try {
    history.pushState({ page }, '', '#' + page);   // add an entry, change the URL, NO reload
  } catch (e) {
    history.pushState({ page }, '');               // some sandboxes block URL changes
  }
  render(page);
}

document.querySelector('nav').addEventListener('click', (e) => {
  const link = e.target.closest('a');
  if (!link) return;
  e.preventDefault();                               // stop the normal navigation
  navigate(link.dataset.page);
});

// Back / Forward buttons (or browser buttons) fire popstate
window.addEventListener('popstate', (e) => {
  render(e.state ? e.state.page : 'home');
});

document.querySelector('#back').addEventListener('click', () => history.back());
document.querySelector('#fwd').addEventListener('click', () => history.forward());

history.replaceState({ page: 'home' }, '');         // set state for the first entry
render('home');`;

const ex2html = `<div class="card">
  <code id="coupon">SAVE20-JS2024</code>
  <button id="copy">Copy coupon</button>
</div>
<textarea id="paste" rows="3" placeholder="Paste here (Ctrl+V) to check"></textarea>
<button id="read">Read clipboard</button>
<p id="msg"></p>`;

const ex2css = `body { font-family: system-ui, sans-serif; }
.card { display: flex; gap: 10px; align-items: center; padding: 12px; border: 2px dashed #ff7043; border-radius: 10px; width: fit-content; margin-bottom: 10px; }
code { font-size: 18px; font-weight: bold; }
textarea { width: 280px; display: block; margin-bottom: 6px; }
button { padding: 6px 12px; }
#msg { font-weight: 600; }`;

const ex2js = `const msg = document.querySelector('#msg');
const copyBtn = document.querySelector('#copy');

copyBtn.addEventListener('click', async () => {
  const text = document.querySelector('#coupon').textContent;
  try {
    if (!navigator.clipboard) throw new Error('Clipboard API not available');
    await navigator.clipboard.writeText(text);           // returns a promise
    msg.textContent = 'Copied "' + text + '" to clipboard!';
  } catch (err) {
    // Fallback: select the text so the user can press Ctrl+C
    const range = document.createRange();
    range.selectNodeContents(document.querySelector('#coupon'));
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    msg.textContent = 'Auto-copy blocked (' + err.name + '). Text selected - press Ctrl+C.';
  }
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy coupon'), 1500);
});

document.querySelector('#read').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();  // asks the user for permission
    msg.textContent = 'Clipboard contains: ' + text;
  } catch (err) {
    msg.textContent = 'Reading the clipboard was not allowed here (' + err.name + ').';
  }
});`;

const ex3html = `<p class="top">Scroll down inside this preview &darr;</p>
<div id="feed"></div>
<p id="counter">Images loaded: 0</p>`;

const ex3css = `body { font-family: system-ui, sans-serif; margin: 0; padding: 8px; }
.top { height: 70vh; }
.item { opacity: 0; transform: translateY(40px); transition: all .6s ease; margin: 0 0 40px; }
.item.visible { opacity: 1; transform: none; }
.item img { width: 100%; max-width: 320px; aspect-ratio: 3 / 2; background: #eee; display: block; border-radius: 8px; }
#counter { position: sticky; bottom: 0; background: #263238; color: #fff; padding: 6px 10px; width: fit-content; border-radius: 6px; }`;

const ex3js = `const feed = document.querySelector('#feed');
let loaded = 0;

// Build 8 cards; images use data-src so nothing downloads yet
for (let i = 1; i <= 8; i++) {
  const div = document.createElement('div');
  div.className = 'item';
  div.innerHTML = '<img data-src="https://picsum.photos/seed/js' + i + '/320/213" alt="Photo ' + i + '"><p>Photo ' + i + '</p>';
  feed.appendChild(div);
}

// 1. Lazy-load images when they come near the viewport
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const img = entry.target;
    img.src = img.dataset.src;           // start downloading now
    loaded++;
    document.querySelector('#counter').textContent = 'Images loaded: ' + loaded;
    observer.unobserve(img);             // each image only once
  });
}, { rootMargin: '100px' });             // start 100px before it becomes visible

// 2. Reveal animation when 30% of a card is visible
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => entry.target.classList.toggle('visible', entry.isIntersecting));
}, { threshold: 0.3 });

document.querySelectorAll('.item img').forEach((img) => imageObserver.observe(img));
document.querySelectorAll('.item').forEach((item) => revealObserver.observe(item));`;

const ex4html = `<button id="locate">Show my location</button>
<p id="status"></p>
<p id="coords"></p>
<a id="map" target="_blank" rel="noopener"></a>`;

const ex4css = `body { font-family: system-ui, sans-serif; }
button { padding: 8px 14px; font-size: 15px; }
#status { font-weight: 600; }`;

const ex4js = `const statusEl = document.querySelector('#status');

function success(position) {
  const { latitude, longitude, accuracy } = position.coords;
  statusEl.textContent = 'Location found!';
  document.querySelector('#coords').textContent =
    'Lat: ' + latitude.toFixed(4) + ', Lng: ' + longitude.toFixed(4) + ' (+/- ' + Math.round(accuracy) + ' m)';
  const link = document.querySelector('#map');
  link.href = 'https://www.openstreetmap.org/?mlat=' + latitude + '&mlon=' + longitude + '#map=15/' + latitude + '/' + longitude;
  link.textContent = 'Open in OpenStreetMap';
}

function error(err) {
  const reasons = {
    1: 'Permission denied - allow location access in the browser.',
    2: 'Position unavailable - check GPS / network.',
    3: 'Timed out - try again.',
  };
  statusEl.textContent = 'Error: ' + (reasons[err.code] || err.message);
}

document.querySelector('#locate').addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    statusEl.textContent = 'Geolocation is not supported by this browser.';
    return;
  }
  statusEl.textContent = 'Locating...';
  navigator.geolocation.getCurrentPosition(success, error, {
    enableHighAccuracy: false,
    timeout: 10000,
    maximumAge: 60000,
  });
});`;

const ex5html = `<table id="support"><thead><tr><th>API</th><th>Supported?</th></tr></thead><tbody></tbody></table>
<p>Current URL parts (location object):</p>
<pre id="loc"></pre>`;

const ex5css = `body { font-family: system-ui, sans-serif; }
table { border-collapse: collapse; }
th, td { border: 1px solid #ccc; padding: 6px 12px; text-align: left; }
.yes { color: #2e7d32; font-weight: bold; }
.no { color: #c62828; font-weight: bold; }
pre { background: #f5f5f5; padding: 8px; }`;

const ex5js = `// Feature detection: check BEFORE using an API (never sniff the browser name)
const features = {
  'History (pushState)': 'pushState' in history,
  'Clipboard (async)': !!(navigator.clipboard && navigator.clipboard.writeText),
  'IntersectionObserver': 'IntersectionObserver' in window,
  'Geolocation': 'geolocation' in navigator,
  'Web Share': 'share' in navigator,
  'Notifications': 'Notification' in window,
  'Permissions API': 'permissions' in navigator,
};

const tbody = document.querySelector('#support tbody');
for (const [name, ok] of Object.entries(features)) {
  const tr = document.createElement('tr');
  tr.innerHTML = '<td>' + name + '</td><td class="' + (ok ? 'yes' : 'no') + '">' + (ok ? 'Yes' : 'No') + '</td>';
  tbody.appendChild(tr);
}

const { protocol, host, pathname, search, hash } = location;
document.querySelector('#loc').textContent = JSON.stringify({ protocol, host, pathname, search, hash }, null, 2);
console.log('Supported:', Object.keys(features).filter((k) => features[k]).join(', '));`;

export default {
  id: 'day-43-browser-apis',
  title: 'Browser APIs Recap: History, Clipboard, IntersectionObserver, Geolocation',
  module: 'Module 7: Professional JavaScript',
  day: 43,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Browsers provide powerful built-in APIs beyond the DOM. You will use the History API to build single-page navigation, the Clipboard API for copy buttons, IntersectionObserver for lazy loading and scroll animations, and Geolocation to find the user\'s position – with feature detection and permission handling.',
  objectives: [
    'Change the URL and handle Back/Forward without reloads using pushState and popstate',
    'Copy and read text with the async Clipboard API and handle permission errors',
    'Lazy-load images and trigger animations with IntersectionObserver',
    'Get the user\'s location with the Geolocation API and handle errors',
    'Use feature detection and understand secure-context and permission requirements',
  ],
  theory: [
    {
      heading: 'Browser APIs and Feature Detection',
      content:
        'JavaScript the language (ECMAScript) is small. The **browser** adds many **Web APIs**: DOM, fetch, storage, timers (you have used these) and many more such as History, Clipboard, IntersectionObserver and Geolocation.\n\nNot every browser supports every API, and some only work in a **secure context** (HTTPS or localhost). Always use **feature detection**:\n\n`if ("geolocation" in navigator) { ... } else { /* fallback */ }`\n\nPowerful APIs (clipboard read, geolocation, notifications) also need the **user\'s permission**, and often must be triggered by a **user gesture** such as a click.',
      tip: 'Never detect features by checking the browser name (user-agent sniffing). Check whether the API itself exists.',
    },
    {
      heading: 'History API: URLs Without Page Reloads',
      content:
        'The `history` object (on `window`) controls the session history – the list behind the Back/Forward buttons.\n\n- `history.back()`, `history.forward()`, `history.go(-2)` – move through history\n- `history.pushState(state, "", url)` – **add** a new entry and change the URL **without reloading**\n- `history.replaceState(state, "", url)` – **replace** the current entry (no new Back step)\n- `history.state` – the state object of the current entry\n- `popstate` event – fires when the user goes Back/Forward between your entries; read `event.state` and re-render\n\nThis is how **Single Page Applications** and routers like React Router (React Day 20) work: intercept link clicks, `pushState` the new URL, render the right view, and listen to `popstate`.',
      syntax: `history.pushState({ page: 'about' }, '', '/about');
window.addEventListener('popstate', (e) => render(e.state?.page));`,
      tip: 'pushState does NOT fire popstate and does not load anything – you must render the new view yourself. Also, the server must return index.html for deep links like /about, or a refresh gives 404.',
    },
    {
      heading: 'Clipboard API',
      content:
        'The modern **async Clipboard API** lives on `navigator.clipboard` and returns **promises**:\n- `navigator.clipboard.writeText(text)` – copy text (usually allowed inside a click handler)\n- `navigator.clipboard.readText()` – read text (asks the user for permission)\n- `write()` / `read()` – rich content like images\n\nRequirements: secure context (HTTPS/localhost), page focused, and for reading, user permission. Inside some sandboxed iframes it is blocked, so always `try/catch` and provide a fallback (e.g. select the text so the user can press Ctrl+C).\n\nThe old `document.execCommand("copy")` is **deprecated** – mention it only to recognise it in legacy code.',
    },
    {
      heading: 'IntersectionObserver',
      content:
        '`IntersectionObserver` tells you when an element **enters or leaves the viewport** (or another scrolling container) – efficiently, without listening to scroll events and calling `getBoundingClientRect` hundreds of times.\n\nAnalogy: instead of you staring out of the window all day (scroll listener), a **doorbell** rings when someone arrives (the observer callback).\n\nUse cases:\n- **Lazy-loading** images (`data-src` → `src` when near)\n- **Infinite scroll** (observe a "sentinel" element at the bottom; load more when it appears)\n- **Scroll animations** (add a class when visible)\n- Analytics: was an ad actually seen?\n\nOptions:\n- `root` – the scroll container (default: viewport)\n- `rootMargin` – grow/shrink the detection box, e.g. "200px" to load early\n- `threshold` – how much must be visible: 0 (any pixel) to 1 (fully), or an array',
      syntax: `const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) { /* visible */ }
  });
}, { rootMargin: '0px', threshold: 0.5 });
observer.observe(element);
observer.unobserve(element);  // stop watching one element
observer.disconnect();        // stop everything`,
      tip: 'For simple image lazy-loading, HTML already has <img loading="lazy">. Use IntersectionObserver for custom behaviour.',
    },
    {
      heading: 'Geolocation API',
      content:
        '`navigator.geolocation` gives the device location (GPS, Wi-Fi or IP based) – **only with user permission** and in a secure context.\n\n- `getCurrentPosition(success, error, options)` – one-time location\n- `watchPosition(success, error, options)` – keep receiving updates (navigation, delivery tracking); stop with `clearWatch(id)`\n- `position.coords` – `latitude`, `longitude`, `accuracy` (metres), sometimes `altitude`, `speed`, `heading`\n- Error codes: **1** PERMISSION_DENIED, **2** POSITION_UNAVAILABLE, **3** TIMEOUT\n- Options: `enableHighAccuracy`, `timeout`, `maximumAge` (accept a cached position)\n\nIt uses callbacks, not promises – you can wrap it in a promise (Day 31 promisify).',
      tip: 'Only ask for location when the user clicks a button that clearly needs it ("Find stores near me"). Asking on page load gets denied and annoys users.',
    },
    {
      heading: 'Other Useful APIs (Quick Recap)',
      content:
        '- **location** – read/change the URL: `location.href`, `location.search`, `location.reload()`\n- **URL / URLSearchParams** – parse and build URLs safely\n- **localStorage / sessionStorage** (Day 28) – store data\n- **Notification API** – system notifications (permission needed)\n- **Web Share API** – `navigator.share()` opens the phone\'s share sheet\n- **ResizeObserver / MutationObserver** – react to element size or DOM changes\n- **requestAnimationFrame** – smooth animations',
      tip: 'Coming next (Day 44): professional tooling – npm, package.json, Vite, ESLint and Prettier.',
    },
  ],
  examples: [
    {
      title: 'Mini single-page app with the History API',
      scenario: 'Navigate between Home, About and Contact without reloading, and make Back/Forward work.',
      steps: [
        'Create nav links with data-page attributes and a #view container',
        'On click: preventDefault, pushState the new state/URL and render',
        'Listen to popstate and render the page from event.state',
        'Click links, then use the back/forward buttons',
      ],
      code: ex1js,
      playground: { html: ex1html, css: ex1css, js: ex1js },
      result:
        'The view switches instantly between Home/About/Contact, the active link is highlighted and history.length grows with each click. "history.back()" returns to the previous page view and state shows e.g. {"page":"about"}.',
      explanation:
        'pushState adds history entries without loading anything, so we render manually. When the user goes back, the browser fires popstate with the saved state object, and we render that page. replaceState gives the first entry a state too.',
    },
    {
      title: 'Copy-to-clipboard button with fallback',
      scenario: 'A coupon code with a "Copy" button, like on shopping sites.',
      steps: [
        'Read the coupon text and call await navigator.clipboard.writeText(text)',
        'Show success feedback and reset the button label after 1.5 s',
        'In catch, select the text as a fallback',
        'Add a "Read clipboard" button using readText()',
      ],
      code: ex2js,
      playground: { html: ex2html, css: ex2css, js: ex2js },
      result:
        'Clicking "Copy coupon" shows "Copied "SAVE20-JS2024" to clipboard!" (pasting in the textarea confirms it). If the sandbox blocks the clipboard, the code is highlighted and the message asks you to press Ctrl+C. "Read clipboard" shows the content or a "not allowed" message.',
      explanation:
        'The Clipboard API is promise-based and permission-controlled, so try/catch is essential. Selecting the text with a Range is a friendly fallback that keeps the feature usable everywhere.',
    },
    {
      title: 'Lazy-loading images and reveal animations with IntersectionObserver',
      scenario: 'A photo feed that only downloads images when you scroll near them, and fades cards in.',
      steps: [
        'Create cards whose images have data-src instead of src',
        'Create an observer with rootMargin "100px" that copies data-src to src and unobserves',
        'Create a second observer with threshold 0.3 that toggles a "visible" class',
        'Scroll inside the preview and watch the counter',
      ],
      code: ex3js,
      playground: { html: ex3html, css: ex3css, js: ex3js },
      result:
        'At first "Images loaded: 0". As you scroll, each photo loads just before it appears (counter goes up to 8) and every card fades and slides in when 30% of it is visible; scrolling back up fades cards out again.',
      explanation:
        'The browser calls the observer callback only when visibility changes, so it is far cheaper than a scroll listener. unobserve stops tracking an image after it has loaded; the reveal observer keeps tracking to animate in and out.',
    },
    {
      title: 'Find my location with the Geolocation API',
      scenario: 'A "Show my location" button that displays coordinates and a map link.',
      steps: [
        'Check "geolocation" in navigator',
        'Call getCurrentPosition(success, error, options) inside a click handler',
        'Show latitude/longitude/accuracy and build an OpenStreetMap link',
        'Handle error codes 1, 2 and 3 with friendly messages',
      ],
      code: ex4js,
      playground: { html: ex4html, css: ex4css, js: ex4js },
      result:
        'After allowing permission: "Location found!", e.g. "Lat: 18.5204, Lng: 73.8567 (+/- 35 m)" and an "Open in OpenStreetMap" link. If you block it (or the sandbox does): "Error: Permission denied - allow location access in the browser."',
      explanation:
        'The browser asks the user first. Results arrive asynchronously through callbacks. Handling each error code clearly is part of a good user experience.',
    },
    {
      title: 'Feature detection table',
      scenario: 'Check which browser APIs are available before using them.',
      steps: [
        'Build an object of API names → detection expressions',
        'Render a table with Yes/No',
        'Show parts of the location object',
        'Run it in different browsers to compare',
      ],
      code: ex5js,
      playground: { html: ex5html, css: ex5css, js: ex5js },
      result:
        'A table where modern Chrome/Edge/Firefox show "Yes" for History, IntersectionObserver, Geolocation and Permissions (Clipboard / Web Share / Notifications depend on browser and sandbox), plus a JSON view of protocol, host, pathname, search and hash.',
      explanation:
        'Using "in" checks whether the API exists without calling it. Your code can then pick a fallback instead of crashing with "undefined is not a function".',
    },
  ],
  interview: [
    {
      q: 'What is the difference between pushState and replaceState?',
      a: 'pushState adds a new entry to the session history (Back returns to the previous URL). replaceState modifies the current entry without adding a new one. Neither reloads the page.',
      level: 'Easy',
    },
    {
      q: 'When does the popstate event fire?',
      a: 'When the active history entry changes due to Back/Forward navigation (or history.back/go) between entries of the same document. It does NOT fire on pushState/replaceState.',
      level: 'Medium',
    },
    {
      q: 'How do client-side routers work?',
      a: 'They intercept link clicks (preventDefault), call history.pushState to update the URL, render the matching component, and listen to popstate to re-render on Back/Forward. The server must serve index.html for all routes.',
      level: 'Medium',
    },
    {
      q: 'How do you copy text to the clipboard in modern JavaScript?',
      a: 'await navigator.clipboard.writeText(text) inside a user-triggered handler, in a secure context, with try/catch for permission errors. document.execCommand("copy") is the deprecated legacy method.',
      level: 'Easy',
    },
    {
      q: 'What is IntersectionObserver and why is it better than a scroll listener?',
      a: 'An API that asynchronously reports when target elements intersect the viewport or a root element. It avoids running code on every scroll event and avoids layout-thrashing calls like getBoundingClientRect, so it is much more performant.',
      level: 'Medium',
    },
    {
      q: 'Explain the threshold and rootMargin options.',
      a: 'threshold is the visible ratio (0 to 1, or an array) at which the callback fires. rootMargin expands or shrinks the root\'s bounding box (CSS-margin syntax), e.g. "200px" to trigger before the element enters the viewport.',
      level: 'Medium',
    },
    {
      q: 'How would you implement infinite scroll?',
      a: 'Place a sentinel element after the list and observe it with IntersectionObserver. When it intersects, fetch the next page and append items (guard against duplicate loads with a loading flag; stop observing when there is no more data).',
      level: 'Hard',
    },
    {
      q: 'getCurrentPosition vs watchPosition?',
      a: 'getCurrentPosition gets the location once. watchPosition calls the success callback every time the position changes and returns an id to stop it with clearWatch(id).',
      level: 'Easy',
    },
    {
      q: 'What are the Geolocation error codes?',
      a: '1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT.',
      level: 'Easy',
    },
    {
      q: 'What is a secure context and why does it matter?',
      a: 'A page served over HTTPS (or localhost). Powerful APIs such as Geolocation, Clipboard, Service Workers and getUserMedia are only available in secure contexts to protect users.',
      level: 'Medium',
    },
    {
      q: 'What is feature detection?',
      a: 'Checking if an API exists before using it ("IntersectionObserver" in window) and providing a fallback, instead of relying on the browser name/version.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Add a "Share link" button that copies location.href to the clipboard and shows "Link copied" for 2 seconds.',
      hint: 'navigator.clipboard.writeText(location.href)',
      solution: `<button id="share">Share link</button> <span id="note"></span>
<script>
document.querySelector('#share').addEventListener('click', async () => {
  const note = document.querySelector('#note');
  try {
    await navigator.clipboard.writeText(location.href);
    note.textContent = 'Link copied';
  } catch {
    note.textContent = 'Copy failed - please copy the URL manually';
  }
  setTimeout(() => (note.textContent = ''), 2000);
});
</script>`,
    },
    {
      task: 'Build infinite scroll: show 10 posts from JSONPlaceholder, and load the next 10 when a sentinel div at the bottom becomes visible.',
      hint: 'Fetch /posts?_page=N&_limit=10, observe #sentinel, and use a loading flag.',
      solution: `<ul id="list"></ul><div id="sentinel">Loading...</div>
<script>
let page = 1, loading = false;
const list = document.querySelector('#list');
const sentinel = document.querySelector('#sentinel');

async function loadMore() {
  if (loading) return;
  loading = true;
  const res = await fetch('https://jsonplaceholder.typicode.com/posts?_page=' + page + '&_limit=10');
  const posts = await res.json();
  posts.forEach((p) => {
    const li = document.createElement('li');
    li.textContent = p.id + '. ' + p.title;
    list.appendChild(li);
  });
  page++;
  loading = false;
  if (posts.length === 0) { observer.disconnect(); sentinel.textContent = 'No more posts'; }
}

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting) loadMore();
});
observer.observe(sentinel);
</script>`,
    },
    {
      task: 'Create tabs (Profile, Orders, Settings) that update the URL hash with pushState so that refreshing the page opens the same tab.',
      hint: 'On load read location.hash; on click pushState; on popstate re-render.',
      solution: `<nav><button data-tab="profile">Profile</button><button data-tab="orders">Orders</button><button data-tab="settings">Settings</button></nav>
<div id="panel"></div>
<script>
function show(tab) { document.querySelector('#panel').textContent = 'You are on the ' + tab + ' tab'; }
document.querySelector('nav').addEventListener('click', (e) => {
  const tab = e.target.dataset.tab;
  if (!tab) return;
  history.pushState({ tab }, '', '#' + tab);
  show(tab);
});
window.addEventListener('popstate', () => show(location.hash.slice(1) || 'profile'));
show(location.hash.slice(1) || 'profile');
</script>`,
    },
    {
      task: 'Wrap navigator.geolocation.getCurrentPosition in a function getPosition() that returns a promise, then use it with async/await.',
      hint: 'new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject))',
      solution: `function getPosition(options) {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Not supported'));
    navigator.geolocation.getCurrentPosition(resolve, reject, options);
  });
}

async function showCity() {
  try {
    const pos = await getPosition({ timeout: 8000 });
    console.log(pos.coords.latitude, pos.coords.longitude);
  } catch (err) {
    console.log('Could not get location:', err.message);
  }
}
showCity();`,
    },
  ],
  quiz: [
    {
      question: 'Which method changes the URL and adds a history entry without reloading?',
      options: ['location.assign', 'history.pushState', 'history.replaceState', 'location.reload'],
      answer: 1,
      explanation: 'pushState adds an entry; replaceState replaces the current one.',
    },
    {
      question: 'What does navigator.clipboard.writeText return?',
      options: ['true/false', 'The copied text', 'undefined synchronously', 'A Promise'],
      answer: 3,
      explanation: 'The async Clipboard API is promise-based.',
    },
    {
      question: 'In IntersectionObserver, threshold: 0.5 means the callback fires when...',
      options: ['50% of the target is visible', 'The page is 50% scrolled', 'Every 0.5 seconds', '50px from the top'],
      answer: 0,
      explanation: 'threshold is the ratio of the element that is visible.',
    },
    {
      question: 'Geolocation error code 1 means...',
      options: ['Timeout', 'Position unavailable', 'Permission denied', 'Not supported'],
      answer: 2,
      explanation: '1 = PERMISSION_DENIED.',
    },
    {
      question: 'Which event should a SPA listen to for Back/Forward navigation?',
      options: ['hashchange only', 'load', 'unload', 'popstate'],
      answer: 3,
      explanation: 'popstate fires when the user navigates between history entries.',
    },
  ],
};
