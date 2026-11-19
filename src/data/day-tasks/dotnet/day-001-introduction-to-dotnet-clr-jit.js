export default {
  lesson: 'day-001-introduction-to-dotnet-clr-jit',
  minutes: 15,
  intro: 'Check what .NET and C# are, how a C# program runs (source → IL → CLR/JIT → machine code) and what CTS and CLS mean.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In .NET, which component **runs** your compiled program and provides garbage collection, type safety and exception handling?',
      options: ['The C# compiler (Roslyn)', 'The CLR (Common Language Runtime)', 'Visual Studio', 'NuGet'],
      answer: 1,
      explain: 'The **CLR** is the execution engine of .NET: it loads the assembly, JIT-compiles IL to machine code, manages memory with the garbage collector and handles exceptions. Roslyn only compiles C# to IL, and Visual Studio is just an editor/IDE.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'When you build a C# project, the compiler does NOT produce machine code. It produces CPU-independent code stored in the .dll/.exe. What is this code called? (short name or full name)',
      example: { title: 'the pipeline', text: 'Program.cs → C# compiler → ??? (inside MyApp.dll) → CLR + JIT → native machine code' },
      accept: ['IL', 'MSIL', 'CIL', 'Intermediate Language', 'Microsoft Intermediate Language', 'Common Intermediate Language', 'IL code', 'MSIL code'],
      explain: 'C# compiles to **IL (Intermediate Language, also called MSIL or CIL)**. The same IL runs on Windows, Linux and macOS because each platform\'s CLR translates it to native code. Saying "machine code" is the common mistake: that is produced later by the JIT.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does the **JIT (Just-In-Time) compiler** do?',
      options: [
        'Converts C# source code into IL when you press Build',
        'Converts IL into native machine code at runtime, method by method, when it is first called',
        'Downloads NuGet packages just in time',
        'Checks your code for spelling mistakes while you type',
      ],
      answer: 1,
      explain: 'The **JIT** works at **runtime**: the first time a method is called, its IL is compiled to native CPU instructions and cached, so later calls are fast. Compiling C# → IL is the job of the C# compiler at build time, not the JIT.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **.NET Framework vs modern .NET (.NET 5/6/8 and later)** are TRUE? (choose all that apply)',
      options: [
        'Modern .NET is cross-platform (Windows, Linux, macOS)',
        'Modern .NET is open source',
        '.NET Framework 4.x runs only on Windows',
        'Modern .NET can run only on Windows servers',
        'New projects should normally target modern .NET (for example .NET 8)',
        'C# code cannot be used with modern .NET',
      ],
      answers: [0, 1, 2, 4],
      explain: '.NET Framework (up to 4.8) is Windows-only and in maintenance mode. **Modern .NET** (.NET Core → .NET 5, 6, 8 …) is **open source and cross-platform**, and it is what new projects target. C# is the main language of both.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In C#, `int` and in VB.NET `Integer` both map to the same .NET type `System.Int32`. Which part of .NET defines these common data types for all .NET languages? (abbreviation)',
      example: { title: 'one type, many languages', text: 'C# string  → System.String\nVB.NET String → System.String\nThe rules that define System.String, System.Int32 … are called the C??' },
      accept: ['CTS', 'Common Type System'],
      explain: 'The **CTS (Common Type System)** defines all .NET types so every language shares them. The **CLS (Common Language Specification)** is a smaller set of rules (a subset of CTS) that code must follow to be usable from every .NET language, e.g. avoid `uint` in public APIs.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this first C# program print? (one line per WriteLine)',
      example: { title: 'WriteLine prints text and a new line', code: 'Console.WriteLine("Namaste");\nConsole.WriteLine(".NET");\n// prints:\n// Namaste\n// .NET' },
      code: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello, .NET!");
        // Console.WriteLine("This line is a comment");
        Console.WriteLine("C# runs on the CLR");
    }
}`,
      expected: `Hello, .NET!
C# runs on the CLR`,
      explain: 'Each `Console.WriteLine` prints its text and moves to a new line. The line starting with `//` is a comment, so the compiler ignores it and it never prints.',
    },
  ],
};
