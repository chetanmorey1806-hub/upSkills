const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main). In real projects create custom exceptions in their own files inside an exception package',
  'Type the code. If the compiler says "unreported exception", IntelliJ Alt+Enter (Eclipse Ctrl+1) offers "Add exception to method signature" or "Surround with try/catch"',
  'Click Run ▶ and compare the output',
];

const ex1 = `public class Main {
    static void setAge(int age) {
        if (age < 0 || age > 150) {
            throw new IllegalArgumentException("Invalid age: " + age);   // throw an object
        }
        System.out.println("Age set to " + age);
    }

    public static void main(String[] args) {
        int[] ages = {25, -5, 200};
        for (int a : ages) {
            try {
                setAge(a);
            } catch (IllegalArgumentException e) {
                System.out.println("Error: " + e.getMessage());
            }
        }
    }
}`;

const ex2 = `import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;

public class Main {
    // throws: "I do not handle this; my caller must"
    static void readConfig(String path) throws IOException {
        System.out.println("Opening " + path);
        FileReader fr = new FileReader(path);     // may throw FileNotFoundException
        fr.close();                               // may throw IOException
    }

    static void startApp() throws IOException {
        readConfig("missing-config.txt");
        System.out.println("App started");        // skipped if an exception occurs
    }

    public static void main(String[] args) {
        try {
            startApp();
        } catch (FileNotFoundException e) {
            System.out.println("Config file missing, using defaults");
        } catch (IOException e) {
            System.out.println("Other IO error");
        }
        System.out.println("Running with default settings");
    }
}`;

const ex3 = `class InsufficientFundsException extends Exception {     // checked custom exception
    private final double shortBy;

    InsufficientFundsException(String message, double shortBy) {
        super(message);                                       // pass message to Exception
        this.shortBy = shortBy;
    }

    double getShortBy() {
        return shortBy;
    }
}

class Account {
    private double balance;

    Account(double balance) {
        this.balance = balance;
    }

    void withdraw(double amount) throws InsufficientFundsException {
        if (amount > balance) {
            throw new InsufficientFundsException(
                "Balance " + balance + " is less than " + amount, amount - balance);
        }
        balance -= amount;
        System.out.println("Withdrawn " + amount + ", left " + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        Account acc = new Account(1000);
        try {
            acc.withdraw(300);
            acc.withdraw(900);
            acc.withdraw(100);                        // never reached
        } catch (InsufficientFundsException e) {
            System.out.println("Failed: " + e.getMessage());
            System.out.println("Short by: " + e.getShortBy());
            System.out.println(e);
        }
    }
}`;

const ex4 = `class InvalidOrderException extends RuntimeException {     // unchecked custom exception
    InvalidOrderException(String message) {
        super(message);
    }
}

class OrderProcessingException extends RuntimeException {
    OrderProcessingException(String message, Throwable cause) {
        super(message, cause);                                // exception chaining
    }
}

class OrderService {
    void validate(int qty) {                                  // no throws needed (unchecked)
        if (qty <= 0) {
            throw new InvalidOrderException("Quantity must be positive, got " + qty);
        }
    }

    void place(String item, String qtyText) {
        try {
            int qty = Integer.parseInt(qtyText);
            validate(qty);
            System.out.println("Order placed: " + qty + " x " + item);
        } catch (NumberFormatException e) {
            throw new OrderProcessingException("Bad quantity for " + item, e);   // wrap and rethrow
        }
    }
}

public class Main {
    public static void main(String[] args) {
        OrderService service = new OrderService();
        String[][] orders = { {"Pen", "3"}, {"Book", "0"}, {"Bag", "two"} };
        for (String[] o : orders) {
            try {
                service.place(o[0], o[1]);
            } catch (InvalidOrderException e) {
                System.out.println("Invalid: " + e.getMessage());
            } catch (OrderProcessingException e) {
                System.out.println("Error: " + e.getMessage()
                        + " | cause: " + e.getCause().getClass().getSimpleName());
            }
        }
    }
}`;

const ex5 = `class AppException extends Exception {
    AppException(String message) {
        super(message);
    }
}

class UserNotFoundException extends AppException {
    UserNotFoundException(String user) {
        super("User not found: " + user);
    }
}

class InvalidPasswordException extends AppException {
    InvalidPasswordException() {
        super("Invalid password");
    }
}

class LoginService {
    void login(String user, String pass) throws UserNotFoundException, InvalidPasswordException {
        if (!user.equals("admin")) {
            throw new UserNotFoundException(user);
        }
        if (!pass.equals("secret")) {
            throw new InvalidPasswordException();
        }
        System.out.println("Welcome, " + user);
    }
}

public class Main {
    public static void main(String[] args) {
        LoginService ls = new LoginService();
        String[][] attempts = { {"admin", "secret"}, {"guest", "123"}, {"admin", "oops"} };
        for (String[] a : attempts) {
            try {
                ls.login(a[0], a[1]);
            } catch (AppException e) {                // one catch for the whole family
                System.out.println(e.getClass().getSimpleName() + " -> " + e.getMessage());
            }
        }
    }
}`;

const pr1 = `class InvalidMarksException extends Exception {
    InvalidMarksException(int marks) {
        super("Marks must be 0-100, got " + marks);
    }
}

public class Main {
    static String grade(int marks) throws InvalidMarksException {
        if (marks < 0 || marks > 100) throw new InvalidMarksException(marks);
        if (marks >= 75) return "A";
        if (marks >= 50) return "B";
        return "C";
    }

    public static void main(String[] args) {
        int[] list = {88, 55, 120};
        for (int m : list) {
            try {
                System.out.println(m + " -> " + grade(m));
            } catch (InvalidMarksException e) {
                System.out.println(e.getMessage());
            }
        }
        // 88 -> A
        // 55 -> B
        // Marks must be 0-100, got 120
    }
}`;

const pr2 = `class OutOfStockException extends RuntimeException {
    OutOfStockException(String item) { super(item + " is out of stock"); }
}

class Inventory {
    private int pens = 2;
    void buyPen() {
        if (pens == 0) throw new OutOfStockException("Pen");
        pens--;
        System.out.println("Pen sold, left " + pens);
    }
}

public class Main {
    public static void main(String[] args) {
        Inventory inv = new Inventory();
        try {
            for (int i = 0; i < 3; i++) inv.buyPen();
        } catch (OutOfStockException e) {
            System.out.println(e.getMessage());
        }
        // Pen sold, left 1
        // Pen sold, left 0
        // Pen is out of stock
    }
}`;

const pr3 = `class DataAccessException extends RuntimeException {
    DataAccessException(String msg, Throwable cause) { super(msg, cause); }
}

public class Main {
    static int parseId(String text) {
        try {
            return Integer.parseInt(text);
        } catch (NumberFormatException e) {
            throw new DataAccessException("Could not read id", e);
        }
    }

    public static void main(String[] args) {
        try {
            parseId("A12");
        } catch (DataAccessException e) {
            System.out.println(e.getMessage());                    // Could not read id
            System.out.println(e.getCause().getMessage());         // For input string: "A12"
        }
    }
}`;

const pr4 = `class WeakPasswordException extends Exception {
    WeakPasswordException(String reason) { super(reason); }
}

public class Main {
    static void check(String pwd) throws WeakPasswordException {
        if (pwd.length() < 8) throw new WeakPasswordException("Too short");
        boolean hasDigit = false;
        for (char c : pwd.toCharArray()) if (Character.isDigit(c)) hasDigit = true;
        if (!hasDigit) throw new WeakPasswordException("Needs a digit");
        System.out.println("Strong password");
    }

    public static void main(String[] args) {
        String[] tests = {"abc", "abcdefgh", "abcdefg1"};
        for (String t : tests) {
            try {
                check(t);
            } catch (WeakPasswordException e) {
                System.out.println("Weak: " + e.getMessage());
            }
        }
        // Weak: Too short
        // Weak: Needs a digit
        // Strong password
    }
}`;

export default {
  id: 'day-27-throw-throws-custom-exceptions',
  title: 'throw vs throws and Custom Exceptions',
  module: 'Module 4: Exception Handling',
  day: 27,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn to raise exceptions yourself with throw, declare them with throws, design custom checked and unchecked exceptions for business rules, and wrap low-level exceptions using exception chaining.',
  objectives: [
    'Differentiate throw and throws clearly',
    'Throw built-in exceptions for invalid input',
    'Create custom checked and unchecked exceptions with extra fields',
    'Chain exceptions with a cause and build an exception hierarchy',
  ],
  theory: [
    {
      heading: 'The throw Keyword',
      content:
        'throw is used INSIDE a method to actually raise one exception object. Analogy: a referee blowing the whistle and showing a card at the exact moment of a foul. Execution of the current block stops immediately and Java looks for a matching catch.',
      syntax: `if (age < 0) {
    throw new IllegalArgumentException("Age cannot be negative");
}`,
      points: [
        'You throw an OBJECT: throw new SomeException("message").',
        'Only Throwable objects can be thrown; throw "error"; is a compile error.',
        'Only one exception is thrown per throw statement.',
        'Statements directly after throw in the same block are unreachable (compile error).',
        'throw null; compiles but throws a NullPointerException.',
      ],
    },
    {
      heading: 'The throws Keyword',
      content:
        'throws is written in a method SIGNATURE to declare which checked exceptions the method may pass to its caller instead of handling them. Analogy: a product label "may contain nuts": it warns the consumer, who must decide what to do. The caller must catch them or declare throws again.',
      syntax: `void readFile(String path) throws IOException, SQLException { ... }`,
      points: [
        'Mandatory for checked exceptions that are not caught inside the method.',
        'Optional (but allowed, as documentation) for unchecked exceptions.',
        'Can list multiple exceptions separated by commas.',
        'Declaring throws Exception on main() lets exceptions crash the program; fine for demos, not for real code.',
      ],
    },
    {
      heading: 'throw vs throws at a Glance',
      content:
        'throw: inside the method body, followed by an exception OBJECT, throws exactly one, actually raises it. throws: in the method signature, followed by exception CLASS names, can list many, only declares the possibility. Example: void withdraw(double a) throws InsufficientFundsException { if (a > balance) throw new InsufficientFundsException(...); }',
    },
    {
      heading: 'Custom Exceptions',
      content:
        'Built-in exceptions describe technical problems; custom exceptions describe BUSINESS problems in your own vocabulary: InsufficientFundsException, UserNotFoundException, OutOfStockException. They make code readable and let callers handle each business error separately.',
      syntax: `// checked
class InsufficientFundsException extends Exception {
    InsufficientFundsException(String message) { super(message); }
}
// unchecked
class InvalidOrderException extends RuntimeException {
    InvalidOrderException(String message) { super(message); }
}`,
      points: [
        'Extend Exception for checked (caller is forced to handle, e.g. recoverable business conditions).',
        'Extend RuntimeException for unchecked (programming errors or when forcing handling would only add noise). Spring and most modern frameworks prefer unchecked exceptions.',
        'Name ends with "Exception"; call super(message) so getMessage() works.',
        'Add extra fields (shortBy, errorCode) to carry useful details.',
        'Create a base exception (AppException) to group related exceptions so callers can catch the whole family.',
      ],
    },
    {
      heading: 'Exception Chaining (Wrapping)',
      content:
        'When you catch a low-level exception (NumberFormatException, SQLException) and throw a higher-level one (OrderProcessingException), pass the original as the cause: new OrderProcessingException("msg", e). The original stack trace is preserved and can be read with getCause(). Analogy: a customer complaint report that attaches the original technician\'s note.',
      tip: 'Never lose the original exception: throw new MyException("msg") inside a catch without passing e hides the root cause and makes debugging painful.',
    },
  ],
  examples: [
    {
      title: 'throw for Input Validation',
      scenario: 'A registration form must reject impossible ages.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Age set to 25
Error: Invalid age: -5
Error: Invalid age: 200`,
      explanation:
        'For invalid values, throw stops setAge() before "Age set to" is printed. The caller catches the IllegalArgumentException and prints its message, and the loop continues.',
    },
    {
      title: 'throws: Passing a Checked Exception to the Caller',
      scenario: 'An app tries to read a configuration file that does not exist; the decision of what to do is made at the top level.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Opening missing-config.txt
Config file missing, using defaults
Running with default settings`,
      explanation:
        'new FileReader() throws FileNotFoundException (a subclass of IOException) because the file is not in the working directory. readConfig and startApp only declare throws IOException; main catches it, so "App started" is skipped but the program continues.',
    },
    {
      title: 'Custom Checked Exception with Extra Data',
      scenario: 'A bank must tell the user exactly how much money is missing when a withdrawal fails.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Withdrawn 300.0, left 700.0
Failed: Balance 700.0 is less than 900.0
Short by: 200.0
InsufficientFundsException: Balance 700.0 is less than 900.0`,
      explanation:
        'After the first withdrawal the balance is 700.0. Withdrawing 900 throws the custom exception carrying shortBy = 200.0; the third call never runs. toString() prints the class name (no package because we used the default package) and the message.',
    },
    {
      title: 'Custom Unchecked Exception and Exception Chaining',
      scenario: 'An order service validates quantity and wraps parsing errors into a business-level exception.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Order placed: 3 x Pen
Invalid: Quantity must be positive, got 0
Error: Bad quantity for Bag | cause: NumberFormatException`,
      explanation:
        'InvalidOrderException is unchecked, so validate() needs no throws clause. "two" cannot be parsed; the NumberFormatException is wrapped as the cause of OrderProcessingException and retrieved with getCause().',
    },
    {
      title: 'Custom Exception Hierarchy',
      scenario: 'A login module throws specific exceptions, but the UI wants a single catch for all application errors.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Welcome, admin
UserNotFoundException -> User not found: guest
InvalidPasswordException -> Invalid password`,
      explanation:
        'Both specific exceptions extend AppException, so catch (AppException e) handles both, while getClass() still tells us the exact type.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between throw and throws?',
      a: 'throw is a statement inside a method that raises one exception object. throws is part of a method signature that declares the checked exceptions the method may pass to callers; it can list several classes.',
      level: 'Easy',
    },
    {
      q: 'How do you create a custom exception?',
      a: 'Create a class that extends Exception (checked) or RuntimeException (unchecked), provide constructors that call super(message) and optionally super(message, cause), and add any extra fields needed.',
      level: 'Easy',
    },
    {
      q: 'When should a custom exception be checked vs unchecked?',
      a: 'Checked when the caller can reasonably recover and you want the compiler to force handling (e.g. InsufficientFundsException in a batch). Unchecked for programming errors or when most callers cannot do anything useful; modern frameworks like Spring favour unchecked exceptions handled centrally.',
      level: 'Medium',
    },
    {
      q: 'Will this compile?\nvoid m() { throw new Exception("x"); }',
      a: 'No. Exception is checked, so m() must either catch it or declare throws Exception.',
      level: 'Easy',
    },
    {
      q: 'Will this compile?\nvoid m() { throw new RuntimeException("x"); System.out.println("after"); }',
      a: 'No. The println is unreachable after an unconditional throw, which is a compile error.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass MyEx extends Exception { MyEx(String m) { super(m); } }\ntry { throw new MyEx("Oops"); } catch (MyEx e) { System.out.println(e); }',
      a: 'Output: MyEx: Oops (default package). Throwable.toString() returns the class name followed by ": " and the message.',
      level: 'Medium',
    },
    {
      q: 'What is exception chaining?',
      a: 'Wrapping a caught exception as the cause of a new one: throw new ServiceException("msg", e). The cause is available via getCause() and appears as "Caused by:" in stack traces.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\ntry { throw null; } catch (Exception e) { System.out.println(e.getClass().getSimpleName()); }',
      a: 'Output: NullPointerException. throw null compiles, but at runtime the JVM throws a NullPointerException.',
      level: 'Hard',
    },
    {
      q: 'Can an overriding method declare a broader checked exception than the parent?',
      a: 'No. It may declare the same, a subclass, fewer or no checked exceptions (and any unchecked ones), but not new or broader checked exceptions.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nstatic void a() throws Exception { try { throw new Exception("A"); } finally { System.out.print("F "); } }\ntry { a(); } catch (Exception e) { System.out.print(e.getMessage()); }',
      a: 'Output: F A. The finally block runs while the exception propagates, then the caller catches it.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create InvalidMarksException (checked) and a grade() method that throws it for marks outside 0-100.',
      hint: 'grade(int marks) throws InvalidMarksException',
      solution: pr1,
    },
    {
      task: 'Create OutOfStockException (unchecked) and throw it when buying an item with zero stock.',
      hint: 'Extend RuntimeException; no throws clause needed.',
      solution: pr2,
    },
    {
      task: 'Wrap a NumberFormatException inside a custom DataAccessException and print both messages.',
      hint: 'super(msg, cause) and e.getCause().',
      solution: pr3,
    },
    {
      task: 'Write a password checker that throws WeakPasswordException with a reason.',
      hint: 'Check length first, then digits using Character.isDigit.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which keyword is used in the method signature to declare exceptions?',
      options: ['throw', 'throws', 'try', 'catch'],
      answer: 1,
      explanation: 'throws declares; throw raises.',
    },
    {
      question: 'To create a custom CHECKED exception you extend...',
      options: ['RuntimeException', 'Error', 'Exception', 'Throwable only'],
      answer: 2,
      explanation: 'Exception (but not RuntimeException) subclasses are checked.',
    },
    {
      question: 'What follows the throw keyword?',
      options: ['An exception object', 'A class name', 'A list of classes', 'A method'],
      answer: 0,
      explanation: 'throw new SomeException(...)',
    },
    {
      question: 'Which method returns the wrapped original exception?',
      options: ['getMessage()', 'getStackTrace()', 'getSuppressed()', 'getCause()'],
      answer: 3,
      explanation: 'getCause() returns the exception passed as cause.',
    },
    {
      question: 'A method throws an unchecked exception. Is a throws clause required?',
      options: ['Yes, always', 'No, it is optional', 'Only in main()', 'Only for static methods'],
      answer: 1,
      explanation: 'The compiler only enforces handling of checked exceptions.',
    },
  ],
};
