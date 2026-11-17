const ex1 = `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<Integer, String> students = new HashMap<>();
        students.put(3, "Ravi");
        students.put(1, "Anu");
        students.put(2, "Kabir");
        System.out.println(students);
        System.out.println("Roll 2: " + students.get(2));
        System.out.println("Roll 9: " + students.get(9));

        String old = students.put(2, "Kabir Singh");   // same key -> replace
        System.out.println("Replaced: " + old);
        System.out.println("containsKey(1): " + students.containsKey(1));
        System.out.println("containsValue(Ravi): " + students.containsValue("Ravi"));

        students.remove(3);
        System.out.println(students);
        System.out.println("Size: " + students.size());
    }
}`;

const ex2 = `import java.util.HashMap;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        String text = "apple banana apple cherry banana apple";
        Map<String, Integer> freq = new HashMap<>();
        for (String w : text.split(" ")) {
            freq.put(w, freq.getOrDefault(w, 0) + 1);
        }

        // Copy into a TreeMap so the output order is sorted and predictable
        Map<String, Integer> sorted = new TreeMap<>(freq);
        System.out.println(sorted);
        for (Map.Entry<String, Integer> e : sorted.entrySet()) {
            System.out.println(e.getKey() + " -> " + e.getValue());
        }

        Map<Character, Integer> chars = new TreeMap<>();
        for (char c : "hello".toCharArray()) {
            chars.merge(c, 1, Integer::sum);
        }
        System.out.println(chars);
    }
}`;

const ex3 = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[][] emps = {{"IT", "Asha"}, {"HR", "Bina"}, {"IT", "Chetan"}, {"Sales", "Dev"}, {"HR", "Esha"}};
        Map<String, List<String>> byDept = new HashMap<>();
        for (String[] e : emps) {
            byDept.computeIfAbsent(e[0], k -> new ArrayList<>()).add(e[1]);
        }
        System.out.println(new TreeMap<>(byDept));

        Map<String, Integer> stock = new HashMap<>();
        stock.put("pen", 10);
        stock.putIfAbsent("pen", 99);                       // ignored, pen exists
        stock.putIfAbsent("ink", 5);                        // added
        stock.merge("pen", 5, Integer::sum);                // 10 + 5
        stock.computeIfPresent("ink", (k, v) -> v * 2);     // 5 * 2
        stock.compute("pad", (k, v) -> v == null ? 1 : v + 1);
        System.out.println(new TreeMap<>(stock));
        System.out.println("eraser: " + stock.getOrDefault("eraser", 0));
    }
}`;

const ex4 = `import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        Map<Integer, String> m = new HashMap<>();
        m.put(null, "no id");     // one null key allowed
        m.put(1, null);           // null values allowed
        m.put(2, "two");

        System.out.println(m);
        System.out.println(m.get(null));
        System.out.println(m.get(1));
        System.out.println(m.get(5));
        System.out.println(m.containsKey(1));
        System.out.println(m.keySet());
        System.out.println(m.values());
    }
}`;

export default {
  id: 'day-09-map-hashmap',
  title: 'Map Interface and HashMap',
  module: 'Module 2: Sets, Queues & Maps',
  day: 9,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn the Map interface for key-value data, use HashMap for fast lookups, iterate maps in different ways, and use the modern Java 8 methods getOrDefault, putIfAbsent, computeIfAbsent and merge.',
  objectives: [
    'Explain the Map interface and Map.Entry',
    'Perform put, get, remove, containsKey, containsValue on HashMap',
    'Iterate over keySet, values and entrySet',
    'Use getOrDefault, putIfAbsent, compute, computeIfAbsent, computeIfPresent and merge',
    'Know HashMap rules about ordering and null keys/values',
  ],
  theory: [
    {
      heading: 'What is a Map?',
      content:
        'A Map stores data as key -> value pairs, like a dictionary (word -> meaning) or a phone contact list (name -> number). Each key is unique; values can repeat. You look up a value by its key instead of by an index.',
      points: [
        'Keys unique, values may be duplicated',
        'put(key, value) with an existing key REPLACES the old value and returns it',
        'Map is not a Collection, but gives Collection views: keySet(), values(), entrySet()',
        'Implementations: HashMap, LinkedHashMap, TreeMap, Hashtable, ConcurrentHashMap',
      ],
    },
    {
      heading: 'HashMap features',
      content:
        'HashMap is the most used Map. It stores entries in an array of buckets chosen by the key\'s hashCode(), giving average O(1) put/get. Think of a post office with numbered pigeonholes: the PIN code (hash) tells you which hole to check.',
      points: [
        'No guaranteed order - iteration order may differ from insertion order and may change after resize',
        'One null key and any number of null values allowed',
        'Not synchronized (not thread-safe)',
        'Default capacity 16, load factor 0.75 (internals on Day 10)',
        'Keys should be immutable (String, Integer, records) with proper equals/hashCode',
      ],
    },
    {
      heading: 'Core Map methods',
      content: 'These work on every Map implementation.',
      syntax: `V put(K key, V value)          V get(Object key)
V remove(Object key)           boolean containsKey(Object key)
boolean containsValue(Object v) int size()  boolean isEmpty()  void clear()
void putAll(Map m)
Set<K> keySet()   Collection<V> values()   Set<Map.Entry<K,V>> entrySet()`,
      tip: 'get() returns null both when the key is missing and when the key maps to null. Use containsKey() if you need to tell them apart.',
    },
    {
      heading: 'Iterating a Map',
      content:
        'entrySet() is the most efficient way when you need both key and value, because you avoid a second lookup for each key.',
      syntax: `for (Map.Entry<String, Integer> e : map.entrySet())
    System.out.println(e.getKey() + "=" + e.getValue());

for (String k : map.keySet()) ...      // keys only
for (Integer v : map.values()) ...     // values only
map.forEach((k, v) -> System.out.println(k + "=" + v));`,
    },
    {
      heading: 'Java 8+ convenience methods',
      content: 'These remove a lot of if-else boilerplate.',
      syntax: `getOrDefault(k, def)        value or default if key missing
putIfAbsent(k, v)           put only if key absent (or mapped to null)
computeIfAbsent(k, k -> v)  create value lazily, e.g. new ArrayList<>()
computeIfPresent(k, (k,v) -> newV)   update only if present
compute(k, (k,v) -> newV)            always recompute
merge(k, v, Integer::sum)            insert v, or combine old and v
replace(k, v), remove(k, v), replaceAll((k,v) -> ...)`,
      tip: 'Counting pattern: map.merge(word, 1, Integer::sum); Grouping pattern: map.computeIfAbsent(dept, d -> new ArrayList<>()).add(name);',
    },
    {
      heading: 'Common mistakes',
      content: 'Avoid these HashMap mistakes.',
      points: [
        'Expecting HashMap to print in insertion order - use LinkedHashMap or TreeMap',
        'Using a mutable object as key and changing it after put',
        'Using == instead of equals for String keys in your own code',
        'Calling map.get(k) + 1 when key may be missing -> NullPointerException on unboxing. Use getOrDefault or merge',
        'Modifying the map inside a for-each over keySet -> ConcurrentModificationException',
      ],
    },
  ],
  examples: [
    {
      title: 'HashMap CRUD with roll numbers',
      scenario: 'Store students by roll number and perform add, read, update and delete.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `{1=Anu, 2=Kabir, 3=Ravi}
Roll 2: Kabir
Roll 9: null
Replaced: Kabir
containsKey(1): true
containsValue(Ravi): true
{1=Anu, 2=Kabir Singh}
Size: 2`,
      explanation:
        'Small Integer keys hash to themselves (buckets 1, 2, 3), which is why this HashMap prints in ascending key order. This is a side effect - do not depend on HashMap order for other keys. put() with an existing key returns the old value.',
    },
    {
      title: 'Word and character frequency',
      scenario: 'Count how many times each word appears in a sentence and each character in a word - the most common Map interview program.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `{apple=3, banana=2, cherry=1}
apple -> 3
banana -> 2
cherry -> 1
{e=1, h=1, l=2, o=1}`,
      explanation:
        'getOrDefault returns 0 the first time a word is seen. We copy the HashMap into a TreeMap only to get sorted, predictable output. merge(c, 1, Integer::sum) inserts 1 or adds 1 to the existing count.',
    },
    {
      title: 'Grouping and smart updates with Java 8 Map methods',
      scenario: 'Group employees by department and maintain a shop\'s stock counts.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `{HR=[Bina, Esha], IT=[Asha, Chetan], Sales=[Dev]}
{ink=10, pad=1, pen=15}
eraser: 0`,
      explanation:
        'computeIfAbsent creates the list the first time a department is seen, then add() appends. putIfAbsent skipped pen (already 10). merge made pen 15, computeIfPresent doubled ink to 10, compute created pad = 1. TreeMap is used only for sorted printing.',
    },
    {
      title: 'null keys, null values and views',
      scenario: 'See how HashMap handles null and what keySet() and values() return.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `{null=no id, 1=null, 2=two}
no id
null
null
true
[null, 1, 2]
[no id, null, two]`,
      explanation:
        'The null key always goes to bucket 0, keys 1 and 2 go to buckets 1 and 2, so the order is predictable here. m.get(1) and m.get(5) both print null - one because the value is null, the other because the key is missing. containsKey(1) proves key 1 exists.',
    },
  ],
  interview: [
    { q: 'What is a Map? Is it part of the Collection interface?', a: 'A Map is an object that maps unique keys to values. It is part of the Collection Framework but does not extend Collection.', level: 'Easy' },
    { q: 'How many null keys and values can a HashMap have?', a: 'One null key (stored in bucket 0) and any number of null values.', level: 'Easy' },
    { q: 'What does put() return?', a: 'The previous value associated with the key, or null if there was none (or if it was null).', level: 'Medium' },
    { q: 'Output? Map<String,Integer> m = new HashMap<>(); m.put("a",1); m.put("a",2); System.out.println(m.size() + " " + m.get("a"));', a: '1 2. The second put replaces the value for the same key.', level: 'Easy' },
    { q: 'Best way to iterate a HashMap when you need key and value?', a: 'entrySet() with for-each or map.forEach((k, v) -> ...). Using keySet() and get() does an extra lookup per key.', level: 'Medium' },
    { q: 'Difference between putIfAbsent and computeIfAbsent?', a: 'putIfAbsent always evaluates the value argument eagerly. computeIfAbsent takes a function and creates the value only if the key is absent, and it returns the existing or newly computed value - ideal for map.computeIfAbsent(k, x -> new ArrayList<>()).add(v).', level: 'Hard' },
    { q: 'How do you count word frequency using a Map in one line per word?', a: 'map.merge(word, 1, Integer::sum) or map.put(word, map.getOrDefault(word, 0) + 1).', level: 'Easy' },
    { q: 'Is HashMap ordered?', a: 'No. Use LinkedHashMap for insertion/access order or TreeMap for sorted keys.', level: 'Easy' },
    { q: 'Output? Map<String,Integer> m = new HashMap<>(); int x = m.get("k"); ', a: 'NullPointerException - get returns null, and auto-unboxing null to int fails.', level: 'Medium' },
    { q: 'What is Map.Entry?', a: 'A nested interface representing one key-value pair, with getKey(), getValue() and setValue(). entrySet() returns a Set of these.', level: 'Easy' },
    { q: 'Why are String and Integer good HashMap keys?', a: 'They are immutable and correctly override equals() and hashCode(), and String caches its hash code.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Count the vowels in "programming in java" using a TreeMap<Character, Integer>.',
      hint: 'Check "aeiou".indexOf(c) >= 0 then merge.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Character, Integer> m = new TreeMap<>();
        for (char c : "programming in java".toCharArray()) {
            if ("aeiou".indexOf(c) >= 0) m.merge(c, 1, Integer::sum);
        }
        System.out.println(m); // {a=3, i=2, o=1}
    }
}`,
    },
    {
      task: 'Create a phone book Map<String, String>. Add 3 contacts, update one number, delete one, and print the rest sorted by name.',
      hint: 'Use HashMap then print new TreeMap<>(map).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, String> book = new HashMap<>();
        book.put("Ravi", "98765");
        book.put("Anu", "91234");
        book.put("Zara", "90000");
        book.put("Anu", "95555");
        book.remove("Zara");
        System.out.println(new TreeMap<>(book)); // {Anu=95555, Ravi=98765}
    }
}`,
    },
    {
      task: 'Given an int array {2, 7, 11, 15} and target 9, find two indexes whose values add to target (Two Sum) using a HashMap.',
      hint: 'Store value -> index; for each x check if target - x is already in the map.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            Integer j = seen.get(target - nums[i]);
            if (j != null) {
                System.out.println("[" + j + ", " + i + "]"); // [0, 1]
                return;
            }
            seen.put(nums[i], i);
        }
    }
}`,
    },
    {
      task: 'Group words by their length: ["hi","to","java","code","a"] -> {1=[a], 2=[hi, to], 4=[java, code]}.',
      hint: 'computeIfAbsent(len, k -> new ArrayList<>()).add(word); print with TreeMap.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Integer, List<String>> m = new TreeMap<>();
        for (String w : List.of("hi", "to", "java", "code", "a")) {
            m.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w);
        }
        System.out.println(m); // {1=[a], 2=[hi, to], 4=[java, code]}
    }
}`,
    },
    {
      task: 'Find the first non-repeating character in "swiss".',
      hint: 'Use LinkedHashMap to keep order of first appearance, then find the first entry with count 1.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<Character, Integer> m = new LinkedHashMap<>();
        for (char c : "swiss".toCharArray()) m.merge(c, 1, Integer::sum);
        for (Map.Entry<Character, Integer> e : m.entrySet()) {
            if (e.getValue() == 1) { System.out.println(e.getKey()); break; } // w
        }
    }
}`,
    },
  ],
  quiz: [
    { question: 'HashMap allows how many null keys?', options: ['None', 'One', 'Two', 'Unlimited'], answer: 1, explanation: 'Keys are unique, so only one null key.' },
    { question: 'map.put("x", 5) when "x" already maps to 3 returns:', options: ['5', 'null', 'true', '3'], answer: 3, explanation: 'put returns the previous value.' },
    { question: 'Which view gives both keys and values?', options: ['keySet()', 'values()', 'entrySet()', 'toArray()'], answer: 2, explanation: 'entrySet() returns Map.Entry objects.' },
    { question: 'map.merge("a", 1, Integer::sum) when "a" maps to 4 makes it:', options: ['5', '1', '4', '41'], answer: 0, explanation: 'merge combines old value 4 with 1 using sum.' },
    { question: 'Which Map keeps keys sorted?', options: ['HashMap', 'TreeMap', 'LinkedHashMap', 'IdentityHashMap'], answer: 1, explanation: 'TreeMap sorts keys by natural order or a Comparator.' },
  ],
};
