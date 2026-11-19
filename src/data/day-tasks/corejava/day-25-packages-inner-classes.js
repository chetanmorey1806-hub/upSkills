export default {
  lesson: 'day-25-packages-inner-classes',
  minutes: 22,
  intro: 'Organise code in packages and imports, and use member inner, static nested, local and anonymous classes.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Inner classes and shadowing: what does this program print?',
      example: { title: 'reaching the outer object', code: 'Outer.this.field   // the field of the enclosing Outer object' },
      code: `class Outer {
    private int x = 10;

    class Inner {
        int x = 20;
        void show() {
            int x = 30;
            System.out.println(x);
            System.out.println(this.x);
            System.out.println(Outer.this.x);
        }
    }

    static class Nested {
        void hi() { System.out.println("static nested"); }
    }
}

public class Main {
    public static void main(String[] args) {
        Outer o = new Outer();
        Outer.Inner in = o.new Inner();
        in.show();
        new Outer.Nested().hi();
    }
}`,
      expected: `30
20
10
static nested`,
      explain: 'The plain `x` is the local variable (30), `this.x` is the Inner object\'s field (20) and `Outer.this.x` is the enclosing Outer object\'s field (10) — an inner class can read even **private** outer members. A static nested class needs no outer object: `new Outer.Nested()`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Local and anonymous classes: what does this program print?',
      example: {
        title: 'anonymous class',
        code: `Runnable r = new Runnable() {
  public void run() { System.out.println("run"); }
};`,
      },
      code: `interface Greeting {
    void say();
}

public class Main {
    public static void main(String[] args) {
        String city = "Pune";

        class Local implements Greeting {
            public void say() { System.out.println("Hello from " + city); }
        }
        new Local().say();

        Greeting g = new Greeting() {
            public void say() { System.out.println("Anonymous hello"); }
        };
        g.say();
    }
}`,
      expected: `Hello from Pune
Anonymous hello`,
      explain: 'A **local class** is declared inside a method and can use the method\'s effectively final variables (city). An **anonymous class** declares and instantiates an implementation in one expression; it is used once and has no name.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Given \`Outer o = new Outer();\`, complete the line that creates an object of the member inner class \`Inner\`:
\`Outer.Inner in = ____;\``,
      example: { title: 'creating a static nested class', code: 'Outer.Nested n = new Outer.Nested();' },
      accept: ['o.new Inner()'],
      acceptRegex: ['^o\\s*\\.\\s*new\\s+Inner\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'A member (non-static) inner object always belongs to an outer object, so the syntax is `outerRef.new Inner()`. `new Outer.Inner()` only works for **static** nested classes.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the first line of a source file whose class belongs to the package `com.upskillr.billing`.',
      example: { title: 'an import line', code: 'import java.util.ArrayList;' },
      accept: ['package com.upskillr.billing;', 'package com.upskillr.billing'],
      acceptRegex: ['^package\\s+com\\s*\\.\\s*upskillr\\s*\\.\\s*billing\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'The `package` statement must be the **first statement** in the file (only comments may come before it), followed by imports and then the class. Package names are lower-case reversed domain names.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You compile `Outer.java` that contains a member class `Inner`. What is the name of the class file created for Inner?',
      options: ['Inner.class', 'Outer.Inner.class', 'Outer$Inner.class', 'Outer_Inner.class'],
      answer: 2,
      explain: 'The compiler names nested classes `Outer$Inner.class`. Anonymous classes become `Outer$1.class`, `Outer$2.class` and so on.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which import makes **every** class of `java.util` available (on-demand import)?',
      options: ['import java.util;', 'import java.util.*;', 'import all java.util;', 'include java.util.*;'],
      answer: 1,
      explain: '`import java.util.*;` imports all classes of that package (but not sub-packages like java.util.function). `java.lang` (String, Math, System) is imported automatically.',
    },
  ],
};
