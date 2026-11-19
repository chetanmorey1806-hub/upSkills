export default {
  lesson: 'day-05-recursion-backtracking',
  minutes: 40,
  intro: 'Write recursive functions with correct base cases, then use the choose-explore-unchoose backtracking template for subsets, permutations, combination sums and N-Queens.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'A recursive function has no base case (or never reaches it). What happens in Python?',
      options: ['It loops forever silently', '`RecursionError: maximum recursion depth exceeded` (default limit about 1000)', 'Python converts it to a loop automatically', 'It returns None'],
      answer: 1,
      explain: 'Every call adds a frame to the call stack. Python limits the depth (about 1000 by default) and raises RecursionError. Python does **not** do tail-call optimisation, so very deep recursion should be rewritten as a loop.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Trace the call stack. What is printed?',
      code: `def show(n):
    if n == 0:
        print("base")
        return
    print("down", n)
    show(n - 1)
    print("up", n)

show(2)`,
      expected: 'down 2\ndown 1\nbase\nup 1\nup 2',
      explain: 'Code before the recursive call runs on the way **down**; code after it runs on the way back **up**, in reverse order, as each frame is popped from the stack.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Write a recursive `power(x, n)` that computes x**n for n ≥ 0 in **O(log n)** using "fast exponentiation": `x^n = (x^(n//2))^2`, times x when n is odd. Do not use `**` or `pow`.',
      example: { title: 'halving the problem', code: 'def digits(n):\n    if n < 10:\n        return 1\n    return 1 + digits(n // 10)' },
      starter: 'def power(x, n):\n    # TODO\n    return 1\n',
      solution: 'def power(x, n):\n    if n == 0:\n        return 1\n    half = power(x, n // 2)\n    result = half * half\n    if n % 2:\n        result *= x\n    return result\n',
      tests: [
        { call: 'power(2, 10)', expect: 1024 },
        { call: 'power(3, 0)', expect: 1 },
        { call: 'power(5, 3)', expect: 125 },
        { call: 'power(2, 40)', expect: 1099511627776 },
        { call: 'power(-2, 5)', expect: -32 },
      ],
      explain: 'Computing `half` ONCE and squaring it halves n each call, so there are about log2(n) calls. Writing `power(x, n//2) * power(x, n//2)` makes two calls per level and is back to O(n).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Subsets.** Write `subsets(nums)` that returns ALL subsets (the power set) of a list of distinct numbers, using backtracking. Order the result with `sorted(...)` before returning so the tests are order-independent (each subset keeps the input order).',
      example: { title: 'choose / explore / unchoose', code: 'def backtrack(start, path):\n    result.append(path[:])          # record a copy\n    for i in range(start, len(nums)):\n        path.append(nums[i])          # choose\n        backtrack(i + 1, path)        # explore\n        path.pop()                    # unchoose' },
      starter: 'def subsets(nums):\n    result = []\n    # TODO\n    return sorted(result)\n',
      solution: 'def subsets(nums):\n    result = []\n    def backtrack(start, path):\n        result.append(path[:])\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n    backtrack(0, [])\n    return sorted(result)\n',
      tests: [
        { call: 'subsets([1, 2, 3])', expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
        { call: 'subsets([])', expect: [[]] },
        { call: 'len(subsets(list(range(10))))', expect: 1024 },
      ],
      explain: 'n items give 2^n subsets, so any algorithm is O(2^n · n). Append a COPY (`path[:]`): appending `path` itself stores the same list object every time, and after all the pops you would get a list of empty lists.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Combination Sum.** Given distinct positive `candidates` and a `target`, return all unique combinations (each sorted ascending) where the numbers sum to target. A number may be used **unlimited** times. Return the list of combinations sorted.',
      example: { title: 'reusing an element', code: '# pass i (not i + 1) to allow reusing candidates[i]\nbacktrack(i, path, remaining - candidates[i])' },
      starter: 'def combination_sum(candidates, target):\n    result = []\n    # TODO\n    return sorted(result)\n',
      solution: 'def combination_sum(candidates, target):\n    candidates = sorted(candidates)\n    result = []\n    def backtrack(start, path, remaining):\n        if remaining == 0:\n            result.append(path[:])\n            return\n        for i in range(start, len(candidates)):\n            c = candidates[i]\n            if c > remaining:\n                break\n            path.append(c)\n            backtrack(i, path, remaining - c)\n            path.pop()\n    backtrack(0, [], target)\n    return sorted(result)\n',
      tests: [
        { call: 'combination_sum([2, 3, 6, 7], 7)', expect: [[2, 2, 3], [7]] },
        { call: 'combination_sum([2, 3, 5], 8)', expect: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
        { call: 'combination_sum([2], 1)', expect: [] },
        { call: 'combination_sum([5, 1], 3)', expect: [[1, 1, 1]] },
      ],
      explain: 'Recursing with `i` (not `i + 1`) allows reuse; starting the loop at `start` prevents duplicates like [2,3,2]. Sorting the candidates lets you `break` (prune) as soon as a number is bigger than what remains.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 10,
      q: '**N-Queens.** Write `n_queens(n)` that returns the NUMBER of ways to place n queens on an n×n board so that no two attack each other (same row, column or diagonal). Place one queen per row and track used columns and both diagonals in sets.',
      example: { title: 'diagonal ids', code: '# cells on the same "\\" diagonal share row - col\n# cells on the same "/" diagonal share row + col\ncols, diag1, diag2 = set(), set(), set()' },
      starter: 'def n_queens(n):\n    # TODO\n    return 0\n',
      solution: 'def n_queens(n):\n    cols, d1, d2 = set(), set(), set()\n    def place(row):\n        if row == n:\n            return 1\n        count = 0\n        for c in range(n):\n            if c in cols or row - c in d1 or row + c in d2:\n                continue\n            cols.add(c); d1.add(row - c); d2.add(row + c)\n            count += place(row + 1)\n            cols.remove(c); d1.remove(row - c); d2.remove(row + c)\n        return count\n    return place(0)\n',
      tests: [
        { call: 'n_queens(1)', expect: 1 },
        { call: 'n_queens(2)', expect: 0 },
        { call: 'n_queens(3)', expect: 0 },
        { call: 'n_queens(4)', expect: 2 },
        { call: 'n_queens(6)', expect: 4 },
        { call: 'n_queens(8)', expect: 92 },
      ],
      explain: 'Placing exactly one queen per row handles row conflicts automatically. Sets give O(1) checks for columns and the two diagonal directions (`row - col` and `row + col` are constant along them). Undo all three additions when backtracking.',
    },
  ],
};
