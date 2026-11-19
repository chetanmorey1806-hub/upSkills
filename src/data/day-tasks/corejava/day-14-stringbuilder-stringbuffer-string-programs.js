export default {
  lesson: 'day-14-stringbuilder-stringbuffer-string-programs',
  minutes: 22,
  intro: 'Use StringBuilder methods and solve reverse, palindrome, vowel-count and anagram programs.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does this program print?',
      example: {
        title: 'StringBuilder changes itself',
        code: `StringBuilder sb = new StringBuilder("ab");
sb.append("c");   // sb is now "abc"`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("Java");
        sb.append(" 21");
        System.out.println(sb);
        sb.insert(0, "Hi ");
        System.out.println(sb);
        sb.reverse();
        System.out.println(sb);
        System.out.println(sb.length());
    }
}`,
      expected: `Java 21
Hi Java 21
12 avaJ iH
10`,
      explain: 'Unlike String, a **StringBuilder is mutable**: append, insert and reverse change the same object, so there is no need to write `sb = sb.append(...)`. `insert(0, ...)` adds at the start. After reverse the text is "12 avaJ iH", 10 characters long.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'delete, replace and setCharAt: what does this program print?',
      example: { title: 'end index is excluded', code: 'new StringBuilder("hello").delete(0, 2); // "llo"' },
      code: `public class Main {
    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder("abcdef");
        sb.delete(1, 3);
        System.out.println(sb);
        sb.replace(0, 1, "XY");
        System.out.println(sb);
        sb.setCharAt(2, 'Z');
        System.out.println(sb);
        sb.deleteCharAt(sb.length() - 1);
        System.out.println(sb);
    }
}`,
      expected: `adef
XYdef
XYZef
XYZe`,
      explain: '`delete(1, 3)` removes indexes 1 and 2 ("bc") → "adef". `replace(0, 1, "XY")` replaces index 0 ("a") with "XY" → "XYdef". `setCharAt(2, \'Z\')` changes the d → "XYZef". `deleteCharAt(last)` removes the f. Start index is included, end index is excluded, exactly like substring.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Write a one-line expression that gives the **reverse** of the String \`s\` as a String.
\`String rev = ____;\``,
      example: {
        title: 'building text in a loop',
        code: `StringBuilder sb = new StringBuilder();
for (int i = 1; i <= 3; i++) sb.append(i);
String r = sb.toString(); // "123"`,
      },
      accept: [
        'new StringBuilder(s).reverse().toString()',
        'new StringBuffer(s).reverse().toString()',
        'new StringBuilder(s).reverse() + ""',
        '"" + new StringBuilder(s).reverse()',
      ],
      acceptRegex: [
        '^new\\s+StringBuilder\\s*\\(\\s*s\\s*\\)\\s*\\.\\s*reverse\\s*\\(\\s*\\)\\s*\\.\\s*toString\\s*\\(\\s*\\)\\s*[;{]?$',
        '^new\\s+StringBuffer\\s*\\(\\s*s\\s*\\)\\s*\\.\\s*reverse\\s*\\(\\s*\\)\\s*\\.\\s*toString\\s*\\(\\s*\\)\\s*[;{]?$',
        '^new\\s+StringBuilder\\s*\\(\\s*s\\s*\\)\\s*\\.\\s*reverse\\s*\\(\\s*\\)\\s*\\+\\s*""\\s*[;{]?$',
        '^""\\s*\\+\\s*new\\s+StringBuilder\\s*\\(\\s*s\\s*\\)\\s*\\.\\s*reverse\\s*\\(\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'StringBuilder has a built-in `reverse()`. `toString()` turns it back into a String (a StringBuilder is not a String, so `String rev = new StringBuilder(s).reverse();` does not compile). A palindrome check is then `s.equals(rev)`.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Vowel counter: complete the condition that is true when the char \`c\` (already lower-case) is a vowel.
\`if (____) count++;\``,
      example: { title: 'checking digits', code: 'if (c >= \'0\' && c <= \'9\') digits++;' },
      accept: [
        '"aeiou".indexOf(c) != -1',
        '"aeiou".indexOf(c) >= 0',
        '"aeiou".contains(String.valueOf(c))',
        '"aeiou".contains(c + "")',
        'c == \'a\' || c == \'e\' || c == \'i\' || c == \'o\' || c == \'u\'',
      ],
      acceptRegex: [
        '^"aeiou"\\s*\\.\\s*indexOf\\s*\\(\\s*c\\s*\\)\\s*!\\s*=\\s*-\\s*1\\s*[;{]?$',
        '^"aeiou"\\s*\\.\\s*indexOf\\s*\\(\\s*c\\s*\\)\\s*>\\s*=\\s*0\\s*[;{]?$',
        '^"aeiou"\\s*\\.\\s*contains\\s*\\(\\s*String\\s*\\.\\s*valueOf\\s*\\(\\s*c\\s*\\)\\s*\\)\\s*[;{]?$',
        '^"aeiou"\\s*\\.\\s*contains\\s*\\(\\s*c\\s*\\+\\s*""\\s*\\)\\s*[;{]?$',
        '^c\\s*=\\s*=\\s*\'a\'\\s*\\|\\s*\\|\\s*c\\s*=\\s*=\\s*\'e\'\\s*\\|\\s*\\|\\s*c\\s*=\\s*=\\s*\'i\'\\s*\\|\\s*\\|\\s*c\\s*=\\s*=\\s*\'o\'\\s*\\|\\s*\\|\\s*c\\s*=\\s*=\\s*\'u\'\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'The short way is `"aeiou".indexOf(c) != -1` (indexOf returns −1 when the char is not found). The long way compares with each vowel using `||`. A common mistake is `c == "a"`: a char must be compared with a char literal in single quotes.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Several threads append log lines to the **same** builder object at the same time. Which class is designed for that?',
      options: ['String', 'StringBuilder', 'StringBuffer', 'Character'],
      answer: 2,
      explain: '**StringBuffer** has synchronized methods, so it is thread-safe (but slower). StringBuilder (Java 5) has the same methods without synchronization and is the default choice in single-threaded code. String is immutable, so it cannot be appended to in place.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Two words are **anagrams** if they contain the same letters ("listen" / "silent"). Which approach is correct?',
      options: [
        'Compare s1.length() == s2.length() only',
        'Sort the char arrays of both words and compare them with Arrays.equals',
        'Check s1.contains(s2)',
        'Compare s1.hashCode() == s2.hashCode()',
      ],
      answer: 1,
      explain: 'Convert both to char arrays (`toCharArray()`), sort them with `Arrays.sort`, and compare with `Arrays.equals`. Equal lengths are necessary but not enough, and hashCode of different texts differs. Another O(n) way is counting letters with an `int[26]` frequency array.',
    },
  ],
};
