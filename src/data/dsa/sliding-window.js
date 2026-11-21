export default [
  {
    id: 'sw-max-sum-subarray-k',
    title: 'Maximum Sum Subarray of Size K',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['TCS', 'Infosys', 'Wipro', 'Amazon'],
    statement: "Given an integer array `arr` and an integer `k`, return the **maximum sum** of any contiguous subarray of exactly `k` elements.",
    examples: [
      { input: 'arr = [2, 1, 5, 1, 3, 2], k = 3', output: '9', explain: '[5, 1, 3] sums to 9.' },
      { input: 'arr = [4, -1, 6], k = 1', output: '6' },
    ],
    constraints: ['1 <= k <= arr.length <= 10^5', '-10^4 <= arr[i] <= 10^4'],
    hints: ['Compute the sum of the first k elements.', 'Slide: add the new element on the right, subtract the one leaving on the left.'],
    approach: "Compute the sum of the first window of k elements. Then slide the window one step at a time: add the element entering on the right and subtract the element leaving on the left. Each slide is O(1), so all n-k+1 windows are evaluated in linear time, and we keep the largest sum. The brute force recomputes each window's sum from scratch, costing O(n*k).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'max_sum_k', js: 'maxSumK' },
    py: {
      starter: 'def max_sum_k(arr, k):\n    # write your code here\n    pass\n',
      solution: `def max_sum_k(arr, k):
    cur = sum(arr[:k])
    best = cur
    for i in range(k, len(arr)):
        cur += arr[i] - arr[i - k]
        best = max(best, cur)
    return best
`,
    },
    js: {
      starter: 'function maxSumK(arr, k) {\n  // write your code here\n}\n',
      solution: `function maxSumK(arr, k) {
  let cur = 0;
  for (let i = 0; i < k; i++) cur += arr[i];
  let best = cur;
  for (let i = k; i < arr.length; i++) {
    cur += arr[i] - arr[i - k];
    best = Math.max(best, cur);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[2, 1, 5, 1, 3, 2], 3], expect: 9 },
      { args: [[4, -1, 6], 1], expect: 6 },
      { args: [[5], 1], expect: 5 },
      { args: [[1, 2, 3], 3], expect: 6 },
      { args: [[-3, -2, -5, -1], 2], expect: -5 },
      { args: [[100, 200, 300, 400], 2], expect: 700 },
    ],
  },
  {
    id: 'sw-best-time-stock',
    title: 'Best Time to Buy and Sell Stock',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Accenture'],
    statement: "`prices[i]` is the price of a stock on day `i`. You may buy once and sell once on a **later** day. Return the maximum profit possible, or `0` if no profit can be made.",
    examples: [
      { input: 'prices = [7, 1, 5, 3, 6, 4]', output: '5', explain: 'Buy at 1, sell at 6.' },
      { input: 'prices = [9, 6, 4, 1]', output: '0' },
    ],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4'],
    hints: ['For each selling day, the best buying day is the cheapest day before it.', 'Track the minimum price so far.'],
    approach: "Think of a window whose left edge is the cheapest day seen so far and whose right edge is today. Scan the days left to right, keeping the minimum price so far. For each day, the best profit when selling today is price - minimum, so update the answer with it, then update the minimum. If prices only fall, every difference is non-positive and the answer stays 0. The brute force tries every buy/sell pair in O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'max_profit', js: 'maxProfit' },
    py: {
      starter: 'def max_profit(prices):\n    # write your code here\n    pass\n',
      solution: `def max_profit(prices):
    low = prices[0]
    best = 0
    for p in prices:
        best = max(best, p - low)
        low = min(low, p)
    return best
`,
    },
    js: {
      starter: 'function maxProfit(prices) {\n  // write your code here\n}\n',
      solution: `function maxProfit(prices) {
  let low = prices[0], best = 0;
  for (const p of prices) {
    best = Math.max(best, p - low);
    low = Math.min(low, p);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[7, 1, 5, 3, 6, 4]], expect: 5 },
      { args: [[9, 6, 4, 1]], expect: 0 },
      { args: [[5]], expect: 0 },
      { args: [[1, 2]], expect: 1 },
      { args: [[2, 4, 1, 7]], expect: 6 },
      { args: [[3, 3, 3]], expect: 0 },
    ],
  },
  {
    id: 'sw-contains-duplicate-ii',
    title: 'Nearby Duplicate Within K',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Infosys'],
    statement: "Given an integer array `nums` and an integer `k`, return `true` if there are two **different indices** `i` and `j` with `nums[i] == nums[j]` and `|i - j| <= k`. Otherwise return `false`.",
    examples: [
      { input: 'nums = [1, 2, 3, 1], k = 3', output: 'true' },
      { input: 'nums = [1, 2, 3, 1, 2, 3], k = 2', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '0 <= k <= 10^5'],
    hints: ['Keep a set of the last k values.', 'When the window grows beyond k, remove the oldest value.'],
    approach: "Maintain a set holding the values of the last k positions, which is a sliding window of size k. For each index i, if nums[i] is already in the set, a duplicate exists within distance k and we return true. Otherwise add it, and if the set now covers more than k positions, remove nums[i-k], which has moved out of range. If the scan ends, no close duplicate exists. Comparing each element with the next k elements costs O(n*k).",
    complexity: 'Time O(n), Space O(min(n, k))',
    fn: { py: 'contains_nearby_duplicate', js: 'containsNearbyDuplicate' },
    py: {
      starter: 'def contains_nearby_duplicate(nums, k):\n    # write your code here\n    pass\n',
      solution: `def contains_nearby_duplicate(nums, k):
    window = set()
    for i, x in enumerate(nums):
        if x in window:
            return True
        window.add(x)
        if len(window) > k:
            window.remove(nums[i - k])
    return False
`,
    },
    js: {
      starter: 'function containsNearbyDuplicate(nums, k) {\n  // write your code here\n}\n',
      solution: `function containsNearbyDuplicate(nums, k) {
  const window = new Set();
  for (let i = 0; i < nums.length; i++) {
    if (window.has(nums[i])) return true;
    window.add(nums[i]);
    if (window.size > k) window.delete(nums[i - k]);
  }
  return false;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 1], 3], expect: true },
      { args: [[1, 2, 3, 1, 2, 3], 2], expect: false },
      { args: [[1, 0, 1, 1], 1], expect: true },
      { args: [[5, 5], 0], expect: false },
      { args: [[7], 4], expect: false },
      { args: [[4, 1, 2, 4], 2], expect: false },
      { args: [[9, 8, 9], 2], expect: true },
    ],
  },
  {
    id: 'sw-first-negative-in-window',
    title: 'First Negative in Every Window',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'TCS', 'Flipkart'],
    statement: "Given an integer array `arr` and window size `k`, return a list with one entry per window of `k` consecutive elements (left to right): the **first negative number** in that window, or `0` if the window has no negative number.",
    examples: [
      { input: 'arr = [-8, 2, 3, -6, 10], k = 2', output: '[-8, 0, -6, -6]' },
      { input: 'arr = [12, -1, -7, 8, -15, 30, 16, 28], k = 3', output: '[-1, -1, -7, -15, -15, 0]' },
    ],
    constraints: ['1 <= k <= arr.length <= 10^5', '-10^5 <= arr[i] <= 10^5'],
    hints: ['Keep a queue of the indices of negative numbers inside the window.', 'Drop indices from the front once they fall out of the window.'],
    approach: "Keep a queue of indices of negative numbers in the current window, in order. When index i enters, push it if arr[i] is negative. Before recording the answer for the window ending at i, pop indices from the front that are less than i-k+1, since they have left the window. The front of the queue, if any, is the first negative in the window; otherwise the answer is 0. Each index is pushed and popped at most once. Scanning each window separately takes O(n*k).",
    complexity: 'Time O(n), Space O(k)',
    fn: { py: 'first_negatives', js: 'firstNegatives' },
    py: {
      starter: 'def first_negatives(arr, k):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def first_negatives(arr, k):
    q = deque()
    res = []
    for i, x in enumerate(arr):
        if x < 0:
            q.append(i)
        if i >= k - 1:
            while q and q[0] < i - k + 1:
                q.popleft()
            res.append(arr[q[0]] if q else 0)
    return res
`,
    },
    js: {
      starter: 'function firstNegatives(arr, k) {\n  // write your code here\n}\n',
      solution: `function firstNegatives(arr, k) {
  const q = [];
  let head = 0;
  const res = [];
  for (let i = 0; i < arr.length; i++) {
    if (arr[i] < 0) q.push(i);
    if (i >= k - 1) {
      while (head < q.length && q[head] < i - k + 1) head++;
      res.push(head < q.length ? arr[q[head]] : 0);
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[-8, 2, 3, -6, 10], 2], expect: [-8, 0, -6, -6] },
      { args: [[12, -1, -7, 8, -15, 30, 16, 28], 3], expect: [-1, -1, -7, -15, -15, 0] },
      { args: [[1, 2, 3], 1], expect: [0, 0, 0] },
      { args: [[-1, -2, -3], 3], expect: [-1] },
      { args: [[5, -4], 2], expect: [-4] },
      { args: [[-5, 1, 2, 3], 2], expect: [-5, 0, 0] },
    ],
  },
  {
    id: 'sw-min-recolors',
    title: 'Minimum Recolors for K Black Blocks',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['Google', 'Amazon', 'Accenture'],
    statement: "A string `blocks` contains only `'W'` (white) and `'B'` (black). In one operation you can recolour a white block to black. Return the **minimum number of operations** needed so that there is at least one run of `k` consecutive black blocks.",
    examples: [
      { input: 'blocks = "WBBWWBBWBW", k = 7', output: '3' },
      { input: 'blocks = "WBWBBBW", k = 2', output: '0' },
    ],
    constraints: ['1 <= k <= blocks.length <= 100'],
    hints: ['Every window of length k needs (number of W inside it) operations.', 'Slide a window of size k and track the count of W.'],
    approach: "For a fixed window of length k, the number of operations needed to make it all black is the number of white blocks inside it. So the answer is the minimum white count over all windows of length k. Count the whites in the first window, then slide one position at a time: add one if the entering block is white and subtract one if the leaving block is white. Track the minimum. Counting each window from scratch is O(n*k).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'minimum_recolors', js: 'minimumRecolors' },
    py: {
      starter: 'def minimum_recolors(blocks, k):\n    # write your code here\n    pass\n',
      solution: `def minimum_recolors(blocks, k):
    whites = blocks[:k].count('W')
    best = whites
    for i in range(k, len(blocks)):
        whites += (blocks[i] == 'W') - (blocks[i - k] == 'W')
        best = min(best, whites)
    return best
`,
    },
    js: {
      starter: 'function minimumRecolors(blocks, k) {\n  // write your code here\n}\n',
      solution: `function minimumRecolors(blocks, k) {
  let whites = 0;
  for (let i = 0; i < k; i++) if (blocks[i] === 'W') whites++;
  let best = whites;
  for (let i = k; i < blocks.length; i++) {
    if (blocks[i] === 'W') whites++;
    if (blocks[i - k] === 'W') whites--;
    best = Math.min(best, whites);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['WBBWWBBWBW', 7], expect: 3 },
      { args: ['WBWBBBW', 2], expect: 0 },
      { args: ['W', 1], expect: 1 },
      { args: ['B', 1], expect: 0 },
      { args: ['WWWW', 3], expect: 3 },
      { args: ['BWBWB', 5], expect: 2 },
    ],
  },
  {
    id: 'sw-good-substrings-size-three',
    title: 'Substrings of Size Three with Distinct Characters',
    diff: 'Easy',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Infosys', 'Wipro'],
    statement: "Given a string `s`, return how many substrings of **length 3** have three **distinct** characters. Overlapping substrings and repeated substrings are each counted.",
    examples: [
      { input: 's = "xyzzaz"', output: '1', explain: 'Windows: xyz, yzz, zza, zaz; only xyz is good.' },
      { input: 's = "aababcabc"', output: '4' },
    ],
    constraints: ['1 <= s.length <= 100', 's contains lowercase letters'],
    hints: ['Look at every window of size 3.', 'A window is good when its three characters are pairwise different.'],
    approach: "Slide a window of size 3 across the string. For each start index i from 0 to n-3, compare s[i], s[i+1] and s[i+2]; if all three are pairwise different, count it. The window size is fixed and tiny, so each check is O(1). For a general window size k you would instead maintain a frequency map while sliding and count windows where the number of distinct characters equals k. Strings shorter than 3 have no windows, so the answer is 0.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'count_good_substrings', js: 'countGoodSubstrings' },
    py: {
      starter: 'def count_good_substrings(s):\n    # write your code here\n    pass\n',
      solution: `def count_good_substrings(s):
    count = 0
    for i in range(len(s) - 2):
        a, b, c = s[i], s[i + 1], s[i + 2]
        if a != b and b != c and a != c:
            count += 1
    return count
`,
    },
    js: {
      starter: 'function countGoodSubstrings(s) {\n  // write your code here\n}\n',
      solution: `function countGoodSubstrings(s) {
  let count = 0;
  for (let i = 0; i + 2 < s.length; i++) {
    const a = s[i], b = s[i + 1], c = s[i + 2];
    if (a !== b && b !== c && a !== c) count++;
  }
  return count;
}
`,
    },
    tests: [
      { args: ['xyzzaz'], expect: 1 },
      { args: ['aababcabc'], expect: 4 },
      { args: ['ab'], expect: 0 },
      { args: ['abc'], expect: 1 },
      { args: ['aaaa'], expect: 0 },
      { args: ['abcabc'], expect: 4 },
    ],
  },
  {
    id: 'sw-longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Google'],
    statement: "Given a string `s`, return the length of the longest substring (contiguous) that contains **no repeated character**.",
    examples: [
      { input: 's = "abcabcbb"', output: '3', explain: '"abc"' },
      { input: 's = "pwwkew"', output: '3', explain: '"wke"; "pwke" is not contiguous.' },
    ],
    constraints: ['0 <= s.length <= 5 * 10^4', 's contains letters, digits, symbols and spaces'],
    hints: ['Grow a window to the right; shrink from the left when a repeat appears.', 'Store the last index of each character to jump the left edge directly.'],
    approach: "Keep a window [left, right] with no repeated characters and a map of the last index where each character was seen. Move right one step at a time. If the current character was last seen at an index at or after left, the window now has a repeat, so jump left to one past that index. Update the character's last index and the best length right - left + 1. Each character is processed once, so this is linear. The brute force checks every substring for uniqueness, which is O(n^2) or O(n^3).",
    complexity: 'Time O(n), Space O(min(n, charset))',
    fn: { py: 'length_of_longest_substring', js: 'lengthOfLongestSubstring' },
    py: {
      starter: 'def length_of_longest_substring(s):\n    # write your code here\n    pass\n',
      solution: `def length_of_longest_substring(s):
    last = {}
    left = best = 0
    for right, ch in enumerate(s):
        if ch in last and last[ch] >= left:
            left = last[ch] + 1
        last[ch] = right
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function lengthOfLongestSubstring(s) {\n  // write your code here\n}\n',
      solution: `function lengthOfLongestSubstring(s) {
  const last = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if (last.has(ch) && last.get(ch) >= left) left = last.get(ch) + 1;
    last.set(ch, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['abcabcbb'], expect: 3 },
      { args: ['pwwkew'], expect: 3 },
      { args: [''], expect: 0 },
      { args: ['bbbb'], expect: 1 },
      { args: ['abba'], expect: 2 },
      { args: ['dvdf'], expect: 3 },
      { args: ['a b c'], expect: 3 },
    ],
  },
  {
    id: 'sw-char-replacement',
    title: 'Longest Repeating Character Replacement',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given an uppercase string `s` and an integer `k`, you may change at most `k` characters to any other uppercase letter. Return the length of the longest substring that can be made of **one repeated letter**.",
    examples: [
      { input: 's = "ABAB", k = 2', output: '4' },
      { input: 's = "AABABBA", k = 1', output: '4', explain: 'Change the middle A of "BABB" to get "BBBB".' },
    ],
    constraints: ['1 <= s.length <= 10^5', '0 <= k <= s.length'],
    hints: ['A window is valid if (window length - count of its most frequent letter) <= k.', 'Expand right; shrink left by one when the window becomes invalid.'],
    approach: "A window can be turned into one letter if the number of characters that are not its most frequent letter is at most k. Expand the window to the right, updating letter counts and maxFreq, the highest count seen. If window length - maxFreq exceeds k, move left forward by one and decrement that letter's count. maxFreq never needs to decrease: the window only matters when it beats the best length, which requires a larger maxFreq anyway. The window size at the end (or the max seen) is the answer. Trying every substring and every target letter costs O(26 * n^2).",
    complexity: 'Time O(n), Space O(26)',
    fn: { py: 'character_replacement', js: 'characterReplacement' },
    py: {
      starter: 'def character_replacement(s, k):\n    # write your code here\n    pass\n',
      solution: `def character_replacement(s, k):
    count = {}
    left = max_freq = best = 0
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        max_freq = max(max_freq, count[ch])
        if right - left + 1 - max_freq > k:
            count[s[left]] -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function characterReplacement(s, k) {\n  // write your code here\n}\n',
      solution: `function characterReplacement(s, k) {
  const count = {};
  let left = 0, maxFreq = 0, best = 0;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    count[ch] = (count[ch] || 0) + 1;
    maxFreq = Math.max(maxFreq, count[ch]);
    if (right - left + 1 - maxFreq > k) { count[s[left]]--; left++; }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['ABAB', 2], expect: 4 },
      { args: ['AABABBA', 1], expect: 4 },
      { args: ['A', 0], expect: 1 },
      { args: ['ABCD', 0], expect: 1 },
      { args: ['AAAA', 2], expect: 4 },
      { args: ['ABBBCCB', 1], expect: 4 },
      { args: ['ABCDE', 2], expect: 3 },
    ],
  },
  {
    id: 'sw-permutation-in-string',
    title: 'Permutation in String',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Microsoft', 'Amazon', 'Flipkart'],
    statement: "Given lowercase strings `s1` and `s2`, return `true` if some **permutation** of `s1` appears as a contiguous substring of `s2`, otherwise `false`.",
    examples: [
      { input: 's1 = "ab", s2 = "eidbaooo"', output: 'true', explain: '"ba" is in s2.' },
      { input: 's1 = "ab", s2 = "eidboaoo"', output: 'false' },
    ],
    constraints: ['1 <= s1.length, s2.length <= 10^4', 'Lowercase letters only'],
    hints: ['A permutation of s1 has the same letter counts as s1.', 'Slide a window of length len(s1) over s2 and compare 26-letter counts.'],
    approach: "Two strings are permutations of each other when their letter counts are equal. Build the count array for s1 and for the first window of s2 of the same length. Slide the window across s2, adding the entering letter and removing the leaving letter, and compare the two count arrays after each step. Comparing 26 numbers is constant work, so the total is linear. Generating all permutations of s1 is factorial time, and sorting each window is O(n * m log m).",
    complexity: 'Time O(26 * n), Space O(26)',
    fn: { py: 'check_inclusion', js: 'checkInclusion' },
    py: {
      starter: 'def check_inclusion(s1, s2):\n    # write your code here\n    pass\n',
      solution: `def check_inclusion(s1, s2):
    m = len(s1)
    if m > len(s2):
        return False
    need = [0] * 26
    have = [0] * 26
    for ch in s1:
        need[ord(ch) - 97] += 1
    for i, ch in enumerate(s2):
        have[ord(ch) - 97] += 1
        if i >= m:
            have[ord(s2[i - m]) - 97] -= 1
        if have == need:
            return True
    return False
`,
    },
    js: {
      starter: 'function checkInclusion(s1, s2) {\n  // write your code here\n}\n',
      solution: `function checkInclusion(s1, s2) {
  const m = s1.length;
  if (m > s2.length) return false;
  const need = new Array(26).fill(0), have = new Array(26).fill(0);
  for (const ch of s1) need[ch.charCodeAt(0) - 97]++;
  for (let i = 0; i < s2.length; i++) {
    have[s2.charCodeAt(i) - 97]++;
    if (i >= m) have[s2.charCodeAt(i - m) - 97]--;
    if (need.every((v, j) => v === have[j])) return true;
  }
  return false;
}
`,
    },
    tests: [
      { args: ['ab', 'eidbaooo'], expect: true },
      { args: ['ab', 'eidboaoo'], expect: false },
      { args: ['abc', 'ab'], expect: false },
      { args: ['a', 'a'], expect: true },
      { args: ['adc', 'dcda'], expect: true },
      { args: ['aab', 'abbb'], expect: false },
      { args: ['xyz', 'zzyxz'], expect: true },
    ],
  },
  {
    id: 'sw-find-all-anagrams',
    title: 'Find All Anagrams in a String',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Microsoft', 'Google'],
    statement: "Given lowercase strings `s` and `p`, return the **start indices** (in increasing order) of every substring of `s` that is an anagram of `p`.",
    examples: [
      { input: 's = "cbaebabacd", p = "abc"', output: '[0, 6]' },
      { input: 's = "abab", p = "ab"', output: '[0, 1, 2]' },
    ],
    constraints: ['1 <= s.length, p.length <= 3 * 10^4', 'Lowercase letters only'],
    hints: ['Same idea as Permutation in String, but record every match.', 'Maintain letter counts of a window of size len(p).'],
    approach: "Count the letters of p. Slide a window of length len(p) over s, keeping the letter counts of the window up to date by adding the entering letter and removing the leaving one. Whenever the window counts equal p's counts, the window start i - len(p) + 1 is an anagram start and is added to the answer. Indices are produced in increasing order naturally. Comparing two 26-length arrays is constant time. Sorting every window and comparing costs O(n * m log m).",
    complexity: 'Time O(26 * n), Space O(26)',
    fn: { py: 'find_anagrams', js: 'findAnagrams' },
    py: {
      starter: 'def find_anagrams(s, p):\n    # write your code here\n    pass\n',
      solution: `def find_anagrams(s, p):
    m = len(p)
    need = [0] * 26
    have = [0] * 26
    for ch in p:
        need[ord(ch) - 97] += 1
    res = []
    for i, ch in enumerate(s):
        have[ord(ch) - 97] += 1
        if i >= m:
            have[ord(s[i - m]) - 97] -= 1
        if i >= m - 1 and have == need:
            res.append(i - m + 1)
    return res
`,
    },
    js: {
      starter: 'function findAnagrams(s, p) {\n  // write your code here\n}\n',
      solution: `function findAnagrams(s, p) {
  const m = p.length;
  const need = new Array(26).fill(0), have = new Array(26).fill(0);
  for (const ch of p) need[ch.charCodeAt(0) - 97]++;
  const res = [];
  for (let i = 0; i < s.length; i++) {
    have[s.charCodeAt(i) - 97]++;
    if (i >= m) have[s.charCodeAt(i - m) - 97]--;
    if (i >= m - 1 && need.every((v, j) => v === have[j])) res.push(i - m + 1);
  }
  return res;
}
`,
    },
    tests: [
      { args: ['cbaebabacd', 'abc'], expect: [0, 6] },
      { args: ['abab', 'ab'], expect: [0, 1, 2] },
      { args: ['a', 'ab'], expect: [] },
      { args: ['aaaa', 'aa'], expect: [0, 1, 2] },
      { args: ['xyz', 'abc'], expect: [] },
      { args: ['baa', 'aa'], expect: [1] },
    ],
  },
  {
    id: 'sw-min-size-subarray-sum',
    title: 'Minimum Size Subarray Sum',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "Given an array of **positive** integers `nums` and a positive integer `target`, return the minimal length of a contiguous subarray whose sum is **greater than or equal to** `target`. Return `0` if no such subarray exists.",
    examples: [
      { input: 'target = 7, nums = [2, 3, 1, 2, 4, 3]', output: '2', explain: '[4, 3]' },
      { input: 'target = 11, nums = [1, 1, 1, 1]', output: '0' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '1 <= nums[i] <= 10^4', '1 <= target <= 10^9'],
    hints: ['All numbers are positive, so growing the window only increases the sum.', 'Expand right; while the sum is at least target, record the length and shrink from the left.'],
    approach: "Because every value is positive, the sum of a window grows when it expands and shrinks when it contracts, which makes a variable-size sliding window work. Move right across the array, adding each value to the running sum. While the sum is at least target, record the window length as a candidate and remove nums[left] from the sum, moving left forward. Each index enters and leaves the window once. If no window ever reached the target return 0. The brute force tries every start and extends until the target is reached, which is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'min_subarray_len', js: 'minSubArrayLen' },
    py: {
      starter: 'def min_subarray_len(target, nums):\n    # write your code here\n    pass\n',
      solution: `def min_subarray_len(target, nums):
    left = total = 0
    best = len(nums) + 1
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == len(nums) + 1 else best
`,
    },
    js: {
      starter: 'function minSubArrayLen(target, nums) {\n  // write your code here\n}\n',
      solution: `function minSubArrayLen(target, nums) {
  let left = 0, total = 0, best = Infinity;
  for (let right = 0; right < nums.length; right++) {
    total += nums[right];
    while (total >= target) {
      best = Math.min(best, right - left + 1);
      total -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;
}
`,
    },
    tests: [
      { args: [7, [2, 3, 1, 2, 4, 3]], expect: 2 },
      { args: [11, [1, 1, 1, 1]], expect: 0 },
      { args: [4, [1, 4, 4]], expect: 1 },
      { args: [11, [1, 2, 3, 4, 5]], expect: 3 },
      { args: [15, [1, 2, 3, 4, 5]], expect: 5 },
      { args: [3, [5]], expect: 1 },
    ],
  },
  {
    id: 'sw-max-consecutive-ones-iii',
    title: 'Max Consecutive Ones with K Flips',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Google', 'Amazon', 'Microsoft'],
    statement: "Given a binary array `nums` and an integer `k`, you may flip at most `k` zeros to ones. Return the length of the longest contiguous run of 1s you can get.",
    examples: [
      { input: 'nums = [1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], k = 2', output: '6' },
      { input: 'nums = [0, 0, 1, 1], k = 0', output: '2' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is 0 or 1', '0 <= k <= nums.length'],
    hints: ['Rephrase: longest window containing at most k zeros.', 'Expand right, and shrink left while the window has more than k zeros.'],
    approach: "Flipping at most k zeros inside a window turns it into all ones exactly when the window contains at most k zeros. So we want the longest window with at most k zeros. Expand right and count zeros; while the zero count exceeds k, move left forward and decrease the count if a zero leaves. After each step the window is valid, so update the best length. Every index enters and leaves once. Trying all windows and counting zeros costs O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'longest_ones', js: 'longestOnes' },
    py: {
      starter: 'def longest_ones(nums, k):\n    # write your code here\n    pass\n',
      solution: `def longest_ones(nums, k):
    left = zeros = best = 0
    for right, x in enumerate(nums):
        if x == 0:
            zeros += 1
        while zeros > k:
            if nums[left] == 0:
                zeros -= 1
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function longestOnes(nums, k) {\n  // write your code here\n}\n',
      solution: `function longestOnes(nums, k) {
  let left = 0, zeros = 0, best = 0;
  for (let right = 0; right < nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) { if (nums[left] === 0) zeros--; left++; }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0], 2], expect: 6 },
      { args: [[0, 0, 1, 1], 0], expect: 2 },
      { args: [[0, 0, 0], 3], expect: 3 },
      { args: [[0], 0], expect: 0 },
      { args: [[1, 0, 1, 0, 1], 1], expect: 3 },
      { args: [[0, 0, 1, 1, 0, 0, 1, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1], 3], expect: 10 },
    ],
  },
  {
    id: 'sw-fruit-into-baskets',
    title: 'Fruit Into Baskets',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Google', 'Amazon', 'Flipkart'],
    statement: "Trees stand in a row and `fruits[i]` is the fruit type of tree `i`. You have **two baskets**, each holding only one fruit type (but unlimited amount). Starting at any tree, you pick one fruit from every tree moving right, and must stop when a tree's fruit fits neither basket. Return the **maximum number of fruits** you can pick.",
    examples: [
      { input: 'fruits = [1, 2, 1]', output: '3' },
      { input: 'fruits = [1, 2, 3, 2, 2]', output: '4', explain: 'Start at index 1: [2, 3, 2, 2].' },
    ],
    constraints: ['1 <= fruits.length <= 10^5', '0 <= fruits[i] < fruits.length'],
    hints: ['Find the longest subarray with at most 2 distinct values.', 'Keep counts in a map and shrink when the map has 3 keys.'],
    approach: "The question is the longest contiguous subarray containing at most two distinct values. Expand the window to the right, counting each fruit type in a map. When the map has more than two types, move left forward, decreasing counts and deleting a type when its count drops to zero, until only two types remain. Record the window size after each step. Each tree enters and leaves the window once. Starting at every tree and walking right is O(n^2).",
    complexity: 'Time O(n), Space O(1) (at most 3 keys)',
    fn: { py: 'total_fruit', js: 'totalFruit' },
    py: {
      starter: 'def total_fruit(fruits):\n    # write your code here\n    pass\n',
      solution: `def total_fruit(fruits):
    count = {}
    left = best = 0
    for right, f in enumerate(fruits):
        count[f] = count.get(f, 0) + 1
        while len(count) > 2:
            g = fruits[left]
            count[g] -= 1
            if count[g] == 0:
                del count[g]
            left += 1
        best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function totalFruit(fruits) {\n  // write your code here\n}\n',
      solution: `function totalFruit(fruits) {
  const count = new Map();
  let left = 0, best = 0;
  for (let right = 0; right < fruits.length; right++) {
    count.set(fruits[right], (count.get(fruits[right]) || 0) + 1);
    while (count.size > 2) {
      const g = fruits[left++];
      count.set(g, count.get(g) - 1);
      if (count.get(g) === 0) count.delete(g);
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[1, 2, 1]], expect: 3 },
      { args: [[1, 2, 3, 2, 2]], expect: 4 },
      { args: [[0, 1, 2, 2]], expect: 3 },
      { args: [[3, 3, 3, 1, 2, 1, 1, 2, 3, 3, 4]], expect: 5 },
      { args: [[5]], expect: 1 },
      { args: [[1, 1, 1, 1]], expect: 4 },
    ],
  },
  {
    id: 'sw-longest-k-distinct',
    title: 'Longest Substring with Exactly K Distinct Characters',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given a lowercase string `s` and an integer `k`, return the length of the longest substring that contains **exactly** `k` distinct characters. If no such substring exists, return `-1`.",
    examples: [
      { input: 's = "aabacbebebe", k = 3', output: '7', explain: '"cbebebe"' },
      { input: 's = "aaaa", k = 2', output: '-1' },
    ],
    constraints: ['1 <= s.length <= 10^5', '1 <= k <= 26'],
    hints: ['Keep a window with at most k distinct characters.', 'Only update the answer when the window has exactly k distinct characters.'],
    approach: "Maintain a window with at most k distinct characters using a count map. Expand right and add the character; while the map holds more than k distinct characters, shrink from the left, removing characters whose count reaches zero. After that, if the map holds exactly k distinct characters, the window is a candidate and we update the best length. If no window ever had exactly k, return -1. The brute force examines every substring and counts its distinct characters, which is O(n^2) or worse.",
    complexity: 'Time O(n), Space O(k)',
    fn: { py: 'longest_k_substr', js: 'longestKSubstr' },
    py: {
      starter: 'def longest_k_substr(s, k):\n    # write your code here\n    pass\n',
      solution: `def longest_k_substr(s, k):
    count = {}
    left = 0
    best = -1
    for right, ch in enumerate(s):
        count[ch] = count.get(ch, 0) + 1
        while len(count) > k:
            c = s[left]
            count[c] -= 1
            if count[c] == 0:
                del count[c]
            left += 1
        if len(count) == k:
            best = max(best, right - left + 1)
    return best
`,
    },
    js: {
      starter: 'function longestKSubstr(s, k) {\n  // write your code here\n}\n',
      solution: `function longestKSubstr(s, k) {
  const count = new Map();
  let left = 0, best = -1;
  for (let right = 0; right < s.length; right++) {
    count.set(s[right], (count.get(s[right]) || 0) + 1);
    while (count.size > k) {
      const c = s[left++];
      count.set(c, count.get(c) - 1);
      if (count.get(c) === 0) count.delete(c);
    }
    if (count.size === k) best = Math.max(best, right - left + 1);
  }
  return best;
}
`,
    },
    tests: [
      { args: ['aabacbebebe', 3], expect: 7 },
      { args: ['aaaa', 2], expect: -1 },
      { args: ['aaaa', 1], expect: 4 },
      { args: ['abc', 3], expect: 3 },
      { args: ['eceba', 2], expect: 3 },
      { args: ['abcba', 2], expect: 3 },
    ],
  },
  {
    id: 'sw-subarray-product-less-than-k',
    title: 'Subarray Product Less Than K',
    diff: 'Medium',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "Given an array of **positive** integers `nums` and an integer `k`, return the number of contiguous subarrays whose product is **strictly less than** `k`.",
    examples: [
      { input: 'nums = [10, 5, 2, 6], k = 100', output: '8' },
      { input: 'nums = [1, 2, 3], k = 0', output: '0' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', '1 <= nums[i] <= 1000', '0 <= k <= 10^6'],
    hints: ['If k <= 1 no product of positive integers can be less than k.', 'For each right end, the valid windows are [left..right], [left+1..right], ... : right - left + 1 of them.'],
    approach: "If k <= 1 the answer is 0 because every product is at least 1. Otherwise keep a window with product < k. For each right index multiply the product by nums[right], and while the product is at least k divide by nums[left] and move left forward. Now every subarray that ends at right and starts anywhere from left to right has product < k, which is right - left + 1 subarrays; add that to the answer. Each index enters and leaves once. Checking all O(n^2) subarrays is too slow.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'num_subarray_product_less_than_k', js: 'numSubarrayProductLessThanK' },
    py: {
      starter: 'def num_subarray_product_less_than_k(nums, k):\n    # write your code here\n    pass\n',
      solution: `def num_subarray_product_less_than_k(nums, k):
    if k <= 1:
        return 0
    prod = 1
    left = count = 0
    for right, x in enumerate(nums):
        prod *= x
        while prod >= k:
            prod //= nums[left]
            left += 1
        count += right - left + 1
    return count
`,
    },
    js: {
      starter: 'function numSubarrayProductLessThanK(nums, k) {\n  // write your code here\n}\n',
      solution: `function numSubarrayProductLessThanK(nums, k) {
  if (k <= 1) return 0;
  let prod = 1, left = 0, count = 0;
  for (let right = 0; right < nums.length; right++) {
    prod *= nums[right];
    while (prod >= k) prod /= nums[left++];
    count += right - left + 1;
  }
  return count;
}
`,
    },
    tests: [
      { args: [[10, 5, 2, 6], 100], expect: 8 },
      { args: [[1, 2, 3], 0], expect: 0 },
      { args: [[1, 1, 1], 2], expect: 6 },
      { args: [[5], 5], expect: 0 },
      { args: [[5], 6], expect: 1 },
      { args: [[2, 3, 4], 10], expect: 4 },
    ],
  },
  {
    id: 'sw-min-window-substring',
    title: 'Minimum Window Substring',
    diff: 'Hard',
    pattern: 'Sliding Window',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given strings `s` and `t`, return the **shortest substring** of `s` that contains every character of `t` (including duplicates). If several shortest windows exist, return the one that **starts earliest**. If there is none, return the empty string `\"\"`.",
    examples: [
      { input: 's = "ADOBECODEBANC", t = "ABC"', output: '"BANC"' },
      { input: 's = "a", t = "aa"', output: '""', explain: 't needs two a characters.' },
    ],
    constraints: ['1 <= s.length, t.length <= 10^5', 's and t contain upper and lowercase letters'],
    hints: ['Count what t needs and track how many required characters are still missing.', 'Expand right until nothing is missing, then shrink left as far as possible while still valid.'],
    approach: "Count the characters of t in a need map and keep missing = len(t). Expand right: if the entering character is still needed (its count is positive), decrease missing; always decrease its count. When missing becomes 0 the window covers t, so shrink from the left: while the leftmost character has a negative count it is surplus, so increase its count and move left. Now the window is minimal for this right end; record it if strictly shorter than the best. Then drop the left character (making it needed again) and continue. Each pointer moves at most n times. Checking all O(n^2) substrings against t is far too slow.",
    complexity: 'Time O(|s| + |t|), Space O(charset)',
    fn: { py: 'min_window', js: 'minWindow' },
    py: {
      starter: 'def min_window(s, t):\n    # write your code here\n    pass\n',
      solution: `from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)
    left = 0
    best_start, best_len = 0, float('inf')
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        if missing == 0:
            while need[s[left]] < 0:
                need[s[left]] += 1
                left += 1
            if right - left + 1 < best_len:
                best_start, best_len = left, right - left + 1
            need[s[left]] += 1
            missing += 1
            left += 1
    return '' if best_len == float('inf') else s[best_start:best_start + best_len]
`,
    },
    js: {
      starter: 'function minWindow(s, t) {\n  // write your code here\n}\n',
      solution: `function minWindow(s, t) {
  const need = new Map();
  for (const ch of t) need.set(ch, (need.get(ch) || 0) + 1);
  let missing = t.length, left = 0, bestStart = 0, bestLen = Infinity;
  for (let right = 0; right < s.length; right++) {
    const ch = s[right];
    if ((need.get(ch) || 0) > 0) missing--;
    need.set(ch, (need.get(ch) || 0) - 1);
    if (missing === 0) {
      while (need.get(s[left]) < 0) { need.set(s[left], need.get(s[left]) + 1); left++; }
      if (right - left + 1 < bestLen) { bestStart = left; bestLen = right - left + 1; }
      need.set(s[left], need.get(s[left]) + 1);
      missing++;
      left++;
    }
  }
  return bestLen === Infinity ? '' : s.slice(bestStart, bestStart + bestLen);
}
`,
    },
    tests: [
      { args: ['ADOBECODEBANC', 'ABC'], expect: 'BANC' },
      { args: ['a', 'aa'], expect: '' },
      { args: ['a', 'a'], expect: 'a' },
      { args: ['ab', 'b'], expect: 'b' },
      { args: ['aaflslflsldkalskaaa', 'aaa'], expect: 'aaa' },
      { args: ['abcab', 'ab'], expect: 'ab' },
      { args: ['xyzzyx', 'zz'], expect: 'zz' },
    ],
  },
  {
    id: 'sw-sliding-window-maximum',
    title: 'Sliding Window Maximum',
    diff: 'Hard',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    statement: "Given an integer array `nums` and a window size `k`, a window of size `k` slides from the left end to the right end one step at a time. Return a list of the **maximum** value in each window, in order.",
    examples: [
      { input: 'nums = [1, 3, -1, -3, 5, 3, 6, 7], k = 3', output: '[3, 3, 5, 5, 6, 7]' },
      { input: 'nums = [9, 2], k = 1', output: '[9, 2]' },
    ],
    constraints: ['1 <= k <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['A deque of indices can keep candidates in decreasing order of value.', 'Pop smaller values from the back before pushing; pop expired indices from the front.'],
    approach: "Keep a deque of indices whose values are in decreasing order; the front is always the maximum of the current window. When index i enters, pop indices from the back while their values are less than or equal to nums[i], since they can never be a maximum again while i is in the window. Push i. Pop the front if it has slid out of the window (index <= i-k). Once the first full window is formed, the value at the front is the answer for that window. Each index is pushed and popped at most once, so the total is linear. Scanning each window for its maximum costs O(n*k); a heap gives O(n log n).",
    complexity: 'Time O(n), Space O(k)',
    fn: { py: 'max_sliding_window', js: 'maxSlidingWindow' },
    py: {
      starter: 'def max_sliding_window(nums, k):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def max_sliding_window(nums, k):
    dq = deque()
    res = []
    for i, x in enumerate(nums):
        while dq and nums[dq[-1]] <= x:
            dq.pop()
        dq.append(i)
        if dq[0] <= i - k:
            dq.popleft()
        if i >= k - 1:
            res.append(nums[dq[0]])
    return res
`,
    },
    js: {
      starter: 'function maxSlidingWindow(nums, k) {\n  // write your code here\n}\n',
      solution: `function maxSlidingWindow(nums, k) {
  const dq = new Array(nums.length);
  let head = 0, tail = 0;
  const res = [];
  for (let i = 0; i < nums.length; i++) {
    while (tail > head && nums[dq[tail - 1]] <= nums[i]) tail--;
    dq[tail++] = i;
    if (dq[head] <= i - k) head++;
    if (i >= k - 1) res.push(nums[dq[head]]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[1, 3, -1, -3, 5, 3, 6, 7], 3], expect: [3, 3, 5, 5, 6, 7] },
      { args: [[9, 2], 1], expect: [9, 2] },
      { args: [[4], 1], expect: [4] },
      { args: [[1, 2, 3, 4], 4], expect: [4] },
      { args: [[5, 4, 3, 2, 1], 2], expect: [5, 4, 3, 2] },
      { args: [[2, 2, 2, 2], 2], expect: [2, 2, 2] },
      { args: [[1, -1, -3, 7, 8, -2], 3], expect: [1, 7, 8, 8] },
    ],
  },
  {
    id: 'sw-subarrays-k-distinct',
    title: 'Subarrays with Exactly K Distinct Integers',
    diff: 'Hard',
    pattern: 'Sliding Window',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "Given an integer array `nums` and an integer `k`, return the number of contiguous subarrays that contain **exactly** `k` distinct integers.",
    examples: [
      { input: 'nums = [1, 2, 1, 2, 3], k = 2', output: '7', explain: '[1,2], [2,1], [1,2], [2,3], [1,2,1], [2,1,2], [1,2,1,2].' },
      { input: 'nums = [1, 2, 1, 3, 4], k = 3', output: '3' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '1 <= nums[i], k <= nums.length'],
    hints: ['"Exactly k" is hard to slide directly, but "at most k" is easy.', 'exactly(k) = atMost(k) - atMost(k - 1).'],
    approach: "Counting windows with at most k distinct values is a standard sliding window: for each right end, shrink left until the window has at most k distinct values, then all right - left + 1 subarrays ending at right qualify. A subarray has exactly k distinct values precisely when it has at most k but not at most k-1, so the answer is atMost(k) - atMost(k-1). Each call is linear, so the total is O(n). The brute force enumerates all O(n^2) subarrays and tracks distinct counts, which is too slow for 2 * 10^4 elements.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'subarrays_with_k_distinct', js: 'subarraysWithKDistinct' },
    py: {
      starter: 'def subarrays_with_k_distinct(nums, k):\n    # write your code here\n    pass\n',
      solution: `def subarrays_with_k_distinct(nums, k):
    def at_most(m):
        count = {}
        left = total = 0
        for right, x in enumerate(nums):
            count[x] = count.get(x, 0) + 1
            while len(count) > m:
                y = nums[left]
                count[y] -= 1
                if count[y] == 0:
                    del count[y]
                left += 1
            total += right - left + 1
        return total
    return at_most(k) - at_most(k - 1)
`,
    },
    js: {
      starter: 'function subarraysWithKDistinct(nums, k) {\n  // write your code here\n}\n',
      solution: `function subarraysWithKDistinct(nums, k) {
  const atMost = m => {
    const count = new Map();
    let left = 0, total = 0;
    for (let right = 0; right < nums.length; right++) {
      count.set(nums[right], (count.get(nums[right]) || 0) + 1);
      while (count.size > m) {
        const y = nums[left++];
        count.set(y, count.get(y) - 1);
        if (count.get(y) === 0) count.delete(y);
      }
      total += right - left + 1;
    }
    return total;
  };
  return atMost(k) - atMost(k - 1);
}
`,
    },
    tests: [
      { args: [[1, 2, 1, 2, 3], 2], expect: 7 },
      { args: [[1, 2, 1, 3, 4], 3], expect: 3 },
      { args: [[1], 1], expect: 1 },
      { args: [[1, 1, 1], 1], expect: 6 },
      { args: [[1, 2, 3], 4], expect: 0 },
      { args: [[2, 1, 2, 1, 6], 2], expect: 7 },
    ],
  },
];
