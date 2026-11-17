export default {
  id: "day-30-inheritance",
  title: "Inheritance: single, multiple, multilevel, super(), MRO",
  module: "Module 5: Object-Oriented Programming",
  day: 30,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Reuse and extend code with inheritance: build child classes from parent classes, override and extend methods with super(), combine behaviour with multiple inheritance and mixins, and understand how Python decides which method to call using the Method Resolution Order (MRO).",
  objectives: [
    "Create single, multilevel, hierarchical and multiple inheritance",
    "Override methods and extend them using super()",
    "Read and explain the MRO (C3 linearization) and the diamond problem",
    "Use isinstance() and issubclass() correctly",
    "Recognise when to use mixins or composition instead of deep inheritance",
  ],
  theory: [
    {
      heading: "What is Inheritance?",
      content: "Inheritance lets a new class (child / subclass / derived class) reuse the attributes and methods of an existing class (parent / superclass / base class) and add or change behaviour. It models an \"is-a\" relationship: a Car IS A Vehicle, a Manager IS AN Employee. Analogy: a child inherits surname and features from parents but can also have new talents of their own.",
      syntax: `class Parent:
    ...
class Child(Parent):     # Child inherits from Parent
    ...
`,
      points: [
        "Every class implicitly inherits from object",
        "Reduces duplicate code (DRY)",
        "Child can override (redefine) parent methods",
      ],
    },
    {
      heading: "Types of Inheritance",
      content: "Python supports all common forms.",
      points: [
        "Single: one child, one parent - class Dog(Animal)",
        "Multilevel: chain - class Puppy(Dog), Dog(Animal)",
        "Hierarchical: many children of one parent - Dog(Animal), Cat(Animal)",
        "Multiple: one child, many parents - class FlyingCar(Car, Plane)",
        "Hybrid: a mix of the above (e.g. the diamond)",
      ],
    },
    {
      heading: "Method Overriding and super()",
      content: "If a child defines a method with the same name as the parent, the child version is used (overriding). super() gives access to the parent's version, so you can extend instead of completely replacing it. The most common use is in __init__: call super().__init__(...) to let the parent set up its attributes, then add the child's own ones.",
      syntax: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

class Manager(Employee):
    def __init__(self, name, salary, team):
        super().__init__(name, salary)   # reuse parent setup
        self.team = team
`,
      tip: "If the child defines __init__ and forgets super().__init__(), the parent's attributes are never created -> AttributeError later.",
    },
    {
      heading: "MRO: Method Resolution Order",
      content: "When you call a method, Python searches classes in a fixed order called the MRO: the class itself, then its parents left to right, following the C3 linearization rule so that every class appears before its parents and each class appears only once. See it with ClassName.__mro__ or ClassName.mro(). In the diamond problem (D inherits B and C, both inherit A), the MRO is D -> B -> C -> A -> object, so A's method runs only once when every class uses super().",
      syntax: `class A: ...
class B(A): ...
class C(A): ...
class D(B, C): ...
print(D.__mro__)   # D, B, C, A, object
`,
    },
    {
      heading: "isinstance, issubclass, Mixins and Composition",
      content: "isinstance(obj, Class) is True for the class and all its parents; issubclass(Child, Parent) checks class relationships. A mixin is a small class that adds one reusable feature (like JSONMixin with to_json()) and is combined using multiple inheritance - Django uses mixins heavily (LoginRequiredMixin). Prefer composition (\"has-a\": a Car has an Engine) when the relationship is not truly \"is-a\"; deep inheritance trees become hard to maintain.",
    },
  ],
  examples: [
    {
      title: "Single Inheritance with super() and Overriding",
      scenario: "An HR system has a generic Employee and a Manager who gets a bonus and manages a team.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Employee:
    company = "TechSoft"

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def annual_pay(self):
        return self.salary * 12

    def info(self):
        return f"{self.name} earns {self.annual_pay()} per year"

class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)        # parent sets name, salary
        self.team_size = team_size

    def annual_pay(self):                     # override + extend
        base = super().annual_pay()
        return base + 1000 * self.team_size

    def info(self):
        return super().info() + f" and manages {self.team_size} people"

e = Employee("Ravi", 40000)
m = Manager("Asha", 60000, 8)
print(e.info())
print(m.info())
print(m.company, isinstance(m, Employee), isinstance(e, Manager))
print(issubclass(Manager, Employee), Manager.__bases__)
`,
      python: {
        files: {
          "main.py": `class Employee:
    company = "TechSoft"

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def annual_pay(self):
        return self.salary * 12

    def info(self):
        return f"{self.name} earns {self.annual_pay()} per year"

class Manager(Employee):
    def __init__(self, name, salary, team_size):
        super().__init__(name, salary)        # parent sets name, salary
        self.team_size = team_size

    def annual_pay(self):                     # override + extend
        base = super().annual_pay()
        return base + 1000 * self.team_size

    def info(self):
        return super().info() + f" and manages {self.team_size} people"

e = Employee("Ravi", 40000)
m = Manager("Asha", 60000, 8)
print(e.info())
print(m.info())
print(m.company, isinstance(m, Employee), isinstance(e, Manager))
print(issubclass(Manager, Employee), Manager.__bases__)
`,
        },
      },
      result: `Ravi earns 480000 per year
Asha earns 728000 per year and manages 8 people
TechSoft True False
True (<class '__main__.Employee'>,)`,
      explanation: "Manager reuses Employee's __init__ via super() and extends annual_pay and info. Inside Employee.info, self.annual_pay() calls the Manager version for a Manager object - overriding works even from parent code. A Manager is an Employee, but not the other way round.",
    },
    {
      title: "Multilevel and Hierarchical Inheritance",
      scenario: "Model vehicles: Vehicle -> Car -> ElectricCar (multilevel) and Vehicle -> Bike (hierarchical).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Vehicle:
    def __init__(self, brand, wheels):
        self.brand = brand
        self.wheels = wheels

    def start(self):
        return f"{self.brand} vehicle starting"

    def describe(self):
        return f"{type(self).__name__}: {self.brand}, {self.wheels} wheels"

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand, 4)
        self.seats = seats

    def start(self):
        return f"{self.brand} car engine roars"

class ElectricCar(Car):
    def __init__(self, brand, seats, battery_kwh):
        super().__init__(brand, seats)
        self.battery_kwh = battery_kwh

    def start(self):
        return f"{self.brand} starts silently ({self.battery_kwh} kWh)"

class Bike(Vehicle):
    def __init__(self, brand):
        super().__init__(brand, 2)

for v in [Vehicle("Generic", 6), Car("Maruti", 5), ElectricCar("Tata", 5, 40), Bike("Hero")]:
    print(v.describe(), "|", v.start())

print([c.__name__ for c in ElectricCar.__mro__])
`,
      python: {
        files: {
          "main.py": `class Vehicle:
    def __init__(self, brand, wheels):
        self.brand = brand
        self.wheels = wheels

    def start(self):
        return f"{self.brand} vehicle starting"

    def describe(self):
        return f"{type(self).__name__}: {self.brand}, {self.wheels} wheels"

class Car(Vehicle):
    def __init__(self, brand, seats):
        super().__init__(brand, 4)
        self.seats = seats

    def start(self):
        return f"{self.brand} car engine roars"

class ElectricCar(Car):
    def __init__(self, brand, seats, battery_kwh):
        super().__init__(brand, seats)
        self.battery_kwh = battery_kwh

    def start(self):
        return f"{self.brand} starts silently ({self.battery_kwh} kWh)"

class Bike(Vehicle):
    def __init__(self, brand):
        super().__init__(brand, 2)

for v in [Vehicle("Generic", 6), Car("Maruti", 5), ElectricCar("Tata", 5, 40), Bike("Hero")]:
    print(v.describe(), "|", v.start())

print([c.__name__ for c in ElectricCar.__mro__])
`,
        },
      },
      result: `Vehicle: Generic, 6 wheels | Generic vehicle starting
Car: Maruti, 4 wheels | Maruti car engine roars
ElectricCar: Tata, 4 wheels | Tata starts silently (40 kWh)
Bike: Hero, 2 wheels | Hero vehicle starting
['ElectricCar', 'Car', 'Vehicle', 'object']`,
      explanation: "ElectricCar inherits from Car which inherits from Vehicle; each level adds attributes and calls super().__init__. Bike does not override start(), so it uses Vehicle.start(). describe() is defined once in Vehicle and reused by all.",
    },
    {
      title: "Multiple Inheritance, Diamond Problem and MRO",
      scenario: "See how Python resolves methods when a class has two parents that share a grandparent.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class A:
    def greet(self):
        print("A.greet")

class B(A):
    def greet(self):
        print("B.greet")
        super().greet()

class C(A):
    def greet(self):
        print("C.greet")
        super().greet()

class D(B, C):
    def greet(self):
        print("D.greet")
        super().greet()

D().greet()
print([cls.__name__ for cls in D.mro()])

class E(C, B):
    pass
print([cls.__name__ for cls in E.mro()])

try:
    class Bad(A, B):      # A before its own child B -> impossible order
        pass
except TypeError as e:
    print("TypeError:", e)
`,
      python: {
        files: {
          "main.py": `class A:
    def greet(self):
        print("A.greet")

class B(A):
    def greet(self):
        print("B.greet")
        super().greet()

class C(A):
    def greet(self):
        print("C.greet")
        super().greet()

class D(B, C):
    def greet(self):
        print("D.greet")
        super().greet()

D().greet()
print([cls.__name__ for cls in D.mro()])

class E(C, B):
    pass
print([cls.__name__ for cls in E.mro()])

try:
    class Bad(A, B):      # A before its own child B -> impossible order
        pass
except TypeError as e:
    print("TypeError:", e)
`,
        },
      },
      result: `D.greet
B.greet
C.greet
A.greet
['D', 'B', 'C', 'A', 'object']
['E', 'C', 'B', 'A', 'object']
TypeError: Cannot create a consistent method resolution
order (MRO) for bases A, B`,
      explanation: "super() follows the MRO of the actual object (D, B, C, A, object), not just the direct parent - that is why B.greet calls C.greet, and A.greet runs only once. Changing the parent order changes the MRO. Python refuses class Bad(A, B) because no consistent MRO exists.",
    },
    {
      title: "Mixins: Adding Features with Multiple Inheritance",
      scenario: "Add JSON export and logging to different model classes without copying code.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import json

class JSONMixin:
    def to_json(self):
        return json.dumps(self.__dict__)

class LogMixin:
    def log(self, message):
        print(f"[{type(self).__name__}] {message}")

class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Customer:
    def __init__(self, name, city):
        self.name = name
        self.city = city

class SmartProduct(JSONMixin, LogMixin, Product):
    pass

class SmartCustomer(JSONMixin, Customer):
    pass

p = SmartProduct("Laptop", 55000)
p.log("created")
print(p.to_json())
c = SmartCustomer("Asha", "Pune")
print(c.to_json())
print(isinstance(p, JSONMixin), isinstance(c, LogMixin))
`,
      python: {
        files: {
          "main.py": `import json

class JSONMixin:
    def to_json(self):
        return json.dumps(self.__dict__)

class LogMixin:
    def log(self, message):
        print(f"[{type(self).__name__}] {message}")

class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

class Customer:
    def __init__(self, name, city):
        self.name = name
        self.city = city

class SmartProduct(JSONMixin, LogMixin, Product):
    pass

class SmartCustomer(JSONMixin, Customer):
    pass

p = SmartProduct("Laptop", 55000)
p.log("created")
print(p.to_json())
c = SmartCustomer("Asha", "Pune")
print(c.to_json())
print(isinstance(p, JSONMixin), isinstance(c, LogMixin))
`,
        },
      },
      result: `[SmartProduct] created
{"name": "Laptop", "price": 55000}
{"name": "Asha", "city": "Pune"}
True False`,
      explanation: "Mixins are small classes providing one capability. They are listed before the main base class. SmartProduct gets to_json and log; SmartCustomer gets only to_json. Django's class-based views use exactly this pattern.",
    },
  ],
  interview: [
    {
      q: "What is inheritance and what are its benefits?",
      a: "A mechanism where a child class acquires attributes and methods of a parent class. Benefits: code reuse, logical hierarchy (is-a), easier maintenance and polymorphism through overriding.",
      level: "Easy",
    },
    {
      q: "What types of inheritance does Python support?",
      a: "Single, multilevel, hierarchical, multiple and hybrid inheritance.",
      level: "Easy",
    },
    {
      q: "What does super() do?",
      a: "It returns a proxy object that delegates method calls to the next class in the MRO of the current object. It is mainly used to call the parent's __init__ and to extend overridden methods.",
      level: "Medium",
    },
    {
      q: "What is MRO and how is it computed?",
      a: "Method Resolution Order is the order Python searches classes for attributes/methods. It uses the C3 linearization algorithm: a class comes before its parents, parent order from the class definition is preserved, and each class appears once. View it with Class.__mro__ or Class.mro().",
      level: "Hard",
    },
    {
      q: "What is the diamond problem and how does Python handle it?",
      a: "When a class inherits from two classes that share a common ancestor, the ancestor might be called twice or ambiguously. Python's C3 MRO places the common ancestor once, after all its children, and cooperative super() calls each class exactly once.",
      level: "Hard",
    },
    {
      q: `What is the output of this code?

class A:
    def show(self):
        return "A"
class B(A):
    def show(self):
        return "B" + super().show()
class C(B):
    pass
print(C().show())
`,
      a: `Output:
BA

C has no show(), so B.show is used, which calls A.show through super().`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class X:
    def hi(self): return "X"
class Y:
    def hi(self): return "Y"
class Z(Y, X):
    pass
print(Z().hi(), [c.__name__ for c in Z.__mro__])
`,
      a: `Output:
Y ['Z', 'Y', 'X', 'object']

Parents are searched left to right, so Y.hi is found first.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

class Parent:
    def __init__(self):
        self.x = 1
class Child(Parent):
    def __init__(self):
        self.y = 2
c = Child()
print(hasattr(c, "x"), hasattr(c, "y"))
`,
      a: `Output:
False True

Child.__init__ overrides Parent.__init__ and does not call super().__init__(), so x is never set.`,
      level: "Medium",
    },
    {
      q: "What is the difference between isinstance() and type() == ?",
      a: "isinstance(obj, Parent) is True for instances of Parent and all subclasses; type(obj) == Parent is True only for the exact class. isinstance is preferred because it respects inheritance.",
      level: "Medium",
    },
    {
      q: "Inheritance vs composition - when to use which?",
      a: "Use inheritance for a true \"is-a\" relationship with shared behaviour. Use composition (\"has-a\", e.g. Car has an Engine object) to combine behaviour flexibly; it avoids fragile deep hierarchies. \"Favour composition over inheritance\" is a common guideline.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create Shape with a method area() returning 0, and child classes Circle(r) and Square(side) that override area(). Print the area of each shape in a list.",
      hint: "Use math.pi for the circle.",
      solution: `import math
class Shape:
    def area(self):
        return 0
class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return round(math.pi * self.r ** 2, 2)
class Square(Shape):
    def __init__(self, side):
        self.side = side
    def area(self):
        return self.side ** 2

for s in [Circle(2), Square(4), Shape()]:
    print(type(s).__name__, s.area())
`,
    },
    {
      task: "Create Person(name, age) and Student(Person) adding roll_no, using super().__init__. Add a method details() in both, where Student extends the parent's output.",
      hint: "return super().details() + f\", Roll: {self.roll_no}\"",
      solution: `class Person:
    def __init__(self, name, age):
        self.name = name
        self.age = age
    def details(self):
        return f"{self.name}, {self.age}"
class Student(Person):
    def __init__(self, name, age, roll_no):
        super().__init__(name, age)
        self.roll_no = roll_no
    def details(self):
        return super().details() + f", Roll: {self.roll_no}"

print(Student("Asha", 20, 101).details())
`,
    },
    {
      task: "Create a multilevel chain Grandparent -> Parent -> Child where each has an introduce() method calling super(). Print the MRO.",
      hint: "Each introduce prints its own line then calls super().introduce() (except Grandparent).",
      solution: `class Grandparent:
    def introduce(self):
        print("I am Grandparent")
class Parent(Grandparent):
    def introduce(self):
        print("I am Parent")
        super().introduce()
class Child(Parent):
    def introduce(self):
        print("I am Child")
        super().introduce()

Child().introduce()
print([c.__name__ for c in Child.mro()])
`,
    },
    {
      task: "Create two mixins: GreetMixin with greet() and DiscountMixin with discount(price, pct). Use both in a Shop class.",
      hint: "class Shop(GreetMixin, DiscountMixin): ...",
      solution: `class GreetMixin:
    def greet(self):
        return f"Welcome to {self.name}"
class DiscountMixin:
    def discount(self, price, pct):
        return price - price * pct / 100
class Shop(GreetMixin, DiscountMixin):
    def __init__(self, name):
        self.name = name

s = Shop("Python Mart")
print(s.greet())
print(s.discount(1000, 15))
`,
    },
  ],
  quiz: [
    {
      question: "How do you make class Dog inherit from Animal?",
      options: [
        "class Dog extends Animal:",
        "class Dog(Animal):",
        "class Dog inherits Animal:",
        "class Animal(Dog):",
      ],
      answer: 1,
      explanation: "Parent classes go in parentheses.",
    },
    {
      question: "Which function calls the next class's method in the MRO?",
      options: [
        "parent()",
        "base()",
        "super()",
        "self.parent()",
      ],
      answer: 2,
      explanation: "super() delegates to the next class in the MRO.",
    },
    {
      question: "For class D(B, C) where B and C inherit A, what is D's MRO?",
      options: [
        "D, B, C, A, object",
        "D, B, A, C, object",
        "D, C, B, A, object",
        "D, A, B, C, object",
      ],
      answer: 0,
      explanation: "C3 linearization keeps A after both B and C.",
    },
    {
      question: "class C(A, B) where both A and B define show(). Which show() does C().show() call?",
      options: [
        "B.show",
        "Both",
        "Error",
        "A.show",
      ],
      answer: 3,
      explanation: "Parents are searched left to right in the MRO.",
    },
    {
      question: "isinstance(Manager(...), Employee) where Manager inherits Employee returns:",
      options: [
        "False",
        "True",
        "Error",
        "None",
      ],
      answer: 1,
      explanation: "isinstance respects inheritance.",
    },
  ],
};
