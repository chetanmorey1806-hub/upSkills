export default {
  lesson: 'day-028-object-class-is-as-boxing-unboxing',
  minutes: 18,
  intro: 'Practise System.Object members (ToString, Equals, GetHashCode), type checks with is/as and pattern matching, and boxing/unboxing.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Default `ToString()` and `Equals()` vs overridden ones: what does this print?',
      example: { title: 'default ToString prints the type name', code: 'class Car { }\nConsole.WriteLine(new Car());   // Car' },
      code: `var p1 = new Product { Code = "P10" };
var p2 = new Product { Code = "P10" };
var s1 = new Student { Roll = 7 };
var s2 = new Student { Roll = 7 };
Console.WriteLine(p1);
Console.WriteLine(p1.Equals(p2));
Console.WriteLine(s1);
Console.WriteLine(s1.Equals(s2));

class Product
{
    public string Code;
}
class Student
{
    public int Roll;
    public override string ToString() => "Student #" + Roll;
    public override bool Equals(object obj) => obj is Student s && s.Roll == Roll;
    public override int GetHashCode() => Roll.GetHashCode();
}`,
      expected: `Product
False
Student #7
True`,
      explain: 'Without overriding, `ToString()` returns the type name (with namespace if there is one) and `Equals` compares **references**, so two identical-looking Products are not equal. Student overrides both, so it prints nicely and compares by Roll. Always override `GetHashCode` together with `Equals`.',
    },
    {
      type: 'output',
      mins: 3,
      q: '`is`, `as` and pattern matching: what does this print?',
      example: { title: 'type pattern', code: 'object o = 3.5;\nif (o is double d) Console.WriteLine(d * 2);   // 7' },
      code: `object[] items = { "Mumbai", 42, 3.5, null };
foreach (object item in items)
{
    if (item is string s)
        Console.WriteLine("string of length " + s.Length);
    else if (item is int n)
        Console.WriteLine("int doubled " + n * 2);
    else if (item is null)
        Console.WriteLine("null value");
    else
        Console.WriteLine("other: " + item.GetType().Name);
}
object x = 100;
string t = x as string;
Console.WriteLine(t == null);`,
      expected: `string of length 6
int doubled 84
other: Double
null value
True`,
      explain: '`item is string s` tests the type and, if true, gives a typed variable `s`. 3.5 is a `double`, whose .NET type name is `Double`. `as` returns **null** instead of throwing when the conversion fails (100 is not a string).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What happens here?\n```\nint marks = 95;\nobject o = marks;     // line 2\nlong big = (long)o;   // line 3\n```',
      options: ['big becomes 95', 'Compile error on line 3', 'InvalidCastException at runtime on line 3', 'big becomes 0'],
      answer: 2,
      explain: 'Line 2 **boxes** the int. Unboxing must be to the **exact** boxed type: `(long)o` throws InvalidCastException. Correct way: `long big = (int)o;` (unbox to int, then implicit int → long).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that **unboxes** the object back into an int:\n```\nobject boxed = 250;\nint value = ________;\n```',
      example: { title: 'boxing and unboxing', code: 'double d = 9.5;\nobject o = d;          // boxing (implicit)\ndouble back = (double)o; // unboxing (explicit cast)' },
      accept: ['(int)boxed', '(int) boxed', '(int)boxed;'],
      acceptRegex: ['^\\(\\s*int\\s*\\)\\s*boxed\\s*;?$', '^Convert\\.ToInt32\\s*\\(\\s*boxed\\s*\\)\\s*;?$'],
      caseSensitive: true,
      explain: 'Boxing (value → object) is implicit; **unboxing** needs an explicit cast to the original type: `(int)boxed`. Every box allocates on the heap, which is why generic `List<int>` beats the old `ArrayList` for performance.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which members does **every** C# object inherit from `System.Object`? (choose all that apply)',
      options: ['ToString()', 'Equals(object)', 'GetHashCode()', 'GetType()', 'Clone()', 'Dispose()'],
      answers: [0, 1, 2, 3],
      explain: '`System.Object` provides `ToString`, `Equals`, `GetHashCode`, `GetType` (plus protected `MemberwiseClone` and `Finalize`). `Clone()` comes from `ICloneable` and `Dispose()` from `IDisposable`, only if a class implements them.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line causes **boxing**?',
      options: ['int a = 5; int b = a;', 'object o = 5;', 'string s = "5";', 'var list = new List<int> { 5 };'],
      answer: 1,
      explain: 'Assigning a value type to `object` (or to an interface type) wraps it in a heap object: that is boxing. `List<int>` stores ints directly without boxing, which is one of the main reasons generics exist.',
    },
  ],
};
