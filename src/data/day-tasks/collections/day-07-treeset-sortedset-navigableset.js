export default {
  lesson: 'day-07-treeset-sortedset-navigableset',
  minutes: 20,
  intro: 'Keep unique elements sorted with TreeSet, use range and navigation methods, and control order with comparators.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'NavigableSet methods: what does this program print?',
      example: { title: 'TreeSet sorts automatically', code: 'new TreeSet<>(List.of(5, 1, 3)); // [1, 3, 5]' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> marks = new TreeSet<>(List.of(72, 45, 90, 60, 45, 85));
        System.out.println(marks);
        System.out.println(marks.first() + " " + marks.last());
        System.out.println(marks.floor(80) + " " + marks.ceiling(80));
        System.out.println(marks.lower(60) + " " + marks.higher(90));
        System.out.println(marks.headSet(72) + " " + marks.tailSet(72));
        System.out.println(marks.subSet(50, 86));
        System.out.println(marks.descendingSet());
    }
}`,
      expected: `[45, 60, 72, 85, 90]
45 90
72 85
45 null
[45, 60] [72, 85, 90]
[60, 72, 85]
[90, 85, 72, 60, 45]`,
      explain: 'Duplicates vanish and the values are sorted. floor = greatest ≤ 80 (72), ceiling = smallest ≥ 80 (85), lower/higher are strict, and `higher(90)` returns **null** because nothing is bigger. `headSet(72)` excludes 72, `tailSet(72)` includes it, and `subSet(50, 86)` is from 50 (inclusive) to 86 (exclusive).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'The TreeSet gotcha: what does this program print?',
      example: {
        title: 'TreeSet uses compare(), not equals()',
        text: 'If the comparator returns 0, TreeSet treats the two elements as duplicates — even if equals() says they differ.',
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> byLength = new TreeSet<>(Comparator.comparingInt(String::length));
        byLength.add("Pune");
        byLength.add("Goa");
        byLength.add("Agra");
        byLength.add("Delhi");
        System.out.println(byLength);
        System.out.println(byLength.size());

        Set<String> desc = new TreeSet<>(Comparator.reverseOrder());
        desc.addAll(List.of("mango", "apple", "kiwi"));
        System.out.println(desc);
    }
}`,
      expected: `[Goa, Pune, Delhi]
3
[mango, kiwi, apple]`,
      explain: '"Agra" has the same length as "Pune", so the comparator returns 0 and TreeSet **silently drops** it. Use `thenComparing(Comparator.naturalOrder())` to break ties. `Comparator.reverseOrder()` sorts Strings Z → A.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a TreeSet of Integers sorted from **largest to smallest**:
\`TreeSet<Integer> scores = ____;\``,
      example: { title: 'natural (ascending) order', code: 'TreeSet<Integer> asc = new TreeSet<>();' },
      accept: [
        'new TreeSet<>(Comparator.reverseOrder())',
        'new TreeSet<>(Collections.reverseOrder())',
        'new TreeSet<Integer>(Comparator.reverseOrder())',
        'new TreeSet<>((a, b) -> b - a)',
        'new TreeSet<>((a, b) -> b.compareTo(a))',
      ],
      acceptRegex: [
        '^new\\s+TreeSet\\s*<\\s*>\\s*\\(\\s*Comparator\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+TreeSet\\s*<\\s*>\\s*\\(\\s*Collections\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+TreeSet\\s*<\\s*Integer\\s*>\\s*\\(\\s*Comparator\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+TreeSet\\s*<\\s*>\\s*\\(\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*-\\s*a\\s*\\)\\s*[;{]?$',
        '^new\\s+TreeSet\\s*<\\s*>\\s*\\(\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*\\.\\s*compareTo\\s*\\(\\s*a\\s*\\)\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Pass a Comparator to the constructor. `Comparator.reverseOrder()` (or `Collections.reverseOrder()`) flips the natural order. Alternatively keep it ascending and use `descendingSet()`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Remove and return the **smallest** element of \`TreeSet<Integer> queue\`:
\`Integer min = queue.____;\``,
      example: { title: 'the largest', code: 'Integer max = queue.pollLast();' },
      accept: ['pollFirst()'],
      acceptRegex: ['^pollFirst\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`pollFirst()` removes and returns the lowest element (null if empty); `first()` only reads it and throws if empty.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens with `new TreeSet<String>().add(null)`?',
      options: ['null is stored first', 'null is stored last', 'NullPointerException, because TreeSet must compare elements', 'It is ignored'],
      answer: 2,
      explain: 'TreeSet calls `compareTo` on elements, and null cannot be compared, so natural-order TreeSets throw **NullPointerException**. HashSet and LinkedHashSet allow one null.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the time complexity of `add`, `remove` and `contains` in a TreeSet?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 1,
      explain: 'TreeSet is a **Red-Black tree** (a self-balancing BST), so operations are O(log n). That is slower than HashSet\'s O(1) average, the price of keeping elements sorted.',
    },
  ],
};
