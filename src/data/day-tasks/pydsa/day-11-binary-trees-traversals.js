const TREE = `from collections import deque

class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def build(values):
    """Build a tree from a level-order list; None = missing child."""
    if not values or values[0] is None:
        return None
    root = TreeNode(values[0])
    q = deque([root])
    i = 1
    while q and i < len(values):
        node = q.popleft()
        if i < len(values) and values[i] is not None:
            node.left = TreeNode(values[i])
            q.append(node.left)
        i += 1
        if i < len(values) and values[i] is not None:
            node.right = TreeNode(values[i])
            q.append(node.right)
        i += 1
    return root
`;

export default {
  lesson: 'day-11-binary-trees-traversals',
  minutes: 40,
  intro: 'Traverse binary trees with DFS (pre/in/post-order) and BFS (level order), and solve height, diameter and balance problems with post-order recursion. `TreeNode` and `build(level_order_list)` are provided.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'For this tree, what are the preorder, inorder and postorder traversals?\n```\n      1\n     / \\\n    2   3\n   / \\\n  4   5\n```',
      code: `def pre(n):  return [] if n is None else [n[0]] + pre(n[1]) + pre(n[2])
def ino(n):  return [] if n is None else ino(n[1]) + [n[0]] + ino(n[2])
def post(n): return [] if n is None else post(n[1]) + post(n[2]) + [n[0]]
tree = (1, (2, (4, None, None), (5, None, None)), (3, None, None))
print(pre(tree))
print(ino(tree))
print(post(tree))`,
      expected: '[1, 2, 4, 5, 3]\n[4, 2, 5, 1, 3]\n[4, 5, 2, 3, 1]',
      explain: 'Pre-order = **node, left, right**; in-order = **left, node, right**; post-order = **left, right, node**. The name tells you where the node itself is visited.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the space complexity of recursive DFS on a binary tree of height h?',
      options: ['O(1)', 'O(h) for the call stack (O(n) for a skewed tree, O(log n) if balanced)', 'O(n^2)', 'O(2^h)'],
      answer: 1,
      explain: 'The recursion goes as deep as the tree is tall, keeping one frame per level. A balanced tree has height about log n; a skewed tree (like a linked list) has height n.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Inorder traversal without recursion.** Write `inorder(root)` that returns the in-order list of values using an explicit stack.',
      example: { title: 'go left as far as possible', code: 'while node or stack:\n    while node:\n        stack.append(node)\n        node = node.left\n    node = stack.pop()\n    # visit node, then go right' },
      starter: TREE + '\ndef inorder(root):\n    result = []\n    # TODO\n    return result\n',
      solution: TREE + '\ndef inorder(root):\n    result, stack = [], []\n    node = root\n    while node or stack:\n        while node:\n            stack.append(node)\n            node = node.left\n        node = stack.pop()\n        result.append(node.val)\n        node = node.right\n    return result\n',
      tests: [
        { call: 'inorder(build([1, 2, 3, 4, 5]))', expect: [4, 2, 5, 1, 3] },
        { call: 'inorder(build([1, None, 2, 3]))', expect: [1, 3, 2] },
        { call: 'inorder(build([]))', expect: [] },
        { call: 'inorder(build([7]))', expect: [7] },
      ],
      explain: 'The stack holds the nodes whose left subtree we are still exploring. Iterative traversal avoids RecursionError on very deep (skewed) trees, which matters in Python because the recursion limit is about 1000.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Level order (BFS).** Write `levels(root)` that returns a list of levels, each a list of values left to right. Use a deque and process one level at a time.',
      example: { title: 'one level per loop', code: 'q = deque([root])\nwhile q:\n    size = len(q)          # nodes on this level\n    for _ in range(size):\n        node = q.popleft()\n        # add children to q' },
      starter: TREE + '\ndef levels(root):\n    # TODO\n    return []\n',
      solution: TREE + '\ndef levels(root):\n    if root is None:\n        return []\n    out, q = [], deque([root])\n    while q:\n        level = []\n        for _ in range(len(q)):\n            node = q.popleft()\n            level.append(node.val)\n            if node.left: q.append(node.left)\n            if node.right: q.append(node.right)\n        out.append(level)\n    return out\n',
      tests: [
        { call: 'levels(build([3, 9, 20, None, None, 15, 7]))', expect: [[3], [9, 20], [15, 7]] },
        { call: 'levels(build([1]))', expect: [[1]] },
        { call: 'levels(build([]))', expect: [] },
        { call: 'levels(build([1, 2, None, 3, None, 4]))', expect: [[1], [2], [3], [4]] },
      ],
      explain: 'Taking `len(q)` at the start of each round tells you exactly how many nodes belong to the current level; their children (added during the round) form the next level. BFS is O(n) time and O(width) space.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Height and balance.** Write `height(root)` (empty tree = 0, single node = 1) and `is_balanced(root)` that returns True if, for EVERY node, the heights of the left and right subtrees differ by at most 1. `is_balanced` must be O(n): compute heights bottom-up in one post-order pass (return -1 for "unbalanced").',
      example: { title: 'post-order returns info upward', code: 'def check(node):\n    if node is None:\n        return 0\n    l = check(node.left)\n    r = check(node.right)\n    # combine l and r for this node' },
      starter: TREE + '\ndef height(root):\n    return 0  # TODO\n\ndef is_balanced(root):\n    return True  # TODO\n',
      solution: TREE + '\ndef height(root):\n    if root is None:\n        return 0\n    return 1 + max(height(root.left), height(root.right))\n\ndef is_balanced(root):\n    def check(node):\n        if node is None:\n            return 0\n        l = check(node.left)\n        r = check(node.right)\n        if l == -1 or r == -1 or abs(l - r) > 1:\n            return -1\n        return 1 + max(l, r)\n    return check(root) != -1\n',
      tests: [
        { call: 'height(build([3, 9, 20, None, None, 15, 7]))', expect: 3 },
        { call: 'height(build([]))', expect: 0 },
        { call: 'is_balanced(build([3, 9, 20, None, None, 15, 7]))', expect: true },
        { call: 'is_balanced(build([1, 2, 2, 3, 3, None, None, 4, 4]))', expect: false },
        { call: 'is_balanced(build([1, 2, 2, 3, None, None, 3, 4, None, None, 4]))', expect: false, msg: 'Root looks balanced but inner nodes are not' },
        { call: 'is_balanced(build([]))', expect: true },
      ],
      explain: 'Calling `height()` separately at every node is O(n^2) on skewed trees. Post-order computes children first, so each node gets both heights in O(1) and the -1 signal stops further work as soon as any subtree is unbalanced.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Diameter of a binary tree.** The diameter is the number of EDGES on the longest path between any two nodes (it may not pass through the root). Write `diameter(root)` in O(n).',
      example: { title: 'path through a node', code: '# longest path through node = left_height + right_height\n# keep the best value seen in a nonlocal / list variable' },
      starter: TREE + '\ndef diameter(root):\n    # TODO\n    return 0\n',
      solution: TREE + '\ndef diameter(root):\n    best = 0\n    def depth(node):\n        nonlocal best\n        if node is None:\n            return 0\n        l, r = depth(node.left), depth(node.right)\n        best = max(best, l + r)\n        return 1 + max(l, r)\n    depth(root)\n    return best\n',
      tests: [
        { call: 'diameter(build([1, 2, 3, 4, 5]))', expect: 3 },
        { call: 'diameter(build([1, 2]))', expect: 1 },
        { call: 'diameter(build([1]))', expect: 0 },
        { call: 'diameter(build([]))', expect: 0 },
        { call: 'diameter(build([1, 2, None, 3, 4, 5, None, None, 6, 7, None, None, 8]))', expect: 6, msg: 'The longest path does not pass through the root' },
      ],
      explain: 'At each node, the longest path that bends there is `left_height + right_height` edges. The function returns height to its parent but records the best diameter on the side with `nonlocal`. A common mistake is returning only `height(root.left) + height(root.right)` for the root.',
    },
  ],
};
