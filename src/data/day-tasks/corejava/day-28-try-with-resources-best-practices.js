export default {
  lesson: 'day-28-try-with-resources-best-practices',
  minutes: 20,
  intro: 'Use try-with-resources, predict closing order and suppressed exceptions, and apply exception best practices.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Closing order: what does this program print?',
      example: {
        title: 'a resource is any AutoCloseable',
        code: `class Conn implements AutoCloseable {
  public void close() { System.out.println("closed"); }
}`,
      },
      code: `class Res implements AutoCloseable {
    String name;
    Res(String name) {
        this.name = name;
        System.out.println("open " + name);
    }
    @Override
    public void close() {
        System.out.println("close " + name);
    }
}

public class Main {
    public static void main(String[] args) {
        try (Res a = new Res("A"); Res b = new Res("B")) {
            System.out.println("body");
            throw new RuntimeException("boom");
        } catch (RuntimeException e) {
            System.out.println("catch " + e.getMessage());
        } finally {
            System.out.println("finally");
        }
    }
}`,
      expected: `open A
open B
body
close B
close A
catch boom
finally`,
      explain: 'Resources open in the order written and close in the **reverse order** (B before A). They are closed **before** the catch and finally blocks run, so by the time you handle the error the resources are already released.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Suppressed exceptions: what does this program print?',
      example: {
        title: 'reading suppressed exceptions',
        code: 'for (Throwable t : e.getSuppressed()) System.out.println(t.getMessage());',
      },
      code: `class Bad implements AutoCloseable {
    @Override
    public void close() throws Exception {
        throw new Exception("close failed");
    }
}

public class Main {
    public static void main(String[] args) {
        try (Bad b = new Bad()) {
            throw new Exception("body failed");
        } catch (Exception e) {
            System.out.println(e.getMessage());
            System.out.println(e.getSuppressed().length);
            System.out.println(e.getSuppressed()[0].getMessage());
        }
    }
}`,
      expected: `body failed
1
close failed`,
      explain: 'When both the body and close() throw, the **body\'s exception is the main one** and the close exception is attached to it as a *suppressed* exception instead of being lost. With old try-finally code, the close exception would have hidden the original.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the header so the BufferedReader is closed automatically:
\`____ {\`
\`    System.out.println(br.readLine());\`
\`}\``,
      example: { title: 'another resource', code: 'try (Scanner sc = new Scanner(new File("data.txt"))) { ... }' },
      accept: [
        'try (BufferedReader br = new BufferedReader(new FileReader("data.txt")))',
        'try (var br = new BufferedReader(new FileReader("data.txt")))',
      ],
      acceptRegex: [
        '^try\\s*\\(\\s*BufferedReader\\s+br\\s*=\\s*new\\s+BufferedReader\\s*\\(\\s*new\\s+FileReader\\s*\\(\\s*"data\\.txt"\\s*\\)\\s*\\)\\s*\\)\\s*[;{]?$',
        '^try\\s*\\(\\s*var\\s+br\\s*=\\s*new\\s+BufferedReader\\s*\\(\\s*new\\s+FileReader\\s*\\(\\s*"data\\.txt"\\s*\\)\\s*\\)\\s*\\)\\s*[;{]?$',
        '^try\\s*\\(\\s*(BufferedReader|var)\\s+br\\s*=\\s*new\\s+BufferedReader\\s*\\(\\s*new\\s+FileReader\\s*\\(\\s*"[^"]+"\\s*\\)\\s*\\)\\s*;?\\s*\\)$',
        '^try\\s*\\(\\s*(BufferedReader|var)\\s+br\\s*=\\s*Files\\.newBufferedReader\\s*\\(.+\\)\\s*\\)$',
      ],
      caseSensitive: true,
      explain: 'Declare the resource inside the brackets after `try`: `try (BufferedReader br = new BufferedReader(new FileReader("data.txt")))`. Any file name is fine. The resource must implement `AutoCloseable`, and it is closed even if an exception occurs, without writing a finally block.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What must a class implement to be usable in try-with-resources?',
      options: ['Serializable', 'AutoCloseable (or its child Closeable)', 'Runnable', 'Iterable'],
      answer: 1,
      explain: '`AutoCloseable` (Java 7) has one method `close() throws Exception`. `Closeable` (java.io) extends it with `close() throws IOException`. Streams, readers, Scanner, JDBC connections all implement it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are exception-handling **best practices**? (choose all that apply)',
      options: [
        'Catch the most specific exception you can handle',
        'Use an empty catch block to hide errors from users',
        'Log or rethrow with context, keeping the original cause',
        'Use exceptions for normal flow control like ending a loop',
        'Clean up resources with try-with-resources',
        'Catch Throwable everywhere',
      ],
      answers: [0, 2, 4],
      explain: 'Catch specific types, keep the cause (`new MyException("msg", e)`), and let try-with-resources close things. Empty catch blocks hide bugs, exceptions are slow and unclear as normal control flow, and catching Throwable also swallows serious Errors.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Java 9 improvement: `BufferedReader br = ...;` already exists and is **effectively final**. Which header is valid from Java 9?',
      options: ['try (br) { ... }', 'try br { ... }', 'try (final br) { ... }', 'try with (br) { ... }'],
      answer: 0,
      explain: 'Since Java 9 you can list an existing effectively final variable directly: `try (br) { ... }`. Before Java 9 you had to declare a new variable inside the brackets.',
    },
  ],
};
