export default {
  id: 'day-57-final-project-weather-app',
  title: 'Final Project 1: Temperature / Weather App (React Web + React Native) with Open-Meteo',
  module: 'Module 12: React Native & Final Projects',
  day: 57,
  level: 'Advanced',
  duration: '5 hours',
  summary:
    "Your first portfolio project: a production-quality weather app built twice, once for the web (React + Vite) and once for mobile (React Native + Expo). It uses the free Open-Meteo API for city search, current weather, hourly and 7-day forecasts, supports current location, a °C/°F toggle and favourite cities saved locally, with proper loading and error states, and ends with deployment.",
  objectives: [
    'Turn a project brief into user stories, a folder structure and an API service layer',
    'Call the Open-Meteo geocoding and forecast APIs safely (AbortController, errors, empty results)',
    'Build reusable hooks: useWeather, useDebounce and useLocalStorage (web) / an in-memory store (mobile)',
    'Implement current location, °C/°F toggle, hourly + 7-day forecast and favourite cities',
    'Deploy the web app to Vercel/Netlify and build the mobile app with Expo EAS',
  ],
  theory: [
    {
      heading: 'Project brief, user stories and acceptance criteria',
      content:
        "Companies never say \"make a weather app\". A product manager writes **user stories** (As a <user>, I want <feature>, so that <benefit>) with **acceptance criteria**. Practise this format; interviewers love candidates who can explain requirements before code.\n\n**User stories for \"MausamNow\":**\n1. As a user, I want to **search a city** (e.g. \"Nagpur\") and pick from suggestions, so that I get the right place (there are several cities called \"Aurangabad\").\n2. As a user, I want to see **current weather**: temperature, feels like, condition with an icon, humidity and wind.\n3. As a user, I want an **hourly forecast for the next 24 hours** and a **7-day forecast** with min/max.\n4. As a user, I want to use my **current location** with one tap.\n5. As a user, I want to switch between **°C and °F** without reloading.\n6. As a user, I want to **save favourite cities** that are still there tomorrow (localStorage on web, AsyncStorage on mobile).\n7. As a user, I want clear **loading** and **error** states (city not found, no internet, location denied) with a Retry button.\n\n**Non-functional requirements:** responsive (360px phones to desktop), accessible (labels, keyboard use, contrast), fast (no request on every keystroke: debounce), no API key in the code, deployed on a public URL.",
      points: [
        'Definition of done: feature works, handles loading/error/empty, is responsive and accessible, and is deployed',
        'Write the stories in the README: reviewers read it before the code',
        'Mobile app = same stories, native UI (FlatList, Pressable, expo-location, AsyncStorage)',
      ],
    },
    {
      heading: 'Understanding the Open-Meteo API',
      content:
        "Open-Meteo is free for non-commercial use and needs **no API key**, and it sends CORS headers, so the browser can call it directly.\n\n**1. Geocoding (city to coordinates):** `https://geocoding-api.open-meteo.com/v1/search?name=Pune&count=5`\nReturns `{ results: [{ id, name, latitude, longitude, country, country_code, admin1 (state), timezone }] }`. When nothing matches, the `results` key is **missing**, so always write `data.results ?? []`.\n\n**2. Forecast:** `https://api.open-meteo.com/v1/forecast?latitude=18.52&longitude=73.86&current=...&hourly=...&daily=...&timezone=auto&forecast_days=7`\n- `current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day` returns `current.temperature_2m` etc.\n- `hourly=temperature_2m,weather_code,precipitation_probability` returns parallel arrays: `hourly.time[i]`, `hourly.temperature_2m[i]` (168 values for 7 days)\n- `daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset` returns `daily.time` like \"2026-11-20\" and arrays of values\n- `timezone=auto` returns times in the **city's local time** (\"2026-11-20T14:00\"), not UTC\n\n**3. WMO weather codes:** `weather_code` is a number: 0 clear, 1-3 partly cloudy/overcast, 45/48 fog, 51-57 drizzle, 61-67 rain, 71-77 snow, 80-82 showers, 95-99 thunderstorm. You map it to a label and an icon.\n\n**Units:** values come in °C, km/h. You can request `temperature_unit=fahrenheit`, but for a toggle it is better to convert on the client (`F = C × 9/5 + 32`) so switching does not need another request.",
      syntax:
        "// parallel arrays: zip them into objects for easy rendering\nconst days = data.daily.time.map((date, i) => ({\n  date,\n  max: data.daily.temperature_2m_max[i],\n  min: data.daily.temperature_2m_min[i],\n  code: data.daily.weather_code[i],\n}));",
      tip: 'Date trap: new Date("2026-11-20") is parsed as UTC midnight, which shows the previous day for users west of UTC. Use new Date("2026-11-20T00:00") (local time) or just format the string. For hourly times, slice(11, 16) gives "14:00" in the city\'s own time.',
    },
    {
      heading: 'Architecture and folder structure',
      content:
        "Keep **API code, hooks, utilities and UI separate**. The same `api` and `utils` files can be copied (or shared in a monorepo) between the web and mobile apps; only the components differ.\n\n**Web (Vite + React):**\n- `src/api/weather.js`: `searchCities()`, `getForecast()` (the only place that knows URLs)\n- `src/utils/weatherCodes.js`, `src/utils/units.js`: pure functions, easy to unit test\n- `src/hooks/useDebounce.js`, `useLocalStorage.js`, `useWeather.js`\n- `src/components/SearchBar.jsx`, `CurrentWeather.jsx`, `HourlyForecast.jsx`, `DailyForecast.jsx`, `Favourites.jsx`, `UnitToggle.jsx`, `ErrorState.jsx`, `Skeleton.jsx`\n- `src/App.jsx`: composes everything and owns the selected place + unit\n\n**Mobile (Expo):**\n- `App.js` (or `app/` with Expo Router), `src/api/weather.js` (same file), `src/hooks/useFavourites.js` (AsyncStorage), `src/screens/HomeScreen.js`, `src/components/...`\n\n**State design:** `place` (name, lat, lon), `unit` ('C' | 'F'), `favourites` (array, persisted), and server state `{ data, loading, error }` inside `useWeather(place)`. The forecast is **derived** from place, so it lives in a hook, not in App state. With TanStack Query (Day 37) `useWeather` becomes `useQuery({ queryKey: ['weather', lat, lon], queryFn })` with caching for free.",
      syntax:
        "weather-app/\n├─ src/\n│  ├─ api/weather.js\n│  ├─ hooks/useDebounce.js  useLocalStorage.js  useWeather.js\n│  ├─ utils/weatherCodes.js  units.js\n│  ├─ components/SearchBar.jsx  CurrentWeather.jsx  HourlyForecast.jsx\n│  │             DailyForecast.jsx  Favourites.jsx  ErrorState.jsx\n│  ├─ App.jsx  main.jsx  index.css\n├─ index.html  vite.config.js  README.md",
    },
    {
      heading: 'Loading, errors, race conditions and current location',
      content:
        "**Three states for every request:** loading (skeleton or spinner), error (message + Retry), success. Also an **empty** state (\"Search a city to begin\", \"No cities found\").\n\n**Race conditions:** if the user picks Delhi and then quickly Chennai, the Delhi response may arrive last and overwrite Chennai. Fix: create an `AbortController` in the effect and call `controller.abort()` in the cleanup, then ignore `AbortError` in the catch.\n\n**Debounce search:** call the geocoding API 400 ms after the user stops typing, not on every key press (`useDebounce`). Also skip queries shorter than 2 characters.\n\n**Current location (web):** `navigator.geolocation.getCurrentPosition(success, error, { timeout: 10000 })`. It works only on **HTTPS or localhost**, the user must allow it, and it may fail (denied = code 1, unavailable = 2, timeout = 3). Always have a fallback (keep the last city or show a message).\n\n**Current location (mobile):** `expo-location`: `await Location.requestForegroundPermissionsAsync()` then `Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced })`. Explain to the user why you need it; never request permission on app start without context.",
      tip: 'Show a skeleton with the same shape as the content instead of a full-page spinner. It reduces layout jump and feels faster (Day 35).',
    },
    {
      heading: 'The mobile version: what changes in React Native',
      content:
        "The logic (API service, unit conversion, WMO mapping, state) is the same. What changes:\n- `div/ul/button` become `View/FlatList/Pressable`; text must be in `<Text>`\n- Hourly forecast: a horizontal `FlatList` (`horizontal`, `showsHorizontalScrollIndicator={false}`)\n- Pull to refresh: `<ScrollView refreshControl={<RefreshControl refreshing onRefresh />}>`\n- Favourites: `@react-native-async-storage/async-storage` (async API, so load in useEffect and save after changes)\n- Location: `expo-location` with a permission request\n- Search: `TextInput` with `onChangeText`, `returnKeyType=\"search\"`, `onSubmitEditing`\n- Keyboard: dismiss with `Keyboard.dismiss()` after selecting a suggestion\n\nPlayground note: in the React Native playground AsyncStorage and expo-location are not available, so favourites are kept in state and the location button uses fixed coordinates (Bengaluru). The real Expo code for both is in the example's `code`.",
      syntax:
        "import * as Location from 'expo-location';\nimport AsyncStorage from '@react-native-async-storage/async-storage';\n\nasync function locateMe() {\n  const { status } = await Location.requestForegroundPermissionsAsync();\n  if (status !== 'granted') throw new Error('Location permission denied');\n  const { coords } = await Location.getCurrentPositionAsync({});\n  return { name: 'My location', latitude: coords.latitude, longitude: coords.longitude };\n}\n\nawait AsyncStorage.setItem('favourites', JSON.stringify(favs));\nconst saved = JSON.parse((await AsyncStorage.getItem('favourites')) ?? '[]');",
    },
    {
      heading: 'Deployment and the project checklist',
      content:
        "**Web (Vite):**\n1. `npm run build` creates `dist/`; check it with `npm run preview`\n2. Push to GitHub (clean commits: `feat: add city search`, `fix: handle empty results`)\n3. **Vercel:** Import the repo, framework preset Vite, build command `npm run build`, output `dist`. **Netlify:** same, publish directory `dist`\n4. Every push to `main` redeploys; pull requests get preview URLs\n5. No API key is needed for Open-Meteo. If you use a keyed API (OpenWeatherMap), put the key in `VITE_WEATHER_KEY`, and remember that anything in a frontend bundle is public: use a serverless function as a proxy for secret keys\n\n**Mobile (Expo):**\n1. `npx expo install expo-location @react-native-async-storage/async-storage`\n2. Add the location permission text in `app.json` (`expo-location` plugin, `locationWhenInUsePermission`)\n3. `npm install -g eas-cli`, `eas login`, `eas build:configure`\n4. `eas build -p android --profile preview` gives an installable .apk to share with friends; `--profile production` creates the .aab for the Play Store\n\n**Checklist before you put it on your CV:** search with debounce and suggestions, current location with fallback, °C/°F toggle, hourly + 7-day, favourites persist after reload, loading skeleton, error + retry, empty states, responsive at 360px, keyboard accessible, Lighthouse score above 90, README with screenshots, live link and APK link.",
      tip: 'In the README write what you would improve next (TanStack Query caching, offline mode, charts, tests). It shows engineering maturity and gives interviewers good questions to ask you.',
    },
  ],
  examples: [
    {
      title: 'Feature 1: API service layer + debounced city search with suggestions',
      scenario: 'Create src/api/weather.js and a SearchBar that suggests cities while typing ("Aur" → Aurangabad, Maharashtra / Aurangabad, Bihar) without sending a request on every key press.',
      steps: [
        'npm create vite@latest mausam-now -- --template react, cd mausam-now, npm install',
        'Create src/api/weather.js with getJSON, searchCities and getForecast',
        'Create src/hooks/useDebounce.js (setTimeout + cleanup)',
        'In SearchBar, debounce the query by 400 ms and fetch suggestions in an effect with AbortController',
        'Render suggestions with name, state (admin1) and country; handle loading, no results and errors',
        'Run the playground and type "Aurangabad" slowly, then quickly',
      ],
      code: `// src/api/weather.js
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Request failed (' + res.status + ')');
  return res.json();
}

export async function searchCities(name, signal) {
  const params = new URLSearchParams({ name, count: '5', language: 'en', format: 'json' });
  const data = await getJSON(GEO_URL + '?' + params, signal);
  return data.results ?? [];             // "results" is missing when nothing matches
}

export function getForecast({ latitude, longitude }, signal) {
  const params = new URLSearchParams({
    latitude, longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
    timezone: 'auto',
    forecast_days: '7',
  });
  return getJSON(FORECAST_URL + '?' + params, signal);
}

// src/hooks/useDebounce.js
import { useEffect, useState } from 'react';
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// src/components/SearchBar.jsx
export function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim(), 400);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');   // idle | loading | done | error

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); setStatus('idle'); return; }
    const controller = new AbortController();
    setStatus('loading');
    searchCities(debounced, controller.signal)
      .then((list) => { setResults(list); setStatus('done'); })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [debounced]);
  // ...render input + suggestion list (see playground)
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// ---- src/api/weather.js ----
const GEO_URL = 'https://geocoding-api.open-meteo.com/v1/search';
async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Request failed (' + res.status + ')');
  return res.json();
}
async function searchCities(name, signal) {
  const params = new URLSearchParams({ name, count: '5', language: 'en', format: 'json' });
  const data = await getJSON(GEO_URL + '?' + params, signal);
  return data.results || [];
}

// ---- src/hooks/useDebounce.js ----
function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// ---- src/components/SearchBar.jsx ----
function SearchBar({ onSelect }) {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query.trim(), 400);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  const [requests, setRequests] = useState(0);

  useEffect(() => {
    if (debounced.length < 2) { setResults([]); setStatus('idle'); return; }
    const controller = new AbortController();
    setStatus('loading');
    setRequests((n) => n + 1);
    searchCities(debounced, controller.signal)
      .then((list) => { setResults(list); setStatus('done'); })
      .catch((err) => { if (err.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [debounced]);

  function choose(city) {
    onSelect(city);
    setQuery('');
    setResults([]);
    setStatus('idle');
  }

  return (
    <div className="search">
      <label htmlFor="city">Search city</label>
      <input id="city" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. Aurangabad" autoComplete="off" />
      <small>API requests sent: {requests} (typing fast sends only one)</small>
      {status === 'loading' && <p className="muted">Searching…</p>}
      {status === 'error' && <p className="error">Could not search. Check your internet.</p>}
      {status === 'done' && results.length === 0 && <p className="muted">No cities found for "{debounced}"</p>}
      {results.length > 0 && (
        <ul className="suggestions" role="listbox">
          {results.map((c) => (
            <li key={c.id}>
              <button onClick={() => choose(c)}>
                <strong>{c.name}</strong>
                <span>{[c.admin1, c.country].filter(Boolean).join(', ')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function App() {
  const [place, setPlace] = useState(null);
  return (
    <main>
      <h1>🌦 MausamNow</h1>
      <SearchBar onSelect={setPlace} />
      {place ? (
        <pre>{JSON.stringify({ name: place.name, state: place.admin1, latitude: place.latitude, longitude: place.longitude, timezone: place.timezone }, null, 2)}</pre>
      ) : (
        <p className="muted">Pick a city to see its coordinates (next feature: the forecast).</p>
      )}
    </main>
  );
}`,
        css: `main { max-width: 420px; margin: auto; font-family: system-ui, sans-serif; }
h1 { color: #1d4ed8; }
.search { display: grid; gap: 6px; }
label { font-weight: 600; }
input { padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 10px; font-size: 16px; }
input:focus { outline: 3px solid #93c5fd; }
small, .muted { color: #64748b; }
.error { color: #b91c1c; }
.suggestions { list-style: none; padding: 0; margin: 0; border: 1px solid #e2e8f0; border-radius: 10px; overflow: hidden; }
.suggestions button { width: 100%; text-align: left; padding: 10px 12px; border: 0; border-bottom: 1px solid #f1f5f9; background: #fff; cursor: pointer; display: flex; flex-direction: column; }
.suggestions button:hover, .suggestions button:focus { background: #eff6ff; }
.suggestions span { color: #64748b; font-size: 13px; }
pre { background: #0f172a; color: #e2e8f0; padding: 12px; border-radius: 10px; }`,
      },
      result: 'Typing "Aurangabad" shows up to five suggestions (Maharashtra, Bihar, ...). The request counter increases only once after you stop typing. Choosing a suggestion prints its coordinates and timezone. Typing "xyzqq" shows "No cities found".',
      explanation:
        "The API module is the only place that knows URLs, so components stay clean and testable. useDebounce delays the value: every key press restarts the timer and the cleanup clears the old one, so the effect runs once after 400 ms of silence. AbortController cancels a slow older request when a new query arrives, which prevents an older response from overwriting a newer one; AbortError is ignored because it is expected. data.results || [] handles the API's habit of omitting results when nothing matches. Suggestions are buttons, so they work with Tab and Enter (accessibility).",
    },
    {
      title: 'Feature 2: Current weather card with °C/°F toggle and a useWeather hook',
      scenario: 'Show the current weather of Mumbai: temperature, feels like, WMO label and icon, humidity and wind, with a °C/°F toggle that does not refetch, plus loading skeleton and error + Retry.',
      steps: [
        'Create src/utils/weatherCodes.js (WMO code → label + icon) and src/utils/units.js (formatTemp)',
        'Create src/hooks/useWeather.js that fetches the forecast for a place, with AbortController and a reload function',
        'Create CurrentWeather.jsx and UnitToggle.jsx',
        'Show a skeleton while loading and an ErrorState with a Retry button on failure',
        'Keep unit in App state and pass it down; conversion happens while rendering',
        'Run the playground and toggle the unit',
      ],
      code: `// src/utils/weatherCodes.js
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Heavy showers', '🌧️'], 82: ['Violent showers', '⛈️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️'],
};
export const describe = (code) => CODES[code] ?? ['Unknown', '🌡️'];

// src/utils/units.js
export const toUnit = (celsius, unit) => (unit === 'F' ? celsius * 9 / 5 + 32 : celsius);
export const formatTemp = (celsius, unit) => Math.round(toUnit(celsius, unit)) + '°' + unit;

// src/hooks/useWeather.js
import { useCallback, useEffect, useState } from 'react';
import { getForecast } from '../api/weather';

export function useWeather(place) {
  const [state, setState] = useState({ data: null, loading: false, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  useEffect(() => {
    if (!place) return;
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    getForecast(place, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => {
        if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message });
      });
    return () => controller.abort();
  }, [place?.latitude, place?.longitude, reloadKey]);

  return { ...state, reload };
}`,
      playground: {
        jsx: `const { useState, useEffect, useCallback } = React;

// ---- utils ----
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'], 71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'],
  80: ['Rain showers', '🌦️'], 81: ['Heavy showers', '🌧️'], 82: ['Violent showers', '⛈️'], 95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️'],
};
const describe = (code) => CODES[code] || ['Unknown', '🌡️'];
const formatTemp = (c, unit) => Math.round(unit === 'F' ? c * 9 / 5 + 32 : c) + '°' + unit;

// ---- api ----
function getForecast(place, signal) {
  const params = new URLSearchParams({
    latitude: place.latitude, longitude: place.longitude,
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    timezone: 'auto',
  });
  return fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal }).then((res) => {
    if (!res.ok) throw new Error('Request failed (' + res.status + ')');
    return res.json();
  });
}

// ---- hooks/useWeather ----
function useWeather(place) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    getForecast(place, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => { if (err.name !== 'AbortError') setState({ data: null, loading: false, error: err.message }); });
    return () => controller.abort();
  }, [place.latitude, place.longitude, reloadKey]);
  return { ...state, reload };
}

// ---- components ----
function UnitToggle({ unit, onChange }) {
  return (
    <div className="toggle" role="group" aria-label="Temperature unit">
      {['C', 'F'].map((u) => (
        <button key={u} aria-pressed={unit === u} className={unit === u ? 'on' : ''} onClick={() => onChange(u)}>°{u}</button>
      ))}
    </div>
  );
}

function Skeleton() {
  return <div className="card skeleton" aria-busy="true" aria-label="Loading weather"><div /><div /><div /></div>;
}

function CurrentWeather({ place, current, unit }) {
  const [label, icon] = describe(current.weather_code);
  return (
    <section className={'card ' + (current.is_day ? 'day' : 'night')}>
      <h2>📍 {place.name}</h2>
      <div className="big"><span className="icon" aria-hidden="true">{icon}</span>{formatTemp(current.temperature_2m, unit)}</div>
      <p>{label} · Feels like {formatTemp(current.apparent_temperature, unit)}</p>
      <p>💧 {current.relative_humidity_2m}% &nbsp; 💨 {current.wind_speed_10m} km/h</p>
    </section>
  );
}

const MUMBAI = { name: 'Mumbai', latitude: 19.07, longitude: 72.88 };

function App() {
  const [unit, setUnit] = useState('C');
  const { data, loading, error, reload } = useWeather(MUMBAI);
  return (
    <main>
      <header><h1>🌦 MausamNow</h1><UnitToggle unit={unit} onChange={setUnit} /></header>
      {loading && <Skeleton />}
      {error && (
        <div className="card errorBox" role="alert">
          <p>⚠ {error}</p>
          <button onClick={reload}>Retry</button>
        </div>
      )}
      {data && !loading && <CurrentWeather place={MUMBAI} current={data.current} unit={unit} />}
      {data && <button className="link" onClick={reload}>↻ Refresh</button>}
    </main>
  );
}`,
        css: `main { max-width: 420px; margin: auto; font-family: system-ui, sans-serif; }
header { display: flex; justify-content: space-between; align-items: center; }
h1 { color: #1d4ed8; font-size: 22px; }
.toggle { display: flex; border: 1px solid #93c5fd; border-radius: 999px; overflow: hidden; }
.toggle button { border: 0; background: #fff; padding: 6px 14px; cursor: pointer; font-weight: 600; }
.toggle button.on { background: #1d4ed8; color: #fff; }
.card { border-radius: 18px; padding: 20px; color: #fff; }
.day { background: linear-gradient(135deg, #38bdf8, #1d4ed8); }
.night { background: linear-gradient(135deg, #312e81, #0f172a); }
.card h2 { margin: 0; font-size: 18px; }
.big { font-size: 56px; font-weight: 800; display: flex; align-items: center; gap: 8px; }
.icon { font-size: 52px; }
.skeleton { background: #e2e8f0; display: grid; gap: 12px; }
.skeleton div { height: 22px; border-radius: 8px; background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0); background-size: 200% 100%; animation: shimmer 1.2s infinite; }
.skeleton div:nth-child(2) { height: 60px; width: 60%; }
@keyframes shimmer { to { background-position: -200% 0; } }
.errorBox { background: #fee2e2; color: #991b1b; }
.link { margin-top: 10px; background: none; border: 0; color: #1d4ed8; cursor: pointer; }`,
      },
      result: 'A shimmering skeleton, then a blue (day) or dark (night) card: "📍 Mumbai", a big temperature with an icon, the condition, feels like, humidity and wind. Clicking °F converts every temperature instantly without a new request. If the network fails you see an error box with Retry.',
      explanation:
        "useWeather hides fetching details and returns { data, loading, error, reload }, the same shape TanStack Query gives you, so swapping later is easy. reload just bumps reloadKey, which is a dependency of the effect, so the effect runs again. The unit is UI state and the API data stays in °C; formatTemp converts while rendering, so there is no duplicated state and no refetch. is_day from the API picks a day or night theme. The skeleton has aria-busy and the error box has role=\"alert\" so screen readers announce changes.",
    },
    {
      title: 'Feature 3: Hourly (next 24 h) and 7-day forecast',
      scenario: 'Under the current card, show a horizontal strip with the next 24 hours (time, icon, temperature, rain chance) and a 7-day list with min/max bars, for Delhi.',
      steps: [
        'Add hourly and daily params to getForecast',
        'Find the index of the current hour in hourly.time and slice the next 24 entries',
        'Zip the parallel daily arrays into objects with map((date, i) => ...)',
        'Format dates safely: new Date(date + "T00:00") and toLocaleDateString("en-IN", ...)',
        'Draw a min/max bar scaled to the week\'s lowest and highest temperature',
        'Run the playground and scroll the hourly strip',
      ],
      code: `// src/utils/forecast.js
export function next24Hours(data) {
  const { time, temperature_2m, weather_code, precipitation_probability } = data.hourly;
  const nowHour = data.current.time.slice(0, 13) + ':00';     // "2026-11-20T14:00"
  const start = Math.max(0, time.findIndex((t) => t >= nowHour));
  return time.slice(start, start + 24).map((t, i) => ({
    time: t.slice(11, 16),                                   // "14:00" in the city's own time
    temp: temperature_2m[start + i],
    code: weather_code[start + i],
    rain: precipitation_probability[start + i],
  }));
}

export function sevenDays(data) {
  const d = data.daily;
  return d.time.map((date, i) => ({
    date, code: d.weather_code[i], min: d.temperature_2m_min[i], max: d.temperature_2m_max[i],
  }));
}

export const dayName = (date, i) =>
  i === 0 ? 'Today' : new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const CODES = { 0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️', 45: '🌫️', 48: '🌫️', 51: '🌦️', 53: '🌦️', 55: '🌧️', 61: '🌧️', 63: '🌧️', 65: '🌧️', 71: '🌨️', 73: '🌨️', 75: '❄️', 80: '🌦️', 81: '🌧️', 82: '⛈️', 95: '⛈️', 96: '⛈️', 99: '⛈️' };
const icon = (c) => CODES[c] || '🌡️';

function next24Hours(data) {
  const h = data.hourly;
  const nowHour = data.current.time.slice(0, 13) + ':00';
  const start = Math.max(0, h.time.findIndex((t) => t >= nowHour));
  return h.time.slice(start, start + 24).map((t, i) => ({
    time: i === 0 ? 'Now' : t.slice(11, 16),
    temp: h.temperature_2m[start + i],
    code: h.weather_code[start + i],
    rain: h.precipitation_probability[start + i],
  }));
}
function sevenDays(data) {
  const d = data.daily;
  return d.time.map((date, i) => ({ date, code: d.weather_code[i], min: d.temperature_2m_min[i], max: d.temperature_2m_max[i] }));
}
const dayName = (date, i) => i === 0 ? 'Today' : new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

function HourlyForecast({ hours }) {
  return (
    <section>
      <h2>Next 24 hours</h2>
      <ol className="hours">
        {hours.map((h) => (
          <li key={h.time}>
            <span>{h.time}</span>
            <span className="ic">{icon(h.code)}</span>
            <strong>{Math.round(h.temp)}°</strong>
            <small>💧{h.rain}%</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

function DailyForecast({ days }) {
  const low = Math.min(...days.map((d) => d.min));
  const high = Math.max(...days.map((d) => d.max));
  const pct = (t) => ((t - low) / (high - low || 1)) * 100;
  return (
    <section>
      <h2>7-day forecast</h2>
      <ul className="days">
        {days.map((d, i) => (
          <li key={d.date}>
            <span className="name">{dayName(d.date, i)}</span>
            <span>{icon(d.code)}</span>
            <span className="min">{Math.round(d.min)}°</span>
            <span className="track"><span className="bar" style={{ left: pct(d.min) + '%', right: (100 - pct(d.max)) + '%' }} /></span>
            <span className="max">{Math.round(d.max)}°</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({
      latitude: '28.61', longitude: '77.21', timezone: 'auto', forecast_days: '7',
      current: 'temperature_2m,weather_code',
      hourly: 'temperature_2m,weather_code,precipitation_probability',
      daily: 'weather_code,temperature_2m_max,temperature_2m_min',
    });
    fetch('https://api.open-meteo.com/v1/forecast?' + params, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then(setData)
      .catch((e) => { if (e.name !== 'AbortError') setError(e.message); });
    return () => controller.abort();
  }, []);

  if (error) return <p role="alert">⚠ {error}</p>;
  if (!data) return <p>Loading Delhi forecast…</p>;
  return (
    <main>
      <h1>📍 New Delhi · {Math.round(data.current.temperature_2m)}°C {icon(data.current.weather_code)}</h1>
      <HourlyForecast hours={next24Hours(data)} />
      <DailyForecast days={sevenDays(data)} />
    </main>
  );
}`,
        css: `main { max-width: 460px; margin: auto; font-family: system-ui, sans-serif; }
h1 { font-size: 20px; }
h2 { font-size: 15px; color: #475569; margin: 18px 0 8px; }
.hours { display: flex; gap: 8px; overflow-x: auto; list-style: none; padding: 0 0 8px; margin: 0; scroll-snap-type: x mandatory; }
.hours li { flex: 0 0 64px; scroll-snap-align: start; display: flex; flex-direction: column; align-items: center; gap: 4px; padding: 10px 4px; border-radius: 14px; background: #eff6ff; }
.hours li:first-child { background: #1d4ed8; color: #fff; }
.ic { font-size: 22px; }
small { color: inherit; opacity: .75; font-size: 11px; }
.days { list-style: none; padding: 0; margin: 0; }
.days li { display: grid; grid-template-columns: 70px 28px 34px 1fr 34px; align-items: center; gap: 8px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.name { font-weight: 600; }
.min { color: #64748b; text-align: right; }
.track { position: relative; height: 6px; border-radius: 3px; background: #e2e8f0; }
.bar { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, #38bdf8, #f97316); }`,
      },
      result: 'A heading with Delhi\'s current temperature, a horizontally scrollable strip of 24 hourly cards starting with "Now" (time, icon, temperature, rain chance), and a 7-day list where each row shows the day, icon, min, a coloured range bar and max.',
      explanation:
        "Open-Meteo returns hourly data as parallel arrays for 7 days (168 entries) starting at midnight, so we find the current hour by comparing ISO strings (they sort correctly as text) and slice 24 entries. Zipping arrays into objects makes rendering and testing simpler. hour.time.slice(11, 16) avoids timezone conversion because timezone=auto already gives the city's local time. The range bar uses the week's global min and max so bars are comparable across days, the same idea iOS Weather uses. Keys are the time/date strings, which are unique and stable.",
    },
    {
      title: 'Feature 4: Current location + favourite cities in localStorage',
      scenario: 'Add a "📍 Use my location" button (with graceful fallback when permission is denied) and a ⭐ button that saves the current city to favourites, shown as chips that survive a page reload.',
      steps: [
        'Create src/hooks/useLocalStorage.js: lazy initial read with try/catch, write in an effect',
        'Create useFavourites on top of it with add, remove and isFavourite',
        'Write getCurrentPosition as a Promise wrapper around navigator.geolocation',
        'Handle error codes: 1 denied, 2 unavailable, 3 timeout, and browsers without geolocation',
        'Render favourite chips; clicking a chip selects that city, ✕ removes it',
        'Run the playground, add two favourites, then click Run again: they are still there',
      ],
      code: `// src/hooks/useLocalStorage.js
import { useEffect, useState } from 'react';

export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch {
      return initialValue;                // private mode, blocked storage or bad JSON
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota or blocked */ }
  }, [key, value]);
  return [value, setValue];
}

// src/hooks/useFavourites.js
export function useFavourites() {
  const [favs, setFavs] = useLocalStorage('mausam:favourites', []);
  const keyOf = (p) => p.latitude.toFixed(2) + ',' + p.longitude.toFixed(2);
  const isFavourite = (p) => favs.some((f) => keyOf(f) === keyOf(p));
  const add = (p) => setFavs((list) => (list.some((f) => keyOf(f) === keyOf(p)) ? list : [...list, p].slice(-8)));
  const remove = (p) => setFavs((list) => list.filter((f) => keyOf(f) !== keyOf(p)));
  return { favs, isFavourite, add, remove };
}

// src/utils/geolocation.js
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation is not supported'));
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => resolve({ name: 'My location', latitude: coords.latitude, longitude: coords.longitude }),
      (err) => reject(new Error(err.code === 1 ? 'Location permission denied' : err.code === 3 ? 'Location timed out' : 'Location unavailable')),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initialValue;
    } catch (e) {
      return initialValue;
    }
  });
  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* blocked in some sandboxes */ }
  }, [key, value]);
  return [value, setValue];
}

function useFavourites() {
  const [favs, setFavs] = useLocalStorage('mausam:favourites', []);
  const keyOf = (p) => p.latitude.toFixed(2) + ',' + p.longitude.toFixed(2);
  return {
    favs,
    isFavourite: (p) => favs.some((f) => keyOf(f) === keyOf(p)),
    add: (p) => setFavs((list) => (list.some((f) => keyOf(f) === keyOf(p)) ? list : [...list, p].slice(-8))),
    remove: (p) => setFavs((list) => list.filter((f) => keyOf(f) !== keyOf(p))),
  };
}

function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new Error('Geolocation is not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ name: 'My location', latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new Error(err.code === 1 ? 'Location permission denied' : err.code === 3 ? 'Location timed out' : 'Location unavailable')),
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

const CITIES = [
  { name: 'Jaipur', latitude: 26.91, longitude: 75.79 },
  { name: 'Kolkata', latitude: 22.57, longitude: 88.36 },
  { name: 'Kochi', latitude: 9.93, longitude: 76.26 },
  { name: 'Shimla', latitude: 31.1, longitude: 77.17 },
];

function App() {
  const [place, setPlace] = useState(CITIES[0]);
  const [temp, setTemp] = useState(null);
  const [locMsg, setLocMsg] = useState('');
  const { favs, isFavourite, add, remove } = useFavourites();

  useEffect(() => {
    const controller = new AbortController();
    setTemp(null);
    fetch('https://api.open-meteo.com/v1/forecast?current=temperature_2m&latitude=' + place.latitude + '&longitude=' + place.longitude, { signal: controller.signal })
      .then((r) => r.json())
      .then((d) => setTemp(d.current.temperature_2m))
      .catch(() => {});
    return () => controller.abort();
  }, [place]);

  async function locateMe() {
    setLocMsg('Finding you…');
    try {
      setPlace(await getCurrentPosition());
      setLocMsg('');
    } catch (e) {
      setLocMsg(e.message + '. Showing your last city instead.');
    }
  }

  const fav = isFavourite(place);
  return (
    <main>
      <div className="row">
        {CITIES.map((c) => <button key={c.name} onClick={() => setPlace(c)}>{c.name}</button>)}
        <button className="loc" onClick={locateMe}>📍 Use my location</button>
      </div>
      {locMsg && <p className="msg" role="status">{locMsg}</p>}

      <section className="card">
        <h2>{place.name}</h2>
        <p className="temp">{temp === null ? '…' : Math.round(temp) + '°C'}</p>
        <button className="star" aria-pressed={fav} onClick={() => (fav ? remove(place) : add(place))}>
          {fav ? '⭐ Saved' : '☆ Add to favourites'}
        </button>
      </section>

      <h3>Favourites ({favs.length})</h3>
      {favs.length === 0 ? <p className="msg">No favourites yet. Tap ☆ to save a city.</p> : (
        <ul className="chips">
          {favs.map((f) => (
            <li key={f.latitude + ',' + f.longitude}>
              <button onClick={() => setPlace(f)}>{f.name}</button>
              <button aria-label={'Remove ' + f.name} onClick={() => remove(f)}>✕</button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}`,
        css: `main { max-width: 440px; margin: auto; font-family: system-ui, sans-serif; }
.row { display: flex; flex-wrap: wrap; gap: 6px; }
button { padding: 8px 12px; border-radius: 10px; border: 1px solid #cbd5e1; background: #fff; cursor: pointer; }
.loc { background: #1d4ed8; color: #fff; border-color: #1d4ed8; }
.msg { color: #64748b; font-size: 14px; }
.card { margin-top: 14px; padding: 18px; border-radius: 16px; background: linear-gradient(135deg, #0ea5e9, #6366f1); color: #fff; }
.card h2 { margin: 0; }
.temp { font-size: 48px; font-weight: 800; margin: 6px 0; }
.star { background: rgba(255,255,255,.2); color: #fff; border-color: transparent; }
.chips { list-style: none; padding: 0; display: flex; flex-wrap: wrap; gap: 8px; }
.chips li { display: flex; border: 1px solid #fde68a; border-radius: 999px; overflow: hidden; background: #fffbeb; }
.chips button { border: 0; background: none; border-radius: 0; }`,
      },
      result: 'City buttons switch the card. "☆ Add to favourites" turns into "⭐ Saved" and a chip appears; chips select or remove cities and are still there after clicking Run again (if the browser allows storage). "📍 Use my location" shows your local temperature, or a friendly message such as "Location permission denied. Showing your last city instead."',
      explanation:
        "useLocalStorage reads storage only once (lazy initial state) and writes whenever the value changes. Both are wrapped in try/catch because storage can throw in private mode, in sandboxed iframes or when the quota is full; the app keeps working in memory. Favourites are compared by rounded coordinates, not by name (two cities can share a name). The geolocation callback API is wrapped in a Promise so it can be awaited, and every error code becomes a user-friendly message. Geolocation needs HTTPS or localhost, which Vercel and Netlify provide.",
    },
    {
      title: 'Complete web app: MausamNow (all features together)',
      scenario: 'The finished React web app: debounced search with suggestions, current location, °C/°F toggle, current weather, 24-hour strip, 7-day forecast, favourites in localStorage, skeleton, error + retry and empty states. This is the App.jsx you deploy.',
      steps: [
        'Combine the api, utils and hooks from features 1–4 into their files',
        'App.jsx owns place (persisted last city), unit (persisted) and favourites',
        'useWeather(place) loads current + hourly + daily in one request',
        'Compose SearchBar, Favourites, CurrentWeather, HourlyForecast and DailyForecast',
        'Test: search "Leh", toggle °F, save it, reload the page, deny location permission',
        'npm run build and deploy dist/ to Vercel or Netlify',
      ],
      code: `// src/App.jsx
import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather } from './hooks/useWeather';
import { useFavourites } from './hooks/useFavourites';
import { getCurrentPosition } from './utils/geolocation';
import { next24Hours, sevenDays } from './utils/forecast';
import { SearchBar } from './components/SearchBar';
import { UnitToggle } from './components/UnitToggle';
import { Favourites } from './components/Favourites';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { Skeleton } from './components/Skeleton';
import { ErrorState } from './components/ErrorState';

const DEFAULT_PLACE = { name: 'Pune', country: 'India', latitude: 18.52, longitude: 73.86 };

export default function App() {
  const [place, setPlace] = useLocalStorage('mausam:lastPlace', DEFAULT_PLACE);
  const [unit, setUnit] = useLocalStorage('mausam:unit', 'C');
  const favourites = useFavourites();
  const { data, loading, error, reload } = useWeather(place);
  const [locError, setLocError] = useState('');

  async function locate() {
    try { setLocError(''); setPlace(await getCurrentPosition()); }
    catch (e) { setLocError(e.message); }
  }

  return (
    <div className="app">
      <header>
        <h1>🌦 MausamNow</h1>
        <UnitToggle unit={unit} onChange={setUnit} />
      </header>
      <SearchBar onSelect={setPlace} onLocate={locate} />
      {locError && <p role="status">{locError}</p>}
      <Favourites {...favourites} onSelect={setPlace} />
      {loading && <Skeleton />}
      {error && <ErrorState message={error} onRetry={reload} />}
      {data && !loading && (
        <>
          <CurrentWeather place={place} current={data.current} unit={unit}
            isFavourite={favourites.isFavourite(place)}
            onToggleFavourite={() => favourites.isFavourite(place) ? favourites.remove(place) : favourites.add(place)} />
          <HourlyForecast hours={next24Hours(data)} unit={unit} />
          <DailyForecast days={sevenDays(data)} unit={unit} />
        </>
      )}
    </div>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect, useCallback } = React;

/* ================= utils ================= */
const CODES = {
  0: ['Clear sky', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'],
  45: ['Fog', '🌫️'], 48: ['Freezing fog', '🌫️'], 51: ['Light drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Heavy drizzle', '🌧️'],
  56: ['Freezing drizzle', '🌧️'], 57: ['Freezing drizzle', '🌧️'], 61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  66: ['Freezing rain', '🌧️'], 67: ['Freezing rain', '🌧️'], 71: ['Light snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 77: ['Snow grains', '🌨️'],
  80: ['Rain showers', '🌦️'], 81: ['Heavy showers', '🌧️'], 82: ['Violent showers', '⛈️'], 85: ['Snow showers', '🌨️'], 86: ['Snow showers', '🌨️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm with hail', '⛈️'], 99: ['Severe thunderstorm', '⛈️'],
};
const describe = (code) => CODES[code] || ['Unknown', '🌡️'];
const fmt = (c, unit) => Math.round(unit === 'F' ? c * 9 / 5 + 32 : c) + '°';
const keyOf = (p) => p.latitude.toFixed(2) + ',' + p.longitude.toFixed(2);

function next24Hours(data) {
  const h = data.hourly;
  const nowHour = data.current.time.slice(0, 13) + ':00';
  const start = Math.max(0, h.time.findIndex((t) => t >= nowHour));
  return h.time.slice(start, start + 24).map((t, i) => ({
    time: i === 0 ? 'Now' : t.slice(11, 16), temp: h.temperature_2m[start + i], code: h.weather_code[start + i], rain: h.precipitation_probability[start + i],
  }));
}
function sevenDays(data) {
  const d = data.daily;
  return d.time.map((date, i) => ({ date, code: d.weather_code[i], min: d.temperature_2m_min[i], max: d.temperature_2m_max[i] }));
}
const dayName = (date, i) => i === 0 ? 'Today' : new Date(date + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });

/* ================= api ================= */
async function getJSON(url, signal) {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('Request failed (' + res.status + ')');
  return res.json();
}
async function searchCities(name, signal) {
  const data = await getJSON('https://geocoding-api.open-meteo.com/v1/search?' + new URLSearchParams({ name, count: '5', language: 'en' }), signal);
  return data.results || [];
}
function getForecast(p, signal) {
  return getJSON('https://api.open-meteo.com/v1/forecast?' + new URLSearchParams({
    latitude: p.latitude, longitude: p.longitude, timezone: 'auto', forecast_days: '7',
    current: 'temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day',
    hourly: 'temperature_2m,weather_code,precipitation_probability',
    daily: 'weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset',
  }), signal);
}
function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('Geolocation is not supported'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ name: 'My location', latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      (err) => reject(new Error(err.code === 1 ? 'Location permission denied' : 'Could not get your location')),
      { timeout: 10000 }
    );
  });
}

/* ================= hooks ================= */
function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch (e) { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }, [key, value]);
  return [value, setValue];
}
function useDebounce(value, delay) {
  const [v, setV] = useState(value);
  useEffect(() => { const id = setTimeout(() => setV(value), delay); return () => clearTimeout(id); }, [value, delay]);
  return v;
}
function useWeather(place) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const reload = useCallback(() => setReloadKey((k) => k + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    getForecast(place, controller.signal)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, loading: false, error: e.message === 'Failed to fetch' ? 'No internet connection' : e.message }); });
    return () => controller.abort();
  }, [place.latitude, place.longitude, reloadKey]);
  return { ...state, reload };
}

/* ================= components ================= */
function SearchBar({ onSelect, onLocate }) {
  const [query, setQuery] = useState('');
  const q = useDebounce(query.trim(), 400);
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState('idle');
  useEffect(() => {
    if (q.length < 2) { setResults([]); setStatus('idle'); return; }
    const controller = new AbortController();
    setStatus('loading');
    searchCities(q, controller.signal)
      .then((r) => { setResults(r); setStatus('done'); })
      .catch((e) => { if (e.name !== 'AbortError') setStatus('error'); });
    return () => controller.abort();
  }, [q]);
  const pick = (c) => { onSelect({ name: c.name, region: [c.admin1, c.country].filter(Boolean).join(', '), latitude: c.latitude, longitude: c.longitude }); setQuery(''); };
  return (
    <div className="search">
      <div className="searchRow">
        <input aria-label="Search city" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search city, e.g. Leh" />
        <button className="iconBtn" onClick={onLocate} title="Use my location" aria-label="Use my location">📍</button>
      </div>
      {q.length >= 2 && (
        <ul className="suggest">
          {status === 'loading' && <li className="muted">Searching…</li>}
          {status === 'error' && <li className="err">Search failed</li>}
          {status === 'done' && results.length === 0 && <li className="muted">No cities found</li>}
          {results.map((c) => (
            <li key={c.id}><button onClick={() => pick(c)}><b>{c.name}</b> <span>{[c.admin1, c.country].filter(Boolean).join(', ')}</span></button></li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Favourites({ favs, onSelect, onRemove, current }) {
  if (!favs.length) return null;
  return (
    <ul className="favs" aria-label="Favourite cities">
      {favs.map((f) => (
        <li key={keyOf(f)} className={keyOf(f) === keyOf(current) ? 'active' : ''}>
          <button onClick={() => onSelect(f)}>⭐ {f.name}</button>
          <button aria-label={'Remove ' + f.name} onClick={() => onRemove(f)}>✕</button>
        </li>
      ))}
    </ul>
  );
}

function CurrentWeather({ place, c, unit, fav, onFav, daily }) {
  const [label, icon] = describe(c.weather_code);
  return (
    <section className={'now ' + (c.is_day ? 'day' : 'night')}>
      <div className="nowTop">
        <div>
          <h2>{place.name}</h2>
          <small>{place.region || 'Lat ' + place.latitude.toFixed(2) + ', Lon ' + place.longitude.toFixed(2)}</small>
        </div>
        <button className="fav" aria-pressed={fav} onClick={onFav}>{fav ? '⭐' : '☆'}</button>
      </div>
      <div className="temp"><span aria-hidden="true">{icon}</span>{fmt(c.temperature_2m, unit)}{unit}</div>
      <p>{label} · H {fmt(daily.temperature_2m_max[0], unit)} L {fmt(daily.temperature_2m_min[0], unit)}</p>
      <div className="stats">
        <span>🤒 Feels {fmt(c.apparent_temperature, unit)}</span>
        <span>💧 {c.relative_humidity_2m}%</span>
        <span>💨 {Math.round(c.wind_speed_10m)} km/h</span>
        <span>🌅 {daily.sunrise[0].slice(11)}</span>
        <span>🌇 {daily.sunset[0].slice(11)}</span>
      </div>
    </section>
  );
}

function App() {
  const [place, setPlace] = useLocalStorage('mausam:lastPlace', { name: 'Pune', region: 'Maharashtra, India', latitude: 18.52, longitude: 73.86 });
  const [unit, setUnit] = useLocalStorage('mausam:unit', 'C');
  const [favs, setFavs] = useLocalStorage('mausam:favourites', []);
  const [locMsg, setLocMsg] = useState('');
  const { data, loading, error, reload } = useWeather(place);

  const isFav = favs.some((f) => keyOf(f) === keyOf(place));
  const toggleFav = () => setFavs((l) => (isFav ? l.filter((f) => keyOf(f) !== keyOf(place)) : [...l, place].slice(-8)));
  const removeFav = (p) => setFavs((l) => l.filter((f) => keyOf(f) !== keyOf(p)));
  async function locate() {
    setLocMsg('Finding your location…');
    try { setPlace(await getCurrentPosition()); setLocMsg(''); }
    catch (e) { setLocMsg(e.message + '. Showing ' + place.name + '.'); }
  }

  const days = data ? sevenDays(data) : [];
  const low = Math.min(...days.map((d) => d.min));
  const high = Math.max(...days.map((d) => d.max));
  const pct = (t) => ((t - low) / (high - low || 1)) * 100;

  return (
    <div className="app">
      <header>
        <h1>🌦 MausamNow</h1>
        <div className="toggle" role="group" aria-label="Unit">
          {['C', 'F'].map((u) => <button key={u} aria-pressed={unit === u} className={unit === u ? 'on' : ''} onClick={() => setUnit(u)}>°{u}</button>)}
        </div>
      </header>
      <SearchBar onSelect={(p) => { setPlace(p); setLocMsg(''); }} onLocate={locate} />
      {locMsg && <p className="muted" role="status">{locMsg}</p>}
      <Favourites favs={favs} onSelect={setPlace} onRemove={removeFav} current={place} />

      {loading && <div className="skeleton" aria-busy="true"><div /><div /><div /></div>}
      {error && !loading && (
        <div className="errorBox" role="alert"><p>⚠ {error}</p><button onClick={reload}>Retry</button></div>
      )}
      {data && !loading && (
        <>
          <CurrentWeather place={place} c={data.current} unit={unit} fav={isFav} onFav={toggleFav} daily={data.daily} />
          <h3>Next 24 hours</h3>
          <ol className="hours">
            {next24Hours(data).map((h) => (
              <li key={h.time}><span>{h.time}</span><span className="ic">{describe(h.code)[1]}</span><b>{fmt(h.temp, unit)}</b><small>💧{h.rain}%</small></li>
            ))}
          </ol>
          <h3>7-day forecast</h3>
          <ul className="days">
            {days.map((d, i) => (
              <li key={d.date}>
                <span className="dn">{dayName(d.date, i)}</span>
                <span title={describe(d.code)[0]}>{describe(d.code)[1]}</span>
                <span className="mn">{fmt(d.min, unit)}</span>
                <span className="track"><span className="bar" style={{ left: pct(d.min) + '%', right: (100 - pct(d.max)) + '%' }} /></span>
                <span>{fmt(d.max, unit)}</span>
              </li>
            ))}
          </ul>
          <p className="muted credit">Data: Open-Meteo.com · <button className="link" onClick={reload}>Refresh</button></p>
        </>
      )}
    </div>
  );
}`,
        css: `body { background: #f1f5f9; }
.app { max-width: 480px; margin: auto; font-family: system-ui, sans-serif; color: #0f172a; }
header { display: flex; justify-content: space-between; align-items: center; }
h1 { font-size: 22px; color: #1d4ed8; margin: 6px 0 12px; }
h3 { font-size: 14px; color: #475569; margin: 18px 0 8px; }
button { font: inherit; cursor: pointer; }
.toggle { display: flex; border: 1px solid #93c5fd; border-radius: 999px; overflow: hidden; }
.toggle button { border: 0; background: #fff; padding: 6px 12px; font-weight: 600; }
.toggle .on { background: #1d4ed8; color: #fff; }
.search { position: relative; }
.searchRow { display: flex; gap: 8px; }
.searchRow input { flex: 1; padding: 11px 14px; border-radius: 12px; border: 1px solid #cbd5e1; font-size: 16px; }
.iconBtn { width: 46px; border-radius: 12px; border: 0; background: #1d4ed8; color: #fff; font-size: 18px; }
.suggest { position: absolute; z-index: 5; left: 0; right: 54px; top: 48px; list-style: none; margin: 0; padding: 4px; background: #fff; border-radius: 12px; box-shadow: 0 10px 30px rgba(15,23,42,.15); }
.suggest li { padding: 6px 8px; }
.suggest button { width: 100%; text-align: left; border: 0; background: none; padding: 4px; border-radius: 8px; }
.suggest button:hover, .suggest button:focus { background: #eff6ff; }
.suggest span { color: #64748b; font-size: 13px; }
.muted { color: #64748b; font-size: 14px; }
.err { color: #b91c1c; }
.favs { list-style: none; padding: 0; margin: 10px 0 0; display: flex; gap: 6px; overflow-x: auto; }
.favs li { display: flex; flex: none; background: #fff; border: 1px solid #fde68a; border-radius: 999px; }
.favs li.active { background: #fef3c7; }
.favs button { border: 0; background: none; padding: 5px 9px; }
.now { margin-top: 14px; padding: 18px; border-radius: 20px; color: #fff; }
.day { background: linear-gradient(135deg, #38bdf8, #1d4ed8); }
.night { background: linear-gradient(135deg, #4338ca, #0f172a); }
.nowTop { display: flex; justify-content: space-between; }
.now h2 { margin: 0; font-size: 20px; }
.now small { opacity: .85; }
.fav { border: 0; background: rgba(255,255,255,.2); color: #fff; border-radius: 50%; width: 40px; height: 40px; font-size: 20px; }
.temp { font-size: 60px; font-weight: 800; display: flex; align-items: center; gap: 6px; }
.now p { margin: 0 0 10px; }
.stats { display: flex; flex-wrap: wrap; gap: 6px; }
.stats span { background: rgba(255,255,255,.18); padding: 4px 10px; border-radius: 999px; font-size: 13px; }
.hours { display: flex; gap: 8px; overflow-x: auto; list-style: none; padding: 0 0 6px; margin: 0; }
.hours li { flex: 0 0 60px; display: flex; flex-direction: column; align-items: center; gap: 3px; padding: 10px 2px; border-radius: 14px; background: #fff; }
.hours li:first-child { background: #1d4ed8; color: #fff; }
.ic { font-size: 22px; }
.hours small { font-size: 11px; opacity: .75; }
.days { list-style: none; padding: 0 12px; margin: 0; background: #fff; border-radius: 16px; }
.days li { display: grid; grid-template-columns: 64px 26px 34px 1fr 34px; gap: 8px; align-items: center; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
.days li:last-child { border-bottom: 0; }
.dn { font-weight: 600; }
.mn { color: #64748b; text-align: right; }
.track { position: relative; height: 6px; background: #e2e8f0; border-radius: 3px; }
.bar { position: absolute; top: 0; bottom: 0; border-radius: 3px; background: linear-gradient(90deg, #38bdf8, #f97316); }
.skeleton { margin-top: 14px; display: grid; gap: 10px; }
.skeleton div { height: 90px; border-radius: 16px; background: linear-gradient(90deg, #e2e8f0, #f8fafc, #e2e8f0); background-size: 200% 100%; animation: sh 1.2s infinite; }
@keyframes sh { to { background-position: -200% 0; } }
.errorBox { margin-top: 14px; padding: 14px; border-radius: 14px; background: #fee2e2; color: #991b1b; }
.link { border: 0; background: none; color: #1d4ed8; padding: 0; }
.credit { text-align: center; }`,
      },
      result: 'A complete weather app: search box with live suggestions and a 📍 button, favourite chips, a gradient card with temperature, condition, H/L, feels like, humidity, wind, sunrise and sunset, a 24-hour strip and a 7-day list with range bars. °C/°F, the last city and favourites are remembered between runs; errors show a Retry button.',
      explanation:
        "Each concern lives in its own small unit: utils are pure functions, api functions know URLs, hooks manage async state and storage, and components only render. App owns the cross-cutting state (place, unit, favourites) and passes data down, while derived values (next 24 hours, 7 days, range bar percentages) are computed during render. Persisting the last place and unit with the same useLocalStorage hook means the app opens where the user left it. This is the same structure you would show in a project walkthrough in an interview.",
    },
    {
      title: 'Mobile app: MausamNow with React Native (Expo)',
      scenario: 'The same app for Android/iOS: search with suggestions, location button, °C/°F, current weather, horizontal hourly FlatList, 7-day list, favourites, pull to refresh. Real Expo code uses expo-location and AsyncStorage; the playground simulates them.',
      steps: [
        'npx create-expo-app@latest MausamNow --template blank',
        'npx expo install expo-location @react-native-async-storage/async-storage',
        'Copy src/api/weather.js and the utils from the web app unchanged',
        'Build HomeScreen with ScrollView + RefreshControl, TextInput search, horizontal FlatList and favourites',
        'Use the useFavourites (AsyncStorage) and getLocation (expo-location) code below in the real app',
        'npx expo start and scan the QR code with Expo Go; later eas build -p android --profile preview',
      ],
      code: `// src/hooks/useFavourites.js (real app: AsyncStorage)
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'mausam:favourites';
export function useFavourites() {
  const [favs, setFavs] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {                                    // load once
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setFavs(JSON.parse(raw)))
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {                                    // save after every change (not before loading)
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(favs));
  }, [favs, ready]);

  return [favs, setFavs];
}

// src/utils/location.js (real app: expo-location)
import * as Location from 'expo-location';
export async function getLocation() {
  const { status } = await Location.requestForegroundPermissionsAsync();
  if (status !== 'granted') throw new Error('Location permission denied');
  const { coords } = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  const [address] = await Location.reverseGeocodeAsync(coords);    // city name on device
  return { name: address?.city ?? 'My location', latitude: coords.latitude, longitude: coords.longitude };
}

// app.json
// "plugins": [["expo-location", { "locationWhenInUsePermission": "MausamNow uses your location to show local weather." }]]`,
      playground: {
        device: 'android',
        rn: `import { useCallback, useEffect, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, ScrollView, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';

const CODES = { 0: ['Clear', '☀️'], 1: ['Mainly clear', '🌤️'], 2: ['Partly cloudy', '⛅'], 3: ['Overcast', '☁️'], 45: ['Fog', '🌫️'], 48: ['Fog', '🌫️'],
  51: ['Drizzle', '🌦️'], 53: ['Drizzle', '🌦️'], 55: ['Drizzle', '🌧️'], 61: ['Light rain', '🌧️'], 63: ['Rain', '🌧️'], 65: ['Heavy rain', '🌧️'],
  71: ['Snow', '🌨️'], 73: ['Snow', '🌨️'], 75: ['Heavy snow', '❄️'], 80: ['Showers', '🌦️'], 81: ['Showers', '🌧️'], 82: ['Violent showers', '⛈️'],
  95: ['Thunderstorm', '⛈️'], 96: ['Thunderstorm', '⛈️'], 99: ['Thunderstorm', '⛈️'] };
const describe = (c) => CODES[c] || ['Unknown', '🌡️'];
const fmt = (c, unit) => Math.round(unit === 'F' ? c * 9 / 5 + 32 : c) + '°';
const keyOf = (p) => p.latitude.toFixed(2) + ',' + p.longitude.toFixed(2);

async function getJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error('Request failed (' + res.status + ')');
  return res.json();
}
const searchCities = (q) => getJSON('https://geocoding-api.open-meteo.com/v1/search?count=5&language=en&name=' + encodeURIComponent(q)).then((d) => d.results || []);
const getForecast = (p) => getJSON('https://api.open-meteo.com/v1/forecast?latitude=' + p.latitude + '&longitude=' + p.longitude +
  '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code,is_day' +
  '&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto&forecast_days=7');

// Playground stand-in for expo-location (real code: Location.getCurrentPositionAsync)
const getLocation = () => new Promise((resolve) => setTimeout(() => resolve({ name: 'My location (Bengaluru)', latitude: 12.97, longitude: 77.59 }), 500));

export default function App() {
  const [place, setPlace] = useState({ name: 'Hyderabad', latitude: 17.38, longitude: 78.49 });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [unit, setUnit] = useState('C');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [favs, setFavs] = useState([]); // real app: useFavourites() with AsyncStorage

  const load = useCallback(async (p, isRefresh) => {
    isRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      setData(await getForecast(p));
    } catch (e) {
      setError(e.message === 'Failed to fetch' ? 'No internet connection' : e.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(place); }, [place, load]);

  useEffect(() => {
    const q = query.trim();
    if (q.length < 2) { setResults([]); return; }
    let cancelled = false;
    const id = setTimeout(() => {
      searchCities(q).then((r) => { if (!cancelled) setResults(r); }).catch(() => {});
    }, 400);
    return () => { cancelled = true; clearTimeout(id); };
  }, [query]);

  const select = (p) => { setPlace(p); setQuery(''); setResults([]); };
  const isFav = favs.some((f) => keyOf(f) === keyOf(place));
  const toggleFav = () => setFavs((l) => (isFav ? l.filter((f) => keyOf(f) !== keyOf(place)) : [...l, place]));

  let hours = [];
  if (data) {
    const now = data.current.time.slice(0, 13) + ':00';
    const start = Math.max(0, data.hourly.time.findIndex((t) => t >= now));
    hours = data.hourly.time.slice(start, start + 24).map((t, i) => ({
      time: i === 0 ? 'Now' : t.slice(11, 16), temp: data.hourly.temperature_2m[start + i], code: data.hourly.weather_code[start + i],
    }));
  }

  return (
    <View style={[styles.app, data && !data.current.is_day && styles.night]}>
      <StatusBar style="light" />
      <View style={styles.top}>
        <TextInput style={styles.input} value={query} onChangeText={setQuery} placeholder="Search city" placeholderTextColor="#94a3b8" returnKeyType="search" />
        <Pressable style={styles.iconBtn} onPress={() => getLocation().then(select)}><Text style={styles.iconText}>📍</Text></Pressable>
        <Pressable style={styles.iconBtn} onPress={() => setUnit(unit === 'C' ? 'F' : 'C')}><Text style={styles.unitText}>°{unit}</Text></Pressable>
      </View>

      {results.length > 0 && (
        <View style={styles.suggest}>
          {results.map((c) => (
            <Pressable key={c.id} style={styles.suggestRow} onPress={() => select({ name: c.name, latitude: c.latitude, longitude: c.longitude })}>
              <Text style={styles.suggestName}>{c.name}</Text>
              <Text style={styles.suggestSub}>{[c.admin1, c.country].filter(Boolean).join(', ')}</Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => load(place, true)} tintColor="#fff" />}
      >
        {favs.length > 0 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingBottom: 8 }}>
            {favs.map((f) => (
              <Pressable key={keyOf(f)} style={styles.chip} onPress={() => select(f)} onLongPress={() => setFavs((l) => l.filter((x) => keyOf(x) !== keyOf(f)))}>
                <Text style={styles.chipText}>⭐ {f.name}</Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {loading && <ActivityIndicator size="large" color="#fff" style={{ marginTop: 60 }} />}
        {!!error && !loading && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
            <Pressable style={styles.retry} onPress={() => load(place)}><Text style={styles.retryText}>Retry</Text></Pressable>
          </View>
        )}

        {data && !loading && (
          <View>
            <View style={styles.placeRow}>
              <Text style={styles.place}>{place.name}</Text>
              <Pressable onPress={toggleFav}><Text style={styles.star}>{isFav ? '⭐' : '☆'}</Text></Pressable>
            </View>
            <Text style={styles.icon}>{describe(data.current.weather_code)[1]}</Text>
            <Text style={styles.temp}>{fmt(data.current.temperature_2m, unit)}{unit}</Text>
            <Text style={styles.label}>{describe(data.current.weather_code)[0]} · Feels {fmt(data.current.apparent_temperature, unit)}</Text>
            <View style={styles.stats}>
              <Text style={styles.stat}>💧 {data.current.relative_humidity_2m}%</Text>
              <Text style={styles.stat}>💨 {Math.round(data.current.wind_speed_10m)} km/h</Text>
              <Text style={styles.stat}>H {fmt(data.daily.temperature_2m_max[0], unit)} L {fmt(data.daily.temperature_2m_min[0], unit)}</Text>
            </View>

            <Text style={styles.h2}>Next 24 hours</Text>
            <FlatList
              horizontal
              data={hours}
              keyExtractor={(h) => h.time}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8 }}
              renderItem={({ item, index }) => (
                <View style={[styles.hour, index === 0 && styles.hourNow]}>
                  <Text style={styles.hourText}>{item.time}</Text>
                  <Text style={{ fontSize: 22 }}>{describe(item.code)[1]}</Text>
                  <Text style={styles.hourTemp}>{fmt(item.temp, unit)}</Text>
                </View>
              )}
            />

            <Text style={styles.h2}>7-day forecast</Text>
            {data.daily.time.map((d, i) => (
              <View key={d} style={styles.day}>
                <Text style={[styles.dayText, { width: 80 }]}>{i === 0 ? 'Today' : new Date(d + 'T00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' })}</Text>
                <Text style={{ fontSize: 20 }}>{describe(data.daily.weather_code[i])[1]}</Text>
                <Text style={styles.dayText}>{fmt(data.daily.temperature_2m_min[i], unit)} / {fmt(data.daily.temperature_2m_max[i], unit)}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  app: { flex: 1, backgroundColor: '#1d4ed8' },
  night: { backgroundColor: '#1e1b4b' },
  top: { flexDirection: 'row', gap: 8, padding: 16, paddingBottom: 8 },
  input: { flex: 1, height: 44, borderRadius: 12, paddingHorizontal: 12, backgroundColor: '#fff' },
  iconBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  iconText: { fontSize: 18 },
  unitText: { color: '#fff', fontWeight: '800' },
  suggest: { marginHorizontal: 16, backgroundColor: '#fff', borderRadius: 12, marginBottom: 8 },
  suggestRow: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  suggestName: { fontWeight: '700' },
  suggestSub: { color: '#64748b', fontSize: 12 },
  chip: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  chipText: { color: '#fff' },
  errorBox: { backgroundColor: '#fee2e2', borderRadius: 12, padding: 14, marginTop: 20, alignItems: 'center' },
  errorText: { color: '#991b1b' },
  retry: { marginTop: 8, backgroundColor: '#991b1b', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8 },
  retryText: { color: '#fff', fontWeight: '700' },
  placeRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 8 },
  place: { color: '#fff', fontSize: 22, fontWeight: '700' },
  star: { fontSize: 24, color: '#fde68a' },
  icon: { fontSize: 70, textAlign: 'center' },
  temp: { color: '#fff', fontSize: 64, fontWeight: '800', textAlign: 'center' },
  label: { color: '#dbeafe', textAlign: 'center' },
  stats: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 6, marginTop: 10 },
  stat: { color: '#fff', backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12 },
  h2: { color: '#fff', fontWeight: '700', marginTop: 20, marginBottom: 8 },
  hour: { width: 62, alignItems: 'center', paddingVertical: 10, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.12)' },
  hourNow: { backgroundColor: 'rgba(255,255,255,0.3)' },
  hourText: { color: '#fff', fontSize: 12 },
  hourTemp: { color: '#fff', fontWeight: '700' },
  day: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', padding: 12, borderRadius: 12, marginBottom: 6 },
  dayText: { color: '#fff' },
});`,
      },
      result: 'A blue phone screen (indigo at night) with a search bar, 📍 and °C/°F buttons, Hyderabad\'s current weather, a swipeable 24-hour strip and a 7-day list. Typing a city shows suggestions; ☆ saves it as a chip (long-press a chip to remove it); 📍 switches to "My location (Bengaluru)"; °F converts every value.',
      explanation:
        "The API and conversion code are identical to the web app, only the UI primitives changed: TextInput with onChangeText, Pressable with onPress, a horizontal FlatList for hours and RefreshControl for pull-to-refresh. Search uses the debounce-in-effect pattern with a cancelled flag so an older response cannot overwrite a newer one. In the real app, favourites come from the AsyncStorage hook in the code block (load once, then save only after loading so you do not overwrite saved data with the empty initial array) and location from expo-location with a permission request; the playground simulates both because those native modules are not available in the browser.",
    },
  ],
  interview: [
    { q: 'Walk me through the architecture of your weather app.', a: "Layers: api/weather.js (the only module that knows URLs and handles HTTP errors), utils (pure functions: WMO code mapping, unit conversion, zipping forecast arrays), hooks (useWeather for server state with loading/error/reload, useDebounce, useLocalStorage/useFavourites), and presentational components (SearchBar, CurrentWeather, HourlyForecast, DailyForecast, Favourites). App owns place, unit and favourites; everything else is derived. The mobile app reuses api and utils and swaps components and storage.", level: 'Medium' },
    { q: 'Why did you choose Open-Meteo, and how would you handle an API that needs a key?', a: "Open-Meteo is free, needs no key and supports CORS, so the browser can call it directly. For a keyed API (e.g. OpenWeatherMap) the key in a VITE_ variable is still public in the bundle, so for production I would proxy requests through a serverless function (Vercel/Netlify function) that adds the key on the server, and add caching and rate limiting there.", level: 'Medium' },
    { q: 'How do you prevent a request on every key press in the search box?', a: "Debounce: a useDebounce hook updates the value only after the user stops typing for 400 ms (setTimeout in an effect, cleared in the cleanup). I also skip queries under 2 characters and cancel older requests with AbortController so stale suggestions never replace newer ones.", level: 'Easy' },
    { q: 'What race condition can happen when switching cities quickly and how did you fix it?', a: "Two requests are in flight; if the first (older) one resolves last, it overwrites the newer city's data. I create an AbortController inside the effect and abort it in the cleanup when place changes, ignoring AbortError. With a cancelled flag or TanStack Query (which keys data by city) the problem is also solved.", level: 'Medium' },
    { q: 'How does the °C/°F toggle work without refetching?', a: "The API data stays in °C. Unit is UI state ('C' | 'F'), and a pure formatTemp(celsius, unit) converts while rendering (F = C × 9/5 + 32). Storing converted values would duplicate state and risk inconsistency. The unit is persisted with useLocalStorage so the choice survives reloads.", level: 'Easy' },
    { q: 'How did you get the user\'s current location and what can go wrong?', a: "Web: navigator.geolocation.getCurrentPosition wrapped in a Promise with a timeout. It needs HTTPS or localhost and user permission; errors are code 1 denied, 2 unavailable, 3 timeout, so I map each to a friendly message and fall back to the last city. Mobile: expo-location requestForegroundPermissionsAsync then getCurrentPositionAsync, with the permission text in app.json.", level: 'Medium' },
    { q: 'How do you persist favourites and what edge cases did you handle?', a: "useLocalStorage reads once with lazy useState initialisation and writes in an effect; both are in try/catch because storage can be blocked (private mode, sandboxed iframes) or contain corrupted JSON. Favourites are deduplicated by rounded coordinates, not by name, and capped at 8. On mobile AsyncStorage is async, so I load in an effect and only save after the initial load completes.", level: 'Medium' },
    { q: 'How did you turn Open-Meteo\'s hourly arrays into a 24-hour forecast?', a: "The response has parallel arrays (hourly.time, hourly.temperature_2m, ...) for 168 hours starting at midnight. I take current.time truncated to the hour, findIndex of the first hourly time >= it (ISO strings compare correctly as text), slice 24 entries and zip them into objects. Using timezone=auto means the times are already local to the city, so slicing the string avoids browser timezone bugs.", level: 'Hard' },
    { q: 'What loading and error states does your app have?', a: "Initial loading: skeleton with aria-busy. Search: Searching…, No cities found, Search failed. Forecast error: a role=\"alert\" box with the message (\"No internet connection\" for network failures) and a Retry button that bumps a reload key. Location: Finding your location… and a fallback message when denied. Empty: no favourites hint.", level: 'Easy' },
    { q: 'How would you add caching so revisiting a city is instant?', a: "Replace useWeather with TanStack Query: useQuery({ queryKey: ['forecast', lat, lon], queryFn, staleTime: 10 * 60 * 1000 }). Data is cached per city, deduplicated, refetched on focus when stale, and the race condition disappears. For offline support, persist the query cache to localStorage/AsyncStorage with the persistQueryClient plugin.", level: 'Hard' },
    { q: 'What changed when you built the React Native version?', a: "Same React logic and API module; different primitives: View/Text/TextInput/Pressable instead of HTML, a horizontal FlatList for hours, RefreshControl for pull-to-refresh, StyleSheet instead of CSS, AsyncStorage instead of localStorage (asynchronous), expo-location with runtime permissions, and EAS Build to produce an APK/AAB.", level: 'Medium' },
    { q: 'How did you deploy the web and mobile apps?', a: "Web: npm run build to dist/, then Vercel (framework preset Vite) connected to GitHub so every push to main deploys and every PR gets a preview URL. Mobile: eas build -p android --profile preview for a shareable APK and --profile production for the Play Store AAB, with app.json holding the package name, version, icon and permission texts.", level: 'Easy' },
    { q: 'How did you make the app accessible?', a: "Real buttons and labelled inputs, aria-pressed on toggle buttons (°C/°F, favourite), aria-label on icon-only buttons (📍, ✕), aria-busy on the skeleton, role=\"alert\" for errors, visible focus outlines, good colour contrast on gradients and emoji marked aria-hidden where the text already says the condition.", level: 'Medium' },
    { q: 'How would you test this project?', a: "Unit tests (Vitest) for pure utils: formatTemp, describe, next24Hours with a fixed JSON fixture. Component tests with React Testing Library + MSW to mock Open-Meteo: search shows suggestions, error shows Retry, toggle changes units. One Playwright end-to-end test for search → select → favourite → reload.", level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add an "Air quality" card using the Open-Meteo Air Quality API (https://air-quality-api.open-meteo.com/v1/air-quality?latitude=..&longitude=..&current=us_aqi,pm2_5,pm10). Show the AQI with a colour and label (Good, Moderate, Unhealthy, ...).',
      hint: 'US AQI bands: 0-50 Good, 51-100 Moderate, 101-150 Unhealthy for sensitive groups, 151-200 Unhealthy, 201-300 Very unhealthy, 300+ Hazardous. Fetch it in a separate hook so a failure does not break the weather card.',
      solution: `const { useState, useEffect } = React;

const BANDS = [
  [50, 'Good', '#16a34a'], [100, 'Moderate', '#ca8a04'], [150, 'Unhealthy for sensitive groups', '#ea580c'],
  [200, 'Unhealthy', '#dc2626'], [300, 'Very unhealthy', '#7c3aed'], [Infinity, 'Hazardous', '#7f1d1d'],
];
const band = (aqi) => BANDS.find(([max]) => aqi <= max);

function useAirQuality(place) {
  const [state, setState] = useState({ data: null, error: null });
  useEffect(() => {
    const controller = new AbortController();
    fetch('https://air-quality-api.open-meteo.com/v1/air-quality?current=us_aqi,pm2_5,pm10&latitude=' + place.latitude + '&longitude=' + place.longitude, { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
      .then((d) => setState({ data: d.current, error: null }))
      .catch((e) => { if (e.name !== 'AbortError') setState({ data: null, error: e.message }); });
    return () => controller.abort();
  }, [place.latitude, place.longitude]);
  return state;
}

function AirQualityCard({ place }) {
  const { data, error } = useAirQuality(place);
  if (error) return <p>Air quality unavailable</p>;
  if (!data) return <p>Loading air quality…</p>;
  const [, label, color] = band(data.us_aqi);
  return (
    <section style={{ borderLeft: '6px solid ' + color, padding: 12, background: '#fff', borderRadius: 10 }}>
      <h3 style={{ margin: 0 }}>Air quality · {place.name}</h3>
      <p style={{ fontSize: 32, fontWeight: 800, color, margin: '6px 0' }}>{data.us_aqi} <small style={{ fontSize: 14 }}>{label}</small></p>
      <p>PM2.5 {data.pm2_5} µg/m³ · PM10 {data.pm10} µg/m³</p>
    </section>
  );
}

function App() {
  return <AirQualityCard place={{ name: 'New Delhi', latitude: 28.61, longitude: 77.21 }} />;
}`,
    },
    {
      task: 'Draw the next 24 hours as an SVG line chart (no chart library): x = hour, y = temperature, with a dot and label every 3 hours.',
      hint: 'Scale with x = i * (width / 23) and y = height - ((t - min) / (max - min)) * height. Build the path string with points.map((p, i) => (i ? "L" : "M") + p.x + " " + p.y).join(" ").',
      solution: `function TempChart({ hours, width = 420, height = 140 }) {
  const temps = hours.map((h) => h.temp);
  const min = Math.min(...temps) - 1;
  const max = Math.max(...temps) + 1;
  const pad = 20;
  const pts = hours.map((h, i) => ({
    x: pad + i * ((width - 2 * pad) / (hours.length - 1)),
    y: pad + (1 - (h.temp - min) / (max - min)) * (height - 2 * pad),
    ...h,
  }));
  const d = pts.map((p, i) => (i ? 'L' : 'M') + p.x.toFixed(1) + ' ' + p.y.toFixed(1)).join(' ');
  return (
    <svg viewBox={'0 0 ' + width + ' ' + height} width="100%" role="img" aria-label="Temperature for the next 24 hours">
      <path d={d} fill="none" stroke="#f97316" strokeWidth="3" strokeLinejoin="round" />
      {pts.filter((_, i) => i % 3 === 0).map((p) => (
        <g key={p.time}>
          <circle cx={p.x} cy={p.y} r="4" fill="#f97316" />
          <text x={p.x} y={p.y - 8} textAnchor="middle" fontSize="11">{Math.round(p.temp)}°</text>
          <text x={p.x} y={height - 4} textAnchor="middle" fontSize="10" fill="#64748b">{p.time}</text>
        </g>
      ))}
    </svg>
  );
}

// usage inside the complete app:
// <TempChart hours={next24Hours(data)} />
function App() {
  const hours = Array.from({ length: 24 }, (_, i) => ({ time: String(i).padStart(2, '0') + ':00', temp: 22 + 8 * Math.sin((i - 9) / 24 * 2 * Math.PI) }));
  return <TempChart hours={hours} />;
}`,
    },
    {
      task: 'Add "Recent searches": keep the last 5 selected cities (most recent first, no duplicates) in localStorage and show them under the search box when the input is focused and empty.',
      hint: 'On select: setRecent(list => [city, ...list.filter(c => keyOf(c) !== keyOf(city))].slice(0, 5)). Use onFocus/onBlur with a small delay on blur so a click on a suggestion still works.',
      solution: `const { useState, useEffect } = React;

function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => {
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : initial; } catch (e) { return initial; }
  });
  useEffect(() => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {} }, [key, value]);
  return [value, setValue];
}
const keyOf = (p) => p.latitude.toFixed(2) + ',' + p.longitude.toFixed(2);

function RecentSearch({ onSelect }) {
  const [recent, setRecent] = useLocalStorage('mausam:recent', []);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);

  function choose(city) {
    setRecent((list) => [city, ...list.filter((c) => keyOf(c) !== keyOf(city))].slice(0, 5));
    onSelect(city);
    setQuery('');
  }

  const DEMO = [
    { name: 'Goa', latitude: 15.49, longitude: 73.83 },
    { name: 'Indore', latitude: 22.72, longitude: 75.86 },
    { name: 'Lucknow', latitude: 26.85, longitude: 80.95 },
  ];

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} onFocus={() => setFocused(true)}
        onBlur={() => setTimeout(() => setFocused(false), 150)} placeholder="Search city" />
      {focused && !query && recent.length > 0 && (
        <ul>
          <li><small>Recent</small></li>
          {recent.map((c) => <li key={keyOf(c)}><button onClick={() => choose(c)}>🕘 {c.name}</button></li>)}
        </ul>
      )}
      <p>Demo picks: {DEMO.map((c) => <button key={c.name} onClick={() => choose(c)}>{c.name}</button>)}</p>
    </div>
  );
}

function App() {
  const [place, setPlace] = useState(null);
  return <div><RecentSearch onSelect={setPlace} /><p>Selected: {place ? place.name : 'none'}</p></div>;
}`,
    },
    {
      task: 'Offline support: when the forecast request fails, show the last successful forecast for that city from localStorage with a banner "Offline · showing data from 10:42". Save every successful response with a timestamp.',
      hint: 'Cache key: "mausam:cache:" + keyOf(place). Store { savedAt: Date.now(), data }. In the catch block, read the cache before setting the error.',
      solution: `// inside useWeather
function useWeather(place) {
  const [state, setState] = useState({ data: null, loading: true, error: null, offlineSince: null });
  useEffect(() => {
    const controller = new AbortController();
    const cacheKey = 'mausam:cache:' + place.latitude.toFixed(2) + ',' + place.longitude.toFixed(2);
    setState((s) => ({ ...s, loading: true, error: null }));
    getForecast(place, controller.signal)
      .then((data) => {
        try { localStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), data })); } catch (e) {}
        setState({ data, loading: false, error: null, offlineSince: null });
      })
      .catch((err) => {
        if (err.name === 'AbortError') return;
        let cached = null;
        try { cached = JSON.parse(localStorage.getItem(cacheKey)); } catch (e) {}
        if (cached) setState({ data: cached.data, loading: false, error: null, offlineSince: cached.savedAt });
        else setState({ data: null, loading: false, error: err.message, offlineSince: null });
      });
    return () => controller.abort();
  }, [place.latitude, place.longitude]);
  return state;
}

// in App
// {offlineSince && (
//   <p role="status" className="offline">
//     Offline · showing data from {new Date(offlineSince).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
//   </p>
// )}`,
    },
    {
      task: 'Mobile: add a "Favourites" screen to the Expo app with React Navigation bottom tabs (Weather, Favourites). The Favourites screen lists saved cities with their current temperature and swipe-free delete buttons; tapping one opens it on the Weather tab.',
      hint: 'Keep favourites and the selected place in a React Context (FavouritesProvider) so both tabs share them. navigation.navigate("Weather") after setting the place. Fetch temperatures for all favourites with Promise.all.',
      solution: `// src/context/WeatherContext.js
import { createContext, useContext, useState } from 'react';
import { useFavourites } from '../hooks/useFavourites';   // AsyncStorage version from the lesson

const WeatherContext = createContext(null);
export function WeatherProvider({ children }) {
  const [favs, setFavs] = useFavourites();
  const [place, setPlace] = useState({ name: 'Hyderabad', latitude: 17.38, longitude: 78.49 });
  return <WeatherContext.Provider value={{ favs, setFavs, place, setPlace }}>{children}</WeatherContext.Provider>;
}
export const useWeatherApp = () => useContext(WeatherContext);

// src/screens/FavouritesScreen.js
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable } from 'react-native';
import { useWeatherApp } from '../context/WeatherContext';

export default function FavouritesScreen({ navigation }) {
  const { favs, setFavs, setPlace } = useWeatherApp();
  const [temps, setTemps] = useState({});
  useEffect(() => {
    Promise.all(favs.map((f) =>
      fetch('https://api.open-meteo.com/v1/forecast?current=temperature_2m&latitude=' + f.latitude + '&longitude=' + f.longitude)
        .then((r) => r.json()).then((d) => [f.name, d.current.temperature_2m]).catch(() => [f.name, null])
    )).then((pairs) => setTemps(Object.fromEntries(pairs)));
  }, [favs]);
  return (
    <FlatList
      data={favs}
      keyExtractor={(f) => f.latitude + ',' + f.longitude}
      ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No favourites yet</Text>}
      renderItem={({ item }) => (
        <Pressable style={{ flexDirection: 'row', padding: 16, alignItems: 'center' }}
          onPress={() => { setPlace(item); navigation.navigate('Weather'); }}>
          <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
          <Text style={{ marginRight: 16 }}>{temps[item.name] == null ? '…' : Math.round(temps[item.name]) + '°C'}</Text>
          <Pressable onPress={() => setFavs((l) => l.filter((f) => f !== item))}><Text>🗑</Text></Pressable>
        </Pressable>
      )}
    />
  );
}

// App.js
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { WeatherProvider } from './src/context/WeatherContext';
import WeatherScreen from './src/screens/WeatherScreen';
import FavouritesScreen from './src/screens/FavouritesScreen';

const Tab = createBottomTabNavigator();
export default function App() {
  return (
    <WeatherProvider>
      <NavigationContainer>
        <Tab.Navigator>
          <Tab.Screen name="Weather" component={WeatherScreen} />
          <Tab.Screen name="Favourites" component={FavouritesScreen} />
        </Tab.Navigator>
      </NavigationContainer>
    </WeatherProvider>
  );
}`,
    },
  ],
  quiz: [
    {
      question: 'The Open-Meteo geocoding API returns {"generationtime_ms": 0.07} for an unknown city. Which code handles it safely?',
      options: ['data.results[0]', 'data.results ?? []', 'data[0]', 'JSON.parse(data.results)'],
      answer: 1,
      explanation: 'The results key is missing when nothing matches, so default it to an empty array before using it.',
    },
    {
      question: 'Why does the search box use a 400 ms debounce?',
      options: ['To make the input feel slower', 'Because fetch cannot run faster', 'To send one request after the user stops typing instead of one per key press', 'To cache results in localStorage'],
      answer: 2,
      explanation: 'Debouncing waits for a pause in typing, reducing API calls and flicker.',
    },
    {
      question: 'What is the best way to implement the °C/°F toggle?',
      options: ['Keep data in °C and convert while rendering based on a unit state', 'Refetch the API with temperature_unit every time', 'Store both °C and °F copies of the data in state', 'Reload the page with a query string'],
      answer: 0,
      explanation: 'One source of truth plus a pure conversion avoids duplicate state and extra requests.',
    },
    {
      question: 'Which statement about navigator.geolocation is TRUE?',
      options: ['It works on any http:// site without permission', 'It returns coordinates synchronously', 'It is available in React Native without any library', 'It needs HTTPS (or localhost) and user permission, and can fail with denied/unavailable/timeout'],
      answer: 3,
      explanation: 'Geolocation is a permission-gated, asynchronous API restricted to secure contexts; React Native apps use expo-location.',
    },
    {
      question: 'In the React Native version, what replaces localStorage for favourites?',
      options: ['sessionStorage', 'AsyncStorage (asynchronous key-value storage)', 'document.cookie', 'IndexedDB'],
      answer: 1,
      explanation: 'React Native has no Web Storage; @react-native-async-storage/async-storage provides an async key-value store.',
    },
  ],
};
