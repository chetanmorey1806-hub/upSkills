export default {
  lesson: 'day-10-structural-behavioral-design-patterns',
  minutes: 25,
  intro: 'Trace Decorator, Observer and Template Method programs and match Adapter, Proxy and Strategy to real situations.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'What does this Decorator program print? (one line per println)',
      example: { title: 'wrapping', text: 'Each decorator holds the object it wraps, calls it, then adds its own part.' },
      code: `interface Beverage { String desc(); int cost(); }
class Coffee implements Beverage {
    public String desc() { return "Coffee"; }
    public int cost() { return 100; }
}
class Milk implements Beverage {
    private final Beverage b; Milk(Beverage b) { this.b = b; }
    public String desc() { return b.desc() + ", Milk"; }
    public int cost() { return b.cost() + 20; }
}
class Sugar implements Beverage {
    private final Beverage b; Sugar(Beverage b) { this.b = b; }
    public String desc() { return b.desc() + ", Sugar"; }
    public int cost() { return b.cost() + 5; }
}

Beverage x = new Sugar(new Milk(new Coffee()));
Beverage y = new Milk(new Milk(new Coffee()));
System.out.println(x.desc() + " = " + x.cost());
System.out.println(y.desc() + " = " + y.cost());`,
      expected: 'Coffee, Milk, Sugar = 125\nCoffee, Milk, Milk = 140',
      explain: 'The innermost object runs first: Coffee (100) → Milk adds 20 → Sugar adds 5 = 125. Decorators can be stacked any number of times (double milk = 140) without creating classes like `CoffeeWithMilkAndSugar`. Java I/O (`new BufferedReader(new FileReader(...))`) works the same way.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this Observer program print? (one line per println)',
      example: { title: 'subject and observers', text: 'The subject keeps a list of observers and calls each one when its state changes.' },
      code: `interface Subscriber { void update(String video); }
class User implements Subscriber {
    private final String name; User(String n) { name = n; }
    public void update(String v) { System.out.println(name + " notified: " + v); }
}
class Channel {
    private final List<Subscriber> subs = new ArrayList<>();
    void subscribe(Subscriber s) { subs.add(s); }
    void unsubscribe(Subscriber s) { subs.remove(s); }
    void upload(String v) { subs.forEach(s -> s.update(v)); }
}

Channel ch = new Channel();
User asha = new User("Asha");
User ravi = new User("Ravi");
ch.subscribe(asha);
ch.subscribe(ravi);
ch.upload("Java Day 10");
ch.unsubscribe(asha);
ch.upload("Spring Boot");`,
      expected: 'Asha notified: Java Day 10\nRavi notified: Java Day 10\nRavi notified: Spring Boot',
      explain: 'Both subscribers get the first upload in subscription order. After Asha unsubscribes, only Ravi is notified. Spring\'s `ApplicationEventPublisher` + `@EventListener` and Kafka consumers follow the same idea.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does `new PdfExporter().export()` print? (one line per println)',
      example: { title: 'template method', text: 'A final method in the parent fixes the ORDER of steps; subclasses fill in or override individual steps.' },
      code: `abstract class DataExporter {
    public final void export() { open(); write(); close(); }
    void open()  { System.out.println("open file"); }
    abstract void write();
    void close() { System.out.println("close file"); }
}
class CsvExporter extends DataExporter {
    void write() { System.out.println("write CSV"); }
}
class PdfExporter extends DataExporter {
    @Override void open() { System.out.println("open PDF"); }
    void write() { System.out.println("write PDF"); }
}

new PdfExporter().export();`,
      expected: 'open PDF\nwrite PDF\nclose file',
      explain: '`export()` always runs open → write → close. PdfExporter overrides `open` and implements `write`, but inherits `close` from the parent. Spring\'s `JdbcTemplate` / `RestTemplate` names come from this pattern.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Your code expects a `PaymentGateway` interface with `pay(amount)`, but a third-party UPI SDK offers `makeUpiTransaction(String vpa, long paise)`. You cannot change the SDK. Which pattern connects them?',
      options: ['Adapter', 'Observer', 'Singleton', 'Template Method'],
      answer: 0,
      explain: 'An **Adapter** class implements `PaymentGateway` and translates `pay(amount)` into `makeUpiTransaction(vpa, amount * 100)`. It converts one interface into another that the client expects.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'How does Spring make `@Transactional` and `@Cacheable` work without you writing that code in every method?',
      options: [
        'It edits your source code',
        'It wraps your bean in a Proxy that adds the extra behaviour before/after calling the real method',
        'It uses the Builder pattern',
        'It runs every method twice',
      ],
      answer: 1,
      explain: 'Spring AOP creates a **Proxy** (JDK dynamic proxy or CGLIB subclass) around the bean. The proxy starts/commits the transaction or checks the cache, then calls your method. That is also why self-invocation skips it.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **Strategy**, **Facade** and **Command** are TRUE? (choose all that apply)',
      options: [
        'Strategy: choose an algorithm at runtime, e.g. different shipping-cost calculators behind one interface',
        'Comparator passed to list.sort(...) is an example of Strategy',
        'Facade: one simple class hides a complex subsystem, e.g. OrderFacade.placeOrder() calling stock, payment and email services',
        'Command: wrap a request as an object, which enables undo/redo or queues',
        'Strategy requires inheritance from an abstract class with a final method',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Strategy uses **composition** (pass an implementation), while Template Method uses **inheritance** with a final skeleton method. Facade simplifies; Command turns actions into objects (e.g. `Runnable` tasks in an executor).',
    },
  ],
};
