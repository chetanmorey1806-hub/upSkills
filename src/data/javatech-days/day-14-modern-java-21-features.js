const ex1 = `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        // 1. Start a single virtual thread with the builder API
        Thread vt = Thread.ofVirtual().name("worker-1").start(() ->
                System.out.println("Hello from " + Thread.currentThread().getName()
                        + ", virtual = " + Thread.currentThread().isVirtual()));
        vt.join();                                   // wait, so output order is fixed

        // 2. A normal (platform) thread for comparison
        Thread pt = Thread.ofPlatform().name("platform-1").start(() ->
                System.out.println("Hello from " + Thread.currentThread().getName()
                        + ", virtual = " + Thread.currentThread().isVirtual()));
        pt.join();

        // 3. 10,000 blocking tasks, one virtual thread per task
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int i = 1; i <= 10_000; i++) {
                int n = i;
                futures.add(executor.submit(() -> {
                    Thread.sleep(10);                // simulates a DB/API call
                    return n;
                }));
            }
            long sum = 0;
            for (Future<Integer> f : futures) sum += f.get();   // read results in submit order
            System.out.println("Tasks finished: " + futures.size());
            System.out.println("Sum of results: " + sum);
        }                                            // close() waits for all tasks
    }
}`;

const ex2 = `public class Main {
    static String describe(Object obj) {
        return switch (obj) {
            case null -> "null value";
            case Integer i when i > 100 -> "Big integer " + i;     // guarded pattern
            case Integer i -> "Integer " + i;
            case String s when s.isBlank() -> "Blank string";
            case String s -> "String of length " + s.length();
            case int[] arr -> "int array of size " + arr.length;
            default -> "Other: " + obj.getClass().getSimpleName();
        };
    }

    public static void main(String[] args) {
        Object o = "Hello Java";
        // Old way: if (o instanceof String) { String s = (String) o; ... }
        if (o instanceof String s && s.length() > 5) {
            System.out.println("Pattern matching instanceof: " + s.toUpperCase());
        }

        Object[] values = {42, 500, "Pune", "  ", new int[]{1, 2, 3}, 3.14, null};
        for (Object v : values) {
            System.out.println(describe(v));
        }
    }
}`;

const ex3 = `import java.util.List;

sealed interface Shape permits Circle, Rectangle, Square {}
record Circle(double radius) implements Shape {}
record Rectangle(double length, double width) implements Shape {}
record Square(double side) implements Shape {}

record Point(int x, int y) {}
record Line(Point start, Point end) {}

public class Main {
    static double area(Shape shape) {
        return switch (shape) {                       // exhaustive: no default needed
            case Circle c -> Math.PI * c.radius() * c.radius();
            case Rectangle(double l, double w) -> l * w;         // record pattern
            case Square(double side) -> side * side;
        };
    }

    static String lineInfo(Object o) {
        if (o instanceof Line(Point(var x1, var y1), Point(var x2, var y2))) {   // nested record pattern
            return "Line from (" + x1 + "," + y1 + ") to (" + x2 + "," + y2 + "), horizontal = " + (y1 == y2);
        }
        return "Not a line";
    }

    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Circle(2), new Rectangle(4, 5), new Square(3));
        for (Shape s : shapes) {
            System.out.println(s + " -> area " + String.format("%.2f", area(s)));
        }
        System.out.println(lineInfo(new Line(new Point(0, 5), new Point(10, 5))));
        System.out.println(lineInfo("hello"));
        System.out.println(new Point(3, 4));
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // SequencedCollection: List
        List<String> cities = new ArrayList<>(List.of("Pune", "Mumbai", "Delhi"));
        cities.addFirst("Chennai");
        cities.addLast("Kolkata");
        System.out.println("List: " + cities);
        System.out.println("First: " + cities.getFirst() + ", Last: " + cities.getLast());
        System.out.println("Reversed view: " + cities.reversed());

        // SequencedSet: LinkedHashSet
        LinkedHashSet<Integer> set = new LinkedHashSet<>(List.of(30, 10, 20));
        System.out.println("Set first: " + set.getFirst() + ", last: " + set.getLast());
        System.out.println("Set reversed: " + set.reversed());

        // SequencedMap: LinkedHashMap
        LinkedHashMap<String, Integer> marks = new LinkedHashMap<>();
        marks.put("Asha", 85);
        marks.put("Ravi", 72);
        marks.put("Neha", 91);
        marks.putFirst("Kiran", 66);
        System.out.println("Map: " + marks);
        System.out.println("First entry: " + marks.firstEntry());
        System.out.println("Last entry: " + marks.lastEntry());
        System.out.println("Polled: " + marks.pollLastEntry());
        System.out.println("Reversed map: " + marks.reversed());
    }
}`;

const ex5 = `import java.util.List;

sealed interface Payment permits Upi, Card, Cash {
    double amount();                  // every record below has an amount component
}
record Upi(String upiId, double amount) implements Payment {}
record Card(String last4, double amount, boolean international) implements Payment {}
record Cash(double amount) implements Payment {
    Cash {                            // compact constructor for validation
        if (amount <= 0) throw new IllegalArgumentException("Amount must be positive");
    }
}

public class Main {
    static String label(Payment p) {
        return switch (p) {
            case Upi u -> "UPI (" + u.upiId() + ")";
            case Card c when c.international() -> "International card ****" + c.last4();
            case Card c -> "Card ****" + c.last4();
            case Cash c -> "Cash";
        };
    }

    static double fee(Payment p) {
        return switch (p) {
            case Upi u -> 0;
            case Card(String last4, double amt, boolean intl) when intl -> amt * 0.035;
            case Card(String last4, double amt, boolean intl) -> amt * 0.02;
            case Cash c -> 0;
        };
    }

    public static void main(String[] args) {
        List<Payment> payments = List.of(
                new Upi("asha@okaxis", 1500),
                new Card("4321", 2000, false),
                new Card("9876", 1000, true),
                new Cash(500));

        double total = 0, totalFees = 0;
        for (Payment p : payments) {
            double f = fee(p);
            total += p.amount();
            totalFees += f;
            System.out.println(label(p) + " | amount=" + String.format("%.2f", p.amount())
                    + " | fee=" + String.format("%.2f", f));
        }
        System.out.println("Total fees = " + String.format("%.2f", totalFees));

        String report = """
                Payments processed: %d
                Total amount: %.2f
                """.formatted(payments.size(), total);
        System.out.print(report);

        try {
            new Cash(-10);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }
    }
}`;

export default {
  id: 'day-14-modern-java-21-features',
  title: 'Modern Java 21: Virtual Threads, Pattern Matching, Record Patterns, Sealed Types and Sequenced Collections',
  module: 'Module 4: Modern Java, JVM & Desktop',
  day: 14,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Java 21 is the current LTS used in new Spring Boot 3 projects. Learn its finalized features — virtual threads, pattern matching for switch, record patterns, sealed interfaces with exhaustive switch and sequenced collections — and how they make code shorter and safer.',
  objectives: [
    'Create virtual threads and use newVirtualThreadPerTaskExecutor for many blocking tasks',
    'Use pattern matching for instanceof and switch, including guards (when) and case null',
    'Deconstruct records with record patterns, including nested patterns',
    'Model a fixed set of types with sealed interfaces and write exhaustive switches without default',
    'Use getFirst, getLast, reversed, addFirst and putFirst from sequenced collections',
  ],
  theory: [
    {
      heading: 'Java Release Model and What "Finalized" Means',
      content: 'Since Java 9, a new Java version comes every 6 months, and every 2 years one becomes LTS (Long Term Support): Java 11, 17, 21, 25. Companies mostly use LTS versions. New features first arrive as "preview" (you must use --enable-preview and they may change or even be removed) and become "final" (standard) later. Only finalized features should be used in production code. For example, String Templates were previewed in Java 21 and 22 and then withdrawn — so they are NOT part of standard Java and we will not use them.',
      points: [
        'Java 17 (LTS) finalized: records, sealed classes, pattern matching for instanceof, switch expressions, text blocks',
        'Java 21 (LTS) finalized: virtual threads (JEP 444), pattern matching for switch (JEP 441), record patterns (JEP 440), sequenced collections (JEP 431)',
        'Spring Boot 3.2+ supports virtual threads with spring.threads.virtual.enabled=true',
        'Check your version with java -version; in IntelliJ set File > Project Structure > Project > SDK = 21 and Language level = 21',
        'In Eclipse: right-click project > Properties > Java Compiler > Compiler compliance level 21',
      ],
      tip: 'Interviewers love "What is new in Java 17 / 21?" — memorise the four Java 21 features above with one-line examples.',
    },
    {
      heading: 'Virtual Threads (Project Loom)',
      content: 'A normal (platform) Java thread is mapped 1-to-1 to an operating-system thread, which is costly (about 1 MB stack) — so a server can have only a few thousand. A virtual thread is a lightweight thread managed by the JVM. When it blocks (waiting for DB, HTTP call, sleep), the JVM parks it and frees the underlying carrier (OS) thread for other work. Analogy: platform threads are like having one dedicated waiter per table who stands idle while customers read the menu; virtual threads are like a few waiters serving hundreds of tables, attending whoever is ready.',
      syntax: `Thread.ofVirtual().start(() -> work());
Thread.startVirtualThread(() -> work());
try (var ex = Executors.newVirtualThreadPerTaskExecutor()) {
    ex.submit(() -> callApi());
}`,
      points: [
        'Best for I/O-bound tasks (REST calls, DB queries, file I/O) — "thread per request" style becomes scalable again',
        'Not faster for CPU-heavy work (calculations) — use a normal fixed pool there',
        'Do not pool virtual threads; create one per task, they are cheap (millions are possible)',
        'Thread.currentThread().isVirtual() tells which kind you are on',
        'Avoid long blocking inside synchronized blocks in Java 21 (it can "pin" the carrier thread); prefer ReentrantLock',
        'ThreadLocal works but is costly with millions of threads',
      ],
    },
    {
      heading: 'Pattern Matching for instanceof and switch',
      content: 'Earlier we wrote: if (obj instanceof String) { String s = (String) obj; ... } — test, then cast. Pattern matching does both in one step and gives a new variable. Java 21 brings the same to switch: you can switch on any object and match its TYPE, add conditions with "when", and handle null directly.',
      syntax: `if (obj instanceof String s && s.length() > 5) { use s }

String r = switch (obj) {
    case null                   -> "null";
    case Integer i when i > 100 -> "big " + i;
    case Integer i              -> "int " + i;
    case String s               -> "str " + s;
    default                     -> "other";
};`,
      points: [
        'The pattern variable (s, i) is in scope only where the match is guaranteed',
        'Order matters: a more specific case (guarded) must come before the general one, otherwise compile error "dominated"',
        'Without case null, switch on a null object throws NullPointerException',
        'Switch over Object needs default (or must be exhaustive) to compile',
      ],
    },
    {
      heading: 'Records and Record Patterns',
      content: 'A record is a compact immutable data carrier: record Point(int x, int y) {} automatically creates private final fields, a constructor, getters x() and y(), equals, hashCode and toString. Record patterns (Java 21) let you take a record apart — deconstruct it — directly inside instanceof or switch, even nested. Analogy: instead of opening a parcel and then taking each item out one by one, the parcel opens itself and hands you the items.',
      syntax: `record Point(int x, int y) {}
if (obj instanceof Point(int x, int y)) { System.out.println(x + y); }
if (obj instanceof Line(Point(var x1, var y1), Point p2)) { ... }   // nested, with var`,
      points: [
        'Records are final and fields are final — great for DTOs and API responses',
        'Compact constructor (no parameter list) is used for validation',
        'toString format: Point[x=3, y=4]',
        'You can use var inside record patterns to let the compiler infer types',
      ],
    },
    {
      heading: 'Sealed Interfaces/Classes + Exhaustive Switch',
      content: 'A sealed type lists exactly which classes may implement/extend it. The compiler then knows all possible subtypes, so a switch covering all of them needs no default. If someone later adds a new permitted type, every switch that misses it fails to compile — the compiler reminds you to handle it. Analogy: a payment form that only allows UPI, Card or Cash — the cashier knows every possible case.',
      syntax: `sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}     // records are implicitly final
final class Square implements Shape { ... }     // subclasses: final, sealed or non-sealed`,
      points: [
        'Permitted subclasses must be final, sealed or non-sealed',
        'They must be in the same module (or same package in the unnamed module)',
        'Sealed + records + pattern switch = "algebraic data types" in Java',
        'Great for modelling results (Success/Failure), payment types, shapes, events',
      ],
    },
    {
      heading: 'Sequenced Collections',
      content: 'Before Java 21, getting the last element was different for each type: list.get(list.size() - 1), deque.getLast(), and for LinkedHashSet there was no direct method. Java 21 adds SequencedCollection, SequencedSet and SequencedMap interfaces with uniform methods for collections that have a defined order.',
      syntax: `getFirst(), getLast(), addFirst(e), addLast(e), removeFirst(), removeLast(), reversed()
SequencedMap: firstEntry(), lastEntry(), pollFirstEntry(), pollLastEntry(), putFirst(k, v), putLast(k, v), reversed()`,
      points: [
        'Implemented by List (ArrayList, LinkedList), Deque, LinkedHashSet, TreeSet, LinkedHashMap, TreeMap',
        'reversed() returns a VIEW, not a copy — changes to the view affect the original',
        'HashSet and HashMap are NOT sequenced (no defined order)',
        'Immutable lists (List.of) throw UnsupportedOperationException for addFirst/removeLast',
      ],
    },
  ],
  examples: [
    {
      title: 'Virtual Threads: builder API and 10,000 concurrent tasks',
      scenario: 'A service must call a slow API for 10,000 orders. With platform threads you would need a big pool; with virtual threads each task gets its own thread cheaply.',
      steps: [
        'Make sure JDK 21 is selected: IntelliJ File > Project Structure > SDK 21; Eclipse: Window > Preferences > Java > Installed JREs',
        'Create Main.java and type the code',
        'Run it — 10,000 tasks that each sleep 10 ms finish in well under a second because they wait in parallel',
        'Change newVirtualThreadPerTaskExecutor() to Executors.newFixedThreadPool(10) and notice it takes about 10 seconds',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Hello from worker-1, virtual = true
Hello from platform-1, virtual = false
Tasks finished: 10000
Sum of results: 50005000`,
      explanation: 'join() makes main wait for each thread, so the two greeting lines always appear in this order. The executor creates one virtual thread per submitted task. Results are read in submit order using Future.get(), so the sum 1 + 2 + ... + 10000 = 50,005,000 is deterministic. try-with-resources calls close(), which waits for all tasks (ExecutorService is AutoCloseable since Java 19).',
    },
    {
      title: 'Pattern Matching for instanceof and switch',
      scenario: 'A logging utility receives values of any type and must describe them — without long if-else and casts.',
      steps: [
        'Create Main.java with the describe method using switch patterns',
        'Note the guarded cases (when) come before the general cases of the same type',
        'Run and check each line, including the null value',
        'Try moving case Integer i above case Integer i when i > 100 and read the compile error',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Pattern matching instanceof: HELLO JAVA
Integer 42
Big integer 500
String of length 4
Blank string
int array of size 3
Other: Double
null value`,
      explanation: 'instanceof String s both checks and casts, and s can be used in the same condition. In the switch, 500 matches the guarded case; "  " is blank; 3.14 is autoboxed to Double and reaches default; null is handled by case null instead of throwing NullPointerException.',
    },
    {
      title: 'Sealed Interface + Records + Record Patterns',
      scenario: 'A drawing app supports exactly three shapes. Compute areas with an exhaustive switch and deconstruct nested records.',
      steps: [
        'Create Main.java; put the sealed interface and records above the Main class in the same file',
        'Write area() with a switch that has no default',
        'Run the program',
        'Add record Triangle(double b, double h) implements Shape to permits and see the compiler complain that the switch is not exhaustive',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Circle[radius=2.0] -> area 12.57
Rectangle[length=4.0, width=5.0] -> area 20.00
Square[side=3.0] -> area 9.00
Line from (0,5) to (10,5), horizontal = true
Not a line
Point[x=3, y=4]`,
      explanation: 'new Circle(2) widens 2 to 2.0, and the record toString prints Circle[radius=2.0]. Circle area is PI x 4 = 12.566..., formatted to 12.57. Rectangle(double l, double w) pulls the components out directly. The nested pattern Line(Point(var x1, var y1), Point(var x2, var y2)) extracts four ints in one line; a String does not match, so "Not a line".',
    },
    {
      title: 'Sequenced Collections: first, last, reversed',
      scenario: 'Show a city list, a set of IDs and a marks register with uniform first/last methods.',
      steps: [
        'Create Main.java with ArrayList, LinkedHashSet and LinkedHashMap',
        'Use addFirst/addLast, getFirst/getLast, reversed(), putFirst and pollLastEntry',
        'Run on JDK 21 (these methods do not exist on Java 17)',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `List: [Chennai, Pune, Mumbai, Delhi, Kolkata]
First: Chennai, Last: Kolkata
Reversed view: [Kolkata, Delhi, Mumbai, Pune, Chennai]
Set first: 30, last: 20
Set reversed: [20, 10, 30]
Map: {Kiran=66, Asha=85, Ravi=72, Neha=91}
First entry: Kiran=66
Last entry: Neha=91
Polled: Neha=91
Reversed map: {Ravi=72, Asha=85, Kiran=66}`,
      explanation: 'LinkedHashSet keeps insertion order 30, 10, 20, so first is 30 and last is 20. putFirst places Kiran at the beginning of the LinkedHashMap. pollLastEntry removes and returns Neha=91, so the reversed map shows the remaining three entries from last to first.',
    },
    {
      title: 'Putting It Together: Payment Processing with Sealed Records',
      scenario: 'Calculate gateway fees for UPI, domestic card, international card and cash payments using guarded record patterns and a text block report.',
      steps: [
        'Create Main.java; define sealed interface Payment with abstract method amount()',
        'Each record has a component called amount, so its accessor automatically implements amount()',
        'Write label() and fee() switches — note guarded Card case before the general Card case',
        'Run and verify the fees: 2% of 2000 = 40, 3.5% of 1000 = 35',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `UPI (asha@okaxis) | amount=1500.00 | fee=0.00
Card ****4321 | amount=2000.00 | fee=40.00
International card ****9876 | amount=1000.00 | fee=35.00
Cash | amount=500.00 | fee=0.00
Total fees = 75.00
Payments processed: 4
Total amount: 5000.00
Error: Amount must be positive`,
      explanation: 'The switch is exhaustive because Payment is sealed with exactly three permitted records. For Card, the guard "when intl" catches international cards first. The text block keeps the multi-line template readable, and formatted() fills %d and %.2f. The compact constructor of Cash rejects -10.',
    },
  ],
  interview: [
    { q: 'What are the main finalized features of Java 21?', a: 'Virtual threads, pattern matching for switch, record patterns and sequenced collections (plus generational ZGC option). String templates were only preview and were later removed, so they are not standard Java.', level: 'Easy' },
    { q: 'What is a virtual thread and how is it different from a platform thread?', a: 'A platform thread wraps an OS thread (heavy, ~1 MB stack, limited to thousands). A virtual thread is a lightweight JVM-managed thread mounted on a small pool of carrier threads; when it blocks on I/O it unmounts, freeing the carrier. You can create millions. It improves throughput of I/O-bound code, not speed of CPU-bound code.', level: 'Medium' },
    { q: 'Should virtual threads be pooled?', a: 'No. They are cheap to create, so create one per task (newVirtualThreadPerTaskExecutor). To limit concurrency to a resource (e.g. DB with 20 connections), use a Semaphore instead of a small pool.', level: 'Hard' },
    { q: 'What is pinning in virtual threads?', a: 'When a virtual thread blocks inside a synchronized block or native method, it cannot unmount and stays "pinned" to its carrier thread, reducing scalability. In Java 21, prefer ReentrantLock for long blocking sections (Java 24 removed most synchronized pinning).', level: 'Hard' },
    { q: 'What does case Integer i when i > 100 mean?', a: 'It is a guarded type pattern: matches when the value is an Integer AND the condition i > 100 is true. The variable i is the already-cast Integer.', level: 'Easy' },
    { q: 'What happens if you switch on a null reference?', a: 'Traditionally switch throws NullPointerException. In Java 21 you can add case null -> ... to handle it explicitly; without it, NPE is still thrown.', level: 'Medium' },
    { q: 'What is a sealed class and why combine it with switch?', a: 'A class/interface that restricts which classes may extend/implement it using permits. Since the compiler knows all subtypes, a pattern switch can be exhaustive without default, and adding a new subtype causes compile errors where it is not handled — safer than default branches that silently swallow new cases.', level: 'Medium' },
    { q: 'What is a record pattern? Give an example.', a: 'A pattern that deconstructs a record into its components: if (o instanceof Point(int x, int y)) gives x and y directly. They can be nested: Line(Point(var x1, var y1), Point p2).', level: 'Medium' },
    { q: 'What are sequenced collections? Name three methods.', a: 'Java 21 interfaces (SequencedCollection, SequencedSet, SequencedMap) for collections with a defined encounter order. Methods: getFirst(), getLast(), addFirst(), addLast(), removeFirst(), removeLast(), reversed(); maps add firstEntry(), lastEntry(), putFirst(), pollLastEntry().', level: 'Easy' },
    { q: 'Output? List<Integer> l = new ArrayList<>(List.of(1,2,3)); l.reversed().addFirst(0); System.out.println(l);', a: '[1, 2, 3, 0]. reversed() is a view; adding first to the reversed view adds at the end of the original list.', level: 'Hard' },
    { q: 'How do you enable virtual threads in Spring Boot 3.2+?', a: 'Set spring.threads.virtual.enabled=true in application.properties (on Java 21). Tomcat and @Async tasks then run on virtual threads.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a sealed interface Vehicle with records Car(String model, int seats), Bike(String model) and Truck(String model, double loadTons). Write a toll(Vehicle v) method with a switch: Bike 20, Car 50 (or 80 if seats > 5), Truck 100 + 30 per ton.',
      hint: 'Use a guarded record pattern case Car(String m, int seats) when seats > 5.',
      solution: `import java.util.List;

sealed interface Vehicle permits Car, Bike, Truck {}
record Car(String model, int seats) implements Vehicle {}
record Bike(String model) implements Vehicle {}
record Truck(String model, double loadTons) implements Vehicle {}

public class Main {
    static double toll(Vehicle v) {
        return switch (v) {
            case Bike b -> 20;
            case Car(String m, int seats) when seats > 5 -> 80;
            case Car c -> 50;
            case Truck(String m, double tons) -> 100 + 30 * tons;
        };
    }

    public static void main(String[] args) {
        List<Vehicle> list = List.of(new Bike("Pulsar"), new Car("Swift", 5),
                new Car("Innova", 7), new Truck("Tata", 2.5));
        for (Vehicle v : list) System.out.println(v + " toll = " + toll(v));
        // Bike 20.0, Swift 50.0, Innova 80.0, Truck 175.0
    }
}`,
    },
    {
      task: 'Rewrite this old code using pattern matching for switch: if (o instanceof String) {...} else if (o instanceof Integer) {...} else if (o instanceof Double) {...} that returns the value doubled ("abab", 10, 5.0).',
      hint: 'case String s -> s.repeat(2); case Integer i -> i * 2; case Double d -> d * 2; default -> o.',
      solution: `public class Main {
    static Object doubleIt(Object o) {
        return switch (o) {
            case null -> "null";
            case String s -> s.repeat(2);
            case Integer i -> i * 2;
            case Double d -> d * 2;
            default -> o;
        };
    }

    public static void main(String[] args) {
        System.out.println(doubleIt("ab"));   // abab
        System.out.println(doubleIt(5));      // 10
        System.out.println(doubleIt(2.5));    // 5.0
        System.out.println(doubleIt(null));   // null
    }
}`,
    },
    {
      task: 'Use virtual threads to "fetch" prices of 5 products in parallel (each fetch sleeps 200 ms and returns id * 100). Print the total and the elapsed time (should be about 200 ms, not 1000 ms).',
      hint: 'Submit Callables to newVirtualThreadPerTaskExecutor, collect futures, then sum with get(). Use System.currentTimeMillis().',
      solution: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    static int fetchPrice(int id) throws InterruptedException {
        Thread.sleep(200);       // pretend REST call
        return id * 100;
    }

    public static void main(String[] args) throws Exception {
        long start = System.currentTimeMillis();
        try (ExecutorService ex = Executors.newVirtualThreadPerTaskExecutor()) {
            List<Future<Integer>> futures = new ArrayList<>();
            for (int id = 1; id <= 5; id++) {
                int pid = id;
                futures.add(ex.submit(() -> fetchPrice(pid)));
            }
            int total = 0;
            for (Future<Integer> f : futures) total += f.get();
            System.out.println("Total = " + total);              // 1500
        }
        System.out.println("Took ~" + (System.currentTimeMillis() - start) + " ms");  // about 200
    }
}`,
    },
    {
      task: 'Using sequenced collections, keep a "recently viewed products" list of max 3 items: when a product is viewed, remove it if present, addFirst it, and removeLast if size > 3. View: Phone, Laptop, Watch, Phone, Shoes.',
      hint: 'Use LinkedHashSet (SequencedSet) — remove(x), addFirst(x), removeLast().',
      solution: `import java.util.LinkedHashSet;

public class Main {
    public static void main(String[] args) {
        LinkedHashSet<String> recent = new LinkedHashSet<>();
        for (String p : new String[]{"Phone", "Laptop", "Watch", "Phone", "Shoes"}) {
            recent.remove(p);
            recent.addFirst(p);
            if (recent.size() > 3) recent.removeLast();
            System.out.println("Viewed " + p + " -> " + recent);
        }
        // last line: Viewed Shoes -> [Shoes, Phone, Watch]
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Which of these is NOT a finalized (standard) feature in Java 21?',
      options: ['Virtual threads', 'Record patterns', 'String templates', 'Sequenced collections'],
      answer: 2,
      explanation: 'String templates were only a preview feature and were later withdrawn. The other three are final in Java 21.',
    },
    {
      question: 'Virtual threads give the biggest benefit for which kind of task?',
      options: ['I/O-bound tasks like REST calls and DB queries', 'Heavy mathematical calculations', 'GUI rendering', 'Compiling code'],
      answer: 0,
      explanation: 'Virtual threads unmount while waiting on I/O, so many can wait concurrently. CPU-bound work is limited by the number of cores.',
    },
    {
      question: 'Why can a switch over a sealed interface omit the default branch?',
      options: ['Default is always optional in switch', 'Sealed types cannot be null', 'The JVM adds it automatically at runtime', 'The compiler knows all permitted subtypes, so the switch is exhaustive'],
      answer: 3,
      explanation: 'permits lists every allowed subtype, so covering all of them makes the switch exhaustive.',
    },
    {
      question: 'What does list.reversed() return in Java 21?',
      options: ['A new sorted copy', 'A reverse-ordered view of the same list', 'void, it reverses in place', 'An Iterator'],
      answer: 1,
      explanation: 'reversed() returns a view; changes through the view are reflected in the original list.',
    },
    {
      question: 'What is printed by: Object o = 7; String r = switch (o) { case Integer i when i > 5 -> "big"; case Integer i -> "small"; default -> "other"; }; System.out.println(r);',
      options: ['small', 'other', 'Compile error', 'big'],
      answer: 3,
      explanation: '7 is an Integer and 7 > 5, so the first guarded case matches.',
    },
  ],
};
