export default {
  id: "day-27-classes-objects",
  title: "Classes and Objects, __init__, self, Instance vs Class Variables",
  module: "Module 5: Object-Oriented Programming",
  day: 27,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Start Object-Oriented Programming: model real-world things as classes, create objects, initialise their data with __init__, understand self, and learn the difference between instance variables and class variables.",
  objectives: [
    "Explain OOP and the four pillars at a high level",
    "Define a class and create multiple objects from it",
    "Use __init__ and self to set up object attributes",
    "Differentiate instance variables from class variables",
    "Inspect objects with type(), isinstance(), id(), __dict__ and dynamic attributes",
  ],
  theory: [
    {
      heading: "What is OOP?",
      content: "Object-Oriented Programming organises code around objects that bundle data (attributes) and behaviour (methods). A class is a blueprint; an object (instance) is a real thing built from it. Analogy: the architect's plan of a house is the class; each actual house built from that plan is an object - same design, but each has its own colour and owner.",
      points: [
        "Encapsulation - bundle data and methods, control access",
        "Inheritance - reuse code from a parent class",
        "Polymorphism - same method name, different behaviour",
        "Abstraction - show what an object does, hide how",
        "In Python everything is an object: int, str, list, functions ...",
      ],
    },
    {
      heading: "Defining a Class and Creating Objects",
      content: "Use the class keyword and a CapWords name (PEP 8). Create an object by calling the class like a function. Each object is independent and has its own identity (id).",
      syntax: `class Car:
    pass

c1 = Car()
c2 = Car()
print(type(c1), c1 is c2)   # <class '__main__.Car'> False
`,
    },
    {
      heading: "__init__ and self",
      content: "__init__ is the initialiser (often called the constructor). It runs automatically right after an object is created and sets its starting attributes. self is the first parameter of every instance method; it refers to the specific object the method is working on. When you call c1.drive(), Python actually calls Car.drive(c1). self is just a convention - but always use it.",
      syntax: `class Car:
    def __init__(self, brand, color):
        self.brand = brand      # instance variable
        self.color = color

    def describe(self):
        return f"{self.color} {self.brand}"

my_car = Car("Tata", "Red")
print(my_car.describe())
`,
      tip: "Forgetting self in a method definition gives: TypeError: describe() takes 0 positional arguments but 1 was given.",
    },
    {
      heading: "Instance Variables vs Class Variables",
      content: "Instance variables (self.name) belong to one object - each student has their own name. Class variables are defined directly in the class body and are shared by all objects - like the school name that is the same for every student. Read a class variable through the class (Student.school) or an object. Careful: assigning obj.school = \"X\" creates a NEW instance variable that hides the class variable for that object only.",
      syntax: `class Student:
    school = "ABC Public School"   # class variable
    count = 0

    def __init__(self, name):
        self.name = name           # instance variable
        Student.count += 1
`,
    },
    {
      heading: "Inspecting Objects",
      content: "obj.__dict__ shows an object's instance attributes as a dict. isinstance(obj, Class) checks the type. hasattr/getattr/setattr/delattr work with attribute names as strings. Python even lets you add attributes to an object at runtime (obj.nickname = \"Ash\"), though defining all attributes in __init__ is cleaner.",
    },
  ],
  examples: [
    {
      title: "First Class: Student with __init__ and a Method",
      scenario: "A coaching institute wants to store each student's name, course and marks and print a report card.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Student:
    def __init__(self, name, course, marks):
        self.name = name
        self.course = course
        self.marks = marks

    def grade(self):
        if self.marks >= 90:
            return "A"
        elif self.marks >= 75:
            return "B"
        return "C"

    def report(self):
        return f"{self.name:<6} | {self.course:<7} | {self.marks:>3} | Grade {self.grade()}"

s1 = Student("Asha", "Python", 92)
s2 = Student("Ravi", "Django", 78)
print(s1.report())
print(s2.report())

s2.marks = 88                 # update an attribute
print(s2.report())
print(Student.report(s1))     # what s1.report() really does
print(type(s1).__name__, isinstance(s1, Student), s1 is s2)
`,
      python: {
        files: {
          "main.py": `class Student:
    def __init__(self, name, course, marks):
        self.name = name
        self.course = course
        self.marks = marks

    def grade(self):
        if self.marks >= 90:
            return "A"
        elif self.marks >= 75:
            return "B"
        return "C"

    def report(self):
        return f"{self.name:<6} | {self.course:<7} | {self.marks:>3} | Grade {self.grade()}"

s1 = Student("Asha", "Python", 92)
s2 = Student("Ravi", "Django", 78)
print(s1.report())
print(s2.report())

s2.marks = 88                 # update an attribute
print(s2.report())
print(Student.report(s1))     # what s1.report() really does
print(type(s1).__name__, isinstance(s1, Student), s1 is s2)
`,
        },
      },
      result: `Asha   | Python  |  92 | Grade A
Ravi   | Django  |  78 | Grade B
Ravi   | Django  |  88 | Grade B
Asha   | Python  |  92 | Grade A
Student True False`,
      explanation: "Each object has its own name, course and marks. Methods access them through self. s1.report() is translated to Student.report(s1), which shows what self really is.",
    },
    {
      title: "Class Variables: Counting Objects",
      scenario: "A bank wants a shared interest rate and a counter of how many accounts were opened.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Account:
    bank = "Python Bank"      # class variable (shared)
    interest_rate = 0.04
    total_accounts = 0

    def __init__(self, owner, balance=0):
        self.owner = owner    # instance variables
        self.balance = balance
        Account.total_accounts += 1

    def yearly_interest(self):
        return self.balance * self.interest_rate

a = Account("Asha", 10000)
b = Account("Ravi", 5000)
print(Account.total_accounts, a.bank, b.bank)
print(a.yearly_interest(), b.yearly_interest())

Account.interest_rate = 0.05          # change for everyone
print(a.yearly_interest(), b.yearly_interest())

b.interest_rate = 0.10                # creates instance var on b only!
print(a.interest_rate, b.interest_rate, Account.interest_rate)
print(a.__dict__)
print(b.__dict__)
`,
      python: {
        files: {
          "main.py": `class Account:
    bank = "Python Bank"      # class variable (shared)
    interest_rate = 0.04
    total_accounts = 0

    def __init__(self, owner, balance=0):
        self.owner = owner    # instance variables
        self.balance = balance
        Account.total_accounts += 1

    def yearly_interest(self):
        return self.balance * self.interest_rate

a = Account("Asha", 10000)
b = Account("Ravi", 5000)
print(Account.total_accounts, a.bank, b.bank)
print(a.yearly_interest(), b.yearly_interest())

Account.interest_rate = 0.05          # change for everyone
print(a.yearly_interest(), b.yearly_interest())

b.interest_rate = 0.10                # creates instance var on b only!
print(a.interest_rate, b.interest_rate, Account.interest_rate)
print(a.__dict__)
print(b.__dict__)
`,
        },
      },
      result: `2 Python Bank Python Bank
400.0 200.0
500.0 250.0
0.05 0.1 0.05
{'owner': 'Asha', 'balance': 10000}
{'owner': 'Ravi', 'balance': 5000, 'interest_rate': 0.1}`,
      explanation: "Class variables are shared, so changing Account.interest_rate affects every account. Assigning b.interest_rate creates a new instance variable that shadows the class variable for b only - visible in b.__dict__.",
    },
    {
      title: "Objects from User Input",
      scenario: "Create a Product object from values typed by the user and compute the bill.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: Laptop, 55000, 2",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Product:
    gst = 0.18

    def __init__(self, name, price, qty):
        self.name = name
        self.price = price
        self.qty = qty

    def subtotal(self):
        return self.price * self.qty

    def total(self):
        return round(self.subtotal() * (1 + self.gst), 2)

name = input("Product name: ")
price = float(input("Price: "))
qty = int(input("Quantity: "))
p = Product(name, price, qty)
print()
print(f"{p.qty} x {p.name} @ {p.price}")
print("Subtotal:", p.subtotal())
print("Total with GST:", p.total())
`,
      python: {
        files: {
          "main.py": `class Product:
    gst = 0.18

    def __init__(self, name, price, qty):
        self.name = name
        self.price = price
        self.qty = qty

    def subtotal(self):
        return self.price * self.qty

    def total(self):
        return round(self.subtotal() * (1 + self.gst), 2)

name = input("Product name: ")
price = float(input("Price: "))
qty = int(input("Quantity: "))
p = Product(name, price, qty)
print()
print(f"{p.qty} x {p.name} @ {p.price}")
print("Subtotal:", p.subtotal())
print("Total with GST:", p.total())
`,
        },
        stdin: `Laptop
55000
2
`,
      },
      result: `Product name: Price: Quantity: 
2 x Laptop @ 55000.0
Subtotal: 110000.0
Total with GST: 129800.0`,
      explanation: "The constructor arguments come from input(). Methods can call other methods through self (total() uses self.subtotal()).",
    },
    {
      title: "The Mutable Class Variable Trap and Dynamic Attributes",
      scenario: "See why lists must be instance variables, and explore getattr/setattr/hasattr.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class BadTeam:
    members = []                   # shared by ALL teams!
    def __init__(self, name):
        self.name = name
    def add(self, person):
        self.members.append(person)

class GoodTeam:
    def __init__(self, name):
        self.name = name
        self.members = []          # each team gets its own list
    def add(self, person):
        self.members.append(person)

t1, t2 = BadTeam("Red"), BadTeam("Blue")
t1.add("Asha")
print("Bad:", t1.members, t2.members)

g1, g2 = GoodTeam("Red"), GoodTeam("Blue")
g1.add("Asha")
print("Good:", g1.members, g2.members)

setattr(g1, "coach", "Ravi")
print(getattr(g1, "coach"), hasattr(g2, "coach"), getattr(g2, "coach", "none"))
print(g1.__dict__)
`,
      python: {
        files: {
          "main.py": `class BadTeam:
    members = []                   # shared by ALL teams!
    def __init__(self, name):
        self.name = name
    def add(self, person):
        self.members.append(person)

class GoodTeam:
    def __init__(self, name):
        self.name = name
        self.members = []          # each team gets its own list
    def add(self, person):
        self.members.append(person)

t1, t2 = BadTeam("Red"), BadTeam("Blue")
t1.add("Asha")
print("Bad:", t1.members, t2.members)

g1, g2 = GoodTeam("Red"), GoodTeam("Blue")
g1.add("Asha")
print("Good:", g1.members, g2.members)

setattr(g1, "coach", "Ravi")
print(getattr(g1, "coach"), hasattr(g2, "coach"), getattr(g2, "coach", "none"))
print(g1.__dict__)
`,
        },
      },
      result: `Bad: ['Asha'] ['Asha']
Good: ['Asha'] []
Ravi False none
{'name': 'Red', 'members': ['Asha'], 'coach': 'Ravi'}`,
      explanation: "A mutable class variable (list) is shared, so adding to one team affects all. Create mutable data inside __init__. setattr/getattr/hasattr work with attribute names as strings; getattr accepts a default.",
    },
  ],
  interview: [
    {
      q: "What is the difference between a class and an object?",
      a: "A class is a blueprint/template that defines attributes and methods. An object is a concrete instance created from that class with its own data.",
      level: "Easy",
    },
    {
      q: "What is __init__? Is it the constructor?",
      a: "__init__ is the initialiser that sets up a newly created object's attributes. The actual object creation is done by __new__; __init__ runs right after. It is commonly called the constructor.",
      level: "Medium",
    },
    {
      q: "What is self?",
      a: "The first parameter of instance methods, referring to the object on which the method is called. obj.method(x) is equivalent to Class.method(obj, x). self is a convention, not a keyword.",
      level: "Easy",
    },
    {
      q: "What is the difference between instance and class variables?",
      a: "Instance variables are defined on self and are unique per object. Class variables are defined in the class body and shared by all instances.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class A:
    x = 1
a, b = A(), A()
a.x = 5
A.x = 10
print(a.x, b.x, A.x)
`,
      a: `Output:
5 10 10

a.x = 5 created an instance variable on a that shadows the class variable. b has none, so it reads the class variable which is now 10.`,
      level: "Hard",
    },
    {
      q: `What is the output of this code?

class Counter:
    count = 0
    def __init__(self):
        Counter.count += 1
for _ in range(3):
    Counter()
print(Counter.count)
`,
      a: `Output:
3

The class variable is incremented once per object created.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class Bag:
    items = []
    def add(self, x):
        self.items.append(x)
b1, b2 = Bag(), Bag()
b1.add("pen")
print(b2.items)
`,
      a: `Output:
['pen']

items is a mutable class variable shared by all instances, so b2 sees the item added through b1. Create lists in __init__ instead.`,
      level: "Medium",
    },
    {
      q: "What error do you get if you forget self in a method definition?",
      a: "TypeError: method() takes 0 positional arguments but 1 was given - because Python always passes the object as the first argument.",
      level: "Medium",
    },
    {
      q: "What does obj.__dict__ contain?",
      a: "A dictionary of the object's instance attributes (not class variables or methods).",
      level: "Medium",
    },
    {
      q: "Name the four pillars of OOP.",
      a: "Encapsulation, Inheritance, Polymorphism and Abstraction.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Create a Rectangle class with length and width, and methods area() and perimeter(). Create two rectangles and print their results.",
      hint: "area = l * w, perimeter = 2 * (l + w)",
      solution: `class Rectangle:
    def __init__(self, length, width):
        self.length = length
        self.width = width
    def area(self):
        return self.length * self.width
    def perimeter(self):
        return 2 * (self.length + self.width)

for r in [Rectangle(4, 5), Rectangle(10, 2)]:
    print(r.area(), r.perimeter())
`,
    },
    {
      task: "Create a Book class with a class variable library = \"City Library\" and count of books. Each book has title and author. Print the total count after creating 3 books.",
      hint: "Increment Book.count in __init__.",
      solution: `class Book:
    library = "City Library"
    count = 0
    def __init__(self, title, author):
        self.title = title
        self.author = author
        Book.count += 1

books = [Book("Wings of Fire", "Kalam"), Book("Godan", "Premchand"), Book("Gitanjali", "Tagore")]
print(Book.library, Book.count)
`,
    },
    {
      task: "Create a BankAccount class with deposit(amount) and withdraw(amount) methods. withdraw should print \"Insufficient balance\" if needed.",
      hint: "Keep balance as an instance variable.",
      solution: `class BankAccount:
    def __init__(self, owner, balance=0):
        self.owner = owner
        self.balance = balance
    def deposit(self, amount):
        self.balance += amount
    def withdraw(self, amount):
        if amount > self.balance:
            print("Insufficient balance")
        else:
            self.balance -= amount

acc = BankAccount("Asha", 1000)
acc.deposit(500)
acc.withdraw(2000)
acc.withdraw(300)
print(acc.balance)
`,
    },
    {
      task: "Create an Employee class and a list of 3 employees. Print the name of the employee with the highest salary.",
      hint: "max(emps, key=lambda e: e.salary)",
      solution: `class Employee:
    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

emps = [Employee("Asha", 65000), Employee("Ravi", 48000), Employee("Neha", 72000)]
print(max(emps, key=lambda e: e.salary).name)
`,
    },
  ],
  quiz: [
    {
      question: "Which method runs automatically when an object is created?",
      options: [
        "__start__",
        "__init__",
        "__main__",
        "__create__",
      ],
      answer: 1,
      explanation: "__init__ initialises new objects.",
    },
    {
      question: "What does self refer to?",
      options: [
        "The class",
        "The module",
        "The current object",
        "The parent class",
      ],
      answer: 2,
      explanation: "self is the instance the method is called on.",
    },
    {
      question: "A variable defined directly inside the class body is a:",
      options: [
        "Class variable",
        "Local variable",
        "Instance variable",
        "Global variable",
      ],
      answer: 0,
      explanation: "It is shared by all instances.",
    },
    {
      question: "obj.method(5) is equivalent to:",
      options: [
        "method(5)",
        "obj(5).method",
        "self.method(obj, 5)",
        "Class.method(obj, 5)",
      ],
      answer: 3,
      explanation: "Python passes the object as the first argument.",
    },
    {
      question: "Where should a list that is unique to each object be created?",
      options: [
        "In the class body",
        "Inside __init__ using self",
        "As a global variable",
        "In a class method",
      ],
      answer: 1,
      explanation: "Mutable per-object data belongs in __init__.",
    },
  ],
};
