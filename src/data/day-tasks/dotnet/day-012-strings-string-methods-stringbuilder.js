export default {
  lesson: 'day-012-strings-string-methods-stringbuilder',
  minutes: 18,
  intro: 'Practise C# string methods (Length, Substring, IndexOf, Replace, Split, Trim), immutability and StringBuilder.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this print?',
      example: { title: 'string basics', code: 'string s = "India";\nConsole.WriteLine(s.Length);       // 5\nConsole.WriteLine(s[0]);           // I\nConsole.WriteLine(s.ToLower());    // india' },
      code: `string app = "UpSkillr";
Console.WriteLine(app.Length);
Console.WriteLine(app.Substring(2, 5));
Console.WriteLine(app.IndexOf('k'));
Console.WriteLine(app.ToUpper());
Console.WriteLine(app.Contains("ill"));`,
      expected: `8
Skill
3
UPSKILLR
True`,
      explain: '`Substring(start, length)` takes 5 characters starting at index 2 → "Skill". `IndexOf` returns the zero-based position (U=0, p=1, S=2, k=3). `Contains` returns a bool, printed as `True`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Cleaning and splitting user input: what does this print?',
      example: { title: 'Split and Join', code: 'string[] parts = "a,b,c".Split(\',\');\nConsole.WriteLine(parts.Length);            // 3\nConsole.WriteLine(string.Join(" | ", parts)); // a | b | c' },
      code: `string input = "  asha,ravi,meena  ";
string clean = input.Trim();
string[] names = clean.Split(',');
Console.WriteLine(clean.Length);
Console.WriteLine(names.Length);
Console.WriteLine(names[1].Replace("v", "j"));
Console.WriteLine(string.Join(" & ", names));`,
      expected: `15
3
raji
asha & ravi & meena`,
      explain: '`Trim()` removes the spaces at both ends, leaving "asha,ravi,meena" (15 characters). `Split(\',\')` makes 3 parts. `Replace` returns a **new** string ("raji"). `string.Join` glues the parts with the separator.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What does this print?\n```\nstring city = "pune";\ncity.ToUpper();\nConsole.WriteLine(city);\n```',
      options: ['PUNE', 'pune', 'Pune', 'Compile error'],
      answer: 1,
      explain: 'Strings are **immutable**: `ToUpper()` returns a new string and does not change `city`. The result was thrown away. You must write `city = city.ToUpper();`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'You build a report line by line inside a loop with a `StringBuilder sb`. Complete the statement that adds the text in `line` to the builder:\n`sb.______(line);`\n(write only the method name)',
      example: { title: 'StringBuilder', code: 'var sb = new StringBuilder();\nsb.Append("Hello");\nsb.Append(" World");\nstring result = sb.ToString();' },
      accept: ['Append', 'AppendLine'],
      caseSensitive: true,
      explain: '`Append` (or `AppendLine`, which adds a new line) modifies the same buffer instead of creating a new string every time. In a loop with thousands of `+=` on a string, StringBuilder is much faster. Call `ToString()` at the end.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about C# strings are TRUE? (choose all that apply)',
      options: [
        '`==` on two strings compares their text (values)',
        'string.IsNullOrEmpty(s) is true for both null and ""',
        '"abc".Equals("ABC", StringComparison.OrdinalIgnoreCase) is true',
        'Strings are mutable, so s[0] = \'X\' changes the first letter',
        'StringBuilder lives in the System.Text namespace',
      ],
      answers: [0, 1, 2, 4],
      explain: 'For `string`, `==` is overloaded to compare text. `IsNullOrEmpty` handles both cases safely. `OrdinalIgnoreCase` ignores letter case. `s[0]` is **read-only** (immutability), and StringBuilder is in `System.Text`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Verbatim strings, interpolation and formatting: what does this print?',
      example: { title: 'format specifiers', code: 'double p = 1234.5;\nConsole.WriteLine($"{p:F2}"); // 1234.50\nConsole.WriteLine(@"C:\\temp"); // C:\\temp' },
      code: `string name = "Ravi";
int score = 87;
double pct = 87.456;
Console.WriteLine($"{name} scored {score}");
Console.WriteLine($"Percent: {pct:F1}");
Console.WriteLine(@"Path: C:\\files\\new");
Console.WriteLine(name.PadLeft(6, '*'));`,
      expected: `Ravi scored 87
Percent: 87.5
Path: C:\\files\\new
**Ravi`,
      explain: '`{pct:F1}` formats with 1 decimal (87.456 → 87.5). An `@` verbatim string keeps backslashes as they are (no escape sequences, so `\\n` is not a new line here). `PadLeft(6, \'*\')` pads on the left to a total width of 6.',
    },
  ],
};
