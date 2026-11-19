export default {
  lesson: 'day-14-concurrent-and-immutable-collections',
  minutes: 22,
  intro: 'Use ConcurrentHashMap, CopyOnWriteArrayList and BlockingQueue, and tell immutable collections from unmodifiable views.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Immutable vs unmodifiable: what does this program print?',
      example: { title: 'immutable factory', code: 'List<String> days = List.of("Mon", "Tue"); // cannot change' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("a", "b"));
        List<String> view = Collections.unmodifiableList(base);
        List<String> copy = List.copyOf(base);
        base.add("c");
        System.out.println(view + " " + copy);
        try {
            view.add("x");
        } catch (UnsupportedOperationException e) {
            System.out.println("view is read-only");
        }
        try {
            List<String> bad = List.of("x", null);
        } catch (NullPointerException e) {
            System.out.println("no nulls allowed");
        }
        Map<String, Integer> m = Map.of("pen", 10, "ink", 5);
        System.out.println(m.get("pen") + m.get("ink"));
    }
}`,
      expected: `[a, b, c] [a, b]
view is read-only
no nulls allowed
15`,
      explain: 'An **unmodifiable view** blocks changes through itself but still shows changes made to the backing list ("c" appears). `List.copyOf` and `List.of` create **truly immutable** collections that never change and reject null elements. Map.of works the same way (its iteration order is unspecified, so we only use get()).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Concurrent collections in one thread: what does this program print?',
      example: {
        title: 'atomic update',
        code: `ConcurrentHashMap<String, Integer> hits = new ConcurrentHashMap<>();
hits.merge("home", 1, Integer::sum);`,
      },
      code: `import java.util.*;
import java.util.concurrent.*;

public class Main {
    public static void main(String[] args) throws Exception {
        ConcurrentHashMap<String, Integer> hits = new ConcurrentHashMap<>();
        for (String page : "home,cart,home,home,cart".split(",")) {
            hits.merge(page, 1, Integer::sum);
        }
        System.out.println(hits.get("home") + " " + hits.get("cart"));

        CopyOnWriteArrayList<String> list = new CopyOnWriteArrayList<>(List.of("x", "y"));
        Iterator<String> it = list.iterator();
        list.add("z");
        int n = 0;
        while (it.hasNext()) { it.next(); n++; }
        System.out.println(n + " " + list.size());

        BlockingQueue<String> q = new ArrayBlockingQueue<>(2);
        System.out.println(q.offer("a") + " " + q.offer("b") + " " + q.offer("c"));
        System.out.println(q.poll() + " " + q.remainingCapacity());
    }
}`,
      expected: `3 2
2 3
true true false
a 1`,
      explain: '`merge` is atomic in ConcurrentHashMap, so it is the safe way to count from many threads. A CopyOnWriteArrayList iterator works on a **snapshot**, so it still sees 2 elements after "z" was added. An ArrayBlockingQueue has a fixed capacity: the third `offer` returns false (`put` would block instead), and after one poll there is room for 1.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a thread-safe map for counting page views shared by many threads (best performance):
\`Map<String, Integer> views = ____;\``,
      example: { title: 'a thread-safe read-mostly list', code: 'List<String> listeners = new CopyOnWriteArrayList<>();' },
      accept: ['new ConcurrentHashMap<>()', 'new ConcurrentHashMap<String, Integer>()'],
      acceptRegex: [
        '^new\\s+ConcurrentHashMap\\s*<\\s*>\\s*\\(\\s*\\)\\s*[;{]?$',
        '^new\\s+ConcurrentHashMap\\s*<\\s*String\\s*,\\s*Integer\\s*>\\s*\\(\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '**ConcurrentHashMap** allows concurrent reads and writes without locking the whole map, and offers atomic merge/compute/putIfAbsent. Never use a plain HashMap from several threads: it can lose updates or corrupt itself.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `In a producer-consumer, which BlockingQueue method makes the consumer **wait** until an item is available?
\`String job = queue.____;\``,
      example: { title: 'the producer side', code: 'queue.put(job); // waits if the queue is full' },
      accept: ['take()'],
      acceptRegex: ['^take\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`take()` blocks until an element is available and `put()` blocks while the queue is full, so no manual wait/notify code is needed. `poll()` returns null immediately instead of waiting.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'When is **CopyOnWriteArrayList** a good choice?',
      options: [
        'A list with very frequent writes',
        'A list that is read very often and modified rarely, e.g. event listeners',
        'A large list sorted on every insert',
        'A single-threaded list',
      ],
      answer: 1,
      explain: 'Every write copies the whole array, which is expensive, but reads and iteration need no locking and never throw ConcurrentModificationException. Ideal for read-mostly data like listener lists and configuration.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `List.of(...)` / `Set.of(...)` / `Map.of(...)` (Java 9) are TRUE? (choose all that apply)',
      options: [
        'They are immutable',
        'They allow null elements',
        'Set.of("a", "a") throws IllegalArgumentException',
        'Map.of supports up to 10 key-value pairs (use Map.ofEntries for more)',
        'Their add() method works if you cast them to ArrayList',
      ],
      answers: [0, 2, 3],
      explain: 'The factories create compact immutable collections that reject nulls and, for Set/Map, duplicate elements/keys at creation time. Map.of has overloads for up to 10 pairs. They are not ArrayLists, so a cast fails.',
    },
  ],
};
