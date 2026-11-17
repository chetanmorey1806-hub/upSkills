const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main, tick "public static void main")',
  'Type the code; the helper classes are non-public classes in the same Main.java file',
  'Click Run ▶ and read the console line by line to see WHEN each constructor runs',
];

const ex1 = `class Student {
    String name;      // no constructor written -> compiler adds Student() {}
    int age;
    boolean active;
}

class Book {
    String title;
    double price;

    Book() {                                  // no-arg constructor
        title = "Unknown";
        price = 0.0;
        System.out.println("No-arg constructor called");
    }

    Book(String title, double price) {       // parameterized constructor
        this.title = title;
        this.price = price;
        System.out.println("Parameterized constructor called");
    }

    void show() {
        System.out.println(title + " costs " + price);
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
        System.out.println(s.name + " " + s.age + " " + s.active);

        Book b1 = new Book();
        b1.show();

        Book b2 = new Book("Java Basics", 499.5);
        b2.show();
    }
}`;

const ex2 = `class Employee {
    String name;
    int salary;

    Employee(String name, int salary) {
        name = name;          // BUG: parameter assigned to itself
        salary = salary;      // fields stay at default values
    }
}

class FixedEmployee {
    String name;
    int salary;

    FixedEmployee(String name, int salary) {
        this.name = name;     // this.name = field, name = parameter
        this.salary = salary;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee e1 = new Employee("Ravi", 50000);
        System.out.println("Without this: " + e1.name + ", " + e1.salary);

        FixedEmployee e2 = new FixedEmployee("Ravi", 50000);
        System.out.println("With this: " + e2.name + ", " + e2.salary);
    }
}`;

const ex3 = `class Pizza {
    String size;
    String crust;
    int cheese;

    Pizza() {
        this("Medium");                       // must be the FIRST statement
        System.out.println("Pizza() done");
    }

    Pizza(String size) {
        this(size, "Thin");
        System.out.println("Pizza(size) done");
    }

    Pizza(String size, String crust) {
        this(size, crust, 1);
        System.out.println("Pizza(size, crust) done");
    }

    Pizza(String size, String crust, int cheese) {
        this.size = size;
        this.crust = crust;
        this.cheese = cheese;
        System.out.println("Pizza(size, crust, cheese) done");
    }

    void show() {
        System.out.println(size + " | " + crust + " | cheese x" + cheese);
    }
}

public class Main {
    public static void main(String[] args) {
        new Pizza().show();
        System.out.println("---");
        new Pizza("Large", "Cheese Burst").show();
    }
}`;

const ex4 = `class Order {
    private String item;
    private int qty;
    private double price;

    Order item(String item) {
        this.item = item;
        return this;                  // return current object -> allows chaining
    }

    Order qty(int qty) {
        this.qty = qty;
        return this;
    }

    Order price(double price) {
        this.price = price;
        return this;
    }

    String getItem() {
        return item;
    }

    double total() {
        return qty * price;
    }

    void print() {
        Printer.print(this);          // pass current object as an argument
    }
}

class Printer {
    static void print(Order o) {
        System.out.println("Order: " + o.getItem() + ", total = " + o.total());
    }
}

public class Main {
    public static void main(String[] args) {
        new Order().item("Pen").qty(3).price(12.5).print();
        new Order().item("Notebook").qty(2).price(45.0).print();
    }
}`;

const ex5 = `class Point {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Point(Point other) {              // copy constructor
        this(other.x, other.y);
    }
}

class Demo {
    int v = 5;

    void Demo() {                     // has a return type -> it is a METHOD, not a constructor
        v = 100;
        System.out.println("I am a method, not a constructor");
    }
}

public class Main {
    public static void main(String[] args) {
        Point p1 = new Point(2, 3);
        Point p2 = new Point(p1);
        p2.x = 10;
        System.out.println("p1 = (" + p1.x + "," + p1.y + ")");
        System.out.println("p2 = (" + p2.x + "," + p2.y + ")");
        System.out.println("Same object? " + (p1 == p2));

        Demo d = new Demo();          // compiler-provided default constructor
        System.out.println("v = " + d.v);
        d.Demo();
        System.out.println("v = " + d.v);
    }
}`;

const pr1 = `class BankAccount {
    String holder;
    long accountNo;
    double balance;

    BankAccount(String holder, long accountNo) {
        this(holder, accountNo, 0.0);
    }

    BankAccount(String holder, long accountNo, double balance) {
        this.holder = holder;
        this.accountNo = accountNo;
        this.balance = balance;
    }

    void display() {
        System.out.println(accountNo + " | " + holder + " | " + balance);
    }
}

public class Main {
    public static void main(String[] args) {
        new BankAccount("Meera", 1001L).display();          // 1001 | Meera | 0.0
        new BankAccount("Arjun", 1002L, 2500.0).display();  // 1002 | Arjun | 2500.0
    }
}`;

const pr2 = `class Rectangle {
    int length, width;

    Rectangle() { this(1, 1); }
    Rectangle(int side) { this(side, side); }
    Rectangle(int length, int width) {
        this.length = length;
        this.width = width;
    }

    int area() { return length * width; }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(new Rectangle().area());      // 1
        System.out.println(new Rectangle(4).area());     // 16
        System.out.println(new Rectangle(3, 5).area());  // 15
    }
}`;

const pr3 = `class Counter {
    static int created = 0;
    int id;

    Counter() {
        created++;
        id = created;
    }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        Counter c = new Counter();
        System.out.println(a.id + " " + b.id + " " + c.id);   // 1 2 3
        System.out.println("Objects created: " + Counter.created); // 3
    }
}`;

const pr4 = `class Person {
    String name;
    int age;

    Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    Person(Person p) {
        this(p.name, p.age);
    }

    Person setAge(int age) {
        this.age = age;
        return this;
    }

    public String toString() {
        return name + "(" + age + ")";
    }
}

public class Main {
    public static void main(String[] args) {
        Person original = new Person("Kiran", 25);
        Person copy = new Person(original).setAge(30);
        System.out.println(original + " " + copy);   // Kiran(25) Kiran(30)
    }
}`;

export default {
  id: 'day-17-constructors-this',
  title: 'Constructors, this Keyword and Constructor Chaining',
  module: 'Module 3: Object-Oriented Programming',
  day: 17,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Understand how objects are initialized using default, no-arg, parameterized and copy constructors, how the this keyword removes ambiguity, and how this() chains constructors to avoid duplicate code.',
  objectives: [
    'Write default, parameterized and copy constructors',
    'Use this to refer to the current object, its fields and methods',
    'Chain constructors with this() and predict the execution order',
    'Avoid common constructor mistakes asked in interviews',
  ],
  theory: [
    {
      heading: 'What is a Constructor?',
      content:
        'A constructor is a special block that runs automatically when you create an object with new. It sets up the initial state of the object. Analogy: when a new mobile phone is manufactured, the factory installs the OS and default settings before handing it over; the constructor is that factory setup step.',
      syntax: `class Car {
    String model;
    Car(String model) {   // same name as class, NO return type
        this.model = model;
    }
}
Car c = new Car("Swift");`,
      points: [
        'Name must be exactly the same as the class name.',
        'No return type, not even void. If you add void, it becomes a normal method.',
        'Called once per object, automatically, by new.',
        'Can be overloaded; can be public, protected, default or private.',
        'Cannot be static, final, abstract or synchronized.',
      ],
    },
    {
      heading: 'Types of Constructors',
      content:
        'Default constructor: added by the compiler ONLY when you write no constructor at all; it has no parameters and just calls super(). No-arg constructor: written by you with no parameters. Parameterized constructor: takes values to initialize fields. Copy constructor: takes another object of the same class and copies its values (Java has no built-in copy constructor; you write it).',
      points: [
        'If you write ANY constructor, the compiler no longer adds the default one. new A() then fails if only A(int) exists.',
        'Fields not set in a constructor keep default values: 0, 0.0, false, null, \'\\u0000\'.',
        'Constructors are not inherited, so they cannot be overridden.',
      ],
      tip: 'Common mistake: adding a parameterized constructor to an entity class and forgetting the no-arg one. Frameworks like Hibernate need a no-arg constructor.',
    },
    {
      heading: 'The this Keyword',
      content:
        'this is a reference to the current object, the object on which the method or constructor is running. Analogy: in a classroom, every student says "my name"; "my" means the speaker. In Java, this means "the object that is speaking right now".',
      points: [
        'this.field: distinguishes a field from a parameter/local with the same name (shadowing).',
        'this.method(): calls another method of the same object (this is optional here).',
        'this(...): calls another constructor of the same class (constructor chaining).',
        'return this: returns the current object, enabling method chaining (builder style).',
        'pass this: send the current object to another method, e.g. printer.print(this).',
        'this cannot be used inside a static method because there is no current object.',
      ],
    },
    {
      heading: 'Constructor Chaining with this()',
      content:
        'Constructor chaining means one constructor calls another constructor of the same class using this(...). It keeps initialization logic in one place (usually the constructor with the most parameters). Diagram: Pizza() -> Pizza(size) -> Pizza(size, crust) -> Pizza(size, crust, cheese). The innermost one finishes FIRST, then control returns outward, so the print statements appear in reverse order of the calls.',
      syntax: `Pizza() { this("Medium"); }
Pizza(String size) { this(size, "Thin"); }
Pizza(String size, String crust) { /* real work */ }`,
      points: [
        'this() must be the FIRST statement in a constructor (Java 21 and earlier).',
        'A constructor can contain either this() or super() as its first statement, not both.',
        'Recursive chaining (A() calls A(int) which calls A()) is a compile error: recursive constructor invocation.',
        'If no this()/super() is written, the compiler inserts super() automatically.',
      ],
    },
    {
      heading: 'Object Creation Step by Step',
      content:
        'For Car c = new Car("Swift"): 1) memory is allocated on the heap and all fields get default values; 2) the chosen constructor starts and first calls this(...) or super(...); 3) field initializers and instance blocks run; 4) the rest of the constructor body runs; 5) the reference is stored in c (on the stack).',
      points: [
        'new allocates memory; the constructor only initializes it.',
        'A constructor can contain a plain return; to exit early, but cannot return a value.',
      ],
    },
  ],
  examples: [
    {
      title: 'Default, No-arg and Parameterized Constructors',
      scenario: 'A library app creates books with and without details and also uses a class with no constructor at all.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `null 0 false
No-arg constructor called
Unknown costs 0.0
Parameterized constructor called
Java Basics costs 499.5`,
      explanation:
        'Student has no constructor, so the compiler adds one and fields keep defaults (null, 0, false). Book() sets fallback values; Book(String,double) copies the arguments into fields using this.',
    },
    {
      title: 'Why We Need this (Shadowing Bug)',
      scenario: 'A developer writes name = name; inside a constructor and wonders why the employee name is null.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Without this: null, 0
With this: Ravi, 50000`,
      explanation:
        'Inside the constructor, the parameter name hides (shadows) the field name. name = name assigns the parameter to itself, so the field stays null. this.name explicitly targets the field.',
    },
    {
      title: 'Constructor Chaining Order',
      scenario: 'A pizza shop has sensible defaults: Medium size, Thin crust, 1 cheese. Every constructor reuses the full one.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Pizza(size, crust, cheese) done
Pizza(size, crust) done
Pizza(size) done
Pizza() done
Medium | Thin | cheese x1
---
Pizza(size, crust, cheese) done
Pizza(size, crust) done
Large | Cheese Burst | cheese x1`,
      explanation:
        'Pizza() immediately calls this("Medium"), which calls this(size,"Thin"), which calls the 3-arg constructor. The 3-arg one finishes first and prints first; then each caller finishes its remaining statements in reverse order.',
    },
    {
      title: 'return this (Method Chaining) and Passing this',
      scenario: 'An e-commerce order is built fluently in one line and then printed by a separate Printer class.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Order: Pen, total = 37.5
Order: Notebook, total = 90.0`,
      explanation:
        'Each setter returns this, so the next call works on the same object. print() passes this to Printer.print(). 3 * 12.5 = 37.5 and 2 * 45.0 = 90.0.',
    },
    {
      title: 'Copy Constructor and the "void Constructor" Trap',
      scenario: 'Copy a Point safely, and see what happens when someone writes void before a constructor name.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `p1 = (2,3)
p2 = (10,3)
Same object? false
v = 5
I am a method, not a constructor
v = 100`,
      explanation:
        'The copy constructor creates a separate object, so changing p2.x does not affect p1. void Demo() is an ordinary method because it has a return type, so new Demo() uses the compiler-provided default constructor and v stays 5. Only the explicit call d.Demo() prints the message and changes v to 100.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between a constructor and a method?',
      a: 'Constructor: same name as class, no return type, called automatically by new, used to initialize, not inherited. Method: any name, must have a return type (or void), called explicitly, defines behaviour, inherited and can be overridden.',
      level: 'Easy',
    },
    {
      q: 'When does the compiler provide a default constructor?',
      a: 'Only when the class has no constructor at all. It is a no-arg constructor with the same access modifier as the class that calls super().',
      level: 'Easy',
    },
    {
      q: 'Will this compile?\nclass A { A(int x) { } }\nclass Main { public static void main(String[] s) { A a = new A(); } }',
      a: 'No. Because A(int) exists, the compiler does not add A(). new A() gives "constructor A in class A cannot be applied to given types".',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass A {\n  A() { this(5); System.out.print("A "); }\n  A(int x) { System.out.print("A" + x + " "); }\n}\nnew A();',
      a: 'Output: A5 A . this(5) runs A(int) first, which prints "A5 ", then the rest of A() prints "A ".',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass T { int x = 1; void T() { x = 9; } }\nT t = new T(); System.out.println(t.x);',
      a: 'Output: 1. void T() is a method, not a constructor, so it is never called automatically; the default constructor is used.',
      level: 'Medium',
    },
    {
      q: 'Can a constructor be private? Why would you do that?',
      a: 'Yes. A private constructor stops other classes from using new. It is used in the Singleton pattern, utility classes with only static methods (like Math), and factory methods.',
      level: 'Medium',
    },
    {
      q: 'Can we use this() and super() in the same constructor?',
      a: 'No. Both must be the first statement, so only one can appear. If a constructor calls this(), the chained constructor eventually calls super().',
      level: 'Medium',
    },
    {
      q: 'Can a constructor be static, final or abstract?',
      a: 'No. Static belongs to the class but a constructor initializes an object; final/abstract relate to overriding, and constructors are not inherited.',
      level: 'Easy',
    },
    {
      q: 'What happens with A() { this(1); } and A(int x) { this(); }?',
      a: 'Compile error: recursive constructor invocation. The compiler detects the cycle.',
      level: 'Hard',
    },
    {
      q: 'Does a constructor return anything?',
      a: 'It has no return type and cannot return a value. new returns the reference of the created object. A constructor may use a bare return; to exit early.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a BankAccount with two constructors: (holder, accountNo) and (holder, accountNo, balance). The 2-arg one must chain to the 3-arg one.',
      hint: 'this(holder, accountNo, 0.0);',
      solution: pr1,
    },
    {
      task: 'Create a Rectangle with 0, 1 (square) and 2 argument constructors using chaining, and print areas.',
      hint: 'Rectangle(int side) { this(side, side); }',
      solution: pr2,
    },
    {
      task: 'Count how many objects of a class are created and give each object an auto id.',
      hint: 'Increment a static counter inside the constructor.',
      solution: pr3,
    },
    {
      task: 'Write a Person class with a copy constructor and a chained setter, and show that the copy is independent.',
      hint: 'Copy constructor: Person(Person p) { this(p.name, p.age); }',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which statement about constructors is TRUE?',
      options: ['They must return void', 'They are inherited by subclasses', 'They have the same name as the class and no return type', 'They can be static'],
      answer: 2,
      explanation: 'A constructor has the class name and no return type; it is not inherited and cannot be static.',
    },
    {
      question: 'Where must this() appear inside a constructor?',
      options: ['First statement', 'Last statement', 'Anywhere', 'Only inside methods'],
      answer: 0,
      explanation: 'this() and super() must be the first statement of a constructor.',
    },
    {
      question: 'What is printed? class P { int a; P(int a) { a = a; } }  System.out.println(new P(7).a);',
      options: ['7', 'Compile error', 'null', '0'],
      answer: 3,
      explanation: 'The parameter shadows the field; the field keeps its default 0.',
    },
    {
      question: 'Which keyword usage is NOT allowed in a static method?',
      options: ['A local variable', 'this', 'Calling another static method', 'Creating an object with new'],
      answer: 1,
      explanation: 'Static methods have no current object, so this cannot be used.',
    },
    {
      question: 'Constructor A() calls this(2), which calls A(int, int). Which constructor body finishes first?',
      options: ['A()', 'A(int)', 'A(int, int)', 'They run in parallel'],
      answer: 2,
      explanation: 'The innermost chained constructor completes first, then control returns outward.',
    },
  ],
};
