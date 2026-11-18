export default {
  id: "day-09-binary-search-variations",
  title: "Binary Search and Its Variations",
  module: "Module 3: Searching & Sorting",
  day: 9,
  level: "Intermediate",
  duration: "3 hours",
  summary: "Master binary search beyond the basic version: first and last occurrence, lower and upper bound with the bisect module, searching rotated sorted arrays, finding peaks, and 'binary search on the answer' for optimisation problems like Koko Eating Bananas.",
  objectives: [
    "Write a bug-free binary search with correct loop conditions and mid updates",
    "Find first/last occurrence and insertion points using lower and upper bound",
    "Use bisect_left, bisect_right and insort from Python's bisect module",
    "Search in rotated sorted arrays and find peak elements",
    "Apply binary search on the answer space for minimise-the-maximum style problems",
  ],
  theory: [
    {
      heading: "How Binary Search Works",
      content: `Binary search finds a target in a **sorted** collection by repeatedly halving the search range. Compare the target with the middle element: if equal, done; if the target is larger, discard the left half; otherwise discard the right half. Because the range halves every step, it needs at most about log2(n) + 1 comparisons. For one billion elements, that is only about 30 steps.

Time: O(log n). Space: O(1) iterative, O(log n) recursive.`,
      syntax: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:                 # search space [lo, hi]
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1
`,
    },
    {
      heading: "Common Bugs and How to Avoid Them",
      content: "Binary search is short but famous for off-by-one errors. Decide your **interval convention** and stay consistent.",
      points: [
        "Closed interval [lo, hi]: loop while lo <= hi, move lo = mid + 1 / hi = mid - 1",
        "Half-open interval [lo, hi): hi = len(arr), loop while lo < hi, move lo = mid + 1 / hi = mid",
        "Writing lo = mid in a lo < hi loop can cause an infinite loop when hi = lo + 1; use mid = (lo + hi + 1) // 2 in that case",
        "Integer overflow of (lo + hi) is not a problem in Python (big ints), but in Java/C++ use lo + (hi - lo) // 2; mention this in interviews",
        "Binary search requires sorted data, or at least a monotonic condition",
      ],
    },
    {
      heading: "Lower Bound, Upper Bound and the bisect Module",
      content: `**Lower bound** = first index where arr[i] >= target (where target would be inserted on the left). **Upper bound** = first index where arr[i] > target. With these two you can find the first occurrence, last occurrence (upper - 1) and count of a value (upper - lower) in O(log n).

Python's bisect module implements both in C.`,
      syntax: `import bisect
arr = [1, 2, 4, 4, 4, 7]
bisect.bisect_left(arr, 4)    # 2  (lower bound)
bisect.bisect_right(arr, 4)   # 5  (upper bound)
bisect.insort(arr, 5)         # insert keeping order: O(log n) search + O(n) shift
bisect.bisect_left(arr, 10, key=None)  # key= parameter exists since Python 3.10
`,
    },
    {
      heading: "Binary Search on a Monotonic Condition",
      content: `The real power of binary search: it works whenever you have a yes/no condition that is False, False, ..., False, True, True, ... True across the search space. You binary search for the first True. The search space does not need to be an array; it can be a range of answers.

**Binary search on the answer:** for problems like 'minimum speed to finish in h hours' or 'minimum ship capacity to ship in d days', guess an answer x, check feasibility with a greedy O(n) function, and binary search on x. Total: O(n log(range)).`,
      syntax: `lo, hi = smallest_possible, largest_possible
while lo < hi:
    mid = (lo + hi) // 2
    if feasible(mid):
        hi = mid          # mid works, try smaller
    else:
        lo = mid + 1      # mid fails, need bigger
return lo                 # first feasible value
`,
    },
    {
      heading: "Rotated Sorted Arrays and Peaks",
      content: `A rotated sorted array like [4, 5, 6, 7, 0, 1, 2] is two sorted pieces. At any mid, at least one half ([lo, mid] or [mid, hi]) is sorted. Check whether the target lies inside the sorted half; if yes search there, else search the other half. Still O(log n).

For a **peak element** (greater than its neighbours), compare arr[mid] with arr[mid + 1]: if arr[mid] < arr[mid + 1], a peak exists on the right (we are climbing), else on the left including mid.`,
    },
    {
      heading: "Complexity Summary",
      content: "Basic, first/last occurrence, rotated search, peak finding: O(log n) time, O(1) space. bisect functions: O(log n). insort: O(n) because of list insertion. Binary search on the answer: O(n log R) where R is the range of possible answers. Searching a sorted 2D matrix treated as a 1D array: O(log(m * n)).",
    },
  ],
  examples: [
    {
      title: "Iterative and Recursive Binary Search",
      scenario: "Search roll numbers in a sorted list and count the steps used.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def binary_search(arr, target):
    lo, hi, steps = 0, len(arr) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid, steps
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

def binary_search_rec(arr, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return binary_search_rec(arr, target, mid + 1, hi)
    return binary_search_rec(arr, target, lo, mid - 1)

rolls = [3, 8, 15, 21, 34, 42, 57, 63, 78, 91]
print(binary_search(rolls, 57))
print(binary_search(rolls, 5))
print(binary_search_rec(rolls, 91, 0, len(rolls) - 1))
`,
      python: {
        files: {
          "main.py": `def binary_search(arr, target):
    lo, hi, steps = 0, len(arr) - 1, 0
    while lo <= hi:
        steps += 1
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid, steps
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1, steps

def binary_search_rec(arr, target, lo, hi):
    if lo > hi:
        return -1
    mid = (lo + hi) // 2
    if arr[mid] == target:
        return mid
    if arr[mid] < target:
        return binary_search_rec(arr, target, mid + 1, hi)
    return binary_search_rec(arr, target, lo, mid - 1)

rolls = [3, 8, 15, 21, 34, 42, 57, 63, 78, 91]
print(binary_search(rolls, 57))
print(binary_search(rolls, 5))
print(binary_search_rec(rolls, 91, 0, len(rolls) - 1))
`,
        },
      },
      result: `(6, 4)
(-1, 3)
9`,
      explanation: "Each step halves the range, so at most 4 comparisons are needed for 10 items (log2(10) is about 3.3). An unsuccessful search returns -1 when lo passes hi. The recursive version has the same logic but uses O(log n) stack space.",
    },
    {
      title: "First and Last Position of a Value",
      scenario: "LeetCode 34: in a sorted list with duplicates, find the first and last index of a target in O(log n).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def lower_bound(arr, target):          # first index with arr[i] >= target
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

def search_range(arr, target):
    first = lower_bound(arr, target)
    if first == len(arr) or arr[first] != target:
        return [-1, -1]
    last = lower_bound(arr, target + 1) - 1
    return [first, last]

nums = [5, 7, 7, 8, 8, 8, 10]
print(search_range(nums, 8))
print(search_range(nums, 6))
print("count of 8:", lower_bound(nums, 9) - lower_bound(nums, 8))
`,
      python: {
        files: {
          "main.py": `def lower_bound(arr, target):          # first index with arr[i] >= target
    lo, hi = 0, len(arr)
    while lo < hi:
        mid = (lo + hi) // 2
        if arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

def search_range(arr, target):
    first = lower_bound(arr, target)
    if first == len(arr) or arr[first] != target:
        return [-1, -1]
    last = lower_bound(arr, target + 1) - 1
    return [first, last]

nums = [5, 7, 7, 8, 8, 8, 10]
print(search_range(nums, 8))
print(search_range(nums, 6))
print("count of 8:", lower_bound(nums, 9) - lower_bound(nums, 8))
`,
        },
      },
      result: `[3, 5]
[-1, -1]
count of 8: 3`,
      explanation: "The half-open lower bound never stops early; it keeps shrinking toward the leftmost index where arr[i] >= target. For integers, the last occurrence is the lower bound of target + 1, minus one. Both searches are O(log n).",
    },
    {
      title: "Using the bisect Module",
      scenario: "Assign grades from score cut-offs and keep a leaderboard sorted as new scores arrive.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import bisect

cutoffs = [40, 60, 75, 90]
grades = ["F", "D", "C", "B", "A"]

def grade(score):
    return grades[bisect.bisect_right(cutoffs, score)]

print([grade(s) for s in [35, 40, 59, 75, 89, 90, 100]])

leaderboard = [12, 25, 25, 40]
print(bisect.bisect_left(leaderboard, 25), bisect.bisect_right(leaderboard, 25))
bisect.insort(leaderboard, 30)
print(leaderboard)
`,
      python: {
        files: {
          "main.py": `import bisect

cutoffs = [40, 60, 75, 90]
grades = ["F", "D", "C", "B", "A"]

def grade(score):
    return grades[bisect.bisect_right(cutoffs, score)]

print([grade(s) for s in [35, 40, 59, 75, 89, 90, 100]])

leaderboard = [12, 25, 25, 40]
print(bisect.bisect_left(leaderboard, 25), bisect.bisect_right(leaderboard, 25))
bisect.insort(leaderboard, 30)
print(leaderboard)
`,
        },
      },
      result: `['F', 'D', 'D', 'B', 'B', 'A', 'A']
1 3
[12, 25, 25, 30, 40]`,
      explanation: "bisect_right counts how many cut-offs are <= score, which directly maps to a grade index (a score exactly on a cut-off gets the higher grade). bisect_left/right give the first and one-past-last positions of 25. insort keeps the list sorted but costs O(n) for the insertion.",
    },
    {
      title: "Search in Rotated Sorted Array",
      scenario: "LeetCode 33: find a target in a sorted array that was rotated at an unknown pivot.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                 # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                     # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

arr = [4, 5, 6, 7, 0, 1, 2]
print(search_rotated(arr, 0))
print(search_rotated(arr, 3))
print(search_rotated(arr, 5))
`,
      python: {
        files: {
          "main.py": `def search_rotated(nums, target):
    lo, hi = 0, len(nums) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if nums[mid] == target:
            return mid
        if nums[lo] <= nums[mid]:                 # left half is sorted
            if nums[lo] <= target < nums[mid]:
                hi = mid - 1
            else:
                lo = mid + 1
        else:                                     # right half is sorted
            if nums[mid] < target <= nums[hi]:
                lo = mid + 1
            else:
                hi = mid - 1
    return -1

arr = [4, 5, 6, 7, 0, 1, 2]
print(search_rotated(arr, 0))
print(search_rotated(arr, 3))
print(search_rotated(arr, 5))
`,
        },
      },
      result: `4
-1
1`,
      explanation: "At least one half around mid is always sorted. We check if the target lies within the sorted half's range; if so we search there, otherwise the other half. The range still halves each step: O(log n).",
    },
    {
      title: "Binary Search on the Answer: Koko Eating Bananas",
      scenario: "LeetCode 875: find the minimum eating speed k so that all piles are finished within h hours.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import math

def hours_needed(piles, k):
    return sum(math.ceil(p / k) for p in piles)

def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(piles, mid) <= h:
            hi = mid            # feasible: try slower
        else:
            lo = mid + 1        # too slow
    return lo

print(min_eating_speed([3, 6, 7, 11], 8))
print(min_eating_speed([30, 11, 23, 4, 20], 5))
print(min_eating_speed([30, 11, 23, 4, 20], 6))
`,
      python: {
        files: {
          "main.py": `import math

def hours_needed(piles, k):
    return sum(math.ceil(p / k) for p in piles)

def min_eating_speed(piles, h):
    lo, hi = 1, max(piles)
    while lo < hi:
        mid = (lo + hi) // 2
        if hours_needed(piles, mid) <= h:
            hi = mid            # feasible: try slower
        else:
            lo = mid + 1        # too slow
    return lo

print(min_eating_speed([3, 6, 7, 11], 8))
print(min_eating_speed([30, 11, 23, 4, 20], 5))
print(min_eating_speed([30, 11, 23, 4, 20], 6))
`,
        },
      },
      result: `4
30
23`,
      explanation: "If speed k works, every faster speed also works: the feasibility condition is monotonic (False...False, True...True). We binary search for the first True in [1, max(piles)]. Each check is O(n), so total O(n log max(piles)).",
    },
  ],
  interview: [
    {
      q: "What is the precondition for binary search and its complexity?",
      a: "The data must be sorted (or the condition being searched must be monotonic). Time complexity is O(log n) because the search space halves each step; space is O(1) iterative or O(log n) recursive.",
      level: "Easy",
    },
    {
      q: "Why do some languages use mid = lo + (hi - lo) / 2 instead of (lo + hi) / 2?",
      a: "In languages with fixed-size integers (Java, C++), lo + hi can overflow when both are large, producing a negative mid. lo + (hi - lo) / 2 avoids this. Python integers do not overflow, so (lo + hi) // 2 is safe, but mentioning the issue shows awareness.",
      level: "Medium",
    },
    {
      q: "Difference between bisect_left and bisect_right?",
      a: "bisect_left returns the first index where the value could be inserted keeping order, i.e. before any existing equal elements (lower bound). bisect_right returns the position after the existing equal elements (upper bound). For [1, 2, 2, 3] and 2: bisect_left = 1, bisect_right = 3.",
      level: "Easy",
    },
    {
      q: "How do you find the first occurrence of a target in a sorted array with duplicates?",
      a: "Run binary search but when arr[mid] == target, record mid and continue searching LEFT (hi = mid - 1), or use the lower-bound template that shrinks hi = mid when arr[mid] >= target. Then verify arr[result] == target. O(log n).",
      level: "Medium",
    },
    {
      q: "What is 'binary search on the answer'?",
      a: "When the answer lies in a numeric range and a feasibility check is monotonic (if x works then every larger x works), binary search over the range of answers instead of an array. Examples: Koko Eating Bananas, Capacity to Ship Packages, Split Array Largest Sum, square root. Complexity O(cost_of_check x log(range)).",
      level: "Medium",
    },
    {
      q: "How do you find the minimum element in a rotated sorted array (LeetCode 153)?",
      a: "Binary search comparing nums[mid] with nums[hi]: if nums[mid] > nums[hi], the minimum is in (mid, hi], so lo = mid + 1; otherwise it is in [lo, mid], so hi = mid. When lo == hi, that is the minimum. O(log n).",
      level: "Medium",
    },
    {
      q: "What happens to rotated array search if duplicates are allowed?",
      a: "When nums[lo] == nums[mid] == nums[hi] you cannot tell which half is sorted. A common fix is to shrink both ends (lo += 1, hi -= 1). This makes the worst case O(n), for example [1, 1, 1, 1, 0, 1, 1].",
      level: "Hard",
    },
    {
      q: "How do you compute the integer square root of x without using sqrt?",
      a: "Binary search on [0, x] for the largest m with m * m <= x. If mid * mid <= x, record mid and go right; else go left. O(log x). Python also provides math.isqrt(x).",
      level: "Easy",
    },
    {
      q: "How do you search a 2D matrix where each row is sorted and the first element of a row is greater than the last of the previous row?",
      a: "Treat it as a sorted 1D array of size m * n. For index mid, the element is matrix[mid // n][mid % n]. Binary search: O(log(m * n)). If rows and columns are only sorted individually (LeetCode 240), start from the top-right corner and move left or down: O(m + n).",
      level: "Medium",
    },
    {
      q: "Find a peak element in O(log n). Why does it work?",
      a: "Compare nums[mid] with nums[mid + 1]. If nums[mid] < nums[mid + 1], the sequence is rising, so a peak must exist to the right (it either keeps rising to the end, which is a peak, or falls somewhere). Otherwise a peak exists at mid or to the left. Shrink accordingly until lo == hi.",
      level: "Hard",
    },
    {
      q: "Can you binary search a linked list?",
      a: "Technically yes, but finding the middle costs O(n) each time, so total time becomes O(n), no better than linear search. Binary search needs O(1) random access to be efficient. Skip lists and balanced BSTs give O(log n) search for linked structures.",
      level: "Medium",
    },
  ],
  practice: [
    {
      task: "Search Insert Position (LeetCode 35): return the index of target, or where it would be inserted. [1,3,5,6], 5 -> 2; 2 -> 1; 7 -> 4.",
      hint: "This is exactly lower bound.",
      solution: `def search_insert(nums, target):
    # Time O(log n), Space O(1)
    lo, hi = 0, len(nums)
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < target:
            lo = mid + 1
        else:
            hi = mid
    return lo

print(search_insert([1, 3, 5, 6], 5))  # 2
print(search_insert([1, 3, 5, 6], 2))  # 1
print(search_insert([1, 3, 5, 6], 7))  # 4
`,
    },
    {
      task: "Sqrt(x) (LeetCode 69): return floor(sqrt(x)) without using built-ins. 8 -> 2.",
      hint: "Find the largest m with m * m <= x.",
      solution: `def my_sqrt(x):
    # Time O(log x), Space O(1)
    lo, hi, ans = 0, x, 0
    while lo <= hi:
        mid = (lo + hi) // 2
        if mid * mid <= x:
            ans = mid
            lo = mid + 1
        else:
            hi = mid - 1
    return ans

print(my_sqrt(8), my_sqrt(16), my_sqrt(1))  # 2 4 1
`,
    },
    {
      task: "Find Minimum in Rotated Sorted Array (LeetCode 153): [3,4,5,1,2] -> 1.",
      hint: "Compare nums[mid] with nums[hi].",
      solution: `def find_min(nums):
    # Time O(log n), Space O(1)
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] > nums[hi]:
            lo = mid + 1
        else:
            hi = mid
    return nums[lo]

print(find_min([3, 4, 5, 1, 2]))        # 1
print(find_min([4, 5, 6, 7, 0, 1, 2]))  # 0
print(find_min([11, 13, 15, 17]))       # 11
`,
    },
    {
      task: "Find Peak Element (LeetCode 162): return any index i with nums[i] > its neighbours. [1,2,1,3,5,6,4] -> 5 (or 1).",
      hint: "If nums[mid] < nums[mid + 1], go right; else go left keeping mid.",
      solution: `def find_peak_element(nums):
    # Time O(log n), Space O(1)
    lo, hi = 0, len(nums) - 1
    while lo < hi:
        mid = (lo + hi) // 2
        if nums[mid] < nums[mid + 1]:
            lo = mid + 1
        else:
            hi = mid
    return lo

print(find_peak_element([1, 2, 3, 1]))           # 2
print(find_peak_element([1, 2, 1, 3, 5, 6, 4]))  # 5
`,
    },
    {
      task: "Capacity to Ship Packages Within D Days (LeetCode 1011): weights=[1..10], days=5 -> 15.",
      hint: "Binary search capacity in [max(weights), sum(weights)]; greedily count days needed.",
      solution: `def ship_within_days(weights, days):
    # Time O(n log(sum)), Space O(1)
    def days_needed(cap):
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
        if days_needed(mid) <= days:
            hi = mid
        else:
            lo = mid + 1
    return lo

print(ship_within_days(list(range(1, 11)), 5))   # 15
print(ship_within_days([3, 2, 2, 4, 1, 4], 3))   # 6
`,
    },
  ],
  quiz: [
    {
      question: "Maximum comparisons for binary search on 1,024 sorted elements (about)?",
      options: [
        "10 to 11",
        "32",
        "512",
        "1024",
      ],
      answer: 0,
      explanation: "log2(1024) = 10, plus at most one extra comparison.",
    },
    {
      question: "bisect.bisect_left([1, 2, 2, 2, 5], 2) returns:",
      options: [
        "1",
        "2",
        "3",
        "4",
      ],
      answer: 0,
      explanation: "The first index where 2 can be inserted, before existing 2s.",
    },
    {
      question: "With the closed interval [lo, hi], the loop condition should be:",
      options: [
        "while lo < hi",
        "while lo <= hi",
        "while lo != hi",
        "while hi > 0",
      ],
      answer: 1,
      explanation: "When lo == hi there is still one element to check.",
    },
    {
      question: "Binary search on the answer requires the feasibility check to be:",
      options: [
        "Random",
        "Monotonic",
        "Recursive",
        "O(1)",
      ],
      answer: 1,
      explanation: "If x works, every larger (or smaller) x must also work.",
    },
    {
      question: "Searching a rotated sorted array with DISTINCT values takes:",
      options: [
        "O(n)",
        "O(log n)",
        "O(n log n)",
        "O(1)",
      ],
      answer: 1,
      explanation: "One half is always sorted, so we can still discard half each step.",
    },
    {
      question: "Time complexity of bisect.insort on a Python list?",
      options: [
        "O(log n)",
        "O(1)",
        "O(n)",
        "O(n log n)",
      ],
      answer: 2,
      explanation: "Finding the position is O(log n) but inserting into a list shifts elements: O(n).",
    },
  ],
};
