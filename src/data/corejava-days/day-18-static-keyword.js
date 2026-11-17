const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code; helper classes are non-public classes inside Main.java',
  'Click Run ▶ and notice which lines print once (static) and which print per object (instance)',
];

const ex1 = `class Student {
    static String college = "ABC College";   // ONE copy shared by all objects
    static int count = 0;

    String name;                              // separate copy per object
    int roll;

    Student(String name) {
        this.name = name;
        count++;
        roll = count;
    }

    void show() {
        System.out.println(roll + " " + name + " - " + college);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student("Amit");
        Student s2 = new Student("Neha");
        s1.show();
        s2.show();

        Student.college = "XYZ University";   // change once, visible to all
        s1.show();
        s2.show();

        System.out.println("Total students: " + Student.count);
    }
}`;

const ex2 = `class MathUtil {
    private MathUtil() { }                    // no objects needed

    static int square(int n) {
        return n * n;
    }

    static int cube(int n) {
        return n * square(n);                 // static calls static directly
    }
}

public class Main {
    int instanceValue = 10;
    static int staticValue = 20;

    static void staticMethod() {
        System.out.println("staticValue = " + staticValue);
        // System.out.println(instanceValue);  // compile error: non-static variable
        Main m = new Main();                  // need an object for instance members
        System.out.println("instanceValue via object = " + m.instanceValue);
    }

    void instanceMethod() {
        // instance methods can use BOTH
        System.out.println("instance sees " + instanceValue + " and " + staticValue);
    }

    public static void main(String[] args) {
        System.out.println(MathUtil.square(4));
        System.out.println(MathUtil.cube(3));
        staticMethod();
        new Main().instanceMethod();
    }
}`;

const ex3 = `class Demo {
    static int s;
    int x;

    static {
        s = 100;
        System.out.println("Static block of Demo, s = " + s);
    }

    {
        x = 5;
        System.out.println("Instance block, x = " + x);
    }

    Demo() {
        x = x * 2;
        System.out.println("Constructor, x = " + x);
    }
}

public class Main {
    static {
        System.out.println("Static block of Main");
    }

    public static void main(String[] args) {
        System.out.println("main() started");
        new Demo();
        new Demo();
        System.out.println("main() ended");
    }
}`;

const ex4 = `class Parent {
    static { System.out.println("Parent static block"); }
    { System.out.println("Parent instance block"); }
    Parent() { System.out.println("Parent constructor"); }
}

class Child extends Parent {
    static { System.out.println("Child static block"); }
    { System.out.println("Child instance block"); }
    Child() { System.out.println("Child constructor"); }
}

public class Main {
    public static void main(String[] args) {
        new Child();
        System.out.println("---");
        new Child();
    }
}`;

const ex5 = `import static java.lang.Math.max;
import static java.lang.Math.sqrt;

class Greeter {
    static void hello() {
        System.out.println("Hello from static method");
    }
}

public class Main {
    static final double GST_RATE = 0.18;      // constant: static + final

    static double withGst(double amount) {
        return amount + amount * GST_RATE;
    }

    public static void main(String[] args) {
        System.out.println(sqrt(25));         // no Math. prefix needed
        System.out.println(max(3, 7));
        System.out.println(withGst(1000));

        Greeter g = null;
        g.hello();                            // works: static call uses the TYPE, not the object
    }
}`;

const pr1 = `class Product {
    static int nextId = 101;
    int id;
    String name;

    Product(String name) {
        this.name = name;
        this.id = nextId++;
    }
}

public class Main {
    public static void main(String[] args) {
        Product a = new Product("Mouse");
        Product b = new Product("Keyboard");
        System.out.println(a.id + " " + a.name);   // 101 Mouse
        System.out.println(b.id + " " + b.name);   // 102 Keyboard
        System.out.println("Next id: " + Product.nextId); // 103
    }
}`;

const pr2 = `class Temperature {
    private Temperature() { }
    static double cToF(double c) { return c * 9 / 5 + 32; }
    static double fToC(double f) { return (f - 32) * 5 / 9; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Temperature.cToF(100));   // 212.0
        System.out.println(Temperature.fToC(212));   // 100.0
    }
}`;

const pr3 = `import java.util.HashMap;
import java.util.Map;

class Config {
    static final Map<String, String> SETTINGS = new HashMap<>();

    static {
        SETTINGS.put("app", "SchoolApp");
        SETTINGS.put("version", "1.0");
        System.out.println("Config loaded");
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(Config.SETTINGS.get("app"));      // Config loaded, then SchoolApp
        System.out.println(Config.SETTINGS.get("version"));  // 1.0 (block does not run again)
    }
}`;

const pr4 = `class Visitor {
    static int total;
    int visits;

    { visits = 1; total++; }      // instance block shared by all constructors

    Visitor() { }
    Visitor(int extra) { visits += extra; }
}

public class Main {
    public static void main(String[] args) {
        Visitor v1 = new Visitor();
        Visitor v2 = new Visitor(4);
        System.out.println(v1.visits + " " + v2.visits);  // 1 5
        System.out.println("Total visitors: " + Visitor.total); // 2
    }
}`;

export default {
  id: 'day-18-static-keyword',
  title: 'static Keyword: Variables, Methods, Blocks and Instance Initializer Blocks',
  module: 'Module 3: Object-Oriented Programming',
  day: 18,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Learn the difference between class-level (static) and object-level (instance) members, when static blocks and instance initializer blocks run, and the exact order of initialization asked in interviews.',
  objectives: [
    'Differentiate static variables from instance variables',
    'Write static utility methods and know what they can and cannot access',
    'Predict the execution order of static blocks, instance blocks and constructors',
    'Use static constants and static imports correctly',
  ],
  theory: [
    {
      heading: 'static Means "Belongs to the Class"',
      content:
        'A static member belongs to the class itself, not to any object. Analogy: in a classroom, every student has their own notebook (instance variable), but there is only ONE whiteboard on the wall (static variable). If the teacher writes on the whiteboard, every student sees the change. Static members are created once when the class is loaded by the JVM and live in the method area / metaspace (the static values are stored with the class).',
      points: [
        'Access static members with the class name: Student.count, Math.sqrt(9).',
        'Static members can be used even before any object exists.',
        'Use static for data common to all objects: college name, counters, constants, configuration.',
      ],
    },
    {
      heading: 'Static Variables vs Instance Variables',
      content:
        'Instance variables get a fresh copy inside every object on the heap. A static variable has exactly one copy per class. Diagram: s1 -> [name=Amit, roll=1], s2 -> [name=Neha, roll=2], and both point to the shared Student.class -> [college="ABC College", count=2].',
      points: [
        'Static variables get default values like instance variables (0, null, false).',
        'Static final variables are constants: public static final double PI = 3.14159; naming in UPPER_SNAKE_CASE.',
        'Local variables can NEVER be static.',
      ],
    },
    {
      heading: 'Static Methods',
      content:
        'A static method works only with its parameters and static data. It has no this, so it cannot directly touch instance variables or call instance methods. Utility methods such as Math.max(), Integer.parseInt() and Arrays.sort() are static because they do not need object state.',
      points: [
        'static method -> static members: allowed directly.',
        'static method -> instance members: only through an object reference (obj.field).',
        'instance method -> static and instance members: both allowed.',
        'main is static so that the JVM can call it without creating an object of Main.',
        'Static methods cannot be overridden; a same-signature static method in a subclass HIDES the parent one (method hiding).',
      ],
      tip: 'Calling a static method through a null reference (Greeter g = null; g.hello();) does NOT throw NullPointerException, because the compiler uses the declared type. Avoid this style; it confuses readers.',
    },
    {
      heading: 'Static Blocks',
      content:
        'A static block (static { ... }) runs exactly once, when the class is loaded and initialized (first time you create an object, call a static method or use a non-constant static field). It is used to initialize complex static data such as loading a configuration map or a JDBC driver.',
      syntax: `static {
    // runs once per class, before main() if inside Main
}`,
      points: [
        'Multiple static blocks run top to bottom in the order they appear.',
        'The static block of the class containing main() runs before main() starts.',
        'Parent class static blocks run before child class static blocks.',
      ],
    },
    {
      heading: 'Instance Initializer Blocks',
      content:
        'An instance initializer block ({ ... } without static) runs every time an object is created, just after the super() call and before the remaining constructor body. The compiler actually copies it into every constructor. Use it for code common to all constructors.',
      points: [
        'Order for new Child(): Parent static -> Child static (only first time) -> Parent instance block -> Parent constructor -> Child instance block -> Child constructor.',
        'Field initializers (int x = 5;) and instance blocks run in the order they are written.',
        'Instance blocks are rarely used in real code; constructor chaining is clearer.',
      ],
    },
    {
      heading: 'Static Import',
      content:
        'import static lets you use static members without the class prefix: import static java.lang.Math.*; then write sqrt(25) instead of Math.sqrt(25). Use it sparingly (e.g. for constants or test assertions) because too many static imports hide where a method comes from.',
    },
  ],
  examples: [
    {
      title: 'Shared Static Variable vs Per-object Instance Variable',
      scenario: 'All students of one college share the college name, but each has their own name and roll number.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `1 Amit - ABC College
2 Neha - ABC College
1 Amit - XYZ University
2 Neha - XYZ University
Total students: 2`,
      explanation:
        'count is incremented by every constructor and gives roll numbers 1 and 2. Changing Student.college once changes it for both objects because there is a single copy.',
    },
    {
      title: 'Static Methods and What They Can Access',
      scenario: 'A utility class offers square/cube helpers; Main shows that a static method needs an object to read instance data.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `16
27
staticValue = 20
instanceValue via object = 10
instance sees 10 and 20`,
      explanation:
        'square(4) = 16, cube(3) = 3 * 9 = 27. staticMethod reads staticValue directly but needs new Main() for instanceValue. The instance method can read both.',
    },
    {
      title: 'Static Block vs Instance Block vs Constructor',
      scenario: 'Trace exactly when each block runs when two objects are created.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Static block of Main
main() started
Static block of Demo, s = 100
Instance block, x = 5
Constructor, x = 10
Instance block, x = 5
Constructor, x = 10
main() ended`,
      explanation:
        'Main is loaded first, so its static block prints before main(). Demo is loaded on the first new Demo(), so its static block runs once. For every object, the instance block runs before the constructor body, which doubles x to 10.',
    },
    {
      title: 'Initialization Order with Inheritance',
      scenario: 'The most popular output question: static and instance blocks in a parent and child class.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Parent static block
Child static block
Parent instance block
Parent constructor
Child instance block
Child constructor
---
Parent instance block
Parent constructor
Child instance block
Child constructor`,
      explanation:
        'Loading Child requires loading Parent first, so the static blocks run Parent then Child, only once. For each object, Child() first calls super(), so Parent\'s instance block and constructor finish before Child\'s instance block and constructor.',
    },
    {
      title: 'Static Constants, Static Import and Static Call on null',
      scenario: 'A billing app uses a GST constant, static imports from Math and a tricky static call.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `5.0
7
1180.0
Hello from static method`,
      explanation:
        'sqrt returns a double (5.0); max(int,int) returns 7. 1000 + 1000*0.18 = 1180.0. g.hello() compiles to Greeter.hello(), so no NullPointerException occurs.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a static variable and an instance variable?',
      a: 'A static variable has one copy per class, shared by all objects, created when the class loads. An instance variable has a separate copy in each object, created when the object is created.',
      level: 'Easy',
    },
    {
      q: 'Why is the main() method static?',
      a: 'So the JVM can call it without creating an object of the class. At startup there is no object yet, and the JVM would not know which constructor to use.',
      level: 'Easy',
    },
    {
      q: 'Can a static method access instance variables?',
      a: 'Not directly, because a static method has no this reference. It can access them through an object reference: new Main().x.',
      level: 'Easy',
    },
    {
      q: 'Can we override a static method?',
      a: 'No. If a subclass declares a static method with the same signature, it hides the parent method. The call is resolved by the reference type at compile time: Parent p = new Child(); p.show(); calls Parent.show().',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass A { static { System.out.print("S "); } { System.out.print("I "); } A() { System.out.print("C "); } }\nnew A(); new A();',
      a: 'Output: S I C I C . The static block runs once at class loading; the instance block and constructor run for each object.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass Test { static int x = 10; }\nTest a = new Test(); Test b = new Test(); a.x = 50; System.out.println(b.x + " " + Test.x);',
      a: 'Output: 50 50. x is static, so a.x, b.x and Test.x are the same variable.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nclass G { static void hi() { System.out.println("Hi"); } }\nG g = null; g.hi();',
      a: 'Output: Hi. A static method call is bound to the declared type G, so the null reference is never dereferenced.',
      level: 'Hard',
    },
    {
      q: 'When does a static block execute? Can we run a program with only a static block and no main()?',
      a: 'Once, when the class is initialized. Before Java 7 a static block could run and then System.exit() before the missing-main error. Since Java 7 the JVM checks for main() first, so it is not possible.',
      level: 'Medium',
    },
    {
      q: 'What is an instance initializer block and when does it run?',
      a: 'A block {...} inside a class without static. It runs every time an object is created, after super() and before the rest of the constructor body. The compiler copies it into every constructor.',
      level: 'Medium',
    },
    {
      q: 'Can local variables be static? Can a top-level class be static?',
      a: 'No to both. static is allowed for fields, methods, blocks and nested classes only.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Generate auto-incrementing product ids starting at 101 using a static counter.',
      hint: 'this.id = nextId++;',
      solution: pr1,
    },
    {
      task: 'Create a Temperature utility class with static conversion methods and a private constructor.',
      hint: 'F = C * 9 / 5 + 32',
      solution: pr2,
    },
    {
      task: 'Load configuration values into a static Map using a static block and show the block runs only once.',
      hint: 'Print a message inside the static block.',
      solution: pr3,
    },
    {
      task: 'Use an instance initializer block to share setup code between two constructors and count total objects.',
      hint: 'Put total++ in the instance block, not in each constructor.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'How many copies of a static variable exist if 10 objects are created?',
      options: ['10', '0', '11', '1'],
      answer: 3,
      explanation: 'One copy per class, regardless of objects.',
    },
    {
      question: 'When does a static block run?',
      options: ['Every time an object is created', 'Once when the class is loaded/initialized', 'When main() ends', 'Only when called explicitly'],
      answer: 1,
      explanation: 'Static blocks run once during class initialization.',
    },
    {
      question: 'For new Child(), what runs first among these?',
      options: ['Parent static block', 'Child static block', 'Parent constructor', 'Child instance block'],
      answer: 0,
      explanation: 'Parent class initialization (its static block) happens before the child class.',
    },
    {
      question: 'Which is TRUE about static methods?',
      options: ['They can use this', 'They can be overridden', 'They can be called using the class name', 'They can directly access instance variables'],
      answer: 2,
      explanation: 'Static methods are called as ClassName.method() and cannot use this or instance members directly.',
    },
    {
      question: 'What does an instance initializer block run before?',
      options: ['The static block', 'super() call', 'Class loading', 'The remaining body of the constructor'],
      answer: 3,
      explanation: 'Order: super() -> instance blocks/field initializers -> rest of the constructor body.',
    },
  ],
};
