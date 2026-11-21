export default [
  {
    id: 'rb-fibonacci',
    title: 'N-th Fibonacci Number (Memoised Recursion)',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    statement: "The Fibonacci numbers are `F(0) = 0`, `F(1) = 1` and `F(n) = F(n-1) + F(n-2)` for `n >= 2`. Given `n`, return `F(n)`. A plain recursive solution recomputes the same values again and again, so make yours fast enough for `n = 70`.",
    examples: [
      { input: 'n = 10', output: '55' },
      { input: 'n = 2', output: '1', explain: 'F(2) = F(1) + F(0) = 1.' },
    ],
    constraints: ['0 <= n <= 70'],
    hints: ['Draw the recursion tree for F(5): F(3) and F(2) appear several times.', 'Store each F(k) the first time you compute it (memoisation) and reuse it.'],
    approach: "The recursive definition translates directly into a function, but without care it calls itself about 2^n times because the same subproblems are solved repeatedly. Add a memo (a dictionary or array) that stores `F(k)` once it is known. Before computing, check the memo; after computing, save the result. Now each value from 0 to n is computed once, so the time is linear. An iterative loop that keeps only the last two values is equally fast and uses O(1) space. The unmemoised recursion is O(2^n) and already takes seconds around n = 40.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'fib', js: 'fib' },
    py: {
      starter: 'def fib(n):\n    # write your code here\n    pass\n',
      solution: `def fib(n):
    memo = {0: 0, 1: 1}

    def go(k):
        if k not in memo:
            memo[k] = go(k - 1) + go(k - 2)
        return memo[k]

    return go(n)
`,
    },
    js: {
      starter: 'function fib(n) {\n  // write your code here\n}\n',
      solution: `function fib(n) {
  const memo = new Map([[0, 0], [1, 1]]);
  const go = (k) => {
    if (!memo.has(k)) memo.set(k, go(k - 1) + go(k - 2));
    return memo.get(k);
  };
  return go(n);
}
`,
    },
    tests: [
      { args: [0], expect: 0 },
      { args: [1], expect: 1 },
      { args: [2], expect: 1 },
      { args: [10], expect: 55 },
      { args: [30], expect: 832040 },
      { args: [50], expect: 12586269025 },
      { args: [70], expect: 190392490709135 },
    ],
  },
  {
    id: 'rb-tower-of-hanoi',
    title: 'Tower of Hanoi Moves',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['TCS', 'Wipro', 'Cognizant', 'Amazon'],
    statement: "There are three rods numbered 1, 2 and 3, and `n` disks of different sizes stacked on rod `src` (largest at the bottom). Move the whole stack to rod `dst` using the third rod as a helper. You may move only the top disk of a rod, one at a time, and never place a larger disk on a smaller one. Return the list of moves `[from, to]` of the standard minimal solution: move the top `n - 1` disks to the helper, move the largest disk to `dst`, then move the `n - 1` disks from the helper to `dst`.",
    examples: [
      { input: 'n = 2, src = 1, dst = 3', output: '[[1, 2], [1, 3], [2, 3]]' },
      { input: 'n = 1, src = 2, dst = 1', output: '[[2, 1]]' },
    ],
    constraints: ['0 <= n <= 15', 'src and dst are different values from {1, 2, 3}'],
    hints: ['The helper rod is 6 - src - dst.', 'Solve(n) = Solve(n-1 to helper) + move largest + Solve(n-1 from helper to dst).'],
    approach: "Think recursively. To move `n` disks from `src` to `dst`, the largest disk must move exactly once, and at that moment all other disks must sit on the helper rod (`6 - src - dst`). So first move `n - 1` disks from `src` to the helper, then move the largest disk from `src` to `dst`, then move the `n - 1` disks from the helper onto `dst`. The base case `n = 0` needs no moves. This produces `2^n - 1` moves, which is proven minimal, so the running time is proportional to the output. There is no faster way because every one of these moves must be listed.",
    complexity: 'Time O(2^n), Space O(n) recursion depth plus the output',
    fn: { py: 'tower_of_hanoi', js: 'towerOfHanoi' },
    py: {
      starter: 'def tower_of_hanoi(n, src, dst):\n    # write your code here\n    pass\n',
      solution: `def tower_of_hanoi(n, src, dst):
    moves = []

    def solve(k, a, c):
        if k == 0:
            return
        b = 6 - a - c
        solve(k - 1, a, b)
        moves.append([a, c])
        solve(k - 1, b, c)

    solve(n, src, dst)
    return moves
`,
    },
    js: {
      starter: 'function towerOfHanoi(n, src, dst) {\n  // write your code here\n}\n',
      solution: `function towerOfHanoi(n, src, dst) {
  const moves = [];
  const solve = (k, a, c) => {
    if (k === 0) return;
    const b = 6 - a - c;
    solve(k - 1, a, b);
    moves.push([a, c]);
    solve(k - 1, b, c);
  };
  solve(n, src, dst);
  return moves;
}
`,
    },
    tests: [
      { args: [0, 1, 3], expect: [] },
      { args: [1, 1, 3], expect: [[1, 3]] },
      { args: [2, 1, 3], expect: [[1, 2], [1, 3], [2, 3]] },
      { args: [3, 1, 3], expect: [[1, 3], [1, 2], [3, 2], [1, 3], [2, 1], [2, 3], [1, 3]] },
      { args: [2, 3, 1], expect: [[3, 2], [3, 1], [2, 1]] },
      { args: [1, 2, 1], expect: [[2, 1]] },
      { args: [3, 1, 2], expect: [[1, 2], [1, 3], [2, 3], [1, 2], [3, 1], [3, 2], [1, 2]] },
      { args: [4, 1, 3], expect: [[1, 2], [1, 3], [2, 3], [1, 2], [3, 1], [3, 2], [1, 2], [1, 3], [2, 3], [2, 1], [3, 1], [2, 3], [1, 2], [1, 3], [2, 3]] },
    ],
  },
  {
    id: 'rb-binary-strings-no-consecutive-ones',
    title: 'Binary Strings Without Consecutive 1s',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'TCS', 'Infosys'],
    statement: "Given `n`, return every binary string of length `n` that never has two `1`s next to each other. Return the strings sorted in increasing (lexicographic) order.",
    examples: [
      { input: 'n = 2', output: '["00", "01", "10"]', explain: '"11" is not allowed.' },
      { input: 'n = 3', output: '["000", "001", "010", "100", "101"]' },
    ],
    constraints: ['1 <= n <= 15'],
    hints: ['Build the string one character at a time.', 'You can always append 0; you can append 1 only if the last character is not 1. Try 0 before 1 to get sorted output.'],
    approach: "Use recursion that builds the string from left to right. At each step you can always add '0'. You can add '1' only when the string is empty or its last character is '0'. When the length reaches n, record the string. Because each step tries '0' before '1', the strings are produced in lexicographic order and no sorting is needed. Only valid strings are ever built, so the work is proportional to the output size, which is a Fibonacci number. Generating all 2^n strings and filtering out those containing \"11\" is wasteful.",
    complexity: 'Time O(F(n+2) * n), Space O(n) recursion depth plus the output',
    fn: { py: 'binary_strings', js: 'binaryStrings' },
    py: {
      starter: 'def binary_strings(n):\n    # write your code here\n    pass\n',
      solution: `def binary_strings(n):
    res = []

    def build(cur):
        if len(cur) == n:
            res.append(cur)
            return
        build(cur + '0')
        if not cur or cur[-1] == '0':
            build(cur + '1')

    build('')
    return res
`,
    },
    js: {
      starter: 'function binaryStrings(n) {\n  // write your code here\n}\n',
      solution: `function binaryStrings(n) {
  const res = [];
  const build = (cur) => {
    if (cur.length === n) { res.push(cur); return; }
    build(cur + '0');
    if (cur.length === 0 || cur[cur.length - 1] === '0') build(cur + '1');
  };
  build('');
  return res;
}
`,
    },
    tests: [
      { args: [1], expect: ['0', '1'] },
      { args: [2], expect: ['00', '01', '10'] },
      { args: [3], expect: ['000', '001', '010', '100', '101'] },
      { args: [4], expect: ['0000', '0001', '0010', '0100', '0101', '1000', '1001', '1010'] },
      { args: [5], expect: ['00000', '00001', '00010', '00100', '00101', '01000', '01001', '01010', '10000', '10001', '10010', '10100', '10101'] },
      { args: [6], expect: ['000000', '000001', '000010', '000100', '000101', '001000', '001001', '001010', '010000', '010001', '010010', '010100', '010101', '100000', '100001', '100010', '100100', '100101', '101000', '101001', '101010'] },
    ],
  },
  {
    id: 'rb-climbing-stairs',
    title: 'Climbing Stairs',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Adobe', 'Accenture', 'Infosys'],
    statement: "You are climbing a staircase with `n` steps. Each move climbs either 1 step or 2 steps. Return the number of distinct sequences of moves that reach exactly the top.",
    examples: [
      { input: 'n = 3', output: '3', explain: '1+1+1, 1+2 and 2+1.' },
      { input: 'n = 5', output: '8' },
    ],
    constraints: ['1 <= n <= 45'],
    hints: ['The last move is either 1 step (from n-1) or 2 steps (from n-2).', 'ways(n) = ways(n-1) + ways(n-2); memoise it.'],
    approach: "Look at the final move. If it was 1 step, the earlier moves reached step n - 1 in `ways(n-1)` ways; if it was 2 steps, they reached step n - 2 in `ways(n-2)` ways. These cases do not overlap, so `ways(n) = ways(n-1) + ways(n-2)` with `ways(1) = 1` and `ways(2) = 2`. Implement the recursion with a memo so each value is computed once, giving linear time. This is the Fibonacci recurrence shifted by one. Without memoisation the recursion takes exponential time and is too slow for n = 45.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'climb_stairs', js: 'climbStairs' },
    py: {
      starter: 'def climb_stairs(n):\n    # write your code here\n    pass\n',
      solution: `def climb_stairs(n):
    memo = {1: 1, 2: 2}

    def ways(k):
        if k not in memo:
            memo[k] = ways(k - 1) + ways(k - 2)
        return memo[k]

    return ways(n)
`,
    },
    js: {
      starter: 'function climbStairs(n) {\n  // write your code here\n}\n',
      solution: `function climbStairs(n) {
  const memo = new Map([[1, 1], [2, 2]]);
  const ways = (k) => {
    if (!memo.has(k)) memo.set(k, ways(k - 1) + ways(k - 2));
    return memo.get(k);
  };
  return ways(n);
}
`,
    },
    tests: [
      { args: [1], expect: 1 },
      { args: [2], expect: 2 },
      { args: [3], expect: 3 },
      { args: [5], expect: 8 },
      { args: [10], expect: 89 },
      { args: [45], expect: 1836311903 },
    ],
  },
  {
    id: 'rb-fast-power',
    title: 'Power Function (Recursive Fast Exponentiation)',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['TCS', 'Infosys', 'Amazon', 'LinkedIn'],
    statement: "Given an integer `x` and a non-negative integer `n`, return `x^n` using recursion. `n` can be as large as 10^9 (the test values are chosen so that the result fits in 2^53), so multiplying `x` by itself `n` times is too slow. Define `x^0 = 1`.",
    examples: [
      { input: 'x = 2, n = 10', output: '1024' },
      { input: 'x = -2, n = 3', output: '-8' },
    ],
    constraints: ['-100 <= x <= 100', '0 <= n <= 10^9', '|x^n| <= 2^53'],
    hints: ['x^n = (x^(n/2))^2 when n is even.', 'When n is odd, x^n = x * x^(n-1). Compute the half power only once.'],
    approach: "Use the identity `x^n = (x^(n//2))^2` for even `n` and `x^n = x * (x^(n//2))^2` for odd `n`. Recursively compute `half = power(x, n // 2)` once, square it, and multiply by `x` if `n` is odd. The base case is `n = 0`, which returns 1. Each call halves `n`, so there are only about log2(n) calls. The key mistake to avoid is calling `power(x, n // 2)` twice, which brings the time back to O(n). The naive loop of n multiplications is O(n) and would take a billion steps.",
    complexity: 'Time O(log n), Space O(log n) recursion depth',
    fn: { py: 'power', js: 'power' },
    py: {
      starter: 'def power(x, n):\n    # write your code here\n    pass\n',
      solution: `def power(x, n):
    if n == 0:
        return 1
    half = power(x, n // 2)
    if n % 2 == 0:
        return half * half
    return half * half * x
`,
    },
    js: {
      starter: 'function power(x, n) {\n  // write your code here\n}\n',
      solution: `function power(x, n) {
  if (n === 0) return 1;
  const half = power(x, Math.floor(n / 2));
  return n % 2 === 0 ? half * half : half * half * x;
}
`,
    },
    tests: [
      { args: [2, 10], expect: 1024 },
      { args: [3, 0], expect: 1 },
      { args: [-2, 3], expect: -8 },
      { args: [5, 1], expect: 5 },
      { args: [7, 15], expect: 4747561509943 },
      { args: [-1, 1000000001], expect: -1 },
      { args: [1, 1000000000], expect: 1 },
      { args: [2, 52], expect: 4503599627370496 },
    ],
  },
  {
    id: 'rb-josephus-problem',
    title: 'Josephus Problem',
    diff: 'Easy',
    pattern: 'Recursion & Backtracking',
    companies: ['TCS', 'Wipro', 'Accenture', 'Amazon'],
    statement: "`n` people stand in a circle, numbered 1 to `n`. Starting from person 1, count `k` people clockwise (including the starting person); the `k`-th person leaves the circle. Counting restarts from the next person, and this continues until one person remains. Return that survivor's number.",
    examples: [
      { input: 'n = 5, k = 2', output: '3', explain: 'People leave in the order 2, 4, 1, 5.' },
      { input: 'n = 7, k = 3', output: '4' },
    ],
    constraints: ['1 <= n <= 10^5', '1 <= k <= 10^5'],
    hints: ['After the first person leaves, the problem is the same with n - 1 people, just with shifted numbering.', 'Zero-based: J(1) = 0 and J(n) = (J(n-1) + k) mod n. Add 1 at the end.'],
    approach: "Use zero-based positions. With one person the survivor is position 0. With `n` people, the first person removed is at position `(k - 1) mod n`, and counting continues from the next position, which becomes position 0 of an (n - 1)-person problem. So the survivor's position is `J(n) = (J(n-1) + k) mod n`. This recurrence can be written recursively, but evaluating it with a loop from 2 up to n avoids deep recursion for n = 10^5. Add 1 at the end to convert to the 1-based numbering. Simulating the circle with a list and removing elements is O(n^2) because each removal shifts the list.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'josephus', js: 'josephus' },
    py: {
      starter: 'def josephus(n, k):\n    # write your code here\n    pass\n',
      solution: `def josephus(n, k):
    pos = 0
    for size in range(2, n + 1):
        pos = (pos + k) % size
    return pos + 1
`,
    },
    js: {
      starter: 'function josephus(n, k) {\n  // write your code here\n}\n',
      solution: `function josephus(n, k) {
  let pos = 0;
  for (let size = 2; size <= n; size++) pos = (pos + k) % size;
  return pos + 1;
}
`,
    },
    tests: [
      { args: [5, 2], expect: 3 },
      { args: [7, 3], expect: 4 },
      { args: [1, 1], expect: 1 },
      { args: [6, 1], expect: 6 },
      { args: [10, 2], expect: 5 },
      { args: [14, 2], expect: 13 },
      { args: [41, 3], expect: 31 },
    ],
  },
  {
    id: 'rb-subsets',
    title: 'All Subsets (Power Set)',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Facebook', 'Microsoft', 'Infosys'],
    statement: "Given an array `nums` of **distinct** integers, return all of its subsets. Write every subset in ascending order, and return the list of subsets sorted lexicographically (compare element by element; a subset that is a prefix of another comes first). The empty subset is included.",
    examples: [
      { input: 'nums = [3, 1, 2]', output: '[[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]]' },
      { input: 'nums = [0]', output: '[[], [0]]' },
    ],
    constraints: ['0 <= nums.length <= 10', '-10 <= nums[i] <= 10', 'All values are distinct'],
    hints: ['Sort the input first.', 'Backtrack: record the current subset, then for each later index add that element, recurse and remove it again.'],
    approach: "Sort `nums` so every subset is built in ascending order. Write a recursive function `backtrack(start, cur)`. It first records a copy of `cur`, then for every index `i` from `start` to the end it appends `nums[i]`, recurses with `start = i + 1`, and pops the element again. Because the recursion visits subsets in pre-order and tries smaller elements first, the output is already in lexicographic order. There are 2^n subsets and copying each costs up to n, so the time is O(n * 2^n), which is optimal since that is the output size. A bitmask loop over 0 to 2^n - 1 is equally fast but needs a final sort to match the required order.",
    complexity: 'Time O(n * 2^n), Space O(n) recursion depth plus the output',
    fn: { py: 'subsets', js: 'subsets' },
    py: {
      starter: 'def subsets(nums):\n    # write your code here\n    pass\n',
      solution: `def subsets(nums):
    nums = sorted(nums)
    res = []
    cur = []

    def backtrack(start):
        res.append(cur[:])
        for i in range(start, len(nums)):
            cur.append(nums[i])
            backtrack(i + 1)
            cur.pop()

    backtrack(0)
    return res
`,
    },
    js: {
      starter: 'function subsets(nums) {\n  // write your code here\n}\n',
      solution: `function subsets(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const res = [], cur = [];
  const backtrack = (start) => {
    res.push([...cur]);
    for (let i = start; i < a.length; i++) {
      cur.push(a[i]);
      backtrack(i + 1);
      cur.pop();
    }
  };
  backtrack(0);
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 3]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
      { args: [[0]], expect: [[], [0]] },
      { args: [[]], expect: [[]] },
      { args: [[3, 1, 2]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
      { args: [[-1, 5]], expect: [[], [-1], [-1, 5], [5]] },
      { args: [[1, 2, 3, 4]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 2, 3, 4], [1, 2, 4], [1, 3], [1, 3, 4], [1, 4], [2], [2, 3], [2, 3, 4], [2, 4], [3], [3, 4], [4]] },
    ],
  },
  {
    id: 'rb-permutations',
    title: 'All Permutations',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Microsoft', 'TCS', 'LinkedIn'],
    statement: "Given an array `nums` of **distinct** integers, return all possible orderings (permutations) of its elements, sorted in lexicographic order.",
    examples: [
      { input: 'nums = [3, 1, 2]', output: '[[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]]' },
      { input: 'nums = [0, 1]', output: '[[0, 1], [1, 0]]' },
    ],
    constraints: ['1 <= nums.length <= 6', '-10 <= nums[i] <= 10', 'All values are distinct'],
    hints: ['Sort first so that smaller numbers are tried first at every position.', 'Keep a used[] array; at each depth try every unused element, recurse, then undo.'],
    approach: "Sort `nums`. Build permutations position by position with a recursive function and a `used` array. At each depth, loop over the elements in sorted order; for each unused element, mark it used, append it, recurse, and then undo both changes. When the current list has n elements, record a copy. Because every position tries elements in ascending order, the permutations come out in lexicographic order. There are n! permutations of length n, so O(n * n!) is the best possible. Generating all n^n sequences and filtering out ones with repeats is much slower.",
    complexity: 'Time O(n * n!), Space O(n) besides the output',
    fn: { py: 'permute', js: 'permute' },
    py: {
      starter: 'def permute(nums):\n    # write your code here\n    pass\n',
      solution: `def permute(nums):
    nums = sorted(nums)
    n = len(nums)
    used = [False] * n
    cur, res = [], []

    def backtrack():
        if len(cur) == n:
            res.append(cur[:])
            return
        for i in range(n):
            if not used[i]:
                used[i] = True
                cur.append(nums[i])
                backtrack()
                cur.pop()
                used[i] = False

    backtrack()
    return res
`,
    },
    js: {
      starter: 'function permute(nums) {\n  // write your code here\n}\n',
      solution: `function permute(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const n = a.length, used = new Array(n).fill(false);
  const cur = [], res = [];
  const backtrack = () => {
    if (cur.length === n) { res.push([...cur]); return; }
    for (let i = 0; i < n; i++) {
      if (used[i]) continue;
      used[i] = true; cur.push(a[i]);
      backtrack();
      cur.pop(); used[i] = false;
    }
  };
  backtrack();
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 3]], expect: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[0, 1]], expect: [[0, 1], [1, 0]] },
      { args: [[1]], expect: [[1]] },
      { args: [[3, 1, 2]], expect: [[1, 2, 3], [1, 3, 2], [2, 1, 3], [2, 3, 1], [3, 1, 2], [3, 2, 1]] },
      { args: [[5, -1]], expect: [[-1, 5], [5, -1]] },
      { args: [[4, 2]], expect: [[2, 4], [4, 2]] },
    ],
  },
  {
    id: 'rb-combination-sum',
    title: 'Combination Sum (Unlimited Reuse)',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Uber', 'Adobe', 'Infosys'],
    statement: "Given an array of **distinct** positive integers `candidates` and a `target`, return every combination of candidates whose sum is exactly `target`. Each candidate may be used any number of times. Write each combination in non-decreasing order and return the list sorted lexicographically. Two combinations are the same if they use the same numbers the same number of times.",
    examples: [
      { input: 'candidates = [2, 3, 6, 7], target = 7', output: '[[2, 2, 3], [7]]' },
      { input: 'candidates = [2, 3, 5], target = 8', output: '[[2, 2, 2, 2], [2, 3, 3], [3, 5]]' },
    ],
    constraints: ['1 <= candidates.length <= 30', '2 <= candidates[i] <= 40', '1 <= target <= 40', 'All candidates are distinct'],
    hints: ['Sort the candidates. To avoid duplicates, never pick a candidate smaller than the last one picked.', 'Recurse with the same start index (reuse allowed) and stop when the remaining target would go negative.'],
    approach: "Sort the candidates. Use `backtrack(start, remaining)`: if `remaining` is 0 record a copy of the current combination. Otherwise loop `i` from `start`; if `candidates[i]` exceeds `remaining`, stop the loop, since all later candidates are larger. Else append it, recurse with the same `i` (so it can be reused) and `remaining - candidates[i]`, and pop it afterwards. Starting from `i` instead of 0 keeps each combination non-decreasing, so no combination is produced twice, and trying smaller candidates first gives lexicographic order. The search is exponential in the worst case, as the output itself can be, but pruning keeps it fast for these limits.",
    complexity: 'Time O(N^(T/m + 1)) in the worst case where T is the target and m the smallest candidate, Space O(T/m)',
    fn: { py: 'combination_sum', js: 'combinationSum' },
    py: {
      starter: 'def combination_sum(candidates, target):\n    # write your code here\n    pass\n',
      solution: `def combination_sum(candidates, target):
    cand = sorted(candidates)
    res, cur = [], []

    def backtrack(start, remaining):
        if remaining == 0:
            res.append(cur[:])
            return
        for i in range(start, len(cand)):
            if cand[i] > remaining:
                break
            cur.append(cand[i])
            backtrack(i, remaining - cand[i])
            cur.pop()

    backtrack(0, target)
    return res
`,
    },
    js: {
      starter: 'function combinationSum(candidates, target) {\n  // write your code here\n}\n',
      solution: `function combinationSum(candidates, target) {
  const cand = [...candidates].sort((a, b) => a - b);
  const res = [], cur = [];
  const backtrack = (start, remaining) => {
    if (remaining === 0) { res.push([...cur]); return; }
    for (let i = start; i < cand.length; i++) {
      if (cand[i] > remaining) break;
      cur.push(cand[i]);
      backtrack(i, remaining - cand[i]);
      cur.pop();
    }
  };
  backtrack(0, target);
  return res;
}
`,
    },
    tests: [
      { args: [[2, 3, 6, 7], 7], expect: [[2, 2, 3], [7]] },
      { args: [[2, 3, 5], 8], expect: [[2, 2, 2, 2], [2, 3, 3], [3, 5]] },
      { args: [[2], 1], expect: [] },
      { args: [[5, 10], 3], expect: [] },
      { args: [[7, 3, 2], 18], expect: [[2, 2, 2, 2, 2, 2, 2, 2, 2], [2, 2, 2, 2, 2, 2, 3, 3], [2, 2, 2, 2, 3, 7], [2, 2, 2, 3, 3, 3, 3], [2, 2, 7, 7], [2, 3, 3, 3, 7], [3, 3, 3, 3, 3, 3]] },
      { args: [[8, 7, 4, 3], 11], expect: [[3, 4, 4], [3, 8], [4, 7]] },
      { args: [[2, 4], 4], expect: [[2, 2], [4]] },
    ],
  },
  {
    id: 'rb-generate-parentheses',
    title: 'Generate Balanced Parentheses',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Zoho'],
    statement: "Given `n` pairs of parentheses, return every string of length `2n` made of `(` and `)` that is balanced (every prefix has at least as many `(` as `)`, and the totals are equal). Return the strings sorted lexicographically (`(` comes before `)`).",
    examples: [
      { input: 'n = 2', output: '["(())", "()()"]' },
      { input: 'n = 3', output: '["((()))", "(()())", "(())()", "()(())", "()()()"]' },
    ],
    constraints: ['0 <= n <= 8'],
    hints: ['Track how many open and close brackets you have used.', 'You may add "(" while open < n, and ")" while close < open.'],
    approach: "Build the string character by character with a recursive function that knows how many `(` and `)` are already used. Adding `(` is allowed while fewer than `n` have been used. Adding `)` is allowed only while it would not close more brackets than are open, that is while `close < open`. When the length reaches `2n`, the string is balanced, so record it. Trying `(` before `)` produces the strings in lexicographic order. Only valid prefixes are ever extended, so the work is proportional to the output (the n-th Catalan number times n). Generating all 2^(2n) strings and checking each is far slower.",
    complexity: 'Time O(4^n / sqrt(n)), Space O(n) besides the output',
    fn: { py: 'generate_parenthesis', js: 'generateParenthesis' },
    py: {
      starter: 'def generate_parenthesis(n):\n    # write your code here\n    pass\n',
      solution: `def generate_parenthesis(n):
    res = []

    def build(cur, opened, closed):
        if len(cur) == 2 * n:
            res.append(cur)
            return
        if opened < n:
            build(cur + '(', opened + 1, closed)
        if closed < opened:
            build(cur + ')', opened, closed + 1)

    build('', 0, 0)
    return res
`,
    },
    js: {
      starter: 'function generateParenthesis(n) {\n  // write your code here\n}\n',
      solution: `function generateParenthesis(n) {
  const res = [];
  const build = (cur, opened, closed) => {
    if (cur.length === 2 * n) { res.push(cur); return; }
    if (opened < n) build(cur + '(', opened + 1, closed);
    if (closed < opened) build(cur + ')', opened, closed + 1);
  };
  build('', 0, 0);
  return res;
}
`,
    },
    tests: [
      { args: [1], expect: ['()'] },
      { args: [2], expect: ['(())', '()()'] },
      { args: [3], expect: ['((()))', '(()())', '(())()', '()(())', '()()()'] },
      { args: [4], expect: ['(((())))', '((()()))', '((())())', '((()))()', '(()(()))', '(()()())', '(()())()', '(())(())', '(())()()', '()((()))', '()(()())', '()(())()', '()()(())', '()()()()'] },
      { args: [5], expect: ['((((()))))', '(((()())))', '(((())()))', '(((()))())', '(((())))()', '((()(())))', '((()()()))', '((()())())', '((()()))()', '((())(()))', '((())()())', '((())())()', '((()))(())', '((()))()()', '(()((())))', '(()(()()))', '(()(())())', '(()(()))()', '(()()(()))', '(()()()())', '(()()())()', '(()())(())', '(()())()()', '(())((()))', '(())(()())', '(())(())()', '(())()(())', '(())()()()', '()(((())))', '()((()()))', '()((())())', '()((()))()', '()(()(()))', '()(()()())', '()(()())()', '()(())(())', '()(())()()', '()()((()))', '()()(()())', '()()(())()', '()()()(())', '()()()()()'] },
      { args: [0], expect: [''] },
    ],
  },
  {
    id: 'rb-letter-combinations',
    title: 'Letter Combinations of a Phone Number',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Google', 'Uber', 'Infosys'],
    statement: "On an old phone keypad the digits map to letters: `2: abc, 3: def, 4: ghi, 5: jkl, 6: mno, 7: pqrs, 8: tuv, 9: wxyz`. Given a string `digits` containing only 2 to 9, return every letter string the digits could represent, sorted lexicographically. If `digits` is empty, return an empty list.",
    examples: [
      { input: 'digits = "23"', output: '["ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf"]' },
      { input: 'digits = ""', output: '[]' },
    ],
    constraints: ['0 <= digits.length <= 4', 'digits[i] is in the range "2" to "9"'],
    hints: ['Each digit chooses one letter; recursion goes one digit deeper per level.', 'Trying letters in alphabetical order at every level yields sorted output.'],
    approach: "Store the keypad mapping. Recurse over the positions of `digits`: at position `i`, loop over the letters of `digits[i]` in order, append the letter, recurse to position `i + 1`, and remove it. When the position reaches the end, record the built string. Since each level tries letters alphabetically, the strings are produced in sorted order. With up to 4 letters per digit there are at most 4^n results, each of length n, so the time is O(n * 4^n), which matches the output size. The empty input is a special case that returns an empty list instead of a list with one empty string.",
    complexity: 'Time O(n * 4^n), Space O(n) besides the output',
    fn: { py: 'letter_combinations', js: 'letterCombinations' },
    py: {
      starter: 'def letter_combinations(digits):\n    # write your code here\n    pass\n',
      solution: `def letter_combinations(digits):
    if not digits:
        return []
    keys = {'2': 'abc', '3': 'def', '4': 'ghi', '5': 'jkl', '6': 'mno', '7': 'pqrs', '8': 'tuv', '9': 'wxyz'}
    res = []

    def build(i, cur):
        if i == len(digits):
            res.append(cur)
            return
        for ch in keys[digits[i]]:
            build(i + 1, cur + ch)

    build(0, '')
    return res
`,
    },
    js: {
      starter: 'function letterCombinations(digits) {\n  // write your code here\n}\n',
      solution: `function letterCombinations(digits) {
  if (!digits) return [];
  const keys = { 2: 'abc', 3: 'def', 4: 'ghi', 5: 'jkl', 6: 'mno', 7: 'pqrs', 8: 'tuv', 9: 'wxyz' };
  const res = [];
  const build = (i, cur) => {
    if (i === digits.length) { res.push(cur); return; }
    for (const ch of keys[digits[i]]) build(i + 1, cur + ch);
  };
  build(0, '');
  return res;
}
`,
    },
    tests: [
      { args: ['23'], expect: ['ad', 'ae', 'af', 'bd', 'be', 'bf', 'cd', 'ce', 'cf'] },
      { args: [''], expect: [] },
      { args: ['2'], expect: ['a', 'b', 'c'] },
      { args: ['79'], expect: ['pw', 'px', 'py', 'pz', 'qw', 'qx', 'qy', 'qz', 'rw', 'rx', 'ry', 'rz', 'sw', 'sx', 'sy', 'sz'] },
      { args: ['234'], expect: ['adg', 'adh', 'adi', 'aeg', 'aeh', 'aei', 'afg', 'afh', 'afi', 'bdg', 'bdh', 'bdi', 'beg', 'beh', 'bei', 'bfg', 'bfh', 'bfi', 'cdg', 'cdh', 'cdi', 'ceg', 'ceh', 'cei', 'cfg', 'cfh', 'cfi'] },
      { args: ['9'], expect: ['w', 'x', 'y', 'z'] },
    ],
  },
  {
    id: 'rb-subsets-with-duplicates',
    title: 'Subsets with Duplicate Elements',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Facebook', 'Bloomberg'],
    statement: "Given an array `nums` that **may contain duplicates**, return all distinct subsets (two subsets are the same if they contain the same values with the same counts). Write each subset in ascending order and return the list sorted lexicographically, with the empty subset first.",
    examples: [
      { input: 'nums = [1, 2, 2]', output: '[[], [1], [1, 2], [1, 2, 2], [2], [2, 2]]' },
      { input: 'nums = [1, 1]', output: '[[], [1], [1, 1]]' },
    ],
    constraints: ['1 <= nums.length <= 10', '-10 <= nums[i] <= 10'],
    hints: ['Sort first so equal values are next to each other.', 'At one recursion level, skip an element if it equals the previous element at that same level.'],
    approach: "Sort the array so duplicates sit together. Use the same pre-order backtracking as for distinct subsets: record the current subset, then for each index `i` from `start` add `nums[i]`, recurse with `i + 1` and remove it. The only change is to skip `nums[i]` when `i > start` and `nums[i] == nums[i - 1]`: choosing the second copy as the next element at the same level would produce exactly the subsets already produced by the first copy. Deeper levels may still use the second copy, so subsets like [2, 2] are kept. The output comes out in lexicographic order. Generating all 2^n subsets and deduplicating with a set costs extra memory and a final sort.",
    complexity: 'Time O(n * 2^n), Space O(n) besides the output',
    fn: { py: 'subsets_with_dup', js: 'subsetsWithDup' },
    py: {
      starter: 'def subsets_with_dup(nums):\n    # write your code here\n    pass\n',
      solution: `def subsets_with_dup(nums):
    nums = sorted(nums)
    res, cur = [], []

    def backtrack(start):
        res.append(cur[:])
        for i in range(start, len(nums)):
            if i > start and nums[i] == nums[i - 1]:
                continue
            cur.append(nums[i])
            backtrack(i + 1)
            cur.pop()

    backtrack(0)
    return res
`,
    },
    js: {
      starter: 'function subsetsWithDup(nums) {\n  // write your code here\n}\n',
      solution: `function subsetsWithDup(nums) {
  const a = [...nums].sort((x, y) => x - y);
  const res = [], cur = [];
  const backtrack = (start) => {
    res.push([...cur]);
    for (let i = start; i < a.length; i++) {
      if (i > start && a[i] === a[i - 1]) continue;
      cur.push(a[i]);
      backtrack(i + 1);
      cur.pop();
    }
  };
  backtrack(0);
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 2]], expect: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { args: [[0]], expect: [[], [0]] },
      { args: [[4, 4, 4, 1, 4]], expect: [[], [1], [1, 4], [1, 4, 4], [1, 4, 4, 4], [1, 4, 4, 4, 4], [4], [4, 4], [4, 4, 4], [4, 4, 4, 4]] },
      { args: [[2, 1, 2]], expect: [[], [1], [1, 2], [1, 2, 2], [2], [2, 2]] },
      { args: [[1, 1]], expect: [[], [1], [1, 1]] },
      { args: [[3, 2, 1]], expect: [[], [1], [1, 2], [1, 2, 3], [1, 3], [2], [2, 3], [3]] },
    ],
  },
  {
    id: 'rb-palindrome-partitioning',
    title: 'Palindrome Partitioning',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Google', 'Samsung'],
    statement: "Given a string `s`, split it into pieces so that **every piece is a palindrome**, and return all such partitions. Each partition is a list of the pieces in order. Return the partitions sorted lexicographically (compare piece by piece as strings).",
    examples: [
      { input: 's = "aab"', output: '[["a", "a", "b"], ["aa", "b"]]' },
      { input: 's = "abba"', output: '[["a", "b", "b", "a"], ["a", "bb", "a"], ["abba"]]' },
    ],
    constraints: ['1 <= s.length <= 12', 's contains lowercase English letters'],
    hints: ['Choose the first piece, check that it is a palindrome, then partition the rest recursively.', 'Trying shorter first pieces before longer ones produces lexicographic order.'],
    approach: "Write `backtrack(start)` that partitions the suffix beginning at `start`. For every end position `end` from `start + 1` to `n`, if `s[start:end]` is a palindrome, append it to the current partition, recurse on `end` and remove it afterwards. When `start` reaches `n`, record a copy of the current partition. A shorter first piece is a prefix of a longer one, so it compares smaller; trying ends in increasing order therefore yields sorted output. Palindrome checks can be precomputed in an n x n table to make each check O(1). The number of partitions can be 2^(n-1), so exponential time is unavoidable in the worst case.",
    complexity: 'Time O(n * 2^n), Space O(n) besides the output',
    fn: { py: 'partition', js: 'partition' },
    py: {
      starter: 'def partition(s):\n    # write your code here\n    pass\n',
      solution: `def partition(s):
    n = len(s)
    pal = [[False] * n for _ in range(n)]
    for i in range(n - 1, -1, -1):
        for j in range(i, n):
            pal[i][j] = s[i] == s[j] and (j - i < 2 or pal[i + 1][j - 1])
    res, cur = [], []

    def backtrack(start):
        if start == n:
            res.append(cur[:])
            return
        for end in range(start, n):
            if pal[start][end]:
                cur.append(s[start:end + 1])
                backtrack(end + 1)
                cur.pop()

    backtrack(0)
    return res
`,
    },
    js: {
      starter: 'function partition(s) {\n  // write your code here\n}\n',
      solution: `function partition(s) {
  const n = s.length;
  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = i; j < n; j++) {
      pal[i][j] = s[i] === s[j] && (j - i < 2 || pal[i + 1][j - 1]);
    }
  }
  const res = [], cur = [];
  const backtrack = (start) => {
    if (start === n) { res.push([...cur]); return; }
    for (let end = start; end < n; end++) {
      if (!pal[start][end]) continue;
      cur.push(s.slice(start, end + 1));
      backtrack(end + 1);
      cur.pop();
    }
  };
  backtrack(0);
  return res;
}
`,
    },
    tests: [
      { args: ['aab'], expect: [['a', 'a', 'b'], ['aa', 'b']] },
      { args: ['a'], expect: [['a']] },
      { args: ['aba'], expect: [['a', 'b', 'a'], ['aba']] },
      { args: ['abc'], expect: [['a', 'b', 'c']] },
      { args: ['aaa'], expect: [['a', 'a', 'a'], ['a', 'aa'], ['aa', 'a'], ['aaa']] },
      { args: ['racecar'], expect: [['r', 'a', 'c', 'e', 'c', 'a', 'r'], ['r', 'a', 'cec', 'a', 'r'], ['r', 'aceca', 'r'], ['racecar']] },
      { args: ['abba'], expect: [['a', 'b', 'b', 'a'], ['a', 'bb', 'a'], ['abba']] },
    ],
  },
  {
    id: 'rb-word-search',
    title: 'Word Search in a Grid',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Cognizant'],
    statement: "Given a grid of letters `board` and a string `word`, return `true` if the word can be traced in the grid by moving between horizontally or vertically adjacent cells. The same cell cannot be used more than once in one word.",
    examples: [
      { input: 'board = [["A","B","C","E"],["S","F","C","S"],["A","D","E","E"]], word = "ABCCED"', output: 'true' },
      { input: 'same board, word = "ABCB"', output: 'false', explain: 'The second B would need to reuse a cell.' },
    ],
    constraints: ['1 <= rows, cols <= 6', '1 <= word.length <= 15', 'board and word contain English letters'],
    hints: ['Start a depth-first search from every cell that matches word[0].', 'Mark a cell as visited while it is on the current path and unmark it when you backtrack.'],
    approach: "Try every cell as a starting point. From a cell, `dfs(r, c, i)` checks that the cell is inside the grid, unvisited and equal to `word[i]`. If `i` is the last index, the word is found. Otherwise temporarily mark the cell (for example replace its letter with '#'), explore the four neighbours with `i + 1`, and restore the letter before returning. Restoring is the backtracking step that lets other paths use the cell. The search can stop as soon as any path succeeds. In the worst case each start explores up to 3^L paths (four directions minus the one we came from), giving O(R * C * 3^L).",
    complexity: 'Time O(R * C * 3^L), Space O(L) recursion depth',
    fn: { py: 'exist', js: 'exist' },
    py: {
      starter: 'def exist(board, word):\n    # write your code here\n    pass\n',
      solution: `def exist(board, word):
    rows, cols = len(board), len(board[0])

    def dfs(r, c, i):
        if r < 0 or c < 0 or r >= rows or c >= cols or board[r][c] != word[i]:
            return False
        if i == len(word) - 1:
            return True
        saved = board[r][c]
        board[r][c] = '#'
        found = (dfs(r + 1, c, i + 1) or dfs(r - 1, c, i + 1)
                 or dfs(r, c + 1, i + 1) or dfs(r, c - 1, i + 1))
        board[r][c] = saved
        return found

    return any(dfs(r, c, 0) for r in range(rows) for c in range(cols))
`,
    },
    js: {
      starter: 'function exist(board, word) {\n  // write your code here\n}\n',
      solution: `function exist(board, word) {
  const rows = board.length, cols = board[0].length;
  const dfs = (r, c, i) => {
    if (r < 0 || c < 0 || r >= rows || c >= cols || board[r][c] !== word[i]) return false;
    if (i === word.length - 1) return true;
    const saved = board[r][c];
    board[r][c] = '#';
    const found = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1);
    board[r][c] = saved;
    return found;
  };
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) if (dfs(r, c, 0)) return true;
  return false;
}
`,
    },
    tests: [
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCCED'], expect: true },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'SEE'], expect: true },
      { args: [[['A', 'B', 'C', 'E'], ['S', 'F', 'C', 'S'], ['A', 'D', 'E', 'E']], 'ABCB'], expect: false },
      { args: [[['a']], 'a'], expect: true },
      { args: [[['a', 'b'], ['c', 'd']], 'abdc'], expect: true },
      { args: [[['a', 'b'], ['c', 'd']], 'abcd'], expect: false },
      { args: [[['a', 'a']], 'aaa'], expect: false },
    ],
  },
  {
    id: 'rb-rat-in-a-maze',
    title: 'Rat in a Maze (All Paths)',
    diff: 'Medium',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Paytm'],
    statement: "A rat starts at the top-left cell `(0, 0)` of an `n x n` grid `maze` and wants to reach the bottom-right cell `(n-1, n-1)`. A cell with `1` is open and `0` is blocked. The rat moves one cell at a time: `D` (down), `L` (left), `R` (right) or `U` (up), and cannot visit a cell twice in the same path. Return every path as a string of moves, sorted lexicographically. If the start or end is blocked, or no path exists, return `[]`.",
    examples: [
      { input: 'maze = [[1,0,0,0],[1,1,0,1],[1,1,0,0],[0,1,1,1]]', output: '["DDRDRR", "DRDDRR"]' },
      { input: 'maze = [[1,1],[1,1]]', output: '["DR", "RD"]' },
    ],
    constraints: ['2 <= n <= 5', 'maze[i][j] is 0 or 1'],
    hints: ['Explore the moves in the order D, L, R, U so the paths come out already sorted.', 'Mark a cell visited before recursing and unmark it afterwards.'],
    approach: "Run a depth-first search from (0, 0) that carries the path string built so far. At each cell, if it is the destination, record the path. Otherwise try the four moves in alphabetical order D, L, R, U; a move is allowed if the next cell is inside the grid, open and not yet on the current path. Mark the cell before recursing and unmark it when returning so other paths can use it. Exploring moves in alphabetical order makes the recorded paths come out in lexicographic order. The worst case is exponential because the number of simple paths can be exponential; for n up to 5 this is fast.",
    complexity: 'Time O(3^(n^2)) worst case, Space O(n^2)',
    fn: { py: 'find_paths', js: 'findPaths' },
    py: {
      starter: 'def find_paths(maze):\n    # write your code here\n    pass\n',
      solution: `def find_paths(maze):
    n = len(maze)
    res = []
    if maze[0][0] == 0 or maze[n - 1][n - 1] == 0:
        return res
    moves = [('D', 1, 0), ('L', 0, -1), ('R', 0, 1), ('U', -1, 0)]
    seen = [[False] * n for _ in range(n)]

    def dfs(r, c, path):
        if r == n - 1 and c == n - 1:
            res.append(path)
            return
        seen[r][c] = True
        for ch, dr, dc in moves:
            nr, nc = r + dr, c + dc
            if 0 <= nr < n and 0 <= nc < n and maze[nr][nc] == 1 and not seen[nr][nc]:
                dfs(nr, nc, path + ch)
        seen[r][c] = False

    dfs(0, 0, '')
    return res
`,
    },
    js: {
      starter: 'function findPaths(maze) {\n  // write your code here\n}\n',
      solution: `function findPaths(maze) {
  const n = maze.length;
  const res = [];
  if (maze[0][0] === 0 || maze[n - 1][n - 1] === 0) return res;
  const moves = [['D', 1, 0], ['L', 0, -1], ['R', 0, 1], ['U', -1, 0]];
  const seen = Array.from({ length: n }, () => new Array(n).fill(false));
  const dfs = (r, c, path) => {
    if (r === n - 1 && c === n - 1) { res.push(path); return; }
    seen[r][c] = true;
    for (const [ch, dr, dc] of moves) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 && nc >= 0 && nr < n && nc < n && maze[nr][nc] === 1 && !seen[nr][nc]) dfs(nr, nc, path + ch);
    }
    seen[r][c] = false;
  };
  dfs(0, 0, '');
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 0, 0, 0], [1, 1, 0, 1], [1, 1, 0, 0], [0, 1, 1, 1]]], expect: ['DDRDRR', 'DRDDRR'] },
      { args: [[[1, 0], [1, 0]]], expect: [] },
      { args: [[[0, 1], [1, 1]]], expect: [] },
      { args: [[[1, 1], [1, 1]]], expect: ['DR', 'RD'] },
      { args: [[[1, 1, 1], [1, 0, 1], [1, 1, 1]]], expect: ['DDRR', 'RRDD'] },
      { args: [[[1, 1, 0], [1, 1, 1], [0, 1, 1]]], expect: ['DRDR', 'DRRD', 'RDDR', 'RDRD'] },
    ],
  },
  {
    id: 'rb-n-queens',
    title: 'N-Queens',
    diff: 'Hard',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Google', 'Microsoft', 'Samsung'],
    statement: "Place `n` queens on an `n x n` chessboard so that no two queens attack each other (no two share a row, column or diagonal). Describe a placement as a list `cols` where `cols[r]` is the column (0-based) of the queen in row `r`. Return all placements, sorted lexicographically.",
    examples: [
      { input: 'n = 4', output: '[[1, 3, 0, 2], [2, 0, 3, 1]]' },
      { input: 'n = 3', output: '[]', explain: 'No arrangement works.' },
    ],
    constraints: ['1 <= n <= 9'],
    hints: ['Place exactly one queen per row, top to bottom.', 'Keep sets of used columns, used r - c diagonals and used r + c anti-diagonals for O(1) checks.'],
    approach: "Each row holds exactly one queen, so place them row by row. For row `r`, try every column `c` in increasing order. A position is safe if column `c`, diagonal `r - c` and anti-diagonal `r + c` are all unused; keep three sets (or boolean arrays) for this. If safe, record the column, mark the three sets, recurse to row `r + 1`, then unmark them (backtrack). When `r` reaches `n`, a full placement has been found; record a copy. Trying columns in increasing order at every row produces placements in lexicographic order. The search space is pruned heavily compared to trying all n^n assignments.",
    complexity: 'Time O(n!), Space O(n)',
    fn: { py: 'solve_n_queens', js: 'solveNQueens' },
    py: {
      starter: 'def solve_n_queens(n):\n    # write your code here\n    pass\n',
      solution: `def solve_n_queens(n):
    res, cols = [], []
    used_c, used_d, used_a = set(), set(), set()

    def place(r):
        if r == n:
            res.append(cols[:])
            return
        for c in range(n):
            if c in used_c or (r - c) in used_d or (r + c) in used_a:
                continue
            cols.append(c)
            used_c.add(c)
            used_d.add(r - c)
            used_a.add(r + c)
            place(r + 1)
            cols.pop()
            used_c.discard(c)
            used_d.discard(r - c)
            used_a.discard(r + c)

    place(0)
    return res
`,
    },
    js: {
      starter: 'function solveNQueens(n) {\n  // write your code here\n}\n',
      solution: `function solveNQueens(n) {
  const res = [], cols = [];
  const usedC = new Set(), usedD = new Set(), usedA = new Set();
  const place = (r) => {
    if (r === n) { res.push([...cols]); return; }
    for (let c = 0; c < n; c++) {
      if (usedC.has(c) || usedD.has(r - c) || usedA.has(r + c)) continue;
      cols.push(c); usedC.add(c); usedD.add(r - c); usedA.add(r + c);
      place(r + 1);
      cols.pop(); usedC.delete(c); usedD.delete(r - c); usedA.delete(r + c);
    }
  };
  place(0);
  return res;
}
`,
    },
    tests: [
      { args: [1], expect: [[0]] },
      { args: [2], expect: [] },
      { args: [3], expect: [] },
      { args: [4], expect: [[1, 3, 0, 2], [2, 0, 3, 1]] },
      { args: [5], expect: [[0, 2, 4, 1, 3], [0, 3, 1, 4, 2], [1, 3, 0, 2, 4], [1, 4, 2, 0, 3], [2, 0, 3, 1, 4], [2, 4, 1, 3, 0], [3, 0, 2, 4, 1], [3, 1, 4, 2, 0], [4, 1, 3, 0, 2], [4, 2, 0, 3, 1]] },
      { args: [6], expect: [[1, 3, 5, 0, 2, 4], [2, 5, 1, 4, 0, 3], [3, 0, 4, 1, 5, 2], [4, 2, 0, 5, 3, 1]] },
    ],
  },
  {
    id: 'rb-sudoku-solver',
    title: 'Sudoku Solver',
    diff: 'Hard',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Microsoft', 'Uber', 'Zoho'],
    statement: "Solve a 9 x 9 Sudoku. The board is given as a list of 9 strings of 9 characters, where digits are given cells and `.` is an empty cell. Fill the empty cells so that every row, every column and every 3 x 3 box contains each digit 1 to 9 exactly once. Every test puzzle has exactly one solution. Return the solved board in the same format.",
    examples: [
      { input: 'board = ["53..7....", "6..195...", ".98....6.", "8...6...3", "4..8.3..1", "7...2...6", ".6....28.", "...419..5", "....8..79"]', output: '["534678912", "672195348", "198342567", "859761423", "426853791", "713924856", "961537284", "287419635", "345286179"]' },
      { input: 'board = ["3.4.9....", "12.....3.", ".86543.12", "6..3.....", ".32.8..6.", "91.75..43", ".976.5...", "..3...789", ".419.8356"]', output: '["354291678", "129867435", "786543912", "675324891", "432189567", "918756243", "897635124", "563412789", "241978356"]', explain: 'Each "." is replaced by the only digit that keeps all rows, columns and boxes valid.' },
    ],
    constraints: ['board has 9 strings of length 9', 'Each character is a digit 1-9 or "."', 'The puzzle has exactly one solution'],
    hints: ['Keep, for every row, column and box, the set of digits already used.', 'Find an empty cell, try each digit that is still allowed, recurse, and undo the choice if the recursion fails.'],
    approach: "Convert the board to a grid of characters and record which digits each row, column and 3 x 3 box already contains (box index is `(r // 3) * 3 + c // 3`). Collect the empty cells. Recursively fill them one by one: for the next empty cell, try every digit not present in its row, column or box; place it, update the three sets and recurse. If the recursion fails, remove the digit and try the next one; if no digit fits, return failure so the caller backtracks. When every empty cell is filled the board is solved. A useful speed-up is to always fill the empty cell with the fewest allowed digits first. Trying all 9^k fillings without pruning is hopeless.",
    complexity: 'Time O(9^k) worst case for k empty cells (fast in practice due to pruning), Space O(81)',
    fn: { py: 'solve_sudoku', js: 'solveSudoku' },
    py: {
      starter: 'def solve_sudoku(board):\n    # write your code here\n    pass\n',
      solution: `def solve_sudoku(board):
    g = [list(row) for row in board]
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    empty = []
    for r in range(9):
        for c in range(9):
            ch = g[r][c]
            if ch == '.':
                empty.append((r, c))
            else:
                rows[r].add(ch)
                cols[c].add(ch)
                boxes[(r // 3) * 3 + c // 3].add(ch)

    def solve():
        if not empty:
            return True
        best = None
        best_opts = None
        for idx, (r, c) in enumerate(empty):
            b = (r // 3) * 3 + c // 3
            opts = [d for d in '123456789' if d not in rows[r] and d not in cols[c] and d not in boxes[b]]
            if best_opts is None or len(opts) < len(best_opts):
                best, best_opts = idx, opts
                if len(opts) <= 1:
                    break
        r, c = empty.pop(best)
        b = (r // 3) * 3 + c // 3
        for d in best_opts:
            g[r][c] = d
            rows[r].add(d)
            cols[c].add(d)
            boxes[b].add(d)
            if solve():
                return True
            rows[r].discard(d)
            cols[c].discard(d)
            boxes[b].discard(d)
        g[r][c] = '.'
        empty.insert(best, (r, c))
        return False

    solve()
    return [''.join(row) for row in g]
`,
    },
    js: {
      starter: 'function solveSudoku(board) {\n  // write your code here\n}\n',
      solution: `function solveSudoku(board) {
  const g = board.map((row) => row.split(''));
  const rows = Array.from({ length: 9 }, () => new Set());
  const cols = Array.from({ length: 9 }, () => new Set());
  const boxes = Array.from({ length: 9 }, () => new Set());
  const empty = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const ch = g[r][c];
      if (ch === '.') empty.push([r, c]);
      else { rows[r].add(ch); cols[c].add(ch); boxes[Math.floor(r / 3) * 3 + Math.floor(c / 3)].add(ch); }
    }
  }
  const solve = () => {
    if (empty.length === 0) return true;
    let best = -1, bestOpts = null;
    for (let i = 0; i < empty.length; i++) {
      const [r, c] = empty[i];
      const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      const opts = [];
      for (const d of '123456789') if (!rows[r].has(d) && !cols[c].has(d) && !boxes[b].has(d)) opts.push(d);
      if (bestOpts === null || opts.length < bestOpts.length) {
        best = i; bestOpts = opts;
        if (opts.length <= 1) break;
      }
    }
    const [r, c] = empty.splice(best, 1)[0];
    const b = Math.floor(r / 3) * 3 + Math.floor(c / 3);
    for (const d of bestOpts) {
      g[r][c] = d; rows[r].add(d); cols[c].add(d); boxes[b].add(d);
      if (solve()) return true;
      rows[r].delete(d); cols[c].delete(d); boxes[b].delete(d);
    }
    g[r][c] = '.';
    empty.splice(best, 0, [r, c]);
    return false;
  };
  solve();
  return g.map((row) => row.join(''));
}
`,
    },
    tests: [
      { args: [['53..7....', '6..195...', '.98....6.', '8...6...3', '4..8.3..1', '7...2...6', '.6....28.', '...419..5', '....8..79']], expect: ['534678912', '672195348', '198342567', '859761423', '426853791', '713924856', '961537284', '287419635', '345286179'] },
      { args: [['5.4......', '...1..8..', '68...2.54', '.45.36...', '.2....7.6', '.......85', '2.3.4....', '491...62.', '75...39..']], expect: ['514867392', '932154867', '687392154', '845736219', '129485736', '376219485', '263941578', '491578623', '758623941'] },
      { args: [['......3..', '65......7', '..2.74...', '..5.38...', '......6..', '86...24.5', '...241..6', '576.9..14', '12...5839']], expect: ['417586392', '658329147', '932174568', '745638921', '291457683', '863912475', '389241756', '576893214', '124765839'] },
      { args: [['.2..7.8..', '.1.9.8..3', '..53.....', '7.....62.', '462...385', '.38.26.17', '1598.....', '84.2.7...', '27...5.3.']], expect: ['324671859', '617958243', '985342176', '791583624', '462719385', '538426917', '159834762', '843267591', '276195438'] },
      { args: [['5.4......', '986..2.5.', '.2..4.8..', '.7..3...5', '1658.....', '......78.', '73....9.1', '.526...7.', '.......4.']], expect: ['514968237', '986372154', '327541896', '879234615', '165897423', '243156789', '738425961', '452619378', '691783542'] },
      { args: [['3.4.9....', '12.....3.', '.86543.12', '6..3.....', '.32.8..6.', '91.75..43', '.976.5...', '..3...789', '.419.8356']], expect: ['354291678', '129867435', '786543912', '675324891', '432189567', '918756243', '897635124', '563412789', '241978356'] },
      { args: [['...6.9..4', '..25..8..', '......96.', '...28....', '..8...7.1', '45.......', '.3......6', '.27.6..1.', '.4.1.328.']], expect: ['783629154', '692541873', '514738962', '371286549', '268495731', '459317628', '135872496', '827964315', '946153287'] },
    ],
  },
  {
    id: 'rb-word-break-ii',
    title: 'Word Break II (All Sentences)',
    diff: 'Hard',
    pattern: 'Recursion & Backtracking',
    companies: ['Amazon', 'Google', 'Uber', 'Snapchat'],
    statement: "Given a string `s` with no spaces and a list of dictionary words `wordDict`, insert spaces into `s` to form sentences in which every word is in the dictionary. A dictionary word may be used many times. Return all possible sentences, sorted lexicographically. If none exist, return `[]`.",
    examples: [
      { input: 's = "catsanddog", wordDict = ["cat", "cats", "and", "sand", "dog"]', output: '["cat sand dog", "cats and dog"]' },
      { input: 's = "catsandog", wordDict = ["cats", "dog", "sand", "and", "cat"]', output: '[]' },
    ],
    constraints: ['1 <= s.length <= 20', '1 <= wordDict.length <= 1000', 'Words are distinct and contain lowercase letters'],
    hints: ['Try every dictionary word that is a prefix of the remaining string, then recurse on the rest.', 'Memoise the list of sentences for each starting index so shared suffixes are solved once.'],
    approach: "Define `sentences(i)` as the list of all ways to split the suffix `s[i:]`. For the base case `i == n` the only way is the empty sentence. Otherwise, for each end `j > i` where `s[i:j]` is in the dictionary (use a set for O(1) lookup), combine that word with every sentence in `sentences(j)`. Memoise `sentences(i)` so a suffix that is reached in several ways is solved once; suffixes that cannot be split return an empty list quickly. Sort the final list to get the required order. The output itself can be exponential in n, so no algorithm can beat that in the worst case, but memoisation removes repeated work on failing suffixes.",
    complexity: 'Time O(n^2 + total output size) with memoisation, Space O(total output size)',
    fn: { py: 'word_break', js: 'wordBreak' },
    py: {
      starter: 'def word_break(s, wordDict):\n    # write your code here\n    pass\n',
      solution: `def word_break(s, wordDict):
    words = set(wordDict)
    n = len(s)
    memo = {}

    def sentences(i):
        if i == n:
            return ['']
        if i in memo:
            return memo[i]
        out = []
        for j in range(i + 1, n + 1):
            w = s[i:j]
            if w in words:
                for rest in sentences(j):
                    out.append(w if not rest else w + ' ' + rest)
        memo[i] = out
        return out

    return sorted(sentences(0))
`,
    },
    js: {
      starter: 'function wordBreak(s, wordDict) {\n  // write your code here\n}\n',
      solution: `function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const n = s.length;
  const memo = new Map();
  const sentences = (i) => {
    if (i === n) return [''];
    if (memo.has(i)) return memo.get(i);
    const out = [];
    for (let j = i + 1; j <= n; j++) {
      const w = s.slice(i, j);
      if (!words.has(w)) continue;
      for (const rest of sentences(j)) out.push(rest ? w + ' ' + rest : w);
    }
    memo.set(i, out);
    return out;
  };
  return [...sentences(0)].sort();
}
`,
    },
    tests: [
      { args: ['catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']], expect: ['cat sand dog', 'cats and dog'] },
      { args: ['pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']], expect: ['pine apple pen apple', 'pine applepen apple', 'pineapple pen apple'] },
      { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expect: [] },
      { args: ['a', ['a']], expect: ['a'] },
      { args: ['aaaa', ['a', 'aa']], expect: ['a a a a', 'a a aa', 'a aa a', 'aa a a', 'aa aa'] },
      { args: ['ab', ['a', 'b', 'ab']], expect: ['a b', 'ab'] },
      { args: ['ilikesamsung', ['i', 'like', 'sam', 'sung', 'samsung', 'mobile']], expect: ['i like sam sung', 'i like samsung'] },
    ],
  },
];
