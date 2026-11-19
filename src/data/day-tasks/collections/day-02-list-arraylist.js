export default {
  lesson: 'day-02-list-arraylist',
  minutes: 20,
  intro: 'Use ArrayList methods, understand its internal dynamic array, and avoid the remove(int) vs remove(Object) trap.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'remove(int) vs remove(Object): what does this program print?',
      example: {
        title: 'index-based methods',
        code: `list.get(0);        // first element
list.set(1, "X");   // replace, returns the old value`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(10, 20, 30, 40));
        System.out.println(list.remove(1));
        System.out.println(list);
        System.out.println(list.remove(Integer.valueOf(30)));
        list.add(1, 99);
        System.out.println(list.set(0, 5));
        System.out.println(list);
        System.out.println(list.indexOf(40) + " " + list.contains(99));
    }
}`,
      expected: `20
[10, 30, 40]
true
10
[5, 99, 40]
2 true`,
      explain: 'With an `int` argument, `remove(1)` removes **index 1** (the value 20) and returns it. `remove(Integer.valueOf(30))` removes the **value** 30 and returns true. `add(1, 99)` inserts and shifts the rest right, and `set` returns the value it replaced (10).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'removeIf with a condition', code: 'nums.removeIf(n -> n < 0); // drop all negatives' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> fruits = new ArrayList<>(List.of("mango", "banana", "apple", "blueberry", "kiwi"));
        fruits.removeIf(f -> f.startsWith("b"));
        Collections.sort(fruits);
        for (int i = 0; i < fruits.size(); i++) {
            System.out.println((i + 1) + ". " + fruits.get(i));
        }
        System.out.println(fruits.subList(1, 3));
    }
}`,
      expected: `1. apple
2. kiwi
3. mango
[kiwi, mango]`,
      explain: '`removeIf` drops banana and blueberry. Sorting gives apple, kiwi, mango. `subList(1, 3)` is a view of indexes 1 and 2 (end excluded): [kiwi, mango].',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the expression that reads the **last** element of `List<String> list`.',
      example: { title: 'first element', code: 'String first = list.get(0);' },
      accept: ['list.get(list.size() - 1)', 'list.getLast()'],
      acceptRegex: [
        '^list\\s*\\.\\s*get\\s*\\(\\s*list\\s*\\.\\s*size\\s*\\(\\s*\\)\\s*-\\s*1\\s*\\)\\s*[;{]?$',
        '^list\\s*\\.\\s*getLast\\s*\\(\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Lists are 0-indexed, so the last index is `size() - 1`. Note it is `size()` for collections, `length` for arrays and `length()` for Strings. Java 21 also added `getLast()`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create an empty, resizable list of student names, programming to the interface:
\`List<String> names = ____;\``,
      example: { title: 'a list with initial values', code: 'List<Integer> nums = new ArrayList<>(List.of(1, 2, 3));' },
      accept: ['new ArrayList<>()', 'new ArrayList<String>()'],
      acceptRegex: ['^new\\s+ArrayList\\s*<\\s*>\\s*\\(\\s*\\)\\s*[;{]?$', '^new\\s+ArrayList\\s*<\\s*String\\s*>\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`new ArrayList<>()` uses the diamond operator so the type is inferred. Declaring the variable as `List` lets you switch to LinkedList later without changing other code. `List.of()` would be **immutable**, so you could not add to it.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An ArrayList created with `new ArrayList<>()` is full with 10 elements and you add one more. What happens internally?',
      options: [
        'It throws an exception',
        'A new array about 1.5 times bigger (15) is created and the elements are copied',
        'The array size doubles to 20',
        'A linked node is added',
      ],
      answer: 1,
      explain: 'ArrayList is backed by an array (default capacity 10). When it is full, it allocates a new array of `old + old/2` (1.5×) and copies the elements. This is why adding is **amortised O(1)**, and why you can pass an initial capacity when you know the size.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about ArrayList are TRUE? (choose all that apply)',
      options: [
        'get(index) is O(1)',
        'It allows duplicates and null',
        'Inserting at index 0 is O(n) because elements shift',
        'It is synchronized (thread-safe)',
        'It keeps insertion order',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Random access is fast because of the backing array, while inserting/removing in the middle shifts elements (O(n)). ArrayList is **not** synchronized; Vector is (or use Collections.synchronizedList / CopyOnWriteArrayList).',
    },
  ],
};
