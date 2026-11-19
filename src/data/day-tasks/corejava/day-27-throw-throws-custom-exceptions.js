export default {
  lesson: 'day-27-throw-throws-custom-exceptions',
  minutes: 22,
  intro: 'Throw exceptions yourself, declare them with throws, create custom exceptions and chain causes.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Custom checked exception: what does this program print?',
      example: {
        title: 'a custom exception class',
        code: `class InvalidAgeException extends Exception {
  InvalidAgeException(String msg) { super(msg); }
}`,
      },
      code: `class InsufficientBalanceException extends Exception {
    InsufficientBalanceException(String msg) { super(msg); }
}

public class Main {
    static void withdraw(double balance, double amount) throws InsufficientBalanceException {
        if (amount > balance) {
            throw new InsufficientBalanceException("Need " + (amount - balance) + " more");
        }
        System.out.println("Withdrawn " + amount);
    }

    public static void main(String[] args) {
        try {
            withdraw(1000, 500);
            withdraw(1000, 1500);
            System.out.println("after");
        } catch (InsufficientBalanceException e) {
            System.out.println("Error: " + e.getMessage());
        }
        System.out.println("done");
    }
}`,
      expected: `Withdrawn 500.0
Error: Need 500.0 more
done`,
      explain: 'The first call succeeds (doubles print as 500.0). The second `throw`s our exception, so the rest of the try block ("after") is skipped and the catch prints the message passed to `super(msg)`. Execution then continues after the try-catch.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Exception chaining: what does this program print?',
      example: {
        title: 'wrapping a low-level exception',
        code: `catch (SQLException e) {
  throw new DataAccessException("Save failed", e); // e is the cause
}`,
      },
      code: `public class Main {
    static int loadPort(String value) {
        try {
            return Integer.parseInt(value);
        } catch (NumberFormatException e) {
            throw new IllegalStateException("Bad config: " + value, e);
        }
    }

    public static void main(String[] args) {
        System.out.println(loadPort("8080"));
        try {
            loadPort("80a");
        } catch (IllegalStateException e) {
            System.out.println(e.getMessage());
            System.out.println(e.getCause().getClass().getSimpleName());
        }
    }
}`,
      expected: `8080
Bad config: 80a
NumberFormatException`,
      explain: '"8080" parses fine. "80a" throws NumberFormatException, which is caught and **wrapped** in a higher-level IllegalStateException with the original as its cause. `getCause()` gives back the original exception so no debugging information is lost.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Inside \`setAge(int age)\`, reject negative ages by throwing an \`IllegalArgumentException\` with the message "Age cannot be negative":
\`if (age < 0) ____;\``,
      example: {
        title: 'throwing another built-in exception',
        code: 'if (list.isEmpty()) throw new IllegalStateException("No items");',
      },
      accept: ['throw new IllegalArgumentException("Age cannot be negative")'],
      acceptRegex: ['^throw\\s+new\\s+IllegalArgumentException\\s*\\(\\s*"Age cannot be negative"\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`throw` is followed by an exception **object**, so you need `new`. IllegalArgumentException is unchecked, so the method does not need a throws clause.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `The method reads a file and does not handle the checked \`IOException\` itself. Complete the header:
\`static String readConfig(String path) ____ IOException {\``,
      example: { title: 'declaring two exceptions', code: 'void connect() throws IOException, SQLException { ... }' },
      accept: ['throws'],
      acceptRegex: ['^throws\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`throws` in the method header **declares** that the method may pass the exception to its caller, who must then handle or declare it. `throw` (without s) is the statement that actually raises one.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Your custom exception should be **unchecked** (callers are not forced to catch it). Which class should it extend?',
      options: ['Exception', 'RuntimeException', 'Error', 'Throwable'],
      answer: 1,
      explain: 'Extend **RuntimeException** for unchecked exceptions (most business-rule exceptions in Spring apps). Extending Exception makes it checked. Never extend Error: that is for JVM problems.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `throw` vs `throws` are TRUE? (choose all that apply)',
      options: [
        'throw is used inside a method body',
        'throws is used in the method signature',
        'throw can throw several exceptions at once',
        'throws can list several exception types separated by commas',
        'throw is followed by an exception object',
      ],
      answers: [0, 1, 3, 4],
      explain: '`throw new X(...)` raises **one** exception object inside a method. `throws A, B` in the signature declares possibly several exception types.',
    },
  ],
};
