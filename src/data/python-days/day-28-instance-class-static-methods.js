export default {
  id: "day-28-instance-class-static-methods",
  title: "Methods: Instance, Class (@classmethod), Static (@staticmethod)",
  module: "Module 5: Object-Oriented Programming",
  day: 28,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn the three kinds of methods in a Python class - instance methods that work with object data, class methods that work with the class itself (perfect for alternative constructors), and static methods that are utility functions grouped inside the class.",
  objectives: [
    "Write instance methods that read and change object state",
    "Write class methods with @classmethod and cls, including factory/alternative constructors",
    "Write static methods with @staticmethod for related utilities",
    "Choose the right method type for a given task",
    "Call each method type from the class and from an object",
  ],
  theory: [
    {
      heading: "Instance Methods",
      content: "The normal method type. The first parameter is self (the object). They can read and modify instance data and also access class data via self.__class__ or the class name. Use them when the behaviour depends on a specific object, e.g. account.deposit(500).",
      syntax: `class Account:
    def __init__(self, balance):
        self.balance = balance
    def deposit(self, amount):      # instance method
        self.balance += amount
`,
    },
    {
      heading: "Class Methods (@classmethod)",
      content: "Decorated with @classmethod; the first parameter is cls (the class, not an object). They can read and modify class variables and create new objects using cls(...). The most common use is an alternative constructor (factory method) such as Date.from_string(\"2025-01-26\") or Employee.from_csv_row(row). Because cls is used, it also works correctly for subclasses.",
      syntax: `class Employee:
    raise_pct = 5
    def __init__(self, name, salary): ...

    @classmethod
    def set_raise(cls, pct):
        cls.raise_pct = pct

    @classmethod
    def from_string(cls, text):      # "Asha-50000"
        name, salary = text.split("-")
        return cls(name, int(salary))
`,
    },
    {
      heading: "Static Methods (@staticmethod)",
      content: "Decorated with @staticmethod; no automatic first parameter (no self, no cls). It is just a normal function placed inside the class because it logically belongs there, e.g. Employee.is_valid_email(text) or MathUtils.is_prime(n). It cannot access instance or class state unless passed in explicitly.",
      syntax: `class Employee:
    @staticmethod
    def is_workday(day):
        return day.weekday() < 5
`,
    },
    {
      heading: "Choosing the Right Method",
      content: "Ask: what does this method need? Object data -> instance method. Class data or creating objects in a new way -> class method. Neither -> static method (or a module-level function). Analogy in a school: student.submit_homework() is per student (instance); School.change_timing() affects the whole school (class); School.is_holiday(date) is just a rule check (static).",
      points: [
        "All three can be called on an object: obj.m()",
        "Class and static methods are usually called on the class: Cls.m()",
        "Calling an instance method on the class needs the object: Cls.m(obj)",
      ],
    },
  ],
  examples: [
    {
      title: "All Three Method Types in One Class",
      scenario: "An Employee class with salary raise (instance), company-wide raise percentage (class) and a working-day check (static).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import date

class Employee:
    raise_pct = 5
    company = "TechSoft"

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def apply_raise(self):                 # instance method
        self.salary = int(self.salary * (1 + self.raise_pct / 100))
        return self.salary

    @classmethod
    def set_raise(cls, pct):               # class method
        cls.raise_pct = pct

    @staticmethod
    def is_workday(day):                   # static method
        return day.weekday() < 5

e1 = Employee("Asha", 50000)
e2 = Employee("Ravi", 40000)
print(e1.apply_raise())

Employee.set_raise(10)
print(e2.apply_raise(), e1.raise_pct, e2.raise_pct)

print(Employee.is_workday(date(2025, 1, 25)))   # Saturday
print(e1.is_workday(date(2025, 1, 27)))         # Monday
`,
      python: {
        files: {
          "main.py": `from datetime import date

class Employee:
    raise_pct = 5
    company = "TechSoft"

    def __init__(self, name, salary):
        self.name = name
        self.salary = salary

    def apply_raise(self):                 # instance method
        self.salary = int(self.salary * (1 + self.raise_pct / 100))
        return self.salary

    @classmethod
    def set_raise(cls, pct):               # class method
        cls.raise_pct = pct

    @staticmethod
    def is_workday(day):                   # static method
        return day.weekday() < 5

e1 = Employee("Asha", 50000)
e2 = Employee("Ravi", 40000)
print(e1.apply_raise())

Employee.set_raise(10)
print(e2.apply_raise(), e1.raise_pct, e2.raise_pct)

print(Employee.is_workday(date(2025, 1, 25)))   # Saturday
print(e1.is_workday(date(2025, 1, 27)))         # Monday
`,
        },
      },
      result: `52500
44000 10 10
False
True`,
      explanation: "apply_raise uses object data (self.salary). set_raise changes the class variable for all employees. is_workday needs no object or class data - it is a utility that logically belongs to Employee.",
    },
    {
      title: "Alternative Constructors with @classmethod",
      scenario: "Create Employee objects from different data sources: a string, a dict and a CSV line.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Employee:
    count = 0

    def __init__(self, name, dept, salary):
        self.name = name
        self.dept = dept
        self.salary = salary
        Employee.count += 1

    @classmethod
    def from_string(cls, text):            # "Asha-IT-65000"
        name, dept, salary = text.split("-")
        return cls(name, dept, int(salary))

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["dept"], data["salary"])

    def __repr__(self):
        return f"Employee({self.name!r}, {self.dept!r}, {self.salary})"

e1 = Employee("Ravi", "HR", 42000)
e2 = Employee.from_string("Asha-IT-65000")
e3 = Employee.from_dict({"name": "Neha", "dept": "IT", "salary": 72000})
rows = ["Om-Sales-38000", "Kiran-IT-58000"]
more = [Employee.from_string(r) for r in rows]

print(e1, e2, e3, sep="\\n")
print(more)
print("Total employees:", Employee.count)
`,
      python: {
        files: {
          "main.py": `class Employee:
    count = 0

    def __init__(self, name, dept, salary):
        self.name = name
        self.dept = dept
        self.salary = salary
        Employee.count += 1

    @classmethod
    def from_string(cls, text):            # "Asha-IT-65000"
        name, dept, salary = text.split("-")
        return cls(name, dept, int(salary))

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"], data["dept"], data["salary"])

    def __repr__(self):
        return f"Employee({self.name!r}, {self.dept!r}, {self.salary})"

e1 = Employee("Ravi", "HR", 42000)
e2 = Employee.from_string("Asha-IT-65000")
e3 = Employee.from_dict({"name": "Neha", "dept": "IT", "salary": 72000})
rows = ["Om-Sales-38000", "Kiran-IT-58000"]
more = [Employee.from_string(r) for r in rows]

print(e1, e2, e3, sep="\\n")
print(more)
print("Total employees:", Employee.count)
`,
        },
      },
      result: `Employee('Ravi', 'HR', 42000)
Employee('Asha', 'IT', 65000)
Employee('Neha', 'IT', 72000)
[Employee('Om', 'Sales', 38000), Employee('Kiran', 'IT', 58000)]
Total employees: 5`,
      explanation: "Class methods return cls(...), giving several clean ways to build objects while __init__ stays simple. This is the factory-method pattern, used by built-ins too, e.g. dict.fromkeys() and datetime.fromisoformat().",
    },
    {
      title: "Static Utility Methods and Validation",
      scenario: "A Validator class groups helper checks used while registering users.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: asha@mail.com, 98765abc10",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Validator:
    @staticmethod
    def is_email(text):
        return "@" in text and "." in text.split("@")[-1]

    @staticmethod
    def is_phone(text):
        return text.isdigit() and len(text) == 10

    @classmethod
    def check_all(cls, email, phone):
        return {"email": cls.is_email(email), "phone": cls.is_phone(phone)}

email = input("Email: ")
phone = input("Phone: ")
print()
print(Validator.check_all(email, phone))
print(Validator.is_phone("9876543210"))
`,
      python: {
        files: {
          "main.py": `class Validator:
    @staticmethod
    def is_email(text):
        return "@" in text and "." in text.split("@")[-1]

    @staticmethod
    def is_phone(text):
        return text.isdigit() and len(text) == 10

    @classmethod
    def check_all(cls, email, phone):
        return {"email": cls.is_email(email), "phone": cls.is_phone(phone)}

email = input("Email: ")
phone = input("Phone: ")
print()
print(Validator.check_all(email, phone))
print(Validator.is_phone("9876543210"))
`,
        },
        stdin: `asha@mail.com
98765abc10
`,
      },
      result: `Email: Phone: 
{'email': True, 'phone': False}
True`,
      explanation: "Static methods are pure helpers. The class method check_all calls them through cls, so a subclass could override the rules. \"98765abc10\" is not all digits, so phone is False.",
    },
    {
      title: "Class Method Works with Inheritance",
      scenario: "See why factory methods use cls instead of the hard-coded class name.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Pizza:
    def __init__(self, toppings):
        self.toppings = toppings

    @classmethod
    def margherita(cls):
        return cls(["cheese", "tomato"])

    @staticmethod
    def price_for(size):
        return {"S": 199, "M": 349, "L": 499}[size]

    def describe(self):
        return f"{type(self).__name__} with {', '.join(self.toppings)}"

class CheeseBurstPizza(Pizza):
    pass

p1 = Pizza.margherita()
p2 = CheeseBurstPizza.margherita()      # cls is CheeseBurstPizza here
print(p1.describe())
print(p2.describe())
print(Pizza.price_for("M"), p2.price_for("L"))
print(type(Pizza.__dict__["margherita"]).__name__, type(Pizza.__dict__["price_for"]).__name__)
`,
      python: {
        files: {
          "main.py": `class Pizza:
    def __init__(self, toppings):
        self.toppings = toppings

    @classmethod
    def margherita(cls):
        return cls(["cheese", "tomato"])

    @staticmethod
    def price_for(size):
        return {"S": 199, "M": 349, "L": 499}[size]

    def describe(self):
        return f"{type(self).__name__} with {', '.join(self.toppings)}"

class CheeseBurstPizza(Pizza):
    pass

p1 = Pizza.margherita()
p2 = CheeseBurstPizza.margherita()      # cls is CheeseBurstPizza here
print(p1.describe())
print(p2.describe())
print(Pizza.price_for("M"), p2.price_for("L"))
print(type(Pizza.__dict__["margherita"]).__name__, type(Pizza.__dict__["price_for"]).__name__)
`,
        },
      },
      result: `Pizza with cheese, tomato
CheeseBurstPizza with cheese, tomato
349 499
classmethod staticmethod`,
      explanation: "Because margherita uses cls, calling it on the subclass creates a CheeseBurstPizza. Internally the decorators wrap the functions in classmethod and staticmethod objects.",
    },
  ],
  interview: [
    {
      q: "What is the difference between @classmethod and @staticmethod?",
      a: "A classmethod receives the class as its first argument (cls) and can access/modify class state or create instances. A staticmethod receives no implicit argument and behaves like a plain function grouped in the class namespace.",
      level: "Easy",
    },
    {
      q: "What is an alternative constructor?",
      a: "A class method that creates and returns an instance from a different input format, e.g. Employee.from_string(\"Asha-50000\") returning cls(name, salary). Examples in the standard library: dict.fromkeys, datetime.fromtimestamp.",
      level: "Medium",
    },
    {
      q: "Can a static method access instance variables?",
      a: "Not directly - it has no self. It can only use what is passed to it as arguments.",
      level: "Easy",
    },
    {
      q: "Why use cls(...) instead of the class name inside a classmethod factory?",
      a: "cls refers to the class the method was called on, so subclasses get instances of the subclass. Hard-coding the class name would always build the parent class.",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

class A:
    n = 0
    @classmethod
    def inc(cls):
        cls.n += 1
        return cls.n
a = A()
a.inc(); A.inc()
print(A.n, a.n)
`,
      a: `Output:
2 2

Calling the classmethod through the object still passes the class as cls, so both calls update the class variable A.n.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

class M:
    @staticmethod
    def add(a, b):
        return a + b
    def twice(self, x):
        return self.add(x, x)
print(M.add(2, 3), M().twice(4))
`,
      a: `Output:
5 8

A static method can be called through the class or through self.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

class Base:
    @classmethod
    def create(cls):
        return cls()
class Child(Base):
    pass
print(type(Child.create()).__name__)
`,
      a: `Output:
Child

cls is Child when create() is called on Child, so a Child object is returned.`,
      level: "Medium",
    },
    {
      q: "When would you choose a module-level function over a static method?",
      a: "When the function is generally useful and not strongly tied to the class concept. Static methods are good when the helper logically belongs with the class and should be overridable in subclasses.",
      level: "Hard",
    },
    {
      q: "Can you call an instance method using the class name?",
      a: "Yes, but you must pass the object explicitly: Class.method(obj, args). Calling Class.method(args) without the object raises TypeError.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create a Temperature class with an instance method to_fahrenheit() and a class method from_fahrenheit(f) that returns a Temperature in Celsius.",
      hint: "C = (F - 32) * 5 / 9",
      solution: `class Temperature:
    def __init__(self, celsius):
        self.celsius = celsius
    def to_fahrenheit(self):
        return self.celsius * 9 / 5 + 32
    @classmethod
    def from_fahrenheit(cls, f):
        return cls(round((f - 32) * 5 / 9, 2))

t = Temperature.from_fahrenheit(98.6)
print(t.celsius, t.to_fahrenheit())
`,
    },
    {
      task: "Create a MathUtils class with static methods is_prime(n) and factorial(n). Print primes below 20 and factorial(5).",
      hint: "Static methods need no self.",
      solution: `class MathUtils:
    @staticmethod
    def is_prime(n):
        if n < 2:
            return False
        return all(n % i for i in range(2, int(n ** 0.5) + 1))
    @staticmethod
    def factorial(n):
        result = 1
        for i in range(2, n + 1):
            result *= i
        return result

print([n for n in range(20) if MathUtils.is_prime(n)])
print(MathUtils.factorial(5))
`,
    },
    {
      task: "Create a Student class with a class variable passing_marks = 40, a class method set_passing(marks) and an instance method has_passed().",
      hint: "Instance method compares self.marks with self.passing_marks.",
      solution: `class Student:
    passing_marks = 40
    def __init__(self, name, marks):
        self.name = name
        self.marks = marks
    @classmethod
    def set_passing(cls, marks):
        cls.passing_marks = marks
    def has_passed(self):
        return self.marks >= self.passing_marks

s = Student("Ravi", 45)
print(s.has_passed())
Student.set_passing(50)
print(s.has_passed())
`,
    },
    {
      task: "Create a Date class with a classmethod from_string(\"26-01-2025\") and an instance method is_leap_year().",
      hint: "Leap: divisible by 4 and (not by 100 or by 400).",
      solution: `class Date:
    def __init__(self, day, month, year):
        self.day, self.month, self.year = day, month, year
    @classmethod
    def from_string(cls, text):
        d, m, y = map(int, text.split("-"))
        return cls(d, m, y)
    def is_leap_year(self):
        y = self.year
        return y % 4 == 0 and (y % 100 != 0 or y % 400 == 0)

print(Date.from_string("26-01-2025").is_leap_year())
print(Date.from_string("29-02-2024").is_leap_year())
`,
    },
  ],
  quiz: [
    {
      question: "What is the first parameter of a class method by convention?",
      options: [
        "self",
        "cls",
        "class",
        "this",
      ],
      answer: 1,
      explanation: "Class methods receive the class as cls.",
    },
    {
      question: "Which method type receives no automatic first argument?",
      options: [
        "Instance method",
        "Class method",
        "Static method",
        "__init__",
      ],
      answer: 2,
      explanation: "Static methods receive nothing implicitly.",
    },
    {
      question: "Which is the best choice for an alternative constructor?",
      options: [
        "@classmethod",
        "@staticmethod",
        "@property",
        "A global variable",
      ],
      answer: 0,
      explanation: "A classmethod can call cls(...) and supports subclasses.",
    },
    {
      question: "Which method can modify a class variable using cls?",
      options: [
        "Static method",
        "Lambda",
        "Instance method only",
        "Class method",
      ],
      answer: 3,
      explanation: "Class methods get cls and can update class state.",
    },
    {
      question: "Employee.from_string(\"Asha-5000\") most likely returns:",
      options: [
        "A string",
        "A new Employee object",
        "None",
        "A dict",
      ],
      answer: 1,
      explanation: "Factory class methods return new instances.",
    },
  ],
};
