const ex1 = `import java.util.LinkedHashMap;
import java.util.Map;
import java.util.TreeMap;

class LRUCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;

    LRUCache(int capacity) {
        super(16, 0.75f, true);          // true = access order
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;        // evict least recently used
    }
}

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> linked = new LinkedHashMap<>();
        Map<String, Integer> tree = new TreeMap<>();
        String[] fruits = {"banana", "apple", "cherry"};
        for (int i = 0; i < fruits.length; i++) {
            linked.put(fruits[i], i + 1);
            tree.put(fruits[i], i + 1);
        }
        System.out.println("LinkedHashMap: " + linked);
        System.out.println("TreeMap: " + tree);

        linked.put("banana", 100);       // update keeps position
        System.out.println("After update: " + linked);

        LRUCache<Integer, String> cache = new LRUCache<>(3);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        cache.get(1);                    // 1 becomes most recently used
        cache.put(4, "D");               // evicts 2
        System.out.println("LRU cache: " + cache);
    }
}`;

const ex2 = `import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, String> grades = new TreeMap<>();
        grades.put(90, "A");
        grades.put(75, "B");
        grades.put(60, "C");
        grades.put(40, "D");
        grades.put(0, "F");

        int[] scores = {95, 75, 68, 12};
        for (int s : scores) {
            System.out.println(s + " -> " + grades.floorEntry(s).getValue());
        }

        System.out.println(grades);
        System.out.println("firstKey: " + grades.firstKey() + ", lastKey: " + grades.lastKey());
        System.out.println("headMap(60): " + grades.headMap(60));
        System.out.println("tailMap(60): " + grades.tailMap(60));
        System.out.println("ceilingKey(61): " + grades.ceilingKey(61));
        System.out.println("descendingMap: " + grades.descendingMap());
    }
}`;

const ex3 = `import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> hm = new HashMap<>();
        hm.put(null, 1);
        hm.put("a", null);
        System.out.println("HashMap null key/value OK, size " + hm.size());

        Map<String, Integer> ht = new Hashtable<>();
        try {
            ht.put(null, 1);
        } catch (NullPointerException e) {
            System.out.println("Hashtable null key -> NullPointerException");
        }
        try {
            ht.put("a", null);
        } catch (NullPointerException e) {
            System.out.println("Hashtable null value -> NullPointerException");
        }

        Map<String, Integer> chm = new ConcurrentHashMap<>();
        try {
            chm.put("a", null);
        } catch (NullPointerException e) {
            System.out.println("ConcurrentHashMap null value -> NullPointerException");
        }

        Map<String, Integer> tm = new TreeMap<>();
        try {
            tm.put(null, 1);
        } catch (NullPointerException e) {
            System.out.println("TreeMap null key -> NullPointerException");
        }
        tm.put("a", null);
        System.out.println("TreeMap null value OK: " + tm);
    }
}`;

const ex4 = `import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

public class Main {
    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> hits = new ConcurrentHashMap<>();

        Runnable task = () -> {
            for (int i = 0; i < 1000; i++) {
                hits.merge("home", 1, Integer::sum);   // atomic in ConcurrentHashMap
            }
        };

        Thread t1 = new Thread(task);
        Thread t2 = new Thread(task);
        t1.start();
        t2.start();
        t1.join();
        t2.join();

        System.out.println("home hits: " + hits.get("home"));
    }
}`;

export default {
  id: 'day-11-linkedhashmap-treemap-hashtable',
  title: 'LinkedHashMap, TreeMap, Hashtable, HashMap vs Hashtable vs ConcurrentHashMap',
  module: 'Module 2: Sets, Queues & Maps',
  day: 11,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Explore the other Map implementations: LinkedHashMap for ordered maps and LRU caches, TreeMap for sorted keys and range queries, the legacy Hashtable, and the thread-safe ConcurrentHashMap - and compare them all.',
  objectives: [
    'Use LinkedHashMap with insertion order and access order',
    'Build an LRU cache with removeEldestEntry',
    'Use TreeMap navigation methods: floorEntry, ceilingKey, headMap, tailMap, descendingMap',
    'Explain null handling and thread safety differences across Map implementations',
    'Compare HashMap, Hashtable and ConcurrentHashMap',
  ],
  theory: [
    {
      heading: 'LinkedHashMap',
      content:
        'LinkedHashMap is a HashMap plus a doubly linked list running through all entries, so it remembers order. By default it is insertion order - like a guest book. With the constructor flag accessOrder = true, every get() or put() moves that entry to the end, so the first entry is always the least recently used - perfect for an LRU cache.',
      syntax: `new LinkedHashMap<>()                    // insertion order
new LinkedHashMap<>(16, 0.75f, true)     // access order
protected boolean removeEldestEntry(Map.Entry<K,V> eldest)  // return true to evict`,
      points: [
        'Same O(1) operations as HashMap, slightly more memory',
        'Re-putting an existing key does not change insertion order',
        'Allows one null key and many null values',
      ],
    },
    {
      heading: 'TreeMap',
      content:
        'TreeMap keeps keys sorted using a red-black tree (natural order or a Comparator). It implements NavigableMap, so it is great for range lookups - like a price slab table or grading table where you need "the highest slab not above my score".',
      syntax: `firstKey() lastKey() firstEntry() lastEntry() pollFirstEntry()
floorKey/floorEntry(k)   ceilingKey/ceilingEntry(k)
lowerKey(k) higherKey(k)
headMap(to) tailMap(from) subMap(from, to) descendingMap()`,
      points: [
        'put/get/remove: O(log n)',
        'null key NOT allowed (natural ordering); null values allowed',
        'Keys must be Comparable or a Comparator must be supplied',
      ],
    },
    {
      heading: 'Hashtable (legacy)',
      content:
        'Hashtable is the Java 1.0 version of a hash map. All its methods are synchronized, so only one thread at a time can use the whole table - like a library with a single entry door. It does not allow null keys or null values. It extends the obsolete Dictionary class. In new code use HashMap (single thread) or ConcurrentHashMap (multi-thread).',
    },
    {
      heading: 'ConcurrentHashMap',
      content:
        'ConcurrentHashMap is the modern thread-safe map. Instead of locking the whole map, Java 8+ uses CAS (compare-and-swap) for empty buckets and locks only the single bucket being changed (synchronized on the first node). Reads are mostly lock-free. Many threads can read and write different buckets at the same time - like a bank with many counters instead of one. Java 7 used 16 "segments" (segment locking).',
      points: [
        'No null keys or values (null would be ambiguous in concurrent get())',
        'Iterators are weakly consistent: never throw ConcurrentModificationException',
        'Atomic compound methods: putIfAbsent, computeIfAbsent, merge, compute, replace',
        'size() is an estimate under concurrent updates; mappingCount() returns long',
      ],
    },
    {
      heading: 'Comparison table in words',
      content: 'Memorize this table for interviews.',
      points: [
        'Order: HashMap none | LinkedHashMap insertion/access | TreeMap sorted | Hashtable none | ConcurrentHashMap none',
        'null key: HashMap 1 | LinkedHashMap 1 | TreeMap no | Hashtable no | ConcurrentHashMap no',
        'null values: HashMap yes | LinkedHashMap yes | TreeMap yes | Hashtable no | ConcurrentHashMap no',
        'Thread-safe: only Hashtable (whole-map lock) and ConcurrentHashMap (fine-grained)',
        'Speed: HashMap/LinkedHashMap O(1) | TreeMap O(log n) | Hashtable slow under contention | ConcurrentHashMap scales well',
        'Iterator: fail-fast for HashMap/LinkedHashMap/TreeMap/Hashtable; weakly consistent for ConcurrentHashMap (Hashtable\'s Enumeration is not fail-fast)',
      ],
    },
    {
      heading: 'Collections.synchronizedMap vs ConcurrentHashMap',
      content:
        'Collections.synchronizedMap(new HashMap<>()) wraps every method in a single lock, like Hashtable, and you must manually synchronize while iterating. ConcurrentHashMap gives better throughput and safe iteration. Prefer ConcurrentHashMap.',
    },
  ],
  examples: [
    {
      title: 'LinkedHashMap order and an LRU cache',
      scenario: 'Compare insertion order with sorted order, then build a 3-item Least Recently Used cache.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code (LRUCache and Main in one file)', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `LinkedHashMap: {banana=1, apple=2, cherry=3}
TreeMap: {apple=2, banana=1, cherry=3}
After update: {banana=100, apple=2, cherry=3}
LRU cache: {3=C, 1=A, 4=D}`,
      explanation:
        'LinkedHashMap keeps insertion order; TreeMap sorts keys. Updating banana keeps its first position. In the cache, get(1) moves 1 to the end (order 2, 3, 1); adding 4 makes size 4 > 3 so the eldest (2) is removed.',
    },
    {
      title: 'Grading with TreeMap floorEntry',
      scenario: 'Convert scores into grades: 90+ A, 75+ B, 60+ C, 40+ D, else F.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `95 -> A
75 -> B
68 -> C
12 -> F
{0=F, 40=D, 60=C, 75=B, 90=A}
firstKey: 0, lastKey: 90
headMap(60): {0=F, 40=D}
tailMap(60): {60=C, 75=B, 90=A}
ceilingKey(61): 75
descendingMap: {90=A, 75=B, 60=C, 40=D, 0=F}`,
      explanation:
        'floorEntry(68) finds the greatest key <= 68, which is 60 -> C. This replaces a long if-else ladder. headMap excludes 60, tailMap includes it.',
    },
    {
      title: 'Null handling across Map implementations',
      scenario: 'Try storing null keys and values in different maps to see which ones refuse.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `HashMap null key/value OK, size 2
Hashtable null key -> NullPointerException
Hashtable null value -> NullPointerException
ConcurrentHashMap null value -> NullPointerException
TreeMap null key -> NullPointerException
TreeMap null value OK: {a=null}`,
      explanation:
        'HashMap accepts one null key and null values. Hashtable and ConcurrentHashMap reject both null keys and values. TreeMap rejects a null key (it must compare it) but accepts null values.',
    },
    {
      title: 'Thread-safe counting with ConcurrentHashMap',
      scenario: 'Two threads count page hits at the same time. ConcurrentHashMap.merge is atomic, so no update is lost.',
      steps: ['Create class Main', 'Type the code', 'Run ▶ several times - the answer is always the same'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `home hits: 2000`,
      explanation:
        'Each thread adds 1 a thousand times. join() waits for both to finish. Because merge() is atomic in ConcurrentHashMap, the total is always 2000. With a plain HashMap and get/put the result could be less than 2000 (lost updates) or the map could even get corrupted.',
    },
  ],
  interview: [
    { q: 'Difference between HashMap and Hashtable?', a: 'HashMap is unsynchronized, allows one null key and null values, fail-fast iterator, faster, Java 1.2. Hashtable is synchronized (whole object lock), no null keys/values, legacy (extends Dictionary), Enumeration support, slower.', level: 'Easy' },
    { q: 'HashMap vs ConcurrentHashMap?', a: 'HashMap is not thread-safe and allows null. ConcurrentHashMap is thread-safe with CAS and per-bucket locking, lock-free reads, weakly consistent iterators, atomic compute/merge methods, and does not allow null keys/values.', level: 'Medium' },
    { q: 'Why does ConcurrentHashMap not allow null?', a: 'In a concurrent setting get(k) returning null would be ambiguous: is the key absent or mapped to null? You cannot safely check containsKey afterwards because another thread may change the map in between.', level: 'Hard' },
    { q: 'How does ConcurrentHashMap achieve thread safety in Java 8?', a: 'CAS operations to insert into empty buckets, synchronized on the bucket\'s first node for updates, volatile reads for get, and cooperative resizing. Java 7 used segment locks (16 segments by default).', level: 'Hard' },
    { q: 'How do you implement an LRU cache in Java?', a: 'Extend LinkedHashMap with accessOrder = true and override removeEldestEntry to return size() > capacity.', level: 'Medium' },
    { q: 'What is the output? Map<String,Integer> m = new LinkedHashMap<>(); m.put("x",1); m.put("y",2); m.put("x",3); System.out.println(m);', a: '{x=3, y=2}. Updating x keeps its original position.', level: 'Medium' },
    { q: 'Can TreeMap have a null key?', a: 'Not with natural ordering - put(null, v) throws NullPointerException. Null values are fine.', level: 'Easy' },
    { q: 'When would you use TreeMap?', a: 'When keys must be sorted or you need range queries such as floorKey, ceilingKey, headMap, tailMap (slabs, leaderboards, time-series).', level: 'Easy' },
    { q: 'Difference between synchronizedMap and ConcurrentHashMap?', a: 'synchronizedMap locks the entire map for every operation and requires manual locking during iteration. ConcurrentHashMap uses fine-grained locking, allows concurrent reads/writes and safe iteration.', level: 'Medium' },
    { q: 'Time complexity of TreeMap get/put?', a: 'O(log n) because it is a balanced red-black tree.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Create a LinkedHashMap of 4 country -> capital pairs and print them in insertion order using forEach.',
      hint: 'map.forEach((k, v) -> System.out.println(k + " : " + v));',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, String> m = new LinkedHashMap<>();
        m.put("India", "New Delhi");
        m.put("Japan", "Tokyo");
        m.put("France", "Paris");
        m.put("Brazil", "Brasilia");
        m.forEach((k, v) -> System.out.println(k + " : " + v));
    }
}`,
    },
    {
      task: 'Income tax slabs: 0 -> 0%, 300000 -> 5%, 700000 -> 10%, 1000000 -> 15%. Use TreeMap.floorEntry to print the slab rate for incomes 250000, 800000 and 1500000.',
      hint: 'TreeMap<Integer, Integer> slabs; slabs.floorEntry(income).getValue().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, Integer> slabs = new TreeMap<>();
        slabs.put(0, 0);
        slabs.put(300000, 5);
        slabs.put(700000, 10);
        slabs.put(1000000, 15);
        for (int income : new int[]{250000, 800000, 1500000})
            System.out.println(income + " -> " + slabs.floorEntry(income).getValue() + "%");
        // 250000 -> 0%, 800000 -> 10%, 1500000 -> 15%
    }
}`,
    },
    {
      task: 'Modify the LRU cache to capacity 2. Put A, B, get A, put C. Which key is evicted?',
      hint: 'Access order after get(A) is B, A.',
      solution: `import java.util.*;

class LRU<K, V> extends LinkedHashMap<K, V> {
    private final int cap;
    LRU(int cap) { super(16, 0.75f, true); this.cap = cap; }
    @Override protected boolean removeEldestEntry(Map.Entry<K, V> e) { return size() > cap; }
}

public class Main {
    public static void main(String[] args) {
        LRU<String, Integer> c = new LRU<>(2);
        c.put("A", 1);
        c.put("B", 2);
        c.get("A");
        c.put("C", 3);
        System.out.println(c); // {A=1, C=3}  -> B was evicted
    }
}`,
    },
    {
      task: 'Use a TreeMap with Comparator.reverseOrder() to print a leaderboard of score -> player from highest to lowest.',
      hint: 'new TreeMap<Integer, String>(Comparator.reverseOrder()).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Integer, String> board = new TreeMap<>(Comparator.reverseOrder());
        board.put(450, "Asha");
        board.put(980, "Ravi");
        board.put(720, "Neel");
        System.out.println(board); // {980=Ravi, 720=Neel, 450=Asha}
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which Map allows null keys?', options: ['Hashtable', 'ConcurrentHashMap', 'TreeMap (natural order)', 'HashMap'], answer: 3, explanation: 'HashMap and LinkedHashMap allow one null key.' },
    { question: 'LinkedHashMap with accessOrder = true is commonly used to build:', options: ['A priority queue', 'An LRU cache', 'A stack', 'A sorted set'], answer: 1, explanation: 'Access order + removeEldestEntry gives LRU eviction.' },
    { question: 'TreeMap {10=a, 20=b, 30=c}: floorKey(25) returns', options: ['20', '30', '25', 'null'], answer: 0, explanation: 'Greatest key <= 25 is 20.' },
    { question: 'Which map\'s iterator never throws ConcurrentModificationException?', options: ['HashMap', 'TreeMap', 'ConcurrentHashMap', 'LinkedHashMap'], answer: 2, explanation: 'ConcurrentHashMap iterators are weakly consistent.' },
    { question: 'Hashtable is synchronized by:', options: ['Locking each bucket', 'Using CAS only', 'It is not synchronized', 'Synchronizing every method on the whole table'], answer: 3, explanation: 'All public methods are synchronized on the Hashtable object.' },
  ],
};
