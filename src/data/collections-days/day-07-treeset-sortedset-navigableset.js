const ex1 = `import java.util.List;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> scores = new TreeSet<>(List.of(55, 90, 72, 40, 90, 65));
        System.out.println(scores);
        System.out.println("first: " + scores.first());
        System.out.println("last: " + scores.last());
        System.out.println("headSet(65): " + scores.headSet(65));
        System.out.println("tailSet(65): " + scores.tailSet(65));
        System.out.println("subSet(50, 80): " + scores.subSet(50, 80));
    }
}`;

const ex2 = `import java.util.List;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> slots = new TreeSet<>(List.of(9, 11, 13, 15, 17));
        System.out.println("lower(13): " + slots.lower(13));
        System.out.println("floor(13): " + slots.floor(13));
        System.out.println("ceiling(14): " + slots.ceiling(14));
        System.out.println("higher(17): " + slots.higher(17));
        System.out.println("descendingSet: " + slots.descendingSet());
        System.out.println("pollFirst: " + slots.pollFirst());
        System.out.println("pollLast: " + slots.pollLast());
        System.out.println("After polls: " + slots);
        System.out.println("headSet(13, true): " + slots.headSet(13, true));
    }
}`;

const ex3 = `import java.util.Comparator;
import java.util.List;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        List<String> fruits = List.of("banana", "Apple", "cherry", "apple");

        TreeSet<String> natural = new TreeSet<>(fruits);
        System.out.println("Natural: " + natural);

        TreeSet<String> ignoreCase = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);
        ignoreCase.addAll(fruits);
        System.out.println("Ignore case: " + ignoreCase);

        TreeSet<String> byLength = new TreeSet<>(
                Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()));
        byLength.addAll(List.of("kiwi", "fig", "banana", "pear"));
        System.out.println("By length: " + byLength);

        TreeSet<String> reverse = new TreeSet<>(Comparator.reverseOrder());
        reverse.addAll(List.of("b", "a", "c"));
        System.out.println("Reverse: " + reverse);
    }
}`;

const ex4 = `import java.util.Comparator;
import java.util.TreeSet;

class Student implements Comparable<Student> {
    String name;
    int marks;

    Student(String name, int marks) {
        this.name = name;
        this.marks = marks;
    }

    @Override
    public int compareTo(Student o) {
        return Integer.compare(this.marks, o.marks);
    }

    @Override
    public String toString() {
        return name + ":" + marks;
    }
}

public class Main {
    public static void main(String[] args) {
        TreeSet<Student> set = new TreeSet<>();
        set.add(new Student("Ravi", 80));
        set.add(new Student("Meena", 95));
        set.add(new Student("Kiran", 70));
        set.add(new Student("Sohan", 80));     // same marks as Ravi!
        System.out.println(set);
        System.out.println("Size: " + set.size());

        TreeSet<Student> fixed = new TreeSet<>(
                Comparator.comparingInt((Student s) -> s.marks).thenComparing(s -> s.name));
        fixed.add(new Student("Ravi", 80));
        fixed.add(new Student("Meena", 95));
        fixed.add(new Student("Kiran", 70));
        fixed.add(new Student("Sohan", 80));
        System.out.println(fixed);
        System.out.println("Topper: " + fixed.last());
    }
}`;

export default {
  id: 'day-07-treeset-sortedset-navigableset',
  title: 'TreeSet, SortedSet and NavigableSet',
  module: 'Module 2: Sets, Queues & Maps',
  day: 7,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Use TreeSet to keep unique elements automatically sorted, explore the range and navigation methods of SortedSet and NavigableSet, and control the sort order with Comparable and Comparator.',
  objectives: [
    'Explain how TreeSet stores elements in a Red-Black tree',
    'Use SortedSet methods: first, last, headSet, tailSet, subSet',
    'Use NavigableSet methods: lower, floor, ceiling, higher, pollFirst, pollLast, descendingSet',
    'Sort Strings and custom objects with Comparable and Comparator',
    'Understand that TreeSet uses compareTo/compare, not equals, to detect duplicates',
  ],
  theory: [
    {
      heading: 'TreeSet basics',
      content:
        'TreeSet stores unique elements in sorted order. Internally it is backed by a TreeMap, which is a self-balancing Red-Black tree - like a well-organized library shelf where every new book is immediately placed in its alphabetical spot. Because the tree stays balanced, add, remove and contains take O(log n).',
      points: [
        'Sorted (natural order by default, or by a Comparator you give)',
        'No duplicates - decided by compareTo()/compare() returning 0',
        'null NOT allowed with natural ordering (NullPointerException)',
        'Elements must be Comparable or a Comparator must be supplied, else ClassCastException',
      ],
    },
    {
      heading: 'Hierarchy: SortedSet and NavigableSet',
      content:
        'TreeSet implements NavigableSet, which extends SortedSet, which extends Set. SortedSet (Java 1.2) adds range views and first/last. NavigableSet (Java 6) adds "closest match" searches and reverse views.',
      syntax: `Set -> SortedSet -> NavigableSet -> TreeSet

SortedSet:    first() last() headSet(to) tailSet(from) subSet(from, to) comparator()
NavigableSet: lower(e) floor(e) ceiling(e) higher(e)
              pollFirst() pollLast() descendingSet() descendingIterator()
              headSet(to, inclusive) tailSet(from, inclusive) subSet(from, fi, to, ti)`,
    },
    {
      heading: 'Range views explained with a ruler',
      content:
        'Picture numbers on a ruler. headSet(65) = everything strictly LEFT of 65. tailSet(65) = 65 and everything to the right. subSet(50, 80) = from 50 (inclusive) up to 80 (exclusive). These are live VIEWS: adding to the main set inside the range shows up in the view.',
      points: [
        'lower(x)   -> greatest element  < x',
        'floor(x)   -> greatest element <= x',
        'ceiling(x) -> smallest element >= x',
        'higher(x)  -> smallest element  > x',
        'All four return null if no such element exists',
      ],
      tip: 'Memory trick: floor and ceiling include the value itself (like a room\'s floor and ceiling touch the room); lower and higher are strictly outside.',
    },
    {
      heading: 'Custom ordering: Comparable vs Comparator',
      content:
        'If your class implements Comparable<T>, TreeSet uses its compareTo() (natural order). To sort differently without changing the class, pass a Comparator to the constructor: new TreeSet<>(Comparator.comparing(...)). Full details come on Day 12.',
      syntax: `new TreeSet<>(Comparator.reverseOrder())
new TreeSet<>(String.CASE_INSENSITIVE_ORDER)
new TreeSet<>(Comparator.comparing(String::length).thenComparing(Comparator.naturalOrder()))`,
    },
    {
      heading: 'The big TreeSet gotcha',
      content:
        'TreeSet does not call equals(). If compareTo() returns 0 for two objects, the second is treated as a duplicate and silently ignored - even if the objects are different. Sorting students only by marks will drop a student with the same marks. Always add a tie-breaker (thenComparing).',
    },
    {
      heading: 'HashSet vs LinkedHashSet vs TreeSet',
      content: 'Quick comparison.',
      points: [
        'Order: none / insertion / sorted',
        'Speed: O(1) / O(1) / O(log n)',
        'null: one allowed / one allowed / not allowed',
        'Duplicate check: equals+hashCode / equals+hashCode / compareTo or compare',
        'Backed by: HashMap / LinkedHashMap / TreeMap',
      ],
    },
  ],
  examples: [
    {
      title: 'Sorted unique scores and range views',
      scenario: 'A teacher wants unique scores in sorted order and to see scores below/above a pass mark.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `[40, 55, 65, 72, 90]
first: 40
last: 90
headSet(65): [40, 55]
tailSet(65): [65, 72, 90]
subSet(50, 80): [55, 65, 72]`,
      explanation:
        'The duplicate 90 is removed and values are sorted automatically. headSet excludes 65, tailSet includes 65, subSet includes 50 and excludes 80.',
    },
    {
      title: 'NavigableSet: finding the nearest time slot',
      scenario: 'A doctor has appointment slots at 9, 11, 13, 15 and 17 hours. Find nearest slots around a requested time.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `lower(13): 11
floor(13): 13
ceiling(14): 15
higher(17): null
descendingSet: [17, 15, 13, 11, 9]
pollFirst: 9
pollLast: 17
After polls: [11, 13, 15]
headSet(13, true): [11, 13]`,
      explanation:
        'ceiling(14) finds the earliest slot at or after 14 -> 15. higher(17) is null because nothing is greater than 17. pollFirst/pollLast remove and return the smallest/largest. headSet(13, true) includes 13.',
    },
    {
      title: 'Different orders for Strings',
      scenario: 'Sort fruit names naturally, ignoring case, by length, and in reverse.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Natural: [Apple, apple, banana, cherry]
Ignore case: [Apple, banana, cherry]
By length: [fig, kiwi, pear, banana]
Reverse: [c, b, a]`,
      explanation:
        'Natural String order is by Unicode, so uppercase "A" (65) comes before lowercase "a" (97). With CASE_INSENSITIVE_ORDER, "apple" compares equal to "Apple" and is rejected as a duplicate. By length, kiwi and pear (both 4) are tie-broken alphabetically.',
    },
    {
      title: 'Custom objects and the compareTo() == 0 trap',
      scenario: 'Rank students by marks and see why one student disappears.',
      steps: ['Create Main.java with Student and Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `[Kiran:70, Ravi:80, Meena:95]
Size: 3
[Kiran:70, Ravi:80, Sohan:80, Meena:95]
Topper: Meena:95`,
      explanation:
        'Sohan has the same marks as Ravi, so compareTo returns 0 and TreeSet treats him as a duplicate. The second TreeSet uses a Comparator with a tie-breaker on name, so all four students are kept and last() gives the topper.',
    },
  ],
  interview: [
    { q: 'How does TreeSet work internally?', a: 'It is backed by a TreeMap (a Red-Black tree). Elements are stored as keys with a dummy value. Ordering comes from compareTo() or a supplied Comparator. Operations are O(log n).', level: 'Medium' },
    { q: 'Can TreeSet store null?', a: 'No with natural ordering - add(null) throws NullPointerException because it must call compareTo. A custom Comparator that handles null could allow it, but it is unusual.', level: 'Medium' },
    { q: 'What happens if you add objects that do not implement Comparable to a TreeSet without a Comparator?', a: 'ClassCastException at runtime (when the element is added and compared).', level: 'Medium' },
    { q: 'Difference between floor() and lower()?', a: 'floor(x) returns the greatest element <= x; lower(x) returns the greatest element strictly < x.', level: 'Easy' },
    { q: 'Output? TreeSet<Integer> t = new TreeSet<>(List.of(10,20,30)); System.out.println(t.ceiling(25) + " " + t.higher(30));', a: '30 null', level: 'Medium' },
    { q: 'How does TreeSet decide duplicates?', a: 'Using compareTo()/compare() == 0, not equals(). That is why compareTo should be consistent with equals.', level: 'Hard' },
    { q: 'SortedSet vs NavigableSet?', a: 'SortedSet gives first, last, headSet, tailSet, subSet. NavigableSet extends it with lower, floor, ceiling, higher, pollFirst, pollLast, descendingSet and inclusive/exclusive range versions.', level: 'Medium' },
    { q: 'How do you create a TreeSet in descending order?', a: 'new TreeSet<>(Comparator.reverseOrder()) or call descendingSet() on an existing TreeSet.', level: 'Easy' },
    { q: 'Output? TreeSet<String> t = new TreeSet<>(List.of("b","B","a")); System.out.println(t);', a: '[B, a, b] - uppercase letters have smaller Unicode values than lowercase.', level: 'Medium' },
    { q: 'When would you choose TreeSet over HashSet?', a: 'When you need elements sorted or need range/nearest queries (floor, ceiling, subSet), and can accept O(log n) operations.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Print unique words of a sentence in alphabetical order: "the cat and the dog and the bird".',
      hint: 'Split and add to a TreeSet.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "the cat and the dog and the bird";
        Set<String> words = new TreeSet<>(Arrays.asList(s.split(" ")));
        System.out.println(words); // [and, bird, cat, dog, the]
    }
}`,
    },
    {
      task: 'Given prices {120, 450, 300, 999, 75}, find the cheapest price >= 250 and the costliest price < 250.',
      hint: 'ceiling(250) and lower(250).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> prices = new TreeSet<>(List.of(120, 450, 300, 999, 75));
        System.out.println(prices.ceiling(250)); // 300
        System.out.println(prices.lower(250));   // 120
    }
}`,
    },
    {
      task: 'Find the 3 highest distinct marks from {67, 89, 89, 45, 92, 78, 92}.',
      hint: 'TreeSet with descendingSet() and iterate 3 times.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> t = new TreeSet<>(List.of(67, 89, 89, 45, 92, 78, 92));
        Iterator<Integer> it = t.descendingIterator();
        for (int i = 0; i < 3 && it.hasNext(); i++) System.out.println(it.next());
        // 92, 89, 78
    }
}`,
    },
    {
      task: 'Store Employee(name, salary) in a TreeSet sorted by salary descending, then name; print all.',
      hint: 'Comparator.comparingInt(Employee::salary).reversed().thenComparing(Employee::name) with a record.',
      solution: `import java.util.*;

record Employee(String name, int salary) { }

public class Main {
    public static void main(String[] args) {
        TreeSet<Employee> t = new TreeSet<>(
            Comparator.comparingInt(Employee::salary).reversed().thenComparing(Employee::name));
        t.add(new Employee("Zed", 50000));
        t.add(new Employee("Amy", 70000));
        t.add(new Employee("Bob", 50000));
        t.forEach(System.out::println);
        // Employee[name=Amy, salary=70000]
        // Employee[name=Bob, salary=50000]
        // Employee[name=Zed, salary=50000]
    }
}`,
    },
  ],
  quiz: [
    { question: 'TreeSet is internally backed by:', options: ['HashMap', 'TreeMap', 'ArrayList', 'LinkedHashMap'], answer: 1, explanation: 'TreeSet uses a NavigableMap, by default TreeMap.' },
    { question: 'TreeSet {10, 20, 30}: floor(25) returns', options: ['30', '25', 'null', '20'], answer: 3, explanation: 'Greatest element <= 25 is 20.' },
    { question: 'Adding null to a TreeSet with natural ordering throws:', options: ['NullPointerException', 'ClassCastException', 'IllegalArgumentException', 'Nothing, null is allowed'], answer: 0, explanation: 'compareTo cannot be called on null.' },
    { question: 'Time complexity of add() in TreeSet:', options: ['O(1)', 'O(n)', 'O(log n)', 'O(n log n)'], answer: 2, explanation: 'Balanced Red-Black tree insertion is O(log n).' },
    { question: 'TreeSet {1,2,3,4,5}: subSet(2, 4) returns', options: ['[2, 3, 4]', '[2, 3]', '[3, 4]', '[1, 2, 3, 4]'], answer: 1, explanation: 'from inclusive, to exclusive.' },
  ],
};
