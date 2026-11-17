const ex1 = `import java.util.Comparator;
import java.util.List;
import java.util.Optional;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(5, 12, 7, 3, 12, 20, 8);

        List<Integer> evens = nums.stream().filter(n -> n % 2 == 0).toList();
        System.out.println("evens: " + evens);

        List<Integer> distinctSorted = nums.stream().distinct().sorted().toList();
        System.out.println("distinct sorted: " + distinctSorted);

        List<Integer> top3Squares = nums.stream()
                .sorted(Comparator.reverseOrder())
                .limit(3)
                .map(n -> n * n)
                .toList();
        System.out.println("top 3 squared: " + top3Squares);

        long bigCount = nums.stream().filter(n -> n > 6).count();
        System.out.println("count > 6: " + bigCount);

        int sum = nums.stream().mapToInt(Integer::intValue).sum();
        System.out.println("sum: " + sum);

        int product = nums.stream().limit(3).reduce(1, (a, b) -> a * b);
        System.out.println("product of first 3: " + product);

        Optional<Integer> max = nums.stream().max(Integer::compare);
        System.out.println("max: " + max.orElse(-1));
    }
}`;

const ex2 = `import java.util.*;
import java.util.stream.Collectors;

record Emp(String name, String dept, int salary, int age) { }

public class Main {
    public static void main(String[] args) {
        List<Emp> emps = List.of(
                new Emp("Asha", "IT", 80000, 28),
                new Emp("Ravi", "IT", 65000, 35),
                new Emp("Meena", "HR", 50000, 30),
                new Emp("John", "Sales", 45000, 26),
                new Emp("Kiran", "HR", 55000, 41),
                new Emp("Zoya", "Sales", 70000, 33),
                new Emp("Neel", "IT", 72000, 24));

        Map<String, Long> countByDept = emps.stream()
                .collect(Collectors.groupingBy(Emp::dept, TreeMap::new, Collectors.counting()));
        System.out.println("Count: " + countByDept);

        Map<String, List<String>> namesByDept = emps.stream()
                .collect(Collectors.groupingBy(Emp::dept, TreeMap::new,
                        Collectors.mapping(Emp::name, Collectors.toList())));
        System.out.println("Names: " + namesByDept);

        Map<String, Integer> salaryByDept = emps.stream()
                .collect(Collectors.groupingBy(Emp::dept, TreeMap::new,
                        Collectors.summingInt(Emp::salary)));
        System.out.println("Total salary: " + salaryByDept);

        Map<String, String> topEarner = emps.stream()
                .collect(Collectors.groupingBy(Emp::dept, TreeMap::new,
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparingInt(Emp::salary)),
                                o -> o.get().name())));
        System.out.println("Top earner: " + topEarner);

        Map<Boolean, List<String>> age30 = emps.stream()
                .collect(Collectors.partitioningBy(e -> e.age() >= 30,
                        Collectors.mapping(Emp::name, Collectors.toList())));
        System.out.println("30 and above: " + age30.get(true));
        System.out.println("Below 30: " + age30.get(false));

        String allNames = emps.stream().map(Emp::name).sorted()
                .collect(Collectors.joining(" | "));
        System.out.println(allNames);
    }
}`;

const ex3 = `import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        String text = "to be or not to be that is the question to ask";
        String[] words = text.split(" ");

        Map<String, Long> freq = Arrays.stream(words)
                .collect(Collectors.groupingBy(w -> w, TreeMap::new, Collectors.counting()));
        System.out.println(freq);

        List<String> top2 = freq.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue().reversed()
                        .thenComparing(Map.Entry.<String, Long>comparingByKey()))
                .limit(2)
                .map(e -> e.getKey() + "=" + e.getValue())
                .toList();
        System.out.println("Top 2: " + top2);

        Set<Integer> lengths = Arrays.stream(words)
                .map(String::length)
                .collect(Collectors.toCollection(TreeSet::new));
        System.out.println("Lengths: " + lengths);

        Map<String, Integer> firstThree = Arrays.stream(words)
                .distinct()
                .limit(3)
                .collect(Collectors.toMap(w -> w, String::length, (a, b) -> a, LinkedHashMap::new));
        System.out.println("First 3 distinct: " + firstThree);
    }
}`;

const ex4 = `import java.util.*;
import java.util.stream.Collectors;

record Book(int id, String title, String author, String genre, int year) { }

class Library {
    private final Map<Integer, Book> books = new LinkedHashMap<>();   // id -> book, insertion order
    private final Map<Integer, String> issued = new TreeMap<>();      // id -> member, sorted
    private final Deque<String> history = new ArrayDeque<>();          // latest action on top

    void add(Book b) {
        books.put(b.id(), b);
    }

    boolean issue(int id, String member) {
        if (!books.containsKey(id) || issued.containsKey(id)) return false;
        issued.put(id, member);
        history.push("ISSUE " + id + " to " + member);
        return true;
    }

    boolean giveBack(int id) {
        if (issued.remove(id) == null) return false;
        history.push("RETURN " + id);
        return true;
    }

    List<String> availableTitles() {
        return books.values().stream()
                .filter(b -> !issued.containsKey(b.id()))
                .map(Book::title)
                .toList();
    }

    Map<Integer, String> issued() {
        return Collections.unmodifiableMap(issued);
    }

    Map<String, List<String>> titlesByGenre() {
        return books.values().stream()
                .collect(Collectors.groupingBy(Book::genre, TreeMap::new,
                        Collectors.mapping(Book::title, Collectors.toList())));
    }

    Set<String> authors() {
        return books.values().stream()
                .map(Book::author)
                .collect(Collectors.toCollection(TreeSet::new));
    }

    Optional<Book> oldest() {
        return books.values().stream().min(Comparator.comparingInt(Book::year));
    }

    String lastAction() {
        return history.peek();
    }

    int historySize() {
        return history.size();
    }
}

public class Main {
    public static void main(String[] args) {
        Library lib = new Library();
        lib.add(new Book(1, "Clean Code", "Robert Martin", "Programming", 2008));
        lib.add(new Book(2, "Effective Java", "Joshua Bloch", "Programming", 2001));
        lib.add(new Book(3, "The Alchemist", "Paulo Coelho", "Fiction", 1988));
        lib.add(new Book(4, "Atomic Habits", "James Clear", "Self-help", 2018));
        lib.add(new Book(5, "Java Concurrency in Practice", "Brian Goetz", "Programming", 2006));

        System.out.println("Issue 2 to Asha: " + lib.issue(2, "Asha"));
        System.out.println("Issue 2 to Ravi: " + lib.issue(2, "Ravi"));
        System.out.println("Issue 3 to Ravi: " + lib.issue(3, "Ravi"));
        System.out.println("Return 3: " + lib.giveBack(3));
        System.out.println("Issue 4 to Neel: " + lib.issue(4, "Neel"));

        System.out.println("Available: " + lib.availableTitles());
        System.out.println("Issued: " + lib.issued());
        System.out.println("By genre: " + lib.titlesByGenre());
        System.out.println("Authors: " + lib.authors());
        System.out.println("Oldest: " + lib.oldest().map(Book::title).orElse("none"));
        System.out.println("Last action: " + lib.lastAction());
        System.out.println("History size: " + lib.historySize());
    }
}`;

export default {
  id: 'day-15-collections-streams-project-interview',
  title: 'Collections with Streams, Mini Project, Interview Questions',
  module: 'Module 3: Sorting, Utilities & Advanced',
  day: 15,
  level: 'Advanced',
  duration: '3 hours',
  summary: 'Combine collections with the Stream API (filter, map, sorted, collect, groupingBy, partitioningBy, toMap), build a complete Library Management mini project using List, Map, Set and Deque together, and revise with 25 interview questions.',
  objectives: [
    'Process collections with stream pipelines: filter, map, distinct, sorted, limit, reduce',
    'Use Collectors: toList, toSet, toMap, groupingBy, partitioningBy, counting, mapping, joining, collectingAndThen',
    'Sort maps by value and find top-N items with streams',
    'Design a small application choosing the right collection for each job',
    'Answer the most common Collection Framework interview questions confidently',
  ],
  theory: [
    {
      heading: 'Streams and collections - how they fit together',
      content:
        'A collection STORES data; a stream PROCESSES data. Calling list.stream() is like putting items on a factory conveyor belt: each station (filter, map, sorted) does one job, and at the end a collector packs the results into a new box (List, Set, Map). The original collection is never changed.',
      syntax: `source.stream()           // List, Set, map.entrySet(), Arrays.stream(arr)
      .filter(...)        // intermediate (lazy)
      .map(...)
      .sorted(...)
      .collect(...)       // terminal - triggers the work`,
      points: [
        'Intermediate operations are lazy: nothing runs until a terminal operation (collect, toList, count, forEach, reduce, findFirst...)',
        'A stream can be consumed only once',
        'Do not modify the source collection inside a stream pipeline',
        'stream.toList() (Java 16) returns an unmodifiable list; Collectors.toList() returns a mutable one in practice',
      ],
    },
    {
      heading: 'Most used Collectors',
      content: 'Collectors turn a stream back into a collection or a summary value.',
      syntax: `Collectors.toList() / toSet() / toCollection(TreeSet::new)
Collectors.toMap(keyFn, valueFn [, mergeFn [, mapFactory]])
Collectors.groupingBy(keyFn [, mapFactory] [, downstream])
Collectors.partitioningBy(predicate [, downstream])   // Map<Boolean, ...>
Collectors.counting() summingInt() averagingDouble() maxBy() minBy()
Collectors.mapping(fn, downstream)  collectingAndThen(c, finisher)
Collectors.joining(", ", "[", "]")`,
      tip: 'groupingBy returns a HashMap by default (unordered). Pass TreeMap::new as the map factory when you want sorted, predictable output.',
    },
    {
      heading: 'Common stream patterns on collections',
      content: 'These patterns appear again and again in projects and coding rounds.',
      syntax: `// frequency map
Map<String, Long> f = words.stream().collect(groupingBy(w -> w, counting()));
// sort map by value desc
map.entrySet().stream().sorted(Map.Entry.<K,V>comparingByValue().reversed())
// remove duplicates keeping order
list.stream().distinct().toList();
// list to map (id -> object)
list.stream().collect(toMap(Emp::id, e -> e));
// flatten list of lists
lists.stream().flatMap(List::stream).toList();`,
      points: [
        'toMap throws IllegalStateException on duplicate keys unless you pass a merge function',
        'toMap does not allow null values (NullPointerException)',
      ],
    },
    {
      heading: 'Choosing the right collection (cheat sheet)',
      content: 'Ask: Do I need order? Uniqueness? Key lookup? Priority? Thread safety?',
      points: [
        'Ordered list, index access, duplicates OK -> ArrayList',
        'Unique items, fast lookup -> HashSet; keep insertion order -> LinkedHashSet; sorted -> TreeSet',
        'Key -> value lookup -> HashMap; keep insertion order -> LinkedHashMap; sorted keys / ranges -> TreeMap',
        'FIFO queue or stack -> ArrayDeque; by priority -> PriorityQueue',
        'Shared between threads -> ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue',
        'Constant data -> List.of / Set.of / Map.of',
      ],
    },
    {
      heading: 'Mini project design: Library Management',
      content:
        'The project in Example 4 uses each collection for what it does best: LinkedHashMap<Integer, Book> for the catalogue (fast lookup by id + stable display order), TreeMap<Integer, String> for issued books (sorted by id), ArrayDeque<String> as a stack of recent actions (undo/history), TreeSet<String> for unique sorted authors, and streams to build reports. Records give immutable Book objects with equals/hashCode for free.',
      points: [
        'Encapsulation: return Collections.unmodifiableMap(...) so callers cannot change internal state',
        'Use Optional for "maybe no result" (oldest book in an empty library)',
        'Extend it: search by author, due dates with LocalDate, fines, menu-driven Scanner input',
      ],
    },
  ],
  examples: [
    {
      title: 'Stream basics on a List',
      scenario: 'Filter, de-duplicate, sort, limit, transform and aggregate a list of numbers.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `evens: [12, 12, 20, 8]
distinct sorted: [3, 5, 7, 8, 12, 20]
top 3 squared: [400, 144, 144]
count > 6: 5
sum: 67
product of first 3: 420
max: 20`,
      explanation:
        'Each pipeline creates a new result and leaves nums unchanged. Sorting descending gives 20, 12, 12 and squaring gives 400, 144, 144. reduce(1, multiply) on 5, 12, 7 gives 420. max returns an Optional because the stream could be empty.',
    },
    {
      title: 'Employee reports with Collectors',
      scenario: 'HR needs head-count, names, total salary and top earner per department, plus an age split.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code (Emp record + Main)', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Count: {HR=2, IT=3, Sales=2}
Names: {HR=[Meena, Kiran], IT=[Asha, Ravi, Neel], Sales=[John, Zoya]}
Total salary: {HR=105000, IT=217000, Sales=115000}
Top earner: {HR=Kiran, IT=Asha, Sales=Zoya}
30 and above: [Ravi, Meena, Kiran, Zoya]
Below 30: [Asha, John, Neel]
Asha | John | Kiran | Meena | Neel | Ravi | Zoya`,
      explanation:
        'TreeMap::new makes every grouped map sorted by department. mapping() keeps names in the original list order. collectingAndThen unwraps the Optional from maxBy into just the name. partitioningBy always creates exactly two groups: true and false.',
    },
    {
      title: 'Word frequency, top-N and conversions',
      scenario: 'Analyse a sentence: count each word, find the 2 most frequent, collect unique lengths, and build an ordered map.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `{ask=1, be=2, is=1, not=1, or=1, question=1, that=1, the=1, to=3}
Top 2: [to=3, be=2]
Lengths: [2, 3, 4, 8]
First 3 distinct: {to=2, be=2, or=2}`,
      explanation:
        'groupingBy with counting builds the frequency map (TreeMap for sorted keys). Sorting entries by value descending, then key, gives to=3 then be=2. toCollection(TreeSet::new) removes duplicate lengths and sorts them. toMap with LinkedHashMap::new keeps encounter order.',
    },
    {
      title: 'Mini project: Library Management System',
      scenario: 'Manage books, issue and return them, keep a history, and produce reports using several collections together.',
      steps: [
        'In IntelliJ: File > New > Project > Java, name it LibraryApp',
        'Create Main.java and type the Book record, Library class and Main class',
        'Run ▶ and compare each line with the method that produced it',
        'Extend: add a Scanner-based menu (1 Add, 2 Issue, 3 Return, 4 Reports, 0 Exit)',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Issue 2 to Asha: true
Issue 2 to Ravi: false
Issue 3 to Ravi: true
Return 3: true
Issue 4 to Neel: true
Available: [Clean Code, The Alchemist, Java Concurrency in Practice]
Issued: {2=Asha, 4=Neel}
By genre: {Fiction=[The Alchemist], Programming=[Clean Code, Effective Java, Java Concurrency in Practice], Self-help=[Atomic Habits]}
Authors: [Brian Goetz, James Clear, Joshua Bloch, Paulo Coelho, Robert Martin]
Oldest: The Alchemist
Last action: ISSUE 4 to Neel
History size: 4`,
      explanation:
        'Book 2 cannot be issued twice, so Ravi\'s request fails and is not recorded. Book 3 was issued and returned, so it is available again. LinkedHashMap keeps catalogue order for the available list; TreeMap sorts issued ids; TreeSet sorts authors; ArrayDeque.push/peek gives the latest action.',
    },
  ],
  interview: [
    { q: 'Explain the Collection Framework hierarchy.', a: 'Iterable -> Collection -> List (ArrayList, LinkedList, Vector/Stack), Set (HashSet/LinkedHashSet, SortedSet/NavigableSet/TreeSet), Queue (PriorityQueue, Deque/ArrayDeque/LinkedList). Map is a separate hierarchy: HashMap/LinkedHashMap, Hashtable, SortedMap/NavigableMap/TreeMap, ConcurrentHashMap.', level: 'Easy' },
    { q: 'ArrayList vs LinkedList?', a: 'ArrayList: dynamic array, O(1) get, O(n) middle insert/delete, less memory. LinkedList: doubly linked list, O(n) get, O(1) insert/delete at ends or via iterator, more memory, also a Deque.', level: 'Easy' },
    { q: 'HashSet vs LinkedHashSet vs TreeSet?', a: 'HashSet: unordered, O(1), one null. LinkedHashSet: insertion order, O(1), one null. TreeSet: sorted, O(log n), no null, uses compareTo/compare for uniqueness.', level: 'Easy' },
    { q: 'HashMap vs Hashtable vs ConcurrentHashMap?', a: 'HashMap: not synchronized, one null key/null values, fast. Hashtable: legacy, fully synchronized, no nulls. ConcurrentHashMap: thread-safe with CAS and bucket-level locking, no nulls, weakly consistent iterators, scalable.', level: 'Medium' },
    { q: 'How does HashMap work internally?', a: 'Array of buckets. hash = h ^ (h >>> 16), index = (n-1) & hash. Collisions are chained in a linked list, treeified into a red-black tree at 8 nodes when capacity >= 64. Resizes (doubles) when size > capacity x 0.75, splitting entries to i or i + oldCap.', level: 'Hard' },
    { q: 'What is the equals/hashCode contract and why does it matter?', a: 'Equal objects must have equal hash codes. Hash-based collections find the bucket with hashCode and compare with equals; breaking the contract causes lost lookups and duplicates.', level: 'Medium' },
    { q: 'Comparable vs Comparator?', a: 'Comparable: natural order inside the class, compareTo(T), one per class. Comparator: external, compare(T, T), many possible, built with lambdas and comparing/thenComparing.', level: 'Easy' },
    { q: 'Fail-fast vs fail-safe iterators?', a: 'Fail-fast (ArrayList, HashMap) throw ConcurrentModificationException when the collection is structurally modified during iteration (modCount check). Fail-safe/weakly consistent (CopyOnWriteArrayList, ConcurrentHashMap) never throw; they use snapshots or tolerate changes.', level: 'Medium' },
    { q: 'How do you remove elements from a list while iterating?', a: 'Use Iterator.remove(), list.removeIf(predicate), or iterate backwards with an index. Never call list.remove inside a for-each loop.', level: 'Easy' },
    { q: 'What is the output? List<Integer> l = new ArrayList<>(List.of(10,20,30)); l.remove(Integer.valueOf(10)); l.remove(0); System.out.println(l);', a: '[30]. First removes the value 10 -> [20, 30]; then removes index 0 -> [30].', level: 'Medium' },
    { q: 'What is the output? Set<String> s = new TreeSet<>(List.of("b","A","a","B")); System.out.println(s);', a: '[A, B, a, b] - natural String order puts uppercase before lowercase.', level: 'Medium' },
    { q: 'What is the output? Map<String,Integer> m = new HashMap<>(); m.put("x",1); m.put("x",m.get("x")+1); System.out.println(m);', a: '{x=2}. Same key is replaced with the new value 2.', level: 'Easy' },
    { q: 'Difference between List.of, Arrays.asList and Collections.unmodifiableList?', a: 'List.of: immutable, no nulls. Arrays.asList: fixed-size, set() allowed and writes through to the array, nulls allowed. unmodifiableList: read-only view, changes to the backing list are visible.', level: 'Hard' },
    { q: 'How would you implement an LRU cache?', a: 'Extend LinkedHashMap with accessOrder = true and override removeEldestEntry(eldest) to return size() > capacity. For concurrent use, wrap with synchronization or use a library like Caffeine.', level: 'Medium' },
    { q: 'Why is ArrayDeque preferred over Stack?', a: 'Stack extends Vector: synchronized (slow) and exposes index methods that break LIFO. ArrayDeque is faster, cleaner and recommended by the Javadoc.', level: 'Easy' },
    { q: 'How does PriorityQueue order elements and what is the complexity?', a: 'Binary heap (min-heap by default or by Comparator). offer/poll O(log n), peek O(1). Iteration/toString is not sorted.', level: 'Medium' },
    { q: 'How do you sort a HashMap by values?', a: 'map.entrySet().stream().sorted(Map.Entry.comparingByValue()) and collect into a LinkedHashMap with toMap(..., (a, b) -> a, LinkedHashMap::new) to preserve the sorted order.', level: 'Medium' },
    { q: 'What happens with Collectors.toMap when two elements have the same key?', a: 'IllegalStateException (Duplicate key) unless you provide a merge function like (a, b) -> a.', level: 'Medium' },
    { q: 'Why can you not use primitive types in collections?', a: 'Generics work only with reference types. Primitives are auto-boxed to wrappers (int -> Integer), which costs memory; for heavy numeric work use arrays or IntStream.', level: 'Easy' },
    { q: 'What is the difference between Iterator and Enumeration?', a: 'Iterator has remove(), shorter method names, is fail-fast and works with all collections. Enumeration is legacy (Vector/Hashtable), read-only and not fail-fast.', level: 'Easy' },
    { q: 'When does a HashMap bucket become a tree and why?', a: 'When a chain reaches 8 nodes and the table has at least 64 buckets (otherwise the map resizes). It limits worst-case lookups to O(log n) and protects against hash-collision attacks. It reverts to a list at 6 or fewer nodes.', level: 'Hard' },
    { q: 'What is the output? Deque<Integer> d = new ArrayDeque<>(); d.push(1); d.offer(2); d.push(3); System.out.println(d);', a: '[3, 1, 2]. push adds at the front, offer adds at the end.', level: 'Medium' },
    { q: 'How do you make a collection thread-safe?', a: 'Use concurrent collections (ConcurrentHashMap, CopyOnWriteArrayList, BlockingQueue), Collections.synchronizedXxx wrappers, or immutable collections (List.of) for read-only shared data.', level: 'Medium' },
    { q: 'What is the difference between Collection.remove(Object) and Iterator.remove()?', a: 'Collection.remove during iteration changes modCount behind the iterator and causes ConcurrentModificationException. Iterator.remove removes the last returned element and keeps the iterator consistent.', level: 'Medium' },
    { q: 'Which collection would you use to store unique employee ids in sorted order and find the next higher id quickly?', a: 'TreeSet<Integer> - unique, sorted, and higher()/ceiling() give the next id in O(log n).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Given a list of names, return a Map<Character, List<String>> grouping names by first letter, sorted by letter.',
      hint: 'groupingBy(n -> n.charAt(0), TreeMap::new, toList()).',
      solution: `import java.util.*;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Amit", "Bela", "Arun", "Chirag", "Bharat");
        Map<Character, List<String>> m = names.stream()
            .collect(Collectors.groupingBy(n -> n.charAt(0), TreeMap::new, Collectors.toList()));
        System.out.println(m); // {A=[Amit, Arun], B=[Bela, Bharat], C=[Chirag]}
    }
}`,
    },
    {
      task: 'Find the second highest distinct salary from a list using streams.',
      hint: 'distinct().sorted(reverseOrder()).skip(1).findFirst().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> sal = List.of(50000, 80000, 65000, 80000, 72000);
        int second = sal.stream().distinct().sorted(Comparator.reverseOrder())
                        .skip(1).findFirst().orElse(-1);
        System.out.println(second); // 72000
    }
}`,
    },
    {
      task: 'Flatten a List<List<Integer>> [[1,2],[3],[4,5]] into one list and print the sum of even numbers.',
      hint: 'flatMap(List::stream).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3), List.of(4, 5));
        List<Integer> flat = nested.stream().flatMap(List::stream).toList();
        int evenSum = flat.stream().filter(n -> n % 2 == 0).mapToInt(Integer::intValue).sum();
        System.out.println(flat + " " + evenSum); // [1, 2, 3, 4, 5] 6
    }
}`,
    },
    {
      task: 'Extend the Library project: add a method booksByAuthor(String author) that returns titles sorted alphabetically, and a method searchTitle(String keyword) (case-insensitive).',
      hint: 'Stream books.values(), filter, map(Book::title), sorted(), toList(). Use toLowerCase().contains().',
      solution: `// Add inside class Library
List<String> booksByAuthor(String author) {
    return books.values().stream()
            .filter(b -> b.author().equalsIgnoreCase(author))
            .map(Book::title)
            .sorted()
            .toList();
}

List<String> searchTitle(String keyword) {
    String k = keyword.toLowerCase();
    return books.values().stream()
            .map(Book::title)
            .filter(t -> t.toLowerCase().contains(k))
            .toList();
}

// In main:
// System.out.println(lib.searchTitle("java"));
// [Effective Java, Java Concurrency in Practice]`,
    },
    {
      task: 'Practical test: Build a Student Result Processor. Store Student(name, subject, marks) records in a List. Print (a) average marks per subject (TreeMap), (b) topper per subject, (c) students who scored below 40 in any subject (unique, sorted).',
      hint: 'groupingBy(subject, TreeMap::new, averagingInt(marks)); maxBy for topper; filter + map(name) + toCollection(TreeSet::new).',
      solution: `import java.util.*;
import java.util.stream.Collectors;

record Student(String name, String subject, int marks) { }

public class Main {
    public static void main(String[] args) {
        List<Student> list = List.of(
            new Student("Asha", "Java", 90), new Student("Ravi", "Java", 35),
            new Student("Asha", "SQL", 70), new Student("Ravi", "SQL", 60),
            new Student("Neel", "Java", 80), new Student("Neel", "SQL", 30));

        Map<String, Double> avg = list.stream().collect(
            Collectors.groupingBy(Student::subject, TreeMap::new, Collectors.averagingInt(Student::marks)));
        System.out.println(avg); // {Java=68.33333333333333, SQL=53.333333333333336}

        Map<String, String> topper = list.stream().collect(
            Collectors.groupingBy(Student::subject, TreeMap::new,
                Collectors.collectingAndThen(
                    Collectors.maxBy(Comparator.comparingInt(Student::marks)),
                    o -> o.get().name())));
        System.out.println(topper); // {Java=Asha, SQL=Asha}

        Set<String> weak = list.stream().filter(s -> s.marks() < 40)
            .map(Student::name).collect(Collectors.toCollection(TreeSet::new));
        System.out.println(weak); // [Neel, Ravi]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which Collector splits elements into exactly two groups?', options: ['groupingBy', 'partitioningBy', 'toMap', 'joining'], answer: 1, explanation: 'partitioningBy returns Map<Boolean, ...> with true and false keys.' },
    { question: 'groupingBy(f) without a map factory returns a:', options: ['TreeMap', 'LinkedHashMap', 'HashMap', 'ConcurrentHashMap'], answer: 2, explanation: 'Default is HashMap; pass TreeMap::new for sorted output.' },
    { question: 'Collectors.toMap with duplicate keys and no merge function throws:', options: ['IllegalStateException', 'NullPointerException', 'ClassCastException', 'Nothing, keeps the last'], answer: 0, explanation: 'It reports "Duplicate key".' },
    { question: 'Best collection for "unique items in sorted order with next-higher lookup":', options: ['ArrayList', 'HashSet', 'LinkedHashSet', 'TreeSet'], answer: 3, explanation: 'TreeSet is sorted and offers higher()/ceiling().' },
    { question: 'List.of(3,1,2).stream().sorted().toList() returns:', options: ['[3, 1, 2]', '[3, 2, 1]', '[1, 2, 3]', 'Throws UnsupportedOperationException'], answer: 2, explanation: 'sorted() creates a new sorted stream; the immutable source is not modified.' },
  ],
};
