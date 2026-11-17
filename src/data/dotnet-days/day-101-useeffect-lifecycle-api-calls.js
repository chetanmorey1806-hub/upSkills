export default {
  id: 'day-101-useeffect-lifecycle-api-calls',
  title: 'useEffect, Lifecycle Concepts and API Calls',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 101,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Use the useEffect hook to run side effects such as calling the ASP.NET Core Web API, understand mount/update/unmount with the dependency array and cleanup, and fetch the student list with loading and error states.',
  objectives: [
    'Explain side effects and the component lifecycle (mount, update, unmount) in hooks terms',
    'Control when an effect runs with the dependency array',
    'Write cleanup functions (timers, AbortController) to avoid leaks and race conditions',
    'Fetch data from GET /api/students with loading, error and empty states',
  ],
  theory: [
    {
      heading: 'Side effects and why rendering must stay pure',
      content:
        'A component\'s render should be a **pure calculation**: same props + state → same JSX. Anything that reaches outside React is a **side effect**: calling an API, setting a timer, writing to localStorage, changing document.title, subscribing to SignalR.\n\nIf you call `fetch` directly in the component body, it runs on **every** render, sets state, triggers another render, fetches again... an infinite loop. `useEffect` lets you run side effects **after** React has painted the screen, and only when you want.',
      syntax: `import { useEffect } from "react";

useEffect(() => {
  // side effect code
  return () => {
    // optional cleanup
  };
}, [dependencies]);`,
    },
    {
      heading: 'The dependency array controls when the effect runs',
      content:
        'The second argument decides how often the effect runs:',
      points: [
        '**No array** `useEffect(fn)`: after every render (rarely what you want)',
        '**Empty array** `useEffect(fn, [])`: once after the first render (mount): perfect for the initial API call',
        '**With values** `useEffect(fn, [page, search])`: after mount and whenever page or search changes (Object.is comparison)',
      ],
      tip: 'List every state/prop used inside the effect in the array. The ESLint rule react-hooks/exhaustive-deps (enabled in the Vite template) warns you when you forget one.',
    },
    {
      heading: 'Lifecycle concepts with hooks',
      content:
        'Class components had lifecycle methods. Function components express the same moments with useEffect:\n\n- **Mount** (componentDidMount) → `useEffect(() => {...}, [])`\n- **Update** (componentDidUpdate) → `useEffect(() => {...}, [value])`\n- **Unmount** (componentWillUnmount) → the **cleanup** function returned from the effect\n\nThe cleanup also runs **before the effect re-runs** with new dependencies. In development, **StrictMode** mounts, unmounts and re-mounts each component once, so you will see effects run twice. That is intentional: it proves your cleanup works. It does not happen in production.',
      syntax: `useEffect(() => {
  const id = setInterval(() => setSeconds(s => s + 1), 1000);  // mount: start timer
  return () => clearInterval(id);                              // unmount: stop timer
}, []);`,
    },
    {
      heading: 'Calling the .NET Web API with fetch',
      content:
        'An effect callback cannot itself be `async` (it must return nothing or a cleanup function), so define an async function inside and call it.\n\nA professional data-loading component always tracks three things: **data**, **loading** and **error**. `fetch` only rejects on network failures (API not running, CORS blocked, certificate error); for 404 or 500 you must check `response.ok` yourself.',
      syntax: `useEffect(() => {
  const controller = new AbortController();
  async function load() {
    try {
      setLoading(true);
      const res = await fetch(API + "/students", { signal: controller.signal });
      if (!res.ok) throw new Error("HTTP " + res.status);
      setStudents(await res.json());
    } catch (err) {
      if (err.name !== "AbortError") setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  load();
  return () => controller.abort();   // cancel if the component unmounts
}, []);`,
      tip: 'If the browser console shows "blocked by CORS policy", the fix is in the API (AddCors/UseCors with http://localhost:5173), not in React.',
    },
    {
      heading: 'Re-fetching when parameters change and avoiding race conditions',
      content:
        'Module 8 (Day 97) added pagination and search: `GET /api/students?search=a&page=2&pageSize=5`. Put `search` and `page` in the dependency array and the effect re-runs automatically.\n\nIf the user types fast, an old slow request may finish **after** a newer one and overwrite the results (**race condition**). The cleanup with **AbortController** cancels the previous request whenever the dependencies change. ASP.NET Core passes the abort to your action as `HttpContext.RequestAborted` / a `CancellationToken` parameter (Day 38).',
      syntax: `useEffect(() => {
  const c = new AbortController();
  fetch(API + "/students?search=" + encodeURIComponent(search) + "&page=" + page, { signal: c.signal })
    .then(r => r.json())
    .then(setResult)
    .catch(e => { if (e.name !== "AbortError") setError(e.message); });
  return () => c.abort();
}, [search, page]);`,
    },
  ],
  examples: [
    {
      title: 'Fetch student data from GET /api/students',
      scenario: 'The day\'s practical: load the student list from the Module 8 API when the page opens, with loading and error states.',
      steps: [
        'Run the Student API from Module 8 (F5 in Visual Studio) and confirm GET /api/students in Swagger',
        'Make sure Program.cs has the "ReactApp" CORS policy for http://localhost:5173 (Day 98)',
        'In React create src/components/StudentTable.jsx with the code below',
        'Render <StudentTable /> in App.jsx and run npm run dev',
        'Stop the API and refresh to see the error message',
      ],
      code: `// ===== API side (Module 8): Controllers/StudentsController.cs =====
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    public StudentsController(AppDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<StudentResponseDto>>> GetAll(CancellationToken ct)
        => await _db.Students.AsNoTracking()
              .Select(s => new StudentResponseDto(s.Id, s.FullName, s.Email, s.Course, s.Marks))
              .ToListAsync(ct);
}

// ===== React: src/components/StudentTable.jsx =====
import { useEffect, useState } from "react";

const API = import.meta.env.VITE_API_URL;   // https://localhost:7045/api

export default function StudentTable() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const res = await fetch(API + "/students", { signal: controller.signal });
        if (!res.ok) throw new Error("Server returned " + res.status);
        setStudents(await res.json());
      } catch (err) {
        if (err.name !== "AbortError") setError("Could not load students: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (students.length === 0) return <p>No students yet.</p>;

  return (
    <table className="table">
      <thead><tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th></tr></thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}><td>{s.id}</td><td>{s.fullName}</td><td>{s.course}</td><td>{s.marks}</td></tr>
        ))}
      </tbody>
    </table>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// Simulates GET https://localhost:7045/api/students (800 ms network delay)
function fakeFetchStudents(shouldFail) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) reject(new Error("Failed to fetch (is the API running?)"));
      else resolve([
        { id: 1, fullName: "Asha Patil", course: "C#", marks: 87 },
        { id: 2, fullName: "Ravi Kumar", course: "React", marks: 35 },
        { id: 3, fullName: "Meena Shah", course: "SQL Server", marks: 72 },
      ]);
    }, 800);
  });
}

function StudentTable({ fail }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let ignore = false;
    async function load() {
      try {
        const data = await fakeFetchStudents(fail);
        if (!ignore) setStudents(data);
      } catch (err) {
        if (!ignore) setError("Could not load students: " + err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    }
    load();
    return () => { ignore = true; };
  }, []);

  if (loading) return <p>Loading students...</p>;
  if (error) return <p style={{ color: "crimson" }}>{error}</p>;
  return (
    <table style={{ borderCollapse: "collapse" }} border="1" cellPadding="6">
      <thead><tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th></tr></thead>
      <tbody>
        {students.map(s => (
          <tr key={s.id}><td>{s.id}</td><td>{s.fullName}</td><td>{s.course}</td><td>{s.marks}</td></tr>
        ))}
      </tbody>
    </table>
  );
}

function App() {
  const [fail, setFail] = useState(false);
  const [run, setRun] = useState(0);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <label><input type="checkbox" checked={fail} onChange={e => setFail(e.target.checked)} /> Simulate API down</label>{" "}
      <button onClick={() => setRun(r => r + 1)}>Reload</button>
      <StudentTable key={run} fail={fail} />
    </div>
  );
}`,
      },
      result: '"Loading students..." for about 0.8 s, then a table with Asha Patil (87), Ravi Kumar (35) and Meena Shah (72). Tick "Simulate API down" and click Reload: "Could not load students: Failed to fetch (is the API running?)".',
      explanation:
        'The effect with [] runs once after the first render. loading starts true so the first paint shows the loading text. After the await, state is set and the component re-renders with the table. The playground uses an ignore flag as cleanup (the real code uses AbortController); changing key={run} remounts the component so the effect runs again.',
    },
    {
      title: 'Search with dependency array and AbortController',
      scenario: 'Call GET /api/students?search=... every time the search box changes, cancelling the previous request.',
      steps: [
        'Make sure the API from Day 97 supports the search query parameter',
        'Create src/components/StudentSearch.jsx',
        'Put search in the dependency array and abort in the cleanup',
        'Type quickly and watch the Network tab (F12): older requests show "(canceled)"',
      ],
      code: `// API (Day 97): GET /api/students?search=as
[HttpGet]
public async Task<IActionResult> GetAll([FromQuery] string? search, CancellationToken ct)
{
    var q = _db.Students.AsNoTracking();
    if (!string.IsNullOrWhiteSpace(search)) q = q.Where(s => s.FullName.Contains(search));
    return Ok(await q.OrderBy(s => s.FullName).ToListAsync(ct));
}

// src/components/StudentSearch.jsx
import { useEffect, useState } from "react";
const API = import.meta.env.VITE_API_URL;

export default function StudentSearch() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    fetch(API + "/students?search=" + encodeURIComponent(search), { signal: controller.signal })
      .then(r => r.json())
      .then(data => { setResults(data); setLoading(false); })
      .catch(err => { if (err.name !== "AbortError") setLoading(false); });
    return () => controller.abort();   // runs before the next effect
  }, [search]);

  return (
    <div>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
      {loading ? <p>Searching...</p> : <ul>{results.map(s => <li key={s.id}>{s.fullName}</li>)}</ul>}
    </div>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

const DB = ["Asha Patil", "Ravi Kumar", "Meena Shah", "Aslam Khan", "John Dsouza"].map((n, i) => ({ id: i + 1, fullName: n }));
let requestCount = 0;

// Simulated GET /api/students?search=... that supports cancellation
function fakeSearch(search, signal) {
  requestCount++;
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(DB.filter(s => s.fullName.toLowerCase().includes(search.toLowerCase()))), 500);
    signal.addEventListener("abort", () => { clearTimeout(t); reject(new DOMException("aborted", "AbortError")); });
  });
}

function App() {
  const [search, setSearch] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [log, setLog] = useState([]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const n = requestCount + 1;
    fakeSearch(search, controller.signal)
      .then(data => { setResults(data); setLoading(false); setLog(l => [...l, "#" + n + " '" + search + "' done"]); })
      .catch(err => { if (err.name === "AbortError") setLog(l => [...l, "#" + n + " '" + search + "' canceled"]); });
    return () => controller.abort();
  }, [search]);

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
      {loading ? <p>Searching...</p> : <ul>{results.map(s => <li key={s.id}>{s.fullName}</li>)}</ul>}
      <small><b>Request log:</b> {log.slice(-6).join(" | ")}</small>
    </div>
  );
}`,
      },
      result: 'At start all five names appear. Typing "as" quickly shows "Searching..." then Asha Patil and Aslam Khan. The log shows the request for "a" as canceled and "as" as done.',
      explanation:
        'Every keystroke changes search, so React runs the previous effect\'s cleanup (abort) and then the new effect. Only the latest request can update the results, which removes the race condition. (In StrictMode development you may also see one extra canceled request at mount.)',
    },
    {
      title: 'Mount/unmount demo: live clock with cleanup',
      scenario: 'See the lifecycle clearly: a component starts a timer on mount and must stop it on unmount, like a dashboard widget polling the API every few seconds.',
      steps: [
        'Create src/components/LiveClock.jsx',
        'Start setInterval in useEffect and return clearInterval',
        'Toggle the widget from App with a button',
        'Hide the widget and confirm the console stops logging',
      ],
      code: `// src/components/ApiHealthWidget.jsx (polls GET /health every 5 seconds)
import { useEffect, useState } from "react";

export default function ApiHealthWidget() {
  const [status, setStatus] = useState("checking...");
  const [ticks, setTicks] = useState(0);

  useEffect(() => {
    console.log("mounted");
    const id = setInterval(async () => {
      try {
        const res = await fetch("https://localhost:7045/health");   // app.MapHealthChecks("/health")
        setStatus(res.ok ? "Healthy" : "Unhealthy");
      } catch { setStatus("API offline"); }
      setTicks(t => t + 1);
    }, 5000);
    return () => { clearInterval(id); console.log("unmounted"); };
  }, []);

  return <p>API: {status} (checks: {ticks})</p>;
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

function HealthWidget() {
  const [ticks, setTicks] = useState(0);
  useEffect(() => {
    console.log("mounted: timer started");
    const id = setInterval(() => setTicks(t => t + 1), 1000);
    return () => { clearInterval(id); console.log("unmounted: timer cleared"); };
  }, []);
  return <p>API: Healthy (checks: {ticks})</p>;
}

function App() {
  const [show, setShow] = useState(true);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <button onClick={() => setShow(s => !s)}>{show ? "Hide" : "Show"} widget</button>
      {show && <HealthWidget />}
    </div>
  );
}`,
      },
      result: 'The widget shows "API: Healthy (checks: 0)" and the number increases every second. Console: "mounted: timer started". Clicking Hide removes it and logs "unmounted: timer cleared"; Show starts again from 0.',
      explanation:
        'The effect with [] runs on mount and the returned function runs on unmount. Without clearInterval the timer would keep calling setTicks on an unmounted component (a memory leak). Each new mount gets fresh state starting from 0.',
    },
  ],
  interview: [
    { q: 'What is useEffect used for?', a: 'Running side effects after render: API calls, subscriptions, timers, manual DOM changes, localStorage, document.title. It keeps rendering pure.', level: 'Easy' },
    { q: 'Explain the three forms of the dependency array.', a: 'No array: runs after every render. []: runs once after mount (cleanup on unmount). [a, b]: runs after mount and whenever a or b changes.', level: 'Easy' },
    { q: 'How do you mimic componentWillUnmount?', a: 'Return a cleanup function from useEffect(..., []). React calls it when the component unmounts (and before re-running the effect).', level: 'Medium' },
    { q: 'Why can\'t the useEffect callback be async?', a: 'An async function returns a Promise, but React expects the effect to return either nothing or a cleanup function. Define an async function inside the effect and call it.', level: 'Medium' },
    { q: 'Why does my effect run twice in development?', a: 'React StrictMode intentionally mounts, unmounts and remounts components in development to reveal missing cleanup. It does not happen in production builds.', level: 'Medium' },
    { q: 'Does fetch throw on 404 or 500?', a: 'No. fetch only rejects on network errors (server down, CORS block, DNS). For HTTP errors check response.ok or response.status and throw yourself. axios (Day 105) does reject on non-2xx.', level: 'Medium' },
    { q: 'What causes an infinite loop with useEffect?', a: 'Setting state inside an effect that has no dependency array, or that depends on a value the effect itself changes (or on an object/array recreated every render).', level: 'Hard' },
    { q: 'What is a race condition in data fetching and how do you prevent it?', a: 'An older request finishing after a newer one and overwriting the newer data. Prevent it with AbortController in the cleanup (or an ignore flag) so stale responses are discarded.', level: 'Hard' },
    { q: 'Where do you fix a "blocked by CORS policy" error when React calls the .NET API?', a: 'On the API: register a CORS policy that allows the React origin (http://localhost:5173) with AddCors and apply app.UseCors before authorization and MapControllers. Or use a Vite dev proxy in development.', level: 'Medium' },
    { q: 'How does the API know the browser cancelled a request?', a: 'When the client aborts, ASP.NET Core signals HttpContext.RequestAborted, which is bound to a CancellationToken action parameter; pass it to ToListAsync(ct) to stop the database query.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Set document.title to "Students (n)" whenever the student count changes.',
      hint: 'Dependency array [students.length].',
      solution: `useEffect(() => {
  document.title = "Students (" + students.length + ")";
}, [students.length]);`,
    },
    {
      task: 'Fetch GET /api/students/{id} for a given id prop and show the student; refetch when id changes.',
      hint: 'Put id in the dependency array; handle 404.',
      solution: `function StudentDetails({ id }) {
  const [student, setStudent] = useState(null);
  const [error, setError] = useState("");
  useEffect(() => {
    const c = new AbortController();
    setError(""); setStudent(null);
    fetch(import.meta.env.VITE_API_URL + "/students/" + id, { signal: c.signal })
      .then(r => { if (r.status === 404) throw new Error("Student not found"); return r.json(); })
      .then(setStudent)
      .catch(e => { if (e.name !== "AbortError") setError(e.message); });
    return () => c.abort();
  }, [id]);
  if (error) return <p>{error}</p>;
  if (!student) return <p>Loading...</p>;
  return <h3>{student.fullName}</h3>;
}`,
    },
    {
      task: 'Save the selected theme ("light"/"dark") to localStorage every time it changes and read it on first load.',
      hint: 'Lazy initial state: useState(() => localStorage.getItem("theme") ?? "light").',
      solution: `const [theme, setTheme] = useState(() => localStorage.getItem("theme") ?? "light");
useEffect(() => { localStorage.setItem("theme", theme); }, [theme]);`,
    },
    {
      task: 'Load the employee list from GET /api/employees with loading/error/empty states.',
      hint: 'Same pattern as StudentTable; three conditional returns.',
      solution: `function Employees() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    fetch(import.meta.env.VITE_API_URL + "/employees")
      .then(r => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then(setList)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (!list.length) return <p>No employees.</p>;
  return <ul>{list.map(e => <li key={e.id}>{e.name}</li>)}</ul>;
}`,
    },
  ],
  quiz: [
    { question: 'useEffect(fn, []) runs...', options: ['On every render', 'Once after the first render', 'Never', 'Before the first render'], answer: 1, explanation: 'An empty dependency array means run once after mount.' },
    { question: 'The function returned from an effect is called...', options: ['A reducer', 'A selector', 'A callback ref', 'The cleanup function'], answer: 3, explanation: 'It runs before the effect re-runs and on unmount.' },
    { question: 'What does fetch do when the API returns 500?', options: ['Resolves; response.ok is false', 'Rejects with an error', 'Retries automatically', 'Returns null'], answer: 0, explanation: 'fetch resolves for any HTTP response; check response.ok.' },
    { question: 'Which object cancels an in-flight fetch?', options: ['CancellationToken', 'Promise.race', 'AbortController', 'clearTimeout'], answer: 2, explanation: 'Pass controller.signal to fetch and call controller.abort().' },
    { question: 'In development each effect runs twice because of...', options: ['Vite HMR', 'React StrictMode', 'A bug in React', 'CORS preflight'], answer: 1, explanation: 'StrictMode remounts components once in development to check cleanup.' },
  ],
};
