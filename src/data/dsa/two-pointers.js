export default [
  {
    id: 'tp-valid-palindrome',
    title: 'Valid Palindrome',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Microsoft', 'Amazon'],
    statement: "A phrase is a palindrome if, after converting all letters to lowercase and removing every character that is not a letter or digit, it reads the same forwards and backwards. Given a string `s`, return `true` if it is a palindrome, otherwise `false`.",
    examples: [
      { input: 's = "Never odd or even"', output: 'true' },
      { input: 's = "race a car"', output: 'false' },
      { input: 's = " .,"', output: 'true', explain: 'Nothing is left after cleaning; an empty string is a palindrome.' },
    ],
    constraints: ['1 <= s.length <= 2 * 10^5', 's contains printable ASCII characters'],
    hints: ['Use one pointer at each end.', 'Skip non-alphanumeric characters, then compare lowercase letters and move inward.'],
    approach: "Place pointer i at the start and j at the end. Move i forward while it points at something that is not a letter or digit, and move j backward the same way. Compare the lowercase characters at i and j; if they differ, return false, otherwise step both inward. When the pointers meet, every pair matched, so return true. This avoids building a cleaned copy. Building the cleaned string and comparing it with its reverse is also O(n) but uses O(n) extra memory.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'is_palindrome', js: 'isPalindrome' },
    py: {
      starter: 'def is_palindrome(s):\n    # write your code here\n    pass\n',
      solution: `def is_palindrome(s):
    i, j = 0, len(s) - 1
    while i < j:
        while i < j and not s[i].isalnum():
            i += 1
        while i < j and not s[j].isalnum():
            j -= 1
        if s[i].lower() != s[j].lower():
            return False
        i += 1
        j -= 1
    return True
`,
    },
    js: {
      starter: 'function isPalindrome(s) {\n  // write your code here\n}\n',
      solution: `function isPalindrome(s) {
  const ok = c => /[a-z0-9]/i.test(c);
  let i = 0, j = s.length - 1;
  while (i < j) {
    while (i < j && !ok(s[i])) i++;
    while (i < j && !ok(s[j])) j--;
    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;
    i++; j--;
  }
  return true;
}
`,
    },
    tests: [
      { args: ['Never odd or even'], expect: true },
      { args: ['race a car'], expect: false },
      { args: [' .,'], expect: true },
      { args: ['A man, a plan, a canal: Panama'], expect: true },
      { args: ['0P'], expect: false },
      { args: ['a'], expect: true },
      { args: ['ab2ba'], expect: true },
    ],
  },
  {
    id: 'tp-reverse-string',
    title: 'Reverse an Array of Characters',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Wipro', 'Accenture', 'Infosys'],
    statement: "Given a list of characters `chars`, reverse it **in place** using O(1) extra memory and return the same list.",
    examples: [
      { input: 'chars = ["c", "o", "d", "e"]', output: '["e", "d", "o", "c"]' },
      { input: 'chars = ["x"]', output: '["x"]' },
    ],
    constraints: ['1 <= chars.length <= 10^5'],
    hints: ['Swap the first and last characters.', 'Move both pointers inward until they meet.'],
    approach: "Put one pointer at the start and one at the end. Swap the two characters, then move the left pointer right and the right pointer left. Stop when they meet or cross; every character has then been moved to its mirrored position. Only a temporary swap variable is used. Building a new reversed list is simpler but uses O(n) extra memory, which breaks the in-place requirement.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'reverse_string', js: 'reverseString' },
    py: {
      starter: 'def reverse_string(chars):\n    # write your code here\n    pass\n',
      solution: `def reverse_string(chars):
    i, j = 0, len(chars) - 1
    while i < j:
        chars[i], chars[j] = chars[j], chars[i]
        i += 1
        j -= 1
    return chars
`,
    },
    js: {
      starter: 'function reverseString(chars) {\n  // write your code here\n}\n',
      solution: `function reverseString(chars) {
  let i = 0, j = chars.length - 1;
  while (i < j) {
    [chars[i], chars[j]] = [chars[j], chars[i]];
    i++; j--;
  }
  return chars;
}
`,
    },
    tests: [
      { args: [['c', 'o', 'd', 'e']], expect: ['e', 'd', 'o', 'c'] },
      { args: [['x']], expect: ['x'] },
      { args: [['a', 'b']], expect: ['b', 'a'] },
      { args: [['H', 'a', 'n', 'n', 'a', 'h']], expect: ['h', 'a', 'n', 'n', 'a', 'H'] },
      { args: [['1', '2', '3']], expect: ['3', '2', '1'] },
      { args: [['a', 'a', 'b']], expect: ['b', 'a', 'a'] },
    ],
  },
  {
    id: 'tp-merge-sorted-arrays',
    title: 'Merge Two Sorted Arrays',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Microsoft', 'Amazon'],
    statement: "Given two arrays `a` and `b`, each sorted in non-decreasing order, return a single sorted array containing all elements of both (duplicates kept).",
    examples: [
      { input: 'a = [1, 4, 7], b = [2, 3, 9]', output: '[1, 2, 3, 4, 7, 9]' },
      { input: 'a = [], b = [5]', output: '[5]' },
    ],
    constraints: ['0 <= a.length, b.length <= 10^5', '-10^9 <= values <= 10^9'],
    hints: ['Compare the smallest remaining element of each array.', 'Append the smaller one and advance that pointer; copy leftovers at the end.'],
    approach: "Keep a pointer into each array, both starting at index 0. At every step compare a[i] and b[j], append the smaller to the result and advance that pointer. When one array runs out, append the rest of the other, which is already sorted. Each element is handled once, giving linear time. Concatenating and sorting is shorter to write but costs O((n+m) log(n+m)) and ignores the fact that the inputs are already sorted.",
    complexity: 'Time O(n + m), Space O(n + m) for the output',
    fn: { py: 'merge_sorted', js: 'mergeSorted' },
    py: {
      starter: 'def merge_sorted(a, b):\n    # write your code here\n    pass\n',
      solution: `def merge_sorted(a, b):
    res = []
    i = j = 0
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
  const res = [];
  let i = 0, j = 0;
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
      { args: [[1, 4, 7], [2, 3, 9]], expect: [1, 2, 3, 4, 7, 9] },
      { args: [[], [5]], expect: [5] },
      { args: [[3], []], expect: [3] },
      { args: [[], []], expect: [] },
      { args: [[1, 1, 2], [1, 3]], expect: [1, 1, 1, 2, 3] },
      { args: [[-5, 0, 10], [-6, 11, 12]], expect: [-6, -5, 0, 10, 11, 12] },
    ],
  },
  {
    id: 'tp-remove-duplicates-sorted',
    title: 'Remove Duplicates from Sorted Array',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Wipro', 'Amazon', 'Microsoft'],
    statement: "Given a sorted array `nums`, remove the duplicates **in place** so each value appears once, keeping the original order. Return the list of the first `k` elements after the operation, where `k` is the number of distinct values.",
    examples: [
      { input: 'nums = [1, 1, 2]', output: '[1, 2]' },
      { input: 'nums = [0, 0, 1, 1, 1, 2, 2, 3, 3, 4]', output: '[0, 1, 2, 3, 4]' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', 'nums is sorted in non-decreasing order'],
    hints: ['Use a slow pointer for the next write position and a fast pointer to read.', 'Write only when the fast value differs from the last written value.'],
    approach: "Because the array is sorted, duplicates sit next to each other. Keep a write pointer k that starts at 1, since the first element is always kept. Scan with a read pointer from index 1; whenever nums[i] differs from nums[k-1], the last value written, copy it to nums[k] and increment k. At the end the first k positions hold each distinct value once, in order. Using a set loses the order guarantees in some languages and needs O(n) memory, and shifting the array left on every duplicate costs O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'remove_duplicates', js: 'removeDuplicates' },
    py: {
      starter: 'def remove_duplicates(nums):\n    # write your code here\n    pass\n',
      solution: `def remove_duplicates(nums):
    k = 1
    for i in range(1, len(nums)):
        if nums[i] != nums[k - 1]:
            nums[k] = nums[i]
            k += 1
    return nums[:k]
`,
    },
    js: {
      starter: 'function removeDuplicates(nums) {\n  // write your code here\n}\n',
      solution: `function removeDuplicates(nums) {
  let k = 1;
  for (let i = 1; i < nums.length; i++) {
    if (nums[i] !== nums[k - 1]) nums[k++] = nums[i];
  }
  return nums.slice(0, k);
}
`,
    },
    tests: [
      { args: [[1, 1, 2]], expect: [1, 2] },
      { args: [[0, 0, 1, 1, 1, 2, 2, 3, 3, 4]], expect: [0, 1, 2, 3, 4] },
      { args: [[7]], expect: [7] },
      { args: [[2, 2, 2, 2]], expect: [2] },
      { args: [[-3, -1, 0, 5]], expect: [-3, -1, 0, 5] },
      { args: [[1, 2, 2, 3, 3, 3]], expect: [1, 2, 3] },
    ],
  },
  {
    id: 'tp-squares-sorted-array',
    title: 'Squares of a Sorted Array',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Infosys'],
    statement: "Given an integer array `nums` sorted in non-decreasing order (it may contain negatives), return an array of the squares of each number, also sorted in non-decreasing order. Aim for O(n).",
    examples: [
      { input: 'nums = [-4, -1, 0, 3, 10]', output: '[0, 1, 9, 16, 100]' },
      { input: 'nums = [-7, -3, 2, 3, 11]', output: '[4, 9, 9, 49, 121]' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-10^4 <= nums[i] <= 10^4'],
    hints: ['The largest square is at one of the two ends.', 'Fill the result from the back using two pointers.'],
    approach: "The biggest absolute value is always at the left end or the right end of the sorted array. Keep pointers at both ends and fill the result array from its last position backwards. At each step compare the absolute values at the two pointers, write the larger square into the current position, and move that pointer inward. After n steps the result is sorted. Squaring everything and then sorting is simpler but takes O(n log n).",
    complexity: 'Time O(n), Space O(n) for the output',
    fn: { py: 'sorted_squares', js: 'sortedSquares' },
    py: {
      starter: 'def sorted_squares(nums):\n    # write your code here\n    pass\n',
      solution: `def sorted_squares(nums):
    n = len(nums)
    res = [0] * n
    i, j = 0, n - 1
    for pos in range(n - 1, -1, -1):
        if abs(nums[i]) > abs(nums[j]):
            res[pos] = nums[i] * nums[i]
            i += 1
        else:
            res[pos] = nums[j] * nums[j]
            j -= 1
    return res
`,
    },
    js: {
      starter: 'function sortedSquares(nums) {\n  // write your code here\n}\n',
      solution: `function sortedSquares(nums) {
  const n = nums.length;
  const res = new Array(n);
  let i = 0, j = n - 1;
  for (let pos = n - 1; pos >= 0; pos--) {
    if (Math.abs(nums[i]) > Math.abs(nums[j])) { res[pos] = nums[i] * nums[i]; i++; }
    else { res[pos] = nums[j] * nums[j]; j--; }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[-4, -1, 0, 3, 10]], expect: [0, 1, 9, 16, 100] },
      { args: [[-7, -3, 2, 3, 11]], expect: [4, 9, 9, 49, 121] },
      { args: [[5]], expect: [25] },
      { args: [[-3, -2, -1]], expect: [1, 4, 9] },
      { args: [[1, 2, 3]], expect: [1, 4, 9] },
      { args: [[-2, 0, 2]], expect: [0, 4, 4] },
    ],
  },
  {
    id: 'tp-move-zeroes',
    title: 'Move Zeroes to End',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Accenture', 'Amazon', 'Microsoft'],
    statement: "Given an integer array `nums`, move all `0`s to the end **in place** while keeping the relative order of the non-zero elements. Return the modified array.",
    examples: [
      { input: 'nums = [0, 5, 0, 3, 12]', output: '[5, 3, 12, 0, 0]' },
      { input: 'nums = [0]', output: '[0]' },
    ],
    constraints: ['1 <= nums.length <= 10^4', '-2^31 <= nums[i] <= 2^31 - 1'],
    hints: ['A write pointer marks where the next non-zero should go.', 'Swap each non-zero element with the write position.'],
    approach: "Keep a pointer w for the next position where a non-zero value should be placed. Scan the array with i; whenever nums[i] is non-zero, swap nums[i] and nums[w] and advance w. Non-zero values are written in their original order, and the zeros get pushed into the gaps behind them, ending up at the end. One pass and no extra array are needed. Repeatedly shifting the array whenever a zero is found works but is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'move_zeroes', js: 'moveZeroes' },
    py: {
      starter: 'def move_zeroes(nums):\n    # write your code here\n    pass\n',
      solution: `def move_zeroes(nums):
    w = 0
    for i in range(len(nums)):
        if nums[i] != 0:
            nums[w], nums[i] = nums[i], nums[w]
            w += 1
    return nums
`,
    },
    js: {
      starter: 'function moveZeroes(nums) {\n  // write your code here\n}\n',
      solution: `function moveZeroes(nums) {
  let w = 0;
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] !== 0) { [nums[w], nums[i]] = [nums[i], nums[w]]; w++; }
  }
  return nums;
}
`,
    },
    tests: [
      { args: [[0, 5, 0, 3, 12]], expect: [5, 3, 12, 0, 0] },
      { args: [[0]], expect: [0] },
      { args: [[1, 2, 3]], expect: [1, 2, 3] },
      { args: [[0, 0, 1]], expect: [1, 0, 0] },
      { args: [[4, 0, -2, 0, 0, 7]], expect: [4, -2, 7, 0, 0, 0] },
      { args: [[0, 0, 0]], expect: [0, 0, 0] },
    ],
  },
  {
    id: 'tp-is-subsequence',
    title: 'Is Subsequence',
    diff: 'Easy',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Infosys', 'Google'],
    statement: "Given strings `s` and `t`, return `true` if `s` is a **subsequence** of `t`, meaning `s` can be formed by deleting zero or more characters from `t` without changing the order of the rest.",
    examples: [
      { input: 's = "ace", t = "abcde"', output: 'true' },
      { input: 's = "aec", t = "abcde"', output: 'false', explain: 'The order of e and c is wrong.' },
    ],
    constraints: ['0 <= s.length <= 100', '0 <= t.length <= 10^4'],
    hints: ['Walk through t once.', 'Advance the pointer in s only when the characters match.'],
    approach: "Use pointer i into s and pointer j into t. Move j through t one character at a time; whenever t[j] equals s[i], advance i as well. Greedily matching the earliest possible character of t is always safe because it leaves the most room for the remaining characters of s. If i reaches the end of s, every character was matched in order. Trying all subsets of t is exponential, so the greedy scan is the way to go.",
    complexity: 'Time O(|t|), Space O(1)',
    fn: { py: 'is_subsequence', js: 'isSubsequence' },
    py: {
      starter: 'def is_subsequence(s, t):\n    # write your code here\n    pass\n',
      solution: `def is_subsequence(s, t):
    i = 0
    for ch in t:
        if i < len(s) and s[i] == ch:
            i += 1
    return i == len(s)
`,
    },
    js: {
      starter: 'function isSubsequence(s, t) {\n  // write your code here\n}\n',
      solution: `function isSubsequence(s, t) {
  let i = 0;
  for (let j = 0; j < t.length && i < s.length; j++) {
    if (s[i] === t[j]) i++;
  }
  return i === s.length;
}
`,
    },
    tests: [
      { args: ['ace', 'abcde'], expect: true },
      { args: ['aec', 'abcde'], expect: false },
      { args: ['', 'abc'], expect: true },
      { args: ['a', ''], expect: false },
      { args: ['aaa', 'abaca'], expect: true },
      { args: ['abc', 'abc'], expect: true },
      { args: ['abcd', 'abc'], expect: false },
    ],
  },
  {
    id: 'tp-two-sum-sorted',
    title: 'Two Sum II (Sorted Input)',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    statement: "Given a **sorted** integer array `numbers` and a `target`, find the two numbers at different positions that add up to `target`. Return their **1-based** indices `[i, j]` with `i < j`. Exactly one solution exists. Use only O(1) extra space.",
    examples: [
      { input: 'numbers = [1, 3, 4, 8, 10], target = 12', output: '[3, 4]', explain: '4 + 8 = 12' },
      { input: 'numbers = [-2, 0, 5], target = 3', output: '[1, 3]' },
    ],
    constraints: ['2 <= numbers.length <= 3 * 10^4', 'numbers is sorted in non-decreasing order', 'Exactly one answer'],
    hints: ['Start with the smallest and the largest element.', 'If the sum is too small, move the left pointer right; if too big, move the right pointer left.'],
    approach: "Put l at the start and r at the end. If numbers[l] + numbers[r] equals the target we are done. If the sum is smaller than the target, the only way to increase it is to move l right; if larger, move r left. Each move discards a value that cannot be part of any solution with the remaining elements, so we never miss the answer. This uses constant extra space, unlike the hash map version of Two Sum. Checking all pairs would be O(n^2), and binary searching the partner for each element is O(n log n).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'two_sum_sorted', js: 'twoSumSorted' },
    py: {
      starter: 'def two_sum_sorted(numbers, target):\n    # write your code here\n    pass\n',
      solution: `def two_sum_sorted(numbers, target):
    l, r = 0, len(numbers) - 1
    while l < r:
        s = numbers[l] + numbers[r]
        if s == target:
            return [l + 1, r + 1]
        if s < target:
            l += 1
        else:
            r -= 1
    return []
`,
    },
    js: {
      starter: 'function twoSumSorted(numbers, target) {\n  // write your code here\n}\n',
      solution: `function twoSumSorted(numbers, target) {
  let l = 0, r = numbers.length - 1;
  while (l < r) {
    const s = numbers[l] + numbers[r];
    if (s === target) return [l + 1, r + 1];
    if (s < target) l++;
    else r--;
  }
  return [];
}
`,
    },
    tests: [
      { args: [[1, 3, 4, 8, 10], 12], expect: [3, 4] },
      { args: [[-2, 0, 5], 3], expect: [1, 3] },
      { args: [[2, 7, 11, 15], 9], expect: [1, 2] },
      { args: [[5, 25, 75], 100], expect: [2, 3] },
      { args: [[-1, 0], -1], expect: [1, 2] },
      { args: [[1, 2, 3, 4, 4, 9, 56, 90], 8], expect: [4, 5] },
    ],
  },
  {
    id: 'tp-three-sum',
    title: '3Sum (Triplets with Zero Sum)',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Google'],
    statement: "Given an integer array `nums`, return all **unique** triplets `[a, b, c]` of values taken from three different positions such that `a + b + c == 0`. Each triplet must be sorted ascending, and the list of triplets must be sorted ascending (lexicographically). Return `[]` if there are none.",
    examples: [
      { input: 'nums = [-1, 0, 1, 2, -1, -4]', output: '[[-1, -1, 2], [-1, 0, 1]]' },
      { input: 'nums = [0, 0, 0, 0]', output: '[[0, 0, 0]]' },
    ],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5'],
    hints: ['Sort first, then fix the first element.', 'For the rest, run Two Sum II with two pointers and skip duplicate values.'],
    approach: "Sort the array. For each index i, treat nums[i] as the smallest value of the triplet and look for two values after it that sum to -nums[i] using two pointers l and r. Move l right when the sum is too small and r left when it is too big. When a triplet is found, record it and skip over equal values on both sides so duplicates are not reported. Also skip i when nums[i] equals nums[i-1]. Because the array is sorted and i increases, triplets come out already in lexicographic order. The brute force checks all O(n^3) triples and needs a set to remove duplicates.",
    complexity: 'Time O(n^2), Space O(1) extra (ignoring sort and output)',
    fn: { py: 'three_sum', js: 'threeSum' },
    py: {
      starter: 'def three_sum(nums):\n    # write your code here\n    pass\n',
      solution: `def three_sum(nums):
    nums = sorted(nums)
    n = len(nums)
    res = []
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        if nums[i] > 0:
            break
        l, r = i + 1, n - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if s < 0:
                l += 1
            elif s > 0:
                r -= 1
            else:
                res.append([nums[i], nums[l], nums[r]])
                l += 1
                r -= 1
                while l < r and nums[l] == nums[l - 1]:
                    l += 1
                while l < r and nums[r] == nums[r + 1]:
                    r -= 1
    return res
`,
    },
    js: {
      starter: 'function threeSum(nums) {\n  // write your code here\n}\n',
      solution: `function threeSum(nums) {
  nums = nums.slice().sort((a, b) => a - b);
  const n = nums.length, res = [];
  for (let i = 0; i < n - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    if (nums[i] > 0) break;
    let l = i + 1, r = n - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (s < 0) l++;
      else if (s > 0) r--;
      else {
        res.push([nums[i], nums[l], nums[r]]);
        l++; r--;
        while (l < r && nums[l] === nums[l - 1]) l++;
        while (l < r && nums[r] === nums[r + 1]) r--;
      }
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[-1, 0, 1, 2, -1, -4]], expect: [[-1, -1, 2], [-1, 0, 1]] },
      { args: [[0, 0, 0, 0]], expect: [[0, 0, 0]] },
      { args: [[1, 2, 3]], expect: [] },
      { args: [[0, 1, 1]], expect: [] },
      { args: [[-2, 0, 1, 1, 2]], expect: [[-2, 0, 2], [-2, 1, 1]] },
      { args: [[3, -2, 1, 0, -1, 2, -3]], expect: [[-3, 0, 3], [-3, 1, 2], [-2, -1, 3], [-2, 0, 2], [-1, 0, 1]] },
    ],
  },
  {
    id: 'tp-container-most-water',
    title: 'Container With Most Water',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Flipkart', 'Microsoft'],
    statement: "You are given `height`, where `height[i]` is the height of a vertical line at position `i`. Pick two lines that, together with the x-axis, hold the most water. The water held by lines `i` and `j` is `(j - i) * min(height[i], height[j])`. Return the maximum amount.",
    examples: [
      { input: 'height = [1, 8, 6, 2, 5, 4, 8, 3, 7]', output: '49', explain: 'Lines at 1 and 8: 7 * min(8, 7) = 49.' },
      { input: 'height = [2, 2]', output: '2' },
    ],
    constraints: ['2 <= height.length <= 10^5', '0 <= height[i] <= 10^4'],
    hints: ['Start with the widest container: the two ends.', 'Always move the shorter line inward; moving the taller one can never help.'],
    approach: "Start with l at the left end and r at the right end, the widest possible container. Compute its area and update the best. Then move the pointer at the shorter line inward. The reason: the area is limited by the shorter line, and any container that keeps that short line but is narrower can only be worse, so that line can be discarded safely. Repeat until the pointers meet. Every pair is implicitly considered in O(n). The brute force computes the area of all O(n^2) pairs.",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'max_area', js: 'maxArea' },
    py: {
      starter: 'def max_area(height):\n    # write your code here\n    pass\n',
      solution: `def max_area(height):
    l, r = 0, len(height) - 1
    best = 0
    while l < r:
        best = max(best, (r - l) * min(height[l], height[r]))
        if height[l] < height[r]:
            l += 1
        else:
            r -= 1
    return best
`,
    },
    js: {
      starter: 'function maxArea(height) {\n  // write your code here\n}\n',
      solution: `function maxArea(height) {
  let l = 0, r = height.length - 1, best = 0;
  while (l < r) {
    best = Math.max(best, (r - l) * Math.min(height[l], height[r]));
    if (height[l] < height[r]) l++;
    else r--;
  }
  return best;
}
`,
    },
    tests: [
      { args: [[1, 8, 6, 2, 5, 4, 8, 3, 7]], expect: 49 },
      { args: [[2, 2]], expect: 2 },
      { args: [[0, 0]], expect: 0 },
      { args: [[4, 3, 2, 1, 4]], expect: 16 },
      { args: [[1, 2, 1]], expect: 2 },
      { args: [[1, 2, 4, 3]], expect: 4 },
    ],
  },
  {
    id: 'tp-three-sum-closest',
    title: '3Sum Closest',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Infosys'],
    statement: "Given an integer array `nums` and an integer `target`, choose three numbers at different positions whose sum is **closest** to `target` and return that sum. The inputs are such that the closest sum is unique.",
    examples: [
      { input: 'nums = [-1, 2, 1, -4], target = 1', output: '2', explain: '-1 + 2 + 1 = 2 is the closest.' },
      { input: 'nums = [0, 0, 0], target = 1', output: '0' },
    ],
    constraints: ['3 <= nums.length <= 500', '-1000 <= nums[i] <= 1000', '-10^4 <= target <= 10^4'],
    hints: ['Sort the array and fix one element.', 'Move two pointers on the rest, keeping the sum with the smallest |sum - target|.'],
    approach: "Sort the array. For each index i, place l just after i and r at the end. Compute the sum of the three values and keep it if it is closer to the target than the best so far. If the sum equals the target we can return immediately. If the sum is less than the target, move l right to increase it; otherwise move r left to decrease it. Each i costs O(n), giving O(n^2) in total. Trying all triples is O(n^3).",
    complexity: 'Time O(n^2), Space O(1) extra',
    fn: { py: 'three_sum_closest', js: 'threeSumClosest' },
    py: {
      starter: 'def three_sum_closest(nums, target):\n    # write your code here\n    pass\n',
      solution: `def three_sum_closest(nums, target):
    nums = sorted(nums)
    best = nums[0] + nums[1] + nums[2]
    for i in range(len(nums) - 2):
        l, r = i + 1, len(nums) - 1
        while l < r:
            s = nums[i] + nums[l] + nums[r]
            if abs(s - target) < abs(best - target):
                best = s
            if s == target:
                return s
            if s < target:
                l += 1
            else:
                r -= 1
    return best
`,
    },
    js: {
      starter: 'function threeSumClosest(nums, target) {\n  // write your code here\n}\n',
      solution: `function threeSumClosest(nums, target) {
  nums = nums.slice().sort((a, b) => a - b);
  let best = nums[0] + nums[1] + nums[2];
  for (let i = 0; i < nums.length - 2; i++) {
    let l = i + 1, r = nums.length - 1;
    while (l < r) {
      const s = nums[i] + nums[l] + nums[r];
      if (Math.abs(s - target) < Math.abs(best - target)) best = s;
      if (s === target) return s;
      if (s < target) l++;
      else r--;
    }
  }
  return best;
}
`,
    },
    tests: [
      { args: [[-1, 2, 1, -4], 1], expect: 2 },
      { args: [[0, 0, 0], 1], expect: 0 },
      { args: [[1, 1, 1, 1], 3], expect: 3 },
      { args: [[1, 2, 5, 10, 11], 12], expect: 13 },
      { args: [[-5, -3, 0, 4, 9], -20], expect: -8 },
      { args: [[4, 0, 5, -5, 3, 3, 0, -4, -5], -2], expect: -2 },
    ],
  },
  {
    id: 'tp-four-sum',
    title: '4Sum',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Microsoft'],
    statement: "Given an integer array `nums` and a `target`, return all **unique** quadruplets `[a, b, c, d]` of values from four different positions with `a + b + c + d == target`. Sort each quadruplet ascending and sort the list of quadruplets lexicographically.",
    examples: [
      { input: 'nums = [1, 0, -1, 0, -2, 2], target = 0', output: '[[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]]' },
      { input: 'nums = [3, 3, 3, 3, 3], target = 12', output: '[[3, 3, 3, 3]]' },
    ],
    constraints: ['1 <= nums.length <= 200', '-10^9 <= nums[i], target <= 10^9'],
    hints: ['Extend 3Sum: fix two elements with two loops.', 'Use two pointers for the last two and skip duplicates at every level.'],
    approach: "Sort the array. Use two nested loops to fix the first two values i and j, skipping repeated values at both levels so no quadruplet is produced twice. For the remaining part run the two-pointer search with l = j+1 and r = n-1: move l right if the sum is too small, r left if it is too big, and on a match record it and skip duplicates on both sides. Because indices increase and the array is sorted, the output is already in lexicographic order. The brute force tries all O(n^4) combinations.",
    complexity: 'Time O(n^3), Space O(1) extra',
    fn: { py: 'four_sum', js: 'fourSum' },
    py: {
      starter: 'def four_sum(nums, target):\n    # write your code here\n    pass\n',
      solution: `def four_sum(nums, target):
    nums = sorted(nums)
    n = len(nums)
    res = []
    for i in range(n - 3):
        if i > 0 and nums[i] == nums[i - 1]:
            continue
        for j in range(i + 1, n - 2):
            if j > i + 1 and nums[j] == nums[j - 1]:
                continue
            l, r = j + 1, n - 1
            while l < r:
                s = nums[i] + nums[j] + nums[l] + nums[r]
                if s < target:
                    l += 1
                elif s > target:
                    r -= 1
                else:
                    res.append([nums[i], nums[j], nums[l], nums[r]])
                    l += 1
                    r -= 1
                    while l < r and nums[l] == nums[l - 1]:
                        l += 1
                    while l < r and nums[r] == nums[r + 1]:
                        r -= 1
    return res
`,
    },
    js: {
      starter: 'function fourSum(nums, target) {\n  // write your code here\n}\n',
      solution: `function fourSum(nums, target) {
  nums = nums.slice().sort((a, b) => a - b);
  const n = nums.length, res = [];
  for (let i = 0; i < n - 3; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    for (let j = i + 1; j < n - 2; j++) {
      if (j > i + 1 && nums[j] === nums[j - 1]) continue;
      let l = j + 1, r = n - 1;
      while (l < r) {
        const s = nums[i] + nums[j] + nums[l] + nums[r];
        if (s < target) l++;
        else if (s > target) r--;
        else {
          res.push([nums[i], nums[j], nums[l], nums[r]]);
          l++; r--;
          while (l < r && nums[l] === nums[l - 1]) l++;
          while (l < r && nums[r] === nums[r + 1]) r--;
        }
      }
    }
  }
  return res;
}
`,
    },
    tests: [
      { args: [[1, 0, -1, 0, -2, 2], 0], expect: [[-2, -1, 1, 2], [-2, 0, 0, 2], [-1, 0, 0, 1]] },
      { args: [[3, 3, 3, 3, 3], 12], expect: [[3, 3, 3, 3]] },
      { args: [[1, 2, 3], 6], expect: [] },
      { args: [[1, 2, 3, 4], 10], expect: [[1, 2, 3, 4]] },
      { args: [[2, 2, 2, 2], 9], expect: [] },
      { args: [[-3, -1, 0, 2, 4, 5], 2], expect: [[-3, -1, 2, 4]] },
    ],
  },
  {
    id: 'tp-boats-to-save-people',
    title: 'Boats to Save People',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Flipkart'],
    statement: "`people[i]` is the weight of person `i`. Each boat carries **at most two people** and at most `limit` total weight. Every person weighs at most `limit`. Return the **minimum number of boats** needed to carry everyone.",
    examples: [
      { input: 'people = [3, 2, 2, 1], limit = 3', output: '3', explain: '(1, 2), (2), (3).' },
      { input: 'people = [3, 5, 3, 4], limit = 5', output: '4' },
    ],
    constraints: ['1 <= people.length <= 5 * 10^4', '1 <= people[i] <= limit <= 3 * 10^4'],
    hints: ['Sort the weights.', 'Pair the heaviest remaining person with the lightest if they fit; otherwise the heaviest goes alone.'],
    approach: "Sort the weights and place l at the lightest and r at the heaviest person. The heaviest person must go in some boat; the best partner to try is the lightest person. If they fit together, send both and move both pointers; otherwise the heaviest person goes alone and only r moves. Either way one boat is used. This greedy is optimal because if the lightest person cannot ride with the heaviest, nobody can. The brute force tries all pairings, which is exponential.",
    complexity: 'Time O(n log n) for sorting, Space O(1) extra',
    fn: { py: 'num_rescue_boats', js: 'numRescueBoats' },
    py: {
      starter: 'def num_rescue_boats(people, limit):\n    # write your code here\n    pass\n',
      solution: `def num_rescue_boats(people, limit):
    p = sorted(people)
    l, r = 0, len(p) - 1
    boats = 0
    while l <= r:
        if p[l] + p[r] <= limit:
            l += 1
        r -= 1
        boats += 1
    return boats
`,
    },
    js: {
      starter: 'function numRescueBoats(people, limit) {\n  // write your code here\n}\n',
      solution: `function numRescueBoats(people, limit) {
  const p = people.slice().sort((a, b) => a - b);
  let l = 0, r = p.length - 1, boats = 0;
  while (l <= r) {
    if (p[l] + p[r] <= limit) l++;
    r--;
    boats++;
  }
  return boats;
}
`,
    },
    tests: [
      { args: [[3, 2, 2, 1], 3], expect: 3 },
      { args: [[3, 5, 3, 4], 5], expect: 4 },
      { args: [[1, 2], 3], expect: 1 },
      { args: [[5], 5], expect: 1 },
      { args: [[1, 1, 1, 1], 2], expect: 2 },
      { args: [[2, 4, 6, 8], 10], expect: 2 },
    ],
  },
  {
    id: 'tp-remove-duplicates-ii',
    title: 'Remove Duplicates (Allow Two)',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Microsoft', 'Amazon', 'Wipro'],
    statement: "Given a sorted array `nums`, remove extra duplicates **in place** so that each value appears **at most twice**, keeping the order. Return the list of the first `k` elements that remain.",
    examples: [
      { input: 'nums = [1, 1, 1, 2, 2, 3]', output: '[1, 1, 2, 2, 3]' },
      { input: 'nums = [0, 0, 1, 1, 1, 1, 2, 3, 3]', output: '[0, 0, 1, 1, 2, 3, 3]' },
    ],
    constraints: ['1 <= nums.length <= 3 * 10^4', 'nums is sorted in non-decreasing order'],
    hints: ['Keep a write pointer k.', 'Write nums[i] only if k < 2 or nums[i] differs from nums[k - 2].'],
    approach: "Use a write pointer k. For each value x in order, it may be kept if fewer than two elements have been written, or if x is different from nums[k-2], the element written two positions back. Because the array is sorted, nums[k-2] == x would mean two copies of x already exist. When x is allowed, write it to nums[k] and increment k. This generalises to 'at most m copies' by comparing with nums[k-m]. Counting each run and rebuilding is also O(n) but uses extra memory; shifting elements on deletion is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'remove_duplicates_two', js: 'removeDuplicatesTwo' },
    py: {
      starter: 'def remove_duplicates_two(nums):\n    # write your code here\n    pass\n',
      solution: `def remove_duplicates_two(nums):
    k = 0
    for x in nums:
        if k < 2 or x != nums[k - 2]:
            nums[k] = x
            k += 1
    return nums[:k]
`,
    },
    js: {
      starter: 'function removeDuplicatesTwo(nums) {\n  // write your code here\n}\n',
      solution: `function removeDuplicatesTwo(nums) {
  let k = 0;
  for (const x of nums.slice()) {
    if (k < 2 || x !== nums[k - 2]) nums[k++] = x;
  }
  return nums.slice(0, k);
}
`,
    },
    tests: [
      { args: [[1, 1, 1, 2, 2, 3]], expect: [1, 1, 2, 2, 3] },
      { args: [[0, 0, 1, 1, 1, 1, 2, 3, 3]], expect: [0, 0, 1, 1, 2, 3, 3] },
      { args: [[5]], expect: [5] },
      { args: [[2, 2]], expect: [2, 2] },
      { args: [[4, 4, 4, 4, 4]], expect: [4, 4] },
      { args: [[1, 2, 3]], expect: [1, 2, 3] },
    ],
  },
  {
    id: 'tp-reverse-words',
    title: 'Reverse Words in a String',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['TCS', 'Infosys', 'Microsoft', 'Amazon'],
    statement: "Given a string `s` made of words separated by spaces, return the words in **reverse order**, joined by a **single space**. The input may have leading, trailing or multiple spaces between words; the output must not.",
    examples: [
      { input: 's = "the sky is blue"', output: '"blue is sky the"' },
      { input: 's = "  hello   world  "', output: '"world hello"' },
    ],
    constraints: ['1 <= s.length <= 10^4', 's contains letters, digits and spaces', 'There is at least one word'],
    hints: ['Scan from the right end.', 'Use one pointer to find the end of a word and another to find its start.'],
    approach: "Scan the string from right to left. Skip spaces to find the last character of a word (pointer j), then move another pointer i left until a space or the start is found; s[i+1..j] is a word. Append it to the result list and continue from i. Because we walk from the right, words are collected in reverse order, and extra spaces are skipped naturally. Finally join the words with single spaces. Using split and reverse from the standard library gives the same result; the manual two-pointer scan is what interviewers usually want to see, and both are O(n).",
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'reverse_words', js: 'reverseWords' },
    py: {
      starter: 'def reverse_words(s):\n    # write your code here\n    pass\n',
      solution: `def reverse_words(s):
    words = []
    j = len(s) - 1
    while j >= 0:
        while j >= 0 and s[j] == ' ':
            j -= 1
        if j < 0:
            break
        i = j
        while i >= 0 and s[i] != ' ':
            i -= 1
        words.append(s[i + 1:j + 1])
        j = i
    return ' '.join(words)
`,
    },
    js: {
      starter: 'function reverseWords(s) {\n  // write your code here\n}\n',
      solution: `function reverseWords(s) {
  const words = [];
  let j = s.length - 1;
  while (j >= 0) {
    while (j >= 0 && s[j] === ' ') j--;
    if (j < 0) break;
    let i = j;
    while (i >= 0 && s[i] !== ' ') i--;
    words.push(s.slice(i + 1, j + 1));
    j = i;
  }
  return words.join(' ');
}
`,
    },
    tests: [
      { args: ['the sky is blue'], expect: 'blue is sky the' },
      { args: ['  hello   world  '], expect: 'world hello' },
      { args: ['single'], expect: 'single' },
      { args: ['a good   example'], expect: 'example good a' },
      { args: ['  x  '], expect: 'x' },
      { args: ['1 2 3'], expect: '3 2 1' },
    ],
  },
  {
    id: 'tp-longest-palindromic-substring',
    title: 'Longest Palindromic Substring',
    diff: 'Medium',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Accenture'],
    statement: "Given a string `s`, return the longest substring of `s` that is a palindrome. If several palindromes share the maximum length, return the one that **starts earliest** in `s`.",
    examples: [
      { input: 's = "babad"', output: '"bab"', explain: '"aba" is equally long but starts later.' },
      { input: 's = "cbbd"', output: '"bb"' },
    ],
    constraints: ['1 <= s.length <= 1000', 's contains letters and digits'],
    hints: ['Every palindrome has a centre: one character or the gap between two.', 'Expand two pointers outward from each of the 2n - 1 centres.'],
    approach: "A palindrome mirrors around its centre, which is either a single character (odd length) or the gap between two characters (even length). For each of the 2n-1 centres, place two pointers at the centre and expand outward while the characters match; the span reached is the longest palindrome with that centre. Keep the longest seen, replacing it only when a strictly longer one is found, so that ties keep the earliest start. Each expansion is O(n), giving O(n^2) total with O(1) memory. Checking every substring for being a palindrome is O(n^3). Manacher's algorithm reaches O(n) but is rarely expected.",
    complexity: 'Time O(n^2), Space O(1)',
    fn: { py: 'longest_palindrome', js: 'longestPalindrome' },
    py: {
      starter: 'def longest_palindrome(s):\n    # write your code here\n    pass\n',
      solution: `def longest_palindrome(s):
    start, length = 0, 1
    n = len(s)
    for c in range(n):
        for l, r in ((c, c), (c, c + 1)):
            while l >= 0 and r < n and s[l] == s[r]:
                l -= 1
                r += 1
            if r - l - 1 > length:
                start, length = l + 1, r - l - 1
    return s[start:start + length]
`,
    },
    js: {
      starter: 'function longestPalindrome(s) {\n  // write your code here\n}\n',
      solution: `function longestPalindrome(s) {
  let start = 0, length = 1;
  const n = s.length;
  for (let c = 0; c < n; c++) {
    for (const [a, b] of [[c, c], [c, c + 1]]) {
      let l = a, r = b;
      while (l >= 0 && r < n && s[l] === s[r]) { l--; r++; }
      if (r - l - 1 > length) { start = l + 1; length = r - l - 1; }
    }
  }
  return s.slice(start, start + length);
}
`,
    },
    tests: [
      { args: ['babad'], expect: 'bab' },
      { args: ['cbbd'], expect: 'bb' },
      { args: ['a'], expect: 'a' },
      { args: ['abc'], expect: 'a' },
      { args: ['forgeeksskeegfor'], expect: 'geeksskeeg' },
      { args: ['aaaa'], expect: 'aaaa' },
      { args: ['xabacdcz'], expect: 'aba' },
    ],
  },
  {
    id: 'tp-trapping-rain-water',
    title: 'Trapping Rain Water',
    diff: 'Hard',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    statement: "`height[i]` is the height of a bar of width 1. After it rains, water is trapped between bars. Return the **total units of water** trapped.",
    examples: [
      { input: 'height = [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]', output: '6' },
      { input: 'height = [3, 0, 2]', output: '2' },
    ],
    constraints: ['1 <= height.length <= 2 * 10^4', '0 <= height[i] <= 10^5'],
    hints: ['Water above bar i = min(max to the left, max to the right) - height[i].', 'Two pointers: the side with the smaller max is already decided.'],
    approach: "The water above bar i is min(leftMax, rightMax) - height[i], where leftMax and rightMax are the tallest bars on each side (including i). With two pointers l and r and running maxima leftMax and rightMax, look at the side whose max is smaller. If leftMax <= rightMax, the water at l is fully determined by leftMax, because a bar at least as tall as rightMax exists on the right; add leftMax - height[l] and move l. Otherwise do the mirror step on the right. This uses O(1) memory. Precomputing prefix and suffix max arrays is also O(n) but uses O(n) memory, and recomputing the maxima for every bar is O(n^2).",
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'trap', js: 'trap' },
    py: {
      starter: 'def trap(height):\n    # write your code here\n    pass\n',
      solution: `def trap(height):
    l, r = 0, len(height) - 1
    left_max = right_max = 0
    water = 0
    while l <= r:
        left_max = max(left_max, height[l])
        right_max = max(right_max, height[r])
        if left_max <= right_max:
            water += left_max - height[l]
            l += 1
        else:
            water += right_max - height[r]
            r -= 1
    return water
`,
    },
    js: {
      starter: 'function trap(height) {\n  // write your code here\n}\n',
      solution: `function trap(height) {
  let l = 0, r = height.length - 1, leftMax = 0, rightMax = 0, water = 0;
  while (l <= r) {
    leftMax = Math.max(leftMax, height[l]);
    rightMax = Math.max(rightMax, height[r]);
    if (leftMax <= rightMax) { water += leftMax - height[l]; l++; }
    else { water += rightMax - height[r]; r--; }
  }
  return water;
}
`,
    },
    tests: [
      { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expect: 6 },
      { args: [[3, 0, 2]], expect: 2 },
      { args: [[4, 2, 0, 3, 2, 5]], expect: 9 },
      { args: [[1]], expect: 0 },
      { args: [[1, 2, 3, 4]], expect: 0 },
      { args: [[5, 0, 0, 0, 5]], expect: 15 },
      { args: [[2, 0, 2, 0, 1]], expect: 3 },
    ],
  },
  {
    id: 'tp-merge-without-extra-space',
    title: 'Merge Two Sorted Arrays Without Extra Space',
    diff: 'Hard',
    pattern: 'Two Pointers',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Flipkart'],
    statement: "Given two sorted arrays `a` (size n) and `b` (size m), rearrange the elements **in place using O(1) extra space** so that `a` holds the smallest n elements and `b` holds the remaining m elements, both sorted. Return `[a, b]`.",
    examples: [
      { input: 'a = [1, 4, 7, 8, 10], b = [2, 3, 9]', output: '[[1, 2, 3, 4, 7], [8, 9, 10]]' },
      { input: 'a = [5, 6], b = [1, 2, 3]', output: '[[1, 2], [3, 5, 6]]' },
    ],
    constraints: ['1 <= n, m <= 10^5', '0 <= a[i], b[i] <= 10^9'],
    hints: ['Think of the two arrays as one virtual array of length n + m.', 'Shell-sort style gap method: compare elements gap apart and swap if out of order, halving the gap (rounding up) until it is 1.'],
    approach: "Treat a followed by b as one virtual array of length n+m, where index k < n means a[k] and otherwise b[k-n]. Start with gap = ceil((n+m)/2). Walk two pointers that are gap apart across the virtual array, swapping when the left element is larger. Then shrink the gap to ceil(gap/2) and repeat, finishing after the pass with gap 1. This is the gap (shell sort) method and needs only O(1) extra space. A simpler O(1) idea first swaps the largest of a with the smallest of b using two pointers and then sorts both arrays, which is also accepted. Copying both into a new array and splitting needs O(n+m) memory, which breaks the rule.",
    complexity: 'Time O((n + m) log(n + m)), Space O(1)',
    fn: { py: 'merge_in_place', js: 'mergeInPlace' },
    py: {
      starter: 'def merge_in_place(a, b):\n    # write your code here\n    pass\n',
      solution: `def merge_in_place(a, b):
    n, m = len(a), len(b)

    def get(k):
        return a[k] if k < n else b[k - n]

    def put(k, v):
        if k < n:
            a[k] = v
        else:
            b[k - n] = v

    total = n + m
    gap = (total + 1) // 2
    while gap > 0:
        i, j = 0, gap
        while j < total:
            if get(i) > get(j):
                x, y = get(i), get(j)
                put(i, y)
                put(j, x)
            i += 1
            j += 1
        if gap == 1:
            break
        gap = (gap + 1) // 2
    return [a, b]
`,
    },
    js: {
      starter: 'function mergeInPlace(a, b) {\n  // write your code here\n}\n',
      solution: `function mergeInPlace(a, b) {
  const n = a.length, m = b.length, total = n + m;
  const get = k => (k < n ? a[k] : b[k - n]);
  const put = (k, v) => { if (k < n) a[k] = v; else b[k - n] = v; };
  let gap = Math.ceil(total / 2);
  while (gap > 0) {
    for (let i = 0, j = gap; j < total; i++, j++) {
      if (get(i) > get(j)) { const x = get(i); put(i, get(j)); put(j, x); }
    }
    if (gap === 1) break;
    gap = Math.ceil(gap / 2);
  }
  return [a, b];
}
`,
    },
    tests: [
      { args: [[1, 4, 7, 8, 10], [2, 3, 9]], expect: [[1, 2, 3, 4, 7], [8, 9, 10]] },
      { args: [[5, 6], [1, 2, 3]], expect: [[1, 2], [3, 5, 6]] },
      { args: [[1, 2], [3, 4]], expect: [[1, 2], [3, 4]] },
      { args: [[9], [1]], expect: [[1], [9]] },
      { args: [[1, 5, 9, 10, 15, 20], [2, 3, 8, 13]], expect: [[1, 2, 3, 5, 8, 9], [10, 13, 15, 20]] },
      { args: [[2, 2, 2], [1, 2]], expect: [[1, 2, 2], [2, 2]] },
    ],
  },
];
