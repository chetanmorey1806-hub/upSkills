const ex1 = `// A class is a blueprint; objects created with new are instances
class Student {
  constructor(name, marks) {
    this.name = name;        // instance properties
    this.marks = marks;
  }

  average() {                // method (shared by all instances)
    const sum = this.marks.reduce((a, b) => a + b, 0);
    return sum / this.marks.length;
  }

  report() {
    return this.name + ' scored an average of ' + this.average().toFixed(1);
  }
}

const s1 = new Student('Asha', [80, 92, 75]);
const s2 = new Student('Ravi', [60, 70, 65]);

console.log(s1.report());
console.log(s2.report());
console.log(typeof Student);                       // classes are functions
console.log(s1 instanceof Student);
console.log(s1.average === s2.average);            // same shared method

try {
  Student('X', []);                                // forgot "new"
} catch (err) {
  console.log(err.name + ':', err.message);
}`;

const ex2 = `// Getters, setters, private fields (#) and validation
class BankAccount {
  #balance = 0;                       // private field - not accessible outside
  static #count = 0;                  // private static field

  constructor(owner, opening = 0) {
    this.owner = owner;
    this.deposit(opening);
    BankAccount.#count++;
  }

  get balance() {                     // read like a property: acc.balance
    return this.#balance;
  }

  set balance(value) {                // runs on: acc.balance = ...
    throw new Error('Use deposit() or withdraw() instead');
  }

  deposit(amount) {
    if (amount < 0) throw new Error('Deposit must be positive');
    this.#balance += amount;
    return this;                      // return this -> allows chaining
  }

  withdraw(amount) {
    if (amount > this.#balance) throw new Error('Insufficient funds');
    this.#balance -= amount;
    return this;
  }

  static get count() { return BankAccount.#count; }
}

const acc = new BankAccount('Meera', 1000);
acc.deposit(500).withdraw(200);              // method chaining
console.log(acc.owner, 'balance:', acc.balance);

try { acc.balance = 1000000; } catch (e) { console.log('Setter says:', e.message); }
try { acc.withdraw(5000); } catch (e) { console.log('Withdraw says:', e.message); }

console.log('Private field visible?', Object.keys(acc));
new BankAccount('Kiran');
console.log('Accounts created:', BankAccount.count);`;

const ex3 = `// static methods/properties belong to the CLASS, not to instances
class Temperature {
  static ABSOLUTE_ZERO = -273.15;

  constructor(celsius) {
    if (celsius < Temperature.ABSOLUTE_ZERO) throw new RangeError('Below absolute zero');
    this.celsius = celsius;
  }

  get fahrenheit() {
    return this.celsius * 9 / 5 + 32;
  }

  static fromFahrenheit(f) {         // a "factory" method
    return new Temperature((f - 32) * 5 / 9);
  }

  static compare(a, b) {
    return a.celsius - b.celsius;
  }
}

const temps = [new Temperature(30), Temperature.fromFahrenheit(212), new Temperature(-5)];
temps.sort(Temperature.compare);
console.log(temps.map((t) => t.celsius + 'C = ' + t.fahrenheit + 'F').join(' | '));
console.log('Absolute zero:', Temperature.ABSOLUTE_ZERO);
console.log('Instance has static?', temps[0].fromFahrenheit);
try { new Temperature(-300); } catch (e) { console.log(e.name + ':', e.message); }`;

const ex4 = `// Inheritance with extends and super
class Animal {
  constructor(name) {
    this.name = name;
  }
  speak() {
    return this.name + ' makes a sound';
  }
  describe() {
    return 'I am ' + this.name + '. ' + this.speak();
  }
}

class Dog extends Animal {
  constructor(name, breed) {
    super(name);              // MUST call super() before using this
    this.breed = breed;
  }
  speak() {                   // override
    return this.name + ' barks';
  }
}

class Puppy extends Dog {
  speak() {
    return super.speak() + ' softly';   // call the parent version
  }
}

const animals = [new Animal('Generic'), new Dog('Rex', 'Labrador'), new Puppy('Bolt', 'Beagle')];
animals.forEach((a) => console.log(a.describe()));   // polymorphism

const bolt = animals[2];
console.log(bolt.breed, bolt instanceof Puppy, bolt instanceof Dog, bolt instanceof Animal);

class Cat extends Animal {
  constructor(name) {
    try {
      this.lives = 9;        // using this before super()
    } catch (e) {
      console.log('Cat error:', e.name);
    }
    super(name);
  }
}
new Cat('Tom');`;

const ex5html = `<div id="shapes"></div>`;

const ex5css = `body { font-family: system-ui, sans-serif; }
#shapes { display: flex; gap: 16px; flex-wrap: wrap; align-items: flex-end; }
.shape { background: #7e57c2; color: #fff; display: grid; place-items: center; font-size: 12px; text-align: center; }
.circle { border-radius: 50%; background: #26a69a; }`;

const ex5js = `// OOP design: abstract-like base class + subclasses + polymorphism
class Shape {
  constructor(name) {
    if (new.target === Shape) throw new Error('Shape is abstract');
    this.name = name;
  }
  area() { throw new Error('area() must be implemented'); }
  toString() { return this.name + ' (area ' + this.area().toFixed(1) + ')'; }
  render() {
    const el = document.createElement('div');
    el.className = 'shape ' + this.name.toLowerCase();
    el.textContent = this.toString();
    this.applySize(el);
    return el;
  }
}

class Rectangle extends Shape {
  constructor(w, h) { super('Rectangle'); this.w = w; this.h = h; }
  area() { return this.w * this.h; }
  applySize(el) { el.style.width = this.w + 'px'; el.style.height = this.h + 'px'; }
}

class Square extends Rectangle {
  constructor(side) { super(side, side); this.name = 'Square'; }
}

class Circle extends Shape {
  constructor(r) { super('Circle'); this.r = r; }
  area() { return Math.PI * this.r ** 2; }
  applySize(el) { el.style.width = el.style.height = this.r * 2 + 'px'; }
}

const shapes = [new Rectangle(160, 90), new Square(110), new Circle(60)];
const box = document.querySelector('#shapes');
shapes.forEach((s) => box.appendChild(s.render()));
console.log(shapes.map(String).join('\\n'));
try { new Shape('x'); } catch (e) { console.log(e.message); }`;

export default {
  id: 'day-36-classes-oop',
  title: 'Classes and OOP: constructor, Methods, Getters/Setters, static, Inheritance (extends, super)',
  module: 'Module 6: Advanced JavaScript',
  day: 36,
  level: 'Intermediate',
  duration: '2 hours',
  summary:
    'Classes are blueprints for creating many similar objects. You will learn the class syntax, encapsulation with private fields and getters/setters, static members, and inheritance with extends/super – the core of Object-Oriented Programming in JavaScript.',
  objectives: [
    'Define classes with a constructor, instance properties and methods',
    'Use getters, setters and #private fields for encapsulation',
    'Create static methods and properties that belong to the class itself',
    'Build class hierarchies with extends, super() and method overriding',
    'Explain the four OOP pillars: encapsulation, abstraction, inheritance, polymorphism',
  ],
  theory: [
    {
      heading: 'What is a Class?',
      content:
        'A **class** is a **blueprint** (like an architect\'s drawing for a house). Each object created from it with `new` is an **instance** (an actual house). All houses follow the same plan but each has its own colour and owner.\n\nBefore ES2015 we made blueprints with constructor functions and prototypes (Day 37). The `class` syntax is a cleaner way to write the same thing.\n\nKey facts:\n- Class names use **PascalCase**: `Student`, `BankAccount`\n- Classes must be called with `new`, otherwise a TypeError is thrown\n- Class bodies always run in **strict mode**\n- Class declarations are hoisted but stay in the **TDZ** (Day 12) – you cannot use a class before its line',
      syntax: `class Student {
  constructor(name) {   // runs once for each new instance
    this.name = name;
  }
  greet() {             // method shared by all instances
    return 'Hi, I am ' + this.name;
  }
}
const s = new Student('Asha');
s.greet(); // 'Hi, I am Asha'`,
    },
    {
      heading: 'The constructor and Methods',
      content:
        'The `constructor` is a special method called automatically by `new`. Use it to set up **instance properties** with `this.prop = value`.\n\nWhat `new` does:\n1. Creates a new empty object\n2. Links it to the class prototype (so methods are found)\n3. Runs the constructor with `this` = that new object\n4. Returns the object\n\nMethods written inside the class body are stored **once** on the prototype and shared by every instance (memory efficient). **Class fields** like `count = 0;` written directly in the body create a property on **each** instance.',
      tip: 'Do not put commas between class methods – a class body is not an object literal.',
    },
    {
      heading: 'Encapsulation: Getters, Setters and #private Fields',
      content:
        '**Encapsulation** means hiding internal data and exposing a safe interface. Think of an ATM: you cannot touch the money directly; you use buttons that check your balance first.\n\n- **#private fields** (`#balance`) can only be accessed inside the class body. Outside access is a SyntaxError.\n- **getter** (`get balance()`) – read a computed or protected value like a property: `acc.balance`\n- **setter** (`set balance(v)`) – runs validation when someone assigns: `acc.balance = 5`\n\nPrivate methods also exist: `#validate() {}`.',
      syntax: `class User {
  #password;
  constructor(pw) { this.#password = pw; }
  get masked() { return '*'.repeat(this.#password.length); }
  set password(pw) {
    if (pw.length < 8) throw new Error('Too short');
    this.#password = pw;
  }
}`,
      tip: 'A getter without a setter makes a property read-only (assignments are ignored, or throw in strict mode). Never name the getter and the stored field the same (get name() { return this.name } → infinite recursion).',
    },
    {
      heading: 'static Members',
      content:
        '`static` methods and properties belong to the **class itself**, not to instances. Call them as `ClassName.method()`.\n\nUse them for:\n- **Utility/helper functions** related to the class: `Math.max`, `Array.isArray`, `Number.isInteger` are all static\n- **Factory methods** that create instances in different ways: `Temperature.fromFahrenheit(212)`\n- **Shared constants or counters**: `BankAccount.count`\n\nInside a static method, `this` refers to the class.',
    },
    {
      heading: 'Inheritance: extends and super',
      content:
        '**Inheritance** lets a child class reuse and extend a parent class. A `Dog` **is an** `Animal`, so it gets all Animal methods for free.\n\n- `class Dog extends Animal` – sets up the parent-child link\n- `super(args)` – calls the parent constructor. In a child constructor you **must call super() before using this**, otherwise a ReferenceError is thrown\n- If a child has no constructor, a default one calls `super(...args)` for you\n- **Overriding**: define a method with the same name in the child\n- `super.method()` – call the parent version from inside an overriding method\n\n`instanceof` checks the whole chain: a Puppy is also a Dog and an Animal.',
      syntax: `class Dog extends Animal {
  constructor(name, breed) {
    super(name);          // parent sets this.name
    this.breed = breed;
  }
  speak() {
    return super.speak() + ' (woof)';
  }
}`,
      tip: 'Prefer composition ("has a") over deep inheritance trees ("is a"). More than 2-3 levels of extends is usually a design smell.',
    },
    {
      heading: 'The Four Pillars of OOP',
      content:
        '1. **Encapsulation** – bundle data and methods together and hide internals (#private, getters/setters)\n2. **Abstraction** – expose only what is needed; users call `account.withdraw(100)` without knowing how it works inside\n3. **Inheritance** – child classes reuse parent code (`extends`)\n4. **Polymorphism** – "many forms": different classes respond to the same method call in their own way (`shape.area()` works for Circle and Rectangle)\n\nJavaScript has no `abstract` keyword, but you can simulate an abstract class by throwing when `new.target === BaseClass`.',
      tip: 'Coming next (Day 37): what classes really are under the hood – prototypes.',
    },
  ],
  examples: [
    {
      title: 'Your first class: Student',
      scenario: 'Store student names and marks and compute averages for many students.',
      steps: [
        'Write class Student with a constructor(name, marks)',
        'Add average() and report() methods',
        'Create two instances with new and call report()',
        'Try calling Student() without new, then click Run',
      ],
      code: ex1,
      playground: { js: ex1 },
      result:
        "Asha scored an average of 82.3\nRavi scored an average of 65.0\nfunction\ntrue\ntrue\nTypeError: Class constructor Student cannot be invoked without 'new'",
      explanation:
        'Each instance has its own name and marks, but average is shared (s1.average === s2.average) because methods live on the prototype. typeof a class is "function". Classes refuse to run without new.',
    },
    {
      title: 'Encapsulation with #private, get and set',
      scenario: 'A bank account whose balance cannot be changed directly – only through deposit and withdraw.',
      steps: [
        'Declare #balance and static #count private fields',
        'Add a getter for balance and a setter that throws',
        'Validate inside deposit/withdraw and return this for chaining',
        'Click Run and try to break the rules',
      ],
      code: ex2,
      playground: { js: ex2 },
      result:
        'Meera balance: 1300\nSetter says: Use deposit() or withdraw() instead\nWithdraw says: Insufficient funds\nPrivate field visible? [ \'owner\' ]\nAccounts created: 2',
      explanation:
        'acc.balance calls the getter. Assigning runs the setter which throws. Object.keys shows only public properties – #balance is truly hidden. The static private counter is shared by the class and exposed via a static getter.',
    },
    {
      title: 'static properties and factory methods',
      scenario: 'A Temperature class with a constant, a factory method and a comparison helper.',
      steps: [
        'Add static ABSOLUTE_ZERO and validate in the constructor',
        'Add a fahrenheit getter',
        'Add static fromFahrenheit() and static compare()',
        'Sort instances with Temperature.compare and click Run',
      ],
      code: ex3,
      playground: { js: ex3 },
      result:
        '-5C = 23F | 30C = 86F | 100C = 212F\nAbsolute zero: -273.15\nInstance has static? undefined\nRangeError: Below absolute zero',
      explanation:
        'Static members are reached through the class name. Instances do not see them (undefined). The factory converts 212F into a Temperature of 100C.',
    },
    {
      title: 'Inheritance, overriding and super',
      scenario: 'Animal → Dog → Puppy hierarchy where each level changes how speak() works.',
      steps: [
        'Write the Animal base class with speak() and describe()',
        'Extend it with Dog: call super(name), override speak()',
        'Extend Dog with Puppy and use super.speak()',
        'Try using this before super() in Cat, then click Run',
      ],
      code: ex4,
      playground: { js: ex4 },
      result:
        'I am Generic. Generic makes a sound\nI am Rex. Rex barks\nI am Bolt. Bolt barks softly\nBeagle true true true\nCat error: ReferenceError',
      explanation:
        'describe() is defined only in Animal, but this.speak() inside it calls the most specific version (polymorphism). Puppy has no constructor, so the default one passes arguments to Dog. Accessing this before super() throws a ReferenceError.',
    },
    {
      title: 'Shapes: abstraction + polymorphism rendered on the page',
      scenario: 'Different shape classes share one interface (area, render) and draw themselves.',
      steps: [
        'Create an abstract-like Shape class that blocks direct new Shape()',
        'Create Rectangle, Square (extends Rectangle) and Circle with their own area()',
        'Loop over the array and call render() on each',
        'Click Run and check the page and console',
      ],
      code: ex5js,
      playground: { html: ex5html, css: ex5css, js: ex5js },
      result:
        'Three shapes appear: a purple 160x90 rectangle, a 110x110 square and a teal circle. Console:\nRectangle (area 14400.0)\nSquare (area 12100.0)\nCircle (area 11309.7)\nShape is abstract',
      explanation:
        'The loop does not care which shape it has – each object knows its own area() and applySize(). new.target lets the base class refuse direct instantiation, simulating an abstract class.',
    },
  ],
  interview: [
    {
      q: 'What is a class in JavaScript?',
      a: 'A template for creating objects, introduced in ES2015. It is syntactic sugar over constructor functions and prototypal inheritance; typeof a class is "function".',
      level: 'Easy',
    },
    {
      q: 'What does the new keyword do?',
      a: 'It creates an empty object, links its [[Prototype]] to Class.prototype, calls the constructor with this bound to the new object, and returns that object (unless the constructor returns another object).',
      level: 'Medium',
    },
    {
      q: 'Why must super() be called before this in a derived constructor?',
      a: 'In a derived class the object is created by the parent constructor. Until super() runs, this is uninitialised, so accessing it throws a ReferenceError.',
      level: 'Medium',
    },
    {
      q: 'What are static methods? Give built-in examples.',
      a: 'Methods defined on the class itself, called via ClassName.method(), not available on instances. Examples: Array.isArray, Object.keys, Math.max, Promise.all, Number.isNaN.',
      level: 'Easy',
    },
    {
      q: 'How do you create private properties in a class?',
      a: 'Prefix them with #: class A { #secret = 1; } They are accessible only inside the class body. Older approaches used closures, WeakMaps or the _underscore naming convention (not truly private).',
      level: 'Medium',
    },
    {
      q: 'What are getters and setters?',
      a: 'Methods declared with get/set that are accessed like properties. A getter runs on read (obj.full), a setter runs on assignment (obj.full = "x"). Used for computed values and validation.',
      level: 'Easy',
    },
    {
      q: 'Explain the four pillars of OOP.',
      a: 'Encapsulation (hide internal state), Abstraction (expose a simple interface), Inheritance (reuse parent behaviour via extends), Polymorphism (same method name, different behaviour per class).',
      level: 'Medium',
    },
    {
      q: 'Are classes hoisted?',
      a: 'They are hoisted but not initialised (temporal dead zone), so using a class before its declaration throws a ReferenceError, unlike function declarations.',
      level: 'Medium',
    },
    {
      q: 'Difference between a class field (x = 1) and a method in the class body?',
      a: 'A field creates an own property on every instance. A method is defined once on the prototype and shared. Arrow-function fields (handle = () => {}) are per-instance but keep this bound to the instance.',
      level: 'Hard',
    },
    {
      q: 'What is method overriding and how do you call the parent method?',
      a: 'Defining a method in the child with the same name as in the parent replaces it for child instances. Use super.methodName(...) inside the child to call the parent version.',
      level: 'Easy',
    },
    {
      q: 'Output?\nclass A { constructor() { this.x = 1; } get x2() { return this.x * 2; } }\nconst a = new A(); a.x = 5; console.log(a.x2);',
      a: '10. The getter is evaluated on each access and uses the current value of this.x (5).',
      level: 'Easy',
    },
  ],
  practice: [
    {
      task: 'Create a class Rectangle with width and height, methods area() and perimeter(), and a getter isSquare.',
      hint: 'get isSquare() { return this.width === this.height; }',
      solution: `class Rectangle {
  constructor(width, height) {
    this.width = width;
    this.height = height;
  }
  area() { return this.width * this.height; }
  perimeter() { return 2 * (this.width + this.height); }
  get isSquare() { return this.width === this.height; }
}
const r = new Rectangle(4, 4);
console.log(r.area(), r.perimeter(), r.isSquare); // 16 16 true`,
    },
    {
      task: 'Create a Counter class with a #count private field and increment(), decrement() (never below 0), and a value getter.',
      hint: 'Math.max(0, ...) in decrement.',
      solution: `class Counter {
  #count = 0;
  increment() { this.#count++; return this; }
  decrement() { this.#count = Math.max(0, this.#count - 1); return this; }
  get value() { return this.#count; }
}
const c = new Counter();
c.increment().increment().decrement().decrement().decrement();
console.log(c.value); // 0`,
    },
    {
      task: 'Create Employee(name, salary) with getAnnualSalary(), and Manager extends Employee adding a bonus and overriding getAnnualSalary() to include it.',
      hint: 'return super.getAnnualSalary() + this.bonus;',
      solution: `class Employee {
  constructor(name, salary) { this.name = name; this.salary = salary; }
  getAnnualSalary() { return this.salary * 12; }
}
class Manager extends Employee {
  constructor(name, salary, bonus) {
    super(name, salary);
    this.bonus = bonus;
  }
  getAnnualSalary() { return super.getAnnualSalary() + this.bonus; }
}
console.log(new Employee('A', 1000).getAnnualSalary()); // 12000
console.log(new Manager('B', 1000, 5000).getAnnualSalary()); // 17000`,
    },
    {
      task: 'Create a User class with a static method fromJSON(json) that parses a JSON string and returns a User instance, and a static counter of how many users were created.',
      hint: 'static count = 0; increment in the constructor with User.count++.',
      solution: `class User {
  static count = 0;
  constructor(name, email) {
    this.name = name;
    this.email = email;
    User.count++;
  }
  static fromJSON(json) {
    const { name, email } = JSON.parse(json);
    return new User(name, email);
  }
}
const u = User.fromJSON('{"name":"Asha","email":"a@x.com"}');
console.log(u instanceof User, u.name, User.count); // true Asha 1`,
    },
    {
      task: 'Build a Vehicle → Car / Bike hierarchy where each class has a wheels property and a describe() method; loop over an array and print descriptions (polymorphism).',
      hint: 'Let the base describe() use this.wheels set by each child.',
      solution: `class Vehicle {
  constructor(brand, wheels) { this.brand = brand; this.wheels = wheels; }
  describe() { return this.brand + ' has ' + this.wheels + ' wheels'; }
}
class Car extends Vehicle { constructor(brand) { super(brand, 4); } }
class Bike extends Vehicle {
  constructor(brand) { super(brand, 2); }
  describe() { return super.describe() + ' and no roof'; }
}
[new Car('Tata'), new Bike('Hero')].forEach((v) => console.log(v.describe()));`,
    },
  ],
  quiz: [
    {
      question: 'What is typeof class A {} ?',
      options: ['"class"', '"object"', '"function"', '"undefined"'],
      answer: 2,
      explanation: 'Classes are special functions.',
    },
    {
      question: 'In a child constructor, what must you do before using this?',
      options: ['Call super()', 'Call this.init()', 'Return an object', 'Nothing'],
      answer: 0,
      explanation: 'Otherwise a ReferenceError is thrown.',
    },
    {
      question: 'How do you call a static method sum on class MathUtil?',
      options: ['new MathUtil().sum()', 'MathUtil.prototype.sum()', 'this.sum()', 'MathUtil.sum()'],
      answer: 3,
      explanation: 'Static members are accessed through the class name.',
    },
    {
      question: 'Which declares a truly private field?',
      options: ['_balance = 0', '#balance = 0', 'private balance = 0', 'static balance = 0'],
      answer: 1,
      explanation: '# private fields are enforced by the language; _ is only a naming convention.',
    },
    {
      question: 'Different subclasses implementing the same method name differently is called...',
      options: ['Encapsulation', 'Abstraction', 'Hoisting', 'Polymorphism'],
      answer: 3,
      explanation: 'Polymorphism = one interface, many forms.',
    },
  ],
};
