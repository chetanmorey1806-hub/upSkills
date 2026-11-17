export default {
  id: "day-065-http-protocol-request-response",
  title: "HTTP Protocol, Request, Response, HTTP Methods and Status Codes",
  module: "Module 6: ASP.NET Core & .NET Web Development",
  day: 65,
  level: "Beginner",
  duration: "2 hours",
  summary:
    "Understand what really happens when a browser talks to an ASP.NET Core app. Learn the structure of an HTTP request and response, the methods GET, POST, PUT, PATCH and DELETE, headers, query strings, request bodies and the most important status codes, and see them live in browser DevTools, Postman and HttpContext.",
  objectives: [
    "Describe the HTTP request/response cycle and the parts of a request (method, URL, headers, body) and response (status line, headers, body)",
    "Choose the correct HTTP method (GET, POST, PUT, PATCH, DELETE) and know which are safe and idempotent",
    "Recognise status code families 1xx-5xx and common codes 200, 201, 204, 301, 302, 400, 401, 403, 404, 500",
    "Read request data and write responses using HttpContext.Request and HttpContext.Response in ASP.NET Core",
    "Inspect requests with browser DevTools (F12 > Network), Postman and the .http file in Visual Studio",
  ],
  theory: [
    {
      heading: "HTTP basics: a request/response protocol",
      content:
        "HTTP (HyperText Transfer Protocol) is the language browsers and servers use. The client (browser, Postman, mobile app, React app) sends a REQUEST; the server (Kestrel running your app) sends back one RESPONSE. HTTP is stateless: the server does not remember previous requests by itself, so cookies, sessions and tokens are used to remember users (Day 75, Day 94). HTTPS is HTTP encrypted with TLS, using port 443 by default (HTTP uses 80).",
      syntax: `URL anatomy
https://localhost:7086/Student/Details/5?tab=marks#top
\\___/   \\_______/ \\__/ \\_______________/ \\_______/ \\__/
scheme    host    port       path          query   fragment (never sent to server)`,
      points: [
        "Typing a URL and pressing Enter sends a GET request",
        "Each image, CSS and JS file on the page is a separate GET request",
        "Submitting a <form method=\"post\"> sends a POST request with the form fields in the body",
        "JavaScript (fetch/axios) can send any method: GET, POST, PUT, PATCH, DELETE",
      ],
    },
    {
      heading: "Structure of a request and a response",
      content:
        "A request has a request line (method, path, version), headers (key: value pairs) and an optional body. A response has a status line (version, status code, reason phrase), headers and an optional body (HTML, JSON, image bytes). Important headers: Host, User-Agent, Accept, Content-Type, Content-Length, Cookie / Set-Cookie, Authorization, Location, Cache-Control.",
      syntax: `--- REQUEST ---------------------------------
POST /Student/Register HTTP/1.1
Host: localhost:7086
Content-Type: application/x-www-form-urlencoded
Content-Length: 27
Cookie: .AspNetCore.Antiforgery.xyz=...

Name=Riya&Email=riya%40mail.com

--- RESPONSE --------------------------------
HTTP/1.1 302 Found
Location: /Student/Success
Date: Tue, 17 Nov 2026 10:00:00 GMT
Server: Kestrel
Content-Length: 0`,
    },
    {
      heading: "HTTP methods (verbs)",
      content:
        "The method tells the server what you want to do with the resource. Safe methods do not change data; idempotent methods give the same result when repeated (calling DELETE /students/5 twice still leaves student 5 deleted).",
      points: [
        "GET – read data (page, list, details). Safe and idempotent. Data goes in the URL/query string; no body. Can be bookmarked and cached",
        "POST – create new data or submit a form. Not safe, not idempotent (posting twice creates two records). Data goes in the body",
        "PUT – replace a whole resource (update all fields of student 5). Idempotent",
        "PATCH – partially update a resource (change only the email). Not guaranteed idempotent",
        "DELETE – remove a resource. Idempotent",
        "HEAD (headers only) and OPTIONS (which methods are allowed; used by CORS preflight) are also common",
        "HTML forms only support GET and POST; PUT/PATCH/DELETE are used from JavaScript and APIs (Module 8)",
      ],
      tip: "CRUD mapping: Create = POST, Read = GET, Update = PUT/PATCH, Delete = DELETE.",
    },
    {
      heading: "Status codes",
      content:
        "The 3-digit status code tells the client what happened. Memorise the families and the common codes; ASP.NET Core helper methods return them for you (Ok(), Created(), NoContent(), BadRequest(), NotFound(), Unauthorized(), Forbid(), Redirect()).",
      syntax: `1xx Informational  100 Continue, 101 Switching Protocols (WebSockets)
2xx Success        200 OK, 201 Created, 204 No Content
3xx Redirection    301 Moved Permanently, 302 Found, 304 Not Modified, 307/308 Temporary/Permanent Redirect
4xx Client error   400 Bad Request, 401 Unauthorized (not logged in), 403 Forbidden (no permission),
                   404 Not Found, 405 Method Not Allowed, 409 Conflict, 415 Unsupported Media Type, 422, 429 Too Many Requests
5xx Server error   500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable, 504 Gateway Timeout`,
      tip: "401 means 'who are you?' (authentication missing); 403 means 'I know who you are, but you are not allowed'.",
    },
    {
      heading: "HttpContext, HttpRequest and HttpResponse in ASP.NET Core",
      content:
        "For every request Kestrel creates an HttpContext object. In middleware and Minimal APIs you receive it directly; in controllers use the HttpContext, Request and Response properties. Request gives Method, Path, Query, Headers, Cookies, Form and Body. Response lets you set StatusCode, Headers, ContentType and write the body.",
      syntax: `string method = context.Request.Method;            // "GET"
string path = context.Request.Path;                // "/Student/Details/5"
string? tab = context.Request.Query["tab"];        // "marks"
string agent = context.Request.Headers.UserAgent.ToString();
context.Response.StatusCode = 404;
context.Response.ContentType = "text/html";
await context.Response.WriteAsync("<h1>Not found</h1>");`,
    },
    {
      heading: "Tools to see HTTP traffic",
      content:
        "Browser DevTools: press F12 > Network tab, reload (F5), click any request to see Headers, Payload, Response and Timing; tick 'Preserve log' to keep requests across redirects. Postman: choose the method, type the URL, add headers and a raw JSON body, click Send and see status, time and body. Visual Studio .http files: Add > New Item > HTTP File and click 'Send request' above each request. curl: curl -i https://localhost:7086/ -k prints the response headers too.",
    },
  ],
  examples: [
    {
      title: "Inspect a request with HttpContext",
      scenario: "Build an endpoint that echoes back everything the browser sent so students can 'see' a request.",
      steps: [
        "File > New > Project > ASP.NET Core Empty, name HttpDemo, .NET 10, click Create",
        "Replace Program.cs with the code",
        "Press Ctrl+F5 and open /inspect?name=Riya&city=Pune",
        "Press F12 > Network, reload, click 'inspect' and compare Request Headers with what the page prints",
        "CLI alternative: dotnet new web -n HttpDemo; dotnet run; curl -i \"http://localhost:5094/inspect?name=Riya&city=Pune\"",
      ],
      code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/inspect", (HttpContext context) =>
{
    var req = context.Request;
    var lines = new List<string>
    {
        $"Method: {req.Method}",
        $"Scheme: {req.Scheme}",
        $"Host: {req.Host}",
        $"Path: {req.Path}",
        $"QueryString: {req.QueryString}",
        $"name = {req.Query["name"]}",
        $"city = {req.Query["city"]}",
        $"Accept: {req.Headers.Accept}"
    };
    context.Response.Headers["X-Demo"] = "Day65";
    return string.Join("\\n", lines);
});

app.Run();`,
      result: `Browser http://localhost:5094/inspect?name=Riya&city=Pune shows:
Method: GET
Scheme: http
Host: localhost:5094
Path: /inspect
QueryString: ?name=Riya&city=Pune
name = Riya
city = Pune
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,...  (depends on the browser)

DevTools > Network > inspect > Response Headers include:
content-type: text/plain; charset=utf-8
server: Kestrel
x-demo: Day65
Status Code: 200 OK`,
      explanation:
        "HttpContext is injected into the Minimal API lambda. Query values are read with Request.Query[\"key\"]. Returning a string makes ASP.NET Core send 200 OK with text/plain. The custom X-Demo header is visible in DevTools.",
    },
    {
      title: "GET, POST, PUT, PATCH, DELETE and status codes with an in-memory list",
      scenario: "Implement a tiny students resource that uses every HTTP method and returns the correct status code, then test it with a .http file / Postman.",
      steps: [
        "In the HttpDemo project replace Program.cs with the code below",
        "Right-click project > Add > New Item > search 'HTTP File' > name students.http and paste the requests",
        "Press Ctrl+F5, then in students.http click 'Send request' above each request (or use Postman)",
        "CLI alternative: dotnet run, then curl -i -X POST http://localhost:5094/students -H \"Content-Type: application/json\" -d \"{\\\"name\\\":\\\"Aman\\\",\\\"marks\\\":72}\"",
      ],
      code: `// Program.cs
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

var students = new List<Student>
{
    new Student { Id = 1, Name = "Riya", Marks = 88 },
    new Student { Id = 2, Name = "Karan", Marks = 64 }
};
int nextId = 3;

app.MapGet("/students", () => Results.Ok(students));                       // 200

app.MapGet("/students/{id:int}", (int id) =>
{
    var s = students.FirstOrDefault(x => x.Id == id);
    return s is null ? Results.NotFound() : Results.Ok(s);                   // 404 / 200
});

app.MapPost("/students", (Student s) =>
{
    if (string.IsNullOrWhiteSpace(s.Name)) return Results.BadRequest("Name is required"); // 400
    s.Id = nextId++;
    students.Add(s);
    return Results.Created($"/students/{s.Id}", s);                          // 201 + Location
});

app.MapPut("/students/{id:int}", (int id, Student input) =>
{
    var s = students.FirstOrDefault(x => x.Id == id);
    if (s is null) return Results.NotFound();
    s.Name = input.Name;
    s.Marks = input.Marks;
    return Results.NoContent();                                             // 204
});

app.MapPatch("/students/{id:int}/marks", (int id, int marks) =>
{
    var s = students.FirstOrDefault(x => x.Id == id);
    if (s is null) return Results.NotFound();
    s.Marks = marks;                                                        // only one field
    return Results.Ok(s);
});

app.MapDelete("/students/{id:int}", (int id) =>
{
    int removed = students.RemoveAll(x => x.Id == id);
    return removed == 0 ? Results.NotFound() : Results.NoContent();
});

app.Run();

public class Student
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public int Marks { get; set; }
}

### students.http
@host = http://localhost:5094

GET {{host}}/students

###
POST {{host}}/students
Content-Type: application/json

{ "name": "Aman", "marks": 72 }

###
PUT {{host}}/students/1
Content-Type: application/json

{ "name": "Riya Sharma", "marks": 91 }

###
PATCH {{host}}/students/2/marks?marks=70

###
DELETE {{host}}/students/2

###
GET {{host}}/students/99`,
      result: `GET /students            -> 200 OK
[{"id":1,"name":"Riya","marks":88},{"id":2,"name":"Karan","marks":64}]

POST /students           -> 201 Created
Location: /students/3
{"id":3,"name":"Aman","marks":72}

PUT /students/1          -> 204 No Content   (empty body)

PATCH /students/2/marks?marks=70 -> 200 OK
{"id":2,"name":"Karan","marks":70}

DELETE /students/2       -> 204 No Content

GET /students/99         -> 404 Not Found

POST with {"name":"","marks":50} -> 400 Bad Request  "Name is required"`,
      explanation:
        "Each Map method matches one HTTP verb. The JSON body is bound to the Student parameter automatically and serialized back in camelCase. Results.Created sets 201 and the Location header, NoContent gives 204 with no body, NotFound gives 404. Sending PUT to /students (no id) gives 405 Method Not Allowed because no PUT endpoint matches that path. The list lives in memory, so restarting the app resets it.",
    },
    {
      title: "GET vs POST forms in an MVC controller (Post/Redirect/Get)",
      scenario: "Build a search form (GET) and a feedback form (POST), and see how data travels in the URL vs the body, and why we redirect after POST.",
      steps: [
        "File > New > Project > ASP.NET Core Web App (Model-View-Controller), name HttpForms",
        "Right-click Controllers > Add > Controller > MVC Controller - Empty > FormsController.cs",
        "Right-click Views > Add > New Folder 'Forms'; add Razor Views Index.cshtml and Thanks.cshtml",
        "Press Ctrl+F5, open /Forms, try both forms with F12 > Network open (tick Preserve log)",
        "CLI alternative: dotnet new mvc -n HttpForms; create the files; dotnet watch",
      ],
      code: `// Controllers/FormsController.cs
using Microsoft.AspNetCore.Mvc;

namespace HttpForms.Controllers;

public class FormsController : Controller
{
    // GET /Forms  or  GET /Forms?q=asp
    [HttpGet]
    public IActionResult Index(string? q)
    {
        ViewBag.Query = q;
        return View();
    }

    // POST /Forms/Feedback
    [HttpPost]
    [ValidateAntiForgeryToken]
    public IActionResult Feedback(string name, string message)
    {
        TempData["Msg"] = $"Thanks {name}, we received {message.Length} characters.";
        return RedirectToAction("Thanks");          // 302 -> GET /Forms/Thanks
    }

    public IActionResult Thanks() => View();
}

@* Views/Forms/Index.cshtml *@
@{ ViewData["Title"] = "HTTP Forms"; }
<h3>Search (GET)</h3>
<form method="get" action="/Forms">
    <input name="q" value="@ViewBag.Query" class="form-control mb-2" />
    <button class="btn btn-secondary">Search</button>
</form>
@if (ViewBag.Query != null)
{
    <p class="mt-2">You searched for: <b>@ViewBag.Query</b></p>
}

<h3 class="mt-4">Feedback (POST)</h3>
<form method="post" asp-action="Feedback">
    <input name="name" placeholder="Name" class="form-control mb-2" />
    <textarea name="message" placeholder="Message" class="form-control mb-2"></textarea>
    <button class="btn btn-primary">Send</button>
</form>

@* Views/Forms/Thanks.cshtml *@
@{ ViewData["Title"] = "Thanks"; }
<div class="alert alert-success">@TempData["Msg"]</div>
<a href="/Forms">Back</a>`,
      result: `Search "asp" -> address bar becomes /Forms?q=asp, page shows "You searched for: asp".
Network tab: GET /Forms?q=asp  200

Feedback name=Riya, message=Great course ->
Network tab:
  POST /Forms/Feedback   302 Found   (Payload: __RequestVerificationToken=..., name=Riya, message=Great course)
  GET  /Forms/Thanks     200 OK
Page shows a green box: "Thanks Riya, we received 12 characters."
Pressing F5 on the Thanks page does NOT resend the POST (no "Confirm Form Resubmission" dialog).`,
      explanation:
        "GET puts form fields in the query string (visible, bookmarkable, good for search). POST puts them in the body (good for creating data). The asp-action tag helper adds the anti-forgery token. Redirecting after a successful POST (Post/Redirect/Get pattern) prevents duplicate submissions on refresh. 'Great course' has 12 characters.",
    },
    {
      title: "Console demo: parse a raw HTTP request and classify status codes",
      scenario: "Read a raw HTTP request text the way Kestrel does (simplified) and print its parts, then classify some status codes.",
      steps: [
        "File > New > Project > Console App, name HttpParser",
        "Replace Program.cs with the code",
        "Press Ctrl+F5",
      ],
      code: `using System;
using System.Collections.Generic;

string raw =
    "POST /students?page=2 HTTP/1.1\\n" +
    "Host: localhost:5094\\n" +
    "Content-Type: application/json\\n" +
    "Content-Length: 30\\n" +
    "\\n" +
    "{\\"name\\":\\"Aman\\",\\"marks\\":72}";

string[] parts = raw.Split("\\n\\n");
string[] headLines = parts[0].Split('\\n');
string body = parts.Length > 1 ? parts[1] : "";

string[] requestLine = headLines[0].Split(' ');
string method = requestLine[0];
string target = requestLine[1];
string version = requestLine[2];

string path = target.Contains('?') ? target.Substring(0, target.IndexOf('?')) : target;
string query = target.Contains('?') ? target.Substring(target.IndexOf('?') + 1) : "";

Console.WriteLine($"Method : {method}");
Console.WriteLine($"Path   : {path}");
Console.WriteLine($"Query  : {query}");
Console.WriteLine($"Version: {version}");

for (int i = 1; i < headLines.Length; i++)
{
    int colon = headLines[i].IndexOf(':');
    string name = headLines[i].Substring(0, colon);
    string value = headLines[i].Substring(colon + 1).Trim();
    Console.WriteLine($"Header {name} = {value}");
}
Console.WriteLine($"Body   : {body}");
Console.WriteLine($"Body length: {body.Length}");

int[] codes = { 200, 201, 302, 404, 500 };
foreach (int code in codes)
{
    string family = (code / 100) switch
    {
        1 => "Informational",
        2 => "Success",
        3 => "Redirection",
        4 => "Client Error",
        5 => "Server Error",
        _ => "Unknown"
    };
    Console.WriteLine($"{code} -> {family}");
}`,
      csharp: {
        files: {
          "Program.cs": `using System;
using System.Collections.Generic;

string raw =
    "POST /students?page=2 HTTP/1.1\\n" +
    "Host: localhost:5094\\n" +
    "Content-Type: application/json\\n" +
    "Content-Length: 30\\n" +
    "\\n" +
    "{\\"name\\":\\"Aman\\",\\"marks\\":72}";

string[] parts = raw.Split("\\n\\n");
string[] headLines = parts[0].Split('\\n');
string body = parts.Length > 1 ? parts[1] : "";

string[] requestLine = headLines[0].Split(' ');
string method = requestLine[0];
string target = requestLine[1];
string version = requestLine[2];

string path = target.Contains('?') ? target.Substring(0, target.IndexOf('?')) : target;
string query = target.Contains('?') ? target.Substring(target.IndexOf('?') + 1) : "";

Console.WriteLine($"Method : {method}");
Console.WriteLine($"Path   : {path}");
Console.WriteLine($"Query  : {query}");
Console.WriteLine($"Version: {version}");

for (int i = 1; i < headLines.Length; i++)
{
    int colon = headLines[i].IndexOf(':');
    string name = headLines[i].Substring(0, colon);
    string value = headLines[i].Substring(colon + 1).Trim();
    Console.WriteLine($"Header {name} = {value}");
}
Console.WriteLine($"Body   : {body}");
Console.WriteLine($"Body length: {body.Length}");

int[] codes = { 200, 201, 302, 404, 500 };
foreach (int code in codes)
{
    string family = (code / 100) switch
    {
        1 => "Informational",
        2 => "Success",
        3 => "Redirection",
        4 => "Client Error",
        5 => "Server Error",
        _ => "Unknown"
    };
    Console.WriteLine($"{code} -> {family}");
}
`,
        },
        stdin: "",
      },
      result: `Method : POST
Path   : /students
Query  : page=2
Version: HTTP/1.1
Header Host = localhost:5094
Header Content-Type = application/json
Header Content-Length = 30
Body   : {"name":"Aman","marks":72}
Body length: 26
200 -> Success
201 -> Success
302 -> Redirection
404 -> Client Error
500 -> Server Error`,
      explanation:
        "A blank line separates headers from the body. The first line holds method, target and version; each header is 'Name: value'. Note the declared Content-Length (30) does not match the real body length (26) – a real server would wait for 4 more bytes, which is why Content-Length must be correct; frameworks calculate it for you. Integer division code / 100 gives the status family.",
    },
  ],
  interview: [
    { q: "What is HTTP and why is it called stateless?", a: "HTTP is the request/response protocol of the web. It is stateless because each request is independent; the server does not remember previous requests unless we add state with cookies, sessions or tokens.", level: "Easy" },
    { q: "Difference between GET and POST?", a: "GET reads data, sends parameters in the URL, has no body, can be cached/bookmarked and is safe and idempotent. POST sends data in the body, is used to create/submit data, is not idempotent and is not cached.", level: "Easy" },
    { q: "Difference between PUT and PATCH?", a: "PUT replaces the entire resource with the sent representation (idempotent). PATCH applies a partial update to some fields only.", level: "Medium" },
    { q: "What does idempotent mean? Which methods are idempotent?", a: "Repeating the same request has the same effect on the server as sending it once. GET, HEAD, PUT, DELETE, OPTIONS are idempotent; POST is not; PATCH is not guaranteed.", level: "Medium" },
    { q: "Difference between 401 and 403?", a: "401 Unauthorized: the client is not authenticated (no or invalid credentials). 403 Forbidden: the client is authenticated but not allowed to access the resource.", level: "Medium" },
    { q: "When do you return 201, 204 and 404?", a: "201 Created after successfully creating a resource (with a Location header); 204 No Content after a successful update/delete with nothing to return; 404 Not Found when the requested resource or route does not exist.", level: "Easy" },
    { q: "Difference between 301 and 302?", a: "301 Moved Permanently: browsers and search engines remember the new URL. 302 Found: temporary redirect, used after form posts (RedirectToAction returns 302).", level: "Medium" },
    { q: "What is the Post/Redirect/Get pattern?", a: "After processing a POST successfully, redirect (302) to a GET page. Refreshing then repeats the harmless GET instead of resubmitting the POST, preventing duplicate records.", level: "Medium" },
    { q: "What is the Content-Type header? Give examples.", a: "It describes the format of the body: text/html, text/plain, application/json, application/x-www-form-urlencoded (normal forms), multipart/form-data (file uploads).", level: "Easy" },
    { q: "How do you read a query string value in ASP.NET Core?", a: "context.Request.Query[\"name\"] in middleware/Minimal APIs, Request.Query[\"name\"] in a controller, or simply declare an action parameter named name so model binding fills it.", level: "Easy" },
    { q: "Which status code does ASP.NET Core return when the URL matches but the HTTP method does not?", a: "405 Method Not Allowed.", level: "Hard" },
    { q: "Output? int code = 404; Console.WriteLine(code / 100 == 4 ? \"Client\" : \"Other\");", a: "Client — integer division 404 / 100 = 4.", level: "Easy" },
  ],
  practice: [
    {
      task: "Open any website, press F12 > Network and reload. Write down the method, status code, Content-Type and size of the first document request and of one CSS file.",
      hint: "Click the request row and look at Headers > General and Response Headers.",
      solution: `Example:
Document: GET /  200  content-type: text/html; charset=utf-8
CSS:      GET /css/site.css  200 (or 304 Not Modified from cache)  content-type: text/css`,
    },
    {
      task: "Add a Minimal API endpoint GET /status/{code:int} that returns an empty response with the given status code, and test 200, 404 and 500 in the browser.",
      hint: "Results.StatusCode(code).",
      solution: `app.MapGet("/status/{code:int}", (int code) => Results.StatusCode(code));
// /status/404 -> browser shows its own 'This page can't be found' / blank page with 404 in DevTools`,
    },
    {
      task: "Write a middleware that returns 503 Service Unavailable with the text 'Maintenance' when appsettings.json has \"Maintenance\": true.",
      hint: "Read app.Configuration and short-circuit before next.",
      solution: `app.Use(async (context, next) =>
{
    if (app.Configuration.GetValue<bool>("Maintenance"))
    {
        context.Response.StatusCode = 503;
        await context.Response.WriteAsync("Maintenance");
        return;
    }
    await next(context);
});`,
    },
    {
      task: "Using Postman, call the students API from Example 2: create a student, update it with PUT, change marks with PATCH, delete it and confirm a final GET returns 404.",
      hint: "Body > raw > JSON for POST/PUT.",
      solution: `POST   /students        {"name":"Neha","marks":80}  -> 201, Location /students/3
PUT    /students/3      {"name":"Neha K","marks":85} -> 204
PATCH  /students/3/marks?marks=90                   -> 200 {"id":3,"name":"Neha K","marks":90}
DELETE /students/3                                  -> 204
GET    /students/3                                  -> 404`,
    },
    {
      task: "Write a C# console method Describe(int code) that returns the reason phrase for 200, 201, 204, 400, 401, 403, 404, 500 and 'Unknown' otherwise.",
      hint: "Use a switch expression.",
      solution: `static string Describe(int code) => code switch
{
    200 => "OK", 201 => "Created", 204 => "No Content",
    400 => "Bad Request", 401 => "Unauthorized", 403 => "Forbidden",
    404 => "Not Found", 500 => "Internal Server Error",
    _ => "Unknown"
};
Console.WriteLine(Describe(403)); // Forbidden`,
    },
  ],
  quiz: [
    { question: "Which method should be used to partially update a student's email only?", options: ["GET", "PUT", "PATCH", "POST"], answer: 2, explanation: "PATCH applies a partial update." },
    { question: "Which status code means 'created successfully'?", options: ["201", "200", "204", "302"], answer: 0, explanation: "201 Created, usually with a Location header." },
    { question: "Where are GET form fields sent?", options: ["In the request body", "In a cookie", "In the response headers", "In the URL query string"], answer: 3, explanation: "GET appends fields to the URL after '?'." },
    { question: "A logged-in user without the Admin role opens an admin page. Best status code?", options: ["401", "403", "404", "500"], answer: 1, explanation: "403 Forbidden: authenticated but not authorised." },
    { question: "Which is NOT idempotent?", options: ["GET", "PUT", "POST", "DELETE"], answer: 2, explanation: "Posting twice can create two records." },
  ],
};
