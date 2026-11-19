export default {
  lesson: 'extra-46-localization',
  minutes: 25,
  intro: 'Serve the app in several languages with resource files, IStringLocalizer and request culture, and format numbers per culture.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: `Register localization and tell it the .resx files are in the \`Resources\` folder:
\`builder.Services.______(options => options.ResourcesPath = "Resources");\``,
      example: { title: 'views and data annotations too', code: `builder.Services.AddControllersWithViews()
    .AddViewLocalization()
    .AddDataAnnotationsLocalization();` },
      accept: ['AddLocalization'],
      caseSensitive: true,
      explain: '`AddLocalization` registers `IStringLocalizer<T>` and sets where resource files are searched. Without `ResourcesPath`, .resx files are expected next to the classes.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (.NET with ICU culture data)',
      example: { title: 'culture-aware formatting', code: `var amt = 2500.5m;
amt.ToString("N2", new CultureInfo("en-US"));   // 2,500.50` },
      code: `using System.Globalization;

double amount = 1234567.5;
var us = new CultureInfo("en-US");
var india = new CultureInfo("en-IN");
var germany = new CultureInfo("de-DE");

Console.WriteLine(amount.ToString("N2", us));
Console.WriteLine(amount.ToString("N2", india));
Console.WriteLine(amount.ToString("N2", germany));
Console.WriteLine(new DateTime(2024, 8, 15).ToString("d", us));
Console.WriteLine(new DateTime(2024, 8, 15).ToString("d", germany));`,
      expected: `1,234,567.50
12,34,567.50
1.234.567,50
8/15/2024
15.08.2024`,
      explain: 'The same number is formatted differently per culture: US groups by thousands, India uses lakh/crore grouping (12,34,567), Germany swaps the separators. The short date pattern "d" is month-first in the US and day.month.year in Germany. Always format with the user\'s culture, never by hand.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inject a localizer into \`HomeController\` and read the text for key "Welcome":
\`public HomeController(______ localizer) { _localizer = localizer; }\`
\`ViewData["Msg"] = _localizer["Welcome"];\``,
      example: { title: 'in a Razor view', code: `@inject IViewLocalizer Localizer
<h1>@Localizer["Title"]</h1>` },
      accept: ['IStringLocalizer<HomeController>'],
      acceptRegex: ['^IStringLocalizer\\s*<\\s*HomeController\\s*>$'],
      caseSensitive: true,
      explain: '`IStringLocalizer<HomeController>` looks up keys in `Resources/Controllers.HomeController.<culture>.resx`. If a key is missing, it returns the key itself ("Welcome"), so the page never crashes.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The user\'s culture is `hi-IN`. Resource files exist for `hi` and for the default (neutral) language only. Which one is used?',
      options: ['An error is thrown', '`hi` (parent culture fallback), then the default if a key is missing', 'Always the default file', 'The browser translates it'],
      answer: 1,
      explain: 'Resource lookup falls back from specific to parent culture: hi-IN → hi → invariant/default. So you can write one Hindi file for all Hindi regions.',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'With `app.UseRequestLocalization(...)`, which sources can set the request culture by default? Select all that apply.',
      options: ['Query string `?culture=mr-IN&ui-culture=mr-IN`', 'The `.AspNetCore.Culture` cookie', 'The browser\'s `Accept-Language` header', 'The server\'s Windows region setting is always used first', 'The user\'s IP address'],
      answers: [0, 1, 2],
      explain: 'The default providers are QueryString, Cookie and Accept-Language, checked in that order; the first one with a supported culture wins, otherwise `DefaultRequestCulture` is used. IP-based detection is not built in.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `Culture` and `UICulture`?',
      options: ['They are identical', '`Culture` controls formatting of dates, numbers and currency; `UICulture` controls which resource (translated text) files are used', '`UICulture` formats numbers', '`Culture` is only for right-to-left languages'],
      answer: 1,
      explain: 'You can show English text (UICulture en) with Indian number formats (Culture en-IN). Most apps set both to the same value.',
    },
  ],
};
