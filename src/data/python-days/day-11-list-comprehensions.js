export default {
  id: "day-11-list-comprehensions",
  title: "List Comprehensions and Common List Programs",
  module: "Module 2: Data Structures",
  day: 11,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Write short, readable list comprehensions (with filters, if-else, nested loops) and practise the list programs most frequently asked in fresher interviews.",
  objectives: [
    "Convert a for-append loop into a list comprehension",
    "Add filtering (if) and transformation (if-else) inside comprehensions",
    "Use nested comprehensions to flatten lists and build matrices",
    "Know when NOT to use a comprehension (readability, side effects)",
    "Solve common list programs: max/min without built-ins, reverse, duplicates, frequency, merge, missing number, pairs with sum",
  ],
  theory: [
    {
      heading: "What is a list comprehension?",
      content: "A list comprehension builds a new list from an iterable in a single readable line. It replaces the 3-4 line pattern \"create empty list, loop, append\". Read it like English: \"give me x squared FOR each x IN numbers\". Comprehensions are also slightly faster than the equivalent loop because the appending is optimized internally.",
      syntax: `# Loop version
squares = []
for x in range(1, 6):
    squares.append(x * x)

# Comprehension version
squares = [x * x for x in range(1, 6)]     # [1, 4, 9, 16, 25]

# General form
[expression for item in iterable]`,
    },
    {
      heading: "Filtering with if",
      content: "Add an if at the END to keep only items that pass a condition. This is a filter: items that fail are skipped completely, so the new list can be shorter.",
      syntax: `[expression for item in iterable if condition]

evens = [n for n in range(10) if n % 2 == 0]   # [0, 2, 4, 6, 8]
long_words = [w for w in words if len(w) > 4]
[n for n in nums if n > 0 and n % 3 == 0]       # multiple conditions`,
    },
    {
      heading: "Transforming with if-else",
      content: "To CHANGE each item based on a condition (not drop it), put a conditional expression at the FRONT. The output list has the same length as the input. Placement matters: if alone goes at the end; if-else goes at the beginning.",
      syntax: `[value_if_true if condition else value_if_false for item in iterable]

labels = ["even" if n % 2 == 0 else "odd" for n in range(4)]
# ['even', 'odd', 'even', 'odd']
clean = [m if m >= 0 else 0 for m in marks]     # replace negatives with 0`,
      tip: "Writing [x for x in nums if x > 0 else 0] is a SyntaxError. With else, move the condition to the front.",
    },
    {
      heading: "Nested comprehensions",
      content: "You can have more than one for. The loops are read left to right in the same order as nested for loops. A comprehension inside another comprehension creates a 2D list (matrix).",
      syntax: `# flatten: outer loop first, then inner
flat = [x for row in matrix for x in row]

# equivalent loops
for row in matrix:
    for x in row:
        flat.append(x)

# 3x3 matrix of zeros (each row a new list)
grid = [[0 for c in range(3)] for r in range(3)]
# all pairs
pairs = [(a, b) for a in "xy" for b in [1, 2]]`,
    },
    {
      heading: "Good practices and other comprehensions",
      content: "Use comprehensions for simple transform/filter logic that fits on one or two lines. If you need several conditions, try/except, or side effects (like print), use a normal loop for readability. Python also has set comprehensions {x for ...}, dict comprehensions {k: v for ...} and generator expressions (x for ...), which produce values lazily and save memory: sum(x*x for x in range(10**6)).",
      points: [
        "Do not use a comprehension only for side effects: [print(x) for x in items] builds a useless list of None",
        "Comprehension variables do not leak outside in Python 3",
        "Generator expressions inside sum(), max(), any(), all() need no extra brackets",
      ],
    },
  ],
  examples: [
    {
      title: "Loop vs comprehension, filter and transform",
      scenario: "Process a list of prices: apply GST, keep only items above Rs.100, and label cheap/expensive.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `prices = [50, 120, 99, 300, 75, 450]

with_gst = []
for p in prices:
    with_gst.append(round(p * 1.18, 2))
print("Loop        :", with_gst)

with_gst2 = [round(p * 1.18, 2) for p in prices]
print("Comprehension:", with_gst2)

above_100 = [p for p in prices if p > 100]
print("Above 100   :", above_100)

labels = ["expensive" if p > 100 else "cheap" for p in prices]
print("Labels      :", labels)

discounted = [p * 0.9 if p > 100 else p for p in prices if p != 75]
print("Discounted  :", discounted)`,
      python: {
        files: {
          "main.py": `prices = [50, 120, 99, 300, 75, 450]

with_gst = []
for p in prices:
    with_gst.append(round(p * 1.18, 2))
print("Loop        :", with_gst)

with_gst2 = [round(p * 1.18, 2) for p in prices]
print("Comprehension:", with_gst2)

above_100 = [p for p in prices if p > 100]
print("Above 100   :", above_100)

labels = ["expensive" if p > 100 else "cheap" for p in prices]
print("Labels      :", labels)

discounted = [p * 0.9 if p > 100 else p for p in prices if p != 75]
print("Discounted  :", discounted)`,
        },
      },
      result: `Loop        : [59.0, 141.6, 116.82, 354.0, 88.5, 531.0]
Comprehension: [59.0, 141.6, 116.82, 354.0, 88.5, 531.0]
Above 100   : [120, 300, 450]
Labels      : ['cheap', 'expensive', 'cheap', 'expensive', 'cheap', 'expensive']
Discounted  : [50, 108.0, 99, 270.0, 405.0]`,
      explanation: "The loop and comprehension give the same list. if at the end filters (shorter list); if-else at the front transforms (same length). The last line does both: the trailing if removes 75, the front if-else discounts big prices.",
    },
    {
      title: "Comprehensions with strings",
      scenario: "Extract useful data from text: word lengths, capitalized words, digits from a string, and vowel positions.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `sentence = "python list comprehensions are really powerful"
words = sentence.split()
print([len(w) for w in words])
print([w.capitalize() for w in words if len(w) > 4])
print("".join([w[0].upper() for w in words]))

order = "ORD-2026-11-17-A9"
digits = [int(ch) for ch in order if ch.isdigit()]
print(digits, "sum =", sum(digits))

print([i for i, ch in enumerate("education") if ch in "aeiou"])`,
      python: {
        files: {
          "main.py": `sentence = "python list comprehensions are really powerful"
words = sentence.split()
print([len(w) for w in words])
print([w.capitalize() for w in words if len(w) > 4])
print("".join([w[0].upper() for w in words]))

order = "ORD-2026-11-17-A9"
digits = [int(ch) for ch in order if ch.isdigit()]
print(digits, "sum =", sum(digits))

print([i for i, ch in enumerate("education") if ch in "aeiou"])`,
        },
      },
      result: `[6, 4, 14, 3, 6, 8]
['Python', 'Comprehensions', 'Really', 'Powerful']
PLCARP
[2, 0, 2, 6, 1, 1, 1, 7, 9] sum = 29
[0, 2, 4, 6, 7]`,
      explanation: "Each comprehension replaces a small loop. \"\".join of first letters builds an acronym. enumerate() gives positions, so we can return indexes of vowels.",
    },
    {
      title: "Nested comprehensions: flatten, matrix, pairs",
      scenario: "Flatten a list of lists, build a 2x3 multiplication matrix, transpose it to 3x2, and find all pairs that add to 10.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `batches = [[1, 2, 3], [4, 5], [6]]
flat = [x for batch in batches for x in batch]
print("Flat:", flat)

table = [[r * c for c in range(1, 4)] for r in range(1, 3)]
print("Table:", table)
transpose = [[row[i] for row in table] for i in range(3)]
print("Transpose:", transpose)

nums = [2, 8, 3, 7, 5, 5]
pairs = [(nums[i], nums[j]) for i in range(len(nums)) for j in range(i + 1, len(nums)) if nums[i] + nums[j] == 10]
print("Pairs with sum 10:", pairs)

print(sum(x * x for x in range(1, 11)), {x % 3 for x in range(10)})`,
      python: {
        files: {
          "main.py": `batches = [[1, 2, 3], [4, 5], [6]]
flat = [x for batch in batches for x in batch]
print("Flat:", flat)

table = [[r * c for c in range(1, 4)] for r in range(1, 3)]
print("Table:", table)
transpose = [[row[i] for row in table] for i in range(3)]
print("Transpose:", transpose)

nums = [2, 8, 3, 7, 5, 5]
pairs = [(nums[i], nums[j]) for i in range(len(nums)) for j in range(i + 1, len(nums)) if nums[i] + nums[j] == 10]
print("Pairs with sum 10:", pairs)

print(sum(x * x for x in range(1, 11)), {x % 3 for x in range(10)})`,
        },
      },
      result: `Flat: [1, 2, 3, 4, 5, 6]
Table: [[1, 2, 3], [2, 4, 6]]
Transpose: [[1, 2], [2, 4], [3, 6]]
Pairs with sum 10: [(2, 8), (3, 7), (5, 5)]
385 {0, 1, 2}`,
      explanation: "In [x for batch in batches for x in batch], the first for is the outer loop. A comprehension inside a comprehension builds rows. The pair finder uses j > i to avoid repeats. The last line shows a generator expression in sum() and a set comprehension.",
    },
    {
      title: "Common list programs (part 1)",
      scenario: "Interview classics: largest and smallest without max/min, reverse without reverse(), second largest, and count of each element.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `nums = [34, 7, 23, 89, 7, 56, 89, 12]

largest = smallest = nums[0]
for n in nums:
    if n > largest:
        largest = n
    if n < smallest:
        smallest = n
print("Largest:", largest, "| Smallest:", smallest)

rev = []
for i in range(len(nums) - 1, -1, -1):
    rev.append(nums[i])
print("Reversed:", rev)

unique_sorted = sorted(set(nums), reverse=True)
print("Second largest:", unique_sorted[1])

freq = {}
for n in nums:
    freq[n] = freq.get(n, 0) + 1
print("Duplicates:", [n for n, c in freq.items() if c > 1])
print("Without duplicates (order kept):", list(dict.fromkeys(nums)))`,
      python: {
        files: {
          "main.py": `nums = [34, 7, 23, 89, 7, 56, 89, 12]

largest = smallest = nums[0]
for n in nums:
    if n > largest:
        largest = n
    if n < smallest:
        smallest = n
print("Largest:", largest, "| Smallest:", smallest)

rev = []
for i in range(len(nums) - 1, -1, -1):
    rev.append(nums[i])
print("Reversed:", rev)

unique_sorted = sorted(set(nums), reverse=True)
print("Second largest:", unique_sorted[1])

freq = {}
for n in nums:
    freq[n] = freq.get(n, 0) + 1
print("Duplicates:", [n for n, c in freq.items() if c > 1])
print("Without duplicates (order kept):", list(dict.fromkeys(nums)))`,
        },
      },
      result: `Largest: 89 | Smallest: 7
Reversed: [12, 89, 56, 7, 89, 23, 7, 34]
Second largest: 56
Duplicates: [7, 89]
Without duplicates (order kept): [34, 7, 23, 89, 56, 12]`,
      explanation: "Track largest/smallest while scanning once (O(n)). Reverse by walking indexes backwards. set() removes duplicates before finding the second largest, so 89 is not counted twice. A dictionary counts occurrences.",
    },
    {
      title: "Common list programs (part 2)",
      scenario: "More classics: missing number from 1..n, merge two sorted lists, move zeros to end, cumulative sum, and chunking.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `arr = [1, 2, 4, 6, 3, 7, 8]
n = len(arr) + 1
print("Missing number:", n * (n + 1) // 2 - sum(arr))

a, b = [1, 4, 9], [2, 3, 10, 12]
i = j = 0
merged = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        merged.append(a[i]); i += 1
    else:
        merged.append(b[j]); j += 1
merged += a[i:] + b[j:]
print("Merged:", merged)

data = [0, 5, 0, 3, 12, 0]
print("Zeros to end:", [x for x in data if x != 0] + [x for x in data if x == 0])

running, total = [], 0
for x in [3, 1, 4, 1, 5]:
    total += x
    running.append(total)
print("Cumulative sum:", running)

items = list(range(1, 11))
print("Chunks of 3:", [items[k:k + 3] for k in range(0, len(items), 3)])`,
      python: {
        files: {
          "main.py": `arr = [1, 2, 4, 6, 3, 7, 8]
n = len(arr) + 1
print("Missing number:", n * (n + 1) // 2 - sum(arr))

a, b = [1, 4, 9], [2, 3, 10, 12]
i = j = 0
merged = []
while i < len(a) and j < len(b):
    if a[i] <= b[j]:
        merged.append(a[i]); i += 1
    else:
        merged.append(b[j]); j += 1
merged += a[i:] + b[j:]
print("Merged:", merged)

data = [0, 5, 0, 3, 12, 0]
print("Zeros to end:", [x for x in data if x != 0] + [x for x in data if x == 0])

running, total = [], 0
for x in [3, 1, 4, 1, 5]:
    total += x
    running.append(total)
print("Cumulative sum:", running)

items = list(range(1, 11))
print("Chunks of 3:", [items[k:k + 3] for k in range(0, len(items), 3)])`,
        },
      },
      result: `Missing number: 5
Merged: [1, 2, 3, 4, 9, 10, 12]
Zeros to end: [5, 3, 12, 0, 0, 0]
Cumulative sum: [3, 4, 8, 9, 14]
Chunks of 3: [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]`,
      explanation: "The missing number is (sum of 1..n) - (sum of array). Merging uses two pointers, always taking the smaller head (O(n + m)). Two comprehensions move zeros while keeping order. Slicing in steps creates chunks.",
    },
  ],
  interview: [
    {
      q: "What is a list comprehension?",
      a: "A concise syntax to create a list from an iterable: [expr for item in iterable if condition]. It is more readable and usually faster than a for loop with append.",
      level: "Easy",
    },
    {
      q: "What is the output of [x * 2 for x in range(4) if x % 2]?",
      a: "[2, 6]. Only odd x (1 and 3) pass the filter.",
      level: "Easy",
    },
    {
      q: "Where do you put if and if-else in a comprehension?",
      a: "A filter-only if goes at the end. A conditional expression (if-else) goes before for: [a if c else b for x in it].",
      level: "Medium",
    },
    {
      q: "What is the output of [[i * j for j in range(2)] for i in range(3)]?",
      a: "[[0, 0], [0, 1], [0, 2]]",
      level: "Medium",
    },
    {
      q: "What is the order of loops in [x for row in m for x in row]?",
      a: "Left to right equals outer to inner, same as writing for row in m: for x in row: ...",
      level: "Medium",
    },
    {
      q: "Difference between [x for x in it] and (x for x in it)?",
      a: "Square brackets build the whole list in memory immediately. Parentheses create a generator that yields items lazily, one at a time, using little memory; it can be iterated only once.",
      level: "Medium",
    },
    {
      q: "Does the loop variable of a comprehension leak outside?",
      a: "No, in Python 3 comprehensions have their own scope, so x is not defined afterwards (unlike a normal for loop).",
      level: "Hard",
    },
    {
      q: "How do you find the missing number in a list containing 1..n with one missing?",
      a: "Compute n*(n+1)//2 - sum(lst), where n = len(lst) + 1. O(n) time, O(1) space. XOR also works.",
      level: "Medium",
    },
    {
      q: "How do you flatten a nested list of one level?",
      a: "[x for sub in nested for x in sub], or list(itertools.chain.from_iterable(nested)).",
      level: "Medium",
    },
    {
      q: "When should you avoid a list comprehension?",
      a: "When logic is complex (many conditions, try/except), when you only need side effects (printing), or when the data is huge and a generator is better.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Create a list of cubes of numbers 1 to 10 that are divisible by 3.",
      hint: "[n ** 3 for n in ... if ...]",
      solution: `print([n ** 3 for n in range(1, 11) if n ** 3 % 3 == 0])   # [27, 216, 729]`,
    },
    {
      task: "From a list of names, create a list of names in uppercase that start with a vowel.",
      hint: "name[0].lower() in \"aeiou\"",
      solution: `names = ["asha", "ravi", "isha", "omkar", "meena"]
print([n.upper() for n in names if n[0].lower() in "aeiou"])`,
    },
    {
      task: "Find common elements of two lists (no duplicates, keep order of the first list) using a comprehension.",
      hint: "dict.fromkeys(a) removes duplicates while keeping order.",
      solution: `a, b = [1, 2, 3, 4, 4], [3, 4, 5]
common = [x for x in dict.fromkeys(a) if x in b]
print(common)   # [3, 4]`,
    },
    {
      task: "Replace every negative number in a list with 0 and every positive with its square.",
      hint: "if-else at the front.",
      solution: `nums = [-3, 4, -1, 2, 0]
print([0 if n < 0 else n * n for n in nums])`,
    },
    {
      task: "Find the intersection index pairs of two lists where elements are equal (e.g. [1,2,3] and [3,2,1] -> [(1,1)]).",
      hint: "zip with enumerate",
      solution: `a, b = [1, 2, 3], [3, 2, 1]
print([(i, i) for i, (x, y) in enumerate(zip(a, b)) if x == y])`,
    },
  ],
  quiz: [
    {
      question: "What is [c for c in \"hello\" if c != \"l\"]?",
      options: [
        "['h', 'e', 'o']",
        "['h', 'e', 'l', 'o']",
        "'heo'",
        "['l', 'l']",
      ],
      answer: 0,
      explanation: "Both l characters are filtered out.",
    },
    {
      question: "Which is valid syntax?",
      options: [
        "[x for x in a if x > 0 else 0]",
        "[x if x > 0 else 0 for x in a]",
        "[for x in a: x]",
        "[x if x > 0 for x in a]",
      ],
      answer: 1,
      explanation: "if-else must come before for.",
    },
    {
      question: "What is len([x for x in range(20) if x % 5 == 0])?",
      options: [
        "5",
        "3",
        "20",
        "4",
      ],
      answer: 3,
      explanation: "0, 5, 10, 15.",
    },
    {
      question: "What does (x * x for x in range(3)) create?",
      options: [
        "A tuple",
        "A list",
        "A generator",
        "A set",
      ],
      answer: 2,
      explanation: "Parentheses create a generator expression.",
    },
    {
      question: "Output of [i + j for i in range(2) for j in range(2)]?",
      options: [
        "[0, 2]",
        "[0, 1, 1, 2]",
        "[[0, 1], [1, 2]]",
        "[0, 1, 2]",
      ],
      answer: 1,
      explanation: "Pairs (0,0),(0,1),(1,0),(1,1) give 0,1,1,2.",
    },
  ],
};
