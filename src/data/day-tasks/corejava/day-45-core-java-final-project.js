export default {
  lesson: 'day-45-core-java-final-project',
  minutes: 30,
  intro: 'Final practical test: predict outputs of project-style code and answer the most common Core Java interview questions.',
  tasks: [
    {
      type: 'output',
      mins: 5,
      q: 'Student Management snippet: what does this program print?',
      example: { title: 'average with streams', code: 'double avg = list.stream().mapToInt(Student::marks).average().orElse(0);' },
      code: `import java.util.*;
import java.util.stream.*;

enum Grade { A, B, C }

record Student(int id, String name, int marks) {
    Grade grade() { return marks >= 80 ? Grade.A : marks >= 60 ? Grade.B : Grade.C; }
}

public class Main {
    public static void main(String[] args) {
        List<Student> list = new ArrayList<>(List.of(
            new Student(3, "Ravi", 72), new Student(1, "Asha", 91),
            new Student(2, "Om", 55), new Student(4, "Meena", 84)));

        list.sort(Comparator.comparingInt(Student::id));
        System.out.println(list.get(0).name());

        double avg = list.stream().mapToInt(Student::marks).average().orElse(0);
        System.out.println(avg);

        Map<Grade, Long> count = list.stream()
            .collect(Collectors.groupingBy(Student::grade, () -> new EnumMap<>(Grade.class), Collectors.counting()));
        System.out.println(count);

        String toppers = list.stream().filter(s -> s.grade() == Grade.A)
            .map(Student::name).sorted().collect(Collectors.joining(","));
        System.out.println(toppers);
    }
}`,
      expected: `Asha
75.5
{A=2, B=1, C=1}
Asha,Meena`,
      explain: 'Sorting by id puts Asha (id 1) first. The average of 91, 55, 72, 84 is 302 / 4 = 75.5. An **EnumMap** keeps keys in enum order (A, B, C). Asha and Meena have grade A and are sorted alphabetically before joining.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Banking snippet with a custom exception: what does this program print?',
      example: {
        title: 'a custom unchecked exception',
        code: `class InvalidAmountException extends RuntimeException {
  InvalidAmountException(String m) { super(m); }
}`,
      },
      code: `import java.util.*;

class InsufficientFundsException extends Exception {
    InsufficientFundsException(String msg) { super(msg); }
}

abstract class Account {
    protected double balance;
    Account(double balance) { this.balance = balance; }
    abstract double limit();
    void withdraw(double amt) throws InsufficientFundsException {
        if (amt > balance + limit()) throw new InsufficientFundsException("Denied " + amt);
        balance -= amt;
    }
}
class Savings extends Account {
    Savings(double b) { super(b); }
    double limit() { return 0; }
}
class Current extends Account {
    Current(double b) { super(b); }
    double limit() { return 5000; }
}

public class Main {
    public static void main(String[] args) {
        List<Account> accounts = List.of(new Savings(2000), new Current(2000));
        for (Account a : accounts) {
            try {
                a.withdraw(4000);
                System.out.println(a.getClass().getSimpleName() + " " + a.balance);
            } catch (InsufficientFundsException e) {
                System.out.println(a.getClass().getSimpleName() + " " + e.getMessage());
            }
        }
    }
}`,
      expected: `Savings Denied 4000.0
Current -2000.0`,
      explain: 'Polymorphism decides the overdraft limit: Savings has 0, so 4000 > 2000 throws and the message is printed. Current allows 5000 extra, so the withdrawal succeeds and the balance becomes −2000.0. The checked exception must be declared with `throws` and handled by the caller.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview: which is the correct difference between `==` and `equals()` for objects?',
      options: [
        'Both always compare content',
        '== compares references; equals() compares content when the class overrides it (like String)',
        '== compares content; equals() compares references',
        'equals() works only for primitives',
      ],
      answer: 1,
      explain: '`==` checks whether two references point to the **same object**. `equals()` in Object also compares references, but classes like String, Integer and records override it to compare **values**.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Interview: why is `main` declared `static`?',
      options: [
        'So it can be overloaded',
        'So the JVM can call it without creating an object of the class',
        'So it runs faster',
        'Because static methods cannot throw exceptions',
      ],
      answer: 1,
      explain: 'The JVM starts the program before any object exists, so the entry point must belong to the class: `public static void main(String[] args)`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Interview: which statements are TRUE? (choose all that apply)',
      options: [
        'String is immutable; StringBuilder is mutable',
        'An interface can have default methods since Java 8',
        'Java supports multiple inheritance of classes',
        'finally runs whether or not an exception occurs (except System.exit or a JVM crash)',
        'HashMap allows one null key',
        'Checked exceptions extend RuntimeException',
      ],
      answers: [0, 1, 3, 4],
      explain: 'Java allows multiple inheritance only through interfaces, not classes. Checked exceptions extend Exception **but not** RuntimeException. The other statements are classic correct interview answers.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Project design: in a layered console app (model → repository → service → UI), which keyword lets \`StudentService\` depend on the **interface** \`StudentRepository\` while \`FileStudentRepository\` provides the implementation?
\`class FileStudentRepository ____ StudentRepository { ... }\``,
      example: {
        title: 'programming to an interface',
        code: `StudentRepository repo = new FileStudentRepository();
StudentService service = new StudentService(repo);`,
      },
      accept: ['implements'],
      acceptRegex: ['^implements\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Depending on an interface lets you swap the storage (in-memory list, file, database) without touching the service layer. The implementation class `implements` the interface, and the service receives it through its constructor (dependency injection).',
    },
  ],
};
