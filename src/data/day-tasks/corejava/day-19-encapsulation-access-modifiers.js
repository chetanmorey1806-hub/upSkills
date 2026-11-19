export default {
  lesson: 'day-19-encapsulation-access-modifiers',
  minutes: 20,
  intro: 'Hide data with private fields, expose it with validated getters/setters and apply the four access levels.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Encapsulated bank account: what does this program print?',
      example: {
        title: 'validation inside a setter',
        code: `void setAge(int age) {
  if (age < 0) { System.out.println("Invalid age"); return; }
  this.age = age;
}`,
      },
      code: `class BankAccount {
    private double balance;

    public void deposit(double amount) {
        if (amount <= 0) {
            System.out.println("Invalid amount");
            return;
        }
        balance += amount;
    }
    public void withdraw(double amount) {
        if (amount > balance) {
            System.out.println("Insufficient balance");
            return;
        }
        balance -= amount;
    }
    public double getBalance() {
        return balance;
    }
}

public class Main {
    public static void main(String[] args) {
        BankAccount acc = new BankAccount();
        acc.deposit(5000);
        acc.deposit(-200);
        acc.withdraw(7000);
        acc.withdraw(1500);
        System.out.println(acc.getBalance());
    }
}`,
      expected: `Invalid amount
Insufficient balance
3500.0`,
      explain: 'Because `balance` is **private**, the only way to change it is through deposit/withdraw, which reject bad values. 5000 is added, −200 and 7000 are rejected with messages, 1500 is withdrawn → 3500.0 (a double prints with .0).',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'JavaBean naming: the field is `private boolean active;`. Write the name of its **getter** method call (with brackets).',
      example: {
        title: 'getter for a normal field',
        code: `private String name;
public String getName() { return name; }`,
      },
      accept: ['isActive()'],
      acceptRegex: ['^isActive\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'For `boolean` fields the getter conventionally starts with **is**: `isActive()`. Other fields use `getX()`, setters use `setX(value)`. Frameworks like Spring, Hibernate and Jackson rely on these exact names.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which access modifier makes a field visible **only inside its own class**?',
      example: { title: 'the widest access', code: 'public String name; // visible everywhere' },
      accept: ['private'],
      acceptRegex: ['^private\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`private` = same class only. Default (no keyword) = same package. `protected` = same package + subclasses. `public` = everywhere. Encapsulation starts with making fields private.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'Class `A` is in package `com.shop` and has a field declared with **no modifier** (`int stock;`). Who can access `stock`?',
      options: ['Only class A', 'Every class in the com.shop package', 'Every class in the project', 'Only subclasses of A'],
      answer: 1,
      explain: 'No modifier means **default (package-private)** access: every class in the same package can use it, but classes in other packages cannot — not even subclasses there. That is the difference from `protected`.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which steps help make a class **immutable**? (choose all that apply)',
      options: [
        'Make the class final',
        'Make all fields private final',
        'Provide setters for every field',
        'Return defensive copies of mutable fields (e.g. a List)',
        'Make fields public so they are easy to read',
      ],
      answers: [0, 1, 3],
      explain: 'An immutable class: `final` class (no subclass can change behaviour), `private final` fields set in the constructor, **no setters**, and copies of mutable objects in and out. `String` and `LocalDate` are examples.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the main **benefit** of encapsulation?',
      options: [
        'Programs run faster',
        'Data can only be changed through methods that validate it, so objects stay in a valid state',
        'It removes the need for constructors',
        'It allows multiple inheritance',
      ],
      answer: 1,
      explain: 'Encapsulation = **data hiding + controlled access**. A setter can refuse a negative age or salary, and the internal representation can change later without breaking the code that uses the class.',
    },
  ],
};
