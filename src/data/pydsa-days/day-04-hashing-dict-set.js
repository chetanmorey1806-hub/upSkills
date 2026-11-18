export default {
  id: "day-04-hashing-dict-set",
  title: "Hashing with dict and set: Frequency Counting, Two Sum and Anagrams",
  module: "Module 1: Foundations",
  day: 4,
  level: "Beginner",
  duration: "3 hours",
  summary: "Understand how hash tables power Python's dict and set, why lookups are O(1) on average, and use hashing patterns (frequency counting, seen-set, complement lookup, grouping by key, prefix-sum maps) to solve the most frequently asked interview problems.",
  objectives: [
    "Explain how a hash table works: hash function, buckets, collisions and resizing",
    "Know which Python objects are hashable and why lists cannot be dict keys",
    "Use dict, set, Counter and defaultdict for frequency counting",
    "Solve Two Sum, Group Anagrams and Subarray Sum Equals K with hashing",
    "Analyse average vs worst-case complexity of hash operations",
  ],
  theory: [
    {
      heading: "What is Hashing?",
      content: `A hash table stores key-value pairs in an internal array. A **hash function** converts a key into an integer (hash('apple')), and that number is turned into an array index. To look up a key, Python hashes it again and jumps straight to that slot, so on average insert, lookup and delete are O(1), independent of the number of items.

Python's \`dict\` is a hash map (key -> value) and \`set\` is a hash set (keys only). Since Python 3.7, dicts also remember insertion order.`,
      points: [
        "dict: d[k] = v, d[k], d.get(k, default), k in d, del d[k] -> O(1) average",
        "set: s.add(x), x in s, s.remove(x), s.discard(x) -> O(1) average",
        "Set operations: a | b, a & b, a - b -> O(len(a) + len(b)) roughly",
        "Iterating over a dict or set is O(n)",
      ],
    },
    {
      heading: "Collisions, Load Factor and Worst Case",
      content: `Two different keys can produce the same slot: this is a **collision**. CPython uses **open addressing**: if a slot is taken, it probes other slots in a pseudo-random sequence until it finds a free one. When the table gets about two-thirds full, it is resized to a bigger table and all keys are re-inserted (amortized O(1) per insert).

If many keys collide (bad hash function or a deliberate attack), lookups degrade to O(n). That is why we say dict/set operations are O(1) **average**, O(n) **worst case**.`,
      tip: "In interviews say: \"O(1) average-case lookup with a hash map, O(n) extra space.\"",
    },
    {
      heading: "Hashable Keys",
      content: `A key must be **hashable**: its hash must never change during its lifetime and it must support equality comparison. Immutable built-ins are hashable: int, float, str, bool, tuple (if all items are hashable), frozenset. Mutable containers (list, dict, set) are NOT hashable because their contents could change, which would make the stored hash wrong.

To use a list as a key, convert it to a tuple: d[tuple(lst)]. This trick is used in Group Anagrams (tuple of 26 counts) and in grid problems (tuple of coordinates).`,
      syntax: `d = {}
d[(1, 2)] = "ok"          # tuple key works
d[[1, 2]] = "fails"       # TypeError: unhashable type: 'list'
`,
    },
    {
      heading: "Counter, defaultdict and get()",
      content: "The collections module gives specialised dicts that make counting short and bug-free.",
      syntax: `from collections import Counter, defaultdict

freq = Counter("banana")          # Counter({'a': 3, 'n': 2, 'b': 1})
freq.most_common(1)               # [('a', 3)]

groups = defaultdict(list)        # missing key -> new empty list
groups["fruits"].append("mango")

counts = {}
for ch in "banana":
    counts[ch] = counts.get(ch, 0) + 1
`,
      points: [
        "Counter(iterable) counts in O(n); missing keys return 0 instead of KeyError",
        "most_common(k) uses a heap: O(n log k)",
        "defaultdict(int) / defaultdict(list) / defaultdict(set) create defaults automatically",
      ],
    },
    {
      heading: "Core Hashing Patterns",
      content: "Almost every hashing question uses one of these patterns:",
      points: [
        "Seen set: 'have I seen this before?' -> duplicates, cycle detection, first repeat",
        "Complement lookup: store value -> index; for each x check if target - x was seen (Two Sum)",
        "Frequency map: count occurrences -> anagrams, majority element, top-k",
        "Group by canonical key: sorted word or count tuple -> group anagrams",
        "Prefix sum + map: count subarrays with sum k, even with negative numbers",
        "Index map: value -> last index, for sliding windows and distance problems",
      ],
    },
    {
      heading: "Complexity of Today's Problems",
      content: "Two Sum with a hash map: O(n) time, O(n) space (vs O(n^2) brute force). Group Anagrams with sorted keys: O(n * k log k) where k is the max word length; with a 26-count tuple key: O(n * k). Subarray Sum Equals K: O(n) time, O(n) space. Longest Consecutive Sequence: O(n) using a set and only starting counts at sequence starts.",
    },
  ],
  examples: [
    {
      title: "Frequency Counting Three Ways",
      scenario: "Count how many times each product was ordered today.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter, defaultdict

orders = ["tea", "coffee", "tea", "samosa", "tea", "coffee"]

counts = {}
for item in orders:
    counts[item] = counts.get(item, 0) + 1
print("dict.get   :", counts)

dd = defaultdict(int)
for item in orders:
    dd[item] += 1
print("defaultdict:", dict(dd))

c = Counter(orders)
print("Counter    :", c)
print("Top 2      :", c.most_common(2))
print("Missing key:", c["juice"])
`,
      python: {
        files: {
          "main.py": `from collections import Counter, defaultdict

orders = ["tea", "coffee", "tea", "samosa", "tea", "coffee"]

counts = {}
for item in orders:
    counts[item] = counts.get(item, 0) + 1
print("dict.get   :", counts)

dd = defaultdict(int)
for item in orders:
    dd[item] += 1
print("defaultdict:", dict(dd))

c = Counter(orders)
print("Counter    :", c)
print("Top 2      :", c.most_common(2))
print("Missing key:", c["juice"])
`,
        },
      },
      result: `dict.get   : {'tea': 3, 'coffee': 2, 'samosa': 1}
defaultdict: {'tea': 3, 'coffee': 2, 'samosa': 1}
Counter    : Counter({'tea': 3, 'coffee': 2, 'samosa': 1})
Top 2      : [('tea', 3), ('coffee', 2)]
Missing key: 0`,
      explanation: "All three build the same counts in O(n). Counter is the shortest and returns 0 for missing keys instead of raising KeyError. most_common gives the highest counts first.",
    },
    {
      title: "Two Sum with a Hash Map",
      scenario: "LeetCode 1: return the indices of two numbers that add up to target. The array is NOT sorted, so two pointers would lose the original indices.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def two_sum(nums, target):
    seen = {}                       # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
print(two_sum([3, 2, 4], 6))
print(two_sum([3, 3], 6))
`,
      python: {
        files: {
          "main.py": `def two_sum(nums, target):
    seen = {}                       # value -> index
    for i, x in enumerate(nums):
        need = target - x
        if need in seen:
            return [seen[need], i]
        seen[x] = i
    return []

print(two_sum([2, 7, 11, 15], 9))
print(two_sum([3, 2, 4], 6))
print(two_sum([3, 3], 6))
`,
        },
      },
      result: `[0, 1]
[1, 2]
[0, 1]`,
      explanation: "For each number we ask: has its complement already appeared? Checking a dict is O(1) average, so the total is O(n) time and O(n) space. We insert x AFTER checking so that an element is not paired with itself.",
    },
    {
      title: "Group Anagrams",
      scenario: "LeetCode 49: group words that are anagrams of each other.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = [0] * 26
        for ch in w:
            key[ord(ch) - ord("a")] += 1
        groups[tuple(key)].append(w)     # list -> tuple to be hashable
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))

# Simpler key: the sorted word
by_sorted = defaultdict(list)
for w in ["listen", "silent", "enlist", "google"]:
    by_sorted["".join(sorted(w))].append(w)
print(dict(by_sorted))
`,
      python: {
        files: {
          "main.py": `from collections import defaultdict

def group_anagrams(words):
    groups = defaultdict(list)
    for w in words:
        key = [0] * 26
        for ch in w:
            key[ord(ch) - ord("a")] += 1
        groups[tuple(key)].append(w)     # list -> tuple to be hashable
    return list(groups.values())

print(group_anagrams(["eat", "tea", "tan", "ate", "nat", "bat"]))

# Simpler key: the sorted word
by_sorted = defaultdict(list)
for w in ["listen", "silent", "enlist", "google"]:
    by_sorted["".join(sorted(w))].append(w)
print(dict(by_sorted))
`,
        },
      },
      result: `[['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]
{'eilnst': ['listen', 'silent', 'enlist'], 'eggloo': ['google']}`,
      explanation: "Anagrams share the same letter counts, so the count tuple (or the sorted word) is a canonical key. The count-tuple key is O(k) per word; sorting is O(k log k). Both need O(n * k) space.",
    },
    {
      title: "Subarray Sum Equals K (with negatives)",
      scenario: "LeetCode 560: count contiguous subarrays whose sum is k. Sliding window fails because numbers can be negative.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import defaultdict

def subarray_sum(nums, k):
    count = 0
    prefix = 0
    seen = defaultdict(int)
    seen[0] = 1                 # empty prefix
    for x in nums:
        prefix += x
        count += seen[prefix - k]   # earlier prefixes that leave sum k
        seen[prefix] += 1
    return count

print(subarray_sum([1, 1, 1], 2))
print(subarray_sum([1, 2, 3], 3))
print(subarray_sum([3, 4, 7, 2, -3, 1, 4, 2], 7))
`,
      python: {
        files: {
          "main.py": `from collections import defaultdict

def subarray_sum(nums, k):
    count = 0
    prefix = 0
    seen = defaultdict(int)
    seen[0] = 1                 # empty prefix
    for x in nums:
        prefix += x
        count += seen[prefix - k]   # earlier prefixes that leave sum k
        seen[prefix] += 1
    return count

print(subarray_sum([1, 1, 1], 2))
print(subarray_sum([1, 2, 3], 3))
print(subarray_sum([3, 4, 7, 2, -3, 1, 4, 2], 7))
`,
        },
      },
      result: `2
2
4`,
      explanation: "sum(i..j) = prefix[j] - prefix[i-1]. If that equals k, then prefix[i-1] = prefix[j] - k. So for each position we count how many earlier prefixes equal prefix - k. O(n) time, O(n) space.",
    },
    {
      title: "Longest Consecutive Sequence",
      scenario: "LeetCode 128: find the length of the longest run of consecutive integers in an unsorted array, in O(n).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for x in num_set:
        if x - 1 not in num_set:        # x starts a sequence
            length = 1
            while x + length in num_set:
                length += 1
            best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))
print(longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]))
`,
      python: {
        files: {
          "main.py": `def longest_consecutive(nums):
    num_set = set(nums)
    best = 0
    for x in num_set:
        if x - 1 not in num_set:        # x starts a sequence
            length = 1
            while x + length in num_set:
                length += 1
            best = max(best, length)
    return best

print(longest_consecutive([100, 4, 200, 1, 3, 2]))
print(longest_consecutive([0, 3, 7, 2, 5, 8, 4, 6, 0, 1]))
`,
        },
      },
      result: `4
9`,
      explanation: "We only start counting from numbers that have no left neighbour, so each number is visited by the inner while loop at most once overall. Total O(n) time, O(n) space. Sorting would be O(n log n).",
    },
  ],
  interview: [
    {
      q: "How does a Python dict achieve O(1) average lookup?",
      a: "It is a hash table. hash(key) produces an integer that is mapped to a slot in an internal array. Lookup re-hashes the key and goes directly to that slot, checking equality. Collisions are handled by open addressing (probing other slots). The table is resized when about 2/3 full to keep probes short.",
      level: "Medium",
    },
    {
      q: "Why can't a list be a dictionary key?",
      a: "Lists are mutable, so their contents and therefore their hash could change after insertion, and the key would end up in the wrong slot. Python makes lists unhashable. Use a tuple (immutable) instead.",
      level: "Easy",
    },
    {
      q: "What is the worst-case time complexity of dict lookup and when does it happen?",
      a: "O(n), when many keys collide into the same probe sequence, e.g. a poor custom __hash__ that returns a constant, or crafted inputs. Python randomises string hashes per process (PYTHONHASHSEED) to make such attacks hard.",
      level: "Medium",
    },
    {
      q: "Explain the O(n) Two Sum solution.",
      a: "Iterate once, keeping a dict from value to index. For each x, compute need = target - x. If need is in the dict, return both indices; otherwise store x. Each step is O(1) average, so total O(n) time and O(n) space.",
      level: "Easy",
    },
    {
      q: "If you implement __eq__ on a class, what must you do about __hash__?",
      a: "Objects that compare equal must have equal hashes. If you define __eq__, Python sets __hash__ to None (unhashable) unless you also define __hash__, usually by hashing a tuple of the same fields used in __eq__. Those fields should be immutable.",
      level: "Hard",
    },
    {
      q: "Set vs list: when would you choose each?",
      a: "Use a set for fast membership tests and uniqueness (O(1) average). Use a list when order, duplicates or indexing matter. Sets are unordered and use more memory per element than lists.",
      level: "Easy",
    },
    {
      q: "How do you find the majority element (appears more than n/2 times)?",
      a: "With a Counter: O(n) time, O(n) space. The optimal Boyer-Moore voting algorithm uses O(1) space: keep a candidate and a counter; increment when equal, decrement otherwise, and switch candidate when the counter is 0.",
      level: "Medium",
    },
    {
      q: "Why does Subarray Sum Equals K use prefix sums with a hash map instead of a sliding window?",
      a: "Negative numbers break the monotonic behaviour required by a sliding window. Prefix sums turn 'sum of subarray = k' into 'prefix[j] - prefix[i] = k', and a hash map counts earlier prefixes equal to prefix[j] - k in O(1). Initialise the map with {0: 1} to count subarrays starting at index 0.",
      level: "Hard",
    },
    {
      q: "What is the difference between dict.get(k) and dict[k]?",
      a: "d[k] raises KeyError if k is missing. d.get(k) returns None, and d.get(k, default) returns the default. Both are O(1) average.",
      level: "Easy",
    },
    {
      q: "Group Anagrams: sorted key vs count key, which is faster?",
      a: "For n words of max length k, a sorted-string key costs O(n * k log k); a 26-length count tuple costs O(n * k) (plus O(26) to build the tuple). The count key is asymptotically faster for long words; for short words both are fine.",
      level: "Medium",
    },
    {
      q: "How would you check if an array has two elements whose difference is exactly k?",
      a: "Put all values in a set (or a Counter if k = 0). For each x, check if x + k is in the set. O(n) time and space. For k = 0 you need a value that appears at least twice.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "First Unique Character (LeetCode 387): Return the index of the first non-repeating character, or -1. 'leetcode' -> 0, 'loveleetcode' -> 2.",
      hint: "Count first, then scan again in order.",
      solution: `from collections import Counter

def first_uniq_char(s):
    # Time O(n), Space O(1) for a fixed alphabet
    freq = Counter(s)
    for i, ch in enumerate(s):
        if freq[ch] == 1:
            return i
    return -1

print(first_uniq_char("leetcode"))      # 0
print(first_uniq_char("loveleetcode"))  # 2
print(first_uniq_char("aabb"))          # -1
`,
    },
    {
      task: "Intersection of Two Arrays II (LeetCode 350): Return the intersection including duplicates. [1,2,2,1], [2,2] -> [2,2].",
      hint: "Counter of one list; walk the other and decrement.",
      solution: `from collections import Counter

def intersect(nums1, nums2):
    # Time O(n + m), Space O(min(n, m))
    if len(nums1) > len(nums2):
        nums1, nums2 = nums2, nums1
    counts = Counter(nums1)
    result = []
    for x in nums2:
        if counts[x] > 0:
            result.append(x)
            counts[x] -= 1
    return result

print(intersect([1, 2, 2, 1], [2, 2]))        # [2, 2]
print(intersect([4, 9, 5], [9, 4, 9, 8, 4]))  # [9, 4]
`,
    },
    {
      task: "Top K Frequent Elements (LeetCode 347): [1,1,1,2,2,3], k=2 -> [1,2]. Aim for better than O(n log n).",
      hint: "Bucket sort: index = frequency, value = list of numbers with that frequency.",
      solution: `from collections import Counter

def top_k_frequent(nums, k):
    # Time O(n), Space O(n)
    freq = Counter(nums)
    buckets = [[] for _ in range(len(nums) + 1)]
    for num, f in freq.items():
        buckets[f].append(num)
    result = []
    for f in range(len(buckets) - 1, 0, -1):
        for num in buckets[f]:
            result.append(num)
            if len(result) == k:
                return result
    return result

print(top_k_frequent([1, 1, 1, 2, 2, 3], 2))  # [1, 2]
`,
    },
    {
      task: "Isomorphic Strings (LeetCode 205): 'egg','add' -> True; 'foo','bar' -> False. Each character must map to exactly one character, both ways.",
      hint: "Keep two dicts: s->t and t->s, and check consistency.",
      solution: `def is_isomorphic(s, t):
    # Time O(n), Space O(alphabet)
    if len(s) != len(t):
        return False
    s_to_t, t_to_s = {}, {}
    for a, b in zip(s, t):
        if s_to_t.get(a, b) != b or t_to_s.get(b, a) != a:
            return False
        s_to_t[a] = b
        t_to_s[b] = a
    return True

print(is_isomorphic("egg", "add"))      # True
print(is_isomorphic("foo", "bar"))      # False
print(is_isomorphic("paper", "title"))  # True
`,
    },
    {
      task: "Contains Duplicate II (LeetCode 219): Return True if there are two equal values whose indices differ by at most k. [1,2,3,1], k=3 -> True.",
      hint: "Dict of value -> last index seen.",
      solution: `def contains_nearby_duplicate(nums, k):
    # Time O(n), Space O(n)
    last = {}
    for i, x in enumerate(nums):
        if x in last and i - last[x] <= k:
            return True
        last[x] = i
    return False

print(contains_nearby_duplicate([1, 2, 3, 1], 3))        # True
print(contains_nearby_duplicate([1, 2, 3, 1, 2, 3], 2))  # False
`,
    },
  ],
  quiz: [
    {
      question: "Average time complexity of `key in my_dict`?",
      options: [
        "O(n)",
        "O(log n)",
        "O(1)",
        "O(n log n)",
      ],
      answer: 2,
      explanation: "Hash tables give constant average-time lookup.",
    },
    {
      question: "Which of these can be a dict key?",
      options: [
        "[1, 2]",
        "{1, 2}",
        "(1, 2)",
        "{'a': 1}",
      ],
      answer: 2,
      explanation: "Tuples of hashable items are hashable; lists, sets and dicts are not.",
    },
    {
      question: "What does Counter('aab')['z'] return?",
      options: [
        "KeyError",
        "None",
        "0",
        "-1",
      ],
      answer: 2,
      explanation: "Counter returns 0 for missing keys.",
    },
    {
      question: "Two Sum using a hash map has what time and space complexity?",
      options: [
        "O(n^2), O(1)",
        "O(n log n), O(1)",
        "O(n), O(n)",
        "O(n), O(1)",
      ],
      answer: 2,
      explanation: "One pass with O(1) lookups, storing up to n entries.",
    },
    {
      question: "How does CPython resolve hash collisions in dict?",
      options: [
        "Chaining with linked lists",
        "Open addressing with probing",
        "It raises an error",
        "Binary search trees",
      ],
      answer: 1,
      explanation: "CPython dicts and sets use open addressing.",
    },
    {
      question: "In Subarray Sum Equals K, why is the map initialised with {0: 1}?",
      options: [
        "To avoid KeyError",
        "To count subarrays that start at index 0",
        "To handle k = 0 only",
        "It is not needed",
      ],
      answer: 1,
      explanation: "A prefix equal to k itself means the subarray from index 0 sums to k, which needs an earlier prefix of 0.",
    },
  ],
};
