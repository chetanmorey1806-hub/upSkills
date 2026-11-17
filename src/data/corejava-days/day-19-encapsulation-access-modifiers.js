const STEPS = [
  'IntelliJ: File > New > Java Class > Main (Eclipse: File > New > Class, Name = Main)',
  'Type the code. Tip: IntelliJ can generate getters/setters with Alt+Insert > Getter and Setter; Eclipse with Source > Generate Getters and Setters',
  'Click Run ▶ and check that invalid values are rejected',
];

const ex1 = `class BankAccount {
    private final String accountNo;   // cannot change after creation
    private String holder;
    private double balance;           // only changed through deposit/withdraw

    BankAccount(String accountNo, String holder) {
        this.accountNo = accountNo;
        this.holder = holder;
    }

    public String getAccountNo() { return accountNo; }
    public String getHolder() { return holder; }
    public double getBalance() { return balance; }

    public void setHolder(String holder) {
        if (holder == null || holder.isBlank()) {
            System.out.println("Invalid name, ignored");
            return;
        }
        this.holder = holder;
    }

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Deposit must be positive");
            return;
        }
        balance += amount;
    }

    public boolean withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient balance");
            return false;
        }
        balance -= amount;
        return true;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount("SB-101", "Ritu");
        acc.deposit(5000);
        acc.deposit(-200);
        acc.withdraw(7000);
        acc.withdraw(1500);
        acc.setHolder("  ");
        // acc.balance = 1000000;   // compile error: balance has private access
        System.out.println(acc.getAccountNo() + " | " + acc.getHolder() + " | " + acc.getBalance());
    }
}`;

const ex2 = `class Account {
    private int pin = 1234;              // only inside Account
    int branchCode = 77;                 // default: same package
    protected String type = "Savings";   // same package + subclasses
    public String bank = "SBI";          // everywhere

    boolean samePin(Account other) {
        return this.pin == other.pin;    // private is per CLASS, not per object
    }
}

public class Main {
    public static void main(String[] args) {
        Account a = new Account();
        Account b = new Account();
        System.out.println(a.bank);
        System.out.println(a.type);       // OK: Main is in the same (default) package
        System.out.println(a.branchCode); // OK: same package
        // System.out.println(a.pin);     // compile error: pin has private access
        System.out.println("Same pin? " + a.samePin(b));
    }
}`;

const ex3 = `import java.util.Arrays;

final class Marksheet {
    private final String name;
    private final int[] marks;

    Marksheet(String name, int[] marks) {
        this.name = name;
        this.marks = marks.clone();       // defensive copy IN
    }

    String getName() { return name; }

    int[] getMarks() {
        return marks.clone();             // defensive copy OUT
    }

    int total() {
        int t = 0;
        for (int m : marks) t += m;
        return t;
    }
}

public class Main {
    public static void main(String[] args) {
        int[] input = {80, 90, 70};
        Marksheet ms = new Marksheet("Isha", input);

        input[0] = 0;                     // does not affect ms
        int[] copy = ms.getMarks();
        copy[1] = 0;                      // does not affect ms

        System.out.println(ms.getName() + " total = " + ms.total());
        System.out.println(Arrays.toString(ms.getMarks()));
    }
}`;

const ex4 = `class Student {
    private String name;
    private int marks;
    private boolean scholarship;

    public Student() { }                         // JavaBean: public no-arg constructor

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public int getMarks() { return marks; }
    public void setMarks(int marks) {
        if (marks < 0 || marks > 100) {
            System.out.println("Invalid marks: " + marks);
            return;
        }
        this.marks = marks;
    }

    public boolean isScholarship() { return scholarship; }   // boolean getter uses "is"
    public void setScholarship(boolean scholarship) { this.scholarship = scholarship; }

    public boolean isPassed() {                  // computed, read-only property
        return marks >= 35;
    }
}

public class Main {
    public static void main(String[] args) {
        Student s = new Student();
        s.setName("Kabir");
        s.setMarks(120);
        s.setMarks(88);
        s.setScholarship(true);
        System.out.println(s.getName() + " " + s.getMarks()
                + " passed=" + s.isPassed() + " scholarship=" + s.isScholarship());
    }
}`;

const pr1 = `class Employee {
    private String name;
    private double salary;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public double getSalary() { return salary; }

    public void setSalary(double salary) {
        if (salary < 10000) {
            System.out.println("Salary below minimum wage");
            return;
        }
        this.salary = salary;
    }
}

public class Main {
    public static void main(String[] args) {
        Employee e = new Employee();
        e.setName("Sana");
        e.setSalary(5000);     // Salary below minimum wage
        e.setSalary(45000);
        System.out.println(e.getName() + " earns " + e.getSalary());   // Sana earns 45000.0
    }
}`;

const pr2 = `final class Money {
    private final String currency;
    private final long paise;

    Money(String currency, long paise) {
        this.currency = currency;
        this.paise = paise;
    }

    String getCurrency() { return currency; }
    long getPaise() { return paise; }

    Money add(Money other) {                     // returns a NEW object
        return new Money(currency, paise + other.paise);
    }
}

public class Main {
    public static void main(String[] args) {
        Money a = new Money("INR", 1050);
        Money b = a.add(new Money("INR", 250));
        System.out.println(a.getPaise() + " " + b.getPaise());   // 1050 1300
    }
}`;

const pr3 = `class Thermostat {
    private int temperature = 24;

    public int getTemperature() { return temperature; }

    public void setTemperature(int t) {
        if (t < 16) t = 16;                     // clamp to allowed range
        if (t > 30) t = 30;
        temperature = t;
    }
}

public class Main {
    public static void main(String[] args) {
        Thermostat th = new Thermostat();
        th.setTemperature(10);
        System.out.println(th.getTemperature());   // 16
        th.setTemperature(35);
        System.out.println(th.getTemperature());   // 30
        th.setTemperature(22);
        System.out.println(th.getTemperature());   // 22
    }
}`;

const pr4 = `import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

class Cart {
    private final List<String> items = new ArrayList<>();

    public void addItem(String item) {
        if (item != null && !item.isBlank()) items.add(item);
    }

    public List<String> getItems() {
        return Collections.unmodifiableList(items);   // read-only view
    }
}

public class Main {
    public static void main(String[] args) {
        Cart cart = new Cart();
        cart.addItem("Shoes");
        cart.addItem("");
        cart.addItem("Watch");
        System.out.println(cart.getItems());            // [Shoes, Watch]
        try {
            cart.getItems().add("Hack");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify from outside");
        }
    }
}`;

export default {
  id: 'day-19-encapsulation-access-modifiers',
  title: 'Encapsulation, Access Modifiers, Getters and Setters',
  module: 'Module 3: Object-Oriented Programming',
  day: 19,
  level: 'Beginner',
  duration: '2 hours',
  summary:
    'Protect object data by making fields private and exposing controlled access through getters, setters and business methods, and master the four access levels: private, default, protected and public.',
  objectives: [
    'Explain encapsulation and data hiding with real examples',
    'Apply the four access modifiers and know their visibility rules',
    'Write getters/setters with validation following JavaBean naming',
    'Create simple immutable classes using final fields and defensive copies',
  ],
  theory: [
    {
      heading: 'What is Encapsulation?',
      content:
        'Encapsulation means wrapping data (fields) and the code that works on that data (methods) into a single unit (class), and hiding the data from direct outside access. Analogy: a medicine capsule hides the bitter powder inside; you just swallow it. Another analogy: an ATM. You cannot open the cash box directly; you can only use buttons (methods) that check your PIN and balance first.',
      points: [
        'Make fields private.',
        'Provide public methods (getters, setters, business methods) that validate and control access.',
        'Benefits: data protection, validation in one place, freedom to change internal code later, read-only or write-only properties, easier testing.',
      ],
    },
    {
      heading: 'Access Modifiers',
      content:
        'Java has four access levels. Visibility table (Y = accessible):\n private   -> same class: Y | same package: N | subclass in other package: N | everywhere: N\n default   -> same class: Y | same package: Y | subclass in other package: N | everywhere: N\n protected -> same class: Y | same package: Y | subclass in other package: Y (through inheritance) | everywhere: N\n public    -> Y everywhere',
      points: [
        'default (no keyword) is also called package-private.',
        'A top-level class can only be public or default, never private or protected.',
        'Only one public top-level class per .java file, and the file name must match it.',
        'private is per class, not per object: one Account object can read another Account object\'s private field inside Account\'s code.',
        'Rule of thumb: fields private, methods public only if needed by others, helpers private.',
      ],
    },
    {
      heading: 'Getters and Setters (JavaBean Conventions)',
      content:
        'A getter returns a field value and a setter changes it. Naming: getName()/setName(String) for normal fields, isActive()/setActive(boolean) for boolean fields. A JavaBean (POJO) has private fields, a public no-arg constructor and public getters/setters. Frameworks such as Spring, Hibernate and Jackson rely on these names.',
      syntax: `private int age;
public int getAge() { return age; }
public void setAge(int age) {
    if (age < 0) throw new IllegalArgumentException("Age cannot be negative");
    this.age = age;
}`,
      points: [
        'Read-only property: only a getter (e.g. accountNo).',
        'Write-only property: only a setter (e.g. password).',
        'Do not blindly generate setters for every field: balance should change only via deposit/withdraw.',
      ],
      tip: 'IntelliJ: Alt+Insert (Cmd+N on Mac) > Getter and Setter. Eclipse: right-click > Source > Generate Getters and Setters.',
    },
    {
      heading: 'Immutable Classes',
      content:
        'An immutable object cannot change after it is created (String, Integer, LocalDate). Recipe: make the class final, make all fields private final, set them in the constructor, provide no setters, and for mutable fields (arrays, lists) make defensive copies on the way in and on the way out. Immutable objects are thread-safe and safe to share.',
      points: [
        'Returning the internal array directly lets outsiders modify your private data. Return a copy instead.',
        'Collections.unmodifiableList(list) or List.copyOf(list) give read-only views/copies.',
      ],
    },
    {
      heading: 'Encapsulation vs Abstraction',
      content:
        'Encapsulation is about HOW you hide data (private fields + controlled methods) and is implemented at class level. Abstraction is about WHAT you show: exposing only essential behaviour and hiding implementation complexity (abstract classes and interfaces). A car\'s locked engine bay is encapsulation; the steering wheel and pedals as a simple interface is abstraction.',
    },
  ],
  examples: [
    {
      title: 'Encapsulated Bank Account with Validation',
      scenario: 'A bank must stop negative deposits, overdrafts and blank names, and nobody should be able to set balance directly.',
      steps: STEPS,
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Deposit must be positive
Insufficient balance
Invalid name, ignored
SB-101 | Ritu | 3500.0`,
      explanation:
        'Balance becomes 5000. -200 is rejected. 7000 > 5000 is rejected. 1500 is withdrawn leaving 3500.0. A blank name is rejected, so the holder stays Ritu.',
    },
    {
      title: 'Access Modifiers in Action',
      scenario: 'Check which members of Account another class in the same package can see.',
      steps: STEPS,
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `SBI
Savings
77
Same pin? true`,
      explanation:
        'Main and Account are both in the default package, so public, protected and default members are visible. pin is private and only Account\'s own code (samePin) can read it, even on another Account object.',
    },
    {
      title: 'Immutable Class with Defensive Copies',
      scenario: 'A marksheet must not be changed after it is issued, even if the caller still holds the original array.',
      steps: STEPS,
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Isha total = 240
[80, 90, 70]`,
      explanation:
        'The constructor stores a clone, so input[0] = 0 does not affect it. getMarks() returns another clone, so copy[1] = 0 also does not affect it. Total stays 80+90+70 = 240.',
    },
    {
      title: 'JavaBean (POJO) with Boolean Getters',
      scenario: 'A student record follows JavaBean rules so frameworks can read it, and validates marks.',
      steps: STEPS,
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Invalid marks: 120
Kabir 88 passed=true scholarship=true`,
      explanation:
        'setMarks(120) is rejected, setMarks(88) is accepted. isPassed() is a computed property (88 >= 35). Boolean getters use the is prefix.',
    },
  ],
  interview: [
    {
      q: 'What is encapsulation? How do you achieve it in Java?',
      a: 'Binding data and methods into one class and restricting direct access to the data. Achieved by declaring fields private and providing public getters/setters or business methods with validation.',
      level: 'Easy',
    },
    {
      q: 'Explain the four access modifiers.',
      a: 'private: within the class only. default: within the same package. protected: same package plus subclasses in other packages (through inheritance). public: everywhere.',
      level: 'Easy',
    },
    {
      q: 'Can a top-level class be private or protected?',
      a: 'No. Top-level classes can only be public or package-private (default). Nested classes can use all four modifiers.',
      level: 'Easy',
    },
    {
      q: 'What is the output?\nclass A { private int x = 5; int read(A o) { return o.x; } }\nSystem.out.println(new A().read(new A()));',
      a: 'Output: 5. Private access is checked per class, so code inside A can access x of any A object.',
      level: 'Medium',
    },
    {
      q: 'What is the output?\nclass Box { private int[] data = {1, 2, 3}; int[] getData() { return data; } int first() { return data[0]; } }\nBox b = new Box(); b.getData()[0] = 99; System.out.println(b.first());',
      a: 'Output: 99. The getter leaks the internal array reference, breaking encapsulation. Fix: return data.clone().',
      level: 'Medium',
    },
    {
      q: 'Why use getters/setters instead of public fields?',
      a: 'Validation, read-only/write-only control, ability to change internal representation without breaking callers, lazy loading, logging, and compatibility with frameworks that use JavaBean conventions.',
      level: 'Medium',
    },
    {
      q: 'What is the difference between encapsulation and abstraction?',
      a: 'Encapsulation hides data and protects it (implementation via private + methods). Abstraction hides implementation complexity and shows only essential features (via abstract classes and interfaces). Encapsulation is "how to hide"; abstraction is "what to show".',
      level: 'Medium',
    },
    {
      q: 'How do you create an immutable class?',
      a: 'Make the class final, all fields private final, initialize in the constructor, no setters, return defensive copies of mutable fields, and copy mutable constructor arguments.',
      level: 'Hard',
    },
    {
      q: 'Can a subclass in a different package access a protected member using a parent-class reference?',
      a: 'No. In another package, a subclass can access a protected member only through its own type (this or a subclass reference), i.e. through inheritance, not via new Parent().member.',
      level: 'Hard',
    },
    {
      q: 'What is the getter name for a boolean field called active?',
      a: 'isActive() (getActive() also works but isActive() is the JavaBean convention). The setter is setActive(boolean).',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create an Employee class whose salary cannot be set below 10000.',
      hint: 'Check the value in setSalary before assigning.',
      solution: pr1,
    },
    {
      task: 'Create an immutable Money class whose add() method returns a new object.',
      hint: 'final class, private final fields, no setters.',
      solution: pr2,
    },
    {
      task: 'Create a Thermostat whose temperature is always kept between 16 and 30.',
      hint: 'Clamp the value in the setter.',
      solution: pr3,
    },
    {
      task: 'Create a Cart whose item list cannot be modified from outside the class.',
      hint: 'Return Collections.unmodifiableList(items).',
      solution: pr4,
    },
  ],
  quiz: [
    {
      question: 'Which access modifier gives the MOST restricted access?',
      options: ['public', 'protected', 'default', 'private'],
      answer: 3,
      explanation: 'private members are visible only inside the declaring class.',
    },
    {
      question: 'A member with no access modifier is visible to...',
      options: ['Classes in the same package', 'Only the same class', 'All classes', 'Only subclasses'],
      answer: 0,
      explanation: 'Default (package-private) access is limited to the same package.',
    },
    {
      question: 'Which is the JavaBean getter for boolean married?',
      options: ['getMarried()', 'isMarried()', 'married()', 'hasMarried()'],
      answer: 1,
      explanation: 'Boolean properties use the is prefix.',
    },
    {
      question: 'Which is NOT required for an immutable class?',
      options: ['private final fields', 'No setters', 'A public no-arg constructor', 'Defensive copies of mutable fields'],
      answer: 2,
      explanation: 'Immutable classes usually have a constructor that sets all fields; a no-arg constructor is not required.',
    },
    {
      question: 'Which access modifiers are allowed on a top-level class?',
      options: ['private and public', 'public and default', 'protected and public', 'All four'],
      answer: 1,
      explanation: 'Only public or package-private (default).',
    },
  ],
};
