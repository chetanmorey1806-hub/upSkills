export default {
  lesson: 'day-15-jvm-performance-tuning',
  minutes: 22,
  intro: 'Size the heap, choose a garbage collector, recognise memory errors and pick the right diagnostic tool.',
  tasks: [
    {
      type: 'fill',
      mins: 2,
      q: 'Write the command that runs `app.jar` with an **initial heap of 512 MB** and a **maximum heap of 2 GB**.',
      example: { title: 'printing GC details', code: 'java -Xlog:gc -jar app.jar' },
      accept: ['java -Xms512m -Xmx2g -jar app.jar', 'java -Xmx2g -Xms512m -jar app.jar', 'java -Xms512M -Xmx2G -jar app.jar', 'java -Xms512m -Xmx2048m -jar app.jar'],
      explain: '`-Xms` = initial heap, `-Xmx` = maximum heap. JVM options go **before** `-jar`; anything after `app.jar` is passed to your program as arguments. Many teams set Xms = Xmx in production to avoid resizing.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Which garbage collector is the **default** for a normal server JVM in Java 21?',
      options: ['Serial GC', 'Parallel GC', 'G1 GC', 'CMS'],
      answer: 2,
      explain: '**G1** (Garbage First) has been the default since Java 9: it divides the heap into regions and aims for predictable pauses. CMS was removed in Java 14. ZGC is for very low pause times on large heaps and must be enabled.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which JVM flag switches on the **ZGC** low-latency collector?',
      example: { title: 'switching on Parallel GC', code: 'java -XX:+UseParallelGC -jar app.jar' },
      accept: ['-XX:+UseZGC', '-XX:+UseZGC -XX:+ZGenerational'],
      caseSensitive: true,
      explain: '`-XX:+UseZGC` enables ZGC (generational mode is the default from Java 23; on Java 21 add `-XX:+ZGenerational`). Pauses stay below about a millisecond even with very large heaps.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Which error does each program end with? Type the full class name of the error for program 1 and program 2, one per line.',
      example: { title: 'stack vs heap', text: 'Each method call uses a frame on the thread STACK; objects (like list elements) live on the HEAP.' },
      code: `// Program 1
static int count(int n) { return count(n + 1); }
public static void main(String[] a) { count(1); }

// Program 2  (run with -Xmx64m)
public static void main(String[] a) {
    List<long[]> list = new ArrayList<>();
    while (true) list.add(new long[1_000_000]);
}`,
      expected: 'java.lang.StackOverflowError\njava.lang.OutOfMemoryError',
      explain: 'Program 1 recurses without a base case and fills the thread stack → **StackOverflowError**. Program 2 keeps references to ever more arrays, so the GC cannot free them → **OutOfMemoryError: Java heap space**. Both are Errors, not Exceptions.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these can cause a **memory leak** in a Java application? (choose all that apply)',
      options: [
        'A static Map used as a cache that only grows and is never cleared',
        'Listeners that are registered but never removed',
        'ThreadLocal values not removed in a thread pool',
        'Local variables inside a short method',
        'Unclosed resources such as streams or connections',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Java leaks happen when objects stay **reachable** although no longer needed: growing static collections, forgotten listeners, ThreadLocals on reused threads, unclosed resources. Local variables become unreachable when the method ends.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'The app is hanging and you suspect a **deadlock**. Which JDK command-line tool prints a thread dump of process id 4321? Write the full command.',
      example: { title: 'listing Java processes', code: 'jps -l' },
      accept: ['jstack 4321', 'jcmd 4321 Thread.print', 'jstack -l 4321'],
      explain: '`jstack <pid>` (or `jcmd <pid> Thread.print`) shows every thread\'s stack and reports "Found one Java-level deadlock". For heap problems use `jmap -dump` / `jcmd <pid> GC.heap_dump` and analyse it in VisualVM or Eclipse MAT.',
    },
  ],
};
