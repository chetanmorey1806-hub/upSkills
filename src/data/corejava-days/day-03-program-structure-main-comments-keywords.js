const j = String.raw;

const ex1 = j`import java.util.Arrays;   // 2. import statement

/**
 * 3. Documentation comment: describes the class.
 * Main shows every part of a Java program.
 */
public class Main {
    // 4. field (class-level variable)
    static String courseName = "Core Java";

    /* 5. main method:
       the entry point called by the JVM */
    public static void main(String[] args) {
        int[] marks = {72, 95, 60};          // local variable
        Arrays.sort(marks);                  // using the imported class
        System.out.println("Course: " + courseName);
        System.out.println("Sorted marks: " + Arrays.toString(marks));
        printFooter();                       // calling another method
    }

    // 6. another method
    static void printFooter() {
        System.out.println("End of program");
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        System.out.println("JVM called main(String[] args)");
        main(5);
        main("Java", "Rocks");
    }

    public static void main(int x) {
        System.out.println("Overloaded main with int: " + x);
    }

    public static void main(String a, String b) {
        System.out.println("Overloaded main with two Strings: " + a + " " + b);
    }
}`;

const ex3 = j`class BankAccount {                       // class: PascalCase
    String accountHolder;                   // variable: camelCase
    double balance;

    double calculateInterest(double rate) { // method: camelCase verb
        return balance * rate / 100;
    }
}

public class Main {
    static final double INTEREST_RATE = 7.5; // constant: UPPER_SNAKE_CASE

    public static void main(String[] args) {
        BankAccount myAccount = new BankAccount();
        myAccount.accountHolder = "Anita";
        myAccount.balance = 20000;
        double interest = myAccount.calculateInterest(INTEREST_RATE);
        System.out.println(myAccount.accountHolder + " earns " + interest);
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        int _count = 3;          // valid: starts with underscore
        int $price = 99;         // valid: starts with dollar
        int total2 = _count * $price; // valid: digit not at start
        boolean isValid = true;  // true is a literal, not an identifier
        final char GRADE = 'A';  // final is a keyword

        // int 2total = 5;   // INVALID: starts with a digit
        // int class = 10;   // INVALID: class is a keyword
        // int my-var = 1;   // INVALID: hyphen not allowed

        System.out.println("_count = " + _count);
        System.out.println("$price = " + $price);
        System.out.println("total2 = " + total2);
        System.out.println("isValid = " + isValid + ", GRADE = " + GRADE);
    }
}`;

export default {
  id: 'day-03-program-structure-main-comments-keywords',
  title: 'Structure of a Java Program, main() Method, Comments, Naming Conventions, Keywords',
  module: 'Module 1: Java Basics',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn the building blocks of every Java source file, what each word of public static void main(String[] args) means, how to write comments, the naming conventions followed in industry, and the reserved keywords of Java.',
  objectives: [
    'Identify each part of a Java source file in the correct order',
    'Explain every keyword in the main method signature and its valid variations',
    'Write single-line, multi-line and documentation comments',
    'Follow standard Java naming conventions for classes, methods, variables, constants and packages',
    'Recognise Java keywords and the rules for valid identifiers',
  ],
  theory: [
    {
      heading: 'Structure of a Java Source File',
      content: j`A Java file follows a fixed order, like a formal letter that has an address, date, subject and body in a fixed sequence:

1. package statement (optional, at most one, must be the first statement)
2. import statements (optional, zero or more)
3. class / interface / enum / record declarations
   - fields (variables)
   - constructors
   - methods (including main)

package com.company.app;          // 1
import java.util.Scanner;         // 2
public class Main {               // 3
    int count;                    //   field
    Main() { }                    //   constructor
    public static void main(String[] args) { }   // method
}

Rules:
- Only ONE public class per file, and the file name must be that class name + .java.
- A file can contain many non-public classes; each produces its own .class file.
- Every statement ends with a semicolon ; and blocks are wrapped in braces { }.
- Java is case-sensitive: Main and main are different.`,
    },
    {
      heading: 'The main() Method Explained Word by Word',
      content: j`public static void main(String[] args)

- public: access modifier. The JVM is outside your class, so main must be visible to everyone.
- static: the JVM calls main WITHOUT creating an object of the class (no object exists yet when the program starts).
- void: main returns nothing to the JVM. (To return an exit code, use System.exit(code).)
- main: the exact name the JVM searches for. It is not a keyword, just a fixed method name.
- String[] args: an array of command-line arguments. Empty array (length 0) when nothing is passed.

Valid variations:
- static public void main(String[] args)      (modifier order can change)
- public static void main(String args[])      (C-style array)
- public static void main(String... args)     (varargs)
- public static final void main(String[] args)
- Any parameter name: main(String[] x)

Invalid as entry point: missing static, return type int, main(String args), private main.

main can be overloaded, but the JVM only calls the one with a single String[] parameter.
Java 21+ (preview) / Java 25 also allows simpler "instance main methods" like void main() for learning, but interviews and real projects use the classic signature.`,
      tip: 'Interview favourite: "Why is main static?" Because the JVM must call it before any object exists; static methods belong to the class, not to an object.',
    },
    {
      heading: 'Comments in Java',
      content: j`Comments are notes for humans. The compiler completely ignores them. Like sticky notes on a textbook, they explain WHY the code does something.

1. Single-line comment: starts with // and runs till the end of the line.
2. Multi-line comment: starts with /* and ends with */.
3. Documentation (Javadoc) comment: starts with /** and ends with */. The javadoc tool converts these into HTML API documentation. Tags: @param, @return, @throws, @author, @since.`,
      syntax: j`// single-line comment

/* multi-line
   comment */

/**
 * Adds two numbers.
 * @param a first number
 * @param b second number
 * @return the sum
 */
int add(int a, int b) { return a + b; }`,
      points: [
        'Multi-line comments cannot be nested: /* outer /* inner */ still open */ is an error',
        'Use comments to explain intent, not to repeat obvious code',
        'Generate docs with: javadoc -d docs Main.java',
      ],
    },
    {
      heading: 'Java Naming Conventions',
      content: j`Naming conventions are not enforced by the compiler, but every company follows them. Good names make code read like a story.`,
      points: [
        'Class / Interface / Enum / Record: PascalCase noun -> Student, BankAccount, Runnable, OrderStatus',
        'Method: camelCase verb -> getName(), calculateTotal(), isEmpty()',
        'Variable: camelCase meaningful noun -> firstName, totalMarks, isActive',
        'Constant (static final): UPPER_SNAKE_CASE -> MAX_SIZE, PI, INTEREST_RATE',
        'Package: all lowercase, reverse domain -> com.google.maps, in.company.payroll',
        'Boolean variables/methods often start with is/has/can -> isValid, hasPermission',
        'Avoid single letters except loop counters (i, j, k)',
      ],
      tip: 'Camel case looks like the humps of a camel: calculateMonthlySalary. Pascal case is camel case with the first letter capital: MonthlySalary.',
    },
    {
      heading: 'Keywords and Identifiers',
      content: j`Keywords are reserved words with special meaning to the compiler. You cannot use them as names. Java has about 50 reserved keywords (all lowercase):

Data types : byte short int long float double char boolean void
Control    : if else switch case default for while do break continue return
OOP        : class interface enum extends implements new this super instanceof
Modifiers  : public private protected static final abstract synchronized volatile transient native strictfp
Exceptions : try catch finally throw throws assert
Others     : package import
Unused     : goto const (reserved but not used)

Literals (not keywords but also reserved): true, false, null
Contextual keywords (only special in certain places): var, record, sealed, permits, yield, non-sealed, module, exports, requires

Identifier rules (names for classes, variables, methods):
- Can contain letters, digits, underscore _ and dollar $
- Cannot start with a digit
- Cannot be a keyword or true/false/null
- Case-sensitive; no spaces or special characters like - @ #
- A single underscore _ alone is not allowed (keyword since Java 9)`,
      points: [
        'Valid: name, _temp, $amount, total2, StudentRecord',
        'Invalid: 2total, my-name, class, first name, @value',
      ],
    },
    {
      heading: 'Statements, Blocks and Whitespace',
      content: j`- A statement is one complete instruction ending with a semicolon: int x = 10;
- A block is a group of statements inside { }. Classes, methods, if and loops use blocks.
- Variables declared inside a block exist only inside that block (scope).
- Extra spaces, tabs and new lines are ignored by the compiler, so indent code neatly (4 spaces) for readability.
- Strings must be on one line (or use text blocks """ ... """ from Java 15).`,
    },
  ],
  examples: [
    {
      title: 'Anatomy of a complete Java program',
      scenario: 'See import, class, field, comments, main and another method together in one runnable file.',
      steps: [
        'IntelliJ: right-click src > New > Java Class > Main; Eclipse: right-click src > New > Class > Main',
        'Type the code, noticing the numbered comments for each part',
        'Run the program (Shift + F10 in IntelliJ, Ctrl + F11 in Eclipse)',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Course: Core Java
Sorted marks: [60, 72, 95]
End of program`,
      explanation: 'The import lets us write Arrays instead of java.util.Arrays. Arrays.sort arranges {72, 95, 60} into {60, 72, 95}; Arrays.toString prints it with brackets. main calls printFooter, which is static so it can be called directly. All comments are ignored by the compiler.',
    },
    {
      title: 'Overloading the main method',
      scenario: 'Prove that main can be overloaded but the JVM always starts from main(String[] args).',
      steps: [
        'Create class Main with three methods named main having different parameters',
        'Call the overloaded versions from the real main',
        'Run and observe the order of output',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `JVM called main(String[] args)
Overloaded main with int: 5
Overloaded main with two Strings: Java Rocks`,
      explanation: 'The JVM looks only for main(String[] args). The other two are ordinary overloaded methods that run only because we call them explicitly. Overloading = same name, different parameter list.',
    },
    {
      title: 'Naming conventions in a real class',
      scenario: 'A bank calculates yearly interest. Use proper class, method, variable and constant names.',
      steps: [
        'Write class BankAccount (PascalCase) with fields in camelCase',
        'Add a constant INTEREST_RATE using static final',
        'Call calculateInterest from main and print the result',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Anita earns 1500.0`,
      explanation: 'interest = 20000 * 7.5 / 100 = 150000.0 / 100 = 1500.0. Because balance is a double, the result is a double and prints with .0. Names immediately tell the reader what each item is: a class, a method, a variable or a constant.',
    },
    {
      title: 'Valid and invalid identifiers',
      scenario: 'Check which names the compiler accepts. Invalid lines are commented out so the program compiles.',
      steps: [
        'Type the program in Main.java',
        'Try un-commenting one invalid line at a time and see the compile error in the IDE (red underline)',
        'Comment it again and run',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `_count = 3
$price = 99
total2 = 297
isValid = true, GRADE = A`,
      explanation: 'Identifiers may start with a letter, _ or $, and may contain digits after the first character. total2 = 3 * 99 = 297. 2total, class and my-var break the identifier rules.',
    },
  ],
  interview: [
    { q: 'Why is the main method static?', a: 'So the JVM can call it without creating an object of the class. At startup no object exists yet.', level: 'Easy' },
    { q: 'Can we overload the main method?', a: 'Yes. You can have many methods named main with different parameters, but the JVM only invokes public static void main(String[] args) as the entry point.', level: 'Medium' },
    { q: 'Can we write static public void main(String[] args)?', a: 'Yes. The order of modifiers does not matter.', level: 'Easy' },
    { q: 'What happens if we write public void main(String[] args) without static?', a: 'It compiles, but on Java 17 running it gives "Error: Main method is not static in class Main". (Newer Java versions with instance main methods may launch it by creating an object.)', level: 'Medium' },
    { q: 'Is main a keyword in Java?', a: 'No. main is just a method name the JVM looks for. You can even name a variable main.', level: 'Medium' },
    { q: 'How many public classes can a Java file have?', a: 'At most one top-level public class, and the file name must match it.', level: 'Easy' },
    { q: 'What are the types of comments in Java?', a: 'Single-line //, multi-line /* */ and documentation /** */ comments used by javadoc.', level: 'Easy' },
    { q: 'Are true, false and null keywords?', a: 'They are reserved literals, not keywords technically, but you still cannot use them as identifiers.', level: 'Medium' },
    { q: 'Are goto and const used in Java?', a: 'No. They are reserved keywords but have no functionality, so they cannot be used as identifiers.', level: 'Medium' },
    { q: 'Is an empty .java file valid? What about a file with no main?', a: 'An empty file compiles (no class files produced). A class without main compiles fine; it just cannot be launched directly with java.', level: 'Hard' },
    { q: 'What is the output: int $ = 5; int _a = $ * 2; System.out.println(_a);', a: '10. $ and _a are valid identifiers.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Write a program with all three types of comments that prints "Comments are ignored".',
      hint: 'Add a /** */ comment above the class, /* */ above main and // inside main.',
      solution: j`/**
 * Demo class for comments.
 */
public class Main {
    /* entry point */
    public static void main(String[] args) {
        // print message
        System.out.println("Comments are ignored");
    }
}`,
    },
    {
      task: 'Create a class Employee with fields employeeName and monthlySalary, a constant BONUS_PERCENT = 10 and a method calculateBonus(). Print the bonus for salary 30000.',
      hint: 'bonus = monthlySalary * BONUS_PERCENT / 100.',
      solution: j`class Employee {
    static final int BONUS_PERCENT = 10;
    String employeeName;
    int monthlySalary;

    int calculateBonus() {
        return monthlySalary * BONUS_PERCENT / 100;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee emp = new Employee();
        emp.employeeName = "Kiran";
        emp.monthlySalary = 30000;
        System.out.println(emp.employeeName + " bonus: " + emp.calculateBonus());
    }
}`,
    },
    {
      task: 'Write main using the varargs form String... args and print the number of arguments.',
      hint: 'public static void main(String... args) is a valid entry point.',
      solution: j`public class Main {
    public static void main(String... args) {
        System.out.println("Arguments: " + args.length);
    }
}`,
    },
    {
      task: 'Write a method with a Javadoc comment that returns the square of a number and print square(9).',
      hint: 'Use @param and @return tags.',
      solution: j`public class Main {
    /**
     * Returns the square of n.
     * @param n the number
     * @return n multiplied by n
     */
    static int square(int n) {
        return n * n;
    }

    public static void main(String[] args) {
        System.out.println("Square of 9 = " + square(9));
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which is the correct order in a Java source file?', options: ['import, package, class', 'class, import, package', 'package, import, class', 'package, class, import'], answer: 2, explanation: 'package comes first, then imports, then type declarations.' },
    { question: 'Which naming is correct for a constant?', options: ['maxSpeed', 'MAX_SPEED', 'MaxSpeed', 'max_speed'], answer: 1, explanation: 'Constants use UPPER_SNAKE_CASE.' },
    { question: 'Which is NOT a valid identifier?', options: ['_value', '$total', 'value2', '2value'], answer: 3, explanation: 'Identifiers cannot start with a digit.' },
    { question: 'Which comment type is processed by the javadoc tool?', options: ['/** ... */', '// ...', '/* ... */', '<!-- ... -->'], answer: 0, explanation: 'Documentation comments start with /**.' },
    { question: 'Which of these main signatures can the JVM use as entry point?', options: ['public void main(String[] args)', 'public static int main(String[] args)', 'private static void main(String[] args)', 'public static void main(String args[])'], answer: 3, explanation: 'String args[] is just another array syntax; the others break public/static/void rules.' },
  ],
};
