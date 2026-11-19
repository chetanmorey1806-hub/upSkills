export default {
  lesson: 'day-04-variables-data-types-literals',
  minutes: 20,
  intro: 'Practise the 8 primitive types, their sizes, literals in different number systems and default values.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'How many **bytes** does a Java `char` use?',
      options: ['1 byte', '2 bytes', '4 bytes', 'It depends on the OS'],
      answer: 1,
      explain: 'A Java `char` is **2 bytes (16-bit Unicode / UTF-16)**, so it can hold characters like \'अ\' or \'₹\'. In C a char is 1 byte, which is a common confusion. Java sizes never depend on the OS.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'How many **bits** does a Java `int` use? (just the number)',
      example: { title: 'sizes', text: '`byte` = 8 bits, `short` = 16 bits, `long` = 64 bits' },
      accept: ['32', '32 bits'],
      explain: '`int` is **32 bits** (4 bytes), range −2,147,483,648 to 2,147,483,647. For bigger values like India\'s population (≈1.4 billion still fits, but 3 billion does not) use `long`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the declaration so it compiles (the number is too big for an int):
\`long distance = 9000000000____;\`
What goes in the blank?`,
      example: {
        title: 'literal suffixes',
        code: `float price = 99.5f;
double rate = 7.25;`,
      },
      accept: ['L', 'l'],
      acceptRegex: ['^L\\s*[;{]?$', '^l\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Integer literals are `int` by default, so `9000000000` is "integer number too large". Add the suffix **L**: `9000000000L`. Lowercase `l` also works but looks like the digit 1, so always use capital `L`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: {
        title: 'number systems',
        code: `int b = 0b11;  // binary  -> 3
int h = 0xA;   // hex     -> 10`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int bin = 0b1010;
        int oct = 017;
        int hex = 0x1F;
        int salary = 1_25_000;
        System.out.println(bin);
        System.out.println(oct);
        System.out.println(hex);
        System.out.println(salary);
    }
}`,
      expected: `10
15
31
125000`,
      explain: '`0b` = binary (1010₂ = 10), a leading `0` = octal (17₈ = 15), `0x` = hexadecimal (1F₁₆ = 31). Underscores are only for readability, so `1_25_000` is 125000. The classic trap is octal: `017` is NOT seventeen.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Fields (class-level variables) get default values. What does this program print?',
      example: {
        title: 'default value of a String field',
        code: `static String city;
// System.out.println(city); prints null`,
      },
      code: `public class Main {
    static int count;
    static double price;
    static boolean active;
    static String name;

    public static void main(String[] args) {
        System.out.println(count);
        System.out.println(price);
        System.out.println(active);
        System.out.println(name);
    }
}`,
      expected: `0
0.0
false
null`,
      explain: 'Fields default to `0` for integers, `0.0` for double/float, `false` for boolean, `\'\\u0000\'` for char and `null` for references like String. **Local variables have no default**: using one before assigning is a compile error.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which declarations **compile**? (choose all that apply)',
      options: ['float f = 3.5;', 'float f = 3.5f;', 'char c = \'A\';', 'boolean ok = 1;', 'byte b = 100;', 'int n = 10L;'],
      answers: [1, 2, 4],
      explain: '`3.5` is a double literal, so a float needs `3.5f`. Java booleans are only `true`/`false` (not 1/0). `byte b = 100` works because 100 fits in −128..127. `10L` is a long and cannot go into an int without a cast.',
    },
  ],
};
