export default {
  lesson: 'day-06-set-hashset-linkedhashset',
  minutes: 20,
  intro: 'Store unique elements with HashSet and LinkedHashSet, de-duplicate custom objects and perform set operations.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'LinkedHashSet: what does this program print?',
      example: {
        title: 'add returns a boolean',
        code: `Set<String> s = new HashSet<>();
s.add("x");   // true
s.add("x");   // false (duplicate)`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> cities = new LinkedHashSet<>();
        cities.add("Pune");
        cities.add("Delhi");
        System.out.println(cities.add("Pune"));
        cities.add("Agra");
        cities.add(null);
        System.out.println(cities);
        System.out.println(cities.size() + " " + cities.contains("Agra"));
        cities.remove("Delhi");
        System.out.println(cities);
    }
}`,
      expected: `false
[Pune, Delhi, Agra, null]
4 true
[Pune, Agra, null]`,
      explain: 'Sets reject duplicates: the second `add("Pune")` returns false. **LinkedHashSet** remembers insertion order (a plain HashSet does not promise any order). HashSet/LinkedHashSet allow one null element.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Set operations and custom objects: what does this program print?',
      example: {
        title: 'copy before changing',
        code: `Set<Integer> union = new TreeSet<>(a);
union.addAll(b);`,
      },
      code: `import java.util.*;

class Point {
    int x, y;
    Point(int x, int y) { this.x = x; this.y = y; }
}

public class Main {
    public static void main(String[] args) {
        Set<Integer> a = new TreeSet<>(List.of(1, 2, 3, 4));
        Set<Integer> b = new TreeSet<>(List.of(3, 4, 5));

        Set<Integer> union = new TreeSet<>(a);
        union.addAll(b);
        Set<Integer> common = new TreeSet<>(a);
        common.retainAll(b);
        Set<Integer> diff = new TreeSet<>(a);
        diff.removeAll(b);
        System.out.println(union + " " + common + " " + diff);

        Set<Point> pts = new HashSet<>();
        pts.add(new Point(1, 2));
        pts.add(new Point(1, 2));
        System.out.println(pts.size());
    }
}`,
      expected: `[1, 2, 3, 4, 5] [3, 4] [1, 2]
2`,
      explain: '`addAll` = union, `retainAll` = intersection, `removeAll` = difference (copy first so the original stays intact). Point does **not override equals() and hashCode()**, so two points with the same x and y are different objects to the HashSet and both are stored.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Remove duplicates from \`List<String> emails\` but **keep the original order**:
\`Set<String> unique = ____;\``,
      example: { title: 'without caring about order', code: 'Set<String> u = new HashSet<>(emails);' },
      accept: ['new LinkedHashSet<>(emails)', 'new LinkedHashSet<String>(emails)'],
      acceptRegex: [
        '^new\\s+LinkedHashSet\\s*<\\s*>\\s*\\(\\s*emails\\s*\\)\\s*[;{]?$',
        '^new\\s+LinkedHashSet\\s*<\\s*String\\s*>\\s*\\(\\s*emails\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Passing the list to the **LinkedHashSet** constructor removes duplicates and keeps first-seen order. HashSet would lose the order, TreeSet would sort it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Internally, a HashSet stores its elements as the **keys** of which class?',
      example: { title: 'what add() does', code: 'map.put(element, PRESENT); // PRESENT is a dummy Object' },
      accept: ['HashMap', 'java.util.HashMap'],
      acceptRegex: ['^HashMap\\s*[;{]?$', '^java\\s*\\.\\s*util\\s*\\.\\s*HashMap\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'HashSet is backed by a **HashMap**: each element is a key and a shared dummy object is the value. So a HashSet inherits HashMap\'s O(1) average add/contains and its reliance on hashCode/equals.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'To make `HashSet<Student>` treat two students with the same roll number as duplicates, what must you do?',
      options: ['Override only equals()', 'Override only hashCode()', 'Override both equals() and hashCode() using roll', 'Implement Comparable'],
      answer: 2,
      explain: 'HashSet first uses **hashCode()** to find the bucket, then **equals()** to compare. Both must be overridden consistently; with only equals, equal objects usually land in different buckets and are never compared.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'HashSet does not guarantee any iteration order',
        'LinkedHashSet keeps insertion order',
        'Set has a get(index) method',
        'HashSet add/contains are O(1) on average',
        'A Set can contain the same element twice if it was added at different times',
      ],
      answers: [0, 1, 3],
      explain: 'Sets have no index-based `get`, and duplicates are never stored. HashSet order depends on hash buckets; LinkedHashSet maintains a linked list of entries in insertion order.',
    },
  ],
};
