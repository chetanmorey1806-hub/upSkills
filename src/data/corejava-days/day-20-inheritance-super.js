const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code: parent and child classes are non-public classes in Main.java (in real projects put each in its own file)',
  'Click Run ▶. Tip: in IntelliJ press Ctrl+H on a class to see its type hierarchy (Eclipse: F4)',
];

const ex1 = `class Vehicle {
    String brand = "Generic";
    int wheels;

    void start() {
        System.out.println(brand + " vehicle starting");
    }
}

class Car extends Vehicle {          // Car IS-A Vehicle
    int doors = 4;

    void honk() {
        System.out.println("Beep beep!");
    }
}

public class Main {
    public static void main(String[] args) {
        Car c = new Car();
        c.brand = "Honda";           // inherited field
        c.wheels = 4;                // inherited field
        c.start();                   // inherited method
        c.honk();                    // own method
        System.out.println("Wheels: " + c.wheels + ", Doors: " + c.doors);
    }
}`;

const ex2 = `class Animal {
    void eat() { System.out.println("Animal eats"); }
}

class Dog extends Animal {           // single: Dog -> Animal
    void bark() { System.out.println("Dog barks"); }
}

class Puppy extends Dog {            // multilevel: Puppy -> Dog -> Animal
    void weep() { System.out.println("Puppy weeps"); }
}

class Cat extends Animal {           // hierarchical: Dog and Cat share Animal
    void meow() { System.out.println("Cat meows"); }
}

public class Main {
    public static void main(String[] args) {
        Puppy p = new Puppy();
        p.eat();
        p.bark();
        p.weep();

        Cat c = new Cat();
        c.eat();
        c.meow();

        System.out.println(p instanceof Animal);
        System.out.println(c instanceof Animal);
    }
}`;

const ex3 = `class Parent {
    String name = "Parent";

    void display() {
        System.out.println("Parent display");
    }
}

class Child extends Parent {
    String name = "Child";           // hides Parent's name

    @Override
    void display() {
        System.out.println("Child display");
    }

    void show() {
        System.out.println(name);        // Child's field
        System.out.println(this.name);   // Child's field
        System.out.println(super.name);  // Parent's field
        display();                       // Child's method
        super.display();                 // Parent's method
    }
}

public class Main {
    public static void main(String[] args) {
        new Child().show();
    }
}`;

const ex4 = `class Person {
    String name;

    Person() {
        System.out.println("Person() called");
    }

    Person(String name) {
        this.name = name;
        System.out.println("Person(String) called");
    }
}

class Employee extends Person {
    double salary;

    Employee() {
        // compiler inserts super(); here
        System.out.println("Employee() called");
    }

    Employee(String name, double salary) {
        super(name);                 // must be the first statement
        this.salary = salary;
        System.out.println("Employee(String,double) called");
    }
}

class Manager extends Employee {
    String team;

    Manager(String name, double salary, String team) {
        super(name, salary);
        this.team = team;
        System.out.println("Manager(...) called");
    }
}

public class Main {
    public static void main(String[] args) {
        new Employee();
        System.out.println("---");
        Manager m = new Manager("Divya", 90000, "Payments");
        System.out.println(m.name + " | " + m.salary + " | " + m.team);
    }
}`;

const ex5 = `class Engine {
    int hp;

    Engine(int hp) {
        this.hp = hp;
    }

    void start() {
        System.out.println("Engine with " + hp + " hp started");
    }
}

class Vehicle {
    String name;

    Vehicle(String name) {           // NO no-arg constructor here
        this.name = name;
    }
}

class Bike extends Vehicle {         // Bike IS-A Vehicle (inheritance)
    private Engine engine;           // Bike HAS-A Engine (composition)

    Bike(String name, int hp) {
        super(name);                 // required: Vehicle has no Vehicle()
        engine = new Engine(hp);
    }

    void ride() {
        engine.start();
        System.out.println(name + " is moving");
    }
}

public class Main {
    public static void main(String[] args) {
        new Bike("Pulsar", 15).ride();
    }
}`;

const pr1 = `class Shape {
    String color;
    Shape(String color) { this.color = color; }
    void describe() { System.out.println("A " + color + " shape"); }
}

class Circle extends Shape {
    double r;
    Circle(String color, double r) { super(color); this.r = r; }
    double area() { return Math.PI * r * r; }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle("red", 1);
        c.describe();                                  // A red shape
        System.out.printf("Area = %.2f%n", c.area());  // Area = 3.14
    }
}`;

const pr2 = `class Account {
    protected double balance;
    Account(double balance) { this.balance = balance; }
    void deposit(double amt) { balance += amt; }
}

class SavingsAccount extends Account {
    double rate;
    SavingsAccount(double balance, double rate) { super(balance); this.rate = rate; }
    void addInterest() { deposit(balance * rate / 100); }
}

public class Main {
    public static void main(String[] args) {
        SavingsAccount s = new SavingsAccount(10000, 5);
        s.addInterest();
        System.out.println(s.balance);   // 10500.0
    }
}`;

const pr3 = `class A { A() { System.out.println("A"); } }
class B extends A { B() { System.out.println("B"); } }
class C extends B { C() { System.out.println("C"); } }

public class Main {
    public static void main(String[] args) {
        new C();   // prints A, B, C on separate lines
    }
}`;

const pr4 = `class Employee {
    String name;
    double baseSalary;
    Employee(String name, double baseSalary) { this.name = name; this.baseSalary = baseSalary; }
    double salary() { return baseSalary; }
}

class Developer extends Employee {
    double bonus;
    Developer(String name, double baseSalary, double bonus) {
        super(name, baseSalary);
        this.bonus = bonus;
    }
    @Override
    double salary() { return super.salary() + bonus; }   // reuse parent logic
}

public class Main {
    public static void main(String[] args) {
        Employee e = new Employee("Tom", 30000);
        Developer d = new Developer("Riya", 50000, 8000);
        System.out.println(e.name + " " + e.salary());   // Tom 30000.0
        System.out.println(d.name + " " + d.salary());   // Riya 58000.0
    }
}`;

export default {
  id: 'day-20-inheritance-super',
  title: 'Inheritance, Types of Inheritance and super Keyword',
  module: 'Module 3: Object-Oriented Programming',
  day: 20,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Reuse code by creating child classes with extends, understand single, multilevel and hierarchical inheritance (and why Java avoids multiple inheritance of classes), and use super to reach parent fields, methods and constructors.',
  objectives: [
    'Create parent/child classes with extends and explain the IS-A relationship',
    'Identify the types of inheritance Java supports',
    'Use super.field, super.method() and super(...) correctly',
    'Predict constructor execution order in an inheritance chain',
    'Choose between inheritance (IS-A) and composition (HAS-A)',
  ],
  theory: [
    {
      heading: 'What is Inheritance?',
      content:
        'Inheritance lets a new class (child/subclass) acquire the fields and methods of an existing class (parent/superclass) using extends. Analogy: a child inherits surname and features from parents and can add their own talents. In code: every Car IS-A Vehicle, so Car gets brand and start() for free and adds honk().',
      syntax: `class Parent { ... }
class Child extends Parent { ... }`,
      points: [
        'Main benefit: code reusability and a base for method overriding (runtime polymorphism).',
        'Child inherits public, protected and (same package) default members.',
        'private members are NOT accessible in the child (they exist inside the object, but the child cannot touch them directly; use getters).',
        'Constructors are NOT inherited.',
        'Every class implicitly extends java.lang.Object if no extends is written.',
      ],
    },
    {
      heading: 'Types of Inheritance',
      content:
        'Diagrams in words:\n Single: A <- B\n Multilevel: A <- B <- C (C gets members of both B and A)\n Hierarchical: A <- B and A <- C (one parent, many children)\n Multiple: A, B <- C (one child, two parents) -> NOT allowed with classes\n Hybrid: mix of the above -> only possible through interfaces.',
      points: [
        'Java supports single, multilevel and hierarchical inheritance with classes.',
        'Multiple inheritance of classes is not supported to avoid the Diamond Problem: if B and C both have show() and D extends both, which show() should D get?',
        'Multiple inheritance of TYPE is possible with interfaces: class D implements B, C.',
        'Cyclic inheritance (A extends B, B extends A) is a compile error.',
      ],
    },
    {
      heading: 'The super Keyword',
      content:
        'super refers to the parent-class part of the current object. Analogy: "this" is me, "super" is my parent inside me.',
      points: [
        'super.field: access a parent field hidden by a child field of the same name.',
        'super.method(): call the parent version of an overridden method (to extend rather than replace behaviour).',
        'super(args): call a parent constructor; must be the first statement in a child constructor.',
        'super cannot be used inside static methods.',
      ],
      syntax: `class Child extends Parent {
    Child() {
        super("value");        // parent constructor
        super.display();       // parent method
        System.out.println(super.name);   // parent field
    }
}`,
    },
    {
      heading: 'Constructor Chaining Across Classes',
      content:
        'When you create a child object, the parent part must be built first. Every constructor\'s first statement is this(...) or super(...); if you write neither, the compiler inserts super(). So new Manager() runs Person -> Employee -> Manager, top of the hierarchy first, all the way up to Object.',
      points: [
        'If the parent has only parameterized constructors, the child MUST call super(args) explicitly, otherwise compile error "constructor Parent in class Parent cannot be applied to given types".',
        'Order of output for new C() where C extends B extends A: A, B, C.',
      ],
      tip: 'Common mistake: adding a parameterized constructor to a parent class later breaks all children that relied on the implicit super().',
    },
    {
      heading: 'IS-A (Inheritance) vs HAS-A (Composition)',
      content:
        'Use inheritance only when the child truly IS-A kind of parent (Dog IS-A Animal). Use composition when one object HAS-A another (Car HAS-A Engine): keep the other object as a field. Composition is more flexible and is preferred in modern design ("favor composition over inheritance").',
      points: [
        'Inheritance is tight coupling: parent changes affect all children.',
        'Composition lets you swap parts at runtime (e.g. electric engine).',
      ],
    },
    {
      heading: 'Field Hiding vs Method Overriding',
      content:
        'If a child declares a field with the same name as the parent, it HIDES the parent field; fields are resolved by the reference type at compile time. Methods with the same signature are OVERRIDDEN and resolved by the object type at runtime (covered in detail on Day 21). So Parent p = new Child(); p.name gives "Parent" but p.display() runs Child\'s display().',
    },
  ],
  examples: [
    {
      title: 'Single Inheritance: Vehicle and Car',
      scenario: 'A showroom app already has a Vehicle class; Car should reuse it and add its own feature.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Honda vehicle starting
Beep beep!
Wheels: 4, Doors: 4`,
      explanation:
        'Car did not declare brand, wheels or start(), but it can use them because it extends Vehicle. honk() and doors are Car\'s own members.',
    },
    {
      title: 'Multilevel and Hierarchical Inheritance',
      scenario: 'Model an animal family tree: Puppy -> Dog -> Animal and Cat -> Animal.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Animal eats
Dog barks
Puppy weeps
Animal eats
Cat meows
true
true`,
      explanation:
        'Puppy gets eat() from Animal (two levels up) and bark() from Dog. Cat shares Animal with Dog (hierarchical). instanceof confirms both are Animals.',
    },
    {
      title: 'super with Fields and Methods',
      scenario: 'Child has a field and a method with the same names as the parent; super reaches the parent versions.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Child
Child
Parent
Child display
Parent display`,
      explanation:
        'name and this.name refer to Child\'s field; super.name to the hidden Parent field. display() runs the overriding Child version; super.display() explicitly runs the Parent version.',
    },
    {
      title: 'super() and Constructor Order in a 3-level Hierarchy',
      scenario: 'An HR system: Manager extends Employee extends Person. Watch which constructors run and in which order.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Person() called
Employee() called
---
Person(String) called
Employee(String,double) called
Manager(...) called
Divya | 90000.0 | Payments`,
      explanation:
        'Employee() has an implicit super(), so Person() runs first. Manager calls super(name, salary) which calls super(name): constructors finish from the top (Person) down to Manager. 90000 int is widened to double 90000.0.',
    },
    {
      title: 'IS-A plus HAS-A, and a Parent without a No-arg Constructor',
      scenario: 'A Bike is a Vehicle (inheritance) and has an Engine (composition). Vehicle only has Vehicle(String).',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Engine with 15 hp started
Pulsar is moving`,
      explanation:
        'Because Vehicle has no no-arg constructor, Bike must call super(name) explicitly; removing that line causes a compile error. The Engine is created and used as a field (HAS-A).',
    },
  ],
  interview: [
    {
      q: 'What is inheritance and what are its advantages?',
      a: 'A mechanism where one class acquires properties and behaviour of another using extends (IS-A relationship). Advantages: code reuse, method overriding/runtime polymorphism, easier maintenance and extensibility.',
      level: 'Easy',
    },
    {
      q: 'Why does Java not support multiple inheritance with classes?',
      a: 'To avoid ambiguity known as the Diamond Problem (two parents with the same method, child does not know which to inherit) and to keep the language simple. Multiple inheritance of type is allowed through interfaces.',
      level: 'Easy',
    },
    {
      q: 'What are the uses of the super keyword?',
      a: 'super.field to access a hidden parent field, super.method() to call a parent method that was overridden, super(args) to invoke a parent constructor (first statement only).',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nclass A { A() { System.out.print("A "); } }\nclass B extends A { B() { System.out.print("B "); } }\nclass C extends B { C() { super(); System.out.print("C "); } }\nnew C();',
      a: 'Output: A B C . Each constructor first calls its parent constructor, so the top-most parent finishes first.',
      level: 'Medium',
    },
    {
      q: 'Will this compile?\nclass P { P(int x) { } }\nclass Q extends P { Q() { System.out.println("Q"); } }',
      a: 'No. Q() implicitly calls super(), but P has no no-arg constructor. Fix: call super(10); as the first line of Q().',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass P { String n = "P"; void m() { System.out.print("Pm "); } }\nclass C extends P { String n = "C"; void m() { System.out.print("Cm "); } }\nP obj = new C(); System.out.print(obj.n + " "); obj.m();',
      a: 'Output: P Cm . Fields are resolved by reference type (P) at compile time; overridden methods are resolved by the object type (C) at runtime.',
      level: 'Hard',
    },
    {
      q: 'Are private members and constructors inherited?',
      a: 'Constructors are never inherited. Private fields are present in the child object\'s memory but are not accessible by the child code, so we say they are not inherited; access them via public/protected getters.',
      level: 'Medium',
    },
    {
      q: 'Which class is the parent of all classes in Java?',
      a: 'java.lang.Object. If a class does not extend anything, the compiler makes it extend Object, which provides toString(), equals(), hashCode(), getClass() etc.',
      level: 'Easy',
    },
    {
      q: 'Difference between IS-A and HAS-A relationships?',
      a: 'IS-A is inheritance (Dog extends Animal). HAS-A is composition/aggregation (Car has an Engine field). HAS-A is looser coupling and usually preferred unless there is a true IS-A relationship.',
      level: 'Medium',
    },
    {
      q: 'Can we use both this() and super() in one constructor? Can super be used in a static method?',
      a: 'No to both. Only one of this()/super() can be the first statement. super refers to the current object\'s parent part, and static methods have no current object.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create Shape(color) and Circle(color, radius) using inheritance; print the description and area.',
      hint: 'Circle constructor must call super(color).',
      solution: pr1,
    },
    {
      task: 'Create SavingsAccount extending Account with an addInterest() method that reuses deposit().',
      hint: 'Interest = balance * rate / 100.',
      solution: pr2,
    },
    {
      task: 'Write a 3-level hierarchy A -> B -> C where each constructor prints its name. Predict the output first.',
      hint: 'Implicit super() calls.',
      solution: pr3,
    },
    {
      task: 'Create Developer extending Employee where salary() adds a bonus to the parent\'s salary using super.salary().',
      hint: 'return super.salary() + bonus;',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which keyword is used to inherit a class?',
      options: ['implements', 'inherits', 'extends', 'super'],
      answer: 2,
      explanation: 'class Child extends Parent.',
    },
    {
      question: 'Which type of inheritance is NOT supported with classes in Java?',
      options: ['Single', 'Multiple', 'Multilevel', 'Hierarchical'],
      answer: 1,
      explanation: 'A class cannot extend two classes.',
    },
    {
      question: 'If a child constructor has no this()/super(), the compiler inserts...',
      options: ['super();', 'this();', 'Nothing', 'super(null);'],
      answer: 0,
      explanation: 'An implicit call to the parent no-arg constructor.',
    },
    {
      question: 'Parent p = new Child(); both declare field x. p.x refers to...',
      options: ['Child\'s x', 'Compile error', 'Runtime decides', 'Parent\'s x'],
      answer: 3,
      explanation: 'Fields are not polymorphic; the reference type decides.',
    },
    {
      question: 'Car has a field of type Engine. This relationship is...',
      options: ['IS-A', 'Multiple inheritance', 'HAS-A (composition)', 'Overloading'],
      answer: 2,
      explanation: 'Holding another object as a field is composition.',
    },
  ],
};
