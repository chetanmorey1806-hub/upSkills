export default {
  id: "day-08-linked-lists",
  title: "Linked Lists: Singly, Doubly, Reverse, Cycle Detection and Merge",
  module: "Module 2: Linear Data Structures",
  day: 8,
  level: "Intermediate",
  duration: "3.5 hours",
  summary: "Build singly and doubly linked lists from scratch with Python classes, compare them with arrays, and master the pointer techniques interviewers test most: reversing a list, fast and slow pointers for middle and cycle detection, dummy nodes, and merging sorted lists.",
  objectives: [
    "Create Node and LinkedList classes and perform insert, delete, search and traversal",
    "Compare linked lists with arrays (Python lists) in terms of time and memory",
    "Reverse a linked list iteratively and recursively",
    "Use fast and slow pointers to find the middle and detect cycles (Floyd's algorithm)",
    "Merge two sorted lists using a dummy node, and build a doubly linked list",
  ],
  theory: [
    {
      heading: "What is a Linked List?",
      content: `A linked list is a chain of **nodes**. Each node stores a value and a reference (pointer) to the next node. The list keeps a reference to the first node, called the **head**. The last node points to None.

Unlike an array, nodes are not stored next to each other in memory, so you cannot jump to the i-th element directly. You must walk from the head. In return, inserting or deleting a node (once you have a reference to its neighbour) only changes a couple of pointers: O(1), no shifting.`,
      syntax: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

# 1 -> 2 -> 3 -> None
head = Node(1, Node(2, Node(3)))
`,
    },
    {
      heading: "Linked List vs Array (Python list)",
      content: "Choose based on which operations you need most.",
      points: [
        "Access by index: array O(1), linked list O(n)",
        "Insert/delete at the front: array O(n), linked list O(1)",
        "Insert/delete in the middle (given the previous node): linked list O(1); array O(n)",
        "Search for a value: both O(n) (unless the array is sorted: O(log n) binary search)",
        "Memory: linked list uses extra memory per node for pointers; arrays are cache-friendly",
      ],
      tip: "In real Python code you rarely build linked lists, but they are a top interview topic because they test pointer manipulation and edge-case handling.",
    },
    {
      heading: "Singly vs Doubly vs Circular",
      content: `**Singly linked list:** each node has next only. Traversal is one-way.

**Doubly linked list:** each node has prev and next. You can traverse both ways and delete a node in O(1) when you have a reference to it. It uses more memory. LRU caches and browser history use doubly linked lists; collections.OrderedDict is built on one internally.

**Circular linked list:** the last node points back to the head. Useful for round-robin scheduling.`,
    },
    {
      heading: "The Dummy (Sentinel) Node Trick",
      content: "Many linked list operations need special handling when the head itself changes (deleting the first node, merging, inserting at the front). A **dummy node** placed before the head removes these special cases: you always have a 'previous' node. At the end, return dummy.next as the new head.",
      syntax: `dummy = Node(0, head)
prev = dummy
# ... manipulate prev.next ...
return dummy.next
`,
    },
    {
      heading: "Reversing a Linked List",
      content: `Reversal is the single most asked linked list question. Walk through the list with three pointers: prev (starts None), curr (starts at head) and nxt (saves curr.next before we overwrite it). At each step, point curr.next to prev, then move prev and curr one step forward. When curr becomes None, prev is the new head.

Iterative: O(n) time, O(1) space. Recursive: O(n) time, O(n) stack space.`,
      syntax: `prev, curr = None, head
while curr:
    nxt = curr.next     # 1. save next
    curr.next = prev    # 2. reverse the link
    prev = curr         # 3. move prev
    curr = nxt          # 4. move curr
return prev
`,
    },
    {
      heading: "Fast and Slow Pointers (Floyd's Algorithm)",
      content: `Move slow by 1 step and fast by 2 steps.

**Middle of the list:** when fast reaches the end, slow is at the middle.

**Cycle detection:** if there is a cycle, fast eventually laps slow and they meet inside the cycle. If fast reaches None, there is no cycle. O(n) time and O(1) space, much better than storing visited nodes in a set (O(n) space).

**Cycle start:** after they meet, move one pointer back to head and advance both one step at a time; they meet at the start of the cycle.`,
      tip: "Always check `while fast and fast.next:` before moving fast two steps, to avoid AttributeError on None.",
    },
  ],
  examples: [
    {
      title: "Singly Linked List Class",
      scenario: "Build a linked list with insert at head/tail, delete by value, search and printing.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, val):          # O(1)
        self.head = Node(val, self.head)
        self.size += 1

    def push_back(self, val):           # O(n) without a tail pointer
        node = Node(val)
        if not self.head:
            self.head = node
        else:
            curr = self.head
            while curr.next:
                curr = curr.next
            curr.next = node
        self.size += 1

    def delete(self, val):              # O(n)
        dummy = Node(0, self.head)
        prev = dummy
        while prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
                self.size -= 1
                break
            prev = prev.next
        self.head = dummy.next

    def search(self, val):              # O(n)
        curr, index = self.head, 0
        while curr:
            if curr.val == val:
                return index
            curr, index = curr.next, index + 1
        return -1

    def __str__(self):
        parts, curr = [], self.head
        while curr:
            parts.append(str(curr.val))
            curr = curr.next
        return " -> ".join(parts + ["None"])

ll = LinkedList()
for v in [20, 30, 40]:
    ll.push_back(v)
ll.push_front(10)
print(ll, "| size:", ll.size)
print("index of 30:", ll.search(30))
ll.delete(10)
ll.delete(30)
print(ll, "| size:", ll.size)
`,
      python: {
        files: {
          "main.py": `class Node:
    def __init__(self, val, next=None):
        self.val = val
        self.next = next

class LinkedList:
    def __init__(self):
        self.head = None
        self.size = 0

    def push_front(self, val):          # O(1)
        self.head = Node(val, self.head)
        self.size += 1

    def push_back(self, val):           # O(n) without a tail pointer
        node = Node(val)
        if not self.head:
            self.head = node
        else:
            curr = self.head
            while curr.next:
                curr = curr.next
            curr.next = node
        self.size += 1

    def delete(self, val):              # O(n)
        dummy = Node(0, self.head)
        prev = dummy
        while prev.next:
            if prev.next.val == val:
                prev.next = prev.next.next
                self.size -= 1
                break
            prev = prev.next
        self.head = dummy.next

    def search(self, val):              # O(n)
        curr, index = self.head, 0
        while curr:
            if curr.val == val:
                return index
            curr, index = curr.next, index + 1
        return -1

    def __str__(self):
        parts, curr = [], self.head
        while curr:
            parts.append(str(curr.val))
            curr = curr.next
        return " -> ".join(parts + ["None"])

ll = LinkedList()
for v in [20, 30, 40]:
    ll.push_back(v)
ll.push_front(10)
print(ll, "| size:", ll.size)
print("index of 30:", ll.search(30))
ll.delete(10)
ll.delete(30)
print(ll, "| size:", ll.size)
`,
        },
      },
      result: `10 -> 20 -> 30 -> 40 -> None | size: 4
index of 30: 2
20 -> 40 -> None | size: 2`,
      explanation: "push_front only changes the head pointer, so it is O(1). push_back walks to the end (O(n)); keeping a tail pointer would make it O(1). delete uses a dummy node so deleting the head needs no special case.",
    },
    {
      title: "Reverse a Linked List (Iterative and Recursive)",
      scenario: "LeetCode 206: reverse 1 -> 2 -> 3 -> 4 -> 5.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    dummy = Node(0)
    tail = dummy
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

def reverse_iterative(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev

def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head      # the next node points back to me
    head.next = None
    return new_head

print(to_list(reverse_iterative(build([1, 2, 3, 4, 5]))))
print(to_list(reverse_recursive(build([1, 2, 3]))))
print(to_list(reverse_iterative(build([]))))
`,
      python: {
        files: {
          "main.py": `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    dummy = Node(0)
    tail = dummy
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

def reverse_iterative(head):
    prev, curr = None, head
    while curr:
        nxt = curr.next
        curr.next = prev
        prev, curr = curr, nxt
    return prev

def reverse_recursive(head):
    if head is None or head.next is None:
        return head
    new_head = reverse_recursive(head.next)
    head.next.next = head      # the next node points back to me
    head.next = None
    return new_head

print(to_list(reverse_iterative(build([1, 2, 3, 4, 5]))))
print(to_list(reverse_recursive(build([1, 2, 3]))))
print(to_list(reverse_iterative(build([]))))
`,
        },
      },
      result: `[5, 4, 3, 2, 1]
[3, 2, 1]
[]`,
      explanation: "The iterative version flips one arrow per step using O(1) extra space. The recursive version reverses the rest of the list first, then makes the following node point back to the current one; it uses O(n) stack space. Both handle the empty list.",
    },
    {
      title: "Middle Node and Cycle Detection",
      scenario: "Use fast and slow pointers to find the middle node and detect (and locate) a cycle.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                 # they met inside the cycle
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow.val
    return None

nodes = [Node(v) for v in [1, 2, 3, 4, 5, 6]]
for a, b in zip(nodes, nodes[1:]):
    a.next = b
print("middle of 1..6:", middle(nodes[0]))
print("cycle start (no cycle):", cycle_start(nodes[0]))

nodes[-1].next = nodes[2]       # 6 -> 3 creates a cycle
print("cycle start:", cycle_start(nodes[0]))
`,
      python: {
        files: {
          "main.py": `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def middle(head):
    slow = fast = head
    while fast and fast.next:
        slow = slow.next
        fast = fast.next.next
    return slow.val

def cycle_start(head):
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
        if slow is fast:                 # they met inside the cycle
            slow = head
            while slow is not fast:
                slow, fast = slow.next, fast.next
            return slow.val
    return None

nodes = [Node(v) for v in [1, 2, 3, 4, 5, 6]]
for a, b in zip(nodes, nodes[1:]):
    a.next = b
print("middle of 1..6:", middle(nodes[0]))
print("cycle start (no cycle):", cycle_start(nodes[0]))

nodes[-1].next = nodes[2]       # 6 -> 3 creates a cycle
print("cycle start:", cycle_start(nodes[0]))
`,
        },
      },
      result: `middle of 1..6: 4
cycle start (no cycle): None
cycle start: 3`,
      explanation: "For an even length list, this version returns the second middle (4). When 6 points back to 3, fast and slow meet inside the loop; resetting slow to head and moving both by one step makes them meet exactly at node 3, the start of the cycle. O(n) time, O(1) space.",
    },
    {
      title: "Merge Two Sorted Lists",
      scenario: "LeetCode 21: merge two sorted linked lists into one sorted list by relinking nodes.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = Node(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def merge(l1, l2):
    dummy = tail = Node(0)
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2           # attach the leftover part
    return dummy.next

print(to_list(merge(build([1, 2, 4]), build([1, 3, 4]))))
print(to_list(merge(build([]), build([0]))))
`,
      python: {
        files: {
          "main.py": `class Node:
    def __init__(self, val, next=None):
        self.val, self.next = val, next

def build(values):
    head = None
    for v in reversed(values):
        head = Node(v, head)
    return head

def to_list(head):
    out = []
    while head:
        out.append(head.val)
        head = head.next
    return out

def merge(l1, l2):
    dummy = tail = Node(0)
    while l1 and l2:
        if l1.val <= l2.val:
            tail.next, l1 = l1, l1.next
        else:
            tail.next, l2 = l2, l2.next
        tail = tail.next
    tail.next = l1 or l2           # attach the leftover part
    return dummy.next

print(to_list(merge(build([1, 2, 4]), build([1, 3, 4]))))
print(to_list(merge(build([]), build([0]))))
`,
        },
      },
      result: `[1, 1, 2, 3, 4, 4]
[0]`,
      explanation: "The dummy node gives us a fixed starting point, and tail always points to the last node of the merged list. We pick the smaller head each time and finally attach whichever list still has nodes. O(n + m) time, O(1) extra space.",
    },
    {
      title: "Doubly Linked List with O(1) Delete",
      scenario: "Build a doubly linked list with sentinel head and tail, used later in LRU cache designs.",
      steps: [
        "Open VS Code or PyCharm and create a folder for today's lesson",
        "Create main.py and paste the code",
        "Run it with: python main.py (in PyCharm: right-click > Run 'main')",
        "Compare your terminal output with the result shown below",
      ],
      code: `class DNode:
    def __init__(self, val=None):
        self.val = val
        self.prev = self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head, self.tail = DNode(), DNode()   # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def append(self, val):
        node = DNode(val)
        last = self.tail.prev
        last.next, node.prev = node, last
        node.next, self.tail.prev = self.tail, node
        return node

    def remove(self, node):            # O(1) given the node
        node.prev.next = node.next
        node.next.prev = node.prev

    def forward(self):
        out, curr = [], self.head.next
        while curr is not self.tail:
            out.append(curr.val)
            curr = curr.next
        return out

    def backward(self):
        out, curr = [], self.tail.prev
        while curr is not self.head:
            out.append(curr.val)
            curr = curr.prev
        return out

dll = DoublyLinkedList()
a = dll.append("A"); b = dll.append("B"); c = dll.append("C")
print("forward :", dll.forward())
print("backward:", dll.backward())
dll.remove(b)
print("after removing B:", dll.forward())
`,
      python: {
        files: {
          "main.py": `class DNode:
    def __init__(self, val=None):
        self.val = val
        self.prev = self.next = None

class DoublyLinkedList:
    def __init__(self):
        self.head, self.tail = DNode(), DNode()   # sentinels
        self.head.next, self.tail.prev = self.tail, self.head

    def append(self, val):
        node = DNode(val)
        last = self.tail.prev
        last.next, node.prev = node, last
        node.next, self.tail.prev = self.tail, node
        return node

    def remove(self, node):            # O(1) given the node
        node.prev.next = node.next
        node.next.prev = node.prev

    def forward(self):
        out, curr = [], self.head.next
        while curr is not self.tail:
            out.append(curr.val)
            curr = curr.next
        return out

    def backward(self):
        out, curr = [], self.tail.prev
        while curr is not self.head:
            out.append(curr.val)
            curr = curr.prev
        return out

dll = DoublyLinkedList()
a = dll.append("A"); b = dll.append("B"); c = dll.append("C")
print("forward :", dll.forward())
print("backward:", dll.backward())
dll.remove(b)
print("after removing B:", dll.forward())
`,
        },
      },
      result: `forward : ['A', 'B', 'C']
backward: ['C', 'B', 'A']
after removing B: ['A', 'C']`,
      explanation: "Each node knows both neighbours, so removing it only rewires prev.next and next.prev: O(1) with no traversal. Sentinel head and tail nodes remove all empty-list and edge checks.",
    },
  ],
  interview: [
    {
      q: "What is a linked list? How is it different from an array?",
      a: "A linked list is a sequence of nodes where each node holds a value and a pointer to the next node. Arrays store elements contiguously and allow O(1) index access, but inserting/deleting at the front or middle is O(n). Linked lists need O(n) to reach the i-th element, but insert/delete is O(1) once you hold the neighbouring node. Linked lists use extra memory for pointers and are less cache-friendly.",
      level: "Easy",
    },
    {
      q: "How do you reverse a singly linked list? What are the complexities?",
      a: "Iteratively with three pointers: prev = None, curr = head; loop: nxt = curr.next, curr.next = prev, prev = curr, curr = nxt. Return prev. O(n) time, O(1) space. The recursive version is also O(n) time but uses O(n) stack space.",
      level: "Easy",
    },
    {
      q: "How do you detect a cycle in a linked list?",
      a: "Floyd's tortoise and hare: slow moves 1 step, fast moves 2 steps. If they ever point to the same node, there is a cycle; if fast reaches None, there is none. O(n) time, O(1) space. Alternative: store visited nodes in a set, O(n) space.",
      level: "Medium",
    },
    {
      q: "After detecting a cycle, how do you find where it starts, and why does it work?",
      a: "Reset one pointer to head and move both one step at a time; they meet at the cycle start. If the distance from head to the cycle start is a, and they met b steps into the cycle of length c, then 2(a + b) = a + b + kc, so a = kc - b: walking a steps from head and a steps from the meeting point lands both at the start.",
      level: "Hard",
    },
    {
      q: "What is a dummy node and why is it useful?",
      a: "A placeholder node placed before the real head. It ensures every real node has a previous node, so deleting or inserting at the head does not need special-case code. Return dummy.next at the end.",
      level: "Easy",
    },
    {
      q: "How do you find the middle of a linked list in one pass?",
      a: "Use slow and fast pointers starting at head. Move slow by 1 and fast by 2 while fast and fast.next exist. When the loop ends, slow is at the middle (the second middle for even lengths). O(n) time, O(1) space.",
      level: "Easy",
    },
    {
      q: "How do you remove the N-th node from the end in one pass (LeetCode 19)?",
      a: "Use a dummy node and two pointers. Move fast n + 1 steps ahead from dummy, then move both until fast is None. Now slow is just before the target node; set slow.next = slow.next.next. O(n) time, O(1) space.",
      level: "Medium",
    },
    {
      q: "When would you use a doubly linked list over a singly linked list?",
      a: "When you need backward traversal or O(1) deletion of a node you already have a reference to (no need to find its predecessor). Example: LRU cache (hash map + doubly linked list), browser history, text editor buffers. The trade-off is an extra pointer per node.",
      level: "Medium",
    },
    {
      q: "How would you check if a linked list is a palindrome in O(1) extra space?",
      a: "Find the middle with fast/slow pointers, reverse the second half in place, then compare the first half and reversed second half node by node. Optionally reverse the second half back to restore the list. O(n) time, O(1) space.",
      level: "Hard",
    },
    {
      q: "How do you find the intersection node of two linked lists (LeetCode 160)?",
      a: "Use two pointers a and b starting at headA and headB. Move each one step; when a pointer reaches the end, redirect it to the other list's head. They meet at the intersection after at most lenA + lenB steps, or both become None if there is no intersection. O(n + m) time, O(1) space.",
      level: "Medium",
    },
    {
      q: "Does Python have a built-in linked list?",
      a: "Not a general singly linked list. collections.deque is implemented as a doubly linked list of blocks and gives O(1) operations at both ends. OrderedDict also uses a doubly linked list internally. In interviews you define your own ListNode class.",
      level: "Easy",
    },
  ],
  practice: [
    {
      task: "Remove Nth Node From End of List (LeetCode 19): 1->2->3->4->5, n=2 -> 1->2->3->5.",
      hint: "Dummy node + fast pointer moved n + 1 steps ahead.",
      solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def remove_nth_from_end(head, n):
    # Time O(L), Space O(1)
    dummy = ListNode(0, head)
    fast = slow = dummy
    for _ in range(n + 1):
        fast = fast.next
    while fast:
        fast, slow = fast.next, slow.next
    slow.next = slow.next.next
    return dummy.next

head = None
for v in [5, 4, 3, 2, 1]:
    head = ListNode(v, head)
head = remove_nth_from_end(head, 2)
out = []
while head:
    out.append(head.val)
    head = head.next
print(out)  # [1, 2, 3, 5]
`,
    },
    {
      task: "Palindrome Linked List (LeetCode 234): 1->2->2->1 -> True in O(1) extra space.",
      hint: "Middle with fast/slow, reverse second half, compare.",
      solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def is_palindrome(head):
    # Time O(n), Space O(1)
    slow = fast = head
    while fast and fast.next:
        slow, fast = slow.next, fast.next.next
    prev = None
    while slow:                      # reverse second half
        slow.next, prev, slow = prev, slow, slow.next
    left, right = head, prev
    while right:
        if left.val != right.val:
            return False
        left, right = left.next, right.next
    return True

def build(vals):
    head = None
    for v in reversed(vals):
        head = ListNode(v, head)
    return head

print(is_palindrome(build([1, 2, 2, 1])))  # True
print(is_palindrome(build([1, 2, 3])))     # False
`,
    },
    {
      task: "Remove Duplicates from Sorted List (LeetCode 83): 1->1->2->3->3 -> 1->2->3.",
      hint: "If curr.val == curr.next.val, skip the next node; else move forward.",
      solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def delete_duplicates(head):
    # Time O(n), Space O(1)
    curr = head
    while curr and curr.next:
        if curr.val == curr.next.val:
            curr.next = curr.next.next
        else:
            curr = curr.next
    return head

head = None
for v in reversed([1, 1, 2, 3, 3]):
    head = ListNode(v, head)
head = delete_duplicates(head)
out = []
while head:
    out.append(head.val)
    head = head.next
print(out)  # [1, 2, 3]
`,
    },
    {
      task: "Add Two Numbers (LeetCode 2): digits are stored in reverse order. (2->4->3) + (5->6->4) = 7->0->8 (342 + 465 = 807).",
      hint: "Walk both lists with a carry; use a dummy node for the result.",
      solution: `class ListNode:
    def __init__(self, val=0, next=None):
        self.val, self.next = val, next

def add_two_numbers(l1, l2):
    # Time O(max(n, m)), Space O(max(n, m)) for the output
    dummy = tail = ListNode()
    carry = 0
    while l1 or l2 or carry:
        total = carry + (l1.val if l1 else 0) + (l2.val if l2 else 0)
        carry, digit = divmod(total, 10)
        tail.next = ListNode(digit)
        tail = tail.next
        l1 = l1.next if l1 else None
        l2 = l2.next if l2 else None
    return dummy.next

def build(vals):
    head = None
    for v in reversed(vals):
        head = ListNode(v, head)
    return head

res = add_two_numbers(build([2, 4, 3]), build([5, 6, 4]))
out = []
while res:
    out.append(res.val)
    res = res.next
print(out)  # [7, 0, 8]
`,
    },
    {
      task: "LRU Cache (LeetCode 146): get and put in O(1), evicting the least recently used key when capacity is exceeded.",
      hint: "Hash map key -> node + doubly linked list ordered by recency. (OrderedDict is the shortcut version.)",
      solution: `class Node:
    def __init__(self, key=0, val=0):
        self.key, self.val = key, val
        self.prev = self.next = None

class LRUCache:
    # get/put O(1), Space O(capacity)
    def __init__(self, capacity):
        self.cap = capacity
        self.map = {}
        self.head, self.tail = Node(), Node()      # head.next = LRU
        self.head.next, self.tail.prev = self.tail, self.head

    def _remove(self, node):
        node.prev.next, node.next.prev = node.next, node.prev

    def _add_last(self, node):                     # most recent at tail
        last = self.tail.prev
        last.next, node.prev = node, last
        node.next, self.tail.prev = self.tail, node

    def get(self, key):
        if key not in self.map:
            return -1
        node = self.map[key]
        self._remove(node)
        self._add_last(node)
        return node.val

    def put(self, key, value):
        if key in self.map:
            self._remove(self.map[key])
        node = Node(key, value)
        self.map[key] = node
        self._add_last(node)
        if len(self.map) > self.cap:
            lru = self.head.next
            self._remove(lru)
            del self.map[lru.key]

cache = LRUCache(2)
cache.put(1, 1); cache.put(2, 2)
print(cache.get(1))   # 1
cache.put(3, 3)       # evicts key 2
print(cache.get(2))   # -1
cache.put(4, 4)       # evicts key 1
print(cache.get(1), cache.get(3), cache.get(4))  # -1 3 4
`,
    },
  ],
  quiz: [
    {
      question: "Time complexity to access the k-th element of a singly linked list?",
      options: [
        "O(1)",
        "O(log n)",
        "O(k)",
        "O(n^2)",
      ],
      answer: 2,
      explanation: "You must walk k nodes from the head (O(n) in the worst case).",
    },
    {
      question: "Inserting a new node at the head of a singly linked list is:",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n log n)",
      ],
      answer: 0,
      explanation: "Create the node and point it to the old head.",
    },
    {
      question: "Floyd's cycle detection uses pointers moving at speeds:",
      options: [
        "1 and 1",
        "1 and 2",
        "2 and 3",
        "0 and 1",
      ],
      answer: 1,
      explanation: "Slow moves one step and fast moves two.",
    },
    {
      question: "Space complexity of reversing a linked list iteratively?",
      options: [
        "O(1)",
        "O(log n)",
        "O(n)",
        "O(n^2)",
      ],
      answer: 0,
      explanation: "Only three pointer variables are used.",
    },
    {
      question: "What is the main purpose of a dummy node?",
      options: [
        "Save memory",
        "Avoid special cases when the head changes",
        "Make the list circular",
        "Speed up search",
      ],
      answer: 1,
      explanation: "There is always a previous node, even for the first real node.",
    },
    {
      question: "Which structure gives O(1) removal of a node when you already hold a reference to it?",
      options: [
        "Singly linked list",
        "Doubly linked list",
        "Python list",
        "Tuple",
      ],
      answer: 1,
      explanation: "The node knows its prev, so no search for the predecessor is needed.",
    },
  ],
};
