export default {
  lesson: 'day-41-modern-java-features',
  minutes: 22,
  intro: 'Practise Optional, var, records, text blocks, switch expressions and sealed classes from modern Java.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Records and Optional: what does this program print?',
      example: {
        title: 'a record in one line',
        code: `record Point(int x, int y) { }
Point p = new Point(1, 2);
p.x();   // accessor, not getX()`,
      },
      code: `import java.util.*;

record Student(String name, int marks) {
    Student {
        if (marks < 0) throw new IllegalArgumentException("marks");
    }
    boolean passed() { return marks >= 40; }
}

public class Main {
    static Optional<Student> find(List<Student> list, String name) {
        for (Student s : list) if (s.name().equals(name)) return Optional.of(s);
        return Optional.empty();
    }

    public static void main(String[] args) {
        var list = List.of(new Student("Asha", 90), new Student("Ravi", 35));
        System.out.println(list.get(0));
        System.out.println(list.get(1).passed());
        System.out.println(new Student("Asha", 90).equals(list.get(0)));
        System.out.println(find(list, "Ravi").map(Student::marks).orElse(-1));
        System.out.println(find(list, "Om").map(Student::marks).orElse(-1));
        System.out.println(find(list, "Om").isPresent());
    }
}`,
      expected: `Student[name=Asha, marks=90]
false
true
35
-1
false`,
      explain: 'A record auto-generates the constructor, accessors (`name()`, `marks()`), `toString` in the form `Student[name=Asha, marks=90]`, and value-based `equals`/`hashCode`. The compact constructor validates input. Optional\'s `map(...).orElse(-1)` avoids null checks: an empty Optional skips map and returns the fallback.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Switch expressions and pattern matching (Java 21): what does this program print?',
      example: { title: 'type pattern', code: 'if (obj instanceof String s) System.out.println(s.length());' },
      code: `sealed interface Shape permits Circle, Square {}
record Circle(double r) implements Shape {}
record Square(double side) implements Shape {}

public class Main {
    static String describe(Object o) {
        return switch (o) {
            case Integer i when i > 100 -> "big number";
            case Integer i -> "number " + i;
            case String s -> "text of length " + s.length();
            default -> "unknown";
        };
    }

    static double area(Shape s) {
        return switch (s) {
            case Circle c -> 3 * c.r() * c.r();
            case Square q -> q.side() * q.side();
        };
    }

    public static void main(String[] args) {
        System.out.println(describe(500));
        System.out.println(describe(7));
        System.out.println(describe("Java"));
        System.out.println(describe(2.5));
        System.out.println(area(new Square(4)));
        System.out.println(area(new Circle(2)));
    }
}`,
      expected: `big number
number 7
text of length 4
unknown
16.0
12.0`,
      explain: 'Pattern-matching switch tests the type and binds a variable; `when` adds a guard, and cases are checked top to bottom, so 500 hits "big number". 2.5 is a Double, so it falls to default. Because Shape is **sealed** with only Circle and Square, the switch in `area` is exhaustive without a default.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Declare an immutable data class \`Product\` with a \`String name\` and a \`double price\` in one line (empty body):
\`____\``,
      example: { title: 'another record', code: 'record Point(int x, int y) { }' },
      accept: ['record Product(String name, double price) {}', 'public record Product(String name, double price) {}'],
      acceptRegex: [
        '^record\\s+Product\\s*\\(\\s*String\\s+name\\s*,\\s*double\\s+price\\s*\\)\\s*\\{\\s*\\}\\s*[;{]?$',
        '^public\\s+record\\s+Product\\s*\\(\\s*String\\s+name\\s*,\\s*double\\s+price\\s*\\)\\s*\\{\\s*\\}\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'A **record** declares the components in the header; the fields become private final and Java writes the constructor, accessors, equals, hashCode and toString for you.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Use local variable type inference so the type is inferred from the right side:
\`____ map = new HashMap<String, List<Integer>>();\``,
      example: { title: 'var in a for-each', code: 'for (var s : students) System.out.println(s);' },
      accept: ['var'],
      acceptRegex: ['^var\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`var` (Java 10) infers the type at compile time; the variable is still statically typed. It works only for **local variables with an initializer** — not for fields, parameters, return types or `var x = null;`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which is a **bad** use of Optional?',
      options: [
        'Returning Optional<User> from findById',
        'Using opt.orElse(defaultValue)',
        'Calling opt.get() without checking, as a habit',
        'Using opt.map(User::getEmail)',
      ],
      answer: 2,
      explain: '`get()` on an empty Optional throws NoSuchElementException, so calling it blindly brings back the problem Optional was meant to solve. Prefer orElse, orElseGet, orElseThrow, map and ifPresent. Also avoid Optional for fields and parameters.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about modern Java features are TRUE? (choose all that apply)',
      options: [
        'Text blocks start with three double quotes followed by a new line',
        'A record can extend another class',
        'Records are implicitly final',
        'A sealed class lists its allowed subclasses with permits',
        'var can be used for a class field',
      ],
      answers: [0, 2, 3],
      explain: 'Text blocks begin with `"""` and a line break. Records implicitly extend java.lang.Record (so they cannot extend another class) and are final. Sealed types restrict their subclasses with `permits`. `var` is only for local variables.',
    },
  ],
};
