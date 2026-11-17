const ex1 = `import java.util.List;
import java.util.TreeMap;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<String, Integer> counts = new ConcurrentHashMap<>();
        List<String> words = List.of("java", "spring", "java", "sql", "java", "spring");

        ExecutorService pool = Executors.newFixedThreadPool(3);
        for (int t = 0; t < 3; t++) {
            pool.submit(() -> {
                for (String w : words) {
                    counts.merge(w, 1, Integer::sum);     // atomic update
                }
            });
        }
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.println(new TreeMap<>(counts));       // sorted for printing
        counts.putIfAbsent("hibernate", 0);
        counts.computeIfPresent("sql", (k, v) -> v * 10);
        System.out.println("sql = " + counts.get("sql") + ", hibernate = " + counts.get("hibernate"));
    }
}`;

const ex2 = `import java.util.Iterator;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> listeners = new CopyOnWriteArrayList<>(List.of("Email", "SMS"));

        for (String l : listeners) {                 // iterates a snapshot
            System.out.println("Notify " + l);
            if (l.equals("Email")) {
                listeners.add("Push");               // no ConcurrentModificationException
            }
        }
        System.out.println("Listeners now: " + listeners);

        Iterator<String> it = listeners.iterator();
        try {
            it.next();
            it.remove();
        } catch (UnsupportedOperationException e) {
            System.out.println("iterator.remove not supported");
        }
    }
}`;

const ex3 = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> days = List.of("Mon", "Tue", "Wed");
        try {
            days.add("Thu");
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of is immutable");
        }
        try {
            List.of("a", null);
        } catch (NullPointerException e) {
            System.out.println("List.of rejects null");
        }
        try {
            Set.of("a", "a");
        } catch (IllegalArgumentException e) {
            System.out.println("Set.of rejects duplicates");
        }

        Map<String, Integer> codes = Map.of("IN", 91, "US", 1);
        System.out.println("IN code: " + codes.get("IN"));
        Map<String, Integer> more = Map.ofEntries(Map.entry("UK", 44), Map.entry("JP", 81));
        System.out.println("JP code: " + more.get("JP"));
        System.out.println("Sorted: " + new TreeMap<>(codes));   // Map.of order is unspecified

        List<Integer> src = new ArrayList<>(List.of(1, 2));
        List<Integer> frozen = List.copyOf(src);
        src.add(3);
        System.out.println("frozen: " + frozen + ", src: " + src);
    }
}`;

const ex4 = `import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> q = new ArrayBlockingQueue<>(2);   // holds max 2 items

        Thread producer = new Thread(() -> {
            try {
                for (int i = 1; i <= 5; i++) {
                    q.put(i);              // waits if queue is full
                }
                q.put(-1);                 // "poison pill" = no more data
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        Thread consumer = new Thread(() -> {
            try {
                int sum = 0;
                while (true) {
                    int x = q.take();      // waits if queue is empty
                    if (x == -1) break;
                    System.out.println("Consumed " + x);
                    sum += x;
                }
                System.out.println("Total = " + sum);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        });

        producer.start();
        consumer.start();
        producer.join();
        consumer.join();
    }
}`;

export default {
  id: 'day-14-concurrent-and-immutable-collections',
  title: 'Concurrent Collections (ConcurrentHashMap, CopyOnWriteArrayList) and Immutable Collections (List.of, Map.of)',
  module: 'Module 3: Sorting, Utilities & Advanced',
  day: 14,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Learn which collections are safe to share between threads (ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue) and how to create truly immutable collections with List.of, Set.of, Map.of and copyOf.',
  objectives: [
    'Explain why normal collections break under multiple threads',
    'Use ConcurrentHashMap atomic methods (merge, compute, putIfAbsent)',
    'Use CopyOnWriteArrayList for read-mostly lists',
    'Use BlockingQueue for producer-consumer problems',
    'Create immutable collections and compare them with unmodifiable views',
  ],
  theory: [
    {
      heading: 'Why special collections for threads?',
      content:
        'ArrayList and HashMap are not thread-safe. If two threads add at the same time, updates can be lost, size can be wrong, and iteration can throw ConcurrentModificationException. It is like two cashiers writing in the same ledger at the same moment - entries overwrite each other. java.util.concurrent provides collections designed for many threads.',
      points: [
        'Synchronized wrappers (Vector, Hashtable, Collections.synchronizedXxx): one lock for everything - safe but slow under load',
        'Concurrent collections: fine-grained locks, CAS, or copy-on-write - safe AND scalable',
        'Even with a thread-safe map, "check then act" (if !containsKey then put) is NOT atomic - use putIfAbsent / computeIfAbsent / merge',
      ],
    },
    {
      heading: 'ConcurrentHashMap',
      content:
        'A thread-safe HashMap. Reads usually take no lock. Writes lock only one bucket (Java 8+), so threads updating different keys do not block each other. It offers atomic compound operations.',
      syntax: `ConcurrentHashMap<String, Integer> m = new ConcurrentHashMap<>();
m.merge(key, 1, Integer::sum);             // atomic counter
m.computeIfAbsent(key, k -> new ArrayList<>());
m.putIfAbsent(key, value);
m.compute(key, (k, v) -> v == null ? 1 : v + 1);`,
      points: [
        'No null keys or values',
        'Weakly consistent iterators: no ConcurrentModificationException',
        'Bulk parallel operations: forEach(parallelismThreshold, ...), reduce, search',
        'ConcurrentSkipListMap / ConcurrentSkipListSet are the sorted, concurrent alternatives to TreeMap / TreeSet',
      ],
    },
    {
      heading: 'CopyOnWriteArrayList and CopyOnWriteArraySet',
      content:
        'Every write (add, set, remove) makes a fresh copy of the internal array, then swaps it in. Readers and iterators keep using the old array, so they never need a lock and never fail. Think of a notice board: to change a notice you print a whole new board and swap it; anyone already reading the old board finishes reading it undisturbed.',
      points: [
        'Excellent when reads vastly outnumber writes (listener lists, configuration, caches)',
        'Terrible for frequent writes - each write is O(n) copy',
        'Iterator works on a snapshot and does not support remove()',
      ],
    },
    {
      heading: 'BlockingQueue and other concurrent queues',
      content:
        'A BlockingQueue makes threads wait: put() waits while the queue is full, take() waits while it is empty. This is the cleanest way to build producer-consumer systems, like a kitchen counter between a chef (producer) and a waiter (consumer).',
      points: [
        'ArrayBlockingQueue (bounded, array), LinkedBlockingQueue (optionally bounded), PriorityBlockingQueue, DelayQueue, SynchronousQueue',
        'ConcurrentLinkedQueue / ConcurrentLinkedDeque: non-blocking, lock-free queues',
        'Thread pools (ExecutorService) use BlockingQueues internally',
      ],
    },
    {
      heading: 'Immutable collections (Java 9+)',
      content:
        'List.of, Set.of and Map.of create collections that can never change - no add, remove, set or put. Immutable objects are automatically thread-safe and are perfect for constants and method return values.',
      syntax: `List<String> l = List.of("a", "b");
Set<Integer> s = Set.of(1, 2, 3);
Map<String, Integer> m = Map.of("a", 1, "b", 2);           // up to 10 pairs
Map<String, Integer> m2 = Map.ofEntries(Map.entry("a", 1)); // any number
List<String> copy = List.copyOf(someList);                 // Java 10
List<String> fromStream = stream.toList();                 // Java 16 (unmodifiable)`,
      points: [
        'Any modification throws UnsupportedOperationException',
        'null elements/keys/values are rejected with NullPointerException (even contains(null) on List.of throws NPE)',
        'Set.of / Map.of with duplicate elements/keys throw IllegalArgumentException',
        'Set.of and Map.of iteration order is unspecified and can change between JVM runs',
      ],
    },
    {
      heading: 'Unmodifiable view vs immutable collection',
      content:
        'Collections.unmodifiableList(list) is a read-only window over a list that someone else can still change. List.copyOf(list) and List.of(...) are truly immutable snapshots. Arrays.asList is neither: it is fixed-size but set() works.',
      tip: 'Interview line: "unmodifiable = I cannot change it through this reference; immutable = nobody can change it at all."',
    },
  ],
  examples: [
    {
      title: 'Counting words from three threads with ConcurrentHashMap',
      scenario: 'Three worker threads count the same word list into one shared map. Atomic merge guarantees correct totals.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶ several times - the totals never change'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `{java=9, spring=6, sql=3}
sql = 30, hibernate = 0`,
      explanation:
        'Each of the 3 tasks counts java 3 times, spring 2 times and sql once, so totals are 9, 6 and 3. awaitTermination waits until all tasks finish. The map is copied into a TreeMap only to print in sorted order. computeIfPresent multiplies sql by 10.',
    },
    {
      title: 'CopyOnWriteArrayList: modify while iterating',
      scenario: 'An event system notifies listeners; a listener registers a new one during notification.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Notify Email
Notify SMS
Listeners now: [Email, SMS, Push]
iterator.remove not supported`,
      explanation:
        'The loop iterates the snapshot taken at the start ([Email, SMS]), so "Push" is added to the list but not visited in this loop. With ArrayList this would throw ConcurrentModificationException. Snapshot iterators do not support remove().',
    },
    {
      title: 'Immutable collections with List.of, Set.of, Map.of and copyOf',
      scenario: 'Define constant data (week days, country codes) that nobody can change.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `List.of is immutable
List.of rejects null
Set.of rejects duplicates
IN code: 91
JP code: 81
Sorted: {IN=91, US=1}
frozen: [1, 2], src: [1, 2, 3]`,
      explanation:
        'Each forbidden operation throws a specific exception. We never print Map.of directly because its iteration order is deliberately randomized between JVM runs; copying into a TreeMap gives a stable order. List.copyOf is a snapshot, so adding 3 to src does not affect frozen.',
    },
    {
      title: 'Producer-consumer with BlockingQueue',
      scenario: 'A producer thread creates order numbers 1 to 5; a consumer thread processes them. The queue holds at most 2 orders at a time.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Consumed 1
Consumed 2
Consumed 3
Consumed 4
Consumed 5
Total = 15`,
      explanation:
        'put() blocks when 2 items are waiting; take() blocks when the queue is empty, so no busy-waiting or manual wait/notify is needed. Only the consumer prints, and the queue is FIFO, so the output order is always the same. -1 is a poison pill that tells the consumer to stop.',
    },
  ],
  interview: [
    { q: 'What are concurrent collections? Name some.', a: 'Thread-safe collections in java.util.concurrent designed for high concurrency: ConcurrentHashMap, ConcurrentSkipListMap/Set, CopyOnWriteArrayList/Set, ConcurrentLinkedQueue/Deque, and BlockingQueues (ArrayBlockingQueue, LinkedBlockingQueue, PriorityBlockingQueue).', level: 'Easy' },
    { q: 'Synchronized collections vs concurrent collections?', a: 'Synchronized collections lock the whole object for each operation (one thread at a time) and their iterators are fail-fast. Concurrent collections use fine-grained locking/CAS/copy-on-write, allow concurrent access and have weakly consistent or snapshot iterators.', level: 'Medium' },
    { q: 'When should you use CopyOnWriteArrayList?', a: 'When reads/iterations are far more frequent than writes, e.g., listener lists. Each write copies the whole array, so write-heavy use is expensive.', level: 'Medium' },
    { q: 'Is if (!map.containsKey(k)) map.put(k, v); safe on a ConcurrentHashMap?', a: 'No. Each call is thread-safe, but the combination is not atomic; another thread can insert between them. Use putIfAbsent or computeIfAbsent.', level: 'Hard' },
    { q: 'What is the difference between List.of() and Collections.unmodifiableList()?', a: 'List.of creates a truly immutable list that rejects nulls. unmodifiableList is a read-only view over a mutable list; changes to the backing list show through and it allows nulls.', level: 'Medium' },
    { q: 'Output? List<String> l = List.of("a"); System.out.println(l.contains(null));', a: 'It throws NullPointerException. Immutable List.of collections reject null even in contains().', level: 'Hard' },
    { q: 'What happens with Set.of("a", "a")?', a: 'IllegalArgumentException: duplicate element. Map.of with duplicate keys also throws IllegalArgumentException.', level: 'Medium' },
    { q: 'What is a BlockingQueue used for?', a: 'Producer-consumer coordination. put() blocks when full, take() blocks when empty; offer/poll have timeout versions. Executors use them for task queues.', level: 'Medium' },
    { q: 'Why is the iteration order of Map.of not predictable?', a: 'The JDK deliberately uses a per-JVM random salt for immutable Set/Map ordering so that code does not accidentally depend on order.', level: 'Hard' },
    { q: 'How do you make a TreeMap thread-safe and still sorted?', a: 'Use ConcurrentSkipListMap (lock-free, sorted), or Collections.synchronizedSortedMap(new TreeMap<>()) for simple cases.', level: 'Medium' },
    { q: 'Is Stream.toList() modifiable?', a: 'No. Since Java 16 stream.toList() returns an unmodifiable list. Collectors.toList() returns a (currently) mutable ArrayList but makes no guarantee.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Use a ConcurrentHashMap to count words by their first letter from two threads (both threads process the same list), then print the counts sorted by letter.',
      hint: 'Use a ConcurrentHashMap<Character, Integer> with merge for counts; join both threads; print new TreeMap<>(map).',
      solution: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        ConcurrentHashMap<Character, Integer> m = new ConcurrentHashMap<>();
        List<String> words = List.of("apple", "avocado", "banana", "cherry");
        Runnable r = () -> words.forEach(w -> m.merge(w.charAt(0), 1, Integer::sum));
        Thread t1 = new Thread(r), t2 = new Thread(r);
        t1.start(); t2.start(); t1.join(); t2.join();
        System.out.println(new TreeMap<>(m)); // {a=4, b=2, c=2}
    }
}`,
    },
    {
      task: 'Create a class Config with an immutable List<String> of allowed roles using List.of, and a getter. Show that adding to it fails.',
      hint: 'private static final List<String> ROLES = List.of("ADMIN", "USER");',
      solution: `import java.util.*;

class Config {
    private static final List<String> ROLES = List.of("ADMIN", "USER");
    static List<String> roles() { return ROLES; }
}

public class Main {
    public static void main(String[] args) {
        try {
            Config.roles().add("HACKER");
        } catch (UnsupportedOperationException e) {
            System.out.println("Roles are immutable: " + Config.roles());
        }
    }
}`,
    },
    {
      task: 'Rewrite the producer-consumer example with two consumers. Use two poison pills and print only the final combined total.',
      hint: 'Use an AtomicInteger total; producer puts -1 twice.',
      solution: `import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        BlockingQueue<Integer> q = new LinkedBlockingQueue<>();
        AtomicInteger total = new AtomicInteger();
        Runnable consumer = () -> {
            try {
                while (true) {
                    int x = q.take();
                    if (x == -1) break;
                    total.addAndGet(x);
                }
            } catch (InterruptedException e) { Thread.currentThread().interrupt(); }
        };
        Thread c1 = new Thread(consumer), c2 = new Thread(consumer);
        c1.start(); c2.start();
        for (int i = 1; i <= 10; i++) q.put(i);
        q.put(-1); q.put(-1);
        c1.join(); c2.join();
        System.out.println("Total = " + total.get()); // Total = 55
    }
}`,
    },
    {
      task: 'Demonstrate the difference between Collections.unmodifiableList and List.copyOf with the same source list.',
      hint: 'Add to the source after creating both, then print both.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> src = new ArrayList<>(List.of("x"));
        List<String> view = Collections.unmodifiableList(src);
        List<String> copy = List.copyOf(src);
        src.add("y");
        System.out.println(view); // [x, y]
        System.out.println(copy); // [x]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which collection makes a fresh array copy on every write?', options: ['ConcurrentHashMap', 'CopyOnWriteArrayList', 'Vector', 'ArrayBlockingQueue'], answer: 1, explanation: 'That is the copy-on-write strategy.' },
    { question: 'List.of("a", null) throws:', options: ['NullPointerException', 'IllegalArgumentException', 'UnsupportedOperationException', 'Nothing'], answer: 0, explanation: 'Immutable factory collections reject null.' },
    { question: 'Map.of("k", 1, "k", 2) throws:', options: ['NullPointerException', 'ClassCastException', 'IllegalArgumentException', 'Nothing - keeps 2'], answer: 2, explanation: 'Duplicate keys are rejected.' },
    { question: 'BlockingQueue.take() on an empty queue:', options: ['Returns null', 'Throws NoSuchElementException', 'Returns -1', 'Waits until an element is available'], answer: 3, explanation: 'take() blocks the calling thread.' },
    { question: 'Thread-safe sorted map alternative to TreeMap:', options: ['Hashtable', 'LinkedHashMap', 'ConcurrentSkipListMap', 'WeakHashMap'], answer: 2, explanation: 'ConcurrentSkipListMap is sorted and concurrent.' },
  ],
};
