const ex1 = `class Box<T> {
    private T value;

    Box(T value) { this.value = value; }
    T get() { return value; }
    void set(T value) { this.value = value; }

    @Override
    public String toString() { return "Box[" + value + "]"; }
}

class Pair<K, V> {
    private final K key;
    private final V value;
    Pair(K key, V value) { this.key = key; this.value = value; }
    K getKey() { return key; }
    V getValue() { return value; }
}

public class Main {
    public static void main(String[] args) {
        Box<String> name = new Box<>("Hello");
        Box<Integer> num = new Box<>(42);
        System.out.println(name);
        System.out.println(num.get() + 8);          // no cast needed
        System.out.println(name.get().toUpperCase());
        // name.set(100);  // compile error: int is not a String

        Pair<String, Integer> marks = new Pair<>("Riya", 91);
        System.out.println(marks.getKey() + " scored " + marks.getValue());
    }
}`;

const ex2 = `import java.util.Arrays;

public class Main {
    // generic method: <T> comes before the return type
    static <T> void printArray(T[] arr) {
        System.out.println(Arrays.toString(arr) + " (length " + arr.length + ")");
    }

    // bounded generic method: T must be Comparable
    static <T extends Comparable<T>> T max(T a, T b, T c) {
        T m = a;
        if (b.compareTo(m) > 0) m = b;
        if (c.compareTo(m) > 0) m = c;
        return m;
    }

    static <T> T firstOrDefault(T[] arr, T def) {
        return arr.length > 0 ? arr[0] : def;
    }

    public static void main(String[] args) {
        printArray(new Integer[]{1, 2, 3});
        printArray(new String[]{"a", "b"});
        System.out.println("Max int: " + max(3, 7, 5));
        System.out.println("Max string: " + max("apple", "pear", "mango"));
        System.out.println("Max double: " + Main.<Double>max(2.5, 1.5, 2.0));
        System.out.println("First: " + firstOrDefault(new String[]{}, "none"));
    }
}`;

const ex3 = `import java.util.ArrayList;
import java.util.List;

class Stats<T extends Number> {
    private final List<T> nums;
    Stats(List<T> nums) { this.nums = nums; }

    double average() {
        double sum = 0;
        for (T n : nums) sum += n.doubleValue();   // allowed because T extends Number
        return sum / nums.size();
    }
}

public class Main {
    public static void main(String[] args) {
        Stats<Integer> s1 = new Stats<>(List.of(10, 20, 30, 40));
        Stats<Double> s2 = new Stats<>(List.of(1.5, 2.5));
        System.out.println("Integer average: " + s1.average());
        System.out.println("Double average: " + s2.average());
        // Stats<String> s3 = ...;  // compile error: String is not a Number
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.List;

public class Main {
    // Upper bounded: read Numbers (Producer Extends)
    static double sum(List<? extends Number> list) {
        double s = 0;
        for (Number n : list) s += n.doubleValue();
        return s;
    }

    // Lower bounded: write Integers (Consumer Super)
    static void addScores(List<? super Integer> list) {
        list.add(10);
        list.add(20);
    }

    // Unbounded: works with any list, read as Object
    static int countNonNull(List<?> list) {
        int c = 0;
        for (Object o : list) if (o != null) c++;
        return c;
    }

    public static void main(String[] args) {
        List<Integer> ints = List.of(1, 2, 3);
        List<Double> doubles = List.of(1.5, 2.5);
        System.out.println("Sum ints: " + sum(ints));
        System.out.println("Sum doubles: " + sum(doubles));

        List<Number> numbers = new ArrayList<>();
        addScores(numbers);
        List<Object> objects = new ArrayList<>();
        addScores(objects);
        System.out.println("Numbers: " + numbers);
        System.out.println("Objects: " + objects);

        List<String> names = new ArrayList<>();
        names.add("A"); names.add(null); names.add("C");
        System.out.println("Non-null names: " + countNonNull(names));
    }
}`;

export default {
  id: 'day-33-generics',
  title: 'Generics: Generic Classes, Generic Methods, Bounded Types, Wildcards',
  module: 'Module 5: Core APIs & Generics',
  day: 33,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary: 'Generics let you write classes and methods that work with any type while keeping compile-time type safety. You will build generic classes and methods, restrict types with bounds, and use wildcards (? extends, ? super) correctly.',
  objectives: [
    'Explain the problems generics solve (casting and ClassCastException)',
    'Create generic classes and interfaces with type parameters like T, K, V',
    'Write generic methods and bounded generic methods',
    'Use wildcards ?, ? extends T and ? super T with the PECS rule',
    'Understand type erasure and generics restrictions',
  ],
  theory: [
    {
      heading: 'Why Generics?',
      content: 'Imagine a storage box with no label. You can put anything in it, but when you take something out you must guess what it is. Before Java 5, collections were like that: a List stored Object, so you had to cast every element and a wrong cast crashed at runtime with ClassCastException. Generics put a LABEL on the box: List<String> can hold only Strings. The compiler checks the label, and you never need a cast.',
      syntax: `// Without generics (raw type) - unsafe
List list = new ArrayList();
list.add("Hello");
list.add(10);                       // allowed!
String s = (String) list.get(1);    // ClassCastException at runtime

// With generics - safe
List<String> names = new ArrayList<>();
names.add("Hello");
// names.add(10);                   // compile-time error
String n = names.get(0);            // no cast`,
      points: [
        'Type safety: errors caught at compile time instead of runtime',
        'No explicit casting needed',
        'Code reuse: one class works for many types',
        'Diamond operator <> (Java 7) lets the compiler infer the type on the right side',
      ],
    },
    {
      heading: 'Generic Classes and Interfaces',
      content: 'A generic class declares one or more type parameters in angle brackets after the class name. The type parameter is a placeholder that is replaced by a real type when you create an object. Naming conventions: T = Type, E = Element, K = Key, V = Value, N = Number, R = Result.',
      syntax: `class Box<T> {
    private T value;
    Box(T value) { this.value = value; }
    T get() { return value; }
}
Box<String> b = new Box<>("Hi");
Box<Integer> i = new Box<>(5);   // primitives not allowed: Box<int> is an error

interface Repository<T, ID> {
    void save(T item);
    T findById(ID id);
}`,
      points: [
        'Type arguments must be reference types: use Integer, not int (autoboxing helps)',
        'Multiple parameters: class Pair<K, V>',
        'A class implementing a generic interface can fix the type (class StudentRepo implements Repository<Student, Integer>) or stay generic',
      ],
    },
    {
      heading: 'Generic Methods',
      content: 'A generic method has its own type parameter, declared before the return type. It can be inside a normal (non-generic) class. The compiler usually infers T from the arguments, like a smart waiter who knows your order from what you point at.',
      syntax: `static <T> void printArray(T[] arr) { ... }
static <T> T first(List<T> list) { return list.get(0); }

printArray(new Integer[]{1, 2});        // T inferred as Integer
Main.<String>first(names);              // explicit type witness (rarely needed)`,
    },
    {
      heading: 'Bounded Type Parameters',
      content: 'Sometimes "any type" is too wide. A bound restricts what T can be. <T extends Number> means T must be Number or its subclass (Integer, Double...). Now inside the code you can call Number methods like doubleValue(). Use extends for both classes and interfaces. Multiple bounds use &: the class must come first.',
      syntax: `class Stats<T extends Number> { ... }               // T = Integer, Double, ...
static <T extends Comparable<T>> T max(T a, T b)    // T must be comparable
<T extends Number & Comparable<T>>                  // multiple bounds`,
      tip: 'In generics, "extends" means "is a subtype of" for both classes and interfaces. There is no "implements" in a bound.',
    },
    {
      heading: 'Wildcards and the PECS Rule',
      content: 'Important fact: List<Integer> is NOT a subtype of List<Number>, even though Integer is a Number. Otherwise someone could add a Double into your List<Integer>. Wildcards solve this for method parameters. Think of ? extends as a read-only fruit basket ("I will only take fruits out") and ? super as a donation box ("I will only put apples in").',
      points: [
        '<?> unbounded: any type; you can read elements as Object; you can add only null',
        '<? extends Number> upper bound: accepts List<Integer>, List<Double>; you can READ Numbers but cannot add (except null)',
        '<? super Integer> lower bound: accepts List<Integer>, List<Number>, List<Object>; you can ADD Integers; reading gives Object',
        'PECS: Producer Extends, Consumer Super (Joshua Bloch, Effective Java)',
        'Collections.copy(List<? super T> dest, List<? extends T> src) is the classic PECS example',
      ],
    },
    {
      heading: 'Type Erasure and Restrictions',
      content: 'Generics exist only at compile time. After checking types, the compiler ERASES them: Box<String> and Box<Integer> both become plain Box at runtime, with T replaced by Object (or by its bound, e.g. Number). This keeps old code compatible but brings some restrictions.',
      points: [
        'Cannot create new T() or new T[10]',
        'Cannot use primitives as type arguments (List<int>)',
        'Cannot use instanceof List<String> (only instanceof List<?>)',
        'Cannot declare static fields of type T',
        'Cannot overload methods that differ only by generic type: m(List<String>) and m(List<Integer>) clash after erasure',
        'new Box<String>("a").getClass() == new Box<Integer>(1).getClass() is true',
      ],
    },
  ],
  examples: [
    {
      title: 'Generic Class Box<T> and Pair<K, V>',
      scenario: 'Build reusable container classes that can hold any type safely.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type Box and Pair above Main in the same file', 'Try uncommenting name.set(100) to see the compile error', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Box[Hello]
50
HELLO
Riya scored 91`,
      explanation: 'Box<Integer>.get() returns Integer, so num.get() + 8 is arithmetic (50), not string concatenation. Box<String>.get() returns String, so toUpperCase() works without casting.',
    },
    {
      title: 'Generic Methods and Bounded Generic Method max()',
      scenario: 'Write one print method for arrays of any type and one max method for any comparable type.',
      steps: ['Create Main.java', 'Write the generic methods with <T> before the return type', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `[1, 2, 3] (length 3)
[a, b] (length 2)
Max int: 7
Max string: pear
Max double: 2.5
First: none`,
      explanation: '<T extends Comparable<T>> guarantees compareTo() exists. Strings compare alphabetically, so "pear" is the largest. Main.<Double>max shows the explicit type witness syntax.',
    },
    {
      title: 'Bounded Generic Class Stats<T extends Number>',
      scenario: 'A statistics helper must accept lists of any numeric type but reject Strings at compile time.',
      steps: ['Create Main.java', 'Declare class Stats<T extends Number>', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Integer average: 25.0
Double average: 2.0`,
      explanation: 'Because T extends Number, the compiler allows n.doubleValue(). (10+20+30+40)/4 = 25.0 and (1.5+2.5)/2 = 2.0.',
    },
    {
      title: 'Wildcards: ? extends, ? super and ?',
      scenario: 'Utility methods that read numbers from any numeric list, add scores into compatible lists, and count elements in any list.',
      steps: ['Create Main.java', 'Write the three methods with different wildcards', 'Run ▶ and think about PECS'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Sum ints: 6.0
Sum doubles: 4.0
Numbers: [10, 20]
Objects: [10, 20]
Non-null names: 2`,
      explanation: 'sum() is a PRODUCER of numbers (we only read) so it uses ? extends. addScores() is a CONSUMER (we only add Integers) so it uses ? super, and works for List<Number> and List<Object>. countNonNull() does not care about the type so it uses ?.',
    },
  ],
  interview: [
    { q: 'What are generics and what are their benefits?', a: 'Generics allow classes, interfaces and methods to take type parameters. Benefits: compile-time type safety, no casting, and reusable algorithms.', level: 'Easy' },
    { q: 'What is type erasure?', a: 'The compiler removes generic type information after type-checking, replacing type parameters with Object or their bound and inserting casts. At runtime List<String> and List<Integer> are the same class (List).', level: 'Medium' },
    { q: 'Is List<Integer> a subtype of List<Number>?', a: 'No. Generics are invariant. If it were allowed you could add a Double to a list of Integers. Use List<? extends Number> to accept both.', level: 'Medium' },
    { q: 'Explain PECS.', a: 'Producer Extends, Consumer Super. If a parameter only produces values for you to read, use ? extends T. If it only consumes values you put in, use ? super T. If both, use exact T.', level: 'Hard' },
    { q: 'Can you add an element to List<? extends Number>?', a: 'No (except null). The actual list could be List<Integer> or List<Double>, so the compiler cannot know which type is safe to add.', level: 'Medium' },
    { q: 'Why can we not use primitives as generic type arguments?', a: 'Because after erasure the type becomes Object, and primitives are not objects. Use wrapper classes; autoboxing converts automatically.', level: 'Easy' },
    { q: 'Difference between <T extends Number> and <? extends Number>?', a: 'T is a named type parameter declared on a class or method that can be referenced repeatedly (e.g. to return T or relate two parameters). ? is an anonymous wildcard used in parameter/variable types only.', level: 'Hard' },
    { q: 'What is the output? List<String> a = new ArrayList<>(); List<Integer> b = new ArrayList<>(); System.out.println(a.getClass() == b.getClass());', a: 'true — both are ArrayList at runtime due to type erasure.', level: 'Medium' },
    { q: 'What is a raw type and why avoid it?', a: 'Using a generic class without type arguments, e.g. List list = new ArrayList();. It disables type checking, gives unchecked warnings and can cause ClassCastException at runtime. Exists only for backward compatibility.', level: 'Easy' },
    { q: 'Can a static method use the class type parameter T?', a: 'No. T belongs to an instance (Box<String> vs Box<Integer>), but static members are shared. A static method can declare its own type parameter: static <U> void m(U u).', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a generic class Stack<T> using an ArrayList with push, pop, peek and isEmpty. Test it with Integer and String.',
      hint: 'Store elements in ArrayList<T>; pop removes the last element.',
      solution: `import java.util.ArrayList;

class Stack<T> {
    private final ArrayList<T> items = new ArrayList<>();
    void push(T item) { items.add(item); }
    T pop() {
        if (items.isEmpty()) throw new RuntimeException("Stack is empty");
        return items.remove(items.size() - 1);
    }
    T peek() { return items.get(items.size() - 1); }
    boolean isEmpty() { return items.isEmpty(); }
}

public class Main {
    public static void main(String[] args) {
        Stack<Integer> s = new Stack<>();
        s.push(1); s.push(2); s.push(3);
        System.out.println(s.pop());  // 3
        System.out.println(s.peek()); // 2
        Stack<String> words = new Stack<>();
        words.push("Java");
        System.out.println(words.pop()); // Java
    }
}`,
    },
    {
      task: 'Write a generic method static <T> void swap(T[] arr, int i, int j) and test it on a String array.',
      hint: 'Use a temp variable of type T.',
      solution: `import java.util.Arrays;

public class Main {
    static <T> void swap(T[] arr, int i, int j) {
        T temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    public static void main(String[] args) {
        String[] a = {"x", "y", "z"};
        swap(a, 0, 2);
        System.out.println(Arrays.toString(a)); // [z, y, x]
    }
}`,
    },
    {
      task: 'Write static <T extends Comparable<T>> int countGreater(List<T> list, T limit) that counts elements greater than limit.',
      hint: 'Use compareTo(limit) > 0.',
      solution: `import java.util.List;

public class Main {
    static <T extends Comparable<T>> int countGreater(List<T> list, T limit) {
        int count = 0;
        for (T item : list) if (item.compareTo(limit) > 0) count++;
        return count;
    }
    public static void main(String[] args) {
        System.out.println(countGreater(List.of(5, 12, 8, 20), 10));       // 2
        System.out.println(countGreater(List.of("ant", "cat", "bee"), "b")); // 2
    }
}`,
    },
    {
      task: 'Write static void copyAll(List<? extends T> src, List<? super T> dest) as a generic method and copy a List<Integer> into a List<Number>.',
      hint: 'Declare <T> on the method; read from src and add to dest.',
      solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    static <T> void copyAll(List<? extends T> src, List<? super T> dest) {
        for (T item : src) dest.add(item);
    }
    public static void main(String[] args) {
        List<Integer> src = List.of(1, 2, 3);
        List<Number> dest = new ArrayList<>();
        copyAll(src, dest);
        System.out.println(dest); // [1, 2, 3]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which declaration is INVALID?', options: ['List<Integer> a;', 'List<int> a;', 'List<?> a;', 'List<? super Integer> a;'], answer: 1, explanation: 'Primitives cannot be type arguments; use Integer.' },
    { question: 'Where is the type parameter declared in a generic method?', options: ['After the method name', 'After the return type', 'Before the return type', 'Inside the parameter list'], answer: 2, explanation: 'Example: static <T> void print(T x) — <T> comes before the return type.' },
    { question: 'Which list can be passed to void m(List<? super Integer> l)?', options: ['List<Double>', 'List<String>', 'List<Short>', 'List<Number>'], answer: 3, explanation: 'Number is a supertype of Integer, so List<Number> matches ? super Integer.' },
    { question: 'Generic type information at runtime is removed by:', options: ['Type erasure', 'Autoboxing', 'Garbage collection', 'Reflection'], answer: 0, explanation: 'Type erasure removes generic types after compilation.' },
    { question: 'In <T extends Comparable<T>>, what does extends mean?', options: ['T must be a class only', 'T must be a subtype of / implement Comparable<T>', 'T inherits from Object only', 'T cannot be null'], answer: 1, explanation: 'In bounds, extends covers both extending classes and implementing interfaces.' },
  ],
};
