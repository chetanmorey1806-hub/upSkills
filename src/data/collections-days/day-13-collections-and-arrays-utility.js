const ex1 = `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(5, 3, 8, 3, 1));

        Collections.sort(nums);
        System.out.println("sort: " + nums);
        System.out.println("binarySearch(5): " + Collections.binarySearch(nums, 5));
        System.out.println("frequency of 3: " + Collections.frequency(nums, 3));

        Collections.reverse(nums);
        System.out.println("reverse: " + nums);
        Collections.swap(nums, 0, 4);
        System.out.println("swap(0,4): " + nums);
        Collections.rotate(nums, 2);
        System.out.println("rotate(2): " + nums);
        System.out.println("max: " + Collections.max(nums) + ", min: " + Collections.min(nums));

        Collections.addAll(nums, 9, 10);
        System.out.println("addAll: " + nums);

        List<String> stars = new ArrayList<>(Collections.nCopies(3, "*"));
        System.out.println("nCopies: " + stars);
        Collections.fill(stars, "#");
        System.out.println("fill: " + stars);

        System.out.println("disjoint: " + Collections.disjoint(List.of(1, 2), List.of(3, 4)));
    }
}`;

const ex2 = `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> base = new ArrayList<>(List.of("A", "B"));
        List<String> readOnly = Collections.unmodifiableList(base);
        try {
            readOnly.add("C");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify readOnly");
        }
        base.add("C");                                  // change the original
        System.out.println("readOnly sees: " + readOnly);

        List<String> copy = List.copyOf(base);          // true snapshot
        base.add("D");
        System.out.println("copyOf: " + copy);

        List<Integer> sync = Collections.synchronizedList(new ArrayList<>());
        sync.add(1);
        sync.add(2);
        synchronized (sync) {                           // lock while iterating
            for (int x : sync) {
                System.out.println("sync item " + x);
            }
        }

        System.out.println("emptyList: " + Collections.emptyList());
        System.out.println("singletonList: " + Collections.singletonList("only"));
    }
}`;

const ex3 = `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {7, 2, 9, 4};
        System.out.println(Arrays.toString(a));
        Arrays.sort(a);
        System.out.println("sorted: " + Arrays.toString(a));
        System.out.println("binarySearch(7): " + Arrays.binarySearch(a, 7));
        System.out.println("binarySearch(5): " + Arrays.binarySearch(a, 5));

        int[] b = Arrays.copyOf(a, 6);
        System.out.println("copyOf: " + Arrays.toString(b));
        int[] c = Arrays.copyOfRange(a, 1, 3);
        System.out.println("copyOfRange: " + Arrays.toString(c));

        int[] d = new int[4];
        Arrays.fill(d, 5);
        System.out.println("fill: " + Arrays.toString(d));

        System.out.println("equals: " + Arrays.equals(a, new int[]{2, 4, 7, 9}));

        int[][] grid = {{1, 2}, {3, 4}};
        System.out.println("deepToString: " + Arrays.deepToString(grid));
        System.out.println("sum: " + Arrays.stream(a).sum());
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String[] arr = {"x", "y", "z"};
        List<String> view = Arrays.asList(arr);
        view.set(0, "X");                               // writes through to the array
        System.out.println(Arrays.toString(arr));
        try {
            view.add("w");
        } catch (UnsupportedOperationException e) {
            System.out.println("asList cannot grow");
        }

        int[] prim = {1, 2, 3};
        List<int[]> wrong = Arrays.asList(prim);        // ONE element: the array itself
        System.out.println("asList(int[]) size: " + wrong.size());

        List<Integer> right = Arrays.stream(prim).boxed().toList();
        System.out.println("boxed list: " + right);

        Integer[] boxed = {1, 2, 3};
        System.out.println("asList(Integer[]) size: " + Arrays.asList(boxed).size());
    }
}`;

export default {
  id: 'day-13-collections-and-arrays-utility',
  title: 'Collections Utility Class and Arrays Class',
  module: 'Module 3: Sorting, Utilities & Advanced',
  day: 13,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Use the two big helper classes of java.util: Collections (algorithms and wrappers for collections) and Arrays (sorting, searching, copying and printing arrays), and learn their common traps.',
  objectives: [
    'Use Collections algorithms: sort, reverse, swap, rotate, shuffle, max, min, frequency, binarySearch, fill, nCopies, disjoint',
    'Create read-only and synchronized wrappers and understand they are views',
    'Use Arrays methods: toString, sort, binarySearch, copyOf, copyOfRange, fill, equals, deepToString, asList, stream',
    'Avoid the Arrays.asList and binarySearch pitfalls',
  ],
  theory: [
    {
      heading: 'The Collections class',
      content:
        'java.util.Collections is a toolbox of static methods for collections - like a Swiss army knife you use on any List or Set. You never create an object of it (its constructor is private).',
      syntax: `sort(list) / sort(list, cmp)   reverse(list)   shuffle(list) / shuffle(list, rnd)
swap(list, i, j)   rotate(list, d)   fill(list, v)   copy(dest, src)
max(coll) / min(coll) [, cmp]   frequency(coll, o)   disjoint(c1, c2)
binarySearch(sortedList, key)   nCopies(n, v)   addAll(coll, a, b, c)
reverseOrder() / reverseOrder(cmp)`,
      tip: 'binarySearch only works correctly on a list sorted in the same order; otherwise the result is undefined.',
    },
    {
      heading: 'Wrapper factories: unmodifiable, synchronized, empty, singleton',
      content:
        'Collections.unmodifiableList(list) returns a read-only VIEW: you cannot change it through the view, but changes made to the original list are visible - like a glass window over a shop: customers can look but not touch, while the shopkeeper can still rearrange. For a real frozen copy use List.copyOf(list) (Java 10+).',
      points: [
        'unmodifiableList / Set / Map / Collection -> read-only views',
        'synchronizedList / Set / Map -> thread-safe wrappers (one lock); synchronize manually while iterating',
        'emptyList(), emptyMap(), emptySet() -> shared immutable empty collections (safe to return instead of null)',
        'singletonList(x), singleton(x), singletonMap(k, v) -> immutable single-element collections',
        'checkedList(list, String.class) -> runtime type checking',
      ],
    },
    {
      heading: 'The Arrays class',
      content:
        'java.util.Arrays does for arrays what Collections does for collections.',
      syntax: `Arrays.toString(arr)        Arrays.deepToString(arr2D)
Arrays.sort(arr) / sort(arr, from, to) / sort(objArr, cmp)
Arrays.binarySearch(sortedArr, key)   // -(insertionPoint) - 1 if not found
Arrays.copyOf(arr, newLen)  Arrays.copyOfRange(arr, from, to)
Arrays.fill(arr, v)         Arrays.equals(a, b)  Arrays.deepEquals(a, b)
Arrays.asList(T...)         Arrays.stream(arr)   Arrays.hashCode(arr)`,
      points: [
        'Arrays.sort on primitives uses Dual-Pivot Quicksort (not stable, does not matter for primitives); on objects uses TimSort (stable)',
        'Printing an array directly shows something like [I@1b6d3586 - always use Arrays.toString',
        'arr1.equals(arr2) compares references; use Arrays.equals for contents',
      ],
    },
    {
      heading: 'Arrays.asList traps',
      content:
        'Arrays.asList returns a fixed-size list backed by the original array. set() writes into the array; add()/remove() throw UnsupportedOperationException. With a primitive array like int[], asList treats the WHOLE array as one element, giving List<int[]> of size 1. Use Integer[] or Arrays.stream(prim).boxed().toList().',
    },
    {
      heading: 'Which helper to reach for?',
      content: 'Quick lookup guide.',
      points: [
        'Print an array -> Arrays.toString / deepToString',
        'Array to modifiable list -> new ArrayList<>(Arrays.asList(arr))',
        'Sort descending -> Collections.sort(list, Collections.reverseOrder()) or Arrays.sort(objArr, Collections.reverseOrder())',
        'Count occurrences -> Collections.frequency',
        'Return "nothing" from a method -> Collections.emptyList() / List.of()',
        'Protect internal list from callers -> Collections.unmodifiableList or List.copyOf',
      ],
    },
  ],
  examples: [
    {
      title: 'Collections algorithms tour',
      scenario: 'Apply the most used Collections methods to a list of numbers and watch each change.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶ and trace each line'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `sort: [1, 3, 3, 5, 8]
binarySearch(5): 3
frequency of 3: 2
reverse: [8, 5, 3, 3, 1]
swap(0,4): [1, 5, 3, 3, 8]
rotate(2): [3, 8, 1, 5, 3]
max: 8, min: 1
addAll: [3, 8, 1, 5, 3, 9, 10]
nCopies: [*, *, *]
fill: [#, #, #]
disjoint: true`,
      explanation:
        'rotate(list, 2) moves the element at index i to index (i + 2) % size, so the last two elements wrap to the front. nCopies returns an immutable list, so we copy it into an ArrayList before fill(). disjoint is true because the lists share no element.',
    },
    {
      title: 'Read-only views, snapshots and synchronized wrappers',
      scenario: 'Expose a list to other code safely, and understand view vs copy.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Cannot modify readOnly
readOnly sees: [A, B, C]
copyOf: [A, B, C]
sync item 1
sync item 2
emptyList: []
singletonList: [only]`,
      explanation:
        'The unmodifiable view blocks add() but still shows "C" added to the original. List.copyOf takes an independent snapshot, so the later "D" does not appear. For synchronized lists you must lock on the list while iterating.',
    },
    {
      title: 'Arrays class tour',
      scenario: 'Print, sort, search, copy, fill and compare arrays.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `[7, 2, 9, 4]
sorted: [2, 4, 7, 9]
binarySearch(7): 2
binarySearch(5): -3
copyOf: [2, 4, 7, 9, 0, 0]
copyOfRange: [4, 7]
fill: [5, 5, 5, 5]
equals: true
deepToString: [[1, 2], [3, 4]]
sum: 22`,
      explanation:
        '5 is not present; it would be inserted at index 2, so binarySearch returns -(2) - 1 = -3. copyOf pads with default 0 values. copyOfRange(1, 3) copies indexes 1 and 2.',
    },
    {
      title: 'Arrays.asList pitfalls',
      scenario: 'See write-through behaviour, fixed size and the primitive-array trap.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `[X, y, z]
asList cannot grow
asList(int[]) size: 1
boxed list: [1, 2, 3]
asList(Integer[]) size: 3`,
      explanation:
        'view.set(0, "X") changed the original array. add() is not supported on a fixed-size list. Arrays.asList(int[]) creates a List<int[]> with one element; boxing each int (or using Integer[]) gives the expected list.',
    },
  ],
  interview: [
    { q: 'Difference between Collection, Collections, Array and Arrays?', a: 'Collection: root interface of lists/sets/queues. Collections: utility class for collections. Array: language-level fixed-size container. Arrays: utility class for arrays.', level: 'Easy' },
    { q: 'What does Collections.unmodifiableList return? Is it immutable?', a: 'A read-only view. Modifications through it throw UnsupportedOperationException, but changes to the underlying list are visible, so it is not truly immutable. List.copyOf gives an immutable copy.', level: 'Medium' },
    { q: 'What does Arrays.binarySearch return when the key is missing?', a: '-(insertionPoint) - 1, a negative number telling where the key would be inserted.', level: 'Medium' },
    { q: 'Output? int[] a = {1,2,3}; System.out.println(Arrays.asList(a).size());', a: '1. The int[] itself becomes the single element of a List<int[]>.', level: 'Hard' },
    { q: 'Why can you not add to a list returned by Arrays.asList?', a: 'It is a fixed-size list backed by the array (java.util.Arrays$ArrayList); add/remove throw UnsupportedOperationException. Wrap it: new ArrayList<>(Arrays.asList(...)).', level: 'Medium' },
    { q: 'Which sort algorithm does Java use?', a: 'Arrays.sort for primitives: Dual-Pivot Quicksort. For objects and Collections.sort: TimSort (stable, hybrid merge/insertion sort), O(n log n).', level: 'Hard' },
    { q: 'How do you make an ArrayList thread-safe?', a: 'Collections.synchronizedList(new ArrayList<>()) (lock manually during iteration) or use CopyOnWriteArrayList for read-mostly scenarios.', level: 'Easy' },
    { q: 'Why return Collections.emptyList() instead of null?', a: 'It avoids NullPointerException for callers, lets them loop directly, and is a shared immutable instance so it costs no memory.', level: 'Easy' },
    { q: 'Output? List<Integer> l = new ArrayList<>(List.of(1,2,3,4)); Collections.rotate(l, 1); System.out.println(l);', a: '[4, 1, 2, 3]. Each element moves one step right; the last wraps to the front.', level: 'Medium' },
    { q: 'How to compare two arrays for equal content?', a: 'Arrays.equals(a, b) for 1D and Arrays.deepEquals(a, b) for nested arrays. a.equals(b) only compares references.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Given marks {45, 78, 45, 90, 62, 45}, print how many times 45 appears and the highest mark using Collections.',
      hint: 'Collections.frequency and Collections.max on a List<Integer>.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> marks = List.of(45, 78, 45, 90, 62, 45);
        System.out.println(Collections.frequency(marks, 45)); // 3
        System.out.println(Collections.max(marks));          // 90
    }
}`,
    },
    {
      task: 'Write a method that returns an unmodifiable view of a class\'s internal list, and show the caller cannot add to it.',
      hint: 'return Collections.unmodifiableList(items);',
      solution: `import java.util.*;

class Cart {
    private final List<String> items = new ArrayList<>();
    void add(String s) { items.add(s); }
    List<String> getItems() { return Collections.unmodifiableList(items); }
}

public class Main {
    public static void main(String[] args) {
        Cart c = new Cart();
        c.add("Pen");
        try {
            c.getItems().add("Hack");
        } catch (UnsupportedOperationException e) {
            System.out.println("Blocked");
        }
        System.out.println(c.getItems()); // [Pen]
    }
}`,
    },
    {
      task: 'Sort an int array {9, 4, 7, 1} and then search for 7 and 5 using Arrays.binarySearch. Print both results.',
      hint: 'Sorted array is [1, 4, 7, 9]; 5 would go at index 2.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {9, 4, 7, 1};
        Arrays.sort(a);
        System.out.println(Arrays.binarySearch(a, 7)); // 2
        System.out.println(Arrays.binarySearch(a, 5)); // -3
    }
}`,
    },
    {
      task: 'Merge two arrays {1, 3, 5} and {2, 4} into one sorted array using Arrays.copyOf and System.arraycopy.',
      hint: 'copyOf(a, a.length + b.length) then arraycopy(b, 0, result, a.length, b.length), then sort.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 3, 5}, b = {2, 4};
        int[] r = Arrays.copyOf(a, a.length + b.length);
        System.arraycopy(b, 0, r, a.length, b.length);
        Arrays.sort(r);
        System.out.println(Arrays.toString(r)); // [1, 2, 3, 4, 5]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Collections.frequency(List.of(1,2,1,1), 1) returns:', options: ['1', '2', '4', '3'], answer: 3, explanation: '1 appears three times.' },
    { question: 'Arrays.asList(new int[]{1,2,3}).size() is:', options: ['1', '3', '0', 'Compile error'], answer: 0, explanation: 'The whole int[] becomes a single element.' },
    { question: 'Arrays.binarySearch on [10, 20, 30] for 25 returns:', options: ['2', '-2', '-3', '-1'], answer: 2, explanation: 'Insertion point 2 -> -(2) - 1 = -3.' },
    { question: 'Which gives a truly independent read-only copy?', options: ['Collections.unmodifiableList(l)', 'List.copyOf(l)', 'Collections.synchronizedList(l)', 'Arrays.asList(l)'], answer: 1, explanation: 'List.copyOf creates an immutable snapshot; unmodifiableList is only a view.' },
    { question: 'To print an int[] nicely you use:', options: ['System.out.println(arr)', 'arr.toString()', 'Arrays.toString(arr)', 'Collections.toString(arr)'], answer: 2, explanation: 'Arrays.toString prints elements like [1, 2, 3].' },
  ],
};
