export default {
  id: 'day-094-jwt-authentication',
  title: 'JWT Authentication, Access Tokens, Refresh Token Concepts',
  module: 'ASP.NET Core Web API',
  day: 94,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: `Secure the API with JSON Web Tokens. Understand token-based authentication, the three parts of a JWT (header, payload with claims, signature) and how the signature prevents tampering. Build a secure login API: register with hashed passwords, login returning an access token and a refresh token, protect endpoints with [Authorize], refresh and revoke tokens, and test everything with Swagger's Authorize button and Postman Bearer tokens.`,
  objectives: [
    'Explain session/cookie authentication vs token-based authentication',
    'Describe the structure of a JWT and why it is signed but NOT encrypted',
    'Configure AddAuthentication().AddJwtBearer() with TokenValidationParameters',
    'Generate access tokens with claims and build login, refresh and revoke endpoints',
    'Send the token as "Authorization: Bearer <token>" from Swagger and Postman',
  ],
  theory: [
    {
      heading: 'Token-based authentication',
      content: `Authentication answers "who are you?". In a classic MVC site the server stores a session and gives the browser a cookie. A Web API used by React, mobile apps and other servers is usually stateless: after login the server gives the client a signed token, and the client sends it on every request in the Authorization header. The server only verifies the signature - it does not need to remember the user between requests. Analogy: a cinema ticket. The counter checks your payment once and gives you a stamped ticket; the gatekeeper only checks the stamp and the show time.`,
      syntax: `1. POST /api/auth/login { username, password }     -> 200 { accessToken, refreshToken }
2. GET  /api/students   Authorization: Bearer eyJhbGciOi...   -> 200
3. Token expired                                       -> 401
4. POST /api/auth/refresh { refreshToken }              -> 200 { new accessToken, new refreshToken }`,
    },
    {
      heading: 'Structure of a JWT',
      content: `A JWT (pronounced "jot", RFC 7519) is three Base64Url strings joined by dots: header.payload.signature. The header says which algorithm signed it (HS256). The payload contains claims - statements about the user: sub (subject/user id), name, email, role, exp (expiry as Unix seconds), iat (issued at), iss (issuer), aud (audience), jti (unique token id). The signature is HMACSHA256(header + "." + payload, secretKey). If anyone changes even one character of the payload, the signature no longer matches.`,
      points: [
        'Base64Url is ENCODING, not encryption - anyone can read the payload at jwt.io; never put passwords or secrets in claims',
        'HS256 uses one shared secret (at least 32 bytes / 256 bits); RS256/ES256 use a private key to sign and a public key to verify',
        'Keep the signing key out of source control: user secrets in development, environment variables / Azure Key Vault in production',
      ],
    },
    {
      heading: 'Configuring JWT Bearer authentication',
      content: `Install Microsoft.AspNetCore.Authentication.JwtBearer. Register the scheme with AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(...) and set TokenValidationParameters. In the pipeline call UseAuthentication() BEFORE UseAuthorization(). Then [Authorize] on a controller or action requires a valid token; [AllowAnonymous] opens a single action again.`,
      syntax: `builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,           ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,         ValidAudience = jwt["Audience"],
            ValidateIssuerSigningKey = true, IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
            ValidateLifetime = true,         ClockSkew = TimeSpan.FromSeconds(30)
        };
    });

app.UseAuthentication();
app.UseAuthorization();`,
      tip: 'ClockSkew defaults to 5 minutes, so a token "expires" 5 minutes late. Reduce it when you test short expiry times.',
    },
    {
      heading: 'Access tokens and refresh tokens',
      content: `An access token is short-lived (5-60 minutes) because it cannot easily be cancelled once issued - whoever holds it is that user until it expires. A refresh token is a long random string (not a JWT) stored in the database with an expiry (for example 7 days). When the access token expires, the client sends the refresh token to /api/auth/refresh and receives a new pair. Rotation: each refresh token can be used only once; the old one is marked revoked and replaced. Logout revokes the refresh token.`,
      points: [
        'Access token: JWT, short life, sent on every request, usually kept in memory in the React app',
        'Refresh token: random 64 bytes, long life, stored hashed or plain in DB, sent only to /refresh; for browsers an HttpOnly Secure cookie is safest',
        'Reuse of an already-rotated refresh token is a sign of theft - revoke all tokens of that user',
      ],
    },
    {
      heading: 'Password storage',
      content: `Never store plain passwords. Use a slow, salted hash. ASP.NET Core ships PasswordHasher<TUser> (PBKDF2 with HMAC-SHA512, 100,000 iterations, random salt in .NET 8+) in Microsoft.AspNetCore.Identity - you can use it even without the full Identity system. VerifyHashedPassword returns Success, Failed or SuccessRehashNeeded. On Day 95 and Day 110 the full ASP.NET Core Identity handles users for you.`,
    },
    {
      heading: '401 vs 403 and the WWW-Authenticate header',
      content: `When an [Authorize] endpoint receives no token or an invalid/expired token, the JWT handler returns 401 Unauthorized with a header such as WWW-Authenticate: Bearer error="invalid_token", error_description="The token expired at '11/17/2026 10:15:00'". When the token is valid but the user lacks a required role or policy, the response is 403 Forbidden (Day 95).`,
    },
  ],
  examples: [
    {
      title: 'Console: build and verify a JWT by hand (HS256)',
      scenario: 'Understand exactly what header, payload and signature are, and why a tampered token is rejected.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it JwtByHand > .NET 10 > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: paste the printed token into https://jwt.io to see the decoded parts',
      ],
      code: `using System.Globalization;
using System.Security.Cryptography;
using System.Text;

string secret = "this-is-a-demo-secret-key-of-32-bytes!!";
string headerJson  = @"{""alg"":""HS256"",""typ"":""JWT""}";
string payloadJson = @"{""sub"":""1"",""name"":""asha"",""role"":""User"",""exp"":1795000000}";

string header    = Base64Url(Encoding.UTF8.GetBytes(headerJson));
string payload   = Base64Url(Encoding.UTF8.GetBytes(payloadJson));
string signature = Sign(header + "." + payload, secret);
string token     = header + "." + payload + "." + signature;

Console.WriteLine("Header   : " + header);
Console.WriteLine("Payload  : " + payload);
Console.WriteLine("Signature: " + signature);
Console.WriteLine("Token parts: " + token.Split('.').Length);
Console.WriteLine("Valid original? " + Verify(token, secret));
Console.WriteLine("Valid with wrong key? " + Verify(token, "another-secret-key-another-secret-key!"));

// An attacker changes the role in the payload but cannot recompute the signature
string fakePayload = Base64Url(Encoding.UTF8.GetBytes(payloadJson.Replace("User", "Admin")));
string tampered = header + "." + fakePayload + "." + signature;
Console.WriteLine("Valid tampered? " + Verify(tampered, secret));

// Anyone can DECODE the payload - it is not encrypted
Console.WriteLine("Decoded payload: " + Encoding.UTF8.GetString(FromBase64Url(payload)));
DateTime exp = DateTimeOffset.FromUnixTimeSeconds(1795000000).UtcDateTime;
Console.WriteLine("Expires (UTC): " + exp.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));

static string Base64Url(byte[] bytes) =>
    Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

static byte[] FromBase64Url(string s)
{
    s = s.Replace('-', '+').Replace('_', '/');
    switch (s.Length % 4)
    {
        case 2: s += "=="; break;
        case 3: s += "="; break;
    }
    return Convert.FromBase64String(s);
}

static string Sign(string data, string key)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
    return Base64Url(hmac.ComputeHash(Encoding.UTF8.GetBytes(data)));
}

static bool Verify(string jwt, string key)
{
    string[] parts = jwt.Split('.');
    if (parts.Length != 3) return false;
    string expected = Sign(parts[0] + "." + parts[1], key);
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(parts[2]));
}`,
      csharp: {
        files: {
          'Program.cs': `using System.Globalization;
using System.Security.Cryptography;
using System.Text;

string secret = "this-is-a-demo-secret-key-of-32-bytes!!";
string headerJson  = @"{""alg"":""HS256"",""typ"":""JWT""}";
string payloadJson = @"{""sub"":""1"",""name"":""asha"",""role"":""User"",""exp"":1795000000}";

string header    = Base64Url(Encoding.UTF8.GetBytes(headerJson));
string payload   = Base64Url(Encoding.UTF8.GetBytes(payloadJson));
string signature = Sign(header + "." + payload, secret);
string token     = header + "." + payload + "." + signature;

Console.WriteLine("Header   : " + header);
Console.WriteLine("Payload  : " + payload);
Console.WriteLine("Signature: " + signature);
Console.WriteLine("Token parts: " + token.Split('.').Length);
Console.WriteLine("Valid original? " + Verify(token, secret));
Console.WriteLine("Valid with wrong key? " + Verify(token, "another-secret-key-another-secret-key!"));

// An attacker changes the role in the payload but cannot recompute the signature
string fakePayload = Base64Url(Encoding.UTF8.GetBytes(payloadJson.Replace("User", "Admin")));
string tampered = header + "." + fakePayload + "." + signature;
Console.WriteLine("Valid tampered? " + Verify(tampered, secret));

// Anyone can DECODE the payload - it is not encrypted
Console.WriteLine("Decoded payload: " + Encoding.UTF8.GetString(FromBase64Url(payload)));
DateTime exp = DateTimeOffset.FromUnixTimeSeconds(1795000000).UtcDateTime;
Console.WriteLine("Expires (UTC): " + exp.ToString("yyyy-MM-dd HH:mm:ss", CultureInfo.InvariantCulture));

static string Base64Url(byte[] bytes) =>
    Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

static byte[] FromBase64Url(string s)
{
    s = s.Replace('-', '+').Replace('_', '/');
    switch (s.Length % 4)
    {
        case 2: s += "=="; break;
        case 3: s += "="; break;
    }
    return Convert.FromBase64String(s);
}

static string Sign(string data, string key)
{
    using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
    return Base64Url(hmac.ComputeHash(Encoding.UTF8.GetBytes(data)));
}

static bool Verify(string jwt, string key)
{
    string[] parts = jwt.Split('.');
    if (parts.Length != 3) return false;
    string expected = Sign(parts[0] + "." + parts[1], key);
    return CryptographicOperations.FixedTimeEquals(
        Encoding.UTF8.GetBytes(expected), Encoding.UTF8.GetBytes(parts[2]));
}`,
        },
        stdin: '',
      },
      result: `Header   : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Payload  : eyJzdWIiOiIxIiwibmFtZSI6ImFzaGEiLCJyb2xlIjoiVXNlciIsImV4cCI6MTc5NTAwMDAwMH0
Signature: Tn-Sf7zx4ekVjN319pU94iac2D9Dhyl8c03mHFJ4p_M
Token parts: 3
Valid original? True
Valid with wrong key? False
Valid tampered? False
Decoded payload: {"sub":"1","name":"asha","role":"User","exp":1795000000}
Expires (UTC): 2026-11-18 11:06:40`,
      explanation: `Every JWT that uses {"alg":"HS256","typ":"JWT"} starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 - the header is always the same. Changing "User" to "Admin" produces a different payload string, so HMAC over header.payload gives a different signature and verification fails. Without the secret key the attacker cannot produce a valid signature. FixedTimeEquals avoids timing attacks. The real JwtBearer handler does the same checks plus exp, iss and aud validation.`,
    },
    {
      title: 'AuthApi: users, refresh tokens, settings and Program.cs',
      scenario: 'Set up the data model and JWT configuration for a secure login API.',
      steps: [
        'Open StudentApi (or create AuthApi: File > New > Project > ASP.NET Core Web API)',
        'Package Manager Console: Install-Package Microsoft.AspNetCore.Authentication.JwtBearer',
        'Install-Package System.IdentityModel.Tokens.Jwt',
        'Add Models/User.cs, Models/RefreshToken.cs and the DbSets to AppDbContext',
        'Add the "Jwt" section to appsettings.json; store the real key with right-click project > Manage User Secrets',
        'Replace Program.cs',
        'PM> Add-Migration AddUsersAndRefreshTokens  then  PM> Update-Database',
      ],
      code: `// Models/User.cs
namespace StudentApi.Models;
public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Role { get; set; } = "User";
    public List<RefreshToken> RefreshTokens { get; set; } = new();
}

// Models/RefreshToken.cs
namespace StudentApi.Models;
public class RefreshToken
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? RevokedAt { get; set; }
    public string? ReplacedByToken { get; set; }
    public int UserId { get; set; }
    public User? User { get; set; }
    public bool IsActive => RevokedAt == null && DateTime.UtcNow < ExpiresAt;
}

// Data/AppDbContext.cs (additions)
public DbSet<User> Users => Set<User>();
public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
// in OnModelCreating:
modelBuilder.Entity<User>().HasIndex(u => u.Username).IsUnique();
modelBuilder.Entity<RefreshToken>().HasIndex(r => r.Token).IsUnique();
modelBuilder.Entity<RefreshToken>().Ignore(r => r.IsActive);

// appsettings.json
{
  "ConnectionStrings": { "DefaultConnection": "Server=localhost;Database=StudentApiDB;Trusted_Connection=True;TrustServerCertificate=True" },
  "Jwt": {
    "Key": "DEV-ONLY-change-me-this-key-must-be-at-least-32-bytes-long",
    "Issuer": "https://localhost:7001",
    "Audience": "student-api-clients",
    "AccessTokenMinutes": 15,
    "RefreshTokenDays": 7
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}

// Program.cs
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using StudentApi.Data;
using StudentApi.Services;

var builder = WebApplication.CreateBuilder(args);
var jwt = builder.Configuration.GetSection("Jwt");

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));
builder.Services.AddScoped<ITokenService, TokenService>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwt["Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30),
            NameClaimType = ClaimTypes.Name,
            RoleClaimType = ClaimTypes.Role
        };
    });
builder.Services.AddAuthorization();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Student API", Version = "v1" });
    // Adds the green "Authorize" button (Swashbuckle 6.x - 9.x syntax)
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste ONLY the access token (without the word Bearer)"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseHttpsRedirection();
app.UseAuthentication();     // 1. who are you? (reads the Bearer token)
app.UseAuthorization();      // 2. are you allowed?
app.MapControllers();
app.Run();`,
      result: `PM> Add-Migration AddUsersAndRefreshTokens
Build succeeded.
PM> Update-Database
Applying migration '20261117110000_AddUsersAndRefreshTokens'.
Done.

SSMS: StudentApiDB now has dbo.Users and dbo.RefreshTokens (FK RefreshTokens.UserId -> Users.Id).
Swagger UI shows an "Authorize" button with a padlock icon.`,
      explanation: `The key in appsettings.json is only a development placeholder. Right-click the project > Manage User Secrets and put { "Jwt": { "Key": "..." } } there; in production use an environment variable Jwt__Key (double underscore) or Key Vault. HS256 requires a key of at least 256 bits (32 bytes) - a shorter key throws IDX10720 when creating the token. Order matters: UseAuthentication must come before UseAuthorization.`,
    },
    {
      title: 'TokenService and AuthController: register, login, refresh, revoke, me',
      scenario: 'Build the secure login API that issues and rotates tokens.',
      steps: [
        'Add Services/TokenService.cs and Dtos/AuthDtos.cs',
        'Right-click Controllers > Add > Controller > API Controller - Empty > AuthController.cs',
        'Add [Authorize] on top of StudentsController (class level)',
        'Press Ctrl+F5 and follow the Swagger test flow in the next example',
      ],
      code: `// Dtos/AuthDtos.cs
using System.ComponentModel.DataAnnotations;
namespace StudentApi.Dtos;
public record RegisterDto([Required, StringLength(30, MinimumLength = 3)] string Username,
                          [Required, EmailAddress] string Email,
                          [Required, MinLength(8)] string Password);
public record LoginDto([Required] string Username, [Required] string Password);
public record RefreshDto([Required] string RefreshToken);
public record AuthResponse(string AccessToken, DateTime ExpiresAt, string RefreshToken, string Username, string Role);

// Services/TokenService.cs
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using StudentApi.Models;
namespace StudentApi.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(User user);
    RefreshToken CreateRefreshToken();
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _config;
    public TokenService(IConfiguration config) => _config = config;

    public (string Token, DateTime ExpiresAt) CreateAccessToken(User user)
    {
        var jwt = _config.GetSection("Jwt");
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt["Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(jwt.GetValue<int>("AccessTokenMinutes"));

        var token = new JwtSecurityToken(
            issuer: jwt["Issuer"],
            audience: jwt["Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(token), expires);
    }

    public RefreshToken CreateRefreshToken() => new()
    {
        Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
        ExpiresAt = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenDays")),
        CreatedAt = DateTime.UtcNow
    };
}

// Controllers/AuthController.cs
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StudentApi.Data;
using StudentApi.Dtos;
using StudentApi.Models;
using StudentApi.Services;
namespace StudentApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokens;
    private readonly PasswordHasher<User> _hasher = new();

    public AuthController(AppDbContext db, ITokenService tokens)
    {
        _db = db;
        _tokens = tokens;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
            return Conflict(new { message = "Username already taken" });

        var user = new User { Username = dto.Username, Email = dto.Email, Role = "User" };
        user.PasswordHash = _hasher.HashPassword(user, dto.Password);
        _db.Users.Add(user);
        await _db.SaveChangesAsync();
        return StatusCode(201, new { user.Id, user.Username, user.Role });
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == dto.Username);
        if (user is null ||
            _hasher.VerifyHashedPassword(user, user.PasswordHash, dto.Password) == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Invalid username or password" });   // same message for both cases

        return await IssueTokensAsync(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshDto dto)
    {
        var stored = await _db.RefreshTokens.Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);

        if (stored is null) return Unauthorized(new { message = "Invalid refresh token" });

        if (stored.RevokedAt != null)
        {
            // reuse of a rotated token = possible theft: revoke every active token of this user
            var all = await _db.RefreshTokens.Where(r => r.UserId == stored.UserId && r.RevokedAt == null).ToListAsync();
            all.ForEach(r => r.RevokedAt = DateTime.UtcNow);
            await _db.SaveChangesAsync();
            return Unauthorized(new { message = "Refresh token reuse detected" });
        }
        if (!stored.IsActive) return Unauthorized(new { message = "Refresh token expired" });

        var response = await IssueTokensAsync(stored.User!, replacing: stored);
        return response;
    }

    [Authorize]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke(RefreshDto dto)
    {
        var stored = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == dto.RefreshToken);
        if (stored is null || !stored.IsActive) return NotFound();
        stored.RevokedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new
    {
        id = User.FindFirstValue(ClaimTypes.NameIdentifier),
        username = User.Identity!.Name,
        email = User.FindFirstValue(ClaimTypes.Email),
        role = User.FindFirstValue(ClaimTypes.Role)
    });

    private async Task<AuthResponse> IssueTokensAsync(User user, RefreshToken? replacing = null)
    {
        var (access, expiresAt) = _tokens.CreateAccessToken(user);
        var refresh = _tokens.CreateRefreshToken();
        refresh.UserId = user.Id;
        _db.RefreshTokens.Add(refresh);

        if (replacing != null)
        {
            replacing.RevokedAt = DateTime.UtcNow;
            replacing.ReplacedByToken = refresh.Token;
        }
        await _db.SaveChangesAsync();
        return new AuthResponse(access, expiresAt, refresh.Token, user.Username, user.Role);
    }
}

// Controllers/StudentsController.cs
[Authorize]                         // every action now needs a valid access token
[ApiController]
[Route("api/[controller]")]
public class StudentsController : ControllerBase { /* ... */ }`,
      result: `Build succeeded. Swagger lists:
POST /api/Auth/register, POST /api/Auth/login, POST /api/Auth/refresh,
POST /api/Auth/revoke (padlock), GET /api/Auth/me (padlock), and all /api/Students endpoints (padlock).`,
      explanation: `The "sub" claim is mapped to ClaimTypes.NameIdentifier by the JWT handler's inbound claim mapping, which is why Me() reads NameIdentifier. Login returns the same 401 message for unknown user and wrong password, so attackers cannot discover which usernames exist. The refresh endpoint rotates tokens: the old token is revoked and points to its replacement; using it again revokes all tokens of the user.`,
    },
    {
      title: 'Test the secure login flow in Swagger and Postman',
      scenario: 'Register, login, call a protected endpoint, refresh and logout.',
      steps: [
        'Ctrl+F5; in Swagger execute POST /api/Auth/register with body 1',
        'Execute POST /api/Auth/login with body 2 and copy "accessToken" from the response',
        'Execute GET /api/Students WITHOUT authorizing -> 401',
        'Click Authorize (top right) > paste the access token > Authorize > Close; execute GET /api/Students again -> 200',
        'Postman: GET {{baseUrl}}/api/auth/me > Authorization tab > Type: Bearer Token > Token: {{accessToken}} > Send',
        'Postman login request Post-response script: pm.environment.set("accessToken", pm.response.json().accessToken); pm.environment.set("refreshToken", pm.response.json().refreshToken);',
        'POST /api/Auth/refresh with body 3, then send the SAME body again',
      ],
      code: `### Body 1 - POST /api/auth/register
{ "username": "asha", "email": "asha@mail.com", "password": "Asha@12345" }

### Body 2 - POST /api/auth/login
{ "username": "asha", "password": "Asha@12345" }

### Protected request
GET https://localhost:7001/api/students
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwianRpIjoi...

### Body 3 - POST /api/auth/refresh
{ "refreshToken": "q8V2...the value from login...==" }`,
      result: `register -> 201 { "id": 1, "username": "asha", "role": "User" }

login -> 200
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwianRpIjoi...",
  "expiresAt": "2026-11-17T10:15:00Z",
  "refreshToken": "q8V2m3...==",
  "username": "asha",
  "role": "User"
}
login with wrong password -> 401 { "message": "Invalid username or password" }

GET /api/students without token -> 401, header: WWW-Authenticate: Bearer
GET /api/students with token    -> 200 [ ... ]
GET /api/auth/me with token     -> 200 { "id": "1", "username": "asha", "email": "asha@mail.com", "role": "User" }
After 15 minutes (+30 s skew)   -> 401, WWW-Authenticate: Bearer error="invalid_token", error_description="The token expired at '...'"

refresh (first time)  -> 200 { new accessToken, new refreshToken, ... }
refresh (same token again) -> 401 { "message": "Refresh token reuse detected" }`,
      explanation: `In Swagger paste only the token; Swagger adds "Bearer " itself because the scheme type is Http/bearer. In Postman the Bearer Token auth type also adds the prefix. Token strings and times are different on every run. If you get 401 with a valid-looking token, check: UseAuthentication before UseAuthorization, same Issuer/Audience/Key in settings and token, and the token not expired.`,
    },
  ],
  interview: [
    { q: 'What are the three parts of a JWT?', a: 'Header (algorithm and type), Payload (claims such as sub, name, role, exp, iss, aud) and Signature (HMAC or RSA/ECDSA signature over header.payload), each Base64Url-encoded and joined with dots.', level: 'Easy' },
    { q: 'Is the JWT payload encrypted?', a: 'No. A standard JWS token is only Base64Url-encoded and signed; anyone can decode and read it. The signature guarantees integrity, not confidentiality. Do not put secrets in it (JWE exists for encrypted tokens).', level: 'Easy' },
    { q: 'Why are access tokens short-lived?', a: 'A JWT is self-contained and valid until it expires; the server normally cannot revoke it. A short lifetime limits the damage if it is stolen. Refresh tokens provide a good user experience without long-lived access tokens.', level: 'Medium' },
    { q: 'What is a refresh token and how is it different from an access token?', a: 'A long-lived, random, opaque value stored server-side, used only at the refresh endpoint to obtain a new access token. Access tokens are short-lived JWTs sent on every API request. Refresh tokens can be revoked in the database.', level: 'Medium' },
    { q: 'What is refresh token rotation?', a: 'Every time a refresh token is used, it is revoked and a new one is issued. If an old (rotated) token is presented again, it indicates theft and all tokens of that user are revoked.', level: 'Hard' },
    { q: 'What does TokenValidationParameters validate?', a: 'Issuer, audience, signing key (signature), lifetime (exp/nbf) with ClockSkew, and optionally the algorithm, name/role claim types and more.', level: 'Medium' },
    { q: 'Why must UseAuthentication come before UseAuthorization?', a: 'Authentication middleware builds HttpContext.User from the token. Authorization reads that user to evaluate [Authorize]; if it runs first, the user is anonymous and every protected request fails with 401.', level: 'Medium' },
    { q: 'HS256 vs RS256?', a: 'HS256 is symmetric: the same secret signs and verifies, so every verifier can also create tokens. RS256 is asymmetric: a private key signs, public keys verify - better when many services validate tokens issued by one auth server.', level: 'Hard' },
    { q: 'Where should a React app store tokens?', a: 'Access token in memory (state/context) is safest against XSS; refresh token in an HttpOnly, Secure, SameSite cookie. localStorage is simple but readable by any injected script.', level: 'Hard' },
    { q: 'How do you get the current user id inside a controller?', a: 'User.FindFirstValue(ClaimTypes.NameIdentifier) (the sub claim after inbound mapping) or User.FindFirstValue(JwtRegisteredClaimNames.Sub) if mapping is disabled.', level: 'Medium' },
    { q: 'How do you logout with JWT?', a: 'The client deletes the tokens and the server revokes the refresh token. Existing access tokens remain valid until expiry unless you keep a deny-list of jti values or use very short lifetimes.', level: 'Medium' },
    { q: 'Output question: a token was created with expires = 10:00:00 UTC and ClockSkew is the default. At 10:03:00 UTC is it accepted?', a: 'Yes. The default ClockSkew is 5 minutes, so it is accepted until 10:05:00. With ClockSkew = TimeSpan.Zero it would be rejected with 401.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Add a "fullName" custom claim to the access token and return it from /api/auth/me.',
      hint: 'Add new Claim("fullName", ...) in CreateAccessToken; read with User.FindFirstValue("fullName").',
      solution: `// User: public string FullName { get; set; } = "";
claims.Add(new Claim("fullName", user.FullName));
// AuthController.Me:
fullName = User.FindFirstValue("fullName")`,
    },
    {
      task: 'Make access tokens expire after 1 minute and ClockSkew zero; prove in Postman that the token stops working after 60 seconds.',
      hint: 'Change Jwt:AccessTokenMinutes and ClockSkew = TimeSpan.Zero.',
      solution: `"AccessTokenMinutes": 1
ClockSkew = TimeSpan.Zero
// Login, call GET /api/students -> 200; wait 61 seconds -> 401 with
// WWW-Authenticate: Bearer error="invalid_token", error_description="The token expired at ..."`,
    },
    {
      task: 'Add POST /api/auth/logout-all that revokes every active refresh token of the current user.',
      hint: 'Use the NameIdentifier claim to find the user id; ExecuteUpdateAsync can do it in one statement.',
      solution: `[Authorize]
[HttpPost("logout-all")]
public async Task<IActionResult> LogoutAll()
{
    int userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    int n = await _db.RefreshTokens
        .Where(r => r.UserId == userId && r.RevokedAt == null)
        .ExecuteUpdateAsync(s => s.SetProperty(r => r.RevokedAt, DateTime.UtcNow));
    return Ok(new { revoked = n });
}`,
    },
    {
      task: 'Move the JWT settings into a strongly typed JwtOptions class bound with IOptions<JwtOptions>.',
      hint: 'builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt")).',
      solution: `public class JwtOptions
{
    public string Key { get; set; } = "";
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public int AccessTokenMinutes { get; set; }
    public int RefreshTokenDays { get; set; }
}
builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
public class TokenService(IOptions<JwtOptions> options) : ITokenService
{
    private readonly JwtOptions _o = options.Value;
    // use _o.Key, _o.Issuer ...
}`,
    },
    {
      task: 'Store refresh tokens hashed (SHA-256) instead of plain text so a database leak does not expose usable tokens.',
      hint: 'Return the plain token to the client, save only SHA256 hash; when refreshing, hash the incoming token and compare.',
      solution: `static string Hash(string token) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
// Issue: entity.Token = Hash(plain); return plain to client.
// Refresh: var hash = Hash(dto.RefreshToken);
//          var stored = await _db.RefreshTokens.FirstOrDefaultAsync(r => r.Token == hash);`,
    },
  ],
  quiz: [
    { question: 'Which header carries a JWT to the API?', options: ['Cookie: jwt=...', 'X-Token: ...', 'Authorization: Bearer <token>', 'Accept: application/jwt'], answer: 2, explanation: 'The Bearer scheme in the Authorization header is the standard.' },
    { question: 'The JWT signature protects against:', options: ['Reading the payload', 'Changing the payload without the key', 'Network latency', 'SQL injection'], answer: 1, explanation: 'Signatures provide integrity; the payload is still readable.' },
    { question: 'Which claim holds the expiry time?', options: ['exp', 'iat', 'sub', 'aud'], answer: 0, explanation: 'exp is the expiration time in Unix seconds.' },
    { question: 'A request has an expired token on an [Authorize] endpoint. The status is:', options: ['403', '400', '500', '401'], answer: 3, explanation: 'Authentication failed, so 401 Unauthorized.' },
    { question: 'Refresh tokens should be:', options: ['Short-lived JWTs sent on every request', 'Random, long-lived, stored server-side and revocable', 'The same as the password hash', 'Placed in the JWT payload'], answer: 1, explanation: 'They are opaque values tracked in the database so they can be revoked.' },
  ],
};
