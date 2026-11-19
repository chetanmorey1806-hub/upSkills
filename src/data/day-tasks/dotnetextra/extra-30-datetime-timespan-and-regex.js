export default {
  lesson: 'extra-30-datetime-timespan-and-regex',
  minutes: 25,
  intro: 'Do date arithmetic with DateTime and TimeSpan, format dates, and validate/extract text with Regex.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'adding days', code: `var d = new DateTime(2024, 1, 31);
Console.WriteLine(d.AddDays(1).ToString("yyyy-MM-dd"));  // 2024-02-01` },
      code: `var d = new DateTime(2024, 2, 28);
Console.WriteLine(d.AddDays(1).ToString("yyyy-MM-dd"));
Console.WriteLine(d.AddMonths(1).ToString("dd/MM/yyyy"));
Console.WriteLine(new DateTime(2024, 8, 15).DayOfWeek);
Console.WriteLine(DateTime.IsLeapYear(2024));
Console.WriteLine((new DateTime(2024, 12, 25) - new DateTime(2024, 8, 15)).Days);`,
      expected: `2024-02-29
28/03/2024
Thursday
True
132`,
      explain: '2024 is a leap year, so 28 Feb + 1 day = 29 Feb. `AddMonths(1)` keeps the day: 28/03/2024. 15 Aug 2024 was a Thursday. Subtracting two DateTimes gives a `TimeSpan`; its `.Days` is 132.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'TimeSpan formatting and totals. What does this print?',
      example: { title: 'TimeSpan', code: `var t = new TimeSpan(1, 30, 0);   // 1 h 30 min
Console.WriteLine(t);              // 01:30:00` },
      code: `var shift = new TimeSpan(8, 30, 0);
var overtime = TimeSpan.FromMinutes(135);
var total = shift + overtime;
Console.WriteLine(overtime);
Console.WriteLine(total);
Console.WriteLine(total.TotalMinutes);
Console.WriteLine(TimeSpan.FromHours(27));
Console.WriteLine(TimeSpan.FromHours(27).Hours);`,
      expected: `02:15:00
10:45:00
645
1.03:00:00
3`,
      explain: '135 minutes = 2 h 15 min. 8:30 + 2:15 = 10:45 = 645 minutes (`TotalMinutes` is a double, printed as 645). 27 hours prints as `1.03:00:00` (days.hours:min:sec), and `.Hours` is only the hours **component** (3), while `TotalHours` would be 27.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Format a date as **2024-08-15** (year-month-day, two-digit month and day):
\`date.ToString("______")\``,
      example: { title: 'other formats', code: `d.ToString("dd/MM/yyyy")   // 15/08/2024
d.ToString("HH:mm")        // 24-hour time` },
      accept: ['yyyy-MM-dd'],
      caseSensitive: true,
      explain: 'Format specifiers are case-sensitive: `MM` = month, `mm` = minutes, `dd` = day, `yyyy` = 4-digit year. Writing `yyyy-mm-dd` prints the minutes in place of the month, a classic bug.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Regex validation and extraction. What does this print?',
      example: { title: 'Regex.IsMatch', code: 'Regex.IsMatch("411001", @"^\\d{6}$")   // True: 6-digit PIN code' },
      code: `using System.Text.RegularExpressions;

var mobile = new Regex(@"^[6-9]\\d{9}$");
Console.WriteLine(mobile.IsMatch("9876543210"));
Console.WriteLine(mobile.IsMatch("5876543210"));
Console.WriteLine(mobile.IsMatch("98765 43210"));

string text = "Call 98765-43210 or 91234-56789 today";
var matches = Regex.Matches(text, @"\\d{5}-\\d{5}");
Console.WriteLine(matches.Count);
Console.WriteLine(matches[1].Value);
Console.WriteLine(Regex.Replace("a1b22c333", @"\\d+", "#"));`,
      expected: `True
False
False
2
91234-56789
a#b#c#`,
      explain: 'Indian mobiles: start with 6-9 and have exactly 10 digits; `^`/`$` anchor the whole string, so a space fails. `Matches` finds both numbers; index 1 is the second. `\\d+` matches each run of digits, so `Replace` gives `a#b#c#`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Write a regex pattern for a 6-digit Indian PIN code that does **not** start with 0 (match the whole string):
\`Regex.IsMatch(pin, @"______")\``,
      example: { title: 'anchored pattern', code: '@"^[A-Z]{5}\\d{4}[A-Z]$"   // PAN card format' },
      accept: ['^[1-9]\\d{5}$', '^[1-9][0-9]{5}$'],
      acceptRegex: ['^\\^\\[1-9\\](\\\\d|\\[0-9\\])\\{5\\}\\$$', '^\\^\\[1-9\\](\\\\d|\\[0-9\\])(\\\\d|\\[0-9\\])(\\\\d|\\[0-9\\])(\\\\d|\\[0-9\\])(\\\\d|\\[0-9\\])\\$$'],
      caseSensitive: true,
      explain: '`^[1-9]` = first digit 1-9, `\\d{5}` = five more digits, `$` = end. Without the anchors, "abc4110012" would also match because the pattern could be found inside a longer string.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which practices are recommended? Select all that apply.',
      options: ['Store timestamps in UTC (`DateTime.UtcNow` or `DateTimeOffset`) and convert for display', 'Use `DateOnly` for a date of birth (.NET 6+)', 'Parse user dates with `DateTime.TryParseExact` and a known format', 'Use `DateTime.Now` on servers in different time zones for audit logs', 'Compile and reuse a `Regex` (static field or `[GeneratedRegex]`) used in a loop'],
      answers: [0, 1, 2, 4],
      explain: 'UTC avoids time-zone and daylight-saving errors; `DateOnly` represents a date without time; `TryParseExact` avoids culture surprises; reusing a Regex avoids re-parsing the pattern. `DateTime.Now` depends on each server\'s local zone, which breaks audit logs.',
    },
  ],
};
