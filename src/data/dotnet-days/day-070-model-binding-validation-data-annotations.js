export default {
  id: 'day-070-model-binding-validation-data-annotations',
  title: 'Model Binding, Model Validation and Data Annotations',
  module: 'Module 6: ASP.NET Core & .NET Web Development',
  day: 70,
  level: 'Intermediate',
  duration: '3 hours',
  summary: `Learn how ASP.NET Core turns raw request data (form fields, route values, query strings, JSON, headers) into C# parameters and objects – model binding – and how it checks that data with Data Annotations ([Required], [StringLength], [Range], [EmailAddress], [RegularExpression], [Compare] …), ModelState, client-side jQuery validation, custom validation attributes and IValidatableObject. You will build a complete Student Registration form with server- and client-side validation and the Post-Redirect-Get pattern.`,
  objectives: [
    'Explain how model binding fills simple and complex parameters from form, route and query values, and use [FromQuery], [FromRoute], [FromForm], [FromBody], [FromHeader]',
    'Prevent over-posting with ViewModels, [Bind] and [BindNever]',
    'Validate input with Data Annotations and check ModelState.IsValid on the server',
    'Enable client-side validation with jQuery Unobtrusive Validation and show errors with asp-validation-for and asp-validation-summary',
    'Write custom validation with a ValidationAttribute and cross-field validation with IValidatableObject',
  ],
  theory: [
    {
      heading: 'What is model binding?',
      content: `HTTP sends everything as **text**: \`Name=Asha+Rao&Age=21&IsHosteller=true\`. **Model binding** is the ASP.NET Core feature that reads this text and **converts it into .NET types** for your action parameters and model properties – strings, ints, decimals, DateTimes, bools, enums, lists and whole objects.

Without model binding you would write \`int age = int.Parse(Request.Form["Age"])\` for every field. With it you simply write:

\`public IActionResult Register(StudentRegistration model)\`

Analogy: model binding is like a **receptionist who reads a filled paper form** and types each answer into the correct box of the computer system, converting "twenty-one" into the number 21. If an answer cannot be converted (Age = "abc"), the receptionist notes an **error** (ModelState) instead of crashing.

**Where values come from (MVC, in this order for each name):**
1. Form fields (POST body, \`application/x-www-form-urlencoded\` or \`multipart/form-data\`)
2. Route values (\`{id}\` in the route template)
3. Query string (\`?page=2\`)

JSON request bodies are read **only** with \`[FromBody]\` (or automatically for complex types in \`[ApiController]\` Web APIs – Module 8).`,
      points: [
        'Matching is by NAME and is case-insensitive: field "fullname" fills property FullName',
        'Complex types are filled property by property; nested names use dots: Address.City',
        'Collections use indexes: Skills[0], Skills[1] or repeated keys Skills=C#&Skills=SQL',
        'A conversion failure does NOT throw: the property keeps its default value and an error is added to ModelState',
        'Model binding never fails because a field is missing – that is validation\'s job',
      ],
    },
    {
      heading: 'Binding source attributes and protecting against over-posting',
      content: `You can tell model binding exactly where to look:

| Attribute | Source | Example |
|---|---|---|
| \`[FromRoute]\` | Route value | \`[FromRoute] int id\` |
| \`[FromQuery]\` | Query string | \`[FromQuery] int page\` |
| \`[FromForm]\` | Form fields | \`[FromForm] string name\` |
| \`[FromBody]\` | Request body (JSON) | \`[FromBody] StudentDto dto\` – only ONE per action |
| \`[FromHeader(Name = "X-Api-Key")]\` | HTTP header | \`string apiKey\` |
| \`[FromServices]\` | DI container | \`[FromServices] ILogger<X> log\` |

**Over-posting (mass assignment):** if your \`Student\` entity has \`IsAdmin\` or \`Fees\` and you bind directly to it, an attacker can add \`IsAdmin=true\` to the form using DevTools. Defences:
- Bind to a **ViewModel/DTO** that contains only the editable fields (best).
- \`[Bind("FullName,Email,Course")]\` on the parameter – only these properties are bound.
- \`[BindNever]\` on a property – never bound from the request.
- \`[BindRequired]\` – adds a model error if the value is **missing** from the request (useful for non-nullable value types).`,
      syntax: `public IActionResult Search([FromQuery] string course, [FromQuery] int page = 1) { ... }

public IActionResult Edit([FromRoute] int id, [Bind("Name,Email,Course")] Student student) { ... }

public class Student
{
    public string Name { get; set; } = "";
    [BindNever] public bool IsAdmin { get; set; }      // never from request
    [BindRequired] public int Marks { get; set; }      // must be present
}`,
    },
    {
      heading: 'Data Annotations – the validation attributes',
      content: `Data Annotations live in \`System.ComponentModel.DataAnnotations\`. You put them on model properties; ASP.NET Core checks them after binding and fills **ModelState**.

| Attribute | Rule | Default message (if no ErrorMessage) |
|---|---|---|
| \`[Required]\` | Not null / not empty string | The {0} field is required. |
| \`[StringLength(50, MinimumLength = 3)]\` | Length range | The field {0} must be a string with a minimum length of 3 and a maximum length of 50. |
| \`[MinLength(3)]\` / \`[MaxLength(50)]\` | Min / max length (strings, arrays) | |
| \`[Range(18, 60)]\` | Numeric/date range | The field {0} must be between 18 and 60. |
| \`[EmailAddress]\` | Email format (contains one @ not at the ends) | The {0} field is not a valid e-mail address. |
| \`[Phone]\`, \`[Url]\`, \`[CreditCard]\` | Phone / URL / card format | |
| \`[RegularExpression("^[6-9][0-9]{9}$")]\` | Must match the regex | The field {0} must match the regular expression '...'. |
| \`[Compare("Password")]\` | Must equal another property | 'ConfirmPassword' and 'Password' do not match. |
| \`[Display(Name = "Full Name")]\` | Label text and {0} in messages | (not a validator) |
| \`[DataType(DataType.Password / Date / EmailAddress)]\` | Hint for input type / formatting | (not a validator, except client hints) |

Use \`ErrorMessage = "..."\` for friendly messages; \`{0}\` inside it is replaced by the display name.

**Nullable reference types:** in .NET 6+ projects with \`<Nullable>enable</Nullable>\`, a non-nullable \`string\` property is treated as **implicitly [Required]**. Use \`string?\` for optional fields.`,
    },
    {
      heading: 'ModelState and the server-side validation flow',
      content: `\`ModelState\` (a \`ModelStateDictionary\`) holds, for every bound field, the **attempted value** and any **errors** (binding errors + validation errors).

Standard POST pattern:
1. \`[HttpPost]\` action receives the model.
2. \`if (!ModelState.IsValid) return View(model);\` – redisplay the form; tag helpers show the old values and errors automatically.
3. Add business-rule errors yourself: \`ModelState.AddModelError("Email", "Email already registered");\` or \`ModelState.AddModelError(string.Empty, "General error")\` for the summary.
4. If valid: save, set \`TempData\` message, \`return RedirectToAction(...)\` (Post-Redirect-Get).

**Displaying errors in the view:**
- \`<span asp-validation-for="Email" class="text-danger"></span>\` – error for one field.
- \`<div asp-validation-summary="All">\` – all errors; \`ModelOnly\` – only errors added with an empty key; \`None\`.

**Server-side validation is mandatory.** Client-side validation is only for user comfort – anyone can disable JavaScript or send a request with Postman.`,
      syntax: `[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult Register(StudentRegistration model)
{
    if (_repo.EmailExists(model.Email))
        ModelState.AddModelError(nameof(model.Email), "This email is already registered");

    if (!ModelState.IsValid)
        return View(model);                         // show errors

    _repo.Add(model);
    TempData["Message"] = "Registration successful";
    return RedirectToAction(nameof(Success));
}`,
    },
    {
      heading: 'Client-side validation (jQuery Unobtrusive Validation)',
      content: `Tag helpers like \`<input asp-for="Email">\` read the Data Annotations and emit **data-val-*** attributes:

\`<input type="email" data-val="true" data-val-required="The Email field is required." data-val-email="..." id="Email" name="Email">\`

The scripts **jquery.validate.js** and **jquery.validate.unobtrusive.js** (already in the MVC template under wwwroot/lib) read these attributes and validate in the browser **before** the form is submitted, so the user sees errors instantly without a round-trip.

To enable them on a page add at the bottom of the view:

\`@section Scripts { <partial name="_ValidationScriptsPartial" /> }\`

Built-in client support: Required, StringLength, MinLength, MaxLength, Range, RegularExpression, Compare, EmailAddress, Phone, Url, CreditCard. Custom attributes are validated **only on the server** unless you also write a client adapter (IClientModelValidator + JavaScript). \`[Remote]\` calls a controller action via AJAX (e.g. "is this email free?").`,
      tip: 'Testing tip: press F12 > Console and type $("form").validate().settings.ignore = "*" or simply disable JavaScript to prove your server-side validation still works.',
    },
    {
      heading: 'Custom validation: ValidationAttribute and IValidatableObject',
      content: `**Custom attribute** – for a reusable rule on ONE property. Inherit \`ValidationAttribute\` and override \`IsValid\`:
- Return \`ValidationResult.Success\` when valid.
- Return \`new ValidationResult(message)\` when invalid.

**IValidatableObject** – for **cross-field** rules inside one class ("If course is DotNet, percentage must be at least 50"). Implement \`Validate(ValidationContext)\` and \`yield return\` errors with the member names they belong to. It runs **only after** all property attributes pass.

Order of validation: binding → property attributes (Required first) → IValidatableObject.Validate → your manual AddModelError checks in the action.`,
      syntax: `public class MinimumAgeAttribute : ValidationAttribute
{
    private readonly int _age;
    public MinimumAgeAttribute(int age) { _age = age; ErrorMessage = $"You must be at least {age} years old"; }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is DateTime dob && dob.AddYears(_age) <= DateTime.Today)
            return ValidationResult.Success;
        return new ValidationResult(ErrorMessage, new[] { context.MemberName! });
    }
}

public class StudentRegistration : IValidatableObject
{
    public string? Course { get; set; }
    public decimal Percentage { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (Course == "DotNet" && Percentage < 50)
            yield return new ValidationResult("DotNet course needs at least 50%", new[] { nameof(Percentage) });
    }
}`,
    },
  ],
  examples: [
    {
      title: 'Student Registration form with Data Annotations, server + client validation and PRG',
      scenario: 'Build /Registration with Full Name, Email, Mobile, Date of Birth (18+), Course dropdown, 12th Percentage, Password, Confirm Password and Accept Terms. Validate everything, reject a duplicate email, and redirect to a success page.',
      steps: [
        'Visual Studio: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > name StudentPortal > .NET 10 > Create',
        'Right-click Models > Add > Class > StudentRegistration.cs; add folder Validation > MinimumAgeAttribute.cs',
        'Add Data/RegistrationRepository.cs and register it in Program.cs: builder.Services.AddSingleton<RegistrationRepository>();',
        'Right-click Controllers > Add > Controller > MVC Controller - Empty > RegistrationController.cs',
        'Right-click Index() > Add View > Razor View - Empty > Index.cshtml; also add Success.cshtml',
        'Add "@using StudentPortal.Models" to Views/_ViewImports.cshtml if missing',
        'Press Ctrl+F5, open /Registration, click Register with an empty form (client-side errors), then fill it correctly',
        'Disable client validation to test the server: comment out the Scripts section, run again and submit invalid data',
      ],
      code: `// ===== Models/StudentRegistration.cs =====
using System.ComponentModel.DataAnnotations;
using StudentPortal.Validation;

namespace StudentPortal.Models;

public class StudentRegistration : IValidatableObject
{
    [Required(ErrorMessage = "Full name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "{0} must be 3-50 characters")]
    [Display(Name = "Full Name")]
    public string FullName { get; set; } = "";

    [Required]
    [EmailAddress(ErrorMessage = "Enter a valid email address")]
    public string Email { get; set; } = "";

    [Required]
    [RegularExpression("^[6-9][0-9]{9}$", ErrorMessage = "Enter a valid 10-digit mobile number")]
    public string Mobile { get; set; } = "";

    [Required(ErrorMessage = "Date of birth is required")]
    [DataType(DataType.Date)]
    [MinimumAge(18)]
    [Display(Name = "Date of Birth")]
    public DateTime? DateOfBirth { get; set; }

    [Required(ErrorMessage = "Please select a course")]
    public string? Course { get; set; }

    [Range(0, 100, ErrorMessage = "Percentage must be between 0 and 100")]
    [Display(Name = "12th Percentage")]
    public decimal Percentage { get; set; }

    [Required]
    [StringLength(20, MinimumLength = 6, ErrorMessage = "Password must be 6-20 characters")]
    [DataType(DataType.Password)]
    public string Password { get; set; } = "";

    [DataType(DataType.Password)]
    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    [Display(Name = "Confirm Password")]
    public string ConfirmPassword { get; set; } = "";

    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms")]
    [Display(Name = "I accept the terms and conditions")]
    public bool AcceptTerms { get; set; }

    // cross-field rule: runs only when all attributes above are valid
    public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
    {
        if (Course == "DotNet" && Percentage < 50)
            yield return new ValidationResult(
                "DotNet Full Stack requires at least 50% in 12th",
                new[] { nameof(Percentage) });
    }
}

// ===== Validation/MinimumAgeAttribute.cs =====
using System.ComponentModel.DataAnnotations;

namespace StudentPortal.Validation;

public class MinimumAgeAttribute : ValidationAttribute
{
    private readonly int _minAge;

    public MinimumAgeAttribute(int minAge)
    {
        _minAge = minAge;
        ErrorMessage = $"You must be at least {minAge} years old";
    }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value == null) return ValidationResult.Success;          // [Required] handles null
        if (value is DateTime dob && dob.AddYears(_minAge) <= DateTime.Today)
            return ValidationResult.Success;
        return new ValidationResult(ErrorMessage, new[] { validationContext.MemberName! });
    }
}

// ===== Data/RegistrationRepository.cs =====
using StudentPortal.Models;

namespace StudentPortal.Data;

public class RegistrationRepository
{
    private readonly List<StudentRegistration> _items = new();

    public bool EmailExists(string email) =>
        _items.Any(r => r.Email.Equals(email, StringComparison.OrdinalIgnoreCase))
        || email.Equals("taken@school.com", StringComparison.OrdinalIgnoreCase);   // demo

    public void Add(StudentRegistration r) => _items.Add(r);
    public int Count => _items.Count;
}

// ===== Program.cs (added line) =====
builder.Services.AddControllersWithViews();
builder.Services.AddSingleton<StudentPortal.Data.RegistrationRepository>();

// ===== Controllers/RegistrationController.cs =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using StudentPortal.Data;
using StudentPortal.Models;

namespace StudentPortal.Controllers;

public class RegistrationController : Controller
{
    private readonly RegistrationRepository _repo;
    public RegistrationController(RegistrationRepository repo) => _repo = repo;

    private void LoadCourses() =>
        ViewBag.Courses = new SelectList(new[] { "DotNet", "Java", "React", "Data Analytics" });

    [HttpGet]
    public IActionResult Index()
    {
        LoadCourses();
        return View(new StudentRegistration());
    }

    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Index(StudentRegistration model)
    {
        if (!string.IsNullOrEmpty(model.Email) && _repo.EmailExists(model.Email))
            ModelState.AddModelError(nameof(model.Email), "This email is already registered");

        if (!ModelState.IsValid)
        {
            LoadCourses();                      // dropdown data is not posted back
            return View(model);                 // redisplay with errors and old values
        }

        _repo.Add(model);
        TempData["Name"] = model.FullName;
        return RedirectToAction(nameof(Success));   // Post-Redirect-Get
    }

    public IActionResult Success() => View();
}

@* ===== Views/Registration/Index.cshtml ===== *@
@model StudentRegistration
@{ ViewData["Title"] = "Student Registration"; }

<h2>Student Registration</h2>
<form asp-action="Index" method="post" novalidate class="col-md-6">
    <div asp-validation-summary="ModelOnly" class="text-danger"></div>

    <div class="mb-2">
        <label asp-for="FullName" class="form-label"></label>
        <input asp-for="FullName" class="form-control" />
        <span asp-validation-for="FullName" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="Email" class="form-label"></label>
        <input asp-for="Email" class="form-control" />
        <span asp-validation-for="Email" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="Mobile" class="form-label"></label>
        <input asp-for="Mobile" class="form-control" />
        <span asp-validation-for="Mobile" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="DateOfBirth" class="form-label"></label>
        <input asp-for="DateOfBirth" class="form-control" />
        <span asp-validation-for="DateOfBirth" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="Course" class="form-label"></label>
        <select asp-for="Course" asp-items="ViewBag.Courses" class="form-select">
            <option value="">-- Select course --</option>
        </select>
        <span asp-validation-for="Course" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="Percentage" class="form-label"></label>
        <input asp-for="Percentage" class="form-control" />
        <span asp-validation-for="Percentage" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="Password" class="form-label"></label>
        <input asp-for="Password" class="form-control" />
        <span asp-validation-for="Password" class="text-danger"></span>
    </div>
    <div class="mb-2">
        <label asp-for="ConfirmPassword" class="form-label"></label>
        <input asp-for="ConfirmPassword" class="form-control" />
        <span asp-validation-for="ConfirmPassword" class="text-danger"></span>
    </div>
    <div class="form-check mb-2">
        <input asp-for="AcceptTerms" class="form-check-input" />
        <label asp-for="AcceptTerms" class="form-check-label"></label>
        <br /><span asp-validation-for="AcceptTerms" class="text-danger"></span>
    </div>
    <button type="submit" class="btn btn-primary">Register</button>
</form>

@section Scripts {
    <partial name="_ValidationScriptsPartial" />
}

@* ===== Views/Registration/Success.cshtml ===== *@
<div class="alert alert-success">
    Thank you @(TempData["Name"] ?? "student")! Your registration is complete.
</div>
<a asp-action="Index">Register another student</a>`,
      result: `1) Click Register on the empty form (client-side, no request sent):
   Full name is required
   The Email field is required.
   The Mobile field is required.
   Date of birth is required
   Please select a course
   The Password field is required.
   The Confirm Password field is required.   (implicit [Required]: non-nullable string with <Nullable>enable</Nullable>)
   (Percentage shows 0, which is inside 0-100; the custom MinimumAge and the bool-terms rule are fully enforced on the server round-trip)

2) Server-side with JavaScript disabled, submitting:
   FullName=As, Email=asha.com, Mobile=12345, DateOfBirth=2015-05-01, Course=Java, Percentage=120,
   Password=abc, ConfirmPassword=abd, AcceptTerms unchecked
   -> 200, the same form comes back with old values and:
   Full Name must be 3-50 characters
   Enter a valid email address
   Enter a valid 10-digit mobile number
   You must be at least 18 years old
   Percentage must be between 0 and 100
   Password must be 6-20 characters
   Passwords do not match
   You must accept the terms

3) Email = taken@school.com, everything else valid -> "This email is already registered"

4) Valid data with Course=DotNet and Percentage=45 -> "DotNet Full Stack requires at least 50% in 12th" under Percentage

5) Valid data: FullName=Asha Rao, Email=asha@mail.com, Mobile=9876543210, DateOfBirth=2004-03-15, Course=DotNet,
   Percentage=78.5, Password=secret12, ConfirmPassword=secret12, AcceptTerms checked
   -> 302 to /Registration/Success: "Thank you Asha Rao! Your registration is complete."
   Pressing F5 on the success page does not register again.`,
      explanation: 'Model binding converts every form field to the property type (DateTime?, decimal, bool). Data Annotations generate both data-val-* attributes for the browser and server-side checks. Because the password is too short, ConfirmPassword is compared separately and also fails. The custom MinimumAge attribute is server-only (no client adapter), so it appears after the round-trip. IValidatableObject.Validate runs only when all attribute validations pass, which is why the 50% rule is shown in case 4 and not in case 2. The duplicate-email rule needs the database, so it is added manually with ModelState.AddModelError. LoadCourses() is called again before redisplaying, because a dropdown list is never posted back.',
    },
    {
      title: 'Model binding sources: route, query, form, header, collections and [Bind]',
      scenario: 'A BindingDemoController shows how each parameter is filled, how lists bind, what happens on a conversion error, and how [Bind] blocks an over-posted IsAdmin field.',
      steps: [
        'In StudentPortal: Add > Controller > MVC Controller - Empty > BindingDemoController.cs',
        'Paste the code (actions return Content/Json so no views are needed except Form.cshtml)',
        'Add the BindingDemo.http file (Add > New Item > HTTP File) and click "Send request" above each request, or use Postman',
        'Set a breakpoint (F9) in Update and inspect ModelState in the Locals window (Debug > Windows > Locals)',
      ],
      code: `// ===== Controllers/BindingDemoController.cs =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace StudentPortal.Controllers;

public class StudentInput
{
    public string Name { get; set; } = "";
    public int Age { get; set; }
    public List<string> Skills { get; set; } = new();
    public bool IsAdmin { get; set; }               // must NOT come from users
}

[Route("bind")]
public class BindingDemoController : Controller
{
    // GET /bind/route/5?page=2   with header X-Client: mobile
    [HttpGet("route/{id:int}")]
    public IActionResult Sources([FromRoute] int id, [FromQuery] int page,
                                 [FromHeader(Name = "X-Client")] string? client)
        => Content($"id={id}, page={page}, client={client ?? "(none)"}");

    // POST /bind/update   (form fields)
    [HttpPost("update")]
    [IgnoreAntiforgeryToken]                         // demo only, so the .http file can post
    public IActionResult Update([Bind("Name,Age,Skills")] StudentInput input)
    {
        var errors = ModelState
            .Where(kv => kv.Value!.Errors.Count > 0)
            .Select(kv => $"{kv.Key}: {kv.Value!.Errors[0].ErrorMessage}")
            .ToList();

        return Json(new
        {
            input.Name,
            input.Age,
            Skills = string.Join("|", input.Skills),
            input.IsAdmin,
            IsValid = ModelState.IsValid,
            Errors = errors
        });
    }

    // POST /bind/json   (JSON body)
    [HttpPost("json")]
    [IgnoreAntiforgeryToken]
    public IActionResult FromJson([FromBody] StudentInput input) =>
        Content($"JSON -> {input.Name}, {input.Age}, skills {input.Skills.Count}");
}

### ===== BindingDemo.http =====
@host = https://localhost:7001

GET {{host}}/bind/route/5?page=2
X-Client: mobile

###
POST {{host}}/bind/update
Content-Type: application/x-www-form-urlencoded

name=Asha+Rao&age=21&skills[0]=CSharp&skills[1]=SQL&IsAdmin=true

###
POST {{host}}/bind/update
Content-Type: application/x-www-form-urlencoded

Name=Ravi&Age=abc&Skills=React&Skills=Azure

###
POST {{host}}/bind/json
Content-Type: application/json

{ "name": "Meera", "age": 22, "skills": ["Java", "Spring"] }`,
      result: `GET /bind/route/5?page=2 (X-Client: mobile)
-> id=5, page=2, client=mobile

POST /bind/update  name=Asha+Rao&age=21&skills[0]=CSharp&skills[1]=SQL&IsAdmin=true
-> {"name":"Asha Rao","age":21,"skills":"CSharp|SQL","isAdmin":false,"isValid":true,"errors":[]}

POST /bind/update  Name=Ravi&Age=abc&Skills=React&Skills=Azure
-> {"name":"Ravi","age":0,"skills":"React|Azure","isAdmin":false,"isValid":false,
    "errors":["Age: The value 'abc' is not valid for Age."]}

POST /bind/json  {"name":"Meera","age":22,"skills":["Java","Spring"]}
-> JSON -> Meera, 22, skills 2`,
      explanation: 'Names are matched case-insensitively ("name" filled Name) and "+" is decoded to a space. skills[0]/skills[1] (indexed) and repeated Skills keys both bind to a List<string>. IsAdmin=true was sent but [Bind("Name,Age,Skills")] ignores it – over-posting blocked. "abc" cannot become an int, so Age keeps 0 and ModelState gets a binding error instead of an exception. [FromBody] uses System.Text.Json (case-insensitive by default in ASP.NET Core) to read the JSON body.',
    },
    {
      title: 'Remote validation: check if an email is free while the user types',
      scenario: 'Add [Remote] to the Email property so the browser calls /Registration/CheckEmail via AJAX when the user leaves the Email field.',
      steps: [
        'Open StudentRegistration.cs and add the [Remote] attribute to Email (using Microsoft.AspNetCore.Mvc;)',
        'Add the CheckEmail action to RegistrationController',
        'Make sure the view includes _ValidationScriptsPartial',
        'Press Ctrl+F5, type taken@school.com in Email and press Tab; open F12 > Network to see the GET /Registration/CheckEmail?Email=taken%40school.com request',
      ],
      code: `// ===== Models/StudentRegistration.cs (Email property) =====
using Microsoft.AspNetCore.Mvc;

[Required]
[EmailAddress(ErrorMessage = "Enter a valid email address")]
[Remote(action: "CheckEmail", controller: "Registration")]
public string Email { get; set; } = "";

// ===== Controllers/RegistrationController.cs =====
[AcceptVerbs("GET", "POST")]
public IActionResult CheckEmail(string email)
{
    if (_repo.EmailExists(email))
        return Json($"Email {email} is already registered");   // string = error message
    return Json(true);                                          // true = valid
}`,
      result: `Type "taken@school.com" and press Tab:
Network: GET /Registration/CheckEmail?Email=taken%40school.com -> 200 "Email taken@school.com is already registered"
The message appears in red under Email immediately.

Type "new@school.com" and press Tab:
GET /Registration/CheckEmail?Email=new%40school.com -> 200 true  -> no error shown.`,
      explanation: '[Remote] only adds client-side data-val-remote attributes; jQuery Unobtrusive Validation makes the AJAX call. Returning Json(true) means valid; returning a JSON string means invalid with that message. Remote validation is NOT enforced on the server automatically – that is why the POST action still calls EmailExists (Example 1).',
    },
    {
      title: 'Console demo: simulate model binding from a form body',
      scenario: 'Parse a URL-encoded form body like the browser sends, convert each value to the property type with reflection, and record conversion errors in a "ModelState" list – a mini version of what ASP.NET Core does.',
      steps: [
        'File > New > Project > Console App > name ModelBindingDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change Age=abc to Age=25 in badBody and run again – ModelState becomes valid',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Reflection;

string body = "Name=Asha+Rao&Email=asha%40mail.com&Age=21&IsHosteller=true&Unknown=xyz";
string badBody = "Name=Ravi&Email=ravi%40mail.com&Age=abc";

Bind(body);
Console.WriteLine();
Bind(badBody);

static void Bind(string formBody)
{
    Console.WriteLine($"Body: {formBody}");

    // 1. read the form into a case-insensitive dictionary
    var form = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (string pair in formBody.Split('&'))
    {
        string[] kv = pair.Split('=');
        form[WebUtility.UrlDecode(kv[0])] = WebUtility.UrlDecode(kv[1]);
    }

    // 2. fill each property of the model by name
    var model = new Student();
    var errors = new List<string>();
    foreach (PropertyInfo prop in typeof(Student).GetProperties())
    {
        if (!form.TryGetValue(prop.Name, out string? raw))
        {
            Console.WriteLine($"  {prop.Name}: not in request, keeps default");
            continue;
        }
        try
        {
            object value = Convert.ChangeType(raw, prop.PropertyType, CultureInfo.InvariantCulture);
            prop.SetValue(model, value);
            Console.WriteLine($"  {prop.Name} <- '{raw}'");
        }
        catch (FormatException)
        {
            errors.Add($"The value '{raw}' is not valid for {prop.Name}.");
        }
    }

    // 3. report like ModelState
    Console.WriteLine($"  Bound model: {model}");
    Console.WriteLine($"  ModelState.IsValid = {errors.Count == 0}");
    foreach (string e in errors)
        Console.WriteLine($"  Error: {e}");
}

public class Student
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public int Age { get; set; }
    public bool IsHosteller { get; set; }

    public override string ToString() =>
        $"Name={Name}, Email={Email}, Age={Age}, IsHosteller={IsHosteller}";
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Net;
using System.Reflection;

string body = "Name=Asha+Rao&Email=asha%40mail.com&Age=21&IsHosteller=true&Unknown=xyz";
string badBody = "Name=Ravi&Email=ravi%40mail.com&Age=abc";

Bind(body);
Console.WriteLine();
Bind(badBody);

static void Bind(string formBody)
{
    Console.WriteLine($"Body: {formBody}");

    // 1. read the form into a case-insensitive dictionary
    var form = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
    foreach (string pair in formBody.Split('&'))
    {
        string[] kv = pair.Split('=');
        form[WebUtility.UrlDecode(kv[0])] = WebUtility.UrlDecode(kv[1]);
    }

    // 2. fill each property of the model by name
    var model = new Student();
    var errors = new List<string>();
    foreach (PropertyInfo prop in typeof(Student).GetProperties())
    {
        if (!form.TryGetValue(prop.Name, out string? raw))
        {
            Console.WriteLine($"  {prop.Name}: not in request, keeps default");
            continue;
        }
        try
        {
            object value = Convert.ChangeType(raw, prop.PropertyType, CultureInfo.InvariantCulture);
            prop.SetValue(model, value);
            Console.WriteLine($"  {prop.Name} <- '{raw}'");
        }
        catch (FormatException)
        {
            errors.Add($"The value '{raw}' is not valid for {prop.Name}.");
        }
    }

    // 3. report like ModelState
    Console.WriteLine($"  Bound model: {model}");
    Console.WriteLine($"  ModelState.IsValid = {errors.Count == 0}");
    foreach (string e in errors)
        Console.WriteLine($"  Error: {e}");
}

public class Student
{
    public string Name { get; set; } = "";
    public string Email { get; set; } = "";
    public int Age { get; set; }
    public bool IsHosteller { get; set; }

    public override string ToString() =>
        $"Name={Name}, Email={Email}, Age={Age}, IsHosteller={IsHosteller}";
}
`,
        },
        stdin: '',
      },
      result: `Body: Name=Asha+Rao&Email=asha%40mail.com&Age=21&IsHosteller=true&Unknown=xyz
  Name <- 'Asha Rao'
  Email <- 'asha@mail.com'
  Age <- '21'
  IsHosteller <- 'true'
  Bound model: Name=Asha Rao, Email=asha@mail.com, Age=21, IsHosteller=True
  ModelState.IsValid = True

Body: Name=Ravi&Email=ravi%40mail.com&Age=abc
  Name <- 'Ravi'
  Email <- 'ravi@mail.com'
  IsHosteller: not in request, keeps default
  Bound model: Name=Ravi, Email=ravi@mail.com, Age=0, IsHosteller=False
  ModelState.IsValid = False
  Error: The value 'abc' is not valid for Age.`,
      explanation: 'WebUtility.UrlDecode turns "+" into a space and "%40" into "@". Properties are visited in declaration order and matched by name; the extra "Unknown" field is simply ignored (no property has that name). Convert.ChangeType("abc", typeof(int)) throws FormatException, which we catch and record – Age keeps its default 0, just like real model binding. A missing field (IsHosteller in the second body) is not an error; only validation such as [Required] would complain. bool prints as "True"/"False".',
    },
    {
      title: 'Console demo: validate a model with Data Annotations and a custom attribute',
      scenario: 'Use the same Validator class that ASP.NET Core uses internally to check a valid and an invalid student registration, including a custom [AllowedCourse] attribute and [Compare].',
      steps: [
        'File > New > Project > Console App > name ValidationDemo > .NET 10 > Create',
        'Replace Program.cs with the code (System.ComponentModel.DataAnnotations is part of .NET, no NuGet package needed)',
        'Press Ctrl+F5',
        'Fix one property of "bad" at a time and run again to watch the error count fall',
      ],
      code: `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

var good = new StudentRegistration
{
    Name = "Asha Rao", Email = "asha@mail.com", Age = 21, Phone = "9876543210",
    Course = "DotNet", Password = "secret12", ConfirmPassword = "secret12"
};

var bad = new StudentRegistration
{
    Name = "", Email = "asha.com", Age = 15, Phone = "12345",
    Course = "Python", Password = "abc", ConfirmPassword = "abd"
};

Check("Valid student", good);
Check("Invalid student", bad);

static void Check(string label, object model)
{
    var results = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);
    Console.WriteLine($"{label}: IsValid = {ok}, errors = {results.Count}");
    foreach (var r in results)
        Console.WriteLine($"  {string.Join(",", r.MemberNames)}: {r.ErrorMessage}");
}

public class StudentRegistration
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Name must be 3-50 characters")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";

    [Range(18, 60, ErrorMessage = "Age must be between 18 and 60")]
    public int Age { get; set; }

    [Required(ErrorMessage = "Phone is required")]
    [RegularExpression("^[6-9][0-9]{9}$", ErrorMessage = "Enter a 10-digit mobile number starting with 6-9")]
    public string Phone { get; set; } = "";

    [AllowedCourse("DotNet", "Java", "React")]
    public string Course { get; set; } = "";

    [Required(ErrorMessage = "Password is required")]
    [StringLength(20, MinimumLength = 6, ErrorMessage = "Password must be 6-20 characters")]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";
}

public class AllowedCourseAttribute : ValidationAttribute
{
    private readonly string[] courses;
    public AllowedCourseAttribute(params string[] courses) { this.courses = courses; }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string course && Array.IndexOf(courses, course) >= 0)
            return ValidationResult.Success;
        return new ValidationResult(
            $"Course must be one of: {string.Join(", ", courses)}",
            new[] { validationContext.MemberName! });
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

var good = new StudentRegistration
{
    Name = "Asha Rao", Email = "asha@mail.com", Age = 21, Phone = "9876543210",
    Course = "DotNet", Password = "secret12", ConfirmPassword = "secret12"
};

var bad = new StudentRegistration
{
    Name = "", Email = "asha.com", Age = 15, Phone = "12345",
    Course = "Python", Password = "abc", ConfirmPassword = "abd"
};

Check("Valid student", good);
Check("Invalid student", bad);

static void Check(string label, object model)
{
    var results = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(model, new ValidationContext(model), results, validateAllProperties: true);
    Console.WriteLine($"{label}: IsValid = {ok}, errors = {results.Count}");
    foreach (var r in results)
        Console.WriteLine($"  {string.Join(",", r.MemberNames)}: {r.ErrorMessage}");
}

public class StudentRegistration
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Name must be 3-50 characters")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";

    [Range(18, 60, ErrorMessage = "Age must be between 18 and 60")]
    public int Age { get; set; }

    [Required(ErrorMessage = "Phone is required")]
    [RegularExpression("^[6-9][0-9]{9}$", ErrorMessage = "Enter a 10-digit mobile number starting with 6-9")]
    public string Phone { get; set; } = "";

    [AllowedCourse("DotNet", "Java", "React")]
    public string Course { get; set; } = "";

    [Required(ErrorMessage = "Password is required")]
    [StringLength(20, MinimumLength = 6, ErrorMessage = "Password must be 6-20 characters")]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";
}

public class AllowedCourseAttribute : ValidationAttribute
{
    private readonly string[] courses;
    public AllowedCourseAttribute(params string[] courses) { this.courses = courses; }

    protected override ValidationResult? IsValid(object? value, ValidationContext validationContext)
    {
        if (value is string course && Array.IndexOf(courses, course) >= 0)
            return ValidationResult.Success;
        return new ValidationResult(
            $"Course must be one of: {string.Join(", ", courses)}",
            new[] { validationContext.MemberName! });
    }
}
`,
        },
        stdin: '',
      },
      result: `Valid student: IsValid = True, errors = 0
Invalid student: IsValid = False, errors = 7
  Name: Name is required
  Email: Enter a valid email
  Age: Age must be between 18 and 60
  Phone: Enter a 10-digit mobile number starting with 6-9
  Course: Course must be one of: DotNet, Java, React
  Password: Password must be 6-20 characters
  ConfirmPassword: Passwords do not match`,
      explanation: 'validateAllProperties: true makes the Validator run every attribute, not only [Required]. For Name the empty string fails [Required] first, and the Validator then skips the other attributes of that property, so only one Name error appears (not a StringLength error too). "asha.com" has no "@", 15 is outside 18-60, "12345" does not match the regex, "Python" is not in the allowed list, "abc" is shorter than 6 and "abd" differs from "abc". Errors are listed property by property in declaration order (the order the runtime reports properties, which matches declaration order in practice). ASP.NET Core MVC runs the same attributes after model binding and stores the results in ModelState.',
    },
  ],
  interview: [
    { q: 'What is model binding in ASP.NET Core?', a: 'The process that maps HTTP request data (form fields, route values, query string, headers, body) to action parameters and model properties, converting text into .NET types. Conversion failures are recorded in ModelState instead of throwing.', level: 'Easy' },
    { q: 'In which order does MVC model binding look for a value?', a: 'For a non-[FromBody] parameter: form fields, then route values, then query string. Body (JSON) is used only with [FromBody] (or by default for complex types in [ApiController]).', level: 'Medium' },
    { q: 'Explain [FromQuery], [FromRoute], [FromForm], [FromBody] and [FromHeader].', a: 'They force the binding source: query string, route data, form fields, request body via input formatters (JSON), and a header. Only one parameter per action can be [FromBody] because the body stream is read once.', level: 'Medium' },
    { q: 'What is over-posting and how do you prevent it?', a: 'An attacker adds extra fields (e.g. IsAdmin=true) that bind to sensitive properties. Prevent it by binding to ViewModels/DTOs with only editable fields, using [Bind("A,B")] on the parameter, or [BindNever] on sensitive properties.', level: 'Medium' },
    { q: 'What is ModelState and ModelState.IsValid?', a: 'ModelState is a dictionary of each bound field\'s attempted value and errors from binding and validation. IsValid is true only when there are no errors. Actions check it and redisplay the form when it is false.', level: 'Easy' },
    { q: 'Name common Data Annotation validation attributes.', a: '[Required], [StringLength], [MinLength], [MaxLength], [Range], [EmailAddress], [Phone], [Url], [CreditCard], [RegularExpression], [Compare]; plus [Display] and [DataType] for metadata, and [Remote] for AJAX validation.', level: 'Easy' },
    { q: 'Difference between [StringLength] and [MaxLength]?', a: 'Both limit string length for validation. StringLength supports MinimumLength and is a validation attribute; MaxLength also works on arrays and is used by EF Core to set the database column size (StringLength is also honoured by EF Core).', level: 'Medium' },
    { q: 'How does client-side validation work in ASP.NET Core MVC?', a: 'Tag helpers emit data-val-* attributes from Data Annotations. jquery.validate and jquery.validate.unobtrusive (included via _ValidationScriptsPartial) read them and validate in the browser before submit. It improves UX, but server-side validation is still required.', level: 'Medium' },
    { q: 'Why is server-side validation mandatory even with client-side validation?', a: 'The client can be bypassed: JavaScript can be disabled or requests sent directly with Postman/curl. Only the server can be trusted to enforce rules.', level: 'Easy' },
    { q: 'How do you create a custom validation attribute?', a: 'Inherit ValidationAttribute and override IsValid(object? value, ValidationContext context), returning ValidationResult.Success or a new ValidationResult with the message and member names. For client-side support implement IClientModelValidator plus a jQuery adapter.', level: 'Medium' },
    { q: 'What is IValidatableObject and when does it run?', a: 'An interface with Validate(ValidationContext) used for cross-property rules inside a model. It runs after all property-level attributes have passed; if any attribute fails, Validate is not called.', level: 'Hard' },
    { q: 'How do you add a custom error that is not tied to an attribute, e.g. a duplicate email?', a: 'ModelState.AddModelError("Email", "Email already exists") for a field-level error, or AddModelError(string.Empty, "...") for a model-level error shown by asp-validation-summary="ModelOnly" or "All".', level: 'Easy' },
    { q: 'What does [Remote] do and is it enforced on the server?', a: 'It adds client-side AJAX validation that calls a controller action (returning Json(true) or an error string). It is NOT enforced on the server automatically, so the POST action must repeat the check.', level: 'Hard' },
    { q: 'What happens when a non-nullable int property receives "abc"?', a: 'Binding fails for that property, it keeps its default value 0, and ModelState gets the error "The value \'abc\' is not valid for Age." The action still runs; ModelState.IsValid is false.', level: 'Medium' },
    { q: 'Why might a non-nullable string property be required even without [Required]?', a: 'With nullable reference types enabled, MVC treats non-nullable reference properties as implicitly required. Use string? for optional fields or set SuppressImplicitRequiredAttributeForNonNullableReferenceTypes = true in MvcOptions.', level: 'Hard' },
    { q: 'Difference between asp-validation-summary="All" and "ModelOnly"?', a: 'All shows every error (property-level and model-level). ModelOnly shows only model-level errors (added with an empty key), while property errors are shown next to fields with asp-validation-for.', level: 'Medium' },
    { q: 'Output? var r = new List<ValidationResult>(); var m = new X { Age = 10 }; // [Range(18,60)] on Age  Console.WriteLine(Validator.TryValidateObject(m, new ValidationContext(m), r, true));', a: 'False — Age 10 is outside the range 18-60, so validation fails and r contains one error.', level: 'Medium' },
    { q: 'Output? Console.WriteLine(new EmailAddressAttribute().IsValid("a@b"));', a: 'True — EmailAddressAttribute only checks that there is exactly one @ which is not the first or last character; it does not require a dot.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create an Employee registration ViewModel with: Name (required, 3-40), Email (required, email), Salary (10000-200000), JoiningDate (required, date), Department (required). Add a form with validation messages.',
      hint: 'Use [Required], [StringLength], [EmailAddress], [Range], [DataType(DataType.Date)] and asp-validation-for.',
      solution: `public class EmployeeViewModel
{
    [Required, StringLength(40, MinimumLength = 3)]
    public string Name { get; set; } = "";

    [Required, EmailAddress]
    public string Email { get; set; } = "";

    [Range(10000, 200000, ErrorMessage = "Salary must be between 10,000 and 2,00,000")]
    public decimal Salary { get; set; }

    [Required, DataType(DataType.Date), Display(Name = "Joining Date")]
    public DateTime? JoiningDate { get; set; }

    [Required(ErrorMessage = "Select a department")]
    public string? Department { get; set; }
}

[HttpPost, ValidateAntiForgeryToken]
public IActionResult Create(EmployeeViewModel vm)
{
    if (!ModelState.IsValid) return View(vm);
    TempData["Message"] = $"Employee {vm.Name} saved";
    return RedirectToAction(nameof(Index));
}`,
    },
    {
      task: 'Write a custom [NoDigits] attribute that fails if a name contains any digit, and use it on FullName.',
      hint: 'value is string s && s.Any(char.IsDigit).',
      solution: `public class NoDigitsAttribute : ValidationAttribute
{
    public NoDigitsAttribute() { ErrorMessage = "{0} must not contain digits"; }

    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is string s && s.Any(char.IsDigit))
            return new ValidationResult(FormatErrorMessage(context.DisplayName), new[] { context.MemberName! });
        return ValidationResult.Success;
    }
}

[Required, NoDigits, Display(Name = "Full Name")]
public string FullName { get; set; } = "";
// "Asha2" -> "Full Name must not contain digits"`,
    },
    {
      task: 'Add a cross-field rule with IValidatableObject: EndDate must be after StartDate for a CourseBatch model.',
      hint: 'yield return a ValidationResult with member name EndDate.',
      solution: `public class CourseBatch : IValidatableObject
{
    [Required] public DateTime? StartDate { get; set; }
    [Required] public DateTime? EndDate { get; set; }

    public IEnumerable<ValidationResult> Validate(ValidationContext context)
    {
        if (EndDate <= StartDate)
            yield return new ValidationResult("End date must be after start date", new[] { nameof(EndDate) });
    }
}`,
    },
    {
      task: 'Write an Edit action that protects against over-posting: the Student entity has Fees and IsAdmin, but the form may only change Name, Email and Course.',
      hint: 'Use [Bind] or (better) a StudentEditViewModel, then copy allowed fields onto the entity.',
      solution: `public class StudentEditViewModel
{
    public int Id { get; set; }
    [Required] public string Name { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Course { get; set; } = "";
}

[HttpPost, ValidateAntiForgeryToken]
public IActionResult Edit(int id, StudentEditViewModel vm)
{
    if (!ModelState.IsValid) return View(vm);
    var entity = _repo.GetById(id);
    if (entity == null) return NotFound();
    entity.Name = vm.Name;            // only allowed fields copied
    entity.Email = vm.Email;
    entity.Course = vm.Course;        // Fees and IsAdmin untouched
    return RedirectToAction(nameof(Index));
}`,
    },
    {
      task: 'Extend the console ValidationDemo: add [Range(0, 100)] Percentage and a third student with Percentage = 105 and everything else valid. Predict the output.',
      hint: 'Only one error should be reported.',
      solution: `[Range(0, 100, ErrorMessage = "Percentage must be between 0 and 100")]
public decimal Percentage { get; set; }

var third = new StudentRegistration
{
    Name = "Ravi Kumar", Email = "ravi@mail.com", Age = 19, Phone = "9123456789",
    Course = "Java", Password = "pass1234", ConfirmPassword = "pass1234", Percentage = 105
};
Check("Third student", third);

// Output:
// Third student: IsValid = False, errors = 1
//   Percentage: Percentage must be between 0 and 100`,
    },
  ],
  quiz: [
    { question: 'Which attribute reads a parameter from the JSON request body?', options: ['[FromForm]', '[FromBody]', '[FromQuery]', '[FromRoute]'], answer: 1, explanation: '[FromBody] uses input formatters such as System.Text.Json.' },
    { question: 'An int property receives "abc" from a form. What happens?', options: ['A FormatException crashes the app', 'The action is not called', 'The property stays 0 and ModelState gets an error', 'The value is converted to -1'], answer: 2, explanation: 'Binding errors are recorded in ModelState; the property keeps its default.' },
    { question: 'Which attribute checks that ConfirmPassword equals Password?', options: ['[Compare("Password")]', '[Equal("Password")]', '[Match("Password")]', '[Required]'], answer: 0, explanation: '[Compare] compares the value with another property.' },
    { question: 'Which partial enables jQuery client-side validation in a view?', options: ['_Layout', '_ViewStart', '_ViewImports', '_ValidationScriptsPartial'], answer: 3, explanation: 'It includes jquery.validate and jquery.validate.unobtrusive.' },
    { question: 'When does IValidatableObject.Validate run?', options: ['Before model binding', 'Only on the client', 'After all property attributes pass', 'Only when [Remote] is used'], answer: 2, explanation: 'Validate is skipped if property-level validation already failed.' },
  ],
};
