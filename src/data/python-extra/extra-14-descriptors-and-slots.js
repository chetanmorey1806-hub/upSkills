export default {
  id: "extra-14-descriptors-and-slots",
  title: "Descriptors and __slots__",
  module: "Module 3: Advanced OOP & Internals",
  extraNo: 14,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Understand the machinery behind attribute access. Descriptors (objects with __get__, __set__, __delete__) power property, methods, classmethod and staticmethod, and let you build reusable validated fields like Django and SQLAlchemy model fields. __slots__ replaces the per-instance __dict__ with fixed storage to save memory and block accidental attributes.",
  objectives: [
    "Explain the descriptor protocol: __get__, __set__, __delete__ and __set_name__",
    "Distinguish data and non-data descriptors and the attribute lookup order",
    "Build reusable validated fields with descriptors",
    "Explain how property, functions/methods and classmethod use descriptors",
    "Use __slots__ to reduce memory and know its limitations",
  ],
  theory: [
    {
      heading: "What is a Descriptor?",
      content: `A **descriptor** is an object, stored as a **class attribute**, whose class defines at least one of \`__get__\`, \`__set__\` or \`__delete__\`. When you access that attribute through an instance (\`obj.attr\`), Python does not just return the stored object - it calls the descriptor's method instead. This lets a class customise what reading, writing or deleting an attribute does, and reuse that logic across many attributes and classes.

You already use descriptors every day: \`@property\`, every normal method (functions are descriptors that create bound methods), \`@classmethod\`, \`@staticmethod\`, \`__slots__\` members, and ORM fields like \`models.CharField\` in Django.`,
      syntax: `class Descriptor:
    def __set_name__(self, owner, name):   # called at class creation (3.6+)
        self.name = name
    def __get__(self, instance, owner):    # obj.attr  (instance is None for Class.attr)
        ...
    def __set__(self, instance, value):    # obj.attr = value
        ...
    def __delete__(self, instance):        # del obj.attr
        ...
`,
    },
    {
      heading: "Data vs Non-data Descriptors and Lookup Order",
      content: `A **data descriptor** defines \`__set__\` and/or \`__delete__\` (property is one). A **non-data descriptor** defines only \`__get__\` (functions are). The difference matters for lookup priority when you read \`obj.x\`:

1. Data descriptor found on the class (type(obj).__mro__) wins.
2. Otherwise, the instance's own \`obj.__dict__['x']\` is used.
3. Otherwise, a non-data descriptor or plain class attribute is used.
4. Otherwise, \`__getattr__\` is called if defined, else AttributeError.

This is why you can override a method on a single instance (instance dict beats non-data descriptor), but you cannot bypass a property by putting a value into the instance dict.`,
      points: [
        "All of this logic lives in object.__getattribute__",
        "Descriptors only work as CLASS attributes, not instance attributes",
        "`Class.attr` calls __get__(None, Class) - return self for convenience",
      ],
    },
    {
      heading: "Building Validated Fields",
      content: `The most practical use of descriptors is a reusable validated field. With \`property\`, you would repeat getter/setter code for every attribute (price, quantity, discount). A descriptor class holds the validation once, and each attribute is just one line: \`price = Positive()\`.

Store each instance's value in the instance's own \`__dict__\` under the field name (set by \`__set_name__\`), NOT on the descriptor itself - the descriptor object is shared by all instances of the class, so storing data on it would leak values between objects.`,
      tip: "Classic bug: `self.value = value` inside __set__ stores the value on the shared descriptor, so every object shows the last assigned value. Use instance.__dict__[self.name].",
    },
    {
      heading: "How property, Methods and classmethod Work",
      content: `\`property(fget, fset, fdel)\` is a built-in data descriptor class: its \`__get__\` calls fget(instance), its \`__set__\` calls fset or raises AttributeError if there is none (read-only).

A plain function is a non-data descriptor: \`function.__get__(obj, cls)\` returns a **bound method** that remembers obj and passes it as \`self\`. That is the whole secret of \`self\`! \`classmethod.__get__\` binds the class instead, and \`staticmethod.__get__\` returns the raw function. \`functools.cached_property\` is a non-data descriptor that writes the computed value into the instance dict, so subsequent reads bypass it.`,
    },
    {
      heading: "__slots__: Fixed Attributes, Less Memory",
      content: `Normally each instance stores attributes in its own \`__dict__\` (a hash table), which is flexible but costs memory. Declaring \`__slots__ = ('x', 'y')\` in a class tells Python to reserve fixed slots for exactly those attributes and **not create \`__dict__\`** per instance. Benefits: much less memory per object (important for millions of objects), slightly faster attribute access, and assigning an undeclared attribute raises AttributeError (catches typos).

Under the hood, each slot name becomes a member descriptor on the class.`,
      syntax: `class Point:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

p = Point(1, 2)
p.z = 3        # AttributeError: 'Point' object has no attribute 'z'
`,
    },
    {
      heading: "__slots__ Limitations and Tips",
      content: "Things to know before using __slots__:",
      points: [
        "No __dict__, so no dynamic attributes (add '__dict__' to slots if you need both)",
        "No __weakref__ unless you add '__weakref__' to slots, so weakref.ref(obj) fails",
        "Each subclass must declare its own __slots__ (even empty ()) or it gets a __dict__ again",
        "Cannot put a class attribute default with the same name as a slot",
        "Multiple inheritance from two classes with non-empty slots causes layout conflicts",
        "cached_property needs __dict__, so it does not work on slotted classes",
        "`@dataclass(slots=True)` (3.10+) generates slots for you",
      ],
      tip: "Use __slots__ for small, numerous value objects (points, records, tree nodes, events). For ordinary business classes, the flexibility of __dict__ is usually worth it.",
    },
  ],
  examples: [
    {
      title: "Your First Descriptor: Logging Access",
      scenario: "A developer wants to see exactly when Python calls the descriptor methods.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Logged:
    def __set_name__(self, owner, name):
        self.name = name
        print(f"__set_name__: {owner.__name__}.{name}")

    def __get__(self, instance, owner):
        if instance is None:
            print(f"__get__ via class {owner.__name__}")
            return self
        value = instance.__dict__.get(self.name)
        print(f"__get__ {self.name} -> {value!r}")
        return value

    def __set__(self, instance, value):
        print(f"__set__ {self.name} = {value!r}")
        instance.__dict__[self.name] = value

print("-- defining class")
class Account:
    balance = Logged()
    def __init__(self, balance):
        self.balance = balance

print("-- using it")
acc = Account(1000)
acc.balance += 500
print(acc.__dict__)
print(type(Account.balance).__name__)
`,
      python: {
        files: {
          "main.py": `class Logged:
    def __set_name__(self, owner, name):
        self.name = name
        print(f"__set_name__: {owner.__name__}.{name}")

    def __get__(self, instance, owner):
        if instance is None:
            print(f"__get__ via class {owner.__name__}")
            return self
        value = instance.__dict__.get(self.name)
        print(f"__get__ {self.name} -> {value!r}")
        return value

    def __set__(self, instance, value):
        print(f"__set__ {self.name} = {value!r}")
        instance.__dict__[self.name] = value

print("-- defining class")
class Account:
    balance = Logged()
    def __init__(self, balance):
        self.balance = balance

print("-- using it")
acc = Account(1000)
acc.balance += 500
print(acc.__dict__)
print(type(Account.balance).__name__)
`,
        },
      },
      result: `-- defining class
__set_name__: Account.balance
-- using it
__set__ balance = 1000
__get__ balance -> 1000
__set__ balance = 1500
{'balance': 1500}
__get__ via class Account
Logged`,
      explanation: "__set_name__ runs once when the class body is created. `self.balance = ...` in __init__ calls __set__. `acc.balance += 500` calls __get__ then __set__. Accessing through the class passes instance=None and we return the descriptor itself.",
    },
    {
      title: "Reusable Validated Fields for a Product Model",
      scenario: "An inventory system needs many numeric and text fields with validation. Writing a property for each is repetitive; descriptors make each field one line.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Field:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__[self.name]
    def __set__(self, instance, value):
        self.validate(value)
        instance.__dict__[self.name] = value
    def validate(self, value):
        pass

class Positive(Field):
    def validate(self, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.name} must be a positive number, got {value!r}")

class NonEmptyText(Field):
    def __init__(self, max_len=50):
        self.max_len = max_len
    def validate(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{self.name} must be non-empty text")
        if len(value) > self.max_len:
            raise ValueError(f"{self.name} longer than {self.max_len}")

class Product:
    name = NonEmptyText(max_len=20)
    price = Positive()
    stock = Positive()
    def __init__(self, name, price, stock):
        self.name, self.price, self.stock = name, price, stock

p1 = Product("Keyboard", 1299, 10)
p2 = Product("Mouse", 499, 25)
print(p1.name, p1.price, "|", p2.name, p2.price)

for bad in [("", 10, 1), ("Pen", -5, 1), ("A very very long product name", 10, 1)]:
    try:
        Product(*bad)
    except ValueError as e:
        print("ValueError:", e)
try:
    p1.price = 0
except ValueError as e:
    print("ValueError:", e)
print(p1.price, vars(p1))
`,
      python: {
        files: {
          "main.py": `class Field:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, instance, owner):
        if instance is None:
            return self
        return instance.__dict__[self.name]
    def __set__(self, instance, value):
        self.validate(value)
        instance.__dict__[self.name] = value
    def validate(self, value):
        pass

class Positive(Field):
    def validate(self, value):
        if not isinstance(value, (int, float)) or value <= 0:
            raise ValueError(f"{self.name} must be a positive number, got {value!r}")

class NonEmptyText(Field):
    def __init__(self, max_len=50):
        self.max_len = max_len
    def validate(self, value):
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{self.name} must be non-empty text")
        if len(value) > self.max_len:
            raise ValueError(f"{self.name} longer than {self.max_len}")

class Product:
    name = NonEmptyText(max_len=20)
    price = Positive()
    stock = Positive()
    def __init__(self, name, price, stock):
        self.name, self.price, self.stock = name, price, stock

p1 = Product("Keyboard", 1299, 10)
p2 = Product("Mouse", 499, 25)
print(p1.name, p1.price, "|", p2.name, p2.price)

for bad in [("", 10, 1), ("Pen", -5, 1), ("A very very long product name", 10, 1)]:
    try:
        Product(*bad)
    except ValueError as e:
        print("ValueError:", e)
try:
    p1.price = 0
except ValueError as e:
    print("ValueError:", e)
print(p1.price, vars(p1))
`,
        },
      },
      result: `Keyboard 1299 | Mouse 499
ValueError: name must be non-empty text
ValueError: price must be a positive number, got -5
ValueError: name longer than 20
ValueError: price must be a positive number, got 0
1299 {'name': 'Keyboard', 'price': 1299, 'stock': 10}`,
      explanation: "Validation logic lives in the descriptor classes; Product declares fields in one line each. Values are stored in each instance's __dict__, so p1 and p2 keep separate data. Invalid assignments raise ValueError both in __init__ and later.",
    },
    {
      title: "Data vs Non-data Descriptors and Lookup Priority",
      scenario: "Demonstrate why an instance can shadow a method but cannot shadow a property.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class NonData:
    def __get__(self, instance, owner):
        return "from non-data descriptor"

class Data:
    def __get__(self, instance, owner):
        return "from data descriptor"
    def __set__(self, instance, value):
        raise AttributeError("read-only")

class Demo:
    nd = NonData()
    d = Data()
    def greet(self):
        return "method"

obj = Demo()
obj.__dict__["nd"] = "from instance dict"
obj.__dict__["d"] = "from instance dict"
print("nd:", obj.nd)
print("d :", obj.d)

obj.greet = lambda: "instance override"
print("greet:", obj.greet())

f = Demo.__dict__["greet"]
print(type(f).__name__, "->", type(f.__get__(obj, Demo)).__name__)
print(f.__get__(obj, Demo).__self__ is obj)

class Temp:
    def __init__(self):
        self._c = 25
    @property
    def celsius(self):
        return self._c
t = Temp()
try:
    t.celsius = 30
except AttributeError as e:
    print("AttributeError:", e)
print(type(Temp.__dict__["celsius"]).__name__, hasattr(property, "__set__"))
`,
      python: {
        files: {
          "main.py": `class NonData:
    def __get__(self, instance, owner):
        return "from non-data descriptor"

class Data:
    def __get__(self, instance, owner):
        return "from data descriptor"
    def __set__(self, instance, value):
        raise AttributeError("read-only")

class Demo:
    nd = NonData()
    d = Data()
    def greet(self):
        return "method"

obj = Demo()
obj.__dict__["nd"] = "from instance dict"
obj.__dict__["d"] = "from instance dict"
print("nd:", obj.nd)
print("d :", obj.d)

obj.greet = lambda: "instance override"
print("greet:", obj.greet())

f = Demo.__dict__["greet"]
print(type(f).__name__, "->", type(f.__get__(obj, Demo)).__name__)
print(f.__get__(obj, Demo).__self__ is obj)

class Temp:
    def __init__(self):
        self._c = 25
    @property
    def celsius(self):
        return self._c
t = Temp()
try:
    t.celsius = 30
except AttributeError as e:
    print("AttributeError:", e)
print(type(Temp.__dict__["celsius"]).__name__, hasattr(property, "__set__"))
`,
        },
      },
      result: `nd: from instance dict
d : from data descriptor
greet: instance override
function -> method
True
AttributeError: property 'celsius' of 'Temp' object has no setter
property True`,
      explanation: "The instance dict beats the non-data descriptor, but the data descriptor beats the instance dict. Methods are non-data descriptors (functions), so an instance attribute can shadow them. function.__get__ creates a bound method whose __self__ is obj. property without a setter is a data descriptor that refuses assignment.",
    },
    {
      title: "Memory Savings with __slots__",
      scenario: "A GPS tracking app stores millions of coordinate objects. Compare memory with and without __slots__ and see the restrictions.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys
import tracemalloc

class PointDict:
    def __init__(self, x, y):
        self.x, self.y = x, y

class PointSlots:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

def measure(cls, n=100_000):
    tracemalloc.start()
    pts = [cls(i, i) for i in range(n)]
    current, _ = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return current / n

d, s = measure(PointDict), measure(PointSlots)
print("slots use less memory:", s < d)

p = PointSlots(1, 2)
print(hasattr(p, "__dict__"), hasattr(PointDict(1, 2), "__dict__"))
try:
    p.z = 3
except AttributeError as e:
    print("AttributeError:", e)
print(type(PointSlots.__dict__["x"]).__name__)

class Child(PointSlots):
    pass
c = Child(1, 2)
c.extra = "allowed again"
print("subclass without __slots__ has __dict__:", c.__dict__)

import weakref
try:
    weakref.ref(p)
except TypeError as e:
    print("TypeError:", e)
`,
      python: {
        files: {
          "main.py": `import sys
import tracemalloc

class PointDict:
    def __init__(self, x, y):
        self.x, self.y = x, y

class PointSlots:
    __slots__ = ("x", "y")
    def __init__(self, x, y):
        self.x, self.y = x, y

def measure(cls, n=100_000):
    tracemalloc.start()
    pts = [cls(i, i) for i in range(n)]
    current, _ = tracemalloc.get_traced_memory()
    tracemalloc.stop()
    return current / n

d, s = measure(PointDict), measure(PointSlots)
print("slots use less memory:", s < d)

p = PointSlots(1, 2)
print(hasattr(p, "__dict__"), hasattr(PointDict(1, 2), "__dict__"))
try:
    p.z = 3
except AttributeError as e:
    print("AttributeError:", e)
print(type(PointSlots.__dict__["x"]).__name__)

class Child(PointSlots):
    pass
c = Child(1, 2)
c.extra = "allowed again"
print("subclass without __slots__ has __dict__:", c.__dict__)

import weakref
try:
    weakref.ref(p)
except TypeError as e:
    print("TypeError:", e)
`,
        },
      },
      result: `slots use less memory: True
False True
AttributeError: 'PointSlots' object has no attribute 'z'
member_descriptor
subclass without __slots__ has __dict__: {'extra': 'allowed again'}
TypeError: cannot create weak reference to 'PointSlots' object`,
      explanation: "Slotted instances have no per-object __dict__, so they use less memory. The saving depends on the Python version: on 3.12 it is roughly 25-30% for this tiny class (about 88 vs 120 bytes per object as measured by tracemalloc); older versions saved even more. Unknown attributes are rejected. Each slot is a member_descriptor on the class. A subclass without its own __slots__ gets a __dict__ back, and weak references need '__weakref__' in slots.",
    },
    {
      title: "dataclass(slots=True) and a Typed Descriptor",
      scenario: "Combine modern tools: a slotted dataclass for events and a generic type-checking descriptor.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class ClickEvent:
    user_id: int
    x: int
    y: int

e = ClickEvent(7, 120, 300)
print(e, ClickEvent.__slots__, hasattr(e, "__dict__"))
try:
    e.x = 5
except Exception as ex:
    print(type(ex).__name__, "-", ex)

class Typed:
    def __init__(self, kind):
        self.kind = kind
    def __set_name__(self, owner, name):
        self.private = "_" + name
    def __get__(self, obj, owner):
        return self if obj is None else getattr(obj, self.private)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"{self.private[1:]} must be {self.kind.__name__}, got {type(value).__name__}")
        setattr(obj, self.private, value)

class Employee:
    __slots__ = ("_name", "_salary")
    name = Typed(str)
    salary = Typed(int)
    def __init__(self, name, salary):
        self.name, self.salary = name, salary

emp = Employee("Asha", 85000)
print(emp.name, emp.salary)
try:
    emp.salary = "high"
except TypeError as ex:
    print("TypeError:", ex)
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass

@dataclass(slots=True, frozen=True)
class ClickEvent:
    user_id: int
    x: int
    y: int

e = ClickEvent(7, 120, 300)
print(e, ClickEvent.__slots__, hasattr(e, "__dict__"))
try:
    e.x = 5
except Exception as ex:
    print(type(ex).__name__, "-", ex)

class Typed:
    def __init__(self, kind):
        self.kind = kind
    def __set_name__(self, owner, name):
        self.private = "_" + name
    def __get__(self, obj, owner):
        return self if obj is None else getattr(obj, self.private)
    def __set__(self, obj, value):
        if not isinstance(value, self.kind):
            raise TypeError(f"{self.private[1:]} must be {self.kind.__name__}, got {type(value).__name__}")
        setattr(obj, self.private, value)

class Employee:
    __slots__ = ("_name", "_salary")
    name = Typed(str)
    salary = Typed(int)
    def __init__(self, name, salary):
        self.name, self.salary = name, salary

emp = Employee("Asha", 85000)
print(emp.name, emp.salary)
try:
    emp.salary = "high"
except TypeError as ex:
    print("TypeError:", ex)
`,
        },
      },
      result: `ClickEvent(user_id=7, x=120, y=300) ('user_id', 'x', 'y') False
FrozenInstanceError - cannot assign to field 'x'
Asha 85000
TypeError: salary must be int, got str`,
      explanation: "dataclass(slots=True) generates __slots__ automatically; frozen=True blocks assignment with FrozenInstanceError. The Typed descriptor stores values in private slot attributes (_name, _salary), showing that descriptors and __slots__ can work together when the descriptor uses getattr/setattr instead of __dict__.",
    },
  ],
  interview: [
    {
      q: "What is a descriptor in Python?",
      a: "An object defining __get__, __set__ or __delete__ that is stored as a class attribute. When the attribute is accessed through an instance or class, Python calls these methods instead of returning the object directly. property, methods, classmethod, staticmethod and __slots__ are all built on descriptors.",
      level: "Medium",
    },
    {
      q: "What is the difference between a data and non-data descriptor?",
      a: "A data descriptor defines __set__ or __delete__ (e.g. property); it takes precedence over the instance __dict__. A non-data descriptor defines only __get__ (e.g. functions, cached_property); the instance __dict__ takes precedence over it.",
      level: "Hard",
    },
    {
      q: "Explain the attribute lookup order for obj.attr.",
      a: "object.__getattribute__ looks up attr in type(obj).__mro__. If it is a data descriptor, call its __get__. Else, if attr is in obj.__dict__, return it. Else, if a non-data descriptor or class attribute was found, call __get__ / return it. Else call __getattr__ if defined, otherwise raise AttributeError.",
      level: "Hard",
    },
    {
      q: "What is __set_name__ used for?",
      a: "Added in Python 3.6, it is called on each descriptor when the owner class is created, with (owner, name). It lets a descriptor learn the attribute name it was assigned to, so it can store data under that name and produce good error messages without repeating the name manually.",
      level: "Medium",
    },
    {
      q: "Why should a descriptor not store values on self?",
      a: "The descriptor instance is a class attribute shared by all instances of the owner class. Storing per-object data on it means all objects share one value. Store data in instance.__dict__ (or a private attribute / WeakKeyDictionary).",
      level: "Hard",
    },
    {
      q: "How are methods related to descriptors?",
      a: "Functions implement __get__. Accessing obj.method calls function.__get__(obj, type(obj)), which returns a bound method object holding the function and obj; calling it passes obj as self. Accessing Class.method returns the plain function.",
      level: "Hard",
    },
    {
      q: "Property vs descriptor class - when to use which?",
      a: "Use @property for logic specific to one attribute in one class. Use a descriptor class when the same logic (validation, type checking, lazy loading, unit conversion) is needed for many attributes or classes - like ORM fields.",
      level: "Medium",
    },
    {
      q: "What is __slots__ and why use it?",
      a: "A class attribute listing allowed instance attributes. Python allocates fixed storage for them instead of a per-instance __dict__, saving memory and slightly speeding attribute access, and it prevents creating undeclared attributes.",
      level: "Medium",
    },
    {
      q: "What are the drawbacks of __slots__?",
      a: "No dynamic attributes, no __weakref__ by default, subclasses must declare slots too, conflicts in multiple inheritance, cannot have class-level defaults with slot names, incompatible with cached_property and some libraries that expect __dict__.",
      level: "Medium",
    },
    {
      q: "If a parent class defines __slots__ but a child does not, what happens?",
      a: "The child instances get a __dict__ (and __weakref__) again, so the memory saving is lost and arbitrary attributes are allowed. The child should define __slots__ = () or its own new names.",
      level: "Hard",
    },
    {
      q: "How do you make a read-only attribute?",
      a: "Use a @property with only a getter (no setter); assignment raises AttributeError. Or a data descriptor whose __set__ raises. For whole objects, use frozen dataclasses or namedtuples.",
      level: "Easy",
    },
    {
      q: "Where are descriptors used in popular frameworks?",
      a: "Django model fields and related-object managers (e.g. ForeignKey access), SQLAlchemy mapped columns (InstrumentedAttribute), attrs/pydantic validators, and functools.cached_property in many codebases.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a descriptor `Range(min, max)` that only allows numbers in [min, max]. Use it for `marks = Range(0, 100)` and `attendance = Range(0, 1)` in a Student class and test valid and invalid values.",
      hint: "Store in instance.__dict__[self.name]; raise ValueError when out of range.",
      solution: `class Range:
    def __init__(self, lo, hi):
        self.lo, self.hi = lo, hi
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner):
        return self if obj is None else obj.__dict__[self.name]
    def __set__(self, obj, value):
        if not self.lo <= value <= self.hi:
            raise ValueError(f"{self.name} must be between {self.lo} and {self.hi}")
        obj.__dict__[self.name] = value

class Student:
    marks = Range(0, 100)
    attendance = Range(0, 1)
    def __init__(self, marks, attendance):
        self.marks, self.attendance = marks, attendance

s = Student(88, 0.92)
print(s.marks, s.attendance)
try:
    s.marks = 120
except ValueError as e:
    print(e)
`,
    },
    {
      task: "Write a `LowerCase` descriptor that automatically stores email addresses in lower case and strips spaces. Use it in a User class.",
      hint: "Transform the value in __set__ before storing.",
      solution: `class LowerCase:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, owner):
        return self if obj is None else obj.__dict__.get(self.name)
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value.strip().lower()

class User:
    email = LowerCase()
    def __init__(self, email):
        self.email = email

u = User("  Asha.Patil@Example.COM ")
print(repr(u.email))
`,
    },
    {
      task: "Create a slotted class `Pixel` with r, g, b slots and a method brightness(). Show that adding an attribute fails, then create a subclass `AlphaPixel` with its own __slots__ = ('a',) and confirm it has no __dict__.",
      hint: "hasattr(obj, '__dict__')",
      solution: `class Pixel:
    __slots__ = ("r", "g", "b")
    def __init__(self, r, g, b):
        self.r, self.g, self.b = r, g, b
    def brightness(self):
        return round((self.r + self.g + self.b) / 3, 1)

class AlphaPixel(Pixel):
    __slots__ = ("a",)
    def __init__(self, r, g, b, a):
        super().__init__(r, g, b)
        self.a = a

p = Pixel(255, 128, 0)
print(p.brightness())
try:
    p.alpha = 1
except AttributeError as e:
    print("AttributeError:", e)
ap = AlphaPixel(10, 20, 30, 0.5)
print(ap.a, hasattr(ap, "__dict__"))
`,
    },
    {
      task: "Implement a simplified version of property called `MyProperty` (supporting a getter and an optional setter via .setter) and use it for a Celsius/Fahrenheit Temperature class.",
      hint: "__get__ calls self.fget(obj); __set__ calls self.fset(obj, value) or raises AttributeError; setter(fset) returns a new MyProperty(self.fget, fset).",
      solution: `class MyProperty:
    def __init__(self, fget=None, fset=None):
        self.fget, self.fset = fget, fset
    def __get__(self, obj, owner):
        if obj is None:
            return self
        return self.fget(obj)
    def __set__(self, obj, value):
        if self.fset is None:
            raise AttributeError("can't set attribute")
        self.fset(obj, value)
    def setter(self, fset):
        return MyProperty(self.fget, fset)

class Temperature:
    def __init__(self, c):
        self.c = c
    @MyProperty
    def fahrenheit(self):
        return self.c * 9 / 5 + 32
    @fahrenheit.setter
    def fahrenheit(self, f):
        self.c = (f - 32) * 5 / 9

t = Temperature(25)
print(t.fahrenheit)
t.fahrenheit = 212
print(t.c)
`,
    },
  ],
  quiz: [
    {
      question: "Which method makes an object a descriptor?",
      options: [
        "__call__",
        "__get__",
        "__init__",
        "__repr__",
      ],
      answer: 1,
      explanation: "Defining __get__, __set__ or __delete__ makes an object a descriptor.",
    },
    {
      question: "property is a...",
      options: [
        "Non-data descriptor",
        "Data descriptor",
        "Metaclass",
        "Decorator only, not a descriptor",
      ],
      answer: 1,
      explanation: "property defines __get__, __set__ and __delete__, so it is a data descriptor.",
    },
    {
      question: "Which wins for obj.x: a non-data descriptor on the class or obj.__dict__['x']?",
      options: [
        "The descriptor",
        "obj.__dict__['x']",
        "Whichever was defined last",
        "It raises an error",
      ],
      answer: 1,
      explanation: "The instance dict has priority over non-data descriptors.",
    },
    {
      question: "When is __set_name__ called?",
      options: [
        "Every attribute access",
        "When the owner class is created",
        "When an instance is created",
        "When the module is imported only",
      ],
      answer: 1,
      explanation: "It runs once for each descriptor at class creation time.",
    },
    {
      question: "What does __slots__ = ('a', 'b') prevent?",
      options: [
        "Reading a and b",
        "Creating attributes other than a and b on instances",
        "Inheritance",
        "Defining methods",
      ],
      answer: 1,
      explanation: "Without a __dict__, only declared slots can be assigned.",
    },
    {
      question: "A subclass of a slotted class that does not define __slots__...",
      options: [
        "Inherits the memory savings fully",
        "Gets a __dict__ again",
        "Raises TypeError",
        "Cannot add methods",
      ],
      answer: 1,
      explanation: "Without its own __slots__, the subclass adds __dict__ and __weakref__.",
    },
  ],
};
