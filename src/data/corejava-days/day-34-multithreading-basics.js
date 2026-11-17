const ex1 = `class Downloader extends Thread {
    private final String file;

    Downloader(String file) {
        this.file = file;
    }

    @Override
    public void run() {
        for (int i = 1; i <= 3; i++) {
            System.out.println(getName() + " downloading " + file + " part " + i);
        }
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Downloader d1 = new Downloader("song.mp3");
        Downloader d2 = new Downloader("movie.mp4");
        d1.setName("T1");
        d2.setName("T2");

        d1.start();
        d1.join();      // wait for T1 to finish before starting T2
        d2.start();
        d2.join();
        System.out.println("All downloads finished in " + Thread.currentThread().getName());
    }
}`;

const ex2 = `class EmailTask implements Runnable {
    private final String to;
    EmailTask(String to) { this.to = to; }

    @Override
    public void run() {
        System.out.println(Thread.currentThread().getName() + " sent email to " + to);
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t1 = new Thread(new EmailTask("riya@mail.com"), "Mailer-1");

        Runnable smsTask = () -> System.out.println(Thread.currentThread().getName() + " sent SMS");
        Thread t2 = new Thread(smsTask, "SMS-1");

        t1.start();
        t1.join();
        t2.start();
        t2.join();

        // Calling run() directly does NOT create a new thread
        Thread t3 = new Thread(() -> System.out.println("run() called by: " + Thread.currentThread().getName()), "Worker");
        t3.run();
        System.out.println("Done");
    }
}`;

const ex3 = `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            System.out.println("Inside run, state: " + Thread.currentThread().getState());
            try {
                Thread.sleep(200);
            } catch (InterruptedException e) {
                System.out.println("Interrupted");
            }
        }, "Worker");

        System.out.println("Before start: " + worker.getState());
        System.out.println("Alive before start: " + worker.isAlive());
        worker.start();
        worker.join();
        System.out.println("After join: " + worker.getState());
        System.out.println("Alive after join: " + worker.isAlive());

        try {
            worker.start();   // cannot start a thread twice
        } catch (IllegalThreadStateException e) {
            System.out.println("Error: a thread can be started only once");
        }
    }
}`;

const ex4 = `public class Main {
    static long sumFirst = 0;
    static long sumSecond = 0;

    public static void main(String[] args) throws InterruptedException {
        int[] data = new int[1000];
        for (int i = 0; i < data.length; i++) data[i] = i + 1;   // 1..1000

        Thread a = new Thread(() -> {
            for (int i = 0; i < 500; i++) sumFirst += data[i];
        });
        Thread b = new Thread(() -> {
            for (int i = 500; i < 1000; i++) sumSecond += data[i];
        });

        a.start();
        b.start();       // both run at the same time
        a.join();        // main waits for both
        b.join();

        System.out.println("First half: " + sumFirst);
        System.out.println("Second half: " + sumSecond);
        System.out.println("Total: " + (sumFirst + sumSecond));
    }
}`;

const ex5 = `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread countdown = new Thread(() -> {
            for (int i = 3; i >= 1; i--) {
                System.out.println("Launching in " + i);
                try {
                    Thread.sleep(300);    // pause 0.3 seconds
                } catch (InterruptedException e) {
                    return;
                }
            }
            System.out.println("Lift off!");
        });

        long start = System.currentTimeMillis();
        countdown.start();
        countdown.join();
        long took = System.currentTimeMillis() - start;
        System.out.println("Took at least 900 ms: " + (took >= 900));

        Thread t = new Thread(() -> {});
        System.out.println("Default priority: " + t.getPriority());
        System.out.println("Is daemon: " + t.isDaemon());
    }
}`;

export default {
  id: 'day-34-multithreading-basics',
  title: 'Multithreading Basics, Thread vs Runnable, Thread Lifecycle, sleep/join',
  module: 'Module 6: Multithreading',
  day: 34,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Learn how Java runs multiple tasks at the same time using threads. You will create threads by extending Thread and implementing Runnable, understand the thread lifecycle, and control execution with start(), sleep() and join().',
  objectives: [
    'Differentiate process, thread, multitasking and multithreading',
    'Create threads using Thread class, Runnable interface and lambdas',
    'Explain start() vs run() and why a thread cannot be started twice',
    'Describe the six thread states of the lifecycle',
    'Use sleep(), join(), names, priorities and daemon threads',
  ],
  theory: [
    {
      heading: 'Process, Thread and Multithreading',
      content: 'A process is a running program, like a restaurant. A thread is a single worker inside it, like a waiter. One restaurant can have many waiters serving different tables at the same time — that is multithreading. All threads of a process share the same memory (heap), just as waiters share the same kitchen, but each thread has its own stack (its own order notepad). Every Java program starts with one thread called "main".',
      points: [
        'Multitasking: running many processes (Chrome + Music + IDE)',
        'Multithreading: running many threads inside one process (a browser downloading files while you scroll)',
        'Benefits: better CPU usage, responsive UI, faster work on multi-core CPUs',
        'Threads are lightweight: cheaper to create and switch than processes',
        'Risk: shared data can get corrupted (covered on Day 35)',
      ],
    },
    {
      heading: 'Creating Threads: Thread vs Runnable',
      content: 'Way 1: extend Thread and override run(). Way 2: implement Runnable (a functional interface with run()) and pass it to a Thread object. Way 2 is preferred: Java allows only one parent class, so extending Thread wastes your inheritance; Runnable also separates the TASK (what to do) from the WORKER (thread). Since Java 8, Runnable can be a lambda.',
      syntax: `// 1. Extend Thread
class MyThread extends Thread {
    public void run() { System.out.println("Working"); }
}
new MyThread().start();

// 2. Implement Runnable
class MyTask implements Runnable {
    public void run() { System.out.println("Working"); }
}
new Thread(new MyTask(), "Worker-1").start();

// 3. Lambda (Runnable)
new Thread(() -> System.out.println("Working")).start();`,
      tip: 'Java 21 also adds virtual threads: Thread.ofVirtual().start(task) or Thread.startVirtualThread(task). They are very cheap and great for thousands of I/O tasks.',
    },
    {
      heading: 'start() vs run()',
      content: 'start() asks the JVM to create a NEW thread (new call stack) and then that thread calls run(). Calling run() directly is just a normal method call executed by the current thread — no new thread is created. A thread can be started only once; calling start() again throws IllegalThreadStateException.',
      points: [
        't.start() -> new thread executes run()',
        't.run() -> main thread executes run() like any method',
        'Order of execution between started threads is decided by the thread scheduler and is NOT guaranteed',
      ],
    },
    {
      heading: 'Thread Lifecycle (States)',
      content: 'A thread moves through states defined in the Thread.State enum. Picture a person in a bank: NEW (entered the bank), RUNNABLE (waiting or being served at the counter), BLOCKED (waiting for the only pen that someone else holds — a lock), WAITING (waiting until called, no time limit), TIMED_WAITING (waiting with a time limit, e.g. sleep(1000)), TERMINATED (left the bank).',
      points: [
        'NEW: created, start() not called yet',
        'RUNNABLE: ready to run or running (Java does not separate the two)',
        'BLOCKED: waiting to enter a synchronized block whose lock is held by another thread',
        'WAITING: wait(), join() without timeout',
        'TIMED_WAITING: sleep(ms), wait(ms), join(ms)',
        'TERMINATED: run() has finished (normally or with exception)',
      ],
      syntax: `NEW --start()--> RUNNABLE --run() ends--> TERMINATED
RUNNABLE --sleep/wait(ms)/join(ms)--> TIMED_WAITING --time up--> RUNNABLE
RUNNABLE --wait()/join()--> WAITING --notify/thread ends--> RUNNABLE
RUNNABLE --lock busy--> BLOCKED --lock free--> RUNNABLE`,
    },
    {
      heading: 'sleep(), join(), Priority and Daemon Threads',
      content: 'Thread.sleep(ms) pauses the CURRENT thread for at least the given milliseconds (it does not release locks). t.join() makes the current thread wait until thread t finishes — like a parent waiting at the school gate until the child comes out. Both throw the checked InterruptedException. Priority (1 to 10, default 5) is only a hint to the scheduler. Daemon threads are background helpers (like the garbage collector); the JVM exits when only daemon threads remain.',
      syntax: `Thread.sleep(500);          // static: sleeps the current thread
t.join();                   // wait for t to finish
t.join(1000);               // wait at most 1 second
t.setPriority(Thread.MAX_PRIORITY);  // 10
t.setDaemon(true);          // must be called before start()
t.interrupt();              // politely ask t to stop; sleep() throws InterruptedException`,
      tip: 'Use join() whenever you need the results of other threads before continuing. It also makes program output predictable.',
    },
  ],
  examples: [
    {
      title: 'Creating a Thread by Extending Thread',
      scenario: 'A download manager downloads two files using two worker threads, one after another using join().',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Add class Downloader extends Thread in the same file', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `T1 downloading song.mp3 part 1
T1 downloading song.mp3 part 2
T1 downloading song.mp3 part 3
T2 downloading movie.mp4 part 1
T2 downloading movie.mp4 part 2
T2 downloading movie.mp4 part 3
All downloads finished in main`,
      explanation: 'Because main calls d1.join() before d2.start(), T1 completes fully before T2 begins, so the output is always in this order. If you remove the first join(), lines of T1 and T2 may interleave differently on every run.',
    },
    {
      title: 'Runnable, Lambda and the start() vs run() Difference',
      scenario: 'A notification service sends email and SMS on separate threads, and we prove run() does not create a thread.',
      steps: ['Create Main.java with an EmailTask class implementing Runnable', 'Create a second task with a lambda', 'Run ▶ and check thread names'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Mailer-1 sent email to riya@mail.com
SMS-1 sent SMS
run() called by: main
Done`,
      explanation: 'Threads created with a name print that name. t3.run() executes in the main thread, so it prints "main", proving no new thread was created.',
    },
    {
      title: 'Observing Thread States',
      scenario: 'Check the state of a thread before, during and after execution and try starting it twice.',
      steps: ['Create Main.java', 'Print getState() and isAlive() at different points', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Before start: NEW
Alive before start: false
Inside run, state: RUNNABLE
After join: TERMINATED
Alive after join: false
Error: a thread can be started only once`,
      explanation: 'A thread checking its own state is always RUNNABLE (it is running). After join() the thread is TERMINATED. A second start() throws IllegalThreadStateException. While the worker sleeps, another thread would see it as TIMED_WAITING.',
    },
    {
      title: 'Parallel Sum with Two Threads and join()',
      scenario: 'Split a big array into two halves and add them at the same time on two threads.',
      steps: ['Create Main.java', 'Start both threads, then join both', 'Print results only after join()'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `First half: 125250
Second half: 375250
Total: 500500`,
      explanation: 'Both threads really run at the same time, but each writes to its own variable so there is no conflict. main prints only after both join() calls, so output is always the same. Sum 1..500 = 125250 and 501..1000 = 375250.',
    },
    {
      title: 'sleep(), Priority and Daemon Defaults',
      scenario: 'A rocket launch countdown pauses between numbers using sleep().',
      steps: ['Create Main.java', 'Use Thread.sleep(300) inside the loop', 'Run ▶ and watch the delay'],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Launching in 3
Launching in 2
Launching in 1
Lift off!
Took at least 900 ms: true
Default priority: 5
Is daemon: false`,
      explanation: 'sleep() needs a try-catch because InterruptedException is checked. Three sleeps of 300 ms mean at least 900 ms total. Threads created by main inherit NORM_PRIORITY (5) and are non-daemon.',
    },
  ],
  interview: [
    { q: 'What is the difference between a process and a thread?', a: 'A process is an independent program with its own memory space. A thread is a lightweight unit of execution inside a process; threads share the heap and resources of the process but each has its own stack and program counter.', level: 'Easy' },
    { q: 'What are the ways to create a thread in Java?', a: 'Extend Thread, implement Runnable (or lambda), implement Callable with an ExecutorService, and in Java 21 create virtual threads with Thread.ofVirtual(). Runnable/Callable are preferred.', level: 'Easy' },
    { q: 'Why is implementing Runnable preferred over extending Thread?', a: 'Java supports single inheritance, so extending Thread blocks extending another class. Runnable separates the task from the execution mechanism and can be reused with executors.', level: 'Easy' },
    { q: 'What happens if you call run() instead of start()?', a: 'run() executes in the current thread like a normal method; no new thread is created, so there is no concurrency.', level: 'Easy' },
    { q: 'Can we start a thread twice?', a: 'No. Calling start() on a thread that has already been started throws IllegalThreadStateException.', level: 'Medium' },
    { q: 'Explain the thread lifecycle states.', a: 'NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING, TERMINATED (Thread.State enum).', level: 'Medium' },
    { q: 'Difference between sleep() and join()?', a: 'sleep(ms) is static and pauses the current thread for a time. join() is an instance method that makes the current thread wait until the target thread dies.', level: 'Medium' },
    { q: 'Does sleep() release the lock?', a: 'No. A sleeping thread keeps any monitors it holds. wait() releases the lock.', level: 'Medium' },
    { q: 'What is a daemon thread?', a: 'A low-priority background thread that does not keep the JVM alive. When all user threads finish, the JVM exits and daemon threads are stopped. setDaemon(true) must be called before start().', level: 'Medium' },
    { q: 'What is the output order of: t1.start(); t2.start(); where each prints its name?', a: 'Not guaranteed. The thread scheduler decides; it may be t1 then t2 or the reverse. Use join() to force an order.', level: 'Hard' },
    { q: 'What are virtual threads?', a: 'Java 21 lightweight threads managed by the JVM rather than the OS. Millions can be created; ideal for blocking I/O tasks. Created with Thread.ofVirtual().start() or Executors.newVirtualThreadPerTaskExecutor().', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create two threads: one prints numbers 1-5, the other prints letters A-E. Make the number thread finish first using join().',
      hint: 'Start t1, call t1.join(), then start t2.',
      solution: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread numbers = new Thread(() -> {
            for (int i = 1; i <= 5; i++) System.out.println(i);
        });
        Thread letters = new Thread(() -> {
            for (char c = 'A'; c <= 'E'; c++) System.out.println(c);
        });
        numbers.start();
        numbers.join();
        letters.start();
        letters.join();
    }
}`,
    },
    {
      task: 'Write a digital clock simulation that prints "Tick 1" to "Tick 5" with a 1-second gap using a separate thread.',
      hint: 'Use Thread.sleep(1000) inside a loop in a Runnable.',
      solution: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread clock = new Thread(() -> {
            for (int i = 1; i <= 5; i++) {
                System.out.println("Tick " + i);
                try { Thread.sleep(1000); } catch (InterruptedException e) { return; }
            }
        });
        clock.start();
        clock.join();
        System.out.println("Clock stopped");
    }
}`,
    },
    {
      task: 'Find the factorial of 10, 15 and 20 in three different threads. Store results in an array and print them after all threads finish.',
      hint: 'Use a long[] results array; each thread writes to its own index; join all three.',
      solution: `public class Main {
    static long fact(int n) {
        long f = 1;
        for (int i = 2; i <= n; i++) f *= i;
        return f;
    }
    public static void main(String[] args) throws InterruptedException {
        int[] nums = {10, 15, 20};
        long[] results = new long[3];
        Thread[] threads = new Thread[3];
        for (int i = 0; i < 3; i++) {
            final int idx = i;
            threads[i] = new Thread(() -> results[idx] = fact(nums[idx]));
            threads[i].start();
        }
        for (Thread t : threads) t.join();
        for (int i = 0; i < 3; i++) System.out.println(nums[i] + "! = " + results[i]);
    }
}`,
    },
    {
      task: 'Create a thread that loops forever printing "working" every 200 ms; let main interrupt it after 1 second and print "Stopped".',
      hint: 'Loop while !Thread.currentThread().isInterrupted(); catch InterruptedException and break.',
      solution: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread worker = new Thread(() -> {
            while (!Thread.currentThread().isInterrupted()) {
                System.out.println("working");
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    break;  // interrupted while sleeping
                }
            }
            System.out.println("Stopped");
        });
        worker.start();
        Thread.sleep(1000);
        worker.interrupt();
        worker.join();
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which method actually creates a new thread of execution?', options: ['run()', 'start()', 'init()', 'execute()'], answer: 1, explanation: 'start() creates a new call stack and the new thread calls run().' },
    { question: 'Which state is a thread in after calling Thread.sleep(1000)?', options: ['BLOCKED', 'WAITING', 'TIMED_WAITING', 'TERMINATED'], answer: 2, explanation: 'sleep with a time puts the thread in TIMED_WAITING.' },
    { question: 'What does t.join() do?', options: ['Starts t', 'Merges two threads into one', 'Stops t immediately', 'Makes the current thread wait until t finishes'], answer: 3, explanation: 'join() blocks the caller until the target thread terminates.' },
    { question: 'Default priority of a thread created by main is:', options: ['5', '1', '10', '0'], answer: 0, explanation: 'NORM_PRIORITY is 5 and is inherited from main.' },
    { question: 'Calling start() twice on the same Thread object throws:', options: ['InterruptedException', 'IllegalThreadStateException', 'IllegalArgumentException', 'Nothing; it runs again'], answer: 1, explanation: 'A thread can be started only once.' },
  ],
};
