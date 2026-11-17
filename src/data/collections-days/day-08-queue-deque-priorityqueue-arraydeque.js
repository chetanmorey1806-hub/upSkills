const ex1 = `import java.util.ArrayDeque;
import java.util.NoSuchElementException;
import java.util.Queue;

public class Main {
    public static void main(String[] args) {
        Queue<String> counter = new ArrayDeque<>();
        counter.offer("Customer1");
        counter.offer("Customer2");
        counter.offer("Customer3");
        System.out.println("Queue: " + counter);
        System.out.println("Next: " + counter.peek());

        while (!counter.isEmpty()) {
            System.out.println("Serving " + counter.poll());
        }

        System.out.println("poll on empty: " + counter.poll());
        try {
            counter.remove();
        } catch (NoSuchElementException e) {
            System.out.println("remove on empty: NoSuchElementException");
        }
    }
}`;

const ex2 = `import java.util.Comparator;
import java.util.List;
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Integer> min = new PriorityQueue<>(List.of(40, 10, 30, 20, 50));
        System.out.println("peek of min-heap: " + min.peek());
        StringBuilder sb = new StringBuilder();
        while (!min.isEmpty()) {
            sb.append(min.poll()).append(" ");
        }
        System.out.println("Min-heap order: " + sb.toString().trim());

        PriorityQueue<Integer> max = new PriorityQueue<>(Comparator.reverseOrder());
        max.addAll(List.of(40, 10, 30, 20, 50));
        System.out.println("peek of max-heap: " + max.peek());
        StringBuilder sb2 = new StringBuilder();
        while (!max.isEmpty()) {
            sb2.append(max.poll()).append(" ");
        }
        System.out.println("Max-heap order: " + sb2.toString().trim());
    }
}`;

const ex3 = `import java.util.Comparator;
import java.util.PriorityQueue;

record Patient(String name, int severity, int token) { }

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Patient> er = new PriorityQueue<>(
                Comparator.comparingInt(Patient::severity).reversed()
                          .thenComparingInt(Patient::token));

        er.add(new Patient("Asha", 2, 1));
        er.add(new Patient("Bilal", 5, 2));
        er.add(new Patient("Chen", 3, 3));
        er.add(new Patient("Dia", 5, 4));

        while (!er.isEmpty()) {
            Patient p = er.poll();
            System.out.println("Treating " + p.name() + " (severity " + p.severity() + ")");
        }
    }
}`;

const ex4 = `import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    public static void main(String[] args) {
        Deque<Integer> dq = new ArrayDeque<>();
        dq.offerLast(20);
        dq.offerLast(30);
        dq.offerFirst(10);
        dq.offerLast(40);
        System.out.println(dq);
        System.out.println("peekFirst: " + dq.peekFirst() + ", peekLast: " + dq.peekLast());
        dq.pollFirst();
        dq.pollLast();
        System.out.println(dq);

        // ArrayDeque as a stack for undo
        Deque<String> undo = new ArrayDeque<>();
        undo.push("type A");
        undo.push("type B");
        undo.push("delete");
        System.out.println("Undo: " + undo.pop());
        System.out.println("Undo: " + undo.pop());
        System.out.println("Remaining: " + undo);
    }
}`;

export default {
  id: 'day-08-queue-deque-priorityqueue-arraydeque',
  title: 'Queue and Deque: PriorityQueue, ArrayDeque',
  module: 'Module 2: Sets, Queues & Maps',
  day: 8,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Learn FIFO queues, priority-based processing with PriorityQueue (binary heap), and double-ended queues with ArrayDeque - the modern replacement for both Stack and LinkedList-as-queue.',
  objectives: [
    'Use Queue methods and know which ones throw vs return special values',
    'Explain how PriorityQueue orders elements using a binary heap',
    'Build min-heaps, max-heaps and custom-priority queues',
    'Use ArrayDeque as both a queue and a stack',
  ],
  theory: [
    {
      heading: 'Queue interface',
      content:
        'A Queue holds elements waiting to be processed, usually in First-In-First-Out (FIFO) order - like people standing at a railway ticket counter. New people join at the tail; the person at the head is served first.',
      syntax: `             Throws exception    Returns special value
Insert       add(e)              offer(e)   -> false if full
Remove head  remove()            poll()     -> null if empty
Examine head element()           peek()     -> null if empty`,
      tip: 'In interviews say: "I prefer offer/poll/peek because they do not throw exceptions on empty or bounded queues."',
    },
    {
      heading: 'PriorityQueue',
      content:
        'PriorityQueue does not follow FIFO. It always gives you the element with the HIGHEST priority, which by default is the SMALLEST element (natural order). Think of a hospital emergency room: the most serious patient is treated first, not the one who came first. Internally it uses a binary min-heap stored in an array.',
      points: [
        'offer/add and poll: O(log n); peek: O(1); contains/remove(Object): O(n)',
        'Only the head is guaranteed to be the smallest; printing the queue or iterating does NOT show sorted order',
        'Does not allow null; elements must be Comparable or you must pass a Comparator',
        'Max-heap: new PriorityQueue<>(Comparator.reverseOrder())',
        'Not thread-safe; use PriorityBlockingQueue for threads',
      ],
    },
    {
      heading: 'Binary heap in words',
      content:
        'A min-heap is a complete binary tree where every parent is smaller than or equal to its children. The smallest element sits at the root (index 0 of the array). For a node at index i, children are at 2i+1 and 2i+2, parent at (i-1)/2. When you poll, the last element is moved to the root and "sifts down"; when you offer, the new element "sifts up". That is why both operations are O(log n).',
      syntax: `Array: [10, 20, 30, 40, 50]
            10
          /    \\
        20      30
       /  \\
     40    50`,
    },
    {
      heading: 'Deque and ArrayDeque',
      content:
        'Deque (pronounced "deck") is a double-ended queue - you can add and remove at both ends, like a line of people where VIPs can join at the front. ArrayDeque implements it with a resizable circular array. It is faster than Stack (no synchronization) and faster than LinkedList (no node objects) for queue and stack use.',
      syntax: `offerFirst(e) offerLast(e)   pollFirst() pollLast()
peekFirst()  peekLast()      push(e) = offerFirst  pop() = removeFirst
Queue use: offer/poll        Stack use: push/pop`,
      points: [
        'No null elements allowed (null is used as "empty" signal)',
        'Not thread-safe',
        'Amortized O(1) at both ends',
      ],
    },
    {
      heading: 'Which queue to use?',
      content: 'Choose based on behaviour you need.',
      points: [
        'Plain FIFO queue -> ArrayDeque',
        'Stack (LIFO) -> ArrayDeque with push/pop',
        'Process by priority (smallest/largest first, task scheduling, top-K problems) -> PriorityQueue',
        'Producer-consumer between threads -> BlockingQueue (ArrayBlockingQueue, LinkedBlockingQueue)',
        'Need nulls or index access too -> LinkedList',
      ],
    },
  ],
  examples: [
    {
      title: 'FIFO queue at a ticket counter',
      scenario: 'Serve customers in arrival order and see how poll() and remove() behave on an empty queue.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Queue: [Customer1, Customer2, Customer3]
Next: Customer1
Serving Customer1
Serving Customer2
Serving Customer3
poll on empty: null
remove on empty: NoSuchElementException`,
      explanation: 'offer adds at the tail, poll removes from the head. On an empty queue poll() returns null while remove() throws NoSuchElementException.',
    },
    {
      title: 'Min-heap and max-heap with PriorityQueue',
      scenario: 'Process numbers smallest-first and largest-first.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `peek of min-heap: 10
Min-heap order: 10 20 30 40 50
peek of max-heap: 50
Max-heap order: 50 40 30 20 10`,
      explanation:
        'We repeatedly poll() to get elements in priority order. Printing the PriorityQueue itself would show internal heap array order, which is not fully sorted. Comparator.reverseOrder() turns it into a max-heap.',
    },
    {
      title: 'Hospital emergency room',
      scenario: 'Treat patients with higher severity first; if equal, the one with the smaller token (who came earlier) first.',
      steps: ['Create Main.java with the Patient record and Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Treating Bilal (severity 5)
Treating Dia (severity 5)
Treating Chen (severity 3)
Treating Asha (severity 2)`,
      explanation:
        'reversed() makes higher severity come first; thenComparingInt(token) breaks the tie between Bilal (token 2) and Dia (token 4).',
    },
    {
      title: 'ArrayDeque as deque and as undo stack',
      scenario: 'Add/remove at both ends, then use push/pop for an editor\'s undo feature.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `[10, 20, 30, 40]
peekFirst: 10, peekLast: 40
[20, 30]
Undo: delete
Undo: type B
Remaining: [type A]`,
      explanation:
        'offerFirst puts 10 at the front. pollFirst removes 10 and pollLast removes 40. push/pop work on the front, so the last action "delete" is undone first.',
    },
  ],
  interview: [
    { q: 'Difference between offer() and add() in Queue?', a: 'Both insert. For capacity-restricted queues add() throws IllegalStateException when full, offer() returns false. For unbounded queues they behave the same.', level: 'Easy' },
    { q: 'Difference between poll() and remove()?', a: 'Both remove the head. poll() returns null on an empty queue; remove() throws NoSuchElementException.', level: 'Easy' },
    { q: 'How does PriorityQueue work internally?', a: 'It uses a binary heap stored in an array (min-heap by natural order or by Comparator). offer sifts up, poll moves the last element to the root and sifts down - both O(log n). peek is O(1).', level: 'Medium' },
    { q: 'Output? PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(5,1,3)); pq.poll(); System.out.println(pq.peek());', a: '3. poll removes 1 (smallest), then the smallest remaining is 3.', level: 'Medium' },
    { q: 'Is the toString() of a PriorityQueue sorted?', a: 'No. It shows the internal heap array; only the head is guaranteed to be the minimum. Use repeated poll() to get sorted order.', level: 'Hard' },
    { q: 'How do you create a max-heap in Java?', a: 'new PriorityQueue<>(Comparator.reverseOrder()) or new PriorityQueue<>((a, b) -> b - a) (careful of overflow; prefer Integer.compare(b, a)).', level: 'Easy' },
    { q: 'Why is ArrayDeque preferred over Stack and LinkedList?', a: 'It is not synchronized (faster than Stack), uses a compact circular array without node objects (faster and less memory than LinkedList), and supports both stack and queue operations.', level: 'Medium' },
    { q: 'Can ArrayDeque or PriorityQueue store null?', a: 'No. Both throw NullPointerException, because null is used as the return value for "empty" in poll/peek.', level: 'Medium' },
    { q: 'How to find the K largest elements using PriorityQueue?', a: 'Use a min-heap of size K: add each element, and when size exceeds K, poll the smallest. At the end the heap holds the K largest. O(n log k).', level: 'Hard' },
    { q: 'What is a Deque?', a: 'A double-ended queue supporting insertion and removal at both ends. Implementations: ArrayDeque, LinkedList, ConcurrentLinkedDeque, LinkedBlockingDeque.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Find the 3 largest numbers from {7, 2, 9, 4, 11, 5} using a min-heap of size 3.',
      hint: 'offer each number; if size > 3 poll().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] arr = {7, 2, 9, 4, 11, 5};
        PriorityQueue<Integer> pq = new PriorityQueue<>();
        for (int x : arr) {
            pq.offer(x);
            if (pq.size() > 3) pq.poll();
        }
        List<Integer> top = new ArrayList<>();
        while (!pq.isEmpty()) top.add(pq.poll());
        System.out.println(top); // [7, 9, 11]
    }
}`,
    },
    {
      task: 'Simulate a printer queue: jobs "doc1", "doc2", "doc3" are printed in FIFO order with ArrayDeque.',
      hint: 'offer then poll in a loop.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Queue<String> printer = new ArrayDeque<>(List.of("doc1", "doc2", "doc3"));
        while (!printer.isEmpty()) System.out.println("Printing " + printer.poll());
    }
}`,
    },
    {
      task: 'Sort tasks by priority (1 = highest) using PriorityQueue of a Task record(name, priority) and print their names.',
      hint: 'Comparator.comparingInt(Task::priority).',
      solution: `import java.util.*;

record Task(String name, int priority) { }

public class Main {
    public static void main(String[] args) {
        PriorityQueue<Task> pq = new PriorityQueue<>(Comparator.comparingInt(Task::priority));
        pq.add(new Task("Email", 3));
        pq.add(new Task("Bug fix", 1));
        pq.add(new Task("Meeting", 2));
        while (!pq.isEmpty()) System.out.println(pq.poll().name());
        // Bug fix, Meeting, Email
    }
}`,
    },
    {
      task: 'Check if a string is a palindrome using ArrayDeque (pollFirst vs pollLast).',
      hint: 'Same idea as Day 3 but with ArrayDeque<Character>.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "racecar";
        Deque<Character> dq = new ArrayDeque<>();
        for (char c : s.toCharArray()) dq.offerLast(c);
        boolean ok = true;
        while (dq.size() > 1) {
            if (!dq.pollFirst().equals(dq.pollLast())) { ok = false; break; }
        }
        System.out.println(ok); // true
    }
}`,
    },
  ],
  quiz: [
    { question: 'Default ordering of PriorityQueue<Integer>:', options: ['Insertion order', 'Smallest first', 'Largest first', 'Random'], answer: 1, explanation: 'Natural ordering makes it a min-heap.' },
    { question: 'Which method returns null on an empty queue?', options: ['remove()', 'element()', 'poll()', 'pop()'], answer: 2, explanation: 'poll() and peek() return null when empty.' },
    { question: 'ArrayDeque push(e) is equivalent to:', options: ['addFirst(e)', 'addLast(e)', 'offer(e)', 'add(e)'], answer: 0, explanation: 'Stack operations work at the front (head) of the deque.' },
    { question: 'Time complexity of poll() in PriorityQueue:', options: ['O(1)', 'O(n)', 'O(n log n)', 'O(log n)'], answer: 3, explanation: 'Removing the root requires sift-down: O(log n).' },
    { question: 'Which of these allows null elements?', options: ['ArrayDeque', 'PriorityQueue', 'LinkedList', 'None of them'], answer: 2, explanation: 'LinkedList permits null; ArrayDeque and PriorityQueue do not.' },
  ],
};
