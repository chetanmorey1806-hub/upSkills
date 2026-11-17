const ex1 = `import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> train = new LinkedList<>();
        train.add("Coach-B");
        train.add("Coach-C");
        train.addFirst("Engine");
        train.addLast("Guard");
        System.out.println(train);

        train.add(1, "Coach-A");
        System.out.println(train);
        System.out.println("First: " + train.getFirst());
        System.out.println("Last: " + train.getLast());

        train.removeLast();
        train.remove("Coach-B");
        System.out.println(train);
    }
}`;

const ex2 = `import java.util.LinkedList;

public class Main {
    public static void main(String[] args) {
        // LinkedList as a Queue (FIFO)
        LinkedList<Integer> queue = new LinkedList<>();
        queue.offer(1);
        queue.offer(2);
        queue.offer(3);
        System.out.println("Queue: " + queue);
        System.out.println("poll: " + queue.poll());
        System.out.println("peek: " + queue.peek());
        System.out.println("Queue now: " + queue);

        // LinkedList as a Stack (LIFO)
        LinkedList<Integer> stack = new LinkedList<>();
        stack.push(10);
        stack.push(20);
        stack.push(30);
        System.out.println("Stack: " + stack);
        System.out.println("pop: " + stack.pop());
        System.out.println("Stack now: " + stack);
    }
}`;

const ex3 = `class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
    }
}

class MyLinkedList {
    Node head;
    int size;

    void addLast(int d) {
        Node n = new Node(d);
        if (head == null) {
            head = n;
        } else {
            Node t = head;
            while (t.next != null) t = t.next;   // walk to the end
            t.next = n;
        }
        size++;
    }

    void addFirst(int d) {
        Node n = new Node(d);
        n.next = head;
        head = n;
        size++;
    }

    void print() {
        StringBuilder sb = new StringBuilder();
        Node t = head;
        while (t != null) {
            sb.append(t.data);
            if (t.next != null) sb.append(" -> ");
            t = t.next;
        }
        System.out.println(sb + " (size " + size + ")");
    }
}

public class Main {
    public static void main(String[] args) {
        MyLinkedList list = new MyLinkedList();
        list.addLast(20);
        list.addLast(30);
        list.addFirst(10);
        list.print();
        list.addLast(40);
        list.print();
    }
}`;

const ex4 = `import java.util.LinkedList;

public class Main {
    static boolean isPalindrome(String s) {
        LinkedList<Character> dq = new LinkedList<>();
        for (char c : s.toCharArray()) dq.add(c);
        while (dq.size() > 1) {
            if (!dq.pollFirst().equals(dq.pollLast())) return false;
        }
        return true;
    }

    public static void main(String[] args) {
        String[] words = {"madam", "level", "java"};
        for (String w : words) {
            System.out.println(w + " -> " + isPalindrome(w));
        }
    }
}`;

export default {
  id: 'day-03-linkedlist-vs-arraylist',
  title: 'LinkedList, ArrayList vs LinkedList',
  module: 'Module 1: Collections Basics & Lists',
  day: 3,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Understand LinkedList as a doubly linked list of nodes, use it as a List, Queue and Stack, and learn exactly when to choose ArrayList or LinkedList.',
  objectives: [
    'Explain the internal node structure of LinkedList',
    'Use LinkedList-specific methods: addFirst, addLast, getFirst, removeLast, offer, poll, push, pop',
    'Build a tiny singly linked list yourself to understand nodes and pointers',
    'Compare ArrayList and LinkedList in performance and memory',
  ],
  theory: [
    {
      heading: 'What is a LinkedList?',
      content:
        'A LinkedList stores each element in a separate Node object. Each node knows its data, the next node and the previous node (doubly linked). Think of a train: every coach is hooked to the coach before and after it. To add a coach in the middle you just unhook and re-hook two links - no need to shift every coach like in an array.',
      syntax: `null <- [prev|10|next] <-> [prev|20|next] <-> [prev|30|next] -> null
           ^ first                                  ^ last

private static class Node<E> {
    E item;
    Node<E> next;
    Node<E> prev;
}`,
      points: [
        'Java\'s LinkedList keeps references to both first and last nodes',
        'Implements List AND Deque, so it can work as list, queue and stack',
        'Allows duplicates and null; preserves insertion order; not synchronized',
      ],
    },
    {
      heading: 'Important LinkedList methods',
      content: 'Besides all List methods, LinkedList offers Deque methods for both ends.',
      syntax: `addFirst(e) / addLast(e)     offerFirst(e) / offerLast(e)
getFirst() / getLast()       peekFirst() / peekLast()
removeFirst() / removeLast() pollFirst() / pollLast()
push(e) = addFirst(e)        pop() = removeFirst()
offer(e) = addLast(e)        poll() = pollFirst()   peek() = peekFirst()`,
      points: [
        'getFirst/removeFirst throw NoSuchElementException on an empty list',
        'peek/poll return null on an empty list (safer)',
      ],
    },
    {
      heading: 'Performance: ArrayList vs LinkedList',
      content:
        'ArrayList is like a row of numbered lockers - you can open locker 500 instantly. LinkedList is like a treasure hunt - to reach clue 500 you must follow 500 links (Java starts from whichever end is closer). But inserting into a LinkedList at a known position only changes two links.',
      points: [
        'get(i): ArrayList O(1), LinkedList O(n)',
        'add at end: both O(1) (ArrayList amortized)',
        'add/remove at beginning: ArrayList O(n) (shifting), LinkedList O(1)',
        'add/remove in middle via iterator: LinkedList O(1) once positioned; ArrayList O(n)',
        'Memory: LinkedList uses more (each node stores 2 extra references); ArrayList is compact and CPU-cache friendly',
      ],
    },
    {
      heading: 'Which one should I use?',
      content:
        'In real projects ArrayList is the default choice in more than 90% of cases because random access and iteration are faster and it uses less memory. Choose LinkedList when you mostly add/remove at the beginning or end (queue / deque behaviour) - though ArrayDeque is usually even better for that (Day 8).',
      tip: 'Interview line: "ArrayList for read-heavy, index-based access; LinkedList for frequent insertion/deletion at the ends or via iterator."',
    },
    {
      heading: 'Common mistakes',
      content: 'Avoid these with LinkedList.',
      points: [
        'Looping with for (i...) list.get(i) on a big LinkedList - this is O(n²). Use for-each or Iterator',
        'Assuming LinkedList is always faster for insertion - finding the position is still O(n)',
        'Calling getFirst() on an empty list - NoSuchElementException',
      ],
    },
  ],
  examples: [
    {
      title: 'LinkedList as a train of coaches',
      scenario: 'Add coaches at the front, back and middle, then remove some.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `[Engine, Coach-B, Coach-C, Guard]
[Engine, Coach-A, Coach-B, Coach-C, Guard]
First: Engine
Last: Guard
[Engine, Coach-A, Coach-C]`,
      explanation:
        'addFirst puts Engine in front and addLast puts Guard at the end. add(1, ...) inserts after Engine. removeLast removes Guard and remove("Coach-B") removes that value.',
    },
    {
      title: 'LinkedList as Queue and Stack',
      scenario: 'A ticket counter (queue) and a pile of plates (stack) using the same class.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Queue: [1, 2, 3]
poll: 1
peek: 2
Queue now: [2, 3]
Stack: [30, 20, 10]
pop: 30
Stack now: [20, 10]`,
      explanation:
        'offer adds at the tail and poll removes from the head (FIFO). push adds at the head, so the last pushed (30) is printed first and popped first (LIFO).',
    },
    {
      title: 'Build your own singly linked list',
      scenario: 'Understand nodes and links by writing a mini linked list with addFirst, addLast and print.',
      steps: ['Create Main.java containing Node, MyLinkedList and Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `10 -> 20 -> 30 (size 3)
10 -> 20 -> 30 -> 40 (size 4)`,
      explanation:
        'addLast walks to the last node and links the new one (O(n) here because we keep no tail pointer; Java\'s LinkedList keeps a last pointer so it is O(1)). addFirst only changes the head reference - O(1).',
    },
    {
      title: 'Palindrome check with both ends',
      scenario: 'Use pollFirst and pollLast to compare characters from both ends of a word.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `madam -> true
level -> true
java -> false`,
      explanation:
        'Each loop removes one char from the front and one from the back and compares them with equals (Character objects). For "java", j != a so it returns false immediately.',
    },
  ],
  interview: [
    { q: 'How is LinkedList implemented internally in Java?', a: 'As a doubly linked list. Each Node has item, next and prev references; the list keeps first and last pointers and a size counter.', level: 'Easy' },
    { q: 'ArrayList vs LinkedList - key differences?', a: 'ArrayList uses a dynamic array: O(1) random access, O(n) insert/delete in the middle, less memory. LinkedList uses doubly linked nodes: O(n) random access, O(1) insert/delete at ends or at an iterator position, more memory. LinkedList also implements Deque.', level: 'Easy' },
    { q: 'Why is get(index) slow in LinkedList?', a: 'There is no array index; it must traverse node by node. Java optimizes by starting from the closer end, but it is still O(n).', level: 'Medium' },
    { q: 'Which interfaces does LinkedList implement?', a: 'List, Deque (and therefore Queue), Cloneable and Serializable.', level: 'Medium' },
    { q: 'Output? LinkedList<Integer> l = new LinkedList<>(); l.push(1); l.push(2); l.add(3); System.out.println(l);', a: '[2, 1, 3]. push adds to the front, add adds to the end.', level: 'Medium' },
    { q: 'Difference between poll() and remove() in LinkedList?', a: 'Both remove the head. poll() returns null if empty; remove() throws NoSuchElementException.', level: 'Easy' },
    { q: 'When would you prefer LinkedList over ArrayList?', a: 'When you frequently add/remove elements at the beginning/end or through an iterator while traversing, and rarely access by index.', level: 'Medium' },
    { q: 'Why is iterating a LinkedList with for(i) + get(i) a bad idea?', a: 'Each get(i) is O(n), so the loop becomes O(n²). Use for-each or an Iterator, which is O(n) total.', level: 'Hard' },
    { q: 'Does LinkedList allow null?', a: 'Yes, multiple nulls are allowed. But peek/poll returning null then becomes ambiguous, which is one reason ArrayDeque forbids null.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Create a LinkedList of 5 integers. Remove the first and last elements and print the remaining list.',
      hint: 'removeFirst() and removeLast().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedList<Integer> l = new LinkedList<>(List.of(1, 2, 3, 4, 5));
        l.removeFirst();
        l.removeLast();
        System.out.println(l); // [2, 3, 4]
    }
}`,
    },
    {
      task: 'Simulate browser history: visit 3 pages (push), then go back twice (pop) and print the current page.',
      hint: 'Use push/pop/peek on LinkedList.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedList<String> history = new LinkedList<>();
        history.push("google.com");
        history.push("youtube.com");
        history.push("github.com");
        history.pop();
        history.pop();
        System.out.println("Current: " + history.peek()); // Current: google.com
    }
}`,
    },
    {
      task: 'Extend MyLinkedList from Example 3 with a method removeFirst() and a method contains(int x).',
      hint: 'removeFirst: head = head.next; contains: walk the nodes.',
      solution: `class Node { int data; Node next; Node(int d) { data = d; } }

class MyLinkedList {
    Node head; int size;
    void addFirst(int d) { Node n = new Node(d); n.next = head; head = n; size++; }
    void removeFirst() { if (head != null) { head = head.next; size--; } }
    boolean contains(int x) {
        for (Node t = head; t != null; t = t.next) if (t.data == x) return true;
        return false;
    }
}

public class Main {
    public static void main(String[] args) {
        MyLinkedList l = new MyLinkedList();
        l.addFirst(3); l.addFirst(2); l.addFirst(1);
        l.removeFirst();
        System.out.println(l.contains(1)); // false
        System.out.println(l.contains(3)); // true
        System.out.println(l.size);        // 2
    }
}`,
    },
    {
      task: 'Rotate a LinkedList to the left by 2 positions: [1,2,3,4,5] -> [3,4,5,1,2].',
      hint: 'Repeat twice: addLast(removeFirst()).',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        LinkedList<Integer> l = new LinkedList<>(List.of(1, 2, 3, 4, 5));
        for (int i = 0; i < 2; i++) l.addLast(l.removeFirst());
        System.out.println(l); // [3, 4, 5, 1, 2]
    }
}`,
    },
  ],
  quiz: [
    { question: 'Java\'s LinkedList is a:', options: ['Singly linked list', 'Doubly linked list', 'Circular array', 'Binary tree'], answer: 1, explanation: 'Each node has next and prev references.' },
    { question: 'Time complexity of get(i) in LinkedList:', options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'], answer: 2, explanation: 'It must traverse nodes.' },
    { question: 'Output: LinkedList<Integer> s = new LinkedList<>(); s.push(1); s.push(2); System.out.println(s.pop());', options: ['1', 'null', '[1, 2]', '2'], answer: 3, explanation: 'Stack behaviour: last pushed is popped first.' },
    { question: 'Which method returns null instead of throwing an exception when the list is empty?', options: ['peekFirst()', 'getFirst()', 'removeFirst()', 'element()'], answer: 0, explanation: 'peek/poll methods return null on an empty deque.' },
    { question: 'Which list uses less memory per element?', options: ['LinkedList', 'ArrayList', 'Both same', 'Depends on JVM only'], answer: 1, explanation: 'LinkedList stores two extra references per node.' },
  ],
};
