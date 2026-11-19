export default {
  lesson: 'day-20-inheritance-super',
  minutes: 22,
  intro: 'Reuse code with extends, call parent members with super and predict constructor order in an inheritance chain.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Inheritance and super: what does this program print?',
      example: {
        title: 'super calls the parent version',
        code: `void show() {
  super.show();          // parent part first
  System.out.println("child part");
}`,
      },
      code: `class Animal {
    Animal() {
        System.out.println("Animal created");
    }
    void sound() {
        System.out.println("Some sound");
    }
}

class Dog extends Animal {
    Dog() {
        System.out.println("Dog created");
    }
    void sound() {
        super.sound();
        System.out.println("Bark");
    }
}

public class Main {
    public static void main(String[] args) {
        Dog d = new Dog();
        d.sound();
    }
}`,
      expected: `Animal created
Dog created
Some sound
Bark`,
      explain: 'Every constructor first calls the parent constructor (Java inserts `super()` automatically), so "Animal created" prints before "Dog created". `super.sound()` runs the parent\'s method before the child adds "Bark".',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Multilevel inheritance and field hiding: what does this program print?',
      example: {
        title: 'fields are chosen by the reference type',
        code: `Parent p = new Child();
p.name;   // Parent's field`,
      },
      code: `class A {
    String name = "A";
    A() { System.out.print("A "); }
}
class B extends A {
    String name = "B";
    B() { System.out.print("B "); }
}
class C extends B {
    String name = "C";
    C() {
        System.out.println("C");
    }
    void show() {
        System.out.println(name + " " + super.name);
    }
}

public class Main {
    public static void main(String[] args) {
        C c = new C();
        c.show();
        A ref = c;
        System.out.println(ref.name);
    }
}`,
      expected: `A B C
C B
A`,
      explain: 'Constructors run from the top of the chain down: A, B, C. In `show()`, `name` is C\'s field and `super.name` is the direct parent B\'s field. Fields are **not polymorphic**: through a reference of type A you see A\'s field ("A"), even though the object is a C.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `The parent has only \`Person(String name)\`. Complete the child constructor so it passes \`name\` up:
\`Student(String name, int roll) {\`
\`    ____;\`
\`    this.roll = roll;\`
\`}\``,
      example: { title: 'calling a parent constructor with two values', code: 'Car(String brand, int year) { super(brand, year); }' },
      accept: ['super(name)'],
      acceptRegex: ['^super\\s*\\(\\s*name\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`super(name)` calls the parent constructor and must be the **first statement**. Without it Java inserts `super()`, which fails here because Person has no no-arg constructor.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which keyword makes \`Manager\` a child class of \`Employee\`?
\`class Manager ____ Employee { }\``,
      example: { title: 'another child class', code: 'class SavingsAccount extends Account { }' },
      accept: ['extends'],
      acceptRegex: ['^extends\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`extends` creates an **IS-A** relationship: a Manager IS-A Employee and inherits its non-private fields and methods. Interfaces use `implements` instead.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which line gives a **compile error** in Java?',
      options: ['class B extends A { }', 'class C extends B { }', 'class D extends A, B { }', 'class E implements Runnable, Comparable<E> { ... }'],
      answer: 2,
      explain: 'Java does **not allow multiple inheritance of classes** (the diamond problem: which parent method would win?). A class extends exactly one class but can implement many interfaces.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A `Car` has an `Engine` object as a field. What kind of relationship is this?',
      options: ['IS-A (inheritance)', 'HAS-A (composition)', 'Polymorphism', 'Overloading'],
      answer: 1,
      explain: 'A car **has an** engine (composition), it is not an engine, so Car should hold an `Engine engine;` field rather than `extends Engine`. Favour composition over inheritance when the IS-A test fails.',
    },
  ],
};
