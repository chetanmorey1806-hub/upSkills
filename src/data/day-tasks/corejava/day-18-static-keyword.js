export default {
  lesson: 'day-18-static-keyword',
  minutes: 20,
  intro: 'Separate class-level (static) from object-level members and predict the order of static blocks, instance blocks and constructors.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Static counter: what does this program print?',
      example: {
        title: 'one copy for the whole class',
        code: `class Bus {
  static int count;      // shared
  Bus() { count++; }
}`,
      },
      code: `class Ticket {
    static int total = 0;
    int id;

    Ticket() {
        total++;
        id = total;
    }
}

public class Main {
    public static void main(String[] args) {
        Ticket t1 = new Ticket();
        Ticket t2 = new Ticket();
        Ticket t3 = new Ticket();
        System.out.println(t1.id + " " + t3.id);
        System.out.println(Ticket.total);
        System.out.println(t1.total);
    }
}`,
      expected: `1 3
3
3`,
      explain: '`total` is **static**: one copy shared by all Ticket objects, so it reaches 3. `id` is an instance variable: each object keeps its own (1, 2, 3). `t1.total` compiles (with a warning) but still reads the same shared value; prefer `Ticket.total`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Order of execution: what does this program print?',
      example: {
        title: 'kinds of blocks',
        code: `static { ... }  // once, when the class loads
{ ... }         // before every constructor body`,
      },
      code: `public class Demo {
    static {
        System.out.println("static block");
    }
    {
        System.out.println("instance block");
    }
    Demo() {
        System.out.println("constructor");
    }
    public static void main(String[] args) {
        System.out.println("main starts");
        new Demo();
        new Demo();
    }
}`,
      expected: `static block
main starts
instance block
constructor
instance block
constructor`,
      explain: 'The static block runs **once when the class is loaded**, even before main. Each `new Demo()` then runs the instance initializer block and then the constructor body, so that pair appears twice.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the declaration of a constant shared by all objects that can never change:
\`public ____ final double GST_RATE = 0.18;\``,
      example: { title: 'a static utility method', code: 'public static int square(int n) { return n * n; }' },
      accept: ['static'],
      acceptRegex: ['^static\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`static final` = one shared copy (static) that cannot be reassigned (final): the standard way to write constants. Without `static`, every object would carry its own copy of the same value.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: `Why does this give a compile error?
\`class Shop { int stock = 10; static void show() { System.out.println(stock); } }\``,
      options: [
        'stock must be private',
        'A static method cannot directly use an instance variable, because there may be no object',
        'println cannot print ints',
        'static methods cannot print',
      ],
      answer: 1,
      explain: 'A static method belongs to the class and can run without any object, so there is no `this` and no "stock" to read: "non-static variable cannot be referenced from a static context". Make `stock` static or use an object: `new Shop().stock`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are TRUE? (choose all that apply)',
      options: [
        'Static methods can be called with ClassName.method()',
        'this can be used inside a static method',
        'A static block runs once per class load',
        'Math.sqrt() is a static method',
        'Every object gets its own copy of a static variable',
      ],
      answers: [0, 2, 3],
      explain: 'Static members are accessed through the class name (`Math.sqrt`, `Integer.parseInt`). `this` does not exist in a static context. A static variable has **one copy per class**, not per object.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the static import so you can write \`sqrt(16)\` and \`PI\` without the \`Math.\` prefix:
\`import ____ java.lang.Math.*;\``,
      example: { title: 'a normal import', code: 'import java.util.Scanner;' },
      accept: ['static'],
      acceptRegex: ['^static\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`import static java.lang.Math.*;` imports the static members of Math. Use static imports sparingly: too many make it unclear where a method comes from.',
    },
  ],
};
