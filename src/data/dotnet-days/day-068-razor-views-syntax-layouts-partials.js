export default {
  id: 'day-068-razor-views-syntax-layouts-partials',
  title: 'Razor Views, Razor Syntax, Layout Pages and Partial Views',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 68,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Learn Razor – the view engine that mixes C# with HTML in .cshtml files. You will master Razor syntax (@expressions, code blocks, loops, conditions, comments, HTML encoding), directives (@model, @using, @inject, @section), layout pages with RenderBody and RenderSection, _ViewStart and _ViewImports, and reusable partial views. The day ends with a polished Student listing page built from a layout, a table partial and a card partial.`,
  objectives: [
    'Write Razor syntax: implicit and explicit expressions, code blocks, @if/@foreach/@switch, comments, <text> and @: and escaping @@',
    'Explain automatic HTML encoding and when (rarely) to use @Html.Raw',
    'Create a layout page with RenderBody, RenderSection and sections, and set it with _ViewStart.cshtml',
    'Use _ViewImports.cshtml for shared @using, @addTagHelper and @inject directives',
    'Create and render partial views with <partial>, Html.PartialAsync and PartialView() from a controller',
  ],
  theory: [
    {
      heading: 'What is a Razor view?',
      content: `A **Razor view** is a \`.cshtml\` file that contains **HTML plus C#**. The Razor engine compiles the file into a C# class; when the view runs it writes HTML into the response. The \`@\` character switches from HTML to C#.

Where views live: \`Views/<ControllerName>/<ActionName>.cshtml\` (e.g. \`Views/Student/Index.cshtml\`) and shared ones in \`Views/Shared\`.

Analogy: a Razor view is like a **wedding invitation template** – the design (HTML) is fixed and the blanks (\`@Model.Name\`, \`@Model.Date\`) are filled with real data for every guest.

Views are **compiled** at build time, so many syntax mistakes appear in the Error List (Ctrl+\\, E) before you run the app. For live editing without rebuilding, use **Hot Reload** (Alt+F10 / the flame button) or add the package \`Microsoft.AspNetCore.Mvc.Razor.RuntimeCompilation\`.`,
      points: [
        '@model declares the model type: @model List<Student> – then Model is strongly typed',
        'Views should only DISPLAY data – no database calls, no business rules',
        'Every view has access to ViewData, ViewBag, TempData, Html, Url, User, Context',
      ],
    },
    {
      heading: 'Razor syntax cheat sheet',
      content: `| Syntax | Example | Meaning |
|---|---|---|
| Implicit expression | \`@Model.Name\`, \`@DateTime.Now.Year\` | Write a value (HTML-encoded) |
| Explicit expression | \`@(Model.Marks * 2)\`, \`@(a + b)\` | Use when there are spaces/operators |
| Code block | \`@{ var total = 0; }\` | C# statements, no output |
| If / else | \`@if (Model.Marks >= 40) { <span>Pass</span> } else { <span>Fail</span> }\` | Conditional HTML |
| Loops | \`@foreach (var s in Model) { <li>@s.Name</li> }\` | also @for, @while, @do |
| Switch | \`@switch (grade) { case "A": <b>Excellent</b> break; }\` | |
| Razor comment | \`@* not sent to browser *@\` | Removed at compile time (HTML comments are sent!) |
| Plain text in code | \`<text>Hello</text>\` or \`@: Hello\` | Output text without an HTML tag |
| Escape @ | \`@@\` | Writes a single @ (e.g. \`@@media\` in CSS) |
| Email | \`info@school.com\` | Razor recognises emails and does NOT switch to C# |
| Generics | \`@(Html.DisplayFor<Student, string>(...))\` | Wrap in parentheses because < looks like HTML |
| try/catch, using, lock | \`@try { } catch { }\` | Also allowed |`,
      syntax: `@model List<Student>
@{
    int passCount = Model.Count(s => s.Marks >= 40);   // code block
}
<p>Total: @Model.Count, Passed: @passCount, Percentage: @(passCount * 100 / Model.Count)%</p>
@foreach (var s in Model)
{
    if (s.Marks >= 90)
    {
        <text>Topper: </text>
    }
    <span>@s.Name</span><br />
}
@* This comment never reaches the browser *@
<p>Contact: office@school.com, Twitter: @@schoolapp</p>`,
    },
    {
      heading: 'HTML encoding and @Html.Raw',
      content: `Every \`@value\` is **HTML-encoded** automatically: \`<\` becomes \`&lt;\`, \`>\` becomes \`&gt;\`, \`&\` becomes \`&amp;\`, quotes are encoded too. If a user enters \`<script>alert('hack')</script>\` as their name, the browser shows the text instead of running it. This protects you from **XSS (Cross-Site Scripting)** attacks.

\`@Html.Raw(value)\` writes the value **without encoding**. Use it **only** for HTML that you created or sanitised yourself (for example, HTML produced by a trusted Markdown converter). Never use Html.Raw on user input.`,
      syntax: `@{ string userName = "<b>Riya</b>"; }
<p>@userName</p>              <!-- shows the text <b>Riya</b> literally -->
<p>@Html.Raw(userName)</p>    <!-- shows Riya in bold – dangerous for user data -->`,
      tip: 'Interview favourite: "How does Razor prevent XSS?" – by HTML-encoding every @ expression by default.',
    },
    {
      heading: 'Layout pages, RenderBody and sections',
      content: `A **layout** is the master template shared by many views: \`<html>\`, \`<head>\`, CSS links, navbar, footer and scripts. Each view supplies only its **own content**.

- \`@RenderBody()\` – the place where the view's content is inserted. Required, exactly once in a layout.
- \`@RenderSection("Scripts", required: false)\` – a named "hole" that a view can optionally fill with \`@section Scripts { ... }\`. If \`required: true\` and the view does not define it, you get an error.
- \`@await RenderSectionAsync(...)\` – async version used in templates.
- \`IsSectionDefined("Sidebar")\` – check if the view filled a section (to show default content otherwise).
- \`ViewData["Title"]\` – views set it, the layout shows it in \`<title>\`.

**_ViewStart.cshtml** runs **before every view** in its folder and sub-folders. The template contains just \`@{ Layout = "_Layout"; }\`. A view can override it with \`@{ Layout = "_AdminLayout"; }\` or turn it off with \`@{ Layout = null; }\`.

**Nested layouts:** a layout can itself have a Layout (e.g. _AdminLayout uses _Layout).

Analogy: the layout is the **picture frame**; each view is the **picture** you slide into it.`,
      syntax: `@* Views/Shared/_Layout.cshtml *@
<!DOCTYPE html>
<html>
<head>
    <title>@ViewData["Title"] - SchoolApp</title>
</head>
<body>
    <nav>...</nav>
    <main>@RenderBody()</main>
    <footer>&copy; @DateTime.Now.Year SchoolApp</footer>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>

@* Views/_ViewStart.cshtml *@
@{
    Layout = "_Layout";
}`,
    },
    {
      heading: '_ViewImports.cshtml and Razor directives',
      content: `**_ViewImports.cshtml** holds directives that apply to all views in the folder (and sub-folders). It does not produce output.

| Directive | Purpose |
|---|---|
| \`@using SchoolMvc.Models\` | Import a namespace so you can write \`@model Student\` |
| \`@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers\` | Enable tag helpers |
| \`@inject IConfiguration Config\` | Inject a service into views |
| \`@model Type\` | Declare the model type (in a view) |
| \`@section Name { }\` | Fill a layout section (in a view) |
| \`@functions { }\` | Add C# methods/fields to the generated view class |
| \`@page\` | Marks a Razor Page (Day 69) |
| \`@inherits\`, \`@namespace\`, \`@attribute\` | Advanced customisation |

Order of special files for a view in Views/Student: \`Views/_ViewImports.cshtml\` → \`Views/Student/_ViewImports.cshtml\` (if any) → \`Views/_ViewStart.cshtml\` → the view → its layout.`,
    },
    {
      heading: 'Partial views',
      content: `A **partial view** is a small, reusable piece of Razor markup – a table row, a product card, a login box, a pager. By convention its name starts with an **underscore**: \`_StudentRow.cshtml\`. Partial views **do not use a layout** and _ViewStart does not run for them.

Ways to render a partial:
- **Partial Tag Helper (recommended):** \`<partial name="_StudentCard" model="s" />\`
- **HTML helper (async):** \`@await Html.PartialAsync("_StudentCard", s)\`
- **From a controller:** \`return PartialView("_StudentTable", list);\` – returns just the fragment, perfect for AJAX refresh.

Search locations for \`_StudentCard\`: \`Views/<Controller>/\` then \`Views/Shared/\`. You can also give a full path: \`~/Views/Shared/Cards/_StudentCard.cshtml\`.

If you do not pass a model, the partial receives the **parent view's model**. Avoid the old synchronous \`@Html.Partial(...)\` – it can cause deadlocks and the analyzer warns about it.

**Partial view vs View Component:** a partial only displays data given to it. A **View Component** (Extra topic 43) has its own C# class that can load data (e.g. a cart summary on every page).`,
      points: [
        'Layout = outer frame of the page (one per page)',
        'Partial view = reusable inner piece (many per page)',
        'Section = a named hole in the layout that a view may fill',
        'View Component = partial + its own logic/data loading',
      ],
    },
  ],
  examples: [
    {
      title: 'Razor syntax demo page',
      scenario: 'Create a RazorDemo page that shows every important piece of Razor syntax with a student model, so students can compare the .cshtml source with the HTML that reaches the browser (Ctrl+U).',
      steps: [
        'Open the SchoolMvc project (ASP.NET Core Web App (Model-View-Controller), .NET 10)',
        'Add Controllers/RazorDemoController.cs (Add > Controller > MVC Controller - Empty)',
        'Right-click Index() > Add View > Razor View - Empty > Index.cshtml and paste the view',
        'Press Ctrl+F5 and open /RazorDemo',
        'Press Ctrl+U in the browser to view the page source and confirm the Razor comment is gone but the HTML comment is present',
      ],
      code: `// ===== Controllers/RazorDemoController.cs =====
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Models;

namespace SchoolMvc.Controllers;

public class RazorDemoController : Controller
{
    public IActionResult Index()
    {
        var students = new List<Student>
        {
            new Student { Id = 1, Name = "Riya", Course = "DotNet", Marks = 92 },
            new Student { Id = 2, Name = "Karan", Course = "Java", Marks = 35 },
            new Student { Id = 3, Name = "<i>Sam</i>", Course = "React", Marks = 67 }
        };
        return View(students);
    }
}

@* ===== Views/RazorDemo/Index.cshtml ===== *@
@model List<SchoolMvc.Models.Student>
@{
    ViewData["Title"] = "Razor Syntax";
    int total = Model.Sum(s => s.Marks);
    int passed = Model.Count(s => s.Marks >= 40);
}

<h2>Razor syntax demo</h2>

<p>Students: @Model.Count | Total marks: @total | Average: @(total / Model.Count)</p>
<p>Passed: @passed of @Model.Count</p>

<ul>
@foreach (var s in Model)
{
    string grade = s.Marks switch
    {
        >= 90 => "A",
        >= 60 => "B",
        >= 40 => "C",
        _ => "F"
    };
    <li>
        @s.Name (@s.Course) - @s.Marks - Grade @grade
        @if (s.Marks >= 90)
        {
            <strong> Topper!</strong>
        }
        else if (s.Marks < 40)
        {
            <text> - needs support</text>
        }
    </li>
}
</ul>

@for (int i = 1; i <= 3; i++)
{
    @:Row @i&nbsp;
}

@* Razor comment: not sent to the browser *@
<!-- HTML comment: visible with Ctrl+U -->

<p>Mail us at office@school.com or follow @@schoolapp</p>
<p>Encoded: @Model[2].Name</p>
<p>Raw (unsafe for user input): @Html.Raw(Model[2].Name)</p>

@functions {
    string Stars(int marks) => new string('*', marks / 20);
}
<p>Riya stars: @Stars(Model[0].Marks)</p>`,
      result: `Razor syntax demo
Students: 3 | Total marks: 194 | Average: 64
Passed: 2 of 3
 - Riya (DotNet) - 92 - Grade A  Topper!
 - Karan (Java) - 35 - Grade F  - needs support
 - <i>Sam</i> (React) - 67 - Grade B
Row 1 Row 2 Row 3
Mail us at office@school.com or follow @schoolapp
Encoded: <i>Sam</i>            (the tags are shown as text; source contains &lt;i&gt;Sam&lt;/i&gt;)
Raw (unsafe for user input): Sam  (shown in italics)
Riya stars: ****

Ctrl+U shows "<!-- HTML comment: visible with Ctrl+U -->" but no trace of the Razor comment.`,
      explanation: 'total = 92 + 35 + 67 = 194 and 194 / 3 = 64 (integer division). @(...) is needed for the division because of the operator. Inside the foreach the C# switch expression computes the grade; HTML tags like <li> switch Razor back to markup automatically. <text> and @: output plain text from inside code. The third student name contains HTML and is encoded by @, while Html.Raw renders it as real italics – this is why Html.Raw on user input is an XSS risk. Stars(92) = 92 / 20 = 4 stars.',
    },
    {
      title: 'Custom layout with sections, _ViewStart and _ViewImports',
      scenario: 'Replace the default layout with a simple SchoolApp layout that has a navbar, a required-false Sidebar section with default content, and a Scripts section. Make one page use no layout.',
      steps: [
        'Open Views/Shared/_Layout.cshtml and replace it with the code (or create _SchoolLayout.cshtml and point _ViewStart to it)',
        'Check Views/_ViewStart.cshtml and Views/_ViewImports.cshtml match the code',
        'Edit Views/Home/Index.cshtml to define the Sidebar and Scripts sections',
        'Add Views/Home/Print.cshtml with Layout = null and a Print action in HomeController',
        'Press Ctrl+F5, compare / (with sidebar) and /Home/Privacy (default sidebar) and /Home/Print (no layout)',
      ],
      code: `@* ===== Views/_ViewImports.cshtml ===== *@
@using SchoolMvc
@using SchoolMvc.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers

@* ===== Views/_ViewStart.cshtml ===== *@
@{
    Layout = "_Layout";
}

@* ===== Views/Shared/_Layout.cshtml ===== *@
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>@ViewData["Title"] - SchoolApp</title>
    <link rel="stylesheet" href="~/lib/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" href="~/css/site.css" asp-append-version="true" />
</head>
<body>
    <nav class="navbar navbar-expand bg-dark navbar-dark px-3">
        <a class="navbar-brand" asp-controller="Home" asp-action="Index">SchoolApp</a>
        <a class="nav-link text-light" asp-controller="Student" asp-action="Index">Students</a>
        <a class="nav-link text-light" asp-controller="Home" asp-action="Privacy">Privacy</a>
    </nav>

    <div class="container mt-3">
        <div class="row">
            <aside class="col-md-3">
                @if (IsSectionDefined("Sidebar"))
                {
                    @await RenderSectionAsync("Sidebar")
                }
                else
                {
                    <p class="text-muted">Default sidebar: Quick links</p>
                }
            </aside>
            <main class="col-md-9">
                @RenderBody()
            </main>
        </div>
    </div>

    <footer class="text-center border-top mt-4 p-2">&copy; @DateTime.Now.Year SchoolApp</footer>

    <script src="~/lib/jquery/dist/jquery.min.js"></script>
    <script src="~/lib/bootstrap/dist/js/bootstrap.bundle.min.js"></script>
    @await RenderSectionAsync("Scripts", required: false)
</body>
</html>

@* ===== Views/Home/Index.cshtml ===== *@
@{
    ViewData["Title"] = "Home";
}
<h1>Welcome to SchoolApp</h1>
<p>Manage students, courses and results.</p>

@section Sidebar {
    <div class="card p-2">
        <b>Notice board</b>
        <p>Exams start on Monday.</p>
    </div>
}

@section Scripts {
    <script>console.log("Home page loaded");</script>
}

// ===== HomeController.cs (new action) =====
public IActionResult Print() => View();

@* ===== Views/Home/Print.cshtml ===== *@
@{
    Layout = null;      // no navbar/footer for printing
}
<!DOCTYPE html>
<html>
<head><title>Print</title></head>
<body>
    <h3>Printable report - no layout</h3>
</body>
</html>`,
      result: `/            -> navbar + sidebar card "Notice board / Exams start on Monday." + "Welcome to SchoolApp" + footer "(c) 2026 SchoolApp".
               Browser tab title: "Home - SchoolApp". F12 Console shows: Home page loaded
/Home/Privacy -> same navbar/footer, sidebar shows "Default sidebar: Quick links" (Privacy did not define the section).
/Home/Print  -> only "Printable report - no layout" (no navbar, no footer, no Bootstrap).`,
      explanation: '_ViewStart sets Layout for all views, so Index and Privacy use _Layout automatically. The view\'s content goes where RenderBody() is. IsSectionDefined lets the layout show default content when a view does not supply a Sidebar section. Scripts is rendered after jQuery/Bootstrap so page scripts can use them. Layout = null in Print switches the layout off. Note: a section defined in a view but never rendered by the layout causes an error "The following sections have been defined but have not been rendered".',
    },
    {
      title: 'Student listing page with partial views (table row, card) and an AJAX partial',
      scenario: 'Build /Student with a toggle between table view and card view. Each row and card is a partial view. A "Toppers" button loads a partial table via fetch() without reloading the page.',
      steps: [
        'Ensure Models/Student.cs and Data/StudentRepository.cs from Day 66/67 exist and are registered with AddSingleton',
        'Right-click Views/Shared > Add > View > Razor View - Empty > _StudentRow.cshtml; repeat for _StudentCard.cshtml and _StudentTable.cshtml',
        'Replace Controllers/StudentController.cs Index and add the Toppers action',
        'Replace Views/Student/Index.cshtml',
        'Press Ctrl+F5, open /Student, then /Student?view=cards, then click "Load toppers"',
        'Open F12 > Network and click the "Toppers" request – the response is only a <table> fragment (no layout)',
      ],
      code: `// ===== Controllers/StudentController.cs =====
using Microsoft.AspNetCore.Mvc;
using SchoolMvc.Data;

namespace SchoolMvc.Controllers;

public class StudentController : Controller
{
    private readonly StudentRepository _repo;
    public StudentController(StudentRepository repo) => _repo = repo;

    // GET /Student?view=cards
    public IActionResult Index(string view = "table")
    {
        ViewData["Title"] = "Students";
        ViewData["Mode"] = view;
        return View(_repo.GetAll());
    }

    // GET /Student/Toppers  -> HTML fragment
    public IActionResult Toppers()
    {
        var toppers = _repo.GetAll().Where(s => s.Marks >= 85).ToList();
        return PartialView("_StudentTable", toppers);
    }
}

@* ===== Views/Shared/_StudentRow.cshtml ===== *@
@model Student
<tr class="@(Model.Marks < 40 ? "table-danger" : "")">
    <td>@Model.Id</td>
    <td>@Model.Name</td>
    <td>@Model.Course</td>
    <td>@Model.Marks</td>
    <td>@(Model.Marks >= 40 ? "Pass" : "Fail")</td>
</tr>

@* ===== Views/Shared/_StudentTable.cshtml ===== *@
@model List<Student>
<table class="table table-bordered">
    <thead><tr><th>Id</th><th>Name</th><th>Course</th><th>Marks</th><th>Result</th></tr></thead>
    <tbody>
        @foreach (var s in Model)
        {
            <partial name="_StudentRow" model="s" />
        }
    </tbody>
</table>

@* ===== Views/Shared/_StudentCard.cshtml ===== *@
@model Student
<div class="col-md-4">
    <div class="card mb-3 @(Model.Marks >= 90 ? "border-success" : "")">
        <div class="card-body">
            <h5 class="card-title">@Model.Name</h5>
            <p class="card-text">@Model.Course - @Model.Marks marks</p>
        </div>
    </div>
</div>

@* ===== Views/Student/Index.cshtml ===== *@
@model List<Student>
@{
    string mode = ViewData["Mode"] as string ?? "table";
}

<h2>Students (@Model.Count)</h2>
<a asp-route-view="table" class="btn btn-outline-primary btn-sm">Table</a>
<a asp-route-view="cards" class="btn btn-outline-primary btn-sm">Cards</a>
<hr />

@if (mode == "cards")
{
    <div class="row">
        @foreach (var s in Model)
        {
            @await Html.PartialAsync("_StudentCard", s)
        }
    </div>
}
else
{
    <partial name="_StudentTable" model="Model" />
}

<button id="btnToppers" class="btn btn-success">Load toppers</button>
<div id="toppers" class="mt-3"></div>

@section Scripts {
    <script>
        document.getElementById("btnToppers").addEventListener("click", async () => {
            const res = await fetch("/Student/Toppers");
            document.getElementById("toppers").innerHTML = await res.text();
        });
    </script>
}`,
      result: `/Student (repository: Riya Sharma DotNet 88, Karan Mehta Java 34, Meera Iyer React 91)
Students (3)
[Table] [Cards]
Id | Name        | Course | Marks | Result
1  | Riya Sharma | DotNet | 88    | Pass
2  | Karan Mehta | Java   | 34    | Fail     <- red row (table-danger)
3  | Meera Iyer  | React  | 91    | Pass

/Student?view=cards -> three Bootstrap cards; Meera's card has a green border (>= 90).

Click "Load toppers" -> below the button a new table appears with Riya Sharma (88) and Meera Iyer (91).
Network tab: GET /Student/Toppers 200 text/html, response starts with <table class="table table-bordered"> (no <html>, no navbar).`,
      explanation: 'The same _StudentRow partial is reused for every row, and _StudentTable is reused twice: inside the full page and as the AJAX response. PartialView() skips the layout and _ViewStart, so only the fragment is returned. <partial> and Html.PartialAsync are equivalent; both are asynchronous. asp-route-view="cards" generates /Student?view=cards because "view" is not a route parameter, so it becomes a query string value. The JavaScript lives in the Scripts section so it runs after the layout loads its libraries.',
    },
    {
      title: 'Console demo: how a layout, a view and a partial combine into one HTML page',
      scenario: 'Simulate the Razor pipeline with three C# methods: Layout (RenderBody), the Student Index view (loop) and a _StudentRow partial (with HTML encoding). Watch how encoding neutralises a malicious name.',
      steps: [
        'File > New > Project > Console App > name RazorPipelineDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change WebUtility.HtmlEncode(s.Name) to just s.Name and run again to see what "Html.Raw" would do',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Net;
using System.Text;

var students = new List<Student>
{
    new Student(1, "Riya", 88),
    new Student(2, "Karan", 34),
    new Student(3, "<b>Hacker</b>", 70)
};

string body = StudentIndexView(students);          // the view
string page = Layout("Student List", body);         // the layout wraps the view
Console.WriteLine(page);

// Views/Shared/_Layout.cshtml
static string Layout(string title, string renderBody)
{
    var sb = new StringBuilder();
    sb.AppendLine("<html>");
    sb.AppendLine($"<head><title>{title} - SchoolApp</title></head>");
    sb.AppendLine("<body>");
    sb.AppendLine("<nav>Home | Students</nav>");
    sb.Append(renderBody);                              // @RenderBody()
    sb.AppendLine("<footer>(c) 2026 SchoolApp</footer>");
    sb.AppendLine("</body>");
    sb.Append("</html>");
    return sb.ToString();
}

// Views/Student/Index.cshtml
static string StudentIndexView(List<Student> model)
{
    var sb = new StringBuilder();
    sb.AppendLine($"<h2>Students ({model.Count})</h2>");
    sb.AppendLine("<table>");
    foreach (var s in model)
        sb.AppendLine(StudentRowPartial(s));            // <partial name="_StudentRow" model="s" />
    sb.AppendLine("</table>");
    return sb.ToString();
}

// Views/Shared/_StudentRow.cshtml
static string StudentRowPartial(Student s)
{
    string result = s.Marks >= 40 ? "Pass" : "Fail";
    // @s.Name is HTML-encoded by Razor automatically
    return $"<tr><td>{s.Id}</td><td>{WebUtility.HtmlEncode(s.Name)}</td><td>{s.Marks}</td><td>{result}</td></tr>";
}

public record Student(int Id, string Name, int Marks);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Net;
using System.Text;

var students = new List<Student>
{
    new Student(1, "Riya", 88),
    new Student(2, "Karan", 34),
    new Student(3, "<b>Hacker</b>", 70)
};

string body = StudentIndexView(students);          // the view
string page = Layout("Student List", body);         // the layout wraps the view
Console.WriteLine(page);

// Views/Shared/_Layout.cshtml
static string Layout(string title, string renderBody)
{
    var sb = new StringBuilder();
    sb.AppendLine("<html>");
    sb.AppendLine($"<head><title>{title} - SchoolApp</title></head>");
    sb.AppendLine("<body>");
    sb.AppendLine("<nav>Home | Students</nav>");
    sb.Append(renderBody);                              // @RenderBody()
    sb.AppendLine("<footer>(c) 2026 SchoolApp</footer>");
    sb.AppendLine("</body>");
    sb.Append("</html>");
    return sb.ToString();
}

// Views/Student/Index.cshtml
static string StudentIndexView(List<Student> model)
{
    var sb = new StringBuilder();
    sb.AppendLine($"<h2>Students ({model.Count})</h2>");
    sb.AppendLine("<table>");
    foreach (var s in model)
        sb.AppendLine(StudentRowPartial(s));            // <partial name="_StudentRow" model="s" />
    sb.AppendLine("</table>");
    return sb.ToString();
}

// Views/Shared/_StudentRow.cshtml
static string StudentRowPartial(Student s)
{
    string result = s.Marks >= 40 ? "Pass" : "Fail";
    // @s.Name is HTML-encoded by Razor automatically
    return $"<tr><td>{s.Id}</td><td>{WebUtility.HtmlEncode(s.Name)}</td><td>{s.Marks}</td><td>{result}</td></tr>";
}

public record Student(int Id, string Name, int Marks);
`,
        },
        stdin: '',
      },
      result: `<html>
<head><title>Student List - SchoolApp</title></head>
<body>
<nav>Home | Students</nav>
<h2>Students (3)</h2>
<table>
<tr><td>1</td><td>Riya</td><td>88</td><td>Pass</td></tr>
<tr><td>2</td><td>Karan</td><td>34</td><td>Fail</td></tr>
<tr><td>3</td><td>&lt;b&gt;Hacker&lt;/b&gt;</td><td>70</td><td>Pass</td></tr>
</table>
<footer>(c) 2026 SchoolApp</footer>
</body>
</html>`,
      explanation: 'The view is produced first, then passed to the layout, which inserts it at the RenderBody position – exactly the order Razor uses. The partial is called once per student. WebUtility.HtmlEncode turns <b> into &lt;b&gt;, so the browser would show the text "<b>Hacker</b>" instead of bold text; Razor does this automatically for every @ expression (using an even stricter encoder). Karan has 34 < 40, so Fail.',
    },
  ],
  interview: [
    { q: 'What is Razor?', a: 'Razor is the ASP.NET Core view engine/markup syntax that combines HTML with C# in .cshtml files. The @ symbol switches to C#. Views are compiled into C# classes that write HTML to the response.', level: 'Easy' },
    { q: 'Difference between @Model.Name and @(Model.Marks * 2)?', a: '@Model.Name is an implicit expression (stops at a space or operator). @(...) is an explicit expression and is required when the expression contains spaces, operators, generics or would be ambiguous with surrounding text.', level: 'Easy' },
    { q: 'How does Razor protect against XSS?', a: 'All output from @ expressions is HTML-encoded by default, so characters like < > & " are converted to entities and user-supplied script is shown as text instead of executed. Only @Html.Raw bypasses encoding.', level: 'Medium' },
    { q: 'What is the difference between a Razor comment and an HTML comment?', a: '@* ... *@ is removed at compile time and never sent to the browser. <!-- ... --> is sent to the browser and visible in View Source.', level: 'Easy' },
    { q: 'What is a layout page? What do RenderBody and RenderSection do?', a: 'A layout is a shared master template (html, head, navbar, footer). RenderBody() inserts the content of the current view; it must appear exactly once. RenderSection("Name", required) renders a named section that the view defines with @section Name { }.', level: 'Easy' },
    { q: 'What is _ViewStart.cshtml?', a: 'A file whose code runs before each view in its folder hierarchy. It usually sets Layout = "_Layout" so every view uses the layout without repeating the line.', level: 'Easy' },
    { q: 'What is _ViewImports.cshtml used for?', a: 'To share directives across views: @using namespaces, @addTagHelper, @inject services, @model base types. It produces no output.', level: 'Easy' },
    { q: 'What is a partial view and how do you render it?', a: 'A reusable piece of Razor markup (name starts with _), rendered with <partial name="_X" model="m" />, @await Html.PartialAsync("_X", m), or returned from a controller with PartialView(). It does not use a layout and _ViewStart does not run for it.', level: 'Easy' },
    { q: 'Why avoid @Html.Partial and @Html.RenderPartial?', a: 'They are synchronous and can cause thread-pool starvation or deadlocks. Use the Partial tag helper or Html.PartialAsync / RenderPartialAsync.', level: 'Medium' },
    { q: 'Difference between a partial view and a View Component?', a: 'A partial view only renders the data passed to it. A View Component has its own C# class (InvokeAsync) that can call services and load data, so it suits independent widgets like a shopping cart summary or menu.', level: 'Medium' },
    { q: 'What happens if a view defines a section that the layout never renders?', a: 'An InvalidOperationException: "The following sections have been defined but have not been rendered by the page". Either render it in the layout or call IgnoreSection.', level: 'Hard' },
    { q: 'How do you disable the layout for a single view?', a: 'Set @{ Layout = null; } at the top of the view. Returning PartialView() from the controller also skips the layout.', level: 'Easy' },
    { q: 'How do you write a literal @ in Razor, e.g. a CSS @media rule or a Twitter handle?', a: 'Use @@, which outputs a single @. Email addresses like a@b.com are detected automatically and need no escaping.', level: 'Medium' },
    { q: 'How do you output plain text inside a Razor code block?', a: 'Wrap it in <text>...</text> or start the line with @: . Otherwise Razor treats the text as C# code.', level: 'Medium' },
    { q: 'Output? In a view: @{ int a = 7, b = 2; } <p>@(a / b)</p>', a: '<p>3</p> — integer division in C#.', level: 'Easy' },
    { q: 'Output? In a view: @{ var x = "<b>Hi</b>"; } @x', a: 'The literal text <b>Hi</b> is displayed (source has &lt;b&gt;Hi&lt;/b&gt;) because Razor HTML-encodes the value.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a view that shows a multiplication table of a number passed in the URL (/Table/Show/7) using @for and Razor expressions.',
      hint: 'Action Show(int id) => View(id); view has @model int.',
      solution: `public class TableController : Controller
{
    public IActionResult Show(int id = 2) => View(id);
}

@* Views/Table/Show.cshtml *@
@model int
<h3>Table of @Model</h3>
<table class="table">
@for (int i = 1; i <= 10; i++)
{
    <tr><td>@Model x @i</td><td>= @(Model * i)</td></tr>
}
</table>`,
    },
    {
      task: 'Create _AdminLayout.cshtml that uses _Layout as its parent (nested layout) and adds a red "Admin Area" bar above RenderBody. Use it in an Admin/Dashboard view.',
      hint: 'In _AdminLayout set Layout = "_Layout"; inside, call RenderBody().',
      solution: `@* Views/Shared/_AdminLayout.cshtml *@
@{
    Layout = "_Layout";
}
<div class="alert alert-danger">Admin Area</div>
@RenderBody()
@section Scripts {
    @await RenderSectionAsync("Scripts", required: false)
}

@* Views/Admin/Dashboard.cshtml *@
@{
    Layout = "_AdminLayout";
    ViewData["Title"] = "Dashboard";
}
<h2>Dashboard</h2>`,
    },
    {
      task: 'Create a _Pager partial that receives the current page and total pages and renders Previous/Next links.',
      hint: 'Create a small model class PagerModel { int Page; int TotalPages; } and pass it with <partial name="_Pager" model="..." />.',
      solution: `public class PagerModel { public int Page { get; set; } public int TotalPages { get; set; } }

@* Views/Shared/_Pager.cshtml *@
@model PagerModel
<nav>
    @if (Model.Page > 1)
    {
        <a asp-route-page="@(Model.Page - 1)">Previous</a>
    }
    <span> Page @Model.Page of @Model.TotalPages </span>
    @if (Model.Page < Model.TotalPages)
    {
        <a asp-route-page="@(Model.Page + 1)">Next</a>
    }
</nav>

@* usage *@
<partial name="_Pager" model='new PagerModel { Page = 2, TotalPages = 5 }' />`,
    },
    {
      task: 'Make the Sidebar section REQUIRED in the layout, run the app, read the error, then fix it.',
      hint: 'RenderSectionAsync("Sidebar", required: true). Pages without the section will fail.',
      solution: `Error: InvalidOperationException: The layout page '/Views/Shared/_Layout.cshtml' cannot find the section 'Sidebar' in the content page '/Views/Home/Privacy.cshtml'.
Fix: either add @section Sidebar { ... } to every view, or go back to required: false / IsSectionDefined with default content.`,
    },
    {
      task: 'In the console RazorPipelineDemo, add a second partial _Summary that prints "Passed: X / Y" below the table.',
      hint: 'Count students with Marks >= 40 and append it in StudentIndexView after </table>.',
      solution: `static string SummaryPartial(List<Student> model)
{
    int passed = model.Count(s => s.Marks >= 40);   // add using System.Linq;
    return $"<p>Passed: {passed} / {model.Count}</p>";
}
// in StudentIndexView after "</table>":
sb.AppendLine(SummaryPartial(model));
// Output line added: <p>Passed: 2 / 3</p>`,
    },
  ],
  quiz: [
    { question: 'Which Razor syntax is NOT sent to the browser?', options: ['<!-- comment -->', '@* comment *@', '<text>comment</text>', '@:comment'], answer: 1, explanation: 'Razor comments are removed during compilation.' },
    { question: 'Which call inserts the current view\'s content into a layout?', options: ['@RenderSection()', '@Html.Partial()', '@RenderBody()', '@RenderPage()'], answer: 2, explanation: 'RenderBody marks where the view content goes.' },
    { question: 'Which file sets the default layout for all views?', options: ['_ViewImports.cshtml', '_Layout.cshtml', 'Program.cs', '_ViewStart.cshtml'], answer: 3, explanation: '_ViewStart runs before each view and sets Layout.' },
    { question: 'What does @Html.Raw(userInput) do?', options: ['Outputs the value without HTML encoding', 'Encodes the value twice', 'Removes all HTML tags', 'Validates the input'], answer: 0, explanation: 'Html.Raw skips encoding – dangerous for user data (XSS).' },
    { question: 'Which is the recommended way to render a partial view?', options: ['@Html.RenderPartial("_Row")', '<partial name="_Row" model="s" />', '@RenderBody("_Row")', '@section _Row { }'], answer: 1, explanation: 'The Partial Tag Helper is asynchronous and recommended.' },
  ],
};
