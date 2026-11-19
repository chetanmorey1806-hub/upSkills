export default {
  lesson: 'day-37-executor-framework',
  minutes: 22,
  intro: 'Run tasks in thread pools, get results with Callable/Future and build pipelines with CompletableFuture.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Callable and Future: what does this program print?',
      example: {
        title: 'submitting a Callable',
        code: `Future<String> f = pool.submit(() -> "done");
System.out.println(f.get()); // waits, then prints done`,
      },
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ExecutorService pool = Executors.newFixedThreadPool(3);
        List<Future<Integer>> results = new ArrayList<>();
        for (int i = 1; i <= 4; i++) {
            final int n = i;
            results.add(pool.submit(() -> n * n));
        }
        int total = 0;
        for (Future<Integer> f : results) {
            total += f.get();
        }
        System.out.println("Total: " + total);
        System.out.println(results.get(2).get());
        pool.shutdown();
        System.out.println(pool.isShutdown());
    }
}`,
      expected: `Total: 30
9
true`,
      explain: 'Each lambda returns a value, so it is a **Callable<Integer>** and `submit` gives back a Future. `get()` blocks until that task\'s result is ready, so the sum 1 + 4 + 9 + 16 = 30 is always correct whatever order the tasks ran in. Futures are kept in submission order, so index 2 is 3 × 3 = 9.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'CompletableFuture pipeline: what does this program print?',
      example: {
        title: 'transforming an async result',
        code: `CompletableFuture.supplyAsync(() -> "hi")
    .thenApply(String::toUpperCase)
    .join(); // "HI"`,
      },
      code: `import java.util.concurrent.CompletableFuture;

public class Main {
    public static void main(String[] args) {
        CompletableFuture<Integer> price = CompletableFuture.supplyAsync(() -> 100);
        CompletableFuture<Integer> tax = CompletableFuture.supplyAsync(() -> 18);

        int total = price.thenApply(p -> p * 2)
                         .thenCombine(tax, (p, t) -> p + t)
                         .join();
        System.out.println(total);

        int safe = CompletableFuture.supplyAsync(() -> 10 / 0)
                                    .exceptionally(ex -> -1)
                                    .join();
        System.out.println(safe);
    }
}`,
      expected: `218
-1`,
      explain: '`thenApply` transforms the result (100 → 200), `thenCombine` merges it with another future\'s result (200 + 18 = 218) and `join` waits for the final value. In the second pipeline the division throws, so `exceptionally` supplies the fallback −1 instead of crashing.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a thread pool with exactly **4** worker threads:
\`ExecutorService pool = ____;\``,
      example: { title: 'a single-thread executor', code: 'ExecutorService one = Executors.newSingleThreadExecutor();' },
      accept: ['Executors.newFixedThreadPool(4)'],
      acceptRegex: ['^Executors\\s*\\.\\s*newFixedThreadPool\\s*\\(\\s*4\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Executors.newFixedThreadPool(4)` reuses 4 threads for any number of tasks; extra tasks wait in a queue. Creating a new Thread per task is expensive and can exhaust memory under load.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `When all tasks are submitted, which call lets the pool finish the queued tasks and then stop (without interrupting running ones)?
\`pool.____;\``,
      example: { title: 'waiting for the pool to finish', code: 'pool.awaitTermination(10, TimeUnit.SECONDS);' },
      accept: ['shutdown()'],
      acceptRegex: ['^shutdown\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`shutdown()` stops accepting new tasks but completes the submitted ones. `shutdownNow()` tries to interrupt running tasks and returns the waiting ones. Forgetting shutdown keeps non-daemon pool threads alive, so the JVM does not exit.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the difference between `Runnable` and `Callable`?',
      options: [
        'Runnable returns a value, Callable does not',
        'Callable.call() returns a value and can throw checked exceptions; Runnable.run() returns void and cannot',
        'Callable only works with Thread',
        'There is no difference',
      ],
      answer: 1,
      explain: '`Callable<V>` has `V call() throws Exception`; `Runnable` has `void run()`. Use Callable when you need a result through a Future. `execute()` accepts only Runnable, `submit()` accepts both.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `Future` are TRUE? (choose all that apply)',
      options: [
        'get() blocks until the result is ready',
        'get(2, TimeUnit.SECONDS) throws TimeoutException if it takes longer',
        'An exception inside the task is rethrown by get() wrapped in ExecutionException',
        'cancel(true) can interrupt a running task',
        'isDone() blocks the caller',
      ],
      answers: [0, 1, 2, 3],
      explain: 'get() waits (optionally with a timeout), and a task\'s exception surfaces as ExecutionException with the real cause inside. cancel(true) may interrupt the task. `isDone()` just checks and returns immediately.',
    },
  ],
};
