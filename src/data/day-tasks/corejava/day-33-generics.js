export default {
  lesson: 'day-33-generics',
  minutes: 22,
  intro: 'Write generic classes and methods, add bounds and use wildcards with the PECS rule.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Generic class and generic method: what does this program print?',
      example: {
        title: 'one class, many types',
        code: `Box<String> b = new Box<>("pen");
Box<Integer> n = new Box<>(5);`,
      },
      code: `class Pair<K, V> {
    private final K key;
    private final V value;
    Pair(K key, V value) { this.key = key; this.value = value; }
    K getKey() { return key; }
    V getValue() { return value; }
    @Override public String toString() { return key + "=" + value; }
}

public class Main {
    static <T> T last(T[] items) {
        return items[items.length - 1];
    }

    public static void main(String[] args) {
        Pair<String, Integer> p = new Pair<>("Asha", 92);
        System.out.println(p);
        int marks = p.getValue() + 3;
        System.out.println(marks);
        System.out.println(last(new String[]{"Pune", "Delhi", "Goa"}));
        System.out.println(last(new Integer[]{4, 8, 15}));
    }
}`,
      expected: `Asha=92
95
Goa
15`,
      explain: 'Pair<String, Integer> fixes K = String and V = Integer, so `getValue()` returns an Integer without any cast. The generic method `<T> T last(T[])` infers T from the argument: String for the first call, Integer for the second.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Bounded types and wildcards: what does this program print?',
      example: {
        title: 'an upper-bounded wildcard',
        code: `static void printAll(List<? extends Number> list) { ... }
printAll(List.of(1, 2));      // List<Integer> OK
printAll(List.of(1.5, 2.5));  // List<Double> OK`,
      },
      code: `import java.util.List;

public class Main {
    static double sum(List<? extends Number> nums) {
        double total = 0;
        for (Number n : nums) total += n.doubleValue();
        return total;
    }

    static <T extends Comparable<T>> T max(T a, T b) {
        return a.compareTo(b) >= 0 ? a : b;
    }

    public static void main(String[] args) {
        System.out.println(sum(List.of(10, 20, 30)));
        System.out.println(sum(List.of(1.5, 2.25)));
        System.out.println(max(7, 3));
        System.out.println(max("mango", "apple"));
    }
}`,
      expected: `60.0
3.75
7
mango`,
      explain: '`List<? extends Number>` accepts a List<Integer> or List<Double>, and the result is a double (60.0 and 3.75). `<T extends Comparable<T>>` lets us call compareTo on T: Integers compare numerically and Strings alphabetically ("mango" > "apple").',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the class header so \`Box\` can hold any type T:
\`class ____ {\`
\`    private T item;\`
\`}\``,
      example: { title: 'two type parameters', code: 'class Pair<K, V> { ... }' },
      accept: ['Box<T>'],
      acceptRegex: ['^Box\\s*<\\s*T\\s*>\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'The type parameter goes in angle brackets after the class name: `class Box<T>`. Inside the class, T is used like a real type. By convention single capital letters are used: T (type), E (element), K/V (key/value).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the **generic method** header so it works for an array of any type:
\`static ____ void printAll(T[] items) {\``,
      example: { title: 'a generic method that returns a value', code: 'static <T> T first(List<T> list) { return list.get(0); }' },
      accept: ['<T>'],
      acceptRegex: ['^<\\s*T\\s*>\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'A generic method declares its own type parameter **before the return type**: `static <T> void printAll(T[] items)`. Without `<T>` the compiler looks for a class named T and fails.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'You need a method that **adds** Integers into a list that could be a `List<Integer>`, `List<Number>` or `List<Object>`. Which parameter type is correct (PECS)?',
      options: ['List<? extends Integer>', 'List<? super Integer>', 'List<Integer>', 'List<?>'],
      answer: 1,
      explain: '**PECS: Producer Extends, Consumer Super.** A list you write into (a consumer of Integers) should be `? super Integer`. `? extends` lists are read-only for adding (except null), and `List<Integer>` would reject a List<Number>.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are TRUE because of **type erasure**? (choose all that apply)',
      options: [
        'List<int> is not allowed; use List<Integer>',
        'At runtime List<String> and List<Integer> have the same class',
        'new T() inside a generic class does not compile',
        'Generics add runtime type checks to every get()',
        'You cannot create a generic array with new T[10]',
      ],
      answers: [1, 2, 4],
      explain: 'Generic type information is erased after compilation, so both lists are just `ArrayList` at runtime and `new T()` / `new T[10]` are impossible. (List<int> fails for a different reason: generics need reference types.) The checks happen at **compile time**, not at runtime.',
    },
  ],
};
