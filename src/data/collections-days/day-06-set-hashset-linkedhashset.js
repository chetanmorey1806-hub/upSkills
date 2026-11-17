const ex1 = `import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<Integer> ids = new HashSet<>();
        System.out.println(ids.add(5));
        System.out.println(ids.add(3));
        System.out.println(ids.add(5));     // duplicate -> false
        ids.add(9);
        ids.add(1);
        System.out.println(ids);
        System.out.println("Size: " + ids.size());
        System.out.println("Contains 3? " + ids.contains(3));
        ids.remove(3);
        System.out.println(ids);
    }
}`;

const ex2 = `import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        String[] visitors = {"Riya", "Arjun", "Riya", "Zoya", "Arjun", "Dev"};

        Set<String> linked = new LinkedHashSet<>();
        for (String v : visitors) {
            linked.add(v);
        }
        System.out.println("Unique visitors in arrival order: " + linked);

        Set<String> hash = new HashSet<>(Arrays.asList(visitors));
        System.out.println("HashSet size: " + hash.size());
        System.out.println("Same elements? " + hash.equals(linked));
    }
}`;

const ex3 = `import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

class Emp {                       // NO equals/hashCode
    int id;
    String name;
    Emp(int id, String name) { this.id = id; this.name = name; }
}

class GoodEmp {                   // WITH equals/hashCode
    int id;
    String name;
    GoodEmp(int id, String name) { this.id = id; this.name = name; }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof GoodEmp)) return false;
        GoodEmp other = (GoodEmp) o;
        return id == other.id && Objects.equals(name, other.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}

record Employee(int id, String name) { }   // record = equals/hashCode for free

public class Main {
    public static void main(String[] args) {
        Set<Emp> s1 = new HashSet<>();
        s1.add(new Emp(1, "Ana"));
        s1.add(new Emp(1, "Ana"));
        System.out.println("Without equals/hashCode: " + s1.size());

        Set<GoodEmp> s2 = new HashSet<>();
        s2.add(new GoodEmp(1, "Ana"));
        s2.add(new GoodEmp(1, "Ana"));
        System.out.println("With equals/hashCode: " + s2.size());

        Set<Employee> s3 = new HashSet<>();
        s3.add(new Employee(1, "Ana"));
        s3.add(new Employee(1, "Ana"));
        System.out.println("Record: " + s3);
    }
}`;

const ex4 = `import java.util.HashSet;
import java.util.Set;

public class Main {
    public static void main(String[] args) {
        Set<Integer> a = new HashSet<>(Set.of(1, 2, 3, 4, 5));
        Set<Integer> b = new HashSet<>(Set.of(4, 5, 6, 7));

        Set<Integer> union = new HashSet<>(a);
        union.addAll(b);

        Set<Integer> common = new HashSet<>(a);
        common.retainAll(b);

        Set<Integer> onlyA = new HashSet<>(a);
        onlyA.removeAll(b);

        System.out.println("Union: " + union);
        System.out.println("Intersection: " + common);
        System.out.println("A - B: " + onlyA);
        System.out.println("Is {4,5} subset of A? " + a.containsAll(Set.of(4, 5)));
    }
}`;

export default {
  id: 'day-06-set-hashset-linkedhashset',
  title: 'Set Interface: HashSet and LinkedHashSet',
  module: 'Module 2: Sets, Queues & Maps',
  day: 6,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn the Set interface for storing unique elements, how HashSet uses a HashMap internally, how LinkedHashSet keeps insertion order, and why equals() and hashCode() decide what counts as a duplicate.',
  objectives: [
    'State the properties of the Set interface',
    'Explain the internal working of HashSet (backed by HashMap)',
    'Choose between HashSet and LinkedHashSet',
    'Override equals() and hashCode() so custom objects are de-duplicated correctly',
    'Perform union, intersection and difference with sets',
  ],
  theory: [
    {
      heading: 'Set interface',
      content:
        'A Set is a collection that does not allow duplicates - like the set of Aadhaar numbers in a database: each one appears only once. Set has no index-based methods (no get(i)). add() returns false when the element is already present.',
      points: [
        'No duplicates (decided by equals() and hashCode())',
        'At most one null in HashSet/LinkedHashSet; TreeSet does not allow null',
        'Implementations: HashSet (no order), LinkedHashSet (insertion order), TreeSet (sorted)',
      ],
    },
    {
      heading: 'HashSet internal working',
      content:
        'HashSet is actually a wrapper around a HashMap. When you call set.add("Java"), it does map.put("Java", PRESENT) where PRESENT is a dummy constant Object. Because map keys are unique, the set is unique. Lookup works by hashing: hashCode() picks a bucket (like picking the correct drawer in a cabinet), then equals() checks the items in that drawer.',
      syntax: `public boolean add(E e) {
    return map.put(e, PRESENT) == null;   // null means "was not there before"
}
Default capacity 16, load factor 0.75 (resizes after 12 elements)`,
      points: [
        'add, remove, contains: O(1) on average',
        'Iteration order is NOT guaranteed and can change when the set resizes',
        'Not synchronized',
      ],
      tip: 'Small Integer values like 1, 3, 5 often print in ascending order from a HashSet because Integer.hashCode() is the value itself. This is a side effect, not a guarantee - never rely on it.',
    },
    {
      heading: 'LinkedHashSet',
      content:
        'LinkedHashSet extends HashSet but is backed by a LinkedHashMap, which additionally threads all entries in a doubly linked list. So it iterates in the order elements were inserted - like a guest register that records arrival order while still refusing duplicate names.',
      points: [
        'Same O(1) performance as HashSet, slightly more memory',
        'Re-inserting an existing element does NOT change its position',
        'Perfect for "remove duplicates but keep original order"',
      ],
    },
    {
      heading: 'equals() and hashCode() for custom objects',
      content:
        'For your own classes, HashSet uses hashCode() to find the bucket and equals() to compare. If you do not override them, Object\'s versions compare memory addresses, so two Emp objects with the same id are treated as different and both get stored. Rule: if two objects are equal by equals(), they MUST return the same hashCode().',
      syntax: `@Override public boolean equals(Object o) { ... compare fields ... }
@Override public int hashCode() { return Objects.hash(id, name); }
// or simply use a record: record Employee(int id, String name) {}`,
      tip: 'Never change a field used in hashCode() while the object is inside a HashSet - the set will look in the wrong bucket and cannot find or remove it.',
    },
    {
      heading: 'Set operations',
      content: 'Sets map nicely to mathematics.',
      syntax: `Union        : s1.addAll(s2)
Intersection : s1.retainAll(s2)
Difference   : s1.removeAll(s2)
Subset       : s1.containsAll(s2)`,
      tip: 'These methods change s1, so copy it first: new HashSet<>(s1).',
    },
  ],
  examples: [
    {
      title: 'HashSet basics',
      scenario: 'Store unique ticket ids and see add() returning false for a duplicate.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `true
true
false
[1, 3, 5, 9]
Size: 4
Contains 3? true
[1, 5, 9]`,
      explanation:
        'The second add(5) returns false and the set keeps a single 5. These small Integers print in ascending order only because their hash codes equal their values and land in buckets 1, 3, 5, 9 of a 16-bucket table. For other data (e.g. Strings) HashSet order can look random.',
    },
    {
      title: 'LinkedHashSet keeps arrival order',
      scenario: 'A museum wants the list of unique visitors in the order they first arrived.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Unique visitors in arrival order: [Riya, Arjun, Zoya, Dev]
HashSet size: 4
Same elements? true`,
      explanation:
        'LinkedHashSet drops repeats and keeps first-arrival order. We print only the HashSet size because its String order is not guaranteed. Set.equals() compares contents only, ignoring order, so the two sets are equal.',
    },
    {
      title: 'Custom objects: why equals() and hashCode() matter',
      scenario: 'Prevent the same employee being stored twice in a HashSet.',
      steps: ['Create Main.java containing Emp, GoodEmp, the Employee record and Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Without equals/hashCode: 2
With equals/hashCode: 1
Record: [Employee[id=1, name=Ana]]`,
      explanation:
        'Emp uses Object.equals (reference comparison), so two separate objects are both stored. GoodEmp compares fields, so the second add is rejected. A record automatically generates equals, hashCode and toString.',
    },
    {
      title: 'Union, intersection and difference',
      scenario: 'Find students enrolled in both Java (A) and Python (B) batches, either batch, or only Java.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Union: [1, 2, 3, 4, 5, 6, 7]
Intersection: [4, 5]
A - B: [1, 2, 3]
Is {4,5} subset of A? true`,
      explanation:
        'Each operation works on a copy so a and b stay unchanged. Values are small Integers (all below 16) so the HashSet happens to print them in ascending order; use a TreeSet if you need guaranteed sorted output.',
    },
  ],
  interview: [
    { q: 'How does HashSet work internally?', a: 'It is backed by a HashMap. Each element is stored as a key with a dummy value PRESENT. add() returns map.put(e, PRESENT) == null. Uniqueness comes from map keys, using hashCode() for bucket and equals() for comparison.', level: 'Medium' },
    { q: 'HashSet vs LinkedHashSet?', a: 'HashSet: no guaranteed order, slightly less memory. LinkedHashSet: maintains insertion order using a doubly linked list over entries (backed by LinkedHashMap). Both O(1) and allow one null.', level: 'Easy' },
    { q: 'What is the output? Set<String> s = new HashSet<>(); System.out.println(s.add("a") + " " + s.add("a"));', a: 'true false', level: 'Easy' },
    { q: 'Why must we override hashCode() when we override equals()?', a: 'Hash-based collections first use hashCode() to find the bucket. If equal objects have different hash codes they land in different buckets and are never compared with equals(), so duplicates appear and lookups fail.', level: 'Medium' },
    { q: 'Can HashSet contain null?', a: 'Yes, exactly one null element. TreeSet does not allow null (NullPointerException) with natural ordering.', level: 'Easy' },
    { q: 'What happens if you modify an object after adding it to a HashSet (field used in hashCode)?', a: 'Its hashCode changes but it stays in the old bucket. contains() and remove() look in the new bucket and fail, causing a memory leak-like situation and possible duplicates.', level: 'Hard' },
    { q: 'Time complexity of HashSet operations?', a: 'add/remove/contains O(1) average; worst case O(log n) since Java 8 (bucket trees) or O(n) with poor hashes. Iteration O(n + capacity).', level: 'Medium' },
    { q: 'How do you remove duplicates from a List while preserving order?', a: 'new ArrayList<>(new LinkedHashSet<>(list)) or list.stream().distinct().toList().', level: 'Easy' },
    { q: 'Does Set have a get(index) method?', a: 'No. Sets are not index-based. Iterate or convert to a List if you need positions.', level: 'Easy' },
    { q: 'What is the output? Set<Integer> s = new LinkedHashSet<>(List.of(3,1,2)); s.add(1); s.add(0); System.out.println(s);', a: '[3, 1, 2, 0]. Re-adding 1 does not move it; 0 is appended at the end.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Find the first repeated character in "programming" using a HashSet.',
      hint: 'If add(c) returns false, that is the first repeat.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<Character> seen = new HashSet<>();
        for (char c : "programming".toCharArray()) {
            if (!seen.add(c)) {
                System.out.println("First repeat: " + c); // r
                break;
            }
        }
    }
}`,
    },
    {
      task: 'Remove duplicates from an int array {4, 2, 4, 1, 2, 7} keeping the first-seen order.',
      hint: 'LinkedHashSet<Integer>.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] arr = {4, 2, 4, 1, 2, 7};
        Set<Integer> set = new LinkedHashSet<>();
        for (int x : arr) set.add(x);
        System.out.println(set); // [4, 2, 1, 7]
    }
}`,
    },
    {
      task: 'Create a Product class (code, name) where two products are equal if their code is equal. Add 3 products (two with same code) to a HashSet and print the size.',
      hint: 'equals and hashCode should use only code.',
      solution: `import java.util.*;

class Product {
    String code, name;
    Product(String c, String n) { code = c; name = n; }
    @Override public boolean equals(Object o) {
        return o instanceof Product p && code.equals(p.code);
    }
    @Override public int hashCode() { return code.hashCode(); }
}

public class Main {
    public static void main(String[] args) {
        Set<Product> s = new HashSet<>();
        s.add(new Product("P1", "Pen"));
        s.add(new Product("P2", "Pencil"));
        s.add(new Product("P1", "Blue Pen"));
        System.out.println(s.size()); // 2
    }
}`,
    },
    {
      task: 'Check whether two strings are made of exactly the same set of characters ("listen", "silent").',
      hint: 'Build two sets of characters and compare with equals().',
      solution: `import java.util.*;

public class Main {
    static Set<Character> chars(String s) {
        Set<Character> set = new HashSet<>();
        for (char c : s.toCharArray()) set.add(c);
        return set;
    }
    public static void main(String[] args) {
        System.out.println(chars("listen").equals(chars("silent"))); // true
    }
}`,
    },
  ],
  quiz: [
    { question: 'HashSet internally uses:', options: ['ArrayList', 'HashMap', 'TreeMap', 'LinkedList'], answer: 1, explanation: 'Elements are stored as keys in a HashMap.' },
    { question: 'Which Set keeps insertion order?', options: ['HashSet', 'TreeSet', 'LinkedHashSet', 'EnumSet'], answer: 2, explanation: 'LinkedHashSet maintains a linked list of entries in insertion order.' },
    { question: 'set.add(x) when x is already present returns:', options: ['true', 'Throws exception', 'null', 'false'], answer: 3, explanation: 'add returns false if the set already contains the element.' },
    { question: 'If equals() is overridden but hashCode() is not, a HashSet may:', options: ['Store logical duplicates', 'Throw an exception', 'Sort elements', 'Reject all elements'], answer: 0, explanation: 'Equal objects may go to different buckets and both be stored.' },
    { question: 'How many null elements can a HashSet hold?', options: ['0', '1', 'Unlimited', 'Depends on capacity'], answer: 1, explanation: 'Keys are unique, so only one null.' },
  ],
};
