export default {
  lesson: 'day-003-csharp-syntax-statements-namespace-main',
  minutes: 15,
  intro: 'Check C# syntax rules: statements and semicolons, comments, namespaces with using, and the Main method.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the name of the method where a C# console program **starts** running?',
      options: ['Start', 'main', 'Main', 'Run'],
      answer: 2,
      explain: 'The entry point is `static void Main(string[] args)` (or `static int Main` / `static async Task Main`). C# is **case-sensitive**, so `main` with a small m is not the entry point; that is Java/C style.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Complete the entry point declaration:\n`static void ____(string[] args)`',
      example: { title: 'a method declaration', code: 'static void Greet(string name)\n{\n    Console.WriteLine("Hi " + name);\n}' },
      accept: ['Main'],
      caseSensitive: true,
      explain: 'The method must be called exactly `Main` (capital M). `static` means it can run without creating an object, and `string[] args` receives command-line arguments.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which keyword at the top of a file lets you write `Console.WriteLine` instead of `System.Console.WriteLine`? Write the full line.',
      example: { title: 'importing a namespace', code: 'using System.Text;   // now you can write StringBuilder instead of System.Text.StringBuilder' },
      accept: ['using System;', 'using System'],
      caseSensitive: true,
      explain: '`using System;` imports the `System` namespace, so its types (`Console`, `Math`, `String`) can be used by their short names. In .NET 6+ projects this is often added automatically by **implicit usings**.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are valid **comments** in C#? (choose all that apply)',
      options: ['// single-line comment', '/* multi-line\n   comment */', '/// <summary>XML doc comment</summary>', '# shell style comment', '<!-- html comment -->'],
      answers: [0, 1, 2],
      explain: 'C# supports `//` single-line, `/* … */` multi-line and `///` XML documentation comments (used by IntelliSense). `#` starts a preprocessor directive like `#region`, and `<!-- -->` is HTML.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with this line?\n`console.WriteLine("Hello")`',
      options: ['It prints Hello', 'Compile errors: `console` must be `Console`, and the statement needs a `;`', 'It prints hello in small letters', 'It runs but prints nothing'],
      answer: 1,
      explain: 'C# is **case-sensitive** (`Console` ≠ `console`) and every statement ends with a **semicolon**. Both mistakes are compile-time errors, so the program does not run at all.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print? Mind the difference between `Write` and `WriteLine`.',
      example: { title: 'Write vs WriteLine', code: 'Console.Write("A");\nConsole.Write("B");\nConsole.WriteLine("C");\nConsole.WriteLine("D");\n// prints:\n// ABC\n// D' },
      code: `namespace SchoolApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.Write("Roll ");
            Console.Write(101);
            Console.WriteLine();
            Console.WriteLine("Name: Asha");
            /* Console.WriteLine("Hidden"); */
            Console.Write("Done");
        }
    }
}`,
      expected: `Roll 101
Name: Asha
Done`,
      explain: '`Write` prints without a new line, `WriteLine()` ends the current line. So "Roll " and 101 share the first line. The `/* … */` comment is ignored.',
    },
  ],
};
