const ex1 = `import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Riya", "Aman", "Zoya", "Bob"));

        // Before Java 8: anonymous inner class
        Collections.sort(names, new Comparator<String>() {
            @Override
            public int compare(String a, String b) {
                return a.compareTo(b);
            }
        });
        System.out.println("Anonymous class: " + names);

        // Java 8: lambda expression
        names.sort((a, b) -> b.compareTo(a));
        System.out.println("Lambda (reverse): " + names);

        // Sort by length, then alphabetically
        names.sort((a, b) -> {
            if (a.length() != b.length()) return a.length() - b.length();
            return a.compareTo(b);
        });
        System.out.println("By length: " + names);

        Runnable hello = () -> System.out.println("Hello from a lambda Runnable");
        hello.run();
    }
}`;

const ex2 = `@FunctionalInterface
interface Calculator {
    int calc(int a, int b);          // exactly ONE abstract method
}

@FunctionalInterface
interface Greeter {
    String greet(String name);

    default String greetAll(String a, String b) {   // default methods are allowed
        return greet(a) + " & " + greet(b);
    }
}

public class Main {
    static int operate(int a, int b, Calculator c) {
        return c.calc(a, b);
    }

    public static void main(String[] args) {
        Calculator add = (a, b) -> a + b;
        Calculator max = (a, b) -> a > b ? a : b;
        Calculator power = (base, exp) -> {
            int result = 1;
            for (int i = 0; i < exp; i++) result *= base;
            return result;
        };

        System.out.println("add: " + add.calc(7, 3));
        System.out.println("max: " + max.calc(7, 3));
        System.out.println("power: " + power.calc(2, 10));
        System.out.println("passed as argument: " + operate(9, 4, (x, y) -> x - y));

        Greeter g = name -> "Hi " + name;      // single parameter: no brackets needed
        System.out.println(g.greet("Riya"));
        System.out.println(g.greetAll("Aman", "Zoya"));
    }
}`;

const ex3 = `import java.util.ArrayList;
import java.util.List;
import java.util.function.Supplier;

public class Main {
    private int instanceCounter = 0;

    void demo() {
        Runnable r = () -> {
            instanceCounter++;                      // instance fields CAN be modified
            System.out.println("this inside lambda is Main: " + (this instanceof Main));
        };
        r.run();
        r.run();
        System.out.println("instanceCounter = " + instanceCounter);
    }

    public static void main(String[] args) {
        String prefix = "Order-";                   // effectively final
        int base = 100;
        Supplier<String> next = () -> prefix + (base + 1);
        System.out.println(next.get());
        // base++;   // compile error: variable used in lambda must be effectively final

        List<Runnable> tasks = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            final int n = i;                        // copy loop variable
            tasks.add(() -> System.out.println("Task " + n));
        }
        tasks.forEach(Runnable::run);

        new Main().demo();
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.List;

class Employee {
    String name;
    String dept;
    double salary;

    Employee(String name, String dept, double salary) {
        this.name = name; this.dept = dept; this.salary = salary;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> emps = new ArrayList<>(List.of(
                new Employee("Riya", "IT", 65000),
                new Employee("Aman", "HR", 40000),
                new Employee("Zoya", "IT", 80000),
                new Employee("Bob", "Sales", 35000)));

        System.out.println("-- All employees --");
        emps.forEach(e -> System.out.println(e.name + " (" + e.dept + ")"));

        emps.removeIf(e -> e.salary < 38000);            // Predicate lambda
        System.out.println("After removeIf: " + emps.size() + " employees");

        emps.sort((a, b) -> Double.compare(b.salary, a.salary));
        System.out.println("Top earner: " + emps.get(0).name);

        emps.forEach(e -> {
            if (e.dept.equals("IT")) e.salary = e.salary * 1.10;   // 10% hike
        });
        emps.forEach(e -> System.out.printf("%s: %.1f%n", e.name, e.salary));
    }
}`;

export default {
  id: 'day-38-lambda-expressions',
  title: 'Lambda Expressions and Functional Interfaces',
  module: 'Module 7: Java 8+ Features',
  day: 38,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Lambda expressions (Java 8) let you pass behaviour as data with short, readable syntax. Learn lambda syntax, functional interfaces, @FunctionalInterface, variable capture rules, and how lambdas replace anonymous classes in sorting, threads and collections.',
  objectives: [
    'Write lambda expressions in all syntax forms',
    'Define and use functional interfaces with @FunctionalInterface',
    'Replace anonymous inner classes with lambdas',
    'Understand effectively final variables and this inside lambdas',
    'Use lambdas with forEach, removeIf, sort and Runnable',
  ],
  theory: [
    {
      heading: 'What is a Lambda Expression?',
      content: 'A lambda is an anonymous function: a block of code with parameters and a body but no name, no class and no return type declaration. Think of it as a sticky note with instructions you hand to someone ("when you get two numbers, add them") instead of hiring a whole person (a class) for that one job. Lambdas enable functional programming in Java and make code shorter and clearer.',
      syntax: `(parameters) -> expression
(parameters) -> { statements; }

() -> System.out.println("Hi")           // no parameters
x -> x * x                              // one parameter, brackets optional
(a, b) -> a + b                         // two parameters, types inferred
(int a, int b) -> a + b                 // explicit types
(a, b) -> { int s = a + b; return s; }  // block body needs return`,
      points: [
        'Arrow token -> separates parameters and body',
        'Expression body returns its value automatically; block body needs return',
        'Parameter types are inferred from the target functional interface',
        'Java 11+: (var a, var b) -> a + b is allowed (useful with annotations)',
      ],
    },
    {
      heading: 'Functional Interfaces',
      content: 'A lambda needs a "target type": a functional interface. A functional interface has exactly ONE abstract method (SAM = Single Abstract Method). It may still have any number of default and static methods, and methods from Object (like equals) do not count. The lambda becomes the implementation of that single method.',
      syntax: `@FunctionalInterface
interface Calculator {
    int calc(int a, int b);
}
Calculator add = (a, b) -> a + b;
add.calc(2, 3);   // 5`,
      points: [
        '@FunctionalInterface is optional but makes the compiler check there is exactly one abstract method',
        'Existing examples: Runnable (run), Callable (call), Comparator (compare), Comparable (compareTo), ActionListener',
        'java.util.function has 40+ ready-made ones: Predicate, Function, Consumer, Supplier... (Day 39)',
      ],
      tip: 'Adding a second abstract method to an interface marked @FunctionalInterface causes a compile error — great protection for teammates.',
    },
    {
      heading: 'Lambda vs Anonymous Inner Class',
      content: 'Before Java 8 the only way to pass behaviour was an anonymous class, which needs 5-6 lines of boilerplate for 1 line of logic. Lambdas remove the ceremony. However, they are not identical.',
      points: [
        'Anonymous class can implement interfaces with many methods or extend abstract classes; a lambda only implements a functional interface',
        'Inside an anonymous class, this refers to the anonymous object; inside a lambda, this refers to the enclosing object',
        'Anonymous classes create a separate .class file (Main$1.class); lambdas use invokedynamic and do not',
        'Anonymous classes can have state (fields); lambdas cannot',
      ],
    },
    {
      heading: 'Variable Capture: Effectively Final',
      content: 'A lambda can use local variables from the surrounding method, but only if they are final or effectively final (never changed after assignment). The lambda takes a snapshot copy of the value, like taking a photo — if the original could keep changing, the photo would be misleading. Instance and static fields can be read AND modified because they live on the heap.',
      syntax: `int base = 10;
Function<Integer, Integer> f = x -> x + base;   // OK
// base = 20;     // makes base not effectively final -> compile error above`,
      tip: 'In loops, copy the loop variable to a final local (final int n = i;) before using it inside a lambda.',
    },
    {
      heading: 'Where Lambdas Are Used Every Day',
      content: 'Lambdas are everywhere in modern Java: sorting lists, starting threads, iterating collections, filtering data, event handlers and the Stream API.',
      syntax: `list.forEach(x -> System.out.println(x));
list.removeIf(x -> x < 0);
list.sort((a, b) -> a.compareTo(b));
map.forEach((k, v) -> System.out.println(k + "=" + v));
new Thread(() -> doWork()).start();
list.replaceAll(s -> s.toUpperCase());`,
      points: [
        'Keep lambdas short (1-3 lines). If longer, move the code into a method and use a method reference',
        'Lambdas cannot throw checked exceptions unless the functional interface method declares them',
      ],
    },
  ],
  examples: [
    {
      title: 'From Anonymous Class to Lambda (Sorting)',
      scenario: 'Sort a list of names alphabetically, in reverse, and by length — comparing the old and new styles.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the code; IntelliJ highlights the anonymous class with "Replace with lambda" (Alt+Enter)', 'Click Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Anonymous class: [Aman, Bob, Riya, Zoya]
Lambda (reverse): [Zoya, Riya, Bob, Aman]
By length: [Bob, Aman, Riya, Zoya]
Hello from a lambda Runnable`,
      explanation: 'Both versions implement Comparator.compare(). The lambda (a, b) -> b.compareTo(a) gives reverse order. In the length sort, "Bob" (3 letters) comes first; the 4-letter names are ordered alphabetically.',
    },
    {
      title: 'Custom Functional Interface Calculator',
      scenario: 'A calculator app lets the user plug in any operation as a lambda.',
      steps: ['Create Main.java', 'Declare the Calculator and Greeter interfaces with @FunctionalInterface', 'Write different lambdas for the same interface', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `add: 10
max: 7
power: 1024
passed as argument: 5
Hi Riya
Hi Aman & Hi Zoya`,
      explanation: 'One interface, many behaviours. The operate() method does not know which operation it runs — behaviour is passed as a parameter. The default method greetAll() reuses the lambda implementation of greet().',
    },
    {
      title: 'Effectively Final Variables and this in Lambdas',
      scenario: 'Understand which variables a lambda can use and change.',
      steps: ['Create Main.java', 'Uncomment base++ to see the compile error "local variables referenced from a lambda expression must be final or effectively final"', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Order-101
Task 1
Task 2
Task 3
this inside lambda is Main: true
this inside lambda is Main: true
instanceCounter = 2`,
      explanation: 'prefix and base are never modified, so they are effectively final. Each loop iteration copies i into a new final variable n. Inside demo(), this in the lambda refers to the Main object, and instance fields can be modified.',
    },
    {
      title: 'Lambdas with Collections: forEach, removeIf, sort',
      scenario: 'An HR tool lists employees, removes low earners, finds the top earner and gives IT a 10% hike.',
      steps: ['Create Main.java with Employee class', 'Use forEach, removeIf and sort with lambdas', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `-- All employees --
Riya (IT)
Aman (HR)
Zoya (IT)
Bob (Sales)
After removeIf: 3 employees
Top earner: Zoya
Zoya: 88000.0
Riya: 71500.0
Aman: 40000.0`,
      explanation: 'removeIf takes a Predicate lambda and removes Bob (35000). Sorting in descending salary order puts Zoya first. The forEach block lambda updates IT salaries: 80000 * 1.1 = 88000 and 65000 * 1.1 = 71500.',
    },
  ],
  interview: [
    { q: 'What is a lambda expression?', a: 'An anonymous function introduced in Java 8 that provides a concise implementation of a functional interface\'s single abstract method: (params) -> body.', level: 'Easy' },
    { q: 'What is a functional interface?', a: 'An interface with exactly one abstract method. It can have default and static methods. Examples: Runnable, Comparator, Callable, Predicate.', level: 'Easy' },
    { q: 'Is @FunctionalInterface mandatory?', a: 'No. Any interface with one abstract method works with lambdas. The annotation makes the compiler enforce the rule.', level: 'Easy' },
    { q: 'Can a functional interface have multiple default methods?', a: 'Yes, any number of default and static methods, plus abstract methods that override public Object methods (like equals), as long as only one other abstract method exists.', level: 'Medium' },
    { q: 'What does effectively final mean?', a: 'A local variable that is not declared final but is never reassigned after initialization. Lambdas and anonymous classes can capture only final or effectively final locals.', level: 'Medium' },
    { q: 'Why must captured variables be effectively final?', a: 'Lambdas capture a copy of the value; local variables live on the stack and may disappear. Allowing changes would make the copy inconsistent and cause concurrency bugs.', level: 'Hard' },
    { q: 'What does this refer to inside a lambda vs anonymous class?', a: 'Lambda: the enclosing instance (lambdas do not create a new scope). Anonymous class: the anonymous class instance itself.', level: 'Medium' },
    { q: 'What is the output? Runnable r = () -> System.out.println("Hi"); System.out.println("A"); r.run();', a: 'A then Hi. Creating a lambda does not execute it; run() does.', level: 'Easy' },
    { q: 'Can a lambda throw a checked exception?', a: 'Only if the functional interface method declares it (e.g. Callable.call() throws Exception). Otherwise you must catch it inside the lambda.', level: 'Medium' },
    { q: 'How are lambdas compiled?', a: 'Using invokedynamic and LambdaMetafactory at runtime; the body becomes a private synthetic method. No separate .class file is generated like for anonymous classes.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Create a functional interface StringOp with String apply(String s). Write lambdas for uppercase, reverse and "add exclamation", and apply each to "java".',
      hint: 'Use new StringBuilder(s).reverse().toString() for reverse.',
      solution: `@FunctionalInterface
interface StringOp { String apply(String s); }

public class Main {
    public static void main(String[] args) {
        StringOp upper = s -> s.toUpperCase();
        StringOp reverse = s -> new StringBuilder(s).reverse().toString();
        StringOp excite = s -> s + "!";
        System.out.println(upper.apply("java"));   // JAVA
        System.out.println(reverse.apply("java")); // avaj
        System.out.println(excite.apply("java"));  // java!
    }
}`,
    },
    {
      task: 'Write a method static boolean check(int n, NumberTest t) and lambdas isEven, isPositive and isPrime. Test with 7.',
      hint: 'interface NumberTest { boolean test(int n); }',
      solution: `interface NumberTest { boolean test(int n); }

public class Main {
    static boolean check(int n, NumberTest t) { return t.test(n); }
    public static void main(String[] args) {
        NumberTest isEven = n -> n % 2 == 0;
        NumberTest isPositive = n -> n > 0;
        NumberTest isPrime = n -> {
            if (n < 2) return false;
            for (int i = 2; i * i <= n; i++) if (n % i == 0) return false;
            return true;
        };
        System.out.println(check(7, isEven));     // false
        System.out.println(check(7, isPositive)); // true
        System.out.println(check(7, isPrime));    // true
    }
}`,
    },
    {
      task: 'Given a List<String> of words, use lambdas to: remove words shorter than 4 letters, convert the rest to uppercase with replaceAll, and print each with forEach.',
      hint: 'removeIf(w -> w.length() < 4); replaceAll(String::toUpperCase) or w -> w.toUpperCase().',
      solution: `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> words = new ArrayList<>(List.of("java", "is", "fun", "lambda", "code"));
        words.removeIf(w -> w.length() < 4);
        words.replaceAll(w -> w.toUpperCase());
        words.forEach(w -> System.out.println(w)); // JAVA LAMBDA CODE
    }
}`,
    },
    {
      task: 'Sort a list of Product(name, price) objects by price ascending and then by name descending using lambdas.',
      hint: 'Compare prices first with Double.compare; if equal, return b.name.compareTo(a.name).',
      solution: `import java.util.ArrayList;
import java.util.List;

class Product {
    String name; double price;
    Product(String n, double p) { name = n; price = p; }
}

public class Main {
    public static void main(String[] args) {
        List<Product> list = new ArrayList<>(List.of(
            new Product("Pen", 10), new Product("Book", 50), new Product("Ink", 10)));
        list.sort((a, b) -> {
            int c = Double.compare(a.price, b.price);
            return c != 0 ? c : b.name.compareTo(a.name);
        });
        list.forEach(p -> System.out.println(p.name + " " + p.price));
        // Pen 10.0, Ink 10.0, Book 50.0
    }
}`,
    },
  ],
  quiz: [
    { question: 'How many abstract methods does a functional interface have?', options: ['Zero', 'Exactly one', 'At least two', 'Any number'], answer: 1, explanation: 'Single Abstract Method (SAM).' },
    { question: 'Which is a VALID lambda?', options: ['x -> { return x * 2 }', '(x, y) -> return x + y;', 'x -> x * 2', '-> x * 2'], answer: 2, explanation: 'Expression body without return. Block bodies need braces, return and semicolons.' },
    { question: 'Inside a lambda, "this" refers to:', options: ['The lambda object', 'The enclosing class instance', 'null', 'The functional interface'], answer: 1, explanation: 'Lambdas do not introduce a new this.' },
    { question: 'A local variable used inside a lambda must be:', options: ['static', 'volatile', 'public', 'final or effectively final'], answer: 3, explanation: 'Captured locals cannot be reassigned.' },
    { question: 'Which annotation makes the compiler verify an interface has one abstract method?', options: ['@FunctionalInterface', '@Override', '@Lambda', '@SingleMethod'], answer: 0, explanation: '@FunctionalInterface enforces the SAM rule.' },
  ],
};
