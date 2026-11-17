const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. Tip: Ctrl+Click (IntelliJ/Eclipse) on Integer.valueOf to open the JDK source and see the IntegerCache',
  'Click Run ▶ and compare every line with the expected output',
];

const ex1 = `public class Main {
    public static void main(String[] args) {
        int num = 42;
        Integer boxed = Integer.valueOf(num);    // manual boxing
        int unboxed = boxed.intValue();          // manual unboxing
        Integer auto = 100;                      // autoboxing
        int back = auto;                         // auto-unboxing
        System.out.println(boxed + " " + unboxed + " " + auto + " " + back);

        int parsed = Integer.parseInt("123");    // String -> int
        double price = Double.parseDouble("99.5");
        boolean flag = Boolean.parseBoolean("TRUE");   // case-insensitive
        System.out.println(parsed + 1);
        System.out.println(price * 2);
        System.out.println(flag);

        String s1 = String.valueOf(77);          // int -> String
        String s2 = Integer.toString(77) + "!";
        System.out.println(s1 + s2);

        System.out.println(Integer.MAX_VALUE + " " + Integer.MIN_VALUE);
        System.out.println(Integer.toBinaryString(10) + " " + Integer.toHexString(255)
                + " " + Integer.parseInt("1010", 2));
        System.out.println(Character.isDigit('7') + " " + Character.isLetter('x')
                + " " + Character.toUpperCase('q'));
    }
}`;

const ex2 = `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        // List<int> is NOT allowed: generics need objects
        List<Integer> marks = new ArrayList<>();
        marks.add(85);                    // autoboxing int -> Integer
        marks.add(92);
        marks.add(78);
        int total = 0;
        for (int m : marks) {             // auto-unboxing Integer -> int
            total += m;
        }
        System.out.println("Marks: " + marks + ", total = " + total);

        List<Integer> nums = new ArrayList<>(List.of(10, 20, 30));
        nums.remove(1);                   // remove(int index): removes element at index 1
        System.out.println(nums);
        nums.remove(Integer.valueOf(10)); // remove(Object): removes the value 10
        System.out.println(nums);
    }
}`;

const ex3 = `public class Main {
    public static void main(String[] args) {
        Integer a = 127, b = 127;
        Integer c = 128, d = 128;
        System.out.println(a == b);          // same cached object
        System.out.println(c == d);          // outside -128..127: different objects
        System.out.println(c.equals(d));     // compares values

        Integer e = Integer.valueOf(50), f = Integer.valueOf(50);
        System.out.println(e == f);

        Long l1 = 127L, l2 = 127L;
        System.out.println(l1 == l2);        // Long also caches -128..127

        Double d1 = 1.0, d2 = 1.0;
        System.out.println(d1 == d2);        // Double has NO cache

        int x = 128;
        System.out.println(c == x);          // c is unboxed, int comparison
    }
}`;

const ex4 = `import java.util.HashMap;
import java.util.Map;

public class Main {
    static void show(long x)    { System.out.println("long"); }
    static void show(Integer x) { System.out.println("Integer"); }

    static void print(Object o) {
        System.out.println("Object: " + o.getClass().getSimpleName());
    }

    public static void main(String[] args) {
        Long big = 10L;
        System.out.println(big.equals(10));      // 10 is boxed to Integer, not Long
        System.out.println(big.equals(10L));

        show(5);                                 // widening beats boxing

        print(5);                                // boxed to Integer
        print(5.0);                              // boxed to Double
        print('c');                              // boxed to Character

        Map<String, Integer> stock = new HashMap<>();
        stock.put("pen", 10);
        Integer pencils = stock.get("pencil");
        System.out.println("pencil stock = " + pencils);
        try {
            int count = stock.get("pencil");     // unboxing null!
            System.out.println(count);
        } catch (NullPointerException ex) {
            System.out.println("NPE while unboxing null");
        }
        int safe = stock.getOrDefault("pencil", 0);
        System.out.println("safe = " + safe);
    }
}`;

const ex5 = `public class Main {
    public static void main(String[] args) {
        String code = "A7B3C9";
        int sum = 0;
        for (char ch : code.toCharArray()) {
            if (Character.isDigit(ch)) {
                sum += Character.getNumericValue(ch);
            }
        }
        System.out.println("Digit sum = " + sum);

        System.out.println(Integer.compare(5, 9) + " " + Integer.compare(9, 5) + " " + Integer.compare(5, 5));
        System.out.println(Integer.max(4, 11) + " " + Integer.sum(4, 11));
        System.out.println(Integer.valueOf("0042") + 1);
        System.out.println(Double.isNaN(0.0 / 0.0));
        System.out.println(Integer.MAX_VALUE + 1);     // overflow wraps around
        System.out.println(Byte.MAX_VALUE + " " + Short.MAX_VALUE + " " + Long.MAX_VALUE);

        Integer counter = 10;
        Integer before = counter;
        counter++;                                    // unbox, add, box a NEW Integer
        System.out.println(before + " " + counter + " " + (before == counter));
    }
}`;

const pr1 = `public class Main {
    public static void main(String[] args) {
        String[] values = {"25", "40", "abc", "35"};
        int sum = 0;
        for (String v : values) {
            try {
                sum += Integer.parseInt(v);
            } catch (NumberFormatException e) {
                System.out.println("Skipping " + v);
            }
        }
        System.out.println("Sum = " + sum);
        // Skipping abc
        // Sum = 100
    }
}`;

const pr2 = `public class Main {
    public static void main(String[] args) {
        int n = 45;
        System.out.println("Binary: " + Integer.toBinaryString(n));   // 101101
        System.out.println("Octal: " + Integer.toOctalString(n));     // 55
        System.out.println("Hex: " + Integer.toHexString(n));         // 2d
        System.out.println("Back: " + Integer.parseInt("101101", 2)); // 45
    }
}`;

const pr3 = `public class Main {
    public static void main(String[] args) {
        String text = "Java 17 has 3 LTS friends!";
        int letters = 0, digits = 0, spaces = 0, others = 0;
        for (char c : text.toCharArray()) {
            if (Character.isLetter(c)) letters++;
            else if (Character.isDigit(c)) digits++;
            else if (Character.isWhitespace(c)) spaces++;
            else others++;
        }
        System.out.println(letters + " " + digits + " " + spaces + " " + others);   // 17 3 5 1
    }
}`;

const pr4 = `import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> ids = new ArrayList<>(List.of(1000, 2000, 1000));
        Integer first = ids.get(0);
        Integer third = ids.get(2);
        System.out.println(first == third);        // false: 1000 is outside the cache (List.of stores separate boxes)
        System.out.println(first.equals(third));   // true: always use equals for wrappers
    }
}`;

export default {
  id: 'day-29-wrapper-classes-autoboxing',
  title: 'Wrapper Classes, Autoboxing and Unboxing, Integer Cache',
  module: 'Module 5: Core APIs & Generics',
  day: 29,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Learn the eight wrapper classes, how Java automatically converts between primitives and objects (autoboxing/unboxing), useful parsing and conversion methods, and the famous Integer cache that makes == behave surprisingly.',
  objectives: [
    'List the wrapper class for each primitive and explain why wrappers are needed',
    'Convert between primitives, wrappers and Strings',
    'Explain autoboxing, unboxing and their pitfalls (NullPointerException, ==)',
    'Explain the Integer cache (-128 to 127) and predict == results',
  ],
  theory: [
    {
      heading: 'What are Wrapper Classes?',
      content:
        'Every primitive type has a matching class in java.lang that "wraps" the value inside an object. Analogy: a gift box around a gift; the gift (value) is the same, but the box lets it be handled like a parcel by the delivery system (collections, generics, frameworks).\n byte -> Byte, short -> Short, int -> Integer, long -> Long, float -> Float, double -> Double, char -> Character, boolean -> Boolean.',
      points: [
        'Collections and generics work only with objects: List<Integer>, not List<int>.',
        'Wrappers can be null (useful for "no value" from a database).',
        'They provide utility methods: parseInt, valueOf, MAX_VALUE, toBinaryString, isDigit.',
        'All wrapper classes are final and immutable.',
        'Numeric wrappers extend the abstract class Number (intValue(), doubleValue() ...).',
      ],
    },
    {
      heading: 'Autoboxing and Unboxing (Java 5+)',
      content:
        'Autoboxing: the compiler automatically converts a primitive to its wrapper (Integer x = 10; becomes Integer x = Integer.valueOf(10);). Unboxing: the reverse (int y = x; becomes int y = x.intValue();). It happens in assignments, method arguments, return values, collections and arithmetic.',
      syntax: `Integer a = 5;          // autoboxing
int b = a;              // unboxing
list.add(7);            // autoboxing
int sum = a + b;        // a unboxed for arithmetic`,
      points: [
        'Unboxing a null wrapper throws NullPointerException (e.g. int n = map.get("missing");).',
        'Boxing in loops creates many objects: prefer primitives for heavy calculations.',
        'Wrappers are immutable: counter++ on an Integer creates a new Integer object.',
      ],
    },
    {
      heading: 'Converting Between Types',
      content:
        'String -> primitive: Integer.parseInt("12"), Double.parseDouble("9.5"), Boolean.parseBoolean("true"). String -> wrapper: Integer.valueOf("12"). primitive -> String: String.valueOf(12), Integer.toString(12), or "" + 12. Wrapper -> primitive: intValue(), doubleValue(). Base conversion: Integer.toBinaryString, toHexString, toOctalString and Integer.parseInt("1010", 2).',
      points: [
        'parseXxx returns a primitive; valueOf returns a wrapper object (possibly cached).',
        'Invalid text throws NumberFormatException.',
        'Boolean.parseBoolean returns true only for "true" (ignoring case); anything else is false, no exception.',
      ],
    },
    {
      heading: 'The Integer Cache',
      content:
        'Integer.valueOf(int) (used by autoboxing) returns cached objects for values from -128 to 127. So two boxed 127s are the SAME object (== is true), but two boxed 128s are different objects (== is false). Byte, Short, Long and Character (0-127) also cache; Boolean has only TRUE and FALSE; Float and Double have no cache.',
      points: [
        'Always compare wrapper values with equals(), never ==.',
        'Comparing a wrapper with a primitive (c == 128 where 128 is an int) unboxes the wrapper, so it compares values.',
        'The upper limit can be raised with -XX:AutoBoxCacheMax, which is another reason not to rely on ==.',
      ],
      tip: 'Classic bug: if (order.getId() == other.getId()) works in testing with small ids and fails in production when ids exceed 127.',
    },
    {
      heading: 'Overloading with Boxing',
      content:
        'When choosing an overloaded method, Java prefers: 1) exact match, 2) widening of primitives, 3) boxing/unboxing, 4) varargs. So show(5) calls show(long) rather than show(Integer). A Long never equals an Integer: Long x = 10L; x.equals(10) is false because 10 boxes to Integer.',
    },
  ],
  examples: [
    {
      title: 'Boxing, Unboxing, Parsing and Utility Methods',
      scenario: 'Form fields arrive as Strings; convert them and explore wrapper helpers.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `42 42 100 100
124
199.0
true
7777!
2147483647 -2147483648
1010 ff 10
true true Q`,
      explanation:
        'parseInt("123") + 1 = 124 and 99.5 * 2 = 199.0. "TRUE" parses to true. s1 + s2 = "77" + "77!". 10 in binary is 1010, 255 in hex is ff, binary 1010 is 10.',
    },
    {
      title: 'Wrappers in Collections and the remove() Trap',
      scenario: 'Store marks in a List and remove items by index and by value.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Marks: [85, 92, 78], total = 255
[10, 30]
[30]`,
      explanation:
        'Autoboxing lets us add ints to a List<Integer>. remove(1) matches remove(int index) exactly (no boxing needed), so it removes 20. To remove the value 10 we pass an Integer object, which calls remove(Object).',
    },
    {
      title: 'Integer Cache and == vs equals()',
      scenario: 'The famous 127 vs 128 interview question, plus Long and Double.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `true
false
true
true
true
false
true`,
      explanation:
        '127 is cached, 128 is not, so a == b is true but c == d is false; equals compares values. Long caches -128..127; Double has no cache. c == x unboxes c because x is an int primitive.',
    },
    {
      title: 'Autoboxing Pitfalls',
      scenario: 'Common bugs: comparing Long with Integer, overloading surprises and unboxing null from a Map.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `false
true
long
Object: Integer
Object: Double
Object: Character
pencil stock = null
NPE while unboxing null
safe = 0`,
      explanation:
        'big.equals(10) compares a Long with an Integer, always false. show(5) picks widening (long) over boxing (Integer). Primitives passed as Object are boxed. Assigning a null Integer to an int throws NullPointerException; getOrDefault avoids it.',
    },
    {
      title: 'Character and Integer Helpers, Overflow and Immutability',
      scenario: 'Extract digits from a product code and explore comparison, limits and wrapper immutability.',
      steps: STEPS,
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Digit sum = 19
-1 1 0
11 15
43
true
-2147483648
127 32767 9223372036854775807
10 11 false`,
      explanation:
        '7 + 3 + 9 = 19. Integer.compare returns negative/positive/zero (here -1, 1, 0). "0042" becomes 42, plus 1 = 43. 0.0/0.0 is NaN. MAX_VALUE + 1 overflows to MIN_VALUE. counter++ creates a new Integer (11), so before still refers to the old 10 object.',
    },
  ],
  interview: [
    {
      q: 'What are wrapper classes and why do we need them?',
      a: 'Classes that wrap primitive values in objects (Integer, Double, Character ...). Needed for collections and generics, to represent null, for utility methods, and for frameworks that work with objects (Hibernate, Jackson).',
      level: 'Easy',
    },
    {
      q: 'What is autoboxing and unboxing?',
      a: 'Automatic conversion by the compiler from primitive to wrapper (autoboxing, via valueOf) and wrapper to primitive (unboxing, via xxxValue()).',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nInteger a = 127, b = 127; Integer c = 128, d = 128;\nSystem.out.println(a == b); System.out.println(c == d);',
      a: 'Output: true then false. Integer.valueOf caches -128 to 127, so a and b share one object; 128 creates two different objects.',
      level: 'Medium',
    },
    {
      q: 'Difference between Integer.parseInt() and Integer.valueOf()?',
      a: 'parseInt returns a primitive int. valueOf returns an Integer object and uses the cache for -128..127.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nLong x = 10L; System.out.println(x.equals(10));',
      a: 'Output: false. 10 is autoboxed to Integer, and Long.equals returns true only for Long objects.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nInteger i = null; int j = i; System.out.println(j);',
      a: 'NullPointerException at runtime, because unboxing calls i.intValue() on null.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nInteger i1 = 1000; int i2 = 1000; System.out.println(i1 == i2);',
      a: 'Output: true. When one operand is primitive, the wrapper is unboxed and values are compared.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nList<Integer> list = new ArrayList<>(List.of(5, 6, 7)); list.remove(1); System.out.println(list);',
      a: 'Output: [5, 7]. remove(1) calls remove(int index). Use list.remove(Integer.valueOf(1)) to remove by value.',
      level: 'Hard',
    },
    {
      q: 'Are wrapper classes mutable?',
      a: 'No, they are final and immutable. Operations like i++ create a new wrapper object and reassign the reference.',
      level: 'Easy',
    },
    {
      q: 'Which wrapper classes have a cache?',
      a: 'Byte, Short, Integer, Long (-128 to 127), Character (0 to 127) and Boolean (TRUE/FALSE). Float and Double do not.',
      level: 'Hard',
    },
    {
      q: 'What does Boolean.parseBoolean("yes") return?',
      a: 'false. Only "true" ignoring case returns true; no exception is thrown for other strings.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Sum an array of numeric strings, skipping invalid ones with a message.',
      hint: 'Integer.parseInt inside try-catch for NumberFormatException.',
      solution: pr1,
    },
    {
      task: 'Print a number in binary, octal and hex, and parse the binary back to decimal.',
      hint: 'Integer.toBinaryString, toOctalString, toHexString, parseInt(s, 2).',
      solution: pr2,
    },
    {
      task: 'Count letters, digits, spaces and other characters in a sentence using Character methods.',
      hint: 'Character.isLetter, isDigit, isWhitespace.',
      solution: pr3,
    },
    {
      task: 'Demonstrate why wrapper objects must be compared with equals() using values above 127.',
      hint: 'Compare two boxed 1000 values with == and equals.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which is the wrapper class of char?',
      options: ['Char', 'Character', 'String', 'CharWrapper'],
      answer: 1,
      explanation: 'char -> Character, int -> Integer.',
    },
    {
      question: 'Integer x = 100, y = 100; x == y gives...',
      options: ['false', 'Compile error', 'true', 'NullPointerException'],
      answer: 2,
      explanation: '100 is within the Integer cache range.',
    },
    {
      question: 'What is the result of unboxing a null Integer?',
      options: ['NullPointerException', '0', 'null', 'NumberFormatException'],
      answer: 0,
      explanation: 'Unboxing calls intValue() on null.',
    },
    {
      question: 'Which method returns a primitive int from a String?',
      options: ['Integer.valueOf()', 'Integer.toString()', 'String.valueOf()', 'Integer.parseInt()'],
      answer: 3,
      explanation: 'parseInt returns int; valueOf returns Integer.',
    },
    {
      question: 'show(long) and show(Integer) both exist. show(5) calls...',
      options: ['show(Integer)', 'show(long)', 'Ambiguous error', 'Neither'],
      answer: 1,
      explanation: 'Widening is preferred over boxing.',
    },
  ],
};
