export default {
  id: "day-10-lists",
  title: "Lists: Creation, Indexing, Slicing, List Methods, Nested Lists",
  module: "Module 2: Data Structures",
  day: 10,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn Python's most used data structure: the list. Create lists, access and change items with indexing and slicing, use every important list method, understand references vs copies, and work with nested lists (matrices).",
  objectives: [
    "Create lists in different ways and access items by index and slice",
    "Add, remove, search, sort and reverse items using list methods",
    "Explain mutability, aliasing and the difference between copy() and assignment",
    "Differentiate sort() vs sorted(), append() vs extend(), remove() vs pop() vs del",
    "Create and traverse nested lists (2D lists / matrices)",
  ],
  theory: [
    {
      heading: "What is a list?",
      content: "A list is an ordered, mutable collection that can hold items of any type, including duplicates. It is written with square brackets. Think of a shopping list: items are in order, you can add, cross out, or change items, and the same item can appear twice. Internally a list is a dynamic array of references, so accessing by index is very fast (O(1)).",
      syntax: `empty = []
nums = [10, 20, 30]
mixed = [1, "two", 3.0, True, None]
from_str = list("abc")        # ['a', 'b', 'c']
from_range = list(range(5))   # [0, 1, 2, 3, 4]
zeros = [0] * 5               # [0, 0, 0, 0, 0]
len(nums)                     # 3`,
      points: [
        "Ordered: items keep their insertion order",
        "Mutable: items can be changed in place",
        "Allows duplicates and mixed types",
        "Supports + (concatenate), * (repeat), in, min/max/sum",
      ],
    },
    {
      heading: "Indexing, slicing and changing items",
      content: "Indexing and slicing work exactly like strings (0-based, negative from the end, [start:stop:step]). The big difference: lists are mutable, so you can assign to an index or even to a slice. Slice assignment can replace, insert or delete several items at once.",
      syntax: `fruits = ["apple", "banana", "cherry", "mango"]
fruits[0]        # 'apple'
fruits[-1]       # 'mango'
fruits[1:3]      # ['banana', 'cherry']
fruits[::-1]     # reversed copy
fruits[1] = "kiwi"            # change one item
fruits[2:4] = ["grape"]       # replace a slice with fewer items
fruits[1:1] = ["fig", "plum"] # insert without replacing`,
    },
    {
      heading: "List methods",
      content: "List methods change the list IN PLACE and most of them return None. That is why x = x.sort() is a bug (x becomes None).",
      syntax: `# Adding
lst.append(x)          # add one item at end
lst.extend([a, b])     # add each item of an iterable
lst.insert(i, x)       # insert at index i
# Removing
lst.remove(x)          # remove first occurrence of value x (ValueError if absent)
lst.pop()              # remove and RETURN last item
lst.pop(i)             # remove and return item at index i
del lst[i]  /  del lst[a:b]   # delete by index / slice (statement)
lst.clear()            # empty the list
# Searching
lst.index(x)           # first index of x (ValueError if absent)
lst.count(x)           # how many times x occurs
# Ordering
lst.sort()             # ascending in place
lst.sort(reverse=True) # descending
lst.sort(key=len)      # by custom key
lst.reverse()          # reverse in place
# Copy
lst.copy()             # shallow copy (same as lst[:] or list(lst))`,
      tip: "sorted(lst) returns a NEW sorted list and works on any iterable; lst.sort() sorts the same list and returns None.",
    },
    {
      heading: "Mutability, aliasing and copying",
      content: "b = a does NOT copy a list; it creates a second name for the same list (aliasing). Changing b changes a. To make an independent copy use a.copy(), a[:] or list(a). These are shallow copies: nested lists inside are still shared. For full independence of nested data use copy.deepcopy().",
      syntax: `a = [1, 2, 3]
b = a          # alias
b.append(4)    # a is now [1, 2, 3, 4]
c = a.copy()   # independent (shallow) copy
c.append(5)    # a unchanged

import copy
m = [[1, 2], [3, 4]]
shallow = m.copy()       # inner lists shared
deep = copy.deepcopy(m)  # fully independent`,
    },
    {
      heading: "Nested lists (2D lists)",
      content: "A list can contain other lists. A 2D list is like a table or matrix: matrix[row][col]. Use nested loops to traverse it. Warning: never create a 2D list with [[0] * 3] * 3 because all rows will be the SAME list object; use a comprehension instead: [[0] * 3 for _ in range(3)].",
      syntax: `matrix = [
    [1, 2, 3],
    [4, 5, 6],
]
matrix[1][2]      # 6 (row 1, column 2)
len(matrix)       # 2 rows
len(matrix[0])    # 3 columns
for row in matrix:
    for value in row:
        print(value, end=" ")`,
    },
    {
      heading: "Useful built-in functions with lists",
      content: "Many built-in functions accept a list (or any iterable) and save you from writing loops.",
      syntax: `len(nums)  sum(nums)  min(nums)  max(nums)
sorted(nums)                 # new sorted list
sorted(nums, reverse=True)
list(reversed(nums))
any(x > 50 for x in nums)    # True if at least one
all(x > 0 for x in nums)     # True if every one
list(enumerate(nums))        # [(0, 10), (1, 20)...]
list(zip(names, marks))      # pairs`,
    },
  ],
  examples: [
    {
      title: "Shopping cart with list methods",
      scenario: "Maintain a shopping cart: add, insert, remove, pop, search and count items.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `cart = ["milk", "bread"]
cart.append("eggs")
cart.extend(["butter", "jam"])
cart.insert(1, "rice")
print("Cart:", cart)

cart.remove("bread")
last = cart.pop()
second = cart.pop(1)
print("Removed:", last, "and", second)
print("Cart:", cart)

cart.append("milk")
print("milk count:", cart.count("milk"), "| first milk at index", cart.index("milk"))
print("Has eggs?", "eggs" in cart, "| Items:", len(cart))
del cart[0]
print("After del cart[0]:", cart)`,
      python: {
        files: {
          "main.py": `cart = ["milk", "bread"]
cart.append("eggs")
cart.extend(["butter", "jam"])
cart.insert(1, "rice")
print("Cart:", cart)

cart.remove("bread")
last = cart.pop()
second = cart.pop(1)
print("Removed:", last, "and", second)
print("Cart:", cart)

cart.append("milk")
print("milk count:", cart.count("milk"), "| first milk at index", cart.index("milk"))
print("Has eggs?", "eggs" in cart, "| Items:", len(cart))
del cart[0]
print("After del cart[0]:", cart)`,
        },
      },
      result: `Cart: ['milk', 'rice', 'bread', 'eggs', 'butter', 'jam']
Removed: jam and rice
Cart: ['milk', 'eggs', 'butter']
milk count: 2 | first milk at index 0
Has eggs? True | Items: 4
After del cart[0]: ['eggs', 'butter', 'milk']`,
      explanation: "append adds one item, extend adds each item of another list, insert puts an item at a position. remove deletes by value, pop deletes by index and returns the item, del deletes by index without returning.",
    },
    {
      title: "Indexing, slicing and slice assignment",
      scenario: "Work with a list of monthly sales: read quarters, replace values, insert and delete ranges.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `sales = [120, 135, 150, 160, 155, 170, 180, 175, 190, 200, 210, 230]
print("Q1:", sales[0:3])
print("Q4:", sales[-3:])
print("Every 3rd month:", sales[::3])
print("Best month sales:", max(sales), "in month", sales.index(max(sales)) + 1)

sales[0] = 125
sales[3:6] = [0, 0, 0]
print("Updated:", sales[:6])

nums = [1, 2, 5]
nums[2:2] = [3, 4]
print("Inserted:", nums)
nums[1:3] = []
print("Deleted slice:", nums)`,
      python: {
        files: {
          "main.py": `sales = [120, 135, 150, 160, 155, 170, 180, 175, 190, 200, 210, 230]
print("Q1:", sales[0:3])
print("Q4:", sales[-3:])
print("Every 3rd month:", sales[::3])
print("Best month sales:", max(sales), "in month", sales.index(max(sales)) + 1)

sales[0] = 125
sales[3:6] = [0, 0, 0]
print("Updated:", sales[:6])

nums = [1, 2, 5]
nums[2:2] = [3, 4]
print("Inserted:", nums)
nums[1:3] = []
print("Deleted slice:", nums)`,
        },
      },
      result: `Q1: [120, 135, 150]
Q4: [200, 210, 230]
Every 3rd month: [120, 160, 180, 200]
Best month sales: 230 in month 12
Updated: [125, 135, 150, 0, 0, 0]
Inserted: [1, 2, 3, 4, 5]
Deleted slice: [1, 4, 5]`,
      explanation: "Slices read ranges of months. Assigning to an index or a slice changes the list in place. Assigning to an empty slice [2:2] inserts; assigning [] to a slice deletes.",
    },
    {
      title: "sort() vs sorted(), and the None trap",
      scenario: "Sort student marks and names in different ways and see why x = x.sort() is a bug.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `marks = [72, 95, 58, 88, 64]
ranked = sorted(marks, reverse=True)
print("Original:", marks)
print("Sorted copy:", ranked)

marks.sort()
print("After marks.sort():", marks)

result = marks.sort()
print("Return value of sort():", result)

names = ["ravi", "Asha", "meena", "Bob", "anil"]
print(sorted(names))
print(sorted(names, key=str.lower))
print(sorted(names, key=len))
names.reverse()
print("Reversed in place:", names)`,
      python: {
        files: {
          "main.py": `marks = [72, 95, 58, 88, 64]
ranked = sorted(marks, reverse=True)
print("Original:", marks)
print("Sorted copy:", ranked)

marks.sort()
print("After marks.sort():", marks)

result = marks.sort()
print("Return value of sort():", result)

names = ["ravi", "Asha", "meena", "Bob", "anil"]
print(sorted(names))
print(sorted(names, key=str.lower))
print(sorted(names, key=len))
names.reverse()
print("Reversed in place:", names)`,
        },
      },
      result: `Original: [72, 95, 58, 88, 64]
Sorted copy: [95, 88, 72, 64, 58]
After marks.sort(): [58, 64, 72, 88, 95]
Return value of sort(): None
['Asha', 'Bob', 'anil', 'meena', 'ravi']
['anil', 'Asha', 'Bob', 'meena', 'ravi']
['Bob', 'ravi', 'Asha', 'anil', 'meena']
Reversed in place: ['anil', 'Bob', 'meena', 'Asha', 'ravi']`,
      explanation: "sorted() returns a new list and keeps the original. sort() changes the list and returns None. Default string sorting puts uppercase first; key=str.lower sorts case-insensitively; key=len sorts by length (stable for ties).",
    },
    {
      title: "Aliasing vs copying",
      scenario: "Two variables pointing to the same list is a classic bug. Compare =, copy() and deepcopy().",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `import copy

original = [1, 2, [3, 4]]
alias = original
shallow = original.copy()
deep = copy.deepcopy(original)

alias.append(5)
original[2].append(99)

print("original:", original)
print("alias   :", alias)
print("shallow :", shallow)
print("deep    :", deep)
print(alias is original, shallow is original, shallow[2] is original[2])`,
      python: {
        files: {
          "main.py": `import copy

original = [1, 2, [3, 4]]
alias = original
shallow = original.copy()
deep = copy.deepcopy(original)

alias.append(5)
original[2].append(99)

print("original:", original)
print("alias   :", alias)
print("shallow :", shallow)
print("deep    :", deep)
print(alias is original, shallow is original, shallow[2] is original[2])`,
        },
      },
      result: `original: [1, 2, [3, 4, 99], 5]
alias   : [1, 2, [3, 4, 99], 5]
shallow : [1, 2, [3, 4, 99]]
deep    : [1, 2, [3, 4]]
True False True`,
      explanation: "alias is the same list, so it shows every change. shallow has its own outer list (no 5) but shares the inner list, so 99 appears. deep copied everything, so it is unaffected.",
    },
    {
      title: "Nested lists: marks table",
      scenario: "Store marks of 3 students in 3 subjects, then compute each student's total and each subject's average.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `students = ["Asha", "Ravi", "Meena"]
marks = [
    [85, 90, 78],
    [70, 65, 88],
    [92, 81, 95],
]
print(f"{'Name':<6} {'Sub1':>4} {'Sub2':>4} {'Sub3':>4} {'Total':>5}")
for i in range(len(marks)):
    row = marks[i]
    print(f"{students[i]:<6} {row[0]:>4} {row[1]:>4} {row[2]:>4} {sum(row):>5}")

for col in range(3):
    column_total = 0
    for row in marks:
        column_total += row[col]
    print(f"Subject {col + 1} average: {column_total / len(marks):.2f}")

bad = [[0] * 2] * 2
bad[0][0] = 1
good = [[0] * 2 for _ in range(2)]
good[0][0] = 1
print("bad:", bad, "| good:", good)`,
      python: {
        files: {
          "main.py": `students = ["Asha", "Ravi", "Meena"]
marks = [
    [85, 90, 78],
    [70, 65, 88],
    [92, 81, 95],
]
print(f"{'Name':<6} {'Sub1':>4} {'Sub2':>4} {'Sub3':>4} {'Total':>5}")
for i in range(len(marks)):
    row = marks[i]
    print(f"{students[i]:<6} {row[0]:>4} {row[1]:>4} {row[2]:>4} {sum(row):>5}")

for col in range(3):
    column_total = 0
    for row in marks:
        column_total += row[col]
    print(f"Subject {col + 1} average: {column_total / len(marks):.2f}")

bad = [[0] * 2] * 2
bad[0][0] = 1
good = [[0] * 2 for _ in range(2)]
good[0][0] = 1
print("bad:", bad, "| good:", good)`,
        },
      },
      result: `Name   Sub1 Sub2 Sub3 Total
Asha     85   90   78   253
Ravi     70   65   88   223
Meena    92   81   95   268
Subject 1 average: 82.33
Subject 2 average: 78.67
Subject 3 average: 87.00
bad: [[1, 0], [1, 0]] | good: [[1, 0], [0, 0]]`,
      explanation: "marks[i][j] is student i, subject j. Summing a row gives a student total; looping over rows for a fixed column gives a subject total. [[0]*2]*2 repeats the SAME inner list, so changing one row changes both.",
    },
  ],
  interview: [
    {
      q: "What are the characteristics of a list?",
      a: "Ordered, mutable, allows duplicates, can hold mixed types, dynamic size, indexed from 0. Implemented as a dynamic array.",
      level: "Easy",
    },
    {
      q: "Difference between append() and extend()?",
      a: "append(x) adds x as a single item (even a list becomes one nested item). extend(iterable) adds each element of the iterable. a=[1]; a.append([2,3]) -> [1,[2,3]]; a.extend([2,3]) -> [1,2,3].",
      level: "Easy",
    },
    {
      q: "Difference between remove(), pop() and del?",
      a: "remove(value) deletes the first matching value; pop(index) deletes by index and returns the item (default last); del lst[i] or del lst[a:b] is a statement that deletes by index/slice and returns nothing.",
      level: "Easy",
    },
    {
      q: "Difference between sort() and sorted()?",
      a: "list.sort() sorts in place and returns None, only for lists. sorted(iterable) returns a new sorted list from any iterable and leaves the original unchanged.",
      level: "Easy",
    },
    {
      q: `What is the output?
a = [1, 2, 3]
b = a
b.append(4)
print(a)`,
      a: "[1, 2, 3, 4]. b is an alias of the same list.",
      level: "Medium",
    },
    {
      q: "What is the output of print([1, 2] * 2 + [3])?",
      a: "[1, 2, 1, 2, 3]",
      level: "Easy",
    },
    {
      q: `What is the output?
x = [3, 1, 2]
x = x.sort()
print(x)`,
      a: "None. sort() returns None, so x is overwritten with None.",
      level: "Medium",
    },
    {
      q: "Shallow copy vs deep copy?",
      a: "A shallow copy creates a new outer list but nested objects are shared. A deep copy (copy.deepcopy) recursively copies nested objects so nothing is shared.",
      level: "Medium",
    },
    {
      q: "Why does [[0]*3]*3 cause problems?",
      a: "The outer * repeats a reference to the same inner list three times, so changing one row changes all rows. Use [[0]*3 for _ in range(3)].",
      level: "Hard",
    },
    {
      q: "What is the time complexity of append, insert(0, x) and x in list?",
      a: "append is amortized O(1); insert at the start is O(n) (shifts items); membership test is O(n) (linear search).",
      level: "Hard",
    },
    {
      q: "How do you remove duplicates from a list while preserving order?",
      a: "list(dict.fromkeys(lst)), or loop with a seen set. list(set(lst)) removes duplicates but loses order.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Find the second largest number in a list without sorting.",
      hint: "Track largest and second largest in one loop.",
      solution: `nums = [12, 45, 7, 45, 33]
first = second = float("-inf")
for n in nums:
    if n > first:
        first, second = n, first
    elif first > n > second:
        second = n
print(second)   # 33`,
    },
    {
      task: "Remove duplicates from [3, 1, 3, 2, 1] keeping the order.",
      hint: "Append only if not already in the result.",
      solution: `nums = [3, 1, 3, 2, 1]
result = []
for n in nums:
    if n not in result:
        result.append(n)
print(result)   # [3, 1, 2]`,
    },
    {
      task: "Rotate a list to the right by k positions ([1,2,3,4,5], k=2 -> [4,5,1,2,3]).",
      hint: "Slicing: lst[-k:] + lst[:-k]",
      solution: `lst, k = [1, 2, 3, 4, 5], 2
k %= len(lst)
print(lst[-k:] + lst[:-k])`,
    },
    {
      task: "Transpose a 2x3 matrix into a 3x2 matrix.",
      hint: "New row j = column j of old matrix.",
      solution: `m = [[1, 2, 3], [4, 5, 6]]
t = []
for j in range(len(m[0])):
    t.append([m[i][j] for i in range(len(m))])
print(t)   # [[1, 4], [2, 5], [3, 6]]`,
    },
    {
      task: "Separate even and odd numbers from a list into two lists.",
      hint: "Loop and append to one of two lists.",
      solution: `nums = [1, 2, 3, 4, 5, 6]
even, odd = [], []
for n in nums:
    (even if n % 2 == 0 else odd).append(n)
print(even, odd)`,
    },
  ],
  quiz: [
    {
      question: "What does [10, 20, 30][-1] return?",
      options: [
        "10",
        "20",
        "30",
        "IndexError",
      ],
      answer: 2,
      explanation: "-1 is the last item.",
    },
    {
      question: "a = [1, 2]; a.append([3, 4]); what is len(a)?",
      options: [
        "3",
        "4",
        "2",
        "5",
      ],
      answer: 0,
      explanation: "append adds the list as one item: [1, 2, [3, 4]].",
    },
    {
      question: "Which method removes an item by value?",
      options: [
        "pop()",
        "del",
        "remove()",
        "discard()",
      ],
      answer: 2,
      explanation: "remove(value) deletes the first matching value.",
    },
    {
      question: "What does list.sort() return?",
      options: [
        "The sorted list",
        "None",
        "A new list",
        "True",
      ],
      answer: 1,
      explanation: "In-place methods return None.",
    },
    {
      question: "Which creates an independent copy of a flat list a?",
      options: [
        "b = a",
        "b = a[:]",
        "b = a.sort()",
        "b = &a",
      ],
      answer: 1,
      explanation: "Slicing the whole list creates a new (shallow) copy.",
    },
  ],
};
