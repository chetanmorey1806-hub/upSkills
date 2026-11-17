const STEPS = [
  'IntelliJ: right-click src > New > Java Class > choose "Interface" for interfaces (Eclipse: File > New > Interface). For this demo everything can stay in Main.java',
  'Type the code; for implementing classes use Alt+Enter > Implement methods (Eclipse: Ctrl+1 > Add unimplemented methods)',
  'Click Run ▶ and compare the output',
];

const ex1 = `interface Payable {
    double GST = 0.18;              // implicitly public static final
    double amountDue();             // implicitly public abstract
}

class Invoice implements Payable {
    double items;

    Invoice(double items) {
        this.items = items;
    }

    @Override
    public double amountDue() {     // must be public
        return items + items * GST;
    }
}

class Salary implements Payable {
    @Override
    public double amountDue() {
        return 25000;
    }
}

public class Main {
    public static void main(String[] args) {
        Payable[] list = { new Invoice(1000), new Salary() };
        for (Payable p : list) {
            System.out.println(p.getClass().getSimpleName() + " due: " + p.amountDue());
        }
        System.out.println("GST rate: " + Payable.GST);
        // Payable.GST = 0.2;          // compile error: cannot assign a final variable
    }
}`;

const ex2 = `interface Camera {
    default void start() {
        System.out.println("Camera starting");
    }
    void click();
}

interface MusicPlayer {
    default void start() {
        System.out.println("Music player starting");
    }
    void play();
}

class SmartPhone implements Camera, MusicPlayer {     // multiple inheritance of type
    @Override
    public void click() {
        System.out.println("Photo clicked");
    }

    @Override
    public void play() {
        System.out.println("Playing song");
    }

    @Override
    public void start() {             // REQUIRED: both interfaces have default start()
        Camera.super.start();
        MusicPlayer.super.start();
        System.out.println("SmartPhone ready");
    }
}

public class Main {
    public static void main(String[] args) {
        SmartPhone phone = new SmartPhone();
        phone.start();
        phone.click();
        phone.play();

        Camera cam = phone;           // interface reference
        cam.click();
        System.out.println(cam instanceof MusicPlayer);
    }
}`;

const ex3 = `interface Shape {
    double area();

    default String describe() {                 // Java 8: default method
        return name() + " with area " + area();
    }

    private String name() {                     // Java 9: private helper method
        return getClass().getSimpleName();
    }

    static Shape unitSquare() {                 // Java 8: static factory method
        return new Square(1);
    }
}

interface Polygon extends Shape {               // interface extends interface
    int sides();
}

class Square implements Polygon {
    double s;

    Square(double s) {
        this.s = s;
    }

    @Override
    public double area() {
        return s * s;
    }

    @Override
    public int sides() {
        return 4;
    }
}

public class Main {
    public static void main(String[] args) {
        Polygon p = new Square(3);
        System.out.println(p.describe());
        System.out.println("Sides: " + p.sides());
        System.out.println(Shape.unitSquare().describe());   // static: call with interface name
    }
}`;

const ex4 = `@FunctionalInterface
interface Calculator {
    int compute(int a, int b);         // exactly ONE abstract method
}

public class Main {
    public static void main(String[] args) {
        // 1) anonymous class (old style)
        Calculator add = new Calculator() {
            @Override
            public int compute(int a, int b) {
                return a + b;
            }
        };

        // 2) lambda expressions (Java 8+)
        Calculator mul = (a, b) -> a * b;
        Calculator max = (a, b) -> a > b ? a : b;

        System.out.println(add.compute(6, 4));
        System.out.println(mul.compute(6, 4));
        System.out.println(max.compute(6, 4));

        Runnable r = () -> System.out.println("Runnable is a built-in functional interface");
        r.run();
    }
}`;

const ex5 = `interface NotificationSender {
    void send(String to, String msg);
}

class EmailSender implements NotificationSender {
    @Override
    public void send(String to, String msg) {
        System.out.println("Email to " + to + ": " + msg);
    }
}

class SmsSender implements NotificationSender {
    @Override
    public void send(String to, String msg) {
        System.out.println("SMS to " + to + ": " + msg);
    }
}

class OrderService {
    private final NotificationSender sender;     // depends on the INTERFACE

    OrderService(NotificationSender sender) {
        this.sender = sender;
    }

    void placeOrder(String customer) {
        System.out.println("Order placed for " + customer);
        sender.send(customer, "Your order is confirmed");
    }
}

public class Main {
    public static void main(String[] args) {
        new OrderService(new EmailSender()).placeOrder("riya@mail.com");
        new OrderService(new SmsSender()).placeOrder("9876543210");
    }
}`;

const pr1 = `interface Animal {
    String sound();
    default String intro() { return "I say " + sound(); }
}
class Dog implements Animal { public String sound() { return "Woof"; } }
class Cow implements Animal { public String sound() { return "Moo"; } }

public class Main {
    public static void main(String[] args) {
        Animal[] zoo = { new Dog(), new Cow() };
        for (Animal a : zoo) System.out.println(a.intro());
        // I say Woof
        // I say Moo
    }
}`;

const pr2 = `interface Flyable { default String move() { return "fly"; } }
interface Swimmable { default String move() { return "swim"; } }

class Duck implements Flyable, Swimmable {
    @Override
    public String move() {
        return Flyable.super.move() + " and " + Swimmable.super.move();
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Duck can " + new Duck().move());   // Duck can fly and swim
    }
}`;

const pr3 = `@FunctionalInterface
interface StringOp {
    String apply(String s);
}

public class Main {
    public static void main(String[] args) {
        StringOp upper = s -> s.toUpperCase();
        StringOp reverse = s -> new StringBuilder(s).reverse().toString();
        StringOp exclaim = s -> s + "!";
        System.out.println(upper.apply("java"));     // JAVA
        System.out.println(reverse.apply("java"));   // avaj
        System.out.println(exclaim.apply("java"));   // java!
    }
}`;

const pr4 = `interface Discount {
    double apply(double price);
    static Discount none() { return p -> p; }
    static Discount percent(double pct) { return p -> p - p * pct / 100; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Discount.none().apply(500));      // 500.0
        System.out.println(Discount.percent(10).apply(500)); // 450.0
    }
}`;

export default {
  id: 'day-23-interfaces',
  title: 'Interfaces, Default and Static Methods, Multiple Inheritance and Functional Interfaces',
  module: 'Module 3: Object-Oriented Programming',
  day: 23,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Define contracts with interfaces, use Java 8+ default, static and private interface methods, solve the diamond problem with Interface.super.method(), and get introduced to functional interfaces and lambdas.',
  objectives: [
    'Declare and implement interfaces and use interface references',
    'Use default, static and private methods inside interfaces',
    'Achieve multiple inheritance of type and resolve default-method conflicts',
    'Recognise functional interfaces and implement them with lambdas',
    'Compare interfaces with abstract classes',
  ],
  theory: [
    {
      heading: 'What is an Interface?',
      content:
        'An interface is a contract: a list of methods a class promises to provide. Analogy: a power socket standard. Any device with the right plug (implementing class) works with the socket, whether it is a phone charger or a laptop. Code that uses the interface does not care which brand of device is plugged in.',
      syntax: `interface Payable {
    double GST = 0.18;          // public static final
    double amountDue();         // public abstract
}
class Invoice implements Payable {
    public double amountDue() { ... }
}`,
      points: [
        'Fields are always public static final (constants).',
        'Abstract methods are implicitly public abstract; implementing methods MUST be public.',
        'An interface cannot have constructors or instance fields, and cannot be instantiated.',
        'A class uses implements; an interface uses extends to inherit other interfaces (can extend many).',
        'A class can extend one class AND implement many interfaces: class A extends B implements C, D.',
      ],
    },
    {
      heading: 'Default, Static and Private Methods (Java 8 / 9)',
      content:
        'Before Java 8 interfaces had only abstract methods. Adding a new method to an interface like List would have broken every implementing class in the world. Java 8 added default methods (with a body, inherited by implementers, can be overridden) and static methods (utility methods called via InterfaceName.method(), NOT inherited). Java 9 added private methods to share code between default methods.',
      points: [
        'default void log() { ... } -> inherited, can be overridden.',
        'static Shape unitSquare() { ... } -> call Shape.unitSquare(), not Square.unitSquare().',
        'private String helper() { ... } -> only usable inside the interface.',
        'Real examples: List.sort() and Iterable.forEach() are default methods; List.of() and Comparator.comparing() are static.',
      ],
    },
    {
      heading: 'Multiple Inheritance Through Interfaces',
      content:
        'A class cannot extend two classes, but it can implement any number of interfaces. A SmartPhone IS-A Camera and IS-A MusicPlayer. The diamond problem is avoided because interfaces have no instance state, and default method conflicts are resolved by clear rules.',
      points: [
        'Rule 1: Class wins. A method from the superclass beats a default method from an interface.',
        'Rule 2: More specific interface wins. If B extends A and both define the default, B\'s version is used.',
        'Rule 3: Otherwise the class MUST override the method, and can call a specific one with InterfaceName.super.method().',
      ],
    },
    {
      heading: 'Functional Interfaces',
      content:
        'A functional interface has exactly one abstract method (it can still have default and static methods). It can be implemented with a lambda expression instead of a full class. @FunctionalInterface is optional but makes the compiler check the rule. Built-in examples: Runnable (run), Comparator (compare), Callable (call), and java.util.function types like Predicate, Function, Consumer, Supplier (Day 39).',
      syntax: `@FunctionalInterface
interface Calculator { int compute(int a, int b); }
Calculator add = (a, b) -> a + b;
System.out.println(add.compute(2, 3));   // 5`,
    },
    {
      heading: 'Marker Interfaces',
      content:
        'An interface with no methods at all, used to "tag" a class so the JVM or a library treats it specially. Examples: Serializable (object can be serialized), Cloneable (clone() is allowed), RandomAccess. Today annotations are often used for the same purpose.',
    },
    {
      heading: 'Interface vs Abstract Class',
      content:
        'Comparison:\n Methods: abstract class -> abstract + concrete; interface -> abstract + default + static + private.\n Fields: abstract class -> any; interface -> only public static final constants.\n Constructors: abstract class -> yes; interface -> no.\n Inheritance: a class extends ONE abstract class but implements MANY interfaces.\n Relationship: abstract class = IS-A with shared state; interface = CAN-DO capability/contract.',
      tip: 'Program to an interface: declare variables as List, Payable, NotificationSender, not as concrete classes. Spring dependency injection is built on this idea.',
    },
  ],
  examples: [
    {
      title: 'Interface as a Contract with Constants',
      scenario: 'An accounts module must calculate the amount due for invoices and salaries in a uniform way.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Invoice due: 1180.0
Salary due: 25000.0
GST rate: 0.18`,
      explanation:
        'Both classes implement amountDue(). 1000 + 1000 * 0.18 = 1180.0. Salary returns int 25000, widened to double 25000.0. GST is a constant accessed through the interface name.',
    },
    {
      title: 'Multiple Inheritance and the Diamond Problem with Default Methods',
      scenario: 'A smartphone is both a camera and a music player; both define a default start().',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Camera starting
Music player starting
SmartPhone ready
Photo clicked
Playing song
Photo clicked
true`,
      explanation:
        'Because two default start() methods conflict, SmartPhone must override start(); it calls each parent version using Camera.super.start() and MusicPlayer.super.start(). A Camera reference can point to the phone, and it is also a MusicPlayer.',
    },
    {
      title: 'Default, Private and Static Interface Methods',
      scenario: 'Shapes get a free describe() method and a static factory without changing implementing classes.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Square with area 9.0
Sides: 4
Square with area 1.0`,
      explanation:
        'describe() is a default method inherited by Square through Polygon; it uses the private helper name(). Shape.unitSquare() is static, so it must be called with the interface name.',
    },
    {
      title: 'Functional Interface: Anonymous Class vs Lambda',
      scenario: 'A calculator interface with one method implemented three ways.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `10
24
6
Runnable is a built-in functional interface`,
      explanation:
        'All three Calculator objects implement compute(). The lambda (a, b) -> a * b is a short form of the anonymous class. Runnable has one method run(), so it also accepts a lambda.',
    },
    {
      title: 'Loose Coupling: Program to an Interface',
      scenario: 'OrderService should notify customers by email or SMS without changing its own code.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Order placed for riya@mail.com
Email to riya@mail.com: Your order is confirmed
Order placed for 9876543210
SMS to 9876543210: Your order is confirmed`,
      explanation:
        'OrderService only knows NotificationSender. The concrete sender is passed in from outside (this is dependency injection, which Spring automates).',
    },
  ],
  interview: [
    {
      q: 'What is an interface? Why do we use it?',
      a: 'A reference type that declares a contract of methods (plus constants, default, static and private methods). Used for abstraction, loose coupling, multiple inheritance of type and to define capabilities that unrelated classes can share.',
      level: 'Easy',
    },
    {
      q: 'Difference between an abstract class and an interface?',
      a: 'Abstract class: can have state, constructors, any access modifiers, single inheritance. Interface: only constants, no constructors, methods are public (except private helpers), a class can implement many. Use abstract class for shared code/state, interface for contracts/capabilities.',
      level: 'Medium',
    },
    {
      q: 'Why were default methods added in Java 8?',
      a: 'For backward compatibility: to add new methods (like forEach, stream, sort) to existing interfaces such as Collection and List without breaking all existing implementations.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass A { public void hi() { System.out.println("A"); } }\ninterface I { default void hi() { System.out.println("I"); } }\nclass B extends A implements I { }\nnew B().hi();',
      a: 'Output: A. The "class wins" rule: a superclass method takes priority over an interface default method.',
      level: 'Hard',
    },
    {
      q: 'Will this compile?\ninterface X { default void m() {} }\ninterface Y { default void m() {} }\nclass Z implements X, Y { }',
      a: 'No. Z inherits unrelated defaults for m() and must override it, e.g. public void m() { X.super.m(); }.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\ninterface I { int X = 10; }\nclass C implements I { void show() { System.out.println(X * 2); } }\nnew C().show();',
      a: 'Output: 20. X is a public static final constant inherited by C. Trying X = 5 would be a compile error.',
      level: 'Easy',
    },
    {
      q: 'What is a functional interface? Give examples.',
      a: 'An interface with exactly one abstract method, usable as the target of a lambda or method reference. Examples: Runnable, Callable, Comparator, Predicate, Function, Consumer, Supplier.',
      level: 'Easy',
    },
    {
      q: 'Are static methods of an interface inherited by implementing classes?',
      a: 'No. They must be called using the interface name: Shape.unitSquare(). Calling Square.unitSquare() or obj.unitSquare() is a compile error.',
      level: 'Medium',
    },
    {
      q: 'What is a marker interface?',
      a: 'An interface with no methods used to tag classes for special treatment, e.g. Serializable, Cloneable, RandomAccess.',
      level: 'Easy',
    },
    {
      q: 'Can an interface extend a class? Can it extend multiple interfaces?',
      a: 'An interface cannot extend a class. It can extend multiple interfaces: interface C extends A, B { }.',
      level: 'Easy',
    },
    {
      q: 'Why must implementing methods be public?',
      a: 'Interface methods are implicitly public, and overriding cannot reduce visibility. Writing void amountDue() without public gives "attempting to assign weaker access privileges".',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create an Animal interface with sound() and a default intro() method; implement Dog and Cow.',
      hint: 'default String intro() { return "I say " + sound(); }',
      solution: pr1,
    },
    {
      task: 'A Duck implements Flyable and Swimmable which both have default move(). Resolve the conflict.',
      hint: 'Use Flyable.super.move() and Swimmable.super.move().',
      solution: pr2,
    },
    {
      task: 'Create a functional interface StringOp and implement uppercase, reverse and exclaim using lambdas.',
      hint: 'new StringBuilder(s).reverse().toString()',
      solution: pr3,
    },
    {
      task: 'Create a Discount interface with static factory methods none() and percent(pct).',
      hint: 'Static methods can return lambdas of the same interface type.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Interface fields are implicitly...',
      options: ['private', 'public static final', 'protected', 'instance variables'],
      answer: 1,
      explanation: 'All interface fields are constants.',
    },
    {
      question: 'Which keyword does a class use to inherit an interface?',
      options: ['extends', 'inherits', 'uses', 'implements'],
      answer: 3,
      explanation: 'class A implements I.',
    },
    {
      question: 'Two interfaces have the same default method. The implementing class must...',
      options: ['override the method', 'be abstract', 'do nothing', 'extend Object explicitly'],
      answer: 0,
      explanation: 'The conflict must be resolved by overriding (optionally calling X.super.m()).',
    },
    {
      question: 'How many abstract methods does a functional interface have?',
      options: ['Zero', 'At least two', 'Exactly one', 'Any number'],
      answer: 2,
      explanation: 'Exactly one abstract method; defaults and statics do not count.',
    },
    {
      question: 'Which is a marker interface?',
      options: ['Runnable', 'Comparable', 'Serializable', 'Iterable'],
      answer: 2,
      explanation: 'Serializable has no methods.',
    },
  ],
};
