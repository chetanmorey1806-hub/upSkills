export default {
  lesson: 'day-03-linkedlist-vs-arraylist',
  minutes: 18,
  intro: 'Use LinkedList as a List, Queue and Stack, and choose between ArrayList and LinkedList.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'LinkedList as list, queue and stack: what does this program print?',
      example: {
        title: 'adding at both ends',
        code: `LinkedList<Integer> l = new LinkedList<>();
l.addFirst(2);
l.addFirst(1);
l.addLast(3); // [1, 2, 3]`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> ll = new LinkedList<>(List.of("B", "C"));
        ll.addFirst("A");
        ll.addLast("D");
        ll.add(2, "X");
        System.out.println(ll);
        System.out.println(ll.removeFirst() + " " + ll.removeLast());
        ll.push("P");
        System.out.println(ll.pop());
        ll.offer("Q");
        System.out.println(ll.poll());
        System.out.println(ll.peekLast());
        System.out.println(ll);
    }
}`,
      expected: `[A, B, X, C, D]
A D
P
B
Q
[X, C, Q]`,
      explain: '`push`/`pop` work at the **front** (stack style), `offer` adds at the **end** and `poll` removes from the **front** (queue style). After removing A and D, pushing and popping P, adding Q and polling B, the list is [X, C, Q].',
    },
    {
      type: 'output',
      mins: 3,
      q: 'A hand-made singly linked list: what does this program print?',
      example: {
        title: 'a node',
        code: `class Node {
  int data;
  Node next;
  Node(int d) { data = d; }
}`,
      },
      code: `class Node {
    int data;
    Node next;
    Node(int data) { this.data = data; }
}

public class Main {
    public static void main(String[] args) {
        Node head = new Node(10);
        head.next = new Node(20);
        head.next.next = new Node(30);

        Node n = new Node(5);
        n.next = head;
        head = n;

        head.next.next = head.next.next.next;

        int count = 0;
        for (Node cur = head; cur != null; cur = cur.next) {
            System.out.print(cur.data + " -> ");
            count++;
        }
        System.out.println("null");
        System.out.println(count);
    }
}`,
      expected: `5 -> 10 -> 30 -> null
3`,
      explain: 'Inserting at the head just points the new node to the old head (O(1)). `head.next.next = head.next.next.next` makes node 10 skip node 20, removing it from the chain. Traversal follows `next` until null.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the call that removes and returns the **first** element of \`LinkedList<String> tasks\` (throws if empty):
\`String t = tasks.____;\``,
      example: { title: 'reading without removing', code: 'String first = tasks.getFirst();' },
      accept: ['removeFirst()', 'remove()', 'pop()'],
      acceptRegex: ['^removeFirst\\s*\\(\\s*\\)\\s*[;{]?$', '^remove\\s*\\(\\s*\\)\\s*[;{]?$', '^pop\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`removeFirst()` (also `remove()` and `pop()`) removes the head and throws NoSuchElementException on an empty list. `pollFirst()`/`poll()` return null instead of throwing.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'What is the time complexity (Big-O) of `linkedList.get(i)` for an index in the middle?',
      example: { title: 'ArrayList for comparison', text: '`arrayList.get(i)` is O(1) because it computes the address directly.' },
      accept: ['O(n)', 'o(n)', 'n', 'linear'],
      explain: 'A LinkedList has no index array: it walks node by node from the nearer end, so get(i) is **O(n)**. Looping with `for (int i...) list.get(i)` over a LinkedList is therefore O(n²) — use for-each or an Iterator.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You mostly **read elements by index** and append at the end. Which list should you use?',
      options: ['LinkedList', 'ArrayList', 'Both are equally good', 'Vector'],
      answer: 1,
      explain: 'ArrayList gives O(1) random access and amortised O(1) appends with better cache locality and less memory (no node objects). LinkedList only wins when you insert/remove a lot at the ends or through an iterator.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Java\'s LinkedList are TRUE? (choose all that apply)',
      options: [
        'It is a doubly linked list',
        'It implements both List and Deque',
        'Each element uses extra memory for prev/next references',
        'It cannot store null',
        'addFirst is O(1)',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Each node holds the item plus `prev` and `next` references, so it costs more memory. Implementing Deque gives it queue and stack methods, and adding at either end is O(1). It does allow null.',
    },
  ],
};
