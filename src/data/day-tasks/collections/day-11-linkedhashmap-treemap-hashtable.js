export default {
  lesson: 'day-11-linkedhashmap-treemap-hashtable',
  minutes: 22,
  intro: 'Use LinkedHashMap (insertion/access order, LRU cache), TreeMap navigation, and compare HashMap, Hashtable and ConcurrentHashMap.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'LRU cache with LinkedHashMap: what does this program print?',
      example: { title: 'access order', code: 'new LinkedHashMap<>(16, 0.75f, true); // get() moves the entry to the end' },
      code: `import java.util.*;

class LruCache<K, V> extends LinkedHashMap<K, V> {
    private final int capacity;
    LruCache(int capacity) {
        super(16, 0.75f, true);
        this.capacity = capacity;
    }
    @Override
    protected boolean removeEldestEntry(Map.Entry<K, V> eldest) {
        return size() > capacity;
    }
}

public class Main {
    public static void main(String[] args) {
        LruCache<String, Integer> cache = new LruCache<>(3);
        cache.put("A", 1);
        cache.put("B", 2);
        cache.put("C", 3);
        cache.get("A");
        cache.put("D", 4);
        System.out.println(cache);
        System.out.println(cache.containsKey("B"));

        Map<String, Integer> plain = new LinkedHashMap<>();
        plain.put("x", 1);
        plain.put("y", 2);
        plain.put("x", 9);
        System.out.println(plain);
    }
}`,
      expected: `{C=3, A=1, D=4}
false
{x=9, y=2}`,
      explain: 'With accessOrder = true, `get("A")` moves A to the end (most recently used), giving B, C, A. Adding D makes the size 4, so `removeEldestEntry` evicts the least recently used B. In a normal (insertion-order) LinkedHashMap, re-putting an existing key updates the value **without changing its position**.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'TreeMap navigation for grade slabs: what does this program print?',
      example: { title: 'floorEntry', code: 'slabs.floorEntry(72) // greatest key ≤ 72' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeMap<Integer, String> slab = new TreeMap<>();
        slab.put(90, "A");
        slab.put(0, "F");
        slab.put(60, "C");
        slab.put(75, "B");
        slab.put(40, "D");
        System.out.println(slab);
        System.out.println(slab.floorEntry(72).getValue());
        System.out.println(slab.floorKey(39) + " " + slab.ceilingKey(76));
        System.out.println(slab.headMap(60) + " " + slab.tailMap(75));
        System.out.println(slab.firstEntry() + " " + slab.descendingMap().firstKey());
    }
}`,
      expected: `{0=F, 40=D, 60=C, 75=B, 90=A}
C
0 90
{0=F, 40=D} {75=B, 90=A}
0=F 90`,
      explain: 'A TreeMap keeps keys **sorted**. `floorEntry(72)` finds the greatest key ≤ 72 (60 → "C"), which is perfect for slabs. `floorKey(39)` = 0, `ceilingKey(76)` = 90. `headMap(60)` excludes 60, `tailMap(75)` includes 75. A Map.Entry prints as key=value.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a LinkedHashMap in **access order** (needed for an LRU cache):
\`Map<String, Integer> m = ____;\``,
      example: { title: 'default insertion order', code: 'Map<String, Integer> m = new LinkedHashMap<>();' },
      accept: ['new LinkedHashMap<>(16, 0.75f, true)', 'new LinkedHashMap<String, Integer>(16, 0.75f, true)'],
      acceptRegex: [
        '^new\\s+LinkedHashMap\\s*<\\s*>\\s*\\(\\s*16\\s*,\\s*0\\s*\\.\\s*75f\\s*,\\s*true\\s*\\)\\s*[;{]?$',
        '^new\\s+LinkedHashMap\\s*<\\s*String\\s*,\\s*Integer\\s*>\\s*\\(\\s*16\\s*,\\s*0\\s*\\.\\s*75f\\s*,\\s*true\\s*\\)\\s*[;{]?$',
        '^new\\s+LinkedHashMap\\s*<[^>]*>\\s*\\(\\s*\\d+\\s*,\\s*0?\\.\\d+[fF]\\s*,\\s*true\\s*\\)$',
      ],
      caseSensitive: true,
      explain: 'The 3-argument constructor `(initialCapacity, loadFactor, accessOrder)` with `true` orders entries from least to most recently accessed. Combine it with `removeEldestEntry` to evict the oldest entry automatically.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which TreeMap method returns the entry with the **smallest key strictly greater** than a given key?
\`Map.Entry<Integer, String> next = map.____(75);\``,
      example: { title: 'the opposite', code: 'map.lowerEntry(75); // greatest key strictly less than 75' },
      accept: ['higherEntry'],
      acceptRegex: ['^higherEntry\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Strict: `lowerEntry`/`higherEntry`. Inclusive: `floorEntry` (≤) / `ceilingEntry` (≥). The `...Key` versions return only the key.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which Map allows **neither null keys nor null values**?',
      options: ['HashMap', 'LinkedHashMap', 'Hashtable (and ConcurrentHashMap)', 'TreeMap with a null-friendly comparator'],
      answer: 2,
      explain: 'Hashtable and ConcurrentHashMap reject both null keys and null values (in ConcurrentHashMap, null would be ambiguous: "absent" or "mapped to null"?). HashMap and LinkedHashMap allow one null key and null values.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Many threads read and update a shared cache. Which is the best choice?',
      options: ['HashMap', 'Hashtable', 'ConcurrentHashMap', 'TreeMap'],
      answer: 2,
      explain: '**ConcurrentHashMap** locks at a fine-grained (bucket/CAS) level, so reads never block and writes to different buckets run in parallel. Hashtable and Collections.synchronizedMap lock the whole map for every call, and HashMap is not thread-safe at all.',
    },
  ],
};
