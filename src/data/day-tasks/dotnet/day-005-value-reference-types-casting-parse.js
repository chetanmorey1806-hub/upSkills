export default {
  lesson: 'day-005-value-reference-types-casting-parse',
  minutes: 18,
  intro: 'Practise value vs reference types, implicit/explicit casting, Convert, Parse and TryParse.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Value type vs reference type: what does this print?',
      example: { title: 'copying a value', code: 'int x = 1;\nint y = x;  // y gets its own copy\ny = 2;\nConsole.WriteLine(x); // 1' },
      code: `int a = 5;
int b = a;
b = 10;
int[] marks = { 70, 80 };
int[] copy = marks;
copy[0] = 99;
Console.WriteLine(a);
Console.WriteLine(marks[0]);`,
      expected: `5
99`,
      explain: '`int` is a **value type**: `b = a` copies the number, so changing `b` does not touch `a`. Arrays are **reference types**: `copy = marks` copies the reference, so both variables point to the same array and `marks[0]` becomes 99.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which conversions happen **implicitly** (no cast needed, no data loss)? (choose all that apply)',
      options: ['int → long', 'int → double', 'double → int', 'long → int', "char → int", 'decimal → double'],
      answers: [0, 1, 4],
      explain: 'Implicit conversions are allowed only when no information can be lost: int → long, int → double, char → int. Going to a smaller/less precise type (double → int, long → int) needs an **explicit cast** `(int)x`. decimal ↔ double always needs an explicit cast.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Casting vs Convert: what does this print?',
      example: { title: 'explicit cast', code: 'double rating = 4.8;\nint stars = (int)rating;\nConsole.WriteLine(stars); // 4 (decimal part dropped)' },
      code: `double price = 99.99;
int a = (int)price;
int b = Convert.ToInt32(price);
int c = int.Parse("250") + 50;
Console.WriteLine(a);
Console.WriteLine(b);
Console.WriteLine(c);`,
      expected: `99
100
300`,
      explain: 'A cast `(int)` **truncates** (just drops the decimal part) → 99. `Convert.ToInt32` **rounds** to the nearest integer → 100. `int.Parse("250")` turns text into the number 250, so 250 + 50 = 300 (not "25050").',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line so it safely converts user input without throwing an exception:\n`bool ok = int.TryParse(input, ___ int age);`\n(write only the missing keyword)',
      example: { title: 'TryParse pattern', code: 'if (double.TryParse(text, out double amount))\n    Console.WriteLine(amount * 2);\nelse\n    Console.WriteLine("Not a number");' },
      accept: ['out'],
      caseSensitive: true,
      explain: '`TryParse` returns `true/false` and gives the parsed value back through an **`out`** parameter. If the text is invalid, it returns false and sets `age` to 0 instead of throwing.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens when this runs?\n`int qty = int.Parse("ten");`',
      options: ['qty becomes 10', 'qty becomes 0', 'A FormatException is thrown at runtime', 'It does not compile'],
      answer: 2,
      explain: '`int.Parse` throws **FormatException** when the text is not a valid number. It compiles fine because the compiler cannot know what text arrives at runtime. Use `int.TryParse` for user input.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which of these is a **reference type** in C#?',
      options: ['int', 'bool', 'string', 'DateTime (a struct)'],
      answer: 2,
      explain: '`string` is a reference type (a class), though it is immutable so it often behaves like a value. `int`, `bool`, `double`, `char`, `decimal`, `DateTime` and all `struct`s/`enum`s are value types.',
    },
  ],
};
