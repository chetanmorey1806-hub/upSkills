const crudSimCode = `using System;
using System.Collections.Generic;
using System.Linq;

var service = new StudentService();

Show(service.Create(new Student { Name = "Asha Patil", Email = "asha@college.com", Course = "BCA", Marks = 88 }));
Show(service.Create(new Student { Name = "Ravi Kumar", Email = "ravi@college.com", Course = "BSc", Marks = 72 }));
Show(service.Create(new Student { Name = "", Email = "ASHA@college.com", Course = "BCA", Marks = 120 }));
Console.WriteLine();
PrintAll(service);

Show(service.Update(2, new Student { Name = "Ravi Kumar", Email = "ravi@college.com", Course = "BCA", Marks = 79 }));
Show(service.Update(9, new Student { Name = "Nobody", Email = "x@college.com", Course = "BCA", Marks = 50 }));
Show(service.Delete(1));
Console.WriteLine();
PrintAll(service);

void Show(Result r)
{
    Console.WriteLine(r.Success ? $"OK   : {r.Message}" : $"FAIL : {r.Message}");
    foreach (var e in r.Errors)
        Console.WriteLine($"       - {e}");
}

void PrintAll(StudentService s)
{
    Console.WriteLine("Id | Name | Course | Marks");
    foreach (var st in s.GetAll())
        Console.WriteLine($"{st.Id} | {st.Name} | {st.Course} | {st.Marks}");
    Console.WriteLine();
}

// ================= types =================
class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public string Course { get; set; } = "";
    public int Marks { get; set; }
}

record Result(bool Success, string Message, List<string> Errors)
{
    public static Result Ok(string msg) => new(true, msg, new List<string>());
    public static Result Fail(string msg, List<string>? errors = null) => new(false, msg, errors ?? new List<string>());
}

class StudentService
{
    private readonly List<Student> _students = new();
    private int _nextId = 1;

    public List<Student> GetAll() => _students.OrderBy(s => s.Id).ToList();

    // Same rules as [Required], [Range] and a business rule (unique e-mail)
    private List<string> Validate(Student s, int? currentId)
    {
        var errors = new List<string>();
        if (string.IsNullOrWhiteSpace(s.Name)) errors.Add("Name is required");
        if (s.Marks < 0 || s.Marks > 100) errors.Add("Marks must be between 0 and 100");
        bool emailTaken = _students.Any(x => x.Id != currentId &&
            string.Equals(x.Email, s.Email, StringComparison.OrdinalIgnoreCase));
        if (emailTaken) errors.Add("Email already exists");
        return errors;
    }

    public Result Create(Student s)
    {
        var errors = Validate(s, null);
        if (errors.Count > 0) return Result.Fail("Validation failed", errors);
        s.Id = _nextId++;                       // id is used only when the insert succeeds
        _students.Add(s);
        return Result.Ok($"Student {s.Id} '{s.Name}' created");
    }

    public Result Update(int id, Student changes)
    {
        var existing = _students.FirstOrDefault(x => x.Id == id);
        if (existing == null) return Result.Fail($"Student {id} not found");
        var errors = Validate(changes, id);
        if (errors.Count > 0) return Result.Fail("Validation failed", errors);
        existing.Name = changes.Name;
        existing.Email = changes.Email;
        existing.Course = changes.Course;
        existing.Marks = changes.Marks;
        return Result.Ok($"Student {id} updated");
    }

    public Result Delete(int id)
    {
        int removed = _students.RemoveAll(x => x.Id == id);
        return removed == 0 ? Result.Fail($"Student {id} not found") : Result.Ok($"Student {id} deleted");
    }
}`;

const modelLayerCode = `// File: Models/Student.cs
using System.ComponentModel.DataAnnotations;
using StudentManagement.Validation;

namespace StudentManagement.Models;

public class Student
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Please enter the student name")]
    [StringLength(60, MinimumLength = 3, ErrorMessage = "Name must be 3-60 characters")]
    [Display(Name = "Full Name")]
    public string Name { get; set; } = "";

    [Required, EmailAddress]
    [Display(Name = "Email Address")]
    public string Email { get; set; } = "";

    [Required(ErrorMessage = "Please choose a course")]
    public string Course { get; set; } = "";

    [Range(0, 100, ErrorMessage = "Marks must be between 0 and 100")]
    public int Marks { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "Date of Birth")]
    [AgeRange(16, 60)]                                   // custom validation attribute
    public DateTime DateOfBirth { get; set; } = new DateTime(2005, 1, 1);

    [Phone, Display(Name = "Mobile")]
    public string? Phone { get; set; }

    public bool IsActive { get; set; } = true;

    // computed, not entered by the user
    public string Grade => Marks >= 75 ? "A" : Marks >= 60 ? "B" : Marks >= 35 ? "C" : "F";
}

// File: Validation/AgeRangeAttribute.cs
using System.ComponentModel.DataAnnotations;

namespace StudentManagement.Validation;

public class AgeRangeAttribute : ValidationAttribute
{
    private readonly int _min;
    private readonly int _max;

    public AgeRangeAttribute(int min, int max)
    {
        _min = min; _max = max;
        ErrorMessage = $"Age must be between {min} and {max} years";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is not DateTime dob) return ValidationResult.Success;   // [Required] handles empty
        var today = DateTime.Today;
        int age = today.Year - dob.Year;
        if (dob.Date > today.AddYears(-age)) age--;                       // birthday not reached yet
        return age >= _min && age <= _max
            ? ValidationResult.Success
            : new ValidationResult(ErrorMessage, new[] { context.MemberName! });
    }
}

// File: Models/StudentListViewModel.cs   (search + sort + paging data for the Index view)
namespace StudentManagement.Models;

public class StudentListViewModel
{
    public List<Student> Students { get; set; } = new();
    public string? Search { get; set; }
    public string? Course { get; set; }
    public string SortOrder { get; set; } = "name";
    public int Page { get; set; } = 1;
    public int TotalPages { get; set; }
    public int TotalCount { get; set; }
    public static readonly string[] Courses = { "BCA", "BSc", "BCom", "MCA", "MBA" };
}

// File: Services/IStudentRepository.cs
using StudentManagement.Models;

namespace StudentManagement.Services;

public interface IStudentRepository
{
    IEnumerable<Student> GetAll();
    Student? GetById(int id);
    bool EmailExists(string email, int? exceptId = null);
    void Add(Student student);
    bool Update(Student student);
    bool Delete(int id);
}

// File: Services/InMemoryStudentRepository.cs   (replaced by an EF Core repository on Day 81)
using StudentManagement.Models;

namespace StudentManagement.Services;

public class InMemoryStudentRepository : IStudentRepository
{
    private readonly List<Student> _students = new()
    {
        new Student { Id = 1, Name = "Asha Patil",  Email = "asha@college.com",  Course = "BCA", Marks = 88, DateOfBirth = new DateTime(2004, 5, 12) },
        new Student { Id = 2, Name = "Ravi Kumar",  Email = "ravi@college.com",  Course = "BSc", Marks = 72, DateOfBirth = new DateTime(2003, 9, 1) },
        new Student { Id = 3, Name = "Meena Shah",  Email = "meena@college.com", Course = "BCA", Marks = 91, DateOfBirth = new DateTime(2005, 1, 20) },
        new Student { Id = 4, Name = "John Dsouza", Email = "john@college.com",  Course = "BCom", Marks = 55, DateOfBirth = new DateTime(2004, 11, 3) },
        new Student { Id = 5, Name = "Fatima Khan", Email = "fatima@college.com", Course = "MCA", Marks = 67, DateOfBirth = new DateTime(2001, 2, 14) },
        new Student { Id = 6, Name = "Kiran Rao",   Email = "kiran@college.com", Course = "BSc", Marks = 34, DateOfBirth = new DateTime(2005, 7, 30) },
    };
    private readonly object _lock = new();

    public IEnumerable<Student> GetAll() { lock (_lock) return _students.ToList(); }

    public Student? GetById(int id) { lock (_lock) return _students.FirstOrDefault(s => s.Id == id); }

    public bool EmailExists(string email, int? exceptId = null)
    {
        lock (_lock)
            return _students.Any(s => s.Id != exceptId &&
                string.Equals(s.Email, email, StringComparison.OrdinalIgnoreCase));
    }

    public void Add(Student student)
    {
        lock (_lock)
        {
            student.Id = _students.Count == 0 ? 1 : _students.Max(s => s.Id) + 1;
            _students.Add(student);
        }
    }

    public bool Update(Student student)
    {
        lock (_lock)
        {
            int index = _students.FindIndex(s => s.Id == student.Id);
            if (index < 0) return false;
            _students[index] = student;
            return true;
        }
    }

    public bool Delete(int id)
    {
        lock (_lock) return _students.RemoveAll(s => s.Id == id) > 0;
    }
}

// File: Program.cs
using StudentManagement.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<IStudentRepository, InMemoryStudentRepository>();   // Scoped + EF Core later

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseDeveloperExceptionPage();
}
else
{
    app.UseExceptionHandler("/Error/500");
    app.UseHsts();
}
app.UseStatusCodePagesWithReExecute("/Error/{0}");     // 404, 403 ... -> ErrorController

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Students}/{action=Index}/{id?}");

app.Run();`;

const controllerCode = `// File: Controllers/StudentsController.cs
using Microsoft.AspNetCore.Mvc;
using StudentManagement.Models;
using StudentManagement.Services;

namespace StudentManagement.Controllers;

public class StudentsController : Controller
{
    private const int PageSize = 5;
    private readonly IStudentRepository _repo;
    private readonly ILogger<StudentsController> _logger;

    public StudentsController(IStudentRepository repo, ILogger<StudentsController> logger)
    {
        _repo = repo;
        _logger = logger;
    }

    // GET /Students?search=a&course=BCA&sortOrder=marks_desc&page=1
    public IActionResult Index(string? search, string? course, string sortOrder = "name", int page = 1)
    {
        IEnumerable<Student> query = _repo.GetAll();

        // 1) SEARCH (name or email contains text, case-insensitive)
        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(s => s.Name.Contains(search, StringComparison.OrdinalIgnoreCase)
                                  || s.Email.Contains(search, StringComparison.OrdinalIgnoreCase));

        // 2) FILTER by course
        if (!string.IsNullOrEmpty(course))
            query = query.Where(s => s.Course == course);

        // 3) SORT
        query = sortOrder switch
        {
            "name_desc" => query.OrderByDescending(s => s.Name),
            "marks" => query.OrderBy(s => s.Marks),
            "marks_desc" => query.OrderByDescending(s => s.Marks),
            _ => query.OrderBy(s => s.Name),
        };

        // 4) PAGE
        var list = query.ToList();
        int totalPages = Math.Max(1, (int)Math.Ceiling(list.Count / (double)PageSize));
        page = Math.Clamp(page, 1, totalPages);

        var vm = new StudentListViewModel
        {
            Students = list.Skip((page - 1) * PageSize).Take(PageSize).ToList(),
            Search = search,
            Course = course,
            SortOrder = sortOrder,
            Page = page,
            TotalPages = totalPages,
            TotalCount = list.Count,
        };
        return View(vm);
    }

    // GET /Students/Details/5
    public IActionResult Details(int? id)
    {
        if (id == null) return BadRequest();
        var student = _repo.GetById(id.Value);
        if (student == null)
        {
            _logger.LogWarning("Details: student {Id} not found", id);
            return NotFound();                       // -> /Error/404 page
        }
        return View(student);
    }

    // GET /Students/Create
    [HttpGet]
    public IActionResult Create() => View(new Student());

    // POST /Students/Create
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create([Bind("Name,Email,Course,Marks,DateOfBirth,Phone,IsActive")] Student student)
    {
        // business rule that DataAnnotations cannot check
        if (_repo.EmailExists(student.Email))
            ModelState.AddModelError(nameof(Student.Email), "This email is already registered");

        if (!ModelState.IsValid)
            return View(student);                    // show the form again with errors

        try
        {
            _repo.Add(student);
            _logger.LogInformation("Created student {Id} {Name}", student.Id, student.Name);
            TempData["Success"] = $"Student '{student.Name}' was added successfully.";
            return RedirectToAction(nameof(Index));  // Post-Redirect-Get
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating student {Name}", student.Name);
            ModelState.AddModelError(string.Empty, "Unable to save. Please try again.");
            return View(student);
        }
    }

    // GET /Students/Edit/5
    [HttpGet]
    public IActionResult Edit(int id)
    {
        var student = _repo.GetById(id);
        return student == null ? NotFound() : View(student);
    }

    // POST /Students/Edit/5
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Edit(int id, [Bind("Id,Name,Email,Course,Marks,DateOfBirth,Phone,IsActive")] Student student)
    {
        if (id != student.Id) return BadRequest();               // tampered form
        if (_repo.GetById(id) == null) return NotFound();

        if (_repo.EmailExists(student.Email, exceptId: id))
            ModelState.AddModelError(nameof(Student.Email), "This email is already registered");

        if (!ModelState.IsValid) return View(student);

        _repo.Update(student);
        TempData["Success"] = $"Student '{student.Name}' was updated.";
        return RedirectToAction(nameof(Details), new { id });
    }

    // GET /Students/Delete/5  (confirmation page - never delete on GET!)
    [HttpGet]
    public IActionResult Delete(int id)
    {
        var student = _repo.GetById(id);
        return student == null ? NotFound() : View(student);
    }

    // POST /Students/Delete/5
    [HttpPost, ActionName("Delete")]
    [ValidateAntiForgeryToken]
    public IActionResult DeleteConfirmed(int id)
    {
        var student = _repo.GetById(id);
        if (student == null) return NotFound();

        _repo.Delete(id);
        _logger.LogInformation("Deleted student {Id}", id);
        TempData["Success"] = $"Student '{student.Name}' was deleted.";
        return RedirectToAction(nameof(Index));
    }
}

// File: Controllers/ErrorController.cs
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace StudentManagement.Controllers;

[Route("Error")]
public class ErrorController : Controller
{
    private readonly ILogger<ErrorController> _logger;
    public ErrorController(ILogger<ErrorController> logger) => _logger = logger;

    [Route("{code:int}")]
    public IActionResult Index(int code)
    {
        if (code == 500)
        {
            var feature = HttpContext.Features.Get<IExceptionHandlerPathFeature>();
            if (feature != null)
                _logger.LogError(feature.Error, "Unhandled exception on {Path}", feature.Path);
        }

        ViewBag.Code = code;
        ViewBag.Title = code switch
        {
            404 => "Page not found",
            400 => "Bad request",
            403 => "Access denied",
            _ => "Something went wrong",
        };
        Response.StatusCode = code;
        return View("Error");          // Views/Error/Error.cshtml
    }
}`;

const viewsCode = `@* File: Views/_ViewImports.cshtml *@
@using StudentManagement
@using StudentManagement.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers

@* File: Views/Shared/_Layout.cshtml (only the parts you change) *@
<a class="navbar-brand" asp-controller="Students" asp-action="Index">Student Management</a>
...
<main class="container py-3">
    @if (TempData["Success"] is string ok)
    {
        <div class="alert alert-success alert-dismissible fade show">
            @ok
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    }
    @RenderBody()
</main>
...
@await RenderSectionAsync("Scripts", required: false)

@* File: Views/Students/Index.cshtml *@
@model StudentListViewModel
@{
    ViewData["Title"] = "Students";
    string NextSort(string col) => Model.SortOrder == col ? col + "_desc" : col;
}
<div class="d-flex justify-content-between align-items-center mb-3">
    <h2>Students <span class="badge bg-secondary">@Model.TotalCount</span></h2>
    <a asp-action="Create" class="btn btn-primary">+ Add Student</a>
</div>

<form asp-action="Index" method="get" class="row g-2 mb-3">
    <div class="col-md-5"><input name="search" value="@Model.Search" class="form-control" placeholder="Search name or email" /></div>
    <div class="col-md-3">
        <select name="course" class="form-select">
            <option value="">All courses</option>
            @foreach (var c in StudentListViewModel.Courses)
            {
                <option value="@c" selected="@(c == Model.Course)">@c</option>
            }
        </select>
    </div>
    <div class="col-md-2"><button class="btn btn-outline-primary w-100">Search</button></div>
    <div class="col-md-2"><a asp-action="Index" class="btn btn-outline-secondary w-100">Reset</a></div>
</form>

@if (!Model.Students.Any())
{
    <div class="alert alert-info">No students found.</div>
}
else
{
    <table class="table table-hover align-middle">
        <thead class="table-dark">
            <tr>
                <th><a class="text-white" asp-action="Index" asp-route-sortOrder="@NextSort("name")"
                       asp-route-search="@Model.Search" asp-route-course="@Model.Course">Name</a></th>
                <th>Email</th>
                <th>Course</th>
                <th><a class="text-white" asp-action="Index" asp-route-sortOrder="@NextSort("marks")"
                       asp-route-search="@Model.Search" asp-route-course="@Model.Course">Marks</a></th>
                <th>Grade</th>
                <th>Status</th>
                <th></th>
            </tr>
        </thead>
        <tbody>
        @foreach (var s in Model.Students)
        {
            <tr>
                <td>@s.Name</td>
                <td>@s.Email</td>
                <td>@s.Course</td>
                <td>@s.Marks</td>
                <td><span class="badge @(s.Grade == "F" ? "bg-danger" : "bg-success")">@s.Grade</span></td>
                <td>@(s.IsActive ? "Active" : "Inactive")</td>
                <td class="text-end">
                    <a asp-action="Details" asp-route-id="@s.Id" class="btn btn-sm btn-info">Details</a>
                    <a asp-action="Edit" asp-route-id="@s.Id" class="btn btn-sm btn-warning">Edit</a>
                    <a asp-action="Delete" asp-route-id="@s.Id" class="btn btn-sm btn-danger">Delete</a>
                </td>
            </tr>
        }
        </tbody>
    </table>

    <nav>
        <ul class="pagination">
            @for (int p = 1; p <= Model.TotalPages; p++)
            {
                <li class="page-item @(p == Model.Page ? "active" : "")">
                    <a class="page-link" asp-action="Index" asp-route-page="@p" asp-route-search="@Model.Search"
                       asp-route-course="@Model.Course" asp-route-sortOrder="@Model.SortOrder">@p</a>
                </li>
            }
        </ul>
    </nav>
}

@* File: Views/Students/_StudentForm.cshtml  (partial view shared by Create and Edit) *@
@model Student
<div asp-validation-summary="ModelOnly" class="text-danger"></div>
<div class="row">
    <div class="col-md-6 mb-3">
        <label asp-for="Name" class="form-label"></label>
        <input asp-for="Name" class="form-control" />
        <span asp-validation-for="Name" class="text-danger"></span>
    </div>
    <div class="col-md-6 mb-3">
        <label asp-for="Email" class="form-label"></label>
        <input asp-for="Email" class="form-control" />
        <span asp-validation-for="Email" class="text-danger"></span>
    </div>
    <div class="col-md-4 mb-3">
        <label asp-for="Course" class="form-label"></label>
        <select asp-for="Course" asp-items="@(new SelectList(StudentListViewModel.Courses))" class="form-select">
            <option value="">-- select --</option>
        </select>
        <span asp-validation-for="Course" class="text-danger"></span>
    </div>
    <div class="col-md-4 mb-3">
        <label asp-for="Marks" class="form-label"></label>
        <input asp-for="Marks" class="form-control" />
        <span asp-validation-for="Marks" class="text-danger"></span>
    </div>
    <div class="col-md-4 mb-3">
        <label asp-for="DateOfBirth" class="form-label"></label>
        <input asp-for="DateOfBirth" class="form-control" />
        <span asp-validation-for="DateOfBirth" class="text-danger"></span>
    </div>
    <div class="col-md-6 mb-3">
        <label asp-for="Phone" class="form-label"></label>
        <input asp-for="Phone" class="form-control" />
        <span asp-validation-for="Phone" class="text-danger"></span>
    </div>
    <div class="col-md-6 mb-3 form-check pt-4">
        <input asp-for="IsActive" class="form-check-input" />
        <label asp-for="IsActive" class="form-check-label">Active student</label>
    </div>
</div>

@* File: Views/Students/Create.cshtml *@
@model Student
@{ ViewData["Title"] = "Add Student"; }
<h2>Add Student</h2>
<form asp-action="Create" method="post">
    <partial name="_StudentForm" model="Model" />
    <button type="submit" class="btn btn-success">Save</button>
    <a asp-action="Index" class="btn btn-secondary">Cancel</a>
</form>
@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}

@* File: Views/Students/Edit.cshtml *@
@model Student
@{ ViewData["Title"] = "Edit Student"; }
<h2>Edit: @Model.Name</h2>
<form asp-action="Edit" asp-route-id="@Model.Id" method="post">
    <input type="hidden" asp-for="Id" />
    <partial name="_StudentForm" model="Model" />
    <button type="submit" class="btn btn-warning">Update</button>
    <a asp-action="Details" asp-route-id="@Model.Id" class="btn btn-secondary">Cancel</a>
</form>
@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}

@* File: Views/Students/Details.cshtml *@
@model Student
@{ ViewData["Title"] = Model.Name; }
<div class="card" style="max-width: 32rem">
    <div class="card-header"><h4 class="mb-0">@Model.Name</h4></div>
    <dl class="row card-body mb-0">
        <dt class="col-sm-5">@Html.DisplayNameFor(m => m.Email)</dt><dd class="col-sm-7">@Model.Email</dd>
        <dt class="col-sm-5">Course</dt><dd class="col-sm-7">@Model.Course</dd>
        <dt class="col-sm-5">Marks / Grade</dt><dd class="col-sm-7">@Model.Marks / @Model.Grade</dd>
        <dt class="col-sm-5">@Html.DisplayNameFor(m => m.DateOfBirth)</dt><dd class="col-sm-7">@Model.DateOfBirth.ToString("dd-MM-yyyy")</dd>
        <dt class="col-sm-5">Mobile</dt><dd class="col-sm-7">@(Model.Phone ?? "-")</dd>
        <dt class="col-sm-5">Status</dt><dd class="col-sm-7">@(Model.IsActive ? "Active" : "Inactive")</dd>
    </dl>
</div>
<a asp-action="Edit" asp-route-id="@Model.Id" class="btn btn-warning mt-3">Edit</a>
<a asp-action="Index" class="btn btn-secondary mt-3">Back to list</a>

@* File: Views/Students/Delete.cshtml *@
@model Student
@{ ViewData["Title"] = "Delete Student"; }
<h2 class="text-danger">Delete student?</h2>
<p>Are you sure you want to delete <b>@Model.Name</b> (@Model.Email)? This cannot be undone.</p>
<form asp-action="Delete" asp-route-id="@Model.Id" method="post">
    <button type="submit" class="btn btn-danger">Yes, delete</button>
    <a asp-action="Index" class="btn btn-secondary">No, go back</a>
</form>

@* File: Views/Error/Error.cshtml *@
@{ ViewData["Title"] = ViewBag.Title; }
<div class="text-center py-5">
    <h1 class="display-3">@ViewBag.Code</h1>
    <h3>@ViewBag.Title</h3>
    <p>Sorry, we could not process your request.</p>
    <a asp-controller="Students" asp-action="Index" class="btn btn-primary">Go to student list</a>
</div>`;

const testsCode = `// Manual test checklist - run with Ctrl+F5 and try each row

| # | Action                                   | Input                                  | Expected
|---|------------------------------------------|----------------------------------------|-------------------------------------------
| 1 | Open /                                   | -                                      | Students list, 6 students, page 1 of 2
| 2 | Search                                   | search = "ra"                          | Kiran Rao, Ravi Kumar (name contains "ra")
| 3 | Filter + sort                            | course = BCA, click Marks twice        | Meena (91), Asha (88)
| 4 | Create - empty form                      | click Save                             | client-side errors, no request sent
| 5 | Create - JavaScript disabled             | empty form                             | server errors (ModelState) shown
| 6 | Create - duplicate email                 | ASHA@college.com                       | "This email is already registered"
| 7 | Create - too young                       | DOB = 2015-01-01                       | "Age must be between 16 and 60 years"
| 8 | Create - valid                           | Neha Joshi, neha@college.com, MBA, 81  | redirect to list + green message, total 7
| 9 | Edit - change marks                      | Ravi -> 79                             | Details page + "was updated"
|10 | Edit - tamper id (F12 change hidden Id)  | Id = 99                                | 400 Bad request page
|11 | Details of missing id                    | /Students/Details/999                  | 404 "Page not found" page
|12 | Delete                                   | Delete Kiran -> Yes, delete            | list without Kiran + message
|13 | Unknown URL                              | /abc/xyz                               | 404 page
|14 | Production error                         | set ASPNETCORE_ENVIRONMENT=Production, | 500 "Something went wrong" page,
|   |                                          | throw in an action                     | exception logged in console`;

export default {
  id: 'day-077-mvc-crud-student-management-system',
  title: 'MVC CRUD Application: Complete Student Management System',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 77,
  level: 'Intermediate',
  duration: '3.5 hours',
  summary: `Today you put all of Module 6 together and build a complete Student Management System in ASP.NET Core MVC: a model with Data Annotations and a custom validation attribute, a repository injected with DI, a controller with full Create-Read-Update-Delete actions, search, filter, sort and paging, Razor views with Tag Helpers and a shared partial form, client- and server-side validation, TempData success messages, the Post-Redirect-Get pattern, and proper error handling with 400/404/500 pages and logging. The data is kept in memory today; in Module 7 you will swap the repository for EF Core and SQL Server without touching the controller or views.`,
  objectives: [
    'Design the folder structure and layers of an MVC CRUD application (Model, Repository/Service, Controller, Views)',
    'Implement Index, Details, Create, Edit and Delete actions with correct HTTP verbs, anti-forgery tokens and Post-Redirect-Get',
    'Validate input with Data Annotations, a custom ValidationAttribute, business rules via ModelState.AddModelError, and client-side validation',
    'Handle errors correctly: BadRequest, NotFound, try/catch with logging, UseExceptionHandler and status code pages',
    'Add search, filter, sorting and paging to the list page and protect against over-posting with [Bind]/view models',
  ],
  theory: [
    {
      heading: 'Architecture of the Student Management System',
      content: `**Features**: list students with search/filter/sort/paging, view details, add, edit, delete with confirmation, validation messages, success messages, friendly error pages.

**Folder structure**
\`\`\`
StudentManagement/
 |-- Controllers/   StudentsController.cs, ErrorController.cs
 |-- Models/        Student.cs, StudentListViewModel.cs
 |-- Services/      IStudentRepository.cs, InMemoryStudentRepository.cs
 |-- Validation/    AgeRangeAttribute.cs
 |-- Views/
 |    |-- Students/ Index, Details, Create, Edit, Delete, _StudentForm (partial)
 |    |-- Error/    Error.cshtml
 |    |-- Shared/   _Layout, _ValidationScriptsPartial
 |-- wwwroot/       css, js, lib (bootstrap, jquery-validation)
 |-- Program.cs, appsettings.json
\`\`\`

**Request flow**: Browser → Routing → \`StudentsController\` action → \`IStudentRepository\` (injected) → model → Razor view → HTML.

The controller depends only on the **interface** \`IStudentRepository\`. Today the implementation is an in-memory list (Singleton). On Day 81 you write \`EfStudentRepository\` using \`AppDbContext\` and change ONE line in Program.cs to \`AddScoped<IStudentRepository, EfStudentRepository>()\`.`,
    },
    {
      heading: 'CRUD actions, HTTP verbs and Post-Redirect-Get',
      content: `| Operation | URL | Verb | Action | Returns |
|---|---|---|---|---|
| List | /Students | GET | Index(search, course, sortOrder, page) | View(list view model) |
| Read one | /Students/Details/5 | GET | Details(id) | View or NotFound |
| Show add form | /Students/Create | GET | Create() | View(new Student()) |
| Save new | /Students/Create | POST | Create(Student) | Redirect to Index, or View with errors |
| Show edit form | /Students/Edit/5 | GET | Edit(id) | View(student) or NotFound |
| Save changes | /Students/Edit/5 | POST | Edit(id, Student) | Redirect to Details, or View with errors |
| Confirm delete | /Students/Delete/5 | GET | Delete(id) | View(student) |
| Delete | /Students/Delete/5 | POST | DeleteConfirmed(id) with [ActionName("Delete")] | Redirect to Index |

**Rules**
- **Never change data on GET** (links can be crawled, prefetched or clicked by accident). Delete is a GET confirmation page + POST.
- Every POST action has \`[ValidateAntiForgeryToken]\`; the form Tag Helper adds the hidden token automatically.
- **Post-Redirect-Get (PRG)**: after a successful POST, \`RedirectToAction\` instead of returning a view. Refreshing the page then repeats a harmless GET, not the POST (no duplicate students), and TempData carries the success message.
- Two actions cannot have the same C# signature – that is why the POST delete method is named \`DeleteConfirmed\` and mapped with \`[ActionName("Delete")]\`.`,
    },
    {
      heading: 'Validation at three levels',
      content: `1. **Data Annotations** on the model (\`[Required]\`, \`[StringLength]\`, \`[EmailAddress]\`, \`[Range]\`, \`[Phone]\`, \`[DataType]\`, \`[Display]\`). They run during model binding and fill **ModelState**.

2. **Custom validation attribute** – derive from \`ValidationAttribute\` and override \`IsValid(object? value, ValidationContext context)\`. Our \`[AgeRange(16, 60)]\` checks the date of birth. (Alternative: implement \`IValidatableObject\` on the model for rules that compare several properties.)

3. **Business rules in the controller/service** – things that need data, e.g. "email must be unique": \`ModelState.AddModelError("Email", "This email is already registered")\`. Use \`string.Empty\` as key for model-level errors shown in \`asp-validation-summary="ModelOnly"\`.

**Client-side validation**: the input Tag Helpers emit \`data-val-*\` attributes; including \`_ValidationScriptsPartial\` (jQuery Validation + Unobtrusive) checks the form in the browser before sending. It is only a convenience – the **server check \`if (!ModelState.IsValid)\` is mandatory** because users can disable JavaScript or post with Postman. Custom attributes validate on the server only unless you also implement \`IClientModelValidator\`.

**Over-posting protection**: a user could add extra form fields (e.g. \`IsAdmin=true\`). Limit bound properties with \`[Bind("Name,Email,...")]\`, or better, use a dedicated **view model / DTO** containing only editable fields.`,
    },
    {
      heading: 'Error handling strategy',
      content: `| Situation | What we do | User sees |
|---|---|---|
| Invalid input | \`return View(model)\` with ModelState errors | form with red messages |
| Id missing or route/form id mismatch | \`return BadRequest()\` (400) | "Bad request" page |
| Record not found | \`return NotFound()\` (404) + LogWarning | "Page not found" page |
| Expected failure while saving | try/catch, \`LogError(ex, ...)\`, \`ModelState.AddModelError("", ...)\` | form + "Unable to save" |
| Unexpected exception | let it bubble → \`UseExceptionHandler("/Error/500")\` + log | "Something went wrong" page |
| Unknown URL | \`UseStatusCodePagesWithReExecute("/Error/{0}")\` | 404 page |

In **Development** the Developer Exception Page shows details; in **Production** users never see stack traces. \`ErrorController\` reads \`IExceptionHandlerPathFeature\` to log the original exception and path. Remember from Day 76: an exception filter could also handle action exceptions globally.

**Concurrency note**: if two admins edit the same student at the same time, the last save wins. EF Core solves this with a \`[Timestamp]\` RowVersion column (Extra 50).`,
    },
    {
      heading: 'Search, filter, sort and paging',
      content: `All four use **query-string parameters** with a GET form, so the URL can be bookmarked and shared: \`/Students?search=ra&course=BSc&sortOrder=marks_desc&page=2\`.

- **Search**: \`Where(s => s.Name.Contains(search, StringComparison.OrdinalIgnoreCase))\`
- **Filter**: \`Where(s => s.Course == course)\`
- **Sort**: a \`switch\` expression on sortOrder chooses \`OrderBy\` / \`OrderByDescending\`; clicking a header toggles between "marks" and "marks_desc".
- **Paging**: \`Skip((page - 1) * pageSize).Take(pageSize)\`; total pages = \`Math.Ceiling(count / (double)pageSize)\`; clamp the page number so ?page=999 does not break.
- Keep the current search/course/sort in every link with \`asp-route-*\` so they are not lost when changing page.

The order matters: **filter → sort → page**. With EF Core (Day 85) the same LINQ runs in SQL Server as WHERE, ORDER BY and OFFSET/FETCH, so only one page of rows is loaded.`,
      tip: 'Build the app in small steps and run after each step: model + repository → Index → Details → Create → Edit → Delete → search/paging → error pages.',
    },
  ],
  examples: [
    {
      title: 'Step 1: Project, model with validation, repository and Program.cs',
      scenario: 'Create the project and the back-end layer: the Student model (with a custom AgeRange attribute), a list view model, the repository interface with an in-memory implementation seeded with 6 students, and Program.cs with DI and error handling.',
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Next',
        'Project name: StudentManagement > Next > Framework .NET 8 (LTS) or .NET 10 (LTS), Authentication type: None, Configure for HTTPS ticked > Create',
        'Delete Controllers/HomeController.cs and the Views/Home folder (optional - we use Students as the default controller)',
        'Right-click Models > Add > Class > Student.cs, then StudentListViewModel.cs; paste the code',
        'Right-click project > Add > New Folder > Validation; add AgeRangeAttribute.cs',
        'Add a Services folder with IStudentRepository.cs (Add > New Item > Interface) and InMemoryStudentRepository.cs',
        'Replace Program.cs with the code below',
        'Build with Ctrl+Shift+B and fix any red squiggles (Ctrl+. offers missing usings)',
        'CLI alternative: dotnet new mvc -n StudentManagement && cd StudentManagement && dotnet build',
      ],
      code: modelLayerCode,
      result: `Build succeeded.
    0 Warning(s)
    0 Error(s)

(Running now gives a 404 page for "/" because StudentsController does not exist yet - it is added in Step 2.)`,
      explanation: `The model carries all simple validation rules, so every form that edits a Student gets them for free. The AgeRange attribute shows how to write your own rule: return ValidationResult.Success or a ValidationResult with the member name so the message appears next to the right field. The repository hides how data is stored; it is a Singleton with lock because the in-memory list is shared by all users. Program.cs registers the repository, uses the Developer Exception Page in Development and the /Error/500 page in Production, re-executes 404s to /Error/404, and makes Students/Index the default route.`,
    },
    {
      title: 'Step 2: StudentsController with full CRUD, search, sort, paging and error handling',
      scenario: 'Write every action of the controller, plus an ErrorController for 400/404/500 pages.',
      steps: [
        'Right-click Controllers > Add > Controller > MVC Controller - Empty > Add > name it StudentsController.cs',
        'Paste the StudentsController code',
        'Add another empty MVC controller named ErrorController.cs and paste its code',
        'Tip: Visual Studio can also scaffold a CRUD controller: Add > Controller > "MVC Controller with views, using Entity Framework" – we will use that with EF Core in Module 7; today we write it by hand to understand every line',
        'Build (Ctrl+Shift+B)',
      ],
      code: controllerCode,
      result: `Build succeeded.
Routes now available:
GET  /Students                     GET  /Students/Details/{id}
GET  /Students/Create              POST /Students/Create
GET  /Students/Edit/{id}           POST /Students/Edit/{id}
GET  /Students/Delete/{id}         POST /Students/Delete/{id}
GET  /Error/{code}`,
      explanation: `Index builds one LINQ query: search, then course filter, then sort, then paging, and fills a view model. Create and Edit add the "unique email" business rule to ModelState, return the same view when invalid, and redirect with a TempData message when valid (PRG). [Bind] limits which properties can be posted. Edit checks that the route id matches the posted Id (400 otherwise) and that the record exists (404). Delete uses a GET confirmation page and a POST action named DeleteConfirmed but exposed as "Delete" with [ActionName]. ErrorController uses attribute routing so /Error/404 and /Error/500 both reach the same action, logs unhandled exceptions and keeps the correct status code.`,
    },
    {
      title: 'Step 3: Razor views – list, shared form partial, create, edit, details, delete, error',
      scenario: 'Create all the views with Tag Helpers, Bootstrap 5 and client-side validation, and show TempData messages in the layout.',
      steps: [
        'Check Views/_ViewImports.cshtml contains the @using lines and @addTagHelper',
        'Right-click the Index action in StudentsController > Add View > Razor View - Empty > Index.cshtml; paste the markup. Repeat for Details, Create, Edit and Delete',
        'Right-click Views/Students > Add > View > name _StudentForm, tick "Create as a partial view"; paste the partial',
        'Create folder Views/Error and add Error.cshtml',
        'Edit Views/Shared/_Layout.cshtml: change the navbar brand and add the TempData alert above @RenderBody()',
        'Press Ctrl+F5. The browser opens /Students',
        'Try: search "ra", filter BCA, click the Marks header twice, go to page 2, add/edit/delete a student, submit an empty form',
      ],
      code: viewsCode,
      result: `/Students (page 1 of 2, sorted by name, 5 per page):
Students [6]                                   [+ Add Student]
Name         Email               Course  Marks  Grade  Status
Asha Patil   asha@college.com    BCA     88     A      Active   [Details][Edit][Delete]
Fatima Khan  fatima@college.com  MCA     67     B      Active
John Dsouza  john@college.com    BCom    55     C      Active
Kiran Rao    kiran@college.com   BSc     34     F      Active   (red badge)
Meena Shah   meena@college.com   BCA     91     A      Active
Pagination: [1] 2        (page 2 shows Ravi Kumar)

Search "ra" -> Kiran Rao, Ravi Kumar
Course BCA + Marks sorted descending -> Meena Shah 91, Asha Patil 88

Create with empty form -> red messages without a server round-trip:
  "Please enter the student name", "The Email Address field is required.", "Please choose a course"
Create with email ASHA@college.com -> after Save: "This email is already registered"
Create with DOB 01-01-2015 -> "Age must be between 16 and 60 years" (server-side)
Valid save -> redirected to /Students with green "Student 'Neha Joshi' was added successfully." and badge [7]
/Students/Details/999 -> "404 Page not found" page`,
      explanation: `The list page uses a GET form so search/filter values appear in the URL, and every sort/page link repeats them with asp-route-*. The NextSort helper (a local function in the Razor code block) toggles between ascending and descending. Create and Edit share _StudentForm, so validation markup is written once. asp-validation-summary="ModelOnly" shows errors added with an empty key, while asp-validation-for shows field errors. _ValidationScriptsPartial enables client-side checks for built-in attributes; the custom AgeRange and the unique email are checked on the server. Razor encodes all output, protecting against XSS.`,
    },
    {
      title: 'Business rules and CRUD logic tested in a console app',
      scenario: 'Before wiring UI, verify the rules of the system (required name, marks 0-100, unique email ignoring case, update/delete of missing ids) with a console version of the service.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > name it StudentCrudLogic',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5',
        'Add an Update that changes Ravi\'s email to asha@college.com BEFORE the delete and predict the result',
      ],
      code: crudSimCode,
      csharp: { files: { 'Program.cs': crudSimCode }, stdin: '' },
      result: `OK   : Student 1 'Asha Patil' created
OK   : Student 2 'Ravi Kumar' created
FAIL : Validation failed
       - Name is required
       - Marks must be between 0 and 100
       - Email already exists

Id | Name | Course | Marks
1 | Asha Patil | BCA | 88
2 | Ravi Kumar | BSc | 72

OK   : Student 2 updated
FAIL : Student 9 not found
OK   : Student 1 deleted

Id | Name | Course | Marks
2 | Ravi Kumar | BCA | 79
`,
      explanation: `The third create fails with three errors: empty name, marks 120 and "ASHA@college.com", which matches Asha's email because the comparison is case-insensitive. The id counter is only incremented on success, so there is no gap. Update first checks that the student exists (Student 9 -> not found), then validates while EXCLUDING its own id from the email check – otherwise Ravi could never be saved with his own email. This is the same logic the MVC controller implements with ModelState, NotFound() and IStudentRepository.EmailExists(email, exceptId). Prediction for the extra step: "FAIL : Validation failed - Email already exists".`,
    },
    {
      title: 'Step 4: Test checklist and switching to Production',
      scenario: 'A professional developer tests every path, including errors. Use this checklist to test the finished application in Development and Production.',
      steps: [
        'Press Ctrl+F5 and go through rows 1-13 of the checklist',
        'For row 5: F12 > Settings (gear) > Debugger > Disable JavaScript (Chrome/Edge), reload and submit an empty form',
        'For row 10: on the Edit page press F12 > Elements, find <input type="hidden" id="Id"> and change its value to 99, then click Update',
        'For row 14: temporarily add throw new Exception("Test"); at the start of Index, open Properties/launchSettings.json and set ASPNETCORE_ENVIRONMENT to Production, run with Ctrl+F5, then undo both changes',
        'Watch the console window for the info / warn / fail log lines',
      ],
      code: testsCode,
      result: `All 14 checks pass:
- rows 4-7: validation messages appear and no student is added
- row 8: total becomes 7 and the success alert is shown once (refresh removes it)
- row 10: 400 "Bad request" page (route id 2 != posted Id 99)
- rows 11, 13: 404 page with status code 404 (F12 > Network)
- row 14 (Production): "500 Something went wrong" page; console shows
  fail: StudentManagement.Controllers.ErrorController[0] Unhandled exception on /Students
        System.Exception: Test ...`,
      explanation: `Testing both the happy path and the failure paths is what separates a demo from a real application. Server-side validation is proven by disabling JavaScript; tampering protection by changing the hidden Id; error pages by unknown URLs and a forced exception in Production. Next module: replace InMemoryStudentRepository with EF Core + SQL Server (Days 78-85) – the controller, views and these tests stay the same.`,
    },
  ],
  interview: [
    { q: 'What does CRUD stand for and which HTTP verbs map to it in MVC?', a: 'Create, Read, Update, Delete. In MVC forms: GET for reading and showing forms, POST for create, update and delete (HTML forms only support GET/POST; APIs use PUT/PATCH/DELETE).', level: 'Easy' },
    { q: 'What is the Post-Redirect-Get pattern and why use it?', a: 'After a successful POST the server returns a redirect to a GET page. Refreshing then repeats the GET, not the POST, preventing duplicate submissions, and TempData can carry a success message.', level: 'Easy' },
    { q: 'Why should you never delete data on a GET request?', a: 'GET must be safe; links can be prefetched, crawled by bots or opened by accident, and GET is not protected by anti-forgery tokens. Use a GET confirmation page and a POST to delete.', level: 'Medium' },
    { q: 'Why is the POST delete action called DeleteConfirmed with [ActionName("Delete")]?', a: 'Both GET and POST Delete would have the same C# signature Delete(int id), which is not allowed. Renaming the method and mapping it with [ActionName("Delete")] keeps the URL /Students/Delete/5.', level: 'Medium' },
    { q: 'What is ModelState and when is it filled?', a: 'A dictionary of model binding and validation results per field. It is filled during model binding before the action runs; ModelState.IsValid is false if any error exists. You can add errors with AddModelError.', level: 'Easy' },
    { q: 'How do you add a validation error that DataAnnotations cannot check (e.g. unique email)?', a: 'Check in the controller/service and call ModelState.AddModelError("Email", "message"), then return the view.', level: 'Easy' },
    { q: 'How do you write a custom validation attribute?', a: 'Derive from ValidationAttribute and override IsValid(object? value, ValidationContext context), returning ValidationResult.Success or new ValidationResult(message, memberNames).', level: 'Medium' },
    { q: 'Is client-side validation enough?', a: 'No. It can be bypassed (JavaScript disabled, Postman, curl). Always check ModelState.IsValid on the server.', level: 'Easy' },
    { q: 'What is over-posting and how do you prevent it?', a: 'A user posts extra fields that bind to properties they should not change (e.g. IsAdmin). Prevent with view models/DTOs containing only editable fields, [Bind] include lists, or [BindNever].', level: 'Hard' },
    { q: 'What should an action return when the record is not found? When the route id and form id differ?', a: 'NotFound() (404) for a missing record; BadRequest() (400) for mismatched or invalid ids.', level: 'Medium' },
    { q: 'What is the difference between UseExceptionHandler and UseStatusCodePagesWithReExecute?', a: 'UseExceptionHandler catches unhandled exceptions and re-executes an error path (500). UseStatusCodePagesWithReExecute handles error status codes without a body, like 404 from NotFound() or unknown URLs.', level: 'Medium' },
    { q: 'Why use a partial view for the Create and Edit forms?', a: 'Both forms have the same fields and validation markup; a partial (_StudentForm) avoids duplication so changes are made in one place.', level: 'Easy' },
    { q: 'In what order should search, sort and paging be applied, and why?', a: 'Filter/search first, then sort, then Skip/Take. Paging before filtering would give wrong pages and counts; sorting must happen before paging so pages are consistent.', level: 'Medium' },
    { q: 'Output question: 12 students, page size 5. How many pages, and which students (by position) are on page 3?', a: '3 pages (Ceiling(12/5.0) = 3). Page 3 shows positions 11 and 12 (Skip 10, Take 5).', level: 'Medium' },
    { q: 'How would you switch this app from in-memory storage to SQL Server?', a: 'Create an EF Core DbContext and an EfStudentRepository implementing IStudentRepository, register AddDbContext and AddScoped<IStudentRepository, EfStudentRepository>() – controllers and views do not change thanks to DI and the interface.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Add a "Toggle Active" POST action that switches IsActive for a student and returns to the list with a message.',
      hint: 'Use a small form with a button in the Index row; [HttpPost, ValidateAntiForgeryToken].',
      solution: `[HttpPost, ValidateAntiForgeryToken]
public IActionResult ToggleActive(int id)
{
    var s = _repo.GetById(id);
    if (s == null) return NotFound();
    s.IsActive = !s.IsActive;
    _repo.Update(s);
    TempData["Success"] = $"{s.Name} is now {(s.IsActive ? "active" : "inactive")}.";
    return RedirectToAction(nameof(Index));
}
// Index.cshtml inside the row
<form asp-action="ToggleActive" asp-route-id="@s.Id" method="post" class="d-inline">
    <button class="btn btn-sm btn-outline-dark">Toggle</button>
</form>`,
    },
    {
      task: 'Replace the [Bind] attribute in Create with a StudentCreateViewModel that has only the editable fields, and map it to Student in the action.',
      hint: 'Copy the validation attributes to the view model; create a new Student from it after validation.',
      solution: `public class StudentCreateViewModel
{
    [Required, StringLength(60, MinimumLength = 3)] public string Name { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Course { get; set; } = "";
    [Range(0, 100)] public int Marks { get; set; }
    [DataType(DataType.Date), AgeRange(16, 60)] public DateTime DateOfBirth { get; set; } = new(2005, 1, 1);
}
[HttpPost, ValidateAntiForgeryToken]
public IActionResult Create(StudentCreateViewModel vm)
{
    if (_repo.EmailExists(vm.Email)) ModelState.AddModelError(nameof(vm.Email), "This email is already registered");
    if (!ModelState.IsValid) return View(vm);
    var s = new Student { Name = vm.Name, Email = vm.Email, Course = vm.Course, Marks = vm.Marks, DateOfBirth = vm.DateOfBirth };
    _repo.Add(s);
    TempData["Success"] = $"Student '{s.Name}' was added successfully.";
    return RedirectToAction(nameof(Index));
}`,
    },
    {
      task: 'Add a Statistics page (/Students/Stats) showing total students, average marks (2 decimals), top scorer and count per course.',
      hint: 'Use LINQ Average, MaxBy and GroupBy; format with ToString("0.00", CultureInfo.InvariantCulture).',
      solution: `public IActionResult Stats()
{
    var all = _repo.GetAll().ToList();
    ViewBag.Total = all.Count;
    ViewBag.Average = all.Count == 0 ? "0.00" : all.Average(s => s.Marks).ToString("0.00", CultureInfo.InvariantCulture);
    ViewBag.Top = all.MaxBy(s => s.Marks)?.Name ?? "-";
    ViewBag.PerCourse = all.GroupBy(s => s.Course).Select(g => $"{g.Key}: {g.Count()}").ToList();
    return View();
}`,
    },
    {
      task: 'Implement IValidatableObject on Student so that a student with Course "MCA" or "MBA" must have Marks >= 50.',
      hint: 'Validate(ValidationContext) returns IEnumerable<ValidationResult>; use yield return.',
      solution: `public class Student : IValidatableObject
{
    // ... properties ...
    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if ((Course == "MCA" || Course == "MBA") && Marks < 50)
            yield return new ValidationResult("PG students need at least 50 marks", new[] { nameof(Marks) });
    }
}`,
    },
    {
      task: 'Add an "Export CSV" button on the list page that downloads all students as students.csv.',
      hint: 'Build the text with StringBuilder and return File(bytes, "text/csv", "students.csv").',
      solution: `public IActionResult ExportCsv()
{
    var sb = new StringBuilder();
    sb.AppendLine("Id,Name,Email,Course,Marks,Grade");
    foreach (var s in _repo.GetAll().OrderBy(s => s.Id))
        sb.AppendLine($"{s.Id},{s.Name},{s.Email},{s.Course},{s.Marks},{s.Grade}");
    return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv", "students.csv");
}
// Index.cshtml
<a asp-action="ExportCsv" class="btn btn-outline-success">Export CSV</a>`,
    },
  ],
  quiz: [
    {
      question: 'After a successful POST Create, what should the action return according to Post-Redirect-Get?',
      options: ['View(student)', 'RedirectToAction("Index")', 'Content("Saved")', 'Json(student)'],
      answer: 1,
      explanation: 'Redirecting makes the browser do a GET, so a refresh does not resubmit the form.',
    },
    {
      question: 'How do you show the error "This email is already registered" next to the Email field?',
      options: ['ViewBag.Email = "..."', 'throw new ValidationException()', 'TempData["Email"] = "..."', 'ModelState.AddModelError("Email", "This email is already registered")'],
      answer: 3,
      explanation: 'AddModelError with the property name puts the message into ModelState, shown by asp-validation-for="Email".',
    },
    {
      question: 'Why does the POST Delete method need [ActionName("Delete")]?',
      options: ['Because GET and POST Delete(int id) would have identical C# signatures', 'Because POST methods cannot be named Delete', 'To enable anti-forgery', 'To make it return 404'],
      answer: 0,
      explanation: 'The method is renamed DeleteConfirmed for C#, and [ActionName] keeps the URL /Students/Delete/{id}.',
    },
    {
      question: 'The Edit form posts Id = 99 but the URL is /Students/Edit/2. What should the action return?',
      options: ['Update student 99', 'Update student 2', 'BadRequest()', 'RedirectToAction("Index")'],
      answer: 2,
      explanation: 'A mismatch means the form was tampered with or is inconsistent; 400 Bad Request is correct.',
    },
    {
      question: 'With 13 students and a page size of 5, which LINQ returns page 3?',
      options: ['Skip(3).Take(5)', 'Skip(15).Take(5)', 'Take(5).Skip(10)', 'Skip(10).Take(5)'],
      answer: 3,
      explanation: 'Skip((3 - 1) * 5) = Skip(10), then Take(5) returns the last 3 students.',
    },
  ],
};
