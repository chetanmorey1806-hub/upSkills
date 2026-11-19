export default {
  lesson: 'day-027-sealed-partial-classes-methods',
  minutes: 15,
  intro: 'Practise sealed classes and sealed methods (stopping inheritance/overriding) and partial classes and partial methods (splitting code across files).',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: '`sealed class GstCalculator { }` What does `sealed` prevent?',
      options: ['Creating objects of GstCalculator', 'Other classes inheriting from GstCalculator', 'Calling its methods', 'Adding static members'],
      answer: 1,
      explain: 'A sealed class **cannot be a base class**: `class MyGst : GstCalculator` is a compile error. You can still create objects. `string` is a famous sealed class.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'In a multilevel hierarchy, `Manager` overrides `CalculateBonus()` and wants to stop any further class (like `SeniorManager`) from overriding it. Complete the header:\n`public ______ ________ decimal CalculateBonus()`\n(write the two keywords)',
      example: { title: 'sealed override', code: 'public sealed override string ToString() => Name;' },
      accept: ['sealed override', 'override sealed'],
      caseSensitive: true,
      explain: '`sealed` on a method is only allowed together with `override`: it ends the chain of overriding from that point down. A normal non-virtual method is already "sealed" by default.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Sealed method in a hierarchy: what does this print?',
      example: { title: 'the last override wins', code: 'Base b = new Child();\nb.Run();   // Child.Run if Child overrides it' },
      code: `Employee e = new TeamLead();
Console.WriteLine(e.Role());
Console.WriteLine(e.Bonus());

class Employee
{
    public virtual string Role() => "Employee";
    public virtual int Bonus() => 1000;
}
class Manager : Employee
{
    public sealed override string Role() => "Manager";
    public override int Bonus() => 3000;
}
class TeamLead : Manager
{
    public override int Bonus() => base.Bonus() + 500;
}`,
      expected: `Manager
3500`,
      explain: '`Role()` is sealed in Manager, so TeamLead inherits it as is → "Manager". `Bonus()` is still overridable: TeamLead adds 500 to Manager\'s 3000. Trying to override `Role()` in TeamLead would be a compile error.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **partial classes** are TRUE? (choose all that apply)',
      options: [
        'Every part must use the `partial` keyword',
        'All parts must be in the same namespace and the same assembly (project)',
        'The compiler combines all parts into one class',
        'Each part becomes a separate class at runtime',
        'They are commonly used to separate generated code (e.g. designer files) from hand-written code',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Partial classes are a **compile-time** feature: parts in different files are merged into one class. They must all say `partial`, live in the same namespace and project. WinForms designers and EF scaffolding use them so regenerated code does not overwrite yours.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A partial class split in two "files" and a partial method: what does this print?',
      example: { title: 'partial method (classic form)', code: '// File 1\npartial void OnSaved();\n// File 2 (optional)\npartial void OnSaved() { Console.WriteLine("Saved"); }' },
      code: `var s = new Student { Name = "Isha" };
s.Save();

// File: Student.Data.cs
partial class Student
{
    public string Name;
    partial void OnSaving();
    partial void OnSaved();

    public void Save()
    {
        OnSaving();
        Console.WriteLine("Saving " + Name);
        OnSaved();
    }
}

// File: Student.Hooks.cs
partial class Student
{
    partial void OnSaved() => Console.WriteLine("Saved OK");
}`,
      expected: `Saving Isha
Saved OK`,
      explain: '`OnSaving` is declared but **never implemented**, so the compiler removes the call completely (classic partial methods must be void and private). `OnSaved` is implemented in the other part, so it runs.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which of these is a valid reason to mark a class `sealed`?',
      options: [
        'To allow multiple inheritance',
        'To protect a security- or business-critical class (e.g. a tax calculator) from being changed through inheritance, and allow small runtime optimisations',
        'To make all its methods static',
        'To hide it from other projects',
      ],
      answer: 1,
      explain: 'Sealing prevents subclasses from changing behaviour and lets the JIT call methods non-virtually (devirtualisation). Hiding from other projects is the job of `internal`, not `sealed`.',
    },
  ],
};
