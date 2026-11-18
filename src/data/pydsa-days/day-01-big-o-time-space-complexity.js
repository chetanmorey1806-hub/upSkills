export default {
  id: "day-01-big-o-time-space-complexity",
  title: "Big-O Notation: Time and Space Complexity",
  module: "Module 1: Foundations",
  day: 1,
  level: "Beginner",
  duration: "2.5 hours",
  summary: "Learn how to measure the efficiency of an algorithm using Big-O notation, so you can compare solutions, predict how code behaves on large inputs, and explain complexity confidently in coding interviews.",
  objectives: [
    "Explain what Big-O notation measures and why we ignore constants",
    "Identify O(1), O(log n), O(n), O(n log n), O(n^2) and O(2^n) patterns in code",
    "Calculate the time and space complexity of loops, nested loops and recursive functions",
    "Know the cost of common Python list, dict and set operations",
    "Understand best, average, worst and amortized complexity",
  ],
  theory: [
    {
      heading: "Why Do We Need Complexity Analysis?",
      content: `Two programs can give the same answer, but one may finish in 1 millisecond and the other in 10 minutes when the input becomes large. Measuring time with a stopwatch is unreliable because it depends on the computer, the Python version and other programs running. Instead we count how the number of basic steps GROWS as the input size n grows. This is called asymptotic analysis, and Big-O is the notation we use to describe it.

In interviews, writing a correct solution is only half the job. The interviewer always asks: "What is the time and space complexity? Can you do better?"`,
      points: [
        "n = size of the input (length of list, number of characters, number of nodes)",
        "Time complexity = how the number of operations grows with n",
        "Space complexity = how much EXTRA memory the algorithm needs as n grows",
      ],
    },
    {
      heading: "Big-O Rules: Drop Constants and Lower Terms",
      content: `Big-O describes the upper bound of growth for large n. Because we only care about growth, we simplify:

**Rule 1: Drop constants.** O(2n) becomes O(n), O(500) becomes O(1).

**Rule 2: Drop lower-order terms.** O(n^2 + n + 10) becomes O(n^2), because for n = 1,000,000 the n^2 term dominates completely.

**Rule 3: Different inputs use different variables.** If you loop over list a and then list b, the cost is O(a + b), not O(n). If you nest them, it is O(a * b).

**Rule 4: Sequential steps add, nested steps multiply.**`,
      syntax: `for x in arr:          # O(n)
    print(x)
for x in arr:          # O(n)
    print(x * 2)
# total O(n + n) = O(2n) = O(n)

for x in arr:          # O(n)
    for y in arr:      #   x O(n)
        print(x, y)
# total O(n * n) = O(n^2)
`,
    },
    {
      heading: "Common Complexity Classes (Fastest to Slowest)",
      content: "Memorise this ladder. For n = 1,000,000, an O(n log n) algorithm does about 20 million steps (fine), while O(n^2) does 1,000,000,000,000 steps (far too slow). As a rough rule, Python can do about 10^7 simple operations per second, so check your algorithm against the constraints given in the problem.",
      points: [
        "O(1) constant: list index access, dict lookup, append",
        "O(log n) logarithmic: binary search, halving the input each step",
        "O(n) linear: one loop over the data, sum(), max(), x in list",
        "O(n log n) linearithmic: good sorting (sorted(), merge sort)",
        "O(n^2) quadratic: nested loops over the same data, bubble sort",
        "O(2^n) exponential: generating all subsets, naive recursive Fibonacci",
        "O(n!) factorial: generating all permutations",
      ],
      tip: "Constraint hint: n <= 10^5 usually needs O(n log n) or better; n <= 20 often allows O(2^n); n <= 10 allows O(n!).",
    },
    {
      heading: "Space Complexity",
      content: "Space complexity counts the extra memory your algorithm uses, not counting the input itself (this is often called auxiliary space). Creating a new list of size n is O(n) space. Using a few variables is O(1) space. Recursion also uses space: every active function call sits on the call stack, so a recursion depth of n means O(n) space even if you create no lists.",
      points: [
        "In-place algorithms modify the input and use O(1) extra space",
        "A dict or set that stores up to n items is O(n) space",
        "Slicing arr[a:b] creates a NEW list, so it costs O(b - a) time and space",
        "Recursion depth d costs O(d) stack space",
      ],
    },
    {
      heading: "Cost of Python Built-in Operations",
      content: "Many hidden O(n) operations make Python code slow without you noticing. A single line like `if x in my_list` inside a loop turns an O(n) solution into O(n^2). Learn these costs for CPython:",
      points: [
        "list: index, append, pop() at end, len -> O(1) (append is amortized O(1))",
        "list: insert(0, x), pop(0), remove(x), x in list, index(x) -> O(n)",
        "list: sort() / sorted() -> O(n log n); slicing -> O(k) for k elements",
        "dict / set: get, set, delete, x in d -> O(1) average, O(n) worst case",
        "str: s1 + s2 -> O(len(s1) + len(s2)); strings are immutable, so building with += in a loop can be O(n^2); use ''.join(parts)",
        "collections.deque: append and popleft -> O(1)",
      ],
      tip: "Replacing a list with a set for membership checks is the single most common optimisation in interviews.",
    },
    {
      heading: "Best, Average, Worst and Amortized",
      content: `**Worst case** is the maximum steps for any input of size n (what Big-O usually reports). **Best case** is the minimum (searching and finding the item at index 0). **Average case** is expected steps over random inputs. Formally, Big-O is an upper bound, Big-Omega is a lower bound and Big-Theta is a tight bound, but in interviews people usually say Big-O and mean the tight worst-case bound.

**Amortized** complexity averages the cost over a sequence of operations. Python's list.append sometimes has to resize the internal array (O(n)), but because the array grows by a proportion each time, the average cost per append over many appends is O(1).`,
    },
    {
      heading: "Analysing Recursion",
      content: "For a recursive function, time = (number of calls) x (work per call). Draw the recursion tree. Naive Fibonacci calls itself twice per call, so the tree has about 2^n nodes: O(2^n) time and O(n) space (max depth). Binary search halves n each call: O(log n) calls. Merge sort makes log n levels and does O(n) work per level: O(n log n).",
      syntax: `def fib(n):                 # T(n) = T(n-1) + T(n-2) + O(1)
    if n < 2:               #   -> O(2^n) time, O(n) stack space
        return n
    return fib(n - 1) + fib(n - 2)
`,
    },
  ],
  examples: [
    {
      title: "Counting Steps: O(n) vs O(n^2)",
      scenario: "See how the number of operations grows for a single loop compared with a nested loop as n doubles.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def linear_steps(n):
    steps = 0
    for i in range(n):
        steps += 1
    return steps

def quadratic_steps(n):
    steps = 0
    for i in range(n):
        for j in range(n):
            steps += 1
    return steps

for n in [10, 20, 40, 80]:
    print(f"n={n:<3} O(n)={linear_steps(n):<4} O(n^2)={quadratic_steps(n)}")
`,
      python: {
        files: {
          "main.py": `def linear_steps(n):
    steps = 0
    for i in range(n):
        steps += 1
    return steps

def quadratic_steps(n):
    steps = 0
    for i in range(n):
        for j in range(n):
            steps += 1
    return steps

for n in [10, 20, 40, 80]:
    print(f"n={n:<3} O(n)={linear_steps(n):<4} O(n^2)={quadratic_steps(n)}")
`,
        },
      },
      result: `n=10  O(n)=10   O(n^2)=100
n=20  O(n)=20   O(n^2)=400
n=40  O(n)=40   O(n^2)=1600
n=80  O(n)=80   O(n^2)=6400`,
      explanation: "When n doubles, the linear count doubles but the quadratic count becomes four times bigger. This is exactly what Big-O predicts: O(n) grows proportionally, O(n^2) grows with the square.",
    },
    {
      title: "Linear Search vs Binary Search Step Count",
      scenario: "Find a number in a sorted list of one million items and count how many comparisons each method makes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def linear_search(arr, target):
    steps = 0
    for i, value in enumerate(arr):
        steps += 1
        if value == target:
            return i, steps
    return -1, steps

def binary_search(arr, target):
    lo, hi, steps = 0, len(arr) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid, steps
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

data = list(range(1_000_000))
print("Linear:", linear_search(data, 999_999))
print("Binary:", binary_search(data, 999_999))
`,
      python: {
        files: {
          "main.py": `def linear_search(arr, target):
    steps = 0
    for i, value in enumerate(arr):
        steps += 1
        if value == target:
            return i, steps
    return -1, steps

def binary_search(arr, target):
    lo, hi, steps = 0, len(arr) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid, steps
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

data = list(range(1_000_000))
print("Linear:", linear_search(data, 999_999))
print("Binary:", binary_search(data, 999_999))
`,
        },
      },
      result: `Linear: (999999, 1000000)
Binary: (999999, 20)`,
      explanation: "Linear search checks items one by one: 1,000,000 comparisons, O(n). Binary search halves the range each step, so it needs at most about log2(1,000,000) = 20 comparisons, O(log n). Binary search only works because the data is sorted.",
    },
    {
      title: "Hidden O(n): list membership vs set membership",
      scenario: "Find which order IDs appear in a list of blocked IDs. Compare a list-based check with a set-based check by counting comparisons.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `orders = list(range(0, 2000, 2))      # 1000 order ids
blocked_list = list(range(0, 2000, 3))  # 667 blocked ids
blocked_set = set(blocked_list)

# O(n * m): 'in' on a list scans element by element
comparisons = 0
hits_slow = 0
for o in orders:
    for b in blocked_list:
        comparisons += 1
        if b == o:
            hits_slow += 1
            break

# O(n + m): 'in' on a set is an O(1) average hash lookup
hits_fast = sum(1 for o in orders if o in blocked_set)

print("Hits (list):", hits_slow, "comparisons:", comparisons)
print("Hits (set): ", hits_fast, "lookups:", len(orders))
`,
      python: {
        files: {
          "main.py": `orders = list(range(0, 2000, 2))      # 1000 order ids
blocked_list = list(range(0, 2000, 3))  # 667 blocked ids
blocked_set = set(blocked_list)

# O(n * m): 'in' on a list scans element by element
comparisons = 0
hits_slow = 0
for o in orders:
    for b in blocked_list:
        comparisons += 1
        if b == o:
            hits_slow += 1
            break

# O(n + m): 'in' on a set is an O(1) average hash lookup
hits_fast = sum(1 for o in orders if o in blocked_set)

print("Hits (list):", hits_slow, "comparisons:", comparisons)
print("Hits (set): ", hits_fast, "lookups:", len(orders))
`,
        },
      },
      result: `Hits (list): 334 comparisons: 555778
Hits (set):  334 lookups: 1000`,
      explanation: "Both give the same answer, but the list version performs hundreds of thousands of comparisons because each `in` scans the list. Building a set costs O(m) once, then every lookup is O(1) on average, so the total is O(n + m).",
    },
    {
      title: "Amortized O(1) append: watching list capacity grow",
      scenario: "Understand why list.append is O(1) amortized by watching when CPython actually resizes the list's memory.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

nums = []
last_size = sys.getsizeof(nums)
print(f"len=0  bytes={last_size}")
for i in range(20):
    nums.append(i)
    size = sys.getsizeof(nums)
    if size != last_size:
        print(f"len={len(nums):<2} bytes={size}  <- resized")
        last_size = size
`,
      python: {
        files: {
          "main.py": `import sys

nums = []
last_size = sys.getsizeof(nums)
print(f"len=0  bytes={last_size}")
for i in range(20):
    nums.append(i)
    size = sys.getsizeof(nums)
    if size != last_size:
        print(f"len={len(nums):<2} bytes={size}  <- resized")
        last_size = size
`,
        },
      },
      result: `len=0  bytes=56
len=1  bytes=88  <- resized
len=5  bytes=120  <- resized
len=9  bytes=184  <- resized
len=17 bytes=248  <- resized`,
      explanation: "The list does not resize on every append. CPython over-allocates extra slots, so most appends just fill a free slot in O(1). Only occasionally does it copy everything to a bigger block. Spread over many appends, the average cost is O(1). (Exact byte sizes are for 64-bit CPython 3.12 and can differ on other versions.)",
    },
    {
      title: "Exponential vs Linear: Fibonacci call count",
      scenario: "Count the function calls made by naive recursive Fibonacci versus an iterative version.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `calls = 0

def fib_naive(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

for n in [10, 20, 25]:
    calls = 0
    value = fib_naive(n)
    print(f"fib({n}) = {value}, naive calls = {calls}, iterative loops = {n}")
`,
      python: {
        files: {
          "main.py": `calls = 0

def fib_naive(n):
    global calls
    calls += 1
    if n < 2:
        return n
    return fib_naive(n - 1) + fib_naive(n - 2)

def fib_iter(n):
    a, b = 0, 1
    for _ in range(n):
        a, b = b, a + b
    return a

for n in [10, 20, 25]:
    calls = 0
    value = fib_naive(n)
    print(f"fib({n}) = {value}, naive calls = {calls}, iterative loops = {n}")
`,
        },
      },
      result: `fib(10) = 55, naive calls = 177, iterative loops = 10
fib(20) = 6765, naive calls = 21891, iterative loops = 20
fib(25) = 75025, naive calls = 242785, iterative loops = 25`,
      explanation: "The naive version recomputes the same values again and again, so calls grow roughly like 1.6^n (exponential). The iterative version runs n loop iterations: O(n) time and O(1) space. Day 15 (dynamic programming) builds on this idea.",
    },
  ],
  interview: [
    {
      q: "What is Big-O notation?",
      a: "Big-O notation describes an upper bound on how the running time or memory of an algorithm grows as the input size n grows. It ignores constants and lower-order terms because for large n only the dominant term matters. For example 3n^2 + 5n + 7 is O(n^2).",
      level: "Easy",
    },
    {
      q: "Why do we drop constants in Big-O? Isn't O(2n) slower than O(n)?",
      a: "In real time, 2n steps take longer than n steps, but both grow linearly: doubling n doubles the work in both cases. Big-O compares growth rates, not exact time. Constants depend on hardware and language, so they are ignored. In practice constants can still matter, so after choosing the right Big-O you can optimise constants.",
      level: "Easy",
    },
    {
      q: "What is the time complexity of `x in my_list` vs `x in my_set`?",
      a: "`x in my_list` is O(n) because Python compares x with elements one by one. `x in my_set` is O(1) on average because sets use a hash table: Python hashes x and jumps directly to the bucket. Worst case for a set is O(n) when many keys collide, but this is rare.",
      level: "Easy",
    },
    {
      q: `What is the time complexity of this code?

for i in range(n):
    j = 1
    while j < n:
        j *= 2`,
      a: "O(n log n). The outer loop runs n times. The inner loop doubles j each time, so it runs about log2(n) times. Nested loops multiply: n x log n.",
      level: "Medium",
    },
    {
      q: `What is the time complexity?

for i in range(n):
    for j in range(i, n):
        print(i, j)`,
      a: "O(n^2). The inner loop runs n, n-1, n-2, ..., 1 times. The total is n(n+1)/2, which is about n^2/2. Dropping the constant 1/2 gives O(n^2).",
      level: "Medium",
    },
    {
      q: "What is space complexity? Does it include the input?",
      a: "Space complexity is the amount of memory an algorithm uses as a function of n. Usually interviewers mean auxiliary space, which is the EXTRA memory excluding the input. For example, reversing a list in place with two pointers is O(1) auxiliary space, while creating a reversed copy is O(n).",
      level: "Easy",
    },
    {
      q: "What does amortized O(1) mean for list.append?",
      a: "Most appends place the item into pre-allocated free space in O(1). When the internal array is full, Python allocates a bigger array and copies all elements, which is O(n). Because capacity grows proportionally (over-allocation), these expensive copies are rare, and the total cost of n appends is O(n). So the average (amortized) cost per append is O(1).",
      level: "Medium",
    },
    {
      q: "Why is building a string with += in a loop considered slow?",
      a: "Strings are immutable. `s += ch` may create a new string and copy the old content each time, giving O(1 + 2 + ... + n) = O(n^2) in the worst case. CPython sometimes optimises this in place, but you should not rely on it. The idiomatic O(n) approach is to collect pieces in a list and call ''.join(parts) once.",
      level: "Medium",
    },
    {
      q: "What is the time and space complexity of naive recursive Fibonacci?",
      a: "Time is O(2^n) (more precisely about O(1.618^n)) because each call branches into two calls and subproblems are recomputed. Space is O(n) because the deepest chain of active calls is n frames on the call stack. With memoization both time and space become O(n).",
      level: "Medium",
    },
    {
      q: "If an input has n <= 10^5, which complexities are acceptable?",
      a: "O(n), O(n log n), and sometimes O(n sqrt n). O(n^2) means 10^10 operations, which is far too slow in Python (roughly 10^7 simple operations per second). So you should aim for O(n log n) or better.",
      level: "Medium",
    },
    {
      q: "Explain Big-O, Big-Omega and Big-Theta.",
      a: "Big-O gives an upper bound (growth is at most this), Big-Omega gives a lower bound (growth is at least this), and Big-Theta gives a tight bound (both). Example: insertion sort is O(n^2) and Omega(n); on already-sorted input it runs in Theta(n). In interviews 'Big-O' is commonly used to mean the tight worst-case bound.",
      level: "Hard",
    },
    {
      q: "What is the time complexity of sorted(arr) followed by a loop, and why does sorting dominate?",
      a: "sorted() is O(n log n) (Timsort) and the loop is O(n). Sequential steps add: O(n log n + n). Dropping the lower-order term gives O(n log n). Space is O(n) because sorted() returns a new list (Timsort may also use up to O(n) temporary memory).",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Contains Duplicate (LeetCode 217): Given a list nums, return True if any value appears at least twice. First write the O(n^2) brute force, then an O(n) solution.",
      hint: "Brute force compares every pair. The optimised version keeps a set of values seen so far.",
      solution: `def contains_duplicate_brute(nums):
    # Time O(n^2), Space O(1)
    n = len(nums)
    for i in range(n):
        for j in range(i + 1, n):
            if nums[i] == nums[j]:
                return True
    return False

def contains_duplicate(nums):
    # Time O(n), Space O(n)
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False

print(contains_duplicate_brute([1, 2, 3, 1]))  # True
print(contains_duplicate([1, 2, 3, 4]))        # False
`,
    },
    {
      task: "Missing Number (LeetCode 268): nums contains n distinct numbers from 0..n with exactly one missing. Find it in O(n) time and O(1) space.",
      hint: "The sum of 0..n is n*(n+1)//2. Subtract the actual sum.",
      solution: `def missing_number(nums):
    # Time O(n), Space O(1)
    n = len(nums)
    expected = n * (n + 1) // 2
    return expected - sum(nums)

print(missing_number([3, 0, 1]))                    # 2
print(missing_number([9, 6, 4, 2, 3, 5, 7, 0, 1]))  # 8
`,
    },
    {
      task: "Find Pivot Index (LeetCode 724): Return the leftmost index where the sum of elements to the left equals the sum to the right, or -1. Avoid the O(n^2) approach of summing both sides for every index.",
      hint: "Compute the total once. Keep a running left sum; right sum = total - left - nums[i].",
      solution: `def pivot_index(nums):
    # Time O(n), Space O(1)
    total = sum(nums)
    left = 0
    for i, x in enumerate(nums):
        if left == total - left - x:
            return i
        left += x
    return -1

print(pivot_index([1, 7, 3, 6, 5, 6]))  # 3
print(pivot_index([1, 2, 3]))           # -1
`,
    },
    {
      task: "Running Sum / Prefix Sum (LeetCode 1480) and range queries: Build the prefix sum of nums, then answer the sum of nums[l..r] for several queries in O(1) each.",
      hint: "prefix[i] = sum of the first i elements; sum(l..r) = prefix[r+1] - prefix[l].",
      solution: `def build_prefix(nums):
    # Time O(n), Space O(n)
    prefix = [0]
    for x in nums:
        prefix.append(prefix[-1] + x)
    return prefix

def range_sum(prefix, l, r):
    # Time O(1) per query
    return prefix[r + 1] - prefix[l]

nums = [-2, 0, 3, -5, 2, -1]
p = build_prefix(nums)
print(range_sum(p, 0, 2))  # 1
print(range_sum(p, 2, 5))  # -1
print(range_sum(p, 0, 5))  # -3
`,
    },
    {
      task: `Analyse and optimise: the function below returns how many elements of a also appear in b. State its complexity, then rewrite it in O(n + m).

def common_count(a, b):
    count = 0
    for x in a:
        if x in b:
            count += 1
    return count`,
      hint: "`x in b` on a list is O(m), so the original is O(n * m). Convert b to a set first.",
      solution: `def common_count(a, b):
    # Original: O(n * m). Optimised: Time O(n + m), Space O(m)
    b_set = set(b)
    count = 0
    for x in a:
        if x in b_set:
            count += 1
    return count

print(common_count([1, 2, 3, 4, 5], [2, 4, 6, 8]))  # 2
`,
    },
  ],
  quiz: [
    {
      question: "What is the Big-O of 4n^2 + 100n + 50?",
      options: [
        "O(4n^2)",
        "O(n^2)",
        "O(n^2 + n)",
        "O(n)",
      ],
      answer: 1,
      explanation: "Drop constants and lower-order terms; n^2 dominates.",
    },
    {
      question: "Which Python operation is O(n)?",
      options: [
        "d[key] on a dict",
        "lst.append(x)",
        "lst.pop(0)",
        "lst[-1]",
      ],
      answer: 2,
      explanation: "pop(0) removes the first element, so every remaining element must shift left by one position.",
    },
    {
      question: "A loop where i doubles each iteration (i = 1, 2, 4, 8, ... < n) runs how many times?",
      options: [
        "O(n)",
        "O(n / 2)",
        "O(log n)",
        "O(1)",
      ],
      answer: 2,
      explanation: "Doubling reaches n after about log2(n) steps.",
    },
    {
      question: "What is the space complexity of a recursive function with recursion depth n that creates no lists?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)",
      ],
      answer: 2,
      explanation: "Each active call uses a stack frame, so depth n means O(n) stack space.",
    },
    {
      question: "Looping over list a (size n) and then separately over list b (size m) is:",
      options: [
        "O(n * m)",
        "O(n + m)",
        "O(n^2)",
        "O(max(n, m)^2)",
      ],
      answer: 1,
      explanation: "Sequential steps add. Different inputs keep different variables.",
    },
    {
      question: "For n = 10^5 in Python, which algorithm is most likely too slow?",
      options: [
        "O(n)",
        "O(n log n)",
        "O(n^2)",
        "O(log n)",
      ],
      answer: 2,
      explanation: "n^2 = 10^10 operations, far beyond the roughly 10^7 simple operations Python can do per second.",
    },
  ],
};
