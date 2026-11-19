export default {
  lesson: 'day-08-queue-deque-priorityqueue-arraydeque',
  minutes: 20,
  intro: 'Use Queue methods, PriorityQueue (min-heap/max-heap/custom) and ArrayDeque as both queue and stack.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'PriorityQueue: what does this program print? (polling, not printing the queue)',
      example: {
        title: 'min-heap by default',
        code: `PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(3, 1, 2));
pq.poll(); // 1`,
      },
      code: `import java.util.*;

public class Main {
    record Patient(String name, int severity) {}

    public static void main(String[] args) {
        PriorityQueue<Integer> min = new PriorityQueue<>();
        PriorityQueue<Integer> max = new PriorityQueue<>(Collections.reverseOrder());
        for (int n : new int[]{30, 10, 50, 20}) { min.offer(n); max.offer(n); }
        while (!min.isEmpty()) System.out.print(min.poll() + " ");
        System.out.println();
        System.out.println(max.poll() + " " + max.peek());

        PriorityQueue<Patient> er = new PriorityQueue<>(
            Comparator.comparingInt(Patient::severity).reversed());
        er.add(new Patient("Asha", 3));
        er.add(new Patient("Ravi", 9));
        er.add(new Patient("Om", 5));
        System.out.println(er.poll().name() + " " + er.poll().name());
    }
}`,
      expected: `10 20 30 50 
50 30
Ravi Om`,
      explain: 'A PriorityQueue always hands out the **smallest** element first (min-heap). `Collections.reverseOrder()` turns it into a max-heap. A Comparator can define any priority: here the highest severity is treated first. Printing a PriorityQueue directly shows heap order, which is not fully sorted — always use poll() to get sorted output.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Queue and Deque methods: what does this program print?',
      example: {
        title: 'FIFO queue',
        code: `Queue<String> q = new ArrayDeque<>();
q.offer("A"); q.offer("B");
q.poll(); // "A"`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Queue<String> tickets = new ArrayDeque<>();
        tickets.offer("T1");
        tickets.offer("T2");
        tickets.offer("T3");
        System.out.println(tickets.peek() + " " + tickets.poll());
        System.out.println(tickets);

        Deque<Integer> stack = new ArrayDeque<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println(stack.pop() + " " + stack);

        Queue<String> empty = new ArrayDeque<>();
        System.out.println(empty.poll());
        try {
            empty.remove();
        } catch (NoSuchElementException e) {
            System.out.println("remove() threw");
        }
    }
}`,
      expected: `T1 T1
[T2, T3]
3 [2, 1]
null
remove() threw`,
      explain: 'A queue is FIFO: peek reads T1, poll removes it. Used as a stack, ArrayDeque pushes at the **front**, so after popping 3 it prints [2, 1]. On an empty queue `poll()`/`peek()` return **null**, while `remove()`/`element()` **throw** NoSuchElementException.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a **max-heap** of Integers (largest polled first):
\`PriorityQueue<Integer> pq = ____;\``,
      example: { title: 'a heap ordered by String length', code: 'new PriorityQueue<>(Comparator.comparingInt(String::length))' },
      accept: [
        'new PriorityQueue<>(Collections.reverseOrder())',
        'new PriorityQueue<>(Comparator.reverseOrder())',
        'new PriorityQueue<>((a, b) -> b - a)',
        'new PriorityQueue<>((a, b) -> b.compareTo(a))',
        'new PriorityQueue<Integer>(Collections.reverseOrder())',
      ],
      acceptRegex: [
        '^new\\s+PriorityQueue\\s*<\\s*>\\s*\\(\\s*Collections\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+PriorityQueue\\s*<\\s*>\\s*\\(\\s*Comparator\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+PriorityQueue\\s*<\\s*>\\s*\\(\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*-\\s*a\\s*\\)\\s*[;{]?$',
        '^new\\s+PriorityQueue\\s*<\\s*>\\s*\\(\\s*\\(\\s*a\\s*,\\s*b\\s*\\)\\s*-\\s*>\\s*b\\s*\\.\\s*compareTo\\s*\\(\\s*a\\s*\\)\\s*\\)\\s*[;{]?$',
        '^new\\s+PriorityQueue\\s*<\\s*Integer\\s*>\\s*\\(\\s*Collections\\s*\\.\\s*reverseOrder\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Pass a reversing Comparator. `(a, b) -> b - a` also works for small ints, but `Collections.reverseOrder()` avoids any overflow risk.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Which Queue method adds an element and returns **false** (instead of throwing) if a capacity-limited queue is full?
\`boolean ok = q.____(item);\``,
      example: { title: 'the throwing version', code: 'q.add(item); // IllegalStateException if full' },
      accept: ['offer'],
      acceptRegex: ['^offer\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Each Queue operation has two forms: throw (add/remove/element) or return a special value (offer/poll/peek). The special-value methods are preferred in most code.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How is a PriorityQueue stored internally?',
      options: ['As a sorted linked list', 'As a binary heap in an array', 'As a Red-Black tree', 'As a hash table'],
      answer: 1,
      explain: 'It is a **binary heap** stored in an array: the root (index 0) is always the smallest. offer and poll are O(log n), peek is O(1). The array is not fully sorted, which is why its toString looks unordered.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'You need both a fast FIFO queue and a fast stack in single-threaded code. Which class does the Java documentation recommend?',
      options: ['Stack', 'LinkedList', 'ArrayDeque', 'Vector'],
      answer: 2,
      explain: '**ArrayDeque** is a resizable circular array: O(1) at both ends, no node objects and no synchronization. It is faster than Stack (synchronized, Vector-based) and LinkedList. It does not allow null.',
    },
  ],
};
