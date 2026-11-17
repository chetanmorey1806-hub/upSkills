const studentCode = `using System;

namespace StudentApp
{
    class Program
    {
        static void Main(string[] args)
        {
            Console.WriteLine("===== STUDENT DETAILS =====");
            Console.WriteLine("Name    : Ananya Sharma");
            Console.WriteLine("Roll No : 101");
            Console.WriteLine("Course  : .NET Full Stack");
            Console.WriteLine("City    : Hyderabad");
            Console.Write("Status  : ");      // Write does NOT move to a new line
            Console.WriteLine("Active");
            Console.WriteLine("===========================");
        }
    }
}`;

const commentsCode = `using System;

namespace CommentsDemo
{
    class Program
    {
        static void Main()
        {
            // Single-line comment: the compiler ignores this line
            int width = 10;    // inline comment: width in meters
            int height = 5;

            /* Multi-line comment:
               everything between the markers is ignored,
               useful for longer explanations */

            // Console.WriteLine("This line is commented out and will not print");

            Console.WriteLine("Width = " + width);
            Console.WriteLine("Height = " + height);
            Console.WriteLine("Area = " + Area(width, height));
        }

        /// <summary>
        /// Calculates the area of a rectangle.
        /// </summary>
        /// <param name="w">Width of the rectangle</param>
        /// <param name="h">Height of the rectangle</param>
        /// <returns>Width multiplied by height</returns>
        static int Area(int w, int h)
        {
            return w * h;
        }
    }
}`;

const statementsCode = `// Different kinds of statements
int a = 5;                  // declaration statement with initializer
int b = 7;
int sum;                    // declaration without a value
sum = a + b;                // expression (assignment) statement
Console.WriteLine(sum);     // method call statement

{                           // a block { } groups statements
    int doubled = sum * 2;  // doubled exists only inside this block
    Console.WriteLine(doubled);
}

int x = 1; int y = 2; Console.WriteLine(x + y);   // three statements on one line

string Name = "Upper";      // C# is case-sensitive:
string name = "lower";      // Name and name are two different variables
Console.WriteLine(Name + " / " + name);

Console.WriteLine("End of statements demo");`;

const namespaceCode = `using System;
using Hr = Company.HR;      // using alias directive

namespace Company.HR
{
    class Report
    {
        public static void Print()
        {
            Console.WriteLine("HR Report: 25 employees");
        }
    }
}

namespace Company.Finance
{
    class Report            // same class name, different namespace - no conflict
    {
        public static void Print()
        {
            Console.WriteLine("Finance Report: Profit 120000");
        }
    }
}

namespace NamespaceDemo
{
    class Program
    {
        static void Main()
        {
            Hr.Report.Print();                  // through the alias
            Company.Finance.Report.Print();     // fully qualified name
            Console.WriteLine("Full name: " + typeof(Company.Finance.Report).FullName);
            Console.WriteLine("Namespace of Console: " + typeof(Console).Namespace);
        }
    }
}`;

const mainCode = `using System;

class Program
{
    // Main can return int (exit code) and receive command-line arguments
    static int Main(string[] args)
    {
        Console.WriteLine("Number of arguments: " + args.Length);

        string name = "Guest";
        if (args.Length > 0)
        {
            name = args[0];
        }

        Console.WriteLine("Hello, " + name + "!");
        Console.WriteLine("Exiting with code 0");
        return 0;    // 0 = success, any other number = error
    }
}`;

export default {
  id: 'day-003-csharp-syntax-statements-namespace-main',
  title: 'C# Syntax, Statements, Comments, Namespace, Main Method',
  module: 'Module 1: C# Programming Fundamentals',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn the basic grammar of a C# program: keywords, identifiers, case sensitivity, statements and blocks, the three kinds of comments, namespaces and using directives, and the Main method (classic and top-level statements), then print formatted student details.',
  objectives: [
    'Read and write the structure of a C# program: using, namespace, class, Main',
    'Write correct statements, blocks and identifiers following C# naming rules',
    'Use single-line, multi-line and XML documentation comments',
    'Organise code with namespaces, using directives and aliases',
    'Explain the Main method signatures, command-line args and top-level statements',
  ],
  theory: [
    {
      heading: 'Structure of a C# program',
      content: `Every classic C# console program has the same skeleton: using directives at the top, a namespace, a class and a Main method. Since C# 9 / .NET 6 the template uses "top-level statements": you write only the statements, and the compiler generates the namespace-less class Program and the Main method for you. Both styles compile to the same IL.`,
      syntax: `using System;                 // 1. using directive

namespace MyApp               // 2. namespace
{
    class Program             // 3. class
    {
        static void Main(string[] args)   // 4. entry point
        {
            Console.WriteLine("Hi");      // 5. statement
        }
    }
}

// Same program with top-level statements (Program.cs):
Console.WriteLine("Hi");`,
      points: [
        'Only ONE file in a project may contain top-level statements',
        'Implicit usings (System, System.IO, System.Linq, System.Collections.Generic, ...) are enabled by default in .NET 6+ projects',
        'Visual Studio: tick "Do not use top-level statements" when creating the project to get the classic template',
      ],
    },
    {
      heading: 'C# syntax rules: keywords, identifiers, case sensitivity',
      content: `C# is case-sensitive: Console and console are different, and so are Name and name. Keywords (int, class, if, return, static, void, namespace ...) are reserved words with special meaning. Identifiers are the names you choose for variables, methods and classes.`,
      points: [
        'Identifiers: start with a letter or underscore, then letters, digits, underscores; no spaces; cannot be a keyword (use @class if you really must)',
        'Naming conventions: PascalCase for classes, methods, properties (StudentName, PrintDetails); camelCase for local variables and parameters (studentName); _camelCase for private fields',
        'Strings use double quotes "text", characters use single quotes \'A\'',
        'White space and line breaks are mostly ignored; indentation is for humans (Ctrl+K, Ctrl+D formats it)',
      ],
      tip: 'If you type console.WriteLine (small c) you get error CS0103: The name \'console\' does not exist in the current context.',
    },
    {
      heading: 'Statements and blocks',
      content: `A statement is one complete instruction and ends with a semicolon (;). A block is a group of statements inside curly braces { }; a block can be used wherever a single statement is allowed. Variables declared inside a block exist only inside it (scope).`,
      points: [
        'Declaration statement: int age = 21;',
        'Expression statement: total = a + b;  count++;  Console.WriteLine(x);',
        'Selection statements: if, switch (Day 7-8)',
        'Iteration statements: for, while, do-while, foreach (Day 9-11)',
        'Jump statements: break, continue, return, goto, throw',
        'Missing semicolon -> error CS1002: ; expected',
      ],
    },
    {
      heading: 'Comments',
      content: `Comments are notes for humans; the compiler ignores them. Use them to explain WHY the code does something, not to repeat what it does.`,
      syntax: `// single-line comment
/* multi-line
   comment */
/// <summary>XML documentation comment - shown in IntelliSense</summary>`,
      points: [
        'Ctrl+K, Ctrl+C comments the selected lines; Ctrl+K, Ctrl+U uncomments them',
        'Type /// above a method and Visual Studio generates the <summary>, <param> and <returns> tags',
        'XML comments can be exported to a documentation file (<GenerateDocumentationFile>true</GenerateDocumentationFile> in .csproj) and are used by Swagger later',
        '// TODO: comments appear in View > Task List',
      ],
    },
    {
      heading: 'Namespaces and using directives',
      content: `A namespace is a logical container that groups related classes and avoids name clashes - just like folders let you have two files named report.txt in different folders. System.Console means class Console inside namespace System. The using directive lets you write Console instead of System.Console.`,
      syntax: `namespace Company.HR { class Report { } }        // block-scoped
namespace Company.Finance;                          // file-scoped (C# 10+), whole file
using System.Text;                                  // import a namespace
using Hr = Company.HR;                              // alias
global using System.Globalization;                  // applies to every file in the project
using static System.Math;                           // use Sqrt(16) instead of Math.Sqrt(16)`,
      points: [
        'Namespaces can be nested with dots: Company.HR.Payroll',
        'By convention the namespace matches the folder structure: MyApp.Models, MyApp.Services',
        'Two classes with the same name are fine in different namespaces; use the full name or an alias to pick one',
      ],
    },
    {
      heading: 'The Main method - entry point',
      content: `Main is where the CLR starts executing your program. It must be static (no object is created yet), and it can return void or int and optionally take string[] args (command-line arguments). With async code it can also return Task or Task<int>. Only one Main is allowed per program (otherwise you must choose with <StartupObject>).`,
      syntax: `static void Main()
static void Main(string[] args)
static int Main(string[] args)          // return value = exit code
static async Task Main(string[] args)   // async entry point`,
      points: [
        'args holds words typed after the program name: dotnet run -- Ravi 25 -> args[0] = "Ravi", args[1] = "25"',
        'In Visual Studio: Project > Properties > Debug > Open debug launch profiles UI > Command line arguments',
        'With top-level statements args is still available as a variable named args',
        'Exit code 0 means success; scripts and CI pipelines check this value',
      ],
    },
  ],
  examples: [
    {
      title: 'Print student details (classic structure)',
      scenario: 'Print a neat student detail card using the full program structure: using, namespace, class and Main.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > Next',
        'Name it StudentApp > Next > choose .NET 10.0 and tick "Do not use top-level statements" > Create',
        'Replace Program.cs with the code',
        'Press Ctrl+K, Ctrl+D to format the document, then Ctrl+F5 to run',
      ],
      code: studentCode,
      csharp: { files: { 'Program.cs': studentCode }, stdin: '' },
      result: `===== STUDENT DETAILS =====
Name    : Ananya Sharma
Roll No : 101
Course  : .NET Full Stack
City    : Hyderabad
Status  : Active
===========================`,
      explanation: 'Console.WriteLine prints text and moves to the next line. Console.Write("Status  : ") prints without a new line, so the next WriteLine("Active") continues on the same line, producing "Status  : Active". Each line ends with a semicolon because each is a statement.',
    },
    {
      title: 'All three kinds of comments',
      scenario: 'Document a small area program with single-line, multi-line and XML comments and see that commented code does not run.',
      steps: [
        'File > New > Project > Console App, name it CommentsDemo (tick "Do not use top-level statements")',
        'Replace Program.cs with the code',
        'Hover over Area(width, height) in Main - IntelliSense shows the XML <summary> text',
        'Select the commented Console.WriteLine line and press Ctrl+K, Ctrl+U to uncomment it, run, then Ctrl+K, Ctrl+C to comment it again',
        'Press Ctrl+F5',
      ],
      code: commentsCode,
      csharp: { files: { 'Program.cs': commentsCode }, stdin: '' },
      result: `Width = 10
Height = 5
Area = 50`,
      explanation: 'All comments are ignored by the compiler, so the commented-out WriteLine never prints. Area(10, 5) returns 10 * 5 = 50. The /// XML comment is attached to the Area method and appears in IntelliSense tooltips.',
    },
    {
      title: 'Statements, blocks and case sensitivity',
      scenario: 'See declaration, assignment and method-call statements, a block with its own scope, and proof that C# is case-sensitive.',
      steps: [
        'File > New > Project > Console App, name it StatementsDemo (top-level statements)',
        'Replace Program.cs with the code',
        'Try deleting a semicolon and check the Error List (CS1002: ; expected), then undo with Ctrl+Z',
        'Press Ctrl+F5',
      ],
      code: statementsCode,
      csharp: { files: { 'Program.cs': statementsCode }, stdin: '' },
      result: `12
24
3
Upper / lower
End of statements demo`,
      explanation: 'sum = 5 + 7 = 12. Inside the block doubled = 12 * 2 = 24; doubled cannot be used after the closing brace. x + y = 3 even though three statements share one line. Name and name are different variables because identifiers are case-sensitive.',
    },
    {
      title: 'Namespaces, using alias and fully qualified names',
      scenario: 'Two departments each have a class called Report. Namespaces keep them apart.',
      steps: [
        'File > New > Project > Console App, name it NamespaceDemo (tick "Do not use top-level statements")',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Try writing just Report.Print(); inside Main - the compiler cannot find it because no using brings either namespace in scope',
      ],
      code: namespaceCode,
      csharp: { files: { 'Program.cs': namespaceCode }, stdin: '' },
      result: `HR Report: 25 employees
Finance Report: Profit 120000
Full name: Company.Finance.Report
Namespace of Console: System`,
      explanation: 'Hr is an alias for Company.HR, so Hr.Report means Company.HR.Report. The finance class is reached with its fully qualified name. typeof(...).FullName returns namespace + class name, and typeof(Console).Namespace is System - that is why we write using System; at the top.',
    },
    {
      title: 'Main method with command-line arguments and exit code',
      scenario: 'Greet the user named on the command line, or "Guest" when no argument is given, and return an exit code.',
      steps: [
        'File > New > Project > Console App, name it MainDemo (tick "Do not use top-level statements")',
        'Replace Program.cs with the code and press Ctrl+F5 (no arguments)',
        'Now add an argument: Project > MainDemo Properties > Debug > General > Open debug launch profiles UI > Command line arguments: Ravi',
        'Press Ctrl+F5 again: it prints Number of arguments: 1 and Hello, Ravi!',
        'CLI alternative: dotnet run -- Ravi',
      ],
      code: mainCode,
      csharp: { files: { 'Program.cs': mainCode }, stdin: '' },
      result: `Number of arguments: 0
Hello, Guest!
Exiting with code 0`,
      explanation: 'With no arguments args is an empty array (Length 0, never null), so name stays "Guest". With the argument Ravi, args[0] is "Ravi". Returning 0 from Main sets the process exit code; Visual Studio shows "exited with code 0" at the end of the console window.',
    },
  ],
  interview: [
    { q: 'What is the entry point of a C# program?', a: 'The static Main method (or the compiler-generated Main for top-level statements). The CLR calls it first when the program starts.', level: 'Easy' },
    { q: 'Why is Main static?', a: 'Because the runtime must call it before any object exists; a static method belongs to the class and can be called without creating an instance.', level: 'Easy' },
    { q: 'What are the valid signatures of Main?', a: 'static void Main(), static void Main(string[] args), static int Main(), static int Main(string[] args), and async versions returning Task or Task<int>. Access modifier can be anything (usually private by default).', level: 'Medium' },
    { q: 'What are top-level statements?', a: 'A C# 9 feature where you write statements directly in one file without a class or Main; the compiler generates them. Only one file per project can use them and args is still available.', level: 'Easy' },
    { q: 'What is a namespace and why do we use it?', a: 'A logical grouping of types that organises code and prevents name conflicts, e.g. Company.HR.Report vs Company.Finance.Report.', level: 'Easy' },
    { q: 'Difference between a using directive and a using statement?', a: 'The using directive (using System;) imports a namespace. The using statement (using (var f = File.OpenRead(...)) { }) or using declaration ensures Dispose() is called on an object at the end of a scope.', level: 'Medium' },
    { q: 'What is a file-scoped namespace?', a: 'C# 10 syntax namespace MyApp.Models; (with semicolon) that applies to the whole file and removes one level of indentation.', level: 'Medium' },
    { q: 'What kinds of comments does C# support?', a: 'Single-line //, multi-line /* */, and XML documentation comments /// used for IntelliSense and generated documentation.', level: 'Easy' },
    { q: 'Output? Console.Write("A"); Console.WriteLine("B"); Console.Write("C");', a: 'AB on the first line and C on the second line: Write does not add a newline, WriteLine does.', level: 'Easy' },
    { q: 'Output? string Name = "X"; string name = "Y"; Console.WriteLine(Name + name);', a: 'XY - C# is case-sensitive, so Name and name are two separate variables.', level: 'Easy' },
    { q: 'What happens if args is accessed as args[0] when no arguments are passed?', a: 'args is an empty array (Length 0), so args[0] throws IndexOutOfRangeException. Always check args.Length first.', level: 'Medium' },
    { q: 'What is global using?', a: 'A C# 10 directive (global using System.Text;) that applies a using to every file in the project. Implicit usings in .NET 6+ are generated global usings.', level: 'Medium' },
  ],
  practice: [
    { task: 'Print your student details (name, roll number, branch, college, mobile) in a box made of * characters using the classic Main structure.', hint: 'Use Console.WriteLine for each line and a namespace StudentDetails.', solution: `using System;

namespace StudentDetails
{
    class Program
    {
        static void Main()
        {
            Console.WriteLine("******************************");
            Console.WriteLine("* Name   : Kiran Patil       *");
            Console.WriteLine("* Roll No: 23                *");
            Console.WriteLine("* Branch : Computer Science  *");
            Console.WriteLine("* College: ABC Engineering   *");
            Console.WriteLine("******************************");
        }
    }
}` },
    { task: 'Rewrite the same program using top-level statements and file-scoped namespace for a helper class Printer with a static method Line().', hint: 'Top-level statements must come before type declarations in the file.', solution: `Printer.Line();
Console.WriteLine("Name: Kiran Patil");
Printer.Line();

static class Printer
{
    public static void Line() => Console.WriteLine("------------------");
}` },
    { task: 'Write a program that prints "Hello World" using Console.Write three times so that the output is on ONE line: Hello World !', hint: 'Remember to add spaces.', solution: `Console.Write("Hello ");
Console.Write("World ");
Console.Write("!");
// Output: Hello World !` },
    { task: 'Create two namespaces School.Primary and School.High, each with a class Teacher that prints its school level. Call both from Main using an alias for one of them.', hint: 'using P = School.Primary;', solution: `using System;
using P = School.Primary;

namespace School.Primary { class Teacher { public static void Show() => Console.WriteLine("Primary teacher"); } }
namespace School.High { class Teacher { public static void Show() => Console.WriteLine("High school teacher"); } }

class Program
{
    static void Main()
    {
        P.Teacher.Show();            // Primary teacher
        School.High.Teacher.Show();  // High school teacher
    }
}` },
    { task: 'Write a Main that prints how many command-line arguments were passed and prints each of the first two if they exist. Test with arguments: Ravi 25', hint: 'Check args.Length before reading args[0] and args[1].', solution: `static void Main(string[] args)
{
    Console.WriteLine("Count: " + args.Length);   // Count: 2
    if (args.Length > 0) Console.WriteLine("Name: " + args[0]);   // Name: Ravi
    if (args.Length > 1) Console.WriteLine("Age: " + args[1]);    // Age: 25
}` },
  ],
  quiz: [
    { question: 'Which character ends a C# statement?', options: ['.', ':', ';', ','], answer: 2, explanation: 'Every C# statement ends with a semicolon.' },
    { question: 'Which comment style produces IntelliSense documentation?', options: ['///', '//', '/* */', '#'], answer: 0, explanation: 'Triple-slash XML documentation comments are used by IntelliSense and doc generators.' },
    { question: 'What is printed by: Console.Write("Hi "); Console.Write("there");', options: ['Hi and there on two lines', 'Hithere', 'An error', 'Hi there'], answer: 3, explanation: 'Write does not add a newline, so both pieces appear on one line: "Hi there".' },
    { question: 'Why must Main be static?', options: ['To make it faster', 'So the runtime can call it without creating an object', 'Because it returns int', 'Because it is public'], answer: 1, explanation: 'No object exists when the program starts, so the entry point must be static.' },
    { question: 'What does using System; allow you to do?', options: ['Write Console instead of System.Console', 'Create a new namespace', 'Run the program faster', 'Install the System package'], answer: 0, explanation: 'A using directive imports a namespace so you can use short type names.' },
  ],
};
