export default {
  id: 'day-069-razor-pages-viewdata-viewbag-tempdata',
  title: 'Razor Pages, ViewData, ViewBag, TempData and Strongly Typed Views',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 69,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Learn every way to pass data to a view: the weakly typed ViewData dictionary and its dynamic twin ViewBag, TempData that survives a redirect, and the recommended strongly typed model / ViewModel approach with @model. Then meet Razor Pages – the page-focused alternative to MVC – with @page, PageModel, OnGet/OnPost handlers, [BindProperty], named handlers and RedirectToPage, and build a small Student module with Razor Pages.`,
  objectives: [
    'Pass data from a controller to a view with ViewData, ViewBag and a strongly typed model, and explain the pros and cons of each',
    'Design a ViewModel that combines several pieces of data for one view',
    'Use TempData with the Post-Redirect-Get pattern, and control its lifetime with Peek and Keep',
    'Create Razor Pages with @page, PageModel, OnGet/OnPost, [BindProperty], route templates and named handlers',
    'Choose between MVC controllers + views and Razor Pages for a given scenario',
  ],
  theory: [
    {
      heading: 'Ways to pass data to a view – overview',
      content: `| Technique | Type | Lifetime | Typical use |
|---|---|---|---|
| **Model** (\`View(model)\` + \`@model\`) | Strongly typed | Current request | The MAIN data of the page (recommended) |
| **ViewData** | \`ViewDataDictionary\` (string → object) | Current request | Small extras: page title, flags |
| **ViewBag** | \`dynamic\` wrapper around ViewData | Current request | Same as ViewData with nicer syntax |
| **TempData** | \`ITempDataDictionary\` (string → object) | Until it is READ (survives one redirect) | Success/error messages after redirect |
| **Session** (Day 75) | key/value per user | Until session expires | Cart, user preferences |

Analogy: the **model** is the main **parcel** you hand to the view; **ViewData/ViewBag** are **sticky notes** on the parcel; **TempData** is a **note left at reception** that is thrown away once someone reads it.`,
    },
    {
      heading: 'ViewData and ViewBag',
      content: `**ViewData** is a dictionary: \`ViewData["Title"] = "Students";\`. Values are stored as \`object\`, so reading a non-string value in the view usually needs a **cast**: \`(int)ViewData["Count"]!\`. A missing key returns **null** (no exception).

**ViewBag** is a \`dynamic\` property: \`ViewBag.Title = "Students";\`. It reads and writes the **same storage** as ViewData – \`ViewBag.Title\` and \`ViewData["Title"]\` are the same value. Because it is dynamic, there is **no IntelliSense and no compile-time checking**: a typo like \`ViewBag.Tittle\` silently gives null.

Both live **only for the current request** – they are lost after a redirect.

In Razor Pages, ViewBag is not available on PageModel; use ViewData or the \`[ViewData]\` attribute on a property.`,
      syntax: `// Controller
ViewData["Title"] = "Student List";
ViewBag.Count = 3;                       // same dictionary as ViewData["Count"]
ViewBag.Courses = new List<string> { "DotNet", "Java" };

@* View *@
<h2>@ViewData["Title"]</h2>              @* string: no cast needed to display *@
<p>Next number: @((int)ViewData["Count"]! + 1)</p>
<p>Next number: @(ViewBag.Count + 1)</p>
@foreach (var c in (List<string>)ViewBag.Courses) { <li>@c</li> }`,
      points: [
        'ViewData: dictionary, needs casting, key typos are runtime bugs',
        'ViewBag: dynamic, no casting for simple use, property typos are runtime bugs',
        'Both: current request only; good for small things like titles and dropdown lists',
      ],
    },
    {
      heading: 'Strongly typed views and ViewModels',
      content: `A **strongly typed view** declares its model type with \`@model\`. The controller passes the object with \`return View(model);\` and the view uses \`Model.Property\` with **IntelliSense and compile-time checking**. Tag helpers like \`asp-for\` also need a strongly typed model.

A **ViewModel** is a class designed **for one view**. It combines data from several sources (student + list of courses + statistics) and contains only what the view needs – no passwords, no unrelated database columns.

Rule of thumb used in companies: **main page data → strongly typed model/ViewModel; tiny extras (title) → ViewData; post-redirect messages → TempData.** Avoid big objects in ViewBag.`,
      syntax: `public class StudentProfileViewModel
{
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public List<string> EnrolledCourses { get; set; } = new();
    public string Grade => Marks >= 90 ? "A" : Marks >= 60 ? "B" : "C";
}

// Controller
return View(new StudentProfileViewModel { Name = "Riya", Marks = 92, EnrolledCourses = { "DotNet", "SQL" } });

@* View *@
@model StudentProfileViewModel
<h2>@Model.Name - Grade @Model.Grade</h2>`,
    },
    {
      heading: 'TempData: data that survives a redirect',
      content: `**TempData** keeps a value **until it is read** in a later request. It is ideal for the **Post-Redirect-Get** pattern: the POST action saves data, sets \`TempData["Message"] = "Saved!"\` and redirects; the GET action's view shows the message once.

Lifetime rules:
- A value that is **read** (\`TempData["Message"]\`) is **deleted at the end of that request**.
- A value that is **not read** stays for the next request.
- \`TempData.Peek("Message")\` reads **without** marking for deletion.
- \`TempData.Keep("Message")\` (or \`Keep()\` for all) cancels the deletion of a value already read.

Storage: by default a **cookie** (CookieTempDataProvider, encrypted with Data Protection). You can switch to **session** with \`builder.Services.AddControllersWithViews().AddSessionStateTempDataProvider(); builder.Services.AddSession(); app.UseSession();\`.

TempData values are serialized, so store **simple types** (string, int, bool, DateTime, arrays of these). For an object, serialize it to JSON yourself.

\`[TempData]\` attribute on a controller or PageModel property automatically stores/loads it: \`[TempData] public string? Message { get; set; }\`.`,
      tip: 'TempData is not for big data or security-sensitive data – a cookie is limited to about 4 KB.',
    },
    {
      heading: 'Razor Pages: @page, PageModel and handlers',
      content: `**Razor Pages** is a page-based model: each URL is a **.cshtml page** plus a **PageModel** class (\`.cshtml.cs\`) that holds its data and handlers. There is no separate controller.

- The \`@page\` directive makes the file a Razor Page. Its URL comes from its path in the \`Pages\` folder: \`Pages/Students/Index.cshtml\` → \`/Students\`, \`Pages/Students/Create.cshtml\` → \`/Students/Create\`.
- Route parameters: \`@page "{id:int}"\` on Details.cshtml → \`/Students/Details/5\`.
- **Handlers** are methods named \`On{Verb}\` or \`On{Verb}Async\`: \`OnGet()\`, \`OnPost()\`, \`OnPostAsync()\`.
- **Named handlers**: \`OnPostDelete(int id)\` is called by a form with \`asp-page-handler="Delete"\` (URL gets \`?handler=Delete\`).
- \`[BindProperty]\` binds posted form data to a property (for GET too only with \`SupportsGet = true\`).
- Results: \`Page()\` (render the page), \`RedirectToPage("Index")\`, \`NotFound()\`, \`RedirectToAction(...)\`.
- Program.cs: \`builder.Services.AddRazorPages();\` and \`app.MapRazorPages();\`.
- Links: \`<a asp-page="/Students/Details" asp-route-id="5">\`.

Analogy: MVC is a **restaurant** with one waiter (controller) serving many tables (views); Razor Pages is a **food court** where each counter (page) has its own cook (PageModel).`,
      syntax: `@* Pages/Hello.cshtml *@
@page
@model HelloModel
<h2>Hello @Model.Name</h2>

// Pages/Hello.cshtml.cs
public class HelloModel : PageModel
{
    public string Name { get; set; } = "";
    public void OnGet(string? name) => Name = name ?? "Guest";
}`,
    },
    {
      heading: 'MVC vs Razor Pages – when to use which?',
      content: `| | MVC | Razor Pages |
|---|---|---|
| Organisation | Controllers/, Views/<Controller>/ | Pages/ folder, page + PageModel together |
| URL | From route patterns or attributes | From the file path (+ @page template) |
| Request handling | Action methods | OnGet / OnPost handlers |
| Best for | Big apps, many actions sharing logic, APIs + views | Form-centric pages, CRUD, admin screens, simple sites |
| Data passing | Model, ViewData, ViewBag, TempData | PageModel properties (= the model), ViewData, TempData |

Both share Razor syntax, layouts, partials, tag helpers, model binding, validation, filters and DI, so skills transfer directly. A project can contain both (AddControllersWithViews + AddRazorPages). Microsoft's default "Web App" template uses Razor Pages; the Identity UI is built with Razor Pages.`,
    },
  ],
  examples: [
    {
      title: 'ViewData vs ViewBag vs strongly typed model in one dashboard',
      scenario: 'A DashboardController passes the page title with ViewData, the course list and today\'s notice with ViewBag, and the list of students as a strongly typed model. Compare the three in one view.',
      steps: [
        'Open the SchoolMvc project (ASP.NET Core Web App (Model-View-Controller), .NET 10) with Models/Student.cs from Day 66',
        'Add Controllers/DashboardController.cs (Add > Controller > MVC Controller - Empty)',
        'Right-click Index > Add View > Razor View - Empty > Index.cshtml',
        'Press Ctrl+F5 and open /Dashboard',
        'Experiment: change ViewBag.Notice to ViewBag.Notise in the view – it still compiles but shows nothing; change Model.Name to Model.Nmae – Visual Studio shows a red squiggle immediately',
      ],
      code: `// ===== Controllers/DashboardController.cs =====
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Models;

namespace SchoolMvc.Controllers;

public class DashboardController : Controller
{
    public IActionResult Index()
    {
        var students = new List<Student>
        {
            new Student { Id = 1, Name = "Riya", Course = "DotNet", Marks = 88 },
            new Student { Id = 2, Name = "Karan", Course = "Java", Marks = 34 },
            new Student { Id = 3, Name = "Meera", Course = "DotNet", Marks = 91 }
        };

        ViewData["Title"] = "Dashboard";                       // ViewData
        ViewData["StudentCount"] = students.Count;             // stored as object (boxed int)

        ViewBag.Courses = new List<string> { "DotNet", "Java", "React" };   // ViewBag
        ViewBag.Notice = "Exams start on Monday";

        return View(students);                                 // strongly typed model
    }
}

@* ===== Views/Dashboard/Index.cshtml ===== *@
@model List<SchoolMvc.Models.Student>

<h2>@ViewData["Title"]</h2>
<div class="alert alert-info">@ViewBag.Notice</div>

<p>Students (ViewData): @ViewData["StudentCount"]</p>
<p>Students next year +10 (needs cast): @((int)ViewData["StudentCount"]! + 10)</p>
<p>Same value via ViewBag (no cast): @(ViewBag.StudentCount + 10)</p>

<h4>Courses (ViewBag)</h4>
<ul>
    @foreach (var c in (List<string>)ViewBag.Courses)
    {
        <li>@c</li>
    }
</ul>

<h4>Students (strongly typed Model)</h4>
<table class="table">
    @foreach (var s in Model)
    {
        <tr><td>@s.Name</td><td>@s.Course</td><td>@s.Marks</td></tr>
    }
</table>
<p>Class average: @Model.Average(s => s.Marks).ToString("0.00")</p>`,
      result: `Dashboard
[Exams start on Monday]
Students (ViewData): 3
Students next year +10 (needs cast): 13
Same value via ViewBag (no cast): 13
Courses (ViewBag): DotNet, Java, React (bullet list)
Students (strongly typed Model):
Riya  DotNet 88
Karan Java   34
Meera DotNet 91
Class average: 71.00`,
      explanation: 'ViewData["StudentCount"] holds a boxed int, so arithmetic needs a cast; ViewBag.StudentCount reads the same entry dynamically and the + works at runtime. The foreach over ViewBag.Courses casts to List<string> so that s is typed. The model gives full IntelliSense: (88 + 34 + 91) / 3 = 213 / 3 = 71, formatted "71.00". ("0.00" uses the current culture decimal separator; on an English machine it is a dot.)',
    },
    {
      title: 'ViewModel for a student profile page',
      scenario: 'The profile page needs the student, their enrolled courses and attendance percentage. Create StudentProfileViewModel and a strongly typed view instead of using several ViewBag entries.',
      steps: [
        'In SchoolMvc: create folder ViewModels > Add > Class > StudentProfileViewModel.cs',
        'Add a Profile action to StudentController (or a new ProfileController)',
        'Right-click Profile > Add View > Razor View > Template: Empty, Model class: StudentProfileViewModel (or paste the code)',
        'Add @using SchoolMvc.ViewModels to Views/_ViewImports.cshtml',
        'Press Ctrl+F5 and open /Student/Profile/1',
      ],
      code: `// ===== ViewModels/StudentProfileViewModel.cs =====
namespace SchoolMvc.ViewModels;

public class StudentProfileViewModel
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
    public int ClassesHeld { get; set; }
    public int ClassesAttended { get; set; }
    public List<string> Courses { get; set; } = new();

    public int AttendancePercent => ClassesHeld == 0 ? 0 : ClassesAttended * 100 / ClassesHeld;
    public string Grade => Marks >= 90 ? "A" : Marks >= 60 ? "B" : Marks >= 40 ? "C" : "F";
    public bool EligibleForExam => AttendancePercent >= 75;
}

// ===== Controllers/StudentController.cs (new action) =====
public IActionResult Profile(int id)
{
    var student = _repo.GetById(id);
    if (student == null) return NotFound();

    var vm = new StudentProfileViewModel
    {
        Id = student.Id,
        Name = student.Name,
        Marks = student.Marks,
        ClassesHeld = 40,
        ClassesAttended = 33,
        Courses = new List<string> { "C#", "SQL Server", "ASP.NET Core" }
    };
    return View(vm);
}

@* ===== Views/Student/Profile.cshtml ===== *@
@model StudentProfileViewModel
@{ ViewData["Title"] = Model.Name + " - Profile"; }

<h2>@Model.Name <small class="text-muted">#@Model.Id</small></h2>
<p>Marks: @Model.Marks | Grade: <b>@Model.Grade</b></p>
<p>Attendance: @Model.ClassesAttended / @Model.ClassesHeld = @Model.AttendancePercent%</p>
@if (Model.EligibleForExam)
{
    <span class="badge bg-success">Eligible for exam</span>
}
else
{
    <span class="badge bg-danger">Not eligible (attendance below 75%)</span>
}

<h4 class="mt-3">Courses (@Model.Courses.Count)</h4>
<ol>
    @foreach (var c in Model.Courses) { <li>@c</li> }
</ol>`,
      result: `/Student/Profile/1 (Riya Sharma, 88 marks) shows:
Riya Sharma #1
Marks: 88 | Grade: B
Attendance: 33 / 40 = 82%
[Eligible for exam]  (green badge)
Courses (3)
1. C#
2. SQL Server
3. ASP.NET Core

/Student/Profile/99 -> 404`,
      explanation: '33 * 100 / 40 = 3300 / 40 = 82 (integer division), which is >= 75, so the student is eligible. 88 is not >= 90 but is >= 60, so the grade is B. The ViewModel holds only what the page needs and contains display logic (Grade, AttendancePercent) that can be unit tested, keeping the view simple. Every Model.X is checked by the compiler.',
    },
    {
      title: 'TempData with Post-Redirect-Get, Peek and Keep',
      scenario: 'After adding a student, show a one-time green message on the list page. Also show how Peek and Keep change TempData\'s lifetime.',
      steps: [
        'Use the StudentController and repository from Day 67 (with Create GET/POST)',
        'Update the POST Create action to set TempData["Message"] and redirect',
        'Add the message block at the top of Views/Student/Index.cshtml (or in _Layout.cshtml so every page can show it)',
        'Add the TempDemo actions and press Ctrl+F5',
        'Add a student: the message appears; press F5 to refresh – the message is gone',
        'Open /Student/TempSet, then /Student/TempPeek twice, then /Student/TempRead twice and compare',
      ],
      code: `// ===== Controllers/StudentController.cs =====
[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Create(Student student)
{
    if (!ModelState.IsValid) return View(student);
    _repo.Add(student);
    TempData["Message"] = $"Student {student.Name} added with Id {student.Id}";
    TempData["MessageType"] = "success";
    return RedirectToAction(nameof(Index));        // 302 -> GET /Student
}

// ---- lifetime experiments ----
public IActionResult TempSet()
{
    TempData["Info"] = "Fees due on Friday";
    return Content("Info stored in TempData");
}

public IActionResult TempPeek()
{
    var value = TempData.Peek("Info");             // read WITHOUT marking for delete
    return Content($"Peek: {value ?? "(gone)"}");
}

public IActionResult TempRead()
{
    var value = TempData["Info"];                  // read -> deleted at end of request
    return Content($"Read: {value ?? "(gone)"}");
}

public IActionResult TempReadKeep()
{
    var value = TempData["Info"];
    TempData.Keep("Info");                         // cancel the delete
    return Content($"Read + Keep: {value ?? "(gone)"}");
}

@* ===== top of Views/Student/Index.cshtml (or _Layout.cshtml) ===== *@
@if (TempData["Message"] is string message)
{
    <div class="alert alert-@(TempData["MessageType"] ?? "info") alert-dismissible">
        @message
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    </div>
}`,
      result: `Add student "Asha" (repository already has Ids 1-3):
POST /Student/Create -> 302 Location: /Student
GET  /Student        -> green alert "Student Asha added with Id 4" above the list
F5 (refresh)         -> list only, NO alert (TempData was read and deleted)

Lifetime experiments (in this order):
/Student/TempSet       -> Info stored in TempData
/Student/TempPeek      -> Peek: Fees due on Friday
/Student/TempPeek      -> Peek: Fees due on Friday      (Peek does not delete)
/Student/TempReadKeep  -> Read + Keep: Fees due on Friday
/Student/TempRead      -> Read: Fees due on Friday      (Keep saved it once more)
/Student/TempRead      -> Read: (gone)`,
      explanation: 'ViewData/ViewBag would be lost by the redirect because the GET is a brand-new request; TempData survives because it is stored in a cookie between requests. Reading TempData["Message"] in the view marks it for deletion, so the refresh shows nothing – exactly the "flash message" behaviour we want. Peek never marks; Keep un-marks a value that was read.',
    },
    {
      title: 'Razor Pages: Student list, details and create with [BindProperty] and named handlers',
      scenario: 'Build the same student feature with Razor Pages: /Students (list + delete button), /Students/Details/2 and /Students/Create, using PageModel classes, [BindProperty], RedirectToPage and TempData.',
      steps: [
        'Visual Studio: File > New > Project > "ASP.NET Core Web App (Razor Pages)" > name SchoolPages > .NET 10 > Create',
        'Add Models/Student.cs and Data/StudentRepository.cs (same code as Day 67, namespace SchoolPages)',
        'Program.cs: add builder.Services.AddSingleton<StudentRepository>(); (template already has AddRazorPages and MapRazorPages)',
        'Right-click Pages > Add > New Folder "Students"; right-click it > Add > Razor Page > "Razor Page - Empty" > Index.cshtml (VS also creates Index.cshtml.cs)',
        'Repeat for Details and Create, paste the code',
        'In Pages/Shared/_Layout.cshtml add <a class="nav-link text-dark" asp-page="/Students/Index">Students</a>',
        'Press Ctrl+F5 and open /Students; add a student; delete one; open /Students/Details/1',
      ],
      code: `// ===== Program.cs =====
using SchoolPages.Data;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddRazorPages();
builder.Services.AddSingleton<StudentRepository>();

var app = builder.Build();
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
    app.UseHsts();
}
app.UseHttpsRedirection();
app.UseRouting();
app.UseAuthorization();
app.MapStaticAssets();                 // .NET 8: app.UseStaticFiles();
app.MapRazorPages().WithStaticAssets();
app.Run();

// ===== Models/Student.cs =====
using System.ComponentModel.DataAnnotations;
namespace SchoolPages.Models;

public class Student
{
    public int Id { get; set; }
    [Required, StringLength(50)] public string Name { get; set; } = "";
    [Required] public string Course { get; set; } = "";
    [Range(0, 100)] public int Marks { get; set; }
}

// ===== Pages/Students/Index.cshtml.cs =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using SchoolPages.Data;
using SchoolPages.Models;

namespace SchoolPages.Pages.Students;

public class IndexModel : PageModel
{
    private readonly StudentRepository _repo;
    public IndexModel(StudentRepository repo) => _repo = repo;

    public List<Student> Students { get; private set; } = new();

    [TempData]
    public string? Message { get; set; }          // auto read/write TempData["Message"]

    public void OnGet()                            // GET /Students
    {
        ViewData["Title"] = "Students";
        Students = _repo.GetAll();
    }

    public IActionResult OnPostDelete(int id)      // POST /Students?handler=Delete&id=2
    {
        if (!_repo.Delete(id)) return NotFound();
        Message = $"Student {id} deleted";
        return RedirectToPage();                   // back to this page (GET)
    }
}

@* ===== Pages/Students/Index.cshtml ===== *@
@page
@model SchoolPages.Pages.Students.IndexModel

@if (Model.Message != null)
{
    <div class="alert alert-success">@Model.Message</div>
}
<h2>Students (@Model.Students.Count)</h2>
<a asp-page="Create" class="btn btn-primary mb-2">Add student</a>
<table class="table">
    @foreach (var s in Model.Students)
    {
        <tr>
            <td><a asp-page="Details" asp-route-id="@s.Id">@s.Name</a></td>
            <td>@s.Course</td>
            <td>@s.Marks</td>
            <td>
                <form method="post" asp-page-handler="Delete" asp-route-id="@s.Id">
                    <button class="btn btn-sm btn-danger">Delete</button>
                </form>
            </td>
        </tr>
    }
</table>

// ===== Pages/Students/Details.cshtml.cs =====
public class DetailsModel : PageModel
{
    private readonly StudentRepository _repo;
    public DetailsModel(StudentRepository repo) => _repo = repo;

    public Student Student { get; private set; } = new();

    public IActionResult OnGet(int id)
    {
        var s = _repo.GetById(id);
        if (s == null) return NotFound();
        Student = s;
        return Page();
    }
}

@* ===== Pages/Students/Details.cshtml ===== *@
@page "{id:int}"
@model SchoolPages.Pages.Students.DetailsModel
<h2>@Model.Student.Name</h2>
<p>@Model.Student.Course - @Model.Student.Marks marks</p>
<a asp-page="Index">Back</a>

// ===== Pages/Students/Create.cshtml.cs =====
public class CreateModel : PageModel
{
    private readonly StudentRepository _repo;
    public CreateModel(StudentRepository repo) => _repo = repo;

    [BindProperty]
    public Student Student { get; set; } = new();

    public void OnGet() { }                        // show empty form

    public IActionResult OnPost()
    {
        if (!ModelState.IsValid) return Page();    // redisplay with errors
        _repo.Add(Student);
        TempData["Message"] = $"Student {Student.Name} added";
        return RedirectToPage("Index");
    }
}

@* ===== Pages/Students/Create.cshtml ===== *@
@page
@model SchoolPages.Pages.Students.CreateModel
<h2>Add student</h2>
<form method="post">
    <div asp-validation-summary="ModelOnly" class="text-danger"></div>
    <label asp-for="Student.Name"></label>
    <input asp-for="Student.Name" class="form-control" />
    <span asp-validation-for="Student.Name" class="text-danger"></span>

    <label asp-for="Student.Course"></label>
    <input asp-for="Student.Course" class="form-control" />
    <span asp-validation-for="Student.Course" class="text-danger"></span>

    <label asp-for="Student.Marks"></label>
    <input asp-for="Student.Marks" class="form-control" />
    <span asp-validation-for="Student.Marks" class="text-danger"></span>

    <button class="btn btn-success mt-2">Save</button>
</form>
@section Scripts { <partial name="_ValidationScriptsPartial" /> }`,
      result: `/Students             -> "Students (3)" table: Riya Sharma, Karan Mehta, Meera Iyer with Delete buttons
Click Karan's Delete  -> POST /Students?handler=Delete&id=2 -> 302 -> /Students shows green "Student 2 deleted", 2 rows left
/Students/Create      -> form; submit empty -> "The Name field is required." and "The Course field is required." (no redirect)
Submit Name=Asha, Course=React, Marks=77 -> 302 -> /Students with "Student Asha added", Asha has Id 4
/Students/Details/1   -> "Riya Sharma", "DotNet - 88 marks"
/Students/Details/abc -> 404 ({id:int} constraint)`,
      explanation: 'Each page = .cshtml (UI) + PageModel (logic). The URL comes from the folder path; @page "{id:int}" adds a route segment. [BindProperty] binds the posted fields named Student.Name, Student.Course, Student.Marks (asp-for generates these names). asp-page-handler="Delete" makes the form post to ?handler=Delete, which runs OnPostDelete. The [TempData] property Message is saved to TempData on redirect and loaded on the next GET. Note the PageModel itself is the view\'s Model.',
    },
    {
      title: 'Console demo: simulate ViewData, ViewBag (dynamic) and TempData lifetime',
      scenario: 'Build small classes that behave like ViewData (dictionary returning null for missing keys), ViewBag (a dynamic object over the same dictionary) and TempData (deleted after being read, with Peek and Keep). Run several "requests" and watch the values.',
      steps: [
        'File > New > Project > Console App > name ViewDataDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Set a breakpoint (F9) in TempDataSim.EndRequest and press F5 to see which keys are removed after each "request"',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Dynamic;

// ---------- 1. ViewData and ViewBag share the same storage ----------
var viewData = new ViewDataSim();
dynamic viewBag = new ViewBagSim(viewData);

viewData["Title"] = "Student List";
viewBag.Count = 3;                                  // stored in viewData["Count"]

string titleFromBag = viewBag.Title;               // no cast for ViewBag
int nextFromData = (int)viewData["Count"]! + 1;    // ViewData needs a cast
int nextFromBag = viewBag.Count + 1;               // resolved at runtime
object? typo = viewBag.Tittle;                     // typo -> null, no compile error

Console.WriteLine("1) ViewData and ViewBag share one dictionary");
Console.WriteLine($"   ViewBag.Title           = {titleFromBag}");
Console.WriteLine($"   ViewData['Count'] + 1   = {nextFromData}");
Console.WriteLine($"   ViewBag.Count + 1       = {nextFromBag}");
Console.WriteLine($"   Items stored            = {viewData.Count}");
Console.WriteLine($"   ViewBag.Tittle (typo)   = {(typo == null ? "null" : typo)}");
try
{
    int wrong = (int)viewData["Title"]!;
}
catch (InvalidCastException)
{
    Console.WriteLine("   (int)ViewData['Title']  -> InvalidCastException at runtime");
}

// ---------- 2. Strongly typed model ----------
var model = new Student { Name = "Riya", Marks = 88 };
Console.WriteLine("2) Strongly typed model");
Console.WriteLine($"   Model.Name = {model.Name}, Model.Marks + 1 = {model.Marks + 1}");

// ---------- 3. TempData across requests ----------
var tempData = new TempDataSim();
Console.WriteLine("3) TempData across requests");

tempData["Message"] = "Student Riya saved";        // Req1: POST Create
tempData.EndRequest();
Console.WriteLine($"   Req1 POST Create  -> Message set, stored after request: {tempData.Count}");

Console.WriteLine($"   Req2 GET Index    -> Message = {tempData["Message"] ?? "(none)"}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req3 GET Index    -> Message = {tempData["Message"] ?? "(none)"}");
tempData.EndRequest();

tempData["Info"] = "Fees due Friday";               // Req4
tempData.EndRequest();
Console.WriteLine($"   Req4 set Info     -> stored after request: {tempData.Count}");

Console.WriteLine($"   Req5 Peek         -> {tempData.Peek("Info")}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req6 Read + Keep  -> {tempData["Info"]}");
tempData.Keep("Info");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req7 Read         -> {tempData["Info"]}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

// ===== classes =====
public class Student
{
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

public class ViewDataSim
{
    private readonly Dictionary<string, object?> items = new();
    public object? this[string key]
    {
        get => items.TryGetValue(key, out var v) ? v : null;   // missing key -> null
        set => items[key] = value;
    }
    public int Count => items.Count;
}

public class ViewBagSim : DynamicObject
{
    private readonly ViewDataSim viewData;
    public ViewBagSim(ViewDataSim viewData) { this.viewData = viewData; }

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = viewData[binder.Name];
        return true;
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        viewData[binder.Name] = value;
        return true;
    }
}

public class TempDataSim
{
    private readonly Dictionary<string, object?> data = new();
    private readonly HashSet<string> readKeys = new();

    public object? this[string key]
    {
        get
        {
            if (data.TryGetValue(key, out var v)) { readKeys.Add(key); return v; }
            return null;
        }
        set { data[key] = value; readKeys.Remove(key); }
    }

    public object? Peek(string key) => data.TryGetValue(key, out var v) ? v : null;
    public void Keep(string key) => readKeys.Remove(key);

    public void EndRequest()                        // like saving TempData to the cookie
    {
        foreach (var key in readKeys) data.Remove(key);
        readKeys.Clear();
    }

    public int Count => data.Count;
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Dynamic;

// ---------- 1. ViewData and ViewBag share the same storage ----------
var viewData = new ViewDataSim();
dynamic viewBag = new ViewBagSim(viewData);

viewData["Title"] = "Student List";
viewBag.Count = 3;                                  // stored in viewData["Count"]

string titleFromBag = viewBag.Title;               // no cast for ViewBag
int nextFromData = (int)viewData["Count"]! + 1;    // ViewData needs a cast
int nextFromBag = viewBag.Count + 1;               // resolved at runtime
object? typo = viewBag.Tittle;                     // typo -> null, no compile error

Console.WriteLine("1) ViewData and ViewBag share one dictionary");
Console.WriteLine($"   ViewBag.Title           = {titleFromBag}");
Console.WriteLine($"   ViewData['Count'] + 1   = {nextFromData}");
Console.WriteLine($"   ViewBag.Count + 1       = {nextFromBag}");
Console.WriteLine($"   Items stored            = {viewData.Count}");
Console.WriteLine($"   ViewBag.Tittle (typo)   = {(typo == null ? "null" : typo)}");
try
{
    int wrong = (int)viewData["Title"]!;
}
catch (InvalidCastException)
{
    Console.WriteLine("   (int)ViewData['Title']  -> InvalidCastException at runtime");
}

// ---------- 2. Strongly typed model ----------
var model = new Student { Name = "Riya", Marks = 88 };
Console.WriteLine("2) Strongly typed model");
Console.WriteLine($"   Model.Name = {model.Name}, Model.Marks + 1 = {model.Marks + 1}");

// ---------- 3. TempData across requests ----------
var tempData = new TempDataSim();
Console.WriteLine("3) TempData across requests");

tempData["Message"] = "Student Riya saved";        // Req1: POST Create
tempData.EndRequest();
Console.WriteLine($"   Req1 POST Create  -> Message set, stored after request: {tempData.Count}");

Console.WriteLine($"   Req2 GET Index    -> Message = {tempData["Message"] ?? "(none)"}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req3 GET Index    -> Message = {tempData["Message"] ?? "(none)"}");
tempData.EndRequest();

tempData["Info"] = "Fees due Friday";               // Req4
tempData.EndRequest();
Console.WriteLine($"   Req4 set Info     -> stored after request: {tempData.Count}");

Console.WriteLine($"   Req5 Peek         -> {tempData.Peek("Info")}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req6 Read + Keep  -> {tempData["Info"]}");
tempData.Keep("Info");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

Console.WriteLine($"   Req7 Read         -> {tempData["Info"]}");
tempData.EndRequest();
Console.WriteLine($"                        stored after request: {tempData.Count}");

// ===== classes =====
public class Student
{
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

public class ViewDataSim
{
    private readonly Dictionary<string, object?> items = new();
    public object? this[string key]
    {
        get => items.TryGetValue(key, out var v) ? v : null;   // missing key -> null
        set => items[key] = value;
    }
    public int Count => items.Count;
}

public class ViewBagSim : DynamicObject
{
    private readonly ViewDataSim viewData;
    public ViewBagSim(ViewDataSim viewData) { this.viewData = viewData; }

    public override bool TryGetMember(GetMemberBinder binder, out object? result)
    {
        result = viewData[binder.Name];
        return true;
    }

    public override bool TrySetMember(SetMemberBinder binder, object? value)
    {
        viewData[binder.Name] = value;
        return true;
    }
}

public class TempDataSim
{
    private readonly Dictionary<string, object?> data = new();
    private readonly HashSet<string> readKeys = new();

    public object? this[string key]
    {
        get
        {
            if (data.TryGetValue(key, out var v)) { readKeys.Add(key); return v; }
            return null;
        }
        set { data[key] = value; readKeys.Remove(key); }
    }

    public object? Peek(string key) => data.TryGetValue(key, out var v) ? v : null;
    public void Keep(string key) => readKeys.Remove(key);

    public void EndRequest()                        // like saving TempData to the cookie
    {
        foreach (var key in readKeys) data.Remove(key);
        readKeys.Clear();
    }

    public int Count => data.Count;
}
`,
        },
        stdin: '',
      },
      result: `1) ViewData and ViewBag share one dictionary
   ViewBag.Title           = Student List
   ViewData['Count'] + 1   = 4
   ViewBag.Count + 1       = 4
   Items stored            = 2
   ViewBag.Tittle (typo)   = null
   (int)ViewData['Title']  -> InvalidCastException at runtime
2) Strongly typed model
   Model.Name = Riya, Model.Marks + 1 = 89
3) TempData across requests
   Req1 POST Create  -> Message set, stored after request: 1
   Req2 GET Index    -> Message = Student Riya saved
                        stored after request: 0
   Req3 GET Index    -> Message = (none)
   Req4 set Info     -> stored after request: 1
   Req5 Peek         -> Fees due Friday
                        stored after request: 1
   Req6 Read + Keep  -> Fees due Friday
                        stored after request: 1
   Req7 Read         -> Fees due Friday
                        stored after request: 0`,
      explanation: 'viewBag.Count = 3 calls TrySetMember, which writes into the same dictionary as viewData["Title"], so 2 items are stored. viewBag.Tittle calls TryGetMember with a key that does not exist and returns null – the compiler cannot catch the typo. Casting the string "Student List" to int throws InvalidCastException, the classic ViewData runtime bug. For TempData: an unread value survives EndRequest; a read value is removed; Peek does not mark; Keep un-marks.',
    },
  ],
  interview: [
    { q: 'What are the ways to pass data from a controller to a view?', a: 'Strongly typed model (View(model) + @model), ViewData, ViewBag, TempData, and also Session, cookies, or services injected with @inject.', level: 'Easy' },
    { q: 'Difference between ViewData and ViewBag?', a: 'ViewData is a ViewDataDictionary accessed with string keys and returns object (needs casting). ViewBag is a dynamic wrapper over the SAME ViewData storage, accessed with properties and no casting. Both live only for the current request and have no compile-time checking.', level: 'Easy' },
    { q: 'What is TempData and how long does it live?', a: 'A dictionary that persists data between two requests, typically across a redirect. A value lives until it is read; it is deleted at the end of the request in which it was read, unless Keep() is called. Peek() reads without marking it for deletion.', level: 'Medium' },
    { q: 'Difference between TempData.Peek and TempData.Keep?', a: 'Peek(key) reads a value without marking it for deletion. Keep(key) is called after a normal read to cancel the deletion. Both keep the value for the next request.', level: 'Medium' },
    { q: 'Where is TempData stored by default?', a: 'In an encrypted cookie via CookieTempDataProvider (Data Protection). It can be switched to session storage with AddSessionStateTempDataProvider plus AddSession/UseSession.', level: 'Medium' },
    { q: 'Why does ViewBag data disappear after RedirectToAction?', a: 'ViewBag/ViewData exist only for the current request. A redirect sends 302 to the browser, which makes a completely new GET request with a new controller instance. Use TempData to survive the redirect.', level: 'Medium' },
    { q: 'What is a strongly typed view and why is it preferred?', a: 'A view that declares @model SomeType so Model is typed. It gives IntelliSense, compile-time checking, works with tag helpers like asp-for, and makes refactoring safe.', level: 'Easy' },
    { q: 'What is a ViewModel?', a: 'A class built specifically for a view that combines and shapes the data the view needs (e.g. student + courses + attendance), excluding unrelated or sensitive fields. It keeps views simple and protects domain/database entities.', level: 'Medium' },
    { q: 'What is Razor Pages?', a: 'A page-focused ASP.NET Core programming model where each page is a .cshtml file with @page and a PageModel class (code-behind) containing handler methods like OnGet and OnPost. URLs come from the file path under Pages.', level: 'Easy' },
    { q: 'What does [BindProperty] do in a PageModel?', a: 'It tells model binding to fill the property from the request on POST (and on GET only if SupportsGet = true). Without it, PageModel properties are not bound automatically.', level: 'Medium' },
    { q: 'How do you create multiple POST handlers in one Razor Page?', a: 'Use named handlers: OnPostDelete, OnPostApprove, etc. Forms select them with asp-page-handler="Delete", which adds ?handler=Delete to the URL.', level: 'Medium' },
    { q: 'How do you add a route parameter to a Razor Page?', a: 'Put a template on the @page directive: @page "{id:int}" makes /Students/Details/5 call OnGet(int id). Optional: @page "{id:int?}".', level: 'Medium' },
    { q: 'MVC or Razor Pages – which would you choose for an admin CRUD screen?', a: 'Razor Pages is usually simpler for page-centric CRUD because the UI and handler live together. MVC suits larger apps where many actions share controllers, filters and logic, or when also exposing APIs. Both can be mixed in one project.', level: 'Hard' },
    { q: 'Can you use ViewBag in a Razor Page?', a: 'Not from the PageModel (PageModel has no ViewBag property); use ViewData, PageModel properties, or [ViewData] attribute. Inside the .cshtml, ViewBag is available but rarely used.', level: 'Hard' },
    { q: 'Output? ViewData["n"] = 5; ViewBag.n = 7; then @ViewData["n"] in the view shows?', a: '7 — ViewBag and ViewData share the same dictionary, so ViewBag.n = 7 overwrote the value.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a ContactController that passes the office address via ViewData, the phone numbers list via ViewBag, and a ContactInfo model (email, hours) as the strongly typed model. Show all three in one view.',
      hint: 'ViewData["Address"], ViewBag.Phones = new List<string>{...}, return View(new ContactInfo{...}).',
      solution: `public class ContactInfo { public string Email { get; set; } = ""; public string Hours { get; set; } = ""; }

public class ContactController : Controller
{
    public IActionResult Index()
    {
        ViewData["Address"] = "12 MG Road, Pune";
        ViewBag.Phones = new List<string> { "020-1111111", "020-2222222" };
        return View(new ContactInfo { Email = "office@school.com", Hours = "9 AM - 5 PM" });
    }
}

@model ContactInfo
<p>Address: @ViewData["Address"]</p>
<ul>@foreach (var p in (List<string>)ViewBag.Phones) { <li>@p</li> }</ul>
<p>Email: @Model.Email | Hours: @Model.Hours</p>`,
    },
    {
      task: 'Move the TempData success/error message display into _Layout.cshtml as a partial _Alerts.cshtml so that every page can show flash messages.',
      hint: 'Create Views/Shared/_Alerts.cshtml and add <partial name="_Alerts" /> above @RenderBody().',
      solution: `@* Views/Shared/_Alerts.cshtml *@
@if (TempData["Success"] is string ok)
{
    <div class="alert alert-success">@ok</div>
}
@if (TempData["Error"] is string err)
{
    <div class="alert alert-danger">@err</div>
}

@* _Layout.cshtml *@
<main class="container">
    <partial name="_Alerts" />
    @RenderBody()
</main>

// any controller
TempData["Success"] = "Saved!";
return RedirectToAction("Index");`,
    },
    {
      task: 'Store a small object in TempData across a redirect (e.g. the last created student\'s Id and Name).',
      hint: 'TempData cannot store complex objects directly – serialize with System.Text.Json.',
      solution: `using System.Text.Json;

// POST action
TempData["LastStudent"] = JsonSerializer.Serialize(new { student.Id, student.Name });
return RedirectToAction("Index");

// GET Index action
if (TempData["LastStudent"] is string json)
{
    var last = JsonSerializer.Deserialize<Student>(json);
    ViewBag.LastName = last?.Name;
}`,
    },
    {
      task: 'Create a Razor Page /Calculator with two numbers bound with [BindProperty] and two handlers: OnPostAdd and OnPostMultiply. Show the result on the same page.',
      hint: 'Two submit buttons with asp-page-handler="Add" and asp-page-handler="Multiply".',
      solution: `// Pages/Calculator.cshtml.cs
public class CalculatorModel : PageModel
{
    [BindProperty] public int A { get; set; }
    [BindProperty] public int B { get; set; }
    public int? Result { get; set; }

    public void OnGet() { }
    public void OnPostAdd() => Result = A + B;
    public void OnPostMultiply() => Result = A * B;
}

@* Pages/Calculator.cshtml *@
@page
@model CalculatorModel
<form method="post">
    <input asp-for="A" /> <input asp-for="B" />
    <button asp-page-handler="Add">Add</button>
    <button asp-page-handler="Multiply">Multiply</button>
</form>
@if (Model.Result != null) { <h3>Result: @Model.Result</h3> }
@* A=6, B=7: Add -> Result: 13, Multiply -> Result: 42 *@`,
    },
    {
      task: 'In the console ViewDataDemo, prove that ViewBag overwrites ViewData: set viewData["Title"] = "A", then viewBag.Title = "B", and print viewData["Title"].',
      hint: 'Both write to the same dictionary.',
      solution: `viewData["Title"] = "A";
viewBag.Title = "B";
Console.WriteLine(viewData["Title"]);   // B`,
    },
  ],
  quiz: [
    { question: 'Which option keeps data alive across a RedirectToAction?', options: ['ViewData', 'ViewBag', 'TempData', 'A local variable'], answer: 2, explanation: 'TempData persists until it is read in a later request.' },
    { question: 'ViewBag is implemented as …', options: ['a dynamic wrapper over ViewData', 'a separate cookie', 'a session object', 'a strongly typed class'], answer: 0, explanation: 'ViewBag and ViewData share the same storage.' },
    { question: 'Which TempData method reads a value WITHOUT marking it for deletion?', options: ['Keep()', 'Remove()', 'Clear()', 'Peek()'], answer: 3, explanation: 'Peek reads without marking.' },
    { question: 'In Razor Pages, which handler runs for a normal form POST?', options: ['OnGet', 'OnPost', 'Index', 'HttpPost'], answer: 1, explanation: 'Handlers follow the On{Verb} naming convention.' },
    { question: 'Pages/Students/Edit.cshtml has @page "{id:int}". Which URL opens it for student 4?', options: ['/Students?id=4', '/Edit/Students/4', '/Students/Edit/4', '/Pages/Students/Edit/4'], answer: 2, explanation: 'Path from the Pages folder plus the route template.' },
  ],
};
