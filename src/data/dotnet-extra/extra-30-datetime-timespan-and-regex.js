const steps = (name) => [
  'In Visual Studio: File > New > Project > Console App (C#), click Next',
  `Name it ${name}, choose .NET 10 (or .NET 8) as the framework, click Create`,
  'Replace all the code in Program.cs with the code below',
  'Press Ctrl+F5 to run without debugging and read the console output',
];

const ex1 = `using System.Globalization;

var inv = CultureInfo.InvariantCulture;     // same output on every machine

// A fixed date so the output is predictable (use DateTime.Now / Today in real apps)
var joinDate = new DateTime(2026, 1, 15, 9, 30, 0);
Console.WriteLine(joinDate.ToString("yyyy-MM-dd HH:mm", inv));
Console.WriteLine(joinDate.ToString("dd MMM yyyy", inv));
Console.WriteLine(joinDate.ToString("dddd, hh:mm tt", inv));
Console.WriteLine($"Year={joinDate.Year} Month={joinDate.Month} Day={joinDate.Day} DayOfYear={joinDate.DayOfYear}");

// Date arithmetic returns NEW DateTime values (DateTime is immutable)
Console.WriteLine(joinDate.AddDays(45).ToString("yyyy-MM-dd", inv));
Console.WriteLine(joinDate.AddMonths(6).ToString("yyyy-MM-dd", inv));
Console.WriteLine(new DateTime(2026, 1, 31).AddMonths(1).ToString("yyyy-MM-dd", inv));
Console.WriteLine(DateTime.IsLeapYear(2028));

// Age calculation
var dob = new DateTime(2000, 8, 20);
var today = new DateTime(2026, 11, 17);
int age = today.Year - dob.Year;
if (dob.Date > today.AddYears(-age)) age--;     // birthday not reached yet this year
Console.WriteLine($"Age: {age}");

// Parsing user input with an exact format
var parsed = DateTime.ParseExact("17/11/2026", "dd/MM/yyyy", inv);
Console.WriteLine(parsed.ToString("yyyy-MM-dd", inv));
bool ok = DateTime.TryParseExact("31/02/2026", "dd/MM/yyyy", inv, DateTimeStyles.None, out _);
Console.WriteLine($"31/02/2026 valid? {ok}");

// DateOnly and TimeOnly (.NET 6+)
var holiday = new DateOnly(2026, 12, 25);
var classTime = new TimeOnly(18, 45);
Console.WriteLine($"{holiday.ToString("yyyy-MM-dd", inv)} {holiday.DayOfWeek}, class at {classTime.ToString("HH:mm", inv)}");
`;
const ex2 = `using System.Globalization;

var inv = CultureInfo.InvariantCulture;

// TimeSpan = a length of time (difference between two DateTimes)
var checkIn = new DateTime(2026, 11, 17, 9, 15, 0);
var checkOut = new DateTime(2026, 11, 17, 17, 45, 30);

TimeSpan worked = checkOut - checkIn;
Console.WriteLine(worked);                                   // default format d.hh:mm:ss
Console.WriteLine($"{worked.Hours}h {worked.Minutes}m {worked.Seconds}s");
Console.WriteLine($"Total minutes: {(int)worked.TotalMinutes}");
Console.WriteLine(worked > TimeSpan.FromHours(8) ? "Full day" : "Half day");

// Creating TimeSpans
var lunch = TimeSpan.FromMinutes(135);
var trip = new TimeSpan(1, 2, 3, 4);                         // days, hours, minutes, seconds
Console.WriteLine(lunch);
Console.WriteLine(trip);
Console.WriteLine($"Trip in hours: {(int)trip.TotalHours}");
Console.WriteLine(checkIn.Add(lunch).ToString("HH:mm", inv));

// Library fine: 10 per late day
var issued = new DateTime(2026, 11, 17);
var due = issued.AddDays(14);
var returned = new DateTime(2026, 12, 5);
int lateDays = Math.Max(0, (returned - due).Days);
Console.WriteLine($"Due {due.ToString("yyyy-MM-dd", inv)}, late by {lateDays} day(s), fine = {lateDays * 10}");

// Measuring code with Stopwatch (value changes every run, so we only check it)
var sw = System.Diagnostics.Stopwatch.StartNew();
long sum = 0;
for (int i = 0; i < 1_000_000; i++) sum += i;
sw.Stop();
Console.WriteLine($"Sum = {sum}, measured: {sw.ElapsedMilliseconds >= 0}");
`;
const ex3 = `using System.Text.RegularExpressions;

// Validation with Regex.IsMatch: ^ = start, $ = end, \\d = digit, \\w = letter/digit/_
var emailRx = new Regex(@"^[\\w.+-]+@[\\w-]+(\\.[\\w-]+)+$");
string[] emails = { "asha@mail.com", "ravi.kumar@company.co.in", "bad@", "no-at-sign.com" };
foreach (var e in emails)
    Console.WriteLine($"{e,-26} {(emailRx.IsMatch(e) ? "valid" : "invalid")}");

string[] phones = { "9876543210", "1234567890", "98765" };
foreach (var p in phones)
    Console.WriteLine($"{p,-12} {Regex.IsMatch(p, @"^[6-9]\\d{9}$")}");

// PAN format: 5 letters, 4 digits, 1 letter
Console.WriteLine(Regex.IsMatch("ABCDE1234F", @"^[A-Z]{5}[0-9]{4}[A-Z]$"));

// Strong password: 8+ chars, at least one digit, one upper case letter, one symbol (lookaheads)
var strong = new Regex(@"^(?=.*\\d)(?=.*[A-Z])(?=.*[^\\w\\s]).{8,}$");
Console.WriteLine($"Pass@123 strong? {strong.IsMatch("Pass@123")}");
Console.WriteLine($"password strong? {strong.IsMatch("password")}");
`;
const ex4 = `using System.Text.RegularExpressions;

// Extracting and replacing text with Regex
string order = "Order 12 has 3 items costing 450";
var numbers = Regex.Matches(order, @"\\d+").Select(m => m.Value);
Console.WriteLine(string.Join(" | ", numbers));

// Named groups pull out parts of a pattern
Match inv = Regex.Match("INV-2026-0042", @"^INV-(?<year>\\d{4})-(?<num>\\d+)$");
if (inv.Success)
    Console.WriteLine($"Year {inv.Groups["year"].Value}, number {int.Parse(inv.Groups["num"].Value)}");

// Replace: collapse many spaces, mask a phone number, reformat a date
Console.WriteLine(Regex.Replace("Call   me    now", @"\\s+", " "));
Console.WriteLine(Regex.Replace("9876543210", @"\\d(?=\\d{4})", "*"));
Console.WriteLine(Regex.Replace("2026-11-17", @"(\\d{4})-(\\d{2})-(\\d{2})", "$3/$2/$1"));

// Split on commas or semicolons with optional spaces
string[] tags = Regex.Split("csharp, dotnet;sql ;  react", @"\\s*[,;]\\s*");
Console.WriteLine(string.Join("|", tags));

// Case-insensitive search
Console.WriteLine(Regex.IsMatch("Welcome to .NET", "dotnet|\\\\.net", RegexOptions.IgnoreCase));
`;

export default {
  id: 'extra-30-datetime-timespan-and-regex',
  title: 'DateTime, TimeSpan and Regular Expressions',
  module: 'Extra: Advanced C#',
  extraNo: 30,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: `Almost every business application works with dates and validates text. Learn DateTime, DateOnly, TimeOnly, DateTimeOffset and TimeSpan: creating, formatting, parsing, adding and subtracting dates, calculating age, working hours and late fees. Then learn regular expressions with System.Text.RegularExpressions to validate emails, phone numbers, PAN and passwords, and to extract, replace and split text.`,
  objectives: [
    'Create, format (custom format strings) and parse dates culture-safely',
    'Do date arithmetic: AddDays, AddMonths, difference between dates, age calculation',
    'Use TimeSpan for durations, and DateOnly/TimeOnly/DateTimeOffset where appropriate',
    'Write regex patterns with anchors, character classes, quantifiers, groups and lookaheads',
    'Use Regex.IsMatch, Match, Matches, Replace and Split for real validation and text processing',
  ],
  theory: [
    {
      heading: 'DateTime basics',
      content: `**DateTime** (a struct) stores a date and time of day. Important members:
- Constructors: new DateTime(2026, 11, 17) or new DateTime(2026, 11, 17, 9, 30, 0)
- Current time: **DateTime.Now** (local), **DateTime.UtcNow** (UTC), **DateTime.Today** (today at 00:00)
- Parts: Year, Month, Day, Hour, Minute, Second, DayOfWeek, DayOfYear, Date (time removed)
- Arithmetic (returns a new value - DateTime is immutable): AddDays, AddMonths, AddYears, AddHours, AddMinutes
- Static helpers: DateTime.IsLeapYear(y), DateTime.DaysInMonth(y, m)
- **Kind**: Local, Utc or Unspecified

AddMonths clamps to the last valid day: 31 Jan + 1 month = 28 Feb (29 in leap years).`,
      syntax: `DateTime now = DateTime.Now;
DateTime due = DateTime.Today.AddDays(14);
bool weekend = now.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday;`,
      tip: `Store dates in databases and APIs as UTC (DateTime.UtcNow or DateTimeOffset) and convert to local time only for display.`,
    },
    {
      heading: 'Formatting and parsing dates',
      content: `Custom format specifiers:
| Specifier | Meaning | Example |
|---|---|---|
| yyyy / yy | year | 2026 / 26 |
| MM / MMM / MMMM | month | 01 / Jan / January |
| dd / ddd / dddd | day / short day name / full day name | 15 / Thu / Thursday |
| HH / hh | hour 24h / 12h | 17 / 05 |
| mm / ss | minutes / seconds | 30 / 05 |
| tt | AM/PM | PM |

Standard formats: "d" short date, "D" long date, "t" short time, "o" round-trip ISO 8601 (best for APIs/logs).

Formatting and parsing depend on **culture** (India dd-MM-yyyy, US MM/dd/yyyy). Pass **CultureInfo.InvariantCulture** for fixed formats, and use **ParseExact / TryParseExact** for user input with a known format. TryParse returns false for invalid dates like 31/02/2026 instead of throwing.`,
      syntax: `var inv = CultureInfo.InvariantCulture;
string s = date.ToString("dd MMM yyyy", inv);          // 15 Jan 2026
DateTime d = DateTime.ParseExact("17/11/2026", "dd/MM/yyyy", inv);
bool ok = DateTime.TryParseExact(text, "dd/MM/yyyy", inv, DateTimeStyles.None, out var result);`,
    },
    {
      heading: 'TimeSpan, DateOnly, TimeOnly and DateTimeOffset',
      content: `**TimeSpan** is a duration (days, hours, minutes, seconds, ticks). Subtracting two DateTimes gives a TimeSpan.
- Days, Hours, Minutes, Seconds - the **component** values (Hours is 0-23)
- TotalDays, TotalHours, TotalMinutes - the whole duration as a double
- Create: TimeSpan.FromMinutes(90), new TimeSpan(1, 2, 3, 4) (d, h, m, s)
- Default ToString: [d.]hh:mm:ss - e.g. 1.02:03:04

**DateOnly** (.NET 6) - just a date (birthday, holiday); **TimeOnly** - just a time (shop opening time). EF Core 8+ maps them to SQL Server date and time columns.

**DateTimeOffset** - a date-time plus its offset from UTC (+05:30). It identifies an exact instant, so prefer it for timestamps in distributed apps and APIs.

**Stopwatch** (System.Diagnostics) measures elapsed time precisely for performance checks.`,
      syntax: `TimeSpan worked = checkOut - checkIn;
double hours = worked.TotalHours;
var birthday = new DateOnly(2000, 8, 20);
var opens = new TimeOnly(9, 0);
DateTimeOffset placedAt = DateTimeOffset.UtcNow;`,
    },
    {
      heading: 'Regular expressions: the pattern language',
      content: `A **regular expression** (regex) is a pattern that describes text. Use it for validation, searching, extraction and replacement. In C#, write patterns as verbatim strings @"..." so backslashes are not escaped twice.

| Token | Meaning |
|---|---|
| ^ and $ | start and end of the text (anchor) |
| . | any character except new line |
| \\d \\w \\s | digit, word char (letter/digit/_), whitespace |
| \\D \\W \\S | NOT digit / word / whitespace |
| [abc] [a-z] [^0-9] | character set, range, negated set |
| * + ? | 0 or more, 1 or more, 0 or 1 |
| {n} {n,} {n,m} | exact count, at least n, between n and m |
| ( ) (?<name> ) | capture group, named group |
| a or b written as a pipe | alternation |
| (?=...) (?!...) | lookahead / negative lookahead |
| \\. | a literal dot (escape special characters) |

Example: ^[6-9]\\d{9}$ = Indian mobile number: starts with 6-9 followed by exactly 9 digits and nothing else.`,
    },
    {
      heading: 'The Regex class in .NET',
      content: `Namespace **System.Text.RegularExpressions**:
- **Regex.IsMatch(input, pattern)** - true/false (validation)
- **Regex.Match** - first match; check .Success, read .Value and .Groups["name"].Value
- **Regex.Matches** - all matches (MatchCollection, works with LINQ)
- **Regex.Replace(input, pattern, replacement)** - $1, $2 or the named form refer to groups
- **Regex.Split** - split by a pattern
- **RegexOptions**: IgnoreCase, Multiline, Compiled, IgnorePatternWhitespace, plus a match timeout to avoid catastrophic backtracking

Performance: create a static readonly Regex once and reuse it, or use the **[GeneratedRegex]** source generator (.NET 7+) which writes the matching code at compile time.

In ASP.NET Core, the [RegularExpression(@"^[6-9]\\d{9}$")] data annotation applies a regex to model validation, and route constraints like {code:regex(^[A-Z]{3}$)} use it in routing.`,
      syntax: `public static partial class Patterns
{
    [GeneratedRegex(@"^[6-9]\\d{9}$")]
    public static partial Regex Mobile();
}
bool ok = Patterns.Mobile().IsMatch("9876543210");`,
    },
  ],
  examples: [
    {
      title: 'Formatting, date arithmetic, age and parsing',
      scenario: 'An HR system stores a joining date, calculates probation end and age, parses dates typed by users and stores holidays as DateOnly.',
      steps: steps('DateTimeDemo'),
      code: ex1,
      csharp: { files: { 'Program.cs': ex1 }, stdin: '' },
      result: `2026-01-15 09:30
15 Jan 2026
Thursday, 09:30 AM
Year=2026 Month=1 Day=15 DayOfYear=15
2026-03-01
2026-07-15
2026-02-28
True
Age: 26
2026-11-17
31/02/2026 valid? False
2026-12-25 Friday, class at 18:45`,
      explanation: `InvariantCulture gives the same English month/day names everywhere. 15 Jan + 45 days: 16 days to 31 Jan, 28 days of February, 1 more = 1 March. 31 Jan + 1 month is clamped to 28 Feb because 2026 is not a leap year (2028 is). The age is 2026 - 2000 = 26 and the birthday (20 Aug) has already passed by 17 Nov, so no correction is needed. February has no 31st, so TryParseExact returns false instead of throwing.`,
    },
    {
      title: 'TimeSpan: working hours, durations and library fines',
      scenario: 'Calculate how long an employee worked, build durations, and compute a library late fee of 10 per day.',
      steps: steps('TimeSpanDemo'),
      code: ex2,
      csharp: { files: { 'Program.cs': ex2 }, stdin: '' },
      result: `08:30:30
8h 30m 30s
Total minutes: 510
Full day
02:15:00
1.02:03:04
Trip in hours: 26
11:30
Due 2026-12-01, late by 4 day(s), fine = 40
Sum = 499999500000, measured: True`,
      explanation: `17:45:30 - 09:15:00 = 8 h 30 min 30 s. TotalMinutes is 510.5, cast to int gives 510. 135 minutes = 2:15. new TimeSpan(1, 2, 3, 4) prints the days before the dot. 1 day 2 hours = 26 total hours. 09:15 + 2:15 = 11:30. The book was due 14 days after 17 Nov (1 Dec) and returned on 5 Dec: 4 days late = 40. Stopwatch time differs on every run, so we only print a check.`,
    },
    {
      title: 'Regex validation: email, mobile, PAN and strong password',
      scenario: 'A registration form must validate an email, an Indian mobile number, a PAN card number and a strong password before saving.',
      steps: steps('RegexValidation'),
      code: ex3,
      csharp: { files: { 'Program.cs': ex3 }, stdin: '' },
      result: `asha@mail.com              valid
ravi.kumar@company.co.in   valid
bad@                       invalid
no-at-sign.com             invalid
9876543210   True
1234567890   False
98765        False
True
Pass@123 strong? True
password strong? False`,
      explanation: `The email pattern requires name characters, @, a domain and at least one ".part". "bad@" has no domain and "no-at-sign.com" has no @. The mobile pattern needs a first digit 6-9 and exactly 10 digits, so 1234567890 and 98765 fail. ^ and $ make sure the WHOLE text matches. The password regex uses three lookaheads (digit, upper case, symbol) followed by .{8,} for the length - "password" has no digit, capital or symbol.`,
    },
    {
      title: 'Regex extraction, groups, replace and split',
      scenario: 'Pull numbers out of a sentence, read parts of an invoice number, clean up spaces, mask a phone number, reformat a date and split tags.',
      steps: steps('RegexText'),
      code: ex4,
      csharp: { files: { 'Program.cs': ex4 }, stdin: '' },
      result: `12 | 3 | 450
Year 2026, number 42
Call me now
******3210
17/11/2026
csharp|dotnet|sql|react
True`,
      explanation: `\\d+ matches each run of digits. Named groups year and num capture parts of the invoice; int.Parse removes the leading zeros. \\s+ collapses repeated spaces. \\d(?=\\d{4}) matches a digit only if at least 4 digits follow it, so all but the last four are replaced by *. In the replacement, $3/$2/$1 rearranges the captured groups. The split pattern accepts a comma or semicolon with optional spaces around it. The last pattern finds ".NET" ignoring case.`,
    },
  ],
  interview: [
    { q: 'Difference between DateTime.Now, DateTime.UtcNow and DateTime.Today?', a: 'Now is the current local date and time, UtcNow is the current UTC date and time, Today is the local date at midnight (time 00:00:00).', level: 'Easy' },
    { q: 'Why should servers store times in UTC?', a: 'Servers and users can be in different time zones and local time has daylight saving jumps. UTC (or DateTimeOffset) is unambiguous; convert to the user time zone only for display.', level: 'Medium' },
    { q: 'Difference between DateTime and DateTimeOffset?', a: 'DateTime stores a date-time plus a Kind (Local/Utc/Unspecified). DateTimeOffset stores the date-time plus the exact offset from UTC, so it always represents one specific instant.', level: 'Medium' },
    { q: 'What is the difference between TimeSpan.Minutes and TimeSpan.TotalMinutes?', a: 'Minutes is the minutes component (0-59) of the duration; TotalMinutes is the whole duration expressed in minutes as a double. For 1 h 30 min: Minutes = 30, TotalMinutes = 90.', level: 'Easy' },
    { q: 'Output? Console.WriteLine(new DateTime(2026, 1, 31).AddMonths(1).Day);', a: '28. AddMonths keeps the day if possible, otherwise it uses the last day of the target month.', level: 'Medium' },
    { q: 'Why use ParseExact / TryParseExact?', a: 'They parse only the exact expected format (e.g. dd/MM/yyyy) independent of the machine culture, avoiding 03/04 being read as 3 April on one server and 4 March on another.', level: 'Medium' },
    { q: 'What are DateOnly and TimeOnly?', a: '.NET 6 structs for a calendar date without time and a time of day without date. They avoid fake midnight times and map to SQL date and time columns.', level: 'Easy' },
    { q: 'What do ^ and $ mean in a regex?', a: 'Start and end anchors. Without them, IsMatch returns true if the pattern appears anywhere in the text, so "abc9876543210xyz" would pass a phone check.', level: 'Easy' },
    { q: 'What is a lookahead?', a: '(?=...) checks that something follows the current position without consuming characters; (?!...) checks that it does not. Often used for password rules.', level: 'Medium' },
    { q: 'How do you improve regex performance in .NET?', a: 'Reuse a static Regex instance instead of creating one per call, use RegexOptions.Compiled or the [GeneratedRegex] source generator, avoid nested quantifiers and set a match timeout to prevent catastrophic backtracking (ReDoS).', level: 'Hard' },
    { q: 'Output? Regex.Replace("a1b22c333", @"\\d+", "#")', a: 'a#b#c#. Each run of one or more digits is replaced with one #.', level: 'Medium' },
    { q: 'How do you apply a regex in ASP.NET Core model validation?', a: 'Put [RegularExpression(pattern, ErrorMessage = "...")] on the model property. It is checked during model binding and by client-side validation.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Ask for a date of birth in dd-MM-yyyy format and print the age in years and the day of the week the person was born on.',
      hint: 'Use DateTime.TryParseExact with InvariantCulture; age = today.Year - dob.Year, minus 1 if the birthday has not come yet.',
      solution: `using System.Globalization;
Console.Write("DOB (dd-MM-yyyy): ");
if (DateTime.TryParseExact(Console.ReadLine(), "dd-MM-yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var dob))
{
    var today = DateTime.Today;
    int age = today.Year - dob.Year;
    if (dob.Date > today.AddYears(-age)) age--;
    Console.WriteLine($"Age {age}, born on a {dob.DayOfWeek}");
}
else Console.WriteLine("Invalid date");`,
    },
    {
      task: 'Given a list of check-in/check-out times for 3 days, calculate the total hours worked in the week (as hh:mm).',
      hint: 'Sum TimeSpans with Aggregate or a loop; print with (int)total.TotalHours and total.Minutes.',
      solution: `var days = new[]
{
    (In: new DateTime(2026, 11, 16, 9, 0, 0), Out: new DateTime(2026, 11, 16, 17, 30, 0)),
    (In: new DateTime(2026, 11, 17, 9, 15, 0), Out: new DateTime(2026, 11, 17, 18, 0, 0)),
    (In: new DateTime(2026, 11, 18, 10, 0, 0), Out: new DateTime(2026, 11, 18, 16, 45, 0)),
};
TimeSpan total = TimeSpan.Zero;
foreach (var d in days) total += d.Out - d.In;
Console.WriteLine($"{(int)total.TotalHours}:{total.Minutes:00}");   // 24:00`,
    },
    {
      task: 'Validate Indian vehicle numbers like "MH12AB1234" (2 letters, 2 digits, 1-2 letters, 4 digits).',
      hint: '^[A-Z]{2}\\d{2}[A-Z]{1,2}\\d{4}$',
      solution: `using System.Text.RegularExpressions;
var rx = new Regex(@"^[A-Z]{2}\\d{2}[A-Z]{1,2}\\d{4}$");
foreach (var v in new[] { "MH12AB1234", "KA01C4567", "12MH1234" })
    Console.WriteLine($"{v}: {rx.IsMatch(v)}");
// MH12AB1234: True, KA01C4567: True, 12MH1234: False`,
    },
    {
      task: 'Extract all hashtags (#word) from a tweet and print them in lower case without duplicates.',
      hint: 'Pattern #(\\w+); use Matches, Select(m => m.Groups[1].Value.ToLower()).Distinct().',
      solution: `using System.Text.RegularExpressions;
string tweet = "Learning #DotNet and #CSharp today! #dotnet rocks";
var tags = Regex.Matches(tweet, @"#(\\w+)")
    .Select(m => m.Groups[1].Value.ToLower())
    .Distinct();
Console.WriteLine(string.Join(", ", tags));   // dotnet, csharp`,
    },
    {
      task: 'Mask an email address so that only the first two characters before @ are visible: "ravikumar@mail.com" -> "ra*******@mail.com".',
      hint: 'Use a lookbehind (?<=^.{2,}) and a lookahead (?=[^@]*@) on each character, or use Substring logic.',
      solution: `using System.Text.RegularExpressions;
string masked = Regex.Replace("ravikumar@mail.com", @"(?<=^.{2,})[^@](?=[^@]*@)", "*");
Console.WriteLine(masked);   // ra*******@mail.com`,
    },
  ],
  quiz: [
    {
      question: 'What does new DateTime(2026, 3, 31).AddMonths(-1) return?',
      options: ['2026-03-01', '2026-02-28', '2026-02-31', 'It throws an exception'],
      answer: 1,
      explanation: 'February 2026 has 28 days, so the day is clamped to 28.',
    },
    {
      question: 'Which property gives the whole duration of a TimeSpan in hours?',
      options: ['Hours', 'TotalHours', 'HoursTotal', 'Days * 24'],
      answer: 1,
      explanation: 'Hours is only the 0-23 component; TotalHours is the full length as a double.',
    },
    {
      question: 'Which pattern matches exactly a 6-digit PIN code and nothing else?',
      options: ['\\d{6}', '[0-9]+', '^\\d{6}$', '^\\d*$'],
      answer: 2,
      explanation: 'Anchors ^ and $ force the entire string to be exactly six digits.',
    },
    {
      question: 'In Regex.Replace("2026-11-17", @"(\\d{4})-(\\d{2})-(\\d{2})", "$3.$2.$1"), what is the result?',
      options: ['17.11.2026', '2026.11.17', '$3.$2.$1', '11.17.2026'],
      answer: 0,
      explanation: '$1, $2 and $3 refer to the captured year, month and day groups.',
    },
    {
      question: 'Which type is best for storing an exact instant in a multi-time-zone API?',
      options: ['DateOnly', 'TimeOnly', 'string', 'DateTimeOffset'],
      answer: 3,
      explanation: 'DateTimeOffset stores the UTC offset, so the instant is unambiguous.',
    },
  ],
};
