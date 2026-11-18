const smsSql = `CREATE DATABASE StudentMS;
GO
USE StudentMS;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);
GO
CREATE TABLE Students (
    StudentId INT IDENTITY(1,1) PRIMARY KEY,
    RollNo VARCHAR(10) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId),
    AdmissionDate DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO
CREATE TABLE Courses (
    CourseId INT IDENTITY(1,1) PRIMARY KEY,
    Code VARCHAR(10) NOT NULL UNIQUE,
    Title NVARCHAR(100) NOT NULL,
    Credits INT NOT NULL CHECK (Credits BETWEEN 1 AND 6)
);
GO
CREATE TABLE Enrollments (
    EnrollmentId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    Marks INT NULL CHECK (Marks BETWEEN 0 AND 100),
    AttendancePct INT NOT NULL DEFAULT 0 CHECK (AttendancePct BETWEEN 0 AND 100),
    CONSTRAINT UQ_Enrollment UNIQUE (StudentId, CourseId)
);
GO
INSERT INTO Departments (Name) VALUES ('Computer Science'), ('Commerce');
INSERT INTO Students (RollNo, FullName, Email, DepartmentId, AdmissionDate) VALUES
('CS001', 'Aarav Patil', 'aarav@college.edu', 1, '2025-07-01'),
('CS002', 'Sneha Joshi', 'sneha@college.edu', 1, '2025-07-01'),
('CM001', 'Rohan Mehta', 'rohan@college.edu', 2, '2025-07-03');
INSERT INTO Courses (Code, Title, Credits) VALUES
('CS101', 'C# Programming', 4),
('CS102', 'SQL Server', 3),
('CM101', 'Accounting', 4);
INSERT INTO Enrollments (StudentId, CourseId, Marks, AttendancePct) VALUES
(1, 1, 88, 92), (1, 2, 76, 85),
(2, 1, 64, 70), (2, 2, 35, 80),
(3, 3, 91, 95), (3, 1, NULL, 40);
GO
SELECT s.RollNo, s.FullName, d.Name AS Department,
       COUNT(e.CourseId) AS Courses,
       AVG(CAST(e.Marks AS DECIMAL(5,2))) AS AvgMarks,
       CASE WHEN MIN(e.Marks) < 40 THEN 'FAIL'
            WHEN AVG(e.Marks) >= 75 THEN 'DISTINCTION'
            ELSE 'PASS' END AS Result
FROM Students s
JOIN Departments d ON d.DepartmentId = s.DepartmentId
JOIN Enrollments e ON e.StudentId = s.StudentId
WHERE e.Marks IS NOT NULL
GROUP BY s.RollNo, s.FullName, d.Name
ORDER BY s.RollNo;
GO
SELECT s.RollNo, c.Code, e.AttendancePct,
       IIF(e.AttendancePct >= 75, 'Eligible', 'Not eligible') AS ExamStatus
FROM Enrollments e
JOIN Students s ON s.StudentId = e.StudentId
JOIN Courses c ON c.CourseId = e.CourseId
WHERE e.AttendancePct < 75
ORDER BY s.RollNo, c.Code;
GO
SELECT RollNo, FullName, Email
FROM Students
ORDER BY RollNo
OFFSET 0 ROWS FETCH NEXT 2 ROWS ONLY;`;

const emsSql = `CREATE DATABASE EmployeeMS;
GO
USE EmployeeMS;
GO
CREATE TABLE Departments (
    DepartmentId INT IDENTITY(1,1) PRIMARY KEY,
    Name NVARCHAR(50) NOT NULL UNIQUE
);
GO
CREATE TABLE Employees (
    EmployeeId INT IDENTITY(1,1) PRIMARY KEY,
    EmpCode VARCHAR(10) NOT NULL UNIQUE,
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL UNIQUE,
    DepartmentId INT NOT NULL FOREIGN KEY REFERENCES Departments(DepartmentId),
    ManagerId INT NULL FOREIGN KEY REFERENCES Employees(EmployeeId),
    BasicSalary DECIMAL(10,2) NOT NULL CHECK (BasicSalary > 0),
    JoiningDate DATE NOT NULL,
    IsActive BIT NOT NULL DEFAULT 1
);
GO
CREATE TABLE LeaveRequests (
    LeaveId INT IDENTITY(1,1) PRIMARY KEY,
    EmployeeId INT NOT NULL FOREIGN KEY REFERENCES Employees(EmployeeId),
    FromDate DATE NOT NULL,
    ToDate DATE NOT NULL,
    Status VARCHAR(10) NOT NULL DEFAULT 'Pending' CHECK (Status IN ('Pending', 'Approved', 'Rejected')),
    CHECK (ToDate >= FromDate)
);
GO
INSERT INTO Departments (Name) VALUES ('Engineering'), ('HR'), ('Sales');
INSERT INTO Employees (EmpCode, FullName, Email, DepartmentId, ManagerId, BasicSalary, JoiningDate) VALUES
('E001', 'Priya Sharma', 'priya@corp.com', 1, NULL, 120000, '2018-04-02'),
('E002', 'Vikram Rao', 'vikram@corp.com', 1, 1, 80000, '2021-06-14'),
('E003', 'Neha Kulkarni', 'neha@corp.com', 1, 2, 55000, '2024-01-08'),
('E004', 'Anil Desai', 'anil@corp.com', 2, 1, 60000, '2020-09-21'),
('E005', 'Kavya Iyer', 'kavya@corp.com', 3, 1, 50000, '2023-03-01');
INSERT INTO LeaveRequests (EmployeeId, FromDate, ToDate, Status) VALUES
(3, '2026-11-02', '2026-11-04', 'Approved'),
(5, '2026-11-20', '2026-11-21', 'Pending'),
(2, '2026-12-24', '2026-12-31', 'Pending');
GO
SELECT d.Name AS Department, COUNT(e.EmployeeId) AS Headcount,
       SUM(e.BasicSalary) AS TotalSalary, MAX(e.BasicSalary) AS HighestSalary
FROM Departments d
LEFT JOIN Employees e ON e.DepartmentId = d.DepartmentId
GROUP BY d.Name
ORDER BY Headcount DESC, d.Name;
GO
WITH OrgChart AS (
    SELECT EmployeeId, FullName, ManagerId, 0 AS Lvl,
           CAST(FullName AS VARCHAR(200)) AS ReportingPath
    FROM Employees WHERE ManagerId IS NULL
    UNION ALL
    SELECT e.EmployeeId, e.FullName, e.ManagerId, o.Lvl + 1,
           CAST(o.ReportingPath + ' > ' + e.FullName AS VARCHAR(200))
    FROM Employees e
    JOIN OrgChart o ON e.ManagerId = o.EmployeeId
)
SELECT Lvl, ReportingPath FROM OrgChart ORDER BY ReportingPath;
GO
SELECT e.EmpCode, e.FullName, l.FromDate, l.ToDate,
       DATEDIFF(DAY, l.FromDate, l.ToDate) + 1 AS Days, l.Status
FROM LeaveRequests l
JOIN Employees e ON e.EmployeeId = l.EmployeeId
ORDER BY l.FromDate;`;

const studentModels = `public record SubjectMark(string Subject, int Marks, int AttendancePct);

public record StudentResult(string RollNo, int Total, double Percentage, string Grade, string Status);
`;

const studentService = `using System;
using System.Collections.Generic;
using System.Linq;

// Business rules live in ONE class - the Web API controller and the unit tests both call it
public class StudentResultService
{
    public const int PassMarks = 40;       // minimum marks in every subject
    public const int MinAttendance = 75;   // minimum attendance % in every subject

    public StudentResult Evaluate(string rollNo, List<SubjectMark> marks)
    {
        if (marks.Count == 0)
            throw new ArgumentException("No marks entered for " + rollNo);

        foreach (var m in marks)
            if (m.Marks < 0 || m.Marks > 100)
                throw new ArgumentException($"{m.Subject}: marks must be between 0 and 100");

        int total = marks.Sum(m => m.Marks);
        double percentage = Math.Round(total * 100.0 / (marks.Count * 100), 2);

        string grade = percentage switch
        {
            >= 75.0 => "A",
            >= 60.0 => "B",
            >= 50.0 => "C",
            >= 40.0 => "D",
            _ => "F"
        };

        bool debarred = marks.Any(m => m.AttendancePct < MinAttendance);
        bool failed = marks.Any(m => m.Marks < PassMarks);
        string status = debarred ? "DEBARRED (attendance)" : failed ? "FAIL" : "PASS";

        return new StudentResult(rollNo, total, percentage, grade, status);
    }
}
`;

const studentProgram = `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

var service = new StudentResultService();

var input = new List<(string RollNo, List<SubjectMark> Marks)>
{
    ("CS001", new List<SubjectMark> { new SubjectMark("C#", 88, 92), new SubjectMark("SQL", 76, 85), new SubjectMark("Web", 81, 90) }),
    ("CS002", new List<SubjectMark> { new SubjectMark("C#", 64, 80), new SubjectMark("SQL", 35, 82), new SubjectMark("Web", 70, 88) }),
    ("CM001", new List<SubjectMark> { new SubjectMark("C#", 91, 95), new SubjectMark("SQL", 72, 60), new SubjectMark("Web", 68, 78) }),
    ("CS003", new List<SubjectMark> { new SubjectMark("C#", 55, 90), new SubjectMark("SQL", 61, 90), new SubjectMark("Web", 105, 90) }),
};

var results = new List<StudentResult>();
foreach (var (rollNo, marks) in input)
{
    try
    {
        var r = service.Evaluate(rollNo, marks);
        results.Add(r);
        string pct = r.Percentage.ToString("0.00", CultureInfo.InvariantCulture);
        Console.WriteLine($"{r.RollNo} | Total {r.Total} | {pct}% | Grade {r.Grade} | {r.Status}");
    }
    catch (ArgumentException ex)
    {
        Console.WriteLine($"{rollNo} | ERROR: {ex.Message}");
    }
}

var passed = results.Where(r => r.Status == "PASS").ToList();
Console.WriteLine($"Evaluated {results.Count}, passed {passed.Count}");
if (passed.Count > 0)
{
    var topper = passed.OrderByDescending(r => r.Percentage).First();
    Console.WriteLine($"Topper: {topper.RollNo} ({topper.Percentage.ToString("0.00", CultureInfo.InvariantCulture)}%)");
}
`;

const employeeModels = `public class Employee
{
    public string EmpCode { get; init; } = "";
    public string Name { get; init; } = "";
    public decimal BasicSalary { get; init; }
    public int LeaveBalance { get; set; }
}

public record Payslip(string EmpCode, decimal Gross, decimal Pf, decimal Tax, decimal Net);
`;

const payrollService = `using System;

public class PayrollService
{
    public const decimal HraRate = 0.20m;        // House Rent Allowance = 20% of basic
    public const decimal DaRate = 0.10m;         // Dearness Allowance  = 10% of basic
    public const decimal PfRate = 0.12m;         // Provident Fund      = 12% of basic (deduction)
    public const decimal TaxRate = 0.10m;        // simplified monthly tax on gross above the limit
    public const decimal TaxFreeLimit = 100000m;

    public Payslip Generate(Employee e)
    {
        if (e.BasicSalary <= 0)
            throw new ArgumentException("Basic salary must be positive");

        decimal hra = e.BasicSalary * HraRate;
        decimal da = e.BasicSalary * DaRate;
        decimal gross = e.BasicSalary + hra + da;
        decimal pf = e.BasicSalary * PfRate;
        decimal tax = gross > TaxFreeLimit ? (gross - TaxFreeLimit) * TaxRate : 0m;
        decimal net = gross - pf - tax;

        return new Payslip(e.EmpCode, gross, pf, tax, net);
    }
}
`;

const leaveService = `public class LeaveService
{
    public string Apply(Employee e, int days)
    {
        if (days < 1)
            return "Rejected: days must be at least 1";
        if (days > e.LeaveBalance)
            return $"Rejected: requested {days}, only {e.LeaveBalance} day(s) left";

        e.LeaveBalance -= days;
        return $"Approved: {days} day(s), remaining balance {e.LeaveBalance}";
    }
}
`;

const employeeProgram = `using System;
using System.Collections.Generic;
using System.Globalization;

var payroll = new PayrollService();
var leave = new LeaveService();

var staff = new List<Employee>
{
    new Employee { EmpCode = "E001", Name = "Priya Sharma", BasicSalary = 120000m, LeaveBalance = 12 },
    new Employee { EmpCode = "E002", Name = "Vikram Rao", BasicSalary = 80000m, LeaveBalance = 8 },
    new Employee { EmpCode = "E003", Name = "Neha Kulkarni", BasicSalary = 55000m, LeaveBalance = 5 },
};

Console.WriteLine("Payroll - November 2026");
decimal totalNet = 0;
foreach (var e in staff)
{
    var p = payroll.Generate(e);
    totalNet += p.Net;
    Console.WriteLine($"{p.EmpCode} {e.Name}: Gross {Money(p.Gross)}, PF {Money(p.Pf)}, Tax {Money(p.Tax)}, Net {Money(p.Net)}");
}
Console.WriteLine($"Total net payout: {Money(totalNet)}");
Console.WriteLine();

var neha = staff[2];
Console.WriteLine($"Leave requests for {neha.Name} (balance {neha.LeaveBalance})");
Console.WriteLine(leave.Apply(neha, 3));
Console.WriteLine(leave.Apply(neha, 4));
Console.WriteLine(leave.Apply(neha, 0));

static string Money(decimal v) => v.ToString("0.00", CultureInfo.InvariantCulture);
`;

const apiCode = `// ===== Solution layout (Visual Studio: Blank Solution "StudentMS") =====
// StudentMS.Api        -> ASP.NET Core Web API (controllers, Program.cs)
// StudentMS.Core       -> Entities, DTOs, interfaces, StudentResultService (no EF reference)
// StudentMS.Data       -> AppDbContext, repositories, migrations (EF Core)
// StudentMS.Tests      -> xUnit tests for services + WebApplicationFactory tests
// student-ms-ui        -> React (Vite) frontend

// ===== StudentMS.Core/Entities/Student.cs =====
public class Student
{
    public int StudentId { get; set; }
    public string RollNo { get; set; } = "";
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public int DepartmentId { get; set; }
    public Department? Department { get; set; }
    public DateTime AdmissionDate { get; set; }
    public bool IsActive { get; set; } = true;
    public List<Enrollment> Enrollments { get; set; } = new();
}

// ===== StudentMS.Core/Dtos/StudentDtos.cs =====
public record StudentDto(int StudentId, string RollNo, string FullName, string Email, string Department);

public class CreateStudentDto
{
    [Required, StringLength(10)] public string RollNo { get; set; } = "";
    [Required, StringLength(100, MinimumLength = 3)] public string FullName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Range(1, int.MaxValue)] public int DepartmentId { get; set; }
}

public record PagedResult<T>(List<T> Items, int TotalCount, int Page, int PageSize);

// ===== StudentMS.Data/AppDbContext.cs =====
public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Student> Students => Set<Student>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Enrollment> Enrollments => Set<Enrollment>();

    protected override void OnModelCreating(ModelBuilder mb)
    {
        mb.Entity<Student>().HasIndex(s => s.RollNo).IsUnique();
        mb.Entity<Student>().HasIndex(s => s.Email).IsUnique();
        mb.Entity<Enrollment>().HasIndex(e => new { e.StudentId, e.CourseId }).IsUnique();
        mb.Entity<Enrollment>().ToTable(t => t.HasCheckConstraint("CK_Marks", "Marks BETWEEN 0 AND 100"));
    }
}

// ===== StudentMS.Api/Controllers/StudentsController.cs =====
[ApiController]
[Route("api/[controller]")]
[Authorize]                                   // every endpoint needs a valid JWT
public class StudentsController(AppDbContext db, StudentResultService results) : ControllerBase
{
    // GET api/students?search=pat&departmentId=1&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<PagedResult<StudentDto>>> GetAll(
        string? search, int? departmentId, int page = 1, int pageSize = 10)
    {
        var query = db.Students.AsNoTracking().Where(s => s.IsActive);
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s => s.FullName.Contains(search) || s.RollNo.Contains(search));
        if (departmentId is not null)
            query = query.Where(s => s.DepartmentId == departmentId);

        int total = await query.CountAsync();
        var items = await query.OrderBy(s => s.RollNo)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(s => new StudentDto(s.StudentId, s.RollNo, s.FullName, s.Email, s.Department!.Name))
            .ToListAsync();
        return Ok(new PagedResult<StudentDto>(items, total, page, pageSize));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<StudentDto>> GetById(int id)
    {
        var s = await db.Students.AsNoTracking().Include(x => x.Department)
                                 .FirstOrDefaultAsync(x => x.StudentId == id);
        return s is null ? NotFound() : new StudentDto(s.StudentId, s.RollNo, s.FullName, s.Email, s.Department!.Name);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<StudentDto>> Create(CreateStudentDto dto)
    {
        if (await db.Students.AnyAsync(s => s.RollNo == dto.RollNo))
            return Conflict(new { message = "Roll number already exists" });

        var entity = new Student { RollNo = dto.RollNo, FullName = dto.FullName, Email = dto.Email,
                                   DepartmentId = dto.DepartmentId, AdmissionDate = DateTime.Today };
        db.Students.Add(entity);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetById), new { id = entity.StudentId },
            new StudentDto(entity.StudentId, entity.RollNo, entity.FullName, entity.Email, ""));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)          // soft delete keeps history
    {
        var s = await db.Students.FindAsync(id);
        if (s is null) return NotFound();
        s.IsActive = false;
        await db.SaveChangesAsync();
        return NoContent();
    }

    // GET api/students/5/result  -> uses the business-rule class from the console demo
    [HttpGet("{id:int}/result")]
    public async Task<ActionResult<StudentResult>> GetResult(int id)
    {
        var s = await db.Students.Include(x => x.Enrollments).ThenInclude(e => e.Course)
                                 .FirstOrDefaultAsync(x => x.StudentId == id);
        if (s is null) return NotFound();
        var marks = s.Enrollments.Where(e => e.Marks != null)
                     .Select(e => new SubjectMark(e.Course!.Code, e.Marks!.Value, e.AttendancePct)).ToList();
        return results.Evaluate(s.RollNo, marks);
    }
}

// ===== StudentMS.Api/Program.cs =====
var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<StudentResultService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(/* Day 94 settings */);
builder.Services.AddAuthorization();
builder.Services.AddCors(o => o.AddPolicy("ui", p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseExceptionHandler("/error");
if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseHttpsRedirection();
app.UseCors("ui");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ===== appsettings.json =====
// {
//   "ConnectionStrings": {
//     "DefaultConnection": "Server=.;Database=StudentMS;Trusted_Connection=True;TrustServerCertificate=True"
//   },
//   "Jwt": { "Issuer": "StudentMS", "Audience": "StudentMS.UI", "Key": "<from user-secrets>" }
// }

// ===== Package Manager Console =====
// Install-Package Microsoft.EntityFrameworkCore.SqlServer
// Install-Package Microsoft.EntityFrameworkCore.Tools
// Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
// Add-Migration InitialCreate -Project StudentMS.Data -StartupProject StudentMS.Api
// Update-Database

// ===== React: src/pages/StudentsPage.jsx (real project code) =====
// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import api from "../api/axiosClient";          // axios instance with baseURL + JWT interceptor (Day 105/107)
//
// export default function StudentsPage() {
//   const [data, setData] = useState({ items: [], totalCount: 0 });
//   const [search, setSearch] = useState("");
//   const [page, setPage] = useState(1);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//
//   useEffect(() => {
//     setLoading(true);
//     api.get("/api/students", { params: { search, page, pageSize: 10 } })
//        .then(res => setData(res.data))
//        .catch(err => setError(err.response?.data?.message ?? "Could not load students"))
//        .finally(() => setLoading(false));
//   }, [search, page]);
//   ...render table with Link to={"/students/" + s.studentId}
// }`;

const reactJsx = `const { useState, useMemo } = React;

// Mock data shaped exactly like GET /api/students + GET /api/students/{id}/result
const students = [
  { studentId: 1, rollNo: "CS001", fullName: "Aarav Patil", department: "Computer Science", percentage: 81.67, status: "PASS" },
  { studentId: 2, rollNo: "CS002", fullName: "Sneha Joshi", department: "Computer Science", percentage: 56.33, status: "FAIL" },
  { studentId: 3, rollNo: "CM001", fullName: "Rohan Mehta", department: "Commerce", percentage: 77.0, status: "DEBARRED" },
  { studentId: 4, rollNo: "CS004", fullName: "Diya Kapoor", department: "Computer Science", percentage: 68.5, status: "PASS" },
  { studentId: 5, rollNo: "CM002", fullName: "Kabir Singh", department: "Commerce", percentage: 49.0, status: "PASS" },
];

function StatCard({ label, value, color }) {
  return (
    <div className="stat" style={{ borderLeftColor: color }}>
      <div className="label">{label}</div>
      <div className="value">{value}</div>
    </div>
  );
}

function Badge({ status }) {
  const cls = status === "PASS" ? "ok" : status === "FAIL" ? "bad" : "warn";
  return <span className={"badge " + cls}>{status}</span>;
}

function App() {
  const [search, setSearch] = useState("");
  const [dept, setDept] = useState("All");
  const [selected, setSelected] = useState(null);

  const filtered = useMemo(() => students.filter(s =>
    (dept === "All" || s.department === dept) &&
    (s.fullName.toLowerCase().includes(search.toLowerCase()) || s.rollNo.toLowerCase().includes(search.toLowerCase()))
  ), [search, dept]);

  const passCount = students.filter(s => s.status === "PASS").length;
  const avg = (students.reduce((t, s) => t + s.percentage, 0) / students.length).toFixed(2);

  return (
    <div className="wrap">
      <h2>Student Management - Dashboard</h2>
      <div className="stats">
        <StatCard label="Students" value={students.length} color="#2563eb" />
        <StatCard label="Passed" value={passCount} color="#16a34a" />
        <StatCard label="Average %" value={avg} color="#f59e0b" />
      </div>

      <div className="bar">
        <input placeholder="Search name or roll no" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={dept} onChange={e => setDept(e.target.value)}>
          <option>All</option>
          <option>Computer Science</option>
          <option>Commerce</option>
        </select>
      </div>

      <table>
        <thead><tr><th>Roll No</th><th>Name</th><th>Department</th><th>%</th><th>Result</th></tr></thead>
        <tbody>
          {filtered.map(s => (
            <tr key={s.studentId} onClick={() => setSelected(s)} className={selected && selected.studentId === s.studentId ? "sel" : ""}>
              <td>{s.rollNo}</td><td>{s.fullName}</td><td>{s.department}</td>
              <td>{s.percentage.toFixed(2)}</td><td><Badge status={s.status} /></td>
            </tr>
          ))}
          {filtered.length === 0 && <tr><td colSpan="5" className="empty">No students match the filter</td></tr>}
        </tbody>
      </table>

      {selected && (
        <div className="detail">
          <b>{selected.fullName}</b> ({selected.rollNo}) - {selected.department}<br />
          Result: <Badge status={selected.status} /> with {selected.percentage.toFixed(2)}%
          <button onClick={() => setSelected(null)}>Close</button>
        </div>
      )}
    </div>
  );
}`;

const reactCss = `body{background:#f5f7fb;margin:0}
.wrap{font-family:"Segoe UI",system-ui,sans-serif;max-width:760px;margin:auto;padding:12px}
h2{margin:4px 0 12px;font-size:20px}
.stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:10px;margin-bottom:12px}
.stat{background:#fff;border-left:4px solid;border-radius:8px;padding:10px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.stat .label{font-size:12px;color:#6b7280;text-transform:uppercase}.stat .value{font-size:22px;font-weight:700}
.bar{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:10px}
input,select{padding:6px 8px;border:1px solid #cbd5e1;border-radius:6px;font-size:14px}
table{width:100%;border-collapse:collapse;background:#fff;font-size:14px;border-radius:8px;overflow:hidden}
th,td{padding:8px;border-bottom:1px solid #eef0f4;text-align:left}th{background:#f1f5f9}
tr{cursor:pointer}tr.sel td{background:#eff6ff}.empty{text-align:center;color:#6b7280}
.badge{padding:2px 8px;border-radius:10px;font-size:12px;font-weight:600}
.badge.ok{background:#dcfce7;color:#166534}.badge.bad{background:#fee2e2;color:#991b1b}.badge.warn{background:#fef3c7;color:#92400e}
.detail{margin-top:12px;background:#fff;padding:12px;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.08)}
.detail button{margin-left:10px;border:0;background:#6b7280;color:#fff;border-radius:6px;padding:4px 10px;cursor:pointer}`;

export default {
  id: 'day-119-student-employee-management-projects',
  title: 'Final Projects Part 1: Student Management System and Employee Management System',
  module: 'Module 12: Final Real-Time Projects',
  day: 119,
  level: 'Advanced',
  duration: '4 hours',
  summary:
    'Plan and build two complete full-stack projects with everything from the course: a Student Management System (students, departments, courses, enrollments, marks, attendance, results) and an Employee Management System (departments, employees, managers, payroll, leave). For each you get the feature list, layered architecture, a verified SQL Server schema, the Web API endpoint table, the React pages, the business-rule classes you can run as console apps and a day-by-day build plan.',
  objectives: [
    'Turn a project idea into modules, user roles, a feature list and a database schema',
    'Design a layered solution (React UI -> ASP.NET Core Web API -> services -> EF Core -> SQL Server)',
    'Write the SQL Server schema with keys and constraints and the main report queries',
    'Define REST endpoints, DTOs and React pages for each feature',
    'Keep business rules (results, payroll, leave) in testable service classes and follow a step-by-step build plan',
  ],
  theory: [
    {
      heading: 'How to approach a real-time project',
      content:
        'A final project is judged like real work: it must solve a business problem end to end, be secure, handle errors and be explainable in an interview. Do not start with code. First write the requirements: who uses the system (roles), what each role can do (features), what data must be stored (entities) and which rules apply (business rules). Then design the database, the API contract and the screens. Only then build it feature by feature, testing as you go. Analogy: an architect draws the building plan before the bricks arrive.',
      points: [
        'Requirement document: problem statement, roles, features (must-have vs nice-to-have), business rules',
        'Design: ER diagram, table list, API endpoint table, page list / wireframes',
        'Build in vertical slices: one feature fully (table -> entity -> API -> React page -> test) before the next',
        'Version control from day one: Git repo, .gitignore, feature branches, small commits (Day 116)',
        'Finish: README with setup steps, screenshots, Swagger link, deployment (Day 117-118)',
      ],
    },
    {
      heading: 'Common architecture for both projects',
      content:
        'Both projects use the same layered architecture you built during Modules 6-11. The React SPA (Vite) talks to an ASP.NET Core Web API over HTTPS with JSON. Controllers stay thin: they validate input (DTO + Data Annotations), call a service, and return status codes. Services hold business rules (grade calculation, payroll, leave approval). EF Core (DbContext + migrations) maps entities to SQL Server tables. JWT authentication and role-based authorization protect every endpoint; global exception handling, logging and CORS are configured in Program.cs. Tests: xUnit for services, WebApplicationFactory for the API.',
      syntax: `React (pages, components, axios, Context for auth, protected routes)
        |  HTTPS + JSON + "Authorization: Bearer <jwt>"
ASP.NET Core Web API (Controllers -> DTO validation -> Services)
        |  EF Core (DbContext, LINQ, migrations)
SQL Server (tables, keys, constraints, indexes, views)`,
      points: [
        'Solution projects: *.Api, *.Core (entities, DTOs, services), *.Data (DbContext, migrations), *.Tests, *-ui (React)',
        'Roles: Admin (full CRUD), Staff/Teacher or Manager (limited write), Student/Employee (read own data)',
        'Cross-cutting: Serilog/ILogger logging, UseExceptionHandler returning ProblemDetails, Swagger with JWT button',
        'Same patterns in both projects means you only learn the structure once',
      ],
    },
    {
      heading: 'Project 1: Student Management System - features and schema',
      content:
        'Problem: a college keeps student records, course enrollments, marks and attendance in Excel sheets; results take days to prepare. The system gives admins one place to manage data and calculates results automatically. Main tables: Departments, Students, Courses, Enrollments (StudentId + CourseId unique, Marks 0-100, AttendancePct 0-100). Optional: Users/Roles (ASP.NET Core Identity), Fees, Exams.',
      points: [
        'Admin: login, dashboard (counts, pass %), CRUD departments, students, courses',
        'Enroll students in courses, enter marks and attendance (bulk entry grid)',
        'Search, filter by department, sort, pagination for the student list',
        'Result rules: fail if any subject < 40, debarred if any attendance < 75%, grade from percentage (A >= 75, B >= 60, C >= 50, D >= 40)',
        'Reports: result sheet, attendance shortage list, department-wise toppers; export CSV',
        'Student role: view own profile, marks and result only (claims: StudentId in the JWT)',
        'Soft delete (IsActive = 0) so history and enrollments are never lost',
      ],
    },
    {
      heading: 'Student Management System - API endpoints and React pages',
      content:
        'Design the REST contract before coding. Plural nouns, HTTP verbs for actions, route parameters for ids, query strings for search/paging. Each endpoint has a request DTO, a response DTO and documented status codes so the React developer (maybe you) can work in parallel using Swagger.',
      syntax: `Method  Route                                Role          Success  Errors
POST    /api/auth/login                      anonymous     200      400, 401
GET     /api/students?search=&departmentId=&page=&pageSize=  Admin,Teacher 200  401
GET     /api/students/{id}                   Admin,Teacher,Self 200 404
POST    /api/students                        Admin         201      400, 409
PUT     /api/students/{id}                   Admin         204      400, 404
DELETE  /api/students/{id}  (soft delete)    Admin         204      404
GET     /api/departments | POST /api/departments           Admin    200/201
GET     /api/courses | POST | PUT | DELETE   Admin         200/201/204
POST    /api/enrollments                     Admin         201      400, 409 (already enrolled)
PUT     /api/enrollments/{id}/marks          Teacher       204      400 (marks 0-100)
GET     /api/students/{id}/result            Admin,Teacher,Self 200 404
GET     /api/reports/attendance-shortage     Admin,Teacher 200`,
      points: [
        'React pages: /login, /dashboard, /students, /students/new, /students/:id/edit, /students/:id (profile + result), /courses, /enrollments, /marks-entry, /reports',
        'Shared components: Navbar, Sidebar, ProtectedRoute (role check), DataTable with paging, ConfirmDialog, Toast, Spinner',
        'State: AuthContext (token, user, roles) + useReducer; axios instance with interceptor adding the token and handling 401',
      ],
    },
    {
      heading: 'Project 2: Employee Management System - features, schema and endpoints',
      content:
        'Problem: an HR team manages employee records, reporting lines, salaries and leave in emails and spreadsheets. Main tables: Departments, Employees (self-referencing ManagerId for the org chart, BasicSalary DECIMAL with CHECK > 0), LeaveRequests (Status Pending/Approved/Rejected, ToDate >= FromDate), Payslips (EmployeeId + Month unique). Business rules: payroll (HRA 20%, DA 10%, PF 12%, simplified tax above a limit), leave cannot exceed balance, a manager approves only their own team\'s leave.',
      syntax: `GET    /api/employees?search=&departmentId=&sortBy=salary&desc=true&page=1   Admin,HR
GET    /api/employees/{id}            Admin,HR,Self
POST   /api/employees                 Admin,HR      201 / 400 / 409 (duplicate EmpCode/Email)
PUT    /api/employees/{id}            Admin,HR      204 / 400 / 404
DELETE /api/employees/{id}            Admin         204 (soft delete)
GET    /api/employees/{id}/team       Manager       200 (direct reports)
POST   /api/leaves                    Employee      201 / 400 (insufficient balance)
PUT    /api/leaves/{id}/approve       Manager       204 / 403 (not your team) / 409 (not pending)
POST   /api/payroll/run?month=2026-11 Admin,HR      200 (payslips generated)
GET    /api/payroll/{employeeId}?month=2026-11      Admin,HR,Self 200 / 404
POST   /api/employees/{id}/photo      Admin,HR      200 (IFormFile, max 2 MB, jpg/png)`,
      points: [
        'React pages: /login, /dashboard (headcount, payroll total, pending leaves), /employees, /employees/new, /employees/:id, /org-chart, /leaves (my leaves + apply), /approvals (manager), /payroll, /payslips/:id',
        'Policies: "CanApproveLeave" (Manager role), "SelfOrHR" (resource-based check comparing the EmployeeId claim)',
        'Payroll run inside a transaction: either every payslip for the month is saved or none',
      ],
    },
    {
      heading: 'Step-by-step build plan (10 working days)',
      content:
        'Use this plan for either project (and for the Day 120 projects). Each step ends with something that runs, is committed to Git and can be demoed.',
      points: [
        'Step 1: Requirements, roles, ER diagram, endpoint table, wireframes; create GitHub repo + README',
        'Step 2: Create solution (Api, Core, Data, Tests) and React app with Vite; add packages; commit',
        'Step 3: Entities + AppDbContext + Fluent API constraints; Add-Migration InitialCreate; Update-Database; seed data',
        'Step 4: Auth: Identity or Users table, password hashing, JWT login, roles; Swagger with Authorize button',
        'Step 5: CRUD APIs with DTOs, validation, service layer, paging/search/sort; test in Swagger/Postman',
        'Step 6: Business rules (results / payroll / leave) as services + xUnit tests',
        'Step 7: React: login, AuthContext, protected routes, layout with sidebar, list + form pages with axios',
        'Step 8: Reports and dashboard, file upload/export, loading and error states, toasts',
        'Step 9: Global exception handler, logging, CORS, integration tests with WebApplicationFactory',
        'Step 10: Publish (IIS/Azure or Docker), CI workflow on GitHub Actions, final README + demo video',
      ],
      tip: 'Interviewers love a project you can explain end to end: be ready to draw the architecture, show one table design decision, one business rule with its unit test and one security measure.',
    },
  ],
  examples: [
    {
      title: 'Student Management System - SQL Server schema and result queries',
      scenario:
        'Create the StudentMS database with Departments, Students, Courses and Enrollments, add sample data and write the three queries the project needs most: the result sheet, the attendance-shortage list and a paged student list.',
      steps: [
        'Open SSMS and connect to your SQL Server instance (or open the in-app SSMS Lab)',
        'Click New Query (Ctrl+N) and paste the script',
        'Press F5 (Execute) and read the Messages and Results tabs',
        'Draw the relationships: Departments 1-* Students, Students 1-* Enrollments *-1 Courses',
      ],
      code: smsSql,
      tsql: smsSql,
      result: `>> CREATE DATABASE StudentMS -> Commands completed successfully.
>> USE StudentMS -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Students ( -> Commands completed successfully.
>> CREATE TABLE Courses ( -> Commands completed successfully.
>> CREATE TABLE Enrollments ( -> Commands completed successfully.
>> INSERT INTO Departments (Name) VALUES ('Computer Science'), ('Commerce -> (2 rows affected)
>> INSERT INTO Students (RollNo, FullName, Email, DepartmentId, Admission -> (3 rows affected)
>> INSERT INTO Courses (Code, Title, Credits) VALUES -> (3 rows affected)
>> INSERT INTO Enrollments (StudentId, CourseId, Marks, AttendancePct) VA -> (6 rows affected)
>> SELECT s.RollNo, s.FullName, d.Name AS Department,
+--------+-------------+------------------+---------+----------+-------------+
| RollNo | FullName    | Department       | Courses | AvgMarks | Result      |
+--------+-------------+------------------+---------+----------+-------------+
| CM001  | Rohan Mehta | Commerce         | 1       | 91.0     | DISTINCTION |
| CS001  | Aarav Patil | Computer Science | 2       | 82.0     | DISTINCTION |
| CS002  | Sneha Joshi | Computer Science | 2       | 49.5     | FAIL        |
+--------+-------------+------------------+---------+----------+-------------+
3 row(s) returned
>> SELECT s.RollNo, c.Code, e.AttendancePct,
+--------+-------+---------------+--------------+
| RollNo | Code  | AttendancePct | ExamStatus   |
+--------+-------+---------------+--------------+
| CM001  | CS101 | 40            | Not eligible |
| CS002  | CS101 | 70            | Not eligible |
+--------+-------+---------------+--------------+
2 row(s) returned
>> SELECT RollNo, FullName, Email
+--------+-------------+-------------------+
| RollNo | FullName    | Email             |
+--------+-------------+-------------------+
| CM001  | Rohan Mehta | rohan@college.edu |
| CS001  | Aarav Patil | aarav@college.edu |
+--------+-------------+-------------------+
2 row(s) returned`,
      explanation:
        'Enrollments is the junction table of the many-to-many Students-Courses relationship; UQ_Enrollment stops the same student being enrolled twice in one course, and the CHECK constraints keep marks and attendance within 0-100 even if a buggy client sends bad data. The result query uses MIN(Marks) < 40 to detect a failed subject and AVG for the percentage; the AVG is cast to DECIMAL because AVG of INT columns in SQL Server is integer division (49 instead of 49.5). Real SQL Server shows the decimal average as 49.500000; the lab prints 49.5. Marks IS NOT NULL skips the course Rohan has not been examined in yet. OFFSET/FETCH is exactly what EF Core generates for Skip/Take in the paged API endpoint.',
    },
    {
      title: 'Student result business rules as a testable service (console)',
      scenario:
        'Before writing the API, put the result rules in a StudentResultService class and run it from a console app. The same class is later registered with DI and called by GET /api/students/{id}/result.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it StudentMS.Rules',
        'Add classes: right-click project > Add > Class: Models.cs, StudentResultService.cs',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging; put a breakpoint (F9) in Evaluate and press F5 to step with F10/F11',
      ],
      code: `// ===== Models.cs =====
${studentModels}
// ===== StudentResultService.cs =====
${studentService}
// ===== Program.cs =====
${studentProgram}`,
      csharp: { files: { 'Program.cs': studentProgram, 'Models.cs': studentModels, 'StudentResultService.cs': studentService }, stdin: '' },
      result: `CS001 | Total 245 | 81.67% | Grade A | PASS
CS002 | Total 169 | 56.33% | Grade C | FAIL
CM001 | Total 231 | 77.00% | Grade A | DEBARRED (attendance)
CS003 | ERROR: Web: marks must be between 0 and 100
Evaluated 3, passed 1
Topper: CS001 (81.67%)`,
      explanation:
        'CS001: 88 + 76 + 81 = 245, 245 * 100 / 300 = 81.666... rounded to 81.67, grade A, all marks >= 40 and attendance >= 75, so PASS. CS002 has 35 in SQL, so FAIL even though the percentage (56.33) gives grade C. CM001 scored 77% but SQL attendance is 60%, and the debarred check runs first. CS003 has 105 marks, so Evaluate throws ArgumentException before any calculation; the loop catches it and continues with the next student (the result is not added). Only CS001 passed, so it is the topper. Because the rules are in a plain class with no database, an xUnit test like Assert.Equal("FAIL", service.Evaluate("X", marks).Status) runs in milliseconds.',
    },
    {
      title: 'Student Management System - Web API, EF Core and React page',
      scenario:
        'The key project code: entity, DTOs, DbContext with constraints, StudentsController (search + paging, create with 409 for duplicates, soft delete, result endpoint), Program.cs wiring and the React StudentsPage. The playground shows the dashboard and list page with the API response mocked.',
      steps: [
        'Create a Blank Solution StudentMS; add projects: ASP.NET Core Web API (StudentMS.Api), Class Library (StudentMS.Core, StudentMS.Data), xUnit Test Project (StudentMS.Tests)',
        'Install EF Core SqlServer, Tools and JwtBearer packages (Tools > NuGet Package Manager > Package Manager Console)',
        'Add the entities, AppDbContext and StudentsController; run Add-Migration InitialCreate and Update-Database',
        'Press F5 and test GET /api/students?search=pat&page=1&pageSize=10 in Swagger (click Authorize and paste a JWT first)',
        'In a terminal: npm create vite@latest student-ms-ui -- --template react, npm i axios react-router-dom, add StudentsPage.jsx, npm run dev',
        'Run the playground to see the dashboard: type in the search box, change the department, click a row',
      ],
      code: apiCode,
      playground: { css: reactCss, jsx: reactJsx },
      result: `Swagger: GET /api/students?search=pat&page=1&pageSize=10 -> 200 OK
{
  "items": [
    { "studentId": 1, "rollNo": "CS001", "fullName": "Aarav Patil", "email": "aarav@college.edu", "department": "Computer Science" }
  ],
  "totalCount": 1, "page": 1, "pageSize": 10
}
POST /api/students with an existing rollNo -> 409 Conflict { "message": "Roll number already exists" }
POST /api/students with "email": "abc" -> 400 Bad Request (errors.Email: "The Email field is not a valid e-mail address.")
Playground: 3 stat cards (Students 5, Passed 3, Average % 66.50), a searchable table with coloured PASS/FAIL/DEBARRED badges and a detail box for the clicked row.`,
      explanation:
        'The controller never contains result or validation logic itself: [ApiController] returns 400 automatically when the DTO is invalid, the duplicate check returns 409, and the result endpoint delegates to StudentResultService. AsNoTracking makes read-only queries faster; the projection with Select builds DTOs in SQL so the password or internal fields can never leak. Delete is a soft delete so enrollments and results remain for reports. In React, useEffect re-runs whenever search or page changes, and the axios instance adds the JWT automatically. Average % in the playground = (81.67 + 56.33 + 77 + 68.5 + 49) / 5 = 332.5 / 5 = 66.50.',
    },
    {
      title: 'Employee Management System - schema, org chart and reports',
      scenario:
        'Create EmployeeMS with Departments, Employees (self-referencing ManagerId) and LeaveRequests, then query department headcount and salary, the reporting hierarchy with a recursive CTE, and leave requests with the number of days.',
      steps: [
        'In SSMS: New Query (Ctrl+N), paste the script',
        'Press F5 to execute',
        'Check the Results tab: three result grids',
        'Right-click Database Diagrams > New Database Diagram to see the self-referencing relationship on Employees',
      ],
      code: emsSql,
      tsql: emsSql,
      result: `>> CREATE DATABASE EmployeeMS -> Commands completed successfully.
>> USE EmployeeMS -> Commands completed successfully.
>> CREATE TABLE Departments ( -> Commands completed successfully.
>> CREATE TABLE Employees ( -> Commands completed successfully.
>> CREATE TABLE LeaveRequests ( -> Commands completed successfully.
>> INSERT INTO Departments (Name) VALUES ('Engineering'), ('HR'), ('Sales -> (3 rows affected)
>> INSERT INTO Employees (EmpCode, FullName, Email, DepartmentId, Manager -> (5 rows affected)
>> INSERT INTO LeaveRequests (EmployeeId, FromDate, ToDate, Status) VALUE -> (3 rows affected)
>> SELECT d.Name AS Department, COUNT(e.EmployeeId) AS Headcount,
+-------------+-----------+-------------+---------------+
| Department  | Headcount | TotalSalary | HighestSalary |
+-------------+-----------+-------------+---------------+
| Engineering | 3         | 255000      | 120000        |
| HR          | 1         | 60000       | 60000         |
| Sales       | 1         | 50000       | 50000         |
+-------------+-----------+-------------+---------------+
3 row(s) returned
>> WITH OrgChart AS (
+-----+-------------------------------------------+
| Lvl | ReportingPath                             |
+-----+-------------------------------------------+
| 0   | Priya Sharma                              |
| 1   | Priya Sharma > Anil Desai                 |
| 1   | Priya Sharma > Kavya Iyer                 |
| 1   | Priya Sharma > Vikram Rao                 |
| 2   | Priya Sharma > Vikram Rao > Neha Kulkarni |
+-----+-------------------------------------------+
5 row(s) returned
>> SELECT e.EmpCode, e.FullName, l.FromDate, l.ToDate,
+---------+---------------+------------+------------+------+----------+
| EmpCode | FullName      | FromDate   | ToDate     | Days | Status   |
+---------+---------------+------------+------------+------+----------+
| E003    | Neha Kulkarni | 2026-11-02 | 2026-11-04 | 3    | Approved |
| E005    | Kavya Iyer    | 2026-11-20 | 2026-11-21 | 2    | Pending  |
| E002    | Vikram Rao    | 2026-12-24 | 2026-12-31 | 8    | Pending  |
+---------+---------------+------------+------------+------+----------+
3 row(s) returned`,
      explanation:
        'ManagerId REFERENCES Employees(EmployeeId) is a self-referencing foreign key: Priya (ManagerId NULL) is the top of the tree. The recursive CTE starts with the anchor row (ManagerId IS NULL) and repeatedly joins employees whose manager is already in the result, building the reporting path - this powers the React /org-chart page. LEFT JOIN in the headcount query keeps departments with zero employees. DATEDIFF(DAY, From, To) + 1 counts both start and end days. The table-level CHECK (ToDate >= FromDate) and the Status CHECK protect data even if the API has a bug. Real SQL Server prints salaries as 255000.00; the lab drops trailing zeros.',
    },
    {
      title: 'Employee payroll and leave rules (console)',
      scenario:
        'Implement PayrollService (gross = basic + HRA 20% + DA 10%, PF 12% of basic, 10% tax on gross above 100000) and LeaveService (cannot exceed balance) as plain classes, then run them for three employees.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it EmployeeMS.Rules',
        'Add classes Employee.cs, PayrollService.cs and LeaveService.cs (Shift+Alt+C)',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
      ],
      code: `// ===== Employee.cs =====
${employeeModels}
// ===== PayrollService.cs =====
${payrollService}
// ===== LeaveService.cs =====
${leaveService}
// ===== Program.cs =====
${employeeProgram}`,
      csharp: { files: { 'Program.cs': employeeProgram, 'Employee.cs': employeeModels, 'PayrollService.cs': payrollService, 'LeaveService.cs': leaveService }, stdin: '' },
      result: `Payroll - November 2026
E001 Priya Sharma: Gross 156000.00, PF 14400.00, Tax 5600.00, Net 136000.00
E002 Vikram Rao: Gross 104000.00, PF 9600.00, Tax 400.00, Net 94000.00
E003 Neha Kulkarni: Gross 71500.00, PF 6600.00, Tax 0.00, Net 64900.00
Total net payout: 294900.00

Leave requests for Neha Kulkarni (balance 5)
Approved: 3 day(s), remaining balance 2
Rejected: requested 4, only 2 day(s) left
Rejected: days must be at least 1`,
      explanation:
        'Priya: HRA 24000 + DA 12000 -> gross 156000; PF = 12% of 120000 = 14400; tax = (156000 - 100000) * 10% = 5600; net = 156000 - 14400 - 5600 = 136000. Vikram: gross 104000, tax 400, PF 9600, net 94000. Neha: gross 71500 is under the limit so tax is 0, net 64900. Money uses decimal (never double) and is printed with "0.00" and InvariantCulture so the output is the same on every machine. The first leave request reduces the balance from 5 to 2, so the second request for 4 days is rejected. In the API, POST /api/leaves returns 400 with this message and the approval endpoint runs the same check again inside a transaction.',
    },
  ],
  interview: [
    { q: 'Explain the architecture of your final project.', a: 'A React SPA calls an ASP.NET Core Web API over HTTPS using axios with a JWT in the Authorization header. Controllers validate DTOs and call services that contain business rules; services use EF Core (DbContext) to read and write SQL Server. Cross-cutting concerns - authentication, authorization policies, CORS, global exception handling, logging - are configured in Program.cs. Unit tests cover services; integration tests use WebApplicationFactory.', level: 'Medium' },
    { q: 'Why do you use DTOs instead of returning entities from the API?', a: 'DTOs define the public contract: they hide internal fields (password hashes, IsActive), avoid circular references from navigation properties, allow different shapes for create/update/read and carry validation attributes. Changing the database does not break the client.', level: 'Easy' },
    { q: 'How did you model the Student-Course relationship?', a: 'Many-to-many through an Enrollments junction table with StudentId and CourseId foreign keys plus payload columns (Marks, AttendancePct). A unique constraint on (StudentId, CourseId) prevents duplicate enrollment; CHECK constraints keep marks 0-100.', level: 'Medium' },
    { q: 'How is the employee reporting hierarchy stored and queried?', a: 'With a self-referencing foreign key: Employees.ManagerId references Employees.EmployeeId (NULL for the top manager). In SQL a recursive CTE walks the tree; in EF Core the entity has Manager and Reports navigation properties configured with HasOne(e => e.Manager).WithMany(m => m.Reports).', level: 'Medium' },
    { q: 'Why soft delete students/employees instead of DELETE?', a: 'Historical data (enrollments, results, payslips, leave) references them; a hard delete would either fail on foreign keys or lose history. Soft delete sets IsActive = 0; queries filter on it (or use an EF Core global query filter).', level: 'Easy' },
    { q: 'Where do business rules like grade calculation or payroll belong and why?', a: 'In a service class in the Core/business layer, not in controllers or React. Then the rule has one source of truth, is reused by API endpoints, background jobs and reports, and can be unit tested without a database or HTTP.', level: 'Medium' },
    { q: 'Why use decimal and not double for salary?', a: 'decimal is a base-10 type with 28-29 significant digits, so values like 0.1 are stored exactly; double is binary floating point and produces rounding errors (0.1 + 0.2 != 0.3). Money must be exact, so use decimal in C# and DECIMAL(p,s) in SQL Server.', level: 'Easy' },
    { q: 'How does the API respond when a duplicate roll number is posted?', a: 'The controller checks AnyAsync(s => s.RollNo == dto.RollNo) and returns 409 Conflict with a message. The unique index is the final safety net: if two requests race, SaveChanges throws DbUpdateException, which the global handler also maps to 409.', level: 'Medium' },
    { q: 'How do you make sure an employee sees only their own payslip?', a: 'The JWT contains an EmployeeId claim. The endpoint uses a policy or resource-based check: allow if the user is in role HR/Admin or the claim value equals the requested employeeId; otherwise return 403 Forbid. Never trust an id sent from React alone.', level: 'Hard' },
    { q: 'How do you implement search, sorting and pagination in the list API?', a: 'Build an IQueryable step by step: Where for search and filters, OrderBy/OrderByDescending based on a whitelisted sortBy value, CountAsync for the total, then Skip((page-1)*pageSize).Take(pageSize). EF Core translates it to WHERE, ORDER BY and OFFSET/FETCH. Return items with totalCount so React can render page numbers.', level: 'Medium' },
    { q: 'What happens if the payroll run fails halfway?', a: 'The run executes inside a transaction (await using var tx = await db.Database.BeginTransactionAsync(); ... await tx.CommitAsync();). If any payslip fails, the exception skips the commit and the transaction is rolled back, so no partial payroll is stored. A unique (EmployeeId, Month) index prevents running payroll twice.', level: 'Hard' },
    { q: 'Output question: with PassMarks = 40, what does the Evaluate method return for marks 40, 39, 90 with full attendance?', a: 'Total = 169, percentage = 56.33, grade C, but status FAIL because one subject (39) is below 40. Grade and status are independent rules.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write the requirement document for the Student Management System: problem statement, three roles, at least 12 features marked must-have or nice-to-have, and five business rules.',
      hint: 'Roles: Admin, Teacher, Student. Rules: pass marks, attendance, unique roll number, enrollment once per course, grade bands.',
      solution: 'Problem: manual result processing. Roles: Admin (manage masters, users), Teacher (marks, attendance), Student (view own data). Must-have: login, dashboard, CRUD students/courses/departments, enroll, marks entry, attendance entry, result calculation, result sheet, search+paging, role-based menus. Nice-to-have: CSV export, photo upload, email results, charts. Rules: marks 0-100; pass >= 40 in every subject; attendance >= 75% to appear; roll number and email unique; a student enrolls once per course; grade A >= 75, B >= 60, C >= 50, D >= 40.',
    },
    {
      task: 'Add an Attendance table (one row per student per course per date with IsPresent BIT) to StudentMS and write a query that returns attendance % per student per course.',
      hint: 'UNIQUE (StudentId, CourseId, AttendanceDate); percentage = SUM(CASE WHEN IsPresent = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*).',
      solution: `CREATE TABLE Attendance (
    AttendanceId INT IDENTITY(1,1) PRIMARY KEY,
    StudentId INT NOT NULL FOREIGN KEY REFERENCES Students(StudentId),
    CourseId INT NOT NULL FOREIGN KEY REFERENCES Courses(CourseId),
    AttendanceDate DATE NOT NULL,
    IsPresent BIT NOT NULL,
    CONSTRAINT UQ_Attendance UNIQUE (StudentId, CourseId, AttendanceDate)
);
SELECT StudentId, CourseId,
       ROUND(SUM(CASE WHEN IsPresent = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 2) AS AttendancePct
FROM Attendance
GROUP BY StudentId, CourseId;`,
    },
    {
      task: 'Write the EmployeesController GET endpoint with search, departmentId filter, sortBy (name|salary|joiningDate), desc flag and paging.',
      hint: 'Whitelist sortBy with a switch expression so users cannot inject column names.',
      solution: `[HttpGet]
public async Task<ActionResult<PagedResult<EmployeeDto>>> GetAll(string? search, int? departmentId,
    string sortBy = "name", bool desc = false, int page = 1, int pageSize = 10)
{
    var q = db.Employees.AsNoTracking().Where(e => e.IsActive);
    if (!string.IsNullOrWhiteSpace(search)) q = q.Where(e => e.FullName.Contains(search) || e.EmpCode.Contains(search));
    if (departmentId is not null) q = q.Where(e => e.DepartmentId == departmentId);
    q = (sortBy.ToLower(), desc) switch
    {
        ("salary", false) => q.OrderBy(e => e.BasicSalary),
        ("salary", true) => q.OrderByDescending(e => e.BasicSalary),
        ("joiningdate", false) => q.OrderBy(e => e.JoiningDate),
        ("joiningdate", true) => q.OrderByDescending(e => e.JoiningDate),
        (_, true) => q.OrderByDescending(e => e.FullName),
        _ => q.OrderBy(e => e.FullName)
    };
    int total = await q.CountAsync();
    var items = await q.Skip((page - 1) * pageSize).Take(pageSize)
        .Select(e => new EmployeeDto(e.EmployeeId, e.EmpCode, e.FullName, e.Department!.Name, e.BasicSalary))
        .ToListAsync();
    return Ok(new PagedResult<EmployeeDto>(items, total, page, pageSize));
}`,
    },
    {
      task: 'Write two xUnit tests for PayrollService: one for an employee below the tax limit and one above it.',
      hint: 'Use [Fact] and Assert.Equal with decimal literals (m suffix).',
      solution: `public class PayrollServiceTests
{
    private readonly PayrollService _sut = new();

    [Fact]
    public void Below_limit_pays_no_tax()
    {
        var p = _sut.Generate(new Employee { EmpCode = "T1", BasicSalary = 55000m });
        Assert.Equal(71500m, p.Gross);
        Assert.Equal(0m, p.Tax);
        Assert.Equal(64900m, p.Net);
    }

    [Fact]
    public void Above_limit_pays_ten_percent_of_excess()
    {
        var p = _sut.Generate(new Employee { EmpCode = "T2", BasicSalary = 120000m });
        Assert.Equal(5600m, p.Tax);
        Assert.Equal(136000m, p.Net);
    }
}`,
    },
    {
      task: 'Create the React route configuration for the Employee Management System with a protected layout and role-based routes.',
      hint: 'Use a ProtectedRoute component that reads AuthContext and an Outlet-based Layout (Days 104 and 107).',
      solution: `<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route element={<ProtectedRoute />}>                     {/* any logged-in user */}
    <Route element={<Layout />}>
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/leaves" element={<MyLeaves />} />
      <Route path="/payslips/:id" element={<PayslipPage />} />
      <Route element={<ProtectedRoute roles={["Admin", "HR"]} />}>
        <Route path="/employees" element={<EmployeeList />} />
        <Route path="/employees/new" element={<EmployeeForm />} />
        <Route path="/employees/:id/edit" element={<EmployeeForm />} />
        <Route path="/payroll" element={<PayrollRun />} />
      </Route>
      <Route element={<ProtectedRoute roles={["Manager"]} />}>
        <Route path="/approvals" element={<LeaveApprovals />} />
      </Route>
    </Route>
  </Route>
  <Route path="*" element={<NotFound />} />
</Routes>`,
    },
  ],
  quiz: [
    {
      question: 'In the Student Management System, which table resolves the many-to-many relationship between Students and Courses?',
      options: ['Departments', 'Enrollments', 'Courses', 'Results'],
      answer: 1,
      explanation: 'Enrollments holds StudentId and CourseId foreign keys (unique together) plus Marks and AttendancePct.',
    },
    {
      question: 'Where should the payroll calculation (HRA, DA, PF, tax) be implemented?',
      options: ['In the React component', 'In the controller action', 'In a SQL trigger only', 'In a service class called by the controller'],
      answer: 3,
      explanation: 'A service class keeps one source of truth that can be reused and unit tested without HTTP or a database.',
    },
    {
      question: 'Which status code should POST /api/students return when the roll number already exists?',
      options: ['409 Conflict', '201 Created', '404 Not Found', '500 Internal Server Error'],
      answer: 0,
      explanation: '409 Conflict signals that the request conflicts with the current state of the resource (a duplicate).',
    },
    {
      question: 'How is the employee-manager relationship stored?',
      options: ['A separate database per manager', 'A comma-separated list of employee ids', 'A self-referencing foreign key ManagerId on Employees', 'A JSON column in Departments'],
      answer: 2,
      explanation: 'ManagerId references EmployeeId in the same table; a recursive CTE or EF navigation properties walk the hierarchy.',
    },
    {
      question: 'With the result rules from this lesson, a student with 91, 72, 68 marks but 60% attendance in one subject gets:',
      options: ['PASS with grade A', 'DEBARRED (attendance)', 'FAIL', 'Grade B'],
      answer: 1,
      explanation: 'The attendance rule (minimum 75% in every subject) is checked first, so the status is DEBARRED even though the percentage is 77.',
    },
  ],
};
