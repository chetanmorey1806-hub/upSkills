export default {
  lesson: 'day-08-solid-principles-clean-code',
  minutes: 22,
  intro: 'Recognise each SOLID principle in real code, trace an open/closed design and spot clean-code problems.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: '`InvoiceService` calculates totals, saves invoices to MySQL, generates the PDF and sends the email. Which principle does it break most clearly?',
      options: ['Single Responsibility Principle', 'Liskov Substitution Principle', 'Interface Segregation Principle', 'None, this is good design'],
      answer: 0,
      explain: '**SRP**: a class should have one reason to change. A new PDF layout, a new database or a new email provider would all change this one class. Split it into `InvoiceCalculator`, `InvoiceRepository`, `PdfGenerator`, `EmailSender`.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'This checkout follows the **Open/Closed Principle**: a new discount = a new class, no change to `Checkout`. What does it print?',
      example: { title: 'applying rules in order', text: 'Each rule receives the amount returned by the previous rule.' },
      code: `interface DiscountRule { double apply(double amount); }

class FestivalDiscount implements DiscountRule {
    public double apply(double a) { return a * 0.9; }
}
class StudentDiscount implements DiscountRule {
    public double apply(double a) { return a - 200; }
}
class BigOrderDiscount implements DiscountRule {
    public double apply(double a) { return a > 4000 ? a - 300 : a; }
}

class Checkout {
    private final List<DiscountRule> rules;
    Checkout(List<DiscountRule> rules) { this.rules = rules; }
    double total(double amount) {
        for (DiscountRule r : rules) amount = r.apply(amount);
        return amount;
    }
}

Checkout c = new Checkout(List.of(new FestivalDiscount(),
        new StudentDiscount(), new BigOrderDiscount()));
System.out.println(c.total(5000));
System.out.println(c.total(4000));`,
      expected: '4000.0\n3400.0',
      explain: '5000 → ×0.9 = 4500 → −200 = 4300 → >4000 so −300 = **4000.0**. 4000 → 3600 → 3400 → not >4000 → **3400.0**. Java prints doubles with ".0". Adding a coupon rule later needs no edit to `Checkout`: open for extension, closed for modification.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`Square extends Rectangle` and overrides `setWidth` to also change the height. Code that does `r.setWidth(5); r.setHeight(4); r.area()` expects 20 but gets 16 for a Square. Which principle is broken?',
      options: ['Open/Closed', 'Liskov Substitution', 'Dependency Inversion', 'Single Responsibility'],
      answer: 1,
      explain: '**LSP**: a subclass must be usable anywhere its parent is expected without surprising the caller. Square changes Rectangle\'s behaviour, so it should not inherit from it (use a common `Shape` interface instead).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'A `Worker` interface has `work()`, `eat()` and `sleep()`. `RobotWorker` must implement `eat()` and `sleep()` by throwing UnsupportedOperationException. Which principle fixes this?',
      options: ['Interface Segregation: split into small interfaces like Workable, Eatable', 'Liskov Substitution: make the robot extend Human', 'Single Responsibility: delete RobotWorker', 'Open/Closed: add more methods to Worker'],
      answer: 0,
      explain: '**ISP**: clients should not be forced to depend on methods they do not use. Small, focused interfaces (`Workable`, `Eatable`) let each class implement only what makes sense.',
    },
    {
      type: 'fill',
      mins: 2,
      q: '`OrderService` creates `new MySqlOrderRepository()` inside itself. Following SOLID, it should receive an `OrderRepository` interface through its constructor instead. Name the principle (full name).',
      example: { title: 'the idea', code: 'class OrderService {\n  private final OrderRepository repo;      // abstraction\n  OrderService(OrderRepository repo) { this.repo = repo; }\n}' },
      accept: ['Dependency Inversion Principle', 'Dependency Inversion', 'DIP', 'the Dependency Inversion Principle'],
      explain: '**Dependency Inversion**: high-level modules depend on abstractions, not on concrete classes. Spring\'s dependency injection is built on this idea, and it lets tests pass a mock repository.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which of these are **code smells** that call for refactoring? (choose all that apply)',
      options: [
        'A 300-line method called process()',
        'Variables named a, x1, temp2 in business code',
        'The same 15 lines copy-pasted in three services',
        'A method named calculateGst(double amount) that only calculates GST',
        'A method with 9 boolean parameters',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Long methods, meaningless names, duplicated code and long parameter lists are classic smells. `calculateGst` is clean: a clear name that does exactly one thing. Refactor in small steps with tests running.',
    },
  ],
};
