export default {
  id: 'day-108-bootstrap-tailwind-responsive-dashboard',
  title: 'Bootstrap / Tailwind CSS, Responsive Design, React Icons and Reusable Components',
  module: 'Module 9: React.js Frontend with .NET Web API',
  day: 108,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Style the React front end professionally: add Bootstrap 5 (or Tailwind CSS v4) to the Vite project, build a responsive admin dashboard with a collapsible sidebar, grid of stat cards and a responsive table, use React Icons, and extract reusable components (StatCard, Button, Modal, DataTable) fed by the .NET dashboard API.',
  objectives: [
    'Install and use Bootstrap 5 in a React + Vite project (CSS classes, grid, utilities)',
    'Install Tailwind CSS v4 with the Vite plugin and use utility classes and breakpoints',
    'Build responsive layouts with mobile-first breakpoints, flexbox and grid',
    'Use React Icons and build reusable, prop-driven UI components',
    'Load dashboard statistics from GET /api/dashboard/summary and render them in cards',
  ],
  theory: [
    {
      heading: 'Styling options in React',
      content:
        'React does not force a styling approach. Common choices for a React + .NET project:',
      points: [
        'Plain CSS / CSS Modules (Button.module.css): full control, scoped class names',
        'Bootstrap 5: ready-made components (navbar, card, table, modal) and a 12-column grid; quickest for admin panels and familiar from Day 57',
        'Tailwind CSS: utility classes (p-4, flex, md:grid-cols-3) written directly in className; no prebuilt components, very flexible design',
        'Component libraries: React-Bootstrap, MUI, Ant Design, shadcn/ui (Tailwind based)',
        'In JSX always write className, not class; inline style takes an object: style={{ fontSize: 14 }}',
      ],
      tip: 'Pick ONE main system per project. Mixing Bootstrap and Tailwind causes conflicting resets and bigger bundles.',
    },
    {
      heading: 'Adding Bootstrap 5 to Vite + React',
      content:
        'Install the package and import its CSS once in main.jsx. Use Bootstrap classes in className. Interactive components that need Bootstrap\'s JavaScript (dropdown, collapse, modal) either import "bootstrap/dist/js/bootstrap.bundle.min.js" or, better in React, are controlled with React state (or use the react-bootstrap package).',
      syntax: `npm install bootstrap

// src/main.jsx
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";   // optional: dropdowns, collapse

// Grid: 12 columns, breakpoints sm 576, md 768, lg 992, xl 1200, xxl 1400
<div className="container-fluid">
  <div className="row g-3">
    <div className="col-12 col-sm-6 col-lg-3">...</div>   // 1 per row on phones, 2 on tablets, 4 on laptops
  </div>
</div>`,
    },
    {
      heading: 'Adding Tailwind CSS v4 to Vite + React',
      content:
        'Tailwind v4 ships a Vite plugin and needs no tailwind.config.js for the basics. Utilities are **mobile-first**: an unprefixed class applies to all sizes, `md:` applies from 768px up, `lg:` from 1024px.',
      syntax: `npm install tailwindcss @tailwindcss/vite

// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [react(), tailwindcss()] });

/* src/index.css */
@import "tailwindcss";

// JSX
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <div className="rounded-xl bg-white p-4 shadow hover:shadow-lg">...</div>
</div>`,
      tip: 'Tailwind v3 projects use npx tailwindcss init -p, a tailwind.config.js with content paths and the three @tailwind directives; you will still meet them in older code.',
    },
    {
      heading: 'Responsive design principles',
      content:
        'Design for the phone first, then enhance for wider screens. A dashboard usually has: a **sidebar** that becomes an off-canvas/hamburger menu on small screens, a **card grid** whose column count grows with width, and **tables** that scroll horizontally (`.table-responsive` / `overflow-x-auto`) instead of breaking the layout.',
      points: [
        '<meta name="viewport" content="width=device-width, initial-scale=1"> is already in Vite\'s index.html',
        'Use relative units (rem, %, fr) and min-width media queries',
        'Hide/show by breakpoint: Bootstrap d-none d-md-block, Tailwind hidden md:block',
        'Test with Chrome DevTools device toolbar (Ctrl+Shift+M)',
      ],
    },
    {
      heading: 'React Icons and reusable components',
      content:
        '**React Icons** (npm install react-icons) bundles Font Awesome, Bootstrap Icons, Material, Feather and more as React components; import only the icons you use (tree-shaken). Icons inherit color and font-size and accept size/className props.\n\n**Reusable components** turn repeated markup into one component with props: a StatCard (title, value, icon, color), a Button (variant, loading), a DataTable (columns, rows), a Modal (show, onClose, children). Benefits: consistent UI, one place to fix bugs, smaller pages.',
      syntax: `npm install react-icons

import { FaUserGraduate, FaBook } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
<FaUserGraduate size={28} className="text-primary" />

function StatCard({ title, value, icon: Icon, color = "primary" }) {
  return (
    <div className={"card border-start border-4 border-" + color}>
      <div className="card-body d-flex justify-content-between">
        <div><small className="text-muted">{title}</small><h3>{value}</h3></div>
        <Icon size={32} className={"text-" + color} />
      </div>
    </div>
  );
}`,
    },
  ],
  examples: [
    {
      title: 'Responsive admin dashboard (Bootstrap + React Icons) fed by the .NET API',
      scenario: 'The day\'s practical: a dashboard with a collapsible sidebar, four stat cards, a recent-students table and a course progress list, loading data from GET /api/dashboard/summary.',
      steps: [
        'npm install bootstrap react-icons',
        'Import bootstrap.min.css in src/main.jsx',
        'Add the DashboardController to the API and test it in Swagger',
        'Create src/components/ui/StatCard.jsx, src/layouts/DashboardLayout.jsx and src/pages/Dashboard.jsx',
        'Run npm run dev and resize the browser (Ctrl+Shift+M) to 375px, 768px and 1280px',
      ],
      code: `// ===== API: Controllers/DashboardController.cs =====
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("summary")]
    public async Task<ActionResult<DashboardSummaryDto>> Summary()
    {
        var students = await db.Students.CountAsync();
        var courses = await db.Courses.CountAsync();
        var avg = students == 0 ? 0 : await db.Students.AverageAsync(s => s.Marks);
        var passed = await db.Students.CountAsync(s => s.Marks >= 40);
        var recent = await db.Students.OrderByDescending(s => s.Id).Take(5)
            .Select(s => new StudentResponseDto(s.Id, s.FullName, s.Email, s.Course, s.Marks)).ToListAsync();
        return new DashboardSummaryDto(students, courses, Math.Round(avg, 1), passed, recent);
    }
}
public record DashboardSummaryDto(int Students, int Courses, double AverageMarks, int Passed, List<StudentResponseDto> Recent);

// ===== React: src/components/ui/StatCard.jsx =====
export default function StatCard({ title, value, icon: Icon, color = "primary" }) {
  return (
    <div className={"card shadow-sm border-0 border-start border-4 border-" + color + " h-100"}>
      <div className="card-body d-flex align-items-center justify-content-between">
        <div>
          <div className="text-muted small text-uppercase">{title}</div>
          <div className="fs-3 fw-bold">{value}</div>
        </div>
        <Icon size={36} className={"text-" + color + " opacity-75"} />
      </div>
    </div>
  );
}

// ===== React: src/layouts/DashboardLayout.jsx =====
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { MdDashboard } from "react-icons/md";
import { FaUserGraduate, FaBook, FaBars } from "react-icons/fa";

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  const link = ({ isActive }) => "nav-link text-white d-flex align-items-center gap-2" + (isActive ? " active bg-primary rounded" : "");
  return (
    <div className="d-flex min-vh-100">
      <aside className={"bg-dark p-3 sidebar " + (open ? "d-block" : "d-none") + " d-md-block"} style={{ width: 230 }}>
        <h5 className="text-white mb-4">EduAdmin</h5>
        <nav className="nav flex-column gap-1" onClick={() => setOpen(false)}>
          <NavLink to="/dashboard" className={link}><MdDashboard /> Dashboard</NavLink>
          <NavLink to="/students" className={link}><FaUserGraduate /> Students</NavLink>
          <NavLink to="/courses" className={link}><FaBook /> Courses</NavLink>
        </nav>
      </aside>
      <div className="flex-grow-1 bg-light">
        <header className="navbar bg-white shadow-sm px-3">
          <button className="btn btn-outline-secondary d-md-none" onClick={() => setOpen(o => !o)}><FaBars /></button>
          <span className="fw-semibold">Welcome, Admin</span>
        </header>
        <main className="p-3 p-md-4"><Outlet /></main>
      </div>
    </div>
  );
}

// ===== React: src/pages/Dashboard.jsx =====
import { useEffect, useState } from "react";
import { FaUserGraduate, FaBook, FaChartLine, FaCheckCircle } from "react-icons/fa";
import api from "../api/axiosClient";
import StatCard from "../components/ui/StatCard";

export default function Dashboard() {
  const [data, setData] = useState(null);
  useEffect(() => { api.get("/dashboard/summary").then(r => setData(r.data)); }, []);
  if (!data) return <div className="text-center p-5"><div className="spinner-border text-primary" /></div>;

  return (
    <>
      <div className="row g-3 mb-4">
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Students" value={data.students} icon={FaUserGraduate} /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Courses" value={data.courses} icon={FaBook} color="success" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Average marks" value={data.averageMarks} icon={FaChartLine} color="warning" /></div>
        <div className="col-12 col-sm-6 col-xl-3"><StatCard title="Passed" value={data.passed} icon={FaCheckCircle} color="info" /></div>
      </div>
      <div className="card shadow-sm">
        <div className="card-header bg-white fw-semibold">Recent students</div>
        <div className="table-responsive">
          <table className="table table-hover mb-0">
            <thead><tr><th>#</th><th>Name</th><th className="d-none d-md-table-cell">Email</th><th>Course</th><th>Marks</th></tr></thead>
            <tbody>
              {data.recent.map(s => (
                <tr key={s.id}>
                  <td>{s.id}</td><td>{s.fullName}</td><td className="d-none d-md-table-cell">{s.email}</td><td>{s.course}</td>
                  <td><span className={"badge " + (s.marks >= 40 ? "bg-success" : "bg-danger")}>{s.marks}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}`,
      playground: {
        css: `* { box-sizing: border-box; }
body { margin: 0; }
.layout { display: flex; min-height: 420px; font-family: "Segoe UI", system-ui, sans-serif; background: #f1f3f6; }
.sidebar { width: 210px; background: #1f2937; color: #fff; padding: 16px; flex-shrink: 0; }
.sidebar h5 { margin: 0 0 20px; font-size: 18px; }
.nav-item { display: flex; align-items: center; gap: 8px; padding: 9px 10px; border-radius: 6px; color: #cbd5e1; cursor: pointer; margin-bottom: 4px; }
.nav-item.active { background: #2563eb; color: #fff; }
.main { flex: 1; min-width: 0; }
.topbar { display: flex; align-items: center; gap: 10px; background: #fff; padding: 10px 16px; box-shadow: 0 1px 3px rgba(0,0,0,.08); }
.hamburger { display: none; border: 1px solid #ccc; background: #fff; border-radius: 6px; padding: 4px 8px; cursor: pointer; }
.content { padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px; }
.stat { background: #fff; border-radius: 10px; padding: 14px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid var(--c); box-shadow: 0 1px 3px rgba(0,0,0,.06); }
.stat small { color: #6b7280; text-transform: uppercase; font-size: 11px; }
.stat .value { font-size: 24px; font-weight: 700; }
.card { background: #fff; border-radius: 10px; box-shadow: 0 1px 3px rgba(0,0,0,.06); overflow: hidden; }
.card-header { padding: 10px 14px; font-weight: 600; border-bottom: 1px solid #eee; }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 14px; }
th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #f0f0f0; white-space: nowrap; }
.badge { color: #fff; border-radius: 10px; padding: 2px 8px; font-size: 12px; }
.spinner { width: 32px; height: 32px; border: 4px solid #cbd5e1; border-top-color: #2563eb; border-radius: 50%; animation: spin 0.8s linear infinite; margin: 40px auto; }
@keyframes spin { to { transform: rotate(360deg); } }
/* tablet: 2 cards per row */
@media (max-width: 900px) { .grid { grid-template-columns: repeat(2, 1fr); } }
/* phone: hide sidebar unless opened, 1 card per row, hide email column */
@media (max-width: 600px) {
  .sidebar { display: none; position: absolute; z-index: 10; height: 100%; }
  .sidebar.open { display: block; }
  .hamburger { display: inline-block; }
  .grid { grid-template-columns: 1fr; }
  .hide-sm { display: none; }
}`,
        jsx: `const { useState, useEffect } = React;

// Small inline-SVG icons standing in for react-icons (FaUserGraduate, FaBook, ...)
const Icon = ({ d, size = 18, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const MdDashboard = p => <Icon {...p} d="M3 3h8v8H3zM13 3h8v5h-8zM13 10h8v11h-8zM3 13h8v8H3z" />;
const FaUserGraduate = p => <Icon {...p} d="M12 3l10 5-10 5L2 8zM6 10v5c0 2 3 4 6 4s6-2 6-4v-5" />;
const FaBook = p => <Icon {...p} d="M4 4h10a4 4 0 0 1 4 4v12H8a4 4 0 0 1-4-4zM4 16a4 4 0 0 1 4-4h10" />;
const FaChartLine = p => <Icon {...p} d="M3 3v18h18M7 15l4-4 3 3 5-6" />;
const FaCheckCircle = p => <Icon {...p} d="M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0zM8 12l3 3 5-6" />;
const FaBars = p => <Icon {...p} d="M3 6h18M3 12h18M3 18h18" />;

// Fake GET /api/dashboard/summary
function fakeSummary() {
  return new Promise(r => setTimeout(() => r({
    students: 128, courses: 6, averageMarks: 71.4, passed: 117,
    recent: [
      { id: 128, fullName: "Sana Mirza", email: "sana@test.com", course: "React", marks: 91 },
      { id: 127, fullName: "Vikas Rane", email: "vikas@test.com", course: "C#", marks: 38 },
      { id: 126, fullName: "Pooja Jain", email: "pooja@test.com", course: "SQL Server", marks: 76 },
      { id: 125, fullName: "Kavya Rao", email: "kavya@test.com", course: "ASP.NET Core", marks: 64 },
    ],
  }), 700));
}

// ---- reusable components ----
function StatCard({ title, value, icon: IconCmp, color }) {
  return (
    <div className="stat" style={{ "--c": color }}>
      <div><small>{title}</small><div className="value">{value}</div></div>
      <IconCmp size={34} color={color} />
    </div>
  );
}
function Badge({ ok, children }) {
  return <span className="badge" style={{ background: ok ? "#16a34a" : "#dc2626" }}>{children}</span>;
}
function DataTable({ columns, rows }) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr>{columns.map(c => <th key={c.key} className={c.hideSm ? "hide-sm" : ""}>{c.title}</th>)}</tr></thead>
        <tbody>{rows.map(r => (
          <tr key={r.id}>{columns.map(c => <td key={c.key} className={c.hideSm ? "hide-sm" : ""}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [data, setData] = useState(null);
  useEffect(() => { fakeSummary().then(setData); }, []);

  const menu = [["Dashboard", MdDashboard], ["Students", FaUserGraduate], ["Courses", FaBook]];
  const columns = [
    { key: "id", title: "#" },
    { key: "fullName", title: "Name" },
    { key: "email", title: "Email", hideSm: true },
    { key: "course", title: "Course" },
    { key: "marks", title: "Marks", render: r => <Badge ok={r.marks >= 40}>{r.marks}</Badge> },
  ];

  return (
    <div className="layout" style={{ position: "relative" }}>
      <aside className={"sidebar" + (open ? " open" : "")}>
        <h5>EduAdmin</h5>
        {menu.map(([label, I]) => (
          <div key={label} className={"nav-item" + (active === label ? " active" : "")} onClick={() => { setActive(label); setOpen(false); }}>
            <I /> {label}
          </div>
        ))}
      </aside>
      <div className="main">
        <header className="topbar">
          <button className="hamburger" onClick={() => setOpen(o => !o)}><FaBars /></button>
          <strong>{active}</strong><span style={{ marginLeft: "auto", fontSize: 14 }}>Welcome, Admin</span>
        </header>
        <div className="content">
          {!data ? <div className="spinner" /> : (
            <>
              <div className="grid">
                <StatCard title="Students" value={data.students} icon={FaUserGraduate} color="#2563eb" />
                <StatCard title="Courses" value={data.courses} icon={FaBook} color="#16a34a" />
                <StatCard title="Average marks" value={data.averageMarks} icon={FaChartLine} color="#d97706" />
                <StatCard title="Passed" value={data.passed} icon={FaCheckCircle} color="#0891b2" />
              </div>
              <div className="card">
                <div className="card-header">Recent students</div>
                <DataTable columns={columns} rows={data.recent} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}`,
      },
      result: 'A spinner for 0.7 s, then a dark sidebar (Dashboard, Students, Courses with icons), a top bar "Welcome, Admin", four stat cards (Students 128, Courses 6, Average marks 71.4, Passed 117) and a "Recent students" table with green/red mark badges (Vikas Rane 38 is red). Narrow the preview: under 900px the cards form 2 columns; under 600px the sidebar hides behind a hamburger button, cards stack in one column and the Email column disappears.',
      explanation:
        'The playground uses a small hand-written CSS file with media queries in place of Bootstrap, and inline SVG components in place of react-icons, because it cannot install npm packages. The ideas map one-to-one: .grid with breakpoints = row/col-sm-6/col-xl-3, .hide-sm = d-none d-md-table-cell, the hamburger toggle = React state controlling a CSS class. StatCard and DataTable are reusable components driven only by props (icon is passed as a component: icon={FaBook}).',
    },
    {
      title: 'The same stat card grid with Tailwind CSS v4',
      scenario: 'Rebuild the stat cards and a responsive navbar with Tailwind utilities to compare with Bootstrap.',
      steps: [
        'npm install tailwindcss @tailwindcss/vite',
        'Add tailwindcss() to the plugins array in vite.config.js',
        'Replace src/index.css content with @import "tailwindcss";',
        'Write the components with utility classes and resize the window',
      ],
      code: `// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig({ plugins: [react(), tailwindcss()] });

/* src/index.css */
@import "tailwindcss";

// src/components/ui/StatCard.jsx (Tailwind version)
const colors = {
  blue: "border-blue-600 text-blue-600",
  green: "border-green-600 text-green-600",
  amber: "border-amber-500 text-amber-500",
};

export default function StatCard({ title, value, icon: Icon, color = "blue" }) {
  return (
    <div className={"flex items-center justify-between rounded-xl border-l-4 bg-white p-4 shadow-sm transition hover:shadow-md " + colors[color]}>
      <div>
        <p className="text-xs uppercase text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <Icon className="size-9 opacity-80" />
    </div>
  );
}

// Dashboard grid: 1 column on phones, 2 from sm (640px), 4 from lg (1024px)
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <StatCard title="Students" value={128} icon={FaUserGraduate} />
  <StatCard title="Courses" value={6} icon={FaBook} color="green" />
  <StatCard title="Average" value={71.4} icon={FaChartLine} color="amber" />
</div>

// Navbar: menu hidden on mobile, visible from md
<nav className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white">
  <span className="font-semibold">EduAdmin</span>
  <button className="md:hidden" onClick={() => setOpen(!open)}><FaBars /></button>
  <ul className={(open ? "block" : "hidden") + " md:flex md:gap-6"}>
    <li>Dashboard</li><li>Students</li><li>Courses</li>
  </ul>
</nav>`,
      playground: {
        css: `/* A handful of Tailwind-like utilities so the JSX below reads like real Tailwind code */
.flex{display:flex}.grid{display:grid}.hidden{display:none}.block{display:block}
.items-center{align-items:center}.justify-between{justify-content:space-between}
.gap-4{gap:1rem}.gap-6{gap:1.5rem}.p-4{padding:1rem}.px-4{padding-left:1rem;padding-right:1rem}.py-3{padding-top:.75rem;padding-bottom:.75rem}
.rounded-xl{border-radius:.75rem}.border-l-4{border-left:4px solid}.bg-white{background:#fff}.bg-gray-900{background:#111827}.bg-gray-100{background:#f3f4f6}
.text-white{color:#fff}.text-gray-500{color:#6b7280}.text-gray-900{color:#111827}.text-xs{font-size:.75rem}.text-2xl{font-size:1.5rem}.uppercase{text-transform:uppercase}
.font-bold{font-weight:700}.font-semibold{font-weight:600}.shadow-sm{box-shadow:0 1px 2px rgba(0,0,0,.08)}.m-0{margin:0}.list-none{list-style:none}
.border-blue-600{border-color:#2563eb}.text-blue-600{color:#2563eb}.border-green-600{border-color:#16a34a}.text-green-600{color:#16a34a}.border-amber-500{border-color:#f59e0b}.text-amber-500{color:#f59e0b}
.grid-cols-1{grid-template-columns:1fr}
@media (min-width:640px){.sm\\:grid-cols-2{grid-template-columns:repeat(2,1fr)}}
@media (min-width:768px){.md\\:hidden{display:none}.md\\:flex{display:flex}}
@media (min-width:1024px){.lg\\:grid-cols-4{grid-template-columns:repeat(4,1fr)}}`,
        jsx: `const { useState } = React;

const colors = { blue: "border-blue-600 text-blue-600", green: "border-green-600 text-green-600", amber: "border-amber-500 text-amber-500" };

function StatCard({ title, value, emoji, color = "blue" }) {
  return (
    <div className={"flex items-center justify-between rounded-xl border-l-4 bg-white p-4 shadow-sm " + colors[color]}>
      <div>
        <p className="m-0 text-xs uppercase text-gray-500">{title}</p>
        <p className="m-0 text-2xl font-bold text-gray-900">{value}</p>
      </div>
      <span style={{ fontSize: 30 }}>{emoji}</span>
    </div>
  );
}

function App() {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-gray-100" style={{ fontFamily: "system-ui, sans-serif", minHeight: 300 }}>
      <nav className="flex items-center justify-between bg-gray-900 px-4 py-3 text-white" style={{ flexWrap: "wrap" }}>
        <span className="font-semibold">EduAdmin</span>
        <button className="md:hidden" onClick={() => setOpen(!open)}>Menu</button>
        <ul className={(open ? "block" : "hidden") + " md:flex gap-6 list-none m-0"} style={{ padding: 0, width: open ? "100%" : "auto" }}>
          <li>Dashboard</li><li>Students</li><li>Courses</li>
        </ul>
      </nav>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 p-4">
        <StatCard title="Students" value={128} emoji="🎓" />
        <StatCard title="Courses" value={6} emoji="📚" color="green" />
        <StatCard title="Average" value={71.4} emoji="📈" color="amber" />
        <StatCard title="Passed" value={117} emoji="✅" color="green" />
      </div>
    </div>
  );
}`,
      },
      result: 'A dark top navbar and four white stat cards with coloured left borders. Wide preview (1024px+): 4 cards in a row and the menu items inline. 640-1023px: 2 per row. Under 640px: 1 per row; under 768px the menu collapses behind a "Menu" button that toggles it.',
      explanation:
        'Tailwind classes are mobile-first: grid-cols-1 is the base, sm:grid-cols-2 overrides from 640px, lg:grid-cols-4 from 1024px. The playground defines only the few utilities used (real Tailwind generates them automatically from your JSX). Note the color map: Tailwind needs complete class names in source code, so build them from a lookup object, never with string pieces like "text-" + color + "-600".',
    },
    {
      title: 'Reusable Button and Modal components',
      scenario: 'Create a Button with variants and a loading state, and a Modal used for "Delete student?" confirmation that calls DELETE /api/students/{id}.',
      steps: [
        'Create src/components/ui/Button.jsx and Modal.jsx',
        'Use props for variant, loading, disabled, children and onClick',
        'Render the Modal conditionally from the page state',
        'Use them on the Students page instead of window.confirm',
      ],
      code: `// src/components/ui/Button.jsx
export default function Button({ variant = "primary", loading = false, children, ...rest }) {
  return (
    <button className={"btn btn-" + variant} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spinner-border spinner-border-sm me-2" />}
      {children}
    </button>
  );
}

// src/components/ui/Modal.jsx
export default function Modal({ show, title, children, onClose, footer }) {
  if (!show) return null;
  return (
    <>
      <div className="modal-backdrop show" onClick={onClose} />
      <div className="modal d-block" role="dialog" aria-modal="true">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header"><h5 className="modal-title">{title}</h5>
              <button className="btn-close" onClick={onClose} aria-label="Close" /></div>
            <div className="modal-body">{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}

// usage in Students.jsx
const [toDelete, setToDelete] = useState(null);
const [deleting, setDeleting] = useState(false);
async function confirmDelete() {
  setDeleting(true);
  await studentService.remove(toDelete.id);
  setStudents(s => s.filter(x => x.id !== toDelete.id));
  setDeleting(false); setToDelete(null);
}
<Modal show={!!toDelete} title="Delete student" onClose={() => setToDelete(null)}
  footer={<><Button variant="secondary" onClick={() => setToDelete(null)}>Cancel</Button>
           <Button variant="danger" loading={deleting} onClick={confirmDelete}>Delete</Button></>}>
  Delete <b>{toDelete?.fullName}</b>? This cannot be undone.
</Modal>`,
      playground: {
        css: `.btn{border:0;border-radius:6px;padding:6px 14px;color:#fff;cursor:pointer;font-size:14px;margin-left:6px}
.btn:disabled{opacity:.6;cursor:not-allowed}
.btn-primary{background:#2563eb}.btn-danger{background:#dc2626}.btn-secondary{background:#6b7280}
.spin{display:inline-block;width:12px;height:12px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;animation:s .7s linear infinite;margin-right:6px;vertical-align:-1px}
@keyframes s{to{transform:rotate(360deg)}}
.backdrop{position:fixed;inset:0;background:rgba(0,0,0,.45)}
.dialog{position:fixed;left:50%;top:40%;transform:translate(-50%,-50%);background:#fff;border-radius:10px;width:min(360px,90vw);box-shadow:0 10px 30px rgba(0,0,0,.3)}
.dialog header,.dialog footer{padding:10px 14px;display:flex;justify-content:space-between;align-items:center}
.dialog footer{justify-content:flex-end;border-top:1px solid #eee}
.dialog .body{padding:14px}`,
        jsx: `const { useState } = React;

function Button({ variant = "primary", loading = false, children, ...rest }) {
  return (
    <button className={"btn btn-" + variant} disabled={loading || rest.disabled} {...rest}>
      {loading && <span className="spin" />}{children}
    </button>
  );
}
function Modal({ show, title, children, onClose, footer }) {
  if (!show) return null;
  return (
    <>
      <div className="backdrop" onClick={onClose} />
      <div className="dialog" role="dialog" aria-modal="true">
        <header><strong>{title}</strong><button onClick={onClose} aria-label="Close" style={{ border: 0, background: "none", fontSize: 18, cursor: "pointer" }}>x</button></header>
        <div className="body">{children}</div>
        {footer && <footer>{footer}</footer>}
      </div>
    </>
  );
}

const fakeDelete = id => new Promise(r => setTimeout(() => r({ status: 204 }), 900));   // DELETE /api/students/{id}

function App() {
  const [students, setStudents] = useState([{ id: 1, fullName: "Asha Patil" }, { id: 2, fullName: "Ravi Kumar" }, { id: 3, fullName: "Meena Shah" }]);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  async function confirmDelete() {
    setDeleting(true);
    await fakeDelete(toDelete.id);
    setStudents(s => s.filter(x => x.id !== toDelete.id));
    setDeleting(false); setToDelete(null);
  }
  return (
    <div style={{ fontFamily: "system-ui, sans-serif" }}>
      <h3>Students</h3>
      {students.map(s => (
        <div key={s.id} style={{ display: "flex", justifyContent: "space-between", maxWidth: 360, padding: "6px 0", borderBottom: "1px solid #eee" }}>
          {s.fullName}<Button variant="danger" onClick={() => setToDelete(s)}>Delete</Button>
        </div>
      ))}
      {students.length === 0 && <p>No students left.</p>}
      <Modal show={!!toDelete} title="Delete student" onClose={() => !deleting && setToDelete(null)}
        footer={<><Button variant="secondary" disabled={deleting} onClick={() => setToDelete(null)}>Cancel</Button>
                 <Button variant="danger" loading={deleting} onClick={confirmDelete}>{deleting ? "Deleting..." : "Delete"}</Button></>}>
        Delete <b>{toDelete && toDelete.fullName}</b>? This cannot be undone.
      </Modal>
    </div>
  );
}`,
      },
      result: 'Three students each with a red Delete button. Clicking Delete on Ravi Kumar opens a centred dialog "Delete Ravi Kumar? This cannot be undone." with Cancel and Delete. Delete shows a spinner and "Deleting..." for 0.9 s, then the dialog closes and Ravi disappears. Clicking the dark backdrop or Cancel closes it without deleting.',
      explanation:
        'Button forwards any other props (...rest) to the native button, so onClick, type and disabled work as usual. Modal renders nothing when show is false and puts whatever children it receives in its body, so the same component can be used for confirmations, forms or details.',
    },
  ],
  interview: [
    { q: 'Why do we write className instead of class in JSX?', a: 'JSX compiles to JavaScript where class is a reserved word; React maps className to the HTML class attribute.', level: 'Easy' },
    { q: 'How do you add Bootstrap to a Vite React project?', a: 'npm install bootstrap and import "bootstrap/dist/css/bootstrap.min.css" (and optionally the JS bundle) in main.jsx; then use Bootstrap classes in className.', level: 'Easy' },
    { q: 'What does mobile-first mean?', a: 'Base styles target small screens and min-width breakpoints (sm/md/lg) add or change styles for larger screens.', level: 'Easy' },
    { q: 'Explain col-12 col-sm-6 col-xl-3.', a: 'Full width on extra-small screens, half width from 576px, quarter width from 1200px: 1, 2 and 4 cards per row.', level: 'Medium' },
    { q: 'Bootstrap vs Tailwind?', a: 'Bootstrap gives prebuilt components and a consistent look quickly. Tailwind gives low-level utilities for custom designs without writing CSS, generating only used classes. Bootstrap is faster to start, Tailwind more flexible.', level: 'Medium' },
    { q: 'Why should you not build Tailwind classes like "text-" + color + "-600"?', a: 'Tailwind scans source files for complete class names; dynamically assembled names are not found and their CSS is not generated. Use a lookup object of full class strings.', level: 'Hard' },
    { q: 'How do React Icons keep the bundle small?', a: 'Each icon is an ES module export; bundlers tree-shake unused icons, so only imported icons ship.', level: 'Medium' },
    { q: 'What makes a component reusable?', a: 'It is driven by props (data and callbacks), has no hard-coded page data, supports children/rest props, and has sensible defaults.', level: 'Medium' },
    { q: 'How do you make a wide table responsive?', a: 'Wrap it in .table-responsive (Bootstrap) or overflow-x-auto (Tailwind) so it scrolls horizontally, and hide less important columns on small screens.', level: 'Easy' },
    { q: 'Why control Bootstrap modals/collapses with React state instead of Bootstrap JS?', a: 'Bootstrap JS changes the DOM outside React, which can get out of sync with React state. Controlling visibility with state (or using react-bootstrap) keeps React the source of truth.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a reusable Alert component with type (success, danger, warning) and a close button.',
      hint: 'Bootstrap classes alert alert-{type}; local state for visibility.',
      solution: `function Alert({ type = "info", children }) {
  const [show, setShow] = useState(true);
  if (!show) return null;
  return (
    <div className={"alert alert-" + type + " d-flex justify-content-between"}>
      <span>{children}</span>
      <button className="btn-close" onClick={() => setShow(false)} />
    </div>
  );
}`,
    },
    {
      task: 'Make a product card grid that shows 1 card on phones, 3 on tablets and 4 on desktops using Bootstrap.',
      hint: 'col-12 col-md-4 col-xl-3.',
      solution: `<div className="row g-3">
  {products.map(p => (
    <div key={p.id} className="col-12 col-md-4 col-xl-3">
      <div className="card h-100"><div className="card-body"><h6>{p.name}</h6><p>{p.price}</p></div></div>
    </div>
  ))}
</div>`,
    },
    {
      task: 'Write a Spinner component with Tailwind classes.',
      hint: 'animate-spin rounded-full border-4 border-t-transparent.',
      solution: `export const Spinner = () => (
  <div className="flex justify-center p-8">
    <div className="size-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
  </div>
);`,
    },
    {
      task: 'Generalise DataTable so it accepts columns with a render function and shows "No records" when rows is empty.',
      hint: 'colSpan={columns.length}.',
      solution: `function DataTable({ columns, rows }) {
  return (
    <table className="table">
      <thead><tr>{columns.map(c => <th key={c.key}>{c.title}</th>)}</tr></thead>
      <tbody>
        {rows.length === 0
          ? <tr><td colSpan={columns.length} className="text-center text-muted">No records</td></tr>
          : rows.map(r => <tr key={r.id}>{columns.map(c => <td key={c.key}>{c.render ? c.render(r) : r[c.key]}</td>)}</tr>)}
      </tbody>
    </table>
  );
}`,
    },
  ],
  quiz: [
    { question: 'Which Bootstrap class makes a column half-width from 576px up?', options: ['col-6', 'col-md-6', 'col-sm-6', 'col-lg-6'], answer: 2, explanation: 'sm starts at 576px.' },
    { question: 'In Tailwind, which class applies only from 768px up?', options: ['md:flex', 'flex-md', 'flex@md', 'tablet:flex'], answer: 0, explanation: 'Breakpoint prefixes use the prefix: syntax; md = 768px.' },
    { question: 'How do you install React Icons?', options: ['npm install fontawesome-react', 'It is built into React', 'Link a CDN in index.html only', 'npm install react-icons'], answer: 3, explanation: 'Then import icons like { FaBook } from "react-icons/fa".' },
    { question: 'Which wrapper lets a Bootstrap table scroll horizontally on phones?', options: ['.table-scroll', '.table-responsive', '.overflow-table', '.table-mobile'], answer: 1, explanation: 'table-responsive adds overflow-x: auto.' },
    { question: 'Passing icon={FaBook} to StatCard passes...', options: ['A string', 'An SVG file path', 'A component that StatCard renders as <Icon />', 'A CSS class'], answer: 2, explanation: 'Components can be passed as props and rendered by a capitalised variable.' },
  ],
};
