export default {
  lesson: 'day-002-visual-studio-ide-solution-debugging',
  minutes: 15,
  intro: 'Practise the Visual Studio basics: solutions vs projects, project files and the debugging shortcuts (F5, F9, F10, F11).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'In Visual Studio, what is the relationship between a **solution** and a **project**?',
      options: [
        'A project contains many solutions',
        'A solution (.sln) is a container that can hold one or more projects (.csproj)',
        'They are the same thing with two names',
        'A solution is only used for web apps',
      ],
      answer: 1,
      explain: 'A **solution** (`.sln`) groups related projects, e.g. a Console App + a Class Library + a Test project. Each **project** (`.csproj`) builds into one assembly (.exe or .dll).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'What is the file extension of a **C# project file** (the XML file that lists the target framework and NuGet packages)?',
      example: { title: 'files in a new console app', text: 'HelloApp.sln\nHelloApp/HelloApp.?????\nHelloApp/Program.cs' },
      accept: ['.csproj', 'csproj'],
      explain: 'C# projects are `.csproj` files (SDK-style XML with `<TargetFramework>net8.0</TargetFramework>` etc.). `.sln` is the solution file and `.cs` files contain the code.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which keyboard key **toggles a breakpoint** on the current line in Visual Studio?',
      example: { title: 'debug shortcuts', text: 'F5 = start debugging, Ctrl+F5 = run without debugging, F10 = step over …' },
      accept: ['F9'],
      explain: '**F9** adds/removes a breakpoint (red dot). Then **F5** starts debugging and stops at it. You can also click in the grey margin left of the line number.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'The debugger is paused on `int total = CalculateTotal(price, qty);`. You want to go **inside** `CalculateTotal` to see its lines. Which key?',
      options: ['F10 (Step Over)', 'F11 (Step Into)', 'Shift+F11 (Step Out)', 'Ctrl+F5'],
      answer: 1,
      explain: '**F11 Step Into** enters the called method. **F10 Step Over** runs the whole method call and stops at the next line of the current method. **Shift+F11 Step Out** finishes the current method and returns to the caller.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which windows help you **see variable values** while the program is paused at a breakpoint? (choose all that apply)',
      options: ['Locals window', 'Watch window', 'Immediate window', 'Solution Explorer', 'Toolbox'],
      answers: [0, 1, 2],
      explain: '**Locals** shows variables in the current method automatically, **Watch** shows expressions you add, and **Immediate** lets you type an expression and evaluate it. Solution Explorer shows files and the Toolbox holds designer controls; neither shows runtime values.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'You set a breakpoint on the `Console.WriteLine` line and watch `sum` in the Locals window. After the program finishes, what does the console show?',
      example: { title: 'tracing a loop like the debugger', text: 'i=1 → sum=1, i=2 → sum=3 … write down the value after each step, exactly as the Locals window would show it.' },
      code: `int sum = 0;
for (int i = 1; i <= 4; i++)
{
    sum += i * 2;
}
Console.WriteLine("Sum = " + sum);`,
      expected: 'Sum = 20',
      explain: 'The loop adds 2, 4, 6 and 8, so `sum` goes 2 → 6 → 12 → 20. Stepping with F10 and watching `sum` in Locals is exactly how you find mistakes like starting `i` at 0 or using `<` instead of `<=`.',
    },
  ],
};
