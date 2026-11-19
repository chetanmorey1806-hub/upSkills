export default {
  lesson: 'day-03-program-structure-main-comments-keywords',
  minutes: 18,
  intro: 'Check the parts of a Java file, the main() signature, comments, naming conventions and keywords.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: `Complete the main method signature so the JVM can call it without creating an object:
\`public ____ void main(String[] args)\``,
      example: {
        title: 'what each word means',
        text: '`public` = JVM can access it, `void` = returns nothing, `String[] args` = command-line arguments.',
      },
      accept: ['static'],
      acceptRegex: ['^static\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`static` means the method belongs to the **class**, so the JVM can call `Main.main(args)` before any object exists. Without static the program compiles but the JVM reports that main must be static.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid** main method declarations that the JVM accepts? (choose all that apply)',
      options: [
        'public static void main(String[] args)',
        'static public void main(String[] args)',
        'public static void main(String... args)',
        'public static void main(String args[])',
        'public static int main(String[] args)',
        'public void main(String[] args)',
      ],
      answers: [0, 1, 2, 3],
      explain: 'The order of `public static` can swap, the array can be written as `String[] args`, `String args[]` or varargs `String... args`, and the parameter name can be anything. The return type must be `void` and the method must be `static` (in classic Java).',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **valid identifiers** (variable names) in Java? (choose all that apply)',
      options: ['totalMarks', '_count', '$price', '2ndRank', 'class', 'student_name'],
      answers: [0, 1, 2, 5],
      explain: 'Identifiers may contain letters, digits, `_` and `$`, but **cannot start with a digit** (`2ndRank`) and cannot be a **keyword** (`class`). By convention variables use camelCase like `totalMarks`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Following Java naming conventions, write the name of a **constant** that stores the maximum marks (two words: max, marks).',
      example: {
        title: 'conventions',
        text: 'Class: `StudentReport` · method/variable: `calculateTotal` · package: `com.upskillr.app`',
      },
      accept: ['MAX_MARKS'],
      acceptRegex: ['^MAX_MARKS\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Constants (`static final`) use **UPPER_SNAKE_CASE**: `MAX_MARKS`. `maxMarks` is the style for variables and methods, and `MaxMarks` is the style for classes.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print?',
      example: {
        title: 'comments are ignored',
        code: `/* this is skipped */
System.out.println("shown"); // so is this`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Line 1"); // first
        /*
        System.out.println("Line 2");
        */
        System.out.println("Line 3");
        /** Documentation comment */
        System.out.println("Line 4");
    }
}`,
      expected: `Line 1
Line 3
Line 4`,
      explain: '`//` hides the rest of a line, `/* ... */` hides everything between the markers (even several lines), and `/** ... */` is a documentation comment used by javadoc. So "Line 2" is never compiled.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'Tricky one: what does this program print?',
      example: { title: 'text inside quotes is just text', code: 'System.out.println("5 + 5"); // prints 5 + 5' },
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Visit https://upskillr.in");
        System.out.println("/* not a comment */");
    }
}`,
      expected: `Visit https://upskillr.in
/* not a comment */`,
      explain: 'Comment markers **inside a String literal** are just characters. The compiler only treats `//` and `/*` as comments when they appear in code, not inside double quotes.',
    },
  ],
};
