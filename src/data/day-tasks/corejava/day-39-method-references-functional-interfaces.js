export default {
  lesson: 'day-39-method-references-functional-interfaces',
  minutes: 22,
  intro: 'Use Predicate, Function, Consumer, Supplier and their variants, chain them, and write the four kinds of method references.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Chaining functional interfaces: what does this program print?',
      example: {
        title: 'Predicate test',
        code: `Predicate<String> empty = String::isEmpty;
System.out.println(empty.test("")); // true`,
      },
      code: `import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isBig = n -> n > 10;
        System.out.println(isEven.and(isBig).test(12));
        System.out.println(isEven.or(isBig).test(7));
        System.out.println(isEven.negate().test(7));

        Function<Integer, Integer> plus2 = x -> x + 2;
        Function<Integer, Integer> times3 = x -> x * 3;
        System.out.println(plus2.andThen(times3).apply(4));
        System.out.println(plus2.compose(times3).apply(4));

        UnaryOperator<String> shout = s -> s.toUpperCase() + "!";
        BinaryOperator<Integer> mul = (a, b) -> a * b;
        System.out.println(shout.apply("hi") + " " + mul.apply(6, 7));
    }
}`,
      expected: `true
false
true
18
14
HI! 42`,
      explain: '`and`/`or`/`negate` combine Predicates. `f.andThen(g)` runs f first, then g: (4 + 2) × 3 = 18. `f.compose(g)` runs g first, then f: 4 × 3 + 2 = 14. UnaryOperator<T> is a Function<T, T> and BinaryOperator<T> a BiFunction<T, T, T>.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Method references: what does this program print?',
      example: {
        title: 'lambda vs method reference',
        code: `s -> s.length()      // lambda
String::length       // same thing`,
      },
      code: `import java.util.*;
import java.util.function.*;

public class Main {
    static boolean isVowel(char c) { return "aeiou".indexOf(c) >= 0; }

    public static void main(String[] args) {
        Function<String, Integer> len = String::length;
        BiFunction<Integer, Integer, Integer> bigger = Math::max;
        Supplier<List<String>> maker = ArrayList::new;
        Predicate<Character> vowel = Main::isVowel;
        String prefix = "Hello, ";
        Function<String, String> greet = prefix::concat;

        List<String> list = maker.get();
        list.add("Pune");
        list.add("Agra");
        list.forEach(System.out::println);
        System.out.println(len.apply("UpSkillr"));
        System.out.println(bigger.apply(8, 13));
        System.out.println(vowel.test('e'));
        System.out.println(greet.apply("Asha"));
    }
}`,
      expected: `Pune
Agra
8
13
true
Hello, Asha`,
      explain: 'The four kinds: **static** (`Math::max`, `Main::isVowel`), **instance method of a particular object** (`System.out::println`, `prefix::concat`), **instance method of an arbitrary object of a type** (`String::length` — the argument becomes the object), and **constructor** (`ArrayList::new`).',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Replace the lambda \`s -> s.toUpperCase()\` with an equivalent **method reference**:
\`Function<String, String> up = ____;\``,
      example: { title: 'another one', code: 'Function<String, Integer> len = String::length;' },
      accept: ['String::toUpperCase'],
      acceptRegex: ['^String\\s*:\\s*:\\s*toUpperCase\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'When a lambda just calls one method on its parameter, `ClassName::method` is shorter and reads better. The parameter becomes the object the method is called on.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which built-in functional interface fits a check that returns true/false?
\`____<Student> passed = s -> s.getMarks() >= 40;\``,
      example: { title: 'a Consumer', code: 'Consumer<String> log = msg -> System.out.println("[LOG] " + msg);' },
      accept: ['Predicate'],
      acceptRegex: ['^Predicate\\s*[;{]?$'],
      caseSensitive: true,
      explain: '**Predicate<T>** has `boolean test(T t)`. Function<T, R> transforms (`R apply(T)`), Consumer<T> uses a value and returns nothing (`accept`), Supplier<T> produces a value from nothing (`get`).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which interface has the method `T get()` with **no parameters**, e.g. to create a default object or a random OTP?',
      options: ['Consumer<T>', 'Supplier<T>', 'Function<T, R>', 'Predicate<T>'],
      answer: 1,
      explain: '**Supplier** supplies a value: `Supplier<Integer> otp = () -> new Random().nextInt(9000) + 1000;`. Optional.orElseGet and Collectors.toCollection take Suppliers.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are valid primitive specialisations that avoid boxing? (choose all that apply)',
      options: ['IntPredicate', 'IntFunction<R>', 'ToIntFunction<T>', 'IntSupplier', 'IntegerConsumer', 'DoubleUnaryOperator'],
      answers: [0, 1, 2, 3, 5],
      explain: 'java.util.function has Int/Long/Double versions such as IntPredicate, IntFunction, ToIntFunction, IntSupplier, IntConsumer and DoubleUnaryOperator. There is no "IntegerConsumer" (it is IntConsumer).',
    },
  ],
};
