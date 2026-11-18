const STEPS = [
  'IntelliJ: File > New > Project > Java (JDK 17+) > create Main.java in src. Eclipse: File > New > Java Project > New Class "Main" with main()',
  'Paste the code (all classes can stay in Main.java; only Main is public)',
  'Click Run ▶ (Eclipse: Run As > Java Application) and compare the BEFORE and AFTER output',
];

const srp = `// ---------- BEFORE: one class, three reasons to change ----------
class InvoiceBefore {
    String customer;
    int amount;

    InvoiceBefore(String customer, int amount) {
        this.customer = customer;
        this.amount = amount;
    }

    int total() {                       // job 1: business calculation
        return amount + amount * 18 / 100;
    }

    String print() {                    // job 2: formatting
        return "Invoice for " + customer + ": Rs." + total();
    }

    void saveToFile() {                 // job 3: persistence
        System.out.println("Saving to invoice.txt -> " + print());
    }
}

// ---------- AFTER: one class = one responsibility ----------
class Invoice {
    final String customer;
    final int amount;

    Invoice(String customer, int amount) {
        this.customer = customer;
        this.amount = amount;
    }

    int total() {
        return amount + amount * 18 / 100;     // only GST rule changes touch this class
    }
}

class InvoicePrinter {
    String format(Invoice inv) {               // only layout changes touch this class
        return "Invoice for " + inv.customer + ": Rs." + inv.total();
    }
}

class InvoiceRepository {
    void save(String text) {                   // only storage changes touch this class
        System.out.println("Saving to invoice.txt -> " + text);
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("BEFORE:");
        new InvoiceBefore("Riya", 1000).saveToFile();

        System.out.println("AFTER:");
        Invoice inv = new Invoice("Amit", 2500);
        String text = new InvoicePrinter().format(inv);
        System.out.println(text);
        new InvoiceRepository().save(text);
    }
}`;

const ocp = `// ---------- BEFORE: every new customer type = edit this method ----------
class DiscountCalculatorBefore {
    int finalPrice(String type, int price) {
        if (type.equals("REGULAR")) {
            return price;
        } else if (type.equals("PREMIUM")) {
            return price - price * 20 / 100;
        } else if (type.equals("STUDENT")) {
            return price - price * 10 / 100;
        }
        throw new IllegalArgumentException("Unknown type " + type);
    }
}

// ---------- AFTER: open for extension, closed for modification ----------
interface DiscountPolicy {
    String name();
    int apply(int price);
}

class RegularPolicy implements DiscountPolicy {
    public String name() { return "Regular"; }
    public int apply(int price) { return price; }
}

class PremiumPolicy implements DiscountPolicy {
    public String name() { return "Premium"; }
    public int apply(int price) { return price - price * 20 / 100; }
}

class StudentPolicy implements DiscountPolicy {
    public String name() { return "Student"; }
    public int apply(int price) { return price - price * 10 / 100; }
}

// NEW requirement: festival offer. Added as a NEW class - nothing above was edited.
class FestivalPolicy implements DiscountPolicy {
    public String name() { return "Festival"; }
    public int apply(int price) { return price >= 2000 ? price - 500 : price; }
}

class Checkout {
    int finalPrice(DiscountPolicy policy, int price) {
        return policy.apply(price);            // never changes again
    }
}

public class Main {
    public static void main(String[] args) {
        System.out.println("Before: PREMIUM 3000 -> "
                + new DiscountCalculatorBefore().finalPrice("PREMIUM", 3000));

        Checkout checkout = new Checkout();
        DiscountPolicy[] policies = {
            new RegularPolicy(), new PremiumPolicy(), new StudentPolicy(), new FestivalPolicy()
        };
        for (DiscountPolicy p : policies) {
            System.out.println(p.name() + " 3000 -> " + checkout.finalPrice(p, 3000));
        }
    }
}`;

const lsp = `import java.util.List;

// ---------- BEFORE: Square IS-A Rectangle? Mathematically yes, behaviourally NO ----------
class Rectangle {
    protected int width, height;

    void setWidth(int w)  { width = w; }
    void setHeight(int h) { height = h; }
    int area()            { return width * height; }
}

class Square extends Rectangle {
    @Override
    void setWidth(int w)  { width = w; height = w; }    // changes BOTH sides

    @Override
    void setHeight(int h) { width = h; height = h; }
}

// ---------- AFTER: no misleading inheritance; both obey the Shape contract ----------
interface Shape {
    int area();
}

record RectangleShape(int width, int height) implements Shape {
    public int area() { return width * height; }
}

record SquareShape(int side) implements Shape {
    public int area() { return side * side; }
}

public class Main {
    // client code written for Rectangle; it expects area = 5 * 4
    static void resize(Rectangle r) {
        r.setWidth(5);
        r.setHeight(4);
        System.out.println(r.getClass().getSimpleName() + ": expected 20, got " + r.area());
    }

    public static void main(String[] args) {
        resize(new Rectangle());
        resize(new Square());                // substitution breaks the client!

        System.out.println("--- after fix ---");
        List<Shape> shapes = List.of(new RectangleShape(5, 4), new SquareShape(4));
        for (Shape s : shapes) {
            System.out.println(s.getClass().getSimpleName() + " area = " + s.area());
        }
    }
}`;

const isp = `import java.util.List;

// ---------- BEFORE: a fat interface ----------
interface FatWorker {
    void work();
    void eat();
}

class RobotBefore implements FatWorker {
    public void work() { System.out.println("RobotBefore welding"); }
    public void eat()  { throw new UnsupportedOperationException("Robots do not eat"); }  // forced!
}

// ---------- AFTER: small, role-based interfaces ----------
interface Workable { void work(); }
interface Eatable  { void eat(); }

class Human implements Workable, Eatable {
    public void work() { System.out.println("Human coding"); }
    public void eat()  { System.out.println("Human having lunch"); }
}

class Robot implements Workable {                  // implements ONLY what it needs
    public void work() { System.out.println("Robot welding"); }
}

public class Main {
    public static void main(String[] args) {
        try {
            FatWorker w = new RobotBefore();
            w.work();
            w.eat();
        } catch (UnsupportedOperationException e) {
            System.out.println("Problem: " + e.getMessage());
        }

        System.out.println("--- after ISP ---");
        List<Workable> shift = List.of(new Human(), new Robot());
        for (Workable w : shift) w.work();

        List<Eatable> canteen = List.of(new Human());
        for (Eatable e : canteen) e.eat();
    }
}`;

const dip = `import java.util.ArrayList;
import java.util.List;

// ---------- BEFORE: high-level class creates a low-level class itself ----------
class MySqlDatabase {
    void insert(String order) { System.out.println("MySQL INSERT " + order); }
}

class OrderServiceBefore {
    private final MySqlDatabase db = new MySqlDatabase();   // tightly coupled, cannot test without MySQL
    void place(String order) { db.insert(order); }
}

// ---------- AFTER: both depend on an abstraction ----------
interface OrderRepository {
    void save(String order);
    int count();
}

class MySqlOrderRepository implements OrderRepository {
    private int rows = 0;
    public void save(String order) {
        rows++;
        System.out.println("MySQL INSERT " + order);
    }
    public int count() { return rows; }
}

class InMemoryOrderRepository implements OrderRepository {    // perfect for tests
    private final List<String> orders = new ArrayList<>();
    public void save(String order) {
        orders.add(order);
        System.out.println("Memory add " + order);
    }
    public int count() { return orders.size(); }
}

class OrderService {
    private final OrderRepository repo;

    OrderService(OrderRepository repo) {        // dependency is INJECTED (Spring does this for you)
        this.repo = repo;
    }

    void place(String order) { repo.save(order.toUpperCase()); }
    int total()              { return repo.count(); }
}

public class Main {
    public static void main(String[] args) {
        new OrderServiceBefore().place("pizza");

        System.out.println("--- after DIP ---");
        OrderService prod = new OrderService(new MySqlOrderRepository());
        prod.place("pizza");

        OrderService test = new OrderService(new InMemoryOrderRepository());
        test.place("burger");
        test.place("pasta");

        System.out.println("prod orders = " + prod.total() + ", test orders = " + test.total());
    }
}`;

const clean = `// ---------- BEFORE: works, but full of code smells ----------
class Util {
    static String p(int[] a, int t) {          // what are p, a, t?
        int c = 0;
        int s = 0;
        for (int i = 0; i < a.length; i++) {
            if (a[i] >= 35) {                   // magic number
                c++;
                s = s + a[i];
            }
        }
        if (c == 0) return "none";
        return c + " passed, avg " + (s / c) + (s / c >= t ? " (good)" : " (needs work)");
    }
}

// ---------- AFTER: same behaviour, readable ----------
class ResultAnalyzer {
    private static final int PASS_MARK = 35;
    private final int targetAverage;

    ResultAnalyzer(int targetAverage) {
        this.targetAverage = targetAverage;
    }

    String summarize(int[] marks) {
        int passedCount = countPassed(marks);
        if (passedCount == 0) return "none";
        int average = sumOfPassed(marks) / passedCount;
        return passedCount + " passed, avg " + average + " " + remarkFor(average);
    }

    private int countPassed(int[] marks) {
        int count = 0;
        for (int mark : marks) {
            if (isPass(mark)) count++;
        }
        return count;
    }

    private int sumOfPassed(int[] marks) {
        int sum = 0;
        for (int mark : marks) {
            if (isPass(mark)) sum += mark;
        }
        return sum;
    }

    private boolean isPass(int mark) {
        return mark >= PASS_MARK;
    }

    private String remarkFor(int average) {
        return average >= targetAverage ? "(good)" : "(needs work)";
    }
}

public class Main {
    public static void main(String[] args) {
        int[] marks = {80, 20, 65, 34, 90};
        System.out.println("Before: " + Util.p(marks, 75));

        ResultAnalyzer analyzer = new ResultAnalyzer(75);
        System.out.println("After : " + analyzer.summarize(marks));
        System.out.println("After : " + analyzer.summarize(new int[]{10, 20}));
    }
}`;

const pr1 = `// BEFORE (for reference): UserManager validates, saves AND emails.
// AFTER: split into three focused classes.
import java.util.ArrayList;
import java.util.List;

class UserValidator {
    boolean isValid(String email) {
        return email.contains("@") && email.length() >= 6;
    }
}

class UserStore {
    private final List<String> users = new ArrayList<>();
    void save(String email) { users.add(email); }
    int size() { return users.size(); }
}

class WelcomeMailer {
    void send(String email) { System.out.println("Mail sent to " + email); }
}

class RegistrationService {                 // only coordinates the three helpers
    private final UserValidator validator = new UserValidator();
    private final UserStore store = new UserStore();
    private final WelcomeMailer mailer = new WelcomeMailer();

    void register(String email) {
        if (!validator.isValid(email)) {
            System.out.println("Rejected " + email);
            return;
        }
        store.save(email);
        mailer.send(email);
    }
    int count() { return store.size(); }
}

public class Main {
    public static void main(String[] args) {
        RegistrationService service = new RegistrationService();
        service.register("neha@mail.com");
        service.register("bad");
        System.out.println("Users: " + service.count());
    }
}
/* Output:
Mail sent to neha@mail.com
Rejected bad
Users: 1 */`;

const pr2 = `import java.util.List;

interface Shape {
    int area();
}

class Rect implements Shape {
    private final int w, h;
    Rect(int w, int h) { this.w = w; this.h = h; }
    public int area() { return w * h; }
}

class Sq implements Shape {
    private final int s;
    Sq(int s) { this.s = s; }
    public int area() { return s * s; }
}

// Added later WITHOUT touching AreaCalculator (OCP)
class Triangle implements Shape {
    private final int base, height;
    Triangle(int base, int height) { this.base = base; this.height = height; }
    public int area() { return base * height / 2; }
}

class AreaCalculator {
    int totalArea(List<Shape> shapes) {
        int total = 0;
        for (Shape s : shapes) total += s.area();
        return total;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Shape> shapes = List.of(new Rect(4, 5), new Sq(3), new Triangle(6, 3));
        System.out.println("Total area = " + new AreaCalculator().totalArea(shapes));
    }
}
/* Output:
Total area = 38      (20 + 9 + 9) */`;

const pr3 = `interface Printer { void print(String doc); }
interface Scanner2 { String scan(); }          // named Scanner2 to avoid clash with java.util.Scanner
interface Fax { void fax(String doc, String number); }

class BasicPrinter implements Printer {
    public void print(String doc) { System.out.println("BasicPrinter printing " + doc); }
}

class OfficeMachine implements Printer, Scanner2, Fax {
    public void print(String doc) { System.out.println("OfficeMachine printing " + doc); }
    public String scan() { return "scanned-page"; }
    public void fax(String doc, String number) { System.out.println("Faxing " + doc + " to " + number); }
}

public class Main {
    public static void main(String[] args) {
        Printer p1 = new BasicPrinter();
        p1.print("resume.pdf");

        OfficeMachine office = new OfficeMachine();
        office.print("offer.pdf");
        String page = office.scan();
        office.fax(page, "022-1234");
    }
}
/* Output:
BasicPrinter printing resume.pdf
OfficeMachine printing offer.pdf
Faxing scanned-page to 022-1234 */`;

const pr4 = `// BEFORE: class Switch { private LightBulb bulb = new LightBulb(); ... }  -> can only switch bulbs
interface Switchable {
    void turnOn();
    void turnOff();
}

class LightBulb implements Switchable {
    public void turnOn()  { System.out.println("Bulb ON"); }
    public void turnOff() { System.out.println("Bulb OFF"); }
}

class Fan implements Switchable {
    public void turnOn()  { System.out.println("Fan spinning"); }
    public void turnOff() { System.out.println("Fan stopped"); }
}

class Switch {
    private final Switchable device;
    private boolean on;

    Switch(Switchable device) { this.device = device; }   // DIP: depends on the abstraction

    void press() {
        if (on) device.turnOff(); else device.turnOn();
        on = !on;
    }
}

public class Main {
    public static void main(String[] args) {
        Switch s1 = new Switch(new LightBulb());
        s1.press();
        s1.press();
        Switch s2 = new Switch(new Fan());
        s2.press();
    }
}
/* Output:
Bulb ON
Bulb OFF
Fan spinning */`;

export default {
  id: 'day-08-solid-principles-clean-code',
  title: 'SOLID Principles and Clean Code',
  module: 'Module 2: Testing, Clean Code & Design Patterns',
  day: 8,
  level: 'Intermediate',
  duration: '3 hours',
  summary:
    'Learn the five SOLID design principles (SRP, OCP, LSP, ISP, DIP) through before/after Java programs, and the clean code habits companies expect: meaningful names, small methods, spotting code smells and refactoring safely.',
  objectives: [
    'State and explain each SOLID principle with a real-world analogy',
    'Recognise SOLID violations in code and refactor them',
    'Connect SOLID to Spring concepts like dependency injection and interfaces',
    'Write clean code: meaningful names, small methods, no magic numbers',
    'Identify common code smells and the refactoring that fixes each',
  ],
  theory: [
    {
      heading: 'Why Design Principles? Introducing SOLID',
      content:
        'Code that "works" is not enough. In companies, code is read 10 times more than it is written and changes every sprint. Badly designed code becomes rigid (one change breaks five places), fragile and hard to test. SOLID is a set of five principles collected by Robert C. Martin (Uncle Bob) to keep object-oriented code easy to change. Analogy: a well-organised kitchen - each drawer has one purpose, new utensils can be added without rebuilding the kitchen, and any brand of gas cylinder fits the stove.',
      points: [
        'S - Single Responsibility Principle',
        'O - Open/Closed Principle',
        'L - Liskov Substitution Principle',
        'I - Interface Segregation Principle',
        'D - Dependency Inversion Principle',
        'Goal of all five: high cohesion (each class focused) and low coupling (classes depend little on each other).',
      ],
    },
    {
      heading: 'S and O: Single Responsibility and Open/Closed',
      content:
        'SRP: "A class should have only one reason to change." An Invoice class that calculates tax, formats a PDF and saves to a file has three reasons to change (tax rule, layout, storage). Split it. Analogy: a Swiss-army knife is handy but a chef uses separate knives. OCP: "Software entities should be open for extension but closed for modification." When a new requirement comes, you should ADD a new class instead of editing tested code. The usual tool is an interface + polymorphism instead of long if-else/switch on a type.',
      points: [
        'SRP smell: class names like Manager, Util, Helper with 1000+ lines; methods that do validation, DB and email together.',
        'In Spring, Controller (HTTP), Service (business logic) and Repository (DB) layers are SRP in action.',
        'OCP smell: if (type.equals("A")) ... else if (type.equals("B")) ... repeated in many places.',
        'OCP in Java: Comparator lets you sort in new ways without modifying Collections.sort; Spring lets you add a new bean implementing an interface without editing callers.',
      ],
    },
    {
      heading: 'L: Liskov Substitution Principle',
      content:
        'LSP (Barbara Liskov, 1987): "Objects of a subclass must be usable wherever the parent class is expected, without breaking the program." A subclass must keep the parent\'s promises: it must not throw new unexpected exceptions, must not demand stronger input, and must not give weaker results. Classic violation: Square extends Rectangle. Code that sets width 5 and height 4 expects area 20, but a Square gives 16. Another: Ostrich extends Bird but fly() throws an exception.',
      points: [
        'Test for LSP: replace the parent with the child in existing code; if behaviour surprises the caller, LSP is broken.',
        '"IS-A" in real life is not enough; the BEHAVIOUR must also be substitutable.',
        'Fix: use a common interface (Shape) or separate hierarchies (Bird and FlyingBird).',
        'Java example of a violation: List.of(...) returns a List whose add() throws UnsupportedOperationException.',
      ],
    },
    {
      heading: 'I and D: Interface Segregation and Dependency Inversion',
      content:
        'ISP: "Clients should not be forced to depend on methods they do not use." A fat Worker interface with work() and eat() forces Robot to implement eat(). Split it into small role interfaces (Workable, Eatable). DIP: "High-level modules should not depend on low-level modules; both should depend on abstractions." OrderService (business rule) should not do new MySqlDatabase(); it should depend on an OrderRepository interface, and the concrete class is given (injected) from outside. Analogy: a phone charger plugs into a standard socket, not directly into the power station.',
      points: [
        'ISP: many small interfaces are better than one big one. Java examples: Runnable, Comparable, AutoCloseable each have one method.',
        'DIP is the PRINCIPLE; Dependency Injection (constructor/setter injection) is a TECHNIQUE to achieve it; IoC containers like Spring automate DI.',
        'DIP makes unit testing easy: pass a mock or in-memory implementation (Day 7).',
        'Spring Data JPA itself follows DIP: your service depends on the StudentRepository interface; Spring creates the implementation.',
      ],
      tip: 'Interview one-liners: SRP = one reason to change; OCP = extend, do not edit; LSP = child can replace parent; ISP = no fat interfaces; DIP = depend on interfaces, not concrete classes.',
    },
    {
      heading: 'Clean Code: Names, Methods and Comments',
      content:
        'Clean code reads like well-written prose. A new team member should understand a method without asking you. Key habits are listed below.',
      points: [
        'Meaningful names: int d; -> int daysSinceJoining; Classes are nouns (InvoicePrinter), methods are verbs (calculateTotal), booleans read as questions (isActive, hasStock).',
        'Follow Java conventions: camelCase for variables/methods, PascalCase for classes, UPPER_SNAKE_CASE for constants.',
        'Small methods that do ONE thing, ideally under 20 lines, at one level of abstraction. Fewer parameters (0-3); more than that suggests a parameter object.',
        'No magic numbers: if (marks >= 35) -> if (marks >= PASS_MARK).',
        'Avoid deep nesting: use guard clauses (if (invalid) return;) at the top.',
        'Comments explain WHY, not WHAT. If you need a comment to explain WHAT, rename or extract a method instead. Delete commented-out code (Git remembers it).',
        'DRY (Do not Repeat Yourself), KISS (Keep It Simple), YAGNI (You Aren\'t Gonna Need It).',
      ],
    },
    {
      heading: 'Code Smells and Refactoring',
      content:
        'A code smell is a sign that something MAY be wrong in the design. Refactoring is changing the internal structure of code WITHOUT changing its behaviour, in small safe steps, with tests running after each step (Martin Fowler). Never refactor without tests.',
      points: [
        'Long Method -> Extract Method.',
        'Large Class / God Class -> Extract Class (SRP).',
        'Duplicate Code -> Extract Method / pull up into a parent class.',
        'Long Parameter List -> Introduce Parameter Object (e.g. a record).',
        'Switch on type repeated everywhere -> Replace Conditional with Polymorphism (OCP).',
        'Primitive Obsession (String phone, String email everywhere) -> small value classes.',
        'Feature Envy (a method uses another class\'s data more than its own) -> Move Method.',
        'Dead Code, Magic Numbers, unclear names -> delete / extract constant / rename.',
        'IDE shortcuts: IntelliJ Ctrl+Alt+M (extract method), Shift+F6 (rename), Ctrl+Alt+C (extract constant), Ctrl+Alt+V (extract variable). Eclipse: Alt+Shift+M, Alt+Shift+R, Alt+Shift+T (refactor menu).',
        'Tools: SonarLint plugin (IntelliJ/Eclipse) and SonarQube in CI highlight smells automatically.',
      ],
    },
  ],
  examples: [
    {
      title: 'SRP: Splitting an Invoice Class with Three Jobs',
      scenario: 'An invoice class calculates GST, formats text and saves to a file. Split it into Invoice, InvoicePrinter and InvoiceRepository.',
      steps: STEPS,
      code: srp,
      java: { files: { 'Main.java': srp } },
      result: `BEFORE:
Saving to invoice.txt -> Invoice for Riya: Rs.1180
AFTER:
Invoice for Amit: Rs.2950
Saving to invoice.txt -> Invoice for Amit: Rs.2950`,
      explanation:
        'Output is identical in spirit, but now a change in GST touches only Invoice, a new layout touches only InvoicePrinter, and moving from file to database touches only InvoiceRepository. GST: 1000*18/100 = 180, 2500*18/100 = 450.',
    },
    {
      title: 'OCP: Replacing an if-else Chain with Discount Policies',
      scenario: 'A shop keeps adding new discount types. Each addition used to require editing the same method.',
      steps: STEPS,
      code: ocp,
      java: { files: { 'Main.java': ocp } },
      result: `Before: PREMIUM 3000 -> 2400
Regular 3000 -> 3000
Premium 3000 -> 2400
Student 3000 -> 2700
Festival 3000 -> 2500`,
      explanation:
        'Checkout depends on the DiscountPolicy interface. The Festival offer was added as a new class, so already-tested classes were not modified (closed for modification) yet behaviour was extended. This is also the Strategy pattern (Day 10).',
    },
    {
      title: 'LSP: Why Square Should Not Extend Rectangle',
      scenario: 'A resize method written for Rectangle gives a wrong answer when it receives a Square.',
      steps: STEPS,
      code: lsp,
      java: { files: { 'Main.java': lsp } },
      result: `Rectangle: expected 20, got 20
Square: expected 20, got 16
--- after fix ---
RectangleShape area = 20
SquareShape area = 16`,
      explanation:
        'For the Square, setWidth(5) makes both sides 5, then setHeight(4) makes both sides 4, so area is 16. The subclass broke the parent\'s behaviour, violating LSP. The fix uses a Shape interface with two independent immutable records, so no caller can be surprised.',
    },
    {
      title: 'ISP: Breaking a Fat Worker Interface',
      scenario: 'A Robot was forced to implement eat(). Split the interface into Workable and Eatable.',
      steps: STEPS,
      code: isp,
      java: { files: { 'Main.java': isp } },
      result: `RobotBefore welding
Problem: Robots do not eat
--- after ISP ---
Human coding
Robot welding
Human having lunch`,
      explanation:
        'With the fat interface, calling eat() on a robot compiles but fails at runtime. After segregation, Robot implements only Workable, so the compiler itself prevents putting a robot in the canteen list.',
    },
    {
      title: 'DIP: Depend on an Interface and Inject the Implementation',
      scenario: 'OrderService was hard-wired to MySQL. Make it work with MySQL in production and an in-memory store in tests.',
      steps: STEPS,
      code: dip,
      java: { files: { 'Main.java': dip } },
      result: `MySQL INSERT pizza
--- after DIP ---
MySQL INSERT PIZZA
Memory add BURGER
Memory add PASTA
prod orders = 1, test orders = 2`,
      explanation:
        'OrderService no longer uses new for its dependency; it receives an OrderRepository in the constructor. Swapping MySQL for an in-memory list needs zero changes to OrderService. Spring\'s @Autowired constructor injection does exactly this wiring for you.',
    },
    {
      title: 'Clean Code Refactoring: Removing Smells Without Changing Behaviour',
      scenario: 'A cryptic utility method with short names and magic numbers is refactored into small, well-named methods.',
      steps: [
        'Run the BEFORE version first and note the output',
        'Refactor step by step in IntelliJ: Shift+F6 to rename, Ctrl+Alt+C for PASS_MARK, Ctrl+Alt+M to extract methods (Eclipse: Alt+Shift+R / Alt+Shift+M)',
        'Run after every step: the output must stay the same',
      ],
      code: clean,
      java: { files: { 'Main.java': clean } },
      result: `Before: 3 passed, avg 78 (good)
After : 3 passed, avg 78 (good)
After : none`,
      explanation:
        'Passed marks are 80, 65 and 90 (20 and 34 are below 35). Sum 235 / 3 = 78 with integer division, and 78 >= 75 gives "(good)". Both versions print the same text - that is the definition of refactoring. The new version reads like English: count passed, compute average, add remark.',
    },
  ],
  interview: [
    {
      q: 'What does SOLID stand for?',
      a: 'Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation and Dependency Inversion - five object-oriented design principles for maintainable, flexible code.',
      level: 'Easy',
    },
    {
      q: 'Explain the Single Responsibility Principle with an example.',
      a: 'A class should have only one reason to change. Example: split an Employee class that calculates salary, generates reports and saves to DB into SalaryCalculator, ReportGenerator and EmployeeRepository.',
      level: 'Easy',
    },
    {
      q: 'How do you achieve the Open/Closed Principle in Java?',
      a: 'Program to interfaces/abstract classes and use polymorphism: new behaviour is added as a new implementation class (or lambda) instead of editing existing if-else chains. Strategy, Decorator and Template Method patterns support OCP.',
      level: 'Medium',
    },
    {
      q: 'What is the Liskov Substitution Principle? Give a violation.',
      a: 'Subtypes must be substitutable for their base types without altering correctness. Violations: Square extends Rectangle (setters change both sides), Ostrich extends Bird with fly() throwing an exception, a subclass method that throws UnsupportedOperationException.',
      level: 'Medium',
    },
    {
      q: 'What is the Interface Segregation Principle?',
      a: 'Clients should not be forced to depend on methods they do not use. Prefer many small, role-specific interfaces over one fat interface.',
      level: 'Easy',
    },
    {
      q: 'Difference between Dependency Inversion, Dependency Injection and Inversion of Control?',
      a: 'DIP is a design principle: depend on abstractions. Dependency Injection is a technique: supply dependencies from outside (constructor/setter). IoC is the broader idea that a framework controls object creation and flow; the Spring IoC container performs DI to achieve DIP.',
      level: 'Hard',
    },
    {
      q: 'How does Spring help follow SOLID?',
      a: 'Layered beans (Controller/Service/Repository) encourage SRP; injecting interfaces supports DIP and OCP (add a new @Component implementation); small interfaces like Converter, Validator follow ISP; AOP keeps cross-cutting concerns out of business classes (SRP).',
      level: 'Medium',
    },
    {
      q: 'What is a code smell? Name five.',
      a: 'A surface indication of a deeper design problem. Examples: long method, large/god class, duplicate code, long parameter list, switch statements on type, primitive obsession, feature envy, magic numbers, dead code.',
      level: 'Easy',
    },
    {
      q: 'What is refactoring and what is its precondition?',
      a: 'Changing the internal structure of code to improve readability/design without changing external behaviour. Precondition: a good set of automated tests, run after every small step.',
      level: 'Medium',
    },
    {
      q: 'What are DRY, KISS and YAGNI?',
      a: 'DRY: every piece of knowledge should exist in one place. KISS: prefer the simplest solution. YAGNI: do not build features until they are actually needed.',
      level: 'Easy',
    },
    {
      q: 'Is it always right to apply SOLID strictly?',
      a: 'No. Over-applying creates too many tiny classes and interfaces (over-engineering). Apply principles where change is likely; balance with KISS and YAGNI.',
      level: 'Hard',
    },
  ],
  practice: [
    {
      task: 'A UserManager class validates an email, saves the user to a list and sends a welcome mail. Refactor it following SRP into UserValidator, UserStore, WelcomeMailer and a coordinating RegistrationService.',
      hint: 'Each new class should have exactly one reason to change.',
      solution: pr1,
    },
    {
      task: 'Write an AreaCalculator that totals the area of a list of shapes. Then add a Triangle without modifying AreaCalculator (OCP).',
      hint: 'Use a Shape interface with int area(); triangle area = base * height / 2.',
      solution: pr2,
    },
    {
      task: 'Design printer interfaces following ISP so that a basic printer does not need scan() or fax(), while an office machine supports all three.',
      hint: 'Create Printer, Scanner2 and Fax interfaces; a class can implement several.',
      solution: pr3,
    },
    {
      task: 'A Switch class creates a LightBulb with new. Apply DIP so the same Switch can control a Fan as well.',
      hint: 'Introduce a Switchable interface and pass it through the constructor.',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which principle says "a class should have only one reason to change"?',
      options: ['Open/Closed', 'Single Responsibility', 'Liskov Substitution', 'Dependency Inversion'],
      answer: 1,
      explanation: 'That is the definition of SRP.',
    },
    {
      question: 'Square extends Rectangle and changes both sides in setWidth(). Which principle is violated?',
      options: ['ISP', 'SRP', 'DIP', 'LSP'],
      answer: 3,
      explanation: 'Square cannot be substituted for Rectangle without surprising callers.',
    },
    {
      question: 'Replacing a long if-else on customer type with an interface and one class per type mainly supports...',
      options: ['Open/Closed Principle', 'Interface Segregation', 'YAGNI', 'Encapsulation only'],
      answer: 0,
      explanation: 'New types are added as new classes without editing existing code.',
    },
    {
      question: 'OrderService(OrderRepository repo) instead of new MySqlRepository() inside the class is an example of...',
      options: ['LSP', 'SRP', 'Dependency Inversion via constructor injection', 'Method overloading'],
      answer: 2,
      explanation: 'The high-level class depends on an abstraction supplied from outside.',
    },
    {
      question: 'Which refactoring best fixes a 150-line method?',
      options: ['Add more comments', 'Extract Method', 'Make it static', 'Rename the class'],
      answer: 1,
      explanation: 'Break the long method into small well-named methods.',
    },
  ],
};
