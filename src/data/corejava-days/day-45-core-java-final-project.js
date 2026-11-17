const p1Grade = `public enum Grade {
    A(85), B(70), C(50), F(0);

    private final int minMarks;

    Grade(int minMarks) {
        this.minMarks = minMarks;
    }

    public static Grade fromMarks(int marks) {
        for (Grade g : values()) {
            if (marks >= g.minMarks) return g;
        }
        return F;
    }
}`;

const p1Student = `import java.util.Objects;

public class Student {
    private final int id;
    private final String name;
    private final String course;
    private int marks;

    public Student(int id, String name, String course, int marks) {
        validateMarks(marks);
        this.id = id;
        this.name = name;
        this.course = course;
        this.marks = marks;
    }

    private static void validateMarks(int marks) {
        if (marks < 0 || marks > 100) {
            throw new IllegalArgumentException("Marks must be between 0 and 100");
        }
    }

    public int getId() { return id; }
    public String getName() { return name; }
    public String getCourse() { return course; }
    public int getMarks() { return marks; }

    public void setMarks(int marks) {
        validateMarks(marks);
        this.marks = marks;
    }

    public Grade getGrade() { return Grade.fromMarks(marks); }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Student other)) return false;
        return id == other.id;
    }

    @Override
    public int hashCode() { return Objects.hash(id); }

    @Override
    public String toString() {
        return String.format("%-4d %-7s %-7s %5d  %s", id, name, course, marks, getGrade());
    }
}`;

const p1StudentNotFoundException = `public class StudentNotFoundException extends Exception {
    public StudentNotFoundException(int id) {
        super("Student with id " + id + " not found");
    }
}`;

const p1StudentService = `import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.TreeMap;
import java.util.stream.Collectors;

public class StudentService {
    private final Map<Integer, Student> students = new LinkedHashMap<>();

    public void add(Student s) {
        if (students.containsKey(s.getId())) {
            throw new IllegalArgumentException("Duplicate id " + s.getId());
        }
        students.put(s.getId(), s);
    }

    public Student find(int id) throws StudentNotFoundException {
        Student s = students.get(id);
        if (s == null) throw new StudentNotFoundException(id);
        return s;
    }

    public void updateMarks(int id, int marks) throws StudentNotFoundException {
        find(id).setMarks(marks);
    }

    public void delete(int id) throws StudentNotFoundException {
        if (students.remove(id) == null) throw new StudentNotFoundException(id);
    }

    public List<Student> listByMarks() {
        return students.values().stream()
                .sorted(Comparator.comparingInt(Student::getMarks).reversed()
                        .thenComparing(Student::getName))
                .toList();
    }

    public Optional<Student> topper() {
        return students.values().stream().max(Comparator.comparingInt(Student::getMarks));
    }

    public double average() {
        return students.values().stream().mapToInt(Student::getMarks).average().orElse(0);
    }

    public Map<String, Long> countByCourse() {
        return students.values().stream()
                .collect(Collectors.groupingBy(Student::getCourse, TreeMap::new, Collectors.counting()));
    }

    public int size() { return students.size(); }
}`;

const p1Main = `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        StudentService service = new StudentService();
        Scanner sc = new Scanner(System.in);
        System.out.println("=== Student Management System ===");
        System.out.println("Commands: add id name course marks | list | find id | update id marks | delete id | report | exit");

        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            if (line.isEmpty()) continue;
            System.out.println("> " + line);            // echo the command
            String[] p = line.split(" ");
            try {
                switch (p[0].toLowerCase()) {
                    case "add" -> {
                        service.add(new Student(Integer.parseInt(p[1]), p[2], p[3], Integer.parseInt(p[4])));
                        System.out.println("Added " + p[2]);
                    }
                    case "list" -> {
                        System.out.println(String.format("%-4s %-7s %-7s %5s  %s", "ID", "NAME", "COURSE", "MARKS", "GRADE"));
                        service.listByMarks().forEach(System.out::println);
                    }
                    case "find" -> System.out.println("Found: " + service.find(Integer.parseInt(p[1])).getName());
                    case "update" -> {
                        service.updateMarks(Integer.parseInt(p[1]), Integer.parseInt(p[2]));
                        System.out.println("Updated marks of " + p[1]);
                    }
                    case "delete" -> {
                        service.delete(Integer.parseInt(p[1]));
                        System.out.println("Deleted " + p[1]);
                    }
                    case "report" -> {
                        System.out.println("Total students: " + service.size());
                        System.out.printf("Average marks: %.2f%n", service.average());
                        service.topper().ifPresent(t ->
                                System.out.println("Topper: " + t.getName() + " (" + t.getMarks() + ")"));
                        System.out.println("By course: " + service.countByCourse());
                    }
                    case "exit" -> {
                        System.out.println("Goodbye!");
                        return;
                    }
                    default -> System.out.println("Unknown command: " + p[0]);
                }
            } catch (StudentNotFoundException e) {
                System.out.println("Error: " + e.getMessage());
            } catch (NumberFormatException e) {
                System.out.println("Error: id and marks must be numbers");
            } catch (ArrayIndexOutOfBoundsException e) {
                System.out.println("Error: missing values in command");
            } catch (IllegalArgumentException e) {
                System.out.println("Error: " + e.getMessage());
            }
        }
    }
}`;

const p2InsufficientFundsException = `public class InsufficientFundsException extends Exception {
    private final double shortBy;

    public InsufficientFundsException(String message, double shortBy) {
        super(message);
        this.shortBy = shortBy;
    }

    public double getShortBy() { return shortBy; }
}`;

const p2Account = `import java.util.ArrayList;
import java.util.List;

public abstract class Account {
    private static int nextNumber = 1001;          // shared by all accounts

    private final int accountNo;
    private final String holder;
    protected double balance;
    private final List<String> history = new ArrayList<>();

    protected Account(String holder, double openingBalance) {
        this.accountNo = nextNumber++;
        this.holder = holder;
        this.balance = openingBalance;
        history.add("OPEN " + openingBalance);
    }

    public void deposit(double amount) {
        if (amount <= 0) throw new IllegalArgumentException("Deposit must be positive");
        balance += amount;
        history.add("DEPOSIT " + amount);
    }

    public void withdraw(double amount) throws InsufficientFundsException {
        double available = balance + overdraftLimit();
        if (amount > available) {
            throw new InsufficientFundsException(
                    "Account " + accountNo + " cannot withdraw " + amount, amount - available);
        }
        balance -= amount;
        history.add("WITHDRAW " + amount);
    }

    protected abstract double overdraftLimit();   // each type decides
    public abstract double monthlyInterest();
    public abstract String type();

    public int getAccountNo() { return accountNo; }
    public String getHolder() { return holder; }
    public double getBalance() { return balance; }
    public List<String> getHistory() { return List.copyOf(history); }   // read-only copy

    @Override
    public String toString() {
        return String.format("%s #%d %s balance=%.2f", type(), accountNo, holder, balance);
    }
}`;

const p2SavingsAccount = `public class SavingsAccount extends Account {
    private static final double ANNUAL_RATE = 0.06;

    public SavingsAccount(String holder, double openingBalance) {
        super(holder, openingBalance);
    }

    @Override
    protected double overdraftLimit() { return 0; }

    @Override
    public double monthlyInterest() { return balance * ANNUAL_RATE / 12; }

    @Override
    public String type() { return "SAVINGS"; }
}`;

const p2CurrentAccount = `public class CurrentAccount extends Account {
    public CurrentAccount(String holder, double openingBalance) {
        super(holder, openingBalance);
    }

    @Override
    protected double overdraftLimit() { return 5000; }

    @Override
    public double monthlyInterest() { return 0; }

    @Override
    public String type() { return "CURRENT"; }
}`;

const p2Main = `import java.util.List;

public class Main {
    static void transfer(Account from, Account to, double amount) throws InsufficientFundsException {
        from.withdraw(amount);       // if this fails, deposit never happens
        to.deposit(amount);
        System.out.println("Transferred " + amount + " from #" + from.getAccountNo() + " to #" + to.getAccountNo());
    }

    public static void main(String[] args) {
        Account riya = new SavingsAccount("Riya", 10000);
        Account aman = new CurrentAccount("Aman", 2000);

        riya.deposit(2000);
        try {
            transfer(riya, aman, 3000);
            aman.withdraw(6500);                       // uses overdraft
            System.out.println("Aman used overdraft, balance: " + aman.getBalance());
            riya.withdraw(50000);                      // fails
        } catch (InsufficientFundsException e) {
            System.out.println("Error: " + e.getMessage() + " (short by " + e.getShortBy() + ")");
        }

        try {
            riya.deposit(-100);
        } catch (IllegalArgumentException e) {
            System.out.println("Error: " + e.getMessage());
        }

        List<Account> accounts = List.of(riya, aman);
        System.out.println("--- Accounts ---");
        for (Account a : accounts) {                   // runtime polymorphism
            System.out.println(a);
            System.out.printf("  Monthly interest: %.2f%n", a.monthlyInterest());
        }
        System.out.println("Riya history: " + riya.getHistory());
        double total = accounts.stream().mapToDouble(Account::getBalance).sum();
        System.out.println("Bank total: " + total);
    }
}`;

const p3Main = `class Parent {
    String name = "Parent";
    static String greet() { return "static Parent"; }
    void show() { System.out.println("Q9: show() of Parent"); }
}

class Child extends Parent {
    String name = "Child";
    static String greet() { return "static Child"; }
    @Override
    void show() { System.out.println("Q9: show() of Child"); }
}

public class Main {
    static int test() {
        try {
            return 1;
        } finally {
            System.out.println("Q7: finally runs before the method returns");
        }
    }

    static void change(StringBuilder sb, String s, int n) {
        sb.append("d");
        s = s + "d";
        n = n + 1;
    }

    public static void main(String[] args) {
        String s1 = "Java";
        String s2 = "Ja" + "va";                 // compile-time constant -> pool
        String s3 = new String("Java");
        System.out.println("Q1: " + (s1 == s2) + " " + (s1 == s3) + " " + s1.equals(s3));

        Integer a = 127, b = 127, c = 128, d = 128;
        System.out.println("Q2: " + (a == b) + " " + (c == d) + " " + c.equals(d));

        int x = 5;
        int y = x++ + ++x;                       // 5 + 7
        System.out.println("Q3: x=" + x + " y=" + y);

        System.out.println("Q4: " + 1 + 2 + " " + (1 + 2) + " " + ('a' + 1));

        System.out.println("Q5: " + 10 / 3 + " " + 10 % 3 + " " + -7 / 2 + " " + -7 % 2);

        char ch = 'A';
        ch += 2;
        System.out.println("Q6: " + ch + " " + (int) ch);

        System.out.println("Q7 result: " + test());

        StringBuilder sb = new StringBuilder("abc");
        String str = "abc";
        int num = 10;
        change(sb, str, num);
        System.out.println("Q8: " + sb + " " + str + " " + num);

        Parent p = new Child();
        p.show();
        System.out.println("Q10: " + p.name + " " + p.greet());

        System.out.println("Q11: " + Math.round(2.5) + " " + Math.round(-2.5) + " " + (0.1 + 0.2 == 0.3));

        int[] arr = new int[3];
        boolean[] flags = new boolean[2];
        String[] names = new String[2];
        System.out.println("Q12: " + arr[0] + " " + flags[1] + " " + names[0]);
    }
}`;

const p4Main = `import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

record Order(int id, String customer, String category, double amount, LocalDate date) { }

public class Main {
    public static void main(String[] args) {
        List<Order> orders = List.of(
                new Order(1, "Riya", "Electronics", 25000, LocalDate.of(2024, 1, 5)),
                new Order(2, "Aman", "Books", 800, LocalDate.of(2024, 1, 9)),
                new Order(3, "Riya", "Books", 1200, LocalDate.of(2024, 2, 2)),
                new Order(4, "Zoya", "Fashion", 3500, LocalDate.of(2024, 2, 14)),
                new Order(5, "Aman", "Electronics", 15000, LocalDate.of(2024, 3, 1)),
                new Order(6, "Zoya", "Books", 600, LocalDate.of(2024, 3, 20)));

        // T1: total revenue
        double revenue = orders.stream().mapToDouble(Order::amount).sum();
        System.out.println("T1 Total revenue: " + revenue);

        // T2: revenue per category (sorted)
        Map<String, Double> byCategory = orders.stream()
                .collect(Collectors.groupingBy(Order::category, TreeMap::new,
                        Collectors.summingDouble(Order::amount)));
        System.out.println("T2 By category: " + byCategory);

        // T3: best customer
        Map<String, Double> byCustomer = orders.stream()
                .collect(Collectors.groupingBy(Order::customer, TreeMap::new,
                        Collectors.summingDouble(Order::amount)));
        String best = byCustomer.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse("none");
        System.out.println("T3 Spend per customer: " + byCustomer + ", best: " + best);

        // T4: orders above 1000 sorted by amount desc, only ids
        List<Integer> bigOrders = orders.stream()
                .filter(o -> o.amount() > 1000)
                .sorted(Comparator.comparingDouble(Order::amount).reversed())
                .map(Order::id)
                .toList();
        System.out.println("T4 Orders > 1000: " + bigOrders);

        // T5: orders per month
        Map<Integer, Long> perMonth = orders.stream()
                .collect(Collectors.groupingBy(o -> o.date().getMonthValue(), TreeMap::new, Collectors.counting()));
        System.out.println("T5 Orders per month: " + perMonth);

        // T6: average Books order and distinct customers
        double avgBooks = orders.stream().filter(o -> o.category().equals("Books"))
                .mapToDouble(Order::amount).average().orElse(0);
        String customers = orders.stream().map(Order::customer).distinct().sorted()
                .collect(Collectors.joining(", "));
        System.out.println("T6 Avg Books order: " + avgBooks + ", customers: " + customers);
    }
}`;

const p5Main = `import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

public class Main {
    static final AtomicInteger processed = new AtomicInteger();

    record Invoice(String customer, int qty, double price) { }

    static Callable<Double> billTask(Invoice inv) {
        return () -> {
            Thread.sleep(100);                              // simulate slow tax service
            double subtotal = inv.qty() * inv.price();
            double tax = subtotal * 0.18;
            processed.incrementAndGet();
            return subtotal + tax;
        };
    }

    public static void main(String[] args) throws Exception {
        List<Invoice> invoices = List.of(
                new Invoice("Riya", 2, 500),
                new Invoice("Aman", 1, 1200),
                new Invoice("Zoya", 5, 100),
                new Invoice("Kabir", 3, 250));

        ExecutorService pool = Executors.newFixedThreadPool(4);
        long start = System.currentTimeMillis();
        List<Future<Double>> futures = new ArrayList<>();
        for (Invoice inv : invoices) futures.add(pool.submit(billTask(inv)));

        double grandTotal = 0;
        for (int i = 0; i < invoices.size(); i++) {
            double amount = futures.get(i).get();          // results in submission order
            System.out.printf("%-6s pays %.2f%n", invoices.get(i).customer(), amount);
            grandTotal += amount;
        }
        long took = System.currentTimeMillis() - start;
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        System.out.printf("Grand total: %.2f%n", grandTotal);
        System.out.println("Invoices processed: " + processed.get());
        System.out.println("Parallel (faster than 400 ms sequential): " + (took < 350));
    }
}`;

const p6Main = `import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

public class Main {
    record Student(int id, String name, int marks) {
        String toCsv() { return id + "," + name + "," + marks; }

        static Student fromCsv(String line) {
            String[] p = line.split(",");
            return new Student(Integer.parseInt(p[0].trim()), p[1].trim(), Integer.parseInt(p[2].trim()));
        }
    }

    static final Path FILE = Path.of("students.csv");

    static void save(List<Student> list) throws IOException {
        List<String> lines = new ArrayList<>();
        lines.add("id,name,marks");                          // header
        for (Student s : list) lines.add(s.toCsv());
        Files.write(FILE, lines);
    }

    static List<Student> load() throws IOException {
        List<Student> result = new ArrayList<>();
        if (Files.notExists(FILE)) return result;
        List<String> lines = Files.readAllLines(FILE);
        for (int i = 1; i < lines.size(); i++) {             // skip header
            try {
                result.add(Student.fromCsv(lines.get(i)));
            } catch (RuntimeException e) {
                System.out.println("Skipping bad line " + (i + 1) + ": " + lines.get(i));
            }
        }
        return result;
    }

    public static void main(String[] args) throws IOException {
        System.out.println("Loaded before save: " + load().size());

        save(List.of(new Student(101, "Riya", 88), new Student(102, "Aman", 75)));
        Files.writeString(FILE, "103,Zoya,abc" + System.lineSeparator(), java.nio.file.StandardOpenOption.APPEND);
        Files.writeString(FILE, "104,Neha,91" + System.lineSeparator(), java.nio.file.StandardOpenOption.APPEND);
        System.out.println("File lines: " + Files.readAllLines(FILE).size());

        List<Student> loaded = load();
        System.out.println("Loaded after save: " + loaded.size());
        loaded.forEach(s -> System.out.println(s.id() + " " + s.name() + " " + s.marks()));

        Files.deleteIfExists(FILE);
        System.out.println("File removed: " + Files.notExists(FILE));
    }
}`;

const p1Code = `// ===== Grade.java =====
${p1Grade}

// ===== Student.java =====
${p1Student}

// ===== StudentNotFoundException.java =====
${p1StudentNotFoundException}

// ===== StudentService.java =====
${p1StudentService}

// ===== Main.java =====
${p1Main}`;

const p2Code = `// ===== InsufficientFundsException.java =====
${p2InsufficientFundsException}

// ===== Account.java =====
${p2Account}

// ===== SavingsAccount.java =====
${p2SavingsAccount}

// ===== CurrentAccount.java =====
${p2CurrentAccount}

// ===== Main.java =====
${p2Main}`;

export default {
  id: 'day-45-core-java-final-project',
  title: 'Core Java Final Project, Practical Test, Interview Questions',
  module: 'Module 8: I/O, JVM & Interview Prep',
  day: 45,
  level: 'Advanced',
  duration: '4 hours',
  summary: 'Bring all 45 days together: build a multi-file console Student Management System and a Banking System using OOP, collections, exceptions, enums, streams, records, file handling and concurrency. Then take a timed practical test (output prediction + coding tasks) and revise 30 must-know Core Java interview questions.',
  objectives: [
    'Design and build a layered, multi-class console application in Core Java',
    'Apply OOP (encapsulation, inheritance, abstraction, polymorphism) in a real project',
    'Combine collections, streams, Optional, enums, records and custom exceptions',
    'Add file persistence and concurrent processing to a project',
    'Solve a practical test and answer the most common Core Java interview questions confidently',
  ],
  theory: [
    {
      heading: 'Project Overview: Student Management System (Console)',
      content: 'Our final project is a command-driven console app that a college office could use to manage students. The user types commands such as "add 101 Riya Java 88" or "report", and the app validates input, stores data, and prints reports. It is small enough to finish in a day but touches almost every Core Java topic, which makes it a perfect portfolio and interview discussion project.',
      points: [
        'Features: add, list (sorted by marks), find by id, update marks, delete, report (count, average, topper, students per course), exit',
        'Validation: duplicate id, marks 0-100, non-numeric input, missing values, unknown commands',
        'Extensions (practice): save/load to CSV, search by name, export report, grade statistics',
        'Run: put all .java files in one folder (IntelliJ: src folder; Eclipse: src folder of a Java Project), run Main',
      ],
    },
    {
      heading: 'Layered Design (How the Classes Fit Together)',
      content: 'Good projects separate responsibilities, like a restaurant where the waiter (UI) takes orders, the chef (service) cooks, and the store room (data) keeps ingredients. If the waiter also cooked, everything would become messy. Our design in words: Main (UI layer: reads commands, prints output) --> StudentService (business layer: rules, searching, reports) --> Map<Integer, Student> (data layer: storage). Student is the model, Grade is an enum, StudentNotFoundException is a custom checked exception.',
      syntax: `Main  --uses-->  StudentService  --stores-->  LinkedHashMap<Integer, Student>
                         |                                   |
                 throws StudentNotFoundException       Student --has--> Grade (enum)`,
      points: [
        'Single Responsibility: each class has one job',
        'Encapsulation: fields are private; marks can change only through setMarks() with validation',
        'Main never touches the Map directly — only service methods',
        'Later (Spring Boot) the same idea becomes Controller -> Service -> Repository',
      ],
    },
    {
      heading: 'Core Java Concepts Used in the Projects',
      content: 'Use this map to explain your project in an interview: for each feature, say which concept you applied and why.',
      points: [
        'Classes, objects, constructors, this, encapsulation -> Student, Account',
        'Inheritance, abstract classes, method overriding, runtime polymorphism -> Account, SavingsAccount, CurrentAccount',
        'static members -> account number generator shared by all accounts',
        'Enums with fields and static methods -> Grade.fromMarks()',
        'equals() and hashCode() -> Student equality by id',
        'Custom checked exceptions, multi-catch order, try-catch -> StudentNotFoundException, InsufficientFundsException',
        'Collections: LinkedHashMap (keeps insertion order), List.copyOf (read-only view), TreeMap (sorted report)',
        'Streams, Comparator chaining, Optional, Collectors.groupingBy -> listByMarks(), topper(), countByCourse()',
        'Switch expressions, records, var, text formatting with String.format/printf -> Main, Order, Invoice',
        'File handling with java.nio.file.Files -> CSV save/load; ExecutorService + Future + AtomicInteger -> billing',
      ],
    },
    {
      heading: 'Practical Test (90 minutes, 100 marks)',
      content: 'Attempt this test before looking at the solved examples. Part A checks concepts by predicting output; Part B checks coding speed and correctness. Write code in IntelliJ or Eclipse without internet help.',
      points: [
        'Part A — Output prediction (12 x 2 = 24 marks): String pool, Integer cache, x++ + ++x, string concatenation order, integer division/modulo with negatives, char arithmetic, finally vs return, pass-by-value, overriding vs hiding, Math.round, default array values (solved in Example 3)',
        'Part B — Stream tasks on an Order list (6 x 6 = 36 marks): total revenue, revenue per category, best customer, filtered sorted ids, orders per month, average + distinct customers (solved in Example 4)',
        'Part C — Concurrency (10 marks): bill 4 invoices in parallel with ExecutorService and print results in order (Example 5)',
        'Part D — File handling (10 marks): save and load students to CSV, skipping bad lines (Example 6)',
        'Part E — Mini project (20 marks): add a "search name" command and a "save" command to the Student Management System (Practice tasks)',
        'Scoring tip: correct output with clean code and exception handling scores full marks; hard-coded output scores zero',
      ],
    },
    {
      heading: 'Interview Preparation Strategy',
      content: 'Interviewers for Java freshers usually go: introduction -> project explanation -> Core Java concepts -> output questions -> 1-2 coding programs -> collections/Java 8 -> (for full stack) SQL, Spring Boot. Prepare a 2-minute project explanation: problem, features, classes, concepts used, a challenge you solved (for example, choosing a checked exception for "not found" and validating marks), and what you would add next.',
      points: [
        'Revise definitions in one line each: OOP pillars, JDK/JRE/JVM, overloading vs overriding, abstract class vs interface, == vs equals, String vs StringBuilder, checked vs unchecked, HashMap internals, Comparable vs Comparator',
        'Practise writing code on paper/whiteboard without IDE help',
        'For output questions, trace line by line and write variable values',
        'Be honest: "I have not used that yet, but I believe it works like..." is better than guessing confidently',
        'Push your projects to GitHub with a README and screenshots',
      ],
      tip: 'The questions below are the 30 most frequently asked Core Java questions. Read them aloud until you can answer each in under 60 seconds.',
    },
    {
      heading: 'Common Mistakes Checklist Before You Submit Any Program',
      content: 'Run through this checklist for every project or test answer — it catches most bugs freshers make.',
      points: [
        'Mixing nextInt() and nextLine() in Scanner (leftover newline) — read whole lines and parse',
        'Comparing Strings or wrapper objects with == instead of equals()',
        'Forgetting break in old-style switch (use arrow switch)',
        'Integer division when you need decimals (10 / 4 = 2, use 10 / 4.0)',
        'Not closing resources (use try-with-resources)',
        'Catching Exception everywhere and hiding real errors; catch specific exceptions, subclass before superclass',
        'Modifying a list while iterating with for-each (ConcurrentModificationException) — use removeIf or Iterator',
        'Overriding equals() without hashCode()',
        'Shared mutable data across threads without synchronization; forgetting pool.shutdown()',
      ],
    },
  ],
  examples: [
    {
      title: 'Final Project: Student Management System (multi-file console app)',
      scenario: 'A college office manages students through text commands. The program validates every input, keeps students in insertion order, lists them sorted by marks, and prints a report. The sample input below is typed by the user (it is also supplied as stdin).',
      steps: [
        'IntelliJ: File > New > Project > Java (JDK 21) > name it StudentManagement > Create',
        'Right-click src > New > Java Class: create Grade (choose Enum), Student, StudentNotFoundException, StudentService and Main',
        'Paste each file\'s code (the code panel shows all five files separated by comments)',
        'Eclipse: File > New > Java Project > StudentManagement; right-click src > New > Class / Enum for each file',
        'Click Run ▶ on Main and type commands one per line, e.g. add 101 Riya Java 88, list, report, exit',
      ],
      code: p1Code,
      java: {
        files: {
          'Grade.java': p1Grade,
          'Student.java': p1Student,
          'StudentNotFoundException.java': p1StudentNotFoundException,
          'StudentService.java': p1StudentService,
          'Main.java': p1Main,
        },
        stdin: 'add 101 Riya Java 88\nadd 102 Aman Python 67\nadd 103 Zoya Java 92\nadd 101 Dup Java 50\nadd 104 Kabir Python abc\nadd 104 Kabir\nadd 104 Kabir Python 150\nlist\nfind 102\nfind 999\nupdate 102 75\ndelete 103\nadd 105 Neha Web 45\nlist\nreport\nhello\nexit\n',
      },
      result: `=== Student Management System ===
Commands: add id name course marks | list | find id | update id marks | delete id | report | exit
> add 101 Riya Java 88
Added Riya
> add 102 Aman Python 67
Added Aman
> add 103 Zoya Java 92
Added Zoya
> add 101 Dup Java 50
Error: Duplicate id 101
> add 104 Kabir Python abc
Error: id and marks must be numbers
> add 104 Kabir
Error: missing values in command
> add 104 Kabir Python 150
Error: Marks must be between 0 and 100
> list
ID   NAME    COURSE  MARKS  GRADE
103  Zoya    Java       92  A
101  Riya    Java       88  A
102  Aman    Python     67  C
> find 102
Found: Aman
> find 999
Error: Student with id 999 not found
> update 102 75
Updated marks of 102
> delete 103
Deleted 103
> add 105 Neha Web 45
Added Neha
> list
ID   NAME    COURSE  MARKS  GRADE
101  Riya    Java       88  A
102  Aman    Python     75  B
105  Neha    Web        45  F
> report
Total students: 3
Average marks: 69.33
Topper: Riya (88)
By course: {Java=1, Python=1, Web=1}
> hello
Unknown command: hello
> exit
Goodbye!`,
      explanation: 'Each command line is split into words and handled by an arrow switch. Errors never crash the app: NumberFormatException ("abc"), ArrayIndexOutOfBoundsException (missing values), IllegalArgumentException (duplicate id, marks 150) and the custom checked StudentNotFoundException are caught separately — NumberFormatException is caught BEFORE IllegalArgumentException because it is its subclass. Grade.fromMarks maps 92/88 to A, 75 to B, 67 to C and 45 to F. The list is sorted by marks descending using Comparator chaining, the report uses streams, Optional and groupingBy into a TreeMap. The program echoes each command ("> ...") so the console log is easy to read.',
    },
    {
      title: 'Project 2: Banking System with Abstraction, Polymorphism and Custom Exceptions',
      scenario: 'A bank supports savings accounts (6% annual interest, no overdraft) and current accounts (Rs.5000 overdraft, no interest). Transfers must fail safely when money is insufficient.',
      steps: [
        'Create a new Java project named BankingSystem',
        'Create the classes InsufficientFundsException, Account (abstract), SavingsAccount, CurrentAccount and Main',
        'In IntelliJ, use Code > Generate > Override Methods (Ctrl+O) to implement the abstract methods in subclasses',
        'Run ▶ Main',
      ],
      code: p2Code,
      java: {
        files: {
          'InsufficientFundsException.java': p2InsufficientFundsException,
          'Account.java': p2Account,
          'SavingsAccount.java': p2SavingsAccount,
          'CurrentAccount.java': p2CurrentAccount,
          'Main.java': p2Main,
        },
      },
      result: `Transferred 3000.0 from #1001 to #1002
Aman used overdraft, balance: -1500.0
Error: Account 1001 cannot withdraw 50000.0 (short by 41000.0)
Error: Deposit must be positive
--- Accounts ---
SAVINGS #1001 Riya balance=9000.00
  Monthly interest: 45.00
CURRENT #1002 Aman balance=-1500.00
  Monthly interest: 0.00
Riya history: [OPEN 10000.0, DEPOSIT 2000.0, WITHDRAW 3000.0]
Bank total: 7500.0`,
      explanation: 'Account is abstract and defines the template (deposit, withdraw) while subclasses decide overdraftLimit(), monthlyInterest() and type() — the Template Method idea. A static counter gives unique account numbers. Riya: 10000 + 2000 - 3000 = 9000; interest 9000 x 0.06 / 12 = 45. Aman: 2000 + 3000 - 6500 = -1500 (allowed by the 5000 overdraft). Withdrawing 50000 from Riya fails with a custom checked exception carrying extra data (shortBy = 50000 - 9000 = 41000). getHistory() returns List.copyOf so callers cannot modify the internal list.',
    },
    {
      title: 'Practical Test Part A: Output Prediction (Solved)',
      scenario: 'Twelve classic "what is the output" questions in one program. Write your answers on paper first, then run and compare.',
      steps: ['Create Main.java with the Parent and Child classes in the same file', 'Predict every line before running', 'Click Run ▶ and score 2 marks per correct line'],
      code: p3Main,
      java: { files: { 'Main.java': p3Main } },
      result: `Q1: true false true
Q2: true false true
Q3: x=7 y=12
Q4: 12 3 98
Q5: 3 1 -3 -1
Q6: C 67
Q7: finally runs before the method returns
Q7 result: 1
Q8: abcd abc 10
Q9: show() of Child
Q10: Parent static Parent
Q11: 3 -2 false
Q12: 0 false null`,
      explanation: 'Q1: "Ja" + "va" is a compile-time constant so it is pooled; new String creates a new object. Q2: Integer cache covers -128..127. Q3: x++ gives 5 (x becomes 6), ++x makes 7: 5 + 7 = 12. Q4: left-to-right concatenation gives "12"; (1 + 2) is 3; \'a\' + 1 is int 98. Q5: integer division truncates toward zero; the remainder takes the sign of the dividend. Q6: compound assignment casts back to char. Q7: finally runs before the value is returned (the message prints first). Q8: the StringBuilder object is modified, but String and int are copies. Q9/Q10: methods are overridden (runtime type), but fields and static methods are resolved by reference type (hiding). Q11: Math.round rounds half up (toward positive infinity); 0.1 + 0.2 is 0.30000000000000004. Q12: array defaults are 0, false and null.',
    },
    {
      title: 'Practical Test Part B: Stream Tasks on Orders (Solved)',
      scenario: 'An online shop wants six reports from its order list. Solve each task using the Stream API.',
      steps: ['Create Main.java with the Order record', 'Solve T1 to T6 one by one, running after each', 'Use TreeMap::new in groupingBy so maps print in sorted key order'],
      code: p4Main,
      java: { files: { 'Main.java': p4Main } },
      result: `T1 Total revenue: 46100.0
T2 By category: {Books=2600.0, Electronics=40000.0, Fashion=3500.0}
T3 Spend per customer: {Aman=15800.0, Riya=26200.0, Zoya=4100.0}, best: Riya
T4 Orders > 1000: [1, 5, 4, 3]
T5 Orders per month: {1=2, 2=2, 3=2}
T6 Avg Books order: 866.6666666666666, customers: Aman, Riya, Zoya`,
      explanation: 'mapToDouble().sum() adds all amounts. groupingBy with summingDouble builds category and customer totals; Map.Entry.comparingByValue() finds the best customer (Riya: 25000 + 1200). T4 filters amounts above 1000 and sorts descending: 25000 (1), 15000 (5), 3500 (4), 1200 (3). T5 groups by LocalDate month. T6: Books orders are 800, 1200, 600, average 2600 / 3.',
    },
    {
      title: 'Practical Test Part C: Parallel Invoice Billing (Solved)',
      scenario: 'Four invoices each need a slow tax calculation (100 ms). Bill them in parallel and print results in the original order.',
      steps: ['Create Main.java', 'Submit one Callable per invoice to a fixed pool of 4 threads', 'Collect results with Future.get() in submission order', 'Run ▶'],
      code: p5Main,
      java: { files: { 'Main.java': p5Main } },
      result: `Riya   pays 1180.00
Aman   pays 1416.00
Zoya   pays 590.00
Kabir  pays 885.00
Grand total: 4071.00
Invoices processed: 4
Parallel (faster than 400 ms sequential): true`,
      explanation: 'Threads may finish in any order, but main reads the futures in the order they were submitted, so the printed order is always the same. Each bill = qty x price x 1.18 (e.g. 2 x 500 x 1.18 = 1180). AtomicInteger counts processed invoices safely from multiple threads. Four 100 ms tasks run at the same time, so total time is about 100 ms instead of 400 ms.',
    },
    {
      title: 'Practical Test Part D: Save and Load Students to CSV (Solved)',
      scenario: 'Add persistence to the project: save students to students.csv, append more rows, then load them back while skipping a corrupted line.',
      steps: ['Create Main.java', 'Run ▶ (the CSV file is created in the project folder and removed at the end)', 'Comment out the deleteIfExists line and refresh the project (F5 in Eclipse) to inspect students.csv'],
      code: p6Main,
      java: { files: { 'Main.java': p6Main } },
      result: `Loaded before save: 0
File lines: 5
Skipping bad line 4: 103,Zoya,abc
Loaded after save: 3
101 Riya 88
102 Aman 75
104 Neha 91
File removed: true`,
      explanation: 'save() writes a header plus one CSV line per record. load() skips the header and parses each line; the line "103,Zoya,abc" throws NumberFormatException, which is caught so one bad row does not break the whole import. A nested record with helper methods keeps CSV conversion close to the data.',
    },
  ],
  interview: [
    { q: 'Explain JDK, JRE and JVM.', a: 'JVM executes bytecode and provides platform independence. JRE = JVM + core class libraries needed to run programs. JDK = JRE + development tools like javac, jar, javadoc, jdb. (Since Java 11 a separate JRE is not distributed; you use the JDK or a jlink runtime.)', level: 'Easy' },
    { q: 'Why is Java platform independent but the JVM platform dependent?', a: 'javac compiles to bytecode that any JVM can run ("write once, run anywhere"). Each OS needs its own JVM implementation to translate that bytecode to native instructions.', level: 'Easy' },
    { q: 'What are the four pillars of OOP?', a: 'Encapsulation (hide data behind methods), Inheritance (reuse via is-a), Polymorphism (one interface, many forms: overloading and overriding), Abstraction (show what, hide how via abstract classes/interfaces).', level: 'Easy' },
    { q: 'Method overloading vs overriding?', a: 'Overloading: same name, different parameter list, in the same class, resolved at compile time. Overriding: subclass provides the same signature as the parent method, resolved at runtime (dynamic method dispatch). Return type may be covariant; access cannot be reduced.', level: 'Easy' },
    { q: 'Abstract class vs interface (Java 8+)?', a: 'Abstract class: can have state (instance fields), constructors, any access modifiers; single inheritance. Interface: constants only, abstract/default/static/private methods, multiple inheritance of type. Use interface for capability (Comparable), abstract class for shared base code (Account).', level: 'Medium' },
    { q: 'Why is String immutable? What is the String pool?', a: 'Immutability gives security (paths, URLs, class names), thread safety, safe hashing (cached hashCode) and allows the String pool — a heap area where literals are shared so "Java" exists once.', level: 'Medium' },
    { q: 'String vs StringBuilder vs StringBuffer?', a: 'String is immutable. StringBuilder is mutable and not synchronized (fast, single thread). StringBuffer is mutable and synchronized (thread-safe, slower).', level: 'Easy' },
    { q: '== vs equals()?', a: '== compares references (or primitive values). equals() compares logical content when overridden (String, wrappers, records). Object.equals default is ==.', level: 'Easy' },
    { q: 'What is the equals() and hashCode() contract?', a: 'If two objects are equal by equals(), they must have the same hashCode(). Unequal objects may share a hash code. Breaking it makes HashMap/HashSet fail to find objects.', level: 'Medium' },
    { q: 'What is the use of static and final keywords?', a: 'static: belongs to the class, shared by all objects (static variables, methods, blocks, nested classes). final: variable cannot be reassigned, method cannot be overridden, class cannot be extended.', level: 'Easy' },
    { q: 'Is Java pass-by-value or pass-by-reference?', a: 'Always pass-by-value. For objects, the value of the reference is copied, so methods can change the object\'s state but cannot make the caller\'s variable point to a new object.', level: 'Medium' },
    { q: 'Checked vs unchecked exceptions?', a: 'Checked exceptions (IOException, SQLException, custom exceptions extending Exception) must be caught or declared with throws; checked at compile time. Unchecked (RuntimeException subclasses like NullPointerException, ArithmeticException) are not enforced.', level: 'Easy' },
    { q: 'throw vs throws?', a: 'throw is a statement that throws an exception object: throw new X(). throws is in a method signature declaring which checked exceptions the method may pass to its caller.', level: 'Easy' },
    { q: 'final vs finally vs finalize?', a: 'final: keyword for constants, non-overridable methods, non-inheritable classes. finally: block that always runs after try/catch (except System.exit or JVM crash). finalize(): deprecated Object method once called by GC before reclaiming an object.', level: 'Easy' },
    { q: 'What is try-with-resources?', a: 'A try statement that declares AutoCloseable resources; they are closed automatically in reverse order, even if an exception occurs. Suppressed exceptions are available via getSuppressed().', level: 'Medium' },
    { q: 'What is autoboxing and the Integer cache?', a: 'Autoboxing converts primitives to wrappers automatically (int -> Integer) and unboxing does the reverse. Integer.valueOf caches -128 to 127, so == on two boxed 127s is true but on 128s is false.', level: 'Medium' },
    { q: 'How does HashMap work internally?', a: 'An array of buckets. key.hashCode() is spread and mapped to a bucket index; entries with the same index form a linked list, converted to a red-black tree when a bucket exceeds 8 entries (and capacity >= 64). equals() finds the exact key. Default capacity 16, load factor 0.75; resizing doubles capacity.', level: 'Hard' },
    { q: 'ArrayList vs LinkedList?', a: 'ArrayList: dynamic array, O(1) random access, slower inserts/removals in the middle. LinkedList: doubly linked list, O(n) access, O(1) insert/remove at known node or ends. ArrayList is usually the default choice.', level: 'Medium' },
    { q: 'Comparable vs Comparator?', a: 'Comparable (compareTo) defines natural ordering inside the class itself. Comparator (compare) defines external, multiple custom orderings, e.g. Comparator.comparing(Student::getMarks).reversed().', level: 'Medium' },
    { q: 'What are generics and type erasure?', a: 'Generics provide compile-time type safety with type parameters (List<String>). Type erasure removes generic information at runtime, replacing it with Object or bounds.', level: 'Medium' },
    { q: 'Thread vs Runnable vs Callable?', a: 'Thread is the worker; Runnable is a task without result; Callable is a task that returns a value and can throw checked exceptions, used with ExecutorService and Future.', level: 'Medium' },
    { q: 'What is synchronization and what is a deadlock?', a: 'Synchronization ensures only one thread at a time executes a critical section guarded by the same lock. Deadlock is when threads wait forever for locks held by each other; avoid it with consistent lock ordering or tryLock timeouts.', level: 'Medium' },
    { q: 'What is volatile?', a: 'A field modifier guaranteeing visibility of writes across threads and preventing certain reorderings; it does not make compound operations atomic.', level: 'Hard' },
    { q: 'What is a functional interface and a lambda?', a: 'A functional interface has exactly one abstract method (Runnable, Comparator, Predicate). A lambda is a concise anonymous implementation of it: (a, b) -> a + b.', level: 'Easy' },
    { q: 'What are streams? map vs flatMap?', a: 'Streams process data declaratively through lazy intermediate operations and a terminal operation. map converts each element to one element; flatMap converts each element to a stream and flattens the results.', level: 'Medium' },
    { q: 'What is Optional and how should it be used?', a: 'A container for a possibly-absent value, used mainly as a return type to avoid null. Use orElse, orElseGet, orElseThrow, map, ifPresent instead of get().', level: 'Medium' },
    { q: 'What are records and sealed classes?', a: 'Records (Java 16) are immutable data carriers that auto-generate constructor, accessors, equals, hashCode and toString. Sealed classes (Java 17) restrict which classes can extend them, enabling exhaustive pattern matching switch.', level: 'Medium' },
    { q: 'Explain heap vs stack memory and garbage collection.', a: 'Stack: per-thread frames with local variables and references, freed when methods return. Heap: shared memory for objects, cleaned by the garbage collector when objects become unreachable. Default GC in Java 17/21 is G1.', level: 'Medium' },
    { q: 'What is serialization? What does transient do?', a: 'Serialization converts an object to bytes (ObjectOutputStream) for storage or transfer; deserialization rebuilds it. transient fields are skipped and restored to default values. The class must implement Serializable and should declare serialVersionUID.', level: 'Medium' },
    { q: 'What is the output? String s = null; System.out.println(s + "A"); System.out.println(s.length());', a: 'First prints "nullA" (concatenation converts null to "null"). The second line throws NullPointerException.', level: 'Medium' },
    { q: 'Explain your Core Java project in 2 minutes.', a: 'Sample: "I built a console Student Management System with five classes in a layered design: Main handles commands, StudentService contains business rules on a LinkedHashMap, Student is an encapsulated model with validation, Grade is an enum, and StudentNotFoundException is a custom checked exception. I used streams and Comparator chaining for sorting and reports, Optional for the topper, groupingBy for course statistics, and switch expressions for commands. The main challenge was robust input handling, which I solved by catching specific exceptions in the right order. Next I would add CSV persistence and later migrate it to Spring Boot with a database."', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Extend the Student Management System with a "search <text>" command that lists all students whose name contains the text (case-insensitive).',
      hint: 'Add List<Student> searchByName(String text) in StudentService using stream().filter(s -> s.getName().toLowerCase().contains(text.toLowerCase())). Add a case "search" in Main.',
      solution: `// In StudentService.java
public List<Student> searchByName(String text) {
    String t = text.toLowerCase();
    return students.values().stream()
            .filter(s -> s.getName().toLowerCase().contains(t))
            .toList();
}

// In Main.java switch
case "search" -> {
    List<Student> found = service.searchByName(p[1]);
    if (found.isEmpty()) System.out.println("No match for " + p[1]);
    else found.forEach(System.out::println);
}
// (add import java.util.List; in Main.java)`,
    },
    {
      task: 'Add "save" and "load" commands to the Student Management System using a CSV file students.csv (id,name,course,marks).',
      hint: 'Reuse the approach from Example 6. In StudentService add saveTo(Path) and loadFrom(Path) methods that throw IOException; catch IOException in Main.',
      solution: `// In StudentService.java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;

public void saveTo(Path file) throws IOException {
    List<String> lines = new ArrayList<>();
    for (Student s : students.values()) {
        lines.add(s.getId() + "," + s.getName() + "," + s.getCourse() + "," + s.getMarks());
    }
    Files.write(file, lines);
}

public int loadFrom(Path file) throws IOException {
    int count = 0;
    for (String line : Files.readAllLines(file)) {
        String[] p = line.split(",");
        try {
            add(new Student(Integer.parseInt(p[0]), p[1], p[2], Integer.parseInt(p[3])));
            count++;
        } catch (RuntimeException e) {
            System.out.println("Skipped: " + line);
        }
    }
    return count;
}

// In Main.java switch
case "save" -> { service.saveTo(Path.of("students.csv")); System.out.println("Saved"); }
case "load" -> System.out.println("Loaded " + service.loadFrom(Path.of("students.csv")));
// and add: catch (IOException e) { System.out.println("File error: " + e.getMessage()); }`,
    },
    {
      task: 'Build a Library Management console app: Book (id, title, author, issued), Library service with addBook, issueBook, returnBook, listAvailable. Throw BookNotAvailableException when issuing an already issued book.',
      hint: 'Store books in a LinkedHashMap<Integer, Book>. issueBook checks the issued flag.',
      solution: `import java.util.LinkedHashMap;
import java.util.Map;

class BookNotAvailableException extends Exception {
    BookNotAvailableException(String msg) { super(msg); }
}

class Book {
    final int id; final String title; final String author; boolean issued;
    Book(int id, String title, String author) { this.id = id; this.title = title; this.author = author; }
    public String toString() { return id + " " + title + " by " + author + (issued ? " [ISSUED]" : ""); }
}

class Library {
    private final Map<Integer, Book> books = new LinkedHashMap<>();
    void addBook(Book b) { books.put(b.id, b); }
    void issueBook(int id) throws BookNotAvailableException {
        Book b = books.get(id);
        if (b == null) throw new BookNotAvailableException("No book with id " + id);
        if (b.issued) throw new BookNotAvailableException(b.title + " is already issued");
        b.issued = true;
    }
    void returnBook(int id) { Book b = books.get(id); if (b != null) b.issued = false; }
    void listAvailable() { books.values().stream().filter(b -> !b.issued).forEach(System.out::println); }
}

public class Main {
    public static void main(String[] args) {
        Library lib = new Library();
        lib.addBook(new Book(1, "Clean Code", "Robert Martin"));
        lib.addBook(new Book(2, "Effective Java", "Joshua Bloch"));
        try {
            lib.issueBook(2);
            lib.issueBook(2);
        } catch (BookNotAvailableException e) {
            System.out.println("Error: " + e.getMessage());
        }
        lib.listAvailable();   // 1 Clean Code by Robert Martin
    }
}`,
    },
    {
      task: 'Build an Employee Payroll program using an abstract class Employee with abstract double salary(), and subclasses FullTimeEmployee (monthly salary) and PartTimeEmployee (hours x rate). Print each salary and the total using polymorphism.',
      hint: 'Store all employees in a List<Employee>; use mapToDouble(Employee::salary).sum().',
      solution: `import java.util.List;

abstract class Employee {
    protected final String name;
    Employee(String name) { this.name = name; }
    abstract double salary();
    public String toString() { return name + ": " + salary(); }
}

class FullTimeEmployee extends Employee {
    private final double monthly;
    FullTimeEmployee(String name, double monthly) { super(name); this.monthly = monthly; }
    double salary() { return monthly; }
}

class PartTimeEmployee extends Employee {
    private final int hours; private final double rate;
    PartTimeEmployee(String name, int hours, double rate) { super(name); this.hours = hours; this.rate = rate; }
    double salary() { return hours * rate; }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> staff = List.of(
            new FullTimeEmployee("Riya", 50000),
            new PartTimeEmployee("Aman", 80, 300));
        staff.forEach(System.out::println);           // Riya: 50000.0, Aman: 24000.0
        System.out.println("Total: " + staff.stream().mapToDouble(Employee::salary).sum()); // 74000.0
    }
}`,
    },
    {
      task: 'Quiz Game: store 5 questions (record Question(String text, List<String> options, int answer)), read the user\'s answers with Scanner, and print the score and percentage.',
      hint: 'Loop over the list, print options with numbers, read an int with Integer.parseInt(sc.nextLine().trim()).',
      solution: `import java.util.List;
import java.util.Scanner;

record Question(String text, List<String> options, int answer) { }

public class Main {
    public static void main(String[] args) {
        List<Question> qs = List.of(
            new Question("Java was created by?", List.of("Gosling", "Ritchie", "Stroustrup"), 1),
            new Question("Size of int?", List.of("2 bytes", "4 bytes", "8 bytes"), 2),
            new Question("Which is immutable?", List.of("StringBuilder", "String", "ArrayList"), 2));
        Scanner sc = new Scanner(System.in);
        int score = 0;
        for (Question q : qs) {
            System.out.println(q.text());
            for (int i = 0; i < q.options().size(); i++) System.out.println((i + 1) + ". " + q.options().get(i));
            try {
                if (Integer.parseInt(sc.nextLine().trim()) == q.answer()) score++;
            } catch (NumberFormatException e) {
                System.out.println("Invalid input, counted as wrong");
            }
        }
        System.out.printf("Score: %d/%d (%.0f%%)%n", score, qs.size(), score * 100.0 / qs.size());
    }
}`,
    },
    {
      task: 'Inventory with low-stock alerts: a Map<String, Integer> of products; process a list of sales concurrently with an ExecutorService (one task per sale) using ConcurrentHashMap.merge, then print products below 5 units in sorted order.',
      hint: 'Use ConcurrentHashMap and merge(product, -qty, Integer::sum); after shutdown + awaitTermination, filter values < 5 and sort keys.',
      solution: `import java.util.List;
import java.util.Map;
import java.util.concurrent.*;

public class Main {
    record Sale(String product, int qty) { }

    public static void main(String[] args) throws InterruptedException {
        Map<String, Integer> stock = new ConcurrentHashMap<>(Map.of("Pen", 20, "Book", 8, "Bag", 6));
        List<Sale> sales = List.of(new Sale("Pen", 5), new Sale("Book", 4), new Sale("Bag", 3),
                                   new Sale("Pen", 12), new Sale("Book", 1));
        ExecutorService pool = Executors.newFixedThreadPool(3);
        for (Sale s : sales) pool.execute(() -> stock.merge(s.product(), -s.qty(), Integer::sum));
        pool.shutdown();
        pool.awaitTermination(5, TimeUnit.SECONDS);

        stock.entrySet().stream()
             .filter(e -> e.getValue() < 5)
             .map(Map.Entry::getKey)
             .sorted()
             .forEach(p -> System.out.println("Low stock: " + p + " (" + stock.get(p) + ")"));
        // Low stock: Bag (3), Book (3), Pen (3)
    }
}`,
    },
  ],
  quiz: [
    { question: 'In the Student Management System, why is NumberFormatException caught before IllegalArgumentException?', options: ['Because it is checked', 'Because it is a subclass of IllegalArgumentException; the subclass catch must come first', 'Because Java catches in random order', 'It does not matter'], answer: 1, explanation: 'A superclass catch placed first makes the subclass catch unreachable, which is a compile error.' },
    { question: 'Which collection keeps students in the order they were added while giving O(1) lookup by id?', options: ['TreeMap', 'HashMap', 'LinkedHashMap', 'ArrayList'], answer: 2, explanation: 'LinkedHashMap combines hashing with a linked list of entries in insertion order.' },
    { question: 'In the banking project, which OOP concept lets the same call a.monthlyInterest() give different results?', options: ['Encapsulation', 'Runtime polymorphism (method overriding)', 'Method overloading', 'Static binding'], answer: 1, explanation: 'The overridden method of the actual object type runs at runtime (dynamic method dispatch).' },
    { question: 'What does Integer a = 128, b = 128; System.out.println(a == b); print?', options: ['false', 'true', 'Compile error', '128'], answer: 0, explanation: '128 is outside the Integer cache (-128..127), so two different objects are created.' },
    { question: 'Why does Account.getHistory() return List.copyOf(history)?', options: ['To make it faster', 'To sort the list', 'To protect the internal list from modification by callers (encapsulation)', 'Because ArrayList cannot be returned'], answer: 2, explanation: 'Returning an unmodifiable copy prevents external code from changing the account\'s internal state.' },
  ],
};
