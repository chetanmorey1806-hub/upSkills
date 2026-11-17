export default {
  id: 'day-105-axios-connect-dotnet-api',
  title: 'Axios: GET, POST, PUT, PATCH, DELETE with the .NET Web API',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 105,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Replace raw fetch with axios to talk to the ASP.NET Core Web API: create a configured axios instance with baseURL and timeout, call GET, POST, PUT, PATCH and DELETE, handle errors with error.response.status, add request/response interceptors, and keep all API calls in a service layer (studentService.js).',
  objectives: [
    'Install axios and create a reusable instance with baseURL, headers and timeout',
    'Call every HTTP verb (GET, POST, PUT, PATCH, DELETE) against the Module 8 Employee/Student API',
    'Handle errors: 400 validation, 404, 409, 500, network/CORS errors and timeouts',
    'Use interceptors for logging, adding headers and global error handling',
    'Organise API calls in a service module and call them from components',
  ],
  theory: [
    {
      heading: 'Why axios instead of fetch?',
      content:
        '`fetch` is built into the browser but low-level. **axios** is a small HTTP library (npm install axios) that many React + .NET teams use because it removes boilerplate:',
      points: [
        'Automatic JSON: sends objects as JSON and parses the response into response.data',
        'Rejects on non-2xx status codes (fetch only rejects on network errors)',
        'Instances with baseURL, default headers and timeout',
        'Interceptors to add the JWT header or handle 401 globally (Day 107)',
        'Request cancellation with AbortController signal, upload/download progress',
      ],
      syntax: `npm install axios

// fetch
const res = await fetch(API + "/students");
if (!res.ok) throw new Error(res.status);
const students = await res.json();

// axios
const { data: students } = await axios.get(API + "/students");`,
    },
    {
      heading: 'Creating an axios instance (src/api/axiosClient.js)',
      content:
        'Create **one** configured client and import it everywhere. Keep the API address in a Vite environment variable (`.env.development`: `VITE_API_URL=https://localhost:7045/api`) so the production build can point elsewhere.',
      syntax: `import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,   // https://localhost:7045/api
  timeout: 10000,                          // ms; throws ECONNABORTED
  headers: { "Content-Type": "application/json" },
});

export default api;`,
      tip: 'The response object has data, status, statusText, headers and config. Most code only needs response.data.',
    },
    {
      heading: 'The five HTTP verbs with axios',
      content:
        'Map each axios method to the controller actions built on Days 88-89. The second argument of post/put/patch is the request body (a JS object, serialised to JSON; ASP.NET Core binds it to the DTO, camelCase to PascalCase is case-insensitive). Query strings go in `params`.',
      syntax: `api.get("/employees", { params: { search: "an", page: 1, pageSize: 5 } }); // GET ?search=an&page=1&pageSize=5
api.get("/employees/5");                       // GET by id      -> 200 | 404
api.post("/employees", { name, department, salary });  // create -> 201 Created
api.put("/employees/5", { id: 5, name, department, salary }); // replace -> 204
api.patch("/employees/5", [{ op: "replace", path: "/salary", value: 65000 }]); // JSON Patch -> 204
api.delete("/employees/5");                    // delete         -> 204 | 404`,
      points: [
        'PUT sends the whole object; PATCH sends only changes',
        'Day 89 PATCH used JsonPatchDocument (Content-Type application/json-patch+json) - pass that header in the third argument',
        '204 No Content means response.data is empty (""), so do not read fields from it',
      ],
    },
    {
      heading: 'Error handling with axios',
      content:
        'Because axios rejects for 4xx/5xx, put calls in try/catch. The error object tells you what went wrong:\n\n- `error.response` exists → the server answered with an error status: read `error.response.status` and `error.response.data` (ValidationProblemDetails for 400, ProblemDetails for 404/500 from the Day 96 global handler)\n- `error.request` exists but no response → network error, API not running, CORS blocked, or certificate error\n- `error.code === "ECONNABORTED"` → timeout\n- `axios.isCancel(error)` / `error.name === "CanceledError"` → request aborted',
      syntax: `try {
  await api.post("/employees", form);
} catch (err) {
  if (err.response?.status === 400) setErrors(err.response.data.errors);
  else if (err.response?.status === 409) setMessage(err.response.data.message);
  else if (err.response) setMessage("Server error " + err.response.status);
  else setMessage("Cannot reach the API. Is it running? CORS?");
}`,
    },
    {
      heading: 'Interceptors and the service layer',
      content:
        '**Interceptors** run for every request or response of an instance, just like ASP.NET Core middleware (Day 73) runs for every HTTP request on the server. Request interceptors add headers (JWT on Day 107), log, or show a global spinner. Response interceptors unwrap data, convert errors to friendly messages, or redirect to /login on 401.\n\nA **service module** (`employeeService.js`) wraps the endpoints in named functions. Components call `employeeService.getAll()` and never know URLs. This mirrors the Service/Repository layering on the API side (Day 91).',
      syntax: `api.interceptors.request.use(config => {
  console.log(config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (!error.response) error.friendlyMessage = "Network error: API unreachable";
    return Promise.reject(error);
  }
);`,
    },
  ],
  examples: [
    {
      title: 'axios client + employeeService for the Module 8 Employee API',
      scenario: 'Set up the axios client and a service that covers every Employee API endpoint (Day 87-89).',
      steps: [
        'In the React project run: npm install axios',
        'Create .env.development with VITE_API_URL=https://localhost:7045/api (use your API port from launchSettings.json)',
        'Create src/api/axiosClient.js and src/services/employeeService.js',
        'Confirm CORS for http://localhost:5173 in the API Program.cs and run the API (F5)',
        'Restart npm run dev after changing .env files',
      ],
      code: `// ===== API side (for reference): Controllers/EmployeesController.cs =====
[ApiController]
[Route("api/[controller]")]
public class EmployeesController(IEmployeeService service) : ControllerBase
{
    [HttpGet]            public async Task<IActionResult> GetAll([FromQuery] string? search) => Ok(await service.GetAllAsync(search));
    [HttpGet("{id:int}")] public async Task<IActionResult> Get(int id) => await service.GetAsync(id) is { } e ? Ok(e) : NotFound();
    [HttpPost]           public async Task<IActionResult> Create(CreateEmployeeDto dto) { var e = await service.CreateAsync(dto); return CreatedAtAction(nameof(Get), new { id = e.Id }, e); }
    [HttpPut("{id:int}")] public async Task<IActionResult> Update(int id, UpdateEmployeeDto dto) => await service.UpdateAsync(id, dto) ? NoContent() : NotFound();
    [HttpPatch("{id:int}/salary")] public async Task<IActionResult> PatchSalary(int id, [FromBody] decimal salary) => await service.UpdateSalaryAsync(id, salary) ? NoContent() : NotFound();
    [HttpDelete("{id:int}")] public async Task<IActionResult> Delete(int id) => await service.DeleteAsync(id) ? NoContent() : NotFound();
}

// Program.cs CORS (Day 96)
builder.Services.AddCors(o => o.AddPolicy("ReactApp", p =>
    p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));
app.UseCors("ReactApp");

// ===== React: .env.development =====
VITE_API_URL=https://localhost:7045/api

// ===== React: src/api/axiosClient.js =====
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(config => {
  if (import.meta.env.DEV) console.log("->", config.method.toUpperCase(), config.url);
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.code === "ECONNABORTED") err.friendlyMessage = "The server took too long to respond";
    else if (!err.response) err.friendlyMessage = "Cannot reach the API (is it running? CORS?)";
    else if (err.response.status >= 500) err.friendlyMessage = "Server error, please try later";
    return Promise.reject(err);
  }
);

export default api;

// ===== React: src/services/employeeService.js =====
import api from "../api/axiosClient";

const employeeService = {
  getAll: search => api.get("/employees", { params: { search } }).then(r => r.data),
  get: id => api.get("/employees/" + id).then(r => r.data),
  create: dto => api.post("/employees", dto).then(r => r.data),          // 201 + body
  update: (id, dto) => api.put("/employees/" + id, { id, ...dto }),       // 204
  patchSalary: (id, salary) => api.patch("/employees/" + id + "/salary", salary), // 204
  remove: id => api.delete("/employees/" + id),                            // 204
};

export default employeeService;`,
      playground: {
        jsx: `// "miniAxios" imitates axios (instance, baseURL, interceptors, reject on non-2xx)
// and a fake in-memory Employee API, so the service code below is the same as real code.
const { useState } = React;

let employees = [
  { id: 1, name: "Anita Desai", department: "IT", salary: 60000 },
  { id: 2, name: "Rahul Verma", department: "HR", salary: 45000 },
];
function fakeServer(method, url, body) {
  const m = url.match(/^\\/employees(?:\\/(\\d+))?(\\/salary)?$/);
  if (!m) return { status: 404, data: { title: "Not Found" } };
  const id = m[1] ? Number(m[1]) : null;
  const found = employees.find(e => e.id === id);
  if (method === "get" && id === null) return { status: 200, data: employees };
  if (id !== null && !found) return { status: 404, data: { title: "Not Found", status: 404 } };
  if (method === "get") return { status: 200, data: found };
  if (method === "post") {
    if (!body.name) return { status: 400, data: { title: "One or more validation errors occurred.", errors: { Name: ["The Name field is required."] } } };
    const e = { id: Math.max(0, ...employees.map(x => x.id)) + 1, ...body };
    employees = [...employees, e];
    return { status: 201, data: e };
  }
  if (method === "put") { employees = employees.map(e => (e.id === id ? { ...body, id } : e)); return { status: 204, data: "" }; }
  if (method === "patch") { employees = employees.map(e => (e.id === id ? { ...e, salary: body } : e)); return { status: 204, data: "" }; }
  if (method === "delete") { employees = employees.filter(e => e.id !== id); return { status: 204, data: "" }; }
}

function createMiniAxios({ baseURL }) {
  const reqI = [], resI = [];
  const request = async (method, url, data) => {
    let config = { method, url, baseURL, data };
    for (const f of reqI) config = f(config);
    await new Promise(r => setTimeout(r, 250));
    const res = fakeServer(config.method, config.url, config.data);
    const response = { ...res, config };
    if (res.status >= 200 && res.status < 300) return response;
    let err = Object.assign(new Error("Request failed with status code " + res.status), { response });
    for (const h of resI) err = await h.onError(err).catch(e => e);
    throw err;
  };
  return {
    get: url => request("get", url),
    post: (url, d) => request("post", url, d),
    put: (url, d) => request("put", url, d),
    patch: (url, d) => request("patch", url, d),
    delete: url => request("delete", url),
    interceptors: {
      request: { use: f => reqI.push(f) },
      response: { use: (ok, onError) => resI.push({ ok, onError }) },
    },
  };
}

const log = [];
const api = createMiniAxios({ baseURL: "https://localhost:7045/api" });
api.interceptors.request.use(c => { log.push("-> " + c.method.toUpperCase() + " " + c.baseURL + c.url + (c.data !== undefined ? " " + JSON.stringify(c.data) : "")); return c; });
api.interceptors.response.use(r => r, err => { log.push("<- " + err.response.status + " " + JSON.stringify(err.response.data)); return Promise.reject(err); });

// ---- service layer: identical to src/services/employeeService.js ----
const employeeService = {
  getAll: () => api.get("/employees").then(r => r.data),
  get: id => api.get("/employees/" + id).then(r => r.data),
  create: dto => api.post("/employees", dto).then(r => r.data),
  update: (id, dto) => api.put("/employees/" + id, { id, ...dto }),
  patchSalary: (id, salary) => api.patch("/employees/" + id + "/salary", salary),
  remove: id => api.delete("/employees/" + id),
};

function App() {
  const [out, setOut] = useState("");
  const [lines, setLines] = useState([]);
  async function run(label, fn) {
    try {
      const r = await fn();
      setOut(label + " OK: " + JSON.stringify(r && r.status ? { status: r.status, data: r.data } : r));
    } catch (err) {
      setOut(label + " FAILED: " + err.message);
    }
    setLines([...log]);
  }
  const btn = { margin: 4 };
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <h3>Employee API with axios</h3>
      <button style={btn} onClick={() => run("GET all", employeeService.getAll)}>GET /employees</button>
      <button style={btn} onClick={() => run("GET 1", () => employeeService.get(1))}>GET /employees/1</button>
      <button style={btn} onClick={() => run("GET 99", () => employeeService.get(99))}>GET /employees/99</button>
      <button style={btn} onClick={() => run("POST", () => employeeService.create({ name: "Kiran Joshi", department: "Sales", salary: 50000 }))}>POST new</button>
      <button style={btn} onClick={() => run("POST invalid", () => employeeService.create({ name: "", department: "IT", salary: 1 }))}>POST invalid</button>
      <button style={btn} onClick={() => run("PUT 2", () => employeeService.update(2, { name: "Rahul Verma", department: "Finance", salary: 52000 }))}>PUT /employees/2</button>
      <button style={btn} onClick={() => run("PATCH 1", () => employeeService.patchSalary(1, 65000))}>PATCH salary 1</button>
      <button style={btn} onClick={() => run("DELETE 2", () => employeeService.remove(2))}>DELETE /employees/2</button>
      <pre style={{ background: "#f4f4f4", padding: 8, whiteSpace: "pre-wrap" }}>{out || "Click a button"}</pre>
      <h4>Interceptor log</h4>
      <pre style={{ background: "#222", color: "#7CFC00", padding: 8, whiteSpace: "pre-wrap", fontSize: 12 }}>{lines.join("\\n")}</pre>
    </div>
  );
}`,
      },
      result: 'GET /employees shows "GET all OK: [{"id":1,"name":"Anita Desai",...},{"id":2,"name":"Rahul Verma",...}]". GET /employees/99 shows "GET 99 FAILED: Request failed with status code 404". POST invalid fails with 400 and the log shows the ValidationProblemDetails errors. PUT/PATCH/DELETE show {"status":204,"data":""}. The green log lists every request, e.g. "-> PATCH https://localhost:7045/api/employees/1/salary 65000".',
      explanation:
        'The miniAxios object behaves like axios: methods return a promise of { data, status }, non-2xx statuses reject with error.response, and interceptors run for every call. Because the service only uses api.get/post/put/patch/delete, the same employeeService works unchanged with the real axios instance in your project.',
    },
    {
      title: 'Employee page: load, add, update salary and delete with error handling',
      scenario: 'A component that uses employeeService with loading state, per-action error messages and list refresh after each change.',
      steps: [
        'Create src/pages/Employees.jsx',
        'Load the list in useEffect with employeeService.getAll()',
        'Add handlers for create, patch salary and delete; reload the list after each',
        'Stop the API and click Reload to see the friendly network error',
      ],
      code: `// src/pages/Employees.jsx
import { useEffect, useState } from "react";
import employeeService from "../services/employeeService";

export default function Employees() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");

  async function load() {
    setLoading(true); setError("");
    try {
      setList(await employeeService.getAll());
    } catch (err) {
      setError(err.friendlyMessage ?? err.message);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    try {
      await employeeService.create({ name, department: "IT", salary: 40000 });
      setName("");
      await load();
    } catch (err) {
      if (err.response?.status === 400) setError(Object.values(err.response.data.errors).flat().join(", "));
      else setError(err.friendlyMessage ?? err.message);
    }
  }

  async function raise(emp) {
    await employeeService.patchSalary(emp.id, emp.salary + 5000);
    await load();
  }

  async function remove(id) {
    if (!window.confirm("Delete employee " + id + "?")) return;
    try {
      await employeeService.remove(id);
      setList(list.filter(e => e.id !== id));     // optimistic local update
    } catch (err) {
      setError(err.response?.status === 404 ? "Already deleted" : err.message);
    }
  }

  if (loading) return <div className="spinner-border" />;
  return (
    <>
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={add} className="d-flex gap-2 mb-3">
        <input className="form-control" value={name} onChange={e => setName(e.target.value)} placeholder="New employee name" />
        <button className="btn btn-primary">Add</button>
      </form>
      <table className="table">
        <tbody>
          {list.map(e => (
            <tr key={e.id}>
              <td>{e.name}</td><td>{e.department}</td><td>{e.salary}</td>
              <td>
                <button className="btn btn-sm btn-outline-success me-1" onClick={() => raise(e)}>+5000</button>
                <button className="btn btn-sm btn-outline-danger" onClick={() => remove(e.id)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}`,
      playground: {
        jsx: `const { useState, useEffect } = React;

// ---- fake axios-style service (rejects with err.response like axios) ----
let db = [
  { id: 1, name: "Anita Desai", department: "IT", salary: 60000 },
  { id: 2, name: "Rahul Verma", department: "HR", salary: 45000 },
];
let apiDown = false;
const wait = ms => new Promise(r => setTimeout(r, ms));
function httpError(status, data) { return Object.assign(new Error("Request failed with status code " + status), { response: { status, data } }); }
const networkError = () => Object.assign(new Error("Network Error"), { friendlyMessage: "Cannot reach the API (is it running? CORS?)" });

const employeeService = {
  async getAll() { await wait(400); if (apiDown) throw networkError(); return db.map(e => ({ ...e })); },
  async create(dto) {
    await wait(300); if (apiDown) throw networkError();
    if (!dto.name || dto.name.trim().length < 3) throw httpError(400, { errors: { Name: ["Name must be at least 3 characters."] } });
    const e = { id: Math.max(0, ...db.map(x => x.id)) + 1, ...dto }; db = [...db, e]; return e;
  },
  async patchSalary(id, salary) { await wait(300); db = db.map(e => (e.id === id ? { ...e, salary } : e)); return { status: 204 }; },
  async remove(id) {
    await wait(300);
    if (!db.some(e => e.id === id)) throw httpError(404, { title: "Not Found" });
    db = db.filter(e => e.id !== id); return { status: 204 };
  },
};

function App() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [down, setDown] = useState(false);

  async function load() {
    setLoading(true); setError("");
    try { setList(await employeeService.getAll()); }
    catch (err) { setError(err.friendlyMessage ?? err.message); }
    finally { setLoading(false); }
  }
  useEffect(() => { load(); }, []);

  async function add(e) {
    e.preventDefault();
    try { await employeeService.create({ name, department: "IT", salary: 40000 }); setName(""); await load(); }
    catch (err) {
      if (err.response?.status === 400) setError("400: " + Object.values(err.response.data.errors).flat().join(", "));
      else setError(err.friendlyMessage ?? err.message);
    }
  }
  async function raise(emp) { await employeeService.patchSalary(emp.id, emp.salary + 5000); await load(); }
  async function remove(id) {
    try { await employeeService.remove(id); setList(l => l.filter(e => e.id !== id)); }
    catch (err) { setError(err.response?.status === 404 ? "404: already deleted" : err.message); }
  }

  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16, maxWidth: 560 }}>
      <label><input type="checkbox" checked={down} onChange={e => { apiDown = e.target.checked; setDown(e.target.checked); }} /> Stop the API</label>{" "}
      <button onClick={load}>Reload</button>
      {error && <p style={{ background: "#f8d7da", color: "#842029", padding: 8 }}>{error}</p>}
      <form onSubmit={add} style={{ margin: "10px 0" }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="New employee name" /> <button>Add</button>
      </form>
      {loading ? <p>Loading employees...</p> : (
        <table border="1" cellPadding="6" style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead><tr><th>Name</th><th>Dept</th><th>Salary</th><th></th></tr></thead>
          <tbody>{list.map(e => (
            <tr key={e.id}><td>{e.name}</td><td>{e.department}</td><td>{e.salary}</td>
              <td><button onClick={() => raise(e)}>+5000</button> <button onClick={() => remove(e.id)}>Delete</button></td></tr>
          ))}</tbody>
        </table>
      )}
    </div>
  );
}`,
      },
      result: '"Loading employees..." then a table with Anita Desai (IT, 60000) and Rahul Verma (HR, 45000). +5000 on Anita shows 65000. Adding "Al" shows "400: Name must be at least 3 characters."; adding "Kiran Joshi" adds a row with 40000. Ticking "Stop the API" and Reload shows "Cannot reach the API (is it running? CORS?)".',
      explanation:
        'Every action is wrapped in try/catch because axios rejects on 4xx/5xx. err.response separates server errors (status + body) from network errors (no response). After a change we either reload from the API (source of truth) or update local state directly for snappy UI.',
    },
    {
      title: 'Cancel an axios request and search with params',
      scenario: 'Search employees as the user types using params and AbortController so old requests are cancelled.',
      steps: [
        'Add getAll(search, signal) to employeeService',
        'In the component create an AbortController in useEffect and abort in cleanup',
        'Ignore CanceledError in catch',
        'Type fast and check the Network tab: cancelled requests show (canceled)',
      ],
      code: `// employeeService.js
getAll: (search, signal) => api.get("/employees", { params: { search }, signal }).then(r => r.data),

// EmployeeSearch.jsx
import axios from "axios";
useEffect(() => {
  const controller = new AbortController();
  employeeService.getAll(search, controller.signal)
    .then(setList)
    .catch(err => { if (!axios.isCancel(err)) setError(err.message); });
  return () => controller.abort();
}, [search]);`,
      playground: {
        jsx: `const { useState, useEffect } = React;
const NAMES = ["Anita Desai", "Rahul Verma", "Kiran Joshi", "Anil Kapoor", "Ritu Sharma", "Ankit Rao"];
let sent = 0, cancelled = 0;

// Fake api.get("/employees", { params: { search }, signal })
function getAll(search, signal) {
  sent++;
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => resolve(NAMES.filter(n => n.toLowerCase().includes(search.toLowerCase()))), 600);
    signal.addEventListener("abort", () => { clearTimeout(t); cancelled++; reject(Object.assign(new Error("canceled"), { name: "CanceledError" })); });
  });
}

function App() {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [stats, setStats] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    getAll(search, controller.signal)
      .then(data => { setList(data); setStats("Requests sent: " + sent + ", cancelled: " + cancelled); })
      .catch(err => { if (err.name !== "CanceledError") console.error(err); });
    return () => controller.abort();
  }, [search]);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Type quickly: anit" />
      <p style={{ fontSize: 13 }}>GET /api/employees?search={encodeURIComponent(search)}</p>
      <ul>{list.map(n => <li key={n}>{n}</li>)}</ul>
      <small>{stats}</small>
    </div>
  );
}`,
      },
      result: 'The list starts with all six names. Typing "anit" quickly shows only Anita Desai after 0.6 s, and the counter shows something like "Requests sent: 5, cancelled: 3" (exact numbers depend on typing speed; in development StrictMode adds one extra cancelled request).',
      explanation:
        'Each keystroke re-runs the effect; the cleanup aborts the previous request, so only the latest response updates the list. axios supports the same signal option as fetch and rejects with CanceledError, which we ignore.',
    },
  ],
  interview: [
    { q: 'What is axios?', a: 'A promise-based HTTP client for the browser and Node.js with automatic JSON handling, instances, interceptors, timeouts and cancellation.', level: 'Easy' },
    { q: 'Name three differences between axios and fetch.', a: 'axios parses JSON automatically into response.data, rejects on non-2xx statuses, and supports instances/interceptors/timeout out of the box. fetch needs res.json(), manual res.ok checks and AbortController for timeouts.', level: 'Easy' },
    { q: 'What is axios.create used for?', a: 'To create a configured instance with baseURL, default headers and timeout that the whole app reuses.', level: 'Easy' },
    { q: 'How do you send query string parameters?', a: 'Use the params option: api.get("/employees", { params: { search: "an", page: 1 } }) produces ?search=an&page=1.', level: 'Easy' },
    { q: 'How do you tell a server error from a network error?', a: 'If error.response exists the server replied with an error status (read status/data). If only error.request exists, no response arrived: API down, CORS, DNS or certificate issue.', level: 'Medium' },
    { q: 'What is an interceptor?', a: 'A function registered on an axios instance that runs before every request or after every response, used for auth headers, logging, global error handling or token refresh.', level: 'Medium' },
    { q: 'PUT vs PATCH from React to ASP.NET Core?', a: 'PUT sends the full resource and the action replaces it (UpdateDto). PATCH sends a partial change, e.g. a JsonPatchDocument or a small DTO; both usually return 204 No Content.', level: 'Medium' },
    { q: 'Why might a POST from React return 415 Unsupported Media Type?', a: 'The Content-Type header does not match what the action expects (e.g. form data sent to a [FromBody] JSON action or JSON Patch without application/json-patch+json).', level: 'Hard' },
    { q: 'Why put API calls in a service module?', a: 'Single place for URLs and HTTP details, components stay focused on UI, easier to change endpoints, add caching or mock in tests. Same idea as the service layer on the .NET side.', level: 'Medium' },
    { q: 'Where do you keep the API base URL?', a: 'In Vite env files (.env.development / .env.production) as VITE_API_URL, read with import.meta.env.VITE_API_URL. Only VITE_ prefixed variables are exposed to the client.', level: 'Medium' },
    { q: 'What is response.data after a 204 No Content?', a: 'An empty string; there is no body, so do not read properties from it.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create studentService.js with getAll, get, create, update, remove for /api/students.',
      hint: 'Same shape as employeeService.',
      solution: `import api from "../api/axiosClient";
export default {
  getAll: params => api.get("/students", { params }).then(r => r.data),
  get: id => api.get("/students/" + id).then(r => r.data),
  create: dto => api.post("/students", dto).then(r => r.data),
  update: (id, dto) => api.put("/students/" + id, { id, ...dto }),
  remove: id => api.delete("/students/" + id),
};`,
    },
    {
      task: 'Add a request interceptor that adds a header X-Client: react-portal to every request.',
      hint: 'Modify config.headers and return config.',
      solution: `api.interceptors.request.use(config => {
  config.headers["X-Client"] = "react-portal";
  return config;
});`,
    },
    {
      task: 'Send a JSON Patch to update only the department of employee 3.',
      hint: 'Third argument sets headers.',
      solution: `await api.patch("/employees/3",
  [{ op: "replace", path: "/department", value: "Finance" }],
  { headers: { "Content-Type": "application/json-patch+json" } });`,
    },
    {
      task: 'Write a helper getErrorMessage(err) that returns a user-friendly string for any axios error.',
      hint: 'Check response, status, data.errors, data.title.',
      solution: `export function getErrorMessage(err) {
  if (!err.response) return "Cannot reach the server";
  const { status, data } = err.response;
  if (status === 400 && data?.errors) return Object.values(data.errors).flat().join(" ");
  if (status === 404) return "Not found";
  if (status === 409) return data?.message ?? "Conflict";
  return data?.title ?? "Error " + status;
}`,
    },
  ],
  quiz: [
    { question: 'Where is the parsed JSON body in an axios response?', options: ['response.body', 'response.json()', 'response.data', 'response.result'], answer: 2, explanation: 'axios parses JSON into response.data.' },
    { question: 'What happens when the API returns 404 to axios?', options: ['The promise rejects with error.response.status 404', 'It resolves with ok = false', 'axios retries', 'Nothing'], answer: 0, explanation: 'axios rejects for status codes outside 2xx by default.' },
    { question: 'Which method sends a partial update?', options: ['api.put', 'api.post', 'api.get', 'api.patch'], answer: 3, explanation: 'PATCH = partial update.' },
    { question: 'Which variable name is visible in a Vite React app?', options: ['API_URL', 'VITE_API_URL', 'REACT_API_URL', 'NODE_API_URL'], answer: 1, explanation: 'Vite only exposes variables prefixed with VITE_.' },
    { question: 'A request interceptor is most like which ASP.NET Core concept?', options: ['DbContext', 'Middleware', 'Migration', 'Razor view'], answer: 1, explanation: 'Both run for every request in a pipeline.' },
  ],
};
