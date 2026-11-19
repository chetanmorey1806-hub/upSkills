export default {
  lesson: 'extra-42-routing-and-areas',
  minutes: 25,
  intro: 'Configure conventional and attribute routing, route constraints and organise large MVC apps with Areas.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: `With the default conventional route below, which **controller.action(id)** handles each URL? Write one per line in the form \`Controller.Action(id)\` (use \`-\` when there is no id):
1. \`/\`
2. \`/Products\`
3. \`/Products/Details/5\``,
      example: { title: 'route template parts', code: `{controller=Home}  → default "Home"
{action=Index}      → default "Index"
{id?}               → optional` },
      code: `app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");`,
      expected: `Home.Index(-)
Products.Index(-)
Products.Details(5)`,
      explain: 'Missing segments take their defaults: `/` → Home/Index; `/Products` → Products/Index. `/Products/Details/5` fills all three, and `id` binds to 5. The `?` makes id optional.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Attribute routing: make this action respond to **GET api/students/{id}** where id must be an integer:
\`[HttpGet("______")]\`
\`public IActionResult Get(int id)\`
(the controller has \`[Route("api/students")]\`)`,
      example: { title: 'constraints', code: `[HttpGet("{code:alpha}")]
[HttpGet("{date:datetime}")]` },
      accept: ['{id:int}'],
      acceptRegex: ['^\\{\\s*id\\s*:\\s*int\\s*\\}$'],
      caseSensitive: true,
      explain: 'The action template is appended to the controller route: `api/students/{id:int}`. The `:int` constraint means `/api/students/abc` does not match this action (404) instead of failing model binding.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`[Route("api/[controller]")]` is placed on `public class OrdersController : ControllerBase`. What URL prefix does it produce?',
      options: ['api/[controller]', 'api/Orders', 'api/OrdersController', 'Orders/api'],
      answer: 1,
      explain: '`[controller]` is a token replaced by the controller name **without** the "Controller" suffix, so the prefix is `api/Orders`. Similarly `[action]` becomes the action name.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Mark a controller as part of the **Admin** area:
\`[______("Admin")]\`
\`public class DashboardController : Controller\``,
      example: { title: 'area route', code: `app.MapControllerRoute(
    name: "areas",
    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");` },
      accept: ['Area'],
      caseSensitive: true,
      explain: '`[Area("Admin")]` ties the controller to the area, and views are looked up in `Areas/Admin/Views/...`. You also need an area route like `{area:exists}/{controller}/{action}` registered **before** the default route.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about routing are TRUE? Select all that apply.',
      options: ['Area routes should be registered before the default route', 'Route constraints like `{id:int}` are meant for input validation of business rules (e.g. id > 0 and exists)', 'Attribute routes and conventional routes can be mixed in one app', '`asp-area`, `asp-controller`, `asp-action` tag helpers generate URLs from routes', 'Route values are case-sensitive by default'],
      answers: [0, 2, 3],
      explain: 'More specific routes (areas) go first. Constraints only disambiguate routes; real validation belongs in the action/model. Mixing routing styles is allowed, tag helpers build links from route values, and matching is case-insensitive.',
    },
    {
      type: 'output',
      mins: 3,
      q: `This API controller is registered. For each request write the **status code**, one per line:
1. \`GET /api/books/7\`
2. \`GET /api/books/seven\`
3. \`GET /api/books/search?title=wings\``,
      example: { title: 'literal segments beat parameters', text: 'A literal segment like `search` has higher priority than a parameter like `{id}`.' },
      code: `[ApiController]
[Route("api/books")]
public class BooksController : ControllerBase
{
    [HttpGet("{id:int}")]
    public IActionResult Get(int id) => id == 7 ? Ok(new { id, title = "Wings of Fire" }) : NotFound();

    [HttpGet("search")]
    public IActionResult Search(string title) => Ok(new[] { title });
}`,
      expected: `200
404
200`,
      explain: 'Book 7 exists → 200. "seven" fails the `:int` constraint, no other route matches → 404. `/api/books/search` matches the literal `search` route and the query string binds `title` → 200.',
    },
  ],
};
