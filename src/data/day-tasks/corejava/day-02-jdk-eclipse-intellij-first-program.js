export default {
  lesson: 'day-02-jdk-eclipse-intellij-first-program',
  minutes: 15,
  intro: 'Practise compiling and running Java from the command line, the file-name rules and the common beginner errors.',
  tasks: [
    {
      type: 'fill',
      mins: 1,
      q: 'Your file is `Hello.java` in the current folder. Type the exact command that **compiles** it.',
      example: {
        title: 'checking the installed version',
        code: `javac -version
java -version`,
      },
      accept: ['javac Hello.java'],
      explain: '`javac Hello.java` compiles the source file and creates `Hello.class`. You must give the **file name with the .java extension** to javac. Writing `java Hello.java` uses the launcher instead (single-file source mode), it is not the compile step.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'After compiling, `Hello.class` exists. Type the exact command that **runs** the program.',
      example: {
        title: 'compile then run another class',
        code: `javac Student.java
java Student`,
      },
      accept: ['java Hello'],
      explain: 'You run a class with `java ClassName`, **without** `.class`. Typing `java Hello.class` gives "Could not find or load main class Hello.class" because the JVM looks for a class literally named `Hello.class`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Priya types `javac Hello.java` and Windows says: **\'javac\' is not recognized as an internal or external command**. What is the most likely cause?',
      options: [
        'Her code has a syntax error',
        'The JDK bin folder is not in the PATH environment variable',
        'The class is not public',
        'She forgot the main method',
      ],
      answer: 1,
      explain: 'The OS cannot find the `javac` program, so the problem is the **PATH**: add `%JAVA_HOME%\\bin` (e.g. `C:\\Program Files\\Java\\jdk-21\\bin`) to PATH and open a new terminal. Code errors only appear after javac actually starts.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'A file named `Student.java` contains `public class Main { ... }`. What happens when you compile it?',
      options: [
        'It compiles fine',
        'Compile error: a public class must be declared in a file with the same name (Main.java)',
        'It compiles but cannot run',
        'Java renames the file automatically',
      ],
      answer: 1,
      explain: 'A **public** class must live in a file with exactly the same name, including capital letters: `public class Main` → `Main.java`. Fix it by renaming the file or the class.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print? Watch the difference between `print` and `println`.',
      example: {
        title: 'print stays on the same line',
        code: `System.out.print("A");
System.out.print("B");
System.out.println("C");
// prints: ABC`,
      },
      code: `public class Hello {
    public static void main(String[] args) {
        System.out.print("Hello, ");
        System.out.println("UpSkillr!");
        System.out.print("Java ");
        System.out.print("is ");
        System.out.println("ready");
    }
}`,
      expected: `Hello, UpSkillr!
Java is ready`,
      explain: '`print` writes text and stays on the same line; `println` writes text and then moves to the next line. So the first two calls make one line and the last three calls make the second line.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'The program compiles, but `java Hello` prints **Error: Main method not found in class Hello**. Which line is most likely wrong?',
      options: ['public class Hello {', 'public static void Main(String[] args) {', 'System.out.println("Hi");', 'The closing brace }'],
      answer: 1,
      explain: 'Java is **case-sensitive**: the entry point must be `main` with a small m. `Main` is just another method, so the JVM cannot find the entry point. The file still compiles because `Main` is a legal method name.',
    },
  ],
};
