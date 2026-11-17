const ex1 = `class Config {
    static {
        System.out.println("3. Config class loaded (static block)");
    }
    static String appName = "ShopApp";
}

class Unused {
    static {
        System.out.println("This never prints: Unused is never loaded");
    }
}

public class Main {
    static {
        System.out.println("1. Main class loaded");
    }

    public static void main(String[] args) throws Exception {
        System.out.println("2. main() started");
        System.out.println("4. App name: " + Config.appName);   // first use loads Config
        System.out.println("5. Second use: " + Config.appName); // already loaded, no static block

        ClassLoader appLoader = Main.class.getClassLoader();
        System.out.println("String loaded by Bootstrap (null): " + (String.class.getClassLoader() == null));
        System.out.println("Main loaded by Application loader: " + (appLoader == ClassLoader.getSystemClassLoader()));
        System.out.println("Parent of app loader is Platform loader: "
                + (appLoader.getParent() == ClassLoader.getPlatformClassLoader()));

        Class<?> c = Class.forName("Config");   // already loaded: no static block again
        System.out.println("Loaded by name: " + c.getName());
    }
}`;

const ex2 = `class Student {
    String name;
    int marks;
    Student(String name, int marks) { this.name = name; this.marks = marks; }
}

public class Main {
    static int schoolCode = 501;                 // Method Area (metaspace) - class data

    static void changePrimitive(int m) {         // m is a COPY on this method's stack frame
        m = 100;
    }

    static void changeObject(Student s) {        // s is a copy of the REFERENCE
        s.marks = 100;                           // changes the heap object
    }

    static void replaceObject(Student s) {
        s = new Student("New", 0);               // only the local copy points elsewhere
    }

    public static void main(String[] args) {
        int marks = 50;                          // primitive local -> stack
        Student riya = new Student("Riya", 50);  // reference on stack, object on heap
        Student sameRiya = riya;                 // two references, ONE heap object

        changePrimitive(marks);
        System.out.println("Primitive after call: " + marks);

        changeObject(riya);
        System.out.println("Object after change: " + riya.marks);

        replaceObject(riya);
        System.out.println("Object after replace: " + riya.name);

        sameRiya.name = "Riya Sharma";
        System.out.println("Via other reference: " + riya.name);
        System.out.println("School code: " + schoolCode);

        String a = "Java";                       // String pool (part of heap)
        String b = "Java";
        String c = new String("Java");           // new object on heap
        System.out.println("a == b: " + (a == b));
        System.out.println("a == c: " + (a == c));
        System.out.println("a == c.intern(): " + (a == c.intern()));
    }
}`;

const ex3 = `public class Main {
    static int depth = 0;

    static void recurse() {
        depth++;
        recurse();                               // no base case -> stack fills up
    }

    public static void main(String[] args) {
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("Caught StackOverflowError");
            System.out.println("Depth reached more than 1000: " + (depth > 1000));
        }

        try {
            long[][] big = new long[100_000][];
            for (int i = 0; i < big.length; i++) {
                big[i] = new long[1_000_000];    // ~8 MB each, kept reachable
            }
            System.out.println("Allocated everything (very large heap)");
        } catch (OutOfMemoryError e) {
            System.out.println("Caught OutOfMemoryError: " + e.getMessage());
        }

        Runtime rt = Runtime.getRuntime();
        System.out.println("Processors > 0: " + (rt.availableProcessors() > 0));
        System.out.println("Max heap >= total heap: " + (rt.maxMemory() >= rt.totalMemory()));
        System.out.println("Program still running after errors");
    }
}`;

const ex4 = `import java.lang.ref.WeakReference;

class Report {
    final String title;
    Report(String title) { this.title = title; }
}

public class Main {
    public static void main(String[] args) {
        // 1. Nulling a reference
        Report r1 = new Report("Q1");
        r1 = null;                               // Q1 object is now eligible for GC

        // 2. Reassigning a reference
        Report r2 = new Report("Q2");
        r2 = new Report("Q3");                   // Q2 is eligible for GC

        // 3. Object created inside a method
        createTemp();                            // Temp is eligible after method returns

        // 4. Island of isolation: objects reference each other but nothing references them
        Object[] a = new Object[1];
        Object[] b = new Object[1];
        a[0] = b;
        b[0] = a;
        a = null;
        b = null;                                // both eligible together

        System.out.println("Current report: " + r2.title);

        // A WeakReference does not keep its object alive
        Report strong = new Report("Q4");
        WeakReference<Report> weak = new WeakReference<>(strong);
        System.out.println("Weak ref alive while strong ref exists: " + (weak.get() != null));

        System.gc();                             // only a REQUEST; GC may or may not run
        System.out.println("Strong ref keeps it alive after gc(): " + (weak.get() != null));
        System.out.println("Done");
    }

    static void createTemp() {
        Report temp = new Report("Temp");
        System.out.println("Created " + temp.title);
    }
}`;

export default {
  id: 'day-43-jvm-architecture-gc',
  title: 'JVM Architecture, Class Loader, Heap vs Stack, Garbage Collection',
  module: 'Module 8: I/O, JVM & Interview Prep',
  day: 43,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Look inside the Java Virtual Machine: how classes are loaded, how memory is divided into heap, stack, metaspace and other areas, how the JIT compiler speeds up code, and how garbage collection frees unused objects automatically.',
  objectives: [
    'Describe the three main parts of JVM architecture',
    'Explain the class loading process and the class loader delegation model',
    'Differentiate heap memory and stack memory with examples',
    'Explain when objects become eligible for garbage collection and how generational GC works',
    'Recognise StackOverflowError and OutOfMemoryError and common JVM options',
  ],
  theory: [
    {
      heading: 'JVM Architecture Overview',
      content: 'When you run java Main, the JVM starts and works like a factory with three departments. 1) Class Loader Subsystem: the receiving dock that brings .class files in, checks them and prepares them. 2) Runtime Data Areas: the storage rooms (memory). 3) Execution Engine: the workers that actually run bytecode (Interpreter + JIT compiler + Garbage Collector). The Java Native Interface (JNI) lets Java call native C/C++ libraries.',
      syntax: `Main.java --javac--> Main.class (bytecode)
                          |
                    [Class Loader Subsystem]  Loading -> Linking -> Initialization
                          |
                    [Runtime Data Areas]  Method Area | Heap | Stacks | PC Registers | Native Stacks
                          |
                    [Execution Engine]  Interpreter + JIT Compiler + Garbage Collector
                          |
                    JNI <-> Native libraries`,
      points: [
        'JDK = JRE + development tools (javac, jar, jdb). JRE = JVM + core libraries. JVM runs bytecode',
        'Bytecode is platform-independent; the JVM itself is platform-specific',
        'JIT (Just-In-Time) compiler converts frequently used ("hot") bytecode into native machine code for speed',
      ],
    },
    {
      heading: 'Class Loader Subsystem',
      content: 'Classes are loaded lazily — only when first needed (creating an object, calling a static method, accessing a static field). Loading has three phases. Loading: read .class bytes and create a Class object. Linking: Verify (bytecode is safe), Prepare (allocate static variables with default values), Resolve (symbolic references to direct references). Initialization: run static blocks and assign static variable values, top to bottom.',
      points: [
        'Bootstrap ClassLoader: loads core Java classes (java.lang.*, java.base module); written in native code, appears as null',
        'Platform ClassLoader (Extension loader before Java 9): loads other platform modules like java.sql',
        'Application (System) ClassLoader: loads your classes from the classpath',
        'Delegation model: a loader first asks its PARENT; only if the parent cannot find the class does it load it itself — this stops anyone from replacing java.lang.String with a fake one',
        'ClassNotFoundException: Class.forName/loadClass cannot find a class at runtime. NoClassDefFoundError: a class present at compile time is missing at runtime',
      ],
    },
    {
      heading: 'Runtime Data Areas: Heap vs Stack',
      content: 'Think of the HEAP as a big shared warehouse where all objects are stored, and each STACK as a personal notepad for each worker (thread). Every method call puts a new page (stack frame) on the notepad containing its local variables and parameters; when the method returns, the page is torn off.',
      points: [
        'Heap: all objects and arrays, instance variables, String pool; shared by all threads; managed by GC; error: OutOfMemoryError: Java heap space',
        'Stack: one per thread; stack frames with local primitives and object references; LIFO; auto-freed when method returns; error: StackOverflowError',
        'Method Area (Metaspace since Java 8, in native memory): class metadata, static variables, method bytecode, runtime constant pool',
        'PC Register: per thread, address of the current instruction',
        'Native Method Stack: per thread, for native (C/C++) methods',
        'Stack access is faster; heap is larger and shared',
      ],
      syntax: `Student s = new Student("Riya");
// STACK (main frame):  s  ----->  HEAP: Student{name -> "Riya" (String pool)}
// METASPACE: Student class info, static fields`,
    },
    {
      heading: 'Garbage Collection',
      content: 'Garbage Collection (GC) automatically frees memory used by objects that are no longer reachable — like a cleaning staff who removes items nobody has a ticket for. An object is reachable if a chain of references leads to it from a GC root (local variables on stacks, static fields, active threads). You cannot force GC; System.gc() is only a request.',
      points: [
        'Eligible for GC when: reference set to null, reference reassigned, object created in a method that returned, island of isolation',
        'Generational heap: Young Generation (Eden + Survivor S0/S1) and Old (Tenured) Generation',
        'Most objects die young: new objects go to Eden; Minor GC moves survivors to Survivor spaces; long-lived objects are promoted to Old Gen; Major/Full GC cleans Old Gen',
        'Mark and Sweep (and Compact): mark reachable objects, sweep the rest, compact to remove holes',
        'Collectors: Serial, Parallel, G1 (default since Java 9), ZGC and Shenandoah (very low pause times)',
        'finalize() is deprecated (Java 9) and removed for use — use try-with-resources or Cleaner instead',
        'Reference types: Strong, Soft (cleared when memory low), Weak (cleared at next GC), Phantom',
      ],
    },
    {
      heading: 'JVM Options and Tools',
      content: 'You can tune and inspect the JVM with command-line options and tools. In IntelliJ add them in Run > Edit Configurations > Modify options > Add VM options; in Eclipse Run Configurations > Arguments > VM arguments.',
      syntax: `java -Xms256m -Xmx1g Main          # initial and max heap size
java -Xss512k Main                 # thread stack size
java -XX:+UseG1GC Main             # choose G1 collector
java -Xlog:gc Main                 # print GC logs (Java 9+)
jps                                # list Java processes
jstack <pid>                       # thread dump (find deadlocks)
jmap -heap <pid> / jcmd <pid> GC.heap_info
jconsole / VisualVM / Java Mission Control  # visual monitoring`,
      tip: 'Memory leak in Java = objects that are still reachable but no longer needed (e.g. growing static List, unclosed resources, listeners never removed). GC cannot free them because they are still referenced.',
    },
  ],
  examples: [
    {
      title: 'Lazy Class Loading and Class Loaders',
      scenario: 'Observe exactly when classes are loaded and which class loader loads them.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the code with the static blocks', 'Click Run ▶', 'Optional: run "java -verbose:class Main" in a terminal to see every loaded class'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `1. Main class loaded
2. main() started
3. Config class loaded (static block)
4. App name: ShopApp
5. Second use: ShopApp
String loaded by Bootstrap (null): true
Main loaded by Application loader: true
Parent of app loader is Platform loader: true
Loaded by name: Config`,
      explanation: 'Main is initialized before main() runs. Config is initialized only on first access to Config.appName, and its static block runs once. Unused is never referenced, so it is never loaded. The Bootstrap loader is native and shows as null.',
    },
    {
      title: 'Heap vs Stack in Action (Pass-by-Value)',
      scenario: 'Understand where variables and objects live and why Java is always pass-by-value.',
      steps: ['Create Main.java', 'Draw stack frames and heap objects on paper while reading the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Primitive after call: 50
Object after change: 100
Object after replace: Riya
Via other reference: Riya Sharma
School code: 501
a == b: true
a == c: false
a == c.intern(): true`,
      explanation: 'changePrimitive gets a copy of 50 on its own stack frame. changeObject gets a copy of the reference that points to the same heap object, so the change is visible. replaceObject only redirects its local copy. String literals are shared from the String pool; new String creates a separate heap object; intern() returns the pooled one.',
    },
    {
      title: 'StackOverflowError and OutOfMemoryError',
      scenario: 'See the two most famous JVM memory errors and catch them for learning (never do this in production).',
      steps: ['Create Main.java', 'Run ▶', 'In IntelliJ VM options try -Xss256k and see recursion depth shrink'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Caught StackOverflowError
Depth reached more than 1000: true
Caught OutOfMemoryError: Java heap space
Processors > 0: true
Max heap >= total heap: true
Program still running after errors`,
      explanation: 'Infinite recursion keeps adding stack frames until the thread stack is full. The array loop tries to keep ~800 GB reachable, so the heap fills up and OutOfMemoryError: Java heap space is thrown. Exact depth and memory sizes vary by machine, so we print only comparisons. Both are Errors, not Exceptions: normally you fix the cause rather than catch them.',
    },
    {
      title: 'When Do Objects Become Eligible for GC?',
      scenario: 'Identify the four common ways an object becomes unreachable.',
      steps: ['Create Main.java', 'Read each numbered case', 'Run ▶ (add VM option -Xlog:gc to see GC activity)'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Created Temp
Current report: Q3
Weak ref alive while strong ref exists: true
Strong ref keeps it alive after gc(): true
Done`,
      explanation: 'Q1 (nulled), Q2 (reassigned), Temp (method returned) and the two arrays (island of isolation) are all eligible for GC. System.gc() is only a request. Q4 still has a strong reference, so even if GC runs, the weak reference still finds it.',
    },
  ],
  interview: [
    { q: 'Explain JVM architecture.', a: 'Class Loader Subsystem (loading, linking, initialization), Runtime Data Areas (method area/metaspace, heap, JVM stacks, PC registers, native method stacks), and Execution Engine (interpreter, JIT compiler, garbage collector) plus JNI for native libraries.', level: 'Medium' },
    { q: 'What are the types of class loaders?', a: 'Bootstrap (core classes, native), Platform (formerly Extension), and Application/System (classpath). Custom loaders can extend ClassLoader.', level: 'Medium' },
    { q: 'What is the parent delegation model?', a: 'A class loader delegates loading to its parent first; only if the parent fails does it load the class itself. This ensures core classes are loaded by Bootstrap and prevents spoofing.', level: 'Medium' },
    { q: 'Heap vs Stack memory?', a: 'Heap stores objects, is shared among threads and is managed by GC. Stack is per thread, stores frames with local variables and references, is LIFO and freed automatically when methods return.', level: 'Easy' },
    { q: 'What is stored in Metaspace?', a: 'Class metadata: class structure, method bytecode, runtime constant pool and static variables (metadata in native memory since Java 8, replacing PermGen).', level: 'Medium' },
    { q: 'What is the JIT compiler?', a: 'A component of the execution engine that compiles frequently executed bytecode (hot spots) into native machine code at runtime to improve performance.', level: 'Medium' },
    { q: 'When is an object eligible for garbage collection?', a: 'When it is no longer reachable from any GC root: reference nulled, reassigned, out of scope, or part of an island of isolation.', level: 'Easy' },
    { q: 'Can we force garbage collection?', a: 'No. System.gc() or Runtime.getRuntime().gc() only suggests it; the JVM decides.', level: 'Easy' },
    { q: 'Explain Young and Old generation.', a: 'New objects are allocated in Eden (Young). Minor GC copies survivors between Survivor spaces; objects surviving several cycles are promoted to Old Generation, which is cleaned by major/full GC less frequently.', level: 'Hard' },
    { q: 'StackOverflowError vs OutOfMemoryError?', a: 'StackOverflowError: a thread\'s stack is exhausted, typically by deep or infinite recursion. OutOfMemoryError: heap (or metaspace) cannot allocate more objects.', level: 'Medium' },
    { q: 'ClassNotFoundException vs NoClassDefFoundError?', a: 'ClassNotFoundException is a checked exception when loading a class by name (Class.forName) fails. NoClassDefFoundError is an Error when a class available at compile time is missing or failed initialization at runtime.', level: 'Hard' },
    { q: 'Which garbage collector is the default in Java 17/21?', a: 'G1 GC. ZGC (generational in Java 21 with -XX:+UseZGC -XX:+ZGenerational) offers sub-millisecond pauses.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a program with a static block, an instance initializer block and a constructor in a class Demo; create two objects and predict the output order.',
      hint: 'Static block runs once when class loads; instance block runs before the constructor for every object.',
      solution: `class Demo {
    static { System.out.println("static block"); }
    { System.out.println("instance block"); }
    Demo() { System.out.println("constructor"); }
}

public class Main {
    public static void main(String[] args) {
        new Demo();
        new Demo();
        // static block, instance block, constructor, instance block, constructor
    }
}`,
    },
    {
      task: 'Write a recursive factorial with a correct base case, and another without it. Catch StackOverflowError from the bad version.',
      hint: 'if (n <= 1) return 1; is the base case.',
      solution: `public class Main {
    static long fact(int n) { return n <= 1 ? 1 : n * fact(n - 1); }
    static long badFact(int n) { return n * badFact(n - 1); }

    public static void main(String[] args) {
        System.out.println(fact(10)); // 3628800
        try {
            badFact(10);
        } catch (StackOverflowError e) {
            System.out.println("No base case -> StackOverflowError");
        }
    }
}`,
    },
    {
      task: 'Print the JVM memory details (max, total, free memory in MB) and available processors using Runtime.',
      hint: 'Runtime.getRuntime().maxMemory() / (1024 * 1024).',
      solution: `public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        long mb = 1024 * 1024;
        System.out.println("Max heap: " + rt.maxMemory() / mb + " MB");
        System.out.println("Total heap: " + rt.totalMemory() / mb + " MB");
        System.out.println("Free heap: " + rt.freeMemory() / mb + " MB");
        System.out.println("Used heap: " + (rt.totalMemory() - rt.freeMemory()) / mb + " MB");
        System.out.println("Processors: " + rt.availableProcessors());
    }
}`,
    },
    {
      task: 'Demonstrate a simple memory leak: a static List that keeps growing. Then fix it by clearing or limiting the list.',
      hint: 'Use a static List<byte[]> cache; add 1 MB arrays in a loop; fix by removing old entries when size > 10.',
      solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static final List<byte[]> CACHE = new ArrayList<>();

    static void addToCache(byte[] data) {
        CACHE.add(data);
        if (CACHE.size() > 10) CACHE.remove(0);   // fix: bounded cache
    }

    public static void main(String[] args) {
        for (int i = 0; i < 10_000; i++) addToCache(new byte[1024 * 1024]);
        System.out.println("Cache size: " + CACHE.size()); // 10, no OutOfMemoryError
    }
}`,
    },
  ],
  quiz: [
    { question: 'Where are objects created with new stored?', options: ['Stack', 'Heap', 'PC Register', 'Metaspace'], answer: 1, explanation: 'All objects live on the heap; references may be on the stack.' },
    { question: 'Which class loader loads java.lang.String?', options: ['Application', 'Platform', 'Bootstrap', 'Custom'], answer: 2, explanation: 'Core classes are loaded by the Bootstrap loader (shown as null).' },
    { question: 'Infinite recursion results in:', options: ['StackOverflowError', 'OutOfMemoryError: Java heap space', 'NullPointerException', 'ClassCastException'], answer: 0, explanation: 'Each call adds a stack frame until the stack is exhausted.' },
    { question: 'What does System.gc() do?', options: ['Immediately frees all memory', 'Deletes all objects', 'Stops the JVM', 'Requests the JVM to run garbage collection'], answer: 3, explanation: 'It is only a hint; the JVM may ignore it.' },
    { question: 'Since Java 8, class metadata is stored in:', options: ['PermGen', 'Metaspace', 'Eden', 'Stack'], answer: 1, explanation: 'Metaspace (native memory) replaced PermGen.' },
  ],
};
