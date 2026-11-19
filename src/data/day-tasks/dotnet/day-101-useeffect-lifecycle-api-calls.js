export default {
  lesson: 'day-101-useeffect-lifecycle-api-calls',
  minutes: 35,
  intro: 'Run side effects with useEffect: load data from the API on mount, re-run when a dependency changes and clean up timers and requests.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `useEffect(() => { loadStudents(); }, [])` do?',
      options: ['Runs loadStudents on every render', 'Runs loadStudents once after the first render (mount)', 'Never runs', 'Runs before the component renders'],
      answer: 1,
      explain: 'An **empty dependency array** means "run after the first render only" - the place to load initial data. Without the array the effect runs after every render; with `[id]` it re-runs when `id` changes.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'The component mounts and then the user clicks the button **once**. What is logged, in order?',
      example: { title: 'effects run after rendering', code: 'render → React updates the DOM → effect runs' },
      code: `function Page() {
  const [n, setN] = useState(0);
  console.log("render " + n);
  useEffect(() => {
    console.log("effect " + n);
    return () => console.log("cleanup " + n);
  }, [n]);
  return <button onClick={() => setN(n + 1)}>+</button>;
}`,
      expected: `render 0
effect 0
render 1
cleanup 0
effect 1`,
      explain: 'Effects run **after** render. When `n` changes, React first runs the previous effect\'s **cleanup** (with the old value 0), then the new effect. (In development StrictMode React mounts twice to reveal missing cleanups - ignore that here.)',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the cleanup so the timer stops when the component unmounts:\n```\nuseEffect(() => {\n  const id = setInterval(() => setSeconds((s) => s + 1), 1000);\n  return () => ______;\n}, []);\n```',
      example: { title: 'cleaning up an event listener', code: 'return () => window.removeEventListener("resize", onResize);' },
      accept: ['clearInterval(id)', 'clearInterval(id);'],
      caseSensitive: true,
      explain: 'The function returned from an effect is its **cleanup**. Without `clearInterval` the timer keeps running after the component is gone, wasting CPU and trying to update unmounted state.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 10,
      q: '**Load students from the API.** `api.getStudents()` (given) resolves after 100 ms with 3 students. In `App`:\n- state `students` ([]), `loading` (true), `error` (null)\n- `useEffect(..., [])` loads with async/await + try/catch/finally\n- render `<p id="loading">Loading...</p>` while loading, `<p id="error">` on error, else `<table id="students">` with one `<tr>` per student containing `<td>` name and `<td>` city',
      example: { title: 'async inside an effect', code: 'useEffect(() => {\n  async function load() {\n    const data = await api.getCourses();\n    setCourses(data);\n  }\n  load();\n}, []);' },
      starter: 'const { useState, useEffect } = React;\nconst api = {\n  getStudents: () => new Promise((r) => setTimeout(() => r([\n    { id: 1, name: "Asha", city: "Pune" },\n    { id: 2, name: "Ravi", city: "Nagpur" },\n    { id: 3, name: "Meera", city: "Mumbai" },\n  ]), 100)),\n};\n\nfunction App() {\n  // TODO\n  return <p id="loading">Loading...</p>;\n}\n',
      solution: 'const { useState, useEffect } = React;\nconst api = {\n  getStudents: () => new Promise((r) => setTimeout(() => r([\n    { id: 1, name: "Asha", city: "Pune" },\n    { id: 2, name: "Ravi", city: "Nagpur" },\n    { id: 3, name: "Meera", city: "Mumbai" },\n  ]), 100)),\n};\n\nfunction App() {\n  const [students, setStudents] = useState([]);\n  const [loading, setLoading] = useState(true);\n  const [error, setError] = useState(null);\n  useEffect(() => {\n    async function load() {\n      try {\n        setStudents(await api.getStudents());\n      } catch (e) {\n        setError(e.message);\n      } finally {\n        setLoading(false);\n      }\n    }\n    load();\n  }, []);\n  if (loading) return <p id="loading">Loading...</p>;\n  if (error) return <p id="error">{error}</p>;\n  return (\n    <table id="students">\n      <tbody>\n        {students.map((s) => (\n          <tr key={s.id}><td>{s.name}</td><td>{s.city}</td></tr>\n        ))}\n      </tbody>\n    </table>\n  );\n}\n',
      actions: [{ wait: 400 }],
      checks: [
        { sel: '#loading', notExists: true, msg: 'Loading... must disappear after the data arrives' },
        { sel: '#students tr', count: 3, msg: 'Render 3 rows in table#students' },
        { sel: '#students tr:nth-child(3) td', index: 0, textEq: 'Meera', msg: 'The third row must start with Meera' },
      ],
      explain: 'Loading, error and data are the three states of every API call. The effect callback itself must not be `async` (it may only return a cleanup), so define an async function inside and call it.',
    },
    {
      type: 'code',
      lang: 'jsx',
      mins: 10,
      q: '**Re-load when a dependency changes.** `api.getCourses(dept)` (given) resolves after 50 ms with the course titles of that department. Keep `dept` state (start `"IT"`) changed by `<select id="dept">` (options IT, HR). Load courses in `useEffect` with `[dept]` as dependency and render them in `<ul id="courses">`.\n\n(The grader selects HR.)',
      example: { title: 'an effect that depends on a prop', code: 'useEffect(() => {\n  api.getOrders(customerId).then(setOrders);\n}, [customerId]);' },
      starter: 'const { useState, useEffect } = React;\nconst data = { IT: ["C#", "ASP.NET Core", "React"], HR: ["Payroll", "Recruitment"] };\nconst api = { getCourses: (d) => new Promise((r) => setTimeout(() => r(data[d]), 50)) };\n\nfunction App() {\n  const [dept, setDept] = useState("IT");\n  const [courses, setCourses] = useState([]);\n  // TODO: effect with [dept]\n  return (\n    <div>\n      <select id="dept" value={dept} onChange={(e) => setDept(e.target.value)}>\n        <option>IT</option>\n        <option>HR</option>\n      </select>\n      <ul id="courses">{courses.map((c) => <li key={c}>{c}</li>)}</ul>\n    </div>\n  );\n}\n',
      solution: 'const { useState, useEffect } = React;\nconst data = { IT: ["C#", "ASP.NET Core", "React"], HR: ["Payroll", "Recruitment"] };\nconst api = { getCourses: (d) => new Promise((r) => setTimeout(() => r(data[d]), 50)) };\n\nfunction App() {\n  const [dept, setDept] = useState("IT");\n  const [courses, setCourses] = useState([]);\n  useEffect(() => {\n    let ignore = false;\n    api.getCourses(dept).then((list) => { if (!ignore) setCourses(list); });\n    return () => { ignore = true; };\n  }, [dept]);\n  return (\n    <div>\n      <select id="dept" value={dept} onChange={(e) => setDept(e.target.value)}>\n        <option>IT</option>\n        <option>HR</option>\n      </select>\n      <ul id="courses">{courses.map((c) => <li key={c}>{c}</li>)}</ul>\n    </div>\n  );\n}\n',
      actions: [{ wait: 200 }, { input: ['#dept', 'HR'] }, { wait: 300 }],
      checks: [
        { sel: '#courses li', count: 2, msg: 'After selecting HR, show the 2 HR courses' },
        { sel: '#courses li', index: 0, textEq: 'Payroll', msg: 'The first HR course is Payroll' },
      ],
      explain: 'Listing `dept` in the dependency array re-runs the effect whenever it changes. The `ignore` flag in the cleanup prevents a slow old response (IT) from overwriting the newer one (HR) - a race condition.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Every state/prop used inside an effect should be in its dependency array',
        'Setting state inside an effect that has no dependency array can cause an infinite loop',
        'Effects are the place for subscriptions, timers and data fetching',
        'You should POST a submitted form inside useEffect',
        'Cleanup functions run before the effect re-runs and on unmount',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Effects synchronise with external systems. Missing dependencies give stale data; no array + setState = render loop. A form POST is caused by a user event, so it belongs in the **submit handler**, not an effect.',
    },
  ],
};
