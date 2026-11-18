export default {
  id: "day-05-recursion-backtracking",
  title: "Recursion and Backtracking: Subsets, Permutations and N-Queens",
  module: "Module 1: Foundations",
  day: 5,
  level: "Intermediate",
  duration: "3.5 hours",
  summary: "Learn to think recursively with base cases and recursive cases, understand the call stack and Python's recursion limit, then use the choose-explore-unchoose backtracking template to generate subsets, permutations and combinations and to solve N-Queens.",
  objectives: [
    "Write recursive functions with a correct base case and recursive case",
    "Trace the call stack and explain recursion depth and RecursionError",
    "Analyse recursive time and space complexity using recursion trees",
    "Apply the backtracking template: choose, explore, unchoose",
    "Generate subsets, permutations and combinations, and solve N-Queens",
  ],
  theory: [
    {
      heading: "What is Recursion?",
      content: `Recursion is when a function calls itself to solve a smaller version of the same problem. Every recursive function needs two parts:

**Base case:** the smallest input that can be answered directly, which stops the recursion.

**Recursive case:** reduce the problem towards the base case and combine the result.

Think of Russian nesting dolls: to count the dolls, open one and count the rest; the smallest doll is the base case.`,
      syntax: `def factorial(n):
    if n <= 1:              # base case
        return 1
    return n * factorial(n - 1)   # recursive case (smaller input)
`,
      tip: "Missing or unreachable base case = infinite recursion = RecursionError.",
    },
    {
      heading: "The Call Stack and Recursion Limit",
      content: `Each call creates a stack frame holding its local variables. Frames are pushed when a call starts and popped when it returns. The maximum depth of active frames determines the space complexity: factorial(n) uses O(n) stack space.

CPython has a default recursion limit of 1000 (sys.getrecursionlimit()). Exceeding it raises RecursionError. You can raise it with sys.setrecursionlimit(), but very deep recursion can still crash the interpreter. Python does NOT do tail-call optimisation, so for very deep problems convert recursion to a loop with an explicit stack.`,
    },
    {
      heading: "Analysing Recursive Complexity",
      content: "Draw the recursion tree. Time = number of nodes x work per node. Space = maximum depth (plus any data you store).",
      points: [
        "One call per level, n levels (factorial, sum of list): O(n) time, O(n) space",
        "Halving each time (binary search, fast power): O(log n) time and depth",
        "Two branches, depth n (naive Fibonacci, subsets): O(2^n) calls",
        "n choices, then n-1, ... (permutations): O(n!) leaves, O(n * n!) with copying",
        "Divide into halves + O(n) merge (merge sort): O(n log n)",
      ],
    },
    {
      heading: "Backtracking: Choose, Explore, Unchoose",
      content: `Backtracking builds candidates step by step and abandons (backtracks) a path as soon as it cannot lead to a valid answer. It is recursion over a **decision tree**. At each level you make a choice, recurse, and then undo the choice so the next option starts from a clean state.

Backtracking explores all possibilities in the worst case, so it is exponential, but **pruning** (stopping early on invalid partial solutions) makes it practical.`,
      syntax: `def backtrack(path, choices):
    if is_complete(path):
        result.append(path[:])    # COPY the path
        return
    for choice in choices:
        if not valid(choice):
            continue              # pruning
        path.append(choice)       # choose
        backtrack(path, next_choices)  # explore
        path.pop()                # unchoose
`,
      tip: "Always append a copy (path[:] or list(path)). Appending path itself stores a reference that later becomes empty.",
    },
    {
      heading: "Subsets, Permutations and Combinations",
      content: "These three are the backbone of backtracking questions:",
      points: [
        "Subsets (power set): each element is in or out -> 2^n subsets, O(n * 2^n) time",
        "Permutations: order matters, use each element once -> n! results, O(n * n!) time",
        "Combinations C(n, k): choose k elements, order does not matter; pass a start index to avoid reusing earlier elements",
        "With duplicates in input: sort first, and skip nums[i] == nums[i-1] at the same tree level",
      ],
    },
    {
      heading: "N-Queens Introduction",
      content: `Place n queens on an n x n chessboard so no two attack each other (same row, column or diagonal). Place one queen per row. For each column in the current row, check if it is safe; if yes, place it and move to the next row; afterwards remove it. Use three sets for O(1) safety checks: columns, 'row - col' diagonals and 'row + col' anti-diagonals.

Time is roughly O(n!) because of pruning, and space is O(n) for the sets and recursion depth.`,
    },
  ],
  examples: [
    {
      title: "Basic Recursion: Factorial, Sum and Power",
      scenario: "Warm up with three classic recursive functions and watch the recursion limit.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import sys

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

def list_sum(arr, i=0):
    if i == len(arr):
        return 0
    return arr[i] + list_sum(arr, i + 1)

def fast_power(x, n):          # O(log n)
    if n == 0:
        return 1
    half = fast_power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x

print(factorial(5))
print(list_sum([4, 8, 15, 16, 23, 42]))
print(fast_power(2, 30))
print("limit:", sys.getrecursionlimit())
try:
    factorial(5000)
except RecursionError as e:
    print("RecursionError:", e)
`,
      python: {
        files: {
          "main.py": `import sys

def factorial(n):
    return 1 if n <= 1 else n * factorial(n - 1)

def list_sum(arr, i=0):
    if i == len(arr):
        return 0
    return arr[i] + list_sum(arr, i + 1)

def fast_power(x, n):          # O(log n)
    if n == 0:
        return 1
    half = fast_power(x, n // 2)
    return half * half if n % 2 == 0 else half * half * x

print(factorial(5))
print(list_sum([4, 8, 15, 16, 23, 42]))
print(fast_power(2, 30))
print("limit:", sys.getrecursionlimit())
try:
    factorial(5000)
except RecursionError as e:
    print("RecursionError:", e)
`,
        },
      },
      result: `120
108
1073741824
limit: 1000
RecursionError: maximum recursion depth exceeded`,
      explanation: "factorial and list_sum make one call per element: O(n) time and stack. fast_power halves n each time: O(log n). factorial(5000) is deeper than the default limit of 1000, so Python raises RecursionError.",
    },
    {
      title: "Tracing the Call Stack",
      scenario: "Print entry and exit of each call to see how frames are pushed and popped.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def count_down(n, depth=0):
    indent = "  " * depth
    print(f"{indent}enter count_down({n})")
    if n == 0:
        print(f"{indent}base case reached")
    else:
        count_down(n - 1, depth + 1)
    print(f"{indent}exit  count_down({n})")

count_down(3)
`,
      python: {
        files: {
          "main.py": `def count_down(n, depth=0):
    indent = "  " * depth
    print(f"{indent}enter count_down({n})")
    if n == 0:
        print(f"{indent}base case reached")
    else:
        count_down(n - 1, depth + 1)
    print(f"{indent}exit  count_down({n})")

count_down(3)
`,
        },
      },
      result: `enter count_down(3)
  enter count_down(2)
    enter count_down(1)
      enter count_down(0)
      base case reached
      exit  count_down(0)
    exit  count_down(1)
  exit  count_down(2)
exit  count_down(3)`,
      explanation: "Calls go deeper until the base case, then return in reverse order (last in, first out). The maximum depth here is 4 frames, so the space used is O(n).",
    },
    {
      title: "Generate All Subsets",
      scenario: "LeetCode 78: list every subset of [1, 2, 3] using backtracking with a start index.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def subsets(nums):
    result = []
    path = []

    def backtrack(start):
        result.append(path[:])         # every node is a subset
        for i in range(start, len(nums)):
            path.append(nums[i])       # choose
            backtrack(i + 1)           # explore
            path.pop()                 # unchoose

    backtrack(0)
    return result

print(subsets([1, 2, 3]))
print(len(subsets([1, 2, 3, 4])))
`,
      python: {
        files: {
          "main.py": `def subsets(nums):
    result = []
    path = []

    def backtrack(start):
        result.append(path[:])         # every node is a subset
        for i in range(start, len(nums)):
            path.append(nums[i])       # choose
            backtrack(i + 1)           # explore
            path.pop()                 # unchoose

    backtrack(0)
    return result

print(subsets([1, 2, 3]))
print(len(subsets([1, 2, 3, 4])))
`,
        },
      },
      result: `[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]
16`,
      explanation: "Each node of the decision tree is a valid subset. The start index ensures we only move forward, so [2, 1] is never produced after [1, 2]. There are 2^n subsets and copying each is O(n): O(n * 2^n) time.",
    },
    {
      title: "Generate All Permutations",
      scenario: "LeetCode 46: list every ordering of [1, 2, 3].",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def permute(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result

for p in permute([1, 2, 3]):
    print(p)
`,
      python: {
        files: {
          "main.py": `def permute(nums):
    result = []
    path = []
    used = [False] * len(nums)

    def backtrack():
        if len(path) == len(nums):
            result.append(path[:])
            return
        for i in range(len(nums)):
            if used[i]:
                continue
            used[i] = True
            path.append(nums[i])
            backtrack()
            path.pop()
            used[i] = False

    backtrack()
    return result

for p in permute([1, 2, 3]):
    print(p)
`,
        },
      },
      result: `[1, 2, 3]
[1, 3, 2]
[2, 1, 3]
[2, 3, 1]
[3, 1, 2]
[3, 2, 1]`,
      explanation: "At each level we may choose any unused element. The used array is set before recursing and reset after, which is the unchoose step. There are n! permutations, each of length n: O(n * n!) time, O(n) extra space besides the output.",
    },
    {
      title: "N-Queens (4 x 4 board)",
      scenario: "LeetCode 51: place 4 queens so none attack each other and print every board.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def solve_n_queens(n):
    boards = []
    queens = []                    # queens[row] = column
    cols, diag, anti = set(), set(), set()

    def backtrack(row):
        if row == n:
            boards.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (row - c) in diag or (row + c) in anti:
                continue           # prune: attacked square
            queens.append(c); cols.add(c); diag.add(row - c); anti.add(row + c)
            backtrack(row + 1)
            queens.pop(); cols.remove(c); diag.remove(row - c); anti.remove(row + c)

    backtrack(0)
    return boards

solutions = solve_n_queens(4)
print("solutions:", len(solutions))
for board in solutions:
    print("\\n".join(board))
    print()
print("8-queens solutions:", len(solve_n_queens(8)))
`,
      python: {
        files: {
          "main.py": `def solve_n_queens(n):
    boards = []
    queens = []                    # queens[row] = column
    cols, diag, anti = set(), set(), set()

    def backtrack(row):
        if row == n:
            boards.append(["." * c + "Q" + "." * (n - c - 1) for c in queens])
            return
        for c in range(n):
            if c in cols or (row - c) in diag or (row + c) in anti:
                continue           # prune: attacked square
            queens.append(c); cols.add(c); diag.add(row - c); anti.add(row + c)
            backtrack(row + 1)
            queens.pop(); cols.remove(c); diag.remove(row - c); anti.remove(row + c)

    backtrack(0)
    return boards

solutions = solve_n_queens(4)
print("solutions:", len(solutions))
for board in solutions:
    print("\\n".join(board))
    print()
print("8-queens solutions:", len(solve_n_queens(8)))
`,
        },
      },
      result: `solutions: 2
.Q..
...Q
Q...
..Q.

..Q.
Q...
...Q
.Q..

8-queens solutions: 92`,
      explanation: "All squares on one diagonal share the same row - col, and on an anti-diagonal the same row + col. Sets make each safety check O(1). Pruning cuts most branches, so even 8-queens (92 solutions) runs instantly.",
    },
  ],
  interview: [
    {
      q: "What are the two essential parts of a recursive function?",
      a: "A base case that returns without recursing, and a recursive case that calls the function on a smaller input that moves towards the base case. Without a reachable base case, recursion never stops and Python raises RecursionError.",
      level: "Easy",
    },
    {
      q: "What is Python's default recursion limit, and how do you handle deep recursion?",
      a: "About 1000 frames (sys.getrecursionlimit()). You can increase it with sys.setrecursionlimit(), but the C stack can still overflow. Better: convert to iteration with an explicit stack or use bottom-up dynamic programming. Python has no tail-call optimisation.",
      level: "Medium",
    },
    {
      q: "Recursion vs iteration: which is better?",
      a: "Recursion is often clearer for tree-shaped problems (trees, backtracking, divide and conquer). Iteration avoids call overhead and stack-depth limits, and is usually faster in Python. Any recursion can be converted to iteration using an explicit stack.",
      level: "Easy",
    },
    {
      q: "What is backtracking?",
      a: "A systematic search that builds a solution incrementally and undoes the last choice when it leads to a dead end or after exploring it. The template is choose -> explore (recurse) -> unchoose. Pruning invalid partial solutions early is what makes it efficient enough.",
      level: "Easy",
    },
    {
      q: "Why do we append path[:] and not path to the result?",
      a: "path is a single list object reused throughout the recursion. Appending path stores a reference; after all the pops it becomes empty, so every stored result would be the same empty list. path[:] stores a snapshot copy.",
      level: "Medium",
    },
    {
      q: "Time complexity of generating all subsets and all permutations?",
      a: "Subsets: 2^n subsets, each copied in O(n) -> O(n * 2^n). Permutations: n! permutations, each copied in O(n) -> O(n * n!). Space is O(n) for the recursion plus the output size.",
      level: "Medium",
    },
    {
      q: "How do you generate subsets when the input has duplicates (LeetCode 90)?",
      a: "Sort the input. Inside the loop, skip nums[i] if i > start and nums[i] == nums[i - 1]. This prevents choosing the same value twice at the same tree level, which would create duplicate subsets, while still allowing duplicates at different levels.",
      level: "Hard",
    },
    {
      q: "In N-Queens, how do you check diagonals in O(1)?",
      a: "Squares on the same main diagonal share row - col; squares on the same anti-diagonal share row + col. Keep sets of used columns, row - col values and row + col values. A square is safe if none of its three values are in the sets.",
      level: "Medium",
    },
    {
      q: "What is the space complexity of a recursive DFS on a path of length n?",
      a: "O(n), because the recursion depth reaches n and each frame stays on the call stack until it returns.",
      level: "Easy",
    },
    {
      q: `What does this print?

def f(n):
    if n == 0:
        return
    print(n, end=" ")
    f(n - 1)
    print(n, end=" ")

f(3)`,
      a: `3 2 1 1 2 3 

The first print runs while going down (pre-order). The second print runs while returning (post-order), in reverse order.`,
      level: "Medium",
    },
    {
      q: "How do you solve Combination Sum (LeetCode 39), where a number can be reused?",
      a: "Backtrack with a start index and a remaining target. For each i from start, if candidates[i] <= remaining, choose it and recurse with the SAME i (reuse allowed) and remaining - candidates[i]. When remaining is 0, record a copy. Sorting candidates lets you break early when a value exceeds the remaining target.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Combinations (LeetCode 77): Return all combinations of k numbers chosen from 1..n. n=4, k=2 -> [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]].",
      hint: "Backtrack with a start number; stop when len(path) == k.",
      solution: `def combine(n, k):
    # Time O(k * C(n, k)), Space O(k) recursion
    result, path = [], []

    def backtrack(start):
        if len(path) == k:
            result.append(path[:])
            return
        for num in range(start, n + 1):
            path.append(num)
            backtrack(num + 1)
            path.pop()

    backtrack(1)
    return result

print(combine(4, 2))
`,
    },
    {
      task: "Combination Sum (LeetCode 39): candidates=[2,3,6,7], target=7 -> [[2,2,3],[7]]. Each number may be used many times.",
      hint: "Recurse with the same index i to allow reuse; prune when the candidate exceeds the remaining target.",
      solution: `def combination_sum(candidates, target):
    # Time exponential (roughly O(n^(target/min))), Space O(target/min)
    candidates.sort()
    result, path = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            result.append(path[:])
            return
        for i in range(start, len(candidates)):
            c = candidates[i]
            if c > remaining:
                break
            path.append(c)
            backtrack(i, remaining - c)
            path.pop()

    backtrack(0, target)
    return result

print(combination_sum([2, 3, 6, 7], 7))  # [[2, 2, 3], [7]]
`,
    },
    {
      task: "Generate Parentheses (LeetCode 22): Return all valid combinations of n pairs of parentheses. n=3 -> 5 strings.",
      hint: "Add '(' if open < n; add ')' if close < open.",
      solution: `def generate_parenthesis(n):
    # Time O(4^n / sqrt(n)) (Catalan number), Space O(n)
    result = []

    def backtrack(s, open_count, close_count):
        if len(s) == 2 * n:
            result.append(s)
            return
        if open_count < n:
            backtrack(s + "(", open_count + 1, close_count)
        if close_count < open_count:
            backtrack(s + ")", open_count, close_count + 1)

    backtrack("", 0, 0)
    return result

print(generate_parenthesis(3))
`,
    },
    {
      task: "Letter Combinations of a Phone Number (LeetCode 17): '23' -> ['ad','ae','af','bd','be','bf','cd','ce','cf'].",
      hint: "Map each digit to letters; recurse on the index of the next digit.",
      solution: `def letter_combinations(digits):
    # Time O(4^n * n), Space O(n)
    if not digits:
        return []
    phone = {"2": "abc", "3": "def", "4": "ghi", "5": "jkl",
             "6": "mno", "7": "pqrs", "8": "tuv", "9": "wxyz"}
    result = []

    def backtrack(i, path):
        if i == len(digits):
            result.append("".join(path))
            return
        for ch in phone[digits[i]]:
            path.append(ch)
            backtrack(i + 1, path)
            path.pop()

    backtrack(0, [])
    return result

print(letter_combinations("23"))
`,
    },
    {
      task: "Word Search (LeetCode 79): Return True if a word exists in a grid of letters by moving up/down/left/right without reusing a cell.",
      hint: "DFS from every cell; mark the cell as visited (e.g. replace with '#') and restore it after exploring.",
      solution: `def exist(board, word):
    # Time O(R * C * 4^L), Space O(L) recursion
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if i == len(word):
            return True
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        saved = board[r][c]
        board[r][c] = "#"            # choose (mark visited)
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1) or
                 dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = saved          # unchoose
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))

grid = [list("ABCE"), list("SFCS"), list("ADEE")]
print(exist(grid, "ABCCED"))  # True
print(exist(grid, "ABCB"))    # False
`,
    },
  ],
  quiz: [
    {
      question: "What happens if a recursive function has no reachable base case?",
      options: [
        "It returns None",
        "It runs forever silently",
        "RecursionError after hitting the recursion limit",
        "SyntaxError",
      ],
      answer: 2,
      explanation: "Python stops at the recursion limit (default about 1000) with RecursionError.",
    },
    {
      question: "How many subsets does a set of 5 elements have?",
      options: [
        "5",
        "25",
        "32",
        "120",
      ],
      answer: 2,
      explanation: "2^5 = 32, including the empty set.",
    },
    {
      question: "What is the correct order of the backtracking template?",
      options: [
        "Explore, choose, unchoose",
        "Choose, explore, unchoose",
        "Unchoose, choose, explore",
        "Choose, unchoose, explore",
      ],
      answer: 1,
      explanation: "Make a choice, recurse, then undo it.",
    },
    {
      question: "In N-Queens, two queens at (r1, c1) and (r2, c2) are on the same anti-diagonal when:",
      options: [
        "r1 - c1 == r2 - c2",
        "r1 + c1 == r2 + c2",
        "r1 == c2",
        "c1 == c2",
      ],
      answer: 1,
      explanation: "Anti-diagonals have a constant row + col.",
    },
    {
      question: "Space complexity of factorial(n) implemented recursively?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n!)",
      ],
      answer: 2,
      explanation: "n frames are on the call stack at the deepest point.",
    },
    {
      question: "Number of permutations of [1, 2, 3, 4]?",
      options: [
        "16",
        "24",
        "12",
        "4",
      ],
      answer: 1,
      explanation: "4! = 24.",
    },
  ],
};
