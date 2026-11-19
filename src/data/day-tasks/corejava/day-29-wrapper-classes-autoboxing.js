export default {
  lesson: 'day-29-wrapper-classes-autoboxing',
  minutes: 20,
  intro: 'Convert between primitives, wrappers and Strings, and predict autoboxing and Integer-cache results.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'The Integer cache: what does this program print?',
      example: {
        title: 'compare wrapper values with equals',
        code: `Integer p = 500, q = 500;
System.out.println(p.equals(q)); // true`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        int e = 128;
        System.out.println(a == b);
        System.out.println(c == d);
        System.out.println(c.equals(d));
        System.out.println(c == e);
    }
}`,
      expected: `true
false
true
true`,
      explain: 'Autoboxing uses `Integer.valueOf`, which returns **cached objects for −128 to 127**, so a and b are the same object. 128 is outside the cache, so c and d are different objects and `==` is false. `equals` compares values. `c == e` unboxes c to an int, so it is a number comparison (true).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Conversions: what does this program print?',
      example: {
        title: 'String ↔ number',
        code: `int n = Integer.parseInt("42");
String s = String.valueOf(42);`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        String s = "25";
        int n = Integer.parseInt(s);
        System.out.println(n + 5);
        System.out.println(s + 5);
        System.out.println(Integer.valueOf(s) + 5);
        System.out.println(Integer.toBinaryString(10));
        System.out.println(Integer.MAX_VALUE + 1);
        System.out.println(Character.isLetter('9'));
        System.out.println(Double.parseDouble("3.5") * 2);
    }
}`,
      expected: `30
255
30
1010
-2147483648
false
7.0`,
      explain: '`parseInt` gives an int (25 + 5 = 30), but `s + 5` is String concatenation ("255"). `Integer.valueOf(s)` returns an Integer that is unboxed for the addition. `Integer.MAX_VALUE + 1` **overflows** silently to −2147483648. \'9\' is a digit, not a letter. 3.5 × 2 is the double 7.0.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Convert the String \`price\` (e.g. "499") into an \`int\`:
\`int p = ____;\``,
      example: { title: 'parsing a double', code: 'double rate = Double.parseDouble("7.5");' },
      accept: ['Integer.parseInt(price)', 'Integer.valueOf(price)'],
      acceptRegex: ['^Integer\\s*\\.\\s*parseInt\\s*\\(\\s*price\\s*\\)\\s*[;{]?$', '^Integer\\s*\\.\\s*valueOf\\s*\\(\\s*price\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`Integer.parseInt(price)` returns a primitive int (`Integer.valueOf` returns an Integer that auto-unboxes). If the text is not a valid number, e.g. "49a", it throws **NumberFormatException**.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'What is the wrapper class of the primitive type `char`?',
      example: { title: 'another pair', text: '`int` → `Integer`, `boolean` → `Boolean`' },
      accept: ['Character'],
      acceptRegex: ['^Character\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Only two wrappers do not just capitalise the primitive name: `int` → **Integer** and `char` → **Character**. The others are Byte, Short, Long, Float, Double and Boolean.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`Integer stock = null;` What happens on `int s = stock;`?',
      options: ['s becomes 0', 's becomes null', 'NullPointerException at runtime', 'Compile error'],
      answer: 2,
      explain: 'Auto-unboxing calls `stock.intValue()` behind the scenes, and calling a method on null throws **NullPointerException**. This often happens with `map.get(key)` returning null for a missing key.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why do we need wrapper classes at all?',
      options: [
        'Primitives are slower than objects',
        'Collections and generics (List<Integer>, Map<String, Integer>) can only store objects, not primitives',
        'Primitives cannot be printed',
        'Wrappers use less memory',
      ],
      answer: 1,
      explain: 'Generics work only with reference types, so `List<int>` is not allowed; we write `List<Integer>`. Wrappers also offer utility methods (parseInt, MAX_VALUE) and can represent "no value" with null. Primitives are actually faster and smaller.',
    },
  ],
};
