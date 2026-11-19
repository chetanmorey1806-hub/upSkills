export default {
  lesson: 'day-068-razor-views-syntax-layouts-partials',
  minutes: 28,
  intro: 'Write Razor markup with @ expressions, code blocks and loops, share a layout with @RenderBody and reuse markup with partial views.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What **text** do the three `<li>` items show when this view renders? Type one line per item.',
      example: { title: 'an explicit Razor expression', code: '<p>Total: @(price * qty)</p>   @* the brackets make it one expression *@' },
      code: `@{
    var marks = new[] { 78, 45, 91 };
}
<ul>
@foreach (var m in marks)
{
    <li>@(m >= 50 ? "Pass" : "Fail") - @m</li>
}
</ul>`,
      expected: `Pass - 78
Fail - 45
Pass - 91`,
      explain: 'The `@foreach` loop emits one `<li>` per mark. A ternary must be wrapped in `@( ... )` (an explicit expression); without the brackets Razor would only take `m` and print the rest as text.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'In `Views/Shared/_Layout.cshtml`, complete the line where each page\'s own content is inserted:\n```\n<main class="container">\n    ______\n</main>\n```',
      example: { title: 'an optional section in the layout', code: '@await RenderSectionAsync("Scripts", required: false)' },
      accept: ['@RenderBody()'],
      caseSensitive: true,
      explain: '`@RenderBody()` is where the view (Index.cshtml, Create.cshtml...) is placed inside the layout. A layout must call it exactly once. Sections (`RenderSectionAsync`) are extra named slots, e.g. for page scripts.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which file makes **every** view use `_Layout.cshtml` without writing `Layout = ...` in each view?',
      options: ['_ViewImports.cshtml', '_ViewStart.cshtml', 'appsettings.json', '_Partial.cshtml'],
      answer: 1,
      explain: '`_ViewStart.cshtml` runs before each view and usually contains `@{ Layout = "_Layout"; }`. `_ViewImports.cshtml` holds shared `@using` and `@addTagHelper` directives.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Razor are TRUE? (choose all that apply)',
      options: [
        '@Model.Name output is HTML-encoded automatically, which protects against XSS',
        '@Html.Raw(value) prints the value without encoding',
        'A partial view name starts with an underscore by convention, e.g. _StudentCard.cshtml',
        '<partial name="_StudentCard" model="s" /> renders a partial view',
        '@* ... *@ comments are sent to the browser',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Razor encodes output by default; `Html.Raw` turns this off (only use it for trusted HTML). Partials are reusable chunks rendered with the `<partial>` tag helper. Razor comments `@* *@` are removed on the server, unlike `<!-- -->` HTML comments.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the line that renders the partial view `_StudentCard` for the current student `s` (tag helper syntax):\n`<______ name="_StudentCard" model="s" />`',
      example: { title: 'the HTML helper alternative', code: '@await Html.PartialAsync("_Menu")' },
      accept: ['partial'],
      caseSensitive: true,
      explain: 'The `<partial>` tag helper renders a partial view with an optional model. Partials have no layout of their own and are ideal for repeated pieces such as cards, table rows and menus.',
    },
    {
      type: 'code',
      lang: 'html',
      mins: 7,
      q: '**The HTML a layout produces.** Write the page structure that `_Layout.cshtml` will output for the Student portal:\n- a `<header>` containing a `<nav>` with 3 links (`<a>`): Home, Students, Courses\n- a `<main>` with an `<h1>` "Students"\n- a `<footer>` with the text "© 2025 UpSkillr"',
      example: { title: 'a nav with links', code: '<nav>\n  <a href="/">Home</a>\n  <a href="/About">About</a>\n</nav>' },
      starter: '<!-- TODO: header/nav, main, footer -->\n',
      solution: '<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/Students">Students</a>\n    <a href="/Courses">Courses</a>\n  </nav>\n</header>\n<main>\n  <h1>Students</h1>\n</main>\n<footer>© 2025 UpSkillr</footer>\n',
      checks: [
        { sel: 'header nav a', count: 3, msg: 'The header needs a <nav> with exactly 3 links' },
        { sel: 'main h1', textEq: 'Students', msg: '<main> needs an <h1> "Students"' },
        { sel: 'footer', text: 'UpSkillr', msg: 'Add a <footer> with "© 2025 UpSkillr"' },
      ],
      explain: 'Everything outside `@RenderBody()` in the layout (header, nav, footer) is the same on every page; only the `<main>` content changes per view. Semantic tags make the shared structure clear for screen readers too.',
    },
  ],
};
