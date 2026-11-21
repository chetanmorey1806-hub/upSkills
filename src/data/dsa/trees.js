export default [
  {
    id: 'tr-inorder-traversal',
    title: 'Binary Tree Inorder Traversal',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Infosys'],
    statement: 'A binary tree is given as a level-order array `tree`, with `null` for missing children (for example `[1, null, 2, 3]` means 1 has no left child, a right child 2, and 2 has a left child 3). Return the **inorder** traversal (left subtree, node, right subtree) of its values. An empty array means an empty tree.',
    examples: [
      { input: 'tree = [1, null, 2, 3]', output: '[1, 3, 2]' },
      { input: 'tree = [1, 2, 3, 4, 5]', output: '[4, 2, 5, 1, 3]' },
    ],
    constraints: ['0 <= number of nodes <= 100', '-100 <= node value <= 100'],
    hints: ['Recursion is easy; try doing it with an explicit stack.', 'Push left children until you hit null, then pop, record, and move to the right child.'],
    approach: 'First build the tree from the level-order array: create the root, then use a queue to hand out the next two array values as the left and right child of each node in turn. For an iterative inorder walk, keep a pointer cur and a stack. While cur is not null, push it and go left. When you cannot go further left, pop a node, record its value, and continue from its right child. Stop when both the stack and cur are empty. The recursive version is equally fast but can overflow the call stack on a very deep tree.',
    complexity: 'Time O(n), Space O(h) for the stack where h is the height',
    fn: { py: 'inorder_traversal', js: 'inorderTraversal' },
    py: {
      starter: 'def inorder_traversal(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def inorder_traversal(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    cur, stack, out = build(tree), [], []
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        out.append(cur.val)
        cur = cur.right
    return out
`,
    },
    js: {
      starter: 'function inorderTraversal(tree) {\n  // write your code here\n}\n',
      solution: `function inorderTraversal(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  let cur = build(tree);
  const stack = [], out = [];
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    out.push(cur.val);
    cur = cur.right;
  }
  return out;
}
`,
    },
    tests: [
      { args: [[1, null, 2, 3]], expect: [1, 3, 2] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2, 3, 4, 5]], expect: [4, 2, 5, 1, 3] },
      { args: [[4, 2, 6, 1, 3, 5, 7]], expect: [1, 2, 3, 4, 5, 6, 7] },
      { args: [[1, 2, null, 3]], expect: [3, 2, 1] },
      { args: [[5, 3, 8, null, 4, 7]], expect: [3, 4, 5, 7, 8] },
    ],
  },
  {
    id: 'tr-postorder-traversal',
    title: 'Binary Tree Postorder Traversal',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Wipro', 'Cognizant'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return the **postorder** traversal (left subtree, right subtree, then the node) of its values. An empty array means an empty tree.',
    examples: [
      { input: 'tree = [1, null, 2, 3]', output: '[3, 2, 1]' },
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: '[9, 15, 7, 20, 3]' },
    ],
    constraints: ['0 <= number of nodes <= 100', '-100 <= node value <= 100'],
    hints: ['Postorder is left, right, node. What is its reverse?', 'Do a "node, right, left" traversal with a stack, then reverse the result.'],
    approach: 'Build the tree from the level-order array with a queue. The reverse of postorder (left, right, node) is node, right, left, which is a simple preorder-like walk. Push the root on a stack; repeatedly pop a node, record it, then push its left child and then its right child (so the right one is popped first). Reversing the recorded list gives the postorder. Each node is pushed and popped once. A recursive version is shorter but risks stack overflow on deep trees.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'postorder_traversal', js: 'postorderTraversal' },
    py: {
      starter: 'def postorder_traversal(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def postorder_traversal(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    stack, out = [root], []
    while stack:
        node = stack.pop()
        out.append(node.val)
        if node.left:
            stack.append(node.left)
        if node.right:
            stack.append(node.right)
    return out[::-1]
`,
    },
    js: {
      starter: 'function postorderTraversal(tree) {\n  // write your code here\n}\n',
      solution: `function postorderTraversal(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const stack = [root], out = [];
  while (stack.length) {
    const node = stack.pop();
    out.push(node.val);
    if (node.left) stack.push(node.left);
    if (node.right) stack.push(node.right);
  }
  return out.reverse();
}
`,
    },
    tests: [
      { args: [[1, null, 2, 3]], expect: [3, 2, 1] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2, 3, 4, 5]], expect: [4, 5, 2, 3, 1] },
      { args: [[1, 2, 3, null, null, 4, 5]], expect: [2, 4, 5, 3, 1] },
      { args: [[3, 9, 20, null, null, 15, 7]], expect: [9, 15, 7, 20, 3] },
    ],
  },
  {
    id: 'tr-max-depth',
    title: 'Maximum Depth (Height) of a Binary Tree',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'TCS', 'Infosys', 'Accenture'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return its maximum depth: the number of nodes on the longest path from the root down to a leaf. An empty tree has depth 0.',
    examples: [
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: '3' },
      { input: 'tree = [1, null, 2]', output: '2' },
    ],
    constraints: ['0 <= number of nodes <= 10^4', '-100 <= node value <= 100'],
    hints: ['depth(node) = 1 + max(depth(left), depth(right)).', 'Or count the levels in a BFS.'],
    approach: 'Build the tree from the array, then run a level-order BFS. Process the queue one full level at a time: note how many nodes are in the queue, pop exactly that many while pushing their children, and add one to the depth. When the queue is empty, the counter equals the number of levels, which is the maximum depth. The recursive formula 1 + max(left, right) gives the same answer but can hit recursion limits on a skewed tree with 10^4 nodes.',
    complexity: 'Time O(n), Space O(w) where w is the widest level',
    fn: { py: 'max_depth', js: 'maxDepth' },
    py: {
      starter: 'def max_depth(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def max_depth(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return 0
    q, depth = deque([root]), 0
    while q:
        depth += 1
        for _ in range(len(q)):
            node = q.popleft()
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return depth
`,
    },
    js: {
      starter: 'function maxDepth(tree) {\n  // write your code here\n}\n',
      solution: `function maxDepth(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return 0;
  let level = [root], depth = 0;
  while (level.length) {
    depth++;
    const next = [];
    for (const node of level) {
      if (node.left) next.push(node.left);
      if (node.right) next.push(node.right);
    }
    level = next;
  }
  return depth;
}
`,
    },
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expect: 3 },
      { args: [[1, null, 2]], expect: 2 },
      { args: [[]], expect: 0 },
      { args: [[1]], expect: 1 },
      { args: [[1, 2, 3, 4, null, null, 5, 6]], expect: 4 },
      { args: [[1, 2, null, 3, null, 4]], expect: 4 },
    ],
  },
  {
    id: 'tr-symmetric-tree',
    title: 'Symmetric Tree',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'LinkedIn'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return `true` if the tree is a mirror image of itself around its centre, otherwise `false`. An empty tree is symmetric.',
    examples: [
      { input: 'tree = [1, 2, 2, 3, 4, 4, 3]', output: 'true' },
      { input: 'tree = [1, 2, 2, null, 3, null, 3]', output: 'false' },
    ],
    constraints: ['0 <= number of nodes <= 1000', '-100 <= node value <= 100'],
    hints: ['Compare the left subtree with the right subtree, mirrored.', 'Two nodes mirror each other if their values match, a.left mirrors b.right, and a.right mirrors b.left.'],
    approach: 'Build the tree, then compare its left and right subtrees as mirror images. Use a queue of node pairs starting with (root.left, root.right). For each pair: if both are null, continue; if only one is null or their values differ, return false. Otherwise push (a.left, b.right) and (a.right, b.left), because the outer children must match each other and the inner children must match each other. If the queue empties without a mismatch, the tree is symmetric. Building a mirrored copy and comparing would use extra O(n) memory for the copy.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'is_symmetric', js: 'isSymmetric' },
    py: {
      starter: 'def is_symmetric(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def is_symmetric(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return True
    q = deque([(root.left, root.right)])
    while q:
        a, b = q.popleft()
        if not a and not b:
            continue
        if not a or not b or a.val != b.val:
            return False
        q.append((a.left, b.right))
        q.append((a.right, b.left))
    return True
`,
    },
    js: {
      starter: 'function isSymmetric(tree) {\n  // write your code here\n}\n',
      solution: `function isSymmetric(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return true;
  const q = [[root.left, root.right]];
  for (let h = 0; h < q.length; h++) {
    const [a, b] = q[h];
    if (!a && !b) continue;
    if (!a || !b || a.val !== b.val) return false;
    q.push([a.left, b.right], [a.right, b.left]);
  }
  return true;
}
`,
    },
    tests: [
      { args: [[1, 2, 2, 3, 4, 4, 3]], expect: true },
      { args: [[1, 2, 2, null, 3, null, 3]], expect: false },
      { args: [[1]], expect: true },
      { args: [[]], expect: true },
      { args: [[1, 2, 3]], expect: false },
      { args: [[1, 2, 2, 2, null, 2]], expect: false },
      { args: [[2, 3, 3, 4, 5, 5, 4]], expect: true },
    ],
  },
  {
    id: 'tr-balanced-tree',
    title: 'Check if a Binary Tree is Balanced',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Flipkart', 'Infosys SP'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. A tree is **height-balanced** if, at every node, the heights of the left and right subtrees differ by at most 1. Return `true` if the tree is balanced, otherwise `false`. An empty tree is balanced.',
    examples: [
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: 'true' },
      { input: 'tree = [1, 2, 2, 3, 3, null, null, 4, 4]', output: 'false', explain: 'At the root, left height is 3 and right height is 1.' },
    ],
    constraints: ['0 <= number of nodes <= 5000', '-10^4 <= node value <= 10^4'],
    hints: ['Computing the height separately at every node repeats work: O(n^2).', 'Compute heights bottom-up once and check the difference at each node while you go.'],
    approach: 'Build the tree and list its nodes in BFS order. Walking that list backwards guarantees every child is handled before its parent. For each node, read the stored heights of its children (0 for a missing child); if they differ by more than 1, return false; otherwise store 1 + the larger height on the node. If no node fails, the tree is balanced. This bottom-up pass computes every height once. Calling a separate height function at every node would be O(n^2) on a skewed tree.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'is_balanced', js: 'isBalanced' },
    py: {
      starter: 'def is_balanced(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def is_balanced(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return True
    order, q = [], deque([root])
    while q:
        node = q.popleft()
        order.append(node)
        for child in (node.left, node.right):
            if child:
                q.append(child)
    height = {None: 0}
    for node in reversed(order):
        lh, rh = height[node.left], height[node.right]
        if abs(lh - rh) > 1:
            return False
        height[node] = 1 + max(lh, rh)
    return True
`,
    },
    js: {
      starter: 'function isBalanced(tree) {\n  // write your code here\n}\n',
      solution: `function isBalanced(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return true;
  const order = [root];
  for (let h = 0; h < order.length; h++) {
    const node = order[h];
    if (node.left) order.push(node.left);
    if (node.right) order.push(node.right);
  }
  const height = (node) => (node ? node.h : 0);
  for (let i = order.length - 1; i >= 0; i--) {
    const node = order[i];
    const lh = height(node.left), rh = height(node.right);
    if (Math.abs(lh - rh) > 1) return false;
    node.h = 1 + Math.max(lh, rh);
  }
  return true;
}
`,
    },
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expect: true },
      { args: [[1, 2, 2, 3, 3, null, null, 4, 4]], expect: false },
      { args: [[]], expect: true },
      { args: [[1]], expect: true },
      { args: [[1, 2, null, 3]], expect: false },
      { args: [[1, 2, 3, 4, null, null, 5]], expect: true },
      { args: [[1, 2, 2, 3, null, null, 3, 4, null, null, 4]], expect: false },
    ],
  },
  {
    id: 'tr-invert-tree',
    title: 'Invert (Mirror) a Binary Tree',
    diff: 'Easy',
    pattern: 'Trees & BST',
    companies: ['Google', 'Amazon', 'TCS', 'Capgemini'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Mirror the tree (swap the left and right child of every node) and return the result in the same level-order array format: list the children of every non-null node in BFS order, using `null` for a missing child, and remove trailing `null` values.',
    examples: [
      { input: 'tree = [4, 2, 7, 1, 3, 6, 9]', output: '[4, 7, 2, 9, 6, 3, 1]' },
      { input: 'tree = [1, 2]', output: '[1, null, 2]' },
    ],
    constraints: ['0 <= number of nodes <= 100', '-100 <= node value <= 100'],
    hints: ['Swap the children of every node; the order in which you visit nodes does not matter.', 'To serialise, BFS over the tree writing null for missing children, then trim the trailing nulls.'],
    approach: 'Build the tree from the array. Visit every node with a BFS queue and swap its left and right pointers; each node is swapped once, and since every subtree is also mirrored, the whole tree ends up mirrored. To produce the output, run another BFS from the root: append each node value, and for each real node push both children, writing null in the output for missing ones. Finally remove nulls from the end of the list. Building a brand-new mirrored tree also works but uses extra memory.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'invert_tree', js: 'invertTree' },
    py: {
      starter: 'def invert_tree(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def invert_tree(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    q = deque([root])
    while q:
        node = q.popleft()
        node.left, node.right = node.right, node.left
        for child in (node.left, node.right):
            if child:
                q.append(child)
    out, q = [], deque([root])
    while q:
        node = q.popleft()
        if node is None:
            out.append(None)
            continue
        out.append(node.val)
        q.append(node.left)
        q.append(node.right)
    while out and out[-1] is None:
        out.pop()
    return out
`,
    },
    js: {
      starter: 'function invertTree(tree) {\n  // write your code here\n}\n',
      solution: `function invertTree(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const q = [root];
  for (let h = 0; h < q.length; h++) {
    const node = q[h];
    [node.left, node.right] = [node.right, node.left];
    if (node.left) q.push(node.left);
    if (node.right) q.push(node.right);
  }
  const out = [], q2 = [root];
  for (let h = 0; h < q2.length; h++) {
    const node = q2[h];
    if (!node) { out.push(null); continue; }
    out.push(node.val);
    q2.push(node.left, node.right);
  }
  while (out.length && out[out.length - 1] === null) out.pop();
  return out;
}
`,
    },
    tests: [
      { args: [[4, 2, 7, 1, 3, 6, 9]], expect: [4, 7, 2, 9, 6, 3, 1] },
      { args: [[2, 1, 3]], expect: [2, 3, 1] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2]], expect: [1, null, 2] },
      { args: [[1, 2, 3, 4]], expect: [1, 3, 2, null, null, null, 4] },
      { args: [[1, null, 2, null, 3]], expect: [1, 2, null, 3] },
    ],
  },
  {
    id: 'tr-level-order',
    title: 'Level Order Traversal',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'TCS Digital'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return its values grouped by level: a list of lists, top level first, each level read from left to right. An empty tree gives `[]`.',
    examples: [
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: '[[3], [9, 20], [15, 7]]' },
      { input: 'tree = [1, null, 2, null, 3]', output: '[[1], [2], [3]]' },
    ],
    constraints: ['0 <= number of nodes <= 2000', '-1000 <= node value <= 1000'],
    hints: ['BFS visits nodes level by level.', 'Before processing a level, record how many nodes are in the queue.'],
    approach: 'Build the tree, then run BFS with a queue holding the root. At the start of each round the queue contains exactly the nodes of one level, so record its size, pop that many nodes, collect their values into a list, and push their children for the next round. Append the list to the result. Repeat until the queue is empty. Each node is enqueued and dequeued once. A DFS that passes the depth along and appends to result[depth] also works.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'level_order', js: 'levelOrder' },
    py: {
      starter: 'def level_order(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def level_order(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level)
    return res
`,
    },
    js: {
      starter: 'function levelOrder(tree) {\n  // write your code here\n}\n',
      solution: `function levelOrder(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    res.push(level.map((n) => n.val));
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}
`,
    },
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expect: [[3], [9, 20], [15, 7]] },
      { args: [[1]], expect: [[1]] },
      { args: [[]], expect: [] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [[1], [2, 3], [4, 5, 6, 7]] },
      { args: [[1, null, 2, null, 3]], expect: [[1], [2], [3]] },
      { args: [[1, 2, null, 3, null, 4]], expect: [[1], [2], [3], [4]] },
    ],
  },
  {
    id: 'tr-zigzag-level-order',
    title: 'Zigzag Level Order Traversal',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'Walmart'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return its values level by level, but alternate the direction: the first level left to right, the second right to left, the third left to right, and so on. An empty tree gives `[]`.',
    examples: [
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: '[[3], [20, 9], [15, 7]]' },
      { input: 'tree = [1, 2, 3, 4, null, null, 5]', output: '[[1], [3, 2], [4, 5]]' },
    ],
    constraints: ['0 <= number of nodes <= 2000', '-100 <= node value <= 100'],
    hints: ['Do a normal level-order traversal.', 'Reverse every second level before adding it to the answer.'],
    approach: 'Build the tree and perform a standard BFS that processes one level at a time, always pushing children left before right. Collect each level into a list. Keep a flag that flips after each level; when the flag says right-to-left, reverse the collected list before adding it to the result. The BFS itself never changes, so the children of the next level are still found correctly. Using two stacks is another classic way to produce the same order.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'zigzag_level_order', js: 'zigzagLevelOrder' },
    py: {
      starter: 'def zigzag_level_order(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def zigzag_level_order(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    res, q, left_to_right = [], deque([root]), True
    while q:
        level = []
        for _ in range(len(q)):
            node = q.popleft()
            level.append(node.val)
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
        res.append(level if left_to_right else level[::-1])
        left_to_right = not left_to_right
    return res
`,
    },
    js: {
      starter: 'function zigzagLevelOrder(tree) {\n  // write your code here\n}\n',
      solution: `function zigzagLevelOrder(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const res = [];
  let level = [root], leftToRight = true;
  while (level.length) {
    const vals = level.map((n) => n.val);
    res.push(leftToRight ? vals : vals.reverse());
    leftToRight = !leftToRight;
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}
`,
    },
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expect: [[3], [20, 9], [15, 7]] },
      { args: [[1]], expect: [[1]] },
      { args: [[]], expect: [] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [[1], [3, 2], [4, 5, 6, 7]] },
      { args: [[1, 2, 3, 4, null, null, 5]], expect: [[1], [3, 2], [4, 5]] },
      { args: [[1, 2, 3, 4, 5, 6, 7, 8, 9]], expect: [[1], [3, 2], [4, 5, 6, 7], [9, 8]] },
    ],
  },
  {
    id: 'tr-right-view',
    title: 'Right Side View',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Meta', 'Flipkart', 'Paytm'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Imagine standing on the right side of the tree. Return the values of the nodes you can see, from top to bottom (the last node of every level).',
    examples: [
      { input: 'tree = [1, 2, 3, null, 5, null, 4]', output: '[1, 3, 4]' },
      { input: 'tree = [1, 2, 3, 4]', output: '[1, 3, 4]', explain: 'Node 4 is visible because the right side has nothing at that depth.' },
    ],
    constraints: ['0 <= number of nodes <= 100', '-100 <= node value <= 100'],
    hints: ['Which node of each level is visible from the right?', 'Do a level-order traversal and take the last node of each level.'],
    approach: 'Build the tree and run a BFS that processes one level at a time, pushing children left then right. The rightmost node of each level is the last one in that level, so record its value. Lower levels that extend further than the right side still contribute their last node, which handles cases like a long left branch. A DFS that visits right before left and records the first node seen at each new depth also works. Both visit each node once.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'right_side_view', js: 'rightSideView' },
    py: {
      starter: 'def right_side_view(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def right_side_view(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    res, q = [], deque([root])
    while q:
        res.append(q[-1].val)
        for _ in range(len(q)):
            node = q.popleft()
            if node.left:
                q.append(node.left)
            if node.right:
                q.append(node.right)
    return res
`,
    },
    js: {
      starter: 'function rightSideView(tree) {\n  // write your code here\n}\n',
      solution: `function rightSideView(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const res = [];
  let level = [root];
  while (level.length) {
    res.push(level[level.length - 1].val);
    const next = [];
    for (const n of level) {
      if (n.left) next.push(n.left);
      if (n.right) next.push(n.right);
    }
    level = next;
  }
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, null, 5, null, 4]], expect: [1, 3, 4] },
      { args: [[1, null, 3]], expect: [1, 3] },
      { args: [[]], expect: [] },
      { args: [[1, 2, 3, 4]], expect: [1, 3, 4] },
      { args: [[1, 2]], expect: [1, 2] },
      { args: [[10, 20, 30, 40, 60]], expect: [10, 30, 60] },
    ],
  },
  {
    id: 'tr-top-view',
    title: 'Top View of a Binary Tree',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Flipkart', 'Paytm', 'Samsung'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Give the root horizontal distance 0; a left child has its parent\'s distance minus 1 and a right child plus 1. The top view contains, for each horizontal distance, the node that is **highest** (smallest depth); if two nodes share the depth, take the one that comes first in level order (leftmost). Return the top view from the leftmost distance to the rightmost.',
    examples: [
      { input: 'tree = [1, 2, 3, 4, 5, 6, 7]', output: '[4, 2, 1, 3, 7]' },
      { input: 'tree = [1, 2, 3, null, 4, 5, 6]', output: '[2, 1, 3, 6]', explain: '4 and 5 are hidden under the root (distance 0).' },
    ],
    constraints: ['0 <= number of nodes <= 10^5', '1 <= node value <= 10^5'],
    hints: ['BFS reaches higher nodes before lower ones.', 'Store the first node seen for each horizontal distance in a map, then output by sorted distance.'],
    approach: 'Build the tree and run a BFS that carries each node\'s horizontal distance. BFS processes nodes in level order, so the first node seen at a given distance is the highest one, and among nodes on the same level, the leftmost comes first. Record a value in a map only when its distance is seen for the first time. Track the minimum and maximum distance, then read the map from min to max. A DFS can also be used, but it must compare depths because it does not visit nodes level by level.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'top_view', js: 'topView' },
    py: {
      starter: 'def top_view(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def top_view(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    first = {}
    q = deque([(root, 0)])
    while q:
        node, hd = q.popleft()
        if hd not in first:
            first[hd] = node.val
        if node.left:
            q.append((node.left, hd - 1))
        if node.right:
            q.append((node.right, hd + 1))
    return [first[hd] for hd in range(min(first), max(first) + 1)]
`,
    },
    js: {
      starter: 'function topView(tree) {\n  // write your code here\n}\n',
      solution: `function topView(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const first = new Map();
  let lo = 0, hi = 0;
  const q = [[root, 0]];
  for (let h = 0; h < q.length; h++) {
    const [node, hd] = q[h];
    if (!first.has(hd)) first.set(hd, node.val);
    lo = Math.min(lo, hd);
    hi = Math.max(hi, hd);
    if (node.left) q.push([node.left, hd - 1]);
    if (node.right) q.push([node.right, hd + 1]);
  }
  const res = [];
  for (let d = lo; d <= hi; d++) res.push(first.get(d));
  return res;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [4, 2, 1, 3, 7] },
      { args: [[1, 2, 3, null, 4, 5, 6]], expect: [2, 1, 3, 6] },
      { args: [[1]], expect: [1] },
      { args: [[10, 20, 30, 40, 60, 90, 100]], expect: [40, 20, 10, 30, 100] },
      { args: [[1, 2, null, null, 3, null, 4, null, 5]], expect: [2, 1, 4, 5] },
      { args: [[]], expect: [] },
    ],
  },
  {
    id: 'tr-diameter',
    title: 'Diameter of a Binary Tree',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Google', 'Microsoft', 'Flipkart'],
    statement: 'A non-empty binary tree is given as a level-order array `tree` with `null` for missing children. The diameter is the number of **edges** on the longest path between any two nodes. The path does not have to pass through the root. Return the diameter.',
    examples: [
      { input: 'tree = [1, 2, 3, 4, 5]', output: '3', explain: 'Path 4 -> 2 -> 1 -> 3 (or 5 -> 2 -> 1 -> 3).' },
      { input: 'tree = [1, 2]', output: '1' },
    ],
    constraints: ['1 <= number of nodes <= 10^4', '-100 <= node value <= 100'],
    hints: ['The longest path "bends" at some node: it goes down into its left subtree and down into its right subtree.', 'At each node, left height + right height is a candidate. Compute heights bottom-up once.'],
    approach: 'Every path has a highest node where it turns; the longest path turning at node X has length height(X.left) + height(X.right), measured in edges. So compute the height of every node bottom-up and track the best such sum. Build the tree, list nodes in BFS order and walk the list backwards so children are done before parents. For each node, h = 1 + max(left h, right h) and update the answer with left h + right h. Computing heights separately for every node would be O(n^2).',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'diameter_of_binary_tree', js: 'diameterOfBinaryTree' },
    py: {
      starter: 'def diameter_of_binary_tree(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def diameter_of_binary_tree(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    order, q = [], deque([root])
    while q:
        node = q.popleft()
        order.append(node)
        for child in (node.left, node.right):
            if child:
                q.append(child)
    height = {None: 0}
    best = 0
    for node in reversed(order):
        lh, rh = height[node.left], height[node.right]
        best = max(best, lh + rh)
        height[node] = 1 + max(lh, rh)
    return best
`,
    },
    js: {
      starter: 'function diameterOfBinaryTree(tree) {\n  // write your code here\n}\n',
      solution: `function diameterOfBinaryTree(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  const order = [root];
  for (let h = 0; h < order.length; h++) {
    const n = order[h];
    if (n.left) order.push(n.left);
    if (n.right) order.push(n.right);
  }
  const ht = (n) => (n ? n.h : 0);
  let best = 0;
  for (let i = order.length - 1; i >= 0; i--) {
    const n = order[i];
    best = Math.max(best, ht(n.left) + ht(n.right));
    n.h = 1 + Math.max(ht(n.left), ht(n.right));
  }
  return best;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5]], expect: 3 },
      { args: [[1, 2]], expect: 1 },
      { args: [[1]], expect: 0 },
      { args: [[1, 2, 3, 4, 5, null, null, 6, null, null, 7]], expect: 4 },
      { args: [[1, null, 2, null, 3, null, 4]], expect: 3 },
      { args: [[4, -7, -3, null, null, -9, -3, 9, -7, -4, null, 6, null, -6, -6, null, null, 0, 6, 5, null, 9, null, null, -1, -4, null, null, null, -2]], expect: 8 },
    ],
  },
  {
    id: 'tr-lowest-common-ancestor',
    title: 'Lowest Common Ancestor in a Binary Tree',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'Google', 'TCS Digital'],
    statement: 'A binary tree with **distinct** values is given as a level-order array `tree` with `null` for missing children. Given two values `p` and `q` that both exist in the tree, return the value of their lowest common ancestor: the deepest node that has both of them as descendants (a node counts as a descendant of itself).',
    examples: [
      { input: 'tree = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 1', output: '3' },
      { input: 'tree = [3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], p = 5, q = 4', output: '5', explain: '5 is an ancestor of 4 and of itself.' },
    ],
    constraints: ['2 <= number of nodes <= 10^5', 'All values are distinct.', 'p != q and both exist in the tree.'],
    hints: ['Record each node\'s parent with a BFS.', 'Collect all ancestors of p in a set; walk up from q until you hit one of them.'],
    approach: 'Build the tree and run a BFS that stores, for every value, the value of its parent. Then walk from p up to the root, putting every value on the way into a set (p itself included). Next walk from q upwards; the first value that is already in the set is the lowest common ancestor, because it is the deepest node shared by both root paths. Both walks are at most the tree height. The recursive solution (return the node if it is p or q, otherwise combine answers from both subtrees) is equally fast but recursion depth can be large.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'lowest_common_ancestor', js: 'lowestCommonAncestor' },
    py: {
      starter: 'def lowest_common_ancestor(tree, p, q):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def lowest_common_ancestor(tree, p, q):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    parent = {root.val: None}
    dq = deque([root])
    while dq:
        node = dq.popleft()
        for child in (node.left, node.right):
            if child:
                parent[child.val] = node.val
                dq.append(child)
    ancestors = set()
    x = p
    while x is not None:
        ancestors.add(x)
        x = parent[x]
    y = q
    while y not in ancestors:
        y = parent[y]
    return y
`,
    },
    js: {
      starter: 'function lowestCommonAncestor(tree, p, q) {\n  // write your code here\n}\n',
      solution: `function lowestCommonAncestor(tree, p, q) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  const parent = new Map([[root.val, null]]);
  const dq = [root];
  for (let h = 0; h < dq.length; h++) {
    const node = dq[h];
    for (const child of [node.left, node.right]) {
      if (child) { parent.set(child.val, node.val); dq.push(child); }
    }
  }
  const ancestors = new Set();
  for (let x = p; x !== null; x = parent.get(x)) ancestors.add(x);
  let y = q;
  while (!ancestors.has(y)) y = parent.get(y);
  return y;
}
`,
    },
    tests: [
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 1], expect: 3 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 5, 4], expect: 5 },
      { args: [[1, 2], 1, 2], expect: 1 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 7, 8], expect: 3 },
      { args: [[3, 5, 1, 6, 2, 0, 8, null, null, 7, 4], 6, 4], expect: 5 },
      { args: [[1, 2, 3, 4, 5, 6, 7], 4, 5], expect: 2 },
      { args: [[1, 2, 3, 4, 5, 6, 7], 7, 3], expect: 3 },
    ],
  },
  {
    id: 'tr-validate-bst',
    title: 'Validate Binary Search Tree',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'Infosys SP', 'Adobe'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return `true` if it is a valid binary search tree: for every node, all values in its left subtree are **strictly less** than the node and all values in its right subtree are **strictly greater**. Otherwise return `false`.',
    examples: [
      { input: 'tree = [2, 1, 3]', output: 'true' },
      { input: 'tree = [5, 4, 6, null, null, 3, 7]', output: 'false', explain: '3 is in the right subtree of 5 but smaller than 5.' },
    ],
    constraints: ['1 <= number of nodes <= 10^4', '-2^31 <= node value <= 2^31 - 1'],
    hints: ['Checking only a node against its direct children is not enough.', 'An inorder traversal of a valid BST is strictly increasing.'],
    approach: 'The key property: reading a BST in inorder (left, node, right) yields its values in strictly increasing order, and only a valid BST does that. Build the tree, then do an iterative inorder traversal with a stack while remembering the previous value. If any value is less than or equal to the previous one, return false. If the walk finishes, return true. A common wrong solution only compares each node with its immediate children and misses deeper violations like the example. Passing (low, high) bounds down the tree is another correct O(n) method.',
    complexity: 'Time O(n), Space O(h)',
    fn: { py: 'is_valid_bst', js: 'isValidBST' },
    py: {
      starter: 'def is_valid_bst(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def is_valid_bst(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    cur, stack, prev = build(tree), [], None
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        if prev is not None and cur.val <= prev:
            return False
        prev = cur.val
        cur = cur.right
    return True
`,
    },
    js: {
      starter: 'function isValidBST(tree) {\n  // write your code here\n}\n',
      solution: `function isValidBST(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  let cur = build(tree), prev = null;
  const stack = [];
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (prev !== null && cur.val <= prev) return false;
    prev = cur.val;
    cur = cur.right;
  }
  return true;
}
`,
    },
    tests: [
      { args: [[2, 1, 3]], expect: true },
      { args: [[5, 1, 4, null, null, 3, 6]], expect: false },
      { args: [[1]], expect: true },
      { args: [[5, 4, 6, null, null, 3, 7]], expect: false },
      { args: [[2, 2, 2]], expect: false },
      { args: [[10, 5, 15, null, null, 12, 20]], expect: true },
      { args: [[3, 1, 5, 0, 2, 4, 6]], expect: true },
    ],
  },
  {
    id: 'tr-kth-smallest-bst',
    title: 'Kth Smallest Element in a BST',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Google', 'Uber'],
    statement: 'A valid binary search tree is given as a level-order array `tree` with `null` for missing children. Return the `k`-th smallest value in the tree (1-indexed).',
    examples: [
      { input: 'tree = [3, 1, 4, null, 2], k = 1', output: '1' },
      { input: 'tree = [5, 3, 6, 2, 4, null, null, 1], k = 3', output: '3' },
    ],
    constraints: ['1 <= k <= number of nodes <= 10^4', '0 <= node value <= 10^4'],
    hints: ['Inorder traversal of a BST visits values in sorted order.', 'Stop as soon as you have popped k nodes.'],
    approach: 'Because an inorder walk of a BST produces values in ascending order, the k-th value popped during that walk is the answer. Build the tree, then run an iterative inorder traversal with a stack: go left as far as possible, pop a node, decrease k, and return the node value when k reaches 0; otherwise move to the right child. The walk stops early, so it only touches about h + k nodes. Collecting all values and sorting them would cost O(n log n) and O(n) extra memory.',
    complexity: 'Time O(h + k), Space O(h)',
    fn: { py: 'kth_smallest', js: 'kthSmallest' },
    py: {
      starter: 'def kth_smallest(tree, k):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def kth_smallest(tree, k):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    cur, stack = build(tree), []
    while cur or stack:
        while cur:
            stack.append(cur)
            cur = cur.left
        cur = stack.pop()
        k -= 1
        if k == 0:
            return cur.val
        cur = cur.right
    return -1
`,
    },
    js: {
      starter: 'function kthSmallest(tree, k) {\n  // write your code here\n}\n',
      solution: `function kthSmallest(tree, k) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  let cur = build(tree);
  const stack = [];
  while (cur || stack.length) {
    while (cur) { stack.push(cur); cur = cur.left; }
    cur = stack.pop();
    if (--k === 0) return cur.val;
    cur = cur.right;
  }
  return -1;
}
`,
    },
    tests: [
      { args: [[3, 1, 4, null, 2], 1], expect: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 3], expect: 3 },
      { args: [[1], 1], expect: 1 },
      { args: [[5, 3, 6, 2, 4, null, null, 1], 6], expect: 6 },
      { args: [[2, 1, 3], 2], expect: 2 },
      { args: [[10, 5, 15, 3, 7, 12, 20], 5], expect: 12 },
    ],
  },
  {
    id: 'tr-path-sum-all',
    title: 'All Root-to-Leaf Paths with Target Sum',
    diff: 'Medium',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Return every root-to-leaf path whose values add up to `target`. Each path is a list of node values from the root to the leaf. List the paths in left-to-right order of their leaves. Return `[]` if there are none.',
    examples: [
      { input: 'tree = [5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], target = 22', output: '[[5, 4, 11, 2], [5, 8, 4, 5]]' },
      { input: 'tree = [1, 2, 3], target = 4', output: '[[1, 3]]' },
    ],
    constraints: ['0 <= number of nodes <= 5000', '-1000 <= node value, target <= 1000'],
    hints: ['Carry the current path and its sum while you go down.', 'At a leaf, check the sum. Explore left before right to keep the required order.'],
    approach: 'Build the tree and run a depth-first search that carries the path so far and its running sum. Use an explicit stack of (node, path, sum) entries, pushing the right child before the left so the left side is explored first; this lists the leaves from left to right. When a popped node has no children and its running sum equals the target, add its path to the answer. Only leaves end a path, so internal nodes with the right sum are ignored. Values can be negative, so you cannot stop early when the sum passes the target.',
    complexity: 'Time O(n * h) including path copies, Space O(n * h) in the worst case',
    fn: { py: 'path_sum', js: 'pathSum' },
    py: {
      starter: 'def path_sum(tree, target):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def path_sum(tree, target):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    if not root:
        return []
    res = []
    stack = [(root, [root.val], root.val)]
    while stack:
        node, path, s = stack.pop()
        if not node.left and not node.right:
            if s == target:
                res.append(path)
            continue
        if node.right:
            stack.append((node.right, path + [node.right.val], s + node.right.val))
        if node.left:
            stack.append((node.left, path + [node.left.val], s + node.left.val))
    return res
`,
    },
    js: {
      starter: 'function pathSum(tree, target) {\n  // write your code here\n}\n',
      solution: `function pathSum(tree, target) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  if (!root) return [];
  const res = [];
  const stack = [[root, [root.val], root.val]];
  while (stack.length) {
    const [node, path, s] = stack.pop();
    if (!node.left && !node.right) {
      if (s === target) res.push(path);
      continue;
    }
    if (node.right) stack.push([node.right, [...path, node.right.val], s + node.right.val]);
    if (node.left) stack.push([node.left, [...path, node.left.val], s + node.left.val]);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1], 22], expect: [[5, 4, 11, 2], [5, 8, 4, 5]] },
      { args: [[1, 2, 3], 5], expect: [] },
      { args: [[1, 2], 0], expect: [] },
      { args: [[1], 1], expect: [[1]] },
      { args: [[1, 2, 3], 4], expect: [[1, 3]] },
      { args: [[-2, null, -3], -5], expect: [[-2, -3]] },
      { args: [[1, 2, 2, 3, null, null, 3], 6], expect: [[1, 2, 3], [1, 2, 3]] },
    ],
  },
  {
    id: 'tr-max-path-sum',
    title: 'Binary Tree Maximum Path Sum',
    diff: 'Hard',
    pattern: 'Trees & BST',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta'],
    statement: 'A non-empty binary tree is given as a level-order array `tree` with `null` for missing children. A path is any sequence of nodes connected by edges where no node appears twice; it does not need to pass through the root and must contain at least one node. Return the largest possible sum of the values on a path.',
    examples: [
      { input: 'tree = [-10, 9, 20, null, null, 15, 7]', output: '42', explain: '15 -> 20 -> 7' },
      { input: 'tree = [-3]', output: '-3' },
    ],
    constraints: ['1 <= number of nodes <= 3 * 10^4', '-1000 <= node value <= 1000'],
    hints: ['For each node compute the best downward "arm" starting at it: value + max(0, best child arm).', 'The best path that bends at a node is value + max(0, left arm) + max(0, right arm).'],
    approach: 'For every node define gain(node), the best sum of a path that starts at the node and goes straight down: node value plus the larger child gain, ignoring a child whose gain is negative. A path that bends at the node uses both arms: value + max(0, left gain) + max(0, right gain), and this is a candidate for the answer. Build the tree, list nodes in BFS order, and process that list backwards so children are computed before parents. Start the answer at negative infinity so all-negative trees return their largest single value. Trying all pairs of endpoints would be O(n^2) or worse.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'max_path_sum', js: 'maxPathSum' },
    py: {
      starter: 'def max_path_sum(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def max_path_sum(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    order, q = [], deque([root])
    while q:
        node = q.popleft()
        order.append(node)
        for child in (node.left, node.right):
            if child:
                q.append(child)
    gain = {None: 0}
    best = float('-inf')
    for node in reversed(order):
        lg = max(0, gain[node.left])
        rg = max(0, gain[node.right])
        best = max(best, node.val + lg + rg)
        gain[node] = node.val + max(lg, rg)
    return best
`,
    },
    js: {
      starter: 'function maxPathSum(tree) {\n  // write your code here\n}\n',
      solution: `function maxPathSum(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  const order = [root];
  for (let h = 0; h < order.length; h++) {
    const n = order[h];
    if (n.left) order.push(n.left);
    if (n.right) order.push(n.right);
  }
  const g = (n) => (n ? Math.max(0, n.gain) : 0);
  let best = -Infinity;
  for (let i = order.length - 1; i >= 0; i--) {
    const n = order[i];
    const lg = g(n.left), rg = g(n.right);
    best = Math.max(best, n.val + lg + rg);
    n.gain = n.val + Math.max(lg, rg);
  }
  return best;
}
`,
    },
    tests: [
      { args: [[1, 2, 3]], expect: 6 },
      { args: [[-10, 9, 20, null, null, 15, 7]], expect: 42 },
      { args: [[-3]], expect: -3 },
      { args: [[2, -1]], expect: 2 },
      { args: [[1, -2, 3]], expect: 4 },
      { args: [[5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1]], expect: 48 },
      { args: [[-1, -2, -3]], expect: -1 },
    ],
  },
  {
    id: 'tr-vertical-order',
    title: 'Vertical Order Traversal',
    diff: 'Hard',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Meta', 'Flipkart', 'Microsoft'],
    statement: 'A binary tree is given as a level-order array `tree` with `null` for missing children. Place the root at row 0, column 0; a left child is at (row + 1, col - 1) and a right child at (row + 1, col + 1). Return the vertical order: one list per column from the leftmost to the rightmost. Inside a column, order nodes by row (top first), and nodes in the same row and column by value (smallest first).',
    examples: [
      { input: 'tree = [3, 9, 20, null, null, 15, 7]', output: '[[9], [3, 15], [20], [7]]' },
      { input: 'tree = [1, 2, 3, 4, 6, 5, 7]', output: '[[4], [2], [1, 5, 6], [3], [7]]', explain: '5 and 6 share row 2, column 0, so they are sorted by value.' },
    ],
    constraints: ['1 <= number of nodes <= 1000', '0 <= node value <= 1000'],
    hints: ['Record (column, row, value) for every node.', 'Sort these triples, then group by column.'],
    approach: 'Build the tree and traverse it with BFS, carrying each node\'s row and column. Store a triple (column, row, value) for every node. Sorting the triples orders them by column first, then row, then value, which is exactly the required tie-breaking. Finally walk through the sorted list and start a new group whenever the column changes. The sort dominates the cost. Using only a hash map of columns without sorting inside each column would get the same-row ties wrong.',
    complexity: 'Time O(n log n), Space O(n)',
    fn: { py: 'vertical_traversal', js: 'verticalTraversal' },
    py: {
      starter: 'def vertical_traversal(tree):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def vertical_traversal(tree):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    triples = []
    q = deque([(root, 0, 0)])
    while q:
        node, row, col = q.popleft()
        triples.append((col, row, node.val))
        if node.left:
            q.append((node.left, row + 1, col - 1))
        if node.right:
            q.append((node.right, row + 1, col + 1))
    triples.sort()
    res, last = [], None
    for col, _, val in triples:
        if col != last:
            res.append([])
            last = col
        res[-1].append(val)
    return res
`,
    },
    js: {
      starter: 'function verticalTraversal(tree) {\n  // write your code here\n}\n',
      solution: `function verticalTraversal(tree) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  const triples = [];
  const q = [[root, 0, 0]];
  for (let h = 0; h < q.length; h++) {
    const [node, row, col] = q[h];
    triples.push([col, row, node.val]);
    if (node.left) q.push([node.left, row + 1, col - 1]);
    if (node.right) q.push([node.right, row + 1, col + 1]);
  }
  triples.sort((a, b) => a[0] - b[0] || a[1] - b[1] || a[2] - b[2]);
  const res = [];
  let last = null;
  for (const [col, , val] of triples) {
    if (col !== last) { res.push([]); last = col; }
    res[res.length - 1].push(val);
  }
  return res;
}
`,
    },
    tests: [
      { args: [[3, 9, 20, null, null, 15, 7]], expect: [[9], [3, 15], [20], [7]] },
      { args: [[1, 2, 3, 4, 5, 6, 7]], expect: [[4], [2], [1, 5, 6], [3], [7]] },
      { args: [[1, 2, 3, 4, 6, 5, 7]], expect: [[4], [2], [1, 5, 6], [3], [7]] },
      { args: [[1]], expect: [[1]] },
      { args: [[1, 2, null, 3]], expect: [[3], [2], [1]] },
      { args: [[3, 1, 4, 0, 2, 2]], expect: [[0], [1], [3, 2, 2], [4]] },
    ],
  },
  {
    id: 'tr-burn-tree',
    title: 'Minimum Time to Burn a Binary Tree',
    diff: 'Hard',
    pattern: 'Trees & BST',
    companies: ['Amazon', 'Flipkart', 'Samsung', 'TCS Digital'],
    statement: 'A binary tree with **distinct** values is given as a level-order array `tree` with `null` for missing children. A fire starts at the node whose value is `target`. Every second, the fire spreads from each burning node to its parent and both children. Return the number of seconds until the whole tree is burning.',
    examples: [
      { input: 'tree = [1, 2, 3, 4, 5, 6, 7], target = 2', output: '3', explain: 'Second 1: 4, 5, 1. Second 2: 3. Second 3: 6, 7.' },
      { input: 'tree = [1], target = 1', output: '0' },
    ],
    constraints: ['1 <= number of nodes <= 10^5', 'All values are distinct and target exists.'],
    hints: ['Fire spreads upward too, so treat the tree as an undirected graph.', 'Store parent links, then BFS from the target; the number of BFS levels is the answer.'],
    approach: 'Build the tree and run a BFS that records each node\'s parent and finds the target node. Now every node has up to three neighbours: left child, right child and parent. Run a second BFS starting from the target, level by level, with a visited set; each level is one second of burning. The answer is the number of levels after the first, i.e. the largest distance from the target to any node. Simulating the fire second by second over the whole tree would cost O(n) per second and O(n^2) overall.',
    complexity: 'Time O(n), Space O(n)',
    fn: { py: 'min_burn_time', js: 'minBurnTime' },
    py: {
      starter: 'def min_burn_time(tree, target):\n    # write your code here\n    pass\n',
      solution: `from collections import deque

def min_burn_time(tree, target):
    class Node:
        def __init__(self, val):
            self.val, self.left, self.right = val, None, None

    def build(vals):
        if not vals or vals[0] is None:
            return None
        root = Node(vals[0])
        q = deque([root])
        i = 1
        while q and i < len(vals):
            node = q.popleft()
            if i < len(vals) and vals[i] is not None:
                node.left = Node(vals[i])
                q.append(node.left)
            i += 1
            if i < len(vals) and vals[i] is not None:
                node.right = Node(vals[i])
                q.append(node.right)
            i += 1
        return root

    root = build(tree)
    parent = {root: None}
    start = None
    q = deque([root])
    while q:
        node = q.popleft()
        if node.val == target:
            start = node
        for child in (node.left, node.right):
            if child:
                parent[child] = node
                q.append(child)
    seen = {start}
    frontier = [start]
    seconds = -1
    while frontier:
        seconds += 1
        nxt = []
        for node in frontier:
            for nb in (node.left, node.right, parent[node]):
                if nb and nb not in seen:
                    seen.add(nb)
                    nxt.append(nb)
        frontier = nxt
    return seconds
`,
    },
    js: {
      starter: 'function minBurnTime(tree, target) {\n  // write your code here\n}\n',
      solution: `function minBurnTime(tree, target) {
  const build = (vals) => {
    if (!vals.length || vals[0] === null) return null;
    const root = { val: vals[0], left: null, right: null };
    const q = [root];
    let i = 1;
    for (let h = 0; h < q.length && i < vals.length; h++) {
      const node = q[h];
      if (i < vals.length && vals[i] !== null) { node.left = { val: vals[i], left: null, right: null }; q.push(node.left); }
      i++;
      if (i < vals.length && vals[i] !== null) { node.right = { val: vals[i], left: null, right: null }; q.push(node.right); }
      i++;
    }
    return root;
  };
  const root = build(tree);
  const parent = new Map([[root, null]]);
  let start = null;
  const q = [root];
  for (let h = 0; h < q.length; h++) {
    const node = q[h];
    if (node.val === target) start = node;
    for (const child of [node.left, node.right]) {
      if (child) { parent.set(child, node); q.push(child); }
    }
  }
  const seen = new Set([start]);
  let frontier = [start], seconds = -1;
  while (frontier.length) {
    seconds++;
    const next = [];
    for (const node of frontier) {
      for (const nb of [node.left, node.right, parent.get(node)]) {
        if (nb && !seen.has(nb)) { seen.add(nb); next.push(nb); }
      }
    }
    frontier = next;
  }
  return seconds;
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5, 6, 7], 2], expect: 3 },
      { args: [[1], 1], expect: 0 },
      { args: [[1, 2, 3, 4, 5, null, 6, null, null, 7, 8, null, 9, null, null, null, null, null, 10], 8], expect: 7 },
      { args: [[1, 2, 3, 4, 5, 6, 7], 1], expect: 2 },
      { args: [[1, 2, null, 3, null, 4], 4], expect: 3 },
      { args: [[1, 2, 3, null, 4, null, 5], 5], expect: 4 },
    ],
  },
];
