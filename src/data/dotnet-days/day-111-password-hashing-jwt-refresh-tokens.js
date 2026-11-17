const passwordRulesCode = `using System;
using System.Collections.Generic;
using System.Linq;

// A tiny "blacklist" of very common passwords (real apps use a big list)
var common = new HashSet<string> { "password123", "pass@123", "admin@123" };

string[] candidates = { "abc", "password123", "Password123", "Pass@123", "P@ss w0rd2024", "Sita@2024!" };

foreach (var pwd in candidates)
{
    List<string> errors = Validate(pwd);
    Console.WriteLine(errors.Count == 0
        ? $"{pwd,-14} -> VALID"
        : $"{pwd,-14} -> {string.Join(", ", errors)}");
}

List<string> Validate(string p)
{
    var errors = new List<string>();
    if (p.Length < 8) errors.Add("min 8 chars");
    if (!p.Any(char.IsUpper)) errors.Add("needs uppercase");
    if (!p.Any(char.IsLower)) errors.Add("needs lowercase");
    if (!p.Any(char.IsDigit)) errors.Add("needs digit");
    if (p.All(char.IsLetterOrDigit)) errors.Add("needs symbol");
    if (p.Contains(' ')) errors.Add("no spaces");
    if (common.Contains(p.ToLower())) errors.Add("too common");
    return errors;
}
`;

const pbkdf2Code = `using System;
using System.Security.Cryptography;
using System.Text;

const int Iterations = 100_000;

// PART 1: fixed salt only so that the class sees the same output every time
byte[] fixedSalt = Encoding.UTF8.GetBytes("fixed-salt-16byt");
Console.WriteLine($"Salt bytes     : {fixedSalt.Length}");
Console.WriteLine($"Hash(Sita@123) : {HashWithSalt("Sita@123", fixedSalt)}");
Console.WriteLine($"Hash(sita@123) : {HashWithSalt("sita@123", fixedSalt)}");

// PART 2: the real storage format "iterations.salt.hash" with a RANDOM salt
string stored1 = HashPassword("Sita@123");
string stored2 = HashPassword("Sita@123");
Console.WriteLine($"Stored length  : {stored1.Length}");
Console.WriteLine($"Iterations part: {stored1.Split('.')[0]}");
Console.WriteLine($"Same password -> same stored value? {stored1 == stored2}");
Console.WriteLine($"Verify correct password: {VerifyPassword("Sita@123", stored1)}");
Console.WriteLine($"Verify wrong password  : {VerifyPassword("Sita@124", stored1)}");
Console.WriteLine($"Verify with 2nd record : {VerifyPassword("Sita@123", stored2)}");

string HashWithSalt(string password, byte[] salt)
{
    byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
    return Convert.ToBase64String(hash);
}

string HashPassword(string password)
{
    byte[] salt = RandomNumberGenerator.GetBytes(16);           // new salt for every user
    byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, Iterations, HashAlgorithmName.SHA256, 32);
    return $"{Iterations}.{Convert.ToBase64String(salt)}.{Convert.ToBase64String(hash)}";
}

bool VerifyPassword(string password, string stored)
{
    string[] parts = stored.Split('.');
    int iterations = int.Parse(parts[0]);
    byte[] salt = Convert.FromBase64String(parts[1]);
    byte[] expected = Convert.FromBase64String(parts[2]);
    byte[] actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, iterations, HashAlgorithmName.SHA256, expected.Length);
    return CryptographicOperations.FixedTimeEquals(actual, expected);   // constant-time compare
}
`;

const jwtCode = `using System;
using System.Security.Cryptography;
using System.Text;

string secret = "demo-secret-key-at-least-32-bytes-long!";
string header = """{"alg":"HS256","typ":"JWT"}""";
string payload = """{"sub":"101","email":"sita@demo.com","role":"User","exp":1767225600}""";

string token = CreateToken(header, payload);
string[] parts = token.Split('.');
Console.WriteLine($"Header    : {parts[0]}");
Console.WriteLine($"Payload   : {parts[1]}");
Console.WriteLine($"Signature : {parts[2]}");
Console.WriteLine($"Token length   : {token.Length}");
Console.WriteLine($"Decoded payload: {Encoding.UTF8.GetString(FromB64Url(parts[1]))}");
Console.WriteLine($"Valid signature? {Verify(token)}");

// An attacker changes role User -> Admin but cannot create a new signature
string evilPayload = """{"sub":"101","email":"sita@demo.com","role":"Admin","exp":1767225600}""";
string tampered = $"{parts[0]}.{B64Url(Encoding.UTF8.GetBytes(evilPayload))}.{parts[2]}";
Console.WriteLine($"Tampered token valid? {Verify(tampered)}");

long exp = 1767225600;          // value of the "exp" claim (Unix seconds)
long nowBefore = 1767224700;    // 15 minutes before expiry
long nowAfter = 1767225660;     // 1 minute after expiry
Console.WriteLine($"Expired at {nowBefore}? {nowBefore >= exp}");
Console.WriteLine($"Expired at {nowAfter}? {nowAfter >= exp}");

string CreateToken(string h, string p)
{
    string unsigned = $"{B64Url(Encoding.UTF8.GetBytes(h))}.{B64Url(Encoding.UTF8.GetBytes(p))}";
    return $"{unsigned}.{Sign(unsigned)}";
}

string Sign(string data) =>
    B64Url(HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(data)));

bool Verify(string jwt)
{
    string[] x = jwt.Split('.');
    if (x.Length != 3) return false;
    byte[] expected = Encoding.UTF8.GetBytes(Sign($"{x[0]}.{x[1]}"));
    byte[] actual = Encoding.UTF8.GetBytes(x[2]);
    return CryptographicOperations.FixedTimeEquals(expected, actual);
}

static string B64Url(byte[] bytes) =>
    Convert.ToBase64String(bytes).TrimEnd('=').Replace('+', '-').Replace('/', '_');

static byte[] FromB64Url(string s)
{
    s = s.Replace('-', '+').Replace('_', '/');
    switch (s.Length % 4)
    {
        case 2: s += "=="; break;
        case 3: s += "="; break;
    }
    return Convert.FromBase64String(s);
}
`;

const refreshCode = `using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;

const int AccessMinutes = 15;
const int RefreshMinutes = 7 * 24 * 60;     // 7 days
var store = new List<RefreshToken>();       // plays the role of the RefreshTokens table
int now = 0;                                // simulated clock in minutes
int accessCounter = 0;

Tokens login = Issue("sita");
Console.WriteLine($"t={now}: LOGIN -> {login.Access}, refresh token length {login.Refresh.Length}");

now = 20;
Console.WriteLine($"t={now}: CALL API with {login.Access} -> expired? {now >= login.AccessExpires}");

Tokens? second = Refresh(login.Refresh, out string m1);
Console.WriteLine($"t={now}: REFRESH -> {m1}");

now = 25;
Refresh(login.Refresh, out string m2);      // a thief replays the OLD refresh token
Console.WriteLine($"t={now}: REPLAY OLD TOKEN -> {m2}");

now = 30;
Refresh(second!.Refresh, out string m3);    // the real user now tries the new one
Console.WriteLine($"t={now}: USER REFRESH -> {m3}");

now = 31;
Tokens again = Issue("sita");
Console.WriteLine($"t={now}: LOGIN AGAIN -> {again.Access}");
Console.WriteLine($"Rows in table: {store.Count}, active: {store.Count(t => t.IsActive)}");

now = 31 + RefreshMinutes + 1;
Refresh(again.Refresh, out string m4);
Console.WriteLine($"t={now}: REFRESH AFTER 7 DAYS -> {m4}");

Tokens Issue(string user)
{
    accessCounter++;
    var rt = new RefreshToken
    {
        Token = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)),
        User = user,
        ExpiresAt = now + RefreshMinutes
    };
    store.Add(rt);
    return new Tokens($"AT-{accessCounter}", now + AccessMinutes, rt.Token);
}

Tokens? Refresh(string token, out string message)
{
    RefreshToken? rt = store.FirstOrDefault(t => t.Token == token);
    if (rt is null) { message = "401 unknown token"; return null; }

    if (rt.RevokedAt is not null && rt.ReplacedBy is not null)
    {
        // an already-rotated token came back: probably stolen -> revoke the whole family
        foreach (var t in store.Where(t => t.User == rt.User && t.IsActive))
            t.RevokedAt = now;
        message = "401 reuse detected, all sessions revoked";
        return null;
    }
    if (rt.RevokedAt is not null) { message = "401 token revoked, please log in again"; return null; }
    if (now >= rt.ExpiresAt) { message = "401 refresh token expired"; return null; }

    rt.RevokedAt = now;                     // ROTATION: old token can never be used again
    Tokens fresh = Issue(rt.User);
    rt.ReplacedBy = fresh.Refresh;
    message = $"200 new {fresh.Access} (expires t={fresh.AccessExpires}), old refresh revoked";
    return fresh;
}

record Tokens(string Access, int AccessExpires, string Refresh);

class RefreshToken
{
    public string Token { get; set; } = "";
    public string User { get; set; } = "";
    public int ExpiresAt { get; set; }
    public int? RevokedAt { get; set; }
    public string? ReplacedBy { get; set; }
    public bool IsActive => RevokedAt is null;
}
`;

const apiCode = `// ===== 1) NuGet packages (Package Manager Console) =====
// Install-Package Microsoft.AspNetCore.Identity.EntityFrameworkCore
// Install-Package Microsoft.EntityFrameworkCore.SqlServer
// Install-Package Microsoft.EntityFrameworkCore.Tools
// Install-Package Microsoft.AspNetCore.Authentication.JwtBearer
// (or: dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer)

// ===== 2) appsettings.json =====
/*
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=(localdb)\\\\MSSQLLocalDB;Database=AuthDemoDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Key": "put-a-long-random-secret-of-at-least-32-bytes-here!!",
    "Issuer": "StudentApi",
    "Audience": "StudentClient",
    "AccessTokenMinutes": 15,
    "RefreshTokenDays": 7
  },
  "Logging": { "LogLevel": { "Default": "Information" } },
  "AllowedHosts": "*"
}
*/
// In real projects keep Jwt:Key in User Secrets (right-click project > Manage User Secrets)
// or in Azure Key Vault, NOT in source control.

// ===== 3) Models/AppUser.cs and Models/RefreshToken.cs =====
using Microsoft.AspNetCore.Identity;

public class AppUser : IdentityUser
{
    public string FullName { get; set; } = "";
    public List<RefreshToken> RefreshTokens { get; set; } = new();
}

public class RefreshToken
{
    public int Id { get; set; }
    public string TokenHash { get; set; } = "";       // store a HASH of the token, not the token
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime CreatedAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? ReplacedByTokenHash { get; set; }
    public string UserId { get; set; } = "";
    public AppUser? User { get; set; }
    public bool IsActive => RevokedAtUtc == null && DateTime.UtcNow < ExpiresAtUtc;
}

// ===== 4) Data/AppDbContext.cs =====
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

public class AppDbContext : IdentityDbContext<AppUser>
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);                    // REQUIRED for Identity tables
        builder.Entity<RefreshToken>().HasIndex(r => r.TokenHash).IsUnique();
        builder.Entity<RefreshToken>().Ignore(r => r.IsActive);
    }
}

// ===== 5) DTOs/AuthDtos.cs =====
using System.ComponentModel.DataAnnotations;

public record RegisterDto(
    [Required] string FullName,
    [Required, EmailAddress] string Email,
    [Required, MinLength(8)] string Password);

public record LoginDto([Required, EmailAddress] string Email, [Required] string Password);
public record RefreshDto([Required] string RefreshToken);
public record AuthResponse(string AccessToken, DateTime AccessTokenExpiresUtc, string RefreshToken);

// ===== 6) Services/TokenService.cs =====
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.IdentityModel.Tokens;

public class TokenService
{
    private readonly IConfiguration _config;
    public TokenService(IConfiguration config) => _config = config;

    public (string token, DateTime expires) CreateAccessToken(AppUser user, IList<string> roles)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, user.Id),
            new(JwtRegisteredClaimNames.Email, user.Email!),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, user.FullName)
        };
        claims.AddRange(roles.Select(r => new Claim(ClaimTypes.Role, r)));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_config.GetValue<int>("Jwt:AccessTokenMinutes"));

        var jwt = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"],
            audience: _config["Jwt:Audience"],
            claims: claims,
            expires: expires,
            signingCredentials: creds);

        return (new JwtSecurityTokenHandler().WriteToken(jwt), expires);
    }

    public string CreateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

// ===== 7) Controllers/AuthController.cs =====
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly UserManager<AppUser> _users;
    private readonly AppDbContext _db;
    private readonly TokenService _tokens;
    private readonly IConfiguration _config;

    public AuthController(UserManager<AppUser> users, AppDbContext db, TokenService tokens, IConfiguration config)
    {
        _users = users; _db = db; _tokens = tokens; _config = config;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    public async Task<IActionResult> Register(RegisterDto dto)
    {
        var user = new AppUser { UserName = dto.Email, Email = dto.Email, FullName = dto.FullName };
        var result = await _users.CreateAsync(user, dto.Password);    // validates + hashes password
        if (!result.Succeeded)
            return BadRequest(result.Errors.Select(e => e.Description));
        await _users.AddToRoleAsync(user, "User");
        return Ok(new { message = "Registered successfully" });
    }

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginDto dto)
    {
        var user = await _users.FindByEmailAsync(dto.Email);
        if (user is null || await _users.IsLockedOutAsync(user))
            return Unauthorized(new { message = "Invalid email or password" });

        if (!await _users.CheckPasswordAsync(user, dto.Password))
        {
            await _users.AccessFailedAsync(user);                     // counts towards lockout
            return Unauthorized(new { message = "Invalid email or password" });
        }
        await _users.ResetAccessFailedCountAsync(user);
        return Ok(await IssueTokensAsync(user));
    }

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<IActionResult> Refresh(RefreshDto dto)
    {
        string hash = TokenService.Hash(dto.RefreshToken);
        var stored = await _db.RefreshTokens.Include(r => r.User)
                                            .SingleOrDefaultAsync(r => r.TokenHash == hash);
        if (stored is null) return Unauthorized();

        if (stored.RevokedAtUtc != null && stored.ReplacedByTokenHash != null)
        {
            // reuse of a rotated token -> revoke every active token of this user
            var family = await _db.RefreshTokens
                .Where(r => r.UserId == stored.UserId && r.RevokedAtUtc == null).ToListAsync();
            family.ForEach(r => r.RevokedAtUtc = DateTime.UtcNow);
            await _db.SaveChangesAsync();
            return Unauthorized(new { message = "Token reuse detected" });
        }
        if (!stored.IsActive) return Unauthorized(new { message = "Refresh token expired or revoked" });

        var response = await IssueTokensAsync(stored.User!);
        stored.RevokedAtUtc = DateTime.UtcNow;                         // rotation
        stored.ReplacedByTokenHash = TokenService.Hash(response.RefreshToken);
        await _db.SaveChangesAsync();
        return Ok(response);
    }

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(RefreshDto dto)
    {
        string hash = TokenService.Hash(dto.RefreshToken);
        var stored = await _db.RefreshTokens.SingleOrDefaultAsync(r => r.TokenHash == hash);
        if (stored != null) { stored.RevokedAtUtc = DateTime.UtcNow; await _db.SaveChangesAsync(); }
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public IActionResult Me() => Ok(new
    {
        name = User.Identity!.Name,
        email = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value,
        roles = User.FindAll(System.Security.Claims.ClaimTypes.Role).Select(c => c.Value)
    });

    private async Task<AuthResponse> IssueTokensAsync(AppUser user)
    {
        var roles = await _users.GetRolesAsync(user);
        var (access, expires) = _tokens.CreateAccessToken(user, roles);
        string refresh = _tokens.CreateRefreshToken();
        _db.RefreshTokens.Add(new RefreshToken
        {
            TokenHash = TokenService.Hash(refresh),
            UserId = user.Id,
            CreatedAtUtc = DateTime.UtcNow,
            ExpiresAtUtc = DateTime.UtcNow.AddDays(_config.GetValue<int>("Jwt:RefreshTokenDays"))
        });
        await _db.SaveChangesAsync();
        return new AuthResponse(access, expires, refresh);
    }
}

// ===== 8) Program.cs =====
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<AppDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddIdentityCore<AppUser>(o =>
{
    o.Password.RequiredLength = 8;
    o.Password.RequireDigit = true;
    o.Password.RequireUppercase = true;
    o.Password.RequireLowercase = true;
    o.Password.RequireNonAlphanumeric = true;
    o.Password.RequiredUniqueChars = 4;
    o.User.RequireUniqueEmail = true;
    o.Lockout.MaxFailedAccessAttempts = 5;
    o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);
})
.AddRoles<IdentityRole>()
.AddEntityFrameworkStores<AppDbContext>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
            ClockSkew = TimeSpan.FromSeconds(30)   // default is 5 minutes
        };
    });

builder.Services.AddAuthorization();
builder.Services.AddScoped<TokenService>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();   // Install-Package Swashbuckle.AspNetCore

var app = builder.Build();

// seed the roles once
using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    foreach (var role in new[] { "Admin", "User" })
        if (!await roleManager.RoleExistsAsync(role))
            await roleManager.CreateAsync(new IdentityRole(role));
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();`;

export default {
  id: 'day-111-password-hashing-jwt-refresh-tokens',
  title: 'Password Hashing, Password Validation, JWT Access Tokens and Refresh Tokens',
  module: 'Module 10: Authentication, Security, Testing & Integration',
  day: 111,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Learn why passwords are never stored as plain text, how hashing with salt and PBKDF2 works, how to enforce strong password rules, how a JWT access token is built and verified (header.payload.signature), and how refresh tokens with rotation and reuse detection keep users logged in safely. Finish with a complete ASP.NET Core Identity + JWT + refresh-token API.',
  objectives: [
    'Explain hashing vs encryption, salt, pepper and slow key-derivation functions (PBKDF2, bcrypt, Argon2)',
    'Hash and verify passwords in C# with Rfc2898DeriveBytes.Pbkdf2 and ASP.NET Core Identity PasswordHasher',
    'Configure password validation rules and lockout in Identity and write a custom password validator',
    'Build and validate a JWT access token and understand every claim (sub, exp, iss, aud, jti, role)',
    'Implement refresh tokens with rotation, revocation, reuse detection and logout',
  ],
  theory: [
    {
      heading: 'Why we hash passwords (hashing vs encryption)',
      content:
        'If the database is stolen, plain-text passwords give the attacker every account – and because people reuse passwords, also their e-mail and bank accounts. Encryption is two-way: anyone with the key can decrypt. Hashing is one-way: a hash function turns "Sita@123" into a fixed-length value and there is no "unhash". At login we hash the typed password again and compare the two hashes. Analogy: a hash is like a fingerprint – easy to take from a person, impossible to rebuild the person from it.',
      points: [
        'Fast hashes (MD5, SHA-1, SHA-256 alone) are WRONG for passwords: GPUs try billions per second',
        'Use a slow, salted key-derivation function: PBKDF2 (built into .NET and Identity), bcrypt or Argon2',
        'Salt = random bytes stored next to the hash, unique per user. Same password -> different hashes, so rainbow tables are useless',
        'Pepper = an extra secret kept OUTSIDE the database (e.g. Key Vault) and mixed into the hash',
        'Work factor / iterations make each guess slow (Identity v3 uses PBKDF2-HMAC-SHA512 with 100,000 iterations in .NET 8+)',
      ],
      syntax: `// .NET built-in PBKDF2 (System.Security.Cryptography)
byte[] salt = RandomNumberGenerator.GetBytes(16);
byte[] hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
// compare in constant time
bool ok = CryptographicOperations.FixedTimeEquals(hash, expectedHash);`,
      tip: 'Never write your own crypto algorithm. Use PBKDF2 from .NET, Identity\'s PasswordHasher<T>, or a well-known library such as BCrypt.Net-Next.',
    },
    {
      heading: 'PasswordHasher<T> in ASP.NET Core Identity',
      content:
        'When you call userManager.CreateAsync(user, password) Identity calls IPasswordHasher<TUser>.HashPassword and stores the result in AspNetUsers.PasswordHash. The stored string is Base64 and contains a format marker, the algorithm (PRF), the iteration count, the salt and the sub-key, so Identity can upgrade old hashes. VerifyHashedPassword returns Failed, Success or SuccessRehashNeeded (the hash used old settings – Identity re-hashes it automatically). You can also use PasswordHasher<T> on its own in any project without full Identity.',
      syntax: `var hasher = new PasswordHasher<AppUser>();
string hash = hasher.HashPassword(user, "Sita@123");
PasswordVerificationResult r = hasher.VerifyHashedPassword(user, hash, "Sita@123");
// r == PasswordVerificationResult.Success

// change iterations (higher = slower = safer)
builder.Services.Configure<PasswordHasherOptions>(o => o.IterationCount = 210_000);`,
      points: [
        'Password changes: userManager.ChangePasswordAsync(user, oldPwd, newPwd)',
        'Forgot password: GeneratePasswordResetTokenAsync + ResetPasswordAsync (token sent by e-mail)',
        'Every password change updates the SecurityStamp, which can invalidate old sessions',
      ],
    },
    {
      heading: 'Password validation and lockout',
      content:
        'Password validation stops weak passwords before they are hashed. Identity options give length, digit, upper, lower, non-alphanumeric and unique-character rules; failures come back in IdentityResult.Errors with codes like PasswordTooShort and PasswordRequiresDigit. Modern guidance (NIST) prefers LONG passwords and blocking known-breached/common passwords over many complex rules. Add your own rules by implementing IPasswordValidator<TUser>. Lockout protects against brute force: after N wrong attempts the account is locked for a time.',
      syntax: `public class NoUserNameInPasswordValidator : IPasswordValidator<AppUser>
{
    public Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user, string? password)
    {
        if (password != null && user.UserName != null &&
            password.Contains(user.UserName.Split('@')[0], StringComparison.OrdinalIgnoreCase))
            return Task.FromResult(IdentityResult.Failed(new IdentityError
            { Code = "PasswordContainsUserName", Description = "Password must not contain your user name." }));
        return Task.FromResult(IdentityResult.Success);
    }
}
// Program.cs:  .AddPasswordValidator<NoUserNameInPasswordValidator>()`,
      points: [
        'Validate on the client too (React form) for quick feedback, but ALWAYS validate on the server',
        'Return the same message for "unknown e-mail" and "wrong password" so attackers cannot discover accounts',
        'Lockout: options.Lockout.MaxFailedAccessAttempts = 5; DefaultLockoutTimeSpan = 10 minutes',
      ],
    },
    {
      heading: 'JWT access tokens – structure and validation',
      content:
        'A JSON Web Token is three Base64Url parts joined by dots: HEADER.PAYLOAD.SIGNATURE. The header says the algorithm (HS256 = HMAC-SHA256 with a shared secret, RS256 = RSA private/public key). The payload holds claims. The signature = HMAC(secret, header + "." + payload). The payload is only ENCODED, not encrypted – anyone can read it on jwt.io – so never put passwords or secrets in it. Nobody can CHANGE it without the secret, because the signature would no longer match. The API validates signature, issuer (iss), audience (aud) and lifetime (exp, nbf) on every request.',
      points: [
        'Registered claims: sub (user id), exp (expiry, Unix seconds), iat (issued at), nbf, iss, aud, jti (unique token id)',
        'Custom claims: role, email, name, department … (ClaimTypes.Role is used by [Authorize(Roles=...)])',
        'Access tokens are short-lived (5–15 minutes) and are sent in the header: Authorization: Bearer <token>',
        'JWTs are stateless: the server does not store them, so a stolen access token works until it expires – hence short lifetimes',
        'Key for HS256 must be at least 256 bits (32 bytes); keep it in User Secrets / Key Vault',
        'ClockSkew default is 5 minutes – set it lower if you want expiry to be exact',
      ],
      syntax: `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMDEi....kjkVEqOg...`,
    },
    {
      heading: 'Refresh tokens, rotation and revocation',
      content:
        'Short access tokens are safe but users do not want to log in every 15 minutes. A refresh token is a long random string (not a JWT) with a long life (7–30 days) that is stored in the database. When the access token expires the client calls POST /api/auth/refresh with the refresh token and gets a NEW access token and a NEW refresh token. Rotation means the old refresh token is revoked immediately. If an already-rotated token is used again, somebody copied it: revoke the whole token family and force a new login (reuse detection). Logout simply revokes the refresh token.',
      points: [
        'Generate with RandomNumberGenerator.GetBytes(64) – never Random or Guid alone',
        'Store only a SHA-256 hash of the refresh token in the database (like a password)',
        'Columns: TokenHash, UserId, CreatedAtUtc, ExpiresAtUtc, RevokedAtUtc, ReplacedByTokenHash',
        'Web apps: keep the refresh token in an HttpOnly, Secure, SameSite cookie so JavaScript (and XSS) cannot read it',
        'Changing the password or "log out from all devices" = revoke all active refresh tokens for that user',
      ],
      tip: 'Advanced rotation and revocation patterns are covered again in Extra 54 (Refresh Token Rotation/Revocation and Integration Testing).',
    },
    {
      heading: 'End-to-end login flow (React + .NET API)',
      content:
        '1) React posts e-mail and password to /api/auth/login. 2) The API checks the password hash, lockout and returns { accessToken, accessTokenExpiresUtc, refreshToken }. 3) React keeps the access token in memory (or context) and sends it as a Bearer header with axios. 4) When a call returns 401, an axios interceptor calls /api/auth/refresh once, saves the new tokens and repeats the original request. 5) If refresh also fails, React clears state and navigates to /login. 6) Logout calls /api/auth/logout and clears the tokens.',
      syntax: `// axios interceptor (React – Day 107)
api.interceptors.response.use(r => r, async error => {
  if (error.response?.status === 401 && !error.config._retry) {
    error.config._retry = true;
    const { data } = await axios.post('/api/auth/refresh', { refreshToken: getRefresh() });
    saveTokens(data);
    error.config.headers.Authorization = 'Bearer ' + data.accessToken;
    return api(error.config);
  }
  return Promise.reject(error);
});`,
    },
  ],
  examples: [
    {
      title: 'Password validation rules in a console app',
      scenario:
        'Before we let Identity validate passwords, build the same rules ourselves: minimum length, upper, lower, digit, symbol, no spaces and a blacklist of common passwords. Each password prints all the rules it breaks.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (.NET 8 or .NET 10)',
        'Name it PasswordRulesDemo and click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run',
        'Set a breakpoint (F9) inside Validate, press F5 and use F10 to watch the errors list grow',
      ],
      code: passwordRulesCode,
      csharp: { files: { 'Program.cs': passwordRulesCode }, stdin: '' },
      result: `abc            -> min 8 chars, needs uppercase, needs digit, needs symbol
password123    -> needs uppercase, needs symbol, too common
Password123    -> needs symbol, too common
Pass@123       -> too common
P@ss w0rd2024  -> no spaces
Sita@2024!     -> VALID`,
      explanation:
        'Validate returns a list of every broken rule instead of stopping at the first one – exactly how Identity returns IdentityResult.Errors. p.Any(char.IsUpper) uses a method group as the predicate. p.All(char.IsLetterOrDigit) is true only when there is no symbol. "Pass@123" passes all character rules but is still rejected because it is in the common-password list (lower-cased before the check). {pwd,-14} left-aligns the password in 14 characters.',
    },
    {
      title: 'Hashing and verifying passwords with salt + PBKDF2',
      scenario:
        'Hash "Sita@123" with PBKDF2 (100,000 iterations, SHA-256, 32-byte output). Part 1 uses a fixed salt only to show that one changed character gives a completely different hash. Part 2 uses a random salt per call and stores "iterations.salt.hash" – the same idea Identity uses internally.',
      steps: [
        'File > New > Project > Console App, name it PasswordHashDemo',
        'Replace Program.cs with the code below (no NuGet package needed – System.Security.Cryptography is built in)',
        'Press Ctrl+F5 (the program takes a fraction of a second because PBKDF2 is slow on purpose)',
        'Run it twice: the Part 1 hashes stay the same, Part 2 values change every run because of the random salt',
      ],
      code: pbkdf2Code,
      csharp: { files: { 'Program.cs': pbkdf2Code }, stdin: '' },
      result: `Salt bytes     : 16
Hash(Sita@123) : zFrqgBTmWxTeuUehx+XvxWNfd1c0vrUUKN0Aa4ePf30=
Hash(sita@123) : gnTYlDQ0wGWDk/LF9uoOOoWhKdXwBD7ZIazHPuP8sl8=
Stored length  : 76
Iterations part: 100000
Same password -> same stored value? False
Verify correct password: True
Verify wrong password  : False
Verify with 2nd record : True`,
      explanation:
        'Changing only S to s produces an unrelated hash (avalanche effect). The stored string is "100000" (6) + "." + salt in Base64 (16 bytes -> 24 chars) + "." + hash in Base64 (32 bytes -> 44 chars) = 76 characters. Two hashes of the same password differ because each has its own random salt, yet both verify, because VerifyPassword reads the salt and iterations back from the stored string. FixedTimeEquals compares in constant time so attackers cannot learn anything from response timing.',
    },
    {
      title: 'Build and verify a JWT by hand (HMAC-SHA256)',
      scenario:
        'To really understand JWT, create one without any library: Base64Url-encode the header and payload, sign them with HMAC-SHA256 and a secret key, then verify the signature, detect a tampered token and check the exp claim. (Raw string literals """...""" need C# 11 / .NET 7+.)',
      steps: [
        'File > New > Project > Console App, name it JwtByHandDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Copy the printed token (Header.Payload.Signature) and paste it into https://jwt.io – the payload is readable by anyone',
        'On jwt.io type the secret demo-secret-key-at-least-32-bytes-long! to see "Signature Verified"',
      ],
      code: jwtCode,
      csharp: { files: { 'Program.cs': jwtCode }, stdin: '' },
      result: `Header    : eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
Payload   : eyJzdWIiOiIxMDEiLCJlbWFpbCI6InNpdGFAZGVtby5jb20iLCJyb2xlIjoiVXNlciIsImV4cCI6MTc2NzIyNTYwMH0
Signature : kjkVEqOgRbHYBChHh1kBQ0wrce6MvlWRROPzLkAcKyI
Token length   : 172
Decoded payload: {"sub":"101","email":"sita@demo.com","role":"User","exp":1767225600}
Valid signature? True
Tampered token valid? False
Expired at 1767224700? False
Expired at 1767225660? True`,
      explanation:
        'The header always encodes to eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9 for {"alg":"HS256","typ":"JWT"}. Base64Url replaces + with -, / with _ and removes = padding so the token is URL-safe. Decoding the payload needs no key – proof that JWTs are not encrypted. The tampered token has a new payload but the old signature, so the recomputed HMAC no longer matches and Verify returns False. Real APIs let JwtBearer middleware do these same checks (plus iss, aud and nbf).',
    },
    {
      title: 'Refresh token rotation and reuse detection (simulation)',
      scenario:
        'Simulate the refresh-token table with a List and a fake clock in minutes. The user logs in, the access token expires, the client refreshes (rotation), a thief replays the old refresh token (reuse detected -> all sessions revoked), the user must log in again, and finally a refresh token older than 7 days is rejected.',
      steps: [
        'File > New > Project > Console App, name it RefreshTokenDemo',
        'Replace Program.cs with the code below and press Ctrl+F5',
        'Put a breakpoint on "rt.RevokedAt = now;" and step with F10/F11 to see rotation happen',
      ],
      code: refreshCode,
      csharp: { files: { 'Program.cs': refreshCode }, stdin: '' },
      result: `t=0: LOGIN -> AT-1, refresh token length 88
t=20: CALL API with AT-1 -> expired? True
t=20: REFRESH -> 200 new AT-2 (expires t=35), old refresh revoked
t=25: REPLAY OLD TOKEN -> 401 reuse detected, all sessions revoked
t=30: USER REFRESH -> 401 token revoked, please log in again
t=31: LOGIN AGAIN -> AT-3
Rows in table: 3, active: 1
t=10112: REFRESH AFTER 7 DAYS -> 401 refresh token expired`,
      explanation:
        '64 random bytes become 88 Base64 characters. At t=20 the first refresh token is revoked and linked (ReplacedBy) to the new one. At t=25 that revoked-and-replaced token comes back, which only happens if it was copied, so every active token of "sita" (the AT-2 refresh token) is revoked. The genuine user is therefore forced to log in again – annoying but safe. After the new login 3 rows exist and only the newest is active. Its expiry is 31 + 10080 = 10111, so at t=10112 it is rejected.',
    },
    {
      title: 'Complete ASP.NET Core API: Identity + JWT + refresh tokens',
      scenario:
        'Put everything together in an ASP.NET Core Web API: Identity stores users with hashed passwords, /login returns a JWT access token and a refresh token, /refresh rotates tokens with reuse detection, /logout revokes, and /me is protected with [Authorize].',
      steps: [
        'File > New > Project > ASP.NET Core Web API, name it AuthApi, Framework .NET 8/10, Authentication type: None, tick "Use controllers"',
        'Install the NuGet packages listed at the top (Tools > NuGet Package Manager > Package Manager Console)',
        'Add the classes into Models, Data, DTOs, Services and Controllers folders, and replace Program.cs and appsettings.json',
        'Package Manager Console: Add-Migration InitialIdentity then Update-Database (CLI: dotnet ef migrations add InitialIdentity; dotnet ef database update)',
        'Press F5 – Swagger opens. POST /api/auth/register, then POST /api/auth/login and copy accessToken',
        'Click Authorize in Swagger (or in Postman: Authorization tab > Bearer Token) and call GET /api/auth/me',
        'POST /api/auth/refresh with the refreshToken; call it again with the SAME old token to see 401 reuse detection',
      ],
      code: apiCode,
      result: `POST /api/auth/register
{ "fullName": "Sita Sharma", "email": "sita@demo.com", "password": "Sita@2024!" }
-> 200 OK { "message": "Registered successfully" }

POST /api/auth/register  { ..., "password": "abc" }
-> 400 Bad Request [ "Passwords must be at least 8 characters.", "Passwords must have at least one non alphanumeric character.", "Passwords must have at least one digit ('0'-'9').", "Passwords must have at least one uppercase ('A'-'Z')." , ... ]

POST /api/auth/login  { "email": "sita@demo.com", "password": "Sita@2024!" }
-> 200 OK
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIi...",
  "accessTokenExpiresUtc": "2026-11-17T10:15:00Z",
  "refreshToken": "q8Xc...88 characters...=="
}

GET /api/auth/me   (Authorization: Bearer eyJ...)
-> 200 OK { "name": "Sita Sharma", "email": "sita@demo.com", "roles": [ "User" ] }

GET /api/auth/me   (no header or expired token)  -> 401 Unauthorized
POST /api/auth/refresh { "refreshToken": "q8Xc..." }        -> 200 OK (new pair)
POST /api/auth/refresh { "refreshToken": "q8Xc..." } again  -> 401 { "message": "Token reuse detected" }`,
      explanation:
        'CreateAsync runs the password validators and the PBKDF2 PasswordHasher – our code never sees a hash. Login uses CheckPasswordAsync plus AccessFailedAsync so lockout works for an API without cookies. TokenService puts sub, email, jti, name and role claims into a signed JWT; JwtBearer middleware validates issuer, audience, lifetime and signature on every request. The refresh token is stored only as a SHA-256 hash (Convert.ToHexString), rotated on each refresh and revoked on reuse or logout. Migration creates AspNetUsers, AspNetRoles … and the RefreshTokens table. Exact Identity error wording can differ slightly between versions.',
    },
  ],
  interview: [
    { q: 'What is the difference between hashing and encryption?', a: 'Encryption is reversible with a key (used for data you must read again, e.g. card numbers). Hashing is one-way; you can only re-hash and compare. Passwords must be hashed, never encrypted.', level: 'Easy' },
    { q: 'What is a salt and why must it be unique per user?', a: 'A salt is random data added to the password before hashing and stored with the hash. A unique salt makes identical passwords produce different hashes and makes precomputed rainbow tables useless; attackers must crack each user separately.', level: 'Easy' },
    { q: 'Why is SHA-256 alone a poor choice for password hashing?', a: 'It is designed to be fast; GPUs compute billions of SHA-256 hashes per second, so brute force is cheap. Password hashing needs a slow, tunable KDF such as PBKDF2 with many iterations, bcrypt or Argon2.', level: 'Medium' },
    { q: 'Which algorithm does ASP.NET Core Identity use to hash passwords?', a: 'PasswordHasher<T> v3 format: PBKDF2 with HMAC-SHA512, 128-bit salt, 256-bit sub-key and 100,000 iterations by default in .NET 8+ (configurable via PasswordHasherOptions.IterationCount).', level: 'Medium' },
    { q: 'What does PasswordVerificationResult.SuccessRehashNeeded mean?', a: 'The password is correct but the stored hash uses older/weaker settings. UserManager automatically re-hashes and saves it with the current settings.', level: 'Hard' },
    { q: 'What are the three parts of a JWT?', a: 'Header (algorithm and type), Payload (claims) and Signature (HMAC or RSA signature of header.payload), each Base64Url-encoded and separated by dots.', level: 'Easy' },
    { q: 'Is the JWT payload encrypted? What should never go in it?', a: 'No, it is only Base64Url-encoded and anyone can read it. Never put passwords, secrets or sensitive personal data in it. The signature prevents modification, not reading. (JWE is the encrypted variant.)', level: 'Easy' },
    { q: 'Output question: Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)).Length = ?', a: '88. 64 bytes = 21 full groups of 3 bytes plus 1 leftover byte, so 22 groups x 4 characters = 88 (ending with "==").', level: 'Medium' },
    { q: 'Why are access tokens short-lived and refresh tokens long-lived?', a: 'Access tokens are stateless and cannot easily be revoked, so a short life limits damage if stolen. Refresh tokens are stored on the server, so they can be revoked, rotated and checked for reuse, which makes a longer life acceptable.', level: 'Medium' },
    { q: 'What is refresh token rotation and reuse detection?', a: 'Rotation: every refresh call returns a new refresh token and revokes the old one. Reuse detection: if a revoked (already rotated) token is presented again, it was probably stolen, so all tokens in that family are revoked and the user must log in again.', level: 'Hard' },
    { q: 'Where should a browser app store tokens?', a: 'Safest: access token in memory, refresh token in an HttpOnly, Secure, SameSite=Strict cookie so JavaScript (and therefore XSS) cannot read it. localStorage is simple but readable by any injected script.', level: 'Medium' },
    { q: 'How do you invalidate all JWTs of a user immediately?', a: 'Pure JWTs cannot be recalled. Options: keep access tokens very short and revoke refresh tokens; check a SecurityStamp / token version claim on each request; or maintain a deny-list of jti values until they expire.', level: 'Hard' },
    { q: 'What does ClockSkew do in TokenValidationParameters?', a: 'It allows a time tolerance between servers when checking exp/nbf. The default is 5 minutes, so a 1-minute token is accepted for up to 6 minutes. Set it to a small value (e.g. 30 seconds or TimeSpan.Zero) for exact expiry.', level: 'Medium' },
    { q: 'HS256 vs RS256?', a: 'HS256 uses one shared secret for signing and verifying – simple, good when the same API issues and validates. RS256 uses a private key to sign and a public key to verify – better when many services validate tokens issued by one identity server.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Extend the password validator so that the password cannot contain the user name (part before @ of the e-mail) and must have at least 4 unique characters.',
      hint: 'Pass the e-mail into Validate; use p.Distinct().Count() and Contains(..., StringComparison.OrdinalIgnoreCase).',
      solution: `List<string> Validate(string p, string email)
{
    var errors = new List<string>();
    string userName = email.Split('@')[0];
    if (p.Length < 8) errors.Add("min 8 chars");
    if (p.Distinct().Count() < 4) errors.Add("needs 4 unique chars");
    if (p.Contains(userName, StringComparison.OrdinalIgnoreCase)) errors.Add("contains user name");
    return errors;
}
// Validate("Sita@2024!", "sita@demo.com") -> [ "contains user name" ]`,
    },
    {
      task: 'Write a console "user store": Register(email, password) saves email + PBKDF2 hash in a Dictionary; Login(email, password) prints "Login OK" or "Invalid email or password". Lock the account after 3 wrong attempts.',
      hint: 'Reuse HashPassword/VerifyPassword from Example 2 and keep a Dictionary<string,int> of failed attempts.',
      solution: `var users = new Dictionary<string, string>();
var failed = new Dictionary<string, int>();

void Register(string email, string pwd) => users[email] = HashPassword(pwd);

string Login(string email, string pwd)
{
    if (failed.GetValueOrDefault(email) >= 3) return "Account locked";
    if (users.TryGetValue(email, out var stored) && VerifyPassword(pwd, stored))
    { failed[email] = 0; return "Login OK"; }
    failed[email] = failed.GetValueOrDefault(email) + 1;
    return "Invalid email or password";
}

Register("ravi@demo.com", "Ravi@2024!");
Console.WriteLine(Login("ravi@demo.com", "x"));          // Invalid email or password
Console.WriteLine(Login("ravi@demo.com", "y"));          // Invalid email or password
Console.WriteLine(Login("ravi@demo.com", "z"));          // Invalid email or password
Console.WriteLine(Login("ravi@demo.com", "Ravi@2024!")); // Account locked`,
    },
    {
      task: 'Use PasswordHasher<T> from Identity in a console app: hash "Admin@123" twice, print whether the two hashes are equal, and verify a correct and a wrong password.',
      hint: 'Install-Package Microsoft.Extensions.Identity.Core; PasswordHasher<object> works with any class.',
      solution: `using Microsoft.AspNetCore.Identity;

var hasher = new PasswordHasher<object>();
var user = new object();
string h1 = hasher.HashPassword(user, "Admin@123");
string h2 = hasher.HashPassword(user, "Admin@123");
Console.WriteLine(h1 == h2);                                                   // False (random salt)
Console.WriteLine(hasher.VerifyHashedPassword(user, h1, "Admin@123"));         // Success
Console.WriteLine(hasher.VerifyHashedPassword(user, h1, "admin@123"));         // Failed`,
    },
    {
      task: 'Add a "logout from all devices" endpoint to AuthController that revokes all active refresh tokens of the logged-in user.',
      hint: 'Read the user id from User.FindFirstValue(ClaimTypes.NameIdentifier) (the sub claim is mapped to NameIdentifier by default).',
      solution: `[HttpPost("logout-all")]
[Authorize]
public async Task<IActionResult> LogoutAll()
{
    string userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var tokens = await _db.RefreshTokens
        .Where(r => r.UserId == userId && r.RevokedAtUtc == null)
        .ToListAsync();
    tokens.ForEach(t => t.RevokedAtUtc = DateTime.UtcNow);
    await _db.SaveChangesAsync();
    return Ok(new { revoked = tokens.Count });
}`,
    },
    {
      task: 'Change the Login endpoint so the refresh token is returned in an HttpOnly cookie instead of the JSON body, and make /refresh read it from the cookie.',
      hint: 'Response.Cookies.Append("refreshToken", value, new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Expires = ... }).',
      solution: `private void SetRefreshCookie(string token) =>
    Response.Cookies.Append("refreshToken", token, new CookieOptions
    {
        HttpOnly = true,
        Secure = true,
        SameSite = SameSiteMode.Strict,
        Expires = DateTimeOffset.UtcNow.AddDays(7)
    });

// in Login:   var auth = await IssueTokensAsync(user);
//             SetRefreshCookie(auth.RefreshToken);
//             return Ok(new { auth.AccessToken, auth.AccessTokenExpiresUtc });
// in Refresh: string? token = Request.Cookies["refreshToken"];
//             if (token is null) return Unauthorized();`,
    },
  ],
  quiz: [
    {
      question: 'Which is the BEST way to store user passwords?',
      options: ['Encrypt with AES and keep the key in appsettings.json', 'SHA-256 hash without salt', 'Salted, slow hash such as PBKDF2, bcrypt or Argon2', 'Base64 encode them'],
      answer: 2,
      explanation: 'Passwords need a one-way, salted, deliberately slow hash. Encryption is reversible, plain SHA-256 is too fast, and Base64 is just encoding.',
    },
    {
      question: 'What does the signature part of a JWT guarantee?',
      options: ['The token has not been modified since it was signed', 'The payload is encrypted', 'The user is an Admin', 'The token never expires'],
      answer: 0,
      explanation: 'The signature proves integrity and origin. The payload remains readable; expiry comes from the exp claim.',
    },
    {
      question: 'An access token expired. What should a well-built client do?',
      options: ['Ask the user to register again', 'Call the refresh endpoint with the refresh token, then retry the request', 'Change the exp claim in the token', 'Send the password with every request'],
      answer: 1,
      explanation: 'The refresh token is exchanged for a new token pair (rotation) and the original request is retried.',
    },
    {
      question: 'A refresh token that was already rotated is used again. What is the recommended action?',
      options: ['Issue new tokens normally', 'Ignore it and return 200', 'Extend its expiry by 7 days', 'Treat it as theft: revoke all of the user\'s refresh tokens and require login'],
      answer: 3,
      explanation: 'Reuse of a rotated token means two parties have it, so the safe reaction is revoking the whole token family.',
    },
    {
      question: 'Which C# method should be used to compare two hash byte arrays?',
      options: ['a == b', 'CryptographicOperations.FixedTimeEquals(a, b)', 'a.Equals(b)', 'Array.IndexOf(a, b)'],
      answer: 1,
      explanation: 'FixedTimeEquals compares contents in constant time, preventing timing attacks. == and Equals on arrays compare references.',
    },
  ],
};
