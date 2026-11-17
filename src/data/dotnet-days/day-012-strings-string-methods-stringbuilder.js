const methodsCode = `// Day 12 - Example 1: Common string methods
string text = "  Hello CSharp World  ";
Console.WriteLine($"Original  : [{text}]");

string t = text.Trim();
Console.WriteLine($"Trim      : [{t}]");
Console.WriteLine($"Length    : {t.Length}");
Console.WriteLine($"Upper     : {t.ToUpper()}");
Console.WriteLine($"Lower     : {t.ToLower()}");
Console.WriteLine($"t[6]      : {t[6]}");
Console.WriteLine($"Substring : {t.Substring(6, 6)}");
Console.WriteLine($"IndexOf   : {t.IndexOf("World")}");
Console.WriteLine($"Contains  : {t.Contains("Sharp")}");
Console.WriteLine($"StartsWith: {t.StartsWith("Hello")}");
Console.WriteLine($"EndsWith  : {t.EndsWith("world")}");
Console.WriteLine($"Replace   : {t.Replace("World", "India")}");

string[] words = t.Split(' ');
Console.WriteLine($"Words     : {words.Length}");
Console.WriteLine($"Join      : {string.Join("-", words)}");
Console.WriteLine($"Insert    : {t.Insert(5, ",")}");
Console.WriteLine($"Remove    : {t.Remove(5)}");

string roll = "42";
Console.WriteLine($"PadLeft   : {roll.PadLeft(5, '0')}");
Console.WriteLine($"Unchanged : [{text}]");
`;

const reverseCode = `// Day 12 - Example 2: Reverse a string and check palindrome strings
string word = "Madam";

// Method 1: loop from the last character to the first
string reversed = "";
for (int i = word.Length - 1; i >= 0; i--)
{
    reversed += word[i];
}
Console.WriteLine($"Original         : {word}");
Console.WriteLine($"Reversed (loop)  : {reversed}");

// Method 2: convert to char[] and use Array.Reverse
char[] chars = word.ToCharArray();
Array.Reverse(chars);
Console.WriteLine($"Reversed (Array) : {new string(chars)}");

// Palindrome check with two pointers (ignore case and spaces)
string[] tests = { "Madam", "level", "Racecar", "hello", "A man a plan a canal Panama" };
foreach (string s in tests)
{
    string clean = s.Replace(" ", "").ToLower();
    bool isPalindrome = true;

    for (int i = 0, j = clean.Length - 1; i < j; i++, j--)
    {
        if (clean[i] != clean[j])
        {
            isPalindrome = false;
            break;
        }
    }
    Console.WriteLine($"'{s}' -> {(isPalindrome ? "Palindrome" : "Not Palindrome")}");
}
`;

const vowelsCode = `// Day 12 - Example 3: Count vowels, consonants, digits, spaces and others
string sentence = "Learning C# in 2026 is fun!";

int vowels = 0, consonants = 0, digits = 0, spaces = 0, others = 0;

foreach (char ch in sentence.ToLower())
{
    if ("aeiou".Contains(ch))
        vowels++;
    else if (ch >= 'a' && ch <= 'z')
        consonants++;
    else if (char.IsDigit(ch))
        digits++;
    else if (ch == ' ')
        spaces++;
    else
        others++;
}

Console.WriteLine($"Sentence   : {sentence}");
Console.WriteLine($"Length     : {sentence.Length}");
Console.WriteLine($"Vowels     : {vowels}");
Console.WriteLine($"Consonants : {consonants}");
Console.WriteLine($"Digits     : {digits}");
Console.WriteLine($"Spaces     : {spaces}");
Console.WriteLine($"Others     : {others}");
Console.WriteLine($"Words      : {sentence.Split(' ').Length}");
`;

const sbCode = `// Day 12 - Example 4: string immutability and StringBuilder
using System.Text;

string s1 = "Hello";
string s2 = s1;          // s2 points to the same "Hello"
s1 += " World";          // creates a NEW string; s2 is not affected
Console.WriteLine($"s1 = {s1}");
Console.WriteLine($"s2 = {s2}");

StringBuilder sb = new StringBuilder("Students:");
string[] names = { "Asha", "Ravi", "Meena" };
foreach (string n in names)
{
    sb.Append(' ').Append(n);     // modifies the same buffer
}
Console.WriteLine($"After Append : {sb}");

sb.Insert(0, ">> ");
Console.WriteLine($"After Insert : {sb}");

sb.Replace("Ravi", "Kiran");
Console.WriteLine($"After Replace: {sb}");

sb.Remove(0, 3);
Console.WriteLine($"After Remove : {sb}");
Console.WriteLine($"Length       : {sb.Length}");

// Build "1,2,3,4,5" in a loop and remove the last comma
StringBuilder nums = new StringBuilder();
for (int i = 1; i <= 5; i++)
{
    nums.Append(i).Append(',');
}
nums.Length--;                    // drop the trailing comma
string result = nums.ToString();
Console.WriteLine($"Numbers      : {result}");
`;

const compareCode = `// Day 12 - Example 5: Comparing, null checks, verbatim strings and formatting
using System.Globalization;

string a = "dotnet";
string b = "DotNet";
Console.WriteLine($"a == b              : {a == b}");
Console.WriteLine($"Equals ignore case  : {a.Equals(b, StringComparison.OrdinalIgnoreCase)}");
Console.WriteLine($"apple before banana : {string.Compare("apple", "banana", StringComparison.Ordinal) < 0}");

string empty = "";
string blanks = "   ";
string? nothing = null;
Console.WriteLine($"IsNullOrEmpty(empty)       : {string.IsNullOrEmpty(empty)}");
Console.WriteLine($"IsNullOrEmpty(blanks)      : {string.IsNullOrEmpty(blanks)}");
Console.WriteLine($"IsNullOrWhiteSpace(blanks) : {string.IsNullOrWhiteSpace(blanks)}");
Console.WriteLine($"IsNullOrEmpty(nothing)     : {string.IsNullOrEmpty(nothing)}");

string path = @"C:\\Courses\\DotNet";          // verbatim: backslash is not an escape
Console.WriteLine($"Path : {path}");

string line = string.Format("{0} scored {1} marks", "Asha", 92);
Console.WriteLine(line);

double percent = 87.5;
Console.WriteLine("Percent: " + percent.ToString("0.00", CultureInfo.InvariantCulture) + "%");
Console.WriteLine($"Name: {"Ravi",-6}| Marks: {75,4}|");
`;

export default {
  id: 'day-012-strings-string-methods-stringbuilder',
  title: 'Strings, String Methods and StringBuilder',
  module: 'Module 1: C# Programming Fundamentals',
  day: 12,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: `Work with text in C#: create strings, read characters by index, use the most important string methods (Trim, Substring, IndexOf, Replace, Split, Join ...), understand why strings are immutable and when to use StringBuilder. Practical programs: reverse a string, palindrome string, count vowels and consonants.`,
  objectives: [
    'Create strings, access characters by index and loop over a string',
    'Use common string methods: Length, ToUpper, ToLower, Trim, Substring, IndexOf, Contains, Replace, Split, Join, PadLeft',
    'Explain string immutability and use StringBuilder for repeated modifications',
    'Compare strings correctly (==, Equals with StringComparison, string.Compare) and check for null or empty values',
    'Write the reverse string, palindrome string and vowel/consonant count programs',
  ],
  theory: [
    {
      heading: 'What is a string?',
      content: `A string is a sequence of characters (char values) used to store text such as a name, an email or an address. In C# the keyword string is an alias for the .NET class System.String, so string and String are the same type. A string is a REFERENCE type, but it behaves like a value in many ways (== compares the text, not the reference). Each character can be read using a zero-based index: name[0] is the first character and name[name.Length - 1] is the last one. Length is a property (no brackets), not a method. Real-world analogy: a string is like a train of characters - each coach (char) has a number starting from 0.`,
      syntax: `string name = "Asha";
char first = name[0];              // 'A'
char last = name[name.Length - 1]; // 'a'
int len = name.Length;             // 4

foreach (char c in name)           // loop over every character
    Console.Write(c + " ");        // A s h a`,
      points: [
        'String literals use double quotes "..."; char literals use single quotes \'A\'',
        'The default value of a string variable (field or array element) is null',
        'string.Empty is the same as ""',
        'Indexes run from 0 to Length - 1; a wrong index throws IndexOutOfRangeException',
      ],
    },
    {
      heading: 'Immutability: strings never change',
      content: `Strings are IMMUTABLE: once created, the text inside a string object can never be changed. Methods like ToUpper, Replace or Trim do NOT modify the original string - they return a NEW string. That is why you must store the result: name = name.Trim(); Calling name.Trim(); alone does nothing useful. You also cannot write name[0] = 'B'; (compile error CS0200 - the indexer is read-only). Using += in a loop creates a new string object every time, which is slow for thousands of iterations. Immutability makes strings safe to share between variables and threads, and allows .NET to reuse identical literals (string interning).`,
      syntax: `string city = "pune";
city.ToUpper();                 // result thrown away, city is still "pune"
city = city.ToUpper();          // now city is "PUNE"
// city[0] = 'P';               // error CS0200: indexer is read only`,
      tip: 'Remember the rule: every string method returns a new string. Always assign the result.',
    },
    {
      heading: 'Important string methods',
      content: `The String class has many ready-made methods. These are the ones you will use every day in projects and interviews. All searches and comparisons are case-sensitive by default.`,
      points: [
        'Length - number of characters',
        'ToUpper() / ToLower() - change case',
        'Trim() / TrimStart() / TrimEnd() - remove spaces at the ends',
        'Substring(start) / Substring(start, length) - part of a string',
        'IndexOf("x") / LastIndexOf("x") - position of text, -1 if not found',
        'Contains / StartsWith / EndsWith - return true or false',
        'Replace(old, new) - replace all occurrences',
        'Split(separator) - break into a string[]; string.Join(separator, array) - combine an array into one string',
        'Insert(index, text) / Remove(start) / Remove(start, count)',
        'PadLeft(totalWidth, char) / PadRight(...) - fixed width text, e.g. "42".PadLeft(5, \'0\') -> "00042"',
        'ToCharArray() - convert to char[]; new string(charArray) - convert back',
      ],
      syntax: `string email = "  Ravi.Kumar@Mail.com ";
email = email.Trim().ToLower();          // "ravi.kumar@mail.com"
int at = email.IndexOf('@');             // 10
string user = email.Substring(0, at);    // "ravi.kumar"
string domain = email.Substring(at + 1); // "mail.com"
string[] parts = user.Split('.');        // { "ravi", "kumar" }`,
    },
    {
      heading: 'Comparing strings and checking for empty values',
      content: `== and Equals compare the CONTENT of two strings and are case-sensitive: "abc" == "ABC" is false. For a case-insensitive check use a.Equals(b, StringComparison.OrdinalIgnoreCase) - better than a.ToLower() == b.ToLower() because it creates no extra strings. string.Compare(a, b) returns a negative number if a comes before b, 0 if they are equal and a positive number if a comes after b (used for sorting). Before using user input, check it with string.IsNullOrEmpty(s) (null or "") or string.IsNullOrWhiteSpace(s) (null, "" or only spaces). Calling a method on a null string throws NullReferenceException.`,
      syntax: `bool same = "Pune" == "pune";                                       // false
bool same2 = "Pune".Equals("pune", StringComparison.OrdinalIgnoreCase); // true
int r = string.Compare("apple", "banana", StringComparison.Ordinal);    // negative
if (string.IsNullOrWhiteSpace(input)) Console.WriteLine("Name is required");`,
    },
    {
      heading: 'Escape sequences, verbatim, interpolated and raw strings',
      content: `Inside a normal string the backslash starts an escape sequence: \\n new line, \\t tab, \\" double quote, \\\\ one backslash. A verbatim string starts with @ and treats backslashes as normal characters - perfect for Windows file paths: @"C:\\Temp\\data.txt". An interpolated string starts with $ and puts expressions inside { }: $"Total = {a + b}". You can add alignment and format: {name,-10} left-aligns in 10 characters, {marks,5} right-aligns in 5, {price:0.00} formats a number. string.Format("{0} {1}", a, b) is the older way to do the same thing. C# 11+ also supports raw string literals with three quotes (""" ... """) that can contain quotes and new lines without escaping.`,
      syntax: `string a = "Line1\\nLine2";              // two lines
string b = "Name:\\tAsha";               // tab
string c = "He said \\"Hi\\"";            // He said "Hi"
string path = @"C:\\Projects\\Demo";      // verbatim
string msg = $"{name} scored {marks}";   // interpolation
string json = """{ "id": 1 }""";         // raw string literal (C# 11+)`,
    },
    {
      heading: 'StringBuilder: a mutable string',
      content: `System.Text.StringBuilder holds a resizable buffer of characters that CAN be changed in place. Append, AppendLine, Insert, Replace and Remove modify the same object and return the same builder, so calls can be chained: sb.Append("a").Append("b"). Call ToString() at the end to get a normal string. Use StringBuilder when you build text inside a loop (reports, CSV lines, HTML) or modify text many times. For two or three simple joins, normal + or interpolation is fine and more readable. Analogy: string is a printed page (to change it you print a new page); StringBuilder is a whiteboard (you erase and write on the same board).`,
      syntax: `using System.Text;

var sb = new StringBuilder();
for (int i = 1; i <= 3; i++)
    sb.Append("Row ").Append(i).AppendLine();
sb.Insert(0, "Report").Replace("Row", "Line");
string report = sb.ToString();
int len = sb.Length;      // Length can also be set to cut the text`,
      tip: 'Interview line: "string is immutable, StringBuilder is mutable. Use StringBuilder for heavy concatenation inside loops."',
    },
  ],
  examples: [
    {
      title: 'Common string methods in action',
      scenario: 'A data-entry screen receives a title with extra spaces. Clean it and try every important string method on it.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StringMethodsDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: methodsCode,
      csharp: { files: { 'Program.cs': methodsCode }, stdin: '' },
      result: `Original  : [  Hello CSharp World  ]
Trim      : [Hello CSharp World]
Length    : 18
Upper     : HELLO CSHARP WORLD
Lower     : hello csharp world
t[6]      : C
Substring : CSharp
IndexOf   : 13
Contains  : True
StartsWith: True
EndsWith  : False
Replace   : Hello CSharp India
Words     : 3
Join      : Hello-CSharp-World
Insert    : Hello, CSharp World
Remove    : Hello
PadLeft   : 00042
Unchanged : [  Hello CSharp World  ]`,
      explanation: `"Hello CSharp World" has 5 + 1 + 6 + 1 + 5 = 18 characters. Index 6 is 'C' (H=0, e=1, l=2, l=3, o=4, space=5, C=6). Substring(6, 6) takes 6 characters starting at index 6 = "CSharp". "World" starts at index 13 (6 for "Hello " + 7 for "CSharp "). EndsWith("world") is False because the comparison is case-sensitive. Remove(5) deletes everything from index 5 to the end. The last line proves that none of the methods changed the original text - strings are immutable. Booleans print as True/False in C#.`,
    },
    {
      title: 'Reverse a string and check palindrome strings',
      scenario: 'Student practical programs: reverse a string (two ways) and test several words and a sentence for palindrome.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ReverseStringPalindrome',
        'Replace Program.cs with the code',
        'Put a breakpoint (F9) on the if (clean[i] != clean[j]) line, press F5 and step with F10 while watching i, j and clean in the Locals window',
        'Press Ctrl+F5 for the final output',
      ],
      code: reverseCode,
      csharp: { files: { 'Program.cs': reverseCode }, stdin: '' },
      result: `Original         : Madam
Reversed (loop)  : madaM
Reversed (Array) : madaM
'Madam' -> Palindrome
'level' -> Palindrome
'Racecar' -> Palindrome
'hello' -> Not Palindrome
'A man a plan a canal Panama' -> Palindrome`,
      explanation: `The reverse loop starts at index Length - 1 (4) and goes down to 0, so "Madam" becomes "madaM" (the capital M moves to the end). Array.Reverse works on a char[] and new string(chars) turns it back into text. For the palindrome check each string is cleaned (spaces removed, lower case) - "A man a plan a canal Panama" becomes "amanaplanacanalpanama". Two pointers i (from the start) and j (from the end) move towards the middle; one mismatch is enough to stop with break. "hello" fails at the first comparison: 'h' != 'o'. The ternary needs parentheses inside the interpolation hole because of the ':' character.`,
    },
    {
      title: 'Count vowels, consonants, digits and spaces',
      scenario: 'Student practical program: analyse a sentence and count each type of character.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it VowelConsonantCounter',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: vowelsCode,
      csharp: { files: { 'Program.cs': vowelsCode }, stdin: '' },
      result: `Sentence   : Learning C# in 2026 is fun!
Length     : 27
Vowels     : 6
Consonants : 10
Digits     : 4
Spaces     : 5
Others     : 2
Words      : 6`,
      explanation: `ToLower() lets us check only lowercase letters. Vowels: e, a, i (Learning), i (in), i (is), u (fun) = 6. Consonants: l, r, n, n, g, c, n, s, f, n = 10. Digits: 2, 0, 2, 6 = 4. Spaces between the 6 words = 5. Others: '#' and '!' = 2. Check: 6 + 10 + 4 + 5 + 2 = 27 = Length. The order of the if/else-if conditions matters: vowels are tested first, so the consonant range check a-z only receives non-vowel letters.`,
    },
    {
      title: 'Immutability and StringBuilder',
      scenario: 'Prove that strings are immutable, then build and edit a student list efficiently with StringBuilder.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StringBuilderDemo',
        'Replace Program.cs with the code (note using System.Text; at the top)',
        'Press Ctrl+F5',
      ],
      code: sbCode,
      csharp: { files: { 'Program.cs': sbCode }, stdin: '' },
      result: `s1 = Hello World
s2 = Hello
After Append : Students: Asha Ravi Meena
After Insert : >> Students: Asha Ravi Meena
After Replace: >> Students: Asha Kiran Meena
After Remove : Students: Asha Kiran Meena
Length       : 26
Numbers      : 1,2,3,4,5`,
      explanation: `s1 += " World" creates a new string and points s1 to it; s2 still points to the old "Hello". The StringBuilder, on the other hand, is changed in place by Append, Insert, Replace and Remove. Remove(0, 3) deletes the 3 characters ">> ". Length = "Students:" (9) + " Asha" (5) + " Kiran" (6) + " Meena" (6) = 26. Setting nums.Length-- cuts off the trailing comma - a common trick. Interpolation {sb} calls sb.ToString() automatically.`,
    },
    {
      title: 'Comparing strings, null checks, verbatim strings and formatting',
      scenario: 'Validate user input safely, compare names ignoring case and print aligned, formatted text.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it StringCompareFormat',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
      ],
      code: compareCode,
      csharp: { files: { 'Program.cs': compareCode }, stdin: '' },
      result: `a == b              : False
Equals ignore case  : True
apple before banana : True
IsNullOrEmpty(empty)       : True
IsNullOrEmpty(blanks)      : False
IsNullOrWhiteSpace(blanks) : True
IsNullOrEmpty(nothing)     : True
Path : C:\\Courses\\DotNet
Asha scored 92 marks
Percent: 87.50%
Name: Ravi  | Marks:   75|`,
      explanation: `== is case-sensitive, so "dotnet" == "DotNet" is False; OrdinalIgnoreCase ignores case. string.Compare returns a negative number because "apple" comes before "banana". "   " is not empty (it has 3 characters) but it IS white space. The verbatim @ string prints backslashes as they are. {"Ravi",-6} left-aligns in 6 characters ("Ravi" + 2 spaces) and {75,4} right-aligns in 4 characters (2 spaces + "75"). ToString("0.00", CultureInfo.InvariantCulture) always prints 87.50 with a dot.`,
    },
  ],
  interview: [
    { q: 'Is string a value type or a reference type?', a: 'Reference type (System.String class). But it is immutable and == is overloaded to compare content, so it often behaves like a value type.', level: 'Easy' },
    { q: 'What does "strings are immutable" mean?', a: 'After a string object is created its characters can never change. Methods like Replace, ToUpper or Trim return a new string; the original stays the same.', level: 'Easy' },
    { q: 'What is the output? string s = "hello"; s.ToUpper(); Console.WriteLine(s);', a: 'hello - ToUpper returns a new string that is not stored. Write s = s.ToUpper(); to change it.', level: 'Easy' },
    { q: 'Difference between string and StringBuilder?', a: 'string is immutable - every change creates a new object. StringBuilder (System.Text) is mutable - Append/Insert/Replace/Remove change the same buffer. Use StringBuilder for many modifications, e.g. inside loops.', level: 'Medium' },
    { q: 'What is the difference between string and String?', a: 'None. string is the C# keyword alias for System.String. Convention: use string for variables and String/string for static calls (both compile the same).', level: 'Easy' },
    { q: 'What is the output? Console.WriteLine("Dot" + 1 + 2); Console.WriteLine(1 + 2 + "Dot");', a: 'Dot12 and 3Dot. Evaluation goes left to right: once a string is on the left, + means concatenation; 1 + 2 is computed as integers first in the second line.', level: 'Medium' },
    { q: 'What is the output? Console.WriteLine("CSharp".Substring(1, 3));', a: 'Sha - indexes are C=0, S=1, h=2, a=3, r=4, p=5. Start at index 1 and take 3 characters: S, h, a.', level: 'Medium' },
    { q: 'Difference between IsNullOrEmpty and IsNullOrWhiteSpace?', a: 'IsNullOrEmpty is true for null or "". IsNullOrWhiteSpace is also true for strings that contain only white-space characters like "   " or a tab.', level: 'Easy' },
    { q: 'How do you compare two strings ignoring case?', a: 'a.Equals(b, StringComparison.OrdinalIgnoreCase) or string.Equals(a, b, StringComparison.OrdinalIgnoreCase). Avoid ToLower() == ToLower() because it allocates new strings and can be culture-sensitive.', level: 'Medium' },
    { q: 'What does IndexOf return when the text is not found?', a: '-1.', level: 'Easy' },
    { q: 'How do you reverse a string in C#?', a: 'Loop from Length - 1 down to 0 and append each char (preferably with StringBuilder), or char[] arr = s.ToCharArray(); Array.Reverse(arr); new string(arr). With LINQ: new string(s.Reverse().ToArray()).', level: 'Medium' },
    { q: 'What is a verbatim string and an interpolated string?', a: 'Verbatim @"..." ignores escape sequences (good for paths) and can span lines. Interpolated $"..." embeds expressions in { }. They can be combined: $@"C:\\Users\\{user}".', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Student practical program: Reverse a string. Read a word from the user and print it in reverse order without using Array.Reverse.',
      hint: 'Loop i from s.Length - 1 down to 0 and append s[i] to a StringBuilder.',
      solution: `using System.Text;

Console.Write("Enter a word: ");
string s = Console.ReadLine() ?? "";
StringBuilder sb = new StringBuilder();
for (int i = s.Length - 1; i >= 0; i--)
{
    sb.Append(s[i]);
}
Console.WriteLine($"Reversed: {sb}");
// Input: Program  ->  Reversed: margorP`,
    },
    {
      task: 'Student practical program: Count vowels and consonants in a string entered by the user (ignore digits, spaces and symbols).',
      hint: 'Use char.IsLetter(ch) and "aeiou".Contains(char.ToLower(ch)).',
      solution: `Console.Write("Enter text: ");
string text = Console.ReadLine() ?? "";
int vowels = 0, consonants = 0;
foreach (char ch in text)
{
    if (!char.IsLetter(ch)) continue;
    if ("aeiou".Contains(char.ToLower(ch))) vowels++;
    else consonants++;
}
Console.WriteLine($"Vowels = {vowels}, Consonants = {consonants}");
// Input: Hello World  ->  Vowels = 3, Consonants = 7`,
    },
    {
      task: 'Palindrome string: check whether a string is a palindrome ignoring case (e.g. "Level" -> Palindrome, "Dotnet" -> Not Palindrome).',
      hint: 'Lower-case the string, reverse it and compare, or use two pointers.',
      solution: `Console.Write("Enter a word: ");
string word = (Console.ReadLine() ?? "").ToLower();
char[] arr = word.ToCharArray();
Array.Reverse(arr);
string rev = new string(arr);
Console.WriteLine(word == rev ? "Palindrome" : "Not Palindrome");
// Level -> Palindrome, Dotnet -> Not Palindrome`,
    },
    {
      task: 'Count how many times a character appears in a string, e.g. the letter \'a\' in "banana" (answer 3).',
      hint: 'Loop over every char and compare with ==.',
      solution: `string word = "banana";
char target = 'a';
int count = 0;
foreach (char c in word)
{
    if (c == target) count++;
}
Console.WriteLine($"'{target}' appears {count} times");
// Output: 'a' appears 3 times`,
    },
    {
      task: 'Convert a full name to title case and print the initials: "ravi kumar sharma" -> "Ravi Kumar Sharma" and "R.K.S."',
      hint: 'Split by space, then word[0].ToString().ToUpper() + word.Substring(1).',
      solution: `using System.Text;

string name = "ravi kumar sharma";
string[] parts = name.Split(' ');
StringBuilder title = new StringBuilder();
StringBuilder initials = new StringBuilder();
foreach (string p in parts)
{
    title.Append(char.ToUpper(p[0])).Append(p.Substring(1)).Append(' ');
    initials.Append(char.ToUpper(p[0])).Append('.');
}
Console.WriteLine(title.ToString().Trim());   // Ravi Kumar Sharma
Console.WriteLine(initials);                  // R.K.S.`,
    },
    {
      task: 'Count the number of words in a sentence that may contain extra spaces, e.g. "  C#   is   awesome " -> 3 words.',
      hint: 'Use Split with StringSplitOptions.RemoveEmptyEntries.',
      solution: `string s = "  C#   is   awesome ";
string[] words = s.Split(' ', StringSplitOptions.RemoveEmptyEntries);
Console.WriteLine($"Words = {words.Length}");
// Output: Words = 3`,
    },
  ],
  quiz: [
    {
      question: 'What is the output of Console.WriteLine("Hello".Length);?',
      options: ['4', '5', '6', 'Compile error'],
      answer: 1,
      explanation: 'Length counts characters: H, e, l, l, o = 5.',
    },
    {
      question: 'string s = "abc"; s.Replace("a", "x"); What is s now?',
      options: ['"xbc"', '"abc"', '"x"', 'null'],
      answer: 1,
      explanation: 'Replace returns a new string; s is unchanged because the result was not assigned.',
    },
    {
      question: 'Which class should you use to build a large string inside a loop with 10,000 iterations?',
      options: ['String', 'Char', 'StringBuilder', 'Console'],
      answer: 2,
      explanation: 'StringBuilder modifies one buffer instead of creating 10,000 new string objects.',
    },
    {
      question: 'What does "CSharp".IndexOf("z") return?',
      options: ['0', 'null', '6', '-1'],
      answer: 3,
      explanation: 'IndexOf returns -1 when the value is not found.',
    },
    {
      question: 'Which expression is true for s = "   "?',
      options: ['string.IsNullOrWhiteSpace(s)', 'string.IsNullOrEmpty(s)', 's.Length == 0', 's == null'],
      answer: 0,
      explanation: 'The string has 3 space characters: it is not empty, but it is white space only.',
    },
  ],
};
