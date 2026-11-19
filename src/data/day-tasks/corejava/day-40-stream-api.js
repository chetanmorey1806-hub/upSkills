export default {
  lesson: 'day-40-stream-api',
  minutes: 25,
  intro: 'Build stream pipelines with filter, map, sorted, reduce and collect, and group data with Collectors.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Stream pipeline: what does this program print?',
      example: {
        title: 'filter + map + collect',
        code: `List.of(1, 2, 3, 4).stream()
    .filter(n -> n % 2 == 0)
    .map(n -> n * 10)
    .toList();   // [20, 40]`,
      },
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> marks = List.of(45, 82, 67, 91, 38, 82, 74);
        List<Integer> top = marks.stream()
                .filter(m -> m >= 60)
                .distinct()
                .sorted(Comparator.reverseOrder())
                .limit(3)
                .collect(Collectors.toList());
        System.out.println(top);
        System.out.println(marks.stream().reduce(0, Integer::sum));
        System.out.println(marks.stream().filter(m -> m < 40).count());
        System.out.println(marks.stream().mapToInt(Integer::intValue).max().getAsInt());
        System.out.println(marks);
    }
}`,
      expected: `[91, 82, 74]
479
1
91
[45, 82, 67, 91, 38, 82, 74]`,
      explain: 'filter keeps marks ≥ 60 (82, 67, 91, 82, 74), distinct removes the second 82, sorted(reverseOrder) gives 91, 82, 74, 67 and limit(3) keeps the first three. `reduce(0, Integer::sum)` adds everything (479). Streams **never modify the source**, so the original list prints unchanged.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Collectors: what does this program print?',
      example: { title: 'joining', code: 'Stream.of("a", "b", "c").collect(Collectors.joining("-")); // a-b-c' },
      code: `import java.util.*;
import java.util.stream.*;

public class Main {
    public static void main(String[] args) {
        List<String> cities = List.of("Pune", "Patna", "Delhi", "Agra", "Durg", "Panaji");

        Map<Character, Long> byLetter = cities.stream()
                .collect(Collectors.groupingBy(c -> c.charAt(0), TreeMap::new, Collectors.counting()));
        System.out.println(byLetter);

        Map<Boolean, List<String>> longNames = cities.stream()
                .collect(Collectors.partitioningBy(c -> c.length() > 4));
        System.out.println(longNames);

        String joined = cities.stream()
                .filter(c -> c.startsWith("P"))
                .map(String::toUpperCase)
                .collect(Collectors.joining(", ", "[", "]"));
        System.out.println(joined);
    }
}`,
      expected: `{A=1, D=2, P=3}
{false=[Pune, Agra, Durg], true=[Patna, Delhi, Panaji]}
[PUNE, PATNA, PANAJI]`,
      explain: '`groupingBy(classifier, TreeMap::new, counting())` groups by first letter into a **sorted** TreeMap with counts. `partitioningBy` always gives exactly two groups, printed as `false` first, then `true`. `joining(", ", "[", "]")` adds a separator, prefix and suffix.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the pipeline step that keeps only salaries **above 50000**:
\`salaries.stream().____.count();\``,
      example: { title: 'keeping names that start with A', code: 'names.stream().filter(n -> n.startsWith("A"))' },
      accept: ['filter(s -> s > 50000)', 'filter(x -> x > 50000)', 'filter(salary -> salary > 50000)', 'filter(n -> n > 50000)'],
      acceptRegex: [
        '^filter\\s*\\(\\s*s\\s*-\\s*>\\s*s\\s*>\\s*50000\\s*\\)\\s*[;{]?$',
        '^filter\\s*\\(\\s*x\\s*-\\s*>\\s*x\\s*>\\s*50000\\s*\\)\\s*[;{]?$',
        '^filter\\s*\\(\\s*salary\\s*-\\s*>\\s*salary\\s*>\\s*50000\\s*\\)\\s*[;{]?$',
        '^filter\\s*\\(\\s*n\\s*-\\s*>\\s*n\\s*>\\s*50000\\s*\\)\\s*[;{]?$',
        '^filter\\s*\\(\\s*\\(?\\s*([A-Za-z_$][\\w$]*)\\s*\\)?\\s*->\\s*\\1\\s*>\\s*50000\\s*\\)$',
      ],
      caseSensitive: true,
      explain: '`filter` takes a Predicate and keeps the elements for which it returns true. Like all intermediate operations it is **lazy**: nothing happens until a terminal operation such as `count()` runs.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Finish the pipeline so the result is collected into a List:
\`List<String> names = students.stream().map(Student::getName).____;\``,
      example: { title: 'collecting into a Set', code: '.collect(Collectors.toSet())' },
      accept: ['collect(Collectors.toList())', 'toList()'],
      acceptRegex: ['^collect\\s*\\(\\s*Collectors\\s*\\.\\s*toList\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$', '^toList\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`collect(Collectors.toList())` gathers the elements into a List; Java 16+ also has the shorter `toList()` (which returns an unmodifiable list).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What happens when you call a terminal operation **twice** on the same Stream object?',
      options: [
        'It works and gives the same result',
        'IllegalStateException: stream has already been operated upon or closed',
        'It returns an empty result the second time',
        'Compile error',
      ],
      answer: 1,
      explain: 'A stream can be consumed **only once**. Create a new stream from the source (`list.stream()`) each time, or use a `Supplier<Stream<T>>`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **terminal** operations? (choose all that apply)',
      options: ['collect', 'map', 'forEach', 'sorted', 'reduce', 'anyMatch'],
      answers: [0, 2, 4, 5],
      explain: 'Terminal operations produce a result or side effect and end the stream: collect, forEach, reduce, count, min/max, anyMatch, findFirst. map, filter, sorted, distinct, limit are **intermediate** (they return a new Stream and are lazy).',
    },
  ],
};
