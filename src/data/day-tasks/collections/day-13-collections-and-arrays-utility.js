export default {
  lesson: 'day-13-collections-and-arrays-utility',
  minutes: 22,
  intro: 'Use the Collections and Arrays helper classes and avoid the Arrays.asList and binarySearch traps.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Collections algorithms: what does this program print?',
      example: { title: 'counting', code: 'Collections.frequency(List.of("a", "b", "a"), "a"); // 2' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(3, 1, 4, 1, 5, 9, 2));
        System.out.println(Collections.frequency(list, 1) + " " + Collections.max(list) + " " + Collections.min(list));
        Collections.sort(list);
        System.out.println(list);
        Collections.reverse(list);
        Collections.swap(list, 0, list.size() - 1);
        System.out.println(list);
        Collections.rotate(list, 2);
        System.out.println(list);
        System.out.println(Collections.nCopies(3, "ab"));
        System.out.println(Collections.disjoint(List.of(1, 2), List.of(3, 4)));
    }
}`,
      expected: `2 9 1
[1, 1, 2, 3, 4, 5, 9]
[1, 5, 4, 3, 2, 1, 9]
[1, 9, 1, 5, 4, 3, 2]
[ab, ab, ab]
true`,
      explain: '`frequency` counts matches (two 1s). After sort → reverse the list is [9, 5, 4, 3, 2, 1, 1]; `swap(0, last)` exchanges 9 and 1. `rotate(list, 2)` moves every element 2 places to the right, wrapping the last two to the front. `nCopies` builds an immutable list of copies and `disjoint` is true when there is no common element.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Arrays helpers and asList traps: what does this program print?',
      example: { title: 'printing arrays', code: 'System.out.println(Arrays.toString(new int[]{1, 2})); // [1, 2]' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] a = {5, 2, 8, 1};
        Arrays.sort(a);
        System.out.println(Arrays.toString(a));
        System.out.println(Arrays.binarySearch(a, 5) + " " + Arrays.binarySearch(a, 3));
        System.out.println(Arrays.toString(Arrays.copyOfRange(a, 1, 3)));

        String[] names = {"Om", "Asha"};
        List<String> view = Arrays.asList(names);
        view.set(0, "Ravi");
        System.out.println(names[0]);
        try {
            view.add("Meena");
        } catch (UnsupportedOperationException e) {
            System.out.println("cannot add");
        }
        System.out.println(Arrays.asList(new int[]{1, 2, 3}).size());
    }
}`,
      expected: `[1, 2, 5, 8]
2 -3
[2, 5]
Ravi
cannot add
1`,
      explain: '`binarySearch` on the sorted array finds 5 at index 2; for a missing value it returns `-(insertionPoint) - 1` = −3 (3 would go at index 2). `Arrays.asList` is a **fixed-size view** backed by the array: `set` writes through to the array, but `add`/`remove` throw. Passing an `int[]` gives a List with **one** element (the array itself) — use `Integer[]` or `IntStream`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Return a **read-only view** of \`List<String> items\` so callers cannot modify it:
\`return ____;\``,
      example: { title: 'a thread-safe wrapper', code: 'List<String> safe = Collections.synchronizedList(new ArrayList<>());' },
      accept: ['Collections.unmodifiableList(items)', 'List.copyOf(items)'],
      acceptRegex: ['^Collections\\s*\\.\\s*unmodifiableList\\s*\\(\\s*items\\s*\\)\\s*[;{]?$', '^List\\s*\\.\\s*copyOf\\s*\\(\\s*items\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Collections.unmodifiableList` wraps the list: callers get UnsupportedOperationException on changes, but it is a **view**, so changes to the original are still visible. `List.copyOf` makes a true immutable copy.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Print a 2D array \`int[][] grid\` in readable form like \`[[1, 2], [3, 4]]\`:
\`System.out.println(____);\``,
      example: { title: '1D arrays', code: 'System.out.println(Arrays.toString(row));' },
      accept: ['Arrays.deepToString(grid)'],
      acceptRegex: ['^Arrays\\s*\\.\\s*deepToString\\s*\\(\\s*grid\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Arrays.toString` on a 2D array prints the inner arrays\' addresses (e.g. `[I@1b6d3586`). `deepToString` recurses into nested arrays; similarly use `deepEquals` to compare them.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is required before calling `Collections.binarySearch(list, key)`?',
      options: [
        'Nothing',
        'The list must be sorted in the same order used for the search',
        'The list must be a LinkedList',
        'The key must be the first element',
      ],
      answer: 1,
      explain: 'Binary search halves a **sorted** range each step. On an unsorted list the result is undefined (often wrong). Sort first with the same Comparator, or use `indexOf` for unsorted data.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which method fills every slot of `int[] scores` with −1?',
      options: ['Arrays.setAll(scores, -1)', 'Arrays.fill(scores, -1)', 'Collections.fill(scores, -1)', 'scores.fill(-1)'],
      answer: 1,
      explain: '`Arrays.fill(array, value)` sets every element. `Collections.fill(list, value)` does the same for Lists. `Arrays.setAll` takes a function of the index, e.g. `Arrays.setAll(a, i -> i * i)`.',
    },
  ],
};
