export default {
  lesson: 'extra-15-metaclasses-class-creation',
  minutes: 30,
  intro: 'See classes as objects: create classes with type(), write simple metaclasses, and prefer __init_subclass__ for registries and validation.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `class User:
    pass

print(type(User()).__name__)
print(type(User).__name__)
print(type(type).__name__)
print(isinstance(User, type))`,
      expected: 'User\ntype\ntype\nTrue',
      explain: 'An instance is created by its class, and a class is created by its **metaclass**, which is `type` by default. `type` is even its own type. So classes are objects too: they are instances of `type`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You want every subclass of `Plugin` to be automatically added to a registry dict. What is the simplest modern tool?',
      options: ['A custom metaclass with `__new__`', '`__init_subclass__` in the base class', 'A `@property`', 'Overriding `__getattr__`'],
      answer: 1,
      explain: '`__init_subclass__` (Python 3.6+) runs for every new subclass and covers most registry/validation needs without a metaclass. Metaclasses are more powerful but harder to read and can conflict when combining base classes.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Without using the `class` statement, create a class with `type(name, bases, namespace)`. Write `make_model(name, fields)` that returns a NEW class called `name` whose namespace has the attribute `fields` (the given tuple) and a method `describe(self)` returning `f"{name} with {len(fields)} fields"`.',
      example: { title: 'type() with three arguments', code: 'Dog = type("Dog", (), {"sound": "woof", "speak": lambda self: self.sound})\nDog().speak()   # "woof"' },
      starter: 'def make_model(name, fields):\n    # TODO: return type(...)\n    return None\n',
      solution: 'def make_model(name, fields):\n    def describe(self):\n        return f"{name} with {len(fields)} fields"\n    return type(name, (), {"fields": fields, "describe": describe})\n',
      tests: [
        { call: 'make_model("Student", ("name", "roll")).__name__', expect: 'Student' },
        { call: 'make_model("Student", ("name", "roll"))().describe()', expect: 'Student with 2 fields' },
        { call: 'make_model("Book", ("title",)).fields', expect: ['title'] },
      ],
      explain: 'The `class` statement is just a nicer way of calling `type(name, bases, namespace)`. Frameworks use this to build classes dynamically (for example models from a config or database schema).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Write a base class `Plugin` that uses `__init_subclass__(cls, key=None, **kwargs)` to register every subclass in the class-level dict `Plugin.registry` under `key` (use the lower-case class name if no key is given). Also write `create(key)` that returns a new instance of the registered class.',
      example: { title: '__init_subclass__ with a keyword', code: 'class Base:\n    def __init_subclass__(cls, tag="", **kwargs):\n        super().__init_subclass__(**kwargs)\n        cls.tag = tag\n\nclass A(Base, tag="alpha"): ...\nA.tag  # "alpha"' },
      starter: 'class Plugin:\n    registry = {}\n    # TODO: __init_subclass__\n\ndef create(key):\n    return None\n\nclass CsvExport(Plugin, key="csv"):\n    pass\n\nclass PdfExport(Plugin):\n    pass\n',
      solution: 'class Plugin:\n    registry = {}\n\n    def __init_subclass__(cls, key=None, **kwargs):\n        super().__init_subclass__(**kwargs)\n        Plugin.registry[key or cls.__name__.lower()] = cls\n\ndef create(key):\n    return Plugin.registry[key]()\n\nclass CsvExport(Plugin, key="csv"):\n    pass\n\nclass PdfExport(Plugin):\n    pass\n',
      tests: [
        { call: 'sorted(Plugin.registry)', expect: ['csv', 'pdfexport'] },
        { call: 'type(create("csv")).__name__', expect: 'CsvExport' },
        { call: '(type("ExcelExport", (Plugin,), {}), sorted(Plugin.registry))[1]', expect: ['csv', 'excelexport', 'pdfexport'], msg: 'New subclasses register automatically' },
      ],
      explain: 'Keyword arguments in the class line (`key="csv"`) are passed to `__init_subclass__`. Call `super().__init_subclass__(**kwargs)` so other base classes keep working. The base class itself is not registered because the hook runs only for subclasses.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write a metaclass `Singleton(type)` that overrides `__call__` so a class using it creates only ONE instance; later calls return the same object. Use it for `class Config(metaclass=Singleton)` whose `__init__` sets `self.loaded = True`.',
      example: { title: 'metaclass __call__', code: 'class Counted(type):\n    def __call__(cls, *args, **kwargs):\n        cls.made = getattr(cls, "made", 0) + 1\n        return super().__call__(*args, **kwargs)' },
      starter: 'class Singleton(type):\n    pass  # TODO\n\nclass Config(metaclass=Singleton):\n    def __init__(self):\n        self.loaded = True\n',
      solution: 'class Singleton(type):\n    _instances = {}\n    def __call__(cls, *args, **kwargs):\n        if cls not in Singleton._instances:\n            Singleton._instances[cls] = super().__call__(*args, **kwargs)\n        return Singleton._instances[cls]\n\nclass Config(metaclass=Singleton):\n    def __init__(self):\n        self.loaded = True\n',
      tests: [
        { call: 'Config() is Config()', expect: true },
        { call: 'Config().loaded', expect: true },
        { call: '(lambda C: C() is C() and C() is not Config())(Singleton("Cache", (), {}))', expect: true, msg: 'Each class using the metaclass gets its own single instance' },
      ],
      explain: '`Config()` calls `type(Config).__call__`, i.e. the metaclass `__call__`, which normally runs `__new__` and `__init__`. Storing instances per class lets several classes share the metaclass. In everyday code a module-level object is often a simpler "singleton".',
    },
  ],
};
