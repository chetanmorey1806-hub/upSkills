export default {
  lesson: 'day-01-introduction-collection-framework',
  minutes: 18,
  intro: 'Check the Collection hierarchy, Collection vs Collections, arrays vs collections, and the core Collection methods.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Core Collection methods: what does this program print?',
      example: {
        title: 'adding and checking',
        code: `Collection<String> c = new ArrayList<>();
c.add("Pen");
System.out.println(c.contains("Pen")); // true`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Collection<String> skills = new ArrayList<>();
        skills.add("Java");
        skills.add("SQL");
        skills.add("Java");
        System.out.println(skills + " " + skills.size());
        skills.remove("Java");
        System.out.println(skills);
        skills.addAll(List.of("React", "Git"));
        System.out.println(skills.contains("SQL") + " " + skills.size());
        skills.clear();
        System.out.println(skills.isEmpty());
    }
}`,
      expected: `[Java, SQL, Java] 3
[SQL, Java]
true 4
true`,
      explain: 'An ArrayList keeps insertion order and allows duplicates. `remove(Object)` deletes only the **first** matching element. `addAll` adds every element of another collection, and `clear()` empties it, so `isEmpty()` is true.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Collections that grow: what does this program print?',
      example: {
        title: 'a utility method of Collections',
        code: `List<Integer> l = new ArrayList<>(List.of(3, 1, 2));
Collections.sort(l); // [1, 2, 3]`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] fixed = new int[3];
        List<Integer> squares = new ArrayList<>();
        for (int i = 1; i <= 5; i++) {
            squares.add(i * i);
        }
        System.out.println(fixed.length + " " + squares.size());
        System.out.println(squares);
        System.out.println(Collections.max(squares));
        Collections.reverse(squares);
        System.out.println(squares);
    }
}`,
      expected: `3 5
[1, 4, 9, 16, 25]
25
[25, 16, 9, 4, 1]`,
      explain: 'An array has a **fixed** length (3 here, even though nothing was stored). An ArrayList grows automatically as you add. `Collections.max` and `Collections.reverse` are static helpers from the **Collections** utility class.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the call that sorts \`List<String> names\` alphabetically using the utility class:
\`____;\``,
      example: { title: 'another utility method', code: 'Collections.shuffle(cards);' },
      accept: ['Collections.sort(names)', 'names.sort(null)', 'names.sort(Comparator.naturalOrder())'],
      acceptRegex: [
        '^Collections\\s*\\.\\s*sort\\s*\\(\\s*names\\s*\\)\\s*[;{]?$',
        '^names\\s*\\.\\s*sort\\s*\\(\\s*null\\s*\\)\\s*[;{]?$',
        '^names\\s*\\.\\s*sort\\s*\\(\\s*Comparator\\s*\\.\\s*naturalOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`Collections` (with s) is a utility class full of static methods like sort, reverse, max and shuffle. `Collection` (without s) is the root **interface** of List, Set and Queue — a favourite interview question.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which interface sits at the **very top** of the collection hierarchy (it is what makes the for-each loop work)?',
      example: { title: 'the chain', text: '???? → Collection → List / Set / Queue' },
      accept: ['Iterable', 'java.lang.Iterable'],
      acceptRegex: ['^Iterable\\s*[;{]?$', '^java\\s*\\.\\s*lang\\s*\\.\\s*Iterable\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Iterable` (java.lang) is the root: it provides `iterator()`, which the enhanced for loop uses. `Collection` extends Iterable, and List, Set and Queue extend Collection.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement about **Map** is correct?',
      options: [
        'Map extends Collection',
        'Map is part of the Collection Framework but does NOT extend the Collection interface',
        'Map extends List',
        'Map is a legacy class',
      ],
      answer: 1,
      explain: 'Map stores **key-value pairs**, so it does not fit the single-element `add(E)` model of Collection. It is a separate branch of the framework (HashMap, LinkedHashMap, TreeMap).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Arrays vs collections: which statements are TRUE? (choose all that apply)',
      options: [
        'Arrays can store primitives directly; collections store objects (wrappers)',
        'Collections can grow and shrink dynamically',
        'An array\'s size can be changed after creation',
        'Collections come with ready-made methods like contains, remove and sort',
        'ArrayList<int> is valid',
      ],
      answers: [0, 1, 3],
      explain: 'Arrays are fixed-size but can hold primitives. Collections resize themselves and provide many methods, but only hold objects, so you write `ArrayList<Integer>` (autoboxing does the conversion).',
    },
  ],
};
