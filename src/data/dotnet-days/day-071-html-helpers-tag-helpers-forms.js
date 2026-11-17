export default {
  id: 'day-071-html-helpers-tag-helpers-forms',
  title: 'HTML Helpers, Tag Helpers and Form Submission',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 71,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Learn the two ways Razor views generate HTML from your C# model: the older HTML Helpers (@Html.TextBoxFor) and the modern Tag Helpers (asp-for). You will build a complete Employee form with text boxes, email, salary, dropdown, radio buttons, checkbox, date and textarea, submit it with POST, validate it and redirect with the Post-Redirect-Get pattern.`,
  objectives: [
    'Explain what HTML Helpers and Tag Helpers are and why they are better than hand-written HTML',
    'Use form, label, input, select, textarea, validation and anchor Tag Helpers with asp-for, asp-action and asp-route-*',
    'Build the same form with HTML Helpers (BeginForm, TextBoxFor, DropDownListFor, RadioButtonFor, CheckBoxFor)',
    'Understand how a form POST is bound to a model through the name attribute, and how the anti-forgery token protects it',
    'Apply the Post-Redirect-Get pattern with TempData to show a success message',
  ],
  theory: [
    {
      heading: 'Why we need helpers in Razor views',
      content: `When you write a form by hand you must keep the HTML **in sync** with the C# model: the \`name\` attribute must match the property name, the \`type\` must match the data type, old values must be put back after a validation error, and error messages must be shown next to each field.

ASP.NET Core gives two tools that do this automatically by reading your **model metadata** (property name, type, [Display], [Required], [Range] ...):

- **HTML Helpers** – C# methods called with \`@Html.Xxx(...)\` inside the view. They return an HTML string. They came from classic ASP.NET MVC.
- **Tag Helpers** – special attributes like \`asp-for\`, \`asp-action\` placed on **normal HTML tags**. The server replaces them with real HTML. They were introduced in ASP.NET Core and are the recommended way today.

Real-world analogy: an HTML Helper is like **filling a form by dictating** to a clerk ("make me a textbox for Salary"); a Tag Helper is like **writing the form yourself on a smart paper** that auto-fills the boring parts (id, name, value, validation).`,
      points: [
        'Both read the model metadata and produce the SAME final HTML',
        'Both automatically re-fill values after a validation error (from ModelState)',
        'Both add data-val-* attributes used by jQuery unobtrusive validation for client-side checks',
        'Tag Helpers look like HTML, so designers and IntelliSense work better with them',
      ],
    },
    {
      heading: 'Enabling Tag Helpers: _ViewImports.cshtml',
      content: `Tag Helpers only work when they are **registered**. The MVC template already does this in \`Views/_ViewImports.cshtml\`:

The line \`@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers\` means "enable all (*) tag helpers from the assembly Microsoft.AspNetCore.Mvc.TagHelpers". In Visual Studio, an attribute recognised as a Tag Helper is shown in **bold purple** – a quick way to know it is active.

You can disable a tag helper on one element with \`!\` (example: \`<!span asp-validation-for="Name"></!span>\`) or remove registration with \`@removeTagHelper\`.`,
      syntax: `@using EmployeeApp
@using EmployeeApp.Models
@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers`,
    },
    {
      heading: 'Most used Tag Helpers',
      content: `| Tag Helper | Example | What it generates |
|---|---|---|
| Form | \`<form asp-controller="Employee" asp-action="Create" method="post">\` | action="/Employee/Create" + hidden anti-forgery token |
| Label | \`<label asp-for="FullName">\` | \`<label for="FullName">Full Name</label>\` (uses [Display]) |
| Input | \`<input asp-for="Email">\` | type="email", id, name, value, data-val-* |
| Select | \`<select asp-for="Department" asp-items="...">\` | options with the selected one marked |
| Textarea | \`<textarea asp-for="Address">\` | textarea with id/name/value |
| Validation message | \`<span asp-validation-for="Salary">\` | error text for one field |
| Validation summary | \`<div asp-validation-summary="All">\` | list of all errors (All / ModelOnly / None) |
| Anchor | \`<a asp-action="Edit" asp-route-id="5">\` | href="/Employee/Edit/5" |
| Partial | \`<partial name="_EmployeeRow" model="e" />\` | renders a partial view |
| Environment | \`<environment include="Development">\` | content only in that environment |
| Image | \`<img src="~/img/logo.png" asp-append-version="true">\` | adds ?v=hash for cache busting |

**Input type mapping by asp-for:** string → text, [EmailAddress] → email, [DataType(Password)] → password, bool → checkbox (plus a hidden false input), int/long → number, DateTime → datetime-local, [DataType(Date)] → date, decimal/double → text (add type="number" yourself if you want spinner arrows).`,
    },
    {
      heading: 'HTML Helpers (the classic way)',
      content: `HTML Helpers are extension methods on \`IHtmlHelper\`. The strongly typed versions end with **For** and take a lambda, so renaming a property gives a compile error instead of a silent bug.`,
      points: [
        '@using (Html.BeginForm("Create", "Employee", FormMethod.Post)) { ... } – form (auto-adds anti-forgery token for POST)',
        '@Html.LabelFor(m => m.FullName), @Html.TextBoxFor(m => m.FullName), @Html.PasswordFor(...)',
        '@Html.TextAreaFor(m => m.Address), @Html.HiddenFor(m => m.Id)',
        '@Html.DropDownListFor(m => m.Department, list, "-- Select --")',
        '@Html.RadioButtonFor(m => m.Gender, "Male"), @Html.CheckBoxFor(m => m.IsPermanent)',
        '@Html.EditorFor(m => m.JoiningDate) – picks an input based on type/DataType',
        '@Html.DisplayFor(m => m.Salary), @Html.DisplayNameFor(m => m.Salary)',
        '@Html.ValidationMessageFor(m => m.Salary), @Html.ValidationSummary(true)',
        '@Html.ActionLink("Edit", "Edit", new { id = 5 }) – anchor link',
        'Pass extra attributes with an anonymous object: new { @class = "form-control" } (use @class because class is a C# keyword)',
      ],
      tip: `In new code prefer Tag Helpers. Still learn HTML Helpers – many company projects migrated from ASP.NET MVC 5 use them, and DisplayFor/DisplayNameFor are still used in Tag Helper views.`,
    },
    {
      heading: 'Form submission: GET and POST actions, name attribute and model binding',
      content: `A typical form uses **two actions with the same name**:

1. **[HttpGet] Create()** – shows the empty form.
2. **[HttpPost] Create(Employee employee)** – receives the submitted data.

When the user clicks Submit, the browser sends the body as \`application/x-www-form-urlencoded\`, for example \`FullName=Asha+Rao&Email=asha%40corp.com&Salary=45000\`. **Model binding** matches each **name** to a property of \`Employee\`. That is why asp-for is so useful – it always writes the correct name.

**Checkbox trick:** an unchecked checkbox sends nothing, so the helper adds a hidden input \`IsPermanent=false\`. When checked, the browser sends \`IsPermanent=true&IsPermanent=false\` and the binder takes the first value (true).

**Anti-forgery token:** the form tag helper adds a hidden \`__RequestVerificationToken\`. Put \`[ValidateAntiForgeryToken]\` on the POST action so another website cannot submit forms on behalf of a logged-in user (CSRF attack).`,
    },
    {
      heading: 'Post-Redirect-Get (PRG) and redisplaying the form',
      content: `After a **successful** POST, never return the view directly – the user pressing F5 would submit the data again. Instead **redirect** to a GET action (\`RedirectToAction(nameof(Index))\`) and pass a one-time message with **TempData**.

If **validation fails** (\`!ModelState.IsValid\`), return \`View(employee)\` – the helpers read the posted values from ModelState and re-fill every field, and asp-validation-for shows each error. Remember to reload dropdown data (ViewBag) before returning the view, because ViewBag does not survive between requests.`,
      points: [
        'Success → RedirectToAction + TempData["Message"]',
        'Failure → reload dropdown lists, return View(model)',
        'Add _ValidationScriptsPartial in @section Scripts for instant client-side validation',
      ],
    },
  ],
  examples: [
    {
      title: 'Employee form with Tag Helpers (complete MVC flow)',
      scenario: `HR wants a web page to add employees: full name, email, salary, department (dropdown), gender (radio), permanent (checkbox), joining date and address. After saving, show the list with a success message.`,
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Next',
        'Project name: EmployeeApp > Next > Framework .NET 10.0 (or .NET 8.0) > Authentication: None > Create',
        'Right-click Models > Add > Class > Employee.cs and paste the model code',
        'Right-click Controllers > Add > Controller > MVC Controller - Empty > EmployeeController.cs and paste the controller',
        'Right-click Views > Add > New Folder > Employee. Inside it Add > View > Razor View - Empty: Create.cshtml and Index.cshtml',
        'Check Views/_ViewImports.cshtml contains @addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers',
        'Press Ctrl+F5 and browse to /Employee/Create. Submit empty first to see errors, then fill and Save',
        'Right-click the page > View Page Source to see the HTML generated by the Tag Helpers',
      ],
      code: `// ===== Models/Employee.cs =====
using System.ComponentModel.DataAnnotations;

namespace EmployeeApp.Models;

public class Employee
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Full name is required")]
    [StringLength(60)]
    [Display(Name = "Full Name")]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress]
    [Display(Name = "Email Address")]
    public string Email { get; set; } = string.Empty;

    [Range(10000, 500000, ErrorMessage = "Salary must be between 10000 and 500000")]
    public decimal Salary { get; set; }

    [Required(ErrorMessage = "Please select a department")]
    public string Department { get; set; } = string.Empty;

    [Required(ErrorMessage = "Please choose a gender")]
    public string Gender { get; set; } = string.Empty;

    [Display(Name = "Permanent Employee")]
    public bool IsPermanent { get; set; }

    [DataType(DataType.Date)]
    [Display(Name = "Joining Date")]
    public DateTime JoiningDate { get; set; } = DateTime.Today;

    [DataType(DataType.MultilineText)]
    public string? Address { get; set; }
}

// ===== Controllers/EmployeeController.cs =====
using EmployeeApp.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace EmployeeApp.Controllers;

public class EmployeeController : Controller
{
    // in-memory store for today (EF Core comes in Module 7)
    private static readonly List<Employee> _employees = new();
    private static int _nextId = 1;

    public IActionResult Index() => View(_employees);

    [HttpGet]
    public IActionResult Create()
    {
        LoadDepartments();
        return View(new Employee());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Create(Employee employee)
    {
        if (!ModelState.IsValid)
        {
            LoadDepartments();          // ViewBag is empty on a new request
            return View(employee);      // redisplay with errors and old values
        }

        employee.Id = _nextId++;
        _employees.Add(employee);
        TempData["Message"] = $"Employee {employee.FullName} saved successfully.";
        return RedirectToAction(nameof(Index));   // Post-Redirect-Get
    }

    private void LoadDepartments()
    {
        ViewBag.Departments = new List<SelectListItem>
        {
            new("Information Technology", "IT"),
            new("Human Resources", "HR"),
            new("Finance", "Finance"),
            new("Sales", "Sales")
        };
    }
}

@* ===== Views/Employee/Create.cshtml ===== *@
@model EmployeeApp.Models.Employee
@{
    ViewData["Title"] = "Add Employee";
}
<h2>Add Employee</h2>

<form asp-controller="Employee" asp-action="Create" method="post" class="col-md-6">
    <div asp-validation-summary="ModelOnly" class="text-danger"></div>

    <div class="mb-3">
        <label asp-for="FullName" class="form-label"></label>
        <input asp-for="FullName" class="form-control" placeholder="e.g. Asha Rao" />
        <span asp-validation-for="FullName" class="text-danger"></span>
    </div>

    <div class="mb-3">
        <label asp-for="Email" class="form-label"></label>
        <input asp-for="Email" class="form-control" />
        <span asp-validation-for="Email" class="text-danger"></span>
    </div>

    <div class="mb-3">
        <label asp-for="Salary" class="form-label"></label>
        <input asp-for="Salary" type="number" class="form-control" />
        <span asp-validation-for="Salary" class="text-danger"></span>
    </div>

    <div class="mb-3">
        <label asp-for="Department" class="form-label"></label>
        <select asp-for="Department" asp-items="ViewBag.Departments" class="form-select">
            <option value="">-- Select --</option>
        </select>
        <span asp-validation-for="Department" class="text-danger"></span>
    </div>

    <div class="mb-3">
        <label class="form-label d-block">Gender</label>
        <input asp-for="Gender" type="radio" value="Male" id="genderMale" class="form-check-input" />
        <label for="genderMale" class="me-3">Male</label>
        <input asp-for="Gender" type="radio" value="Female" id="genderFemale" class="form-check-input" />
        <label for="genderFemale">Female</label>
        <br /><span asp-validation-for="Gender" class="text-danger"></span>
    </div>

    <div class="form-check mb-3">
        <input asp-for="IsPermanent" class="form-check-input" />
        <label asp-for="IsPermanent" class="form-check-label"></label>
    </div>

    <div class="mb-3">
        <label asp-for="JoiningDate" class="form-label"></label>
        <input asp-for="JoiningDate" class="form-control" />
    </div>

    <div class="mb-3">
        <label asp-for="Address" class="form-label"></label>
        <textarea asp-for="Address" rows="3" class="form-control"></textarea>
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
    <a asp-action="Index" class="btn btn-secondary">Back to list</a>
</form>

@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}

@* ===== Views/Employee/Index.cshtml ===== *@
@model List<EmployeeApp.Models.Employee>
@{
    ViewData["Title"] = "Employees";
}
<h2>Employees</h2>

@if (TempData["Message"] != null)
{
    <div class="alert alert-success">@TempData["Message"]</div>
}

<a asp-action="Create" class="btn btn-primary mb-3">+ Add Employee</a>

<table class="table table-bordered">
    <thead>
        <tr><th>Id</th><th>Name</th><th>Email</th><th>Dept</th><th>Salary</th><th>Permanent</th></tr>
    </thead>
    <tbody>
    @foreach (var e in Model)
    {
        <tr>
            <td>@e.Id</td>
            <td>@e.FullName</td>
            <td>@e.Email</td>
            <td>@e.Department</td>
            <td>@e.Salary.ToString("0.00")</td>
            <td>@(e.IsPermanent ? "Yes" : "No")</td>
        </tr>
    }
    </tbody>
</table>`,
      result: `GET /Employee/Create shows the form. Submitting it empty shows red messages: "Full name is required", "The Email Address field is required.", "Salary must be between 10000 and 500000", "Please select a department", "Please choose a gender" (instantly in the browser thanks to _ValidationScriptsPartial).

After a valid submit the browser is redirected to /Employee/Index which shows:
[green alert] Employee Asha Rao saved successfully.
Id | Name     | Email          | Dept | Salary   | Permanent
1  | Asha Rao | asha@corp.com  | IT   | 45000.00 | Yes

View Page Source of the FullName box shows something like:
<input class="form-control" placeholder="e.g. Asha Rao" type="text" data-val="true" data-val-length="The field Full Name must be a string with a maximum length of 60." data-val-length-max="60" data-val-required="Full name is required" id="FullName" maxlength="60" name="FullName" value="" />`,
      explanation: `asp-for wrote id, name, type, maxlength and all data-val-* attributes from the model attributes. The form tag helper produced action="/Employee/Create" and a hidden __RequestVerificationToken that [ValidateAntiForgeryToken] checks. On failure we reload ViewBag.Departments (ViewBag lives for one request only) and return the same view so values and errors are kept; on success we redirect (PRG) and show TempData once.`,
    },
    {
      title: 'The same Employee form with HTML Helpers',
      scenario: `Your company has an older MVC 5 project that uses @Html helpers. Build the same form with HTML Helpers so you can read and maintain such code.`,
      steps: [
        'In the same EmployeeApp project, right-click Views/Employee > Add > View > Razor View - Empty > name it CreateClassic.cshtml',
        'Paste the view code below',
        'In EmployeeController add the two CreateClassic actions shown at the top of the code (they reuse the same model and LoadDepartments)',
        'Press Ctrl+F5 and open /Employee/CreateClassic',
        'Compare View Page Source with the Tag Helper version – the generated inputs are the same',
      ],
      code: `// ===== add inside EmployeeController =====
[HttpGet]
public IActionResult CreateClassic()
{
    LoadDepartments();
    return View(new Employee());
}

[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult CreateClassic(Employee employee)
{
    if (!ModelState.IsValid)
    {
        LoadDepartments();
        return View(employee);
    }
    employee.Id = _nextId++;
    _employees.Add(employee);
    TempData["Message"] = $"Employee {employee.FullName} saved (classic form).";
    return RedirectToAction(nameof(Index));
}

@* ===== Views/Employee/CreateClassic.cshtml ===== *@
@model EmployeeApp.Models.Employee
@using Microsoft.AspNetCore.Mvc.Rendering
@{
    ViewData["Title"] = "Add Employee (HTML Helpers)";
}
<h2>Add Employee (HTML Helpers)</h2>

@using (Html.BeginForm("CreateClassic", "Employee", FormMethod.Post, new { @class = "col-md-6" }))
{
    @* BeginForm with POST adds the anti-forgery token automatically *@
    @Html.ValidationSummary(true, "", new { @class = "text-danger" })
    @Html.HiddenFor(m => m.Id)

    <div class="mb-3">
        @Html.LabelFor(m => m.FullName, new { @class = "form-label" })
        @Html.TextBoxFor(m => m.FullName, new { @class = "form-control" })
        @Html.ValidationMessageFor(m => m.FullName, "", new { @class = "text-danger" })
    </div>

    <div class="mb-3">
        @Html.LabelFor(m => m.Email, new { @class = "form-label" })
        @Html.TextBoxFor(m => m.Email, new { @class = "form-control", type = "email" })
        @Html.ValidationMessageFor(m => m.Email, "", new { @class = "text-danger" })
    </div>

    <div class="mb-3">
        @Html.LabelFor(m => m.Salary, new { @class = "form-label" })
        @Html.TextBoxFor(m => m.Salary, new { @class = "form-control", type = "number" })
        @Html.ValidationMessageFor(m => m.Salary, "", new { @class = "text-danger" })
    </div>

    <div class="mb-3">
        @Html.LabelFor(m => m.Department, new { @class = "form-label" })
        @Html.DropDownListFor(m => m.Department,
            (IEnumerable<SelectListItem>)ViewBag.Departments,
            "-- Select --", new { @class = "form-select" })
        @Html.ValidationMessageFor(m => m.Department, "", new { @class = "text-danger" })
    </div>

    <div class="mb-3">
        <span class="form-label d-block">Gender</span>
        @Html.RadioButtonFor(m => m.Gender, "Male", new { id = "male" }) <label for="male">Male</label>
        @Html.RadioButtonFor(m => m.Gender, "Female", new { id = "female" }) <label for="female">Female</label>
        @Html.ValidationMessageFor(m => m.Gender, "", new { @class = "text-danger" })
    </div>

    <div class="form-check mb-3">
        @Html.CheckBoxFor(m => m.IsPermanent, new { @class = "form-check-input" })
        @Html.LabelFor(m => m.IsPermanent, new { @class = "form-check-label" })
    </div>

    <div class="mb-3">
        @Html.LabelFor(m => m.JoiningDate, new { @class = "form-label" })
        @Html.EditorFor(m => m.JoiningDate, new { htmlAttributes = new { @class = "form-control" } })
    </div>

    <div class="mb-3">
        @Html.LabelFor(m => m.Address, new { @class = "form-label" })
        @Html.TextAreaFor(m => m.Address, 3, 40, new { @class = "form-control" })
    </div>

    <button type="submit" class="btn btn-primary">Save</button>
    @Html.ActionLink("Back to list", "Index", "Employee", null, new { @class = "btn btn-secondary" })
}

@section Scripts {
    @{ await Html.RenderPartialAsync("_ValidationScriptsPartial"); }
}`,
      result: `/Employee/CreateClassic shows the same form as the Tag Helper version. Validation errors, re-filled values and the redirect with "Employee ... saved (classic form)." behave exactly the same. View Page Source shows identical <input ... data-val-... name="FullName"> markup and one hidden __RequestVerificationToken input.`,
      explanation: `HTML Helpers are plain C# method calls. Extra HTML attributes are passed as an anonymous object, and because class is a C# keyword we write @class. EditorFor uses an extra wrapper object (htmlAttributes = new {...}). DropDownListFor needs a cast because ViewBag is dynamic and extension methods cannot be called with dynamic arguments.`,
    },
    {
      title: 'Console demo: how a Tag Helper turns model metadata into HTML',
      scenario: `To understand what asp-for does internally, build a tiny console "tag helper" that reads property type and [Display]/[EmailAddress] attributes with reflection and prints the HTML it would generate.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App > Next',
        'Name it TagHelperSimulator > Framework .NET 10.0 (or 8.0) > Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run',
      ],
      code: `using System;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

var emp = new Employee
{
    Id = 7,
    FullName = "Asha Rao",
    Email = "asha@corp.com",
    Salary = 45000,
    Department = "IT",
    IsPermanent = true
};

Console.WriteLine(TagHelperSim.Label<Employee>("FullName"));
Console.WriteLine(TagHelperSim.Input(emp, "FullName"));
Console.WriteLine(TagHelperSim.Label<Employee>("Email"));
Console.WriteLine(TagHelperSim.Input(emp, "Email"));
Console.WriteLine(TagHelperSim.Label<Employee>("Salary"));
Console.WriteLine(TagHelperSim.Input(emp, "Salary"));
Console.WriteLine(TagHelperSim.Input(emp, "IsPermanent"));
Console.WriteLine(TagHelperSim.Hidden(emp, "Id"));

public class Employee
{
    public int Id { get; set; }

    [Display(Name = "Full Name")]
    public string FullName { get; set; } = "";

    [EmailAddress]
    [Display(Name = "Email Address")]
    public string Email { get; set; } = "";

    public int Salary { get; set; }

    public string Department { get; set; } = "";

    [Display(Name = "Permanent?")]
    public bool IsPermanent { get; set; }
}

public static class TagHelperSim
{
    // like <label asp-for="...">
    public static string Label<T>(string prop)
    {
        PropertyInfo p = typeof(T).GetProperty(prop)!;
        DisplayAttribute? display = p.GetCustomAttribute<DisplayAttribute>();
        string text = display?.Name ?? prop;
        return $"""<label for="{prop}">{text}</label>""";
    }

    // like <input asp-for="...">
    public static string Input<T>(T model, string prop)
    {
        PropertyInfo p = typeof(T).GetProperty(prop)!;
        object? value = p.GetValue(model);

        string type = "text";
        if (p.PropertyType == typeof(int)) type = "number";
        else if (p.PropertyType == typeof(bool)) type = "checkbox";
        else if (p.GetCustomAttribute<EmailAddressAttribute>() != null) type = "email";

        if (type == "checkbox")
        {
            string isChecked = (bool)value! ? """ checked="checked" """.TrimEnd() : "";
            return $"""<input type="checkbox" id="{prop}" name="{prop}" value="true"{isChecked} />""";
        }
        return $"""<input type="{type}" id="{prop}" name="{prop}" value="{value}" />""";
    }

    // like <input asp-for="Id" type="hidden">
    public static string Hidden<T>(T model, string prop)
    {
        object? value = typeof(T).GetProperty(prop)!.GetValue(model);
        return $"""<input type="hidden" id="{prop}" name="{prop}" value="{value}" />""";
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.ComponentModel.DataAnnotations;
using System.Reflection;

var emp = new Employee
{
    Id = 7,
    FullName = "Asha Rao",
    Email = "asha@corp.com",
    Salary = 45000,
    Department = "IT",
    IsPermanent = true
};

Console.WriteLine(TagHelperSim.Label<Employee>("FullName"));
Console.WriteLine(TagHelperSim.Input(emp, "FullName"));
Console.WriteLine(TagHelperSim.Label<Employee>("Email"));
Console.WriteLine(TagHelperSim.Input(emp, "Email"));
Console.WriteLine(TagHelperSim.Label<Employee>("Salary"));
Console.WriteLine(TagHelperSim.Input(emp, "Salary"));
Console.WriteLine(TagHelperSim.Input(emp, "IsPermanent"));
Console.WriteLine(TagHelperSim.Hidden(emp, "Id"));

public class Employee
{
    public int Id { get; set; }

    [Display(Name = "Full Name")]
    public string FullName { get; set; } = "";

    [EmailAddress]
    [Display(Name = "Email Address")]
    public string Email { get; set; } = "";

    public int Salary { get; set; }

    public string Department { get; set; } = "";

    [Display(Name = "Permanent?")]
    public bool IsPermanent { get; set; }
}

public static class TagHelperSim
{
    // like <label asp-for="...">
    public static string Label<T>(string prop)
    {
        PropertyInfo p = typeof(T).GetProperty(prop)!;
        DisplayAttribute? display = p.GetCustomAttribute<DisplayAttribute>();
        string text = display?.Name ?? prop;
        return $"""<label for="{prop}">{text}</label>""";
    }

    // like <input asp-for="...">
    public static string Input<T>(T model, string prop)
    {
        PropertyInfo p = typeof(T).GetProperty(prop)!;
        object? value = p.GetValue(model);

        string type = "text";
        if (p.PropertyType == typeof(int)) type = "number";
        else if (p.PropertyType == typeof(bool)) type = "checkbox";
        else if (p.GetCustomAttribute<EmailAddressAttribute>() != null) type = "email";

        if (type == "checkbox")
        {
            string isChecked = (bool)value! ? """ checked="checked" """.TrimEnd() : "";
            return $"""<input type="checkbox" id="{prop}" name="{prop}" value="true"{isChecked} />""";
        }
        return $"""<input type="{type}" id="{prop}" name="{prop}" value="{value}" />""";
    }

    // like <input asp-for="Id" type="hidden">
    public static string Hidden<T>(T model, string prop)
    {
        object? value = typeof(T).GetProperty(prop)!.GetValue(model);
        return $"""<input type="hidden" id="{prop}" name="{prop}" value="{value}" />""";
    }
}`,
        },
        stdin: '',
      },
      result: `<label for="FullName">Full Name</label>
<input type="text" id="FullName" name="FullName" value="Asha Rao" />
<label for="Email">Email Address</label>
<input type="email" id="Email" name="Email" value="asha@corp.com" />
<label for="Salary">Salary</label>
<input type="number" id="Salary" name="Salary" value="45000" />
<input type="checkbox" id="IsPermanent" name="IsPermanent" value="true" checked="checked" />
<input type="hidden" id="Id" name="Id" value="7" />`,
      explanation: `Label uses [Display(Name)] if present, otherwise the property name (Salary has no [Display], so the label text is "Salary"). Input picks the type from the C# type or [EmailAddress]. We used C# 11 raw string literals ("""...""") so double quotes need no escaping. The real InputTagHelper does the same plus data-val-* attributes and reading values from ModelState after a failed POST.`,
    },
    {
      title: 'Console demo: what the browser POSTs and how it binds (checkbox trick)',
      scenario: `Understand form submission: parse the raw urlencoded body the browser sends and bind it to an Employee, including the hidden "false" value that the checkbox helper adds.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it FormPostDemo > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: in your EmployeeApp press F12 in the browser > Network tab > submit the form > click the request > Payload to see the real body',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Globalization;

// Bodies exactly as a browser sends them (application/x-www-form-urlencoded)
string checkedBody = "FullName=Ravi+Kumar&Email=ravi%40corp.com&Salary=52000&Department=HR&IsPermanent=true&IsPermanent=false";
string uncheckedBody = "FullName=Meena+Shah&Email=meena%40corp.com&Salary=38000&Department=Sales&IsPermanent=false";

Show(checkedBody);
Show(uncheckedBody);

static void Show(string body)
{
    Console.WriteLine("Body : " + body);
    Dictionary<string, List<string>> form = Parse(body);

    // Model binding: match each form NAME to a property
    var emp = new Employee
    {
        FullName = form["FullName"][0],
        Email = form["Email"][0],
        Salary = int.Parse(form["Salary"][0], CultureInfo.InvariantCulture),
        Department = form["Department"][0],
        IsPermanent = bool.Parse(form["IsPermanent"][0])   // first value wins
    };
    Console.WriteLine("Bound: " + emp);
    Console.WriteLine();
}

static Dictionary<string, List<string>> Parse(string body)
{
    var result = new Dictionary<string, List<string>>();
    foreach (string pair in body.Split('&'))
    {
        string[] kv = pair.Split('=');
        string key = Uri.UnescapeDataString(kv[0].Replace('+', ' '));
        string value = Uri.UnescapeDataString(kv[1].Replace('+', ' '));
        if (!result.ContainsKey(key)) result[key] = new List<string>();
        result[key].Add(value);
    }
    return result;
}

public class Employee
{
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public int Salary { get; set; }
    public string Department { get; set; } = "";
    public bool IsPermanent { get; set; }

    public override string ToString() =>
        $"{FullName} | {Email} | {Salary} | {Department} | Permanent={IsPermanent}";
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Globalization;

// Bodies exactly as a browser sends them (application/x-www-form-urlencoded)
string checkedBody = "FullName=Ravi+Kumar&Email=ravi%40corp.com&Salary=52000&Department=HR&IsPermanent=true&IsPermanent=false";
string uncheckedBody = "FullName=Meena+Shah&Email=meena%40corp.com&Salary=38000&Department=Sales&IsPermanent=false";

Show(checkedBody);
Show(uncheckedBody);

static void Show(string body)
{
    Console.WriteLine("Body : " + body);
    Dictionary<string, List<string>> form = Parse(body);

    // Model binding: match each form NAME to a property
    var emp = new Employee
    {
        FullName = form["FullName"][0],
        Email = form["Email"][0],
        Salary = int.Parse(form["Salary"][0], CultureInfo.InvariantCulture),
        Department = form["Department"][0],
        IsPermanent = bool.Parse(form["IsPermanent"][0])   // first value wins
    };
    Console.WriteLine("Bound: " + emp);
    Console.WriteLine();
}

static Dictionary<string, List<string>> Parse(string body)
{
    var result = new Dictionary<string, List<string>>();
    foreach (string pair in body.Split('&'))
    {
        string[] kv = pair.Split('=');
        string key = Uri.UnescapeDataString(kv[0].Replace('+', ' '));
        string value = Uri.UnescapeDataString(kv[1].Replace('+', ' '));
        if (!result.ContainsKey(key)) result[key] = new List<string>();
        result[key].Add(value);
    }
    return result;
}

public class Employee
{
    public string FullName { get; set; } = "";
    public string Email { get; set; } = "";
    public int Salary { get; set; }
    public string Department { get; set; } = "";
    public bool IsPermanent { get; set; }

    public override string ToString() =>
        $"{FullName} | {Email} | {Salary} | {Department} | Permanent={IsPermanent}";
}`,
        },
        stdin: '',
      },
      result: `Body : FullName=Ravi+Kumar&Email=ravi%40corp.com&Salary=52000&Department=HR&IsPermanent=true&IsPermanent=false
Bound: Ravi Kumar | ravi@corp.com | 52000 | HR | Permanent=True

Body : FullName=Meena+Shah&Email=meena%40corp.com&Salary=38000&Department=Sales&IsPermanent=false
Bound: Meena Shah | meena@corp.com | 38000 | Sales | Permanent=False
`,
      explanation: `In urlencoded bodies a space becomes + and @ becomes %40, so we decode them. A checked checkbox sends "true" AND the hidden "false"; the first value (true) wins. An unchecked checkbox sends only the hidden "false", so the property becomes False instead of being missing. bool.ToString() prints True/False with a capital letter.`,
    },
  ],
  interview: [
    { q: 'What is the difference between HTML Helpers and Tag Helpers?', a: `HTML Helpers are C# methods (@Html.TextBoxFor) that return HTML strings; Tag Helpers are server-side attributes (asp-for) on normal HTML elements. Both use model metadata and generate the same HTML, but Tag Helpers look like HTML, give better IntelliSense and are the recommended approach in ASP.NET Core.`, level: 'Easy' },
    { q: 'How do you enable Tag Helpers in a project?', a: `Add @addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers in Views/_ViewImports.cshtml (the MVC template already has it). Custom tag helpers are added with @addTagHelper *, YourAssemblyName.`, level: 'Easy' },
    { q: 'What does asp-for generate on an input?', a: `The id and name attributes (from the property path), the type (from C# type or DataType/EmailAddress attributes), the current value (from ModelState or the model) and data-val-* attributes for client-side validation, plus maxlength for [StringLength].`, level: 'Medium' },
    { q: 'Why does CheckBoxFor / asp-for on a bool render a hidden input?', a: `An unchecked checkbox is not posted at all. The hidden input with value false guarantees that the key is always present, so the property binds to false. When checked, true comes first and wins.`, level: 'Medium' },
    { q: 'What is the anti-forgery token and how is it used?', a: `A hidden __RequestVerificationToken input (plus a cookie) added by the form tag helper or Html.BeginForm for POST. [ValidateAntiForgeryToken] (or AutoValidateAntiforgeryToken globally) verifies it to prevent Cross-Site Request Forgery.`, level: 'Medium' },
    { q: 'What is the Post-Redirect-Get pattern?', a: `After a successful POST the action returns a redirect (302) to a GET action instead of a view. Refreshing the page then repeats the harmless GET, not the POST, so data is not inserted twice. TempData carries the success message across the redirect.`, level: 'Medium' },
    { q: 'Why do we write @class in new { @class = "form-control" }?', a: `class is a reserved C# keyword. The @ prefix makes it a valid identifier (verbatim identifier) so the anonymous object property is named class.`, level: 'Easy' },
    { q: 'What are the options of asp-validation-summary?', a: `All – shows property and model-level errors; ModelOnly – only errors not tied to a property (e.g. ModelState.AddModelError(string.Empty, ...)); None – shows nothing.`, level: 'Medium' },
    { q: 'How do you generate a link /Employee/Edit/5 with a Tag Helper and an HTML Helper?', a: `<a asp-controller="Employee" asp-action="Edit" asp-route-id="5">Edit</a> and @Html.ActionLink("Edit", "Edit", "Employee", new { id = 5 }, null).`, level: 'Easy' },
    { q: 'Why do we reload ViewBag dropdown data when ModelState is invalid?', a: `ViewBag/ViewData live only for the current request. The POST request is new, so the list is empty unless we fill it again before returning View(model); otherwise the select renders without options or throws.`, level: 'Medium' },
    { q: 'Output question: a form posts Salary=abc for an int property. What happens?', a: `Model binding fails for Salary, ModelState gets the error "The value 'abc' is not valid for Salary.", the property keeps its default 0 and ModelState.IsValid is false. The view re-displays "abc" because helpers read the attempted value from ModelState.`, level: 'Hard' },
    { q: 'What does asp-append-version="true" do on img/script/link tags?', a: `It appends a hash of the file content (?v=...) to the URL so browsers download a new copy when the file changes (cache busting).`, level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a Password and ConfirmPassword field to the Employee form using Tag Helpers and validate that they match.',
      hint: 'Use [DataType(DataType.Password)] and [Compare("Password")] on ConfirmPassword.',
      solution: `[Required, DataType(DataType.Password), StringLength(20, MinimumLength = 6)]
public string Password { get; set; } = "";

[DataType(DataType.Password), Display(Name = "Confirm Password")]
[Compare("Password", ErrorMessage = "Passwords do not match")]
public string ConfirmPassword { get; set; } = "";

<!-- view -->
<label asp-for="Password"></label>
<input asp-for="Password" class="form-control" />
<span asp-validation-for="Password" class="text-danger"></span>
<label asp-for="ConfirmPassword"></label>
<input asp-for="ConfirmPassword" class="form-control" />
<span asp-validation-for="ConfirmPassword" class="text-danger"></span>`,
    },
    {
      task: 'Build the department dropdown from an enum instead of ViewBag.',
      hint: 'Html.GetEnumSelectList<T>() returns IEnumerable<SelectListItem>.',
      solution: `public enum Department { IT, HR, Finance, Sales }
// model: public Department Department { get; set; }

<select asp-for="Department" asp-items="Html.GetEnumSelectList<Department>()" class="form-select">
    <option value="">-- Select --</option>
</select>`,
    },
    {
      task: 'Create an Edit form that re-uses the same fields. Add Edit (GET/POST) actions and use a hidden Id.',
      hint: 'Move the fields into a partial _EmployeeFields.cshtml; add <input asp-for="Id" type="hidden" />.',
      solution: `[HttpGet]
public IActionResult Edit(int id)
{
    var emp = _employees.FirstOrDefault(e => e.Id == id);
    if (emp == null) return NotFound();
    LoadDepartments();
    return View(emp);
}

[HttpPost, ValidateAntiForgeryToken]
public IActionResult Edit(Employee employee)
{
    if (!ModelState.IsValid) { LoadDepartments(); return View(employee); }
    var index = _employees.FindIndex(e => e.Id == employee.Id);
    if (index < 0) return NotFound();
    _employees[index] = employee;
    TempData["Message"] = "Employee updated";
    return RedirectToAction(nameof(Index));
}

@* Edit.cshtml *@
<form asp-action="Edit" method="post">
    <input asp-for="Id" type="hidden" />
    <partial name="_EmployeeFields" model="Model" />
    <button class="btn btn-primary">Update</button>
</form>`,
    },
    {
      task: 'Add an Edit link for each row in Index using the anchor tag helper, and the same with Html.ActionLink.',
      hint: 'asp-route-id passes the route value id.',
      solution: `<td>
    <a asp-action="Edit" asp-route-id="@e.Id" class="btn btn-sm btn-warning">Edit</a>
    @Html.ActionLink("Edit (classic)", "Edit", new { id = e.Id })
</td>`,
    },
    {
      task: 'Show "Development mode" only when the app runs in Development using a Tag Helper.',
      hint: 'Use the environment tag helper in _Layout.cshtml.',
      solution: `<environment include="Development">
    <div class="alert alert-warning">Development mode</div>
</environment>
<environment exclude="Development">
    <!-- production analytics script -->
</environment>`,
    },
  ],
  quiz: [
    { question: 'Which line enables built-in Tag Helpers?', options: ['@using Microsoft.AspNetCore.Mvc', '@addTagHelper *, Microsoft.AspNetCore.Mvc.TagHelpers', '@inject TagHelpers', '@model TagHelpers'], answer: 1, explanation: 'The @addTagHelper directive in _ViewImports.cshtml registers all tag helpers from that assembly.' },
    { question: 'What input type does asp-for generate for a bool property?', options: ['text', 'radio', 'number', 'checkbox (plus a hidden false input)'], answer: 3, explanation: 'bool maps to checkbox, and a hidden input with value false is added so unchecked boxes still bind.' },
    { question: 'Which HTML Helper creates a dropdown bound to a property?', options: ['@Html.DropDownListFor', '@Html.TextBoxFor', '@Html.ListBox', '@Html.SelectFor'], answer: 0, explanation: 'DropDownListFor(m => m.Department, items, optionLabel) creates a select bound to the property.' },
    { question: 'After a successful POST, what should the action usually return?', options: ['View(model)', 'Content("ok")', 'RedirectToAction("Index")', 'Json(model)'], answer: 2, explanation: 'Post-Redirect-Get: redirect so that refreshing does not resubmit the form.' },
    { question: 'Which attribute on the POST action verifies the hidden form token?', options: ['[HttpPost]', '[ValidateAntiForgeryToken]', '[Authorize]', '[FromForm]'], answer: 1, explanation: '[ValidateAntiForgeryToken] checks __RequestVerificationToken to block CSRF attacks.' },
  ],
};
