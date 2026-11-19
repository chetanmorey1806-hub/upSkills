export default {
  lesson: 'day-23-interfaces',
  minutes: 22,
  intro: 'Implement interfaces, use default/static methods, resolve the diamond problem and recognise functional interfaces.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Default methods and the diamond problem: what does this program print?',
      example: { title: 'calling a specific interface\'s default', code: 'A.super.hello(); // inside a class that implements A' },
      code: `interface Greeter {
    default void greet() { System.out.println("Hello from Greeter"); }
    static void info() { System.out.println("Greeter v1"); }
}

interface Polite {
    default void greet() { System.out.println("Hello from Polite"); }
}

class Bot implements Greeter, Polite {
    @Override
    public void greet() {
        Polite.super.greet();
        Greeter.super.greet();
        System.out.println("Hello from Bot");
    }
}

public class Main {
    public static void main(String[] args) {
        new Bot().greet();
        Greeter.info();
    }
}`,
      expected: `Hello from Polite
Hello from Greeter
Hello from Bot
Greeter v1`,
      explain: 'Two interfaces give the same default method, so Bot **must override** greet() (otherwise compile error). Inside, `Polite.super.greet()` and `Greeter.super.greet()` call a specific default. Static interface methods are called with the interface name: `Greeter.info()`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Interface references: what does this program print?',
      example: {
        title: 'one interface, many implementations',
        code: `interface Shape { double area(); }
Shape s = new Circle(); // program to the interface`,
      },
      code: `interface Payment {
    int MAX_RETRIES = 3;
    double fee(double amount);
}

class Upi implements Payment {
    public double fee(double amount) { return 0; }
}

class Card implements Payment {
    public double fee(double amount) { return amount * 0.02; }
}

public class Main {
    public static void main(String[] args) {
        Payment[] modes = { new Upi(), new Card(), amount -> 10 };
        for (Payment p : modes) {
            System.out.println(p.fee(1000));
        }
        System.out.println(Payment.MAX_RETRIES * 2);
    }
}`,
      expected: `0.0
20.0
10.0
6`,
      explain: 'Each object uses its own `fee` implementation. The return type is double, so 0 → 0.0, 20 → 20.0 and the lambda\'s 10 → 10.0. Payment has one abstract method, so it is a **functional interface** and a lambda can implement it. Interface fields are implicitly `public static final`, so `Payment.MAX_RETRIES` is 3.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which keyword does a class use to sign an interface's contract?
\`class EmailService ____ Notifier { ... }\``,
      example: { title: 'a class can do both', code: 'class Car extends Vehicle implements Comparable<Car>, Serializable { }' },
      accept: ['implements'],
      acceptRegex: ['^implements\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Classes `implements` interfaces (and can implement many). An interface itself uses `extends` to inherit from other interfaces.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Class \`Robot implements A, B\`, and both A and B have \`default void hello()\`. Complete the override so it reuses **A's** version:
\`public void hello() { ____; }\``,
      example: { title: 'same idea with other names', code: 'public void start() { Engine.super.start(); }' },
      accept: ['A.super.hello()'],
      acceptRegex: ['^A\\s*\\.\\s*super\\s*\\.\\s*hello\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`InterfaceName.super.method()` selects which interface\'s default method to run. Plain `super.hello()` would refer to the parent **class** (Object here), so it does not compile.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about interfaces (Java 8+) are TRUE? (choose all that apply)',
      options: [
        'Fields are implicitly public static final',
        'Abstract methods are implicitly public abstract',
        'An interface can have constructors',
        'An interface can have default and static methods with bodies',
        'A class can implement several interfaces',
        'Java 9 allows private methods in interfaces',
      ],
      answers: [0, 1, 3, 4, 5],
      explain: 'Interfaces have no constructors and no instance state. Everything else listed is true: constants, public abstract methods, default/static methods (Java 8), private helper methods (Java 9) and multiple implementation.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What makes an interface a **functional interface**?',
      options: ['It has only default methods', 'It has exactly one abstract method', 'It has no methods at all', 'It is marked final'],
      answer: 1,
      explain: 'A functional interface has **exactly one abstract method** (default and static methods do not count), e.g. Runnable, Comparator, Predicate. `@FunctionalInterface` lets the compiler check this, and lambdas can implement it.',
    },
  ],
};
