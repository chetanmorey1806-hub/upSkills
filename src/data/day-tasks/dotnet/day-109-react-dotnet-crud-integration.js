export default {
  lesson: 'day-109-react-dotnet-crud-integration',
  minutes: 40,
  intro: 'Connect the React UI to the ASP.NET Core API for full CRUD with loading and error states, then configure environments and build for deployment.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'In a Vite app, complete the expression that reads the API base URL from `.env` (`VITE_API_URL=https://localhost:7001/api`):\n`const api = axios.create({ baseURL: ______ });`',
      example: { title: 'checking the mode', code: 'if (import.meta.env.DEV) console.log("development build");' },
      accept: ['import.meta.env.VITE_API_URL'],
      caseSensitive: true,
      explain: 'Vite exposes only variables prefixed with **VITE_** through `import.meta.env`, and replaces them **at build time**. `process.env` is Node/CRA style and is undefined in Vite.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You run `npm run build` for production. Which file\'s `VITE_API_URL` is used by default?',
      options: ['.env.development', '.env.production (overriding .env)', 'appsettings.json', 'The value typed in the browser'],
      answer: 1,
      explain: '`vite build` uses mode **production**, loading `.env` then `.env.production` (which wins). Because values are baked into the JS files, changing the API URL requires a rebuild. Never put secrets in VITE_ variables - they are public in the bundle.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are needed to make the built React app work with the deployed .NET API? (choose all that apply)',
      options: [
        'The API CORS policy allows the React site\'s origin (unless both are served from the same origin)',
        'VITE_API_URL points to the production API URL at build time',
        'The host serves index.html for unknown routes so /students/5 works after a refresh',
        'node_modules is uploaded to the server',
        'Both use HTTPS in production',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Only the `dist` folder is deployed. Typical setups: React on Azure Static Web Apps + API on App Service (CORS needed), or React copied into the API\'s wwwroot with `MapFallbackToFile("index.html")` (same origin).',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 8,
      q: '**Optimistic delete with rollback.** Write `async function deleteStudent(list, id, apiDelete, setList)` that:\n1. immediately calls `setList` with the student removed\n2. awaits `apiDelete(id)`\n3. if it throws, calls `setList(list)` again (rollback) and returns `false`; otherwise returns `true`',
      example: { title: 'try/catch around an await', code: 'try {\n  await api.save(x);\n} catch {\n  showError();\n}' },
      starter: 'async function deleteStudent(list, id, apiDelete, setList) {\n  // TODO\n}\n',
      solution: 'async function deleteStudent(list, id, apiDelete, setList) {\n  setList(list.filter((s) => s.id !== id));\n  try {\n    await apiDelete(id);\n    return true;\n  } catch {\n    setList(list);\n    return false;\n  }\n}\n',
      tests: [
        { call: '(async () => { const calls = []; const ok = await deleteStudent([{ id: 1 }, { id: 2 }], 1, async () => {}, (l) => calls.push(l)); return [ok, calls]; })()', expect: [true, [[{ id: 2 }]]], msg: 'On success remove the item once and return true' },
        { call: '(async () => { const calls = []; const list = [{ id: 1 }, { id: 2 }]; const ok = await deleteStudent(list, 2, async () => { throw new Error("500"); }, (l) => calls.push(l)); return [ok, calls]; })()', expect: [false, [[{ id: 1 }], [{ id: 1 }, { id: 2 }]]], msg: 'On failure restore the original list and return false' },
      ],
      explain: 'Optimistic updates make the UI feel instant, but you must **roll back** when the API fails (e.g. 403 or 500) and tell the user. The pessimistic alternative is to wait for the API before changing state.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 14,
      q: '**Edit form with loading, saving and error states.** The fake API (given) has `getStudent(id)` (50 ms) and `updateStudent(id, data)` which **rejects** with `{ response: { status: 400, data: { errors: { City: ["City is required"] } } } }` when city is empty, else resolves `{ data }`.\n- on mount load student 1: show `<p id="loading">Loading...</p>` until then\n- form `<form id="edit">` with controlled `<input id="name">` and `<input id="city">` filled from the API\n- on submit: disable `<button id="save">` while saving; on 400 show `<p id="error">City is required</p>` (first message); on success show `<p id="ok">Saved</p>`\n\n(The grader clears City and saves.)',
      example: { title: 'saving state around an await', code: 'setSaving(true);\ntry { await api.update(id, form); setOk(true); }\ncatch (e) { setError(...); }\nfinally { setSaving(false); }' },
      starter: 'const { useState, useEffect } = React;\nconst wait = (v, ms = 50) => new Promise((r) => setTimeout(() => r(v), ms));\nconst api = {\n  getStudent: (id) => wait({ data: { id, name: "Asha", city: "Pune" } }),\n  updateStudent: (id, data) => data.city.trim()\n    ? wait({ data: { id, ...data } })\n    : wait(null).then(() => Promise.reject({ response: { status: 400, data: { errors: { City: ["City is required"] } } } })),\n};\n\nfunction App() {\n  // TODO\n  return <p id="loading">Loading...</p>;\n}\n',
      solution: 'const { useState, useEffect } = React;\nconst wait = (v, ms = 50) => new Promise((r) => setTimeout(() => r(v), ms));\nconst api = {\n  getStudent: (id) => wait({ data: { id, name: "Asha", city: "Pune" } }),\n  updateStudent: (id, data) => data.city.trim()\n    ? wait({ data: { id, ...data } })\n    : wait(null).then(() => Promise.reject({ response: { status: 400, data: { errors: { City: ["City is required"] } } } })),\n};\n\nfunction App() {\n  const [form, setForm] = useState(null);\n  const [saving, setSaving] = useState(false);\n  const [error, setError] = useState("");\n  const [ok, setOk] = useState(false);\n  useEffect(() => {\n    api.getStudent(1).then((res) => setForm({ name: res.data.name, city: res.data.city }));\n  }, []);\n  if (!form) return <p id="loading">Loading...</p>;\n  async function handleSubmit(e) {\n    e.preventDefault();\n    setSaving(true);\n    setError("");\n    setOk(false);\n    try {\n      await api.updateStudent(1, form);\n      setOk(true);\n    } catch (err) {\n      const errors = err.response && err.response.data && err.response.data.errors;\n      setError(errors ? Object.values(errors)[0][0] : "Something went wrong");\n    } finally {\n      setSaving(false);\n    }\n  }\n  return (\n    <form id="edit" onSubmit={handleSubmit}>\n      <input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />\n      <input id="city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />\n      <button id="save" disabled={saving}>{saving ? "Saving..." : "Save"}</button>\n      {error && <p id="error">{error}</p>}\n      {ok && <p id="ok">Saved</p>}\n    </form>\n  );\n}\n',
      actions: [
        { wait: 250 }, { input: ['#city', ''] }, { submit: '#edit', wait: 250 },
      ],
      checks: [
        { sel: '#loading', notExists: true, msg: 'Loading... must disappear once the student is loaded' },
        { sel: '#name', prop: { value: 'Asha' }, msg: 'The name input must be filled from the API (Asha)' },
        { sel: '#error', textEq: 'City is required', msg: 'Saving with an empty city must show the API error "City is required"' },
        { sel: '#ok', notExists: true, msg: 'A failed save must not show "Saved"' },
        { sel: '#save', prop: { disabled: false }, msg: 'The Save button must be enabled again after the request finishes' },
      ],
      explain: 'Every screen that talks to the API needs the same states: loading, saving (button disabled), error (preferably the server\'s validation message) and success. `finally` guarantees the button is re-enabled even when the request fails.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does the browser console show in the **production** build?',
      example: { title: 'mode flags', code: 'import.meta.env.MODE // "development" or "production"\nimport.meta.env.PROD // true in a build' },
      code: `// .env                 VITE_API_URL=http://localhost:5000/api
// .env.production      VITE_API_URL=https://api.upskillr.in/api
// .env.production      DB_PASSWORD=secret123

console.log(import.meta.env.VITE_API_URL);
console.log(import.meta.env.PROD);
console.log(import.meta.env.DB_PASSWORD);`,
      expected: `https://api.upskillr.in/api
true
undefined`,
      explain: '`.env.production` overrides `.env` in a build, `PROD` is true, and `DB_PASSWORD` is **not exposed** because it lacks the `VITE_` prefix - Vite protects you from leaking server secrets into public JavaScript.',
    },
  ],
};
