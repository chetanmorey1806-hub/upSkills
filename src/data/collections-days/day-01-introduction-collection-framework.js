export default {
  id: 'day-01-introduction-collection-framework',
  title: 'Introduction to Collection Framework, Hierarchy, Collection vs Collections, Arrays vs Collections',
  module: 'Module 1: Collections Basics & Lists',
  day: 1,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand why Java needs a Collection Framework, how its interfaces and classes are arranged, and the difference between Collection, Collections and plain arrays.',
  objectives: [
    'Explain what the Java Collection Framework (JCF) is and why it exists',
    'Draw the hierarchy: Iterable > Collection > List / Set / Queue, and the separate Map family',
    'Differentiate Collection (interface) from Collections (utility class)',
    'Compare arrays with collections and choose the right one',
    'Use common Collection methods: add, remove, contains, size, isEmpty, addAll, clear',
  ],
  theory: [
    {
      heading: 'What is the Collection Framework?',
      content:
        'A collection is simply an object that holds a group of other objects, like a school bag that holds many books. The Java Collection Framework (package java.util) is a ready-made set of interfaces (rules), classes (implementations) and algorithms (sorting, searching) for storing and processing groups of objects. Before Java 1.2 we only had arrays, Vector and Hashtable, and each had different method names. JCF (added in Java 1.2) gave one common, consistent design.',
      points: [
        'Interfaces: List, Set, Queue, Deque, Map - they define WHAT operations are allowed',
        'Implementations: ArrayList, LinkedList, HashSet, TreeSet, HashMap, ... - they define HOW data is stored',
        'Algorithms: Collections.sort(), Collections.max(), binarySearch() ... - reusable logic',
        'Collections store only objects. Primitives like int are auto-boxed to Integer',
      ],
      tip: 'Think of an interface as a job description ("must be able to add, remove, search") and a class as the person hired to do that job in their own way.',
    },
    {
      heading: 'Collection Hierarchy (diagram in words)',
      content:
        'At the very top is Iterable (anything you can loop over with for-each). Below it is the Collection interface. Collection has three main child interfaces: List (ordered, allows duplicates), Set (no duplicates) and Queue (process in an order, usually first-in-first-out). Map is NOT a child of Collection because it stores key=value pairs instead of single elements, but it is still part of the framework.',
      syntax: `Iterable
  └── Collection
        ├── List   -> ArrayList, LinkedList, Vector -> Stack
        ├── Set    -> HashSet -> LinkedHashSet
        │           └ SortedSet -> NavigableSet -> TreeSet
        └── Queue  -> PriorityQueue
                    └ Deque -> ArrayDeque, LinkedList

Map (separate root)
  ├── HashMap -> LinkedHashMap
  ├── Hashtable
  └── SortedMap -> NavigableMap -> TreeMap`,
      points: [
        'List: index based, ordered, duplicates allowed (like a playlist)',
        'Set: unique elements only (like roll numbers in a class)',
        'Queue: waiting line (like a ticket counter queue)',
        'Map: key -> value lookup (like a phone book: name -> number)',
      ],
    },
    {
      heading: 'Collection vs Collections',
      content:
        'These two names look alike but are completely different. Collection (singular) is an INTERFACE - the root of List, Set and Queue. Collections (plural, with s) is a final UTILITY CLASS full of static helper methods such as sort, reverse, shuffle, max, min, unmodifiableList and synchronizedList.',
      points: [
        'Collection -> interface, java.util.Collection, you create objects of its implementations',
        'Collections -> class, java.util.Collections, you call its static methods directly: Collections.sort(list)',
        'Similar pair: Array (language feature) vs Arrays (utility class with Arrays.sort, Arrays.toString)',
      ],
      tip: 'Interview trick: "Collection is a container idea, Collections is a toolbox."',
    },
    {
      heading: 'Arrays vs Collections',
      content:
        'An array is fixed in size once created. If you create int[5] you can never store a 6th value without creating a new array and copying. Collections grow and shrink automatically and come with built-in methods. Arrays, however, can store primitives directly and are slightly faster and lighter.',
      points: [
        'Size: Array is fixed; Collection is dynamic (grows automatically)',
        'Data type: Array can hold primitives and objects; Collection holds only objects (int becomes Integer)',
        'Methods: Array has only .length; Collection has add, remove, contains, sort and more',
        'Type safety: both are type safe when you use generics (List<String>)',
        'Performance: Array is faster for fixed-size primitive data; Collections are more flexible',
      ],
    },
    {
      heading: 'Important methods of the Collection interface',
      content:
        'Every List, Set and Queue gets these methods because they all implement Collection. Learn them once and use them everywhere.',
      syntax: `boolean add(E e)              boolean remove(Object o)
boolean contains(Object o)     int size()
boolean isEmpty()             void clear()
boolean addAll(Collection c)  boolean removeAll(Collection c)
boolean retainAll(Collection c) Object[] toArray()
Iterator<E> iterator()        Stream<E> stream()`,
      points: [
        'Always use generics: Collection<String> c = new ArrayList<>(); otherwise you get raw types and ClassCastException risks',
        'Program to the interface: List<String> list = new ArrayList<>(); lets you change the implementation later',
      ],
    },
    {
      heading: 'Common mistakes beginners make',
      content: 'Avoid these from day one.',
      points: [
        'Writing List<int> - not allowed. Use List<Integer>',
        'Confusing Collection with Collections in imports and method calls',
        'Thinking Map extends Collection - it does not',
        'Using raw types (List list = new ArrayList();) - compiler warnings and runtime errors',
      ],
    },
  ],
  examples: [
    {
      title: 'Array vs ArrayList',
      scenario: 'A teacher stores marks first in a fixed array, then in an ArrayList that can grow when a new student joins.',
      steps: [
        'In IntelliJ: File > New > Project > Java, then right-click src > New > Java Class > Main',
        'In Eclipse: File > New > Java Project, then New > Class > Main (tick public static void main)',
        'Type the code and click Run ▶',
      ],
      code: `import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] marks = new int[3];
        marks[0] = 70;
        marks[1] = 85;
        marks[2] = 90;
        System.out.println("Array length: " + marks.length);
        System.out.println("Array: " + Arrays.toString(marks));

        ArrayList<Integer> list = new ArrayList<>();
        list.add(70);
        list.add(85);
        list.add(90);
        list.add(60);          // grows automatically
        System.out.println("List size: " + list.size());
        System.out.println("List: " + list);
        list.remove(Integer.valueOf(85)); // remove by value
        System.out.println("After remove: " + list);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.ArrayList;
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] marks = new int[3];
        marks[0] = 70;
        marks[1] = 85;
        marks[2] = 90;
        System.out.println("Array length: " + marks.length);
        System.out.println("Array: " + Arrays.toString(marks));

        ArrayList<Integer> list = new ArrayList<>();
        list.add(70);
        list.add(85);
        list.add(90);
        list.add(60);          // grows automatically
        System.out.println("List size: " + list.size());
        System.out.println("List: " + list);
        list.remove(Integer.valueOf(85)); // remove by value
        System.out.println("After remove: " + list);
    }
}`,
        },
      },
      result: `Array length: 3
Array: [70, 85, 90]
List size: 4
List: [70, 85, 90, 60]
After remove: [70, 90, 60]`,
      explanation:
        'The array has a fixed length of 3, so a 4th mark is impossible without a new array. The ArrayList grows to 4 elements automatically. list.remove(Integer.valueOf(85)) removes the VALUE 85; list.remove(85) would try to remove INDEX 85 and throw IndexOutOfBoundsException.',
    },
    {
      title: 'Common Collection interface methods',
      scenario: 'A fruit shop keeps a collection of fruit names and uses the basic Collection methods.',
      steps: ['Create class Main', 'Type the code', 'Run and compare each printed line with the method used'],
      code: `import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Collection<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Mango");
        fruits.add("Banana");
        System.out.println(fruits);
        System.out.println("Contains Mango? " + fruits.contains("Mango"));

        fruits.addAll(List.of("Grapes", "Apple"));
        System.out.println(fruits);

        fruits.removeAll(List.of("Apple"));
        System.out.println(fruits);
        System.out.println("Size: " + fruits.size());

        fruits.clear();
        System.out.println("Empty? " + fruits.isEmpty());
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        Collection<String> fruits = new ArrayList<>();
        fruits.add("Apple");
        fruits.add("Mango");
        fruits.add("Banana");
        System.out.println(fruits);
        System.out.println("Contains Mango? " + fruits.contains("Mango"));

        fruits.addAll(List.of("Grapes", "Apple"));
        System.out.println(fruits);

        fruits.removeAll(List.of("Apple"));
        System.out.println(fruits);
        System.out.println("Size: " + fruits.size());

        fruits.clear();
        System.out.println("Empty? " + fruits.isEmpty());
    }
}`,
        },
      },
      result: `[Apple, Mango, Banana]
Contains Mango? true
[Apple, Mango, Banana, Grapes, Apple]
[Mango, Banana, Grapes]
Size: 3
Empty? true`,
      explanation:
        'addAll appends every element of the given collection. removeAll removes ALL occurrences of every element present in the argument, so both "Apple" entries disappear. clear() empties the collection and isEmpty() then returns true.',
    },
    {
      title: 'Collection vs Collections in action',
      scenario: 'Use the Collections utility class to sort, find max/min and reverse a list of numbers.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(40, 10, 30, 20));
        System.out.println("Original: " + nums);
        Collections.sort(nums);
        System.out.println("Sorted: " + nums);
        System.out.println("Max: " + Collections.max(nums));
        System.out.println("Min: " + Collections.min(nums));
        Collections.reverse(nums);
        System.out.println("Reversed: " + nums);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(40, 10, 30, 20));
        System.out.println("Original: " + nums);
        Collections.sort(nums);
        System.out.println("Sorted: " + nums);
        System.out.println("Max: " + Collections.max(nums));
        System.out.println("Min: " + Collections.min(nums));
        Collections.reverse(nums);
        System.out.println("Reversed: " + nums);
    }
}`,
        },
      },
      result: `Original: [40, 10, 30, 20]
Sorted: [10, 20, 30, 40]
Max: 40
Min: 10
Reversed: [40, 30, 20, 10]`,
      explanation:
        'nums is a Collection (a List). Collections is the helper class whose static methods work on it. We wrap List.of(...) in new ArrayList<>(...) because List.of returns an unmodifiable list that cannot be sorted in place.',
    },
    {
      title: 'List vs Set vs Map with the same data',
      scenario: 'A list of subject names entered by students contains repeats. See how List, Set and Map each treat it.',
      steps: ['Create class Main', 'Type the code', 'Run ▶ and observe duplicates'],
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] words = {"java", "sql", "java", "html", "sql"};

        List<String> list = new ArrayList<>(Arrays.asList(words));
        Set<String> set = new LinkedHashSet<>(Arrays.asList(words));
        Map<String, Integer> count = new LinkedHashMap<>();
        for (String w : words) {
            count.put(w, count.getOrDefault(w, 0) + 1);
        }

        System.out.println("List: " + list);
        System.out.println("Set: " + set);
        System.out.println("Map: " + count);
    }
}`,
      java: {
        files: {
          'Main.java': `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] words = {"java", "sql", "java", "html", "sql"};

        List<String> list = new ArrayList<>(Arrays.asList(words));
        Set<String> set = new LinkedHashSet<>(Arrays.asList(words));
        Map<String, Integer> count = new LinkedHashMap<>();
        for (String w : words) {
            count.put(w, count.getOrDefault(w, 0) + 1);
        }

        System.out.println("List: " + list);
        System.out.println("Set: " + set);
        System.out.println("Map: " + count);
    }
}`,
        },
      },
      result: `List: [java, sql, java, html, sql]
Set: [java, sql, html]
Map: {java=2, sql=2, html=1}`,
      explanation:
        'The List keeps everything including duplicates. The Set keeps only unique values (LinkedHashSet also remembers insertion order). The Map stores word -> count pairs (LinkedHashMap keeps insertion order so output is predictable).',
    },
  ],
  interview: [
    { q: 'What is the Collection Framework in Java?', a: 'A unified architecture in java.util consisting of interfaces (List, Set, Queue, Map), implementations (ArrayList, HashSet, HashMap ...) and algorithms (sort, search) for storing and manipulating groups of objects. Introduced in Java 1.2.', level: 'Easy' },
    { q: 'Difference between Collection and Collections?', a: 'Collection is the root interface of List, Set and Queue. Collections is a final utility class with static methods like sort(), reverse(), max(), synchronizedList() and unmodifiableList().', level: 'Easy' },
    { q: 'Why does Map not extend Collection?', a: 'Collection deals with single elements (add(E)), while Map deals with key-value pairs (put(K,V)). Their method contracts are incompatible, so Map is a separate hierarchy, though still part of the framework.', level: 'Medium' },
    { q: 'Arrays vs Collections - give 4 differences.', a: 'Arrays are fixed-size, can store primitives, have no built-in methods except length, and are faster. Collections are dynamic in size, store only objects (wrapper types), provide rich methods (add, remove, contains, sort) and support generics and iteration utilities.', level: 'Easy' },
    { q: 'What is the root interface of the Collection hierarchy?', a: 'Collection is the root of the collection hierarchy, but it itself extends Iterable, which is the true top-most interface (enables for-each loop).', level: 'Medium' },
    { q: 'Can we store primitive int in an ArrayList?', a: 'Not directly. We must use the wrapper Integer: List<Integer>. Autoboxing converts int to Integer automatically when you call add(5).', level: 'Easy' },
    { q: 'What is the output? List<Integer> l = new ArrayList<>(List.of(10,20,30)); l.remove(1); System.out.println(l);', a: '[10, 30]. remove(1) with an int argument removes by INDEX, so index 1 (value 20) is removed. To remove the value 1 use remove(Integer.valueOf(1)).', level: 'Medium' },
    { q: 'Why should we write List<String> list = new ArrayList<>() instead of ArrayList<String> list = new ArrayList<>()?', a: 'Programming to the interface. Code depends only on the List contract, so you can switch to LinkedList later by changing one line. It also makes methods accept any List.', level: 'Medium' },
    { q: 'Name the three main child interfaces of Collection.', a: 'List (ordered, duplicates allowed), Set (unique elements), Queue (elements processed in order, usually FIFO). Deque extends Queue.', level: 'Easy' },
    { q: 'What happens with raw types like List list = new ArrayList();?', a: 'The compiler gives unchecked warnings, any Object can be added, and you need casts while reading, which can cause ClassCastException at runtime. Always use generics.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create an ArrayList of 5 city names, print it, print its size, check whether "Pune" is present, then remove the first city and print again.',
      hint: 'Use add(), size(), contains() and remove(0).',
      solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> cities = new ArrayList<>();
        cities.add("Mumbai");
        cities.add("Pune");
        cities.add("Delhi");
        cities.add("Chennai");
        cities.add("Kolkata");
        System.out.println(cities);
        System.out.println("Size: " + cities.size());
        System.out.println("Has Pune? " + cities.contains("Pune"));
        cities.remove(0);
        System.out.println(cities);
    }
}`,
    },
    {
      task: 'Convert an int array {5, 3, 9, 1} into a List<Integer>, sort it with Collections.sort and print max and min.',
      hint: 'Loop over the array and add each element (autoboxing), then use Collections.sort/max/min.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 3, 9, 1};
        List<Integer> list = new ArrayList<>();
        for (int x : arr) list.add(x);
        Collections.sort(list);
        System.out.println(list);                 // [1, 3, 5, 9]
        System.out.println(Collections.max(list)); // 9
        System.out.println(Collections.min(list)); // 1
    }
}`,
    },
    {
      task: 'Given two lists A = [1,2,3,4] and B = [3,4,5], print their common elements using retainAll.',
      hint: 'Copy A into a new ArrayList first so A is not changed.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> a = List.of(1, 2, 3, 4);
        List<Integer> b = List.of(3, 4, 5);
        List<Integer> common = new ArrayList<>(a);
        common.retainAll(b);
        System.out.println(common); // [3, 4]
    }
}`,
    },
    {
      task: 'Remove duplicates from {"red","blue","red","green","blue"} while keeping the original order.',
      hint: 'A LinkedHashSet removes duplicates and keeps insertion order.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] colors = {"red", "blue", "red", "green", "blue"};
        Set<String> unique = new LinkedHashSet<>(Arrays.asList(colors));
        System.out.println(unique); // [red, blue, green]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which of these is a utility class with static methods?', options: ['Collection', 'Collections', 'List', 'Iterable'], answer: 1, explanation: 'Collections (plural) is a final class with static helpers like sort() and max().' },
    { question: 'Which interface is NOT a sub-interface of Collection?', options: ['List', 'Set', 'Queue', 'Map'], answer: 3, explanation: 'Map is a separate hierarchy because it stores key-value pairs.' },
    { question: 'Which statement about arrays is true?', options: ['Arrays are fixed in size', 'Arrays grow automatically', 'Arrays cannot store primitives', 'Arrays have an add() method'], answer: 0, explanation: 'Once created, an array length cannot change.' },
    { question: 'What does List<Integer> l = new ArrayList<>(List.of(5,6,7)); l.remove(0); print when you print l?', options: ['[5, 6, 7]', '[5, 7]', '[6, 7]', 'Exception'], answer: 2, explanation: 'remove(0) removes the element at index 0, which is 5.' },
    { question: 'Which interface lets an object be used in a for-each loop?', options: ['Comparable', 'Cloneable', 'Iterable', 'Serializable'], answer: 2, explanation: 'Any class implementing Iterable can be used in the enhanced for loop.' },
  ],
};
