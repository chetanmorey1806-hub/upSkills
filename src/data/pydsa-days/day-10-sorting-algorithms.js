export default {
  id: "day-10-sorting-algorithms",
  title: "Sorting Algorithms: Bubble, Selection, Insertion, Merge, Quick, Counting and Timsort",
  module: "Module 3: Searching & Sorting",
  day: 10,
  level: "Intermediate",
  duration: "3.5 hours",
  summary: "Implement the classic sorting algorithms in Python, compare their time and space complexity, understand stability and in-place sorting, and learn how Python's built-in Timsort and the key= parameter make sorted() the right choice in real code.",
  objectives: [
    "Implement bubble, selection and insertion sort and explain why they are O(n^2)",
    "Implement merge sort and quick sort using divide and conquer",
    "Use counting sort when the value range is small",
    "Explain stability and in-place sorting with examples",
    "Use sorted(), list.sort(), key= and multi-level sorting like a professional",
  ],
  theory: [
    {
      heading: "Why Study Sorting?",
      content: "Sorting puts data in order so that other operations become easy: binary search, removing duplicates, finding the median, merging intervals, two-pointer techniques and greedy algorithms all start with a sort. In real Python code you almost always call sorted() or list.sort(), but interviews test whether you understand HOW sorting works and its trade-offs.",
      points: [
        "Comparison sorts (bubble, selection, insertion, merge, quick, heap, Timsort) compare pairs of elements",
        "Any comparison sort needs at least O(n log n) comparisons in the worst case",
        "Non-comparison sorts (counting, radix, bucket) can be O(n + k) when values are small integers",
      ],
    },
    {
      heading: "Simple O(n^2) Sorts",
      content: `**Bubble sort:** repeatedly swap adjacent elements that are out of order; the largest value 'bubbles' to the end each pass. With an early-exit flag it is O(n) on already sorted input.

**Selection sort:** find the minimum of the unsorted part and swap it to the front. Always O(n^2) comparisons but only O(n) swaps. Not stable.

**Insertion sort:** take the next element and insert it into the correct place in the sorted left part by shifting bigger elements right, like arranging playing cards. O(n) on nearly sorted data, which is why Timsort uses it for small runs.`,
      points: [
        "All three: O(1) extra space (in place)",
        "Bubble and insertion are stable; selection is not",
        "Good only for small or nearly sorted inputs",
      ],
    },
    {
      heading: "Merge Sort (Divide and Conquer)",
      content: "Split the list into two halves, sort each half recursively, then merge the two sorted halves with two pointers. There are log n levels of splitting, and merging each level costs O(n), so the time is O(n log n) in ALL cases. It needs O(n) extra space for merging and is stable (when equal, take from the left half first). Merge sort is ideal for linked lists and external sorting (huge files on disk).",
      syntax: `T(n) = 2T(n/2) + O(n)  ->  O(n log n)
`,
    },
    {
      heading: "Quick Sort",
      content: "Pick a **pivot**, partition the array so smaller elements go left and larger go right, then recursively sort both sides. Average O(n log n) and very fast in practice due to in-place partitioning and cache friendliness. Worst case O(n^2) happens when the pivot is always the smallest or largest (e.g. first element of an already sorted array). Random pivot selection makes the worst case extremely unlikely. In-place quick sort uses O(log n) stack space on average. Not stable.",
      points: [
        "Lomuto partition: simple, uses last element as pivot",
        "Hoare partition: fewer swaps, a bit trickier",
        "Quickselect uses the same partition to find the k-th smallest in O(n) average",
      ],
    },
    {
      heading: "Counting Sort and Stability",
      content: `**Counting sort** counts how many times each value appears (values must be integers in a small range 0..k), then rebuilds the output. Time O(n + k), space O(k) (O(n + k) for the stable version). Great for marks (0-100), ages, or digits in radix sort.

**Stability:** a sort is stable if equal elements keep their original relative order. This matters when sorting records by one key after another: sort employees by name, then stably by department, and names stay alphabetical within each department.`,
    },
    {
      heading: "Python's Timsort, sorted() and key=",
      content: `Python's sorted() and list.sort() use **Timsort** (CPython 3.11+ uses the Powersort merge policy, a refinement of the same algorithm). It finds already-sorted runs in the data, extends short runs with insertion sort, and merges runs with an optimised merge. Result: O(n) best case on sorted data, O(n log n) worst case, O(n) extra space, and it is **stable**.

list.sort() sorts in place and returns None; sorted() returns a new list and works on any iterable. Use key= to sort by a computed value and reverse=True for descending order.`,
      syntax: `nums.sort()                               # in place, returns None
new = sorted(words, key=len)              # by length
rows.sort(key=lambda r: (-r["marks"], r["name"]))  # marks desc, name asc
from operator import itemgetter
pairs.sort(key=itemgetter(1))             # faster than lambda for simple keys
`,
      tip: "Comparison chart: Bubble/Selection/Insertion O(n^2); Merge O(n log n) always, O(n) space; Quick O(n log n) avg, O(n^2) worst; Heap O(n log n), O(1) space, not stable; Counting O(n + k); Timsort O(n log n), stable.",
    },
  ],
  examples: [
    {
      title: "Bubble, Selection and Insertion Sort",
      scenario: "Implement the three simple sorts and count comparisons on the same data.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def bubble_sort(a):
    a = a[:]; comps = 0
    for i in range(len(a) - 1):
        swapped = False
        for j in range(len(a) - 1 - i):
            comps += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:          # already sorted: stop early
            break
    return a, comps

def selection_sort(a):
    a = a[:]; comps = 0
    for i in range(len(a)):
        m = i
        for j in range(i + 1, len(a)):
            comps += 1
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a, comps

def insertion_sort(a):
    a = a[:]; comps = 0
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0:
            comps += 1
            if a[j] <= key:
                break
            a[j + 1] = a[j]       # shift bigger element right
            j -= 1
        a[j + 1] = key
    return a, comps

data = [64, 25, 12, 22, 11]
for f in (bubble_sort, selection_sort, insertion_sort):
    print(f"{f.__name__:15}", f(data))
print("sorted input  ", bubble_sort([1, 2, 3, 4, 5]), insertion_sort([1, 2, 3, 4, 5]))
`,
      python: {
        files: {
          "main.py": `def bubble_sort(a):
    a = a[:]; comps = 0
    for i in range(len(a) - 1):
        swapped = False
        for j in range(len(a) - 1 - i):
            comps += 1
            if a[j] > a[j + 1]:
                a[j], a[j + 1] = a[j + 1], a[j]
                swapped = True
        if not swapped:          # already sorted: stop early
            break
    return a, comps

def selection_sort(a):
    a = a[:]; comps = 0
    for i in range(len(a)):
        m = i
        for j in range(i + 1, len(a)):
            comps += 1
            if a[j] < a[m]:
                m = j
        a[i], a[m] = a[m], a[i]
    return a, comps

def insertion_sort(a):
    a = a[:]; comps = 0
    for i in range(1, len(a)):
        key, j = a[i], i - 1
        while j >= 0:
            comps += 1
            if a[j] <= key:
                break
            a[j + 1] = a[j]       # shift bigger element right
            j -= 1
        a[j + 1] = key
    return a, comps

data = [64, 25, 12, 22, 11]
for f in (bubble_sort, selection_sort, insertion_sort):
    print(f"{f.__name__:15}", f(data))
print("sorted input  ", bubble_sort([1, 2, 3, 4, 5]), insertion_sort([1, 2, 3, 4, 5]))
`,
        },
      },
      result: `bubble_sort     ([11, 12, 22, 25, 64], 10)
selection_sort  ([11, 12, 22, 25, 64], 10)
insertion_sort  ([11, 12, 22, 25, 64], 10)
sorted input   ([1, 2, 3, 4, 5], 4) ([1, 2, 3, 4, 5], 4)`,
      explanation: "On random data all three do about n^2/2 comparisons. On already sorted input, bubble sort with the swapped flag and insertion sort both finish after n - 1 comparisons (O(n)), while selection sort would still do all n(n-1)/2.",
    },
    {
      title: "Merge Sort",
      scenario: "Sort a list of exam marks with divide and conquer.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # <= keeps it stable
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
print(merge_sort([5, 1, 4, 2, 8, 0, 2]))
`,
      python: {
        files: {
          "main.py": `def merge_sort(arr):
    if len(arr) <= 1:
        return arr
    mid = len(arr) // 2
    left = merge_sort(arr[:mid])
    right = merge_sort(arr[mid:])
    return merge(left, right)

def merge(left, right):
    result = []
    i = j = 0
    while i < len(left) and j < len(right):
        if left[i] <= right[j]:        # <= keeps it stable
            result.append(left[i]); i += 1
        else:
            result.append(right[j]); j += 1
    result.extend(left[i:])
    result.extend(right[j:])
    return result

print(merge_sort([38, 27, 43, 3, 9, 82, 10]))
print(merge_sort([5, 1, 4, 2, 8, 0, 2]))
`,
        },
      },
      result: `[3, 9, 10, 27, 38, 43, 82]
[0, 1, 2, 2, 4, 5, 8]`,
      explanation: "The list is split until pieces have one element, then merged back in sorted order. log n levels times O(n) merging per level = O(n log n) time, O(n) extra space. Using <= when values are equal takes the left element first, keeping the sort stable.",
    },
    {
      title: "Quick Sort (Lomuto Partition, Random Pivot)",
      scenario: "Sort in place with quick sort and see how partitioning places the pivot.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import random

def partition(a, lo, hi):
    p = random.randint(lo, hi)
    a[p], a[hi] = a[hi], a[p]           # move random pivot to the end
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]           # pivot to its final place
    return i

def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)

random.seed(7)
nums = [10, 80, 30, 90, 40, 50, 70]
quick_sort(nums)
print(nums)

big = list(range(2000))                 # sorted input: worst case for a fixed pivot
quick_sort(big)
print(big[:5], "...", big[-3:])
`,
      python: {
        files: {
          "main.py": `import random

def partition(a, lo, hi):
    p = random.randint(lo, hi)
    a[p], a[hi] = a[hi], a[p]           # move random pivot to the end
    pivot = a[hi]
    i = lo
    for j in range(lo, hi):
        if a[j] < pivot:
            a[i], a[j] = a[j], a[i]
            i += 1
    a[i], a[hi] = a[hi], a[i]           # pivot to its final place
    return i

def quick_sort(a, lo=0, hi=None):
    if hi is None:
        hi = len(a) - 1
    if lo < hi:
        p = partition(a, lo, hi)
        quick_sort(a, lo, p - 1)
        quick_sort(a, p + 1, hi)

random.seed(7)
nums = [10, 80, 30, 90, 40, 50, 70]
quick_sort(nums)
print(nums)

big = list(range(2000))                 # sorted input: worst case for a fixed pivot
quick_sort(big)
print(big[:5], "...", big[-3:])
`,
        },
      },
      result: `[10, 30, 40, 50, 70, 80, 90]
[0, 1, 2, 3, 4] ... [1997, 1998, 1999]`,
      explanation: "After partition, the pivot is in its final sorted position with smaller items on the left. A random pivot keeps the expected depth around log n even on sorted input; with a fixed last-element pivot, 2000 sorted items would cause O(n^2) work and recursion depth near 2000 (a RecursionError in Python).",
    },
    {
      title: "Counting Sort and Stability",
      scenario: "Sort student marks in the range 0-10 and show why stability matters.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def counting_sort(nums, max_value):
    count = [0] * (max_value + 1)
    for x in nums:
        count[x] += 1
    result = []
    for value, c in enumerate(count):
        result.extend([value] * c)
    return result

print(counting_sort([4, 2, 2, 8, 3, 3, 1, 10, 0], 10))

students = [("Asha", "B"), ("Ravi", "A"), ("Meena", "B"), ("Kiran", "A"), ("Zoya", "C")]
# Students are listed in roll-number order. Sort by grade; ties keep roll order.
print(sorted(students, key=lambda s: s[1]))
`,
      python: {
        files: {
          "main.py": `def counting_sort(nums, max_value):
    count = [0] * (max_value + 1)
    for x in nums:
        count[x] += 1
    result = []
    for value, c in enumerate(count):
        result.extend([value] * c)
    return result

print(counting_sort([4, 2, 2, 8, 3, 3, 1, 10, 0], 10))

students = [("Asha", "B"), ("Ravi", "A"), ("Meena", "B"), ("Kiran", "A"), ("Zoya", "C")]
# Students are listed in roll-number order. Sort by grade; ties keep roll order.
print(sorted(students, key=lambda s: s[1]))
`,
        },
      },
      result: `[0, 1, 2, 2, 3, 3, 4, 8, 10]
[('Ravi', 'A'), ('Kiran', 'A'), ('Asha', 'B'), ('Meena', 'B'), ('Zoya', 'C')]`,
      explanation: "Counting sort never compares elements: it counts occurrences, so it runs in O(n + k). Python's sorted() is stable, so Ravi stays before Kiran (both A) and Asha before Meena (both B), exactly as in the original list.",
    },
    {
      title: "Professional Sorting with key=",
      scenario: "Sort employee records by several fields and show sort() vs sorted().",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from operator import itemgetter

emps = [
    {"name": "Ravi", "dept": "IT", "salary": 70000},
    {"name": "Asha", "dept": "HR", "salary": 55000},
    {"name": "Kiran", "dept": "IT", "salary": 90000},
    {"name": "Meena", "dept": "HR", "salary": 55000},
]

by_salary_desc = sorted(emps, key=lambda e: (-e["salary"], e["name"]))
print([e["name"] for e in by_salary_desc])

by_dept = sorted(emps, key=itemgetter("dept", "name"))
print([(e["dept"], e["name"]) for e in by_dept])

words = ["banana", "apple", "Cherry", "date"]
print(sorted(words))
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))

nums = [3, 1, 2]
print(nums.sort(), nums)
`,
      python: {
        files: {
          "main.py": `from operator import itemgetter

emps = [
    {"name": "Ravi", "dept": "IT", "salary": 70000},
    {"name": "Asha", "dept": "HR", "salary": 55000},
    {"name": "Kiran", "dept": "IT", "salary": 90000},
    {"name": "Meena", "dept": "HR", "salary": 55000},
]

by_salary_desc = sorted(emps, key=lambda e: (-e["salary"], e["name"]))
print([e["name"] for e in by_salary_desc])

by_dept = sorted(emps, key=itemgetter("dept", "name"))
print([(e["dept"], e["name"]) for e in by_dept])

words = ["banana", "apple", "Cherry", "date"]
print(sorted(words))
print(sorted(words, key=str.lower))
print(sorted(words, key=len, reverse=True))

nums = [3, 1, 2]
print(nums.sort(), nums)
`,
        },
      },
      result: `['Kiran', 'Ravi', 'Asha', 'Meena']
[('HR', 'Asha'), ('HR', 'Meena'), ('IT', 'Kiran'), ('IT', 'Ravi')]
['Cherry', 'apple', 'banana', 'date']
['apple', 'banana', 'Cherry', 'date']
['banana', 'Cherry', 'apple', 'date']
None [1, 2, 3]`,
      explanation: "A tuple key sorts by the first field, then by the next on ties; negating a number gives descending order for that field only. Uppercase letters come before lowercase in default string order, so use key=str.lower for case-insensitive sorting. list.sort() returns None and changes the list in place.",
    },
  ],
  interview: [
    {
      q: "Compare the time and space complexity of common sorting algorithms.",
      a: "Bubble, selection, insertion: O(n^2) average/worst, O(1) space (bubble/insertion O(n) best). Merge sort: O(n log n) all cases, O(n) space, stable. Quick sort: O(n log n) average, O(n^2) worst, O(log n) stack, not stable. Heap sort: O(n log n), O(1) space, not stable. Counting sort: O(n + k). Timsort: O(n) best, O(n log n) worst, O(n) space, stable.",
      level: "Medium",
    },
    {
      q: "What does it mean for a sorting algorithm to be stable? Give an example where it matters.",
      a: "A stable sort keeps equal elements in their original relative order. Example: a list of orders already sorted by time; stable-sorting by customer keeps each customer's orders in time order. It enables multi-key sorting by doing several stable sorts from the least to most significant key.",
      level: "Easy",
    },
    {
      q: "Which algorithm does Python use for sorted() and is it stable?",
      a: "Timsort, a hybrid of merge sort and insertion sort designed for real data with existing order (CPython 3.11+ uses the Powersort merge policy). It is stable, O(n log n) worst case and O(n) on already sorted data, with up to O(n) extra memory.",
      level: "Easy",
    },
    {
      q: "What is the difference between list.sort() and sorted()?",
      a: "list.sort() sorts the list in place and returns None; it only works on lists. sorted() works on any iterable and returns a new list, leaving the original unchanged. Both accept key and reverse and use the same stable algorithm.",
      level: "Easy",
    },
    {
      q: "When does quick sort hit its worst case and how do you avoid it?",
      a: "When partitions are extremely unbalanced, for example always picking the first or last element as pivot on already sorted or reverse-sorted input, or many duplicate values with a naive partition. Avoid it with a random pivot or median-of-three, and three-way partitioning for duplicates. Introsort switches to heap sort if recursion gets too deep.",
      level: "Medium",
    },
    {
      q: "Why is merge sort preferred for linked lists?",
      a: "Merge sort only needs sequential access, and merging linked lists can be done by relinking nodes with O(1) extra space (apart from recursion). Quick sort and heap sort rely on random access, which is O(n) per access in a linked list.",
      level: "Medium",
    },
    {
      q: "Why can't comparison-based sorting beat O(n log n)?",
      a: "There are n! possible orderings of n elements. Each comparison has two outcomes, so a decision tree that distinguishes all orderings needs height at least log2(n!), which is Theta(n log n). Non-comparison sorts like counting and radix sort avoid this bound by using the values' structure.",
      level: "Hard",
    },
    {
      q: "When would you use counting sort?",
      a: "When the keys are integers in a small range k compared to n, e.g. marks 0-100 or ages. It runs in O(n + k) time and O(k) space. It is a bad choice for large ranges (like values up to 10^9) because the count array becomes huge.",
      level: "Medium",
    },
    {
      q: "Why is insertion sort used inside Timsort?",
      a: "For small arrays (runs shorter than about 32-64 elements), insertion sort has very low overhead and is O(n) on nearly sorted data. Timsort extends short natural runs to a minimum length using binary insertion sort, then merges those runs.",
      level: "Hard",
    },
    {
      q: "How do you sort a list of tuples by the second element descending and the first ascending?",
      a: "sorted(data, key=lambda t: (-t[1], t[0])) for numeric second elements. For non-numeric keys, use two stable sorts: data.sort(key=lambda t: t[0]) then data.sort(key=lambda t: t[1], reverse=True).",
      level: "Medium",
    },
    {
      q: "What is quickselect and its complexity?",
      a: "An algorithm to find the k-th smallest element using quick sort's partition, but recursing only into the side that contains the k-th position. Average O(n), worst O(n^2) (avoidable with random pivots or median-of-medians, which guarantees O(n)).",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Sort Colors (LeetCode 75): sort an array of 0s, 1s and 2s in one pass in place. [2,0,2,1,1,0] -> [0,0,1,1,2,2].",
      hint: "Dutch National Flag: low, mid, high pointers.",
      solution: `def sort_colors(nums):
    # Time O(n), Space O(1)
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

a = [2, 0, 2, 1, 1, 0]
sort_colors(a)
print(a)
`,
    },
    {
      task: "Merge Intervals (LeetCode 56): [[1,3],[2,6],[8,10],[15,18]] -> [[1,6],[8,10],[15,18]].",
      hint: "Sort by start, then merge overlapping neighbours.",
      solution: `def merge_intervals(intervals):
    # Time O(n log n), Space O(n)
    intervals.sort(key=lambda x: x[0])
    merged = []
    for start, end in intervals:
        if merged and start <= merged[-1][1]:
            merged[-1][1] = max(merged[-1][1], end)
        else:
            merged.append([start, end])
    return merged

print(merge_intervals([[1, 3], [2, 6], [8, 10], [15, 18]]))
`,
    },
    {
      task: "Kth Largest Element (LeetCode 215) using quickselect: [3,2,1,5,6,4], k=2 -> 5.",
      hint: "The k-th largest is at index n - k in sorted order. Partition and recurse into one side.",
      solution: `import random

def find_kth_largest(nums, k):
    # Average O(n), worst O(n^2), Space O(1) extra (iterative)
    target = len(nums) - k
    lo, hi = 0, len(nums) - 1
    while True:
        p = random.randint(lo, hi)
        nums[p], nums[hi] = nums[hi], nums[p]
        pivot, i = nums[hi], lo
        for j in range(lo, hi):
            if nums[j] < pivot:
                nums[i], nums[j] = nums[j], nums[i]
                i += 1
        nums[i], nums[hi] = nums[hi], nums[i]
        if i == target:
            return nums[i]
        if i < target:
            lo = i + 1
        else:
            hi = i - 1

print(find_kth_largest([3, 2, 1, 5, 6, 4], 2))           # 5
print(find_kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))  # 4
`,
    },
    {
      task: "Largest Number (LeetCode 179): arrange numbers to form the largest number. [3,30,34,5,9] -> '9534330'.",
      hint: "Custom comparison: a before b if a+b > b+a. Use functools.cmp_to_key.",
      solution: `from functools import cmp_to_key

def largest_number(nums):
    # Time O(n log n * L) where L = digits, Space O(n)
    strs = list(map(str, nums))

    def compare(a, b):
        if a + b > b + a:
            return -1
        if a + b < b + a:
            return 1
        return 0

    strs.sort(key=cmp_to_key(compare))
    result = "".join(strs)
    return "0" if result[0] == "0" else result

print(largest_number([3, 30, 34, 5, 9]))  # 9534330
print(largest_number([0, 0]))             # 0
`,
    },
    {
      task: "Sort a Linked List (LeetCode 148) with merge sort in O(n log n). 4->2->1->3 -> 1->2->3->4.",
      hint: "Split at the middle with slow/fast pointers, sort both halves, merge.",
      solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def sort_list(head):
    # Time O(n log n), Space O(log n) recursion
    if not head or not head.next:
        return head
    slow, fast = head, head.next
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    second = slow.next
    slow.next = None
    left, right = sort_list(head), sort_list(second)
    dummy = tail = ListNode()
    while left and right:
        if left.val <= right.val:
            tail.next, left = left, left.next
        else:
            tail.next, right = right, right.next
        tail = tail.next
    tail.next = left or right
    return dummy.next

head = None
for v in reversed([4, 2, 1, 3]):
    head = ListNode(v, head)
head = sort_list(head)
out = []
while head:
    out.append(head.val)
    head = head.next
print(out)  # [1, 2, 3, 4]
`,
    },
  ],
  quiz: [
    {
      question: "Which sorting algorithm is O(n log n) in the worst case AND stable?",
      options: [
        "Quick sort",
        "Heap sort",
        "Merge sort",
        "Selection sort",
      ],
      answer: 2,
      explanation: "Merge sort is always O(n log n) and stable when merging takes from the left on ties.",
    },
    {
      question: "What does nums.sort() return?",
      options: [
        "The sorted list",
        "A new list",
        "None",
        "True",
      ],
      answer: 2,
      explanation: "list.sort() sorts in place and returns None.",
    },
    {
      question: "Worst-case time of quick sort?",
      options: [
        "O(n log n)",
        "O(n^2)",
        "O(n)",
        "O(log n)",
      ],
      answer: 1,
      explanation: "Very unbalanced partitions give n levels of O(n) work.",
    },
    {
      question: "Which sort is best for 1 million exam marks in the range 0-100?",
      options: [
        "Bubble sort",
        "Counting sort",
        "Selection sort",
        "Quick sort with first-element pivot",
      ],
      answer: 1,
      explanation: "Counting sort is O(n + k) with k = 101.",
    },
    {
      question: "Best-case time of insertion sort on an already sorted list?",
      options: [
        "O(1)",
        "O(n)",
        "O(n log n)",
        "O(n^2)",
      ],
      answer: 1,
      explanation: "Each element needs one comparison and no shifting.",
    },
    {
      question: "sorted(['b', 'A', 'a', 'B']) returns:",
      options: [
        "['a', 'A', 'b', 'B']",
        "['A', 'B', 'a', 'b']",
        "['A', 'a', 'B', 'b']",
        "['a', 'b', 'A', 'B']",
      ],
      answer: 1,
      explanation: "Uppercase letters have smaller code points than lowercase ones.",
    },
  ],
};
