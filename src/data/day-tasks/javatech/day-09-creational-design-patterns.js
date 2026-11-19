export default {
  lesson: 'day-09-creational-design-patterns',
  minutes: 24,
  intro: 'Trace Singleton, Factory and Prototype programs and choose the right creational pattern for a problem.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print? (one line per println)',
      example: { title: 'lazy singleton', text: 'The object is created only on the first getInstance() call; later calls return the same object.' },
      code: `class Counter {
    private static Counter instance;
    private int count;
    private Counter() { System.out.println("created"); }
    static Counter getInstance() {
        if (instance == null) instance = new Counter();
        return instance;
    }
    int next() { return ++count; }
}

Counter a = Counter.getInstance();
Counter b = Counter.getInstance();
a.next();
b.next();
System.out.println(a == b);
System.out.println(b.next());`,
      expected: 'created\ntrue\n3',
      explain: 'The constructor runs only once ("created"). `a` and `b` are the **same object**, so `a == b` is true and the count is shared: 1, 2, then `b.next()` returns 3. This simple version is not thread-safe; use the holder idiom, double-checked locking or an enum.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'An `Employee` has 3 required fields and 8 optional ones. Constructors with many parameters are confusing. Which pattern fits best?',
      options: ['Singleton', 'Builder', 'Prototype', 'Abstract Factory'],
      answer: 1,
      explain: '**Builder** gives readable, step-by-step creation: `Employee.builder().name("Asha").dept("IT").salary(60000).build()`. It avoids "telescoping constructors" and can validate in `build()`. Lombok `@Builder` generates it.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'What does this print? (one line per println)',
      example: { title: 'shallow copy', text: 'super.clone() copies field values. For a reference field (like a List) that means BOTH objects point to the SAME list.' },
      code: `class Batch implements Cloneable {
    String name;
    List<String> students = new ArrayList<>();
    Batch(String name) { this.name = name; }
    @Override public Batch clone() throws CloneNotSupportedException {
        return (Batch) super.clone();
    }
}

Batch original = new Batch("Java-A");
original.students.add("Asha");
original.students.add("Ravi");
Batch copy = original.clone();
copy.name = "Java-B";
copy.students.add("Meera");
System.out.println(original.name + " " + original.students.size());
System.out.println(copy.name + " " + copy.students.size());
System.out.println(original.students == copy.students);`,
      expected: 'Java-A 3\nJava-B 3\ntrue',
      explain: '`super.clone()` makes a **shallow copy**: changing `copy.name` (a new String reference) does not affect the original, but both share one `students` list, so Meera appears in both (size 3). A deep copy would do `c.students = new ArrayList<>(students)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this factory program print? (one line per println)',
      example: { title: 'simple factory', text: 'The caller asks for a type by name; the factory decides which class to create.' },
      code: `interface Notification { String send(String msg); }
class Sms implements Notification { public String send(String m) { return "SMS: " + m; } }
class Email implements Notification { public String send(String m) { return "EMAIL: " + m; } }

class NotificationFactory {
    static Notification create(String type) {
        return switch (type.toLowerCase()) {
            case "sms" -> new Sms();
            case "email" -> new Email();
            default -> throw new IllegalArgumentException("Unknown type: " + type);
        };
    }
}

System.out.println(NotificationFactory.create("sms").send("OTP 4821"));
System.out.println(NotificationFactory.create("EMAIL").send("Welcome"));
try {
    NotificationFactory.create("push");
} catch (IllegalArgumentException e) {
    System.out.println(e.getMessage());
}`,
      expected: 'SMS: OTP 4821\nEMAIL: Welcome\nUnknown type: push',
      explain: '"EMAIL" is lower-cased before the switch, so it matches "email". Unknown types throw with a clear message. Callers depend only on the `Notification` interface - adding WhatsApp later touches only the factory.',
    },
    {
      type: 'fill',
      mins: 2,
      q: 'Complete the **enum singleton** - the safest Singleton in Java (thread-safe and safe against reflection and serialization):\n```\npublic enum AppConfig {\n    ???\n    private final String appName = "UpSkillr";\n    public String getAppName() { return appName; }\n}\n// usage: AppConfig.INSTANCE.getAppName()\n```',
      example: { title: 'an enum with values', code: 'enum Size { SMALL, MEDIUM, LARGE; }' },
      accept: ['INSTANCE;'],
      caseSensitive: true,
      explain: 'An enum with one constant `INSTANCE;` is created once by the JVM when the class loads. The semicolon is needed because fields and methods follow. Joshua Bloch (Effective Java) recommends this form.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are real uses of creational patterns in the JDK/Spring? (choose all that apply)',
      options: [
        'Runtime.getRuntime() - Singleton',
        'StringBuilder / HttpClient.newBuilder() - Builder',
        'Spring beans are singletons by default (one per container)',
        'Calendar.getInstance() / List.of(...) - static factory methods',
        'System.out.println - Abstract Factory',
      ],
      answers: [0, 1, 2, 3],
      explain: 'The JDK and Spring use these patterns everywhere: `Runtime` singleton, builders, static factories, and Spring\'s singleton scope (managed by the container, not by a private constructor). `println` is just a method call on a PrintStream.',
    },
  ],
};
