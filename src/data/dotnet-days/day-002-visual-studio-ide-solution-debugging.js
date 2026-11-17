const firstAppCode = `// Program.cs - FirstConsoleApp
Console.WriteLine("My first Console Application");
Console.WriteLine("Created in Visual Studio");

string course = ".NET Full Stack";
int day = 2;

Console.WriteLine("Course: " + course);
Console.WriteLine("Day: " + day);`;

const loopDebugCode = `// Debugging a loop with a breakpoint, F10 and the Locals window
int total = 0;

for (int i = 1; i <= 5; i++)
{
    total = total + i;      // <-- put a breakpoint here (F9)
}

Console.WriteLine("Total = " + total);`;

const stepIntoCode = `// F10 (Step Over) vs F11 (Step Into)
int price = 250;
int quantity = 4;

int bill = CalculateBill(price, quantity);   // <-- breakpoint here, then press F11
Console.WriteLine($"Bill = {bill}");

int smallBill = CalculateBill(100, 3);       // press F10 here to run the method in one step
Console.WriteLine($"Small bill = {smallBill}");

static int CalculateBill(int p, int q)
{
    int amount = p * q;
    if (amount > 500)
    {
        amount = amount - 100;   // discount of 100 on bills above 500
    }
    return amount;
}`;

const watchBugCode = `using System.Globalization;

// Find the bug with the Watch window
int m1 = 78, m2 = 85, m3 = 90;
int total = m1 + m2 + m3;

double average = total / 3;          // BUG: integer division happens first
Console.WriteLine("Total = " + total);
Console.WriteLine("Average (buggy) = " + average);

double fixedAverage = total / 3.0;   // FIX: divide by a double
Console.WriteLine("Average (fixed) = " + fixedAverage.ToString("0.00", CultureInfo.InvariantCulture));`;

const calcLibCode = `namespace MathLib
{
    // Lives in the class library project "MathLib"
    public static class Calculator
    {
        public static int Add(int a, int b)
        {
            return a + b;
        }

        public static int Subtract(int a, int b)
        {
            return a - b;
        }
    }
}`;

const calcAppCode = `// Program.cs in the console project "CalculatorApp"
using MathLib;

Console.WriteLine("Solution: CalculatorSolution (2 projects)");
Console.WriteLine("5 + 3 = " + Calculator.Add(5, 3));
Console.WriteLine("10 - 4 = " + Calculator.Subtract(10, 4));`;

export default {
  id: 'day-002-visual-studio-ide-solution-debugging',
  title: 'Visual Studio Installation, IDE, Solution, Project, Debugging',
  module: 'Module 1: C# Programming Fundamentals',
  day: 2,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Install Visual Studio 2022/2026 with the right workloads, learn every important IDE window, understand how a Solution contains Projects, create your first Console Application and master debugging step by step: breakpoints (F9), F5, Step Over (F10), Step Into (F11), Step Out (Shift+F11), and the Locals, Autos, Watch and Immediate windows.',
  objectives: [
    'Install Visual Studio Community with the .NET desktop and ASP.NET workloads',
    'Identify and use Solution Explorer, Code Editor, Output, Error List, Properties and Terminal windows',
    'Explain the difference between a solution (.sln/.slnx) and a project (.csproj)',
    'Create, build and run a Console Application (Ctrl+Shift+B, F5, Ctrl+F5)',
    'Debug a program using breakpoints, stepping keys and the Locals/Watch windows',
  ],
  theory: [
    {
      heading: 'Step-by-step: Installing Visual Studio and choosing workloads',
      content: `Visual Studio is Microsoft's full IDE (Integrated Development Environment) for .NET on Windows. The Community edition is free for students and individuals; Professional and Enterprise are paid. Visual Studio 2026 (version 18) ships with .NET 10; Visual Studio 2022 (17.8+) supports .NET 8. Installation is done with the Visual Studio Installer, where you pick "workloads" - bundles of tools for one kind of development.`,
      points: [
        'Step 1: Go to visualstudio.microsoft.com > Download Visual Studio > Community',
        'Step 2: Run VisualStudioSetup.exe; the Visual Studio Installer opens',
        'Step 3: On the Workloads tab tick "ASP.NET and web development" (web apps, Web API, also installs the .NET SDK)',
        'Step 4: Tick ".NET desktop development" (console, WinForms, WPF apps)',
        'Step 5: Tick "Data storage and processing" (SQL Server tools, LocalDB) - needed in Module 4 and 7',
        'Step 6: Individual components tab: make sure ".NET 10.0 Runtime" / ".NET 8.0 Runtime (LTS)" is selected; Language packs: English',
        'Step 7: Click Install (about 8-15 GB). Restart if asked, then sign in with a Microsoft account (optional) and pick a theme (Dark/Light)',
        'Later: open Visual Studio Installer > Modify to add or remove workloads',
      ],
      tip: 'On Mac/Linux use VS Code with the C# Dev Kit extension or JetBrains Rider; the dotnet CLI works the same everywhere.',
    },
    {
      heading: 'The Visual Studio IDE windows',
      content: `When you open a project you see several docked windows. Every window can be reopened from the View menu if you close it by mistake, and Window > Reset Window Layout restores the default arrangement.`,
      points: [
        'Code Editor (center): write code with IntelliSense (Ctrl+Space), red squiggles for errors, Ctrl+K,Ctrl+D to format the document',
        'Solution Explorer (Ctrl+Alt+L): tree of the solution, projects, Dependencies, files; right-click for Add > Class, Build, Set as Startup Project',
        'Output window (View > Output): build messages and program/debug output',
        'Error List (Ctrl+\\, E or View > Error List): errors, warnings and messages with line numbers; double-click to jump to the line',
        'Properties window (F4): properties of the selected file or project item',
        'Terminal (Ctrl+`): a Developer PowerShell inside VS for dotnet CLI commands',
        'Toolbar: Start button (green arrow, F5), Debug/Release dropdown, startup project dropdown',
        'Debug windows (only while debugging): Locals, Autos, Watch, Call Stack, Immediate',
      ],
      tip: 'Ctrl+Q (Search) lets you find any menu command or setting by typing its name.',
    },
    {
      heading: 'Solution vs Project',
      content: `A project is one buildable unit that produces one output: a console .exe/.dll, a class library .dll, a web app and so on. It is described by a .csproj file (an XML file that lists the target framework, NuGet packages and references). A solution is a container that groups one or more related projects; it is described by a .sln file (or the newer .slnx XML format in VS 2026). Analogy: a solution is a school, projects are classrooms - each classroom works on its own, but they belong to the same school and can share things (project references).`,
      syntax: `CalculatorSolution/            <- folder of the solution
  CalculatorSolution.sln       <- solution file (lists projects)
  CalculatorApp/
     CalculatorApp.csproj      <- console project
     Program.cs
     bin/Debug/net10.0/        <- compiled output
     obj/                      <- temporary build files
  MathLib/
     MathLib.csproj            <- class library project
     Calculator.cs`,
      points: [
        'One solution can have many projects (UI, API, business logic, tests)',
        'The startup project (bold in Solution Explorer) is the one F5 runs',
        'Project reference: right-click Dependencies > Add Project Reference',
        'bin = final output, obj = intermediate files; both can be deleted safely (Build > Clean Solution)',
        'Debug configuration = no optimization, full debug info; Release = optimized for production',
      ],
    },
    {
      heading: 'Creating and running your first Console Application',
      content: `File > New > Project (Ctrl+Shift+N) opens the template list. Search "Console App", select the C# one (not .NET Framework), click Next, enter Project name and Location, tick "Place solution and project in the same directory" for small apps, click Next, choose Framework (.NET 10.0 LTS or .NET 8.0), optionally tick "Do not use top-level statements", and click Create.`,
      points: [
        'Build Solution: Ctrl+Shift+B (compile only; check the Error List)',
        'Start Debugging: F5 (runs with the debugger attached, stops at breakpoints)',
        'Start Without Debugging: Ctrl+F5 (faster, console window stays open with "Press any key")',
        'Stop Debugging: Shift+F5; Restart: Ctrl+Shift+F5',
        'Rename a file/class safely: F2 (Rename refactoring)',
      ],
    },
    {
      heading: 'Debugging step by step: breakpoints and stepping keys',
      content: `Debugging means running the program line by line and looking inside variables to find bugs. A breakpoint is a red dot that pauses the program on a line before that line runs. The yellow arrow shows the next line to execute.`,
      points: [
        'F9: toggle a breakpoint on the current line (or click the left grey margin)',
        'F5: start debugging / continue to the next breakpoint',
        'F10 (Step Over): run the current line; if it calls a method, run the whole method and stop on the next line',
        'F11 (Step Into): go inside the method being called on the current line',
        'Shift+F11 (Step Out): finish the current method and return to the caller',
        'Ctrl+F10 (Run To Cursor): run until the line where the cursor is',
        'Right-click a breakpoint > Conditions: e.g. i == 4 to stop only when the condition is true',
        'Ctrl+Shift+F9: delete all breakpoints',
      ],
      tip: 'Hover the mouse over any variable while paused to see its value in a DataTip; you can pin it.',
    },
    {
      heading: 'Locals, Autos, Watch, Immediate and Call Stack windows',
      content: `These windows open at the bottom while the program is paused (Debug > Windows menu if hidden).`,
      points: [
        'Locals (Alt+4): shows ALL variables in the current method with value and type, updated at every step (changed values turn red)',
        'Autos (Ctrl+Alt+V, A): variables used on the current and previous line only',
        'Watch 1 (Ctrl+Alt+W, 1): type any variable or expression, e.g. total / 3, to track it; right-click a variable > Add Watch',
        'Immediate window (Ctrl+Alt+I): evaluate expressions or change a variable while paused, e.g. type total = 100',
        'Call Stack (Ctrl+Alt+C): shows which method called which',
        'You can edit a value directly in Locals/Watch by double-clicking the Value column',
      ],
    },
  ],
  examples: [
    {
      title: 'Create your first Console Application',
      scenario: 'After installing Visual Studio, create a new solution with one console project, build it and run it.',
      steps: [
        'Open Visual Studio > Create a new project (or File > New > Project, Ctrl+Shift+N)',
        'Type "Console App" in the search box, choose Console App (C#, Windows/Linux/macOS) > Next',
        'Project name: FirstConsoleApp, Location: C:\\DotNetCourse, Solution name: FirstConsoleApp > Next',
        'Framework: .NET 10.0 (Long Term Support) (or .NET 8.0) > Create',
        'In Solution Explorer (Ctrl+Alt+L) open Program.cs and replace the code',
        'Press Ctrl+Shift+B to build; check the Output window shows "Build succeeded" and the Error List shows 0 errors',
        'Press Ctrl+F5 to run without debugging',
      ],
      code: firstAppCode,
      csharp: { files: { 'Program.cs': firstAppCode }, stdin: '' },
      result: `My first Console Application
Created in Visual Studio
Course: .NET Full Stack
Day: 2`,
      explanation: 'Visual Studio created FirstConsoleApp.sln (solution) and FirstConsoleApp.csproj (project). Ctrl+Shift+B compiled Program.cs into bin\\Debug\\net10.0\\FirstConsoleApp.dll. Ctrl+F5 started the program; "Course: " + course joins two strings and "Day: " + day converts 2 to text.',
    },
    {
      title: 'Debugging a loop with F9, F5, F10 and the Locals window',
      scenario: 'Watch the variables i and total change on every loop iteration to understand exactly how the sum 1+2+3+4+5 is built.',
      steps: [
        'Create a Console App named DebugLoop and paste the code',
        'Click on the line total = total + i; and press F9 - a red dot appears in the margin',
        'Press F5 (Start Debugging). The program pauses on the red line (yellow arrow). Open Debug > Windows > Locals (Alt+4)',
        'Locals shows: i = 1, total = 0. Press F10 (Step Over) - total becomes 1 and turns red because it changed',
        'Keep pressing F10 (or F5 to jump to the breakpoint again) and note the table: i=1 total 0->1, i=2 1->3, i=3 3->6, i=4 6->10, i=5 10->15',
        'Right-click the red dot > Conditions > Conditional Expression: i == 4, restart with Ctrl+Shift+F5: now it stops only when i is 4 (total = 6)',
        'Press F9 again on the line to remove the breakpoint, then F5 to finish; the console prints the result',
      ],
      code: loopDebugCode,
      csharp: { files: { 'Program.cs': loopDebugCode }, stdin: '' },
      result: `Total = 15`,
      explanation: 'The breakpoint pauses BEFORE the line executes. Trace: start total=0; i=1 -> 1; i=2 -> 3; i=3 -> 6; i=4 -> 10; i=5 -> 15; then i becomes 6, the condition i <= 5 is false and the loop ends. Locals shows each new value in red right after it changes, which makes the logic visible.',
    },
    {
      title: 'Step Into (F11), Step Over (F10) and Step Out (Shift+F11)',
      scenario: 'Go inside a method to see how the bill and discount are calculated, and compare with stepping over a method call.',
      steps: [
        'Create a Console App named DebugMethods and paste the code',
        'Put a breakpoint (F9) on the line int bill = CalculateBill(price, quantity);',
        'Press F5; execution pauses on that line. Locals: price = 250, quantity = 4, bill = 0',
        'Press F11 (Step Into): the yellow arrow jumps inside CalculateBill. Locals now shows p = 250, q = 4, amount = 0',
        'Press F10: amount = 1000. Press F10: the if condition 1000 > 500 is true. Press F10: amount = 900',
        'Open Debug > Windows > Call Stack: it shows CalculateBill called from the main program',
        'Press Shift+F11 (Step Out) to return; bill now shows 900 in Locals',
        'On the line int smallBill = CalculateBill(100, 3); press F10 (Step Over) - the method runs completely and smallBill = 300 (300 > 500 is false, no discount)',
        'Press F5 to continue to the end',
      ],
      code: stepIntoCode,
      csharp: { files: { 'Program.cs': stepIntoCode }, stdin: '' },
      result: `Bill = 900
Small bill = 300`,
      explanation: 'CalculateBill(250, 4): amount = 1000, which is greater than 500, so 100 is subtracted -> 900. CalculateBill(100, 3): amount = 300, not greater than 500, so it stays 300. F11 is used when you suspect a bug inside a method, F10 when you trust the method and only care about its result, Shift+F11 to leave a method quickly.',
    },
    {
      title: 'Finding a real bug with the Watch and Immediate windows',
      scenario: 'A student average is printed as 84 instead of 84.33. Use the debugger to discover why.',
      steps: [
        'Create a Console App named DebugAverage and paste the code',
        'Put a breakpoint (F9) on the line double average = total / 3;',
        'Press F5. Hover over total: the DataTip shows 253',
        'Open Debug > Windows > Watch > Watch 1 (Ctrl+Alt+W, 1). Type total / 3 in the Name column - Value shows 84 (type int)',
        'In the next Watch row type total / 3.0 - Value shows 84.33333333333333 (type double). Now the bug is clear: int / int gives an int',
        'Open Debug > Windows > Immediate (Ctrl+Alt+I) and type total / 3.0 then Enter to evaluate it the same way',
        'Press F10 and look at average in Locals: 84. Press F5 to finish and read the output',
      ],
      code: watchBugCode,
      csharp: { files: { 'Program.cs': watchBugCode }, stdin: '' },
      result: `Total = 253
Average (buggy) = 84
Average (fixed) = 84.33`,
      explanation: '78 + 85 + 90 = 253. In total / 3 both operands are int, so C# does integer division (253 / 3 = 84, remainder thrown away) and only then stores 84 in the double. total / 3.0 divides by a double, giving 84.333..., which ToString("0.00", CultureInfo.InvariantCulture) formats as 84.33. The Watch window let us test both expressions without changing code.',
    },
    {
      title: 'One solution, two projects (Console App + Class Library)',
      scenario: 'Understand solution vs project by adding a class library to the solution and referencing it from the console app.',
      steps: [
        'File > New > Project > Console App. Project name: CalculatorApp, Solution name: CalculatorSolution, untick "Place solution and project in the same directory" > Next > .NET 10.0 > Create',
        'In Solution Explorer right-click Solution \'CalculatorSolution\' > Add > New Project > Class Library (C#) > name MathLib > Create',
        'Rename Class1.cs to Calculator.cs (F2) and paste the MathLib code',
        'Right-click CalculatorApp > Dependencies > Add Project Reference > tick MathLib > OK',
        'Replace CalculatorApp/Program.cs with the console code',
        'Right-click CalculatorApp > Set as Startup Project (it becomes bold)',
        'Press Ctrl+Shift+B (both projects build: MathLib.dll first, then CalculatorApp.dll) and then Ctrl+F5',
      ],
      code: `// ===== MathLib/Calculator.cs (Class Library) =====
` + calcLibCode + `

// ===== CalculatorApp/Program.cs (Console App) =====
` + calcAppCode,
      csharp: { files: { 'Program.cs': calcAppCode, 'Calculator.cs': calcLibCode }, stdin: '' },
      result: `Solution: CalculatorSolution (2 projects)
5 + 3 = 8
10 - 4 = 6`,
      explanation: 'The solution file CalculatorSolution.sln only lists the two projects. MathLib.csproj builds MathLib.dll; CalculatorApp.csproj has a <ProjectReference> to MathLib, so it can use the public Calculator class after "using MathLib;". Add(5, 3) = 8 and Subtract(10, 4) = 6. Real applications are organised exactly like this (Web API project + Business layer + Data layer + Tests).',
    },
  ],
  interview: [
    { q: 'What is the difference between a solution and a project in Visual Studio?', a: 'A project (.csproj) is a single buildable unit producing one assembly (exe/dll). A solution (.sln or .slnx) is a container grouping related projects, their build order and configurations. One solution can contain many projects.', level: 'Easy' },
    { q: 'Which Visual Studio workloads do you need for .NET full stack development?', a: 'ASP.NET and web development (ASP.NET Core, Web API, .NET SDK), .NET desktop development (console/WinForms/WPF) and Data storage and processing (SQL Server Data Tools, LocalDB). Node.js development is optional for React work.', level: 'Easy' },
    { q: 'What is the difference between F5 and Ctrl+F5?', a: 'F5 starts the app with the debugger attached, so breakpoints are hit. Ctrl+F5 starts without debugging: faster, breakpoints ignored, and the console window waits for a key at the end.', level: 'Easy' },
    { q: 'Explain F9, F10, F11 and Shift+F11.', a: 'F9 toggles a breakpoint. F10 Step Over executes the current line, running called methods completely. F11 Step Into enters the method called on the current line. Shift+F11 Step Out runs the rest of the current method and returns to the caller.', level: 'Easy' },
    { q: 'What is the difference between the Locals, Autos and Watch windows?', a: 'Locals shows all variables in the current scope. Autos shows only variables used on the current and previous lines. Watch shows only expressions you add yourself, and can evaluate any expression such as total / 3.0.', level: 'Medium' },
    { q: 'What is a conditional breakpoint and when would you use it?', a: 'A breakpoint with a condition (e.g. i == 500) or hit count; the debugger pauses only when the condition is true. Useful in loops with many iterations where the bug appears only for certain data.', level: 'Medium' },
    { q: 'What are the bin and obj folders?', a: 'obj holds intermediate build files (generated code, project.assets.json). bin holds the final output (dll/exe, pdb, dependencies) per configuration and framework, e.g. bin/Debug/net10.0. Both are regenerated on build and should not be committed to Git.', level: 'Easy' },
    { q: 'Difference between Debug and Release configuration?', a: 'Debug has no compiler optimizations and full debug symbols for easy stepping. Release enables optimizations for production performance; stepping can jump around because code is optimized.', level: 'Medium' },
    { q: 'What is the Immediate window used for?', a: 'While paused at a breakpoint you can evaluate expressions, call methods or change variable values, e.g. typing total = 100 to test what happens next without restarting.', level: 'Medium' },
    { q: 'Output-based: a breakpoint is on total = total + i; in for (int i = 1; i <= 5; i++). What is total in Locals the 3rd time the breakpoint is hit (before the line runs)?', a: '3. Before the 3rd execution, i = 3 and total holds 1 + 2 = 3; after pressing F10 it becomes 6.', level: 'Medium' },
    { q: 'What does the startup project mean?', a: 'It is the project Visual Studio runs when you press F5/Ctrl+F5. It appears bold in Solution Explorer; change it with right-click > Set as Startup Project or configure multiple startup projects in solution properties.', level: 'Easy' },
    { q: 'What is the Call Stack window?', a: 'It lists the chain of method calls that led to the current line, top = current method. Double-click a frame to see the caller\'s code and variables.', level: 'Medium' },
  ],
  practice: [
    { task: 'Install Visual Studio Community with the three workloads (ASP.NET and web development, .NET desktop development, Data storage and processing). Take a screenshot of the Installer showing the ticked workloads.', hint: 'Visual Studio Installer > Modify on an existing installation.', solution: 'Download Community from visualstudio.microsoft.com, run the installer, tick the three workloads, check the .NET 10 / .NET 8 runtime in Individual components and click Install. Verify by creating a Console App targeting .NET 10.0.' },
    { task: 'Create a Console App "StudentInfo" that prints your name, course and batch. Build with Ctrl+Shift+B, run with Ctrl+F5, then open the bin\\Debug\\net10.0 folder and find StudentInfo.dll.', hint: 'Right-click project > Open Folder in File Explorer.', solution: `Console.WriteLine("Name: Rahul");
Console.WriteLine("Course: .NET Full Stack");
Console.WriteLine("Batch: Morning");
// Output files: bin\\Debug\\net10.0\\StudentInfo.dll, StudentInfo.exe, StudentInfo.pdb` },
    { task: 'Debug this program and fill a table of i and fact after each F10: int fact = 1; for (int i = 1; i <= 4; i++) { fact = fact * i; } Console.WriteLine(fact);', hint: 'Breakpoint (F9) on fact = fact * i; watch the Locals window.', solution: 'i=1 fact 1->1; i=2 1->2; i=3 2->6; i=4 6->24. Output: 24' },
    { task: 'Add a conditional breakpoint that stops only when i == 7 in a loop from 1 to 10 that prints i * i. What value is shown in the Watch window for i * i?', hint: 'Right-click red dot > Conditions.', solution: `for (int i = 1; i <= 10; i++)
{
    Console.WriteLine(i * i);   // breakpoint with condition i == 7
}
// Watch "i * i" shows 49 when paused` },
    { task: 'Create a solution "SchoolSolution" with a console project "SchoolApp" and a class library "SchoolLib" containing public static class Greeter { public static string Hello(string n) => "Hello " + n; }. Call it from SchoolApp.', hint: 'Add Project Reference from SchoolApp to SchoolLib.', solution: `// SchoolLib/Greeter.cs
namespace SchoolLib
{
    public static class Greeter
    {
        public static string Hello(string n) => "Hello " + n;
    }
}
// SchoolApp/Program.cs
using SchoolLib;
Console.WriteLine(Greeter.Hello("Priya"));   // Hello Priya` },
  ],
  quiz: [
    { question: 'Which key toggles a breakpoint on the current line?', options: ['F5', 'F9', 'F10', 'F12'], answer: 1, explanation: 'F9 adds or removes a breakpoint; F5 starts/continues debugging.' },
    { question: 'You are paused on a line that calls CalculateBill(...). Which key takes you INSIDE CalculateBill?', options: ['F10', 'Shift+F11', 'F11', 'Ctrl+F5'], answer: 2, explanation: 'F11 Step Into enters the called method; F10 would run it completely.' },
    { question: 'Which file describes a single project?', options: ['.csproj', '.sln', '.pdb', '.json'], answer: 0, explanation: 'The .csproj file defines a project; .sln/.slnx defines a solution that groups projects.' },
    { question: 'Which window lets you type your own expression such as total / 3.0 and track its value?', options: ['Error List', 'Solution Explorer', 'Output', 'Watch'], answer: 3, explanation: 'The Watch window evaluates any expression you add while debugging.' },
    { question: 'Which workload must you select to build ASP.NET Core Web APIs?', options: ['Game development with C++', 'ASP.NET and web development', 'Python development', 'Mobile development with C++'], answer: 1, explanation: 'ASP.NET and web development installs the web templates and the .NET SDK.' },
  ],
};
