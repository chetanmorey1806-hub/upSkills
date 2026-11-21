export default [
  {
    id: 'ah-two-sum',
    title: 'Two Sum',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'TCS', 'Infosys', 'Google'],
    statement: "You are given an integer array `nums` and an integer `target`. Exactly one pair of **different positions** `i` and `j` has `nums[i] + nums[j] == target`. Return the two indices as a list `[i, j]` with `i < j`.",
    examples: [
      { input: 'nums = [3, 8, 4, 6], target = 10', output: '[2, 3]', explain: 'nums[2] + nums[3] = 4 + 6 = 10' },
      { input: 'nums = [5, 5, 1], target = 10', output: '[0, 1]', explain: 'The two 5s are at different positions.' },
    ],
    constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i], target <= 10^9', 'Exactly one valid pair exists'],
    hints: ['For each number x you need to know whether target - x appeared earlier.', 'Keep a dictionary from value to index while you scan left to right.'],
    approach: "Walk through the array once and keep a hash map that stores every value seen so far with its index. For the current value x, the partner it needs is target - x. If that partner is already in the map, the earlier index and the current index form the answer, and the earlier index is automatically smaller. Otherwise store x with its index and move on. Because we only look backwards, a single element is never paired with itself. The brute force checks every pair with two nested loops, which costs O(n^2) time and becomes slow for 10^4 elements.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'two_sum', js: 'twoSum' },
    py: {
      starter: 'def two_sum(nums, target):\n    # write your code here\n    pass\n',
      solution: `def two_sum(nums, target):
    seen = {}
    for i, x in enumerate(nums):
        if target - x in seen:
            return [seen[target - x], i]
        seen[x] = i
    return []
`,
    },
    js: {
      starter: 'function twoSum(nums, target) {\n  // write your code here\n}\n',
      solution: `function twoSum(nums, target) {
  const seen = new Map();
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
  return [];
}
`,
    },
    tests: [
      { args: [[3, 8, 4, 6], 10], expect: [2, 3] },
      { args: [[5, 5, 1], 10], expect: [0, 1] },
      { args: [[2, 7, 11, 15], 9], expect: [0, 1] },
      { args: [[-3, 4, 3, 90], 0], expect: [0, 2] },
      { args: [[1, 2], 3], expect: [0, 1] },
      { args: [[0, 4, 3, 0], 0], expect: [0, 3] },
      { args: [[10, -3, 7, 1, 9], 8], expect: [2, 3] },
    ],
  },
  {
    id: 'ah-contains-duplicate',
    title: 'Contains Duplicate',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Wipro', 'Accenture'],
    statement: "Given an integer array `nums`, return `true` if some value appears **at least twice**, and `false` if every element is distinct.",
    examples: [
      { input: 'nums = [4, 1, 9, 4]', output: 'true', explain: '4 appears twice.' },
      { input: 'nums = [7, 2, 5]', output: 'false' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    hints: ['You need fast "have I seen this before?" checks.', 'A set gives O(1) average lookups.'],
    approach: "Scan the array and keep a set of values already visited. Before adding the current value, check whether it is already in the set; if it is, a duplicate exists and we can return true immediately. If the loop finishes without a hit, every value was unique. An alternative is to sort and compare neighbours, which costs O(n log n). The brute force compares every pair in O(n^2), far too slow for 10^5 elements.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'contains_duplicate', js: 'containsDuplicate' },
    py: {
      starter: 'def contains_duplicate(nums):\n    # write your code here\n    pass\n',
      solution: `def contains_duplicate(nums):
    seen = set()
    for x in nums:
        if x in seen:
            return True
        seen.add(x)
    return False
`,
    },
    js: {
      starter: 'function containsDuplicate(nums) {\n  // write your code here\n}\n',
      solution: `function containsDuplicate(nums) {
  const seen = new Set();
  for (const x of nums) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}
`,
    },
    tests: [
      { args: [[4, 1, 9, 4]], expect: true },
      { args: [[7, 2, 5]], expect: false },
      { args: [[1]], expect: false },
      { args: [[0, 0]], expect: true },
      { args: [[-1, 2, -3, 4, -1]], expect: true },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8]], expect: false },
    ],
  },
  {
    id: 'ah-valid-anagram',
    title: 'Valid Anagram',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['TCS', 'Infosys', 'Amazon', 'Microsoft'],
    statement: "Given two lowercase strings `s` and `t`, return `true` if `t` is an anagram of `s` (it uses exactly the same letters the same number of times, in any order), otherwise return `false`.",
    examples: [
      { input: 's = "listen", t = "silent"', output: 'true' },
      { input: 's = "apple", t = "paple"', output: 'true' },
      { input: 's = "rat", t = "car"', output: 'false' },
    ],
    constraints: ['1 <= s.length, t.length <= 5 * 10^4', 's and t contain only lowercase English letters'],
    hints: ['If the lengths differ the answer is immediately false.', 'Count letters of s, subtract letters of t, and check that every count is zero.'],
    approach: "Two strings are anagrams exactly when their letter frequencies match. Build a count array of size 26: add one for each letter of s and subtract one for each letter of t. If the lengths are different we can return false early. At the end every count must be zero. Sorting both strings and comparing also works but costs O(n log n). Checking each letter of s against t by searching and removing is O(n^2).",
    complexity: 'Time O(n), Space O(1) (26 counters)',
    fn: { py: 'is_anagram', js: 'isAnagram' },
    py: {
      starter: 'def is_anagram(s, t):\n    # write your code here\n    pass\n',
      solution: `def is_anagram(s, t):
    if len(s) != len(t):
        return False
    count = [0] * 26
    for a, b in zip(s, t):
        count[ord(a) - 97] += 1
        count[ord(b) - 97] -= 1
    return all(c == 0 for c in count)
`,
    },
    js: {
      starter: 'function isAnagram(s, t) {\n  // write your code here\n}\n',
      solution: `function isAnagram(s, t) {
  if (s.length !== t.length) return false;
  const count = new Array(26).fill(0);
  for (let i = 0; i < s.length; i++) {
    count[s.charCodeAt(i) - 97]++;
    count[t.charCodeAt(i) - 97]--;
  }
  return count.every(c => c === 0);
}
`,
    },
    tests: [
      { args: ['listen', 'silent'], expect: true },
      { args: ['apple', 'paple'], expect: true },
      { args: ['rat', 'car'], expect: false },
      { args: ['a', 'a'], expect: true },
      { args: ['ab', 'a'], expect: false },
      { args: ['aabb', 'abab'], expect: true },
      { args: ['aabb', 'aaab'], expect: false },
    ],
  },
  {
    id: 'ah-majority-element',
    title: 'Majority Element',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'TCS'],
    statement: "Given an array `nums` of size `n`, return the majority element: the value that appears **more than** `n / 2` times. It is guaranteed that such a value exists.",
    examples: [
      { input: 'nums = [2, 1, 2]', output: '2' },
      { input: 'nums = [6, 6, 3, 3, 6, 4, 6]', output: '6', explain: '6 appears 4 times out of 7.' },
    ],
    constraints: ['1 <= nums.length <= 5 * 10^4', 'A majority element always exists'],
    hints: ['A hash map of counts solves it in O(n) space.', 'Try Boyer-Moore voting: a candidate and a counter that goes up for matches and down for others.'],
    approach: "Use the Boyer-Moore voting algorithm. Keep a candidate and a counter starting at zero. For each value, if the counter is zero make the value the new candidate; then add one if the value equals the candidate, otherwise subtract one. Every non-majority element can cancel at most one majority element, and since the majority is more than half, it survives as the final candidate. This needs no extra memory. A counting hash map also works in O(n) time but O(n) space, and checking the count of every element with a nested loop is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'majority_element', js: 'majorityElement' },
    py: {
      starter: 'def majority_element(nums):\n    # write your code here\n    pass\n',
      solution: `def majority_element(nums):
    cand, cnt = None, 0
    for x in nums:
        if cnt == 0:
            cand = x
        cnt += 1 if x == cand else -1
    return cand
`,
    },
    js: {
      starter: 'function majorityElement(nums) {\n  // write your code here\n}\n',
      solution: `function majorityElement(nums) {
  let cand = null, cnt = 0;
  for (const x of nums) {
    if (cnt === 0) cand = x;
    cnt += x === cand ? 1 : -1;
  }
  return cand;
}
`,
    },
    tests: [
      { args: [[2, 1, 2]], expect: 2 },
      { args: [[6, 6, 3, 3, 6, 4, 6]], expect: 6 },
      { args: [[9]], expect: 9 },
      { args: [[1, 1, 1, 2, 2]], expect: 1 },
      { args: [[-5, -5, 7]], expect: -5 },
      { args: [[4, 5, 4, 5, 4]], expect: 4 },
    ],
  },
  {
    id: 'ah-missing-number',
    title: 'Missing Number',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['TCS', 'Wipro', 'Amazon', 'Accenture'],
    statement: "An array `nums` holds `n` **distinct** numbers taken from the range `0..n` (inclusive). Exactly one number of that range is missing. Return it.",
    examples: [
      { input: 'nums = [3, 0, 1]', output: '2' },
      { input: 'nums = [0, 1]', output: '2', explain: 'n = 2, so the range is 0..2 and 2 is missing.' },
    ],
    constraints: ['1 <= n <= 10^4', 'All numbers are distinct and in 0..n'],
    hints: ['What is the sum of 0 + 1 + ... + n?', 'Subtract the actual sum from the expected sum (or XOR everything).'],
    approach: "The numbers 0..n add up to n*(n+1)/2. Add up the elements of the array and subtract that from the expected total; the difference is exactly the missing number. An equivalent trick XORs all indices and values together, because every present number cancels with its index. Both use constant extra space. Sorting and scanning for the gap costs O(n log n), and searching for each number 0..n in the array is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'missing_number', js: 'missingNumber' },
    py: {
      starter: 'def missing_number(nums):\n    # write your code here\n    pass\n',
      solution: `def missing_number(nums):
    n = len(nums)
    return n * (n + 1) // 2 - sum(nums)
`,
    },
    js: {
      starter: 'function missingNumber(nums) {\n  // write your code here\n}\n',
      solution: `function missingNumber(nums) {
  const n = nums.length;
  let total = (n * (n + 1)) / 2;
  for (const x of nums) total -= x;
  return total;
}
`,
    },
    tests: [
      { args: [[3, 0, 1]], expect: 2 },
      { args: [[0, 1]], expect: 2 },
      { args: [[1]], expect: 0 },
      { args: [[0]], expect: 1 },
      { args: [[9, 6, 4, 2, 3, 5, 7, 0, 1]], expect: 8 },
      { args: [[1, 2, 3, 4]], expect: 0 },
    ],
  },
  {
    id: 'ah-single-number',
    title: 'Single Number',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Infosys', 'Microsoft'],
    statement: "In the non-empty array `nums`, every value appears exactly **twice** except one value that appears once. Return that single value using constant extra space.",
    examples: [
      { input: 'nums = [7, 3, 7]', output: '3' },
      { input: 'nums = [4, 1, 2, 1, 2]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', 'Every element appears twice except one'],
    hints: ['x XOR x = 0 and x XOR 0 = x.', 'XOR all elements together.'],
    approach: "XOR has two useful properties: a number XORed with itself is 0, and XOR is order-independent. If we XOR every element, each pair cancels to 0 and only the lonely value remains. This takes one pass and a single variable. A hash map of counts would also work but uses O(n) memory, and counting each element with a nested loop takes O(n^2) time.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'single_number', js: 'singleNumber' },
    py: {
      starter: 'def single_number(nums):\n    # write your code here\n    pass\n',
      solution: `def single_number(nums):
    r = 0
    for x in nums:
        r ^= x
    return r
`,
    },
    js: {
      starter: 'function singleNumber(nums) {\n  // write your code here\n}\n',
      solution: `function singleNumber(nums) {
  let r = 0;
  for (const x of nums) r ^= x;
  return r;
}
`,
    },
    tests: [
      { args: [[7, 3, 7]], expect: 3 },
      { args: [[4, 1, 2, 1, 2]], expect: 4 },
      { args: [[1]], expect: 1 },
      { args: [[-2, 5, 5]], expect: -2 },
      { args: [[0, 9, 9]], expect: 0 },
      { args: [[10, 20, 30, 20, 10]], expect: 30 },
    ],
  },
  {
    id: 'ah-plus-one',
    title: 'Plus One',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Google', 'TCS', 'Accenture'],
    statement: "A non-negative integer is stored as an array `digits`, most significant digit first, with no leading zeros (except the number 0 itself). Add one to the number and return the resulting digit array.",
    examples: [
      { input: 'digits = [1, 2, 9]', output: '[1, 3, 0]' },
      { input: 'digits = [9, 9]', output: '[1, 0, 0]' },
    ],
    constraints: ['1 <= digits.length <= 100', '0 <= digits[i] <= 9'],
    hints: ['Start from the last digit and handle the carry.', 'If every digit was 9, the result is 1 followed by zeros.'],
    approach: "Start at the last digit. If it is less than 9, increase it and you are done. If it is 9, it becomes 0 and the carry moves one position left; repeat. If the loop passes the first digit, every digit was 9, so the answer is a 1 followed by n zeros. Converting the array to a big integer and back also works in Python, but it does not show the carry logic and can overflow in languages with fixed-size integers.",
    complexity: 'Time O(n), Space O(1) extra (O(n) only when a new digit is added)',
    fn: { py: 'plus_one', js: 'plusOne' },
    py: {
      starter: 'def plus_one(digits):\n    # write your code here\n    pass\n',
      solution: `def plus_one(digits):
    d = digits[:]
    for i in range(len(d) - 1, -1, -1):
        if d[i] < 9:
            d[i] += 1
            return d
        d[i] = 0
    return [1] + d
`,
    },
    js: {
      starter: 'function plusOne(digits) {\n  // write your code here\n}\n',
      solution: `function plusOne(digits) {
  const d = digits.slice();
  for (let i = d.length - 1; i >= 0; i--) {
    if (d[i] < 9) { d[i]++; return d; }
    d[i] = 0;
  }
  return [1, ...d];
}
`,
    },
    tests: [
      { args: [[1, 2, 9]], expect: [1, 3, 0] },
      { args: [[9, 9]], expect: [1, 0, 0] },
      { args: [[0]], expect: [1] },
      { args: [[4, 3, 2, 1]], expect: [4, 3, 2, 2] },
      { args: [[9]], expect: [1, 0] },
      { args: [[8, 9, 9, 9]], expect: [9, 0, 0, 0] },
    ],
  },
  {
    id: 'ah-first-unique-char',
    title: 'First Unique Character',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Infosys', 'Wipro'],
    statement: "Given a lowercase string `s`, return the **index** of the first character that appears exactly once in `s`. If no such character exists, return `-1`.",
    examples: [
      { input: 's = "swiss"', output: '1', explain: "'w' is the first character that occurs once." },
      { input: 's = "aabb"', output: '-1' },
    ],
    constraints: ['1 <= s.length <= 10^5', 's contains only lowercase letters'],
    hints: ['Two passes: first count, then find.', 'In the second pass return the first index whose count is 1.'],
    approach: "First pass: count how many times each character occurs using a dictionary or an array of 26. Second pass: walk the string from the left and return the first index whose character count is exactly one. If none is found return -1. The brute force counts each character by scanning the whole string again, which is O(n^2).",
    complexity: 'Time O(n), Space O(1) (26 counters)',
    fn: { py: 'first_uniq_char', js: 'firstUniqChar' },
    py: {
      starter: 'def first_uniq_char(s):\n    # write your code here\n    pass\n',
      solution: `from collections import Counter

def first_uniq_char(s):
    cnt = Counter(s)
    for i, ch in enumerate(s):
        if cnt[ch] == 1:
            return i
    return -1
`,
    },
    js: {
      starter: 'function firstUniqChar(s) {\n  // write your code here\n}\n',
      solution: `function firstUniqChar(s) {
  const cnt = {};
  for (const ch of s) cnt[ch] = (cnt[ch] || 0) + 1;
  for (let i = 0; i < s.length; i++) if (cnt[s[i]] === 1) return i;
  return -1;
}
`,
    },
    tests: [
      { args: ['swiss'], expect: 1 },
      { args: ['aabb'], expect: -1 },
      { args: ['z'], expect: 0 },
      { args: ['leetcode'], expect: 0 },
      { args: ['loveleetcode'], expect: 2 },
      { args: ['abcabcd'], expect: 6 },
    ],
  },
  {
    id: 'ah-second-largest',
    title: 'Second Largest Element',
    diff: 'Easy',
    pattern: 'Arrays & Hashing',
    companies: ['TCS', 'Infosys', 'Wipro', 'Accenture'],
    statement: "Given an integer array `arr`, return the **second largest distinct** value. If there is no such value (all elements are equal or there is only one element), return `-1`.",
    examples: [
      { input: 'arr = [12, 35, 1, 10, 34, 1]', output: '34' },
      { input: 'arr = [10, 10, 10]', output: '-1' },
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i] <= 10^9'],
    hints: ['Keep two variables: largest and second largest.', 'Only update second when the value is strictly between second and largest.'],
    approach: "Keep two trackers, first and second, both starting below any possible value. For each element: if it is bigger than first, the old first becomes second and the element becomes first; else if it is strictly smaller than first but bigger than second, it becomes the new second. Equal values to first are skipped so duplicates of the maximum do not count. At the end, if second was never set, return -1. Sorting and scanning from the end also works but costs O(n log n).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'second_largest', js: 'secondLargest' },
    py: {
      starter: 'def second_largest(arr):\n    # write your code here\n    pass\n',
      solution: `def second_largest(arr):
    first = second = -1
    for x in arr:
        if x > first:
            second = first
            first = x
        elif second < x < first:
            second = x
    return second
`,
    },
    js: {
      starter: 'function secondLargest(arr) {\n  // write your code here\n}\n',
      solution: `function secondLargest(arr) {
  let first = -1, second = -1;
  for (const x of arr) {
    if (x > first) { second = first; first = x; }
    else if (x < first && x > second) second = x;
  }
  return second;
}
`,
    },
    tests: [
      { args: [[12, 35, 1, 10, 34, 1]], expect: 34 },
      { args: [[10, 10, 10]], expect: -1 },
      { args: [[5]], expect: -1 },
      { args: [[3, 9]], expect: 3 },
      { args: [[9, 9, 8]], expect: 8 },
      { args: [[0, 0, 1]], expect: 0 },
      { args: [[7, 2, 7, 5, 6]], expect: 6 },
    ],
  },
  {
    id: 'ah-group-anagrams',
    title: 'Group Anagrams',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given a list of lowercase words `strs`, group the words that are anagrams of each other. To make the answer unique: sort the words **inside each group** alphabetically, then sort the groups by their first word. Return the list of groups.",
    examples: [
      { input: 'strs = ["eat", "tea", "tan", "ate", "nat", "bat"]', output: '[["ate", "eat", "tea"], ["bat"], ["nat", "tan"]]' },
      { input: 'strs = ["abc"]', output: '[["abc"]]' },
    ],
    constraints: ['1 <= strs.length <= 10^4', '0 <= strs[i].length <= 100', 'Duplicates may appear and are kept'],
    hints: ['Two words are anagrams if their sorted letters are equal.', 'Use the sorted word (or a 26-letter count tuple) as a dictionary key.'],
    approach: "Anagrams share the same multiset of letters, so we can compute a key for each word that is identical for all its anagrams: the word with its letters sorted, or a tuple of 26 letter counts. Put each word into a dictionary bucket under its key. Finally sort each bucket and sort the buckets by their first word, as the statement requires. The brute force compares every pair of words for being anagrams, which is O(n^2 * k) and too slow for 10^4 words.",
    complexity: 'Time O(n * k log k) where k is the word length (plus sorting the output), Space O(n * k)',
    fn: { py: 'group_anagrams', js: 'groupAnagrams' },
    py: {
      starter: 'def group_anagrams(strs):\n    # write your code here\n    pass\n',
      solution: `from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for w in strs:
        groups[''.join(sorted(w))].append(w)
    result = [sorted(g) for g in groups.values()]
    result.sort(key=lambda g: g[0])
    return result
`,
    },
    js: {
      starter: 'function groupAnagrams(strs) {\n  // write your code here\n}\n',
      solution: `function groupAnagrams(strs) {
  const groups = new Map();
  for (const w of strs) {
    const key = w.split('').sort().join('');
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(w);
  }
  const cmp = (a, b) => (a < b ? -1 : a > b ? 1 : 0);
  const result = [...groups.values()].map(g => g.sort(cmp));
  result.sort((a, b) => cmp(a[0], b[0]));
  return result;
}
`,
    },
    tests: [
      { args: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expect: [['ate', 'eat', 'tea'], ['bat'], ['nat', 'tan']] },
      { args: [['abc']], expect: [['abc']] },
      { args: [['']], expect: [['']] },
      { args: [['ab', 'ba', 'ab']], expect: [['ab', 'ab', 'ba']] },
      { args: [['dog', 'god', 'cat', 'act', 'tac', 'x']], expect: [['act', 'cat', 'tac'], ['dog', 'god'], ['x']] },
      { args: [['a', 'b', 'c']], expect: [['a'], ['b'], ['c']] },
    ],
  },
  {
    id: 'ah-top-k-frequent',
    title: 'Top K Frequent Elements',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Flipkart', 'Microsoft', 'Google'],
    statement: "Given an integer array `nums` and an integer `k`, return the `k` most frequent values. Order the answer by **frequency (highest first)**, and break ties by the **smaller value first**. `k` is never larger than the number of distinct values.",
    examples: [
      { input: 'nums = [1, 1, 1, 2, 2, 3], k = 2', output: '[1, 2]' },
      { input: 'nums = [4, 4, 5, 5, 6], k = 2', output: '[4, 5]', explain: '4 and 5 both appear twice; the smaller comes first.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= number of distinct values'],
    hints: ['Count frequencies with a hash map.', 'Bucket sort: bucket[f] holds all values that appear f times; read buckets from high f to low.'],
    approach: "Count each value with a hash map. Then use bucket sort on frequency: create n+1 buckets where bucket f holds the values that occur exactly f times. Walk the buckets from the highest frequency down, sorting each bucket so ties come out in increasing order, and collect values until you have k. Since frequencies are at most n, the buckets give linear time apart from the small tie sorts. Sorting all distinct values by (-count, value) is the simpler O(n log n) alternative; a heap of size k gives O(n log k).",
    complexity: 'Time O(n) bucket pass (plus tie sorting), Space O(n)',
    fn: { py: 'top_k_frequent', js: 'topKFrequent' },
    py: {
      starter: 'def top_k_frequent(nums, k):\n    # write your code here\n    pass\n',
      solution: `from collections import Counter

def top_k_frequent(nums, k):
    cnt = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for v, f in cnt.items():
        buckets[f].append(v)
    res = []
    for f in range(len(nums), 0, -1):
        for v in sorted(buckets[f]):
            res.append(v)
            if len(res) == k:
                return res
    return res
`,
    },
    js: {
      starter: 'function topKFrequent(nums, k) {\n  // write your code here\n}\n',
      solution: `function topKFrequent(nums, k) {
  const cnt = new Map();
  for (const x of nums) cnt.set(x, (cnt.get(x) || 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [v, f] of cnt) buckets[f].push(v);
  const res = [];
  for (let f = nums.length; f > 0; f--) {
    for (const v of buckets[f].sort((a, b) => a - b)) {
      res.push(v);
      if (res.length === k) return res;
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[1, 1, 1, 2, 2, 3], 2], expect: [1, 2] },
      { args: [[4, 4, 5, 5, 6], 2], expect: [4, 5] },
      { args: [[7], 1], expect: [7] },
      { args: [[3, 1, 2], 3], expect: [1, 2, 3] },
      { args: [[-1, -1, 2, 2, 2, 0], 1], expect: [2] },
      { args: [[5, 3, 5, 3, 9, 9, 1], 3], expect: [3, 5, 9] },
      { args: [[8, 8, 8, 2, 2, 6], 2], expect: [8, 2] },
    ],
  },
  {
    id: 'ah-product-except-self',
    title: 'Product of Array Except Self',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Google'],
    statement: "Given an integer array `nums`, return an array `answer` where `answer[i]` is the product of every element of `nums` **except** `nums[i]`. Do it in O(n) time **without using division**.",
    examples: [
      { input: 'nums = [1, 2, 3, 4]', output: '[24, 12, 8, 6]' },
      { input: 'nums = [2, 0, 5]', output: '[0, 10, 0]' },
    ],
    constraints: ['2 <= nums.length <= 10^5', '-30 <= nums[i] <= 30', 'All products fit in a 32-bit integer'],
    hints: ['answer[i] = (product of everything left of i) * (product of everything right of i).', 'Fill prefix products in one pass and multiply by suffix products in a backward pass.'],
    approach: "The product of all elements except nums[i] equals the product of the elements to its left times the product of the elements to its right. In a forward pass, store in answer[i] the running product of everything before i. In a backward pass, keep a running product of everything after i and multiply it into answer[i]. This needs no division, so zeros are handled naturally, and uses only the output array plus one variable. The brute force multiplies n-1 elements for each position, which is O(n^2).",
    complexity: 'Time O(n), Space O(1) extra besides the output',
    fn: { py: 'product_except_self', js: 'productExceptSelf' },
    py: {
      starter: 'def product_except_self(nums):\n    # write your code here\n    pass\n',
      solution: `def product_except_self(nums):
    n = len(nums)
    ans = [1] * n
    left = 1
    for i in range(n):
        ans[i] = left
        left *= nums[i]
    right = 1
    for i in range(n - 1, -1, -1):
        ans[i] *= right
        right *= nums[i]
    return ans
`,
    },
    js: {
      starter: 'function productExceptSelf(nums) {\n  // write your code here\n}\n',
      solution: `function productExceptSelf(nums) {
  const n = nums.length;
  const ans = new Array(n).fill(1);
  let left = 1;
  for (let i = 0; i < n; i++) { ans[i] = left; left *= nums[i]; }
  let right = 1;
  for (let i = n - 1; i >= 0; i--) { ans[i] *= right; right *= nums[i]; }
  return ans.map(x => (x === 0 ? 0 : x)); // turn -0 into 0
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4]], expect: [24, 12, 8, 6] },
      { args: [[2, 0, 5]], expect: [0, 10, 0] },
      { args: [[3, 4]], expect: [4, 3] },
      { args: [[-1, 1, 0, -3, 3]], expect: [0, 0, 9, 0, 0] },
      { args: [[0, 0, 2]], expect: [0, 0, 0] },
      { args: [[-2, -3, 4]], expect: [-12, -8, 6] },
    ],
  },
  {
    id: 'ah-longest-consecutive',
    title: 'Longest Consecutive Sequence',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Google', 'Amazon', 'Flipkart'],
    statement: "Given an unsorted integer array `nums`, return the length of the longest run of **consecutive integers** (like 4, 5, 6, 7) whose values all appear in `nums`. The values may appear in any order. Your algorithm should run in O(n) time.",
    examples: [
      { input: 'nums = [100, 4, 200, 1, 3, 2]', output: '4', explain: 'The run is 1, 2, 3, 4.' },
      { input: 'nums = [9, 1, 8, 7, 2, 7]', output: '3', explain: '7, 8, 9 (duplicates count once).' },
    ],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9'],
    hints: ['Put all values in a set.', 'Only start counting from x when x - 1 is NOT in the set; then walk x + 1, x + 2, ...'],
    approach: "Insert every value into a hash set. A value x is the start of a run only if x - 1 is not in the set. For each such start, count upward x+1, x+2, ... while the values exist, and track the longest length. Each value is visited at most twice (once as a candidate, once while extending a run), so the whole thing is linear. Sorting and scanning also works in O(n log n). The naive approach extends a run from every value without the start check, which can degrade to O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'longest_consecutive', js: 'longestConsecutive' },
    py: {
      starter: 'def longest_consecutive(nums):\n    # write your code here\n    pass\n',
      solution: `def longest_consecutive(nums):
    s = set(nums)
    best = 0
    for x in s:
        if x - 1 not in s:
            y = x
            while y + 1 in s:
                y += 1
            best = max(best, y - x + 1)
    return best
`,
    },
    js: {
      starter: 'function longestConsecutive(nums) {\n  // write your code here\n}\n',
      solution: `function longestConsecutive(nums) {
  const s = new Set(nums);
  let best = 0;
  for (const x of s) {
    if (!s.has(x - 1)) {
      let y = x;
      while (s.has(y + 1)) y++;
      best = Math.max(best, y - x + 1);
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[100, 4, 200, 1, 3, 2]], expect: 4 },
      { args: [[9, 1, 8, 7, 2, 7]], expect: 3 },
      { args: [[]], expect: 0 },
      { args: [[5]], expect: 1 },
      { args: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expect: 9 },
      { args: [[-2, -1, 0, 10, 11]], expect: 3 },
      { args: [[1, 3, 5, 7]], expect: 1 },
    ],
  },
  {
    id: 'ah-subarray-sum-k',
    title: 'Subarray Sum Equals K',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: "Given an integer array `nums` (values can be negative) and an integer `k`, return the **number of contiguous subarrays** whose elements add up to exactly `k`.",
    examples: [
      { input: 'nums = [1, 1, 1], k = 2', output: '2', explain: '[1, 1] at positions 0-1 and 1-2.' },
      { input: 'nums = [3, 4, -7, 3, 1], k = 4', output: '3', explain: '[4], [3, 1] and the whole array.' },
    ],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000', '-10^7 <= k <= 10^7'],
    hints: ['sum(i..j) = prefix[j+1] - prefix[i].', 'While scanning, count how many earlier prefix sums equal current_prefix - k.'],
    approach: "Let prefix be the running sum. A subarray ending at the current index sums to k exactly when some earlier prefix equals prefix - k. Keep a hash map counting how often each prefix sum has occurred, starting with {0: 1} for the empty prefix. For each element, update the prefix, add the count of prefix - k to the answer, then record the current prefix. Because values can be negative, the sliding window trick does not work here. The brute force tries all O(n^2) subarrays.",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'subarray_sum', js: 'subarraySum' },
    py: {
      starter: 'def subarray_sum(nums, k):\n    # write your code here\n    pass\n',
      solution: `def subarray_sum(nums, k):
    seen = {0: 1}
    pre = 0
    count = 0
    for x in nums:
        pre += x
        count += seen.get(pre - k, 0)
        seen[pre] = seen.get(pre, 0) + 1
    return count
`,
    },
    js: {
      starter: 'function subarraySum(nums, k) {\n  // write your code here\n}\n',
      solution: `function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]);
  let pre = 0, count = 0;
  for (const x of nums) {
    pre += x;
    count += seen.get(pre - k) || 0;
    seen.set(pre, (seen.get(pre) || 0) + 1);
  }
  return count;
}
`,
    },
    tests: [
      { args: [[1, 1, 1], 2], expect: 2 },
      { args: [[3, 4, -7, 3, 1], 4], expect: 3 },
      { args: [[1, 2, 3], 3], expect: 2 },
      { args: [[5], 5], expect: 1 },
      { args: [[0, 0, 0], 0], expect: 6 },
      { args: [[1, -1, 1, -1], 0], expect: 4 },
      { args: [[2, 4, 6], 5], expect: 0 },
    ],
  },
  {
    id: 'ah-max-subarray',
    title: 'Maximum Subarray Sum (Kadane)',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['TCS', 'Infosys', 'Amazon', 'Microsoft'],
    statement: "Given an integer array `nums`, find the contiguous subarray (with at least one element) that has the largest sum and return **that sum**.",
    examples: [
      { input: 'nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]', output: '6', explain: '[4, -1, 2, 1] has sum 6.' },
      { input: 'nums = [-4, -2, -7]', output: '-2', explain: 'All negative: take the single largest element.' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-10^4 <= nums[i] <= 10^4'],
    hints: ['At each index decide: extend the previous subarray, or start fresh here?', 'cur = max(x, cur + x); best = max(best, cur).'],
    approach: "Kadane's algorithm keeps cur, the best sum of a subarray that ends at the current index. For each value x, either extend the previous subarray (cur + x) or start a new one at x, whichever is larger. The overall answer is the maximum cur seen. Starting cur and best from the first element makes all-negative arrays work correctly. The brute force tries every start and end in O(n^2) (or O(n^3) if sums are recomputed).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'max_subarray', js: 'maxSubArray' },
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
      starter: 'function maxSubArray(nums) {\n  // write your code here\n}\n',
      solution: `function maxSubArray(nums) {
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
      { args: [[-4, -2, -7]], expect: -2 },
      { args: [[1]], expect: 1 },
      { args: [[5, 4, -1, 7, 8]], expect: 23 },
      { args: [[2, -10, 3]], expect: 3 },
      { args: [[0, -1, 0]], expect: 0 },
    ],
  },
  {
    id: 'ah-sort-colors',
    title: 'Sort 0s, 1s and 2s',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Wipro'],
    statement: "An array `nums` contains only the values 0, 1 and 2. Sort it in a **single pass** using constant extra space (no library sort) and return the sorted array.",
    examples: [
      { input: 'nums = [2, 0, 2, 1, 1, 0]', output: '[0, 0, 1, 1, 2, 2]' },
      { input: 'nums = [1, 0]', output: '[0, 1]' },
    ],
    constraints: ['1 <= nums.length <= 10^5', 'nums[i] is 0, 1 or 2'],
    hints: ['Dutch National Flag: three pointers low, mid, high.', '0 swaps to low, 2 swaps to high, 1 just moves mid forward.'],
    approach: "Use the Dutch National Flag algorithm with three pointers. Everything before low is 0, everything after high is 2, and mid scans the unknown part. If nums[mid] is 0, swap it with nums[low] and move both forward. If it is 1, just move mid. If it is 2, swap with nums[high] and move high back, but do not advance mid because the swapped-in value is not checked yet. The loop ends when mid passes high. Counting the three values and rewriting the array is also O(n) but needs two passes; a general sort costs O(n log n).",
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
    if (nums[mid] === 0) { [nums[low], nums[mid]] = [nums[mid], nums[low]]; low++; mid++; }
    else if (nums[mid] === 1) mid++;
    else { [nums[mid], nums[high]] = [nums[high], nums[mid]]; high--; }
  }
  return nums;
}
`,
    },
    tests: [
      { args: [[2, 0, 2, 1, 1, 0]], expect: [0, 0, 1, 1, 2, 2] },
      { args: [[1, 0]], expect: [0, 1] },
      { args: [[0]], expect: [0] },
      { args: [[2, 2, 2]], expect: [2, 2, 2] },
      { args: [[2, 1, 0]], expect: [0, 1, 2] },
      { args: [[1, 2, 0, 1, 2, 0, 0]], expect: [0, 0, 0, 1, 1, 2, 2] },
    ],
  },
  {
    id: 'ah-spiral-matrix',
    title: 'Spiral Order of a Matrix',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Microsoft', 'Amazon', 'Accenture', 'Infosys'],
    statement: "Given an `m x n` matrix, return all of its elements in **clockwise spiral order**, starting at the top-left corner and moving right first.",
    examples: [
      { input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[1, 2, 3, 6, 9, 8, 7, 4, 5]' },
      { input: 'matrix = [[1, 2], [3, 4], [5, 6]]', output: '[1, 2, 4, 6, 5, 3]' },
    ],
    constraints: ['1 <= m, n <= 50'],
    hints: ['Keep four boundaries: top, bottom, left, right.', 'After each side, shrink the matching boundary and re-check before walking the reverse sides.'],
    approach: "Maintain four boundaries: top, bottom, left and right. Walk the top row left to right and move top down; walk the right column top to bottom and move right left. Then, only if rows remain, walk the bottom row right to left and move bottom up; only if columns remain, walk the left column bottom to top and move left right. Repeat while top <= bottom and left <= right. The extra checks prevent re-reading a single remaining row or column. Each element is visited once. A simulation with a visited matrix and direction changes also works but uses O(m*n) extra memory.",
    complexity: 'Time O(m*n), Space O(1) extra besides the output',
    fn: { py: 'spiral_order', js: 'spiralOrder' },
    py: {
      starter: 'def spiral_order(matrix):\n    # write your code here\n    pass\n',
      solution: `def spiral_order(matrix):
    res = []
    top, bottom = 0, len(matrix) - 1
    left, right = 0, len(matrix[0]) - 1
    while top <= bottom and left <= right:
        for j in range(left, right + 1):
            res.append(matrix[top][j])
        top += 1
        for i in range(top, bottom + 1):
            res.append(matrix[i][right])
        right -= 1
        if top <= bottom:
            for j in range(right, left - 1, -1):
                res.append(matrix[bottom][j])
            bottom -= 1
        if left <= right:
            for i in range(bottom, top - 1, -1):
                res.append(matrix[i][left])
            left += 1
    return res
`,
    },
    js: {
      starter: 'function spiralOrder(matrix) {\n  // write your code here\n}\n',
      solution: `function spiralOrder(matrix) {
  const res = [];
  let top = 0, bottom = matrix.length - 1, left = 0, right = matrix[0].length - 1;
  while (top <= bottom && left <= right) {
    for (let j = left; j <= right; j++) res.push(matrix[top][j]);
    top++;
    for (let i = top; i <= bottom; i++) res.push(matrix[i][right]);
    right--;
    if (top <= bottom) {
      for (let j = right; j >= left; j--) res.push(matrix[bottom][j]);
      bottom--;
    }
    if (left <= right) {
      for (let i = bottom; i >= top; i--) res.push(matrix[i][left]);
      left++;
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [1, 2, 3, 6, 9, 8, 7, 4, 5] },
      { args: [[[1, 2], [3, 4], [5, 6]]], expect: [1, 2, 4, 6, 5, 3] },
      { args: [[[7]]], expect: [7] },
      { args: [[[1, 2, 3, 4]]], expect: [1, 2, 3, 4] },
      { args: [[[1], [2], [3]]], expect: [1, 2, 3] },
      { args: [[[1, 2, 3, 4], [5, 6, 7, 8], [9, 10, 11, 12]]], expect: [1, 2, 3, 4, 8, 12, 11, 10, 9, 5, 6, 7] },
    ],
  },
  {
    id: 'ah-rotate-image',
    title: 'Rotate Matrix by 90 Degrees',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Microsoft', 'Wipro'],
    statement: "Given an `n x n` matrix, rotate it **90 degrees clockwise in place** (do not allocate another matrix) and return it.",
    examples: [
      { input: 'matrix = [[1, 2], [3, 4]]', output: '[[3, 1], [4, 2]]' },
      { input: 'matrix = [[1, 2, 3], [4, 5, 6], [7, 8, 9]]', output: '[[7, 4, 1], [8, 5, 2], [9, 6, 3]]' },
    ],
    constraints: ['1 <= n <= 20', '-1000 <= matrix[i][j] <= 1000'],
    hints: ['A clockwise rotation = transpose + reverse each row.', 'Transpose by swapping matrix[i][j] with matrix[j][i] for j > i.'],
    approach: "A 90 degree clockwise rotation can be split into two simple in-place steps. First transpose the matrix: swap matrix[i][j] with matrix[j][i] for every pair above the diagonal, which turns rows into columns. Then reverse every row, which mirrors the matrix left to right. The combination moves the element at (i, j) to (j, n-1-i), which is exactly the clockwise rotation. Copying into a new matrix with result[j][n-1-i] = matrix[i][j] is easier but uses O(n^2) extra memory, which the problem forbids.",
    complexity: 'Time O(n^2), Space O(1)',
    fn: { py: 'rotate', js: 'rotate' },
    py: {
      starter: 'def rotate(matrix):\n    # write your code here\n    pass\n',
      solution: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i + 1, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix
`,
    },
    js: {
      starter: 'function rotate(matrix) {\n  // write your code here\n}\n',
      solution: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (const row of matrix) row.reverse();
  return matrix;
}
`,
    },
    tests: [
      { args: [[[1, 2], [3, 4]]], expect: [[3, 1], [4, 2]] },
      { args: [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]], expect: [[7, 4, 1], [8, 5, 2], [9, 6, 3]] },
      { args: [[[5]]], expect: [[5]] },
      { args: [[[5, 1, 9, 11], [2, 4, 8, 10], [13, 3, 6, 7], [15, 14, 12, 16]]], expect: [[15, 13, 2, 5], [14, 3, 4, 1], [12, 6, 8, 9], [16, 7, 10, 11]] },
      { args: [[[0, -1], [-2, -3]]], expect: [[-2, 0], [-3, -1]] },
      { args: [[[1, 1], [2, 2]]], expect: [[2, 1], [2, 1]] },
    ],
  },
  {
    id: 'ah-next-permutation',
    title: 'Next Permutation',
    diff: 'Medium',
    pattern: 'Arrays & Hashing',
    companies: ['Google', 'Amazon', 'Microsoft', 'Flipkart'],
    statement: "Given an array `nums`, rearrange it into the **next lexicographically greater permutation** of its values and return it. If the array is already the largest permutation (fully non-increasing), return the smallest one (sorted ascending). Use only constant extra memory.",
    examples: [
      { input: 'nums = [1, 2, 3]', output: '[1, 3, 2]' },
      { input: 'nums = [3, 2, 1]', output: '[1, 2, 3]' },
      { input: 'nums = [1, 3, 5, 4, 2]', output: '[1, 4, 2, 3, 5]' },
    ],
    constraints: ['1 <= nums.length <= 100', '0 <= nums[i] <= 100'],
    hints: ['From the right, find the first index i with nums[i] < nums[i + 1].', 'Swap nums[i] with the smallest larger value to its right, then reverse the suffix after i.'],
    approach: "Scan from the right to find the pivot: the first index i where nums[i] < nums[i+1]. Everything right of the pivot is non-increasing, meaning that suffix is already at its largest arrangement. If no pivot exists, reverse the whole array to get the smallest permutation. Otherwise, find from the right the first element larger than nums[i], swap them, and reverse the suffix after i so it becomes as small as possible. This gives the very next permutation in O(n). Generating all permutations and picking the next one is O(n!).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'next_permutation', js: 'nextPermutation' },
    py: {
      starter: 'def next_permutation(nums):\n    # write your code here\n    pass\n',
      solution: `def next_permutation(nums):
    n = len(nums)
    i = n - 2
    while i >= 0 and nums[i] >= nums[i + 1]:
        i -= 1
    if i >= 0:
        j = n - 1
        while nums[j] <= nums[i]:
            j -= 1
        nums[i], nums[j] = nums[j], nums[i]
    nums[i + 1:] = reversed(nums[i + 1:])
    return nums
`,
    },
    js: {
      starter: 'function nextPermutation(nums) {\n  // write your code here\n}\n',
      solution: `function nextPermutation(nums) {
  const n = nums.length;
  let i = n - 2;
  while (i >= 0 && nums[i] >= nums[i + 1]) i--;
  if (i >= 0) {
    let j = n - 1;
    while (nums[j] <= nums[i]) j--;
    [nums[i], nums[j]] = [nums[j], nums[i]];
  }
  let l = i + 1, r = n - 1;
  while (l < r) { [nums[l], nums[r]] = [nums[r], nums[l]]; l++; r--; }
  return nums;
}
`,
    },
    tests: [
      { args: [[1, 2, 3]], expect: [1, 3, 2] },
      { args: [[3, 2, 1]], expect: [1, 2, 3] },
      { args: [[1, 3, 5, 4, 2]], expect: [1, 4, 2, 3, 5] },
      { args: [[1]], expect: [1] },
      { args: [[1, 1, 5]], expect: [1, 5, 1] },
      { args: [[2, 2, 2]], expect: [2, 2, 2] },
      { args: [[1, 5, 1]], expect: [5, 1, 1] },
    ],
  },
  {
    id: 'ah-first-missing-positive',
    title: 'First Missing Positive',
    diff: 'Hard',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "Given an unsorted integer array `nums`, return the **smallest positive integer** that does not appear in it. Your solution must run in O(n) time and use O(1) extra space (you may modify the array).",
    examples: [
      { input: 'nums = [3, 4, -1, 1]', output: '2' },
      { input: 'nums = [7, 8, 9]', output: '1' },
      { input: 'nums = [1, 2, 3]', output: '4' },
    ],
    constraints: ['1 <= nums.length <= 10^5', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: ['The answer is always in the range 1..n+1.', 'Cyclic placement: try to put value v at index v - 1 by swapping.'],
    approach: "With n elements the answer must be between 1 and n+1, so only values in 1..n matter. Use the array itself as a hash table: for each index, while its value v is in 1..n and nums[v-1] is not already v, swap v into position v-1. Each swap places one value permanently, so there are at most n swaps in total. Afterwards scan from the left; the first index i where nums[i] != i+1 means i+1 is missing. If every position is correct, the answer is n+1. A hash set solves it in O(n) time but O(n) space, and sorting costs O(n log n).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'first_missing_positive', js: 'firstMissingPositive' },
    py: {
      starter: 'def first_missing_positive(nums):\n    # write your code here\n    pass\n',
      solution: `def first_missing_positive(nums):
    n = len(nums)
    for i in range(n):
        while 1 <= nums[i] <= n and nums[nums[i] - 1] != nums[i]:
            j = nums[i] - 1
            nums[i], nums[j] = nums[j], nums[i]
    for i in range(n):
        if nums[i] != i + 1:
            return i + 1
    return n + 1
`,
    },
    js: {
      starter: 'function firstMissingPositive(nums) {\n  // write your code here\n}\n',
      solution: `function firstMissingPositive(nums) {
  const n = nums.length;
  for (let i = 0; i < n; i++) {
    while (nums[i] >= 1 && nums[i] <= n && nums[nums[i] - 1] !== nums[i]) {
      const j = nums[i] - 1;
      [nums[i], nums[j]] = [nums[j], nums[i]];
    }
  }
  for (let i = 0; i < n; i++) if (nums[i] !== i + 1) return i + 1;
  return n + 1;
}
`,
    },
    tests: [
      { args: [[3, 4, -1, 1]], expect: 2 },
      { args: [[7, 8, 9]], expect: 1 },
      { args: [[1, 2, 3]], expect: 4 },
      { args: [[1]], expect: 2 },
      { args: [[2]], expect: 1 },
      { args: [[1, 1, 2, 2]], expect: 3 },
      { args: [[0, -5, 2, 1, 4]], expect: 3 },
    ],
  },
  {
    id: 'ah-count-inversions',
    title: 'Count Inversions',
    diff: 'Hard',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Flipkart', 'Microsoft', 'Infosys'],
    statement: "An inversion is a pair of indices `(i, j)` with `i < j` and `arr[i] > arr[j]`. Given an integer array `arr`, return the **total number of inversions**. Aim for O(n log n).",
    examples: [
      { input: 'arr = [2, 4, 1, 3, 5]', output: '3', explain: '(2,1), (4,1), (4,3).' },
      { input: 'arr = [5, 4, 3]', output: '3' },
      { input: 'arr = [1, 2, 2]', output: '0', explain: 'Equal values are not inversions.' },
    ],
    constraints: ['1 <= arr.length <= 10^5', '0 <= arr[i] <= 10^9'],
    hints: ['Think of merge sort.', 'While merging, if right[j] < left[i], then right[j] is smaller than every remaining element of the left half.'],
    approach: "Modify merge sort. Split the array into halves, count inversions inside each half recursively, then count the inversions that cross the halves while merging. During the merge, whenever an element from the right half is smaller than the current element of the left half, it is also smaller than every remaining element of the left half (because that half is sorted), so we add the number of remaining left elements in one step. Taking from the left on ties ensures equal values are not counted. The total cost is the same as merge sort. The brute force checks all pairs in O(n^2), too slow for 10^5.",
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'count_inversions', js: 'countInversions' },
    py: {
      starter: 'def count_inversions(arr):\n    # write your code here\n    pass\n',
      solution: `def count_inversions(arr):
    def sort(a):
        if len(a) <= 1:
            return a, 0
        mid = len(a) // 2
        left, cl = sort(a[:mid])
        right, cr = sort(a[mid:])
        merged = []
        i = j = 0
        cnt = cl + cr
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                merged.append(left[i])
                i += 1
            else:
                merged.append(right[j])
                cnt += len(left) - i
                j += 1
        merged.extend(left[i:])
        merged.extend(right[j:])
        return merged, cnt
    return sort(list(arr))[1]
`,
    },
    js: {
      starter: 'function countInversions(arr) {\n  // write your code here\n}\n',
      solution: `function countInversions(arr) {
  const a = arr.slice();
  const tmp = new Array(a.length);
  function sort(lo, hi) {
    if (hi - lo <= 1) return 0;
    const mid = (lo + hi) >> 1;
    let cnt = sort(lo, mid) + sort(mid, hi);
    let i = lo, j = mid, k = lo;
    while (i < mid && j < hi) {
      if (a[i] <= a[j]) tmp[k++] = a[i++];
      else { tmp[k++] = a[j++]; cnt += mid - i; }
    }
    while (i < mid) tmp[k++] = a[i++];
    while (j < hi) tmp[k++] = a[j++];
    for (let x = lo; x < hi; x++) a[x] = tmp[x];
    return cnt;
  }
  return sort(0, a.length);
}
`,
    },
    tests: [
      { args: [[2, 4, 1, 3, 5]], expect: 3 },
      { args: [[5, 4, 3]], expect: 3 },
      { args: [[1, 2, 2]], expect: 0 },
      { args: [[7]], expect: 0 },
      { args: [[8, 4, 2, 1]], expect: 6 },
      { args: [[3, 1, 2, 3, 1]], expect: 5 },
      { args: [[1, 20, 6, 4, 5]], expect: 5 },
    ],
  },
  {
    id: 'ah-candy',
    title: 'Candy Distribution',
    diff: 'Hard',
    pattern: 'Arrays & Hashing',
    companies: ['Amazon', 'Flipkart', 'Google'],
    statement: "Children stand in a line and `ratings[i]` is the rating of child `i`. Give candies so that: every child gets **at least one** candy, and a child with a **strictly higher rating than a neighbour** gets more candies than that neighbour. Return the **minimum total** number of candies.",
    examples: [
      { input: 'ratings = [1, 0, 2]', output: '5', explain: 'Give 2, 1, 2.' },
      { input: 'ratings = [1, 2, 2]', output: '4', explain: 'Give 1, 2, 1; equal neighbours have no rule.' },
    ],
    constraints: ['1 <= ratings.length <= 2 * 10^4', '0 <= ratings[i] <= 2 * 10^4'],
    hints: ['Handle the left-neighbour rule and the right-neighbour rule separately.', 'Left to right: if rating rises, candy = left + 1. Right to left: if rating rises, candy = max(candy, right + 1).'],
    approach: "Split the two constraints. In a left-to-right pass, give each child one candy, and if their rating is higher than the left neighbour, give one more than that neighbour. This satisfies every left constraint with the fewest candies. In a right-to-left pass, if a child's rating is higher than the right neighbour, raise their count to at least the right neighbour plus one, keeping the larger value so the left rule still holds. Summing gives the minimum, because each child gets exactly the larger of the two forced lower bounds. A brute force that repeatedly fixes violations until stable can take O(n^2).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'candy', js: 'candy' },
    py: {
      starter: 'def candy(ratings):\n    # write your code here\n    pass\n',
      solution: `def candy(ratings):
    n = len(ratings)
    c = [1] * n
    for i in range(1, n):
        if ratings[i] > ratings[i - 1]:
            c[i] = c[i - 1] + 1
    for i in range(n - 2, -1, -1):
        if ratings[i] > ratings[i + 1]:
            c[i] = max(c[i], c[i + 1] + 1)
    return sum(c)
`,
    },
    js: {
      starter: 'function candy(ratings) {\n  // write your code here\n}\n',
      solution: `function candy(ratings) {
  const n = ratings.length;
  const c = new Array(n).fill(1);
  for (let i = 1; i < n; i++) if (ratings[i] > ratings[i - 1]) c[i] = c[i - 1] + 1;
  for (let i = n - 2; i >= 0; i--) if (ratings[i] > ratings[i + 1]) c[i] = Math.max(c[i], c[i + 1] + 1);
  return c.reduce((a, b) => a + b, 0);
}
`,
    },
    tests: [
      { args: [[1, 0, 2]], expect: 5 },
      { args: [[1, 2, 2]], expect: 4 },
      { args: [[5]], expect: 1 },
      { args: [[1, 2, 3, 4]], expect: 10 },
      { args: [[4, 3, 2, 1]], expect: 10 },
      { args: [[1, 3, 2, 2, 1]], expect: 7 },
      { args: [[1, 2, 87, 87, 87, 2, 1]], expect: 13 },
    ],
  },
];
