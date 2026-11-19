export default {
  lesson: 'day-069-razor-pages-viewdata-viewbag-tempdata',
  minutes: 25,
  intro: 'Pass data from controllers and Razor Pages to views with ViewData, ViewBag, TempData and strongly typed @model views.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'After `Create` saves a student it does `TempData["Msg"] = "Saved!"; return RedirectToAction("Index");`. Why TempData and not ViewBag?',
      options: ['ViewBag is slower', 'TempData survives the redirect to the next request; ViewBag is lost when the request ends', 'ViewBag cannot hold strings', 'TempData is strongly typed'],
      answer: 1,
      explain: 'ViewData/ViewBag live only for the **current** request. A redirect starts a new request, so the message must travel in **TempData** (stored in a cookie or session) and is deleted after it is read.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does `<h1>` show when this action\'s view renders `<h1>@ViewData["Title"]</h1>`?',
      example: { title: 'ViewBag is a dynamic wrapper', code: 'ViewBag.City = "Pune";\n// ViewData["City"] is now "Pune" too' },
      code: `public IActionResult Index()
{
    ViewData["Title"] = "Students";
    ViewBag.Title = "All Students";
    return View();
}`,
      expected: 'All Students',
      explain: '`ViewBag` is just a **dynamic view of the same ViewData dictionary**, so `ViewBag.Title` overwrites `ViewData["Title"]`. Mixing both for the same key is a common source of confusing bugs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Make this view **strongly typed** so `@Model.Name` gets IntelliSense and compile-time checking. Complete the first line:\n`______ UpSkillr.Models.Student`',
      example: { title: 'a list model', code: '@model IEnumerable<UpSkillr.Models.Course>' },
      accept: ['@model'],
      caseSensitive: true,
      explain: '`@model` (lowercase) declares the type; inside the view you use `Model` (uppercase) to access it. The controller passes it with `return View(student);`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Razor Pages are TRUE? (choose all that apply)',
      options: [
        'A Razor Page is a .cshtml file with an @page directive and a PageModel class (.cshtml.cs)',
        'OnGet runs for GET requests and OnPost for form posts',
        '[BindProperty] binds posted form fields to a PageModel property',
        'Razor Pages need a controller for every page',
        'Pages/Students/Edit.cshtml is reachable at /Students/Edit by default',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Razor Pages are **page-focused**: the URL follows the folder path, the PageModel holds handlers (OnGet, OnPost, OnPostDelete...) and `[BindProperty]` replaces action parameters. There are no controllers.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In the PageModel, complete the handler method name that runs when the form on the page is **posted**:\n`public IActionResult ______() { ... }`',
      example: { title: 'the GET handler', code: 'public void OnGet() { Students = _db.Students.ToList(); }' },
      accept: ['OnPost', 'OnPostAsync'],
      caseSensitive: true,
      explain: 'Handlers are found by name: `OnGet`, `OnPost` (or `OnPostAsync` with `Task<IActionResult>`). Named handlers such as `OnPostDelete` are selected with `asp-page-handler="Delete"`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'TempData is read **once per request**. Request 1 sets the message and redirects; request 2 shows Index; then the user presses F5 (request 3). What does `@(TempData["Msg"] ?? "none")` print in request 2 and request 3? One per line.',
      example: { title: 'Keep and Peek', code: 'TempData.Peek("Msg");   // read without deleting\nTempData.Keep("Msg");   // keep for one more request' },
      code: `// Request 1 - POST Create
TempData["Msg"] = "Student saved";
return RedirectToAction("Index");

// Request 2 and 3 - GET Index view
<p>@(TempData["Msg"] ?? "none")</p>`,
      expected: `Student saved
none`,
      explain: 'Reading TempData marks the key for deletion at the end of that request, so the success message shows once (request 2) and is gone on refresh (request 3). Use `Peek` or `Keep` when you need it again.',
    },
  ],
};
