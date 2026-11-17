const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        byte b = 100;
        short s = b;      // byte  -> short  (automatic)
        int i = s;        // short -> int
        long l = i;       // int   -> long
        float f = l;      // long  -> float
        double d = f;     // float -> double
        char c = 'A';
        int code = c;     // char  -> int

        System.out.println("byte b   = " + b);
        System.out.println("short s  = " + s);
        System.out.println("int i    = " + i);
        System.out.println("long l   = " + l);
        System.out.println("float f  = " + f);
        System.out.println("double d = " + d);
        System.out.println("char 'A' as int = " + code);
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        double price = 9.99;
        int rupees = (int) price;              // fraction is cut off

        double negative = -7.8;
        int truncated = (int) negative;        // towards zero

        int big = 130;
        byte small = (byte) big;               // out of byte range

        long huge = 3000000000L;
        int wrapped = (int) huge;              // out of int range

        double tooLarge = 1e10;
        int clamped = (int) tooLarge;          // double -> int clamps

        int ascii = 66;
        char letter = (char) ascii;

        System.out.println("(int) 9.99         = " + rupees);
        System.out.println("(int) -7.8         = " + truncated);
        System.out.println("(byte) 130         = " + small);
        System.out.println("(int) 3000000000L  = " + wrapped);
        System.out.println("(int) 1e10         = " + clamped);
        System.out.println("(char) 66          = " + letter);
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        byte a = 10;
        byte b = 20;
        // byte sum = a + b;   // ERROR: a + b is promoted to int
        int sum = a + b;
        System.out.println("byte + byte = " + sum);

        char ch = 'A';
        System.out.println("'A' + 2     = " + (ch + 2));

        System.out.println("7 / 2       = " + (7 / 2));
        System.out.println("7 / 2.0     = " + (7 / 2.0));
        System.out.println("(double) 7 / 2   = " + ((double) 7 / 2));
        System.out.println("(double) (7 / 2) = " + ((double) (7 / 2)));

        long l = 5L;
        float f = 2.5f;
        System.out.println("long + float = " + (l + f));

        int i = 3;
        double d = 1.5;
        System.out.println("int * double = " + (i * d));
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        byte b = 10;
        b += 5;               // allowed: compound assignment casts automatically
        // b = b + 5;         // ERROR: int cannot be stored in byte
        b = (byte) (b + 5);   // explicit cast works
        System.out.println("b = " + b);

        short s = 1;
        s++;                  // increment also casts automatically
        System.out.println("s = " + s);

        char ch = 'a';
        ch++;
        System.out.println("ch = " + ch);

        int x = 10;
        x *= 2.5;             // same as x = (int) (x * 2.5)
        System.out.println("x = " + x);

        final int SMALL = 100;
        byte fromConstant = SMALL;   // allowed: compile-time constant that fits
        System.out.println("fromConstant = " + fromConstant);
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        int totalMarks = 437;
        int subjects = 5;

        int wrongAverage = totalMarks / subjects;
        double correctAverage = (double) totalMarks / subjects;
        double percentage = totalMarks * 100.0 / 500;

        System.out.println("Integer average  : " + wrongAverage);
        System.out.println("Correct average  : " + correctAverage);
        System.out.println("Percentage       : " + percentage);

        long roundedPercent = Math.round(percentage);
        System.out.println("Rounded          : " + roundedPercent);
    }
}`;

export default {
  id: 'day-05-type-casting-promotion',
  title: 'Type Casting: Widening and Narrowing, Type Promotion',
  module: 'Module 1: Java Basics',
  day: 5,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Convert values from one primitive type to another safely. Learn automatic widening, explicit narrowing with its data-loss traps, and the type promotion rules Java applies inside expressions.',
  objectives: [
    'Explain the difference between widening (implicit) and narrowing (explicit) casting',
    'Predict results of narrowing such as (int) 9.99, (byte) 130 and (char) 66',
    'Apply type promotion rules for expressions with byte, short, char, int, long, float and double',
    'Avoid integer division mistakes when calculating averages and percentages',
    'Understand why compound assignment operators perform an automatic cast',
  ],
  theory: [
    {
      heading: 'What is Type Casting?',
      content: j`Type casting means converting a value of one data type into another.

Analogy: pouring water between glasses. Pouring from a small glass into a big jug (widening) never spills. Pouring from a big jug into a small glass (narrowing) may spill water - you lose data - so Java forces you to do it deliberately with a cast.

Two kinds for primitives:
1. Widening (implicit / automatic): smaller type -> larger type. Done by Java.
2. Narrowing (explicit / manual): larger type -> smaller type. You must write (type).

boolean cannot be cast to or from any other type.`,
    },
    {
      heading: 'Widening (Implicit) Casting',
      content: j`Java converts automatically when there is no risk of losing the magnitude of the value:

byte -> short -> int -> long -> float -> double
                  ^
          char ---+

- byte to short, int, long, float, double
- short to int, long, float, double
- char to int, long, float, double
- int to long, float, double
- long to float, double
- float to double

Notes:
- byte/short to char is NOT widening (char is unsigned), needs a cast.
- long (8 bytes) to float (4 bytes) is still widening because float has a much bigger range, but it can lose precision for very large values.`,
      syntax: j`int marks = 90;
double d = marks;   // 90.0, automatic`,
    },
    {
      heading: 'Narrowing (Explicit) Casting',
      content: j`From a larger type to a smaller one you must use the cast operator (targetType):

double d = 9.99;
int i = (int) d;   // 9

What happens to the value?
- Decimal to integer: the fractional part is truncated (cut off towards zero). (int) 9.99 = 9, (int) -7.8 = -7. It does NOT round.
- Integer to smaller integer: only the lower bits are kept, so the value wraps around. (byte) 130 = 130 - 256 = -126. (byte) 256 = 0.
- double/float to int or long: if the value is too large it is clamped to MAX_VALUE/MIN_VALUE; NaN becomes 0.
- int to char: the number becomes the Unicode character. (char) 65 = 'A'.`,
      tip: 'To round instead of truncate, use Math.round(9.99) which returns 10 (a long for double input).',
    },
    {
      heading: 'Type Promotion in Expressions',
      content: j`When Java evaluates an arithmetic expression, it promotes operands automatically:

Rule 1: byte, short and char are always promoted to int in arithmetic.
Rule 2: If any operand is long, the whole expression becomes long.
Rule 3: If any operand is float, it becomes float.
Rule 4: If any operand is double, it becomes double.

So the result type is the "largest" of: int, and the types of the operands.

byte a = 10, b = 20;
byte c = a + b;      // ERROR: a + b is int
int  c = a + b;      // OK

Integer division: int / int gives int (the decimal part is lost). 7 / 2 = 3, but 7 / 2.0 = 3.5.`,
      points: [
        'char + int -> int  (\'A\' + 1 = 66)',
        'int + long -> long',
        'long + float -> float',
        'int * double -> double',
        'String + anything -> String (concatenation)',
      ],
    },
    {
      heading: 'Special Cases: Compound Assignment and Constants',
      content: j`Compound operators (+=, -=, *=, /=, %=) and ++/-- include a hidden cast:

byte b = 10;
b += 5;       // OK, same as b = (byte)(b + 5)
b = b + 5;    // ERROR

int x = 10;
x *= 2.5;     // x = (int)(10 * 2.5) = 25

Compile-time constants: if the value is a constant that fits in the smaller type, Java allows it without a cast:
byte ok = 100;             // 100 is an int literal but fits in byte
final int K = 50; byte k = K;   // OK because K is final and fits
byte bad = 200;            // ERROR: does not fit`,
    },
    {
      heading: 'Common Mistakes',
      content: j`Real bugs caused by casting:`,
      points: [
        'Calculating average as total / count with ints -> loses decimals. Use (double) total / count',
        '(double) (total / count) casts AFTER integer division -> still loses decimals',
        'Expecting (int) 4.7 to be 5 -> it is 4; use Math.round',
        'Multiplying large ints before storing in long: long ms = 30 * 24 * 60 * 60 * 1000 overflows; write 30L * ...',
        'Casting a big int to byte/short and silently getting a negative number',
      ],
    },
  ],
  examples: [
    {
      title: 'Widening conversions chain',
      scenario: 'Move a value from byte all the way up to double without any cast.',
      steps: [
        'Create class Main in Eclipse or IntelliJ',
        'Assign each variable to the next bigger type without writing a cast',
        'Run and note how float and double print with .0',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `byte b   = 100
short s  = 100
int i    = 100
long l   = 100
float f  = 100.0
double d = 100.0
char 'A' as int = 65`,
      explanation: 'Every assignment is widening, so no cast is needed and no data is lost. Floating types print with a decimal point. The char A widens to its Unicode number 65.',
    },
    {
      title: 'Narrowing conversions and data loss',
      scenario: 'Force bigger values into smaller types and observe truncation, wrap-around and clamping.',
      steps: [
        'Write each narrowing conversion with an explicit cast',
        'Predict each output on paper before running',
        'Run and compare',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `(int) 9.99         = 9
(int) -7.8         = -7
(byte) 130         = -126
(int) 3000000000L  = -1294967296
(int) 1e10         = 2147483647
(char) 66          = B`,
      explanation: '9.99 -> 9 and -7.8 -> -7 (truncate towards zero). 130 does not fit in byte (max 127): 130 - 256 = -126. 3000000000 - 4294967296 (2^32) = -1294967296. A double too large for int is clamped to Integer.MAX_VALUE 2147483647. 66 is the code of B.',
    },
    {
      title: 'Type promotion in expressions',
      scenario: 'See which type each expression produces and how integer division behaves.',
      steps: [
        'Type the program; the commented line shows the compile error',
        'Notice the brackets around each expression inside println',
        'Run and compare (double) 7 / 2 with (double) (7 / 2)',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `byte + byte = 30
'A' + 2     = 67
7 / 2       = 3
7 / 2.0     = 3.5
(double) 7 / 2   = 3.5
(double) (7 / 2) = 3.0
long + float = 7.5
int * double = 4.5`,
      explanation: 'byte + byte becomes int. \'A\' (65) + 2 = 67 as int. 7 / 2 is integer division = 3. One double operand makes the whole division double = 3.5. In (double)(7 / 2) the division happens first (3) and then 3 becomes 3.0. long + float is float 7.5. 3 * 1.5 = 4.5 double.',
    },
    {
      title: 'Hidden casts in compound assignment',
      scenario: 'Understand why b += 5 compiles but b = b + 5 does not.',
      steps: [
        'Type the code and try un-commenting b = b + 5 to see the error',
        'Run the program',
        'Trace each variable step by step',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `b = 20
s = 2
ch = b
x = 25
fromConstant = 100`,
      explanation: 'b: 10 + 5 = 15, then (byte)(15 + 5) = 20. s++ gives 2. ch++ moves \'a\' (97) to \'b\' (98). x *= 2.5 is x = (int)(10 * 2.5) = 25. SMALL is a final constant 100 that fits in a byte, so no cast is needed.',
    },
    {
      title: 'Real-world: average and percentage of marks',
      scenario: 'A student scored 437 out of 500 in 5 subjects. Calculate the average and percentage correctly.',
      steps: [
        'Store total and subjects as int',
        'Compute average once with int division and once with a cast',
        'Compute percentage using 100.0 to force double arithmetic, then round it',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Integer average  : 87
Correct average  : 87.4
Percentage       : 87.4
Rounded          : 87`,
      explanation: '437 / 5 with ints = 87 (0.4 lost). (double) 437 / 5 = 87.4. 437 * 100.0 = 43700.0, divided by 500 = 87.4. Math.round(87.4) = 87 and returns a long.',
    },
  ],
  interview: [
    { q: 'What is the difference between widening and narrowing casting?', a: 'Widening converts a smaller type to a larger type automatically without data loss. Narrowing converts a larger type to a smaller type, requires an explicit cast and may lose data.', level: 'Easy' },
    { q: 'What is the output: System.out.println((int) 3.99);', a: '3. Casting truncates the decimal part; it does not round.', level: 'Easy' },
    { q: 'What is the output: System.out.println((byte) 200);', a: '-56. 200 - 256 = -56 because byte range is -128 to 127.', level: 'Medium' },
    { q: 'Why does byte c = a + b; fail when a and b are bytes?', a: 'Arithmetic on byte, short and char promotes the operands to int, so the result is int which cannot be assigned to byte without a cast.', level: 'Medium' },
    { q: 'Why does b += 1 work for a byte b?', a: 'Compound assignment operators include an implicit narrowing cast: b += 1 is equivalent to b = (byte)(b + 1).', level: 'Medium' },
    { q: 'What is the output: System.out.println(10 / 4);  and 10 / 4.0 ?', a: '2 and 2.5. int / int is integer division; one double operand makes it floating-point division.', level: 'Easy' },
    { q: 'Can boolean be cast to int?', a: 'No. boolean is not compatible with any numeric type in Java, unlike C.', level: 'Easy' },
    { q: 'Is long to float widening? Can it lose information?', a: 'Yes, it is widening because float has a larger range, but it can lose precision because float has only about 7 significant digits.', level: 'Hard' },
    { q: 'What is the output: char c = \'A\'; c = c + 1;', a: 'Compile error: c + 1 is int. Use c++ or c += 1 or (char)(c + 1).', level: 'Medium' },
    { q: 'What is the output: System.out.println(\'a\' + \'b\');', a: '195. Both chars are promoted to int: 97 + 98 = 195.', level: 'Medium' },
    { q: 'What does (int) Double.NaN return?', a: '0. NaN cast to int is 0; infinite or too large values are clamped to Integer.MAX_VALUE or MIN_VALUE.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Convert a temperature of 98.6 Fahrenheit to Celsius and print both the exact double value and the int value.',
      hint: 'C = (F - 32) * 5 / 9. Cast the result to int for the whole number.',
      solution: j`public class Main {
    public static void main(String[] args) {
        double f = 98.6;
        double c = (f - 32) * 5 / 9;
        System.out.println("Celsius (double): " + c);
        System.out.println("Celsius (int): " + (int) c);
    }
}`,
    },
    {
      task: 'Print the character that comes 5 positions after \'J\' and its Unicode value.',
      hint: 'Add 5 to the char (gives int), then cast back to char.',
      solution: j`public class Main {
    public static void main(String[] args) {
        char start = 'J';
        int code = start + 5;
        char result = (char) code;
        System.out.println(result + " = " + code);
    }
}`,
    },
    {
      task: 'Split a bill of 1000 rupees among 3 friends. Print the int share, the double share and the remaining paise lost by int division.',
      hint: 'Use 1000 / 3, (double) 1000 / 3 and 1000 % 3.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int bill = 1000;
        int friends = 3;
        System.out.println("Int share: " + bill / friends);
        System.out.println("Double share: " + (double) bill / friends);
        System.out.println("Leftover rupees: " + bill % friends);
    }
}`,
    },
    {
      task: 'Calculate milliseconds in 30 days, first wrongly with int and then correctly with long.',
      hint: '30 * 24 * 60 * 60 * 1000 exceeds int range. Start with 30L.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int wrong = 30 * 24 * 60 * 60 * 1000;
        long right = 30L * 24 * 60 * 60 * 1000;
        System.out.println("int : " + wrong);
        System.out.println("long: " + right);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which conversion is automatic (widening)?', options: ['double to int', 'int to double', 'long to int', 'int to byte'], answer: 1, explanation: 'int to double goes from smaller to larger, so it is automatic.' },
    { question: 'What is (int) 7.9?', options: ['8', '7.9', 'Compile error', '7'], answer: 3, explanation: 'Casting truncates the fractional part.' },
    { question: 'What type is the result of byte + short?', options: ['int', 'byte', 'short', 'long'], answer: 0, explanation: 'byte, short and char are promoted to int in arithmetic.' },
    { question: 'What does System.out.println(5 / 2 * 2.0); print?', options: ['5.0', '4', '4.0', '5'], answer: 2, explanation: '5 / 2 = 2 (int division), then 2 * 2.0 = 4.0.' },
    { question: 'Which line compiles?', options: ['byte b = 128;', 'byte b = 10; b = b * 2;', 'float f = 1.2;', 'byte b = 10; b *= 2;'], answer: 3, explanation: 'Compound assignment includes an implicit cast. The other lines are type errors.' },
  ],
};
