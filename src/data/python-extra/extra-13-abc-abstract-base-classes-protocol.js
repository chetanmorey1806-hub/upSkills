export default {
  id: "extra-13-abc-abstract-base-classes-protocol",
  title: "Abstract Base Classes (abc) and typing.Protocol",
  module: "Module 3: Advanced OOP & Internals",
  extraNo: 13,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Define clear contracts between parts of a system. Use abc.ABC and @abstractmethod to force subclasses to implement required methods (nominal typing), use collections.abc to build custom containers, and use typing.Protocol for structural typing ('duck typing with type checking') where classes match a contract simply by having the right methods.",
  objectives: [
    "Create abstract base classes with ABC, @abstractmethod and abstract properties",
    "Explain why abstract classes cannot be instantiated and how concrete subclasses work",
    "Use collections.abc base classes and mixin methods to build custom containers",
    "Use register() and __subclasshook__ for virtual subclasses",
    "Define structural interfaces with typing.Protocol and @runtime_checkable",
  ],
  theory: [
    {
      heading: "Why Abstract Base Classes?",
      content: `In a large project, many classes must follow the same contract: every payment gateway needs \`pay()\` and \`refund()\`, every storage backend needs \`save()\` and \`load()\`. Python's duck typing does not enforce this - a missing method is discovered only when it is called, maybe in production.

An **Abstract Base Class (ABC)** declares the required methods. Any subclass that does not implement all abstract methods **cannot be instantiated** - you get a TypeError immediately when creating the object, not later. ABCs are Python's version of interfaces/abstract classes in Java or C#, but they can also contain normal, fully implemented methods that subclasses inherit (template method pattern).`,
      points: [
        "Clear documentation of the contract",
        "Early errors at object creation time",
        "Shared code in the base class",
        "isinstance() checks against the abstraction",
      ],
    },
    {
      heading: "abc.ABC and @abstractmethod",
      content: `Inherit from \`abc.ABC\` (or use \`metaclass=ABCMeta\`) and decorate required methods with \`@abstractmethod\`. Abstract methods may contain a default implementation that subclasses can call with \`super()\`. A subclass becomes **concrete** only when it overrides every abstract method; the class attribute \`__abstractmethods__\` lists those still missing.

For abstract properties, stack decorators with \`@property\` on the outside: \`@property\` then \`@abstractmethod\`. Abstract classmethods and staticmethods work the same way (\`@classmethod\` on top of \`@abstractmethod\`).`,
      syntax: `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @abstractmethod
    def pay(self, amount: float) -> str: ...

    @property
    @abstractmethod
    def name(self) -> str: ...

    def receipt(self, amount):          # concrete shared method
        return f"{self.name}: {self.pay(amount)}"
`,
      tip: "ABCs check that methods exist, not their signatures. A subclass may define pay(self) with the wrong parameters - a type checker like mypy will catch that, the ABC will not.",
    },
    {
      heading: "collections.abc: Ready-made Container Interfaces",
      content: `\`collections.abc\` defines ABCs for Python's container protocols: \`Iterable\`, \`Iterator\`, \`Sized\`, \`Container\`, \`Sequence\`, \`MutableSequence\`, \`Mapping\`, \`MutableMapping\`, \`Set\`, \`Callable\`, \`Hashable\` and more. Each has a few abstract methods and provides many **mixin methods** for free.

For example, subclass \`Mapping\` and implement only \`__getitem__\`, \`__iter__\` and \`__len__\` - you automatically get \`get\`, \`keys\`, \`items\`, \`values\`, \`__contains__\` and \`__eq__\`. Subclass \`MutableMapping\` and add \`__setitem__\`/\`__delitem__\` to get \`update\`, \`pop\`, \`setdefault\` etc. These ABCs are also the right way to check types: \`isinstance(x, Mapping)\` works for dict, OrderedDict and custom mappings.`,
    },
    {
      heading: "Virtual Subclasses: register() and __subclasshook__",
      content: "An ABC can recognise classes that do not inherit from it. `MyABC.register(SomeClass)` makes `issubclass(SomeClass, MyABC)` True without inheritance (a **virtual subclass**) - no methods are checked or inherited. `__subclasshook__` lets an ABC decide by inspecting the class; this is how `isinstance(obj, collections.abc.Iterable)` is True for any class that simply defines `__iter__`, and `Sized` checks for `__len__`.",
    },
    {
      heading: "typing.Protocol: Structural Typing",
      content: `ABCs use **nominal typing**: a class must inherit (or be registered) to count. \`typing.Protocol\` (Python 3.8, PEP 544) uses **structural typing**: any class that has the required methods/attributes with compatible types satisfies the protocol - no inheritance needed. This is static duck typing: mypy/pyright check it, and you can use classes from third-party libraries you cannot modify.

By default, protocols are for type checkers only. Add \`@runtime_checkable\` to allow \`isinstance()\` checks, which only verify that the method names exist (not their signatures).`,
      syntax: `from typing import Protocol, runtime_checkable

@runtime_checkable
class Notifier(Protocol):
    def send(self, to: str, message: str) -> bool: ...

class SmsClient:                      # no inheritance!
    def send(self, to: str, message: str) -> bool:
        return True

def alert(n: Notifier) -> None: ...
alert(SmsClient())                    # OK for mypy
isinstance(SmsClient(), Notifier)     # True (runtime_checkable)
`,
    },
    {
      heading: "ABC or Protocol - Which to Choose?",
      content: "Use an **ABC** when you own the hierarchy and want shared implementation, runtime enforcement at instantiation, and an explicit 'is-a' relationship (plugins that must subclass your base). Use a **Protocol** when you only care about behaviour, want loose coupling, need to accept third-party classes, or define small interfaces for type hints (e.g. 'anything with a read() method'). Many modern codebases use Protocols for dependency injection and testing (fake classes need no inheritance).",
      points: [
        "ABC: nominal, runtime enforcement, can share code",
        "Protocol: structural, checked mainly by static type checkers",
        "Both document the contract; both work with isinstance (Protocol needs @runtime_checkable)",
      ],
    },
  ],
  examples: [
    {
      title: "Payment Gateway Contract with ABC",
      scenario: "An e-commerce app supports several payment providers. Each must implement pay() and refund(), and share a common receipt method.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def pay(self, amount: float) -> str: ...

    @abstractmethod
    def refund(self, txn_id: str) -> bool: ...

    def checkout(self, amount):
        txn = self.pay(amount)
        return f"[{self.name}] paid Rs {amount:.2f}, txn={txn}"

class Razorpay(PaymentGateway):
    name = "Razorpay"
    def pay(self, amount):
        return "rzp_001"
    def refund(self, txn_id):
        return True

class HalfDone(PaymentGateway):
    name = "HalfDone"
    def pay(self, amount):
        return "x"

print(Razorpay().checkout(499))
print(PaymentGateway.__abstractmethods__ == {"name", "pay", "refund"})
print(sorted(HalfDone.__abstractmethods__))

for cls in (PaymentGateway, HalfDone):
    try:
        cls()
    except TypeError as e:
        print("TypeError:", e)

print(isinstance(Razorpay(), PaymentGateway))
`,
      python: {
        files: {
          "main.py": `from abc import ABC, abstractmethod

class PaymentGateway(ABC):
    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    def pay(self, amount: float) -> str: ...

    @abstractmethod
    def refund(self, txn_id: str) -> bool: ...

    def checkout(self, amount):
        txn = self.pay(amount)
        return f"[{self.name}] paid Rs {amount:.2f}, txn={txn}"

class Razorpay(PaymentGateway):
    name = "Razorpay"
    def pay(self, amount):
        return "rzp_001"
    def refund(self, txn_id):
        return True

class HalfDone(PaymentGateway):
    name = "HalfDone"
    def pay(self, amount):
        return "x"

print(Razorpay().checkout(499))
print(PaymentGateway.__abstractmethods__ == {"name", "pay", "refund"})
print(sorted(HalfDone.__abstractmethods__))

for cls in (PaymentGateway, HalfDone):
    try:
        cls()
    except TypeError as e:
        print("TypeError:", e)

print(isinstance(Razorpay(), PaymentGateway))
`,
        },
      },
      result: `[Razorpay] paid Rs 499.00, txn=rzp_001
True
['refund']
TypeError: Can't instantiate abstract class PaymentGateway without an implementation for abstract methods 'name', 'pay', 'refund'
TypeError: Can't instantiate abstract class HalfDone without an implementation for abstract method 'refund'
True`,
      explanation: "The ABC declares an abstract property and two abstract methods, plus a concrete checkout() that uses them. Razorpay implements everything (a class attribute satisfies the abstract property), so it can be created. HalfDone forgets refund, so instantiation fails immediately with a clear TypeError.",
    },
    {
      title: "Template Method Pattern with super()",
      scenario: "A report framework defines the steps of generating a report; subclasses fill in data loading and formatting while reusing the shared workflow.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from abc import ABC, abstractmethod

class Report(ABC):
    def generate(self):
        rows = self.load()
        rows = [r for r in rows if r["amount"] > 0]
        return self.header() + "\\n" + "\\n".join(self.format_row(r) for r in rows)

    def header(self):
        return f"== {type(self).__name__} =="

    @abstractmethod
    def load(self): ...

    @abstractmethod
    def format_row(self, row):
        return f"{row['name']}: {row['amount']}"

class SalesReport(Report):
    def load(self):
        return [{"name": "Pune", "amount": 5000}, {"name": "Delhi", "amount": 0}, {"name": "Goa", "amount": 1200}]
    def format_row(self, row):
        return super().format_row(row) + " INR"

class CsvSalesReport(SalesReport):
    def header(self):
        return "city,amount"
    def format_row(self, row):
        return f"{row['name']},{row['amount']}"

print(SalesReport().generate())
print(CsvSalesReport().generate())
`,
      python: {
        files: {
          "main.py": `from abc import ABC, abstractmethod

class Report(ABC):
    def generate(self):
        rows = self.load()
        rows = [r for r in rows if r["amount"] > 0]
        return self.header() + "\\n" + "\\n".join(self.format_row(r) for r in rows)

    def header(self):
        return f"== {type(self).__name__} =="

    @abstractmethod
    def load(self): ...

    @abstractmethod
    def format_row(self, row):
        return f"{row['name']}: {row['amount']}"

class SalesReport(Report):
    def load(self):
        return [{"name": "Pune", "amount": 5000}, {"name": "Delhi", "amount": 0}, {"name": "Goa", "amount": 1200}]
    def format_row(self, row):
        return super().format_row(row) + " INR"

class CsvSalesReport(SalesReport):
    def header(self):
        return "city,amount"
    def format_row(self, row):
        return f"{row['name']},{row['amount']}"

print(SalesReport().generate())
print(CsvSalesReport().generate())
`,
        },
      },
      result: `== SalesReport ==
Pune: 5000 INR
Goa: 1200 INR
city,amount
Pune,5000
Goa,1200`,
      explanation: "generate() is the fixed algorithm (template). Subclasses must provide load() and format_row(); the abstract format_row has a default body that SalesReport extends via super(). CsvSalesReport overrides further. The base class controls the workflow, subclasses control details.",
    },
    {
      title: "Custom Container with collections.abc",
      scenario: "A config object should behave like a read-only dictionary with case-insensitive keys. Implement only three methods and get the rest free.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections.abc import Mapping, Iterable, Sized, Hashable

class CaseInsensitiveConfig(Mapping):
    def __init__(self, data):
        self._data = {k.lower(): v for k, v in data.items()}
    def __getitem__(self, key):
        return self._data[key.lower()]
    def __iter__(self):
        return iter(self._data)
    def __len__(self):
        return len(self._data)

cfg = CaseInsensitiveConfig({"Host": "localhost", "PORT": 5432})
print(cfg["HOST"], cfg["port"], len(cfg))
print("host" in cfg, cfg.get("user", "admin"))
print(list(cfg.keys()), list(cfg.items()))
print(cfg == {"host": "localhost", "port": 5432})
print(isinstance(cfg, Mapping), isinstance(cfg, dict))
try:
    cfg["host"] = "x"
except TypeError as e:
    print("Read-only:", e)

class Bag:
    def __iter__(self):
        return iter([1, 2])
    def __len__(self):
        return 2

print(isinstance(Bag(), Iterable), isinstance(Bag(), Sized), isinstance([], Hashable))
`,
      python: {
        files: {
          "main.py": `from collections.abc import Mapping, Iterable, Sized, Hashable

class CaseInsensitiveConfig(Mapping):
    def __init__(self, data):
        self._data = {k.lower(): v for k, v in data.items()}
    def __getitem__(self, key):
        return self._data[key.lower()]
    def __iter__(self):
        return iter(self._data)
    def __len__(self):
        return len(self._data)

cfg = CaseInsensitiveConfig({"Host": "localhost", "PORT": 5432})
print(cfg["HOST"], cfg["port"], len(cfg))
print("host" in cfg, cfg.get("user", "admin"))
print(list(cfg.keys()), list(cfg.items()))
print(cfg == {"host": "localhost", "port": 5432})
print(isinstance(cfg, Mapping), isinstance(cfg, dict))
try:
    cfg["host"] = "x"
except TypeError as e:
    print("Read-only:", e)

class Bag:
    def __iter__(self):
        return iter([1, 2])
    def __len__(self):
        return 2

print(isinstance(Bag(), Iterable), isinstance(Bag(), Sized), isinstance([], Hashable))
`,
        },
      },
      result: `localhost 5432 2
True admin
['host', 'port'] [('host', 'localhost'), ('port', 5432)]
True
True False
Read-only: 'CaseInsensitiveConfig' object does not support item assignment
True True False`,
      explanation: "Implementing __getitem__, __iter__ and __len__ gives get, keys, items, __contains__ and __eq__ via Mapping's mixins. Because Mapping has no __setitem__, assignment fails. Bag never inherits Iterable/Sized but passes isinstance checks thanks to __subclasshook__; lists are unhashable.",
    },
    {
      title: "Structural Typing with Protocol",
      scenario: "A notification service must accept any client that has a send() method - including third-party classes that cannot inherit from our base.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from typing import Protocol, runtime_checkable

@runtime_checkable
class Notifier(Protocol):
    def send(self, to: str, message: str) -> bool: ...

class EmailClient:
    def send(self, to: str, message: str) -> bool:
        print(f"  email to {to}: {message}")
        return True

class SmsClient:
    def send(self, to: str, message: str) -> bool:
        print(f"  sms to {to}: {message[:20]}")
        return True

class FakeNotifier:
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))
        return True

class Logger:
    def log(self, message): ...

def notify_all(notifiers: list[Notifier], to: str, msg: str) -> int:
    return sum(n.send(to, msg) for n in notifiers)

print("sent:", notify_all([EmailClient(), SmsClient()], "asha", "Your order #42 has shipped today"))
fake = FakeNotifier()
notify_all([fake], "ravi", "test")
print("fake recorded:", fake.sent)
print(isinstance(EmailClient(), Notifier), isinstance(Logger(), Notifier))
print(Notifier in EmailClient.__mro__)
`,
      python: {
        files: {
          "main.py": `from typing import Protocol, runtime_checkable

@runtime_checkable
class Notifier(Protocol):
    def send(self, to: str, message: str) -> bool: ...

class EmailClient:
    def send(self, to: str, message: str) -> bool:
        print(f"  email to {to}: {message}")
        return True

class SmsClient:
    def send(self, to: str, message: str) -> bool:
        print(f"  sms to {to}: {message[:20]}")
        return True

class FakeNotifier:
    def __init__(self):
        self.sent = []
    def send(self, to, message):
        self.sent.append((to, message))
        return True

class Logger:
    def log(self, message): ...

def notify_all(notifiers: list[Notifier], to: str, msg: str) -> int:
    return sum(n.send(to, msg) for n in notifiers)

print("sent:", notify_all([EmailClient(), SmsClient()], "asha", "Your order #42 has shipped today"))
fake = FakeNotifier()
notify_all([fake], "ravi", "test")
print("fake recorded:", fake.sent)
print(isinstance(EmailClient(), Notifier), isinstance(Logger(), Notifier))
print(Notifier in EmailClient.__mro__)
`,
        },
      },
      result: `  email to asha: Your order #42 has shipped today
  sms to asha: Your order #42 has s
sent: 2
fake recorded: [('ravi', 'test')]
True False
False`,
      explanation: "None of the classes inherit from Notifier, yet they satisfy it because they have a send method - structural typing. A test fake works without inheritance. @runtime_checkable enables isinstance, which only checks that 'send' exists. Notifier is not in the MRO: no inheritance happened.",
    },
    {
      title: "Virtual Subclasses with register()",
      scenario: "A plugin system wants to treat an existing third-party class as a valid Exporter without changing its code.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from abc import ABC, abstractmethod

class Exporter(ABC):
    @abstractmethod
    def export(self, data): ...

class ThirdPartyPdfWriter:
    def export(self, data):
        return f"PDF({len(data)} rows)"

class Broken:
    pass

print(issubclass(ThirdPartyPdfWriter, Exporter))
Exporter.register(ThirdPartyPdfWriter)
print(issubclass(ThirdPartyPdfWriter, Exporter), isinstance(ThirdPartyPdfWriter(), Exporter))
print(Exporter in ThirdPartyPdfWriter.__mro__)

Exporter.register(Broken)
print(isinstance(Broken(), Exporter), hasattr(Broken(), "export"))

def run(exporter):
    if not isinstance(exporter, Exporter):
        raise TypeError("not an exporter")
    return exporter.export([1, 2, 3])

print(run(ThirdPartyPdfWriter()))
try:
    run(Broken())
except AttributeError as e:
    print("AttributeError:", e)
`,
      python: {
        files: {
          "main.py": `from abc import ABC, abstractmethod

class Exporter(ABC):
    @abstractmethod
    def export(self, data): ...

class ThirdPartyPdfWriter:
    def export(self, data):
        return f"PDF({len(data)} rows)"

class Broken:
    pass

print(issubclass(ThirdPartyPdfWriter, Exporter))
Exporter.register(ThirdPartyPdfWriter)
print(issubclass(ThirdPartyPdfWriter, Exporter), isinstance(ThirdPartyPdfWriter(), Exporter))
print(Exporter in ThirdPartyPdfWriter.__mro__)

Exporter.register(Broken)
print(isinstance(Broken(), Exporter), hasattr(Broken(), "export"))

def run(exporter):
    if not isinstance(exporter, Exporter):
        raise TypeError("not an exporter")
    return exporter.export([1, 2, 3])

print(run(ThirdPartyPdfWriter()))
try:
    run(Broken())
except AttributeError as e:
    print("AttributeError:", e)
`,
        },
      },
      result: `False
True True
False
True False
PDF(3 rows)
AttributeError: 'Broken' object has no attribute 'export'`,
      explanation: "register() makes isinstance/issubclass return True without inheritance and without checking methods - Broken is accepted even though it has no export(). This is why register should only be used for classes you know implement the contract.",
    },
  ],
  interview: [
    {
      q: "What is an abstract base class in Python?",
      a: "A class that inherits from abc.ABC (metaclass ABCMeta) and has one or more methods marked @abstractmethod. It cannot be instantiated; subclasses must override all abstract methods to become concrete. It defines a contract and can provide shared implementation.",
      level: "Easy",
    },
    {
      q: "What happens if a subclass doesn't implement all abstract methods?",
      a: "The subclass is also abstract. Trying to create an instance raises `TypeError: Can't instantiate abstract class X without an implementation for abstract method ...` (Python 3.12 wording). The error happens at instantiation, not at class definition.",
      level: "Easy",
    },
    {
      q: "Can an abstract method have an implementation?",
      a: "Yes. The body can contain default logic, and subclasses must still override the method but can call `super().method()` to reuse it.",
      level: "Medium",
    },
    {
      q: "How do you declare an abstract property?",
      a: "Stack decorators: `@property` on top, then `@abstractmethod`, then the def. Subclasses can satisfy it with a property or a plain class attribute.",
      level: "Medium",
    },
    {
      q: "Does Python have interfaces like Java?",
      a: "No interface keyword. ABCs with only abstract methods play the role of interfaces (nominal), and typing.Protocol provides structural interfaces checked by static type checkers. Duck typing remains the default at runtime.",
      level: "Easy",
    },
    {
      q: "What is the difference between nominal and structural typing?",
      a: "Nominal typing: compatibility depends on declared inheritance (class X(Base)). Structural typing: compatibility depends on having the required members with compatible types, regardless of inheritance. ABCs are nominal; Protocols are structural.",
      level: "Medium",
    },
    {
      q: "What does @runtime_checkable do on a Protocol?",
      a: "It allows isinstance() and issubclass() with the protocol. The runtime check only verifies the presence of the protocol's members (method names/attributes), not their signatures or types, and it can be slow, so use it sparingly.",
      level: "Hard",
    },
    {
      q: "Why does isinstance(obj, collections.abc.Iterable) return True for classes that don't inherit from Iterable?",
      a: "Iterable defines `__subclasshook__`, which returns True for any class that has an `__iter__` method in its MRO. Several collections.abc ABCs (Sized, Container, Hashable, Callable...) do this 'one-trick pony' structural check.",
      level: "Hard",
    },
    {
      q: "What is a virtual subclass?",
      a: "A class registered with `ABC.register(cls)`. isinstance/issubclass return True, but the class does not inherit methods and its implementation is not checked, and the ABC does not appear in its MRO.",
      level: "Hard",
    },
    {
      q: "What are mixin methods in collections.abc?",
      a: "Concrete methods that an ABC provides once you implement its abstract methods. For example, implementing __getitem__, __iter__ and __len__ on a Mapping subclass gives you keys, items, values, get, __contains__, __eq__ and __ne__.",
      level: "Medium",
    },
    {
      q: "When would you choose Protocol over ABC?",
      a: "When you want loose coupling and to accept any object with the right methods - including third-party classes and simple test fakes - without forcing inheritance. Choose ABC when you control the hierarchy, want runtime enforcement at instantiation, or need to share implementation.",
      level: "Medium",
    },
    {
      q: "Does an ABC check method signatures?",
      a: "No. It only checks that abstract methods are overridden (the names exist and are not abstract). Signature compatibility is verified by static type checkers like mypy, not at runtime.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create an abstract class Shape with abstract methods area() and perimeter(), and a concrete describe() method. Implement Rectangle and Circle. Show that Shape() cannot be created.",
      hint: "describe() can return f\"{type(self).__name__}: area=..., perimeter=...\".",
      solution: `from abc import ABC, abstractmethod
import math

class Shape(ABC):
    @abstractmethod
    def area(self): ...
    @abstractmethod
    def perimeter(self): ...
    def describe(self):
        return f"{type(self).__name__}: area={self.area():.2f}, perimeter={self.perimeter():.2f}"

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w, self.h = w, h
    def area(self):
        return self.w * self.h
    def perimeter(self):
        return 2 * (self.w + self.h)

class Circle(Shape):
    def __init__(self, r):
        self.r = r
    def area(self):
        return math.pi * self.r ** 2
    def perimeter(self):
        return 2 * math.pi * self.r

for s in (Rectangle(3, 4), Circle(1)):
    print(s.describe())
try:
    Shape()
except TypeError as e:
    print("Error:", e)
`,
    },
    {
      task: "Define an abstract Storage class with save(key, value) and load(key). Implement MemoryStorage (dict-based). Write a function cache_user(storage, user) that only depends on the abstraction.",
      hint: "Type-hint the function parameter as Storage.",
      solution: `from abc import ABC, abstractmethod

class Storage(ABC):
    @abstractmethod
    def save(self, key, value): ...
    @abstractmethod
    def load(self, key): ...

class MemoryStorage(Storage):
    def __init__(self):
        self._d = {}
    def save(self, key, value):
        self._d[key] = value
    def load(self, key):
        return self._d.get(key)

def cache_user(storage: Storage, user: dict):
    storage.save(f"user:{user['id']}", user)
    return storage.load(f"user:{user['id']}")

print(cache_user(MemoryStorage(), {"id": 7, "name": "Asha"}))
`,
    },
    {
      task: "Write a Protocol `SupportsArea` with an area() -> float method (runtime_checkable). Write total_area(items) that sums areas, and test with two unrelated classes Square and Triangle. Check isinstance for a str.",
      hint: "class SupportsArea(Protocol): def area(self) -> float: ...",
      solution: `from typing import Protocol, runtime_checkable

@runtime_checkable
class SupportsArea(Protocol):
    def area(self) -> float: ...

class Square:
    def __init__(self, s): self.s = s
    def area(self): return self.s ** 2

class Triangle:
    def __init__(self, b, h): self.b, self.h = b, h
    def area(self): return 0.5 * self.b * self.h

def total_area(items: list[SupportsArea]) -> float:
    return sum(i.area() for i in items)

print(total_area([Square(2), Triangle(3, 4)]))
print(isinstance(Square(1), SupportsArea), isinstance("text", SupportsArea))
`,
    },
    {
      task: "Build a `Playlist` class that subclasses collections.abc.MutableSequence (implement __getitem__, __setitem__, __delitem__, __len__, insert) and show that append, extend, reverse, index and `in` work automatically.",
      hint: "Store items in a list self._songs and delegate to it.",
      solution: `from collections.abc import MutableSequence

class Playlist(MutableSequence):
    def __init__(self, songs=None):
        self._songs = list(songs or [])
    def __getitem__(self, i):
        return self._songs[i]
    def __setitem__(self, i, value):
        self._songs[i] = value
    def __delitem__(self, i):
        del self._songs[i]
    def __len__(self):
        return len(self._songs)
    def insert(self, i, value):
        self._songs.insert(i, value)
    def __repr__(self):
        return f"Playlist({self._songs})"

p = Playlist(["Song A"])
p.append("Song B")
p.extend(["Song C", "Song D"])
p.reverse()
print(p, len(p), p.index("Song B"), "Song C" in p)
`,
    },
  ],
  quiz: [
    {
      question: "What happens when you instantiate a class with an unimplemented @abstractmethod?",
      options: [
        "It works; error on call",
        "TypeError at instantiation",
        "NotImplementedError at instantiation",
        "A warning is printed",
      ],
      answer: 1,
      explanation: "ABCMeta blocks instantiation of classes that still have abstract methods.",
    },
    {
      question: "Which module provides ABC and abstractmethod?",
      options: [
        "typing",
        "abc",
        "collections",
        "functools",
      ],
      answer: 1,
      explanation: "They come from the abc module.",
    },
    {
      question: "typing.Protocol implements...",
      options: [
        "Nominal typing",
        "Structural typing",
        "Dynamic dispatch",
        "Multiple inheritance only",
      ],
      answer: 1,
      explanation: "A class matches a Protocol by having compatible members, without inheriting.",
    },
    {
      question: "To use isinstance() with a Protocol you must...",
      options: [
        "Inherit from it",
        "Decorate it with @runtime_checkable",
        "Register the class",
        "Nothing, it always works",
      ],
      answer: 1,
      explanation: "Without @runtime_checkable, isinstance with a Protocol raises TypeError.",
    },
    {
      question: "Subclassing collections.abc.Mapping requires implementing...",
      options: [
        "__getitem__, __iter__, __len__",
        "keys, values, items",
        "__setitem__ and __delitem__",
        "get and __contains__",
      ],
      answer: 0,
      explanation: "Those three abstract methods unlock all the mixin methods.",
    },
    {
      question: "After Exporter.register(Foo), which is true?",
      options: [
        "Foo inherits Exporter's methods",
        "isinstance(Foo(), Exporter) is True",
        "Exporter appears in Foo.__mro__",
        "Foo's methods are validated",
      ],
      answer: 1,
      explanation: "Registration creates a virtual subclass: isinstance works, nothing else changes.",
    },
  ],
};
