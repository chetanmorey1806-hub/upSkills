export default {
  lesson: 'day-36-wait-notify-deadlock',
  minutes: 22,
  intro: 'Coordinate threads with wait()/notify(), build a producer-consumer, and recognise and prevent deadlocks.',
  tasks: [
    {
      type: 'output',
      mins: 5,
      q: 'One-slot producer-consumer: what does this program print? (the printing happens inside the synchronized methods)',
      example: {
        title: 'the wait pattern',
        code: `synchronized void take() throws InterruptedException {
  while (!available) wait();
  ...
  notifyAll();
}`,
      },
      code: `class Slot {
    private int value;
    private boolean full = false;

    synchronized void put(int v) throws InterruptedException {
        while (full) wait();
        value = v;
        full = true;
        System.out.println("Produced " + v);
        notifyAll();
    }

    synchronized int take() throws InterruptedException {
        while (!full) wait();
        full = false;
        System.out.println("Consumed " + value);
        notifyAll();
        return value;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Slot slot = new Slot();
        Thread producer = new Thread(() -> {
            try { for (int i = 1; i <= 3; i++) slot.put(i * 10); } catch (InterruptedException e) { }
        });
        Thread consumer = new Thread(() -> {
            try { for (int i = 1; i <= 3; i++) slot.take(); } catch (InterruptedException e) { }
        });
        consumer.start();
        producer.start();
        producer.join();
        consumer.join();
        System.out.println("done");
    }
}`,
      expected: `Produced 10
Consumed 10
Produced 20
Consumed 20
Produced 30
Consumed 30
done`,
      explain: 'The slot holds one value. The consumer waits while it is empty, the producer waits while it is full, so they must **alternate**: Produced 10, Consumed 10, Produced 20 … Even though the consumer thread starts first, it just waits. `join()` makes "done" last.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print?',
      example: {
        title: 'wait needs the lock',
        code: `synchronized (lock) {
  lock.wait();   // OK: we own lock's monitor
}`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        Object lock = new Object();
        try {
            lock.wait();
        } catch (InterruptedException | IllegalMonitorStateException e) {
            System.out.println(e.getClass().getSimpleName());
        }
    }
}`,
      expected: 'IllegalMonitorStateException',
      explain: '`wait()`, `notify()` and `notifyAll()` may only be called by a thread that **owns the object\'s monitor**, i.e. inside `synchronized (lock)`. Otherwise Java throws IllegalMonitorStateException immediately.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the guard. Because of spurious wakeups, the condition must be re-checked after waking up:
\`____ (queue.isEmpty()) {\`
\`    lock.wait();\`
\`}\``,
      example: { title: 'same pattern for a full buffer', code: 'while (count == capacity) wait();' },
      accept: ['while'],
      acceptRegex: ['^while\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Always call wait() in a **while** loop, not an if: a thread can wake up without a notify (spurious wakeup) or another consumer may have taken the item first, so the condition must be checked again.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `After adding an item, the producer wants to wake **all** waiting consumer threads. Complete the call:
\`lock.____;\``,
      example: { title: 'waking just one thread', code: 'lock.notify();' },
      accept: ['notifyAll()'],
      acceptRegex: ['^notifyAll\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`notifyAll()` wakes every thread waiting on that monitor; each re-checks its while-condition. `notify()` wakes only one arbitrary thread, which can lead to missed signals when producers and consumers wait on the same lock.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the key difference between `wait()` and `Thread.sleep()`?',
      options: [
        'sleep releases the lock, wait keeps it',
        'wait releases the monitor lock, sleep keeps any locks it holds',
        'They are the same',
        'wait is a static method of Thread',
      ],
      answer: 1,
      explain: '`wait()` (an Object method) **releases the lock** and waits for notify. `sleep()` (a static Thread method) just pauses and **keeps** any locks, which can block other threads.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which help **prevent deadlock**? (choose all that apply)',
      options: [
        'Always acquire multiple locks in the same global order',
        'Use tryLock with a timeout and back off if it fails',
        'Hold locks for as short a time as possible',
        'Make every method synchronized',
        'Nest synchronized blocks in random order',
      ],
      answers: [0, 1, 2],
      explain: 'Deadlock needs a **circular wait**: T1 holds A and wants B while T2 holds B and wants A. A fixed lock order breaks the cycle, tryLock with timeout lets a thread give up, and short critical sections reduce the risk. Synchronizing everything makes deadlocks more likely.',
    },
  ],
};
