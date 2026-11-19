export default {
  lesson: 'day-15-collections-streams-project-interview',
  minutes: 28,
  intro: 'Process collections with streams and Collectors, pick the right collection for each job, and revise interview questions.',
  tasks: [
    {
      type: 'output',
      mins: 5,
      q: 'Library stats with streams: what does this program print?',
      example: {
        title: 'grouping into a sorted map',
        code: 'Collectors.groupingBy(Book::author, TreeMap::new, Collectors.counting())',
      },
      code: `import java.util.*;
import java.util.stream.*;

record Book(String title, String author, double price, boolean issued) {}

public class Main {
    public static void main(String[] args) {
        List<Book> books = List.of(
            new Book("Java Basics", "Rao", 450, true),
            new Book("Spring Boot", "Iyer", 650, false),
            new Book("DSA in Java", "Rao", 550, true),
            new Book("SQL Guide", "Khan", 300, false),
            new Book("Microservices", "Iyer", 700, true));

        Map<String, Long> perAuthor = books.stream()
            .collect(Collectors.groupingBy(Book::author, TreeMap::new, Collectors.counting()));
        System.out.println(perAuthor);

        List<String> top2 = books.stream()
            .sorted(Comparator.comparingDouble(Book::price).reversed())
            .limit(2).map(Book::title).collect(Collectors.toList());
        System.out.println(top2);

        Map<Boolean, Long> status = books.stream()
            .collect(Collectors.partitioningBy(Book::issued, Collectors.counting()));
        System.out.println(status);

        double avg = books.stream().mapToDouble(Book::price).average().orElse(0);
        System.out.println(avg);
    }
}`,
      expected: `{Iyer=2, Khan=1, Rao=2}
[Microservices, Spring Boot]
{false=2, true=3}
530.0`,
      explain: '`groupingBy` with `TreeMap::new` gives authors in sorted order with their counts. Sorting by price descending and `limit(2)` gives the two most expensive titles. `partitioningBy` always has false and true keys. The average of 2650 / 5 is 530.0.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Sort a map by value: what does this program print?',
      example: {
        title: 'streaming map entries',
        code: `map.entrySet().stream()
   .sorted(Map.Entry.comparingByValue())`,
      },
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> sales = new HashMap<>();
        sales.put("Pune", 120);
        sales.put("Delhi", 340);
        sales.put("Agra", 90);
        sales.put("Goa", 210);

        Map<String, Integer> ranked = sales.entrySet().stream()
            .sorted(Map.Entry.<String, Integer>comparingByValue().reversed())
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue,
                                      (a, b) -> a, LinkedHashMap::new));
        System.out.println(ranked);

        String top = ranked.keySet().stream().limit(2).collect(Collectors.joining(" & "));
        System.out.println(top);

        int total = sales.values().stream().mapToInt(Integer::intValue).sum();
        System.out.println(total);
    }
}`,
      expected: `{Delhi=340, Goa=210, Pune=120, Agra=90}
Delhi & Goa
760`,
      explain: 'A HashMap has no order, so we stream its entries, sort by value descending and collect into a **LinkedHashMap** (the 4th argument of toMap) to keep that order. A plain `toMap` would produce a HashMap and lose the sorting. The merge function `(a, b) -> a` is only needed for duplicate keys.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Group \`List<Book> books\` by author into a \`Map<String, List<Book>>\`:
\`Map<String, List<Book>> byAuthor = books.stream().collect(____);\``,
      example: { title: 'grouping and counting', code: 'Collectors.groupingBy(Book::author, Collectors.counting())' },
      accept: [
        'Collectors.groupingBy(Book::author)',
        'Collectors.groupingBy(b -> b.author())',
        'Collectors.groupingBy(Book::getAuthor)',
        'Collectors.groupingBy(b -> b.getAuthor())',
      ],
      acceptRegex: [
        '^Collectors\\s*\\.\\s*groupingBy\\s*\\(\\s*Book\\s*:\\s*:\\s*author\\s*\\)\\s*[;{]?$',
        '^Collectors\\s*\\.\\s*groupingBy\\s*\\(\\s*b\\s*-\\s*>\\s*b\\s*\\.\\s*author\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^Collectors\\s*\\.\\s*groupingBy\\s*\\(\\s*Book\\s*:\\s*:\\s*getAuthor\\s*\\)\\s*[;{]?$',
        '^Collectors\\s*\\.\\s*groupingBy\\s*\\(\\s*b\\s*-\\s*>\\s*b\\s*\\.\\s*getAuthor\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'With only a classifier, `groupingBy` collects each group into a List and returns a HashMap. Add a downstream collector (counting, mapping, summingDouble…) to summarise each group, and a map factory (TreeMap::new) to control order.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Library project: you need to look up a book **by ISBN** instantly and also print books in the order they were added. Which collection fits best?',
      options: ['ArrayList<Book>', 'LinkedHashMap<String, Book>', 'TreeSet<Book>', 'PriorityQueue<Book>'],
      answer: 1,
      explain: 'A Map keyed by ISBN gives O(1) lookup, and **LinkedHashMap** additionally keeps insertion order for printing. An ArrayList would need an O(n) search; TreeSet sorts and needs a comparator; PriorityQueue only gives the smallest element.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview revision: which statements are TRUE? (choose all that apply)',
      options: [
        'ArrayList is backed by an array; LinkedList by doubly linked nodes',
        'HashSet uses a HashMap internally',
        'TreeMap keeps keys sorted and allows a null key with natural ordering',
        'Iterator of ArrayList is fail-fast',
        'ConcurrentHashMap does not allow null keys or values',
        'Collection is a class with static helper methods',
      ],
      answers: [0, 1, 3, 4],
      explain: 'TreeMap with natural ordering throws NullPointerException for a null key. **Collections** (with s) is the utility class; **Collection** is the root interface. The rest are classic correct answers.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You must process support tickets so that the **most urgent** ticket is always handled next. Which collection?',
      options: ['ArrayDeque', 'PriorityQueue with a Comparator on urgency', 'HashSet', 'LinkedList used as a stack'],
      answer: 1,
      explain: 'A **PriorityQueue** keeps the highest-priority element at the head (O(log n) offer/poll). A plain FIFO queue would serve tickets only by arrival time.',
    },
  ],
};
