export default [
  {
    id: 'dp-climbing-stairs',
    title: 'Climbing Stairs',
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'TCS', 'Infosys', 'Adobe'],
    statement: 'A staircase has `n` steps. In one move you can climb either **1** or **2** steps. Return the number of distinct ways to reach the top (step `n`) starting from the ground.',
    examples: [
      { input: 'n = 3', output: '3', explain: '1+1+1, 1+2 and 2+1.' },
      { input: 'n = 4', output: '5', explain: '1+1+1+1, 1+1+2, 1+2+1, 2+1+1, 2+2.' },
    ],
    constraints: ['1 <= n <= 45'],
    hints: ['To stand on step i, your last move came from step i-1 or step i-2.', 'ways(i) = ways(i-1) + ways(i-2). You only need the last two values.'],
    approach: 'The last move to step i is either a 1-step from i-1 or a 2-step from i-2, so ways(i) = ways(i-1) + ways(i-2). This is the Fibonacci recurrence with ways(1) = 1 and ways(2) = 2. Walk from 3 up to n keeping only the previous two counts in two variables. The brute force tries every sequence of moves recursively, which branches twice at every step and takes O(2^n) time. Memoising or iterating removes the repeated work.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'climb_stairs', js: 'climbStairs' },
    py: {
      starter: 'def climb_stairs(n):\n    # write your code here\n    pass\n',
      solution: `def climb_stairs(n):
    a, b = 1, 1
    for _ in range(n - 1):
        a, b = b, a + b
    return b
`,
    },
    js: {
      starter: 'function climbStairs(n) {\n  // write your code here\n}\n',
      solution: `function climbStairs(n) {
  let a = 1, b = 1;
  for (let i = 1; i < n; i++) {
    const c = a + b;
    a = b;
    b = c;
  }
  return b;
}
`,
    },
    tests: [
      { args: [1], expect: 1 },
      { args: [2], expect: 2 },
      { args: [3], expect: 3 },
      { args: [4], expect: 5 },
      { args: [5], expect: 8 },
      { args: [10], expect: 89 },
      { args: [20], expect: 10946 },
      { args: [45], expect: 1836311903 },
    ],
  },
  {
    id: 'dp-house-robber',
    title: 'House Robber',
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Flipkart', 'Microsoft'],
    statement: 'Houses along a street hold `nums[i]` rupees each. You may take money from any set of houses as long as you never take from **two adjacent houses**. Return the largest total you can collect.',
    examples: [
      { input: 'nums = [2, 7, 9, 3, 1]', output: '12', explain: 'Take houses 0, 2 and 4: 2 + 9 + 1 = 12.' },
      { input: 'nums = [2, 1, 1, 2]', output: '4', explain: 'Take the first and the last house.' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 400'],
    hints: ['At each house you either take it (and skip the previous) or skip it.', 'best(i) = max(best(i-1), best(i-2) + nums[i]).'],
    approach: 'Scan the houses from left to right and keep two numbers: the best total up to the previous house and the best total up to the house before that. For the current house you either skip it, keeping the previous best, or take it and add its value to the best from two houses back. The larger of the two becomes the new best. Only two variables are needed. The brute force tries every valid subset of houses, which is exponential.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'rob', js: 'rob' },
    py: {
      starter: 'def rob(nums):\n    # write your code here\n    pass\n',
      solution: `def rob(nums):
    prev2, prev1 = 0, 0
    for x in nums:
        prev2, prev1 = prev1, max(prev1, prev2 + x)
    return prev1
`,
    },
    js: {
      starter: 'function rob(nums) {\n  // write your code here\n}\n',
      solution: `function rob(nums) {
  let prev2 = 0, prev1 = 0;
  for (const x of nums) {
    const cur = Math.max(prev1, prev2 + x);
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 1]], expect: 4 },
      { args: [[2, 7, 9, 3, 1]], expect: 12 },
      { args: [[5]], expect: 5 },
      { args: [[2, 1, 1, 2]], expect: 4 },
      { args: [[0, 0]], expect: 0 },
      { args: [[10, 1, 1, 10]], expect: 20 },
      { args: [[1, 3, 1, 3, 100]], expect: 103 },
    ],
  },
  {
    id: 'dp-min-cost-stairs',
    title: 'Min Cost Climbing Stairs',
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Infosys', 'Wipro'],
    statement: 'Each step `i` of a staircase has a cost `cost[i]` that you pay when you stand on it. After paying you may climb 1 or 2 steps. You may start on step 0 or step 1. Return the minimum total cost to go past the last step (the top).',
    examples: [
      { input: 'cost = [10, 15, 20]', output: '15', explain: 'Start on step 1, pay 15, jump 2 steps to the top.' },
      { input: 'cost = [3, 2, 10, 1]', output: '3', explain: 'Step 1 (2) then step 3 (1), then the top.' },
    ],
    constraints: ['2 <= cost.length <= 1000', '0 <= cost[i] <= 999'],
    hints: ['Let dp[i] be the cheapest cost to stand on step i, including its own cost.', 'dp[i] = cost[i] + min(dp[i-1], dp[i-2]); the answer is min of the last two.'],
    approach: 'Define dp[i] as the minimum cost to land on step i and pay for it. You reach step i from i-1 or i-2, so dp[i] = cost[i] + min(dp[i-1], dp[i-2]), with dp[0] = cost[0] and dp[1] = cost[1]. The top can be reached from either of the last two steps, so the answer is the smaller of those two values. Keeping just two rolling values gives constant space. Trying every path recursively without memory would be exponential.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'min_cost_climbing_stairs', js: 'minCostClimbingStairs' },
    py: {
      starter: 'def min_cost_climbing_stairs(cost):\n    # write your code here\n    pass\n',
      solution: `def min_cost_climbing_stairs(cost):
    a, b = cost[0], cost[1]
    for i in range(2, len(cost)):
        a, b = b, cost[i] + min(a, b)
    return min(a, b)
`,
    },
    js: {
      starter: 'function minCostClimbingStairs(cost) {\n  // write your code here\n}\n',
      solution: `function minCostClimbingStairs(cost) {
  let a = cost[0], b = cost[1];
  for (let i = 2; i < cost.length; i++) {
    const c = cost[i] + Math.min(a, b);
    a = b;
    b = c;
  }
  return Math.min(a, b);
}
`,
    },
    tests: [
      { args: [[10, 15, 20]], expect: 15 },
      { args: [[1, 100, 1, 1, 1, 100, 1, 1, 100, 1]], expect: 6 },
      { args: [[0, 0]], expect: 0 },
      { args: [[5, 10]], expect: 5 },
      { args: [[1, 2, 3]], expect: 2 },
      { args: [[3, 2, 10, 1]], expect: 3 },
    ],
  },
  {
    id: 'dp-tribonacci',
    title: 'N-th Tribonacci Number',
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['TCS', 'Infosys', 'Cognizant'],
    statement: 'The Tribonacci sequence is defined as T0 = 0, T1 = 1, T2 = 1 and T(n) = T(n-1) + T(n-2) + T(n-3) for n >= 3. Given `n`, return T(n).',
    examples: [
      { input: 'n = 4', output: '4', explain: '0, 1, 1, 2, 4' },
      { input: 'n = 7', output: '24' },
    ],
    constraints: ['0 <= n <= 37'],
    hints: ['Plain recursion recomputes the same values many times.', 'Keep the last three values and slide forward.'],
    approach: 'Start with the three base values 0, 1 and 1. For every index from 3 to n compute the next value as the sum of the three kept values, then shift the window by one. After the loop the newest value is the answer. Small n (0, 1, 2) are returned directly. The naive recursive version calls itself three times per level, giving roughly O(3^n) work.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'tribonacci', js: 'tribonacci' },
    py: {
      starter: 'def tribonacci(n):\n    # write your code here\n    pass\n',
      solution: `def tribonacci(n):
    if n == 0:
        return 0
    a, b, c = 0, 1, 1
    for _ in range(n - 2):
        a, b, c = b, c, a + b + c
    return c
`,
    },
    js: {
      starter: 'function tribonacci(n) {\n  // write your code here\n}\n',
      solution: `function tribonacci(n) {
  if (n === 0) return 0;
  let a = 0, b = 1, c = 1;
  for (let i = 3; i <= n; i++) {
    const d = a + b + c;
    a = b;
    b = c;
    c = d;
  }
  return c;
}
`,
    },
    tests: [
      { args: [0], expect: 0 },
      { args: [1], expect: 1 },
      { args: [2], expect: 1 },
      { args: [3], expect: 2 },
      { args: [4], expect: 4 },
      { args: [7], expect: 24 },
      { args: [10], expect: 149 },
      { args: [25], expect: 1389537 },
    ],
  },
  {
    id: 'dp-max-subarray',
    title: 'Maximum Subarray Sum (Kadane)',
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'TCS Digital', 'Infosys'],
    statement: 'Given an integer array `nums`, find the contiguous non-empty subarray with the largest sum and return that sum.',
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explain: '[4, -1, 2, 1] sums to 6.' },
      { input: 'nums = [-3, -1, -2]', output: '-1', explain: 'All numbers are negative, so pick the largest single one.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['What is the best subarray that must END at index i?', 'It either extends the best one ending at i-1 or starts fresh at i.'],
    approach: 'Let cur be the best sum of a subarray that ends exactly at the current index. For each new number x, cur becomes max(x, cur + x): either extend the previous run or start a new one at x. Track the largest cur seen anywhere as the answer. Initialising both with nums[0] handles arrays that are entirely negative. The brute force sums every pair (i, j) in O(n^2), which is too slow for 10^5 elements.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'max_subarray', js: 'maxSubarray' },
    py: {
      starter: 'def max_subarray(nums):\n    # write your code here\n    pass\n',
      solution: `def max_subarray(nums):
    cur = best = nums[0]
    for x in nums[1:]:
        cur = max(x, cur + x)
        best = max(best, cur)
    return best
`,
    },
    js: {
      starter: 'function maxSubarray(nums) {\n  // write your code here\n}\n',
      solution: `function maxSubarray(nums) {
  let cur = nums[0], best = nums[0];
  for (let i = 1; i < nums.length; i++) {
    cur = Math.max(nums[i], cur + nums[i]);
    best = Math.max(best, cur);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expect: 6 },
      { args: [[1]], expect: 1 },
      { args: [[5, 4, -1, 7, 8]], expect: 23 },
      { args: [[-3, -1, -2]], expect: -1 },
      { args: [[0, -1]], expect: 0 },
      { args: [[2, -1, 2]], expect: 3 },
      { args: [[-2, -3, 4, -1, -2, 1, 5, -3]], expect: 7 },
    ],
  },
  {
    id: 'dp-pascal-row',
    title: "Pascal's Triangle Row",
    diff: 'Easy',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Accenture', 'Infosys'],
    statement: "Return row number `rowIndex` (0-indexed) of Pascal's triangle as a list. Each value is the sum of the two values directly above it, and every row starts and ends with 1.",
    examples: [
      { input: 'rowIndex = 3', output: '[1, 3, 3, 1]' },
      { input: 'rowIndex = 0', output: '[1]' },
    ],
    constraints: ['0 <= rowIndex <= 33', 'Try to use only O(rowIndex) extra space.'],
    hints: ['Build each row from the previous one.', 'If you update a single array from right to left, you never overwrite a value you still need.'],
    approach: 'Keep one array that starts as [1]. To move to the next row, append a 1 and then, walking from the right end towards index 1, set row[j] = row[j] + row[j-1]. Going right to left means row[j-1] still holds the old value when it is used. Repeat rowIndex times. Building the full triangle also works but stores O(n^2) numbers.',
    complexity: 'Time O(n^2), Space O(n)',
    fn: { py: 'get_row', js: 'getRow' },
    py: {
      starter: 'def get_row(row_index):\n    # write your code here\n    pass\n',
      solution: `def get_row(row_index):
    row = [1]
    for _ in range(row_index):
        row.append(1)
        for j in range(len(row) - 2, 0, -1):
            row[j] += row[j - 1]
    return row
`,
    },
    js: {
      starter: 'function getRow(rowIndex) {\n  // write your code here\n}\n',
      solution: `function getRow(rowIndex) {
  const row = [1];
  for (let i = 0; i < rowIndex; i++) {
    row.push(1);
    for (let j = row.length - 2; j > 0; j--) row[j] += row[j - 1];
  }
  return row;
}
`,
    },
    tests: [
      { args: [0], expect: [1] },
      { args: [1], expect: [1, 1] },
      { args: [2], expect: [1, 2, 1] },
      { args: [3], expect: [1, 3, 3, 1] },
      { args: [4], expect: [1, 4, 6, 4, 1] },
      { args: [5], expect: [1, 5, 10, 10, 5, 1] },
      { args: [6], expect: [1, 6, 15, 20, 15, 6, 1] },
    ],
  },
  {
    id: 'dp-coin-change-min',
    title: 'Coin Change (Fewest Coins)',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Paytm'],
    statement: 'You have unlimited coins of each denomination in `coins`. Return the fewest coins needed to make exactly `amount`. If it cannot be made, return `-1`. An amount of 0 needs 0 coins.',
    examples: [
      { input: 'coins = [1, 2, 5], amount = 11', output: '3', explain: '5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
    ],
    constraints: ['1 <= coins.length <= 12', '1 <= coins[i] <= 2^31 - 1', '0 <= amount <= 10^4'],
    hints: ['Greedy (largest coin first) fails for coins like [1, 3, 4] and amount 6.', 'dp[a] = 1 + min(dp[a - c]) over all coins c <= a.'],
    approach: 'Build an array dp of size amount + 1 where dp[a] is the fewest coins for amount a, starting with dp[0] = 0 and everything else infinity. For every amount from 1 upwards, try each coin c that fits and set dp[a] = min(dp[a], dp[a - c] + 1). Because every smaller amount is already solved, each value is final when you reach it. At the end return dp[amount], or -1 if it is still infinity. Greedy is wrong in general and plain recursion over all coin combinations is exponential.',
    complexity: 'Time O(amount * coins), Space O(amount)',
    fn: { py: 'coin_change', js: 'coinChange' },
    py: {
      starter: 'def coin_change(coins, amount):\n    # write your code here\n    pass\n',
      solution: `def coin_change(coins, amount):
    INF = amount + 1
    dp = [0] + [INF] * amount
    for a in range(1, amount + 1):
        for c in coins:
            if c <= a and dp[a - c] + 1 < dp[a]:
                dp[a] = dp[a - c] + 1
    return dp[amount] if dp[amount] <= amount else -1
`,
    },
    js: {
      starter: 'function coinChange(coins, amount) {\n  // write your code here\n}\n',
      solution: `function coinChange(coins, amount) {
  const INF = amount + 1;
  const dp = new Array(amount + 1).fill(INF);
  dp[0] = 0;
  for (let a = 1; a <= amount; a++) {
    for (const c of coins) {
      if (c <= a && dp[a - c] + 1 < dp[a]) dp[a] = dp[a - c] + 1;
    }
  }
  return dp[amount] <= amount ? dp[amount] : -1;
}
`,
    },
    tests: [
      { args: [[1, 2, 5], 11], expect: 3 },
      { args: [[2], 3], expect: -1 },
      { args: [[1], 0], expect: 0 },
      { args: [[1, 3, 4], 6], expect: 2 },
      { args: [[2, 5, 10, 1], 27], expect: 4 },
      { args: [[186, 419, 83, 408], 6249], expect: 20 },
      { args: [[3, 7], 5], expect: -1 },
    ],
  },
  {
    id: 'dp-coin-change-ways',
    title: 'Coin Change (Number of Ways)',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Walmart', 'TCS Digital'],
    statement: 'Given an `amount` and a list of distinct coin values `coins` (each available unlimited times), return the number of **combinations** that add up to `amount`. Order does not matter: 1+2 and 2+1 are the same combination.',
    examples: [
      { input: 'amount = 5, coins = [1, 2, 5]', output: '4', explain: '5, 2+2+1, 2+1+1+1, 1+1+1+1+1' },
      { input: 'amount = 3, coins = [2]', output: '0' },
    ],
    constraints: ['0 <= amount <= 5000', '1 <= coins.length <= 300', 'The answer fits in a 32-bit integer.'],
    hints: ['To avoid counting orders twice, process one coin type at a time.', 'For each coin c: ways[a] += ways[a - c] for a from c to amount.'],
    approach: 'Let ways[a] be the number of combinations that make amount a using the coins processed so far, with ways[0] = 1. Loop over the coins in the outer loop and amounts in the inner loop, adding ways[a - c] into ways[a]. Putting coins in the outer loop means each combination is built in a fixed coin order, so permutations are not double counted. Swapping the loops would count ordered sequences instead. The brute force enumerates every multiset of coins and is exponential.',
    complexity: 'Time O(amount * coins), Space O(amount)',
    fn: { py: 'change', js: 'change' },
    py: {
      starter: 'def change(amount, coins):\n    # write your code here\n    pass\n',
      solution: `def change(amount, coins):
    ways = [1] + [0] * amount
    for c in coins:
        for a in range(c, amount + 1):
            ways[a] += ways[a - c]
    return ways[amount]
`,
    },
    js: {
      starter: 'function change(amount, coins) {\n  // write your code here\n}\n',
      solution: `function change(amount, coins) {
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1;
  for (const c of coins) {
    for (let a = c; a <= amount; a++) ways[a] += ways[a - c];
  }
  return ways[amount];
}
`,
    },
    tests: [
      { args: [5, [1, 2, 5]], expect: 4 },
      { args: [3, [2]], expect: 0 },
      { args: [10, [10]], expect: 1 },
      { args: [0, [1, 2]], expect: 1 },
      { args: [4, [1, 2, 3]], expect: 4 },
      { args: [10, [2, 5, 3, 6]], expect: 5 },
    ],
  },
  {
    id: 'dp-longest-increasing-subsequence',
    title: 'Longest Increasing Subsequence',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: 'Given an integer array `nums`, return the length of the longest **strictly increasing** subsequence. A subsequence keeps the original order but may skip elements.',
    examples: [
      { input: 'nums = [10, 9, 2, 5, 3, 7, 101, 18]', output: '4', explain: 'One answer is [2, 3, 7, 18].' },
      { input: 'nums = [7, 7, 7, 7]', output: '1' },
    ],
    constraints: ['1 <= nums.length <= 2500', '-10^4 <= nums[i] <= 10^4'],
    hints: ['O(n^2): dp[i] = 1 + max dp[j] for j < i with nums[j] < nums[i].', 'O(n log n): keep tails[k] = smallest possible tail of an increasing subsequence of length k+1, and binary search.'],
    approach: 'Maintain an array tails where tails[k] is the smallest value that can end an increasing subsequence of length k + 1. For each number, binary search for the first tail that is >= it. If none exists, append the number (we extended the longest subsequence); otherwise replace that tail with the number, which keeps future options as open as possible. The length of tails at the end is the answer. The simpler O(n^2) DP checks every earlier index for every position, and the brute force over all subsequences is O(2^n).',
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'length_of_lis', js: 'lengthOfLIS' },
    py: {
      starter: 'def length_of_lis(nums):\n    # write your code here\n    pass\n',
      solution: `from bisect import bisect_left

def length_of_lis(nums):
    tails = []
    for x in nums:
        i = bisect_left(tails, x)
        if i == len(tails):
            tails.append(x)
        else:
            tails[i] = x
    return len(tails)
`,
    },
    js: {
      starter: 'function lengthOfLIS(nums) {\n  // write your code here\n}\n',
      solution: `function lengthOfLIS(nums) {
  const tails = [];
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (tails[mid] < x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x;
  }
  return tails.length;
}
`,
    },
    tests: [
      { args: [[10, 9, 2, 5, 3, 7, 101, 18]], expect: 4 },
      { args: [[0, 1, 0, 3, 2, 3]], expect: 4 },
      { args: [[7, 7, 7, 7]], expect: 1 },
      { args: [[5]], expect: 1 },
      { args: [[1, 2, 3, 4, 5]], expect: 5 },
      { args: [[5, 4, 3, 2, 1]], expect: 1 },
      { args: [[3, 10, 2, 1, 20]], expect: 3 },
      { args: [[50, 3, 10, 7, 40, 80]], expect: 4 },
    ],
  },
  {
    id: 'dp-longest-common-subsequence',
    title: 'Longest Common Subsequence',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'TCS Digital', 'Infosys'],
    statement: 'Given two strings `a` and `b`, return the length of their longest common subsequence: the longest sequence of characters that appears in both strings in the same relative order (not necessarily contiguous). Return 0 if there is none.',
    examples: [
      { input: 'a = "abcde", b = "ace"', output: '3', explain: '"ace" is common to both.' },
      { input: 'a = "AGGTAB", b = "GXTXAYB"', output: '4', explain: '"GTAB"' },
    ],
    constraints: ['0 <= a.length, b.length <= 1000', 'Strings contain English letters only.'],
    hints: ['Compare the last characters of the two prefixes.', 'If they match: 1 + lcs(i-1, j-1); otherwise max(lcs(i-1, j), lcs(i, j-1)).'],
    approach: 'Let dp[i][j] be the LCS length of the first i characters of a and the first j characters of b. If a[i-1] equals b[j-1], that character can end the common subsequence, so dp[i][j] = dp[i-1][j-1] + 1. Otherwise drop one character from either string and take the better result: max(dp[i-1][j], dp[i][j-1]). Row 0 and column 0 are 0 because an empty prefix has nothing in common. Only the previous row is needed, so space can be cut to O(len(b)). Enumerating all subsequences of one string is O(2^n).',
    complexity: 'Time O(n * m), Space O(m)',
    fn: { py: 'lcs', js: 'lcs' },
    py: {
      starter: 'def lcs(a, b):\n    # write your code here\n    pass\n',
      solution: `def lcs(a, b):
    m = len(b)
    prev = [0] * (m + 1)
    for ch in a:
        cur = [0] * (m + 1)
        for j in range(1, m + 1):
            if ch == b[j - 1]:
                cur[j] = prev[j - 1] + 1
            else:
                cur[j] = max(prev[j], cur[j - 1])
        prev = cur
    return prev[m]
`,
    },
    js: {
      starter: 'function lcs(a, b) {\n  // write your code here\n}\n',
      solution: `function lcs(a, b) {
  const m = b.length;
  let prev = new Array(m + 1).fill(0);
  for (const ch of a) {
    const cur = new Array(m + 1).fill(0);
    for (let j = 1; j <= m; j++) {
      cur[j] = ch === b[j - 1] ? prev[j - 1] + 1 : Math.max(prev[j], cur[j - 1]);
    }
    prev = cur;
  }
  return prev[m];
}
`,
    },
    tests: [
      { args: ['abcde', 'ace'], expect: 3 },
      { args: ['abc', 'abc'], expect: 3 },
      { args: ['abc', 'def'], expect: 0 },
      { args: ['AGGTAB', 'GXTXAYB'], expect: 4 },
      { args: ['', 'a'], expect: 0 },
      { args: ['bsbininm', 'jmjkbkjkv'], expect: 1 },
      { args: ['ABCBDAB', 'BDCABA'], expect: 4 },
    ],
  },
  {
    id: 'dp-unique-grid-paths',
    title: 'Unique Grid Paths',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Infosys SP'],
    statement: 'A robot stands at the top-left cell of an `m x n` grid and wants to reach the bottom-right cell. It can only move **right** or **down** one cell at a time. Return the number of different paths.',
    examples: [
      { input: 'm = 3, n = 2', output: '3', explain: 'RDD, DRD, DDR' },
      { input: 'm = 3, n = 3', output: '6' },
    ],
    constraints: ['1 <= m, n <= 100', 'The answer is at most 2 * 10^9.'],
    hints: ['Every cell is reached from the cell above or the cell to the left.', 'A single row array is enough: row[j] += row[j-1].'],
    approach: 'The number of paths to cell (i, j) equals paths to (i-1, j) plus paths to (i, j-1), since those are the only two ways in. The first row and first column each have exactly one path. Keep a single array for the current row: for every new row, update row[j] += row[j-1] from left to right. After processing all rows the last element is the answer. Exploring every path recursively is exponential; a combinatorial formula C(m+n-2, m-1) also works.',
    complexity: 'Time O(m * n), Space O(n)',
    fn: { py: 'unique_paths', js: 'uniquePaths' },
    py: {
      starter: 'def unique_paths(m, n):\n    # write your code here\n    pass\n',
      solution: `def unique_paths(m, n):
    row = [1] * n
    for _ in range(1, m):
        for j in range(1, n):
            row[j] += row[j - 1]
    return row[-1]
`,
    },
    js: {
      starter: 'function uniquePaths(m, n) {\n  // write your code here\n}\n',
      solution: `function uniquePaths(m, n) {
  const row = new Array(n).fill(1);
  for (let i = 1; i < m; i++) {
    for (let j = 1; j < n; j++) row[j] += row[j - 1];
  }
  return row[n - 1];
}
`,
    },
    tests: [
      { args: [3, 7], expect: 28 },
      { args: [3, 2], expect: 3 },
      { args: [1, 1], expect: 1 },
      { args: [1, 5], expect: 1 },
      { args: [7, 3], expect: 28 },
      { args: [10, 10], expect: 48620 },
      { args: [3, 3], expect: 6 },
    ],
  },
  {
    id: 'dp-grid-paths-obstacles',
    title: 'Grid Paths with Obstacles',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: 'You are given a grid of 0s and 1s where 1 marks a blocked cell. Moving only right or down, count the paths from the top-left cell to the bottom-right cell that never step on a blocked cell. If the start or end is blocked, the answer is 0.',
    examples: [
      { input: 'grid = [[0,0,0],[0,1,0],[0,0,0]]', output: '2', explain: 'The centre is blocked, leaving the two border routes.' },
      { input: 'grid = [[0,1],[0,0]]', output: '1' },
    ],
    constraints: ['1 <= rows, cols <= 100', 'grid[i][j] is 0 or 1'],
    hints: ['Same recurrence as unique paths, but a blocked cell has 0 ways.', 'Use one row array; set it to 0 whenever the cell is blocked.'],
    approach: 'Use a single array dp of length cols, where dp[j] is the number of ways to reach column j in the current row. Initialise dp[0] = 1 if the start is open. For each cell, if it is blocked set dp[j] = 0, otherwise add dp[j-1] (from the left) to dp[j] (which already holds the value from above). After all rows dp[cols-1] is the answer. This handles blocked starts, blocked ends and walls in the first row automatically. Brute-force path enumeration is exponential.',
    complexity: 'Time O(rows * cols), Space O(cols)',
    fn: { py: 'unique_paths_with_obstacles', js: 'uniquePathsWithObstacles' },
    py: {
      starter: 'def unique_paths_with_obstacles(grid):\n    # write your code here\n    pass\n',
      solution: `def unique_paths_with_obstacles(grid):
    cols = len(grid[0])
    dp = [0] * cols
    dp[0] = 1 if grid[0][0] == 0 else 0
    for row in grid:
        for j in range(cols):
            if row[j] == 1:
                dp[j] = 0
            elif j > 0:
                dp[j] += dp[j - 1]
    return dp[-1]
`,
    },
    js: {
      starter: 'function uniquePathsWithObstacles(grid) {\n  // write your code here\n}\n',
      solution: `function uniquePathsWithObstacles(grid) {
  const cols = grid[0].length;
  const dp = new Array(cols).fill(0);
  dp[0] = grid[0][0] === 0 ? 1 : 0;
  for (const row of grid) {
    for (let j = 0; j < cols; j++) {
      if (row[j] === 1) dp[j] = 0;
      else if (j > 0) dp[j] += dp[j - 1];
    }
  }
  return dp[cols - 1];
}
`,
    },
    tests: [
      { args: [[[0, 0, 0], [0, 1, 0], [0, 0, 0]]], expect: 2 },
      { args: [[[0, 1], [0, 0]]], expect: 1 },
      { args: [[[1]]], expect: 0 },
      { args: [[[0]]], expect: 1 },
      { args: [[[0, 0], [1, 1], [0, 0]]], expect: 0 },
      { args: [[[0, 0, 0, 0]]], expect: 1 },
      { args: [[[0, 0], [0, 1]]], expect: 0 },
    ],
  },
  {
    id: 'dp-min-path-sum',
    title: 'Minimum Path Sum in a Grid',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Goldman Sachs', 'TCS Digital'],
    statement: 'Given a grid of non-negative integers, find a path from the top-left to the bottom-right cell, moving only right or down, that minimises the sum of the numbers on the path (both ends included). Return that minimum sum.',
    examples: [
      { input: 'grid = [[1,3,1],[1,5,1],[4,2,1]]', output: '7', explain: '1 -> 3 -> 1 -> 1 -> 1' },
      { input: 'grid = [[1,2,3],[4,5,6]]', output: '12' },
    ],
    constraints: ['1 <= rows, cols <= 200', '0 <= grid[i][j] <= 100'],
    hints: ['The cheapest way into a cell comes from the cheaper of its top and left neighbours.', 'Store one row of best costs and update it in place.'],
    approach: 'Let dp[j] hold the cheapest cost to reach column j of the current row. For the first row, costs are prefix sums. For each later row, dp[0] just adds the new cell, and for j > 0 dp[j] = grid[i][j] + min(dp[j], dp[j-1]), where dp[j] is the value from above and dp[j-1] from the left. The final dp[cols-1] is the answer. Trying all paths recursively costs O(2^(rows+cols)).',
    complexity: 'Time O(rows * cols), Space O(cols)',
    fn: { py: 'min_path_sum', js: 'minPathSum' },
    py: {
      starter: 'def min_path_sum(grid):\n    # write your code here\n    pass\n',
      solution: `def min_path_sum(grid):
    cols = len(grid[0])
    dp = [0] * cols
    for i, row in enumerate(grid):
        for j in range(cols):
            if i == 0 and j == 0:
                dp[j] = row[0]
            elif i == 0:
                dp[j] = dp[j - 1] + row[j]
            elif j == 0:
                dp[j] += row[j]
            else:
                dp[j] = row[j] + min(dp[j], dp[j - 1])
    return dp[-1]
`,
    },
    js: {
      starter: 'function minPathSum(grid) {\n  // write your code here\n}\n',
      solution: `function minPathSum(grid) {
  const cols = grid[0].length;
  const dp = new Array(cols).fill(0);
  for (let i = 0; i < grid.length; i++) {
    for (let j = 0; j < cols; j++) {
      const v = grid[i][j];
      if (i === 0 && j === 0) dp[j] = v;
      else if (i === 0) dp[j] = dp[j - 1] + v;
      else if (j === 0) dp[j] += v;
      else dp[j] = v + Math.min(dp[j], dp[j - 1]);
    }
  }
  return dp[cols - 1];
}
`,
    },
    tests: [
      { args: [[[1, 3, 1], [1, 5, 1], [4, 2, 1]]], expect: 7 },
      { args: [[[1, 2, 3], [4, 5, 6]]], expect: 12 },
      { args: [[[5]]], expect: 5 },
      { args: [[[1, 2], [1, 1]]], expect: 3 },
      { args: [[[1], [2], [3]]], expect: 6 },
      { args: [[[0, 0], [0, 0]]], expect: 0 },
    ],
  },
  {
    id: 'dp-knapsack-01',
    title: '0/1 Knapsack',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Flipkart', 'TCS Digital', 'Infosys SP'],
    statement: 'You have `n` items; item `i` weighs `weights[i]` and is worth `values[i]`. Each item can be taken at most once. Return the maximum total value you can carry in a bag whose capacity is `W`.',
    examples: [
      { input: 'weights = [1, 3, 4, 5], values = [1, 4, 5, 7], W = 7', output: '9', explain: 'Take the items of weight 3 and 4.' },
      { input: 'weights = [10, 20, 30], values = [60, 100, 120], W = 50', output: '220' },
    ],
    constraints: ['1 <= n <= 100', '1 <= weights[i] <= 1000', '0 <= values[i] <= 1000', '0 <= W <= 1000'],
    hints: ['For each item you either take it or leave it.', 'With a 1D array dp[c], loop capacity from W down to the item weight so each item is used once.'],
    approach: 'Let dp[c] be the best value achievable with capacity c using the items processed so far. For each item with weight w and value v, update dp[c] = max(dp[c], dp[c - w] + v) for c going from W down to w. Iterating capacity downwards guarantees dp[c - w] still refers to the state before this item was considered, so the item is not reused. After all items dp[W] is the answer. The brute force tries all 2^n subsets.',
    complexity: 'Time O(n * W), Space O(W)',
    fn: { py: 'knapsack', js: 'knapsack' },
    py: {
      starter: 'def knapsack(weights, values, W):\n    # write your code here\n    pass\n',
      solution: `def knapsack(weights, values, W):
    dp = [0] * (W + 1)
    for w, v in zip(weights, values):
        for c in range(W, w - 1, -1):
            if dp[c - w] + v > dp[c]:
                dp[c] = dp[c - w] + v
    return dp[W]
`,
    },
    js: {
      starter: 'function knapsack(weights, values, W) {\n  // write your code here\n}\n',
      solution: `function knapsack(weights, values, W) {
  const dp = new Array(W + 1).fill(0);
  for (let i = 0; i < weights.length; i++) {
    const w = weights[i], v = values[i];
    for (let c = W; c >= w; c--) dp[c] = Math.max(dp[c], dp[c - w] + v);
  }
  return dp[W];
}
`,
    },
    tests: [
      { args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expect: 9 },
      { args: [[10, 20, 30], [60, 100, 120], 50], expect: 220 },
      { args: [[5], [10], 4], expect: 0 },
      { args: [[1, 2, 3], [10, 15, 40], 6], expect: 65 },
      { args: [[4, 5, 1], [1, 2, 3], 4], expect: 3 },
      { args: [[2, 3, 4, 5], [3, 4, 5, 6], 5], expect: 7 },
    ],
  },
  {
    id: 'dp-partition-equal-subset',
    title: 'Partition Equal Subset Sum',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    statement: 'Given an array of positive integers `nums`, return `true` if it can be split into two groups whose sums are equal, otherwise `false`. Every element must go into exactly one group.',
    examples: [
      { input: 'nums = [1, 5, 11, 5]', output: 'true', explain: '[1, 5, 5] and [11]' },
      { input: 'nums = [1, 2, 3, 5]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 200', '1 <= nums[i] <= 100'],
    hints: ['If the total is odd, the answer is false right away.', 'Otherwise: is there a subset whose sum is exactly total / 2? That is a 0/1 knapsack on booleans.'],
    approach: 'Two equal halves exist exactly when some subset sums to half the total, so an odd total is immediately false. Keep a boolean array can[s] meaning some subset of the processed numbers sums to s, starting with can[0] = true. For each number x, go from target down to x and set can[s] = can[s] or can[s - x]; the downward loop stops x from being reused. Return can[target]. The brute force tries all 2^n ways to split the array.',
    complexity: 'Time O(n * sum), Space O(sum)',
    fn: { py: 'can_partition', js: 'canPartition' },
    py: {
      starter: 'def can_partition(nums):\n    # write your code here\n    pass\n',
      solution: `def can_partition(nums):
    total = sum(nums)
    if total % 2:
        return False
    target = total // 2
    can = [True] + [False] * target
    for x in nums:
        for s in range(target, x - 1, -1):
            if can[s - x]:
                can[s] = True
    return can[target]
`,
    },
    js: {
      starter: 'function canPartition(nums) {\n  // write your code here\n}\n',
      solution: `function canPartition(nums) {
  const total = nums.reduce((a, b) => a + b, 0);
  if (total % 2) return false;
  const target = total / 2;
  const can = new Array(target + 1).fill(false);
  can[0] = true;
  for (const x of nums) {
    for (let s = target; s >= x; s--) if (can[s - x]) can[s] = true;
  }
  return can[target];
}
`,
    },
    tests: [
      { args: [[1, 5, 11, 5]], expect: true },
      { args: [[1, 2, 3, 5]], expect: false },
      { args: [[1, 1]], expect: true },
      { args: [[2]], expect: false },
      { args: [[3, 3, 3, 4, 5]], expect: true },
      { args: [[1, 2, 5]], expect: false },
      { args: [[2, 2, 1, 1]], expect: true },
    ],
  },
  {
    id: 'dp-decode-ways',
    title: 'Decode Ways',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Meta', 'Flipkart'],
    statement: 'Letters are encoded as numbers: A = 1, B = 2, ..., Z = 26. Given a string of digits `s`, return how many ways it can be decoded back into letters. A part starting with `0` (like "06") is invalid.',
    examples: [
      { input: 's = "226"', output: '3', explain: '"2 2 6", "22 6" and "2 26".' },
      { input: 's = "06"', output: '0', explain: 'No letter maps to "0" or "06".' },
    ],
    constraints: ['1 <= s.length <= 100', 's contains only digits.'],
    hints: ['The last decoded piece is either one digit or two digits.', 'One digit is valid if it is not 0; two digits are valid if they form 10..26.'],
    approach: 'Let ways[i] be the number of decodings of the first i characters, with ways[0] = 1 for the empty prefix. For position i, if s[i-1] is not 0 it can stand alone, adding ways[i-1]. If the two characters s[i-2..i-1] form a number between 10 and 26, they can be one letter, adding ways[i-2]. Keep only the last two values for constant space. Recursion without memoisation branches twice at each digit and is exponential.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'num_decodings', js: 'numDecodings' },
    py: {
      starter: 'def num_decodings(s):\n    # write your code here\n    pass\n',
      solution: `def num_decodings(s):
    prev2, prev1 = 1, 1 if s[0] != '0' else 0
    for i in range(2, len(s) + 1):
        cur = 0
        if s[i - 1] != '0':
            cur += prev1
        if 10 <= int(s[i - 2:i]) <= 26:
            cur += prev2
        prev2, prev1 = prev1, cur
    return prev1
`,
    },
    js: {
      starter: 'function numDecodings(s) {\n  // write your code here\n}\n',
      solution: `function numDecodings(s) {
  let prev2 = 1, prev1 = s[0] !== '0' ? 1 : 0;
  for (let i = 2; i <= s.length; i++) {
    let cur = 0;
    if (s[i - 1] !== '0') cur += prev1;
    const two = Number(s.slice(i - 2, i));
    if (two >= 10 && two <= 26) cur += prev2;
    prev2 = prev1;
    prev1 = cur;
  }
  return prev1;
}
`,
    },
    tests: [
      { args: ['12'], expect: 2 },
      { args: ['226'], expect: 3 },
      { args: ['06'], expect: 0 },
      { args: ['0'], expect: 0 },
      { args: ['10'], expect: 1 },
      { args: ['11106'], expect: 2 },
      { args: ['2101'], expect: 1 },
      { args: ['1111'], expect: 5 },
    ],
  },
  {
    id: 'dp-word-break',
    title: 'Word Break',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Walmart', 'Microsoft'],
    statement: 'Given a string `s` and a list of dictionary words `words`, return `true` if `s` can be split into a sequence of one or more dictionary words (words may be reused), otherwise `false`.',
    examples: [
      { input: 's = "applepenapple", words = ["apple", "pen"]', output: 'true', explain: '"apple pen apple"' },
      { input: 's = "catsandog", words = ["cats", "dog", "sand", "and", "cat"]', output: 'false' },
    ],
    constraints: ['1 <= s.length <= 300', '1 <= words.length <= 1000', '1 <= words[i].length <= 20'],
    hints: ['ok[i] = can the first i characters be split?', 'ok[i] is true if some j < i has ok[j] true and s[j:i] is a word.'],
    approach: 'Put the words in a hash set for O(1) lookups and let ok[i] say whether the prefix of length i can be segmented, with ok[0] = true. For each end position i, look back at start positions j (only up to the longest word length) and set ok[i] = true if ok[j] is true and s[j:i] is in the set. The answer is ok[len(s)]. Limiting the look-back to the maximum word length keeps the work small. Plain backtracking without memo can explode on strings like "aaaa...b".',
    complexity: 'Time O(n * L) substring checks where L is the max word length, Space O(n)',
    fn: { py: 'word_break', js: 'wordBreak' },
    py: {
      starter: 'def word_break(s, words):\n    # write your code here\n    pass\n',
      solution: `def word_break(s, words):
    dict_set = set(words)
    max_len = max(len(w) for w in words)
    ok = [True] + [False] * len(s)
    for i in range(1, len(s) + 1):
        for j in range(max(0, i - max_len), i):
            if ok[j] and s[j:i] in dict_set:
                ok[i] = True
                break
    return ok[len(s)]
`,
    },
    js: {
      starter: 'function wordBreak(s, words) {\n  // write your code here\n}\n',
      solution: `function wordBreak(s, words) {
  const set = new Set(words);
  const maxLen = Math.max(...words.map((w) => w.length));
  const ok = new Array(s.length + 1).fill(false);
  ok[0] = true;
  for (let i = 1; i <= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j < i; j++) {
      if (ok[j] && set.has(s.slice(j, i))) { ok[i] = true; break; }
    }
  }
  return ok[s.length];
}
`,
    },
    tests: [
      { args: ['leetcode', ['leet', 'code']], expect: true },
      { args: ['applepenapple', ['apple', 'pen']], expect: true },
      { args: ['catsandog', ['cats', 'dog', 'sand', 'and', 'cat']], expect: false },
      { args: ['a', ['b']], expect: false },
      { args: ['aaaaaaa', ['aaaa', 'aaa']], expect: true },
      { args: ['cars', ['car', 'ca', 'rs']], expect: true },
    ],
  },
  {
    id: 'dp-longest-palindromic-subsequence',
    title: 'Longest Palindromic Subsequence',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Infosys SP'],
    statement: 'Given a string `s`, return the length of the longest subsequence of `s` that reads the same forwards and backwards.',
    examples: [
      { input: 's = "bbbab"', output: '4', explain: '"bbbb"' },
      { input: 's = "agbdba"', output: '5', explain: '"abdba"' },
    ],
    constraints: ['1 <= s.length <= 1000', 's has lowercase letters only.'],
    hints: ['Think about the substring s[i..j] and its two end characters.', 'If s[i] == s[j]: 2 + lps(i+1, j-1); else max(lps(i+1, j), lps(i, j-1)).'],
    approach: 'Let dp[i][j] be the answer for the substring from i to j. A single character is a palindrome of length 1. If the two ends match they wrap around the best answer for the inside, giving dp[i+1][j-1] + 2; otherwise drop one end and take max(dp[i+1][j], dp[i][j-1]). Fill i from the end of the string backwards so the inner states are ready, keeping only one row of the table. Equivalently it is the LCS of s and its reverse. Enumerating all subsequences is O(2^n).',
    complexity: 'Time O(n^2), Space O(n)',
    fn: { py: 'longest_palindrome_subseq', js: 'longestPalindromeSubseq' },
    py: {
      starter: 'def longest_palindrome_subseq(s):\n    # write your code here\n    pass\n',
      solution: `def longest_palindrome_subseq(s):
    n = len(s)
    dp = [0] * n
    for i in range(n - 1, -1, -1):
        new = [0] * n
        new[i] = 1
        for j in range(i + 1, n):
            if s[i] == s[j]:
                new[j] = dp[j - 1] + 2
            else:
                new[j] = max(dp[j], new[j - 1])
        dp = new
    return dp[n - 1]
`,
    },
    js: {
      starter: 'function longestPalindromeSubseq(s) {\n  // write your code here\n}\n',
      solution: `function longestPalindromeSubseq(s) {
  const n = s.length;
  let dp = new Array(n).fill(0);
  for (let i = n - 1; i >= 0; i--) {
    const cur = new Array(n).fill(0);
    cur[i] = 1;
    for (let j = i + 1; j < n; j++) {
      cur[j] = s[i] === s[j] ? dp[j - 1] + 2 : Math.max(dp[j], cur[j - 1]);
    }
    dp = cur;
  }
  return dp[n - 1];
}
`,
    },
    tests: [
      { args: ['bbbab'], expect: 4 },
      { args: ['cbbd'], expect: 2 },
      { args: ['a'], expect: 1 },
      { args: ['agbdba'], expect: 5 },
      { args: ['abcd'], expect: 1 },
      { args: ['racecar'], expect: 7 },
    ],
  },
  {
    id: 'dp-rod-cutting',
    title: 'Rod Cutting',
    diff: 'Medium',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'TCS Digital', 'Infosys SP'],
    statement: 'A rod of length `n` can be cut into pieces of integer length. `prices[i]` is the selling price of a piece of length `i + 1`. Return the maximum money you can earn by cutting the rod (or not cutting it at all) and selling the pieces.',
    examples: [
      { input: 'prices = [1, 5, 8, 9, 10, 17, 17, 20], n = 8', output: '22', explain: 'Cut into lengths 2 and 6: 5 + 17.' },
      { input: 'prices = [3, 5, 8, 9, 10, 17, 17, 20], n = 8', output: '24', explain: 'Eight pieces of length 1.' },
    ],
    constraints: ['1 <= n <= 1000', 'prices.length == n', '1 <= prices[i] <= 10^5'],
    hints: ['Choose the length of the first piece, then solve the rest.', 'best[L] = max over k of prices[k-1] + best[L-k]. This is an unbounded knapsack.'],
    approach: 'Let best[L] be the most money for a rod of length L, with best[0] = 0. For each L, try every first piece length k from 1 to L: the value is prices[k-1] plus the best for the remaining L - k. Take the maximum. Because pieces of the same length can repeat, this is the unbounded knapsack pattern. The plain recursion re-solves the same lengths over and over and is exponential.',
    complexity: 'Time O(n^2), Space O(n)',
    fn: { py: 'rod_cutting', js: 'rodCutting' },
    py: {
      starter: 'def rod_cutting(prices, n):\n    # write your code here\n    pass\n',
      solution: `def rod_cutting(prices, n):
    best = [0] * (n + 1)
    for length in range(1, n + 1):
        best[length] = max(prices[k - 1] + best[length - k] for k in range(1, length + 1))
    return best[n]
`,
    },
    js: {
      starter: 'function rodCutting(prices, n) {\n  // write your code here\n}\n',
      solution: `function rodCutting(prices, n) {
  const best = new Array(n + 1).fill(0);
  for (let len = 1; len <= n; len++) {
    for (let k = 1; k <= len; k++) best[len] = Math.max(best[len], prices[k - 1] + best[len - k]);
  }
  return best[n];
}
`,
    },
    tests: [
      { args: [[1, 5, 8, 9, 10, 17, 17, 20], 8], expect: 22 },
      { args: [[3, 5, 8, 9, 10, 17, 17, 20], 8], expect: 24 },
      { args: [[5], 1], expect: 5 },
      { args: [[1, 10], 2], expect: 10 },
      { args: [[2, 5, 7, 8], 4], expect: 10 },
      { args: [[1, 1, 1, 10], 4], expect: 10 },
    ],
  },
  {
    id: 'dp-edit-distance',
    title: 'Edit Distance',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Google', 'Microsoft', 'TCS Digital'],
    statement: 'Given two strings `a` and `b`, return the minimum number of single-character operations needed to turn `a` into `b`. Allowed operations are: insert a character, delete a character, and replace a character.',
    examples: [
      { input: 'a = "horse", b = "ros"', output: '3', explain: 'horse -> rorse (replace) -> rose (delete) -> ros (delete)' },
      { input: 'a = "kitten", b = "sitting"', output: '3' },
    ],
    constraints: ['0 <= a.length, b.length <= 500', 'Lowercase English letters only.'],
    hints: ['dp[i][j] = cost to turn the first i chars of a into the first j chars of b.', 'If a[i-1] == b[j-1] no cost; otherwise 1 + min(insert, delete, replace).'],
    approach: 'Let dp[i][j] be the minimum edits to convert a[:i] into b[:j]. Converting to or from an empty string costs the length of the other string, which fills row 0 and column 0. If a[i-1] equals b[j-1], the last characters already match and dp[i][j] = dp[i-1][j-1]. Otherwise take 1 plus the minimum of dp[i-1][j] (delete), dp[i][j-1] (insert) and dp[i-1][j-1] (replace). Only two rows are needed at a time. The brute force tries all three operations at every mismatch and is exponential.',
    complexity: 'Time O(n * m), Space O(m)',
    fn: { py: 'min_distance', js: 'minDistance' },
    py: {
      starter: 'def min_distance(a, b):\n    # write your code here\n    pass\n',
      solution: `def min_distance(a, b):
    m = len(b)
    prev = list(range(m + 1))
    for i in range(1, len(a) + 1):
        cur = [i] + [0] * m
        for j in range(1, m + 1):
            if a[i - 1] == b[j - 1]:
                cur[j] = prev[j - 1]
            else:
                cur[j] = 1 + min(prev[j], cur[j - 1], prev[j - 1])
        prev = cur
    return prev[m]
`,
    },
    js: {
      starter: 'function minDistance(a, b) {\n  // write your code here\n}\n',
      solution: `function minDistance(a, b) {
  const m = b.length;
  let prev = Array.from({ length: m + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const cur = new Array(m + 1).fill(0);
    cur[0] = i;
    for (let j = 1; j <= m; j++) {
      cur[j] = a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j], cur[j - 1], prev[j - 1]);
    }
    prev = cur;
  }
  return prev[m];
}
`,
    },
    tests: [
      { args: ['horse', 'ros'], expect: 3 },
      { args: ['intention', 'execution'], expect: 5 },
      { args: ['', 'abc'], expect: 3 },
      { args: ['abc', 'abc'], expect: 0 },
      { args: ['kitten', 'sitting'], expect: 3 },
      { args: ['a', ''], expect: 1 },
      { args: ['sunday', 'saturday'], expect: 3 },
    ],
  },
  {
    id: 'dp-matrix-chain',
    title: 'Matrix Chain Multiplication',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'TCS Digital', 'Infosys SP'],
    statement: 'A chain of matrices is described by `dims`: matrix `i` has size `dims[i] x dims[i+1]`. Multiplying a `p x q` matrix by a `q x r` matrix costs `p * q * r` scalar multiplications. Return the minimum total cost to multiply the whole chain by choosing the best parenthesisation. A single matrix costs 0.',
    examples: [
      { input: 'dims = [10, 30, 5, 60]', output: '4500', explain: '(A*B)*C costs 10*30*5 + 10*5*60 = 4500.' },
      { input: 'dims = [40, 20, 30, 10, 30]', output: '26000' },
    ],
    constraints: ['2 <= dims.length <= 100', '1 <= dims[i] <= 500'],
    hints: ['The last multiplication splits the chain into a left part and a right part.', 'cost(i, j) = min over k of cost(i, k) + cost(k+1, j) + dims[i] * dims[k+1] * dims[j+1]. Fill by increasing chain length.'],
    approach: 'Number the matrices 0..n-1 and let dp[i][j] be the cheapest way to multiply matrices i through j. A single matrix needs nothing, so dp[i][i] = 0. For a longer range, try every split point k where the last multiplication joins (i..k) and (k+1..j); that final step costs dims[i] * dims[k+1] * dims[j+1]. Fill the table by increasing range length so smaller ranges are ready. The answer is dp[0][n-1]. Trying every parenthesisation directly grows like the Catalan numbers, which is exponential.',
    complexity: 'Time O(n^3), Space O(n^2)',
    fn: { py: 'matrix_chain_order', js: 'matrixChainOrder' },
    py: {
      starter: 'def matrix_chain_order(dims):\n    # write your code here\n    pass\n',
      solution: `def matrix_chain_order(dims):
    n = len(dims) - 1
    dp = [[0] * n for _ in range(n)]
    for length in range(2, n + 1):
        for i in range(n - length + 1):
            j = i + length - 1
            dp[i][j] = min(
                dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]
                for k in range(i, j)
            )
    return dp[0][n - 1]
`,
    },
    js: {
      starter: 'function matrixChainOrder(dims) {\n  // write your code here\n}\n',
      solution: `function matrixChainOrder(dims) {
  const n = dims.length - 1;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i + len - 1 < n; i++) {
      const j = i + len - 1;
      let best = Infinity;
      for (let k = i; k < j; k++) {
        best = Math.min(best, dp[i][k] + dp[k + 1][j] + dims[i] * dims[k + 1] * dims[j + 1]);
      }
      dp[i][j] = best;
    }
  }
  return dp[0][n - 1];
}
`,
    },
    tests: [
      { args: [[10, 30, 5, 60]], expect: 4500 },
      { args: [[40, 20, 30, 10, 30]], expect: 26000 },
      { args: [[10, 20, 30]], expect: 6000 },
      { args: [[1, 2, 3, 4, 3]], expect: 30 },
      { args: [[10, 20, 30, 40, 30]], expect: 30000 },
      { args: [[5, 10]], expect: 0 },
    ],
  },
  {
    id: 'dp-egg-drop',
    title: 'Egg Dropping Puzzle',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Amazon', 'Goldman Sachs'],
    statement: 'You have `k` identical eggs and a building with `n` floors. There is an unknown floor `f` (0 <= f <= n): an egg dropped from any floor above `f` breaks and from `f` or below it survives. A broken egg cannot be reused. Return the minimum number of drops needed to find `f` with certainty in the worst case.',
    examples: [
      { input: 'k = 1, n = 2', output: '2', explain: 'With one egg you must test floor 1, then floor 2.' },
      { input: 'k = 2, n = 6', output: '3' },
    ],
    constraints: ['1 <= k <= 100', '1 <= n <= 10^4'],
    hints: ['Flip the question: with m drops and k eggs, how many floors can you fully cover?', 'covered(m, k) = covered(m-1, k-1) + covered(m-1, k) + 1. Increase m until it reaches n.'],
    approach: 'Instead of asking how many drops a building needs, ask how many floors m drops and k eggs can handle. Dropping once splits the building: if the egg breaks, the floors below must be solved with m-1 drops and k-1 eggs; if not, the floors above with m-1 drops and k eggs; plus the floor tested. So f(m, k) = f(m-1, k-1) + f(m-1, k) + 1. Keep an array over eggs and increase m one at a time, updating eggs from high to low, until f(m, k) >= n; that m is the answer. The classic dp[k][n] with a linear scan over the drop floor is O(k * n^2) and too slow for large n.',
    complexity: 'Time O(k * answer) which is at most O(k * n), Space O(k)',
    fn: { py: 'super_egg_drop', js: 'superEggDrop' },
    py: {
      starter: 'def super_egg_drop(k, n):\n    # write your code here\n    pass\n',
      solution: `def super_egg_drop(k, n):
    covered = [0] * (k + 1)
    moves = 0
    while covered[k] < n:
        moves += 1
        for e in range(k, 0, -1):
            covered[e] = covered[e - 1] + covered[e] + 1
    return moves
`,
    },
    js: {
      starter: 'function superEggDrop(k, n) {\n  // write your code here\n}\n',
      solution: `function superEggDrop(k, n) {
  const covered = new Array(k + 1).fill(0);
  let moves = 0;
  while (covered[k] < n) {
    moves++;
    for (let e = k; e > 0; e--) covered[e] = covered[e - 1] + covered[e] + 1;
  }
  return moves;
}
`,
    },
    tests: [
      { args: [1, 2], expect: 2 },
      { args: [2, 6], expect: 3 },
      { args: [3, 14], expect: 4 },
      { args: [1, 10], expect: 10 },
      { args: [2, 100], expect: 14 },
      { args: [2, 1], expect: 1 },
      { args: [3, 25], expect: 5 },
      { args: [3, 26], expect: 6 },
    ],
  },
  {
    id: 'dp-regex-matching',
    title: 'Regular Expression Matching',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Microsoft', 'Amazon'],
    statement: 'Implement pattern matching where the pattern `p` may contain `.` (matches any single character) and `*` (matches zero or more of the **preceding** element). The match must cover the **whole** string `s`. Return `true` or `false`.',
    examples: [
      { input: 's = "aab", p = "c*a*b"', output: 'true', explain: 'c* matches nothing, a* matches "aa".' },
      { input: 's = "mississippi", p = "mis*is*p*."', output: 'false' },
    ],
    constraints: ['0 <= s.length <= 20', '1 <= p.length <= 20', 'Every * has a valid character before it.'],
    hints: ['dp[i][j]: does s[:i] match p[:j]?', 'For p[j-1] == "*": either use zero copies (dp[i][j-2]) or, if the previous pattern char matches s[i-1], consume one char (dp[i-1][j]).'],
    approach: 'Let dp[i][j] be true when the first i characters of s match the first j characters of p. The empty pattern matches only the empty string, and patterns like "a*b*" can match the empty string through the star rule. If p[j-1] is a normal character or a dot, it must match s[i-1] and dp[i][j] = dp[i-1][j-1]. If p[j-1] is a star, either skip the "x*" pair entirely (dp[i][j-2]) or, when x matches s[i-1], let the star absorb one more character (dp[i-1][j]). The answer is dp[len(s)][len(p)]. Naive backtracking can be exponential on patterns with many stars.',
    complexity: 'Time O(n * m), Space O(n * m)',
    fn: { py: 'is_match', js: 'isMatch' },
    py: {
      starter: 'def is_match(s, p):\n    # write your code here\n    pass\n',
      solution: `def is_match(s, p):
    n, m = len(s), len(p)
    dp = [[False] * (m + 1) for _ in range(n + 1)]
    dp[0][0] = True
    for i in range(n + 1):
        for j in range(1, m + 1):
            if p[j - 1] == '*':
                dp[i][j] = dp[i][j - 2]
                if i > 0 and p[j - 2] in (s[i - 1], '.'):
                    dp[i][j] = dp[i][j] or dp[i - 1][j]
            elif i > 0 and p[j - 1] in (s[i - 1], '.'):
                dp[i][j] = dp[i - 1][j - 1]
    return dp[n][m]
`,
    },
    js: {
      starter: 'function isMatch(s, p) {\n  // write your code here\n}\n',
      solution: `function isMatch(s, p) {
  const n = s.length, m = p.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(false));
  dp[0][0] = true;
  for (let i = 0; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      if (p[j - 1] === '*') {
        dp[i][j] = dp[i][j - 2];
        if (i > 0 && (p[j - 2] === s[i - 1] || p[j - 2] === '.')) dp[i][j] = dp[i][j] || dp[i - 1][j];
      } else if (i > 0 && (p[j - 1] === s[i - 1] || p[j - 1] === '.')) {
        dp[i][j] = dp[i - 1][j - 1];
      }
    }
  }
  return dp[n][m];
}
`,
    },
    tests: [
      { args: ['aa', 'a'], expect: false },
      { args: ['aa', 'a*'], expect: true },
      { args: ['ab', '.*'], expect: true },
      { args: ['aab', 'c*a*b'], expect: true },
      { args: ['mississippi', 'mis*is*p*.'], expect: false },
      { args: ['', 'a*'], expect: true },
      { args: ['ab', '.*c'], expect: false },
      { args: ['abc', 'a.c'], expect: true },
    ],
  },
  {
    id: 'dp-burst-balloons',
    title: 'Burst Balloons',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Microsoft', 'Amazon'],
    statement: 'Balloons in a row have numbers `nums[i]`. Bursting balloon `i` earns `left * nums[i] * right`, where `left` and `right` are the numbers on its current neighbours (use 1 if a neighbour does not exist). After bursting, its neighbours become adjacent. Burst all balloons and return the maximum coins you can earn.',
    examples: [
      { input: 'nums = [3, 1, 5, 8]', output: '167', explain: 'Burst 1, 5, 3, 8: 15 + 120 + 24 + 8 = 167.' },
      { input: 'nums = [1, 5]', output: '10' },
    ],
    constraints: ['1 <= nums.length <= 300', '0 <= nums[i] <= 100'],
    hints: ['Choosing the FIRST balloon to burst makes the subproblems depend on each other. What about the LAST one?', 'Pad with 1 on both ends. dp[l][r] = max over k in (l, r) of dp[l][k] + dp[k][r] + v[l]*v[k]*v[r].'],
    approach: 'Add a 1 at both ends of the array. Let dp[l][r] be the best coins from bursting every balloon strictly between positions l and r, with l and r still standing. If balloon k is the last one burst in that range, its neighbours at that moment are exactly l and r, so it earns v[l] * v[k] * v[r], and the two sides (l, k) and (k, r) are independent. dp[l][r] is the maximum of dp[l][k] + dp[k][r] + v[l] * v[k] * v[r] over all k between them. Fill by increasing gap so inner ranges are ready; the answer is dp[0][n+1]. Trying every burst order is O(n!).',
    complexity: 'Time O(n^3), Space O(n^2)',
    fn: { py: 'max_coins', js: 'maxCoins' },
    py: {
      starter: 'def max_coins(nums):\n    # write your code here\n    pass\n',
      solution: `def max_coins(nums):
    v = [1] + nums + [1]
    n = len(v)
    dp = [[0] * n for _ in range(n)]
    for gap in range(2, n):
        for l in range(n - gap):
            r = l + gap
            best = 0
            for k in range(l + 1, r):
                cand = dp[l][k] + dp[k][r] + v[l] * v[k] * v[r]
                if cand > best:
                    best = cand
            dp[l][r] = best
    return dp[0][n - 1]
`,
    },
    js: {
      starter: 'function maxCoins(nums) {\n  // write your code here\n}\n',
      solution: `function maxCoins(nums) {
  const v = [1, ...nums, 1];
  const n = v.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));
  for (let gap = 2; gap < n; gap++) {
    for (let l = 0; l + gap < n; l++) {
      const r = l + gap;
      let best = 0;
      for (let k = l + 1; k < r; k++) {
        best = Math.max(best, dp[l][k] + dp[k][r] + v[l] * v[k] * v[r]);
      }
      dp[l][r] = best;
    }
  }
  return dp[0][n - 1];
}
`,
    },
    tests: [
      { args: [[3, 1, 5, 8]], expect: 167 },
      { args: [[1, 5]], expect: 10 },
      { args: [[7]], expect: 7 },
      { args: [[2, 3]], expect: 9 },
      { args: [[1, 1, 1]], expect: 3 },
      { args: [[5, 1]], expect: 10 },
      { args: [[8, 2]], expect: 24 },
    ],
  },
  {
    id: 'dp-longest-valid-parentheses',
    title: 'Longest Valid Parentheses',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Amazon', 'Microsoft', 'Google'],
    statement: 'Given a string `s` made of `(` and `)`, return the length of the longest contiguous substring that is a well-formed (balanced) parentheses string.',
    examples: [
      { input: 's = ")()())"', output: '4', explain: '"()()"' },
      { input: 's = "()(())"', output: '6' },
    ],
    constraints: ['0 <= s.length <= 3 * 10^4', "s[i] is '(' or ')'"],
    hints: ['Let dp[i] be the length of the longest valid substring ending at i.', 'For s[i] == ")": if s[i-1] == "(", dp[i] = dp[i-2] + 2; else look at the char just before the valid block ending at i-1.'],
    approach: 'Let dp[i] be the length of the longest valid substring that ends exactly at index i; it is 0 whenever s[i] is "(". If s[i] is ")" and s[i-1] is "(", they form a pair and dp[i] = dp[i-2] + 2. If s[i-1] is ")", find j = i - dp[i-1] - 1, the character just before the valid block ending at i-1. If s[j] is "(", it closes around that block: dp[i] = dp[i-1] + 2 + dp[j-1], which also glues on any valid block right before j. The answer is the maximum dp value. Checking every substring for balance is O(n^3), or O(n^2) with care.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'longest_valid_parentheses', js: 'longestValidParentheses' },
    py: {
      starter: 'def longest_valid_parentheses(s):\n    # write your code here\n    pass\n',
      solution: `def longest_valid_parentheses(s):
    n = len(s)
    dp = [0] * n
    best = 0
    for i in range(1, n):
        if s[i] != ')':
            continue
        if s[i - 1] == '(':
            dp[i] = (dp[i - 2] if i >= 2 else 0) + 2
        else:
            j = i - dp[i - 1] - 1
            if j >= 0 and s[j] == '(':
                dp[i] = dp[i - 1] + 2 + (dp[j - 1] if j >= 1 else 0)
        best = max(best, dp[i])
    return best
`,
    },
    js: {
      starter: 'function longestValidParentheses(s) {\n  // write your code here\n}\n',
      solution: `function longestValidParentheses(s) {
  const n = s.length;
  const dp = new Array(n).fill(0);
  let best = 0;
  for (let i = 1; i < n; i++) {
    if (s[i] !== ')') continue;
    if (s[i - 1] === '(') {
      dp[i] = (i >= 2 ? dp[i - 2] : 0) + 2;
    } else {
      const j = i - dp[i - 1] - 1;
      if (j >= 0 && s[j] === '(') dp[i] = dp[i - 1] + 2 + (j >= 1 ? dp[j - 1] : 0);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['(()'], expect: 2 },
      { args: [')()())'], expect: 4 },
      { args: [''], expect: 0 },
      { args: ['()(())'], expect: 6 },
      { args: ['(()))())('], expect: 4 },
      { args: ['((('], expect: 0 },
      { args: ['()(()'], expect: 2 },
    ],
  },
  {
    id: 'dp-distinct-subsequences',
    title: 'Distinct Subsequences',
    diff: 'Hard',
    pattern: 'Dynamic Programming',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: 'Given strings `s` and `t`, return how many different ways you can delete characters from `s` (choosing different index sets) so that what remains equals `t`. In other words, count the distinct subsequences of `s` equal to `t`.',
    examples: [
      { input: 's = "rabbbit", t = "rabbit"', output: '3', explain: 'Any one of the three b characters can be removed.' },
      { input: 's = "babgbag", t = "bag"', output: '5' },
    ],
    constraints: ['1 <= s.length, t.length <= 1000', 'The answer fits in a 32-bit integer.'],
    hints: ['dp[j] = number of ways to form t[:j] from the part of s seen so far.', 'When s[i] == t[j-1], dp[j] += dp[j-1]; iterate j from right to left.'],
    approach: 'Let ways[j] be how many subsequences of the processed prefix of s equal t[:j]; ways[0] = 1 because the empty string can always be formed once. Read s one character at a time. For every j where t[j-1] equals the current character, the character can finish a copy of t[:j] built from earlier characters, so ways[j] += ways[j-1]. Iterate j from right to left so the update uses values from before this character. The answer is ways[len(t)]. Enumerating all subsequences of s is O(2^n).',
    complexity: 'Time O(n * m), Space O(m)',
    fn: { py: 'num_distinct', js: 'numDistinct' },
    py: {
      starter: 'def num_distinct(s, t):\n    # write your code here\n    pass\n',
      solution: `def num_distinct(s, t):
    m = len(t)
    ways = [1] + [0] * m
    for ch in s:
        for j in range(m, 0, -1):
            if t[j - 1] == ch:
                ways[j] += ways[j - 1]
    return ways[m]
`,
    },
    js: {
      starter: 'function numDistinct(s, t) {\n  // write your code here\n}\n',
      solution: `function numDistinct(s, t) {
  const m = t.length;
  const ways = new Array(m + 1).fill(0);
  ways[0] = 1;
  for (const ch of s) {
    for (let j = m; j > 0; j--) if (t[j - 1] === ch) ways[j] += ways[j - 1];
  }
  return ways[m];
}
`,
    },
    tests: [
      { args: ['rabbbit', 'rabbit'], expect: 3 },
      { args: ['babgbag', 'bag'], expect: 5 },
      { args: ['abc', 'abcd'], expect: 0 },
      { args: ['aaa', 'a'], expect: 3 },
      { args: ['aaaa', 'aa'], expect: 6 },
      { args: ['abc', 'abc'], expect: 1 },
    ],
  },
];
