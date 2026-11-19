export default {
  lesson: 'day-43-jvm-architecture-gc',
  minutes: 20,
  intro: 'Check your understanding of class loading, heap vs stack, garbage collection and JVM options.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Lazy class loading: what does this program print?',
      example: {
        title: 'a static block runs when the class is initialised',
        code: `class Config {
  static { System.out.println("Config loaded"); }
}`,
      },
      code: `class Config {
    static {
        System.out.println("Config loaded");
    }
    static int timeout = 30;
}

public class Main {
    public static void main(String[] args) {
        System.out.println("start");
        Config c = null;
        System.out.println("declared");
        System.out.println(Config.timeout);
        System.out.println(Config.timeout * 2);
    }
}`,
      expected: `start
declared
Config loaded
30
60`,
      explain: 'Classes are initialised **lazily**: just declaring a variable of type Config does not initialise it. The first access to the static field triggers loading → linking → initialization, which runs the static block once. The second access does not run it again.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'every call uses a stack frame', code: 'static void f() { f(); } // never stops → StackOverflowError' },
      code: `public class Main {
    static int depth = 0;

    static void dive() {
        depth++;
        dive();
    }

    public static void main(String[] args) {
        try {
            dive();
        } catch (StackOverflowError e) {
            System.out.println("Caught " + e.getClass().getSimpleName());
            System.out.println(depth > 1000);
        }
        System.out.println("still running");
    }
}`,
      expected: `Caught StackOverflowError
true
still running`,
      explain: 'Each method call pushes a frame on the **thread\'s stack**. Endless recursion fills it and the JVM throws **StackOverflowError** (an Error, not an Exception). The exact depth depends on the stack size (-Xss), but it is thousands of calls. Catching Errors is shown here only for learning.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which JVM option sets the **maximum heap size**, e.g. to 2 GB? (write the option with its value)',
      example: { title: 'initial heap size', code: 'java -Xms512m -jar app.jar' },
      accept: ['-Xmx2g', '-Xmx2G', '-Xmx2048m', '-Xmx2048M'],
      caseSensitive: true,
      explain: '`-Xmx2g` sets the maximum heap; `-Xms` sets the initial heap and `-Xss` the stack size per thread. Running out of heap gives `OutOfMemoryError: Java heap space`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'In `void bill() { int qty = 3; Order o = new Order(); }` where are `qty`, the reference `o`, and the Order object stored?',
      options: [
        'All on the heap',
        'qty and o on the stack, the Order object on the heap',
        'qty on the stack, o and the object in Metaspace',
        'All on the stack',
      ],
      answer: 1,
      explain: 'Local primitives and local **references** live in the method\'s stack frame and disappear when it returns. Objects created with `new` live on the **heap**, shared by all threads, and are freed by the garbage collector when no reference reaches them.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'After which lines does the first `Student` object become **eligible for garbage collection**? (choose all that apply — each option is a separate scenario)',
      options: [
        'Student s = new Student(); s = null;',
        'Student s = new Student(); s = new Student();',
        'Student s = new Student(); Student t = s; s = null;',
        'A method creates new Student() locally and returns without storing it anywhere',
        'Student s = new Student(); System.gc();',
      ],
      answers: [0, 1, 3],
      explain: 'An object is eligible when **no live reference** reaches it: setting the only reference to null, reassigning it, or the local variable going out of scope. In option 3 `t` still points to it. `System.gc()` is only a request and never frees reachable objects.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Class loaders use the **parent delegation model**. What happens when your app asks to load `java.lang.String`?',
      options: [
        'The Application class loader loads your own String class first',
        'The request is delegated up to the Bootstrap loader, which loads the real core String',
        'An exception is thrown',
        'The Extension/Platform loader always wins',
      ],
      answer: 1,
      explain: 'Each loader first asks its parent (Application → Platform → Bootstrap). The Bootstrap loader loads the core java.* classes, so a fake `java.lang.String` in your code can never replace the real one — a security feature.',
    },
  ],
};
