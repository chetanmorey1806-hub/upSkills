export default {
  id: "day-15-dynamic-programming-greedy-patterns",
  title: "Dynamic Programming, Greedy and the Interview Problem-Solving Patterns Cheat Sheet",
  module: "Module 5: Problem-Solving Patterns",
  day: 15,
  level: "Advanced",
  duration: "4 hours",
  summary: "Learn to recognise and solve dynamic programming problems with memoization (top-down) and tabulation (bottom-up), understand when a greedy choice is safe, and finish the course with a pattern cheat sheet and a step-by-step method for tackling any coding interview question.",
  objectives: [
    "Identify overlapping subproblems and optimal substructure",
    "Convert a recursive solution to memoization with functools.cache, then to a bottom-up table",
    "Solve classic 1D and 2D DP problems: climbing stairs, house robber, coin change, LCS, 0/1 knapsack",
    "Apply greedy algorithms and explain why the greedy choice is correct (or when it fails)",
    "Map problem clues to patterns and follow a structured interview approach",
  ],
  theory: [
    {
      heading: "What is Dynamic Programming?",
      content: `Dynamic programming (DP) solves a problem by breaking it into smaller subproblems, solving each subproblem **once**, and storing its answer for reuse. It applies when a problem has two properties:

**Overlapping subproblems:** the same smaller problems are solved again and again (naive Fibonacci computes fib(3) many times).

**Optimal substructure:** the best answer for the whole problem can be built from best answers to subproblems.

DP often turns exponential O(2^n) recursion into polynomial O(n) or O(n^2) time.`,
      points: [
        "Clue words: 'number of ways', 'minimum/maximum cost', 'longest/shortest', 'can you reach', 'is it possible'",
        "Decisions at each step (take / skip, go right / go down) that affect future options",
      ],
    },
    {
      heading: "Top-Down (Memoization) vs Bottom-Up (Tabulation)",
      content: `**Memoization:** write the natural recursive solution and cache results. In Python, add @functools.cache (or @lru_cache(maxsize=None)). Easy to write; only computes needed states; uses recursion stack (watch the recursion limit).

**Tabulation:** fill a table iteratively from the smallest subproblems up to the answer. No recursion, usually faster in Python, and often allows **space optimisation** by keeping only the last row or last two values.`,
      syntax: `from functools import cache

@cache
def climb(n):                 # top-down
    if n <= 2:
        return n
    return climb(n - 1) + climb(n - 2)

def climb_tab(n):             # bottom-up, O(1) space
    a, b = 1, 2
    for _ in range(n - 1):
        a, b = b, a + b
    return a
`,
    },
    {
      heading: "The 5-Step DP Recipe",
      content: "Use this recipe on every DP problem in an interview:",
      points: [
        "1. Define the state: what does dp[i] (or dp[i][j]) mean in words?",
        "2. Write the recurrence: how does dp[i] depend on smaller states?",
        "3. Set base cases: the smallest inputs you can answer directly",
        "4. Decide the order: compute states so dependencies are ready (or use memoization)",
        "5. Return the answer state, then optimise space if only recent rows are needed",
      ],
      tip: "Complexity of DP = (number of states) x (work per state). Coin change: amount x coins. LCS: m x n states, O(1) each.",
    },
    {
      heading: "Classic DP Families",
      content: "Most interview DP problems belong to a handful of families. Learn one representative of each.",
      points: [
        "1D linear: climbing stairs, house robber, decode ways, max subarray (Kadane)",
        "Unbounded knapsack: coin change (min coins / number of ways)",
        "0/1 knapsack: each item used once; subset sum, partition equal subset sum",
        "Two strings (2D): longest common subsequence, edit distance",
        "Grid paths (2D): unique paths, minimum path sum",
        "Increasing subsequence: LIS in O(n^2) DP or O(n log n) with bisect",
      ],
    },
    {
      heading: "Greedy Algorithms",
      content: `A greedy algorithm makes the locally best choice at each step and never reconsiders it. It is usually simpler and faster than DP (often just sort + one pass), but it is correct only when you can prove that a local choice never ruins the global answer (the **greedy-choice property**).

Works: activity/interval scheduling (pick the meeting that ends earliest), jump game, gas station, assigning cookies, Huffman coding, Dijkstra, fractional knapsack.

Fails: coin change with arbitrary coins. With coins [1, 3, 4] and amount 6, greedy takes 4 + 1 + 1 = 3 coins, but 3 + 3 = 2 coins is optimal. When greedy fails, use DP.`,
      tip: "To test a greedy idea quickly, try to break it with a small counter-example. If you cannot, explain an 'exchange argument': swapping any optimal choice for the greedy choice is never worse.",
    },
    {
      heading: "Interview Problem-Solving Patterns Cheat Sheet",
      content: "Read the constraints and the clue words, then map them to a pattern. Then follow the interview method: (1) clarify inputs, outputs and edge cases, (2) state a brute force with its complexity, (3) find the pattern and optimise, (4) code cleanly with good names, (5) dry-run on an example and edge cases, (6) state final time and space complexity.",
      points: [
        "Sorted array / pair or triplet sum -> two pointers (Day 2)",
        "Longest/shortest substring or subarray with a condition -> sliding window (Day 3)",
        "Seen before / count / pair with sum / group -> hash map or set (Day 4)",
        "All combinations / permutations / subsets / place items -> backtracking (Day 5)",
        "Matching brackets / next greater / undo -> stack, monotonic stack (Day 6)",
        "Level by level / shortest steps unweighted -> BFS with deque (Days 7, 11, 14)",
        "Linked list middle / cycle -> fast and slow pointers (Day 8)",
        "Sorted data or 'minimum value that works' -> binary search / on the answer (Day 9)",
        "Overlapping intervals -> sort by start (or end) then sweep (Day 10)",
        "Tree questions -> recursive DFS returning info from children (Days 11-12)",
        "Top k / kth largest / merge k sorted / running median -> heap (Day 13)",
        "Dependencies / connectivity / weighted shortest path -> topological sort, DFS/BFS, Dijkstra (Day 14)",
        "Count ways / min-max cost with choices -> DP; locally safe choice -> greedy (Day 15)",
        "Constraints: n <= 20 -> 2^n; n <= 10^3 -> n^2; n <= 10^5 to 10^6 -> n log n or n",
      ],
    },
  ],
  examples: [
    {
      title: "From Exponential to Linear: Climbing Stairs Three Ways",
      scenario: "LeetCode 70: count ways to climb n stairs taking 1 or 2 steps. Compare naive recursion, memoization and tabulation.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from functools import cache

calls = 0
def naive(n):
    global calls
    calls += 1
    if n <= 2:
        return n
    return naive(n - 1) + naive(n - 2)

@cache
def memo(n):
    if n <= 2:
        return n
    return memo(n - 1) + memo(n - 2)

def tabulation(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def optimised(n):
    a, b = 1, 2                     # ways(1), ways(2)
    for _ in range(n - 1):
        a, b = b, a + b
    return a

print("naive(25):", naive(25), "calls:", calls)
print("memo(25):", memo(25), "cache:", memo.cache_info().currsize, "entries")
print("table(25):", tabulation(25), "| O(1) space:", optimised(25))
print("optimised(90):", optimised(90))
`,
      python: {
        files: {
          "main.py": `from functools import cache

calls = 0
def naive(n):
    global calls
    calls += 1
    if n <= 2:
        return n
    return naive(n - 1) + naive(n - 2)

@cache
def memo(n):
    if n <= 2:
        return n
    return memo(n - 1) + memo(n - 2)

def tabulation(n):
    if n <= 2:
        return n
    dp = [0] * (n + 1)
    dp[1], dp[2] = 1, 2
    for i in range(3, n + 1):
        dp[i] = dp[i - 1] + dp[i - 2]
    return dp[n]

def optimised(n):
    a, b = 1, 2                     # ways(1), ways(2)
    for _ in range(n - 1):
        a, b = b, a + b
    return a

print("naive(25):", naive(25), "calls:", calls)
print("memo(25):", memo(25), "cache:", memo.cache_info().currsize, "entries")
print("table(25):", tabulation(25), "| O(1) space:", optimised(25))
print("optimised(90):", optimised(90))
`,
        },
      },
      result: `naive(25): 121393 calls: 150049
memo(25): 121393 cache: 25 entries
table(25): 121393 | O(1) space: 121393
optimised(90): 4660046610375530309`,
      explanation: "To reach step n you come from n - 1 or n - 2, so ways(n) = ways(n - 1) + ways(n - 2). The naive version makes over 150,000 calls for n = 25; memoization stores just 25 results; the table version fills an array; the optimised version keeps only two variables (O(n) time, O(1) space).",
    },
    {
      title: "House Robber and Kadane's Maximum Subarray",
      scenario: "LeetCode 198 and 53: two classic 1D DP problems where each step decides 'take or skip' / 'extend or restart'.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def rob(houses):
    take, skip = 0, 0               # best if we rob / don't rob the previous house
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)

def max_subarray(nums):
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)   # extend the previous run or restart at x
        best = max(best, current)
    return best

print("rob [2,7,9,3,1]:", rob([2, 7, 9, 3, 1]))
print("rob [2,1,1,2]  :", rob([2, 1, 1, 2]))
print("max subarray   :", max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print("all negative   :", max_subarray([-3, -1, -2]))
`,
      python: {
        files: {
          "main.py": `def rob(houses):
    take, skip = 0, 0               # best if we rob / don't rob the previous house
    for money in houses:
        take, skip = skip + money, max(take, skip)
    return max(take, skip)

def max_subarray(nums):
    best = current = nums[0]
    for x in nums[1:]:
        current = max(x, current + x)   # extend the previous run or restart at x
        best = max(best, current)
    return best

print("rob [2,7,9,3,1]:", rob([2, 7, 9, 3, 1]))
print("rob [2,1,1,2]  :", rob([2, 1, 1, 2]))
print("max subarray   :", max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))
print("all negative   :", max_subarray([-3, -1, -2]))
`,
        },
      },
      result: `rob [2,7,9,3,1]: 12
rob [2,1,1,2]  : 4
max subarray   : 6
all negative   : -1`,
      explanation: "House robber: robbing this house means the previous one was skipped (skip + money); skipping it keeps the best so far. Kadane: the best subarray ending here either extends the previous one or starts fresh. Both are O(n) time and O(1) space.",
    },
    {
      title: "Coin Change: DP vs Greedy",
      scenario: "LeetCode 322: find the minimum number of coins for an amount, and see where greedy fails.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount           # dp[a] = min coins to make a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1

def greedy_change(coins, amount):
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1

print("Indian coins [1,2,5,10], 28 -> DP:", coin_change([1, 2, 5, 10], 28), "greedy:", greedy_change([1, 2, 5, 10], 28))
print("coins [1,3,4], 6           -> DP:", coin_change([1, 3, 4], 6), "greedy:", greedy_change([1, 3, 4], 6))
print("coins [2], 3               -> DP:", coin_change([2], 3))
`,
      python: {
        files: {
          "main.py": `def coin_change(coins, amount):
    INF = float("inf")
    dp = [0] + [INF] * amount           # dp[a] = min coins to make a
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] != INF else -1

def greedy_change(coins, amount):
    count = 0
    for c in sorted(coins, reverse=True):
        count += amount // c
        amount %= c
    return count if amount == 0 else -1

print("Indian coins [1,2,5,10], 28 -> DP:", coin_change([1, 2, 5, 10], 28), "greedy:", greedy_change([1, 2, 5, 10], 28))
print("coins [1,3,4], 6           -> DP:", coin_change([1, 3, 4], 6), "greedy:", greedy_change([1, 3, 4], 6))
print("coins [2], 3               -> DP:", coin_change([2], 3))
`,
        },
      },
      result: `Indian coins [1,2,5,10], 28 -> DP: 5 greedy: 5
coins [1,3,4], 6           -> DP: 2 greedy: 3
coins [2], 3               -> DP: -1`,
      explanation: "For standard currency systems like [1, 2, 5, 10], greedy happens to be optimal. For [1, 3, 4] and 6, greedy picks 4 + 1 + 1 (3 coins) but DP finds 3 + 3 (2 coins). DP tries every last coin for every amount: O(amount x coins) time, O(amount) space.",
    },
    {
      title: "2D DP: Longest Common Subsequence and 0/1 Knapsack",
      scenario: "LeetCode 1143 (LCS) and the 0/1 knapsack: pick items with max value without exceeding a weight limit.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    # rebuild the subsequence by walking back through the table
    i, j, out = m, n, []
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[m][n], "".join(reversed(out))

def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)           # dp[w] = best value with weight limit w
    for wt, val in zip(weights, values):
        for w in range(capacity, wt - 1, -1):   # backwards: each item used once
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]

print(lcs("abcde", "ace"))
print(lcs("AGGTAB", "GXTXAYB"))
print("knapsack:", knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))
`,
      python: {
        files: {
          "main.py": `def lcs(a, b):
    m, n = len(a), len(b)
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if a[i - 1] == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1] + 1
            else:
                dp[i][j] = max(dp[i - 1][j], dp[i][j - 1])
    # rebuild the subsequence by walking back through the table
    i, j, out = m, n, []
    while i and j:
        if a[i - 1] == b[j - 1]:
            out.append(a[i - 1]); i -= 1; j -= 1
        elif dp[i - 1][j] >= dp[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dp[m][n], "".join(reversed(out))

def knapsack(weights, values, capacity):
    dp = [0] * (capacity + 1)           # dp[w] = best value with weight limit w
    for wt, val in zip(weights, values):
        for w in range(capacity, wt - 1, -1):   # backwards: each item used once
            dp[w] = max(dp[w], dp[w - wt] + val)
    return dp[capacity]

print(lcs("abcde", "ace"))
print(lcs("AGGTAB", "GXTXAYB"))
print("knapsack:", knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7))
`,
        },
      },
      result: `(3, 'ace')
(4, 'GTAB')
knapsack: 9`,
      explanation: "LCS: if the characters match, extend the diagonal answer; otherwise take the better of skipping a character from either string. O(m x n) time and space. Knapsack: iterating capacity backwards makes sure each item is counted at most once, using a single row: O(n x W) time, O(W) space. Best for capacity 7 is items with weights 3 + 4 (value 9).",
    },
    {
      title: "Greedy: Meeting Scheduling and Jump Game",
      scenario: "Choose the maximum number of non-overlapping meetings for one room, and check if you can reach the last index (LeetCode 55).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def max_meetings(meetings):
    chosen, last_end = [], float("-inf")
    for start, end in sorted(meetings, key=lambda m: m[1]):   # earliest end first
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen

def can_jump(nums):
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False                 # stuck before reaching i
        farthest = max(farthest, i + jump)
    return True

meetings = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
print(max_meetings(meetings))
print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]))
`,
      python: {
        files: {
          "main.py": `def max_meetings(meetings):
    chosen, last_end = [], float("-inf")
    for start, end in sorted(meetings, key=lambda m: m[1]):   # earliest end first
        if start >= last_end:
            chosen.append((start, end))
            last_end = end
    return chosen

def can_jump(nums):
    farthest = 0
    for i, jump in enumerate(nums):
        if i > farthest:
            return False                 # stuck before reaching i
        farthest = max(farthest, i + jump)
    return True

meetings = [(1, 4), (3, 5), (0, 6), (5, 7), (3, 9), (5, 9), (6, 10), (8, 11), (8, 12), (2, 14), (12, 16)]
print(max_meetings(meetings))
print(can_jump([2, 3, 1, 1, 4]), can_jump([3, 2, 1, 0, 4]))
`,
        },
      },
      result: `[(1, 4), (5, 7), (8, 11), (12, 16)]
True False`,
      explanation: "Picking the meeting that ends earliest leaves the most time for the rest; an exchange argument proves no other first choice can do better. Sorting costs O(n log n), the scan O(n). Jump game tracks the farthest reachable index in one O(n) pass; if we ever stand beyond it, the end is unreachable.",
    },
  ],
  interview: [
    {
      q: "What is dynamic programming and when can you use it?",
      a: "DP solves problems by combining solutions to subproblems, computing each subproblem once and storing it. It applies when there are overlapping subproblems (the same subproblem recurs) and optimal substructure (the optimal answer is built from optimal sub-answers).",
      level: "Easy",
    },
    {
      q: "Memoization vs tabulation?",
      a: "Memoization is top-down: recursive with a cache (functools.cache), computes only needed states, but uses the call stack. Tabulation is bottom-up: iteratively fills a table from base cases, avoids recursion limits, is usually faster in Python and makes space optimisation easier. Both have the same asymptotic time.",
      level: "Easy",
    },
    {
      q: "What is the difference between DP and divide and conquer?",
      a: "Both split problems into subproblems. In divide and conquer (merge sort, binary search) the subproblems are independent and do not repeat, so caching does not help. In DP the subproblems overlap, so storing results avoids recomputation.",
      level: "Medium",
    },
    {
      q: "Greedy vs dynamic programming: how do you decide?",
      a: "Greedy commits to the locally best choice and never revisits it; it is correct only if the greedy-choice property holds (provable by an exchange argument). DP considers all choices for each subproblem and is correct whenever optimal substructure holds, at higher cost. If you can find a counter-example to the greedy rule (like coins [1, 3, 4] for amount 6), use DP.",
      level: "Medium",
    },
    {
      q: "Explain the coin change DP and its complexity.",
      a: "dp[a] = minimum coins to make amount a. dp[0] = 0; for each a, dp[a] = min(dp[a - c] + 1) over coins c <= a. Return dp[amount] or -1 if unreachable. Time O(amount x number of coins), space O(amount).",
      level: "Medium",
    },
    {
      q: "In the 1D 0/1 knapsack, why do we loop capacity backwards?",
      a: "dp[w] is updated from dp[w - wt]. Going backwards means dp[w - wt] still holds the value from BEFORE considering the current item, so the item is used at most once. Looping forwards would allow reusing the same item, which solves the unbounded knapsack instead.",
      level: "Hard",
    },
    {
      q: "What is Kadane's algorithm?",
      a: "An O(n), O(1)-space algorithm for the maximum subarray sum. Keep current = max(x, current + x), the best sum of a subarray ending at the current index, and best = max(best, current). It is DP where each state depends only on the previous one.",
      level: "Medium",
    },
    {
      q: "How do you find the Longest Increasing Subsequence in O(n log n)?",
      a: "Keep a list tails where tails[k] is the smallest possible tail of an increasing subsequence of length k + 1. For each x, find i = bisect_left(tails, x); replace tails[i] = x or append if i == len(tails). The length of tails is the LIS length. The O(n^2) DP is dp[i] = 1 + max(dp[j]) for j < i with nums[j] < nums[i].",
      level: "Hard",
    },
    {
      q: "Describe edit distance (LeetCode 72).",
      a: "dp[i][j] = minimum operations to turn the first i characters of a into the first j of b. If a[i-1] == b[j-1], dp[i][j] = dp[i-1][j-1]; else 1 + min(dp[i-1][j] (delete), dp[i][j-1] (insert), dp[i-1][j-1] (replace)). Base cases dp[i][0] = i, dp[0][j] = j. O(m x n) time, O(n) space with a rolling row.",
      level: "Hard",
    },
    {
      q: "How should you approach a coding problem you have never seen in an interview?",
      a: "Clarify the problem and constraints with examples; state a brute force and its complexity; look for clues (sorted input, substring, top-k, dependencies, count ways) to choose a pattern; explain the optimised approach before coding; write clean code; dry-run it with normal and edge cases (empty input, one element, duplicates, negatives); finally state time and space complexity and possible trade-offs.",
      level: "Easy",
    },
    {
      q: "Why does greedy interval scheduling sort by END time and not start time?",
      a: "Choosing the meeting that finishes earliest leaves the maximum remaining time for other meetings. Sorting by start time fails: a meeting starting first but lasting all day would block many shorter meetings. Exchange argument: replacing the first meeting in any optimal schedule with the earliest-ending one never creates a conflict.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Unique Paths (LeetCode 62): a robot moves only right or down in an m x n grid. Count paths from top-left to bottom-right. m=3, n=7 -> 28.",
      hint: "dp[r][c] = dp[r-1][c] + dp[r][c-1]; one row is enough.",
      solution: `def unique_paths(m, n):
    # Time O(m * n), Space O(n)
    row = [1] * n
    for _ in range(1, m):
        for c in range(1, n):
            row[c] += row[c - 1]
    return row[-1]

print(unique_paths(3, 7))  # 28
print(unique_paths(3, 2))  # 3
`,
    },
    {
      task: "Longest Increasing Subsequence (LeetCode 300): [10,9,2,5,3,7,101,18] -> 4. Give the O(n log n) solution.",
      hint: "Maintain 'tails' with bisect_left.",
      solution: `import bisect

def length_of_lis(nums):
    # Time O(n log n), Space O(n)
    tails = []
    for x in nums:
        i = bisect.bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)

print(length_of_lis([10, 9, 2, 5, 3, 7, 101, 18]))  # 4
print(length_of_lis([7, 7, 7, 7]))                  # 1
`,
    },
    {
      task: "Partition Equal Subset Sum (LeetCode 416): can [1,5,11,5] be split into two subsets with equal sums? -> True.",
      hint: "0/1 knapsack on target = total // 2 using a boolean row (or a set of reachable sums).",
      solution: `def can_partition(nums):
    # Time O(n * target), Space O(target)
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    dp = [True] + [False] * target
    for x in nums:
        for s in range(target, x - 1, -1):
            dp[s] = dp[s] or dp[s - x]
    return dp[target]

print(can_partition([1, 5, 11, 5]))  # True
print(can_partition([1, 2, 3, 5]))   # False
`,
    },
    {
      task: "Edit Distance (LeetCode 72): 'horse' -> 'ros' needs 3 operations.",
      hint: "dp[i][j] for prefixes; match = diagonal, else 1 + min of delete/insert/replace.",
      solution: `def min_distance(a, b):
    # Time O(m * n), Space O(n)
    prev = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        curr = [i] + [0] * len(b)
        for j in range(1, len(b) + 1):
            if a[i - 1] == b[j - 1]:
                curr[j] = prev[j - 1]
            else:
                curr[j] = 1 + min(prev[j], curr[j - 1], prev[j - 1])
        prev = curr
    return prev[-1]

print(min_distance("horse", "ros"))            # 3
print(min_distance("intention", "execution"))  # 5
`,
    },
    {
      task: "Non-overlapping Intervals (LeetCode 435): minimum intervals to remove so the rest do not overlap. [[1,2],[2,3],[3,4],[1,3]] -> 1.",
      hint: "Greedy: sort by end, keep every interval that starts at or after the last kept end; removed = total - kept.",
      solution: `def erase_overlap_intervals(intervals):
    # Time O(n log n), Space O(1) extra (ignoring sort)
    intervals.sort(key=lambda x: x[1])
    kept, last_end = 0, float("-inf")
    for start, end in intervals:
        if start >= last_end:
            kept += 1
            last_end = end
    return len(intervals) - kept

print(erase_overlap_intervals([[1, 2], [2, 3], [3, 4], [1, 3]]))  # 1
print(erase_overlap_intervals([[1, 2], [1, 2], [1, 2]]))          # 2
`,
    },
  ],
  quiz: [
    {
      question: "Which two properties indicate a problem can be solved with DP?",
      options: [
        "Sorted input and small n",
        "Overlapping subproblems and optimal substructure",
        "Greedy choice and recursion",
        "Hashing and two pointers",
      ],
      answer: 1,
      explanation: "DP reuses repeated subproblems and builds optimal answers from optimal parts.",
    },
    {
      question: "Which Python decorator adds memoization to a function?",
      options: [
        "@staticmethod",
        "@functools.cache",
        "@property",
        "@dataclass",
      ],
      answer: 1,
      explanation: "functools.cache (or lru_cache) stores results by arguments.",
    },
    {
      question: "With coins [1, 3, 4] and amount 6, greedy (largest first) uses how many coins?",
      options: [
        "2",
        "3",
        "4",
        "6",
      ],
      answer: 1,
      explanation: "4 + 1 + 1 = 3 coins, while the optimum is 3 + 3 = 2.",
    },
    {
      question: "Time complexity of LCS for strings of length m and n with tabulation?",
      options: [
        "O(m + n)",
        "O(m * n)",
        "O(2^(m+n))",
        "O(n log n)",
      ],
      answer: 1,
      explanation: "There are m * n states, each computed in O(1).",
    },
    {
      question: "For maximum non-overlapping meetings, the greedy rule is to sort by:",
      options: [
        "Start time",
        "Duration",
        "End time",
        "Random order",
      ],
      answer: 2,
      explanation: "Finishing earliest leaves the most room for later meetings.",
    },
    {
      question: "A problem says 'find the length of the longest substring with at most k distinct characters'. Best pattern?",
      options: [
        "Backtracking",
        "Sliding window with a hash map",
        "Dijkstra",
        "Heap",
      ],
      answer: 1,
      explanation: "Contiguous substring plus a condition is the sliding window clue.",
    },
  ],
};
