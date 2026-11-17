const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. IntelliJ: Ctrl+O (Eclipse: Source > Override/Implement Methods) generates overriding methods with @Override',
  'Click Run ▶ and check which class\'s method actually ran for each call',
];

const ex1 = `class Animal {
    protected String sound() {
        return "...";
    }

    Animal create() {
        return new Animal();
    }

    public String toString() {
        return "Animal";
    }
}

class Dog extends Animal {
    @Override
    public String sound() {          // access widened: protected -> public (allowed)
        return "Woof";
    }

    @Override
    Dog create() {                   // covariant return type: Dog is a subtype of Animal
        return new Dog();
    }

    @Override
    public String toString() {
        return "Dog";
    }
}

public class Main {
    public static void main(String[] args) {
        Animal a = new Animal();
        Dog d = new Dog();
        System.out.println(a.sound());
        System.out.println(d.sound());
        System.out.println(a.create());
        System.out.println(d.create());
    }
}`;

const ex2 = `class Payment {
    void pay(double amount) {
        System.out.println("Paying " + amount + " by generic method");
    }
}

class CardPayment extends Payment {
    @Override
    void pay(double amount) {
        System.out.println("Paying " + amount + " by Card (2% fee: " + amount * 0.02 + ")");
    }
}

class UpiPayment extends Payment {
    @Override
    void pay(double amount) {
        System.out.println("Paying " + amount + " by UPI (no fee)");
    }
}

public class Main {
    static void checkout(Payment p, double amount) {   // works for ANY Payment subtype
        p.pay(amount);
    }

    public static void main(String[] args) {
        Payment[] payments = { new Payment(), new CardPayment(), new UpiPayment() };
        for (Payment p : payments) {
            checkout(p, 1000);     // same call, different behaviour at runtime
        }
    }
}`;

const ex3 = `class Employee {
    String name;
    Employee(String name) { this.name = name; }
    double pay() { return 30000; }
}

class Manager extends Employee {
    Manager(String name) { super(name); }
    @Override double pay() { return 80000; }
    void conductMeeting() { System.out.println(name + " is conducting a meeting"); }
}

class Intern extends Employee {
    Intern(String name) { super(name); }
    @Override double pay() { return 10000; }
}

public class Main {
    public static void main(String[] args) {
        Employee[] staff = { new Manager("Anil"), new Intern("Zoya"), new Employee("Raj") };  // upcasting
        double total = 0;
        for (Employee e : staff) {
            System.out.println(e.name + " earns " + e.pay());
            total += e.pay();
            if (e instanceof Manager m) {      // safe downcast (pattern matching, Java 16+)
                m.conductMeeting();
            }
        }
        System.out.println("Total payroll: " + total);

        Employee up = new Intern("Om");
        if (up instanceof Manager) {
            Manager mg = (Manager) up;          // classic downcast
            mg.conductMeeting();
        } else {
            System.out.println("Om is not a Manager, downcast skipped");
        }
    }
}`;

const ex4 = `class Parent {
    String name = "Parent field";
    static void staticShow() { System.out.println("Parent static"); }
    void instanceShow() { System.out.println("Parent instance"); }
}

class Child extends Parent {
    String name = "Child field";
    static void staticShow() { System.out.println("Child static"); }     // HIDES, not overrides
    @Override void instanceShow() { System.out.println("Child instance"); }
}

public class Main {
    public static void main(String[] args) {
        Parent p = new Child();
        System.out.println(p.name);    // field: reference type decides
        p.staticShow();                // static: reference type decides
        p.instanceShow();              // instance: OBJECT type decides

        Object o = new Parent();
        try {
            Child c = (Child) o;       // compiles, but object is not a Child
            System.out.println("never printed " + c);
        } catch (ClassCastException e) {
            System.out.println("ClassCastException caught");
        }
    }
}`;

const ex5 = `class Base {
    Base() {
        print();                       // calls the OVERRIDDEN version!
    }

    void print() {
        System.out.println("Base");
    }
}

class Derived extends Base {
    int x = 10;                        // assigned AFTER Base() finishes

    @Override
    void print() {
        System.out.println("Derived x = " + x);
    }
}

public class Main {
    public static void main(String[] args) {
        new Derived().print();
    }
}`;

const pr1 = `class Shape {
    double area() { return 0; }
}
class Rect extends Shape {
    double w, h;
    Rect(double w, double h) { this.w = w; this.h = h; }
    @Override double area() { return w * h; }
}
class Square extends Rect {
    Square(double s) { super(s, s); }
}
class Triangle extends Shape {
    double b, h;
    Triangle(double b, double h) { this.b = b; this.h = h; }
    @Override double area() { return 0.5 * b * h; }
}

public class Main {
    public static void main(String[] args) {
        Shape[] shapes = { new Rect(2, 3), new Square(4), new Triangle(6, 2) };
        double total = 0;
        for (Shape s : shapes) total += s.area();
        System.out.println("Total area = " + total);   // 6 + 16 + 6 = 28.0
    }
}`;

const pr2 = `class Notification {
    void send(String msg) { System.out.println("Generic: " + msg); }
}
class Email extends Notification {
    @Override void send(String msg) { System.out.println("Email: " + msg); }
}
class Sms extends Notification {
    @Override void send(String msg) { System.out.println("SMS: " + msg); }
}

public class Main {
    static Notification create(String type) {
        if (type.equals("email")) return new Email();
        if (type.equals("sms")) return new Sms();
        return new Notification();
    }

    public static void main(String[] args) {
        create("email").send("Order shipped");   // Email: Order shipped
        create("sms").send("OTP 4321");          // SMS: OTP 4321
        create("push").send("Hi");               // Generic: Hi
    }
}`;

const pr3 = `class Animal { }
class Dog extends Animal { void fetch() { System.out.println("Dog fetches"); } }
class Cat extends Animal { void climb() { System.out.println("Cat climbs"); } }

public class Main {
    static void act(Animal a) {
        if (a instanceof Dog d) d.fetch();
        else if (a instanceof Cat c) c.climb();
        else System.out.println("Unknown animal");
    }

    public static void main(String[] args) {
        act(new Dog());      // Dog fetches
        act(new Cat());      // Cat climbs
        act(new Animal());   // Unknown animal
    }
}`;

const pr4 = `class Vehicle {
    int speed() { return 60; }
    String info() { return getClass().getSimpleName() + " max " + speed() + " km/h"; }
}
class Bike extends Vehicle { @Override int speed() { return 120; } }
class Truck extends Vehicle { @Override int speed() { return 80; } }

public class Main {
    public static void main(String[] args) {
        Vehicle[] list = { new Vehicle(), new Bike(), new Truck() };
        for (Vehicle v : list) System.out.println(v.info());
        // Vehicle max 60 km/h
        // Bike max 120 km/h
        // Truck max 80 km/h
    }
}`;

export default {
  id: 'day-21-overriding-polymorphism',
  title: 'Method Overriding, Runtime Polymorphism, Dynamic Method Dispatch, Upcasting and Downcasting',
  module: 'Module 3: Object-Oriented Programming',
  day: 21,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Learn how a child class replaces parent behaviour with method overriding, how the JVM picks the right method at runtime through a parent reference (dynamic method dispatch), and how to safely upcast and downcast objects.',
  objectives: [
    'Override methods correctly following all overriding rules',
    'Explain runtime polymorphism and dynamic method dispatch',
    'Use upcasting, instanceof and downcasting safely',
    'Differentiate overloading vs overriding, and overriding vs hiding',
  ],
  theory: [
    {
      heading: 'Method Overriding',
      content:
        'Overriding means a subclass provides its own implementation of a method that it inherited from its parent, with the SAME name and SAME parameter list. Analogy: every bank has a calculateInterest() rule, but SBI and HDFC each implement it differently. The child version replaces the parent version for child objects.',
      syntax: `class Parent { void show() { ... } }
class Child extends Parent {
    @Override
    void show() { ... }      // same signature
}`,
      points: [
        'Same method name and same parameters (otherwise it is an overload, not an override).',
        'Return type: same, or a subtype (covariant return type) for objects.',
        'Access modifier: same or wider (protected -> public is OK, public -> protected is NOT).',
        'Checked exceptions: the overriding method may throw the same, fewer or narrower checked exceptions, never broader/new ones.',
        'Cannot override: static methods (they are hidden), private methods (not inherited), final methods, constructors.',
        '@Override is optional but strongly recommended: the compiler errors if you are not really overriding (e.g. a typo like tostring()).',
      ],
    },
    {
      heading: 'Polymorphism: Compile-time vs Runtime',
      content:
        'Polymorphism = "one name, many forms". Compile-time (static) polymorphism is method overloading: the compiler picks the method using argument types. Runtime (dynamic) polymorphism is method overriding: the JVM picks the method using the actual object type while the program runs. Analogy: a TV remote (parent reference) has a "power" button; pressing it turns on whichever brand of TV it is connected to (actual object).',
      points: [
        'Overloading: same class (or inherited), different parameters, resolved at compile time, early binding.',
        'Overriding: parent-child, same signature, resolved at runtime, late binding.',
      ],
    },
    {
      heading: 'Dynamic Method Dispatch',
      content:
        'When you call an overridden method through a parent-class reference, the JVM looks at the actual object on the heap and calls that object\'s version. Diagram: Payment p (stack) --> [CardPayment object] (heap); p.pay() runs CardPayment.pay(). The compiler only checks that pay() exists in Payment; the decision of which body runs is made at runtime.',
      points: [
        'Only instance methods are dispatched dynamically. Fields and static methods are bound by the reference type.',
        'This lets you write code like checkout(Payment p) that works for future payment types without changes (Open/Closed principle).',
        'Through a parent reference you can only call methods declared in the parent type.',
      ],
    },
    {
      heading: 'Upcasting and Downcasting',
      content:
        'Upcasting: treating a child object as its parent type, e.g. Employee e = new Manager(); It is automatic and always safe (a Manager IS-A Employee). Downcasting: converting a parent reference back to a child type to access child-only methods, e.g. Manager m = (Manager) e; It needs an explicit cast and can fail at runtime with ClassCastException if the object is not really that child.',
      syntax: `Employee e = new Manager("Anil");     // upcast (implicit)
if (e instanceof Manager) {
    Manager m = (Manager) e;          // downcast (explicit)
}
if (e instanceof Manager m) { ... }   // Java 16+ pattern matching`,
      points: [
        'Always check with instanceof before downcasting.',
        'Casting between unrelated classes (e.g. String to Integer) is a compile error.',
        'Casting inside the same hierarchy compiles but may throw ClassCastException at runtime.',
      ],
    },
    {
      heading: 'Overriding Pitfalls',
      content:
        'Do not call overridable methods from a constructor. The parent constructor runs before the child\'s fields are initialized, so the overridden method sees default values (0/null). Also remember that a static method with the same signature in the child only hides the parent method, so the reference type decides which one runs.',
      tip: 'Golden rule: "Methods are polymorphic, fields are not, static methods are not."',
    },
  ],
  examples: [
    {
      title: 'Overriding Rules: Wider Access and Covariant Return',
      scenario: 'A Dog overrides Animal behaviour, widens access and returns a more specific type.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `...
Woof
Animal
Dog`,
      explanation:
        'Dog.sound() overrides Animal.sound() with wider public access. Dog.create() returns Dog, allowed because Dog is a subtype of Animal (covariant return). println calls toString(), which is also overridden.',
    },
    {
      title: 'Dynamic Method Dispatch: One Checkout for All Payment Types',
      scenario: 'An online shop calls p.pay() without knowing whether it is a card or UPI payment.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Paying 1000.0 by generic method
Paying 1000.0 by Card (2% fee: 20.0)
Paying 1000.0 by UPI (no fee)`,
      explanation:
        'The reference type is always Payment, but the JVM runs the method of the actual object. The int 1000 is widened to the double parameter, so it prints 1000.0; 1000 * 0.02 = 20.0.',
    },
    {
      title: 'Upcasting, instanceof and Downcasting in a Payroll',
      scenario: 'Payroll treats everyone as Employee but must call conductMeeting() only for managers.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Anil earns 80000.0
Anil is conducting a meeting
Zoya earns 10000.0
Raj earns 30000.0
Total payroll: 120000.0
Om is not a Manager, downcast skipped`,
      explanation:
        'pay() is dispatched to each object\'s version. conductMeeting() is not in Employee, so a downcast is needed; instanceof prevents ClassCastException. Total = 80000 + 10000 + 30000.',
    },
    {
      title: 'What is NOT Polymorphic: Fields and Static Methods',
      scenario: 'Interview favourite: same names for fields, static and instance methods in parent and child.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Parent field
Parent static
Child instance
ClassCastException caught`,
      explanation:
        'p is declared as Parent, so p.name and p.staticShow() use Parent. instanceShow() is overridden, so the Child version runs. Casting a real Parent object to Child compiles but fails at runtime.',
    },
    {
      title: 'Trap: Overridden Method Called from a Parent Constructor',
      scenario: 'A hard output question: what does x hold when the parent constructor calls the overridden method?',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Derived x = 0
Derived x = 10`,
      explanation:
        'new Derived() first runs Base(), which calls print(). Dynamic dispatch picks Derived.print(), but x = 10 has not been assigned yet (field initializers run after super() returns), so it prints 0. The later explicit call prints 10.',
    },
  ],
  interview: [
    {
      q: 'Difference between method overloading and method overriding?',
      a: 'Overloading: same name, different parameters, usually same class, compile-time polymorphism, return type can differ. Overriding: same signature in subclass, runtime polymorphism, return type same or covariant, cannot reduce access or throw broader checked exceptions.',
      level: 'Easy',
    },
    {
      q: 'What is dynamic method dispatch?',
      a: 'The mechanism by which a call to an overridden method through a superclass reference is resolved at runtime based on the actual object type.',
      level: 'Easy',
    },
    {
      q: 'Can we override static, private or final methods?',
      a: 'No. Static methods are hidden (resolved by reference type), private methods are not visible to the child (a same-named method is a new method), and final methods are explicitly locked against overriding (compile error).',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass A { void m(Object o) { System.out.println("A-Object"); } }\nclass B extends A { void m(String s) { System.out.println("B-String"); } }\nA a = new B(); a.m("hi");',
      a: 'Output: A-Object. B.m(String) is an overload, not an override. The compiler only sees A\'s methods through reference type A and chooses m(Object); B does not override m(Object), so A\'s version runs.',
      level: 'Hard',
    },
    {
      q: 'What is the output?\nclass P { P() { show(); } void show() { System.out.println("P"); } }\nclass C extends P { String s = "hello"; void show() { System.out.println(s); } }\nnew C();',
      a: 'Output: null. P() calls the overridden show() before C\'s field s is initialized.',
      level: 'Hard',
    },
    {
      q: 'What is the output?\nclass P { static void m() { System.out.print("P "); } }\nclass C extends P { static void m() { System.out.print("C "); } }\nP p = new C(); p.m(); ((C) p).m();',
      a: 'Output: P C . Static methods are hidden, so the declared reference type decides.',
      level: 'Medium',
    },
    {
      q: 'What is upcasting and downcasting?',
      a: 'Upcasting: child reference to parent type, implicit and safe. Downcasting: parent reference to child type, explicit cast required, may throw ClassCastException at runtime; check with instanceof first.',
      level: 'Easy',
    },
    {
      q: 'What is a covariant return type?',
      a: 'Since Java 5 an overriding method may return a subtype of the parent method\'s return type, e.g. Animal create() overridden by Dog create().',
      level: 'Medium',
    },
    {
      q: 'What are the exception rules for overriding?',
      a: 'The overriding method may throw any unchecked exception, and the same, a subclass of, or no checked exception compared to the parent. It cannot add new or broader checked exceptions (e.g. parent throws IOException, child cannot throw Exception).',
      level: 'Hard',
    },
    {
      q: 'Why should we use @Override?',
      a: 'It tells the compiler you intend to override. If the signature does not match (typo, wrong parameter type), compilation fails instead of silently creating a new overloaded method.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create Shape, Rect, Square and Triangle with overridden area(); compute the total area using a Shape[] array.',
      hint: 'Square can extend Rect and call super(s, s).',
      solution: pr1,
    },
    {
      task: 'Write a factory method that returns Email, Sms or Notification objects, and call send() polymorphically.',
      hint: 'Return type of the factory is the parent class.',
      solution: pr2,
    },
    {
      task: 'Write act(Animal a) that safely downcasts to Dog or Cat and calls their specific methods.',
      hint: 'Use if (a instanceof Dog d).',
      solution: pr3,
    },
    {
      task: 'In a parent method info(), call the overridable speed() so each subclass prints its own max speed.',
      hint: 'getClass().getSimpleName() gives the runtime class name.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Runtime polymorphism in Java is achieved by...',
      options: ['Method overloading', 'Constructor overloading', 'Method overriding', 'Static methods'],
      answer: 2,
      explanation: 'Overridden methods are resolved at runtime via dynamic dispatch.',
    },
    {
      question: 'Parent method is protected. Which access is allowed for the overriding method?',
      options: ['private', 'default', 'public', 'None of these'],
      answer: 2,
      explanation: 'Access can stay the same or become wider: protected or public.',
    },
    {
      question: 'Animal a = new Dog(); Cat c = (Cat) a; What happens?',
      options: ['ClassCastException at runtime', 'Compile error', 'Works fine', 'a becomes null'],
      answer: 0,
      explanation: 'Cat and Dog are in the same hierarchy, so it compiles, but the object is a Dog.',
    },
    {
      question: 'Which of these is resolved by the actual object type at runtime?',
      options: ['Field access', 'Static method call', 'Overloaded method choice', 'Overridden instance method call'],
      answer: 3,
      explanation: 'Only overridden instance methods use dynamic dispatch.',
    },
    {
      question: 'Which method CAN be overridden?',
      options: ['A final method', 'A public instance method', 'A static method', 'A private method'],
      answer: 1,
      explanation: 'Non-final, non-static, non-private instance methods can be overridden.',
    },
  ],
};
