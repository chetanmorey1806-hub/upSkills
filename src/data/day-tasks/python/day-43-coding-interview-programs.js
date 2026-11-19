export default {
  lesson: 'day-43-coding-interview-programs',
  minutes: 40,
  intro: 'Solve the most asked Python interview programs (number, string, list, dict, searching and sorting) and reason about their Big-O.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the time complexity of **binary search** on a sorted list of n items?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 1,
      explain: 'Each step halves the search range, so about log₂(n) steps: 1,000,000 items need only ~20 comparisons. Linear search is O(n); sorting first costs O(n log n).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Number programs:\n- `is_armstrong(n)` → True if the sum of each digit raised to the number of digits equals n (153 = 1³ + 5³ + 3³)\n- `gcd(a, b)` → greatest common divisor using Euclid’s algorithm (no `math.gcd`)',
      example: { title: 'Euclid’s idea', code: '# gcd(48, 18) = gcd(18, 48 % 18) = gcd(18, 12) = gcd(12, 6) = gcd(6, 0) = 6' },
      starter: `def is_armstrong(n):
    pass  # TODO

def gcd(a, b):
    pass  # TODO
`,
      solution: `def is_armstrong(n):
    digits = str(n)
    k = len(digits)
    return sum(int(d) ** k for d in digits) == n

def gcd(a, b):
    while b:
        a, b = b, a % b
    return a
`,
      tests: [
        { call: '[is_armstrong(153), is_armstrong(9474), is_armstrong(154), is_armstrong(7)]', expect: [true, true, false, true] },
        { call: '[gcd(48, 18), gcd(17, 5), gcd(100, 25)]', expect: [6, 1, 25] },
        { call: "'math' not in gcd.__code__.co_names", expect: true, msg: 'write Euclid yourself (no math.gcd)' },
      ],
      explain: 'The power is the **number of digits** (3 for 153, 4 for 9474), not always 3. Euclid replaces (a, b) with (b, a % b) until b is 0: O(log min(a, b)) instead of trying every divisor.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'String programs:\n- `is_anagram(a, b)` → True if the two words use the same letters, ignoring case and spaces (`"Listen"`, `"Silent"` → True)\n- `first_unique(s)` → first character that appears exactly once, or `None`',
      example: { title: 'counting letters', code: 'from collections import Counter\nprint(Counter("aab") == Counter("aba"))   # True' },
      starter: `def is_anagram(a, b):
    pass  # TODO

def first_unique(s):
    pass  # TODO
`,
      solution: `from collections import Counter

def is_anagram(a, b):
    clean = lambda s: s.replace(" ", "").lower()
    return Counter(clean(a)) == Counter(clean(b))

def first_unique(s):
    counts = Counter(s)
    for ch in s:
        if counts[ch] == 1:
            return ch
    return None
`,
      tests: [
        { call: '[is_anagram("Listen", "Silent"), is_anagram("Dormitory", "Dirty room"), is_anagram("abc", "abd"), is_anagram("aab", "abb")]', expect: [true, true, false, false] },
        { call: '[first_unique("aabbcdd"), first_unique("programming"), first_unique("aabb")]', expect: ['c', 'p', null] },
      ],
      explain: 'Comparing letter **counts** (Counter or sorted strings) handles repeated letters; comparing sets would wrongly say "aab" and "abb" are anagrams. Both solutions are O(n) with a dictionary.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'List programs:\n- `second_largest(nums)` → the second largest **distinct** value, or `None` if it does not exist\n- `two_sum(nums, target)` → indexes `(i, j)` with i < j of the first pair adding up to target (use a dict for O(n)), or `None`',
      example: { title: 'remembering what we have seen', code: 'seen = {}\nfor i, x in enumerate([4, 7, 1]):\n    seen[x] = i\nprint(seen)   # {4: 0, 7: 1, 1: 2}' },
      starter: `def second_largest(nums):
    pass  # TODO

def two_sum(nums, target):
    pass  # TODO
`,
      solution: `def second_largest(nums):
    first = second = None
    for x in nums:
        if first is None or x > first:
            first, second = x, first
        elif x != first and (second is None or x > second):
            second = x
    return second

def two_sum(nums, target):
    seen = {}
    for j, x in enumerate(nums):
        if target - x in seen:
            return (seen[target - x], j)
        seen[x] = j
    return None
`,
      tests: [
        { call: '[second_largest([10, 40, 30, 40]), second_largest([5, 5]), second_largest([-1, -7])]', expect: [30, null, -7] },
        { call: 'two_sum([2, 7, 11, 15], 9)', expect: [0, 1] },
        { call: 'two_sum([3, 2, 4], 6)', expect: [1, 2] },
        { call: 'two_sum([1, 2], 10)', expect: null },
      ],
      explain: 'For second largest, duplicates of the maximum must be skipped (40, 40 → answer 30). Two Sum with a dict checks "have I already seen target − x?" in O(1), giving O(n) overall instead of O(n²) nested loops.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: 'Searching and sorting (no built-in sort / index):\n- `binary_search(nums, target)` → index of target in a **sorted** list, or -1\n- `bubble_sort(nums)` → a **new** sorted list (ascending), leaving the input unchanged',
      example: { title: 'binary search idea', code: 'lo, hi = 0, len(nums) - 1\nwhile lo <= hi:\n    mid = (lo + hi) // 2\n    # compare nums[mid] with target, then move lo or hi' },
      starter: `def binary_search(nums, target):
    pass  # TODO

def bubble_sort(nums):
    pass  # TODO
`,
      solution: `def binary_search(nums, target):
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

def bubble_sort(nums):
    a = nums[:]
    n = len(a)
    for i in range(n - 1):
        swapped = False
        for j in range(n - 1 - i):
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:
            break
    return a
`,
      tests: [
        { call: '[binary_search([3, 8, 15, 22, 40], 22), binary_search([3, 8, 15, 22, 40], 3), binary_search([3, 8, 15, 22, 40], 9), binary_search([], 1)]', expect: [3, 0, -1, -1] },
        { call: 'bubble_sort([64, 25, 12, 22, 11])', expect: [11, 12, 22, 25, 64] },
        { call: '(lambda d: (bubble_sort(d), d)[1])([3, 1, 2])', expect: [3, 1, 2], msg: 'the input list must not be changed' },
        { call: "'sorted' not in bubble_sort.__code__.co_names and 'sort' not in bubble_sort.__code__.co_names", expect: true, msg: 'implement bubble sort yourself (no sorted()/sort())' },
      ],
      explain: 'Binary search needs `lo <= hi` (not `<`) or it misses the last candidate; always move past `mid` (mid ± 1) to avoid infinite loops. Bubble sort is O(n²); the `swapped` flag makes an already sorted list O(n). Copy the list first (`nums[:]`) to avoid side effects.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: 'Dictionary program. Write `group_by_length(words)` that returns a dict length → list of words (original order), sorted by length (keys ascending).\n\n`group_by_length(["hi", "code", "py", "java", "c"])` → `{1: ["c"], 2: ["hi", "py"], 4: ["code", "java"]}`',
      example: { title: 'defaultdict', code: 'from collections import defaultdict\nd = defaultdict(list)\nd["a"].append(1)\nprint(dict(d))   # {\'a\': [1]}' },
      starter: `def group_by_length(words):
    return {}  # TODO
`,
      solution: `from collections import defaultdict

def group_by_length(words):
    groups = defaultdict(list)
    for w in words:
        groups[len(w)].append(w)
    return {k: groups[k] for k in sorted(groups)}
`,
      tests: [
        { call: 'group_by_length(["hi", "code", "py", "java", "c"])', expect: { 1: ['c'], 2: ['hi', 'py'], 4: ['code', 'java'] } },
        { call: 'list(group_by_length(["abcd", "a", "ab"]).keys())', expect: [1, 2, 4], msg: 'keys must be in ascending order' },
      ],
      explain: '`defaultdict(list)` creates an empty list for new keys automatically. Dicts keep insertion order, so building a new dict from `sorted(groups)` gives ascending keys.',
    },
  ],
};
