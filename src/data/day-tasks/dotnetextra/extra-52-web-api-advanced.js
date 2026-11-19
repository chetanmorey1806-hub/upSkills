export default {
  lesson: 'extra-52-web-api-advanced',
  minutes: 30,
  intro: 'Return correct status codes, ProblemDetails, validation errors, rate limits and versioned, paged endpoints from ASP.NET Core Web APIs.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: `The controller below uses \`[ApiController]\`. Write the **status code** for each request, one per line:
1. \`POST /api/students\` body \`{"name":"Asha","age":20}\`
2. \`POST /api/students\` body \`{"name":"","age":20}\`
3. \`GET /api/students/99\` (does not exist)
4. \`DELETE /api/students/1\` (exists)`,
      example: { title: 'helper → status', code: `Ok()              200
CreatedAtAction() 201
NoContent()       204
BadRequest()      400
NotFound()        404` },
      code: `public record StudentDto([Required] string Name, [Range(16, 60)] int Age);

[ApiController]
[Route("api/students")]
public class StudentsController : ControllerBase
{
    [HttpPost]
    public IActionResult Create(StudentDto dto) =>
        CreatedAtAction(nameof(Get), new { id = 5 }, dto);

    [HttpGet("{id:int}")]
    public IActionResult Get(int id) => id == 1 ? Ok() : NotFound();

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id) => id == 1 ? NoContent() : NotFound();
}`,
      expected: `201
400
404
204`,
      explain: 'A valid body creates the resource → 201 with a Location header. An empty name fails `[Required]`; `[ApiController]` automatically returns **400** with a ValidationProblemDetails body before the action runs. Missing id → 404. A successful delete with no body → 204 No Content.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Return standard RFC 7807 error responses (ProblemDetails) for unhandled errors and empty error status codes. Complete the service registration:
\`builder.Services.______();\``,
      example: { title: 'returning one yourself', code: 'return Problem(title: "Out of stock", statusCode: 409);' },
      accept: ['AddProblemDetails'],
      caseSensitive: true,
      explain: '`AddProblemDetails()` (with `UseExceptionHandler()` and `UseStatusCodePages()`) makes errors return `application/problem+json` with `type`, `title`, `status` and `traceId`, so clients can handle every error the same way.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A fixed-window rate limiter allows **3 requests per minute** and has no queue. A client sends 5 requests within 10 seconds. Write the status code of each response, one per line.',
      example: { title: 'rate limiting setup', code: `builder.Services.AddRateLimiter(o => o.AddFixedWindowLimiter("api", w => { ... }));
app.UseRateLimiter();
app.MapGet("/quotes", GetQuotes).RequireRateLimiting("api");` },
      code: `builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("api", w =>
    {
        w.PermitLimit = 3;
        w.Window = TimeSpan.FromMinutes(1);
        w.QueueLimit = 0;
    });
});`,
      expected: `200
200
200
429
429`,
      explain: 'The first 3 requests use the window\'s permits. With `QueueLimit = 0` extra requests are rejected immediately with the configured **429 Too Many Requests** (the default rejection code would be 503, which is why it is set explicitly). The counter resets when the 1-minute window ends.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Which are good practices for a public REST API? Select all that apply.',
      options: ['Paginate large lists (e.g. `?page=2&pageSize=20`) and return total count metadata', 'Version the API (`/api/v1/...` or a header) before breaking changes', 'Return 200 with `{ "error": "not found" }` for missing resources', 'Use `[ProducesResponseType]` so Swagger/OpenAPI documents possible responses', 'Return EF entities directly, including navigation properties and password hashes'],
      answers: [0, 1, 3],
      explain: 'Paging protects the server, versioning protects existing clients, and documenting response types helps consumers. Use proper status codes (404, not 200 with an error), and return DTOs instead of entities to avoid leaking data and cycles.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `After creating an order, return **201** with a \`Location\` header pointing to the \`GetById\` action:
\`return ______(nameof(GetById), new { id = order.Id }, order);\``,
      example: { title: 'minimal API equivalent', code: 'return TypedResults.Created($"/orders/{order.Id}", order);' },
      accept: ['CreatedAtAction'],
      caseSensitive: true,
      explain: '`CreatedAtAction(actionName, routeValues, body)` produces 201 Created and builds the Location URL (e.g. `/api/orders/12`) from the route of the named action, so the client knows where the new resource lives.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A client sends `PUT /api/products/5` but the body\'s `id` is 7. What is the most appropriate response?',
      options: ['200 and update product 7', '400 Bad Request (route id and body id do not match)', '201 Created', '500 Internal Server Error'],
      answer: 1,
      explain: 'Conflicting identifiers are a client error, so return 400 (often as ProblemDetails). Silently updating a different product than the URL says is a dangerous bug.',
    },
  ],
};
