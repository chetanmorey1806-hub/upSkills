export default {
  lesson: 'extra-54-refresh-token-rotation-integration-testing',
  minutes: 30,
  intro: 'Rotate refresh tokens with reuse detection and test the whole API pipeline with WebApplicationFactory integration tests.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'Why do apps use a **short-lived access token** plus a **long-lived refresh token**?',
      options: ['Because JWTs cannot expire', 'A stolen access token is useful only for minutes, while the refresh token (stored securely, revocable on the server) gets new access tokens', 'To make every request slower', 'Refresh tokens are sent with every API call'],
      answer: 1,
      explain: 'Access tokens (e.g. 15 min) are sent on every call and cannot be revoked easily. Refresh tokens are sent only to the refresh endpoint, stored hashed in the database and can be revoked, so sessions can last days safely.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Refresh token **rotation with reuse detection** is simulated below. What does it print?',
      example: { title: 'rotation rule', text: 'Each refresh returns a NEW refresh token and revokes the old one. If a revoked token is used again, someone copied it, so the whole token family is revoked.' },
      code: `var store = new Dictionary<string, bool>();   // token -> revoked?
int next = 1;
string Issue() { var t = $"RT{next++}"; store[t] = false; return t; }

string Refresh(string token)
{
    if (!store.ContainsKey(token)) return "401 unknown";
    if (store[token])
    {
        foreach (var k in store.Keys.ToList()) store[k] = true;   // revoke family
        return "401 reuse detected";
    }
    store[token] = true;
    return "200 " + Issue();
}

var first = Issue();
Console.WriteLine(first);
Console.WriteLine(Refresh(first));
Console.WriteLine(Refresh("RT2"));
Console.WriteLine(Refresh(first));
Console.WriteLine(Refresh("RT3"));
Console.WriteLine(Refresh("RT9"));`,
      expected: `RT1
200 RT2
200 RT3
401 reuse detected
401 reuse detected
401 unknown`,
      explain: 'RT1 is exchanged for RT2, and RT2 for RT3 (each old token is revoked). Re-using RT1 is detected as reuse, so **all** tokens including RT3 are revoked: the legitimate user must log in again, but so must the thief. RT3 is now rejected too, and RT9 was never issued.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which practices are correct for refresh tokens? Select all that apply.',
      options: ['Generate them with `RandomNumberGenerator.GetBytes(64)` (cryptographically random)', 'Store only a hash of the token in the database', 'Send the refresh token in an HttpOnly, Secure, SameSite cookie for browser apps', 'Put the refresh token inside the JWT access token', 'Keep refresh tokens valid forever'],
      answers: [0, 1, 2],
      explain: 'Use strong randomness, store hashes (a leaked table then gives no usable tokens) and keep them away from JavaScript with HttpOnly cookies. They must expire and be revocable; embedding them in the access token defeats the purpose.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Integration test class: get a test server for the whole app (Program.cs pipeline):
\`public class OrdersApiTests : IClassFixture<______<Program>>\``,
      example: { title: 'creating the client', code: `public OrdersApiTests(WebApplicationFactory<Program> factory)
{
    _client = factory.CreateClient();
}` },
      accept: ['WebApplicationFactory'],
      caseSensitive: true,
      explain: '`WebApplicationFactory<Program>` (package Microsoft.AspNetCore.Mvc.Testing) boots the real app in memory with a TestServer, so tests send real HTTP requests through routing, middleware, auth and controllers. Add `public partial class Program { }` if Program is not visible to the test project.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this xUnit integration test assert, i.e. which **status codes** does it expect? Write the two expected codes, one per line, in the order they are checked.',
      example: { title: 'reading the status', code: `var res = await _client.GetAsync("/health");
Assert.Equal(HttpStatusCode.OK, res.StatusCode);` },
      code: `[Fact]
public async Task Orders_require_login()
{
    var anonymous = await _client.GetAsync("/api/orders");
    Assert.Equal(HttpStatusCode.Unauthorized, anonymous.StatusCode);

    _client.DefaultRequestHeaders.Authorization =
        new AuthenticationHeaderValue("Bearer", await GetTestTokenAsync());
    var authed = await _client.GetAsync("/api/orders");
    Assert.Equal(HttpStatusCode.OK, authed.StatusCode);
}`,
      expected: `401
200`,
      explain: '`HttpStatusCode.Unauthorized` is 401 (no or invalid credentials) and `HttpStatusCode.OK` is 200. The test proves the `[Authorize]` attribute and JWT middleware are really wired up, which a unit test of the controller alone cannot show. (403 Forbidden would mean "logged in but not allowed".)',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'How do you replace the real SQL Server DbContext with a test database in a `WebApplicationFactory` test?',
      options: ['Edit Program.cs before each test run', 'Override `ConfigureWebHost` and use `builder.ConfigureServices` (or `ConfigureTestServices`) to remove the real DbContext registration and add one for a test database', 'Tests cannot change services', 'Set an environment variable named DbContext'],
      answer: 1,
      explain: 'A custom `WebApplicationFactory<Program>` can swap services: remove the `DbContextOptions<AppDbContext>` registration and register SQLite in-memory or a Testcontainers SQL Server. The rest of the pipeline stays real.',
    },
  ],
};
