const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. Tip: select risky code and press Ctrl+Alt+T > try/catch (IntelliJ) or Alt+Shift+Z (Eclipse) to surround it',
  'Click Run ▶ and observe that the program continues after an exception is handled',
];

const ex1 = `public class Main {
    public static void main(String[] args) {
        System.out.println("Start");
        try {
            int a = 10, b = 0;
            int c = a / b;                         // throws ArithmeticException
            System.out.println("Result: " + c);   // skipped
        } catch (ArithmeticException e) {
            System.out.println("Caught: " + e.getMessage());
            System.out.println("toString: " + e);
        }
        System.out.println("End - program continues");
    }
}`;

const ex2 = `public class Main {
    static void process(String input, int index) {
        try {
            int[] arr = {10, 20, 30};
            int n = Integer.parseInt(input.trim());
            System.out.println("Value: " + arr[index] / n);
        } catch (NumberFormatException e) {
            System.out.println("Invalid number: " + e.getMessage());
        } catch (ArithmeticException | ArrayIndexOutOfBoundsException e) {   // multi-catch
            System.out.println("Math/Index problem: " + e.getClass().getSimpleName());
        } catch (Exception e) {                    // most general LAST
            System.out.println("Something else: " + e.getClass().getSimpleName());
        }
    }

    public static void main(String[] args) {
        process("5", 1);
        process("abc", 1);
        process("0", 1);
        process("2", 5);
        process(null, 0);
    }
}`;

const ex3 = `public class Main {
    static int test(int x) {
        try {
            System.out.println("try: x = " + x);
            if (x == 0) {
                throw new IllegalArgumentException("zero");
            }
            return x * 10;
        } catch (IllegalArgumentException e) {
            System.out.println("catch: " + e.getMessage());
            return -1;
        } finally {
            System.out.println("finally runs");   // runs before the method actually returns
        }
    }

    public static void main(String[] args) {
        System.out.println("Returned " + test(5));
        System.out.println("Returned " + test(0));
    }
}`;

const ex4 = `public class Main {
    static boolean isChecked(Throwable t) {
        return !(t instanceof RuntimeException) && !(t instanceof Error);
    }

    static void showHierarchy(Throwable t) {
        Class<?> c = t.getClass();
        StringBuilder sb = new StringBuilder(c.getSimpleName());
        while ((c = c.getSuperclass()) != null) {
            sb.append(" -> ").append(c.getSimpleName());
        }
        System.out.println(sb + " | checked=" + isChecked(t));
    }

    static void loadDriver(String name) {
        try {
            Class<?> c = Class.forName(name);        // throws checked ClassNotFoundException
            System.out.println("Loaded: " + c.getSimpleName());
        } catch (ClassNotFoundException e) {
            System.out.println("Driver not found: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        showHierarchy(new ArithmeticException());
        showHierarchy(new java.io.FileNotFoundException());
        showHierarchy(new StackOverflowError());

        loadDriver("java.util.ArrayList");
        loadDriver("com.mysql.cj.jdbc.Driver");

        try {
            Thread.sleep(100);                       // throws checked InterruptedException
            System.out.println("Woke up after 100 ms");
        } catch (InterruptedException e) {
            System.out.println("Interrupted");
        }
    }
}`;

const ex5 = `public class Main {
    static void level3() {
        System.out.println("level3 start");
        int[] a = new int[2];
        a[3] = 1;                                    // exception thrown here
        System.out.println("level3 end");            // never runs
    }

    static void level2() {
        try {
            level3();
        } finally {                                  // try-finally without catch
            System.out.println("level2 finally");
        }
    }

    static void level1() {
        try {
            level2();
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("level1 caught: " + e.getMessage());
        }
    }

    public static void main(String[] args) {
        level1();
        System.out.println("main continues");
    }
}`;

const pr1 = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        try {
            int a = Integer.parseInt(sc.nextLine());
            int b = Integer.parseInt(sc.nextLine());
            System.out.println("Quotient: " + a / b);
        } catch (NumberFormatException e) {
            System.out.println("Please enter whole numbers only");
        } catch (ArithmeticException e) {
            System.out.println("Cannot divide by zero");
        } finally {
            System.out.println("Calculator closed");
        }
    }
}
// input 20 and 4 -> Quotient: 5 / Calculator closed
// input 20 and 0 -> Cannot divide by zero / Calculator closed`;

const pr2 = `public class Main {
    static int safeGet(int[] arr, int index, int defaultValue) {
        try {
            return arr[index];
        } catch (ArrayIndexOutOfBoundsException e) {
            return defaultValue;
        }
    }

    public static void main(String[] args) {
        int[] marks = {70, 85, 90};
        System.out.println(safeGet(marks, 1, -1));   // 85
        System.out.println(safeGet(marks, 9, -1));   // -1
    }
}`;

const pr3 = `public class Main {
    public static void main(String[] args) {
        String[] inputs = {"12", "x7", "40", ""};
        int sum = 0, bad = 0;
        for (String s : inputs) {
            try {
                sum += Integer.parseInt(s);
            } catch (NumberFormatException e) {
                bad++;
            }
        }
        System.out.println("Sum = " + sum + ", invalid = " + bad);   // Sum = 52, invalid = 2
    }
}`;

const pr4 = `public class Main {
    static String describe(Object o) {
        try {
            String s = (String) o;
            return "Length " + s.length();
        } catch (ClassCastException e) {
            return "Not a String";
        } catch (NullPointerException e) {
            return "Null value";
        }
    }

    public static void main(String[] args) {
        System.out.println(describe("hello"));   // Length 5
        System.out.println(describe(42));        // Not a String
        System.out.println(describe(null));      // Null value
    }
}`;

export default {
  id: 'day-26-exception-handling-basics',
  title: 'Exceptions, Exception Hierarchy, Checked vs Unchecked, try-catch-finally and multi-catch',
  module: 'Module 4: Exception Handling',
  day: 26,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Understand what exceptions are, how the Throwable hierarchy is organised, the difference between checked and unchecked exceptions, and how to handle them with try, catch, multi-catch and finally so programs fail gracefully.',
  objectives: [
    'Explain exceptions vs errors and draw the exception hierarchy',
    'Differentiate checked and unchecked exceptions with examples',
    'Use try, multiple catch blocks, multi-catch and finally correctly',
    'Predict output involving finally, return and exception propagation',
  ],
  theory: [
    {
      heading: 'What is an Exception?',
      content:
        'An exception is an unexpected event during program execution that disrupts the normal flow, such as dividing by zero, reading a missing file or accessing index 10 of a 3-element array. Analogy: you are driving to the office and a road is blocked (exception). Without a plan, the trip stops (program crashes). With a plan B (catch block) you take another road and still reach (program continues).',
      points: [
        'When an exception occurs, the JVM creates an exception object with the type, message and stack trace, and "throws" it.',
        'If no code catches it, the default exception handler prints the stack trace and the thread terminates.',
        'Exception handling keeps the program running and lets you show friendly messages, retry or clean up.',
      ],
    },
    {
      heading: 'Exception Hierarchy',
      content:
        'Diagram:\n Object\n  └ Throwable\n     ├ Error (serious JVM problems: OutOfMemoryError, StackOverflowError) -> do not catch\n     └ Exception\n        ├ IOException, FileNotFoundException, SQLException, ClassNotFoundException, InterruptedException (checked)\n        └ RuntimeException (unchecked)\n           ├ ArithmeticException\n           ├ NullPointerException\n           ├ ArrayIndexOutOfBoundsException / StringIndexOutOfBoundsException\n           ├ NumberFormatException (child of IllegalArgumentException)\n           ├ ClassCastException\n           └ IllegalArgumentException, IllegalStateException',
      points: [
        'Error: problems the application usually cannot recover from.',
        'Exception: problems the application can and should handle.',
      ],
    },
    {
      heading: 'Checked vs Unchecked Exceptions',
      content:
        'Checked exceptions are checked by the COMPILER: if a method can throw one, you must either catch it or declare it with throws, otherwise the code will not compile. They represent recoverable external problems (file missing, network down, DB error). Unchecked exceptions (RuntimeException and its children, plus Errors) are not checked at compile time; they usually represent programming bugs (null access, bad index, bad cast) and should be fixed in code rather than caught everywhere.',
      points: [
        'Checked: IOException, FileNotFoundException, SQLException, ClassNotFoundException, InterruptedException.',
        'Unchecked: ArithmeticException, NullPointerException, ArrayIndexOutOfBoundsException, NumberFormatException, ClassCastException.',
        'Both happen at RUNTIME. "Checked" only means the compiler forces you to handle them.',
      ],
    },
    {
      heading: 'try, catch and finally',
      content:
        'try: wrap code that may throw. catch: handle a specific exception type. finally: code that always runs (whether an exception happened, was caught, or a return statement executed), used for cleanup such as closing files and connections. When an exception occurs in try, the remaining try statements are skipped and the first matching catch runs.',
      syntax: `try {
    // risky code
} catch (ArithmeticException e) {
    // handle
} catch (Exception e) {
    // general handler LAST
} finally {
    // always runs (cleanup)
}`,
      points: [
        'try must be followed by catch, finally, or both (or be a try-with-resources).',
        'Catch order: subclass first, superclass later. Putting catch (Exception e) before catch (ArithmeticException e) is a compile error (unreachable code).',
        'finally does NOT run if the JVM stops: System.exit(), JVM crash or the machine power fails.',
        'A return inside finally overrides any return from try/catch and swallows exceptions. Never do it.',
      ],
    },
    {
      heading: 'Multi-catch (Java 7+)',
      content:
        'One catch block can handle several unrelated exception types separated by |. It removes duplicate code when the handling is identical.',
      syntax: `catch (ArithmeticException | ArrayIndexOutOfBoundsException e) { ... }`,
      points: [
        'The types must not be parent/child of each other (catch (IOException | FileNotFoundException e) is a compile error).',
        'The variable e is implicitly final in a multi-catch.',
      ],
    },
    {
      heading: 'Useful Exception Methods and Propagation',
      content:
        'e.getMessage() returns the detail message, e.toString() returns "fully.qualified.ClassName: message", e.printStackTrace() prints the full call chain (useful for debugging, but use a logger in real apps). If a method does not catch an exception, it propagates up the call stack to its caller, then to the caller\'s caller, running any finally blocks on the way, until someone catches it or main() ends and the program crashes.',
      tip: 'Never write an empty catch block (catch (Exception e) {}). It hides bugs. At least log the error.',
    },
  ],
  examples: [
    {
      title: 'Handling Division by Zero',
      scenario: 'A calculator must not crash when the user divides by zero.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Start
Caught: / by zero
toString: java.lang.ArithmeticException: / by zero
End - program continues`,
      explanation:
        'a / b throws ArithmeticException, so "Result" is skipped. getMessage() returns "/ by zero"; toString() adds the fully qualified class name. After the catch, execution continues normally.',
    },
    {
      title: 'Multiple catch Blocks and Multi-catch',
      scenario: 'A data processor handles bad numbers, division by zero, bad indexes and nulls differently.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Value: 4
Invalid number: For input string: "abc"
Math/Index problem: ArithmeticException
Math/Index problem: ArrayIndexOutOfBoundsException
Something else: NullPointerException`,
      explanation:
        '20 / 5 = 4. "abc" cannot be parsed. 20 / 0 and arr[5] go to the multi-catch. input.trim() on null throws NullPointerException, which only the general Exception handler matches. The first matching catch wins.',
    },
    {
      title: 'finally Always Runs, Even with return',
      scenario: 'A method returns from try or catch; check when finally runs.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `try: x = 5
finally runs
Returned 50
try: x = 0
catch: zero
finally runs
Returned -1`,
      explanation:
        'The return value is computed (50 or -1), then finally runs, then the method really returns and main prints the result. test() is called before println prints, which is why "finally runs" appears above "Returned ...".',
    },
    {
      title: 'Exception Hierarchy and Checked Exceptions',
      scenario: 'Print the inheritance chain of a few exceptions and handle checked exceptions from Class.forName() and Thread.sleep().',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `ArithmeticException -> RuntimeException -> Exception -> Throwable -> Object | checked=false
FileNotFoundException -> IOException -> Exception -> Throwable -> Object | checked=true
StackOverflowError -> VirtualMachineError -> Error -> Throwable -> Object | checked=false
Loaded: ArrayList
Driver not found: com.mysql.cj.jdbc.Driver
Woke up after 100 ms`,
      explanation:
        'getSuperclass() walks up the hierarchy. Anything that is not a RuntimeException or Error is checked. Class.forName and Thread.sleep declare checked exceptions, so the compiler forces the try-catch. The MySQL driver is not on the classpath, so ClassNotFoundException is caught and its message is the class name.',
    },
    {
      title: 'Exception Propagation Through Method Calls',
      scenario: 'An exception thrown deep in level3() travels up until level1() catches it; level2() only cleans up.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `level3 start
level2 finally
level1 caught: Index 3 out of bounds for length 2
main continues`,
      explanation:
        'a[3] throws in level3, skipping "level3 end". level2 has no catch, but its finally runs while the exception passes through. level1 catches it, so main continues normally.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Exception and Error?',
      a: 'Both extend Throwable. Exception represents conditions an application can handle (IOException, NullPointerException). Error represents serious problems usually outside the program\'s control (OutOfMemoryError, StackOverflowError) that should not be caught.',
      level: 'Easy',
    },
    {
      q: 'Checked vs unchecked exceptions?',
      a: 'Checked exceptions (subclasses of Exception but not RuntimeException) must be caught or declared with throws, verified at compile time, e.g. IOException, SQLException. Unchecked exceptions (RuntimeException and subclasses, and Errors) are not enforced by the compiler, e.g. NullPointerException, ArithmeticException.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nstatic int f() { try { return 1; } finally { return 2; } }\nSystem.out.println(f());',
      a: 'Output: 2. A return in finally overrides the return in try. This is bad practice and also swallows exceptions.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nstatic int f() { int x = 10; try { return x; } finally { x = 20; } }\nSystem.out.println(f());',
      a: 'Output: 10. The return value (10) is saved before finally runs; changing the local x in finally does not change the saved value.',
      level: 'Hard',
    },
    {
      q: 'Will this compile?\ntry { int a = 5 / 0; } catch (Exception e) { } catch (ArithmeticException e) { }',
      a: 'No. ArithmeticException is a subclass of Exception, so the second catch is unreachable: "exception ArithmeticException has already been caught". Put the more specific catch first.',
      level: 'Medium',
    },
    {
      q: 'When does a finally block NOT execute?',
      a: 'When System.exit() is called in try/catch, when the JVM crashes or is killed, or if the thread runs an infinite loop / is a daemon thread when the JVM exits.',
      level: 'Medium',
    },
    {
      q: 'Can we write try without catch?',
      a: 'Yes, try-finally is valid (the exception still propagates after finally), and try-with-resources can stand alone.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\ntry { System.out.print("A"); int x = 1 / 0; System.out.print("B"); } catch (ArithmeticException e) { System.out.print("C"); } finally { System.out.print("D"); } System.out.print("E");',
      a: 'Output: ACDE. B is skipped because the exception jumps to catch.',
      level: 'Easy',
    },
    {
      q: 'What are the rules of multi-catch?',
      a: 'Types are separated by |, they must not be in a parent-child relationship, and the catch parameter is implicitly final.',
      level: 'Medium',
    },
    {
      q: 'What happens when an exception is not caught anywhere?',
      a: 'It propagates up the call stack. When it leaves main(), the JVM\'s default exception handler prints "Exception in thread "main"" with the stack trace, and the thread terminates (the program ends if no other non-daemon threads run).',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Read two numbers with Scanner and print their quotient. Handle non-numeric input and division by zero, and always print "Calculator closed".',
      hint: 'Two catch blocks plus finally.',
      solution: pr1,
    },
    {
      task: 'Write safeGet(int[] arr, int index, int defaultValue) that returns the default for an invalid index.',
      hint: 'Catch ArrayIndexOutOfBoundsException.',
      solution: pr2,
    },
    {
      task: 'Sum an array of strings, skipping and counting invalid numbers.',
      hint: 'try-catch inside the loop so one bad value does not stop the loop.',
      solution: pr3,
    },
    {
      task: 'Write describe(Object o) that handles ClassCastException and NullPointerException.',
      hint: 'Casting null to String does NOT throw; calling length() on it does.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which of these is a checked exception?',
      options: ['NullPointerException', 'IOException', 'ArithmeticException', 'ClassCastException'],
      answer: 1,
      explanation: 'IOException extends Exception but not RuntimeException.',
    },
    {
      question: 'Which class is the root of all exceptions and errors?',
      options: ['Exception', 'Error', 'RuntimeException', 'Throwable'],
      answer: 3,
      explanation: 'Throwable is the superclass of Exception and Error.',
    },
    {
      question: 'What does Integer.parseInt("12a") throw?',
      options: ['NumberFormatException', 'ArithmeticException', 'ClassCastException', 'IOException'],
      answer: 0,
      explanation: 'NumberFormatException (a subclass of IllegalArgumentException).',
    },
    {
      question: 'Which catch order is valid?',
      options: [
        'Exception, then ArithmeticException',
        'RuntimeException, then ArithmeticException',
        'ArithmeticException, then Exception',
        'Throwable, then Exception',
      ],
      answer: 2,
      explanation: 'Specific (child) exceptions must be caught before general (parent) ones.',
    },
    {
      question: 'try { return "T"; } finally { System.out.print("F"); } What is printed if the caller prints the result?',
      options: ['T', 'TF', 'Compile error', 'FT'],
      answer: 3,
      explanation: 'finally prints F before the method returns, then the caller prints T.',
    },
  ],
};
