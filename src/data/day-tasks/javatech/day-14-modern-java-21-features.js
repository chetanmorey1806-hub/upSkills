export default {
  lesson: 'day-14-modern-java-21-features',
  minutes: 24,
  intro: 'Use Java 21 pattern matching for switch, record patterns, sealed types, sequenced collections and virtual threads.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does this Java 21 program print? (one line per println)',
      example: { title: 'guarded patterns', code: 'case String s when s.isBlank() -> "empty text";' },
      code: `static String describe(Object o) {
    return switch (o) {
        case null -> "null!";
        case Integer i when i < 0 -> "negative " + i;
        case Integer i -> "int " + i;
        case String s -> "String of length " + s.length();
        default -> "other " + o;
    };
}

System.out.println(describe(42));
System.out.println(describe(-5));
System.out.println(describe("hello"));
System.out.println(describe(null));
System.out.println(describe(3.5));`,
      expected: 'int 42\nnegative -5\nString of length 5\nnull!\nother 3.5',
      explain: 'Cases are tried top to bottom: −5 matches the **guarded** case `when i < 0` first. `case null` handles null instead of throwing NullPointerException. 3.5 is a Double, so it falls to `default`. No casts are needed - the pattern variable (`i`, `s`) is already typed.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print? (one line per println)',
      example: { title: 'record toString', code: 'record Point(int x, int y) {}\nnew Point(1, 2)   // prints Point[x=1, y=2]' },
      code: `sealed interface Shape permits Rect, Square, Circle {}
record Rect(int w, int h) implements Shape {}
record Square(int side) implements Shape {}
record Circle(int r) implements Shape {}

static int area(Shape s) {
    return switch (s) {
        case Rect(int w, int h) -> w * h;
        case Square(int a) -> a * a;
        case Circle(int r) -> 3 * r * r;
    };
}

System.out.println(new Rect(3, 4));
System.out.println(area(new Rect(3, 4)));
System.out.println(area(new Square(5)));
System.out.println(area(new Circle(2)));`,
      expected: 'Rect[w=3, h=4]\n12\n25\n12',
      explain: 'Records generate `toString` as `Name[comp=value, ...]`. **Record patterns** take the record apart directly (`Rect(int w, int h)`). Because `Shape` is sealed, the compiler knows these 3 cases are all possible types, so no `default` is needed (exhaustive switch).',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Write the declaration line of a **sealed** interface `Payment` that allows only `UpiPayment` and `CardPayment` to implement it (end it with `{}`).',
      example: { title: 'a permitted subclass', code: 'public final class UpiPayment implements Payment { ... }\n// permitted classes must be final, sealed or non-sealed' },
      accept: ['public sealed interface Payment permits UpiPayment, CardPayment {}', 'sealed interface Payment permits UpiPayment, CardPayment {}', 'public sealed interface Payment permits CardPayment, UpiPayment {}', 'sealed interface Payment permits CardPayment, UpiPayment {}'],
      explain: '`sealed ... permits A, B` closes the hierarchy: no other class can implement `Payment`. That gives the compiler a complete list for exhaustive switches. Each permitted class must be `final`, `sealed` or `non-sealed`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the line that creates an executor which starts **one virtual thread per task**:\n```\ntry (ExecutorService ex = ???) {\n    for (int i = 0; i < 10_000; i++) ex.submit(() -> callPaymentApi());\n}\n```',
      example: { title: 'a single virtual thread', code: 'Thread.ofVirtual().start(() -> System.out.println("hi"));' },
      accept: ['Executors.newVirtualThreadPerTaskExecutor()'],
      explain: '`Executors.newVirtualThreadPerTaskExecutor()` creates a cheap virtual thread for every task, so 10,000 blocking I/O calls do not need 10,000 OS threads. In Spring Boot 3.2+ set `spring.threads.virtual.enabled=true`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Java 21 sequenced collections: what does this print? (one line per println)',
      example: { title: 'new methods', text: 'SequencedCollection adds getFirst(), getLast(), addFirst(), addLast(), removeFirst(), removeLast() and reversed().' },
      code: `List<Integer> list = new ArrayList<>(List.of(10, 20, 30));
list.addFirst(5);
list.addLast(40);
System.out.println(list.getFirst() + " " + list.getLast());
System.out.println(list.reversed());
list.removeFirst();
System.out.println(list);`,
      expected: '5 40\n[40, 30, 20, 10, 5]\n[10, 20, 30, 40]',
      explain: 'Before Java 21 you wrote `list.get(0)` and `list.get(list.size() - 1)`. `reversed()` returns a reversed **view** (the original is unchanged). `removeFirst` removes 5.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'When do virtual threads help the most?',
      options: [
        'CPU-heavy work like image processing or big calculations',
        'Many tasks that spend most of their time waiting on I/O (HTTP calls, database queries)',
        'They make single-threaded loops faster',
        'They replace the need for a database connection pool',
      ],
      answer: 1,
      explain: 'A virtual thread is unmounted from its carrier OS thread while it **waits** for I/O, so thousands can wait cheaply. CPU-bound work is still limited by the number of cores. You still need connection pools, since the database can only handle so many connections.',
    },
  ],
};
