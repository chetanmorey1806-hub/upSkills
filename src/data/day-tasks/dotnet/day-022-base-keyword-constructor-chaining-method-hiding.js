export default {
  lesson: 'day-022-base-keyword-constructor-chaining-method-hiding',
  minutes: 18,
  intro: 'Practise the base keyword (calling parent constructors and methods), constructor chaining across classes and method hiding with new.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'The parent class has only `public Person(string name)`. Complete the child constructor so it passes `name` to the parent:\n`public Student(string name, int roll) : __________ { Roll = roll; }`',
      example: { title: 'calling the parent constructor', code: 'public Car(string brand) : base(brand) { }' },
      accept: ['base(name)'],
      acceptRegex: ['^base\\s*\\(\\s*name\\s*\\)$'],
      caseSensitive: true,
      explain: '`: base(name)` calls the parent constructor **before** the child body runs. Without it the compiler looks for a parameterless `Person()` and, since there is none, gives an error.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Chaining with `this(...)` and `base(...)`: what does this print?',
      example: { title: 'order of execution', code: 'Child() : this(0) → Child(int) : base() → Parent() body → Child(int) body → Child() body' },
      code: `var s = new Student();
Console.WriteLine(s.Name + " " + s.Roll);

class Person
{
    public string Name;
    public Person(string name)
    {
        Name = name;
        Console.WriteLine("Person(" + name + ")");
    }
}
class Student : Person
{
    public int Roll;
    public Student() : this("Guest", 0)
    {
        Console.WriteLine("Student()");
    }
    public Student(string name, int roll) : base(name)
    {
        Roll = roll;
        Console.WriteLine("Student(name, roll)");
    }
}`,
      expected: `Person(Guest)
Student(name, roll)
Student()
Guest 0`,
      explain: '`new Student()` first jumps to `this("Guest", 0)`, which first calls `base("Guest")`. Bodies then run in reverse: Person body, the 2-arg Student body, finally the parameterless Student body.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Method hiding with `new` vs overriding: what does this print?',
      example: { title: 'new hides, it does not override', code: 'class A { public void Hi() => Console.WriteLine("A"); }\nclass B : A { public new void Hi() => Console.WriteLine("B"); }' },
      code: `A obj = new B();
obj.Show();
obj.Print();
B b = new B();
b.Show();

class A
{
    public void Show() => Console.WriteLine("A.Show");
    public virtual void Print() => Console.WriteLine("A.Print");
}
class B : A
{
    public new void Show() => Console.WriteLine("B.Show");
    public override void Print() => Console.WriteLine("B.Print");
}`,
      expected: `A.Show
B.Print
B.Show`,
      explain: 'With **hiding** (`new`), the method chosen depends on the **variable type**: `A obj` calls `A.Show`. With **overriding** (`virtual`/`override`), the **object type** decides at runtime, so `obj.Print()` calls `B.Print`. Through a `B` variable, `B.Show` is used.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Reusing parent logic with `base.Method()`: what does this print?',
      example: { title: 'extend, do not copy', code: 'public override string Info() => base.Info() + ", Dept: IT";' },
      code: `var m = new Manager();
Console.WriteLine(m.GetSalary());

class Employee
{
    public virtual int GetSalary() => 50000;
}
class Manager : Employee
{
    public override int GetSalary()
    {
        int basic = base.GetSalary();
        return basic + 20000;
    }
}`,
      expected: '70000',
      explain: '`base.GetSalary()` calls the **parent version** (50000) even though Manager overrides it; Manager then adds its allowance. Calling `GetSalary()` without `base.` inside the override would call itself forever (StackOverflowException).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A child class declares `public void Show()` while the parent already has a non-virtual `public void Show()`, without writing `new`. What happens?',
      options: ['Compile error', 'It compiles with a warning (CS0108) and hides the parent method; add `new` to make it explicit', 'It overrides the parent method', 'Both methods run'],
      answer: 1,
      explain: 'Hiding happens anyway; the compiler only **warns** that you might have meant to override. Writing `new` says "yes, I intend to hide it" and removes the warning.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'What can the `base` keyword be used for? (choose all that apply)',
      options: [
        'Calling a parent constructor: `: base(args)`',
        'Calling the parent version of an overridden method: `base.Print()`',
        'Accessing a parent field hidden by a child field: `base.Name`',
        'Calling a method of the grand-grandparent directly: `base.base.Print()`',
        'Using it inside a static method',
      ],
      answers: [0, 1, 2],
      explain: '`base` refers to the immediate parent part of the current object: its constructors, methods and fields. `base.base` is not valid syntax, and like `this`, `base` cannot be used in static methods.',
    },
  ],
};
