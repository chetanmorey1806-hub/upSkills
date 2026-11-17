const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main; for a separate abstract class Eclipse has an "abstract" checkbox)',
  'Type the code. When a class extends an abstract class, IntelliJ shows a red bulb: press Alt+Enter > Implement methods (Eclipse: Ctrl+1 > Add unimplemented methods)',
  'Click Run ▶ and compare the output',
];

const ex1 = `abstract class Shape {
    String name;

    Shape(String name) {                      // abstract classes CAN have constructors
        this.name = name;
        System.out.println("Shape constructor for " + name);
    }

    abstract double area();                   // no body: subclasses MUST implement

    void describe() {                         // concrete method uses the abstract one
        System.out.println(name + " area = " + area());
    }
}

class Circle extends Shape {
    double r;

    Circle(double r) {
        super("Circle");
        this.r = r;
    }

    @Override
    double area() {
        return Math.PI * r * r;
    }
}

class Rectangle extends Shape {
    double l, w;

    Rectangle(double l, double w) {
        super("Rectangle");
        this.l = l;
        this.w = w;
    }

    @Override
    double area() {
        return l * w;
    }
}

public class Main {
    public static void main(String[] args) {
        // Shape s = new Shape("x");   // compile error: Shape is abstract
        Shape s1 = new Circle(1);
        Shape s2 = new Rectangle(4, 2.5);
        s1.describe();
        s2.describe();
    }
}`;

const ex2 = `abstract class DataExporter {
    // template method: fixed algorithm, cannot be overridden
    public final void export() {
        connect();
        writeData();
        disconnect();
    }

    private void connect() {
        System.out.println("Opening file");
    }

    protected abstract void writeData();      // the step that varies

    private void disconnect() {
        System.out.println("Closing file");
    }
}

class CsvExporter extends DataExporter {
    @Override
    protected void writeData() {
        System.out.println("Writing CSV: id,name");
    }
}

class JsonExporter extends DataExporter {
    @Override
    protected void writeData() {
        System.out.println("Writing JSON: [ {id:1} ]");
    }
}

public class Main {
    public static void main(String[] args) {
        DataExporter e = new CsvExporter();
        e.export();
        System.out.println("--");
        new JsonExporter().export();
    }
}`;

const ex3 = `abstract class Vehicle {
    abstract int wheels();
    abstract String fuel();

    void info() {
        System.out.println(getClass().getSimpleName() + ": " + wheels() + " wheels, " + fuel());
    }
}

// implements only wheels(), so it must stay abstract
abstract class FourWheeler extends Vehicle {
    @Override
    int wheels() {
        return 4;
    }
}

class Car extends FourWheeler {
    @Override
    String fuel() { return "Petrol"; }
}

class ElectricCar extends FourWheeler {
    @Override
    String fuel() { return "Electric"; }
}

class Bike extends Vehicle {
    @Override
    int wheels() { return 2; }

    @Override
    String fuel() { return "Petrol"; }
}

public class Main {
    public static void main(String[] args) {
        Vehicle[] vehicles = { new Car(), new ElectricCar(), new Bike() };
        for (Vehicle v : vehicles) {
            v.info();
        }
    }
}`;

const ex4 = `abstract class Greeting {
    abstract String message();

    static void line() {                      // static methods are allowed
        System.out.println("=== Greetings ===");
    }

    void greet(String name) {
        System.out.println(message() + ", " + name + "!");
    }
}

public class Main {
    public static void main(String[] args) {
        Greeting.line();

        // anonymous class: an unnamed subclass created on the spot
        Greeting morning = new Greeting() {
            @Override
            String message() {
                return "Good morning";
            }
        };
        morning.greet("Neel");

        Greeting night = new Greeting() {
            @Override
            String message() {
                return "Good night";
            }
        };
        night.greet("Tara");
    }
}`;

const pr1 = `abstract class BankAccount {
    protected double balance;
    BankAccount(double balance) { this.balance = balance; }
    abstract double rate();
    double yearlyInterest() { return balance * rate() / 100; }
}
class SbiAccount extends BankAccount {
    SbiAccount(double b) { super(b); }
    double rate() { return 6.5; }
}
class HdfcAccount extends BankAccount {
    HdfcAccount(double b) { super(b); }
    double rate() { return 7.25; }
}

public class Main {
    public static void main(String[] args) {
        BankAccount[] accounts = { new SbiAccount(10000), new HdfcAccount(10000) };
        for (BankAccount a : accounts) {
            System.out.println(a.getClass().getSimpleName() + " interest: " + a.yearlyInterest());
        }
        // SbiAccount interest: 650.0
        // HdfcAccount interest: 725.0
    }
}`;

const pr2 = `abstract class Employee {
    String name;
    Employee(String name) { this.name = name; }
    abstract double salary();
    void print() { System.out.println(name + ": " + salary()); }
}
class FullTime extends Employee {
    double monthly;
    FullTime(String n, double m) { super(n); monthly = m; }
    double salary() { return monthly; }
}
class PartTime extends Employee {
    int hours; double perHour;
    PartTime(String n, int h, double p) { super(n); hours = h; perHour = p; }
    double salary() { return hours * perHour; }
}

public class Main {
    public static void main(String[] args) {
        new FullTime("Asha", 50000).print();       // Asha: 50000.0
        new PartTime("Ben", 80, 250).print();      // Ben: 20000.0
    }
}`;

const pr3 = `abstract class Game {
    final void play() {
        start();
        while (!isOver()) takeTurn();
        end();
    }
    abstract void start();
    abstract void takeTurn();
    abstract boolean isOver();
    abstract void end();
}

class CountGame extends Game {
    int turn = 0;
    void start() { System.out.println("Game start"); }
    void takeTurn() { turn++; System.out.println("Turn " + turn); }
    boolean isOver() { return turn == 3; }
    void end() { System.out.println("Game over"); }
}

public class Main {
    public static void main(String[] args) {
        new CountGame().play();
        // Game start, Turn 1, Turn 2, Turn 3, Game over (each on its own line)
    }
}`;

const pr4 = `abstract class Logger {
    abstract void log(String msg);
}

public class Main {
    public static void main(String[] args) {
        Logger console = new Logger() {
            void log(String msg) { System.out.println("[CONSOLE] " + msg); }
        };
        Logger upper = new Logger() {
            void log(String msg) { System.out.println("[UPPER] " + msg.toUpperCase()); }
        };
        console.log("server started");   // [CONSOLE] server started
        upper.log("disk low");           // [UPPER] DISK LOW
    }
}`;

export default {
  id: 'day-22-abstract-classes',
  title: 'Abstraction with Abstract Classes',
  module: 'Module 3: Object-Oriented Programming',
  day: 22,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Hide implementation details and force subclasses to provide specific behaviour using abstract classes and abstract methods, and apply the Template Method pattern used widely in frameworks.',
  objectives: [
    'Explain abstraction and how abstract classes achieve it',
    'Declare abstract classes and abstract methods and implement them in subclasses',
    'Know what abstract classes can contain (constructors, fields, concrete/static/final methods)',
    'Use abstract classes for the Template Method pattern and anonymous subclasses',
  ],
  theory: [
    {
      heading: 'What is Abstraction?',
      content:
        'Abstraction means showing only the essential features and hiding the internal details. Analogy: when you drive a car you use the steering, accelerator and brake; you do not need to know how fuel injection works. In Java, abstraction is achieved with abstract classes (0 to 100% abstraction) and interfaces (Day 23).',
      points: [
        'Focus on WHAT an object does, not HOW it does it.',
        'Callers depend on the abstract type (Shape), not on concrete types (Circle).',
      ],
    },
    {
      heading: 'Abstract Classes and Abstract Methods',
      content:
        'An abstract class is declared with the abstract keyword and cannot be instantiated. It represents an incomplete idea, like "Shape": you can draw a circle or a rectangle, but not a plain "shape". An abstract method has no body (ends with ;) and must be implemented by the first concrete (non-abstract) subclass.',
      syntax: `abstract class Shape {
    abstract double area();          // no body
    void describe() { ... }          // normal method
}
class Circle extends Shape {
    double area() { return Math.PI * r * r; }
}`,
      points: [
        'If a class has even one abstract method, the class must be declared abstract.',
        'An abstract class may have zero abstract methods (used just to prevent instantiation).',
        'A subclass that does not implement all abstract methods must itself be abstract.',
        'Shape s = new Shape(); is a compile error; Shape s = new Circle(1); is fine (upcasting).',
      ],
    },
    {
      heading: 'What Can an Abstract Class Contain?',
      content:
        'Almost everything a normal class can: instance and static fields, constructors, concrete methods, static methods, final methods and even a main() method. The constructor runs when a subclass object is created (through super()), and is used to initialize common fields.',
      points: [
        'Illegal combinations: abstract + final (final cannot be overridden), abstract + static (static cannot be overridden), abstract + private (private is not visible to subclasses).',
        'Abstract methods can be public, protected or default.',
      ],
      tip: 'Common mistake: writing abstract void show() {} with braces. An abstract method must NOT have a body, not even empty braces.',
    },
    {
      heading: 'Template Method Pattern',
      content:
        'An abstract class defines the skeleton of an algorithm in a final method and leaves specific steps abstract. Analogy: a tea/coffee recipe: boil water -> brew -> pour -> add extras. Boiling and pouring are common; brewing and extras differ. Frameworks use this a lot: HttpServlet.service() calls your doGet()/doPost(); Spring\'s JdbcTemplate handles connection steps while you supply the query logic.',
    },
    {
      heading: 'Anonymous Subclasses',
      content:
        'You cannot write new Greeting() for an abstract class, but you can write new Greeting() { ...implement abstract methods... } which creates an object of an unnamed subclass in one step. Useful for one-time small implementations.',
    },
    {
      heading: 'When to Use an Abstract Class',
      content:
        'Use an abstract class when related classes share common state (fields) and code, and also need some methods to be customised. Example: all bank accounts have a balance and deposit(), but interest calculation differs. If you only need a contract of methods with no shared state, prefer an interface.',
      points: [
        'Abstract class: "IS-A" with shared code and state; single inheritance only.',
        'Interface: "CAN-DO" capability; a class can implement many.',
      ],
    },
  ],
  examples: [
    {
      title: 'Abstract Shape with Concrete Subclasses',
      scenario: 'A drawing app needs area for different shapes while sharing a common describe() method.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Shape constructor for Circle
Shape constructor for Rectangle
Circle area = 3.141592653589793
Rectangle area = 10.0`,
      explanation:
        'Both objects run the abstract class constructor via super(...). describe() is written once in Shape but calls the subclass\'s area() at runtime. PI * 1 * 1 = 3.141592653589793, 4 * 2.5 = 10.0.',
    },
    {
      title: 'Template Method Pattern: Data Exporter',
      scenario: 'Every export must open, write and close; only the writing format differs.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Opening file
Writing CSV: id,name
Closing file
--
Opening file
Writing JSON: [ {id:1} ]
Closing file`,
      explanation:
        'export() is final so subclasses cannot change the order of steps. Each subclass only supplies writeData().',
    },
    {
      title: 'Partially Implemented Abstract Class Chain',
      scenario: 'FourWheeler knows it has 4 wheels but not the fuel; Car and ElectricCar complete it.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Car: 4 wheels, Petrol
ElectricCar: 4 wheels, Electric
Bike: 2 wheels, Petrol`,
      explanation:
        'FourWheeler implements wheels() but not fuel(), so it must remain abstract. Car and ElectricCar inherit wheels() and add fuel(). getClass().getSimpleName() returns the runtime class name.',
    },
    {
      title: 'Anonymous Subclass and Static Method in an Abstract Class',
      scenario: 'Create two quick greeting variants without writing named classes.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `=== Greetings ===
Good morning, Neel!
Good night, Tara!`,
      explanation:
        'Greeting.line() is a static method called on the abstract class directly. Each new Greeting() { ... } creates an anonymous subclass object that implements message().',
    },
  ],
  interview: [
    {
      q: 'What is abstraction? How is it achieved in Java?',
      a: 'Hiding implementation details and showing only essential functionality. Achieved using abstract classes (partial abstraction) and interfaces (full abstraction of behaviour contracts).',
      level: 'Easy',
    },
    {
      q: 'Can we create an object of an abstract class?',
      a: 'No, new AbstractClass() is a compile error. But we can create objects of concrete subclasses, use an abstract-type reference, or create an anonymous subclass with new AbstractClass() { ... }.',
      level: 'Easy',
    },
    {
      q: 'Can an abstract class have a constructor? Why?',
      a: 'Yes. It is called through super() when a subclass object is created and initializes common fields defined in the abstract class.',
      level: 'Medium',
    },
    {
      q: 'Can an abstract class exist without any abstract method?',
      a: 'Yes. It simply cannot be instantiated. Example: javax/jakarta HttpServlet is abstract but has no abstract methods.',
      level: 'Medium',
    },
    {
      q: 'Which modifiers cannot be combined with abstract?',
      a: 'final, static and private (for methods). final and abstract contradict each other; static methods cannot be overridden; private methods are not visible to subclasses.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nabstract class A { A() { System.out.print("A "); } abstract void m(); }\nclass B extends A { B() { System.out.print("B "); } void m() { System.out.print("m "); } }\nA a = new B(); a.m();',
      a: 'Output: A B m . The abstract class constructor runs first via super(), then B(), then the overridden m().',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nabstract class P { int v = 5; abstract int get(); void show() { System.out.println(v + get()); } }\nclass Q extends P { int get() { return 10; } }\nnew Q().show();',
      a: 'Output: 15. show() is inherited; get() is dispatched to Q, and v + get() = 5 + 10 is integer addition.',
      level: 'Easy',
    },
    {
      q: 'What happens if a subclass does not implement all abstract methods?',
      a: 'It must be declared abstract itself, otherwise it is a compile error: "Class is not abstract and does not override abstract method ...".',
      level: 'Easy',
    },
    {
      q: 'Can an abstract class have a main() method and be run?',
      a: 'Yes. main is static, so the JVM can call it without creating an object of the abstract class.',
      level: 'Medium',
    },
    {
      q: 'Abstract class vs interface: when do you choose an abstract class?',
      a: 'When subclasses share state (fields), constructors and common code, and the relationship is IS-A. Choose interfaces for capabilities that unrelated classes may implement or when multiple inheritance of type is needed.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create an abstract BankAccount with abstract rate(); implement SbiAccount (6.5%) and HdfcAccount (7.25%) and print yearly interest on 10000.',
      hint: 'yearlyInterest() = balance * rate() / 100 in the abstract class.',
      solution: pr1,
    },
    {
      task: 'Create an abstract Employee with abstract salary(); implement FullTime and PartTime employees.',
      hint: 'PartTime salary = hours * perHour.',
      solution: pr2,
    },
    {
      task: 'Implement a Template Method game loop with start, takeTurn, isOver and end steps.',
      hint: 'Make play() final in the abstract class.',
      solution: pr3,
    },
    {
      task: 'Create two Logger implementations using anonymous subclasses of an abstract Logger.',
      hint: 'new Logger() { void log(String msg) { ... } }',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which statement is TRUE about abstract classes?',
      options: ['They cannot have constructors', 'They can have both abstract and concrete methods', 'They must have at least one abstract method', 'They can be instantiated with new'],
      answer: 1,
      explanation: 'Abstract classes can mix abstract and concrete methods and have constructors.',
    },
    {
      question: 'Which declaration is valid?',
      options: ['abstract void run() { }', 'final abstract void run();', 'abstract void run();', 'static abstract void run();'],
      answer: 2,
      explanation: 'An abstract method has no body and cannot be final or static.',
    },
    {
      question: 'A class extends an abstract class but implements only some abstract methods. It must be...',
      options: ['declared abstract', 'declared final', 'declared static', 'nothing special'],
      answer: 0,
      explanation: 'Otherwise the compiler reports the missing implementations.',
    },
    {
      question: 'Which design pattern uses a final method in an abstract class that calls abstract steps?',
      options: ['Singleton', 'Builder', 'Observer', 'Template Method'],
      answer: 3,
      explanation: 'Template Method defines the algorithm skeleton and defers steps to subclasses.',
    },
    {
      question: 'Shape is abstract and Circle extends it. Which line compiles?',
      options: ['Shape s = new Shape();', 'Circle c = new Shape();', 'Shape s = new Circle();', 'Circle c = (Circle) new Shape();'],
      answer: 2,
      explanation: 'An abstract-type reference may point to a concrete subclass object.',
    },
  ],
};
