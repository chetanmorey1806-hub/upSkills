const ex1 = `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Product implements Comparable<Product> {
    int id;
    String name;
    double price;

    Product(int id, String name, double price) {
        this.id = id;
        this.name = name;
        this.price = price;
    }

    @Override
    public int compareTo(Product other) {
        return Integer.compare(this.id, other.id);   // natural order = by id
    }

    @Override
    public String toString() {
        return id + ":" + name + ":" + price;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Product> list = new ArrayList<>();
        list.add(new Product(3, "Mouse", 499.0));
        list.add(new Product(1, "Laptop", 55000.0));
        list.add(new Product(2, "Keyboard", 999.0));

        Collections.sort(list);          // uses compareTo
        list.forEach(System.out::println);
    }
}`;

const ex2 = `import java.util.*;

record Emp(String name, String dept, int salary) { }

public class Main {
    static List<String> names(List<Emp> list) {
        List<String> out = new ArrayList<>();
        for (Emp e : list) out.add(e.name());
        return out;
    }

    public static void main(String[] args) {
        List<Emp> emps = new ArrayList<>(List.of(
                new Emp("Ravi", "IT", 60000),
                new Emp("Anu", "HR", 50000),
                new Emp("Kiran", "IT", 75000),
                new Emp("Bina", "HR", 50000),
                new Emp("Dev", "Sales", 60000)));

        // 1. Anonymous class (old style)
        emps.sort(new Comparator<Emp>() {
            @Override
            public int compare(Emp a, Emp b) {
                return a.name().compareTo(b.name());
            }
        });
        System.out.println("By name: " + names(emps));

        // 2. Lambda
        List<Emp> bySalary = new ArrayList<>(List.of(
                new Emp("Ravi", "IT", 60000),
                new Emp("Anu", "HR", 50000),
                new Emp("Kiran", "IT", 75000),
                new Emp("Bina", "HR", 50000),
                new Emp("Dev", "Sales", 60000)));
        bySalary.sort((a, b) -> Integer.compare(b.salary(), a.salary()));
        System.out.println("By salary desc: " + names(bySalary));

        // 3. Comparator chain (Java 8)
        emps.sort(Comparator.comparing(Emp::dept)
                .thenComparing(Emp::salary, Comparator.reverseOrder())
                .thenComparing(Emp::name));
        for (Emp e : emps) {
            System.out.println(e.dept() + " " + e.salary() + " " + e.name());
        }
    }
}`;

const ex3 = `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(Arrays.asList("zoe", "Adam", null, "bob", "Eve"));

        names.sort(Comparator.nullsFirst(Comparator.naturalOrder()));
        System.out.println(names);

        names.sort(Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        System.out.println(names);

        names.removeIf(Objects::isNull);
        names.sort(Comparator.comparing(String::length).thenComparing(Comparator.reverseOrder()));
        System.out.println(names);
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.Collections;
import java.util.Comparator;

public class Main {
    public static void main(String[] args) {
        String[] words = {"banana", "kiwi", "apple", "fig"};
        Arrays.sort(words);
        System.out.println(Arrays.toString(words));
        Arrays.sort(words, Comparator.comparing(String::length));
        System.out.println(Arrays.toString(words));

        Integer[] nums = {5, 1, 4};
        Arrays.sort(nums, Collections.reverseOrder());
        System.out.println(Arrays.toString(nums));

        // Why "return a - b" is dangerous in compare()
        int a = Integer.MIN_VALUE, b = 1;
        System.out.println("a - b = " + (a - b));
        System.out.println("Integer.compare(a, b) = " + Integer.compare(a, b));
    }
}`;

export default {
  id: 'day-12-comparable-vs-comparator',
  title: 'Comparable vs Comparator, Sorting Custom Objects',
  module: 'Module 3: Sorting, Utilities & Advanced',
  day: 12,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn the two ways Java compares objects - Comparable for a class\'s single natural order and Comparator for any number of external orders - and sort custom objects using lambdas and the Java 8 Comparator API.',
  objectives: [
    'Implement Comparable<T> and its compareTo() method correctly',
    'Write Comparators as anonymous classes, lambdas and method-reference chains',
    'Use comparing, thenComparing, reversed, nullsFirst/nullsLast',
    'Sort lists and arrays with Collections.sort, List.sort and Arrays.sort',
    'Avoid common compare() bugs such as subtraction overflow',
  ],
  theory: [
    {
      heading: 'Why do we need comparison logic?',
      content:
        'Java knows how to sort numbers and Strings, but how should it sort Student objects - by roll number, by name, or by marks? We must tell it. Comparable defines the ONE default way (natural order) inside the class. Comparator defines EXTRA ways outside the class. Think of a school: roll number order is the natural order printed on the attendance sheet; sorting by height for a group photo is an external Comparator.',
    },
    {
      heading: 'Comparable<T> (java.lang)',
      content:
        'The class itself implements Comparable and its compareTo method. Return a negative number if this < other, zero if equal, positive if this > other. String, Integer, LocalDate and all wrapper classes already implement Comparable.',
      syntax: `class Student implements Comparable<Student> {
    public int compareTo(Student o) {
        return Integer.compare(this.roll, o.roll);
    }
}
Collections.sort(list);   // uses compareTo
new TreeSet<>(list);      // uses compareTo`,
      points: [
        'Only one natural ordering per class',
        'You need access to the class source to add it',
        'Should be consistent with equals: compareTo == 0 exactly when equals is true',
      ],
    },
    {
      heading: 'Comparator<T> (java.util)',
      content:
        'A separate object with compare(a, b). You can create as many Comparators as you like without touching the class - even for classes you did not write. It is a functional interface, so lambdas work.',
      syntax: `Comparator<Student> byName = (a, b) -> a.getName().compareTo(b.getName());
Comparator<Student> byName2 = Comparator.comparing(Student::getName);
list.sort(byName);
Collections.sort(list, byName);`,
    },
    {
      heading: 'Java 8 Comparator API',
      content: 'Build complex orders by chaining small pieces.',
      syntax: `Comparator.comparing(Emp::dept)                       // by key
Comparator.comparingInt(Emp::salary)                  // primitive, no boxing
.reversed()                                           // reverse whole chain so far
.thenComparing(Emp::name)                             // tie-breaker
.thenComparing(Emp::salary, Comparator.reverseOrder())// tie-breaker, descending
Comparator.naturalOrder() / Comparator.reverseOrder()
Comparator.nullsFirst(cmp) / Comparator.nullsLast(cmp)`,
      tip: 'reversed() reverses everything chained BEFORE it. comparing(A).thenComparing(B).reversed() reverses both A and B. Use thenComparing(B, Comparator.reverseOrder()) to reverse only B.',
    },
    {
      heading: 'Comparable vs Comparator - differences',
      content: 'The classic interview table.',
      points: [
        'Package: java.lang.Comparable vs java.util.Comparator',
        'Method: compareTo(T o) vs compare(T a, T b)',
        'Count: one natural order vs many custom orders',
        'Where: inside the class (modify source) vs separate class/lambda (no change to source)',
        'Used by: Collections.sort(list), TreeSet/TreeMap by default vs sort(list, cmp), new TreeSet<>(cmp)',
      ],
    },
    {
      heading: 'Common mistakes',
      content: 'These bugs show up in real code and interviews.',
      points: [
        'return a - b; can overflow for large/negative ints. Use Integer.compare(a, b)',
        'Comparing doubles with (int)(a - b) - 0.5 becomes 0. Use Double.compare',
        'Not handling null - use Comparator.nullsFirst/nullsLast',
        'Inconsistent compareTo and equals - TreeSet may drop "duplicates" that are not equal',
        'Sorting an immutable List.of(...) -> UnsupportedOperationException',
      ],
    },
  ],
  examples: [
    {
      title: 'Natural ordering with Comparable',
      scenario: 'Products should be listed by id by default.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type Product and Main in one file', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `1:Laptop:55000.0
2:Keyboard:999.0
3:Mouse:499.0`,
      explanation: 'Collections.sort uses Product.compareTo, which compares ids with Integer.compare. System.out::println calls toString on each product.',
    },
    {
      title: 'Three ways to write a Comparator',
      scenario: 'HR wants employees sorted by name, by salary (highest first), and by department then salary (highest first) then name.',
      steps: ['In Eclipse: New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `By name: [Anu, Bina, Dev, Kiran, Ravi]
By salary desc: [Kiran, Ravi, Dev, Anu, Bina]
HR 50000 Anu
HR 50000 Bina
IT 75000 Kiran
IT 60000 Ravi
Sales 60000 Dev`,
      explanation:
        'List.sort is stable: Ravi and Dev both earn 60000 and keep their original order (Ravi first), and the same for Anu and Bina. The chain sorts by dept alphabetically, then salary descending, then name - so Anu comes before Bina within HR.',
    },
    {
      title: 'Handling nulls and case with Comparator helpers',
      scenario: 'A list of user names contains a null and mixed case. Sort it in different ways.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `[null, Adam, Eve, bob, zoe]
[Adam, bob, Eve, zoe, null]
[zoe, bob, Eve, Adam]`,
      explanation:
        'Natural String order puts uppercase before lowercase (Adam, Eve, bob, zoe). CASE_INSENSITIVE_ORDER gives a dictionary feel. In the last sort, three-letter names come first in reverse alphabetical order (z > b > E in Unicode), then Adam (4 letters).',
    },
    {
      title: 'Sorting arrays and the subtraction trap',
      scenario: 'Sort String and Integer arrays with Comparators and see why a - b is risky.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `[apple, banana, fig, kiwi]
[fig, kiwi, apple, banana]
[5, 4, 1]
a - b = 2147483647
Integer.compare(a, b) = -1`,
      explanation:
        'Arrays.sort with a Comparator only works for object arrays (Integer[], not int[]). Integer.MIN_VALUE - 1 overflows to Integer.MAX_VALUE, a positive number, which would wrongly claim a > b. Integer.compare returns the correct -1.',
    },
  ],
  interview: [
    { q: 'Difference between Comparable and Comparator?', a: 'Comparable (java.lang) defines one natural order inside the class via compareTo(T). Comparator (java.util) defines external orders via compare(T, T); you can have many and need not modify the class.', level: 'Easy' },
    { q: 'What does compareTo return?', a: 'A negative int if this is less than the argument, zero if equal, positive if greater. Only the sign matters.', level: 'Easy' },
    { q: 'Why should we avoid return a - b in compare()?', a: 'Integer overflow for large magnitudes (e.g. MIN_VALUE - 1) can flip the sign and corrupt sorting. Use Integer.compare(a, b).', level: 'Medium' },
    { q: 'How do you sort a list in descending order?', a: 'list.sort(Comparator.reverseOrder()), Collections.sort(list, Collections.reverseOrder()) or cmp.reversed().', level: 'Easy' },
    { q: 'What happens if you call Collections.sort on a list of objects that do not implement Comparable?', a: 'Compile-time error, because sort(List<T>) requires T extends Comparable<? super T>. With raw types it fails at runtime with ClassCastException.', level: 'Medium' },
    { q: 'Is Collections.sort stable?', a: 'Yes. For objects Java uses TimSort, which is stable - equal elements keep their relative order.', level: 'Medium' },
    { q: 'What does compareTo "consistent with equals" mean?', a: '(a.compareTo(b) == 0) == a.equals(b). If not consistent, sorted sets/maps (which use compareTo) behave differently from hash sets/maps (which use equals).', level: 'Hard' },
    { q: 'Output? List<String> l = new ArrayList<>(List.of("b","C","a")); Collections.sort(l); System.out.println(l);', a: '[C, a, b] - uppercase letters sort before lowercase in Unicode.', level: 'Medium' },
    { q: 'How do you sort by multiple fields?', a: 'Comparator.comparing(f1).thenComparing(f2).thenComparing(f3), optionally with reversed() or a key comparator for descending fields.', level: 'Easy' },
    { q: 'Is Comparator a functional interface? It has more than one method.', a: 'Yes. It has only one abstract method, compare(). equals() is inherited from Object, and the rest are default/static methods.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Make a Book class (title, price) implement Comparable by price. Sort 3 books and print titles.',
      hint: 'Double.compare(this.price, o.price).',
      solution: `import java.util.*;

class Book implements Comparable<Book> {
    String title; double price;
    Book(String t, double p) { title = t; price = p; }
    public int compareTo(Book o) { return Double.compare(price, o.price); }
}

public class Main {
    public static void main(String[] args) {
        List<Book> books = new ArrayList<>(List.of(
            new Book("Java", 550), new Book("SQL", 300), new Book("Spring", 700)));
        Collections.sort(books);
        for (Book b : books) System.out.println(b.title); // SQL, Java, Spring
    }
}`,
    },
    {
      task: 'Sort a list of Strings by length descending, and alphabetically for equal lengths.',
      hint: 'Comparator.comparingInt(String::length).reversed().thenComparing(Comparator.naturalOrder()).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> l = new ArrayList<>(List.of("pear", "fig", "banana", "kiwi"));
        l.sort(Comparator.comparingInt(String::length).reversed()
                .thenComparing(Comparator.naturalOrder()));
        System.out.println(l); // [banana, kiwi, pear, fig]
    }
}`,
    },
    {
      task: 'Sort students by marks descending; if marks tie, by name ascending. Use a record Student(String name, int marks).',
      hint: 'comparingInt(Student::marks).reversed().thenComparing(Student::name).',
      solution: `import java.util.*;

record Student(String name, int marks) { }

public class Main {
    public static void main(String[] args) {
        List<Student> s = new ArrayList<>(List.of(
            new Student("Zara", 88), new Student("Amit", 92), new Student("Bela", 88)));
        s.sort(Comparator.comparingInt(Student::marks).reversed().thenComparing(Student::name));
        s.forEach(x -> System.out.println(x.name() + " " + x.marks()));
        // Amit 92, Bela 88, Zara 88
    }
}`,
    },
    {
      task: 'Create a TreeMap<String, Integer> that orders keys by length then alphabetically, insert "ccc", "a", "bb", "aa" and print it.',
      hint: 'Pass the comparator to the TreeMap constructor.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> m = new TreeMap<>(
            Comparator.comparingInt(String::length).thenComparing(Comparator.naturalOrder()));
        for (String k : List.of("ccc", "a", "bb", "aa")) m.put(k, k.length());
        System.out.println(m); // {a=1, aa=2, bb=2, ccc=3}
    }
}`,
    },
  ],
  quiz: [
    { question: 'Comparable belongs to package:', options: ['java.util', 'java.lang', 'java.io', 'java.util.function'], answer: 1, explanation: 'Comparable is in java.lang; Comparator is in java.util.' },
    { question: 'Which method does Comparator declare as abstract?', options: ['compareTo(T)', 'equals(T)', 'compare(T, T)', 'sort(List)'], answer: 2, explanation: 'compare(T o1, T o2) is the single abstract method.' },
    { question: 'Best way to compare two int fields in compare()?', options: ['a - b', 'Integer.compare(a, b)', 'a == b ? 0 : 1', '(a > b) ? 1 : 0'], answer: 1, explanation: 'Integer.compare avoids overflow and handles all three cases.' },
    { question: 'Comparator.comparing(Emp::dept).thenComparing(Emp::name).reversed() reverses:', options: ['Both dept and name', 'Only name', 'Only dept', 'Nothing'], answer: 0, explanation: 'reversed() applies to the whole chain built so far.' },
    { question: 'Arrays.sort(arr, Collections.reverseOrder()) works when arr is:', options: ['int[]', 'double[]', 'char[]', 'Integer[]'], answer: 3, explanation: 'Comparator-based sorts need object arrays.' },
  ],
};
