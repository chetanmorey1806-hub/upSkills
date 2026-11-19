export default {
  lesson: 'day-13-string-class-methods-pool',
  minutes: 22,
  intro: 'Compare Strings correctly, understand the String pool and immutability, and use the most common String methods.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'String pool and `==`: what does this program print?',
      example: {
        title: '== compares references, equals() compares text',
        code: `String x = new String("Hi");
String y = new String("Hi");
System.out.println(x == y);      // false
System.out.println(x.equals(y)); // true`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        String s1 = "Java";
        String s2 = "Java";
        String s3 = new String("Java");
        System.out.println(s1 == s2);
        System.out.println(s1 == s3);
        System.out.println(s1.equals(s3));
        System.out.println(s1 == s3.intern());
    }
}`,
      expected: `true
false
true
true`,
      explain: 'String literals are stored once in the **String Constant Pool**, so s1 and s2 point to the same object (true). `new String` always creates a new heap object (false). `equals` compares characters (true). `intern()` returns the pooled copy, which is s1 (true).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'String methods: what does this program print?',
      example: {
        title: 'indexes start at 0',
        code: `String c = "Pune";
c.charAt(0);        // 'P'
c.substring(1, 3);  // "un" (end index excluded)`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        String s = "UpSkillr Java";
        System.out.println(s.length());
        System.out.println(s.charAt(2));
        System.out.println(s.substring(2, 7));
        System.out.println(s.indexOf('a'));
        System.out.println(s.replace('a', '@'));
        s.toUpperCase();
        System.out.println(s);
    }
}`,
      expected: `13
S
Skill
10
UpSkillr J@v@
UpSkillr Java`,
      explain: 'Length counts the space too (13). `substring(2, 7)` takes indexes 2..6 ("Skill"), the end index is excluded. `indexOf` returns the first match (10). The trap: `s.toUpperCase()` returns a **new** String that is thrown away; Strings are **immutable**, so s is unchanged. Write `s = s.toUpperCase();` to keep it.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the condition that checks whether the String `input` has the same text as `"admin"`, **ignoring capital letters**.',
      example: { title: 'exact comparison', code: 'if (city.equals("Pune")) { ... }' },
      accept: ['input.equalsIgnoreCase("admin")', '"admin".equalsIgnoreCase(input)'],
      acceptRegex: [
        '^input\\s*\\.\\s*equalsIgnoreCase\\s*\\(\\s*"admin"\\s*\\)\\s*[;{]?$',
        '^"admin"\\s*\\.\\s*equalsIgnoreCase\\s*\\(\\s*input\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`equalsIgnoreCase` compares the characters without caring about case, so "ADMIN" and "Admin" match. Putting the literal first (`"admin".equalsIgnoreCase(input)`) also avoids a NullPointerException when input is null. Never compare text with `==`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Split the CSV line \`String line = "Asha,21,Pune";\` into parts. Complete:
\`String[] parts = ____;\``,
      example: { title: 'joining is the opposite', code: 'String s = String.join("-", "a", "b", "c"); // a-b-c' },
      accept: ['line.split(",")'],
      acceptRegex: ['^line\\s*\\.\\s*split\\s*\\(\\s*","\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`split(",")` returns a String array: ["Asha", "21", "Pune"]. The argument is a **regular expression**, so splitting on a dot needs `split("\\\\.")`. Use `Integer.parseInt(parts[1])` to turn "21" into a number.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Why are Java Strings **immutable**? Pick the best reason.',
      options: [
        'To make string concatenation faster',
        'So pooled literals can be shared safely, and Strings are safe as HashMap keys and across threads',
        'Because Java has no char arrays',
        'So Strings can be changed with setCharAt',
      ],
      answer: 1,
      explain: 'Because a String can never change, many variables can safely share one pooled object, its hash code can be cached (great for HashMap keys) and it is automatically thread-safe. The downside is that repeated `+` in a loop creates many objects: use StringBuilder for that.',
    },
    {
      type: 'multi',
      mins: 2,
      q: '`String s = "  Hello World  ";` Which statements are TRUE? (choose all that apply)',
      options: [
        's.trim() returns "Hello World"',
        's.length() is 15',
        's.contains("World") is true',
        's.isEmpty() is true',
        's.toLowerCase().startsWith("  hello") is true',
      ],
      answers: [0, 1, 2, 4],
      explain: '`trim()` removes the spaces at both ends → "Hello World". The length counts every character including the 2 + 2 outer spaces: 2 + 11 + 2 = **15**. `contains` finds "World". `isEmpty()` is true only for "" (length 0). Methods can be chained: `toLowerCase()` returns "  hello world  ", which starts with "  hello".',
    },
  ],
};
