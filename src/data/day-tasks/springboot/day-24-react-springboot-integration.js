export default {
  lesson: 'day-24-react-springboot-integration',
  minutes: 26,
  intro: 'Connect a React (Vite) app to a Spring Boot API: CORS, fetch vs axios error handling, JWT headers and environment variables.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'React on `http://localhost:5173` calls `http://localhost:8080/api/students`. Postman works, but the browser console shows "blocked by CORS policy". Where is the fix?',
      options: [
        'In React: add mode: "no-cors" to fetch',
        'In Spring Boot: allow the origin http://localhost:5173 (CorsConfigurationSource / @CrossOrigin and http.cors())',
        'Restart the browser',
        'Change the API to port 5173',
      ],
      answer: 1,
      explain: 'CORS is decided by the **server** headers. Configure Spring to allow the frontend origin (and enable `http.cors()` when Spring Security is on). `mode: "no-cors"` only gives an unreadable "opaque" response. A Vite dev proxy is another option in development.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The API returns **404** for student 99. What does this code print? (one line per console.log)',
      example: { title: 'the key difference', text: 'fetch only rejects on network errors; axios rejects for every status outside 2xx.' },
      code: `async function test() {
  const res = await fetch("http://localhost:8080/api/students/99");
  console.log("fetch ok:", res.ok, res.status);

  try {
    await axios.get("http://localhost:8080/api/students/99");
    console.log("axios success");
  } catch (err) {
    console.log("axios error:", err.response.status);
  }
}`,
      expected: 'fetch ok: false 404\naxios error: 404',
      explain: '`fetch` resolves normally for 404, so you must check `res.ok` yourself (false for non-2xx). **axios** throws for 4xx/5xx, so the code jumps into `catch` where `err.response.status` is 404.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In a Vite project `.env` contains `VITE_API_URL=http://localhost:8080`. How do you read it in React code?',
      example: { title: 'production file', code: '# .env.production\nVITE_API_URL=https://api.upskillr.in' },
      accept: ['import.meta.env.VITE_API_URL'],
      caseSensitive: true,
      explain: 'Vite exposes only variables starting with **VITE_** through `import.meta.env`. `process.env.REACT_APP_...` is Create React App syntax and is undefined in Vite. Never put secrets here - they end up in the browser bundle.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: 'Write `authHeaders(token)` used by your API helper before calling the Spring Boot backend:\n- always include `"Content-Type": "application/json"`\n- if `token` is a non-empty string, also add `Authorization: "Bearer <token>"`\n- if there is no token (null, undefined or ""), do **not** add an Authorization key',
      example: { title: 'conditionally adding a key', code: 'const h = { Accept: "application/json" };\nif (lang) h["Accept-Language"] = lang;\nreturn h;' },
      starter: 'function authHeaders(token) {\n  // TODO\n}\n',
      solution: 'function authHeaders(token) {\n  const headers = { "Content-Type": "application/json" };\n  if (token) headers.Authorization = `Bearer ${token}`;\n  return headers;\n}\n',
      tests: [
        { call: 'authHeaders("abc.def.ghi")', expect: { 'Content-Type': 'application/json', Authorization: 'Bearer abc.def.ghi' } },
        { call: 'authHeaders(null)', expect: { 'Content-Type': 'application/json' } },
        { call: 'authHeaders("")', expect: { 'Content-Type': 'application/json' } },
        { call: 'authHeaders(undefined)', expect: { 'Content-Type': 'application/json' } },
      ],
      explain: 'The JWT filter in Spring expects exactly `Bearer <token>` (with one space). Sending `Authorization: Bearer null` when logged out is a common bug - the filter then fails to parse it. An axios request interceptor usually does this for every call.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In `vite.config.js`, which key inside `server` forwards `/api` calls to Spring Boot during development (so no CORS is needed)?\n```\nexport default defineConfig({\n  server: {\n    ???: { "/api": "http://localhost:8080" },\n  },\n});\n```',
      example: { title: 'then call relative URLs', code: 'fetch("/api/students")   // Vite forwards it to :8080' },
      accept: ['proxy'],
      explain: 'The Vite dev **proxy** makes the browser think the API is on the same origin (5173), so no CORS headers are needed in development. In production you use nginx (or serve the build from Spring Boot) with the same idea.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about JWT login in React are TRUE? (choose all that apply)',
      options: [
        'After POST /api/auth/login, store the returned token and send it on later requests',
        'An axios response interceptor can log the user out when the API returns 401',
        'A ProtectedRoute component can redirect to /login when there is no token',
        'Hiding a button in React is enough security; the backend need not check roles',
      ],
      answers: [0, 1, 2],
      explain: 'Login → save token → attach via interceptor → handle 401 globally → protect routes. But React code runs in the user\'s browser and can be changed, so **the backend must always enforce** authentication and roles.',
    },
  ],
};
