export default {
  id: "day-11-binary-trees-traversals",
  title: "Binary Trees and Traversals: DFS, BFS, Height and Diameter",
  module: "Module 4: Trees, Heaps & Graphs",
  day: 11,
  level: "Advanced",
  duration: "3.5 hours",
  summary: "Learn tree terminology, build binary trees in Python, and master the four traversals (preorder, inorder, postorder, level order) recursively and iteratively. Then solve the most asked tree problems: height, diameter, balanced check, invert and lowest common ancestor.",
  objectives: [
    "Use tree vocabulary correctly: root, leaf, parent, child, depth, height, subtree",
    "Build a binary tree with a TreeNode class and from a level-order list",
    "Implement preorder, inorder and postorder DFS recursively and with an explicit stack",
    "Implement level-order BFS with a deque and process the tree level by level",
    "Solve height, diameter, balanced tree and LCA problems with post-order recursion",
  ],
  theory: [
    {
      heading: "What is a Tree?",
      content: `A tree is a hierarchical, non-linear data structure made of nodes connected by edges, with no cycles. One node is the **root**; every other node has exactly one parent. Examples: a company org chart, the folder structure on your computer, the HTML DOM, and JSON documents.

A **binary tree** is a tree where every node has at most two children, called left and right.`,
      points: [
        "Leaf: a node with no children",
        "Depth of a node: number of edges from the root to it (root depth = 0)",
        "Height of a tree: number of edges (or nodes, by some definitions) on the longest root-to-leaf path",
        "Subtree: a node together with all its descendants",
        "A tree with n nodes has exactly n - 1 edges",
      ],
      syntax: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right
`,
    },
    {
      heading: "Types of Binary Trees",
      content: "Interviewers use these terms often, so know them precisely.",
      points: [
        "Full binary tree: every node has 0 or 2 children",
        "Complete binary tree: all levels full except possibly the last, which is filled from the left (heaps are complete trees)",
        "Perfect binary tree: all internal nodes have 2 children and all leaves are on the same level; it has 2^(h+1) - 1 nodes for height h",
        "Balanced binary tree: for every node, left and right subtree heights differ by at most 1, so height is O(log n)",
        "Degenerate (skewed) tree: each node has one child; it behaves like a linked list with height O(n)",
      ],
    },
    {
      heading: "Depth-First Traversals (DFS)",
      content: `DFS goes as deep as possible before backtracking. The three orders differ only in WHEN you visit the current node:

**Preorder (Node, Left, Right):** copy/serialise a tree, print a folder structure.

**Inorder (Left, Node, Right):** gives sorted order for a Binary Search Tree.

**Postorder (Left, Right, Node):** delete a tree, compute sizes/heights, evaluate expression trees: children are processed before the parent.`,
      syntax: `def preorder(node):
    if not node:
        return
    print(node.val)          # visit
    preorder(node.left)
    preorder(node.right)
`,
      tip: "Iterative DFS uses an explicit stack. For preorder, push right child first so the left child is processed first.",
    },
    {
      heading: "Breadth-First Traversal (Level Order)",
      content: "BFS visits the tree level by level from left to right using a queue (collections.deque). To process one level at a time, record len(queue) at the start of each level and pop exactly that many nodes. Used for: level-order output, right side view, minimum depth, zigzag traversal and connecting nodes on the same level.",
      syntax: `from collections import deque
q = deque([root])
while q:
    for _ in range(len(q)):      # one full level
        node = q.popleft()
        if node.left:  q.append(node.left)
        if node.right: q.append(node.right)
`,
    },
    {
      heading: "Thinking Recursively: Height and Diameter",
      content: `Most tree problems follow one pattern: ask each subtree for an answer, then combine at the current node (post-order). Height: height(node) = 1 + max(height(left), height(right)), with height(None) = 0 (counting nodes).

**Diameter** is the number of edges on the longest path between ANY two nodes, which may not pass through the root. At each node, the longest path through it is height(left) + height(right). Compute heights once and update a global best on the way: O(n). Calling a separate height function at every node would be O(n^2).`,
    },
    {
      heading: "Complexity of Tree Algorithms",
      content: "Every traversal visits each node once: O(n) time. Space depends on the tree's shape: DFS uses O(h) stack space, where h is the height (O(log n) for balanced, O(n) for skewed). BFS uses O(w) queue space, where w is the maximum width (up to about n/2 for the last level of a perfect tree).",
      points: [
        "Traversals, height, diameter, balanced check, invert, LCA: O(n) time",
        "Recursive DFS on a skewed tree of 10,000 nodes can hit Python's recursion limit; use an iterative version or raise the limit",
        "Building a tree from a level-order list: O(n)",
      ],
    },
  ],
  examples: [
    {
      title: "Build a Tree and Run All Four Traversals",
      scenario: "Build a tree from a LeetCode-style level-order list and print preorder, inorder, postorder and level order.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build(values):                       # level order, None = missing
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    q, i = deque([root]), 1
    while q and i < len(values):
        node = q.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i]); q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i]); q.append(node.right)
        i += 1
    return root

def preorder(n):  return [n.val] + preorder(n.left) + preorder(n.right) if n else []
def inorder(n):   return inorder(n.left) + [n.val] + inorder(n.right) if n else []
def postorder(n): return postorder(n.left) + postorder(n.right) + [n.val] if n else []

def level_order(root):
    result, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)
    return result

#        1
#       / \\
#      2   3
#     / \\   \\
#    4   5   6
root = build([1, 2, 3, 4, 5, None, 6])
print("preorder :", preorder(root))
print("inorder  :", inorder(root))
print("postorder:", postorder(root))
print("levels   :", level_order(root))
`,
      python: {
        files: {
          "main.py": `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build(values):                       # level order, None = missing
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    q, i = deque([root]), 1
    while q and i < len(values):
        node = q.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i]); q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i]); q.append(node.right)
        i += 1
    return root

def preorder(n):  return [n.val] + preorder(n.left) + preorder(n.right) if n else []
def inorder(n):   return inorder(n.left) + [n.val] + inorder(n.right) if n else []
def postorder(n): return postorder(n.left) + postorder(n.right) + [n.val] if n else []

def level_order(root):
    result, q = [], deque([root] if root else [])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level)
    return result

#        1
#       / \\
#      2   3
#     / \\   \\
#    4   5   6
root = build([1, 2, 3, 4, 5, None, 6])
print("preorder :", preorder(root))
print("inorder  :", inorder(root))
print("postorder:", postorder(root))
print("levels   :", level_order(root))
`,
        },
      },
      result: `preorder : [1, 2, 4, 5, 3, 6]
inorder  : [4, 2, 5, 1, 3, 6]
postorder: [4, 5, 2, 6, 3, 1]
levels   : [[1], [2, 3], [4, 5, 6]]`,
      explanation: "The three DFS orders differ only in where the node's value is placed relative to its subtrees. Level order uses a queue and groups nodes by level using the queue size. All are O(n) time. (The list-concatenation style is short but copies lists; appending to one result list is more efficient.)",
    },
    {
      title: "Iterative DFS with an Explicit Stack",
      scenario: "Avoid recursion limits by implementing preorder and inorder with a stack.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def preorder_iter(root):
    result, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right: stack.append(node.right)   # right first
        if node.left: stack.append(node.left)     # so left is popped first
    return result

def inorder_iter(root):
    result, stack, curr = [], [], root
    while curr or stack:
        while curr:                 # go as far left as possible
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result

root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3, None, TreeNode(6)))
print(preorder_iter(root))
print(inorder_iter(root))

# A skewed tree of depth 5000 would break naive recursion, but not the iterative version
deep = None
for v in range(5000, 0, -1):
    deep = TreeNode(v, None, deep)
print(len(inorder_iter(deep)), inorder_iter(deep)[:3])
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def preorder_iter(root):
    result, stack = [], [root] if root else []
    while stack:
        node = stack.pop()
        result.append(node.val)
        if node.right: stack.append(node.right)   # right first
        if node.left: stack.append(node.left)     # so left is popped first
    return result

def inorder_iter(root):
    result, stack, curr = [], [], root
    while curr or stack:
        while curr:                 # go as far left as possible
            stack.append(curr)
            curr = curr.left
        curr = stack.pop()
        result.append(curr.val)
        curr = curr.right
    return result

root = TreeNode(1, TreeNode(2, TreeNode(4), TreeNode(5)), TreeNode(3, None, TreeNode(6)))
print(preorder_iter(root))
print(inorder_iter(root))

# A skewed tree of depth 5000 would break naive recursion, but not the iterative version
deep = None
for v in range(5000, 0, -1):
    deep = TreeNode(v, None, deep)
print(len(inorder_iter(deep)), inorder_iter(deep)[:3])
`,
        },
      },
      result: `[1, 2, 4, 5, 3, 6]
[4, 2, 5, 1, 3, 6]
5000 [1, 2, 3]`,
      explanation: "The stack replaces the call stack. For inorder, we push the whole left spine, pop a node, visit it, then continue with its right subtree. The 5000-deep skewed tree works because no Python recursion is used. O(n) time, O(h) space.",
    },
    {
      title: "Height and Diameter in One Pass",
      scenario: "LeetCode 104 and 543: find the maximum depth and the diameter of a binary tree.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)       # longest path through this node (edges)
        return 1 + max(lh, rh)
    height(root)
    return best

#          1
#         / \\
#        2   3
#       / \\
#      4   5
#     /     \\
#    7       8
root = TreeNode(1, TreeNode(2, TreeNode(4, TreeNode(7)), TreeNode(5, None, TreeNode(8))), TreeNode(3))
print("max depth:", max_depth(root))
print("diameter :", diameter(root))
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def max_depth(node):
    if not node:
        return 0
    return 1 + max(max_depth(node.left), max_depth(node.right))

def diameter(root):
    best = 0
    def height(node):
        nonlocal best
        if not node:
            return 0
        lh, rh = height(node.left), height(node.right)
        best = max(best, lh + rh)       # longest path through this node (edges)
        return 1 + max(lh, rh)
    height(root)
    return best

#          1
#         / \\
#        2   3
#       / \\
#      4   5
#     /     \\
#    7       8
root = TreeNode(1, TreeNode(2, TreeNode(4, TreeNode(7)), TreeNode(5, None, TreeNode(8))), TreeNode(3))
print("max depth:", max_depth(root))
print("diameter :", diameter(root))
`,
        },
      },
      result: `max depth: 4
diameter : 4`,
      explanation: "Height is computed bottom-up. While computing heights we also check the path that bends at each node: left height + right height edges. The longest path 7-4-2-5-8 has 4 edges and does not pass through the root. O(n) time, O(h) space.",
    },
    {
      title: "Balanced Check and Invert Tree",
      scenario: "LeetCode 110 and 226: check if a tree is height-balanced, and mirror a tree.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_balanced(root):
    def check(node):                 # returns height, or -1 if unbalanced
        if not node:
            return 0
        lh = check(node.left)
        if lh == -1: return -1
        rh = check(node.right)
        if rh == -1: return -1
        if abs(lh - rh) > 1: return -1
        return 1 + max(lh, rh)
    return check(root) != -1

def invert(node):
    if node:
        node.left, node.right = invert(node.right), invert(node.left)
    return node

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

balanced = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, TreeNode(6), TreeNode(9)))
skewed = TreeNode(1, None, TreeNode(2, None, TreeNode(3)))
print(is_balanced(balanced), is_balanced(skewed))
print("before:", inorder(balanced))
print("after :", inorder(invert(balanced)))
`,
      python: {
        files: {
          "main.py": `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_balanced(root):
    def check(node):                 # returns height, or -1 if unbalanced
        if not node:
            return 0
        lh = check(node.left)
        if lh == -1: return -1
        rh = check(node.right)
        if rh == -1: return -1
        if abs(lh - rh) > 1: return -1
        return 1 + max(lh, rh)
    return check(root) != -1

def invert(node):
    if node:
        node.left, node.right = invert(node.right), invert(node.left)
    return node

def inorder(n):
    return inorder(n.left) + [n.val] + inorder(n.right) if n else []

balanced = TreeNode(4, TreeNode(2, TreeNode(1), TreeNode(3)), TreeNode(7, TreeNode(6), TreeNode(9)))
skewed = TreeNode(1, None, TreeNode(2, None, TreeNode(3)))
print(is_balanced(balanced), is_balanced(skewed))
print("before:", inorder(balanced))
print("after :", inorder(invert(balanced)))
`,
        },
      },
      result: `True False
before: [1, 2, 3, 4, 6, 7, 9]
after : [9, 7, 6, 4, 3, 2, 1]`,
      explanation: "is_balanced returns -1 as soon as any subtree is unbalanced, so it is O(n) instead of the O(n^2) version that recomputes heights. invert swaps children recursively; the inorder sequence of the mirrored tree is the reverse of the original.",
    },
    {
      title: "Lowest Common Ancestor and Right Side View",
      scenario: "LeetCode 236 and 199: find the lowest common ancestor of two nodes, and the nodes visible from the right.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def lca(root, p, q):
    if root is None or root.val in (p, q):
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root           # p and q are on different sides
    return left or right

def right_side_view(root):
    view, q = [], deque([root] if root else [])
    while q:
        size = len(q)
        for i in range(size):
            node = q.popleft()
            if i == size - 1:
                view.append(node.val)   # last node of the level
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
    return view

#           3
#         /   \\
#        5     1
#       / \\   / \\
#      6   2 0   8
#         / \\
#        7   4
root = TreeNode(3,
    TreeNode(5, TreeNode(6), TreeNode(2, TreeNode(7), TreeNode(4))),
    TreeNode(1, TreeNode(0), TreeNode(8)))
print("LCA(5, 1):", lca(root, 5, 1).val)
print("LCA(7, 4):", lca(root, 7, 4).val)
print("LCA(5, 4):", lca(root, 5, 4).val)
print("right view:", right_side_view(root))
`,
      python: {
        files: {
          "main.py": `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def lca(root, p, q):
    if root is None or root.val in (p, q):
        return root
    left = lca(root.left, p, q)
    right = lca(root.right, p, q)
    if left and right:
        return root           # p and q are on different sides
    return left or right

def right_side_view(root):
    view, q = [], deque([root] if root else [])
    while q:
        size = len(q)
        for i in range(size):
            node = q.popleft()
            if i == size - 1:
                view.append(node.val)   # last node of the level
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
    return view

#           3
#         /   \\
#        5     1
#       / \\   / \\
#      6   2 0   8
#         / \\
#        7   4
root = TreeNode(3,
    TreeNode(5, TreeNode(6), TreeNode(2, TreeNode(7), TreeNode(4))),
    TreeNode(1, TreeNode(0), TreeNode(8)))
print("LCA(5, 1):", lca(root, 5, 1).val)
print("LCA(7, 4):", lca(root, 7, 4).val)
print("LCA(5, 4):", lca(root, 5, 4).val)
print("right view:", right_side_view(root))
`,
        },
      },
      result: `LCA(5, 1): 3
LCA(7, 4): 2
LCA(5, 4): 5
right view: [3, 1, 8, 4]`,
      explanation: "LCA returns a non-None node when it finds p or q. If both sides return something, the current node is where the paths split, so it is the LCA. If a node is an ancestor of the other (5 and 4), the search stops at 5 and returns it. Right side view takes the last node of each BFS level. Both are O(n).",
    },
  ],
  interview: [
    {
      q: "What is the difference between a tree and a graph?",
      a: "A tree is a connected acyclic graph with n nodes and n - 1 edges, with a unique path between any two nodes and usually a designated root. A graph may have cycles, may be disconnected and has no root or parent concept.",
      level: "Easy",
    },
    {
      q: "Explain preorder, inorder and postorder traversal with use cases.",
      a: "Preorder (N, L, R): visit the node before children; used to copy or serialise a tree. Inorder (L, N, R): yields sorted order in a BST. Postorder (L, R, N): children before parent; used for deleting trees, computing heights/sizes, evaluating expression trees.",
      level: "Easy",
    },
    {
      q: "How do you do a level-order traversal and what is its complexity?",
      a: "Use a queue (deque). Start with the root; repeatedly pop a node, record it and push its children. To group by level, process len(queue) nodes per iteration. O(n) time, O(w) space where w is the maximum width.",
      level: "Easy",
    },
    {
      q: "What is the space complexity of recursive DFS on a binary tree?",
      a: "O(h), where h is the height, because of the recursion stack. For a balanced tree h = O(log n); for a skewed tree h = O(n). In Python, a skewed tree deeper than about 1000 nodes will raise RecursionError unless you use iteration.",
      level: "Medium",
    },
    {
      q: "How do you compute the diameter of a binary tree in O(n)?",
      a: "Do a post-order DFS that returns the height of each subtree. At each node, left_height + right_height is the longest path passing through it; keep a running maximum. Return 1 + max(left, right) as height. One pass, O(n) time, O(h) space.",
      level: "Medium",
    },
    {
      q: "Difference between complete, full and perfect binary trees?",
      a: "Full: every node has 0 or 2 children. Complete: every level is full except possibly the last, which is filled left to right. Perfect: all internal nodes have two children and all leaves are at the same depth (both full and complete).",
      level: "Easy",
    },
    {
      q: "How do you check if a binary tree is height-balanced efficiently?",
      a: "Post-order DFS returning the height, or -1 as a sentinel when any subtree is unbalanced (height difference > 1). Propagate -1 upward immediately. This is O(n), versus O(n^2) for computing height separately at every node.",
      level: "Medium",
    },
    {
      q: "Explain the recursive approach for Lowest Common Ancestor in a binary tree.",
      a: "If the node is None or equals p or q, return it. Recurse left and right. If both return non-None, p and q are in different subtrees, so this node is the LCA. Otherwise return whichever side is non-None. O(n) time, O(h) space.",
      level: "Hard",
    },
    {
      q: "How would you serialise and deserialise a binary tree?",
      a: "Use preorder DFS writing values and a marker like '#' for None, separated by commas. To deserialise, read tokens with an iterator in the same preorder: create a node for a value and recursively build left and right; return None for '#'. Level-order with None markers (LeetCode format) also works. Both O(n).",
      level: "Hard",
    },
    {
      q: "How do you check if two binary trees are identical, and whether a tree is symmetric?",
      a: "Identical: both None -> True; one None or values differ -> False; else recurse on (left, left) and (right, right). Symmetric: compare the left subtree with the mirror of the right: (a.left, b.right) and (a.right, b.left). Both O(n).",
      level: "Medium",
    },
    {
      q: "Can you reconstruct a binary tree from its preorder and inorder traversals?",
      a: "Yes, if values are unique. The first preorder element is the root; its position in the inorder list splits the left and right subtrees. Recurse with the corresponding slices. Using a dict of value -> inorder index and index pointers instead of slicing gives O(n) time.",
      level: "Hard",
    },
  ],
  practice: [
    {
      task: "Same Tree (LeetCode 100): return True if two binary trees are structurally identical with equal values.",
      hint: "Compare roots, then recurse on both children.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def is_same_tree(p, q):
    # Time O(n), Space O(h)
    if not p and not q:
        return True
    if not p or not q or p.val != q.val:
        return False
    return is_same_tree(p.left, q.left) and is_same_tree(p.right, q.right)

a = TreeNode(1, TreeNode(2), TreeNode(3))
b = TreeNode(1, TreeNode(2), TreeNode(3))
c = TreeNode(1, TreeNode(2))
print(is_same_tree(a, b), is_same_tree(a, c))  # True False
`,
    },
    {
      task: "Minimum Depth (LeetCode 111): the number of nodes on the shortest path from the root to a leaf.",
      hint: "BFS stops at the first leaf it sees, which is optimal.",
      solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def min_depth(root):
    # Time O(n), Space O(w)
    if not root:
        return 0
    q = deque([(root, 1)])
    while q:
        node, depth = q.popleft()
        if not node.left and not node.right:
            return depth
        if node.left: q.append((node.left, depth + 1))
        if node.right: q.append((node.right, depth + 1))

root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(min_depth(root))  # 2
`,
    },
    {
      task: "Path Sum (LeetCode 112): return True if any root-to-leaf path sums to target.",
      hint: "Subtract the node value as you go down; check at leaves.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def has_path_sum(root, target):
    # Time O(n), Space O(h)
    if not root:
        return False
    if not root.left and not root.right:
        return root.val == target
    rest = target - root.val
    return has_path_sum(root.left, rest) or has_path_sum(root.right, rest)

root = TreeNode(5, TreeNode(4, TreeNode(11, TreeNode(7), TreeNode(2))),
                TreeNode(8, TreeNode(13), TreeNode(4, None, TreeNode(1))))
print(has_path_sum(root, 22), has_path_sum(root, 100))  # True False
`,
    },
    {
      task: "Binary Tree Zigzag Level Order (LeetCode 103): alternate left-to-right and right-to-left by level.",
      hint: "Normal BFS; reverse every second level.",
      solution: `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def zigzag(root):
    # Time O(n), Space O(w)
    result, q, left_to_right = [], deque([root] if root else []), True
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left: q.append(node.left)
            if node.right: q.append(node.right)
        result.append(level if left_to_right else level[::-1])
        left_to_right = not left_to_right
    return result

root = TreeNode(3, TreeNode(9), TreeNode(20, TreeNode(15), TreeNode(7)))
print(zigzag(root))  # [[3], [20, 9], [15, 7]]
`,
    },
    {
      task: "Construct Binary Tree from Preorder and Inorder (LeetCode 105): preorder=[3,9,20,15,7], inorder=[9,3,15,20,7].",
      hint: "Preorder gives the root; a dict of inorder indices splits the subtrees.",
      solution: `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val, self.left, self.right = val, left, right

def build_tree(preorder, inorder):
    # Time O(n), Space O(n)
    index = {v: i for i, v in enumerate(inorder)}
    pre = iter(preorder)

    def helper(lo, hi):              # inorder range [lo, hi]
        if lo > hi:
            return None
        val = next(pre)
        node = TreeNode(val)
        mid = index[val]
        node.left = helper(lo, mid - 1)
        node.right = helper(mid + 1, hi)
        return node

    return helper(0, len(inorder) - 1)

def postorder(n):
    return postorder(n.left) + postorder(n.right) + [n.val] if n else []

root = build_tree([3, 9, 20, 15, 7], [9, 3, 15, 20, 7])
print(postorder(root))  # [9, 15, 7, 20, 3]
`,
    },
  ],
  quiz: [
    {
      question: "Which traversal visits nodes in the order Left, Node, Right?",
      options: [
        "Preorder",
        "Inorder",
        "Postorder",
        "Level order",
      ],
      answer: 1,
      explanation: "Inorder processes the left subtree, then the node, then the right subtree.",
    },
    {
      question: "Which data structure is used for level-order traversal?",
      options: [
        "Stack",
        "Queue",
        "Heap",
        "Hash map",
      ],
      answer: 1,
      explanation: "BFS processes nodes in FIFO order with a queue.",
    },
    {
      question: "How many edges does a tree with 10 nodes have?",
      options: [
        "10",
        "9",
        "11",
        "20",
      ],
      answer: 1,
      explanation: "A tree with n nodes has n - 1 edges.",
    },
    {
      question: "Space complexity of recursive DFS on a skewed tree with n nodes?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)",
      ],
      answer: 2,
      explanation: "The recursion depth equals the height, which is n for a skewed tree.",
    },
    {
      question: "The diameter of a binary tree:",
      options: [
        "Always passes through the root",
        "May not pass through the root",
        "Equals the number of leaves",
        "Equals the height",
      ],
      answer: 1,
      explanation: "The longest path can bend at any node.",
    },
    {
      question: "Number of nodes in a perfect binary tree of height 3 (root at height 0)?",
      options: [
        "7",
        "8",
        "15",
        "16",
      ],
      answer: 2,
      explanation: "2^(3+1) - 1 = 15.",
    },
  ],
};
