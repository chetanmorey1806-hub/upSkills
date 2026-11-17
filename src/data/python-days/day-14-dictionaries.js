export default {
  id: "day-14-dictionaries",
  title: "Dictionaries, Dictionary Methods, Nested Dictionaries, Dict Comprehensions",
  module: "Module 2: Data Structures",
  day: 14,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Store data as key-value pairs with dictionaries: create, read, update and delete entries, use every important dict method, loop over keys/values/items, model real records with nested dictionaries, and build dicts with comprehensions.",
  objectives: [
    "Create dictionaries and access values with [] and get()",
    "Add, update and delete entries with update(), pop(), popitem(), del, setdefault()",
    "Iterate with keys(), values() and items(); sort a dict by key or value",
    "Model JSON-like data with nested dictionaries and lists",
    "Write dict comprehensions and use Counter/defaultdict for counting and grouping",
  ],
  theory: [
    {
      heading: "What is a dictionary?",
      content: "A dictionary (dict) stores data as key: value pairs. Instead of looking up by position (like lists), you look up by a meaningful key, just like a real dictionary where you search a word to get its meaning, or a phone contact list where you search a name to get the number. Keys must be unique and hashable (str, int, tuple...). Values can be anything. Since Python 3.7, dicts keep insertion order. Lookups are O(1) on average because dicts are hash tables. Dicts are the backbone of JSON, APIs, Django/Flask request data and configuration.",
      syntax: `student = {"name": "Asha", "age": 21, "city": "Pune"}
empty = {}
d2 = dict(name="Ravi", age=22)            # keyword style
d3 = dict([("a", 1), ("b", 2)])           # from list of pairs
d4 = dict.fromkeys(["x", "y"], 0)         # {'x': 0, 'y': 0}
d5 = dict(zip(["a", "b"], [1, 2]))        # from two lists`,
      points: [
        "Duplicate key: the last value wins",
        "Keys must be hashable: a list cannot be a key",
        "len(d) counts keys; \"key\" in d checks keys, not values",
      ],
    },
    {
      heading: "Accessing, adding, updating, deleting",
      content: "d[key] returns the value but raises KeyError if the key is missing. d.get(key, default) returns the default (None if not given) instead of crashing, which is safer for optional data. Assigning d[key] = value adds a new key or updates an existing one.",
      syntax: `student["name"]              # 'Asha'
student["phone"]             # KeyError
student.get("phone")         # None
student.get("phone", "N/A")  # 'N/A'

student["email"] = "a@x.com" # add
student["age"] = 22          # update
student.update({"age": 23, "city": "Mumbai"})   # many at once
student |= {"cgpa": 8.9}     # merge (3.9+)

del student["email"]         # delete (KeyError if missing)
age = student.pop("age")     # delete and return value
student.pop("x", None)       # safe pop with default
last = student.popitem()     # remove last inserted (key, value)
student.clear()              # {}`,
    },
    {
      heading: "Looping and view objects",
      content: "keys(), values() and items() return view objects: live windows into the dict that update when the dict changes. Looping over a dict directly gives its keys. items() gives (key, value) tuples that you unpack in the loop. Do not add or remove keys while looping over a dict (RuntimeError); loop over list(d) instead.",
      syntax: `for key in d:                 # keys
for value in d.values():
for key, value in d.items():

sorted(d)                                  # sorted keys
sorted(d.items(), key=lambda kv: kv[1])    # sort by value
max(d, key=d.get)                          # key with the largest value`,
    },
    {
      heading: "setdefault, Counter and defaultdict",
      content: "Counting and grouping are the most common dict tasks. d.get(k, 0) + 1 counts; setdefault(k, []) returns the existing value or inserts a default and returns it, which is handy for grouping. The collections module offers Counter (a dict subclass for counting, with most_common()) and defaultdict (creates a default value automatically for missing keys).",
      syntax: `counts = {}
for w in words:
    counts[w] = counts.get(w, 0) + 1

groups = {}
for name, dept in staff:
    groups.setdefault(dept, []).append(name)

from collections import Counter, defaultdict
Counter("banana")                 # Counter({'a': 3, 'n': 2, 'b': 1})
Counter(words).most_common(2)
dd = defaultdict(list)
dd["IT"].append("Asha")           # no KeyError`,
    },
    {
      heading: "Nested dictionaries",
      content: "Values can be lists or other dicts, which lets you represent real records like JSON from an API. Access inner values by chaining keys: data[\"address\"][\"city\"]. Use get() at each level for optional data. Remember that copy() is shallow: nested dicts are shared; use copy.deepcopy for full copies.",
      syntax: `company = {
    "name": "TechSoft",
    "employees": {
        "E1": {"name": "Asha", "skills": ["python", "sql"]},
        "E2": {"name": "Ravi", "skills": ["java"]},
    },
}
company["employees"]["E1"]["skills"][0]     # 'python'
company.get("address", {}).get("city")      # None (safe)`,
    },
    {
      heading: "Dict comprehensions",
      content: "A dict comprehension builds a dictionary in one line: {key_expr: value_expr for item in iterable if condition}. Use it to transform, filter, invert or build dicts from two lists.",
      syntax: `squares = {n: n * n for n in range(1, 6)}      # {1: 1, 2: 4, ...}
passed = {k: v for k, v in marks.items() if v >= 35}
inverted = {v: k for k, v in codes.items()}
prices_gst = {item: round(p * 1.18, 2) for item, p in prices.items()}
lengths = {w: len(w) for w in ["hi", "hello"]}`,
      tip: "When inverting a dict, duplicate values become duplicate keys, and only the last one survives.",
    },
  ],
  examples: [
    {
      title: "CRUD on a student dictionary",
      scenario: "Create a student record, read values safely, add/update fields, and delete fields.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `student = {"roll": 101, "name": "Asha", "dept": "CSE"}
print("Name:", student["name"])
print("Phone:", student.get("phone", "Not provided"))

student["cgpa"] = 8.7
student["dept"] = "IT"
student.update({"city": "Pune", "cgpa": 8.9})
print("Updated:", student)

removed = student.pop("city")
print("Removed city:", removed)
del student["roll"]
print("Last item popped:", student.popitem())
print("Final:", student, "| keys:", len(student))

try:
    student["phone"]
except KeyError as e:
    print("KeyError:", e)`,
      python: {
        files: {
          "main.py": `student = {"roll": 101, "name": "Asha", "dept": "CSE"}
print("Name:", student["name"])
print("Phone:", student.get("phone", "Not provided"))

student["cgpa"] = 8.7
student["dept"] = "IT"
student.update({"city": "Pune", "cgpa": 8.9})
print("Updated:", student)

removed = student.pop("city")
print("Removed city:", removed)
del student["roll"]
print("Last item popped:", student.popitem())
print("Final:", student, "| keys:", len(student))

try:
    student["phone"]
except KeyError as e:
    print("KeyError:", e)`,
        },
      },
      result: `Name: Asha
Phone: Not provided
Updated: {'roll': 101, 'name': 'Asha', 'dept': 'IT', 'cgpa': 8.9, 'city': 'Pune'}
Removed city: Pune
Last item popped: ('cgpa', 8.9)
Final: {'name': 'Asha', 'dept': 'IT'} | keys: 2
KeyError: 'phone'`,
      explanation: "[] reads an existing key; get() avoids KeyError for missing keys. Assignment adds or updates. update() changes several keys. pop() removes a key and returns its value; popitem() removes the most recently inserted pair.",
    },
    {
      title: "Looping, sorting by value and finding top scorer",
      scenario: "Show a marks report in different orders and find the topper and the average.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `marks = {"Asha": 91, "Ravi": 78, "Meena": 85, "John": 64}

for name, score in marks.items():
    print(f"{name:<6} {score}")

print("Names sorted:", sorted(marks))
print("By marks (high to low):", sorted(marks.items(), key=lambda kv: kv[1], reverse=True))
print("Topper:", max(marks, key=marks.get))
print("Average:", sum(marks.values()) / len(marks))
print("Is Ravi present?", "Ravi" in marks, "| Is 91 a key?", 91 in marks)

keys_view = marks.keys()
marks["Zara"] = 88
print("View updates live:", list(keys_view))`,
      python: {
        files: {
          "main.py": `marks = {"Asha": 91, "Ravi": 78, "Meena": 85, "John": 64}

for name, score in marks.items():
    print(f"{name:<6} {score}")

print("Names sorted:", sorted(marks))
print("By marks (high to low):", sorted(marks.items(), key=lambda kv: kv[1], reverse=True))
print("Topper:", max(marks, key=marks.get))
print("Average:", sum(marks.values()) / len(marks))
print("Is Ravi present?", "Ravi" in marks, "| Is 91 a key?", 91 in marks)

keys_view = marks.keys()
marks["Zara"] = 88
print("View updates live:", list(keys_view))`,
        },
      },
      result: `Asha   91
Ravi   78
Meena  85
John   64
Names sorted: ['Asha', 'John', 'Meena', 'Ravi']
By marks (high to low): [('Asha', 91), ('Meena', 85), ('Ravi', 78), ('John', 64)]
Topper: Asha
Average: 79.5
Is Ravi present? True | Is 91 a key? False
View updates live: ['Asha', 'Ravi', 'Meena', 'John', 'Zara']`,
      explanation: "items() gives (name, score) pairs. sorted() on items with key=kv[1] sorts by value. max(marks, key=marks.get) compares keys by their values. in checks only keys. Views reflect later changes.",
    },
    {
      title: "Counting and grouping",
      scenario: "Count word frequency in a sentence and group employees by department, using plain dicts and collections.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `from collections import Counter, defaultdict

text = "the cat and the dog and the bird"
freq = {}
for word in text.split():
    freq[word] = freq.get(word, 0) + 1
print("Manual count:", freq)
print("Counter top 2:", Counter(text.split()).most_common(2))

staff = [("Asha", "IT"), ("Ravi", "HR"), ("Meena", "IT"), ("John", "Sales"), ("Priya", "HR")]
groups = {}
for name, dept in staff:
    groups.setdefault(dept, []).append(name)
print("setdefault:", groups)

dd = defaultdict(list)
for name, dept in staff:
    dd[dept].append(name)
print("defaultdict:", dict(dd))`,
      python: {
        files: {
          "main.py": `from collections import Counter, defaultdict

text = "the cat and the dog and the bird"
freq = {}
for word in text.split():
    freq[word] = freq.get(word, 0) + 1
print("Manual count:", freq)
print("Counter top 2:", Counter(text.split()).most_common(2))

staff = [("Asha", "IT"), ("Ravi", "HR"), ("Meena", "IT"), ("John", "Sales"), ("Priya", "HR")]
groups = {}
for name, dept in staff:
    groups.setdefault(dept, []).append(name)
print("setdefault:", groups)

dd = defaultdict(list)
for name, dept in staff:
    dd[dept].append(name)
print("defaultdict:", dict(dd))`,
        },
      },
      result: `Manual count: {'the': 3, 'cat': 1, 'and': 2, 'dog': 1, 'bird': 1}
Counter top 2: [('the', 3), ('and', 2)]
setdefault: {'IT': ['Asha', 'Meena'], 'HR': ['Ravi', 'Priya'], 'Sales': ['John']}
defaultdict: {'IT': ['Asha', 'Meena'], 'HR': ['Ravi', 'Priya'], 'Sales': ['John']}`,
      explanation: "get(word, 0) + 1 counts safely. Counter does the same in one call and most_common() sorts by frequency. setdefault and defaultdict both create an empty list the first time a department is seen.",
    },
    {
      title: "Nested dictionaries: API-like JSON data",
      scenario: "Process a nested order response similar to what an e-commerce API returns.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `order = {
    "order_id": "ORD1001",
    "customer": {"name": "Asha", "address": {"city": "Pune", "pin": "411001"}},
    "items": [
        {"product": "Keyboard", "qty": 1, "price": 1200},
        {"product": "Mouse", "qty": 2, "price": 450},
    ],
    "status": "shipped",
}

print("Customer:", order["customer"]["name"])
print("City:", order["customer"]["address"]["city"])
print("Coupon:", order.get("coupon", {}).get("code", "none"))

total = 0
for item in order["items"]:
    line = item["qty"] * item["price"]
    total += line
    print(f"  {item['product']:<10} x{item['qty']}  {line:>6}")
print("Order total:", total)

order["items"].append({"product": "USB Cable", "qty": 3, "price": 150})
print("Products:", [i["product"] for i in order["items"]])`,
      python: {
        files: {
          "main.py": `order = {
    "order_id": "ORD1001",
    "customer": {"name": "Asha", "address": {"city": "Pune", "pin": "411001"}},
    "items": [
        {"product": "Keyboard", "qty": 1, "price": 1200},
        {"product": "Mouse", "qty": 2, "price": 450},
    ],
    "status": "shipped",
}

print("Customer:", order["customer"]["name"])
print("City:", order["customer"]["address"]["city"])
print("Coupon:", order.get("coupon", {}).get("code", "none"))

total = 0
for item in order["items"]:
    line = item["qty"] * item["price"]
    total += line
    print(f"  {item['product']:<10} x{item['qty']}  {line:>6}")
print("Order total:", total)

order["items"].append({"product": "USB Cable", "qty": 3, "price": 150})
print("Products:", [i["product"] for i in order["items"]])`,
        },
      },
      result: `Customer: Asha
City: Pune
Coupon: none
  Keyboard   x1    1200
  Mouse      x2     900
Order total: 2100
Products: ['Keyboard', 'Mouse', 'USB Cable']`,
      explanation: "Chain keys to go deeper. Lists of dicts are looped like normal lists. get() with an empty dict default prevents crashes when a nested key is optional. This structure is exactly what you will work with in Django REST APIs.",
    },
    {
      title: "Dict comprehensions",
      scenario: "Build, filter, transform and invert dictionaries in one line each.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `squares = {n: n ** 2 for n in range(1, 6)}
print(squares)

marks = {"Asha": 91, "Ravi": 32, "Meena": 85, "John": 28}
passed = {name: m for name, m in marks.items() if m >= 35}
grades = {name: ("Pass" if m >= 35 else "Fail") for name, m in marks.items()}
print(passed)
print(grades)

codes = {"IN": "India", "US": "United States", "JP": "Japan"}
print({country: code for code, country in codes.items()})

products = ["pen", "book", "bag"]
prices = [10, 250, 900]
catalog = dict(zip(products, prices))
print({p: round(v * 1.18, 2) for p, v in catalog.items()})
print({ch: "programming".count(ch) for ch in "programming" if "programming".count(ch) > 1})`,
      python: {
        files: {
          "main.py": `squares = {n: n ** 2 for n in range(1, 6)}
print(squares)

marks = {"Asha": 91, "Ravi": 32, "Meena": 85, "John": 28}
passed = {name: m for name, m in marks.items() if m >= 35}
grades = {name: ("Pass" if m >= 35 else "Fail") for name, m in marks.items()}
print(passed)
print(grades)

codes = {"IN": "India", "US": "United States", "JP": "Japan"}
print({country: code for code, country in codes.items()})

products = ["pen", "book", "bag"]
prices = [10, 250, 900]
catalog = dict(zip(products, prices))
print({p: round(v * 1.18, 2) for p, v in catalog.items()})
print({ch: "programming".count(ch) for ch in "programming" if "programming".count(ch) > 1})`,
        },
      },
      result: `{1: 1, 2: 4, 3: 9, 4: 16, 5: 25}
{'Asha': 91, 'Meena': 85}
{'Asha': 'Pass', 'Ravi': 'Fail', 'Meena': 'Pass', 'John': 'Fail'}
{'India': 'IN', 'United States': 'US', 'Japan': 'JP'}
{'pen': 11.8, 'book': 295.0, 'bag': 1062.0}
{'r': 2, 'g': 2, 'm': 2}`,
      explanation: "Each comprehension has the form {key: value for ...}. A trailing if filters, an if-else in the value transforms, swapping k and v inverts the dict, and zip() combines two lists into pairs.",
    },
  ],
  interview: [
    {
      q: "What is a dictionary in Python?",
      a: "A mutable mapping of unique, hashable keys to values, implemented as a hash table with O(1) average lookup. Insertion order is preserved since Python 3.7.",
      level: "Easy",
    },
    {
      q: "Difference between d[key] and d.get(key)?",
      a: "d[key] raises KeyError when the key is missing; d.get(key, default) returns default (None by default) instead.",
      level: "Easy",
    },
    {
      q: "What can be a dictionary key?",
      a: "Any hashable (immutable) object: str, int, float, bool, tuple of immutables, frozenset. Lists, dicts and sets cannot be keys.",
      level: "Easy",
    },
    {
      q: "What is the output of print({\"a\": 1, \"a\": 2})?",
      a: "{'a': 2}. Duplicate keys are allowed in the literal but the last value wins.",
      level: "Medium",
    },
    {
      q: "What is the output of print({1: \"a\", True: \"b\", 1.0: \"c\"})?",
      a: "{1: 'c'}. 1, True and 1.0 are equal with the same hash, so they are the same key. The first key object (1) is kept and the value is overwritten by the last.",
      level: "Hard",
    },
    {
      q: "How do you merge two dictionaries?",
      a: "d1 | d2 (3.9+, new dict), d1 |= d2 or d1.update(d2) (in place), or {**d1, **d2}. Later keys overwrite earlier ones.",
      level: "Medium",
    },
    {
      q: "Difference between pop() and popitem()?",
      a: "pop(key[, default]) removes the given key and returns its value. popitem() removes and returns the last inserted (key, value) pair (LIFO).",
      level: "Medium",
    },
    {
      q: "How do you sort a dictionary by value?",
      a: "dict(sorted(d.items(), key=lambda kv: kv[1])), add reverse=True for descending.",
      level: "Medium",
    },
    {
      q: "What is setdefault()?",
      a: "d.setdefault(key, default) returns d[key] if present; otherwise inserts key with default and returns it. Commonly used for grouping: d.setdefault(k, []).append(v).",
      level: "Medium",
    },
    {
      q: "What is the difference between dict and defaultdict?",
      a: "defaultdict (collections) takes a factory (list, int, set) and automatically creates a default value for missing keys instead of raising KeyError.",
      level: "Medium",
    },
    {
      q: "What happens if you modify a dict size while iterating over it?",
      a: "RuntimeError: dictionary changed size during iteration. Iterate over list(d) or build a new dict with a comprehension.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Count the frequency of each character in a string (ignore spaces) using a dict.",
      hint: "d[ch] = d.get(ch, 0) + 1",
      solution: `s = "hello world"
freq = {}
for ch in s.replace(" ", ""):
    freq[ch] = freq.get(ch, 0) + 1
print(freq)`,
    },
    {
      task: "Create a dict from two lists: keys = [\"name\", \"age\", \"city\"], values = [\"Asha\", 21, \"Pune\"].",
      hint: "dict(zip(keys, values))",
      solution: `keys = ["name", "age", "city"]
values = ["Asha", 21, "Pune"]
print(dict(zip(keys, values)))`,
    },
    {
      task: "Given a dict of product: stock, print products with stock below 5 sorted by stock.",
      hint: "Filter with a comprehension, then sorted by value.",
      solution: `stock = {"pen": 50, "book": 3, "bag": 0, "pencil": 4}
low = {k: v for k, v in stock.items() if v < 5}
print(sorted(low.items(), key=lambda kv: kv[1]))`,
    },
    {
      task: "Build a phonebook menu: add a contact, search a contact, delete a contact, show all (use a while loop and a dict).",
      hint: "while True with input() choices.",
      solution: `book = {}
while True:
    ch = input("1 Add 2 Search 3 Delete 4 Show 5 Exit: ")
    if ch == "1":
        book[input("Name: ")] = input("Phone: ")
    elif ch == "2":
        print(book.get(input("Name: "), "Not found"))
    elif ch == "3":
        print("Deleted" if book.pop(input("Name: "), None) else "Not found")
    elif ch == "4":
        for n, p in sorted(book.items()):
            print(n, p)
    else:
        break`,
    },
    {
      task: "Find the total salary per department from a list of employee dicts.",
      hint: "totals[dept] = totals.get(dept, 0) + salary",
      solution: `emps = [{"dept": "IT", "salary": 50000}, {"dept": "HR", "salary": 30000}, {"dept": "IT", "salary": 70000}]
totals = {}
for e in emps:
    totals[e["dept"]] = totals.get(e["dept"], 0) + e["salary"]
print(totals)   # {'IT': 120000, 'HR': 30000}`,
    },
  ],
  quiz: [
    {
      question: "What does d.get(\"x\", 0) return if \"x\" is not a key?",
      options: [
        "None",
        "KeyError",
        "0",
        "\"x\"",
      ],
      answer: 2,
      explanation: "get returns the provided default.",
    },
    {
      question: "Which cannot be a dictionary key?",
      options: [
        "\"name\"",
        "(1, 2)",
        "42",
        "[1, 2]",
      ],
      answer: 3,
      explanation: "Lists are unhashable.",
    },
    {
      question: "What does looping \"for x in d\" give?",
      options: [
        "Keys",
        "Values",
        "(key, value) pairs",
        "Indexes",
      ],
      answer: 0,
      explanation: "Iterating a dict yields its keys.",
    },
    {
      question: "What is {k: v for k, v in [(\"a\", 1), (\"b\", 2)]}?",
      options: [
        "[('a', 1), ('b', 2)]",
        "{'a': 1, 'b': 2}",
        "{'a', 'b'}",
        "Error",
      ],
      answer: 1,
      explanation: "A dict comprehension builds key: value pairs.",
    },
    {
      question: "Since which version do dicts officially keep insertion order?",
      options: [
        "2.7",
        "3.0",
        "3.7",
        "3.10",
      ],
      answer: 2,
      explanation: "Guaranteed by the language from Python 3.7.",
    },
  ],
};
