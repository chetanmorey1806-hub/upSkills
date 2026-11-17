export default {
  id: "day-18-lambda-map-filter-reduce",
  title: "Lambda Functions, map(), filter(), reduce(), sorted() with key",
  module: "Module 3: Functions & Modules",
  day: 18,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Write small anonymous functions with lambda and combine them with map(), filter(), reduce() and sorted(key=...) to transform, select, combine and order data in a functional style.",
  objectives: [
    "Write lambda expressions and know their limits",
    "Transform data with map() and select data with filter()",
    "Combine a sequence into one value with functools.reduce()",
    "Sort complex data using sorted(), key functions and reverse",
    "Choose between lambda/map/filter and list comprehensions",
  ],
  theory: [
    {
      heading: "Lambda: One-Line Anonymous Functions",
      content: "A lambda is a small function without a name, written in one expression. It is useful when you need a tiny function for a short time, usually as an argument to another function. Think of it as a sticky note instruction instead of a full printed manual.",
      syntax: `lambda parameters: expression

square = lambda x: x * x
add = lambda a, b: a + b
`,
      points: [
        "Only ONE expression, no statements (no if blocks, loops, return or assignment)",
        "A conditional expression is allowed: lambda x: \"even\" if x % 2 == 0 else \"odd\"",
        "PEP 8: do not assign lambdas to names for real code; use def instead",
      ],
    },
    {
      heading: "map(): Apply a Function to Every Item",
      content: "map(function, iterable) calls the function on each item and returns a lazy map object (an iterator). Convert it with list() to see all values. Like a factory conveyor belt where each item passes through the same machine. map can take multiple iterables: map(lambda a, b: a + b, list1, list2).",
      syntax: `prices = [100, 200, 300]
with_gst = list(map(lambda p: p * 1.18, prices))
nums = list(map(int, ["1", "2", "3"]))
`,
    },
    {
      heading: "filter(): Keep Only Matching Items",
      content: "filter(function, iterable) keeps items for which the function returns a truthy value. It also returns a lazy iterator. Like a sieve that lets only some items pass. filter(None, items) removes all falsy values (0, \"\", None, []).",
      syntax: `evens = list(filter(lambda n: n % 2 == 0, range(10)))
clean = list(filter(None, ["a", "", "b", None]))
`,
    },
    {
      heading: "reduce(): Combine Everything into One Value",
      content: "reduce lives in the functools module. reduce(function, iterable, initial) takes the first two items, combines them, then combines the result with the next item, and so on until one value is left. Like rolling a snowball. Always pass an initial value if the list can be empty.",
      syntax: `from functools import reduce
total = reduce(lambda acc, x: acc + x, [1, 2, 3, 4], 0)   # 10
`,
    },
    {
      heading: "sorted() and the key Parameter",
      content: "sorted(iterable, key=None, reverse=False) returns a NEW sorted list and works on any iterable. list.sort() sorts the list in place and returns None. The key function is called once per item and its return value is used for comparison - perfect for sorting by length, by a dict field, or by multiple fields with a tuple. Python sort is stable: equal items keep their original order.",
      syntax: `sorted(words, key=len)
sorted(students, key=lambda s: s["marks"], reverse=True)
sorted(emps, key=lambda e: (e["dept"], -e["salary"]))
`,
      tip: "min() and max() also accept key=, e.g. max(students, key=lambda s: s[\"marks\"]).",
    },
    {
      heading: "Lambda/map/filter vs List Comprehension",
      content: "[x * 2 for x in nums] and list(map(lambda x: x * 2, nums)) do the same thing. Comprehensions are usually more readable in Python. map is neat when you already have a named function, like map(int, values) or map(str.upper, names).",
    },
  ],
  examples: [
    {
      title: "Lambda Basics",
      scenario: "Create quick helper functions for a calculator and a label maker.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `square = lambda x: x * x
add = lambda a, b: a + b
parity = lambda n: "even" if n % 2 == 0 else "odd"

print(square(6))
print(add(10, 15))
print(parity(7), parity(10))
print((lambda name: f"Hello, {name}!")("Asha"))
print(type(square).__name__, square.__name__)
`,
      python: {
        files: {
          "main.py": `square = lambda x: x * x
add = lambda a, b: a + b
parity = lambda n: "even" if n % 2 == 0 else "odd"

print(square(6))
print(add(10, 15))
print(parity(7), parity(10))
print((lambda name: f"Hello, {name}!")("Asha"))
print(type(square).__name__, square.__name__)
`,
        },
      },
      result: `36
25
odd even
Hello, Asha!
function <lambda>`,
      explanation: "A lambda creates a function object just like def, but its __name__ is \"<lambda>\". The last print shows an immediately invoked lambda.",
    },
    {
      title: "map() and filter() on Shop Data",
      scenario: "Convert text input prices to numbers, add GST and keep only expensive items.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: 120 450 80 999 300",
        "Compare your terminal output with the result shown below",
      ],
      code: `raw = input("Enter prices: ").split()
prices = list(map(int, raw))
print("\\nPrices:", prices)

with_gst = list(map(lambda p: round(p * 1.18, 2), prices))
print("With GST:", with_gst)

costly = list(filter(lambda p: p > 300, with_gst))
print("Above 300:", costly)

names = ["pen", "bag", "laptop"]
qty = [10, 2, 1]
print(list(map(lambda n, q: f"{n} x{q}", names, qty)))
`,
      python: {
        files: {
          "main.py": `raw = input("Enter prices: ").split()
prices = list(map(int, raw))
print("\\nPrices:", prices)

with_gst = list(map(lambda p: round(p * 1.18, 2), prices))
print("With GST:", with_gst)

costly = list(filter(lambda p: p > 300, with_gst))
print("Above 300:", costly)

names = ["pen", "bag", "laptop"]
qty = [10, 2, 1]
print(list(map(lambda n, q: f"{n} x{q}", names, qty)))
`,
        },
        stdin: `120 450 80 999 300
`,
      },
      result: `Enter prices: 
Prices: [120, 450, 80, 999, 300]
With GST: [141.6, 531.0, 94.4, 1178.82, 354.0]
Above 300: [531.0, 1178.82, 354.0]
['pen x10', 'bag x2', 'laptop x1']`,
      explanation: "map(int, raw) converts each string to int. map with lambda applies GST. filter keeps only values above 300. map can also walk two lists in parallel.",
    },
    {
      title: "reduce(): Total, Maximum and Product",
      scenario: "Combine a list of order amounts into single values.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import reduce

orders = [250, 1200, 75, 640]
total = reduce(lambda acc, x: acc + x, orders, 0)
biggest = reduce(lambda a, b: a if a > b else b, orders)
product = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])
print("Total:", total)
print("Biggest:", biggest)
print("5! =", product)
print("Empty with initial:", reduce(lambda a, b: a + b, [], 0))
`,
      python: {
        files: {
          "main.py": `from functools import reduce

orders = [250, 1200, 75, 640]
total = reduce(lambda acc, x: acc + x, orders, 0)
biggest = reduce(lambda a, b: a if a > b else b, orders)
product = reduce(lambda a, b: a * b, [1, 2, 3, 4, 5])
print("Total:", total)
print("Biggest:", biggest)
print("5! =", product)
print("Empty with initial:", reduce(lambda a, b: a + b, [], 0))
`,
        },
      },
      result: `Total: 2165
Biggest: 1200
5! = 120
Empty with initial: 0`,
      explanation: "reduce combines items pairwise from left to right. The initial value 0 makes it safe for an empty list (without it, reduce raises TypeError on an empty list).",
    },
    {
      title: "sorted() with key: Ranking Students",
      scenario: "Sort a class list by marks, by name length and by multiple fields.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `students = [
    {"name": "Ravi", "marks": 82, "city": "Pune"},
    {"name": "Asha", "marks": 95, "city": "Delhi"},
    {"name": "Neha", "marks": 82, "city": "Agra"},
    {"name": "Kiran", "marks": 70, "city": "Pune"},
]

by_marks = sorted(students, key=lambda s: s["marks"], reverse=True)
print([s["name"] for s in by_marks])

by_marks_then_name = sorted(students, key=lambda s: (-s["marks"], s["name"]))
print([(s["name"], s["marks"]) for s in by_marks_then_name])

words = ["banana", "kiwi", "apple", "fig"]
print(sorted(words, key=len))
print(sorted(words, key=str.lower, reverse=True))

topper = max(students, key=lambda s: s["marks"])
print("Topper:", topper["name"])
`,
      python: {
        files: {
          "main.py": `students = [
    {"name": "Ravi", "marks": 82, "city": "Pune"},
    {"name": "Asha", "marks": 95, "city": "Delhi"},
    {"name": "Neha", "marks": 82, "city": "Agra"},
    {"name": "Kiran", "marks": 70, "city": "Pune"},
]

by_marks = sorted(students, key=lambda s: s["marks"], reverse=True)
print([s["name"] for s in by_marks])

by_marks_then_name = sorted(students, key=lambda s: (-s["marks"], s["name"]))
print([(s["name"], s["marks"]) for s in by_marks_then_name])

words = ["banana", "kiwi", "apple", "fig"]
print(sorted(words, key=len))
print(sorted(words, key=str.lower, reverse=True))

topper = max(students, key=lambda s: s["marks"])
print("Topper:", topper["name"])
`,
        },
      },
      result: `['Asha', 'Ravi', 'Neha', 'Kiran']
[('Asha', 95), ('Neha', 82), ('Ravi', 82), ('Kiran', 70)]
['fig', 'kiwi', 'apple', 'banana']
['kiwi', 'fig', 'banana', 'apple']
Topper: Asha`,
      explanation: "key decides what to compare. A tuple key sorts by the first item, then the second for ties. Negating marks sorts numbers descending while names stay ascending. Stable sort keeps Ravi before Neha in the first result because both have 82.",
    },
  ],
  interview: [
    {
      q: "What is a lambda function?",
      a: "An anonymous, single-expression function created with the lambda keyword, e.g. lambda x: x * 2. It is mostly used as a short argument to functions like map, filter and sorted.",
      level: "Easy",
    },
    {
      q: "What are the limitations of lambda?",
      a: "It can contain only one expression - no statements such as loops, assignments, try/except or multiple lines. It has no name (__name__ is \"<lambda>\"), which makes tracebacks less clear.",
      level: "Medium",
    },
    {
      q: "What does map() return in Python 3?",
      a: "A lazy map object (an iterator), not a list. Use list(map(...)) to materialise it. Once consumed, it is empty.",
      level: "Medium",
    },
    {
      q: "What is the difference between sorted() and list.sort()?",
      a: "sorted() works on any iterable and returns a new list. list.sort() only works on lists, sorts in place and returns None.",
      level: "Easy",
    },
    {
      q: `What is the output of this code?

nums = [1, 2, 3, 4, 5, 6]
print(list(map(lambda x: x ** 2, filter(lambda x: x % 2, nums))))
`,
      a: `Output:
[1, 9, 25]

filter keeps odd numbers (x % 2 is 1, truthy): 1, 3, 5. map squares them.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

from functools import reduce
print(reduce(lambda a, b: a * 10 + b, [1, 2, 3, 4]))
`,
      a: `Output:
1234

Steps: 1*10+2=12, 12*10+3=123, 123*10+4=1234.`,
      level: "Medium",
    },
    {
      q: `What is the output of this code?

m = map(str.upper, ["a", "b"])
print(list(m))
print(list(m))
`,
      a: `Output:
['A', 'B']
[]

A map object is an iterator; after it is consumed once, it yields nothing more.`,
      level: "Hard",
    },
    {
      q: `What is the output of this code?

words = ["bb", "a", "ccc", "dd"]
print(sorted(words, key=len))
print(sorted(words, key=lambda w: (-len(w), w)))
`,
      a: `Output:
['a', 'bb', 'dd', 'ccc']
['ccc', 'bb', 'dd', 'a']

The first sort is by length; "bb" and "dd" keep their original order (stable sort). The second sorts by length descending and then alphabetically.`,
      level: "Medium",
    },
    {
      q: "Where is reduce() defined and why was it moved?",
      a: "In the functools module. Guido moved it out of built-ins in Python 3 because explicit loops or sum()/max() are usually more readable.",
      level: "Medium",
    },
    {
      q: "When would you choose a list comprehension over map/filter?",
      a: "When you need a lambda anyway - a comprehension like [x*2 for x in nums if x > 0] is more readable than list(map(lambda x: x*2, filter(lambda x: x > 0, nums))). map is fine with an existing function such as map(int, items).",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Using map and lambda, convert a list of temperatures in Celsius [0, 25, 37, 100] to Fahrenheit.",
      hint: "F = C * 9/5 + 32",
      solution: `celsius = [0, 25, 37, 100]
fahrenheit = list(map(lambda c: c * 9 / 5 + 32, celsius))
print(fahrenheit)
`,
    },
    {
      task: "Using filter, keep only palindromes from [\"madam\", \"python\", \"level\", \"noon\", \"code\"].",
      hint: "A palindrome equals its reverse: w == w[::-1].",
      solution: `words = ["madam", "python", "level", "noon", "code"]
print(list(filter(lambda w: w == w[::-1], words)))
`,
    },
    {
      task: "Using reduce, find the longest word in a list.",
      hint: "Compare lengths of a and b inside the lambda.",
      solution: `from functools import reduce
words = ["java", "python", "go", "javascript"]
print(reduce(lambda a, b: a if len(a) >= len(b) else b, words))
`,
    },
    {
      task: "Sort a list of (product, price) tuples by price ascending, then print the cheapest and costliest using min and max with key.",
      hint: "key=lambda item: item[1]",
      solution: `items = [("mouse", 499), ("keyboard", 899), ("cable", 149), ("monitor", 7999)]
print(sorted(items, key=lambda item: item[1]))
print(min(items, key=lambda item: item[1]))
print(max(items, key=lambda item: item[1]))
`,
    },
    {
      task: "Sort employees by department (A-Z) and within department by salary (high to low).",
      hint: "Use a tuple key: (dept, -salary).",
      solution: `emps = [("Ravi", "IT", 50000), ("Asha", "HR", 45000), ("Neha", "IT", 70000), ("Om", "HR", 52000)]
for e in sorted(emps, key=lambda e: (e[1], -e[2])):
    print(e)
`,
    },
  ],
  quiz: [
    {
      question: "What does lambda x, y: x + y create?",
      options: [
        "A tuple",
        "A function",
        "A list",
        "A syntax error",
      ],
      answer: 1,
      explanation: "lambda creates an anonymous function object.",
    },
    {
      question: "Which module must you import to use reduce()?",
      options: [
        "itertools",
        "math",
        "operator",
        "functools",
      ],
      answer: 3,
      explanation: "reduce is in functools in Python 3.",
    },
    {
      question: "What does list(filter(None, [0, 1, \"\", \"a\", None])) return?",
      options: [
        "[1, \"a\"]",
        "[0, \"\", None]",
        "[0, 1, \"\", \"a\", None]",
        "[]",
      ],
      answer: 0,
      explanation: "filter(None, ...) keeps only truthy values.",
    },
    {
      question: "What does [3, 1, 2].sort() return?",
      options: [
        "[1, 2, 3]",
        "[3, 2, 1]",
        "None",
        "An error",
      ],
      answer: 2,
      explanation: "list.sort() sorts in place and returns None.",
    },
    {
      question: "sorted([\"bb\", \"a\", \"ccc\"], key=len, reverse=True) gives:",
      options: [
        "[\"a\", \"bb\", \"ccc\"]",
        "[\"ccc\", \"bb\", \"a\"]",
        "[\"bb\", \"ccc\", \"a\"]",
        "[\"a\", \"ccc\", \"bb\"]",
      ],
      answer: 1,
      explanation: "Sort by length, descending.",
    },
  ],
};
