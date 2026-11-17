const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        byte age = 25;
        short year = 2024;
        int population = 1400000000;
        long distanceToSun = 149600000000L;
        float price = 99.5f;
        double pi = 3.14159;
        char grade = 'A';
        boolean isJavaFun = true;

        System.out.println("byte    age        = " + age);
        System.out.println("short   year       = " + year);
        System.out.println("int     population = " + population);
        System.out.println("long    distance   = " + distanceToSun);
        System.out.println("float   price      = " + price);
        System.out.println("double  pi         = " + pi);
        System.out.println("char    grade      = " + grade);
        System.out.println("boolean isJavaFun  = " + isJavaFun);
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        System.out.println("byte  : " + Byte.MIN_VALUE + " to " + Byte.MAX_VALUE);
        System.out.println("short : " + Short.MIN_VALUE + " to " + Short.MAX_VALUE);
        System.out.println("int   : " + Integer.MIN_VALUE + " to " + Integer.MAX_VALUE);
        System.out.println("long  : " + Long.MIN_VALUE + " to " + Long.MAX_VALUE);
        System.out.println("char  : " + (int) Character.MIN_VALUE + " to " + (int) Character.MAX_VALUE);
        System.out.println("int size in bits  : " + Integer.SIZE);
        System.out.println("long size in bytes: " + Long.BYTES);

        int max = Integer.MAX_VALUE;
        int overflow = max + 1;
        System.out.println("MAX_VALUE + 1 = " + overflow);
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        int decimal = 100;
        int binary = 0b1010;        // binary literal
        int octal = 017;            // octal literal (leading 0)
        int hex = 0x1F;             // hexadecimal literal
        int salary = 1_00_000;      // underscores for readability
        double scientific = 1.5e3;  // 1.5 x 10^3
        char unicodeA = 'A';   // unicode escape
        char letter = 'A';

        System.out.println("decimal    = " + decimal);
        System.out.println("binary     = " + binary);
        System.out.println("octal      = " + octal);
        System.out.println("hex        = " + hex);
        System.out.println("salary     = " + salary);
        System.out.println("scientific = " + scientific);
        System.out.println("unicodeA   = " + unicodeA);
        System.out.println("letter + 1 = " + (letter + 1));
        System.out.println("next char  = " + (char) (letter + 1));
    }
}`;

const ex4 = j`class Defaults {
    byte b;
    short s;
    int i;
    long l;
    float f;
    double d;
    char c;
    boolean flag;
    String text;   // reference type
}

public class Main {
    public static void main(String[] args) {
        Defaults obj = new Defaults();
        System.out.println("byte    : " + obj.b);
        System.out.println("short   : " + obj.s);
        System.out.println("int     : " + obj.i);
        System.out.println("long    : " + obj.l);
        System.out.println("float   : " + obj.f);
        System.out.println("double  : " + obj.d);
        System.out.println("char    : " + (int) obj.c);
        System.out.println("boolean : " + obj.flag);
        System.out.println("String  : " + obj.text);

        int localCount;              // local variable: NO default value
        // System.out.println(localCount); // compile error: might not have been initialized
        localCount = 10;
        System.out.println("local   : " + localCount);
    }
}`;

const ex5 = j`public class Main {
    static int instituteCount = 0;   // static (class) variable
    String studentName;              // instance variable

    public static void main(String[] args) {
        Main s1 = new Main();
        s1.studentName = "Asha";
        instituteCount++;

        Main s2 = new Main();
        s2.studentName = "Rahul";
        instituteCount++;

        var marks = 88;                // local variable, type inferred as int
        System.out.println(s1.studentName + " and " + s2.studentName);
        System.out.println("Students joined: " + instituteCount);
        System.out.println("Marks (var): " + marks);
    }
}`;

export default {
  id: 'day-04-variables-data-types-literals',
  title: 'Variables and Primitive Data Types, Literals, Default Values',
  module: 'Module 1: Java Basics',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn how Java stores data in variables, the 8 primitive data types with their sizes and ranges, how to write literals in different number systems, and which default values fields receive.',
  objectives: [
    'Declare, initialise and use variables of every primitive type',
    'Remember the size and range of byte, short, int, long, float, double, char and boolean',
    'Write integer literals in decimal, binary, octal and hexadecimal, plus float, char and String literals',
    'Distinguish local, instance and static variables',
    'Know the default values of fields and why local variables have none',
  ],
  theory: [
    {
      heading: 'What is a Variable?',
      content: j`A variable is a named memory location that stores a value which can change during program execution.

Analogy: a variable is like a labelled box in a storeroom. The label is the variable name, the size/shape of the box is the data type (a shoe box cannot hold a refrigerator), and the item inside is the value.

Declaration: tells the type and name.        int age;
Initialisation: gives the first value.        age = 21;
Both together:                                int age = 21;
Multiple in one line:                         int a = 1, b = 2, c = 3;

Java is statically typed: once declared as int, age can only ever hold int values.`,
      syntax: j`dataType variableName = value;
int count = 10;
final double PI = 3.14159;   // final = cannot be changed (constant)`,
    },
    {
      heading: 'The 8 Primitive Data Types',
      content: j`Primitive types store simple values directly in memory (not objects). Their sizes are fixed on every platform, which makes Java portable.

Type     Size      Range / values                         Default   Example
byte     1 byte    -128 to 127                            0         byte b = 10;
short    2 bytes   -32,768 to 32,767                      0         short s = 3000;
int      4 bytes   about -2.1 billion to 2.1 billion      0         int i = 100000;
long     8 bytes   about -9.2 x 10^18 to 9.2 x 10^18      0L        long l = 123L;
float    4 bytes   ~6-7 decimal digits precision          0.0f      float f = 1.5f;
double   8 bytes   ~15-16 decimal digits precision        0.0d      double d = 1.5;
char     2 bytes   0 to 65,535 (Unicode character)        '\u0000'  char c = 'A';
boolean  JVM-dependent (1 bit of info)  true / false      false     boolean ok = true;

Groups:
- Integer types: byte, short, int, long  (int is the default for whole numbers)
- Floating types: float, double          (double is the default for decimals)
- Character: char (unsigned, stores Unicode)
- Boolean: boolean (only true or false, NOT 0/1 like C)`,
      points: [
        'long literals need L suffix: 9000000000L (without L it is an int and too big -> error)',
        'float literals need f suffix: 3.5f (3.5 alone is a double -> error when assigned to float)',
        'Use double for most decimal maths; use BigDecimal (Day 30) for money',
        'String is NOT a primitive; it is a class (reference type)',
      ],
    },
    {
      heading: 'Primitive vs Reference Types',
      content: j`- Primitive variables hold the actual value: int x = 5; the box contains 5.
- Reference variables hold the address (reference) of an object: String s = "Hi"; the box contains an arrow pointing to the String object on the heap.

Stack                      Heap
+-----------+
| x  |  5   |
| s  |  ---------------->  [ "Hi" String object ]
+-----------+

Reference types include classes (String, Scanner), arrays, interfaces, enums and records. Their default value is null (points to nothing).`,
    },
    {
      heading: 'Literals',
      content: j`A literal is a fixed value written directly in code.

Integer literals:
- Decimal: 100
- Binary (prefix 0b): 0b1010 = 10
- Octal (prefix 0): 017 = 15     (careful: 010 is 8, not 10!)
- Hexadecimal (prefix 0x): 0x1F = 31
- Underscores for readability (Java 7+): 1_000_000, 1_00_000 (cannot start/end with _ or be next to the decimal point)

Floating literals: 3.14 (double), 3.14f (float), 1.5e3 (= 1500.0), 2.5d
Character literals: 'A', '9', '\n' (new line), '\t' (tab), '\'' (single quote), '\\' (backslash), 'A' (Unicode for A)
String literal: "Hello"
Boolean literals: true, false
Null literal: null`,
      tip: 'A char is internally a number. \'A\' is 65, \'a\' is 97, \'0\' is 48. So \'A\' + 1 gives the int 66, and (char)(\'A\' + 1) gives \'B\'.',
    },
    {
      heading: 'Types of Variables: Local, Instance, Static',
      content: j`1. Local variable: declared inside a method/block. Lives on the stack only while the method runs. MUST be initialised before use (no default value).
2. Instance variable (field): declared inside a class but outside methods, without static. Each object gets its own copy. Gets a default value.
3. Static (class) variable: declared with static. Only ONE copy shared by all objects. Gets a default value.

Analogy for a classroom: each student's name is an instance variable (different for each student); the school name is a static variable (same for all); the rough work done during one exam is a local variable (thrown away after the exam).

Default values for fields: 0 for byte/short/int/long, 0.0 for float/double, '\u0000' for char, false for boolean, null for all references.`,
    },
    {
      heading: 'var - Local Variable Type Inference (Java 10+)',
      content: j`var lets the compiler infer the type of a LOCAL variable from the value on the right side:

var count = 10;          // int
var name = "Java";       // String
var price = 9.99;        // double

Rules:
- Only for local variables with an initialiser (not fields, not method parameters).
- var x;  -> error (no initialiser).   var y = null; -> error.
- The type is still fixed at compile time; Java is still statically typed.
- var is not a keyword, it is a reserved type name, so a variable named var is still allowed (but avoid it).`,
    },
  ],
  examples: [
    {
      title: 'All 8 primitive types',
      scenario: 'Store real-world values in the most suitable primitive type and print them.',
      steps: [
        'Create class Main (IntelliJ: New > Java Class; Eclipse: New > Class)',
        'Declare one variable of each primitive type with suffix L for long and f for float',
        'Print each with a label and run',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `byte    age        = 25
short   year       = 2024
int     population = 1400000000
long    distance   = 149600000000
float   price      = 99.5
double  pi         = 3.14159
char    grade      = A
boolean isJavaFun  = true`,
      explanation: 'Each value fits in its type. 149600000000 is larger than int max (2147483647), so it needs a long with L. The f suffix makes 99.5 a float literal. Numbers print without suffixes.',
    },
    {
      title: 'Ranges, sizes and integer overflow',
      scenario: 'Use wrapper class constants to print the exact range of each type and see what happens when int overflows.',
      steps: [
        'Type the program using Byte.MIN_VALUE, Integer.MAX_VALUE etc.',
        'Cast char limits to int so they print as numbers',
        'Run and read the overflow result carefully',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `byte  : -128 to 127
short : -32768 to 32767
int   : -2147483648 to 2147483647
long  : -9223372036854775808 to 9223372036854775807
char  : 0 to 65535
int size in bits  : 32
long size in bytes: 8
MAX_VALUE + 1 = -2147483648`,
      explanation: 'Integer overflow wraps around silently: adding 1 to the largest int gives the smallest int, like a car odometer rolling over from 999999 to 000000. Java does not throw an error, so choose long when values may be large.',
    },
    {
      title: 'Different kinds of literals',
      scenario: 'Write the same kind of value in different number systems and with char tricks.',
      steps: [
        'Declare binary, octal, hex and underscore literals',
        'Add a scientific double and a Unicode char',
        'Print each and also letter + 1 with and without a cast to char',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `decimal    = 100
binary     = 10
octal      = 15
hex        = 31
salary     = 100000
scientific = 1500.0
unicodeA   = A
letter + 1 = 66
next char  = B`,
      explanation: '0b1010 = 8 + 2 = 10. 017 = 1*8 + 7 = 15. 0x1F = 1*16 + 15 = 31. Underscores are removed by the compiler. 1.5e3 = 1500.0. \'A\' is 65, so letter + 1 is the int 66 and casting it back to char gives B.',
    },
    {
      title: 'Default values of fields vs local variables',
      scenario: 'Find out what value a field has if you never assign it, and why local variables behave differently.',
      steps: [
        'Create class Defaults with one field of each type and a String field',
        'Create an object in main and print every field without assigning anything',
        'Un-comment the localCount print line to see the compile error, then comment it again',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `byte    : 0
short   : 0
int     : 0
long    : 0
float   : 0.0
double  : 0.0
char    : 0
boolean : false
String  : null
local   : 10`,
      explanation: 'Fields are automatically initialised when the object is created. The default char is the null character \\u0000, so we print it as (int) to see 0. Local variables get no default; using one before assigning gives "variable might not have been initialized".',
    },
    {
      title: 'Local, instance and static variables with var',
      scenario: 'Count students joining an institute: each student has a name, and the count is shared.',
      steps: [
        'Declare a static field instituteCount and an instance field studentName in Main',
        'Create two Main objects and increase the shared count each time',
        'Use var for a local variable and run',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Asha and Rahul
Students joined: 2
Marks (var): 88`,
      explanation: 'Each object has its own studentName, but instituteCount is a single shared copy, so it becomes 2. var marks = 88 is inferred as int at compile time.',
    },
  ],
  interview: [
    { q: 'How many primitive data types are in Java? Name them.', a: 'Eight: byte, short, int, long, float, double, char, boolean.', level: 'Easy' },
    { q: 'Why is char 2 bytes in Java but 1 byte in C?', a: 'Java uses Unicode (UTF-16 code units) to support all world languages, which needs 16 bits. C uses ASCII which fits in 8 bits.', level: 'Medium' },
    { q: 'What is the default value of a local variable?', a: 'Local variables have no default value. They must be explicitly initialised before use, otherwise compilation fails.', level: 'Easy' },
    { q: 'What is the output: System.out.println(010);', a: '8. A leading 0 makes it an octal literal: 1*8 + 0 = 8.', level: 'Medium' },
    { q: 'What is the output: System.out.println(Integer.MAX_VALUE + 1);', a: '-2147483648. int overflow wraps around to the minimum value.', level: 'Medium' },
    { q: 'Why does float f = 3.5; give a compile error?', a: '3.5 is a double literal (8 bytes) and cannot be stored in a float (4 bytes) without a cast. Use 3.5f.', level: 'Easy' },
    { q: 'What is the output: char c = \'a\'; System.out.println(c + 1);', a: '98. \'a\' is 97, and char + int is promoted to int.', level: 'Medium' },
    { q: 'Is String a primitive type?', a: 'No. String is a class in java.lang; String variables are references. Its default value as a field is null.', level: 'Easy' },
    { q: 'Difference between instance and static variables?', a: 'Each object has its own copy of an instance variable; a static variable has one copy per class shared by all objects and can be accessed using the class name.', level: 'Easy' },
    { q: 'Can var be used for fields or method parameters?', a: 'No. var is only for local variables (and loop variables, lambda parameters) that have an initialiser.', level: 'Medium' },
    { q: 'What is the size of boolean in Java?', a: 'It represents one bit of information but its actual size is not specified by the JVM spec; typically 1 byte in arrays.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Store details of a product (id as int, name as String, price as double, inStock as boolean, category code as char) and print them.',
      hint: 'Choose the correct type for each value.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int id = 101;
        String name = "Laptop";
        double price = 55999.99;
        boolean inStock = true;
        char category = 'E';
        System.out.println("ID: " + id);
        System.out.println("Name: " + name);
        System.out.println("Price: " + price);
        System.out.println("In stock: " + inStock);
        System.out.println("Category: " + category);
    }
}`,
    },
    {
      task: 'Print the number 255 written as binary, octal and hex literals to prove they are equal.',
      hint: '255 = 0b11111111 = 0377 = 0xFF.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int a = 0b11111111;
        int b = 0377;
        int c = 0xFF;
        System.out.println(a + " " + b + " " + c);
        System.out.println(a == b && b == c);
    }
}`,
    },
    {
      task: 'Print the ASCII/Unicode values of A, Z, a, z and 0.',
      hint: 'Cast a char to int: (int) \'A\'.',
      solution: j`public class Main {
    public static void main(String[] args) {
        System.out.println("A = " + (int) 'A');
        System.out.println("Z = " + (int) 'Z');
        System.out.println("a = " + (int) 'a');
        System.out.println("z = " + (int) 'z');
        System.out.println("0 = " + (int) '0');
    }
}`,
    },
    {
      task: 'Calculate the number of seconds in 100 years using long and show why int is not enough.',
      hint: '100 * 365 * 24 * 60 * 60 = 3,153,600,000 which is greater than 2,147,483,647. Use 100L.',
      solution: j`public class Main {
    public static void main(String[] args) {
        long seconds = 100L * 365 * 24 * 60 * 60;
        int wrong = 100 * 365 * 24 * 60 * 60;
        System.out.println("Correct (long): " + seconds);
        System.out.println("Wrong (int overflow): " + wrong);
    }
}`,
    },
  ],
  quiz: [
    { question: 'What is the size of an int in Java?', options: ['2 bytes', '8 bytes', '4 bytes', 'Depends on OS'], answer: 2, explanation: 'int is always 32 bits (4 bytes) on every platform.' },
    { question: 'Which declaration is valid?', options: ['long n = 9000000000L;', 'float f = 2.5;', 'int x = 3.0;', 'boolean b = 1;'], answer: 0, explanation: 'The L suffix makes the literal a long. The others are type errors.' },
    { question: 'What is the default value of a boolean field?', options: ['true', 'null', '0', 'false'], answer: 3, explanation: 'boolean fields default to false.' },
    { question: 'What does 0x10 equal in decimal?', options: ['10', '16', '8', '2'], answer: 1, explanation: 'Hex 10 = 1 * 16 + 0 = 16.' },
    { question: 'Where can var be used?', options: ['Instance fields', 'Method parameters', 'Local variables with an initialiser', 'Return types'], answer: 2, explanation: 'var is only for local variables whose type can be inferred from the initialiser.' },
  ],
};
