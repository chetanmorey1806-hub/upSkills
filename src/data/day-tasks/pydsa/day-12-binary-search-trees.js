const BST = `class TreeNode:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def inorder(root):
    return [] if root is None else inorder(root.left) + [root.val] + inorder(root.right)
`;
const INSERT = `
def insert(root, val):
    if root is None:
        return TreeNode(val)
    if val < root.val:
        root.left = insert(root.left, val)
    elif val > root.val:
        root.right = insert(root.right, val)
    return root

def from_list(values):
    root = None
    for v in values:
        root = insert(root, v)
    return root
`;

export default {
  lesson: 'day-12-binary-search-trees',
  minutes: 40,
  intro: 'Use the BST property to search, insert and delete in O(h), validate a BST correctly with ranges, and use in-order traversal for sorted output and kth smallest.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'You insert 10, 20, 30, 40, 50 (already sorted) into an empty plain BST. What is the search time now?',
      options: ['O(1)', 'O(log n)', 'O(n), because the tree became a chain', 'O(n log n)'],
      answer: 2,
      explain: 'Each new value goes to the right of the previous one, so the "tree" is a linked list of height n and search is O(n). Self-balancing trees (AVL, Red-Black) rotate nodes to keep height O(log n).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which traversal of a BST visits the values in **sorted** order?',
      options: ['Preorder', 'Inorder', 'Postorder', 'Level order'],
      answer: 1,
      explain: 'In-order visits left subtree (smaller values), then the node, then the right subtree (bigger values), so it produces ascending order. This is the key to kth smallest and range queries.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Insert and search.** Write `insert(root, val)` (returns the root; ignore duplicates) and `contains(root, val)` that searches ITERATIVELY in O(h). `from_list(values)` is built from your insert.',
      example: { title: 'walking down a BST', code: 'node = root\nwhile node:\n    if x < node.val:\n        node = node.left\n    else:\n        node = node.right' },
      starter: BST + '\ndef insert(root, val):\n    # TODO\n    return root\n\ndef contains(root, val):\n    # TODO\n    return False\n\ndef from_list(values):\n    root = None\n    for v in values:\n        root = insert(root, v)\n    return root\n',
      solution: BST + INSERT + '\ndef contains(root, val):\n    node = root\n    while node:\n        if val == node.val:\n            return True\n        node = node.left if val < node.val else node.right\n    return False\n',
      tests: [
        { call: 'inorder(from_list([50, 30, 70, 20, 40, 60, 80]))', expect: [20, 30, 40, 50, 60, 70, 80] },
        { call: 'inorder(from_list([5, 3, 5, 3]))', expect: [3, 5], msg: 'Duplicates are ignored' },
        { call: 'contains(from_list([50, 30, 70, 20, 40]), 40)', expect: true },
        { call: 'contains(from_list([50, 30, 70]), 65)', expect: false },
        { call: 'contains(None, 1)', expect: false },
      ],
      explain: 'At every node, the BST property tells you which ONE side can contain the value, so you follow a single path from root to leaf: O(h). Returning the root from `insert` lets the recursion re-attach the new node to its parent.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 8,
      q: '**Validate a BST.** Write `is_bst(root)` that returns True only if EVERY node is greater than all values in its left subtree and smaller than all values in its right subtree (no duplicates allowed). Pass down a valid range `(low, high)`.',
      example: { title: 'range checking', code: 'def ok(node, low, high):\n    # node.val must be strictly between low and high\n    # left child range: (low, node.val)\n    # right child range: (node.val, high)\n    ...' },
      starter: BST + '\ndef is_bst(root):\n    # TODO\n    return True\n',
      solution: BST + '\ndef is_bst(root):\n    def ok(node, low, high):\n        if node is None:\n            return True\n        if not (low < node.val < high):\n            return False\n        return ok(node.left, low, node.val) and ok(node.right, node.val, high)\n    return ok(root, float("-inf"), float("inf"))\n',
      tests: [
        { call: 'is_bst(TreeNode(2, TreeNode(1), TreeNode(3)))', expect: true },
        { call: 'is_bst(TreeNode(5, TreeNode(1), TreeNode(4, TreeNode(3), TreeNode(6))))', expect: false },
        { call: 'is_bst(TreeNode(10, TreeNode(5), TreeNode(15, TreeNode(6), TreeNode(20))))', expect: false, msg: '6 is in the right subtree of 10, so it must be > 10 (parent-only checks miss this)' },
        { call: 'is_bst(TreeNode(2, TreeNode(2)))', expect: false, msg: 'Duplicates are not allowed' },
        { call: 'is_bst(None)', expect: true },
      ],
      explain: 'Comparing each node only with its direct parent is the classic mistake: in the third test, 6 < 15 is fine locally, but 6 sits in the RIGHT subtree of 10. Carrying the allowed range down the tree checks all ancestors at once, in O(n).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Kth smallest.** Write `kth_smallest(root, k)` (k is 1-based) using an in-order traversal that STOPS as soon as the kth value is found (iterative with a stack is ideal).',
      example: { title: 'counting during in-order', code: 'count += 1\nif count == k:\n    return node.val' },
      starter: BST + INSERT + '\ndef kth_smallest(root, k):\n    # TODO\n    return None\n',
      solution: BST + INSERT + '\ndef kth_smallest(root, k):\n    stack, node = [], root\n    while stack or node:\n        while node:\n            stack.append(node)\n            node = node.left\n        node = stack.pop()\n        k -= 1\n        if k == 0:\n            return node.val\n        node = node.right\n    return None\n',
      tests: [
        { call: 'kth_smallest(from_list([5, 3, 6, 2, 4, 1]), 3)', expect: 3 },
        { call: 'kth_smallest(from_list([5, 3, 6, 2, 4, 1]), 1)', expect: 1 },
        { call: 'kth_smallest(from_list([5, 3, 6, 2, 4, 1]), 6)', expect: 6 },
        { call: 'kth_smallest(from_list([8]), 1)', expect: 8 },
      ],
      explain: 'In-order produces ascending values, so the kth one visited is the answer. Stopping early makes it O(h + k) instead of building the full sorted list (O(n)).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 9,
      q: '**Delete a node.** Write `delete(root, key)` that removes `key` (if present) and returns the new root. Three cases: leaf → remove; one child → replace with the child; two children → copy the in-order successor (smallest value in the right subtree) into the node, then delete the successor from the right subtree.',
      example: { title: 'in-order successor', code: 'succ = node.right\nwhile succ.left:\n    succ = succ.left' },
      starter: BST + INSERT + '\ndef delete(root, key):\n    # TODO\n    return root\n',
      solution: BST + INSERT + '\ndef delete(root, key):\n    if root is None:\n        return None\n    if key < root.val:\n        root.left = delete(root.left, key)\n    elif key > root.val:\n        root.right = delete(root.right, key)\n    else:\n        if root.left is None:\n            return root.right\n        if root.right is None:\n            return root.left\n        succ = root.right\n        while succ.left:\n            succ = succ.left\n        root.val = succ.val\n        root.right = delete(root.right, succ.val)\n    return root\n',
      tests: [
        { call: 'inorder(delete(from_list([50, 30, 70, 20, 40, 60, 80]), 20))', expect: [30, 40, 50, 60, 70, 80], msg: 'Delete a leaf' },
        { call: 'inorder(delete(from_list([50, 30, 70, 60]), 70))', expect: [30, 50, 60], msg: 'Delete a node with one child' },
        { call: 'inorder(delete(from_list([50, 30, 70, 20, 40, 60, 80]), 50))', expect: [20, 30, 40, 60, 70, 80], msg: 'Delete the root with two children' },
        { call: 'delete(from_list([50, 30, 70, 20, 40, 60, 80]), 50).val', expect: 60, msg: 'The successor (60) replaces 50' },
        { call: 'inorder(delete(from_list([1, 2]), 9))', expect: [1, 2], msg: 'Missing key: tree unchanged' },
        { call: 'delete(from_list([7]), 7)', expect: null },
      ],
      explain: 'The in-order successor is bigger than everything on the left and smaller than everything else on the right, so it can take the deleted node\'s place without breaking the BST property. It has no left child, so deleting it afterwards is the easy case.',
    },
  ],
};
