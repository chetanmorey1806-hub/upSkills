const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        int a = 17;
        int b = 5;
        System.out.println("a + b  = " + (a + b));
        System.out.println("a - b  = " + (a - b));
        System.out.println("a * b  = " + (a * b));
        System.out.println("a / b  = " + (a / b));
        System.out.println("a % b  = " + (a % b));
        System.out.println("-17 % 5  = " + (-17 % 5));
        System.out.println("17.5 % 5 = " + (17.5 % 5));
        System.out.println("Sum: " + 2 + 3);
        System.out.println("Sum: " + (2 + 3));
        System.out.println(2 + 3 + " is the sum");
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        int age = 20;
        boolean hasId = true;

        System.out.println("age >= 18 : " + (age >= 18));
        System.out.println("age == 20 : " + (age == 20));
        System.out.println("age != 20 : " + (age != 20));
        System.out.println("Can vote  : " + (age >= 18 && hasId));
        System.out.println("Blocked   : " + (age < 18 || !hasId));

        int x = 5;
        boolean r1 = (x > 10) && (++x > 5);   // short-circuit: right side skipped
        System.out.println("r1 = " + r1 + ", x = " + x);

        boolean r2 = (x > 10) & (++x > 5);    // non-short-circuit: both sides run
        System.out.println("r2 = " + r2 + ", x = " + x);
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        int a = 5;
        int b = a++;        // use then increment
        int c = ++a;        // increment then use
        System.out.println("a = " + a + ", b = " + b + ", c = " + c);

        int d = a-- + --a;  // 7 + 5
        System.out.println("a = " + a + ", d = " + d);

        int e = 10;
        e = e++ + ++e;      // 10 + 12
        System.out.println("e = " + e);

        int f = 5;
        f = f++;            // classic trap
        System.out.println("f = " + f);

        boolean flag = true;
        System.out.println("!flag = " + !flag + ", -a = " + (-a));
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        int marks = 72;
        String result = marks >= 40 ? "Pass" : "Fail";
        String grade = marks >= 90 ? "A" : marks >= 75 ? "B" : marks >= 60 ? "C" : "D";
        System.out.println("Result: " + result + ", Grade: " + grade);

        int p = 12, q = 45, r = 30;
        int max = (p > q) ? (p > r ? p : r) : (q > r ? q : r);
        System.out.println("Max of 12, 45, 30 = " + max);

        int n = 10;
        n += 5;  System.out.println("n += 5  -> " + n);
        n -= 3;  System.out.println("n -= 3  -> " + n);
        n *= 2;  System.out.println("n *= 2  -> " + n);
        n /= 5;  System.out.println("n /= 5  -> " + n);
        n %= 3;  System.out.println("n %= 3  -> " + n);
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        int a = 12;   // 1100
        int b = 10;   // 1010
        System.out.println("a in binary = " + Integer.toBinaryString(a));
        System.out.println("b in binary = " + Integer.toBinaryString(b));
        System.out.println("a & b   = " + (a & b));
        System.out.println("a | b   = " + (a | b));
        System.out.println("a ^ b   = " + (a ^ b));
        System.out.println("~a      = " + (~a));
        System.out.println("a << 2  = " + (a << 2));
        System.out.println("a >> 2  = " + (a >> 2));
        System.out.println("-16 >> 2   = " + (-16 >> 2));
        System.out.println("-16 >>> 28 = " + (-16 >>> 28));

        int num = 7;
        System.out.println(num + " is " + ((num & 1) == 0 ? "even" : "odd"));

        int x = 3, y = 7;
        x = x ^ y;
        y = x ^ y;
        x = x ^ y;
        System.out.println("After XOR swap: x = " + x + ", y = " + y);
    }
}`;

export default {
  id: 'day-06-operators',
  title: 'Operators: Arithmetic, Relational, Logical, Assignment, Unary, Ternary, Bitwise',
  module: 'Module 1: Java Basics',
  day: 6,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Master every operator family in Java, including the tricky pre/post increment, short-circuit logic, the ternary operator, bitwise shifts and operator precedence that interviewers love to test.',
  objectives: [
    'Use arithmetic operators and understand integer division and the % (modulus) operator',
    'Combine conditions with relational and logical operators and explain short-circuit evaluation',
    'Predict the output of pre-increment and post-increment expressions',
    'Write compact decisions using the ternary operator and assignment shortcuts',
    'Apply bitwise and shift operators and follow operator precedence',
  ],
  theory: [
    {
      heading: 'Arithmetic Operators',
      content: j`+  addition (also String concatenation)
-  subtraction
*  multiplication
/  division (int / int gives int, decimal part dropped)
%  modulus: the REMAINDER after division

Modulus tricks used everywhere:
- n % 2 == 0 -> even number
- n % 10 -> last digit of n (1234 % 10 = 4)
- n / 10 -> remove last digit (1234 / 10 = 123)
- The sign of a % b follows the left operand: -17 % 5 = -2, 17 % -5 = 2
- % works on doubles too: 17.5 % 5 = 2.5

Division by zero: 10 / 0 throws ArithmeticException, but 10.0 / 0 gives Infinity and 0.0 / 0 gives NaN.

String concatenation evaluates left to right: "Sum: " + 2 + 3 gives "Sum: 23", but 2 + 3 + " sum" gives "5 sum".`,
    },
    {
      heading: 'Relational and Logical Operators',
      content: j`Relational (comparison) operators return a boolean:
==  equal to         !=  not equal to
>   greater than     <   less than
>=  greater or equal <=  less or equal

Logical operators combine booleans:
&&  logical AND: true only if both are true
||  logical OR : true if at least one is true
!   logical NOT: reverses the value

Truth table:
A      B      A && B   A || B   !A
true   true   true     true     false
true   false  false    true     false
false  true   false    true     true
false  false  false    false    true

Short-circuit: && stops if the left side is false; || stops if the left side is true. The right side is NOT evaluated. This is used for safe checks:
if (name != null && name.length() > 3)   // no NullPointerException

& and | on booleans are non-short-circuit: both sides always run.`,
      tip: 'Use == only for primitives. To compare Strings by content use equals() (Day 13).',
    },
    {
      heading: 'Unary Operators: ++, --, +, -, !',
      content: j`++ increases by 1, -- decreases by 1.

Pre-increment  ++x : increment FIRST, then use the new value.
Post-increment x++ : use the CURRENT value first, then increment.

int a = 5;
int b = a++;   // b = 5, a = 6
int c = ++a;   // a = 7, c = 7

Analogy: post-increment is "pay with the old note, then get the change"; pre-increment is "update your wallet first, then pay".

Trap: x = x++; leaves x unchanged. The old value is saved, x is incremented, then the saved old value is assigned back to x.

Unary minus negates: -a. Logical NOT: !true is false.`,
    },
    {
      heading: 'Assignment and Ternary Operators',
      content: j`Assignment: = stores the right-hand value in the left variable.
Compound assignment: +=, -=, *=, /=, %=, &=, |=, ^=, <<=, >>=, >>>=
x += 5 means x = x + 5 (with an automatic cast to the type of x).

Ternary (conditional) operator: the only operator with three operands.
condition ? valueIfTrue : valueIfFalse

String status = age >= 18 ? "Adult" : "Minor";

It is a compact if-else that RETURNS a value. Ternaries can be nested, but more than two levels hurt readability.`,
      syntax: j`variable = (condition) ? expression1 : expression2;`,
    },
    {
      heading: 'Bitwise and Shift Operators',
      content: j`These work on the individual bits (0/1) of int and long values.

&   AND : 1 if both bits are 1           12 & 10 -> 1100 & 1010 = 1000 = 8
|   OR  : 1 if any bit is 1              12 | 10 -> 1110 = 14
^   XOR : 1 if bits are different        12 ^ 10 -> 0110 = 6
~   NOT : flips every bit                ~12 = -13   (formula: ~n = -(n + 1))
<<  left shift : multiply by 2 per shift       12 << 2 = 48
>>  signed right shift: divide by 2, keeps sign 12 >> 2 = 3, -16 >> 2 = -4
>>> unsigned right shift: fills with 0           -16 >>> 28 = 15

Uses: permissions/flags, fast even-odd check (n & 1), swapping without a temp variable, hashing (HashMap uses ^ and >>>).`,
    },
    {
      heading: 'Operator Precedence and Associativity',
      content: j`When an expression has many operators, precedence decides the order (highest first):

1. Postfix          x++  x--
2. Unary            ++x  --x  +  -  !  ~  (cast)
3. Multiplicative   *  /  %
4. Additive         +  -
5. Shift            <<  >>  >>>
6. Relational       <  >  <=  >=  instanceof
7. Equality         ==  !=
8. Bitwise AND      &
9. Bitwise XOR      ^
10. Bitwise OR      |
11. Logical AND     &&
12. Logical OR      ||
13. Ternary         ? :
14. Assignment      =  +=  -=  ...

Associativity: most operators are left-to-right; assignment and ternary are right-to-left (a = b = c = 5 sets all to 5).

Example: 10 + 5 * 2 = 20 (not 30). When in doubt, use brackets - they make the code clearer for everyone.`,
    },
  ],
  examples: [
    {
      title: 'Arithmetic operators and String concatenation',
      scenario: 'Perform basic arithmetic and see how + behaves differently with Strings.',
      steps: [
        'Create class Main in your IDE',
        'Print each arithmetic result in brackets so it is calculated before concatenation',
        'Run and compare the last three lines carefully',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `a + b  = 22
a - b  = 12
a * b  = 85
a / b  = 3
a % b  = 2
-17 % 5  = -2
17.5 % 5 = 2.5
Sum: 23
Sum: 5
5 is the sum`,
      explanation: '17 / 5 = 3 with remainder 2. The sign of % follows the left operand, so -17 % 5 = -2. "Sum: " + 2 makes a String, then + 3 appends "3" -> "Sum: 23". Brackets force 2 + 3 = 5 first. In 2 + 3 + " is the sum", the numbers are added first (left to right) because no String has appeared yet.',
    },
    {
      title: 'Relational, logical and short-circuit evaluation',
      scenario: 'Check voting eligibility and prove that && skips the right side when the left side is false.',
      steps: [
        'Type the program',
        'Before running, predict the value of x after each line',
        'Run and check whether ++x executed',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `age >= 18 : true
age == 20 : true
age != 20 : false
Can vote  : true
Blocked   : false
r1 = false, x = 5
r2 = false, x = 6`,
      explanation: 'With &&, x > 10 is false so the right side (++x) is never evaluated: x stays 5. With a single &, both sides always run: ++x makes x 6, but the result is still false because the left side is false.',
    },
    {
      title: 'Pre and post increment puzzles',
      scenario: 'Trace the most common interview increment questions step by step.',
      steps: [
        'Type the program and write your predictions as comments',
        'Trace: b = a++ (b=5, a=6); c = ++a (a=7, c=7)',
        'Run and verify each line',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `a = 7, b = 5, c = 7
a = 5, d = 12
e = 22
f = 5
!flag = false, -a = -5`,
      explanation: 'd = a-- + --a: a-- gives 7 (a becomes 6), --a makes a 5 and gives 5, so d = 12 and a = 5. e = e++ + ++e: e++ gives 10 (e becomes 11), ++e makes 12, so e = 22. f = f++ saves 5, increments f to 6, then assigns the saved 5 back, so f stays 5.',
    },
    {
      title: 'Ternary operator and compound assignment',
      scenario: 'Decide pass/fail and grade in one line each, find the max of three numbers and apply assignment shortcuts.',
      steps: [
        'Write the ternary expressions',
        'Use nested ternary for the maximum of three numbers',
        'Apply each compound assignment one by one and run',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Result: Pass, Grade: C
Max of 12, 45, 30 = 45
n += 5  -> 15
n -= 3  -> 12
n *= 2  -> 24
n /= 5  -> 4
n %= 3  -> 1`,
      explanation: '72 >= 40 so Pass; 72 is not >= 90 or >= 75 but is >= 60, so C. p > q is false so we check q > r: 45 > 30 gives 45. n: 10+5=15, 15-3=12, 12*2=24, 24/5=4 (int division), 4%3=1.',
    },
    {
      title: 'Bitwise operators, even/odd and XOR swap',
      scenario: 'Work at the bit level: AND, OR, XOR, NOT, shifts, a fast odd/even check and swapping without a third variable.',
      steps: [
        'Type the program',
        'Write 12 and 10 in binary on paper (1100 and 1010) and compute each result',
        'Run and compare',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `a in binary = 1100
b in binary = 1010
a & b   = 8
a | b   = 14
a ^ b   = 6
~a      = -13
a << 2  = 48
a >> 2  = 3
-16 >> 2   = -4
-16 >>> 28 = 15
7 is odd
After XOR swap: x = 7, y = 3`,
      explanation: '1100 & 1010 = 1000 (8); | = 1110 (14); ^ = 0110 (6). ~12 = -(12 + 1) = -13. 12 << 2 = 12 * 4 = 48; 12 >> 2 = 12 / 4 = 3. -16 >> 2 keeps the sign: -4. -16 is 0xFFFFFFF0; shifting right 28 places with zeros leaves 1111 = 15. 7 & 1 = 1 so it is odd. The three XORs swap 3 and 7.',
    },
  ],
  interview: [
    { q: 'Difference between && and &?', a: '&& is the logical short-circuit AND: the right operand is evaluated only if the left is true. & evaluates both sides always, and on integers it is the bitwise AND.', level: 'Easy' },
    { q: 'What is the output: int x = 5; x = x++ + ++x; System.out.println(x);', a: '12. x++ gives 5 (x becomes 6), ++x makes 7 and gives 7, 5 + 7 = 12.', level: 'Medium' },
    { q: 'What is the output: int i = 10; i = i++; System.out.println(i);', a: '10. The old value is saved, i is incremented, then the saved value 10 is assigned back.', level: 'Medium' },
    { q: 'What is the output: System.out.println(1 + 2 + "3" + 4 + 5);', a: '3345. 1 + 2 = 3, then "3" + "3" = "33", then "334", then "3345".', level: 'Medium' },
    { q: 'What is the output: System.out.println(10 / 0); and 10.0 / 0 ?', a: 'The first throws ArithmeticException: / by zero. The second prints Infinity.', level: 'Medium' },
    { q: 'Difference between >> and >>>?', a: '>> is signed right shift and fills with the sign bit (keeps negative numbers negative). >>> is unsigned right shift and always fills with 0.', level: 'Hard' },
    { q: 'What is the ternary operator?', a: 'condition ? a : b. It returns a if the condition is true, else b. It is a compact if-else expression.', level: 'Easy' },
    { q: 'What is the output: System.out.println(~5);', a: '-6. ~n equals -(n + 1).', level: 'Medium' },
    { q: 'What is the output: System.out.println(-7 % 3); and 7 % -3 ?', a: '-1 and 1. The sign of the result follows the dividend (left operand).', level: 'Medium' },
    { q: 'How do you check if a number is a power of 2 using bitwise operators?', a: 'n > 0 && (n & (n - 1)) == 0. A power of two has exactly one 1-bit; n - 1 flips it and all lower bits.', level: 'Hard' },
    { q: 'What is the result of 10 + 5 * 2 - 8 / 4?', a: '18. 5 * 2 = 10 and 8 / 4 = 2 first, then 10 + 10 - 2 = 18.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Given a 4-digit number 4729, print the sum of its digits using / and % only (no loops).',
      hint: 'last digit = n % 10, remove it with n / 10.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int n = 4729;
        int d4 = n % 10;
        int d3 = (n / 10) % 10;
        int d2 = (n / 100) % 10;
        int d1 = n / 1000;
        System.out.println("Sum of digits = " + (d1 + d2 + d3 + d4));
    }
}`,
    },
    {
      task: 'Check whether a year is a leap year using a single boolean expression.',
      hint: 'Leap if divisible by 400, or divisible by 4 but not by 100.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int year = 2024;
        boolean leap = (year % 400 == 0) || (year % 4 == 0 && year % 100 != 0);
        System.out.println(year + " leap year? " + leap);
    }
}`,
    },
    {
      task: 'Find the largest of three numbers using the ternary operator.',
      hint: 'Nest one ternary inside another.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int a = 25, b = 78, c = 41;
        int largest = a > b ? (a > c ? a : c) : (b > c ? b : c);
        System.out.println("Largest = " + largest);
    }
}`,
    },
    {
      task: 'Swap two numbers without a third variable using arithmetic (+ and -).',
      hint: 'a = a + b; b = a - b; a = a - b;',
      solution: j`public class Main {
    public static void main(String[] args) {
        int a = 15, b = 40;
        a = a + b;
        b = a - b;
        a = a - b;
        System.out.println("a = " + a + ", b = " + b);
    }
}`,
    },
    {
      task: 'Check if 64 and 48 are powers of 2 using the bitwise trick.',
      hint: '(n & (n - 1)) == 0 for n > 0.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[] nums = {64, 48};
        for (int n : nums) {
            boolean power = n > 0 && (n & (n - 1)) == 0;
            System.out.println(n + " is power of 2? " + power);
        }
    }
}`,
    },
  ],
  quiz: [
    { question: 'What is 25 % 7?', options: ['3', '4', '3.57', '18'], answer: 1, explanation: '25 = 7 * 3 + 4, so the remainder is 4.' },
    { question: 'int a = 3; int b = a++ * 2; What are a and b?', options: ['a=4, b=8', 'a=3, b=6', 'a=4, b=6', 'a=3, b=8'], answer: 2, explanation: 'a++ gives 3 for the multiplication (b = 6) and then a becomes 4.' },
    { question: 'Which operator does NOT evaluate its right side when the left side is true?', options: ['&&', '|', '&', '||'], answer: 3, explanation: '|| short-circuits: if the left is true the result is already true.' },
    { question: 'What is 5 << 3?', options: ['40', '15', '8', '2'], answer: 0, explanation: 'Each left shift multiplies by 2: 5 * 2 * 2 * 2 = 40.' },
    { question: 'What does System.out.println("A" + 1 + 2); print?', options: ['A3', 'A12', '3A', 'Compile error'], answer: 1, explanation: 'Left to right: "A" + 1 = "A1", then "A1" + 2 = "A12".' },
  ],
};
