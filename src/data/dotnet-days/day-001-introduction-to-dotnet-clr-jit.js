const helloCode = `// Program.cs (top-level statements, .NET 6+)
Console.WriteLine("Hello, .NET!");
Console.WriteLine("This line was compiled to IL and then JIT-compiled to machine code.");
Console.WriteLine("Welcome to the .NET Full Stack course.");`;

const pipelineCode = `using System;

namespace ExecutionDemo
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("Step 1: You write C# source code in a .cs file");
            Console.WriteLine("Step 2: The Roslyn compiler turns it into IL inside an assembly (.dll)");
            Console.WriteLine("Step 3: The CLR loads the assembly into memory");
            Console.WriteLine("Step 4: The JIT compiler converts IL to native machine code");
            Console.WriteLine("Step 5: The CPU runs the machine code");

            // Square is JIT-compiled the first time it is called
            int result = Square(7);
            Console.WriteLine("Square(7) = " + result);

            // Second call re-uses the already compiled machine code
            Console.WriteLine("Square(12) = " + Square(12));
        }

        static int Square(int n)
        {
            return n * n;
        }
    }
}`;

const ctsCode = `// CTS: every C# keyword type is an alias for a .NET type
int a = 10;
System.Int32 b = 20;          // exactly the same type as int
Console.WriteLine(a + b);

Console.WriteLine(typeof(int).FullName);
Console.WriteLine(typeof(string).FullName);
Console.WriteLine(typeof(double).FullName);
Console.WriteLine(typeof(bool).FullName);
Console.WriteLine(typeof(decimal).FullName);
Console.WriteLine(typeof(int) == typeof(System.Int32));`;

const clrCode = `// The CLR protects you: type safety and exception handling
object data = "Hello";
Console.WriteLine("Actual type: " + data.GetType().Name);

try
{
    int number = (int)data;      // a string is not an int
    Console.WriteLine(number);
}
catch (InvalidCastException)
{
    Console.WriteLine("CLR stopped an invalid cast (InvalidCastException)");
}

int[] marks = { 70, 80, 90 };
try
{
    Console.WriteLine(marks[3]);  // index 3 does not exist
}
catch (IndexOutOfRangeException)
{
    Console.WriteLine("CLR checked the array bounds (IndexOutOfRangeException)");
}

Console.WriteLine("Program finished safely");`;

export default {
  id: 'day-001-introduction-to-dotnet-clr-jit',
  title: 'Introduction to .NET, C#, .NET Framework vs Modern .NET, CLR, CTS, CLS, JIT',
  module: 'Module 1: C# Programming Fundamentals',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand what .NET and C# are, how the old .NET Framework differs from modern cross-platform .NET (.NET 8 / .NET 10 LTS), and how your C# code is executed step by step: source code -> compiler -> IL -> CLR -> JIT -> machine code, with CTS and CLS making languages work together.',
  objectives: [
    'Explain what .NET is and what C# is, and how they are related',
    'Compare .NET Framework 4.8 with modern .NET (Core, 5, 6, 8, 10)',
    'Describe the role of the CLR, CTS, CLS, BCL and the JIT compiler',
    'Trace the full journey of C# code from a .cs file to machine code',
    'Run a first C# program using the dotnet CLI or Visual Studio',
  ],
  theory: [
    {
      heading: 'What is .NET and what is C#?',
      content: `.NET is a free, open-source developer platform made by Microsoft for building many kinds of applications: console apps, websites (ASP.NET Core), Web APIs, desktop apps (WPF, WinForms, MAUI), mobile apps, cloud services, games (Unity) and more. A platform means three things together: a runtime that runs your program (the CLR), a huge library of ready-made code (the Base Class Library, BCL) and tools (compiler, SDK, dotnet CLI, Visual Studio).
C# (pronounced "C sharp") is the most popular programming language used on .NET. It is a modern, type-safe, object-oriented language. Think of .NET as a kitchen (stove, utensils, ingredients) and C# as the recipe language you write in. Other .NET languages are F# and VB.NET, and all of them run on the same kitchen.`,
      points: [
        '.NET = runtime (CLR) + libraries (BCL) + SDK tools',
        'C# = the language; current versions: C# 12 (.NET 8), C# 14 (.NET 10)',
        '.NET 10 is the current LTS (Long Term Support, 3 years); .NET 8 is the previous LTS',
        'One platform for web, desktop, mobile, cloud, IoT and games',
      ],
      tip: 'In interviews say: ".NET is the platform, C# is a language that targets the platform".',
    },
    {
      heading: '.NET Framework vs Modern .NET',
      content: `The original .NET Framework (2002, last version 4.8.1) runs only on Windows and is now in maintenance mode: it gets security fixes but no new features. In 2016 Microsoft rewrote the platform as .NET Core, which is cross-platform (Windows, Linux, macOS), open-source and much faster. From version 5 the word "Core" was dropped, so we now simply say .NET 5, 6, 7, 8, 9, 10. Even-numbered versions (6, 8, 10) are LTS releases supported for 3 years; odd versions are STS (Standard Term Support, 2 years).`,
      points: [
        '.NET Framework 4.x: Windows only, closed design, installed with Windows, used by old ASP.NET Web Forms/MVC 5 apps',
        'Modern .NET: cross-platform, open-source, side-by-side versions, very high performance, container friendly',
        'New projects should always use modern .NET (we use .NET 10 LTS; code also works on .NET 8)',
        'ASP.NET Core, EF Core, Blazor and MAUI exist only on modern .NET',
      ],
      tip: 'If a job description says ".NET Core" it means modern .NET.',
    },
    {
      heading: 'CLR - Common Language Runtime',
      content: `The CLR is the "engine" that runs .NET programs. Code that runs under the CLR is called managed code. When you start a .NET app, the CLR loads your assembly, checks it, compiles it to machine code with the JIT and then manages it while it runs. Analogy: the CLR is like a hotel manager - you (the guest/program) just ask for things, and the manager handles rooms (memory), security and cleaning (garbage collection).`,
      points: [
        'Memory management: allocates objects and frees unused ones with the Garbage Collector (GC)',
        'Type safety: blocks invalid casts and checks array bounds',
        'Exception handling: one common way of reporting errors across all languages',
        'Security and thread management',
        'JIT compilation of IL into native machine code',
      ],
    },
    {
      heading: 'CTS and CLS - making languages work together',
      content: `CTS (Common Type System) defines all data types the runtime understands, such as System.Int32, System.String and System.Boolean. Every language maps its own keywords to these types: C# int, VB.NET Integer and F# int are all System.Int32. That is why a class written in VB.NET can be used from C#.
CLS (Common Language Specification) is a subset of rules from the CTS that every .NET language must support. If your public library follows the CLS, any .NET language can use it. Example: C# supports unsigned types like uint, but uint is not CLS-compliant because some languages do not have unsigned integers, so you should avoid uint in public APIs.`,
      syntax: `int x = 5;            // C# keyword
System.Int32 y = 5;   // CTS type - identical to int
string s = "hi";      // alias of System.String`,
      points: [
        'CTS = the full set of types (value types and reference types)',
        'CLS = the common minimum rules for cross-language compatibility',
        '[assembly: CLSCompliant(true)] asks the compiler to warn about non-CLS public members',
      ],
    },
    {
      heading: 'How C# code executes: Compiler, IL, JIT',
      content: `Running a C# program happens in two stages. Stage 1 (compile time): the C# compiler (Roslyn) converts your .cs files into IL (Intermediate Language, also called MSIL or CIL) and stores it, together with metadata, in an assembly file (.dll or .exe). IL is CPU-independent. Stage 2 (run time): the CLR loads the assembly and the JIT (Just-In-Time) compiler converts each method's IL into native machine code for the current CPU the first time that method is called. The machine code is cached, so the second call is fast.`,
      syntax: `Program.cs  --(csc / Roslyn)-->  MyApp.dll (IL + metadata)
MyApp.dll   --(CLR loads)-->     JIT compiler
JIT         --(per method)-->   native x64 / ARM64 machine code  --> CPU`,
      points: [
        'Assembly = compiled unit (.dll/.exe) containing IL, metadata and a manifest',
        'Tiered JIT: quick code first (Tier 0), optimized code later for hot methods (Tier 1)',
        'ReadyToRun and Native AOT can pre-compile to machine code for faster startup',
        'Because IL is CPU-independent, the same .dll runs on Windows, Linux and macOS',
      ],
      tip: 'Remember the chain: C# -> IL -> JIT -> Machine code.',
    },
    {
      heading: 'BCL, SDK, Runtime and the dotnet CLI',
      content: `The BCL (Base Class Library) gives you thousands of ready classes: Console, Math, String, List<T>, File, HttpClient, DateTime and more. The .NET SDK is what developers install - it contains the compiler, the runtime and the dotnet command-line tool. The .NET Runtime alone is enough to run apps on a server. With the CLI you can create, build and run projects without Visual Studio.`,
      syntax: `dotnet --version          # shows installed SDK version
dotnet new console -n HelloApp
cd HelloApp
dotnet build              # compile to IL (bin/Debug/net10.0/HelloApp.dll)
dotnet run                # build + run`,
      points: [
        'SDK = for developers (build + run); Runtime = for running only',
        'Visual Studio installs the SDK for you (Day 2)',
        'Output lives in bin/Debug/net10.0/ (or net8.0)',
      ],
    },
  ],
  examples: [
    {
      title: 'Your first C# program (Hello .NET)',
      scenario: 'Create and run the smallest possible C# program to see the full compile-and-run cycle.',
      steps: [
        'In Visual Studio: File > New > Project > Console App (C#) > Next',
        'Name it HelloDotNet, choose Framework .NET 10.0 (Long Term Support) or .NET 8.0 > Create',
        'Replace the content of Program.cs with the code',
        'Press Ctrl+F5 (Start Without Debugging) to run',
        'Alternative with CLI: dotnet new console -n HelloDotNet, paste the code, then dotnet run',
      ],
      code: helloCode,
      csharp: { files: { 'Program.cs': helloCode }, stdin: '' },
      result: `Hello, .NET!
This line was compiled to IL and then JIT-compiled to machine code.
Welcome to the .NET Full Stack course.`,
      explanation: 'Modern C# allows top-level statements: the compiler generates the class Program and the Main method for you. Console.WriteLine is a method from the BCL (System.Console class) that prints text and moves to the next line. The build produces HelloDotNet.dll containing IL; when you run it, the CLR JIT-compiles the code and executes it.',
    },
    {
      title: 'Tracing how C# code executes (classic Main method)',
      scenario: 'Print the five stages of execution and call a method twice to understand JIT compilation per method.',
      steps: [
        'File > New > Project > Console App, name it ExecutionDemo',
        'In the "Additional information" page tick "Do not use top-level statements" to get the classic class Program with Main',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Open the bin\\Debug\\net10.0 folder (right-click project > Open Folder in File Explorer) and see ExecutionDemo.dll',
      ],
      code: pipelineCode,
      csharp: { files: { 'Program.cs': pipelineCode }, stdin: '' },
      result: `Step 1: You write C# source code in a .cs file
Step 2: The Roslyn compiler turns it into IL inside an assembly (.dll)
Step 3: The CLR loads the assembly into memory
Step 4: The JIT compiler converts IL to native machine code
Step 5: The CPU runs the machine code
Square(7) = 49
Square(12) = 144`,
      explanation: 'Main is the entry point the CLR calls first. When Square(7) is called for the first time, the JIT compiles Square\'s IL to machine code (7 * 7 = 49). The second call Square(12) reuses the compiled code (12 * 12 = 144). "Square(7) = " + result joins a string and a number into one string.',
    },
    {
      title: 'CTS in action: C# keywords are .NET types',
      scenario: 'Prove that int and System.Int32 are the same CTS type and see the real .NET names of common types.',
      steps: [
        'File > New > Project > Console App, name it CtsDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and compare the printed type names',
      ],
      code: ctsCode,
      csharp: { files: { 'Program.cs': ctsCode }, stdin: '' },
      result: `30
System.Int32
System.String
System.Double
System.Boolean
System.Decimal
True`,
      explanation: 'typeof(T).FullName returns the CTS name of a type. int is only a C# alias for System.Int32, so a + b works directly (10 + 20 = 30) and typeof(int) == typeof(System.Int32) is True. VB.NET Integer would print the same System.Int32 - this shared type system is what lets languages interoperate.',
    },
    {
      title: 'CLR safety: type checks and array bounds',
      scenario: 'See how the CLR stops dangerous operations (invalid cast, reading outside an array) instead of crashing memory like C/C++ can.',
      steps: [
        'File > New > Project > Console App, name it ClrSafety',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Optional: remove the try/catch around marks[3] and press F5 - Visual Studio stops with an unhandled IndexOutOfRangeException',
      ],
      code: clrCode,
      csharp: { files: { 'Program.cs': clrCode }, stdin: '' },
      result: `Actual type: String
CLR stopped an invalid cast (InvalidCastException)
CLR checked the array bounds (IndexOutOfRangeException)
Program finished safely`,
      explanation: 'data holds a string, so GetType().Name prints String. Casting it to int is invalid; the CLR throws InvalidCastException, which we catch. The array has indexes 0, 1, 2, so marks[3] throws IndexOutOfRangeException. This runtime checking is part of "managed code" provided by the CLR.',
    },
    {
      title: 'Creating, building and running with the dotnet CLI',
      scenario: 'Use the terminal to see the SDK tools that Visual Studio uses behind the scenes.',
      steps: [
        'Open Windows Terminal / PowerShell (or View > Terminal in Visual Studio)',
        'Run dotnet --version to check the SDK',
        'Run the commands in the code one by one',
        'Look inside bin/Debug/net10.0 to find HelloCli.dll (the IL assembly)',
      ],
      code: `dotnet --version
# 10.0.100   (your exact version may differ)

dotnet new console -n HelloCli
cd HelloCli
dotnet build
# Build succeeded.  ->  bin/Debug/net10.0/HelloCli.dll

dotnet run
# Hello, World!

dotnet --list-sdks        # all installed SDKs
dotnet --list-runtimes    # all installed runtimes`,
      result: `dotnet run prints:
Hello, World!
(dotnet --version prints your installed SDK version, for example 10.0.100 or 8.0.4xx)`,
      explanation: 'dotnet new console creates HelloCli.csproj and Program.cs (with Console.WriteLine("Hello, World!")). dotnet build runs the Roslyn compiler and produces IL in a .dll. dotnet run builds if needed and then starts the CLR, which JIT-compiles and runs the program.',
    },
  ],
  interview: [
    { q: 'What is .NET?', a: '.NET is a free, open-source, cross-platform developer platform from Microsoft consisting of a runtime (CLR), a large Base Class Library and SDK tools, used to build web, desktop, mobile, cloud and console applications in languages like C#, F# and VB.NET.', level: 'Easy' },
    { q: 'What is the difference between .NET Framework and modern .NET?', a: '.NET Framework (up to 4.8.1) is Windows-only and in maintenance mode. Modern .NET (.NET Core, then .NET 5+) is cross-platform, open-source, faster, supports side-by-side versions and containers, and is where all new features (ASP.NET Core, EF Core, Native AOT) are developed.', level: 'Easy' },
    { q: 'What is the CLR and what are its responsibilities?', a: 'The Common Language Runtime is the execution engine of .NET. It loads assemblies, JIT-compiles IL to machine code, manages memory with the garbage collector, enforces type safety, handles exceptions, and manages threads and security.', level: 'Easy' },
    { q: 'What is IL (MSIL/CIL)?', a: 'Intermediate Language is the CPU-independent instruction set produced by .NET compilers. It is stored in assemblies and converted to native code by the JIT at run time (or ahead of time with ReadyToRun/Native AOT).', level: 'Easy' },
    { q: 'What is JIT compilation? Why not compile directly to machine code?', a: 'Just-In-Time compilation converts a method\'s IL to native code the first time it is called and caches it. It allows the same assembly to run on any OS/CPU and lets the runtime optimize for the actual machine (tiered compilation, dynamic PGO). Native AOT is an option when fast startup matters more.', level: 'Medium' },
    { q: 'Explain CTS and CLS.', a: 'CTS (Common Type System) defines all types and how they behave in the runtime, e.g. System.Int32. CLS (Common Language Specification) is a subset of CTS rules every .NET language must support, so CLS-compliant libraries can be used from any .NET language. Example: uint is CTS but not CLS-compliant.', level: 'Medium' },
    { q: 'What is managed code and unmanaged code?', a: 'Managed code runs under the control of the CLR (memory managed by GC, type checks). Unmanaged code runs directly on the OS without the CLR, e.g. C/C++ native DLLs, and must manage its own memory.', level: 'Easy' },
    { q: 'What is an assembly?', a: 'An assembly is the compiled deployment unit of .NET (.dll or .exe). It contains IL code, metadata describing types, a manifest (name, version, references) and optional resources.', level: 'Easy' },
    { q: 'Output? Console.WriteLine(typeof(int) == typeof(System.Int32));', a: 'True - int is just the C# alias for the CTS type System.Int32.', level: 'Easy' },
    { q: 'Output? Console.WriteLine(typeof(string).FullName);', a: 'System.String', level: 'Easy' },
    { q: 'What is the difference between the .NET SDK and the .NET Runtime?', a: 'The SDK is for developers: compiler, CLI (dotnet new/build/run/publish), templates plus the runtime. The Runtime only contains what is needed to run already-built apps, e.g. on a production server.', level: 'Medium' },
    { q: 'What is LTS and which .NET versions are LTS?', a: 'LTS = Long Term Support (3 years of patches). Even-numbered releases are LTS: .NET 6, .NET 8 and .NET 10. Odd ones (7, 9) are STS with 2 years (previously 18 months) of support.', level: 'Medium' },
  ],
  practice: [
    { task: 'Install the .NET SDK (or Visual Studio) and run dotnet --version, dotnet --list-sdks and dotnet --list-runtimes. Write down what each command shows.', hint: 'Open PowerShell or the Visual Studio Terminal (View > Terminal).', solution: 'dotnet --version prints the active SDK version (e.g. 10.0.100). dotnet --list-sdks lists every installed SDK with its folder. dotnet --list-runtimes lists Microsoft.NETCore.App, Microsoft.AspNetCore.App and Microsoft.WindowsDesktop.App runtimes with versions.' },
    { task: 'Write a Hello World program that prints your name, your city and the line "I am learning C# on .NET".', hint: 'Use three Console.WriteLine statements with top-level statements.', solution: `Console.WriteLine("Name: Asha");
Console.WriteLine("City: Pune");
Console.WriteLine("I am learning C# on .NET");` },
    { task: 'Print the CTS names of long, char, float and object using typeof(...).FullName.', hint: 'typeof(long).FullName returns a string.', solution: `Console.WriteLine(typeof(long).FullName);   // System.Int64
Console.WriteLine(typeof(char).FullName);   // System.Char
Console.WriteLine(typeof(float).FullName);  // System.Single
Console.WriteLine(typeof(object).FullName); // System.Object` },
    { task: 'Draw (on paper) the journey of Program.cs to machine code and label: Roslyn, IL, Assembly, CLR, JIT, CPU. Then explain it to a friend in 5 lines.', hint: 'Two stages: compile time and run time.', solution: 'Compile time: Program.cs -> Roslyn compiler -> IL + metadata stored in an assembly (MyApp.dll). Run time: CLR loads MyApp.dll -> JIT compiles each method to native code on first call -> CPU executes it; GC manages memory while it runs.' },
    { task: 'Make a table comparing .NET Framework 4.8 and .NET 10 on: OS support, open source, performance, new features, typical use.', hint: 'Use the theory section.', solution: '.NET Framework 4.8: Windows only | partly open | slower | no new features | legacy apps (Web Forms, WCF server). .NET 10: Windows/Linux/macOS | fully open source | much faster | all new features | all new apps (ASP.NET Core, APIs, microservices, MAUI).' },
  ],
  quiz: [
    { question: 'What does the C# compiler (Roslyn) produce?', options: ['Native machine code', 'IL (Intermediate Language) in an assembly', 'JavaScript', 'Java bytecode'], answer: 1, explanation: 'The C# compiler outputs CPU-independent IL plus metadata inside a .dll/.exe assembly.' },
    { question: 'Which component converts IL to native machine code at run time?', options: ['CTS', 'CLS', 'BCL', 'JIT compiler'], answer: 3, explanation: 'The Just-In-Time compiler inside the CLR compiles each method when it is first called.' },
    { question: 'Which statement about modern .NET (.NET 8/.NET 10) is TRUE?', options: ['It is cross-platform and open-source', 'It runs only on Windows', 'It is the same as .NET Framework 4.8', 'It cannot run console apps'], answer: 0, explanation: 'Modern .NET runs on Windows, Linux and macOS and is open source.' },
    { question: 'C# int is an alias for which CTS type?', options: ['System.Integer', 'System.Int64', 'System.Int32', 'System.Number'], answer: 2, explanation: 'int maps to System.Int32 (32-bit signed integer).' },
    { question: 'What is the main purpose of the CLS?', options: ['To garbage-collect memory', 'To define rules so libraries can be used from any .NET language', 'To compile C# to IL', 'To run code on the GPU'], answer: 1, explanation: 'The Common Language Specification is the minimum set of rules all .NET languages agree on for interoperability.' },
  ],
};
