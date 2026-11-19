export default {
  lesson: 'day-32-enums',
  minutes: 20,
  intro: 'Use enum constants, built-in methods, fields and constructors, constant-specific behaviour and enums in switch.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Built-in enum methods: what does this program print?',
      example: { title: 'looping over all constants', code: 'for (Day d : Day.values()) System.out.println(d);' },
      code: `enum Size { SMALL, MEDIUM, LARGE }

public class Main {
    public static void main(String[] args) {
        for (Size s : Size.values()) {
            System.out.println(s + " " + s.ordinal());
        }
        Size m = Size.valueOf("MEDIUM");
        System.out.println(m.name().toLowerCase());
        System.out.println(m.compareTo(Size.LARGE));
        System.out.println(m == Size.MEDIUM);
    }
}`,
      expected: `SMALL 0
MEDIUM 1
LARGE 2
medium
-1
true`,
      explain: '`values()` returns the constants in declaration order and `ordinal()` is the position starting at 0. `valueOf("MEDIUM")` turns a String into the constant (exact spelling). `compareTo` subtracts ordinals: 1 − 2 = −1. Enum constants are singletons, so `==` is safe.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Enum with fields and constant-specific bodies: what does this program print?',
      example: {
        title: 'enum with a constructor',
        code: `enum Coin {
  ONE(1), FIVE(5);
  final int value;
  Coin(int v) { value = v; }
}`,
      },
      code: `enum Plan {
    BASIC(199) {
        String perks() { return "Videos"; }
    },
    PRO(499) {
        String perks() { return "Videos + Projects"; }
    };

    final int price;
    Plan(int price) { this.price = price; }
    abstract String perks();
}

public class Main {
    public static void main(String[] args) {
        for (Plan p : Plan.values()) {
            System.out.println(p + " Rs." + p.price + " " + p.perks());
        }
        Plan chosen = Plan.PRO;
        String msg = switch (chosen) {
            case BASIC -> "Starter";
            case PRO -> "Career";
        };
        System.out.println(msg);
    }
}`,
      expected: `BASIC Rs.199 Videos
PRO Rs.499 Videos + Projects
Career`,
      explain: 'Each constant calls the enum constructor with its price, and each supplies its own body for the abstract `perks()` method (constant-specific behaviour). In a switch you write the bare constant name (`case PRO`, not `case Plan.PRO`), and a switch expression over all constants needs no default.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Convert the String \`"LARGE"\` into the enum constant:
\`Size s = ____;\``,
      example: { title: 'enum to String', code: 'String text = Size.SMALL.name(); // "SMALL"' },
      accept: ['Size.valueOf("LARGE")', 'Enum.valueOf(Size.class, "LARGE")'],
      acceptRegex: [
        '^Size\\s*\\.\\s*valueOf\\s*\\(\\s*"LARGE"\\s*\\)\\s*[;{]?$',
        '^Enum\\s*\\.\\s*valueOf\\s*\\(\\s*Size\\s*\\.\\s*class\\s*,\\s*"LARGE"\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`Size.valueOf("LARGE")` returns the constant with that exact name. A wrong or lower-case name such as "large" throws **IllegalArgumentException**, so convert user input with `toUpperCase()` first.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the declaration of an enum for order status with the constants PLACED, SHIPPED, DELIVERED:
\`____ OrderStatus { PLACED, SHIPPED, DELIVERED }\``,
      example: { title: 'another enum', code: 'enum Direction { NORTH, SOUTH, EAST, WEST }' },
      accept: ['enum', 'public enum'],
      acceptRegex: ['^enum\\s*[;{]?$', '^public\\s+enum\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'The `enum` keyword creates a special class whose objects are a fixed set of constants. It implicitly extends `java.lang.Enum`, so it cannot extend another class (but it can implement interfaces).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why are enums better than `int` constants like `static final int PLACED = 1;`?',
      options: [
        'They use less memory',
        'They are type-safe: a method taking OrderStatus cannot receive 42 or a wrong constant',
        'They can be changed at runtime',
        'They are faster to print',
      ],
      answer: 1,
      explain: 'With int constants any int compiles, even invalid ones. An `OrderStatus` parameter accepts only real constants, prints readable names, works in switch and can carry fields and methods.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about enums are TRUE? (choose all that apply)',
      options: [
        'Enum constructors are always private (implicitly)',
        'You can create an enum object with new',
        'Enums can implement interfaces',
        'EnumMap keeps keys in the order of the enum constants',
        'A single-element enum is a recommended way to write a Singleton',
      ],
      answers: [0, 2, 3, 4],
      explain: 'Enum constructors are private, so `new Size()` is impossible; the only objects are the declared constants. Enums can implement interfaces. EnumMap/EnumSet are fast and ordered by ordinal. Joshua Bloch recommends an enum with one constant for a serialization-safe Singleton.',
    },
  ],
};
