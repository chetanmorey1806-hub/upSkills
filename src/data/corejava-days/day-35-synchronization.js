const ex1 = `class UnsafeCounter {
    int count = 0;
    void increment() { count++; }          // NOT atomic: read, add, write
}

class SafeCounter {
    private int count = 0;
    synchronized void increment() { count++; }   // only one thread at a time
    synchronized int get() { return count; }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        UnsafeCounter unsafe = new UnsafeCounter();
        SafeCounter safe = new SafeCounter();

        Runnable task = () -> {
            for (int i = 0; i < 100_000; i++) {
                unsafe.increment();
                safe.increment();
            }
        };
        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start(); t2.start();
        t1.join();  t2.join();

        System.out.println("Expected: 200000");
        System.out.println("Unsafe count <= 200000: " + (unsafe.count <= 200000));
        System.out.println("Safe count: " + safe.get());
    }
}`;

const ex2 = `class BankAccount {
    private int balance;
    private int successCount = 0;

    BankAccount(int balance) { this.balance = balance; }

    // check-then-act must be one atomic step
    synchronized boolean withdraw(int amount) {
        if (balance >= amount) {
            try { Thread.sleep(50); } catch (InterruptedException e) { }  // simulate slow bank
            balance -= amount;
            successCount++;
            return true;
        }
        return false;
    }

    synchronized int getBalance() { return balance; }
    synchronized int getSuccessCount() { return successCount; }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BankAccount acc = new BankAccount(1000);
        Thread husband = new Thread(() -> acc.withdraw(700), "Husband");
        Thread wife = new Thread(() -> acc.withdraw(700), "Wife");
        husband.start(); wife.start();
        husband.join();  wife.join();

        System.out.println("Successful withdrawals: " + acc.getSuccessCount());
        System.out.println("Final balance: " + acc.getBalance());
    }
}`;

const ex3 = `class TicketCounter {
    private int available = 250;
    private final Object lock = new Object();
    private static int totalCounters = 0;

    TicketCounter() { registerCounter(); }

    // static synchronized: lock on TicketCounter.class
    private static synchronized void registerCounter() { totalCounters++; }
    static synchronized int getTotalCounters() { return totalCounters; }

    int book(int wanted) {
        int booked = 0;
        for (int i = 0; i < wanted; i++) {
            // only the critical section is locked
            synchronized (lock) {
                if (available > 0) {
                    available--;
                    booked++;
                }
            }
        }
        return booked;
    }

    int getAvailable() { synchronized (lock) { return available; } }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        TicketCounter counter = new TicketCounter();
        int[] booked = new int[3];
        Thread[] agents = new Thread[3];
        for (int i = 0; i < 3; i++) {
            final int id = i;
            agents[i] = new Thread(() -> booked[id] = counter.book(100));
            agents[i].start();
        }
        for (Thread t : agents) t.join();

        int total = booked[0] + booked[1] + booked[2];
        System.out.println("Total booked: " + total);
        System.out.println("Remaining: " + counter.getAvailable());
        System.out.println("Counters registered: " + TicketCounter.getTotalCounters());
    }
}`;

const ex4 = `public class Main {
    // volatile: every read goes to main memory, so the worker sees the update
    private static volatile boolean running = true;

    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            long loops = 0;
            while (running) {
                loops++;
            }
            System.out.println("Worker saw running = false and stopped");
        });
        worker.start();

        Thread.sleep(200);
        running = false;            // signal the worker
        worker.join();
        System.out.println("Main finished");
    }
}`;

const ex5 = `import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static AtomicInteger hits = new AtomicInteger(0);
    static int lockedCount = 0;
    static final ReentrantLock lock = new ReentrantLock();

    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> {
            for (int i = 0; i < 10_000; i++) {
                hits.incrementAndGet();          // atomic, lock-free
                lock.lock();
                try {
                    lockedCount++;
                } finally {
                    lock.unlock();               // always unlock in finally
                }
            }
        };
        Thread[] ts = new Thread[3];
        for (int i = 0; i < 3; i++) { ts[i] = new Thread(task); ts[i].start(); }
        for (Thread t : ts) t.join();

        System.out.println("AtomicInteger hits: " + hits.get());
        System.out.println("ReentrantLock count: " + lockedCount);
        System.out.println("compareAndSet(30000, 0): " + hits.compareAndSet(30000, 0));
        System.out.println("After reset: " + hits.get());
    }
}`;

export default {
  id: 'day-35-synchronization',
  title: 'Synchronization, Race Conditions, synchronized, volatile',
  module: 'Module 6: Multithreading',
  day: 35,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'When several threads change the same data, results can become wrong (race conditions). Learn how synchronized methods and blocks, static synchronization, volatile, atomic variables and locks keep shared data correct.',
  objectives: [
    'Identify race conditions and explain why count++ is not atomic',
    'Use synchronized methods and synchronized blocks correctly',
    'Understand object-level vs class-level locks',
    'Explain visibility problems and when to use volatile',
    'Use AtomicInteger and ReentrantLock as alternatives',
  ],
  theory: [
    {
      heading: 'Race Condition: The Problem',
      content: 'A race condition happens when two or more threads read and write the same shared data at the same time and the final result depends on timing. Real-world analogy: a husband and wife both check a joint account at two ATMs. Both see Rs.1000, both withdraw Rs.700, and the bank loses money because neither saw the other\'s withdrawal. In Java, even count++ is three steps: READ count, ADD 1, WRITE back. Two threads can read the same old value, and one update gets lost.',
      syntax: `Thread A: read count (5)
Thread B: read count (5)
Thread A: write 6
Thread B: write 6      // one increment lost! Expected 7`,
      points: [
        'Shared mutable data + multiple threads + at least one writer = danger',
        'Local variables are safe (each thread has its own stack)',
        'Immutable objects (String, LocalDate) are always thread-safe',
        'Critical section: the code that touches shared data',
      ],
    },
    {
      heading: 'synchronized Methods and the Monitor Lock',
      content: 'Every Java object has an invisible lock called a monitor (intrinsic lock), like a single key to a washroom. A synchronized instance method locks "this": a thread must take the key before entering and returns it when leaving. Other threads wanting the SAME object\'s lock wait in BLOCKED state. Threads using DIFFERENT objects do not block each other.',
      syntax: `class Counter {
    private int count;
    public synchronized void increment() { count++; }   // locks 'this'
    public synchronized int get() { return count; }
}`,
      points: [
        'Lock is released automatically when the method returns or throws',
        'synchronized locks are reentrant: a thread holding the lock can call another synchronized method on the same object',
        'Synchronize both reads and writes of shared data, otherwise readers may see stale values',
        'Constructors cannot be synchronized',
      ],
    },
    {
      heading: 'synchronized Blocks and Static Synchronization',
      content: 'Locking a whole method can be slow if only a few lines touch shared data. A synchronized block locks only the critical section and lets you choose the lock object. A static synchronized method locks the Class object (ClassName.class), which is shared by all instances — a class-level lock, like the main gate of a building rather than one room\'s door.',
      syntax: `synchronized (this) { count++; }            // object-level lock
private final Object lock = new Object();
synchronized (lock) { balance -= amt; }    // private lock object (best practice)

static synchronized void m() { }            // locks MyClass.class
synchronized (MyClass.class) { }            // same as above`,
      tip: 'Never synchronize on a String literal or a boxed Integer — they may be shared across the JVM and cause unexpected blocking. Use a private final Object lock.',
    },
    {
      heading: 'Visibility and the volatile Keyword',
      content: 'Each CPU core may cache variables. A thread may keep reading its cached copy and never notice another thread\'s change — like reading an old printed notice instead of the live notice board. volatile tells the JVM: always read from and write to main memory, and do not reorder around this variable. It solves VISIBILITY, not ATOMICITY: volatile int count; count++ is still unsafe.',
      points: [
        'Use volatile for simple flags written by one thread and read by others (stop signals, status)',
        'volatile does NOT make compound actions (count++, check-then-act) safe',
        'synchronized gives both visibility and atomicity (mutual exclusion)',
        'Happens-before: unlocking a monitor / writing a volatile happens-before the next lock / read',
      ],
    },
    {
      heading: 'Atomic Variables and Explicit Locks',
      content: 'java.util.concurrent.atomic classes (AtomicInteger, AtomicLong, AtomicBoolean, AtomicReference) perform single operations atomically without locks, using CPU compare-and-swap (CAS). ReentrantLock (java.util.concurrent.locks) is a flexible lock with tryLock(), timeouts, fairness and interruptible locking. Always call unlock() in a finally block.',
      syntax: `AtomicInteger c = new AtomicInteger();
c.incrementAndGet();  c.addAndGet(5);  c.compareAndSet(expected, newValue);

ReentrantLock lock = new ReentrantLock();
lock.lock();
try { /* critical section */ } finally { lock.unlock(); }
if (lock.tryLock(1, TimeUnit.SECONDS)) { ... }`,
      points: [
        'Thread-safe classes: StringBuffer, Vector, Hashtable, ConcurrentHashMap, AtomicXxx',
        'Not thread-safe: StringBuilder, ArrayList, HashMap',
        'Too much synchronization reduces performance and can cause deadlocks (Day 36)',
      ],
    },
  ],
  examples: [
    {
      title: 'Race Condition vs synchronized Counter',
      scenario: 'Two threads each increment a website visit counter 100,000 times. Without synchronization visits are lost.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Add UnsafeCounter and SafeCounter classes', 'Run ▶ several times', 'Optional: print unsafe.count to see a different wrong number each run'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Expected: 200000
Unsafe count <= 200000: true
Safe count: 200000`,
      explanation: 'The safe counter is always exactly 200000 because synchronized lets only one thread run increment() at a time. If you print unsafe.count you will usually see a smaller number that changes every run (for example 131072 or 187455) because increments are lost. We print only a comparison so the shown output is always the same.',
    },
    {
      title: 'Joint Bank Account Withdrawal',
      scenario: 'Husband and wife withdraw Rs.700 each at the same time from an account with Rs.1000. Only one must succeed.',
      steps: ['Create Main.java with BankAccount', 'Mark withdraw() as synchronized', 'Run ▶', 'Remove synchronized and run again to see the balance go negative'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Successful withdrawals: 1
Final balance: 300`,
      explanation: 'The balance check and the subtraction happen inside one synchronized method, so the second thread sees the updated balance (300) and is refused. Which person succeeds may vary between runs, so we print only the counts. Without synchronized both may pass the check and the balance can become -400.',
    },
    {
      title: 'synchronized Block and Static synchronized Method',
      scenario: 'Three booking agents try to book 100 tickets each from a show with only 250 seats.',
      steps: ['Create Main.java with TicketCounter', 'Use a private lock object and a static synchronized method', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Total booked: 250
Remaining: 0
Counters registered: 1`,
      explanation: 'Only the few lines that touch "available" are locked, using a private lock object. No seat is double-booked: exactly 250 are booked. How many each agent got varies, so we print only the total. registerCounter() is static synchronized, which locks TicketCounter.class.',
    },
    {
      title: 'volatile Stop Flag',
      scenario: 'A background worker runs until the main thread tells it to stop.',
      steps: ['Create Main.java', 'Declare the flag as volatile', 'Run ▶', 'Remove volatile: the worker may loop forever on some JVMs because it never sees the change'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Worker saw running = false and stopped
Main finished`,
      explanation: 'Without volatile, the JIT compiler may hoist the read of running out of the loop, so the worker never sees false and the program hangs. volatile guarantees the write by main becomes visible to the worker.',
    },
    {
      title: 'AtomicInteger and ReentrantLock',
      scenario: 'Count page hits from three threads using lock-free atomics and an explicit lock.',
      steps: ['Create Main.java', 'Import AtomicInteger and ReentrantLock', 'Run ▶'],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `AtomicInteger hits: 30000
ReentrantLock count: 30000
compareAndSet(30000, 0): true
After reset: 0`,
      explanation: 'incrementAndGet() is atomic, so no update is lost. The ReentrantLock protects lockedCount; unlock() is in finally so the lock is always released. compareAndSet changes the value only if it currently equals the expected value.',
    },
  ],
  interview: [
    { q: 'What is a race condition?', a: 'A bug where the result depends on the unpredictable timing of threads accessing shared mutable data, e.g. lost updates when two threads do count++ simultaneously.', level: 'Easy' },
    { q: 'Why is count++ not thread-safe?', a: 'It is three operations: read, increment, write. Another thread can interleave between them, causing lost updates.', level: 'Easy' },
    { q: 'What is synchronization in Java?', a: 'A mechanism ensuring only one thread at a time executes a critical section guarded by the same lock (monitor), providing mutual exclusion and memory visibility.', level: 'Easy' },
    { q: 'Difference between synchronized method and synchronized block?', a: 'A synchronized method locks the whole method on this (or Class for static). A block locks only the specified code and lets you choose the lock object, giving finer-grained, faster locking.', level: 'Medium' },
    { q: 'What is the difference between object-level and class-level lock?', a: 'Object lock (synchronized instance method / synchronized(this)) is per instance. Class lock (static synchronized / synchronized(X.class)) is one per class and shared by all instances. They are independent of each other.', level: 'Medium' },
    { q: 'What does volatile do? Does it make count++ safe?', a: 'It guarantees visibility (reads see the latest write) and prevents certain reorderings. It does not provide atomicity, so volatile count++ is still a race condition.', level: 'Medium' },
    { q: 'Can two threads execute two different synchronized instance methods of the same object at the same time?', a: 'No, both need the same object lock. But one thread can run a synchronized instance method while another runs a static synchronized method, because they use different locks.', level: 'Hard' },
    { q: 'What is a reentrant lock?', a: 'A lock that the owning thread can acquire again without deadlocking itself. Both intrinsic locks (synchronized) and ReentrantLock are reentrant; a hold count is maintained.', level: 'Hard' },
    { q: 'synchronized vs ReentrantLock?', a: 'synchronized is simpler and auto-releases. ReentrantLock offers tryLock, timeouts, interruptible locking, fairness, and multiple Conditions, but you must unlock in finally.', level: 'Hard' },
    { q: 'How does AtomicInteger work without locks?', a: 'It uses Compare-And-Swap (CAS), a CPU instruction that updates a value only if it still equals the expected value, retrying in a loop otherwise.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a thread-safe class LikeCounter with like() and getLikes(). Start 4 threads each liking 5000 times and print total likes (20000).',
      hint: 'Use synchronized methods or AtomicInteger; join all threads before printing.',
      solution: `class LikeCounter {
    private int likes;
    synchronized void like() { likes++; }
    synchronized int getLikes() { return likes; }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        LikeCounter c = new LikeCounter();
        Thread[] ts = new Thread[4];
        for (int i = 0; i < 4; i++) {
            ts[i] = new Thread(() -> { for (int j = 0; j < 5000; j++) c.like(); });
            ts[i].start();
        }
        for (Thread t : ts) t.join();
        System.out.println("Likes: " + c.getLikes()); // 20000
    }
}`,
    },
    {
      task: 'Write a thread-safe Inventory class where reduceStock(int qty) only reduces if enough stock exists. Simulate 5 customers buying 3 items each from a stock of 10.',
      hint: 'Put the check and update inside one synchronized block.',
      solution: `class Inventory {
    private int stock = 10;
    synchronized boolean reduceStock(int qty) {
        if (stock >= qty) { stock -= qty; return true; }
        return false;
    }
    synchronized int getStock() { return stock; }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Inventory inv = new Inventory();
        int[] success = new int[1];
        Object lock = new Object();
        Thread[] customers = new Thread[5];
        for (int i = 0; i < 5; i++) {
            customers[i] = new Thread(() -> {
                if (inv.reduceStock(3)) synchronized (lock) { success[0]++; }
            });
            customers[i].start();
        }
        for (Thread t : customers) t.join();
        System.out.println("Orders placed: " + success[0]); // 3
        System.out.println("Stock left: " + inv.getStock()); // 1
    }
}`,
    },
    {
      task: 'Rewrite the volatile flag example as a StoppableTask class implementing Runnable with a stop() method.',
      hint: 'private volatile boolean running = true; public void stop() { running = false; }',
      solution: `class StoppableTask implements Runnable {
    private volatile boolean running = true;
    public void stop() { running = false; }
    public void run() {
        int ticks = 0;
        while (running) {
            ticks++;
            try { Thread.sleep(100); } catch (InterruptedException e) { return; }
        }
        System.out.println("Stopped cleanly");
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        StoppableTask task = new StoppableTask();
        Thread t = new Thread(task);
        t.start();
        Thread.sleep(500);
        task.stop();
        t.join();
    }
}`,
    },
    {
      task: 'Use ReentrantLock.tryLock() so a thread prints "Busy, try later" if a printer lock is already held.',
      hint: 'if (lock.tryLock()) { try {...} finally { lock.unlock(); } } else { ... }',
      solution: `import java.util.concurrent.locks.ReentrantLock;

public class Main {
    static final ReentrantLock printer = new ReentrantLock();

    static void print(String doc) {
        if (printer.tryLock()) {
            try {
                System.out.println("Printing " + doc);
                Thread.sleep(300);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            } finally {
                printer.unlock();
            }
        } else {
            System.out.println("Busy, try later: " + doc);
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread a = new Thread(() -> print("Report.pdf"));
        a.start();
        Thread.sleep(100);           // a is printing now
        print("Invoice.pdf");        // Busy, try later
        a.join();
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which keyword guarantees visibility but NOT atomicity?', options: ['synchronized', 'volatile', 'final', 'static'], answer: 1, explanation: 'volatile ensures visibility of writes but compound actions are still not atomic.' },
    { question: 'A static synchronized method locks on:', options: ['this', 'A new Object', 'The Class object', 'Nothing'], answer: 2, explanation: 'Static synchronized methods use the class-level lock (MyClass.class).' },
    { question: 'Which is NOT thread-safe?', options: ['AtomicInteger', 'StringBuffer', 'ConcurrentHashMap', 'ArrayList'], answer: 3, explanation: 'ArrayList is not synchronized.' },
    { question: 'In which state does a thread wait to acquire a monitor lock?', options: ['BLOCKED', 'WAITING', 'NEW', 'TIMED_WAITING'], answer: 0, explanation: 'Threads waiting to enter a synchronized block are BLOCKED.' },
    { question: 'Where should lock.unlock() be called for a ReentrantLock?', options: ['At the start of the method', 'In a finally block', 'In the catch block only', 'It is not needed'], answer: 1, explanation: 'finally guarantees the lock is released even if an exception occurs.' },
  ],
};
