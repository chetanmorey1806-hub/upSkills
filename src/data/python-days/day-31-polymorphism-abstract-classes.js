export default {
  id: "day-31-polymorphism-abstract-classes",
  title: "Polymorphism, Method Overriding, Duck Typing, Abstract Classes (abc)",
  module: "Module 5: Object-Oriented Programming",
  day: 31,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn how one interface can work with many types of objects: method overriding in child classes, duck typing in Python, and abstract base classes (abc) that force subclasses to implement required methods.",
  objectives: [
    "Explain polymorphism with real-world examples",
    "Override parent methods in child classes and extend them with super()",
    "Write duck-typed code that depends on behaviour, not on type",
    "Create abstract base classes with ABC and @abstractmethod",
    "Know why Python does not support classic method overloading and what to use instead",
  ],
  theory: [
    {
      heading: "What is Polymorphism?",
      content: "Polymorphism means 'many forms'. The same method name or operator behaves differently depending on the object it is used with. Real-world analogy: the word 'open' works for a door, a bottle and a laptop, but each one opens in its own way. In code, you call shape.area() and each shape (circle, rectangle) calculates its own area. The caller does not need if/elif checks for every type.",
      points: [
        "Built-in polymorphism: len('abc'), len([1, 2]), len({'a': 1}) - one function, many types",
        "Operator polymorphism: 2 + 3 is addition, 'a' + 'b' is concatenation, [1] + [2] joins lists",
        "Class polymorphism: different classes provide methods with the same name",
      ],
    },
    {
      heading: "Method Overriding",
      content: "Method overriding happens when a child class defines a method with the same name as a method in its parent class. When you call that method on a child object, Python uses the child's version (it searches the class first, then parents, following the MRO). You can still call the parent's version using super() to extend rather than fully replace the behaviour.",
      syntax: `class Employee:
    def salary(self):
        return 30000

class Manager(Employee):
    def salary(self):                 # overriding
        base = super().salary()       # reuse parent logic
        return base + 20000
`,
      tip: "Override to change behaviour, use super() to extend behaviour. Forgetting super().__init__() in a child constructor is a very common bug.",
    },
    {
      heading: "Method Overloading in Python",
      content: "In Java or C++, you can write several methods with the same name but different parameters (overloading). Python does not support this: if you define the same method name twice, the last definition wins. Instead, Python uses default arguments, *args, or functools.singledispatch to handle different inputs with one function.",
      syntax: `def area(a, b=None):
    if b is None:
        return a * a      # square
    return a * b          # rectangle
`,
    },
    {
      heading: "Duck Typing",
      content: "\"If it walks like a duck and quacks like a duck, it is a duck.\" Python does not check the type of an object before calling a method; it only checks whether the method exists at the moment of the call. So any object that has the required method can be used, even if it is unrelated by inheritance. This makes Python code flexible. If the method is missing you get AttributeError at runtime.",
      points: [
        "Focus on what an object can DO, not what it IS",
        "File-like objects: anything with read() can be used where a file is expected",
        "EAFP style: 'Easier to Ask Forgiveness than Permission' - just try it and catch AttributeError",
      ],
    },
    {
      heading: "Abstract Classes with abc",
      content: "An abstract class is a blueprint that cannot be instantiated directly. It declares methods that every child class MUST implement. In Python, inherit from ABC (from the abc module) and mark required methods with @abstractmethod. If a child class forgets to implement one of them, creating its object raises TypeError. This is how you enforce a contract in a team project, like a payment gateway that every provider must follow.",
      syntax: `from abc import ABC, abstractmethod

class Payment(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

    def receipt(self, amount):          # normal (concrete) method is allowed
        return f"Paid {amount}"
`,
      points: [
        "Payment() -> TypeError: Can't instantiate abstract class",
        "Abstract classes can have normal methods and __init__ too",
        "A child must implement ALL abstract methods to become concrete",
      ],
    },
    {
      heading: "Common Mistakes",
      content: "Students often mix up overriding and overloading, forget to call super().__init__(), or think abstract classes cannot contain any code. Another mistake is writing isinstance() checks everywhere instead of relying on polymorphism.",
      points: [
        "Overriding = same name in child class (runtime). Overloading = same name, different parameters (not supported directly in Python)",
        "Typo in the overriding method name silently creates a new method instead of overriding",
        "Replace long if type == ... chains with polymorphic methods",
      ],
    },
  ],
  examples: [
    {
      title: "Shapes with Polymorphic area()",
      scenario: "A drawing app stores different shapes in one list and needs the total area without checking each type.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math

class Shape:
    def area(self):
        return 0

    def describe(self):
        return f"{self.__class__.__name__} with area {self.area():.2f}"

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):                    # overriding
        return math.pi * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self):                    # overriding
        return self.w * self.h

shapes = [Circle(1), Rectangle(4, 5), Circle(2.5), Shape()]
for s in shapes:
    print(s.describe())

total = sum(s.area() for s in shapes)
print(f"Total area: {total:.2f}")
`,
      python: {
        files: {
          "main.py": `import math

class Shape:
    def area(self):
        return 0

    def describe(self):
        return f"{self.__class__.__name__} with area {self.area():.2f}"

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):                    # overriding
        return math.pi * self.r ** 2

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h

    def area(self):                    # overriding
        return self.w * self.h

shapes = [Circle(1), Rectangle(4, 5), Circle(2.5), Shape()]
for s in shapes:
    print(s.describe())

total = sum(s.area() for s in shapes)
print(f"Total area: {total:.2f}")
`,
        },
      },
      result: `Circle with area 3.14
Rectangle with area 20.00
Circle with area 19.63
Shape with area 0.00
Total area: 42.78`,
      explanation: "Each class overrides area(). describe() is written only once in the parent, but self.area() calls the correct child version at runtime - this is polymorphism. self.__class__.__name__ gives the real class name of the object.",
    },
    {
      title: "Overriding with super() - Salary System",
      scenario: "An HR system where managers get the base salary plus a bonus and interns get a fixed stipend.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Employee:
    def __init__(self, name, base):
        self.name = name
        self.base = base

    def salary(self):
        return self.base

    def __str__(self):
        return f"{self.name:<6} {type(self).__name__:<9} Rs.{self.salary():,}"

class Manager(Employee):
    def __init__(self, name, base, bonus):
        super().__init__(name, base)   # reuse parent constructor
        self.bonus = bonus

    def salary(self):                  # extend parent behaviour
        return super().salary() + self.bonus

class Intern(Employee):
    def salary(self):                  # replace parent behaviour
        return 15000

staff = [Employee("Asha", 40000), Manager("Ravi", 60000, 25000), Intern("Neha", 0)]
for person in staff:
    print(person)
print("Payroll:", sum(p.salary() for p in staff))
`,
      python: {
        files: {
          "main.py": `class Employee:
    def __init__(self, name, base):
        self.name = name
        self.base = base

    def salary(self):
        return self.base

    def __str__(self):
        return f"{self.name:<6} {type(self).__name__:<9} Rs.{self.salary():,}"

class Manager(Employee):
    def __init__(self, name, base, bonus):
        super().__init__(name, base)   # reuse parent constructor
        self.bonus = bonus

    def salary(self):                  # extend parent behaviour
        return super().salary() + self.bonus

class Intern(Employee):
    def salary(self):                  # replace parent behaviour
        return 15000

staff = [Employee("Asha", 40000), Manager("Ravi", 60000, 25000), Intern("Neha", 0)]
for person in staff:
    print(person)
print("Payroll:", sum(p.salary() for p in staff))
`,
        },
      },
      result: `Asha   Employee  Rs.40,000
Ravi   Manager   Rs.85,000
Neha   Intern    Rs.15,000
Payroll: 140000`,
      explanation: "Manager extends salary() by calling super().salary() and adding a bonus. Intern completely replaces it. __str__ in the parent calls self.salary(), which resolves to the correct overridden version for each object.",
    },
    {
      title: "Duck Typing - Anything That Can send()",
      scenario: "A notification function should work with any object that has a send() method, even unrelated classes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class EmailNotifier:
    def send(self, msg):
        return f"Email: {msg}"

class SMSNotifier:
    def send(self, msg):
        return f"SMS: {msg[:10]}..."

class Printer:              # no send() method
    def print_doc(self):
        return "printing"

def notify_all(notifiers, msg):
    for n in notifiers:
        try:
            print(n.send(msg))          # we only care that send() exists
        except AttributeError:
            print(f"{type(n).__name__} cannot send messages")

notify_all([EmailNotifier(), SMSNotifier(), Printer()], "Your order has shipped")

# Built-in duck typing: len() works on anything with __len__
for item in ["hello", [1, 2, 3], {"a": 1}, range(10)]:
    print(type(item).__name__, len(item))
`,
      python: {
        files: {
          "main.py": `class EmailNotifier:
    def send(self, msg):
        return f"Email: {msg}"

class SMSNotifier:
    def send(self, msg):
        return f"SMS: {msg[:10]}..."

class Printer:              # no send() method
    def print_doc(self):
        return "printing"

def notify_all(notifiers, msg):
    for n in notifiers:
        try:
            print(n.send(msg))          # we only care that send() exists
        except AttributeError:
            print(f"{type(n).__name__} cannot send messages")

notify_all([EmailNotifier(), SMSNotifier(), Printer()], "Your order has shipped")

# Built-in duck typing: len() works on anything with __len__
for item in ["hello", [1, 2, 3], {"a": 1}, range(10)]:
    print(type(item).__name__, len(item))
`,
        },
      },
      result: `Email: Your order has shipped
SMS: Your order...
Printer cannot send messages
str 5
list 3
dict 1
range 10`,
      explanation: "EmailNotifier and SMSNotifier do not share a parent class, yet both work because they have send(). Printer fails with AttributeError, which we catch (EAFP style). len() is the same idea: it works for any object that implements __len__.",
    },
    {
      title: "Abstract Base Class for Payment Gateways",
      scenario: "An e-commerce team wants every payment provider to implement pay() and refund(), and to block incomplete classes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

    @abstractmethod
    def refund(self, amount):
        pass

    def checkout(self, amount):         # concrete method shared by all
        return f"[{type(self).__name__}] {self.pay(amount)}"

class UPI(PaymentGateway):
    def pay(self, amount):
        return f"Paid Rs.{amount} via UPI"

    def refund(self, amount):
        return f"Refunded Rs.{amount} to UPI"

class Card(PaymentGateway):
    def pay(self, amount):
        return f"Paid Rs.{amount} by card"
    # refund() is missing!

try:
    PaymentGateway()
except TypeError as e:
    print("Error 1:", e)

try:
    Card()
except TypeError as e:
    print("Error 2:", e)

upi = UPI()
print(upi.checkout(499))
print(upi.refund(99))
print(isinstance(upi, PaymentGateway))
`,
      python: {
        files: {
          "main.py": `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount):
        pass

    @abstractmethod
    def refund(self, amount):
        pass

    def checkout(self, amount):         # concrete method shared by all
        return f"[{type(self).__name__}] {self.pay(amount)}"

class UPI(PaymentGateway):
    def pay(self, amount):
        return f"Paid Rs.{amount} via UPI"

    def refund(self, amount):
        return f"Refunded Rs.{amount} to UPI"

class Card(PaymentGateway):
    def pay(self, amount):
        return f"Paid Rs.{amount} by card"
    # refund() is missing!

try:
    PaymentGateway()
except TypeError as e:
    print("Error 1:", e)

try:
    Card()
except TypeError as e:
    print("Error 2:", e)

upi = UPI()
print(upi.checkout(499))
print(upi.refund(99))
print(isinstance(upi, PaymentGateway))
`,
        },
      },
      result: `Error 1: Can't instantiate abstract class PaymentGateway without an implementation for abstract methods 'pay', 'refund'
Error 2: Can't instantiate abstract class Card without an implementation for abstract method 'refund'
[UPI] Paid Rs.499 via UPI
Refunded Rs.99 to UPI
True`,
      explanation: "PaymentGateway cannot be created because it is abstract. Card forgot refund(), so it is still abstract and also raises TypeError. UPI implements both methods, so it works and also inherits the concrete checkout() method.",
    },
  ],
  interview: [
    {
      q: "What is polymorphism in Python?",
      a: "Polymorphism means one interface, many forms. The same method name or operator works differently for different objects, e.g. len() on str/list/dict, + on numbers/strings, or area() on Circle/Rectangle.",
      level: "Easy",
    },
    {
      q: "What is method overriding?",
      a: "When a child class defines a method with the same name and signature as the parent, the child's version is used for child objects. It is runtime polymorphism. super() can call the parent version.",
      level: "Easy",
    },
    {
      q: "Does Python support method overloading?",
      a: "Not in the Java sense. Defining the same method twice keeps only the last definition. We simulate overloading with default arguments, *args/**kwargs, or functools.singledispatch.",
      level: "Medium",
    },
    {
      q: "What is duck typing?",
      a: "A style where the type of an object is less important than the methods it has. If an object has the method you call, it works. Errors appear at runtime as AttributeError if the method is missing.",
      level: "Easy",
    },
    {
      q: "What is an abstract class and how do you create one?",
      a: "A class that cannot be instantiated and defines methods subclasses must implement. Inherit from abc.ABC and decorate methods with @abstractmethod.",
      level: "Medium",
    },
    {
      q: "What happens if a subclass does not implement all abstract methods?",
      a: "The subclass is also abstract. Trying to create its object raises TypeError: Can't instantiate abstract class ... with abstract method ...",
      level: "Medium",
    },
    {
      q: "Can an abstract class have a constructor and concrete methods?",
      a: "Yes. An ABC can have __init__, normal methods, properties and class attributes. Only methods marked @abstractmethod must be overridden.",
      level: "Medium",
    },
    {
      q: `What is the output?
class A:
    def show(self): return 'A'
class B(A):
    def show(self): return 'B' + super().show()
print(B().show())`,
      a: "BA - B.show() returns 'B' plus the result of A.show() via super().",
      level: "Easy",
    },
    {
      q: `What is the output?
class A:
    def f(self, x): return 1
    def f(self, x, y): return 2
print(A().f(1, 2))`,
      a: "2 - the second definition replaces the first, so only f(self, x, y) exists. A().f(1) would raise TypeError.",
      level: "Medium",
    },
    {
      q: "Difference between abstract class and interface?",
      a: "Python has no separate interface keyword. An ABC with only abstract methods acts like an interface; an ABC with some concrete methods acts like a Java abstract class. typing.Protocol is used for structural (duck-typed) interfaces checked by type checkers.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Create Animal with speak(), and Dog, Cat, Cow overriding it. Loop over a list and print each sound.",
      hint: "Put objects in a list and call speak() on each.",
      solution: `class Animal:
    def speak(self): return "..."
class Dog(Animal):
    def speak(self): return "Woof"
class Cat(Animal):
    def speak(self): return "Meow"
class Cow(Animal):
    def speak(self): return "Moo"
for a in [Dog(), Cat(), Cow()]:
    print(type(a).__name__, a.speak())
`,
    },
    {
      task: "Make an abstract class Vehicle with abstract methods wheels() and fuel(). Implement Bike and Car.",
      hint: "from abc import ABC, abstractmethod",
      solution: `from abc import ABC, abstractmethod
class Vehicle(ABC):
    @abstractmethod
    def wheels(self): ...
    @abstractmethod
    def fuel(self): ...
class Bike(Vehicle):
    def wheels(self): return 2
    def fuel(self): return "Petrol"
class Car(Vehicle):
    def wheels(self): return 4
    def fuel(self): return "Diesel"
for v in (Bike(), Car()):
    print(type(v).__name__, v.wheels(), v.fuel())
`,
    },
    {
      task: "Write a function total_length(items) that works for any object that supports len(), and skips objects that do not.",
      hint: "Use try/except TypeError.",
      solution: `def total_length(items):
    total = 0
    for it in items:
        try:
            total += len(it)
        except TypeError:
            pass
    return total
print(total_length(["abc", [1, 2], 5, {"x": 1}]))   # 6
`,
    },
    {
      task: "Simulate overloading: write add() that adds 2 or 3 or any number of values.",
      hint: "Use *args.",
      solution: `def add(*nums):
    return sum(nums)
print(add(1, 2), add(1, 2, 3), add(5))
`,
    },
    {
      task: "Create BankAccount with interest() returning 3%, and SavingsAccount overriding it to return parent interest + 1%.",
      hint: "Use super().interest().",
      solution: `class BankAccount:
    def __init__(self, bal): self.bal = bal
    def interest(self): return self.bal * 0.03
class SavingsAccount(BankAccount):
    def interest(self): return super().interest() + self.bal * 0.01
print(SavingsAccount(10000).interest())   # 400.0
`,
    },
  ],
  quiz: [
    {
      question: "Which module provides abstract base classes in Python?",
      options: [
        "abstract",
        "abc",
        "base",
        "typing",
      ],
      answer: 1,
      explanation: "The abc module provides ABC and abstractmethod.",
    },
    {
      question: "What happens when you instantiate a class that still has an unimplemented abstract method?",
      options: [
        "It works normally",
        "Returns None",
        "Raises TypeError",
        "Raises AttributeError",
      ],
      answer: 2,
      explanation: "Python raises TypeError: Can't instantiate abstract class.",
    },
    {
      question: "If a class defines def f(self) and later def f(self, x), what happens?",
      options: [
        "Both exist (overloading)",
        "SyntaxError",
        "Only the last definition remains",
        "Only the first remains",
      ],
      answer: 2,
      explanation: "Python has no classic overloading; the later definition replaces the earlier.",
    },
    {
      question: "Duck typing means:",
      options: [
        "Behaviour (methods) matters more than the object's type",
        "Every class must inherit from Duck",
        "Types are checked at compile time",
        "Using isinstance before every call",
      ],
      answer: 0,
      explanation: "If an object has the needed methods, it can be used.",
    },
    {
      question: "Which call runs the parent's version of an overridden method?",
      options: [
        "parent.method()",
        "self.method()",
        "base.method()",
        "super().method()",
      ],
      answer: 3,
      explanation: "super() delegates to the next class in the MRO.",
    },
  ],
};
