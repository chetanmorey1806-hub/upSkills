export default {
  lesson: 'day-26-exception-handling-basics',
  minutes: 22,
  intro: 'Trace try/catch/finally, choose the right catch block and tell checked from unchecked exceptions.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'try, catch, finally and return: what does this program print?',
      example: {
        title: 'finally always runs',
        code: `try { System.out.println("A"); }
finally { System.out.println("B"); }
// A
// B`,
      },
      code: `public class Main {
    static int test() {
        try {
            System.out.println("try");
            int x = 10 / 0;
            System.out.println("after division");
            return 1;
        } catch (ArithmeticException e) {
            System.out.println("catch: " + e.getMessage());
            return 2;
        } finally {
            System.out.println("finally");
        }
    }

    public static void main(String[] args) {
        System.out.println(test());
    }
}`,
      expected: `try
catch: / by zero
finally
2`,
      explain: 'Integer division by zero throws ArithmeticException with the message "/ by zero", so "after division" is skipped. The catch block prepares to return 2, but **finally runs first**, then the value 2 reaches main.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which catch block runs? What does this program print?',
      example: {
        title: 'catch order: specific first',
        code: `catch (FileNotFoundException e) { ... }
catch (IOException e) { ... }   // parent last`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        try {
            String s = null;
            System.out.println("length: " + s.length());
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic");
        } catch (RuntimeException e) {
            System.out.println("Runtime: " + e.getClass().getSimpleName());
        } finally {
            System.out.println("cleanup");
        }
        System.out.println("end");
    }
}`,
      expected: `Runtime: NullPointerException
cleanup
end`,
      explain: 'Calling a method on null throws **NullPointerException**. It is not an ArithmeticException, but it IS-A RuntimeException, so the second catch handles it. finally runs, and since the exception was handled, the program continues to "end".',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the **multi-catch** header that handles both \`NumberFormatException\` and \`ArithmeticException\` in one block:
\`catch (____) { System.out.println("Bad input"); }\``,
      example: { title: 'multi-catch syntax', code: 'catch (IOException | SQLException e) { ... }' },
      accept: [
        'NumberFormatException | ArithmeticException e',
        'ArithmeticException | NumberFormatException e',
        'NumberFormatException | ArithmeticException ex',
        'ArithmeticException | NumberFormatException ex',
      ],
      acceptRegex: [
        '^NumberFormatException\\s*\\|\\s*ArithmeticException\\s+e\\s*[;{]?$',
        '^ArithmeticException\\s*\\|\\s*NumberFormatException\\s+e\\s*[;{]?$',
        '^NumberFormatException\\s*\\|\\s*ArithmeticException\\s+ex\\s*[;{]?$',
        '^ArithmeticException\\s*\\|\\s*NumberFormatException\\s+ex\\s*[;{]?$',
        '^(NumberFormatException\\s*\\|\\s*ArithmeticException|ArithmeticException\\s*\\|\\s*NumberFormatException)\\s+[A-Za-z_$][\\w$]*$',
      ],
      caseSensitive: true,
      explain: 'Java 7 multi-catch joins types with `|` and one variable name. The types must not be parent and child of each other (e.g. `Exception | IOException` is a compile error), and the variable is implicitly final.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which one is a **checked** exception (the compiler forces you to handle or declare it)?',
      options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IOException', 'ArithmeticException'],
      answer: 2,
      explain: 'Checked exceptions extend Exception but not RuntimeException: **IOException**, SQLException, FileNotFoundException, ClassNotFoundException. The others are RuntimeExceptions (unchecked), usually caused by programming bugs.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Throwable is the parent of both Exception and Error',
        'OutOfMemoryError should normally be caught and ignored',
        'A try block must be followed by catch, finally, or both',
        'finally runs even when the try block returns',
        'A catch for Exception placed before catch for IOException compiles',
      ],
      answers: [0, 2, 3],
      explain: 'Throwable → Exception / Error. Errors (OutOfMemoryError, StackOverflowError) are serious JVM problems that apps should not try to handle. A try needs catch and/or finally. A parent catch before a child catch makes the child unreachable → compile error.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `What does this method return? (just the number)
\`static int f() { try { return 1; } finally { return 3; } }\``,
      example: {
        title: 'finally runs after try decides to return',
        code: 'try { return "A"; } finally { System.out.println("cleanup"); } // returns A after printing',
      },
      accept: ['3'],
      explain: 'finally runs after the try\'s `return 1` is prepared, and a `return` inside finally **replaces** it, so the method returns 3. This also swallows exceptions, which is why returning from finally is considered bad practice.',
    },
  ],
};
