export default {
  id: 'extra-11-geolocation-api',
  title: 'Geolocation API: getCurrentPosition, watchPosition, Permissions and Errors',
  module: 'Extra: HTML5 Browser APIs',
  extraNo: 11,
  level: 'Intermediate',
  duration: '1.5 hours',
  summary: 'The Geolocation API lets a web page ask the user for their location (latitude/longitude) with permission. You will learn to request the position once or continuously, handle errors and denials gracefully, and respect privacy and security requirements.',
  objectives: [
    'Detect support and request the location with navigator.geolocation.getCurrentPosition',
    'Read coords (latitude, longitude, accuracy) and the timestamp',
    'Handle the three error codes and design a fallback',
    'Use options (enableHighAccuracy, timeout, maximumAge) and watchPosition/clearWatch',
    'Explain the security rules: HTTPS, user permission and iframe permissions policy',
  ],
  theory: [
    {
      heading: 'What is the Geolocation API?',
      content: `It is a browser feature that answers the question "Where is this device?". The browser figures it out using GPS (on phones), Wi-Fi networks, cell towers or IP address, and returns **latitude**, **longitude** and an **accuracy** radius in metres.

Real-world uses: "find stores near me", delivery address auto-fill, weather for your city, fitness route tracking.

Because location is personal data, the browser **always asks the user** first with a permission prompt. Think of it like a delivery app asking "May I see where you are?": the user can say yes or no, and your page must work in both cases.`,
    },
    {
      heading: 'Getting the position once',
      content: `\`navigator.geolocation.getCurrentPosition(success, error, options)\` is **asynchronous** and callback-based:
- \`success(position)\` receives a \`GeolocationPosition\` with \`position.coords.latitude\`, \`longitude\`, \`accuracy\` (metres), and sometimes \`altitude\`, \`speed\`, \`heading\`, plus \`position.timestamp\`.
- \`error(err)\` receives a \`GeolocationPositionError\` with \`code\` and \`message\`.

Always check support first: \`if ('geolocation' in navigator)\`.`,
      syntax: `if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(
    (pos) => console.log(pos.coords.latitude, pos.coords.longitude),
    (err) => console.log('Error', err.code, err.message)
  );
}`,
      tip: 'Best practice: ask for location only after a user action (e.g. clicking "Use my location"), not on page load. Unexpected prompts get denied.',
    },
    {
      heading: 'Errors and options',
      content: `Error codes:
1. \`PERMISSION_DENIED\` – user (or the page's permissions policy) said no.
2. \`POSITION_UNAVAILABLE\` – the device could not determine a location.
3. \`TIMEOUT\` – it took longer than \`timeout\`.

Options object (third argument):
- \`enableHighAccuracy: true\` – try GPS; more precise but slower and uses more battery.
- \`timeout: 10000\` – max milliseconds to wait (default Infinity!).
- \`maximumAge: 60000\` – accept a cached position up to this many ms old (0 = always fresh).

Always provide a **fallback**: let the user type a city or PIN code if location fails.`,
      syntax: `navigator.geolocation.getCurrentPosition(ok, fail, {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 0,
});`,
    },
    {
      heading: 'Tracking with watchPosition',
      content: `\`watchPosition(success, error, options)\` calls \`success\` every time the position changes, which is useful for navigation or run tracking. It returns an **id**; stop tracking with \`navigator.geolocation.clearWatch(id)\` to save battery when it is no longer needed (e.g. when the user stops the run or leaves the page).`,
      syntax: `const id = navigator.geolocation.watchPosition(updateMap, showError);
// later
navigator.geolocation.clearWatch(id);`,
    },
    {
      heading: 'Security, privacy and iframes',
      content: `- Works only in a **secure context**: HTTPS or \`http://localhost\`. On plain HTTP it is blocked.
- Requires **user permission** per site; users can revoke it anytime in browser settings.
- Inside an **iframe**, the parent page must allow it: \`<iframe src="..." allow="geolocation">\`. Many online code playgrounds (including this course's sandboxed preview) do not grant it, so you will likely see PERMISSION_DENIED here. That is a perfect chance to test your error handling! To test real location, save the code as a file and open it via \`http://localhost\` (e.g. VS Code Live Server).
- You can check permission state without prompting: \`navigator.permissions.query({ name: 'geolocation' })\` → \`granted\`, \`denied\` or \`prompt\`.
- Only collect location when needed, explain why, and do not store it longer than necessary.`,
    },
  ],
  examples: [
    {
      title: '"Use my location" button with full error handling',
      scenario: 'A button asks for the location. In a normal HTTPS page it shows the coordinates and a map link; in this sandboxed preview it will most likely show the friendly "permission denied" message.',
      steps: [
        'Create a button and an output paragraph',
        'Check "geolocation" in navigator',
        'Call getCurrentPosition with success, error and options {timeout: 8000}',
        'In success show lat/long/accuracy and an OpenStreetMap link',
        'In error switch on err.code and show a helpful message',
        'Click Run, then press the button',
      ],
      code: `navigator.geolocation.getCurrentPosition(
  (pos) => {
    const { latitude, longitude, accuracy } = pos.coords;
    out.textContent = latitude + ', ' + longitude + ' (±' + Math.round(accuracy) + ' m)';
  },
  (err) => {
    if (err.code === err.PERMISSION_DENIED) out.textContent = 'Permission denied';
  },
  { timeout: 8000, maximumAge: 60000 }
);`,
      playground: {
        html: `<button id="locate">📍 Use my location</button>
<p id="out">Press the button.</p>
<p id="map"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#out { padding: 10px; background: #f4f6fb; border-radius: 6px; }`,
        js: `const out = document.getElementById('out');
const map = document.getElementById('map');
document.getElementById('locate').addEventListener('click', () => {
  if (!('geolocation' in navigator)) {
    out.textContent = 'Geolocation is not supported in this browser.';
    return;
  }
  out.textContent = 'Asking for permission…';
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const { latitude, longitude, accuracy } = pos.coords;
      out.textContent = 'Lat ' + latitude.toFixed(5) + ', Long ' + longitude.toFixed(5) +
        ' (accuracy ±' + Math.round(accuracy) + ' m) at ' + new Date(pos.timestamp).toLocaleTimeString();
      const url = 'https://www.openstreetmap.org/?mlat=' + latitude + '&mlon=' + longitude + '#map=15/' + latitude + '/' + longitude;
      map.innerHTML = '<a href="' + url + '" target="_blank" rel="noopener">Open on OpenStreetMap</a>';
      console.log(pos.coords);
    },
    (err) => {
      const messages = {
        1: 'Permission denied. (In this sandboxed preview that is expected – the iframe is not allowed to use geolocation. Try the code on https or localhost.)',
        2: 'Position unavailable. Check that location services are on.',
        3: 'Timed out. Try again or enter your city manually.',
      };
      out.textContent = 'Error ' + err.code + ': ' + (messages[err.code] || err.message);
      console.log('Geolocation error', err.code, err.message);
    },
    { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
  );
});`,
      },
      result: 'On a secure page with permission granted: coordinates, accuracy, time and a map link. In the sandboxed playground: usually "Error 1: Permission denied…" with an explanation.',
      explanation: 'getCurrentPosition never returns the value directly; it calls one of the callbacks later. The error object has numeric codes 1–3 (also available as constants like err.PERMISSION_DENIED). The timeout prevents waiting forever.',
    },
    {
      title: 'Check permission state and offer a manual fallback',
      scenario: 'Before asking, check if permission is already granted/denied. If denied or unavailable, let the user pick a city from a list. The distance-to-store logic works either way.',
      steps: [
        'Query navigator.permissions for "geolocation" and display the state',
        'Create a <select> of cities with data-lat and data-lon',
        'Write a haversine distance function',
        'Compute the distance from the chosen city to a store',
        'Click Run and pick different cities',
      ],
      code: `const status = await navigator.permissions.query({ name: 'geolocation' });
console.log(status.state); // "granted" | "denied" | "prompt"

function distanceKm(lat1, lon1, lat2, lon2) { /* haversine */ }`,
      playground: {
        html: `<p>Permission state: <strong id="state">checking…</strong></p>
<label>Or choose your city:
  <select id="city">
    <option value="">-- select --</option>
    <option data-lat="19.0760" data-lon="72.8777">Mumbai</option>
    <option data-lat="28.6139" data-lon="77.2090">Delhi</option>
    <option data-lat="12.9716" data-lon="77.5946">Bengaluru</option>
    <option data-lat="22.5726" data-lon="88.3639">Kolkata</option>
  </select>
</label>
<p id="dist"></p>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#dist { font-size: 18px; color: teal; }`,
        js: `const store = { name: 'Pune store', lat: 18.5204, lon: 73.8567 };
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const toRad = (d) => d * Math.PI / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}
(async () => {
  const el = document.getElementById('state');
  try {
    if (!navigator.permissions) throw new Error('Permissions API not supported');
    const status = await navigator.permissions.query({ name: 'geolocation' });
    el.textContent = status.state;
    status.onchange = () => { el.textContent = status.state; };
  } catch (e) {
    el.textContent = 'unknown (' + e.message + ')';
  }
})();
document.getElementById('city').addEventListener('change', (e) => {
  const opt = e.target.selectedOptions[0];
  if (!opt.dataset.lat) return;
  const km = distanceKm(Number(opt.dataset.lat), Number(opt.dataset.lon), store.lat, store.lon);
  const text = opt.textContent + ' → ' + store.name + ': ' + Math.round(km) + ' km';
  document.getElementById('dist').textContent = text;
  console.log(text);
});
console.log('Mumbai to Pune ≈', Math.round(distanceKm(19.076, 72.8777, 18.5204, 73.8567)), 'km');`,
      },
      result: 'The permission state is shown (often "denied" or "prompt" in the sandbox). Choosing Mumbai shows about 120 km to the Pune store; Delhi about 1170 km.',
      explanation: 'permissions.query reads the state without triggering a prompt. The fallback select lets every user continue. The haversine formula computes great-circle distance between two lat/long points; you would plug real coords from getCurrentPosition into the same function.',
    },
    {
      title: 'watchPosition with a simulated route',
      scenario: 'Start/stop live tracking. Because the sandbox blocks real geolocation, a "simulate" mode feeds fake positions through the same callback so you can see how tracking code behaves.',
      steps: [
        'Create Start, Stop and Simulate buttons and a log list',
        'Start calls watchPosition and stores the id',
        'Stop calls clearWatch(id) (and stops the simulation)',
        'Simulate calls the same onPosition function every second with fake coords',
        'Click Run, press Start (see the error) then Simulate',
      ],
      code: `const id = navigator.geolocation.watchPosition(onPosition, onError, { enableHighAccuracy: true });
// later
navigator.geolocation.clearWatch(id);`,
      playground: {
        html: `<button id="start">Start real tracking</button>
<button id="sim">Simulate walk</button>
<button id="stop">Stop</button>
<p>Total distance: <strong id="total">0</strong> m</p>
<ol id="log"></ol>`,
        css: `body { font-family: system-ui, sans-serif; padding: 16px; }
#log { font-family: monospace; font-size: 13px; }`,
        js: `let watchId = null, simTimer = null, last = null, total = 0;
const log = (t) => { const li = document.createElement('li'); li.textContent = t; document.getElementById('log').appendChild(li); };
function meters(a, b) {
  const R = 6371000, r = (d) => d * Math.PI / 180;
  const h = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 +
    Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
function onPosition(pos) {
  const c = pos.coords;
  if (last) total += meters(last, c);
  last = c;
  document.getElementById('total').textContent = Math.round(total);
  log(c.latitude.toFixed(5) + ', ' + c.longitude.toFixed(5));
}
function onError(err) { log('Error ' + err.code + ': ' + err.message + ' – try "Simulate walk"'); }
document.getElementById('start').onclick = () => {
  if (!navigator.geolocation) return log('Not supported');
  watchId = navigator.geolocation.watchPosition(onPosition, onError, { enableHighAccuracy: true, timeout: 10000 });
  log('watchPosition started, id = ' + watchId);
};
document.getElementById('sim').onclick = () => {
  let lat = 18.5204, lon = 73.8567;
  clearInterval(simTimer);
  simTimer = setInterval(() => {
    lat += 0.0002; lon += 0.0001;
    onPosition({ coords: { latitude: lat, longitude: lon, accuracy: 5 }, timestamp: Date.now() });
  }, 1000);
  log('Simulation started');
};
document.getElementById('stop').onclick = () => {
  if (watchId !== null) { navigator.geolocation.clearWatch(watchId); watchId = null; }
  clearInterval(simTimer);
  log('Stopped');
  console.log('Total distance (m):', Math.round(total));
};`,
      },
      result: '"Start real tracking" logs an id and, in the sandbox, a permission error. "Simulate walk" adds a new coordinate every second and the total distance grows by about 24 m per step. "Stop" ends both.',
      explanation: 'watchPosition returns an id used by clearWatch. Keeping the position handling in one function (onPosition) means you can test it with fake data, which is also how developers test location features (Chrome DevTools > Sensors can fake a location too).',
    },
  ],
  interview: [
    { q: 'How do you get the user\'s current location in the browser?', a: 'navigator.geolocation.getCurrentPosition(successCallback, errorCallback, options). The success callback receives a position with coords.latitude, coords.longitude and coords.accuracy.', level: 'Easy' },
    { q: 'Why does the Geolocation API need user permission and HTTPS?', a: 'Location is sensitive personal data. Browsers require explicit consent and a secure context (HTTPS or localhost) to prevent tracking and man-in-the-middle tampering.', level: 'Easy' },
    { q: 'What are the error codes of the Geolocation API?', a: '1 PERMISSION_DENIED, 2 POSITION_UNAVAILABLE, 3 TIMEOUT.', level: 'Medium' },
    { q: 'Explain enableHighAccuracy, timeout and maximumAge.', a: 'enableHighAccuracy requests the most accurate source (GPS) at the cost of time/battery; timeout is the maximum wait in ms before a TIMEOUT error; maximumAge allows returning a cached position not older than this many ms.', level: 'Medium' },
    { q: 'What is the difference between getCurrentPosition and watchPosition?', a: 'getCurrentPosition gets one position. watchPosition calls the success callback every time the position changes and returns an id that must be passed to clearWatch to stop.', level: 'Easy' },
    { q: 'Why might geolocation fail inside an iframe?', a: 'Cross-origin iframes need the parent to delegate permission via allow="geolocation" (Permissions Policy). Sandboxed iframes without it get PERMISSION_DENIED.', level: 'Hard' },
    { q: 'How can you check the permission without showing a prompt?', a: 'navigator.permissions.query({ name: "geolocation" }) returns a PermissionStatus with state granted, denied or prompt and an onchange event.', level: 'Medium' },
    { q: 'How would you promisify getCurrentPosition?', a: 'const getPos = (opts) => new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, opts)); then const pos = await getPos({ timeout: 5000 });', level: 'Hard' },
    { q: 'What UX best practices apply to location requests?', a: 'Ask only after a user action, explain why, handle denial gracefully with a manual fallback (city/PIN input), set a timeout, and stop watching when not needed.', level: 'Medium' },
    { q: 'What does coords.accuracy represent?', a: 'The radius in metres of a 95% confidence circle around the reported latitude/longitude.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a getPosition() function that returns a Promise and use it with async/await and try/catch.',
      hint: 'Wrap getCurrentPosition in new Promise.',
      solution: `<button id="b">Where am I?</button>
<script>
  const getPosition = (options) =>
    new Promise((resolve, reject) => navigator.geolocation.getCurrentPosition(resolve, reject, options));
  document.getElementById('b').onclick = async () => {
    try {
      const pos = await getPosition({ timeout: 5000 });
      console.log(pos.coords.latitude, pos.coords.longitude);
    } catch (err) {
      console.log('Failed:', err.code, err.message);
    }
  };
</script>`,
    },
    {
      task: 'Show a message "Geolocation not supported" if the API is missing, otherwise show a "Locate me" button.',
      hint: 'Feature-detect with "geolocation" in navigator and use hidden.',
      solution: `<p id="no" hidden>Geolocation not supported</p>
<button id="yes" hidden>Locate me</button>
<script>
  if ('geolocation' in navigator) document.getElementById('yes').hidden = false;
  else document.getElementById('no').hidden = false;
</script>`,
    },
    {
      task: 'Build a "Nearest store" feature: given 3 stores with coordinates and a user position, print the nearest one. Test with a fake position.',
      hint: 'Reuse the haversine function and sort by distance.',
      solution: `<script>
  const stores = [
    { name: 'Andheri', lat: 19.1136, lon: 72.8697 },
    { name: 'Thane', lat: 19.2183, lon: 72.9781 },
    { name: 'Pune', lat: 18.5204, lon: 73.8567 },
  ];
  function km(a, b) {
    const r = (d) => d * Math.PI / 180, R = 6371;
    const h = Math.sin(r(b.lat - a.lat) / 2) ** 2 + Math.cos(r(a.lat)) * Math.cos(r(b.lat)) * Math.sin(r(b.lon - a.lon) / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  function nearest(user) {
    return stores.map((s) => ({ ...s, d: km(user, s) })).sort((x, y) => x.d - y.d)[0];
  }
  const fakeUser = { lat: 19.07, lon: 72.88 };
  const n = nearest(fakeUser);
  console.log('Nearest:', n.name, n.d.toFixed(1) + ' km');
</script>`,
    },
    {
      task: 'Use watchPosition to show live accuracy, and a Stop button that calls clearWatch.',
      hint: 'Save the id returned by watchPosition.',
      solution: `<p id="acc">–</p><button id="stop">Stop</button>
<script>
  const id = navigator.geolocation.watchPosition(
    (p) => { document.getElementById('acc').textContent = '±' + Math.round(p.coords.accuracy) + ' m'; },
    (e) => { document.getElementById('acc').textContent = 'Error: ' + e.message; },
    { enableHighAccuracy: true }
  );
  document.getElementById('stop').onclick = () => navigator.geolocation.clearWatch(id);
</script>`,
    },
  ],
  quiz: [
    { question: 'Which object provides the Geolocation API?', options: ['window.location', 'navigator.geolocation', 'document.geo', 'window.gps'], answer: 1, explanation: 'navigator.geolocation (window.location is the page URL).' },
    { question: 'What does error code 1 mean?', options: ['TIMEOUT', 'POSITION_UNAVAILABLE', 'PERMISSION_DENIED', 'NOT_SUPPORTED'], answer: 2, explanation: '1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT.' },
    { question: 'Which option allows a cached position to be returned?', options: ['maximumAge', 'cache', 'timeout', 'enableHighAccuracy'], answer: 0, explanation: 'maximumAge sets how old a cached position may be.' },
    { question: 'How do you stop a watchPosition?', options: ['navigator.geolocation.stop()', 'clearInterval(id)', 'watchPosition(null)', 'navigator.geolocation.clearWatch(id)'], answer: 3, explanation: 'Pass the id returned by watchPosition to clearWatch.' },
    { question: 'On which page will geolocation be blocked?', options: ['https://shop.com', 'http://localhost:5500', 'http://shop.com (plain HTTP)', 'https://localhost'], answer: 2, explanation: 'Geolocation requires a secure context; plain HTTP (except localhost) is blocked.' },
  ],
};
