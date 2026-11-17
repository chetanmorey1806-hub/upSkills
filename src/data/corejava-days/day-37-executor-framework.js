const ex1 = `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);   // 3 reusable workers

        // Runnable task: no result. submit() gives a Future<?> we can wait on
        // (pool.execute(runnable) also works but returns nothing to wait on)
        Future<?> first = pool.submit(() -> {
            String name = Thread.currentThread().getName();
            boolean fromPool = name.startsWith("pool-");
            System.out.println("Runnable ran on a pool thread: " + fromPool);
        });
        first.get();   // wait so this line always prints first

        // Callable tasks with submit(): return a Future
        List<Future<Integer>> futures = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            final int n = i;
            futures.add(pool.submit(() -> n * n));
        }

        int total = 0;
        for (int i = 0; i < futures.size(); i++) {
            int value = futures.get(i).get();   // blocks until result is ready
            System.out.println("Square of " + (i + 1) + " = " + value);
            total += value;
        }
        System.out.println("Total = " + total);

        pool.shutdown();                         // no new tasks; finish queued ones
        System.out.println("Shutdown requested: " + pool.isShutdown());
    }
}`;

const ex2 = `import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

class PriceFetcher implements Callable<Integer> {
    private final String shop;
    private final int price;
    private final int delayMs;

    PriceFetcher(String shop, int price, int delayMs) {
        this.shop = shop; this.price = price; this.delayMs = delayMs;
    }

    @Override
    public Integer call() throws Exception {      // can return a value and throw
        Thread.sleep(delayMs);                     // simulate network call
        return price;
    }

    String getShop() { return shop; }
}

public class Main {
    public static void main(String[] args) throws Exception {
        List<PriceFetcher> tasks = List.of(
                new PriceFetcher("Amazon", 55000, 300),
                new PriceFetcher("Flipkart", 53500, 200),
                new PriceFetcher("Croma", 56000, 100));

        ExecutorService pool = Executors.newFixedThreadPool(3);
        long start = System.currentTimeMillis();
        List<Future<Integer>> results = pool.invokeAll(tasks);   // run all, wait for all
        long took = System.currentTimeMillis() - start;

        int best = Integer.MAX_VALUE;
        String bestShop = "";
        for (int i = 0; i < tasks.size(); i++) {
            int p = results.get(i).get();
            System.out.println(tasks.get(i).getShop() + ": " + p);
            if (p < best) { best = p; bestShop = tasks.get(i).getShop(); }
        }
        System.out.println("Cheapest: " + bestShop + " at " + best);
        System.out.println("Ran in parallel (under 550 ms): " + (took < 550));

        pool.shutdown();
        System.out.println("Terminated: " + pool.awaitTermination(1, TimeUnit.SECONDS));
    }
}`;

const ex3 = `import java.util.concurrent.ExecutionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ExecutorService pool = Executors.newSingleThreadExecutor();

        Future<String> slow = pool.submit(() -> {
            Thread.sleep(2000);
            return "report ready";
        });
        try {
            System.out.println(slow.get(300, TimeUnit.MILLISECONDS));
        } catch (TimeoutException e) {
            System.out.println("Timed out waiting, cancelling...");
            System.out.println("Cancelled: " + slow.cancel(true));
        } catch (ExecutionException e) {
            System.out.println("Failed");
        }
        System.out.println("isDone: " + slow.isDone() + ", isCancelled: " + slow.isCancelled());

        Future<Integer> bad = pool.submit(() -> 10 / 0);
        try {
            bad.get();
        } catch (ExecutionException e) {
            System.out.println("Task failed with: " + e.getCause());
        }

        pool.shutdown();
    }
}`;

const ex4 = `import java.util.concurrent.CompletableFuture;

public class Main {
    static int fetchUserId(String name) {
        return name.length() * 10;           // pretend database lookup
    }

    public static void main(String[] args) {
        CompletableFuture<Integer> userId =
                CompletableFuture.supplyAsync(() -> fetchUserId("Riya"));   // runs in background

        CompletableFuture<String> greeting = userId
                .thenApply(id -> "User#" + id)                  // transform result
                .thenApply(String::toUpperCase);

        CompletableFuture<Integer> orders = CompletableFuture.supplyAsync(() -> 3);
        CompletableFuture<String> summary =
                greeting.thenCombine(orders, (g, o) -> g + " has " + o + " orders");

        System.out.println(summary.join());     // join() waits, no checked exception

        CompletableFuture<Integer> failing = CompletableFuture
                .supplyAsync(() -> Integer.parseInt("abc"))
                .exceptionally(ex -> {
                    System.out.println("Recovered from: " + ex.getCause().getClass().getSimpleName());
                    return -1;
                });
        System.out.println("Result: " + failing.join());

        CompletableFuture<Void> all = CompletableFuture.allOf(
                CompletableFuture.runAsync(() -> { }),
                CompletableFuture.runAsync(() -> { }));
        all.join();
        System.out.println("All tasks done: " + all.isDone());

        CompletableFuture.supplyAsync(() -> 21)
                .thenApply(x -> x * 2)
                .thenAccept(x -> System.out.println("Answer: " + x))
                .join();
    }
}`;

export default {
  id: 'day-37-executor-framework',
  title: 'Executor Framework, Callable, Future, CompletableFuture Basics',
  module: 'Module 6: Multithreading',
  day: 37,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Creating threads manually is costly and hard to manage. Learn the Executor framework (thread pools), Callable tasks that return results, Future to get results later, and CompletableFuture for modern asynchronous pipelines.',
  objectives: [
    'Explain why thread pools are better than creating new threads for every task',
    'Use ExecutorService types: fixed, cached, single, scheduled and virtual-thread executors',
    'Differentiate Runnable vs Callable and execute() vs submit()',
    'Use Future.get(), timeouts, cancel() and handle ExecutionException',
    'Build async pipelines with CompletableFuture (supplyAsync, thenApply, thenCombine, exceptionally)',
  ],
  theory: [
    {
      heading: 'Why the Executor Framework?',
      content: 'Creating a new Thread for every task is like hiring a new employee for every single customer and firing them after. It is slow and, with thousands of customers, the company (JVM) runs out of space. A thread pool is a fixed team of employees who pick up tasks from a queue one after another. The Executor framework (java.util.concurrent, Java 5) manages this team for you.',
      points: [
        'Reuses threads — saves creation cost',
        'Limits the number of threads — protects memory and CPU',
        'Separates task submission from execution policy',
        'Gives results (Future), cancellation, timeouts and scheduling',
        'Diagram: tasks --> [ task queue ] --> worker1, worker2, worker3 --> results',
      ],
    },
    {
      heading: 'Types of ExecutorService',
      content: 'The Executors factory class creates ready-made pools. Choose based on your workload.',
      syntax: `ExecutorService fixed  = Executors.newFixedThreadPool(4);    // exactly 4 threads
ExecutorService cached = Executors.newCachedThreadPool();     // grows as needed, reuses idle
ExecutorService single = Executors.newSingleThreadExecutor(); // tasks run one by one, in order
ScheduledExecutorService sch = Executors.newScheduledThreadPool(2);
sch.schedule(task, 5, TimeUnit.SECONDS);                       // run after delay
sch.scheduleAtFixedRate(task, 0, 1, TimeUnit.MINUTES);         // repeat
ExecutorService virt = Executors.newVirtualThreadPerTaskExecutor(); // Java 21`,
      points: [
        'CPU-heavy tasks: pool size ≈ number of cores (Runtime.getRuntime().availableProcessors())',
        'I/O-heavy tasks: more threads, or virtual threads in Java 21',
        'In production, ThreadPoolExecutor is often created directly to control queue size and rejection policy',
      ],
    },
    {
      heading: 'Runnable vs Callable, execute() vs submit()',
      content: 'Runnable.run() returns nothing and cannot throw checked exceptions. Callable<V>.call() returns a value of type V and can throw Exception — like the difference between asking someone to "clean the room" (Runnable) and asking them to "count the books and tell me" (Callable).',
      points: [
        'execute(Runnable): fire and forget, returns void (defined in Executor)',
        'submit(Runnable or Callable): returns a Future (defined in ExecutorService)',
        'invokeAll(tasks): runs all Callables and returns List<Future> after all complete',
        'invokeAny(tasks): returns the result of the first one that succeeds',
        'Exceptions inside a submitted task are stored in the Future and rethrown by get() wrapped in ExecutionException',
      ],
    },
    {
      heading: 'Future and Shutting Down',
      content: 'A Future is a receipt for a result that will be ready later — like a token at a food court. You can check isDone(), wait with get(), wait with a timeout get(time, unit), or cancel(true). A pool\'s threads are non-daemon, so you MUST shut it down or the program never exits.',
      syntax: `Future<Integer> f = pool.submit(() -> compute());
Integer r = f.get();                          // blocks
Integer r2 = f.get(2, TimeUnit.SECONDS);      // TimeoutException if late
f.cancel(true);  f.isDone();  f.isCancelled();

pool.shutdown();                              // finish queued tasks, accept no new ones
pool.awaitTermination(10, TimeUnit.SECONDS);  // wait for completion
pool.shutdownNow();                           // interrupt running tasks
// Java 19+: try (ExecutorService p = Executors.newFixedThreadPool(2)) { ... } auto-closes`,
      tip: 'Future.get() blocks. Calling it immediately after submit() removes the benefit of parallelism. Submit all tasks first, then collect results.',
    },
    {
      heading: 'CompletableFuture Basics',
      content: 'CompletableFuture (Java 8) lets you describe WHAT to do when a result arrives instead of blocking for it — like ordering food online and saying "when it arrives, put it on the table and call me". By default async tasks run in the common ForkJoinPool.',
      syntax: `CompletableFuture.supplyAsync(() -> fetch())    // start async, returns value
    .thenApply(x -> transform(x))                // map the result
    .thenAccept(x -> System.out.println(x))      // consume result
    .exceptionally(ex -> fallback)               // handle errors
    .join();                                     // wait (unchecked exceptions)

a.thenCombine(b, (x, y) -> x + y);               // combine two independent futures
a.thenCompose(x -> callAnotherAsync(x));         // chain dependent async calls
CompletableFuture.allOf(f1, f2, f3).join();      // wait for all
CompletableFuture.anyOf(f1, f2);                 // first one to finish`,
      points: [
        'runAsync(Runnable) -> CompletableFuture<Void>; supplyAsync(Supplier) -> CompletableFuture<T>',
        'thenApply = map, thenCompose = flatMap, thenCombine = zip two results',
        'join() throws unchecked CompletionException; get() throws checked exceptions',
        'Pass your own executor: supplyAsync(task, myPool)',
      ],
    },
  ],
  examples: [
    {
      title: 'Fixed Thread Pool with execute() and submit()',
      scenario: 'A service calculates squares of numbers using a pool of 3 worker threads and collects all results.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Create the pool with Executors.newFixedThreadPool(3)', 'Submit tasks, then collect results with get()', 'Call shutdown() and click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Runnable ran on a pool thread: true
Square of 1 = 1
Square of 2 = 4
Square of 3 = 9
Square of 4 = 16
Square of 5 = 25
Total = 55
Shutdown requested: true`,
      explanation: 'Pool threads are named pool-1-thread-1, etc. main waits for the Runnable with first.get() so its line always prints first. The Callables may finish in any order, but main collects results in submission order, so the squares and total always print the same way. Only main prints them. Without shutdown() the program would keep running.',
    },
    {
      title: 'Callable and invokeAll: Price Comparison',
      scenario: 'Fetch a phone price from three online shops in parallel and pick the cheapest.',
      steps: ['Create Main.java with a PriceFetcher class implementing Callable<Integer>', 'Use invokeAll() to run all tasks together', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Amazon: 55000
Flipkart: 53500
Croma: 56000
Cheapest: Flipkart at 53500
Ran in parallel (under 550 ms): true
Terminated: true`,
      explanation: 'invokeAll returns futures in the same order as the task list, regardless of which finishes first. The three delays (300+200+100 = 600 ms if sequential) overlap, so the whole call takes about 300 ms.',
    },
    {
      title: 'Future Timeout, Cancel and ExecutionException',
      scenario: 'A report generation task is too slow; the caller gives up after 300 ms. Another task fails with an exception.',
      steps: ['Create Main.java', 'Use get(timeout) and cancel(true)', 'Catch ExecutionException and print getCause()', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Timed out waiting, cancelling...
Cancelled: true
isDone: true, isCancelled: true
Task failed with: java.lang.ArithmeticException: / by zero`,
      explanation: 'get(300, ms) throws TimeoutException because the task needs 2 seconds. cancel(true) interrupts it; a cancelled Future reports isDone() = true. The exception thrown inside a task is wrapped in ExecutionException; getCause() gives the original ArithmeticException.',
    },
    {
      title: 'CompletableFuture Pipeline',
      scenario: 'Fetch a user id asynchronously, build a greeting, combine it with order count, and recover from a failing parse.',
      steps: ['Create Main.java', 'Chain supplyAsync, thenApply, thenCombine, exceptionally', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `USER#40 has 3 orders
Recovered from: NumberFormatException
Result: -1
All tasks done: true
Answer: 42`,
      explanation: '"Riya".length() * 10 = 40, mapped to "User#40" and upper-cased. thenCombine joins two independent futures. The failing parse is wrapped in CompletionException; ex.getCause() is the NumberFormatException, and exceptionally returns the fallback -1. Each join() waits, so prints happen in this fixed order.',
    },
  ],
  interview: [
    { q: 'What is the Executor framework?', a: 'A java.util.concurrent framework that decouples task submission from execution using thread pools (Executor, ExecutorService, ScheduledExecutorService, ThreadPoolExecutor, Executors factory).', level: 'Easy' },
    { q: 'Difference between Runnable and Callable?', a: 'Runnable.run() returns void and cannot throw checked exceptions. Callable<V>.call() returns V and can throw Exception.', level: 'Easy' },
    { q: 'Difference between execute() and submit()?', a: 'execute(Runnable) returns void and exceptions go to the thread\'s uncaught handler. submit() accepts Runnable or Callable and returns a Future; exceptions are captured and rethrown from get() as ExecutionException.', level: 'Medium' },
    { q: 'What is a Future?', a: 'An object representing the pending result of an async task, with get(), get(timeout), isDone(), cancel() and isCancelled().', level: 'Easy' },
    { q: 'shutdown() vs shutdownNow()?', a: 'shutdown() stops accepting new tasks but completes already submitted ones. shutdownNow() also interrupts running tasks and returns the list of tasks that never started.', level: 'Medium' },
    { q: 'What happens if you forget to shut down an ExecutorService?', a: 'Its non-daemon worker threads stay alive, so the JVM does not exit (resource leak).', level: 'Medium' },
    { q: 'Fixed vs cached thread pool?', a: 'Fixed has a constant number of threads and an unbounded queue. Cached creates threads as needed and reuses idle ones (idle threads die after 60s); risky with unbounded task bursts.', level: 'Medium' },
    { q: 'What are the core parameters of ThreadPoolExecutor?', a: 'corePoolSize, maximumPoolSize, keepAliveTime, workQueue, threadFactory and RejectedExecutionHandler (AbortPolicy, CallerRunsPolicy, DiscardPolicy, DiscardOldestPolicy).', level: 'Hard' },
    { q: 'Future vs CompletableFuture?', a: 'Future only supports blocking get and cancel. CompletableFuture supports non-blocking callbacks, chaining (thenApply/thenCompose), combining (thenCombine/allOf), manual completion and exception handling.', level: 'Medium' },
    { q: 'thenApply vs thenCompose?', a: 'thenApply maps a result to a value (like map). thenCompose maps a result to another CompletableFuture and flattens it (like flatMap), avoiding CompletableFuture<CompletableFuture<T>>.', level: 'Hard' },
    { q: 'Which thread pool runs CompletableFuture.supplyAsync by default?', a: 'ForkJoinPool.commonPool(), unless you pass an Executor as the second argument.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Use a fixed thread pool of 2 threads to compute the sum of 1..1000, 1001..2000 and 2001..3000 as three Callables, then print the grand total (4501500).',
      hint: 'Create a helper that returns a Callable<Long> for a range; submit all, then get().',
      solution: `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.*;

public class Main {
    static Callable<Long> rangeSum(int from, int to) {
        return () -> {
            long s = 0;
            for (int i = from; i <= to; i++) s += i;
            return s;
        };
    }
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(2);
        List<Future<Long>> fs = new ArrayList<>();
        fs.add(pool.submit(rangeSum(1, 1000)));
        fs.add(pool.submit(rangeSum(1001, 2000)));
        fs.add(pool.submit(rangeSum(2001, 3000)));
        long total = 0;
        for (Future<Long> f : fs) total += f.get();
        pool.shutdown();
        System.out.println("Total: " + total);
    }
}`,
    },
    {
      task: 'Schedule a task that prints "Backup done" 3 times, once every 500 ms, using ScheduledExecutorService, then shut it down.',
      hint: 'scheduleAtFixedRate(task, 0, 500, TimeUnit.MILLISECONDS); sleep ~1300 ms then shutdown().',
      solution: `import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ScheduledExecutorService sch = Executors.newScheduledThreadPool(1);
        sch.scheduleAtFixedRate(() -> System.out.println("Backup done"), 0, 500, TimeUnit.MILLISECONDS);
        Thread.sleep(1300);
        sch.shutdown();
    }
}`,
    },
    {
      task: 'Using CompletableFuture, fetch a product price (100) and a tax rate (18) asynchronously, combine them to compute the final price and print "Final price: 118.0".',
      hint: 'supplyAsync for each, thenCombine((p, t) -> p + p * t / 100.0).',
      solution: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 100);
        CompletableFuture<Integer> tax = CompletableFuture.supplyAsync(() -> 18);
        double result = price.thenCombine(tax, (p, t) -> p + p * t / 100.0).join();
        System.out.println("Final price: " + result);
    }
}`,
    },
    {
      task: 'Use invokeAny with three Callables that sleep 300, 100 and 200 ms and return "Server A", "Server B" and "Server C". Print the fastest server.',
      hint: 'invokeAny returns the first successfully completed result (Server B).',
      solution: `import java.util.List;
import java.util.concurrent.*;

public class Main {
    static Callable<String> server(String name, int ms) {
        return () -> { Thread.sleep(ms); return name; };
    }
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        String fastest = pool.invokeAny(List.of(
                server("Server A", 300), server("Server B", 100), server("Server C", 200)));
        System.out.println("Fastest: " + fastest);
        pool.shutdownNow();
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which interface returns a value from a task?', options: ['Runnable', 'Executor', 'Callable', 'Thread'], answer: 2, explanation: 'Callable<V>.call() returns V.' },
    { question: 'What does Future.get() do if the task is not finished?', options: ['Returns null', 'Blocks until the result is ready', 'Throws immediately', 'Cancels the task'], answer: 1, explanation: 'get() waits for completion (or use get with a timeout).' },
    { question: 'An exception thrown inside a submitted Callable reaches the caller as:', options: ['ExecutionException from get()', 'It is lost silently', 'RuntimeException in main immediately', 'InterruptedException'], answer: 0, explanation: 'The Future wraps it in ExecutionException; getCause() returns the original.' },
    { question: 'Which method stops accepting new tasks but lets queued tasks finish?', options: ['shutdownNow()', 'close the JVM', 'cancel()', 'shutdown()'], answer: 3, explanation: 'shutdown() is graceful; shutdownNow() interrupts tasks.' },
    { question: 'In CompletableFuture, which method is the equivalent of flatMap?', options: ['thenApply', 'thenCompose', 'thenAccept', 'thenRun'], answer: 1, explanation: 'thenCompose chains a function returning another CompletableFuture and flattens it.' },
  ],
};
