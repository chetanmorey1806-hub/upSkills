export default [
  {
    id: 'bs-binary-search',
    title: 'Binary Search',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    statement: "Given a sorted array of **distinct** integers `nums` and a `target`, return the index of `target` in `nums`, or `-1` if it is not present. Your algorithm must run in O(log n).",
    examples: [
      { input: 'nums = [-3, 0, 4, 9, 15], target = 9', output: '3' },
      { input: 'nums = [-3, 0, 4, 9, 15], target = 5', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted ascending with distinct values'],
    hints: ['Compare the target with the middle element.', 'Discard the half that cannot contain the target.'],
    approach: "Keep a search range [lo, hi], initially the whole array. Look at the middle index mid. If nums[mid] equals the target, return mid. If it is smaller than the target, the target can only be to the right, so set lo = mid + 1; otherwise set hi = mid - 1. Each step halves the range, so at most about log2(n) steps are needed. When lo passes hi the target is absent. A linear scan works too but costs O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'search', js: 'search' },
    py: {
      starter: 'def search(nums, target):\n    # write your code here\n    pass\n',
      solution: `def search(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
`,
    },
    js: {
      starter: 'function search(nums, target) {\n  // write your code here\n}\n',
      solution: `function search(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[-3, 0, 4, 9, 15], 9], expect: 3 },
      { args: [[-3, 0, 4, 9, 15], 5], expect: -1 },
      { args: [[7], 7], expect: 0 },
      { args: [[7], 2], expect: -1 },
      { args: [[1, 2, 3, 4, 5, 6], 1], expect: 0 },
      { args: [[1, 2, 3, 4, 5, 6], 6], expect: 5 },
      { args: [[2, 4, 6], 7], expect: -1 },
    ],
  },
  {
    id: 'bs-search-insert-position',
    title: 'Search Insert Position',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Infosys', 'Microsoft'],
    statement: "Given a sorted array of distinct integers `nums` and a `target`, return the index of `target` if it exists; otherwise return the index where it would be **inserted** to keep the array sorted. Use O(log n) time.",
    examples: [
      { input: 'nums = [1, 3, 5, 6], target = 5', output: '2' },
      { input: 'nums = [1, 3, 5, 6], target = 2', output: '1' },
      { input: 'nums = [1, 3, 5, 6], target = 7', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 10^4', 'nums is sorted ascending with distinct values'],
    hints: ['You are looking for the first index whose value is >= target.', 'Binary search with lo = 0, hi = n (exclusive).'],
    approach: "The answer is the first index i with nums[i] >= target (or n if every value is smaller). This is a lower-bound search. Keep lo = 0 and hi = n. While lo < hi, take mid; if nums[mid] < target the answer is to the right, so lo = mid + 1, otherwise the answer is mid or earlier, so hi = mid. When lo equals hi, it is the insertion position, which is also the index of the target if it exists. A linear scan is O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'search_insert', js: 'searchInsert' },
    py: {
      starter: 'def search_insert(nums, target):\n    # write your code here\n    pass\n',
      solution: `def search_insert(nums, target):
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo
`,
    },
    js: {
      starter: 'function searchInsert(nums, target) {\n  // write your code here\n}\n',
      solution: `function searchInsert(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[1, 3, 5, 6], 5], expect: 2 },
      { args: [[1, 3, 5, 6], 2], expect: 1 },
      { args: [[1, 3, 5, 6], 7], expect: 4 },
      { args: [[1, 3, 5, 6], 0], expect: 0 },
      { args: [[4], 4], expect: 0 },
      { args: [[4], 9], expect: 1 },
    ],
  },
  {
    id: 'bs-sqrt-x',
    title: 'Integer Square Root',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'TCS', 'Microsoft', 'Infosys'],
    statement: "Given a non-negative integer `x`, return the square root of `x` **rounded down** to the nearest integer, without using any built-in power or sqrt function.",
    examples: [
      { input: 'x = 16', output: '4' },
      { input: 'x = 20', output: '4', explain: 'sqrt(20) is about 4.47.' },
    ],
    constraints: ['0 <= x <= 2^31 - 1'],
    hints: ['The answer is the largest r with r * r <= x.', 'Binary search r in the range 0..x.'],
    approach: "We want the largest integer r with r*r <= x. The condition r*r <= x is true for small r and false for large r, so binary search applies. Search lo = 0, hi = x; for each mid, if mid*mid <= x, mid is a valid candidate, so record it and search higher; otherwise search lower. When the loop ends, the recorded candidate is the floor of the square root. Trying r = 0, 1, 2, ... one by one takes O(sqrt(x)) steps, which is up to about 46000 for the largest inputs.",
    complexity: 'Time O(log x), Space O(1)',
    fn: { py: 'my_sqrt', js: 'mySqrt' },
    py: {
      starter: 'def my_sqrt(x):\n    # write your code here\n    pass\n',
      solution: `def my_sqrt(x):
    lo, hi, ans = 0, x, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans
`,
    },
    js: {
      starter: 'function mySqrt(x) {\n  // write your code here\n}\n',
      solution: `function mySqrt(x) {
  let lo = 0, hi = x, ans = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (mid * mid <= x) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}
`,
    },
    tests: [
      { args: [16], expect: 4 },
      { args: [20], expect: 4 },
      { args: [0], expect: 0 },
      { args: [1], expect: 1 },
      { args: [2], expect: 1 },
      { args: [2147395599], expect: 46339 },
      { args: [99], expect: 9 },
    ],
  },
  {
    id: 'bs-valid-perfect-square',
    title: 'Valid Perfect Square',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Wipro', 'Accenture'],
    statement: "Given a positive integer `num`, return `true` if it is a perfect square (the square of some integer), otherwise `false`. Do not use a built-in sqrt function.",
    examples: [
      { input: 'num = 49', output: 'true' },
      { input: 'num = 50', output: 'false' },
    ],
    constraints: ['1 <= num <= 2^31 - 1'],
    hints: ['Binary search for an integer r with r * r == num.', 'Search 1..num and compare mid * mid with num.'],
    approach: "Binary search for an integer r between 1 and num with r*r == num. For each mid, compare mid*mid with num: equal means num is a perfect square; smaller means r must be bigger; larger means r must be smaller. If the range becomes empty, no integer squares to num. This takes O(log num) steps. Trying every integer up to sqrt(num) takes O(sqrt(num)) steps.",
    complexity: 'Time O(log num), Space O(1)',
    fn: { py: 'is_perfect_square', js: 'isPerfectSquare' },
    py: {
      starter: 'def is_perfect_square(num):\n    # write your code here\n    pass\n',
      solution: `def is_perfect_square(num):
    lo, hi = 1, num
    while lo <= hi:
        mid = (lo + hi) // 2
        sq = mid * mid
        if sq == num:
            return True
        if sq < num:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
`,
    },
    js: {
      starter: 'function isPerfectSquare(num) {\n  // write your code here\n}\n',
      solution: `function isPerfectSquare(num) {
  let lo = 1, hi = num;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const sq = mid * mid;
    if (sq === num) return true;
    if (sq < num) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
`,
    },
    tests: [
      { args: [49], expect: true },
      { args: [50], expect: false },
      { args: [1], expect: true },
      { args: [2], expect: false },
      { args: [808201], expect: true },
      { args: [2147483647], expect: false },
    ],
  },
  {
    id: 'bs-arranging-coins',
    title: 'Arranging Coins',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'TCS', 'Google'],
    statement: "You have `n` coins and build a staircase where row `k` has exactly `k` coins (row 1 has 1 coin, row 2 has 2, ...). The last row may be incomplete. Return the number of **complete** rows.",
    examples: [
      { input: 'n = 5', output: '2', explain: 'Rows of 1 and 2 use 3 coins; row 3 would need 3 more but only 2 remain.' },
      { input: 'n = 10', output: '4' },
    ],
    constraints: ['1 <= n <= 2^31 - 1'],
    hints: ['k complete rows need k * (k + 1) / 2 coins.', 'Binary search the largest k with k * (k + 1) / 2 <= n.'],
    approach: "Building k complete rows needs k*(k+1)/2 coins, which grows with k. So we want the largest k with k*(k+1)/2 <= n, a monotonic condition that suits binary search. Search k in 0..n: if the coins needed for mid rows fit, record mid and go higher; otherwise go lower. The answer is the last recorded value. Simulating row by row takes O(sqrt(n)) steps. A closed-form formula with a square root also exists, but it can suffer from floating-point errors.",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'arrange_coins', js: 'arrangeCoins' },
    py: {
      starter: 'def arrange_coins(n):\n    # write your code here\n    pass\n',
      solution: `def arrange_coins(n):
    lo, hi, ans = 0, n, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * (mid + 1) // 2 <= n:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans
`,
    },
    js: {
      starter: 'function arrangeCoins(n) {\n  // write your code here\n}\n',
      solution: `function arrangeCoins(n) {
  let lo = 0, hi = n, ans = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if ((mid * (mid + 1)) / 2 <= n) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}
`,
    },
    tests: [
      { args: [5], expect: 2 },
      { args: [10], expect: 4 },
      { args: [1], expect: 1 },
      { args: [3], expect: 2 },
      { args: [8], expect: 3 },
      { args: [2147483647], expect: 65535 },
    ],
  },
  {
    id: 'bs-floor-ceil-sorted',
    title: 'Floor and Ceil in a Sorted Array',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['TCS', 'Infosys', 'Amazon', 'Wipro'],
    statement: "Given a sorted array `arr` and a value `x`, return `[floor, ceil]` where **floor** is the largest element `<= x` and **ceil** is the smallest element `>= x`. Use `-1` for a value that does not exist.",
    examples: [
      { input: 'arr = [1, 2, 8, 10, 12, 19], x = 5', output: '[2, 8]' },
      { input: 'arr = [1, 2, 8, 10, 12, 19], x = 0', output: '[-1, 1]' },
      { input: 'arr = [1, 2, 8], x = 8', output: '[8, 8]' },
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i], x <= 10^6', 'arr is sorted ascending'],
    hints: ['Two binary searches: one for the floor, one for the ceil.', 'When arr[mid] <= x, mid is a floor candidate; search right for a bigger one.'],
    approach: "Run binary search twice. For the floor, whenever arr[mid] <= x record arr[mid] as a candidate and continue searching the right half for a larger candidate; otherwise search the left half. For the ceil, whenever arr[mid] >= x record it and continue to the left for a smaller one; otherwise go right. Both searches start with -1 as the default answer, which stays if no candidate exists. Each search is O(log n). A linear scan finds both in O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'floor_ceil', js: 'floorCeil' },
    py: {
      starter: 'def floor_ceil(arr, x):\n    # write your code here\n    pass\n',
      solution: `def floor_ceil(arr, x):
    fl, ce = -1, -1
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] <= x:
            fl = arr[mid]
            lo = mid + 1
        else:
            hi = mid - 1
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] >= x:
            ce = arr[mid]
            hi = mid - 1
        else:
            lo = mid + 1
    return [fl, ce]
`,
    },
    js: {
      starter: 'function floorCeil(arr, x) {\n  // write your code here\n}\n',
      solution: `function floorCeil(arr, x) {
  let fl = -1, ce = -1;
  let lo = 0, hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] <= x) { fl = arr[mid]; lo = mid + 1; } else hi = mid - 1;
  }
  lo = 0; hi = arr.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] >= x) { ce = arr[mid]; hi = mid - 1; } else lo = mid + 1;
  }
  return [fl, ce];
}
`,
    },
    tests: [
      { args: [[1, 2, 8, 10, 12, 19], 5], expect: [2, 8] },
      { args: [[1, 2, 8, 10, 12, 19], 0], expect: [-1, 1] },
      { args: [[1, 2, 8], 8], expect: [8, 8] },
      { args: [[1, 2, 8, 10, 12, 19], 20], expect: [19, -1] },
      { args: [[5], 5], expect: [5, 5] },
      { args: [[3, 3, 7, 7], 4], expect: [3, 7] },
    ],
  },
  {
    id: 'bs-count-negatives-matrix',
    title: 'Count Negatives in a Sorted Matrix',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    statement: "An `m x n` matrix `grid` is sorted in **non-increasing** order both along every row and down every column. Return the number of negative numbers in it.",
    examples: [
      { input: 'grid = [[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]', output: '8' },
      { input: 'grid = [[3, 2], [1, 0]]', output: '0' },
    ],
    constraints: ['1 <= m, n <= 100', '-100 <= grid[i][j] <= 100'],
    hints: ['In each row, find the first negative position with binary search.', 'Negatives in that row = n - first negative index.'],
    approach: "Each row is sorted in non-increasing order, so its negatives form a suffix. For each row, binary search the first index whose value is negative: if grid[r][mid] < 0, the boundary is at mid or earlier, otherwise it is after mid. The number of negatives in the row is n minus that index. Summing over all rows takes O(m log n). A staircase walk from the bottom-left corner achieves O(m + n), and a plain scan of every cell is O(m * n).",
    complexity: 'Time O(m log n), Space O(1)',
    fn: { py: 'count_negatives', js: 'countNegatives' },
    py: {
      starter: 'def count_negatives(grid):\n    # write your code here\n    pass\n',
      solution: `def count_negatives(grid):
    total = 0
    for row in grid:
        lo, hi = 0, len(row)
        while lo < hi:
            mid = (lo + hi) // 2
            if row[mid] < 0:
                hi = mid
            else:
                lo = mid + 1
        total += len(row) - lo
    return total
`,
    },
    js: {
      starter: 'function countNegatives(grid) {\n  // write your code here\n}\n',
      solution: `function countNegatives(grid) {
  let total = 0;
  for (const row of grid) {
    let lo = 0, hi = row.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (row[mid] < 0) hi = mid;
      else lo = mid + 1;
    }
    total += row.length - lo;
  }
  return total;
}
`,
    },
    tests: [
      { args: [[[4, 3, 2, -1], [3, 2, 1, -1], [1, 1, -1, -2], [-1, -1, -2, -3]]], expect: 8 },
      { args: [[[3, 2], [1, 0]]], expect: 0 },
      { args: [[[-1]]], expect: 1 },
      { args: [[[5]]], expect: 0 },
      { args: [[[-1, -2], [-3, -4]]], expect: 4 },
      { args: [[[2, 0, -1], [0, -2, -3]]], expect: 3 },
    ],
  },
  {
    id: 'bs-kth-missing-positive',
    title: 'Kth Missing Positive Number',
    diff: 'Easy',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "Given a strictly increasing array of positive integers `arr` and an integer `k`, return the `k`-th positive integer that is **missing** from `arr`.",
    examples: [
      { input: 'arr = [2, 3, 4, 7, 11], k = 5', output: '9', explain: 'Missing: 1, 5, 6, 8, 9, ...' },
      { input: 'arr = [1, 2, 3, 4], k = 2', output: '6' },
    ],
    constraints: ['1 <= arr.length <= 1000', '1 <= arr[i] <= 1000', '1 <= k <= 1000'],
    hints: ['Before index i, exactly arr[i] - (i + 1) numbers are missing.', 'Binary search the first index where that count is >= k; the answer is that index + k.'],
    approach: "At index i, the number of positive integers missing before arr[i] is arr[i] - (i + 1), and this count never decreases as i grows. Binary search for the first index lo where the missing count is at least k. Then exactly lo array elements are smaller than the answer, so the k-th missing number is lo + k. If no such index exists, lo = n and the formula still works. Walking through numbers one by one and counting gaps takes O(n + k).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'find_kth_positive', js: 'findKthPositive' },
    py: {
      starter: 'def find_kth_positive(arr, k):\n    # write your code here\n    pass\n',
      solution: `def find_kth_positive(arr, k):
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] - (mid + 1) < k:
            lo = mid + 1
        else:
            hi = mid
    return lo + k
`,
    },
    js: {
      starter: 'function findKthPositive(arr, k) {\n  // write your code here\n}\n',
      solution: `function findKthPositive(arr, k) {
  let lo = 0, hi = arr.length;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] - (mid + 1) < k) lo = mid + 1;
    else hi = mid;
  }
  return lo + k;
}
`,
    },
    tests: [
      { args: [[2, 3, 4, 7, 11], 5], expect: 9 },
      { args: [[1, 2, 3, 4], 2], expect: 6 },
      { args: [[5], 1], expect: 1 },
      { args: [[5], 5], expect: 6 },
      { args: [[1, 3], 1], expect: 2 },
      { args: [[2, 4, 6, 8], 3], expect: 5 },
    ],
  },
  {
    id: 'bs-first-last-position',
    title: 'First and Last Position of an Element',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'TCS'],
    statement: "Given a sorted array `nums` (duplicates allowed) and a `target`, return `[first, last]`: the first and last index where `target` occurs. Return `[-1, -1]` if it does not occur. Use O(log n) time.",
    examples: [
      { input: 'nums = [5, 7, 7, 8, 8, 10], target = 8', output: '[3, 4]' },
      { input: 'nums = [5, 7, 7, 8, 8, 10], target = 6', output: '[-1, -1]' },
    ],
    constraints: ['0 <= nums.length <= 10^5', 'nums is sorted ascending'],
    hints: ['Find the lower bound (first index >= target) and the upper bound (first index > target).', 'last = upper bound - 1.'],
    approach: "Run two binary searches. The lower bound finds the first index whose value is >= target, and the upper bound finds the first index whose value is > target. If the lower bound is out of range or its value is not the target, the target is absent. Otherwise the answer is [lower, upper - 1]. Each search is O(log n). Finding one occurrence and then scanning left and right is O(n) in the worst case, for example when every element equals the target.",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'search_range', js: 'searchRange' },
    py: {
      starter: 'def search_range(nums, target):\n    # write your code here\n    pass\n',
      solution: `def search_range(nums, target):
    def bound(strict):
        lo, hi = 0, len(nums)
        while lo < hi:
            mid = (lo + hi) // 2
            if nums[mid] < target or (strict and nums[mid] == target):
                lo = mid + 1
            else:
                hi = mid
        return lo
    first = bound(False)
    if first == len(nums) or nums[first] != target:
        return [-1, -1]
    return [first, bound(True) - 1]
`,
    },
    js: {
      starter: 'function searchRange(nums, target) {\n  // write your code here\n}\n',
      solution: `function searchRange(nums, target) {
  const bound = strict => {
    let lo = 0, hi = nums.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (nums[mid] < target || (strict && nums[mid] === target)) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  };
  const first = bound(false);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, bound(true) - 1];
}
`,
    },
    tests: [
      { args: [[5, 7, 7, 8, 8, 10], 8], expect: [3, 4] },
      { args: [[5, 7, 7, 8, 8, 10], 6], expect: [-1, -1] },
      { args: [[], 0], expect: [-1, -1] },
      { args: [[2, 2, 2, 2], 2], expect: [0, 3] },
      { args: [[1], 1], expect: [0, 0] },
      { args: [[1, 2, 3], 3], expect: [2, 2] },
      { args: [[1, 3, 3, 5], 4], expect: [-1, -1] },
    ],
  },
  {
    id: 'bs-search-rotated-array',
    title: 'Search in Rotated Sorted Array',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: "A sorted array of **distinct** integers was rotated at an unknown pivot (for example `[0, 1, 2, 4, 5, 6, 7]` might become `[4, 5, 6, 7, 0, 1, 2]`). Given the rotated array `nums` and a `target`, return the index of `target`, or `-1` if absent. Use O(log n) time.",
    examples: [
      { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 0', output: '4' },
      { input: 'nums = [4, 5, 6, 7, 0, 1, 2], target = 3', output: '-1' },
    ],
    constraints: ['1 <= nums.length <= 5000', 'All values are distinct', 'nums is a rotated ascending array'],
    hints: ['At any mid, at least one half (left or right) is properly sorted.', 'Check whether the target lies in the sorted half; if yes go there, otherwise go to the other half.'],
    approach: "At every step of binary search, one of the two halves around mid is sorted. If nums[lo] <= nums[mid], the left half is sorted: if the target lies between nums[lo] and nums[mid], search left, otherwise search right. If instead the right half is sorted, check whether the target lies between nums[mid] and nums[hi] and choose accordingly. Every step still halves the range, so the search is O(log n). Finding the pivot first and then running a normal binary search is an equally valid two-pass approach. A linear scan is O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'search_rotated', js: 'searchRotated' },
    py: {
      starter: 'def search_rotated(nums, target):\n    # write your code here\n    pass\n',
      solution: `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1
`,
    },
    js: {
      starter: 'function searchRotated(nums, target) {\n  // write your code here\n}\n',
      solution: `function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] === target) return mid;
    if (nums[lo] <= nums[mid]) {
      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[4, 5, 6, 7, 0, 1, 2], 0], expect: 4 },
      { args: [[4, 5, 6, 7, 0, 1, 2], 3], expect: -1 },
      { args: [[1], 0], expect: -1 },
      { args: [[1], 1], expect: 0 },
      { args: [[3, 1], 1], expect: 1 },
      { args: [[6, 7, 1, 2, 3, 4, 5], 6], expect: 0 },
      { args: [[1, 2, 3, 4, 5], 4], expect: 3 },
    ],
  },
  {
    id: 'bs-find-min-rotated',
    title: 'Minimum in Rotated Sorted Array',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Infosys', 'Google'],
    statement: "A sorted array of **distinct** integers has been rotated between 1 and n times. Given the rotated array `nums`, return its **minimum** element in O(log n) time.",
    examples: [
      { input: 'nums = [3, 4, 5, 1, 2]', output: '1' },
      { input: 'nums = [11, 13, 15, 17]', output: '11', explain: 'Rotated n times, so it is sorted again.' },
    ],
    constraints: ['1 <= nums.length <= 5000', 'All values are distinct'],
    hints: ['Compare nums[mid] with nums[hi].', 'If nums[mid] > nums[hi], the minimum is to the right of mid; otherwise it is at mid or to its left.'],
    approach: "Compare the middle element with the last element of the current range. If nums[mid] > nums[hi], the rotation point (the minimum) must be strictly to the right of mid, so set lo = mid + 1. Otherwise the range from mid to hi is sorted, and the minimum is at mid or to its left, so set hi = mid. When lo meets hi, it points at the minimum. Comparing with nums[hi] rather than nums[lo] makes the unrotated case work without special handling. A linear scan for the minimum is O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'find_min', js: 'findMin' },
    py: {
      starter: 'def find_min(nums):\n    # write your code here\n    pass\n',
      solution: `def find_min(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]
`,
    },
    js: {
      starter: 'function findMin(nums) {\n  // write your code here\n}\n',
      solution: `function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else hi = mid;
  }
  return nums[lo];
}
`,
    },
    tests: [
      { args: [[3, 4, 5, 1, 2]], expect: 1 },
      { args: [[11, 13, 15, 17]], expect: 11 },
      { args: [[4, 5, 6, 7, 0, 1, 2]], expect: 0 },
      { args: [[9]], expect: 9 },
      { args: [[2, 1]], expect: 1 },
      { args: [[5, 6, 7, 8, 9, -3]], expect: -3 },
    ],
  },
  {
    id: 'bs-peak-mountain-array',
    title: 'Peak Index in a Mountain Array',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "A mountain array strictly increases up to a single peak and then strictly decreases. Given a mountain array `arr` (length at least 3), return the **index of the peak** in O(log n) time.",
    examples: [
      { input: 'arr = [0, 2, 5, 3, 1]', output: '2' },
      { input: 'arr = [1, 4, 3]', output: '1' },
    ],
    constraints: ['3 <= arr.length <= 10^5', 'arr is guaranteed to be a mountain'],
    hints: ['Compare arr[mid] with arr[mid + 1].', 'If arr[mid] < arr[mid + 1] you are on the rising slope, so the peak is to the right.'],
    approach: "Look at mid and its right neighbour. If arr[mid] < arr[mid+1], mid is on the increasing slope, so the peak is strictly to the right: lo = mid + 1. Otherwise mid is on the decreasing slope or is the peak itself, so hi = mid. The range keeps containing the peak and halves each time, and when lo equals hi it is the peak. Scanning for the maximum is O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'peak_index', js: 'peakIndex' },
    py: {
      starter: 'def peak_index(arr):\n    # write your code here\n    pass\n',
      solution: `def peak_index(arr):
    lo, hi = 0, len(arr) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < arr[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo
`,
    },
    js: {
      starter: 'function peakIndex(arr) {\n  // write your code here\n}\n',
      solution: `function peakIndex(arr) {
  let lo = 0, hi = arr.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (arr[mid] < arr[mid + 1]) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[0, 2, 5, 3, 1]], expect: 2 },
      { args: [[1, 4, 3]], expect: 1 },
      { args: [[0, 10, 5, 2]], expect: 1 },
      { args: [[1, 2, 3, 4, 5, 0]], expect: 4 },
      { args: [[3, 5, 3, 2, 0]], expect: 1 },
      { args: [[-5, -1, 2, 8, 9, 7, -4]], expect: 4 },
    ],
  },
  {
    id: 'bs-search-2d-matrix',
    title: 'Search a 2D Matrix',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Infosys', 'Flipkart'],
    statement: "An `m x n` matrix has each row sorted ascending, and the first value of each row is greater than the last value of the previous row. Given the matrix and a `target`, return `true` if the target is present. Use O(log(m * n)) time.",
    examples: [
      { input: 'matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 3', output: 'true' },
      { input: 'matrix = [[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], target = 13', output: 'false' },
    ],
    constraints: ['1 <= m, n <= 100', '-10^4 <= values, target <= 10^4'],
    hints: ['Read row by row, the matrix is one sorted list of m * n values.', 'Index k maps to row k // n and column k % n.'],
    approach: "Because each row continues where the previous one ended, reading the matrix row by row gives one sorted list of length m*n. Run a normal binary search over virtual indices 0..m*n-1, converting index k to matrix[k // n][k % n]. This needs no extra memory and takes O(log(m*n)) steps. Binary searching the correct row first and then searching inside it has the same complexity. A full scan of the matrix is O(m*n).",
    complexity: 'Time O(log(m * n)), Space O(1)',
    fn: { py: 'search_matrix', js: 'searchMatrix' },
    py: {
      starter: 'def search_matrix(matrix, target):\n    # write your code here\n    pass\n',
      solution: `def search_matrix(matrix, target):
    m, n = len(matrix), len(matrix[0])
    lo, hi = 0, m * n - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        v = matrix[mid // n][mid % n]
        if v == target:
            return True
        if v < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return False
`,
    },
    js: {
      starter: 'function searchMatrix(matrix, target) {\n  // write your code here\n}\n',
      solution: `function searchMatrix(matrix, target) {
  const m = matrix.length, n = matrix[0].length;
  let lo = 0, hi = m * n - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    const v = matrix[Math.floor(mid / n)][mid % n];
    if (v === target) return true;
    if (v < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}
`,
    },
    tests: [
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 3], expect: true },
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 13], expect: false },
      { args: [[[1]], 1], expect: true },
      { args: [[[1]], 2], expect: false },
      { args: [[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]], 60], expect: true },
      { args: [[[1], [3], [5]], 4], expect: false },
    ],
  },
  {
    id: 'bs-koko-eating-bananas',
    title: 'Koko Eating Bananas',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Google', 'Amazon', 'Flipkart', 'Microsoft'],
    statement: "There are `piles` of bananas and Koko has `h` hours. Each hour she picks one pile and eats up to `k` bananas from it (if the pile has fewer, she finishes it and waits for the hour to end). Return the **minimum integer speed `k`** that lets her eat all bananas within `h` hours. It is guaranteed that `h >= piles.length`.",
    examples: [
      { input: 'piles = [3, 6, 7, 11], h = 8', output: '4' },
      { input: 'piles = [30, 11, 23, 4, 20], h = 5', output: '30' },
    ],
    constraints: ['1 <= piles.length <= 10^4', 'piles.length <= h <= 10^9', '1 <= piles[i] <= 10^9'],
    hints: ['At speed k, the time is the sum of ceil(pile / k).', 'If speed k works, any faster speed works too: binary search on k in [1, max(piles)].'],
    approach: "For a given speed k, the hours needed are the sum over piles of ceil(pile / k). This time never increases as k grows, so the set of speeds that finish within h hours is a range [answer, infinity). Binary search k between 1 and max(piles): if speed mid fits within h hours, it is a candidate and we try smaller speeds (hi = mid); otherwise we need a faster speed (lo = mid + 1). Each check is O(n), giving O(n log max). Trying every speed from 1 upward is O(n * max(piles)), far too slow.",
    complexity: 'Time O(n log max(piles)), Space O(1)',
    fn: { py: 'min_eating_speed', js: 'minEatingSpeed' },
    py: {
      starter: 'def min_eating_speed(piles, h):\n    # write your code here\n    pass\n',
      solution: `def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        hours = sum((p + mid - 1) // mid for p in piles)
        if hours <= h:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
    },
    js: {
      starter: 'function minEatingSpeed(piles, h) {\n  // write your code here\n}\n',
      solution: `function minEatingSpeed(piles, h) {
  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    let hours = 0;
    for (const p of piles) hours += Math.ceil(p / mid);
    if (hours <= h) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[3, 6, 7, 11], 8], expect: 4 },
      { args: [[30, 11, 23, 4, 20], 5], expect: 30 },
      { args: [[30, 11, 23, 4, 20], 6], expect: 23 },
      { args: [[1], 1], expect: 1 },
      { args: [[10], 3], expect: 4 },
      { args: [[1000000000], 2], expect: 500000000 },
    ],
  },
  {
    id: 'bs-ship-capacity',
    title: 'Capacity to Ship Packages Within D Days',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Flipkart', 'Google'],
    statement: "Packages with weights `weights` must be shipped **in the given order** within `days` days. Each day the ship is loaded with consecutive packages up to its capacity. Return the **minimum ship capacity** that ships everything within `days` days.",
    examples: [
      { input: 'weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], days = 5', output: '15', explain: '[1-5], [6,7], [8], [9], [10].' },
      { input: 'weights = [3, 2, 2, 4, 1, 4], days = 3', output: '6' },
    ],
    constraints: ['1 <= days <= weights.length <= 5 * 10^4', '1 <= weights[i] <= 500'],
    hints: ['The capacity must be at least max(weights) and at most sum(weights).', 'For a capacity, greedily count days needed; binary search the smallest capacity that fits.'],
    approach: "For a fixed capacity, the fewest days needed is found greedily: load packages in order and start a new day whenever the next package would overflow. A bigger capacity never needs more days, so feasibility is monotonic and we can binary search the capacity between max(weights) (the heaviest package must fit) and sum(weights) (everything in one day). If a capacity fits within the given days, try smaller; otherwise try larger. Each feasibility check is O(n), giving O(n log(sum)). Trying every capacity in that range linearly would be O(n * sum).",
    complexity: 'Time O(n log(sum of weights)), Space O(1)',
    fn: { py: 'ship_within_days', js: 'shipWithinDays' },
    py: {
      starter: 'def ship_within_days(weights, days):\n    # write your code here\n    pass\n',
      solution: `def ship_within_days(weights, days):
    def need(cap):
        d, load = 1, 0
        for w in weights:
            if load + w > cap:
                d += 1
                load = 0
            load += w
        return d
    lo, hi = max(weights), sum(weights)
    while lo < hi:
        mid = (lo + hi) // 2
        if need(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
    },
    js: {
      starter: 'function shipWithinDays(weights, days) {\n  // write your code here\n}\n',
      solution: `function shipWithinDays(weights, days) {
  const need = cap => {
    let d = 1, load = 0;
    for (const w of weights) {
      if (load + w > cap) { d++; load = 0; }
      load += w;
    }
    return d;
  };
  let lo = Math.max(...weights), hi = weights.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (need(mid) <= days) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9, 10], 5], expect: 15 },
      { args: [[3, 2, 2, 4, 1, 4], 3], expect: 6 },
      { args: [[1, 2, 3, 1, 1], 4], expect: 3 },
      { args: [[7], 1], expect: 7 },
      { args: [[5, 5, 5, 5], 4], expect: 5 },
      { args: [[5, 5, 5, 5], 1], expect: 20 },
    ],
  },
  {
    id: 'bs-single-element-sorted',
    title: 'Single Element in a Sorted Array',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Google'],
    statement: "In a sorted array `nums`, every element appears exactly **twice** except one that appears once. Return the single element in O(log n) time and O(1) space.",
    examples: [
      { input: 'nums = [1, 1, 2, 3, 3, 4, 4, 8, 8]', output: '2' },
      { input: 'nums = [3, 3, 7, 7, 10, 11, 11]', output: '10' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums.length is odd'],
    hints: ['Before the single element, pairs start at even indices; after it, at odd indices.', 'Make mid even and compare nums[mid] with nums[mid + 1].'],
    approach: "Before the single element, every pair occupies indices (even, odd). After it, the pattern shifts to (odd, even). Binary search over the array, forcing mid to be even (subtract one if it is odd). If nums[mid] == nums[mid+1], the pairing is still intact up to mid, so the single element is to the right: lo = mid + 2. Otherwise the shift has already happened at or before mid: hi = mid. When lo equals hi it points at the single element. XOR of all elements also finds it, but in O(n).",
    complexity: 'Time O(log n), Space O(1)',
    fn: { py: 'single_non_duplicate', js: 'singleNonDuplicate' },
    py: {
      starter: 'def single_non_duplicate(nums):\n    # write your code here\n    pass\n',
      solution: `def single_non_duplicate(nums):
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if mid % 2 == 1:
            mid -= 1
        if nums[mid] == nums[mid + 1]:
            lo = mid + 2
        else:
            hi = mid
    return nums[lo]
`,
    },
    js: {
      starter: 'function singleNonDuplicate(nums) {\n  // write your code here\n}\n',
      solution: `function singleNonDuplicate(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo < hi) {
    let mid = (lo + hi) >> 1;
    if (mid % 2 === 1) mid--;
    if (nums[mid] === nums[mid + 1]) lo = mid + 2;
    else hi = mid;
  }
  return nums[lo];
}
`,
    },
    tests: [
      { args: [[1, 1, 2, 3, 3, 4, 4, 8, 8]], expect: 2 },
      { args: [[3, 3, 7, 7, 10, 11, 11]], expect: 10 },
      { args: [[5]], expect: 5 },
      { args: [[1, 2, 2]], expect: 1 },
      { args: [[1, 1, 2]], expect: 2 },
      { args: [[0, 0, 1, 1, 2, 2, 3, 3, 9]], expect: 9 },
    ],
  },
  {
    id: 'bs-min-days-bouquets',
    title: 'Minimum Days to Make Bouquets',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "`bloomDay[i]` is the day flower `i` blooms. A bouquet needs `k` **adjacent** bloomed flowers, and each flower can be used once. Return the **minimum number of days** to wait so that you can make `m` bouquets, or `-1` if it is impossible.",
    examples: [
      { input: 'bloomDay = [1, 10, 3, 10, 2], m = 3, k = 1', output: '3' },
      { input: 'bloomDay = [7, 7, 7, 7, 12, 7, 7], m = 2, k = 3', output: '12' },
      { input: 'bloomDay = [1, 10, 3, 10, 2], m = 3, k = 2', output: '-1', explain: 'Needs 6 flowers but only 5 exist.' },
    ],
    constraints: ['1 <= bloomDay.length <= 10^5', '1 <= bloomDay[i] <= 10^9', '1 <= m <= 10^6', '1 <= k <= bloomDay.length'],
    hints: ['If m * k > n, return -1 right away.', 'Waiting longer never hurts: binary search the day between min and max bloomDay.'],
    approach: "If m*k is more than the number of flowers, it is impossible. Otherwise, for a given day d we can count bouquets greedily: walk the flowers, extend a run of bloomed flowers (bloomDay <= d), and every time the run reaches k, count a bouquet and reset the run. More days only make more flowers bloom, so feasibility is monotonic in d. Binary search d between min and max of bloomDay for the smallest day that yields at least m bouquets. Each check is O(n), so the total is O(n log(max day)). Trying every day one by one could take up to 10^9 checks.",
    complexity: 'Time O(n log(max bloomDay)), Space O(1)',
    fn: { py: 'min_days', js: 'minDays' },
    py: {
      starter: 'def min_days(bloomDay, m, k):\n    # write your code here\n    pass\n',
      solution: `def min_days(bloomDay, m, k):
    if m * k > len(bloomDay):
        return -1

    def bouquets(day):
        count = run = 0
        for b in bloomDay:
            if b <= day:
                run += 1
                if run == k:
                    count += 1
                    run = 0
            else:
                run = 0
        return count

    lo, hi = min(bloomDay), max(bloomDay)
    while lo < hi:
        mid = (lo + hi) // 2
        if bouquets(mid) >= m:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
    },
    js: {
      starter: 'function minDays(bloomDay, m, k) {\n  // write your code here\n}\n',
      solution: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1;
  const bouquets = day => {
    let count = 0, run = 0;
    for (const b of bloomDay) {
      if (b <= day) { run++; if (run === k) { count++; run = 0; } }
      else run = 0;
    }
    return count;
  };
  let lo = Math.min(...bloomDay), hi = Math.max(...bloomDay);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (bouquets(mid) >= m) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[1, 10, 3, 10, 2], 3, 1], expect: 3 },
      { args: [[7, 7, 7, 7, 12, 7, 7], 2, 3], expect: 12 },
      { args: [[1, 10, 3, 10, 2], 3, 2], expect: -1 },
      { args: [[5], 1, 1], expect: 5 },
      { args: [[1, 2, 3, 4, 5, 6], 2, 3], expect: 6 },
      { args: [[9, 1, 1, 9, 1, 1], 2, 2], expect: 1 },
    ],
  },
  {
    id: 'bs-aggressive-cows',
    title: 'Aggressive Cows',
    diff: 'Medium',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Flipkart', 'Microsoft', 'TCS'],
    statement: "Stalls are located at positions `stalls` (distinct integers, not necessarily sorted). Place `k` cows in different stalls so that the **minimum distance** between any two cows is as **large** as possible. Return that largest possible minimum distance.",
    examples: [
      { input: 'stalls = [1, 2, 4, 8, 9], k = 3', output: '3', explain: 'Cows at 1, 4 and 8 (or 9).' },
      { input: 'stalls = [10, 1, 2, 7, 5], k = 3', output: '4', explain: 'Cows at 1, 5 and 10.' },
    ],
    constraints: ['2 <= k <= stalls.length <= 10^5', '0 <= stalls[i] <= 10^9'],
    hints: ['Sort the stalls. For a distance d, greedily place cows left to right whenever the gap from the last cow is >= d.', 'If distance d is achievable, every smaller distance is too: binary search the largest d.'],
    approach: "Sort the positions. To test whether a minimum distance d is achievable, place the first cow in the first stall and walk right, placing the next cow in the first stall that is at least d away from the previous cow; this greedy places as many cows as possible. If it places at least k cows, d is feasible. Feasibility is monotonic (if d works, any smaller d works), so binary search the largest feasible d between 1 and (last - first). Each check is O(n), so the total is O(n log n + n log(range)). Trying every distance one by one would be O(n * range).",
    complexity: 'Time O(n log n + n log(range)), Space O(1) extra besides sorting',
    fn: { py: 'aggressive_cows', js: 'aggressiveCows' },
    py: {
      starter: 'def aggressive_cows(stalls, k):\n    # write your code here\n    pass\n',
      solution: `def aggressive_cows(stalls, k):
    s = sorted(stalls)

    def can(d):
        count, last = 1, s[0]
        for x in s[1:]:
            if x - last >= d:
                count += 1
                last = x
                if count >= k:
                    return True
        return count >= k

    lo, hi, ans = 1, s[-1] - s[0], 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if can(mid):
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans
`,
    },
    js: {
      starter: 'function aggressiveCows(stalls, k) {\n  // write your code here\n}\n',
      solution: `function aggressiveCows(stalls, k) {
  const s = stalls.slice().sort((a, b) => a - b);
  const can = d => {
    let count = 1, last = s[0];
    for (let i = 1; i < s.length; i++) {
      if (s[i] - last >= d) { count++; last = s[i]; if (count >= k) return true; }
    }
    return count >= k;
  };
  let lo = 1, hi = s[s.length - 1] - s[0], ans = 0;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (can(mid)) { ans = mid; lo = mid + 1; }
    else hi = mid - 1;
  }
  return ans;
}
`,
    },
    tests: [
      { args: [[1, 2, 4, 8, 9], 3], expect: 3 },
      { args: [[10, 1, 2, 7, 5], 3], expect: 4 },
      { args: [[1, 2], 2], expect: 1 },
      { args: [[0, 100], 2], expect: 100 },
      { args: [[1, 2, 3, 4, 5], 5], expect: 1 },
      { args: [[0, 3, 4, 7, 10, 9], 4], expect: 3 },
    ],
  },
  {
    id: 'bs-median-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    diff: 'Hard',
    pattern: 'Binary Search',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given two sorted arrays `a` and `b` (not both empty), return the **median** of all their elements combined. If the total count is even, the median is the average of the two middle values (it may end in .5). Aim for O(log(min(n, m))).",
    examples: [
      { input: 'a = [1, 3], b = [2]', output: '2' },
      { input: 'a = [1, 2], b = [3, 4]', output: '2.5' },
    ],
    constraints: ['0 <= a.length, b.length <= 1000', '1 <= a.length + b.length', '-10^6 <= values <= 10^6'],
    hints: ['Partition both arrays so the left parts together hold half of the elements.', 'Binary search the cut in the smaller array; the cut in the other array is then fixed. Check maxLeft <= minRight on both sides.'],
    approach: "Make a the shorter array. We choose i elements from a and j = (n + m + 1) / 2 - i elements from b to form the left half of the merged order. The cut is correct when a[i-1] <= b[j] and b[j-1] <= a[i] (treating out-of-range values as minus or plus infinity). Binary search i in [0, n]: if a[i-1] > b[j], take fewer from a; if b[j-1] > a[i], take more. Once correct, the median is max of the left sides for an odd total, or the average of that and the min of the right sides for an even total. This costs O(log(min(n, m))). Merging both arrays and picking the middle is simpler but O(n + m).",
    complexity: 'Time O(log(min(n, m))), Space O(1)',
    fn: { py: 'find_median_sorted_arrays', js: 'findMedianSortedArrays' },
    py: {
      starter: 'def find_median_sorted_arrays(a, b):\n    # write your code here\n    pass\n',
      solution: `def find_median_sorted_arrays(a, b):
    if len(a) > len(b):
        a, b = b, a
    n, m = len(a), len(b)
    half = (n + m + 1) // 2
    lo, hi = 0, n
    inf = float('inf')
    while lo <= hi:
        i = (lo + hi) // 2
        j = half - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < n else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < m else inf
        if a_left > b_right:
            hi = i - 1
        elif b_left > a_right:
            lo = i + 1
        else:
            left_max = max(a_left, b_left)
            if (n + m) % 2 == 1:
                return left_max
            right_min = min(a_right, b_right)
            mid = (left_max + right_min) / 2
            return int(mid) if mid == int(mid) else mid
    return 0
`,
    },
    js: {
      starter: 'function findMedianSortedArrays(a, b) {\n  // write your code here\n}\n',
      solution: `function findMedianSortedArrays(a, b) {
  if (a.length > b.length) [a, b] = [b, a];
  const n = a.length, m = b.length, half = Math.floor((n + m + 1) / 2);
  let lo = 0, hi = n;
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2), j = half - i;
    const aLeft = i > 0 ? a[i - 1] : -Infinity;
    const aRight = i < n ? a[i] : Infinity;
    const bLeft = j > 0 ? b[j - 1] : -Infinity;
    const bRight = j < m ? b[j] : Infinity;
    if (aLeft > bRight) hi = i - 1;
    else if (bLeft > aRight) lo = i + 1;
    else {
      const leftMax = Math.max(aLeft, bLeft);
      if ((n + m) % 2 === 1) return leftMax;
      return (leftMax + Math.min(aRight, bRight)) / 2;
    }
  }
  return 0;
}
`,
    },
    tests: [
      { args: [[1, 3], [2]], expect: 2 },
      { args: [[1, 2], [3, 4]], expect: 2.5 },
      { args: [[], [5]], expect: 5 },
      { args: [[2], []], expect: 2 },
      { args: [[1, 2, 3], [4, 5, 6, 7]], expect: 4 },
      { args: [[-5, 0, 6], [-1, 2]], expect: 0 },
      { args: [[1, 1], [1, 2]], expect: 1 },
    ],
  },
  {
    id: 'bs-split-array-largest-sum',
    title: 'Split Array Largest Sum (Book Allocation)',
    diff: 'Hard',
    pattern: 'Binary Search',
    companies: ['Amazon', 'Google', 'Flipkart', 'Microsoft'],
    statement: "Split the array `nums` of non-negative integers into exactly `k` non-empty **contiguous** parts so that the **largest part sum** is as small as possible. Return that smallest possible largest sum. (This is the classic book allocation / painter's partition problem.)",
    examples: [
      { input: 'nums = [7, 2, 5, 10, 8], k = 2', output: '18', explain: '[7, 2, 5] and [10, 8].' },
      { input: 'nums = [12, 34, 67, 90], k = 2', output: '113', explain: '[12, 34, 67] and [90].' },
    ],
    constraints: ['1 <= k <= nums.length <= 1000', '0 <= nums[i] <= 10^6'],
    hints: ['The answer lies between max(nums) and sum(nums).', 'For a limit X, greedily count how many parts you need; binary search the smallest X needing <= k parts.'],
    approach: "Guess a limit X for the largest part sum. Greedily scan the array, starting a new part whenever adding the next element would exceed X; this gives the fewest parts possible under that limit. If at most k parts are needed, X is feasible (extra parts can always be created by splitting further, since there are at least k elements). Feasibility is monotonic in X, so binary search X between max(nums) and sum(nums) for the smallest feasible value. Each check is O(n). Dynamic programming over split points also works but costs O(k * n^2).",
    complexity: 'Time O(n log(sum)), Space O(1)',
    fn: { py: 'split_array', js: 'splitArray' },
    py: {
      starter: 'def split_array(nums, k):\n    # write your code here\n    pass\n',
      solution: `def split_array(nums, k):
    def parts(limit):
        count, cur = 1, 0
        for x in nums:
            if cur + x > limit:
                count += 1
                cur = 0
            cur += x
        return count
    lo, hi = max(nums), sum(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if parts(mid) <= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
    },
    js: {
      starter: 'function splitArray(nums, k) {\n  // write your code here\n}\n',
      solution: `function splitArray(nums, k) {
  const parts = limit => {
    let count = 1, cur = 0;
    for (const x of nums) {
      if (cur + x > limit) { count++; cur = 0; }
      cur += x;
    }
    return count;
  };
  let lo = Math.max(...nums), hi = nums.reduce((a, b) => a + b, 0);
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (parts(mid) <= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[7, 2, 5, 10, 8], 2], expect: 18 },
      { args: [[12, 34, 67, 90], 2], expect: 113 },
      { args: [[1, 2, 3, 4, 5], 2], expect: 9 },
      { args: [[1, 4, 4], 3], expect: 4 },
      { args: [[10], 1], expect: 10 },
      { args: [[5, 5, 5, 5], 1], expect: 20 },
      { args: [[10, 20, 30, 40], 2], expect: 60 },
    ],
  },
  {
    id: 'bs-kth-smallest-pair-distance',
    title: 'Kth Smallest Pair Distance',
    diff: 'Hard',
    pattern: 'Binary Search',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "The distance of a pair `(a, b)` is `|a - b|`. Given an integer array `nums` and an integer `k`, return the `k`-th smallest distance among all pairs `nums[i], nums[j]` with `i < j` (counting pairs with equal distances separately).",
    examples: [
      { input: 'nums = [1, 3, 1], k = 1', output: '0', explain: 'Distances: 2, 0, 2. The smallest is 0.' },
      { input: 'nums = [1, 6, 1], k = 3', output: '5' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '0 <= nums[i] <= 10^6', '1 <= k <= n * (n - 1) / 2'],
    hints: ['Binary search on the answer d in [0, max - min].', 'After sorting, count pairs with distance <= d using two pointers in O(n).'],
    approach: "Sort the array. For a candidate distance d, count pairs with distance at most d using two pointers: for each right index r, move left forward while nums[r] - nums[left] > d; then r - left pairs end at r with distance <= d. That count grows with d, so binary search the smallest d whose count is at least k; that d is the k-th smallest distance. Each count is O(n), so the total is O(n log n + n log(range)). Generating all n^2/2 distances and sorting them is O(n^2 log n), too slow for 10^4 elements.",
    complexity: 'Time O(n log n + n log(max - min)), Space O(1) extra',
    fn: { py: 'smallest_distance_pair', js: 'smallestDistancePair' },
    py: {
      starter: 'def smallest_distance_pair(nums, k):\n    # write your code here\n    pass\n',
      solution: `def smallest_distance_pair(nums, k):
    a = sorted(nums)

    def count(d):
        c = left = 0
        for r in range(len(a)):
            while a[r] - a[left] > d:
                left += 1
            c += r - left
        return c

    lo, hi = 0, a[-1] - a[0]
    while lo < hi:
        mid = (lo + hi) // 2
        if count(mid) >= k:
            hi = mid
        else:
            lo = mid + 1
    return lo
`,
    },
    js: {
      starter: 'function smallestDistancePair(nums, k) {\n  // write your code here\n}\n',
      solution: `function smallestDistancePair(nums, k) {
  const a = nums.slice().sort((x, y) => x - y);
  const count = d => {
    let c = 0, left = 0;
    for (let r = 0; r < a.length; r++) {
      while (a[r] - a[left] > d) left++;
      c += r - left;
    }
    return c;
  };
  let lo = 0, hi = a[a.length - 1] - a[0];
  while (lo < hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (count(mid) >= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}
`,
    },
    tests: [
      { args: [[1, 3, 1], 1], expect: 0 },
      { args: [[1, 6, 1], 3], expect: 5 },
      { args: [[1, 1, 1], 2], expect: 0 },
      { args: [[1, 6, 1], 2], expect: 5 },
      { args: [[4, 1], 1], expect: 3 },
      { args: [[1, 2, 4, 7], 4], expect: 3 },
      { args: [[9, 10, 7, 10, 6, 1, 5, 4, 9, 8], 18], expect: 2 },
    ],
  },
  {
    id: 'bs-kth-element-two-sorted',
    title: 'Kth Element of Two Sorted Arrays',
    diff: 'Hard',
    pattern: 'Binary Search',
    companies: ['Microsoft', 'Amazon', 'Flipkart'],
    statement: "Given two sorted arrays `a` and `b` and an integer `k` (1-based), return the element that would be at position `k` if both arrays were merged into one sorted array. Aim for O(log(min(n, m))).",
    examples: [
      { input: 'a = [2, 3, 6, 7, 9], b = [1, 4, 8, 10], k = 5', output: '6', explain: 'Merged: 1, 2, 3, 4, 6, 7, 8, 9, 10.' },
      { input: 'a = [100, 112, 256, 349, 770], b = [72, 86, 113, 119, 265, 445, 892], k = 7', output: '256' },
    ],
    constraints: ['1 <= n, m <= 10^5', '1 <= k <= n + m'],
    hints: ['Take i elements from a and k - i from b as the first k merged elements.', 'Binary search i within [max(0, k - m), min(k, n)] using the same cross-check as the median problem.'],
    approach: "The first k merged elements consist of i elements from a and k - i from b for some i. Make a the shorter array and binary search i in the range [max(0, k - m), min(k, n)]. For a given i, let j = k - i; the split is correct when a[i-1] <= b[j] and b[j-1] <= a[i] (out-of-range values count as minus or plus infinity). If a[i-1] > b[j], take fewer from a; if b[j-1] > a[i], take more. At the correct split, the answer is max(a[i-1], b[j-1]). This is O(log(min(n, m))). Merging up to k elements with two pointers is simpler but O(k).",
    complexity: 'Time O(log(min(n, m))), Space O(1)',
    fn: { py: 'kth_element', js: 'kthElement' },
    py: {
      starter: 'def kth_element(a, b, k):\n    # write your code here\n    pass\n',
      solution: `def kth_element(a, b, k):
    if len(a) > len(b):
        a, b = b, a
    n, m = len(a), len(b)
    inf = float('inf')
    lo, hi = max(0, k - m), min(k, n)
    while lo <= hi:
        i = (lo + hi) // 2
        j = k - i
        a_left = a[i - 1] if i > 0 else -inf
        a_right = a[i] if i < n else inf
        b_left = b[j - 1] if j > 0 else -inf
        b_right = b[j] if j < m else inf
        if a_left > b_right:
            hi = i - 1
        elif b_left > a_right:
            lo = i + 1
        else:
            return max(a_left, b_left)
    return -1
`,
    },
    js: {
      starter: 'function kthElement(a, b, k) {\n  // write your code here\n}\n',
      solution: `function kthElement(a, b, k) {
  if (a.length > b.length) [a, b] = [b, a];
  const n = a.length, m = b.length;
  let lo = Math.max(0, k - m), hi = Math.min(k, n);
  while (lo <= hi) {
    const i = Math.floor((lo + hi) / 2), j = k - i;
    const aLeft = i > 0 ? a[i - 1] : -Infinity;
    const aRight = i < n ? a[i] : Infinity;
    const bLeft = j > 0 ? b[j - 1] : -Infinity;
    const bRight = j < m ? b[j] : Infinity;
    if (aLeft > bRight) hi = i - 1;
    else if (bLeft > aRight) lo = i + 1;
    else return Math.max(aLeft, bLeft);
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[2, 3, 6, 7, 9], [1, 4, 8, 10], 5], expect: 6 },
      { args: [[100, 112, 256, 349, 770], [72, 86, 113, 119, 265, 445, 892], 7], expect: 256 },
      { args: [[1], [2], 1], expect: 1 },
      { args: [[1], [2], 2], expect: 2 },
      { args: [[1, 2, 3], [4, 5, 6], 6], expect: 6 },
      { args: [[5, 5], [5, 5, 5], 4], expect: 5 },
      { args: [[10, 20, 30], [1, 2, 3, 4, 5, 6, 7], 8], expect: 10 },
    ],
  },
];
