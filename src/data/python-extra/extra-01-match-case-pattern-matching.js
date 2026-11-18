export default {
  id: "extra-01-match-case-pattern-matching",
  title: "match-case: Structural Pattern Matching",
  module: "Module 1: Modern Python Syntax",
  extraNo: 1,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Learn Python's match-case statement (added in Python 3.10) to compare a value against shapes and patterns: literals, sequences, dictionaries, class objects, guards and OR-patterns. It replaces long if-elif chains and makes parsing commands, JSON and events clean and readable.",
  objectives: [
    "Write match-case statements with literal, capture and wildcard patterns",
    "Destructure lists, tuples and dictionaries directly inside case clauses",
    "Match objects with class patterns and __match_args__",
    "Use guards (if), OR-patterns (|) and the as keyword",
    "Explain how match-case differs from a C/Java switch statement",
  ],
  theory: [
    {
      heading: "What is Structural Pattern Matching?",
      content: `Structural pattern matching was added in Python 3.10 (PEP 634). The \`match\` statement takes a value (called the **subject**) and checks it against a series of \`case\` blocks from top to bottom. The first case whose pattern fits runs, and the rest are skipped.

It looks like a \`switch\` from C or Java, but it is much more powerful. A switch only compares a value with constants. Python's match can also look *inside* the value: it checks the shape of a list, the keys of a dict, or the type and attributes of an object, and it pulls out (binds) parts of the value into variables at the same time.`,
      syntax: `match subject:
    case pattern_1:
        ...
    case pattern_2 if condition:   # guard
        ...
    case _:                        # wildcard: matches anything
        ...
`,
      points: [
        "There is no fall-through: only ONE case runs, no break needed",
        "If no case matches and there is no `case _`, nothing happens (no error)",
        "match and case are soft keywords: you can still use them as variable names elsewhere",
      ],
    },
    {
      heading: "Literal, Capture and Wildcard Patterns",
      content: `A **literal pattern** compares with a constant: numbers, strings, \`True\`, \`False\`, \`None\`. A **capture pattern** is a bare name such as \`case x:\` - it always matches and stores the subject in \`x\`. The **wildcard** \`_\` matches anything but does not store it.

Because a bare name is a capture, you cannot match against a normal variable like \`case MAX:\` - that would capture, not compare. To compare against a named constant, use a dotted name such as \`case Color.RED:\` or \`case settings.MAX:\`.`,
      points: [
        "`case 200:` literal - compares with ==",
        "`case None:` / `case True:` - compared with `is`",
        "`case code:` - capture, always matches (Python raises SyntaxError if it is not the last case, because it makes later cases unreachable)",
        "`case Status.OK:` - value pattern, compares with a dotted constant",
      ],
      tip: "A classic bug: writing `case expected_value:` thinking it compares. It captures and matches everything. Always use a dotted name or a literal.",
    },
    {
      heading: "Sequence Patterns (lists and tuples)",
      content: "Sequence patterns look like list or tuple literals. They check that the subject is a sequence (list, tuple, but NOT str, bytes or bytearray), check its length, and match each element. You can use `*rest` to collect any number of remaining items, just like star unpacking.",
      syntax: `match command.split():
    case []:                       # empty list
        ...
    case ["quit"]:                 # exactly one item "quit"
        ...
    case ["go", direction]:        # two items, capture 2nd
        ...
    case ["drop", *items]:         # first is "drop", rest in a list
        ...
`,
      tip: "Strings are deliberately not treated as sequences in patterns, so `case [a, b]:` will never match the string \"ab\".",
    },
    {
      heading: "Mapping Patterns (dictionaries)",
      content: "Mapping patterns look like dict literals: `case {\"type\": \"click\", \"x\": x, \"y\": y}:`. The subject must be a mapping, the listed keys must exist, and their values must match the sub-patterns. **Extra keys are ignored**, which makes this perfect for JSON data from APIs. Use `**rest` to capture the remaining keys.",
      syntax: `match event:
    case {"type": "login", "user": str(name)}:
        print("Welcome", name)
    case {"type": "order", "items": [first, *_]}:
        print("First item:", first)
`,
    },
    {
      heading: "Class Patterns and __match_args__",
      content: `A class pattern looks like a constructor call: \`case Point(x=0, y=0):\`. Python first checks \`isinstance(subject, Point)\`, then checks attributes. Keyword sub-patterns compare attributes by name. Positional sub-patterns like \`Point(0, y)\` need the class to define \`__match_args__\`, a tuple giving the attribute order. Dataclasses and namedtuples create \`__match_args__\` automatically.

Built-in types also work as class patterns: \`case int():\`, \`case str(s):\`, \`case float(f):\`. For these built-ins, one positional pattern matches the whole value.`,
      syntax: `from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int          # __match_args__ = ("x", "y") is generated

match p:
    case Point(0, 0):        print("origin")
    case Point(x=0, y=y):    print("on Y axis at", y)
    case Point():            print("some other point")
`,
    },
    {
      heading: "Guards, OR-Patterns and the as Keyword",
      content: "A **guard** is an `if` after the pattern: `case [x, y] if x == y:`. The pattern must match first and then the guard must be true. An **OR-pattern** combines alternatives with `|`: `case 401 | 403:`. All alternatives must bind the same variable names. The **as** keyword captures the matched part of a sub-pattern: `case [(\"add\" | \"sub\") as op, a, b]:`.",
      points: [
        "Guards run only after a successful structural match",
        "`case \"y\" | \"yes\" | \"Y\":` - several literals in one case",
        "`case int(n) | float(n):` - both sides bind n, so it is allowed",
      ],
    },
    {
      heading: "When to Use match-case (and When Not)",
      content: `Use match-case when you branch on the **shape** of data: command parsers, JSON/API payloads, message/event handling, abstract syntax trees, and state machines. For a simple check like \`if age >= 18\`, a normal if statement is clearer. Also remember match-case needs Python 3.10+, so projects that support older versions cannot use it.

Performance is similar to an if-elif chain: cases are tried top to bottom. Its real benefit is readability and safe destructuring.`,
      tip: "Put specific cases first and general ones (like `case _`) last. A general case placed early hides the specific ones below it.",
    },
  ],
  examples: [
    {
      title: "HTTP Status Code Handler",
      scenario: "A backend developer wants to convert HTTP status codes into friendly messages instead of writing a long if-elif chain.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `def describe(status):
    match status:
        case 200 | 201:
            return "Success"
        case 301 | 302:
            return "Redirect"
        case 401 | 403:
            return "Not allowed"
        case 404:
            return "Not found"
        case code if 500 <= code < 600:
            return f"Server error ({code})"
        case _:
            return "Unknown status"

for s in [200, 302, 403, 404, 503, 999]:
    print(s, "->", describe(s))
`,
      python: {
        files: {
          "main.py": `def describe(status):
    match status:
        case 200 | 201:
            return "Success"
        case 301 | 302:
            return "Redirect"
        case 401 | 403:
            return "Not allowed"
        case 404:
            return "Not found"
        case code if 500 <= code < 600:
            return f"Server error ({code})"
        case _:
            return "Unknown status"

for s in [200, 302, 403, 404, 503, 999]:
    print(s, "->", describe(s))
`,
        },
      },
      result: `200 -> Success
302 -> Redirect
403 -> Not allowed
404 -> Not found
503 -> Server error (503)
999 -> Unknown status`,
      explanation: "OR-patterns (`|`) group several literals. `case code if 500 <= code < 600` captures the value into `code` and the guard checks the range. Anything else falls to the wildcard `_`.",
    },
    {
      title: "Text Command Parser",
      scenario: "A simple shopping-cart CLI reads text commands like 'add pen 3' and must react to each command shape.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `cart = {}

def handle(line):
    match line.split():
        case []:
            print("Empty command")
        case ["add", item]:
            cart[item] = cart.get(item, 0) + 1
            print(f"Added 1 {item}")
        case ["add", item, qty] if qty.isdigit():
            cart[item] = cart.get(item, 0) + int(qty)
            print(f"Added {qty} {item}")
        case ["remove", *items]:
            for it in items:
                cart.pop(it, None)
            print("Removed", items)
        case ["show"]:
            print("Cart:", cart)
        case [cmd, *_]:
            print(f"Unknown command: {cmd}")

for line in ["add pen", "add book 3", "add pencil 2", "remove pen", "", "show", "buy now"]:
    handle(line)
`,
      python: {
        files: {
          "main.py": `cart = {}

def handle(line):
    match line.split():
        case []:
            print("Empty command")
        case ["add", item]:
            cart[item] = cart.get(item, 0) + 1
            print(f"Added 1 {item}")
        case ["add", item, qty] if qty.isdigit():
            cart[item] = cart.get(item, 0) + int(qty)
            print(f"Added {qty} {item}")
        case ["remove", *items]:
            for it in items:
                cart.pop(it, None)
            print("Removed", items)
        case ["show"]:
            print("Cart:", cart)
        case [cmd, *_]:
            print(f"Unknown command: {cmd}")

for line in ["add pen", "add book 3", "add pencil 2", "remove pen", "", "show", "buy now"]:
    handle(line)
`,
        },
      },
      result: `Added 1 pen
Added 3 book
Added 2 pencil
Removed ['pen']
Empty command
Cart: {'book': 3, 'pencil': 2}
Unknown command: buy`,
      explanation: "`line.split()` gives a list, and each case checks the length and first word. `item` and `qty` are captured; the guard checks qty is a number. `*items` collects all remaining words. The last case catches any other non-empty command.",
    },
    {
      title: "Processing JSON Events from an API",
      scenario: "A payment service receives JSON events (already parsed into dicts) and must handle each event type differently. Extra keys must be ignored.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `events = [
    {"type": "payment", "amount": 499.0, "currency": "INR", "id": "p1"},
    {"type": "refund", "amount": 100, "reason": "damaged"},
    {"type": "login", "user": {"name": "Asha", "role": "admin"}},
    {"type": "login", "user": {"name": "Ravi", "role": "customer"}},
    {"type": "logout"},
]

for e in events:
    match e:
        case {"type": "payment", "amount": float(amt) | int(amt), "currency": cur}:
            print(f"Payment of {amt} {cur}")
        case {"type": "refund", "amount": amt, **rest}:
            print(f"Refund {amt}, extra info: {rest}")
        case {"type": "login", "user": {"role": "admin", "name": name}}:
            print(f"Admin {name} logged in - enable audit")
        case {"type": "login", "user": {"name": name}}:
            print(f"{name} logged in")
        case {"type": other}:
            print(f"Ignoring event type '{other}'")
`,
      python: {
        files: {
          "main.py": `events = [
    {"type": "payment", "amount": 499.0, "currency": "INR", "id": "p1"},
    {"type": "refund", "amount": 100, "reason": "damaged"},
    {"type": "login", "user": {"name": "Asha", "role": "admin"}},
    {"type": "login", "user": {"name": "Ravi", "role": "customer"}},
    {"type": "logout"},
]

for e in events:
    match e:
        case {"type": "payment", "amount": float(amt) | int(amt), "currency": cur}:
            print(f"Payment of {amt} {cur}")
        case {"type": "refund", "amount": amt, **rest}:
            print(f"Refund {amt}, extra info: {rest}")
        case {"type": "login", "user": {"role": "admin", "name": name}}:
            print(f"Admin {name} logged in - enable audit")
        case {"type": "login", "user": {"name": name}}:
            print(f"{name} logged in")
        case {"type": other}:
            print(f"Ignoring event type '{other}'")
`,
        },
      },
      result: `Payment of 499.0 INR
Refund 100, extra info: {'reason': 'damaged'}
Admin Asha logged in - enable audit
Ravi logged in
Ignoring event type 'logout'`,
      explanation: "Mapping patterns check only the listed keys, so the extra `id` key is ignored. Nested patterns go inside the user dict. `**rest` captures leftover keys. The admin case is placed before the general login case so it wins.",
    },
    {
      title: "Class Patterns with Dataclasses",
      scenario: "A drawing app stores shapes as dataclass objects and must calculate area for each shape type.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `from dataclasses import dataclass
import math

@dataclass
class Circle:
    r: float

@dataclass
class Rect:
    w: float
    h: float

def area(shape):
    match shape:
        case Circle(r=0) | Rect(w=0) | Rect(h=0):
            return 0
        case Circle(r):
            return round(math.pi * r * r, 2)
        case Rect(w, h) if w == h:
            print("  (it is a square)")
            return w * h
        case Rect(w, h):
            return w * h
        case _:
            raise TypeError(f"Unknown shape: {shape!r}")

for s in [Circle(2), Rect(3, 4), Rect(5, 5), Rect(0, 9)]:
    print(s, "->", area(s))
print(Rect.__match_args__)
`,
      python: {
        files: {
          "main.py": `from dataclasses import dataclass
import math

@dataclass
class Circle:
    r: float

@dataclass
class Rect:
    w: float
    h: float

def area(shape):
    match shape:
        case Circle(r=0) | Rect(w=0) | Rect(h=0):
            return 0
        case Circle(r):
            return round(math.pi * r * r, 2)
        case Rect(w, h) if w == h:
            print("  (it is a square)")
            return w * h
        case Rect(w, h):
            return w * h
        case _:
            raise TypeError(f"Unknown shape: {shape!r}")

for s in [Circle(2), Rect(3, 4), Rect(5, 5), Rect(0, 9)]:
    print(s, "->", area(s))
print(Rect.__match_args__)
`,
        },
      },
      result: `Circle(r=2) -> 12.57
Rect(w=3, h=4) -> 12
  (it is a square)
Rect(w=5, h=5) -> 25
Rect(w=0, h=9) -> 0
('w', 'h')`,
      explanation: "Dataclasses generate `__match_args__ = ('w', 'h')`, so `Rect(w, h)` can match positionally. The first case uses keyword patterns with OR to catch zero-size shapes. A guard detects squares.",
    },
    {
      title: "Matching Types and Capturing with as",
      scenario: "A data-cleaning function receives mixed values from a CSV import and must normalise them.",
      steps: [
        "Open VS Code or PyCharm and create a folder for this lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (or click Run in the in-browser IDE)",
        "Compare your terminal output with the result shown below",
      ],
      code: `def clean(value):
    match value:
        case None | "":
            return "missing"
        case bool():
            return f"flag:{value}"
        case int(n) | float(n) if n < 0:
            return f"negative:{n}"
        case int() | float() as num:
            return f"number:{num}"
        case str() as s if s.strip().isdigit():
            return f"numeric text:{int(s)}"
        case [*items] as lst:
            return f"list of {len(lst)}"
        case _:
            return f"text:{value}"

for v in [None, "", True, -5, 3.5, " 42 ", [1, 2, 3], "hello"]:
    print(repr(v), "=>", clean(v))
`,
      python: {
        files: {
          "main.py": `def clean(value):
    match value:
        case None | "":
            return "missing"
        case bool():
            return f"flag:{value}"
        case int(n) | float(n) if n < 0:
            return f"negative:{n}"
        case int() | float() as num:
            return f"number:{num}"
        case str() as s if s.strip().isdigit():
            return f"numeric text:{int(s)}"
        case [*items] as lst:
            return f"list of {len(lst)}"
        case _:
            return f"text:{value}"

for v in [None, "", True, -5, 3.5, " 42 ", [1, 2, 3], "hello"]:
    print(repr(v), "=>", clean(v))
`,
        },
      },
      result: `None => missing
'' => missing
True => flag:True
-5 => negative:-5
3.5 => number:3.5
' 42 ' => numeric text:42
[1, 2, 3] => list of 3
'hello' => text:hello`,
      explanation: "`bool()` is checked before `int()` because True is also an int. `as num` captures the matched value. Guards add extra conditions. `[*items]` matches any list or tuple of any length.",
    },
  ],
  interview: [
    {
      q: "What is structural pattern matching in Python and which version introduced it?",
      a: "It is the `match`/`case` statement added in Python 3.10 (PEPs 634, 635, 636). It compares a subject value against patterns that can check type, length, keys and attributes, and it binds parts of the value to variables in the same step.",
      level: "Easy",
    },
    {
      q: "How is match-case different from switch in C or Java?",
      a: "A switch compares one value with constants and often needs break to stop fall-through. Python's match has no fall-through (only the first matching case runs), and patterns can destructure sequences, mappings and objects, use guards, OR-patterns and capture variables. It is closer to pattern matching in Rust, Scala or Haskell.",
      level: "Easy",
    },
    {
      q: "What does `case _:` do?",
      a: "`_` is the wildcard pattern. It matches anything and does not bind a variable. It is used as the default/fallback case and should be last.",
      level: "Easy",
    },
    {
      q: "Why does `case MAX_SIZE:` not compare with the variable MAX_SIZE?",
      a: "A bare name in a pattern is a **capture pattern**: it always matches and assigns the subject to that name. To compare against a constant use a dotted name (`case Config.MAX_SIZE:`), an Enum member, or a literal. Python even raises a SyntaxError ('name capture makes remaining patterns unreachable') if a bare capture is not the last case.",
      level: "Medium",
    },
    {
      q: "What happens if no case matches and there is no wildcard?",
      a: "Nothing - the match statement simply finishes and execution continues after it. No exception is raised. If you need an error, add `case _: raise ValueError(...)`.",
      level: "Easy",
    },
    {
      q: "Do mapping patterns require the dict to have exactly the listed keys?",
      a: "No. Mapping patterns only require the listed keys to be present and their values to match. Extra keys are ignored. Use `**rest` if you want to capture the extra keys.",
      level: "Medium",
    },
    {
      q: "Why does `case [a, b]:` not match the string \"ab\"?",
      a: "Sequence patterns deliberately exclude str, bytes and bytearray, because treating a string as a sequence of characters would cause many surprising matches. Only lists, tuples, ranges and other collections.abc.Sequence types (except those string types) match.",
      level: "Medium",
    },
    {
      q: "What is __match_args__ and when is it needed?",
      a: "`__match_args__` is a class attribute tuple that maps positional sub-patterns to attribute names. `case Point(1, 2)` becomes a check of `x == 1` and `y == 2` when `__match_args__ = ('x', 'y')`. Dataclasses and namedtuples generate it automatically; for a normal class you must define it yourself or use keyword patterns.",
      level: "Hard",
    },
    {
      q: "What is a guard in a case clause?",
      a: "A guard is an `if` condition after the pattern, e.g. `case [x, y] if x > y:`. The pattern is matched first (and variables are bound), then the guard is evaluated. If the guard is false, Python moves on to the next case.",
      level: "Medium",
    },
    {
      q: "What are the rules for OR-patterns?",
      a: "Alternatives are separated by `|`, e.g. `case 'y' | 'yes':`. Each alternative must bind exactly the same set of names, otherwise it is a SyntaxError, because the code inside the case must be able to use those names whichever alternative matched.",
      level: "Hard",
    },
    {
      q: "Why should `case bool():` come before `case int():`?",
      a: "bool is a subclass of int, so `isinstance(True, int)` is True. If `case int():` came first, True and False would be treated as numbers. Specific types must be checked before their parent types.",
      level: "Hard",
    },
    {
      q: "When would you NOT use match-case?",
      a: "For simple boolean conditions or ranges (`if salary > 50000`), a plain if is clearer. Also avoid it if the code must run on Python 3.9 or older. match-case shines when branching on the structure of data.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a function `day_type(day)` using match-case that returns 'Weekend' for 'sat'/'sun', 'Weekday' for 'mon'..'fri' and 'Invalid' otherwise. Test it with sun, wed and xyz.",
      hint: "Use OR-patterns: case 'sat' | 'sun':",
      solution: `def day_type(day):
    match day.lower():
        case "sat" | "sun":
            return "Weekend"
        case "mon" | "tue" | "wed" | "thu" | "fri":
            return "Weekday"
        case _:
            return "Invalid"

for d in ["sun", "Wed", "xyz"]:
    print(d, day_type(d))
`,
    },
    {
      task: "Build a calculator: given a string like '10 + 5' or '8 / 0', split it and use a sequence pattern to compute the answer. Handle +, -, *, / and division by zero, and print 'Bad input' for anything else.",
      hint: "match expr.split(): case [a, '+', b]: ... and use a guard for b == '0'.",
      solution: `def calc(expr):
    match expr.split():
        case [a, "+", b]:
            return float(a) + float(b)
        case [a, "-", b]:
            return float(a) - float(b)
        case [a, "*", b]:
            return float(a) * float(b)
        case [a, "/", b] if float(b) == 0:
            return "Cannot divide by zero"
        case [a, "/", b]:
            return float(a) / float(b)
        case _:
            return "Bad input"

for e in ["10 + 5", "6 * 7", "8 / 0", "9 / 3", "hello"]:
    print(e, "=", calc(e))
`,
    },
    {
      task: "You receive API responses as dicts: {'status': 'ok', 'data': {...}}, {'status': 'error', 'code': 404} or {'status': 'error', 'code': 500, 'retry': True}. Write a handler that prints a suitable message for each.",
      hint: "Put the more specific mapping (with 'retry') before the general error case.",
      solution: `def handle(resp):
    match resp:
        case {"status": "ok", "data": data}:
            print("Got data:", data)
        case {"status": "error", "code": code, "retry": True}:
            print(f"Error {code}, retrying...")
        case {"status": "error", "code": 404}:
            print("Resource not found")
        case {"status": "error", "code": code}:
            print("Failed with code", code)
        case _:
            print("Unexpected response")

handle({"status": "ok", "data": {"id": 1}})
handle({"status": "error", "code": 404})
handle({"status": "error", "code": 500, "retry": True})
handle({"status": "error", "code": 400})
handle("garbage")
`,
    },
    {
      task: "Create a dataclass `Employee(name, dept, salary)`. Using class patterns, print a bonus: IT employees with salary above 80000 get 10%, any IT employee gets 5%, HR gets a flat 3000, others get 0.",
      hint: "case Employee(dept='IT', salary=s) if s > 80000:",
      solution: `from dataclasses import dataclass

@dataclass
class Employee:
    name: str
    dept: str
    salary: int

def bonus(emp):
    match emp:
        case Employee(dept="IT", salary=s) if s > 80000:
            return s * 0.10
        case Employee(dept="IT", salary=s):
            return s * 0.05
        case Employee(dept="HR"):
            return 3000
        case _:
            return 0

staff = [Employee("Asha", "IT", 90000), Employee("Ravi", "IT", 50000),
         Employee("Meena", "HR", 40000), Employee("John", "Sales", 45000)]
for e in staff:
    print(e.name, bonus(e))
`,
    },
  ],
  quiz: [
    {
      question: "Which Python version first supports match-case?",
      options: [
        "3.8",
        "3.9",
        "3.10",
        "3.12",
      ],
      answer: 2,
      explanation: "Structural pattern matching arrived in Python 3.10 via PEP 634.",
    },
    {
      question: "What does `case x:` (a bare name) do?",
      options: [
        "Compares the subject with variable x",
        "Always matches and binds the subject to x",
        "Raises NameError if x is undefined",
        "Matches only if x is None",
      ],
      answer: 1,
      explanation: "A bare name is a capture pattern: it always matches and stores the subject.",
    },
    {
      question: "Which subject will match `case [first, *rest]:`?",
      options: [
        "\"hello\"",
        "[]",
        "[10]",
        "{\"a\": 1}",
      ],
      answer: 2,
      explanation: "It needs a non-string sequence with at least one item. [10] gives first=10, rest=[]. Strings are excluded and [] is too short.",
    },
    {
      question: "For a mapping pattern `case {\"id\": i}:`, the subject {\"id\": 5, \"name\": \"A\"} will...",
      options: [
        "Not match because of the extra key",
        "Match with i = 5",
        "Raise KeyError",
        "Match with i = {\"id\": 5}",
      ],
      answer: 1,
      explanation: "Mapping patterns ignore extra keys; only listed keys must be present.",
    },
    {
      question: "How many case blocks run when several patterns could match?",
      options: [
        "All matching ones",
        "Only the first matching one",
        "Only the last matching one",
        "None, it raises an error",
      ],
      answer: 1,
      explanation: "Cases are tried top to bottom and only the first match runs. There is no fall-through.",
    },
    {
      question: "What enables `case Point(3, 4):` with positional sub-patterns on a normal class?",
      options: [
        "__slots__",
        "__init__ parameters",
        "__match_args__",
        "__eq__",
      ],
      answer: 2,
      explanation: "__match_args__ tells Python which attribute each positional sub-pattern refers to.",
    },
  ],
};
