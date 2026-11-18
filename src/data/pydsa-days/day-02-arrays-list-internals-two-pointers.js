export default {
  id: "day-02-arrays-list-internals-two-pointers",
  title: "Arrays, Python List Internals and the Two-Pointer Technique",
  module: "Module 1: Foundations",
  day: 2,
  level: "Beginner",
  duration: "3 hours",
  summary: "Understand how Python lists work as dynamic arrays under the hood, the true cost of each list operation, and master the two-pointer technique that solves many array interview problems in O(n) time and O(1) space.",
  objectives: [
    "Explain how a Python list is stored in memory as a dynamic array of references",
    "State the time complexity of indexing, append, insert, pop, slicing and searching",
    "Apply opposite-direction two pointers on sorted arrays (pair sum, reverse, palindrome)",
    "Apply same-direction (slow/fast) pointers to remove duplicates and move elements in place",
    "Solve classic problems like Container With Most Water and 3Sum",
  ],
  theory: [
    {
      heading: "What is an Array?",
      content: `An array is a collection of elements stored in one continuous block of memory. Because every slot has the same size, the computer can find the address of element i using simple arithmetic: address = start + i * slot_size. That is why reading arr[i] is O(1), no matter how big the array is.

Python does not have a built-in fixed-size array for general use (the \`array\` module and NumPy exist for numbers), but the \`list\` type is implemented as a **dynamic array**.`,
      points: [
        "Random access by index: O(1)",
        "Elements are stored in order, next to each other",
        "Inserting or deleting in the middle requires shifting elements: O(n)",
      ],
    },
    {
      heading: "Python List Internals (CPython)",
      content: `A CPython list is a C struct holding a pointer to an array of **references** (pointers to Python objects), the current length, and the allocated capacity. The list does not store the integers themselves, only references to them. That is why one list can hold mixed types like [1, 'a', 3.5].

When you append and the array is full, CPython allocates a larger block (with some extra room, roughly 1.125x plus a small constant) and copies the references across. This over-allocation makes append amortized O(1).`,
      points: [
        "len(lst) is O(1): the length is stored, not counted",
        "lst[i], lst[i] = x, append, pop() -> O(1)",
        "insert(i, x), pop(i), del lst[i], remove(x) -> O(n) because of shifting",
        "x in lst, lst.index(x), lst.count(x), min/max/sum -> O(n)",
        "lst[a:b] slicing -> O(b - a) and creates a new list",
        "lst.sort() -> O(n log n); lst.reverse() -> O(n)",
      ],
      tip: "Need fast adds/removes at BOTH ends? Use collections.deque, not list.",
    },
    {
      heading: "Copies, Aliasing and the 2D List Trap",
      content: `Assignment \`b = a\` does not copy: both names point to the same list. \`a[:]\`, \`list(a)\` and \`a.copy()\` make a **shallow copy** (new outer list, same inner objects). Use \`copy.deepcopy\` for nested structures.

A classic bug: \`grid = [[0] * 3] * 3\` creates ONE inner list referenced three times. Changing grid[0][0] changes every row. Use a list comprehension instead.`,
      syntax: `grid_bad = [[0] * 3] * 3            # 3 references to the SAME row
grid_good = [[0] * 3 for _ in range(3)]  # 3 independent rows
`,
    },
    {
      heading: "The Two-Pointer Technique",
      content: `Two pointers means using two index variables that move through the array according to some rule, instead of checking every pair with nested loops. It typically turns an O(n^2) brute force into O(n) time with O(1) extra space.

There are two main styles:

**1. Opposite ends (left and right moving inward).** Works best on sorted arrays or symmetric problems: pair sum in a sorted array, reversing, palindrome check, container with most water.

**2. Same direction (slow and fast / read and write).** One pointer reads every element, the other marks where the next valid element should be written. Used for removing duplicates, moving zeroes, partitioning in place.`,
      syntax: `# Opposite ends template
left, right = 0, len(arr) - 1
while left < right:
    if condition_met(arr[left], arr[right]):
        ...
    elif need_bigger:
        left += 1
    else:
        right -= 1

# Read/write template
write = 0
for read in range(len(arr)):
    if keep(arr[read]):
        arr[write] = arr[read]
        write += 1
`,
    },
    {
      heading: "Why Two Pointers Works on Sorted Arrays",
      content: "In a sorted array, if arr[left] + arr[right] is too small, then pairing arr[left] with any element to the left of right is also too small, so arr[left] can never be part of the answer and we safely move left forward. If the sum is too big, arr[right] paired with anything right of left is also too big, so we move right backward. Each step eliminates one element, so at most n steps are needed: O(n).",
      tip: "If the array is not sorted, sorting first costs O(n log n). If you must return ORIGINAL indices, use a hash map (Day 4) instead.",
    },
    {
      heading: "Complexity Summary",
      content: "Two-pointer solutions usually run in O(n) time because each pointer moves at most n times in total. Extra space is O(1) since we only store indices. When combined with sorting (e.g. 3Sum), total time becomes O(n log n) for the sort plus the scanning cost, which for 3Sum is O(n^2) overall.",
      points: [
        "Pair sum in sorted array: O(n) time, O(1) space",
        "Remove duplicates in place: O(n) time, O(1) space",
        "3Sum: O(n^2) time, O(1) extra space (ignoring output and sort)",
      ],
    },
  ],
  examples: [
    {
      title: "List Operations and Aliasing",
      scenario: "Observe O(1) vs O(n) operations and the shallow copy / 2D list trap.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `marks = [70, 85, 90]
marks.append(60)        # O(1) amortized
marks.insert(0, 99)     # O(n): everything shifts right
print(marks)
print(marks.pop())      # O(1)
print(marks.pop(0))     # O(n)
print(marks)

alias = marks           # same object
copy = marks[:]         # shallow copy
alias.append(100)
print("marks:", marks, "copy:", copy)

grid_bad = [[0] * 3] * 3
grid_bad[0][0] = 5
print("bad :", grid_bad)
grid_good = [[0] * 3 for _ in range(3)]
grid_good[0][0] = 5
print("good:", grid_good)
`,
      python: {
        files: {
          "main.py": `marks = [70, 85, 90]
marks.append(60)        # O(1) amortized
marks.insert(0, 99)     # O(n): everything shifts right
print(marks)
print(marks.pop())      # O(1)
print(marks.pop(0))     # O(n)
print(marks)

alias = marks           # same object
copy = marks[:]         # shallow copy
alias.append(100)
print("marks:", marks, "copy:", copy)

grid_bad = [[0] * 3] * 3
grid_bad[0][0] = 5
print("bad :", grid_bad)
grid_good = [[0] * 3 for _ in range(3)]
grid_good[0][0] = 5
print("good:", grid_good)
`,
        },
      },
      result: `[99, 70, 85, 90, 60]
60
99
[70, 85, 90]
marks: [70, 85, 90, 100] copy: [70, 85, 90]
bad : [[5, 0, 0], [5, 0, 0], [5, 0, 0]]
good: [[5, 0, 0], [0, 0, 0], [0, 0, 0]]`,
      explanation: "alias points to the same list, so appending through it changes marks, while copy is independent. In grid_bad all three rows are the same object, so one assignment appears in every row.",
    },
    {
      title: "Pair With Target Sum in a Sorted Array",
      scenario: "A shop has item prices sorted in ascending order. Find two items whose prices add up exactly to a gift card value.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def pair_sum_sorted(prices, target):
    left, right = 0, len(prices) - 1
    while left < right:
        total = prices[left] + prices[right]
        print(f"  left={left} right={right} sum={total}")
        if total == target:
            return left, right
        if total < target:
            left += 1       # need a bigger sum
        else:
            right -= 1      # need a smaller sum
    return None

prices = [100, 150, 200, 350, 400, 500]
print("Answer:", pair_sum_sorted(prices, 550))
`,
      python: {
        files: {
          "main.py": `def pair_sum_sorted(prices, target):
    left, right = 0, len(prices) - 1
    while left < right:
        total = prices[left] + prices[right]
        print(f"  left={left} right={right} sum={total}")
        if total == target:
            return left, right
        if total < target:
            left += 1       # need a bigger sum
        else:
            right -= 1      # need a smaller sum
    return None

prices = [100, 150, 200, 350, 400, 500]
print("Answer:", pair_sum_sorted(prices, 550))
`,
        },
      },
      result: `  left=0 right=5 sum=600
  left=0 right=4 sum=500
  left=1 right=4 sum=550
Answer: (1, 4)`,
      explanation: "Starting from both ends, the sum 600 is too big, so right moves left. 500 is too small, so left moves right. 550 matches. Each step removes one candidate, giving O(n) time and O(1) space.",
    },
    {
      title: "Remove Duplicates from Sorted Array In Place",
      scenario: "Compress a sorted list of roll numbers so each appears once, without creating a new list (LeetCode 26).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

rolls = [1, 1, 2, 3, 3, 3, 4, 5, 5]
k = remove_duplicates(rolls)
print("unique count:", k)
print("first k:", rolls[:k])
print("whole list:", rolls)
`,
      python: {
        files: {
          "main.py": `def remove_duplicates(nums):
    if not nums:
        return 0
    write = 1
    for read in range(1, len(nums)):
        if nums[read] != nums[write - 1]:
            nums[write] = nums[read]
            write += 1
    return write

rolls = [1, 1, 2, 3, 3, 3, 4, 5, 5]
k = remove_duplicates(rolls)
print("unique count:", k)
print("first k:", rolls[:k])
print("whole list:", rolls)
`,
        },
      },
      result: `unique count: 5
first k: [1, 2, 3, 4, 5]
whole list: [1, 2, 3, 4, 5, 3, 4, 5, 5]`,
      explanation: "read scans every element; write marks the next free position for a new unique value. Values after index k are leftovers, which LeetCode ignores. Time O(n), space O(1).",
    },
    {
      title: "Container With Most Water",
      scenario: "Given wall heights, choose two walls that hold the most water (LeetCode 11).",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        area = width * min(height[left], height[right])
        best = max(best, area)
        # move the shorter wall: it limits the area
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
print(max_area([1, 1]))
`,
      python: {
        files: {
          "main.py": `def max_area(height):
    left, right = 0, len(height) - 1
    best = 0
    while left < right:
        width = right - left
        area = width * min(height[left], height[right])
        best = max(best, area)
        # move the shorter wall: it limits the area
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return best

print(max_area([1, 8, 6, 2, 5, 4, 8, 3, 7]))
print(max_area([1, 1]))
`,
        },
      },
      result: `49
1`,
      explanation: "Area is limited by the shorter wall. Moving the taller wall inward can only reduce width without raising the limit, so we always move the shorter one. Brute force over all pairs is O(n^2); this is O(n).",
    },
    {
      title: "3Sum: Triplets That Add to Zero",
      scenario: "Find all unique triplets in an array whose sum is zero (LeetCode 15). Combine sorting with two pointers.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `def three_sum(nums):
    nums.sort()
    result = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                    # skip duplicate first numbers
        left, right = i + 1, n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1           # skip duplicate second numbers
            elif s < 0:
                left += 1
            else:
                right -= 1
    return result

print(three_sum([-1, 0, 1, 2, -1, -4]))
print(three_sum([0, 0, 0, 0]))
`,
      python: {
        files: {
          "main.py": `def three_sum(nums):
    nums.sort()
    result = []
    n = len(nums)
    for i in range(n - 2):
        if i > 0 and nums[i] == nums[i - 1]:
            continue                    # skip duplicate first numbers
        left, right = i + 1, n - 1
        while left < right:
            s = nums[i] + nums[left] + nums[right]
            if s == 0:
                result.append([nums[i], nums[left], nums[right]])
                left += 1
                right -= 1
                while left < right and nums[left] == nums[left - 1]:
                    left += 1           # skip duplicate second numbers
            elif s < 0:
                left += 1
            else:
                right -= 1
    return result

print(three_sum([-1, 0, 1, 2, -1, -4]))
print(three_sum([0, 0, 0, 0]))
`,
        },
      },
      result: `[[-1, -1, 2], [-1, 0, 1]]
[[0, 0, 0]]`,
      explanation: "Fix one number, then solve pair sum with two pointers on the rest. Skipping equal neighbours avoids duplicate triplets. Sorting is O(n log n) and the loops are O(n^2), so total O(n^2) time and O(1) extra space (excluding output).",
    },
  ],
  interview: [
    {
      q: "How is a Python list implemented internally?",
      a: "As a dynamic array of references (pointers to PyObjects). It stores the length and the allocated capacity. When full, it allocates a larger block with extra room and copies the references, which makes append amortized O(1).",
      level: "Medium",
    },
    {
      q: "Why is lst.insert(0, x) slow, and what should you use instead?",
      a: "Inserting at the front shifts all n existing references one position right, so it is O(n). If you need frequent inserts/removals at the front, use collections.deque, whose appendleft and popleft are O(1).",
      level: "Easy",
    },
    {
      q: "What is the difference between a list and an array in Python?",
      a: "A list can hold any mix of object types and stores references. The array module (array.array) and NumPy arrays store raw values of one fixed type compactly, which uses less memory and allows fast numeric operations. In DSA interviews, 'array' usually just means a Python list.",
      level: "Easy",
    },
    {
      q: "Explain the two-pointer technique and when to use it.",
      a: "Two pointers use two indices that move through the data based on a rule, avoiding nested loops. Use opposite-end pointers on sorted arrays or symmetric checks (pair sum, palindrome, container with most water). Use slow/fast or read/write pointers for in-place filtering (remove duplicates, move zeroes) and linked list problems. Typically O(n) time and O(1) space.",
      level: "Easy",
    },
    {
      q: "Why does two-pointer pair sum require a sorted array?",
      a: "The decision to move left or right relies on order: if the sum is too small, only increasing left can help; if too big, only decreasing right can help. Without sorting, moving a pointer does not predictably increase or decrease the sum, so you could skip the answer.",
      level: "Medium",
    },
    {
      q: "What does `[[0] * 3] * 3` create and why is it a bug?",
      a: "It creates an outer list containing three references to the SAME inner list. Changing grid[0][0] shows up in all rows. Use `[[0] * 3 for _ in range(3)]` to create independent rows.",
      level: "Medium",
    },
    {
      q: "What is the time complexity of slicing lst[a:b] and of lst[::-1]?",
      a: "Slicing copies k = b - a references into a new list, so it is O(k) time and O(k) space. lst[::-1] creates a reversed copy: O(n) time and space. lst.reverse() reverses in place: O(n) time, O(1) space.",
      level: "Easy",
    },
    {
      q: "Shallow copy vs deep copy of a list?",
      a: "A shallow copy (lst[:], list(lst), lst.copy(), copy.copy) creates a new outer list but the elements are the same objects, so nested lists are shared. copy.deepcopy recursively copies nested objects so nothing is shared.",
      level: "Medium",
    },
    {
      q: "How would you rotate an array right by k steps in O(1) extra space?",
      a: "Use the reversal trick: k %= n, reverse the whole array, reverse the first k elements, then reverse the remaining n - k. Each reversal is done with two pointers, so total time is O(n) and space O(1). Example: [1,2,3,4,5,6,7], k=3 -> reverse all [7,6,5,4,3,2,1] -> [5,6,7,4,3,2,1] -> [5,6,7,1,2,3,4].",
      level: "Medium",
    },
    {
      q: "In Container With Most Water, why is it safe to move the pointer at the shorter wall?",
      a: "Area = width x min(h[left], h[right]). Keeping the shorter wall and moving the taller one can only decrease width while the min height cannot exceed the shorter wall, so all those pairs are worse than the current one. Therefore the shorter wall can be discarded safely. This greedy argument gives O(n).",
      level: "Hard",
    },
    {
      q: "What is the time complexity of 3Sum with sorting and two pointers? Can it be O(n log n)?",
      a: "O(n^2): sorting is O(n log n), and for each of n fixed elements the two-pointer scan is O(n). It is widely believed that 3Sum cannot be solved in substantially less than O(n^2) in general (this is the famous 3SUM conjecture), so O(n^2) is the expected optimal answer in interviews.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Move Zeroes (LeetCode 283): Move all 0s to the end while keeping the relative order of non-zero elements, in place. Input: [0, 1, 0, 3, 12] -> [1, 3, 12, 0, 0].",
      hint: "Read/write pointers: copy non-zero values forward, then fill the rest with zeros (or swap).",
      solution: `def move_zeroes(nums):
    # Time O(n), Space O(1)
    write = 0
    for read in range(len(nums)):
        if nums[read] != 0:
            nums[write], nums[read] = nums[read], nums[write]
            write += 1

arr = [0, 1, 0, 3, 12]
move_zeroes(arr)
print(arr)  # [1, 3, 12, 0, 0]
`,
    },
    {
      task: "Valid Palindrome (LeetCode 125): Return True if a string is a palindrome after keeping only letters and digits and ignoring case. 'A man, a plan, a canal: Panama' -> True.",
      hint: "Opposite-end pointers; skip characters where not ch.isalnum().",
      solution: `def is_palindrome(s):
    # Time O(n), Space O(1)
    left, right = 0, len(s) - 1
    while left < right:
        if not s[left].isalnum():
            left += 1
        elif not s[right].isalnum():
            right -= 1
        else:
            if s[left].lower() != s[right].lower():
                return False
            left += 1
            right -= 1
    return True

print(is_palindrome("A man, a plan, a canal: Panama"))  # True
print(is_palindrome("race a car"))                      # False
`,
    },
    {
      task: "Squares of a Sorted Array (LeetCode 977): Given a sorted array that may contain negatives, return the squares in sorted order in O(n). [-4, -1, 0, 3, 10] -> [0, 1, 9, 16, 100].",
      hint: "The largest square is at one of the two ends. Fill the result from the back.",
      solution: `def sorted_squares(nums):
    # Time O(n), Space O(n) for output
    n = len(nums)
    result = [0] * n
    left, right = 0, n - 1
    for pos in range(n - 1, -1, -1):
        if abs(nums[left]) > abs(nums[right]):
            result[pos] = nums[left] ** 2
            left += 1
        else:
            result[pos] = nums[right] ** 2
            right -= 1
    return result

print(sorted_squares([-4, -1, 0, 3, 10]))
`,
    },
    {
      task: "Rotate Array (LeetCode 189): Rotate nums to the right by k steps in place. [1,2,3,4,5,6,7], k=3 -> [5,6,7,1,2,3,4].",
      hint: "Reverse all, then reverse first k, then reverse the rest. Remember k %= n.",
      solution: `def reverse(nums, i, j):
    while i < j:
        nums[i], nums[j] = nums[j], nums[i]
        i += 1
        j -= 1

def rotate(nums, k):
    # Time O(n), Space O(1)
    n = len(nums)
    k %= n
    reverse(nums, 0, n - 1)
    reverse(nums, 0, k - 1)
    reverse(nums, k, n - 1)

a = [1, 2, 3, 4, 5, 6, 7]
rotate(a, 3)
print(a)
`,
    },
    {
      task: "Merge Sorted Array (LeetCode 88): nums1 has length m + n with the last n slots as 0; merge sorted nums2 into nums1 in place.",
      hint: "Fill from the back using three pointers so you never overwrite unread values.",
      solution: `def merge(nums1, m, nums2, n):
    # Time O(m + n), Space O(1)
    i, j, k = m - 1, n - 1, m + n - 1
    while j >= 0:
        if i >= 0 and nums1[i] > nums2[j]:
            nums1[k] = nums1[i]
            i -= 1
        else:
            nums1[k] = nums2[j]
            j -= 1
        k -= 1

a = [1, 2, 3, 0, 0, 0]
merge(a, 3, [2, 5, 6], 3)
print(a)  # [1, 2, 2, 3, 5, 6]
`,
    },
  ],
  quiz: [
    {
      question: "What is the time complexity of accessing lst[500] in a list of 1 million items?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(500)",
      ],
      answer: 0,
      explanation: "Index access computes the address directly in a dynamic array.",
    },
    {
      question: "Which operation on a Python list is O(n)?",
      options: [
        "append(x)",
        "pop()",
        "len(lst)",
        "insert(0, x)",
      ],
      answer: 3,
      explanation: "Inserting at the front shifts every element.",
    },
    {
      question: "What does a CPython list actually store in its array slots?",
      options: [
        "Raw integer values",
        "References (pointers) to objects",
        "Strings only",
        "Linked nodes",
      ],
      answer: 1,
      explanation: "Lists store references to PyObjects, which allows mixed types.",
    },
    {
      question: "Two-pointer pair sum on a SORTED array runs in:",
      options: [
        "O(n^2)",
        "O(n log n)",
        "O(n)",
        "O(log n)",
      ],
      answer: 2,
      explanation: "Each step moves one pointer inward, at most n steps.",
    },
    {
      question: "After grid = [[0]*2]*2 and grid[0][0] = 1, what is grid?",
      options: [
        "[[1, 0], [0, 0]]",
        "[[1, 0], [1, 0]]",
        "[[1, 1], [0, 0]]",
        "Error",
      ],
      answer: 1,
      explanation: "Both rows are the same list object, so the change appears in both.",
    },
    {
      question: "What is the overall time complexity of 3Sum using sort + two pointers?",
      options: [
        "O(n)",
        "O(n log n)",
        "O(n^2)",
        "O(n^3)",
      ],
      answer: 2,
      explanation: "For each fixed element, a linear two-pointer scan runs: n x n.",
    },
  ],
};
