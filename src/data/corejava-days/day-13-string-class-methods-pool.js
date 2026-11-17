const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        String s1 = "Java";                 // goes to String Pool
        String s2 = "Java";                 // reuses the same pooled object
        String s3 = new String("Java");     // new object on the heap
        String s4 = s3.intern();            // pooled version of s3

        System.out.println("s1 == s2      : " + (s1 == s2));
        System.out.println("s1 == s3      : " + (s1 == s3));
        System.out.println("s1.equals(s3) : " + s1.equals(s3));
        System.out.println("s1 == s4      : " + (s1 == s4));
        System.out.println("equalsIgnoreCase(\"JAVA\") : " + s1.equalsIgnoreCase("JAVA"));

        String part = "Ja";
        String runtime = part + "va";       // built at runtime -> new object
        final String fixed = "Ja";
        String compileTime = fixed + "va";  // constant -> computed by compiler, pooled
        System.out.println("s1 == runtime     : " + (s1 == runtime));
        System.out.println("s1 == compileTime : " + (s1 == compileTime));
    }
}`;

const ex2 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String raw = "  Hello Java World  ";
        String s = raw.trim();

        System.out.println("trim        : [" + s + "]");
        System.out.println("length      : " + s.length());
        System.out.println("upper       : " + s.toUpperCase());
        System.out.println("lower       : " + s.toLowerCase());
        System.out.println("charAt(6)   : " + s.charAt(6));
        System.out.println("indexOf     : " + s.indexOf("Java"));
        System.out.println("lastIndexOf : " + s.lastIndexOf('o'));
        System.out.println("substring   : " + s.substring(6, 10));
        System.out.println("substring   : " + s.substring(11));
        System.out.println("replace     : " + s.replace("Java", "Python"));
        System.out.println("contains    : " + s.contains("World"));
        System.out.println("startsWith  : " + s.startsWith("Hello"));
        System.out.println("endsWith    : " + s.endsWith("d"));
        System.out.println("isEmpty     : " + "".isEmpty() + ", isBlank: " + "   ".isBlank());

        String[] parts = s.split(" ");
        System.out.println("split       : " + Arrays.toString(parts) + " (" + parts.length + " parts)");
        System.out.println("join        : " + String.join("-", parts));
        System.out.println("repeat      : " + "Ha".repeat(3));
        System.out.println("indexOf(\"C\"): " + s.indexOf("C"));
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        String name = "Ravi";
        name.concat(" Kumar");              // result ignored - name unchanged
        System.out.println("After concat (ignored)  : " + name);

        name = name.concat(" Kumar");       // re-assign to keep the new String
        System.out.println("After concat (assigned) : " + name);

        String upper = name.toUpperCase();
        System.out.println("Original : " + name);
        System.out.println("Upper    : " + upper);

        String a = "Hi";
        String b = a;          // both refer to "Hi"
        a = a + "!";           // a now refers to a NEW object "Hi!"
        System.out.println("a = " + a + ", b = " + b);
    }
}`;

const ex4 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("\"apple\".compareTo(\"banana\")   = " + "apple".compareTo("banana"));
        System.out.println("\"Apple\".compareTo(\"Apricot\")  = " + "Apple".compareTo("Apricot"));
        System.out.println("\"Java\".compareTo(\"Javascript\") = " + "Java".compareTo("Javascript"));
        System.out.println("\"Java\".compareTo(\"Java\")       = " + "Java".compareTo("Java"));
        System.out.println("\"b\".compareTo(\"a\")             = " + "b".compareTo("a"));
        System.out.println("\"apple\".compareToIgnoreCase(\"APPLE\") = " + "apple".compareToIgnoreCase("APPLE"));

        String[] fruits = {"Mango", "apple", "Banana", "cherry"};
        Arrays.sort(fruits);
        System.out.println("Natural order     : " + Arrays.toString(fruits));
        Arrays.sort(fruits, String.CASE_INSENSITIVE_ORDER);
        System.out.println("Ignoring the case : " + Arrays.toString(fruits));
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        String sentence = "Java is easy and Java is powerful";
        String[] words = sentence.split(" ");
        int javaCount = 0;
        for (String w : words) {
            if (w.equals("Java")) {
                javaCount++;
            }
        }
        System.out.println("Words: " + words.length + ", 'Java' appears " + javaCount + " times");

        String email = "ravi.kumar@gmail.com";
        int at = email.indexOf('@');
        System.out.println("Username: " + email.substring(0, at));
        System.out.println("Domain  : " + email.substring(at + 1));

        String phone = "9876543210";
        String masked = "*".repeat(6) + phone.substring(6);
        System.out.println("Masked phone: " + masked);

        String num = "45";
        System.out.println("String + 5   : " + (num + 5));
        System.out.println("parseInt + 5 : " + (Integer.parseInt(num) + 5));
        System.out.println("valueOf      : " + String.valueOf(3.5).length());

        String title = "core java";
        String capitalised = title.substring(0, 1).toUpperCase() + title.substring(1);
        System.out.println("Capitalised  : " + capitalised);
    }
}`;

export default {
  id: 'day-13-string-class-methods-pool',
  title: 'String Class, String Methods, Immutability, String Pool, == vs equals()',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 13,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Understand how Java stores and compares text. Learn the String Pool, why Strings are immutable, the difference between == and equals(), and the most important String methods used every day in real projects and interviews.',
  objectives: [
    'Create Strings using literals and the new keyword and explain where each is stored',
    'Explain the String Constant Pool and the intern() method',
    'Explain String immutability and its benefits',
    'Compare Strings correctly using equals, equalsIgnoreCase and compareTo instead of ==',
    'Use common String methods: length, charAt, substring, indexOf, replace, split, trim, join and more',
  ],
  theory: [
    {
      heading: 'What is a String?',
      content: j`A String is a sequence of characters, like "Hello". In Java, String is a class in java.lang (not a primitive), so every String is an object.

Two ways to create a String:
1. String literal:      String s1 = "Java";
2. Using new:           String s2 = new String("Java");

Internally (Java 9+), a String stores its characters in a byte array with an encoding flag (Compact Strings), which saves memory for English text.

String implements CharSequence and Comparable<String>, and the class is final, so nobody can extend it.`,
    },
    {
      heading: 'String Constant Pool (SCP)',
      content: j`The String Pool is a special area inside the heap where Java keeps ONE copy of each String literal.

String s1 = "Java";              // creates "Java" in the pool
String s2 = "Java";              // reuses the SAME pooled object
String s3 = new String("Java");  // creates a NEW object in the normal heap

          Heap
  +-----------------------------------+
  |  String Pool                      |
  |   +---------+                     |
  |   | "Java"  | <---- s1, s2        |
  |   +---------+                     |
  |                                   |
  |   +---------+                     |
  |   | "Java"  | <---- s3 (new)      |
  |   +---------+                     |
  +-----------------------------------+

Analogy: the pool is like a library. If a book (literal) is already on the shelf, everyone who asks for it gets the same copy instead of printing a new one.

- new String("Java") creates up to 2 objects: one in the pool (if not already there) and one in the heap.
- s3.intern() returns the pooled copy.
- Compile-time constants ("Ja" + "va", or final variables) are joined by the compiler and pooled. Concatenation of non-final variables happens at runtime and creates a new heap object.`,
    },
    {
      heading: '== vs equals()',
      content: j`- == compares REFERENCES: are both variables pointing to the exact same object?
- equals() compares CONTENT: do both Strings contain the same characters?

String a = "Hi";
String b = new String("Hi");
a == b         -> false (different objects)
a.equals(b)    -> true  (same characters)

Other comparison methods:
- equalsIgnoreCase("HI") -> ignores upper/lower case
- compareTo(other) -> 0 if equal, negative if this comes first alphabetically, positive if after. It returns the difference of the first different characters, or the difference in lengths if one is a prefix of the other.
- compareToIgnoreCase(other)`,
      tip: 'Always use equals() for Strings. To avoid NullPointerException when a variable may be null, call it on the literal: "Admin".equals(role).',
    },
    {
      heading: 'Immutability',
      content: j`Once a String object is created, its content can NEVER change. Every "modifying" method (concat, toUpperCase, replace, trim, substring) returns a NEW String and leaves the original untouched.

String name = "Ravi";
name.concat(" Kumar");          // new String created and thrown away
System.out.println(name);       // Ravi
name = name.concat(" Kumar");   // now name points to the new object

Why are Strings immutable?
1. String Pool: many variables share one object; if one could change it, all would change.
2. Security: usernames, passwords, file paths, DB URLs cannot be altered after validation.
3. Thread safety: immutable objects can be shared between threads without locks.
4. Hash caching: the hashCode is computed once and cached, making Strings fast HashMap keys.

Downside: building a String in a loop with + creates many temporary objects. Use StringBuilder (Day 14).`,
    },
    {
      heading: 'Most Used String Methods',
      content: j`Assume s = "Hello Java"`,
      points: [
        'length() -> 10                               charAt(4) -> \'o\'',
        'indexOf("Java") -> 6, indexOf(\'z\') -> -1     lastIndexOf(\'a\') -> 9',
        'substring(6) -> "Java"                       substring(0, 5) -> "Hello" (end index excluded)',
        'toUpperCase() / toLowerCase()                trim() / strip() remove leading/trailing spaces',
        'replace("Java", "World") -> "Hello World"    replaceAll(regex, text)',
        'contains("ell") -> true                      startsWith("He") / endsWith("va")',
        'split(" ") -> ["Hello", "Java"]              String.join("-", "a", "b") -> "a-b"',
        'isEmpty() (length 0)                         isBlank() (only whitespace, Java 11)',
        'toCharArray() -> char[]                      chars() -> stream of chars',
        'String.valueOf(10) -> "10"                    Integer.parseInt("10") -> 10',
        'repeat(3) (Java 11), strip() (Java 11), lines() (Java 11)',
        'equals, equalsIgnoreCase, compareTo, compareToIgnoreCase, matches(regex)',
      ],
    },
    {
      heading: 'Common Mistakes with Strings',
      content: j`Avoid these frequent bugs:`,
      points: [
        'Comparing with == instead of equals() (works sometimes because of the pool, then fails with user input)',
        'Forgetting to assign the result: s.toUpperCase(); does not change s',
        'substring end index is EXCLUSIVE: "Hello".substring(1, 3) is "el"',
        'charAt with an invalid index throws StringIndexOutOfBoundsException',
        'Calling a method on a null String throws NullPointerException',
        'Using + inside large loops: slow, use StringBuilder',
      ],
    },
  ],
  examples: [
    {
      title: 'String Pool, == and equals()',
      scenario: 'Prove which Strings share the same object and which only have equal content.',
      steps: [
        'Create class Main in IntelliJ or Eclipse',
        'Type the program and predict each true/false',
        'Run and compare with your predictions',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `s1 == s2      : true
s1 == s3      : false
s1.equals(s3) : true
s1 == s4      : true
equalsIgnoreCase("JAVA") : true
s1 == runtime     : false
s1 == compileTime : true`,
      explanation: 's1 and s2 point to the same pooled literal. new String creates a separate heap object, so == is false but equals is true. intern() returns the pooled object. part + "va" is computed at runtime and creates a new object. fixed is a final constant, so the compiler joins "Ja" + "va" into the literal "Java", which is the pooled one.',
    },
    {
      title: 'Tour of common String methods',
      scenario: 'Apply the most used methods to a sentence and observe each result.',
      steps: [
        'Type the program; notice trim() is called first',
        'Write down the index of each character of "Hello Java World" (H=0 ... d=15)',
        'Run and verify each output using your index table',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `trim        : [Hello Java World]
length      : 16
upper       : HELLO JAVA WORLD
lower       : hello java world
charAt(6)   : J
indexOf     : 6
lastIndexOf : 12
substring   : Java
substring   : World
replace     : Hello Python World
contains    : true
startsWith  : true
endsWith    : true
isEmpty     : true, isBlank: true
split       : [Hello, Java, World] (3 parts)
join        : Hello-Java-World
repeat      : HaHaHa
indexOf("C"): -1`,
      explanation: 'After trim the String has 16 characters. "Java" starts at index 6. The last \'o\' is in "World" at index 12. substring(6, 10) takes indexes 6-9. substring(11) takes from index 11 to the end. "" is empty and "   " is blank. split(" ") produces three words. indexOf returns -1 when not found.',
    },
    {
      title: 'Immutability in action',
      scenario: 'See that String methods never change the original object.',
      steps: [
        'Call concat without assigning, then with assigning',
        'Create an upper-case version and print both',
        'Run and check the values of a and b at the end',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `After concat (ignored)  : Ravi
After concat (assigned) : Ravi Kumar
Original : Ravi Kumar
Upper    : RAVI KUMAR
a = Hi!, b = Hi`,
      explanation: 'concat returns a new String; when the result is not stored, nothing changes. toUpperCase also returns a new object. a + "!" creates "Hi!" and makes a point to it, while b still points to the old, unchanged "Hi".',
    },
    {
      title: 'compareTo and sorting Strings',
      scenario: 'Understand alphabetical comparison and sort fruit names with and without case sensitivity.',
      steps: [
        'Type the compareTo lines and calculate each value using Unicode codes (a=97, b=98, p=112, r=114)',
        'Sort the array with Arrays.sort, then with String.CASE_INSENSITIVE_ORDER',
        'Run and compare',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `"apple".compareTo("banana")   = -1
"Apple".compareTo("Apricot")  = -2
"Java".compareTo("Javascript") = -6
"Java".compareTo("Java")       = 0
"b".compareTo("a")             = 1
"apple".compareToIgnoreCase("APPLE") = 0
Natural order     : [Banana, Mango, apple, cherry]
Ignoring the case : [apple, Banana, cherry, Mango]`,
      explanation: 'a(97) - b(98) = -1. "Apple" vs "Apricot": first difference at index 2, p(112) - r(114) = -2. "Java" is a prefix of "Javascript", so the result is the length difference 4 - 10 = -6. Natural order uses Unicode values, where all uppercase letters (65-90) come before lowercase (97-122), so Banana and Mango come first.',
    },
    {
      title: 'Real-world String processing',
      scenario: 'Count words, extract username and domain from an email, mask a phone number and capitalise a title.',
      steps: [
        'Use split to break the sentence into words and equals to count "Java"',
        'Use indexOf and substring for the email',
        'Use repeat and substring to mask the phone number; run',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Words: 7, 'Java' appears 2 times
Username: ravi.kumar
Domain  : gmail.com
Masked phone: ******3210
String + 5   : 455
parseInt + 5 : 50
valueOf      : 3
Capitalised  : Core java`,
      explanation: 'The sentence has 7 words, two of which are "Java". @ is at index 10, so substring(0, 10) is the username and substring(11) is the domain. The last 4 digits of the phone are kept. "45" + 5 concatenates to "455", while parseInt converts to 45 and adds 5. String.valueOf(3.5) is "3.5" with length 3.',
    },
  ],
  interview: [
    { q: 'Why is String immutable in Java?', a: 'For String Pool sharing, security (paths, credentials, class names), thread safety and hash code caching. Any modification creates a new object.', level: 'Medium' },
    { q: 'Difference between == and equals() for Strings?', a: '== compares references (same object). equals() compares the character content.', level: 'Easy' },
    { q: 'What is the String Constant Pool?', a: 'A special memory area in the heap that stores unique String literals so identical literals share one object.', level: 'Easy' },
    { q: 'How many objects are created by String s = new String("Hello");?', a: 'Up to two: one "Hello" literal in the pool (if not already present) and one new object in the heap. s refers to the heap object.', level: 'Medium' },
    { q: 'What does intern() do?', a: 'It returns the canonical pooled String with the same content, adding it to the pool if necessary.', level: 'Medium' },
    { q: 'What is the output: String a = "ab"; String b = "a" + "b"; System.out.println(a == b);', a: 'true. "a" + "b" is a compile-time constant, so it becomes the pooled literal "ab".', level: 'Hard' },
    { q: 'What is the output: String x = "a"; String y = x + "b"; System.out.println(y == "ab");', a: 'false. x is not final, so the concatenation happens at runtime and creates a new object.', level: 'Hard' },
    { q: 'What is the output: String s = "java"; s.toUpperCase(); System.out.println(s);', a: 'java. The result of toUpperCase() was not stored; Strings are immutable.', level: 'Easy' },
    { q: 'Why is String a popular HashMap key?', a: 'It is immutable and caches its hashCode, so the key cannot change after insertion and lookups are fast.', level: 'Medium' },
    { q: 'What does "Hello".substring(1, 3) return?', a: '"el". The begin index is inclusive and the end index is exclusive.', level: 'Easy' },
    { q: 'Difference between isEmpty() and isBlank()?', a: 'isEmpty() is true only for length 0. isBlank() (Java 11) is also true for strings containing only whitespace.', level: 'Easy' },
    { q: 'Can we extend the String class?', a: 'No. String is declared final.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Count the uppercase letters, lowercase letters, digits and spaces in "Java 21 Is Great".',
      hint: 'Loop over charAt(i) and use Character.isUpperCase, isLowerCase, isDigit.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String s = "Java 21 Is Great";
        int upper = 0, lower = 0, digits = 0, spaces = 0;
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isUpperCase(c)) upper++;
            else if (Character.isLowerCase(c)) lower++;
            else if (Character.isDigit(c)) digits++;
            else if (c == ' ') spaces++;
        }
        System.out.println("Upper: " + upper + ", Lower: " + lower + ", Digits: " + digits + ", Spaces: " + spaces);
    }
}`,
    },
    {
      task: 'Read a username and password and log in only if username equals "admin" (ignore case) and password equals "Java@123".',
      hint: 'Use equalsIgnoreCase and equals; call them on the literal to avoid NullPointerException.',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.println("Username:");
        String user = sc.nextLine();
        System.out.println("Password:");
        String pass = sc.nextLine();
        if ("admin".equalsIgnoreCase(user) && "Java@123".equals(pass)) {
            System.out.println("Login successful");
        } else {
            System.out.println("Invalid credentials");
        }
    }
}`,
    },
    {
      task: 'Convert "java full stack developer" to title case: "Java Full Stack Developer".',
      hint: 'split by space, capitalise first letter of each word, join back.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String s = "java full stack developer";
        String[] words = s.split(" ");
        for (int i = 0; i < words.length; i++) {
            words[i] = words[i].substring(0, 1).toUpperCase() + words[i].substring(1);
        }
        System.out.println(String.join(" ", words));
    }
}`,
    },
    {
      task: 'Find the file extension and file name from "report_2024.final.pdf".',
      hint: 'Use lastIndexOf(\'.\').',
      solution: j`public class Main {
    public static void main(String[] args) {
        String file = "report_2024.final.pdf";
        int dot = file.lastIndexOf('.');
        System.out.println("Name: " + file.substring(0, dot));
        System.out.println("Extension: " + file.substring(dot + 1));
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which correctly compares the content of two Strings a and b?', options: ['a == b', 'a.equals(b)', 'a = b', 'a.compare(b)'], answer: 1, explanation: 'equals compares characters; == compares references.' },
    { question: 'What does "Programming".substring(3, 7) return?', options: ['gram', 'ogra', 'gramm', 'ram'], answer: 0, explanation: 'Indexes 3 to 6: g, r, a, m.' },
    { question: 'String s = "hi"; s.concat("!"); What is s?', options: ['hi!', 'null', '!', 'hi'], answer: 3, explanation: 'Strings are immutable; the result of concat was not assigned.' },
    { question: 'Where are String literals stored?', options: ['Stack', 'Method area only', 'String Constant Pool in the heap', 'CPU registers'], answer: 2, explanation: 'Literals are stored once in the String Pool, which is part of the heap.' },
    { question: 'What is "abc".compareTo("abd")?', options: ['1', '0', '-1', 'true'], answer: 2, explanation: 'First difference: c(99) - d(100) = -1.' },
  ],
};
