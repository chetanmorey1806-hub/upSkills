const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. IntelliJ highlights old try-finally closing code and offers Alt+Enter > "Replace with try-with-resources"',
  'Click Run ▶ and watch the order of Open / Using / Close messages',
];

const ex1 = `class Resource implements AutoCloseable {
    private final String name;

    Resource(String name) {
        this.name = name;
        System.out.println("Open " + name);
    }

    void use() {
        System.out.println("Using " + name);
    }

    @Override
    public void close() {                     // called automatically
        System.out.println("Close " + name);
    }
}

public class Main {
    public static void main(String[] args) {
        try (Resource db = new Resource("DB");
             Resource file = new Resource("File")) {
            db.use();
            file.use();
        }                                     // closed here, in REVERSE order
        System.out.println("Done");
    }
}`;

const ex2 = `class Resource implements AutoCloseable {
    private final String name;

    Resource(String name) {
        this.name = name;
        System.out.println("Open " + name);
    }

    void use() {
        System.out.println("Using " + name);
    }

    @Override
    public void close() {
        System.out.println("Close " + name);
    }
}

public class Main {
    public static void main(String[] args) {
        try (Resource r = new Resource("Socket")) {
            r.use();
            throw new IllegalStateException("Connection lost");
        } catch (IllegalStateException e) {       // runs AFTER the resource is closed
            System.out.println("Caught: " + e.getMessage());
        } finally {
            System.out.println("Finally block");
        }
    }
}`;

const ex3 = `class FaultyResource implements AutoCloseable {
    @Override
    public void close() throws Exception {
        System.out.println("Closing faulty resource");
        throw new Exception("Close failed");
    }
}

public class Main {
    public static void main(String[] args) {
        try (FaultyResource fr = new FaultyResource()) {
            throw new RuntimeException("Main work failed");
        } catch (Exception e) {
            System.out.println("Primary: " + e.getMessage());
            for (Throwable s : e.getSuppressed()) {      // close() exception is attached here
                System.out.println("Suppressed: " + s.getMessage());
            }
        }
    }
}`;

const ex4 = `import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class Main {
    public static void main(String[] args) throws IOException {
        Path path = Files.createTempFile("students", ".txt");

        try (BufferedWriter writer = Files.newBufferedWriter(path)) {
            writer.write("Asha,90");
            writer.newLine();
            writer.write("Ravi,75");
            writer.newLine();
        }                                         // flushed and closed automatically

        int total = 0;
        try (BufferedReader reader = Files.newBufferedReader(path)) {
            String line;
            while ((line = reader.readLine()) != null) {
                String[] parts = line.split(",");
                System.out.println(parts[0] + " scored " + parts[1]);
                total += Integer.parseInt(parts[1]);
            }
        }
        System.out.println("Total = " + total);
        Files.delete(path);
    }
}`;

const ex5 = `class Resource implements AutoCloseable {
    private final String name;

    Resource(String name) {
        this.name = name;
        System.out.println("Open " + name);
    }

    void use() {
        System.out.println("Using " + name);
    }

    @Override
    public void close() {
        System.out.println("Close " + name);
    }
}

public class Main {
    // Before Java 7: manual closing in finally (verbose and easy to get wrong)
    static void oldStyle() {
        Resource r = null;
        try {
            r = new Resource("OldFile");
            r.use();
        } finally {
            if (r != null) {
                r.close();
            }
        }
    }

    // Java 9+: an effectively final variable can be used directly
    static void java9Style() {
        Resource r = new Resource("NewFile");
        try (r) {
            r.use();
        }
    }

    public static void main(String[] args) {
        oldStyle();
        java9Style();
    }
}`;

const ex6 = `import java.util.Objects;

class UserService {
    String findEmail(String userId) {
        Objects.requireNonNull(userId, "userId must not be null");      // fail fast
        if (userId.isBlank()) {
            throw new IllegalArgumentException("userId must not be blank");
        }
        return userId.toLowerCase() + "@company.com";
    }
}

public class Main {
    public static void main(String[] args) {
        UserService service = new UserService();
        String[] ids = {"RAVI", "", null};
        for (String id : ids) {
            try {
                System.out.println("Email: " + service.findEmail(id));
            } catch (NullPointerException | IllegalArgumentException e) {   // specific, not Exception
                System.out.println("Bad input (" + e.getClass().getSimpleName() + "): " + e.getMessage());
            }
        }
    }
}`;

const pr1 = `class Connection implements AutoCloseable {
    Connection() { System.out.println("Connected"); }
    void query(String sql) { System.out.println("Executing: " + sql); }
    @Override public void close() { System.out.println("Disconnected"); }
}

public class Main {
    public static void main(String[] args) {
        try (Connection con = new Connection()) {
            con.query("SELECT * FROM student");
        }
        // Connected
        // Executing: SELECT * FROM student
        // Disconnected
    }
}`;

const pr2 = `import java.io.IOException;
import java.io.PrintWriter;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        try {
            Path p = Files.createTempFile("log", ".txt");
            try (PrintWriter out = new PrintWriter(Files.newBufferedWriter(p))) {
                out.println("INFO start");
                out.println("WARN disk 80%");
                out.println("INFO end");
            }
            List<String> lines = Files.readAllLines(p);
            long warnings = lines.stream().filter(l -> l.startsWith("WARN")).count();
            System.out.println("Lines: " + lines.size() + ", warnings: " + warnings);   // Lines: 3, warnings: 1
            Files.delete(p);
        } catch (IOException e) {
            System.out.println("File error: " + e.getMessage());
        }
    }
}`;

const pr3 = `class Step implements AutoCloseable {
    private final int n;
    Step(int n) { this.n = n; System.out.println("open " + n); }
    @Override public void close() { System.out.println("close " + n); }
}

public class Main {
    public static void main(String[] args) {
        try (Step a = new Step(1); Step b = new Step(2); Step c = new Step(3)) {
            System.out.println("body");
        }
        // open 1, open 2, open 3, body, close 3, close 2, close 1
    }
}`;

const pr4 = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        try (Scanner sc = new Scanner(System.in)) {
            int sum = 0;
            while (sc.hasNextInt()) {
                sum += sc.nextInt();
            }
            System.out.println("Sum = " + sum);
        }
        // input: 4 5 6  -> Sum = 15
    }
}`;

export default {
  id: 'day-28-try-with-resources-best-practices',
  title: 'try-with-resources and Exception Handling Best Practices',
  module: 'Module 4: Exception Handling',
  day: 28,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Close files, streams and connections automatically with try-with-resources, understand closing order and suppressed exceptions, and follow industry best practices for writing clean, debuggable exception-handling code.',
  objectives: [
    'Use try-with-resources with one or more AutoCloseable resources',
    'Predict closing order and the interaction with catch and finally',
    'Read suppressed exceptions',
    'Apply exception-handling best practices used in real projects',
  ],
  theory: [
    {
      heading: 'Why try-with-resources?',
      content:
        'Files, database connections, sockets and scanners hold operating-system resources. If you forget to close them (or an exception skips your close() call), you get resource leaks: "too many open files", exhausted DB connection pools. Before Java 7 we closed them in finally blocks, which was verbose and error-prone. Analogy: a hotel room with an automatic checkout; whatever happens during your stay, the room is released when you leave.',
      syntax: `try (BufferedReader br = Files.newBufferedReader(path)) {
    // use br
}   // br.close() is called automatically, even if an exception occurs`,
    },
    {
      heading: 'Rules of try-with-resources',
      content:
        'Any object whose class implements java.lang.AutoCloseable (or its child java.io.Closeable) can be declared in the parentheses. Multiple resources are separated by semicolons.',
      points: [
        'Resources are closed automatically at the end of the try block, in REVERSE order of creation (last opened, first closed).',
        'Resources are closed BEFORE any catch or finally block runs.',
        'Resource variables are implicitly final.',
        'Java 9+: you can use an existing effectively final variable: try (r) { ... }.',
        'catch and finally are optional with try-with-resources.',
        'If a resource variable is initialised to null, close() is simply skipped.',
      ],
    },
    {
      heading: 'AutoCloseable vs Closeable',
      content:
        'AutoCloseable (java.lang, Java 7) has void close() throws Exception. Closeable (java.io, older) extends AutoCloseable and has void close() throws IOException, and its close() should be idempotent (calling it twice is harmless). All I/O streams, readers and writers implement Closeable; JDBC Connection, Statement and ResultSet implement AutoCloseable.',
    },
    {
      heading: 'Suppressed Exceptions',
      content:
        'If the try body throws exception A and then close() throws exception B, Java keeps A as the main (primary) exception and attaches B as a suppressed exception (A.getSuppressed()). In an old try-finally, B would replace A and the real cause would be lost. This is another big reason to prefer try-with-resources.',
    },
    {
      heading: 'Exception Handling Best Practices',
      content:
        'These rules come straight from code reviews in real companies:',
      points: [
        'Catch specific exceptions, not Exception or Throwable (except at the top level of an app).',
        'Never swallow exceptions with an empty catch block; log them or rethrow.',
        'Use try-with-resources for anything that must be closed.',
        'Fail fast: validate inputs early (Objects.requireNonNull, IllegalArgumentException).',
        'Throw early, catch late: throw where the problem is detected, catch where you can actually handle it (often a controller or global handler).',
        'Wrap low-level exceptions in meaningful custom exceptions, always passing the cause.',
        'Write clear messages with context: "Order 123 not found", not "Error".',
        'Do not use exceptions for normal flow control (e.g. to end a loop).',
        'Do not return from finally; do not throw from finally.',
        'Use a logger (log.error("msg", e)) instead of e.printStackTrace() in real applications.',
      ],
      tip: 'In Spring Boot you will centralise exception handling with @ControllerAdvice (covered in the Spring Boot course), which follows the "catch late" rule.',
    },
  ],
  examples: [
    {
      title: 'Multiple Resources and Closing Order',
      scenario: 'A report job opens a database and a file; both must be closed automatically.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Open DB
Open File
Using DB
Using File
Close File
Close DB
Done`,
      explanation:
        'Resources are opened left to right and closed in reverse order (File first, then DB), like a stack of plates.',
    },
    {
      title: 'Exception Inside try-with-resources',
      scenario: 'A network connection fails while being used. When is it closed relative to catch and finally?',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Open Socket
Using Socket
Close Socket
Caught: Connection lost
Finally block`,
      explanation:
        'When the exception is thrown, the resource is closed first, then the catch block runs, then finally.',
    },
    {
      title: 'Suppressed Exceptions',
      scenario: 'Both the work and the close() fail. Which exception does the caller see?',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Closing faulty resource
Primary: Main work failed
Suppressed: Close failed`,
      explanation:
        'The body\'s RuntimeException is the primary exception. The exception from close() is not lost; it is attached as a suppressed exception and read with getSuppressed().',
    },
    {
      title: 'Writing and Reading a File Safely',
      scenario: 'Store student scores in a file and read them back, guaranteeing the file is closed.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Asha scored 90
Ravi scored 75
Total = 165`,
      explanation:
        'A temporary file is created in the system temp folder. The writer is closed (and flushed) at the end of the first try; the reader at the end of the second. 90 + 75 = 165. The file is deleted at the end.',
    },
    {
      title: 'Old try-finally vs Java 9 try (resource)',
      scenario: 'Compare the verbose pre-Java-7 style with the modern effectively-final resource syntax.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Open OldFile
Using OldFile
Close OldFile
Open NewFile
Using NewFile
Close NewFile`,
      explanation:
        'Both methods close the resource, but the old style needs a null check and a finally block. In Java 9+, try (r) works because r is effectively final.',
    },
    {
      title: 'Best Practice: Fail Fast with Specific Exceptions',
      scenario: 'A service validates its input immediately and the caller catches only the specific exceptions it expects.',
      steps: STEPS,
      code: ex6,
      java: { files: { 'Main.java': ex6 } },
      result: `Email: ravi@company.com
Bad input (IllegalArgumentException): userId must not be blank
Bad input (NullPointerException): userId must not be null`,
      explanation:
        'Objects.requireNonNull throws a NullPointerException with our clear message. A blank id raises IllegalArgumentException. The caller uses multi-catch with specific types instead of catching Exception.',
    },
  ],
  interview: [
    {
      q: 'What is try-with-resources?',
      a: 'A Java 7 feature where resources declared in try (...) are closed automatically at the end of the block, even if an exception occurs. The resources must implement AutoCloseable.',
      level: 'Easy',
    },
    {
      q: 'Difference between AutoCloseable and Closeable?',
      a: 'AutoCloseable (java.lang) close() throws Exception. Closeable (java.io) extends AutoCloseable, close() throws IOException and should be idempotent. Both work with try-with-resources.',
      level: 'Medium',
    },
    {
      q: 'In which order are multiple resources closed?',
      a: 'In reverse order of their declaration: the last opened is closed first.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nclass R implements AutoCloseable { String n; R(String n) { this.n = n; } public void close() { System.out.print("C" + n + " "); } }\ntry (R a = new R("1"); R b = new R("2")) { System.out.print("T "); } finally { System.out.print("F"); }',
      a: 'Output: T C2 C1 F. Body first, then resources closed in reverse order, then finally.',
      level: 'Medium',
    },
    {
      q: 'What are suppressed exceptions?',
      a: 'Exceptions thrown by close() while another exception is already propagating from the try body. They are attached to the primary exception and accessible via getSuppressed() instead of replacing it.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\ntry (R r = null) { System.out.println("body"); }',
      a: 'Output: body. A null resource is allowed; close() is simply not called, so no NullPointerException occurs.',
      level: 'Hard',
    },
    {
      q: 'What did Java 9 improve in try-with-resources?',
      a: 'It allows an existing final or effectively final variable to be used directly: Resource r = ...; try (r) { }. Previously you had to declare a new variable inside the parentheses.',
      level: 'Medium',
    },
    {
      q: 'Is the resource closed before or after the catch block runs?',
      a: 'Before. Resources are closed as soon as the try block ends (normally or by exception), then catch and finally run.',
      level: 'Easy',
    },
    {
      q: 'List some exception-handling best practices.',
      a: 'Catch specific exceptions, never swallow exceptions, use try-with-resources, fail fast with validation, throw early and catch late, wrap with cause, meaningful messages, no exceptions for flow control, no return/throw in finally, use logging instead of printStackTrace.',
      level: 'Medium',
    },
    {
      q: 'Why is catching Throwable or Exception everywhere a bad idea?',
      a: 'It hides bugs (NullPointerException etc.), may catch Errors like OutOfMemoryError that cannot be handled, and makes it impossible to react differently to different problems. Catch broad types only at the top-level boundary for logging.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a Connection class implementing AutoCloseable and use it in try-with-resources to run a query.',
      hint: 'Print messages in the constructor, query() and close().',
      solution: pr1,
    },
    {
      task: 'Write three log lines to a temp file using PrintWriter in try-with-resources, then count WARN lines.',
      hint: 'Files.readAllLines(path) returns a List<String>.',
      solution: pr2,
    },
    {
      task: 'Open three resources in one try and predict the open/close order before running.',
      hint: 'Closing is reverse order.',
      solution: pr3,
    },
    {
      task: 'Read integers from the keyboard with a Scanner inside try-with-resources and print their sum.',
      hint: 'while (sc.hasNextInt()) sum += sc.nextInt(); Remember closing a Scanner on System.in also closes System.in.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which interface must a resource implement to be used in try-with-resources?',
      options: ['Serializable', 'Runnable', 'AutoCloseable', 'Iterable'],
      answer: 2,
      explanation: 'AutoCloseable (Closeable extends it).',
    },
    {
      question: 'Resources A then B are declared. Closing order is...',
      options: ['B then A', 'A then B', 'Random', 'Only A is closed'],
      answer: 0,
      explanation: 'Reverse order of declaration.',
    },
    {
      question: 'The try body throws X and close() throws Y. The caller catches...',
      options: ['Y with X suppressed', 'X with Y suppressed', 'Both separately', 'Neither'],
      answer: 1,
      explanation: 'The body\'s exception is primary; the close exception is suppressed.',
    },
    {
      question: 'Which is a BAD practice?',
      options: ['Using try-with-resources', 'Passing the cause when wrapping', 'Validating input early', 'An empty catch block'],
      answer: 3,
      explanation: 'Empty catch blocks hide failures.',
    },
    {
      question: 'In try-with-resources with catch and finally, when is the resource closed?',
      options: ['After finally', 'Never automatically', 'Before catch and finally', 'Only if no exception occurs'],
      answer: 2,
      explanation: 'Resources are closed first, then catch, then finally.',
    },
  ],
};
