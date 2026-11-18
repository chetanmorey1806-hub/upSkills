const STEPS = [
  'IntelliJ: File > New > Project > Java (JDK 17+) > right-click src > New > Java Class > Main. Eclipse: File > New > Java Project, then New > Class "Main"',
  'Paste the code; all helper classes can live in Main.java (only Main is public)',
  'Click Run ▶ (Eclipse: Run As > Java Application) and match the output line by line',
];

const singleton = `import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

// 1) EAGER singleton: object created when the class is first used
class EagerConfig {
    private static final EagerConfig INSTANCE = new EagerConfig();

    private EagerConfig() {                    // private: nobody else can call new
        System.out.println("EagerConfig created");
    }

    static EagerConfig getInstance() {
        return INSTANCE;
    }
}

// 2) LAZY + THREAD-SAFE with double-checked locking
class DbConnectionPool {
    private static volatile DbConnectionPool instance;   // volatile is REQUIRED
    private static int created = 0;

    private DbConnectionPool() {
        created++;
    }

    static DbConnectionPool getInstance() {
        if (instance == null) {                          // 1st check: no locking (fast path)
            synchronized (DbConnectionPool.class) {
                if (instance == null) {                  // 2nd check: inside the lock
                    instance = new DbConnectionPool();
                }
            }
        }
        return instance;
    }

    static int createdCount() {
        return created;
    }
}

// 3) BILL PUGH / holder idiom: lazy and thread-safe without synchronized
class AppLogger {
    private AppLogger() {
        System.out.println("AppLogger created");
    }

    private static class Holder {                        // loaded only when getInstance() runs
        static final AppLogger INSTANCE = new AppLogger();
    }

    static AppLogger getInstance() {
        return Holder.INSTANCE;
    }

    void log(String msg) {
        System.out.println("[LOG] " + msg);
    }
}

// 4) ENUM singleton: simplest, safe against reflection and serialization
enum IdGenerator {
    INSTANCE;

    private int next = 100;

    synchronized int nextId() {
        return next++;
    }
}

public class Main {
    public static void main(String[] args) throws InterruptedException {
        System.out.println("Program started");
        EagerConfig c1 = EagerConfig.getInstance();
        EagerConfig c2 = EagerConfig.getInstance();
        System.out.println("Eager same object? " + (c1 == c2));

        AppLogger.getInstance().log("first call");
        AppLogger.getInstance().log("second call");

        System.out.println(IdGenerator.INSTANCE.nextId());
        System.out.println(IdGenerator.INSTANCE.nextId());

        // 10 threads race to get the pool at the same time
        Set<Integer> ids = ConcurrentHashMap.newKeySet();
        Thread[] threads = new Thread[10];
        for (int i = 0; i < threads.length; i++) {
            threads[i] = new Thread(() -> ids.add(System.identityHashCode(DbConnectionPool.getInstance())));
            threads[i].start();
        }
        for (Thread t : threads) {
            t.join();
        }
        System.out.println("Distinct pool objects: " + ids.size()
                + ", constructor ran " + DbConnectionPool.createdCount() + " time(s)");
    }
}`;

const factory = `// ---------- Simple Factory ----------
interface Notification {
    void send(String msg);
}

class EmailNotification implements Notification {
    public void send(String msg) { System.out.println("Email: " + msg); }
}

class SmsNotification implements Notification {
    public void send(String msg) { System.out.println("SMS: " + msg); }
}

class PushNotification implements Notification {
    public void send(String msg) { System.out.println("Push: " + msg); }
}

class NotificationFactory {
    static Notification create(String channel) {          // the ONLY place that uses new
        return switch (channel.toUpperCase()) {
            case "EMAIL" -> new EmailNotification();
            case "SMS"   -> new SmsNotification();
            case "PUSH"  -> new PushNotification();
            default      -> throw new IllegalArgumentException("Unknown channel: " + channel);
        };
    }
}

// ---------- GoF Factory Method: subclasses decide which object to create ----------
interface Transport {
    String deliver(String item);
}

class Truck implements Transport {
    public String deliver(String item) { return "Truck delivers " + item + " by road"; }
}

class Ship implements Transport {
    public String deliver(String item) { return "Ship delivers " + item + " by sea"; }
}

abstract class Logistics {
    abstract Transport createTransport();                 // the factory method

    void planDelivery(String item) {                      // common logic uses the product
        Transport t = createTransport();
        System.out.println(getClass().getSimpleName() + ": " + t.deliver(item));
    }
}

class RoadLogistics extends Logistics {
    Transport createTransport() { return new Truck(); }
}

class SeaLogistics extends Logistics {
    Transport createTransport() { return new Ship(); }
}

public class Main {
    public static void main(String[] args) {
        for (String ch : new String[]{"email", "SMS", "push"}) {
            NotificationFactory.create(ch).send("Your OTP is 4821");
        }
        try {
            NotificationFactory.create("fax");
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }

        System.out.println("--- Factory Method ---");
        Logistics[] companies = { new RoadLogistics(), new SeaLogistics() };
        for (Logistics l : companies) {
            l.planDelivery("Laptops");
        }
    }
}`;

const abstractFactory = `// Products
interface Button   { String render(); }
interface Checkbox { String render(); }

class LightButton implements Button {
    public String render() { return "[ Light Button ]"; }
}
class DarkButton implements Button {
    public String render() { return "[ Dark Button ]"; }
}
class LightCheckbox implements Checkbox {
    public String render() { return "[x] Light Checkbox"; }
}
class DarkCheckbox implements Checkbox {
    public String render() { return "[x] Dark Checkbox"; }
}

// Abstract factory: creates a FAMILY of related products
interface UIFactory {
    Button createButton();
    Checkbox createCheckbox();
}

class LightFactory implements UIFactory {
    public Button createButton()     { return new LightButton(); }
    public Checkbox createCheckbox() { return new LightCheckbox(); }
}

class DarkFactory implements UIFactory {
    public Button createButton()     { return new DarkButton(); }
    public Checkbox createCheckbox() { return new DarkCheckbox(); }
}

// Client: never mentions Light or Dark classes
class LoginScreen {
    private final Button button;
    private final Checkbox remember;

    LoginScreen(UIFactory factory) {
        button = factory.createButton();
        remember = factory.createCheckbox();
    }

    void show() {
        System.out.println(button.render() + "  " + remember.render());
    }
}

public class Main {
    public static void main(String[] args) {
        String theme = "dark";                                   // could come from user settings
        UIFactory factory = theme.equals("dark") ? new DarkFactory() : new LightFactory();
        new LoginScreen(factory).show();
        new LoginScreen(new LightFactory()).show();
    }
}`;

const builder = `import java.util.ArrayList;
import java.util.List;

class Pizza {
    private final String size;          // required
    private final String crust;         // optional
    private final boolean extraCheese;  // optional
    private final List<String> toppings;

    private Pizza(Builder b) {          // only the Builder can create a Pizza
        this.size = b.size;
        this.crust = b.crust;
        this.extraCheese = b.extraCheese;
        this.toppings = List.copyOf(b.toppings);   // immutable copy
    }

    static Builder builder(String size) {
        return new Builder(size);
    }

    @Override
    public String toString() {
        return "Pizza[size=" + size + ", crust=" + crust
                + ", extraCheese=" + extraCheese + ", toppings=" + toppings + "]";
    }

    static class Builder {
        private final String size;
        private String crust = "Regular";            // default values
        private boolean extraCheese;
        private final List<String> toppings = new ArrayList<>();

        Builder(String size) {
            this.size = size;
        }

        Builder crust(String crust) {
            this.crust = crust;
            return this;                             // returning this enables chaining
        }

        Builder extraCheese() {
            this.extraCheese = true;
            return this;
        }

        Builder topping(String t) {
            toppings.add(t);
            return this;
        }

        Pizza build() {                              // validate once, at the end
            if (toppings.size() > 3) {
                throw new IllegalStateException("Max 3 toppings allowed");
            }
            return new Pizza(this);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        Pizza p1 = Pizza.builder("Medium")
                .crust("Thin")
                .extraCheese()
                .topping("Onion")
                .topping("Paneer")
                .build();
        Pizza p2 = Pizza.builder("Small").build();
        System.out.println(p1);
        System.out.println(p2);

        try {
            Pizza.builder("Large").topping("A").topping("B").topping("C").topping("D").build();
        } catch (IllegalStateException e) {
            System.out.println("Error: " + e.getMessage());
        }

        StringBuilder sb = new StringBuilder().append("Java").append(' ').append(17);
        System.out.println("JDK builder: " + sb);
    }
}`;

const prototype = `import java.util.ArrayList;
import java.util.List;

class Address {
    String city;

    Address(String city) {
        this.city = city;
    }
}

class Employee implements Cloneable {
    String name;
    Address address;
    List<String> skills;

    Employee(String name, Address address, List<String> skills) {
        this.name = name;
        this.address = address;
        this.skills = skills;
    }

    // SHALLOW copy: fields are copied, but objects inside are SHARED
    @Override
    public Employee clone() {
        try {
            return (Employee) super.clone();
        } catch (CloneNotSupportedException e) {
            throw new AssertionError(e);       // cannot happen: we implement Cloneable
        }
    }

    // DEEP copy: inner objects are copied too
    Employee deepCopy() {
        return new Employee(name, new Address(address.city), new ArrayList<>(skills));
    }

    @Override
    public String toString() {
        return name + " (" + address.city + ") " + skills;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee template = new Employee("Template", new Address("Pune"), new ArrayList<>(List.of("Java")));

        Employee shallow = template.clone();
        shallow.name = "Ravi";                 // String field: only shallow changes
        shallow.address.city = "Mumbai";       // shared Address object!
        shallow.skills.add("Spring");          // shared List object!
        System.out.println("template: " + template);
        System.out.println("shallow : " + shallow);

        Employee deep = template.deepCopy();
        deep.name = "Sneha";
        deep.address.city = "Delhi";
        deep.skills.add("React");
        System.out.println("template: " + template);
        System.out.println("deep    : " + deep);
    }
}`;

const pr1 = `class AppConfig {
    private final String appName;

    private AppConfig() {
        appName = "StudentPortal";
        System.out.println("Loading config...");
    }

    private static class Holder {
        private static final AppConfig INSTANCE = new AppConfig();
    }

    static AppConfig getInstance() {
        return Holder.INSTANCE;
    }

    String getAppName() {
        return appName;
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Before first use");
        AppConfig a = AppConfig.getInstance();
        AppConfig b = AppConfig.getInstance();
        System.out.println(a.getAppName());
        System.out.println("Same instance: " + (a == b));
    }
}
/* Output:
Before first use
Loading config...
StudentPortal
Same instance: true */`;

const pr2 = `interface Shape {
    int area();
}

record Square(int side) implements Shape {
    public int area() { return side * side; }
}

record Rect(int w, int h) implements Shape {
    public int area() { return w * h; }
}

class ShapeFactory {
    static Shape create(String type, int a, int b) {
        return switch (type) {
            case "square" -> new Square(a);
            case "rect"   -> new Rect(a, b);
            default       -> throw new IllegalArgumentException("No shape: " + type);
        };
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println(ShapeFactory.create("square", 5, 0).area());
        System.out.println(ShapeFactory.create("rect", 4, 6).area());
        try {
            ShapeFactory.create("circle", 1, 1);
        } catch (IllegalArgumentException e) {
            System.out.println(e.getMessage());
        }
    }
}
/* Output:
25
24
No shape: circle */`;

const pr3 = `class User {
    private final String name;      // required
    private final String email;     // optional
    private final int age;          // optional

    private User(Builder b) {
        name = b.name;
        email = b.email;
        age = b.age;
    }

    @Override
    public String toString() {
        return "User{name='" + name + "', email='" + email + "', age=" + age + "}";
    }

    static class Builder {
        private final String name;
        private String email = "not-given";
        private int age;

        Builder(String name) {
            if (name == null || name.isBlank()) throw new IllegalArgumentException("name required");
            this.name = name;
        }
        Builder email(String email) { this.email = email; return this; }
        Builder age(int age) { this.age = age; return this; }
        User build() { return new User(this); }
    }
}

public class Main {
    public static void main(String[] args) {
        User u1 = new User.Builder("Kiran").email("kiran@mail.com").age(23).build();
        User u2 = new User.Builder("Pooja").build();
        System.out.println(u1);
        System.out.println(u2);
    }
}
/* Output:
User{name='Kiran', email='kiran@mail.com', age=23}
User{name='Pooja', email='not-given', age=0}
(Lombok's @Builder generates this class for you in real projects) */`;

const pr4 = `import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

class Document {
    String title;
    List<String> sections;

    Document(String title, List<String> sections) {
        this.title = title;
        this.sections = sections;
    }

    Document copy() {                               // deep copy
        return new Document(title, new ArrayList<>(sections));
    }
}

class TemplateRegistry {                            // prototype registry
    private final Map<String, Document> templates = new HashMap<>();

    void register(String key, Document doc) { templates.put(key, doc); }

    Document create(String key) { return templates.get(key).copy(); }
}

public class Main {
    public static void main(String[] args) {
        TemplateRegistry registry = new TemplateRegistry();
        registry.register("offer", new Document("Offer Letter", new ArrayList<>(List.of("Header", "Salary"))));

        Document d1 = registry.create("offer");
        d1.title = "Offer - Arjun";
        d1.sections.add("Joining Date");

        Document d2 = registry.create("offer");
        System.out.println(d1.title + " " + d1.sections);
        System.out.println(d2.title + " " + d2.sections);
    }
}
/* Output:
Offer - Arjun [Header, Salary, Joining Date]
Offer Letter [Header, Salary] */`;

export default {
  id: 'day-09-creational-design-patterns',
  title: 'Design Patterns - Creational: Singleton, Factory, Abstract Factory, Builder, Prototype',
  module: 'Module 2: Testing, Clean Code & Design Patterns',
  day: 9,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Learn what design patterns are and master the five creational patterns that control HOW objects are created: Singleton (eager, double-checked locking, holder, enum), Factory Method, Abstract Factory, Builder and Prototype, with runnable Java programs and their use in the JDK and Spring.',
  objectives: [
    'Explain what design patterns are and the three GoF categories',
    'Write a thread-safe Singleton in four ways and know how it can be broken',
    'Use Simple Factory, Factory Method and Abstract Factory to hide object creation',
    'Build immutable objects with many optional fields using the Builder pattern',
    'Copy objects with Prototype and explain shallow vs deep copy',
  ],
  theory: [
    {
      heading: 'What Are Design Patterns?',
      content:
        'A design pattern is a proven, reusable solution to a common design problem - a template, not finished code. Analogy: building architects reuse ideas like "a staircase near the entrance" without copying the same building. In 1994 four authors (the Gang of Four, GoF) documented 23 patterns in three groups. Knowing patterns gives teams a shared vocabulary: saying "use a Builder here" explains a whole design in three words.',
      points: [
        'Creational (5): HOW objects are created - Singleton, Factory Method, Abstract Factory, Builder, Prototype.',
        'Structural (7): HOW classes/objects are combined - Adapter, Decorator, Proxy, Facade, Composite, Bridge, Flyweight.',
        'Behavioral (11): HOW objects communicate - Strategy, Observer, Template Method, Command, Iterator, State, Chain of Responsibility, etc.',
        'Patterns build on SOLID (Day 8): most of them program to interfaces and favour composition over inheritance.',
        'Do not force patterns everywhere; use one when you actually have the problem it solves.',
      ],
    },
    {
      heading: 'Singleton Pattern',
      content:
        'Singleton ensures a class has ONLY ONE instance and provides a global access point to it. Analogy: a country has one Prime Minister at a time; everyone refers to "the PM", not a new one. Used for configuration, logger, cache, connection pool. Recipe: private constructor, private static field holding the instance, public static getInstance().',
      syntax: `// Lazy but NOT thread-safe (two threads may both see null):
class Bad {
    private static Bad instance;
    private Bad() {}
    static Bad getInstance() {
        if (instance == null) instance = new Bad();
        return instance;
    }
}
// Fix 1: synchronized static Bad getInstance()   -> safe but locks on EVERY call
// Fix 2: double-checked locking + volatile       -> locks only the first time
// Fix 3: static holder class (Bill Pugh)         -> JVM class loading guarantees safety
// Fix 4: enum Singleton { INSTANCE; }            -> recommended by Joshua Bloch`,
      points: [
        'Eager: created at class loading, simple and thread-safe, but created even if never used.',
        'Double-checked locking needs volatile; without it another thread may see a half-constructed object because of instruction reordering.',
        'Ways to break a singleton: reflection (setAccessible on the private constructor), serialization/deserialization (fix with readResolve()), cloning (do not implement Cloneable or throw in clone()). Enum singletons are immune to all three.',
        'Drawbacks: global state, hidden dependencies, harder to unit test. Prefer letting Spring manage single instances.',
        'Spring beans are singleton-scoped by default: ONE instance per ApplicationContext (not per JVM like GoF Singleton).',
        'JDK examples: Runtime.getRuntime(), Desktop.getDesktop().',
      ],
    },
    {
      heading: 'Factory Method and Simple Factory',
      content:
        'A factory hides the new keyword. The client asks for "an SMS notification" and receives an object through an interface, without knowing the concrete class. Analogy: you order "a pizza" at the counter; the kitchen decides how to make it. Simple Factory: one static method with a switch (not an official GoF pattern but very common). Factory Method (GoF): a parent class defines an abstract create method and subclasses decide which class to instantiate.',
      points: [
        'Benefits: loose coupling, creation logic in one place, easy to add new types (OCP).',
        'Naming conventions: of(), valueOf(), getInstance(), newInstance(), create...().',
        'JDK examples: List.of(), Integer.valueOf(), Calendar.getInstance(), NumberFormat.getCurrencyInstance(), Executors.newFixedThreadPool().',
        'Spring examples: BeanFactory / ApplicationContext.getBean(), FactoryBean, @Bean methods are factory methods.',
      ],
    },
    {
      heading: 'Abstract Factory Pattern',
      content:
        'Abstract Factory creates FAMILIES of related objects without specifying concrete classes. Analogy: an IKEA "Modern" factory gives you a modern chair, modern sofa and modern table that match; a "Victorian" factory gives the Victorian set. The client picks a factory once, and all products it creates are guaranteed to be compatible. Diagram in words: UIFactory -> (createButton, createCheckbox); LightFactory -> LightButton + LightCheckbox; DarkFactory -> DarkButton + DarkCheckbox.',
      points: [
        'Factory Method creates ONE product via inheritance; Abstract Factory creates a FAMILY of products via composition (a factory object).',
        'Drawback: adding a new product type (e.g. Slider) means changing the factory interface and every implementation.',
        'JDK examples: DocumentBuilderFactory, TransformerFactory; JDBC: a Connection creates matching Statement/PreparedStatement for the same driver.',
      ],
    },
    {
      heading: 'Builder Pattern',
      content:
        'Builder constructs a complex object step by step. It solves the "telescoping constructor" problem: new Pizza("M", "Thin", true, false, true, null, 2) is unreadable and error-prone. With a builder the code reads like a sentence and the final object can be immutable. Analogy: ordering at Subway - choose bread, then filling, then sauces, then "build" (pack it).',
      syntax: `Pizza p = Pizza.builder("Medium")   // required fields in builder()/constructor
        .crust("Thin")                // optional fields as chained methods returning this
        .extraCheese()
        .build();                     // validation + creation of immutable object`,
      points: [
        'Typical structure: static nested Builder class, private constructor of the main class taking the Builder.',
        'Lombok @Builder generates the whole builder in Spring projects.',
        'JDK examples: StringBuilder, Stream.builder(), HttpRequest.newBuilder(), Locale.Builder.',
        'Spring examples: ResponseEntity.ok().header(...).body(...), UriComponentsBuilder, WebClient.builder(), MockMvcRequestBuilders.',
      ],
    },
    {
      heading: 'Prototype Pattern and Shallow vs Deep Copy',
      content:
        'Prototype creates new objects by COPYING an existing object (the prototype) instead of building from scratch. Useful when creation is expensive (loaded from DB, heavy computation) or when you keep ready-made templates. Analogy: photocopying a filled form and changing only the name. In Java, implement Cloneable and override clone(), or (better) write a copy constructor / copy method.',
      points: [
        'Shallow copy (Object.clone() default): primitive and String fields are copied, but object references point to the SAME inner objects. Changing a shared list in the copy changes the original too.',
        'Deep copy: inner mutable objects are copied as well, so the copy is fully independent.',
        'Cloneable is a marker interface; without it super.clone() throws CloneNotSupportedException.',
        'Joshua Bloch (Effective Java) recommends copy constructors or static factories over clone().',
        'Spring: @Scope("prototype") beans are NOT the GoF Prototype pattern - Spring simply creates a NEW instance on each getBean() call.',
      ],
      tip: 'Interview trap: "Is a Spring singleton bean the same as a Singleton pattern?" Answer: No. GoF Singleton = one per JVM/class loader; Spring singleton = one per container, and you can still call new on the class.',
    },
  ],
  examples: [
    {
      title: 'Singleton Four Ways: Eager, Double-Checked Locking, Holder and Enum',
      scenario: 'A config, a logger, an ID generator and a connection pool must each exist only once, even with 10 threads.',
      steps: STEPS,
      code: singleton,
      java: { files: { 'Main.java': singleton } },
      result: `Program started
EagerConfig created
Eager same object? true
AppLogger created
[LOG] first call
[LOG] second call
100
101
Distinct pool objects: 1, constructor ran 1 time(s)`,
      explanation:
        'EagerConfig is initialised when its class is first used (the first getInstance call), so its message comes after "Program started". The holder class loads only when AppLogger.getInstance() runs, giving lazy creation. The enum returns 100 then 101 from the same instance. Ten threads race, but double-checked locking guarantees only one DbConnectionPool is created, so the set holds one identity hash. join() makes main wait so the final count is reliable.',
    },
    {
      title: 'Simple Factory and GoF Factory Method',
      scenario: 'Create notifications by channel name, and let logistics subclasses decide their transport.',
      steps: STEPS,
      code: factory,
      java: { files: { 'Main.java': factory } },
      result: `Email: Your OTP is 4821
SMS: Your OTP is 4821
Push: Your OTP is 4821
Error: Unknown channel: fax
--- Factory Method ---
RoadLogistics: Truck delivers Laptops by road
SeaLogistics: Ship delivers Laptops by sea`,
      explanation:
        'The client code only knows the Notification interface; toUpperCase() makes "email" match "EMAIL". In Factory Method, planDelivery() is written once in Logistics and calls the abstract createTransport(); each subclass supplies its own product.',
    },
    {
      title: 'Abstract Factory: Matching Light and Dark UI Components',
      scenario: 'A login screen must use buttons and checkboxes from the same theme, chosen at runtime.',
      steps: STEPS,
      code: abstractFactory,
      java: { files: { 'Main.java': abstractFactory } },
      result: `[ Dark Button ]  [x] Dark Checkbox
[ Light Button ]  [x] Light Checkbox`,
      explanation:
        'LoginScreen receives a UIFactory and never refers to concrete theme classes. Because one factory creates both components, mixing a Dark button with a Light checkbox is impossible.',
    },
    {
      title: 'Builder: Readable, Validated, Immutable Pizza Objects',
      scenario: 'A pizza has one required field and many optional ones. Avoid telescoping constructors.',
      steps: STEPS,
      code: builder,
      java: { files: { 'Main.java': builder } },
      result: `Pizza[size=Medium, crust=Thin, extraCheese=true, toppings=[Onion, Paneer]]
Pizza[size=Small, crust=Regular, extraCheese=false, toppings=[]]
Error: Max 3 toppings allowed
JDK builder: Java 17`,
      explanation:
        'Each builder method returns this, which allows chaining. Unset fields keep defaults ("Regular", false, empty list). build() validates before creating the object, so an invalid Pizza can never exist. StringBuilder is the builder idea inside the JDK.',
    },
    {
      title: 'Prototype: Shallow Copy vs Deep Copy',
      scenario: 'New employees are created by copying a template employee. See what goes wrong with a shallow clone.',
      steps: STEPS,
      code: prototype,
      java: { files: { 'Main.java': prototype } },
      result: `template: Template (Mumbai) [Java, Spring]
shallow : Ravi (Mumbai) [Java, Spring]
template: Template (Mumbai) [Java, Spring]
deep    : Sneha (Delhi) [Java, Spring, React]`,
      explanation:
        'super.clone() copies the references, so template and shallow share the same Address and List: changing city to Mumbai and adding Spring through the copy also changed the template. Only name changed independently because assigning a new String replaces the reference in the copy. deepCopy() creates a new Address and a new ArrayList, so Delhi and React affect only the deep copy.',
    },
  ],
  interview: [
    {
      q: 'What are design patterns and what are the three GoF categories?',
      a: 'Reusable, proven solutions to recurring design problems. Creational (object creation), Structural (composition of classes/objects), Behavioral (communication and responsibility between objects). GoF described 23 patterns.',
      level: 'Easy',
    },
    {
      q: 'How do you make a Singleton thread-safe?',
      a: 'Options: eager initialisation; synchronized getInstance(); double-checked locking with a volatile field; Bill Pugh static holder class; enum singleton. Holder and enum are the cleanest.',
      level: 'Medium',
    },
    {
      q: 'Why is volatile needed in double-checked locking?',
      a: 'instance = new X() is not atomic: allocate, initialise, assign. The JVM may reorder so the reference is assigned before the constructor finishes. Without volatile, another thread can see a non-null but half-initialised object. volatile forbids this reordering and guarantees visibility.',
      level: 'Hard',
    },
    {
      q: 'How can a Singleton be broken and how do you prevent it?',
      a: 'Reflection (throw an exception in the constructor if instance exists), serialization (implement readResolve() returning the instance), cloning (override clone() to throw or return instance), multiple class loaders. An enum singleton handles reflection and serialization automatically.',
      level: 'Hard',
    },
    {
      q: 'Difference between Spring singleton scope and the Singleton pattern?',
      a: 'GoF Singleton: one instance per class loader, enforced by a private constructor. Spring singleton: one instance per ApplicationContext for that bean definition; the class itself is normal and you could create more with new or other bean definitions.',
      level: 'Medium',
    },
    {
      q: 'Factory Method vs Abstract Factory?',
      a: 'Factory Method uses inheritance: a subclass overrides one method to create one product. Abstract Factory uses composition: a factory object with several methods creates a family of related products that must be used together.',
      level: 'Medium',
    },
    {
      q: 'When would you use the Builder pattern?',
      a: 'When an object has many parameters, especially optional ones, when you want immutability, readable construction and validation before creation. Examples: StringBuilder, HttpRequest.newBuilder(), Lombok @Builder, ResponseEntity builder.',
      level: 'Easy',
    },
    {
      q: 'Difference between shallow copy and deep copy?',
      a: 'Shallow copy duplicates the outer object but shares referenced inner objects. Deep copy also duplicates inner mutable objects so the copy is fully independent. Object.clone() is shallow by default.',
      level: 'Medium',
    },
    {
      q: 'Give examples of creational patterns in the JDK.',
      a: 'Singleton: Runtime.getRuntime(). Factory: Calendar.getInstance(), List.of(), Integer.valueOf(), Executors. Abstract Factory: DocumentBuilderFactory. Builder: StringBuilder, Stream.Builder, HttpClient.newBuilder(). Prototype: Object.clone(), ArrayList.clone().',
      level: 'Medium',
    },
    {
      q: 'Which creational patterns does Spring use?',
      a: 'Singleton (default bean scope), Factory (BeanFactory, FactoryBean, @Bean methods), Builder (UriComponentsBuilder, WebClient.builder(), SpringApplicationBuilder), and prototype scope for new instances on each request.',
      level: 'Medium',
    },
    {
      q: 'What is the output: an enum singleton INSTANCE has int count = 0 and method inc() returns ++count. Called three times from different places?',
      a: '1, 2, 3 - every caller uses the same enum constant, so state is shared.',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Write an AppConfig singleton using the Bill Pugh holder idiom and prove that the config is loaded lazily and only once.',
      hint: 'Print a message in the private constructor and another before the first getInstance() call.',
      solution: pr1,
    },
    {
      task: 'Create a ShapeFactory.create(type, a, b) returning Square or Rect (records implementing Shape) and throwing for unknown types.',
      hint: 'Use a switch expression with arrow labels.',
      solution: pr2,
    },
    {
      task: 'Build an immutable User with a required name and optional email and age using a static nested Builder.',
      hint: 'Validate the required field in the Builder constructor; give optional fields defaults.',
      solution: pr3,
    },
    {
      task: 'Create a prototype registry of document templates. Each create() must return an independent deep copy.',
      hint: 'Store templates in a Map and copy the sections list in copy().',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which singleton implementation is safe against reflection and serialization by default?',
      options: ['Eager static field', 'Double-checked locking', 'Enum singleton', 'synchronized getInstance()'],
      answer: 2,
      explanation: 'The JVM forbids reflective creation of enum constants and handles enum serialization specially.',
    },
    {
      question: 'In double-checked locking, the instance field must be...',
      options: ['volatile', 'final', 'transient', 'public'],
      answer: 0,
      explanation: 'volatile prevents reordering and ensures visibility.',
    },
    {
      question: 'Which pattern best fixes a constructor with 8 parameters, 6 of them optional?',
      options: ['Prototype', 'Singleton', 'Abstract Factory', 'Builder'],
      answer: 3,
      explanation: 'Builder handles many optional parameters readably.',
    },
    {
      question: 'Object.clone() performs which type of copy by default?',
      options: ['Deep copy', 'Shallow copy', 'No copy, returns this', 'Serialized copy'],
      answer: 1,
      explanation: 'Fields are copied; referenced objects are shared.',
    },
    {
      question: 'A factory that creates a matching Button AND Checkbox for one theme is...',
      options: ['Factory Method', 'Abstract Factory', 'Builder', 'Prototype'],
      answer: 1,
      explanation: 'Abstract Factory creates families of related products.',
    },
  ],
};
