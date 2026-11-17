const ex1 = `class Shelf {
    private int item;
    private boolean full = false;

    synchronized void put(int value) throws InterruptedException {
        while (full) {          // always wait inside a while loop
            wait();             // releases the lock and waits
        }
        item = value;
        full = true;
        System.out.println("Produced " + value);
        notifyAll();            // wake up the consumer
    }

    synchronized int take() throws InterruptedException {
        while (!full) {
            wait();
        }
        full = false;
        System.out.println("Consumed " + item);
        notifyAll();            // wake up the producer
        return item;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Shelf shelf = new Shelf();
        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 4; i++) shelf.put(i);
            } catch (InterruptedException e) { }
        });
        Thread consumer = new Thread(() -> {
            try {
                int sum = 0;
                for (int i = 1; i <= 4; i++) sum += shelf.take();
                System.out.println("Consumer total: " + sum);
            } catch (InterruptedException e) { }
        });
        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
        System.out.println("Done");
    }
}`;

const ex2 = `class Printer {
    private int number = 1;
    private final int max;
    Printer(int max) { this.max = max; }

    synchronized void print(boolean wantOdd) throws InterruptedException {
        while (number <= max) {
            boolean isOdd = number % 2 == 1;
            if (isOdd == wantOdd) {
                System.out.println(Thread.currentThread().getName() + ": " + number);
                number++;
                notifyAll();
            } else {
                wait();
            }
        }
        notifyAll();   // let the other thread exit its loop
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Printer p = new Printer(6);
        Thread odd = new Thread(() -> {
            try { p.print(true); } catch (InterruptedException e) { }
        }, "Odd");
        Thread even = new Thread(() -> {
            try { p.print(false); } catch (InterruptedException e) { }
        }, "Even");
        even.start();
        odd.start();
        odd.join();
        even.join();
        System.out.println("Finished");
    }
}`;

const ex3 = `import java.lang.management.ManagementFactory;
import java.lang.management.ThreadMXBean;

public class Main {
    static final Object pen = new Object();
    static final Object paper = new Object();

    static void pause() {
        try { Thread.sleep(100); } catch (InterruptedException e) { }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread writer1 = new Thread(() -> {
            synchronized (pen) {
                pause();
                synchronized (paper) {          // waits forever for paper
                    System.out.println("Writer1 wrote");
                }
            }
        }, "Writer1");
        Thread writer2 = new Thread(() -> {
            synchronized (paper) {
                pause();
                synchronized (pen) {            // waits forever for pen
                    System.out.println("Writer2 wrote");
                }
            }
        }, "Writer2");
        writer1.setDaemon(true);   // daemon so the JVM can still exit
        writer2.setDaemon(true);
        writer1.start();
        writer2.start();

        Thread.sleep(1000);
        ThreadMXBean bean = ManagementFactory.getThreadMXBean();
        long[] ids = bean.findDeadlockedThreads();
        int count = (ids == null) ? 0 : ids.length;
        System.out.println("Deadlocked threads: " + count);
        System.out.println("Writer1 state: " + writer1.getState());
        System.out.println("Writer2 state: " + writer2.getState());
    }
}`;

const ex4 = `class Account {
    final int id;
    int balance;
    Account(int id, int balance) { this.id = id; this.balance = balance; }
}

public class Main {
    // Always lock the account with the smaller id first -> no circular wait
    static void transfer(Account from, Account to, int amount) {
        Account first = from.id < to.id ? from : to;
        Account second = from.id < to.id ? to : from;
        synchronized (first) {
            try { Thread.sleep(50); } catch (InterruptedException e) { }
            synchronized (second) {
                from.balance -= amount;
                to.balance += amount;
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Account a = new Account(1, 1000);
        Account b = new Account(2, 1000);
        Thread t1 = new Thread(() -> transfer(a, b, 300));
        Thread t2 = new Thread(() -> transfer(b, a, 100));
        t1.start(); t2.start();
        t1.join();  t2.join();
        System.out.println("A: " + a.balance);
        System.out.println("B: " + b.balance);
        System.out.println("Total money: " + (a.balance + b.balance));
    }
}`;

export default {
  id: 'day-36-wait-notify-deadlock',
  title: 'Inter-thread Communication (wait/notify), Deadlock',
  module: 'Module 6: Multithreading',
  day: 36,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Threads often need to cooperate: one produces data, another consumes it. Learn wait(), notify() and notifyAll() for inter-thread communication, the classic producer-consumer problem, and how deadlocks happen and how to prevent them.',
  objectives: [
    'Use wait(), notify() and notifyAll() inside synchronized code',
    'Implement the producer-consumer pattern',
    'Explain why wait() must be called in a while loop (spurious wakeups)',
    'Recognise deadlock and its four conditions',
    'Prevent deadlocks using lock ordering and tryLock with timeout',
  ],
  theory: [
    {
      heading: 'Why Inter-thread Communication?',
      content: 'Consider a restaurant: the chef (producer) puts a dish on the counter, and the waiter (consumer) takes it to the table. If the counter is empty, the waiter should WAIT, not keep checking every millisecond (busy waiting wastes CPU). When the chef places a dish, he rings a bell (NOTIFY) to wake the waiter. Java gives every object these methods: wait(), notify() and notifyAll(). They are defined in Object class, because the lock (monitor) belongs to the object.',
      points: [
        'wait(): releases the lock and puts the thread in WAITING until notified',
        'wait(ms): same but with a timeout (TIMED_WAITING)',
        'notify(): wakes ONE waiting thread on the same object (which one is not guaranteed)',
        'notifyAll(): wakes ALL waiting threads; they compete for the lock',
        'All three must be called inside synchronized code on the same object, otherwise IllegalMonitorStateException',
      ],
    },
    {
      heading: 'The Correct wait/notify Pattern',
      content: 'A woken thread does not run immediately; it must re-acquire the lock first. By the time it gets the lock, the condition may be false again (another thread may have taken the item), and threads can also wake up without any notify (spurious wakeup). So ALWAYS check the condition in a while loop, not an if.',
      syntax: `synchronized (lock) {
    while (!conditionIsTrue) {
        lock.wait();          // releases lock while waiting
    }
    // do the work
    lock.notifyAll();         // inform others that state changed
}`,
      tip: 'Prefer notifyAll() unless you are sure every waiting thread waits for the same condition. notify() can wake the wrong thread and cause a program to hang.',
    },
    {
      heading: 'wait() vs sleep()',
      content: 'Both pause a thread, but for different reasons. sleep() is like taking a nap at your desk while still holding the meeting-room key. wait() is like handing the key back to reception and waiting until someone calls you.',
      points: [
        'wait() is an instance method of Object; sleep() is a static method of Thread',
        'wait() releases the lock; sleep() keeps any locks',
        'wait() must be in synchronized code; sleep() can be called anywhere',
        'wait() resumes on notify/notifyAll/timeout/interrupt; sleep() resumes after the time or interrupt',
      ],
    },
    {
      heading: 'Deadlock',
      content: 'A deadlock is when two or more threads wait for each other forever. Analogy: two people on a narrow bridge from opposite sides; neither will step back, so both stand forever. In code: Thread 1 holds lock A and wants lock B; Thread 2 holds lock B and wants lock A. Nothing crashes — the program simply hangs.',
      points: [
        'Four (Coffman) conditions — all must hold: mutual exclusion, hold and wait, no preemption, circular wait',
        'Detect: jstack <pid> or VisualVM shows "Found one Java-level deadlock"; ThreadMXBean.findDeadlockedThreads() in code',
        'Prevent: lock ordering (always acquire locks in the same global order) — breaks circular wait',
        'Prevent: tryLock(timeout) with ReentrantLock and back off if it fails',
        'Prevent: avoid nested locks, keep synchronized blocks small',
      ],
    },
    {
      heading: 'Livelock, Starvation and Modern Alternatives',
      content: 'Livelock: threads keep reacting to each other and change state but make no progress (two people stepping aside in the same direction repeatedly). Starvation: a thread never gets CPU or a lock because others always win (fair locks help). In real projects, prefer high-level tools from java.util.concurrent over raw wait/notify.',
      points: [
        'BlockingQueue (ArrayBlockingQueue, LinkedBlockingQueue): put() blocks when full, take() blocks when empty — producer-consumer in two lines',
        'CountDownLatch: wait until N tasks finish',
        'Semaphore: limit the number of threads using a resource',
        'Condition (lock.newCondition()): await()/signal() — like wait/notify for ReentrantLock with multiple conditions',
      ],
    },
  ],
  examples: [
    {
      title: 'Producer-Consumer with wait() and notifyAll()',
      scenario: 'A bakery shelf holds one cake at a time. The baker must wait while the shelf is full, and the customer must wait while it is empty.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Write the Shelf class with synchronized put() and take()', 'Start producer and consumer threads, then join both', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Produced 1
Consumed 1
Produced 2
Consumed 2
Produced 3
Consumed 3
Produced 4
Consumed 4
Consumer total: 10
Done`,
      explanation: 'The shelf can hold only one item, and every print happens while holding the lock, so the order is always strictly alternating: the producer cannot put item 2 until the consumer has taken item 1. wait() releases the lock so the other thread can enter.',
    },
    {
      title: 'Odd-Even Printer with Two Threads',
      scenario: 'A popular interview question: two threads print numbers 1 to 6 alternately, one printing odd and the other even.',
      steps: ['Create Main.java with a Printer class', 'Each thread waits until it is its turn', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Odd: 1
Even: 2
Odd: 3
Even: 4
Odd: 5
Even: 6
Finished`,
      explanation: 'The shared "number" decides whose turn it is. Even if the Even thread starts first, it sees 1 is odd and waits. Each thread prints, increments and calls notifyAll() to hand over the turn. The final notifyAll() lets the waiting thread see number > max and exit.',
    },
    {
      title: 'Creating and Detecting a Deadlock',
      scenario: 'Two writers each need a pen and paper but grab them in opposite order, so they block each other forever.',
      steps: ['Create Main.java', 'Run ▶ — main detects the deadlock using ThreadMXBean', 'Try in a terminal: jps then jstack <pid> on a non-daemon version to see the deadlock report'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Deadlocked threads: 2
Writer1 state: BLOCKED
Writer2 state: BLOCKED`,
      explanation: 'Writer1 holds pen and waits for paper; Writer2 holds paper and waits for pen — circular wait. Neither "wrote" message is ever printed. The 100 ms pause makes the deadlock happen practically every time. We made the threads daemon so the JVM can exit; normally a deadlocked program just hangs.',
    },
    {
      title: 'Preventing Deadlock with Lock Ordering',
      scenario: 'Two simultaneous bank transfers in opposite directions (A to B and B to A) without deadlock.',
      steps: ['Create Main.java with Account class', 'Always lock the lower id first', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `A: 800
B: 1200
Total money: 2000`,
      explanation: 'Both transfers lock account 1 first, then account 2, so a circular wait is impossible. A = 1000 - 300 + 100 = 800, B = 1000 + 300 - 100 = 1200, and total money is preserved.',
    },
  ],
  interview: [
    { q: 'Why are wait(), notify() and notifyAll() in Object class and not in Thread?', a: 'Because they work with an object\'s monitor lock, and every object can be a lock. A thread waits on an object, not on another thread.', level: 'Medium' },
    { q: 'Why must wait() be called from a synchronized context?', a: 'wait() releases the monitor, so the thread must own it. Calling it without holding the lock throws IllegalMonitorStateException. It also avoids a race between checking the condition and waiting.', level: 'Medium' },
    { q: 'Difference between wait() and sleep()?', a: 'wait() releases the lock, is an Object instance method, needs synchronized and is woken by notify. sleep() is a static Thread method, keeps locks and resumes after a time.', level: 'Easy' },
    { q: 'notify() vs notifyAll()?', a: 'notify() wakes one arbitrary waiting thread; notifyAll() wakes all waiting threads on that object, which then compete for the lock. notifyAll() is safer when threads wait for different conditions.', level: 'Medium' },
    { q: 'Why should wait() be inside a while loop?', a: 'Because of spurious wakeups and because the condition might change before the thread re-acquires the lock. The loop re-checks the condition.', level: 'Hard' },
    { q: 'What is deadlock? Give an example.', a: 'A situation where threads wait forever for locks held by each other. Example: T1 locks A then wants B; T2 locks B then wants A.', level: 'Easy' },
    { q: 'What are the necessary conditions for deadlock?', a: 'Mutual exclusion, hold and wait, no preemption, and circular wait. Removing any one prevents deadlock.', level: 'Medium' },
    { q: 'How can you avoid deadlock?', a: 'Acquire locks in a consistent global order, use tryLock with timeouts, avoid nested locks, reduce lock scope, and use higher-level concurrency utilities.', level: 'Medium' },
    { q: 'How do you detect a deadlock in a running Java application?', a: 'Take a thread dump with jstack <pid>, jcmd <pid> Thread.print, or VisualVM/JConsole; they report "Found one Java-level deadlock". Programmatically: ThreadMXBean.findDeadlockedThreads().', level: 'Hard' },
    { q: 'What is the difference between deadlock, livelock and starvation?', a: 'Deadlock: threads blocked forever. Livelock: threads active but keep responding to each other with no progress. Starvation: a thread never gets resources because others keep getting them.', level: 'Hard' },
    { q: 'What happens if notify() is called and no thread is waiting?', a: 'Nothing; the notification is lost. That is why the condition flag (checked in a loop) is important.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Rewrite the producer-consumer example using ArrayBlockingQueue with capacity 2. Producer puts 1-5, consumer takes 5 items and prints the sum.',
      hint: 'queue.put() blocks when full and queue.take() blocks when empty. No wait/notify needed.',
      solution: `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> q = new ArrayBlockingQueue<>(2);
        Thread producer = new Thread(() -> {
            try { for (int i = 1; i <= 5; i++) q.put(i); } catch (InterruptedException e) { }
        });
        int[] sum = new int[1];
        Thread consumer = new Thread(() -> {
            try { for (int i = 0; i < 5; i++) sum[0] += q.take(); } catch (InterruptedException e) { }
        });
        producer.start(); consumer.start();
        producer.join(); consumer.join();
        System.out.println("Sum: " + sum[0]); // 15
    }
}`,
    },
    {
      task: 'Three threads print A, B, C in order repeatedly 3 times: ABCABCABC.',
      hint: 'Use a shared turn variable (0, 1, 2). Each thread waits while turn != its id, prints, sets turn = (turn + 1) % 3, then notifyAll().',
      solution: `public class Main {
    static int turn = 0;
    static final Object lock = new Object();

    static void run(int id, char ch) {
        for (int i = 0; i < 3; i++) {
            synchronized (lock) {
                while (turn != id) {
                    try { lock.wait(); } catch (InterruptedException e) { return; }
                }
                System.out.print(ch);
                turn = (turn + 1) % 3;
                lock.notifyAll();
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread a = new Thread(() -> run(0, 'A'));
        Thread b = new Thread(() -> run(1, 'B'));
        Thread c = new Thread(() -> run(2, 'C'));
        a.start(); b.start(); c.start();
        a.join(); b.join(); c.join();
        System.out.println();
    }
}`,
    },
    {
      task: 'Fix the deadlock example (pen and paper) so both writers finish.',
      hint: 'Make both writers lock pen first and then paper.',
      solution: `public class Main {
    static final Object pen = new Object();
    static final Object paper = new Object();

    static void write(String name) {
        synchronized (pen) {
            synchronized (paper) {
                System.out.println(name + " wrote");
            }
        }
    }

    public static void main(String[] args) throws InterruptedException {
        Thread w1 = new Thread(() -> write("Writer1"));
        Thread w2 = new Thread(() -> write("Writer2"));
        w1.start(); w2.start();
        w1.join(); w2.join();
        System.out.println("No deadlock");
    }
}`,
    },
    {
      task: 'Use CountDownLatch so main waits until 3 worker threads have each finished loading a module, then prints "App started".',
      hint: 'new CountDownLatch(3); each worker calls countDown(); main calls await().',
      solution: `import java.util.concurrent.CountDownLatch;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        CountDownLatch latch = new CountDownLatch(3);
        String[] modules = {"Database", "Cache", "Config"};
        for (String m : modules) {
            new Thread(() -> {
                System.out.println(m + " loaded");
                latch.countDown();
            }).start();
        }
        latch.await();
        System.out.println("App started");
    }
}`,
    },
  ],
  quiz: [
    { question: 'wait(), notify() and notifyAll() are defined in:', options: ['Thread', 'Runnable', 'Object', 'Lock'], answer: 2, explanation: 'They belong to Object because every object has a monitor.' },
    { question: 'Calling wait() outside synchronized code throws:', options: ['InterruptedException', 'IllegalMonitorStateException', 'IllegalThreadStateException', 'Nothing'], answer: 1, explanation: 'The thread must own the monitor to call wait().' },
    { question: 'Which statement is TRUE?', options: ['sleep() releases the lock', 'wait() keeps the lock', 'wait() releases the lock', 'notify() releases all locks immediately'], answer: 2, explanation: 'wait() releases the monitor; sleep() does not.' },
    { question: 'Which technique prevents deadlock by breaking circular wait?', options: ['Using volatile', 'Acquiring locks in a fixed global order', 'Increasing thread priority', 'Calling notify() more often'], answer: 1, explanation: 'Consistent lock ordering makes a cycle impossible.' },
    { question: 'Why should wait() be called inside a while loop?', options: ['To guard against spurious wakeups and changed conditions', 'To make it faster', 'Because if is not allowed in synchronized code', 'To release the lock twice'], answer: 0, explanation: 'The condition must be re-checked after waking up.' },
  ],
};
