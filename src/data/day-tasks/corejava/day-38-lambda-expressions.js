export default {
  lesson: 'day-38-lambda-expressions',
  minutes: 20,
  intro: 'Write lambdas in every syntax form, use them with functional interfaces and collections, and respect the effectively-final rule.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Lambdas with a custom functional interface: what does this program print?',
      example: {
        title: 'lambda forms',
        code: `(a, b) -> a + b                 // expression body
(a, b) -> { return a + b; }    // block body
x -> x * x                     // one parameter, no brackets`,
      },
      code: `@FunctionalInterface
interface MathOp {
    int apply(int a, int b);
}

public class Main {
    public static void main(String[] args) {
        MathOp add = (a, b) -> a + b;
        MathOp max = (a, b) -> a > b ? a : b;
        MathOp power = (a, b) -> {
            int r = 1;
            for (int i = 0; i < b; i++) r *= a;
            return r;
        };
        System.out.println(add.apply(3, 4));
        System.out.println(max.apply(3, 4));
        System.out.println(power.apply(2, 5));
    }
}`,
      expected: `7
4
32`,
      explain: 'Each lambda provides the body of the single abstract method `apply`. An expression body returns its value automatically; a block body `{ }` needs an explicit `return`. 2 to the power 5 = 32.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Lambdas with collections: what does this program print?',
      example: { title: 'forEach with a lambda', code: 'list.forEach(x -> System.out.println(x));' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Ravi", "Om", "Meenakshi", "Asha", "Jo"));
        names.removeIf(n -> n.length() <= 2);
        System.out.println(names);
        names.sort((a, b) -> a.compareTo(b));
        System.out.println(names);
        names.sort((a, b) -> b.length() - a.length());
        names.forEach(n -> System.out.print(n.charAt(0)));
        System.out.println();
    }
}`,
      expected: `[Ravi, Meenakshi, Asha]
[Asha, Meenakshi, Ravi]
MAR`,
      explain: '`removeIf` deletes every element for which the lambda returns true ("Om", "Jo"). The first sort is alphabetical. The second sorts by length, longest first; "Asha" and "Ravi" have equal length, and List.sort is **stable**, so they keep their previous order. The first letters printed are M, A, R.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Write a lambda for a \`Comparator<Integer>\` that sorts numbers in **descending** order:
\`Comparator<Integer> desc = ____;\``,
      example: { title: 'ascending order', code: 'Comparator<Integer> asc = (a, b) -> a.compareTo(b);' },
      accept: [
        '(a, b) -> b.compareTo(a)',
        '(a, b) -> b - a',
        '(x, y) -> y.compareTo(x)',
        '(x, y) -> y - x',
        '(a, b) -> Integer.compare(b, a)',
        '(x, y) -> Integer.compare(y, x)',
      ],
      acceptRegex: [
        '^\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*\\.\\s*compareTo\\s*\\(\\s*a\\s*\\)\\s*[;{]?$',
        '^\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*-\\s*a\\s*[;{]?$',
        '^\\(\\s*x\\s*,\\s*y\\s*\\)\\s*-\\s*>\\s*y\\s*\\.\\s*compareTo\\s*\\(\\s*x\\s*\\)\\s*[;{]?$',
        '^\\(\\s*x\\s*,\\s*y\\s*\\)\\s*-\\s*>\\s*y\\s*-\\s*x\\s*[;{]?$',
        '^\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*Integer\\s*\\.\\s*compare\\s*\\(\\s*b\\s*,\\s*a\\s*\\)\\s*[;{]?$',
        '^\\(\\s*x\\s*,\\s*y\\s*\\)\\s*-\\s*>\\s*Integer\\s*\\.\\s*compare\\s*\\(\\s*y\\s*,\\s*x\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Swapping the operands reverses the order: `(a, b) -> b.compareTo(a)`. A Comparator returns a negative number if the first argument should come first, 0 if equal, and positive otherwise. (`Comparator.reverseOrder()` does the same.)',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the code with a lambda that prints "Backup started" when the thread runs:
\`Runnable r = ____;\``,
      example: {
        title: 'a Runnable with two statements',
        code: `Runnable job = () -> {
  System.out.println("start");
  System.out.println("end");
};`,
      },
      accept: ['() -> System.out.println("Backup started")', '() -> { System.out.println("Backup started"); }'],
      acceptRegex: [
        '^\\(\\s*\\)\\s*-\\s*>\\s*System\\s*\\.\\s*out\\s*\\.\\s*println\\s*\\(\\s*"Backup started"\\s*\\)\\s*[;{]?$',
        '^\\(\\s*\\)\\s*-\\s*>\\s*\\{\\s*System\\s*\\.\\s*out\\s*\\.\\s*println\\s*\\(\\s*"Backup started"\\s*\\)\\s*;\\s*\\}\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Runnable\'s `run()` takes no parameters, so the lambda starts with empty brackets `()`. One statement needs no braces; with braces, end the statement with `;` inside them.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: `Why does this not compile?
\`int count = 0;\`
\`list.forEach(x -> count++);\``,
      options: [
        'forEach cannot take a lambda',
        'Local variables used inside a lambda must be final or effectively final',
        'count must be a long',
        'x is unused',
      ],
      answer: 1,
      explain: 'A lambda can read local variables only if they are **effectively final** (never changed after initialisation), because it captures a copy of the value. Use an `AtomicInteger`, a field, or better, a stream: `list.size()` / `stream().count()`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Inside a lambda written in an instance method, what does `this` refer to?',
      options: ['The lambda object itself', 'The enclosing class instance', 'null', 'The functional interface'],
      answer: 1,
      explain: 'A lambda does not create a new scope for `this`: it refers to the **enclosing object**. In an anonymous inner class, `this` refers to the anonymous class instance — one of the key differences between the two.',
    },
  ],
};
