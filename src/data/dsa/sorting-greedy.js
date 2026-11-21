export default [
  {
    id: 'sg-merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['TCS', 'Infosys', 'Wipro', 'Microsoft'],
    statement: "Given two arrays `a` and `b`, each already sorted in non-decreasing order, return one array containing all of their elements in non-decreasing order. Do it in a single pass instead of sorting again.",
    examples: [
      { input: 'a = [1, 3, 5], b = [2, 4, 6]', output: '[1, 2, 3, 4, 5, 6]' },
      { input: 'a = [], b = [1, 2]', output: '[1, 2]' },
    ],
    constraints: ['0 <= a.length, b.length <= 10^5', '-10^9 <= a[i], b[i] <= 10^9'],
    hints: ['The smallest remaining element is always at the front of a or at the front of b.', 'Use one pointer per array; when one array runs out, copy the rest of the other.'],
    approach: "Keep a pointer `i` into `a` and `j` into `b`. At each step compare `a[i]` and `b[j]`, append the smaller one to the result and advance that pointer. When one array is exhausted, every remaining element of the other array is at least as large as everything taken so far, so append them all. Each element is moved exactly once, giving linear time. This is the merge step of merge sort. Concatenating and sorting costs O((m + n) log(m + n)) and ignores the fact that the inputs are already sorted.",
    complexity: 'Time O(m + n), Space O(m + n) for the output',
    fn: { py: 'merge_sorted', js: 'mergeSorted' },
    py: {
      starter: 'def merge_sorted(a, b):\n    # write your code here\n    pass\n',
      solution: `def merge_sorted(a, b):
    i = j = 0
    res = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i])
            i += 1
        else:
            res.append(b[j])
            j += 1
    res.extend(a[i:])
    res.extend(b[j:])
    return res
`,
    },
    js: {
      starter: 'function mergeSorted(a, b) {\n  // write your code here\n}\n',
      solution: `function mergeSorted(a, b) {
  let i = 0, j = 0;
  const res = [];
  while (i < a.length && j < b.length) {
    if (a[i] <= b[j]) res.push(a[i++]);
    else res.push(b[j++]);
  }
  while (i < a.length) res.push(a[i++]);
  while (j < b.length) res.push(b[j++]);
  return res;
}
`,
    },
    tests: [
      { args: [[1, 3, 5], [2, 4, 6]], expect: [1, 2, 3, 4, 5, 6] },
      { args: [[], [1, 2]], expect: [1, 2] },
      { args: [[], []], expect: [] },
      { args: [[1, 1, 2], [1, 3]], expect: [1, 1, 1, 2, 3] },
      { args: [[-5, 0, 10], [-6, 20]], expect: [-6, -5, 0, 10, 20] },
      { args: [[4, 5, 6], [1, 2, 3]], expect: [1, 2, 3, 4, 5, 6] },
    ],
  },
  {
    id: 'sg-assign-cookies',
    title: 'Assign Cookies',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Accenture', 'Cognizant'],
    statement: "Each child `i` has a greed factor `g[i]`: they are happy only with a cookie of size at least `g[i]`. Each cookie `j` has size `s[j]`, and each child can get at most one cookie. Return the maximum number of children you can make happy.",
    examples: [
      { input: 'g = [1, 2, 3], s = [1, 1]', output: '1', explain: 'Both cookies have size 1, so only the child with greed 1 can be satisfied.' },
      { input: 'g = [5, 1, 3], s = [2, 4, 6, 1]', output: '3' },
    ],
    constraints: ['1 <= g.length <= 3 * 10^4', '0 <= s.length <= 3 * 10^4', '1 <= g[i], s[j] <= 2^31 - 1'],
    hints: ['Sort both arrays.', 'Give each cookie, smallest first, to the least greedy child it can satisfy.'],
    approach: "Sort the children by greed and the cookies by size. Walk through the cookies from smallest to largest with a pointer `child` on the least greedy unsatisfied child. If the current cookie is large enough for that child, give it and move to the next child; otherwise the cookie is too small for every remaining child, so skip it. Using the smallest cookie that works never hurts, because a larger cookie could always replace it later. The answer is the number of satisfied children. Sorting dominates the cost. Trying every assignment is exponential.",
    complexity: 'Time O(n log n + m log m), Space O(1) besides sorting',
    fn: { py: 'find_content_children', js: 'findContentChildren' },
    py: {
      starter: 'def find_content_children(g, s):\n    # write your code here\n    pass\n',
      solution: `def find_content_children(g, s):
    g.sort()
    s.sort()
    child = 0
    for size in s:
        if child < len(g) and size >= g[child]:
            child += 1
    return child
`,
    },
    js: {
      starter: 'function findContentChildren(g, s) {\n  // write your code here\n}\n',
      solution: `function findContentChildren(g, s) {
  g.sort((x, y) => x - y);
  s.sort((x, y) => x - y);
  let child = 0;
  for (const size of s) {
    if (child < g.length && size >= g[child]) child++;
  }
  return child;
}
`,
    },
    tests: [
      { args: [[1, 2, 3], [1, 1]], expect: 1 },
      { args: [[1, 2], [1, 2, 3]], expect: 2 },
      { args: [[10, 9, 8, 7], [5, 6, 7, 8]], expect: 2 },
      { args: [[1, 2, 3], []], expect: 0 },
      { args: [[2, 2, 2], [1, 1, 1]], expect: 0 },
      { args: [[1, 1, 1], [1, 1, 1]], expect: 3 },
      { args: [[5, 1, 3], [2, 4, 6, 1]], expect: 3 },
    ],
  },
  {
    id: 'sg-lemonade-change',
    title: 'Lemonade Change',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Infosys', 'Capgemini'],
    statement: "A lemonade costs 5. Customers stand in a queue and each pays with one bill of 5, 10 or 20, given in order in `bills`. You start with no money and must give every customer the exact change. Return `true` if you can serve everyone, otherwise `false`.",
    examples: [
      { input: 'bills = [5, 5, 5, 10, 20]', output: 'true' },
      { input: 'bills = [5, 5, 10, 10, 20]', output: 'false', explain: 'The last customer needs 15 back but you only have two 10s.' },
    ],
    constraints: ['1 <= bills.length <= 10^5', 'bills[i] is 5, 10 or 20'],
    hints: ['Only the counts of 5 and 10 bills matter; 20s are never given back.', 'For a 20, prefer to return one 10 and one 5, because 5s are more useful later.'],
    approach: "Track how many 5 and 10 bills you hold. A 5 needs no change, so just count it. A 10 needs one 5 back; fail if you have none. A 20 needs 15 back: give a 10 and a 5 if possible, otherwise three 5s, and fail if neither works. Giving the 10 first is the greedy choice because 5s can pay change for both 10s and 20s while 10s can only help with 20s. One pass over the queue decides the answer.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'lemonade_change', js: 'lemonadeChange' },
    py: {
      starter: 'def lemonade_change(bills):\n    # write your code here\n    pass\n',
      solution: `def lemonade_change(bills):
    five = ten = 0
    for b in bills:
        if b == 5:
            five += 1
        elif b == 10:
            if five == 0:
                return False
            five -= 1
            ten += 1
        else:
            if ten > 0 and five > 0:
                ten -= 1
                five -= 1
            elif five >= 3:
                five -= 3
            else:
                return False
    return True
`,
    },
    js: {
      starter: 'function lemonadeChange(bills) {\n  // write your code here\n}\n',
      solution: `function lemonadeChange(bills) {
  let five = 0, ten = 0;
  for (const b of bills) {
    if (b === 5) five++;
    else if (b === 10) {
      if (five === 0) return false;
      five--; ten++;
    } else if (ten > 0 && five > 0) { ten--; five--; }
    else if (five >= 3) five -= 3;
    else return false;
  }
  return true;
}
`,
    },
    tests: [
      { args: [[5, 5, 5, 10, 20]], expect: true },
      { args: [[5, 5, 10, 10, 20]], expect: false },
      { args: [[10]], expect: false },
      { args: [[5, 5, 10]], expect: true },
      { args: [[5, 5, 5, 20]], expect: true },
      { args: [[5, 10, 5, 20]], expect: true },
      { args: [[5, 20]], expect: false },
    ],
  },
  {
    id: 'sg-minimum-currency-notes',
    title: 'Minimum Currency Notes',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['TCS', 'Wipro', 'Accenture', 'Cognizant'],
    statement: "An ATM has unlimited notes and coins of the Indian denominations `2000, 500, 200, 100, 50, 20, 10, 5, 2, 1`. Given an `amount`, return the minimum number of notes and coins needed to pay it exactly.",
    examples: [
      { input: 'amount = 2786', output: '8', explain: '2000 + 500 + 200 + 50 + 20 + 10 + 5 + 1.' },
      { input: 'amount = 3', output: '2', explain: '2 + 1.' },
    ],
    constraints: ['0 <= amount <= 10^9'],
    hints: ['For this particular set of denominations, always using the largest note that fits is optimal.', 'Use division instead of subtracting one note at a time.'],
    approach: "Go through the denominations from largest to smallest. For each one, use as many notes as fit: add `amount // note` to the count and set `amount = amount % note`. For the Indian currency system (like most real currencies) this greedy choice is optimal, because each denomination is large compared to the combinations of smaller ones that could replace it. Note that greedy is not optimal for arbitrary coin sets, for example {1, 3, 4} and amount 6; then dynamic programming is needed. With ten denominations the work is constant.",
    complexity: 'Time O(1) (10 denominations), Space O(1)',
    fn: { py: 'min_notes', js: 'minNotes' },
    py: {
      starter: 'def min_notes(amount):\n    # write your code here\n    pass\n',
      solution: `def min_notes(amount):
    count = 0
    for note in (2000, 500, 200, 100, 50, 20, 10, 5, 2, 1):
        count += amount // note
        amount %= note
    return count
`,
    },
    js: {
      starter: 'function minNotes(amount) {\n  // write your code here\n}\n',
      solution: `function minNotes(amount) {
  let count = 0;
  for (const note of [2000, 500, 200, 100, 50, 20, 10, 5, 2, 1]) {
    count += Math.floor(amount / note);
    amount %= note;
  }
  return count;
}
`,
    },
    tests: [
      { args: [0], expect: 0 },
      { args: [1], expect: 1 },
      { args: [2786], expect: 8 },
      { args: [3], expect: 2 },
      { args: [9999], expect: 15 },
      { args: [4000], expect: 2 },
      { args: [588], expect: 7 },
    ],
  },
  {
    id: 'sg-max-product-three',
    title: 'Maximum Product of Three Numbers',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Infosys', 'Intuit'],
    statement: "Given an integer array `nums` with at least three elements, choose three of them (different positions) so that their product is as large as possible, and return that product.",
    examples: [
      { input: 'nums = [1, 2, 3, 4]', output: '24' },
      { input: 'nums = [-10, -10, 1, 3, 2]', output: '300', explain: '(-10) * (-10) * 3.' },
    ],
    constraints: ['3 <= nums.length <= 10^4', '-1000 <= nums[i] <= 1000'],
    hints: ['After sorting, the answer uses either the three largest numbers or the two smallest and the largest.', 'You do not need a full sort: track the three largest and two smallest values in one pass.'],
    approach: "Two negative numbers multiply to a positive, so the best product is either the product of the three largest values or the product of the two smallest (most negative) values and the largest value. Sorting and checking both candidates takes O(n log n). We can do better by scanning once and keeping the top three maxima and the bottom two minima, updating them as each number arrives. Return the larger of the two candidate products. Trying all triples is O(n^3).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'maximum_product', js: 'maximumProduct' },
    py: {
      starter: 'def maximum_product(nums):\n    # write your code here\n    pass\n',
      solution: `def maximum_product(nums):
    inf = float('inf')
    max1 = max2 = max3 = -inf
    min1 = min2 = inf
    for x in nums:
        if x > max1:
            max1, max2, max3 = x, max1, max2
        elif x > max2:
            max2, max3 = x, max2
        elif x > max3:
            max3 = x
        if x < min1:
            min1, min2 = x, min1
        elif x < min2:
            min2 = x
    return max(max1 * max2 * max3, min1 * min2 * max1)
`,
    },
    js: {
      starter: 'function maximumProduct(nums) {\n  // write your code here\n}\n',
      solution: `function maximumProduct(nums) {
  let max1 = -Infinity, max2 = -Infinity, max3 = -Infinity;
  let min1 = Infinity, min2 = Infinity;
  for (const x of nums) {
    if (x > max1) { max3 = max2; max2 = max1; max1 = x; }
    else if (x > max2) { max3 = max2; max2 = x; }
    else if (x > max3) max3 = x;
    if (x < min1) { min2 = min1; min1 = x; }
    else if (x < min2) min2 = x;
  }
  return Math.max(max1 * max2 * max3, min1 * min2 * max1);
}
`,
    },
    tests: [
      { args: [[1, 2, 3]], expect: 6 },
      { args: [[1, 2, 3, 4]], expect: 24 },
      { args: [[-1, -2, -3]], expect: -6 },
      { args: [[-10, -10, 1, 3, 2]], expect: 300 },
      { args: [[-5, -4, 0, 1]], expect: 20 },
      { args: [[-100, -98, -1, 2, 3, 4]], expect: 39200 },
      { args: [[7, 7, 7, 7]], expect: 343 },
    ],
  },
  {
    id: 'sg-relative-sort-array',
    title: 'Relative Sort Array',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Google', 'Zoho'],
    statement: "You are given `arr1` and `arr2`, where the values of `arr2` are distinct. Reorder `arr1` so that values that appear in `arr2` come first, in the same order as in `arr2` (with all their copies together), followed by the remaining values of `arr1` in ascending order. Return the reordered array.",
    examples: [
      { input: 'arr1 = [28, 6, 22, 8, 44, 17], arr2 = [22, 28, 8, 6]', output: '[22, 28, 8, 6, 17, 44]' },
      { input: 'arr1 = [3, 3, 2, 2, 1], arr2 = [2, 3]', output: '[2, 2, 3, 3, 1]' },
    ],
    constraints: ['1 <= arr1.length <= 1000', '0 <= arr2.length <= 1000', '0 <= arr1[i], arr2[i] <= 1000', 'arr2 has distinct values'],
    hints: ['The values are small, so counting sort fits well.', 'Emit the values of arr2 first using their counts, then sweep the count array for the rest.'],
    approach: "Since all values are between 0 and 1000, count how many times each value occurs in `arr1`. Then walk through `arr2` and output each of its values as many times as it was counted, setting that count to zero. Finally sweep the count array from 0 to 1000 and output whatever remains, which gives the leftover values in ascending order. Everything is linear in the input size plus the value range. A comparison sort with a custom key (position in arr2, or 1000 + value) also works in O(n log n).",
    complexity: 'Time O(n + m + V) with V = 1001, Space O(V)',
    fn: { py: 'relative_sort_array', js: 'relativeSortArray' },
    py: {
      starter: 'def relative_sort_array(arr1, arr2):\n    # write your code here\n    pass\n',
      solution: `def relative_sort_array(arr1, arr2):
    count = [0] * 1001
    for x in arr1:
        count[x] += 1
    res = []
    for x in arr2:
        res.extend([x] * count[x])
        count[x] = 0
    for v in range(1001):
        if count[v]:
            res.extend([v] * count[v])
    return res
`,
    },
    js: {
      starter: 'function relativeSortArray(arr1, arr2) {\n  // write your code here\n}\n',
      solution: `function relativeSortArray(arr1, arr2) {
  const count = new Array(1001).fill(0);
  for (const x of arr1) count[x]++;
  const res = [];
  for (const x of arr2) {
    while (count[x] > 0) { res.push(x); count[x]--; }
  }
  for (let v = 0; v <= 1000; v++) {
    while (count[v] > 0) { res.push(v); count[v]--; }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19], [2, 1, 4, 3, 9, 6]], expect: [2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19] },
      { args: [[28, 6, 22, 8, 44, 17], [22, 28, 8, 6]], expect: [22, 28, 8, 6, 17, 44] },
      { args: [[5, 4, 3], []], expect: [3, 4, 5] },
      { args: [[1, 1, 1], [1]], expect: [1, 1, 1] },
      { args: [[9, 8, 7, 1], [7]], expect: [7, 1, 8, 9] },
      { args: [[3, 3, 2, 2, 1], [2, 3]], expect: [2, 2, 3, 3, 1] },
    ],
  },
  {
    id: 'sg-largest-perimeter-triangle',
    title: 'Largest Perimeter Triangle',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Cognizant', 'C3 IoT'],
    statement: "Given an array of positive side lengths `nums`, choose three of them that form a triangle with **non-zero area** and return the largest possible perimeter. If no three lengths can form such a triangle, return `0`.",
    examples: [
      { input: 'nums = [3, 6, 2, 3]', output: '8', explain: 'Sides 3, 3, 2 work; 6 is too long for any pair.' },
      { input: 'nums = [1, 2, 1, 10]', output: '0' },
    ],
    constraints: ['3 <= nums.length <= 10^4', '1 <= nums[i] <= 10^6'],
    hints: ['Three sides a <= b <= c form a triangle exactly when a + b > c.', 'Sort in descending order and check consecutive triples.'],
    approach: "For sides `a <= b <= c`, a triangle with positive area exists exactly when `a + b > c`. Sort the lengths in descending order. For each position `i`, treat `nums[i]` as the longest side; the best chance to satisfy the inequality is to pair it with the next two largest lengths `nums[i+1]` and `nums[i+2]`. The first triple that works gives the largest perimeter, because every later triple has smaller sides. If none works, return 0. Checking all triples is O(n^3).",
    complexity: 'Time O(n log n), Space O(1) besides sorting',
    fn: { py: 'largest_perimeter', js: 'largestPerimeter' },
    py: {
      starter: 'def largest_perimeter(nums):\n    # write your code here\n    pass\n',
      solution: `def largest_perimeter(nums):
    nums.sort(reverse=True)
    for i in range(len(nums) - 2):
        if nums[i + 1] + nums[i + 2] > nums[i]:
            return nums[i] + nums[i + 1] + nums[i + 2]
    return 0
`,
    },
    js: {
      starter: 'function largestPerimeter(nums) {\n  // write your code here\n}\n',
      solution: `function largestPerimeter(nums) {
  nums.sort((a, b) => b - a);
  for (let i = 0; i + 2 < nums.length; i++) {
    if (nums[i + 1] + nums[i + 2] > nums[i]) return nums[i] + nums[i + 1] + nums[i + 2];
  }
  return 0;
}
`,
    },
    tests: [
      { args: [[2, 1, 2]], expect: 5 },
      { args: [[1, 2, 1, 10]], expect: 0 },
      { args: [[3, 2, 3, 4]], expect: 10 },
      { args: [[3, 6, 2, 3]], expect: 8 },
      { args: [[1, 1, 1]], expect: 3 },
      { args: [[1, 2, 3]], expect: 0 },
      { args: [[10, 10, 10, 1, 100]], expect: 30 },
    ],
  },
  {
    id: 'sg-min-abs-difference-pairs',
    title: 'Pairs with Minimum Absolute Difference',
    diff: 'Easy',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Infosys', 'Audible'],
    statement: "Given an array of **distinct** integers `arr`, find the minimum absolute difference between any two elements, and return every pair `[a, b]` with `a < b` whose difference equals that minimum. Return the pairs in ascending order of `a`.",
    examples: [
      { input: 'arr = [4, 2, 1, 3]', output: '[[1, 2], [2, 3], [3, 4]]' },
      { input: 'arr = [1, 3, 6, 10, 15]', output: '[[1, 3]]' },
    ],
    constraints: ['2 <= arr.length <= 10^5', '-10^6 <= arr[i] <= 10^6', 'All values are distinct'],
    hints: ['After sorting, the closest pair is always made of neighbours.', 'One pass finds the minimum gap; a second pass collects the neighbours with that gap.'],
    approach: "Sort the array. In sorted order, the smallest difference between any two elements must occur between adjacent elements, since any non-adjacent pair has an adjacent pair inside it with a smaller or equal gap. Scan once to find the minimum adjacent difference. Scan again and collect each adjacent pair `[arr[i], arr[i+1]]` whose gap equals the minimum; they come out already in ascending order. Sorting dominates the running time. Comparing every pair is O(n^2).",
    complexity: 'Time O(n log n), Space O(1) besides the output',
    fn: { py: 'minimum_abs_difference', js: 'minimumAbsDifference' },
    py: {
      starter: 'def minimum_abs_difference(arr):\n    # write your code here\n    pass\n',
      solution: `def minimum_abs_difference(arr):
    arr.sort()
    best = min(arr[i + 1] - arr[i] for i in range(len(arr) - 1))
    return [[arr[i], arr[i + 1]] for i in range(len(arr) - 1) if arr[i + 1] - arr[i] == best]
`,
    },
    js: {
      starter: 'function minimumAbsDifference(arr) {\n  // write your code here\n}\n',
      solution: `function minimumAbsDifference(arr) {
  arr.sort((a, b) => a - b);
  let best = Infinity;
  for (let i = 0; i + 1 < arr.length; i++) best = Math.min(best, arr[i + 1] - arr[i]);
  const res = [];
  for (let i = 0; i + 1 < arr.length; i++) {
    if (arr[i + 1] - arr[i] === best) res.push([arr[i], arr[i + 1]]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[4, 2, 1, 3]], expect: [[1, 2], [2, 3], [3, 4]] },
      { args: [[1, 3, 6, 10, 15]], expect: [[1, 3]] },
      { args: [[3, 8, -10, 23, 19, -4, -14, 27]], expect: [[-14, -10], [19, 23], [23, 27]] },
      { args: [[5, 1]], expect: [[1, 5]] },
      { args: [[10, 0, -10, 5]], expect: [[0, 5], [5, 10]] },
      { args: [[100, 1]], expect: [[1, 100]] },
    ],
  },
  {
    id: 'sg-sort-colors',
    title: 'Sort 0s, 1s and 2s (Dutch National Flag)',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Flipkart'],
    statement: "Given an array `nums` containing only `0`, `1` and `2`, sort it in place so that all 0s come first, then all 1s, then all 2s, and return the array. Do it in a single pass without using a library sort.",
    examples: [
      { input: 'nums = [2, 0, 2, 1, 1, 0]', output: '[0, 0, 1, 1, 2, 2]' },
      { input: 'nums = [2, 0, 1]', output: '[0, 1, 2]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is 0, 1 or 2'],
    hints: ['Keep three regions: 0s at the front, 2s at the back and an unknown region in the middle.', 'Use pointers low, mid and high; look at nums[mid] and swap it into the right region.'],
    approach: "Maintain three pointers: everything before `low` is 0, everything after `high` is 2, and everything between `low` and `mid - 1` is 1. While `mid <= high`, inspect `nums[mid]`. If it is 0, swap it with `nums[low]` and advance both `low` and `mid`. If it is 1, just advance `mid`. If it is 2, swap it with `nums[high]` and move `high` left, but do not advance `mid` because the swapped-in value has not been examined yet. Each step shrinks the unknown region, so this is a single linear pass. Counting 0s, 1s and 2s and rewriting the array also works but needs two passes.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'sort_colors', js: 'sortColors' },
    py: {
      starter: 'def sort_colors(nums):\n    # write your code here\n    pass\n',
      solution: `def sort_colors(nums):
    low, mid, high = 0, 0, len(nums) - 1
    while mid <= high:
        if nums[mid] == 0:
            nums[low], nums[mid] = nums[mid], nums[low]
            low += 1
            mid += 1
        elif nums[mid] == 1:
            mid += 1
        else:
            nums[mid], nums[high] = nums[high], nums[mid]
            high -= 1
    return nums
`,
    },
    js: {
      starter: 'function sortColors(nums) {\n  // write your code here\n}\n',
      solution: `function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid <= high) {
    if (nums[mid] === 0) {
      [nums[low], nums[mid]] = [nums[mid], nums[low]];
      low++; mid++;
    } else if (nums[mid] === 1) mid++;
    else {
      [nums[mid], nums[high]] = [nums[high], nums[mid]];
      high--;
    }
  }
  return nums;
}
`,
    },
    tests: [
      { args: [[2, 0, 2, 1, 1, 0]], expect: [0, 0, 1, 1, 2, 2] },
      { args: [[2, 0, 1]], expect: [0, 1, 2] },
      { args: [[0]], expect: [0] },
      { args: [[1, 1]], expect: [1, 1] },
      { args: [[2, 2, 0, 0]], expect: [0, 0, 2, 2] },
      { args: [[1, 0, 2, 1, 0]], expect: [0, 0, 1, 1, 2] },
    ],
  },
  {
    id: 'sg-merge-intervals',
    title: 'Merge Overlapping Intervals',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Google', 'Infosys', 'Walmart'],
    statement: "Given a list of intervals `[start, end]`, merge every group of overlapping intervals (intervals that share at least one point, so `[1, 4]` and `[4, 5]` overlap) and return the merged intervals sorted by start.",
    examples: [
      { input: 'intervals = [[1, 3], [2, 6], [8, 10], [15, 18]]', output: '[[1, 6], [8, 10], [15, 18]]' },
      { input: 'intervals = [[1, 4], [4, 5]]', output: '[[1, 5]]' },
    ],
    constraints: ['1 <= intervals.length <= 10^4', '0 <= start <= end <= 10^4'],
    hints: ['Sort by start time so overlapping intervals become neighbours.', 'Compare each interval with the last merged one: extend it or start a new one.'],
    approach: "Sort the intervals by their start. Go through them in order while keeping a result list. If the result is empty or the current interval starts after the end of the last merged interval, it cannot overlap anything earlier, so append it. Otherwise it overlaps the last merged interval, so extend that interval's end to the maximum of both ends. After sorting, a single pass is enough because any interval that could overlap the current one has already been folded into the last merged interval. Comparing every pair repeatedly until nothing changes is O(n^2) or worse.",
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'merge_intervals', js: 'mergeIntervals' },
    py: {
      starter: 'def merge_intervals(intervals):\n    # write your code here\n    pass\n',
      solution: `def merge_intervals(intervals):
    intervals.sort(key=lambda x: x[0])
    res = []
    for s, e in intervals:
        if res and s <= res[-1][1]:
            res[-1][1] = max(res[-1][1], e)
        else:
            res.append([s, e])
    return res
`,
    },
    js: {
      starter: 'function mergeIntervals(intervals) {\n  // write your code here\n}\n',
      solution: `function mergeIntervals(intervals) {
  intervals.sort((a, b) => a[0] - b[0]);
  const res = [];
  for (const [s, e] of intervals) {
    if (res.length && s <= res[res.length - 1][1]) {
      res[res.length - 1][1] = Math.max(res[res.length - 1][1], e);
    } else res.push([s, e]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 3], [2, 6], [8, 10], [15, 18]]], expect: [[1, 6], [8, 10], [15, 18]] },
      { args: [[[1, 4], [4, 5]]], expect: [[1, 5]] },
      { args: [[[1, 4]]], expect: [[1, 4]] },
      { args: [[[5, 6], [1, 2]]], expect: [[1, 2], [5, 6]] },
      { args: [[[1, 10], [2, 3], [4, 5]]], expect: [[1, 10]] },
      { args: [[[2, 3], [4, 5], [6, 7], [8, 9], [1, 10]]], expect: [[1, 10]] },
      { args: [[[1, 4], [0, 0]]], expect: [[0, 0], [1, 4]] },
    ],
  },
  {
    id: 'sg-non-overlapping-intervals',
    title: 'Minimum Removals for Non-Overlapping Intervals',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Google', 'Facebook'],
    statement: "Given a list of intervals `[start, end]`, return the minimum number of intervals you must remove so that the remaining ones do not overlap. Intervals that only touch at an endpoint, like `[1, 2]` and `[2, 3]`, do **not** overlap.",
    examples: [
      { input: 'intervals = [[1, 2], [2, 3], [3, 4], [1, 3]]', output: '1', explain: 'Remove [1, 3].' },
      { input: 'intervals = [[1, 2], [1, 2], [1, 2]]', output: '2' },
    ],
    constraints: ['1 <= intervals.length <= 10^5', '-5 * 10^4 <= start < end <= 5 * 10^4'],
    hints: ['Removing the fewest is the same as keeping the most.', 'Sort by end time and keep an interval whenever it starts at or after the end of the last kept one.'],
    approach: "Minimising removals equals maximising the number of intervals we keep. Sort the intervals by end time. Keep the first one and remember its end. For every next interval, if it starts at or after the remembered end, keep it and update the end; otherwise it overlaps and must be removed. Choosing the interval that finishes earliest always leaves the most room for the rest, which is the classic activity-selection argument. The answer is the total minus the number kept. Trying all subsets is exponential.",
    complexity: 'Time O(n log n), Space O(1) besides sorting',
    fn: { py: 'erase_overlap_intervals', js: 'eraseOverlapIntervals' },
    py: {
      starter: 'def erase_overlap_intervals(intervals):\n    # write your code here\n    pass\n',
      solution: `def erase_overlap_intervals(intervals):
    intervals.sort(key=lambda x: x[1])
    kept = 0
    end = float('-inf')
    for s, e in intervals:
        if s >= end:
            kept += 1
            end = e
    return len(intervals) - kept
`,
    },
    js: {
      starter: 'function eraseOverlapIntervals(intervals) {\n  // write your code here\n}\n',
      solution: `function eraseOverlapIntervals(intervals) {
  intervals.sort((a, b) => a[1] - b[1]);
  let kept = 0, end = -Infinity;
  for (const [s, e] of intervals) {
    if (s >= end) { kept++; end = e; }
  }
  return intervals.length - kept;
}
`,
    },
    tests: [
      { args: [[[1, 2], [2, 3], [3, 4], [1, 3]]], expect: 1 },
      { args: [[[1, 2], [1, 2], [1, 2]]], expect: 2 },
      { args: [[[1, 2], [2, 3]]], expect: 0 },
      { args: [[[1, 100], [11, 22], [1, 11], [2, 12]]], expect: 2 },
      { args: [[[0, 2], [1, 3], [2, 4], [3, 5], [4, 6]]], expect: 2 },
      { args: [[[5, 6]]], expect: 0 },
    ],
  },
  {
    id: 'sg-max-meetings',
    title: 'Maximum Meetings in One Room',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['TCS', 'Infosys', 'Amazon', 'Flipkart'],
    statement: "There is one meeting room and `n` meetings. Meeting `i` starts at `start[i]` and ends at `end[i]`. A meeting can be held only if it starts **strictly after** the previous meeting in the room has ended. Return the maximum number of meetings that can be held.",
    examples: [
      { input: 'start = [1, 3, 0, 5, 8, 5], end = [2, 4, 6, 7, 9, 9]', output: '4', explain: 'Meetings (1,2), (3,4), (5,7) and (8,9).' },
      { input: 'start = [10, 12, 20], end = [20, 25, 30]', output: '1', explain: '(20,30) starts exactly when (10,20) ends, which is not allowed.' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= start[i] < end[i] <= 10^9'],
    hints: ['Pair each start with its end and sort by end time.', 'Pick a meeting whenever it starts after the end of the last picked meeting.'],
    approach: "This is the activity-selection problem. Pair up the start and end times and sort the meetings by end time. Pick the first meeting, remember its end, and walk through the rest: a meeting is picked when its start is strictly greater than the remembered end, and then the end is updated. Picking the meeting that ends first is always safe, because any optimal schedule can swap its first meeting for this one without conflicts. One pass after sorting gives the answer. Trying every subset of meetings is exponential.",
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'max_meetings', js: 'maxMeetings' },
    py: {
      starter: 'def max_meetings(start, end):\n    # write your code here\n    pass\n',
      solution: `def max_meetings(start, end):
    meetings = sorted(zip(start, end), key=lambda m: m[1])
    count = 0
    last = float('-inf')
    for s, e in meetings:
        if s > last:
            count += 1
            last = e
    return count
`,
    },
    js: {
      starter: 'function maxMeetings(start, end) {\n  // write your code here\n}\n',
      solution: `function maxMeetings(start, end) {
  const meetings = start.map((s, i) => [s, end[i]]).sort((a, b) => a[1] - b[1]);
  let count = 0, last = -Infinity;
  for (const [s, e] of meetings) {
    if (s > last) { count++; last = e; }
  }
  return count;
}
`,
    },
    tests: [
      { args: [[1, 3, 0, 5, 8, 5], [2, 4, 6, 7, 9, 9]], expect: 4 },
      { args: [[10, 12, 20], [20, 25, 30]], expect: 1 },
      { args: [[1, 2], [100, 99]], expect: 1 },
      { args: [[1], [2]], expect: 1 },
      { args: [[1, 3, 5, 7], [2, 4, 6, 8]], expect: 4 },
      { args: [[1, 1, 1], [5, 5, 5]], expect: 1 },
      { args: [[0, 6, 2], [5, 7, 4]], expect: 2 },
    ],
  },
  {
    id: 'sg-jump-game-ii',
    title: 'Minimum Jumps to Reach the End',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Microsoft', 'Adobe', 'Walmart'],
    statement: "You start at index 0 of the array `nums`. From index `i` you may jump forward by any distance from 1 up to `nums[i]`. Return the minimum number of jumps needed to reach the last index. The input guarantees that the last index is reachable.",
    examples: [
      { input: 'nums = [2, 3, 1, 1, 4]', output: '2', explain: 'Jump to index 1, then jump 3 steps to the end.' },
      { input: 'nums = [0]', output: '0', explain: 'You are already at the last index.' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '0 <= nums[i] <= 1000', 'The last index is reachable'],
    hints: ['Think in levels, like BFS: all indices reachable with k jumps form a contiguous range.', 'While scanning the current range, track the farthest index reachable with one more jump.'],
    approach: "Indices reachable with exactly `k` jumps form a contiguous window, so we can process them level by level without a queue. Keep `end`, the last index reachable with the current number of jumps, and `farthest`, the furthest index reachable with one more jump. Scan `i` from 0 to n - 2, updating `farthest = max(farthest, i + nums[i])`. When `i` reaches `end`, we must take another jump: increase the jump count and set `end = farthest`. Each index is visited once, giving linear time. A DP that computes the minimum jumps for each index by looking at every earlier index is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'min_jumps', js: 'minJumps' },
    py: {
      starter: 'def min_jumps(nums):\n    # write your code here\n    pass\n',
      solution: `def min_jumps(nums):
    jumps = end = farthest = 0
    for i in range(len(nums) - 1):
        farthest = max(farthest, i + nums[i])
        if i == end:
            jumps += 1
            end = farthest
    return jumps
`,
    },
    js: {
      starter: 'function minJumps(nums) {\n  // write your code here\n}\n',
      solution: `function minJumps(nums) {
  let jumps = 0, end = 0, farthest = 0;
  for (let i = 0; i < nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === end) { jumps++; end = farthest; }
  }
  return jumps;
}
`,
    },
    tests: [
      { args: [[2, 3, 1, 1, 4]], expect: 2 },
      { args: [[2, 3, 0, 1, 4]], expect: 2 },
      { args: [[0]], expect: 0 },
      { args: [[1, 1, 1, 1]], expect: 3 },
      { args: [[5, 1, 1, 1, 1]], expect: 1 },
      { args: [[1, 2]], expect: 1 },
      { args: [[2, 1, 1, 1, 1]], expect: 3 },
    ],
  },
  {
    id: 'sg-gas-station',
    title: 'Gas Station Circuit',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Google', 'Microsoft', 'Infosys'],
    statement: "There are `n` petrol pumps on a circular road. Pump `i` gives `gas[i]` litres, and driving from pump `i` to pump `i + 1` (pump `n - 1` goes back to pump 0) uses `cost[i]` litres. You start with an empty tank at some pump. Return the index of the starting pump from which you can drive one full circle, or `-1` if it is impossible. The answer is guaranteed to be unique if it exists.",
    examples: [
      { input: 'gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]', output: '3' },
      { input: 'gas = [2, 3, 4], cost = [3, 4, 3]', output: '-1', explain: 'Total gas 9 is less than total cost 10.' },
    ],
    constraints: ['1 <= n <= 10^5', '0 <= gas[i], cost[i] <= 10^4'],
    hints: ['If total gas is less than total cost, no start works.', 'If the tank goes negative between start s and pump i, no pump in s..i can be a valid start, so jump the start to i + 1.'],
    approach: "First, a full circle is possible only if the total gas is at least the total cost. Then scan the pumps once, keeping the tank level from the current candidate start. If the tank becomes negative at pump `i`, the trip from the candidate fails, and so would a trip starting from any pump between the candidate and `i`, because those starts would arrive at `i` with even less fuel. So set the candidate to `i + 1` and reset the tank. When the totals allow a circle, the final candidate is the answer. Simulating a circle from every start is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'can_complete_circuit', js: 'canCompleteCircuit' },
    py: {
      starter: 'def can_complete_circuit(gas, cost):\n    # write your code here\n    pass\n',
      solution: `def can_complete_circuit(gas, cost):
    if sum(gas) < sum(cost):
        return -1
    start = tank = 0
    for i in range(len(gas)):
        tank += gas[i] - cost[i]
        if tank < 0:
            start = i + 1
            tank = 0
    return start
`,
    },
    js: {
      starter: 'function canCompleteCircuit(gas, cost) {\n  // write your code here\n}\n',
      solution: `function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    total += gas[i] - cost[i];
    tank += gas[i] - cost[i];
    if (tank < 0) { start = i + 1; tank = 0; }
  }
  return total < 0 ? -1 : start;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5], [3, 4, 5, 1, 2]], expect: 3 },
      { args: [[2, 3, 4], [3, 4, 3]], expect: -1 },
      { args: [[5], [4]], expect: 0 },
      { args: [[3, 1, 1], [1, 2, 2]], expect: 0 },
      { args: [[1, 2], [2, 1]], expect: 1 },
      { args: [[4, 5, 2, 6, 5, 3], [3, 2, 7, 3, 2, 9]], expect: -1 },
      { args: [[5, 1, 2, 3, 4], [4, 4, 1, 5, 1]], expect: 4 },
    ],
  },
  {
    id: 'sg-minimum-platforms',
    title: 'Minimum Railway Platforms',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['TCS', 'Wipro', 'Amazon', 'Paytm'],
    statement: "Train `i` arrives at time `arr[i]` and departs at `dep[i]` (times are written as HHMM integers, for example `930` is 9:30, and every train departs on the same day it arrives). A platform can hold one train at a time. If a train arrives at the exact minute another train departs, they need **different** platforms. Return the minimum number of platforms needed so that no train waits.",
    examples: [
      { input: 'arr = [900, 940, 950, 1100, 1500, 1800], dep = [910, 1200, 1120, 1130, 1900, 2000]', output: '3', explain: 'Between 11:00 and 11:20 three trains are at the station.' },
      { input: 'arr = [1000, 1010], dep = [1010, 1020]', output: '2', explain: 'The second train arrives at the minute the first departs.' },
    ],
    constraints: ['1 <= n <= 5 * 10^4', '0 <= arr[i] <= dep[i] <= 2359'],
    hints: ['Only the order of arrival and departure events matters, not which train is which.', 'Sort arrivals and departures separately and sweep them with two pointers.'],
    approach: "Sort the arrival times and the departure times independently. Sweep through both lists like a merge. If the next arrival is at or before the next departure, a new train comes in before any platform is freed, so the number of occupied platforms goes up by one; otherwise a train leaves and the count goes down. Treating `arrival <= departure` as arrival-first implements the rule that equal times need separate platforms. The answer is the maximum count seen during the sweep. Checking for each train how many others overlap it is O(n^2).",
    complexity: 'Time O(n log n), Space O(1) besides sorting',
    fn: { py: 'min_platforms', js: 'minPlatforms' },
    py: {
      starter: 'def min_platforms(arr, dep):\n    # write your code here\n    pass\n',
      solution: `def min_platforms(arr, dep):
    arr = sorted(arr)
    dep = sorted(dep)
    i = j = 0
    cur = best = 0
    while i < len(arr):
        if arr[i] <= dep[j]:
            cur += 1
            best = max(best, cur)
            i += 1
        else:
            cur -= 1
            j += 1
    return best
`,
    },
    js: {
      starter: 'function minPlatforms(arr, dep) {\n  // write your code here\n}\n',
      solution: `function minPlatforms(arr, dep) {
  const a = [...arr].sort((x, y) => x - y);
  const d = [...dep].sort((x, y) => x - y);
  let i = 0, j = 0, cur = 0, best = 0;
  while (i < a.length) {
    if (a[i] <= d[j]) { cur++; best = Math.max(best, cur); i++; }
    else { cur--; j++; }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[900, 940, 950, 1100, 1500, 1800], [910, 1200, 1120, 1130, 1900, 2000]], expect: 3 },
      { args: [[900, 1100, 1235], [1000, 1200, 1240]], expect: 1 },
      { args: [[1000], [1030]], expect: 1 },
      { args: [[900, 900, 900], [910, 910, 910]], expect: 3 },
      { args: [[1000, 1010], [1010, 1020]], expect: 2 },
      { args: [[100, 200, 300, 400], [150, 250, 350, 450]], expect: 1 },
    ],
  },
  {
    id: 'sg-largest-number',
    title: 'Largest Number from Array',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Microsoft', 'Goldman Sachs', 'Zoho'],
    statement: "Given a list of non-negative integers `nums`, arrange them so that their concatenation forms the largest possible number, and return it as a string. If the result is all zeros, return `\"0\"`.",
    examples: [
      { input: 'nums = [3, 30, 34, 5, 9]', output: '"9534330"' },
      { input: 'nums = [0, 0]', output: '"0"' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 10^9'],
    hints: ['Sorting by numeric value or plain string order does not work (3 vs 30).', 'Put x before y exactly when x + y > y + x as strings.'],
    approach: "Convert the numbers to strings and sort them with a custom comparison: `x` should come before `y` when the string `x + y` is larger than `y + x`. For example `\"3\" + \"30\" = \"330\"` beats `\"303\"`, so 3 goes first. This comparison is transitive, so sorting with it gives the globally best order. Join the sorted strings; if the first character is '0', every number was zero and the answer is \"0\". With k-digit numbers each comparison costs O(k), giving O(n log n * k). Trying every permutation is O(n!).",
    complexity: 'Time O(n log n * k), Space O(n k)',
    fn: { py: 'largest_number', js: 'largestNumber' },
    py: {
      starter: 'def largest_number(nums):\n    # write your code here\n    pass\n',
      solution: `from functools import cmp_to_key

def largest_number(nums):
    strs = [str(x) for x in nums]

    def cmp(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(cmp))
    res = ''.join(strs)
    return '0' if res[0] == '0' else res
`,
    },
    js: {
      starter: 'function largestNumber(nums) {\n  // write your code here\n}\n',
      solution: `function largestNumber(nums) {
  const strs = nums.map(String);
  strs.sort((a, b) => {
    const ab = a + b, ba = b + a;
    return ab > ba ? -1 : ab < ba ? 1 : 0;
  });
  const res = strs.join('');
  return res[0] === '0' ? '0' : res;
}
`,
    },
    tests: [
      { args: [[10, 2]], expect: '210' },
      { args: [[3, 30, 34, 5, 9]], expect: '9534330' },
      { args: [[0, 0]], expect: '0' },
      { args: [[1]], expect: '1' },
      { args: [[121, 12]], expect: '12121' },
      { args: [[8, 89, 898]], expect: '898988' },
      { args: [[0, 9, 0]], expect: '900' },
      { args: [[432, 43243]], expect: '43243432' },
    ],
  },
  {
    id: 'sg-sort-by-frequency',
    title: 'Sort Elements by Frequency',
    diff: 'Medium',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Oracle', 'Zoho', 'Infosys'],
    statement: "Given an integer array `nums`, sort it so that values that occur more often come first. Values with the same frequency are ordered by value, **smallest first**. All copies of a value stay together. Return the sorted array.",
    examples: [
      { input: 'nums = [2, 5, 2, 8, 5, 6, 8, 8]', output: '[8, 8, 8, 2, 2, 5, 5, 6]', explain: '8 appears three times; 2 and 5 twice (2 is smaller); 6 once.' },
      { input: 'nums = [4, 6, 9, 4, 6]', output: '[4, 4, 6, 6, 9]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^5 <= nums[i] <= 10^5'],
    hints: ['Count the frequency of each value with a hash map.', 'Sort with the key (-frequency, value).'],
    approach: "Count how often each value occurs using a hash map. Then sort the array with a composite key: first by frequency in descending order, then by the value itself in ascending order. Because equal values share both parts of the key, they end up next to each other automatically. Counting is linear and the sort is O(n log n). Alternatively, sort the distinct values by the key and expand each one by its count, which sorts fewer items. Repeatedly scanning to find the most frequent remaining value would be O(n^2).",
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'frequency_sort', js: 'frequencySort' },
    py: {
      starter: 'def frequency_sort(nums):\n    # write your code here\n    pass\n',
      solution: `from collections import Counter

def frequency_sort(nums):
    freq = Counter(nums)
    res = []
    for v in sorted(freq, key=lambda x: (-freq[x], x)):
        res.extend([v] * freq[v])
    return res
`,
    },
    js: {
      starter: 'function frequencySort(nums) {\n  // write your code here\n}\n',
      solution: `function frequencySort(nums) {
  const freq = new Map();
  for (const x of nums) freq.set(x, (freq.get(x) || 0) + 1);
  const values = [...freq.keys()].sort((a, b) => freq.get(b) - freq.get(a) || a - b);
  const res = [];
  for (const v of values) for (let k = 0; k < freq.get(v); k++) res.push(v);
  return res;
}
`,
    },
    tests: [
      { args: [[2, 5, 2, 8, 5, 6, 8, 8]], expect: [8, 8, 8, 2, 2, 5, 5, 6] },
      { args: [[1]], expect: [1] },
      { args: [[4, 6, 9, 4, 6]], expect: [4, 4, 6, 6, 9] },
      { args: [[3, 3, 3, 1, 1, 2]], expect: [3, 3, 3, 1, 1, 2] },
      { args: [[-1, 1, -1, 1, 2]], expect: [-1, -1, 1, 1, 2] },
      { args: [[5, 4, 3, 2, 1]], expect: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'sg-candy-distribution',
    title: 'Candy Distribution',
    diff: 'Hard',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Uber'],
    statement: "Children stand in a line and child `i` has rating `ratings[i]`. Give candies so that every child gets at least one, and any child with a **higher rating than a neighbour** gets more candies than that neighbour. Return the minimum total number of candies.",
    examples: [
      { input: 'ratings = [1, 0, 2]', output: '5', explain: 'Give 2, 1, 2.' },
      { input: 'ratings = [1, 2, 2]', output: '4', explain: 'Give 1, 2, 1; equal neighbours have no constraint.' },
    ],
    constraints: ['1 <= ratings.length <= 2 * 10^4', '0 <= ratings[i] <= 2 * 10^4'],
    hints: ['Handle the left-neighbour rule and the right-neighbour rule separately.', 'Left to right: if rating rises, give one more than the left child. Right to left: same with the right child. Take the max of both.'],
    approach: "Split the requirement into two simpler ones. In a left-to-right pass, set `left[i] = left[i-1] + 1` when `ratings[i] > ratings[i-1]`, else 1; this satisfies every left neighbour. In a right-to-left pass, compute `right[i]` the same way against the right neighbour. Each child needs at least both values, so give `max(left[i], right[i])`, which satisfies both rules and is as small as possible because each pass gives the minimum for its own rule. Sum these to get the answer. The process can be done with one array by folding the second pass into the first. Repeatedly fixing violations until none remain can take O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'candy', js: 'candy' },
    py: {
      starter: 'def candy(ratings):\n    # write your code here\n    pass\n',
      solution: `def candy(ratings):
    n = len(ratings)
    give = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            give[i] = give[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            give[i] = max(give[i], give[i + 1] + 1)
    return sum(give)
`,
    },
    js: {
      starter: 'function candy(ratings) {\n  // write your code here\n}\n',
      solution: `function candy(ratings) {
  const n = ratings.length;
  const give = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) give[i] = give[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--) {
    if (ratings[i] > ratings[i + 1]) give[i] = Math.max(give[i], give[i + 1] + 1);
  }
  return give.reduce((a, b) => a + b, 0);
}
`,
    },
    tests: [
      { args: [[1, 0, 2]], expect: 5 },
      { args: [[1, 2, 2]], expect: 4 },
      { args: [[1]], expect: 1 },
      { args: [[1, 2, 3, 4, 5]], expect: 15 },
      { args: [[5, 4, 3, 2, 1]], expect: 15 },
      { args: [[1, 3, 2, 2, 1]], expect: 7 },
      { args: [[1, 2, 87, 87, 87, 2, 1]], expect: 13 },
    ],
  },
  {
    id: 'sg-count-inversions',
    title: 'Count Inversions',
    diff: 'Hard',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Myntra'],
    statement: "An **inversion** in an array `nums` is a pair of indices `i < j` with `nums[i] > nums[j]`. It measures how far the array is from being sorted. Return the number of inversions.",
    examples: [
      { input: 'nums = [2, 4, 1, 3, 5]', output: '3', explain: 'The pairs (2,1), (4,1) and (4,3).' },
      { input: 'nums = [5, 4, 3, 2, 1]', output: '10', explain: 'Every pair is inverted.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Modify merge sort.', 'While merging two sorted halves, when you take an element from the right half, every element still waiting in the left half forms an inversion with it.'],
    approach: "Use merge sort and count while merging. Split the array, recursively sort and count each half, then merge. During the merge, both halves are sorted. When the next smallest element comes from the right half, every element still remaining in the left half is larger than it and sits before it in the original array, so add the number of remaining left elements to the count. Taking from the left half on ties ensures equal values are not counted. The total is the inversions inside each half plus those across the halves, in O(n log n). Checking all pairs is O(n^2), too slow for 10^5 elements.",
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'count_inversions', js: 'countInversions' },
    py: {
      starter: 'def count_inversions(nums):\n    # write your code here\n    pass\n',
      solution: `def count_inversions(nums):
    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, x = sort(a[:mid])
        right, y = sort(a[mid:])
        merged = []
        count = x + y
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                count += len(left) - i
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, count

    return sort(nums)[1]
`,
    },
    js: {
      starter: 'function countInversions(nums) {\n  // write your code here\n}\n',
      solution: `function countInversions(nums) {
  const a = nums.slice();
  const tmp = new Array(a.length);
  function sort(lo, hi) {
    if (hi - lo <= 1) return 0;
    const mid = (lo + hi) >> 1;
    let count = sort(lo, mid) + sort(mid, hi);
    let i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
      if (a[i] <= a[j]) tmp[k++] = a[i++];
      else { tmp[k++] = a[j++]; count += mid - i; }
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    for (let t = lo; t < hi; t++) a[t] = tmp[t];
    return count;
  }
  return sort(0, a.length);
}
`,
    },
    tests: [
      { args: [[2, 4, 1, 3, 5]], expect: 3 },
      { args: [[1, 2, 3]], expect: 0 },
      { args: [[3, 2, 1]], expect: 3 },
      { args: [[5, 4, 3, 2, 1]], expect: 10 },
      { args: [[1]], expect: 0 },
      { args: [[2, 2, 2]], expect: 0 },
      { args: [[8, 4, 2, 1]], expect: 6 },
      { args: [[1, 20, 6, 4, 5]], expect: 5 },
    ],
  },
  {
    id: 'sg-ipo-max-capital',
    title: 'Maximise Capital (IPO)',
    diff: 'Hard',
    pattern: 'Sorting & Greedy',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "You start with capital `w` and may complete at most `k` distinct projects. Project `i` can be started only if your current capital is at least `capital[i]`; finishing it adds its pure profit `profits[i]` to your capital (the required capital is not spent). Return the maximum capital you can have after finishing at most `k` projects.",
    examples: [
      { input: 'k = 2, w = 0, profits = [1, 2, 3], capital = [0, 1, 1]', output: '4', explain: 'Do project 0 (capital becomes 1), then project 2 (capital becomes 4).' },
      { input: 'k = 1, w = 0, profits = [1, 2, 3], capital = [1, 1, 2]', output: '0', explain: 'No project is affordable.' },
    ],
    constraints: ['0 <= k <= 10^5', '0 <= w <= 10^9', '1 <= profits.length == capital.length <= 10^5', '0 <= profits[i] <= 10^4', '0 <= capital[i] <= 10^9'],
    hints: ['At each step, among the projects you can afford, the one with the largest profit is the best choice.', 'Sort projects by required capital and push newly affordable ones into a max-heap of profits.'],
    approach: "Capital never decreases, so the set of affordable projects only grows over time. Sort the projects by required capital. Repeat up to `k` times: push the profits of every project whose required capital is now at most `w` into a max-heap, then pop the largest profit and add it to `w`. If the heap is empty, no further project is affordable and we stop. Taking the largest available profit is optimal because it maximises capital for every later choice. Each project is pushed and popped at most once, so the work is O(n log n). Scanning all projects at every step to find the best affordable one is O(n k).",
    complexity: 'Time O(n log n + k log n), Space O(n)',
    fn: { py: 'find_maximized_capital', js: 'findMaximizedCapital' },
    py: {
      starter: 'def find_maximized_capital(k, w, profits, capital):\n    # write your code here\n    pass\n',
      solution: `import heapq

def find_maximized_capital(k, w, profits, capital):
    projects = sorted(zip(capital, profits))
    heap = []
    i = 0
    for _ in range(k):
        while i < len(projects) and projects[i][0] <= w:
            heapq.heappush(heap, -projects[i][1])
            i += 1
        if not heap:
            break
        w -= heapq.heappop(heap)
    return w
`,
    },
    js: {
      starter: 'function findMaximizedCapital(k, w, profits, capital) {\n  // write your code here\n}\n',
      solution: `function findMaximizedCapital(k, w, profits, capital) {
  const projects = capital.map((c, i) => [c, profits[i]]).sort((a, b) => a[0] - b[0]);
  const heap = [];
  const push = (v) => {
    heap.push(v);
    let i = heap.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (heap[p] >= heap[i]) break;
      [heap[p], heap[i]] = [heap[i], heap[p]];
      i = p;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length) {
      heap[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l < heap.length && heap[l] > heap[m]) m = l;
        if (r < heap.length && heap[r] > heap[m]) m = r;
        if (m === i) break;
        [heap[m], heap[i]] = [heap[i], heap[m]];
        i = m;
      }
    }
    return top;
  };
  let i = 0;
  for (let step = 0; step < k; step++) {
    while (i < projects.length && projects[i][0] <= w) push(projects[i++][1]);
    if (!heap.length) break;
    w += pop();
  }
  return w;
}
`,
    },
    tests: [
      { args: [2, 0, [1, 2, 3], [0, 1, 1]], expect: 4 },
      { args: [3, 0, [1, 2, 3], [0, 1, 2]], expect: 6 },
      { args: [1, 0, [1, 2, 3], [1, 1, 2]], expect: 0 },
      { args: [10, 0, [1, 2, 3], [0, 1, 2]], expect: 6 },
      { args: [2, 5, [1, 10, 3], [6, 0, 2]], expect: 18 },
      { args: [1, 2, [1, 2, 3], [1, 1, 2]], expect: 5 },
      { args: [0, 7, [5], [0]], expect: 7 },
    ],
  },
];
