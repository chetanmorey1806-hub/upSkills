export default {
  lesson: 'day-22-abstract-classes',
  minutes: 20,
  intro: 'Use abstract classes and methods, the Template Method pattern and anonymous subclasses.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Template Method pattern: what does this program print?',
      example: {
        title: 'the parent fixes the steps, the child fills one in',
        code: `abstract class Game {
  final void play() { start(); end(); }
  abstract void start();
  void end() { System.out.println("Game over"); }
}`,
      },
      code: `abstract class Report {
    Report() {
        System.out.println("Report init");
    }
    final void generate() {
        header();
        body();
        System.out.println("--- end ---");
    }
    void header() {
        System.out.println("UpSkillr Report");
    }
    abstract void body();
}

class SalesReport extends Report {
    SalesReport() {
        System.out.println("Sales init");
    }
    @Override
    void body() {
        System.out.println("Sales: 1200");
    }
}

public class Main {
    public static void main(String[] args) {
        Report r = new SalesReport();
        r.generate();
    }
}`,
      expected: `Report init
Sales init
UpSkillr Report
Sales: 1200
--- end ---`,
      explain: 'An abstract class **can have a constructor**; it runs (via super()) before the child constructor. `generate()` is final and defines the fixed order of steps; only `body()` is supplied by the subclass. This is the Template Method pattern.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Anonymous subclass: what does this program print?',
      example: {
        title: 'implementing an abstract method on the spot',
        code: `Shape sq = new Shape("Sq") {
  double area() { return 9; }
};`,
      },
      code: `abstract class Shape {
    String name;
    Shape(String name) { this.name = name; }
    abstract double area();
    void print() {
        System.out.println(name + " area = " + area());
    }
}

public class Main {
    public static void main(String[] args) {
        Shape square = new Shape("Square") {
            double area() { return 4 * 4; }
        };
        Shape rect = new Shape("Rectangle") {
            double area() { return 2.5 * 4; }
        };
        square.print();
        rect.print();
    }
}`,
      expected: `Square area = 16.0
Rectangle area = 10.0`,
      explain: '`new Shape("Square") { ... }` creates an **anonymous subclass** and an object of it in one step, passing "Square" to the abstract class constructor. `area()` returns a double, so 16 prints as 16.0 and 2.5 × 4 as 10.0.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the method declaration so every subclass is **forced** to provide its own version (no body here):
\`____ double calculateFee();\``,
      example: { title: 'an abstract class header', code: 'abstract class Employee { ... }' },
      accept: ['abstract', 'public abstract', 'protected abstract'],
      acceptRegex: ['^abstract\\s*[;{]?$', '^public\\s+abstract\\s*[;{]?$', '^protected\\s+abstract\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'An `abstract` method has no body (just a semicolon). Any concrete subclass must override it, otherwise the subclass must itself be declared abstract.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`abstract class Vehicle { }` What happens with `Vehicle v = new Vehicle();`?',
      options: ['It works', 'Compile error: Vehicle is abstract; cannot be instantiated', 'Runtime exception', 'It creates a null reference'],
      answer: 1,
      explain: 'You can never create an object of an abstract class with `new`, even if it has no abstract methods. You can, however, declare **references** of the abstract type: `Vehicle v = new Car();`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'What can an abstract class contain? (choose all that apply)',
      options: ['Constructors', 'Instance fields', 'Concrete (normal) methods', 'static methods', 'An abstract method with a body', 'final methods'],
      answers: [0, 1, 2, 3, 5],
      explain: 'An abstract class is a normal class that cannot be instantiated: it may have constructors, fields, concrete, static and final methods. Only an **abstract method** cannot have a body. Note: `abstract` + `final` on the same method is illegal.',
    },
    {
      type: 'fill',
      mins: 1,
      q: '`abstract class Payment { abstract void pay(double amt); }` — `class Upi extends Payment { }` does not compile. Besides implementing `pay`, which keyword could you add to the Upi class header to make it compile?',
      example: {
        title: 'chain of abstract classes',
        code: `abstract class Animal { abstract void sound(); }
abstract class Pet extends Animal { } // still abstract, OK`,
      },
      accept: ['abstract'],
      acceptRegex: ['^abstract\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'A class that does not implement all inherited abstract methods must itself be **abstract**. Then the next concrete subclass has to implement `pay`.',
    },
  ],
};
