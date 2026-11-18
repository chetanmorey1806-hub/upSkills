export default {
  id: "extra-03-unpacking-pythonic-idioms",
  title: "Unpacking, Star Expressions, Chained Comparisons and Pythonic Idioms",
  module: "Module 1: Modern Python Syntax",
  extraNo: 3,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Write code the way experienced Python developers do: tuple and star unpacking, * and ** in calls and literals, chained comparisons, conditional expressions, truthiness, enumerate/zip, dict and set idioms, EAFP vs LBYL and context managers. These idioms appear constantly in code reviews and interviews.",
  objectives: [
    "Unpack tuples, lists and nested structures, including star (*rest) unpacking",
    "Use * and ** to spread iterables and dicts in calls, lists and dict literals",
    "Write chained comparisons and conditional (ternary) expressions correctly",
    "Apply idioms: enumerate, zip, any/all, dict.get, setdefault, swapping, truthiness",
    "Explain EAFP vs LBYL and when each style fits",
  ],
  theory: [
    {
      heading: "Tuple Unpacking and Swapping",
      content: `Unpacking assigns the items of any iterable to several variables in one line: \`name, age = ("Asha", 25)\`. The number of variables must equal the number of items, otherwise you get \`ValueError: too many values to unpack\` or \`not enough values to unpack\`.

Unpacking works with any iterable (list, tuple, string, dict keys, generator) and can be nested: \`(a, b), c = (1, 2), 3\`. Swapping two variables needs no temporary variable: \`a, b = b, a\` - Python builds the tuple on the right first, then unpacks it.`,
      syntax: `x, y = 10, 20
x, y = y, x              # swap
first, second = "AB"     # first='A', second='B'
(lat, lon), city = (19.07, 72.87), "Mumbai"
for key, value in {"a": 1}.items():   # unpacking in loops
    ...
`,
    },
    {
      heading: "Star Expressions: *rest Unpacking",
      content: `PEP 3132 lets one variable collect 'everything else' with a star. \`first, *middle, last = [1, 2, 3, 4, 5]\` gives first=1, middle=[2, 3, 4], last=5. The starred variable is always a **list** (even if empty) and only one star is allowed per assignment.

Use \`_\` for values you want to ignore: \`name, *_ = record\` or \`*_, last = items\`.`,
      points: [
        "`head, *tail = [1]` gives head=1, tail=[]",
        "`a, *b, c = [1]` raises ValueError (needs at least 2 items)",
        "Star unpacking also works in for loops: `for name, *scores in rows:`",
      ],
    },
    {
      heading: "* and ** in Calls and Literals",
      content: "In a function call, `*iterable` spreads items as positional arguments and `**mapping` spreads key-value pairs as keyword arguments. Since Python 3.5 (PEP 448) you can also use them inside literals to merge collections: `[*a, *b]`, `{*s1, *s2}`, `{**d1, **d2}` (later keys win). Python 3.9 also added the `|` operator for dicts: `d1 | d2`.",
      syntax: `def order(item, qty, price):
    return qty * price

args = ["pen", 3, 10]
kwargs = {"item": "book", "qty": 2, "price": 250}
order(*args)        # 30
order(**kwargs)     # 500

defaults = {"theme": "light", "lang": "en"}
user = {"lang": "hi"}
config = {**defaults, **user}   # {'theme': 'light', 'lang': 'hi'}
`,
    },
    {
      heading: "Chained Comparisons and Conditional Expressions",
      content: `Python allows \`a < b < c\`, which means \`a < b and b < c\`, but \`b\` is evaluated only once. This reads like maths: \`if 18 <= age < 60:\`. Any comparison operators can be chained, including \`==\`, \`is\` and \`in\`, which can surprise people: \`1 == 1 in [1]\` means \`(1 == 1) and (1 in [1])\`.

The **conditional expression** (ternary) is \`value_if_true if condition else value_if_false\`. It is an expression, so it can be used in assignments, returns, f-strings and comprehensions. Avoid nesting more than one level - it hurts readability.`,
      syntax: `grade = "Pass" if marks >= 35 else "Fail"
status = "teen" if 13 <= age <= 19 else "adult" if age > 19 else "child"
`,
      tip: "`x == a or b` does NOT mean x equals a or b. It is `(x == a) or b`, which is always truthy if b is truthy. Use `x in (a, b)`.",
    },
    {
      heading: "Truthiness and Short-Circuit Tricks",
      content: `Every object has a truth value. Falsy values: \`None\`, \`False\`, \`0\`, \`0.0\`, \`''\`, \`[]\`, \`{}\`, \`set()\`, \`range(0)\`. Everything else is truthy (custom classes can define \`__bool__\` or \`__len__\`). So write \`if items:\` instead of \`if len(items) > 0:\`.

\`and\`/\`or\` return one of their operands, not just True/False: \`name = user_input or "Guest"\` gives a default when the input is empty. Be careful: \`0\` and \`''\` are also falsy, so \`count = value or 10\` replaces a valid 0 with 10. Use \`value if value is not None else 10\` when 0 is valid.`,
      points: [
        "Compare with None using `is None` / `is not None`, never `== None`",
        "Do not write `if flag == True:` - write `if flag:`",
        "`any(iterable)` / `all(iterable)` short-circuit and accept generator expressions",
      ],
    },
    {
      heading: "Everyday Pythonic Idioms",
      content: `Pythonic code uses the built-ins instead of index-based loops. Prefer \`for i, x in enumerate(items, start=1)\` over \`range(len(items))\`, \`zip(a, b)\` to walk lists together (\`zip(..., strict=True)\` in 3.10+ raises if lengths differ), \`dict.get(key, default)\` and \`dict.setdefault\`, \`sorted(data, key=...)\`, \`''.join(parts)\` for building strings, and comprehensions for building lists, dicts and sets.

**EAFP** (Easier to Ask Forgiveness than Permission) means trying the operation and catching exceptions; **LBYL** (Look Before You Leap) means checking first. Python usually favours EAFP: \`try: value = d[key] except KeyError: ...\`, which also avoids race conditions (e.g. a file deleted between the check and the open).`,
      points: [
        "Use `with open(...) as f:` - context managers close resources automatically",
        "Use `if x in set_or_dict:` for O(1) membership tests",
        "Use `for ... else` - the else runs only if the loop did not break",
        "`a, b = divmod(n, 10)` returns quotient and remainder together",
      ],
    },
  ],
  examples: [
    {
      title: "Parsing Records with Star Unpacking",
      scenario: "A school file has rows of student name followed by a variable number of test scores. We need the first and last test plus the average.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `rows = [
    ("Asha", 78, 85, 91, 88),
    ("Ravi", 65, 70),
    ("Meena", 90),
]

for name, *scores in rows:
    first, *_, last = scores if len(scores) > 1 else scores * 2
    avg = sum(scores) / len(scores)
    print(f"{name:<6} tests={len(scores)} first={first} last={last} avg={avg:.1f}")

head, *tail = [42]
print(head, tail)
(a, b), c = (1, 2), 3
print(a, b, c)
x, y = 5, 9
x, y = y, x
print("swapped:", x, y)
`,
      python: {
        files: {
          "main.py": `rows = [
    ("Asha", 78, 85, 91, 88),
    ("Ravi", 65, 70),
    ("Meena", 90),
]

for name, *scores in rows:
    first, *_, last = scores if len(scores) > 1 else scores * 2
    avg = sum(scores) / len(scores)
    print(f"{name:<6} tests={len(scores)} first={first} last={last} avg={avg:.1f}")

head, *tail = [42]
print(head, tail)
(a, b), c = (1, 2), 3
print(a, b, c)
x, y = 5, 9
x, y = y, x
print("swapped:", x, y)
`,
        },
      },
      result: `Asha   tests=4 first=78 last=88 avg=85.5
Ravi   tests=2 first=65 last=70 avg=67.5
Meena  tests=1 first=90 last=90 avg=90.0
42 []
1 2 3
swapped: 9 5`,
      explanation: "`name, *scores` puts all remaining items in a list. For a single score we duplicate the list so first/last still unpack. `*_` ignores the middle. Nested unpacking matches the structure of the right-hand side.",
    },
    {
      title: "Spreading Arguments and Merging Configs",
      scenario: "A web app merges default settings, environment settings and user settings, then passes them to a function.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `def connect(host, port, user="root", timeout=5):
    return f"{user}@{host}:{port} (timeout={timeout}s)"

defaults = {"host": "localhost", "port": 5432, "timeout": 5}
env = {"host": "db.prod.internal"}
user = {"user": "app", "timeout": 30}

config = {**defaults, **env, **user}
print(config)
print(connect(**config))

point = (10, 20)
print("Point:", *point)
print(connect(*("127.0.0.1", 3306)))

evens, odds = [2, 4], [1, 3]
print([*evens, *odds, 99])
print({*evens, *[4, 6]})
print(defaults | user)
`,
      python: {
        files: {
          "main.py": `def connect(host, port, user="root", timeout=5):
    return f"{user}@{host}:{port} (timeout={timeout}s)"

defaults = {"host": "localhost", "port": 5432, "timeout": 5}
env = {"host": "db.prod.internal"}
user = {"user": "app", "timeout": 30}

config = {**defaults, **env, **user}
print(config)
print(connect(**config))

point = (10, 20)
print("Point:", *point)
print(connect(*("127.0.0.1", 3306)))

evens, odds = [2, 4], [1, 3]
print([*evens, *odds, 99])
print({*evens, *[4, 6]})
print(defaults | user)
`,
        },
      },
      result: `{'host': 'db.prod.internal', 'port': 5432, 'timeout': 30, 'user': 'app'}
app@db.prod.internal:5432 (timeout=30s)
Point: 10 20
root@127.0.0.1:3306 (timeout=5s)
[2, 4, 1, 3, 99]
{2, 4, 6}
{'host': 'localhost', 'port': 5432, 'timeout': 30, 'user': 'app'}`,
      explanation: "`{**a, **b}` merges dicts; later dicts override earlier keys. `connect(**config)` maps keys to parameter names. `print(*point)` passes items as separate arguments. `*` inside list/set literals concatenates iterables. `|` merges dicts (3.9+).",
    },
    {
      title: "Chained Comparisons, Ternary and Truthiness",
      scenario: "An insurance form categorises applicants by age and handles empty input with defaults.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `def category(age):
    if not 0 <= age <= 120:
        return "invalid"
    return "minor" if age < 18 else "senior" if age >= 60 else "adult"

for age in [5, 18, 45, 60, 130, -1]:
    print(age, category(age))

name = "" or "Guest"
print("Hello,", name)

discount = 0
print("Wrong default:", discount or 10)
print("Right default:", discount if discount is not None else 10)

print(1 < 3 > 2, 1 == 1 in [1], "a" < "b" < "c")
x = 7
print(x == 3 or 4)    # common bug
print(x in (3, 4))    # correct
`,
      python: {
        files: {
          "main.py": `def category(age):
    if not 0 <= age <= 120:
        return "invalid"
    return "minor" if age < 18 else "senior" if age >= 60 else "adult"

for age in [5, 18, 45, 60, 130, -1]:
    print(age, category(age))

name = "" or "Guest"
print("Hello,", name)

discount = 0
print("Wrong default:", discount or 10)
print("Right default:", discount if discount is not None else 10)

print(1 < 3 > 2, 1 == 1 in [1], "a" < "b" < "c")
x = 7
print(x == 3 or 4)    # common bug
print(x in (3, 4))    # correct
`,
        },
      },
      result: `5 minor
18 adult
45 adult
60 senior
130 invalid
-1 invalid
Hello, Guest
Wrong default: 10
Right default: 0
True True True
4
False`,
      explanation: "`0 <= age <= 120` is a chained comparison. The nested ternary picks one of three labels. `or` returns the first truthy operand, which wrongly replaces a valid 0. `x == 3 or 4` evaluates to 4 (truthy) - a classic bug; `in` is the right test.",
    },
    {
      title: "enumerate, zip, any/all and for-else",
      scenario: "An exam system ranks students, pairs names with marks and checks if anyone failed.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `names = ["Asha", "Ravi", "Meena"]
marks = [91, 34, 78]

for rank, (name, mark) in enumerate(sorted(zip(names, marks), key=lambda p: p[1], reverse=True), start=1):
    print(f"#{rank} {name}: {mark}")

print("Anyone failed?", any(m < 35 for m in marks))
print("All passed?", all(m >= 35 for m in marks))

report = dict(zip(names, marks))
print(report)

for name, mark in report.items():
    if mark < 35:
        print("First failure:", name)
        break
else:
    print("No failures")

try:
    list(zip(names, [1, 2], strict=True))
except ValueError as e:
    print("Error:", e)
`,
      python: {
        files: {
          "main.py": `names = ["Asha", "Ravi", "Meena"]
marks = [91, 34, 78]

for rank, (name, mark) in enumerate(sorted(zip(names, marks), key=lambda p: p[1], reverse=True), start=1):
    print(f"#{rank} {name}: {mark}")

print("Anyone failed?", any(m < 35 for m in marks))
print("All passed?", all(m >= 35 for m in marks))

report = dict(zip(names, marks))
print(report)

for name, mark in report.items():
    if mark < 35:
        print("First failure:", name)
        break
else:
    print("No failures")

try:
    list(zip(names, [1, 2], strict=True))
except ValueError as e:
    print("Error:", e)
`,
        },
      },
      result: `#1 Asha: 91
#2 Meena: 78
#3 Ravi: 34
Anyone failed? True
All passed? False
{'Asha': 91, 'Ravi': 34, 'Meena': 78}
First failure: Ravi
Error: zip() argument 2 is shorter than argument 1`,
      explanation: "zip pairs items, sorted ranks them by mark, and enumerate adds a rank starting at 1. any/all short-circuit with generator expressions. The loop's else would run only if no break happened. `strict=True` catches length mismatches.",
    },
    {
      title: "EAFP vs LBYL and Dict Idioms",
      scenario: "Count product views and safely read a nested config value.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `views = ["pen", "book", "pen", "bag", "pen", "book"]

counts = {}
for item in views:
    counts[item] = counts.get(item, 0) + 1
print(counts)

groups = {}
for word in ["apple", "avocado", "banana", "blueberry", "cherry"]:
    groups.setdefault(word[0], []).append(word)
print(groups)

config = {"db": {"host": "localhost"}}

# LBYL
if "db" in config and "port" in config["db"]:
    port = config["db"]["port"]
else:
    port = 5432
print("LBYL port:", port)

# EAFP
try:
    port = config["db"]["port"]
except KeyError:
    port = 5432
print("EAFP port:", port)

squares = {n: n * n for n in range(1, 6) if n % 2}
print(squares)
print(", ".join(sorted(counts, key=counts.get, reverse=True)))
`,
      python: {
        files: {
          "main.py": `views = ["pen", "book", "pen", "bag", "pen", "book"]

counts = {}
for item in views:
    counts[item] = counts.get(item, 0) + 1
print(counts)

groups = {}
for word in ["apple", "avocado", "banana", "blueberry", "cherry"]:
    groups.setdefault(word[0], []).append(word)
print(groups)

config = {"db": {"host": "localhost"}}

# LBYL
if "db" in config and "port" in config["db"]:
    port = config["db"]["port"]
else:
    port = 5432
print("LBYL port:", port)

# EAFP
try:
    port = config["db"]["port"]
except KeyError:
    port = 5432
print("EAFP port:", port)

squares = {n: n * n for n in range(1, 6) if n % 2}
print(squares)
print(", ".join(sorted(counts, key=counts.get, reverse=True)))
`,
        },
      },
      result: `{'pen': 3, 'book': 2, 'bag': 1}
{'a': ['apple', 'avocado'], 'b': ['banana', 'blueberry'], 'c': ['cherry']}
LBYL port: 5432
EAFP port: 5432
{1: 1, 3: 9, 5: 25}
pen, book, bag`,
      explanation: "`dict.get(key, 0)` avoids KeyError when counting. `setdefault` creates the list the first time a key is seen. LBYL checks keys first; EAFP just tries and handles KeyError. A dict comprehension builds the squares mapping. sorted with `key=counts.get` orders by count.",
    },
  ],
  interview: [
    {
      q: "How do you swap two variables in Python?",
      a: "`a, b = b, a`. The right side creates a tuple (b, a) first, then it is unpacked into a and b. No temporary variable is needed.",
      level: "Easy",
    },
    {
      q: "What does `first, *rest = [10, 20, 30]` give?",
      a: "first = 10 and rest = [20, 30]. The starred target always receives a list, even if it is empty or the source was a tuple.",
      level: "Easy",
    },
    {
      q: "What is the difference between *args in a function definition and * in a function call?",
      a: "In a definition, `*args` packs extra positional arguments into a tuple. In a call, `*iterable` unpacks an iterable into separate positional arguments. Similarly `**kwargs` packs keyword arguments into a dict and `**dict` in a call unpacks a dict into keyword arguments.",
      level: "Medium",
    },
    {
      q: "How do you merge two dictionaries?",
      a: "`{**d1, **d2}` (3.5+), `d1 | d2` (3.9+), or `d1.update(d2)` to modify d1 in place. In all cases, keys from d2 override keys from d1.",
      level: "Easy",
    },
    {
      q: "What does `1 < x < 10` mean in Python, and how is it different from C?",
      a: "It is a chained comparison meaning `1 < x and x < 10`, with x evaluated once. In C, `1 < x < 10` evaluates `(1 < x)` to 0 or 1 and then compares that with 10, which is almost always true - a bug.",
      level: "Medium",
    },
    {
      q: "Why is `if x == 'a' or 'b':` always true?",
      a: "It parses as `(x == 'a') or 'b'`. If the first part is False, the expression returns 'b', which is a non-empty (truthy) string. Use `if x in ('a', 'b'):`.",
      level: "Easy",
    },
    {
      q: "What values are falsy in Python?",
      a: "None, False, zero of any numeric type (0, 0.0, 0j, Decimal(0)), empty sequences and collections ('', [], (), {}, set(), range(0)), and objects whose `__bool__` returns False or `__len__` returns 0.",
      level: "Easy",
    },
    {
      q: "What do `and` and `or` return?",
      a: "They return one of the operands, not necessarily a bool. `a or b` returns a if a is truthy else b. `a and b` returns a if a is falsy else b. Both short-circuit, so the second operand may never be evaluated.",
      level: "Medium",
    },
    {
      q: "What is EAFP and LBYL? Which is more Pythonic?",
      a: "LBYL = Look Before You Leap (check conditions first, e.g. `if key in d`). EAFP = Easier to Ask Forgiveness than Permission (try the operation and catch exceptions). EAFP is generally considered more Pythonic, avoids double lookups and race conditions (like checking a file exists then it gets deleted), but LBYL is fine when failure is common and checks are cheap.",
      level: "Medium",
    },
    {
      q: "What does the else clause of a for loop do?",
      a: "It runs when the loop finishes normally (iterates through everything) without hitting `break`. It is useful for search loops: break when found, else-block handles 'not found'.",
      level: "Medium",
    },
    {
      q: "Why use enumerate instead of range(len(seq))?",
      a: "enumerate gives index and item together, is more readable, works with any iterable (not only sequences with len), and avoids indexing errors. `enumerate(seq, start=1)` changes the starting number.",
      level: "Easy",
    },
    {
      q: "What happens with zip when lists have different lengths, and how can you detect it?",
      a: "zip stops at the shortest iterable and silently drops extra items. Use `zip(a, b, strict=True)` (3.10+) to raise ValueError on mismatch, or `itertools.zip_longest` to pad missing values with a fillvalue.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Given `data = [('2025-01-05', 'Pen', 10, 3), ('2025-01-06', 'Book', 250, 1)]`, loop with unpacking (ignore the date with _) and print the total for each row as 'Pen: 30'.",
      hint: "for _, item, price, qty in data:",
      solution: `data = [("2025-01-05", "Pen", 10, 3), ("2025-01-06", "Book", 250, 1)]
for _, item, price, qty in data:
    print(f"{item}: {price * qty}")
`,
    },
    {
      task: "Write a function `stats(*nums)` that returns min, max and average, then call it by spreading a list `marks = [55, 78, 90, 66]` and unpack the result into three variables.",
      hint: "low, high, avg = stats(*marks)",
      solution: `def stats(*nums):
    return min(nums), max(nums), sum(nums) / len(nums)

marks = [55, 78, 90, 66]
low, high, avg = stats(*marks)
print(low, high, avg)
`,
    },
    {
      task: "Write `classify_temp(t)` using a chained comparison and a conditional expression: below 15 'Cold', 15-30 inclusive 'Pleasant', above 30 'Hot'. Test with 10, 15, 30, 31.",
      hint: "return 'Pleasant' if 15 <= t <= 30 else 'Cold' if t < 15 else 'Hot'",
      solution: `def classify_temp(t):
    return "Pleasant" if 15 <= t <= 30 else "Cold" if t < 15 else "Hot"

for t in (10, 15, 30, 31):
    print(t, classify_temp(t))
`,
    },
    {
      task: "Group a list of employee tuples `[('IT', 'Asha'), ('HR', 'Ravi'), ('IT', 'John')]` into a dict of lists using setdefault, then print departments sorted by number of employees (descending).",
      hint: "groups.setdefault(dept, []).append(name); sorted(groups, key=lambda d: len(groups[d]), reverse=True)",
      solution: `emps = [("IT", "Asha"), ("HR", "Ravi"), ("IT", "John")]
groups = {}
for dept, name in emps:
    groups.setdefault(dept, []).append(name)
print(groups)
for dept in sorted(groups, key=lambda d: len(groups[d]), reverse=True):
    print(dept, len(groups[dept]))
`,
    },
    {
      task: "Using EAFP, write `to_int(value, default=0)` that converts strings like '42', ' 7 ', 'abc' and None to int, returning the default when conversion fails.",
      hint: "Catch both ValueError and TypeError.",
      solution: `def to_int(value, default=0):
    try:
        return int(value)
    except (ValueError, TypeError):
        return default

for v in ["42", " 7 ", "abc", None]:
    print(repr(v), "->", to_int(v))
`,
    },
  ],
  quiz: [
    {
      question: "What is `middle` after `a, *middle, b = (1, 2, 3, 4)`?",
      options: [
        "(2, 3)",
        "[2, 3]",
        "2",
        "[1, 2, 3]",
      ],
      answer: 1,
      explanation: "Starred targets always collect items into a list.",
    },
    {
      question: "What is `{**{'a': 1, 'b': 2}, **{'b': 3}}`?",
      options: [
        "{'a': 1, 'b': 2}",
        "{'a': 1, 'b': 3}",
        "{'a': 1, 'b': [2, 3]}",
        "TypeError",
      ],
      answer: 1,
      explanation: "Later unpacked dicts override earlier keys.",
    },
    {
      question: "What does `print(0 or 'default')` print?",
      options: [
        "0",
        "False",
        "default",
        "None",
      ],
      answer: 2,
      explanation: "0 is falsy so `or` returns the second operand.",
    },
    {
      question: "`5 > 3 > 1` evaluates to...",
      options: [
        "True",
        "False",
        "TypeError",
        "1",
      ],
      answer: 0,
      explanation: "It means 5 > 3 and 3 > 1, both true.",
    },
    {
      question: "When does the else block of a for loop run?",
      options: [
        "When the loop body raises an error",
        "Always after the loop",
        "Only when the loop was not exited via break",
        "Only when the iterable is empty",
      ],
      answer: 2,
      explanation: "for-else runs when the loop finishes without break (including when it is empty).",
    },
    {
      question: "Which is the most Pythonic way to check that a list `items` is not empty?",
      options: [
        "if len(items) != 0:",
        "if items != []:",
        "if items:",
        "if not items == None:",
      ],
      answer: 2,
      explanation: "Empty lists are falsy, so `if items:` is clean and idiomatic.",
    },
  ],
};
