const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Java");
        System.out.println("start     : " + sb);

        sb.append(" Full").append(" Stack");     // method chaining
        System.out.println("append    : " + sb);

        sb.insert(0, "Learn ");
        System.out.println("insert    : " + sb);

        sb.replace(6, 10, "Core");              // replaces index 6..9
        System.out.println("replace   : " + sb);

        sb.delete(10, 15);                      // removes index 10..14
        System.out.println("delete    : " + sb);

        sb.setCharAt(0, 'l');
        System.out.println("setCharAt : " + sb);
        System.out.println("length    : " + sb.length());

        sb.reverse();
        System.out.println("reverse   : " + sb);

        String result = sb.reverse().toString();  // reverse back, convert to String
        System.out.println("toString  : " + result);

        StringBuilder empty = new StringBuilder();
        System.out.println("default capacity : " + empty.capacity());
        System.out.println("capacity of \"Java\" builder : " + new StringBuilder("Java").capacity());
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        StringBuilder a = new StringBuilder("Hi");
        StringBuilder b = a;          // same object
        b.append("!");                // modifies the shared object
        System.out.println("a = " + a + ", b = " + b);

        StringBuilder c = new StringBuilder("Hi!");
        System.out.println("a.equals(c)            : " + a.equals(c));
        System.out.println("toString().equals      : " + a.toString().equals(c.toString()));
        System.out.println("a.compareTo(c)         : " + a.compareTo(c));

        StringBuffer buffer = new StringBuffer("Thread");
        buffer.append("Safe");        // synchronized method
        System.out.println("StringBuffer           : " + buffer);

        StringBuilder csv = new StringBuilder();
        for (int i = 1; i <= 5; i++) {
            csv.append(i);
            if (i < 5) {
                csv.append(",");
            }
        }
        System.out.println("Built in loop          : " + csv);
    }
}`;

const ex3 = j`public class Main {
    static boolean isPalindrome(String s) {
        String clean = s.toLowerCase().replaceAll("[^a-z0-9]", "");
        int left = 0, right = clean.length() - 1;
        while (left < right) {
            if (clean.charAt(left) != clean.charAt(right)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        String word = "Java";

        // Way 1: StringBuilder.reverse()
        String r1 = new StringBuilder(word).reverse().toString();

        // Way 2: loop from the end
        String r2 = "";
        for (int i = word.length() - 1; i >= 0; i--) {
            r2 = r2 + word.charAt(i);
        }

        // Way 3: swap characters in a char array
        char[] chars = word.toCharArray();
        for (int i = 0, k = chars.length - 1; i < k; i++, k--) {
            char t = chars[i];
            chars[i] = chars[k];
            chars[k] = t;
        }
        String r3 = new String(chars);

        System.out.println("Reverse 1: " + r1);
        System.out.println("Reverse 2: " + r2);
        System.out.println("Reverse 3: " + r3);

        String[] tests = {"madam", "Java", "A man, a plan, a canal: Panama"};
        for (String t : tests) {
            System.out.println("\"" + t + "\" palindrome? " + isPalindrome(t));
        }
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        String text = "Programming in Java";
        int vowels = 0, consonants = 0;
        for (char ch : text.toLowerCase().toCharArray()) {
            if (ch >= 'a' && ch <= 'z') {
                if ("aeiou".indexOf(ch) != -1) {
                    vowels++;
                } else {
                    consonants++;
                }
            }
        }
        System.out.println("Vowels: " + vowels + ", Consonants: " + consonants);

        String word = "programming";
        int[] freq = new int[26];
        for (char ch : word.toCharArray()) {
            freq[ch - 'a']++;
        }

        StringBuilder all = new StringBuilder();
        StringBuilder dups = new StringBuilder();
        for (int i = 0; i < 26; i++) {
            if (freq[i] > 0) {
                all.append((char) ('a' + i)).append("=").append(freq[i]).append(" ");
            }
            if (freq[i] > 1) {
                dups.append((char) ('a' + i));
            }
        }
        System.out.println("Frequency: " + all.toString().trim());
        System.out.println("Duplicate letters: " + dups);

        for (char ch : word.toCharArray()) {
            if (freq[ch - 'a'] == 1) {
                System.out.println("First non-repeating: " + ch);
                break;
            }
        }
    }
}`;

const ex5 = j`import java.util.Arrays;

public class Main {
    static boolean isAnagram(String a, String b) {
        char[] x = a.replace(" ", "").toLowerCase().toCharArray();
        char[] y = b.replace(" ", "").toLowerCase().toCharArray();
        if (x.length != y.length) {
            return false;
        }
        Arrays.sort(x);
        Arrays.sort(y);
        return Arrays.equals(x, y);
    }

    public static void main(String[] args) {
        System.out.println("listen / silent : " + isAnagram("listen", "silent"));
        System.out.println("hello / world   : " + isAnagram("hello", "world"));
        System.out.println("Dormitory / Dirty room : " + isAnagram("Dormitory", "Dirty room"));

        String sentence = "Java is fun";
        String[] words = sentence.split(" ");
        StringBuilder reversedWords = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            reversedWords.append(words[i]);
            if (i > 0) {
                reversedWords.append(" ");
            }
        }
        System.out.println("Reverse words : " + reversedWords);

        String mixed = "JaVa";
        StringBuilder toggled = new StringBuilder();
        for (char ch : mixed.toCharArray()) {
            toggled.append(Character.isUpperCase(ch) ? Character.toLowerCase(ch) : Character.toUpperCase(ch));
        }
        System.out.println("Toggle case   : " + toggled);
    }
}`;

export default {
  id: 'day-14-stringbuilder-stringbuffer-string-programs',
  title: 'StringBuilder and StringBuffer, Common String Programs (reverse, palindrome, vowels, anagram)',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 14,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Use the mutable StringBuilder and thread-safe StringBuffer to build and modify text efficiently, then solve the most frequently asked String interview programs: reverse, palindrome, vowel count, character frequency and anagram.',
  objectives: [
    'Explain why StringBuilder and StringBuffer exist when String is immutable',
    'Use append, insert, replace, delete, reverse, setCharAt and toString',
    'Compare String, StringBuilder and StringBuffer (mutability, thread safety, performance)',
    'Write reverse and palindrome programs in multiple ways',
    'Count vowels, find character frequency, duplicates, first non-repeating character and check anagrams',
  ],
  theory: [
    {
      heading: 'Why StringBuilder?',
      content: j`String is immutable. Every + creates a new String object, so building text in a loop creates lots of garbage objects:

String s = "";
for (int i = 0; i < 10000; i++) {
    s = s + i;        // 10,000 temporary String objects
}

StringBuilder is a MUTABLE sequence of characters. It changes the same object in place, so it is much faster for repeated modifications.

Analogy: String is like a printed certificate - to fix a typo you must print a new one. StringBuilder is like a whiteboard - you just erase and rewrite on the same board.

StringBuilder sb = new StringBuilder();
for (int i = 0; i < 10000; i++) {
    sb.append(i);     // same object grows
}
String result = sb.toString();`,
    },
    {
      heading: 'StringBuilder Methods',
      content: j`Constructors:
new StringBuilder()            empty, capacity 16
new StringBuilder("Java")      content "Java", capacity 4 + 16 = 20
new StringBuilder(100)         empty, capacity 100

Methods (most return the same builder, so they can be chained):
append(x)              add to the end (any type)
insert(index, x)       insert at a position
replace(start, end, s) replace characters start..end-1
delete(start, end)     remove characters start..end-1
deleteCharAt(index)    remove one character
setCharAt(index, ch)   change one character
reverse()              reverse in place
charAt, indexOf, length(), substring  (same as String)
capacity()             size of internal buffer
toString()             convert to an immutable String

Capacity grows automatically: when full, new capacity = (old * 2) + 2.`,
      syntax: j`String s = new StringBuilder("abc").append("def").reverse().toString();  // "fedcba"`,
    },
    {
      heading: 'String vs StringBuilder vs StringBuffer',
      content: j`Feature            String              StringBuilder        StringBuffer
Mutable?           No (immutable)      Yes                  Yes
Thread-safe?       Yes (immutable)     No                   Yes (synchronized)
Performance        Slow for changes    Fastest              Slower than Builder
Introduced         Java 1.0            Java 1.5             Java 1.0
equals()           compares content    reference only       reference only
Stored in pool?    Literals yes        No                   No

When to use:
- String: text that does not change (names, keys, messages).
- StringBuilder: building/modifying text in a single thread (99% of cases, e.g. inside methods).
- StringBuffer: modifying shared text from multiple threads (rare today).

Note: StringBuilder and StringBuffer do NOT override equals(). Compare them with sb1.toString().equals(sb2.toString()) or sb1.compareTo(sb2) == 0 (Java 11+).`,
      tip: 'The compiler already converts simple "a" + b + "c" expressions into efficient code. Use StringBuilder explicitly when concatenating inside loops.',
    },
    {
      heading: 'Program Patterns: Reverse and Palindrome',
      content: j`Reverse a String - 3 common ways:
1. new StringBuilder(s).reverse().toString()   (simplest)
2. Loop from the last index to 0 and append each char
3. Convert to char[] and swap from both ends (two pointers)

Palindrome: reads the same forwards and backwards (madam, level, 121).
- Simple: s.equals(reverse(s))
- Efficient: two pointers left and right moving towards the centre, stop on the first mismatch.
- Real sentences: lower-case and remove non-alphanumeric characters first with replaceAll("[^a-z0-9]", "").`,
    },
    {
      heading: 'Program Patterns: Counting, Frequency and Anagrams',
      content: j`Vowel/consonant count: loop over each char; if it is a letter, check "aeiou".indexOf(ch) != -1.

Character frequency with an int[26] array:
freq[ch - 'a']++   // 'a' -> index 0, 'b' -> 1 ... 'z' -> 25
This trick works because chars are numbers: 'c' - 'a' = 99 - 97 = 2.

- Duplicates: letters with freq > 1
- First non-repeating: scan the ORIGINAL string again and return the first char with freq == 1

Anagram: two words with the same letters in different order (listen / silent).
- Method 1: remove spaces, lower-case, sort both char arrays, compare with Arrays.equals.
- Method 2: count array - add for the first word, subtract for the second, all counts must be 0.`,
      points: [
        'Always normalise case (toLowerCase) before comparing letters',
        'Check lengths first - different lengths can never be anagrams',
        'Sorting approach is O(n log n); counting approach is O(n)',
      ],
    },
  ],
  examples: [
    {
      title: 'StringBuilder methods step by step',
      scenario: 'Transform "Java" into a course title using every major StringBuilder method.',
      steps: [
        'Create class Main and type the code',
        'Write the index of each character on paper after every step to predict replace and delete',
        'Run and verify each line',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `start     : Java
append    : Java Full Stack
insert    : Learn Java Full Stack
replace   : Learn Core Full Stack
delete    : Learn Core Stack
setCharAt : learn Core Stack
length    : 16
reverse   : kcatS eroC nrael
toString  : learn Core Stack
default capacity : 16
capacity of "Java" builder : 20`,
      explanation: 'insert(0, "Learn ") puts text at the beginning. In "Learn Java Full Stack", indexes 6-9 are "Java", replaced by "Core". Indexes 10-14 are " Full", which delete removes. setCharAt changes L to l. reverse() modifies the same object; calling reverse() again restores it. Capacity is 16 by default and length + 16 when created with text.',
    },
    {
      title: 'Mutability, equals and StringBuffer',
      scenario: 'See that two references to one builder share changes, why equals behaves differently, and build a CSV line in a loop.',
      steps: [
        'Type the program',
        'Predict a after b.append("!")',
        'Run and compare the equals results',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `a = Hi!, b = Hi!
a.equals(c)            : false
toString().equals      : true
a.compareTo(c)         : 0
StringBuffer           : ThreadSafe
Built in loop          : 1,2,3,4,5`,
      explanation: 'a and b refer to the same mutable object, so both show "Hi!". StringBuilder does not override equals, so a.equals(c) compares references (false). Converting to String compares content (true). compareTo (Java 11+) compares content and returns 0. The comma is added only between numbers.',
    },
    {
      title: 'Reverse a String in 3 ways and check palindromes',
      scenario: 'Reverse "Java" three different ways and test words and a full sentence for palindrome.',
      steps: [
        'Write the static isPalindrome method using two pointers',
        'Write the three reverse techniques in main',
        'Run and compare the outputs',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Reverse 1: avaJ
Reverse 2: avaJ
Reverse 3: avaJ
"madam" palindrome? true
"Java" palindrome? false
"A man, a plan, a canal: Panama" palindrome? true`,
      explanation: 'All three methods give "avaJ". For the sentence, the cleaned text is "amanaplanacanalpanama", which reads the same both ways. "java" fails at the first comparison: j != a.',
    },
    {
      title: 'Vowels, character frequency, duplicates and first non-repeating character',
      scenario: 'Analyse the letters of a sentence and of the word "programming".',
      steps: [
        'Count vowels and consonants, ignoring spaces',
        'Fill an int[26] frequency array using ch - \'a\'',
        'Print frequencies in alphabetical order, the duplicates and the first non-repeating letter',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Vowels: 6, Consonants: 11
Frequency: a=1 g=2 i=1 m=2 n=1 o=1 p=1 r=2
Duplicate letters: gmr
First non-repeating: p`,
      explanation: '"programming in java" has vowels o, a, i, i, a, a = 6 and 17 letters in total, so 11 consonants. In "programming", g, m and r appear twice. Scanning the word from the start, p is the first letter whose count is 1.',
    },
    {
      title: 'Anagrams, reversing words and toggling case',
      scenario: 'Check anagram pairs, reverse the order of words in a sentence and swap upper/lower case.',
      steps: [
        'Write isAnagram: remove spaces, lower-case, sort both char arrays and compare',
        'Reverse the words using split and a backward loop',
        'Toggle case using Character methods; run',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `listen / silent : true
hello / world   : false
Dormitory / Dirty room : true
Reverse words : fun is Java
Toggle case   : jAvA`,
      explanation: 'Sorted letters of listen and silent are both "eilnst". hello and world have different letters. "dormitory" and "dirtyroom" have the same 9 letters. Words are appended from last to first with spaces in between. Each letter case is flipped.',
    },
  ],
  interview: [
    { q: 'Difference between String, StringBuilder and StringBuffer?', a: 'String is immutable. StringBuilder is mutable and not synchronized (fastest). StringBuffer is mutable and synchronized (thread-safe but slower).', level: 'Easy' },
    { q: 'Why is StringBuilder faster than StringBuffer?', a: 'StringBuffer methods are synchronized, which adds locking overhead. StringBuilder has no synchronization.', level: 'Medium' },
    { q: 'What is the default capacity of StringBuilder and how does it grow?', a: '16 characters. When it overflows, new capacity = old * 2 + 2.', level: 'Medium' },
    { q: 'What is the output: StringBuilder a = new StringBuilder("x"); StringBuilder b = new StringBuilder("x"); System.out.println(a.equals(b));', a: 'false. StringBuilder does not override equals(); it compares references.', level: 'Medium' },
    { q: 'What is the output: StringBuilder sb = new StringBuilder("abc"); sb.reverse(); System.out.println(sb);', a: 'cba. reverse() changes the builder itself.', level: 'Easy' },
    { q: 'What is the output: String s = "abc"; s.toUpperCase(); StringBuilder sb = new StringBuilder("abc"); sb.append("d"); System.out.println(s + sb);', a: 'abcabcd. The String is unchanged; the builder is modified in place.', level: 'Medium' },
    { q: 'How do you check whether two strings are anagrams?', a: 'Normalise (remove spaces, lower-case), compare lengths, then sort both char arrays and compare, or use a frequency count array.', level: 'Medium' },
    { q: 'How do you find the first non-repeating character?', a: 'Count frequencies in a first pass, then scan the string again and return the first char with count 1. O(n).', level: 'Medium' },
    { q: 'How do you reverse a String without using reverse()?', a: 'Loop from the last index to 0 appending characters to a StringBuilder, or swap characters in a char array with two pointers.', level: 'Easy' },
    { q: 'Is StringBuilder thread-safe? What should you use if many threads modify the same text?', a: 'No. Use StringBuffer or external synchronization.', level: 'Easy' },
    { q: 'What is the output: System.out.println(new StringBuilder("hello").insert(2, "XY").delete(0, 1));', a: 'eXYllo. After insert: heXYllo; delete(0, 1) removes h.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Remove all vowels from "Education is important".',
      hint: 'Append only non-vowel characters to a StringBuilder.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String s = "Education is important";
        StringBuilder sb = new StringBuilder();
        for (char ch : s.toCharArray()) {
            if ("aeiouAEIOU".indexOf(ch) == -1) {
                sb.append(ch);
            }
        }
        System.out.println(sb);
    }
}`,
    },
    {
      task: 'Compress a string: "aaabbcdddd" -> "a3b2c1d4".',
      hint: 'Count consecutive equal characters and append char + count.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String s = "aaabbcdddd";
        StringBuilder out = new StringBuilder();
        int count = 1;
        for (int i = 1; i <= s.length(); i++) {
            if (i < s.length() && s.charAt(i) == s.charAt(i - 1)) {
                count++;
            } else {
                out.append(s.charAt(i - 1)).append(count);
                count = 1;
            }
        }
        System.out.println(out);
    }
}`,
    },
    {
      task: 'Reverse each word of "Java is fun" but keep the word order: "avaJ si nuf".',
      hint: 'split, reverse each word with StringBuilder, join with spaces.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String[] words = "Java is fun".split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            sb.append(new StringBuilder(words[i]).reverse());
            if (i < words.length - 1) sb.append(" ");
        }
        System.out.println(sb);
    }
}`,
    },
    {
      task: 'Check anagrams using a frequency count array instead of sorting.',
      hint: 'count[c - \'a\']++ for the first word, -- for the second; all must be 0.',
      solution: j`public class Main {
    public static void main(String[] args) {
        String a = "triangle", b = "integral";
        boolean anagram = a.length() == b.length();
        int[] count = new int[26];
        for (int i = 0; anagram && i < a.length(); i++) {
            count[a.charAt(i) - 'a']++;
            count[b.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) anagram = false;
        }
        System.out.println(a + " and " + b + " anagram? " + anagram);
    }
}`,
    },
    {
      task: 'Find the longest word in a sentence.',
      hint: 'split and keep the word with the greatest length().',
      solution: j`public class Main {
    public static void main(String[] args) {
        String sentence = "Spring Boot makes Java development faster";
        String longest = "";
        for (String w : sentence.split(" ")) {
            if (w.length() > longest.length()) {
                longest = w;
            }
        }
        System.out.println("Longest word: " + longest);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which class is mutable AND synchronized?', options: ['String', 'StringBuilder', 'StringBuffer', 'Character'], answer: 2, explanation: 'StringBuffer methods are synchronized.' },
    { question: 'What is new StringBuilder("ab").append("cd").reverse().toString()?', options: ['dcba', 'abcd', 'badc', 'cdab'], answer: 0, explanation: 'append gives "abcd", reverse gives "dcba".' },
    { question: 'What is the default capacity of new StringBuilder()?', options: ['0', '10', '32', '16'], answer: 3, explanation: 'The default capacity is 16.' },
    { question: 'What does freq[ch - \'a\']++ do when ch is \'d\'?', options: ['Increments freq[100]', 'Increments freq[3]', 'Throws an exception', 'Increments freq[4]'], answer: 1, explanation: '\'d\' - \'a\' = 100 - 97 = 3.' },
    { question: 'Which pair is an anagram?', options: ['java / jaba', 'code / coder', 'stack / stark', 'loop / pool'], answer: 3, explanation: 'loop and pool contain exactly the same letters l, o, o, p. The other pairs differ in at least one letter or in length.' },
  ],
};
