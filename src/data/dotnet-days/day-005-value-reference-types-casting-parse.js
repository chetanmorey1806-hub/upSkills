const valueRefCode = `// Value type: the VALUE is copied
int a = 10;
int b = a;
b = 20;
Console.WriteLine($"int    -> a = {a}, b = {b}");

// A struct is also a value type
Point p1 = new Point { X = 1, Y = 2 };
Point p2 = p1;
p2.X = 100;
Console.WriteLine($"struct -> p1.X = {p1.X}, p2.X = {p2.X}");

// Reference type: the REFERENCE (address) is copied, both point to one object
int[] marks1 = { 70, 80, 90 };
int[] marks2 = marks1;
marks2[0] = 99;
Console.WriteLine($"array  -> marks1[0] = {marks1[0]}, marks2[0] = {marks2[0]}");

Student s1 = new Student { Name = "Ravi" };
Student s2 = s1;
s2.Name = "Priya";
Console.WriteLine($"class  -> s1.Name = {s1.Name}, s2.Name = {s2.Name}");
Console.WriteLine("Same object? " + ReferenceEquals(s1, s2));

// string is a reference type but IMMUTABLE: assigning creates a new string
string city1 = "Delhi";
string city2 = city1;
city2 = "Mumbai";
Console.WriteLine($"string -> city1 = {city1}, city2 = {city2}");

// null: reference types and nullable value types (int?) can be null
Student? nobody = null;
int? optionalAge = null;
Console.WriteLine("nobody is null: " + (nobody == null) + ", optionalAge has value: " + optionalAge.HasValue);

struct Point { public int X; public int Y; }
class Student { public string Name = ""; }`;

const castingCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

// Implicit casting (widening): safe, done automatically
int i = 100;
long l = i;
double d = i;
Console.WriteLine($"int {i} -> long {l} -> double {d}");

// Explicit casting (narrowing): you must write (type), data may be lost
double price = 99.99;
int whole = (int)price;
Console.WriteLine($"(int)99.99 = {whole}");

double loss = -7.8;
Console.WriteLine($"(int)-7.8 = {(int)loss}");

int big = 300;
byte small = (byte)big;
Console.WriteLine($"(byte)300 = {small}");

// char <-> int
char letter = 'A';
int code = letter;               // implicit char -> int
char next = (char)(code + 1);    // explicit int -> char
Console.WriteLine($"'A' = {code}, next letter = {next}");

// Casting to avoid integer division
int x = 7, y = 2;
Console.WriteLine($"7 / 2 = {x / y}, (double)7 / 2 = {(double)x / y}");`;

const parseCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

// 1. int.Parse: string -> int
string ageText = "25";
int age = int.Parse(ageText);
Console.WriteLine("Parse: " + (age + 5));
Console.WriteLine("Without parsing: " + ageText + 5);

// 2. Convert class
int qty = Convert.ToInt32("40");
double rate = Convert.ToDouble("12.5");
bool active = Convert.ToBoolean("true");
Console.WriteLine($"Convert: {qty}, {rate}, {active}");

string? missing = null;
Console.WriteLine("Convert.ToInt32(null) = " + Convert.ToInt32(missing));

// 3. Convert ROUNDS (to even), a cast TRUNCATES
Console.WriteLine($"Convert.ToInt32(45.5) = {Convert.ToInt32(45.5)}, Convert.ToInt32(44.5) = {Convert.ToInt32(44.5)}, (int)45.5 = {(int)45.5}");

// 4. TryParse: never throws, returns true/false and gives the value through out
bool ok1 = int.TryParse("2024", out int year);
bool ok2 = int.TryParse("12abc", out int bad);
Console.WriteLine($"TryParse('2024') -> {ok1}, value {year}");
Console.WriteLine($"TryParse('12abc') -> {ok2}, value {bad}");

// 5. Parse throws exceptions for bad input
try { int.Parse("12abc"); }
catch (FormatException) { Console.WriteLine("Parse('12abc') -> FormatException"); }

try { int.Parse("99999999999"); }
catch (OverflowException) { Console.WriteLine("Parse('99999999999') -> OverflowException"); }`;

const inputCode = `Console.Write("Enter your name: ");
string name = Console.ReadLine() ?? "";

Console.Write("Enter your age: ");
string? ageInput = Console.ReadLine();

if (int.TryParse(ageInput, out int age))
{
    Console.WriteLine($"Hello {name}, in 5 years you will be {age + 5}.");
}
else
{
    Console.WriteLine($"'{ageInput}' is not a valid number.");
}

// Add two numbers typed by the user
Console.Write("Enter first number: ");
int n1 = Convert.ToInt32(Console.ReadLine());
Console.Write("Enter second number: ");
int n2 = Convert.ToInt32(Console.ReadLine());
Console.WriteLine($"{n1} + {n2} = {n1 + n2}");`;

export default {
  id: 'day-005-value-reference-types-casting-parse',
  title: 'Value Types and Reference Types, Type Casting, Convert, Parse, TryParse',
  module: 'Module 1: C# Programming Fundamentals',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Understand how C# stores value types (int, double, bool, struct) and reference types (string, array, class) in memory, what happens when you copy them, and how to convert between types: implicit and explicit casting, the Convert class, Parse and the safe TryParse. Practical: convert user input from string to integer.`,
  objectives: [
    'Differentiate value types and reference types, stack and heap, and predict the result of copying each',
    'Use null with reference types and nullable value types (int?)',
    'Apply implicit (widening) and explicit (narrowing) casting and know when data is lost',
    'Convert strings to numbers with int.Parse, Convert.ToInt32 and int.TryParse and choose the right one',
    'Read numbers safely from the keyboard with Console.ReadLine and TryParse',
  ],
  theory: [
    {
      heading: 'Value types vs reference types',
      content: `A value type variable holds the actual data. A reference type variable holds a reference (address) to an object stored on the managed heap. Analogy: a value type is like a photocopy of a document - change the copy and the original is untouched. A reference type is like sharing a Google Doc link - two people with the same link edit the same document.`,
      points: [
        'Value types: all numeric types (int, long, double, decimal...), char, bool, enum, struct (DateTime, Point), nullable value types (int?)',
        'Reference types: class, string, array, interface, delegate, record (class), object',
        'Assigning a value type copies the value; assigning a reference type copies only the reference',
        'Local value-type variables usually live on the stack (fast, freed when the method ends); objects of reference types live on the heap and are cleaned by the Garbage Collector',
        'Value types derive from System.ValueType; everything ultimately derives from System.Object',
      ],
      tip: 'The phrase "value types live on the stack" is a simplification: a value-type FIELD inside a class object lives on the heap together with that object.',
    },
    {
      heading: 'string, null and nullable value types',
      content: `string is a reference type but behaves like a value because it is immutable: any "change" creates a new string object, so other variables that pointed to the old string are not affected. A reference type variable can be null (it points to nothing). A plain value type can never be null, but you can make it nullable with ? (int?, double?, bool?) - useful for optional data like "age not entered yet" or a NULL column from a database.`,
      syntax: `string? note = null;        // ? = may be null (nullable reference types, .NET 6+)
int? score = null;          // Nullable<int>
Console.WriteLine(score.HasValue);          // False
Console.WriteLine(score ?? 0);              // 0  (?? gives a default)
int real = score.GetValueOrDefault();       // 0`,
      points: [
        'Using a member on a null reference throws NullReferenceException',
        'In .NET 6+ projects <Nullable>enable</Nullable> makes the compiler warn (CS8600, CS8602) when null might be used unsafely',
        'Console.ReadLine() returns string? because it returns null at the end of input',
      ],
    },
    {
      heading: 'Implicit casting (widening)',
      content: `When a smaller type is converted to a larger compatible type, no data can be lost, so C# does it automatically. Order of widening: byte -> short -> int -> long -> float -> double. char also converts implicitly to int (its Unicode number).`,
      syntax: `int marks = 85;
long bigMarks = marks;     // int -> long
double avg = marks;        // int -> double (85)
int code = 'A';            // char -> int (65)`,
      points: [
        'int and long convert implicitly to float/double/decimal',
        'There is NO implicit conversion between double and decimal in either direction',
        'Nothing converts implicitly to char or to bool',
      ],
    },
    {
      heading: 'Explicit casting (narrowing)',
      content: `Converting a larger type to a smaller one may lose data, so the compiler forces you to write a cast operator (type). Casting double to int TRUNCATES (removes the fraction, does not round). Casting an out-of-range integer wraps the bits: (byte)300 is 44 because 300 - 256 = 44.`,
      syntax: `double price = 99.99;
int rupees = (int)price;     // 99
int big = 300;
byte b = (byte)big;          // 44
char c = (char)66;           // 'B'
double avg = (double)7 / 2;  // 3.5`,
      points: [
        'Without the cast you get error CS0266: Cannot implicitly convert type double to int. An explicit conversion exists (are you missing a cast?)',
        'checked((byte)big) throws OverflowException instead of wrapping',
        'Casting cannot turn a string into a number: (int)"25" is a compile error - use Parse/Convert',
      ],
    },
    {
      heading: 'Convert class and Parse',
      content: `User input, files, query strings and JSON give you text (string). To do maths you must convert it. int.Parse(text) converts a string to int and throws an exception if the text is not a valid number. The System.Convert class has methods for every base type (ToInt32, ToDouble, ToDecimal, ToBoolean, ToString, ToDateTime) and also converts between numeric types with rounding.`,
      syntax: `int a = int.Parse("123");              // 123
double d = double.Parse("12.5");        // culture-dependent!
int b = Convert.ToInt32("456");         // 456
int c = Convert.ToInt32(9.7);           // 10 (rounds)
string s = Convert.ToString(99);        // "99"`,
      points: [
        'int.Parse(null) throws ArgumentNullException; Convert.ToInt32((string)null) returns 0',
        'Bad text ("12abc") -> FormatException; too big ("99999999999") -> OverflowException',
        'Convert.ToInt32(double) uses banker\'s rounding: 45.5 -> 46, 44.5 -> 44 (round half to even)',
        'double.Parse("12.5") on a PC with German or French settings expects 12,5 - use double.Parse(text, CultureInfo.InvariantCulture) for fixed-format data',
      ],
    },
    {
      heading: 'TryParse - the safe way',
      content: `int.TryParse(text, out int result) tries to convert. It returns true and puts the number in result when it succeeds, or returns false and sets result to 0 when it fails - it never throws. This is the recommended way to handle user input because users make typing mistakes.`,
      syntax: `Console.Write("Enter age: ");
string? input = Console.ReadLine();
if (int.TryParse(input, out int age))
    Console.WriteLine("Age next year: " + (age + 1));
else
    Console.WriteLine("Please enter a valid number");`,
      points: [
        'Every numeric type has TryParse: double.TryParse, decimal.TryParse, bool.TryParse, DateTime.TryParse',
        'Parse: use when the data is guaranteed valid; TryParse: use for user input; Convert: use when converting between base types or when null should become 0',
        'Exceptions are slow and noisy - prefer TryParse over try/catch around Parse',
      ],
    },
  ],
  examples: [
    {
      title: 'Copying value types vs reference types',
      scenario: 'Copy an int, a struct, an array, a class object and a string into a second variable, change the copy, and see which originals change.',
      steps: [
        'In Visual Studio: File > New > Project > Console App',
        'Name it ValueVsReference > Create (top-level statements)',
        'Replace Program.cs with the code (the struct and class must be AFTER the top-level statements)',
        'Press Ctrl+F5',
        'Optional: set a breakpoint (F9) on s2.Name = "Priya"; press F5, then F10, and watch s1.Name change in the Locals window',
      ],
      code: valueRefCode,
      csharp: { files: { 'Program.cs': valueRefCode }, stdin: '' },
      result: `int    -> a = 10, b = 20
struct -> p1.X = 1, p2.X = 100
array  -> marks1[0] = 99, marks2[0] = 99
class  -> s1.Name = Priya, s2.Name = Priya
Same object? True
string -> city1 = Delhi, city2 = Mumbai
nobody is null: True, optionalAge has value: False`,
      explanation: `int and struct are value types: b = a and p2 = p1 copy the data, so changing the copy leaves the original alone. Arrays and classes are reference types: marks2 = marks1 and s2 = s1 copy only the reference, so both variables point to the same object and a change through one is visible through the other (ReferenceEquals returns True). city2 = "Mumbai" does not modify the "Delhi" string; it makes city2 point to a new string, because strings are immutable. int? can hold null; HasValue is False.`,
    },
    {
      title: 'Implicit and explicit type casting',
      scenario: 'Widen int to long and double automatically, then narrow double to int, int to byte and int to char with casts, and fix integer division with a cast.',
      steps: [
        'File > New > Project > Console App, name it CastingDemo',
        'Replace Program.cs with the code',
        'Remove (int) from int whole = (int)price; and read the CS0266 error in the Error List, then undo with Ctrl+Z',
        'Press Ctrl+F5',
      ],
      code: castingCode,
      csharp: { files: { 'Program.cs': castingCode }, stdin: '' },
      result: `int 100 -> long 100 -> double 100
(int)99.99 = 99
(int)-7.8 = -7
(byte)300 = 44
'A' = 65, next letter = B
7 / 2 = 3, (double)7 / 2 = 3.5`,
      explanation: `int to long and double is widening, so no cast is needed (a double 100 prints as 100). (int)99.99 cuts off the fraction - 99, not 100 - and (int)-7.8 gives -7 (truncation toward zero). 300 does not fit in a byte (0..255): only the low 8 bits are kept, 300 - 256 = 44. 'A' has code 65, so (char)66 is 'B'. (double)x converts 7 to 7.0 BEFORE the division, so the result is 3.5 instead of 3.`,
    },
    {
      title: 'Convert string to integer: Parse, Convert and TryParse',
      scenario: 'Compare the three ways of turning text into numbers, including what happens with null, bad text and huge numbers.',
      steps: [
        'File > New > Project > Console App, name it ParseDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Change "2024" to "20 24" and run again - TryParse now returns False',
      ],
      code: parseCode,
      csharp: { files: { 'Program.cs': parseCode }, stdin: '' },
      result: `Parse: 30
Without parsing: 255
Convert: 40, 12.5, True
Convert.ToInt32(null) = 0
Convert.ToInt32(45.5) = 46, Convert.ToInt32(44.5) = 44, (int)45.5 = 45
TryParse('2024') -> True, value 2024
TryParse('12abc') -> False, value 0
Parse('12abc') -> FormatException
Parse('99999999999') -> OverflowException`,
      explanation: `After int.Parse, "25" becomes the number 25, so 25 + 5 = 30. Without parsing, "Without parsing: " + "25" + 5 is string concatenation, giving "255". Convert.ToInt32 of a null string returns 0 instead of throwing. Convert.ToInt32 rounds half to even (45.5 -> 46, 44.5 -> 44) while a cast truncates (45). TryParse returns True/False and fills the out variable (0 on failure). int.Parse throws FormatException for non-digits and OverflowException for values above int.MaxValue.`,
    },
    {
      title: 'Read and convert user input',
      scenario: 'Ask for name and age, validate the age with TryParse, then add two numbers typed by the user (practical program: add two numbers).',
      steps: [
        'File > New > Project > Console App, name it InputDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5 and type: Sneha (Enter), 20 (Enter), 15 (Enter), 27 (Enter)',
        'Run again and type twenty for the age - the else branch prints a friendly message instead of crashing',
      ],
      code: inputCode,
      csharp: { files: { 'Program.cs': inputCode }, stdin: 'Sneha\n20\n15\n27\n' },
      result: `Enter your name: Enter your age: Hello Sneha, in 5 years you will be 25.
Enter first number: Enter second number: 15 + 27 = 42`,
      explanation: `Console.ReadLine always returns a string (or null), so the age must be converted. TryParse("20") succeeds and age + 5 = 25. Console.Write keeps the cursor on the same line, so in the captured output the prompts run together (the typed input is not part of the output). Convert.ToInt32 converts the two numbers: 15 + 27 = 42. If the user typed "abc" for a number, Convert.ToInt32 would throw FormatException - that is why TryParse is preferred for user input. The ?? "" replaces a null name with an empty string.`,
    },
  ],
  interview: [
    { q: 'What is the difference between value types and reference types?', a: 'A value type variable stores the data itself and assignment copies the data (int, double, bool, struct, enum). A reference type variable stores a reference to an object on the heap and assignment copies the reference, so both variables refer to the same object (class, string, array, interface, delegate).', level: 'Easy' },
    { q: 'Is string a value type or a reference type? Why does it behave like a value type?', a: 'string is a reference type (System.String class), but it is immutable: every modification creates a new string, so changing one variable never affects another that referenced the old string. == is also overloaded to compare content.', level: 'Medium' },
    { q: 'Is struct a value type? Can it be null?', a: 'Yes, struct is a value type. A plain struct variable cannot be null; a nullable struct (Point? or int?) can.', level: 'Easy' },
    { q: 'What is the output? int[] a = {1,2}; int[] b = a; b[0] = 5; Console.WriteLine(a[0]);', a: '5 - arrays are reference types, so a and b refer to the same array.', level: 'Easy' },
    { q: 'Difference between implicit and explicit casting?', a: 'Implicit (widening) conversions are safe and automatic, e.g. int to long or double. Explicit (narrowing) conversions may lose data and require the cast operator, e.g. (int)3.9 gives 3.', level: 'Easy' },
    { q: 'What is the difference between int.Parse, Convert.ToInt32 and int.TryParse?', a: 'int.Parse throws ArgumentNullException for null, FormatException for bad text and OverflowException for out-of-range values. Convert.ToInt32(string) returns 0 for null but throws for bad text; it also has overloads for other types (double, bool, object). int.TryParse never throws; it returns bool and gives the value via an out parameter.', level: 'Medium' },
    { q: 'What do (int)45.5 and Convert.ToInt32(45.5) return?', a: '(int)45.5 returns 45 (truncation). Convert.ToInt32(45.5) returns 46 using banker\'s rounding (round half to even); Convert.ToInt32(44.5) returns 44.', level: 'Hard' },
    { q: 'What is the output: Console.WriteLine("5" + 3 + 2); Console.WriteLine(5 + 3 + "2");', a: '"532" and "82". Evaluation is left to right: once one operand is a string, + means concatenation; in the second line 5 + 3 = 8 is computed first, then "2" is appended.', level: 'Medium' },
    { q: 'What is (byte)300 and why?', a: '44. A byte keeps only the lowest 8 bits; 300 = 256 + 44. In a checked context it throws OverflowException.', level: 'Medium' },
    { q: 'What is a nullable value type?', a: 'A value type wrapped in Nullable<T>, written T? (int?, DateTime?). It can hold a value or null and has HasValue, Value and GetValueOrDefault(). Commonly used for optional database columns.', level: 'Easy' },
    { q: 'Why can parsing "12.5" fail on some computers?', a: 'double.Parse uses the current culture; in cultures like de-DE the decimal separator is a comma. Pass CultureInfo.InvariantCulture for machine data.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Convert string to integer: read a number as text from the user, convert it with int.TryParse and print its square. Print "Invalid number" if conversion fails.',
      hint: 'if (int.TryParse(Console.ReadLine(), out int n)) ...',
      solution: `Console.Write("Enter a number: ");
if (int.TryParse(Console.ReadLine(), out int n))
    Console.WriteLine("Square = " + (n * n));    // input 12 -> Square = 144
else
    Console.WriteLine("Invalid number");         // input abc -> Invalid number`,
    },
    {
      task: 'Add two numbers entered by the user (decimal values allowed, e.g. 10.5 and 4.25).',
      hint: 'Use double.Parse with CultureInfo.InvariantCulture so 10.5 works on every PC.',
      solution: `using System.Globalization;

Console.Write("First: ");
double a = double.Parse(Console.ReadLine()!, CultureInfo.InvariantCulture);
Console.Write("Second: ");
double b = double.Parse(Console.ReadLine()!, CultureInfo.InvariantCulture);
Console.WriteLine("Sum = " + (a + b).ToString(CultureInfo.InvariantCulture));   // 10.5 + 4.25 -> Sum = 14.75`,
    },
    {
      task: 'Create a class Book with a Title field. Create book1, assign book2 = book1, change book2.Title and print book1.Title. Then repeat with a struct and explain the difference.',
      hint: 'Class -> both change; struct -> only the copy changes.',
      solution: `BookClass c1 = new BookClass { Title = "C# Basics" };
BookClass c2 = c1;
c2.Title = "ASP.NET";
Console.WriteLine(c1.Title);   // ASP.NET (same object)

BookStruct s1 = new BookStruct { Title = "C# Basics" };
BookStruct s2 = s1;
s2.Title = "ASP.NET";
Console.WriteLine(s1.Title);   // C# Basics (independent copy)

class BookClass { public string Title = ""; }
struct BookStruct { public string Title; }`,
    },
    {
      task: 'Print the ASCII/Unicode code of the characters A, a and 0, and print the character for codes 66 and 98.',
      hint: 'int code = \'A\'; char c = (char)66;',
      solution: `Console.WriteLine((int)'A');   // 65
Console.WriteLine((int)'a');   // 97
Console.WriteLine((int)'0');   // 48
Console.WriteLine((char)66);   // B
Console.WriteLine((char)98);   // b`,
    },
    {
      task: 'Given double temperature = 36.75, print it as an int using a cast and using Convert.ToInt32, and explain the difference.',
      hint: 'Cast truncates, Convert rounds.',
      solution: `double temperature = 36.75;
Console.WriteLine((int)temperature);              // 36 (fraction removed)
Console.WriteLine(Convert.ToInt32(temperature));  // 37 (rounded to nearest)`,
    },
  ],
  quiz: [
    { question: 'Which of these is a reference type?', options: ['int', 'bool', 'struct Point', 'string'], answer: 3, explanation: 'string is a class (System.String); the others are value types.' },
    { question: 'What does (int)9.99 return?', options: ['10', '9', '9.99', 'Compile error'], answer: 1, explanation: 'A cast from double to int truncates the fractional part.' },
    { question: 'What does int.TryParse("abc", out int n) do?', options: ['Returns false and sets n to 0', 'Throws FormatException', 'Returns true and sets n to 0', 'Does not compile'], answer: 0, explanation: 'TryParse never throws; on failure it returns false and the out variable gets 0.' },
    { question: 'What is printed? int a = 5; int b = a; b = 8; Console.WriteLine(a);', options: ['8', '13', '5', '0'], answer: 2, explanation: 'int is a value type, so b got a copy; changing b does not change a.' },
    { question: 'Which conversion happens implicitly without a cast?', options: ['double to int', 'int to double', 'long to int', 'double to decimal'], answer: 1, explanation: 'int to double is a widening conversion; the others need an explicit cast.' },
  ],
};
