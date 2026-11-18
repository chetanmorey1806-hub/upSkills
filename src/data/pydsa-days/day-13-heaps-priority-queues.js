export default {
  id: "day-13-heaps-priority-queues",
  title: "Heaps and Priority Queues with heapq: Top-K and Merge K Sorted Lists",
  module: "Module 4: Trees, Heaps & Graphs",
  day: 13,
  level: "Advanced",
  duration: "3 hours",
  summary: "Understand the binary heap (a complete binary tree stored in an array), implement sift-up and sift-down, and use Python's heapq module as a priority queue to solve top-k, kth largest, merge k sorted lists, running median and task scheduling problems efficiently.",
  objectives: [
    "Explain the heap property and the array representation of a complete binary tree",
    "Implement push and pop with sift-up and sift-down, and know why heapify is O(n)",
    "Use heapq: heappush, heappop, heapify, heappushpop, nlargest, nsmallest",
    "Simulate a max-heap and store (priority, tiebreaker, item) tuples safely",
    "Solve top-k, kth largest, merge k sorted lists and median of a stream",
  ],
  theory: [
    {
      heading: "What is a Heap?",
      content: `A **binary heap** is a complete binary tree that satisfies the heap property:

**Min-heap:** every parent is less than or equal to its children, so the smallest element is always at the root.
**Max-heap:** every parent is greater than or equal to its children, so the largest is at the root.

A heap is NOT fully sorted; it only guarantees the root is the min (or max). That weaker guarantee is what makes insert and remove-min cheap: O(log n).`,
      points: [
        "peek min: O(1)",
        "push: O(log n)",
        "pop min: O(log n)",
        "build heap from n items (heapify): O(n)",
        "search for an arbitrary value: O(n)",
      ],
    },
    {
      heading: "Array Representation",
      content: "Because a heap is a complete tree (filled level by level, left to right), it can be stored in a plain list with no pointers. For the node at index i (0-based):",
      points: [
        "left child = 2*i + 1",
        "right child = 2*i + 2",
        "parent = (i - 1) // 2",
        "The last non-leaf node is at index n//2 - 1",
      ],
      syntax: `#            1             index: 0
#          /   \\
#         3     2          index: 1, 2
#        / \\   /
#       7   4 5            index: 3, 4, 5
heap = [1, 3, 2, 7, 4, 5]
`,
    },
    {
      heading: "Sift-Up, Sift-Down and Heapify",
      content: `**Push:** append at the end, then **sift up**: swap with the parent while the new item is smaller. At most height = O(log n) swaps.

**Pop:** take the root, move the last element to the root, then **sift down**: swap with the smaller child while it is larger than that child. O(log n).

**Heapify:** sift down every non-leaf node from the bottom up. Although each sift-down can be O(log n), most nodes are near the bottom and move very little; the total work sums to O(n). This is faster than n pushes (O(n log n)).`,
    },
    {
      heading: "Python's heapq Module",
      content: "heapq turns a regular list into a **min-heap**. There is no separate heap class; you call functions on the list.",
      syntax: `import heapq
h = []
heapq.heappush(h, 5)            # O(log n)
smallest = h[0]                 # peek, O(1)
heapq.heappop(h)                # O(log n)
heapq.heapify(nums)             # in place, O(n)
heapq.heappushpop(h, x)         # push then pop, faster than both
heapq.heapreplace(h, x)         # pop then push
heapq.nlargest(3, nums)         # O(n log k)
heapq.nsmallest(3, nums, key=len)
heapq.merge(a, b, c)            # lazily merge sorted iterables
`,
      tip: "Max-heap trick: push -value and negate again when popping. (Python 3.14 adds heapq max-heap functions such as heappush_max, but negation works on every version.)",
    },
    {
      heading: "Priority Queues and Tuples",
      content: `A priority queue serves the highest-priority item first, not the oldest. heapq compares items directly, so push tuples (priority, item). If two priorities are equal, Python compares the next tuple field; if that is a non-comparable object (dict, custom class) you get TypeError. Add a unique counter as a tiebreaker: (priority, counter, item). The counter also keeps equal-priority items in FIFO order.

Use cases: CPU job scheduling, Dijkstra's shortest path (Day 14), event simulation, A* search, hospital emergency triage.`,
    },
    {
      heading: "Top-K Pattern and Complexity",
      content: `To find the k largest items among n, keep a **min-heap of size k**. For each item, push it; if the heap grows beyond k, pop the smallest. At the end the heap holds the k largest and its root is the kth largest. Time O(n log k), space O(k), better than sorting (O(n log n)) when k is small, and it works on streams.

To merge k sorted lists, keep the current head of each list in a heap: pop the smallest, then push the next element from the same list. Total O(N log k) for N total elements.`,
      points: [
        "kth largest / top k frequent / k closest points: size-k heap, O(n log k)",
        "Merge k sorted lists: heap of k heads, O(N log k)",
        "Median of a stream: max-heap for lower half + min-heap for upper half, O(log n) per insert",
      ],
    },
  ],
  examples: [
    {
      title: "heapq Basics and the Max-Heap Trick",
      scenario: "Process hospital patients by severity: lowest number = most urgent. Then use negation for a max-heap.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import heapq

nums = [9, 4, 7, 1, 8, 2]
heapq.heapify(nums)                # O(n), in place
print("heap list:", nums)
print("min:", nums[0])
heapq.heappush(nums, 0)
print("pop order:", [heapq.heappop(nums) for _ in range(len(nums))])

max_heap = []
for x in [9, 4, 7, 1, 8, 2]:
    heapq.heappush(max_heap, -x)   # store negatives
print("max first:", [-heapq.heappop(max_heap) for _ in range(3)])

scores = [55, 91, 78, 64, 99, 82]
print("top 3:", heapq.nlargest(3, scores), "bottom 2:", heapq.nsmallest(2, scores))
`,
      python: {
        files: {
          "main.py": `import heapq

nums = [9, 4, 7, 1, 8, 2]
heapq.heapify(nums)                # O(n), in place
print("heap list:", nums)
print("min:", nums[0])
heapq.heappush(nums, 0)
print("pop order:", [heapq.heappop(nums) for _ in range(len(nums))])

max_heap = []
for x in [9, 4, 7, 1, 8, 2]:
    heapq.heappush(max_heap, -x)   # store negatives
print("max first:", [-heapq.heappop(max_heap) for _ in range(3)])

scores = [55, 91, 78, 64, 99, 82]
print("top 3:", heapq.nlargest(3, scores), "bottom 2:", heapq.nsmallest(2, scores))
`,
        },
      },
      result: `heap list: [1, 4, 2, 9, 8, 7]
min: 1
pop order: [0, 1, 2, 4, 7, 8, 9]
max first: [9, 8, 7]
top 3: [99, 91, 82] bottom 2: [55, 64]`,
      explanation: "The heap list is not sorted, but index 0 always holds the minimum and popping repeatedly returns items in ascending order. Negating values turns the min-heap into a max-heap. nlargest/nsmallest are convenient for small k.",
    },
    {
      title: "Implementing a Min-Heap from Scratch",
      scenario: "Write push and pop with sift-up and sift-down to understand what heapq does.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)
        i = len(a) - 1
        while i > 0:                          # sift up
            parent = (i - 1) // 2
            if a[i] >= a[parent]:
                break
            a[i], a[parent] = a[parent], a[i]
            i = parent

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()
        if a:
            a[0] = last
            i, n = 0, len(a)
            while True:                       # sift down
                left, right, smallest = 2 * i + 1, 2 * i + 2, i
                if left < n and a[left] < a[smallest]:
                    smallest = left
                if right < n and a[right] < a[smallest]:
                    smallest = right
                if smallest == i:
                    break
                a[i], a[smallest] = a[smallest], a[i]
                i = smallest
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
    print(f"push {x}: {h.a}")
print("pops:", [h.pop() for _ in range(6)])
`,
      python: {
        files: {
          "main.py": `class MinHeap:
    def __init__(self):
        self.a = []

    def push(self, x):
        a = self.a
        a.append(x)
        i = len(a) - 1
        while i > 0:                          # sift up
            parent = (i - 1) // 2
            if a[i] >= a[parent]:
                break
            a[i], a[parent] = a[parent], a[i]
            i = parent

    def pop(self):
        a = self.a
        top = a[0]
        last = a.pop()
        if a:
            a[0] = last
            i, n = 0, len(a)
            while True:                       # sift down
                left, right, smallest = 2 * i + 1, 2 * i + 2, i
                if left < n and a[left] < a[smallest]:
                    smallest = left
                if right < n and a[right] < a[smallest]:
                    smallest = right
                if smallest == i:
                    break
                a[i], a[smallest] = a[smallest], a[i]
                i = smallest
        return top

h = MinHeap()
for x in [5, 3, 8, 1, 9, 2]:
    h.push(x)
    print(f"push {x}: {h.a}")
print("pops:", [h.pop() for _ in range(6)])
`,
        },
      },
      result: `push 5: [5]
push 3: [3, 5]
push 8: [3, 5, 8]
push 1: [1, 3, 8, 5]
push 9: [1, 3, 8, 5, 9]
push 2: [1, 3, 2, 5, 9, 8]
pops: [1, 2, 3, 5, 8, 9]`,
      explanation: "Each push places the item at the end and bubbles it up past larger parents. Each pop moves the last item to the root and pushes it down below its smaller child. Both walk one root-to-leaf path: O(log n).",
    },
    {
      title: "Top K and Kth Largest with a Size-K Heap",
      scenario: "LeetCode 215 and 347: find the kth largest score and the k most frequent words in O(n log k).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import heapq
from collections import Counter

def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)       # drop the smallest
    return heap[0]

def top_k_frequent(words, k):
    freq = Counter(words)
    heap = []
    for word, count in freq.items():
        heapq.heappush(heap, (count, word))
        if len(heap) > k:
            heapq.heappop(heap)
    return [w for c, w in sorted(heap, reverse=True)]

print(kth_largest([3, 2, 1, 5, 6, 4], 2))
print(kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
words = "dsa python heap dsa graph python dsa heap dsa".split()
print(top_k_frequent(words, 2))
`,
      python: {
        files: {
          "main.py": `import heapq
from collections import Counter

def kth_largest(nums, k):
    heap = []
    for x in nums:
        heapq.heappush(heap, x)
        if len(heap) > k:
            heapq.heappop(heap)       # drop the smallest
    return heap[0]

def top_k_frequent(words, k):
    freq = Counter(words)
    heap = []
    for word, count in freq.items():
        heapq.heappush(heap, (count, word))
        if len(heap) > k:
            heapq.heappop(heap)
    return [w for c, w in sorted(heap, reverse=True)]

print(kth_largest([3, 2, 1, 5, 6, 4], 2))
print(kth_largest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4))
words = "dsa python heap dsa graph python dsa heap dsa".split()
print(top_k_frequent(words, 2))
`,
        },
      },
      result: `5
4
['dsa', 'python']`,
      explanation: "The heap never holds more than k items, so each operation costs O(log k) and the total is O(n log k) with O(k) space. The root of the size-k min-heap is the smallest of the k largest, i.e. the kth largest.",
    },
    {
      title: "Merge K Sorted Lists",
      scenario: "LeetCode 23: merge k sorted lists of branch sales into one sorted list.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import heapq

def merge_k_sorted(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))   # (value, list index, position)
    result = []
    while heap:
        value, i, j = heapq.heappop(heap)
        result.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return result

branches = [[1, 4, 5], [1, 3, 4], [2, 6], []]
print(merge_k_sorted(branches))
print(list(heapq.merge([1, 4, 5], [1, 3, 4], [2, 6])))
`,
      python: {
        files: {
          "main.py": `import heapq

def merge_k_sorted(lists):
    heap = []
    for i, lst in enumerate(lists):
        if lst:
            heapq.heappush(heap, (lst[0], i, 0))   # (value, list index, position)
    result = []
    while heap:
        value, i, j = heapq.heappop(heap)
        result.append(value)
        if j + 1 < len(lists[i]):
            heapq.heappush(heap, (lists[i][j + 1], i, j + 1))
    return result

branches = [[1, 4, 5], [1, 3, 4], [2, 6], []]
print(merge_k_sorted(branches))
print(list(heapq.merge([1, 4, 5], [1, 3, 4], [2, 6])))
`,
        },
      },
      result: `[1, 1, 2, 3, 4, 4, 5, 6]
[1, 1, 2, 3, 4, 4, 5, 6]`,
      explanation: "The heap holds at most one element per list, so its size is k. Each of the N elements is pushed and popped once: O(N log k) time, O(k) extra space. The list index in the tuple breaks ties so Python never has to compare anything else. heapq.merge does the same lazily.",
    },
    {
      title: "Median of a Data Stream (Two Heaps)",
      scenario: "LeetCode 295: keep the running median of incoming delivery times.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []    # max-heap (negated): smaller half
        self.high = []   # min-heap: larger half

    def add(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move largest of low to high
        if len(self.high) > len(self.low):                    # rebalance sizes
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

mf = MedianFinder()
for t in [5, 15, 1, 3, 8, 7]:
    mf.add(t)
    print(f"added {t:>2} -> median {mf.median()}")
`,
      python: {
        files: {
          "main.py": `import heapq

class MedianFinder:
    def __init__(self):
        self.low = []    # max-heap (negated): smaller half
        self.high = []   # min-heap: larger half

    def add(self, num):
        heapq.heappush(self.low, -num)
        heapq.heappush(self.high, -heapq.heappop(self.low))   # move largest of low to high
        if len(self.high) > len(self.low):                    # rebalance sizes
            heapq.heappush(self.low, -heapq.heappop(self.high))

    def median(self):
        if len(self.low) > len(self.high):
            return -self.low[0]
        return (-self.low[0] + self.high[0]) / 2

mf = MedianFinder()
for t in [5, 15, 1, 3, 8, 7]:
    mf.add(t)
    print(f"added {t:>2} -> median {mf.median()}")
`,
        },
      },
      result: `added  5 -> median 5
added 15 -> median 10.0
added  1 -> median 5
added  3 -> median 4.0
added  8 -> median 5
added  7 -> median 6.0`,
      explanation: "low keeps the smaller half (as a max-heap) and high the larger half. Every number passes through low into high, guaranteeing all of low <= all of high, and sizes are rebalanced so low has equal or one more element. The median comes from the tops: O(log n) per add, O(1) per query.",
    },
  ],
  interview: [
    {
      q: "What is a heap and how is it different from a BST?",
      a: "A heap is a complete binary tree with the heap property (parent <= children for a min-heap). It only guarantees the min at the root; siblings are unordered. A BST orders left < node < right, supporting search and sorted traversal. Heap: O(1) peek min, O(log n) push/pop, O(n) search. BST: O(log n) search when balanced.",
      level: "Easy",
    },
    {
      q: "How is a heap stored in an array?",
      a: "Level by level, left to right. For 0-based index i: left child 2i + 1, right child 2i + 2, parent (i - 1) // 2. Because the tree is complete there are no gaps, so no pointers are needed.",
      level: "Easy",
    },
    {
      q: "Why is heapify O(n) and not O(n log n)?",
      a: "Heapify sifts down nodes from the last non-leaf up to the root. About half the nodes are leaves (0 work), a quarter move at most 1 level, an eighth at most 2, and so on. The sum n/4 * 1 + n/8 * 2 + n/16 * 3 + ... converges to O(n).",
      level: "Hard",
    },
    {
      q: "Python's heapq is a min-heap. How do you get a max-heap?",
      a: "Push negated values (heappush(h, -x)) and negate when popping. For tuples, negate the priority field. For non-numeric keys, wrap items in a class with a reversed __lt__. Python 3.14 also adds max-heap helper functions to heapq.",
      level: "Easy",
    },
    {
      q: "How do you find the k largest elements in an array of n elements efficiently?",
      a: "Maintain a min-heap of size k: push each element and pop when size exceeds k. The heap ends with the k largest. O(n log k) time, O(k) space. Alternatives: sort (O(n log n)) or quickselect (O(n) average).",
      level: "Medium",
    },
    {
      q: "Why do we add a counter in tuples like (priority, count, task)?",
      a: "When priorities tie, Python compares the next element. If the task is a dict or object without ordering, this raises TypeError. A unique increasing counter breaks ties first, so tasks are never compared, and equal-priority tasks come out in insertion (FIFO) order.",
      level: "Medium",
    },
    {
      q: "Explain how to merge k sorted lists and its complexity.",
      a: "Push the first element of each list into a min-heap as (value, list_id, index). Pop the smallest, append it to the output, and push the next element from the same list. The heap has at most k items, so with N total elements the time is O(N log k) and extra space O(k).",
      level: "Medium",
    },
    {
      q: "How do you find the median of a stream of numbers?",
      a: "Use two heaps: a max-heap for the lower half and a min-heap for the upper half, keeping sizes balanced (differ by at most 1). The median is the top of the larger heap or the average of both tops. Insert O(log n), median O(1).",
      level: "Hard",
    },
    {
      q: "What is the difference between heappushpop and heapreplace?",
      a: "heappushpop(h, x) pushes x first, then pops the smallest, so it may return x itself if x is smaller than the root. heapreplace(h, x) pops the current smallest first and then pushes x, so it always returns an existing item (and fails on an empty heap). Both are single O(log n) operations.",
      level: "Medium",
    },
    {
      q: "What is heap sort and its complexity?",
      a: "Build a max-heap in O(n), then repeatedly swap the root with the last element, shrink the heap and sift down: n pops of O(log n). Total O(n log n) time, O(1) extra space, not stable. In Python you can simulate it with heapify plus n heappops.",
      level: "Medium",
    },
    {
      q: "How would you solve Task Scheduler (LeetCode 621) with a heap?",
      a: "Count task frequencies and push negated counts into a max-heap. Process time in cycles of n + 1 slots: pop up to n + 1 most frequent tasks, decrement them, push back those still remaining, and add n + 1 to time (or just the tasks executed if the heap is empty after the cycle). A formula-based O(n) solution also exists using the max frequency.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Last Stone Weight (LeetCode 1046): repeatedly smash the two heaviest stones; return the final weight or 0. [2,7,4,1,8,1] -> 1.",
      hint: "Max-heap with negated values.",
      solution: `import heapq

def last_stone_weight(stones):
    # Time O(n log n), Space O(n)
    heap = [-s for s in stones]
    heapq.heapify(heap)
    while len(heap) > 1:
        a = -heapq.heappop(heap)
        b = -heapq.heappop(heap)
        if a != b:
            heapq.heappush(heap, -(a - b))
    return -heap[0] if heap else 0

print(last_stone_weight([2, 7, 4, 1, 8, 1]))  # 1
`,
    },
    {
      task: "K Closest Points to Origin (LeetCode 973): points=[[1,3],[-2,2],[5,8],[0,1]], k=2 -> [[0,1],[-2,2]].",
      hint: "Max-heap of size k keyed by negative squared distance.",
      solution: `import heapq

def k_closest(points, k):
    # Time O(n log k), Space O(k)
    heap = []
    for x, y in points:
        d = x * x + y * y
        heapq.heappush(heap, (-d, x, y))
        if len(heap) > k:
            heapq.heappop(heap)
    return [[x, y] for _, x, y in sorted(heap, reverse=True)]

print(k_closest([[1, 3], [-2, 2], [5, 8], [0, 1]], 2))
`,
    },
    {
      task: "Kth Largest Element in a Stream (LeetCode 703): class with add(val) returning the current kth largest.",
      hint: "Keep a min-heap of size k; the root is the answer.",
      solution: `import heapq

class KthLargest:
    # add: O(log k), Space O(k)
    def __init__(self, k, nums):
        self.k = k
        self.heap = nums[:]
        heapq.heapify(self.heap)
        while len(self.heap) > k:
            heapq.heappop(self.heap)

    def add(self, val):
        heapq.heappush(self.heap, val)
        if len(self.heap) > self.k:
            heapq.heappop(self.heap)
        return self.heap[0]

kl = KthLargest(3, [4, 5, 8, 2])
print([kl.add(v) for v in [3, 5, 10, 9, 4]])  # [4, 5, 5, 8, 8]
`,
    },
    {
      task: "Task Scheduler (LeetCode 621): tasks=['A','A','A','B','B','B'], n=2 -> 8 (A B idle A B idle A B).",
      hint: "Max-heap of counts; process cycles of n + 1 slots.",
      solution: `import heapq
from collections import Counter

def least_interval(tasks, n):
    # Time O(T) (heap holds at most 26 items), Space O(26)
    heap = [-c for c in Counter(tasks).values()]
    heapq.heapify(heap)
    time = 0
    while heap:
        used, ran = [], 0
        for _ in range(n + 1):
            if heap:
                c = heapq.heappop(heap) + 1
                ran += 1
                if c < 0:
                    used.append(c)
        for c in used:
            heapq.heappush(heap, c)
        time += (n + 1) if heap else ran
    return time

print(least_interval(["A", "A", "A", "B", "B", "B"], 2))  # 8
print(least_interval(["A", "C", "A", "B", "D", "B"], 1))  # 6
`,
    },
    {
      task: "Reorganize String (LeetCode 767): rearrange so no two adjacent characters are equal, or return ''. 'aab' -> 'aba'.",
      hint: "Always place the most frequent remaining character that differs from the previous one; hold back the last used char for one step.",
      solution: `import heapq
from collections import Counter

def reorganize_string(s):
    # Time O(n log 26), Space O(26)
    heap = [(-c, ch) for ch, c in Counter(s).items()]
    heapq.heapify(heap)
    result = []
    prev = None                       # (count, ch) waiting one turn
    while heap:
        c, ch = heapq.heappop(heap)
        result.append(ch)
        if prev:
            heapq.heappush(heap, prev)
            prev = None
        if c + 1 < 0:
            prev = (c + 1, ch)
    return "".join(result) if not prev else ""

print(reorganize_string("aab"))   # aba
print(reorganize_string("aaab"))  # ''
`,
    },
  ],
  quiz: [
    {
      question: "In a min-heap, where is the smallest element?",
      options: [
        "Last index",
        "Root (index 0)",
        "Any leaf",
        "Middle of the array",
      ],
      answer: 1,
      explanation: "The heap property keeps the minimum at the root.",
    },
    {
      question: "For a heap stored in a 0-based list, the left child of index 4 is at:",
      options: [
        "8",
        "9",
        "10",
        "5",
      ],
      answer: 1,
      explanation: "2 * 4 + 1 = 9.",
    },
    {
      question: "Time complexity of heapq.heapify on n elements?",
      options: [
        "O(log n)",
        "O(n)",
        "O(n log n)",
        "O(n^2)",
      ],
      answer: 1,
      explanation: "Bottom-up sift-down sums to linear work.",
    },
    {
      question: "Best approach to find the 10 largest of 10 million streaming numbers?",
      options: [
        "Sort everything",
        "Min-heap of size 10",
        "Max-heap of all items",
        "Linear search 10 times on a list",
      ],
      answer: 1,
      explanation: "O(n log k) time and O(k) memory.",
    },
    {
      question: "How do you simulate a max-heap with heapq on all Python versions?",
      options: [
        "heapq.reverse()",
        "Push negated values",
        "Use sorted()",
        "Set max=True",
      ],
      answer: 1,
      explanation: "Negating flips the ordering.",
    },
    {
      question: "Merging k sorted lists with N total elements using a heap costs:",
      options: [
        "O(N k)",
        "O(N log k)",
        "O(k log N)",
        "O(N^2)",
      ],
      answer: 1,
      explanation: "Each element is pushed and popped once in a heap of size k.",
    },
  ],
};
