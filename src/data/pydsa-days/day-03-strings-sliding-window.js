export default {
  id: "day-03-strings-sliding-window",
  title: "String Problems and the Sliding Window Technique",
  module: "Module 1: Foundations",
  day: 3,
  level: "Beginner",
  duration: "3 hours",
  summary: "Learn how Python strings behave (immutability, slicing costs, join), solve common string interview problems, and master fixed-size and variable-size sliding windows to handle substring and subarray questions in O(n).",
  objectives: [
    "Explain string immutability and why ''.join() beats += in loops",
    "Use ord(), chr(), slicing and built-in string methods correctly in problems",
    "Solve fixed-size window problems such as maximum sum of k consecutive elements",
    "Solve variable-size window problems such as longest substring without repeating characters",
    "Analyse why a sliding window is O(n) even with a nested while loop",
  ],
  theory: [
    {
      heading: "Python Strings for DSA",
      content: `A Python str is an immutable sequence of Unicode characters. Immutable means you cannot change s[0] = 'x'; every 'modification' creates a new string. Indexing s[i] and len(s) are O(1). Slicing s[a:b] creates a new string in O(b - a). Comparing two strings is O(min(len)) in the worst case.

To build a string piece by piece, append pieces to a list and call ''.join(list) at the end, which is O(total length).`,
      points: [
        "ord('a') = 97, chr(97) = 'a'; ord(ch) - ord('a') maps 'a'..'z' to 0..25",
        "s[::-1] reverses a string in O(n)",
        "s.split(), s.strip(), s.lower(), s.replace() are all O(n)",
        "ch.isalnum(), ch.isalpha(), ch.isdigit() help to filter characters",
        "sub in s is a substring search: roughly O(n * m) worst case, usually fast in practice",
      ],
    },
    {
      heading: "Common String Problem Patterns",
      content: "Most string interview questions fall into a few patterns. Recognising the pattern is the key skill.",
      points: [
        "Two pointers: palindrome checks, reversing words, comparing from both ends",
        "Frequency counting (dict / Counter / array of 26): anagrams, first unique character",
        "Sliding window: longest/shortest substring with some property",
        "Stack: balanced brackets, removing adjacent duplicates (Day 6)",
        "Expand around centre: longest palindromic substring",
        "Prefix comparison: longest common prefix",
      ],
    },
    {
      heading: "What is a Sliding Window?",
      content: `A sliding window is a contiguous range [left, right] inside an array or string. Instead of recomputing the answer for every possible subarray (O(n^2) or worse), you move the window step by step and update the answer using only what entered and what left the window.

**Fixed-size window:** the window length k is given. Add the new element on the right, remove the old element on the left.

**Variable-size window:** expand right to include more elements; when the window becomes invalid, shrink from the left until it is valid again. Track the best window seen.`,
      syntax: `# Fixed window of size k
window = sum(arr[:k])
best = window
for right in range(k, len(arr)):
    window += arr[right] - arr[right - k]
    best = max(best, window)

# Variable window
left = 0
for right in range(len(s)):
    add s[right] to window state
    while window is invalid:
        remove s[left] from window state
        left += 1
    update answer with window [left, right]
`,
    },
    {
      heading: "Why Sliding Window is O(n)",
      content: "In a variable window there is a while loop inside a for loop, which looks like O(n^2). But the left pointer only ever moves forward and can move at most n times in total across the whole run. The right pointer also moves n times. So total work is O(n + n) = O(n). This counting argument is called amortized analysis.",
      tip: "Interviewers often ask exactly this: \"There is a nested loop, so isn't it O(n^2)?\" Answer with the 'each pointer moves at most n times' argument.",
    },
    {
      heading: "Choosing the Window State",
      content: "The window needs some state that can be updated in O(1) when one element enters or leaves: a running sum, a count dict, a set of characters, or a 'last seen index' dict. For lowercase-only strings an array of 26 counts is also common and gives O(1) space (constant 26).",
      points: [
        "Sum of window -> integer running sum",
        "Distinct characters -> dict of counts; len(dict) = distinct count",
        "No repeats -> set, or dict of last seen index",
        "Matching another string's characters -> two count dicts plus a 'matched' counter",
      ],
      tip: "Sliding window with a running sum only works when all numbers are non-negative. With negatives, use prefix sums + hashing (Day 4).",
    },
    {
      heading: "Complexity Cheat Sheet for Today",
      content: "Fixed window: O(n) time, O(1) space. Longest substring without repeating characters: O(n) time, O(min(n, alphabet)) space. Minimum window substring: O(n + m) time. Brute force over all substrings is O(n^2) substrings, and checking each is O(n), giving O(n^3), which is why windows matter.",
    },
  ],
  examples: [
    {
      title: "String Basics: immutability, ord/chr and join",
      scenario: "Practise the operations you will use in almost every string problem.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `s = "python"
try:
    s[0] = "P"
except TypeError as e:
    print("Error:", e)

print(s[::-1])
print(ord("a"), ord("z"), chr(ord("a") + 2))

# Caesar shift by 1 using a list + join (O(n))
shifted = []
for ch in "xyz":
    shifted.append(chr((ord(ch) - ord("a") + 1) % 26 + ord("a")))
print("".join(shifted))

words = "  learn   dsa with python  ".split()
print(words)
print(" ".join(reversed(words)))
`,
      python: {
        files: {
          "main.py": `s = "python"
try:
    s[0] = "P"
except TypeError as e:
    print("Error:", e)

print(s[::-1])
print(ord("a"), ord("z"), chr(ord("a") + 2))

# Caesar shift by 1 using a list + join (O(n))
shifted = []
for ch in "xyz":
    shifted.append(chr((ord(ch) - ord("a") + 1) % 26 + ord("a")))
print("".join(shifted))

words = "  learn   dsa with python  ".split()
print(words)
print(" ".join(reversed(words)))
`,
        },
      },
      result: `Error: 'str' object does not support item assignment
nohtyp
97 122 c
yza
['learn', 'dsa', 'with', 'python']
python with dsa learn`,
      explanation: "Strings cannot be changed in place, so assignment to an index raises TypeError. ord/chr convert between characters and numbers, which helps in shifting and counting. split() without arguments removes extra spaces, and ' '.join builds the result efficiently.",
    },
    {
      title: "Fixed Window: Best 3-Day Sales Streak",
      scenario: "A store has daily sales. Find the maximum total sales over any 3 consecutive days.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def max_sum_window(sales, k):
    window = sum(sales[:k])
    best, best_start = window, 0
    for right in range(k, len(sales)):
        window += sales[right] - sales[right - k]   # add new, drop old
        if window > best:
            best, best_start = window, right - k + 1
    return best, sales[best_start:best_start + k]

sales = [120, 80, 200, 150, 90, 300, 60]
print(max_sum_window(sales, 3))
`,
      python: {
        files: {
          "main.py": `def max_sum_window(sales, k):
    window = sum(sales[:k])
    best, best_start = window, 0
    for right in range(k, len(sales)):
        window += sales[right] - sales[right - k]   # add new, drop old
        if window > best:
            best, best_start = window, right - k + 1
    return best, sales[best_start:best_start + k]

sales = [120, 80, 200, 150, 90, 300, 60]
print(max_sum_window(sales, 3))
`,
        },
      },
      result: "(540, [150, 90, 300])",
      explanation: "We compute the first window once, then slide it: each step adds one day and removes one day in O(1). Total O(n) instead of O(n * k) for recomputing every window.",
    },
    {
      title: "Longest Substring Without Repeating Characters",
      scenario: "LeetCode 3: find the length of the longest substring with all distinct characters.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def longest_unique(s):
    last_seen = {}
    left = 0
    best = 0
    best_sub = ""
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1      # jump past the old copy
        last_seen[ch] = right
        if right - left + 1 > best:
            best = right - left + 1
            best_sub = s[left:right + 1]
    return best, best_sub

for text in ["abcabcbb", "bbbbb", "pwwkew", ""]:
    print(repr(text), longest_unique(text))
`,
      python: {
        files: {
          "main.py": `def longest_unique(s):
    last_seen = {}
    left = 0
    best = 0
    best_sub = ""
    for right, ch in enumerate(s):
        if ch in last_seen and last_seen[ch] >= left:
            left = last_seen[ch] + 1      # jump past the old copy
        last_seen[ch] = right
        if right - left + 1 > best:
            best = right - left + 1
            best_sub = s[left:right + 1]
    return best, best_sub

for text in ["abcabcbb", "bbbbb", "pwwkew", ""]:
    print(repr(text), longest_unique(text))
`,
        },
      },
      result: `'abcabcbb' (3, 'abc')
'bbbbb' (1, 'b')
'pwwkew' (3, 'wke')
'' (0, '')`,
      explanation: "last_seen stores the latest index of every character. When a repeat appears inside the current window, left jumps just past its previous position. Both pointers only move forward: O(n) time, O(min(n, alphabet)) space.",
    },
    {
      title: "Minimum Window Substring",
      scenario: "LeetCode 76 (Hard): find the smallest substring of s that contains all characters of t (with duplicates).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)            # characters still needed
    left = 0
    best = (float("inf"), 0, 0)
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:     # window is valid: try to shrink
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right + 1)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return "" if best[0] == float("inf") else s[best[1]:best[2]]

print(min_window("ADOBECODEBANC", "ABC"))
print(min_window("a", "aa"))
`,
      python: {
        files: {
          "main.py": `from collections import Counter

def min_window(s, t):
    need = Counter(t)
    missing = len(t)            # characters still needed
    left = 0
    best = (float("inf"), 0, 0)
    for right, ch in enumerate(s):
        if need[ch] > 0:
            missing -= 1
        need[ch] -= 1
        while missing == 0:     # window is valid: try to shrink
            if right - left + 1 < best[0]:
                best = (right - left + 1, left, right + 1)
            need[s[left]] += 1
            if need[s[left]] > 0:
                missing += 1
            left += 1
    return "" if best[0] == float("inf") else s[best[1]:best[2]]

print(min_window("ADOBECODEBANC", "ABC"))
print(min_window("a", "aa"))
`,
        },
      },
      result: "BANC",
      explanation: "need tracks how many of each character the window still lacks (negative means extra). missing counts total characters still needed. Expand right until missing is 0, then shrink left as long as the window stays valid. Time O(n + m), space O(alphabet).",
    },
    {
      title: "Longest Palindromic Substring (Expand Around Centre)",
      scenario: "LeetCode 5: find the longest palindromic substring.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def longest_palindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return l + 1, r          # slice bounds of the palindrome

    start, end = 0, 0
    for i in range(len(s)):
        for l, r in (expand(i, i), expand(i, i + 1)):   # odd and even
            if r - l > end - start:
                start, end = l, r
    return s[start:end]

print(longest_palindrome("babad"))
print(longest_palindrome("cbbd"))
print(longest_palindrome("forgeeksskeegfor"))
`,
      python: {
        files: {
          "main.py": `def longest_palindrome(s):
    def expand(l, r):
        while l >= 0 and r < len(s) and s[l] == s[r]:
            l -= 1
            r += 1
        return l + 1, r          # slice bounds of the palindrome

    start, end = 0, 0
    for i in range(len(s)):
        for l, r in (expand(i, i), expand(i, i + 1)):   # odd and even
            if r - l > end - start:
                start, end = l, r
    return s[start:end]

print(longest_palindrome("babad"))
print(longest_palindrome("cbbd"))
print(longest_palindrome("forgeeksskeegfor"))
`,
        },
      },
      result: `bab
bb
geeksskeeg`,
      explanation: "Every palindrome has a centre: a single character (odd length) or a gap between two characters (even length). We try all 2n - 1 centres and expand while both sides match. Time O(n^2), space O(1).",
    },
  ],
  interview: [
    {
      q: "Why are Python strings immutable and what does that mean for performance?",
      a: "Immutability makes strings hashable (usable as dict keys), thread-safe and allows interning. The cost is that every change creates a new string. Repeated s += x in a loop can be O(n^2), so collect pieces in a list and use ''.join() for O(n).",
      level: "Easy",
    },
    {
      q: "What is the sliding window technique?",
      a: "It maintains a contiguous window [left, right] over an array or string and updates the answer incrementally as the window moves, instead of recomputing for every subarray. Fixed windows have a given size k; variable windows expand on the right and shrink from the left when a constraint is violated. It turns O(n^2) or O(n^3) brute force into O(n).",
      level: "Easy",
    },
    {
      q: "The sliding window code has a while loop inside a for loop. Why is it O(n) and not O(n^2)?",
      a: "Because the left pointer never moves backward. Over the whole run, left moves at most n times and right moves n times, so the total number of inner-loop iterations across all outer iterations is at most n. Total work is O(2n) = O(n).",
      level: "Medium",
    },
    {
      q: "How do you check if two strings are anagrams?",
      a: "Compare character frequencies: Counter(a) == Counter(b) in O(n) time. Alternatively sorted(a) == sorted(b) in O(n log n). For lowercase letters only, an array of 26 counts gives O(n) time and O(1) space.",
      level: "Easy",
    },
    {
      q: "When can you NOT use a simple sliding window on a subarray-sum problem?",
      a: "When the array contains negative numbers. A sliding window relies on the fact that expanding increases the sum and shrinking decreases it. With negatives this monotonic property breaks. Use prefix sums with a hash map instead (for example 'Subarray Sum Equals K').",
      level: "Hard",
    },
    {
      q: "How do you reverse the words in a sentence like '  hello   world  '?",
      a: "' '.join(s.split()[::-1]) gives 'world hello'. split() with no argument splits on any whitespace and drops empty strings. Time O(n). In languages with mutable strings you could reverse the whole string and then each word in place.",
      level: "Easy",
    },
    {
      q: "What is the time complexity of finding the longest palindromic substring with expand-around-centre?",
      a: "O(n^2) time and O(1) space. There are 2n - 1 centres and each expansion is up to O(n). Manacher's algorithm solves it in O(n) but is rarely expected in interviews.",
      level: "Medium",
    },
    {
      q: "How do you find the first non-repeating character in a string?",
      a: "First pass: count frequencies with Counter. Second pass: return the first index whose count is 1. Time O(n), space O(alphabet). Example: 'leetcode' -> index 0 ('l').",
      level: "Easy",
    },
    {
      q: "Explain the approach for Longest Repeating Character Replacement (LeetCode 424).",
      a: "Use a variable window with a count dict and track max_freq, the highest count of a single character in the window. The window is valid if (window length - max_freq) <= k, meaning we can replace the other characters. Expand right; if invalid, move left by one. Answer is the largest valid window. O(n) time, O(26) space.",
      level: "Hard",
    },
    {
      q: "Is `s[::-1] == s` a good palindrome check?",
      a: "It is correct and readable, O(n) time, but it uses O(n) extra space for the reversed copy. A two-pointer check uses O(1) space and can stop early at the first mismatch. Both are fine in Python interviews; mention the trade-off.",
      level: "Easy",
    },
    {
      q: "What is the difference between a substring and a subsequence?",
      a: "A substring is contiguous ('bcd' in 'abcde'). A subsequence keeps the order but can skip characters ('ace' in 'abcde'). Sliding windows work on substrings/subarrays; subsequence problems usually need two pointers or dynamic programming.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Valid Anagram (LeetCode 242): Return True if t is an anagram of s. 'anagram', 'nagaram' -> True.",
      hint: "Count with a dict or Counter and compare.",
      solution: `from collections import Counter

def is_anagram(s, t):
    # Time O(n), Space O(1) for a fixed alphabet
    if len(s) != len(t):
        return False
    return Counter(s) == Counter(t)

print(is_anagram("anagram", "nagaram"))  # True
print(is_anagram("rat", "car"))          # False
`,
    },
    {
      task: "Maximum Average Subarray I (LeetCode 643): Find the contiguous subarray of length k with the maximum average. [1,12,-5,-6,50,3], k=4 -> 12.75.",
      hint: "Fixed window running sum; divide the best sum by k at the end.",
      solution: `def find_max_average(nums, k):
    # Time O(n), Space O(1)
    window = sum(nums[:k])
    best = window
    for i in range(k, len(nums)):
        window += nums[i] - nums[i - k]
        best = max(best, window)
    return best / k

print(find_max_average([1, 12, -5, -6, 50, 3], 4))  # 12.75
`,
    },
    {
      task: "Longest Common Prefix (LeetCode 14): ['flower','flow','flight'] -> 'fl'.",
      hint: "Compare characters column by column, or shrink a prefix until every word starts with it.",
      solution: `def longest_common_prefix(strs):
    # Time O(total characters), Space O(1) extra
    if not strs:
        return ""
    for i, ch in enumerate(strs[0]):
        for word in strs[1:]:
            if i == len(word) or word[i] != ch:
                return strs[0][:i]
    return strs[0]

print(longest_common_prefix(["flower", "flow", "flight"]))  # fl
print(longest_common_prefix(["dog", "racecar", "car"]))    # ''
`,
    },
    {
      task: "Permutation in String (LeetCode 567): Return True if s2 contains a permutation of s1 as a substring. s1='ab', s2='eidbaooo' -> True.",
      hint: "Fixed window of size len(s1); compare count arrays of 26 letters.",
      solution: `def check_inclusion(s1, s2):
    # Time O(26 * n) = O(n), Space O(1)
    k = len(s1)
    if k > len(s2):
        return False
    need = [0] * 26
    have = [0] * 26
    for ch in s1:
        need[ord(ch) - 97] += 1
    for i, ch in enumerate(s2):
        have[ord(ch) - 97] += 1
        if i >= k:
            have[ord(s2[i - k]) - 97] -= 1
        if have == need:
            return True
    return False

print(check_inclusion("ab", "eidbaooo"))  # True
print(check_inclusion("ab", "eidboaoo"))  # False
`,
    },
    {
      task: "Minimum Size Subarray Sum (LeetCode 209): Given positive integers and a target, return the minimal length of a contiguous subarray with sum >= target, or 0. target=7, [2,3,1,2,4,3] -> 2.",
      hint: "Variable window: expand right, and while sum >= target, record length and shrink left.",
      solution: `def min_subarray_len(target, nums):
    # Time O(n), Space O(1)
    left = 0
    total = 0
    best = float("inf")
    for right, x in enumerate(nums):
        total += x
        while total >= target:
            best = min(best, right - left + 1)
            total -= nums[left]
            left += 1
    return 0 if best == float("inf") else best

print(min_subarray_len(7, [2, 3, 1, 2, 4, 3]))  # 2
print(min_subarray_len(11, [1, 1, 1, 1]))       # 0
`,
    },
  ],
  quiz: [
    {
      question: "What happens when you run s = 'abc'; s[0] = 'z'?",
      options: [
        "s becomes 'zbc'",
        "TypeError",
        "s becomes 'z'",
        "Nothing",
      ],
      answer: 1,
      explanation: "Strings are immutable; item assignment raises TypeError.",
    },
    {
      question: "Best way to build a long string from many pieces in a loop?",
      options: [
        "s += piece",
        "Append pieces to a list and ''.join() at the end",
        "Use str.replace",
        "Use s * n",
      ],
      answer: 1,
      explanation: "join builds the result in one O(total length) pass.",
    },
    {
      question: "Time complexity of a variable-size sliding window over n elements?",
      options: [
        "O(n^2)",
        "O(n log n)",
        "O(n)",
        "O(k * n)",
      ],
      answer: 2,
      explanation: "Both pointers only move forward, each at most n times.",
    },
    {
      question: "A fixed window of size k slides over n elements. How much work per slide?",
      options: [
        "O(k)",
        "O(1)",
        "O(n)",
        "O(log k)",
      ],
      answer: 1,
      explanation: "Add the entering element, subtract the leaving one.",
    },
    {
      question: "Sliding window for 'subarray sum equals k' fails when:",
      options: [
        "The array is sorted",
        "The array has negative numbers",
        "k is zero",
        "The array is long",
      ],
      answer: 1,
      explanation: "Negatives break the 'expand increases, shrink decreases' property.",
    },
    {
      question: "What is ord('c') - ord('a')?",
      options: [
        "2",
        "3",
        "99",
        "'b'",
      ],
      answer: 0,
      explanation: "Letters are consecutive code points: a=97, c=99.",
    },
  ],
};
