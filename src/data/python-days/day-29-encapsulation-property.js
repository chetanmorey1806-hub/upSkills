export default {
  id: "day-29-encapsulation-property",
  title: "Encapsulation: public, protected, private (name mangling), @property",
  module: "Module 5: Object-Oriented Programming",
  day: 29,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Protect an object's data by bundling it with the methods that control it: use Python's public, _protected and __private naming conventions, understand name mangling, and replace getters/setters with Pythonic @property validation.",
  objectives: [
    "Explain encapsulation and data hiding with real examples",
    "Use public, protected (_name) and private (__name) attributes",
    "Understand name mangling (_ClassName__attr) and its purpose",
    "Write getters, setters and deleters with @property",
    "Create read-only and computed properties",
  ],
  theory: [
    {
      heading: "What is Encapsulation?",
      content: "Encapsulation means keeping data and the methods that work on it together inside a class, and controlling how the outside world can change that data. Analogy: an ATM. You cannot open the machine and take cash from the vault; you use the screen (public methods) which checks your PIN and balance first. The vault (data) is hidden and only changed through safe operations.",
      points: [
        "Prevents invalid states (negative balance, age = -5)",
        "Lets you change internal implementation without breaking users of the class",
        "Python relies on conventions: \"we are all consenting adults\" - nothing is truly private",
      ],
    },
    {
      heading: "Public, Protected and Private",
      content: "Public (name): accessible from anywhere - the default. Protected (_name, one underscore): a convention meaning \"internal - for this class and its subclasses, please do not touch from outside\"; Python does not block access. Private (__name, two leading underscores): Python performs name mangling - it renames the attribute to _ClassName__name, so it cannot be accessed accidentally as obj.__name and does not clash with attributes in subclasses.",
      syntax: `class Account:
    def __init__(self):
        self.owner = "Asha"      # public
        self._branch = "Pune"    # protected (convention)
        self.__pin = 1234        # private (name mangled)

a = Account()
a.owner           # OK
a._branch         # works, but you should not
a.__pin           # AttributeError
a._Account__pin   # 1234 - mangled name (do not do this!)
`,
    },
    {
      heading: "Getters and Setters the Old Way",
      content: "In Java-style code you write get_balance() and set_balance(value) methods so that validation happens before changing data. It works in Python too, but it makes the calling code noisy: acc.set_balance(acc.get_balance() + 100).",
    },
    {
      heading: "@property: Pythonic Getters and Setters",
      content: "@property turns a method into an attribute-like getter. @name.setter defines what happens on assignment, so you can validate. @name.deleter runs on del obj.name. Users still write obj.salary = 5000, but your validation code runs. A property without a setter is read-only; a property can also be computed from other attributes (like area from width and height).",
      syntax: `class Employee:
    def __init__(self, salary):
        self.salary = salary          # goes through the setter!

    @property
    def salary(self):
        return self._salary

    @salary.setter
    def salary(self, value):
        if value < 0:
            raise ValueError("salary cannot be negative")
        self._salary = value
`,
      tip: "Inside the property, store the value in a differently named attribute (self._salary). Writing self.salary = value inside the setter calls the setter again -> RecursionError.",
    },
    {
      heading: "When to Use What",
      content: "Start with plain public attributes. If you later need validation or computed values, convert to @property - the calling code does not change. Use _protected for internal helpers. Use __private mainly to avoid name clashes in inheritance, not as security.",
    },
  ],
  examples: [
    {
      title: "Public, Protected, Private and Name Mangling",
      scenario: "A bank account exposes the owner, marks branch as internal and hides the PIN.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class BankAccount:
    def __init__(self, owner, balance, pin):
        self.owner = owner          # public
        self._branch = "Pune"       # protected
        self.__pin = pin            # private
        self.__balance = balance

    def withdraw(self, amount, pin):
        if pin != self.__pin:
            return "Wrong PIN"
        if amount > self.__balance:
            return "Insufficient balance"
        self.__balance -= amount
        return f"Withdrew {amount}, left {self.__balance}"

acc = BankAccount("Asha", 5000, 1234)
print(acc.owner, acc._branch)
print(acc.withdraw(1000, 1111))
print(acc.withdraw(1000, 1234))

try:
    print(acc.__balance)
except AttributeError as e:
    print("AttributeError:", e)

print(acc.__dict__)
print("Mangled access:", acc._BankAccount__balance)
`,
      python: {
        files: {
          "main.py": `class BankAccount:
    def __init__(self, owner, balance, pin):
        self.owner = owner          # public
        self._branch = "Pune"       # protected
        self.__pin = pin            # private
        self.__balance = balance

    def withdraw(self, amount, pin):
        if pin != self.__pin:
            return "Wrong PIN"
        if amount > self.__balance:
            return "Insufficient balance"
        self.__balance -= amount
        return f"Withdrew {amount}, left {self.__balance}"

acc = BankAccount("Asha", 5000, 1234)
print(acc.owner, acc._branch)
print(acc.withdraw(1000, 1111))
print(acc.withdraw(1000, 1234))

try:
    print(acc.__balance)
except AttributeError as e:
    print("AttributeError:", e)

print(acc.__dict__)
print("Mangled access:", acc._BankAccount__balance)
`,
        },
      },
      result: `Asha Pune
Wrong PIN
Withdrew 1000, left 4000
AttributeError: 'BankAccount' object has no attribute '__balance'
{'owner': 'Asha', '_branch': 'Pune', '_BankAccount__pin': 1234, '_BankAccount__balance': 4000}
Mangled access: 4000`,
      explanation: "Public and protected attributes are reachable (protected is just a \"please do not\" sign). __pin and __balance are stored as _BankAccount__pin and _BankAccount__balance, as __dict__ shows, so obj.__balance fails. Name mangling discourages access but is not real security.",
    },
    {
      title: "@property with Validation",
      scenario: "An Employee's salary and age must always be valid - even when set directly.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Employee:
    def __init__(self, name, age, salary):
        self.name = name
        self.age = age            # uses the setter
        self.salary = salary      # uses the setter

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if not 18 <= value <= 65:
            raise ValueError(f"age {value} must be 18-65")
        self._age = value

    @property
    def salary(self):
        return self._salary

    @salary.setter
    def salary(self, value):
        if value < 0:
            raise ValueError("salary cannot be negative")
        self._salary = value

    @salary.deleter
    def salary(self):
        print("Deleting salary record...")
        del self._salary

e = Employee("Ravi", 30, 45000)
print(e.name, e.age, e.salary)
e.salary = 50000                  # looks like a normal attribute
print("New salary:", e.salary)

for bad in [lambda: setattr(e, "salary", -10), lambda: Employee("Kid", 12, 1000)]:
    try:
        bad()
    except ValueError as err:
        print("ValueError:", err)

del e.salary
print(hasattr(e, "_salary"))
`,
      python: {
        files: {
          "main.py": `class Employee:
    def __init__(self, name, age, salary):
        self.name = name
        self.age = age            # uses the setter
        self.salary = salary      # uses the setter

    @property
    def age(self):
        return self._age

    @age.setter
    def age(self, value):
        if not 18 <= value <= 65:
            raise ValueError(f"age {value} must be 18-65")
        self._age = value

    @property
    def salary(self):
        return self._salary

    @salary.setter
    def salary(self, value):
        if value < 0:
            raise ValueError("salary cannot be negative")
        self._salary = value

    @salary.deleter
    def salary(self):
        print("Deleting salary record...")
        del self._salary

e = Employee("Ravi", 30, 45000)
print(e.name, e.age, e.salary)
e.salary = 50000                  # looks like a normal attribute
print("New salary:", e.salary)

for bad in [lambda: setattr(e, "salary", -10), lambda: Employee("Kid", 12, 1000)]:
    try:
        bad()
    except ValueError as err:
        print("ValueError:", err)

del e.salary
print(hasattr(e, "_salary"))
`,
        },
      },
      result: `Ravi 30 45000
New salary: 50000
ValueError: salary cannot be negative
ValueError: age 12 must be 18-65
Deleting salary record...
False`,
      explanation: "The calling code uses simple attribute syntax but every assignment runs the setter, so invalid data is rejected - even inside __init__. The deleter runs on del e.salary.",
    },
    {
      title: "Read-only and Computed Properties",
      scenario: "A Rectangle exposes area and perimeter that are always up to date, and an id that cannot be changed.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Rectangle:
    _next_id = 1

    def __init__(self, width, height):
        self._id = Rectangle._next_id
        Rectangle._next_id += 1
        self.width = width
        self.height = height

    @property
    def id(self):                 # read-only: no setter
        return self._id

    @property
    def area(self):               # computed
        return self.width * self.height

    @property
    def perimeter(self):
        return 2 * (self.width + self.height)

r = Rectangle(4, 5)
print(r.id, r.area, r.perimeter)
r.width = 10
print("After resize:", r.area, r.perimeter)

try:
    r.area = 100
except AttributeError as e:
    print("AttributeError:", e)
try:
    r.id = 99
except AttributeError as e:
    print("AttributeError:", e)
`,
      python: {
        files: {
          "main.py": `class Rectangle:
    _next_id = 1

    def __init__(self, width, height):
        self._id = Rectangle._next_id
        Rectangle._next_id += 1
        self.width = width
        self.height = height

    @property
    def id(self):                 # read-only: no setter
        return self._id

    @property
    def area(self):               # computed
        return self.width * self.height

    @property
    def perimeter(self):
        return 2 * (self.width + self.height)

r = Rectangle(4, 5)
print(r.id, r.area, r.perimeter)
r.width = 10
print("After resize:", r.area, r.perimeter)

try:
    r.area = 100
except AttributeError as e:
    print("AttributeError:", e)
try:
    r.id = 99
except AttributeError as e:
    print("AttributeError:", e)
`,
        },
      },
      result: `1 20 18
After resize: 50 30
AttributeError: property 'area' of 'Rectangle' object has no setter
AttributeError: property 'id' of 'Rectangle' object has no setter`,
      explanation: "area and perimeter are recalculated whenever they are read, so they never go stale. Properties without a setter cannot be assigned, which makes id read-only.",
    },
    {
      title: "Why Name Mangling Exists: Avoiding Clashes in Subclasses",
      scenario: "A parent and child class both want an attribute called __counter without overwriting each other.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Parent:
    def __init__(self):
        self.__counter = "parent data"
        self._shared = "protected from parent"

    def parent_counter(self):
        return self.__counter

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__counter = "child data"     # does NOT overwrite parent's

    def child_counter(self):
        return self.__counter

    def read_shared(self):
        return self._shared               # protected is fine in subclass

c = Child()
print(c.parent_counter())
print(c.child_counter())
print(c.read_shared())
print(sorted(c.__dict__))
`,
      python: {
        files: {
          "main.py": `class Parent:
    def __init__(self):
        self.__counter = "parent data"
        self._shared = "protected from parent"

    def parent_counter(self):
        return self.__counter

class Child(Parent):
    def __init__(self):
        super().__init__()
        self.__counter = "child data"     # does NOT overwrite parent's

    def child_counter(self):
        return self.__counter

    def read_shared(self):
        return self._shared               # protected is fine in subclass

c = Child()
print(c.parent_counter())
print(c.child_counter())
print(c.read_shared())
print(sorted(c.__dict__))
`,
        },
      },
      result: `parent data
child data
protected from parent
['_Child__counter', '_Parent__counter', '_shared']`,
      explanation: "Each __counter is mangled with its own class name (_Parent__counter and _Child__counter), so both exist side by side. This prevents subclasses from accidentally breaking parent internals. Protected attributes are meant to be used by subclasses.",
    },
  ],
  interview: [
    {
      q: "What is encapsulation?",
      a: "Bundling data and the methods that operate on it into a class, and restricting direct access to internal state so it can only change through controlled methods/properties.",
      level: "Easy",
    },
    {
      q: "Does Python have truly private variables?",
      a: "No. Python relies on conventions. A single underscore means internal; double underscore triggers name mangling (_ClassName__attr), which prevents accidental access and subclass clashes but can still be reached deliberately.",
      level: "Medium",
    },
    {
      q: "What is name mangling?",
      a: "When an attribute name starts with two underscores (and does not end with two), Python rewrites it inside the class to _ClassName__name. Its purpose is to avoid name clashes with subclasses.",
      level: "Medium",
    },
    {
      q: "What is @property and why use it?",
      a: "A decorator that makes a method behave like an attribute. With @x.setter and @x.deleter you can add validation or computation while keeping simple attribute syntax and without breaking existing code.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class A:
    def __init__(self):
        self.__x = 1
        self._y = 2
a = A()
print(a._y, a._A__x, hasattr(a, "__x"))
`,
      a: `Output:
2 1 False

_y is accessible normally. __x is stored as _A__x, so hasattr(a, "__x") is False.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

class Circle:
    def __init__(self, r):
        self.r = r
    @property
    def area(self):
        return round(3.14 * self.r ** 2, 2)
c = Circle(2)
c.r = 3
print(c.area)
`,
      a: `Output:
28.26

area is computed on every access, so it uses the updated radius 3: 3.14 * 9 = 28.26.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class P:
    @property
    def v(self):
        return 10
p = P()
try:
    p.v = 5
except AttributeError:
    print("read-only")
print(p.v)
`,
      a: `Output:
read-only
10

A property without a setter cannot be assigned, so AttributeError is raised and v remains 10.`,
      level: "Medium",
    },
    {
      q: "Why does writing self.salary = value inside the salary setter cause a problem?",
      a: "Assignment to self.salary calls the setter again, which assigns again... infinite recursion -> RecursionError. Store the value in a separate attribute like self._salary.",
      level: "Hard",
    },
    {
      q: "What is the difference between _var and __var?",
      a: "_var is a convention for \"internal use\" with no enforcement. __var triggers name mangling to _ClassName__var, giving stronger protection against accidental access and subclass conflicts.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Create a Student class with a private __marks attribute, a get_marks() method and a set_marks(m) method that only accepts 0-100.",
      hint: "Raise ValueError in set_marks for invalid marks.",
      solution: `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.__marks = 0
        self.set_marks(marks)
    def get_marks(self):
        return self.__marks
    def set_marks(self, m):
        if not 0 <= m <= 100:
            raise ValueError("marks must be 0-100")
        self.__marks = m

s = Student("Asha", 88)
s.set_marks(95)
print(s.get_marks())
`,
    },
    {
      task: "Rewrite the previous Student class using @property for marks.",
      hint: "@property def marks / @marks.setter",
      solution: `class Student:
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
    @property
    def marks(self):
        return self._marks
    @marks.setter
    def marks(self, m):
        if not 0 <= m <= 100:
            raise ValueError("marks must be 0-100")
        self._marks = m

s = Student("Asha", 88)
s.marks = 91
print(s.marks)
try:
    s.marks = 150
except ValueError as e:
    print(e)
`,
    },
    {
      task: "Create a Person class with first and last name and a computed full_name property that also has a setter splitting \"First Last\".",
      hint: "In the setter: self.first, self.last = value.split(\" \", 1)",
      solution: `class Person:
    def __init__(self, first, last):
        self.first = first
        self.last = last
    @property
    def full_name(self):
        return f"{self.first} {self.last}"
    @full_name.setter
    def full_name(self, value):
        self.first, self.last = value.split(" ", 1)

p = Person("Asha", "Patil")
p.full_name = "Neha Sharma"
print(p.first, "|", p.last, "|", p.full_name)
`,
    },
    {
      task: "Create a Wallet class with a private __balance, methods add(amount) and pay(amount) and a read-only balance property.",
      hint: "No setter for balance; pay must check the balance.",
      solution: `class Wallet:
    def __init__(self):
        self.__balance = 0
    @property
    def balance(self):
        return self.__balance
    def add(self, amount):
        if amount > 0:
            self.__balance += amount
    def pay(self, amount):
        if amount > self.__balance:
            print("Payment failed")
            return
        self.__balance -= amount

w = Wallet()
w.add(500)
w.pay(200)
w.pay(1000)
print(w.balance)
`,
    },
  ],
  quiz: [
    {
      question: "How is a private attribute written in Python?",
      options: [
        "private x",
        "_x",
        "__x",
        "#x",
      ],
      answer: 2,
      explanation: "Two leading underscores trigger name mangling.",
    },
    {
      question: "self.__pin inside class Bank is stored as:",
      options: [
        "_Bank__pin",
        "__pin",
        "Bank.pin",
        "_pin",
      ],
      answer: 0,
      explanation: "Name mangling prefixes _ClassName.",
    },
    {
      question: "Which decorator defines the setter for a property called price?",
      options: [
        "@property.setter",
        "@setter",
        "@set_price",
        "@price.setter",
      ],
      answer: 3,
      explanation: "The setter uses @<property_name>.setter.",
    },
    {
      question: "What happens when you assign to a property that has no setter?",
      options: [
        "The value is ignored",
        "AttributeError is raised",
        "A new attribute is created",
        "The getter is replaced",
      ],
      answer: 1,
      explanation: "Properties without setters are read-only.",
    },
    {
      question: "A single leading underscore (_name) means:",
      options: [
        "Strictly private",
        "A constant",
        "Internal use by convention",
        "A class variable",
      ],
      answer: 2,
      explanation: "It is only a convention for \"protected/internal\".",
    },
  ],
};
