export default {
  id: "day-38-comprehensions-copy-memory",
  title: "Comprehensions Deep Dive, Shallow vs Deep Copy, Mutable vs Immutable, Memory and Garbage Collection",
  module: "Module 6: Advanced Python",
  day: 38,
  level: "Advanced",
  duration: "2.5 hours",
  summary: "Master list, dict, set and nested comprehensions, understand how Python variables are references to objects, the difference between mutable and immutable types, shallow vs deep copy, and how reference counting and the garbage collector free memory.",
  objectives: [
    "Write nested and conditional list, dict and set comprehensions and know when not to use them",
    "Explain that variables are names bound to objects and use id(), is and ==",
    "Differentiate mutable and immutable types and predict side effects in functions",
    "Choose between assignment, shallow copy and deep copy",
    "Explain reference counting, cyclic garbage collection, the gc module and weak references",
  ],
  theory: [
    {
      heading: "Comprehensions Deep Dive",
      content: "A comprehension builds a collection in one readable expression: [expr for item in iterable if condition]. Dict comprehensions use {k: v for ...}, set comprehensions use {x for ...}, and generator expressions use (...). You can nest loops (the order is the same as nested for statements) and use if/else in the expression part. The walrus operator := can store a computed value inside a comprehension.",
      syntax: `squares = [x * x for x in range(6)]
evens = [x for x in range(10) if x % 2 == 0]           # filter
labels = ["even" if x % 2 == 0 else "odd" for x in range(4)]   # if-else in expression
pairs = [(i, j) for i in range(2) for j in range(3)]  # nested: outer loop first
matrix_t = [[row[i] for row in m] for i in range(3)]  # nested comprehension
word_len = {w: len(w) for w in ["hi", "hello"]}       # dict
unique = {c.lower() for c in "AaBb"}                   # set
`,
      points: [
        "Filter if goes at the END; conditional expression if-else goes at the START",
        "Comprehension variables do not leak outside (Python 3)",
        "If it needs more than two loops or complex logic, use a normal loop for readability",
      ],
    },
    {
      heading: "Variables are References (Names) to Objects",
      content: "In Python, a variable is a label stuck on an object, not a box that holds a value. a = [1, 2]; b = a puts a second label on the SAME list. id(obj) gives the object's identity, 'is' checks if two names point to the same object, and '==' checks if values are equal. Analogy: two people sharing one Google Doc link - if one edits, the other sees the change.",
      syntax: `a = [1, 2]
b = a          # same object
c = [1, 2]     # new object with equal value
print(a == c, a is c, a is b)   # True False True
`,
    },
    {
      heading: "Mutable vs Immutable",
      content: "Immutable objects cannot be changed after creation: int, float, bool, str, tuple, frozenset, bytes. 'Changing' them creates a new object. Mutable objects can be changed in place: list, dict, set, bytearray, and most user-defined objects. This matters for function arguments: Python passes references (call by object reference / call by sharing). A function can modify a mutable argument in place, but reassigning a parameter never affects the caller.",
      points: [
        "s = 'hi'; s += '!' creates a new string",
        "lst.append(4) changes the same list",
        "A tuple holding a list is immutable itself, but the inner list can still change",
        "Only immutable (hashable) objects can be dict keys or set members",
        "Small ints (-5..256) and some strings are cached (interned), so 'is' may be True - never rely on it, use ==",
      ],
    },
    {
      heading: "Assignment vs Shallow Copy vs Deep Copy",
      content: "Assignment (b = a) copies only the reference. A shallow copy (a.copy(), list(a), a[:], copy.copy(a)) creates a new outer container but the inner objects are still shared. A deep copy (copy.deepcopy(a)) recursively copies everything, so nested objects are fully independent. Analogy: shallow copy is photocopying a folder's index page - the papers inside are still the same papers; deep copy photocopies every paper.",
      syntax: `import copy
a = [[1, 2], [3, 4]]
s = copy.copy(a)        # new outer list, same inner lists
d = copy.deepcopy(a)    # everything new
a[0].append(99)
# s[0] is [1, 2, 99] ; d[0] is [1, 2]
`,
      tip: "[[0] * 3] * 3 creates 3 references to the SAME inner list. Use [[0] * 3 for _ in range(3)] instead.",
    },
    {
      heading: "Memory Management: Reference Counting and Garbage Collection",
      content: "CPython frees memory mainly by reference counting: every object keeps a count of how many references point to it, and when the count reaches zero the object is destroyed immediately (and __del__ runs). Reference cycles (A refers to B and B refers to A) never reach zero, so Python also has a cyclic garbage collector (gc module) that periodically finds and frees unreachable cycles. It uses three generations: new objects are checked often, long-lived objects rarely. Python manages a private heap; small objects use the pymalloc allocator.",
      points: [
        "sys.getrefcount(obj) shows the reference count (+1 for the argument itself)",
        "gc.collect() forces a collection and returns the number of unreachable objects found",
        "gc.get_threshold() shows generation thresholds",
        "del x removes a NAME, not necessarily the object",
        "weakref lets you refer to an object without keeping it alive (used in caches)",
      ],
    },
    {
      heading: "Common Mistakes",
      content: "Mutable default arguments, building 2D lists with *, modifying a list while iterating over it, assuming copy() is a deep copy, and using 'is' to compare values.",
      points: [
        "def f(x=[]) shares the list across calls",
        "x is 1000 may be False even if x == 1000",
        "for item in lst: lst.remove(item) skips elements - iterate over a copy or use a comprehension",
      ],
    },
  ],
  examples: [
    {
      title: "Comprehensions: Nested, Conditional, Dict, Set and Walrus",
      scenario: "Prepare report data from student marks in compact, readable expressions.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `marks = {"Asha": [78, 92, 85], "Ravi": [45, 38, 52], "Neha": [90, 95, 99]}

averages = {name: round(sum(m) / len(m), 1) for name, m in marks.items()}
print(averages)

result = {name: ("Pass" if avg >= 50 else "Fail") for name, avg in averages.items()}
print(result)

toppers = [name for name, avg in averages.items() if avg > 80]
print(toppers)

all_scores = [s for scores in marks.values() for s in scores]
print(all_scores)

matrix = [[1, 2, 3], [4, 5, 6]]
transpose = [[row[i] for row in matrix] for i in range(3)]
print(transpose)

table = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(table)

print({len(name) for name in marks})
print({s % 10 for s in all_scores if s > 80})

data = [3, 8, 12, 5, 20]
print([y for x in data if (y := x * x) > 50])
`,
      python: {
        files: {
          "main.py": `marks = {"Asha": [78, 92, 85], "Ravi": [45, 38, 52], "Neha": [90, 95, 99]}

averages = {name: round(sum(m) / len(m), 1) for name, m in marks.items()}
print(averages)

result = {name: ("Pass" if avg >= 50 else "Fail") for name, avg in averages.items()}
print(result)

toppers = [name for name, avg in averages.items() if avg > 80]
print(toppers)

all_scores = [s for scores in marks.values() for s in scores]
print(all_scores)

matrix = [[1, 2, 3], [4, 5, 6]]
transpose = [[row[i] for row in matrix] for i in range(3)]
print(transpose)

table = [[i * j for j in range(1, 4)] for i in range(1, 4)]
print(table)

print({len(name) for name in marks})
print({s % 10 for s in all_scores if s > 80})

data = [3, 8, 12, 5, 20]
print([y for x in data if (y := x * x) > 50])
`,
        },
      },
      result: `{'Asha': 85.0, 'Ravi': 45.0, 'Neha': 94.7}
{'Asha': 'Pass', 'Ravi': 'Fail', 'Neha': 'Pass'}
['Asha', 'Neha']
[78, 92, 85, 45, 38, 52, 90, 95, 99]
[[1, 4], [2, 5], [3, 6]]
[[1, 2, 3], [2, 4, 6], [3, 6, 9]]
{4}
{0, 9, 2, 5}
[64, 144, 400]`,
      explanation: "Dict comprehensions build averages and pass/fail labels (note if-else is placed before for). The flattening comprehension reads like nested loops: outer for scores, inner for s. The transpose and table use nested comprehensions. Set comprehensions remove duplicates. The walrus := computes x*x once and reuses it in the filter.",
    },
    {
      title: "Identity, Mutability and Function Arguments",
      scenario: "See how references behave so you can predict side effects in your functions.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `a = [1, 2, 3]
b = a
c = [1, 2, 3]
print(a == b, a is b)
print(a == c, a is c)

b.append(4)
print("a after b.append:", a)

s = "hi"
t = s
t += "!"
print(s, t, s is t)

def modify(lst):
    lst.append("added")      # changes caller's list

def reassign(lst):
    lst = ["new list"]       # only local name changes

def change_num(n):
    n += 10
    return n

items = ["x"]
modify(items)
reassign(items)
print(items)

num = 5
print(change_num(num), num)

pair = ([1, 2], "fixed")
pair[0].append(3)
print(pair)
try:
    pair[1] = "changed"
except TypeError as e:
    print("TypeError:", e)

try:
    {[1, 2]: "value"}
except TypeError as e:
    print("TypeError:", e)
`,
      python: {
        files: {
          "main.py": `a = [1, 2, 3]
b = a
c = [1, 2, 3]
print(a == b, a is b)
print(a == c, a is c)

b.append(4)
print("a after b.append:", a)

s = "hi"
t = s
t += "!"
print(s, t, s is t)

def modify(lst):
    lst.append("added")      # changes caller's list

def reassign(lst):
    lst = ["new list"]       # only local name changes

def change_num(n):
    n += 10
    return n

items = ["x"]
modify(items)
reassign(items)
print(items)

num = 5
print(change_num(num), num)

pair = ([1, 2], "fixed")
pair[0].append(3)
print(pair)
try:
    pair[1] = "changed"
except TypeError as e:
    print("TypeError:", e)

try:
    {[1, 2]: "value"}
except TypeError as e:
    print("TypeError:", e)
`,
        },
      },
      result: `True True
True False
a after b.append: [1, 2, 3, 4]
hi hi! False
['x', 'added']
15 5
([1, 2, 3], 'fixed')
TypeError: 'tuple' object does not support item assignment
TypeError: unhashable type: 'list'`,
      explanation: "b = a shares one list, so appending through b also changes a. Strings are immutable: t += '!' makes a new object. modify() changes the list in place, but reassign() only rebinds its local name. Ints are immutable so num stays 5. A tuple cannot change its slots, but a list stored inside it can still change. Lists are unhashable so they cannot be dict keys.",
    },
    {
      title: "Assignment vs Shallow Copy vs Deep Copy",
      scenario: "A school timetable is copied for a new section; changes must not leak into the original.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import copy

original = {"class": "10A", "subjects": ["Maths", "Science"], "teacher": {"name": "Rao"}}

alias = original
shallow = original.copy()          # or copy.copy(original)
deep = copy.deepcopy(original)

original["class"] = "10B"
original["subjects"].append("English")
original["teacher"]["name"] = "Iyer"

print("alias  :", alias)
print("shallow:", shallow)
print("deep   :", deep)
print(shallow["subjects"] is original["subjects"], deep["subjects"] is original["subjects"])

grid_bad = [[0] * 3] * 3
grid_bad[0][0] = 1
print("bad :", grid_bad)

grid_ok = [[0] * 3 for _ in range(3)]
grid_ok[0][0] = 1
print("good:", grid_ok)

nums = [1, 2, 3]
sliced = nums[:]
sliced.append(4)
print(nums, sliced)
`,
      python: {
        files: {
          "main.py": `import copy

original = {"class": "10A", "subjects": ["Maths", "Science"], "teacher": {"name": "Rao"}}

alias = original
shallow = original.copy()          # or copy.copy(original)
deep = copy.deepcopy(original)

original["class"] = "10B"
original["subjects"].append("English")
original["teacher"]["name"] = "Iyer"

print("alias  :", alias)
print("shallow:", shallow)
print("deep   :", deep)
print(shallow["subjects"] is original["subjects"], deep["subjects"] is original["subjects"])

grid_bad = [[0] * 3] * 3
grid_bad[0][0] = 1
print("bad :", grid_bad)

grid_ok = [[0] * 3 for _ in range(3)]
grid_ok[0][0] = 1
print("good:", grid_ok)

nums = [1, 2, 3]
sliced = nums[:]
sliced.append(4)
print(nums, sliced)
`,
        },
      },
      result: `alias  : {'class': '10B', 'subjects': ['Maths', 'Science', 'English'], 'teacher': {'name': 'Iyer'}}
shallow: {'class': '10A', 'subjects': ['Maths', 'Science', 'English'], 'teacher': {'name': 'Iyer'}}
deep   : {'class': '10A', 'subjects': ['Maths', 'Science'], 'teacher': {'name': 'Rao'}}
True False
bad : [[1, 0, 0], [1, 0, 0], [1, 0, 0]]
good: [[1, 0, 0], [0, 0, 0], [0, 0, 0]]
[1, 2, 3] [1, 2, 3, 4]`,
      explanation: "alias is the same object, so it sees every change. The shallow copy has its own top-level dict (class stays 10A) but shares the inner list and dict, so English and Iyer appear. The deep copy is fully independent. [[0]*3]*3 repeats a reference to one inner list, so one change appears in all rows; the comprehension creates separate rows.",
    },
    {
      title: "Reference Counting, gc and weakref",
      scenario: "Observe when objects are destroyed and how the garbage collector cleans reference cycles.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import gc
import sys
import weakref

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None
    def __del__(self):
        print(f"  Node {self.name} destroyed")

print("1) Reference counting")
x = Node("A")
y = x
print("  refs (approx):", sys.getrefcount(x) - 1)
del x
print("  after del x, object still alive via y:", y.name)
del y                                 # count hits 0 -> destroyed now

print("2) Reference cycle")
gc.disable()                          # stop automatic collection for the demo
p, q = Node("P"), Node("Q")
p.partner, q.partner = q, p           # cycle
del p, q
print("  deleted names, but cycle keeps them alive")
found = gc.collect()                  # cyclic GC frees them
print("  gc.collect() found unreachable:", found >= 2)
gc.enable()

print("3) Weak reference")
obj = Node("W")
w = weakref.ref(obj)
print("  weakref alive:", w() is not None, w().name)
del obj
print("  after del:", w())

print("4) GC generations thresholds:", len(gc.get_threshold()))
`,
      python: {
        files: {
          "main.py": `import gc
import sys
import weakref

class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None
    def __del__(self):
        print(f"  Node {self.name} destroyed")

print("1) Reference counting")
x = Node("A")
y = x
print("  refs (approx):", sys.getrefcount(x) - 1)
del x
print("  after del x, object still alive via y:", y.name)
del y                                 # count hits 0 -> destroyed now

print("2) Reference cycle")
gc.disable()                          # stop automatic collection for the demo
p, q = Node("P"), Node("Q")
p.partner, q.partner = q, p           # cycle
del p, q
print("  deleted names, but cycle keeps them alive")
found = gc.collect()                  # cyclic GC frees them
print("  gc.collect() found unreachable:", found >= 2)
gc.enable()

print("3) Weak reference")
obj = Node("W")
w = weakref.ref(obj)
print("  weakref alive:", w() is not None, w().name)
del obj
print("  after del:", w())

print("4) GC generations thresholds:", len(gc.get_threshold()))
`,
        },
      },
      result: `1) Reference counting
  refs (approx): 2
  after del x, object still alive via y: A
  Node A destroyed
2) Reference cycle
  deleted names, but cycle keeps them alive
  Node P destroyed
  Node Q destroyed
  gc.collect() found unreachable: True
3) Weak reference
  weakref alive: True W
  Node W destroyed
  after del: None
4) GC generations thresholds: 3`,
      explanation: "When the last reference (y) is deleted, the count becomes 0 and __del__ runs at once. In a cycle, P and Q reference each other, so deleting the names is not enough; gc.collect() detects the unreachable cycle and frees them. A weak reference does not increase the count, so the object dies on del obj and w() returns None. gc has thresholds for its generations.",
    },
  ],
  interview: [
    {
      q: "Difference between == and is?",
      a: "== compares values (calls __eq__). is compares identity - whether both names point to the same object in memory.",
      level: "Easy",
    },
    {
      q: "Which Python types are mutable and which are immutable?",
      a: "Immutable: int, float, complex, bool, str, tuple, frozenset, bytes, None. Mutable: list, dict, set, bytearray and most user-defined class instances.",
      level: "Easy",
    },
    {
      q: "Is Python call by value or call by reference?",
      a: "Neither exactly - it is call by object reference (call by sharing). The function receives a reference to the same object; mutating it affects the caller, but rebinding the parameter does not.",
      level: "Medium",
    },
    {
      q: "Difference between shallow copy and deep copy?",
      a: "A shallow copy creates a new outer container but shares nested objects. A deep copy (copy.deepcopy) recursively copies nested objects so nothing is shared.",
      level: "Medium",
    },
    {
      q: "How does Python manage memory?",
      a: "CPython uses a private heap, the pymalloc allocator for small objects, reference counting for immediate deallocation, and a generational cyclic garbage collector for reference cycles.",
      level: "Hard",
    },
    {
      q: "What is a reference cycle and how is it freed?",
      a: "Objects that refer to each other, so their counts never drop to zero. The gc module's cyclic collector periodically finds unreachable groups and frees them.",
      level: "Hard",
    },
    {
      q: `What is the output?
a = [[0] * 2] * 2
a[0][0] = 5
print(a)`,
      a: "[[5, 0], [5, 0]] - both rows are the same inner list object.",
      level: "Medium",
    },
    {
      q: `What is the output?
print([x if x % 2 else -x for x in range(4)])`,
      a: "[0, 1, -2, 3] - even numbers are negated (0 stays 0).",
      level: "Medium",
    },
    {
      q: `What is the output?
import copy
a = [1, [2]]
b = copy.copy(a)
b[1].append(3); b[0] = 9
print(a)`,
      a: "[1, [2, 3]] - b[0] = 9 changes only b's slot, but the inner list is shared.",
      level: "Medium",
    },
    {
      q: "What is a weak reference?",
      a: "A reference (weakref module) that does not increase the reference count, so it does not keep the object alive. Used for caches and observer patterns.",
      level: "Hard",
    },
    {
      q: "When should you NOT use a comprehension?",
      a: "When it has side effects only (e.g. printing), needs complex multi-branch logic, or more than two nested loops - a normal loop is more readable.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Using a comprehension, create a dict of numbers 1-10 mapped to 'Fizz', 'Buzz', 'FizzBuzz' or the number.",
      hint: "Use nested conditional expressions.",
      solution: `d = {n: "FizzBuzz" if n % 15 == 0 else "Fizz" if n % 3 == 0 else "Buzz" if n % 5 == 0 else n for n in range(1, 11)}
print(d)
`,
    },
    {
      task: "Flatten [[1, 2], [3], [4, 5, 6]] and keep only odd numbers in one comprehension.",
      hint: "Two for clauses and an if.",
      solution: `data = [[1, 2], [3], [4, 5, 6]]
print([x for sub in data for x in sub if x % 2])   # [1, 3, 5]
`,
    },
    {
      task: "Show that list.copy() is shallow using a list of lists, then fix it with deepcopy.",
      hint: "Mutate an inner list after copying.",
      solution: `import copy
a = [[1], [2]]
s = a.copy(); d = copy.deepcopy(a)
a[0].append(100)
print(s, d)   # [[1, 100], [2]] [[1], [2]]
`,
    },
    {
      task: "Write a function that safely adds an item to a list without changing the caller's list.",
      hint: "Return a new list instead of mutating.",
      solution: `def with_item(lst, item):
    return lst + [item]
orig = [1, 2]
new = with_item(orig, 3)
print(orig, new)   # [1, 2] [1, 2, 3]
`,
    },
    {
      task: "Invert a dictionary {'a': 1, 'b': 2} into {1: 'a', 2: 'b'} with a comprehension.",
      hint: "{v: k for k, v in d.items()}",
      solution: `d = {"a": 1, "b": 2}
print({v: k for k, v in d.items()})
`,
    },
  ],
  quiz: [
    {
      question: "Which of these is immutable?",
      options: [
        "list",
        "dict",
        "tuple",
        "set",
      ],
      answer: 2,
      explanation: "Tuples cannot be changed after creation.",
    },
    {
      question: "After b = a.copy() for a = [[1]], a[0].append(2) makes b equal to:",
      options: [
        "[[1]]",
        "[[1, 2]]",
        "[]",
        "Error",
      ],
      answer: 1,
      explanation: "Shallow copy shares the inner list.",
    },
    {
      question: "Which function makes a fully independent copy of nested data?",
      options: [
        "copy.copy",
        "list()",
        "slicing [:]",
        "copy.deepcopy",
      ],
      answer: 3,
      explanation: "deepcopy copies recursively.",
    },
    {
      question: "What frees objects that are part of a reference cycle?",
      options: [
        "Reference counting",
        "The cyclic garbage collector (gc)",
        "del keyword",
        "They are never freed",
      ],
      answer: 1,
      explanation: "Reference counts never reach zero in a cycle; gc handles it.",
    },
    {
      question: "Output of [i * j for i in range(2) for j in range(2)]?",
      options: [
        "[0, 0, 0, 1]",
        "[0, 1, 0, 1]",
        "[0, 0, 1, 1]",
        "[[0, 0], [0, 1]]",
      ],
      answer: 0,
      explanation: "Pairs (0,0),(0,1),(1,0),(1,1) give 0,0,0,1.",
    },
  ],
};
