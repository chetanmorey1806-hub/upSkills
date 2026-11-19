export default {
  lesson: 'day-21-overriding-polymorphism',
  minutes: 22,
  intro: 'Predict dynamic method dispatch, static method hiding, upcasting/downcasting and overload-vs-override results.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Runtime polymorphism: what does this program print?',
      example: {
        title: 'parent reference, child object',
        code: `Animal a = new Dog();
a.sound(); // Dog's sound() runs (decided at runtime)`,
      },
      code: `class Shape {
    void draw() { System.out.println("Shape"); }
    static void info() { System.out.println("Shape info"); }
}

class Circle extends Shape {
    @Override
    void draw() { System.out.println("Circle"); }
    static void info() { System.out.println("Circle info"); }
    void roll() { System.out.println("Rolling"); }
}

public class Main {
    public static void main(String[] args) {
        Shape s = new Circle();
        s.draw();
        s.info();
        if (s instanceof Circle) {
            ((Circle) s).roll();
        }
        Shape t = new Shape();
        System.out.println(t instanceof Circle);
    }
}`,
      expected: `Circle
Shape info
Rolling
false`,
      explain: 'Instance methods are chosen by the **object** at runtime (dynamic method dispatch), so `s.draw()` runs Circle\'s version. Static methods are **hidden, not overridden**: they are chosen by the **reference type** at compile time, so `s.info()` prints "Shape info". After an `instanceof` check, the downcast `(Circle) s` safely unlocks `roll()`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Overloading meets overriding: what does this program print?',
      example: {
        title: 'two separate decisions',
        text: 'The **compiler** picks the method signature using the reference type. The **JVM** then picks which class\'s version of that signature runs, using the object.',
      },
      code: `class Printer {
    void print(Object o) { System.out.println("Printer-Object"); }
}

class LaserPrinter extends Printer {
    @Override
    void print(Object o) { System.out.println("Laser-Object"); }
    void print(String s) { System.out.println("Laser-String"); }
}

public class Main {
    public static void main(String[] args) {
        Printer p = new LaserPrinter();
        LaserPrinter lp = new LaserPrinter();
        p.print("hi");
        lp.print("hi");
        lp.print(42);
    }
}`,
      expected: `Laser-Object
Laser-String
Laser-Object`,
      explain: 'For `p.print("hi")` the compiler only sees Printer\'s methods, so it chooses `print(Object)`; at runtime the overridden LaserPrinter version runs → "Laser-Object". Through `lp`, the more specific `print(String)` overload is visible and wins. `42` is not a String, so `print(Object)` is used.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which annotation asks the compiler to check that a method really overrides a parent method (and fails on a typo such as `tostring()`)?',
      example: {
        title: 'where it goes',
        code: `____
public String toString() { return "Student"; }`,
      },
      accept: ['@Override'],
      acceptRegex: ['^@\\s*Override\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`@Override` makes the compiler verify the method signature matches a parent method. Without it, a typo silently creates a brand-new method and the parent version keeps running.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `\`Animal a = new Dog();\` Complete the line that **downcasts** \`a\` so you can call Dog-only methods:
\`Dog d = ____;\``,
      example: {
        title: 'upcasting is automatic',
        code: `Dog d2 = new Dog();
Animal a2 = d2;   // no cast needed`,
      },
      accept: ['(Dog) a', '(Dog)a'],
      acceptRegex: ['^\\(\\s*Dog\\s*\\)\\s*a\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Downcasting needs an explicit cast `(Dog) a`. It only succeeds at runtime if the object really is a Dog; otherwise you get **ClassCastException**, which is why it is usually guarded with `if (a instanceof Dog)`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are **rules of method overriding**? (choose all that apply)',
      options: [
        'Same method name and parameter list as the parent',
        'The access modifier cannot be more restrictive (public → private is not allowed)',
        'The return type can be the same or a subtype (covariant)',
        'private and static methods can be overridden',
        'final methods cannot be overridden',
      ],
      answers: [0, 1, 2, 4],
      explain: 'An override keeps the same signature, may return a subtype, cannot reduce visibility and cannot throw broader checked exceptions. `private` methods are not inherited and `static` methods are hidden, so neither is overridden; `final` methods are locked.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Overloading is **compile-time** polymorphism. Overriding is…',
      options: [
        'also compile-time polymorphism',
        'runtime polymorphism (dynamic method dispatch)',
        'not polymorphism at all',
        'only possible with interfaces',
      ],
      answer: 1,
      explain: 'With overriding, the JVM decides at **runtime** which version to run, based on the actual object (dynamic method dispatch). Overloading is resolved by the compiler from the argument types.',
    },
  ],
};
