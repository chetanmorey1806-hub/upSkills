export default {
  id: "day-19-recursion",
  title: "Recursion",
  module: "Module 3: Functions & Modules",
  day: 19,
  level: "Intermediate",
  duration: "2 hours",
  summary: "Understand how a function can call itself to solve a problem by breaking it into smaller copies of the same problem, with a base case to stop, and learn the call stack, recursion limits and memoization.",
  objectives: [
    "Explain recursion, base case and recursive case",
    "Trace recursive calls using the call stack",
    "Write classic recursive programs: factorial, Fibonacci, sum of digits, power, reverse string",
    "Understand RecursionError and sys.getrecursionlimit()",
    "Speed up recursion with memoization (functools.lru_cache)",
  ],
  theory: [
    {
      heading: "What is Recursion?",
      content: "Recursion is when a function calls itself to solve a smaller version of the same problem. Real-world analogy: Russian dolls - you open a doll, find a smaller doll inside, and keep opening until you reach the smallest doll which cannot be opened (the base case). Another example: standing in a queue and asking the person in front \"what is your position?\" - each person asks the one ahead until the first person says \"1\".",
      points: [
        "Base case: the simplest input that is answered directly, without another call - it STOPS the recursion",
        "Recursive case: the function calls itself with a smaller/simpler input",
        "Every recursive call must move closer to the base case",
      ],
    },
    {
      heading: "Structure of a Recursive Function",
      content: "Every recursive function follows the same template: check the base case first and return; otherwise do a little work and call yourself on a smaller problem.",
      syntax: `def factorial(n):
    if n <= 1:            # base case
        return 1
    return n * factorial(n - 1)   # recursive case
`,
      tip: "Write the base case first. A missing or wrong base case is the number one recursion bug.",
    },
    {
      heading: "The Call Stack",
      content: "Each function call gets a frame on the call stack (like a stack of plates) holding its local variables. factorial(4) waits for factorial(3), which waits for factorial(2) and so on. When the base case returns, the frames are removed one by one and results flow back up: this is called \"unwinding\".",
      syntax: `factorial(4)
= 4 * factorial(3)
= 4 * 3 * factorial(2)
= 4 * 3 * 2 * factorial(1)
= 4 * 3 * 2 * 1 = 24
`,
    },
    {
      heading: "Recursion Limit and RecursionError",
      content: "Python limits recursion depth (default about 1000) to protect memory. If the recursion goes too deep, or never reaches a base case, Python raises RecursionError: maximum recursion depth exceeded. You can read the limit with sys.getrecursionlimit() and change it with sys.setrecursionlimit(), but it is usually better to use a loop for very deep problems. Python does NOT optimise tail recursion.",
    },
    {
      heading: "Memoization: Remember Old Answers",
      content: "Naive recursive Fibonacci recalculates the same values many times (fib(30) makes over a million calls). Memoization stores results the first time and reuses them. functools.lru_cache (or functools.cache) does this automatically with one decorator line.",
      syntax: `from functools import lru_cache

@lru_cache(maxsize=None)
def fib(n):
    return n if n < 2 else fib(n - 1) + fib(n - 2)
`,
    },
    {
      heading: "Recursion vs Iteration",
      content: "Any recursive solution can be written with loops. Recursion is natural for problems that are self-similar: trees, folders inside folders, nested lists, divide-and-conquer (merge sort, binary search), permutations. Loops are usually faster and use less memory in Python for simple counting problems.",
      points: [
        "Recursion: shorter, elegant for tree-like data, but uses stack memory",
        "Iteration: faster, no depth limit, sometimes longer code",
      ],
    },
  ],
  examples: [
    {
      title: "Factorial with a Trace of the Call Stack",
      scenario: "Watch how calls go down to the base case and results come back up.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def factorial(n, depth=0):
    indent = "  " * depth
    print(f"{indent}factorial({n}) called")
    if n <= 1:
        print(f"{indent}base case -> 1")
        return 1
    result = n * factorial(n - 1, depth + 1)
    print(f"{indent}factorial({n}) returns {result}")
    return result

print("Answer:", factorial(4))
`,
      python: {
        files: {
          "main.py": `def factorial(n, depth=0):
    indent = "  " * depth
    print(f"{indent}factorial({n}) called")
    if n <= 1:
        print(f"{indent}base case -> 1")
        return 1
    result = n * factorial(n - 1, depth + 1)
    print(f"{indent}factorial({n}) returns {result}")
    return result

print("Answer:", factorial(4))
`,
        },
      },
      result: `factorial(4) called
  factorial(3) called
    factorial(2) called
      factorial(1) called
      base case -> 1
    factorial(2) returns 2
  factorial(3) returns 6
factorial(4) returns 24
Answer: 24`,
      explanation: "The indentation shows the depth of the call stack. Calls go deeper until n is 1, then each frame multiplies and returns while unwinding.",
    },
    {
      title: "Classic Recursive Programs",
      scenario: "Common interview programs: sum of digits, power, reverse a string, palindrome check and count down.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Type the inputs when asked: 4729",
        "Compare your terminal output with the result shown below",
      ],
      code: `def sum_digits(n):
    if n < 10:
        return n
    return n % 10 + sum_digits(n // 10)

def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

def reverse(s):
    if len(s) <= 1:
        return s
    return reverse(s[1:]) + s[0]

def is_palindrome(s):
    if len(s) <= 1:
        return True
    return s[0] == s[-1] and is_palindrome(s[1:-1])

num = int(input("Enter a number: "))
print()
print("Sum of digits:", sum_digits(num))
print("2^10 =", power(2, 10))
print("Reverse:", reverse("python"))
print("madam palindrome?", is_palindrome("madam"))
print("hello palindrome?", is_palindrome("hello"))
`,
      python: {
        files: {
          "main.py": `def sum_digits(n):
    if n < 10:
        return n
    return n % 10 + sum_digits(n // 10)

def power(base, exp):
    if exp == 0:
        return 1
    return base * power(base, exp - 1)

def reverse(s):
    if len(s) <= 1:
        return s
    return reverse(s[1:]) + s[0]

def is_palindrome(s):
    if len(s) <= 1:
        return True
    return s[0] == s[-1] and is_palindrome(s[1:-1])

num = int(input("Enter a number: "))
print()
print("Sum of digits:", sum_digits(num))
print("2^10 =", power(2, 10))
print("Reverse:", reverse("python"))
print("madam palindrome?", is_palindrome("madam"))
print("hello palindrome?", is_palindrome("hello"))
`,
        },
        stdin: `4729
`,
      },
      result: `Enter a number: 
Sum of digits: 22
2^10 = 1024
Reverse: nohtyp
madam palindrome? True
hello palindrome? False`,
      explanation: "Each function has a base case for the smallest input and calls itself with a smaller number or a shorter string.",
    },
    {
      title: "Fibonacci: Naive vs Memoized",
      scenario: "Compare how many calls the naive version makes against the cached version.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import lru_cache

calls = 0
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(20) =", fib(20), "calls:", calls)

@lru_cache(maxsize=None)
def fast_fib(n):
    if n < 2:
        return n
    return fast_fib(n - 1) + fast_fib(n - 2)

print("fast_fib(20) =", fast_fib(20))
print(fast_fib.cache_info())
print("fast_fib(100) =", fast_fib(100))
print([fast_fib(i) for i in range(10)])
`,
      python: {
        files: {
          "main.py": `from functools import lru_cache

calls = 0
def fib(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib(n - 1) + fib(n - 2)

print("fib(20) =", fib(20), "calls:", calls)

@lru_cache(maxsize=None)
def fast_fib(n):
    if n < 2:
        return n
    return fast_fib(n - 1) + fast_fib(n - 2)

print("fast_fib(20) =", fast_fib(20))
print(fast_fib.cache_info())
print("fast_fib(100) =", fast_fib(100))
print([fast_fib(i) for i in range(10)])
`,
        },
      },
      result: `fib(20) = 6765 calls: 21891
fast_fib(20) = 6765
CacheInfo(hits=18, misses=21, maxsize=None, currsize=21)
fast_fib(100) = 354224848179261915075
[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]`,
      explanation: "The naive version makes 21891 calls for fib(20) because it recomputes sub-results. With lru_cache each n is computed only once (21 misses), and even fib(100) is instant.",
    },
    {
      title: "Flatten a Nested List and RecursionError",
      scenario: "Recursion shines on nested data. Also see what happens without a base case.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))   # recursive case
        else:
            result.append(item)            # base case: plain value
    return result

data = [1, [2, 3], [4, [5, [6, 7]]], 8]
print(flatten(data))

def no_base(n):
    return no_base(n + 1)

try:
    no_base(1)
except RecursionError as e:
    print("RecursionError:", e)
print("Limit:", sys.getrecursionlimit())
`,
      python: {
        files: {
          "main.py": `import sys

def flatten(items):
    result = []
    for item in items:
        if isinstance(item, list):
            result.extend(flatten(item))   # recursive case
        else:
            result.append(item)            # base case: plain value
    return result

data = [1, [2, 3], [4, [5, [6, 7]]], 8]
print(flatten(data))

def no_base(n):
    return no_base(n + 1)

try:
    no_base(1)
except RecursionError as e:
    print("RecursionError:", e)
print("Limit:", sys.getrecursionlimit())
`,
        },
      },
      result: `[1, 2, 3, 4, 5, 6, 7, 8]
RecursionError: maximum recursion depth exceeded
Limit: 1000`,
      explanation: "flatten calls itself whenever it finds a sub-list, no matter how deep. no_base never stops, so Python raises RecursionError once the depth limit is reached.",
    },
  ],
  interview: [
    {
      q: "What is recursion?",
      a: "A technique where a function calls itself to solve a smaller instance of the same problem, until it reaches a base case that is answered directly.",
      level: "Easy",
    },
    {
      q: "What is a base case and why is it important?",
      a: "The condition where the function returns without calling itself. Without it (or if it is never reached) the function recurses forever and Python raises RecursionError.",
      level: "Easy",
    },
    {
      q: "What is the default recursion limit in Python and how do you change it?",
      a: "About 1000 frames. Read it with sys.getrecursionlimit() and change with sys.setrecursionlimit(n). Raising it too high can crash the interpreter with a real stack overflow.",
      level: "Medium",
    },
    {
      q: "Does Python support tail call optimisation?",
      a: "No. Even a tail-recursive function uses a new stack frame per call, so deep recursion still hits the limit. Convert deep recursion to a loop.",
      level: "Hard",
    },
    {
      q: `What is the output of this code?

def f(n):
    if n == 0:
        return 0
    return n + f(n - 1)
print(f(5))
`,
      a: `Output:
15

It sums 5 + 4 + 3 + 2 + 1 + 0 = 15.`,
      level: "Easy",
    },
    {
      q: `What is the output of this code?

def show(n):
    if n == 0:
        return
    print(n, end=" ")
    show(n - 1)
    print(n, end=" ")
show(3)
print()
`,
      a: `Output:
3 2 1 1 2 3 

Prints happen before the recursive call (going down: 3 2 1) and after it (coming back up: 1 2 3).`,
      level: "Hard",
    },
    {
      q: `What is the output of this code?

def mystery(s):
    if s == "":
        return ""
    return mystery(s[1:]) + s[0]
print(mystery("abc"))
`,
      a: `Output:
cba

It reverses the string: mystery("abc") = mystery("bc") + "a" = (mystery("c") + "b") + "a" = "cba".`,
      level: "Medium",
    },
    {
      q: "Why is naive recursive Fibonacci slow and how do you fix it?",
      a: "It recomputes the same sub-problems repeatedly, giving exponential time O(2^n). Fix with memoization (functools.lru_cache or a dict) or an iterative loop, giving O(n).",
      level: "Medium",
    },
    {
      q: "When should you prefer recursion over loops?",
      a: "For naturally recursive structures: trees, nested folders/JSON, divide and conquer (merge sort, quick sort, binary search), backtracking (permutations, N-Queens). For simple counting, loops are faster and safer in Python.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Write a recursive function count_down(n) that prints n down to 1 and then \"Go!\".",
      hint: "Base case n == 0: print \"Go!\".",
      solution: `def count_down(n):
    if n == 0:
        print("Go!")
        return
    print(n)
    count_down(n - 1)

count_down(3)
`,
    },
    {
      task: "Write a recursive gcd(a, b) using Euclid's algorithm.",
      hint: "gcd(a, b) = gcd(b, a % b); base case b == 0 returns a.",
      solution: `def gcd(a, b):
    if b == 0:
        return a
    return gcd(b, a % b)

print(gcd(48, 18))
`,
    },
    {
      task: "Write a recursive function list_sum(nums) that returns the sum of a list without using sum() or loops.",
      hint: "list_sum(nums) = nums[0] + list_sum(nums[1:]); empty list returns 0.",
      solution: `def list_sum(nums):
    if not nums:
        return 0
    return nums[0] + list_sum(nums[1:])

print(list_sum([4, 8, 15, 16, 23, 42]))
`,
    },
    {
      task: "Write a recursive binary search that returns the index of target in a sorted list, or -1.",
      hint: "Pass low and high; compare with the middle element.",
      solution: `def binary_search(arr, target, low=0, high=None):
    if high is None:
        high = len(arr) - 1
    if low > high:
        return -1
    mid = (low + high) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return binary_search(arr, target, mid + 1, high)
    return binary_search(arr, target, low, mid - 1)

nums = [3, 8, 12, 19, 25, 31, 40]
print(binary_search(nums, 25))
print(binary_search(nums, 7))
`,
    },
    {
      task: "Write a recursive function to print all permutations of the string \"abc\".",
      hint: "For each character, fix it and permute the remaining characters.",
      solution: `def permutations(s):
    if len(s) <= 1:
        return [s]
    result = []
    for i, ch in enumerate(s):
        for rest in permutations(s[:i] + s[i + 1:]):
            result.append(ch + rest)
    return result

print(permutations("abc"))
`,
    },
  ],
  quiz: [
    {
      question: "What stops a recursive function from running forever?",
      options: [
        "A loop",
        "The base case",
        "The return type",
        "The global keyword",
      ],
      answer: 1,
      explanation: "The base case returns without making another recursive call.",
    },
    {
      question: "Which exception is raised when recursion goes too deep?",
      options: [
        "StackOverflow",
        "MemoryError",
        "OverflowError",
        "RecursionError",
      ],
      answer: 3,
      explanation: "Python raises RecursionError: maximum recursion depth exceeded.",
    },
    {
      question: "Which decorator adds memoization to a function?",
      options: [
        "@functools.lru_cache",
        "@staticmethod",
        "@property",
        "@memo.cache",
      ],
      answer: 0,
      explanation: "functools.lru_cache (or functools.cache) caches results.",
    },
    {
      question: "What does f(3) return? def f(n): return 1 if n == 0 else 2 * f(n - 1)",
      options: [
        "6",
        "3",
        "8",
        "9",
      ],
      answer: 2,
      explanation: "2 * 2 * 2 * 1 = 8.",
    },
    {
      question: "Which data structure does Python use to keep track of active function calls?",
      options: [
        "Queue",
        "Heap",
        "Dictionary",
        "Stack",
      ],
      answer: 3,
      explanation: "The call stack: last call in, first call out.",
    },
  ],
};
