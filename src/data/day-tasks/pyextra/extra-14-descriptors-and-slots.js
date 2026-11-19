export default {
  lesson: 'extra-14-descriptors-and-slots',
  minutes: 30,
  intro: 'Understand the descriptor protocol (__get__, __set__, __set_name__), build validated fields, and use __slots__ to save memory.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What makes a descriptor a **data descriptor**?',
      options: ['It defines only `__get__`', 'It defines `__set__` and/or `__delete__`', 'It is stored in the instance `__dict__`', 'It inherits from `property`'],
      answer: 1,
      explain: 'A data descriptor defines `__set__` or `__delete__` and takes priority over the instance `__dict__`. A non-data descriptor (only `__get__`, like plain functions) can be shadowed by an instance attribute with the same name.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about `__slots__` are TRUE? (choose all that apply)',
      options: ['Instances have no `__dict__`, so you cannot add new attributes', 'It can reduce memory when you create millions of objects', 'A subclass automatically inherits the "no `__dict__`" behaviour without declaring `__slots__`', '`weakref.ref(obj)` fails unless `"__weakref__"` is in the slots', 'Slots make attribute access much slower'],
      answers: [0, 1, 3],
      explain: 'Slots store attributes in a fixed array instead of a per-object dict, saving memory and making access slightly faster. A subclass that does not declare its own `__slots__` gets a `__dict__` again. Weak references need the `__weakref__` slot.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What is printed?',
      code: `class Loud:
    def __set_name__(self, owner, name):
        self.name = name
    def __get__(self, obj, objtype=None):
        if obj is None:
            return self
        return obj.__dict__[self.name].upper()
    def __set__(self, obj, value):
        obj.__dict__[self.name] = value

class User:
    city = Loud()
    def __init__(self, city):
        self.city = city

u = User("pune")
print(u.city)
print(u.__dict__)
print(type(User.city).__name__)`,
      expected: "PUNE\n{'city': 'pune'}\nLoud",
      explain: '`__set_name__` tells the descriptor its attribute name ("city"). Assigning `self.city` calls `__set__`, which stores the raw value in the instance dict. Reading calls `__get__` (the data descriptor wins over the instance dict) and upper-cases it. Accessing on the class passes `obj=None`, so it returns the descriptor itself.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: 'Write a reusable descriptor `Positive` that only allows numbers greater than 0. Use `__set_name__` to remember the attribute name, store values in the instance `__dict__`, and raise `ValueError(f"{name} must be > 0")` for bad values. Use it in class `Product` for `price` and `qty` (the class is given). Also write `try_set(p, attr, value)` that sets the attribute and returns `"ok"`, or returns the error message if a ValueError happens.',
      example: { title: 'a descriptor skeleton', code: 'class Upper:\n    def __set_name__(self, owner, name):\n        self.name = name\n    def __get__(self, obj, objtype=None):\n        return self if obj is None else obj.__dict__[self.name]\n    def __set__(self, obj, value):\n        obj.__dict__[self.name] = value.upper()' },
      starter: 'class Positive:\n    # TODO\n    pass\n\nclass Product:\n    price = Positive()\n    qty = Positive()\n    def __init__(self, price, qty):\n        self.price = price\n        self.qty = qty\n\ndef try_set(p, attr, value):\n    # TODO\n    return "ok"\n',
      solution: 'class Positive:\n    def __set_name__(self, owner, name):\n        self.name = name\n    def __get__(self, obj, objtype=None):\n        if obj is None:\n            return self\n        return obj.__dict__[self.name]\n    def __set__(self, obj, value):\n        if not isinstance(value, (int, float)) or value <= 0:\n            raise ValueError(f"{self.name} must be > 0")\n        obj.__dict__[self.name] = value\n\nclass Product:\n    price = Positive()\n    qty = Positive()\n    def __init__(self, price, qty):\n        self.price = price\n        self.qty = qty\n\ndef try_set(p, attr, value):\n    try:\n        setattr(p, attr, value)\n        return "ok"\n    except ValueError as e:\n        return str(e)\n',
      tests: [
        { call: '(lambda p: (p.price, p.qty))(Product(99.5, 3))', expect: [99.5, 3] },
        { call: 'try_set(Product(10, 1), "price", -5)', expect: 'price must be > 0' },
        { call: 'try_set(Product(10, 1), "qty", 0)', expect: 'qty must be > 0' },
        { call: 'try_set(Product(10, 1), "qty", 7)', expect: 'ok' },
        { call: '(lambda a, b: (a.price, b.price))(Product(5, 1), Product(8, 1))', expect: [5, 8], msg: 'Each instance must keep its own value (store in obj.__dict__, not on the descriptor)' },
      ],
      explain: 'One descriptor object is shared by ALL instances, so values must be stored per instance (in `obj.__dict__`), not in `self.value` on the descriptor; otherwise every product would share one price. `__set_name__` avoids repeating the name like `Positive("price")`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write a class `Pixel` with `__slots__ = ("x", "y", "color")` and an `__init__(x, y, color)`. Then write `can_add_attr()` that creates a Pixel, tries to set `p.alpha = 0.5` and returns `False` if an `AttributeError` is raised (True otherwise).',
      example: { title: '__slots__', code: 'class Point:\n    __slots__ = ("x", "y")\n    def __init__(self, x, y):\n        self.x, self.y = x, y' },
      starter: 'class Pixel:\n    def __init__(self, x, y, color):\n        self.x = x\n        self.y = y\n        self.color = color\n\ndef can_add_attr():\n    # TODO\n    return True\n',
      solution: 'class Pixel:\n    __slots__ = ("x", "y", "color")\n    def __init__(self, x, y, color):\n        self.x = x\n        self.y = y\n        self.color = color\n\ndef can_add_attr():\n    p = Pixel(0, 0, "red")\n    try:\n        p.alpha = 0.5\n        return True\n    except AttributeError:\n        return False\n',
      tests: [
        { call: 'can_add_attr()', expect: false },
        { call: 'hasattr(Pixel(1, 2, "blue"), "__dict__")', expect: false, msg: 'Pixel instances must not have a __dict__' },
        { call: 'Pixel(1, 2, "blue").color', expect: 'blue' },
      ],
      explain: 'With `__slots__`, only the listed attribute names exist, so a typo like `p.colour = ...` fails loudly instead of silently creating a new attribute. That safety plus lower memory use is why slots suit classes with many instances.',
    },
  ],
};
