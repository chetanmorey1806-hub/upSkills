export default {
  id: "extra-15-metaclasses-class-creation",
  title: "Metaclasses and Class Creation (type, __init_subclass__)",
  module: "Module 3: Advanced OOP & Internals",
  extraNo: 15,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Learn how Python creates classes: classes are objects, type is the default metaclass, and the class statement calls type(name, bases, namespace). See how custom metaclasses (__new__, __init__, __call__, __prepare__) customise class creation and instantiation, and why simpler tools - __init_subclass__, class decorators and __set_name__ - are usually preferred.",
  objectives: [
    "Explain that classes are objects and type is the class of classes",
    "Create classes dynamically with type(name, bases, dict)",
    "Write a metaclass that validates or registers classes",
    "Use __call__ in a metaclass to control instance creation (e.g. singleton)",
    "Prefer __init_subclass__ and class decorators for common use cases",
  ],
  theory: [
    {
      heading: "Classes are Objects",
      content: `In Python, everything is an object - including classes. A class can be stored in a variable, passed to a function, added to a list, and given attributes at runtime. Every object has a type: \`type(5)\` is \`int\`, \`type("hi")\` is \`str\`. So what is the type of a class? \`type(int)\` is \`type\`, and for your own \`class User: ...\`, \`type(User)\` is also \`type\`.

The object that creates and describes classes is called a **metaclass**. \`type\` is Python's default metaclass. Just as a class is a factory for instances, a metaclass is a factory for classes.`,
      points: [
        "instance -> created by its class (User)",
        "class -> created by its metaclass (type)",
        "type is its own type: type(type) is type",
        "object is the root base class; type is the root metaclass",
      ],
    },
    {
      heading: "What the class Statement Really Does",
      content: `When Python executes a \`class\` statement it: (1) determines the metaclass (explicit \`metaclass=\` or the metaclass of the bases, default \`type\`), (2) calls \`metaclass.__prepare__(name, bases)\` to get a namespace dict, (3) executes the class body inside that namespace, (4) calls \`metaclass(name, bases, namespace)\` which runs \`__new__\` then \`__init__\` to build the class object, (5) calls \`__set_name__\` on descriptors and \`__init_subclass__\` on the parent, (6) applies class decorators, and finally binds the name.

So you can create a class without the class statement using the 3-argument form of type.`,
      syntax: `# these two are equivalent
class Point:
    dims = 2
    def norm(self): return 0

Point = type("Point", (object,), {"dims": 2, "norm": lambda self: 0})
`,
    },
    {
      heading: "Writing a Custom Metaclass",
      content: "A metaclass is a class that inherits from `type`. Override `__new__(mcs, name, bases, namespace)` to inspect or modify the namespace before the class is created (add methods, rename attributes, validate), or `__init__` to act after creation (e.g. register the class). Use it with `class Model(metaclass=MyMeta):`. Subclasses inherit the metaclass automatically.",
      syntax: `class Meta(type):
    def __new__(mcs, name, bases, ns, **kwargs):
        # inspect / change ns here
        cls = super().__new__(mcs, name, bases, ns)
        return cls
`,
      tip: "\"Metaclasses are deeper magic than 99% of users should ever worry about.\" - Tim Peters. Reach for them only when simpler tools cannot do the job.",
    },
    {
      heading: "Metaclass __call__ and __prepare__",
      content: `Calling a class (\`User()\`) actually calls \`type(User).__call__(User, ...)\`, i.e. the metaclass's \`__call__\`. The default implementation calls \`cls.__new__\` then \`cls.__init__\`. Overriding \`__call__\` in a metaclass lets you control instance creation - for example to return a cached singleton instance, or to run validation after __init__.

\`__prepare__\` (a classmethod on the metaclass) returns the mapping used as the class namespace while the body executes. A custom mapping can detect duplicate method names or record definition order (ordering is automatic since dicts are ordered in 3.7+).`,
    },
    {
      heading: "__init_subclass__: The Simpler Alternative",
      content: `Most metaclasses in older code were written to run some logic every time a subclass is defined - registering plugins, validating attributes, or applying defaults. Python 3.6 (PEP 487) added \`__init_subclass__\`, a hook defined in the **base class** that runs whenever a subclass is created. It receives the new subclass as \`cls\` and can accept keyword arguments from the class line: \`class CsvExporter(Exporter, format="csv"):\`.

It is implicitly a classmethod, needs no metaclass, and avoids metaclass conflicts. Along with \`__set_name__\` (for descriptors), it covers most real-world needs.`,
      syntax: `class Plugin:
    registry = {}
    def __init_subclass__(cls, /, key=None, **kwargs):
        super().__init_subclass__(**kwargs)
        Plugin.registry[key or cls.__name__.lower()] = cls
`,
    },
    {
      heading: "Choosing the Right Tool",
      content: "From simplest to most powerful:",
      points: [
        "Class decorator - modify or register ONE class after it is created (e.g. @dataclass); not inherited by subclasses",
        "__set_name__ - let descriptors know their attribute names",
        "__init_subclass__ - run logic for every subclass of a base class (registries, validation)",
        "Metaclass - needed to change how the class object itself behaves (e.g. operators or __call__ on the class), control the namespace (__prepare__), or modify the class before it exists",
        "Real-world metaclasses: abc.ABCMeta, enum.EnumMeta (EnumType), Django ModelBase, SQLAlchemy's DeclarativeMeta",
        "Metaclass conflict: a class cannot inherit from two bases whose metaclasses are unrelated",
      ],
    },
  ],
  examples: [
    {
      title: "Classes are Objects; type Creates Them",
      scenario: "Explore the relationship between instances, classes and type, and create a class dynamically.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class User:
    role = "member"
    def greet(self):
        return f"Hi, I am a {self.role}"

u = User()
print(type(u), type(User), type(type), type(int))
print(isinstance(User, type), isinstance(User, object), isinstance(type, object))

registry = {"user": User}
cls = registry["user"]
print(cls().greet())
User.created_by = "admin"
print(User.created_by)

def greet(self):
    return f"Hi, I am an {self.role}"

Admin = type("Admin", (User,), {"role": "admin", "greet": greet, "level": 5})
a = Admin()
print(Admin.__name__, Admin.__bases__, Admin.__mro__[1:])
print(a.greet(), a.level, isinstance(a, User))

def make_model(name, **fields):
    return type(name, (), {**fields, "__repr__": lambda self: f"<{name} {fields}>"})

Product = make_model("Product", price=0, stock=0)
print(Product())
`,
      python: {
        files: {
          "main.py": `class User:
    role = "member"
    def greet(self):
        return f"Hi, I am a {self.role}"

u = User()
print(type(u), type(User), type(type), type(int))
print(isinstance(User, type), isinstance(User, object), isinstance(type, object))

registry = {"user": User}
cls = registry["user"]
print(cls().greet())
User.created_by = "admin"
print(User.created_by)

def greet(self):
    return f"Hi, I am an {self.role}"

Admin = type("Admin", (User,), {"role": "admin", "greet": greet, "level": 5})
a = Admin()
print(Admin.__name__, Admin.__bases__, Admin.__mro__[1:])
print(a.greet(), a.level, isinstance(a, User))

def make_model(name, **fields):
    return type(name, (), {**fields, "__repr__": lambda self: f"<{name} {fields}>"})

Product = make_model("Product", price=0, stock=0)
print(Product())
`,
        },
      },
      result: `<class '__main__.User'> <class 'type'> <class 'type'> <class 'type'>
True True True
Hi, I am a member
admin
Admin (<class '__main__.User'>,) (<class '__main__.User'>, <class 'object'>)
Hi, I am an admin 5 True
<Product {'price': 0, 'stock': 0}>`,
      explanation: "User is an instance of type, and type is an instance of itself. Classes can be stored in dicts and modified at runtime. type(name, bases, namespace) builds a class exactly like the class statement - useful for factories that generate classes from configuration.",
    },
    {
      title: "A Validating and Registering Metaclass",
      scenario: "An API framework requires every endpoint class to define a `path` starting with '/' and a `handle` method, and wants an automatic registry of endpoints.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class EndpointMeta(type):
    registry = {}

    def __new__(mcs, name, bases, ns):
        if bases:
            path = ns.get("path")
            if not isinstance(path, str) or not path.startswith("/"):
                raise TypeError(f"{name}.path must be a string starting with '/'")
            if not callable(ns.get("handle")):
                raise TypeError(f"{name} must define handle()")
            ns["name"] = name.lower()
        cls = super().__new__(mcs, name, bases, ns)
        if bases:
            mcs.registry[cls.path] = cls
        print(f"[meta] created {name}")
        return cls

class Endpoint(metaclass=EndpointMeta):
    pass

class Health(Endpoint):
    path = "/health"
    def handle(self):
        return {"status": "ok"}

class Orders(Endpoint):
    path = "/orders"
    def handle(self):
        return ["#1", "#2"]

try:
    class Broken(Endpoint):
        path = "orders"
        def handle(self):
            return None
except TypeError as e:
    print("TypeError:", e)

print(list(EndpointMeta.registry))
print(EndpointMeta.registry["/health"]().handle(), Orders.name)
print(type(Orders).__name__)
`,
      python: {
        files: {
          "main.py": `class EndpointMeta(type):
    registry = {}

    def __new__(mcs, name, bases, ns):
        if bases:
            path = ns.get("path")
            if not isinstance(path, str) or not path.startswith("/"):
                raise TypeError(f"{name}.path must be a string starting with '/'")
            if not callable(ns.get("handle")):
                raise TypeError(f"{name} must define handle()")
            ns["name"] = name.lower()
        cls = super().__new__(mcs, name, bases, ns)
        if bases:
            mcs.registry[cls.path] = cls
        print(f"[meta] created {name}")
        return cls

class Endpoint(metaclass=EndpointMeta):
    pass

class Health(Endpoint):
    path = "/health"
    def handle(self):
        return {"status": "ok"}

class Orders(Endpoint):
    path = "/orders"
    def handle(self):
        return ["#1", "#2"]

try:
    class Broken(Endpoint):
        path = "orders"
        def handle(self):
            return None
except TypeError as e:
    print("TypeError:", e)

print(list(EndpointMeta.registry))
print(EndpointMeta.registry["/health"]().handle(), Orders.name)
print(type(Orders).__name__)
`,
        },
      },
      result: `[meta] created Endpoint
[meta] created Health
[meta] created Orders
TypeError: Broken.path must be a string starting with '/'
['/health', '/orders']
{'status': 'ok'} orders
EndpointMeta`,
      explanation: "The metaclass's __new__ runs while each class is being defined, so invalid classes fail at import time rather than at request time. It also injects a 'name' attribute and registers each class by path. The base Endpoint (no bases) is skipped from validation. Subclasses automatically use EndpointMeta.",
    },
    {
      title: "Singleton via Metaclass __call__",
      scenario: "An application needs exactly one configuration object and one database pool, no matter how many times the classes are called.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            print(f"creating {cls.__name__}")
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self, env="dev"):
        self.env = env

class DbPool(metaclass=SingletonMeta):
    def __init__(self, size=5):
        self.size = size

c1 = Config("prod")
c2 = Config("test")
print(c1 is c2, c2.env)
p1, p2 = DbPool(10), DbPool()
print(p1 is p2, p2.size, c1 is p1)

class Traced(type):
    def __call__(cls, *args, **kwargs):
        print(f"  -> {cls.__name__}{args} : __new__ + __init__")
        obj = super().__call__(*args, **kwargs)
        print(f"  <- got {obj!r}")
        return obj

class Point(metaclass=Traced):
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

Point(1, 2)
`,
      python: {
        files: {
          "main.py": `class SingletonMeta(type):
    _instances = {}
    def __call__(cls, *args, **kwargs):
        if cls not in cls._instances:
            print(f"creating {cls.__name__}")
            cls._instances[cls] = super().__call__(*args, **kwargs)
        return cls._instances[cls]

class Config(metaclass=SingletonMeta):
    def __init__(self, env="dev"):
        self.env = env

class DbPool(metaclass=SingletonMeta):
    def __init__(self, size=5):
        self.size = size

c1 = Config("prod")
c2 = Config("test")
print(c1 is c2, c2.env)
p1, p2 = DbPool(10), DbPool()
print(p1 is p2, p2.size, c1 is p1)

class Traced(type):
    def __call__(cls, *args, **kwargs):
        print(f"  -> {cls.__name__}{args} : __new__ + __init__")
        obj = super().__call__(*args, **kwargs)
        print(f"  <- got {obj!r}")
        return obj

class Point(metaclass=Traced):
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"

Point(1, 2)
`,
        },
      },
      result: `creating Config
True prod
creating DbPool
True 10 False
  -> Point(1, 2) : __new__ + __init__
  <- got Point(1, 2)`,
      explanation: "Calling a class invokes the metaclass's __call__. SingletonMeta returns the cached instance after the first call, so the second Config('test') call does not even run __init__ (env stays 'prod'). Traced shows that type.__call__ is what runs __new__ and __init__. (In practice a module-level instance is often a simpler singleton.)",
    },
    {
      title: "Plugin Registry with __init_subclass__",
      scenario: "A reporting tool supports exporters (CSV, JSON, PDF). New exporters should register themselves just by subclassing, with an optional format keyword - no metaclass needed.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Exporter:
    registry = {}

    def __init_subclass__(cls, /, fmt=None, abstract=False, **kwargs):
        super().__init_subclass__(**kwargs)
        if abstract:
            return
        if not hasattr(cls, "export"):
            raise TypeError(f"{cls.__name__} must implement export()")
        key = fmt or cls.__name__.removesuffix("Exporter").lower()
        Exporter.registry[key] = cls
        print(f"registered {key!r} -> {cls.__name__}")

    @classmethod
    def for_format(cls, fmt):
        return cls.registry[fmt]()

class CsvExporter(Exporter):
    def export(self, rows):
        return "\\n".join(",".join(map(str, r)) for r in rows)

class JsonExporter(Exporter, fmt="json"):
    def export(self, rows):
        import json
        return json.dumps(rows)

class TextBase(Exporter, abstract=True):
    sep = " | "

class PipeExporter(TextBase, fmt="pipe"):
    def export(self, rows):
        return "\\n".join(self.sep.join(map(str, r)) for r in rows)

try:
    class PdfExporter(Exporter):
        pass
except TypeError as e:
    print("TypeError:", e)

rows = [("Asha", 90), ("Ravi", 85)]
for fmt in ["csv", "json", "pipe"]:
    print(f"--- {fmt}")
    print(Exporter.for_format(fmt).export(rows))
print(sorted(Exporter.registry))
`,
      python: {
        files: {
          "main.py": `class Exporter:
    registry = {}

    def __init_subclass__(cls, /, fmt=None, abstract=False, **kwargs):
        super().__init_subclass__(**kwargs)
        if abstract:
            return
        if not hasattr(cls, "export"):
            raise TypeError(f"{cls.__name__} must implement export()")
        key = fmt or cls.__name__.removesuffix("Exporter").lower()
        Exporter.registry[key] = cls
        print(f"registered {key!r} -> {cls.__name__}")

    @classmethod
    def for_format(cls, fmt):
        return cls.registry[fmt]()

class CsvExporter(Exporter):
    def export(self, rows):
        return "\\n".join(",".join(map(str, r)) for r in rows)

class JsonExporter(Exporter, fmt="json"):
    def export(self, rows):
        import json
        return json.dumps(rows)

class TextBase(Exporter, abstract=True):
    sep = " | "

class PipeExporter(TextBase, fmt="pipe"):
    def export(self, rows):
        return "\\n".join(self.sep.join(map(str, r)) for r in rows)

try:
    class PdfExporter(Exporter):
        pass
except TypeError as e:
    print("TypeError:", e)

rows = [("Asha", 90), ("Ravi", 85)]
for fmt in ["csv", "json", "pipe"]:
    print(f"--- {fmt}")
    print(Exporter.for_format(fmt).export(rows))
print(sorted(Exporter.registry))
`,
        },
      },
      result: `registered 'csv' -> CsvExporter
registered 'json' -> JsonExporter
registered 'pipe' -> PipeExporter
TypeError: PdfExporter must implement export()
--- csv
Asha,90
Ravi,85
--- json
[["Asha", 90], ["Ravi", 85]]
--- pipe
Asha | 90
Ravi | 85
['csv', 'json', 'pipe']`,
      explanation: "__init_subclass__ runs automatically for each subclass. Keyword arguments on the class line (fmt='json', abstract=True) are passed to it. It validates and registers classes like the metaclass example, but with plain inheritance - simpler and with no metaclass conflicts.",
    },
    {
      title: "__prepare__ and Class Decorators",
      scenario: "Catch accidental duplicate method definitions (a common copy-paste bug) with __prepare__, and compare with a class decorator that adds behaviour to one class.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `class NoDuplicatesDict(dict):
    def __setitem__(self, key, value):
        if key in self and not key.startswith("__"):
            raise TypeError(f"duplicate definition of {key!r}")
        super().__setitem__(key, value)

class StrictMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases):
        return NoDuplicatesDict()
    def __new__(mcs, name, bases, ns):
        return super().__new__(mcs, name, bases, dict(ns))

try:
    class Service(metaclass=StrictMeta):
        def save(self):
            return "v1"
        def load(self):
            return "load"
        def save(self):
            return "v2"
except TypeError as e:
    print("TypeError:", e)

class Normal:
    def save(self):
        return "v1"
    def save(self):
        return "v2"
print("Normal class silently keeps:", Normal().save())

def add_repr(cls):
    def __repr__(self):
        fields = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{cls.__name__}({fields})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Order:
    def __init__(self, oid, amount):
        self.oid, self.amount = oid, amount

class SpecialOrder(Order):
    pass

print(Order(1, 499.0), SpecialOrder(2, 99))
print(type(Order).__name__)
`,
      python: {
        files: {
          "main.py": `class NoDuplicatesDict(dict):
    def __setitem__(self, key, value):
        if key in self and not key.startswith("__"):
            raise TypeError(f"duplicate definition of {key!r}")
        super().__setitem__(key, value)

class StrictMeta(type):
    @classmethod
    def __prepare__(mcs, name, bases):
        return NoDuplicatesDict()
    def __new__(mcs, name, bases, ns):
        return super().__new__(mcs, name, bases, dict(ns))

try:
    class Service(metaclass=StrictMeta):
        def save(self):
            return "v1"
        def load(self):
            return "load"
        def save(self):
            return "v2"
except TypeError as e:
    print("TypeError:", e)

class Normal:
    def save(self):
        return "v1"
    def save(self):
        return "v2"
print("Normal class silently keeps:", Normal().save())

def add_repr(cls):
    def __repr__(self):
        fields = ", ".join(f"{k}={v!r}" for k, v in vars(self).items())
        return f"{cls.__name__}({fields})"
    cls.__repr__ = __repr__
    return cls

@add_repr
class Order:
    def __init__(self, oid, amount):
        self.oid, self.amount = oid, amount

class SpecialOrder(Order):
    pass

print(Order(1, 499.0), SpecialOrder(2, 99))
print(type(Order).__name__)
`,
        },
      },
      result: `TypeError: duplicate definition of 'save'
Normal class silently keeps: v2
Order(oid=1, amount=499.0) Order(oid=2, amount=99)
type`,
      explanation: "__prepare__ supplies a custom namespace dict that raises on duplicate names while the class body runs. Normally the second save silently overwrites the first. The class decorator modifies the class after creation; the added __repr__ is inherited by SpecialOrder (it even prints the name Order, because the closure captured cls), but the decorator itself does not re-run for subclasses - use type(self).__name__ to fix that. Order's metaclass is still plain type.",
    },
  ],
  interview: [
    {
      q: "What is a metaclass?",
      a: "A metaclass is the class of a class: it defines how classes are created and behave. The default metaclass is type. A custom metaclass subclasses type and overrides __new__, __init__, __call__ or __prepare__ to customise class creation or instantiation.",
      level: "Medium",
    },
    {
      q: "What is type(type)?",
      a: "type. type is an instance of itself - the root of the metaclass hierarchy. Meanwhile type is a subclass of object, and object is an instance of type.",
      level: "Medium",
    },
    {
      q: "How do you create a class dynamically?",
      a: "Call type with three arguments: `type('Name', (Base,), {'attr': 1, 'method': func})`. It returns a new class object equivalent to a class statement. types.new_class can be used when a metaclass with __prepare__ is involved.",
      level: "Medium",
    },
    {
      q: "What steps happen when Python executes a class statement?",
      a: "Resolve the metaclass; call __prepare__ to get the namespace; execute the body in it; call metaclass(name, bases, ns) which runs __new__ and __init__; during type.__new__, __set_name__ is called on attributes and __init_subclass__ on the parent; then decorators are applied and the name is bound.",
      level: "Hard",
    },
    {
      q: "What is the difference between __new__ and __init__ in a metaclass?",
      a: "__new__ creates and returns the class object - you can modify the namespace, bases or name before creation. __init__ receives the already-created class and can initialise or register it. Most customisation that changes the class body is done in __new__.",
      level: "Hard",
    },
    {
      q: "How does a metaclass's __call__ relate to creating instances?",
      a: "`MyClass(...)` calls `type(MyClass).__call__(MyClass, ...)`. type.__call__ runs MyClass.__new__ and then __init__. Overriding __call__ in a metaclass can cache instances (singleton), count instances or post-validate objects.",
      level: "Hard",
    },
    {
      q: "What is __init_subclass__ and why is it preferred over metaclasses?",
      a: "A hook (PEP 487, Python 3.6) defined in a base class that runs whenever a subclass is created, receiving the subclass and any class keyword arguments. It handles registration and validation without a metaclass, is easier to read, and avoids metaclass conflicts in multiple inheritance.",
      level: "Medium",
    },
    {
      q: "What is a metaclass conflict?",
      a: "When a class inherits from bases with different metaclasses, Python needs one metaclass that is a subclass of all of them. If none exists, it raises `TypeError: metaclass conflict`. Fix it by creating a combined metaclass that inherits from both.",
      level: "Hard",
    },
    {
      q: "Give real-world examples of metaclasses.",
      a: "abc.ABCMeta (enforcing abstract methods), enum.EnumMeta/EnumType (making class attributes enum members, iteration over the class), Django's ModelBase (turning field declarations into model metadata), SQLAlchemy's declarative base, and some ORMs/serializers.",
      level: "Medium",
    },
    {
      q: "How can you implement a singleton in Python?",
      a: "Options: a module-level instance (simplest and most Pythonic), a metaclass overriding __call__ to cache instances, overriding __new__ to return a stored instance, or a decorator. Note that with __new__-based singletons __init__ still runs on every call.",
      level: "Medium",
    },
    {
      q: "Class decorator vs metaclass?",
      a: "A class decorator receives the finished class and can modify or replace it, applied to one class only (not automatically to subclasses). A metaclass controls creation of the class and all its subclasses, and can affect class-level behaviour (operators on the class, __call__). Prefer decorators/__init_subclass__ when possible.",
      level: "Medium",
    },
    {
      q: "What does __prepare__ do?",
      a: "It is a metaclass classmethod called before the class body runs; it returns the mapping used as the namespace. A custom mapping can enforce rules (no duplicate names), record order, or provide pre-defined names to the class body (enum uses it to track member definitions).",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Use type() to create a class `Car` with attributes wheels=4 and a method describe(self) returning 'Car with 4 wheels'. Then create `ElectricCar` inheriting from Car with battery=75 using type() again.",
      hint: "type('Car', (), {'wheels': 4, 'describe': describe})",
      solution: `def describe(self):
    return f"{type(self).__name__} with {self.wheels} wheels"

Car = type("Car", (), {"wheels": 4, "describe": describe})
ElectricCar = type("ElectricCar", (Car,), {"battery": 75})
e = ElectricCar()
print(Car().describe(), "|", e.describe(), e.battery, isinstance(e, Car))
`,
    },
    {
      task: "Write a metaclass `UpperAttrsMeta` that converts all non-dunder class attribute names to UPPER CASE. Show that `class Settings(metaclass=UpperAttrsMeta): debug = True` gives Settings.DEBUG.",
      hint: "Build a new dict in __new__: {k if k.startswith('__') else k.upper(): v}",
      solution: `class UpperAttrsMeta(type):
    def __new__(mcs, name, bases, ns):
        new_ns = {k if k.startswith("__") else k.upper(): v for k, v in ns.items()}
        return super().__new__(mcs, name, bases, new_ns)

class Settings(metaclass=UpperAttrsMeta):
    debug = True
    timeout = 30

print(Settings.DEBUG, Settings.TIMEOUT, hasattr(Settings, "debug"))
`,
    },
    {
      task: "Using __init_subclass__, make a base class `Command` that requires every subclass to define a non-empty `name` class attribute, and stores all commands in Command.commands. Create two commands and show the error for a third without a name.",
      hint: "if not getattr(cls, 'name', None): raise TypeError(...)",
      solution: `class Command:
    commands = {}
    def __init_subclass__(cls, **kwargs):
        super().__init_subclass__(**kwargs)
        if not getattr(cls, "name", None):
            raise TypeError(f"{cls.__name__} needs a name")
        Command.commands[cls.name] = cls

class Start(Command):
    name = "start"

class Stop(Command):
    name = "stop"

try:
    class Nameless(Command):
        pass
except TypeError as e:
    print("Error:", e)
print(sorted(Command.commands))
`,
    },
    {
      task: "Write a metaclass `CountInstances` that counts how many objects each class creates (override __call__), and print the counts after creating 3 Users and 1 Order.",
      hint: "Keep a counter attribute on cls: cls._count = getattr(cls, '_count', 0) + 1",
      solution: `class CountInstances(type):
    def __call__(cls, *args, **kwargs):
        cls._count = getattr(cls, "_count", 0) + 1
        return super().__call__(*args, **kwargs)

class User(metaclass=CountInstances):
    pass

class Order(metaclass=CountInstances):
    pass

for _ in range(3):
    User()
Order()
print("Users:", User._count, "Orders:", Order._count)
`,
    },
  ],
  quiz: [
    {
      question: "What is type(int)?",
      options: [
        "int",
        "object",
        "type",
        "class",
      ],
      answer: 2,
      explanation: "Built-in and user classes are instances of the metaclass type.",
    },
    {
      question: "type('A', (), {'x': 1}) returns...",
      options: [
        "An instance of A",
        "A new class named A",
        "The string 'A'",
        "TypeError",
      ],
      answer: 1,
      explanation: "The three-argument form of type creates a new class.",
    },
    {
      question: "Which method of a metaclass runs when you call MyClass()?",
      options: [
        "__new__",
        "__init__",
        "__call__",
        "__prepare__",
      ],
      answer: 2,
      explanation: "Calling a class invokes the metaclass's __call__, which then runs __new__ and __init__ of the class.",
    },
    {
      question: "__init_subclass__ is defined in...",
      options: [
        "The metaclass",
        "The base class",
        "Each subclass",
        "The module",
      ],
      answer: 1,
      explanation: "It is defined in the parent and runs for each new subclass.",
    },
    {
      question: "A custom metaclass must inherit from...",
      options: [
        "object",
        "type",
        "ABC",
        "metaclass",
      ],
      answer: 1,
      explanation: "Metaclasses are subclasses of type.",
    },
    {
      question: "Which is usually the simplest way to auto-register plugin subclasses?",
      options: [
        "A metaclass",
        "__init_subclass__",
        "Monkey patching",
        "exec()",
      ],
      answer: 1,
      explanation: "__init_subclass__ handles subclass registration without metaclass complexity.",
    },
  ],
};
