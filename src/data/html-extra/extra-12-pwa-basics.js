export default {
  id: 'extra-12-pwa-basics',
  title: 'Progressive Web App (PWA) Basics: Manifest, Service Worker, Offline and Install',
  module: 'Extra: HTML5 Browser APIs',
  extraNo: 12,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'A Progressive Web App is a normal website that can be installed like an app, open in its own window and keep working offline. You will learn the three building blocks (HTTPS, a web app manifest and a service worker), the caching strategies, and how to check installability.',
  objectives: [
    'Explain what makes a website a PWA and why companies build them',
    'Write a web app manifest and link it from HTML',
    'Register a service worker and understand its lifecycle (install, activate, fetch)',
    'Choose a caching strategy (cache-first, network-first) using the Cache API',
    'Detect online/offline status and test a PWA with DevTools and Lighthouse',
  ],
  theory: [
    {
      heading: 'What is a PWA?',
      content: `A **Progressive Web App** is a website built with normal HTML, CSS and JS that gains app-like super-powers:
- **Installable** – "Add to Home Screen" / "Install app", gets an icon, opens without the browser address bar.
- **Offline / reliable** – works on a bad or no network thanks to a cache.
- **Fast** – assets load from the local cache.
- **Engaging** – can show push notifications (with permission) on supported platforms.

"Progressive" means it works for everyone as a normal website and **progressively** adds features where the browser supports them.

Analogy: a PWA is like a restaurant that also offers home delivery. Same kitchen (one codebase), but customers can also enjoy it at home (installed, offline).

Real examples: Twitter/X Lite, Starbucks, Pinterest, Spotify web player.`,
      points: [
        'Requirement 1: served over HTTPS (localhost is allowed for development)',
        'Requirement 2: a web app manifest (JSON) linked from the page',
        'Requirement 3: a service worker (JS file) that controls caching/offline',
      ],
    },
    {
      heading: 'The web app manifest',
      content: `The manifest is a JSON file describing how the app looks when installed: its name, icons, colours and how it opens. Link it in the \`<head>\` and add a theme colour meta tag.

Important fields:
- \`name\` / \`short_name\` – full name and the label under the icon
- \`start_url\` – page opened when the app launches
- \`display\` – \`standalone\` (app window), \`fullscreen\`, \`minimal-ui\` or \`browser\`
- \`background_color\` – splash screen colour; \`theme_color\` – toolbar colour
- \`icons\` – at least 192×192 and 512×512 PNGs (plus a \`maskable\` one for Android)`,
      syntax: `<!-- index.html -->
<link rel="manifest" href="/manifest.webmanifest">
<meta name="theme-color" content="#0d9488">
<link rel="apple-touch-icon" href="/icons/icon-192.png">

// manifest.webmanifest
{
  "name": "Daily Notes",
  "short_name": "Notes",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0d9488",
  "icons": [
    { "src": "/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/maskable-512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ]
}`,
    },
    {
      heading: 'The service worker',
      content: `A **service worker** is a JavaScript file that runs in the background, separate from your page. It sits between your page and the network like a **personal assistant at the door**: every request passes through it, and it decides whether to answer from the cache or go to the network.

Key facts:
- It has no access to the DOM.
- It only works on HTTPS/localhost and must be a real file on your origin (not inline, not a blob).
- Its **scope** is the folder it lives in: \`/sw.js\` controls the whole site.

**Lifecycle:**
1. \`register()\` from the page downloads the file.
2. \`install\` event – pre-cache the "app shell" (HTML, CSS, JS, icons).
3. \`activate\` event – clean up old caches.
4. \`fetch\` event – intercept every request and respond.

A new version waits until all tabs using the old one are closed (or you call \`skipWaiting()\`).`,
      syntax: `// app.js (page)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then((reg) => console.log('SW scope:', reg.scope))
    .catch((err) => console.error('SW failed', err));
}

// sw.js (service worker)
const CACHE = 'notes-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/offline.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) =>
    Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
});
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});`,
    },
    {
      heading: 'Caching strategies',
      content: `- **Cache first** (cache, falling back to network) – fastest; best for static assets that rarely change (CSS, fonts, logos).
- **Network first** (network, falling back to cache) – fresh data when online, old data when offline; good for API data and news.
- **Stale-while-revalidate** – answer immediately from cache AND fetch an update in the background for next time; good for avatars, product lists.
- **Network only** / **Cache only** – for things that must never/always be cached.

Always version your cache names (\`notes-v2\`) so updates replace old files. Tools like **Workbox** or the Vite PWA plugin generate service workers for you.`,
      tip: 'Common mistake: caching index.html with cache-first and never updating the cache name, so users are stuck on an old version forever.',
    },
    {
      heading: 'Testing and what the playground can show',
      content: `How to test a real PWA:
1. Serve the folder with a local server (\`npx serve\`, VS Code Live Server) on localhost.
2. Chrome DevTools → **Application** tab → Manifest (see errors, icons) and Service Workers (update, unregister, "Offline" checkbox).
3. Network tab → throttle to Offline and reload.
4. Run **Lighthouse** → PWA/Best Practices checks.
5. Look for the install icon in the address bar.

**Note about this lesson's playground:** service workers cannot be registered inside a sandboxed iframe or from inline code, and the manifest cannot be installed from it. So the runnable demos below show the parts that *can* run anywhere: feature detection and secure-context checks, building/validating a manifest, online/offline events, and the cache-first logic simulated with a JavaScript Map. The full file code is in \`code\` for you to run on localhost.`,
    },
  ],
  examples: [
    {
      title: 'PWA readiness checker',
      scenario: 'Detect which PWA features this environment supports and explain why some are unavailable in the sandbox.',
      steps: [
        'Create a <ul> for results',
        'Check isSecureContext, "serviceWorker" in navigator, "caches" in window, display-mode media query',
        'Try navigator.serviceWorker.register on a fake path and catch the error',
        'Print each result with a ✔ or ✘',
        'Click Run and read the list',
      ],
      code: `console.log('Secure context:', window.isSecureContext);
console.log('SW supported:', 'serviceWorker' in navigator);
console.log('Running installed:', matchMedia('(display-mode: standalone)').matches);
navigator.serviceWorker.register('/sw.js').catch(err => console.log(err.name));`,
      playground: {
        html: `<h3>PWA readiness</h3>
<ul id="list"></ul>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
li { margin: 4px 0; }
.ok { color: seagreen; } .no { color: crimson; }`,
        js: `const list = document.getElementById('list');
function row(label, ok, note) {
  const li = document.createElement('li');
  li.className = ok ? 'ok' : 'no';
  li.textContent = (ok ? '✔ ' : '✘ ') + label + (note ? ' – ' + note : '');
  list.appendChild(li);
  console.log(label, ok, note || '');
}
row('Secure context (HTTPS/localhost)', window.isSecureContext);
row('Service Worker API available', 'serviceWorker' in navigator);
let cachesOk = false;
try { cachesOk = 'caches' in window && !!window.caches; } catch (e) { cachesOk = false; }
row('Cache API available', cachesOk);
row('Running as installed app (standalone)', matchMedia('(display-mode: standalone)').matches, 'false in a normal tab');
row('Online right now', navigator.onLine);
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw-demo.js')
    .then(() => row('Service worker registered', true))
    .catch((err) => row('Service worker registration', false,
      err.name + ': expected here (sandboxed iframe / no sw file). Works on localhost or HTTPS with a real sw.js.'));
} else {
  row('Service worker registration', false, 'API hidden in this context');
}`,
      },
      result: 'A checklist. Typically: secure context ✔/✘ depending on the playground, standalone ✘, online ✔, and service worker registration ✘ with a SecurityError/TypeError explanation.',
      explanation: 'Feature detection is the "progressive" part: check before using. Service workers need a real same-origin file and a non-sandboxed secure context, which the playground cannot provide, so the error is caught and explained instead of breaking the page.',
    },
    {
      title: 'Build and validate a manifest',
      scenario: 'Fill a small form to generate a manifest.webmanifest and check it against the installability basics.',
      steps: [
        'Create inputs for name, short_name, theme color and display',
        'On input, build a manifest object and JSON.stringify it with indentation',
        'Validate: name present, short_name ≤ 12 chars, display standalone/fullscreen/minimal-ui, icons 192 and 512 present',
        'Show the JSON and the problems',
        'Click Run and edit the fields',
      ],
      code: `const manifest = {
  name, short_name, start_url: '/', display,
  background_color: '#ffffff', theme_color,
  icons: [
    { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
  ],
};`,
      playground: {
        html: `<form id="f">
  <label>name <input name="name" value="Daily Notes"></label>
  <label>short_name <input name="short_name" value="Notes"></label>
  <label>theme_color <input name="theme_color" type="color" value="#0d9488"></label>
  <label>display
    <select name="display">
      <option>standalone</option><option>fullscreen</option><option>minimal-ui</option><option>browser</option>
    </select>
  </label>
</form>
<ul id="problems"></ul>
<pre id="json"></pre>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
label { display: block; margin: 6px 0; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 8px; font-size: 13px; overflow-x: auto; }
#problems li { color: crimson; } #problems li.good { color: seagreen; }`,
        js: `const form = document.getElementById('f');
function build() {
  const d = Object.fromEntries(new FormData(form));
  const manifest = {
    name: d.name,
    short_name: d.short_name,
    start_url: '/',
    display: d.display,
    background_color: '#ffffff',
    theme_color: d.theme_color,
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
  };
  const problems = [];
  if (!manifest.name.trim()) problems.push('name is required');
  if (manifest.short_name.length > 12) problems.push('short_name longer than 12 chars may be cut off under the icon');
  if (manifest.display === 'browser') problems.push('display "browser" will not open as an app window');
  const sizes = manifest.icons.map((i) => i.sizes);
  if (!sizes.includes('192x192') || !sizes.includes('512x512')) problems.push('need 192x192 and 512x512 icons');
  document.getElementById('problems').innerHTML = problems.length
    ? problems.map((p) => '<li>' + p + '</li>').join('')
    : '<li class="good">Looks installable (plus HTTPS + service worker)</li>';
  document.getElementById('json').textContent = JSON.stringify(manifest, null, 2);
  document.body.style.borderTop = '8px solid ' + manifest.theme_color;
}
form.addEventListener('input', build);
build();
console.log('Edit the fields to regenerate the manifest');`,
      },
      result: 'A live JSON manifest preview, a green "Looks installable" message, and a coloured top border matching theme_color. Choosing display "browser" or a long short_name shows red warnings.',
      explanation: 'The manifest is just JSON. In a real project you save this text as manifest.webmanifest and link it with <link rel="manifest">. Browsers check name, icons, start_url and display to decide if the app is installable.',
    },
    {
      title: 'Offline detection and a simulated cache-first strategy',
      scenario: 'Simulate what a service worker does: answer from a cache if possible, otherwise go to the network and store the result. Toggle a fake "offline" switch to see the fallback.',
      steps: [
        'Create a Map called cache and a fakeOffline checkbox',
        'Write cacheFirst(url): return cached response if present, else fetch and store it',
        'If offline and not cached, return an "offline" fallback message',
        'Listen to the real online/offline events too',
        'Click Run, load a post, tick "Simulate offline" and load again',
      ],
      code: `// What a real sw.js fetch handler does (cache first):
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((cached) =>
      cached || fetch(e.request).then((res) => {
        const copy = res.clone();
        caches.open('v1').then((c) => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match('/offline.html'))
    )
  );
});`,
      playground: {
        html: `<p>Real network status: <strong id="net"></strong></p>
<label><input type="checkbox" id="offline"> Simulate offline</label>
<p>
  <button data-id="1">Load post 1</button>
  <button data-id="2">Load post 2</button>
  <button data-id="3">Load post 3</button>
</p>
<div id="out"></div>
<ol id="log"></ol>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#out { padding: 10px; background: #f4f6fb; border-radius: 6px; min-height: 40px; }
#log { font-size: 13px; color: #555; }`,
        js: `const cache = new Map();
const out = document.getElementById('out');
const logEl = document.getElementById('log');
const log = (t) => { const li = document.createElement('li'); li.textContent = t; logEl.appendChild(li); console.log(t); };
const showNet = () => { document.getElementById('net').textContent = navigator.onLine ? 'online' : 'offline'; };
window.addEventListener('online', showNet);
window.addEventListener('offline', showNet);
showNet();

async function cacheFirst(url) {
  if (cache.has(url)) { log('CACHE HIT  ' + url); return cache.get(url); }
  if (document.getElementById('offline').checked) {
    log('OFFLINE + not cached ' + url + ' → fallback');
    return { title: 'You are offline', body: 'This post was not saved yet. Try one you opened before.' };
  }
  log('NETWORK    ' + url);
  const res = await fetch(url);
  const data = await res.json();
  cache.set(url, data);
  return data;
}
document.querySelectorAll('[data-id]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    try {
      const post = await cacheFirst('https://jsonplaceholder.typicode.com/posts/' + btn.dataset.id);
      out.innerHTML = '<strong></strong><p></p>';
      out.querySelector('strong').textContent = post.title;
      out.querySelector('p').textContent = post.body;
    } catch (err) {
      out.textContent = 'Network error: ' + err.message;
    }
  });
});`,
      },
      result: 'First click on a post logs NETWORK, the second CACHE HIT. With "Simulate offline" ticked, already-loaded posts still appear from cache, new ones show the "You are offline" fallback.',
      explanation: 'This is exactly the decision a service worker makes in its fetch handler, but with a Map instead of the Cache API so it runs in any sandbox. In a real PWA, the code in `code` uses caches.match / cache.put and works even when the page is reloaded without network.',
    },
  ],
  interview: [
    { q: 'What is a Progressive Web App?', a: 'A web application that uses modern web capabilities (manifest, service worker, HTTPS) to be installable, reliable offline, fast and engaging like a native app, while still working as a normal website in any browser.', level: 'Easy' },
    { q: 'What are the minimum requirements for a PWA to be installable?', a: 'Served over HTTPS (or localhost), a linked web app manifest with name/short_name, start_url, display (standalone, fullscreen or minimal-ui) and 192px + 512px icons, and (for many browsers) a registered service worker.', level: 'Medium' },
    { q: 'What is a service worker?', a: 'A script that runs in the background separate from the page, acting as a programmable network proxy. It can intercept requests (fetch event), cache responses, enable offline use, background sync and push notifications. It has no DOM access.', level: 'Easy' },
    { q: 'Explain the service worker lifecycle.', a: 'register → install (pre-cache assets with event.waitUntil) → waiting (if an older SW controls pages) → activate (clean old caches, clients.claim) → idle/fetch/terminated. Updates are detected when the sw.js file changes byte-for-byte.', level: 'Hard' },
    { q: 'What is the difference between cache-first and network-first?', a: 'Cache-first serves from cache and only fetches if missing (fast, good for static assets). Network-first tries the network and falls back to cache when offline (fresh data, good for API content).', level: 'Medium' },
    { q: 'What is stale-while-revalidate?', a: 'Respond immediately with the cached version, then fetch a fresh copy in the background to update the cache for the next request.', level: 'Medium' },
    { q: 'Why must service workers be served over HTTPS?', a: 'They can intercept and modify every request of the site, so a hijacked service worker would be extremely dangerous. HTTPS ensures the script has not been tampered with. localhost is allowed for development.', level: 'Medium' },
    { q: 'What does the scope of a service worker mean?', a: 'The URL path range it controls, by default the directory of the sw file. /sw.js controls the entire origin; /app/sw.js controls only /app/ pages.', level: 'Medium' },
    { q: 'How do you update cached files after a new release?', a: 'Change the cache name/version (e.g. v2) and the sw.js file, pre-cache new assets on install, delete old caches in activate, and optionally use skipWaiting + clients.claim or prompt the user to reload.', level: 'Hard' },
    { q: 'How can you detect whether the app is running installed?', a: 'window.matchMedia("(display-mode: standalone)").matches (and navigator.standalone on iOS Safari).', level: 'Hard' },
    { q: 'What tools help build and audit PWAs?', a: 'Chrome DevTools Application panel, Lighthouse, Workbox for generating service workers, and framework plugins like vite-plugin-pwa.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write the <head> of an index.html that links a manifest, sets a theme colour, an apple-touch-icon and a viewport.',
      hint: 'link rel="manifest", meta name="theme-color".',
      solution: `<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Daily Notes</title>
  <link rel="manifest" href="/manifest.webmanifest">
  <meta name="theme-color" content="#0d9488">
  <link rel="icon" href="/icons/icon-192.png">
  <link rel="apple-touch-icon" href="/icons/icon-192.png">
</head>`,
    },
    {
      task: 'Write a sw.js that pre-caches the app shell and serves an offline.html page when navigation fails.',
      hint: 'Check e.request.mode === "navigate" in fetch.',
      solution: `const CACHE = 'shell-v1';
const ASSETS = ['/', '/index.html', '/styles.css', '/app.js', '/offline.html'];
self.addEventListener('install', (e) => e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS))));
self.addEventListener('activate', (e) => e.waitUntil(
  caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
));
self.addEventListener('fetch', (e) => {
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).catch(() => caches.match('/offline.html')));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request)));
});`,
    },
    {
      task: 'Show a banner "You are offline" when the connection drops and hide it when it comes back.',
      hint: 'online/offline events + navigator.onLine.',
      solution: `<div id="banner" hidden style="background:#b91c1c;color:#fff;padding:8px">You are offline</div>
<script>
  const b = document.getElementById('banner');
  const update = () => { b.hidden = navigator.onLine; };
  window.addEventListener('online', update);
  window.addEventListener('offline', update);
  update();
</script>`,
    },
    {
      task: 'Add a custom "Install app" button using the beforeinstallprompt event (Chromium browsers).',
      hint: 'Save the event, call prompt() on click, then read userChoice.',
      solution: `<button id="install" hidden>Install app</button>
<script>
  let deferred;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e;
    document.getElementById('install').hidden = false;
  });
  document.getElementById('install').addEventListener('click', async () => {
    deferred.prompt();
    const { outcome } = await deferred.userChoice;
    console.log('User choice:', outcome);
    deferred = null;
    document.getElementById('install').hidden = true;
  });
</script>`,
    },
    {
      task: 'Register a service worker only after the page has loaded, and log its scope or error.',
      hint: 'window.addEventListener("load", ...).',
      solution: `<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => console.log('Registered, scope:', reg.scope))
        .catch((err) => console.error('Registration failed:', err));
    });
  }
</script>`,
    },
  ],
  quiz: [
    { question: 'Which file describes the app name, icons and display mode of a PWA?', options: ['sw.js', 'package.json', 'Web app manifest', 'robots.txt'], answer: 2, explanation: 'The manifest (manifest.webmanifest / manifest.json) holds install metadata.' },
    { question: 'Which service worker event is used to pre-cache files?', options: ['install', 'activate', 'fetch', 'message'], answer: 0, explanation: 'Assets are cached during install with event.waitUntil.' },
    { question: 'Which display value opens the app in its own window without browser UI?', options: ['browser', 'inline', 'block', 'standalone'], answer: 3, explanation: 'standalone looks like a native app window.' },
    { question: 'Which strategy is best for static CSS/JS files that change only with new versions?', options: ['Network only', 'Cache first', 'Network first', 'No caching'], answer: 1, explanation: 'Cache-first serves versioned static assets instantly.' },
    { question: 'Why can\'t this course playground register a service worker?', options: ['Service workers are deprecated', 'It needs a real same-origin file in a secure, non-sandboxed context', 'It requires React', 'Service workers only work on Android'], answer: 1, explanation: 'SW registration requires a script URL on the same origin and a secure, non-opaque origin.' },
  ],
};
