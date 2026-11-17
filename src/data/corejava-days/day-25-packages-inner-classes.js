const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main). For real packages: IntelliJ right-click src > New > Package (Eclipse: File > New > Package), e.g. com.shop.model',
  'Type the code (this runnable demo uses the default package so it compiles with plain javac)',
  'Click Run ▶. Then open the out/ (IntelliJ) or bin/ (Eclipse) folder to see generated files like Outer$Inner.class',
];

const ex1 = `import java.util.ArrayList;          // single-type import
import java.util.*;                  // on-demand import: every class in java.util (not sub-packages)
import static java.lang.Math.max;    // static import

public class Main {
    public static void main(String[] args) {
        ArrayList<String> list = new ArrayList<>();
        list.add("Java");
        list.add("Spring");
        List<Integer> nums = Arrays.asList(5, 9, 2);
        System.out.println(list + " " + nums);

        // fully qualified name: no import needed
        java.time.LocalDate d = java.time.LocalDate.of(2025, 1, 26);
        System.out.println(d);

        System.out.println(max(10, 20));

        // same simple name in two packages: use fully qualified names
        System.out.println(java.util.Date.class.getName() + " vs " + java.sql.Date.class.getName());

        // java.lang is imported automatically
        System.out.println(String.class.getPackageName());
    }
}`;

const ex2 = `class Bank {
    private String name = "City Bank";
    private double rate = 7.5;

    class Account {                           // member inner class
        private double balance;

        Account(double balance) {
            this.balance = balance;
        }

        void show() {
            // inner class can read the OUTER object's private fields
            System.out.println(name + " account, balance " + balance + ", rate " + rate + "%");
        }
    }

    Account open(double amount) {
        return new Account(amount);           // inside Bank: plain new works
    }
}

class Outer {
    int x = 10;

    class Inner {
        int x = 20;

        void print() {
            int x = 30;
            System.out.println(x);            // local
            System.out.println(this.x);       // Inner's field
            System.out.println(Outer.this.x); // Outer's field
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Bank bank = new Bank();
        Bank.Account a1 = bank.new Account(5000);   // outside: needs an outer object
        Bank.Account a2 = bank.open(1200);
        a1.show();
        a2.show();

        Outer o = new Outer();
        Outer.Inner in = o.new Inner();
        in.print();
    }
}`;

const ex3 = `class Pizza {
    private final String size;
    private final boolean cheese;
    private final boolean olives;

    private Pizza(Builder b) {
        size = b.size;
        cheese = b.cheese;
        olives = b.olives;
    }

    @Override
    public String toString() {
        return size + " pizza, cheese=" + cheese + ", olives=" + olives;
    }

    static class Builder {                    // static nested class: no outer object needed
        private String size = "Medium";
        private boolean cheese;
        private boolean olives;

        Builder size(String size) {
            this.size = size;
            return this;
        }

        Builder cheese() {
            cheese = true;
            return this;
        }

        Builder olives() {
            olives = true;
            return this;
        }

        Pizza build() {
            return new Pizza(this);           // nested class can call Pizza's private constructor
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Pizza p1 = new Pizza.Builder().size("Large").cheese().build();
        Pizza p2 = new Pizza.Builder().olives().build();
        System.out.println(p1);
        System.out.println(p2);
    }
}`;

const ex4 = `import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

interface Greeter {
    String greet(String name);
}

public class Main {
    static int countVowels(String text) {
        class VowelChecker {                  // local inner class: visible only in this method
            boolean isVowel(char c) {
                return "aeiouAEIOU".indexOf(c) >= 0;
            }
        }
        VowelChecker vc = new VowelChecker();
        int count = 0;
        for (char c : text.toCharArray()) {
            if (vc.isVowel(c)) count++;
        }
        return count;
    }

    public static void main(String[] args) {
        System.out.println("Vowels in 'Inner Classes': " + countVowels("Inner Classes"));

        String prefix = "Namaste";            // effectively final: captured by the anonymous class
        Greeter g = new Greeter() {           // anonymous inner class implementing an interface
            @Override
            public String greet(String name) {
                return prefix + ", " + name;
            }
        };
        System.out.println(g.greet("Ishaan"));

        List<String> names = new ArrayList<>(List.of("Zara", "Al", "Mohan"));
        names.sort(new Comparator<String>() { // anonymous class implementing Comparator
            @Override
            public int compare(String a, String b) {
                return a.length() - b.length();
            }
        });
        System.out.println(names);
    }
}`;

const pkgCode = `// File: src/com/shop/model/Product.java
package com.shop.model;

public class Product {
    private final String name;
    private final double price;

    public Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    public String getName() { return name; }
    public double getPrice() { return price; }
}

// File: src/com/shop/app/ShopApp.java
package com.shop.app;

import com.shop.model.Product;     // import the class from another package

public class ShopApp {
    public static void main(String[] args) {
        Product p = new Product("Pen", 20.0);
        System.out.println(p.getName() + " costs " + p.getPrice());
    }
}

// Command line (from the src folder):
//   javac com/shop/model/Product.java com/shop/app/ShopApp.java
//   java com.shop.app.ShopApp`;

const pkgRunnable = `class Product {
    private final String name;
    private final double price;

    Product(String name, double price) {
        this.name = name;
        this.price = price;
    }

    String getName() { return name; }
    double getPrice() { return price; }
}

public class Main {
    public static void main(String[] args) {
        Product p = new Product("Pen", 20.0);
        System.out.println(p.getName() + " costs " + p.getPrice());
    }
}`;

const pr1 = `class Library {
    private String libName = "Central Library";

    class Book {
        String title;
        Book(String title) { this.title = title; }
        void info() { System.out.println(title + " @ " + libName); }
    }
}

public class Main {
    public static void main(String[] args) {
        Library lib = new Library();
        Library.Book b = lib.new Book("Clean Code");
        b.info();   // Clean Code @ Central Library
    }
}`;

const pr2 = `class Computer {
    static class Config {
        int ram;
        int storage;
        Config(int ram, int storage) { this.ram = ram; this.storage = storage; }
        public String toString() { return ram + "GB RAM / " + storage + "GB SSD"; }
    }
}

public class Main {
    public static void main(String[] args) {
        Computer.Config c = new Computer.Config(16, 512);   // no Computer object needed
        System.out.println(c);   // 16GB RAM / 512GB SSD
    }
}`;

const pr3 = `interface Discount {
    double apply(double amount);
}

public class Main {
    public static void main(String[] args) {
        Discount festive = new Discount() {
            public double apply(double amount) { return amount * 0.8; }
        };
        Discount lambda = amount -> amount - 50;   // same thing with a lambda
        System.out.println(festive.apply(1000));   // 800.0
        System.out.println(lambda.apply(1000));    // 950.0
    }
}`;

const pr4 = `public class Main {
    static void printTable(int n) {
        class Row {
            String make(int i) { return n + " x " + i + " = " + (n * i); }
        }
        Row r = new Row();
        for (int i = 1; i <= 3; i++) System.out.println(r.make(i));
    }

    public static void main(String[] args) {
        printTable(7);
        // 7 x 1 = 7
        // 7 x 2 = 14
        // 7 x 3 = 21
    }
}`;

export default {
  id: 'day-25-packages-inner-classes',
  title: 'Packages, Imports and Inner Classes (Member, Static Nested, Local, Anonymous)',
  module: 'Module 3: Object-Oriented Programming',
  day: 25,
  level: 'Intermediate',
  duration: '2.5 hours',
  summary:
    'Organise classes into packages, use imports and static imports correctly, and learn the four kinds of nested classes with their real-world uses such as the Builder pattern and anonymous Comparators.',
  objectives: [
    'Create packages and compile/run classes that live in packages',
    'Use single-type, on-demand, static and fully qualified imports',
    'Write member inner, static nested, local and anonymous classes',
    'Explain how inner classes access outer members and Outer.this',
  ],
  theory: [
    {
      heading: 'Packages',
      content:
        'A package is a folder-like namespace that groups related classes. Analogy: a city with areas and street names; two people named "Ravi" can live in different areas (com.shop.model.Product and com.erp.Product). Packages avoid name clashes, organise big projects, and work with access control (default/protected).',
      syntax: `package com.shop.model;     // must be the FIRST statement in the file
public class Product { ... }
// file location: src/com/shop/model/Product.java`,
      points: [
        'Naming: reverse domain, all lowercase: com.company.project.module.',
        'Built-in packages: java.lang (auto-imported), java.util, java.io, java.nio.file, java.time, java.sql.',
        'Typical project layers: controller, service, repository, model/entity, util, exception.',
        'Compile with folders: javac -d out src/com/shop/model/Product.java; run with the fully qualified name: java com.shop.app.ShopApp.',
      ],
    },
    {
      heading: 'Imports',
      content:
        'import lets you use a class by its simple name. Without it you must write the fully qualified name every time (java.util.ArrayList). import is only a compiler shortcut: it does not copy code, does not load classes, and does not slow down the program.',
      points: [
        'Single-type import: import java.util.ArrayList; (preferred, clear).',
        'On-demand import: import java.util.*; imports all classes of that package but NOT sub-packages (java.util.function is separate).',
        'Static import: import static java.lang.Math.PI; lets you write PI.',
        'Order in a file: package -> imports -> class declarations.',
        'Name conflict (java.util.Date and java.sql.Date): import one, write the full name of the other.',
      ],
      tip: 'IntelliJ: Ctrl+Alt+O optimizes imports; Eclipse: Ctrl+Shift+O organizes imports.',
    },
    {
      heading: 'Member Inner Class (Non-static)',
      content:
        'A class declared inside another class without static. Every inner object is tied to an outer object and can access all outer members, even private ones. Analogy: a room inside a specific house; you cannot have the room without the house. Create it with outer.new Inner() from outside.',
      syntax: `Bank bank = new Bank();
Bank.Account acc = bank.new Account(5000);
// inside Inner: Outer.this.field refers to the outer object's field`,
    },
    {
      heading: 'Static Nested Class',
      content:
        'A nested class marked static. It does NOT need an outer object and cannot directly access the outer class\'s instance members (only static ones). It is just a class placed inside another for grouping. Common uses: Builder pattern (Pizza.Builder), Map.Entry, helper/DTO classes.',
      syntax: `Pizza.Builder b = new Pizza.Builder();   // no outer object needed`,
    },
    {
      heading: 'Local and Anonymous Inner Classes',
      content:
        'A local class is declared inside a method and can only be used there. An anonymous class has no name: it is declared and instantiated in one expression, usually to implement an interface or extend a class for one-time use (event listeners, Comparators, Runnables). Both can use local variables only if they are final or effectively final.',
      points: [
        'Since Java 8, if the interface is functional (one abstract method), a lambda is shorter than an anonymous class.',
        'An anonymous class can extend a class OR implement one interface, not both, and has no constructor.',
        'Inside an anonymous class, this refers to the anonymous object; inside a lambda, this refers to the enclosing object.',
      ],
    },
    {
      heading: 'How the Compiler Names Nested Classes',
      content:
        'Each nested class becomes its own .class file: Bank$Account.class (member), Pizza$Builder.class (static nested), Main$1VowelChecker.class (local), Main$1.class, Main$2.class (anonymous). This is useful when you see these names in stack traces.',
    },
  ],
  examples: [
    {
      title: 'Imports, Static Import and Fully Qualified Names',
      scenario: 'A program uses classes from java.util, java.time and java.sql, including two classes named Date.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `[Java, Spring] [5, 9, 2]
2025-01-26
20
java.util.Date vs java.sql.Date
java.lang`,
      explanation:
        'ArrayList, List and Arrays come from imports. LocalDate is used with its full name. max() works without Math. thanks to the static import. The two Date classes are distinguished by package. String belongs to java.lang, which is always imported.',
    },
    {
      title: 'Classes in Packages (Project Layout)',
      scenario: 'A shop project keeps model classes in com.shop.model and the app in com.shop.app. The runnable version below is the same logic in the default package.',
      steps: [
        'IntelliJ: right-click src > New > Package > com.shop.model, then New > Java Class > Product; repeat for com.shop.app.ShopApp',
        'Eclipse: File > New > Package (com.shop.model), then File > New > Class inside it',
        'Make Product and its constructor/getters public so another package can use them; add import com.shop.model.Product; in ShopApp',
        'Run ShopApp with Run ▶ (or java com.shop.app.ShopApp from the compiled output folder)',
      ],
      code: pkgCode,
      java: { files: { 'Main.java': pkgRunnable } },
      result: `Pen costs 20.0`,
      explanation:
        'Across packages, only public classes and public members are visible, so Product, its constructor and getters are public. The import statement lets ShopApp use the simple name Product. The package declaration must match the folder path.',
    },
    {
      title: 'Member Inner Class and Outer.this',
      scenario: 'Accounts belong to a specific bank and need the bank\'s private name and rate.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `City Bank account, balance 5000.0, rate 7.5%
City Bank account, balance 1200.0, rate 7.5%
30
20
10`,
      explanation:
        'Account objects are created through a Bank object and read its private fields. In Inner.print(), x is the local (30), this.x is the inner field (20), Outer.this.x is the outer field (10).',
    },
    {
      title: 'Static Nested Class: Builder Pattern',
      scenario: 'Build pizzas with optional toppings in a readable, step-by-step way.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Large pizza, cheese=true, olives=false
Medium pizza, cheese=false, olives=true`,
      explanation:
        'Pizza.Builder is static, so it is created without a Pizza object. Each builder method returns this for chaining. build() calls Pizza\'s private constructor, which a nested class is allowed to do.',
    },
    {
      title: 'Local Class and Anonymous Classes',
      scenario: 'A text utility uses a helper class inside one method, plus anonymous classes for a greeter and a length-based sort.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Vowels in 'Inner Classes': 4
Namaste, Ishaan
[Al, Zara, Mohan]`,
      explanation:
        'Vowels: I, e, a, e = 4. The anonymous Greeter captures the effectively final variable prefix. The anonymous Comparator sorts by length: Al (2), Zara (4), Mohan (5).',
    },
  ],
  interview: [
    {
      q: 'What is a package and what are its advantages?',
      a: 'A namespace that groups related classes and interfaces. Advantages: avoids name conflicts, organises code, controls access (default/protected), makes classes easier to find and reuse.',
      level: 'Easy',
    },
    {
      q: 'Which package is imported by default?',
      a: 'java.lang (String, Math, System, Object, wrapper classes, Thread, exceptions such as RuntimeException).',
      level: 'Easy',
    },
    {
      q: 'Does import java.util.*; import java.util.function.Predicate?',
      a: 'No. Wildcard imports cover only classes directly in that package, not sub-packages. You need import java.util.function.*; or the specific class.',
      level: 'Medium',
    },
    {
      q: 'Does importing many classes slow down the program?',
      a: 'No. Imports are a compile-time convenience only; the bytecode uses fully qualified names, and classes are loaded lazily when first used.',
      level: 'Medium',
    },
    {
      q: 'What are the types of nested classes in Java?',
      a: 'Static nested class, and inner classes: member inner class, local inner class (inside a method) and anonymous inner class.',
      level: 'Easy',
    },
    {
      q: 'Difference between a static nested class and an inner class?',
      a: 'A static nested class does not need an outer instance and can access only static members of the outer class directly. An inner class is tied to an outer instance (outer.new Inner()) and can access all outer members including private instance fields.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass O { int v = 1; class I { int v = 2; void p() { int v = 3; System.out.println(v + " " + this.v + " " + O.this.v); } } }\nnew O().new I().p();',
      a: 'Output: 3 2 1. Local variable, inner field, outer field.',
      level: 'Medium',
    },
    {
      q: 'Why must local variables used in anonymous/local classes be effectively final?',
      a: 'The inner object may live longer than the method call, so Java copies the variable value into it. If the variable could change later, the copy and the original would disagree; requiring effectively final avoids that confusion.',
      level: 'Hard',
    },
    {
      q: 'Anonymous class vs lambda?',
      a: 'An anonymous class can implement interfaces with many methods or extend classes, can have state, and this refers to itself. A lambda works only for functional interfaces, is shorter, and this refers to the enclosing instance. Both produce objects, lambdas use invokedynamic instead of a separate class file.',
      level: 'Hard',
    },
    {
      q: 'What .class file names are generated for nested classes?',
      a: 'Outer$Inner.class for member/static nested classes, Outer$1Local.class for local classes, and Outer$1.class, Outer$2.class for anonymous classes.',
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Create a Library with a member inner class Book that prints the library\'s private name.',
      hint: 'Library.Book b = lib.new Book("...");',
      solution: pr1,
    },
    {
      task: 'Create a static nested class Computer.Config and instantiate it without creating a Computer.',
      hint: 'new Computer.Config(16, 512)',
      solution: pr2,
    },
    {
      task: 'Implement a Discount interface once with an anonymous class and once with a lambda.',
      hint: 'Discount has one abstract method, so a lambda works.',
      solution: pr3,
    },
    {
      task: 'Print a multiplication table using a local class inside the method.',
      hint: 'The local class can read the method parameter n because it is effectively final.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Where must the package statement appear?',
      options: ['After imports', 'Anywhere', 'First statement in the file (comments allowed before it)', 'Inside the class'],
      answer: 2,
      explanation: 'package must come before imports and class declarations.',
    },
    {
      question: 'How do you create a member inner class object from outside the outer class?',
      options: ['new Outer.Inner()', 'outerObj.new Inner()', 'Inner.new()', 'new Inner(outerObj)'],
      answer: 1,
      explanation: 'An inner class instance needs an outer instance: outerObj.new Inner().',
    },
    {
      question: 'Which nested class does NOT need an instance of the outer class?',
      options: ['Static nested class', 'Member inner class', 'Anonymous class in an instance method', 'Local class in an instance method'],
      answer: 0,
      explanation: 'Static nested classes are independent of outer instances.',
    },
    {
      question: 'Which statement imports Math.sqrt so it can be called as sqrt(x)?',
      options: ['import java.lang.Math;', 'import java.lang.Math.sqrt;', 'static import java.lang.Math.sqrt;', 'import static java.lang.Math.sqrt;'],
      answer: 3,
      explanation: 'The syntax is import static package.Class.member;',
    },
    {
      question: 'An anonymous class can...',
      options: ['have a constructor', 'extend a class and implement an interface at the same time', 'extend one class or implement one interface', 'be declared static'],
      answer: 2,
      explanation: 'It extends exactly one class or implements exactly one interface.',
    },
  ],
};
