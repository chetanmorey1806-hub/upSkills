export default {
  id: "day-13-sets",
  title: "Sets and Set Operations",
  module: "Module 2: Data Structures",
  day: 13,
  level: "Beginner",
  duration: "2 hours",
  summary: "Use sets to store unique items, remove duplicates, test membership very fast, and compare groups of data with union, intersection, difference and symmetric difference. Also meet frozenset.",
  objectives: [
    "Create sets correctly (and know why {} is not an empty set)",
    "Add and remove items with add, update, remove, discard, pop, clear",
    "Perform union, intersection, difference and symmetric difference with operators and methods",
    "Check subset, superset and disjoint relationships",
    "Explain hashing, unordered nature, O(1) membership and frozenset",
  ],
  theory: [
    {
      heading: "What is a set?",
      content: "A set is an unordered collection of UNIQUE, hashable items. Duplicates are removed automatically. Think of the set of students who attended a class: a name either is or is not in the set, and writing the same name twice changes nothing. Sets are implemented as hash tables, so checking \"x in s\" is on average O(1), much faster than a list for large data.",
      syntax: `nums = {3, 1, 2, 3, 1}       # {1, 2, 3}
letters = set("hello")        # {'h', 'e', 'l', 'o'} (order not guaranteed)
from_list = set([1, 1, 2])    # {1, 2}
empty = set()                 # empty set
not_a_set = {}                # this is an empty DICT!
{1, "a", (2, 3)}              # items must be hashable
{[1, 2]}                      # TypeError: unhashable type: 'list'`,
      tip: "Sets have no index: s[0] raises TypeError. If you need order, convert to a sorted list: sorted(s).",
    },
    {
      heading: "Adding and removing items",
      content: "Sets are mutable (the set itself can change), but their items must be immutable. add() inserts one item; update() inserts many from any iterable. remove() raises KeyError if the item is missing, while discard() silently does nothing, which is safer. pop() removes and returns an arbitrary item.",
      syntax: `s = {1, 2}
s.add(3)              # {1, 2, 3}
s.update([4, 5], (6,))# {1, 2, 3, 4, 5, 6}
s.remove(6)           # KeyError if 6 not present
s.discard(100)        # no error
x = s.pop()           # removes some item
s.clear()             # set()
len(s), 3 in s`,
    },
    {
      heading: "Set operations (Venn diagram maths)",
      content: "Set operations compare two groups. Imagine A = students who know Python, B = students who know SQL. Each operation has an operator form (only between sets) and a method form (accepts any iterable). The update versions (|=, &=, -=, ^=) change the set in place.",
      syntax: `A = {1, 2, 3, 4}
B = {3, 4, 5}
A | B   # union:      {1, 2, 3, 4, 5}   A.union(B)          - in A or B
A & B   # intersection: {3, 4}          A.intersection(B)   - in both
A - B   # difference: {1, 2}            A.difference(B)     - in A but not B
B - A   # {5}
A ^ B   # symmetric difference: {1, 2, 5}  A.symmetric_difference(B) - in exactly one

A |= {9}                 # update in place
A.intersection_update(B) # same as A &= B`,
    },
    {
      heading: "Subset, superset and disjoint",
      content: "A is a subset of B when every item of A is also in B. A is a superset of B when it contains all of B. Two sets are disjoint when they share no items. < and > test proper subset/superset (strictly smaller/bigger).",
      syntax: `{1, 2} <= {1, 2, 3}         # True   issubset()
{1, 2, 3} >= {1, 2}         # True   issuperset()
{1, 2} < {1, 2}             # False  (proper subset needs fewer items)
{1, 2}.isdisjoint({3, 4})   # True`,
    },
    {
      heading: "frozenset, set comprehension and when to use sets",
      content: "frozenset is an immutable set: no add/remove, but it is hashable, so it can be a dict key or an item inside another set. Set comprehensions work like list comprehensions with { }. Use sets to remove duplicates, for fast membership tests, and to compare collections. Do not use them when you need order, indexing or duplicates.",
      syntax: `fs = frozenset([1, 2, 3])
fs.add(4)                       # AttributeError
groups = {frozenset({1, 2}), frozenset({3})}
squares = {x * x for x in [-2, -1, 1, 2]}   # {1, 4}
unique_in_order = list(dict.fromkeys(items)) # when order matters`,
      points: [
        "Membership: list O(n) vs set O(1) average",
        "Sets of numbers may look sorted when printed, but order is never guaranteed",
      ],
    },
  ],
  examples: [
    {
      title: "Removing duplicates and fast membership",
      scenario: "An event registration list has repeated phone numbers. Find the unique count and check if someone registered.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `registrations = [9876, 9123, 9876, 9555, 9123, 9000, 9876]
unique = set(registrations)
print("Total entries:", len(registrations))
print("Unique people:", len(unique))
print("Sorted unique:", sorted(unique))
print("9555 registered?", 9555 in unique)
print("1234 registered?", 1234 in unique)

emails = ["a@x.com", "B@x.com", "b@x.com", "a@x.com"]
print("Case-insensitive unique:", sorted({e.lower() for e in emails}))
print("Order kept:", list(dict.fromkeys(registrations)))`,
      python: {
        files: {
          "main.py": `registrations = [9876, 9123, 9876, 9555, 9123, 9000, 9876]
unique = set(registrations)
print("Total entries:", len(registrations))
print("Unique people:", len(unique))
print("Sorted unique:", sorted(unique))
print("9555 registered?", 9555 in unique)
print("1234 registered?", 1234 in unique)

emails = ["a@x.com", "B@x.com", "b@x.com", "a@x.com"]
print("Case-insensitive unique:", sorted({e.lower() for e in emails}))
print("Order kept:", list(dict.fromkeys(registrations)))`,
        },
      },
      result: `Total entries: 7
Unique people: 4
Sorted unique: [9000, 9123, 9555, 9876]
9555 registered? True
1234 registered? False
Case-insensitive unique: ['a@x.com', 'b@x.com']
Order kept: [9876, 9123, 9555, 9000]`,
      explanation: "set() drops duplicates. sorted() turns the set into an ordered list for display. A set comprehension normalizes emails to lowercase before removing duplicates. dict.fromkeys keeps the first-seen order.",
    },
    {
      title: "Adding and removing items safely",
      scenario: "Maintain a set of online users: users log in and log out; handle a user who is not present.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `online = {101, 102}
online.add(103)
online.add(101)
online.update([104, 105])
print("Online:", sorted(online), "| count:", len(online))

online.discard(999)
online.remove(102)
print("After logout of 102:", sorted(online))

try:
    online.remove(999)
except KeyError as e:
    print("KeyError for user", e)

empty_braces = {}
print(type(empty_braces).__name__, type(set()).__name__)
try:
    print({[1, 2]})
except TypeError as e:
    print("TypeError:", e)`,
      python: {
        files: {
          "main.py": `online = {101, 102}
online.add(103)
online.add(101)
online.update([104, 105])
print("Online:", sorted(online), "| count:", len(online))

online.discard(999)
online.remove(102)
print("After logout of 102:", sorted(online))

try:
    online.remove(999)
except KeyError as e:
    print("KeyError for user", e)

empty_braces = {}
print(type(empty_braces).__name__, type(set()).__name__)
try:
    print({[1, 2]})
except TypeError as e:
    print("TypeError:", e)`,
        },
      },
      result: `Online: [101, 102, 103, 104, 105] | count: 5
After logout of 102: [101, 103, 104, 105]
KeyError for user 999
dict set
TypeError: unhashable type: 'list'`,
      explanation: "Adding an existing item (101) has no effect. discard() ignores missing items; remove() raises KeyError. {} creates a dict, so use set() for an empty set. Lists cannot go inside sets because they are unhashable.",
    },
    {
      title: "Set operations: course enrollments",
      scenario: "Compare students enrolled in Python and SQL courses to find who takes both, either, only one, etc.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `python = {"Asha", "Ravi", "Meena", "John"}
sql = {"Ravi", "John", "Priya", "Karan"}

print("Both courses     :", sorted(python & sql))
print("Any course       :", sorted(python | sql))
print("Only Python      :", sorted(python - sql))
print("Only SQL         :", sorted(sql - python))
print("Exactly one      :", sorted(python ^ sql))
print("Method versions  :", sorted(python.intersection(["Asha", "Zara"])))

python |= {"Zara"}
print("Python after |= :", sorted(python))`,
      python: {
        files: {
          "main.py": `python = {"Asha", "Ravi", "Meena", "John"}
sql = {"Ravi", "John", "Priya", "Karan"}

print("Both courses     :", sorted(python & sql))
print("Any course       :", sorted(python | sql))
print("Only Python      :", sorted(python - sql))
print("Only SQL         :", sorted(sql - python))
print("Exactly one      :", sorted(python ^ sql))
print("Method versions  :", sorted(python.intersection(["Asha", "Zara"])))

python |= {"Zara"}
print("Python after |= :", sorted(python))`,
        },
      },
      result: `Both courses     : ['John', 'Ravi']
Any course       : ['Asha', 'John', 'Karan', 'Meena', 'Priya', 'Ravi']
Only Python      : ['Asha', 'Meena']
Only SQL         : ['Karan', 'Priya']
Exactly one      : ['Asha', 'Karan', 'Meena', 'Priya']
Method versions  : ['Asha']
Python after |= : ['Asha', 'John', 'Meena', 'Ravi', 'Zara']`,
      explanation: "& gives common students, | combines everybody, - keeps only those in the first set, ^ gives students in exactly one course. Method forms accept any iterable (here a list). We use sorted() because the printing order of a string set can change between runs.",
    },
    {
      title: "Subset, superset, disjoint: skill matching",
      scenario: "A job needs certain skills. Check whether candidates qualify and which skills they are missing.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `required = {"python", "sql", "git"}
candidates = {
    "Asha": {"python", "sql", "git", "django"},
    "Ravi": {"python", "excel"},
    "Meena": {"java", "spring"},
}
for name, skills in candidates.items():
    if required <= skills:
        status = "qualified"
    elif required.isdisjoint(skills):
        status = "no matching skills"
    else:
        status = "missing " + ", ".join(sorted(required - skills))
    print(f"{name:<6}: {status}")

print({1, 2} < {1, 2, 3}, {1, 2} < {1, 2}, {1, 2, 3}.issuperset([1, 3]))`,
      python: {
        files: {
          "main.py": `required = {"python", "sql", "git"}
candidates = {
    "Asha": {"python", "sql", "git", "django"},
    "Ravi": {"python", "excel"},
    "Meena": {"java", "spring"},
}
for name, skills in candidates.items():
    if required <= skills:
        status = "qualified"
    elif required.isdisjoint(skills):
        status = "no matching skills"
    else:
        status = "missing " + ", ".join(sorted(required - skills))
    print(f"{name:<6}: {status}")

print({1, 2} < {1, 2, 3}, {1, 2} < {1, 2}, {1, 2, 3}.issuperset([1, 3]))`,
        },
      },
      result: `Asha  : qualified
Ravi  : missing git, sql
Meena : no matching skills
True False True`,
      explanation: "required <= skills means every required skill is present (subset). isdisjoint() is True when nothing matches. required - skills lists what is missing. < is a proper subset, so a set is not a proper subset of itself.",
    },
    {
      title: "frozenset and performance of membership",
      scenario: "Use frozensets as dictionary keys for pairs that have no order, and measure list vs set lookup speed.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import time

friend_since = {
    frozenset({"Asha", "Ravi"}): 2019,
    frozenset({"Ravi", "Meena"}): 2022,
}
print("Ravi & Asha friends since:", friend_since[frozenset({"Ravi", "Asha"})])

fs = frozenset([3, 1, 2])
try:
    fs.add(4)
except AttributeError as e:
    print("AttributeError:", e)

data_list = list(range(200_000))
data_set = set(data_list)
start = time.perf_counter()
for _ in range(200):
    199_999 in data_list
list_time = time.perf_counter() - start
start = time.perf_counter()
for _ in range(200):
    199_999 in data_set
set_time = time.perf_counter() - start
print("Set lookup faster than list:", set_time < list_time)`,
      python: {
        files: {
          "main.py": `import time

friend_since = {
    frozenset({"Asha", "Ravi"}): 2019,
    frozenset({"Ravi", "Meena"}): 2022,
}
print("Ravi & Asha friends since:", friend_since[frozenset({"Ravi", "Asha"})])

fs = frozenset([3, 1, 2])
try:
    fs.add(4)
except AttributeError as e:
    print("AttributeError:", e)

data_list = list(range(200_000))
data_set = set(data_list)
start = time.perf_counter()
for _ in range(200):
    199_999 in data_list
list_time = time.perf_counter() - start
start = time.perf_counter()
for _ in range(200):
    199_999 in data_set
set_time = time.perf_counter() - start
print("Set lookup faster than list:", set_time < list_time)`,
        },
      },
      result: `Ravi & Asha friends since: 2019
AttributeError: 'frozenset' object has no attribute 'add'
Set lookup faster than list: True`,
      explanation: "A frozenset is hashable, so {\"Asha\",\"Ravi\"} and {\"Ravi\",\"Asha\"} give the same key regardless of order. It has no add(). Looking up the last item in a list scans all 200,000 items each time, while the set jumps straight to it using hashing.",
    },
  ],
  interview: [
    {
      q: "What is a set in Python?",
      a: "An unordered, mutable collection of unique, hashable elements implemented as a hash table. Supports fast membership tests and mathematical set operations.",
      level: "Easy",
    },
    {
      q: "How do you create an empty set?",
      a: "set(). {} creates an empty dictionary.",
      level: "Easy",
    },
    {
      q: "Difference between remove() and discard()?",
      a: "remove(x) raises KeyError if x is absent; discard(x) does nothing if x is absent.",
      level: "Easy",
    },
    {
      q: "What is the output of print(len({1, 1.0, True}))?",
      a: "1. 1, 1.0 and True are equal and have the same hash, so the set keeps only the first one (1).",
      level: "Hard",
    },
    {
      q: "What is the output of print({1, 2, 3} ^ {2, 3, 4})?",
      a: "{1, 4} (symmetric difference: items in exactly one set).",
      level: "Medium",
    },
    {
      q: "Why can a list not be an element of a set?",
      a: "Set elements must be hashable (their hash cannot change). Lists are mutable and therefore unhashable. Use a tuple or frozenset instead.",
      level: "Medium",
    },
    {
      q: "What is a frozenset?",
      a: "An immutable, hashable version of set. It supports set operations but no add/remove, and it can be used as a dict key or inside another set.",
      level: "Medium",
    },
    {
      q: "What is the time complexity of x in set vs x in list?",
      a: "Set: O(1) average using hashing. List: O(n) linear scan.",
      level: "Medium",
    },
    {
      q: "Does a set maintain insertion order?",
      a: "No. Sets are unordered; printing order is an implementation detail and can vary (especially for strings due to hash randomization). Dicts, however, keep insertion order since Python 3.7.",
      level: "Medium",
    },
    {
      q: "Difference between A.union(B) and A | B?",
      a: "Same result, but the method accepts any iterable (list, tuple), while | requires both operands to be sets.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Find the common elements of three lists using sets.",
      hint: "set(a) & set(b) & set(c)",
      solution: `a, b, c = [1, 2, 3, 4], [2, 3, 5], [3, 2, 9]
print(sorted(set(a) & set(b) & set(c)))   # [2, 3]`,
    },
    {
      task: "Check whether a sentence is a pangram (contains every letter a-z).",
      hint: "set of letters >= set(\"abcdefghijklmnopqrstuvwxyz\")",
      solution: `import string
s = "The quick brown fox jumps over the lazy dog"
print(set(s.lower()) >= set(string.ascii_lowercase))`,
    },
    {
      task: "Given two lists of roll numbers (present today, present yesterday), print who was absent today but present yesterday.",
      hint: "yesterday - today",
      solution: `today = [1, 2, 4, 5]
yesterday = [1, 2, 3, 5, 6]
print(sorted(set(yesterday) - set(today)))   # [3, 6]`,
    },
    {
      task: "Count unique words in a paragraph ignoring case and punctuation.",
      hint: "strip(\".,!?\") each word and lowercase",
      solution: `text = "Python is great. Python is easy, and python is fun!"
words = {w.strip(".,!?").lower() for w in text.split()}
print(len(words), sorted(words))`,
    },
  ],
  quiz: [
    {
      question: "What is type({})?",
      options: [
        "set",
        "dict",
        "frozenset",
        "tuple",
      ],
      answer: 1,
      explanation: "{} is an empty dict; use set() for an empty set.",
    },
    {
      question: "What does {1, 2, 3} - {2, 5} return?",
      options: [
        "{1, 3}",
        "{5}",
        "{1, 3, 5}",
        "{2}",
      ],
      answer: 0,
      explanation: "Items in the first set but not in the second.",
    },
    {
      question: "Which operation returns items common to both sets?",
      options: [
        "|",
        "^",
        "-",
        "&",
      ],
      answer: 3,
      explanation: "& is intersection.",
    },
    {
      question: "Which of these can be a set element?",
      options: [
        "[1, 2]",
        "{1: 2}",
        "(1, 2)",
        "{1, 2}",
      ],
      answer: 2,
      explanation: "Tuples of immutables are hashable.",
    },
    {
      question: "What is len(set(\"banana\"))?",
      options: [
        "6",
        "3",
        "2",
        "1",
      ],
      answer: 1,
      explanation: "Unique letters: b, a, n.",
    },
  ],
};
