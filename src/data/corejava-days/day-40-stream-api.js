const ex1 = `import java.util.List;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(5, 12, 7, 20, 3, 12, 8);

        List<Integer> evens = nums.stream()
                .filter(n -> n % 2 == 0)        // intermediate
                .collect(Collectors.toList());  // terminal
        System.out.println("Evens: " + evens);

        List<Integer> doubled = nums.stream().map(n -> n * 2).toList();   // Java 16+
        System.out.println("Doubled: " + doubled);

        List<Integer> top3 = nums.stream()
                .distinct()
                .sorted((a, b) -> b - a)
                .limit(3)
                .toList();
        System.out.println("Top 3 distinct: " + top3);

        System.out.println("Count > 6: " + nums.stream().filter(n -> n > 6).count());
        System.out.println("Original unchanged: " + nums);
    }
}`;

const ex2 = `import java.util.List;
import java.util.Optional;
import java.util.stream.IntStream;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(4, 9, 2, 7);

        int sum = nums.stream().reduce(0, (a, b) -> a + b);
        int product = nums.stream().reduce(1, (a, b) -> a * b);
        Optional<Integer> max = nums.stream().reduce(Integer::max);
        System.out.println("Sum: " + sum);
        System.out.println("Product: " + product);
        System.out.println("Max: " + max.get());

        System.out.println("mapToInt sum: " + nums.stream().mapToInt(Integer::intValue).sum());
        System.out.println("Average: " + nums.stream().mapToInt(i -> i).average().getAsDouble());
        System.out.println("Min: " + nums.stream().min(Integer::compare).get());

        System.out.println("anyMatch > 8: " + nums.stream().anyMatch(n -> n > 8));
        System.out.println("allMatch > 1: " + nums.stream().allMatch(n -> n > 1));
        System.out.println("noneMatch < 0: " + nums.stream().noneMatch(n -> n < 0));
        System.out.println("findFirst even: " + nums.stream().filter(n -> n % 2 == 0).findFirst().get());

        System.out.println("Sum 1..100: " + IntStream.rangeClosed(1, 100).sum());
        String squares = IntStream.range(1, 6).map(i -> i * i)
                .collect(StringBuilder::new, (sb, i) -> sb.append(i).append(' '), StringBuilder::append)
                .toString().trim();
        System.out.println("Squares: " + squares);
    }
}`;

const ex3 = `import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

record Employee(String name, String dept, double salary) { }

public class Main {
    public static void main(String[] args) {
        List<Employee> emps = List.of(
                new Employee("Riya", "IT", 70000),
                new Employee("Aman", "HR", 40000),
                new Employee("Zoya", "IT", 90000),
                new Employee("Kabir", "Sales", 50000),
                new Employee("Neha", "HR", 45000));

        // groupingBy into a TreeMap so keys print in sorted order
        Map<String, List<String>> namesByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::dept, TreeMap::new,
                        Collectors.mapping(Employee::name, Collectors.toList())));
        System.out.println("Names by dept: " + namesByDept);

        Map<String, Long> countByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.counting()));
        System.out.println("Count by dept: " + countByDept);

        Map<String, Double> avgByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::dept, TreeMap::new,
                        Collectors.averagingDouble(Employee::salary)));
        System.out.println("Avg salary: " + avgByDept);

        Map<Boolean, Long> highEarners = emps.stream()
                .collect(Collectors.partitioningBy(e -> e.salary() >= 50000, Collectors.counting()));
        System.out.println("Earning >= 50000: " + highEarners);

        String sortedNames = emps.stream()
                .sorted(Comparator.comparingDouble(Employee::salary).reversed())
                .map(Employee::name)
                .collect(Collectors.joining(", ", "[", "]"));
        System.out.println("By salary desc: " + sortedNames);

        Employee top = emps.stream().max(Comparator.comparingDouble(Employee::salary)).get();
        System.out.println("Highest paid: " + top.name());
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.function.Function;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class Main {
    public static void main(String[] args) {
        String text = "java is fun and java is powerful";

        Map<String, Long> wordCount = Arrays.stream(text.split(" "))
                .collect(Collectors.groupingBy(Function.identity(), TreeMap::new, Collectors.counting()));
        System.out.println("Word count: " + wordCount);

        List<List<Integer>> nested = List.of(List.of(1, 2), List.of(3, 4), List.of(5));
        List<Integer> flat = nested.stream().flatMap(List::stream).toList();
        System.out.println("flatMap: " + flat);

        String firstNonRepeated = text.replace(" ", "").chars()
                .mapToObj(c -> String.valueOf((char) c))
                .collect(Collectors.groupingBy(Function.identity(),
                        java.util.LinkedHashMap::new, Collectors.counting()))
                .entrySet().stream()
                .filter(e -> e.getValue() == 1)
                .map(Map.Entry::getKey)
                .findFirst().orElse("none");
        System.out.println("First non-repeated char: " + firstNonRepeated);

        List<String> dupes = Stream.of("a", "b", "a", "c", "b")
                .collect(Collectors.groupingBy(s -> s, TreeMap::new, Collectors.counting()))
                .entrySet().stream()
                .filter(e -> e.getValue() > 1)
                .map(Map.Entry::getKey)
                .toList();
        System.out.println("Duplicates: " + dupes);

        // Laziness: nothing runs until a terminal operation
        Stream<String> lazy = Stream.of("x", "y").peek(s -> System.out.println("peek " + s));
        System.out.println("Stream created, nothing printed yet");
        System.out.println("Count: " + lazy.map(String::toUpperCase).collect(Collectors.toList()).size());

        System.out.println("Iterate: " + Stream.iterate(1, n -> n * 2).limit(6).toList());
    }
}`;

export default {
  id: 'day-40-stream-api',
  title: 'Stream API: filter, map, reduce, collect, sorted, groupingBy',
  module: 'Module 7: Java 8+ Features',
  day: 40,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'The Stream API processes collections in a declarative, pipeline style: describe WHAT you want (filter, transform, aggregate) instead of HOW to loop. Learn stream creation, intermediate and terminal operations, reduce, Collectors, groupingBy, partitioningBy and flatMap.',
  objectives: [
    'Explain what a stream is and how it differs from a collection',
    'Build pipelines with filter, map, distinct, sorted, limit, skip and flatMap',
    'Use terminal operations: forEach, collect, reduce, count, min/max, match and find',
    'Group and summarise data with Collectors.groupingBy, partitioningBy, counting, joining',
    'Understand laziness, single-use streams and primitive streams',
  ],
  theory: [
    {
      heading: 'What is a Stream?',
      content: 'A stream is a sequence of elements that flows through a pipeline of operations, like water flowing through filters in a purifier: dirty water (source) -> filter sand (filter) -> add minerals (map) -> fill bottle (collect). A stream does NOT store data and does NOT change the source collection; it produces a new result.',
      points: [
        'Collection = stores data (a water tank). Stream = computes on data (water flowing through pipes)',
        'Pipeline = Source -> zero or more Intermediate operations -> one Terminal operation',
        'Streams are lazy: intermediate operations run only when a terminal operation is called',
        'A stream can be consumed only ONCE; reusing it throws IllegalStateException',
        'Declarative code: less boilerplate, easy to read, easy to parallelise (parallelStream())',
      ],
      syntax: `list.stream()                 // from a collection
Arrays.stream(array)          // from an array
Stream.of("a", "b", "c")      // from values
IntStream.range(1, 5)         // 1,2,3,4  (rangeClosed includes 5)
Stream.iterate(1, n -> n * 2) // infinite, use limit()
"hello".chars()               // IntStream of characters`,
    },
    {
      heading: 'Intermediate Operations (return a Stream)',
      content: 'Intermediate operations transform a stream into another stream. They are lazy — they only build the recipe.',
      points: [
        'filter(Predicate) — keep elements that match',
        'map(Function) — transform each element (e.g. String -> length)',
        'flatMap(Function<T, Stream<R>>) — flatten nested structures (List<List<T>> -> Stream<T>)',
        'distinct() — remove duplicates (uses equals/hashCode)',
        'sorted() / sorted(Comparator) — sort natural or custom',
        'limit(n), skip(n) — take first n / skip first n',
        'peek(Consumer) — look at elements for debugging',
        'mapToInt / mapToDouble — convert to primitive streams with sum(), average()',
      ],
    },
    {
      heading: 'Terminal Operations (produce a result)',
      content: 'A terminal operation starts the processing and closes the stream. After it, the stream cannot be used again.',
      points: [
        'forEach(Consumer) — perform an action for each element',
        'collect(Collector) — gather into List, Set, Map, String, etc.; toList() (Java 16) returns an unmodifiable list',
        'reduce(identity, BinaryOperator) — combine all elements into one (sum, product, max)',
        'count(), min(Comparator), max(Comparator)',
        'anyMatch, allMatch, noneMatch — return boolean; short-circuit',
        'findFirst(), findAny() — return Optional',
      ],
      syntax: `int sum = list.stream().reduce(0, (a, b) -> a + b);   // identity 0
Optional<Integer> max = list.stream().reduce(Integer::max); // no identity -> Optional`,
    },
    {
      heading: 'Collectors: toList, toMap, joining, groupingBy, partitioningBy',
      content: 'Collectors is a utility class of ready-made recipes for collect(). groupingBy is like the SQL GROUP BY: it puts elements into buckets based on a key, like sorting letters into post boxes by city. partitioningBy is a special groupingBy with only two buckets: true and false.',
      syntax: `Collectors.toList(), toSet(), toMap(keyFn, valueFn)
Collectors.joining(", ", "[", "]")
Collectors.groupingBy(Employee::dept)                         // Map<String, List<Employee>>
Collectors.groupingBy(Employee::dept, Collectors.counting())  // Map<String, Long>
Collectors.groupingBy(Employee::dept, TreeMap::new, Collectors.averagingDouble(Employee::salary))
Collectors.partitioningBy(e -> e.salary() > 50000)           // Map<Boolean, List<Employee>>
Collectors.mapping(Employee::name, Collectors.toList())        // downstream transform`,
      tip: 'groupingBy returns a HashMap by default, so the key order can look random. Pass TreeMap::new (sorted) or LinkedHashMap::new (insertion order) when you print results.',
    },
    {
      heading: 'Best Practices and Common Mistakes',
      content: 'Streams make code elegant, but misuse makes it slow or buggy.',
      points: [
        'Do not modify the source collection inside a stream (ConcurrentModificationException or wrong results)',
        'Avoid side effects in map/filter; use collect instead of adding to an external list in forEach',
        'Reusing a stream: "stream has already been operated upon or closed"',
        'toMap throws IllegalStateException on duplicate keys — pass a merge function (a, b) -> a',
        'parallelStream helps only for large CPU-heavy data; it can be slower for small lists',
        'Use primitive streams (IntStream) to avoid boxing for numeric work',
      ],
    },
  ],
  examples: [
    {
      title: 'filter, map, distinct, sorted, limit and collect',
      scenario: 'Process a list of scores: keep even scores, double all scores, and find the top 3 distinct scores.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the stream pipelines', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Evens: [12, 20, 12, 8]
Doubled: [10, 24, 14, 40, 6, 24, 16]
Top 3 distinct: [20, 12, 8]
Count > 6: 5
Original unchanged: [5, 12, 7, 20, 3, 12, 8]`,
      explanation: 'filter keeps order and duplicates. distinct removes the second 12, sorted with (b - a) gives descending order, and limit(3) keeps the first three. Numbers > 6 are 12, 7, 20, 12, 8 = 5. The source list is never modified.',
    },
    {
      title: 'reduce, Numeric Streams and Matching',
      scenario: 'Compute statistics on order quantities and check conditions quickly.',
      steps: ['Create Main.java', 'Use reduce, mapToInt, anyMatch/allMatch and IntStream', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Sum: 22
Product: 504
Max: 9
mapToInt sum: 22
Average: 5.5
Min: 2
anyMatch > 8: true
allMatch > 1: true
noneMatch < 0: true
findFirst even: 4
Sum 1..100: 5050
Squares: 1 4 9 16 25`,
      explanation: 'reduce(0, +) adds all values: 4+9+2+7 = 22; product = 504. reduce without identity returns Optional because the stream might be empty. IntStream gives sum() and average() directly. range(1, 6) excludes 6.',
    },
    {
      title: 'groupingBy, partitioningBy and joining on Employees',
      scenario: 'An HR report groups employees by department, counts them, averages salaries and lists names by salary.',
      steps: ['Create Main.java with an Employee record', 'Use Collectors.groupingBy with TreeMap::new for a sorted report', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Names by dept: {HR=[Aman, Neha], IT=[Riya, Zoya], Sales=[Kabir]}
Count by dept: {HR=2, IT=2, Sales=1}
Avg salary: {HR=42500.0, IT=80000.0, Sales=50000.0}
Earning >= 50000: {false=2, true=3}
By salary desc: [Zoya, Riya, Kabir, Neha, Aman]
Highest paid: Zoya`,
      explanation: 'groupingBy(key, TreeMap::new, downstream) builds a sorted map, and the downstream collector (mapping, counting, averagingDouble) summarises each group. partitioningBy always has false and true keys. comparingDouble(...).reversed() sorts by salary descending.',
    },
    {
      title: 'Interview Favourites: Word Count, flatMap, Duplicates, Laziness',
      scenario: 'Solve common stream interview questions on strings and nested lists.',
      steps: ['Create Main.java', 'Run ▶ and observe that peek prints only after the terminal operation'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Word count: {and=1, fun=1, is=2, java=2, powerful=1}
flatMap: [1, 2, 3, 4, 5]
First non-repeated char: d
Duplicates: [a, b]
Stream created, nothing printed yet
peek x
peek y
Count: 2
Iterate: [1, 2, 4, 8, 16, 32]`,
      explanation: 'Function.identity() groups each word by itself; TreeMap sorts the words. For the first non-repeated character, spaces are removed and LinkedHashMap keeps the order of first appearance: j, a, v, i, s, f, u, n all appear at least twice, so the first character with count 1 is d (from "and"). The peek messages appear only after the terminal collect() starts, proving streams are lazy.',
    },
  ],
  interview: [
    { q: 'What is a Stream in Java 8?', a: 'A sequence of elements supporting functional-style aggregate operations in a pipeline. It does not store data, does not modify the source and is lazily evaluated.', level: 'Easy' },
    { q: 'Difference between Collection and Stream?', a: 'Collection stores data and can be iterated many times (external iteration). Stream computes on data, is consumed once, uses internal iteration and is lazy.', level: 'Easy' },
    { q: 'Intermediate vs terminal operations?', a: 'Intermediate operations (filter, map, sorted) return a Stream and are lazy. Terminal operations (collect, forEach, reduce, count) produce a result and trigger execution.', level: 'Easy' },
    { q: 'map() vs flatMap()?', a: 'map transforms each element into exactly one element. flatMap transforms each element into a stream and flattens all of them into one stream (e.g. List<List<Integer>> to Stream<Integer>).', level: 'Medium' },
    { q: 'What is the output? List.of(1,2,3,4).stream().filter(n -> n > 1).map(n -> n * 10).reduce(0, Integer::sum)', a: '90 (20 + 30 + 40).', level: 'Easy' },
    { q: 'Can a stream be reused?', a: 'No. After a terminal operation the stream is closed; reusing throws IllegalStateException: stream has already been operated upon or closed.', level: 'Medium' },
    { q: 'What does groupingBy return by default?', a: 'A Map<K, List<T>>, implemented as a HashMap. Pass a map factory (TreeMap::new) and a downstream collector (counting(), mapping(), averagingX) to customise.', level: 'Medium' },
    { q: 'groupingBy vs partitioningBy?', a: 'partitioningBy splits by a Predicate into exactly two groups (true/false) and always contains both keys. groupingBy uses any classifier function and can have many keys.', level: 'Medium' },
    { q: 'findFirst vs findAny?', a: 'findFirst returns the first element in encounter order. findAny may return any element, which is faster in parallel streams.', level: 'Medium' },
    { q: 'What happens if Collectors.toMap finds duplicate keys?', a: 'It throws IllegalStateException (Duplicate key). Provide a merge function: toMap(k, v, (a, b) -> a).', level: 'Hard' },
    { q: 'Collectors.toList() vs Stream.toList()?', a: 'Stream.toList() (Java 16) returns an unmodifiable list. Collectors.toList() returns a mutable list (currently ArrayList) with no guarantee on type.', level: 'Hard' },
    { q: 'When should you use parallel streams?', a: 'For large datasets with CPU-intensive, independent, stateless operations. Avoid for small data, I/O, ordered operations or shared mutable state.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Given a list of names, print names starting with "A" in uppercase, sorted alphabetically.',
      hint: 'filter(n -> n.startsWith("A")).map(String::toUpperCase).sorted()',
      solution: `import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = List.of("Aman", "Riya", "Arjun", "Bob", "Anu");
        names.stream()
             .filter(n -> n.startsWith("A"))
             .map(String::toUpperCase)
             .sorted()
             .forEach(System.out::println);  // AMAN ANU ARJUN
    }
}`,
    },
    {
      task: 'Find the second highest number in a list using streams.',
      hint: 'distinct, sort descending, skip(1), findFirst.',
      solution: `import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = List.of(10, 40, 30, 40, 20);
        int second = nums.stream()
                .distinct()
                .sorted(Comparator.reverseOrder())
                .skip(1)
                .findFirst()
                .orElseThrow();
        System.out.println("Second highest: " + second); // 30
    }
}`,
    },
    {
      task: 'Given a list of Product(name, category, price) records, print the total price per category in sorted category order.',
      hint: 'groupingBy(Product::category, TreeMap::new, summingDouble(Product::price))',
      solution: `import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

record Product(String name, String category, double price) { }

public class Main {
    public static void main(String[] args) {
        List<Product> items = List.of(
            new Product("Pen", "Stationery", 10),
            new Product("Phone", "Electronics", 15000),
            new Product("Book", "Stationery", 250),
            new Product("Charger", "Electronics", 800));
        Map<String, Double> total = items.stream()
            .collect(Collectors.groupingBy(Product::category, TreeMap::new,
                     Collectors.summingDouble(Product::price)));
        System.out.println(total); // {Electronics=15800.0, Stationery=260.0}
    }
}`,
    },
    {
      task: 'Convert a list of words into a Map of word -> length, keeping insertion order, ignoring duplicate words.',
      hint: 'toMap(w -> w, String::length, (a, b) -> a, LinkedHashMap::new)',
      solution: `import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class Main {
    public static void main(String[] args) {
        List<String> words = List.of("java", "stream", "java", "api");
        Map<String, Integer> m = words.stream()
            .collect(Collectors.toMap(w -> w, String::length, (a, b) -> a, LinkedHashMap::new));
        System.out.println(m); // {java=4, stream=6, api=3}
    }
}`,
    },
    {
      task: 'Using IntStream, print all prime numbers between 1 and 30 as a comma-separated string.',
      hint: 'rangeClosed(2, 30).filter(isPrime).mapToObj(String::valueOf).collect(joining(", "))',
      solution: `import java.util.stream.Collectors;
import java.util.stream.IntStream;

public class Main {
    static boolean isPrime(int n) {
        return n > 1 && IntStream.rangeClosed(2, (int) Math.sqrt(n)).noneMatch(i -> n % i == 0);
    }
    public static void main(String[] args) {
        String primes = IntStream.rangeClosed(1, 30)
            .filter(Main::isPrime)
            .mapToObj(String::valueOf)
            .collect(Collectors.joining(", "));
        System.out.println(primes); // 2, 3, 5, 7, 11, 13, 17, 19, 23, 29
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which is a terminal operation?', options: ['filter', 'map', 'collect', 'sorted'], answer: 2, explanation: 'collect produces a result and ends the stream.' },
    { question: 'What does flatMap do?', options: ['Sorts a stream', 'Flattens a stream of streams/collections into one stream', 'Removes duplicates', 'Converts a stream to a map'], answer: 1, explanation: 'flatMap maps each element to a stream and concatenates them.' },
    { question: 'Output of Stream.of(1,2,3).reduce(10, Integer::sum)?', options: ['6', '10', '60', '16'], answer: 3, explanation: 'Identity 10 + 1 + 2 + 3 = 16.' },
    { question: 'What happens when a stream is reused after a terminal operation?', options: ['IllegalStateException', 'It restarts from the beginning', 'Returns empty results', 'Compile error'], answer: 0, explanation: 'Streams are single-use.' },
    { question: 'Which collector splits elements into exactly two groups?', options: ['groupingBy', 'partitioningBy', 'joining', 'toMap'], answer: 1, explanation: 'partitioningBy uses a Predicate: keys true and false.' },
  ],
};
