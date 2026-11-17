const studentCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;   // dot as decimal separator on every PC

// Store student / employee details in variables
string name = "Ravi Kumar";
int age = 21;
decimal salary = 25000.50m;   // m suffix = decimal (best for money)
double marks = 87.5;
char grade = 'A';
bool isPassed = true;

Console.WriteLine("Name     : " + name);
Console.WriteLine("Age      : " + age);
Console.WriteLine("Salary   : " + salary);
Console.WriteLine("Marks    : " + marks);
Console.WriteLine("Grade    : " + grade);
Console.WriteLine("Passed   : " + isPassed);

// A variable can change its value later
age = age + 1;
salary = salary + 2000;
Console.WriteLine($"Next year {name} will be {age} and earn {salary}");`;

const typesCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

Console.WriteLine("--- Integer types ---");
Console.WriteLine($"byte  : {sizeof(byte)} byte,  {byte.MinValue} to {byte.MaxValue}");
Console.WriteLine($"short : {sizeof(short)} bytes, {short.MinValue} to {short.MaxValue}");
Console.WriteLine($"int   : {sizeof(int)} bytes, {int.MinValue} to {int.MaxValue}");
Console.WriteLine($"long  : {sizeof(long)} bytes, {long.MinValue} to {long.MaxValue}");

Console.WriteLine("--- Real number types ---");
Console.WriteLine($"float   : {sizeof(float)} bytes, about 6-9 digits, max {float.MaxValue}");
Console.WriteLine($"double  : {sizeof(double)} bytes, about 15-17 digits, max {double.MaxValue}");
Console.WriteLine($"decimal : {sizeof(decimal)} bytes, 28-29 digits, max {decimal.MaxValue}");

Console.WriteLine("--- Other types ---");
Console.WriteLine($"char : {sizeof(char)} bytes (UTF-16), e.g. {'A'}");
Console.WriteLine($"bool : {sizeof(bool)} byte, {true} or {false}");`;

const constCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

const decimal Pi = 3.14m;
const int MaxMarksPerSubject = 100;
const int SubjectCount = 5;
const string InstituteName = "Tech Academy";
const int MaxTotal = MaxMarksPerSubject * SubjectCount;   // a constant built from constants

decimal radius = 7;
decimal area = Pi * radius * radius;
Console.WriteLine("Circle area: " + area);

int totalMarks = 437;
double percentage = totalMarks * 100.0 / MaxTotal;
Console.WriteLine(InstituteName + " - Result");
Console.WriteLine("Total: " + totalMarks + " / " + MaxTotal);
Console.WriteLine("Percentage: " + percentage + "%");

// Pi = 3.14159m;   // error CS0131: a constant cannot be changed`;

const literalsCode = `using System.Globalization;

CultureInfo.CurrentCulture = CultureInfo.InvariantCulture;

// 1. Literals, digit separators and suffixes
long population = 1_400_000_000L;
int hexValue = 0xFF;
int binaryValue = 0b1010;
float temperature = 36.6f;
Console.WriteLine(population);
Console.WriteLine(hexValue);
Console.WriteLine(binaryValue);
Console.WriteLine(temperature);

// 2. var: the compiler infers the type from the value
var city = "Pune";
var count = 10;
var price = 99.99m;
var ratio = 0.75;
var letter = 'Z';
Console.WriteLine(city.GetType().Name + ", " + count.GetType().Name + ", " +
    price.GetType().Name + ", " + ratio.GetType().Name + ", " + letter.GetType().Name);

// 3. Default values
Console.WriteLine($"default(int) = {default(int)}, default(bool) = {default(bool)}, default(double) = {default(double)}");

// 4. Overflow wraps around silently (unchecked by default)
int big = int.MaxValue;
big = big + 1;
Console.WriteLine("int.MaxValue + 1 = " + big);

// 5. double is binary (tiny rounding errors), decimal is exact for money
double d = 0.1 + 0.2;
decimal m = 0.1m + 0.2m;
Console.WriteLine("double  0.1 + 0.2 = " + d);
Console.WriteLine("decimal 0.1 + 0.2 = " + m);`;

export default {
  id: 'day-004-variables-constants-data-types',
  title: 'Variables, Constants, Data Types',
  module: 'Module 1: C# Programming Fundamentals',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: `Learn how C# stores data in memory: declaring and initializing variables, naming rules, the built-in data types (integer, real, char, bool, string), constants with const, type inference with var, literals, default values and overflow. You will store a student's name, age, salary and marks.`,
  objectives: [
    'Declare, initialize and update variables using correct naming rules',
    'Choose the right data type (int, long, double, decimal, char, bool, string) for each kind of value',
    'Use const for values that never change and understand compile-time constants',
    'Use var, literal suffixes (L, f, m), digit separators and default values correctly',
    'Explain overflow and why decimal is used for money instead of double',
  ],
  theory: [
    {
      heading: 'What is a variable?',
      content: `A variable is a named box in memory that holds a value. In C# every variable has a TYPE (what kind of data it can hold), a NAME (how you refer to it) and a VALUE. C# is statically typed: once a variable is declared as int, it can only ever hold integers. Think of labelled jars in a kitchen: the jar marked "Sugar" holds only sugar, but the amount inside can change.`,
      syntax: `int age;            // declaration (type + name)
age = 21;           // assignment
int marks = 85;     // declaration + initialization in one line
int a = 1, b = 2;   // several variables of the same type
age = age + 1;      // update: age is now 22`,
      points: [
        'A local variable MUST be assigned before it is read, otherwise error CS0165: Use of unassigned local variable',
        'Naming rules: start with a letter or _, then letters/digits/_; no spaces; not a keyword; case-sensitive (age and Age are different)',
        'Conventions: camelCase for local variables (studentName, totalMarks); meaningful names, not x1, x2',
        'You cannot declare two variables with the same name in the same scope (error CS0128)',
      ],
    },
    {
      heading: 'Built-in data types at a glance',
      content: `C# keywords like int and string are aliases for .NET types in the System namespace (int = System.Int32, string = System.String). This is the Common Type System (CTS) from Day 1, so every .NET language agrees on the size of an int.`,
      points: [
        'Integers: byte (1 byte, 0..255), short (2), int (4, about +/- 2.1 billion), long (8); unsigned versions sbyte, ushort, uint, ulong',
        'Real numbers: float (4 bytes, ~7 digits), double (8 bytes, ~15-16 digits, the default for 3.5), decimal (16 bytes, 28-29 digits, for money)',
        'char: one UTF-16 character in single quotes, e.g. \'A\' (2 bytes)',
        'bool: true or false only (not 0/1 like C)',
        'string: text in double quotes, e.g. "Ravi" (a reference type - Day 5)',
        'int is the default choice for whole numbers, double for scientific values, decimal for currency',
      ],
      tip: 'Hover over int in Visual Studio and the tooltip shows "struct System.Int32" - proof that int is just a short name for a .NET type.',
    },
    {
      heading: 'Choosing between float, double and decimal',
      content: `float and double store numbers in binary, so many decimal fractions (like 0.1) cannot be stored exactly and small rounding errors appear: 0.1 + 0.2 gives 0.30000000000000004 as a double. decimal stores numbers in base 10 and gives exact results for money calculations, at the cost of being slower and using more memory.`,
      syntax: `float  f = 3.5f;      // f suffix is required
double d = 3.5;       // default type of a literal with a dot
decimal m = 3.5m;     // m suffix is required (m for money)`,
      points: [
        'decimal price = 9.99;  -> error CS0664: use the m suffix',
        'Use decimal for salary, price, bank balance; double for distance, temperature, scientific maths',
        'Never compare doubles with == after calculations; compare with a small tolerance instead',
      ],
    },
    {
      heading: 'Constants: const',
      content: `A constant is a value fixed at compile time that can never change while the program runs, such as PI, the number of months in a year or the maximum marks of a subject. The compiler replaces every use of the constant with its value. Constants make code readable (MaxMarks instead of a magic number 100) and safe (nobody can change it by accident).`,
      syntax: `const double Pi = 3.14159;
const int MaxMarks = 100;
const string AppName = "Student Portal";
// Pi = 3.14;  -> error CS0131`,
      points: [
        'A const must be initialized in the same line with a compile-time value',
        'Allowed types: numbers, char, bool, string (and enum); not objects like DateTime.Now',
        'Naming convention: PascalCase (MaxMarks, TaxRate)',
        'readonly fields (Module 2) are similar but can be set at run time inside a constructor',
      ],
    },
    {
      heading: 'var, literals and default values',
      content: `var lets the compiler infer the type from the value on the right: var count = 10; makes count an int - it is still strongly typed, not "any type". Literals are values written directly in code; suffixes and prefixes tell the compiler their type and base.`,
      syntax: `var name = "Asha";        // string
var total = 0;            // int
var price = 49.50m;       // decimal
long big = 9_000_000_000L; // L suffix, _ digit separator
int hex = 0x1F;           // hexadecimal = 31
int bin = 0b0110;         // binary = 6`,
      points: [
        'var must be initialized in the same line: var x; is an error (CS0818)',
        'Once inferred, the type is fixed: var n = 5; n = "five"; is an error',
        'default(int) is 0, default(bool) is false, default(double) is 0, default(string) is null',
        'Fields of a class get default values automatically; local variables do not',
      ],
    },
    {
      heading: 'Overflow and type limits',
      content: `Every numeric type has a MinValue and MaxValue. If a calculation goes beyond the range, C# by default wraps around silently: int.MaxValue + 1 becomes int.MinValue (-2147483648). Use a bigger type (long) when values can be large, or a checked block to get an OverflowException instead.`,
      syntax: `int x = int.MaxValue;
x = x + 1;                 // -2147483648 (wraps)
checked { x = int.MaxValue; x = x + 1; }   // throws OverflowException`,
      points: [
        'Population of a country, file sizes in bytes, phone numbers as numbers -> use long (or string for phone numbers)',
        'Project Properties > Build > Advanced > "Check for arithmetic overflow" turns on checking for the whole project',
        'int.MaxValue + 1 written with constants only is caught by the compiler (error CS0220)',
      ],
    },
  ],
  examples: [
    {
      title: 'Store name, age, salary and marks',
      scenario: 'Store the details of a student who also works part-time, print them, then update the age and salary for next year.',
      steps: [
        'In Visual Studio: File > New > Project > Console App > Next',
        'Name it VariablesDemo > Next > .NET 10.0 > Create (top-level statements)',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Put a breakpoint (F9) on the line age = age + 1; press F5 and watch the Locals window show every variable with its type and value; press F10 and see age change to 22',
      ],
      code: studentCode,
      csharp: { files: { 'Program.cs': studentCode }, stdin: '' },
      result: `Name     : Ravi Kumar
Age      : 21
Salary   : 25000.50
Marks    : 87.5
Grade    : A
Passed   : True
Next year Ravi Kumar will be 22 and earn 27000.50`,
      explanation: `Each value lives in a variable of a suitable type: text in string, whole number in int, money in decimal, a fraction in double, one letter in char, yes/no in bool. A decimal keeps its trailing zeros (25000.50), a bool prints as True. age = age + 1 reads the old value (21), adds 1 and stores 22 back. Setting CultureInfo.CurrentCulture to InvariantCulture makes numbers always print with a dot, whatever the regional settings of the PC.`,
    },
    {
      title: 'Sizes and ranges of the data types',
      scenario: 'Print how many bytes each built-in type uses and the smallest and largest value it can store.',
      steps: [
        'File > New > Project > Console App, name it DataTypesDemo',
        'Replace Program.cs with the code',
        'Press Ctrl+F5',
        'Hover over int, long and decimal in the editor to see their .NET names (System.Int32, System.Int64, System.Decimal)',
      ],
      code: typesCode,
      csharp: { files: { 'Program.cs': typesCode }, stdin: '' },
      result: `--- Integer types ---
byte  : 1 byte,  0 to 255
short : 2 bytes, -32768 to 32767
int   : 4 bytes, -2147483648 to 2147483647
long  : 8 bytes, -9223372036854775808 to 9223372036854775807
--- Real number types ---
float   : 4 bytes, about 6-9 digits, max 3.4028235E+38
double  : 8 bytes, about 15-17 digits, max 1.7976931348623157E+308
decimal : 16 bytes, 28-29 digits, max 79228162514264337593543950335
--- Other types ---
char : 2 bytes (UTF-16), e.g. A
bool : 1 byte, True or False`,
      explanation: `sizeof gives the size in bytes of a built-in type; MinValue and MaxValue are constants on each type. float and double have huge ranges, printed in scientific notation (E+38 means x 10^38), but limited precision. decimal has a smaller range but 28-29 exact digits, which is why it is used for money.`,
    },
    {
      title: 'Constants for PI and maximum marks',
      scenario: 'Use constants for values that never change: PI, maximum marks per subject, number of subjects and the institute name.',
      steps: [
        'File > New > Project > Console App, name it ConstantsDemo',
        'Replace Program.cs with the code and press Ctrl+F5',
        'Remove the // before Pi = 3.14159m; and look at the Error List (CS0131), then put the // back',
        'Hover over MaxTotal: the tooltip shows its value 500 - computed by the compiler',
      ],
      code: constCode,
      csharp: { files: { 'Program.cs': constCode }, stdin: '' },
      result: `Circle area: 153.86
Tech Academy - Result
Total: 437 / 500
Percentage: 87.4%`,
      explanation: `Area = 3.14 x 7 x 7 = 153.86 exactly, because all values are decimal. MaxTotal = 100 x 5 = 500 is calculated at compile time. 437 * 100.0 / 500: 100.0 is a double, so the multiplication and division are done in double, giving 87.4 (with 437 * 100 / 500 in int you would get only 87). Trying to assign to a const is a compile-time error.`,
    },
    {
      title: 'Literals, var, default values, overflow and precision',
      scenario: 'Explore number literals, type inference with var, default values, what happens past int.MaxValue and why double is not used for money.',
      steps: [
        'File > New > Project > Console App, name it LiteralsDemo',
        'Replace Program.cs with the code',
        'Hover over each var keyword - Visual Studio shows the inferred type',
        'Press Ctrl+F5',
      ],
      code: literalsCode,
      csharp: { files: { 'Program.cs': literalsCode }, stdin: '' },
      result: `1400000000
255
10
36.6
String, Int32, Decimal, Double, Char
default(int) = 0, default(bool) = False, default(double) = 0
int.MaxValue + 1 = -2147483648
double  0.1 + 0.2 = 0.30000000000000004
decimal 0.1 + 0.2 = 0.3`,
      explanation: `Underscores in 1_400_000_000 are only for readability. 0xFF is hexadecimal 255 and 0b1010 is binary 10. var picks string, int, decimal (m suffix), double (plain 0.75) and char - GetType().Name shows the .NET names. Adding 1 to int.MaxValue wraps around to int.MinValue without an error. 0.1 and 0.2 cannot be stored exactly in binary, so the double sum is slightly off; decimal gives exactly 0.3.`,
    },
  ],
  interview: [
    { q: 'What is a variable in C#?', a: 'A named storage location in memory with a fixed type. The type decides what values it can hold and how much memory it uses.', level: 'Easy' },
    { q: 'What is the difference between int and Int32?', a: 'None - int is the C# keyword alias for System.Int32. Likewise string = System.String, bool = System.Boolean, double = System.Double, decimal = System.Decimal.', level: 'Easy' },
    { q: 'When should you use decimal instead of double?', a: 'For money and any value that must be exact in base 10. decimal has 28-29 significant digits and no binary rounding error; double is faster and used for scientific values where tiny errors are acceptable.', level: 'Easy' },
    { q: 'What is the output of: double d = 0.1 + 0.2; Console.WriteLine(d == 0.3);', a: 'False. The double sum is 0.30000000000000004, which is not exactly equal to 0.3.', level: 'Medium' },
    { q: 'What is the output of: int x = int.MaxValue; x++; Console.WriteLine(x);', a: '-2147483648. Integer arithmetic is unchecked by default, so it wraps around to int.MinValue. Inside checked { } it would throw OverflowException.', level: 'Medium' },
    { q: 'What is the difference between const and readonly?', a: 'const is a compile-time constant, must be initialized at declaration, is implicitly static and only allows primitive types/string. readonly is a field that can be assigned at declaration or in a constructor at run time and can hold any type.', level: 'Medium' },
    { q: 'Is var dynamically typed?', a: 'No. var is resolved at compile time; the variable gets the type of its initializer and keeps it. dynamic is the keyword that defers type checking to run time (Day 15).', level: 'Medium' },
    { q: 'Why does decimal price = 10.5; not compile?', a: 'The literal 10.5 is a double and there is no implicit conversion from double to decimal (CS0664). Write 10.5m.', level: 'Easy' },
    { q: 'What is the default value of an int field, a bool field and a string field?', a: '0, false and null. Local variables have no default - they must be assigned before use (CS0165).', level: 'Easy' },
    { q: 'What does Console.WriteLine(7 / 2); print, and how do you get 3.5?', a: 'It prints 3 because both operands are int (integer division). Use 7 / 2.0, 7.0 / 2 or (double)7 / 2 to get 3.5.', level: 'Easy' },
    { q: 'How many bytes do char and bool use in C#?', a: 'char uses 2 bytes (one UTF-16 code unit); bool uses 1 byte (sizeof(bool) is 1).', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Hello World with variables: store your name and city in variables and print "Hello, I am <name> from <city>".',
      hint: 'Two string variables and string concatenation or interpolation.',
      solution: `string name = "Meera";
string city = "Chennai";
Console.WriteLine($"Hello, I am {name} from {city}");
// Hello, I am Meera from Chennai`,
    },
    {
      task: 'Add two numbers: store 25 and 17 in int variables and print their sum, then store 2.5 and 1.25 in double variables and print their sum.',
      hint: 'Use + and print with interpolation.',
      solution: `int a = 25, b = 17;
Console.WriteLine($"Sum = {a + b}");       // Sum = 42
double x = 2.5, y = 1.25;
Console.WriteLine($"Sum = {x + y}");       // Sum = 3.75 (with a dot under invariant culture)`,
    },
    {
      task: 'Employee payslip: store employee name, basic salary 30000 (decimal), HRA as a const 20% and print basic, HRA amount and gross salary.',
      hint: 'const decimal HraRate = 0.20m; HRA = basic * HraRate.',
      solution: `const decimal HraRate = 0.20m;
string empName = "Kiran";
decimal basic = 30000m;
decimal hra = basic * HraRate;
decimal gross = basic + hra;
Console.WriteLine($"Employee: {empName}");
Console.WriteLine($"Basic: {basic}");    // Basic: 30000
Console.WriteLine($"HRA: {hra}");        // HRA: 6000.00 (decimal keeps scale 2 from 0.20)
Console.WriteLine($"Gross: {gross}");    // Gross: 36000.00`,
    },
    {
      task: 'Store marks of 5 subjects in int variables (78, 85, 90, 66, 81), calculate total and percentage (out of 500) and print both.',
      hint: 'Use 100.0 or (double) to avoid integer division.',
      solution: `int m1 = 78, m2 = 85, m3 = 90, m4 = 66, m5 = 81;
const int MaxTotal = 500;
int total = m1 + m2 + m3 + m4 + m5;
double percentage = total * 100.0 / MaxTotal;
Console.WriteLine("Total = " + total);              // Total = 400
Console.WriteLine("Percentage = " + percentage);    // Percentage = 80`,
    },
    {
      task: 'Use var to declare five variables of different types and print each value with its type name using GetType().Name.',
      hint: 'var a = 5; Console.WriteLine(a + " is " + a.GetType().Name);',
      solution: `var a = 5;
var b = 5L;
var c = 5.0;
var d = 5m;
var e = "5";
Console.WriteLine(a.GetType().Name);  // Int32
Console.WriteLine(b.GetType().Name);  // Int64
Console.WriteLine(c.GetType().Name);  // Double
Console.WriteLine(d.GetType().Name);  // Decimal
Console.WriteLine(e.GetType().Name);  // String`,
    },
  ],
  quiz: [
    { question: 'Which data type is best for storing a product price?', options: ['float', 'double', 'decimal', 'int'], answer: 2, explanation: 'decimal stores base-10 values exactly and is the standard type for money.' },
    { question: 'What is the type of x in: var x = 10.5;', options: ['double', 'float', 'decimal', 'int'], answer: 0, explanation: 'A literal with a decimal point and no suffix is a double.' },
    { question: 'Which line causes a compile-time error?', options: ['int a = 5;', 'const int Max = 100;', 'long n = 5;', 'decimal p = 9.99;'], answer: 3, explanation: '9.99 is a double literal; decimal needs the m suffix (9.99m).' },
    { question: 'What does this print? int x = int.MaxValue; x = x + 1; Console.WriteLine(x);', options: ['2147483648', '-2147483648', '0', 'OverflowException'], answer: 1, explanation: 'Unchecked integer arithmetic wraps around to int.MinValue.' },
    { question: 'How many bytes does an int occupy?', options: ['2', '8', '1', '4'], answer: 3, explanation: 'int is System.Int32: 32 bits = 4 bytes.' },
  ],
};
