export default {
  lesson: 'day-28-instance-class-static-methods',
  minutes: 30,
  intro: 'Choose between instance methods, @classmethod (alternative constructors) and @staticmethod (utilities) and use each correctly.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You want `Employee.from_string("Asha-Developer-55000")` to build an Employee from text, and it should also work for subclasses. Which method type?',
      options: ['Instance method', '@classmethod', '@staticmethod', 'A global function only'],
      answer: 1,
      explain: 'A classmethod receives the class as `cls`, so `return cls(...)` creates an object of whichever class it was called on (a subclass too). This "alternative constructor" pattern is the classic classmethod use case (like `dict.fromkeys`, `datetime.fromisoformat`).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `class Shape:
    sides = 0
    @classmethod
    def describe(cls):
        return f"{cls.__name__} has {cls.sides} sides"
    @staticmethod
    def is_positive(n):
        return n > 0

class Triangle(Shape):
    sides = 3

print(Shape.describe())
print(Triangle.describe())
print(Triangle().is_positive(-2))`,
      expected: 'Shape has 0 sides\nTriangle has 3 sides\nFalse',
      explain: '`cls` is the class the method was **called on**, so `Triangle.describe()` sees Triangle and its `sides = 3`. Static methods get no self or cls; they can be called from the class or an object.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Create a class `BankAccount` with **instance methods**:\n- `__init__(self, owner, balance=0)`\n- `deposit(amount)` → adds and returns the new balance\n- `withdraw(amount)` → if amount > balance return `"Insufficient balance"` (balance unchanged), else subtract and return the new balance',
      example: { title: 'instance method changing state', code: 'class Counter:\n    def __init__(self):\n        self.value = 0\n    def increment(self):\n        self.value += 1\n        return self.value' },
      starter: `class BankAccount:
    def __init__(self, owner, balance=0):
        pass  # TODO

    def deposit(self, amount):
        pass  # TODO

    def withdraw(self, amount):
        pass  # TODO
`,
      solution: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance

    def deposit(self, amount):
        self.balance += amount
        return self.balance

    def withdraw(self, amount):
        if amount > self.balance:
            return "Insufficient balance"
        self.balance -= amount
        return self.balance
`,
      tests: [
        { call: '(lambda a: [a.deposit(500), a.withdraw(200), a.balance])(BankAccount("Asha", 1000))', expect: [1500, 1300, 1300] },
        { call: '(lambda a: [a.withdraw(50), a.balance])(BankAccount("Ravi"))', expect: ['Insufficient balance', 0] },
      ],
      explain: 'Instance methods read and change **this object’s** state through `self`. Writing `balance += amount` (without self.) creates a local variable and raises UnboundLocalError.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Add to `Employee`:\n- a **classmethod** `from_string(cls, text)` that parses `"Asha-Developer-55000"` (name-role-salary) and returns a new object (salary as int)\n- a **staticmethod** `is_valid_salary(amount)` → True if amount is between 10000 and 10000000',
      example: { title: 'alternative constructor', code: 'class Point:\n    def __init__(self, x, y):\n        self.x, self.y = x, y\n\n    @classmethod\n    def from_tuple(cls, t):\n        return cls(t[0], t[1])' },
      starter: `class Employee:
    def __init__(self, name, role, salary):
        self.name = name
        self.role = role
        self.salary = salary

    # TODO: from_string (classmethod)

    # TODO: is_valid_salary (staticmethod)
`,
      solution: `class Employee:
    def __init__(self, name, role, salary):
        self.name = name
        self.role = role
        self.salary = salary

    @classmethod
    def from_string(cls, text):
        name, role, salary = text.split("-")
        return cls(name, role, int(salary))

    @staticmethod
    def is_valid_salary(amount):
        return 10000 <= amount <= 10000000
`,
      tests: [
        { call: '(lambda e: [e.name, e.role, e.salary])(Employee.from_string("Asha-Developer-55000"))', expect: ['Asha', 'Developer', 55000] },
        { call: '(lambda S: type(S.from_string("Ravi-Lead-90000")).__name__)(type("Manager", (Employee,), {}))', expect: 'Manager', msg: 'from_string must use cls(...) so it works for subclasses' },
        { call: 'Employee.is_valid_salary(5000)', expect: false },
        { call: 'Employee.is_valid_salary(55000)', expect: true },
      ],
      explain: 'Use `cls(...)` instead of `Employee(...)` inside the classmethod so subclasses get objects of their own type. A static method is just a function grouped in the class: it does not need self or cls.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: 'Create a class `Converter` with two **static methods**:\n- `km_to_miles(km)` → km × 0.621371 rounded to 2\n- `c_to_f(c)` → c × 9/5 + 32 rounded to 1',
      example: { title: 'static utility method', code: 'class MathUtil:\n    @staticmethod\n    def is_even(n):\n        return n % 2 == 0\n\nprint(MathUtil.is_even(4))' },
      starter: `class Converter:
    # TODO
    pass
`,
      solution: `class Converter:
    @staticmethod
    def km_to_miles(km):
        return round(km * 0.621371, 2)

    @staticmethod
    def c_to_f(c):
        return round(c * 9 / 5 + 32, 1)
`,
      tests: [
        { call: 'Converter.km_to_miles(10)', expect: 6.21 },
        { call: 'Converter.c_to_f(37.5)', expect: 99.5 },
        { call: 'Converter().c_to_f(36.6)', expect: 97.9, msg: 'must also work when called on an object' },
      ],
      explain: 'Without `@staticmethod`, calling `Converter().c_to_f(36.6)` would pass the object as the first argument and fail. Static methods suit pure helpers that need no object or class data.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements are true? (select all that apply)',
      options: [
        'A classmethod’s first parameter receives the class (usually named cls)',
        'A staticmethod can directly read self.name',
        'Instance methods can also read class variables through self',
        'Classmethods are often used as alternative constructors',
      ],
      answers: [0, 2, 3],
      explain: 'Static methods get neither self nor cls, so they cannot see instance data unless you pass it in. Instance methods can read class variables via `self.var` (lookup goes object → class).',
    },
  ],
};
