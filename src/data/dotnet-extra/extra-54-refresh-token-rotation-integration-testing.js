export default {
  id: 'extra-54-refresh-token-rotation-integration-testing',
  title: 'Refresh Token Rotation/Revocation and Integration Testing',
  module: 'Extra: ASP.NET Core, EF Core & Web API',
  extraNo: 54,
  level: 'Advanced',
  duration: '3.5 hours',
  summary: `Build a production-style refresh token system for an ASP.NET Core Web API: short-lived JWT access tokens, long-lived random refresh tokens stored as SHA-256 hashes, rotation on every refresh, reuse detection with token families, revocation (logout, logout from all devices, password change) and cleanup. Then prove it works end to end with integration tests using WebApplicationFactory, an in-memory SQLite database and a fake clock.`,
  objectives: [
    'Explain why access tokens are short-lived and how refresh tokens keep the user logged in safely',
    'Implement refresh token rotation with reuse detection (token families) using EF Core',
    'Revoke refresh tokens on logout, logout-all and password change, and clean up old rows with a background service',
    'Store refresh tokens securely: random 64-byte values, SHA-256 hashes in the database, HttpOnly cookies for browsers',
    'Write integration tests with WebApplicationFactory, SQLite in-memory and FakeTimeProvider to test the full login/refresh/revoke flow',
  ],
  theory: [
    {
      heading: 'Access token vs refresh token',
      content: `A JWT access token is self-contained: the API validates its signature and expiry without touching the database. That makes it fast, but it also means you cannot easily "take it back" once it is issued. So we keep access tokens SHORT (5-15 minutes). To avoid asking the user to log in every 15 minutes, the login endpoint also returns a REFRESH TOKEN: a long random string (not a JWT) that is stored on the server and can be exchanged at POST /api/auth/refresh for a new access token. Because the server stores it, the server can revoke it at any time. Analogy: the access token is a cinema ticket for one show (checked quickly at the door), the refresh token is your membership card kept on file at the counter (the counter can cancel it).`,
      points: [
        'Access token: JWT, 5-15 minutes, sent on every request in Authorization: Bearer <token>, validated without DB.',
        'Refresh token: random 64 bytes (Base64), 7-30 days, sent ONLY to /api/auth/refresh, validated against the DB.',
        'Revoking a refresh token does not kill the current access token; it simply stops it from being renewed. This is why access tokens must be short.',
        'Never put a refresh token in a JWT claim or in a URL query string (it would end up in logs).',
      ],
      tip: `If you need instant logout of access tokens too, keep a small denylist of jti values (in IMemoryCache/Redis) until each token expires, or use a per-user "security stamp" claim that you compare on each request.`,
    },
    {
      heading: 'Refresh token rotation',
      content: `Rotation means a refresh token can be used ONLY ONCE. Every successful call to /refresh revokes the presented token (reason "Rotated", ReplacedByTokenHash = new hash) and returns a brand new refresh token together with a new access token. The client must replace its stored refresh token every time. If a refresh token is stolen, it is valid only until the real client uses it next, and then the theft becomes detectable (see reuse detection).`,
      syntax: `POST /api/auth/refresh  { "refreshToken": "R1" }
  -> 200 { accessToken: "A2", refreshToken: "R2" }   R1 is now revoked (Rotated -> R2)
POST /api/auth/refresh  { "refreshToken": "R2" }
  -> 200 { accessToken: "A3", refreshToken: "R3" }   R2 is now revoked (Rotated -> R3)`,
      points: [
        'Rotation must be atomic: two parallel calls with the same token must not both succeed. Use a conditional UPDATE ... WHERE Id = @id AND RevokedAtUtc IS NULL (EF Core ExecuteUpdateAsync) and check that exactly 1 row changed.',
        'Sliding expiry: each new token gets now + 7 days. Absolute expiry: copy the family\'s original expiry so the user must log in again after e.g. 30 days no matter what.',
        'SPA clients should make only ONE refresh call at a time (a single shared promise in the axios interceptor) to avoid false reuse alarms.',
      ],
    },
    {
      heading: 'Reuse detection with token families',
      content: `Every login creates a new FamilyId (Guid). All tokens produced by rotating that login share the same FamilyId. If the server receives a token that was ALREADY rotated (it has ReplacedByTokenHash), somebody is using an old copy: either an attacker who stole it, or the real user after the attacker already used it. The server cannot know which one is the attacker, so it revokes EVERY still-active token in that family (reason "Reuse detected") and returns 401. Both parties are logged out; the real user simply logs in again with the password, which the attacker does not have.`,
      points: [
        'Rotated token presented again -> revoke whole family + log a security warning + 401.',
        'Token revoked for another reason (Logout, Password changed) -> just 401, no family action needed.',
        'Unknown token (hash not found) -> 401 with a generic message; never reveal which part failed in detail.',
        'Families also make "show my active sessions / devices" pages easy: one family = one device/login.',
      ],
    },
    {
      heading: 'Revocation: logout, logout-all, password change, cleanup',
      content: `Revocation means setting RevokedAtUtc and RevokedReason on the stored row (we keep the row for auditing instead of deleting it). Typical triggers: POST /api/auth/revoke (logout from this device), POST /api/auth/revoke-all (logout from every device), password change or reset (revoke all of the user\'s tokens), admin disables the user, reuse detected. Old rows grow forever, so a BackgroundService periodically deletes rows that expired or were revoked more than N days ago using ExecuteDeleteAsync.`,
      syntax: `// logout everywhere (EF Core 7+ bulk update, no entities loaded)
int n = await db.RefreshTokens
    .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
    .ExecuteUpdateAsync(s => s
        .SetProperty(t => t.RevokedAtUtc, (DateTime?)now)
        .SetProperty(t => t.RevokedReason, "Logout all"));`,
      points: [
        'Revoke endpoints must be [Authorize] and must only revoke tokens that belong to the current user.',
        'Return 204 No Content for logout even if the token was already revoked (idempotent).',
        'Keep revoked rows for 30+ days if you need an audit trail of sessions.',
      ],
    },
    {
      heading: 'Storing refresh tokens securely',
      content: `Generate refresh tokens with RandomNumberGenerator.GetBytes(64) (cryptographically secure), never with Random or Guid.NewGuid(). Store only SHA-256(token) in the database, like a password hash: if the database leaks, the attacker cannot use the hashes. A fast hash (SHA-256) is fine here because the token has 512 bits of randomness; no salt or PBKDF2 needed. Add a unique index on TokenHash so lookups are fast. On the client: for browser SPAs, put the refresh token in an HttpOnly, Secure, SameSite=Strict cookie with Path=/api/auth so JavaScript (and XSS) cannot read it; mobile apps use secure storage (Keychain/Keystore).`,
      syntax: `string raw  = Convert.ToBase64String(RandomNumberGenerator.GetBytes(64)); // 88 chars, give to client
string hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(raw))); // 64 hex chars, save in DB

Response.Cookies.Append("refresh_token", raw, new CookieOptions
{
    HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
    Path = "/api/auth", Expires = DateTimeOffset.UtcNow.AddDays(7)
});`,
      points: [
        'Compare secrets with CryptographicOperations.FixedTimeEquals when you compare in memory.',
        'Store CreatedByIp / UserAgent for the "active sessions" page and for security investigations.',
        'If you use cookies, protect /refresh from CSRF with SameSite=Strict (or an anti-forgery header).',
      ],
    },
    {
      heading: 'Integration testing with WebApplicationFactory',
      content: `A unit test checks one class with mocks. An integration test starts the REAL application in memory (Program.cs, middleware, routing, model validation, JWT authentication, EF Core) using WebApplicationFactory<Program> from Microsoft.AspNetCore.Mvc.Testing, and calls it with a real HttpClient. No port, no IIS, no browser. We customise the host for tests: environment "Testing", replace SQL Server with SQLite in-memory (keep one SqliteConnection open for the whole test run, otherwise the database disappears), remove background services, seed a test user, and replace TimeProvider with FakeTimeProvider to test expiry without waiting 7 days.`,
      syntax: `public class AuthApiFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AuthDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AuthDbContext>>(); // EF Core 9+
            services.AddDbContext<AuthDbContext>(o => o.UseSqlite(connection));
        });
    }
}
// Program.cs must end with: public partial class Program { }`,
      points: [
        'IClassFixture<AuthApiFactory> shares ONE running app for all tests in a class (fast). Each test should create its own data (log in again) so tests stay independent.',
        'factory.WithWebHostBuilder(...) creates a variant of the app for a single test, e.g. with a FakeTimeProvider.',
        'Assert on status codes AND on response bodies; test the unhappy paths (401, 404) as carefully as the happy path.',
        'Run with Test > Run All Tests (Ctrl+R, A) in Visual Studio or dotnet test on the command line / in GitHub Actions.',
      ],
    },
  ],
  examples: [
    {
      title: 'Console simulation: rotation and reuse detection',
      scenario: `Before writing the real API, simulate the rules in a console app: login creates family F1, each refresh rotates the token, an attacker replays an old token, the server revokes the whole family, and a new login starts family F2. Tokens use a counter (rt-1, rt-2 ...) so the output is predictable; the real API uses RandomNumberGenerator.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App, click Next',
        'Name it RefreshRotationSim, choose .NET 8 or .NET 10, click Create',
        'Replace Program.cs with the code below',
        'Press Ctrl+F5 to run without debugging',
        'Set a breakpoint (F9) inside Rotate on the line containing existing.RevokedReason == "rotated" and press F5 to watch the reuse branch being hit',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Linq;

var store = new RefreshTokenStore();

Console.WriteLine("== Login ==");
var t1 = store.Issue("alice", null);
Console.WriteLine($"Issued {t1.Token} family={t1.Family}");

Console.WriteLine("== Refresh #1 ==");
var r1 = store.Rotate(t1.Token);
Console.WriteLine(r1.Message);

Console.WriteLine("== Refresh #2 ==");
var r2 = store.Rotate(r1.NewToken!);
Console.WriteLine(r2.Message);

Console.WriteLine("== Attacker replays old token ==");
var r3 = store.Rotate(t1.Token);
Console.WriteLine(r3.Message);

Console.WriteLine("== Legit user tries latest token ==");
var r4 = store.Rotate(r2.NewToken!);
Console.WriteLine(r4.Message);

Console.WriteLine("== User logs in again ==");
var t5 = store.Issue("alice", null);
Console.WriteLine($"Issued {t5.Token} family={t5.Family}");

Console.WriteLine("== Token table ==");
foreach (var t in store.All)
    Console.WriteLine($"{t.Token,-6} {t.Family,-4} {t.Status}");

record RotateResult(bool Ok, string Message, string? NewToken);

class StoredToken
{
    public required string Token { get; init; }
    public required string User { get; init; }
    public required string Family { get; init; }
    public string? ReplacedBy { get; set; }
    public string? RevokedReason { get; set; }

    public string Status => RevokedReason is null
        ? "Active"
        : "Revoked:" + RevokedReason + (ReplacedBy is null ? "" : " -> " + ReplacedBy);
}

class RefreshTokenStore
{
    private readonly List<StoredToken> _tokens = new();
    private int _counter;
    private int _families;

    public IReadOnlyList<StoredToken> All => _tokens;

    public StoredToken Issue(string user, string? family)
    {
        _counter++;
        var t = new StoredToken
        {
            Token = "rt-" + _counter,
            User = user,
            Family = family ?? "F" + (++_families)
        };
        _tokens.Add(t);
        return t;
    }

    public RotateResult Rotate(string token)
    {
        var existing = _tokens.FirstOrDefault(t => t.Token == token);
        if (existing is null)
            return new(false, "401 unknown token", null);

        if (existing.RevokedReason is not null)
        {
            if (existing.RevokedReason == "rotated")
            {
                int n = 0;
                foreach (var t in _tokens.Where(t => t.Family == existing.Family && t.RevokedReason is null))
                {
                    t.RevokedReason = "reuse";
                    n++;
                }
                return new(false, $"401 REUSE DETECTED for {existing.Token}: revoked {n} active token(s) in {existing.Family}", null);
            }
            return new(false, $"401 token {existing.Token} is revoked ({existing.RevokedReason})", null);
        }

        var fresh = Issue(existing.User, existing.Family);
        existing.RevokedReason = "rotated";
        existing.ReplacedBy = fresh.Token;
        return new(true, $"200 {existing.Token} -> {fresh.Token}", fresh.Token);
    }
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Linq;

var store = new RefreshTokenStore();

Console.WriteLine("== Login ==");
var t1 = store.Issue("alice", null);
Console.WriteLine($"Issued {t1.Token} family={t1.Family}");

Console.WriteLine("== Refresh #1 ==");
var r1 = store.Rotate(t1.Token);
Console.WriteLine(r1.Message);

Console.WriteLine("== Refresh #2 ==");
var r2 = store.Rotate(r1.NewToken!);
Console.WriteLine(r2.Message);

Console.WriteLine("== Attacker replays old token ==");
var r3 = store.Rotate(t1.Token);
Console.WriteLine(r3.Message);

Console.WriteLine("== Legit user tries latest token ==");
var r4 = store.Rotate(r2.NewToken!);
Console.WriteLine(r4.Message);

Console.WriteLine("== User logs in again ==");
var t5 = store.Issue("alice", null);
Console.WriteLine($"Issued {t5.Token} family={t5.Family}");

Console.WriteLine("== Token table ==");
foreach (var t in store.All)
    Console.WriteLine($"{t.Token,-6} {t.Family,-4} {t.Status}");

record RotateResult(bool Ok, string Message, string? NewToken);

class StoredToken
{
    public required string Token { get; init; }
    public required string User { get; init; }
    public required string Family { get; init; }
    public string? ReplacedBy { get; set; }
    public string? RevokedReason { get; set; }

    public string Status => RevokedReason is null
        ? "Active"
        : "Revoked:" + RevokedReason + (ReplacedBy is null ? "" : " -> " + ReplacedBy);
}

class RefreshTokenStore
{
    private readonly List<StoredToken> _tokens = new();
    private int _counter;
    private int _families;

    public IReadOnlyList<StoredToken> All => _tokens;

    public StoredToken Issue(string user, string? family)
    {
        _counter++;
        var t = new StoredToken
        {
            Token = "rt-" + _counter,
            User = user,
            Family = family ?? "F" + (++_families)
        };
        _tokens.Add(t);
        return t;
    }

    public RotateResult Rotate(string token)
    {
        var existing = _tokens.FirstOrDefault(t => t.Token == token);
        if (existing is null)
            return new(false, "401 unknown token", null);

        if (existing.RevokedReason is not null)
        {
            if (existing.RevokedReason == "rotated")
            {
                int n = 0;
                foreach (var t in _tokens.Where(t => t.Family == existing.Family && t.RevokedReason is null))
                {
                    t.RevokedReason = "reuse";
                    n++;
                }
                return new(false, $"401 REUSE DETECTED for {existing.Token}: revoked {n} active token(s) in {existing.Family}", null);
            }
            return new(false, $"401 token {existing.Token} is revoked ({existing.RevokedReason})", null);
        }

        var fresh = Issue(existing.User, existing.Family);
        existing.RevokedReason = "rotated";
        existing.ReplacedBy = fresh.Token;
        return new(true, $"200 {existing.Token} -> {fresh.Token}", fresh.Token);
    }
}`,
        },
        stdin: '',
      },
      result: `== Login ==
Issued rt-1 family=F1
== Refresh #1 ==
200 rt-1 -> rt-2
== Refresh #2 ==
200 rt-2 -> rt-3
== Attacker replays old token ==
401 REUSE DETECTED for rt-1: revoked 1 active token(s) in F1
== Legit user tries latest token ==
401 token rt-3 is revoked (reuse)
== User logs in again ==
Issued rt-4 family=F2
== Token table ==
rt-1   F1   Revoked:rotated -> rt-2
rt-2   F1   Revoked:rotated -> rt-3
rt-3   F1   Revoked:reuse
rt-4   F2   Active`,
      explanation: `rt-1 and rt-2 were each used once and marked "rotated" with a pointer to their replacement. When rt-1 arrives again, the store sees it was already rotated, so someone holds an old copy: every active token in family F1 (only rt-3) is revoked. Now even the legitimate holder of rt-3 gets 401 and must log in again, which creates a fresh family F2. The family logic is exactly what the real EF Core API does with FamilyId, RevokedReason and ReplacedByTokenHash. {t.Token,-6} left-aligns the token in 6 characters, which is why the table columns line up.`,
    },
    {
      title: 'Console: generating and hashing refresh tokens',
      scenario: `Show why the database stores a hash instead of the token: the same token always gives the same SHA-256 hash, a one-character change gives a totally different hash, and comparisons use a constant-time check.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RefreshTokenHashing, choose .NET 8 or .NET 10, click Create',
        'Replace Program.cs with the code (System.Security.Cryptography is part of .NET, no NuGet package needed)',
        'Press Ctrl+F5',
      ],
      code: `using System;
using System.Security.Cryptography;
using System.Text;

string token = "demo-refresh-token-123";   // fixed value so the output is predictable
string stored = Hash(token);              // this is what goes into RefreshTokens.TokenHash

Console.WriteLine("Raw token stored in DB? NO");
Console.WriteLine($"Hash  : {stored}");
Console.WriteLine($"Length: {stored.Length}");
Console.WriteLine($"Match : {Same(Hash("demo-refresh-token-123"), stored)}");
Console.WriteLine($"Tamper: {Same(Hash("demo-refresh-token-124"), stored)}");
Console.WriteLine($"Tamper hash starts with: {Hash("demo-refresh-token-124").Substring(0, 8)}");

byte[] bytes = RandomNumberGenerator.GetBytes(64);   // real tokens: 512 random bits
string realToken = Convert.ToBase64String(bytes);
Console.WriteLine($"Real token length: {realToken.Length}");
Console.WriteLine($"Real hash length : {Hash(realToken).Length}");

static string Hash(string value) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

static bool Same(string a, string b) =>
    CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Security.Cryptography;
using System.Text;

string token = "demo-refresh-token-123";   // fixed value so the output is predictable
string stored = Hash(token);              // this is what goes into RefreshTokens.TokenHash

Console.WriteLine("Raw token stored in DB? NO");
Console.WriteLine($"Hash  : {stored}");
Console.WriteLine($"Length: {stored.Length}");
Console.WriteLine($"Match : {Same(Hash("demo-refresh-token-123"), stored)}");
Console.WriteLine($"Tamper: {Same(Hash("demo-refresh-token-124"), stored)}");
Console.WriteLine($"Tamper hash starts with: {Hash("demo-refresh-token-124").Substring(0, 8)}");

byte[] bytes = RandomNumberGenerator.GetBytes(64);   // real tokens: 512 random bits
string realToken = Convert.ToBase64String(bytes);
Console.WriteLine($"Real token length: {realToken.Length}");
Console.WriteLine($"Real hash length : {Hash(realToken).Length}");

static string Hash(string value) =>
    Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(value)));

static bool Same(string a, string b) =>
    CryptographicOperations.FixedTimeEquals(Encoding.UTF8.GetBytes(a), Encoding.UTF8.GetBytes(b));`,
        },
        stdin: '',
      },
      result: `Raw token stored in DB? NO
Hash  : 825EEF274223E8AAAA3A7991B53493129E420006A229F2F7959615E8B6F52C70
Length: 64
Match : True
Tamper: False
Tamper hash starts with: A971BAEC
Real token length: 88
Real hash length : 64`,
      explanation: `SHA-256 produces 32 bytes; Convert.ToHexString writes each byte as 2 uppercase hex characters, so the hash is always 64 characters. Changing the last character of the token (123 -> 124) changes the whole hash (825EEF27... vs A971BAEC...). 64 random bytes in Base64 need ceil(64/3) * 4 = 88 characters. The random token itself changes every run, but its length does not, so the output above is stable. FixedTimeEquals takes the same time whether the first or the last character differs, so attackers cannot guess a secret by measuring response time.`,
    },
    {
      title: 'Console: expiry, logout and logout-all with a fake clock',
      scenario: `Test time-based rules without waiting days: a FakeClock is moved forward manually (the same idea as FakeTimeProvider in integration tests). Alice has two devices; she logs out on one, then changes her password (logout everywhere); Bob\'s token simply expires.`,
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it RefreshRevocationSim, choose .NET 8 or .NET 10',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change TimeSpan.FromDays(5) to FromDays(3) and run again: Bob\'s token is still VALID (only 6 days passed)',
      ],
      code: `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

var clock = new FakeClock(new DateTime(2026, 1, 1, 9, 0, 0, DateTimeKind.Utc));
var svc = new TokenService(clock);

string a = svc.Create("alice", TimeSpan.FromDays(7));   // laptop
string b = svc.Create("alice", TimeSpan.FromDays(7));   // phone
string c = svc.Create("bob", TimeSpan.FromDays(7));

Console.WriteLine(svc.Check(a));

clock.Advance(TimeSpan.FromDays(3));
svc.Revoke(a, "logout");
Console.WriteLine(svc.Check(a));
Console.WriteLine(svc.Check(b));

int n = svc.RevokeAllForUser("alice", "password changed");
Console.WriteLine($"Revoked for alice: {n}");
Console.WriteLine(svc.Check(b));

clock.Advance(TimeSpan.FromDays(5));
Console.WriteLine(svc.Check(c));
Console.WriteLine($"Cleanup removed: {svc.Cleanup()}");

class FakeClock(DateTime start)
{
    public DateTime UtcNow { get; private set; } = start;
    public void Advance(TimeSpan by) => UtcNow += by;
}

class RefreshToken
{
    public string Id { get; set; } = "";
    public string User { get; set; } = "";
    public DateTime ExpiresUtc { get; set; }
    public string? RevokedReason { get; set; }
}

class TokenService(FakeClock clock)
{
    private readonly List<RefreshToken> _tokens = new();

    public string Create(string user, TimeSpan lifetime)
    {
        var t = new RefreshToken { Id = "T" + (_tokens.Count + 1), User = user, ExpiresUtc = clock.UtcNow + lifetime };
        _tokens.Add(t);
        return t.Id;
    }

    public string Check(string id)
    {
        var t = _tokens.Single(x => x.Id == id);
        string when = t.ExpiresUtc.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture);
        if (t.RevokedReason is not null) return $"{t.Id} ({t.User}): REVOKED ({t.RevokedReason})";
        if (clock.UtcNow >= t.ExpiresUtc) return $"{t.Id} ({t.User}): EXPIRED at {when}";
        return $"{t.Id} ({t.User}): VALID until {when}";
    }

    public void Revoke(string id, string reason) =>
        _tokens.Single(x => x.Id == id).RevokedReason ??= reason;

    public int RevokeAllForUser(string user, string reason)
    {
        int count = 0;
        foreach (var t in _tokens.Where(x => x.User == user && x.RevokedReason is null))
        {
            t.RevokedReason = reason;
            count++;
        }
        return count;
    }

    public int Cleanup() =>
        _tokens.RemoveAll(t => t.RevokedReason is not null || t.ExpiresUtc <= clock.UtcNow);
}`,
      csharp: {
        files: {
          'Program.cs': `using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;

var clock = new FakeClock(new DateTime(2026, 1, 1, 9, 0, 0, DateTimeKind.Utc));
var svc = new TokenService(clock);

string a = svc.Create("alice", TimeSpan.FromDays(7));   // laptop
string b = svc.Create("alice", TimeSpan.FromDays(7));   // phone
string c = svc.Create("bob", TimeSpan.FromDays(7));

Console.WriteLine(svc.Check(a));

clock.Advance(TimeSpan.FromDays(3));
svc.Revoke(a, "logout");
Console.WriteLine(svc.Check(a));
Console.WriteLine(svc.Check(b));

int n = svc.RevokeAllForUser("alice", "password changed");
Console.WriteLine($"Revoked for alice: {n}");
Console.WriteLine(svc.Check(b));

clock.Advance(TimeSpan.FromDays(5));
Console.WriteLine(svc.Check(c));
Console.WriteLine($"Cleanup removed: {svc.Cleanup()}");

class FakeClock(DateTime start)
{
    public DateTime UtcNow { get; private set; } = start;
    public void Advance(TimeSpan by) => UtcNow += by;
}

class RefreshToken
{
    public string Id { get; set; } = "";
    public string User { get; set; } = "";
    public DateTime ExpiresUtc { get; set; }
    public string? RevokedReason { get; set; }
}

class TokenService(FakeClock clock)
{
    private readonly List<RefreshToken> _tokens = new();

    public string Create(string user, TimeSpan lifetime)
    {
        var t = new RefreshToken { Id = "T" + (_tokens.Count + 1), User = user, ExpiresUtc = clock.UtcNow + lifetime };
        _tokens.Add(t);
        return t.Id;
    }

    public string Check(string id)
    {
        var t = _tokens.Single(x => x.Id == id);
        string when = t.ExpiresUtc.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture);
        if (t.RevokedReason is not null) return $"{t.Id} ({t.User}): REVOKED ({t.RevokedReason})";
        if (clock.UtcNow >= t.ExpiresUtc) return $"{t.Id} ({t.User}): EXPIRED at {when}";
        return $"{t.Id} ({t.User}): VALID until {when}";
    }

    public void Revoke(string id, string reason) =>
        _tokens.Single(x => x.Id == id).RevokedReason ??= reason;

    public int RevokeAllForUser(string user, string reason)
    {
        int count = 0;
        foreach (var t in _tokens.Where(x => x.User == user && x.RevokedReason is null))
        {
            t.RevokedReason = reason;
            count++;
        }
        return count;
    }

    public int Cleanup() =>
        _tokens.RemoveAll(t => t.RevokedReason is not null || t.ExpiresUtc <= clock.UtcNow);
}`,
        },
        stdin: '',
      },
      result: `T1 (alice): VALID until 2026-01-08 09:00
T1 (alice): REVOKED (logout)
T2 (alice): VALID until 2026-01-08 09:00
Revoked for alice: 1
T2 (alice): REVOKED (password changed)
T3 (bob): EXPIRED at 2026-01-08 09:00
Cleanup removed: 3`,
      explanation: `All three tokens expire on 2026-01-08 09:00 (start + 7 days). After 3 days T1 is revoked by logout. RevokeAllForUser only touches tokens that are still active, so it revokes just T2 (count 1) and T1 keeps its original reason. After 5 more days (day 8) the clock is past Bob\'s expiry, so T3 is EXPIRED. Cleanup removes every revoked or expired row: all 3. The invariant culture format keeps "-" and ":" the same on every machine. A real API injects TimeProvider (built into .NET 8+) instead of DateTime.UtcNow for exactly this reason: tests can control time.`,
    },
    {
      title: 'Web API: login, refresh with rotation, revoke and revoke-all (EF Core + JWT)',
      scenario: `The complete RefreshDemo.Api project: SQL Server via EF Core, JWT access tokens (15 minutes), hashed rotating refresh tokens (7 days), reuse detection, logout and logout-all endpoints, and a background service that deletes old token rows.`,
      steps: [
        'In Visual Studio: File > New > Project > ASP.NET Core Web API, click Next',
        'Name it RefreshDemo.Api, solution name RefreshDemo, click Next',
        'Framework .NET 8 (LTS) or .NET 10 (LTS), Authentication type None, tick "Use controllers", tick "Enable OpenAPI support", click Create',
        'Tools > NuGet Package Manager > Package Manager Console, run: Install-Package Microsoft.AspNetCore.Authentication.JwtBearer ; Install-Package Microsoft.EntityFrameworkCore.SqlServer ; Install-Package Microsoft.EntityFrameworkCore.Tools ; Install-Package Swashbuckle.AspNetCore (match package major versions to your .NET version)',
        'Add folders Models, Data, Services, Controllers; add the classes below (right-click folder > Add > Class)',
        'Replace appsettings.json and Program.cs with the code below',
        'In Package Manager Console: Add-Migration InitialAuth then Update-Database (CLI: dotnet ef migrations add InitialAuth ; dotnet ef database update)',
        'Press F5, open /swagger, call POST /api/auth/login, click Authorize and paste the accessToken, then try /api/auth/me and /api/auth/refresh',
      ],
      code: `// ===== Models/AppUser.cs =====
namespace RefreshDemo.Api.Models;

public class AppUser
{
    public int Id { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public string Role { get; set; } = "User";
    public List<RefreshToken> RefreshTokens { get; set; } = new();
}

// ===== Models/RefreshToken.cs =====
namespace RefreshDemo.Api.Models;

public class RefreshToken
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public AppUser User { get; set; } = null!;
    public string TokenHash { get; set; } = "";          // SHA-256 hex, never the raw token
    public Guid FamilyId { get; set; }                   // one family per login/device
    public DateTime CreatedAtUtc { get; set; }
    public DateTime ExpiresAtUtc { get; set; }
    public DateTime? RevokedAtUtc { get; set; }
    public string? RevokedReason { get; set; }           // Rotated, Logout, Logout all, Reuse detected
    public string? ReplacedByTokenHash { get; set; }     // set only when Rotated
    public string? CreatedByIp { get; set; }
}

// ===== Models/AuthDtos.cs =====
using System.ComponentModel.DataAnnotations;
namespace RefreshDemo.Api.Models;

public record LoginRequest([Required, EmailAddress] string Email, [Required] string Password);
public record RefreshRequest([Required] string RefreshToken);
public record TokenResponse(string AccessToken, string RefreshToken, int ExpiresIn);

// ===== Data/AuthDbContext.cs =====
using Microsoft.EntityFrameworkCore;
using RefreshDemo.Api.Models;
namespace RefreshDemo.Api.Data;

public class AuthDbContext(DbContextOptions<AuthDbContext> options) : DbContext(options)
{
    public DbSet<AppUser> Users => Set<AppUser>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        b.Entity<AppUser>(e =>
        {
            e.HasIndex(u => u.Email).IsUnique();
            e.Property(u => u.Email).HasMaxLength(200);
            e.Property(u => u.Role).HasMaxLength(50);
        });
        b.Entity<RefreshToken>(e =>
        {
            e.HasIndex(t => t.TokenHash).IsUnique();
            e.HasIndex(t => t.FamilyId);
            e.Property(t => t.TokenHash).HasMaxLength(64);
            e.Property(t => t.ReplacedByTokenHash).HasMaxLength(64);
            e.Property(t => t.RevokedReason).HasMaxLength(50);
            e.Property(t => t.CreatedByIp).HasMaxLength(45);
            e.HasOne(t => t.User).WithMany(u => u.RefreshTokens)
             .HasForeignKey(t => t.UserId).OnDelete(DeleteBehavior.Cascade);
        });
    }
}

// ===== Services/JwtOptions.cs =====
namespace RefreshDemo.Api.Services;

public class JwtOptions
{
    public string Issuer { get; set; } = "";
    public string Audience { get; set; } = "";
    public string Key { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 15;
    public int RefreshTokenDays { get; set; } = 7;
}

// ===== Services/TokenService.cs =====
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using RefreshDemo.Api.Models;
namespace RefreshDemo.Api.Services;

public class TokenService(IOptions<JwtOptions> options, TimeProvider clock)
{
    private readonly JwtOptions _opt = options.Value;

    public int AccessTokenSeconds => _opt.AccessTokenMinutes * 60;

    public string CreateAccessToken(AppUser user)
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_opt.Key));
        var descriptor = new SecurityTokenDescriptor
        {
            Issuer = _opt.Issuer,
            Audience = _opt.Audience,
            Subject = new ClaimsIdentity(new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(ClaimTypes.Role, user.Role)
            }),
            Expires = clock.GetUtcNow().UtcDateTime.AddMinutes(_opt.AccessTokenMinutes),
            SigningCredentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        };
        return new JsonWebTokenHandler().CreateToken(descriptor);
    }

    public DateTime NewRefreshExpiry() => clock.GetUtcNow().UtcDateTime.AddDays(_opt.RefreshTokenDays);

    public static string GenerateRefreshToken() =>
        Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));

    public static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));
}

// ===== Services/RefreshTokenCleanupService.cs =====
using Microsoft.EntityFrameworkCore;
using RefreshDemo.Api.Data;
namespace RefreshDemo.Api.Services;

public class RefreshTokenCleanupService(IServiceScopeFactory scopes, TimeProvider clock,
    ILogger<RefreshTokenCleanupService> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromHours(6));
        do
        {
            using var scope = scopes.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
            var cutoff = clock.GetUtcNow().UtcDateTime.AddDays(-30);
            int deleted = await db.RefreshTokens
                .Where(t => t.ExpiresAtUtc < cutoff || (t.RevokedAtUtc != null && t.RevokedAtUtc < cutoff))
                .ExecuteDeleteAsync(stoppingToken);
            logger.LogInformation("Refresh token cleanup deleted {Count} row(s)", deleted);
        }
        while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}

// ===== Controllers/AuthController.cs =====
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RefreshDemo.Api.Data;
using RefreshDemo.Api.Models;
using RefreshDemo.Api.Services;
namespace RefreshDemo.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthDbContext db, TokenService tokens, TimeProvider clock,
    ILogger<AuthController> logger) : ControllerBase
{
    private DateTime Now => clock.GetUtcNow().UtcDateTime;

    [HttpPost("login")]
    public async Task<ActionResult<TokenResponse>> Login(LoginRequest req)
    {
        var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);
        if (user is null || new PasswordHasher<AppUser>()
                .VerifyHashedPassword(user, user.PasswordHash, req.Password) == PasswordVerificationResult.Failed)
            return Unauthorized(new { message = "Invalid email or password." });

        string refresh = TokenService.GenerateRefreshToken();
        AddRefreshToken(user.Id, Guid.NewGuid(), TokenService.Hash(refresh));   // new family
        await db.SaveChangesAsync();

        return Ok(new TokenResponse(tokens.CreateAccessToken(user), refresh, tokens.AccessTokenSeconds));
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<TokenResponse>> Refresh(RefreshRequest req)
    {
        var now = Now;
        var hash = TokenService.Hash(req.RefreshToken);
        var stored = await db.RefreshTokens.Include(t => t.User)
                                           .SingleOrDefaultAsync(t => t.TokenHash == hash);
        if (stored is null)
            return Unauthorized(new { message = "Invalid refresh token." });

        if (stored.RevokedAtUtc is not null)
        {
            if (stored.ReplacedByTokenHash is not null)          // already rotated -> REUSE
            {
                int killed = await db.RefreshTokens
                    .Where(t => t.FamilyId == stored.FamilyId && t.RevokedAtUtc == null)
                    .ExecuteUpdateAsync(s => s
                        .SetProperty(t => t.RevokedAtUtc, (DateTime?)now)
                        .SetProperty(t => t.RevokedReason, "Reuse detected"));
                logger.LogWarning("Refresh token reuse: user {UserId}, family {FamilyId}, revoked {Count}",
                    stored.UserId, stored.FamilyId, killed);
            }
            return Unauthorized(new { message = "Refresh token revoked." });
        }

        if (stored.ExpiresAtUtc <= now)
            return Unauthorized(new { message = "Refresh token expired." });

        string newRaw = TokenService.GenerateRefreshToken();
        string newHash = TokenService.Hash(newRaw);

        await using var tx = await db.Database.BeginTransactionAsync();
        // atomic "claim": only one parallel request can flip RevokedAtUtc from NULL
        int claimed = await db.RefreshTokens
            .Where(t => t.Id == stored.Id && t.RevokedAtUtc == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAtUtc, (DateTime?)now)
                .SetProperty(t => t.RevokedReason, "Rotated")
                .SetProperty(t => t.ReplacedByTokenHash, newHash));
        if (claimed == 0)
            return Unauthorized(new { message = "Refresh token already used." });

        AddRefreshToken(stored.UserId, stored.FamilyId, newHash);   // same family
        await db.SaveChangesAsync();
        await tx.CommitAsync();

        return Ok(new TokenResponse(tokens.CreateAccessToken(stored.User), newRaw, tokens.AccessTokenSeconds));
    }

    [Authorize]
    [HttpPost("revoke")]
    public async Task<IActionResult> Revoke(RefreshRequest req)
    {
        var hash = TokenService.Hash(req.RefreshToken);
        var stored = await db.RefreshTokens
            .SingleOrDefaultAsync(t => t.TokenHash == hash && t.UserId == CurrentUserId());
        if (stored is null) return NotFound(new { message = "Token not found." });

        if (stored.RevokedAtUtc is null)
        {
            stored.RevokedAtUtc = Now;
            stored.RevokedReason = "Logout";
            await db.SaveChangesAsync();
        }
        return NoContent();
    }

    [Authorize]
    [HttpPost("revoke-all")]
    public async Task<IActionResult> RevokeAll()
    {
        int userId = CurrentUserId();
        var now = Now;
        int count = await db.RefreshTokens
            .Where(t => t.UserId == userId && t.RevokedAtUtc == null)
            .ExecuteUpdateAsync(s => s
                .SetProperty(t => t.RevokedAtUtc, (DateTime?)now)
                .SetProperty(t => t.RevokedReason, "Logout all"));
        return Ok(new { revoked = count });
    }

    [Authorize]
    [HttpGet("me")]
    public IActionResult Me() => Ok(new
    {
        id = CurrentUserId(),
        email = User.FindFirstValue(ClaimTypes.Email) ?? User.FindFirstValue("email"),
        role = User.FindFirstValue(ClaimTypes.Role)
    });

    private int CurrentUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("sub")!);

    private void AddRefreshToken(int userId, Guid familyId, string tokenHash) =>
        db.RefreshTokens.Add(new RefreshToken
        {
            UserId = userId,
            FamilyId = familyId,
            TokenHash = tokenHash,
            CreatedAtUtc = Now,
            ExpiresAtUtc = tokens.NewRefreshExpiry(),
            CreatedByIp = HttpContext.Connection.RemoteIpAddress?.ToString()
        });
}

// ===== Program.cs =====
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RefreshDemo.Api.Data;
using RefreshDemo.Api.Models;
using RefreshDemo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<AuthDbContext>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("AuthDb")));

builder.Services.Configure<JwtOptions>(builder.Configuration.GetSection("Jwt"));
builder.Services.AddSingleton(TimeProvider.System);
builder.Services.AddScoped<TokenService>();
builder.Services.AddHostedService<RefreshTokenCleanupService>();

var jwt = builder.Configuration.GetSection("Jwt").Get<JwtOptions>()!;
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
    db.Database.Migrate();
    if (!db.Users.Any())
    {
        var alice = new AppUser { Email = "alice@demo.com", Role = "User" };
        alice.PasswordHash = new PasswordHasher<AppUser>().HashPassword(alice, "Pass@123");
        db.Users.Add(alice);
        db.SaveChanges();
    }
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();

public partial class Program { }   // lets the test project use WebApplicationFactory<Program>

// ===== appsettings.json =====
{
  "ConnectionStrings": {
    "AuthDb": "Server=(localdb)\\\\mssqllocaldb;Database=RefreshDemoDb;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "Jwt": {
    "Issuer": "RefreshDemo",
    "Audience": "RefreshDemoClient",
    "Key": "DEMO_ONLY_change_me_use_user_secrets_0123456789_ABCDEFGHIJ",
    "AccessTokenMinutes": 15,
    "RefreshTokenDays": 7
  },
  "Logging": { "LogLevel": { "Default": "Information", "Microsoft.AspNetCore": "Warning" } },
  "AllowedHosts": "*"
}`,
      result: `POST /api/auth/login
{ "email": "alice@demo.com", "password": "Pass@123" }
-> 200 OK
{ "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIi...", "refreshToken": "q8Xv0Rk3...Zg==", "expiresIn": 900 }

GET /api/auth/me   (Authorization: Bearer eyJhbGci...)
-> 200 OK  { "id": 1, "email": "alice@demo.com", "role": "User" }

POST /api/auth/refresh
{ "refreshToken": "q8Xv0Rk3...Zg==" }
-> 200 OK  { "accessToken": "eyJ...(new)", "refreshToken": "Lm42pW9c...Aw==", "expiresIn": 900 }

POST /api/auth/refresh   (the OLD token q8Xv0Rk3... again)
-> 401 Unauthorized  { "message": "Refresh token revoked." }
   log: warn: Refresh token reuse: user 1, family 3f2c..., revoked 1

POST /api/auth/refresh   (the NEW token Lm42pW9c...)
-> 401 Unauthorized  { "message": "Refresh token revoked." }   (family was revoked)

POST /api/auth/revoke     (Bearer token + { "refreshToken": "..." })  -> 204 No Content
POST /api/auth/revoke-all (Bearer token)                              -> 200 OK { "revoked": 2 }

SSMS: SELECT Id, FamilyId, RevokedReason, LEFT(TokenHash, 8) FROM RefreshTokens;
1  3F2C...  Rotated         9A1B44C0
2  3F2C...  Reuse detected  E07D12F9`,
      explanation: `Login creates family #1 and returns the raw refresh token once; only its hash is saved. Refresh looks up the hash, refuses unknown/revoked/expired tokens, and rotates inside a transaction. The conditional ExecuteUpdateAsync is the key line: if two requests race with the same token, only one changes the row (claimed = 1), the other gets claimed = 0 and 401. Presenting an already-rotated token triggers family revocation. TimeProvider is injected everywhere instead of DateTime.UtcNow so tests can fake time. The JWT key must be at least 32 bytes for HS256; in real projects keep it in User Secrets (right-click project > Manage User Secrets) or Azure Key Vault, not in appsettings.json. Token values in the sample responses are shortened; yours will differ on every call.`,
    },
    {
      title: 'Integration tests: WebApplicationFactory + SQLite in-memory + FakeTimeProvider',
      scenario: `Prove the whole flow works through real HTTP calls: login, protected endpoint, rotation, reuse detection, logout and expiry. The SQL Server registration is swapped for SQLite in-memory and a test user is seeded.`,
      steps: [
        'Right-click the solution > Add > New Project > xUnit Test Project, name it RefreshDemo.Api.Tests, same .NET version',
        'Right-click the test project > Add > Project Reference > tick RefreshDemo.Api',
        'Package Manager Console (Default project = RefreshDemo.Api.Tests): Install-Package Microsoft.AspNetCore.Mvc.Testing ; Install-Package Microsoft.EntityFrameworkCore.Sqlite ; Install-Package Microsoft.Extensions.TimeProvider.Testing',
        'Make sure Program.cs in the API ends with public partial class Program { }',
        'Add AuthApiFactory.cs and RefreshTokenFlowTests.cs with the code below (delete UnitTest1.cs)',
        'Test > Test Explorer, then Run All Tests (Ctrl+R, A) — or run dotnet test in the solution folder',
        'To debug a failing test: set a breakpoint (F9) in AuthController.Refresh, right-click the test > Debug',
      ],
      code: `// ===== RefreshDemo.Api.Tests/AuthApiFactory.cs =====
using System.Data;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using RefreshDemo.Api.Data;
using RefreshDemo.Api.Models;
using RefreshDemo.Api.Services;

namespace RefreshDemo.Api.Tests;

public class AuthApiFactory : WebApplicationFactory<Program>
{
    public const string Email = "alice@demo.com";
    public const string Password = "Pass@123";

    // one open connection = one in-memory database that lives as long as the factory
    private readonly SqliteConnection _connection = new("DataSource=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        if (_connection.State != ConnectionState.Open) _connection.Open();

        builder.UseEnvironment("Testing");   // skips Migrate/seed/Swagger in Program.cs
        builder.ConfigureTestServices(services =>
        {
            services.RemoveAll<DbContextOptions<AuthDbContext>>();
            services.RemoveAll<IDbContextOptionsConfiguration<AuthDbContext>>();   // EF Core 9+ (omit on EF Core 8)
            services.AddDbContext<AuthDbContext>(o => o.UseSqlite(_connection));

            var cleanup = services.SingleOrDefault(d => d.ImplementationType == typeof(RefreshTokenCleanupService));
            if (cleanup is not null) services.Remove(cleanup);
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        var host = base.CreateHost(builder);
        using var scope = host.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AuthDbContext>();
        db.Database.EnsureCreated();
        if (!db.Users.Any(u => u.Email == Email))
        {
            var user = new AppUser { Email = Email, Role = "User" };
            user.PasswordHash = new PasswordHasher<AppUser>().HashPassword(user, Password);
            db.Users.Add(user);
            db.SaveChanges();
        }
        return host;
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);
        if (disposing) _connection.Dispose();
    }
}

// ===== RefreshDemo.Api.Tests/RefreshTokenFlowTests.cs =====
using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Time.Testing;
using RefreshDemo.Api.Models;

namespace RefreshDemo.Api.Tests;

public class RefreshTokenFlowTests(AuthApiFactory factory) : IClassFixture<AuthApiFactory>
{
    private readonly HttpClient _client = factory.CreateClient();

    private static async Task<TokenResponse> LoginAsync(HttpClient client)
    {
        var res = await client.PostAsJsonAsync("/api/auth/login",
            new { email = AuthApiFactory.Email, password = AuthApiFactory.Password });
        res.EnsureSuccessStatusCode();
        return (await res.Content.ReadFromJsonAsync<TokenResponse>())!;
    }

    private Task<HttpResponseMessage> RefreshAsync(string refreshToken) =>
        _client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken });

    private static HttpRequestMessage WithBearer(HttpMethod method, string url, string accessToken, object? body = null)
    {
        var req = new HttpRequestMessage(method, url);
        req.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        if (body is not null) req.Content = JsonContent.Create(body);
        return req;
    }

    [Fact]
    public async Task Login_ReturnsAccessAndRefreshToken()
    {
        var tokens = await LoginAsync(_client);

        Assert.False(string.IsNullOrWhiteSpace(tokens.AccessToken));
        Assert.Equal(88, tokens.RefreshToken.Length);   // 64 random bytes in Base64
        Assert.Equal(900, tokens.ExpiresIn);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var res = await _client.PostAsJsonAsync("/api/auth/login",
            new { email = AuthApiFactory.Email, password = "wrong" });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Me_WithoutToken_Returns401_WithToken_Returns200()
    {
        var anonymous = await _client.GetAsync("/api/auth/me");
        Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);

        var tokens = await LoginAsync(_client);
        var res = await _client.SendAsync(WithBearer(HttpMethod.Get, "/api/auth/me", tokens.AccessToken));
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        Assert.Contains(AuthApiFactory.Email, await res.Content.ReadAsStringAsync());
    }

    [Fact]
    public async Task Refresh_RotatesToken()
    {
        var first = await LoginAsync(_client);

        var res = await RefreshAsync(first.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var second = (await res.Content.ReadFromJsonAsync<TokenResponse>())!;

        Assert.NotEqual(first.RefreshToken, second.RefreshToken);
        Assert.Equal(HttpStatusCode.OK, (await RefreshAsync(second.RefreshToken)).StatusCode);
    }

    [Fact]
    public async Task ReusingRotatedToken_RevokesWholeFamily()
    {
        var t0 = await LoginAsync(_client);
        var t1 = (await (await RefreshAsync(t0.RefreshToken)).Content.ReadFromJsonAsync<TokenResponse>())!;

        var replay = await RefreshAsync(t0.RefreshToken);        // attacker uses the old one
        Assert.Equal(HttpStatusCode.Unauthorized, replay.StatusCode);

        var afterReplay = await RefreshAsync(t1.RefreshToken);   // real user is logged out too
        Assert.Equal(HttpStatusCode.Unauthorized, afterReplay.StatusCode);

        var otherLogin = await LoginAsync(_client);              // other families are untouched
        Assert.Equal(HttpStatusCode.OK, (await RefreshAsync(otherLogin.RefreshToken)).StatusCode);
    }

    [Fact]
    public async Task Revoke_ThenRefresh_Returns401()
    {
        var tokens = await LoginAsync(_client);

        var revoke = await _client.SendAsync(WithBearer(HttpMethod.Post, "/api/auth/revoke",
            tokens.AccessToken, new { refreshToken = tokens.RefreshToken }));
        Assert.Equal(HttpStatusCode.NoContent, revoke.StatusCode);

        Assert.Equal(HttpStatusCode.Unauthorized, (await RefreshAsync(tokens.RefreshToken)).StatusCode);
    }

    [Fact]
    public async Task Refresh_WithUnknownToken_Returns401()
    {
        var res = await RefreshAsync("not-a-real-token");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task Refresh_AfterExpiry_Returns401()
    {
        var fakeTime = new FakeTimeProvider(DateTimeOffset.UtcNow);
        using var timed = factory.WithWebHostBuilder(b =>
            b.ConfigureTestServices(s => s.AddSingleton<TimeProvider>(fakeTime)));
        var client = timed.CreateClient();

        var tokens = await LoginAsync(client);
        fakeTime.Advance(TimeSpan.FromDays(8));   // RefreshTokenDays = 7

        var res = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = tokens.RefreshToken });
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }
}`,
      result: `Test Explorer (or dotnet test):
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Login_ReturnsAccessAndRefreshToken          Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Login_WithWrongPassword_Returns401          Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Me_WithoutToken_Returns401_WithToken_Returns200  Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Refresh_RotatesToken                        Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.ReusingRotatedToken_RevokesWholeFamily      Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Revoke_ThenRefresh_Returns401               Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Refresh_WithUnknownToken_Returns401         Passed
  RefreshDemo.Api.Tests.RefreshTokenFlowTests.Refresh_AfterExpiry_Returns401              Passed

Passed!  - Failed: 0, Passed: 8, Skipped: 0, Total: 8`,
      explanation: `WebApplicationFactory<Program> boots the real API in memory; CreateClient returns an HttpClient wired directly to the TestServer. ConfigureTestServices runs AFTER Program.cs registrations, so we can remove the SQL Server DbContext options (and on EF Core 9+ the IDbContextOptionsConfiguration too, otherwise EF complains that two providers are registered) and add SQLite with an open shared connection. CreateHost seeds the user after the app is built. Each test logs in again, so tests do not depend on each other even though they share one database. The expiry test uses WithWebHostBuilder to create a variant of the app where TimeProvider is a FakeTimeProvider; Advance(8 days) makes the stored token expired instantly. If a test fails with 401 where you expect 200, check that UseAuthentication comes before UseAuthorization and that the JWT Key is at least 32 bytes.`,
    },
  ],
  interview: [
    {
      q: 'Why do we need refresh tokens if we already have JWT access tokens?',
      a: 'JWT access tokens are validated without the database, so they cannot be revoked easily. We therefore keep them short-lived (5-15 minutes). A refresh token is a long-lived, server-stored, revocable credential used only to obtain new access tokens, so the user stays logged in without re-entering the password, and the server keeps the power to end the session.',
      level: 'Easy',
    },
    {
      q: 'What is refresh token rotation?',
      a: 'Every time a refresh token is used, the server revokes it and issues a new refresh token (plus a new access token). Each refresh token is single-use. A stolen token is only useful until the legitimate client refreshes, and any later use of an already-rotated token reveals the theft.',
      level: 'Easy',
    },
    {
      q: 'How does reuse detection work and why revoke the whole family?',
      a: 'All tokens that come from one login share a FamilyId. If a token that was already rotated (has ReplacedByTokenHash) is presented again, two parties hold copies of the chain. The server cannot tell which caller is the attacker, so it revokes every active token in that family and returns 401. The real user logs in again with the password; the attacker cannot.',
      level: 'Medium',
    },
    {
      q: 'Why store a hash of the refresh token instead of the token itself? Why is SHA-256 enough here when passwords need PBKDF2/bcrypt?',
      a: 'If the database leaks, hashes cannot be used to call /refresh. Passwords are low-entropy and can be brute-forced, so they need slow salted hashes. A refresh token is 64 random bytes (512 bits); brute-forcing its SHA-256 is impossible, so a fast unsalted hash is sufficient and allows an indexed lookup by hash.',
      level: 'Medium',
    },
    {
      q: 'After a user logs out (refresh token revoked), can the current access token still be used? How do you handle that?',
      a: 'Yes, until it expires, because JWT validation does not hit the database. Mitigations: keep access tokens short (5-15 min), keep a denylist of jti values until their expiry (memory cache/Redis), or include a security stamp/version claim that is compared on each request and changed on logout-all or password change.',
      level: 'Medium',
    },
    {
      q: 'Two browser tabs call /refresh at the same moment with the same token. What happens in your implementation?',
      a: 'The rotation uses a conditional update: UPDATE RefreshTokens SET RevokedAtUtc = now ... WHERE Id = @id AND RevokedAtUtc IS NULL (ExecuteUpdateAsync) and checks the affected row count. Only one request gets 1 row and succeeds; the other gets 0 and 401. Clients should also serialize refresh calls (one shared promise) to avoid this, or the server can allow a few-second grace period that returns the same successor token.',
      level: 'Hard',
    },
    {
      q: 'Where should a browser SPA store the refresh token?',
      a: 'In an HttpOnly, Secure, SameSite=Strict cookie scoped to the auth path (e.g. /api/auth), so JavaScript and therefore XSS cannot read it. The short-lived access token can live in memory (a React context). localStorage is readable by any script on the page and is the least safe option for refresh tokens.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between a unit test and an integration test in ASP.NET Core?',
      a: 'A unit test checks one class in isolation, replacing dependencies with mocks (Moq). An integration test runs the real pipeline (routing, model binding, filters, authentication, EF Core) through WebApplicationFactory and a real HttpClient, usually with a test database. Integration tests catch wiring problems such as missing UseAuthentication, wrong routes or bad DI registrations.',
      level: 'Easy',
    },
    {
      q: 'Why does Program.cs need "public partial class Program { }" for integration tests?',
      a: 'With top-level statements the compiler generates an internal Program class. WebApplicationFactory<Program> in another assembly needs an accessible type as the entry point marker; the partial declaration makes it public. (Alternatively use InternalsVisibleTo for the test assembly.)',
      level: 'Easy',
    },
    {
      q: 'Why must the SqliteConnection stay open when using SQLite in-memory in tests?',
      a: 'An in-memory SQLite database exists only while at least one connection to it is open. If EF opened and closed its own connection per DbContext, the schema and data would disappear between requests. Creating one SqliteConnection, opening it, and passing it to UseSqlite keeps the database alive for the lifetime of the factory.',
      level: 'Medium',
    },
    {
      q: 'In EF Core 9+, after removing DbContextOptions<T> and adding UseSqlite, the test fails with "Services for database providers SqlServer, Sqlite have been registered". Why?',
      a: 'Since EF Core 9, AddDbContext also registers IDbContextOptionsConfiguration<TContext> holding the original UseSqlServer action, and all such configurations are applied. You must also remove IDbContextOptionsConfiguration<AuthDbContext> (services.RemoveAll<...>()) before adding the SQLite registration.',
      level: 'Hard',
    },
    {
      q: 'How do you test token expiry without waiting 7 days?',
      a: 'Inject TimeProvider (built into .NET 8+) instead of using DateTime.UtcNow in the service/controller. In tests replace it with FakeTimeProvider from Microsoft.Extensions.TimeProvider.Testing via WithWebHostBuilder + ConfigureTestServices, then call fakeTime.Advance(TimeSpan.FromDays(8)) and assert 401.',
      level: 'Medium',
    },
    {
      q: 'Output-based: in the rotation simulation, tokens rt-1 -> rt-2 -> rt-3 were rotated, then rt-1 is replayed. How many tokens are revoked by reuse detection and what does rt-3 return next?',
      a: 'Only rt-3 is still active in family F1, so reuse detection revokes 1 token. When rt-3 is used afterwards the result is "401 token rt-3 is revoked (reuse)".',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Move the refresh token from the JSON body to an HttpOnly cookie: Login and Refresh set the cookie, Refresh reads it from Request.Cookies, and the response body contains only accessToken and expiresIn.',
      hint: 'Response.Cookies.Append("refresh_token", raw, new CookieOptions { HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict, Path = "/api/auth" }). In React use axios with withCredentials: true and enable CORS AllowCredentials for your exact origin.',
      solution: `private void SetRefreshCookie(string raw, DateTime expires) =>
    Response.Cookies.Append("refresh_token", raw, new CookieOptions
    {
        HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
        Path = "/api/auth", Expires = expires
    });

[HttpPost("refresh")]
public async Task<IActionResult> Refresh()
{
    if (!Request.Cookies.TryGetValue("refresh_token", out var raw))
        return Unauthorized();
    // ... same rotation logic using raw ...
    SetRefreshCookie(newRaw, tokens.NewRefreshExpiry());
    return Ok(new { accessToken, expiresIn = tokens.AccessTokenSeconds });
}
// Logout: Response.Cookies.Delete("refresh_token", new CookieOptions { Path = "/api/auth" });`,
    },
    {
      task: 'Add an absolute session lifetime: a family may never live longer than 30 days after the original login, even with sliding refresh.',
      hint: 'Add SessionExpiresAtUtc to RefreshToken. On login set it to now + 30 days; on rotation copy it from the old token and set ExpiresAtUtc = Min(now + 7 days, SessionExpiresAtUtc).',
      solution: `// login
var sessionEnd = Now.AddDays(30);
// rotation
var expires = tokens.NewRefreshExpiry();
if (expires > stored.SessionExpiresAtUtc) expires = stored.SessionExpiresAtUtc;
db.RefreshTokens.Add(new RefreshToken
{
    UserId = stored.UserId, FamilyId = stored.FamilyId, TokenHash = newHash,
    CreatedAtUtc = Now, ExpiresAtUtc = expires, SessionExpiresAtUtc = stored.SessionExpiresAtUtc
});
// then: Add-Migration AddSessionExpiry ; Update-Database`,
    },
    {
      task: 'Create GET /api/auth/sessions that lists the current user\'s active sessions (one row per family) and DELETE /api/auth/sessions/{familyId} that revokes one session.',
      hint: 'Filter RevokedAtUtc == null and ExpiresAtUtc > now, group by FamilyId, show CreatedByIp and the newest CreatedAtUtc. Revoke with ExecuteUpdateAsync filtered by both UserId and FamilyId.',
      solution: `[Authorize, HttpGet("sessions")]
public async Task<IActionResult> Sessions()
{
    int userId = CurrentUserId(); var now = Now;
    var list = await db.RefreshTokens
        .Where(t => t.UserId == userId && t.RevokedAtUtc == null && t.ExpiresAtUtc > now)
        .Select(t => new { t.FamilyId, t.CreatedByIp, LastUsedUtc = t.CreatedAtUtc, t.ExpiresAtUtc })
        .ToListAsync();
    return Ok(list);
}

[Authorize, HttpDelete("sessions/{familyId:guid}")]
public async Task<IActionResult> EndSession(Guid familyId)
{
    int userId = CurrentUserId(); var now = Now;
    int n = await db.RefreshTokens
        .Where(t => t.UserId == userId && t.FamilyId == familyId && t.RevokedAtUtc == null)
        .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAtUtc, (DateTime?)now)
                                  .SetProperty(t => t.RevokedReason, "Session ended"));
    return n == 0 ? NotFound() : NoContent();
}`,
    },
    {
      task: 'Write an integration test proving that POST /api/auth/revoke-all logs out every device: log in twice, call revoke-all with the first access token, then assert that both refresh tokens return 401.',
      hint: 'Reuse LoginAsync and WithBearer from RefreshTokenFlowTests. Expect 200 with { "revoked": 2 } (or more if earlier tests left active tokens, so assert >= 2).',
      solution: `[Fact]
public async Task RevokeAll_LogsOutEveryDevice()
{
    var laptop = await LoginAsync(_client);
    var phone = await LoginAsync(_client);

    var res = await _client.SendAsync(WithBearer(HttpMethod.Post, "/api/auth/revoke-all", laptop.AccessToken));
    Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    var body = await res.Content.ReadFromJsonAsync<Dictionary<string, int>>();
    Assert.True(body!["revoked"] >= 2);

    Assert.Equal(HttpStatusCode.Unauthorized, (await RefreshAsync(laptop.RefreshToken)).StatusCode);
    Assert.Equal(HttpStatusCode.Unauthorized, (await RefreshAsync(phone.RefreshToken)).StatusCode);
}`,
    },
    {
      task: 'In React, write an axios response interceptor that, on a 401, calls /api/auth/refresh ONCE (even if several requests fail together), retries the original requests with the new access token, and redirects to /login if the refresh fails.',
      hint: 'Keep a module-level refreshPromise variable; if it is null create it, otherwise await the existing one. Mark retried requests with config._retry = true to avoid infinite loops.',
      solution: `import axios from 'axios';

const api = axios.create({ baseURL: 'https://localhost:7001/api', withCredentials: true });
let accessToken = null;
let refreshPromise = null;

api.interceptors.request.use(config => {
  if (accessToken) config.headers.Authorization = 'Bearer ' + accessToken;
  return config;
});

api.interceptors.response.use(r => r, async error => {
  const original = error.config;
  if (error.response?.status !== 401 || original._retry || original.url.includes('/auth/refresh'))
    return Promise.reject(error);
  original._retry = true;
  try {
    if (!refreshPromise) {
      refreshPromise = api.post('/auth/refresh').finally(() => { refreshPromise = null; });
    }
    const { data } = await refreshPromise;
    accessToken = data.accessToken;
    return api(original);
  } catch (e) {
    accessToken = null;
    window.location.href = '/login';
    return Promise.reject(e);
  }
});

export default api;`,
    },
  ],
  quiz: [
    {
      question: 'What should the server do when it receives a refresh token that has already been rotated?',
      options: [
        'Issue a new token pair because the token is still within its expiry',
        'Revoke all active tokens in the same family and return 401',
        'Return 200 with the same token that replaced it',
        'Delete the user account',
      ],
      answer: 1,
      explanation: 'Reuse of a rotated token means a copy exists elsewhere (likely stolen). Revoking the whole family logs out both the attacker and the user, who can log in again with the password.',
    },
    {
      question: 'Which is the best way to generate a refresh token in .NET?',
      options: [
        'Guid.NewGuid().ToString()',
        'new Random().Next().ToString()',
        'A JWT with a 30-day expiry',
        'Convert.ToBase64String(RandomNumberGenerator.GetBytes(64))',
      ],
      answer: 3,
      explanation: 'RandomNumberGenerator is cryptographically secure; 64 bytes give 512 bits of entropy. Random is predictable, GUIDs are not designed as secrets, and a long-lived JWT cannot be revoked without extra storage.',
    },
    {
      question: 'What is stored in the RefreshTokens.TokenHash column?',
      options: [
        'The SHA-256 hash of the raw token, so a database leak does not expose usable tokens',
        'The raw token encrypted with the JWT signing key',
        'The access token',
        'The user password hash',
      ],
      answer: 0,
      explanation: 'Only the hash is stored. On refresh the server hashes the presented token and looks it up by the unique TokenHash index.',
    },
    {
      question: 'In an integration test using SQLite in-memory, why do we create and open one SqliteConnection ourselves?',
      options: [
        'SQLite cannot be used without an explicit connection string file',
        'It makes queries run faster than SQL Server',
        'The in-memory database is destroyed when its last connection closes, so we keep one open for the whole test run',
        'WebApplicationFactory requires a DbConnection parameter',
      ],
      answer: 2,
      explanation: 'Each new connection to "DataSource=:memory:" would get a brand new empty database. Sharing one open connection keeps the schema and seeded data alive.',
    },
    {
      question: 'Which tool lets an integration test make a refresh token expire without waiting 7 days?',
      options: [
        'Thread.Sleep(TimeSpan.FromDays(8))',
        'FakeTimeProvider from Microsoft.Extensions.TimeProvider.Testing, injected in place of TimeProvider',
        'Changing the Windows system clock',
        'Setting ClockSkew to 8 days',
      ],
      answer: 1,
      explanation: 'When the API reads time from an injected TimeProvider, the test can replace it with FakeTimeProvider and call Advance(TimeSpan.FromDays(8)). ClockSkew only affects JWT access token validation.',
    },
  ],
};
