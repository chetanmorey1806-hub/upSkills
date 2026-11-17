const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
        System.out.println("Welcome to Day 1 of Core Java.");
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        String language = "Java";
        int firstReleaseYear = 1995;
        String creator = "James Gosling";
        String company = "Sun Microsystems";

        System.out.println("Language : " + language);
        System.out.println("Released : " + firstReleaseYear);
        System.out.println("Creator  : " + creator);
        System.out.println("Company  : " + company);
        System.out.println("Owned by : Oracle (since 2010)");
    }
}`;

const ex3 = j`class Car {
    String brand;
    int speed;

    void accelerate(int amount) {
        speed = speed + amount;
        System.out.println(brand + " speed is now " + speed + " km/h");
    }
}

public class Main {
    public static void main(String[] args) {
        Car car = new Car();      // object created on the heap
        car.brand = "Tata";
        car.speed = 0;
        car.accelerate(40);
        car.accelerate(20);
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        int a = 25;
        int b = 17;
        int sum = a + b;
        // The same .class file prints the same answer on Windows, Linux and macOS
        System.out.println("Sum of " + a + " and " + b + " is " + sum);
        System.out.println("This bytecode runs on any OS that has a JVM.");
    }
}`;

export default {
  id: 'day-01-introduction-to-java',
  title: 'Introduction to Java, History, Features, JDK vs JRE vs JVM, Platform Independence',
  module: 'Module 1: Java Basics',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand what Java is, where it came from, why it is so popular, and how the JDK, JRE and JVM work together so that one compiled program runs on every operating system.',
  objectives: [
    'Explain what Java is and where it is used in the real world',
    'Describe the history of Java and its main versions (LTS releases 8, 11, 17, 21)',
    'List and explain the important features of Java',
    'Differentiate clearly between JDK, JRE and JVM',
    'Explain how Java achieves platform independence using bytecode',
  ],
  theory: [
    {
      heading: 'What is Java?',
      content: `Java is a high-level, object-oriented, general-purpose programming language. You write code in plain English-like statements, a compiler converts it into an intermediate form called bytecode, and a program called the JVM (Java Virtual Machine) runs that bytecode on any computer.

Real-world analogy: think of Java bytecode as a movie on a USB pen drive and the JVM as a media player. The same movie file plays on any TV that has a compatible player. In the same way, the same .class file runs on Windows, Linux or macOS as long as a JVM is installed.

Where is Java used?
- Enterprise/backend applications (banking, insurance, e-commerce) using Spring Boot
- Android apps (Android SDK is based on Java/Kotlin)
- Big data tools (Hadoop, Kafka, Elasticsearch are written in Java)
- Desktop tools (Eclipse, IntelliJ IDEA themselves are written in Java)
- Cloud and microservices`,
      points: [
        'High-level: you do not manage CPU registers or memory addresses directly',
        'Compiled AND interpreted: javac compiles to bytecode, JVM interprets/JIT-compiles it',
        'Strongly typed: every variable has a fixed data type checked at compile time',
      ],
    },
    {
      heading: 'History of Java',
      content: `- 1991: James Gosling and his team (the "Green Team") at Sun Microsystems started a project for embedded devices like set-top boxes. The language was first called "Oak" (after an oak tree outside Gosling's office).
- 1995: Renamed to "Java" (after Java coffee from Indonesia) and officially released as JDK 1.0 in January 1996. The slogan was "Write Once, Run Anywhere" (WORA).
- 2006-2007: Sun made Java open source (OpenJDK).
- 2010: Oracle Corporation acquired Sun Microsystems, so Java is now owned by Oracle.
- 2014: Java 8 released - lambdas, Stream API, new Date/Time API. Still widely used.
- 2017 onwards: a new Java version every 6 months. Every few versions is an LTS (Long-Term Support) release.

Important LTS versions: Java 8, 11, 17, 21 (and 25). In this course we use Java 17 or 21.`,
      tip: 'Interviewers love asking "Who developed Java and what was its original name?" Answer: James Gosling at Sun Microsystems, originally named Oak.',
    },
    {
      heading: 'Features of Java (Java Buzzwords)',
      content: `Java's features explain why companies trust it for large systems:`,
      points: [
        'Simple: syntax similar to C/C++ but without pointers, operator overloading or manual memory freeing',
        'Object-Oriented: everything is organised as classes and objects (encapsulation, inheritance, polymorphism, abstraction)',
        'Platform Independent: compiled bytecode runs on any OS that has a JVM (WORA)',
        'Secure: no explicit pointers, bytecode verifier, runs inside the JVM sandbox',
        'Robust: strong type checking, exception handling, automatic garbage collection',
        'Portable: size of int is always 32 bits on every machine, unlike C',
        'Architecture Neutral: bytecode is not tied to any CPU architecture',
        'Multithreaded: built-in support for running many tasks at the same time',
        'High Performance: JIT (Just-In-Time) compiler converts hot bytecode into native machine code',
        'Distributed: built-in networking support (sockets, HTTP, RMI)',
        'Dynamic: classes are loaded at runtime when needed',
      ],
    },
    {
      heading: 'JDK vs JRE vs JVM',
      content: `These three terms confuse every beginner. Think of them as nested boxes:

+-----------------------------------------------+
| JDK (Java Development Kit)                    |
|   javac (compiler), jar, javadoc, jshell ...  |
|  +-----------------------------------------+  |
|  | JRE (Java Runtime Environment)          |  |
|  |   Java class libraries (java.lang, ...) |  |
|  |  +-----------------------------------+  |  |
|  |  | JVM (Java Virtual Machine)        |  |  |
|  |  |  Class Loader, Bytecode Verifier, |  |  |
|  |  |  Interpreter, JIT, Garbage Coll.  |  |  |
|  |  +-----------------------------------+  |  |
|  +-----------------------------------------+  |
+-----------------------------------------------+

- JVM: an abstract machine that loads, verifies and executes bytecode. It is platform DEPENDENT (there is a different JVM for Windows, Linux, macOS).
- JRE = JVM + core libraries. Enough to RUN a Java program.
- JDK = JRE + development tools (javac, java, jar, javadoc, jdb, jshell). Needed to DEVELOP Java programs.

Analogy: JVM is the car engine, JRE is the complete car (engine + body + wheels) that you can drive, and JDK is the full car factory workshop that can build and also drive cars.

Note: since Java 11, Oracle no longer ships a separate JRE download. You simply install the JDK.`,
      points: [
        'Developer machine needs: JDK',
        'Machine that only runs a program needs: JRE (or the JDK)',
        'JVM is the part that actually executes bytecode',
      ],
    },
    {
      heading: 'How a Java Program Runs (Compilation and Execution Flow)',
      content: `Hello.java  --(javac)-->  Hello.class (bytecode)  --(java / JVM)-->  Output

Step by step:
1. You write source code in a file named Main.java.
2. The compiler javac checks syntax and types and produces Main.class, which contains bytecode (instructions for the JVM, not for your CPU).
3. You run "java Main". The JVM starts, the Class Loader loads Main.class, the Bytecode Verifier checks it is safe, and the Execution Engine (interpreter + JIT compiler) runs it.
4. The Garbage Collector automatically frees memory of objects no longer used.`,
      syntax: `javac Main.java     // compile: creates Main.class
java Main           // run: JVM executes Main.class (no .class extension)`,
    },
    {
      heading: 'Platform Independence: Why Java is "Write Once, Run Anywhere"',
      content: `In C/C++, the compiler produces machine code for one specific OS and CPU. A .exe built on Windows does not run on Linux.

In Java, javac produces bytecode, which is the same everywhere. Each OS has its own JVM that understands this bytecode and converts it into native instructions.

             Main.class (same bytecode)
            /            |             \\
     JVM (Windows)   JVM (Linux)    JVM (macOS)
         |               |               |
      Windows         Linux            macOS

So: Java (the bytecode) is platform INDEPENDENT, but the JVM is platform DEPENDENT.`,
      tip: 'Common interview trap: "Is JVM platform independent?" No. The JVM is platform dependent; that is exactly what makes the bytecode platform independent.',
    },
  ],
  examples: [
    {
      title: 'Your very first Java program',
      scenario: 'Print a welcome message to the console to verify that Java works.',
      steps: [
        'In IntelliJ IDEA: File > New > Project > Java, then right-click src > New > Java Class > name it Main',
        'In Eclipse: File > New > Java Project, then right-click src > New > Class > name Main, tick "public static void main"',
        'Type the code below',
        'Click the green Run button (IntelliJ) or Run As > Java Application (Eclipse)',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Hello, Java!
Welcome to Day 1 of Core Java.`,
      explanation: 'public class Main declares a class. main() is the entry point that the JVM calls. System.out.println() prints text and moves to the next line, so each message appears on its own line.',
    },
    {
      title: 'Printing Java history facts',
      scenario: 'Store facts about Java in variables and print them in a neat format.',
      steps: [
        'Create a class Main in your IDE',
        'Declare String and int variables for each fact',
        'Use + to join (concatenate) text with values and print',
        'Run the program',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Language : Java
Released : 1995
Creator  : James Gosling
Company  : Sun Microsystems
Owned by : Oracle (since 2010)`,
      explanation: 'The + operator joins a String with any value. When one side is a String, the int 1995 is converted to text "1995". Spaces inside the quotes are printed exactly, which is how the colons line up.',
    },
    {
      title: 'Object-oriented feature in action',
      scenario: 'Model a real-world Car as a class and create an object from it, showing Java is object-oriented.',
      steps: [
        'Create Main.java and write two classes in it: Car (not public) and Main (public)',
        'Create a Car object with new',
        'Call the accelerate method twice',
        'Run and observe how the object remembers its speed',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Tata speed is now 40 km/h
Tata speed is now 60 km/h`,
      explanation: 'A class is a blueprint; an object is a real thing built from it. The object keeps its own state (speed). First call: 0 + 40 = 40. Second call: 40 + 20 = 60. Only one class in a file can be public and the file name must match it (Main.java).',
    },
    {
      title: 'Write once, run anywhere',
      scenario: 'Compile once and run the same bytecode on any operating system.',
      steps: [
        'Open a terminal in the folder containing Main.java',
        'Run: javac Main.java  (creates Main.class)',
        'Run: java Main',
        'Copy Main.class to another OS with a JVM and run java Main again - the output is identical',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Sum of 25 and 17 is 42
This bytecode runs on any OS that has a JVM.`,
      explanation: '25 + 17 = 42. The .class file contains bytecode, not Windows or Linux machine code, so any JVM can run it. This is platform independence.',
    },
  ],
  interview: [
    { q: 'What is Java?', a: 'Java is a high-level, class-based, object-oriented, platform-independent programming language developed by James Gosling at Sun Microsystems in 1995 and now owned by Oracle. Source code is compiled to bytecode which runs on the JVM.', level: 'Easy' },
    { q: 'What was the original name of Java?', a: 'Oak. It was renamed Java in 1995 because "Oak" was already a trademark.', level: 'Easy' },
    { q: 'Difference between JDK, JRE and JVM?', a: 'JVM executes bytecode. JRE = JVM + class libraries, needed to run programs. JDK = JRE + development tools like javac, jar, javadoc, needed to develop programs.', level: 'Easy' },
    { q: 'Is Java platform independent? Is the JVM platform independent?', a: 'Java bytecode is platform independent. The JVM is platform dependent: each OS has its own JVM implementation that translates the same bytecode into native code.', level: 'Medium' },
    { q: 'What is bytecode?', a: 'Bytecode is the intermediate, platform-neutral instruction set produced by javac and stored in .class files. The JVM interprets it or JIT-compiles it into machine code.', level: 'Easy' },
    { q: 'What is the JIT compiler?', a: 'The Just-In-Time compiler is part of the JVM execution engine. It finds frequently executed ("hot") bytecode and compiles it to native machine code at runtime, which greatly improves performance.', level: 'Medium' },
    { q: 'Why is Java called secure?', a: 'No explicit pointers, bytecode verifier checks code before execution, class loaders separate namespaces, runs inside the JVM, and strong type checking plus exception handling.', level: 'Medium' },
    { q: 'Why does Java not support pointers?', a: 'Pointers allow direct memory access which can cause security problems and memory corruption. Java uses references managed by the JVM instead.', level: 'Medium' },
    { q: 'What is the output of: System.out.println("Java" + 8 + 9);', a: 'Java89. Evaluation goes left to right: "Java" + 8 = "Java8" (String), then "Java8" + 9 = "Java89".', level: 'Medium' },
    { q: 'What is the output of: System.out.println(8 + 9 + "Java");', a: '17Java. 8 + 9 = 17 is integer addition first, then 17 + "Java" becomes "17Java".', level: 'Medium' },
    { q: 'What are LTS versions of Java?', a: 'Long-Term Support versions receive updates for many years and are preferred in companies: Java 8, 11, 17, 21 and 25.', level: 'Easy' },
    { q: 'Is Java purely object-oriented?', a: 'No. Java has primitive data types (int, char, boolean etc.) which are not objects, and static members can be used without objects. So it is not 100% pure OOP.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a program that prints your name, city and the course you are learning on three separate lines.',
      hint: 'Use three System.out.println statements.',
      solution: j`public class Main {
    public static void main(String[] args) {
        System.out.println("Name   : Ravi");
        System.out.println("City   : Pune");
        System.out.println("Course : Java Full Stack");
    }
}`,
    },
    {
      task: 'Print a box diagram showing JDK containing JRE containing JVM using println statements.',
      hint: 'Each line of the diagram is one println.',
      solution: j`public class Main {
    public static void main(String[] args) {
        System.out.println("+---------------------------+");
        System.out.println("| JDK  (javac, jar, ...)    |");
        System.out.println("|  +---------------------+  |");
        System.out.println("|  | JRE (libraries)     |  |");
        System.out.println("|  |  +---------------+  |  |");
        System.out.println("|  |  | JVM           |  |  |");
        System.out.println("|  |  +---------------+  |  |");
        System.out.println("|  +---------------------+  |");
        System.out.println("+---------------------------+");
    }
}`,
    },
    {
      task: 'Store the years of Java LTS releases (2014, 2018, 2021, 2023) in variables and print "Java 8 -> 2014" style lines.',
      hint: 'Join text and int values using +.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int java8 = 2014, java11 = 2018, java17 = 2021, java21 = 2023;
        System.out.println("Java 8 -> " + java8);
        System.out.println("Java 11 -> " + java11);
        System.out.println("Java 17 -> " + java17);
        System.out.println("Java 21 -> " + java21);
    }
}`,
    },
    {
      task: 'Create a class Mobile with brand and battery fields and a method charge(int percent). Create an object and charge it twice.',
      hint: 'Follow the Car example: increase battery inside the method and print it.',
      solution: j`class Mobile {
    String brand;
    int battery;

    void charge(int percent) {
        battery = battery + percent;
        System.out.println(brand + " battery: " + battery + "%");
    }
}

public class Main {
    public static void main(String[] args) {
        Mobile m = new Mobile();
        m.brand = "Samsung";
        m.battery = 20;
        m.charge(30);
        m.charge(25);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Who is known as the father of Java?', options: ['Dennis Ritchie', 'James Gosling', 'Bjarne Stroustrup', 'Guido van Rossum'], answer: 1, explanation: 'James Gosling led the Green Team at Sun Microsystems that created Java.' },
    { question: 'Which component converts .java source into .class bytecode?', options: ['JVM', 'JRE', 'javac', 'Garbage Collector'], answer: 2, explanation: 'javac is the Java compiler that ships with the JDK.' },
    { question: 'Which of these is platform dependent?', options: ['JVM', 'Bytecode', '.class file', 'Java source code syntax'], answer: 0, explanation: 'Each operating system needs its own JVM implementation.' },
    { question: 'What does JRE contain?', options: ['Only the compiler', 'JDK + tools', 'Only javadoc', 'JVM + core class libraries'], answer: 3, explanation: 'JRE = JVM + libraries; it can run but not compile programs.' },
    { question: 'What does WORA stand for?', options: ['Write Once, Run Anywhere', 'Work On Real Applications', 'Write Object, Run Algorithm', 'Web Oriented Runtime Architecture'], answer: 0, explanation: 'Compile once to bytecode, run on any JVM.' },
  ],
};
