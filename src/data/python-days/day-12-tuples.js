export default {
  id: "day-12-tuples",
  title: "Tuples, Packing/Unpacking, Tuple vs List",
  module: "Module 2: Data Structures",
  day: 12,
  level: "Beginner",
  duration: "2 hours",
  summary: "Learn tuples, Python's immutable ordered collection: how to create them (including the single-item trap), access items, use their two methods, pack and unpack values (including * unpacking), and decide when to choose a tuple over a list.",
  objectives: [
    "Create tuples correctly, including empty and single-element tuples",
    "Index, slice, loop over tuples and use count() and index()",
    "Use packing, unpacking, extended unpacking with * and swapping",
    "Return multiple values from a function using tuples and use namedtuple",
    "Compare tuple vs list (mutability, performance, hashability, use cases)",
  ],
  theory: [
    {
      heading: "What is a tuple?",
      content: "A tuple is an ordered, IMMUTABLE collection. Once created, you cannot add, remove or change its items. It is written with parentheses, but actually the comma makes the tuple, not the brackets. Use tuples for fixed groups of related values: a date (17, 11, 2026), GPS coordinates (18.52, 73.85), RGB colours (255, 0, 0), or a database row. Think of a tuple as a sealed packet and a list as an open basket.",
      syntax: `empty = ()
point = (3, 4)
person = ("Asha", 21, "Pune")
no_brackets = 1, 2, 3          # still a tuple (packing)
single = (5,)                  # ONE-item tuple needs a comma
not_tuple = (5)                # this is just the int 5
from_list = tuple([1, 2, 3])
from_str = tuple("abc")        # ('a', 'b', 'c')`,
      tip: "The most common trap: (5) is an int; (5,) is a tuple. Check with type().",
    },
    {
      heading: "Accessing tuple items and tuple methods",
      content: "Indexing, negative indexing, slicing, len(), in, loops, + and * all work like lists. Slicing a tuple returns a new tuple. Because tuples are immutable, they have only two methods: count(x) and index(x). Assigning to an item raises TypeError.",
      syntax: `t = (10, 20, 30, 20, 40)
t[0]          # 10
t[-1]         # 40
t[1:3]        # (20, 30)
t.count(20)   # 2
t.index(30)   # 2
t + (50,)     # new tuple (10, 20, 30, 20, 40, 50)
t * 2         # repeated tuple
t[0] = 99     # TypeError: 'tuple' object does not support item assignment`,
    },
    {
      heading: "Immutable but can contain mutable objects",
      content: "A tuple stores references. The references cannot change, but if one of them points to a mutable object such as a list, that list itself can still be modified. Such a tuple is not hashable and cannot be used as a dictionary key.",
      syntax: `t = (1, [2, 3])
t[1].append(4)     # allowed -> (1, [2, 3, 4])
t[1] = [9]         # TypeError
hash((1, 2))       # works
hash((1, [2]))     # TypeError: unhashable type: 'list'`,
    },
    {
      heading: "Packing and unpacking",
      content: "Packing means putting several values into one tuple: data = \"Asha\", 21. Unpacking means taking them out into separate variables in one line: name, age = data. The number of variables must match the number of items, otherwise ValueError. Extended unpacking with * collects \"the rest\" into a list. _ is used as a name for values you want to ignore.",
      syntax: `data = "Asha", 21, "Pune"       # packing
name, age, city = data          # unpacking
a, b = b, a                     # swap = pack + unpack
first, *rest = (1, 2, 3, 4)     # first=1, rest=[2, 3, 4]
*start, last = (1, 2, 3, 4)     # start=[1, 2, 3], last=4
head, *_, tail = range(10)      # ignore middle
x, y = (1, 2, 3)                # ValueError: too many values to unpack
for name, marks in [("A", 90), ("B", 80)]:   # unpacking in loops
    ...`,
    },
    {
      heading: "Tuples in functions and namedtuple",
      content: "A function that returns several values actually returns ONE tuple, which the caller usually unpacks. *args in a function definition collects extra positional arguments into a tuple (Day 17). collections.namedtuple creates a tuple whose items also have names, so you can write p.x instead of p[0]; it is lightweight and still immutable.",
      syntax: `def min_max(nums):
    return min(nums), max(nums)     # returns a tuple

low, high = min_max([4, 9, 1])

from collections import namedtuple
Point = namedtuple("Point", ["x", "y"])
p = Point(3, 4)
p.x, p.y, p[0]      # 3 4 3`,
    },
    {
      heading: "Tuple vs List",
      content: "Choose a list when the collection will change (cart items, to-do list). Choose a tuple when the data is fixed and should be protected from accidental change, when you need a dictionary key or set element, or for returning multiple values. Tuples use slightly less memory and are a bit faster to create and iterate.",
      points: [
        "Syntax: list [1, 2] vs tuple (1, 2)",
        "Mutability: list mutable vs tuple immutable",
        "Methods: list has many (append, sort, pop...) vs tuple only count and index",
        "Hashable: tuple (of immutables) can be a dict key / set item; list cannot",
        "Memory and speed: tuple is smaller and slightly faster",
        "Use case: list for homogeneous changing data; tuple for fixed records (heterogeneous)",
      ],
    },
  ],
  examples: [
    {
      title: "Creating tuples and the single-element trap",
      scenario: "Create different tuples and verify their types, especially the one-item case.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `date = (17, 11, 2026)
coords = 18.52, 73.85
single = ("Python",)
not_tuple = ("Python")
empty = ()
letters = tuple("hey")

for value in [date, coords, single, not_tuple, empty, letters]:
    print(repr(value), "->", type(value).__name__)

print("Day:", date[0], "| Year:", date[-1], "| Month-Year:", date[1:])
print("Length:", len(date), "| 2026 in date:", 2026 in date)`,
      python: {
        files: {
          "main.py": `date = (17, 11, 2026)
coords = 18.52, 73.85
single = ("Python",)
not_tuple = ("Python")
empty = ()
letters = tuple("hey")

for value in [date, coords, single, not_tuple, empty, letters]:
    print(repr(value), "->", type(value).__name__)

print("Day:", date[0], "| Year:", date[-1], "| Month-Year:", date[1:])
print("Length:", len(date), "| 2026 in date:", 2026 in date)`,
        },
      },
      result: `(17, 11, 2026) -> tuple
(18.52, 73.85) -> tuple
('Python',) -> tuple
'Python' -> str
() -> tuple
('h', 'e', 'y') -> tuple
Day: 17 | Year: 2026 | Month-Year: (11, 2026)
Length: 3 | 2026 in date: True`,
      explanation: "coords has no brackets but is still a tuple because of the comma. (\"Python\") is just a string in brackets; (\"Python\",) is a tuple. Indexing and slicing work like lists.",
    },
    {
      title: "Immutability and count/index",
      scenario: "Try to modify a tuple, use its two methods, and modify a list stored inside a tuple.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `days = ("Mon", "Tue", "Wed", "Tue", "Fri")
print("Tue count:", days.count("Tue"), "| Wed index:", days.index("Wed"))

try:
    days[0] = "Sun"
except TypeError as e:
    print("TypeError:", e)

days = days + ("Sat",)
print("New tuple:", days)

record = ("Asha", [85, 90])
record[1].append(95)
print("Record:", record)
try:
    print(hash(record))
except TypeError as e:
    print("TypeError:", e)
print("hash works for (1, 2):", isinstance(hash((1, 2)), int))`,
      python: {
        files: {
          "main.py": `days = ("Mon", "Tue", "Wed", "Tue", "Fri")
print("Tue count:", days.count("Tue"), "| Wed index:", days.index("Wed"))

try:
    days[0] = "Sun"
except TypeError as e:
    print("TypeError:", e)

days = days + ("Sat",)
print("New tuple:", days)

record = ("Asha", [85, 90])
record[1].append(95)
print("Record:", record)
try:
    print(hash(record))
except TypeError as e:
    print("TypeError:", e)
print("hash works for (1, 2):", isinstance(hash((1, 2)), int))`,
        },
      },
      result: `Tue count: 2 | Wed index: 2
TypeError: 'tuple' object does not support item assignment
New tuple: ('Mon', 'Tue', 'Wed', 'Tue', 'Fri', 'Sat')
Record: ('Asha', [85, 90, 95])
TypeError: unhashable type: 'list'
hash works for (1, 2): True`,
      explanation: "Item assignment fails. To \"add\" we create a new tuple with +. A list inside a tuple can still change, but such a tuple is not hashable.",
    },
    {
      title: "Packing, unpacking and extended unpacking",
      scenario: "Unpack employee records, ignore values, collect the rest with *, and swap values.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `employee = ("E101", "Ravi", "Developer", 65000)
emp_id, name, role, salary = employee
print(f"{name} ({emp_id}) works as {role} earning {salary}")

marks = (95, 88, 76, 64, 59)
top, *others = marks
*others2, lowest = marks
first, *_, last = marks
print("Top:", top, "| Others:", others)
print("Lowest:", lowest, "| first/last:", first, last)

a, b = 5, 10
a, b = b, a
print("Swapped:", a, b)

for code, (city, pin) in [("PN", ("Pune", 411001)), ("MU", ("Mumbai", 400001))]:
    print(code, city, pin)

try:
    x, y = (1, 2, 3)
except ValueError as e:
    print("ValueError:", e)`,
      python: {
        files: {
          "main.py": `employee = ("E101", "Ravi", "Developer", 65000)
emp_id, name, role, salary = employee
print(f"{name} ({emp_id}) works as {role} earning {salary}")

marks = (95, 88, 76, 64, 59)
top, *others = marks
*others2, lowest = marks
first, *_, last = marks
print("Top:", top, "| Others:", others)
print("Lowest:", lowest, "| first/last:", first, last)

a, b = 5, 10
a, b = b, a
print("Swapped:", a, b)

for code, (city, pin) in [("PN", ("Pune", 411001)), ("MU", ("Mumbai", 400001))]:
    print(code, city, pin)

try:
    x, y = (1, 2, 3)
except ValueError as e:
    print("ValueError:", e)`,
        },
      },
      result: `Ravi (E101) works as Developer earning 65000
Top: 95 | Others: [88, 76, 64, 59]
Lowest: 59 | first/last: 95 59
Swapped: 10 5
PN Pune 411001
MU Mumbai 400001
ValueError: too many values to unpack (expected 2)`,
      explanation: "Unpacking assigns each item to a variable. * collects the remaining items into a list. Nested tuples can be unpacked with matching brackets. A count mismatch raises ValueError.",
    },
    {
      title: "Returning multiple values and namedtuple",
      scenario: "A function returns statistics of marks as a tuple; then use a namedtuple to make a readable student record.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `from collections import namedtuple

def stats(nums):
    total = sum(nums)
    return min(nums), max(nums), total / len(nums)

result = stats([72, 95, 58, 88])
print("Returned:", result, type(result).__name__)
low, high, avg = result
print(f"Low={low}, High={high}, Avg={avg:.2f}")

Student = namedtuple("Student", ["roll", "name", "cgpa"])
s = Student(1, "Asha", 8.9)
print(s)
print(s.name, s[2], s._asdict())
s2 = s._replace(cgpa=9.1)
print("Updated copy:", s2)`,
      python: {
        files: {
          "main.py": `from collections import namedtuple

def stats(nums):
    total = sum(nums)
    return min(nums), max(nums), total / len(nums)

result = stats([72, 95, 58, 88])
print("Returned:", result, type(result).__name__)
low, high, avg = result
print(f"Low={low}, High={high}, Avg={avg:.2f}")

Student = namedtuple("Student", ["roll", "name", "cgpa"])
s = Student(1, "Asha", 8.9)
print(s)
print(s.name, s[2], s._asdict())
s2 = s._replace(cgpa=9.1)
print("Updated copy:", s2)`,
        },
      },
      result: `Returned: (58, 95, 78.25) tuple
Low=58, High=95, Avg=78.25
Student(roll=1, name='Asha', cgpa=8.9)
Asha 8.9 {'roll': 1, 'name': 'Asha', 'cgpa': 8.9}
Updated copy: Student(roll=1, name='Asha', cgpa=9.1)`,
      explanation: "return a, b, c packs a tuple. namedtuple gives field names; _asdict() converts to a dict and _replace() returns a new tuple with a changed field (the original is unchanged).",
    },
    {
      title: "Tuple vs list: memory, speed and dict keys",
      scenario: "Compare memory size, and use tuples as dictionary keys to store distances between cities.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import sys

as_list = [1, 2, 3, 4, 5]
as_tuple = (1, 2, 3, 4, 5)
print("List size :", sys.getsizeof(as_list), "bytes")
print("Tuple size:", sys.getsizeof(as_tuple), "bytes")

distance = {
    ("Pune", "Mumbai"): 150,
    ("Pune", "Nashik"): 210,
}
print("Pune -> Mumbai:", distance[("Pune", "Mumbai")], "km")

try:
    bad = {["Pune", "Goa"]: 450}
except TypeError as e:
    print("TypeError:", e)

points = [(3, 4), (1, 2), (3, 1)]
print("Sorted points:", sorted(points))
print((1, 2, 3) < (1, 3), (2, "a") == (2, "a"))`,
      python: {
        files: {
          "main.py": `import sys

as_list = [1, 2, 3, 4, 5]
as_tuple = (1, 2, 3, 4, 5)
print("List size :", sys.getsizeof(as_list), "bytes")
print("Tuple size:", sys.getsizeof(as_tuple), "bytes")

distance = {
    ("Pune", "Mumbai"): 150,
    ("Pune", "Nashik"): 210,
}
print("Pune -> Mumbai:", distance[("Pune", "Mumbai")], "km")

try:
    bad = {["Pune", "Goa"]: 450}
except TypeError as e:
    print("TypeError:", e)

points = [(3, 4), (1, 2), (3, 1)]
print("Sorted points:", sorted(points))
print((1, 2, 3) < (1, 3), (2, "a") == (2, "a"))`,
        },
      },
      result: `List size : 104 bytes
Tuple size: 80 bytes
Pune -> Mumbai: 150 km
TypeError: unhashable type: 'list'
Sorted points: [(1, 2), (3, 1), (3, 4)]
True True`,
      explanation: "Tuples take less memory than lists with the same items (lists keep extra bookkeeping and spare room for growth). Exact byte sizes depend on the Python build and platform (64-bit CPython shown). Tuples are hashable, so they can be dict keys; lists cannot. Tuples compare item by item, which makes sorting coordinates easy.",
    },
  ],
  interview: [
    {
      q: "What is a tuple? How is it different from a list?",
      a: "A tuple is an ordered, immutable sequence. Lists are mutable. Tuples are hashable (if items are), use less memory, are slightly faster, and have only count() and index() methods.",
      level: "Easy",
    },
    {
      q: "How do you create a tuple with one element?",
      a: "Add a trailing comma: t = (5,) or t = 5,. (5) is just the integer 5.",
      level: "Easy",
    },
    {
      q: "What is the output of print(type((1)), type((1,)))?",
      a: "<class 'int'> <class 'tuple'>",
      level: "Easy",
    },
    {
      q: "Can a tuple be modified?",
      a: "No, items cannot be reassigned, added or removed. But if a tuple contains a mutable object (like a list), that object can be changed in place.",
      level: "Medium",
    },
    {
      q: "What is packing and unpacking?",
      a: "Packing groups values into a tuple (t = 1, 2, 3). Unpacking assigns tuple items to variables (a, b, c = t). Extended unpacking uses *: a, *rest = t.",
      level: "Easy",
    },
    {
      q: `What is the output?
a, *b, c = [1, 2, 3, 4, 5]
print(b)`,
      a: "[2, 3, 4]. The starred variable always becomes a list.",
      level: "Medium",
    },
    {
      q: "Why can tuples be dictionary keys but lists cannot?",
      a: "Dict keys must be hashable; a hash must not change during the object's lifetime. Tuples of immutable items are hashable; lists are mutable and unhashable.",
      level: "Medium",
    },
    {
      q: "How does a function return multiple values in Python?",
      a: "It returns a single tuple, e.g. return a, b, which the caller can unpack: x, y = f().",
      level: "Easy",
    },
    {
      q: "What is the output of t = (1, 2) * 2; print(t)?",
      a: "(1, 2, 1, 2)",
      level: "Easy",
    },
    {
      q: "What is a namedtuple?",
      a: "A factory in collections that creates tuple subclasses with named fields: Point = namedtuple(\"Point\", \"x y\"); p.x. Immutable, lightweight and readable.",
      level: "Medium",
    },
    {
      q: "What happens: t = (1, [2]); t[1] += [3]?",
      a: "Surprisingly, it raises TypeError AND the list is modified to [2, 3]. += first extends the list in place, then tries to assign back into the tuple, which fails.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Given a tuple of numbers, print the sum, the max and the tuple sorted in descending order (as a tuple).",
      hint: "tuple(sorted(t, reverse=True))",
      solution: `t = (4, 9, 1, 7)
print(sum(t), max(t), tuple(sorted(t, reverse=True)))`,
    },
    {
      task: "Write a function divide(a, b) that returns quotient and remainder, and unpack the result.",
      hint: "return a // b, a % b",
      solution: `def divide(a, b):
    return a // b, a % b

q, rem = divide(17, 5)
print(q, rem)`,
    },
    {
      task: "Convert a list of (name, marks) tuples into two separate tuples of names and marks.",
      hint: "zip(*pairs)",
      solution: `pairs = [("Asha", 90), ("Ravi", 80), ("Meena", 85)]
names, marks = zip(*pairs)
print(names, marks)`,
    },
    {
      task: "Sort a list of (product, price) tuples by price.",
      hint: "key=lambda item: item[1]",
      solution: `items = [("pen", 10), ("book", 250), ("bag", 900), ("pencil", 5)]
print(sorted(items, key=lambda item: item[1]))`,
    },
  ],
  quiz: [
    {
      question: "Which creates a tuple?",
      options: [
        "(5)",
        "[5]",
        "5,",
        "{5}",
      ],
      answer: 2,
      explanation: "The comma makes a tuple.",
    },
    {
      question: "How many methods does a tuple have (excluding dunder methods)?",
      options: [
        "2",
        "0",
        "5",
        "11",
      ],
      answer: 0,
      explanation: "count() and index().",
    },
    {
      question: "a, *b = (1, 2, 3); what is b?",
      options: [
        "(2, 3)",
        "[2, 3]",
        "2",
        "3",
      ],
      answer: 1,
      explanation: "Starred targets are always lists.",
    },
    {
      question: "Which can be used as a dictionary key?",
      options: [
        "[1, 2]",
        "{1, 2}",
        "{\"a\": 1}",
        "(1, 2)",
      ],
      answer: 3,
      explanation: "Only hashable objects like tuples of immutables.",
    },
    {
      question: "t = (1, 2, 3); t[0] = 10 results in:",
      options: [
        "(10, 2, 3)",
        "IndexError",
        "TypeError",
        "Nothing happens",
      ],
      answer: 2,
      explanation: "Tuples do not support item assignment.",
    },
  ],
};
