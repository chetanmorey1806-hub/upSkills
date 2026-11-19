export default {
  lesson: 'day-016-intro-to-oops-class-object',
  minutes: 16,
  intro: 'Practise the basics of OOP in C#: classes vs objects, fields, properties (auto and with validation) and reference semantics.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement best describes **class** vs **object**?',
      options: [
        'A class is an instance of an object',
        'A class is a blueprint; an object is a real instance created from it with `new`',
        'They mean the same thing',
        'Objects are written in a separate .obj file',
      ],
      answer: 1,
      explain: 'A **class** (e.g. `Student`) defines what data and behaviour every student has. An **object** (`new Student()`) is one concrete student in memory. One class → many objects.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write an **auto-implemented property** named `Name` of type `string` that is public and can be read and written.',
      example: { title: 'auto-property', code: 'public int RollNo { get; set; }' },
      accept: ['public string Name { get; set; }'],
      acceptRegex: ['^public\\s+string\\s+Name\\s*\\{\\s*get\\s*;\\s*set\\s*;\\s*\\}\\s*;?$'],
      caseSensitive: true,
      explain: 'An auto-property `{ get; set; }` makes the compiler create a hidden backing field. Properties (PascalCase) are preferred over public fields because you can later add validation without changing callers.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Objects are reference types. What does this print?',
      example: { title: 'creating objects', code: 'var s = new Student();\ns.Name = "Asha";\nConsole.WriteLine(s.Name); // Asha' },
      code: `var s1 = new Student { Name = "Asha", Marks = 70 };
var s2 = s1;
s2.Marks = 90;
var s3 = new Student { Name = "Asha", Marks = 90 };
Console.WriteLine(s1.Marks);
Console.WriteLine(s1 == s2);
Console.WriteLine(s1 == s3);

class Student
{
    public string Name { get; set; }
    public int Marks { get; set; }
}`,
      expected: `90
True
False`,
      explain: '`s2 = s1` copies the **reference**, so both variables point to the same object and `s1.Marks` becomes 90. For classes `==` compares references by default: s1 and s2 are the same object (True), s3 is a different object with equal data (False).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A property with validation protects the data. What does this print?',
      example: { title: 'full property with a backing field', code: 'private int age;\npublic int Age\n{\n    get { return age; }\n    set { if (value > 0) age = value; }\n}' },
      code: `var st = new Student();
st.Marks = 85;
st.Marks = 150;
st.Marks = -5;
Console.WriteLine(st.Marks);

class Student
{
    private int marks;
    public int Marks
    {
        get { return marks; }
        set
        {
            if (value >= 0 && value <= 100) marks = value;
            else Console.WriteLine("Invalid: " + value);
        }
    }
}`,
      expected: `Invalid: 150
Invalid: -5
85`,
      explain: 'Inside a setter, `value` is the value being assigned. 150 and -5 fail the check, so the backing field keeps 85. This is why properties are better than public fields: bad data cannot get in.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'A new object is created with `var e = new Employee();` and its fields are never assigned. Which default values are correct? (choose all that apply)',
      options: ['int Id → 0', 'string Name → null', 'bool IsActive → false', 'double Salary → 0', 'string Name → "" (empty string)', 'DateTime JoinDate → null'],
      answers: [0, 1, 2, 3],
      explain: 'Fields get default values: numbers 0, bool false, reference types (string, arrays, other classes) **null**. `DateTime` is a struct, so it cannot be null; its default is `01-01-0001 00:00:00` (DateTime.MinValue).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What does `var b = new BankAccount();` do?',
      options: [
        'Declares a variable only; no object exists yet',
        'Allocates a new object on the heap, runs its constructor and stores the reference in b',
        'Copies an existing BankAccount',
        'Creates a static class',
      ],
      answer: 1,
      explain: '`new` allocates memory on the **managed heap**, runs the constructor and returns a reference. The variable `b` (on the stack) holds that reference. When no references remain, the garbage collector frees the object.',
    },
  ],
};
