export default {
  id: 'day-102-react-forms-validation',
  title: 'React Forms, Controlled Components and Form Validation',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 102,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Build forms the React way with controlled components, handle every input type (text, number, select, radio, checkbox, textarea) with one change handler, validate on the client, and show the validation errors returned by the ASP.NET Core Web API (400 ValidationProblemDetails) in a student registration form.',
  objectives: [
    'Explain controlled vs uncontrolled components and when to use each',
    'Manage a whole form with one state object and one generic onChange handler',
    'Write client-side validation (required, length, email, range, password match) and show field errors',
    'Submit the form to POST /api/students and map the API\'s 400 validation errors back to the fields',
    'Improve UX with touched fields, disabled submit button and a success message',
  ],
  theory: [
    {
      heading: 'Controlled components',
      content:
        'In plain HTML the browser keeps the value of an `<input>`. In React we usually let **state** own the value: the input shows `value={state}` and every keystroke calls `onChange`, which updates the state. React state becomes the **single source of truth**. This is called a **controlled component**.\n\nBecause the value lives in state you can validate on every keystroke, transform input (upper-case, trim), disable the submit button, reset the form with one `setState`, and send exactly that object to the API.',
      syntax: `const [name, setName] = useState("");

<input value={name} onChange={e => setName(e.target.value)} />`,
      points: [
        'value without onChange = read-only field (React prints a warning)',
        'For checkboxes use checked={...} and e.target.checked, not value',
        'Every input value from the DOM is a string: convert numbers with Number(e.target.value)',
      ],
    },
    {
      heading: 'Uncontrolled components and useRef',
      content:
        'An **uncontrolled** input keeps its own value in the DOM; you read it only when needed through a **ref** (`useRef`). It needs less code and fewer re-renders, which suits very simple forms or `<input type="file">` (a file input is always uncontrolled because its value is read-only).\n\nRule of thumb for this course: **controlled** for normal forms (we need validation), **ref** for file uploads and focusing a field.',
      syntax: `const fileRef = useRef(null);
<input type="file" ref={fileRef} />
// later
const file = fileRef.current.files[0];`,
    },
    {
      heading: 'One state object and one handler for the whole form',
      content:
        'Real forms have many fields. Instead of ten `useState` calls keep one object and one generic handler that uses the input\'s **name** attribute. The computed property `[name]: value` updates the right field and the spread `...prev` keeps the others.',
      syntax: `const [form, setForm] = useState({ fullName: "", email: "", course: "C#", gender: "", agree: false });

function handleChange(e) {
  const { name, value, type, checked } = e.target;
  setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
}

<input name="fullName" value={form.fullName} onChange={handleChange} />
<select name="course" value={form.course} onChange={handleChange}>...</select>
<input type="radio" name="gender" value="F" checked={form.gender === "F"} onChange={handleChange} />
<input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} />`,
      tip: 'In React, <textarea> and <select> also use value (not inner text / selected attribute).',
    },
    {
      heading: 'Form submission and client-side validation',
      content:
        'Handle `onSubmit` on the `<form>` (not onClick on the button) so Enter also submits, and call `e.preventDefault()` to stop the full page reload.\n\nWrite a pure `validate(form)` function that returns an **errors object** like `{ email: "Email is invalid" }`. If the object is empty the form is valid. Show each error under its field. Track **touched** fields (set on `onBlur`) so errors do not appear before the user has typed anything.',
      syntax: `function validate(f) {
  const errors = {};
  if (!f.fullName.trim()) errors.fullName = "Name is required";
  else if (f.fullName.length < 3) errors.fullName = "Minimum 3 characters";
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(f.email)) errors.email = "Email is invalid";
  if (f.password !== f.confirm) errors.confirm = "Passwords do not match";
  return errors;
}`,
      points: [
        'Client validation = fast feedback for the user (UX)',
        'Server validation (Data Annotations, Day 92) = real security; never trust the browser',
        'Keep the rules the same on both sides: [Required], [StringLength(100, MinimumLength = 3)], [EmailAddress], [Range(0,100)]',
      ],
    },
    {
      heading: 'Showing the API\'s validation errors (400 Bad Request)',
      content:
        'With `[ApiController]`, ASP.NET Core automatically returns **400** with a **ValidationProblemDetails** body when the model is invalid. Its `errors` property is a dictionary: property name → array of messages. The keys are PascalCase (`FullName`) while our form uses camelCase (`fullName`), so convert the first letter before merging into the errors state.',
      syntax: `// 400 response body from the .NET API
{
  "type": "https://tools.ietf.org/html/rfc9110#section-15.5.1",
  "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": {
    "Email": ["The Email field is not a valid e-mail address."],
    "Marks": ["The field Marks must be between 0 and 100."]
  }
}`,
      tip: 'Also handle 409 Conflict (e.g. "Email already registered") that your controller returns from business rules.',
    },
  ],
  examples: [
    {
      title: 'Controlled inputs: name, course, gender, agree',
      scenario: 'Understand controlled inputs of every type with one state object and live preview of the state.',
      steps: [
        'Open the React project from Day 98 (npm run dev)',
        'Create src/components/BasicForm.jsx with the code below',
        'Render <BasicForm /> inside App.jsx',
        'Type in each field and watch the JSON preview update on every keystroke',
      ],
      code: `// src/components/BasicForm.jsx
import { useState } from "react";

export default function BasicForm() {
  const [form, setForm] = useState({ fullName: "", course: "C#", gender: "", agree: false, about: "" });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  return (
    <form>
      <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full name" />
      <select name="course" value={form.course} onChange={handleChange}>
        <option>C#</option><option>React</option><option>SQL Server</option>
      </select>
      <label><input type="radio" name="gender" value="M" checked={form.gender === "M"} onChange={handleChange} /> Male</label>
      <label><input type="radio" name="gender" value="F" checked={form.gender === "F"} onChange={handleChange} /> Female</label>
      <textarea name="about" value={form.about} onChange={handleChange} />
      <label><input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} /> I agree</label>
      <pre>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

function App() {
  const [form, setForm] = useState({ fullName: "", course: "C#", gender: "", agree: false, about: "" });

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  }

  const row = { display: "block", margin: "8px 0" };
  return (
    <form style={{ fontFamily: "Segoe UI, sans-serif", padding: 16, maxWidth: 420 }} onSubmit={e => e.preventDefault()}>
      <h3>Controlled inputs</h3>
      <input style={row} name="fullName" value={form.fullName} onChange={handleChange} placeholder="Full name" />
      <select style={row} name="course" value={form.course} onChange={handleChange}>
        <option>C#</option><option>React</option><option>SQL Server</option>
      </select>
      <div style={row}>
        <label><input type="radio" name="gender" value="M" checked={form.gender === "M"} onChange={handleChange} /> Male</label>{" "}
        <label><input type="radio" name="gender" value="F" checked={form.gender === "F"} onChange={handleChange} /> Female</label>
      </div>
      <textarea style={row} name="about" value={form.about} onChange={handleChange} placeholder="About you" />
      <label style={row}><input type="checkbox" name="agree" checked={form.agree} onChange={handleChange} /> I agree to the terms</label>
      <pre style={{ background: "#f4f4f4", padding: 8 }}>{JSON.stringify(form, null, 2)}</pre>
    </form>
  );
}`,
      },
      result: 'A form with a name box, course dropdown (C#), Male/Female radios, a textarea and an "I agree" checkbox. Below it a JSON preview that starts as {"fullName": "", "course": "C#", "gender": "", "agree": false, "about": ""} and changes on every keystroke/click.',
      explanation:
        'Each input reads its value from form and writes back through handleChange. The name attribute tells the handler which property to update. Checkboxes use checked; radios compare their own value with the state to decide which one is checked.',
    },
    {
      title: 'Student registration form with client-side validation',
      scenario: 'The day\'s practical: a registration form that validates name, email, marks, password and confirm password, shows errors only for touched fields and disables Submit while invalid.',
      steps: [
        'Create src/components/RegisterForm.jsx',
        'Write the validate() function first and test it in your head with empty values',
        'Add onBlur to mark fields as touched',
        'Run npm run dev and try submitting an empty form, then a valid one',
      ],
      code: `// src/components/RegisterForm.jsx
import { useState } from "react";

const initial = { fullName: "", email: "", course: "", marks: "", password: "", confirm: "" };

export function validate(f) {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Full name is required";
  else if (f.fullName.trim().length < 3) e.fullName = "Minimum 3 characters";
  if (!f.email) e.email = "Email is required";
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  if (!f.course) e.course = "Select a course";
  if (f.marks === "") e.marks = "Marks are required";
  else if (Number(f.marks) < 0 || Number(f.marks) > 100) e.marks = "Marks must be 0 to 100";
  if (f.password.length < 8) e.password = "Password needs 8+ characters";
  else if (!/[A-Z]/.test(f.password) || !/[0-9]/.test(f.password)) e.password = "Use an uppercase letter and a digit";
  if (f.confirm !== f.password) e.confirm = "Passwords do not match";
  return e;
}

export default function RegisterForm({ onRegister }) {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const errors = validate(form);                       // derived, not stored
  const isValid = Object.keys(errors).length === 0;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = e => setTouched({ ...touched, [e.target.name]: true });

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, course: true, marks: true, password: true, confirm: true });
    if (!isValid) return;
    onRegister({ ...form, marks: Number(form.marks) });
    setForm(initial);
    setTouched({});
  }

  const show = name => touched[name] && errors[name] && <small className="text-danger">{errors[name]}</small>;

  return (
    <form onSubmit={handleSubmit} noValidate>
      <input name="fullName" value={form.fullName} onChange={handleChange} onBlur={handleBlur} />{show("fullName")}
      <input name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} />{show("email")}
      {/* course select, marks number, password, confirm ... same pattern */}
      <button disabled={!isValid}>Register</button>
    </form>
  );
}`,
      playground: {
        jsx: `const { useState } = React;

const initial = { fullName: "", email: "", course: "", marks: "", password: "", confirm: "" };

function validate(f) {
  const e = {};
  if (!f.fullName.trim()) e.fullName = "Full name is required";
  else if (f.fullName.trim().length < 3) e.fullName = "Minimum 3 characters";
  if (!f.email) e.email = "Email is required";
  else if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(f.email)) e.email = "Enter a valid email";
  if (!f.course) e.course = "Select a course";
  if (f.marks === "") e.marks = "Marks are required";
  else if (Number(f.marks) < 0 || Number(f.marks) > 100) e.marks = "Marks must be 0 to 100";
  if (f.password.length < 8) e.password = "Password needs 8+ characters";
  else if (!/[A-Z]/.test(f.password) || !/[0-9]/.test(f.password)) e.password = "Use an uppercase letter and a digit";
  if (f.confirm !== f.password) e.confirm = "Passwords do not match";
  return e;
}

function Field({ label, name, error, children }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <label style={{ display: "block", fontWeight: 600 }}>{label}</label>
      {children}
      {error && <div style={{ color: "crimson", fontSize: 13 }}>{error}</div>}
    </div>
  );
}

function App() {
  const [form, setForm] = useState(initial);
  const [touched, setTouched] = useState({});
  const [saved, setSaved] = useState([]);
  const errors = validate(form);
  const isValid = Object.keys(errors).length === 0;

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleBlur = e => setTouched({ ...touched, [e.target.name]: true });
  const err = name => (touched[name] ? errors[name] : undefined);

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ fullName: true, email: true, course: true, marks: true, password: true, confirm: true });
    if (!isValid) return;
    setSaved([...saved, { id: saved.length + 1, fullName: form.fullName, email: form.email, course: form.course, marks: Number(form.marks) }]);
    setForm(initial);
    setTouched({});
  }

  const input = { width: "100%", padding: 6, boxSizing: "border-box" };
  return (
    <div style={{ fontFamily: "Segoe UI, sans-serif", padding: 16, maxWidth: 420 }}>
      <h3>Student Registration</h3>
      <form onSubmit={handleSubmit} noValidate>
        <Field label="Full name" error={err("fullName")}>
          <input style={input} name="fullName" value={form.fullName} onChange={handleChange} onBlur={handleBlur} />
        </Field>
        <Field label="Email" error={err("email")}>
          <input style={input} name="email" type="email" value={form.email} onChange={handleChange} onBlur={handleBlur} />
        </Field>
        <Field label="Course" error={err("course")}>
          <select style={input} name="course" value={form.course} onChange={handleChange} onBlur={handleBlur}>
            <option value="">-- select --</option><option>C#</option><option>React</option><option>SQL Server</option>
          </select>
        </Field>
        <Field label="Marks (0-100)" error={err("marks")}>
          <input style={input} name="marks" type="number" value={form.marks} onChange={handleChange} onBlur={handleBlur} />
        </Field>
        <Field label="Password" error={err("password")}>
          <input style={input} name="password" type="password" value={form.password} onChange={handleChange} onBlur={handleBlur} />
        </Field>
        <Field label="Confirm password" error={err("confirm")}>
          <input style={input} name="confirm" type="password" value={form.confirm} onChange={handleChange} onBlur={handleBlur} />
        </Field>
        <button type="submit" style={{ padding: "6px 16px" }}>Register</button>
        <span style={{ marginLeft: 8, color: isValid ? "green" : "gray" }}>{isValid ? "Form is valid" : Object.keys(errors).length + " problem(s)"}</span>
      </form>
      <h4>Registered ({saved.length})</h4>
      <ul>{saved.map(s => <li key={s.id}>{s.fullName} ({s.email}) - {s.course}: {s.marks}</li>)}</ul>
    </div>
  );
}`,
      },
      result: 'Clicking Register on the empty form shows red messages under every field: "Full name is required", "Email is required", "Select a course", "Marks are required", "Password needs 8+ characters". After filling Asha Patil / asha@test.com / C# / 87 / Secret123 / Secret123 the status shows "Form is valid", Register adds "Asha Patil (asha@test.com) - C#: 87" to the list and clears the form.',
      explanation:
        'errors is derived from form on every render, so it is never out of date. touched decides whether to display an error, so a fresh form is not red. On submit we mark all fields touched so every error appears. noValidate turns off the browser\'s own popups so our messages are used consistently.',
    },
    {
      title: 'Submit to POST /api/students and show server validation errors',
      scenario: 'The .NET API validates with Data Annotations and returns 400 ValidationProblemDetails or 409 when the email exists. Show those messages under the fields.',
      steps: [
        'Open the Student API from Module 8; check the DTO has [Required], [EmailAddress] and [Range(0,100)]',
        'Make sure CORS allows http://localhost:5173',
        'In React, write handleSubmit as an async function that calls fetch with method POST',
        'Test with an email that already exists to see the 409 message',
      ],
      code: `// ===== API: Dtos/CreateStudentDto.cs =====
using System.ComponentModel.DataAnnotations;

public class CreateStudentDto
{
    [Required, StringLength(100, MinimumLength = 3)]
    public string FullName { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Required]
    public string Course { get; set; } = "";

    [Range(0, 100)]
    public int Marks { get; set; }
}

// ===== API: Controllers/StudentsController.cs (POST) =====
[HttpPost]
public async Task<ActionResult<StudentResponseDto>> Create(CreateStudentDto dto)
{
    // [ApiController] already returned 400 if Data Annotations failed
    if (await _db.Students.AnyAsync(s => s.Email == dto.Email))
        return Conflict(new { message = "Email already registered" });

    var s = new Student { FullName = dto.FullName, Email = dto.Email, Course = dto.Course, Marks = dto.Marks };
    _db.Students.Add(s);
    await _db.SaveChangesAsync();
    return CreatedAtAction(nameof(GetById), new { id = s.Id },
        new StudentResponseDto(s.Id, s.FullName, s.Email, s.Course, s.Marks));
}

// ===== React: handleSubmit in RegisterForm.jsx =====
const API = import.meta.env.VITE_API_URL;

const toCamel = key => key.charAt(0).toLowerCase() + key.slice(1);

async function handleSubmit(e) {
  e.preventDefault();
  if (Object.keys(validate(form)).length) return;
  setSubmitting(true);
  setServerErrors({});
  try {
    const res = await fetch(API + "/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: form.fullName, email: form.email, course: form.course, marks: Number(form.marks) }),
    });
    if (res.status === 400) {
      const problem = await res.json();              // ValidationProblemDetails
      const mapped = {};
      for (const [key, messages] of Object.entries(problem.errors)) mapped[toCamel(key)] = messages[0];
      setServerErrors(mapped);
      return;
    }
    if (res.status === 409) {
      const body = await res.json();
      setServerErrors({ email: body.message });
      return;
    }
    if (!res.ok) throw new Error("HTTP " + res.status);
    const created = await res.json();
    setMessage("Registered with id " + created.id);
    setForm(initial);
  } catch (err) {
    setMessage("Network error: " + err.message);
  } finally {
    setSubmitting(false);
  }
}`,
      playground: {
        jsx: `const { useState } = React;

// ---- Fake .NET API: POST /api/students ----
const db = [{ id: 1, fullName: "Asha Patil", email: "asha@test.com", course: "C#", marks: 87 }];
function fakePostStudent(dto) {
  return new Promise(resolve => {
    setTimeout(() => {
      const errors = {};
      if (!dto.fullName || dto.fullName.length < 3) errors.FullName = ["The field FullName must be a string with a minimum length of 3 and a maximum length of 100."];
      if (!/^[^@]+@[^@]+$/.test(dto.email)) errors.Email = ["The Email field is not a valid e-mail address."];
      if (dto.marks < 0 || dto.marks > 100) errors.Marks = ["The field Marks must be between 0 and 100."];
      if (Object.keys(errors).length) return resolve({ status: 400, body: { title: "One or more validation errors occurred.", status: 400, errors } });
      if (db.some(s => s.email === dto.email)) return resolve({ status: 409, body: { message: "Email already registered" } });
      const created = { id: db.length + 1, ...dto };
      db.push(created);
      resolve({ status: 201, body: created });
    }, 700);
  });
}

const toCamel = k => k.charAt(0).toLowerCase() + k.slice(1);
const initial = { fullName: "", email: "", course: "C#", marks: "" };

function App() {
  const [form, setForm] = useState(initial);
  const [serverErrors, setServerErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true); setServerErrors({}); setMessage("");
    const res = await fakePostStudent({ ...form, marks: Number(form.marks) });
    if (res.status === 400) {
      const mapped = {};
      for (const [key, msgs] of Object.entries(res.body.errors)) mapped[toCamel(key)] = msgs[0];
      setServerErrors(mapped);
    } else if (res.status === 409) {
      setServerErrors({ email: res.body.message });
    } else {
      setMessage("201 Created: student id " + res.body.id);
      setForm(initial);
    }
    setSubmitting(false);
  }

  const box = { display: "block", width: "100%", padding: 6, boxSizing: "border-box" };
  const err = n => serverErrors[n] && <div style={{ color: "crimson", fontSize: 13 }}>{serverErrors[n]}</div>;
  return (
    <form onSubmit={handleSubmit} noValidate style={{ fontFamily: "Segoe UI, sans-serif", padding: 16, maxWidth: 420 }}>
      <h3>Register (server-side validation demo)</h3>
      <p style={{ fontSize: 13, color: "#555" }}>No client validation here on purpose. Try: name "Al", email "abc", marks 150 - or email asha@test.com (already exists).</p>
      <label>Full name</label><input style={box} name="fullName" value={form.fullName} onChange={handleChange} />{err("fullName")}
      <label>Email</label><input style={box} name="email" value={form.email} onChange={handleChange} />{err("email")}
      <label>Course</label>
      <select style={box} name="course" value={form.course} onChange={handleChange}><option>C#</option><option>React</option></select>
      <label>Marks</label><input style={box} name="marks" type="number" value={form.marks} onChange={handleChange} />{err("marks")}
      <button disabled={submitting} style={{ marginTop: 10 }}>{submitting ? "Saving..." : "Register"}</button>
      {message && <p style={{ color: "green" }}>{message}</p>}
    </form>
  );
}`,
      },
      result: 'Submitting name "Al", email "abc", marks 150 shows "Saving..." for 0.7 s, then three red messages under the fields copied from the 400 response. Submitting a valid student with email asha@test.com shows "Email already registered" (409). A valid new student shows "201 Created: student id 2" and clears the form.',
      explanation:
        'ValidationProblemDetails.errors is keyed by PascalCase property names; toCamel maps them to form field names so the same error display works for client and server errors. The button is disabled while submitting to prevent double POSTs.',
    },
    {
      title: 'File input with useRef (uncontrolled) for a profile photo',
      scenario: 'Upload a student photo to the Day 97 file upload endpoint POST /api/students/{id}/photo using FormData.',
      steps: [
        'Make sure the API has the upload action from Day 97 (IFormFile)',
        'Create src/components/PhotoUpload.jsx',
        'Use useRef for the file input and FormData to send it',
        'Do NOT set the Content-Type header manually: the browser adds the multipart boundary',
      ],
      code: `// API (Day 97)
[HttpPost("{id:int}/photo")]
public async Task<IActionResult> UploadPhoto(int id, IFormFile file)
{
    if (file.Length == 0 || file.Length > 2 * 1024 * 1024) return BadRequest("File must be 1 byte to 2 MB");
    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();
    if (ext is not (".jpg" or ".png")) return BadRequest("Only .jpg or .png");
    var path = Path.Combine("wwwroot", "photos", id + ext);
    await using var stream = System.IO.File.Create(path);
    await file.CopyToAsync(stream);
    return Ok(new { url = "/photos/" + id + ext });
}

// React: src/components/PhotoUpload.jsx
import { useRef, useState } from "react";

export default function PhotoUpload({ studentId }) {
  const fileRef = useRef(null);
  const [status, setStatus] = useState("");

  async function upload(e) {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) return setStatus("Choose a file first");
    const data = new FormData();
    data.append("file", file);                 // name must match the IFormFile parameter
    const res = await fetch(import.meta.env.VITE_API_URL + "/students/" + studentId + "/photo", { method: "POST", body: data });
    setStatus(res.ok ? "Uploaded" : "Failed: " + (await res.text()));
  }

  return (
    <form onSubmit={upload}>
      <input type="file" accept=".jpg,.png" ref={fileRef} />
      <button>Upload</button> <span>{status}</span>
    </form>
  );
}`,
      playground: {
        jsx: `const { useRef, useState } = React;

// Fake POST /api/students/1/photo
function fakeUpload(file) {
  return new Promise(resolve => setTimeout(() => {
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
    if (file.size > 2 * 1024 * 1024) resolve({ ok: false, text: "File must be 1 byte to 2 MB" });
    else if (ext !== ".jpg" && ext !== ".png") resolve({ ok: false, text: "Only .jpg or .png" });
    else resolve({ ok: true, text: "/photos/1" + ext });
  }, 600));
}

function App() {
  const fileRef = useRef(null);
  const nameRef = useRef(null);
  const [status, setStatus] = useState("");

  async function upload(e) {
    e.preventDefault();
    const file = fileRef.current.files[0];
    if (!file) { setStatus("Choose a file first"); return; }
    setStatus("Uploading " + file.name + " (" + Math.round(file.size / 1024) + " KB)...");
    const res = await fakeUpload(file);
    setStatus(res.ok ? "Uploaded: " + res.text : "400 Bad Request: " + res.text);
  }

  return (
    <form onSubmit={upload} style={{ fontFamily: "Segoe UI, sans-serif", padding: 16 }}>
      <h3>Student photo</h3>
      <input ref={nameRef} placeholder="Click Focus to focus me" style={{ display: "block", marginBottom: 8 }} />
      <button type="button" onClick={() => nameRef.current.focus()}>Focus name box</button>
      <div style={{ margin: "12px 0" }}><input type="file" ref={fileRef} /></div>
      <button>Upload</button>
      <p>{status}</p>
    </form>
  );
}`,
      },
      result: 'Clicking Upload without a file shows "Choose a file first". Choosing a .png shows "Uploading photo.png (n KB)..." then "Uploaded: /photos/1.png". A .pdf shows "400 Bad Request: Only .jpg or .png". The Focus button moves the cursor into the name box.',
      explanation:
        'fileRef.current is the real DOM element, so files[0] gives the chosen File. React never stores the file in state. useRef is also how you focus an input programmatically.',
    },
  ],
  interview: [
    { q: 'What is a controlled component?', a: 'A form element whose value is driven by React state (value/checked prop) and updated through onChange. React state is the single source of truth.', level: 'Easy' },
    { q: 'What is an uncontrolled component?', a: 'An input that keeps its value in the DOM; React reads it with a ref (useRef) when needed. Used for file inputs and very simple forms.', level: 'Easy' },
    { q: 'Why call e.preventDefault() in onSubmit?', a: 'A form submit normally reloads the page (GET/POST to the action URL). In a SPA we stop that and handle the data with JavaScript.', level: 'Easy' },
    { q: 'How do you handle many fields with one change handler?', a: 'Give each input a name, keep one state object and use setForm(prev => ({ ...prev, [e.target.name]: value })), using checked for checkboxes.', level: 'Medium' },
    { q: 'What warning do you get if you set value without onChange?', a: '"You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field." Use defaultValue for uncontrolled or add onChange.', level: 'Medium' },
    { q: 'Why is client-side validation not enough?', a: 'Anyone can bypass the browser (Postman, curl, devtools). The ASP.NET Core API must validate again with Data Annotations / FluentValidation; client validation is only for user experience.', level: 'Easy' },
    { q: 'What does the API return when Data Annotations fail with [ApiController]?', a: 'An automatic 400 Bad Request with a ValidationProblemDetails JSON body whose errors property maps property names to arrays of messages.', level: 'Medium' },
    { q: 'Should you store validation errors in state?', a: 'Client errors can be derived from form state on every render (no extra state, never stale). Server errors must be stored in state because they come from an async response.', level: 'Hard' },
    { q: 'Why is the value of a number input a string?', a: 'DOM input values are always strings. Convert with Number() or parseInt before sending to the API, otherwise a C# int property may fail to bind.', level: 'Medium' },
    { q: 'How do you prevent double submission?', a: 'Keep a submitting flag in state, set it before the request, disable the button while true and reset it in finally.', level: 'Medium' },
    { q: 'Which libraries help with large forms?', a: 'React Hook Form (uncontrolled + refs, fast) and Formik, usually combined with schema validators like Zod or Yup.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Build a controlled Employee form (name, department select, salary, isActive checkbox) and print the object on submit.',
      hint: 'One state object; checkbox uses checked; convert salary with Number().',
      solution: `function EmployeeForm() {
  const [f, setF] = useState({ name: "", department: "IT", salary: "", isActive: true });
  const change = e => {
    const { name, value, type, checked } = e.target;
    setF(p => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };
  const submit = e => { e.preventDefault(); console.log({ ...f, salary: Number(f.salary) }); };
  return (
    <form onSubmit={submit}>
      <input name="name" value={f.name} onChange={change} />
      <select name="department" value={f.department} onChange={change}><option>IT</option><option>HR</option></select>
      <input name="salary" type="number" value={f.salary} onChange={change} />
      <input name="isActive" type="checkbox" checked={f.isActive} onChange={change} />
      <button>Save</button>
    </form>
  );
}`,
    },
    {
      task: 'Write validate() for a login form: username required (min 4), password required (min 6).',
      hint: 'Return an object; empty object means valid.',
      solution: `function validate({ username, password }) {
  const e = {};
  if (!username) e.username = "Username is required";
  else if (username.length < 4) e.username = "Minimum 4 characters";
  if (!password) e.password = "Password is required";
  else if (password.length < 6) e.password = "Minimum 6 characters";
  return e;
}`,
    },
    {
      task: 'Add a live character counter (max 200) under a textarea and turn it red when over the limit.',
      hint: 'Derived value: 200 - text.length.',
      solution: `const [text, setText] = useState("");
const left = 200 - text.length;
<>
  <textarea value={text} onChange={e => setText(e.target.value)} />
  <small style={{ color: left < 0 ? "red" : "gray" }}>{left} characters left</small>
</>`,
    },
    {
      task: 'Write a helper that converts a ValidationProblemDetails body into { field: firstMessage } with camelCase keys.',
      hint: 'Object.entries over problem.errors.',
      solution: `function mapProblem(problem) {
  const out = {};
  for (const [k, msgs] of Object.entries(problem.errors ?? {}))
    out[k.charAt(0).toLowerCase() + k.slice(1)] = msgs[0];
  return out;
}`,
    },
    {
      task: 'Add a Reset button that clears the form, touched fields and server errors.',
      hint: 'type="button" so it does not submit.',
      solution: `<button type="button" onClick={() => { setForm(initial); setTouched({}); setServerErrors({}); }}>Reset</button>`,
    },
  ],
  quiz: [
    { question: 'In a controlled input, where does the displayed value come from?', options: ['The DOM', 'React state via the value prop', 'localStorage', 'The API'], answer: 1, explanation: 'value={state} makes React the single source of truth.' },
    { question: 'Which property do you read for a checkbox in onChange?', options: ['e.target.value', 'e.target.selected', 'e.target.checked', 'e.target.on'], answer: 2, explanation: 'Checkboxes and radios expose checked (boolean).' },
    { question: 'Which input type is always uncontrolled in React?', options: ['type="file"', 'type="email"', 'type="number"', 'textarea'], answer: 0, explanation: 'A file input value is read-only, so use a ref.' },
    { question: 'With [ApiController], invalid Data Annotations produce...', options: ['500 Internal Server Error', '404 Not Found', '200 with an error flag', '400 with ValidationProblemDetails'], answer: 3, explanation: 'Automatic model validation returns 400 and an errors dictionary.' },
    { question: 'What does setForm(p => ({ ...p, [name]: value })) do?', options: ['Replaces the whole form with one field', 'Copies the old fields and updates only the named one', 'Deletes the field', 'Mutates the old object'], answer: 1, explanation: 'Spread keeps other fields; the computed key updates one field immutably.' },
  ],
};
