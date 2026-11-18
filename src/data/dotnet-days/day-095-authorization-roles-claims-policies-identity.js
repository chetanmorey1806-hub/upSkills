export default {
  id: 'day-095-authorization-roles-claims-policies-identity',
  title: 'Authorization, Roles, Claims, Policies, ASP.NET Core Identity',
  module: 'ASP.NET Core Web API',
  day: 95,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: `After authentication (Day 94) decide WHAT each user may do. Learn role-based authorization ([Authorize(Roles = "Admin")]), claims-based authorization, policy-based authorization with custom requirements and handlers, resource-based checks, and fallback policies. Replace the hand-made Users table with ASP.NET Core Identity (UserManager, RoleManager, IdentityDbContext), seed Admin and User roles, put roles and claims into the JWT, and test Admin vs User access in Swagger and Postman.`,
  objectives: [
    'Differentiate authentication and authorization and return 401 vs 403 correctly',
    'Protect endpoints with roles, claims and named policies',
    'Write a custom IAuthorizationRequirement and AuthorizationHandler',
    'Set up ASP.NET Core Identity with EF Core and seed Admin/User roles and an admin account',
    'Issue JWTs containing role and custom claims from Identity and test both roles',
  ],
  theory: [
    {
      heading: 'Authorization basics',
      content: `Authentication = who are you (identity proven by a token). Authorization = what are you allowed to do. ASP.NET Core represents the current user as a ClaimsPrincipal (HttpContext.User / ControllerBase.User) containing one or more ClaimsIdentity objects, each with a list of Claims (type + value), such as name = asha, role = Admin, department = IT. Every authorization decision is made by inspecting these claims. Analogy: an office ID card. Showing a valid card gets you into the building (authenticated); the colour of the card and the floor printed on it decide which rooms you can enter (authorized).`,
      points: [
        '[Authorize] - any authenticated user',
        '[AllowAnonymous] - overrides [Authorize] for one action (login, register, public product list)',
        'No/invalid token -> 401 Unauthorized (challenge); valid token but not allowed -> 403 Forbidden (forbid)',
      ],
    },
    {
      heading: 'Role-based authorization',
      content: `A role is a group of users with the same permissions (Admin, Manager, User). Roles travel as claims of type ClaimTypes.Role. [Authorize(Roles = "Admin,Manager")] means Admin OR Manager. Stacking two attributes means AND. Inside code use User.IsInRole("Admin").`,
      syntax: `[Authorize(Roles = "Admin")]                 // only Admin
[Authorize(Roles = "Admin,Manager")]         // Admin OR Manager

[Authorize(Roles = "Admin")]
[Authorize(Roles = "Auditor")]               // Admin AND Auditor
public IActionResult Audit() => Ok();`,
    },
    {
      heading: 'Claims-based and policy-based authorization',
      content: `A policy is a named set of requirements registered once in Program.cs and applied with [Authorize(Policy = "Name")]. Policies keep rules in one place and can combine roles, claims, authentication schemes and custom code. Claims-based checks are written as policies: RequireClaim("department", "IT") or RequireAssertion for any expression.`,
      syntax: `builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    o.AddPolicy("ITDepartment", p => p.RequireClaim("department", "IT"));
    o.AddPolicy("CanDeleteStudents", p => p.RequireAssertion(ctx =>
        ctx.User.IsInRole("Admin") || ctx.User.HasClaim("permission", "students.delete")));
    o.AddPolicy("Senior", p => p.Requirements.Add(new MinimumExperienceRequirement(5)));

    // every endpoint requires an authenticated user unless it has [AllowAnonymous]
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});`,
    },
    {
      heading: 'Custom requirements and handlers',
      content: `For rules that need logic (minimum age, working hours, subscription level) create a requirement class (data) that implements IAuthorizationRequirement and a handler (logic) that derives from AuthorizationHandler<TRequirement>. Call context.Succeed(requirement) when the rule is met; do nothing (or context.Fail()) otherwise. Register the handler in DI. Handlers can inject services such as DbContext.`,
      syntax: `public record MinimumExperienceRequirement(int Years) : IAuthorizationRequirement;

public class MinimumExperienceHandler : AuthorizationHandler<MinimumExperienceRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext ctx, MinimumExperienceRequirement req)
    {
        if (int.TryParse(ctx.User.FindFirst("experienceYears")?.Value, out int years) && years >= req.Years)
            ctx.Succeed(req);
        return Task.CompletedTask;
    }
}
builder.Services.AddSingleton<IAuthorizationHandler, MinimumExperienceHandler>();`,
    },
    {
      heading: 'Resource-based authorization',
      content: `Sometimes the decision depends on the data itself: "a user may edit only HIS OWN profile; an Admin may edit anyone's". The attribute runs before the action, when the resource is not loaded yet, so inject IAuthorizationService and call AuthorizeAsync(User, resource, policyOrRequirement) inside the action after loading the entity. Return Forbid() when it fails.`,
      syntax: `var student = await _db.Students.FindAsync(id);
var result = await _authz.AuthorizeAsync(User, student, "OwnerOrAdmin");
if (!result.Succeeded) return Forbid();          // 403`,
    },
    {
      heading: 'ASP.NET Core Identity',
      content: `Identity is Microsoft's membership system: users, password hashing and rules, roles, claims, lockout, email confirmation, 2FA, external logins. With EF Core it creates tables AspNetUsers, AspNetRoles, AspNetUserRoles, AspNetUserClaims, AspNetRoleClaims, AspNetUserLogins, AspNetUserTokens. For a JWT Web API use AddIdentityCore<AppUser>().AddRoles<IdentityRole>().AddEntityFrameworkStores<AppDbContext>() and issue your own tokens; .NET 8+ also offers MapIdentityApi<AppUser>() with ready /register and /login endpoints (Day 110).`,
      points: [
        'UserManager<AppUser>: CreateAsync, FindByEmailAsync, CheckPasswordAsync, AddToRoleAsync, GetRolesAsync, AddClaimAsync, GetClaimsAsync',
        'RoleManager<IdentityRole>: RoleExistsAsync, CreateAsync',
        'Package: Microsoft.AspNetCore.Identity.EntityFrameworkCore; DbContext derives from IdentityDbContext<AppUser>',
        'Password rules: options.Password.RequiredLength, RequireDigit, RequireUppercase, RequireNonAlphanumeric',
      ],
      tip: 'Role and claim changes take effect only in NEW tokens. After making someone Admin, they must log in again (or refresh) to get a token with the Admin role.',
    },
  ],
  examples: [
    {
      title: 'Console: ClaimsPrincipal, roles, claims and policy decisions',
      scenario: 'Simulate how ASP.NET Core decides 200, 401 or 403 for different users and policies.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ClaimsDemo > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: `using System.Security.Claims;

var asha = CreateUser("asha", new[] { "User" }, department: "IT", experienceYears: 1);
var ravi = CreateUser("ravi", new[] { "Admin", "User" }, department: "HR", experienceYears: 6);
var guest = new ClaimsPrincipal(new ClaimsIdentity());     // no authentication type -> anonymous

var policies = new List<(string Name, Func<ClaimsPrincipal, bool> Rule)>
{
    ("Authenticated", u => true),                                   // [Authorize]
    ("AdminOnly",     u => u.IsInRole("Admin")),                    // RequireRole("Admin")
    ("ITDepartment",  u => u.HasClaim("department", "IT")),         // RequireClaim("department","IT")
    ("Senior",        u => int.TryParse(u.FindFirst("experienceYears")?.Value, out int y) && y >= 5),
};

foreach (var user in new[] { asha, ravi, guest })
{
    string name = user.Identity!.Name ?? "(anonymous)";
    string roles = string.Join(",", user.FindAll(ClaimTypes.Role).Select(c => c.Value));
    Console.WriteLine($"{name}: authenticated={user.Identity!.IsAuthenticated}, roles={roles}");
    foreach (var (policyName, rule) in policies)
        Console.WriteLine($"  {policyName,-13} -> {Decide(user, rule)}");
}

static string Decide(ClaimsPrincipal user, Func<ClaimsPrincipal, bool> rule)
{
    if (user.Identity?.IsAuthenticated != true) return "401 Unauthorized";
    return rule(user) ? "200 OK" : "403 Forbidden";
}

static ClaimsPrincipal CreateUser(string name, string[] roles, string department, int experienceYears)
{
    var claims = new List<Claim>
    {
        new(ClaimTypes.Name, name),
        new("department", department),
        new("experienceYears", experienceYears.ToString())
    };
    claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
    return new ClaimsPrincipal(new ClaimsIdentity(claims, authenticationType: "Bearer"));
}`,
      csharp: {
        files: {
          'Program.cs': `using System.Security.Claims;

var asha = CreateUser("asha", new[] { "User" }, department: "IT", experienceYears: 1);
var ravi = CreateUser("ravi", new[] { "Admin", "User" }, department: "HR", experienceYears: 6);
var guest = new ClaimsPrincipal(new ClaimsIdentity());     // no authentication type -> anonymous

var policies = new List<(string Name, Func<ClaimsPrincipal, bool> Rule)>
{
    ("Authenticated", u => true),                                   // [Authorize]
    ("AdminOnly",     u => u.IsInRole("Admin")),                    // RequireRole("Admin")
    ("ITDepartment",  u => u.HasClaim("department", "IT")),         // RequireClaim("department","IT")
    ("Senior",        u => int.TryParse(u.FindFirst("experienceYears")?.Value, out int y) && y >= 5),
};

foreach (var user in new[] { asha, ravi, guest })
{
    string name = user.Identity!.Name ?? "(anonymous)";
    string roles = string.Join(",", user.FindAll(ClaimTypes.Role).Select(c => c.Value));
    Console.WriteLine($"{name}: authenticated={user.Identity!.IsAuthenticated}, roles={roles}");
    foreach (var (policyName, rule) in policies)
        Console.WriteLine($"  {policyName,-13} -> {Decide(user, rule)}");
}

static string Decide(ClaimsPrincipal user, Func<ClaimsPrincipal, bool> rule)
{
    if (user.Identity?.IsAuthenticated != true) return "401 Unauthorized";
    return rule(user) ? "200 OK" : "403 Forbidden";
}

static ClaimsPrincipal CreateUser(string name, string[] roles, string department, int experienceYears)
{
    var claims = new List<Claim>
    {
        new(ClaimTypes.Name, name),
        new("department", department),
        new("experienceYears", experienceYears.ToString())
    };
    claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
    return new ClaimsPrincipal(new ClaimsIdentity(claims, authenticationType: "Bearer"));
}`,
        },
        stdin: '',
      },
      result: `asha: authenticated=True, roles=User
  Authenticated -> 200 OK
  AdminOnly     -> 403 Forbidden
  ITDepartment  -> 200 OK
  Senior        -> 403 Forbidden
ravi: authenticated=True, roles=Admin,User
  Authenticated -> 200 OK
  AdminOnly     -> 200 OK
  ITDepartment  -> 403 Forbidden
  Senior        -> 200 OK
(anonymous): authenticated=False, roles=
  Authenticated -> 401 Unauthorized
  AdminOnly     -> 401 Unauthorized
  ITDepartment  -> 401 Unauthorized
  Senior        -> 401 Unauthorized`,
      explanation: `A ClaimsIdentity is authenticated only when it has an authentication type ("Bearer" here); the guest identity has none, so every protected policy gives 401 - the user must log in first. For authenticated users a failed rule gives 403. IsInRole looks for claims of type ClaimTypes.Role, exactly as ASP.NET Core does. {policyName,-13} left-aligns the name in 13 characters.`,
    },
    {
      title: 'Set up ASP.NET Core Identity with roles and seed an Admin',
      scenario: 'Replace the custom Users table with Identity and create the Admin and User roles automatically.',
      steps: [
        'Package Manager Console: Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore',
        '(JwtBearer and System.IdentityModel.Tokens.Jwt are already installed from Day 94)',
        'Add Models/AppUser.cs; change AppDbContext to derive from IdentityDbContext<AppUser>',
        'Add Data/IdentitySeeder.cs and update Program.cs',
        'PM> Add-Migration AddIdentity  then  PM> Update-Database',
        'Ctrl+F5 - the seeder runs at startup; check SSMS > StudentApiDB > Tables > dbo.AspNetRoles',
      ],
      code: `// Models/AppUser.cs
using Microsoft.AspNetCore.Identity;
namespace StudentApi.Models;
public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
}

// Data/AppDbContext.cs
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using StudentApi.Models;
namespace StudentApi.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<Student> Students => Set<Student>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);          // REQUIRED: configures the AspNet* tables
        builder.Entity<Student>().Property(s => s.Name).HasMaxLength(100);
    }
}

// Data/IdentitySeeder.cs
using Microsoft.AspNetCore.Identity;
using StudentApi.Models;
namespace StudentApi.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<AppUser>>();

        foreach (var role in new[] { "Admin", "User" })
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));

        const string adminEmail = "admin@corp.com";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new AppUser
            {
                UserName = adminEmail, Email = adminEmail, EmailConfirmed = true,
                FullName = "System Admin", Department = "IT", ExperienceYears = 8
            };
            var result = await userManager.CreateAsync(admin, "Admin@12345");   // dev only!
            if (result.Succeeded)
                await userManager.AddToRolesAsync(admin, new[] { "Admin", "User" });
        }
    }
}

// Program.cs (Identity part)
builder.Services.AddIdentityCore<AppUser>(o =>
    {
        o.Password.RequiredLength = 8;
        o.Password.RequireDigit = true;
        o.Password.RequireUppercase = true;
        o.Password.RequireNonAlphanumeric = true;
        o.User.RequireUniqueEmail = true;
        o.Lockout.MaxFailedAccessAttempts = 5;
    })
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<AppDbContext>();

// ... AddAuthentication().AddJwtBearer(...) exactly as on Day 94 ...

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    await IdentitySeeder.SeedAsync(scope.ServiceProvider);
}`,
      result: `PM> Add-Migration AddIdentity
PM> Update-Database
Applying migration '20261117120000_AddIdentity'.
Done.

SSMS -> StudentApiDB tables:
dbo.AspNetRoleClaims, dbo.AspNetRoles, dbo.AspNetUserClaims, dbo.AspNetUserLogins,
dbo.AspNetUserRoles, dbo.AspNetUsers, dbo.AspNetUserTokens, dbo.Students

SELECT Name FROM AspNetRoles;          -> Admin, User
SELECT UserName FROM AspNetUsers;      -> admin@corp.com
SELECT COUNT(*) FROM AspNetUserRoles;  -> 2`,
      explanation: `IdentityDbContext adds all AspNet* entities; forgetting base.OnModelCreating causes "The entity type IdentityUserLogin<string> requires a primary key". The seeder is idempotent: it creates roles and the admin only when they are missing, so it is safe on every start. Seeded passwords belong in user secrets, never in source control for real systems. AddIdentityCore registers UserManager/RoleManager without cookie authentication, which is ideal for a JWT API.`,
    },
    {
      title: 'Account and Admin controllers with roles, claims and policies',
      scenario: 'Register normal users, login with JWT containing roles and claims, and protect admin features.',
      steps: [
        'Add Authorization/MinimumExperienceRequirement.cs (requirement + handler)',
        'Register policies and the handler in Program.cs',
        'Add Controllers/AccountController.cs and Controllers/AdminController.cs',
        'Change TokenService.CreateAccessToken to accept roles and extra claims (code below)',
        'Ctrl+F5 and test with the next example',
      ],
      code: `// Authorization/MinimumExperienceRequirement.cs
using Microsoft.AspNetCore.Authorization;
namespace StudentApi.Authorization;

public record MinimumExperienceRequirement(int Years) : IAuthorizationRequirement;

public class MinimumExperienceHandler : AuthorizationHandler<MinimumExperienceRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context,
                                                   MinimumExperienceRequirement requirement)
    {
        var claim = context.User.FindFirst("experienceYears");
        if (claim != null && int.TryParse(claim.Value, out int years) && years >= requirement.Years)
            context.Succeed(requirement);
        return Task.CompletedTask;
    }
}

// Program.cs (authorization part)
builder.Services.AddSingleton<IAuthorizationHandler, MinimumExperienceHandler>();
builder.Services.AddAuthorization(o =>
{
    o.AddPolicy("AdminOnly", p => p.RequireRole("Admin"));
    o.AddPolicy("ITDepartment", p => p.RequireClaim("department", "IT"));
    o.AddPolicy("Senior", p => p.AddRequirements(new MinimumExperienceRequirement(5)));
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
});

// Services/TokenService.cs (new signature)
public string CreateAccessToken(AppUser user, IList<string> roles, IList<Claim> userClaims)
{
    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id),
        new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
        new(ClaimTypes.Name, user.UserName!),
        new(ClaimTypes.Email, user.Email!),
        new("department", user.Department),
        new("experienceYears", user.ExperienceYears.ToString())
    };
    claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));
    claims.AddRange(userClaims);                    // e.g. permission = students.delete
    // ... same signing code as Day 94 ...
}

// Controllers/AccountController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentApi.Models;
using StudentApi.Services;
namespace StudentApi.Controllers;

public record RegisterRequest(string Email, string Password, string FullName, string Department, int ExperienceYears);
public record LoginRequest(string Email, string Password);

[ApiController]
[Route("api/account")]
[AllowAnonymous]
public class AccountController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly ITokenService _tokens;
    public AccountController(UserManager<AppUser> users, ITokenService tokens)
    {
        _users = users;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest req)
    {
        var user = new AppUser
        {
            UserName = req.Email, Email = req.Email, FullName = req.FullName,
            Department = req.Department, ExperienceYears = req.ExperienceYears
        };
        var result = await _users.CreateAsync(user, req.Password);
        if (!result.Succeeded)
            return BadRequest(new { errors = result.Errors.Select(e => e.Description) });

        await _users.AddToRoleAsync(user, "User");      // new users are never Admin
        return StatusCode(201, new { user.Id, user.Email, role = "User" });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest req)
    {
        var user = await _users.FindByEmailAsync(req.Email);
        if (user is null || !await _users.CheckPasswordAsync(user, req.Password))
            return Unauthorized(new { message = "Invalid email or password" });

        var roles = await _users.GetRolesAsync(user);
        var claims = await _users.GetClaimsAsync(user);
        string token = _tokens.CreateAccessToken(user, roles, claims);
        return Ok(new { accessToken = token, roles });
    }
}

// Controllers/AdminController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using StudentApi.Models;
namespace StudentApi.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]                 // whole controller: Admin only
public class AdminController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    public AdminController(UserManager<AppUser> users) => _users = users;

    [HttpGet("users")]
    public IActionResult GetUsers() =>
        Ok(_users.Users.Select(u => new { u.Id, u.Email, u.FullName, u.Department }).ToList());

    [HttpPost("users/{email}/roles/{role}")]
    public async Task<IActionResult> AddRole(string email, string role)
    {
        var user = await _users.FindByEmailAsync(email);
        if (user is null) return NotFound();
        var result = await _users.AddToRoleAsync(user, role);
        return result.Succeeded ? NoContent() : BadRequest(result.Errors);
    }
}

// Controllers/ReportsController.cs - policies and claims
[ApiController]
[Route("api/reports")]
public class ReportsController : ControllerBase
{
    [HttpGet("public")]  [AllowAnonymous]                 public IActionResult Public() => Ok("Anyone");
    [HttpGet("mine")]                                      public IActionResult Mine() => Ok($"Hello {User.Identity!.Name}");  // fallback policy: logged-in users
    [HttpGet("it")]      [Authorize(Policy = "ITDepartment")] public IActionResult It() => Ok("IT report");
    [HttpGet("salary")]  [Authorize(Policy = "Senior")]       public IActionResult Salary() => Ok("Salary report");
    [HttpDelete("all")]  [Authorize(Policy = "AdminOnly")]    public IActionResult DeleteAll() => NoContent();
}`,
      result: `Swagger lists: /api/account/register, /api/account/login,
/api/admin/users, /api/admin/users/{email}/roles/{role},
/api/reports/public, /api/reports/mine, /api/reports/it, /api/reports/salary, /api/reports/all`,
      explanation: `The FallbackPolicy protects every endpoint that has no authorization attribute (like ReportsController.Mine), so you cannot forget [Authorize]; AccountController and Public opt out with [AllowAnonymous]. Roles come from AspNetUserRoles via GetRolesAsync; department and experienceYears come from the AppUser columns; extra permissions can be stored in AspNetUserClaims with AddClaimAsync. Note that Identity validates passwords with the configured rules and returns readable errors.`,
    },
    {
      title: 'Test Admin and User roles in Swagger and Postman',
      scenario: 'Compare what a normal user and the admin can do.',
      steps: [
        'Postman: POST {{baseUrl}}/api/account/register with body 1 (normal user)',
        'POST {{baseUrl}}/api/account/login with body 2; save accessToken as userToken (Post-response script)',
        'POST {{baseUrl}}/api/account/login with body 3; save accessToken as adminToken',
        'For each request in the result table set Authorization > Bearer Token > {{userToken}} or {{adminToken}}',
        'In Swagger: Authorize with one token, test, then Logout and Authorize with the other',
      ],
      code: `### Body 1 - register
{ "email": "asha@corp.com", "password": "Asha@12345", "fullName": "Asha Rao", "department": "IT", "experienceYears": 1 }

### Body 2 - login as user
{ "email": "asha@corp.com", "password": "Asha@12345" }

### Body 3 - login as admin (seeded)
{ "email": "admin@corp.com", "password": "Admin@12345" }

### Post-response script for login requests
pm.environment.set("userToken", pm.response.json().accessToken);   // or adminToken

### Weak password test
{ "email": "x@corp.com", "password": "abc", "fullName": "X", "department": "HR", "experienceYears": 0 }`,
      result: `login asha  -> 200 { "accessToken": "eyJ...", "roles": [ "User" ] }
login admin -> 200 { "accessToken": "eyJ...", "roles": [ "Admin", "User" ] }

Request                          no token   asha (User, IT, 1y)   admin (Admin, IT, 8y)
GET    /api/reports/public        200        200                   200
GET    /api/reports/mine          401        200 "Hello asha@corp.com"  200 "Hello admin@corp.com"
GET    /api/reports/it            401        200                   200
GET    /api/reports/salary        401        403                   200
DELETE /api/reports/all           401        403                   204
GET    /api/admin/users           401        403                   200 [ { "email": "admin@corp.com", ... }, { "email": "asha@corp.com", ... } ]
POST   /api/admin/users/asha@corp.com/roles/Admin   401   403      204

After the admin makes asha an Admin, asha's OLD token still says "User" -> /api/admin/users is still 403.
asha logs in again -> roles [ "Admin", "User" ] -> 200.

Weak password register -> 400
{ "errors": [ "Passwords must be at least 8 characters.", "Passwords must have at least one non alphanumeric character.",
              "Passwords must have at least one digit ('0'-'9').", "Passwords must have at least one uppercase ('A'-'Z')." ] }`,
      explanation: `401 always means "send a valid token"; 403 means "your token is fine but your roles/claims are not enough". Roles are copied into the token at login, so role changes require a new token. The order of the Identity password errors may differ slightly between versions.`,
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies identity (who you are, e.g. by validating a JWT). Authorization decides permissions (what you can do, e.g. Admin-only endpoints). Authentication happens first.', level: 'Easy' },
    { q: 'What is a claim?', a: 'A key-value statement about the user issued by a trusted party, e.g. name=asha, role=Admin, department=IT. A ClaimsIdentity holds claims; a ClaimsPrincipal holds identities.', level: 'Easy' },
    { q: 'Roles vs claims vs policies?', a: 'Roles are coarse groups (Admin). Claims are arbitrary attributes (department, permission). Policies are named rules that can combine roles, claims and custom logic; role and claim checks are themselves implemented as policies internally.', level: 'Medium' },
    { q: 'How do you require Admin OR Manager? And Admin AND Auditor?', a: 'OR: [Authorize(Roles = "Admin,Manager")]. AND: two separate attributes [Authorize(Roles = "Admin")] [Authorize(Roles = "Auditor")], or a policy with RequireRole("Admin").RequireRole("Auditor").', level: 'Medium' },
    { q: 'How do you write a custom authorization requirement?', a: 'Create a class implementing IAuthorizationRequirement, a handler deriving from AuthorizationHandler<TRequirement> that calls context.Succeed(requirement), register the handler as IAuthorizationHandler, and add the requirement to a policy.', level: 'Hard' },
    { q: 'What is a fallback policy?', a: 'AuthorizationOptions.FallbackPolicy applies to endpoints with no authorization metadata. Setting it to RequireAuthenticatedUser makes the whole API secure by default; public endpoints use [AllowAnonymous].', level: 'Hard' },
    { q: 'What is resource-based authorization?', a: 'Authorization that depends on the resource instance (e.g. only the owner can edit a document). You load the resource, then call IAuthorizationService.AuthorizeAsync(User, resource, policy) and return Forbid() on failure.', level: 'Hard' },
    { q: 'Which tables does ASP.NET Core Identity create?', a: 'AspNetUsers, AspNetRoles, AspNetUserRoles, AspNetUserClaims, AspNetRoleClaims, AspNetUserLogins, AspNetUserTokens.', level: 'Medium' },
    { q: 'AddIdentity vs AddIdentityCore?', a: 'AddIdentity registers Identity plus cookie authentication and SignInManager (MVC/Razor apps). AddIdentityCore registers only the core user services; add AddRoles, AddEntityFrameworkStores, AddSignInManager as needed - preferred for JWT APIs.', level: 'Hard' },
    { q: 'Why does a user still get 403 after being added to the Admin role?', a: 'Their existing JWT was issued before the change and still contains the old roles. They need a new token (login again or refresh).', level: 'Medium' },
    { q: 'What does Forbid() return compared with Unauthorized()?', a: 'Forbid() triggers the authentication scheme\'s forbid behaviour -> 403. Unauthorized() returns 401 (for JwtBearer, Challenge() also produces 401 with WWW-Authenticate).', level: 'Medium' },
    { q: 'Output question: [Authorize(Roles = "Admin")] on the controller and [AllowAnonymous] on one action. An anonymous request calls that action. Result?', a: '200 - [AllowAnonymous] bypasses all authorization attributes for that action.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a "Manager" role, seed it, and allow DELETE /api/students/{id} only for Admin or Manager.',
      hint: 'Add "Manager" to the seeder roles array and use Roles = "Admin,Manager".',
      solution: `foreach (var role in new[] { "Admin", "Manager", "User" }) ...
[HttpDelete("{id:int}")]
[Authorize(Roles = "Admin,Manager")]
public async Task<IActionResult> Delete(int id) { ... }`,
    },
    {
      task: 'Implement resource-based authorization: a user can GET /api/profiles/{userId} only for his own id; Admin can read any.',
      hint: 'Compare the route id with ClaimTypes.NameIdentifier.',
      solution: `[HttpGet("/api/profiles/{userId}")]
public async Task<IActionResult> Profile(string userId, [FromServices] UserManager<AppUser> users)
{
    string? me = User.FindFirstValue(ClaimTypes.NameIdentifier);
    if (me != userId && !User.IsInRole("Admin")) return Forbid();
    var u = await users.FindByIdAsync(userId);
    return u is null ? NotFound() : Ok(new { u.Email, u.FullName });
}`,
    },
    {
      task: 'Add a permission claim "students.export" to a user via an admin endpoint and protect GET /api/students/export with a policy requiring that claim.',
      hint: 'UserManager.AddClaimAsync and RequireClaim("permission", "students.export").',
      solution: `[HttpPost("users/{email}/claims/{permission}")]
public async Task<IActionResult> AddPermission(string email, string permission)
{
    var u = await _users.FindByEmailAsync(email);
    if (u is null) return NotFound();
    await _users.AddClaimAsync(u, new Claim("permission", permission));
    return NoContent();
}
o.AddPolicy("CanExport", p => p.RequireClaim("permission", "students.export"));
[HttpGet("export")] [Authorize(Policy = "CanExport")] public IActionResult Export() => Ok();`,
    },
    {
      task: 'Write a custom requirement "WorkingHours" that allows access only between 09:00 and 18:00 UTC.',
      hint: 'Inject TimeProvider into the handler so it can be unit tested.',
      solution: `public record WorkingHoursRequirement(int From, int To) : IAuthorizationRequirement;
public class WorkingHoursHandler(TimeProvider time) : AuthorizationHandler<WorkingHoursRequirement>
{
    protected override Task HandleRequirementAsync(AuthorizationHandlerContext ctx, WorkingHoursRequirement r)
    {
        int hour = time.GetUtcNow().Hour;
        if (hour >= r.From && hour < r.To) ctx.Succeed(r);
        return Task.CompletedTask;
    }
}
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddSingleton<IAuthorizationHandler, WorkingHoursHandler>();
o.AddPolicy("OfficeHours", p => p.AddRequirements(new WorkingHoursRequirement(9, 18)));`,
    },
  ],
  quiz: [
    { question: 'A logged-in User calls an Admin-only endpoint. The status code is:', options: ['401', '404', '403', '400'], answer: 2, explanation: 'Authenticated but not allowed -> 403 Forbidden.' },
    { question: '[Authorize(Roles = "Admin,Manager")] means:', options: ['Admin OR Manager', 'Admin AND Manager', 'Neither', 'Only Manager'], answer: 0, explanation: 'Comma-separated roles are combined with OR.' },
    { question: 'Which class creates users and checks passwords in Identity?', options: ['RoleManager<IdentityRole>', 'IdentityDbContext', 'PasswordValidator', 'UserManager<AppUser>'], answer: 3, explanation: 'UserManager provides CreateAsync, CheckPasswordAsync, AddToRoleAsync and more.' },
    { question: 'A custom authorization handler marks a requirement as satisfied by calling:', options: ['return true', 'context.Succeed(requirement)', 'context.Allow()', 'User.Authorize()'], answer: 1, explanation: 'Succeed marks the requirement as met.' },
    { question: 'Which option makes every endpoint require login unless marked [AllowAnonymous]?', options: ['DefaultPolicy only', 'RequireHttps', 'FallbackPolicy = RequireAuthenticatedUser()', 'AddIdentityCore'], answer: 2, explanation: 'The fallback policy applies to endpoints without authorization metadata.' },
  ],
};
