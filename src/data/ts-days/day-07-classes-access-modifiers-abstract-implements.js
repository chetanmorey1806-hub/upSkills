export default {
  id: 'day-07-classes-access-modifiers-abstract-implements',
  title: 'Classes in TypeScript: Access Modifiers, Abstract Classes, implements, Parameter Properties',
  module: 'Module 2: Type System Power',
  day: 7,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'TypeScript adds compile-time safety to JavaScript classes: access modifiers, readonly fields, abstract classes, interfaces that classes must implement, and the parameter-property shortcut. These are used heavily in backend code (services, repositories, NestJS) and asked in every OOP interview round.',
  objectives: [
    'Declare typed class fields and constructors',
    'Use public, private, protected, readonly and JavaScript #private fields correctly',
    'Shorten constructors with parameter properties',
    'Make a class follow a contract with implements',
    'Design base classes with abstract methods, and use getters/setters, static and override',
  ],
  theory: [
    {
      heading: 'Typed class fields and constructors',
      content: `In TypeScript every class **field must be declared** with its type before use: \`owner: string;\`. Then the constructor assigns it.

With \`strict\` (strictPropertyInitialization), every field must be initialised either where it is declared (\`count = 0\`) or in the constructor. Otherwise you get **"Property 'x' has no initializer and is not definitely assigned in the constructor"**.

If a framework assigns the field later (for example a dependency-injection container), you can use the **definite assignment** operator \`name!: string\`, but use it rarely.`,
      syntax: `class User {
  name: string;
  isActive = true;           // type inferred as boolean
  constructor(name: string) {
    this.name = name;
  }
}`,
    },
    {
      heading: 'Access modifiers: public, private, protected, readonly',
      content: `- **public** (default) – accessible everywhere
- **private** – only inside the same class
- **protected** – inside the class and its subclasses, not from outside
- **readonly** – can be set in the declaration or constructor, never reassigned

Analogy for a bank: the account number is **public readonly** (everyone can see it, nobody can change it), the balance is **private** (only the bank's own methods change it), and internal branch codes are **protected** (visible to the bank's departments, not customers).

Important: TypeScript's \`private\` is a **compile-time** rule only. In the JavaScript output the property is a normal property, and \`(obj as any).balance\` still works. JavaScript's own **\`#private\`** fields (\`#balance\`) are enforced at **runtime** too. Use \`#\` when real privacy matters (for example in libraries).`,
      points: [
        'private = TypeScript check only, erased at runtime',
        '#field = real runtime privacy (ES2022)',
        'readonly = no reassignment after construction',
      ],
    },
    {
      heading: 'Parameter properties',
      content: `Most constructors just copy arguments into fields. TypeScript has a shortcut: add a modifier (\`public\`, \`private\`, \`protected\` or \`readonly\`) to a constructor parameter, and it becomes a field automatically:

\`constructor(private readonly apiKey: string) {}\` declares the field \`apiKey\` AND assigns it.

This pattern is everywhere in NestJS and service classes: \`constructor(private userRepo: UserRepository, private mailer: Mailer) {}\`.

Note: parameter properties generate runtime code, so they do not work in Node's built-in type stripping (\`--experimental-strip-types\`) without the transform flag; tsc, tsx, Vite and esbuild support them.`,
      syntax: `class UserService {
  constructor(
    private readonly repo: UserRepository,
    private logger: Logger,
  ) {}
}`,
    },
    {
      heading: 'implements: classes that follow a contract',
      content: `\`class RazorpayGateway implements PaymentGateway\` tells TypeScript to check that the class has everything the interface requires. If a method is missing or has the wrong signature, you get an error at the class.

A class can implement several interfaces: \`class A implements Serializable, Comparable<A>\`.

The real benefit is **dependency inversion**: code depends on the interface (\`PaymentGateway\`), not on a specific class, so you can swap Razorpay for Stripe or a fake gateway in tests without changing the business code.

\`implements\` only checks; it does not add any code or change the types of the class members (method parameters are not inferred from the interface, you still annotate them).`,
    },
    {
      heading: 'Abstract classes',
      content: `An **abstract class** is a base class that cannot be instantiated directly (\`new Notifier()\` is an error). It can contain:
- normal methods with shared logic
- **abstract methods** with only a signature, which every subclass must implement

Abstract class vs interface:
- An interface is only a type; it has no code and disappears at runtime
- An abstract class is a real JavaScript class with shared implementation and constructor logic
- A class can implement many interfaces but extend only one class

Use an abstract class when subclasses share real code (the **template method** pattern: \`send()\` validates, then calls the abstract \`deliver()\`). Use an interface when you only need a contract.`,
    },
    {
      heading: 'Getters/setters, static members and override',
      content: `- **get / set** accessors look like properties but run code, ideal for validation and computed values (\`priceWithGst\`)
- **static** members belong to the class, not instances: counters, constants, factory methods like \`Product.fromJSON()\`
- **override** marks a method that replaces a parent method. With the \`noImplicitOverride\` compiler option, forgetting \`override\` is an error, and writing \`override\` on a method that does not exist in the parent is always an error, which protects you when the parent method is renamed
- A **private constructor** plus static factory methods controls how objects are created (used for singletons and value objects)`,
      tip: 'In React projects you rarely write classes (function components + hooks are standard). In Node/Express backends, classes are common for services, repositories, custom errors (`class AppError extends Error`) and NestJS controllers.',
    },
  ],
  examples: [
    {
      title: 'Access modifiers and inheritance',
      scenario: 'A bank account whose balance can only change through deposit and withdraw, and a savings account subclass.',
      steps: [
        'Create bank.ts',
        'Run it',
        'Try `acc.balance = 1` outside the class and read the error',
      ],
      code: `// Access modifiers: public, private, protected, readonly
class BankAccount {
  public readonly accountNo: string;   // readable everywhere, set once
  public owner: string;                 // public is the default
  private balance: number;              // only inside this class
  protected bankName = "UpSkillr Bank"; // this class + subclasses

  constructor(accountNo: string, owner: string, openingBalance: number) {
    this.accountNo = accountNo;
    this.owner = owner;
    this.balance = openingBalance;
  }

  deposit(amount: number): void {
    if (amount <= 0) throw new Error("Deposit must be positive");
    this.balance += amount;
  }

  withdraw(amount: number): boolean {
    if (amount > this.balance) return false;
    this.balance -= amount;
    return true;
  }

  getBalance(): number {
    return this.balance;
  }
}

class SavingsAccount extends BankAccount {
  constructor(accountNo: string, owner: string, opening: number, private rate: number) {
    super(accountNo, owner, opening);
  }

  addInterest(): void {
    this.deposit((this.getBalance() * this.rate) / 100);
  }

  describe(): string {
    return \`\${this.owner} @ \${this.bankName}\`; // protected is OK in a subclass
  }
}

const acc = new SavingsAccount("SB-001", "Asha", 10000, 4);
acc.addInterest();
console.log(acc.describe(), "balance:", acc.getBalance());
console.log("withdraw 20000:", acc.withdraw(20000), "| withdraw 400:", acc.withdraw(400));
console.log("balance:", acc.getBalance());`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Access modifiers: public, private, protected, readonly
class BankAccount {
    accountNo; // readable everywhere, set once
    owner; // public is the default
    balance; // only inside this class
    bankName = "UpSkillr Bank"; // this class + subclasses
    constructor(accountNo, owner, openingBalance) {
        this.accountNo = accountNo;
        this.owner = owner;
        this.balance = openingBalance;
    }
    deposit(amount) {
        if (amount <= 0)
            throw new Error("Deposit must be positive");
        this.balance += amount;
    }
    withdraw(amount) {
        if (amount > this.balance)
            return false;
        this.balance -= amount;
        return true;
    }
    getBalance() {
        return this.balance;
    }
}
class SavingsAccount extends BankAccount {
    rate;
    constructor(accountNo, owner, opening, rate) {
        super(accountNo, owner, opening);
        this.rate = rate;
    }
    addInterest() {
        this.deposit((this.getBalance() * this.rate) / 100);
    }
    describe() {
        return \`\${this.owner} @ \${this.bankName}\`; // protected is OK in a subclass
    }
}
const acc = new SavingsAccount("SB-001", "Asha", 10000, 4);
acc.addInterest();
console.log(acc.describe(), "balance:", acc.getBalance());
console.log("withdraw 20000:", acc.withdraw(20000), "| withdraw 400:", acc.withdraw(400));
console.log("balance:", acc.getBalance());`,
      },
      result: `Console output:
Asha @ UpSkillr Bank balance: 10400
withdraw 20000: false | withdraw 400: true
balance: 10000`,
      explanation: '`balance` is private, so the only way to change it is through the methods, which enforce the rules. `SavingsAccount` can use the protected `bankName` but must call the public `getBalance()` to read the balance. `private rate` in the subclass constructor is a parameter property.',
    },
    {
      title: 'What the compiler blocks',
      scenario: 'Breaking each class rule once: private, protected, readonly and abstract.',
      steps: [
        'Create class-errors.ts',
        'Run `npx tsc --noEmit --strict class-errors.ts`',
      ],
      code: `class Account {
  readonly id: string = "A1";
  private balance = 0;
  protected branch = "Pune";
}

abstract class Shape {
  abstract area(): number;
}

const a = new Account();
a.balance = 1000000;     // private
console.log(a.branch);   // protected
a.id = "A2";             // readonly
const s = new Shape();   // abstract`,
      result: `This example intentionally does NOT compile. tsc reports:
error TS2341: Property 'balance' is private and only accessible within class 'Account'.
error TS2445: Property 'branch' is protected and only accessible within class 'Account' and its subclasses.
error TS2540: Cannot assign to 'id' because it is a read-only property.
error TS2511: Cannot create an instance of an abstract class.`,
      explanation: 'Each line breaks one rule. Remember these checks exist only at compile time: the emitted JavaScript would happily run `a.balance = 1000000`. Use `#balance` if you need privacy at runtime.',
    },
    {
      title: 'Parameter properties and implements for swappable services',
      scenario: 'A checkout service that works with a real payment gateway in production and a fake one in tests.',
      steps: [
        'Create checkout.ts',
        'Run it',
        'Remove the `charge` method from FakeGateway and see the implements error',
      ],
      code: `// Parameter properties + implements: a payment module with swappable gateways
interface PaymentGateway {
  readonly name: string;
  charge(amountInPaise: number, orderId: string): Promise<{ ok: boolean; txnId: string }>;
}

// "private readonly apiKey: string" declares AND assigns the property
class RazorpayGateway implements PaymentGateway {
  readonly name = "razorpay";
  constructor(private readonly apiKey: string) {}

  async charge(amountInPaise: number, orderId: string) {
    // a real class would call the Razorpay API using this.apiKey
    return { ok: true, txnId: \`rzp_\${orderId}_\${amountInPaise}_\${this.apiKey.slice(0, 3)}\` };
  }
}

class FakeGateway implements PaymentGateway {
  readonly name = "fake";
  public calls: string[] = [];

  async charge(amountInPaise: number, orderId: string) {
    this.calls.push(orderId);
    return { ok: amountInPaise < 1_000_000, txnId: "test_" + orderId };
  }
}

// The service depends on the INTERFACE, not on a specific class
class CheckoutService {
  constructor(private gateway: PaymentGateway) {}

  async pay(orderId: string, rupees: number): Promise<string> {
    const res = await this.gateway.charge(rupees * 100, orderId);
    return \`\${this.gateway.name}: \${res.ok ? "paid" : "declined"} (\${res.txnId})\`;
  }
}

async function main() {
  const live = new CheckoutService(new RazorpayGateway("key_live_123"));
  console.log(await live.pay("ORD7", 499));

  const fake = new FakeGateway();
  const test = new CheckoutService(fake);
  console.log(await test.pay("ORD8", 25000));
  console.log("fake calls:", fake.calls);
}
main();`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// "private readonly apiKey: string" declares AND assigns the property
class RazorpayGateway {
    apiKey;
    name = "razorpay";
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    async charge(amountInPaise, orderId) {
        // a real class would call the Razorpay API using this.apiKey
        return { ok: true, txnId: \`rzp_\${orderId}_\${amountInPaise}_\${this.apiKey.slice(0, 3)}\` };
    }
}
class FakeGateway {
    name = "fake";
    calls = [];
    async charge(amountInPaise, orderId) {
        this.calls.push(orderId);
        return { ok: amountInPaise < 1_000_000, txnId: "test_" + orderId };
    }
}
// The service depends on the INTERFACE, not on a specific class
class CheckoutService {
    gateway;
    constructor(gateway) {
        this.gateway = gateway;
    }
    async pay(orderId, rupees) {
        const res = await this.gateway.charge(rupees * 100, orderId);
        return \`\${this.gateway.name}: \${res.ok ? "paid" : "declined"} (\${res.txnId})\`;
    }
}
async function main() {
    const live = new CheckoutService(new RazorpayGateway("key_live_123"));
    console.log(await live.pay("ORD7", 499));
    const fake = new FakeGateway();
    const test = new CheckoutService(fake);
    console.log(await test.pay("ORD8", 25000));
    console.log("fake calls:", fake.calls);
}
main();`,
      },
      result: `Console output:
razorpay: paid (rzp_ORD7_49900_key)
fake: declined (test_ORD8)
fake calls: [ 'ORD8' ]`,
      explanation: '`constructor(private readonly apiKey: string) {}` creates and assigns the field in one line. Both gateways `implements PaymentGateway`, so TypeScript checks they have `name` and a matching `charge`. `CheckoutService` only knows the interface, so swapping implementations needs zero changes in its code.',
    },
    {
      title: 'Abstract class with the template method pattern',
      scenario: 'Email and SMS notifiers share validation logic but deliver messages differently.',
      steps: [
        'Create notifier.ts',
        'Run it',
        'Try `new Notifier("x")`: abstract classes cannot be instantiated',
      ],
      code: `// Abstract classes: shared logic + required methods for subclasses
abstract class Notifier {
  constructor(protected readonly recipient: string) {}

  // subclasses MUST implement this
  protected abstract deliver(message: string): string;

  // shared logic for all notifiers (template method pattern)
  send(message: string): string {
    if (!message.trim()) throw new Error("Empty message");
    const result = this.deliver(message.trim());
    return \`[\${this.constructor.name}] \${result}\`;
  }
}

class EmailNotifier extends Notifier {
  protected deliver(message: string): string {
    return \`email to \${this.recipient}: \${message}\`;
  }
}

class SmsNotifier extends Notifier {
  protected deliver(message: string): string {
    const short = message.length > 20 ? message.slice(0, 17) + "..." : message;
    return \`sms to \${this.recipient}: \${short}\`;
  }
}

const notifiers: Notifier[] = [
  new EmailNotifier("asha@example.com"),
  new SmsNotifier("+91 98765 43210"),
];

for (const n of notifiers) {
  console.log(n.send("  Your order #A102 has been shipped!  "));
}`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Abstract classes: shared logic + required methods for subclasses
class Notifier {
    recipient;
    constructor(recipient) {
        this.recipient = recipient;
    }
    // shared logic for all notifiers (template method pattern)
    send(message) {
        if (!message.trim())
            throw new Error("Empty message");
        const result = this.deliver(message.trim());
        return \`[\${this.constructor.name}] \${result}\`;
    }
}
class EmailNotifier extends Notifier {
    deliver(message) {
        return \`email to \${this.recipient}: \${message}\`;
    }
}
class SmsNotifier extends Notifier {
    deliver(message) {
        const short = message.length > 20 ? message.slice(0, 17) + "..." : message;
        return \`sms to \${this.recipient}: \${short}\`;
    }
}
const notifiers = [
    new EmailNotifier("asha@example.com"),
    new SmsNotifier("+91 98765 43210"),
];
for (const n of notifiers) {
    console.log(n.send("  Your order #A102 has been shipped!  "));
}`,
      },
      result: `Console output:
[EmailNotifier] email to asha@example.com: Your order #A102 has been shipped!
[SmsNotifier] sms to +91 98765 43210: Your order #A102 ...`,
      explanation: '`send()` contains the shared rules (trim, reject empty messages) and calls the abstract `deliver()`, which each subclass must implement. An array typed `Notifier[]` can hold any subclass, and each calls its own `deliver` (polymorphism). `this.constructor.name` prints the real subclass name.',
    },
    {
      title: 'Getters, setters, static members, override and #private',
      scenario: 'A product catalogue with validated prices, GST calculation and a factory method.',
      steps: [
        'Create product.ts',
        'Run it',
        'Notice in the playground JS that `#price` is kept (it is JavaScript) but `override` and `public` are removed',
      ],
      code: `// Getters/setters, static members, override and #private fields
class Product {
  static count = 0;                       // shared by all instances
  static readonly GST_RATE = 0.18;
  #price: number;                         // JS private field (truly private at runtime)

  constructor(public title: string, price: number) {
    this.#price = price;
    Product.count++;
  }

  get price(): number {
    return this.#price;
  }

  set price(value: number) {
    if (value < 0) throw new Error("Price cannot be negative");
    this.#price = value;
  }

  get priceWithGst(): number {
    return Math.round(this.#price * (1 + Product.GST_RATE));
  }

  label(): string {
    return \`\${this.title}: ₹\${this.priceWithGst}\`;
  }

  static fromJSON(json: string): Product {
    const data = JSON.parse(json) as { title: string; price: number };
    return new Product(data.title, data.price);
  }
}

class DigitalProduct extends Product {
  constructor(title: string, price: number, public downloadUrl: string) {
    super(title, price);
  }

  override label(): string {  // \`override\` makes the intent explicit
    return super.label() + " (instant download)";
  }
}

const book = new Product("TS Handbook", 500);
book.price = 600;                                   // uses the setter
const course = new DigitalProduct("MERN Course", 2999, "/dl/mern");
const mug = Product.fromJSON('{"title":"Coffee Mug","price":250}');

console.log(book.label());
console.log(course.label());
console.log(mug.label(), "| products created:", Product.count);
try {
  book.price = -5;
} catch (e) {
  console.log((e as Error).message);
}
console.log(Object.keys(book)); // #price is not an own enumerable key`,
      playground: {
        html: '<p>Open the console</p>',
        js: `// Getters/setters, static members, override and #private fields
class Product {
    title;
    static count = 0; // shared by all instances
    static GST_RATE = 0.18;
    #price; // JS private field (truly private at runtime)
    constructor(title, price) {
        this.title = title;
        this.#price = price;
        Product.count++;
    }
    get price() {
        return this.#price;
    }
    set price(value) {
        if (value < 0)
            throw new Error("Price cannot be negative");
        this.#price = value;
    }
    get priceWithGst() {
        return Math.round(this.#price * (1 + Product.GST_RATE));
    }
    label() {
        return \`\${this.title}: ₹\${this.priceWithGst}\`;
    }
    static fromJSON(json) {
        const data = JSON.parse(json);
        return new Product(data.title, data.price);
    }
}
class DigitalProduct extends Product {
    downloadUrl;
    constructor(title, price, downloadUrl) {
        super(title, price);
        this.downloadUrl = downloadUrl;
    }
    label() {
        return super.label() + " (instant download)";
    }
}
const book = new Product("TS Handbook", 500);
book.price = 600; // uses the setter
const course = new DigitalProduct("MERN Course", 2999, "/dl/mern");
const mug = Product.fromJSON('{"title":"Coffee Mug","price":250}');
console.log(book.label());
console.log(course.label());
console.log(mug.label(), "| products created:", Product.count);
try {
    book.price = -5;
}
catch (e) {
    console.log(e.message);
}
console.log(Object.keys(book)); // #price is not an own enumerable key`,
      },
      result: `Console output:
TS Handbook: ₹708
MERN Course: ₹3539 (instant download)
Coffee Mug: ₹295 | products created: 3
Price cannot be negative
[ 'title' ]`,
      explanation: 'The setter validates every assignment to `price`. `priceWithGst` is a computed getter. `count` and `fromJSON` are static, called on the class. `override label()` calls `super.label()` and extends it. `#price` is truly private at runtime, so it does not appear in `Object.keys`.',
    },
  ],
  interview: [
    {
      q: 'What are the access modifiers in TypeScript?',
      a: 'public (default, accessible everywhere), private (only within the declaring class), protected (within the class and subclasses) and readonly (cannot be reassigned after initialisation). They are compile-time checks.',
      level: 'Easy',
    },
    {
      q: 'Difference between TypeScript `private` and JavaScript `#private`?',
      a: 'TS `private` is only checked by the compiler and erased in the output; the property is still accessible at runtime (e.g. via `as any` or from JS code). `#field` is a JavaScript feature enforced by the runtime: it cannot be accessed outside the class at all, and is not visible in Object.keys or JSON.stringify.',
      level: 'Medium',
    },
    {
      q: 'What are parameter properties?',
      a: 'A shorthand where a constructor parameter with an access modifier or readonly (`constructor(private repo: Repo) {}`) automatically declares a class property and assigns the argument to it.',
      level: 'Easy',
    },
    {
      q: 'What does `implements` do?',
      a: 'It checks at compile time that a class satisfies an interface (or object type): all required members exist with compatible types. It does not inherit any code and does not change the class\'s types. A class can implement multiple interfaces.',
      level: 'Easy',
    },
    {
      q: 'Abstract class vs interface: when to use which?',
      a: 'An interface is a pure type contract with no runtime existence. An abstract class is a real class that can contain implemented methods, fields and constructor logic, plus abstract methods subclasses must implement; it cannot be instantiated. Use an interface for contracts and multiple implementations; use an abstract class when subclasses share code.',
      level: 'Medium',
    },
    {
      q: 'Can you create an instance of an abstract class?',
      a: 'No. `new Shape()` gives error TS2511: Cannot create an instance of an abstract class. You instantiate concrete subclasses that implement all abstract members.',
      level: 'Easy',
    },
    {
      q: 'What does the `override` keyword do?',
      a: 'It marks a method that overrides a base class method. If the base class does not have that method (e.g. it was renamed), TypeScript reports an error. With noImplicitOverride enabled, overriding without the keyword is also an error.',
      level: 'Medium',
    },
    {
      q: 'What is strictPropertyInitialization?',
      a: 'A strict-mode check requiring every class property to be initialised in its declaration or in the constructor. It prevents fields that are undefined at runtime despite a non-undefined type. Use `prop!: Type` (definite assignment) only when something else initialises it.',
      level: 'Medium',
    },
    {
      q: 'How do you implement a singleton in TypeScript?',
      a: `class Config {
  private static instance?: Config;
  private constructor() {}
  static get(): Config {
    return (Config.instance ??= new Config());
  }
}
The private constructor prevents \`new Config()\` outside the class.`,
      level: 'Medium',
    },
    {
      q: 'Can an interface extend a class?',
      a: 'Yes. The interface inherits the class\'s members (including private and protected ones) as types but not their implementations. Because of private members, only that class or its subclasses can then implement the interface. It is rarely used.',
      level: 'Hard',
    },
    {
      q: 'Are TypeScript classes compared structurally or nominally?',
      a: 'Structurally, like other types: an object literal with the same public members is assignable to a class type. The exception is private/protected members: two classes with a private member of the same name are not compatible unless they come from the same declaration.',
      level: 'Hard',
    },
    {
      q: 'How do you create a custom error class in TypeScript for an Express API?',
      a: `class AppError extends Error {
  constructor(public statusCode: number, message: string) {
    super(message);
    this.name = 'AppError';
  }
}
Then \`throw new AppError(404, 'Not found')\` and check \`err instanceof AppError\` in the error middleware.`,
      level: 'Medium',
    },
  ],
  practice: [
    {
      task: 'Implement a generic `Stack<T>` class with push, pop, peek, a `size` getter and isEmpty, storing items in a #private array. Use it as a browser-history stack.',
      hint: 'pop and peek return `T | undefined`.',
      solution: `class Stack<T> {
  #items: T[] = [];

  push(item: T): void {
    this.#items.push(item);
  }

  pop(): T | undefined {
    return this.#items.pop();
  }

  peek(): T | undefined {
    return this.#items[this.#items.length - 1];
  }

  get size(): number {
    return this.#items.length;
  }

  isEmpty(): boolean {
    return this.#items.length === 0;
  }
}

const visited = new Stack<string>();
visited.push("/home");
visited.push("/courses");
visited.push("/courses/ts");
console.log(visited.pop(), visited.peek(), visited.size); // /courses/ts /courses 2`,
    },
    {
      task: 'Define a `Logger` interface (info, error). Implement ConsoleLogger (with a prefix) and MemoryLogger (stores lines in an array). Inject either into a `UserService` that validates emails.',
      hint: 'UserService constructor: `constructor(private logger: Logger) {}`.',
      solution: `interface Logger {
  info(message: string): void;
  error(message: string): void;
}

class ConsoleLogger implements Logger {
  constructor(private readonly prefix: string) {}
  info(message: string): void {
    console.log(\`\${this.prefix} INFO  \${message}\`);
  }
  error(message: string): void {
    console.log(\`\${this.prefix} ERROR \${message}\`);
  }
}

class MemoryLogger implements Logger {
  readonly lines: string[] = [];
  info(message: string): void {
    this.lines.push("info:" + message);
  }
  error(message: string): void {
    this.lines.push("error:" + message);
  }
}

class UserService {
  constructor(private logger: Logger) {}
  register(email: string): boolean {
    if (!email.includes("@")) {
      this.logger.error("invalid email " + email);
      return false;
    }
    this.logger.info("registered " + email);
    return true;
  }
}

new UserService(new ConsoleLogger("[api]")).register("asha@example.com");
const mem = new MemoryLogger();
new UserService(mem).register("bad-email");
console.log(mem.lines);`,
    },
    {
      task: 'Create an abstract `Employee` class with name, protected baseSalary, an abstract `monthlyPay()` and a shared `payslip()`. Implement FullTimeEmployee (annual salary / 12) and Contractor (hourly rate × hours).',
      hint: 'Contractor can pass 0 as baseSalary to super.',
      solution: `abstract class Employee {
  constructor(public readonly name: string, protected baseSalary: number) {}

  abstract monthlyPay(): number;

  payslip(): string {
    return \`\${this.name}: ₹\${this.monthlyPay().toLocaleString("en-IN")}\`;
  }
}

class FullTimeEmployee extends Employee {
  monthlyPay(): number {
    return this.baseSalary / 12;
  }
}

class Contractor extends Employee {
  constructor(name: string, private hourlyRate: number, private hours: number) {
    super(name, 0);
  }
  monthlyPay(): number {
    return this.hourlyRate * this.hours;
  }
}

const team: Employee[] = [new FullTimeEmployee("Asha", 960000), new Contractor("Ravi", 800, 120)];
team.forEach((e) => console.log(e.payslip()));
// Asha: ₹80,000
// Ravi: ₹96,000`,
    },
    {
      task: 'Write a `Temperature` value class with a private constructor and two static factory methods, fromCelsius and fromFahrenheit, plus a `fahrenheit` getter and toString().',
      hint: 'A private constructor forces callers to use the static factories.',
      solution: `class Temperature {
  private constructor(private readonly celsius: number) {}

  static fromCelsius(c: number): Temperature {
    return new Temperature(c);
  }

  static fromFahrenheit(f: number): Temperature {
    return new Temperature(((f - 32) * 5) / 9);
  }

  get fahrenheit(): number {
    return (this.celsius * 9) / 5 + 32;
  }

  toString(): string {
    return \`\${this.celsius.toFixed(1)}°C / \${this.fahrenheit.toFixed(1)}°F\`;
  }
}

console.log(Temperature.fromCelsius(37).toString());     // 37.0°C / 98.6°F
console.log(Temperature.fromFahrenheit(212).toString()); // 100.0°C / 212.0°F
// new Temperature(5); // Error: Constructor of class 'Temperature' is private`,
    },
  ],
  quiz: [
    {
      question: 'Which modifier allows access in the class and its subclasses, but not from outside?',
      options: [
        'private',
        'public',
        'readonly',
        'protected',
      ],
      answer: 3,
      explanation: 'protected members are visible to subclasses only.',
    },
    {
      question: 'What does `constructor(private name: string) {}` do?',
      options: [
        'Declares a private property name and assigns the argument',
        'Only types the parameter',
        'Makes the constructor private',
        'Creates a static property',
      ],
      answer: 0,
      explanation: 'This is a parameter property.',
    },
    {
      question: 'Which one gives privacy that is enforced at runtime?',
      options: [
        'private balance',
        'protected balance',
        '#balance',
        'readonly balance',
      ],
      answer: 2,
      explanation: '#private fields are a JavaScript runtime feature; TS modifiers are erased.',
    },
    {
      question: 'What happens with `new Shape()` if Shape is abstract?',
      options: [
        'It works but abstract methods return undefined',
        'Compile error: cannot create an instance of an abstract class',
        'Runtime error only',
        'It creates a subclass automatically',
      ],
      answer: 1,
      explanation: 'Abstract classes cannot be instantiated (TS2511).',
    },
    {
      question: 'How many interfaces can a class implement?',
      options: [
        'Only one',
        'One plus one abstract class',
        'None, only classes can be extended',
        'Any number',
      ],
      answer: 3,
      explanation: '`class A implements B, C, D` is allowed; only `extends` is limited to one class.',
    },
  ],
};
