export default {
  id: 'day-109-react-dotnet-crud-integration',
  title: 'React CRUD Integration, Loading States, Error Handling and Deployment Build',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 109,
  level: 'Advanced',
  duration: '3.5 hours',
  summary:
    'Put Module 8 and Module 9 together: a complete Student Management CRUD app with an ASP.NET Core Web API + EF Core + SQL Server back end and a React + Vite + axios + React Router front end, including loading/saving/empty/error states, an error boundary, toast notifications, a custom useApi hook, environment-specific builds and deployment of the production build.',
  objectives: [
    'Assemble the full-stack architecture: React pages → service layer → axios → Web API → service → EF Core → SQL Server',
    'Implement list, search, create, edit and delete with clear loading, saving, empty and error states',
    'Handle errors at every level: validation (400), not found (404), conflict (409), server (500), network, and render errors with an Error Boundary',
    'Create production builds with npm run build and environment variables (.env.production)',
    'Deploy: React build inside the API wwwroot, or separately (IIS / Azure Static Web Apps / Netlify) with CORS',
  ],
  theory: [
    {
      heading: 'Full-stack architecture of the Student Management System',
      content:
        'Each layer has one job, and the same layering exists on both sides:',
      points: [
        'SQL Server: Students table (Id, FullName, Email UNIQUE, Course, Marks, CreatedAt)',
        'EF Core: AppDbContext + Student entity + migrations (Days 78-85)',
        'API: StudentsController → IStudentService → AppDbContext, DTOs, validation, ProblemDetails, CORS, JWT (Days 86-97)',
        'React: pages (StudentList, StudentForm) → hooks (useApi) → services (studentService) → axios instance with interceptors (Days 98-108)',
        'Contract between them: URLs, HTTP verbs, JSON DTOs and status codes (200, 201, 204, 400, 401, 403, 404, 409, 500)',
      ],
      syntax: `React (http://localhost:5173)                    ASP.NET Core API (https://localhost:7045)
StudentList.jsx -> studentService.getAll()  ->  GET    /api/students?search=&page=   -> 200 PagedResult
StudentForm.jsx -> studentService.create()  ->  POST   /api/students                 -> 201 | 400 | 409
StudentForm.jsx -> studentService.update()  ->  PUT    /api/students/{id}            -> 204 | 400 | 404
StudentList.jsx -> studentService.remove()  ->  DELETE /api/students/{id}            -> 204 | 404`,
    },
    {
      heading: 'UI states every data screen needs',
      content:
        'A professional CRUD screen is never just "the table". Plan these states:',
      points: [
        'Loading: first load (spinner/skeleton) - do not show "No students" while loading',
        'Empty: loaded successfully but zero rows ("No students yet. Add one.")',
        'Error: load failed - message + Retry button',
        'Saving / deleting: disable buttons, show spinner on the clicked button, prevent double submit',
        'Success feedback: toast "Student saved", then refresh or update local state',
        'Validation: field-level errors from the client and from the API (400 ValidationProblemDetails)',
      ],
      tip: 'Keep status in one variable ("idle" | "loading" | "success" | "error") instead of several booleans that can contradict each other.',
    },
    {
      heading: 'Error handling at every level',
      content:
        '**API side**: Data Annotations → automatic 400; business rules → 409 Conflict; missing → 404; unexpected exceptions → global handler returns 500 ProblemDetails without stack traces (Day 96).\n\n**React side**: service calls in try/catch with a shared `getErrorMessage(err)`; 401 handled globally in the axios interceptor (Day 107); render-time crashes caught by an **Error Boundary** so one broken component does not blank the whole app. Error boundaries must be class components (or use the react-error-boundary package); they do not catch errors in event handlers or async code, which is why we still need try/catch there.',
      syntax: `class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error(error, info.componentStack); }
  render() {
    if (this.state.error) return <div className="alert alert-danger">Something went wrong. <button onClick={() => this.setState({ error: null })}>Try again</button></div>;
    return this.props.children;
  }
}`,
    },
    {
      heading: 'A reusable useApi hook',
      content:
        'The load/loading/error pattern repeats on every page. A custom hook wraps it once. It returns `{ data, status, error, reload, setData }` and takes the async function plus dependencies. (Libraries such as TanStack Query do this with caching, retries and background refetch; good to learn after this course.)',
      syntax: `export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, status: "loading", error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let ignore = false;
    setState(s => ({ ...s, status: "loading", error: null }));
    fn().then(data => !ignore && setState({ data, status: "success", error: null }))
        .catch(err => !ignore && setState({ data: null, status: "error", error: getErrorMessage(err) }));
    return () => { ignore = true; };
  }, [...deps, tick]);
  return { ...state, reload: () => setTick(t => t + 1), setData: d => setState(s => ({ ...s, data: typeof d === "function" ? d(s.data) : d })) };
}`,
    },
    {
      heading: 'Production build and deployment',
      content:
        '`npm run build` runs Vite to create an optimised **dist/** folder (minified JS/CSS with hashed file names, index.html). `npm run preview` serves it locally to test. Environment variables are baked in **at build time** from `.env.production`.\n\nTwo deployment options:',
      points: [
        'Option A - one site: copy dist/* into the API wwwroot, add UseDefaultFiles/UseStaticFiles/MapFallbackToFile("index.html"), set VITE_API_URL=/api. Same origin, no CORS. Publish the API (dotnet publish -c Release) to IIS or Azure App Service (Day 117)',
        'Option B - two sites: React on Azure Static Web Apps / Netlify / IIS site, API on Azure App Service. Set VITE_API_URL to the API URL and add the React domain to the API CORS policy; configure SPA fallback to index.html on the static host',
        'Never put secrets in VITE_ variables: they end up in the public JS bundle',
        'Production API: connection string from environment/Key Vault, HTTPS, Swagger disabled or protected, logging enabled',
      ],
      syntax: `# React
npm run build          # -> dist/
npm run preview        # test the build at http://localhost:4173

# API
dotnet publish -c Release -o ./publish`,
    },
  ],
  examples: [
    {
      title: 'Back end: Students API ready for the React client',
      scenario: 'The final shape of the API that the React CRUD app consumes: DTOs, service, controller with search/paging, validation, 409 on duplicate email, global error handling and CORS.',
      steps: [
        'Open the StudentApi solution from Module 8 in Visual Studio',
        'Check the files below (Models, Dtos, Services, Controllers, Program.cs, appsettings.json)',
        'Package Manager Console: Add-Migration FinalStudents then Update-Database',
        'Press F5 and test all five endpoints in Swagger before starting React',
      ],
      code: `// ===== Models/Student.cs =====
public class Student
{
    public int Id { get; set; }
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public string Course { get; set; } = "";
    public int Marks { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ===== Data/AppDbContext.cs =====
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<Student>().HasIndex(s => s.Email).IsUnique();
        b.Entity<Student>().Property(s => s.FullName).HasMaxLength(100).IsRequired();
    }
}

// ===== Dtos/StudentDtos.cs =====
public record StudentResponseDto(int Id, string FullName, string Email, string Course, int Marks);
public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);
public class StudentRequestDto
{
    [Required, StringLength(100, MinimumLength = 3)] public string FullName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Course { get; set; } = "";
    [Range(0, 100)] public int Marks { get; set; }
}

// ===== Services/StudentService.cs =====
public interface IStudentService
{
    Task<PagedResult<StudentResponseDto>> GetAllAsync(string? search, int page, int pageSize, CancellationToken ct);
    Task<StudentResponseDto?> GetAsync(int id);
    Task<StudentResponseDto> CreateAsync(StudentRequestDto dto);
    Task<bool> UpdateAsync(int id, StudentRequestDto dto);
    Task<bool> DeleteAsync(int id);
    Task<bool> EmailExistsAsync(string email, int? exceptId = null);
}

public class StudentService(AppDbContext db) : IStudentService
{
    static StudentResponseDto Map(Student s) => new(s.Id, s.FullName, s.Email, s.Course, s.Marks);

    public async Task<PagedResult<StudentResponseDto>> GetAllAsync(string? search, int page, int pageSize, CancellationToken ct)
    {
        var q = db.Students.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(search))
            q = q.Where(s => s.FullName.Contains(search) || s.Email.Contains(search) || s.Course.Contains(search));
        var total = await q.CountAsync(ct);
        var items = await q.OrderByDescending(s => s.Id).Skip((page - 1) * pageSize).Take(pageSize)
                           .Select(s => new StudentResponseDto(s.Id, s.FullName, s.Email, s.Course, s.Marks)).ToListAsync(ct);
        return new PagedResult<StudentResponseDto>(items, total, page, pageSize);
    }
    public async Task<StudentResponseDto?> GetAsync(int id) =>
        await db.Students.FindAsync(id) is { } s ? Map(s) : null;
    public async Task<StudentResponseDto> CreateAsync(StudentRequestDto dto)
    {
        var s = new Student { FullName = dto.FullName.Trim(), Email = dto.Email.Trim(), Course = dto.Course, Marks = dto.Marks };
        db.Students.Add(s);
        await db.SaveChangesAsync();
        return Map(s);
    }
    public async Task<bool> UpdateAsync(int id, StudentRequestDto dto)
    {
        var s = await db.Students.FindAsync(id);
        if (s is null) return false;
        s.FullName = dto.FullName.Trim(); s.Email = dto.Email.Trim(); s.Course = dto.Course; s.Marks = dto.Marks;
        await db.SaveChangesAsync();
        return true;
    }
    public async Task<bool> DeleteAsync(int id) =>
        await db.Students.Where(s => s.Id == id).ExecuteDeleteAsync() > 0;
    public Task<bool> EmailExistsAsync(string email, int? exceptId = null) =>
        db.Students.AnyAsync(s => s.Email == email && s.Id != exceptId);
}

// ===== Controllers/StudentsController.cs =====
[ApiController]
[Route("api/[controller]")]
public class StudentsController(IStudentService service) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<PagedResult<StudentResponseDto>>> GetAll(
        [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 5, CancellationToken ct = default)
        => await service.GetAllAsync(search, Math.Max(1, page), Math.Clamp(pageSize, 1, 50), ct);

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentResponseDto>> Get(int id)
        => await service.GetAsync(id) is { } s ? s : NotFound();

    [HttpPost]
    public async Task<ActionResult<StudentResponseDto>> Create(StudentRequestDto dto)
    {
        if (await service.EmailExistsAsync(dto.Email))
            return Conflict(new { message = "Email already registered" });
        var created = await service.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, StudentRequestDto dto)
    {
        if (await service.EmailExistsAsync(dto.Email, id))
            return Conflict(new { message = "Email already registered" });
        return await service.UpdateAsync(id, dto) ? NoContent() : NotFound();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
        => await service.DeleteAsync(id) ? NoContent() : NotFound();
}

// ===== Program.cs =====
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddProblemDetails();
builder.Services.AddDbContext<AppDbContext>(o => o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<IStudentService, StudentService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddCors(o => o.AddPolicy("ReactApp", p => p
    .WithOrigins(builder.Configuration.GetSection("Cors:Origins").Get<string[]>() ?? ["http://localhost:5173"])
    .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseExceptionHandler();            // 500 -> ProblemDetails, no stack trace
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseDefaultFiles();
app.UseStaticFiles();                 // serves the React build from wwwroot (Option A)
app.UseCors("ReactApp");
app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("index.html");
app.Run();

// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=.\\\\SQLEXPRESS;Database=StudentDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Cors": { "Origins": [ "http://localhost:5173" ] },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}

// Swagger test bodies
// POST /api/students  { "fullName": "Asha Patil", "email": "asha@test.com", "course": "C#", "marks": 87 }  -> 201
// POST again with the same email                                                                        -> 409 { "message": "Email already registered" }
// PUT  /api/students/1 { "fullName": "Asha Patil", "email": "asha@test.com", "course": "React", "marks": 90 } -> 204
// DELETE /api/students/1 -> 204, again -> 404`,
      playground: {
        jsx: `// Contract tester: shows which status code each request gets from the API rules above
const { useState } = React;

let db = [{ id: 1, fullName: "Asha Patil", email: "asha@test.com", course: "C#", marks: 87 }];
let nextId = 2;
function validate(d) {
  const e = {};
  if (!d.fullName || d.fullName.length < 3 || d.fullName.length > 100) e.FullName = ["The field FullName must be a string with a minimum length of 3 and a maximum length of 100."];
  if (!/^[^@\\s]+@[^@\\s]+$/.test(d.email || "")) e.Email = ["The Email field is not a valid e-mail address."];
  if (!d.course) e.Course = ["The Course field is required."];
  if (!(d.marks >= 0 && d.marks <= 100)) e.Marks = ["The field Marks must be between 0 and 100."];
  return e;
}
function api(method, id, body) {
  if (method === "GET") return id ? (db.find(s => s.id === id) ? [200, db.find(s => s.id === id)] : [404, { title: "Not Found", status: 404 }]) : [200, { items: db, totalCount: db.length, page: 1, pageSize: 5 }];
  if (method === "DELETE") { const n = db.length; db = db.filter(s => s.id !== id); return db.length < n ? [204, ""] : [404, { title: "Not Found", status: 404 }]; }
  const errors = validate(body);
  if (Object.keys(errors).length) return [400, { title: "One or more validation errors occurred.", status: 400, errors }];
  if (db.some(s => s.email === body.email && s.id !== id)) return [409, { message: "Email already registered" }];
  if (method === "POST") { const s = { id: nextId++, ...body }; db.push(s); return [201, s]; }
  if (!db.some(s => s.id === id)) return [404, { title: "Not Found", status: 404 }];
  db = db.map(s => (s.id === id ? { id, ...body } : s));
  return [204, ""];
}

function App() {
  const [method, setMethod] = useState("POST");
  const [id, setId] = useState("1");
  const [body, setBody] = useState('{ "fullName": "Ravi Kumar", "email": "ravi@test.com", "course": "React", "marks": 35 }');
  const [out, setOut] = useState(null);
  function send() {
    let parsed = null;
    if (method === "POST" || method === "PUT") {
      try { parsed = JSON.parse(body); } catch (e) { setOut([400, { title: "Invalid JSON: " + e.message }]); return; }
    }
    setOut(api(method, method === "POST" || (method === "GET" && id === "") ? null : Number(id), parsed));
  }
  const needsId = method !== "POST";
  const color = out && (out[0] < 300 ? "green" : out[0] < 500 ? "#b45309" : "crimson");
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <h3>Students API contract</h3>
      <select value={method} onChange={e => setMethod(e.target.value)}>{["GET", "POST", "PUT", "DELETE"].map(m => <option key={m}>{m}</option>)}</select>{" "}
      <code>/api/students{needsId && id ? "/" + id : ""}</code>{" "}
      {needsId && <input style={{ width: 50 }} value={id} onChange={e => setId(e.target.value)} placeholder="id" />}{" "}
      <button onClick={send}>Send</button>
      {(method === "POST" || method === "PUT") && <textarea style={{ display: "block", width: "100%", height: 60, marginTop: 8, fontFamily: "monospace" }} value={body} onChange={e => setBody(e.target.value)} />}
      {out && <div style={{ marginTop: 10 }}><b style={{ color }}>{out[0]}</b><pre style={{ background: "#f4f4f4", padding: 8, whiteSpace: "pre-wrap" }}>{out[1] === "" ? "(no content)" : JSON.stringify(out[1], null, 2)}</pre></div>}
    </div>
  );
}`,
      },
      result: 'Sending the default POST returns 201 with { "id": 2, "fullName": "Ravi Kumar", ... }. Sending it again returns 409 { "message": "Email already registered" }. Changing marks to 150 returns 400 with errors.Marks. GET with id 1 returns 200 Asha; DELETE 1 returns 204 "(no content)" and a second DELETE 1 returns 404. Clearing the id for GET returns the paged list.',
      explanation:
        'The playground reproduces the controller rules so you can learn the contract React must handle: 201 with the created body, 204 with no body, 400 with an errors dictionary keyed by PascalCase names, 404 and 409 with a message. The React app in the next example handles exactly these codes.',
    },
    {
      title: 'Front end: complete Student CRUD with loading, saving, empty and error states',
      scenario: 'The day\'s practical: the full React CRUD screen with search, paging, add/edit form, delete confirmation, toasts, server validation errors, retry on failure and an error boundary.',
      steps: [
        'Make sure the API from the previous example is running (F5) and CORS allows http://localhost:5173',
        'Create src/api/axiosClient.js, src/services/studentService.js, src/utils/getErrorMessage.js, src/hooks/useApi.js',
        'Create src/components/ErrorBoundary.jsx, Toast.jsx, and pages StudentList.jsx and StudentForm.jsx',
        'Wire the routes /students, /students/new, /students/:id/edit inside <ErrorBoundary>',
        'Test: add, edit, duplicate email (409), invalid marks (400), delete, stop the API (network error + Retry)',
      ],
      code: `// ===== src/utils/getErrorMessage.js =====
export function getErrorMessage(err) {
  if (!err.response) return "Cannot reach the server. Check that the API is running.";
  const { status, data } = err.response;
  if (status === 400 && data?.errors) return Object.values(data.errors).flat().join(" ");
  if (status === 404) return "Record not found (it may have been deleted).";
  if (status === 409) return data?.message ?? "Conflict";
  if (status >= 500) return "Server error. Please try again later.";
  return data?.title ?? "Request failed (" + status + ")";
}
export const fieldErrors = err =>
  Object.fromEntries(Object.entries(err.response?.data?.errors ?? {}).map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v[0]]));

// ===== src/services/studentService.js =====
import api from "../api/axiosClient";
export default {
  getAll: (params, signal) => api.get("/students", { params, signal }).then(r => r.data),
  get: id => api.get("/students/" + id).then(r => r.data),
  create: dto => api.post("/students", dto).then(r => r.data),
  update: (id, dto) => api.put("/students/" + id, dto),
  remove: id => api.delete("/students/" + id),
};

// ===== src/hooks/useApi.js =====
import { useEffect, useState } from "react";
import { getErrorMessage } from "../utils/getErrorMessage";
export function useApi(fn, deps = []) {
  const [state, setState] = useState({ data: null, status: "loading", error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    setState(s => ({ ...s, status: "loading", error: null }));
    fn(controller.signal)
      .then(data => setState({ data, status: "success", error: null }))
      .catch(err => { if (err.name !== "CanceledError") setState({ data: null, status: "error", error: getErrorMessage(err) }); });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, tick]);
  return { ...state, reload: () => setTick(t => t + 1) };
}

// ===== src/pages/StudentList.jsx =====
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import studentService from "../services/studentService";
import { useApi } from "../hooks/useApi";
import { getErrorMessage } from "../utils/getErrorMessage";

export default function StudentList() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(useLocation().state?.message ?? "");
  const { data, status, error, reload } = useApi(
    signal => studentService.getAll({ search, page, pageSize: 5 }, signal), [search, page]);

  async function remove(s) {
    if (!window.confirm("Delete " + s.fullName + "?")) return;
    setDeletingId(s.id);
    try {
      await studentService.remove(s.id);
      setToast("Deleted " + s.fullName);
      reload();
    } catch (err) {
      setToast(getErrorMessage(err));
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="container py-3">
      {toast && <div className="alert alert-info alert-dismissible">{toast}<button className="btn-close" onClick={() => setToast("")} /></div>}
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Search name, email or course" value={search}
               onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <Link to="/students/new" className="btn btn-primary text-nowrap">+ Add student</Link>
      </div>

      {status === "loading" && <div className="text-center p-4"><div className="spinner-border" /></div>}
      {status === "error" && (
        <div className="alert alert-danger d-flex justify-content-between">
          {error} <button className="btn btn-sm btn-outline-danger" onClick={reload}>Retry</button>
        </div>
      )}
      {status === "success" && data.items.length === 0 && <p className="text-muted">No students found.</p>}
      {status === "success" && data.items.length > 0 && (
        <>
          <div className="table-responsive">
            <table className="table table-hover align-middle">
              <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Marks</th><th /></tr></thead>
              <tbody>
                {data.items.map(s => (
                  <tr key={s.id}>
                    <td>{s.fullName}</td><td>{s.email}</td><td>{s.course}</td><td>{s.marks}</td>
                    <td className="text-end">
                      <Link to={"/students/" + s.id + "/edit"} className="btn btn-sm btn-outline-primary me-1">Edit</Link>
                      <button className="btn btn-sm btn-outline-danger" disabled={deletingId === s.id} onClick={() => remove(s)}>
                        {deletingId === s.id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pager page={page} total={data.totalCount} pageSize={5} onChange={setPage} />
        </>
      )}
    </div>
  );
}

function Pager({ page, total, pageSize, onChange }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <div className="d-flex align-items-center gap-2">
      <button className="btn btn-sm btn-secondary" disabled={page <= 1} onClick={() => onChange(page - 1)}>Prev</button>
      <span>Page {page} of {pages} ({total} students)</span>
      <button className="btn btn-sm btn-secondary" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </div>
  );
}

// ===== src/pages/StudentForm.jsx =====
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import studentService from "../services/studentService";
import { getErrorMessage, fieldErrors } from "../utils/getErrorMessage";

const empty = { fullName: "", email: "", course: "C#", marks: "" };

export default function StudentForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(isEdit ? "loading" : "idle");   // loading | idle | saving | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    studentService.get(id)
      .then(s => { setForm({ ...s, marks: String(s.marks) }); setStatus("idle"); })
      .catch(err => { setMessage(getErrorMessage(err)); setStatus("error"); });
  }, [id, isEdit]);

  const change = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function submit(e) {
    e.preventDefault();
    setStatus("saving"); setErrors({}); setMessage("");
    const dto = { fullName: form.fullName, email: form.email, course: form.course, marks: Number(form.marks) };
    try {
      if (isEdit) await studentService.update(id, dto); else await studentService.create(dto);
      navigate("/students", { state: { message: isEdit ? "Student updated" : "Student added" } });
    } catch (err) {
      if (err.response?.status === 400) setErrors(fieldErrors(err));
      else if (err.response?.status === 409) setErrors({ email: err.response.data.message });
      else setMessage(getErrorMessage(err));
      setStatus("idle");
    }
  }

  if (status === "loading") return <div className="spinner-border m-4" />;
  if (status === "error") return <div className="alert alert-danger m-4">{message}</div>;
  const invalid = n => "form-control" + (errors[n] ? " is-invalid" : "");
  return (
    <form onSubmit={submit} className="container py-3" style={{ maxWidth: 520 }} noValidate>
      <h3>{isEdit ? "Edit student" : "Add student"}</h3>
      {message && <div className="alert alert-danger">{message}</div>}
      <input name="fullName" className={invalid("fullName")} value={form.fullName} onChange={change} placeholder="Full name" />
      <div className="invalid-feedback d-block">{errors.fullName}</div>
      <input name="email" className={invalid("email")} value={form.email} onChange={change} placeholder="Email" />
      <div className="invalid-feedback d-block">{errors.email}</div>
      <select name="course" className="form-select mt-2" value={form.course} onChange={change}>
        <option>C#</option><option>React</option><option>SQL Server</option><option>ASP.NET Core</option>
      </select>
      <input name="marks" type="number" className={invalid("marks")} value={form.marks} onChange={change} placeholder="Marks" />
      <div className="invalid-feedback d-block">{errors.marks}</div>
      <button className="btn btn-success mt-3 me-2" disabled={status === "saving"}>
        {status === "saving" && <span className="spinner-border spinner-border-sm me-1" />}Save
      </button>
      <button type="button" className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Cancel</button>
    </form>
  );
}

// ===== src/App.jsx =====
<ErrorBoundary>
  <Routes>
    <Route path="/" element={<Navigate to="/students" replace />} />
    <Route path="/students" element={<StudentList />} />
    <Route path="/students/new" element={<StudentForm />} />
    <Route path="/students/:id/edit" element={<StudentForm />} />
    <Route path="*" element={<NotFound />} />
  </Routes>
</ErrorBoundary>`,
      playground: {
        css: `body{background:#f5f7fb}
.wrap{font-family:"Segoe UI",system-ui,sans-serif;max-width:760px;margin:auto}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
input,select{padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px}
.btn{border:0;border-radius:6px;padding:6px 12px;cursor:pointer;font-size:14px;color:#fff;background:#2563eb}
.btn:disabled{opacity:.55;cursor:not-allowed}
.btn.gray{background:#6b7280}.btn.red{background:#dc2626}.btn.green{background:#16a34a}.btn.outline{background:#fff;color:#2563eb;border:1px solid #2563eb}
.card{background:#fff;border-radius:10px;box-shadow:0 1px 3px rgba(0,0,0,.08);padding:14px;margin-bottom:12px}
table{width:100%;border-collapse:collapse;font-size:14px}th,td{padding:7px 8px;border-bottom:1px solid #eef0f4;text-align:left}
.err{color:#dc2626;font-size:12px;min-height:14px}
.alert{padding:8px 12px;border-radius:6px;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;gap:8px}
.alert.red{background:#fde2e2;color:#991b1b}.alert.blue{background:#dbeafe;color:#1e3a8a}
.spinner{width:28px;height:28px;border:4px solid #cbd5e1;border-top-color:#2563eb;border-radius:50%;animation:spin .8s linear infinite;margin:20px auto}
@keyframes spin{to{transform:rotate(360deg)}}
.toast{position:fixed;right:16px;bottom:16px;background:#111827;color:#fff;padding:10px 14px;border-radius:8px;box-shadow:0 6px 20px rgba(0,0,0,.25)}
.table-wrap{overflow-x:auto}`,
        jsx: `const { useState, useEffect } = React;

// ================= fake ASP.NET Core API (same rules as the controller) =================
let db = [
  { id: 1, fullName: "Asha Patil", email: "asha@test.com", course: "C#", marks: 87 },
  { id: 2, fullName: "Ravi Kumar", email: "ravi@test.com", course: "React", marks: 35 },
  { id: 3, fullName: "Meena Shah", email: "meena@test.com", course: "SQL Server", marks: 72 },
  { id: 4, fullName: "Aslam Khan", email: "aslam@test.com", course: "ASP.NET Core", marks: 64 },
  { id: 5, fullName: "John Dsouza", email: "john@test.com", course: "C#", marks: 91 },
  { id: 6, fullName: "Kavya Rao", email: "kavya@test.com", course: "React", marks: 58 },
];
let nextId = 7;
const server = { down: false, slow: false };
const wait = () => new Promise(r => setTimeout(r, server.slow ? 1800 : 450));
const httpError = (status, data) => Object.assign(new Error("Request failed with status code " + status), { response: { status, data } });
async function call(fn) {
  await wait();
  if (server.down) throw Object.assign(new Error("Network Error"), { code: "ERR_NETWORK" });
  return fn();
}
function check(dto, id) {
  const errors = {};
  if (dto.fullName.trim().length < 3) errors.FullName = ["The field FullName must be a string with a minimum length of 3 and a maximum length of 100."];
  if (!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(dto.email)) errors.Email = ["The Email field is not a valid e-mail address."];
  if (isNaN(dto.marks) || dto.marks < 0 || dto.marks > 100) errors.Marks = ["The field Marks must be between 0 and 100."];
  if (Object.keys(errors).length) throw httpError(400, { title: "One or more validation errors occurred.", status: 400, errors });
  if (db.some(s => s.email.toLowerCase() === dto.email.toLowerCase() && s.id !== id)) throw httpError(409, { message: "Email already registered" });
}
// ================= studentService (same shape as src/services/studentService.js) =================
const studentService = {
  getAll: ({ search, page, pageSize }) => call(() => {
    const q = search.toLowerCase();
    const f = db.filter(s => (s.fullName + " " + s.email + " " + s.course).toLowerCase().includes(q)).sort((a, b) => b.id - a.id);
    return { items: f.slice((page - 1) * pageSize, page * pageSize), totalCount: f.length, page, pageSize };
  }),
  get: id => call(() => { const s = db.find(x => x.id === id); if (!s) throw httpError(404, { title: "Not Found" }); return { ...s }; }),
  create: dto => call(() => { check(dto, null); const s = { id: nextId++, ...dto }; db = [...db, s]; return s; }),
  update: (id, dto) => call(() => { check(dto, id); if (!db.some(s => s.id === id)) throw httpError(404, {}); db = db.map(s => (s.id === id ? { id, ...dto } : s)); return { status: 204 }; }),
  remove: id => call(() => { if (!db.some(s => s.id === id)) throw httpError(404, {}); db = db.filter(s => s.id !== id); return { status: 204 }; }),
};

// ================= utils + hook (same as src/utils and src/hooks) =================
function getErrorMessage(err) {
  if (!err.response) return "Cannot reach the server. Check that the API is running.";
  const { status, data } = err.response;
  if (status === 400 && data.errors) return Object.values(data.errors).flat().join(" ");
  if (status === 404) return "Record not found (it may have been deleted).";
  if (status === 409) return data.message;
  if (status >= 500) return "Server error. Please try again later.";
  return "Request failed (" + status + ")";
}
const fieldErrors = err => Object.fromEntries(Object.entries((err.response && err.response.data.errors) || {}).map(([k, v]) => [k[0].toLowerCase() + k.slice(1), v[0]]));

function useApi(fn, deps) {
  const [state, setState] = useState({ data: null, status: "loading", error: null });
  const [tick, setTick] = useState(0);
  useEffect(() => {
    let ignore = false;
    setState(s => ({ ...s, status: "loading", error: null }));
    fn().then(data => !ignore && setState({ data, status: "success", error: null }))
        .catch(err => !ignore && setState({ data: null, status: "error", error: getErrorMessage(err) }));
    return () => { ignore = true; };
  }, [...deps, tick]);
  return { ...state, reload: () => setTick(t => t + 1) };
}

// ================= Error boundary =================
class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <div className="alert red">Something went wrong: {this.state.error.message} <button className="btn red" onClick={() => this.setState({ error: null })}>Try again</button></div>;
    return this.props.children;
  }
}
function Bomb() { throw new Error("A component crashed while rendering"); }

// ================= pages =================
function StudentList({ go, flash }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const { data, status, error, reload } = useApi(() => studentService.getAll({ search, page, pageSize: 4 }), [search, page]);

  async function remove(s) {
    setConfirm(null); setDeletingId(s.id);
    try { await studentService.remove(s.id); flash("Deleted " + s.fullName + " (204)"); reload(); }
    catch (err) { flash(getErrorMessage(err)); }
    finally { setDeletingId(null); }
  }
  const pages = data ? Math.max(1, Math.ceil(data.totalCount / 4)) : 1;
  return (
    <div className="card">
      <div className="bar">
        <input style={{ flex: 1, minWidth: 160 }} placeholder="Search name, email or course" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        <button className="btn" onClick={() => go("new")}>+ Add student</button>
      </div>
      {status === "loading" && <div className="spinner" />}
      {status === "error" && <div className="alert red">{error}<button className="btn red" onClick={reload}>Retry</button></div>}
      {status === "success" && data.items.length === 0 && <p style={{ color: "#6b7280" }}>No students found.</p>}
      {status === "success" && data.items.length > 0 && (
        <>
          <div className="table-wrap"><table>
            <thead><tr><th>Name</th><th>Email</th><th>Course</th><th>Marks</th><th></th></tr></thead>
            <tbody>{data.items.map(s => (
              <tr key={s.id}>
                <td>{s.fullName}</td><td>{s.email}</td><td>{s.course}</td>
                <td style={{ color: s.marks < 40 ? "#dc2626" : "inherit" }}>{s.marks}</td>
                <td style={{ whiteSpace: "nowrap", textAlign: "right" }}>
                  {confirm === s.id ? (
                    <>Sure? <button className="btn red" onClick={() => remove(s)}>Yes</button> <button className="btn gray" onClick={() => setConfirm(null)}>No</button></>
                  ) : (
                    <>
                      <button className="btn outline" onClick={() => go("edit", s.id)}>Edit</button>{" "}
                      <button className="btn red" disabled={deletingId === s.id} onClick={() => setConfirm(s.id)}>{deletingId === s.id ? "Deleting..." : "Delete"}</button>
                    </>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table></div>
          <div className="bar" style={{ marginTop: 10, alignItems: "center" }}>
            <button className="btn gray" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} of {pages} ({data.totalCount} students)</span>
            <button className="btn gray" disabled={page >= pages} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

const empty = { fullName: "", email: "", course: "C#", marks: "" };
function StudentForm({ id, go, flash }) {
  const isEdit = id != null;
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(isEdit ? "loading" : "idle");
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!isEdit) return;
    studentService.get(id).then(s => { setForm({ ...s, marks: String(s.marks) }); setStatus("idle"); })
      .catch(err => { setMessage(getErrorMessage(err)); setStatus("error"); });
  }, [id]);
  const change = e => setForm({ ...form, [e.target.name]: e.target.value });
  async function submit(e) {
    e.preventDefault();
    setStatus("saving"); setErrors({}); setMessage("");
    const dto = { fullName: form.fullName, email: form.email, course: form.course, marks: form.marks === "" ? NaN : Number(form.marks) };
    try {
      if (isEdit) await studentService.update(id, dto); else await studentService.create(dto);
      flash(isEdit ? "Student updated (204 No Content)" : "Student added (201 Created)");
      go("list");
    } catch (err) {
      if (err.response && err.response.status === 400) setErrors(fieldErrors(err));
      else if (err.response && err.response.status === 409) setErrors({ email: err.response.data.message });
      else setMessage(getErrorMessage(err));
      setStatus("idle");
    }
  }
  if (status === "loading") return <div className="card"><div className="spinner" /></div>;
  if (status === "error") return <div className="card"><div className="alert red">{message}</div><button className="btn gray" onClick={() => go("list")}>Back</button></div>;
  const field = (name, label, type) => (
    <div style={{ marginBottom: 6 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>{label}</label>
      <input name={name} type={type || "text"} value={form[name]} onChange={change} style={{ width: "100%", boxSizing: "border-box", borderColor: errors[name] ? "#dc2626" : undefined }} />
      <div className="err">{errors[name]}</div>
    </div>
  );
  return (
    <form className="card" onSubmit={submit} noValidate style={{ maxWidth: 440 }}>
      <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit student #" + id : "Add student"}</h3>
      {message && <div className="alert red">{message}</div>}
      {field("fullName", "Full name")}
      {field("email", "Email")}
      <label style={{ display: "block", fontSize: 13, fontWeight: 600 }}>Course</label>
      <select name="course" value={form.course} onChange={change} style={{ width: "100%", marginBottom: 10 }}>
        <option>C#</option><option>React</option><option>SQL Server</option><option>ASP.NET Core</option>
      </select>
      {field("marks", "Marks (0-100)", "number")}
      <button className="btn green" disabled={status === "saving"}>{status === "saving" ? "Saving..." : "Save"}</button>{" "}
      <button type="button" className="btn gray" disabled={status === "saving"} onClick={() => go("list")}>Cancel</button>
    </form>
  );
}

// ================= App shell (React Router replaced by a simple view state) =================
function App() {
  const [view, setView] = useState({ page: "list", id: null });
  const [toast, setToast] = useState("");
  const [down, setDown] = useState(false);
  const [slow, setSlow] = useState(false);
  const [crash, setCrash] = useState(false);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2500); return () => clearTimeout(t); }, [toast]);
  const go = (page, id = null) => setView({ page, id });
  const url = view.page === "list" ? "/students" : view.page === "new" ? "/students/new" : "/students/" + view.id + "/edit";
  return (
    <div className="wrap">
      <h2 style={{ marginBottom: 4 }}>Student Management</h2>
      <code style={{ display: "block", marginBottom: 10, color: "#475569" }}>http://localhost:5173{url}</code>
      <div className="bar" style={{ fontSize: 13 }}>
        <label><input type="checkbox" checked={down} onChange={e => { server.down = e.target.checked; setDown(e.target.checked); }} /> API down</label>
        <label><input type="checkbox" checked={slow} onChange={e => { server.slow = e.target.checked; setSlow(e.target.checked); }} /> Slow network</label>
        <label><input type="checkbox" checked={crash} onChange={e => setCrash(e.target.checked)} /> Crash a component</label>
      </div>
      <ErrorBoundary key={crash ? "c" : "ok"}>
        {crash && <Bomb />}
        {view.page === "list" ? <StudentList go={go} flash={setToast} /> : <StudentForm key={url} id={view.id} go={go} flash={setToast} />}
      </ErrorBoundary>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}`,
      },
      result: 'A spinner, then a table of 4 students (newest first: Kavya Rao, John Dsouza, Aslam Khan, Meena Shah) with "Page 1 of 2 (6 students)". Ravi Kumar (35) on page 2 shows marks in red. "+ Add student" with an empty form shows field errors from the 400 response; using email asha@test.com shows "Email already registered" (409); a valid student closes the form, shows the toast "Student added (201 Created)" and appears first in the list. Edit loads the student, Save shows "Student updated (204 No Content)". Delete asks "Sure? Yes/No" and shows "Deleting..." then a toast. Ticking "API down" and searching shows "Cannot reach the server..." with Retry. "Slow network" makes spinners and "Saving..." visible longer. "Crash a component" shows the Error Boundary message instead of a blank page.',
      explanation:
        'Every API call goes through studentService, so the pages only deal with data and errors. useApi gives the list its loading/success/error status and a reload function used after delete and by Retry. The form maps 400 errors to fields (PascalCase to camelCase) and 409 to the email field, and uses a "saving" status to disable buttons. The Error Boundary catches render crashes only; async errors are handled with try/catch. In the real project the view state is replaced by React Router routes and useNavigate.',
    },
    {
      title: 'Production build and deployment',
      scenario: 'Build the React app for production and deploy it either inside the API (one site) or as a separate static site.',
      steps: [
        'Create .env.production in the React project',
        'Run npm run build, then npm run preview to test http://localhost:4173',
        'Option A: copy dist/* into StudentApi/wwwroot, then in Visual Studio right-click the API project > Publish (or dotnet publish -c Release)',
        'Option B: deploy dist/ to Azure Static Web Apps / Netlify / an IIS site, and add that domain to Cors:Origins in the API appsettings.Production.json',
        'Open the production URL, refresh on /students to test the SPA fallback, and check the browser console for errors',
      ],
      code: `# ===== React: .env.development =====
VITE_API_URL=https://localhost:7045/api

# ===== React: .env.production (Option A: same site as the API) =====
VITE_API_URL=/api
# Option B (separate sites):
# VITE_API_URL=https://studentapi-prod.azurewebsites.net/api

# ===== build =====
npm run build
#   vite v6.x building for production...
#   dist/index.html                   0.46 kB
#   dist/assets/index-BX3c9Kq1.css   24.10 kB | gzip:  4.80 kB
#   dist/assets/index-D8fLk2aQ.js   245.30 kB | gzip: 79.20 kB
#   built in 3.2s
npm run preview        # http://localhost:4173

# ===== Option A: copy into the API and publish (PowerShell) =====
Copy-Item -Recurse -Force .\\dist\\* ..\\StudentApi\\wwwroot\\
cd ..\\StudentApi
dotnet publish -c Release -o .\\publish
# deploy the publish folder to IIS (Day 117) or Azure App Service

# ===== Option B: SPA fallback files for static hosts =====
# Netlify: public/_redirects
/*   /index.html   200

# Azure Static Web Apps: staticwebapp.config.json
{ "navigationFallback": { "rewrite": "/index.html", "exclude": ["/assets/*"] } }

# IIS: web.config in the site root (URL Rewrite module)
<rewrite><rules>
  <rule name="SPA" stopProcessing="true">
    <match url=".*" />
    <conditions logicalGrouping="MatchAll">
      <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
      <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
    </conditions>
    <action type="Rewrite" url="/index.html" />
  </rule>
</rules></rewrite>

// ===== API: appsettings.Production.json (Option B) =====
{
  "Cors": { "Origins": [ "https://students.example.com" ] }
}
// Connection string in production: App Service > Configuration > Connection strings (not in source control)

// ===== package.json scripts (Vite) =====
"scripts": {
  "dev": "vite",
  "build": "vite build",
  "preview": "vite preview",
  "lint": "eslint ."
}`,
      playground: {
        jsx: `// Shows how VITE_ variables are baked into the bundle at build time and which URL the app calls
const { useState } = React;

const envFiles = {
  development: { VITE_API_URL: "https://localhost:7045/api" },
  "production (Option A: inside API)": { VITE_API_URL: "/api" },
  "production (Option B: separate sites)": { VITE_API_URL: "https://studentapi-prod.azurewebsites.net/api" },
};

function App() {
  const [mode, setMode] = useState("development");
  const env = envFiles[mode];
  const origin = mode.startsWith("development") ? "http://localhost:5173" : mode.includes("Option A") ? "https://students.example.com" : "https://students-web.example.com";
  const finalUrl = env.VITE_API_URL.startsWith("/") ? origin + env.VITE_API_URL + "/students" : env.VITE_API_URL + "/students";
  const sameOrigin = finalUrl.startsWith(origin);
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <label>Build mode: <select value={mode} onChange={e => setMode(e.target.value)}>{Object.keys(envFiles).map(m => <option key={m}>{m}</option>)}</select></label>
      <pre style={{ background: "#f4f4f4", padding: 8 }}>{"# ." + (mode.startsWith("development") ? "env.development" : "env.production") + "\\nVITE_API_URL=" + env.VITE_API_URL}</pre>
      <p>Bundle contains: <code>const API = "{env.VITE_API_URL}";</code></p>
      <p>React app served from: <code>{origin}</code></p>
      <p>GET request goes to: <code>{finalUrl}</code></p>
      <p style={{ color: sameOrigin ? "green" : "#b45309" }}>
        {sameOrigin ? "Same origin: no CORS policy needed." : "Different origin: the API must allow " + origin + " in its CORS policy."}
      </p>
    </div>
  );
}`,
      },
      result: 'Development: the request goes to https://localhost:7045/api/students and the page warns that CORS must allow http://localhost:5173. Option A: https://students.example.com/api/students with "Same origin: no CORS policy needed." Option B: https://studentapi-prod.azurewebsites.net/api/students with a CORS warning for https://students-web.example.com.',
      explanation:
        'import.meta.env.VITE_API_URL is replaced by its literal value when Vite builds, so changing .env.production requires a rebuild. A relative /api URL keeps the front end and API on one origin (simplest deployment). Separate origins need the API CORS policy and SPA fallback configuration on the static host.',
    },
  ],
  interview: [
    { q: 'Walk through what happens when the user clicks Save on the Add Student form.', a: 'onSubmit → preventDefault → status "saving" → studentService.create(dto) → axios POST /api/students with JSON → CORS check → model binding + Data Annotations → controller checks duplicate email → service saves with EF Core → 201 Created with body → React navigates to the list with a success message → list reloads via GET.', level: 'Medium' },
    { q: 'Which UI states should a data list handle?', a: 'Loading, success with data, empty (success with zero rows), error with retry, plus action states such as deleting/saving.', level: 'Easy' },
    { q: 'Why use a status string instead of several booleans?', a: 'isLoading/isError/hasData can contradict each other (loading and error both true). A single status ("loading" | "success" | "error") makes impossible states impossible.', level: 'Medium' },
    { q: 'What does an Error Boundary catch and not catch?', a: 'It catches errors during rendering, lifecycle methods and constructors of its children. It does not catch errors in event handlers, async code (promises, setTimeout), server rendering or in the boundary itself.', level: 'Hard' },
    { q: 'How do you show API validation errors under each field?', a: 'On 400 read err.response.data.errors (ValidationProblemDetails), convert the PascalCase keys to camelCase field names, take the first message and store them in an errors state object rendered under each input.', level: 'Medium' },
    { q: 'After a delete, should you reload the list or update local state?', a: 'Either. Reload keeps the UI exactly in sync with the server (paging counts, other users\' changes). Local filtering (optimistic) is faster; on failure roll back or reload.', level: 'Medium' },
    { q: 'What does npm run build produce?', a: 'An optimised dist/ folder: index.html plus minified, tree-shaken, content-hashed JS and CSS files in dist/assets, ready for any static host.', level: 'Easy' },
    { q: 'When are VITE_ environment variables resolved?', a: 'At build time. Vite replaces import.meta.env.VITE_* with literal values in the bundle, so they are public and changing them requires rebuilding.', level: 'Medium' },
    { q: 'Compare hosting React inside the API wwwroot vs separately.', a: 'Inside: one deployment, same origin (no CORS), MapFallbackToFile for routing, but front end and API deploy together. Separately: independent deployments and scaling, CDN for static files, but needs CORS and SPA fallback config on the static host.', level: 'Hard' },
    { q: 'Why does the API return 409 instead of 400 for a duplicate email?', a: '400 means the request is malformed/invalid by itself. 409 Conflict means it is valid but conflicts with the current state of the resource (an existing record).', level: 'Medium' },
    { q: 'How do you prevent a stale response from overwriting newer list data while searching?', a: 'Abort the previous request (AbortController / axios signal) or use an ignore flag in the effect cleanup, as useApi does.', level: 'Hard' },
    { q: 'What should never be put into the React build?', a: 'Secrets: database connection strings, JWT signing keys, API keys for paid services. Everything in the bundle is downloadable by users.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Add a "Course" filter dropdown next to the search box that is sent to the API as ?course=React.',
      hint: 'Add [FromQuery] string? course to the API and to the useApi dependencies.',
      solution: `// API
if (!string.IsNullOrWhiteSpace(course)) q = q.Where(s => s.Course == course);
// React
const [course, setCourse] = useState("");
const { data, status } = useApi(signal => studentService.getAll({ search, course, page, pageSize: 5 }, signal), [search, course, page]);
<select value={course} onChange={e => { setCourse(e.target.value); setPage(1); }}>
  <option value="">All courses</option><option>C#</option><option>React</option>
</select>`,
    },
    {
      task: 'Show a skeleton (grey placeholder rows) instead of a spinner while the list loads.',
      hint: 'Render 5 rows of fixed-width grey divs when status === "loading".',
      solution: `const Skeleton = () => (
  <table className="table">
    <tbody>{[1, 2, 3, 4, 5].map(i => (
      <tr key={i}>{[40, 30, 20, 10].map(w => (
        <td key={w}><div className="placeholder-glow"><span className={"placeholder col-" + Math.round(w / 10)} /></div></td>
      ))}</tr>
    ))}</tbody>
  </table>
);
{status === "loading" && <Skeleton />}`,
    },
    {
      task: 'Write a reusable Toast system with a ToastContext so any page can call showToast("Saved").',
      hint: 'Context with an array of toasts and setTimeout removal.',
      solution: `const ToastContext = createContext(null);
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const showToast = (text, type = "success") => {
    const id = Date.now() + Math.random();
    setToasts(t => [...t, { id, text, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  };
  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        {toasts.map(t => <div key={t.id} className={"toast show text-bg-" + t.type}><div className="toast-body">{t.text}</div></div>)}
      </div>
    </ToastContext.Provider>
  );
}
export const useToast = () => useContext(ToastContext);`,
    },
    {
      task: 'Add an ErrorBoundary around the routes and log the error to the console with the component stack.',
      hint: 'componentDidCatch(error, info).',
      solution: `export default class ErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  componentDidCatch(error, info) { console.error("UI crash:", error, info.componentStack); }
  render() {
    return this.state.error
      ? <div className="alert alert-danger m-3">Something went wrong. <button className="btn btn-link" onClick={() => location.reload()}>Reload</button></div>
      : this.props.children;
  }
}`,
    },
    {
      task: 'Deploy the app as one site: build React, copy into wwwroot, publish the API, and verify /students refresh works.',
      hint: 'VITE_API_URL=/api, MapFallbackToFile.',
      solution: `# .env.production
VITE_API_URL=/api
npm run build
Copy-Item -Recurse -Force .\\dist\\* ..\\StudentApi\\wwwroot\\
# Program.cs has UseDefaultFiles, UseStaticFiles, MapControllers, MapFallbackToFile("index.html")
dotnet publish ..\\StudentApi -c Release -o ..\\publish
# Run publish\\StudentApi.exe, open http://localhost:5000/students and press F5`,
    },
  ],
  quiz: [
    { question: 'The list loaded successfully with zero rows. Which state should the UI show?', options: ['Spinner', 'Error message', 'Empty state such as "No students found."', 'Nothing'], answer: 2, explanation: 'Empty is different from loading and error.' },
    { question: 'Which status code should the API return when the email already exists?', options: ['409 Conflict', '200 OK', '404 Not Found', '500 Internal Server Error'], answer: 0, explanation: 'The request conflicts with existing data.' },
    { question: 'An Error Boundary catches errors thrown...', options: ['In onClick handlers', 'In promises after await', 'In setTimeout callbacks', 'While rendering its child components'], answer: 3, explanation: 'Event handler and async errors need try/catch.' },
    { question: 'Which command creates the optimised production files in dist/?', options: ['npm run dev', 'npm run build', 'npm start', 'dotnet build'], answer: 1, explanation: 'vite build outputs to dist/.' },
    { question: 'You changed VITE_API_URL in .env.production after deploying. What must you do?', options: ['Nothing, it is read at runtime', 'Restart the browser', 'Rebuild and redeploy the React app', 'Restart SQL Server'], answer: 2, explanation: 'Vite bakes env values into the bundle at build time.' },
  ],
};
