export default {
  id: "day-17-args-kwargs-scope",
  title: "*args and **kwargs, Scope (LEGB), global and nonlocal",
  module: "Module 3: Functions & Modules",
  day: 17,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Write functions that accept any number of positional or keyword arguments using *args and **kwargs, and understand how Python finds variable names using the LEGB rule with global and nonlocal.",
  objectives: [
    "Accept a variable number of arguments with *args and **kwargs",
    "Unpack lists and dicts into function calls with * and **",
    "Explain the LEGB rule (Local, Enclosing, Global, Built-in)",
    "Use global and nonlocal correctly and know when to avoid them",
    "Understand the correct order of parameters in a function signature",
  ],
  theory: [
    {
      heading: "*args: Any Number of Positional Arguments",
      content: "Sometimes you do not know how many values will be passed, like a function that adds any count of numbers. Writing *args in the definition collects all extra positional arguments into a TUPLE. The name args is a convention; the star is what matters. Think of *args as a shopping bag that collects all items you hand over.",
      syntax: `def total(*args):
    return sum(args)    # args is a tuple

total(1, 2, 3)          # 6
`,
    },
    {
      heading: "**kwargs: Any Number of Keyword Arguments",
      content: "**kwargs collects extra keyword arguments into a DICTIONARY, where keys are parameter names and values are the passed values. It is useful for options/settings, building records, or passing configuration forward to another function.",
      syntax: `def profile(**kwargs):
    for key, value in kwargs.items():
        print(key, "=", value)

profile(name="Asha", city="Pune")
`,
    },
    {
      heading: "Parameter Order and Unpacking",
      content: "The full order in a definition is: normal positional parameters, *args, keyword-only parameters (with or without defaults), then **kwargs. In a call, * unpacks a list/tuple into positional arguments and ** unpacks a dict into keyword arguments.",
      syntax: `def f(a, b=2, *args, sep="-", **kwargs): ...

nums = [1, 2, 3]
print(*nums)                  # same as print(1, 2, 3)
opts = {"sep": " | "}
print(*nums, **opts)          # print(1, 2, 3, sep=" | ")
`,
      points: [
        "Parameters after *args can only be passed by keyword (keyword-only)",
        "A bare * in a signature also forces keyword-only parameters: def f(a, *, b)",
      ],
    },
    {
      heading: "Scope and the LEGB Rule",
      content: "Scope means \"where a variable can be seen\". When Python meets a name, it searches four places in order: L - Local (inside the current function), E - Enclosing (outer function, for nested functions), G - Global (top level of the file/module), B - Built-in (names like len, print). The first match wins. Like searching for your keys: your pocket, then your bag, then your room, then the whole house.",
      points: [
        "A variable assigned inside a function is local by default",
        "Local variables disappear after the function returns",
        "Shadowing a built-in (e.g. list = [1,2]) hides the real built-in - avoid it",
      ],
    },
    {
      heading: "global and nonlocal Keywords",
      content: "Reading a global variable inside a function is allowed. But ASSIGNING to it creates a new local variable unless you declare global name first. Similarly, nonlocal lets a nested (inner) function modify a variable of its enclosing function. If you assign to a name and also read it before the assignment inside the same function, you get UnboundLocalError.",
      syntax: `count = 0
def inc():
    global count
    count += 1

def outer():
    x = 0
    def inner():
        nonlocal x
        x += 1
    inner()
    return x
`,
      tip: "Prefer passing values in and returning results out. Overusing global makes code hard to debug and test.",
    },
  ],
  examples: [
    {
      title: "Sum and Average of Any Count of Numbers",
      scenario: "A calculator function must work whether the user gives 2 numbers or 10.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def summary(*nums):
    print("Received:", nums, type(nums).__name__)
    if not nums:
        return 0, 0
    return sum(nums), sum(nums) / len(nums)

print(summary(10, 20))
print(summary(5, 15, 25, 35))
print(summary())

marks = [60, 70, 80]
print(summary(*marks))   # unpack list into arguments
`,
      python: {
        files: {
          "main.py": `def summary(*nums):
    print("Received:", nums, type(nums).__name__)
    if not nums:
        return 0, 0
    return sum(nums), sum(nums) / len(nums)

print(summary(10, 20))
print(summary(5, 15, 25, 35))
print(summary())

marks = [60, 70, 80]
print(summary(*marks))   # unpack list into arguments
`,
        },
      },
      result: `Received: (10, 20) tuple
(30, 15.0)
Received: (5, 15, 25, 35) tuple
(80, 20.0)
Received: () tuple
(0, 0)
Received: (60, 70, 80) tuple
(210, 70.0)`,
      explanation: "*nums packs all positional arguments into a tuple. With no arguments it is an empty tuple. *marks in the call unpacks the list into separate arguments.",
    },
    {
      title: "Building a Student Record with **kwargs",
      scenario: "A registration form may send different optional fields for each student.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def create_student(name, course="Python", **details):
    record = {"name": name, "course": course}
    record.update(details)
    return record

print(create_student("Ravi"))
print(create_student("Asha", "Django", city="Pune", phone="98xxxx"))

extra = {"city": "Delhi", "batch": "B12"}
print(create_student("Neha", **extra))
`,
      python: {
        files: {
          "main.py": `def create_student(name, course="Python", **details):
    record = {"name": name, "course": course}
    record.update(details)
    return record

print(create_student("Ravi"))
print(create_student("Asha", "Django", city="Pune", phone="98xxxx"))

extra = {"city": "Delhi", "batch": "B12"}
print(create_student("Neha", **extra))
`,
        },
      },
      result: `{'name': 'Ravi', 'course': 'Python'}
{'name': 'Asha', 'course': 'Django', 'city': 'Pune', 'phone': '98xxxx'}
{'name': 'Neha', 'course': 'Python', 'city': 'Delhi', 'batch': 'B12'}`,
      explanation: "Unknown keyword arguments go into the details dict. **extra unpacks a dictionary into keyword arguments at call time.",
    },
    {
      title: "Full Signature: args, keyword-only and kwargs",
      scenario: "A logging helper accepts any messages, an optional separator and extra metadata.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def log(level, *messages, sep=" ", **meta):
    text = sep.join(str(m) for m in messages)
    tags = ", ".join(f"{k}={v}" for k, v in meta.items())
    print(f"[{level}] {text}" + (f"  ({tags})" if tags else ""))

log("INFO", "Server", "started")
log("WARN", "Disk", "90%", "full", sep="-")
log("ERROR", "Login failed", user="asha", ip="10.0.0.5")
`,
      python: {
        files: {
          "main.py": `def log(level, *messages, sep=" ", **meta):
    text = sep.join(str(m) for m in messages)
    tags = ", ".join(f"{k}={v}" for k, v in meta.items())
    print(f"[{level}] {text}" + (f"  ({tags})" if tags else ""))

log("INFO", "Server", "started")
log("WARN", "Disk", "90%", "full", sep="-")
log("ERROR", "Login failed", user="asha", ip="10.0.0.5")
`,
        },
      },
      result: `[INFO] Server started
[WARN] Disk-90%-full
[ERROR] Login failed  (user=asha, ip=10.0.0.5)`,
      explanation: "level is a normal parameter, messages collects extra positional values, sep is keyword-only (it comes after *messages), and meta collects remaining keyword arguments.",
    },
    {
      title: "LEGB, global and nonlocal in Action",
      scenario: "See how the same name x is looked up at different levels, and how to modify outer variables.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `x = "global x"

def outer():
    x = "enclosing x"
    def inner():
        x = "local x"
        print("inner sees:", x)
    inner()
    print("outer sees:", x)

outer()
print("module sees:", x)

counter = 0
def increment():
    global counter
    counter += 1

increment(); increment()
print("counter:", counter)

def make_counter():
    count = 0
    def step():
        nonlocal count
        count += 1
        return count
    return step

c = make_counter()
print(c(), c(), c())
print(len("abc"))  # len found in Built-in scope
`,
      python: {
        files: {
          "main.py": `x = "global x"

def outer():
    x = "enclosing x"
    def inner():
        x = "local x"
        print("inner sees:", x)
    inner()
    print("outer sees:", x)

outer()
print("module sees:", x)

counter = 0
def increment():
    global counter
    counter += 1

increment(); increment()
print("counter:", counter)

def make_counter():
    count = 0
    def step():
        nonlocal count
        count += 1
        return count
    return step

c = make_counter()
print(c(), c(), c())
print(len("abc"))  # len found in Built-in scope
`,
        },
      },
      result: `inner sees: local x
outer sees: enclosing x
module sees: global x
counter: 2
1 2 3
3`,
      explanation: "Each function has its own x; the nearest scope wins. global lets increment() change the module-level counter. nonlocal lets step() update count in the enclosing make_counter() - this is also called a closure.",
    },
    {
      title: "UnboundLocalError Demo (and Fix)",
      scenario: "A beginner tries to update a global balance inside a function without global.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `balance = 1000

def withdraw_wrong(amount):
    try:
        balance = balance - amount   # balance treated as local!
    except UnboundLocalError as e:
        print("Error:", e)

def withdraw_right(amount, current):
    return current - amount          # better: pass in, return out

withdraw_wrong(200)
balance = withdraw_right(200, balance)
print("Balance:", balance)
`,
      python: {
        files: {
          "main.py": `balance = 1000

def withdraw_wrong(amount):
    try:
        balance = balance - amount   # balance treated as local!
    except UnboundLocalError as e:
        print("Error:", e)

def withdraw_right(amount, current):
    return current - amount          # better: pass in, return out

withdraw_wrong(200)
balance = withdraw_right(200, balance)
print("Balance:", balance)
`,
        },
      },
      result: `Error: cannot access local variable 'balance' where it is not associated with a value
Balance: 800`,
      explanation: "Because balance is assigned inside withdraw_wrong, Python treats it as local for the whole function, so reading it on the right side fails. The clean fix is to pass the value in and return the new value.",
    },
  ],
  interview: [
    {
      q: "What are *args and **kwargs?",
      a: "*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict. The names are conventions; the * and ** are the syntax.",
      level: "Easy",
    },
    {
      q: "What is the LEGB rule?",
      a: "The order in which Python resolves names: Local, Enclosing, Global, Built-in. The first scope that contains the name is used.",
      level: "Easy",
    },
    {
      q: "What is the difference between global and nonlocal?",
      a: "global makes a name inside a function refer to the module-level variable. nonlocal makes a name inside a nested function refer to the variable in the nearest enclosing function scope (not global).",
      level: "Medium",
    },
    {
      q: `What is the output of this code?

def f(a, *args, **kwargs):
    print(a, args, kwargs)

f(1, 2, 3, x=4, y=5)
f(*[10, 20], **{"z": 30})
`,
      a: `Output:
1 (2, 3) {'x': 4, 'y': 5}
10 (20,) {'z': 30}

a gets the first positional value, the remaining positionals go to the args tuple, and keyword arguments go to the kwargs dict. * and ** unpack in the call.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

x = 10
def show():
    print(x)
def change():
    x = 20
    print(x)
show(); change(); print(x)
`,
      a: `Output:
10
20
10

show() reads the global x. change() creates a new local x = 20, so the global x is still 10.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

def outer():
    n = 1
    def inner():
        nonlocal n
        n += 5
    inner()
    inner()
    return n
print(outer())
`,
      a: `Output:
11

nonlocal lets inner() modify n of outer(). It runs twice: 1 + 5 + 5 = 11.`,
      level: "Medium",
    },
    {
      q: "Why does this give UnboundLocalError? x = 5; def f(): print(x); x = 6",
      a: "Because x is assigned inside f, Python decides at compile time that x is local for the whole function. print(x) runs before the local x has a value, so UnboundLocalError is raised. Fix with global x, or rename the local variable.",
      level: "Hard",
    },
    {
      q: "What is a keyword-only argument?",
      a: "A parameter that can only be passed by name. It appears after *args or a bare * in the definition, e.g. def f(a, *, sep): ... must be called as f(1, sep=\"-\").",
      level: "Medium",
    },
    {
      q: "What is the correct order of parameters in a definition?",
      a: "positional / normal parameters, then parameters with defaults, then *args, then keyword-only parameters, then **kwargs. (Positional-only parameters, marked with /, come first if used.)",
      level: "Medium",
    },
    {
      q: "Why should you avoid naming a variable list or sum?",
      a: "It shadows the built-in in the global or local scope (LEGB finds your variable first), so calls like list(\"abc\") or sum(nums) will then fail.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Write multiply(*nums) that returns the product of all numbers (1 if none given).",
      hint: "Start with result = 1 and loop over nums.",
      solution: `def multiply(*nums):
    result = 1
    for n in nums:
        result *= n
    return result

print(multiply(2, 3, 4))
print(multiply())
`,
    },
    {
      task: "Write build_url(base, **params) that returns base + \"?\" + \"k=v&k2=v2\". Example: build_url(\"site.com/search\", q=\"python\", page=2).",
      hint: "Use \"&\".join(f\"{k}={v}\" for k, v in params.items()).",
      solution: `def build_url(base, **params):
    if not params:
        return base
    query = "&".join(f"{k}={v}" for k, v in params.items())
    return f"{base}?{query}"

print(build_url("site.com/search", q="python", page=2))
`,
    },
    {
      task: "Create a function make_bank(balance) that returns two inner functions deposit(amt) and get_balance() using nonlocal.",
      hint: "Define inner functions, use nonlocal balance in deposit, return both functions as a tuple.",
      solution: `def make_bank(balance):
    def deposit(amt):
        nonlocal balance
        balance += amt
    def get_balance():
        return balance
    return deposit, get_balance

deposit, get_balance = make_bank(500)
deposit(250)
print(get_balance())
`,
    },
    {
      task: "Write a function largest(first, *rest) that returns the largest of all given numbers without using max().",
      hint: "Assume first is the largest, then compare with each item in rest.",
      solution: `def largest(first, *rest):
    big = first
    for n in rest:
        if n > big:
            big = n
    return big

print(largest(4, 19, 7, 11))
`,
    },
    {
      task: "Use a global variable visits and a function visit() that increases it by 1. Call it 3 times and print visits.",
      hint: "Declare global visits inside the function.",
      solution: `visits = 0
def visit():
    global visits
    visits += 1

for _ in range(3):
    visit()
print(visits)
`,
    },
  ],
  quiz: [
    {
      question: "Inside a function, what is the type of args in def f(*args)?",
      options: [
        "list",
        "dict",
        "tuple",
        "set",
      ],
      answer: 2,
      explanation: "*args always collects positional arguments into a tuple.",
    },
    {
      question: "What does LEGB stand for?",
      options: [
        "Local, Enclosing, Global, Built-in",
        "Local, External, General, Base",
        "List, Enum, Global, Bool",
        "Loop, Else, Global, Break",
      ],
      answer: 0,
      explanation: "Python searches Local, Enclosing, Global, then Built-in scopes.",
    },
    {
      question: "Which keyword lets a nested function modify a variable of its outer function?",
      options: [
        "global",
        "outer",
        "static",
        "nonlocal",
      ],
      answer: 3,
      explanation: "nonlocal refers to the nearest enclosing function scope.",
    },
    {
      question: "In def f(a, *args, b), how must b be passed?",
      options: [
        "Positionally only",
        "As a keyword argument only",
        "It cannot be passed",
        "Either way",
      ],
      answer: 1,
      explanation: "Parameters after *args are keyword-only.",
    },
    {
      question: "What does print(*[1, 2, 3], sep=\"-\") output?",
      options: [
        "[1, 2, 3]",
        "1 2 3",
        "1-2-3",
        "-1-2-3-",
      ],
      answer: 2,
      explanation: "* unpacks the list into three arguments joined by sep.",
    },
  ],
};
