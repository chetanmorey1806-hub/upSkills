const claimsCode = `using System;
using System.Linq;
using System.Security.Claims;

// What JwtBearer middleware builds from a valid token:
var identity = new ClaimsIdentity(new[]
{
    new Claim(ClaimTypes.Name, "Ravi"),
    new Claim(ClaimTypes.Email, "ravi@demo.com"),
    new Claim(ClaimTypes.Role, "Admin"),
    new Claim(ClaimTypes.Role, "Manager"),
    new Claim("department", "IT"),
    new Claim("employeeId", "E101")
}, authenticationType: "Jwt");

var ravi = new ClaimsPrincipal(identity);

// A request without a token: identity has no authentication type
var guest = new ClaimsPrincipal(new ClaimsIdentity());

Console.WriteLine($"Name           : {ravi.Identity!.Name}");
Console.WriteLine($"Authenticated  : {ravi.Identity.IsAuthenticated}");
Console.WriteLine($"Auth type      : {ravi.Identity.AuthenticationType}");
Console.WriteLine($"Roles          : {string.Join(", ", ravi.FindAll(ClaimTypes.Role).Select(c => c.Value))}");
Console.WriteLine($"IsInRole Admin : {ravi.IsInRole("Admin")}");
Console.WriteLine($"IsInRole admin : {ravi.IsInRole("admin")}");
Console.WriteLine($"IsInRole HR    : {ravi.IsInRole("HR")}");
Console.WriteLine($"Department     : {ravi.FindFirst("department")?.Value}");
Console.WriteLine($"HasClaim IT    : {ravi.HasClaim("department", "IT")}");
Console.WriteLine($"Claim count    : {ravi.Claims.Count()}");
Console.WriteLine($"Guest name     : {guest.Identity!.Name ?? "(anonymous)"}");
Console.WriteLine($"Guest authenticated: {guest.Identity.IsAuthenticated}");
Console.WriteLine($"Role claim type: {ClaimTypes.Role}");
`;

const policyEngineCode = `using System;
using System.Collections.Generic;
using System.Linq;

const int CurrentYear = 2026;

var users = new List<AppUser>
{
    new("Ravi", new[] { "Admin" },   new() { ["department"] = "IT",    ["birthYear"] = "1990" }),
    new("Sita", new[] { "User" },    new() { ["department"] = "IT",    ["birthYear"] = "2010" }),
    new("Amit", new[] { "Manager" }, new() { ["department"] = "Sales", ["birthYear"] = "1995",
                                             ["permission"] = "students.delete" })
};

// Each policy = name + rule (in ASP.NET Core: requirements + handlers)
var policies = new List<(string Name, Func<AppUser, bool> Rule)>
{
    ("AdminOnly",        u => u.Roles.Contains("Admin")),
    ("ITDepartment",     u => u.Claim("department") == "IT"),
    ("AtLeast18",        u => int.TryParse(u.Claim("birthYear"), out int y) && CurrentYear - y >= 18),
    ("CanDeleteStudent", u => u.Roles.Contains("Admin") ||
                              (u.Roles.Contains("Manager") && u.Claim("permission") == "students.delete"))
};

Console.WriteLine(("Policy".PadRight(18) + string.Concat(users.Select(u => u.Name.PadRight(7)))).TrimEnd());
foreach (var (name, rule) in policies)
{
    string row = name.PadRight(18) +
                 string.Concat(users.Select(u => (rule(u) ? "ALLOW" : "DENY").PadRight(7)));
    Console.WriteLine(row.TrimEnd());
}

record AppUser(string Name, string[] Roles, Dictionary<string, string> Claims)
{
    public string? Claim(string type) => Claims.TryGetValue(type, out var v) ? v : null;
}
`;

const permissionsCode = `using System;
using System.Collections.Generic;
using System.Linq;

var rolePermissions = new Dictionary<string, Permissions>
{
    ["Admin"]   = Permissions.All,
    ["Teacher"] = Permissions.Read | Permissions.Create | Permissions.Update,
    ["Student"] = Permissions.Read
};

foreach (var role in new[] { "Admin", "Teacher", "Student" })
    Console.WriteLine($"{role,-8}: {rolePermissions[role]}");

Permissions For(params string[] roles) =>
    roles.Aggregate(Permissions.None, (acc, r) => acc | rolePermissions[r]);

Permissions teacher = For("Teacher");
Console.WriteLine($"Teacher can Delete? {teacher.HasFlag(Permissions.Delete)}");
Console.WriteLine($"Teacher can Update? {teacher.HasFlag(Permissions.Update)}");
Console.WriteLine($"Student can Read?   {For("Student").HasFlag(Permissions.Read)}");

Permissions both = For("Teacher", "Student");
Console.WriteLine($"Teacher+Student = {both} ({(int)both})");
Console.WriteLine($"Admin value = {(int)For("Admin")}");

[Flags]
enum Permissions
{
    None   = 0,
    Read   = 1,
    Create = 2,
    Update = 4,
    Delete = 8,
    All    = Read | Create | Update | Delete
}
`;

const apiCode = `// ===== Authorization/MinimumAgeRequirement.cs =====
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

public class MinimumAgeRequirement : IAuthorizationRequirement
{
    public int MinimumAge { get; }
    public MinimumAgeRequirement(int minimumAge) => MinimumAge = minimumAge;
}

public class MinimumAgeHandler : AuthorizationHandler<MinimumAgeRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                   MinimumAgeRequirement requirement)
    {
        var dob = context.User.FindFirst(ClaimTypes.DateOfBirth)?.Value;
        if (dob is null) return Task.CompletedTask;                 // not met -> 403

        var birth = DateOnly.Parse(dob);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        int age = today.Year - birth.Year;
        if (birth > today.AddYears(-age)) age--;

        if (age >= requirement.MinimumAge) context.Succeed(requirement);
        return Task.CompletedTask;
    }
}

// ===== Program.cs (add to the Day 111 AuthApi) =====
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);
// ... AddDbContext, AddIdentityCore<AppUser>().AddRoles<IdentityRole>(), AddAuthentication().AddJwtBearer(...) from Day 111

builder.Services.AddAuthorization(options =>
{
    // 1) Role-based policy
    options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));

    // 2) Claim-based policies
    options.AddPolicy("ITDepartment", p => p.RequireClaim("department", "IT"));
    options.AddPolicy("HasEmployeeId", p => p.RequireClaim("employeeId"));   // any value

    // 3) Combined policy: authenticated + role + claim
    options.AddPolicy("SeniorManager", p => p
        .RequireAuthenticatedUser()
        .RequireRole("Manager", "Admin")                      // Manager OR Admin
        .RequireClaim("level", "Senior"));                    // AND level = Senior

    // 4) Custom requirement handled by MinimumAgeHandler
    options.AddPolicy("AtLeast18", p => p.AddRequirements(new MinimumAgeRequirement(18)));

    // 5) RequireAssertion for quick custom logic
    options.AddPolicy("CanDeleteStudent", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") ||
        (ctx.User.IsInRole("Manager") && ctx.User.HasClaim("permission", "students.delete"))));

    // Every endpoint needs a logged-in user unless it has [AllowAnonymous]
    options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();
builder.Services.AddControllers();

var app = builder.Build();

// ---- seed roles and a first admin ----
using (var scope = app.Services.CreateScope())
{
    var roles = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    var users = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

    foreach (var r in new[] { "Admin", "Manager", "User" })
        if (!await roles.RoleExistsAsync(r)) await roles.CreateAsync(new IdentityRole(r));

    if (await users.FindByEmailAsync("admin@demo.com") is null)
    {
        var admin = new AppUser { UserName = "admin@demo.com", Email = "admin@demo.com", FullName = "Super Admin" };
        await users.CreateAsync(admin, app.Configuration["SeedAdminPassword"] ?? "Admin@12345");
        await users.AddToRoleAsync(admin, "Admin");
        await users.AddClaimAsync(admin, new System.Security.Claims.Claim("department", "IT"));
    }
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ===== Controllers/StudentsController.cs =====
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
[Authorize]                                          // all actions: logged-in users
public class StudentsController : ControllerBase
{
    private static readonly List<string> Students = new() { "Asha", "Bala", "Chitra" };

    [HttpGet]
    [AllowAnonymous]                                 // public list
    public IActionResult GetAll() => Ok(Students);

    [HttpGet("me")]
    public IActionResult Me() => Ok(new
    {
        name = User.Identity!.Name,
        roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value),
        department = User.FindFirst("department")?.Value
    });

    [HttpPost]
    [Authorize(Roles = "Admin,Manager")]             // Admin OR Manager
    public IActionResult Create([FromBody] string name) { Students.Add(name); return Created("", name); }

    [HttpDelete("{index:int}")]
    [Authorize(Policy = "CanDeleteStudent")]
    public IActionResult Delete(int index)
    {
        if (index < 0 || index >= Students.Count) return NotFound();
        Students.RemoveAt(index);
        return NoContent();
    }

    [HttpGet("it-reports")]
    [Authorize(Policy = "ITDepartment")]
    public IActionResult ItReports() => Ok("Server room report");

    [HttpGet("adult-content")]
    [Authorize(Policy = "AtLeast18")]
    public IActionResult Adult() => Ok("Allowed");
}

// ===== Controllers/AdminController.cs – manage roles and claims =====
[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    public AdminController(UserManager<AppUser> users) => _users = users;

    public record RoleDto(string Email, string Role);
    public record ClaimDto(string Email, string Type, string Value);

    [HttpPost("assign-role")]
    public async Task<IActionResult> AssignRole(RoleDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null) return NotFound();
        var result = await _users.AddToRoleAsync(user, dto.Role);
        return result.Succeeded ? Ok($"{dto.Email} is now {dto.Role}") : BadRequest(result.Errors);
    }

    [HttpPost("add-claim")]
    public async Task<IActionResult> AddClaim(ClaimDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null) return NotFound();
        await _users.AddClaimAsync(user, new System.Security.Claims.Claim(dto.Type, dto.Value));
        return Ok();
    }
}

// ===== TokenService change: copy user claims into the JWT =====
// var userClaims = await _users.GetClaimsAsync(user);   // department, level, permission ...
// claims.AddRange(userClaims);`;

const resourceCode = `// ===== Models/StudentDocument.cs =====
public class StudentDocument
{
    public int Id { get; set; }
    public string Title { get; set; } = "";
    public string OwnerId { get; set; } = "";      // user id of the uploader
}

// ===== Authorization/DocumentOwnerHandler.cs =====
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

public class DocumentOwnerHandler
    : AuthorizationHandler<OperationAuthorizationRequirement, StudentDocument>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
        OperationAuthorizationRequirement requirement, StudentDocument doc)
    {
        string? userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (context.User.IsInRole("Admin")) context.Succeed(requirement);       // admin: everything
        else if (requirement.Name == "Read") context.Succeed(requirement);      // everyone may read
        else if (doc.OwnerId == userId) context.Succeed(requirement);           // owner may edit/delete

        return Task.CompletedTask;
    }
}

public static class DocOps
{
    public static readonly OperationAuthorizationRequirement Read   = new() { Name = "Read" };
    public static readonly OperationAuthorizationRequirement Update = new() { Name = "Update" };
    public static readonly OperationAuthorizationRequirement Delete = new() { Name = "Delete" };
}

// ===== Program.cs (extra lines) =====
builder.Services.AddScoped<IAuthorizationHandler, DocumentOwnerHandler>();

// Minimal API endpoints can use the same policies:
app.MapGet("/api/reports/salary", () => "Salary report")
   .RequireAuthorization("AdminOnly");

app.MapGet("/api/health-public", () => "OK").AllowAnonymous();

// ===== Controllers/DocumentsController.cs =====
[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DocumentsController : ControllerBase
{
    private readonly IAuthorizationService _auth;
    private readonly AppDbContext _db;
    public DocumentsController(IAuthorizationService auth, AppDbContext db) { _auth = auth; _db = db; }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] string title)
    {
        var doc = await _db.StudentDocuments.FindAsync(id);
        if (doc is null) return NotFound();

        // the decision needs the RESOURCE (doc.OwnerId), so attributes are not enough
        var result = await _auth.AuthorizeAsync(User, doc, DocOps.Update);
        if (!result.Succeeded) return Forbid();                 // 403

        doc.Title = title;
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

// ===== React: role-based UI (Day 107) – hide what the user cannot do =====
// {user.roles.includes('Admin') && <button onClick={remove}>Delete</button>}
// The SERVER must still check – hiding a button is not security.`;

export default {
  id: 'day-112-rbac-claims-policy-authorization',
  title: 'Role-Based Access Control, Claims-Based Authorization and Policy Authorization',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 112,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'After a user is authenticated, authorization decides what they may do. Learn Role-Based Access Control (RBAC) with [Authorize(Roles)], Claims-Based Authorization with ClaimsPrincipal, Policy-Based Authorization with requirements and handlers, permission flags, resource-based authorization with IAuthorizationService, and how to seed roles and manage roles/claims with ASP.NET Core Identity.',
  objectives: [
    'Explain RBAC, claims-based and policy-based authorization and when to use each',
    'Read and test claims with ClaimsPrincipal, ClaimsIdentity, FindFirst, HasClaim and IsInRole',
    'Create policies with RequireRole, RequireClaim, RequireAssertion and custom IAuthorizationRequirement handlers',
    'Seed roles, assign roles and claims with RoleManager/UserManager and put them into JWTs',
    'Protect individual resources with IAuthorizationService (owner-or-admin rules)',
  ],
  theory: [
    {
      heading: 'Three styles of authorization',
      content:
        'Role-Based Access Control (RBAC) groups permissions into roles such as Admin, Manager and User; you check "is the user in role X?". Claims-based authorization checks facts about the user (claims) such as department=IT, dateOfBirth or employeeId. Policy-based authorization is the modern ASP.NET Core model: a named policy contains one or more requirements, and both roles and claims are just special requirements. Analogy: a hotel key card. RBAC = "Staff" cards open all staff doors. Claims = the card also stores your floor number. Policy = "gym door opens for guests on floors 5–10 OR staff, between 6 am and 10 pm".',
      points: [
        'RBAC: simple, great for small fixed sets of roles; gets messy when roles explode (AdminOfBranch3ReadOnly …)',
        'Claims: fine-grained facts carried in the token or cookie',
        'Policies: reusable named rules, testable handlers, combine roles + claims + custom logic',
        'All three end in the same results: 200 when allowed, 401 when not logged in, 403 when logged in but not allowed',
      ],
    },
    {
      heading: 'Claims, ClaimsIdentity and ClaimsPrincipal',
      content:
        'A Claim is a type/value pair, e.g. (ClaimTypes.Email, "ravi@demo.com"). A ClaimsIdentity is a set of claims issued by one authentication scheme (like an identity card); it is authenticated only when it has an AuthenticationType. A ClaimsPrincipal is the user and can hold several identities. In controllers it is available as User (HttpContext.User). JwtBearer converts every JWT claim into a Claim; Identity loads roles and claims from AspNetUserRoles and AspNetUserClaims.',
      syntax: `string? email = User.FindFirstValue(ClaimTypes.Email);
string? id    = User.FindFirstValue(ClaimTypes.NameIdentifier);   // "sub" from JWT
bool isAdmin  = User.IsInRole("Admin");                            // case-sensitive value
bool isIT     = User.HasClaim("department", "IT");
var roles     = User.FindAll(ClaimTypes.Role).Select(c => c.Value);`,
      points: [
        'ClaimTypes.Role is a long URI: http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
        'IsInRole compares the role VALUE case-sensitively (Ordinal), so "admin" is not "Admin"',
        'JwtBearer maps short JWT names (sub, email, role) to ClaimTypes URIs by default; set MapInboundClaims = false to keep the short names (then set RoleClaimType = "role")',
      ],
    },
    {
      heading: 'Role-Based Access Control in ASP.NET Core',
      content:
        'Roles live in AspNetRoles and the user-role links in AspNetUserRoles. RoleManager<IdentityRole> creates roles; UserManager.AddToRoleAsync/RemoveFromRoleAsync/GetRolesAsync manage membership. When you create the JWT you add one ClaimTypes.Role claim per role. Then [Authorize(Roles = "Admin")] works. A comma means OR; stacking two attributes means AND.',
      syntax: `[Authorize(Roles = "Admin,Manager")]     // Admin OR Manager
public IActionResult Create() ...

[Authorize(Roles = "Admin")]
[Authorize(Roles = "Auditor")]           // Admin AND Auditor
public IActionResult AuditLog() ...

options.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));   // same rule as a policy`,
      tip: 'Seed roles and the first Admin at startup (or in a migration) – otherwise nobody can ever call the "assign role" endpoint.',
    },
    {
      heading: 'Policy-based authorization: requirements and handlers',
      content:
        'Register policies in AddAuthorization. Built-in builders: RequireAuthenticatedUser, RequireRole, RequireClaim (type, optional allowed values), RequireUserName and RequireAssertion (lambda). For reusable logic create a requirement class (implements IAuthorizationRequirement, holds data such as MinimumAge = 18) and a handler (AuthorizationHandler<TRequirement>) that calls context.Succeed(requirement). Register the handler in DI. All requirements in a policy must succeed (AND). Several handlers for the same requirement act as OR – any one may succeed.',
      syntax: `options.AddPolicy("AtLeast18", p => p.AddRequirements(new MinimumAgeRequirement(18)));
builder.Services.AddSingleton<IAuthorizationHandler, MinimumAgeHandler>();

[Authorize(Policy = "AtLeast18")]
public IActionResult BuyTicket() ...`,
      points: [
        'context.Succeed(req) = requirement met; doing nothing = not met; context.Fail() = force failure even if another handler succeeds',
        'DefaultPolicy is used by a plain [Authorize]; FallbackPolicy applies to endpoints that have NO authorization metadata',
        'Minimal APIs: .RequireAuthorization("AdminOnly") and .AllowAnonymous()',
      ],
    },
    {
      heading: 'Permissions and resource-based authorization',
      content:
        'Large apps often map roles to permissions (students.read, students.delete …) and check permissions instead of role names, so new roles need no code change. A [Flags] enum or permission claims are common. Sometimes the decision depends on the data itself, e.g. "a student may edit only their own document, an admin may edit any". Attributes run before the action loads the data, so inject IAuthorizationService, load the resource and call AuthorizeAsync(User, resource, requirement). Return Forbid() (403) when it fails.',
      points: [
        'OperationAuthorizationRequirement { Name = "Update" } represents CRUD operations',
        'Handler type: AuthorizationHandler<TRequirement, TResource>',
        'Never trust the client to send "isOwner=true" – compare the token\'s user id with the database row',
      ],
    },
    {
      heading: 'Role-based UI is not security',
      content:
        'In React you hide the Delete button for non-admins and protect /admin routes (Day 107). That is only for user experience. Anyone can call the API with Postman, so EVERY rule must be enforced on the server with [Authorize], policies or IAuthorizationService. Return 403 Forbidden for authenticated-but-not-allowed users and do not leak data in the error.',
    },
  ],
  examples: [
    {
      title: 'Exploring ClaimsPrincipal in a console app',
      scenario:
        'Build exactly the object that ASP.NET Core puts into HttpContext.User after validating a JWT, then ask it questions: name, roles, IsInRole, FindFirst and HasClaim. Compare with an anonymous user.',
      steps: [
        'In Visual Studio: File > New > Project > Console App, name it ClaimsDemo',
        'Replace Program.cs with the code below (System.Security.Claims is part of .NET, no NuGet needed)',
        'Press Ctrl+F5',
        'Hover over ravi in the debugger (F9 on the first Console.WriteLine, then F5) and expand Claims to see every claim',
      ],
      code: claimsCode,
      csharp: { files: { 'Program.cs': claimsCode }, stdin: '' },
      result: `Name           : Ravi
Authenticated  : True
Auth type      : Jwt
Roles          : Admin, Manager
IsInRole Admin : True
IsInRole admin : False
IsInRole HR    : False
Department     : IT
HasClaim IT    : True
Claim count    : 6
Guest name     : (anonymous)
Guest authenticated: False
Role claim type: http://schemas.microsoft.com/ws/2008/06/identity/claims/role`,
      explanation:
        'Identity.Name reads the ClaimTypes.Name claim. IsAuthenticated is true only because we passed an authenticationType ("Jwt"); the guest identity has none, so it is anonymous – that is what causes 401. A user can have many role claims. IsInRole compares the value case-sensitively, so "admin" returns False. Custom claim types such as "department" are just strings. ClaimTypes.Role is a URI constant, which is why JWTs created by .NET contain that long name unless you map it.',
    },
    {
      title: 'A mini policy engine: roles + claims + custom rules',
      scenario:
        'Simulate how ASP.NET Core evaluates named policies against users. Three users with different roles and claims are checked against four policies and the program prints an ALLOW/DENY matrix.',
      steps: [
        'File > New > Project > Console App, name it PolicyEngineDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Change Sita\'s birthYear to "2000" and run again – the AtLeast18 row changes',
      ],
      code: policyEngineCode,
      csharp: { files: { 'Program.cs': policyEngineCode }, stdin: '' },
      result: `Policy            Ravi   Sita   Amit
AdminOnly         ALLOW  DENY   DENY
ITDepartment      ALLOW  ALLOW  DENY
AtLeast18         ALLOW  DENY   ALLOW
CanDeleteStudent  ALLOW  DENY   ALLOW`,
      explanation:
        'AdminOnly is pure RBAC. ITDepartment is a claim check (Amit is in Sales). AtLeast18 is a custom requirement: 2026-1990 = 36, 2026-2010 = 16 (DENY), 2026-1995 = 31. CanDeleteStudent combines a role with a permission claim: Admin always, or a Manager who also has permission=students.delete. In ASP.NET Core each lambda becomes a policy built with RequireRole, RequireClaim, RequireAssertion or a requirement + handler, and a DENY becomes HTTP 403.',
    },
    {
      title: 'Permission flags mapped from roles',
      scenario:
        'Instead of checking role names everywhere, map each role to a set of permissions with a [Flags] enum. A user with several roles gets the combination (bitwise OR) and the code checks HasFlag(Permissions.Delete).',
      steps: [
        'File > New > Project > Console App, name it PermissionFlagsDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Add a new role "Clerk" = Read | Create to the dictionary – no other code changes are needed',
      ],
      code: permissionsCode,
      csharp: { files: { 'Program.cs': permissionsCode }, stdin: '' },
      result: `Admin   : All
Teacher : Read, Create, Update
Student : Read
Teacher can Delete? False
Teacher can Update? True
Student can Read?   True
Teacher+Student = Read, Create, Update (7)
Admin value = 15`,
      explanation:
        'Each flag is a power of two (1, 2, 4, 8) so they can be combined with |. Enum.ToString on a [Flags] enum prints the names of the set bits, or "All" when the value exactly matches a defined combination (15). Aggregate starts from None and ORs the permissions of every role, so Teacher+Student = 1|2|4|1 = 7. In an API you would put these permissions into the JWT as claims and check them in a policy.',
    },
    {
      title: 'ASP.NET Core API with roles, claims, policies and a custom handler',
      scenario:
        'Extend the Day 111 AuthApi: seed Admin/Manager/User roles and a first admin, define policies (AdminOnly, ITDepartment, SeniorManager, AtLeast18, CanDeleteStudent), protect StudentsController actions and add an AdminController to assign roles and claims.',
      steps: [
        'Open the AuthApi project from Day 111',
        'Add folder Authorization with MinimumAgeRequirement.cs (requirement + handler)',
        'Update Program.cs with AddAuthorization(...) policies, the handler registration and the seeding block',
        'Add StudentsController and AdminController; in TokenService add the user\'s claims with GetClaimsAsync',
        'Press F5, log in as admin@demo.com in Swagger, click Authorize and paste the token',
        'Register a normal user, log in as that user and call DELETE /api/students/0 to see 403',
      ],
      code: apiCode,
      result: `GET    /api/students                    (no token)          -> 200 ["Asha","Bala","Chitra"]
GET    /api/students/me                 (no token)          -> 401 Unauthorized
GET    /api/students/me                 (User token)        -> 200 {"name":"Sita Sharma","roles":["User"],"department":null}
POST   /api/students  "Deepa"           (User token)        -> 403 Forbidden
POST   /api/students  "Deepa"           (Admin token)       -> 201 Created "Deepa"
DELETE /api/students/0                  (User token)        -> 403 Forbidden
DELETE /api/students/0                  (Admin token)       -> 204 No Content
GET    /api/students/it-reports         (Admin, dept=IT)    -> 200 "Server room report"
POST   /api/admin/assign-role {"email":"sita@demo.com","role":"Manager"} (Admin) -> 200 "sita@demo.com is now Manager"
POST   /api/admin/assign-role ...       (User token)        -> 403 Forbidden`,
      explanation:
        'The FallbackPolicy makes every endpoint require login unless it says [AllowAnonymous]. Roles = "Admin,Manager" is OR. CanDeleteStudent uses RequireAssertion. AtLeast18 uses a requirement/handler pair registered in DI. After assigning a role or claim the user must log in again (or refresh) because the old JWT still holds the old roles – tokens are snapshots.',
    },
    {
      title: 'Resource-based authorization: owner or admin',
      scenario:
        'Students upload documents. Everyone can read, only the owner can update or delete, and Admins can do everything. The rule needs the document\'s OwnerId, so the controller loads the document and calls IAuthorizationService.',
      steps: [
        'Add the StudentDocument model and DbSet<StudentDocument> StudentDocuments to AppDbContext',
        'Package Manager Console: Add-Migration AddDocuments; Update-Database',
        'Add DocumentOwnerHandler and DocOps, register the handler in Program.cs',
        'Add DocumentsController; test PUT /api/documents/1 with the owner\'s token and with another user\'s token',
      ],
      code: resourceCode,
      result: `PUT /api/documents/1 "New title"  (token of the owner, sub = user-A)  -> 204 No Content
PUT /api/documents/1 "Hack"       (token of user-B)                  -> 403 Forbidden
PUT /api/documents/1 "Fixed"      (Admin token)                      -> 204 No Content
PUT /api/documents/99 ...                                            -> 404 Not Found
GET /api/reports/salary           (User token)                       -> 403 Forbidden`,
      explanation:
        'The handler receives the requirement (Update) and the resource (the document). It succeeds for Admins, for Read operations, and when doc.OwnerId equals the NameIdentifier claim from the token. Forbid() produces 403 through the authentication scheme. Minimal API endpoints reuse the same named policies via RequireAuthorization.',
    },
  ],
  interview: [
    { q: 'What is the difference between RBAC and claims-based authorization?', a: 'RBAC checks membership in roles (Admin, User). Claims-based checks facts about the user (department, age, employeeId). Roles are actually claims of type ClaimTypes.Role, so RBAC is a special case of claims.', level: 'Easy' },
    { q: 'What is a policy in ASP.NET Core authorization?', a: 'A named set of requirements registered in AddAuthorization. Endpoints refer to it with [Authorize(Policy = "Name")] or RequireAuthorization("Name"). All requirements must be satisfied.', level: 'Easy' },
    { q: 'How do [Authorize(Roles = "A,B")] and two separate [Authorize(Roles)] attributes differ?', a: 'A comma-separated list means the user needs ANY of the roles (OR). Two attributes are both evaluated, so the user needs BOTH roles (AND).', level: 'Medium' },
    { q: 'How do you write a custom authorization requirement?', a: 'Create a class implementing IAuthorizationRequirement (holding parameters), a handler deriving from AuthorizationHandler<TRequirement> that calls context.Succeed(requirement) when met, register the handler as IAuthorizationHandler in DI and add the requirement to a policy.', level: 'Medium' },
    { q: 'What is the difference between DefaultPolicy and FallbackPolicy?', a: 'DefaultPolicy is used when [Authorize] has no policy/roles (default: authenticated user). FallbackPolicy is applied to endpoints that have no authorization metadata at all – useful to secure everything by default.', level: 'Hard' },
    { q: 'When do you need resource-based authorization?', a: 'When the decision depends on the data being accessed, e.g. owner-only edits. Attributes run before the resource is loaded, so you call IAuthorizationService.AuthorizeAsync(User, resource, requirement) inside the action.', level: 'Medium' },
    { q: 'Output question: new ClaimsPrincipal(new ClaimsIdentity()).Identity.IsAuthenticated prints?', a: 'False. A ClaimsIdentity is authenticated only if it has a non-empty AuthenticationType.', level: 'Medium' },
    { q: 'Output question: a user has role claim "Admin". What does User.IsInRole("admin") return?', a: 'False. IsInRole uses HasClaim with an ordinal (case-sensitive) comparison of the role value.', level: 'Hard' },
    { q: 'A user was promoted to Admin but still gets 403. Why?', a: 'The JWT issued before the promotion still contains the old role claims. The user must refresh or log in again to get a new token containing the Admin role.', level: 'Medium' },
    { q: 'What is the difference between context.Succeed and context.Fail in a handler?', a: 'Succeed marks that one requirement as met. Not calling anything leaves it unmet. Fail() marks the whole authorization as failed even if other handlers succeed.', level: 'Hard' },
    { q: 'Why is hiding buttons in React not enough?', a: 'The UI can be bypassed with Postman, curl or browser dev tools. Authorization must be enforced on the server for every endpoint.', level: 'Easy' },
    { q: 'How do you return 401 vs 403 manually in a controller?', a: 'Challenge() or Unauthorized() for 401 (not authenticated); Forbid() for 403 (authenticated but not allowed).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a console method CanAccess(ClaimsPrincipal user, string page) where "/admin" needs role Admin, "/reports" needs claim department=Finance or role Admin, and everything else needs only authentication. Test it with three users.',
      hint: 'Use user.Identity?.IsAuthenticated, IsInRole and HasClaim; return "401", "403" or "200".',
      solution: `string CanAccess(ClaimsPrincipal user, string page)
{
    if (user.Identity?.IsAuthenticated != true) return "401";
    return page switch
    {
        "/admin"   => user.IsInRole("Admin") ? "200" : "403",
        "/reports" => user.IsInRole("Admin") || user.HasClaim("department", "Finance") ? "200" : "403",
        _          => "200"
    };
}`,
    },
    {
      task: 'Create a "WorkingHours" policy that allows access only between 09:00 and 18:00 (server time) using a custom requirement and handler.',
      hint: 'Inject TimeProvider into the handler so you can test it with a fake time.',
      solution: `public class WorkingHoursRequirement : IAuthorizationRequirement
{
    public TimeOnly Start { get; } = new(9, 0);
    public TimeOnly End { get; } = new(18, 0);
}
public class WorkingHoursHandler : AuthorizationHandler<WorkingHoursRequirement>
{
    private readonly TimeProvider _time;
    public WorkingHoursHandler(TimeProvider time) => _time = time;
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext ctx, WorkingHoursRequirement r)
    {
        var now = TimeOnly.FromDateTime(_time.GetLocalNow().DateTime);
        if (now >= r.Start && now < r.End) ctx.Succeed(r);
        return Task.CompletedTask;
    }
}
// builder.Services.AddSingleton(TimeProvider.System);
// builder.Services.AddSingleton<IAuthorizationHandler, WorkingHoursHandler>();
// options.AddPolicy("WorkingHours", p => p.AddRequirements(new WorkingHoursRequirement()));`,
    },
    {
      task: 'Add a GET /api/admin/users endpoint (AdminOnly) that returns every user with their roles.',
      hint: 'Loop over _users.Users.ToList() and call GetRolesAsync for each user.',
      solution: `[HttpGet("users")]
public async Task<IActionResult> Users()
{
    var list = new List<object>();
    foreach (var u in _users.Users.ToList())
        list.Add(new { u.Email, u.FullName, Roles = await _users.GetRolesAsync(u) });
    return Ok(list);
}`,
    },
    {
      task: 'Convert the permission-flags demo into claims: when creating the JWT add one "permission" claim per flag, and create a policy "Students.Delete" that requires claim permission=Delete.',
      hint: 'Enum.GetValues<Permissions>() and perms.HasFlag(p) for every single-bit value.',
      solution: `foreach (var p in Enum.GetValues<Permissions>())
    if (p != Permissions.None && p != Permissions.All && perms.HasFlag(p))
        claims.Add(new Claim("permission", p.ToString()));

options.AddPolicy("Students.Delete", p => p.RequireClaim("permission", "Delete"));`,
    },
    {
      task: 'Make every endpoint in the API require login by default and mark Login, Register and the public student list with [AllowAnonymous]. Verify with Swagger that other endpoints return 401 without a token.',
      hint: 'options.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();',
      solution: `builder.Services.AddAuthorization(o =>
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build());

[HttpPost("login"), AllowAnonymous] public Task<IActionResult> Login(LoginDto dto) ...
[HttpPost("register"), AllowAnonymous] public Task<IActionResult> Register(RegisterDto dto) ...
// Note: Swagger UI itself must also be allowed, e.g. app.MapSwagger().AllowAnonymous() or configure it before auth.`,
    },
  ],
  quiz: [
    {
      question: 'A logged-in user with role "User" calls an endpoint marked [Authorize(Roles = "Admin")]. Which status code is returned?',
      options: ['200 OK', '401 Unauthorized', '403 Forbidden', '404 Not Found'],
      answer: 2,
      explanation: 'The user is authenticated but lacks the role, so the result is 403 Forbidden.',
    },
    {
      question: 'Which builder method checks that a claim "department" has the value "IT"?',
      options: ['p.RequireClaim("department", "IT")', 'p.RequireRole("IT")', 'p.RequireUserName("IT")', 'p.AddClaim("department")'],
      answer: 0,
      explanation: 'RequireClaim(type, allowedValues) checks the claim type and value.',
    },
    {
      question: 'Where do you register a custom AuthorizationHandler?',
      options: ['In appsettings.json', 'In the DI container as IAuthorizationHandler', 'Inside the JWT payload', 'In the controller constructor only'],
      answer: 1,
      explanation: 'builder.Services.AddSingleton/AddScoped<IAuthorizationHandler, MyHandler>() lets the authorization system find it.',
    },
    {
      question: 'Which service do you inject to check "is the current user the owner of this document" inside an action?',
      options: ['ILogger', 'IConfiguration', 'IHttpClientFactory', 'IAuthorizationService'],
      answer: 3,
      explanation: 'IAuthorizationService.AuthorizeAsync(User, resource, requirement) performs resource-based authorization.',
    },
    {
      question: 'What does [Authorize(Roles = "Admin,Manager")] mean?',
      options: ['User must be in both roles', 'User must be in Admin or Manager', 'Only a role literally named "Admin,Manager"', 'Anonymous users are allowed'],
      answer: 1,
      explanation: 'Comma-separated roles in a single attribute are combined with OR.',
    },
  ],
};
