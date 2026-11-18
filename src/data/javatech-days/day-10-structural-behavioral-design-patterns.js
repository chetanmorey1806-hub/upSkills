const STEPS = [
  'IntelliJ: File > New > Project > Java (JDK 17+) > New Java Class "Main". Eclipse: File > New > Java Project, then New > Class "Main" with main()',
  'Paste the code; all supporting interfaces and classes stay in Main.java (only Main is public)',
  'Click Run ▶ and read the output together with the comments in the code',
];

const adapter = `import java.util.Arrays;
import java.util.List;

// The interface OUR application uses everywhere
interface PaymentProcessor {
    void pay(String orderId, int rupees);
}

class RazorpayProcessor implements PaymentProcessor {
    public void pay(String orderId, int rupees) {
        System.out.println("Razorpay: order " + orderId + " paid Rs." + rupees);
    }
}

// Third-party class with a DIFFERENT method signature (we cannot modify it)
class PayPalApi {
    void makePayment(double usd, String reference) {
        System.out.println("PayPal: $" + usd + " for ref " + reference);
    }
}

// ADAPTER: implements our interface, translates calls to the third-party API
class PayPalAdapter implements PaymentProcessor {
    private static final double RUPEES_PER_DOLLAR = 80.0;
    private final PayPalApi api;

    PayPalAdapter(PayPalApi api) {
        this.api = api;
    }

    public void pay(String orderId, int rupees) {
        api.makePayment(rupees / RUPEES_PER_DOLLAR, "ORD-" + orderId);
    }
}

public class Main {
    public static void main(String[] args) {
        List<PaymentProcessor> processors =
                List.of(new RazorpayProcessor(), new PayPalAdapter(new PayPalApi()));
        for (PaymentProcessor p : processors) {
            p.pay("A1", 8000);
        }

        List<String> list = Arrays.asList(new String[]{"x", "y"});   // JDK adapter: array -> List
        System.out.println("Arrays.asList adapts an array: " + list);
    }
}`;

const decorator = `import java.util.List;

interface Coffee {
    String description();
    int cost();
}

class BasicCoffee implements Coffee {
    public String description() { return "Coffee"; }
    public int cost() { return 50; }
}

// Base decorator: IS-A Coffee and HAS-A Coffee
abstract class CoffeeDecorator implements Coffee {
    protected final Coffee inner;

    CoffeeDecorator(Coffee inner) {
        this.inner = inner;
    }
}

class Milk extends CoffeeDecorator {
    Milk(Coffee inner) { super(inner); }
    public String description() { return inner.description() + ", Milk"; }
    public int cost() { return inner.cost() + 20; }
}

class Sugar extends CoffeeDecorator {
    Sugar(Coffee inner) { super(inner); }
    public String description() { return inner.description() + ", Sugar"; }
    public int cost() { return inner.cost() + 5; }
}

class Caramel extends CoffeeDecorator {
    Caramel(Coffee inner) { super(inner); }
    public String description() { return inner.description() + ", Caramel"; }
    public int cost() { return inner.cost() + 30; }
}

public class Main {
    public static void main(String[] args) {
        Coffee c1 = new BasicCoffee();
        Coffee c2 = new Milk(new BasicCoffee());
        Coffee c3 = new Caramel(new Sugar(new Milk(new BasicCoffee())));   // wrap, wrap, wrap
        Coffee c4 = new Milk(new Milk(new BasicCoffee()));                 // double milk!

        for (Coffee c : List.of(c1, c2, c3, c4)) {
            System.out.println(c.description() + " = Rs." + c.cost());
        }
        // Same idea in java.io:
        // new BufferedReader(new InputStreamReader(new FileInputStream("a.txt")))
    }
}`;

const proxyFacade = `import java.util.HashMap;
import java.util.Map;

// ================= PROXY =================
interface ReportService {
    String getReport(String user, int year);
}

class RealReportService implements ReportService {
    public String getReport(String user, int year) {
        System.out.println("  [DB] generating report for " + year);    // slow, expensive
        return "Report-" + year;
    }
}

// Proxy: same interface, controls access to the real object (security + caching)
class SecureCachingProxy implements ReportService {
    private final ReportService real;
    private final Map<Integer, String> cache = new HashMap<>();

    SecureCachingProxy(ReportService real) {
        this.real = real;
    }

    public String getReport(String user, int year) {
        if (!user.equals("admin")) {
            return "ACCESS DENIED for " + user;
        }
        if (cache.containsKey(year)) {
            System.out.println("  [cache] hit for " + year);
            return cache.get(year);
        }
        String report = real.getReport(user, year);
        cache.put(year, report);
        return report;
    }
}

// ================= FACADE =================
class Inventory {
    boolean reserve(String item) {
        System.out.println("  Inventory: reserved " + item);
        return true;
    }
}

class Payment {
    boolean charge(int amount) {
        System.out.println("  Payment: charged Rs." + amount);
        return true;
    }
}

class Shipping {
    String ship(String item) {
        System.out.println("  Shipping: " + item + " dispatched");
        return "TRK123";
    }
}

// Facade: ONE simple method hides three subsystems
class OrderFacade {
    private final Inventory inventory = new Inventory();
    private final Payment payment = new Payment();
    private final Shipping shipping = new Shipping();

    String placeOrder(String item, int amount) {
        if (inventory.reserve(item) && payment.charge(amount)) {
            String tracking = shipping.ship(item);
            return "Order OK, tracking " + tracking;
        }
        return "Order failed";
    }
}

public class Main {
    public static void main(String[] args) {
        ReportService reports = new SecureCachingProxy(new RealReportService());
        System.out.println(reports.getReport("admin", 2025));
        System.out.println(reports.getReport("admin", 2025));
        System.out.println(reports.getReport("guest", 2025));

        System.out.println("--- Facade ---");
        System.out.println(new OrderFacade().placeOrder("Headphones", 1999));
    }
}`;

const strategy = `import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@FunctionalInterface
interface ShippingStrategy {
    int cost(int weightKg);
}

class Checkout {
    private ShippingStrategy strategy;           // context HAS-A strategy

    void setStrategy(ShippingStrategy strategy) {
        this.strategy = strategy;                // can change at runtime
    }

    int shipping(int weightKg) {
        return strategy.cost(weightKg);
    }
}

public class Main {
    public static void main(String[] args) {
        Map<String, ShippingStrategy> strategies = new LinkedHashMap<>();
        strategies.put("Standard", w -> 40 + w * 10);       // lambdas = tiny strategy classes
        strategies.put("Express", w -> 100 + w * 20);
        strategies.put("FreeAbove5kg", w -> w > 5 ? 0 : 60);

        Checkout checkout = new Checkout();
        for (Map.Entry<String, ShippingStrategy> e : strategies.entrySet()) {
            checkout.setStrategy(e.getValue());
            System.out.println(e.getKey() + " for 3 kg = Rs." + checkout.shipping(3));
        }

        // Comparator is the JDK's most famous Strategy
        List<String> names = new ArrayList<>(List.of("Vikram", "Anu", "Rohit"));
        names.sort(Comparator.comparing(String::length));
        System.out.println("By length: " + names);
        names.sort(Comparator.reverseOrder());
        System.out.println("Reverse alphabetical: " + names);
    }
}`;

const observer = `import java.util.ArrayList;
import java.util.List;

interface StockObserver {
    void update(String stock, int price);
}

// Subject (publisher)
class StockMarket {
    private final List<StockObserver> observers = new ArrayList<>();

    void subscribe(StockObserver o)   { observers.add(o); }
    void unsubscribe(StockObserver o) { observers.remove(o); }

    void setPrice(String stock, int price) {
        System.out.println("Market: " + stock + " -> " + price);
        for (StockObserver o : observers) {
            o.update(stock, price);              // push the change to every subscriber
        }
    }
}

// Concrete observers (subscribers)
class MobileApp implements StockObserver {
    private final String user;

    MobileApp(String user) { this.user = user; }

    public void update(String stock, int price) {
        System.out.println("  " + user + " app notified: " + stock + " = " + price);
    }
}

class AlertService implements StockObserver {
    private final int threshold;

    AlertService(int threshold) { this.threshold = threshold; }

    public void update(String stock, int price) {
        if (price > threshold) {
            System.out.println("  ALERT: " + stock + " crossed " + threshold);
        }
    }
}

public class Main {
    public static void main(String[] args) {
        StockMarket market = new StockMarket();
        MobileApp riya = new MobileApp("Riya");
        MobileApp amit = new MobileApp("Amit");
        market.subscribe(riya);
        market.subscribe(amit);
        market.subscribe(new AlertService(2500));

        market.setPrice("TCS", 2400);
        market.unsubscribe(amit);
        market.setPrice("TCS", 2600);
    }
}`;

const templateCommand = `import java.util.ArrayDeque;
import java.util.Deque;

// ================= TEMPLATE METHOD =================
abstract class DataExporter {
    // the template: fixed order of steps, final so subclasses cannot change it
    final void export() {
        connect();
        String data = fetch();
        write(format(data));
        System.out.println("  done");
    }

    private void connect() {
        System.out.println(getClass().getSimpleName() + ": connect to DB");
    }

    private String fetch() {
        return "id=1,name=Riya";
    }

    protected abstract String format(String data);     // step that varies

    protected void write(String output) {              // hook with default behaviour
        System.out.println("  writing " + output);
    }
}

class CsvExporter extends DataExporter {
    protected String format(String data) {
        return data.replace("id=", "").replace("name=", "");
    }
}

class JsonExporter extends DataExporter {
    protected String format(String data) {
        return "{" + data.replace("=", ":") + "}";
    }
}

// ================= COMMAND =================
interface Command {
    void execute();
    void undo();
}

class Light {
    void on()  { System.out.println("  Light ON"); }
    void off() { System.out.println("  Light OFF"); }
}

class Speaker {
    private int volume = 5;
    void up()   { volume++; System.out.println("  Volume " + volume); }
    void down() { volume--; System.out.println("  Volume " + volume); }
}

class LightOnCommand implements Command {
    private final Light light;
    LightOnCommand(Light light) { this.light = light; }
    public void execute() { light.on(); }
    public void undo()    { light.off(); }
}

class VolumeUpCommand implements Command {
    private final Speaker speaker;
    VolumeUpCommand(Speaker speaker) { this.speaker = speaker; }
    public void execute() { speaker.up(); }
    public void undo()    { speaker.down(); }
}

// Invoker: knows nothing about lights or speakers, only Commands
class RemoteControl {
    private final Deque<Command> history = new ArrayDeque<>();

    void press(Command c) {
        c.execute();
        history.push(c);
    }

    void undoLast() {
        if (history.isEmpty()) {
            System.out.println("Nothing to undo");
            return;
        }
        System.out.println("Undo");
        history.pop().undo();
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("--- Template Method ---");
        new CsvExporter().export();
        new JsonExporter().export();

        System.out.println("--- Command ---");
        RemoteControl remote = new RemoteControl();
        remote.press(new LightOnCommand(new Light()));
        Command volUp = new VolumeUpCommand(new Speaker());
        remote.press(volUp);
        remote.press(volUp);
        remote.undoLast();
        remote.undoLast();
        remote.undoLast();
        remote.undoLast();
    }
}`;

const pr1 = `// Our app works in Celsius; an old sensor library only gives Fahrenheit
interface CelsiusSensor {
    int readCelsius();
}

class OldFahrenheitSensor {                 // cannot be modified
    private final int f;
    OldFahrenheitSensor(int f) { this.f = f; }
    int getFahrenheit() { return f; }
}

class SensorAdapter implements CelsiusSensor {
    private final OldFahrenheitSensor old;
    SensorAdapter(OldFahrenheitSensor old) { this.old = old; }
    public int readCelsius() { return (old.getFahrenheit() - 32) * 5 / 9; }
}

public class Main {
    public static void main(String[] args) {
        CelsiusSensor s1 = new SensorAdapter(new OldFahrenheitSensor(212));
        CelsiusSensor s2 = new SensorAdapter(new OldFahrenheitSensor(98));
        System.out.println(s1.readCelsius() + " C");
        System.out.println(s2.readCelsius() + " C");
    }
}
/* Output:
100 C
36 C       ((98 - 32) * 5 / 9 = 330 / 9 = 36 with int division) */`;

const pr2 = `interface TextProcessor {
    String process(String text);
}

class PlainText implements TextProcessor {
    public String process(String text) { return text; }
}

abstract class TextDecorator implements TextProcessor {
    protected final TextProcessor inner;
    TextDecorator(TextProcessor inner) { this.inner = inner; }
}

class Trim extends TextDecorator {
    Trim(TextProcessor inner) { super(inner); }
    public String process(String text) { return inner.process(text).trim(); }
}

class Upper extends TextDecorator {
    Upper(TextProcessor inner) { super(inner); }
    public String process(String text) { return inner.process(text).toUpperCase(); }
}

class Exclaim extends TextDecorator {
    Exclaim(TextProcessor inner) { super(inner); }
    public String process(String text) { return inner.process(text) + "!"; }
}

public class Main {
    public static void main(String[] args) {
        TextProcessor p = new Exclaim(new Upper(new Trim(new PlainText())));
        System.out.println("[" + p.process("   hello java  ") + "]");
        TextProcessor q = new Trim(new Exclaim(new PlainText()));
        System.out.println("[" + q.process("  hi  ") + "]");
    }
}
/* Output:
[HELLO JAVA!]
[hi  !]
(q: Exclaim runs first -> "  hi  !" then Trim removes only the leading spaces) */`;

const pr3 = `import java.util.function.IntUnaryOperator;

class Wallet {
    private IntUnaryOperator feeStrategy = amount -> amount;   // default: no fee

    void setFeeStrategy(IntUnaryOperator s) { feeStrategy = s; }

    int finalAmount(int amount) { return feeStrategy.applyAsInt(amount); }
}

public class Main {
    public static void main(String[] args) {
        Wallet wallet = new Wallet();
        System.out.println("UPI: " + wallet.finalAmount(1000));

        wallet.setFeeStrategy(a -> a + a * 2 / 100);          // credit card: 2% fee
        System.out.println("Card: " + wallet.finalAmount(1000));

        wallet.setFeeStrategy(a -> a + 25);                   // net banking: flat 25
        System.out.println("NetBanking: " + wallet.finalAmount(1000));
    }
}
/* Output:
UPI: 1000
Card: 1020
NetBanking: 1025 */`;

const pr4 = `import java.util.ArrayList;
import java.util.List;

interface Subscriber {
    void notifyVideo(String channel, String title);
}

class Channel {
    private final String name;
    private final List<Subscriber> subscribers = new ArrayList<>();

    Channel(String name) { this.name = name; }

    void subscribe(Subscriber s) { subscribers.add(s); }

    void upload(String title) {
        System.out.println(name + " uploaded: " + title);
        for (Subscriber s : subscribers) s.notifyVideo(name, title);
    }
}

public class Main {
    public static void main(String[] args) {
        Channel channel = new Channel("JavaWithMe");
        channel.subscribe((ch, t) -> System.out.println("  Sana: watching " + t));
        channel.subscribe((ch, t) -> System.out.println("  Dev: saved " + t + " from " + ch));
        channel.upload("Observer Pattern");
    }
}
/* Output:
JavaWithMe uploaded: Observer Pattern
  Sana: watching Observer Pattern
  Dev: saved Observer Pattern from JavaWithMe */`;

const pr5 = `import java.util.ArrayDeque;
import java.util.Deque;

interface EditCommand {
    void execute();
    void undo();
}

class Editor {
    final StringBuilder text = new StringBuilder();
}

class AppendCommand implements EditCommand {
    private final Editor editor;
    private final String part;

    AppendCommand(Editor editor, String part) {
        this.editor = editor;
        this.part = part;
    }

    public void execute() { editor.text.append(part); }

    public void undo() {
        int len = editor.text.length();
        editor.text.delete(len - part.length(), len);
    }
}

public class Main {
    public static void main(String[] args) {
        Editor editor = new Editor();
        Deque<EditCommand> history = new ArrayDeque<>();

        String[] parts = {"Hello", " Java", " World"};
        for (String p : parts) {
            EditCommand c = new AppendCommand(editor, p);
            c.execute();
            history.push(c);
        }
        System.out.println(editor.text);
        history.pop().undo();
        System.out.println(editor.text);
        history.pop().undo();
        System.out.println(editor.text);
    }
}
/* Output:
Hello Java World
Hello Java
Hello */`;

export default {
  id: 'day-10-structural-behavioral-design-patterns',
  title: 'Design Patterns - Structural and Behavioral: Adapter, Decorator, Proxy, Facade, Strategy, Observer, Template Method, Command',
  module: 'Module 2: Testing, Clean Code & Design Patterns',
  day: 10,
  level: 'Advanced',
  duration: '3 hours',
  summary:
    'Learn the most used structural patterns (Adapter, Decorator, Proxy, Facade) and behavioral patterns (Strategy, Observer, Template Method, Command) through runnable Java programs, and see exactly where Spring and the JDK use each one - a favourite interview topic.',
  objectives: [
    'Use Adapter, Decorator, Proxy and Facade to combine objects flexibly',
    'Use Strategy, Observer, Template Method and Command to organise behaviour',
    'Distinguish look-alike patterns (Adapter vs Decorator vs Proxy, Strategy vs Template Method)',
    'Identify these patterns inside the JDK and the Spring Framework',
  ],
  theory: [
    {
      heading: 'Structural Patterns: Adapter and Facade',
      content:
        'Structural patterns describe how classes and objects are combined into bigger structures. ADAPTER converts the interface of an existing class into the interface the client expects. Analogy: a travel plug adapter lets your Indian charger fit a UK socket without changing either. FACADE provides ONE simple entry point to a complex subsystem. Analogy: a hotel reception - you ask for "room service" and they coordinate the kitchen, billing and housekeeping for you.',
      points: [
        'Adapter = wrapper that CHANGES the interface (old API -> new API). Typical use: integrating third-party or legacy code.',
        'Adapter types: object adapter (composition, preferred) and class adapter (inheritance).',
        'JDK Adapters: Arrays.asList(), InputStreamReader (bytes -> chars), Collections.list(enumeration).',
        'Facade = SIMPLIFIES many interfaces into one; the subsystems still exist and can be used directly if needed.',
        'Facade examples: SLF4J (facade over Logback/Log4j), JdbcTemplate hides Connection/Statement/ResultSet handling; a service layer method placeOrder() that calls inventory, payment and shipping.',
      ],
    },
    {
      heading: 'Structural Patterns: Decorator and Proxy',
      content:
        'DECORATOR adds new responsibilities to an object dynamically by wrapping it in another object of the SAME interface. Wrappers can be stacked in any order. Analogy: a plain coffee + milk + sugar + caramel; each add-on wraps the previous cup and adds to the price. PROXY also wraps an object with the same interface, but its purpose is to CONTROL ACCESS to it: lazy loading, caching, security checks, logging, remote calls. Analogy: a company receptionist who decides whether you can meet the CEO.',
      points: [
        'Decorator follows OCP: add features without modifying the original class, and avoids a class explosion (MilkSugarCaramelCoffee).',
        'JDK Decorators: java.io streams - new BufferedReader(new InputStreamReader(new FileInputStream(f))); Collections.unmodifiableList(), Collections.synchronizedList().',
        'Proxy kinds: virtual (lazy load), protection (access control), caching, remote (RMI, Feign clients), logging.',
        'JDK: java.lang.reflect.Proxy creates dynamic proxies for interfaces at runtime.',
        'Hibernate lazy loading returns a proxy object that hits the database only when you call a getter.',
      ],
      tip: 'Adapter vs Decorator vs Proxy (all are wrappers): Adapter CHANGES the interface; Decorator keeps the interface and ADDS behaviour; Proxy keeps the interface and CONTROLS access.',
    },
    {
      heading: 'Behavioral Patterns: Strategy and Template Method',
      content:
        'Behavioral patterns are about how objects share responsibilities and communicate. STRATEGY defines a family of algorithms, puts each in its own class behind a common interface, and lets the client switch between them at runtime. Analogy: Google Maps offers car, bike or walk routes - same destination, different algorithm. TEMPLATE METHOD defines the skeleton of an algorithm in a parent class (a final method calling steps in fixed order) and lets subclasses fill in some steps. Analogy: every exam follows the same template (enter hall, write paper, submit), but the paper differs.',
      points: [
        'Strategy uses composition (HAS-A strategy, can be changed at runtime); Template Method uses inheritance (IS-A, fixed at compile time).',
        'Since Java 8 a strategy is often just a lambda: Comparator, Predicate, Function.',
        'Strategy replaces long if-else/switch chains (OCP from Day 8).',
        'Template Method "hooks" are optional steps with a default implementation that subclasses may override.',
        'JDK: Comparator (Strategy); AbstractList, InputStream.read(byte[]) calling read() (Template Method); HttpServlet.service() calling doGet/doPost (Template Method).',
      ],
    },
    {
      heading: 'Behavioral Patterns: Observer and Command',
      content:
        'OBSERVER defines a one-to-many dependency: when the subject changes state, all registered observers are notified automatically. Analogy: YouTube subscribers get a notification when a channel uploads; the channel does not know what each subscriber will do. COMMAND turns a request into an object containing everything needed to perform it, so requests can be queued, logged, scheduled or undone. Analogy: a waiter writes your order on a slip (the command) and hands it to the kitchen; the slip can wait in a queue or be cancelled.',
      points: [
        'Observer gives loose coupling between publisher and subscribers; also called publish-subscribe (in-process).',
        'Observer pitfalls: memory leaks if observers never unsubscribe; notification order should not be relied upon.',
        'JDK/Java: event listeners in Swing/JavaFX (ActionListener), PropertyChangeListener; java.util.Observer is deprecated since Java 9.',
        'Command parts: Command interface (execute/undo), concrete commands, Receiver (does the real work), Invoker (triggers commands, keeps history).',
        'Command uses: undo/redo in editors, task queues, macro recording, transactions. Runnable and Callable submitted to an ExecutorService are commands.',
      ],
    },
    {
      heading: 'Where Spring Uses These Patterns',
      content:
        'A common interview question is "Which design patterns are used in Spring?" Here is the map you should remember.',
      points: [
        'Proxy: Spring AOP and @Transactional, @Cacheable, @Async create JDK dynamic proxies or CGLIB subclass proxies around your beans. That is why calling a @Transactional method from the SAME class (self-invocation) skips the proxy and the transaction.',
        'Template Method: JdbcTemplate, RestTemplate, JmsTemplate, TransactionTemplate - Spring handles opening/closing/exceptions, you supply only the varying part (SQL + RowMapper).',
        'Observer: ApplicationEvent + ApplicationEventPublisher + @EventListener; ContextRefreshedEvent.',
        'Strategy: inject List<PaymentService> or Map<String, PaymentService> of all implementations and choose at runtime; Spring Security AuthenticationProvider, PasswordEncoder, Resource loading strategies.',
        'Adapter: Spring MVC HandlerAdapter lets DispatcherServlet call any kind of handler (@Controller methods, HttpRequestHandler).',
        'Decorator: BeanPostProcessor can wrap beans; HttpServletRequestWrapper; Spring Session decorates the HttpSession.',
        'Facade: JdbcTemplate over raw JDBC, Spring Data repositories over JPA EntityManager.',
        'Front Controller: DispatcherServlet. Singleton and Factory: bean scopes and BeanFactory (Day 9).',
        'Command-like: Runnable tasks passed to TaskExecutor / @Scheduled methods.',
      ],
    },
  ],
  examples: [
    {
      title: 'Adapter: Plugging a Third-Party PayPal API into Our Payment Interface',
      scenario: 'Our code calls pay(orderId, rupees). PayPal\'s library has makePayment(usd, reference). Make them work together without editing either.',
      steps: STEPS,
      code: adapter,
      java: { files: { 'Main.java': adapter } },
      result: `Razorpay: order A1 paid Rs.8000
PayPal: $100.0 for ref ORD-A1
Arrays.asList adapts an array: [x, y]`,
      explanation:
        'PayPalAdapter implements PaymentProcessor, so it fits in the same list as RazorpayProcessor. Inside, it converts rupees to dollars (8000 / 80.0 = 100.0, printed as a double) and builds the reference string the PayPal API expects. Arrays.asList is an adapter in the JDK.',
    },
    {
      title: 'Decorator: Coffee with Stackable Add-ons',
      scenario: 'A cafe has many add-ons. Creating a subclass for every combination would need dozens of classes.',
      steps: STEPS,
      code: decorator,
      java: { files: { 'Main.java': decorator } },
      result: `Coffee = Rs.50
Coffee, Milk = Rs.70
Coffee, Milk, Sugar, Caramel = Rs.105
Coffee, Milk, Milk = Rs.90`,
      explanation:
        'Each decorator holds the coffee it wraps and adds its own text and price. For c3 the calls go Caramel -> Sugar -> Milk -> BasicCoffee and the prices add up 50 + 20 + 5 + 30 = 105. The same decorator can be applied twice (double milk).',
    },
    {
      title: 'Proxy for Security and Caching, and a Facade for Order Placement',
      scenario: 'Reports are expensive to generate and only admins may see them. Placing an order involves three subsystems.',
      steps: STEPS,
      code: proxyFacade,
      java: { files: { 'Main.java': proxyFacade } },
      result: `  [DB] generating report for 2025
Report-2025
  [cache] hit for 2025
Report-2025
ACCESS DENIED for guest
--- Facade ---
  Inventory: reserved Headphones
  Payment: charged Rs.1999
  Shipping: Headphones dispatched
Order OK, tracking TRK123`,
      explanation:
        'The client only sees ReportService. The first admin call reaches the real service; the second is served from the proxy\'s cache, and the guest is blocked before the real object is touched. Spring @Cacheable and @PreAuthorize work through proxies in exactly this way. OrderFacade gives one method that hides three classes and their call order.',
    },
    {
      title: 'Strategy: Switchable Shipping Cost Algorithms and Comparator',
      scenario: 'Checkout must support Standard, Express and Free shipping rules, chosen at runtime.',
      steps: STEPS,
      code: strategy,
      java: { files: { 'Main.java': strategy } },
      result: `Standard for 3 kg = Rs.70
Express for 3 kg = Rs.160
FreeAbove5kg for 3 kg = Rs.60
By length: [Anu, Rohit, Vikram]
Reverse alphabetical: [Vikram, Rohit, Anu]`,
      explanation:
        'Checkout has one strategy field that is replaced at runtime. Standard: 40 + 30 = 70; Express: 100 + 60 = 160; 3 kg is not above 5 so free shipping does not apply: 60. LinkedHashMap keeps the insertion order. Comparator objects are strategies for sorting: by length (3, 5, 6) and then reverse natural order.',
    },
    {
      title: 'Observer: Stock Price Notifications',
      scenario: 'Mobile apps and an alert service must react whenever a stock price changes, and users can unsubscribe.',
      steps: STEPS,
      code: observer,
      java: { files: { 'Main.java': observer } },
      result: `Market: TCS -> 2400
  Riya app notified: TCS = 2400
  Amit app notified: TCS = 2400
Market: TCS -> 2600
  Riya app notified: TCS = 2600
  ALERT: TCS crossed 2500`,
      explanation:
        'StockMarket only knows the StockObserver interface. At 2400 all three observers are called, but the alert stays silent (2400 is not above 2500). After Amit unsubscribes, only Riya and the alert service are notified; 2600 > 2500 triggers the alert. Observers are notified in subscription order because an ArrayList is used.',
    },
    {
      title: 'Template Method for Data Export and Command with Undo',
      scenario: 'CSV and JSON exporters share the same steps; a remote control executes and undoes commands.',
      steps: STEPS,
      code: templateCommand,
      java: { files: { 'Main.java': templateCommand } },
      result: `--- Template Method ---
CsvExporter: connect to DB
  writing 1,Riya
  done
JsonExporter: connect to DB
  writing {id:1,name:Riya}
  done
--- Command ---
  Light ON
  Volume 6
  Volume 7
Undo
  Volume 6
Undo
  Volume 5
Undo
  Light OFF
Nothing to undo`,
      explanation:
        'export() is final and fixes the order connect -> fetch -> format -> write; subclasses only supply format(). getClass().getSimpleName() returns the runtime subclass name. In the Command part, the remote pushes each executed command onto a stack (ArrayDeque push/pop = LIFO), so undo reverses them in opposite order: volume 7 -> 6 -> 5, then light off. The fourth undo finds an empty history.',
    },
  ],
  interview: [
    {
      q: 'What is the difference between Adapter, Decorator and Proxy?',
      a: 'All wrap another object. Adapter converts one interface into another the client expects. Decorator keeps the same interface and adds responsibilities, and can be stacked. Proxy keeps the same interface and controls access (lazy loading, caching, security, remote).',
      level: 'Hard',
    },
    {
      q: 'Explain the Decorator pattern with a JDK example.',
      a: 'Decorator wraps an object to add behaviour dynamically without subclassing. java.io: new BufferedInputStream(new FileInputStream("a.txt")) adds buffering to a file stream; Collections.unmodifiableList(list) adds read-only behaviour.',
      level: 'Medium',
    },
    {
      q: 'How does Spring use the Proxy pattern?',
      a: 'For AOP features like @Transactional, @Cacheable, @Async and method security, Spring creates a proxy (JDK dynamic proxy for interfaces, CGLIB subclass otherwise). Calls go through the proxy, which starts/commits transactions or applies advice before delegating to the real bean.',
      level: 'Medium',
    },
    {
      q: 'Why does @Transactional not work when a method calls another @Transactional method in the same class?',
      a: 'Self-invocation uses this.method(), which bypasses the Spring proxy, so the transactional advice is never applied. Fix: move the method to another bean, inject the proxy, or use TransactionTemplate.',
      level: 'Hard',
    },
    {
      q: 'What is the Facade pattern? Give an example.',
      a: 'A single simplified interface to a complex subsystem. Examples: SLF4J logging facade, JdbcTemplate over JDBC, a service method that coordinates inventory, payment and shipping.',
      level: 'Easy',
    },
    {
      q: 'Strategy vs Template Method?',
      a: 'Both vary part of an algorithm. Strategy uses composition: the whole algorithm is a separate object chosen at runtime. Template Method uses inheritance: a parent fixes the skeleton and subclasses override steps at compile time.',
      level: 'Medium',
    },
    {
      q: 'Give a real use of the Strategy pattern in Java.',
      a: 'Comparator passed to Collections.sort/List.sort; different PaymentService implementations (UPI, Card) injected by Spring and selected at runtime; PasswordEncoder implementations in Spring Security.',
      level: 'Easy',
    },
    {
      q: 'Explain the Observer pattern and where Spring uses it.',
      a: 'One-to-many dependency where observers are notified automatically when the subject changes. Spring: ApplicationEventPublisher.publishEvent() with @EventListener or ApplicationListener beans; Swing ActionListener in the JDK.',
      level: 'Medium',
    },
    {
      q: 'Which Spring classes use the Template Method pattern?',
      a: 'JdbcTemplate, RestTemplate, JmsTemplate, TransactionTemplate, HibernateTemplate. They implement fixed steps (get connection, handle exceptions, release resources) and call back your code for the variable step (RowMapper, callback).',
      level: 'Medium',
    },
    {
      q: 'What is the Command pattern and how is undo implemented?',
      a: 'A request is encapsulated as an object with execute() (and often undo()). The invoker keeps executed commands in a stack; undo pops the last command and calls undo(), which reverses its effect on the receiver.',
      level: 'Medium',
    },
    {
      q: 'Which design patterns are used in Spring MVC?',
      a: 'Front Controller (DispatcherServlet), Adapter (HandlerAdapter), Strategy (ViewResolver, HandlerMapping implementations), Template Method (AbstractController), plus Singleton beans and Factory (ApplicationContext).',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'An old sensor library returns Fahrenheit, but your app expects a CelsiusSensor interface. Write an adapter.',
      hint: 'C = (F - 32) * 5 / 9; use composition, not inheritance.',
      solution: pr1,
    },
    {
      task: 'Create a TextProcessor with decorators Trim, Upper and Exclaim and show how the wrapping order changes the result.',
      hint: 'The innermost wrapper runs first because each decorator calls inner.process() before adding its own change.',
      solution: pr2,
    },
    {
      task: 'Implement payment fee strategies (UPI no fee, Card 2%, NetBanking flat Rs.25) using lambdas, switchable at runtime.',
      hint: 'java.util.function.IntUnaryOperator is a ready-made functional interface int -> int.',
      solution: pr3,
    },
    {
      task: 'Model a YouTube channel that notifies all subscribers when a video is uploaded (Observer). Use lambdas as subscribers.',
      hint: 'Subscriber has one abstract method, so it is a functional interface.',
      solution: pr4,
    },
    {
      task: 'Build a mini text editor where every append is a Command that can be undone.',
      hint: 'Store commands in an ArrayDeque used as a stack; undo deletes the last appended part.',
      solution: pr5,
    },
  ],
  quiz: [
    {
      question: 'Which pattern converts one interface into another that a client expects?',
      options: ['Decorator', 'Adapter', 'Facade', 'Observer'],
      answer: 1,
      explanation: 'Adapter translates interfaces.',
    },
    {
      question: 'new BufferedReader(new InputStreamReader(System.in)) is mainly an example of...',
      options: ['Singleton', 'Command', 'Strategy', 'Decorator'],
      answer: 3,
      explanation: 'BufferedReader decorates a Reader with buffering (InputStreamReader itself adapts bytes to chars).',
    },
    {
      question: 'Spring\'s @Transactional is implemented using which pattern?',
      options: ['Proxy', 'Builder', 'Prototype', 'Template Method only'],
      answer: 0,
      explanation: 'Spring wraps the bean in an AOP proxy that manages the transaction.',
    },
    {
      question: 'JdbcTemplate is a classic example of...',
      options: ['Observer', 'Abstract Factory', 'Template Method', 'Adapter'],
      answer: 2,
      explanation: 'It fixes the JDBC workflow and calls back your code for the varying parts.',
    },
    {
      question: 'A list of commands is undone in which order?',
      options: ['Same order as executed (FIFO)', 'Random order', 'Alphabetical order', 'Reverse order of execution (LIFO)'],
      answer: 3,
      explanation: 'Undo history is a stack; the last executed command is undone first.',
    },
  ],
};
