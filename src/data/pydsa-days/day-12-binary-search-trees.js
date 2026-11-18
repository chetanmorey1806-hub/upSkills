export default {
  id: "day-12-binary-search-trees",
  title: "Binary Search Trees: Insert, Search, Delete, Validate and Kth Smallest",
  module: "Module 4: Trees, Heaps & Graphs",
  day: 12,
  level: "Advanced",
  duration: "3 hours",
  summary: "Learn the BST ordering property, implement search, insert and delete (including the two-children case with the inorder successor), validate a BST correctly with min/max bounds, and use inorder traversal for sorted-order problems like kth smallest and LCA in a BST.",
  objectives: [
    "State the BST property and why it gives O(h) search",
    "Implement search, insert, min/max and delete in a BST",
    "Validate a BST using value ranges, avoiding the common parent-only mistake",
    "Use inorder traversal to get sorted output, kth smallest and range queries",
    "Explain why balanced BSTs (AVL, Red-Black) guarantee O(log n) operations",
  ],
  theory: [
    {
      heading: "The BST Property",
      content: `A **Binary Search Tree** is a binary tree where, for every node, ALL values in the left subtree are smaller than the node and ALL values in the right subtree are larger. (Duplicates are either disallowed or consistently sent to one side.)

Because of this ordering, each comparison lets you discard one whole subtree, exactly like binary search on a sorted array. The cost of search, insert and delete is O(h), where h is the height of the tree.`,
      points: [
        "Inorder traversal of a BST gives values in sorted (ascending) order",
        "Minimum value = leftmost node; maximum value = rightmost node",
        "Balanced BST: h = O(log n). Skewed BST (inserting sorted data): h = O(n)",
      ],
    },
    {
      heading: "Search and Insert",
      content: `**Search:** start at the root. If the target equals the node, found. If smaller, go left; if larger, go right. If you reach None, the value is not present.

**Insert:** search for the value; the place where you fall off the tree (None) is exactly where the new node belongs. New nodes are always inserted as leaves.`,
      syntax: `def insert(node, val):
    if node is None:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    elif val > node.val:
        node.right = insert(node.right, val)
    return node              # duplicates ignored
`,
    },
    {
      heading: "Delete: Three Cases",
      content: `Deleting is the trickiest BST operation. First find the node, then:

**Case 1: Leaf node.** Simply remove it (return None).

**Case 2: One child.** Replace the node with its only child.

**Case 3: Two children.** Find the **inorder successor** (smallest value in the right subtree), copy its value into the node, then delete the successor from the right subtree. The successor has no left child, so deleting it falls into case 1 or 2. (Using the inorder predecessor, the largest in the left subtree, also works.)`,
      tip: "Draw the tree before and after deleting a node with two children; interviewers often ask you to trace this by hand.",
    },
    {
      heading: "Validating a BST Correctly",
      content: `A very common mistake is checking only node.left.val < node.val < node.right.val. That is not enough: in the tree 5 -> left 3 -> right 6, node 3's right child 6 is larger than 3, but 6 is in the LEFT subtree of 5, so the tree is invalid.

The correct approach passes a valid range (low, high) down the tree: the left child gets (low, node.val), the right child gets (node.val, high). Alternatively, do an inorder traversal and check that values are strictly increasing.`,
      syntax: `def is_valid(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return is_valid(node.left, low, node.val) and is_valid(node.right, node.val, high)
`,
    },
    {
      heading: "Balanced BSTs and Python",
      content: `If you insert already sorted data into a plain BST, it becomes a linked list and every operation becomes O(n). Self-balancing BSTs fix this by rotating nodes after insertions and deletions so the height stays O(log n).

**AVL trees** keep the height difference of subtrees at most 1 (strictly balanced, fast lookups). **Red-Black trees** use colouring rules (looser balance, fewer rotations); they are used in Java's TreeMap and C++'s std::map.

Python has no built-in balanced BST. Alternatives: a sorted list with bisect (O(log n) search, O(n) insert), heapq for min/max only, or the third-party sortedcontainers.SortedList.`,
    },
    {
      heading: "Complexity Summary",
      content: "All core operations are O(h). Inorder traversal is O(n). Building a BST by n insertions costs O(n log n) on average and O(n^2) in the worst case (sorted input). Building a balanced BST from a sorted array by always picking the middle element is O(n).",
      points: [
        "Search / insert / delete / min / max: O(log n) balanced, O(n) worst",
        "Validate BST, inorder, range sum: O(n) time, O(h) space",
        "Kth smallest with iterative inorder: O(h + k)",
        "LCA in a BST: O(h), no need to search both subtrees",
      ],
    },
  ],
  examples: [
    {
      title: "BST Class: Insert, Search, Min, Max and Inorder",
      scenario: "Store employee IDs in a BST and look them up quickly.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        def _insert(node, val):
            if node is None:
                return TreeNode(val)
            if val < node.val:
                node.left = _insert(node.left, val)
            elif val > node.val:
                node.right = _insert(node.right, val)
            return node
        self.root = _insert(self.root, val)

    def search(self, val):
        node, steps = self.root, 0
        while node:
            steps += 1
            if val == node.val:
                return True, steps
            node = node.left if val < node.val else node.right
        return False, steps

    def min(self):
        node = self.root
        while node.left:
            node = node.left
        return node.val

    def max(self):
        node = self.root
        while node.right:
            node = node.right
        return node.val

    def inorder(self):
        out = []
        def walk(n):
            if n:
                walk(n.left); out.append(n.val); walk(n.right)
        walk(self.root)
        return out

tree = BST()
for emp_id in [50, 30, 70, 20, 40, 60, 80, 35]:
    tree.insert(emp_id)
print("sorted:", tree.inorder())
print("search 35:", tree.search(35))
print("search 65:", tree.search(65))
print("min:", tree.min(), "max:", tree.max())
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val):
        self.val, self.left, self.right = val, None, None

class BST:
    def __init__(self):
        self.root = None

    def insert(self, val):
        def _insert(node, val):
            if node is None:
                return TreeNode(val)
            if val < node.val:
                node.left = _insert(node.left, val)
            elif val > node.val:
                node.right = _insert(node.right, val)
            return node
        self.root = _insert(self.root, val)

    def search(self, val):
        node, steps = self.root, 0
        while node:
            steps += 1
            if val == node.val:
                return True, steps
            node = node.left if val < node.val else node.right
        return False, steps

    def min(self):
        node = self.root
        while node.left:
            node = node.left
        return node.val

    def max(self):
        node = self.root
        while node.right:
            node = node.right
        return node.val

    def inorder(self):
        out = []
        def walk(n):
            if n:
                walk(n.left); out.append(n.val); walk(n.right)
        walk(self.root)
        return out

tree = BST()
for emp_id in [50, 30, 70, 20, 40, 60, 80, 35]:
    tree.insert(emp_id)
print("sorted:", tree.inorder())
print("search 35:", tree.search(35))
print("search 65:", tree.search(65))
print("min:", tree.min(), "max:", tree.max())
`,
        },
      },
      result: `sorted: [20, 30, 35, 40, 50, 60, 70, 80]
search 35: (True, 4)
search 65: (False, 3)
min: 20 max: 80`,
      explanation: "Inorder traversal prints IDs in sorted order. Searching 35 follows 50 -> 30 -> 40 -> 35: 4 comparisons instead of scanning all 8. min is the leftmost node and max is the rightmost node.",
    },
    {
      title: "Deleting Nodes (All Three Cases)",
      scenario: "LeetCode 450: delete a leaf, a node with one child, and a node with two children.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node

def delete(node, key):
    if not node:
        return None
    if key < node.val:
        node.left = delete(node.left, key)
    elif key > node.val:
        node.right = delete(node.right, key)
    else:
        if not node.left:            # leaf or only right child
            return node.right
        if not node.right:           # only left child
            return node.left
        succ = node.right            # two children: inorder successor
        while succ.left:
            succ = succ.left
        node.val = succ.val
        node.right = delete(node.right, succ.val)
    return node

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

root = None
for v in [50, 30, 70, 20, 40, 60, 80, 65]:
    root = insert(root, v)
print("start          :", inorder(root))
root = delete(root, 20); print("delete 20 (leaf):", inorder(root))
root = delete(root, 60); print("delete 60 (1 ch):", inorder(root))
root = delete(root, 50); print("delete 50 (2 ch):", inorder(root), "new root:", root.val)
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def insert(node, val):
    if not node:
        return TreeNode(val)
    if val < node.val:
        node.left = insert(node.left, val)
    else:
        node.right = insert(node.right, val)
    return node

def delete(node, key):
    if not node:
        return None
    if key < node.val:
        node.left = delete(node.left, key)
    elif key > node.val:
        node.right = delete(node.right, key)
    else:
        if not node.left:            # leaf or only right child
            return node.right
        if not node.right:           # only left child
            return node.left
        succ = node.right            # two children: inorder successor
        while succ.left:
            succ = succ.left
        node.val = succ.val
        node.right = delete(node.right, succ.val)
    return node

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

root = None
for v in [50, 30, 70, 20, 40, 60, 80, 65]:
    root = insert(root, v)
print("start          :", inorder(root))
root = delete(root, 20); print("delete 20 (leaf):", inorder(root))
root = delete(root, 60); print("delete 60 (1 ch):", inorder(root))
root = delete(root, 50); print("delete 50 (2 ch):", inorder(root), "new root:", root.val)
`,
        },
      },
      result: `start          : [20, 30, 40, 50, 60, 65, 70, 80]
delete 20 (leaf): [30, 40, 50, 60, 65, 70, 80]
delete 60 (1 ch): [30, 40, 50, 65, 70, 80]
delete 50 (2 ch): [30, 40, 65, 70, 80] new root: 65`,
      explanation: "20 is a leaf, so it is removed. 60 has one child (65), which takes its place. 50 has two children: its inorder successor 60 is gone now, so the successor is 65 (the smallest value in the right subtree); 65 replaces 50 and is then deleted from the right subtree. The tree stays a valid BST. O(h) time.",
    },
    {
      title: "Validate a BST (and the Common Mistake)",
      scenario: "LeetCode 98: see why checking only parent-child pairs gives a wrong answer.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_valid_wrong(node):
    if not node:
        return True
    if node.left and node.left.val >= node.val:
        return False
    if node.right and node.right.val <= node.val:
        return False
    return is_valid_wrong(node.left) and is_valid_wrong(node.right)

def is_valid(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return is_valid(node.left, low, node.val) and is_valid(node.right, node.val, high)

#      5
#     / \\
#    3   8
#     \\
#      6      <- 6 is greater than 5 but sits in 5's LEFT subtree
tricky = TreeNode(5, TreeNode(3, None, TreeNode(6)), TreeNode(8))
good = TreeNode(5, TreeNode(3, TreeNode(1), TreeNode(4)), TreeNode(8))
print("wrong check on tricky:", is_valid_wrong(tricky))
print("range check on tricky:", is_valid(tricky))
print("range check on good  :", is_valid(good))
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_valid_wrong(node):
    if not node:
        return True
    if node.left and node.left.val >= node.val:
        return False
    if node.right and node.right.val <= node.val:
        return False
    return is_valid_wrong(node.left) and is_valid_wrong(node.right)

def is_valid(node, low=float("-inf"), high=float("inf")):
    if not node:
        return True
    if not (low < node.val < high):
        return False
    return is_valid(node.left, low, node.val) and is_valid(node.right, node.val, high)

#      5
#     / \\
#    3   8
#     \\
#      6      <- 6 is greater than 5 but sits in 5's LEFT subtree
tricky = TreeNode(5, TreeNode(3, None, TreeNode(6)), TreeNode(8))
good = TreeNode(5, TreeNode(3, TreeNode(1), TreeNode(4)), TreeNode(8))
print("wrong check on tricky:", is_valid_wrong(tricky))
print("range check on tricky:", is_valid(tricky))
print("range check on good  :", is_valid(good))
`,
        },
      },
      result: `wrong check on tricky: True
range check on tricky: False
range check on good  : True`,
      explanation: "The parent-only check says True because 6 > 3 locally. The range check knows every node in 5's left subtree must be < 5, so 6 fails. O(n) time, O(h) space.",
    },
    {
      title: "Kth Smallest and Range Sum",
      scenario: "LeetCode 230 and 938: use inorder order to find the kth smallest value and to sum values within a range, pruning subtrees.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def kth_smallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val          # stop early: O(h + k)
        node = node.right

def range_sum(node, low, high):
    if not node:
        return 0
    if node.val < low:               # whole left subtree is too small
        return range_sum(node.right, low, high)
    if node.val > high:              # whole right subtree is too big
        return range_sum(node.left, low, high)
    return node.val + range_sum(node.left, low, high) + range_sum(node.right, low, high)

#         10
#        /  \\
#       5    15
#      / \\     \\
#     3   7     18
root = TreeNode(10, TreeNode(5, TreeNode(3), TreeNode(7)), TreeNode(15, None, TreeNode(18)))
print([kth_smallest(root, k) for k in range(1, 7)])
print("sum in [7, 15]:", range_sum(root, 7, 15))
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def kth_smallest(root, k):
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        k -= 1
        if k == 0:
            return node.val          # stop early: O(h + k)
        node = node.right

def range_sum(node, low, high):
    if not node:
        return 0
    if node.val < low:               # whole left subtree is too small
        return range_sum(node.right, low, high)
    if node.val > high:              # whole right subtree is too big
        return range_sum(node.left, low, high)
    return node.val + range_sum(node.left, low, high) + range_sum(node.right, low, high)

#         10
#        /  \\
#       5    15
#      / \\     \\
#     3   7     18
root = TreeNode(10, TreeNode(5, TreeNode(3), TreeNode(7)), TreeNode(15, None, TreeNode(18)))
print([kth_smallest(root, k) for k in range(1, 7)])
print("sum in [7, 15]:", range_sum(root, 7, 15))
`,
        },
      },
      result: `[3, 5, 7, 10, 15, 18]
sum in [7, 15]: 32`,
      explanation: "Iterative inorder visits nodes in ascending order, so the kth popped node is the kth smallest, and we can stop early. range_sum uses the BST property to skip entire subtrees that cannot contain values in [low, high]: 7 + 10 + 15 = 32.",
    },
    {
      title: "Balanced BST from Sorted Array and LCA in a BST",
      scenario: "LeetCode 108 and 235: build a height-balanced BST and find the lowest common ancestor using ordering.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def sorted_to_bst(nums, lo=0, hi=None):
    if hi is None:
        hi = len(nums) - 1
    if lo > hi:
        return None
    mid = (lo + hi) // 2
    return TreeNode(nums[mid], sorted_to_bst(nums, lo, mid - 1), sorted_to_bst(nums, mid + 1, hi))

def height(n):
    return 0 if not n else 1 + max(height(n.left), height(n.right))

def lca_bst(node, p, q):
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node.val          # split point

nums = list(range(1, 16))            # 15 sorted values
root = sorted_to_bst(nums)
print("root:", root.val, "height:", height(root))

skewed = None
for v in reversed(nums):             # inserting sorted data naively = a chain
    skewed = TreeNode(v, None, skewed)
print("skewed height:", height(skewed))
print("LCA(1, 7):", lca_bst(root, 1, 7))
print("LCA(9, 15):", lca_bst(root, 9, 15))
print("LCA(5, 6):", lca_bst(root, 5, 6))
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def sorted_to_bst(nums, lo=0, hi=None):
    if hi is None:
        hi = len(nums) - 1
    if lo > hi:
        return None
    mid = (lo + hi) // 2
    return TreeNode(nums[mid], sorted_to_bst(nums, lo, mid - 1), sorted_to_bst(nums, mid + 1, hi))

def height(n):
    return 0 if not n else 1 + max(height(n.left), height(n.right))

def lca_bst(node, p, q):
    while node:
        if p < node.val and q < node.val:
            node = node.left
        elif p > node.val and q > node.val:
            node = node.right
        else:
            return node.val          # split point

nums = list(range(1, 16))            # 15 sorted values
root = sorted_to_bst(nums)
print("root:", root.val, "height:", height(root))

skewed = None
for v in reversed(nums):             # inserting sorted data naively = a chain
    skewed = TreeNode(v, None, skewed)
print("skewed height:", height(skewed))
print("LCA(1, 7):", lca_bst(root, 1, 7))
print("LCA(9, 15):", lca_bst(root, 9, 15))
print("LCA(5, 6):", lca_bst(root, 5, 6))
`,
        },
      },
      result: `root: 8 height: 4
skewed height: 15
LCA(1, 7): 4
LCA(9, 15): 12
LCA(5, 6): 6`,
      explanation: "Picking the middle element as the root makes both halves equal in size, so 15 nodes give height 4 (log2 16) instead of 15 for the skewed chain. LCA in a BST walks down from the root: when p and q fall on different sides (or one equals the node), that node is the LCA. O(h) time, O(1) space.",
    },
  ],
  interview: [
    {
      q: "What is a Binary Search Tree?",
      a: "A binary tree where for every node, all keys in the left subtree are smaller and all keys in the right subtree are larger. This ordering allows search, insert and delete in O(h) time, and an inorder traversal produces sorted output.",
      level: "Easy",
    },
    {
      q: "What is the time complexity of BST search, and what is the worst case?",
      a: "O(h). For a balanced tree h = O(log n); in the worst case (e.g. inserting sorted values) the tree degenerates into a linked list and h = O(n), so search becomes O(n).",
      level: "Easy",
    },
    {
      q: "Explain how to delete a node with two children from a BST.",
      a: "Find the inorder successor (minimum of the right subtree) or the inorder predecessor (maximum of the left subtree). Copy its value into the node to delete, then delete the successor from the right subtree. The successor has no left child, so its removal is the simple leaf or one-child case. O(h).",
      level: "Medium",
    },
    {
      q: "Why is checking node.left.val < node.val < node.right.val not enough to validate a BST?",
      a: "The BST property applies to entire subtrees, not just direct children. A node deep in the left subtree could be larger than an ancestor while still being larger than its own parent. Pass down (low, high) bounds or check that the inorder traversal is strictly increasing.",
      level: "Medium",
    },
    {
      q: "How do you find the kth smallest element in a BST?",
      a: "Do an inorder traversal (iteratively with a stack) and count nodes; the kth visited node is the answer. O(h + k) time, O(h) space. If kth-smallest queries are frequent with updates, store subtree sizes in each node to get O(h) per query.",
      level: "Medium",
    },
    {
      q: "How does LCA in a BST differ from LCA in a general binary tree?",
      a: "In a BST you can use ordering: if both values are smaller than the node go left, if both are larger go right, otherwise the current node is the LCA. This is O(h) time and O(1) space iteratively, versus O(n) for a general binary tree where you must search both subtrees.",
      level: "Medium",
    },
    {
      q: "What are AVL and Red-Black trees?",
      a: "Self-balancing BSTs that keep height O(log n) using rotations after insertions and deletions. AVL keeps the height difference between subtrees at most 1, giving faster lookups but more rotations. Red-Black trees use colour rules to keep the longest path at most twice the shortest, giving cheaper updates; used in Java TreeMap and C++ std::map.",
      level: "Hard",
    },
    {
      q: "Does Python have a built-in BST or sorted map?",
      a: "No. Common alternatives: a sorted list with bisect (O(log n) search, O(n) insert), heapq when you only need the min, dict for unordered key lookup, or the third-party sortedcontainers library (SortedList, SortedDict) with fast O(log n)-like operations.",
      level: "Medium",
    },
    {
      q: "How do you find the inorder successor of a node in a BST?",
      a: "If the node has a right subtree, the successor is the leftmost node of that subtree. Otherwise, start from the root: whenever target < node.val, record node as a candidate and go left; else go right. The last recorded candidate is the successor. O(h).",
      level: "Hard",
    },
    {
      q: "BST vs hash table: when would you choose a BST?",
      a: "Hash tables give O(1) average lookup but no ordering. A (balanced) BST gives O(log n) lookups plus ordered operations: sorted iteration, min/max, floor/ceiling, predecessor/successor and range queries. Choose a BST when order or range queries matter.",
      level: "Medium",
    },
    {
      q: "How do you convert a sorted array into a height-balanced BST?",
      a: "Recursively choose the middle element as the root, build the left subtree from the left half and the right subtree from the right half. Each element is used once: O(n) time, O(log n) recursion depth.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Search in a BST (LeetCode 700): return the subtree rooted at the node with value val, or None.",
      hint: "Go left or right based on comparison; no need to visit both sides.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def search_bst(root, val):
    # Time O(h), Space O(1)
    while root and root.val != val:
        root = root.left if val < root.val else root.right
    return root

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7))
node = search_bst(root, 2)
print(node.val, node.left.val, node.right.val)  # 2 1 3
print(search_bst(root, 5))                       # None
`,
    },
    {
      task: "Minimum Absolute Difference in BST (LeetCode 530): smallest difference between any two node values.",
      hint: "In sorted (inorder) order, the minimum difference is between neighbours.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def get_minimum_difference(root):
    # Time O(n), Space O(h)
    prev, best = None, float("inf")
    stack, node = [], root
    while stack or node:
        while node:
            stack.append(node)
            node = node.left
        node = stack.pop()
        if prev is not None:
            best = min(best, node.val - prev)
        prev = node.val
        node = node.right
    return best

root = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(6))
print(get_minimum_difference(root))  # 1
`,
    },
    {
      task: "Two Sum IV in a BST (LeetCode 653): return True if two nodes sum to k.",
      hint: "DFS with a set of seen values (or inorder + two pointers).",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def find_target(root, k):
    # Time O(n), Space O(n)
    seen, stack = set(), [root] if root else []
    while stack:
        node = stack.pop()
        if k - node.val in seen:
            return True
        seen.add(node.val)
        if node.left: stack.append(node.left)
        if node.right: stack.append(node.right)
    return False

root = TreeNode(5, TreeNode(3, TreeNode(2), TreeNode(4)), TreeNode(6, None, TreeNode(7)))
print(find_target(root, 9), find_target(root, 28))  # True False
`,
    },
    {
      task: "Trim a BST (LeetCode 669): remove all nodes outside [low, high] and return the new root.",
      hint: "If node < low, the answer is in the trimmed right subtree; if node > high, in the trimmed left subtree.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def trim_bst(node, low, high):
    # Time O(n), Space O(h)
    if not node:
        return None
    if node.val < low:
        return trim_bst(node.right, low, high)
    if node.val > high:
        return trim_bst(node.left, low, high)
    node.left = trim_bst(node.left, low, high)
    node.right = trim_bst(node.right, low, high)
    return node

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

root = TreeNode(3, TreeNode(0, None, TreeNode(2, TreeNode(1))), TreeNode(4))
print(inorder(trim_bst(root, 1, 3)))  # [1, 2, 3]
`,
    },
    {
      task: "BST Iterator (LeetCode 173): implement next() and has_next() returning values in ascending order with O(h) memory.",
      hint: "Keep a stack of the left spine; after popping a node, push the left spine of its right child.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

class BSTIterator:
    # next(): amortized O(1), Space O(h)
    def __init__(self, root):
        self.stack = []
        self._push_left(root)

    def _push_left(self, node):
        while node:
            self.stack.append(node)
            node = node.left

    def next(self):
        node = self.stack.pop()
        self._push_left(node.right)
        return node.val

    def has_next(self):
        return bool(self.stack)

root = TreeNode(7, TreeNode(3), TreeNode(15, TreeNode(9), TreeNode(20)))
it = BSTIterator(root)
out = []
while it.has_next():
    out.append(it.next())
print(out)  # [3, 7, 9, 15, 20]
`,
    },
  ],
  quiz: [
    {
      question: "Inorder traversal of a BST produces values in:",
      options: [
        "Random order",
        "Descending order",
        "Ascending order",
        "Level order",
      ],
      answer: 2,
      explanation: "Left (smaller), node, right (larger) gives sorted order.",
    },
    {
      question: "Inserting 1, 2, 3, 4, 5 in that order into an empty plain BST gives a tree of height (in nodes):",
      options: [
        "3",
        "5",
        "2",
        "log 5",
      ],
      answer: 1,
      explanation: "Sorted inserts create a right-skewed chain.",
    },
    {
      question: "When deleting a node with two children, which value commonly replaces it?",
      options: [
        "Its parent",
        "Its left child",
        "The inorder successor",
        "The root",
      ],
      answer: 2,
      explanation: "The minimum of the right subtree keeps the BST property.",
    },
    {
      question: "Where is the minimum value of a BST?",
      options: [
        "Root",
        "Leftmost node",
        "Rightmost node",
        "Any leaf",
      ],
      answer: 1,
      explanation: "Keep going left until there is no left child.",
    },
    {
      question: "Time complexity of search in a balanced BST with n nodes?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
      ],
      answer: 1,
      explanation: "Height is O(log n) and search follows one root-to-leaf path.",
    },
    {
      question: "Which correctly validates a BST?",
      options: [
        "Check each node against its children only",
        "Pass (low, high) bounds down the tree",
        "Check that the tree is complete",
        "Check that leaves are sorted",
      ],
      answer: 1,
      explanation: "Every node must lie within bounds set by all its ancestors.",
    },
  ],
};
