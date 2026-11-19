export default {
  lesson: 'day-113-api-security-cors-https-sqli-xss-csrf',
  minutes: 35,
  intro: 'Recognise and prevent the classic web attacks: SQL injection (parameters), XSS (encoding), CSRF (tokens/SameSite) and insecure transport (HTTPS, HSTS) with a correct CORS setup.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'A login query is built by string concatenation. The attacker types `' + "' OR '1'='1' --" + '` as the user name. What exact SQL text is sent to SQL Server?',
      example: { title: 'why quotes matter', code: 'name = O\'Brien  →  WHERE Name = \'O\'Brien\'  (broken SQL)' },
      code: `string name = Request.Form["name"];   // ' OR '1'='1' --
string pass = Request.Form["pass"];   // anything
string sql = "SELECT * FROM Users WHERE Name = '" + name + "' AND Pass = '" + pass + "'";
Console.WriteLine(sql);`,
      expected: "SELECT * FROM Users WHERE Name = '' OR '1'='1' --' AND Pass = 'anything'",
      explain: 'The quote closes the string, `OR \'1\'=\'1\'` is always true and `--` comments out the password check: the attacker logs in as the first user. Parameters (`@name`) or EF Core LINQ send values separately, so they can never change the SQL structure.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the EF Core call that runs raw SQL **safely** - the interpolated value becomes a SQL parameter:\n`var users = _db.Users.______($"SELECT * FROM Users WHERE Name = {name}").ToList();`',
      example: { title: 'the dangerous version', code: '_db.Users.FromSqlRaw("SELECT * FROM Users WHERE Name = \'" + name + "\'") // injectable' },
      accept: ['FromSqlInterpolated', 'FromSql'],
      caseSensitive: true,
      explain: '`FromSqlInterpolated` (or `FromSql` in EF Core 7+) converts each `{value}` into a `DbParameter`. `FromSqlRaw` with string concatenation is injectable; with raw SQL use `FromSqlRaw("... = {0}", name)` placeholders instead.',
    },
    {
      type: 'code',
      lang: 'tsql',
      mins: 6,
      q: '**See the injection in SQL.** The `Users` table is given. First write the query the attacker produced (it should return **all** users even though no password is right):\n`SELECT Id, Name FROM Users WHERE Name = \'\' OR \'1\'=\'1\'`\n\nThis shows why the input must never be glued into the SQL text.',
      example: { title: 'a safe parameterised query (ADO.NET)', code: 'cmd.CommandText = "SELECT * FROM Users WHERE Name = @name";\ncmd.Parameters.AddWithValue("@name", name);' },
      setup: `CREATE TABLE Users (
  Id INT IDENTITY(1,1) PRIMARY KEY,
  Name NVARCHAR(50),
  Pass NVARCHAR(50)
);
INSERT INTO Users (Name, Pass) VALUES ('admin', 'S3cret!'), ('asha', 'Asha@1234'), ('ravi', 'Ravi@1234');`,
      starter: "-- TODO: the injected query\nSELECT Id, Name FROM Users WHERE Name = 'nobody';\n",
      solution: "SELECT Id, Name FROM Users WHERE Name = '' OR '1'='1';\n",
      explain: 'Every row matches because `\'1\'=\'1\'` is true for all of them - including the admin account. With a parameter, the whole input `\' OR \'1\'=\'1\' --` would simply be compared as a (non-existing) user name.',
    },
    {
      type: 'code',
      lang: 'js',
      mins: 6,
      q: '**Prevent XSS.** Write `escapeHtml(text)` that replaces `&`, `<`, `>`, `"` and `\'` with `&amp;`, `&lt;`, `&gt;`, `&quot;` and `&#39;` (replace `&` first!).',
      example: { title: 'what Razor does automatically', code: '@Model.Comment   →   &lt;script&gt;...' },
      starter: 'function escapeHtml(text) {\n  // TODO\n}\n',
      solution: 'function escapeHtml(text) {\n  return String(text)\n    .replace(/&/g, "&amp;")\n    .replace(/</g, "&lt;")\n    .replace(/>/g, "&gt;")\n    .replace(/"/g, "&quot;")\n    .replace(/\'/g, "&#39;");\n}\n',
      tests: [
        { call: 'escapeHtml("<script>alert(\'hi\')</script>")', expect: '&lt;script&gt;alert(&#39;hi&#39;)&lt;/script&gt;' },
        { call: 'escapeHtml("Tom & Jerry")', expect: 'Tom &amp; Jerry' },
        { call: 'escapeHtml("<a href=\\"x\\">")', expect: '&lt;a href=&quot;x&quot;&gt;' },
      ],
      explain: 'Encoding turns markup into harmless text. Razor (`@value`) and React (`{value}`) do it for you - XSS appears when you bypass them with `Html.Raw` or `dangerouslySetInnerHTML`. Replacing `&` last would double-encode the other entities.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about CSRF, HTTPS and CORS are TRUE? (choose all that apply)',
      options: [
        'CSRF abuses cookies the browser sends automatically; anti-forgery tokens and SameSite cookies prevent it',
        'An API that uses a Bearer token in the Authorization header (not cookies) is not exposed to classic CSRF',
        'app.UseHsts() tells browsers to use HTTPS only for this site in future',
        'CORS protects the API from attackers using Postman or curl',
        'AllowAnyOrigin() together with credentials is a safe default',
      ],
      answers: [0, 1, 2],
      explain: 'Browsers attach cookies automatically, which CSRF exploits; headers like Authorization are not. CORS only restricts **browsers** - it is not an access control for other clients. Allowing any origin with credentials is rejected by ASP.NET Core because it is unsafe.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which header combination is a sensible security baseline for an ASP.NET Core API in production?',
      options: [
        'HTTPS redirection + HSTS + X-Content-Type-Options: nosniff, and no server stack traces in responses',
        'HTTP only, because HTTPS is slow',
        'Access-Control-Allow-Origin: * on every response',
        'Server: Kestrel 8.0.1 to help debugging',
      ],
      answer: 0,
      explain: 'Force HTTPS, tell browsers to keep using it (HSTS), stop MIME sniffing and reveal as little as possible about the server. Every extra detail (versions, stack traces) helps attackers.',
    },
  ],
};
