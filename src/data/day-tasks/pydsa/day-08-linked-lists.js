const NODE = `class ListNode:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

def build(values):
    head = None
    for v in reversed(values):
        head = ListNode(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out
`;

export default {
  lesson: 'day-08-linked-lists',
  minutes: 40,
  intro: 'Work with singly linked lists: traverse, reverse, find the middle, detect a cycle with fast/slow pointers and merge sorted lists with a dummy node. Helpers `ListNode`, `build(list)` and `to_list(head)` are provided in each task.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Compared with a Python list (dynamic array), what is a singly linked list GOOD at?',
      options: ['Accessing the k-th element in O(1)', 'Inserting or deleting at the head (or after a known node) in O(1)', 'Binary search', 'Using less memory per element'],
      answer: 1,
      explain: 'Linked lists change a couple of pointers to insert or delete, with no shifting. But reaching the k-th node needs a walk (O(n)), so binary search is impractical, and each node also stores a pointer, using MORE memory.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Reverse a linked list** iteratively. Write `reverse(head)` that returns the new head. Use three pointers (`prev`, `curr`, `nxt`), O(1) extra space.',
      example: { title: 'pointer dance', code: 'nxt = curr.next     # save the rest\ncurr.next = prev    # reverse this link\nprev = curr         # move both forward\ncurr = nxt' },
      starter: NODE + '\ndef reverse(head):\n    # TODO\n    return head\n',
      solution: NODE + '\ndef reverse(head):\n    prev, curr = None, head\n    while curr:\n        nxt = curr.next\n        curr.next = prev\n        prev = curr\n        curr = nxt\n    return prev\n',
      tests: [
        { call: 'to_list(reverse(build([1, 2, 3, 4, 5])))', expect: [5, 4, 3, 2, 1] },
        { call: 'to_list(reverse(build([7])))', expect: [7] },
        { call: 'to_list(reverse(build([])))', expect: [] },
        { call: 'to_list(reverse(build([1, 2])))', expect: [2, 1] },
      ],
      explain: 'Save `curr.next` BEFORE changing it, otherwise you lose the rest of the list. At the end `curr` is None and `prev` is the new head. The empty list (head is None) works without special code.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 5,
      q: '**Middle of the list.** Write `middle(head)` that returns the VALUE of the middle node using slow/fast pointers in one pass. For an even length return the SECOND middle (for [1,2,3,4] → 3). Return None for an empty list.',
      example: { title: 'slow and fast', code: 'slow = fast = head\nwhile fast and fast.next:\n    slow = slow.next\n    fast = fast.next.next' },
      starter: NODE + '\ndef middle(head):\n    # TODO\n    return None\n',
      solution: NODE + '\ndef middle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n    return slow.val if slow else None\n',
      tests: [
        { call: 'middle(build([1, 2, 3, 4, 5]))', expect: 3 },
        { call: 'middle(build([1, 2, 3, 4]))', expect: 3 },
        { call: 'middle(build([9]))', expect: 9 },
        { call: 'middle(build([]))', expect: null },
      ],
      explain: 'Fast moves two steps for every one step of slow, so when fast reaches the end, slow is halfway. The loop condition `fast and fast.next` prevents `None.next` errors for both odd and even lengths.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Detect a cycle** with Floyd\'s algorithm. Write `has_cycle(head)` returning True if following `next` pointers loops forever. O(1) extra space: no set of visited nodes. The helper `make_cycle(values, pos)` (provided) links the last node back to index `pos`.',
      example: { title: 'tortoise and hare', code: '# if there is a loop, the fast pointer eventually\n# laps the slow one and they meet\nif slow is fast:\n    return True' },
      starter: NODE + '\ndef make_cycle(values, pos):\n    head = build(values)\n    if pos < 0 or head is None:\n        return head\n    nodes = []\n    node = head\n    while node:\n        nodes.append(node)\n        node = node.next\n    nodes[-1].next = nodes[pos]\n    return head\n\ndef has_cycle(head):\n    # TODO\n    return False\n',
      solution: NODE + '\ndef make_cycle(values, pos):\n    head = build(values)\n    if pos < 0 or head is None:\n        return head\n    nodes = []\n    node = head\n    while node:\n        nodes.append(node)\n        node = node.next\n    nodes[-1].next = nodes[pos]\n    return head\n\ndef has_cycle(head):\n    slow = fast = head\n    while fast and fast.next:\n        slow = slow.next\n        fast = fast.next.next\n        if slow is fast:\n            return True\n    return False\n',
      tests: [
        { call: 'has_cycle(make_cycle([3, 2, 0, -4], 1))', expect: true },
        { call: 'has_cycle(make_cycle([1, 2], 0))', expect: true },
        { call: 'has_cycle(make_cycle([1], 0))', expect: true, msg: 'A node pointing to itself' },
        { call: 'has_cycle(make_cycle([1, 2, 3], -1))', expect: false },
        { call: 'has_cycle(None)', expect: false },
      ],
      explain: 'Compare nodes with `is` (same object), not values, because different nodes can hold equal values. Inside a loop the gap between fast and slow shrinks by one each step, so they must meet. Without a loop, fast reaches None.',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 7,
      q: '**Merge two sorted lists.** Write `merge(a, b)` that merges two sorted linked lists into one sorted list by re-linking the existing nodes. Use a **dummy** head node to avoid special cases.',
      example: { title: 'dummy node', code: 'dummy = tail = ListNode(0)\n# ... tail.next = chosen node; tail = tail.next\nreturn dummy.next' },
      starter: NODE + '\ndef merge(a, b):\n    # TODO\n    return a\n',
      solution: NODE + '\ndef merge(a, b):\n    dummy = tail = ListNode(0)\n    while a and b:\n        if a.val <= b.val:\n            tail.next, a = a, a.next\n        else:\n            tail.next, b = b, b.next\n        tail = tail.next\n    tail.next = a or b\n    return dummy.next\n',
      tests: [
        { call: 'to_list(merge(build([1, 2, 4]), build([1, 3, 4])))', expect: [1, 1, 2, 3, 4, 4] },
        { call: 'to_list(merge(build([]), build([0])))', expect: [0] },
        { call: 'to_list(merge(build([]), build([])))', expect: [] },
        { call: 'to_list(merge(build([5, 6, 7]), build([1, 2])))', expect: [1, 2, 5, 6, 7] },
      ],
      explain: 'The dummy node means the first real node is attached the same way as every other node, so there is no "if head is None" branch. When one list runs out, attach the rest of the other in one step (`tail.next = a or b`).',
    },
    {
      type: 'code',
      lang: 'python',
      mins: 6,
      q: '**Remove the n-th node from the end** in one pass. Write `remove_nth_from_end(head, n)` and return the head (n is always valid). Move a `fast` pointer n steps ahead first, then move both together; start from a dummy node so removing the head works.',
      example: { title: 'a gap of n nodes', code: 'for _ in range(n):\n    fast = fast.next\n# now fast and slow are n nodes apart' },
      starter: NODE + '\ndef remove_nth_from_end(head, n):\n    # TODO\n    return head\n',
      solution: NODE + '\ndef remove_nth_from_end(head, n):\n    dummy = ListNode(0, head)\n    slow = fast = dummy\n    for _ in range(n):\n        fast = fast.next\n    while fast.next:\n        slow = slow.next\n        fast = fast.next\n    slow.next = slow.next.next\n    return dummy.next\n',
      tests: [
        { call: 'to_list(remove_nth_from_end(build([1, 2, 3, 4, 5]), 2))', expect: [1, 2, 3, 5] },
        { call: 'to_list(remove_nth_from_end(build([1]), 1))', expect: [] },
        { call: 'to_list(remove_nth_from_end(build([1, 2]), 2))', expect: [2], msg: 'Removing the head' },
        { call: 'to_list(remove_nth_from_end(build([1, 2]), 1))', expect: [1] },
      ],
      explain: 'When `fast` reaches the last node, `slow` stands just BEFORE the node to delete, so `slow.next = slow.next.next` unlinks it. The dummy node lets the same code remove the head.',
    },
  ],
};
