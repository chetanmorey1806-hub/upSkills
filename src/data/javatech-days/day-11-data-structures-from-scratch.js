const ex1 = `public class Main {
    // One box in the chain: data + address of the next box
    static class Node {
        int data;
        Node next;
        Node(int data) { this.data = data; }
    }

    static class MyLinkedList {
        Node head;
        int size;

        void addFirst(int value) {
            Node n = new Node(value);
            n.next = head;          // new node points to old first node
            head = n;               // new node becomes the head
            size++;
        }

        void addLast(int value) {
            Node n = new Node(value);
            if (head == null) { head = n; size++; return; }
            Node cur = head;
            while (cur.next != null) cur = cur.next;   // walk to the last node
            cur.next = n;
            size++;
        }

        boolean delete(int value) {
            if (head == null) return false;
            if (head.data == value) { head = head.next; size--; return true; }
            Node cur = head;
            while (cur.next != null && cur.next.data != value) cur = cur.next;
            if (cur.next == null) return false;         // not found
            cur.next = cur.next.next;                   // skip the node
            size--;
            return true;
        }

        void reverse() {
            Node prev = null, cur = head;
            while (cur != null) {
                Node next = cur.next;   // 1. remember the rest of the list
                cur.next = prev;        // 2. turn the arrow backwards
                prev = cur;             // 3. move prev forward
                cur = next;             // 4. move cur forward
            }
            head = prev;
        }

        String display() {
            StringBuilder sb = new StringBuilder();
            Node cur = head;
            while (cur != null) {
                sb.append(cur.data).append(" -> ");
                cur = cur.next;
            }
            return sb.append("null").toString();
        }
    }

    public static void main(String[] args) {
        MyLinkedList list = new MyLinkedList();
        list.addLast(10);
        list.addLast(20);
        list.addLast(30);
        list.addFirst(5);
        System.out.println("List: " + list.display());
        System.out.println("Size: " + list.size);
        System.out.println("Delete 20: " + list.delete(20));
        System.out.println("Delete 99: " + list.delete(99));
        System.out.println("After delete: " + list.display());
        list.reverse();
        System.out.println("Reversed: " + list.display());
        System.out.println("Size: " + list.size);
    }
}`;

const ex2 = `public class Main {
    // Stack = LIFO (Last In First Out), built on an array
    static class MyStack {
        private int[] arr;
        private int top = -1;              // -1 means empty

        MyStack(int capacity) { arr = new int[capacity]; }

        void push(int value) {
            if (top == arr.length - 1) {
                System.out.println("Stack Overflow! Cannot push " + value);
                return;
            }
            arr[++top] = value;
        }

        int pop() {
            if (isEmpty()) throw new RuntimeException("Stack Underflow");
            return arr[top--];
        }

        int peek() {
            if (isEmpty()) throw new RuntimeException("Stack is empty");
            return arr[top];
        }

        boolean isEmpty() { return top == -1; }
        int size() { return top + 1; }
    }

    // Queue = FIFO (First In First Out), circular array
    static class MyQueue {
        private int[] arr;
        private int front = 0, rear = -1, count = 0;

        MyQueue(int capacity) { arr = new int[capacity]; }

        void enqueue(int value) {
            if (count == arr.length) {
                System.out.println("Queue Full! Cannot add " + value);
                return;
            }
            rear = (rear + 1) % arr.length;   // wrap around to index 0
            arr[rear] = value;
            count++;
        }

        int dequeue() {
            if (count == 0) throw new RuntimeException("Queue is empty");
            int value = arr[front];
            front = (front + 1) % arr.length;
            count--;
            return value;
        }

        boolean isEmpty() { return count == 0; }
    }

    public static void main(String[] args) {
        MyStack s = new MyStack(3);
        s.push(10);
        s.push(20);
        s.push(30);
        s.push(40);
        System.out.println("Top: " + s.peek());
        System.out.println("Popped: " + s.pop());
        System.out.println("Popped: " + s.pop());
        System.out.println("Size now: " + s.size());

        MyQueue q = new MyQueue(3);
        q.enqueue(1);
        q.enqueue(2);
        q.enqueue(3);
        q.enqueue(4);
        System.out.println("Dequeued: " + q.dequeue());
        q.enqueue(5);                       // goes into index 0 (circular)
        StringBuilder sb = new StringBuilder();
        while (!q.isEmpty()) sb.append(q.dequeue()).append(" ");
        System.out.println("Queue order: " + sb.toString().trim());
    }
}`;

const ex3 = `public class Main {
    static class Node {
        int key;
        Node left, right;
        Node(int key) { this.key = key; }
    }

    // Smaller keys go left, bigger keys go right
    static Node insert(Node root, int key) {
        if (root == null) return new Node(key);
        if (key < root.key) root.left = insert(root.left, key);
        else if (key > root.key) root.right = insert(root.right, key);
        return root;                       // duplicates are ignored
    }

    static boolean search(Node root, int key) {
        while (root != null) {
            if (key == root.key) return true;
            root = key < root.key ? root.left : root.right;
        }
        return false;
    }

    static void inorder(Node r, StringBuilder sb) {      // Left, Root, Right
        if (r == null) return;
        inorder(r.left, sb);
        sb.append(r.key).append(" ");
        inorder(r.right, sb);
    }

    static void preorder(Node r, StringBuilder sb) {     // Root, Left, Right
        if (r == null) return;
        sb.append(r.key).append(" ");
        preorder(r.left, sb);
        preorder(r.right, sb);
    }

    static void postorder(Node r, StringBuilder sb) {    // Left, Right, Root
        if (r == null) return;
        postorder(r.left, sb);
        postorder(r.right, sb);
        sb.append(r.key).append(" ");
    }

    static int height(Node r) {
        if (r == null) return 0;
        return 1 + Math.max(height(r.left), height(r.right));
    }

    public static void main(String[] args) {
        int[] keys = {50, 30, 70, 20, 40, 60, 80};
        Node root = null;
        for (int k : keys) root = insert(root, k);

        StringBuilder sb = new StringBuilder();
        inorder(root, sb);
        System.out.println("Inorder: " + sb.toString().trim());

        sb = new StringBuilder();
        preorder(root, sb);
        System.out.println("Preorder: " + sb.toString().trim());

        sb = new StringBuilder();
        postorder(root, sb);
        System.out.println("Postorder: " + sb.toString().trim());

        System.out.println("Search 60: " + search(root, 60));
        System.out.println("Search 65: " + search(root, 65));

        Node cur = root;
        while (cur.left != null) cur = cur.left;
        System.out.println("Min: " + cur.key);
        cur = root;
        while (cur.right != null) cur = cur.right;
        System.out.println("Max: " + cur.key);
        System.out.println("Height: " + height(root));
    }
}`;

const ex4 = `import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Queue;

public class Main {
    static List<List<Integer>> adj = new ArrayList<>();

    static void addEdge(int u, int v) {      // undirected: add both ways
        adj.get(u).add(v);
        adj.get(v).add(u);
    }

    static String bfs(int start, int[] dist) {
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> queue = new ArrayDeque<>();
        StringBuilder order = new StringBuilder();
        visited[start] = true;
        dist[start] = 0;
        queue.offer(start);
        while (!queue.isEmpty()) {
            int node = queue.poll();
            order.append(node).append(" ");
            for (int next : adj.get(node)) {
                if (!visited[next]) {
                    visited[next] = true;
                    dist[next] = dist[node] + 1;
                    queue.offer(next);
                }
            }
        }
        return order.toString().trim();
    }

    static void dfs(int node, boolean[] visited, StringBuilder order) {
        visited[node] = true;
        order.append(node).append(" ");
        for (int next : adj.get(node)) {
            if (!visited[next]) dfs(next, visited, order);
        }
    }

    public static void main(String[] args) {
        int vertices = 6;
        for (int i = 0; i < vertices; i++) adj.add(new ArrayList<>());
        addEdge(0, 1);
        addEdge(0, 2);
        addEdge(1, 3);
        addEdge(2, 4);
        addEdge(3, 5);
        addEdge(4, 5);

        System.out.println("Adjacency list:");
        for (int i = 0; i < vertices; i++) System.out.println(i + " -> " + adj.get(i));

        int[] dist = new int[vertices];
        System.out.println("BFS from 0: " + bfs(0, dist));
        System.out.println("Distance from 0: " + Arrays.toString(dist));

        StringBuilder order = new StringBuilder();
        dfs(0, new boolean[vertices], order);
        System.out.println("DFS from 0: " + order.toString().trim());
    }
}`;

const ex5 = `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.LinkedList;
import java.util.List;
import java.util.Queue;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> stack = new ArrayDeque<>();   // use as Stack
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println("Stack pop: " + stack.pop());
        System.out.println("Stack now: " + stack);

        Queue<Integer> queue = new ArrayDeque<>();   // use as Queue
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);
        System.out.println("Queue poll: " + queue.poll());
        System.out.println("Queue now: " + queue);

        TreeSet<Integer> bst = new TreeSet<>(List.of(50, 30, 70, 20, 40));  // Red-Black tree inside
        System.out.println("TreeSet (sorted): " + bst);
        System.out.println("floor(45): " + bst.floor(45));
        System.out.println("ceiling(45): " + bst.ceiling(45));

        LinkedList<String> ll = new LinkedList<>(List.of("B", "C"));  // doubly linked list
        ll.addFirst("A");
        ll.addLast("D");
        System.out.println("LinkedList: " + ll);
    }
}`;

export default {
  id: 'day-11-data-structures-from-scratch',
  title: 'Data Structures in Java: Linked List, Stack, Queue, BST and Graph from Scratch',
  module: 'Module 3: Data Structures & Algorithms in Java',
  day: 11,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Build the most asked data structures yourself — singly linked list, array stack, circular queue, binary search tree and graph with BFS/DFS — so you truly understand what LinkedList, ArrayDeque, TreeMap and friends do inside.',
  objectives: [
    'Implement a singly linked list with add, delete, reverse and display',
    'Implement a stack and a circular queue using arrays and handle overflow/underflow',
    'Build a binary search tree with insert, search and inorder/preorder/postorder traversal',
    'Represent a graph with an adjacency list and traverse it using BFS and DFS',
    'Map each hand-made structure to its ready-made class in java.util',
  ],
  theory: [
    {
      heading: 'What is a Data Structure and Why Build One Yourself?',
      content: 'A data structure is a way of arranging data in memory so that the operations you need (add, remove, search) are fast. Think of a library: books can be piled randomly (slow to find) or arranged on shelves by subject and number (fast to find). Java already gives ArrayList, LinkedList, HashMap, TreeMap — but interviewers ask you to build them from scratch to check that you understand references, loops and recursion. Once you have built one, choosing the right collection in a real project becomes easy.',
      points: [
        'Linear structures: Array, Linked List, Stack, Queue (data in a line)',
        'Non-linear structures: Tree, Graph (data in levels or networks)',
        'Every structure is judged by time complexity of its operations (Big-O)',
        'In Java, a "pointer" is just an object reference (Node next)',
      ],
      tip: 'In interviews, always draw boxes and arrows on paper before coding a linked list or tree. Most bugs are lost arrows.',
    },
    {
      heading: 'Linked List: A Chain of Nodes',
      content: 'A linked list is like a train: each coach (Node) holds passengers (data) and is hooked to the next coach (next reference). The engine is the head. Unlike an array, coaches need not be side by side in memory, so adding at the front is instant — but to reach coach number 50 you must walk through 49 coaches.',
      syntax: `class Node { int data; Node next; }

head -> [5|*] -> [10|*] -> [20|*] -> [30|null]`,
      points: [
        'addFirst: O(1) — new node points to old head, head moves to new node',
        'addLast: O(n) without a tail reference, O(1) if you keep a tail',
        'get(index) / search: O(n) — must walk from head',
        'delete: find the node BEFORE the target and set prev.next = target.next',
        'Reverse: use three references prev, cur, next and flip every arrow',
        'Doubly linked list (java.util.LinkedList) has both next and prev references',
      ],
      tip: 'Always handle three cases: empty list (head == null), operation on the head, and operation in the middle/end.',
    },
    {
      heading: 'Stack (LIFO) and Queue (FIFO)',
      content: 'A stack is like a pile of plates: the plate you put last is taken first (Last In First Out). A queue is like the line at a railway ticket counter: the person who came first is served first (First In First Out). Both can be built using an array or a linked list.',
      syntax: `Stack:  push(x) -> top++ ; pop() -> top--         (all O(1))
Queue:  enqueue(x) -> rear = (rear + 1) % capacity
        dequeue()  -> front = (front + 1) % capacity   (circular, all O(1))`,
      points: [
        'Stack uses: undo/redo, browser back button, method call stack, balanced brackets',
        'Queue uses: printer jobs, BFS, ticket booking, task schedulers',
        'Stack overflow = push on full stack; underflow = pop on empty stack',
        'Circular queue reuses empty slots at the front using % (modulus)',
        'In real code use ArrayDeque for both stack (push/pop) and queue (offer/poll); avoid the old Stack class',
      ],
    },
    {
      heading: 'Binary Search Tree (BST)',
      content: 'A binary tree is like a family tree where every person has at most two children. A Binary Search Tree adds one rule: everything in the LEFT subtree is smaller than the node, everything in the RIGHT subtree is bigger. So searching is like the "guess the number" game — each comparison throws away half of the tree.',
      syntax: `Insert 50, 30, 70, 20, 40, 60, 80:

            50
          /    \\
        30      70
       /  \\    /  \\
      20  40  60  80`,
      points: [
        'Insert/search/delete: O(log n) when balanced, O(n) when skewed (like inserting 1,2,3,4,5 in order)',
        'Inorder (Left-Root-Right) of a BST always gives SORTED output',
        'Preorder (Root-Left-Right) is used to copy a tree; Postorder (Left-Right-Root) to delete a tree',
        'Minimum = keep going left; Maximum = keep going right',
        'Height = number of nodes on the longest root-to-leaf path',
        'TreeMap/TreeSet use a self-balancing Red-Black tree, so they stay O(log n)',
      ],
      tip: 'Recursion fits trees naturally: "do the same thing for the left child and the right child" with base case root == null.',
    },
    {
      heading: 'Graph: Adjacency List, BFS and DFS',
      content: 'A graph is a network of vertices (cities) connected by edges (roads). Google Maps, LinkedIn connections and railway routes are graphs. We usually store a graph as an adjacency list: for every vertex, a list of its neighbours. BFS (Breadth First Search) explores level by level like ripples in water, using a queue. DFS (Depth First Search) goes as deep as possible first, like exploring a maze, using recursion (or a stack).',
      syntax: `List<List<Integer>> adj;     // adj.get(0) = [1, 2] means 0 is connected to 1 and 2

BFS: queue.offer(start); while queue not empty: poll, visit, offer unvisited neighbours
DFS: visit(node); for each unvisited neighbour: dfs(neighbour)`,
      points: [
        'Directed graph: one-way edges (Instagram follow); undirected: two-way (Facebook friend)',
        'Adjacency matrix uses O(V*V) memory; adjacency list uses O(V+E) — better for sparse graphs',
        'Always keep a visited[] array, otherwise cycles cause infinite loops',
        'BFS gives the shortest path (fewest edges) in an unweighted graph',
        'Both BFS and DFS take O(V + E) time',
      ],
    },
    {
      heading: 'Hand-made vs java.util: Which Class to Use in Projects',
      content: 'In real projects never re-invent these structures — use the tested, optimised classes. Building them yourself is for learning and interviews.',
      points: [
        'Linked list -> java.util.LinkedList (doubly linked)',
        'Stack -> ArrayDeque with push/pop/peek (Stack class is old and synchronized)',
        'Queue -> ArrayDeque or LinkedList with offer/poll/peek; PriorityQueue for priority order',
        'BST -> TreeMap / TreeSet (balanced Red-Black tree, sorted keys, floor/ceiling)',
        'Graph -> Map<Integer, List<Integer>> or List<List<Integer>> (no built-in graph class)',
      ],
      tip: 'Common mistake: using LinkedList for random access get(i) in a loop — that is O(n) each time, O(n^2) total. Use ArrayList.',
    },
  ],
  examples: [
    {
      title: 'Singly Linked List: add, delete, reverse',
      scenario: 'Build your own linked list to store roll numbers, delete one, and reverse the list — a very common interview task.',
      steps: [
        'In IntelliJ: File > New > Project > Java, then right-click src > New > Java Class > Main',
        'In Eclipse: File > New > Java Project, then New > Class named Main with main method',
        'Type the Node and MyLinkedList nested classes and the main method',
        'Click Run (green triangle) and compare output with the expected result',
        'Draw the arrows on paper for reverse() to see how prev, cur and next move',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `List: 5 -> 10 -> 20 -> 30 -> null
Size: 4
Delete 20: true
Delete 99: false
After delete: 5 -> 10 -> 30 -> null
Reversed: 30 -> 10 -> 5 -> null
Size: 3`,
      explanation: 'addLast(10), addLast(20), addLast(30) build 10->20->30; addFirst(5) puts 5 in front. delete(20) stops at node 10 (whose next is 20) and links 10 directly to 30. delete(99) walks to the end without finding it and returns false. reverse() flips each arrow one by one: after the loop prev points to 30, which becomes the new head.',
    },
    {
      title: 'Array-based Stack and Circular Queue',
      scenario: 'Implement a fixed-size stack and queue, including the full/empty checks interviewers expect.',
      steps: [
        'Create class Main and add the two static nested classes MyStack and MyQueue',
        'Note top = -1 means empty stack; count tracks queue size',
        'Run the program and watch the overflow and "Queue Full" messages',
        'Trace the queue: after dequeuing 1, enqueue(5) goes to index 0 because (2 + 1) % 3 = 0',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Stack Overflow! Cannot push 40
Top: 30
Popped: 30
Popped: 20
Size now: 1
Queue Full! Cannot add 4
Dequeued: 1
Queue order: 2 3 5`,
      explanation: 'Stack capacity is 3, so pushing 40 fails. peek shows 30 (last pushed), then pops return 30 and 20 (LIFO), leaving one element. The queue holds 1,2,3 and rejects 4. Dequeue removes 1 (FIFO) and front moves to index 1. enqueue(5) wraps around to index 0. Dequeuing everything gives 2, 3, 5 — the order they were added.',
    },
    {
      title: 'Binary Search Tree: insert, search, traversals, height',
      scenario: 'Store marks in a BST so that searching is fast and printing in sorted order is easy.',
      steps: [
        'Create Main.java with a static nested Node class (key, left, right)',
        'Write recursive insert: go left if smaller, right if bigger',
        'Write the three traversals, each just changes WHEN the root is printed',
        'Run and verify that inorder output is sorted',
        'Try inserting keys in sorted order (10,20,30,40) and print height — the tree becomes a skewed line',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Inorder: 20 30 40 50 60 70 80
Preorder: 50 30 20 40 70 60 80
Postorder: 20 40 30 60 80 70 50
Search 60: true
Search 65: false
Min: 20
Max: 80
Height: 3`,
      explanation: '50 becomes the root; 30 and 70 become its children; 20, 40 go under 30 and 60, 80 under 70. Inorder visits left subtree, root, right subtree — giving sorted order. Search 65 goes 50 -> 70 -> 60 -> right child null, so false. The leftmost node is 20 (min) and the rightmost is 80 (max). The longest path 50-30-20 has 3 nodes, so height is 3.',
    },
    {
      title: 'Graph with Adjacency List: BFS (with distances) and DFS',
      scenario: 'Model 6 metro stations as a graph and find the visiting order and the minimum number of stops from station 0.',
      steps: [
        'Create Main.java and a List<List<Integer>> called adj with one empty list per vertex',
        'Add undirected edges with addEdge(u, v) which adds both directions',
        'Write BFS with ArrayDeque as the queue and a visited[] array',
        'Write recursive DFS',
        'Run and draw the graph: 0-1, 0-2, 1-3, 2-4, 3-5, 4-5',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Adjacency list:
0 -> [1, 2]
1 -> [0, 3]
2 -> [0, 4]
3 -> [1, 5]
4 -> [2, 5]
5 -> [3, 4]
BFS from 0: 0 1 2 3 4 5
Distance from 0: [0, 1, 1, 2, 2, 3]
DFS from 0: 0 1 3 5 4 2`,
      explanation: 'BFS: start 0, add neighbours 1 and 2 (distance 1). From 1 add 3, from 2 add 4 (distance 2). From 3 add 5 (distance 3); when 4 is processed, 5 is already visited. DFS goes deep: 0 -> 1 -> 3 -> 5 -> 4 -> 2 (from 5 it reaches 4, then from 4 reaches the unvisited 2), then backtracks. The neighbour order is the order edges were added, so output is fixed.',
    },
    {
      title: 'Same Structures Using java.util Classes',
      scenario: 'In real projects you use the library versions. See how ArrayDeque, TreeSet and LinkedList replace your hand-made code.',
      steps: [
        'Create Main.java and import the classes from java.util',
        'Use ArrayDeque as a stack (push/pop) and as a queue (offer/poll)',
        'Use TreeSet as a ready-made balanced BST with floor and ceiling',
        'Run and compare with the hand-made versions above',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Stack pop: 3
Stack now: [2, 1]
Queue poll: 1
Queue now: [2, 3]
TreeSet (sorted): [20, 30, 40, 50, 70]
floor(45): 40
ceiling(45): 50
LinkedList: [A, B, C, D]`,
      explanation: 'push adds at the front of the deque, so after popping 3 the deque prints [2, 1] (top first). offer adds at the back, so poll removes 1 and leaves [2, 3]. TreeSet keeps elements sorted; floor(45) is the greatest element <= 45 (40) and ceiling(45) the smallest >= 45 (50). LinkedList supports addFirst/addLast in O(1).',
    },
  ],
  interview: [
    { q: 'What is the difference between an array and a linked list?', a: 'Array: contiguous memory, fixed size, O(1) access by index, costly insert/delete in the middle (shifting). Linked list: nodes anywhere in memory joined by references, dynamic size, O(n) access, O(1) insert/delete once you have the node. Linked list also needs extra memory for the next reference.', level: 'Easy' },
    { q: 'How do you reverse a singly linked list?', a: 'Iteratively with three references: prev = null, cur = head. In a loop: next = cur.next; cur.next = prev; prev = cur; cur = next. At the end head = prev. Time O(n), space O(1).', level: 'Medium' },
    { q: 'How do you find the middle of a linked list in one pass?', a: 'Use slow and fast pointers. slow moves one step, fast moves two steps. When fast reaches the end, slow is at the middle. The same idea (Floyd\'s algorithm) detects a cycle: if slow and fast ever meet, the list has a loop.', level: 'Medium' },
    { q: 'Difference between Stack and Queue? Give real examples.', a: 'Stack is LIFO (pile of plates, undo, browser back, call stack). Queue is FIFO (ticket line, printer jobs, BFS). Stack operations: push/pop/peek. Queue operations: enqueue (offer)/dequeue (poll)/peek.', level: 'Easy' },
    { q: 'Why use a circular queue instead of a simple array queue?', a: 'In a simple array queue, after dequeuing, the front slots are wasted and the queue looks full even when it has space. A circular queue wraps rear and front using (index + 1) % capacity so freed slots are reused.', level: 'Medium' },
    { q: 'What is a Binary Search Tree and what is its time complexity?', a: 'A binary tree where left subtree keys < node key < right subtree keys. Search/insert/delete are O(log n) when balanced (height ~ log n) and O(n) in the worst case when the tree becomes skewed (e.g. inserting sorted data). Balanced trees like AVL and Red-Black keep it O(log n).', level: 'Medium' },
    { q: 'What is the output of inorder traversal of a BST and why?', a: 'Sorted (ascending) order, because inorder visits Left (all smaller keys), then Root, then Right (all bigger keys) at every node.', level: 'Easy' },
    { q: 'Difference between BFS and DFS?', a: 'BFS explores level by level using a queue; it finds the shortest path in an unweighted graph and uses more memory for wide graphs. DFS goes deep first using recursion/stack; it is used for cycle detection, topological sort, path finding in mazes. Both are O(V + E).', level: 'Medium' },
    { q: 'Adjacency matrix vs adjacency list?', a: 'Matrix: V x V boolean/int array, O(1) edge check, O(V^2) memory — good for dense graphs. List: each vertex keeps a list of neighbours, O(V + E) memory — good for sparse graphs (most real graphs).', level: 'Medium' },
    { q: 'Why is visited[] needed in graph traversal but not in tree traversal?', a: 'A tree has no cycles and each node has one parent, so you never reach a node twice. A graph can have cycles (0-1-3-5-4-2-0), so without visited[] BFS/DFS would loop forever.', level: 'Easy' },
    { q: 'Which Java classes would you use for stack, queue and BST in a real project?', a: 'ArrayDeque for stack (push/pop) and queue (offer/poll), PriorityQueue for a heap, TreeMap/TreeSet for a sorted balanced BST. Avoid java.util.Stack (legacy, synchronized, extends Vector).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Find the middle element of a linked list 1->2->3->4->5 in a single pass using slow/fast pointers. Also detect whether a list has a cycle.',
      hint: 'slow = slow.next; fast = fast.next.next. If fast meets slow, there is a cycle.',
      solution: `public class Main {
    static class Node { int data; Node next; Node(int d) { data = d; } }

    static Node middle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
        }
        return slow;
    }

    static boolean hasCycle(Node head) {
        Node slow = head, fast = head;
        while (fast != null && fast.next != null) {
            slow = slow.next;
            fast = fast.next.next;
            if (slow == fast) return true;
        }
        return false;
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        Node cur = head;
        for (int i = 2; i <= 5; i++) { cur.next = new Node(i); cur = cur.next; }
        System.out.println("Middle: " + middle(head).data);   // 3
        System.out.println("Cycle: " + hasCycle(head));         // false
        cur.next = head.next;                                   // 5 -> 2 makes a loop
        System.out.println("Cycle: " + hasCycle(head));         // true
    }
}`,
    },
    {
      task: 'Implement a Queue using two stacks (enqueue, dequeue). Test with enqueue 1,2,3, dequeue, enqueue 4, then dequeue all.',
      hint: 'Push into "in" stack. For dequeue, if "out" is empty move everything from "in" to "out", then pop from "out".',
      solution: `import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static class QueueWithStacks {
        private final Deque<Integer> in = new ArrayDeque<>();
        private final Deque<Integer> out = new ArrayDeque<>();

        void enqueue(int x) { in.push(x); }

        int dequeue() {
            if (out.isEmpty()) {
                while (!in.isEmpty()) out.push(in.pop());
            }
            if (out.isEmpty()) throw new RuntimeException("Queue is empty");
            return out.pop();
        }

        boolean isEmpty() { return in.isEmpty() && out.isEmpty(); }
    }

    public static void main(String[] args) {
        QueueWithStacks q = new QueueWithStacks();
        q.enqueue(1); q.enqueue(2); q.enqueue(3);
        System.out.println(q.dequeue());     // 1
        q.enqueue(4);
        while (!q.isEmpty()) System.out.print(q.dequeue() + " ");   // 2 3 4
    }
}`,
    },
    {
      task: 'In the BST from the example, count leaf nodes, count total nodes and find the sum of all keys.',
      hint: 'A leaf has left == null and right == null. Use recursion: count(left) + count(right) + 1.',
      solution: `public class Main {
    static class Node { int key; Node left, right; Node(int k) { key = k; } }

    static Node insert(Node r, int k) {
        if (r == null) return new Node(k);
        if (k < r.key) r.left = insert(r.left, k);
        else if (k > r.key) r.right = insert(r.right, k);
        return r;
    }

    static int countNodes(Node r) { return r == null ? 0 : 1 + countNodes(r.left) + countNodes(r.right); }

    static int countLeaves(Node r) {
        if (r == null) return 0;
        if (r.left == null && r.right == null) return 1;
        return countLeaves(r.left) + countLeaves(r.right);
    }

    static int sum(Node r) { return r == null ? 0 : r.key + sum(r.left) + sum(r.right); }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        System.out.println("Nodes: " + countNodes(root));    // 7
        System.out.println("Leaves: " + countLeaves(root));  // 4
        System.out.println("Sum: " + sum(root));             // 350
    }
}`,
    },
    {
      task: 'Delete a node from a BST (handle leaf, one child and two children cases). Delete 30 from the example tree and print inorder.',
      hint: 'For two children: replace the key with the inorder successor (smallest in right subtree), then delete that successor from the right subtree.',
      solution: `public class Main {
    static class Node { int key; Node left, right; Node(int k) { key = k; } }

    static Node insert(Node r, int k) {
        if (r == null) return new Node(k);
        if (k < r.key) r.left = insert(r.left, k);
        else if (k > r.key) r.right = insert(r.right, k);
        return r;
    }

    static Node delete(Node r, int k) {
        if (r == null) return null;
        if (k < r.key) r.left = delete(r.left, k);
        else if (k > r.key) r.right = delete(r.right, k);
        else {
            if (r.left == null) return r.right;      // leaf or only right child
            if (r.right == null) return r.left;      // only left child
            Node succ = r.right;                     // two children
            while (succ.left != null) succ = succ.left;
            r.key = succ.key;
            r.right = delete(r.right, succ.key);
        }
        return r;
    }

    static void inorder(Node r) {
        if (r == null) return;
        inorder(r.left);
        System.out.print(r.key + " ");
        inorder(r.right);
    }

    public static void main(String[] args) {
        Node root = null;
        for (int k : new int[]{50, 30, 70, 20, 40, 60, 80}) root = insert(root, k);
        root = delete(root, 30);
        inorder(root);    // 20 40 50 60 70 80
    }
}`,
    },
    {
      task: 'Given a directed graph, check whether there is a path from source to destination using BFS. Edges: 0->1, 1->2, 2->3, 4->3. Check 0->3 and 3->0.',
      hint: 'Run BFS from the source; if destination gets visited, a path exists. For directed graphs add the edge only one way.',
      solution: `import java.util.*;

public class Main {
    static boolean hasPath(List<List<Integer>> adj, int src, int dest) {
        boolean[] visited = new boolean[adj.size()];
        Queue<Integer> q = new ArrayDeque<>();
        q.offer(src);
        visited[src] = true;
        while (!q.isEmpty()) {
            int node = q.poll();
            if (node == dest) return true;
            for (int next : adj.get(node)) {
                if (!visited[next]) { visited[next] = true; q.offer(next); }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        List<List<Integer>> adj = new ArrayList<>();
        for (int i = 0; i < 5; i++) adj.add(new ArrayList<>());
        adj.get(0).add(1);
        adj.get(1).add(2);
        adj.get(2).add(3);
        adj.get(4).add(3);
        System.out.println("0 -> 3: " + hasPath(adj, 0, 3));   // true
        System.out.println("3 -> 0: " + hasPath(adj, 3, 0));   // false
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the time complexity of accessing the 50th element of a singly linked list?',
      options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
      answer: 2,
      explanation: 'You must walk from the head node by node, so access by position is O(n).',
    },
    {
      question: 'Which traversal of a Binary Search Tree prints keys in sorted order?',
      options: ['Inorder', 'Preorder', 'Postorder', 'Level order'],
      answer: 0,
      explanation: 'Inorder visits Left, Root, Right — all smaller keys before the node and bigger keys after it.',
    },
    {
      question: 'Which data structure does BFS use internally?',
      options: ['Stack', 'Queue', 'Tree', 'Hash table'],
      answer: 1,
      explanation: 'BFS processes nodes level by level in FIFO order, so it uses a queue. DFS uses a stack (or recursion).',
    },
    {
      question: 'In a circular queue of capacity 5 with rear = 4, where is the next element added (if space is available)?',
      options: ['Index 5', 'Index 4', 'It throws an exception always', 'Index 0'],
      answer: 3,
      explanation: 'rear = (4 + 1) % 5 = 0, so the element wraps around to index 0.',
    },
    {
      question: 'Which java.util class is recommended for a stack in modern Java?',
      options: ['Vector', 'Stack', 'ArrayDeque', 'Hashtable'],
      answer: 2,
      explanation: 'ArrayDeque is fast and unsynchronized. java.util.Stack is a legacy class that extends Vector and is synchronized.',
    },
  ],
};
