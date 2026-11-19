export default {
  lesson: 'day-004-variables-constants-data-types',
  minutes: 15,
  intro: 'Practise declaring variables and constants and choosing the right C# data type (int, long, double, decimal, char, bool, string).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A shop app stores product prices like ₹499.99 and must add them **without rounding errors**. Which type should you use?',
      options: ['float', 'double', 'decimal', 'int'],
      answer: 2,
      explain: '`decimal` stores base-10 numbers exactly (28-29 digits), so it is the right choice for money. `double`/`float` are binary floating point: `0.1 + 0.2` is not exactly `0.3`. `int` cannot store paise.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the declaration so the value can never be changed after compilation:\n`____ double GstRate = 0.18;`',
      example: { title: 'a constant', code: 'const int MaxStudents = 60;\n// MaxStudents = 70;  // compile error' },
      accept: ['const'],
      caseSensitive: true,
      explain: '`const` makes a compile-time constant; it must be given a value immediately and cannot be reassigned. (`readonly` is for fields that are set once at runtime, e.g. in a constructor.)',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'This line does not compile: `decimal fee = 1250.50;` because `1250.50` is a double literal. Rewrite the line correctly.',
      example: { title: 'literal suffixes', code: 'float f = 3.5f;\nlong big = 9000000000L;' },
      accept: ['decimal fee = 1250.50m;', 'decimal fee = 1250.50M;', 'decimal fee = 1250.5m;', 'decimal fee = 1250.5M;'],
      acceptRegex: ['^decimal\\s+fee\\s*=\\s*1250\\.50?[mM]\\s*;?$'],
      explain: 'A number with a decimal point is a `double` by default, and there is no implicit conversion from double to decimal. Add the **`m` suffix** (`1250.50m`) to make it a decimal literal. Likewise `f` for float and `L` for long.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid** C# variable names? (choose all that apply)',
      options: ['studentName', '_count', '2ndRank', 'total-marks', '@class', 'class'],
      answers: [0, 1, 4],
      explain: 'Names must start with a letter or `_`, and may contain letters, digits and `_`. `2ndRank` starts with a digit and `total-marks` contains `-`. `class` is a keyword, but `@class` is allowed: the `@` prefix lets you use a keyword as an identifier.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'char is a number underneath', code: "char grade = 'B';\nConsole.WriteLine(grade);      // B\nConsole.WriteLine((int)grade); // 66" },
      code: `char c = 'A';
int n = c + 2;
Console.WriteLine(c);
Console.WriteLine(n);
Console.WriteLine((char)n);
bool isPass = true;
Console.WriteLine(isPass);`,
      expected: `A
67
C
True`,
      explain: '`char` stores a UTF-16 code: \'A\' is 65, so `c + 2` is the **int** 67. Casting back with `(char)67` gives `C`. Note that C# prints booleans as **True**/**False** with a capital letter.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this print? (`int` is 32-bit, `long` is 64-bit)',
      example: { title: 'type limits', code: 'Console.WriteLine(byte.MaxValue); // 255\nConsole.WriteLine(sizeof(short)); // 2' },
      code: `Console.WriteLine(sizeof(int));
Console.WriteLine(sizeof(long));
Console.WriteLine(int.MaxValue);
string city = "Pune";
var pin = 411001;
Console.WriteLine($"{city} - {pin}");`,
      expected: `4
8
2147483647
Pune - 411001`,
      explain: '`int` takes 4 bytes (range up to 2,147,483,647) and `long` 8 bytes. `var` lets the compiler infer the type (here `int`). `$"..."` is string interpolation: values in `{}` are inserted into the text.',
    },
  ],
};
