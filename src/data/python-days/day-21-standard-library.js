export default {
  id: "day-21-standard-library",
  title: "Standard Library Tour: math, random, datetime, os, sys, collections, itertools",
  module: "Module 3: Functions & Modules",
  day: 21,
  level: "Intermediate",
  duration: "2.5 hours",
  summary: "Explore the \"batteries included\" standard library: maths with math, randomness with random, dates with datetime, files and paths with os, interpreter info with sys, smart containers with collections and powerful looping tools with itertools.",
  objectives: [
    "Use common math functions and constants",
    "Generate reproducible random data with random.seed",
    "Create, format, parse and subtract dates with datetime and timedelta",
    "Work with paths, folders and environment variables using os, and read sys.argv / sys.path",
    "Use Counter, defaultdict, namedtuple, deque and itertools helpers",
  ],
  theory: [
    {
      heading: "math and random",
      content: "math gives mathematical functions: sqrt, pow, floor, ceil, factorial, gcd, isclose and constants pi, e, inf. random gives pseudo-random numbers for games, sampling and test data. random.seed(n) makes the sequence repeatable, which is great for testing. For passwords and tokens use the secrets module instead of random.",
      syntax: `import math, random
math.sqrt(25); math.ceil(4.1); math.factorial(5)
random.seed(42)
random.randint(1, 6); random.choice(items); random.shuffle(items)
random.sample(items, 3); random.random()
`,
    },
    {
      heading: "datetime",
      content: "The datetime module has date (year, month, day), time, datetime (both) and timedelta (a duration). strftime formats a date into text (\"%d-%m-%Y\"), strptime parses text into a datetime. Subtracting two dates gives a timedelta. Analogy: datetime is a calendar plus a clock; timedelta is a stopwatch reading.",
      syntax: `from datetime import date, datetime, timedelta
today = date.today()
d = datetime(2025, 1, 26, 10, 30)
d.strftime("%d %b %Y, %I:%M %p")
datetime.strptime("15-08-2025", "%d-%m-%Y")
d + timedelta(days=30)
`,
      points: [
        "%Y year, %m month, %d day, %H 24-hour, %I 12-hour, %M minute, %S second, %A weekday name, %b short month name",
      ],
    },
    {
      heading: "os and sys",
      content: "os talks to the operating system: current folder (os.getcwd), listing files (os.listdir), creating folders (os.makedirs), joining paths safely (os.path.join), checking existence (os.path.exists) and reading environment variables (os.environ.get). sys talks to the Python interpreter: sys.argv (command-line arguments), sys.path (module search path), sys.version, sys.exit().",
      tip: "Use os.path.join or pathlib.Path instead of building paths with \"+\" and \"/\" so code works on Windows and Linux.",
    },
    {
      heading: "collections",
      content: "collections offers specialised containers. Counter counts things (word frequency, votes). defaultdict creates a default value for missing keys (great for grouping). namedtuple creates lightweight tuple classes with named fields. deque is a double-ended queue with fast append/pop from both ends. OrderedDict remembers order and has move_to_end (normal dicts also keep insertion order since 3.7).",
      syntax: `from collections import Counter, defaultdict, namedtuple, deque
Counter("banana").most_common(1)    # [('a', 3)]
groups = defaultdict(list)
Point = namedtuple("Point", "x y")
q = deque([1, 2]); q.appendleft(0)
`,
    },
    {
      heading: "itertools",
      content: "itertools provides fast, memory-efficient iterator building blocks: count, cycle, repeat (infinite), chain (join iterables), islice (slice any iterator), product (nested loops), permutations, combinations, accumulate (running totals) and groupby (group consecutive items - sort first!).",
      syntax: `from itertools import chain, product, permutations, combinations, accumulate, groupby, islice, count
list(combinations("ABC", 2))      # [('A','B'), ('A','C'), ('B','C')]
list(accumulate([1, 2, 3]))       # [1, 3, 6]
`,
    },
  ],
  examples: [
    {
      title: "math and random: Dice Game and Lucky Draw",
      scenario: "Build a dice roll simulator and a lucky draw that gives the same result every run (seeded) for testing.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math
import random

print(math.sqrt(144), math.pow(2, 5), math.floor(7.8), math.ceil(7.2))
print(math.factorial(6), math.gcd(48, 36), round(math.pi, 4))
print(math.isclose(0.1 + 0.2, 0.3))

random.seed(7)
rolls = [random.randint(1, 6) for _ in range(5)]
print("Dice rolls:", rolls)

students = ["Asha", "Ravi", "Neha", "Kiran", "Om"]
print("Winner:", random.choice(students))
print("Top 2 picks:", random.sample(students, 2))
random.shuffle(students)
print("Shuffled:", students)
print("Random float:", round(random.random(), 4))
`,
      python: {
        files: {
          "main.py": `import math
import random

print(math.sqrt(144), math.pow(2, 5), math.floor(7.8), math.ceil(7.2))
print(math.factorial(6), math.gcd(48, 36), round(math.pi, 4))
print(math.isclose(0.1 + 0.2, 0.3))

random.seed(7)
rolls = [random.randint(1, 6) for _ in range(5)]
print("Dice rolls:", rolls)

students = ["Asha", "Ravi", "Neha", "Kiran", "Om"]
print("Winner:", random.choice(students))
print("Top 2 picks:", random.sample(students, 2))
random.shuffle(students)
print("Shuffled:", students)
print("Random float:", round(random.random(), 4))
`,
        },
      },
      result: `12.0 32.0 7 8
720 12 3.1416
True
Dice rolls: [3, 2, 4, 6, 1]
Winner: Asha
Top 2 picks: ['Om', 'Asha']
Shuffled: ['Ravi', 'Kiran', 'Om', 'Asha', 'Neha']
Random float: 0.0375`,
      explanation: "math functions are deterministic. Because of random.seed(7), the random results are the same every time the program runs - remove the seed to get different results each run.",
    },
    {
      title: "datetime: Due Dates and Age Calculator",
      scenario: "A library app computes the due date of a borrowed book and a member's age from a date string.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from datetime import date, datetime, timedelta

issued = datetime(2025, 3, 10, 14, 45)
due = issued + timedelta(days=14)
print("Issued:", issued.strftime("%d-%m-%Y %I:%M %p"))
print("Due   :", due.strftime("%A, %d %B %Y"))

returned = datetime(2025, 3, 30, 11, 0)
late = returned - due
print("Late by:", late.days, "days")
print("Fine: Rs", max(0, late.days) * 5)

dob = datetime.strptime("15-08-2000", "%d-%m-%Y").date()
on = date(2025, 6, 1)
age = on.year - dob.year - ((on.month, on.day) < (dob.month, dob.day))
print("DOB:", dob, "| Age on", on, "=", age)
print(type(late).__name__, date(2025, 1, 1).weekday())
`,
      python: {
        files: {
          "main.py": `from datetime import date, datetime, timedelta

issued = datetime(2025, 3, 10, 14, 45)
due = issued + timedelta(days=14)
print("Issued:", issued.strftime("%d-%m-%Y %I:%M %p"))
print("Due   :", due.strftime("%A, %d %B %Y"))

returned = datetime(2025, 3, 30, 11, 0)
late = returned - due
print("Late by:", late.days, "days")
print("Fine: Rs", max(0, late.days) * 5)

dob = datetime.strptime("15-08-2000", "%d-%m-%Y").date()
on = date(2025, 6, 1)
age = on.year - dob.year - ((on.month, on.day) < (dob.month, dob.day))
print("DOB:", dob, "| Age on", on, "=", age)
print(type(late).__name__, date(2025, 1, 1).weekday())
`,
        },
      },
      result: `Issued: 10-03-2025 02:45 PM
Due   : Monday, 24 March 2025
Late by: 5 days
Fine: Rs 25
DOB: 2000-08-15 | Age on 2025-06-01 = 24
timedelta 2`,
      explanation: "Adding a timedelta moves a date forward. Subtracting two datetimes gives a timedelta whose .days we use for the fine. strptime parses text with a format, strftime formats output. weekday() returns 0 for Monday (1 Jan 2025 was a Wednesday = 2). Use date.today() / datetime.now() for the real current date.",
    },
    {
      title: "os and sys: Organising Files",
      scenario: "Create a folder structure, write files, list them and read an environment variable with a safe default.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import os
import sys

base = "reports"
os.makedirs(os.path.join(base, "2025"), exist_ok=True)
for name in ["jan.txt", "feb.txt", "notes.md"]:
    with open(os.path.join(base, "2025", name), "w") as f:
        f.write("data")

folder = os.path.join(base, "2025")
files = sorted(os.listdir(folder))
print("Files:", files)
print("Text files:", [f for f in files if f.endswith(".txt")])
print("Exists?", os.path.exists(os.path.join(folder, "jan.txt")))
print("Split ext:", os.path.splitext("notes.md"))
print("Size of jan.txt:", os.path.getsize(os.path.join(folder, "jan.txt")), "bytes")

mode = os.environ.get("APP_MODE", "development")
print("Mode:", mode)
print("Script args:", len(sys.argv), "item(s)")
print("Python major version:", sys.version_info.major)
`,
      python: {
        files: {
          "main.py": `import os
import sys

base = "reports"
os.makedirs(os.path.join(base, "2025"), exist_ok=True)
for name in ["jan.txt", "feb.txt", "notes.md"]:
    with open(os.path.join(base, "2025", name), "w") as f:
        f.write("data")

folder = os.path.join(base, "2025")
files = sorted(os.listdir(folder))
print("Files:", files)
print("Text files:", [f for f in files if f.endswith(".txt")])
print("Exists?", os.path.exists(os.path.join(folder, "jan.txt")))
print("Split ext:", os.path.splitext("notes.md"))
print("Size of jan.txt:", os.path.getsize(os.path.join(folder, "jan.txt")), "bytes")

mode = os.environ.get("APP_MODE", "development")
print("Mode:", mode)
print("Script args:", len(sys.argv), "item(s)")
print("Python major version:", sys.version_info.major)
`,
        },
      },
      result: `Files: ['feb.txt', 'jan.txt', 'notes.md']
Text files: ['feb.txt', 'jan.txt']
Exists? True
Split ext: ('notes', '.md')
Size of jan.txt: 4 bytes
Mode: development
Script args: 1 item(s)
Python major version: 3`,
      explanation: "os.makedirs with exist_ok=True creates nested folders safely. os.path.join builds correct paths for any OS. os.environ.get reads configuration with a default. sys.argv holds command-line arguments (just the script name here) and sys.version_info gives the interpreter version.",
    },
    {
      title: "collections: Counter, defaultdict, namedtuple, deque",
      scenario: "Analyse drink votes, group employees by department and model a print queue.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter, defaultdict, namedtuple, deque

votes = ["Tea", "Juice", "Coffee", "Tea", "Coffee", "Tea"]
c = Counter(votes)
print(c)
print(c.most_common(2), c["Juice"], c["Milk"])
print(Counter("mississippi").most_common(3))

emps = [("Asha", "IT"), ("Ravi", "HR"), ("Neha", "IT"), ("Om", "Sales")]
by_dept = defaultdict(list)
for name, dept in emps:
    by_dept[dept].append(name)
print(dict(by_dept))

Student = namedtuple("Student", ["name", "marks"])
s = Student("Kiran", 88)
print(s, s.name, s[1])

queue = deque(["doc1", "doc2"])
queue.append("doc3")
queue.appendleft("urgent")
print(queue.popleft(), list(queue))
recent = deque(maxlen=3)
for page in ["home", "about", "shop", "cart"]:
    recent.append(page)
print("Recent pages:", list(recent))
`,
      python: {
        files: {
          "main.py": `from collections import Counter, defaultdict, namedtuple, deque

votes = ["Tea", "Juice", "Coffee", "Tea", "Coffee", "Tea"]
c = Counter(votes)
print(c)
print(c.most_common(2), c["Juice"], c["Milk"])
print(Counter("mississippi").most_common(3))

emps = [("Asha", "IT"), ("Ravi", "HR"), ("Neha", "IT"), ("Om", "Sales")]
by_dept = defaultdict(list)
for name, dept in emps:
    by_dept[dept].append(name)
print(dict(by_dept))

Student = namedtuple("Student", ["name", "marks"])
s = Student("Kiran", 88)
print(s, s.name, s[1])

queue = deque(["doc1", "doc2"])
queue.append("doc3")
queue.appendleft("urgent")
print(queue.popleft(), list(queue))
recent = deque(maxlen=3)
for page in ["home", "about", "shop", "cart"]:
    recent.append(page)
print("Recent pages:", list(recent))
`,
        },
      },
      result: `Counter({'Tea': 3, 'Coffee': 2, 'Juice': 1})
[('Tea', 3), ('Coffee', 2)] 1 0
[('i', 4), ('s', 4), ('p', 2)]
{'IT': ['Asha', 'Neha'], 'HR': ['Ravi'], 'Sales': ['Om']}
Student(name='Kiran', marks=88) Kiran 88
urgent ['doc1', 'doc2', 'doc3']
Recent pages: ['about', 'shop', 'cart']`,
      explanation: "Counter counts items and returns 0 for missing keys. defaultdict(list) creates an empty list automatically for new keys. namedtuple gives readable field names. deque supports fast operations at both ends, and maxlen keeps only the latest N items.",
    },
    {
      title: "itertools: Combinations, Running Totals and Grouping",
      scenario: "Generate team pairs, size/colour variants, running sales totals and group sales by month.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from itertools import combinations, permutations, product, accumulate, groupby, chain, islice, count, cycle

players = ["A", "B", "C"]
print(list(combinations(players, 2)))
print(len(list(permutations(players))))
print(list(product(["S", "M"], ["Red", "Blue"])))

sales = [100, 250, 50, 300]
print(list(accumulate(sales)))
print(list(chain([1, 2], (3, 4), "ab")))
print(list(islice(count(10, 5), 4)))
print(list(islice(cycle("XY"), 5)))

data = [("Jan", 100), ("Jan", 50), ("Feb", 70), ("Mar", 20), ("Mar", 30)]
for month, rows in groupby(data, key=lambda r: r[0]):
    print(month, sum(amount for _, amount in rows))
`,
      python: {
        files: {
          "main.py": `from itertools import combinations, permutations, product, accumulate, groupby, chain, islice, count, cycle

players = ["A", "B", "C"]
print(list(combinations(players, 2)))
print(len(list(permutations(players))))
print(list(product(["S", "M"], ["Red", "Blue"])))

sales = [100, 250, 50, 300]
print(list(accumulate(sales)))
print(list(chain([1, 2], (3, 4), "ab")))
print(list(islice(count(10, 5), 4)))
print(list(islice(cycle("XY"), 5)))

data = [("Jan", 100), ("Jan", 50), ("Feb", 70), ("Mar", 20), ("Mar", 30)]
for month, rows in groupby(data, key=lambda r: r[0]):
    print(month, sum(amount for _, amount in rows))
`,
        },
      },
      result: `[('A', 'B'), ('A', 'C'), ('B', 'C')]
6
[('S', 'Red'), ('S', 'Blue'), ('M', 'Red'), ('M', 'Blue')]
[100, 350, 400, 700]
[1, 2, 3, 4, 'a', 'b']
[10, 15, 20, 25]
['X', 'Y', 'X', 'Y', 'X']
Jan 150
Feb 70
Mar 50`,
      explanation: "combinations ignore order, permutations care about order (3! = 6), product replaces nested loops. accumulate gives running totals. count and cycle are infinite, so islice takes a limited number of items. groupby groups CONSECUTIVE equal keys, so the data must be sorted by the key first.",
    },
  ],
  interview: [
    {
      q: "What is meant by \"batteries included\" in Python?",
      a: "Python ships with a large standard library (math, datetime, os, json, csv, collections, itertools, re, sqlite3...) so many tasks need no third-party packages.",
      level: "Easy",
    },
    {
      q: "What is the difference between random and secrets?",
      a: "random is a pseudo-random generator (Mersenne Twister) suited for simulations and games; it is predictable. secrets uses a cryptographically secure source and should be used for passwords, tokens and OTPs.",
      level: "Medium",
    },
    {
      q: "What is the difference between strftime and strptime?",
      a: "strftime formats a date/datetime object into a string (\"f\" = format). strptime parses a string into a datetime (\"p\" = parse) using a format pattern.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

from collections import Counter
c = Counter("hello world")
print(c.most_common(2))
print(c["z"])
`,
      a: `Output:
[('l', 3), ('o', 2)]
0

"l" appears 3 times and "o" twice. Counter returns 0 for a missing key instead of raising KeyError.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

from datetime import date, timedelta
d = date(2024, 2, 28) + timedelta(days=2)
print(d, d.strftime("%a"))
`,
      a: `Output:
2024-03-01 Fri

2024 is a leap year, so 28 Feb + 2 days = 1 March 2024, which was a Friday.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

from itertools import combinations, permutations
print(len(list(combinations(range(5), 2))), len(list(permutations(range(5), 2))))
`,
      a: `Output:
10 20

Combinations of 5 choose 2 = 10. Permutations of 5 taken 2 = 5 * 4 = 20.`,
      level: "Medium",
    },
    {
      q: "When would you use defaultdict instead of dict?",
      a: "When grouping or counting and you do not want to check if a key exists first. defaultdict(list) / defaultdict(int) creates the default value automatically for missing keys.",
      level: "Easy",
    },
    {
      q: "Why should you sort before using itertools.groupby?",
      a: "groupby only groups consecutive items with the same key. Unsorted data creates multiple separate groups for the same key.",
      level: "Hard",
    },
    {
      q: "What is the difference between a list and a deque?",
      a: "deque supports O(1) append and pop at both ends; list.insert(0, x) and list.pop(0) are O(n). deque can also have a maxlen. Lists are better for random index access.",
      level: "Medium",
    },
    {
      q: "What is sys.argv?",
      a: "A list of command-line arguments passed to the script. sys.argv[0] is the script name; the rest are the arguments as strings. Example: python app.py 5 data.csv gives [\"app.py\", \"5\", \"data.csv\"].",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Write a program to generate a 6-digit OTP using random (seeded for testing) and also using secrets.",
      hint: "random.randint(100000, 999999); secrets.randbelow(900000) + 100000.",
      solution: `import random, secrets
random.seed(1)
print("Test OTP:", random.randint(100000, 999999))
otp = secrets.randbelow(900000) + 100000
print("Secure OTP has 6 digits:", len(str(otp)) == 6)
`,
    },
    {
      task: "Find the number of days between 26 January 2025 and 15 August 2025, and the weekday name of both dates.",
      hint: "Subtract two date objects; use strftime(\"%A\").",
      solution: `from datetime import date
a, b = date(2025, 1, 26), date(2025, 8, 15)
print((b - a).days)
print(a.strftime("%A"), b.strftime("%A"))
`,
    },
    {
      task: "Find the top 3 most frequent words in a sentence using Counter.",
      hint: "Counter(text.lower().split()).most_common(3)",
      solution: `from collections import Counter
text = "the cat and the dog and the bird"
print(Counter(text.split()).most_common(3))
`,
    },
    {
      task: "Group a list of words by their first letter using defaultdict.",
      hint: "groups[word[0]].append(word)",
      solution: `from collections import defaultdict
words = ["apple", "avocado", "banana", "blueberry", "cherry"]
groups = defaultdict(list)
for w in words:
    groups[w[0]].append(w)
print(dict(groups))
`,
    },
    {
      task: "Print every possible 2-item meal combo from mains [\"Rice\", \"Roti\"] and sides [\"Dal\", \"Paneer\", \"Salad\"] using itertools.product.",
      hint: "for main, side in product(mains, sides)",
      solution: `from itertools import product
for main, side in product(["Rice", "Roti"], ["Dal", "Paneer", "Salad"]):
    print(main, "+", side)
`,
    },
  ],
  quiz: [
    {
      question: "Which call makes random results repeatable?",
      options: [
        "random.fix(1)",
        "random.seed(1)",
        "random.repeat(1)",
        "random.lock()",
      ],
      answer: 1,
      explanation: "Seeding the generator gives the same sequence every run.",
    },
    {
      question: "What type is the result of subtracting two datetime objects?",
      options: [
        "int",
        "datetime",
        "float",
        "timedelta",
      ],
      answer: 3,
      explanation: "The difference between two datetimes is a timedelta.",
    },
    {
      question: "Which collection returns 0 for a missing key?",
      options: [
        "Counter",
        "dict",
        "namedtuple",
        "deque",
      ],
      answer: 0,
      explanation: "Counter[missing] returns 0.",
    },
    {
      question: "Which function safely builds a file path for any OS?",
      options: [
        "os.getcwd",
        "sys.path",
        "os.path.join",
        "os.listdir",
      ],
      answer: 2,
      explanation: "os.path.join uses the correct separator.",
    },
    {
      question: "list(accumulate([2, 3, 4])) returns:",
      options: [
        "[2, 3, 4]",
        "9",
        "[2, 6, 24]",
        "[2, 5, 9]",
      ],
      answer: 3,
      explanation: "accumulate gives running sums by default.",
    },
  ],
};
