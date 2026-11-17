const sqliCode = `using System;

string[] inputs = { "ravi", "' OR 1=1 --", "admin' --" };

Console.WriteLine("=== UNSAFE: string concatenation ===");
foreach (var name in inputs)
{
    string sql = "SELECT * FROM Users WHERE UserName = '" + name + "' AND PasswordHash = 'x'";
    Console.WriteLine(sql);
}

Console.WriteLine();
Console.WriteLine("=== SAFE: parameterized command ===");
const string safeSql = "SELECT * FROM Users WHERE UserName = @name AND PasswordHash = @hash";
Console.WriteLine(safeSql);
foreach (var name in inputs)
    Console.WriteLine($"@name value: [{name}]");

Console.WriteLine();
Console.WriteLine("=== SAFE: allow-list for ORDER BY ===");
foreach (var s in new[] { "marks", "name", "Name; DROP TABLE Students" })
    Console.WriteLine($"{s} -> ORDER BY {SafeSort(s)}");

// Column names cannot be parameters, so map user input to KNOWN columns only
string SafeSort(string column) => column.ToLower() switch
{
    "name"  => "Name",
    "marks" => "Marks DESC",
    _       => "Id"
};
`;

const sqliTsql = `CREATE DATABASE SecurityDemo;
GO
USE SecurityDemo;
GO
CREATE TABLE Users (
    UserId INT IDENTITY(1,1) PRIMARY KEY,
    UserName NVARCHAR(50) NOT NULL UNIQUE,
    PasswordHash NVARCHAR(100) NOT NULL,
    Role NVARCHAR(20) NOT NULL DEFAULT 'User'
);
INSERT INTO Users (UserName, PasswordHash, Role) VALUES
    ('admin', 'HASH_A1', 'Admin'),
    ('ravi',  'HASH_R7', 'User'),
    ('sita',  'HASH_S3', 'User');
GO
-- 1) Normal login: user typed ravi / HASH_R7
SELECT UserId, UserName, Role FROM Users WHERE UserName = 'ravi' AND PasswordHash = 'HASH_R7';
-- 2) Wrong password: no rows, login fails
SELECT UserId, UserName, Role FROM Users WHERE UserName = 'ravi' AND PasswordHash = 'guess';
-- 3) INJECTION: user typed  ' OR '1'='1  in BOTH boxes and the app concatenated it
SELECT UserId, UserName, Role FROM Users WHERE UserName = '' OR '1'='1' AND PasswordHash = '' OR '1'='1';
-- 4) The same text treated as DATA (what a parameter does): quotes are doubled
SELECT UserId, UserName, Role FROM Users WHERE UserName = ''' OR ''1''=''1' AND PasswordHash = ''' OR ''1''=''1';`;

const xssCode = `using System;
using System.Net;

string[] comments =
{
    "Great course!",
    "<script>alert(1)</script>",
    """<img src=x onerror="steal()">""",
    "Tom & Jerry"
};

foreach (var c in comments)
{
    Console.WriteLine($"Raw    : {c}");
    Console.WriteLine($"Encoded: {WebUtility.HtmlEncode(c)}");
}

Console.WriteLine($"URL encoded: {WebUtility.UrlEncode("C# & .NET = fun")}");
`;

const corsCsrfCode = `using System;
using System.Linq;

// ---------- CORS: the browser asks "may this ORIGIN call the API?" ----------
var allowedOrigins = new[] { "http://localhost:5173", "https://school.example.com" };
var allowedMethods = new[] { "GET", "POST", "PUT", "DELETE" };

void Cors(string origin, string method)
{
    bool ok = allowedOrigins.Contains(origin) && allowedMethods.Contains(method);
    string verdict = ok
        ? $"allowed (Access-Control-Allow-Origin: {origin})"
        : "blocked by the browser (no CORS headers)";
    Console.WriteLine($"{method,-6} from {origin,-28} -> {verdict}");
}

Cors("http://localhost:5173", "GET");
Cors("https://school.example.com", "DELETE");
Cors("https://evil.example.net", "POST");
Cors("http://localhost:3000", "GET");
Cors("http://localhost:5173", "TRACE");

// ---------- CSRF: a forged form from another site carries our cookie but not our token ----------
Console.WriteLine();
string sessionToken = "Xy7Kp2";     // real apps: random per session/user (IAntiforgery)

string Post(string from, string? formToken) =>
    $"{from,-24} -> {(formToken == sessionToken ? "200 OK, transfer done" : "400 Bad Request (antiforgery token invalid)")}";

Console.WriteLine(Post("our form (token Xy7Kp2)", "Xy7Kp2"));
Console.WriteLine(Post("evil site (no token)", null));
Console.WriteLine(Post("evil site (guessed)", "abc123"));
`;

const secureApiCode = `// ===== appsettings.json =====
/*
{
  "ConnectionStrings": { "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=SecureDb;Trusted_Connection=True;TrustServerCertificate=True" },
  "Cors": { "AllowedOrigins": [ "http://localhost:5173", "https://school.example.com" ] },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "localhost;school.example.com"
}
*/

// ===== Program.cs =====
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddControllers();
builder.Services.AddProblemDetails();

// 1) CORS – only our React app may call the API from a browser
string[] origins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? [];
builder.Services.AddCors(o => o.AddPolicy("ReactApp", p => p
    .WithOrigins(origins)                         // never AllowAnyOrigin() together with credentials
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .WithHeaders("Content-Type", "Authorization")
    .AllowCredentials()));                        // needed only if you send cookies

// 2) HSTS – browsers remember "always use HTTPS" for this host
builder.Services.AddHsts(o => { o.MaxAge = TimeSpan.FromDays(365); o.IncludeSubDomains = true; });

// 3) Rate limiting – slow down brute force on /login (built into .NET 7+)
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("login", l =>
    {
        l.PermitLimit = 5;                          // 5 attempts
        l.Window = TimeSpan.FromMinutes(1);         // per minute
        l.QueueLimit = 0;
    });
});

// 4) Antiforgery – for cookie-authenticated forms (MVC / Razor / cookie APIs)
builder.Services.AddAntiforgery(o => o.HeaderName = "X-XSRF-TOKEN");

// 5) Limit request body size (e.g. 10 MB) to stop huge uploads
builder.WebHost.ConfigureKestrel(k => k.Limits.MaxRequestBodySize = 10 * 1024 * 1024);

var app = builder.Build();

// 6) Global exception handler – never send stack traces to clients in production
app.UseExceptionHandler(errorApp => errorApp.Run(async ctx =>
{
    var feature = ctx.Features.Get<IExceptionHandlerFeature>();
    var logger = ctx.RequestServices.GetRequiredService<ILogger<Program>>();
    logger.LogError(feature?.Error, "Unhandled exception on {Path}", ctx.Request.Path);
    ctx.Response.StatusCode = 500;
    await ctx.Response.WriteAsJsonAsync(new { title = "Something went wrong", traceId = ctx.TraceIdentifier });
}));

if (!app.Environment.IsDevelopment())
    app.UseHsts();

app.UseHttpsRedirection();                      // http -> https (307/308)

// 7) Security headers
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";
    h["X-Frame-Options"] = "DENY";                                   // clickjacking
    h["Referrer-Policy"] = "no-referrer";
    h["Content-Security-Policy"] = "default-src 'self'; script-src 'self'; object-src 'none'";
    await next();
});

app.UseCors("ReactApp");                         // before auth and endpoints
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

// ===== Controllers/StudentsController.cs – SQL injection safe queries =====
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;
    public StudentsController(AppDbContext db, IConfiguration config) { _db = db; _config = config; }

    // SAFE: LINQ is always parameterized
    [HttpGet("search")]
    public async Task<IActionResult> Search(string name) =>
        Ok(await _db.Students.Where(s => s.Name.Contains(name)).ToListAsync());

    // SAFE: FromSql / FromSqlInterpolated turn {name} into a SqlParameter
    [HttpGet("search-sql")]
    public async Task<IActionResult> SearchSql(string name) =>
        Ok(await _db.Students.FromSql($"SELECT * FROM Students WHERE Name = {name}").ToListAsync());

    // DANGEROUS – never do this:
    // _db.Students.FromSqlRaw("SELECT * FROM Students WHERE Name = '" + name + "'")

    // SAFE: ADO.NET with SqlParameter
    [HttpGet("count")]
    public async Task<IActionResult> Count(string city)
    {
        await using var con = new SqlConnection(_config.GetConnectionString("DefaultConnection"));
        await using var cmd = new SqlCommand("SELECT COUNT(*) FROM Students WHERE City = @city", con);
        cmd.Parameters.Add("@city", System.Data.SqlDbType.NVarChar, 50).Value = city;
        await con.OpenAsync();
        return Ok((int)(await cmd.ExecuteScalarAsync())!);
    }

    // SAFE sorting with an allow-list
    [HttpGet]
    public async Task<IActionResult> List(string sortBy = "id")
    {
        var q = _db.Students.AsNoTracking();
        q = sortBy.ToLower() switch
        {
            "name"  => q.OrderBy(s => s.Name),
            "marks" => q.OrderByDescending(s => s.Marks),
            _       => q.OrderBy(s => s.Id)
        };
        return Ok(await q.ToListAsync());
    }
}

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("login")]
    [EnableRateLimiting("login")]                 // 6th attempt in a minute -> 429
    public IActionResult Login(LoginDto dto) => Ok();
}

// ===== React (Vite) – call the API over HTTPS =====
// const api = axios.create({ baseURL: 'https://localhost:7001/api' });
// React escapes {comment} automatically; avoid dangerouslySetInnerHTML with user data.`;

export default {
  id: 'day-113-api-security-cors-https-sqli-xss-csrf',
  title: 'API Security: CORS, HTTPS, SQL Injection Prevention, XSS and CSRF Basics',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 113,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Secure a .NET Web API and its React client against the most common web attacks. Understand and configure CORS, force HTTPS with redirection and HSTS, prevent SQL injection with parameters and LINQ, stop XSS with output encoding and Content-Security-Policy, defend against CSRF with antiforgery tokens and SameSite cookies, and add rate limiting, security headers and safe error handling.',
  objectives: [
    'Explain the Same-Origin Policy and configure a named CORS policy for a React app',
    'Enforce HTTPS with UseHttpsRedirection, HSTS and dev certificates',
    'Demonstrate SQL injection and prevent it with parameters, LINQ, FromSql and allow-lists',
    'Explain stored/reflected XSS and prevent it with encoding, React escaping and CSP',
    'Explain CSRF, antiforgery tokens and SameSite cookies, plus rate limiting and security headers (OWASP Top 10 overview)',
  ],
  theory: [
    {
      heading: 'Security mindset and the OWASP Top 10',
      content:
        'OWASP (Open Worldwide Application Security Project) publishes the Top 10 web risks: Broken Access Control, Cryptographic Failures, Injection (SQL, command), Insecure Design, Security Misconfiguration, Vulnerable Components, Identification and Authentication Failures, Software and Data Integrity Failures, Logging and Monitoring Failures and Server-Side Request Forgery. Golden rules: never trust input from the client, validate on the server, give the least privilege needed, keep secrets out of source code, keep packages updated, and log security events without logging passwords or tokens.',
      points: [
        'Defense in depth: several layers (HTTPS + auth + validation + parameters + encoding + headers)',
        'Secrets: User Secrets in development, environment variables / Azure Key Vault in production',
        'Keep NuGet and npm packages updated: dotnet list package --vulnerable, npm audit',
      ],
    },
    {
      heading: 'CORS – Cross-Origin Resource Sharing',
      content:
        'An origin is scheme + host + port. http://localhost:5173 (React/Vite) and https://localhost:7001 (API) are DIFFERENT origins. Browsers apply the Same-Origin Policy: JavaScript may send a cross-origin request, but it cannot read the response unless the server returns Access-Control-Allow-Origin. For non-simple requests (PUT/DELETE, JSON content type, Authorization header) the browser first sends a preflight OPTIONS request. CORS is enforced by browsers only – Postman and curl ignore it – so CORS is NOT an authentication mechanism.',
      syntax: `builder.Services.AddCors(o => o.AddPolicy("ReactApp", p => p
    .WithOrigins("http://localhost:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));
...
app.UseCors("ReactApp");    // after UseRouting (if used), before UseAuthentication/UseAuthorization`,
      points: [
        'Error in browser console: "blocked by CORS policy: No \'Access-Control-Allow-Origin\' header" -> fix on the SERVER',
        'AllowAnyOrigin() cannot be combined with AllowCredentials()',
        'Per endpoint: [EnableCors("ReactApp")] or [DisableCors]',
      ],
    },
    {
      heading: 'HTTPS, TLS and HSTS',
      content:
        'HTTPS encrypts traffic with TLS so tokens, passwords and cookies cannot be read or changed on the way (man-in-the-middle). In ASP.NET Core, UseHttpsRedirection redirects http to https, and UseHsts sends the Strict-Transport-Security header so the browser refuses plain HTTP for that site in future. In development run "dotnet dev-certs https --trust" once. In production the certificate comes from IIS, Azure App Service or a reverse proxy (Let\'s Encrypt etc.).',
      points: [
        'Never send JWTs or passwords over plain HTTP',
        'Do not use HSTS in development (it is cached by the browser)',
        'Cookies: Secure = true so they are only sent over HTTPS',
      ],
    },
    {
      heading: 'SQL Injection',
      content:
        'SQL injection happens when user input is concatenated into a SQL string, so the input becomes part of the COMMAND. Input like  \' OR 1=1 --  turns "WHERE UserName = \'...\'" into a condition that is always true and comments out the password check. Prevention: always use parameters (SqlParameter, Dapper parameters), EF Core LINQ, or FromSql/FromSqlInterpolated (which converts {value} into a parameter). Never use FromSqlRaw/ExecuteSqlRaw with concatenated input. Identifiers (column or table names for sorting) cannot be parameters – map them through an allow-list. Also give the app\'s SQL login the least privileges (no db_owner).',
      syntax: `// SAFE
var s = await db.Students.FromSql($"SELECT * FROM Students WHERE Name = {name}").ToListAsync();
cmd.Parameters.Add("@city", SqlDbType.NVarChar, 50).Value = city;

// UNSAFE
db.Students.FromSqlRaw("SELECT * FROM Students WHERE Name = '" + name + "'");`,
    },
    {
      heading: 'XSS – Cross-Site Scripting',
      content:
        'XSS happens when attacker-supplied text is placed into a page as HTML, so the browser runs the attacker\'s script – which can steal tokens from localStorage or act as the user. Stored XSS: script saved in the database (e.g. a comment) and shown to every visitor. Reflected XSS: script in a URL parameter echoed back. DOM XSS: client JavaScript writes untrusted data with innerHTML. Prevention: encode output (Razor @value and React {value} encode automatically), avoid Html.Raw / dangerouslySetInnerHTML / innerHTML with user data, sanitize rich HTML with a library (HtmlSanitizer), add a Content-Security-Policy header, and keep tokens in HttpOnly cookies.',
      points: [
        '<  becomes &lt;   >  becomes &gt;   "  becomes &quot;   &  becomes &amp;',
        'WebUtility.HtmlEncode / HtmlEncoder.Default.Encode in C#',
        'API returns JSON with Content-Type application/json and X-Content-Type-Options: nosniff',
      ],
    },
    {
      heading: 'CSRF – Cross-Site Request Forgery',
      content:
        'CSRF tricks a logged-in user\'s browser into sending a request to your site from another site. It works because the browser automatically attaches COOKIES. Example: evil.com has a hidden form that posts to bank.com/transfer. Defences: antiforgery tokens (a secret value in the form/header that evil.com cannot read), SameSite=Lax/Strict cookies, and checking Origin. ASP.NET Core MVC/Razor Pages add and validate the token automatically for forms ([ValidateAntiForgeryToken], AutoValidateAntiforgeryToken). APIs that use a JWT in the Authorization header are not vulnerable to classic CSRF because browsers do not attach that header automatically – but if you store the JWT or refresh token in a cookie, you need antiforgery/SameSite again.',
      syntax: `// MVC: <form asp-action="Transfer"> automatically includes __RequestVerificationToken
[HttpPost, ValidateAntiForgeryToken]
public IActionResult Transfer(TransferVm vm) ...

// Cookie options
new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict };`,
    },
    {
      heading: 'More API hardening',
      content:
        'Rate limiting (AddRateLimiter + [EnableRateLimiting]) slows brute-force and abuse and returns 429. Security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Content-Security-Policy) reduce browser attacks. A global exception handler returns a generic ProblemDetails message instead of stack traces. Validate input with data annotations / FluentValidation, limit upload size and file types, use DTOs to avoid over-posting (mass assignment, e.g. a client sending "isAdmin": true), and log security events (failed logins, 403s).',
    },
  ],
  examples: [
    {
      title: 'Seeing SQL injection in the SSMS Lab',
      scenario:
        'Create a Users table and run the exact queries an unsafe login page would build. When the attacker types \' OR \'1\'=\'1 into both boxes the WHERE clause becomes always true and every user – including admin – is returned. When the same text is treated as data (quotes doubled, which is what a parameter does) no row matches.',
      steps: [
        'Open SSMS (or the in-app SSMS Lab) and connect to (localdb)\\MSSQLLocalDB',
        'Click New Query (Ctrl+N), paste the script and press F5 (Execute)',
        'Compare the result grids of query 3 and query 4',
      ],
      code: sqliTsql,
      tsql: sqliTsql,
      result: `-- 1) Normal login
UserId | UserName | Role
2      | ravi     | User
1 row(s) returned

-- 2) Wrong password
0 row(s) returned

-- 3) INJECTION
UserId | UserName | Role
1      | admin    | Admin
2      | ravi     | User
3      | sita     | User
3 row(s) returned

-- 4) Same text as data
0 row(s) returned`,
      explanation:
        'In query 3, AND binds tighter than OR, so the condition is  UserName = \'\'  OR  (\'1\'=\'1\' AND PasswordHash = \'\')  OR  \'1\'=\'1\'  – the last part is always true, so all rows come back and the app logs the attacker in as the first user (admin). In query 4 every quote typed by the attacker is doubled (\'\'), so the whole text is one string literal and simply does not match any user name. Parameters achieve the same thing automatically and more safely.',
    },
    {
      title: 'Unsafe vs safe SQL in C# (console)',
      scenario:
        'Print the SQL text that an unsafe, string-concatenated query would send for three inputs, then show the parameterized version (the command text never changes, only the parameter value) and an allow-list for ORDER BY.',
      steps: [
        'File > New > Project > Console App, name it SqlInjectionDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Notice that in the safe version the SQL text is printed only once – inputs never change it',
      ],
      code: sqliCode,
      csharp: { files: { 'Program.cs': sqliCode }, stdin: '' },
      result: `=== UNSAFE: string concatenation ===
SELECT * FROM Users WHERE UserName = 'ravi' AND PasswordHash = 'x'
SELECT * FROM Users WHERE UserName = '' OR 1=1 --' AND PasswordHash = 'x'
SELECT * FROM Users WHERE UserName = 'admin' --' AND PasswordHash = 'x'

=== SAFE: parameterized command ===
SELECT * FROM Users WHERE UserName = @name AND PasswordHash = @hash
@name value: [ravi]
@name value: [' OR 1=1 --]
@name value: [admin' --]

=== SAFE: allow-list for ORDER BY ===
marks -> ORDER BY Marks DESC
name -> ORDER BY Name
Name; DROP TABLE Students -> ORDER BY Id`,
      explanation:
        'In the unsafe lines the input closes the string with \' and adds its own SQL; -- turns the password check into a comment. Line 2 returns every user and line 3 logs in as admin without a password. With SqlCommand parameters the SQL text is fixed and the value travels separately to SQL Server, so it can never become code. For ORDER BY we cannot use a parameter, so the switch expression accepts only known columns and falls back to Id.',
    },
    {
      title: 'Preventing XSS with HTML encoding',
      scenario:
        'Students post comments that are shown on a web page. Encode each comment before writing it into HTML so that <script> becomes harmless text. Also URL-encode a value for a query string.',
      steps: [
        'File > New > Project > Console App, name it XssEncodingDemo',
        'Replace Program.cs with the code below (System.Net.WebUtility is built in) and press Ctrl+F5',
        'Paste an Encoded line into an .html file and open it in a browser: the text is displayed, nothing runs',
      ],
      code: xssCode,
      csharp: { files: { 'Program.cs': xssCode }, stdin: '' },
      result: `Raw    : Great course!
Encoded: Great course!
Raw    : <script>alert(1)</script>
Encoded: &lt;script&gt;alert(1)&lt;/script&gt;
Raw    : <img src=x onerror="steal()">
Encoded: &lt;img src=x onerror=&quot;steal()&quot;&gt;
Raw    : Tom & Jerry
Encoded: Tom &amp; Jerry
URL encoded: C%23+%26+.NET+%3D+fun`,
      explanation:
        'HtmlEncode converts the characters that have meaning in HTML (<, >, ", &, \') into entities, so the browser shows them instead of interpreting them. Razor (@comment) and React ({comment}) do this automatically – the danger starts when you bypass it with Html.Raw, dangerouslySetInnerHTML or element.innerHTML. UrlEncode makes values safe inside URLs: space becomes +, # becomes %23, & becomes %26 and = becomes %3D.',
    },
    {
      title: 'How CORS and CSRF checks decide (simulation)',
      scenario:
        'Simulate the browser\'s CORS decision for different origins and methods, then simulate an antiforgery token check for a money-transfer form posted from our site and from an evil site.',
      steps: [
        'File > New > Project > Console App, name it CorsCsrfDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Add "http://localhost:3000" to allowedOrigins and run again',
      ],
      code: corsCsrfCode,
      csharp: { files: { 'Program.cs': corsCsrfCode }, stdin: '' },
      result: `GET    from http://localhost:5173        -> allowed (Access-Control-Allow-Origin: http://localhost:5173)
DELETE from https://school.example.com   -> allowed (Access-Control-Allow-Origin: https://school.example.com)
POST   from https://evil.example.net     -> blocked by the browser (no CORS headers)
GET    from http://localhost:3000        -> blocked by the browser (no CORS headers)
TRACE  from http://localhost:5173        -> blocked by the browser (no CORS headers)

our form (token Xy7Kp2)  -> 200 OK, transfer done
evil site (no token)     -> 400 Bad Request (antiforgery token invalid)
evil site (guessed)      -> 400 Bad Request (antiforgery token invalid)`,
      explanation:
        'The origin must match exactly – http://localhost:3000 is a different port, so it is a different origin. The TRACE method is not in the allowed list. Remember the server still RECEIVES a blocked simple request; CORS only stops the browser\'s JavaScript from reading the answer, so the API must still authorize every call. For CSRF the evil site can make the browser send our cookie, but it cannot read our page to learn the token, so the token check fails with 400 (ASP.NET Core antiforgery returns 400 Bad Request).',
    },
    {
      title: 'A hardened ASP.NET Core Web API',
      scenario:
        'Put the defences into a real API: CORS policy from configuration, HTTPS redirection + HSTS, rate limiting on login, antiforgery setup, body-size limit, global exception handler, security headers, and SQL-injection-safe queries with LINQ, FromSql, SqlParameter and an allow-list.',
      steps: [
        'Create File > New > Project > ASP.NET Core Web API named SecureApi (or open your Student API)',
        'Install-Package Microsoft.EntityFrameworkCore.SqlServer (Microsoft.Data.SqlClient comes with it)',
        'Replace Program.cs and appsettings.json, add the controllers',
        'Run "dotnet dev-certs https --trust" once, then press F5',
        'In Postman call POST /api/auth/login 6 times within a minute – the 6th returns 429',
        'Call GET /api/students/search?name=\' OR 1=1 -- and check that it returns an empty list, not all students',
        'Open the React app from another port not in the list and see the CORS error in the browser console (F12)',
      ],
      code: secureApiCode,
      result: `GET https://localhost:7001/api/students/search?name=' OR 1=1 --   -> 200 []
GET http://localhost:5001/api/students                            -> 307 redirect to https://localhost:7001/api/students
Response headers: X-Content-Type-Options: nosniff, X-Frame-Options: DENY, Content-Security-Policy: default-src 'self'; ...
OPTIONS /api/students (Origin: http://localhost:5173)             -> 204 + Access-Control-Allow-Origin: http://localhost:5173
POST /api/auth/login (6th time in 1 minute)                        -> 429 Too Many Requests
Unhandled exception                                                -> 500 { "title": "Something went wrong", "traceId": "0HN..." }`,
      explanation:
        'Order matters: exception handler first, then HSTS/HTTPS redirection, headers, CORS, rate limiter, authentication, authorization, endpoints. The CORS origins come from configuration so production can use a different list. FromSql with an interpolated string produces a parameter (@p0), so the injection text is just a name that matches nothing. The allow-list switch prevents injection through sortBy. The global handler logs the real error but returns only a trace id to the client.',
    },
  ],
  interview: [
    { q: 'What is CORS and who enforces it?', a: 'Cross-Origin Resource Sharing lets a server tell browsers which other origins may read its responses (Access-Control-Allow-* headers). It is enforced by the browser only; tools like Postman ignore it.', level: 'Easy' },
    { q: 'What is a preflight request?', a: 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request (PUT/DELETE, JSON content type, custom headers like Authorization) to ask whether the method and headers are allowed.', level: 'Medium' },
    { q: 'Why can AllowAnyOrigin not be used with AllowCredentials?', a: 'Allowing any website to make credentialed (cookie) requests and read the responses would defeat the Same-Origin Policy, so the CORS spec forbids Access-Control-Allow-Origin: * with credentials. ASP.NET Core throws an error for this combination.', level: 'Medium' },
    { q: 'What does HSTS do?', a: 'The Strict-Transport-Security header tells the browser to use only HTTPS for the domain for max-age seconds, preventing SSL-stripping downgrade attacks.', level: 'Medium' },
    { q: 'How do you prevent SQL injection in .NET?', a: 'Use parameterized queries (SqlParameter, Dapper), EF Core LINQ or FromSql/FromSqlInterpolated; never concatenate input into SQL; use allow-lists for identifiers; run with a least-privilege database login.', level: 'Easy' },
    { q: 'Is FromSqlRaw always unsafe?', a: 'No. FromSqlRaw("... WHERE Id = {0}", id) with placeholders creates parameters and is safe. It is unsafe only when you concatenate or interpolate user input into the string yourself.', level: 'Hard' },
    { q: 'What is the difference between stored and reflected XSS?', a: 'Stored XSS saves the malicious script in the database and serves it to every viewer. Reflected XSS puts it in a request (URL/form) and the server echoes it immediately in the response to that victim.', level: 'Medium' },
    { q: 'How does React protect against XSS and where can it fail?', a: 'React escapes values rendered with {value}. It fails with dangerouslySetInnerHTML, href="javascript:..." URLs built from user input, and direct DOM innerHTML.', level: 'Medium' },
    { q: 'What is CSRF and why are JWT-in-header APIs less exposed?', a: 'CSRF forces a victim\'s browser to send an authenticated request using automatically attached cookies. A JWT in the Authorization header is not attached automatically, so a foreign site cannot send it. If tokens live in cookies, CSRF protection is needed again.', level: 'Hard' },
    { q: 'What does SameSite=Strict do?', a: 'The cookie is not sent on any cross-site request, including links from other sites. Lax allows top-level GET navigations; None sends it always (requires Secure).', level: 'Medium' },
    { q: 'Output question: WebUtility.HtmlEncode("a<b & c") returns?', a: '"a&lt;b &amp; c"', level: 'Easy' },
    { q: 'What is over-posting (mass assignment) and how do you prevent it?', a: 'A client sends extra fields (e.g. "role":"Admin") that bind directly to an entity. Prevent it by binding to DTOs that contain only allowed fields and mapping them to entities.', level: 'Medium' },
    { q: 'Why should production APIs not return exception details?', a: 'Stack traces reveal file paths, framework versions, SQL and logic that help attackers. Log details server-side and return a generic ProblemDetails with a trace id.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a console method BuildSafeSearch(string? name, string? sort) that returns a parameterized SQL string and a Dictionary of parameters. Use an allow-list for sort (name, marks, city).',
      hint: 'Build "SELECT * FROM Students WHERE Name LIKE @name ORDER BY X"; parameter value = "%" + name + "%".',
      solution: `(string Sql, Dictionary<string, object> Params) BuildSafeSearch(string? name, string? sort)
{
    string orderBy = (sort ?? "").ToLower() switch
    {
        "name" => "Name", "marks" => "Marks DESC", "city" => "City", _ => "Id"
    };
    var p = new Dictionary<string, object> { ["@name"] = "%" + (name ?? "") + "%" };
    return ($"SELECT * FROM Students WHERE Name LIKE @name ORDER BY {orderBy}", p);
}
var (sql, prms) = BuildSafeSearch("' OR 1=1 --", "marks; DROP TABLE x");
Console.WriteLine(sql);              // ... WHERE Name LIKE @name ORDER BY Id
Console.WriteLine(prms["@name"]);    // %' OR 1=1 --%`,
    },
    {
      task: 'Add a "SecurityHeaders" custom middleware class (not an inline app.Use) and register it with app.UseMiddleware<SecurityHeadersMiddleware>().',
      hint: 'Constructor takes RequestDelegate next; InvokeAsync(HttpContext ctx) sets headers then awaits next(ctx).',
      solution: `public class SecurityHeadersMiddleware
{
    private readonly RequestDelegate _next;
    public SecurityHeadersMiddleware(RequestDelegate next) => _next = next;
    public async Task InvokeAsync(HttpContext ctx)
    {
        ctx.Response.Headers["X-Content-Type-Options"] = "nosniff";
        ctx.Response.Headers["X-Frame-Options"] = "DENY";
        ctx.Response.Headers["Referrer-Policy"] = "no-referrer";
        await _next(ctx);
    }
}
// Program.cs: app.UseMiddleware<SecurityHeadersMiddleware>();`,
    },
    {
      task: 'Configure two CORS policies: "Dev" allowing http://localhost:5173 and "Prod" allowing https://school.example.com, and apply the correct one based on the environment.',
      hint: 'app.UseCors(app.Environment.IsDevelopment() ? "Dev" : "Prod");',
      solution: `builder.Services.AddCors(o =>
{
    o.AddPolicy("Dev",  p => p.WithOrigins("http://localhost:5173").AllowAnyHeader().AllowAnyMethod());
    o.AddPolicy("Prod", p => p.WithOrigins("https://school.example.com").AllowAnyHeader().AllowAnyMethod());
});
var app = builder.Build();
app.UseCors(app.Environment.IsDevelopment() ? "Dev" : "Prod");`,
    },
    {
      task: 'Write a console "comment board" that stores comments in a List and prints them as an HTML <ul>, encoding each comment. Test with a script tag.',
      hint: 'string.Join with $"<li>{WebUtility.HtmlEncode(c)}</li>".',
      solution: `using System.Net;
var comments = new List<string> { "Nice!", "<script>alert('x')</script>" };
Console.WriteLine("<ul>");
foreach (var c in comments) Console.WriteLine($"  <li>{WebUtility.HtmlEncode(c)}</li>");
Console.WriteLine("</ul>");
// <li>&lt;script&gt;alert(&#39;x&#39;)&lt;/script&gt;</li>`,
    },
    {
      task: 'Protect an MVC "ChangeEmail" form against CSRF and test that posting from a plain HTML file on your desktop fails.',
      hint: 'Use the form tag helper (adds the token) and [ValidateAntiForgeryToken] on the POST action.',
      solution: `[HttpPost]
[ValidateAntiForgeryToken]
public IActionResult ChangeEmail(string newEmail) { /* ... */ return RedirectToAction("Profile"); }

<!-- View -->
<form asp-action="ChangeEmail" method="post">
    <input name="newEmail" />
    <button>Save</button>
</form>
<!-- A copy of this form without __RequestVerificationToken -> 400 Bad Request -->`,
    },
  ],
  quiz: [
    {
      question: 'React on http://localhost:5173 calls an API on https://localhost:7001 and gets "blocked by CORS policy". Where is the fix?',
      options: ['In the React code by adding mode: "no-cors"', 'In the API: add a CORS policy that allows http://localhost:5173', 'Disable HTTPS', 'Use a different browser'],
      answer: 1,
      explanation: 'The server must send Access-Control-Allow-Origin for that origin; no-cors only gives an unreadable response.',
    },
    {
      question: 'Which EF Core call is vulnerable to SQL injection?',
      options: ['db.Students.Where(s => s.Name == name)', 'db.Students.FromSql($"... WHERE Name = {name}")', 'db.Students.FromSqlRaw("... WHERE Name = \'" + name + "\'")', 'db.Students.Find(id)'],
      answer: 2,
      explanation: 'Concatenating input into FromSqlRaw makes the input part of the SQL command.',
    },
    {
      question: 'Which header tells browsers to always use HTTPS for your site?',
      options: ['Content-Security-Policy', 'X-Frame-Options', 'Access-Control-Allow-Origin', 'Strict-Transport-Security'],
      answer: 3,
      explanation: 'Strict-Transport-Security (HSTS) is added by app.UseHsts().',
    },
    {
      question: 'What does an antiforgery token protect against?',
      options: ['CSRF', 'SQL injection', 'Brute-force password guessing', 'DDoS attacks'],
      answer: 0,
      explanation: 'The attacker\'s site cannot read the secret token, so forged cross-site requests fail validation.',
    },
    {
      question: 'What status code does the ASP.NET Core rate limiter usually return when configured as in the example?',
      options: ['401', '403', '429', '503'],
      answer: 2,
      explanation: 'RejectionStatusCode was set to 429 Too Many Requests (the default is 503).',
    },
  ],
};
