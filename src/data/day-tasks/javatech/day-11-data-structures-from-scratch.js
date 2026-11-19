export default {
  lesson: 'day-11-data-structures-from-scratch',
  minutes: 26,
  intro: 'Dry-run hand-made linked lists, stacks, circular queues, BSTs and graph traversals, then pick the right java.util class.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program using your hand-made singly linked list print? (one line per println)',
      example: { title: 'head operations are O(1)', text: 'addFirst puts a node before the head; removeFirst moves head to head.next.' },
      code: `MyLinkedList list = new MyLinkedList();
list.addFirst(10);
list.addLast(20);
list.addLast(30);
list.addFirst(5);
list.removeFirst();
list.addLast(40);
System.out.println(list);          // prints like 1 -> 2 -> 3
System.out.println(list.size());`,
      expected: '10 -> 20 -> 30 -> 40\n4',
      explain: 'After the adds: 5 → 10 → 20 → 30. `removeFirst` drops 5, then 40 is appended: 10 → 20 → 30 → 40, size 4. In a singly linked list without a tail pointer, addLast is O(n) because you walk to the end.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this array-based stack program print? (one line per println)',
      example: { title: 'LIFO', text: 'Last In, First Out: pop() removes the most recently pushed element; peek() only looks at it.' },
      code: `MyStack s = new MyStack(5);
s.push(1);
s.push(2);
s.push(3);
System.out.println(s.pop());
s.push(4);
System.out.println(s.peek());
System.out.println(s.pop());
System.out.println(s.pop());
System.out.println(s.size());`,
      expected: '3\n4\n4\n2\n1',
      explain: 'Stack: [1,2,3] → pop 3 → [1,2] → push 4 → [1,2,4] → peek 4 (stays) → pop 4 → pop 2 → only 1 is left, size 1.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'A circular queue with **capacity 3**. `enqueue` returns false when full. What is printed? (one line per println)',
      example: { title: 'wrap-around', text: 'rear = (rear + 1) % capacity, so after the last slot the next element goes back to index 0.' },
      code: `CircularQueue q = new CircularQueue(3);
q.enqueue("A");
q.enqueue("B");
q.enqueue("C");
System.out.println(q.enqueue("D"));
System.out.println(q.dequeue());
System.out.println(q.enqueue("D"));
System.out.println(q.dequeue() + q.dequeue() + q.dequeue());`,
      expected: 'false\nA\ntrue\nBCD',
      explain: 'The queue is full after A, B, C, so D is rejected (false). FIFO: dequeue gives A and frees a slot; D goes into index 0 (wrap-around). The remaining order is B, C, D.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'These keys are inserted into an empty **BST** in this order: `50, 30, 70, 20, 40, 60, 80`. Type two lines: the **in-order** traversal, then the **pre-order** traversal (values separated by single spaces).',
      example: { title: 'traversal rules', text: 'In-order: left, node, right. Pre-order: node, left, right. Post-order: left, right, node.' },
      code: `BST tree = new BST();
for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) tree.insert(k);
tree.inorder();   // prints one line
tree.preorder();  // prints one line`,
      expected: '20 30 40 50 60 70 80\n50 30 20 40 70 60 80',
      explain: '50 is the root; 30 goes left, 70 right; 20/40 under 30; 60/80 under 70. **In-order of a BST is always sorted.** Pre-order visits the root first, then the whole left subtree, then the right.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Graph (directed adjacency list, neighbours in the order shown). Type two lines: **BFS** from A, then recursive **DFS** from A (letters separated by single spaces).',
      example: { title: 'BFS vs DFS', text: 'BFS uses a queue and visits level by level; DFS goes as deep as possible first (recursion / stack).' },
      code: `A -> B, C
B -> D
C -> D, E
D -> F
E -> F
F -> (none)`,
      expected: 'A B C D E F\nA B D F C E',
      explain: 'BFS: A, then its neighbours B, C, then D (from B), E (from C), then F. DFS: A → B → D → F (dead end, back up) → C → (D already visited) → E. Mark nodes visited to avoid repeats.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'In real projects, which java.util choices are recommended? (choose all that apply)',
      options: [
        'ArrayDeque as a stack (push/pop) instead of the legacy Stack class',
        'ArrayDeque or LinkedList as a queue (offer/poll)',
        'TreeMap when you need keys kept sorted (it is a red-black tree)',
        'Write your own linked list for every production project',
        'HashMap for fast key lookups (average O(1))',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Build structures by hand to **understand** them, but use the tested JDK classes in projects. `Stack` extends the synchronized `Vector` - `ArrayDeque` is faster. TreeMap = balanced BST with sorted keys; HashMap = hash table.',
    },
  ],
};
