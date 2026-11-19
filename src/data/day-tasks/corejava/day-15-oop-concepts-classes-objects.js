export default {
  lesson: 'day-15-oop-concepts-classes-objects',
  minutes: 20,
  intro: 'Create classes and objects, use references and null correctly and recognise the four OOP pillars.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which statement describes a **class** best?',
      options: [
        'A running copy of a program',
        'A blueprint that defines the state (fields) and behaviour (methods) of objects',
        'A variable that stores many values',
        'A method that creates memory',
      ],
      answer: 1,
      explain: 'A class is a **blueprint** (like the plan of a flat); objects are the real things built from it (the actual flats). Each object has its own state (field values) and shares the behaviour (methods) defined in the class.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are the **four pillars** of OOP? (choose all that apply)',
      options: ['Encapsulation', 'Inheritance', 'Compilation', 'Polymorphism', 'Abstraction', 'Iteration'],
      answers: [0, 1, 3, 4],
      explain: 'The four pillars are **Encapsulation** (hide data behind methods), **Inheritance** (reuse a parent class), **Polymorphism** (one name, many forms) and **Abstraction** (show what, hide how). Compilation and iteration are general programming ideas, not OOP pillars.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the line that creates a new \`Phone\` object:
\`Phone p = ____;\``,
      example: { title: 'creating a Student object', code: 'Student s = new Student();' },
      accept: ['new Phone()'],
      acceptRegex: ['^new\\s+Phone\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`new Phone()` allocates the object on the heap and calls the constructor; the variable `p` only stores a **reference** to it. Writing `Phone p;` alone creates no object at all.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'References: what does this program print?',
      example: {
        title: 'two references, one object',
        code: `Car c1 = new Car();
Car c2 = c1;      // no new object
c2.speed = 80;   // c1.speed is 80 too`,
      },
      code: `class Phone {
    String brand;
    int price;
}

public class Main {
    public static void main(String[] args) {
        Phone p1 = new Phone();
        p1.brand = "Nokia";
        p1.price = 5000;
        Phone p2 = p1;
        p2.price = 4500;
        Phone p3 = new Phone();
        System.out.println(p1.price);
        System.out.println(p3.brand);
        System.out.println(p3.price);
        System.out.println(p1 == p2);
        System.out.println(p1 == p3);
    }
}`,
      expected: `4500
null
0
true
false`,
      explain: '`p2 = p1` copies the reference, so both names point to **one object** and p2.price = 4500 changes p1.price. p3 is a separate new object whose fields have default values (null and 0). `==` on objects compares references: p1 and p2 are the same object, p3 is not.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Array of objects: what does this program print?',
      example: {
        title: 'calling a method on an object',
        code: `Student s = new Student();
s.name = "Ravi";
s.display();`,
      },
      code: `class Student {
    String name;
    int marks;

    boolean passed() {
        return marks >= 40;
    }

    void display() {
        System.out.println(name + ": " + marks + (passed() ? " PASS" : " FAIL"));
    }
}

public class Main {
    public static void main(String[] args) {
        Student[] list = new Student[3];
        String[] names = {"Asha", "Ravi", "Meena"};
        int[] marks = {78, 35, 40};
        for (int i = 0; i < list.length; i++) {
            list[i] = new Student();
            list[i].name = names[i];
            list[i].marks = marks[i];
        }
        for (Student s : list) s.display();
    }
}`,
      expected: `Asha: 78 PASS
Ravi: 35 FAIL
Meena: 40 PASS`,
      explain: '`new Student[3]` only creates an array of 3 **null** references; each Student object must be created with `new Student()` inside the loop (forgetting this gives a NullPointerException). Each object keeps its own name and marks, and 40 counts as PASS because the check is `>= 40`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: '`Phone p = null;` What happens when the program runs `p.price = 100;`?',
      options: ['price becomes 100', 'A new Phone is created automatically', 'NullPointerException at runtime', 'Compile error'],
      answer: 2,
      explain: 'The code compiles, but at runtime p points to **no object**, so accessing a field or method through it throws **NullPointerException**. Always make sure a reference is assigned (`new`) before using it.',
    },
  ],
};
