const ex1 = `import java.util.Map;
import java.util.Optional;

public class Main {
    static final Map<Integer, String> USERS = Map.of(1, "Riya", 2, "Aman");

    static Optional<String> findUser(int id) {
        return Optional.ofNullable(USERS.get(id));   // never return null
    }

    public static void main(String[] args) {
        Optional<String> u1 = findUser(1);
        Optional<String> u9 = findUser(9);

        System.out.println("u1 present: " + u1.isPresent());
        System.out.println("u9 empty: " + u9.isEmpty());
        System.out.println("orElse: " + u9.orElse("Guest"));
        System.out.println("orElseGet: " + u9.orElseGet(() -> "Generated-Guest"));
        System.out.println("map: " + u1.map(String::toUpperCase).orElse("NONE"));
        System.out.println("filter: " + u1.filter(n -> n.startsWith("Z")).orElse("no match"));

        u1.ifPresent(name -> System.out.println("Welcome " + name));
        u9.ifPresentOrElse(
                name -> System.out.println("Welcome " + name),
                () -> System.out.println("User 9 not found"));

        try {
            u9.orElseThrow(() -> new IllegalArgumentException("Invalid id 9"));
        } catch (IllegalArgumentException e) {
            System.out.println("Exception: " + e.getMessage());
        }
    }
}`;

const ex2 = `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

record Point(int x, int y) {
    // compact constructor: validation
    Point {
        if (x < 0 || y < 0) throw new IllegalArgumentException("Negative coordinate");
    }
    double distanceFromOrigin() {
        return Math.sqrt(x * x + y * y);
    }
    static Point origin() { return new Point(0, 0); }
}

public class Main {
    public static void main(String[] args) {
        var p1 = new Point(3, 4);                 // var: type inferred as Point
        var p2 = new Point(3, 4);
        System.out.println(p1);                   // auto toString
        System.out.println("x = " + p1.x() + ", y = " + p1.y());   // accessors, no "get"
        System.out.println("equals: " + p1.equals(p2));
        System.out.println("same hashCode: " + (p1.hashCode() == p2.hashCode()));
        System.out.println("distance: " + p1.distanceFromOrigin());
        System.out.println("origin: " + Point.origin());

        try {
            new Point(-1, 5);
        } catch (IllegalArgumentException e) {
            System.out.println("Rejected: " + e.getMessage());
        }

        var list = new ArrayList<String>();       // ArrayList<String>
        list.add("var works with generics");
        for (var s : list) System.out.println(s);
        var counts = new HashMap<String, Integer>();
        counts.put("a", 1);
        System.out.println("var map size: " + counts.size());
    }
}`;

const ex3 = `public class Main {
    static String dayType(String day) {
        return switch (day) {
            case "SAT", "SUN" -> "Weekend";
            case "MON", "TUE", "WED", "THU", "FRI" -> "Weekday";
            default -> "Unknown";
        };
    }

    static int lettersIn(String day) {
        return switch (day) {
            case "MONDAY", "FRIDAY", "SUNDAY" -> 6;
            case "TUESDAY" -> 7;
            default -> {
                int len = day.length();
                yield len;                        // yield returns a value from a block
            }
        };
    }

    static String describe(Object obj) {          // pattern matching for switch (Java 21)
        return switch (obj) {
            case null -> "null value";
            case Integer i when i > 100 -> "big integer " + i;
            case Integer i -> "integer " + i;
            case String s -> "string of length " + s.length();
            default -> "something else";
        };
    }

    public static void main(String[] args) {
        System.out.println(dayType("SAT"));
        System.out.println(dayType("WED"));
        System.out.println(lettersIn("TUESDAY"));
        System.out.println(lettersIn("WEDNESDAY"));

        Object o = "Hello";
        if (o instanceof String s && s.length() > 3) {   // pattern matching for instanceof (Java 16)
            System.out.println("Pattern matched: " + s.toUpperCase());
        }
        System.out.println(describe(500));
        System.out.println(describe(7));
        System.out.println(describe("Java"));
        System.out.println(describe(null));
        System.out.println(describe(2.5));
    }
}`;

const ex4 = `sealed interface Shape permits Circle, Rectangle, Square { }

record Circle(double radius) implements Shape { }
record Rectangle(double width, double height) implements Shape { }
final class Square implements Shape {
    final double side;
    Square(double side) { this.side = side; }
}

public class Main {
    static double area(Shape shape) {
        // no default needed: the compiler knows every permitted subtype
        return switch (shape) {
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle r -> r.width() * r.height();
            case Square s -> s.side * s.side;
        };
    }

    public static void main(String[] args) {
        Shape[] shapes = { new Circle(1), new Rectangle(2, 3), new Square(4) };
        for (Shape s : shapes) {
            System.out.printf("%s area = %.2f%n", s.getClass().getSimpleName(), area(s));
        }

        String json = """
                {
                  "name": "Riya",
                  "course": "Java"
                }""";
        System.out.println(json);

        String sql = """
                SELECT id, name
                FROM students
                WHERE marks > %d""".formatted(80);
        System.out.println(sql);
        System.out.println("Lines in sql: " + sql.lines().count());
    }
}`;

export default {
  id: 'day-41-modern-java-features',
  title: 'Optional, var, Records, Text Blocks, Switch Expressions, Sealed Classes (Modern Java 17/21)',
  module: 'Module 7: Java 8+ Features',
  day: 41,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Modern Java (8 to 21) added features that remove boilerplate and prevent bugs. Learn Optional to avoid NullPointerException, var for local type inference, records for data classes, text blocks for multi-line strings, switch expressions with pattern matching, and sealed classes.',
  objectives: [
    'Use Optional correctly instead of returning null',
    'Use var for local variables and know its limits',
    'Create immutable data classes with records and compact constructors',
    'Write text blocks, switch expressions with arrow labels and yield',
    'Model closed hierarchies with sealed classes and pattern matching switch',
  ],
  theory: [
    {
      heading: 'Optional (Java 8)',
      content: 'NullPointerException is the most common Java crash. Optional<T> is a box that either contains a value or is empty — like a gift box you must open and check before using. A method returning Optional clearly tells the caller "the result may be missing, handle it".',
      syntax: `Optional<String> a = Optional.of("x");          // value must not be null
Optional<String> b = Optional.ofNullable(maybe); // null -> empty
Optional<String> c = Optional.empty();

a.isPresent(); a.isEmpty();                      // isEmpty: Java 11
a.orElse("default");                             // always evaluates "default"
a.orElseGet(() -> compute());                    // lazy default
a.orElseThrow(() -> new NotFoundException());
a.map(String::length).filter(n -> n > 2);
a.ifPresent(System.out::println);
a.ifPresentOrElse(v -> ..., () -> ...);          // Java 9`,
      points: [
        'Use Optional as a RETURN type; avoid it for fields, method parameters and collections',
        'Never call get() without checking — prefer orElse/orElseThrow',
        'Optional.of(null) throws NullPointerException',
      ],
    },
    {
      heading: 'var — Local Variable Type Inference (Java 10)',
      content: 'var lets the compiler figure out the type from the right side, like a shopkeeper who knows the item is a "mobile phone" just by seeing it. Java is still statically typed: the type is fixed at compile time.',
      syntax: `var name = "Riya";                         // String
var list = new ArrayList<String>();       // ArrayList<String>
for (var e : map.entrySet()) { ... }`,
      points: [
        'Only for local variables with an initializer, loop variables and lambda params (Java 11)',
        'NOT allowed: fields, method parameters, return types, var x; (no initializer), var x = null;',
        'var is a reserved type name, not a keyword — you can still have a variable called var',
        'Use when the type is obvious; avoid when it hides meaning (var result = service.process();)',
      ],
    },
    {
      heading: 'Records (Java 16)',
      content: 'A record is a compact way to declare an immutable data carrier, like a printed ID card: fixed fields, cannot be edited. One line replaces constructor, getters, equals(), hashCode() and toString().',
      syntax: `record Student(int id, String name) { }
// auto-generated: private final fields, canonical constructor,
// accessors id() and name(), equals, hashCode, toString

record Point(int x, int y) {
    Point {                                  // compact constructor for validation
        if (x < 0) throw new IllegalArgumentException();
    }
    double dist() { return Math.sqrt(x * x + y * y); }
}`,
      points: [
        'Records are implicitly final and extend java.lang.Record — cannot extend other classes',
        'Can implement interfaces, have static fields/methods, instance methods and extra constructors',
        'Cannot declare extra instance fields',
        'Perfect for DTOs, API responses, map keys and stream results',
      ],
    },
    {
      heading: 'Text Blocks and Switch Expressions',
      content: 'Text blocks (Java 15) are multi-line strings written between triple quotes """, perfect for JSON, SQL and HTML — no more "\\n" + concatenation. Switch expressions (Java 14) use arrow labels, return a value, never fall through, and must be exhaustive.',
      syntax: `String html = """
        <h1>Hello</h1>
        <p>Java</p>
        """;                       // indentation is stripped based on the closing quotes

String type = switch (day) {
    case "SAT", "SUN" -> "Weekend";
    default -> {
        String t = "Weekday";
        yield t;                   // yield returns a value from a block
    }
};`,
      points: [
        'Opening """ must be followed by a new line',
        'Arrow case: no break needed, no fall-through, multiple labels separated by commas',
        'A switch expression must cover all cases (default, or all enum constants / sealed subtypes)',
        'Pattern matching for instanceof (Java 16): if (obj instanceof String s) { s.length(); }',
        'Pattern matching for switch (Java 21): case Integer i when i > 10 -> ...; case null is allowed',
      ],
    },
    {
      heading: 'Sealed Classes and Interfaces (Java 17)',
      content: 'A sealed class controls exactly which classes may extend it — like a club with a fixed guest list. This lets the compiler know all possible subtypes, so a switch over them needs no default and the compiler warns you if you forget one.',
      syntax: `sealed interface Shape permits Circle, Rectangle, Square { }
record Circle(double r) implements Shape { }          // records are final
final class Square implements Shape { ... }
non-sealed class Rectangle implements Shape { ... }    // opens the hierarchy again`,
      points: [
        'Every permitted subclass must be final, sealed or non-sealed',
        'Permitted subclasses must be in the same module (or same package in the unnamed module)',
        'Sealed + records + pattern matching switch = algebraic data types in Java',
      ],
    },
  ],
  examples: [
    {
      title: 'Optional Instead of null',
      scenario: 'A user lookup service returns Optional so the caller must handle missing users.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the code', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `u1 present: true
u9 empty: true
orElse: Guest
orElseGet: Generated-Guest
map: RIYA
filter: no match
Welcome Riya
User 9 not found
Exception: Invalid id 9`,
      explanation: 'ofNullable turns a null map lookup into an empty Optional. map transforms the value only if present. filter turns a non-matching value into empty. orElseThrow lets you choose the exception for a missing value.',
    },
    {
      title: 'Records and var',
      scenario: 'A drawing app stores immutable points and validates that coordinates are not negative.',
      steps: ['Create Main.java', 'Declare record Point above Main', 'Run ▶ and compare with how many lines a normal class would need'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Point[x=3, y=4]
x = 3, y = 4
equals: true
same hashCode: true
distance: 5.0
origin: Point[x=0, y=0]
Rejected: Negative coordinate
var works with generics
var map size: 1`,
      explanation: 'The record auto-generates toString (Point[x=3, y=4]), accessors x() and y(), and value-based equals/hashCode, so two points with the same data are equal. The compact constructor runs validation before fields are assigned.',
    },
    {
      title: 'Switch Expressions, yield and Pattern Matching',
      scenario: 'Classify days and describe any object using modern switch.',
      steps: ['Create Main.java (requires Java 21 for pattern matching switch)', 'In IntelliJ: File > Project Structure > Language level 21', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Weekend
Weekday
7
9
Pattern matched: HELLO
big integer 500
integer 7
string of length 4
null value
something else`,
      explanation: 'Arrow labels never fall through. The default block uses yield to return "WEDNESDAY".length() = 9. Pattern matching binds a typed variable (i, s) directly, and the when guard adds a condition. Cases are checked top to bottom, so the guarded Integer case must come first.',
    },
    {
      title: 'Sealed Interface, Exhaustive Switch and Text Blocks',
      scenario: 'A geometry module has a fixed set of shapes, plus multi-line JSON and SQL strings.',
      steps: ['Create Main.java', 'Declare the sealed interface and its permitted types in the same file', 'Run ▶', 'Try adding a new Triangle class implementing Shape: compile error since it is not permitted'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Circle area = 3.14
Rectangle area = 6.00
Square area = 16.00
{
  "name": "Riya",
  "course": "Java"
}
SELECT id, name
FROM students
WHERE marks > 80
Lines in sql: 3`,
      explanation: 'Because Shape is sealed, the switch covers every permitted type and needs no default. Text blocks remove the common leading indentation; closing """ on the last content line means no trailing newline. formatted() works like String.format.',
    },
  ],
  interview: [
    { q: 'What is Optional and why was it introduced?', a: 'A container that may or may not hold a non-null value (Java 8). It makes absence explicit in APIs and reduces NullPointerException by forcing callers to handle the empty case.', level: 'Easy' },
    { q: 'orElse vs orElseGet?', a: 'orElse(value) always evaluates the argument, even when a value is present. orElseGet(supplier) calls the supplier only when empty — better for expensive defaults.', level: 'Medium' },
    { q: 'Optional.of vs Optional.ofNullable?', a: 'of(null) throws NullPointerException; ofNullable(null) returns Optional.empty().', level: 'Easy' },
    { q: 'Where can var be used?', a: 'Local variables with initializers, enhanced for/for loop variables, try-with-resources variables, and lambda parameters (Java 11). Not for fields, method params, return types or without an initializer.', level: 'Medium' },
    { q: 'Does var make Java dynamically typed?', a: 'No. The type is inferred at compile time and cannot change: var x = 10; x = "hi"; is a compile error.', level: 'Easy' },
    { q: 'What does a record generate automatically?', a: 'private final fields, a canonical constructor, accessor methods named after components, equals(), hashCode() and toString().', level: 'Easy' },
    { q: 'Can a record extend a class or have mutable fields?', a: 'No. Records implicitly extend java.lang.Record and are final; their component fields are final and you cannot add instance fields. They can implement interfaces.', level: 'Medium' },
    { q: 'What is the output? record P(int a) {} System.out.println(new P(5));', a: 'P[a=5]', level: 'Easy' },
    { q: 'Difference between switch statement and switch expression?', a: 'A switch expression returns a value, uses -> without fall-through (or yield in blocks) and must be exhaustive. A traditional statement executes code and falls through without break.', level: 'Medium' },
    { q: 'What is yield in switch?', a: 'It returns a value from a block inside a switch expression, e.g. default -> { int x = 5; yield x; }.', level: 'Medium' },
    { q: 'What are sealed classes and why use them?', a: 'Classes/interfaces that restrict which classes can extend/implement them via permits (Java 17). They model closed hierarchies and enable exhaustive pattern matching without default.', level: 'Hard' },
    { q: 'What modifiers must a permitted subclass have?', a: 'final, sealed or non-sealed. Records and enums are implicitly final.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write Optional<Integer> findIndex(String[] arr, String key) and print "Found at 2" or "Not found" using ifPresentOrElse.',
      hint: 'Loop and return Optional.of(i); after loop return Optional.empty().',
      solution: `import java.util.Optional;

public class Main {
    static Optional<Integer> findIndex(String[] arr, String key) {
        for (int i = 0; i < arr.length; i++) if (arr[i].equals(key)) return Optional.of(i);
        return Optional.empty();
    }
    public static void main(String[] args) {
        String[] fruits = {"apple", "mango", "kiwi"};
        findIndex(fruits, "kiwi").ifPresentOrElse(
            i -> System.out.println("Found at " + i), () -> System.out.println("Not found"));
        findIndex(fruits, "grape").ifPresentOrElse(
            i -> System.out.println("Found at " + i), () -> System.out.println("Not found"));
    }
}`,
    },
    {
      task: 'Create a record BankTransaction(String id, double amount, String type) that rejects amount <= 0 and has a method isCredit(). Print a list of transactions.',
      hint: 'Use a compact constructor for validation.',
      solution: `import java.util.List;

record BankTransaction(String id, double amount, String type) {
    BankTransaction {
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
    }
    boolean isCredit() { return type.equals("CREDIT"); }
}

public class Main {
    public static void main(String[] args) {
        var txns = List.of(new BankTransaction("T1", 500, "CREDIT"),
                           new BankTransaction("T2", 200, "DEBIT"));
        for (var t : txns) System.out.println(t + " credit=" + t.isCredit());
    }
}`,
    },
    {
      task: 'Write a switch expression that converts a month number (1-12) into its quarter ("Q1".."Q4") and throws for invalid input.',
      hint: 'case 1, 2, 3 -> "Q1"; ... default -> throw new IllegalArgumentException(...)',
      solution: `public class Main {
    static String quarter(int month) {
        return switch (month) {
            case 1, 2, 3 -> "Q1";
            case 4, 5, 6 -> "Q2";
            case 7, 8, 9 -> "Q3";
            case 10, 11, 12 -> "Q4";
            default -> throw new IllegalArgumentException("Invalid month: " + month);
        };
    }
    public static void main(String[] args) {
        System.out.println(quarter(5));  // Q2
        System.out.println(quarter(11)); // Q4
    }
}`,
    },
    {
      task: 'Create a sealed interface Payment permits Card, Upi, Cash (records) and a method fee(Payment p) using pattern matching switch: card 2%, UPI 0, cash 10 flat.',
      hint: 'case Card c -> c.amount() * 0.02; ...',
      solution: `sealed interface Payment permits Card, Upi, Cash { }
record Card(double amount) implements Payment { }
record Upi(double amount) implements Payment { }
record Cash(double amount) implements Payment { }

public class Main {
    static double fee(Payment p) {
        return switch (p) {
            case Card c -> c.amount() * 0.02;
            case Upi u -> 0;
            case Cash c -> 10;
        };
    }
    public static void main(String[] args) {
        System.out.println(fee(new Card(1000))); // 20.0
        System.out.println(fee(new Upi(1000)));  // 0.0
        System.out.println(fee(new Cash(1000))); // 10.0
    }
}`,
    },
  ],
  quiz: [
    { question: 'What does Optional.ofNullable(null).orElse("X") return?', options: ['null', 'X', 'Throws NullPointerException', 'Optional.empty'], answer: 1, explanation: 'ofNullable(null) is empty, so orElse returns "X".' },
    { question: 'Which use of var is INVALID?', options: ['var list = new ArrayList<String>();', 'for (var s : names) {}', 'var x;', 'var n = 10;'], answer: 2, explanation: 'var needs an initializer to infer the type.' },
    { question: 'The accessor for record Student(String name) is:', options: ['getName()', 'name', 'getname()', 'name()'], answer: 3, explanation: 'Record accessors use the component name: name().' },
    { question: 'Which keyword returns a value from a block in a switch expression?', options: ['yield', 'return', 'break', 'give'], answer: 0, explanation: 'yield returns a value from a switch expression block.' },
    { question: 'A permitted subclass of a sealed class must be declared:', options: ['abstract only', 'final, sealed or non-sealed', 'static', 'private'], answer: 1, explanation: 'Each permitted subclass must choose one of these three modifiers (records are implicitly final).' },
  ],
};
