const j = String.raw;

const ex1 = j`class Student {
    // state (fields / instance variables)
    int rollNo;
    String name;
    int marks;

    // behaviour (method)
    void display() {
        System.out.println("Roll: " + rollNo + ", Name: " + name + ", Marks: " + marks);
    }

    boolean hasPassed() {
        return marks >= 40;
    }
}

public class Main {
    public static void main(String[] args) {
        Student s1 = new Student();
        s1.rollNo = 101;
        s1.name = "Asha";
        s1.marks = 88;

        Student s2 = new Student();
        s2.rollNo = 102;
        s2.name = "Vikram";
        s2.marks = 35;

        s1.display();
        s2.display();
        System.out.println(s1.name + " passed? " + s1.hasPassed());
        System.out.println(s2.name + " passed? " + s2.hasPassed());

        Student s3 = new Student();      // fields keep default values
        s3.display();
    }
}`;

const ex2Account = j`public class BankAccount {
    String holder;
    double balance;

    void deposit(double amount) {
        balance += amount;
        System.out.println("Deposited " + amount + ". Balance: " + balance);
    }

    void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient balance for " + amount + ". Balance: " + balance);
        } else {
            balance -= amount;
            System.out.println("Withdrew " + amount + ". Balance: " + balance);
        }
    }
}`;

const ex2Main = j`public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount();
        acc.holder = "Neha";
        acc.balance = 5000;

        System.out.println("Account holder: " + acc.holder);
        acc.deposit(2000);
        acc.withdraw(10000);
        acc.withdraw(1500);
    }
}`;

const ex3 = j`class Car {
    String model;
}

public class Main {
    public static void main(String[] args) {
        Car c1 = new Car();
        c1.model = "Nexon";

        Car c2 = c1;              // copy of the REFERENCE, not the object
        c2.model = "Harrier";
        System.out.println("c1.model = " + c1.model);

        Car c3 = new Car();
        c3.model = "Harrier";
        System.out.println("c1 == c2 : " + (c1 == c2));
        System.out.println("c1 == c3 : " + (c1 == c3));

        c2 = null;                // c2 no longer points anywhere
        System.out.println("c2 is null : " + (c2 == null));
        System.out.println("c1 still   : " + c1.model);

        new Car().model = "Punch";   // anonymous object, immediately unreachable
        System.out.println("Anonymous object created and discarded");
    }
}`;

const ex4 = j`class Rectangle {
    int length;
    int width;

    int area() {
        return length * width;
    }

    int perimeter() {
        return 2 * (length + width);
    }
}

public class Main {
    public static void main(String[] args) {
        Rectangle[] rooms = new Rectangle[2];   // array of references (null)
        rooms[0] = new Rectangle();
        rooms[0].length = 4;
        rooms[0].width = 5;
        rooms[1] = new Rectangle();
        rooms[1].length = 3;
        rooms[1].width = 3;

        int totalArea = 0;
        for (int i = 0; i < rooms.length; i++) {
            Rectangle r = rooms[i];
            System.out.println("Room " + (i + 1) + ": area = " + r.area() + ", perimeter = " + r.perimeter());
            totalArea += r.area();
        }
        System.out.println("Total floor area = " + totalArea);
    }
}`;

const ex5 = j`abstract class Animal {                    // ABSTRACTION: cannot create a plain Animal
    private String name;                      // ENCAPSULATION: hidden data

    Animal(String name) {
        this.name = name;
    }

    String getName() {                        // controlled access
        return name;
    }

    abstract String sound();                  // what, not how

    void introduce() {
        System.out.println(getName() + " says " + sound());
    }
}

class Dog extends Animal {                    // INHERITANCE: Dog is an Animal
    Dog(String name) {
        super(name);
    }

    String sound() {                          // POLYMORPHISM: own version
        return "Woof";
    }
}

class Cat extends Animal {
    Cat(String name) {
        super(name);
    }

    String sound() {
        return "Meow";
    }
}

public class Main {
    public static void main(String[] args) {
        Animal[] pets = { new Dog("Tommy"), new Cat("Kitty") };
        for (Animal a : pets) {
            a.introduce();                    // same call, different behaviour
        }
    }
}`;

export default {
  id: 'day-15-oop-concepts-classes-objects',
  title: 'OOP Concepts, Classes and Objects',
  module: 'Module 3: Object-Oriented Programming',
  day: 15,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Step into Object-Oriented Programming: understand why OOP exists, the four pillars (encapsulation, inheritance, polymorphism, abstraction), and how to design classes and create, use and reference objects in Java.',
  objectives: [
    'Explain procedural vs object-oriented programming and the benefits of OOP',
    'Describe the four pillars of OOP with real-world examples',
    'Define a class with fields and methods and create objects using new',
    'Explain state, behaviour and identity of an object and how references work in memory',
    'Work with multiple objects, arrays of objects and null references',
  ],
  theory: [
    {
      heading: 'Procedural vs Object-Oriented Programming',
      content: j`Procedural programming (C) organises a program as a list of functions that operate on separate data. As programs grow, data is passed everywhere and any function can change it - hard to manage.

Object-Oriented Programming (OOP) organises a program around OBJECTS that bundle data and the methods that work on that data, modelling the real world.

Example: a banking app.
- Procedural: variables balance1, balance2 ... and functions deposit(balance, amount).
- OOP: a BankAccount class; each account object has its own balance and its own deposit() and withdraw() methods.

Benefits of OOP:
- Modularity: each class is a self-contained unit
- Reusability: inherit and reuse existing classes
- Maintainability: changes stay inside one class
- Security: hide data with access control
- Real-world modelling: code reads like the business domain`,
    },
    {
      heading: 'The Four Pillars of OOP',
      content: j`1. Encapsulation - wrapping data and methods together and hiding the data (private fields + public getters/setters).
   Analogy: a medicine capsule hides the bitter powder inside; an ATM hides cash and lets you access it only through PIN-protected operations.

2. Inheritance - a new class acquires the properties and behaviour of an existing class (extends). "IS-A" relationship.
   Analogy: a child inherits features from parents; a Car IS-A Vehicle.

3. Polymorphism - one name, many forms. The same method call behaves differently depending on the object (overloading and overriding).
   Analogy: a person is a son at home, an employee at office, a customer at a shop. "speak()" sounds different for a Dog and a Cat.

4. Abstraction - showing only essential features and hiding implementation details (abstract classes, interfaces).
   Analogy: you drive a car using steering, brake and accelerator without knowing how the engine works.

These are covered in detail on Days 19-23. Today we focus on the foundation: classes and objects.`,
      tip: 'Interview answer template: name the pillar, give a one-line definition, a real-world analogy and the Java keyword(s) used to implement it.',
    },
    {
      heading: 'Class: The Blueprint',
      content: j`A class is a user-defined data type / template / blueprint that describes what an object will contain and do. It does NOT occupy memory for data by itself.

Analogy: the architect's house plan is the class. You can build many houses (objects) from one plan; each house has its own paint colour and owner.

A class can contain:
- Fields (instance variables) -> the STATE
- Methods -> the BEHAVIOUR
- Constructors -> initialise new objects (Day 17)
- Blocks, nested classes (later days)`,
      syntax: j`class ClassName {
    // fields
    dataType fieldName;

    // methods
    returnType methodName(parameters) {
        // body
    }
}`,
    },
    {
      heading: 'Object: The Real Thing',
      content: j`An object is an instance of a class: a real entity created in memory at runtime.

Student s1 = new Student();

What happens:
1. Student s1 -> declares a reference variable on the STACK (inside main's frame).
2. new Student() -> allocates memory on the HEAP for the fields and sets them to default values (0, null, false).
3. The constructor runs.
4. = stores the address (reference) of the heap object in s1.

  Stack (main)            Heap
  +-------------+        +-----------------------+
  | s1  |  ref ------->  | rollNo=101            |
  | s2  |  ref ----+     | name="Asha" marks=88  |
  +-------------+  |     +-----------------------+
                   +-->  +-----------------------+
                         | rollNo=102 ...        |
                         +-----------------------+

Every object has:
- State: values of its fields (name = "Asha")
- Behaviour: what it can do (display(), hasPassed())
- Identity: a unique existence in memory (two objects with equal data are still different objects)`,
    },
    {
      heading: 'Accessing Members, References and null',
      content: j`Use the dot operator: objectReference.field or objectReference.method().

Reference assignment does NOT copy the object:
Car c1 = new Car();
Car c2 = c1;        // both point to the same object
c2.model = "X";     // c1.model is also "X"

== on objects compares references (same object?), not content.

null means the reference points to no object. Calling a method or field on null throws NullPointerException.

Garbage collection: when no reference points to an object, it becomes eligible for garbage collection and the JVM frees its memory automatically.

Anonymous object: new Car().start(); - used once without storing a reference.`,
    },
    {
      heading: 'Ways to Create Objects and Good Class Design',
      content: j`Ways to create objects in Java:
1. new keyword (most common)
2. Cloning: obj.clone()
3. Deserialization (reading an object from a file/stream)
4. Reflection: Class.forName("Student").getDeclaredConstructor().newInstance()
5. Factory methods: List.of(), LocalDate.now() (they use new internally)

Good class design for beginners:`,
      points: [
        'Class names are nouns in PascalCase (Student, Invoice); methods are verbs (calculateTotal)',
        'One class = one responsibility (Single Responsibility Principle)',
        'Keep fields private and expose methods (we will do this properly on Day 19)',
        'Each public class in its own file named after it',
        'Avoid putting all logic in main: let objects do the work',
      ],
    },
  ],
  examples: [
    {
      title: 'Student class with two objects',
      scenario: 'Model students in a school system: each student object holds its own data and can display itself.',
      steps: [
        'IntelliJ: right-click src > New > Java Class > Main (keep Student in the same file for now); Eclipse: New > Class > Main',
        'Type the Student class above Main (without public) and the main method',
        'Run and see each object print its own data',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Roll: 101, Name: Asha, Marks: 88
Roll: 102, Name: Vikram, Marks: 35
Asha passed? true
Vikram passed? false
Roll: 0, Name: null, Marks: 0`,
      explanation: 's1 and s2 are separate objects, each with its own fields. hasPassed() uses the marks of the object it is called on: 88 >= 40 is true, 35 >= 40 is false. s3 was never assigned values, so its fields keep the defaults 0 and null.',
    },
    {
      title: 'BankAccount class in its own file',
      scenario: 'A real project keeps each class in a separate file. Model a bank account with deposit and withdraw behaviour.',
      steps: [
        'Eclipse: right-click src > New > Class > BankAccount (untick main). IntelliJ: right-click src > New > Java Class > BankAccount',
        'Create Main.java with the main method',
        'Run Main; from the command line use javac *.java then java Main',
      ],
      code: `// File: BankAccount.java
${ex2Account}

// File: Main.java
${ex2Main}`,
      java: { files: { 'Main.java': ex2Main, 'BankAccount.java': ex2Account } },
      result: `Account holder: Neha
Deposited 2000.0. Balance: 7000.0
Insufficient balance for 10000.0. Balance: 7000.0
Withdrew 1500.0. Balance: 5500.0`,
      explanation: 'balance is a double, so values print with .0, and the int arguments 2000, 10000 and 1500 are widened to double. 5000 + 2000 = 7000. 10000 > 7000, so the withdrawal is refused. 7000 - 1500 = 5500.',
    },
    {
      title: 'References, == and null',
      scenario: 'Understand that assigning an object variable copies the reference, not the object.',
      steps: [
        'Type the program',
        'Draw stack and heap boxes on paper for c1, c2 and c3',
        'Run and compare with your drawing',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `c1.model = Harrier
c1 == c2 : true
c1 == c3 : false
c2 is null : true
c1 still   : Harrier
Anonymous object created and discarded`,
      explanation: 'c2 = c1 makes both point to the same Car, so changing c2.model changes what c1 sees. c3 is a different object with the same data, so c1 == c3 is false. Setting c2 to null does not affect the object, which c1 still references. The anonymous Car has no reference and becomes eligible for garbage collection.',
    },
    {
      title: 'Methods that return values and an array of objects',
      scenario: 'An interior designer calculates area and perimeter of rooms stored in an array.',
      steps: [
        'Create class Rectangle with area() and perimeter() methods that return int',
        'In main create a Rectangle array and fill each slot with a new object',
        'Loop, print each room and sum the areas; run',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Room 1: area = 20, perimeter = 18
Room 2: area = 9, perimeter = 12
Total floor area = 29`,
      explanation: 'new Rectangle[2] creates only two null references; each object must be created with new Rectangle(). Room 1: 4 * 5 = 20, 2 * (4 + 5) = 18. Room 2: 3 * 3 = 9, 2 * 6 = 12. Total 20 + 9 = 29.',
    },
    {
      title: 'Preview: the four pillars in one program',
      scenario: 'See encapsulation, inheritance, polymorphism and abstraction working together with pets.',
      steps: [
        'Type all four classes in Main.java (only Main is public)',
        'Read the comments that label each pillar',
        'Run - you will study each pillar in detail on Days 19-23',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Tommy says Woof
Kitty says Meow`,
      explanation: 'name is private (encapsulation) and read through getName(). Dog and Cat extend Animal (inheritance). Animal is abstract and declares sound() without a body (abstraction). The same call a.introduce() produces different sounds depending on the actual object (polymorphism).',
    },
  ],
  interview: [
    { q: 'What is OOP?', a: 'Object-Oriented Programming is a paradigm that organises software as objects that combine state (data) and behaviour (methods), based on the principles of encapsulation, inheritance, polymorphism and abstraction.', level: 'Easy' },
    { q: 'What is the difference between a class and an object?', a: 'A class is a blueprint/template that defines fields and methods; it is a logical entity. An object is a runtime instance of a class occupying heap memory with its own state.', level: 'Easy' },
    { q: 'Explain the four pillars of OOP.', a: 'Encapsulation: bundle data and methods and hide data (private + getters/setters). Inheritance: a class acquires another class\'s members (extends). Polymorphism: one interface, many forms (overloading, overriding). Abstraction: expose what an object does, hide how (abstract classes, interfaces).', level: 'Medium' },
    { q: 'What happens when you write Student s = new Student();?', a: 'A reference variable s is created on the stack, memory for a Student object is allocated on the heap with default field values, the constructor runs, and the object\'s reference is stored in s.', level: 'Medium' },
    { q: 'Where are objects and reference variables stored?', a: 'Objects (and their instance fields) live on the heap. Local reference variables live on the stack in the method\'s frame.', level: 'Medium' },
    { q: 'What is the output: Car a = new Car(); a.model = "X"; Car b = a; b.model = "Y"; System.out.println(a.model);', a: 'Y. a and b refer to the same object.', level: 'Easy' },
    { q: 'What is an anonymous object?', a: 'An object created without storing its reference, e.g. new Calculator().add(2, 3). It can be used only once.', level: 'Easy' },
    { q: 'What happens if you call a method on a null reference?', a: 'NullPointerException is thrown at runtime.', level: 'Easy' },
    { q: 'How many ways are there to create an object in Java?', a: 'Using new, clone(), deserialization, reflection (Constructor.newInstance()), and factory/builder methods that use these internally.', level: 'Hard' },
    { q: 'What is the state, behaviour and identity of an object?', a: 'State: the current values of its fields. Behaviour: the methods it can perform. Identity: its unique existence in memory, which distinguishes it from other objects even with equal state.', level: 'Medium' },
    { q: 'Does creating an array of objects create the objects?', a: 'No. new Student[3] creates an array of 3 null references. Each Student must be created separately with new.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a class Book with title, author and price, and a method display(). Create three books and print them.',
      hint: 'Create three objects with new Book() and assign fields.',
      solution: j`class Book {
    String title;
    String author;
    double price;

    void display() {
        System.out.println(title + " by " + author + " - Rs. " + price);
    }
}

public class Main {
    public static void main(String[] args) {
        Book b1 = new Book();
        b1.title = "Head First Java";
        b1.author = "Kathy Sierra";
        b1.price = 650;
        Book b2 = new Book();
        b2.title = "Effective Java";
        b2.author = "Joshua Bloch";
        b2.price = 900;
        Book b3 = new Book();
        b3.title = "Clean Code";
        b3.author = "Robert Martin";
        b3.price = 750;
        b1.display();
        b2.display();
        b3.display();
    }
}`,
    },
    {
      task: 'Create a class Circle with radius and methods area() and circumference() that return double. Print both for radius 7 using printf with 2 decimals.',
      hint: 'area = Math.PI * r * r; circumference = 2 * Math.PI * r.',
      solution: j`class Circle {
    double radius;

    double area() {
        return Math.PI * radius * radius;
    }

    double circumference() {
        return 2 * Math.PI * radius;
    }
}

public class Main {
    public static void main(String[] args) {
        Circle c = new Circle();
        c.radius = 7;
        System.out.printf("Area = %.2f%n", c.area());
        System.out.printf("Circumference = %.2f%n", c.circumference());
    }
}`,
    },
    {
      task: 'Create an Employee class with name and salary and a method raiseSalary(double percent). Store 3 employees in an array, give everyone a 10% raise and print them.',
      hint: 'salary += salary * percent / 100;',
      solution: j`class Employee {
    String name;
    double salary;

    void raiseSalary(double percent) {
        salary += salary * percent / 100;
    }
}

public class Main {
    public static void main(String[] args) {
        String[] names = {"Arun", "Bela", "Chitra"};
        double[] salaries = {30000, 45000, 52000};
        Employee[] team = new Employee[3];
        for (int i = 0; i < team.length; i++) {
            team[i] = new Employee();
            team[i].name = names[i];
            team[i].salary = salaries[i];
        }
        for (Employee e : team) {
            e.raiseSalary(10);
            System.out.println(e.name + ": " + e.salary);
        }
    }
}`,
    },
    {
      task: 'Create a Counter class with a count field and methods increment(), decrement() and reset(). Show that two Counter objects keep separate counts.',
      hint: 'Each object has its own copy of count.',
      solution: j`class Counter {
    int count;

    void increment() { count++; }
    void decrement() { count--; }
    void reset() { count = 0; }
}

public class Main {
    public static void main(String[] args) {
        Counter a = new Counter();
        Counter b = new Counter();
        a.increment();
        a.increment();
        a.increment();
        b.increment();
        b.decrement();
        b.decrement();
        System.out.println("a = " + a.count + ", b = " + b.count);
        a.reset();
        System.out.println("after reset a = " + a.count);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which statement best describes a class?', options: ['An instance in memory', 'A blueprint that defines state and behaviour', 'A variable that stores an address', 'A method of an object'], answer: 1, explanation: 'A class is a template; objects are the instances created from it.' },
    { question: 'Where is the object created by new Student() stored?', options: ['Stack', 'String Pool', 'Heap', 'CPU cache'], answer: 2, explanation: 'All objects are allocated on the heap; references may live on the stack.' },
    { question: 'Which OOP pillar is about hiding internal data using private fields?', options: ['Encapsulation', 'Inheritance', 'Polymorphism', 'Compilation'], answer: 0, explanation: 'Encapsulation bundles data with methods and restricts direct access.' },
    { question: 'Student[] arr = new Student[5]; How many Student objects are created?', options: ['5', '1', '6', '0'], answer: 3, explanation: 'Only the array object is created; its 5 slots are null.' },
    { question: 'What prints? Car a = new Car(); Car b = new Car(); System.out.println(a == b);', options: ['true', 'false', 'Compile error', 'NullPointerException'], answer: 1, explanation: 'Two separate objects have different identities, so == is false.' },
  ],
};
