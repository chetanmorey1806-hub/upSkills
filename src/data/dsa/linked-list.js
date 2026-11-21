export default [
  {
    id: 'll-reverse-list',
    title: 'Reverse a Linked List',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'TCS', 'Infosys'],
    statement: 'A singly linked list is shown as an array of its values from head to tail (for example `[1, 2, 3]` means 1 -> 2 -> 3, and `[]` is an empty list). Reverse the list and return it in the same array form. Work with real nodes: build the list, reverse the links, then convert back.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[5, 4, 3, 2, 1]' },
      { input: 'head = [1, 2]', output: '[2, 1]' },
    ],
    constraints: ['0 <= list length <= 5000', '-5000 <= node value <= 5000'],
    hints: ['Walk the list once and flip each next pointer.', 'Keep three pointers: prev, cur and the saved next node.'],
    approach: 'Build the nodes from the array. Walk the list with two pointers, prev (starting at null) and cur (starting at head). At each step save cur.next, point cur.next back to prev, then move prev to cur and cur to the saved node. When cur becomes null, prev is the new head. Convert the list back to an array. Copying values into an array and rebuilding works too, but it does not practise pointer manipulation and uses O(n) extra space.',
    complexity: 'Time O(n), Space O(1) besides the input and output conversion',
    fn: { py: 'reverse_list', js: 'reverseList' },
    py: {
      starter: 'def reverse_list(head):\n    # write your code here\n    pass\n',
      solution: `def reverse_list(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    prev, cur = None, build(head)
    while cur:
        nxt = cur.next
        cur.next = prev
        prev, cur = cur, nxt
    return to_list(prev)
`,
    },
    js: {
      starter: 'function reverseList(head) {\n  // write your code here\n}\n',
      solution: `function reverseList(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  let prev = null, cur = build(head);
  while (cur) {
    const next = cur.next;
    cur.next = prev;
    prev = cur;
    cur = next;
  }
  return toList(prev);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5]], expect: [5, 4, 3, 2, 1] },
      { args: [[1, 2]], expect: [2, 1] },
      { args: [[]], expect: [] },
      { args: [[7]], expect: [7] },
      { args: [[3, 3, 1]], expect: [1, 3, 3] },
      { args: [[-1, 0, 1]], expect: [1, 0, -1] },
    ],
  },
  {
    id: 'll-middle-node',
    title: 'Middle of the Linked List',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Amazon', 'Adobe', 'Wipro', 'TCS'],
    statement: 'A non-empty singly linked list is shown as an array of its values from head to tail. Find the middle node and return the part of the list that starts at it (as an array). If there are two middle nodes, use the **second** one.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[3, 4, 5]' },
      { input: 'head = [1, 2, 3, 4, 5, 6]', output: '[4, 5, 6]', explain: 'The middles are 3 and 4; take the second.' },
    ],
    constraints: ['1 <= list length <= 100', '1 <= node value <= 100'],
    hints: ['You could count the nodes first, but one pass is enough.', 'Move a slow pointer one step and a fast pointer two steps at a time.'],
    approach: 'Build the list and start two pointers at the head. Move slow by one node and fast by two nodes while fast and fast.next exist. When fast reaches the end, slow has covered half the distance and sits on the middle node; with an even length this loop stops on the second middle. Convert the list from slow onwards to an array. Counting the length first and then walking to length / 2 also works but needs two passes.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'middle_node', js: 'middleNode' },
    py: {
      starter: 'def middle_node(head):\n    # write your code here\n    pass\n',
      solution: `def middle_node(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    slow = fast = build(head)
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return to_list(slow)
`,
    },
    js: {
      starter: 'function middleNode(head) {\n  // write your code here\n}\n',
      solution: `function middleNode(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  let slow = build(head), fast = slow;
  while (fast && fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return toList(slow);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5]], expect: [3, 4, 5] },
      { args: [[1, 2, 3, 4, 5, 6]], expect: [4, 5, 6] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2]], expect: [2] },
      { args: [[9, 8, 7]], expect: [8, 7] },
      { args: [[5, 6, 7, 8]], expect: [7, 8] },
    ],
  },
  {
    id: 'll-merge-two-sorted',
    title: 'Merge Two Sorted Lists',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Accenture'],
    statement: 'Two linked lists sorted in ascending order are shown as arrays `a` and `b`. Merge them by relinking their nodes into one sorted list and return it as an array.',
    examples: [
      { input: 'a = [1, 2, 4], b = [1, 3, 4]', output: '[1, 1, 2, 3, 4, 4]' },
      { input: 'a = [], b = [0]', output: '[0]' },
    ],
    constraints: ['0 <= each length <= 50', '-100 <= node value <= 100'],
    hints: ['Use a dummy head so you do not need a special case for the first node.', 'Attach the smaller of the two current nodes, then advance that list.'],
    approach: 'Build both lists. Create a dummy node and a tail pointer at it. While both lists have nodes, attach the smaller current node to tail.next, advance that list and move tail forward. When one list runs out, attach the rest of the other list directly, since it is already sorted. The merged list starts at dummy.next. Collecting all values and sorting them would cost O((n + m) log(n + m)).',
    complexity: 'Time O(n + m), Space O(1) extra',
    fn: { py: 'merge_two_lists', js: 'mergeTwoLists' },
    py: {
      starter: 'def merge_two_lists(a, b):\n    # write your code here\n    pass\n',
      solution: `def merge_two_lists(a, b):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    l1, l2 = build(a), build(b)
    dummy = tail = Node(0)
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function mergeTwoLists(a, b) {\n  // write your code here\n}\n',
      solution: `function mergeTwoLists(a, b) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  let l1 = build(a), l2 = build(b);
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { tail.next = l1; l1 = l1.next; }
    else { tail.next = l2; l2 = l2.next; }
    tail = tail.next;
  }
  tail.next = l1 || l2;
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 4], [1, 3, 4]], expect: [1, 1, 2, 3, 4, 4] },
      { args: [[], []], expect: [] },
      { args: [[], [0]], expect: [0] },
      { args: [[5], [1, 2, 3]], expect: [1, 2, 3, 5] },
      { args: [[-2, 10], [-3, 10, 11]], expect: [-3, -2, 10, 10, 11] },
      { args: [[1, 1], [1]], expect: [1, 1, 1] },
    ],
  },
  {
    id: 'll-remove-duplicates-sorted',
    title: 'Remove Duplicates from a Sorted List',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Amazon', 'Infosys', 'Cognizant'],
    statement: 'A linked list sorted in ascending order is shown as an array of its values. Delete nodes so that each value appears only once, and return the resulting list as an array.',
    examples: [
      { input: 'head = [1, 1, 2]', output: '[1, 2]' },
      { input: 'head = [-1, 0, 0, 0, 5, 5]', output: '[-1, 0, 5]' },
    ],
    constraints: ['0 <= list length <= 300', '-100 <= node value <= 100', 'The list is sorted.'],
    hints: ['Duplicates are always next to each other in a sorted list.', 'If cur.next has the same value as cur, skip it by relinking.'],
    approach: 'Build the list and walk it with a pointer cur. Because the list is sorted, equal values are adjacent. If cur.next has the same value as cur, unlink it with cur.next = cur.next.next and stay on cur, since there may be more copies. Otherwise move cur forward. At the end every value appears once. Using a hash set would work on unsorted lists but needs O(n) extra space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'delete_duplicates', js: 'deleteDuplicates' },
    py: {
      starter: 'def delete_duplicates(head):\n    # write your code here\n    pass\n',
      solution: `def delete_duplicates(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    first = cur = build(head)
    while cur and cur.next:
        if cur.next.val == cur.val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return to_list(first)
`,
    },
    js: {
      starter: 'function deleteDuplicates(head) {\n  // write your code here\n}\n',
      solution: `function deleteDuplicates(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const first = build(head);
  let cur = first;
  while (cur && cur.next) {
    if (cur.next.val === cur.val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return toList(first);
}
`,
    },
    tests: [
      { args: [[1, 1, 2]], expect: [1, 2] },
      { args: [[1, 1, 2, 3, 3]], expect: [1, 2, 3] },
      { args: [[]], expect: [] },
      { args: [[4, 4, 4]], expect: [4] },
      { args: [[1, 2, 3]], expect: [1, 2, 3] },
      { args: [[-1, 0, 0, 0, 5, 5]], expect: [-1, 0, 5] },
    ],
  },
  {
    id: 'll-remove-elements',
    title: 'Remove All Nodes with a Value',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Amazon', 'TCS', 'Capgemini'],
    statement: 'A linked list is shown as an array of its values. Remove every node whose value equals `val` and return the remaining list as an array.',
    examples: [
      { input: 'head = [1, 2, 6, 3, 4, 5, 6], val = 6', output: '[1, 2, 3, 4, 5]' },
      { input: 'head = [7, 7, 7, 7], val = 7', output: '[]' },
    ],
    constraints: ['0 <= list length <= 10^4', '1 <= node value, val <= 50'],
    hints: ['Removing the head is a special case... unless you add a dummy node in front.', 'Look at cur.next and unlink it when it matches.'],
    approach: 'Build the list and put a dummy node in front of the head so that removing the first node needs no special handling. Walk with cur starting at the dummy. If cur.next holds val, unlink it with cur.next = cur.next.next and stay put, since the new next might also match. Otherwise advance cur. The result starts at dummy.next. Building a fresh list of kept values works too but allocates new nodes.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'remove_elements', js: 'removeElements' },
    py: {
      starter: 'def remove_elements(head, val):\n    # write your code here\n    pass\n',
      solution: `def remove_elements(head, val):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = cur = Node(0, build(head))
    while cur.next:
        if cur.next.val == val:
            cur.next = cur.next.next
        else:
            cur = cur.next
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function removeElements(head, val) {\n  // write your code here\n}\n',
      solution: `function removeElements(head, val) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let cur = dummy;
  while (cur.next) {
    if (cur.next.val === val) cur.next = cur.next.next;
    else cur = cur.next;
  }
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 6, 3, 4, 5, 6], 6], expect: [1, 2, 3, 4, 5] },
      { args: [[], 1], expect: [] },
      { args: [[7, 7, 7, 7], 7], expect: [] },
      { args: [[1, 2, 3], 4], expect: [1, 2, 3] },
      { args: [[2, 1, 2], 2], expect: [1] },
      { args: [[1, 2, 2, 1], 2], expect: [1, 1] },
    ],
  },
  {
    id: 'll-insert-sorted',
    title: 'Insert into a Sorted Linked List',
    diff: 'Easy',
    pattern: 'Linked List',
    companies: ['Microsoft', 'Infosys', 'HCL'],
    statement: 'A linked list sorted in ascending order is shown as an array. Insert a new node with value `x` so the list stays sorted, and return the list as an array. If equal values exist, insert the new node **after** them.',
    examples: [
      { input: 'head = [1, 3, 5], x = 4', output: '[1, 3, 4, 5]' },
      { input: 'head = [], x = 5', output: '[5]' },
    ],
    constraints: ['0 <= list length <= 10^4', '-10^4 <= node value, x <= 10^4'],
    hints: ['Find the last node whose value is <= x.', 'A dummy node in front handles insertion at the head.'],
    approach: 'Build the list and place a dummy node before the head. Move a pointer cur forward while cur.next exists and cur.next.val <= x; it stops at the last node that should come before the new one. Create the new node, point it to cur.next and set cur.next to it. Thanks to the dummy, inserting before the first node or into an empty list needs no special case. Rebuilding the whole list from a sorted array would use O(n) extra space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'insert_sorted', js: 'insertSorted' },
    py: {
      starter: 'def insert_sorted(head, x):\n    # write your code here\n    pass\n',
      solution: `def insert_sorted(head, x):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = cur = Node(0, build(head))
    while cur.next and cur.next.val <= x:
        cur = cur.next
    cur.next = Node(x, cur.next)
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function insertSorted(head, x) {\n  // write your code here\n}\n',
      solution: `function insertSorted(head, x) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let cur = dummy;
  while (cur.next && cur.next.val <= x) cur = cur.next;
  cur.next = { val: x, next: cur.next };
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 3, 5], 4], expect: [1, 3, 4, 5] },
      { args: [[], 5], expect: [5] },
      { args: [[2, 3], 1], expect: [1, 2, 3] },
      { args: [[1, 2], 9], expect: [1, 2, 9] },
      { args: [[1, 1, 2], 1], expect: [1, 1, 1, 2] },
      { args: [[-5, 0], -2], expect: [-5, -2, 0] },
    ],
  },
  {
    id: 'll-remove-nth-from-end',
    title: 'Remove Nth Node from the End',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'TCS Digital'],
    statement: 'A linked list is shown as an array of its values. Remove the `n`-th node counted from the end (n = 1 is the last node) and return the list as an array. Try to do it in one pass.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5], n = 2', output: '[1, 2, 3, 5]' },
      { input: 'head = [1], n = 1', output: '[]' },
    ],
    constraints: ['1 <= list length <= 30', '1 <= n <= list length'],
    hints: ['Move one pointer n steps ahead first.', 'Then move both pointers together; when the front one hits the end, the back one is just before the node to delete.'],
    approach: 'Build the list and add a dummy node in front, so deleting the head works like any other deletion. Start two pointers at the dummy and move the fast one n + 1 steps ahead. Then move both together until fast becomes null. The gap between them is n + 1 nodes, so slow now sits right before the node to remove; unlink it with slow.next = slow.next.next. Counting the length first and then walking again also works but takes two passes.',
    complexity: 'Time O(L), Space O(1)',
    fn: { py: 'remove_nth_from_end', js: 'removeNthFromEnd' },
    py: {
      starter: 'def remove_nth_from_end(head, n):\n    # write your code here\n    pass\n',
      solution: `def remove_nth_from_end(head, n):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = Node(0, build(head))
    slow = fast = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        slow, fast = slow.next, fast.next
    slow.next = slow.next.next
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function removeNthFromEnd(head, n) {\n  // write your code here\n}\n',
      solution: `function removeNthFromEnd(head, n) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let slow = dummy, fast = dummy;
  for (let i = 0; i <= n; i++) fast = fast.next;
  while (fast) { slow = slow.next; fast = fast.next; }
  slow.next = slow.next.next;
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expect: [1, 2, 3, 5] },
      { args: [[1], 1], expect: [] },
      { args: [[1, 2], 1], expect: [1] },
      { args: [[1, 2], 2], expect: [2] },
      { args: [[1, 2, 3], 3], expect: [2, 3] },
      { args: [[10, 20, 30, 40], 1], expect: [10, 20, 30] },
    ],
  },
  {
    id: 'll-odd-even-list',
    title: 'Odd Even Linked List',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    statement: 'A linked list is shown as an array of its values. Regroup it so that all nodes at odd **positions** (1st, 3rd, 5th, ...) come first, followed by all nodes at even positions, keeping the original relative order inside each group. Return the list as an array.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5]', output: '[1, 3, 5, 2, 4]' },
      { input: 'head = [2, 1, 3, 5, 6, 4, 7]', output: '[2, 3, 6, 7, 1, 5, 4]', explain: 'Positions, not values, decide the group.' },
    ],
    constraints: ['0 <= list length <= 10^4', 'Use O(1) extra space.'],
    hints: ['Build two chains at the same time: odd-position nodes and even-position nodes.', 'At the end, link the tail of the odd chain to the head of the even chain.'],
    approach: 'Build the list. Keep a pointer odd at the first node, even at the second, and remember evenHead. While even and even.next exist, link odd.next to even.next (the next odd-position node) and advance odd, then link even.next to odd.next and advance even. This splits the list into two chains in one pass without new nodes. Finally attach evenHead after the last odd node. Copying values into two arrays and rebuilding would use O(n) extra space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'odd_even_list', js: 'oddEvenList' },
    py: {
      starter: 'def odd_even_list(head):\n    # write your code here\n    pass\n',
      solution: `def odd_even_list(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    first = build(head)
    if not first:
        return []
    odd, even = first, first.next
    even_head = even
    while even and even.next:
        odd.next = even.next
        odd = odd.next
        even.next = odd.next
        even = even.next
    odd.next = even_head
    return to_list(first)
`,
    },
    js: {
      starter: 'function oddEvenList(head) {\n  // write your code here\n}\n',
      solution: `function oddEvenList(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const first = build(head);
  if (!first) return [];
  let odd = first, even = first.next;
  const evenHead = even;
  while (even && even.next) {
    odd.next = even.next;
    odd = odd.next;
    even.next = odd.next;
    even = even.next;
  }
  odd.next = evenHead;
  return toList(first);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5]], expect: [1, 3, 5, 2, 4] },
      { args: [[2, 1, 3, 5, 6, 4, 7]], expect: [2, 3, 6, 7, 1, 5, 4] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2]], expect: [1, 2] },
      { args: [[1, 2, 3, 4]], expect: [1, 3, 2, 4] },
    ],
  },
  {
    id: 'll-rotate-list',
    title: 'Rotate a List to the Right',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Infosys SP'],
    statement: 'A linked list is shown as an array of its values. Rotate the list to the right by `k` places (each rotation moves the last node to the front) and return it as an array. `k` may be larger than the list length.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5], k = 2', output: '[4, 5, 1, 2, 3]' },
      { input: 'head = [0, 1, 2], k = 4', output: '[2, 0, 1]', explain: 'Rotating 4 times equals rotating 4 % 3 = 1 time.' },
    ],
    constraints: ['0 <= list length <= 500', '0 <= k <= 2 * 10^9'],
    hints: ['Rotating by the length changes nothing, so use k % length.', 'Make the list a ring, then break it at the right place.'],
    approach: 'Build the list and find its length and tail in one walk. Reduce k to k % length; if it is 0 the list is unchanged. Connect the tail to the head to form a ring. The new tail is the node at position length - k - 1 (0-indexed) from the old head, and the new head is the node after it. Walk to the new tail, set the new head to its next, and cut the ring by setting new tail.next to null. Rotating one step at a time would cost O(n * k), which is hopeless for k up to 2 * 10^9.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'rotate_right', js: 'rotateRight' },
    py: {
      starter: 'def rotate_right(head, k):\n    # write your code here\n    pass\n',
      solution: `def rotate_right(head, k):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    first = build(head)
    if not first:
        return []
    length, tail = 1, first
    while tail.next:
        tail = tail.next
        length += 1
    k %= length
    if k == 0:
        return to_list(first)
    tail.next = first
    new_tail = first
    for _ in range(length - k - 1):
        new_tail = new_tail.next
    new_head = new_tail.next
    new_tail.next = None
    return to_list(new_head)
`,
    },
    js: {
      starter: 'function rotateRight(head, k) {\n  // write your code here\n}\n',
      solution: `function rotateRight(head, k) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const first = build(head);
  if (!first) return [];
  let length = 1, tail = first;
  while (tail.next) { tail = tail.next; length++; }
  k %= length;
  if (k === 0) return toList(first);
  tail.next = first;
  let newTail = first;
  for (let i = 0; i < length - k - 1; i++) newTail = newTail.next;
  const newHead = newTail.next;
  newTail.next = null;
  return toList(newHead);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expect: [4, 5, 1, 2, 3] },
      { args: [[0, 1, 2], 4], expect: [2, 0, 1] },
      { args: [[], 3], expect: [] },
      { args: [[1], 99], expect: [1] },
      { args: [[1, 2], 2], expect: [1, 2] },
      { args: [[1, 2, 3], 1], expect: [3, 1, 2] },
      { args: [[1, 2, 3], 2000000000], expect: [2, 3, 1] },
    ],
  },
  {
    id: 'll-add-two-numbers',
    title: 'Add Two Numbers as Lists',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Adobe'],
    statement: 'Two non-negative integers are stored as linked lists of digits in **reverse** order (the head is the ones digit) and shown as arrays `a` and `b`. Return their sum as a linked list in the same reverse-digit array form. The inputs have no leading zeros except the number 0 itself.',
    examples: [
      { input: 'a = [2, 4, 3], b = [5, 6, 4]', output: '[7, 0, 8]', explain: '342 + 465 = 807' },
      { input: 'a = [9, 9, 9, 9, 9, 9, 9], b = [9, 9, 9, 9]', output: '[8, 9, 9, 9, 0, 0, 0, 1]' },
    ],
    constraints: ['1 <= each length <= 100', '0 <= digit <= 9'],
    hints: ['Add digit by digit like on paper, keeping a carry.', 'Continue while either list has nodes or the carry is non-zero.'],
    approach: 'Build both lists and a dummy head for the result. Walk both lists at the same time; at each step add the two current digits (0 if a list has ended) and the carry. The new node gets total % 10 and the carry becomes total // 10. Keep going while either list has nodes or the carry is not zero, so a final carry creates one more node. Converting the lists to integers would overflow fixed-size integers for 100-digit numbers in many languages.',
    complexity: 'Time O(max(n, m)), Space O(max(n, m)) for the result',
    fn: { py: 'add_two_numbers', js: 'addTwoNumbers' },
    py: {
      starter: 'def add_two_numbers(a, b):\n    # write your code here\n    pass\n',
      solution: `def add_two_numbers(a, b):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    l1, l2 = build(a), build(b)
    dummy = tail = Node(0)
    carry = 0
    while l1 or l2 or carry:
        total = carry
        if l1:
            total += l1.val
            l1 = l1.next
        if l2:
            total += l2.val
            l2 = l2.next
        carry, digit = divmod(total, 10)
        tail.next = Node(digit)
        tail = tail.next
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function addTwoNumbers(a, b) {\n  // write your code here\n}\n',
      solution: `function addTwoNumbers(a, b) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  let l1 = build(a), l2 = build(b);
  const dummy = { val: 0, next: null };
  let tail = dummy, carry = 0;
  while (l1 || l2 || carry) {
    let total = carry;
    if (l1) { total += l1.val; l1 = l1.next; }
    if (l2) { total += l2.val; l2 = l2.next; }
    carry = Math.floor(total / 10);
    tail.next = { val: total % 10, next: null };
    tail = tail.next;
  }
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[2, 4, 3], [5, 6, 4]], expect: [7, 0, 8] },
      { args: [[0], [0]], expect: [0] },
      { args: [[9, 9, 9, 9, 9, 9, 9], [9, 9, 9, 9]], expect: [8, 9, 9, 9, 0, 0, 0, 1] },
      { args: [[1], [9, 9]], expect: [0, 0, 1] },
      { args: [[5], [5]], expect: [0, 1] },
      { args: [[1, 2], [3]], expect: [4, 2] },
    ],
  },
  {
    id: 'll-reorder-list',
    title: 'Reorder List',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Meta', 'Microsoft', 'TCS Digital'],
    statement: 'A linked list L0 -> L1 -> ... -> Ln is shown as an array of its values. Reorder the nodes (do not change values) into L0 -> Ln -> L1 -> Ln-1 -> L2 -> ... and return the result as an array.',
    examples: [
      { input: 'head = [1, 2, 3, 4]', output: '[1, 4, 2, 3]' },
      { input: 'head = [1, 2, 3, 4, 5]', output: '[1, 5, 2, 4, 3]' },
    ],
    constraints: ['0 <= list length <= 5 * 10^4', 'Use O(1) extra space for the relinking.'],
    hints: ['Split the list in the middle.', 'Reverse the second half, then weave the two halves together.'],
    approach: 'Build the list and find the middle with slow and fast pointers. Cut the list after the middle and reverse the second half in place. Now weave: take one node from the first half, then one from the reversed second half, alternating until the second half runs out. The first half is equal to or one node longer than the second, so its last node ends the list. All three steps are linear and use only pointers. Storing nodes in an array and using two indices also works but costs O(n) extra space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'reorder_list', js: 'reorderList' },
    py: {
      starter: 'def reorder_list(head):\n    # write your code here\n    pass\n',
      solution: `def reorder_list(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    first = build(head)
    if not first:
        return []
    slow = fast = first
    while fast.next and fast.next.next:
        slow, fast = slow.next, fast.next.next
    second, slow.next = slow.next, None
    prev = None
    while second:
        nxt = second.next
        second.next = prev
        prev, second = second, nxt
    a, b = first, prev
    while b:
        a_next, b_next = a.next, b.next
        a.next, b.next = b, a_next
        a, b = a_next, b_next
    return to_list(first)
`,
    },
    js: {
      starter: 'function reorderList(head) {\n  // write your code here\n}\n',
      solution: `function reorderList(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const first = build(head);
  if (!first) return [];
  let slow = first, fast = first;
  while (fast.next && fast.next.next) { slow = slow.next; fast = fast.next.next; }
  let second = slow.next;
  slow.next = null;
  let prev = null;
  while (second) {
    const next = second.next;
    second.next = prev;
    prev = second;
    second = next;
  }
  let a = first, b = prev;
  while (b) {
    const aNext = a.next, bNext = b.next;
    a.next = b;
    b.next = aNext;
    a = aNext;
    b = bNext;
  }
  return toList(first);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4]], expect: [1, 4, 2, 3] },
      { args: [[1, 2, 3, 4, 5]], expect: [1, 5, 2, 4, 3] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2]], expect: [1, 2] },
      { args: [[]], expect: [] },
      { args: [[1, 2, 3]], expect: [1, 3, 2] },
      { args: [[10, 20, 30, 40, 50, 60]], expect: [10, 60, 20, 50, 30, 40] },
    ],
  },
  {
    id: 'll-partition-list',
    title: 'Partition List Around a Value',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Adobe'],
    statement: 'A linked list is shown as an array of its values. Rearrange it so that all nodes with values **less than** `x` come before all nodes with values greater than or equal to `x`. Keep the original relative order within each of the two groups. Return the list as an array.',
    examples: [
      { input: 'head = [1, 4, 3, 2, 5, 2], x = 3', output: '[1, 2, 2, 4, 3, 5]' },
      { input: 'head = [2, 1], x = 2', output: '[1, 2]' },
    ],
    constraints: ['0 <= list length <= 200', '-100 <= node value <= 100', '-200 <= x <= 200'],
    hints: ['Build two separate chains while walking the list once.', 'Use two dummy heads: one for "less than x" and one for the rest; join them at the end.'],
    approach: 'Build the list and create two dummy heads, before and after, each with its own tail pointer. Walk the original list and append each node to the before chain if its value is less than x, otherwise to the after chain. Appending in visiting order keeps the relative order stable. At the end, set the after tail\'s next to null (to cut any old link), and connect the before tail to the first real node of the after chain. Sorting would not keep the original order and costs O(n log n).',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'partition_list', js: 'partitionList' },
    py: {
      starter: 'def partition_list(head, x):\n    # write your code here\n    pass\n',
      solution: `def partition_list(head, x):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    before = b_tail = Node(0)
    after = a_tail = Node(0)
    cur = build(head)
    while cur:
        if cur.val < x:
            b_tail.next = cur
            b_tail = cur
        else:
            a_tail.next = cur
            a_tail = cur
        cur = cur.next
    a_tail.next = None
    b_tail.next = after.next
    return to_list(before.next)
`,
    },
    js: {
      starter: 'function partitionList(head, x) {\n  // write your code here\n}\n',
      solution: `function partitionList(head, x) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const before = { val: 0, next: null }, after = { val: 0, next: null };
  let bTail = before, aTail = after;
  for (let cur = build(head); cur; cur = cur.next) {
    if (cur.val < x) { bTail.next = cur; bTail = cur; }
    else { aTail.next = cur; aTail = cur; }
  }
  aTail.next = null;
  bTail.next = after.next;
  return toList(before.next);
}
`,
    },
    tests: [
      { args: [[1, 4, 3, 2, 5, 2], 3], expect: [1, 2, 2, 4, 3, 5] },
      { args: [[2, 1], 2], expect: [1, 2] },
      { args: [[], 0], expect: [] },
      { args: [[3, 1, 2], 4], expect: [3, 1, 2] },
      { args: [[5, 6, 7], 1], expect: [5, 6, 7] },
      { args: [[1, 4, 3, 0, 2, 5, 2], 3], expect: [1, 0, 2, 2, 4, 3, 5] },
    ],
  },
  {
    id: 'll-swap-pairs',
    title: 'Swap Nodes in Pairs',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Infosys SP'],
    statement: 'A linked list is shown as an array of its values. Swap every two adjacent nodes (1st with 2nd, 3rd with 4th, ...) by changing links, not values, and return the list as an array. A final unpaired node stays where it is.',
    examples: [
      { input: 'head = [1, 2, 3, 4]', output: '[2, 1, 4, 3]' },
      { input: 'head = [1, 2, 3]', output: '[2, 1, 3]' },
    ],
    constraints: ['0 <= list length <= 100', '0 <= node value <= 100'],
    hints: ['Use a dummy node so the first swap is not a special case.', 'For each pair (a, b) after prev: prev.next = b, a.next = b.next, b.next = a.'],
    approach: 'Build the list and put a dummy node before the head, with prev pointing at it. While there are at least two nodes after prev, call them a and b. Relink them in three steps: prev.next = b, a.next = b.next, b.next = a. Now a is the second node of the swapped pair, so move prev to a and repeat. A leftover single node is untouched because the loop needs two nodes. Swapping values instead of nodes is simpler but is not allowed here.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'swap_pairs', js: 'swapPairs' },
    py: {
      starter: 'def swap_pairs(head):\n    # write your code here\n    pass\n',
      solution: `def swap_pairs(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = prev = Node(0, build(head))
    while prev.next and prev.next.next:
        a, b = prev.next, prev.next.next
        prev.next = b
        a.next = b.next
        b.next = a
        prev = a
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function swapPairs(head) {\n  // write your code here\n}\n',
      solution: `function swapPairs(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let prev = dummy;
  while (prev.next && prev.next.next) {
    const a = prev.next, b = prev.next.next;
    prev.next = b;
    a.next = b.next;
    b.next = a;
    prev = a;
  }
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4]], expect: [2, 1, 4, 3] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[1, 2, 3]], expect: [2, 1, 3] },
      { args: [[5, 6]], expect: [6, 5] },
      { args: [[1, 2, 3, 4, 5, 6]], expect: [2, 1, 4, 3, 6, 5] },
    ],
  },
  {
    id: 'll-remove-all-duplicates',
    title: 'Remove All Duplicated Values from a Sorted List',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart'],
    statement: 'A sorted linked list is shown as an array of its values. Delete **every** node whose value appears more than once, keeping only values that were distinct in the original list. Return the list as an array.',
    examples: [
      { input: 'head = [1, 2, 3, 3, 4, 4, 5]', output: '[1, 2, 5]' },
      { input: 'head = [1, 1, 1, 2, 3]', output: '[2, 3]' },
    ],
    constraints: ['0 <= list length <= 300', '-100 <= node value <= 100', 'The list is sorted.'],
    hints: ['The head itself may be removed, so use a dummy node.', 'When you see a run of equal values, skip the whole run.'],
    approach: 'Build the list and add a dummy node before it; prev starts at the dummy and always points to the last node we are keeping. Look at cur = prev.next. If cur.next has the same value, walk forward past every node with that value and link prev.next to the first node after the run, removing all copies. Otherwise cur is unique, so move prev to cur. Repeat until the end. Counting values with a hash map would also work but needs O(n) space and ignores the sorted order.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'delete_all_duplicates', js: 'deleteAllDuplicates' },
    py: {
      starter: 'def delete_all_duplicates(head):\n    # write your code here\n    pass\n',
      solution: `def delete_all_duplicates(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = prev = Node(0, build(head))
    while prev.next:
        cur = prev.next
        if cur.next and cur.next.val == cur.val:
            val = cur.val
            while cur and cur.val == val:
                cur = cur.next
            prev.next = cur
        else:
            prev = cur
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function deleteAllDuplicates(head) {\n  // write your code here\n}\n',
      solution: `function deleteAllDuplicates(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let prev = dummy;
  while (prev.next) {
    let cur = prev.next;
    if (cur.next && cur.next.val === cur.val) {
      const val = cur.val;
      while (cur && cur.val === val) cur = cur.next;
      prev.next = cur;
    } else {
      prev = cur;
    }
  }
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 3, 4, 4, 5]], expect: [1, 2, 5] },
      { args: [[1, 1, 1, 2, 3]], expect: [2, 3] },
      { args: [[]], expect: [] },
      { args: [[1, 1]], expect: [] },
      { args: [[1, 2, 2]], expect: [1] },
      { args: [[1, 2, 3]], expect: [1, 2, 3] },
    ],
  },
  {
    id: 'll-reverse-between',
    title: 'Reverse a Sublist (Positions left to right)',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Meta'],
    statement: 'A linked list is shown as an array of its values. Reverse the nodes from position `left` to position `right` (1-indexed, inclusive) and return the whole list as an array. Do it in one pass.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5], left = 2, right = 4', output: '[1, 4, 3, 2, 5]' },
      { input: 'head = [3, 5], left = 1, right = 2', output: '[5, 3]' },
    ],
    constraints: ['1 <= list length <= 500', '1 <= left <= right <= list length'],
    hints: ['Find the node just before position left (use a dummy in case left = 1).', 'Repeatedly move the node after the sublist start to the front of the sublist (head insertion).'],
    approach: 'Build the list and add a dummy node. Walk left - 1 steps to reach prev, the node just before the sublist; start is prev.next. Now repeat right - left times: take the node right after start, unlink it, and insert it directly after prev. Each move puts the next node at the front of the reversed part, so after all moves the segment is reversed while start ends up at its tail, still linked to the rest of the list. This is a single pass. Copying the segment\'s values out, reversing and writing them back changes values instead of links.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'reverse_between', js: 'reverseBetween' },
    py: {
      starter: 'def reverse_between(head, left, right):\n    # write your code here\n    pass\n',
      solution: `def reverse_between(head, left, right):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = prev = Node(0, build(head))
    for _ in range(left - 1):
        prev = prev.next
    start = prev.next
    for _ in range(right - left):
        moved = start.next
        start.next = moved.next
        moved.next = prev.next
        prev.next = moved
    return to_list(dummy.next)
`,
    },
    js: {
      starter: 'function reverseBetween(head, left, right) {\n  // write your code here\n}\n',
      solution: `function reverseBetween(head, left, right) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let prev = dummy;
  for (let i = 1; i < left; i++) prev = prev.next;
  const start = prev.next;
  for (let i = 0; i < right - left; i++) {
    const moved = start.next;
    start.next = moved.next;
    moved.next = prev.next;
    prev.next = moved;
  }
  return toList(dummy.next);
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5], 2, 4], expect: [1, 4, 3, 2, 5] },
      { args: [[5], 1, 1], expect: [5] },
      { args: [[3, 5], 1, 2], expect: [5, 3] },
      { args: [[1, 2, 3], 1, 3], expect: [3, 2, 1] },
      { args: [[1, 2, 3, 4], 3, 4], expect: [1, 2, 4, 3] },
      { args: [[1, 2, 3, 4, 5], 1, 1], expect: [1, 2, 3, 4, 5] },
    ],
  },
  {
    id: 'll-sort-list',
    title: 'Sort a Linked List (Merge Sort)',
    diff: 'Medium',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Flipkart', 'Goldman Sachs'],
    statement: 'A linked list is shown as an array of its values. Sort the list in ascending order by relinking nodes, in O(n log n) time, and return it as an array.',
    examples: [
      { input: 'head = [4, 2, 1, 3]', output: '[1, 2, 3, 4]' },
      { input: 'head = [-1, 5, 3, 4, 0]', output: '[-1, 0, 3, 4, 5]' },
    ],
    constraints: ['0 <= list length <= 5 * 10^4', '-10^5 <= node value <= 10^5'],
    hints: ['Merge sort suits linked lists: splitting and merging need no random access.', 'Split at the middle with slow/fast pointers, sort each half, merge the two sorted halves.'],
    approach: 'Build the list and apply merge sort. If the list has zero or one node it is already sorted. Otherwise find the middle with slow and fast pointers, cut the list into two halves, sort each half recursively, and merge the two sorted halves with a dummy node, always attaching the smaller head. The recursion depth is only O(log n) because each level halves the list. Quick sort is less suitable because picking good pivots needs random access, and insertion sort is O(n^2).',
    complexity: 'Time O(n log n), Space O(log n) for recursion',
    fn: { py: 'sort_list', js: 'sortList' },
    py: {
      starter: 'def sort_list(head):\n    # write your code here\n    pass\n',
      solution: `def sort_list(head):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    def merge(a, b):
        dummy = tail = Node(0)
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next

    def msort(node):
        if not node or not node.next:
            return node
        slow, fast = node, node.next
        while fast and fast.next:
            slow, fast = slow.next, fast.next.next
        second, slow.next = slow.next, None
        return merge(msort(node), msort(second))

    return to_list(msort(build(head)))
`,
    },
    js: {
      starter: 'function sortList(head) {\n  // write your code here\n}\n',
      solution: `function sortList(head) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const merge = (a, b) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; }
      else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
  };
  const msort = (node) => {
    if (!node || !node.next) return node;
    let slow = node, fast = node.next;
    while (fast && fast.next) { slow = slow.next; fast = fast.next.next; }
    const second = slow.next;
    slow.next = null;
    return merge(msort(node), msort(second));
  };
  return toList(msort(build(head)));
}
`,
    },
    tests: [
      { args: [[4, 2, 1, 3]], expect: [1, 2, 3, 4] },
      { args: [[-1, 5, 3, 4, 0]], expect: [-1, 0, 3, 4, 5] },
      { args: [[]], expect: [] },
      { args: [[1]], expect: [1] },
      { args: [[2, 2, 1, 1]], expect: [1, 1, 2, 2] },
      { args: [[9, 8, 7, 6, 5, 4]], expect: [4, 5, 6, 7, 8, 9] },
    ],
  },
  {
    id: 'll-reverse-k-group',
    title: 'Reverse Nodes in k-Groups',
    diff: 'Hard',
    pattern: 'Linked List',
    companies: ['Amazon', 'Microsoft', 'Google', 'Flipkart'],
    statement: 'A linked list is shown as an array of its values. Reverse the nodes in consecutive groups of `k`. If the number of nodes left at the end is less than `k`, leave them as they are. Change links, not values, and return the list as an array.',
    examples: [
      { input: 'head = [1, 2, 3, 4, 5], k = 2', output: '[2, 1, 4, 3, 5]' },
      { input: 'head = [1, 2, 3, 4, 5], k = 3', output: '[3, 2, 1, 4, 5]' },
    ],
    constraints: ['0 <= list length <= 5000', '1 <= k <= 5000', 'Use O(1) extra space.'],
    hints: ['Before reversing a group, check that k nodes are actually available.', 'Reverse one group in place, then connect the previous group\'s tail to its new head.'],
    approach: 'Build the list and use a dummy node; groupPrev points to the node just before the current group. First walk k steps from groupPrev to find the group\'s last node; if the list ends early, stop, leaving the remainder unchanged. Remember the node after the group, then reverse the k nodes in place, starting with prev set to that next node so the reversed group links to the rest automatically. Connect groupPrev.next to the new group head (the old last node), and move groupPrev to the old first node, which is now the group\'s tail. Each node is visited a constant number of times. Copying groups into arrays would use O(k) extra space.',
    complexity: 'Time O(n), Space O(1)',
    fn: { py: 'reverse_k_group', js: 'reverseKGroup' },
    py: {
      starter: 'def reverse_k_group(head, k):\n    # write your code here\n    pass\n',
      solution: `def reverse_k_group(head, k):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    dummy = group_prev = Node(0, build(head))
    while True:
        kth = group_prev
        for _ in range(k):
            kth = kth.next
            if not kth:
                return to_list(dummy.next)
        group_next = kth.next
        prev, cur = group_next, group_prev.next
        while cur is not group_next:
            nxt = cur.next
            cur.next = prev
            prev, cur = cur, nxt
        old_first = group_prev.next
        group_prev.next = kth
        group_prev = old_first
`,
    },
    js: {
      starter: 'function reverseKGroup(head, k) {\n  // write your code here\n}\n',
      solution: `function reverseKGroup(head, k) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const dummy = { val: 0, next: build(head) };
  let groupPrev = dummy;
  for (;;) {
    let kth = groupPrev;
    for (let i = 0; i < k; i++) {
      kth = kth.next;
      if (!kth) return toList(dummy.next);
    }
    const groupNext = kth.next;
    let prev = groupNext, cur = groupPrev.next;
    while (cur !== groupNext) {
      const next = cur.next;
      cur.next = prev;
      prev = cur;
      cur = next;
    }
    const oldFirst = groupPrev.next;
    groupPrev.next = kth;
    groupPrev = oldFirst;
  }
}
`,
    },
    tests: [
      { args: [[1, 2, 3, 4, 5], 2], expect: [2, 1, 4, 3, 5] },
      { args: [[1, 2, 3, 4, 5], 3], expect: [3, 2, 1, 4, 5] },
      { args: [[1], 1], expect: [1] },
      { args: [[1, 2], 3], expect: [1, 2] },
      { args: [[1, 2, 3, 4, 5, 6], 3], expect: [3, 2, 1, 6, 5, 4] },
      { args: [[1, 2, 3, 4], 4], expect: [4, 3, 2, 1] },
      { args: [[], 2], expect: [] },
    ],
  },
  {
    id: 'll-merge-k-lists',
    title: 'Merge K Sorted Linked Lists',
    diff: 'Hard',
    pattern: 'Linked List',
    companies: ['Amazon', 'Google', 'Microsoft', 'Uber'],
    statement: 'You are given `lists`, where each element is a sorted linked list shown as an array (some may be empty). Merge all of them into one sorted linked list by relinking nodes and return it as an array.',
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1, 1, 2, 3, 4, 4, 5, 6]' },
      { input: 'lists = [[1,2,3],[],[0,10]]', output: '[0, 1, 2, 3, 10]' },
    ],
    constraints: ['0 <= k <= 10^4', '0 <= total nodes <= 10^4', 'Each list is sorted ascending.'],
    hints: ['Merging lists one after another into a growing result is O(N * k).', 'Merge them in pairs, like the merge step of merge sort: k lists become k/2, then k/4, ...'],
    approach: 'Build a node list for every array. Then use divide and conquer: in each round, merge list 0 with list 1, list 2 with list 3, and so on, using the classic two-list merge with a dummy head. Every round halves the number of lists, so there are about log k rounds, and each round touches every node once. When one list remains, convert it to an array (or return [] if there were no lists). A min-heap of list heads gives the same O(N log k) bound; merging lists one at a time into the result costs O(N * k).',
    complexity: 'Time O(N log k), Space O(1) extra besides the built nodes',
    fn: { py: 'merge_k_lists', js: 'mergeKLists' },
    py: {
      starter: 'def merge_k_lists(lists):\n    # write your code here\n    pass\n',
      solution: `def merge_k_lists(lists):
    class Node:
        def __init__(self, val, nxt=None):
            self.val, self.next = val, nxt

    def build(values):
        dummy = tail = Node(0)
        for v in values:
            tail.next = Node(v)
            tail = tail.next
        return dummy.next

    def to_list(head):
        out = []
        while head:
            out.append(head.val)
            head = head.next
        return out

    def merge(a, b):
        dummy = tail = Node(0)
        while a and b:
            if a.val <= b.val:
                tail.next, a = a, a.next
            else:
                tail.next, b = b, b.next
            tail = tail.next
        tail.next = a or b
        return dummy.next

    heads = [build(arr) for arr in lists]
    if not heads:
        return []
    while len(heads) > 1:
        merged = []
        for i in range(0, len(heads), 2):
            merged.append(merge(heads[i], heads[i + 1]) if i + 1 < len(heads) else heads[i])
        heads = merged
    return to_list(heads[0])
`,
    },
    js: {
      starter: 'function mergeKLists(lists) {\n  // write your code here\n}\n',
      solution: `function mergeKLists(lists) {
  const build = (values) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    for (const v of values) { tail.next = { val: v, next: null }; tail = tail.next; }
    return dummy.next;
  };
  const toList = (head) => {
    const out = [];
    for (let n = head; n; n = n.next) out.push(n.val);
    return out;
  };
  const merge = (a, b) => {
    const dummy = { val: 0, next: null };
    let tail = dummy;
    while (a && b) {
      if (a.val <= b.val) { tail.next = a; a = a.next; }
      else { tail.next = b; b = b.next; }
      tail = tail.next;
    }
    tail.next = a || b;
    return dummy.next;
  };
  let heads = lists.map(build);
  if (!heads.length) return [];
  while (heads.length > 1) {
    const merged = [];
    for (let i = 0; i < heads.length; i += 2) {
      merged.push(i + 1 < heads.length ? merge(heads[i], heads[i + 1]) : heads[i]);
    }
    heads = merged;
  }
  return toList(heads[0]);
}
`,
    },
    tests: [
      { args: [[[1, 4, 5], [1, 3, 4], [2, 6]]], expect: [1, 1, 2, 3, 4, 4, 5, 6] },
      { args: [[]], expect: [] },
      { args: [[[]]], expect: [] },
      { args: [[[2], [1]]], expect: [1, 2] },
      { args: [[[1, 2, 3], [], [0, 10]]], expect: [0, 1, 2, 3, 10] },
      { args: [[[-1, -1], [-2]]], expect: [-2, -1, -1] },
      { args: [[[5], [4], [3], [2], [1]]], expect: [1, 2, 3, 4, 5] },
    ],
  },
];
