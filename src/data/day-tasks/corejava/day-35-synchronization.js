export default {
  lesson: 'day-35-synchronization',
  minutes: 22,
  intro: 'Spot race conditions and fix them with synchronized, volatile, AtomicInteger and locks.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'A synchronized counter shared by two threads: what does this program print?',
      example: { title: 'synchronized method', code: 'synchronized void increment() { count++; } // one thread at a time' },
      code: `class Counter {
    private int count = 0;
    synchronized void increment() { count++; }
    int get() { return count; }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Counter c = new Counter();
        Runnable job = () -> {
            for (int i = 0; i < 5000; i++) c.increment();
        };
        Thread t1 = new Thread(job);
        Thread t2 = new Thread(job);
        t1.start();
        t2.start();
        t1.join();
        t2.join();
        System.out.println(c.get());
    }
}`,
      expected: '10000',
      explain: 'Because `increment()` is synchronized, only one thread at a time can run it on this Counter, so no updates are lost: 2 × 5000 = **10000** every time. Without synchronized, the result would often be less, because `count++` is read-modify-write.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'AtomicInteger methods: what does this program print?',
      example: {
        title: 'atomic increment',
        code: `AtomicInteger hits = new AtomicInteger();
hits.incrementAndGet(); // 1`,
      },
      code: `import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) {
        AtomicInteger a = new AtomicInteger(0);
        System.out.println(a.incrementAndGet());
        System.out.println(a.getAndIncrement());
        System.out.println(a.get());
        System.out.println(a.addAndGet(5));
        System.out.println(a.compareAndSet(7, 10));
        System.out.println(a.compareAndSet(7, 20));
        System.out.println(a.get());
    }
}`,
      expected: `1
1
2
7
true
false
10`,
      explain: '`incrementAndGet` is like ++a (returns 1), `getAndIncrement` like a++ (returns 1, then a = 2). `addAndGet(5)` → 7. `compareAndSet(expected, new)` changes the value only if it currently equals expected: the first succeeds (7 → 10), the second fails because the value is now 10.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the block so only one thread at a time updates the shared list, locking on \`this\`:
\`____ (this) {\`
\`    orders.add(order);\`
\`}\``,
      example: { title: 'class-level lock', code: 'synchronized (Counter.class) { total++; }' },
      accept: ['synchronized'],
      acceptRegex: ['^synchronized\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'A **synchronized block** locks only the critical lines, not the whole method, which improves performance. The object in brackets is the monitor; all threads must lock the same object for it to work.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `A \`stop\` flag is written by one thread and read in a loop by another. Which keyword guarantees the reader **sees** the latest value?
\`private ____ boolean stop = false;\``,
      example: { title: 'the reader loop', code: 'while (!stop) { doWork(); }' },
      accept: ['volatile'],
      acceptRegex: ['^volatile\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`volatile` makes every read go to main memory, so changes by one thread are **visible** to others. It does not make compound actions like `count++` atomic — use synchronized or AtomicInteger for that.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why is `count++` not thread-safe?',
      options: [
        'Because int is a primitive',
        'Because it is three steps (read, add 1, write back) and threads can interleave between them',
        'Because ++ is slower than += 1',
        'Because the JVM caches all ints',
      ],
      answer: 1,
      explain: 'Two threads can both read 5, both add 1 and both write 6: one increment is lost. This is a **race condition**. synchronized, AtomicInteger or a Lock make the read-modify-write atomic.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'A synchronized instance method locks the object (this)',
        'A static synchronized method locks the Class object',
        'Two threads can run different synchronized instance methods on the same object at the same time',
        'ReentrantLock must be released in a finally block with unlock()',
        'synchronized makes code faster',
      ],
      answers: [0, 1, 3],
      explain: 'Instance methods lock `this`, static ones lock `ClassName.class`. Since both synchronized methods need the same object lock, two threads cannot be inside them at once on the same object. Always `unlock()` in finally. Synchronization adds overhead, it never speeds code up.',
    },
  ],
};
