const registerRazor = `// ===== Models/StudentRegistration.cs =====
using System.ComponentModel.DataAnnotations;

public enum Course { BCA, BSc, BCom, MCA }

public class StudentRegistration
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Name must be 3-50 characters")]
    public string Name { get; set; } = "";

    [Required, EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";

    [Range(17, 35, ErrorMessage = "Age must be between 17 and 35")]
    public int Age { get; set; } = 18;

    [Required(ErrorMessage = "Please choose a course")]
    public Course? Course { get; set; }

    [Required]
    public DateOnly? DateOfBirth { get; set; }

    [RegularExpression(@"^[6-9][0-9]{9}$", ErrorMessage = "Enter a 10-digit Indian mobile number")]
    public string Mobile { get; set; } = "";

    [Required, MinLength(8, ErrorMessage = "Password needs at least 8 characters")]
    public string Password { get; set; } = "";

    [Compare(nameof(Password), ErrorMessage = "Passwords do not match")]
    public string ConfirmPassword { get; set; } = "";

    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the rules")]
    public bool AcceptRules { get; set; }

    public string? Address { get; set; }
}

@* ===== Components/Pages/Register.razor ===== *@
@page "/register"
@rendermode InteractiveServer

<h3>Student registration</h3>

<EditForm Model="student" OnValidSubmit="HandleValidSubmit" OnInvalidSubmit="HandleInvalidSubmit" FormName="register">
    <DataAnnotationsValidator />
    <ValidationSummary class="text-danger" />

    <div class="mb-2">
        <label>Name</label>
        <InputText class="form-control" @bind-Value="student.Name" />
        <ValidationMessage For="() => student.Name" class="text-danger" />
    </div>
    <div class="mb-2">
        <label>Email</label>
        <InputText type="email" class="form-control" @bind-Value="student.Email" />
        <ValidationMessage For="() => student.Email" />
    </div>
    <div class="mb-2">
        <label>Age</label>
        <InputNumber class="form-control" @bind-Value="student.Age" />
        <ValidationMessage For="() => student.Age" />
    </div>
    <div class="mb-2">
        <label>Course</label>
        <InputSelect class="form-select" @bind-Value="student.Course">
            <option value="">-- select --</option>
            @foreach (var c in Enum.GetValues<Course>())
            {
                <option value="@c">@c</option>
            }
        </InputSelect>
        <ValidationMessage For="() => student.Course" />
    </div>
    <div class="mb-2">
        <label>Date of birth</label>
        <InputDate class="form-control" @bind-Value="student.DateOfBirth" />
    </div>
    <div class="mb-2">
        <label>Mobile</label>
        <InputText class="form-control" @bind-Value="student.Mobile" />
        <ValidationMessage For="() => student.Mobile" />
    </div>
    <div class="mb-2">
        <InputText type="password" class="form-control" placeholder="Password" @bind-Value="student.Password" />
        <InputText type="password" class="form-control mt-1" placeholder="Confirm" @bind-Value="student.ConfirmPassword" />
        <ValidationMessage For="() => student.ConfirmPassword" />
    </div>
    <div class="mb-2">
        <InputTextArea class="form-control" placeholder="Address (optional)" @bind-Value="student.Address" />
    </div>
    <label><InputCheckbox @bind-Value="student.AcceptRules" /> I accept the college rules</label>
    <ValidationMessage For="() => student.AcceptRules" />

    <button type="submit" class="btn btn-primary d-block mt-2" disabled="@saving">
        @(saving ? "Saving..." : "Register")
    </button>
</EditForm>

<p class="mt-2">@status</p>

@code {
    private StudentRegistration student = new();
    private string status = "";
    private bool saving;

    private async Task HandleValidSubmit()
    {
        saving = true;
        await Task.Delay(800);                 // pretend to call the API
        status = $"Registered {student.Name} for {student.Course}";
        student = new();                       // reset the form
        saving = false;
    }

    private void HandleInvalidSubmit() => status = "Please fix the errors above";
}`;

const apiCode = `// ===== Shared/ProductDto.cs (class library referenced by BOTH projects) =====
using System.ComponentModel.DataAnnotations;

public class ProductDto
{
    public int Id { get; set; }

    [Required, StringLength(60)]
    public string Name { get; set; } = "";

    [Range(1, 500000, ErrorMessage = "Price must be between 1 and 5,00,000")]
    public decimal Price { get; set; }

    [Range(0, 10000)]
    public int Stock { get; set; }
}

// ===== ShopApi/Program.cs (ASP.NET Core Web API, minimal APIs + EF Core) =====
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddDbContext<ShopDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Default")));
builder.Services.AddCors(o => o.AddPolicy("blazor", p => p
    .WithOrigins("https://localhost:7100")          // the Blazor app's URL
    .AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors("blazor");

var products = app.MapGroup("/api/products");

products.MapGet("/", async (ShopDb db) =>
    await db.Products.AsNoTracking().OrderBy(p => p.Id).ToListAsync());

products.MapGet("/{id:int}", async (int id, ShopDb db) =>
    await db.Products.FindAsync(id) is ProductDto p ? Results.Ok(p) : Results.NotFound());

products.MapPost("/", async (ProductDto p, ShopDb db) =>
{
    db.Products.Add(p);
    await db.SaveChangesAsync();
    return Results.Created($"/api/products/{p.Id}", p);
});

products.MapPut("/{id:int}", async (int id, ProductDto input, ShopDb db) =>
{
    var p = await db.Products.FindAsync(id);
    if (p is null) return Results.NotFound();
    p.Name = input.Name; p.Price = input.Price; p.Stock = input.Stock;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

products.MapDelete("/{id:int}", async (int id, ShopDb db) =>
    await db.Products.Where(p => p.Id == id).ExecuteDeleteAsync() == 1
        ? Results.NoContent() : Results.NotFound());

app.Run();

public class ShopDb(DbContextOptions<ShopDb> options) : DbContext(options)
{
    public DbSet<ProductDto> Products => Set<ProductDto>();
}

// ===== Blazor app: Services/ProductApiClient.cs (typed HttpClient) =====
using System.Net.Http.Json;

public class ProductApiClient(HttpClient http)
{
    public async Task<List<ProductDto>> GetAllAsync() =>
        await http.GetFromJsonAsync<List<ProductDto>>("api/products") ?? [];

    public Task<ProductDto?> GetAsync(int id) =>
        http.GetFromJsonAsync<ProductDto>($"api/products/{id}");

    public async Task CreateAsync(ProductDto p)
    {
        var response = await http.PostAsJsonAsync("api/products", p);
        response.EnsureSuccessStatusCode();           // throws HttpRequestException on 4xx/5xx
    }

    public async Task UpdateAsync(ProductDto p) =>
        (await http.PutAsJsonAsync($"api/products/{p.Id}", p)).EnsureSuccessStatusCode();

    public async Task DeleteAsync(int id) =>
        (await http.DeleteAsync($"api/products/{id}")).EnsureSuccessStatusCode();
}

// ===== Blazor app: Program.cs =====
// Blazor Web App (Server) or the .Client project (WebAssembly):
builder.Services.AddHttpClient<ProductApiClient>(c =>
    c.BaseAddress = new Uri(builder.Configuration["ApiBaseUrl"] ?? "https://localhost:7200/"));

// Standalone Blazor WebAssembly template uses:
// builder.Services.AddScoped(sp => new HttpClient { BaseAddress = new Uri("https://localhost:7200/") });

// ===== appsettings.json (Blazor app) =====
// { "ApiBaseUrl": "https://localhost:7200/" }`;

const crudRazor = `@* ===== Components/Pages/ProductAdmin.razor ===== *@
@page "/admin/products"
@rendermode InteractiveServer
@inject ProductApiClient Api

<h3>Product admin</h3>

@if (error is not null)
{
    <div class="alert alert-danger">
        @error <button class="btn btn-sm btn-outline-danger ms-2" @onclick="LoadAsync">Retry</button>
    </div>
}

@if (products is null)
{
    <p><em>Loading products...</em></p>          @* loading state *@
}
else if (products.Count == 0)
{
    <p>No products yet. Add the first one below.</p>  @* empty state *@
}
else
{
    <table class="table table-sm">
        <thead><tr><th>Id</th><th>Name</th><th>Price</th><th>Stock</th><th></th></tr></thead>
        <tbody>
            @foreach (var p in products)
            {
                <tr @key="p.Id">
                    <td>@p.Id</td><td>@p.Name</td><td>@p.Price</td><td>@p.Stock</td>
                    <td>
                        <button class="btn btn-sm btn-secondary" @onclick="() => Edit(p)">Edit</button>
                        <button class="btn btn-sm btn-danger" @onclick="() => DeleteAsync(p.Id)">Delete</button>
                    </td>
                </tr>
            }
        </tbody>
    </table>
}

<h5>@(form.Id == 0 ? "Add product" : $"Edit product #{form.Id}")</h5>
<EditForm Model="form" OnValidSubmit="SaveAsync">
    <DataAnnotationsValidator />
    <InputText class="form-control mb-1" placeholder="Name" @bind-Value="form.Name" />
    <ValidationMessage For="() => form.Name" />
    <InputNumber class="form-control mb-1" @bind-Value="form.Price" />
    <ValidationMessage For="() => form.Price" />
    <InputNumber class="form-control mb-1" @bind-Value="form.Stock" />
    <button class="btn btn-primary" type="submit" disabled="@busy">@(busy ? "Saving..." : "Save")</button>
    <button class="btn btn-link" type="button" @onclick="() => form = new()">Cancel</button>
</EditForm>

@code {
    private List<ProductDto>? products;    // null = still loading
    private ProductDto form = new();
    private string? error;
    private bool busy;

    protected override Task OnInitializedAsync() => LoadAsync();

    private async Task LoadAsync()
    {
        error = null;
        try
        {
            products = await Api.GetAllAsync();
        }
        catch (HttpRequestException ex)
        {
            error = $"Could not load products ({ex.StatusCode?.ToString() ?? "API not reachable"}).";
            products = [];
        }
    }

    private void Edit(ProductDto p) =>
        form = new ProductDto { Id = p.Id, Name = p.Name, Price = p.Price, Stock = p.Stock };   // copy, do not edit the row directly

    private async Task SaveAsync()
    {
        busy = true;
        try
        {
            if (form.Id == 0) await Api.CreateAsync(form);
            else await Api.UpdateAsync(form);
            form = new();
            await LoadAsync();
        }
        catch (HttpRequestException ex)
        {
            error = $"Save failed: {ex.Message}";
        }
        finally
        {
            busy = false;
        }
    }

    private async Task DeleteAsync(int id)
    {
        try
        {
            await Api.DeleteAsync(id);
            products!.RemoveAll(p => p.Id == id);   // update the UI without reloading everything
        }
        catch (HttpRequestException ex)
        {
            error = $"Delete failed: {ex.Message}";
        }
    }
}`;

const validatorCode = `using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

// The same attributes that DataAnnotationsValidator uses in Blazor work in any .NET app
var forms = new List<StudentForm>
{
    new() { Name = "Asha Patil", Email = "asha@college.in", Age = 21, Course = "BCA", Mobile = "9876543210" },
    new() { Name = "", Email = "ravi-at-mail", Age = 15, Course = "BCA", Mobile = "98765" },
    new() { Name = "Neha", Email = "neha@college.in", Age = 22, Course = "", Mobile = "9123456780" }
};

int formNo = 0;
foreach (var form in forms)
{
    formNo++;
    var context = new ValidationContext(form);
    var errors = new List<ValidationResult>();
    bool ok = Validator.TryValidateObject(form, context, errors, validateAllProperties: true);

    Console.WriteLine($"Form {formNo}: {(ok ? "VALID" : "INVALID")}");
    foreach (var e in errors)
    {
        Console.WriteLine($"  - {string.Join(",", e.MemberNames)}: {e.ErrorMessage}");
    }
}

public class StudentForm
{
    [Required(ErrorMessage = "Name is required")]
    [StringLength(50, MinimumLength = 3, ErrorMessage = "Name must be 3-50 characters")]
    public string Name { get; set; } = "";

    [Required(ErrorMessage = "Email is required")]
    [EmailAddress(ErrorMessage = "Enter a valid email")]
    public string Email { get; set; } = "";

    [Range(17, 35, ErrorMessage = "Age must be between 17 and 35")]
    public int Age { get; set; }

    [Required(ErrorMessage = "Please choose a course")]
    public string Course { get; set; } = "";

    [RegularExpression(@"^[6-9][0-9]{9}$", ErrorMessage = "Enter a 10-digit Indian mobile number")]
    public string Mobile { get; set; } = "";
}
`;

export default {
  id: 'day-12-blazor-forms-validation-http',
  title: 'Blazor Forms, Validation and Calling a Web API with HttpClient (CRUD Page)',
  module: 'Module 3: Blazor',
  day: 12,
  level: 'Intermediate',
  duration: '3.5 hours',
  summary:
    'Build real data-entry screens in Blazor: EditForm with DataAnnotationsValidator, the built-in input components (InputText, InputNumber, InputSelect, InputDate, InputCheckbox), validation messages, then connect the UI to an ASP.NET Core Web API with HttpClient (GetFromJsonAsync, PostAsJsonAsync, PutAsJsonAsync, DeleteAsync), handle loading, empty and error states, and finish with a complete CRUD admin page.',
  objectives: [
    'Build forms with EditForm, OnValidSubmit/OnInvalidSubmit and the built-in Input components',
    'Validate with Data Annotations, ValidationSummary and ValidationMessage, including Compare and Regex rules',
    'Register a typed HttpClient and call a Web API with the System.Net.Http.Json helpers',
    'Show loading, empty and error states and handle HttpRequestException',
    'Combine everything into a list + add/edit/delete CRUD page',
  ],
  theory: [
    {
      heading: 'EditForm and the input components',
      content:
        'EditForm is Blazor\'s form component. You give it a Model (an object) and it creates an EditContext that tracks which fields were changed and which have errors. Inside you use the built-in input components instead of plain <input>: InputText, InputTextArea, InputNumber<T>, InputSelect<T>, InputDate<T>, InputCheckbox, InputRadioGroup and InputFile. They bind with @bind-Value, convert types (string to int/decimal/enum/DateOnly) and add CSS classes "valid", "invalid" and "modified" automatically. When the user submits, OnValidSubmit runs only if validation passes, OnInvalidSubmit runs if it fails, and OnSubmit gives you full control (you call editContext.Validate() yourself).',
      syntax: `<EditForm Model="student" OnValidSubmit="SaveAsync" FormName="register">
    <DataAnnotationsValidator />
    <ValidationSummary />
    <InputText @bind-Value="student.Name" />
    <ValidationMessage For="() => student.Name" />
    <button type="submit">Save</button>
</EditForm>`,
      points: [
        'Use Model OR EditContext, never both',
        'InputNumber shows an error automatically if the user types text that is not a number',
        'InputSelect works with strings, ints and enums (use a nullable enum + [Required] to force a choice)',
        'Static SSR forms (no interactivity) need FormName and [SupplyParameterFromForm] on the model property; interactive forms do not',
      ],
    },
    {
      heading: 'Validation with Data Annotations',
      content:
        'Add <DataAnnotationsValidator /> inside EditForm to validate with attributes from System.ComponentModel.DataAnnotations - the same attributes you used in Web API models. [Required], [StringLength], [MinLength]/[MaxLength], [Range], [EmailAddress], [Phone], [RegularExpression], [Compare] (confirm password) and [Url] cover most needs. Every attribute takes an ErrorMessage. ValidationSummary lists all errors at the top; ValidationMessage For="() => model.Prop" shows the error next to one field. Fields are validated when they change and the whole model is validated on submit. For your own rules write a custom ValidationAttribute or implement IValidatableObject. Put DTOs with attributes in a shared class library so the Blazor form and the Web API apply the same rules - but ALWAYS validate on the server too, because client checks can be bypassed.',
      syntax: `[Required(ErrorMessage = "Name is required")]
[StringLength(50, MinimumLength = 3)]
[Range(17, 35)]
[RegularExpression(@"^[6-9][0-9]{9}$", ErrorMessage = "Invalid mobile")]
[Compare(nameof(Password))]`,
      points: [
        '[Required] on a value type (int, bool) never fails because it always has a value - use int? or [Range]',
        'For a checkbox that must be ticked use [Range(typeof(bool), "true", "true")]',
        'Nested objects are not validated by default; use the ObjectGraphDataAnnotationsValidator package or FluentValidation (Blazored.FluentValidation)',
        '.NET 10 adds built-in nested validation with builder.Services.AddValidation() and [ValidatableType]',
      ],
    },
    {
      heading: 'Calling a Web API with HttpClient',
      content:
        'Blazor WebAssembly can never talk to the database directly, so it calls a Web API. Blazor Server can use EF Core directly, but many companies still put a Web API in between so that mobile apps and other clients can reuse it. Register HttpClient with dependency injection - preferably a typed client with AddHttpClient<T> (it uses IHttpClientFactory, so sockets are reused) - and inject it into components or services. The System.Net.Http.Json extension methods serialize and deserialize JSON for you: GetFromJsonAsync<T>, PostAsJsonAsync, PutAsJsonAsync and ReadFromJsonAsync<T>. DeleteAsync is on HttpClient itself. GetFromJsonAsync throws HttpRequestException for non-success status codes; for Post/Put/Delete check response.IsSuccessStatusCode or call EnsureSuccessStatusCode().',
      syntax: `builder.Services.AddHttpClient<ProductApiClient>(c => c.BaseAddress = new Uri("https://localhost:7200/"));

var list    = await http.GetFromJsonAsync<List<ProductDto>>("api/products");
var resp    = await http.PostAsJsonAsync("api/products", dto);
var created = await resp.Content.ReadFromJsonAsync<ProductDto>();
await http.PutAsJsonAsync($"api/products/{dto.Id}", dto);
await http.DeleteAsync($"api/products/{id}");`,
      points: [
        'Never create new HttpClient() in every method - socket exhaustion; use DI/IHttpClientFactory',
        'The API must allow the Blazor origin with CORS when they run on different ports/domains',
        'Use a relative URL ("api/products") with BaseAddress ending in "/"',
        'Read validation errors from a 400 response with ReadFromJsonAsync<ValidationProblemDetails>()',
      ],
    },
    {
      heading: 'Loading, empty and error states',
      content:
        'A professional page always handles four states: loading (data not arrived yet - show a spinner or "Loading..."), empty (request worked but returned nothing - show a helpful message), error (API down, 500, timeout - show a friendly message and a Retry button) and success (show the data). A simple pattern: keep the list as null while loading, wrap calls in try/catch(HttpRequestException), keep an error string, and disable the Save button while a request is running so the user cannot submit twice. For long lists add paging or Virtualize (<Virtualize Items="..."> renders only visible rows).',
      points: [
        'products == null -> loading; products.Count == 0 -> empty; error != null -> error banner',
        'busy flag + disabled="@busy" prevents double submit',
        'Copy a row into a separate form object when editing; editing the row object directly changes the table before the user saves',
        'Use CancellationToken (and dispose with IDisposable) for requests that may outlive the page',
      ],
    },
    {
      heading: 'CRUD page design',
      content:
        'A typical admin page shows a table (Read), a form for Add/Edit (Create/Update) and Delete buttons. Map it to REST: GET /api/products, GET /api/products/{id}, POST /api/products (201 Created), PUT /api/products/{id} (204 No Content), DELETE /api/products/{id} (204). Put the HTTP calls in a service class (ProductApiClient) instead of inside the component, so components stay small and the service can be reused and unit tested. After Create/Update reload the list (or insert the returned object); after Delete remove the item locally. Ask for confirmation before delete (a modal or JS confirm via IJSRuntime, shown on Day 13).',
    },
  ],
  examples: [
    {
      title: 'Student registration form with full validation',
      scenario:
        'A college admission office in Nagpur needs an online registration form: name, email, age, course (drop-down), date of birth, mobile, password + confirmation and an "accept rules" checkbox, with clear error messages.',
      steps: [
        'In your Blazor Web App add Models/StudentRegistration.cs with the class and enum below',
        'Add "@using YourApp.Models" to Components/_Imports.razor',
        'Add Components/Pages/Register.razor and paste the component',
        'Press Ctrl+F5, open /register and click Register without filling anything',
        'Fill the fields correctly and submit again',
      ],
      code: registerRazor,
      result: `Click Register on the empty form ->
  - Name is required
  - The Email field is required.
  - Please choose a course
  - The DateOfBirth field is required.
  - The Password field is required.
  - You must accept the rules
  "Please fix the errors above"   (invalid fields get a red outline: CSS class "invalid")
Type 12 digits in Mobile -> "Enter a 10-digit Indian mobile number" appears as soon as you leave the box
Valid data -> button shows "Saving..." then "Registered Asha Patil for BCA" and the form resets`,
      explanation:
        'DataAnnotationsValidator reads the attributes. Errors without a custom ErrorMessage use the default text "The X field is required.". The Course is a nullable enum, so [Required] fails until a course is chosen. Compare checks ConfirmPassword against Password, and Range(typeof(bool), "true", "true") forces the checkbox. OnValidSubmit only runs when everything is valid; the saving flag disables the button during the async work. Exact summary order follows the property order.',
    },
    {
      title: 'Web API + typed HttpClient for products',
      scenario:
        'An electronics shop has a SQL Server database. Build a minimal Web API for products and a typed ProductApiClient in the Blazor app that calls it, sharing one ProductDto with validation attributes.',
      steps: [
        'Create a solution with three projects: Shop.Shared (Class Library), ShopApi (ASP.NET Core Web API) and ShopUi (Blazor Web App)',
        'Add ProductDto to Shop.Shared and reference Shop.Shared from both other projects (right-click Dependencies > Add Project Reference)',
        'In ShopApi: Install-Package Microsoft.EntityFrameworkCore.SqlServer, paste Program.cs, add the "Default" connection string, then Add-Migration Init and Update-Database',
        'In ShopUi: add Services/ProductApiClient.cs and the AddHttpClient line in Program.cs',
        'Right-click the solution > Configure Startup Projects > Multiple startup projects: ShopApi and ShopUi = Start, then F5',
        'Test the API first in Swagger/Postman: POST https://localhost:7200/api/products with {"name":"Earphones","price":799,"stock":10}',
      ],
      code: apiCode,
      result: `POST /api/products  {"name":"Earphones","price":799,"stock":10}
-> 201 Created, Location: /api/products/1
   {"id":1,"name":"Earphones","price":799,"stock":10}
GET /api/products -> 200 [{"id":1,"name":"Earphones","price":799,"stock":10}]
PUT /api/products/1 {"id":1,"name":"Earphones Pro","price":999,"stock":8} -> 204 No Content
DELETE /api/products/99 -> 404 Not Found
POST with {"name":"","price":0} -> 400 with validation errors for Name and Price (minimal APIs on .NET 10 with AddValidation, or [ApiController] controllers)`,
      explanation:
        'The typed client gets a configured HttpClient from IHttpClientFactory; components inject ProductApiClient, never raw URLs. GetFromJsonAsync deserializes the JSON array into List<ProductDto> (property names are matched case-insensitively). EnsureSuccessStatusCode turns 404/500 into HttpRequestException so the UI can show an error. CORS is needed because the UI (port 7100) and API (port 7200) are different origins - in WebAssembly the browser enforces it.',
    },
    {
      title: 'Complete CRUD page with loading, empty and error states',
      scenario:
        'The shop manager needs one admin page to list, add, edit and delete products, which must behave well when the API is slow or down.',
      steps: [
        'In ShopUi add Components/Pages/ProductAdmin.razor with the code below',
        'Run both projects (F5) and open /admin/products',
        'Add two products, edit one, delete one',
        'Stop ShopApi (Debug > Stop or close its console) and click Retry to see the error state',
      ],
      code: crudRazor,
      result: `First load: "Loading products..." -> "No products yet. Add the first one below."
Add Earphones (799, 10) and Smart Watch (2499, 5) -> table shows Id 1 and 2
Edit #2 -> heading "Edit product #2", change price to 2299, Save -> row updated
Delete #1 -> row disappears immediately
API stopped -> red banner "Could not load products (API not reachable)." with a Retry button
Empty Name or Price 0 -> validation messages, no HTTP call is made`,
      explanation:
        'products starts as null so the first render shows the loading message; OnInitializedAsync awaits the API and Blazor renders again. Errors are caught as HttpRequestException (a connection failure has StatusCode == null, so the message says "API not reachable"). Edit copies the row into form, so the table does not change until Save. The busy flag and finally block guarantee the button is re-enabled even if the call fails. After Delete the list is updated locally instead of re-fetching.',
    },
    {
      title: 'Console demo: Data Annotations validation outside Blazor',
      scenario:
        'Understand exactly what DataAnnotationsValidator does by running the same attributes in a console app with Validator.TryValidateObject - the same engine ASP.NET Core uses.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it ValidationDemo',
        'Replace Program.cs with the code below (System.ComponentModel.DataAnnotations is part of .NET - no NuGet package needed)',
        'Press Ctrl+F5',
      ],
      code: validatorCode,
      csharp: { files: { 'Program.cs': validatorCode }, stdin: '' },
      result: `Form 1: VALID
Form 2: INVALID
  - Name: Name is required
  - Email: Enter a valid email
  - Age: Age must be between 17 and 35
  - Mobile: Enter a 10-digit Indian mobile number
Form 3: INVALID
  - Course: Please choose a course`,
      explanation:
        'validateAllProperties: true checks every attribute, not only [Required]. For Form 2 the empty name fails [Required], and when Required fails the other attributes of that property (StringLength) are skipped, so only one Name error appears. "ravi-at-mail" has no @ so EmailAddress fails, 15 is outside 17-35, and "98765" does not match the 10-digit pattern. Form 3 only misses the course. Without validateAllProperties: true, only [Required] would be checked.',
    },
  ],
  interview: [
    { q: 'What does EditForm do?', a: 'It renders a <form>, creates an EditContext for the Model that tracks field changes and validation messages, and raises OnValidSubmit, OnInvalidSubmit or OnSubmit when submitted.', level: 'Easy' },
    { q: 'Difference between OnSubmit and OnValidSubmit?', a: 'OnValidSubmit runs only when validation passes (OnInvalidSubmit when it fails). OnSubmit runs always and you decide by calling editContext.Validate(). You cannot use OnSubmit together with the other two.', level: 'Easy' },
    { q: 'Why use InputText instead of a plain <input @bind>?', a: 'Input components integrate with EditContext: they notify field changes, trigger field validation, add valid/invalid CSS classes and handle type conversion and parsing errors.', level: 'Easy' },
    { q: 'How do you validate that two passwords match?', a: 'Put [Compare(nameof(Password))] on ConfirmPassword. DataAnnotationsValidator shows the error under ConfirmPassword.', level: 'Easy' },
    { q: 'Why does [Required] on an int property never show an error?', a: 'An int always has a value (0), so Required is satisfied. Use int? with [Required], or [Range(1, ...)].', level: 'Medium' },
    { q: 'Is client-side validation in Blazor enough?', a: 'No. Anyone can call the API directly with Postman or modify a WebAssembly app. The Web API must validate the same rules again; sharing the DTO class library makes this easy.', level: 'Medium' },
    { q: 'How do you register HttpClient correctly in Blazor?', a: 'Use IHttpClientFactory: builder.Services.AddHttpClient<MyApiClient>(c => c.BaseAddress = new Uri(...)) or a named client. Standalone WASM templates register a scoped HttpClient with the host base address. Do not new HttpClient per call.', level: 'Medium' },
    { q: 'What happens when GetFromJsonAsync receives a 404?', a: 'It throws HttpRequestException (with StatusCode = 404 in .NET 5+). Catch it or use GetAsync and check the status code first.', level: 'Medium' },
    { q: 'What is the difference between PostAsJsonAsync and ReadFromJsonAsync?', a: 'PostAsJsonAsync serializes an object to JSON and sends a POST, returning HttpResponseMessage. ReadFromJsonAsync<T> deserializes the response content into T.', level: 'Easy' },
    { q: 'Why do you need CORS when Blazor WebAssembly calls your API?', a: 'The WASM app runs in the browser from one origin and calls another origin (different port/domain). Browsers block cross-origin requests unless the API returns CORS headers allowing that origin.', level: 'Medium' },
    { q: 'How do you show loading and error states in a Blazor page?', a: 'Keep data as null until loaded and render "Loading..." when null; wrap HTTP calls in try/catch and store an error message to display with a Retry button; show an empty message when the list has no items; disable buttons with a busy flag during requests.', level: 'Medium' },
    { q: 'How do you validate nested objects or complex rules?', a: 'Implement IValidatableObject or a custom ValidationAttribute for cross-field rules; for nested objects use ObjectGraphDataAnnotationsValidator (experimental package), FluentValidation with Blazored.FluentValidation, or .NET 10\'s built-in AddValidation with [ValidatableType].', level: 'Hard' },
    { q: 'Why should you copy a row into a new object before editing it in a form?', a: 'Because objects are references: binding the form directly to the row object updates the table immediately and leaves wrong data if the user cancels or the save fails.', level: 'Hard' },
    { q: 'How are forms different in Static SSR mode in .NET 8?', a: 'Without interactivity the form does a real HTTP POST. You need FormName on EditForm, [SupplyParameterFromForm] on the model property, and antiforgery (app.UseAntiforgery(), automatic in EditForm). The page re-renders on the server after the post.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a JobApplication form (FullName, Email, Experience years 0-40, Skill from a drop-down: C#, Java, Python, a Resume link URL) with validation and a summary of the submitted data.',
      hint: 'Use [Url] for the resume link, InputSelect for the skill, and show the result in OnValidSubmit.',
      solution: `public class JobApplication
{
    [Required] public string FullName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Range(0, 40)] public int Experience { get; set; }
    [Required(ErrorMessage = "Pick a skill")] public string? Skill { get; set; }
    [Url] public string? ResumeUrl { get; set; }
}

@page "/apply"
@rendermode InteractiveServer
<EditForm Model="app" OnValidSubmit="Submit">
    <DataAnnotationsValidator /><ValidationSummary />
    <InputText @bind-Value="app.FullName" placeholder="Full name" />
    <InputText @bind-Value="app.Email" placeholder="Email" />
    <InputNumber @bind-Value="app.Experience" />
    <InputSelect @bind-Value="app.Skill">
        <option value="">-- skill --</option><option>C#</option><option>Java</option><option>Python</option>
    </InputSelect>
    <InputText @bind-Value="app.ResumeUrl" placeholder="https://..." />
    <button type="submit">Apply</button>
</EditForm>
<p>@summary</p>
@code {
    JobApplication app = new();
    string summary = "";
    void Submit() => summary = $"{app.FullName} ({app.Skill}, {app.Experience} yrs) applied";
}`,
    },
    {
      task: 'Write a custom validation attribute [NotFutureDate] for a DateOnly? DateOfBirth and use it in the registration model.',
      hint: 'Inherit ValidationAttribute and override IsValid(object? value, ValidationContext context).',
      solution: `public class NotFutureDateAttribute : ValidationAttribute
{
    protected override ValidationResult? IsValid(object? value, ValidationContext context)
    {
        if (value is DateOnly d && d > DateOnly.FromDateTime(DateTime.Today))
            return new ValidationResult(ErrorMessage ?? "Date cannot be in the future",
                                        new[] { context.MemberName! });
        return ValidationResult.Success;
    }
}

[Required, NotFutureDate(ErrorMessage = "Birth date cannot be in the future")]
public DateOnly? DateOfBirth { get; set; }`,
    },
    {
      task: 'Add a "Search" box to the ProductAdmin page that calls GET api/products?search=watch when the user stops typing (on change), and shows "No products match" when the result is empty.',
      hint: 'Bind with @bind:after="LoadAsync" and build the URL with Uri.EscapeDataString.',
      solution: `<input class="form-control" @bind="search" @bind:after="LoadAsync" placeholder="Search" />

// ProductApiClient
public async Task<List<ProductDto>> SearchAsync(string? search) =>
    await http.GetFromJsonAsync<List<ProductDto>>(
        $"api/products?search={Uri.EscapeDataString(search ?? "")}") ?? [];

// API
products.MapGet("/", async (string? search, ShopDb db) =>
    await db.Products.Where(p => search == null || p.Name.Contains(search)).ToListAsync());

// Page
private string? search;
private async Task LoadAsync() { products = null; products = await Api.SearchAsync(search); }
@if (products is { Count: 0 } && !string.IsNullOrEmpty(search)) { <p>No products match "@search"</p> }`,
    },
    {
      task: 'When POST returns 400 with validation errors from the API, show those server messages in the Blazor page.',
      hint: 'Check !response.IsSuccessStatusCode and read ValidationProblemDetails (Microsoft.AspNetCore.Mvc.ProblemDetails types are in the shared framework; in WASM define a small class with Dictionary<string,string[]> Errors).',
      solution: `public class ApiValidationError
{
    public string? Title { get; set; }
    public Dictionary<string, string[]> Errors { get; set; } = new();
}

var response = await http.PostAsJsonAsync("api/products", form);
if (response.StatusCode == System.Net.HttpStatusCode.BadRequest)
{
    var problem = await response.Content.ReadFromJsonAsync<ApiValidationError>();
    serverErrors = problem?.Errors.SelectMany(e => e.Value).ToList() ?? [];
}
else response.EnsureSuccessStatusCode();

@foreach (var msg in serverErrors) { <div class="text-danger">@msg</div> }`,
    },
    {
      task: 'Predict the output of the ValidationDemo console program if Form 3 is changed to Name = "Om" and Age = 40 (Course still empty).',
      hint: 'Om is only 2 characters; check StringLength MinimumLength. Errors appear in property order.',
      solution: `Form 3: INVALID
  - Name: Name must be 3-50 characters
  - Age: Age must be between 17 and 35
  - Course: Please choose a course`,
    },
  ],
  quiz: [
    {
      question: 'Which component must be placed inside EditForm to enable [Required] and [Range] attribute validation?',
      options: ['<ValidationSummary />', '<DataAnnotationsValidator />', '<InputValidator />', '<ValidationMessage />'],
      answer: 1,
      explanation: 'DataAnnotationsValidator hooks Data Annotations validation into the EditContext. ValidationSummary and ValidationMessage only display messages.',
    },
    {
      question: 'Which method sends an object as JSON in a POST request?',
      options: ['GetFromJsonAsync', 'ReadFromJsonAsync', 'PostAsJsonAsync', 'SendJsonAsync'],
      answer: 2,
      explanation: 'PostAsJsonAsync (System.Net.Http.Json) serializes the object and posts it, returning HttpResponseMessage.',
    },
    {
      question: 'A page keeps List<ProductDto>? products = null until the API responds. What should the markup show when products is null?',
      options: ['An empty table', 'A loading message or spinner', 'An error message', 'Nothing - Blazor waits for OnInitializedAsync before rendering'],
      answer: 1,
      explanation: 'Blazor renders before an awaited OnInitializedAsync completes, so null means "still loading". Blazor does not wait.',
    },
    {
      question: 'What is the recommended way to get an HttpClient in a Blazor Server app?',
      options: ['new HttpClient() in every method', 'A static HttpClient field in each component', 'IHttpClientFactory via AddHttpClient (typed or named client)', 'WebClient'],
      answer: 2,
      explanation: 'IHttpClientFactory pools handlers, avoids socket exhaustion and respects DNS changes; typed clients keep URLs in one place.',
    },
    {
      question: 'Which attribute makes ConfirmPassword match Password?',
      options: ['[Compare(nameof(Password))]', '[Equal("Password")]', '[Match(Password)]', '[Required(Password)]'],
      answer: 0,
      explanation: 'CompareAttribute compares the property with another property by name.',
    },
  ],
};
