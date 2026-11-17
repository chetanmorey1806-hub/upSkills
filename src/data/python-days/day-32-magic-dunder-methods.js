export default {
  id: "day-32-magic-dunder-methods",
  title: "Magic / Dunder Methods: __str__, __repr__, __len__, __eq__, __add__, Operator Overloading",
  module: "Module 5: Object-Oriented Programming",
  day: 32,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Discover the special double-underscore (dunder) methods that let your own classes work with print(), len(), ==, +, <, [] and for loops, just like built-in types.",
  objectives: [
    "Explain what magic (dunder) methods are and who calls them",
    "Write __str__ and __repr__ and know the difference",
    "Implement __len__, __getitem__, __contains__ and __iter__ for container-like classes",
    "Overload operators with __add__, __sub__, __mul__, __eq__, __lt__",
    "Understand __eq__ and __hash__ rules and use functools.total_ordering",
  ],
  theory: [
    {
      heading: "What are Magic / Dunder Methods?",
      content: "Dunder means 'double underscore'. Methods like __init__, __str__ and __add__ are called magic methods because you rarely call them yourself; Python calls them automatically when you use built-in syntax. When you write a + b, Python actually runs a.__add__(b). When you write len(x), Python runs x.__len__(). Analogy: they are like hooks on a wall - Python already knows where to hang things; you just provide the hook.",
      points: [
        "print(obj) -> obj.__str__()",
        "len(obj) -> obj.__len__()",
        "a == b -> a.__eq__(b)",
        "a + b -> a.__add__(b)",
        "obj[i] -> obj.__getitem__(i)",
        "x in obj -> obj.__contains__(x)",
      ],
      tip: "Never invent your own dunder names like __myname__; they are reserved for Python.",
    },
    {
      heading: "__str__ vs __repr__",
      content: "__str__ returns a friendly, readable string for end users; it is used by print() and str(). __repr__ returns an unambiguous developer string, ideally one that looks like the code to recreate the object, e.g. Point(2, 3). It is used in the interactive shell, inside lists, and by repr(). If __str__ is missing, Python falls back to __repr__.",
      syntax: `class Point:
    def __init__(self, x, y):
        self.x, self.y = x, y
    def __repr__(self):
        return f"Point({self.x}, {self.y})"
    def __str__(self):
        return f"({self.x}, {self.y})"
`,
      points: [
        "print([p1, p2]) uses __repr__ of each element",
        "f'{obj!r}' forces repr inside an f-string",
      ],
    },
    {
      heading: "Container Methods: __len__, __getitem__, __contains__, __iter__",
      content: "You can make your class behave like a list or dict. __len__ makes len() work. __getitem__ makes indexing and slicing work (and also makes the object iterable as a fallback). __contains__ makes the in operator fast. __iter__ returns an iterator for for-loops. __setitem__ and __delitem__ support assignment and deletion.",
      syntax: `class Playlist:
    def __init__(self, songs): self.songs = list(songs)
    def __len__(self): return len(self.songs)
    def __getitem__(self, i): return self.songs[i]
    def __contains__(self, s): return s in self.songs
`,
    },
    {
      heading: "Operator Overloading",
      content: "Operator overloading means giving operators like +, -, *, ==, < a meaning for your own class. Arithmetic: __add__, __sub__, __mul__, __truediv__. Comparison: __eq__, __ne__, __lt__, __le__, __gt__, __ge__. Reflected versions like __radd__ are called when the left operand does not know how to handle the right one (e.g. 5 + obj, or sum() starting with 0). Return NotImplemented (not raise) when you cannot handle the other type.",
      points: [
        "__iadd__ handles += (falls back to __add__ if missing)",
        "__bool__ decides truthiness in if obj:",
        "__call__ lets you call an object like a function: obj()",
        "functools.total_ordering fills in the other comparison methods from __eq__ and one of __lt__/__gt__",
      ],
    },
    {
      heading: "__eq__ and __hash__",
      content: "By default == compares identity (same object). Define __eq__ to compare values. Important rule: if you define __eq__ but not __hash__, Python sets __hash__ to None, so objects can no longer be put in sets or used as dict keys. If your object is immutable, define __hash__ using the same fields used in __eq__.",
      syntax: `def __eq__(self, other):
    if not isinstance(other, Point):
        return NotImplemented
    return (self.x, self.y) == (other.x, other.y)

def __hash__(self):
    return hash((self.x, self.y))
`,
      tip: "Equal objects must have equal hashes. Never base __hash__ on fields that can change.",
    },
    {
      heading: "Common Mistakes",
      content: "Returning something other than a string from __str__ raises TypeError. Returning a non-integer from __len__ fails. Modifying self inside __add__ instead of returning a new object causes surprising bugs. Forgetting __radd__ makes sum(list_of_objects) fail because sum starts with 0 + first_object.",
      points: [
        "__str__/__repr__ must return str",
        "__len__ must return a non-negative int",
        "__add__ should return a NEW object",
        "Return NotImplemented for unsupported types",
      ],
    },
  ],
  examples: [
    {
      title: "__str__ and __repr__ for a Product",
      scenario: "An inventory app should print products nicely for users but show precise details for developers.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"

    def __repr__(self):
        return f"Product({self.name!r}, {self.price})"

class Plain:
    pass

p = Product("Pen", 20)
print(p)                 # uses __str__
print(str(p))
print(repr(p))           # uses __repr__
print([p, Product("Book", 150)])   # list shows __repr__
print(f"{p} | {p!r}")
print(str(Plain()).startswith("<__main__.Plain object at"))
`,
      python: {
        files: {
          "main.py": `class Product:
    def __init__(self, name, price):
        self.name = name
        self.price = price

    def __str__(self):
        return f"{self.name} - Rs.{self.price}"

    def __repr__(self):
        return f"Product({self.name!r}, {self.price})"

class Plain:
    pass

p = Product("Pen", 20)
print(p)                 # uses __str__
print(str(p))
print(repr(p))           # uses __repr__
print([p, Product("Book", 150)])   # list shows __repr__
print(f"{p} | {p!r}")
print(str(Plain()).startswith("<__main__.Plain object at"))
`,
        },
      },
      result: `Pen - Rs.20
Pen - Rs.20
Product('Pen', 20)
[Product('Pen', 20), Product('Book', 150)]
Pen - Rs.20 | Product('Pen', 20)
True`,
      explanation: "print() and str() call __str__. repr() and containers like lists call __repr__. !r inside an f-string forces __repr__. A class without these methods prints the default <__main__.Plain object at 0x...> text, which is why we only check its start.",
    },
    {
      title: "Vector Class with Operator Overloading",
      scenario: "A 2D game needs to add, subtract and scale movement vectors using natural math symbols.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

    def __radd__(self, other):          # supports sum() which starts at 0
        if other == 0:
            return self
        return self.__add__(other)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, k):               # vector * number
        return Vector(self.x * k, self.y * k)

    __rmul__ = __mul__                   # number * vector

    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)

    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __bool__(self):
        return bool(self.x or self.y)

a, b = Vector(3, 4), Vector(1, 2)
print(a + b)
print(a - b)
print(a * 2, 3 * b)
print(abs(a))
print(a == Vector(3, 4), a == b)
print(sum([a, b, Vector(10, 10)]))
print(bool(Vector(0, 0)), bool(a))
try:
    a + 5
except TypeError as e:
    print("TypeError:", e)
`,
      python: {
        files: {
          "main.py": `class Vector:
    def __init__(self, x, y):
        self.x, self.y = x, y

    def __repr__(self):
        return f"Vector({self.x}, {self.y})"

    def __add__(self, other):
        if not isinstance(other, Vector):
            return NotImplemented
        return Vector(self.x + other.x, self.y + other.y)

    def __radd__(self, other):          # supports sum() which starts at 0
        if other == 0:
            return self
        return self.__add__(other)

    def __sub__(self, other):
        return Vector(self.x - other.x, self.y - other.y)

    def __mul__(self, k):               # vector * number
        return Vector(self.x * k, self.y * k)

    __rmul__ = __mul__                   # number * vector

    def __eq__(self, other):
        return isinstance(other, Vector) and (self.x, self.y) == (other.x, other.y)

    def __abs__(self):
        return (self.x ** 2 + self.y ** 2) ** 0.5

    def __bool__(self):
        return bool(self.x or self.y)

a, b = Vector(3, 4), Vector(1, 2)
print(a + b)
print(a - b)
print(a * 2, 3 * b)
print(abs(a))
print(a == Vector(3, 4), a == b)
print(sum([a, b, Vector(10, 10)]))
print(bool(Vector(0, 0)), bool(a))
try:
    a + 5
except TypeError as e:
    print("TypeError:", e)
`,
        },
      },
      result: `Vector(4, 6)
Vector(2, 2)
Vector(6, 8) Vector(3, 6)
5.0
True False
Vector(14, 16)
False True
TypeError: unsupported operand type(s) for +: 'Vector' and 'int'`,
      explanation: "Each operator maps to a dunder method. __radd__ is needed because sum() computes 0 + a first. __rmul__ lets 3 * b work. Returning NotImplemented from __add__ makes Python raise a clean TypeError for a + 5. __bool__ makes the zero vector falsy.",
    },
    {
      title: "Container-like Class: Shopping Cart",
      scenario: "A shopping cart that supports len(), indexing, in, and for loops like a normal list.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Cart:
    def __init__(self):
        self._items = []

    def add(self, name, price):
        self._items.append((name, price))
        return self                     # allows chaining

    def __len__(self):
        return len(self._items)

    def __getitem__(self, index):
        return self._items[index]

    def __contains__(self, name):
        return any(n == name for n, _ in self._items)

    def __iter__(self):
        return iter(self._items)

    def __call__(self):                 # cart() gives total
        return sum(p for _, p in self._items)

cart = Cart().add("Milk", 60).add("Bread", 40).add("Eggs", 90)
print(len(cart))
print(cart[0], cart[-1])
print(cart[0:2])
print("Bread" in cart, "Butter" in cart)
for name, price in cart:
    print(f"{name:<6}{price:>4}")
print("Total:", cart())
`,
      python: {
        files: {
          "main.py": `class Cart:
    def __init__(self):
        self._items = []

    def add(self, name, price):
        self._items.append((name, price))
        return self                     # allows chaining

    def __len__(self):
        return len(self._items)

    def __getitem__(self, index):
        return self._items[index]

    def __contains__(self, name):
        return any(n == name for n, _ in self._items)

    def __iter__(self):
        return iter(self._items)

    def __call__(self):                 # cart() gives total
        return sum(p for _, p in self._items)

cart = Cart().add("Milk", 60).add("Bread", 40).add("Eggs", 90)
print(len(cart))
print(cart[0], cart[-1])
print(cart[0:2])
print("Bread" in cart, "Butter" in cart)
for name, price in cart:
    print(f"{name:<6}{price:>4}")
print("Total:", cart())
`,
        },
      },
      result: `3
('Milk', 60) ('Eggs', 90)
[('Milk', 60), ('Bread', 40)]
True False
Milk    60
Bread   40
Eggs    90
Total: 190`,
      explanation: "__len__ powers len(), __getitem__ powers indexing and slicing (the slice object is passed straight to the list), __contains__ powers in, __iter__ powers the for loop and __call__ lets us call the object like a function.",
    },
    {
      title: "Comparisons, Sorting and Hashing with total_ordering",
      scenario: "Students need to be sorted by marks, compared with < and >, and stored in a set without duplicates.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, roll, name, marks):
        self.roll, self.name, self.marks = roll, name, marks

    def __eq__(self, other):
        return self.marks == other.marks

    def __lt__(self, other):
        return self.marks < other.marks

    def __hash__(self):
        return hash(self.roll)

    def __repr__(self):
        return f"{self.name}({self.marks})"

s1 = Student(1, "Asha", 88)
s2 = Student(2, "Ravi", 72)
s3 = Student(3, "Neha", 95)
print(s1 > s2, s1 <= s3, s2 >= s3)     # >, <=, >= come from total_ordering
print(sorted([s1, s2, s3]))
print(max([s1, s2, s3]))
print(len({s1, s2, s3, s1}))

class NoHash:
    def __eq__(self, other):
        return True
print(NoHash.__hash__)
`,
      python: {
        files: {
          "main.py": `from functools import total_ordering

@total_ordering
class Student:
    def __init__(self, roll, name, marks):
        self.roll, self.name, self.marks = roll, name, marks

    def __eq__(self, other):
        return self.marks == other.marks

    def __lt__(self, other):
        return self.marks < other.marks

    def __hash__(self):
        return hash(self.roll)

    def __repr__(self):
        return f"{self.name}({self.marks})"

s1 = Student(1, "Asha", 88)
s2 = Student(2, "Ravi", 72)
s3 = Student(3, "Neha", 95)
print(s1 > s2, s1 <= s3, s2 >= s3)     # >, <=, >= come from total_ordering
print(sorted([s1, s2, s3]))
print(max([s1, s2, s3]))
print(len({s1, s2, s3, s1}))

class NoHash:
    def __eq__(self, other):
        return True
print(NoHash.__hash__)
`,
        },
      },
      result: `True True False
[Ravi(72), Asha(88), Neha(95)]
Neha(95)
3
None`,
      explanation: "We wrote only __eq__ and __lt__; @total_ordering generated __gt__, __le__ and __ge__. sorted() and max() use __lt__. Because we defined __hash__, students can go in a set (s1 added twice counts once). NoHash defines __eq__ only, so Python sets its __hash__ to None and it cannot be used in sets.",
    },
  ],
  interview: [
    {
      q: "What are magic (dunder) methods?",
      a: "Special methods surrounded by double underscores (e.g. __init__, __str__, __add__) that Python calls automatically for built-in operations like print(), len(), +, == and indexing.",
      level: "Easy",
    },
    {
      q: "Difference between __str__ and __repr__?",
      a: "__str__ is the readable user-facing string used by print()/str(). __repr__ is the unambiguous developer string used by repr(), the shell and containers. If __str__ is missing, __repr__ is used.",
      level: "Easy",
    },
    {
      q: "What is operator overloading?",
      a: "Defining how operators like +, -, *, ==, < behave for user-defined classes by implementing the corresponding dunder methods such as __add__ and __eq__.",
      level: "Easy",
    },
    {
      q: "When is __radd__ called?",
      a: "When the left operand's __add__ does not support the right operand (returns NotImplemented or does not exist). For example 5 + obj or sum([obj1, obj2]) which starts with 0 + obj1.",
      level: "Medium",
    },
    {
      q: "What should __add__ return for an unsupported type?",
      a: "Return the singleton NotImplemented (not raise NotImplementedError). Python will then try the reflected method of the other operand and finally raise TypeError.",
      level: "Medium",
    },
    {
      q: "What happens to __hash__ when you define __eq__ only?",
      a: "Python sets __hash__ = None, making instances unhashable: they cannot be put in sets or used as dict keys. Define __hash__ explicitly if the object is immutable.",
      level: "Hard",
    },
    {
      q: "What does __call__ do?",
      a: "It makes an instance callable like a function: obj(args) runs obj.__call__(args). Used in decorators implemented as classes, and in ML models (model(x)).",
      level: "Medium",
    },
    {
      q: `What is the output?
class A:
    def __len__(self): return 0
print(bool(A()))`,
      a: "False - when __bool__ is not defined, Python uses __len__; length 0 means falsy.",
      level: "Medium",
    },
    {
      q: `What is the output?
class A:
    def __repr__(self): return 'R'
print(A(), [A()])`,
      a: "R [R] - with no __str__, print() falls back to __repr__; lists always use __repr__.",
      level: "Easy",
    },
    {
      q: "What does functools.total_ordering do?",
      a: "Given __eq__ and one of __lt__, __le__, __gt__, __ge__, it automatically adds the remaining rich comparison methods.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create a Money class with amount and currency; support + (same currency only), == and a nice __str__.",
      hint: "Raise ValueError if currencies differ.",
      solution: `class Money:
    def __init__(self, amt, cur="INR"):
        self.amt, self.cur = amt, cur
    def __add__(self, o):
        if self.cur != o.cur:
            raise ValueError("Currency mismatch")
        return Money(self.amt + o.amt, self.cur)
    def __eq__(self, o):
        return (self.amt, self.cur) == (o.amt, o.cur)
    def __str__(self):
        return f"{self.amt:.2f} {self.cur}"
print(Money(10) + Money(5.5))   # 15.50 INR
`,
    },
    {
      task: "Make a Matrix2x2 class that supports * (matrix multiplication) and __repr__.",
      hint: "Implement __mul__ with the row x column formula.",
      solution: `class M:
    def __init__(self, a, b, c, d): self.v = (a, b, c, d)
    def __mul__(self, o):
        a, b, c, d = self.v; e, f, g, h = o.v
        return M(a*e + b*g, a*f + b*h, c*e + d*g, c*f + d*h)
    def __repr__(self): return f"M{self.v}"
print(M(1, 2, 3, 4) * M(5, 6, 7, 8))   # M(19, 22, 43, 50)
`,
    },
    {
      task: "Write a Sentence class where len() gives number of words, s[i] gives i-th word, and iteration yields words.",
      hint: "Store self.words = text.split().",
      solution: `class Sentence:
    def __init__(self, text): self.words = text.split()
    def __len__(self): return len(self.words)
    def __getitem__(self, i): return self.words[i]
s = Sentence("Python is fun to learn")
print(len(s), s[2], list(s))
`,
    },
    {
      task: "Make a Temperature class comparable with <, >, == and sortable, using total_ordering.",
      hint: "Define __eq__ and __lt__ only.",
      solution: `from functools import total_ordering
@total_ordering
class Temp:
    def __init__(self, c): self.c = c
    def __eq__(self, o): return self.c == o.c
    def __lt__(self, o): return self.c < o.c
    def __repr__(self): return f"{self.c}C"
print(sorted([Temp(30), Temp(12), Temp(25)]), Temp(5) >= Temp(5))
`,
    },
    {
      task: "Make a Counter class whose object can be called to increment and print its count.",
      hint: "Use __call__.",
      solution: `class Counter:
    def __init__(self): self.n = 0
    def __call__(self):
        self.n += 1
        return self.n
c = Counter(); c(); c()
print(c())   # 3
`,
    },
  ],
  quiz: [
    {
      question: "Which method does print(obj) call first?",
      options: [
        "__repr__",
        "__print__",
        "__str__",
        "__format__ only",
      ],
      answer: 2,
      explanation: "print() uses str(obj) which calls __str__, falling back to __repr__.",
    },
    {
      question: "a + b on custom objects calls:",
      options: [
        "a.__add__(b)",
        "b.__add__(a)",
        "add(a, b)",
        "a.__plus__(b)",
      ],
      answer: 0,
      explanation: "The left operand's __add__ is tried first.",
    },
    {
      question: "What should __add__ return when it cannot handle the other operand?",
      options: [
        "None",
        "False",
        "raise NotImplementedError",
        "NotImplemented",
      ],
      answer: 3,
      explanation: "Returning NotImplemented lets Python try the reflected method.",
    },
    {
      question: "Defining __eq__ without __hash__ makes objects:",
      options: [
        "Unhashable",
        "Hash by id",
        "Hash by value automatically",
        "Raise SyntaxError",
      ],
      answer: 0,
      explanation: "Python sets __hash__ to None.",
    },
    {
      question: "Which method makes the 'in' operator work efficiently?",
      options: [
        "__in__",
        "__contains__",
        "__has__",
        "__find__",
      ],
      answer: 1,
      explanation: "x in obj calls obj.__contains__(x).",
    },
  ],
};
