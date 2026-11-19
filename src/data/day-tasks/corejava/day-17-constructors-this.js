export default {
  lesson: 'day-17-constructors-this',
  minutes: 20,
  intro: 'Write constructors, use this to fix shadowing and trace constructor chaining with this().',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Constructor chaining: what does this program print?',
      example: {
        title: 'this(...) calls another constructor of the same class',
        code: `Box() { this(1); }   // first statement only
Box(int s) { size = s; }`,
      },
      code: `class Student {
    String name;
    int age;

    Student() {
        this("Guest");
        System.out.println("no-arg");
    }
    Student(String name) {
        this(name, 18);
        System.out.println("one-arg");
    }
    Student(String name, int age) {
        this.name = name;
        this.age = age;
        System.out.println("two-arg");
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
        System.out.println(s.name + " " + s.age);
    }
}`,
      expected: `two-arg
one-arg
no-arg
Guest 18`,
      explain: '`this(...)` jumps to the other constructor **first**, so the innermost constructor finishes printing before the outer ones continue: two-arg → one-arg → no-arg. The defaults "Guest" and 18 flow down the chain.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Spot the bug: what does this program print?',
      example: {
        title: 'parameter hides the field',
        code: `class A {
  int x;
  A(int x) { this.x = x; } // this.x = field, x = parameter
}`,
      },
      code: `class Employee {
    String name;
    int salary;

    Employee(String name, int salary) {
        name = name;
        this.salary = salary;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee e = new Employee("Kiran", 45000);
        System.out.println(e.name);
        System.out.println(e.salary);
    }
}`,
      expected: `null
45000`,
      explain: 'Inside the constructor the parameter `name` **shadows** the field. `name = name;` assigns the parameter to itself, so the field stays `null`. `this.name = name;` is the fix. The salary line uses `this.` correctly, so it works.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Fix the bug above: complete the line so the **field** gets the parameter value.
\`____ = name;\``,
      example: { title: 'same idea with another field', code: 'this.salary = salary;' },
      accept: ['this.name'],
      acceptRegex: ['^this\\s*\\.\\s*name\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`this` refers to the current object, so `this.name` is the field and the plain `name` is the parameter.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the no-arg constructor so it **reuses** the 2-arg constructor \`Product(String name, double price)\` with the values "Unknown" and 0.0:
\`Product() { ____; }\``,
      example: { title: 'chaining in another class', code: 'Account() { this("SAVINGS", 1000); }' },
      accept: ['this("Unknown", 0.0)', 'this("Unknown", 0)', 'this("Unknown", 0.0d)'],
      acceptRegex: [
        '^this\\s*\\(\\s*"Unknown"\\s*,\\s*0\\s*\\.\\s*0\\s*\\)\\s*[;{]?$',
        '^this\\s*\\(\\s*"Unknown"\\s*,\\s*0\\s*\\)\\s*[;{]?$',
        '^this\\s*\\(\\s*"Unknown"\\s*,\\s*0\\s*\\.\\s*0d\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`this(args)` calls another constructor of the same class. It must be the **first statement** in the constructor, and a constructor cannot both call `this(...)` and `super(...)`.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Class `Book` has only the constructor `Book(String title)`. What happens with `Book b = new Book();`?',
      options: ['It works, Java adds a default constructor', 'Compile error: constructor Book() is undefined', 'title becomes null', 'Runtime exception'],
      answer: 1,
      explain: 'Java adds the **default no-arg constructor only when you write no constructor at all**. As soon as you write any constructor, you must also write `Book() { }` yourself if you want to call `new Book()`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about constructors are TRUE? (choose all that apply)',
      options: [
        'A constructor has the same name as the class',
        'A constructor has no return type, not even void',
        'Constructors can be overloaded',
        'A constructor is inherited by subclasses',
        'Adding void makes it a normal method instead of a constructor',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Constructors share the class name, have no return type and can be overloaded. They are **not inherited** (a child calls them with `super(...)`). Writing `void Book() {}` silently creates an ordinary method named Book, a classic trick question.',
    },
  ],
};
