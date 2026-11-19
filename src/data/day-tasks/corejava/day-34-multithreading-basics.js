export default {
  lesson: 'day-34-multithreading-basics',
  minutes: 22,
  intro: 'Create threads with Thread, Runnable and lambdas, and control them with start(), join(), sleep() and states.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'start() vs run(): what does this program print?',
      example: { title: 'the current thread\'s name', code: 'System.out.println(Thread.currentThread().getName()); // main' },
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Runnable task = () -> System.out.println("Running in " + Thread.currentThread().getName());

        Thread t = new Thread(task, "worker-1");
        t.run();
        t.start();
        t.join();
        System.out.println("main done");
    }
}`,
      expected: `Running in main
Running in worker-1
main done`,
      explain: 'Calling `run()` directly is just a normal method call **in the main thread**. `start()` creates the new thread "worker-1", which then calls run(). `join()` makes main wait until the worker finishes, so "main done" always comes last.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Thread states: what does this program print?',
      example: { title: 'reading a state', code: 'Thread.State s = t.getState();' },
      code: `public class Main {
    public static void main(String[] args) throws InterruptedException {
        Thread t = new Thread(() -> {
            int sum = 0;
            for (int i = 1; i <= 100; i++) sum += i;
            System.out.println("sum = " + sum);
        });
        System.out.println(t.getState());
        t.start();
        t.join();
        System.out.println(t.getState());
        System.out.println(t.isAlive());
    }
}`,
      expected: `NEW
sum = 5050
TERMINATED
false`,
      explain: 'Before `start()` a thread is **NEW**. After `join()` returns, it has finished and is **TERMINATED** (and no longer alive). The six states are NEW, RUNNABLE, BLOCKED, WAITING, TIMED_WAITING and TERMINATED.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Given `Thread t = new Thread(task);`, write the call that begins **parallel** execution of the task.',
      example: { title: 'waiting for a thread', code: 't.join(); // wait until t finishes' },
      accept: ['t.start()'],
      acceptRegex: ['^t\\s*\\.\\s*start\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`start()` asks the JVM to create a new call stack and then calls `run()` in that new thread. Calling `t.run()` yourself would run the code in the current thread, with no parallelism.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the class header for the **preferred** way to define a task (the class can still extend another class):
\`class EmailTask ____ Runnable {\``,
      example: {
        title: 'the other way',
        code: `class Downloader extends Thread {
  public void run() { ... }
}`,
      },
      accept: ['implements'],
      acceptRegex: ['^implements\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Implementing `Runnable` separates the task from the thread and keeps the single `extends` free for something else. It also works with thread pools (ExecutorService) and lambdas.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens if you call `t.start()` **twice** on the same Thread object?',
      options: ['The task runs twice', 'The second call is ignored', 'IllegalThreadStateException', 'The thread restarts from the beginning'],
      answer: 2,
      explain: 'A thread can be started only once. After it has started (or finished), calling `start()` again throws **IllegalThreadStateException**. Create a new Thread object (or use a thread pool) to run the task again.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Thread.sleep(1000) pauses the current thread for about 1 second',
        'sleep() must handle InterruptedException',
        'The JVM waits for daemon threads to finish before exiting',
        'Threads of one process share the same heap memory',
        'Thread priority guarantees the execution order',
      ],
      answers: [0, 1, 3],
      explain: 'sleep pauses the **current** thread and throws the checked InterruptedException. Threads share the heap (that is why synchronization is needed). The JVM does NOT wait for daemon threads, and priorities are only hints to the scheduler.',
    },
  ],
};
