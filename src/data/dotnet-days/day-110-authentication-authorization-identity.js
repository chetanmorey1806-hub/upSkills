export default {
  id: 'day-110-authentication-authorization-identity',
  title: 'Authentication vs Authorization, ASP.NET Core Identity, User Registration and Login',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 110,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Learn the difference between authentication (who are you?) and authorization (what are you allowed to do?), install and configure ASP.NET Core Identity with EF Core and SQL Server, build user Registration and Login endpoints with UserManager and SignInManager, use the built-in Identity API endpoints of .NET 8+, and connect a React login form to the API.',
  objectives: [
    'Explain authentication vs authorization with real-world analogies and HTTP status codes 401 vs 403',
    'Install ASP.NET Core Identity packages and create an IdentityDbContext with a custom AppUser',
    'Build Register and Login APIs using UserManager<T> and SignInManager<T>',
    'Configure password, lockout and user options and understand the AspNetUsers / AspNetRoles tables',
    'Use MapIdentityApi and the Visual Studio "Individual Accounts" template for quick Identity setups',
  ],
  theory: [
    {
      heading: 'Authentication vs Authorization',
      content:
        'Authentication answers "Who are you?". The user proves identity with something they know (password), have (OTP phone, security key) or are (fingerprint). Authorization answers "What are you allowed to do?". It runs AFTER authentication and checks roles, claims or policies. Real-world analogy: at an airport the ID check at the entrance is authentication; the boarding pass that decides which flight and seat you can use is authorization. In ASP.NET Core the authentication middleware (UseAuthentication) reads the cookie or token and builds HttpContext.User (a ClaimsPrincipal). The authorization middleware (UseAuthorization) then checks [Authorize] rules against that user.',
      points: [
        '401 Unauthorized = not authenticated (no or invalid login/token) – really means "unauthenticated"',
        '403 Forbidden = authenticated but not allowed (e.g. normal User calling an Admin endpoint)',
        'Authentication scheme = the handler that knows how to read credentials: Cookies, JwtBearer, Identity bearer tokens, OAuth (Google, Microsoft)',
        'Order matters: app.UseAuthentication() must come before app.UseAuthorization()',
      ],
      syntax: `app.UseAuthentication();   // who are you? builds HttpContext.User
app.UseAuthorization();    // are you allowed? checks [Authorize]

[Authorize]                       // any logged-in user
[Authorize(Roles = "Admin")]      // only Admin role
[AllowAnonymous]                  // skip the check (login/register)`,
    },
    {
      heading: 'What is ASP.NET Core Identity?',
      content:
        'ASP.NET Core Identity is Microsoft\'s membership system. It stores users, hashed passwords, roles, claims, external logins and tokens in a database (normally through EF Core). It gives you ready-made services: UserManager<TUser> (create, find, update users, check passwords, add roles), SignInManager<TUser> (sign in/out, lockout, two-factor) and RoleManager<TRole> (create roles). You never write password hashing code yourself – Identity uses PBKDF2 with HMAC-SHA512, a random salt and 100,000 iterations (in .NET 8+).',
      points: [
        'Packages: Microsoft.AspNetCore.Identity.EntityFrameworkCore, Microsoft.EntityFrameworkCore.SqlServer, Microsoft.EntityFrameworkCore.Tools',
        'IdentityUser: Id, UserName, Email, PasswordHash, SecurityStamp, PhoneNumber, LockoutEnd, AccessFailedCount …',
        'Extend it: class AppUser : IdentityUser { public string FullName { get; set; } }',
        'Tables created by migration: AspNetUsers, AspNetRoles, AspNetUserRoles, AspNetUserClaims, AspNetRoleClaims, AspNetUserLogins, AspNetUserTokens',
      ],
      tip: 'Identity is a library, not a UI. For MVC/Razor you can add the default UI pages; for a React + Web API app you write your own Register/Login endpoints (today) and return JWT tokens (Day 111).',
    },
    {
      heading: 'Registering Identity in Program.cs',
      content:
        'Three steps: (1) create AppDbContext : IdentityDbContext<AppUser>, (2) register it with AddDbContext and a SQL Server connection string, (3) call AddIdentity<AppUser, IdentityRole>() (or AddIdentityCore for APIs) followed by AddEntityFrameworkStores<AppDbContext>() and AddDefaultTokenProviders(). Options let you control password strength, lockout and unique e-mails.',
      syntax: `builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.User.RequireUniqueEmail = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();`,
    },
    {
      heading: 'User Registration flow',
      content:
        'The client posts a RegisterDto (FullName, Email, Password, ConfirmPassword). The API validates the DTO with data annotations, creates an AppUser and calls userManager.CreateAsync(user, password). Identity validates the password against the options, hashes it, stores the user and returns IdentityResult. If Succeeded is false, return 400 with result.Errors (e.g. "PasswordRequiresDigit", "DuplicateEmail"). Optionally add a default role with AddToRoleAsync(user, "User") and send an e-mail confirmation token from GenerateEmailConfirmationTokenAsync.',
      points: [
        'Never store or log the plain password',
        'Return 201 Created / 200 OK on success, 400 Bad Request with readable errors on failure',
        'Check duplicate e-mail with FindByEmailAsync or RequireUniqueEmail = true',
      ],
    },
    {
      heading: 'Login flow',
      content:
        'The client posts LoginDto (Email, Password). The API finds the user with FindByEmailAsync, then calls signInManager.CheckPasswordSignInAsync(user, password, lockoutOnFailure: true). This verifies the hash, counts failed attempts and locks the account after too many failures. On success a cookie-based app calls PasswordSignInAsync (sets the .AspNetCore.Identity.Application cookie); an API app creates a JWT token (Day 111). On failure return 401 with a generic message "Invalid email or password" – never tell an attacker which part was wrong.',
      points: [
        'result.Succeeded, result.IsLockedOut, result.RequiresTwoFactor, result.IsNotAllowed (e.g. e-mail not confirmed)',
        'Logout for cookies: await signInManager.SignOutAsync()',
        'Get current user in a controller: User.Identity!.Name, User.FindFirstValue(ClaimTypes.NameIdentifier) or await userManager.GetUserAsync(User)',
      ],
    },
    {
      heading: 'Quick options: Individual Accounts template and MapIdentityApi',
      content:
        'Visual Studio can generate everything: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Authentication type: Individual Accounts. You get ApplicationDbContext, the default Identity UI (Register, Login, Manage pages under /Identity/Account/...) and a first migration. For Web API projects, .NET 8+ offers AddIdentityApiEndpoints<IdentityUser>() + app.MapIdentityApi<IdentityUser>(), which adds /register, /login, /refresh, /confirmEmail, /forgotPassword, /manage/info endpoints that return bearer tokens. Great for prototypes; for full control (custom fields, roles in response, standard JWT) write your own AuthController.',
      tip: 'Use Right-click project > Add > New Scaffolded Item > Identity to override individual Identity UI pages in an MVC app.',
    },
  ],
  examples: [
    {
      title: 'Console simulation: authentication (401) vs authorization (403)',
      scenario:
        'Before writing ASP.NET code, understand the two checks with a tiny console program. A request first logs in (authentication) and then the role is checked (authorization). Plain-text passwords are used ONLY to keep the demo short – real apps store hashes (Day 111).',
      steps: [
        'In Visual Studio: File > New > Project > Console App (.NET 8 or .NET 10)',
        'Name it AuthVsAuthzDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
        'Put a breakpoint (F9) on the "if (user is null)" line and press F5, then F10 to step through each request',
      ],
      code: `using System;
using System.Collections.Generic;

var users = new List<AppUser>
{
    new AppUser("ravi@demo.com", "Ravi@123", "Admin"),
    new AppUser("sita@demo.com", "Sita@123", "User")
};

// AUTHENTICATION: who are you?
AppUser? Login(string email, string password)
{
    foreach (var u in users)
        if (u.Email == email && u.Password == password) return u;
    return null;
}

// AUTHORIZATION: what are you allowed to do?
bool CanAccess(AppUser user, string requiredRole) => user.Role == requiredRole;

string Request(string email, string password, string page, string requiredRole)
{
    var user = Login(email, password);
    if (user is null) return $"{page}: 401 Unauthorized (authentication failed)";
    if (!CanAccess(user, requiredRole)) return $"{page}: 403 Forbidden ({user.Email} is {user.Role})";
    return $"{page}: 200 OK (welcome {user.Email})";
}

Console.WriteLine(Request("ravi@demo.com", "Ravi@123", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "Sita@123", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "wrong", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "Sita@123", "/profile", "User"));

record AppUser(string Email, string Password, string Role);`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;

var users = new List<AppUser>
{
    new AppUser("ravi@demo.com", "Ravi@123", "Admin"),
    new AppUser("sita@demo.com", "Sita@123", "User")
};

// AUTHENTICATION: who are you?
AppUser? Login(string email, string password)
{
    foreach (var u in users)
        if (u.Email == email && u.Password == password) return u;
    return null;
}

// AUTHORIZATION: what are you allowed to do?
bool CanAccess(AppUser user, string requiredRole) => user.Role == requiredRole;

string Request(string email, string password, string page, string requiredRole)
{
    var user = Login(email, password);
    if (user is null) return $"{page}: 401 Unauthorized (authentication failed)";
    if (!CanAccess(user, requiredRole)) return $"{page}: 403 Forbidden ({user.Email} is {user.Role})";
    return $"{page}: 200 OK (welcome {user.Email})";
}

Console.WriteLine(Request("ravi@demo.com", "Ravi@123", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "Sita@123", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "wrong", "/admin/dashboard", "Admin"));
Console.WriteLine(Request("sita@demo.com", "Sita@123", "/profile", "User"));

record AppUser(string Email, string Password, string Role);
`,
        },
        stdin: '',
      },
      result: `/admin/dashboard: 200 OK (welcome ravi@demo.com)
/admin/dashboard: 403 Forbidden (sita@demo.com is User)
/admin/dashboard: 401 Unauthorized (authentication failed)
/profile: 200 OK (welcome sita@demo.com)`,
      explanation:
        'Ravi passes both checks. Sita is authenticated (correct password) but is not Admin, so she gets 403. With a wrong password the first check fails, so 401 is returned and the role is never checked. ASP.NET Core does exactly the same: the authentication middleware builds the user, the authorization middleware compares roles/policies.',
    },
    {
      title: 'ASP.NET Core Identity Web API: Register and Login with UserManager and SignInManager',
      scenario:
        'Create AuthDemoApi with a custom AppUser (FullName), store users in SQL Server via EF Core, and expose POST /api/auth/register, POST /api/auth/login, POST /api/auth/logout and GET /api/auth/me. This version uses the Identity cookie; Day 111 replaces it with JWT.',
      steps: [
        'File > New > Project > ASP.NET Core Web API, name AuthDemoApi, Framework .NET 8/10, Authentication type: None, check "Use controllers" and "Enable OpenAPI support"',
        'Tools > NuGet Package Manager > Package Manager Console and run: Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore ; Install-Package Microsoft.EntityFrameworkCore.SqlServer ; Install-Package Microsoft.EntityFrameworkCore.Tools (CLI: dotnet add package ...)',
        'Add folders Models, Data, Dtos, Controllers and create the files below',
        'Add the connection string in appsettings.json',
        'Run in Package Manager Console: Add-Migration InitIdentity then Update-Database (CLI: dotnet ef migrations add InitIdentity ; dotnet ef database update)',
        'Open SSMS > AuthDemoDb > Tables and see AspNetUsers, AspNetRoles, AspNetUserRoles …',
        'Press F5, open Swagger (/swagger) and test register, login, me, logout',
      ],
      code: `// ===== Models/AppUser.cs =====
using Microsoft.AspNetCore.Identity;
namespace AuthDemoApi.Models;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

// ===== Data/AppDbContext.cs =====
using AuthDemoApi.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
namespace AuthDemoApi.Data;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);              // REQUIRED: creates the AspNet* tables
        builder.Entity<AppUser>().Property(u => u.FullName).HasMaxLength(100);
    }
}

// ===== Dtos/AuthDtos.cs =====
using System.ComponentModel.DataAnnotations;
namespace AuthDemoApi.Dtos;

public class RegisterDto
{
    [Required, StringLength(100)] public string FullName { get; set; } = "";
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required, MinLength(8)] public string Password { get; set; } = "";
    [Compare(nameof(Password))] public string ConfirmPassword { get; set; } = "";
}

public class LoginDto
{
    [Required, EmailAddress] public string Email { get; set; } = "";
    [Required] public string Password { get; set; } = "";
}

// ===== Controllers/AuthController.cs =====
using AuthDemoApi.Dtos;
using AuthDemoApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
namespace AuthDemoApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly SignInManager<AppUser> _signInManager;

    public AuthController(UserManager<AppUser> userManager, SignInManager<AppUser> signInManager)
    {
        _userManager = userManager;
        _signInManager = signInManager;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new AppUser { FullName = dto.FullName, Email = dto.Email, UserName = dto.Email };
        IdentityResult result = await _userManager.CreateAsync(user, dto.Password);   // hashes + saves

        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => new { e.Code, e.Description }));

        return StatusCode(201, new { message = "User registered", user.Id, user.Email });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _userManager.FindByEmailAsync(dto.Email);
        if (user is null) return Unauthorized(new { message = "Invalid email or password" });

        var result = await _signInManager.PasswordSignInAsync(
            user, dto.Password, isPersistent: false, lockoutOnFailure: true);

        if (result.IsLockedOut) return StatusCode(423, new { message = "Account locked. Try after 10 minutes." });
        if (!result.Succeeded) return Unauthorized(new { message = "Invalid email or password" });

        return Ok(new { message = "Login successful", user.FullName, user.Email });
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout()
    {
        await _signInManager.SignOutAsync();
        return Ok(new { message = "Logged out" });
    }

    [HttpGet("me")]
    [Authorize]                                    // 401 if no valid cookie
    public async Task<IActionResult> Me()
    {
        var user = await _userManager.GetUserAsync(User);
        return Ok(new { user!.Id, user.FullName, user.Email });
    }
}

// ===== Program.cs =====
using AuthDemoApi.Data;
using AuthDemoApi.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentity<AppUser, IdentityRole>(options =>
{
    options.Password.RequiredLength = 8;
    options.Password.RequireDigit = true;
    options.Password.RequireUppercase = true;
    options.Password.RequireNonAlphanumeric = true;
    options.User.RequireUniqueEmail = true;
    options.Lockout.MaxFailedAccessAttempts = 5;
    options.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// APIs should return 401/403 instead of redirecting to /Account/Login
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Events.OnRedirectToLogin = ctx => { ctx.Response.StatusCode = 401; return Task.CompletedTask; };
    o.Events.OnRedirectToAccessDenied = ctx => { ctx.Response.StatusCode = 403; return Task.CompletedTask; };
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();    // 1. who are you?
app.UseAuthorization();     // 2. are you allowed?
app.MapControllers();
app.Run();

// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=AuthDemoDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}

// ===== Package Manager Console =====
// Add-Migration InitIdentity
// Update-Database

// ===== Swagger / Postman requests =====
// POST https://localhost:7001/api/auth/register
// { "fullName": "Ravi Kumar", "email": "ravi@demo.com", "password": "Ravi@1234", "confirmPassword": "Ravi@1234" }
//
// POST https://localhost:7001/api/auth/login
// { "email": "ravi@demo.com", "password": "Ravi@1234" }
//
// GET https://localhost:7001/api/auth/me     (same browser/Postman cookie jar)`,
      result: `POST /api/auth/register  -> 201 Created
{ "message": "User registered", "id": "3f6c1e0a-...", "email": "ravi@demo.com" }

POST /api/auth/register (password "ravi1234") -> 400 Bad Request
[ { "code": "PasswordRequiresNonAlphanumeric", "description": "Passwords must have at least one non alphanumeric character." },
  { "code": "PasswordRequiresUpper", "description": "Passwords must have at least one uppercase ('A'-'Z')." } ]

POST /api/auth/login -> 200 OK  (response header Set-Cookie: .AspNetCore.Identity.Application=CfDJ8...)
{ "message": "Login successful", "fullName": "Ravi Kumar", "email": "ravi@demo.com" }

GET /api/auth/me without cookie -> 401 Unauthorized
GET /api/auth/me after login    -> 200 OK { "id": "3f6c1e0a-...", "fullName": "Ravi Kumar", "email": "ravi@demo.com" }

SSMS: SELECT UserName, PasswordHash FROM AspNetUsers;
ravi@demo.com | AQAAAAIAAYagAAAAE...  (hash, never the plain password)`,
      explanation:
        'CreateAsync runs the password validators, hashes the password (PBKDF2) and inserts a row in AspNetUsers. PasswordSignInAsync verifies the hash, updates AccessFailedCount/LockoutEnd and writes an encrypted authentication cookie. The ConfigureApplicationCookie events turn the default redirect-to-login behaviour (meant for MVC) into proper 401/403 API responses. The GUID Id and the hash will be different on your machine.',
    },
    {
      title: 'Roles at registration and reading the current user',
      scenario:
        'Seed the roles "Admin" and "User" at startup, give every new user the "User" role, create one admin account, and show the logged-in user\'s roles. This prepares for role-based access (Day 112).',
      steps: [
        'Open the AuthDemoApi project from the previous example',
        'Add Data/IdentitySeeder.cs with the code below',
        'Call the seeder in Program.cs after var app = builder.Build();',
        'Update the Register action to call AddToRoleAsync and add the AdminOnly action',
        'Press F5; login as admin@demo.com / Admin@1234 and call GET /api/auth/admin-only, then try as a normal user',
      ],
      code: `// ===== Data/IdentitySeeder.cs =====
using AuthDemoApi.Models;
using Microsoft.AspNetCore.Identity;
namespace AuthDemoApi.Data;

public static class IdentitySeeder
{
    public static async Task SeedAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = scope.ServiceProvider.GetRequiredService<UserManager<AppUser>>();

        foreach (var role in new[] { "Admin", "User" })
            if (!await roleManager.RoleExistsAsync(role))
                await roleManager.CreateAsync(new IdentityRole(role));

        const string adminEmail = "admin@demo.com";
        if (await userManager.FindByEmailAsync(adminEmail) is null)
        {
            var admin = new AppUser { FullName = "Site Admin", Email = adminEmail, UserName = adminEmail, EmailConfirmed = true };
            await userManager.CreateAsync(admin, "Admin@1234");   // in real apps read from configuration / secrets
            await userManager.AddToRoleAsync(admin, "Admin");
        }
    }
}

// ===== Program.cs (after builder.Build()) =====
var app = builder.Build();
await IdentitySeeder.SeedAsync(app.Services);

// ===== AuthController.cs (changes) =====
[HttpPost("register")]
[AllowAnonymous]
public async Task<IActionResult> Register(RegisterDto dto)
{
    var user = new AppUser { FullName = dto.FullName, Email = dto.Email, UserName = dto.Email };
    var result = await _userManager.CreateAsync(user, dto.Password);
    if (!result.Succeeded)
        return BadRequest(result.Errors.Select(e => e.Description));

    await _userManager.AddToRoleAsync(user, "User");          // default role
    return StatusCode(201, new { message = "User registered", roles = new[] { "User" } });
}

[HttpGet("me")]
[Authorize]
public async Task<IActionResult> Me()
{
    var user = await _userManager.GetUserAsync(User);
    var roles = await _userManager.GetRolesAsync(user!);
    return Ok(new { user!.FullName, user.Email, roles });
}

[HttpGet("admin-only")]
[Authorize(Roles = "Admin")]
public IActionResult AdminOnly() => Ok(new { message = "Hello Admin " + User.Identity!.Name });`,
      result: `Login admin@demo.com -> GET /api/auth/me
200 OK { "fullName": "Site Admin", "email": "admin@demo.com", "roles": ["Admin"] }

GET /api/auth/admin-only as admin@demo.com -> 200 OK { "message": "Hello Admin admin@demo.com" }
GET /api/auth/admin-only as ravi@demo.com  -> 403 Forbidden
GET /api/auth/admin-only with no login     -> 401 Unauthorized`,
      explanation:
        'RoleManager creates rows in AspNetRoles; AddToRoleAsync inserts into AspNetUserRoles. When the user signs in, Identity adds role claims to the cookie, so [Authorize(Roles = "Admin")] can check them without another database hit. Notice the three outcomes: 200 (allowed), 403 (logged in but wrong role), 401 (not logged in).',
    },
    {
      title: 'Fastest setup: MapIdentityApi (.NET 8+) and the Individual Accounts template',
      scenario:
        'For prototypes you do not even need an AuthController. .NET 8 added ready-made Identity endpoints that issue bearer tokens. MVC apps can use the Individual Accounts template that scaffolds Register/Login pages.',
      steps: [
        'Create a new ASP.NET Core Web API project MinimalIdentityApi',
        'Install Microsoft.AspNetCore.Identity.EntityFrameworkCore and Microsoft.EntityFrameworkCore.SqlServer and Microsoft.EntityFrameworkCore.Tools',
        'Replace Program.cs with the code below and add the connection string',
        'Run Add-Migration Init and Update-Database',
        'Press F5; in Swagger call POST /register then POST /login, copy accessToken and call GET /weather with header Authorization: Bearer <token>',
        'For MVC: File > New > Project > ASP.NET Core Web App (Model-View-Controller) > Authentication type: Individual Accounts, then run Update-Database and click Register in the navbar',
      ],
      code: `// ===== Program.cs =====
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddAuthorization();
builder.Services.AddIdentityApiEndpoints<IdentityUser>()     // adds bearer-token + cookie schemes
                .AddEntityFrameworkStores<AppDb>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
app.UseSwagger();
app.UseSwaggerUI();

app.MapIdentityApi<IdentityUser>();      // /register /login /refresh /confirmEmail /manage/info ...

app.MapGet("/weather", (System.Security.Claims.ClaimsPrincipal user) =>
        $"Sunny for {user.Identity!.Name}")
   .RequireAuthorization();

app.Run();

class AppDb : IdentityDbContext<IdentityUser>
{
    public AppDb(DbContextOptions<AppDb> options) : base(options) { }
}

// ===== Requests =====
// POST /register   { "email": "neha@demo.com", "password": "Neha@1234" }      -> 200 OK (empty body)
// POST /login      { "email": "neha@demo.com", "password": "Neha@1234" }
// GET  /weather    Authorization: Bearer CfDJ8...`,
      result: `POST /login -> 200 OK
{
  "tokenType": "Bearer",
  "accessToken": "CfDJ8N...(long protected token)",
  "expiresIn": 3600,
  "refreshToken": "CfDJ8N...(long protected token)"
}

GET /weather with Bearer token -> 200 OK  "Sunny for neha@demo.com"
GET /weather without token     -> 401 Unauthorized`,
      explanation:
        'MapIdentityApi gives register/login/refresh in one line. Its tokens are ASP.NET Core Data-Protection tokens, not standard JWTs, so other services cannot validate them. That is why most React + .NET projects write their own AuthController that issues JWTs – which is exactly what Day 111 does.',
    },
    {
      title: 'React login form that calls the Identity API',
      scenario:
        'A React page posts the email/password to /api/auth/login and shows success or the error message. The playground fakes the API so you can try it without a backend: valid login is ravi@demo.com / Ravi@1234.',
      steps: [
        'In your Vite React project (Day 98) create src/pages/Login.jsx with the code shown',
        'Install axios: npm install axios',
        'In the API Program.cs allow the React origin with CORS (AllowCredentials for cookies) – full CORS setup on Day 113',
        'Run the API (F5) and the React app (npm run dev) and log in',
        'Try the playground below to see the UI behaviour',
      ],
      code: `// src/pages/Login.jsx (real project)
import { useState } from "react";
import axios from "axios";

const api = axios.create({ baseURL: "https://localhost:7001/api", withCredentials: true });

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      setMessage("Welcome " + res.data.fullName);
    } catch (err) {
      setMessage(err.response?.data?.message ?? "Server not reachable");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Email" value={form.email}
             onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password}
             onChange={e => setForm({ ...form, password: e.target.value })} />
      <button>Login</button>
      <p>{message}</p>
    </form>
  );
}`,
      playground: {
        jsx: `function fakeLogin(email, password) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email === "ravi@demo.com" && password === "Ravi@1234")
        resolve({ data: { fullName: "Ravi Kumar" } });
      else
        reject({ response: { status: 401, data: { message: "Invalid email or password" } } });
    }, 400);
  });
}

function App() {
  const [form, setForm] = React.useState({ email: "", password: "" });
  const [message, setMessage] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fakeLogin(form.email, form.password);
      setMessage("200 OK - Welcome " + res.data.fullName);
    } catch (err) {
      setMessage(err.response.status + " - " + err.response.data.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 320, margin: 20, fontFamily: "sans-serif", display: "grid", gap: 8 }}>
      <h3>Login</h3>
      <input placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
      <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} />
      <button disabled={loading}>{loading ? "Signing in..." : "Login"}</button>
      <p>{message}</p>
    </form>
  );
}`,
      },
      result: `Email ravi@demo.com + Password Ravi@1234 -> "200 OK - Welcome Ravi Kumar"
Any other combination                      -> "401 - Invalid email or password"`,
      explanation:
        'The React side never decides who is authenticated – it only sends credentials and shows what the server says. withCredentials: true makes the browser send and store the Identity cookie for cross-origin calls. With JWT (Day 111/107) you will store the token and send it in the Authorization header instead.',
    },
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: 'Authentication verifies identity (who you are) using credentials like a password or token. Authorization decides what an authenticated user may do, using roles, claims or policies. Authentication always comes first.', level: 'Easy' },
    { q: 'When does ASP.NET Core return 401 and when 403?', a: '401 Unauthorized when the request is not authenticated (missing/invalid cookie or token). 403 Forbidden when the user is authenticated but fails the authorization requirement, e.g. a User calling an [Authorize(Roles="Admin")] endpoint.', level: 'Easy' },
    { q: 'What is ASP.NET Core Identity and what does it provide?', a: 'A membership framework that manages users, password hashes, roles, claims, tokens, lockout, two-factor and external logins. It provides UserManager, SignInManager and RoleManager and stores data via EF Core in the AspNet* tables.', level: 'Easy' },
    { q: 'Why must base.OnModelCreating(builder) be called in an IdentityDbContext?', a: 'Because IdentityDbContext.OnModelCreating configures all Identity tables, keys and relationships. Without it migrations fail with errors like "The entity type IdentityUserLogin<string> requires a primary key".', level: 'Medium' },
    { q: 'What is the difference between PasswordSignInAsync and CheckPasswordSignInAsync?', a: 'Both verify the password and handle lockout. PasswordSignInAsync also signs the user in by issuing the authentication cookie. CheckPasswordSignInAsync only checks and returns SignInResult – ideal for JWT APIs where you create the token yourself.', level: 'Medium' },
    { q: 'What is the order of UseAuthentication and UseAuthorization and why?', a: 'UseAuthentication must come first (after UseRouting/UseCors in older templates) because it builds HttpContext.User. UseAuthorization reads that user; if reversed, every user looks anonymous and protected endpoints return 401.', level: 'Medium' },
    { q: 'Which tables does Identity create?', a: 'AspNetUsers, AspNetRoles, AspNetUserRoles, AspNetUserClaims, AspNetRoleClaims, AspNetUserLogins, AspNetUserTokens (plus __EFMigrationsHistory).', level: 'Easy' },
    { q: 'How do you add custom fields such as FullName to the user?', a: 'Create class AppUser : IdentityUser with the new properties, use IdentityDbContext<AppUser>, AddIdentity<AppUser, IdentityRole>(), then add a migration – EF adds the columns to AspNetUsers.', level: 'Easy' },
    { q: 'Why should a login API return a generic "Invalid email or password" message?', a: 'To avoid user enumeration. If the API says "email not found" an attacker learns which e-mails are registered and can target them.', level: 'Medium' },
    { q: 'What is the SecurityStamp column used for?', a: 'It is a random value that changes when security-related data changes (password, roles, logins). Cookies store it and are re-validated periodically; if it changed, existing sessions are invalidated (for example after a password reset).', level: 'Hard' },
    { q: 'How does lockout work in Identity?', a: 'With lockoutOnFailure: true each failed attempt increments AccessFailedCount. When it reaches Lockout.MaxFailedAccessAttempts, LockoutEnd is set to now + DefaultLockoutTimeSpan and sign-in returns IsLockedOut until then.', level: 'Medium' },
    { q: 'What does MapIdentityApi give you and what is its limitation?', a: 'Ready-made /register, /login, /refresh, /confirmEmail, /forgotPassword, /resetPassword and /manage endpoints. Its bearer tokens are opaque Data Protection tokens, not JWTs, so they cannot be validated by other services and are less customisable.', level: 'Hard' },
  ],
  practice: [
    { task: 'Add a PhoneNumber and City field to registration. Store City on AppUser and return it from /api/auth/me.', hint: 'Add City property to AppUser, add to RegisterDto, set it before CreateAsync, then Add-Migration AddCity and Update-Database.', solution: 'public class AppUser : IdentityUser { public string FullName {get;set;} = ""; public string City {get;set;} = ""; } // RegisterDto: [Required] public string City {get;set;} = ""; // Register: new AppUser { ..., City = dto.City, PhoneNumber = dto.PhoneNumber }; // Me: return Ok(new { user.FullName, user.Email, user.City, user.PhoneNumber });' },
    { task: 'Change password rules: minimum 10 characters, no special character required, at least 3 unique characters. Test with Swagger.', hint: 'Use options.Password.RequiredLength, RequireNonAlphanumeric and RequiredUniqueChars inside AddIdentity.', solution: 'options.Password.RequiredLength = 10; options.Password.RequireNonAlphanumeric = false; options.Password.RequiredUniqueChars = 3; // "aaaaaaaaaa" fails (unique chars + digit/upper), "Student2025" passes.' },
    { task: 'Create POST /api/auth/change-password for a logged-in user (CurrentPassword, NewPassword).', hint: 'userManager.ChangePasswordAsync(user, current, newPwd) returns IdentityResult.', solution: '[Authorize][HttpPost("change-password")] public async Task<IActionResult> ChangePassword(ChangePasswordDto dto){ var user = await _userManager.GetUserAsync(User); var r = await _userManager.ChangePasswordAsync(user!, dto.CurrentPassword, dto.NewPassword); return r.Succeeded ? Ok(new { message = "Password changed" }) : BadRequest(r.Errors.Select(e => e.Description)); }' },
    { task: 'Modify the console demo to lock a user after 3 wrong passwords and print "423 Locked".', hint: 'Keep a Dictionary<string,int> failedCounts; increment on failure, check before validating.', solution: 'var failed = new Dictionary<string,int>(); // in Request: if (failed.GetValueOrDefault(email) >= 3) return $"{page}: 423 Locked"; var user = Login(email,password); if (user is null) { failed[email] = failed.GetValueOrDefault(email) + 1; return "401"; } failed[email] = 0;' },
    { task: 'Create an MVC app with Individual Accounts, register a user, and find the user and password hash in SSMS.', hint: 'Authentication type: Individual Accounts; Update-Database; SELECT in SSMS.', solution: 'File > New > Project > ASP.NET Core Web App (MVC) > Individual Accounts > Create. Package Manager Console: Update-Database. F5 > Register. SSMS: SELECT Id, UserName, Email, EmailConfirmed, PasswordHash FROM dbo.AspNetUsers; – the hash starts with AQAAAA (version marker of Identity V3 hashes).' },
  ],
  quiz: [
    { question: 'A logged-in user with role "User" calls an endpoint marked [Authorize(Roles = "Admin")]. What status code is returned?', options: ['401 Unauthorized', '403 Forbidden', '404 Not Found', '400 Bad Request'], answer: 1, explanation: 'The user is authenticated, so it is not 401. The role check fails, so authorization returns 403 Forbidden.' },
    { question: 'Which Identity service creates a new user and hashes the password?', options: ['SignInManager<T>.SignInAsync', 'RoleManager<T>.CreateAsync', 'UserManager<T>.CreateAsync', 'DbContext.Users.Add'], answer: 2, explanation: 'UserManager.CreateAsync(user, password) validates and hashes the password and saves the user through the store.' },
    { question: 'Which base class should your DbContext inherit to store Identity tables?', options: ['IdentityDbContext<AppUser>', 'DbContext only', 'IdentityUser', 'UserStore<AppUser>'], answer: 0, explanation: 'IdentityDbContext<TUser> contains DbSets and model configuration for all AspNet* tables.' },
    { question: 'What happens if app.UseAuthorization() is placed BEFORE app.UseAuthentication()?', options: ['Nothing changes', 'Compile error', 'Users appear anonymous to authorization, so protected endpoints fail with 401', 'All endpoints become public'], answer: 2, explanation: 'Authorization runs before HttpContext.User is filled, so the user is treated as anonymous.' },
    { question: 'Which call verifies a password WITHOUT issuing a cookie (useful for JWT APIs)?', options: ['PasswordSignInAsync', 'SignOutAsync', 'RefreshSignInAsync', 'CheckPasswordSignInAsync'], answer: 3, explanation: 'CheckPasswordSignInAsync checks the password and lockout but does not sign the user in.' },
  ],
};
