const ex1 = `import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Predicate<Integer> isEven = n -> n % 2 == 0;
        Predicate<Integer> isPositive = n -> n > 0;

        System.out.println("4 even? " + isEven.test(4));
        System.out.println("-3 positive? " + isPositive.test(-3));
        System.out.println("6 even AND positive? " + isEven.and(isPositive).test(6));
        System.out.println("-5 even OR positive? " + isEven.or(isPositive).test(-5));
        System.out.println("7 NOT even? " + isEven.negate().test(7));

        Predicate<String> isEmpty = String::isEmpty;
        Predicate<String> notEmpty = Predicate.not(isEmpty);          // Java 11
        System.out.println("'' not empty? " + notEmpty.test(""));

        Predicate<String> validPassword = s -> s.length() >= 8;
        validPassword = validPassword.and(s -> s.chars().anyMatch(Character::isDigit));
        System.out.println("secret12 valid? " + validPassword.test("secret12"));
        System.out.println("password valid? " + validPassword.test("password"));
    }
}`;

const ex2 = `import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.UnaryOperator;
import java.util.function.BinaryOperator;

public class Main {
    public static void main(String[] args) {
        Function<String, Integer> length = String::length;
        Function<Integer, Integer> square = x -> x * x;
        Function<Integer, String> stars = n -> "*".repeat(n);

        System.out.println("length(\\"Java\\") = " + length.apply("Java"));
        System.out.println("andThen: " + length.andThen(square).apply("Java"));   // (4)^2
        System.out.println("compose: " + square.compose(length).apply("Hi"));     // length first
        System.out.println("chain: " + length.andThen(stars).apply("abc"));
        System.out.println("identity: " + Function.<String>identity().apply("same"));

        BiFunction<Integer, Integer, Integer> area = (l, w) -> l * w;
        System.out.println("area: " + area.apply(5, 4));

        UnaryOperator<String> shout = s -> s.toUpperCase() + "!";
        BinaryOperator<Integer> maxOp = BinaryOperator.maxBy(Integer::compare);
        System.out.println(shout.apply("hello"));
        System.out.println("max: " + maxOp.apply(12, 30));
    }
}`;

const ex3 = `import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.function.BiConsumer;
import java.util.function.Consumer;
import java.util.function.Supplier;

public class Main {
    public static void main(String[] args) {
        Consumer<String> print = s -> System.out.println("Item: " + s);
        Consumer<String> log = s -> System.out.println("Logged: " + s.length() + " chars");
        print.andThen(log).accept("Laptop");

        BiConsumer<String, Integer> stock = (name, qty) -> System.out.println(name + " x " + qty);
        stock.accept("Mouse", 3);

        Supplier<List<String>> listMaker = ArrayList::new;      // constructor reference
        List<String> cart = listMaker.get();
        cart.add("Pen");
        System.out.println("Cart: " + cart);

        Supplier<Double> pi = () -> Math.PI;
        System.out.printf("PI = %.2f%n", pi.get());

        Supplier<Integer> dice = () -> new Random(42).nextInt(6) + 1;   // fixed seed
        System.out.println("Same seed, same value: " + dice.get().equals(dice.get()));
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;
import java.util.function.Supplier;

class Student {
    private final String name;
    Student(String name) { this.name = name; }
    String getName() { return name; }
    @Override public String toString() { return "Student(" + name + ")"; }
}

public class Main {
    static boolean isLong(String s) { return s.length() > 4; }

    String decorate(String s) { return "[" + s + "]"; }

    public static void main(String[] args) {
        List<String> names = Arrays.asList("Riya", "Aman", "Kavya");

        // 1. Static method reference: ClassName::staticMethod
        Function<String, Integer> parse = Integer::parseInt;
        System.out.println(parse.apply("123") + 1);
        names.stream().filter(Main::isLong).forEach(System.out::println);

        // 2. Instance method of a particular object: object::method
        Main helper = new Main();
        Function<String, String> deco = helper::decorate;
        System.out.println(deco.apply("Java"));

        // 3. Instance method of an arbitrary object: ClassName::instanceMethod
        Function<String, String> upper = String::toUpperCase;
        BiFunction<String, String, Boolean> same = String::equalsIgnoreCase;
        System.out.println(upper.apply("riya") + " " + same.apply("JAVA", "java"));

        // 4. Constructor reference: ClassName::new
        Function<String, Student> maker = Student::new;
        Student s = maker.apply("Zoya");
        System.out.println(s + " -> " + s.getName());
        Supplier<StringBuilder> sb = StringBuilder::new;
        System.out.println("Empty builder length: " + sb.get().length());
    }
}`;

export default {
  id: 'day-39-method-references-functional-interfaces',
  title: 'Method References and Built-in Functional Interfaces (Predicate, Function, Consumer, Supplier)',
  module: 'Module 7: Java 8+ Features',
  day: 39,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Java ships ready-made functional interfaces in java.util.function so you rarely need your own. Learn the big four — Predicate, Function, Consumer, Supplier — their Bi and Operator variants, default methods for chaining, and the four kinds of method references.',
  objectives: [
    'Use Predicate, Function, Consumer and Supplier correctly',
    'Chain functions with and(), or(), negate(), andThen() and compose()',
    'Use BiFunction, BiConsumer, UnaryOperator, BinaryOperator and primitive specialisations',
    'Write the four types of method references',
    'Choose between a lambda and a method reference',
  ],
  theory: [
    {
      heading: 'The java.util.function Package',
      content: 'Instead of writing a new interface each time, Java 8 gives a toolbox of functional interfaces. Remember them with a simple story about a shop: Predicate is the security guard (answers yes/no: "is this customer allowed?"), Function is the machine that converts input to output (raw cotton -> shirt), Consumer is the customer who takes something and returns nothing (eats the food), Supplier is the factory that produces things without being given anything.',
      points: [
        'Predicate<T>: boolean test(T t) — filtering, validation',
        'Function<T, R>: R apply(T t) — transforming/mapping',
        'Consumer<T>: void accept(T t) — printing, saving, sending',
        'Supplier<T>: T get() — creating values, lazy defaults, factories',
      ],
    },
    {
      heading: 'Chaining with Default Methods',
      content: 'These interfaces have default methods that combine small pieces into bigger logic, like connecting LEGO blocks.',
      syntax: `Predicate: p1.and(p2), p1.or(p2), p1.negate(), Predicate.not(p), Predicate.isEqual(x)
Function:  f.andThen(g)   // first f, then g  => g(f(x))
           f.compose(g)   // first g, then f  => f(g(x))
           Function.identity()   // returns its input
Consumer:  c1.andThen(c2) // run c1 then c2 with the same input`,
      tip: 'Mnemonic: andThen reads left-to-right ("do this AND THEN that"); compose reads right-to-left like maths f(g(x)).',
    },
    {
      heading: 'Bi Variants, Operators and Primitive Specialisations',
      content: 'Bi versions take two inputs. Operators are Functions where input and output types are the same. Primitive versions avoid boxing int to Integer, which is faster.',
      points: [
        'BiPredicate<T,U>: test(t, u); BiFunction<T,U,R>: apply(t, u); BiConsumer<T,U>: accept(t, u) (used by Map.forEach)',
        'UnaryOperator<T> extends Function<T,T> (used by List.replaceAll)',
        'BinaryOperator<T> extends BiFunction<T,T,T> (used by reduce); has minBy/maxBy',
        'IntPredicate, IntFunction<R>, IntConsumer, IntSupplier, IntUnaryOperator, IntBinaryOperator, ToIntFunction<T>, also Long and Double versions',
        'There is no BiSupplier (a supplier takes no input)',
      ],
    },
    {
      heading: 'Method References (::)',
      content: 'If a lambda only calls an existing method, you can refer to the method directly with ::. It is like saying "call Ravi" instead of "call the person whose name is Ravi". Method references are shorter and often more readable.',
      syntax: `// 1. Static method          x -> Integer.parseInt(x)      =>  Integer::parseInt
// 2. Particular object       x -> System.out.println(x)    =>  System.out::println
// 3. Arbitrary object of type s -> s.toUpperCase()         =>  String::toUpperCase
//                            (a, b) -> a.compareTo(b)       =>  String::compareTo
// 4. Constructor             () -> new ArrayList<>()       =>  ArrayList::new
//                            n -> new int[n]               =>  int[]::new`,
      points: [
        'The method signature must match the functional interface method',
        'In type 3, the FIRST parameter becomes the object on which the method is called',
        'Use a lambda when you need extra logic or arguments; use a method reference for a direct call',
      ],
    },
    {
      heading: 'Where You Meet Them in Real Code',
      content: 'These interfaces are the parameter types of many standard APIs, so recognising them helps you read Java code quickly.',
      points: [
        'Stream.filter(Predicate), map(Function), forEach(Consumer), reduce(BinaryOperator), collect(Supplier...)',
        'Optional.orElseGet(Supplier), map(Function), ifPresent(Consumer)',
        'Map.computeIfAbsent(key, Function), merge(key, value, BiFunction), forEach(BiConsumer)',
        'Collection.removeIf(Predicate), List.replaceAll(UnaryOperator)',
        'CompletableFuture.supplyAsync(Supplier), thenApply(Function), thenAccept(Consumer)',
      ],
    },
  ],
  examples: [
    {
      title: 'Predicate: Validation Rules',
      scenario: 'A sign-up form validates numbers and passwords by combining small rules.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Import java.util.function.Predicate', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `4 even? true
-3 positive? false
6 even AND positive? true
-5 even OR positive? false
7 NOT even? true
'' not empty? false
secret12 valid? true
password valid? false`,
      explanation: 'and/or/negate build new Predicates from existing ones. The password rule requires length >= 8 and at least one digit; "password" has no digit so it fails. Character::isDigit is a static method reference used as an IntPredicate.',
    },
    {
      title: 'Function, BiFunction and Operators',
      scenario: 'A text tool converts strings to numbers, chains transformations and computes areas.',
      steps: ['Create Main.java', 'Try andThen and compose and notice the order', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `length("Java") = 4
andThen: 16
compose: 4
chain: ***
identity: same
area: 20
HELLO!
max: 30`,
      explanation: 'length.andThen(square) computes length first (4) then square (16). square.compose(length) also runs length first because compose applies its argument first: "Hi" -> 2 -> 4. "*".repeat(3) gives ***.',
    },
    {
      title: 'Consumer and Supplier',
      scenario: 'A shopping app prints and logs items (Consumer) and creates carts on demand (Supplier).',
      steps: ['Create Main.java', 'Use andThen on Consumers and a constructor reference for Supplier', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Item: Laptop
Logged: 6 chars
Mouse x 3
Cart: [Pen]
PI = 3.14
Same seed, same value: true`,
      explanation: 'print.andThen(log) runs both consumers with the same input. ArrayList::new is a Supplier that builds a new list every time get() is called. A Random with a fixed seed always produces the same sequence, which keeps output predictable.',
    },
    {
      title: 'All Four Types of Method References',
      scenario: 'See static, bound instance, unbound instance and constructor references side by side.',
      steps: ['Create Main.java with the Student class', 'Hover over each :: in IntelliJ to see the target functional interface', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `124
Kavya
[Java]
RIYA true
Student(Zoya) -> Zoya
Empty builder length: 0`,
      explanation: 'Integer::parseInt is static. Main::isLong filters names longer than 4 letters (only Kavya). helper::decorate is bound to one object. String::toUpperCase and String::equalsIgnoreCase use the first argument as the target object. Student::new calls the constructor that takes a String.',
    },
  ],
  interview: [
    { q: 'Name the four core functional interfaces and their methods.', a: 'Predicate<T> boolean test(T), Function<T,R> R apply(T), Consumer<T> void accept(T), Supplier<T> T get().', level: 'Easy' },
    { q: 'What is a method reference?', a: 'A shorthand for a lambda that only calls an existing method, written ClassName::method, object::method or ClassName::new.', level: 'Easy' },
    { q: 'What are the types of method references?', a: 'Static method (Math::abs), instance method of a particular object (System.out::println), instance method of an arbitrary object of a type (String::length), and constructor reference (ArrayList::new).', level: 'Medium' },
    { q: 'Difference between andThen and compose in Function?', a: 'f.andThen(g) applies f then g: g(f(x)). f.compose(g) applies g then f: f(g(x)).', level: 'Medium' },
    { q: 'What is UnaryOperator and BinaryOperator?', a: 'UnaryOperator<T> is a Function<T,T> (same input and output type). BinaryOperator<T> is a BiFunction<T,T,T>, used e.g. in Stream.reduce.', level: 'Medium' },
    { q: 'Why do IntPredicate, IntFunction etc. exist?', a: 'To avoid autoboxing overhead of Integer and improve performance with primitives.', level: 'Medium' },
    { q: 'What is the output? Function<Integer,Integer> f = x -> x + 2; Function<Integer,Integer> g = x -> x * 3; System.out.println(f.andThen(g).apply(1) + " " + f.compose(g).apply(1));', a: '9 5. andThen: (1+2)*3 = 9. compose: 1*3+2 = 5.', level: 'Hard' },
    { q: 'Which functional interface does Map.forEach accept?', a: 'BiConsumer<? super K, ? super V>.', level: 'Medium' },
    { q: 'Supplier vs Consumer?', a: 'Supplier takes nothing and returns a value (producer). Consumer takes a value and returns nothing (side effect).', level: 'Easy' },
    { q: 'When is String::compareTo usable as a Comparator<String>?', a: 'Comparator.compare(a, b) has two params; with an unbound reference, the first parameter a becomes the receiver: a.compareTo(b). So String::compareTo fits Comparator<String>.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a Predicate<String> that checks if an email contains "@" and ends with ".com". Test "a@b.com" and "ab.com".',
      hint: 'Combine two predicates with and().',
      solution: `import java.util.function.Predicate;

public class Main {
    public static void main(String[] args) {
        Predicate<String> hasAt = s -> s.contains("@");
        Predicate<String> dotCom = s -> s.endsWith(".com");
        Predicate<String> valid = hasAt.and(dotCom);
        System.out.println(valid.test("a@b.com")); // true
        System.out.println(valid.test("ab.com"));  // false
    }
}`,
    },
    {
      task: 'Build a price pipeline using Function<Double, Double>: add 18% GST, then apply 10% discount, then round to 2 decimals. Apply it to 1000.',
      hint: 'gst.andThen(discount).andThen(round). Use Math.round(x * 100) / 100.0.',
      solution: `import java.util.function.Function;

public class Main {
    public static void main(String[] args) {
        Function<Double, Double> gst = p -> p * 1.18;
        Function<Double, Double> discount = p -> p * 0.90;
        Function<Double, Double> round = p -> Math.round(p * 100) / 100.0;
        System.out.println(gst.andThen(discount).andThen(round).apply(1000.0)); // 1062.0
    }
}`,
    },
    {
      task: 'Use a Map<String, Integer> of fruit stock and print each entry with forEach using a BiConsumer. Then use merge with Integer::sum to add 5 apples.',
      hint: 'Use a TreeMap so output order is fixed.',
      solution: `import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new TreeMap<>(Map.of("apple", 10, "mango", 4));
        stock.merge("apple", 5, Integer::sum);
        stock.forEach((fruit, qty) -> System.out.println(fruit + " = " + qty));
        // apple = 15, mango = 4
    }
}`,
    },
    {
      task: 'Rewrite these lambdas as method references: s -> s.trim(), x -> System.out.println(x), () -> new HashMap<String,Integer>(), (a, b) -> Math.max(a, b).',
      hint: 'String::trim, System.out::println, HashMap::new, Math::max.',
      solution: `import java.util.HashMap;
import java.util.Map;
import java.util.function.*;

public class Main {
    public static void main(String[] args) {
        UnaryOperator<String> trim = String::trim;
        Consumer<Object> out = System.out::println;
        Supplier<Map<String, Integer>> mapMaker = HashMap::new;
        BinaryOperator<Integer> max = Math::max;
        out.accept(trim.apply("  hi  "));   // hi
        out.accept(mapMaker.get().size());  // 0
        out.accept(max.apply(3, 9));        // 9
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which interface has the method boolean test(T t)?', options: ['Function', 'Predicate', 'Consumer', 'Supplier'], answer: 1, explanation: 'Predicate.test returns boolean.' },
    { question: 'Which interface takes no arguments and returns a value?', options: ['Consumer', 'Runnable', 'Supplier', 'UnaryOperator'], answer: 2, explanation: 'Supplier<T>.get() takes nothing and returns T.' },
    { question: 'String::length is which kind of method reference?', options: ['Static method', 'Constructor', 'Bound instance (particular object)', 'Instance method of an arbitrary object'], answer: 3, explanation: 'The String object is supplied at call time as the first argument.' },
    { question: 'f.andThen(g).apply(x) equals:', options: ['g(f(x))', 'f(g(x))', 'f(x) + g(x)', 'g(x)'], answer: 0, explanation: 'andThen applies f first, then g.' },
    { question: 'Which functional interface does List.replaceAll accept?', options: ['Predicate<E>', 'UnaryOperator<E>', 'Consumer<E>', 'Supplier<E>'], answer: 1, explanation: 'replaceAll(UnaryOperator<E>) maps each element to a new value of the same type.' },
  ],
};
