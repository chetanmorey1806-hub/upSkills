const ex1 = `enum Day { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

public class Main {
    public static void main(String[] args) {
        Day d = Day.SATURDAY;
        System.out.println("Today: " + d);
        System.out.println("Ordinal: " + d.ordinal());
        System.out.println("Name: " + d.name());

        Day x = Day.valueOf("MONDAY");
        System.out.println("valueOf works: " + (x == Day.MONDAY));

        String type = switch (d) {
            case SATURDAY, SUNDAY -> "Weekend";
            default -> "Weekday";
        };
        System.out.println("Type: " + type);
        System.out.println("Total days: " + Day.values().length);
        System.out.println("First: " + Day.values()[0] + ", Last: " + Day.values()[6]);

        try {
            Day.valueOf("monday");
        } catch (IllegalArgumentException e) {
            System.out.println("valueOf is case-sensitive!");
        }
    }
}`;

const ex2 = `enum Size {
    SMALL(100, "S"), MEDIUM(150, "M"), LARGE(200, "L");

    private final int price;
    private final String code;

    Size(int price, String code) {   // constructor is implicitly private
        this.price = price;
        this.code = code;
    }

    public int getPrice() { return price; }
    public String getCode() { return code; }
}

public class Main {
    public static void main(String[] args) {
        for (Size s : Size.values()) {
            System.out.println(s + " (" + s.getCode() + ") costs Rs." + s.getPrice());
        }
        Size order = Size.valueOf("LARGE");
        int qty = 3;
        System.out.println("Bill for " + qty + " " + order + ": Rs." + (order.getPrice() * qty));
    }
}`;

const ex3 = `enum Operation {
    PLUS("+") {
        public int apply(int a, int b) { return a + b; }
    },
    MINUS("-") {
        public int apply(int a, int b) { return a - b; }
    },
    TIMES("*") {
        public int apply(int a, int b) { return a * b; }
    },
    DIVIDE("/") {
        public int apply(int a, int b) { return a / b; }
    };

    private final String symbol;
    Operation(String symbol) { this.symbol = symbol; }
    public String getSymbol() { return symbol; }

    public abstract int apply(int a, int b);  // each constant must implement
}

public class Main {
    public static void main(String[] args) {
        int a = 20, b = 4;
        for (Operation op : Operation.values()) {
            System.out.println(a + " " + op.getSymbol() + " " + b + " = " + op.apply(a, b));
        }
    }
}`;

const ex4 = `import java.util.EnumMap;
import java.util.EnumSet;

enum Status { PENDING, SHIPPED, DELIVERED }

public class Main {
    public static void main(String[] args) {
        Status[] orders = {Status.SHIPPED, Status.PENDING, Status.DELIVERED,
                           Status.SHIPPED, Status.PENDING, Status.SHIPPED};

        EnumMap<Status, Integer> counts = new EnumMap<>(Status.class);
        for (Status s : orders) {
            counts.merge(s, 1, Integer::sum);
        }
        System.out.println("Counts: " + counts);

        EnumSet<Status> open = EnumSet.of(Status.PENDING, Status.SHIPPED);
        System.out.println("Open statuses: " + open);
        System.out.println("Is DELIVERED open? " + open.contains(Status.DELIVERED));
        System.out.println("All: " + EnumSet.allOf(Status.class));
        System.out.println("compareTo: " + Status.PENDING.compareTo(Status.DELIVERED));
    }
}`;

export default {
  id: 'day-32-enums',
  title: 'Enums',
  module: 'Module 5: Core APIs & Generics',
  day: 32,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Enums let you define a fixed set of named constants (like days of the week or order status) in a type-safe way. You will learn enum methods, fields, constructors, constant-specific behaviour, switch with enums, and EnumMap/EnumSet.',
  objectives: [
    'Explain why enums are better than int or String constants',
    'Use values(), valueOf(), ordinal(), name() and compareTo()',
    'Add fields, constructors and methods to an enum',
    'Write constant-specific method bodies and use enums in switch',
    'Use EnumMap and EnumSet for fast, ordered collections of enums',
  ],
  theory: [
    {
      heading: 'What is an Enum and Why Use It?',
      content: 'An enum (enumeration) is a special class that has a FIXED list of objects, decided at compile time. Think of a traffic light: it can be only RED, YELLOW or GREEN — never PURPLE. Before enums, programmers used int constants (static final int RED = 0;), which allowed nonsense like setLight(42). With an enum, the compiler allows only valid values.',
      syntax: `enum TrafficLight { RED, YELLOW, GREEN }

TrafficLight t = TrafficLight.RED;   // only these 3 values are possible
// TrafficLight x = 42;               // compile error - type safety!`,
      points: [
        'Keyword: enum. Constants are written in UPPER_CASE by convention',
        'Each constant is a public static final object of the enum type',
        'Enums implicitly extend java.lang.Enum, so they CANNOT extend another class',
        'Enums CAN implement interfaces',
        'Enums are compared safely with == (only one object per constant exists)',
      ],
    },
    {
      heading: 'Built-in Enum Methods',
      content: 'Every enum automatically gets useful methods from the compiler and from java.lang.Enum. Picture the constants sitting in numbered seats starting at 0: ordinal() tells the seat number.',
      points: [
        'values() — returns an array of all constants in declaration order',
        'valueOf(String) — converts text to constant; case-sensitive; throws IllegalArgumentException for unknown names',
        'ordinal() — position starting from 0',
        'name() — exact constant name; toString() returns the same by default but can be overridden',
        'compareTo() — compares by ordinal (this.ordinal - other.ordinal)',
      ],
      tip: 'Never store ordinal() in a database. If someone inserts a new constant in the middle, all numbers shift. Store name() instead.',
    },
    {
      heading: 'Enums with Fields, Constructors and Methods',
      content: 'Enums are full classes. You can attach data to each constant, like a price tag attached to each coffee size. The constructor is always private (even if you do not write private) because nobody outside may create new constants. The constant list must be the FIRST thing in the enum body and ends with a semicolon when more code follows.',
      syntax: `enum Size {
    SMALL(100), MEDIUM(150), LARGE(200);   // calls constructor
    private final int price;
    Size(int price) { this.price = price; }
    public int getPrice() { return price; }
}`,
      points: [
        'new Size(300) is a compile error — enums cannot be instantiated with new',
        'Constructors run once per constant when the enum class is loaded',
        'Fields should usually be final (enum constants should be immutable)',
      ],
    },
    {
      heading: 'Constant-Specific Bodies, Abstract Methods and switch',
      content: 'Each constant can have its own body overriding a method, like each calculator button doing a different job. If the enum declares an abstract method, every constant must implement it. Enums work beautifully with switch: you write only the constant names (case RED, not case TrafficLight.RED, although Java 21 also allows the qualified form).',
      syntax: `String msg = switch (light) {
    case RED -> "Stop";
    case YELLOW -> "Wait";
    case GREEN -> "Go";
};   // no default needed: compiler knows all constants are covered`,
    },
    {
      heading: 'EnumMap, EnumSet and Singleton Enum',
      content: 'EnumMap is a Map whose keys are enum constants; internally it is just an array indexed by ordinal, so it is very fast and iterates in declaration order. EnumSet is a Set of enum constants stored as bits. An enum with a single constant (enum Config { INSTANCE; }) is the simplest thread-safe singleton and is safe against reflection and serialization attacks.',
      points: [
        'new EnumMap<>(Status.class) — needs the enum class',
        'EnumSet.of(A, B), EnumSet.allOf(X.class), EnumSet.noneOf(X.class), EnumSet.range(A, C)',
        'Both keep natural (declaration) order — output is predictable unlike HashMap',
      ],
    },
  ],
  examples: [
    {
      title: 'Basic Enum: values, valueOf, ordinal and switch',
      scenario: 'A calendar app needs to classify days as weekday or weekend.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Write the enum above the Main class in the same file (non-public)', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Today: SATURDAY
Ordinal: 5
Name: SATURDAY
valueOf works: true
Type: Weekend
Total days: 7
First: MONDAY, Last: SUNDAY
valueOf is case-sensitive!`,
      explanation: 'SATURDAY is the 6th constant, so ordinal is 5. valueOf("MONDAY") returns the same single object, so == is true. valueOf("monday") throws IllegalArgumentException because names are case-sensitive.',
    },
    {
      title: 'Enum with Fields and Constructor',
      scenario: 'A coffee shop stores the price and short code of each cup size inside the enum itself.',
      steps: ['Create Main.java', 'Add the Size enum with a constructor', 'Loop over Size.values()', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `SMALL (S) costs Rs.100
MEDIUM (M) costs Rs.150
LARGE (L) costs Rs.200
Bill for 3 LARGE: Rs.600`,
      explanation: 'Each constant calls the private constructor with its own data. Data lives with the constant, so there is no separate price table to keep in sync.',
    },
    {
      title: 'Constant-Specific Behaviour (Calculator)',
      scenario: 'A calculator where every operation knows how to compute itself — no if-else chain needed.',
      steps: ['Create Main.java', 'Declare an abstract method apply() in the enum', 'Give each constant its own body', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `20 + 4 = 24
20 - 4 = 16
20 * 4 = 80
20 / 4 = 5`,
      explanation: 'Because apply() is abstract, each constant must provide an implementation (otherwise compile error). Calling op.apply() runs the correct version — polymorphism with enums.',
    },
    {
      title: 'EnumMap and EnumSet for Order Statistics',
      scenario: 'An e-commerce dashboard counts orders by status and checks which statuses are still "open".',
      steps: ['Create Main.java', 'Import java.util.EnumMap and EnumSet', 'Run ▶ and note the predictable ordering'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Counts: {PENDING=2, SHIPPED=3, DELIVERED=1}
Open statuses: [PENDING, SHIPPED]
Is DELIVERED open? false
All: [PENDING, SHIPPED, DELIVERED]
compareTo: -2`,
      explanation: 'EnumMap prints keys in declaration order, not insertion order. merge(s, 1, Integer::sum) adds 1 to the existing count. compareTo returns 0 - 2 = -2 because PENDING has ordinal 0 and DELIVERED has ordinal 2.',
    },
  ],
  interview: [
    { q: 'What is an enum in Java?', a: 'A special class type representing a fixed set of constants. Each constant is a public static final instance. Enums implicitly extend java.lang.Enum and provide type safety.', level: 'Easy' },
    { q: 'Can an enum extend a class? Can it implement an interface?', a: 'It cannot extend any class because it already extends java.lang.Enum (Java has single inheritance). It can implement any number of interfaces.', level: 'Easy' },
    { q: 'Why is an enum constructor private?', a: 'So no code can create new constants at runtime. The constants are created only once when the enum is loaded. Declaring it public or protected is a compile error.', level: 'Medium' },
    { q: 'What is the output? enum Color {RED, GREEN, BLUE} System.out.println(Color.BLUE.ordinal() + " " + Color.valueOf("GREEN"));', a: '2 GREEN', level: 'Easy' },
    { q: 'What happens with Color.valueOf("Red")?', a: 'It throws IllegalArgumentException: No enum constant Color.Red, because valueOf is case-sensitive.', level: 'Easy' },
    { q: 'Can we use == to compare enums? Why?', a: 'Yes. Only one instance of each constant exists in the JVM, so == is safe, null-safe and faster than equals().', level: 'Medium' },
    { q: 'What is the difference between name() and toString()?', a: 'name() is final and always returns the exact declared name. toString() returns the same by default but can be overridden to give a friendly display value.', level: 'Medium' },
    { q: 'Why is enum the best way to implement a Singleton?', a: 'enum Singleton { INSTANCE; } is thread-safe by class loading, prevents multiple instances via reflection (Constructor.newInstance throws for enums) and handles serialization automatically.', level: 'Hard' },
    { q: 'What are EnumMap and EnumSet and why are they fast?', a: 'EnumMap stores values in an array indexed by ordinal; EnumSet stores constants as bits in a long (bit vector). Both avoid hashing, are very compact and iterate in declaration order.', level: 'Hard' },
    { q: 'Can an enum have abstract methods?', a: 'Yes. Then each constant must provide a body implementing it (constant-specific class body), otherwise compilation fails.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an enum Planet with constants MERCURY, EARTH, MARS and a field gravity (0.38, 1.0, 0.38). Print the weight of a 70 kg person on each planet.',
      hint: 'Add a constructor Planet(double gravity) and a method weight(double kg).',
      solution: `enum Planet {
    MERCURY(0.38), EARTH(1.0), MARS(0.38);
    private final double gravity;
    Planet(double gravity) { this.gravity = gravity; }
    double weight(double kg) { return kg * gravity; }
}

public class Main {
    public static void main(String[] args) {
        for (Planet p : Planet.values()) {
            System.out.printf("%s: %.2f kg%n", p, p.weight(70));
        }
    }
}`,
    },
    {
      task: 'Create enum TrafficLight with a method next() that returns the next light (RED -> GREEN -> YELLOW -> RED). Print 5 transitions starting from RED.',
      hint: 'Use a switch expression inside next().',
      solution: `enum TrafficLight {
    RED, GREEN, YELLOW;
    TrafficLight next() {
        return switch (this) {
            case RED -> GREEN;
            case GREEN -> YELLOW;
            case YELLOW -> RED;
        };
    }
}

public class Main {
    public static void main(String[] args) {
        TrafficLight t = TrafficLight.RED;
        for (int i = 0; i < 5; i++) {
            System.out.println(t);
            t = t.next();
        }
    }
}`,
    },
    {
      task: 'Write a safe method parseLevel(String text) that converts text like "high" to enum Level {LOW, MEDIUM, HIGH} ignoring case, and returns LOW for invalid input.',
      hint: 'Use Level.valueOf(text.toUpperCase()) inside try-catch(IllegalArgumentException).',
      solution: `enum Level { LOW, MEDIUM, HIGH }

public class Main {
    static Level parseLevel(String text) {
        try {
            return Level.valueOf(text.trim().toUpperCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            return Level.LOW;
        }
    }
    public static void main(String[] args) {
        System.out.println(parseLevel("high"));   // HIGH
        System.out.println(parseLevel("Medium")); // MEDIUM
        System.out.println(parseLevel("xyz"));    // LOW
    }
}`,
    },
    {
      task: 'Create a singleton enum AppConfig with a field appName and a method show(). Call it from main.',
      hint: 'enum AppConfig { INSTANCE; ... } and use AppConfig.INSTANCE.show().',
      solution: `enum AppConfig {
    INSTANCE;
    private String appName = "ShopApp";
    public String getAppName() { return appName; }
    public void show() { System.out.println("App: " + appName); }
}

public class Main {
    public static void main(String[] args) {
        AppConfig.INSTANCE.show();
        System.out.println(AppConfig.INSTANCE == AppConfig.valueOf("INSTANCE")); // true
    }
}`,
    },
  ],
  quiz: [
    { question: 'Every enum implicitly extends which class?', options: ['java.lang.Object only', 'java.lang.Enum', 'java.util.EnumMap', 'java.lang.Constant'], answer: 1, explanation: 'The compiler makes every enum extend java.lang.Enum (which extends Object).' },
    { question: 'What does ordinal() of the first constant return?', options: ['1', '-1', '0', 'Its name'], answer: 2, explanation: 'Ordinals start at 0.' },
    { question: 'Which is TRUE about enum constructors?', options: ['They can be public', 'They are implicitly private', 'They are called with new', 'They must be static'], answer: 1, explanation: 'Enum constructors are always private; constants are created automatically.' },
    { question: 'What does Color.valueOf("PINK") do if PINK is not a constant?', options: ['Returns null', 'Returns the first constant', 'Compile error', 'Throws IllegalArgumentException'], answer: 3, explanation: 'valueOf throws IllegalArgumentException for unknown names at runtime.' },
    { question: 'In which order does an EnumMap iterate its keys?', options: ['Declaration (ordinal) order', 'Insertion order', 'Random order', 'Alphabetical order'], answer: 0, explanation: 'EnumMap is backed by an array indexed by ordinal, so it iterates in declaration order.' },
  ],
};
