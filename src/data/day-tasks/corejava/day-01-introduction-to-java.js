export default {
  lesson: 'day-01-introduction-to-java',
  minutes: 15,
  intro: 'Check what Java is, how a Java program runs (source → bytecode → JVM) and the difference between JDK, JRE and JVM.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Java was created in the 1990s by **James Gosling** and his team at which company?',
      options: ['Microsoft', 'Sun Microsystems', 'IBM', 'Google'],
      answer: 1,
      explain: 'Java was developed at **Sun Microsystems** (project "Oak", released as Java 1.0 in 1996). Oracle bought Sun in 2010, so today Oracle leads Java, but it was not created there. Google uses Java for Android, it did not invent it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are real **features ("buzzwords") of Java**? (choose all that apply)',
      options: [
        'Platform independent (Write Once, Run Anywhere)',
        'Object-oriented',
        'Uses pointers that the programmer must free manually',
        'Automatic memory management with garbage collection',
        'Multithreaded',
        'Runs only on Windows',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Java is platform independent, object-oriented, robust (garbage collection, no explicit pointers) and multithreaded. There is no manual memory freeing like `free()` in C, and the same bytecode runs on Windows, Linux and macOS.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'The `javac` compiler converts `Hello.java` into a `Hello.class` file. What is the platform-independent code inside a `.class` file called? (one word)',
      example: { title: 'the pipeline', text: 'Source code (.java) → compiler → ????? (.class) → JVM → machine code for your OS' },
      accept: ['bytecode', 'byte code', 'java bytecode'],
      explain: '`.class` files contain **bytecode**: instructions for the JVM, not for a specific CPU. Every OS has its own JVM that understands the same bytecode, which is why Java is platform independent. A common mistake is saying "machine code": that is what the JVM (JIT) produces at runtime.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Ravi only wants to **run** a ready-made Java application on his laptop; he will never write code. Traditionally, what is the minimum he needs?',
      options: ['JDK', 'JRE', 'Only the javac compiler', 'An IDE such as IntelliJ'],
      answer: 1,
      explain: '**JRE = JVM + libraries**, enough to run programs. **JDK = JRE + development tools** (javac, jar, javadoc), needed to write and compile code. (Since Java 11 Oracle ships only the JDK, but the concept is still asked in interviews.)',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Match the idea: which statements are TRUE? (choose all that apply)',
      options: [
        'JDK contains the JRE',
        'JRE contains the JVM',
        'The JVM itself is platform independent',
        'Bytecode is platform independent',
        'javac is part of the JRE',
      ],
      answers: [0, 1, 3],
      explain: 'JDK ⊃ JRE ⊃ JVM. **Bytecode** is platform independent, but the **JVM is platform dependent**: there is a different JVM for Windows, Linux and macOS. `javac` is a development tool, so it lives in the JDK, not the JRE.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this first Java program print? (one line per println)',
      example: {
        title: 'println prints text and moves to a new line',
        code: `System.out.println("Namaste");
System.out.println("Java");
// prints:
// Namaste
// Java`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println("Write once,");
        // System.out.println("compile everywhere");
        System.out.println("run anywhere!");
    }
}`,
      expected: `Write once,
run anywhere!`,
      explain: 'Every `System.out.println` prints its text and then a new line. The line starting with `//` is a **comment**, so the compiler ignores it and it never prints.',
    },
  ],
};
