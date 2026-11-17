export default {
  id: "day-15-pattern-programs-practice",
  title: "Pattern Programs and Practice Problems on Data Structures",
  module: "Module 2: Data Structures",
  day: 15,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Strengthen loop logic with star, number and alphabet pattern programs, then combine strings, lists, tuples, sets and dictionaries to solve the practice problems most often asked in fresher coding rounds.",
  objectives: [
    "Use the rows-and-columns method to design any pattern with nested loops",
    "Print triangle, pyramid, diamond, number, Floyd and alphabet patterns",
    "Choose the right data structure (list, tuple, set, dict) for a problem",
    "Solve classic problems: two sum, anagram groups, first non-repeating character, run-length encoding, matrix operations",
    "Think about time complexity and edge cases when solving problems",
  ],
  theory: [
    {
      heading: "How to think about any pattern",
      content: "Every pattern is a grid of rows and columns. The outer loop controls ROWS (usually 1 to n). The inner loop(s) control what goes in each row: spaces first, then stars/numbers. The trick is to find, for row i, how many spaces and how many symbols are printed, and write it as a formula of i and n. Make a small table for n = 4 on paper, fill in counts, and the formula appears.",
      syntax: `for i in range(1, n + 1):             # rows
    print(" " * (n - i), end="")      # leading spaces
    for j in range(1, i + 1):         # symbols in this row
        print("*", end=" ")
    print()                           # move to next row`,
      points: [
        "Right triangle: row i has i stars",
        "Inverted triangle: row i has n - i + 1 stars",
        "Pyramid: row i has n - i spaces and 2*i - 1 stars",
        "Diamond: pyramid + inverted pyramid (skip the middle row once)",
      ],
    },
    {
      heading: "Pythonic shortcuts for patterns",
      content: "Because strings support * (repeat), many patterns can be printed with one print per row: print(\" \" * (n - i) + \"*\" * (2 * i - 1)). Interviewers often ask for nested loops first to test logic, then accept the shortcut. str.center(width) and \" \".join() also help.",
      syntax: `print("*" * i)
print(" " * (n - i) + "* " * i)            # pyramid with spaces
print(("*" * (2 * i - 1)).center(2 * n - 1))
print(" ".join(str(k) for k in range(1, i + 1)))`,
    },
    {
      heading: "Number and alphabet patterns",
      content: "For numbers, decide whether each row prints the column number (j), the row number (i), a running counter (Floyd's triangle), or a value computed from i and j (Pascal's triangle uses combinations). For letters use chr(65 + k), since chr(65) is \"A\".",
      syntax: `1          1          1          A
1 2        2 2        2 3        A B
1 2 3      3 3 3      4 5 6      A B C
(print j)  (print i)  (counter)  chr(64 + j)`,
    },
    {
      heading: "Choosing the right data structure",
      content: "Most problems become easy once you pick the right container. Ask: Do I need order? Duplicates? Fast lookup? Key-value mapping? Fixed data?",
      points: [
        "list: ordered, changeable sequence; index access; duplicates allowed (marks, cart)",
        "tuple: fixed record, can be a dict key (coordinates, (name, age) rows)",
        "set: uniqueness and O(1) membership; comparing groups (visited items, tags)",
        "dict: lookup by key, counting, grouping, caching (frequency, phonebook, JSON)",
        "Seen-set or dict trick turns many O(n^2) brute-force solutions into O(n)",
      ],
      tip: "In interviews, first explain the brute-force idea, then improve it with a set or dict. Always test empty input, one element, duplicates and negative numbers.",
    },
    {
      heading: "Problem-solving checklist",
      content: "Use the same steps for every coding question: 1) Understand input/output with an example. 2) Think of a brute-force solution. 3) Improve using the right data structure. 4) Write clean code with good names. 5) Dry-run with a small example and edge cases. 6) State the time and space complexity.",
      points: [
        "O(1): dict/set lookup",
        "O(n): single loop",
        "O(n log n): sorting",
        "O(n^2): nested loops over the same data",
      ],
    },
  ],
  examples: [
    {
      title: "Star patterns: triangle, inverted triangle, pyramid",
      scenario: "Print the three basic star patterns for n = 4 using nested loops.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `n = 4
print("Right triangle")
for i in range(1, n + 1):
    for j in range(i):
        print("*", end=" ")
    print()

print("Inverted triangle")
for i in range(n, 0, -1):
    print("* " * i)

print("Pyramid")
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))`,
      python: {
        files: {
          "main.py": `n = 4
print("Right triangle")
for i in range(1, n + 1):
    for j in range(i):
        print("*", end=" ")
    print()

print("Inverted triangle")
for i in range(n, 0, -1):
    print("* " * i)

print("Pyramid")
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))`,
        },
      },
      result: `Right triangle
* 
* * 
* * * 
* * * * 
Inverted triangle
* * * * 
* * * 
* * 
* 
Pyramid
   *
  ***
 *****
*******`,
      explanation: "Row i of the right triangle has i stars. The inverted triangle counts rows down from n. The pyramid row i has n - i leading spaces and 2*i - 1 stars, so it widens by two stars per row.",
    },
    {
      title: "Diamond and hollow square",
      scenario: "Combine a pyramid and an inverted pyramid to print a diamond, and print a hollow square using conditions.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))

print()
size = 5
for i in range(size):
    for j in range(size):
        if i == 0 or i == size - 1 or j == 0 or j == size - 1:
            print("*", end=" ")
        else:
            print(" ", end=" ")
    print()`,
      python: {
        files: {
          "main.py": `n = 4
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * (2 * i - 1))
for i in range(n - 1, 0, -1):
    print(" " * (n - i) + "*" * (2 * i - 1))

print()
size = 5
for i in range(size):
    for j in range(size):
        if i == 0 or i == size - 1 or j == 0 or j == size - 1:
            print("*", end=" ")
        else:
            print(" ", end=" ")
    print()`,
        },
      },
      result: `   *
  ***
 *****
*******
 *****
  ***
   *

* * * * * 
*       * 
*       * 
*       * 
* * * * * `,
      explanation: "The lower half of the diamond starts from n - 1 so the middle row is not printed twice. In the hollow square, a star is printed only on the border rows/columns (first or last), otherwise a space.",
    },
    {
      title: "Number and alphabet patterns",
      scenario: "Print number triangle, Floyd's triangle, Pascal's triangle and an alphabet triangle.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `n = 4
print("Number triangle")
for i in range(1, n + 1):
    print(" ".join(str(j) for j in range(1, i + 1)))

print("Floyd's triangle")
num = 1
for i in range(1, n + 1):
    row = []
    for j in range(i):
        row.append(str(num))
        num += 1
    print(" ".join(row))

print("Pascal's triangle")
row = [1]
for i in range(5):
    print(" " * (5 - i - 1) + " ".join(map(str, row)))
    row = [1] + [row[k] + row[k + 1] for k in range(len(row) - 1)] + [1]

print("Alphabet triangle")
for i in range(1, n + 1):
    print(" ".join(chr(65 + j) for j in range(i)))`,
      python: {
        files: {
          "main.py": `n = 4
print("Number triangle")
for i in range(1, n + 1):
    print(" ".join(str(j) for j in range(1, i + 1)))

print("Floyd's triangle")
num = 1
for i in range(1, n + 1):
    row = []
    for j in range(i):
        row.append(str(num))
        num += 1
    print(" ".join(row))

print("Pascal's triangle")
row = [1]
for i in range(5):
    print(" " * (5 - i - 1) + " ".join(map(str, row)))
    row = [1] + [row[k] + row[k + 1] for k in range(len(row) - 1)] + [1]

print("Alphabet triangle")
for i in range(1, n + 1):
    print(" ".join(chr(65 + j) for j in range(i)))`,
        },
      },
      result: `Number triangle
1
1 2
1 2 3
1 2 3 4
Floyd's triangle
1
2 3
4 5 6
7 8 9 10
Pascal's triangle
    1
   1 1
  1 2 1
 1 3 3 1
1 4 6 4 1
Alphabet triangle
A
A B
A B C
A B C D`,
      explanation: "The number triangle prints the column number. Floyd's triangle uses one counter that keeps increasing. Each Pascal row is built from the previous one: every inner value is the sum of the two values above it. chr(65 + j) converts 0, 1, 2 to A, B, C.",
    },
    {
      title: "Practice problems on strings, lists and sets",
      scenario: "Solve four classic problems: two sum, first non-repeating character, anagram groups, and longest substring without repeating characters.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return seen[target - n], i
        seen[n] = i
    return None

def first_unique_char(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None

def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())

def longest_unique_substring(s):
    start = best = 0
    last_seen = {}
    for i, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1
        last_seen[ch] = i
        best = max(best, i - start + 1)
    return best

print("Two sum:", two_sum([2, 7, 11, 15], 9))
print("First unique:", first_unique_char("swiss"))
print("Anagrams:", group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
print("Longest unique substring:", longest_unique_substring("abcabcbb"))`,
      python: {
        files: {
          "main.py": `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        if target - n in seen:
            return seen[target - n], i
        seen[n] = i
    return None

def first_unique_char(s):
    counts = {}
    for ch in s:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None

def group_anagrams(words):
    groups = {}
    for w in words:
        key = "".join(sorted(w))
        groups.setdefault(key, []).append(w)
    return list(groups.values())

def longest_unique_substring(s):
    start = best = 0
    last_seen = {}
    for i, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= start:
            start = last_seen[ch] + 1
        last_seen[ch] = i
        best = max(best, i - start + 1)
    return best

print("Two sum:", two_sum([2, 7, 11, 15], 9))
print("First unique:", first_unique_char("swiss"))
print("Anagrams:", group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))
print("Longest unique substring:", longest_unique_substring("abcabcbb"))`,
        },
      },
      result: `Two sum: (0, 1)
First unique: w
Anagrams: [['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
Longest unique substring: 3`,
      explanation: "Two sum stores each number's index in a dict, so finding the complement is O(1) and the whole solution O(n). First unique counts with a dict then scans in order. Anagrams share the same sorted letters, which become the grouping key. The sliding window moves start past the previous occurrence of a repeated character.",
    },
    {
      title: "Practice problems on dicts, tuples and matrices",
      scenario: "Run-length encoding, student result processing with tuples and dicts, matrix addition/transpose and spiral order.",
      steps: [
        "Open VS Code (or PyCharm) and open your practice folder",
        "Create a new file named main.py and type the code",
        "Save the file (Ctrl+S)",
        "Run it in the terminal with: python main.py (use python3 on macOS/Linux)",
      ],
      code: `def rle(s):
    if not s:
        return ""
    out, count = [], 1
    for i in range(1, len(s) + 1):
        if i < len(s) and s[i] == s[i - 1]:
            count += 1
        else:
            out.append(s[i - 1] + str(count))
            count = 1
    return "".join(out)

print("RLE:", rle("aaabccdddd"))

records = [("Asha", "Maths", 91), ("Ravi", "Maths", 78), ("Asha", "Science", 85), ("Ravi", "Science", 92)]
totals = {}
for name, subject, mark in records:
    totals[name] = totals.get(name, 0) + mark
topper = max(totals.items(), key=lambda kv: kv[1])
print("Totals:", totals, "| Topper:", topper)
subjects = sorted({subject for _, subject, _ in records})
print("Subjects:", subjects)

A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
print("A + B:", [[A[i][j] + B[i][j] for j in range(3)] for i in range(3)])
print("Transpose:", [list(row) for row in zip(*A)])

def spiral(m):
    result = []
    while m:
        result += m.pop(0)
        m = [list(row) for row in zip(*m)][::-1]
    return result

print("Spiral:", spiral([row[:] for row in A]))`,
      python: {
        files: {
          "main.py": `def rle(s):
    if not s:
        return ""
    out, count = [], 1
    for i in range(1, len(s) + 1):
        if i < len(s) and s[i] == s[i - 1]:
            count += 1
        else:
            out.append(s[i - 1] + str(count))
            count = 1
    return "".join(out)

print("RLE:", rle("aaabccdddd"))

records = [("Asha", "Maths", 91), ("Ravi", "Maths", 78), ("Asha", "Science", 85), ("Ravi", "Science", 92)]
totals = {}
for name, subject, mark in records:
    totals[name] = totals.get(name, 0) + mark
topper = max(totals.items(), key=lambda kv: kv[1])
print("Totals:", totals, "| Topper:", topper)
subjects = sorted({subject for _, subject, _ in records})
print("Subjects:", subjects)

A = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
B = [[9, 8, 7], [6, 5, 4], [3, 2, 1]]
print("A + B:", [[A[i][j] + B[i][j] for j in range(3)] for i in range(3)])
print("Transpose:", [list(row) for row in zip(*A)])

def spiral(m):
    result = []
    while m:
        result += m.pop(0)
        m = [list(row) for row in zip(*m)][::-1]
    return result

print("Spiral:", spiral([row[:] for row in A]))`,
        },
      },
      result: `RLE: a3b1c2d4
Totals: {'Asha': 176, 'Ravi': 170} | Topper: ('Asha', 176)
Subjects: ['Maths', 'Science']
A + B: [[10, 10, 10], [10, 10, 10], [10, 10, 10]]
Transpose: [[1, 4, 7], [2, 5, 8], [3, 6, 9]]
Spiral: [1, 2, 3, 6, 9, 8, 7, 4, 5]`,
      explanation: "RLE counts runs of the same character. Tuples hold fixed (name, subject, mark) records; a dict accumulates totals; a set comprehension finds unique subjects. zip(*A) transposes a matrix. The spiral takes the top row, then rotates the remaining matrix counter-clockwise and repeats. We pass a copy so A is not destroyed.",
    },
  ],
  interview: [
    {
      q: "How do you approach any pattern program?",
      a: "Treat it as rows and columns. The outer loop runs once per row; for each row work out the number of spaces and symbols as a formula of the row number i and size n, then use inner loops (or string repetition) to print them.",
      level: "Easy",
    },
    {
      q: "For a pyramid of n rows, how many stars and spaces are in row i?",
      a: "n - i leading spaces and 2*i - 1 stars (rows numbered from 1).",
      level: "Easy",
    },
    {
      q: `What is the output?
for i in range(1, 4):
    print(str(i) * i)`,
      a: `1
22
333`,
      level: "Easy",
    },
    {
      q: "How do you solve two sum in O(n)?",
      a: "Iterate once with a dict of value -> index. For each number, check if target - number is already in the dict; if yes return both indexes, else store the number.",
      level: "Medium",
    },
    {
      q: "How do you find the first non-repeating character in a string?",
      a: "Count characters with a dict (or Counter) in one pass, then scan the string again and return the first character with count 1. O(n) time.",
      level: "Medium",
    },
    {
      q: "How do you group anagrams?",
      a: "Use a dict whose key is the sorted letters of each word (\"\".join(sorted(w))) and whose value is a list of words with that key.",
      level: "Medium",
    },
    {
      q: "How do you transpose a matrix in one line?",
      a: "[list(row) for row in zip(*matrix)]. zip(*m) groups the i-th items of each row.",
      level: "Medium",
    },
    {
      q: "Which data structure would you use to check for duplicates quickly and why?",
      a: "A set: adding and checking membership are O(1) on average, so scanning n items is O(n) instead of O(n^2) with a list.",
      level: "Easy",
    },
    {
      q: "What is the time complexity of printing a pyramid of n rows?",
      a: "O(n^2), because the total number of characters printed grows with the square of n.",
      level: "Medium",
    },
    {
      q: "How do you find the longest substring without repeating characters?",
      a: "Sliding window: keep the last index of each character in a dict; when a repeat is found inside the window, move the start to last index + 1. Track the max window length. O(n).",
      level: "Hard",
    },
    {
      q: "How do you rotate a matrix 90 degrees clockwise?",
      a: "[list(row) for row in zip(*matrix[::-1])]: reverse the rows then transpose.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Print a right-aligned triangle of stars for n = 5 (spaces on the left).",
      hint: "\" \" * (n - i) + \"*\" * i",
      solution: `n = 5
for i in range(1, n + 1):
    print(" " * (n - i) + "*" * i)`,
    },
    {
      task: `Print the number pyramid:
   1
  121
 12321
1234321`,
      hint: "Ascending 1..i then descending i-1..1",
      solution: `n = 4
for i in range(1, n + 1):
    left = "".join(str(k) for k in range(1, i + 1))
    right = "".join(str(k) for k in range(i - 1, 0, -1))
    print(" " * (n - i) + left + right)`,
    },
    {
      task: "Given a list of numbers, return all unique pairs that sum to a target (no duplicates).",
      hint: "Use a seen set and store pairs as sorted tuples in a set.",
      solution: `def pairs(nums, target):
    seen, result = set(), set()
    for n in nums:
        if target - n in seen:
            result.add(tuple(sorted((n, target - n))))
        seen.add(n)
    return sorted(result)

print(pairs([1, 5, 7, -1, 5, 3, 3], 6))   # [(-1, 7), (1, 5), (3, 3)]`,
    },
    {
      task: "Find the element that appears most often in a list, and how many times.",
      hint: "Counter(nums).most_common(1)",
      solution: `from collections import Counter
nums = [3, 1, 3, 2, 3, 2]
print(Counter(nums).most_common(1)[0])   # (3, 3)`,
    },
    {
      task: "Rotate a 3x3 matrix 90 degrees clockwise.",
      hint: "Reverse rows, then transpose.",
      solution: `m = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]
rotated = [list(row) for row in zip(*m[::-1])]
print(rotated)   # [[7, 4, 1], [8, 5, 2], [9, 6, 3]]`,
    },
    {
      task: "Merge two dictionaries of item quantities, adding quantities for common keys.",
      hint: "Loop over the second dict and use get().",
      solution: `a = {"pen": 3, "book": 1}
b = {"book": 2, "bag": 1}
merged = dict(a)
for k, v in b.items():
    merged[k] = merged.get(k, 0) + v
print(merged)   # {'pen': 3, 'book': 3, 'bag': 1}`,
    },
  ],
  quiz: [
    {
      question: "In a pyramid with n = 5, how many stars are in row 3?",
      options: [
        "3",
        "6",
        "5",
        "7",
      ],
      answer: 2,
      explanation: "2 * 3 - 1 = 5.",
    },
    {
      question: "Which data structure gives O(1) average lookup for \"seen before?\" checks?",
      options: [
        "set",
        "list",
        "tuple",
        "str",
      ],
      answer: 0,
      explanation: "Sets use hashing.",
    },
    {
      question: "What does list(zip(*[[1, 2], [3, 4]])) return?",
      options: [
        "[[1, 2], [3, 4]]",
        "[(1, 3), (2, 4)]",
        "[1, 2, 3, 4]",
        "[(1, 2), (3, 4)]",
      ],
      answer: 1,
      explanation: "zip(*m) transposes the matrix into tuples.",
    },
    {
      question: "What is chr(65 + 2)?",
      options: [
        "B",
        "D",
        "67",
        "C",
      ],
      answer: 3,
      explanation: "chr(67) is C.",
    },
    {
      question: "Time complexity of the dict-based two-sum solution?",
      options: [
        "O(n^2)",
        "O(log n)",
        "O(n)",
        "O(1)",
      ],
      answer: 2,
      explanation: "One pass with O(1) lookups.",
    },
  ],
};
