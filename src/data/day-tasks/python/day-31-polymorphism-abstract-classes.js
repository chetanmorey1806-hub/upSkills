export default {
  lesson: 'day-31-polymorphism-abstract-classes',
  minutes: 30,
  intro: 'Use polymorphism, duck typing and abstract base classes (abc) so one piece of code works with many types.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Polymorphism and duck typing. What is printed?',
      code: `class Dog:
    def speak(self):
        return "Woof"
class Cat:
    def speak(self):
        return "Meow"
class Robot:
    def speak(self):
        return "Beep"

for thing in [Dog(), Cat(), Robot()]:
    print(thing.speak())
print(len("abc"), len([1, 2]), len({"a": 1}))`,
      expected: 'Woof\nMeow\nBeep\n3 2 1',
      explain: 'The loop calls `speak()` without checking types: any object that has the method works (**duck typing**: "if it quacks like a duck..."). Built-ins like `len()` are polymorphic too: they work on strings, lists and dicts.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Python has two methods `def area(self, r)` and later `def area(self, l, w)` in the same class. What happens?',
      options: [
        'Python picks the right one by number of arguments (overloading)',
        'The second definition replaces the first; only area(self, l, w) exists',
        'SyntaxError',
        'Both are merged automatically',
      ],
      answer: 1,
      explain: 'Python does not support classic method overloading: a later `def` with the same name simply **replaces** the earlier one. Use default arguments, `*args` or `functools.singledispatch` instead.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: 'Abstract base class. Create:\n- `Shape(ABC)` with an **abstract** method `area()`\n- `Circle(r)` → area = 3.14 × r × r (round 2)\n- `Rectangle(w, h)` → area = w × h\n- function `total_area(shapes)` → sum of all areas rounded to 2\n\n`Shape()` itself must not be creatable.',
      example: { title: 'abc in a nutshell', code: 'from abc import ABC, abstractmethod\n\nclass Payment(ABC):\n    @abstractmethod\n    def pay(self, amount):\n        ...\n\nclass UPI(Payment):\n    def pay(self, amount):\n        return f"Paid {amount} via UPI"' },
      starter: `from abc import ABC, abstractmethod

class Shape:
    pass  # TODO

class Circle:
    pass  # TODO

class Rectangle:
    pass  # TODO

def total_area(shapes):
    pass  # TODO
`,
      solution: `from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self):
        ...

class Circle(Shape):
    def __init__(self, r):
        self.r = r

    def area(self):
        return round(3.14 * self.r * self.r, 2)

class Rectangle(Shape):
    def __init__(self, w, h):
        self.w = w
        self.h = h

    def area(self):
        return self.w * self.h

def total_area(shapes):
    return round(sum(s.area() for s in shapes), 2)
`,
      tests: [
        { call: 'Circle(2).area()', expect: 12.56 },
        { call: 'Rectangle(3, 4).area()', expect: 12 },
        { call: 'total_area([Circle(1), Rectangle(2, 5)])', expect: 13.14 },
        { call: `exec("try:\\n    Shape()\\n    _r = 'created'\\nexcept TypeError:\\n    _r = 'TypeError'") or _r`, expect: 'TypeError', msg: 'Shape() must raise TypeError (inherit from ABC and mark area with @abstractmethod)' },
        { call: 'issubclass(Circle, Shape) and issubclass(Rectangle, Shape)', expect: true, msg: 'Circle and Rectangle must inherit from Shape' },
      ],
      explain: 'An ABC with an `@abstractmethod` cannot be instantiated, and any subclass that forgets to implement `area` cannot be either: the error appears early instead of at runtime. `total_area` is polymorphic: it just calls `s.area()`.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Duck typing. Write `notify_all(channels, msg)` that calls `send(msg)` on every object that **has** a `send` method and returns the list of results; objects without `send` are skipped (use `hasattr`). Also write two classes `Email` and `SMS` whose `send(msg)` return `"Email: <msg>"` and `"SMS: <msg>"`.',
      example: { title: 'checking behaviour, not type', code: 'for x in [[1, 2], 5]:\n    if hasattr(x, "append"):\n        x.append(0)' },
      starter: `class Email:
    pass  # TODO

class SMS:
    pass  # TODO

def notify_all(channels, msg):
    return []  # TODO
`,
      solution: `class Email:
    def send(self, msg):
        return f"Email: {msg}"

class SMS:
    def send(self, msg):
        return f"SMS: {msg}"

def notify_all(channels, msg):
    return [c.send(msg) for c in channels if hasattr(c, "send")]
`,
      tests: [
        { call: 'notify_all([Email(), SMS(), 42], "Fee due")', expect: ['Email: Fee due', 'SMS: Fee due'] },
        { call: 'notify_all([type("WhatsApp", (), {"send": lambda self, m: "WA: " + m})()], "Hi")', expect: ['WA: Hi'], msg: 'any object with send() must work, even an unrelated class' },
      ],
      explain: 'Duck typing checks **behaviour**: the function does not care whether the object is an Email; it only needs `send`. Checking `isinstance(c, Email)` would reject new channels like WhatsApp that were never related to Email.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 4,
      q: '"Overloading" the Python way. Write `area(a, b=None)`: with one argument return the area of a **square** (a × a); with two, a **rectangle** (a × b).',
      example: { title: 'default argument instead of overloading', code: 'def greet(name, title=None):\n    if title is None:\n        return "Hi " + name\n    return f"Hi {title} {name}"' },
      starter: `def area(a, b=None):
    # TODO
    pass
`,
      solution: `def area(a, b=None):
    if b is None:
        return a * a
    return a * b
`,
      tests: [
        { call: 'area(5)', expect: 25 },
        { call: 'area(4, 6)', expect: 24 },
        { call: 'area(3, 0)', expect: 0, msg: 'area(3, 0) must be 0 (check b is None, not just "if b")' },
      ],
      explain: 'Use `b is None` rather than `if not b`: 0 is a valid width but is falsy, so `if not b` would wrongly treat `area(3, 0)` as a square.',
    },
  ],
};
