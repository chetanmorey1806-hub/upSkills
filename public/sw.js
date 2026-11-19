// UpSkillr service worker: lets the app open offline and makes repeat visits fast.
// - app files (/assets/*, hashed by Vite): cache-first – all lessons live inside these files
// - page loads: network-first, falling back to the cached app shell when offline
// - other same-origin files: stale-while-revalidate
// Cross-origin requests (CDNs, APIs, Claude) are never touched.
const VERSION = 'upskillr-v2';
const SHELL = ['./', './index.html', './manifest.webmanifest', './logo.svg', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION && k !== 'upskillr-reminder').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then((res) => { const copy = res.clone(); caches.open(VERSION).then((c) => c.put('./index.html', copy)); return res; })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./'))),
    );
    return;
  }

  if (url.pathname.includes('/assets/')) {
    e.respondWith(
      caches.match(req).then((hit) => hit || fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      })),
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req).then((res) => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(req, copy)); }
        return res;
      }).catch(() => hit);
      return hit || net;
    }),
  );
});

// ---------- study reminders (installed app + Periodic Background Sync) ----------
const toLocalDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
self.addEventListener('periodicsync', (e) => {
  if (e.tag !== 'upskillr-reminder') return;
  e.waitUntil((async () => {
    const c = await caches.open('upskillr-reminder');
    const res = await c.match('./__reminder-state.json');
    if (!res) return;
    const st = await res.json();
    const today = toLocalDay();
    if (!st.enabled || st.last === today || st.bgLast === today) return;
    const [h, m] = String(st.time || '19:00').split(':').map(Number);
    const now = new Date();
    if (now.getHours() * 60 + now.getMinutes() < h * 60 + m) return;
    const msg = st.day === today && st.msg ? st.msg : { title: '📚 Time to study', body: 'Open UpSkillr for today\'s plan and revision.', url: './#/today' };
    await self.registration.showNotification(msg.title, { body: msg.body, icon: './icon-192.png', badge: './icon-192.png', tag: 'upskillr-daily', data: { url: msg.url } });
    await c.put('./__reminder-state.json', new Response(JSON.stringify({ ...st, bgLast: today }), { headers: { 'Content-Type': 'application/json' } }));
  })());
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const url = new URL(e.notification.data?.url || './#/today', self.registration.scope).href;
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    const w = list.find((c) => c.url.startsWith(self.registration.scope));
    if (w) { w.navigate(url).catch(() => {}); return w.focus(); }
    return self.clients.openWindow(url);
  }));
});
