const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. Generate methods: IntelliJ Alt+Insert > toString() / equals() and hashCode(); Eclipse Source > Generate toString() / Generate hashCode() and equals()',
  'Click Run ▶ and compare the output',
];

const ex1 = `class Circle {
    static final double PI = 3.14;    // constant: one copy, cannot change
    final int id;                     // blank final: must be set in EVERY constructor
    final double radius;

    Circle(int id, double radius) {
        this.id = id;
        this.radius = radius;
    }

    double area() {
        return PI * radius * radius;
    }
}

public class Main {
    static int square(final int n) {  // final parameter: cannot be reassigned inside
        // n = 5;                     // compile error
        return n * n;
    }

    public static void main(String[] args) {
        final int MAX = 3;
        // MAX = 5;                   // compile error: cannot assign a value to final variable

        Circle c = new Circle(1, 2);
        System.out.println("Circle " + c.id + " area = " + c.area());

        final StringBuilder sb = new StringBuilder("Hi");
        sb.append(" there");          // allowed: the OBJECT can change
        // sb = new StringBuilder();  // compile error: the REFERENCE cannot change
        System.out.println(sb);

        final int[] arr = {1, 2, 3};
        arr[0] = 100;                 // allowed
        System.out.println(arr[0] + ", MAX = " + MAX + ", square = " + square(MAX));
    }
}`;

const ex2 = `import java.lang.reflect.Modifier;

class Bank {
    final double minBalance() {       // final method: cannot be overridden
        return 1000;
    }

    double rate() {
        return 6.0;
    }
}

class SBI extends Bank {
    // double minBalance() { return 0; }   // compile error: overridden method is final

    @Override
    double rate() {
        return 6.5;
    }
}

final class Utility {                 // final class: cannot be extended
    static int twice(int x) {
        return 2 * x;
    }
}

// class MyUtil extends Utility { }   // compile error: cannot inherit from final Utility

public class Main {
    public static void main(String[] args) {
        Bank b = new SBI();
        System.out.println("Min balance: " + b.minBalance());
        System.out.println("Rate: " + b.rate());
        System.out.println("Twice 21 = " + Utility.twice(21));
        System.out.println("String is final? " + Modifier.isFinal(String.class.getModifiers()));
    }
}`;

const ex3 = `class Product {
    String name;
    double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    @Override
    public String toString() {
        return "Product{name='" + name + "', price=" + price + "}";
    }
}

class NoToString {
    int x = 5;
}

public class Main {
    public static void main(String[] args) {
        Product p = new Product("Laptop", 55000.0);
        System.out.println(p);                 // println calls p.toString()
        System.out.println("Item: " + p);      // concatenation also calls toString()

        NoToString n = new NoToString();
        String s = n.toString();               // Object's version: ClassName@hexHashCode
        System.out.println(s.startsWith("NoToString@"));
    }
}`;

const ex4 = `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Student {
    int roll;
    String name;

    Student(int roll, String name) {
        this.roll = roll;
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;                              // same object
        if (o == null || getClass() != o.getClass()) return false;
        Student s = (Student) o;
        return roll == s.roll && Objects.equals(name, s.name);  // compare content
    }

    @Override
    public int hashCode() {
        return Objects.hash(roll, name);       // equal objects -> equal hash codes
    }
}

class Point {                                  // does NOT override equals/hashCode
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Student a = new Student(1, "Anu");
        Student b = new Student(1, "Anu");
        Student c = new Student(2, "Anu");

        System.out.println(a == b);
        System.out.println(a.equals(b));
        System.out.println(a.equals(c));
        System.out.println(a.hashCode() == b.hashCode());

        Set<Student> set = new HashSet<>();
        set.add(a);
        set.add(b);
        set.add(c);
        System.out.println("Unique students: " + set.size());

        Point p1 = new Point(1, 2);
        Point p2 = new Point(1, 2);
        System.out.println(p1.equals(p2));     // Object.equals is == by default
        Set<Point> points = new HashSet<>();
        points.add(p1);
        points.add(p2);
        System.out.println("Points in set: " + points.size());
    }
}`;

const ex5 = `import java.util.Objects;

public class Main {
    public static void main(String[] args) {
        System.out.println("abc".hashCode());
        System.out.println("Aa".hashCode() + " " + "BB".hashCode());
        System.out.println("Aa".equals("BB"));          // same hash, NOT equal: a collision
        System.out.println(Integer.valueOf(42).hashCode());
        System.out.println(Boolean.TRUE.hashCode());
        System.out.println(new String("hi").equals("hi"));
        System.out.println(Objects.equals(null, null));
        System.out.println(Objects.hash(1, 2));
    }
}`;

const pr1 = `final class Config {
    private static final String APP_NAME;
    static {
        APP_NAME = "Inventory";     // static blank final set in a static block
    }
    static String name() { return APP_NAME; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Config.name());   // Inventory
    }
}`;

const pr2 = `import java.util.Objects;

class Book {
    String isbn;
    String title;

    Book(String isbn, String title) { this.isbn = isbn; this.title = title; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Book)) return false;
        return Objects.equals(isbn, ((Book) o).isbn);    // books equal if ISBN equal
    }

    @Override
    public int hashCode() { return Objects.hash(isbn); }

    @Override
    public String toString() { return title + " [" + isbn + "]"; }
}

public class Main {
    public static void main(String[] args) {
        Book b1 = new Book("978-1", "Java Basics");
        Book b2 = new Book("978-1", "Java Basics 2nd print");
        System.out.println(b1.equals(b2));   // true
        System.out.println(b1);              // Java Basics [978-1]
    }
}`;

const pr3 = `import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

class Employee {
    final int id;
    final String name;
    Employee(int id, String name) { this.id = id; this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Employee e = (Employee) o;
        return id == e.id;
    }

    @Override
    public int hashCode() { return Objects.hash(id); }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> list = new ArrayList<>();
        list.add(new Employee(7, "Sam"));
        // contains() and indexOf() use equals()
        System.out.println(list.contains(new Employee(7, "Samuel")));   // true
        System.out.println(list.indexOf(new Employee(8, "Sam")));       // -1
    }
}`;

const pr4 = `class Temperature {
    private final double celsius;
    Temperature(double celsius) { this.celsius = celsius; }
    Temperature plus(double d) { return new Temperature(celsius + d); }  // returns new object

    @Override
    public String toString() { return celsius + " C"; }
}

public class Main {
    public static void main(String[] args) {
        Temperature t1 = new Temperature(20.5);
        Temperature t2 = t1.plus(4);
        System.out.println(t1 + " -> " + t2);   // 20.5 C -> 24.5 C
    }
}`;

export default {
  id: 'day-24-final-object-methods',
  title: 'final Keyword and Object Class Methods: toString(), equals(), hashCode()',
  module: 'Module 3: Object-Oriented Programming',
  day: 24,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Use final to lock variables, methods and classes, and learn to override the three most important java.lang.Object methods (toString, equals and hashCode) correctly, including the equals-hashCode contract used by HashSet and HashMap.',
  objectives: [
    'Apply final to variables, parameters, methods and classes',
    'Explain why a final reference does not make the object immutable',
    'Override toString() for readable output',
    'Override equals() and hashCode() correctly and explain their contract',
  ],
  theory: [
    {
      heading: 'final Variables',
      content:
        'A final variable can be assigned only once. Analogy: writing with a permanent marker; once written, you cannot erase it. For primitives the value is fixed; for references, the reference cannot point to another object, but the object\'s contents can still change (final StringBuilder sb can still append).',
      points: [
        'final local variable: assign once (can be assigned later, but only once).',
        'Blank final instance variable: not initialized at declaration; must be set in every constructor (or instance block).',
        'static final: a constant, set at declaration or in a static block. Naming: MAX_SIZE.',
        'final parameter: cannot be reassigned inside the method.',
        'Variables used inside lambdas and anonymous classes must be final or effectively final.',
      ],
    },
    {
      heading: 'final Methods and final Classes',
      content:
        'A final method cannot be overridden by subclasses; use it when the behaviour must stay exactly the same (e.g. security checks, template methods). A final class cannot be extended at all. String, Integer and all wrapper classes, Math and System are final: nobody can create a fake String subclass that behaves differently.',
      points: [
        'A final method is still inherited and can be overloaded, just not overridden.',
        'abstract and final can never be combined.',
        'Constructors cannot be final (they are not inherited anyway).',
      ],
      tip: 'final vs finally vs finalize: final is a keyword (constant/no override/no inheritance); finally is the block after try that always runs; finalize() was an Object method called by GC before collection, deprecated since Java 9.',
    },
    {
      heading: 'java.lang.Object: the Root Class',
      content:
        'Every class directly or indirectly extends Object, so every object has these methods: toString(), equals(Object), hashCode(), getClass(), clone() (protected), finalize() (deprecated), and the thread methods wait(), notify(), notifyAll().',
    },
    {
      heading: 'toString()',
      content:
        'toString() returns a text representation of the object. It is called automatically by println(obj) and by string concatenation ("Item: " + obj). The default version prints ClassName@hexadecimalHashCode (e.g. Product@1b6d3586), which is not useful, so override it for logging and debugging.',
      syntax: `@Override
public String toString() {
    return "Product{name='" + name + "', price=" + price + "}";
}`,
    },
    {
      heading: 'equals() vs ==',
      content:
        '== compares references: are both variables pointing to the very same object? equals() compares meaning/content, but Object\'s default equals() is just ==. Override it so two Student objects with the same roll and name are considered equal. Analogy: two printed copies of the same book are equal in content (equals) but are two different physical books (==).',
      points: [
        'Reflexive: a.equals(a) is true.',
        'Symmetric: a.equals(b) == b.equals(a).',
        'Transitive: a = b and b = c means a = c.',
        'Consistent: same result on repeated calls if nothing changed.',
        'a.equals(null) must return false (never throw).',
        'Parameter type must be Object: equals(Student s) is an overload, not an override, and will not be used by collections.',
      ],
    },
    {
      heading: 'hashCode() and the Contract',
      content:
        'hashCode() returns an int used by hash-based collections (HashSet, HashMap) to choose a bucket. Contract: if a.equals(b) is true, then a.hashCode() must equal b.hashCode(). The reverse is not required: two unequal objects may share a hash code (a collision, e.g. "Aa" and "BB" both hash to 2112). If you override equals() but not hashCode(), equal objects land in different buckets, and HashSet will keep "duplicates" and HashMap.get() will fail to find keys.',
      points: [
        'Always override equals() and hashCode() together, using the same fields.',
        'Objects.hash(f1, f2, ...) and Objects.equals(a, b) make it easy and null-safe.',
        'Fields used in hashCode should not change while the object is inside a HashSet/HashMap.',
        'Records (Java 16+) generate equals, hashCode and toString automatically.',
      ],
    },
  ],
  examples: [
    {
      title: 'final Variables, Blank Finals and Final References',
      scenario: 'A geometry app uses a constant PI, ids that never change after creation, and shows what final really protects.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Circle 1 area = 12.56
Hi there
100, MAX = 3, square = 9`,
      explanation:
        'id and radius are blank finals set in the constructor. 3.14 * 2 * 2 = 12.56. A final reference cannot be reassigned, but the StringBuilder and the array contents can change.',
    },
    {
      title: 'final Methods and final Classes',
      scenario: 'A bank fixes the minimum balance rule for all banks but lets each bank choose its interest rate.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Min balance: 1000.0
Rate: 6.5
Twice 21 = 42
String is final? true`,
      explanation:
        'minBalance() is final so SBI inherits it unchanged (1000 widened to 1000.0). rate() is overridden. Utility is a final class. Modifier.isFinal confirms that String is declared final.',
    },
    {
      title: 'Overriding toString()',
      scenario: 'Logging a product should show its data instead of a cryptic hash.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Product{name='Laptop', price=55000.0}
Item: Product{name='Laptop', price=55000.0}
true`,
      explanation:
        'println(p) and "Item: " + p both call the overridden toString(). For a class without toString(), the default text starts with the class name followed by @ and a hex hash code (the exact hash differs per run, so we only check the prefix).',
    },
    {
      title: 'equals() and hashCode() with HashSet',
      scenario: 'A school system must treat two Student objects with the same roll and name as the same student.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `false
true
false
true
Unique students: 2
false
Points in set: 2`,
      explanation:
        'a and b are different objects (== false) but equal in content. Equal objects have equal hash codes, so HashSet keeps only one of them; c differs by roll, so the set size is 2. Point does not override equals/hashCode, so two identical-looking points are different objects and both stay in the set.',
    },
    {
      title: 'Hash Codes of Built-in Classes and Collisions',
      scenario: 'Understand how String and wrapper classes implement hashCode and why equal hash does not mean equal objects.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `96354
2112 2112
false
42
1231
true
true
994`,
      explanation:
        'String hash = s[0]*31^(n-1) + ... + s[n-1]: "abc" = 97*961 + 98*31 + 99 = 96354. "Aa" = 65*31+97 = 2112 and "BB" = 66*31+66 = 2112: a collision, yet equals() is false. Integer hash is its value; Boolean.TRUE hash is 1231. Objects.hash(1, 2) = (31*(31*1+1))+2 = 31*32+2 = 994.',
    },
  ],
  interview: [
    {
      q: 'Explain final with variables, methods and classes.',
      a: 'final variable: value/reference assigned only once. final method: cannot be overridden. final class: cannot be extended (e.g. String, Integer).',
      level: 'Easy',
    },
    {
      q: 'What is the difference between final, finally and finalize?',
      a: 'final is a modifier for constants and preventing override/inheritance. finally is a block that runs after try/catch regardless of exceptions. finalize() was a method called by the GC before reclaiming an object; deprecated since Java 9 and should not be used.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nfinal List<String> list = new ArrayList<>(); list.add("A"); list.add("B"); System.out.println(list);',
      a: 'Output: [A, B]. final prevents reassigning list, not modifying the list object.',
      level: 'Easy',
    },
    {
      q: 'What is a blank final variable?',
      a: 'A final field not initialized at declaration. An instance blank final must be assigned in every constructor (or an instance block); a static blank final must be assigned in a static block. Otherwise compile error.',
      level: 'Medium',
    },
    {
      q: 'What is the equals() and hashCode() contract?',
      a: 'If two objects are equal by equals(), they must return the same hashCode(). Unequal objects may share a hash code. hashCode must be consistent while the fields used do not change.',
      level: 'Medium',
    },
    {
      q: 'What happens if you override equals() but not hashCode()?',
      a: 'Equal objects usually get different identity hash codes, so HashSet may store both "duplicates" and HashMap.get() with an equal key usually returns null. The contract is broken.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass P { int x; P(int x) { this.x = x; } }\nP a = new P(1), b = new P(1);\nSystem.out.println(a == b); System.out.println(a.equals(b));',
      a: 'Output: false then false. P does not override equals(), so Object.equals() compares references.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nSystem.out.println("Aa".hashCode() == "BB".hashCode());\nSystem.out.println("Aa".equals("BB"));',
      a: 'Output: true then false. Both strings hash to 2112 (a collision), but their content is different.',
      level: 'Hard',
    },
    {
      q: 'Why is String final?',
      a: 'Security (class names, file paths, URLs, DB credentials cannot be altered by a malicious subclass), safe string pool sharing, thread safety, and the hashCode can be cached because the content never changes.',
      level: 'Medium',
    },
    {
      q: 'What does the default toString() return?',
      a: 'getClass().getName() + "@" + Integer.toHexString(hashCode()), e.g. Product@1b6d3586.',
      level: 'Easy',
    },
    {
      q: 'Why should equals take Object as the parameter type?',
      a: 'Object.equals(Object) is the method to override. equals(Student s) only overloads it, so collections (which call equals(Object)) still use the default reference comparison.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'Create a final Config class with a private static final field initialized in a static block.',
      hint: 'A static blank final must be assigned exactly once in a static block.',
      solution: pr1,
    },
    {
      task: 'Create a Book class where two books are equal if their ISBN is equal. Override equals, hashCode and toString.',
      hint: 'Use Objects.equals and Objects.hash.',
      solution: pr2,
    },
    {
      task: 'Show that List.contains() and indexOf() rely on equals().',
      hint: 'Search for a new Employee object with the same id.',
      solution: pr3,
    },
    {
      task: 'Create an immutable Temperature with a final field, a plus() method that returns a new object, and a toString().',
      hint: 'Never modify the final field; create a new object.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which of these classes is final?',
      options: ['ArrayList', 'Object', 'String', 'Number'],
      answer: 2,
      explanation: 'String (and all wrapper classes) are final.',
    },
    {
      question: 'final int[] a = {1, 2}; Which line compiles?',
      options: ['a[0] = 5;', 'a = new int[3];', 'a = null;', 'None'],
      answer: 0,
      explanation: 'The array content can change; the reference cannot.',
    },
    {
      question: 'If a.equals(b) is true, then...',
      options: ['a == b must be true', 'a.hashCode() must equal b.hashCode()', 'hash codes must differ', 'a.toString() must equal b.toString()'],
      answer: 1,
      explanation: 'This is the equals-hashCode contract.',
    },
    {
      question: 'Which Object method is called by System.out.println(obj)?',
      options: ['hashCode()', 'getClass()', 'equals()', 'toString()'],
      answer: 3,
      explanation: 'println uses String.valueOf(obj), which calls obj.toString().',
    },
    {
      question: 'A final method can be...',
      options: ['overridden', 'inherited and overloaded', 'abstract', 'declared without a body'],
      answer: 1,
      explanation: 'final only blocks overriding.',
    },
  ],
};
