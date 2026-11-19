export default {
  lesson: 'day-024-runtime-polymorphism-method-overriding',
  minutes: 16,
  intro: 'Practise runtime polymorphism: virtual and override, calling overridden methods through a base-class reference, and overriding ToString().',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'The parent method is `public virtual void Pay()`. Which keyword must the child method use to **override** it?\n`public ________ void Pay() { ... }`',
      example: { title: 'virtual + override', code: 'class Shape { public virtual double Area() => 0; }\nclass Square : Shape { public override double Area() => Side * Side; }' },
      accept: ['override'],
      caseSensitive: true,
      explain: 'The parent marks a method `virtual` (can be overridden) and the child uses `override`. Without `override` the child method only **hides** the parent one and polymorphism does not happen.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Classic runtime polymorphism: what does this print?',
      example: { title: 'base reference, derived object', code: 'Animal a = new Cat();\na.Speak();   // the Cat version runs' },
      code: `Animal[] zoo = { new Dog(), new Cat(), new Animal() };
foreach (Animal a in zoo)
{
    a.Speak();
}

class Animal
{
    public virtual void Speak() => Console.WriteLine("Some sound");
}
class Dog : Animal
{
    public override void Speak() => Console.WriteLine("Bhow Bhow");
}
class Cat : Animal
{
    public override void Speak() => Console.WriteLine("Meow");
}`,
      expected: `Bhow Bhow
Meow
Some sound`,
      explain: 'The variable type is always `Animal`, but the CLR checks the **actual object type** at runtime and calls its override. One loop handles all animals: that is the power of runtime polymorphism.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`override` vs `new`: what does this print?',
      example: { title: 'the difference', text: 'override → object type decides (runtime)\nnew → variable type decides (compile time)' },
      code: `Payment p1 = new Upi();
Payment p2 = new Cash();
p1.Pay();
p2.Pay();

class Payment
{
    public virtual void Pay() => Console.WriteLine("Generic payment");
}
class Upi : Payment
{
    public override void Pay() => Console.WriteLine("Paid by UPI");
}
class Cash : Payment
{
    public new void Pay() => Console.WriteLine("Paid by Cash");
}`,
      expected: `Paid by UPI
Generic payment`,
      explain: '`Upi` **overrides** Pay, so the call through a `Payment` reference reaches it. `Cash` only **hides** Pay with `new`, so through a `Payment` reference the base version runs. This is a classic interview question.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Overriding `ToString()` and multilevel overriding: what does this print?',
      example: { title: 'ToString override', code: 'public override string ToString() => $"{Name} ({Roll})";\nConsole.WriteLine(student);  // uses ToString()' },
      code: `Employee e = new SeniorDev { Name = "Kavya" };
Console.WriteLine(e.Bonus());
Console.WriteLine(e);

class Employee
{
    public string Name;
    public virtual int Bonus() => 1000;
    public override string ToString() => "Employee " + Name;
}
class Developer : Employee
{
    public override int Bonus() => 5000;
}
class SeniorDev : Developer
{
    public override int Bonus() => base.Bonus() * 2;
}`,
      expected: `10000
Employee Kavya`,
      explain: 'The most-derived override runs: `SeniorDev.Bonus()` calls `base.Bonus()` (Developer → 5000) and doubles it. `Console.WriteLine(object)` calls `ToString()`, which is overridden in Employee and inherited by SeniorDev.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which method **cannot** be overridden?',
      options: ['A virtual method', 'An abstract method', 'A non-virtual (normal) method', 'An override method that is not sealed'],
      answer: 2,
      explain: 'In C#, methods are **non-virtual by default** (unlike Java). Only `virtual`, `abstract` or `override` methods can be overridden. Marking an override `sealed` stops further overriding.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Rules for overriding: which are TRUE? (choose all that apply)',
      options: [
        'The override must have the same name, parameters and return type',
        'The override cannot reduce accessibility (public stays public)',
        'A static method can be virtual',
        'A private method can be virtual',
        'You can call the parent version with base.MethodName()',
      ],
      answers: [0, 1, 4],
      explain: 'Signatures and accessibility must match, and `base.X()` reaches the parent version. **Static** methods are not tied to an object, so they cannot be virtual, and **private** virtual methods are not allowed because children could not see them.',
    },
  ],
};
