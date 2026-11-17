const ex1 = `public class Main {
    // Same formula HashMap uses (Java 8+)
    static int bucket(Object key, int capacity) {
        int h = key.hashCode();
        int hash = h ^ (h >>> 16);          // spread high bits into low bits
        return (capacity - 1) & hash;       // fast modulo for power-of-two sizes
    }

    public static void main(String[] args) {
        Object[] keys = {"Aa", "BB", "Java", "ab", 17, 33};
        for (Object k : keys) {
            System.out.println(k + " hashCode=" + k.hashCode() + " bucket=" + bucket(k, 16));
        }
    }
}`;

const ex2 = `import java.util.HashMap;
import java.util.Map;

class BadKey {                    // equals WITHOUT hashCode
    int id;
    BadKey(int id) { this.id = id; }

    @Override
    public boolean equals(Object o) {
        return o instanceof BadKey && ((BadKey) o).id == id;
    }
}

class GoodKey {                   // equals AND hashCode
    int id;
    GoodKey(int id) { this.id = id; }

    @Override
    public boolean equals(Object o) {
        return o instanceof GoodKey && ((GoodKey) o).id == id;
    }

    @Override
    public int hashCode() {
        return Integer.hashCode(id);
    }
}

public class Main {
    public static void main(String[] args) {
        Map<BadKey, String> m1 = new HashMap<>();
        m1.put(new BadKey(1), "one");
        System.out.println("BadKey lookup: " + m1.get(new BadKey(1)));

        Map<GoodKey, String> m2 = new HashMap<>();
        m2.put(new GoodKey(1), "one");
        System.out.println("GoodKey lookup: " + m2.get(new GoodKey(1)));

        // Mutating a key after insertion
        Map<GoodKey, String> m3 = new HashMap<>();
        GoodKey k = new GoodKey(5);
        m3.put(k, "five");
        k.id = 6;                                   // never do this!
        System.out.println("After mutating key: " + m3.get(k));
        System.out.println("Lookup with id 5: " + m3.get(new GoodKey(5)));
        System.out.println("Map size still: " + m3.size());
    }
}`;

const ex3 = `public class Main {
    static int tableSizeFor(int c) {      // next power of two >= c
        int n = 1;
        while (n < c) n <<= 1;
        return n;
    }

    public static void main(String[] args) {
        // 1. When does a default HashMap resize?
        int capacity = 16;
        float loadFactor = 0.75f;
        int threshold = (int) (capacity * loadFactor);
        for (int size = 1; size <= 100; size++) {
            if (size > threshold) {
                capacity *= 2;
                threshold = (int) (capacity * loadFactor);
                System.out.println("Resize at size " + size + " -> capacity " + capacity + ", threshold " + threshold);
            }
        }

        // 2. new HashMap<>(n) rounds n up to a power of two
        for (int c : new int[]{10, 16, 17, 100}) {
            System.out.println("new HashMap<>(" + c + ") -> capacity " + tableSizeFor(c));
        }

        // 3. Rehashing: an entry stays at index i or moves to i + oldCapacity
        for (int key : new int[]{1, 17, 33, 49}) {
            System.out.println("key " + key + ": bucket " + (key & 15) + " in 16, bucket " + (key & 31) + " in 32");
        }
    }
}`;

const ex4 = `import java.util.Objects;

class MyHashMap<K, V> {
    static class Node<K, V> {
        final K key;
        V value;
        Node<K, V> next;
        Node(K key, V value) { this.key = key; this.value = value; }
    }

    @SuppressWarnings("unchecked")
    private Node<K, V>[] table = (Node<K, V>[]) new Node[8];
    private int size;

    private int index(K key) {
        return key == null ? 0 : (key.hashCode() & 0x7fffffff) % table.length;
    }

    public V put(K key, V value) {
        int i = index(key);
        Node<K, V> n = table[i];
        if (n == null) {
            table[i] = new Node<>(key, value);
            size++;
            return null;
        }
        while (true) {
            if (Objects.equals(n.key, key)) {     // same key -> replace
                V old = n.value;
                n.value = value;
                return old;
            }
            if (n.next == null) break;
            n = n.next;
        }
        n.next = new Node<>(key, value);          // collision -> append to chain
        size++;
        return null;
    }

    public V get(K key) {
        for (Node<K, V> n = table[index(key)]; n != null; n = n.next) {
            if (Objects.equals(n.key, key)) return n.value;
        }
        return null;
    }

    public int size() { return size; }

    public void printBuckets() {
        for (int i = 0; i < table.length; i++) {
            if (table[i] == null) continue;
            StringBuilder sb = new StringBuilder("bucket " + i + ": ");
            for (Node<K, V> n = table[i]; n != null; n = n.next) {
                sb.append(n.key).append("=").append(n.value);
                if (n.next != null) sb.append(" -> ");
            }
            System.out.println(sb);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        MyHashMap<Integer, String> map = new MyHashMap<>();
        map.put(1, "one");
        map.put(9, "nine");
        map.put(17, "seventeen");
        map.put(4, "four");
        System.out.println("Old value: " + map.put(9, "NINE"));
        System.out.println("get(17): " + map.get(17));
        System.out.println("get(25): " + map.get(25));
        System.out.println("size: " + map.size());
        map.printBuckets();
    }
}`;

export default {
  id: 'day-10-hashmap-internal-working',
  title: 'HashMap Internal Working: hashing, buckets, load factor, rehashing, treeification; equals() and hashCode() contract',
  module: 'Module 2: Sets, Queues & Maps',
  day: 10,
  level: 'Advanced',
  duration: '2.5 hours',
  summary: 'Look inside HashMap: how a key is hashed to a bucket, what happens on collisions, when the table resizes and rehashes, when buckets turn into trees, and why equals() and hashCode() must follow a strict contract.',
  objectives: [
    'Explain step by step what happens in put() and get()',
    'Calculate a bucket index using hash ^ (hash >>> 16) and (n - 1) & hash',
    'Explain capacity, load factor, threshold, resizing and rehashing',
    'Describe treeification (TREEIFY_THRESHOLD = 8, MIN_TREEIFY_CAPACITY = 64)',
    'State and apply the equals() / hashCode() contract',
  ],
  theory: [
    {
      heading: 'The building blocks: table, buckets and nodes',
      content:
        'A HashMap holds an array called table. Each slot of the array is a bucket. Each bucket holds a chain (linked list) of Node objects, or a small red-black tree when the chain gets long. Picture a hotel: the table is the corridor, each room number is a bucket, and guests whose room numbers clash share the room in a queue.',
      syntax: `static class Node<K,V> {
    final int hash;
    final K key;
    V value;
    Node<K,V> next;
}
Node<K,V>[] table;   // length is always a power of two: 16, 32, 64 ...`,
    },
    {
      heading: 'Hashing: from key to bucket index',
      content:
        'Step 1: call key.hashCode() to get an int. Step 2: HashMap mixes the high 16 bits into the low 16 bits: hash = h ^ (h >>> 16), so that keys differing only in high bits still spread out. Step 3: index = (n - 1) & hash, where n is the table length. Because n is a power of two, (n - 1) & hash is the same as hash % n but much faster. A null key always uses hash 0 -> bucket 0.',
      syntax: `"Aa".hashCode() = 2112, "BB".hashCode() = 2112   -> same bucket (collision)
index = (16 - 1) & spreadHash`,
    },
    {
      heading: 'put(key, value) step by step',
      content: 'This is the most asked HashMap interview question - learn it as a story.',
      points: [
        '1. If table is null, create it (lazy initialization, default 16 buckets)',
        '2. Compute hash and index',
        '3. If bucket is empty, place a new Node there',
        '4. Otherwise walk the chain: if a node has the same hash AND (same reference OR equals() true), replace its value and return the old value',
        '5. If no match, append a new Node at the END of the chain (Java 8+; Java 7 inserted at the head)',
        '6. If the chain length reaches 8 (TREEIFY_THRESHOLD) and table length >= 64, convert the bucket into a red-black tree; if the table is smaller than 64, resize instead',
        '7. Increment size; if size > threshold (capacity x load factor) then resize()',
      ],
    },
    {
      heading: 'get(key) step by step',
      content:
        'Compute hash and index, go to that bucket, check the first node (hash equal and key equals), then walk the chain or search the tree. If nothing matches return null. Average O(1); worst case O(log n) with a treeified bucket (O(n) before Java 8).',
    },
    {
      heading: 'Load factor, threshold, resizing and rehashing',
      content:
        'Load factor (default 0.75) says how full the table may get before it grows. threshold = capacity x loadFactor = 16 x 0.75 = 12. When the 13th entry is added, the table doubles to 32 and all entries are redistributed - rehashing. Because the size doubles, each entry either stays at the same index i or moves to i + oldCapacity, decided by one extra bit of the hash. Resizing is expensive (O(n)), so if you know you will store about 1000 entries, create the map with enough capacity.',
      points: [
        'Lower load factor -> fewer collisions but more memory',
        'Higher load factor -> less memory but longer chains',
        'new HashMap<>(10) actually creates a 16-bucket table (next power of two)',
        'Java 19+: HashMap.newHashMap(1000) calculates the right capacity for 1000 entries',
      ],
    },
    {
      heading: 'Collisions and treeification (Java 8)',
      content:
        'A collision is when two different keys land in the same bucket. Chains handle collisions, but a very long chain makes lookups slow - and attackers could send many colliding keys (hash-flooding). Java 8 converts a bucket into a red-black tree (TreeNode) when the chain has 8 or more nodes and table length is at least 64. If the tree shrinks to 6 or fewer nodes (UNTREEIFY_THRESHOLD), it turns back into a list.',
      syntax: `TREEIFY_THRESHOLD    = 8
UNTREEIFY_THRESHOLD  = 6
MIN_TREEIFY_CAPACITY = 64`,
    },
    {
      heading: 'The equals() and hashCode() contract',
      content:
        'Rules from java.lang.Object that every key class must follow:',
      points: [
        '1. If a.equals(b) is true, then a.hashCode() == b.hashCode() MUST be true',
        '2. If hash codes are equal, objects may or may not be equal (collisions are allowed)',
        '3. hashCode() must return the same value every time while the fields used in equals do not change',
        '4. equals must be reflexive, symmetric, transitive, consistent, and x.equals(null) must be false',
        'Override equals without hashCode -> equal keys go to different buckets -> get() returns null',
        'Constant hashCode (return 1) is legal but puts everything in one bucket -> very slow',
        'Use immutable keys; changing a key field after put() makes the entry unreachable',
      ],
      tip: 'Use Objects.hash(f1, f2) or IDE generation (IntelliJ: Alt+Insert > equals() and hashCode(); Eclipse: Source > Generate hashCode() and equals()), or use a record.',
    },
  ],
  examples: [
    {
      title: 'Calculate the bucket index like HashMap',
      scenario: 'See why "Aa" and "BB" collide and how Integer keys 17 and 33 share a bucket with capacity 16.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Aa hashCode=2112 bucket=0
BB hashCode=2112 bucket=0
Java hashCode=2301506 bucket=1
ab hashCode=3105 bucket=1
17 hashCode=17 bucket=1
33 hashCode=33 bucket=1`,
      explanation:
        '"Aa" = 65*31 + 97 = 2112 and "BB" = 66*31 + 66 = 2112: equal hash codes, a true collision. "Java" and "ab" have different hash codes but still end up in bucket 1 after masking with 15. Integer.hashCode() is the value itself, and 17 & 15 = 1, 33 & 15 = 1.',
    },
    {
      title: 'Breaking the equals/hashCode contract',
      scenario: 'See lookups fail when hashCode is missing or when a key is changed after insertion.',
      steps: ['Create Main.java with BadKey, GoodKey and Main', 'Type the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `BadKey lookup: null
GoodKey lookup: one
After mutating key: null
Lookup with id 5: null
Map size still: 1`,
      explanation:
        'BadKey uses Object.hashCode (identity based), so the second BadKey(1) has a different hash and HashMap never even calls equals - the lookup returns null. GoodKey works. After changing k.id to 6, get(k) searches bucket 6 (empty) and get(new GoodKey(5)) finds the node in bucket 5 but equals fails (its key now has id 6). The entry is stuck in the map: a classic memory leak.',
    },
    {
      title: 'Load factor, resizing and rehashing in numbers',
      scenario: 'Simulate when a default HashMap grows while 100 entries are added, how initial capacity is rounded, and where entries move on resize.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Resize at size 13 -> capacity 32, threshold 24
Resize at size 25 -> capacity 64, threshold 48
Resize at size 49 -> capacity 128, threshold 96
Resize at size 97 -> capacity 256, threshold 192
new HashMap<>(10) -> capacity 16
new HashMap<>(16) -> capacity 16
new HashMap<>(17) -> capacity 32
new HashMap<>(100) -> capacity 128
key 1: bucket 1 in 16, bucket 1 in 32
key 17: bucket 1 in 16, bucket 17 in 32
key 33: bucket 1 in 16, bucket 1 in 32
key 49: bucket 1 in 16, bucket 17 in 32`,
      explanation:
        'Adding 100 entries to a default map causes 4 resizes, each copying all entries. On resize from 16 to 32, keys 1, 17, 33, 49 (all in bucket 1) split: those whose bit 16 is set (17, 49) move to 1 + 16 = 17, the others stay at 1. This is how Java 8 rehashes without recomputing hashCode().',
    },
    {
      title: 'Build a mini HashMap',
      scenario: 'Write a simplified HashMap with 8 buckets, separate chaining, put (insert or replace) and get.',
      steps: ['Create Main.java with MyHashMap and Main', 'Type the code', 'Run ▶ and look at the bucket chains'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Old value: nine
get(17): seventeen
get(25): null
size: 4
bucket 1: 1=one -> 9=NINE -> 17=seventeen
bucket 4: 4=four`,
      explanation:
        '1, 9 and 17 all give index 1 with 8 buckets, so they form a chain (new nodes appended at the tail like Java 8). Putting key 9 again finds the existing node with equals and replaces its value, returning the old "nine". get(25) also goes to bucket 1, walks the chain, finds no equal key and returns null.',
    },
  ],
  interview: [
    { q: 'Explain the internal working of HashMap put().', a: 'Compute hash = h ^ (h >>> 16) of key.hashCode(); index = (n-1) & hash. If the bucket is empty, store a new node. Else walk the chain/tree: if a node has equal hash and equal key, replace the value. Otherwise append a node; treeify the bucket if it reaches 8 nodes and capacity >= 64. Finally, if ++size > threshold, resize (double) and rehash.', level: 'Hard' },
    { q: 'What is the default capacity and load factor of HashMap?', a: 'Capacity 16, load factor 0.75, so threshold 12. The table is created lazily on the first put.', level: 'Easy' },
    { q: 'Why is HashMap capacity always a power of two?', a: 'So that index = (n - 1) & hash works as a fast modulo and so that on resize each entry either stays or moves by exactly oldCapacity.', level: 'Medium' },
    { q: 'What is a collision and how does HashMap handle it?', a: 'Two keys mapping to the same bucket. HashMap uses separate chaining (linked list), converted to a red-black tree when the chain reaches 8 nodes and the table has at least 64 buckets.', level: 'Medium' },
    { q: 'What is treeification and why was it added in Java 8?', a: 'Converting a long bucket chain into a red-black tree, so worst-case lookup becomes O(log n) instead of O(n). It protects against poor hash functions and hash-flooding attacks.', level: 'Hard' },
    { q: 'What is rehashing?', a: 'When size exceeds threshold, HashMap doubles the table and redistributes all entries into the new buckets. In Java 8 each entry stays at index i or moves to i + oldCap based on the bit (hash & oldCap).', level: 'Medium' },
    { q: 'What is the equals() and hashCode() contract?', a: 'Equal objects must have equal hash codes; unequal objects may share a hash code; hashCode must be consistent while the object is unchanged. Break it and hash-based collections lose or duplicate entries.', level: 'Medium' },
    { q: 'What happens if you override equals() but not hashCode()?', a: 'Two logically equal keys usually get different identity hash codes, land in different buckets, and get() / contains() fail to find them; duplicates appear in HashSet.', level: 'Medium' },
    { q: 'What if hashCode() always returns the same constant?', a: 'It is legal and correct, but every key goes into one bucket, so performance degrades to O(n) (or O(log n) once treeified, if keys are Comparable).', level: 'Medium' },
    { q: 'Why should HashMap keys be immutable?', a: 'If a field used in hashCode changes after insertion, the entry stays in the old bucket while lookups go to the new one, so it can never be found or removed.', level: 'Medium' },
    { q: 'Output? "Aa".hashCode() == "BB".hashCode()', a: 'true. Both are 2112, a famous String collision.', level: 'Medium' },
    { q: 'Where is the null key stored in HashMap?', a: 'In bucket 0, because hash(null) is defined as 0.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a Point(x, y) class with correct equals and hashCode. Put Point(1,2) in a HashMap and look it up with a new Point(1,2).',
      hint: 'Objects.hash(x, y). Or use record Point(int x, int y).',
      solution: `import java.util.*;

class Point {
    final int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
    @Override public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Point)) return false;
        Point p = (Point) o;
        return x == p.x && y == p.y;
    }
    @Override public int hashCode() { return Objects.hash(x, y); }
}

public class Main {
    public static void main(String[] args) {
        Map<Point, String> m = new HashMap<>();
        m.put(new Point(1, 2), "A");
        System.out.println(m.get(new Point(1, 2))); // A
    }
}`,
    },
    {
      task: 'Print the bucket index (capacity 16) for the Strings "cat", "dog", "Aa" and "BB" using the HashMap formula.',
      hint: 'h ^ (h >>> 16) then & 15. Check which ones collide.',
      solution: `public class Main {
    static int bucket(String k) {
        int h = k.hashCode();
        return (h ^ (h >>> 16)) & 15;
    }
    public static void main(String[] args) {
        for (String s : new String[]{"cat", "dog", "Aa", "BB"})
            System.out.println(s + " -> " + bucket(s));
        // Aa and BB always share a bucket (same hashCode 2112)
    }
}`,
    },
    {
      task: 'Add a remove(K key) method to the MyHashMap from Example 4.',
      hint: 'Track the previous node; if removing the head, set table[i] = head.next.',
      solution: `// inside MyHashMap<K, V>
public V remove(K key) {
    int i = index(key);
    Node<K, V> prev = null;
    for (Node<K, V> n = table[i]; n != null; prev = n, n = n.next) {
        if (java.util.Objects.equals(n.key, key)) {
            if (prev == null) table[i] = n.next;
            else prev.next = n.next;
            size--;
            return n.value;
        }
    }
    return null;
}`,
    },
    {
      task: 'Calculate the initial capacity you should pass to new HashMap<>(c) so that 1000 entries never trigger a resize.',
      hint: 'c = (int) (expected / 0.75f) + 1, then the map rounds it up to a power of two.',
      solution: `public class Main {
    public static void main(String[] args) {
        int expected = 1000;
        int c = (int) (expected / 0.75f) + 1;   // 1334
        int n = 1;
        while (n < c) n <<= 1;                  // 2048
        System.out.println(c + " -> table " + n + ", threshold " + (int) (n * 0.75f));
        // 1334 -> table 2048, threshold 1536
    }
}`,
    },
  ],
  quiz: [
    { question: 'Default threshold of a new HashMap is:', options: ['16', '8', '12', '10'], answer: 2, explanation: '16 x 0.75 = 12.' },
    { question: 'A bucket is converted to a tree when its chain length reaches:', options: ['8 (and table >= 64)', '6', '16', '64'], answer: 0, explanation: 'TREEIFY_THRESHOLD = 8, MIN_TREEIFY_CAPACITY = 64.' },
    { question: 'If a.equals(b) is true, then:', options: ['a == b must be true', 'a.hashCode() == b.hashCode() must be true', 'Hash codes must differ', 'Nothing is required'], answer: 1, explanation: 'This is the first rule of the contract.' },
    { question: 'On resize from 16 to 32, an entry in bucket 5 can move to:', options: ['Any bucket', 'Bucket 10', 'Bucket 31', 'Bucket 5 or 21'], answer: 3, explanation: 'It stays at i or moves to i + oldCapacity (5 + 16).' },
    { question: 'Index formula used by HashMap for table length n:', options: ['hash % (n + 1)', 'hash / n', '(n - 1) & hash', 'hash >>> n'], answer: 2, explanation: 'Bitwise AND with n-1 works because n is a power of two.' },
  ],
};
