const ex1 = `import java.lang.management.GarbageCollectorMXBean;
import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;

public class Main {
    public static void main(String[] args) {
        Runtime rt = Runtime.getRuntime();
        long mb = 1024 * 1024;
        System.out.println("Processors      : " + rt.availableProcessors());
        System.out.println("Max heap (-Xmx) : " + rt.maxMemory() / mb + " MB");
        System.out.println("Committed heap  : " + rt.totalMemory() / mb + " MB");
        System.out.println("Free in heap    : " + rt.freeMemory() / mb + " MB");

        RuntimeMXBean runtime = ManagementFactory.getRuntimeMXBean();
        System.out.println("Java version    : " + System.getProperty("java.version"));
        System.out.println("JVM arguments   : " + runtime.getInputArguments());

        for (GarbageCollectorMXBean gc : ManagementFactory.getGarbageCollectorMXBeans()) {
            System.out.println("GC: " + gc.getName() + ", collections=" + gc.getCollectionCount()
                    + ", time=" + gc.getCollectionTime() + " ms");
        }
    }
}`;

const ex2 = `import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    // LEAK: a static map lives as long as the class -> entries are never garbage collected
    static final Map<Integer, String> leakyCache = new HashMap<>();

    // FIX: a bounded LRU (Least Recently Used) cache
    static class LruCache<K, V> extends LinkedHashMap<K, V> {
        private final int capacity;

        LruCache(int capacity) {
            super(16, 0.75f, true);          // true = access order (get moves entry to the end)
            this.capacity = capacity;
        }

        @Override
        protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
            return size() > capacity;         // evict oldest when over capacity
        }
    }

    static String loadUser(int id) {
        return "User-" + id;                  // imagine a slow DB call
    }

    public static void main(String[] args) {
        for (int i = 1; i <= 100_000; i++) leakyCache.put(i, loadUser(i));
        System.out.println("Leaky cache size: " + leakyCache.size());

        LruCache<Integer, String> cache = new LruCache<>(3);
        cache.put(1, loadUser(1));
        cache.put(2, loadUser(2));
        cache.put(3, loadUser(3));
        cache.get(1);                         // 1 becomes most recently used
        cache.put(4, loadUser(4));            // evicts 2 (least recently used)
        System.out.println("LRU cache: " + cache);

        for (int i = 1; i <= 100_000; i++) cache.put(i, loadUser(i));
        System.out.println("LRU size after 100000 more puts: " + cache.size());
        System.out.println("LRU cache: " + cache);
    }
}`;

const ex3 = `public class Main {
    static int depth = 0;

    static void recurse() {
        depth++;
        recurse();                            // no base case!
    }

    public static void main(String[] args) {
        try {
            recurse();
        } catch (StackOverflowError e) {
            System.out.println("Caught: " + e.getClass().getName());
            System.out.println("Depth reached > 1000: " + (depth > 1000));
        }

        try {
            long[] huge = new long[Integer.MAX_VALUE];   // ~16 GB, larger than the VM allows
            System.out.println(huge.length);
        } catch (OutOfMemoryError e) {
            System.out.println("Caught: " + e.getClass().getName());
        }

        System.out.println("Program continues normally");
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.List;

// Run with: java -Xms32m -Xmx64m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=./dumps Main
public class Main {
    static class Order {
        private final long id;
        private final byte[] invoicePdf = new byte[100 * 1024];   // 100 KB per order
        Order(long id) { this.id = id; }
    }

    // BUG: every processed order is added to a static list and never removed
    private static final List<Order> processedOrders = new ArrayList<>();

    static void processOrder(long id) {
        Order o = new Order(id);
        // ... business logic ...
        processedOrders.add(o);               // memory leak!
    }

    public static void main(String[] args) throws InterruptedException {
        long id = 0;
        while (true) {
            processOrder(++id);
            if (id % 100 == 0) {
                System.out.println("Processed " + id + " orders, heap used = "
                        + (Runtime.getRuntime().totalMemory() - Runtime.getRuntime().freeMemory()) / (1024 * 1024) + " MB");
                Thread.sleep(200);            // slow down so you can watch it in VisualVM
            }
        }
    }
}`;

const ex5 = `public class Main {
    static final Object lockA = new Object();
    static final Object lockB = new Object();

    public static void main(String[] args) {
        Thread t1 = new Thread(() -> {
            synchronized (lockA) {
                System.out.println("T1 locked A, waiting for B");
                sleep(100);
                synchronized (lockB) {
                    System.out.println("T1 locked B");
                }
            }
        }, "Thread-Payment");

        Thread t2 = new Thread(() -> {
            synchronized (lockB) {
                System.out.println("T2 locked B, waiting for A");
                sleep(100);
                synchronized (lockA) {
                    System.out.println("T2 locked A");
                }
            }
        }, "Thread-Inventory");

        t1.start();
        t2.start();
    }

    static void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
    }
}`;

const ex6 = `# 1. Find the process id (PID) of running Java programs
jps -l
#   12345 Main
#   23456 com.shop.OrderServiceApplication

# 2. Thread dump (look for "BLOCKED" and "Found one Java-level deadlock")
jstack 12345 > threads.txt
jcmd 12345 Thread.print

# 3. Heap information and histogram of live objects
jcmd 12345 GC.heap_info
jmap -histo:live 12345 | head -15

# 4. Heap dump to analyse in VisualVM / Eclipse MAT
jmap -dump:live,format=b,file=heap.hprof 12345
jcmd 12345 GC.heap_dump heap.hprof

# 5. Java Flight Recorder: record 60 seconds of profiling data
java -XX:StartFlightRecording=duration=60s,filename=app.jfr -jar order-service.jar
jcmd 12345 JFR.start duration=60s filename=app.jfr
#   then open app.jfr in JDK Mission Control (jmc)

# 6. Typical production flags for a Spring Boot service
java -Xms1g -Xmx1g \\
     -XX:+UseG1GC -XX:MaxGCPauseMillis=200 \\
     -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=/var/log/app \\
     -Xlog:gc*:file=/var/log/app/gc.log:time,uptime:filecount=5,filesize=10m \\
     -jar order-service.jar

# 7. Low-latency service with very large heap: Generational ZGC (Java 21)
java -Xmx16g -XX:+UseZGC -XX:+ZGenerational -jar trading-service.jar`;

export default {
  id: 'day-15-jvm-performance-tuning',
  title: 'JVM Performance Tuning: Heap Settings, Garbage Collectors, Memory Leaks and Profiling Tools',
  module: 'Module 4: Modern Java, JVM & Desktop',
  day: 15,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Learn how to size the heap with -Xms/-Xmx, choose between G1 and ZGC, find memory leaks and deadlocks, and use jconsole, VisualVM, JFR, jstack, jmap and jcmd to diagnose slow or crashing Java applications.',
  objectives: [
    'Explain heap, stack and metaspace and set them with -Xms, -Xmx, -Xss and -XX:MaxMetaspaceSize',
    'Compare Serial, Parallel, G1 and ZGC collectors and choose one for a given application',
    'Recognise common memory leaks and the different OutOfMemoryError messages',
    'Use jps, jstack, jmap, jcmd, jconsole, VisualVM and Java Flight Recorder to diagnose problems',
    'Follow a step-by-step performance tuning process: measure, find the bottleneck, fix, measure again',
  ],
  theory: [
    {
      heading: 'JVM Memory Areas Recap and Heap Settings',
      content: 'When a Java program runs, the JVM divides memory into areas. The HEAP stores all objects (new Student(), arrays, Strings) and is shared by all threads; it is cleaned by the Garbage Collector. Each thread gets its own STACK for method calls and local variables. METASPACE (native memory) stores class metadata. Analogy: the heap is a big godown where all goods (objects) are kept; each worker (thread) has a personal notepad (stack); the godown register of item types is metaspace.',
      syntax: `-Xms512m                   initial heap size
-Xmx2g                     maximum heap size
-Xss1m                     stack size per thread
-XX:MaxMetaspaceSize=256m  limit for class metadata
-XX:MaxRAMPercentage=75    heap as % of container RAM (Docker/Kubernetes)`,
      points: [
        'Heap is divided into Young generation (Eden + Survivor spaces) and Old generation',
        'Most objects die young; they are collected cheaply by Minor GC in the young generation',
        'Objects that survive several GCs are promoted to Old generation; cleaning it is a Major/Full GC',
        'Setting -Xms equal to -Xmx in servers avoids heap resizing pauses',
        'Too small heap -> frequent GC and OutOfMemoryError; too big heap -> longer GC pauses (for older collectors) and wasted RAM',
        'In containers prefer -XX:MaxRAMPercentage instead of a fixed -Xmx',
      ],
      tip: 'Never just increase -Xmx to "fix" OutOfMemoryError without checking for a leak — a leak will eat any amount of memory, only later.',
    },
    {
      heading: 'Garbage Collectors: Serial, Parallel, G1, ZGC',
      content: 'The Garbage Collector (GC) automatically frees objects that are no longer reachable from GC roots (local variables, static fields, active threads). Different collectors trade off throughput (total work done) and pause time (how long the application freezes). Analogy: cleaning a restaurant — Serial closes the restaurant and one cleaner cleans; Parallel closes it but many cleaners clean fast; G1 cleans section by section while customers continue; ZGC cleans almost entirely while customers keep eating.',
      points: [
        'Serial GC (-XX:+UseSerialGC): single thread, stop-the-world; small apps and tiny containers',
        'Parallel GC (-XX:+UseParallelGC): many threads, best throughput for batch jobs, longer pauses',
        'G1 GC (-XX:+UseG1GC): DEFAULT since Java 9; heap split into regions, collects the most garbage-filled regions first; target pause with -XX:MaxGCPauseMillis=200',
        'ZGC (-XX:+UseZGC): concurrent, pause times under ~1 ms even for multi-terabyte heaps; Generational ZGC added in Java 21 (-XX:+ZGenerational), default mode from Java 23',
        'Shenandoah: another low-pause concurrent collector (in OpenJDK builds)',
        'System.gc() is only a request; avoid calling it in production code',
      ],
    },
    {
      heading: 'Memory Leaks in Java',
      content: 'Java has GC, but leaks still happen when objects are no longer NEEDED but are still REACHABLE, so the GC is not allowed to remove them. Heap usage keeps climbing after every GC, and finally OutOfMemoryError occurs — often after days in production. Analogy: a hostel register where students are added when they join but never removed when they leave; the register keeps growing forever.',
      points: [
        'Static collections (List/Map) that only grow — the most common leak',
        'Caches without size limit or expiry (use an LRU cache, Caffeine, or Spring Cache with TTL)',
        'Listeners/callbacks registered but never unregistered',
        'ThreadLocal values not removed in thread pools (call threadLocal.remove() in finally)',
        'Unclosed resources: JDBC Connection, ResultSet, streams (use try-with-resources)',
        'Keys with wrong equals/hashCode in HashMap, so duplicates keep getting added',
        'Inner (non-static) class objects holding a hidden reference to the outer object',
      ],
      tip: 'Symptom of a leak in VisualVM/jconsole: the heap graph looks like a saw whose lowest points keep rising after each GC.',
    },
    {
      heading: 'Common OutOfMemoryError and StackOverflowError Causes',
      content: 'The message after OutOfMemoryError tells you WHICH memory area is exhausted. Read it carefully before taking action.',
      points: [
        '"Java heap space": heap full — leak, or the heap is genuinely too small for the data (e.g. loading 1 crore rows into a List)',
        '"GC overhead limit exceeded": JVM spends >98% time in GC and recovers <2% — almost always a leak',
        '"Metaspace": too many classes loaded — classloader leaks on redeploys, heavy dynamic proxies',
        '"unable to create native thread": too many threads (thread leak, unbounded new Thread()) or OS limits',
        '"Requested array size exceeds VM limit": trying to create an array bigger than the JVM allows',
        '"Direct buffer memory": NIO direct buffers (Netty, WebFlux) exhausted',
        'StackOverflowError: infinite or very deep recursion, or cyclic toString()/JSON serialization (bidirectional JPA relations)',
      ],
    },
    {
      heading: 'Monitoring and Profiling Tools',
      content: 'The JDK ships powerful free tools. Command-line tools are used on servers; GUI tools on your laptop or by connecting remotely via JMX. Profiling means measuring where CPU time and memory actually go instead of guessing.',
      points: [
        'jps: list running Java processes and their PIDs',
        'jstack <pid>: thread dump — shows each thread state (RUNNABLE, BLOCKED, WAITING) and detects deadlocks',
        'jmap -histo / -dump: object histogram and heap dump (.hprof file)',
        'jcmd <pid> <command>: modern all-in-one tool (Thread.print, GC.heap_info, GC.heap_dump, JFR.start, VM.flags)',
        'jconsole: simple GUI — heap, threads, classes, CPU graphs, "Detect Deadlock" button',
        'VisualVM (separate download): monitor, sampler/profiler (CPU and memory), heap dump browser',
        'Java Flight Recorder (JFR) + JDK Mission Control: very low-overhead always-on recording, safe in production',
        'Eclipse MAT: analyses big heap dumps, finds "Leak Suspects" and dominator tree',
        'Spring Boot Actuator /actuator/metrics, /actuator/heapdump, /actuator/threaddump with Prometheus + Grafana',
      ],
    },
    {
      heading: 'A Practical Performance Tuning Process',
      content: 'Performance tuning is like a doctor treating a patient: first measure (temperature, BP), diagnose, give medicine, then measure again. Never change ten flags at once based on a blog post.',
      points: [
        '1. Define the goal: e.g. p95 response time < 300 ms at 500 requests/sec',
        '2. Measure with load testing (JMeter, Gatling) and monitoring (JFR, Actuator, GC logs)',
        '3. Find the bottleneck: CPU hot methods, slow SQL queries, GC pauses, lock contention, external calls',
        '4. Fix the CODE first: N+1 queries, missing DB indexes, wrong data structures, unnecessary object creation, String concatenation in loops',
        '5. Then tune the JVM: heap size, GC choice, pause target',
        '6. Measure again and compare; keep changes that help',
      ],
      tip: 'In most real Spring Boot apps, the slowness is in the database or network calls, not the JVM. Check SQL logs and connection pool (HikariCP) metrics early.',
    },
  ],
  examples: [
    {
      title: 'Reading Heap and GC Information from Inside a Program',
      scenario: 'Check which heap size and garbage collector your application is actually using after setting JVM options.',
      steps: [
        'Create Main.java and type the code',
        'IntelliJ: Run > Edit Configurations > Modify options > Add VM options, enter: -Xms256m -Xmx512m -XX:+UseG1GC',
        'Eclipse: Run > Run Configurations > Arguments tab > VM arguments: -Xms256m -Xmx512m -XX:+UseG1GC',
        'Command line: javac Main.java, then java -Xms256m -Xmx512m -XX:+UseG1GC Main',
        'Run again with -XX:+UseZGC and compare the GC names',
      ],
      code: ex1,
      result: `Sample output (numbers depend on your machine and JDK):
Processors      : 8
Max heap (-Xmx) : 512 MB
Committed heap  : 256 MB
Free in heap    : 252 MB
Java version    : 21.0.4
JVM arguments   : [-Xms256m, -Xmx512m, -XX:+UseG1GC]
GC: G1 Young Generation, collections=0, time=0 ms
GC: G1 Concurrent GC, collections=0, time=0 ms
GC: G1 Old Generation, collections=0, time=0 ms`,
      explanation: 'Runtime.maxMemory() reflects -Xmx and totalMemory() the currently committed heap (starts at -Xms). GarbageCollectorMXBeans show which collector is active — with -XX:+UseZGC you will see names like "ZGC Cycles"/"ZGC Pauses" instead. This is the same data jconsole and VisualVM show graphically. It is not a fixed output program, so no runnable block is attached.',
    },
    {
      title: 'Memory Leak with a Static Cache and the LRU Fix',
      scenario: 'A user lookup service caches every user it ever loads in a static HashMap. Replace it with a bounded LRU cache.',
      steps: [
        'Create Main.java with the leakyCache and the LruCache class',
        'Run normally and check the printed sizes',
        'Change the leaky loop to 10_000_000 and run with VM option -Xmx64m to see OutOfMemoryError: Java heap space',
        'Observe that the LRU cache never grows beyond its capacity no matter how many puts',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Leaky cache size: 100000
LRU cache: {3=User-3, 1=User-1, 4=User-4}
LRU size after 100000 more puts: 3
LRU cache: {99998=User-99998, 99999=User-99999, 100000=User-100000}`,
      explanation: 'The static HashMap keeps all 1,00,000 users reachable forever — the GC can never free them. LinkedHashMap with accessOrder = true moves an entry to the end on get/put; removeEldestEntry evicts the first (least recently used) entry when size exceeds 3. After get(1) the order is 2, 3, 1, so adding 4 evicts 2. After the big loop only the last three keys remain.',
    },
    {
      title: 'StackOverflowError and OutOfMemoryError in Action',
      scenario: 'See what the two most famous JVM errors look like and how the program behaves after them.',
      steps: [
        'Create Main.java and type the code',
        'Run it; both errors are caught only for learning purposes',
        'Run again with VM option -Xss256k and print depth to see recursion depth reduce with a smaller stack',
        'Remember: in real applications do NOT catch Error subclasses — fix the cause',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Caught: java.lang.StackOverflowError
Depth reached > 1000: true
Caught: java.lang.OutOfMemoryError
Program continues normally`,
      explanation: 'recurse() has no base case, so stack frames pile up until the thread stack is full (usually thousands of calls, exact depth varies — that is why only "> 1000" is printed). new long[Integer.MAX_VALUE] asks for about 16 GB in one array, beyond the JVM array limit, so OutOfMemoryError ("Requested array size exceeds VM limit") is thrown. Both are Errors, not Exceptions.',
    },
    {
      title: 'Finding a Leak with VisualVM and a Heap Dump',
      scenario: 'An order service slowly fills its heap and crashes every few days. Reproduce it with a small heap and find the culprit.',
      steps: [
        'Create Main.java with the code below',
        'Create a folder named dumps in the project directory',
        'Add VM options: -Xms32m -Xmx64m -XX:+HeapDumpOnOutOfMemoryError -XX:HeapDumpPath=./dumps',
        'Install VisualVM (visualvm.github.io), start it, then run the program — it appears under Local applications',
        'Open the Monitor tab: the heap graph rises steadily and GC cannot bring it down',
        'Click "Heap Dump" (or wait for the OutOfMemoryError which writes dumps/java_pidXXXX.hprof)',
        'In the heap dump, open Objects/Classes: byte[] and Main$Order dominate; "GC root" path shows Main.processedOrders static field',
        'Fix: remove the static list (or store only the order id), rerun and see a flat saw-tooth graph',
      ],
      code: ex4,
      result: `Processed 100 orders, heap used = 14 MB
Processed 200 orders, heap used = 24 MB
Processed 300 orders, heap used = 34 MB
Processed 400 orders, heap used = 44 MB
Processed 500 orders, heap used = 54 MB
java.lang.OutOfMemoryError: Java heap space
Dumping heap to ./dumps/java_pid4821.hprof ...
Heap dump file created [66912345 bytes in 0.210 secs]
Exception in thread "main" java.lang.OutOfMemoryError: Java heap space
(sample output — exact numbers and PID vary)`,
      explanation: 'Each Order holds a 100 KB byte array and is added to a static list, so it stays reachable forever. With a 64 MB heap the program dies after roughly 600 orders. The heap dump proves which object holds the memory (the "dominator") and the path from the GC root (the static field). This is the standard way to investigate production OutOfMemoryErrors.',
    },
    {
      title: 'Detecting a Deadlock with jstack and jconsole',
      scenario: 'Two threads lock the same two resources in opposite order and the app hangs. Find out why.',
      steps: [
        'Create Main.java and run it — it prints two lines and then hangs forever',
        'Open a terminal and run: jps -l to find the PID of Main',
        'Run: jstack <pid> (or jcmd <pid> Thread.print)',
        'Scroll to the bottom: "Found one Java-level deadlock" lists Thread-Payment and Thread-Inventory and which lock each waits for',
        'Alternatively open jconsole, connect to Main, go to Threads tab and click "Detect Deadlock"',
        'Fix: make both threads acquire locks in the same order (A then B), or use ReentrantLock.tryLock with timeout',
      ],
      code: ex5,
      result: `T1 locked A, waiting for B
T2 locked B, waiting for A
(program hangs; the two lines may appear in either order)

jstack output (excerpt):
Found one Java-level deadlock:
=============================
"Thread-Payment":
  waiting to lock monitor 0x... (object 0x..., a java.lang.Object),
  which is held by "Thread-Inventory"
"Thread-Inventory":
  waiting to lock monitor 0x... (object 0x..., a java.lang.Object),
  which is held by "Thread-Payment"`,
      explanation: 'Thread-Payment holds lockA and waits for lockB, while Thread-Inventory holds lockB and waits for lockA — neither can continue. Naming threads (second argument to new Thread) makes thread dumps much easier to read. In thread dumps, many threads in BLOCKED state on the same lock also indicate lock contention, a common performance problem.',
    },
    {
      title: 'Cheat Sheet: Diagnostic Commands and Production JVM Flags',
      scenario: 'Commands you will actually type on a Linux server when a Java service is slow or crashing.',
      steps: [
        'Open a terminal on the machine where the Java app runs (same user as the app)',
        'Find the PID with jps -l',
        'Take 3 thread dumps 10 seconds apart when the app is slow, and compare which methods appear repeatedly',
        'Record 60 seconds of JFR and open it in JDK Mission Control: check Hot Methods, Allocations, GC pauses and Lock contention',
        'Enable GC logging in production so you can analyse pauses later (e.g. upload gc.log to GCeasy)',
      ],
      code: ex6,
      result: `(commands — output depends on the application)
Example jmap -histo:live output:
 num     #instances         #bytes  class name (module)
-------------------------------------------------------
   1:          5210       53452800  [B (java.base@21)
   2:          5100         122400  Main$Order
   3:          3150          75600  java.lang.String (java.base@21)`,
      explanation: 'A histogram where one application class (Main$Order) has thousands of instances that keep increasing between two runs is a strong leak signal. JFR has about 1% overhead so it is safe in production. The flags block shows a typical G1 setup: fixed heap, a pause-time goal, automatic heap dump on OOM and rotating GC logs. ZGC is chosen when very low pause times matter with big heaps.',
    },
  ],
  interview: [
    { q: 'What do -Xms and -Xmx mean? Why set them equal on servers?', a: '-Xms is the initial heap size and -Xmx the maximum heap size. Setting them equal avoids the cost and pauses of growing/shrinking the heap at runtime and makes memory usage predictable.', level: 'Easy' },
    { q: 'What is the default garbage collector in Java 17/21?', a: 'G1 (Garbage First) GC, on most server-class machines. (On very small machines with 1 CPU or < ~1.8 GB RAM the JVM may pick Serial GC.)', level: 'Easy' },
    { q: 'Compare G1 and ZGC.', a: 'G1 divides the heap into regions, does some work concurrently and targets a pause time (default 200 ms); good general-purpose balance of throughput and latency. ZGC does almost all work concurrently, with pauses typically under 1 ms independent of heap size (up to terabytes); slightly lower throughput, best for latency-sensitive services. Java 21 added Generational ZGC.', level: 'Medium' },
    { q: 'Can Java have memory leaks even with GC? Give examples.', a: 'Yes. GC removes only unreachable objects; leaks are objects that are reachable but no longer needed. Examples: static collections that keep growing, unbounded caches, listeners not removed, ThreadLocal not cleared in thread pools, unclosed resources, wrong equals/hashCode for HashMap keys.', level: 'Medium' },
    { q: 'How do you troubleshoot an OutOfMemoryError in production?', a: 'Read the message (heap space, metaspace, native thread...). Ensure -XX:+HeapDumpOnOutOfMemoryError is set to get a heap dump. Analyse the .hprof in Eclipse MAT or VisualVM: find the biggest retained objects (dominator tree) and their path to GC root. Fix the code (leak) or, if the data is genuinely large, increase heap or process data in batches/streams.', level: 'Hard' },
    { q: 'What is the difference between jstack and jmap?', a: 'jstack prints thread dumps (what each thread is doing, its state and locks) — used for hangs, deadlocks and high CPU. jmap prints heap histograms or creates heap dumps — used for memory problems. jcmd can do both and more.', level: 'Medium' },
    { q: 'What is Java Flight Recorder?', a: 'A profiling and event recording framework built into the JVM (free since JDK 11). It records CPU samples, allocations, GC, locks, I/O and exceptions with very low overhead (~1%), so it can run in production. Recordings (.jfr) are analysed in JDK Mission Control.', level: 'Medium' },
    { q: 'Difference between StackOverflowError and OutOfMemoryError?', a: 'StackOverflowError: a thread\'s stack is full, usually because of infinite/deep recursion. OutOfMemoryError: the JVM cannot allocate memory in heap, metaspace, native threads, etc. Both are Errors (not Exceptions) and should not normally be caught.', level: 'Easy' },
    { q: 'What does "GC overhead limit exceeded" mean?', a: 'The JVM (with Parallel GC) spent more than 98% of the time in garbage collection and recovered less than 2% of the heap — the application is effectively stuck because the heap is almost full of live objects, usually due to a leak.', level: 'Hard' },
    { q: 'What is the young generation and why do most objects die there?', a: 'The part of the heap where new objects are allocated (Eden + 2 Survivor spaces). Most objects are short-lived (loop temporaries, request DTOs), so Minor GCs in the young generation reclaim most garbage quickly. Objects surviving several collections are promoted to the old generation.', level: 'Medium' },
    { q: 'How would you find why CPU usage is 100% in a Java app?', a: 'Use top -H -p <pid> to find the hot thread id, convert it to hex, take jstack <pid> and search for that nid to see the stack trace. Or record JFR / use VisualVM sampler to see hot methods. Common causes: infinite loops, busy-wait, heavy regex/JSON, excessive GC.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Write a program that prints used heap memory before and after creating 1,000,000 Integer objects in an ArrayList, then after clearing the list and calling System.gc(). Run with -Xmx256m and explain the numbers.',
      hint: 'used = totalMemory() - freeMemory(). Divide by 1024 * 1024 to get MB. System.gc() is only a hint.',
      solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static long usedMb() {
        Runtime rt = Runtime.getRuntime();
        return (rt.totalMemory() - rt.freeMemory()) / (1024 * 1024);
    }

    public static void main(String[] args) {
        System.out.println("Start used: " + usedMb() + " MB");
        List<Integer> list = new ArrayList<>();
        for (int i = 0; i < 1_000_000; i++) list.add(i);
        System.out.println("After adding: " + usedMb() + " MB");   // grows by ~20 MB
        list.clear();
        list = null;
        System.gc();                                                 // request only
        System.out.println("After clear + gc: " + usedMb() + " MB"); // usually back down
    }
}`,
    },
    {
      task: 'Fix the deadlock example so both threads always finish. Print "T1 done" and "T2 done".',
      hint: 'Make both threads lock in the same order: lockA first, then lockB.',
      solution: `public class Main {
    static final Object lockA = new Object();
    static final Object lockB = new Object();

    static void work(String name) {
        synchronized (lockA) {           // same order in every thread
            synchronized (lockB) {
                System.out.println(name + " done");
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(() -> work("T1"));
        Thread t2 = new Thread(() -> work("T2"));
        t1.start(); t2.start();
        t1.join(); t2.join();
        System.out.println("No deadlock");
    }
}`,
    },
    {
      task: 'Write a program that leaks memory through a ThreadLocal in a fixed thread pool, then fix it with remove() in a finally block.',
      hint: 'Pool threads live forever, so values stored in ThreadLocal stay reachable until removed.',
      solution: `import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class Main {
    static final ThreadLocal<byte[]> buffer = new ThreadLocal<>();

    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newFixedThreadPool(4);
        for (int i = 0; i < 100; i++) {
            int task = i;
            pool.submit(() -> {
                try {
                    buffer.set(new byte[5 * 1024 * 1024]);   // 5 MB per thread
                    // ... use buffer for the request ...
                    if (task % 25 == 0) System.out.println("Task " + task + " ran");
                } finally {
                    buffer.remove();                         // FIX: always clean up
                }
            });
        }
        pool.shutdown();
        pool.awaitTermination(1, java.util.concurrent.TimeUnit.MINUTES);
        System.out.println("All tasks finished");
    }
}`,
    },
    {
      task: 'Compare String concatenation with + in a loop vs StringBuilder for 50,000 appends. Measure time with System.nanoTime() and explain why one creates much more garbage.',
      hint: 'Strings are immutable — s = s + i creates a new String each iteration (O(n^2) copying).',
      solution: `public class Main {
    public static void main(String[] args) {
        int n = 50_000;

        long t1 = System.nanoTime();
        String s = "";
        for (int i = 0; i < n; i++) s = s + i;       // new String every time
        long plusMs = (System.nanoTime() - t1) / 1_000_000;

        long t2 = System.nanoTime();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) sb.append(i);   // one growing buffer
        String s2 = sb.toString();
        long sbMs = (System.nanoTime() - t2) / 1_000_000;

        System.out.println("Same result: " + s.equals(s2));
        System.out.println("+ operator: " + plusMs + " ms");
        System.out.println("StringBuilder: " + sbMs + " ms");
        // + is typically hundreds of times slower and creates huge garbage for the GC
    }
}`,
    },
    {
      task: 'Run any Spring Boot or Java program with JFR enabled for 30 seconds and list the top 3 hot methods and the GC pause count shown in JDK Mission Control.',
      hint: 'java -XX:StartFlightRecording=duration=30s,filename=rec.jfr -jar app.jar, then open rec.jfr in jmc (download from jdk.java.net/jmc).',
      solution: `# 1. Start the application with a 30 second recording
java -XX:StartFlightRecording=duration=30s,filename=rec.jfr -jar target/demo-0.0.1-SNAPSHOT.jar

# 2. Generate load during those 30 seconds (Postman runner / JMeter / curl loop)
for i in $(seq 1 500); do curl -s http://localhost:8080/api/products > /dev/null; done

# 3. Open JDK Mission Control: File > Open File > rec.jfr
#    - Automated Analysis Results: summary of problems
#    - Method Profiling: top hot methods (note the top 3)
#    - Garbage Collections: number of GC pauses and longest pause
#    - Memory > Allocations: which classes allocate most

# 4. Alternative without GUI:
jfr print --events jdk.GarbageCollection rec.jfr | head -40
jfr summary rec.jfr`,
    },
  ],
  quiz: [
    {
      question: 'Which JVM option sets the MAXIMUM heap size?',
      options: ['-Xms', '-Xss', '-Xmx', '-XX:MaxMetaspaceSize'],
      answer: 2,
      explanation: '-Xmx sets the maximum heap; -Xms is the initial heap, -Xss the thread stack size.',
    },
    {
      question: 'Which garbage collector is the default in Java 17 and 21 on typical servers?',
      options: ['G1 GC', 'Serial GC', 'CMS', 'Parallel GC'],
      answer: 0,
      explanation: 'G1 has been the default since Java 9. CMS was removed in Java 14.',
    },
    {
      question: 'A static HashMap that only gets entries added and never removed most likely causes:',
      options: ['StackOverflowError', 'A memory leak leading to OutOfMemoryError: Java heap space', 'Deadlock', 'ClassNotFoundException'],
      answer: 1,
      explanation: 'Static fields are GC roots, so everything inside the map stays reachable forever.',
    },
    {
      question: 'Which tool is used to take a thread dump to investigate a deadlock?',
      options: ['jmap', 'javac', 'jar', 'jstack'],
      answer: 3,
      explanation: 'jstack (or jcmd <pid> Thread.print) prints all thread stacks and reports Java-level deadlocks.',
    },
    {
      question: 'Which GC is designed for sub-millisecond pauses even with very large heaps?',
      options: ['Serial GC', 'Parallel GC', 'ZGC', 'Epsilon GC'],
      answer: 2,
      explanation: 'ZGC performs almost all its work concurrently, keeping pauses typically below 1 ms.',
    },
  ],
};
