const ex1 = `import java.util.Enumeration;
import java.util.List;
import java.util.Vector;

public class Main {
    public static void main(String[] args) {
        Vector<Integer> v = new Vector<>();
        System.out.println("Capacity: " + v.capacity());
        for (int i = 1; i <= 11; i++) {
            v.add(i * 10);
        }
        System.out.println("Size: " + v.size());
        System.out.println("Capacity: " + v.capacity());

        v.addElement(120);                    // legacy method
        System.out.println("First: " + v.firstElement() + ", Last: " + v.lastElement());
        v.removeElementAt(0);
        System.out.println("elementAt(0): " + v.elementAt(0));

        Vector<String> colors = new Vector<>(List.of("Red", "Green", "Blue"));
        Enumeration<String> e = colors.elements();   // legacy cursor
        while (e.hasMoreElements()) {
            System.out.println(e.nextElement());
        }
    }
}`;

const ex2 = `import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<String> books = new Stack<>();
        books.push("Java");
        books.push("Python");
        books.push("SQL");
        System.out.println(books);
        System.out.println("Top: " + books.peek());
        System.out.println("search Java: " + books.search("Java"));
        System.out.println("Popped: " + books.pop());
        System.out.println(books);
        System.out.println("Empty? " + books.empty());
    }
}`;

const ex3 = `import java.util.Stack;

public class Main {
    static boolean isBalanced(String s) {
        Stack<Character> st = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                st.push(c);
            } else if (c == ')' || c == '}' || c == ']') {
                if (st.isEmpty()) return false;
                char open = st.pop();
                if ((c == ')' && open != '(') || (c == '}' && open != '{') || (c == ']' && open != '[')) {
                    return false;
                }
            }
        }
        return st.isEmpty();
    }

    public static void main(String[] args) {
        String[] tests = {"{[()]}", "([)]", "(("};
        for (String t : tests) {
            System.out.println(t + " -> " + isBalanced(t));
        }
    }
}`;

const ex4 = `import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        String word = "COLLECTION";

        Stack<Character> st = new Stack<>();
        for (char c : word.toCharArray()) st.push(c);
        StringBuilder sb = new StringBuilder();
        while (!st.isEmpty()) sb.append(st.pop());
        System.out.println("Stack reverse: " + sb);

        // Modern recommended way
        Deque<Character> dq = new ArrayDeque<>();
        for (char c : word.toCharArray()) dq.push(c);
        StringBuilder sb2 = new StringBuilder();
        while (!dq.isEmpty()) sb2.append(dq.pop());
        System.out.println("Deque reverse: " + sb2);
    }
}`;

export default {
  id: 'day-04-vector-stack',
  title: 'Vector and Stack (legacy classes)',
  module: 'Module 1: Collections Basics & Lists',
  day: 4,
  level: 'Beginner',
  duration: '2 hours',
  summary: 'Learn the legacy classes Vector and Stack, how they differ from ArrayList, why they are synchronized, and why modern code prefers ArrayList and ArrayDeque.',
  objectives: [
    'Explain what legacy classes are and why they still exist',
    'Use Vector methods and the Enumeration cursor',
    'Use Stack methods push, pop, peek, search and empty',
    'Compare Vector with ArrayList and Stack with ArrayDeque',
    'Solve classic stack problems such as balanced brackets and string reversal',
  ],
  theory: [
    {
      heading: 'What are legacy classes?',
      content:
        'Legacy classes are the collection classes that existed in Java 1.0, before the Collection Framework arrived in Java 1.2: Vector, Stack, Hashtable, Properties and the Enumeration interface. They were later re-engineered to implement the new interfaces (Vector implements List), so they still work, but newer alternatives are usually better.',
      points: [
        'Vector -> modern alternative: ArrayList',
        'Stack -> modern alternative: ArrayDeque (as Deque)',
        'Hashtable -> modern alternative: HashMap / ConcurrentHashMap',
        'Enumeration -> modern alternative: Iterator',
      ],
    },
    {
      heading: 'Vector',
      content:
        'Vector is a growable array, just like ArrayList, but every public method is synchronized - only one thread can use it at a time. That makes it thread-safe but slower even in single-threaded programs because of locking overhead. Like a shop with one billing counter and a security guard checking everyone: safe, but slow.',
      syntax: `Vector<Integer> v = new Vector<>();          // capacity 10
Vector<Integer> v2 = new Vector<>(20, 5);    // initial 20, grow by 5
v.add(1); v.addElement(2); v.elementAt(0); v.firstElement(); v.lastElement();
v.removeElementAt(0); v.capacity();`,
      points: [
        'Default capacity 10; when full it DOUBLES (unless capacityIncrement is given). ArrayList grows by 50%',
        'Has capacity() method; ArrayList does not expose capacity',
        'Supports both Iterator (fail-fast) and Enumeration (legacy, not fail-fast)',
      ],
    },
    {
      heading: 'Stack',
      content:
        'Stack extends Vector and represents Last-In-First-Out (LIFO) behaviour - like a pile of plates: you put a plate on top and take the top plate first.',
      syntax: `push(e)    -> put on top, returns e
pop()      -> remove and return top (EmptyStackException if empty)
peek()     -> look at top without removing
empty()    -> true if no elements
search(o)  -> 1-based position from the TOP, or -1 if not found`,
      tip: 'Printing a Stack shows elements from bottom to top: [Java, Python, SQL] means SQL is on top.',
    },
    {
      heading: 'Why Stack is not recommended today',
      content:
        'Because Stack extends Vector, it inherits methods like get(0), add(index, e) and remove(index) that break the LIFO idea, and every call pays the synchronization cost. The Java documentation itself recommends Deque<Integer> stack = new ArrayDeque<>(); which is faster and provides push/pop/peek.',
    },
    {
      heading: 'Vector vs ArrayList (interview table in words)',
      content: 'Memorize these differences.',
      points: [
        'Synchronization: Vector synchronized, ArrayList not',
        'Speed: ArrayList faster',
        'Growth: Vector doubles (100%), ArrayList grows 50%',
        'Legacy: Vector since Java 1.0, ArrayList since 1.2',
        'Cursor: Vector supports Enumeration and Iterator; ArrayList only Iterator/ListIterator',
        'For thread safety today use Collections.synchronizedList or CopyOnWriteArrayList instead of Vector',
      ],
    },
  ],
  examples: [
    {
      title: 'Vector capacity growth and legacy methods',
      scenario: 'Watch Vector double its capacity and use legacy methods plus Enumeration.',
      steps: ['In Eclipse: File > New > Class > Main', 'Type the code', 'Run As > Java Application'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Capacity: 10
Size: 11
Capacity: 20
First: 10, Last: 120
elementAt(0): 20
Red
Green
Blue`,
      explanation:
        'new Vector<>() allocates 10 slots at once. Adding the 11th element doubles capacity to 20. After removing element 0 (value 10), elementAt(0) is 20. Enumeration walks the elements with hasMoreElements/nextElement.',
    },
    {
      title: 'Stack of books',
      scenario: 'Pile up books and use all Stack methods.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `[Java, Python, SQL]
Top: SQL
search Java: 3
Popped: SQL
[Java, Python]
Empty? false`,
      explanation:
        'SQL was pushed last so it is on top. search("Java") returns 3 because Java is third from the top (1-based). pop removes SQL.',
    },
    {
      title: 'Balanced brackets checker',
      scenario: 'A code editor checks if brackets in an expression are balanced - a very common interview program.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `{[()]} -> true
([)] -> false
(( -> false`,
      explanation:
        'Every opening bracket is pushed. For a closing bracket we pop and check it matches. In "([)]" the ) meets [ on top - mismatch. In "((" the stack is not empty at the end.',
    },
    {
      title: 'Reverse a string with Stack and with ArrayDeque',
      scenario: 'Show the legacy way and the recommended modern way side by side.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Stack reverse: NOITCELLOC
Deque reverse: NOITCELLOC`,
      explanation:
        'Pushing characters then popping them returns them in reverse order. ArrayDeque gives the same LIFO result without synchronization overhead.',
    },
  ],
  interview: [
    { q: 'What are legacy classes in Java collections?', a: 'Classes from Java 1.0 before the Collection Framework: Vector, Stack, Hashtable, Properties, Dictionary and the Enumeration interface.', level: 'Easy' },
    { q: 'Difference between Vector and ArrayList?', a: 'Vector is synchronized (thread-safe, slower), doubles its capacity, is legacy and supports Enumeration. ArrayList is unsynchronized (faster), grows by 50% and is the modern choice.', level: 'Easy' },
    { q: 'What is the output? Stack<Integer> s = new Stack<>(); s.push(5); s.push(6); s.push(7); System.out.println(s.search(5));', a: '3. search returns the 1-based distance from the top; 5 is at the bottom of 3 elements.', level: 'Medium' },
    { q: 'What happens when pop() is called on an empty Stack?', a: 'It throws java.util.EmptyStackException (an unchecked exception).', level: 'Easy' },
    { q: 'Why is Stack considered a bad design?', a: 'It extends Vector, so it exposes index-based methods (get, add(index), remove(index)) that break LIFO, and it is synchronized unnecessarily. Deque/ArrayDeque is recommended.', level: 'Medium' },
    { q: 'Enumeration vs Iterator?', a: 'Enumeration (legacy) has hasMoreElements/nextElement, no remove, and is not fail-fast. Iterator has hasNext/next/remove and is fail-fast. Iterator works with all collections.', level: 'Medium' },
    { q: 'What is the default capacity and growth of Vector?', a: 'Default capacity 10. When full it doubles, unless a capacityIncrement was given in the constructor, in which case it grows by that amount.', level: 'Medium' },
    { q: 'Output? Stack<String> s = new Stack<>(); s.push("A"); s.push("B"); s.add(0,"C"); System.out.println(s + " " + s.peek());', a: '[C, A, B] B. add(0, ..) inserts at the bottom (Vector method); peek still returns the top, B.', level: 'Hard' },
    { q: 'If Vector is thread-safe, why not use it in multithreaded code?', a: 'Each method is synchronized individually, so compound actions (check-then-act) are still not atomic, and locking every call hurts performance. Concurrent collections are better.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Use a Stack to reverse the words of a sentence: "I love Java" -> "Java love I".',
      hint: 'split(" "), push each word, then pop into a StringBuilder.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Stack<String> st = new Stack<>();
        for (String w : "I love Java".split(" ")) st.push(w);
        StringBuilder sb = new StringBuilder();
        while (!st.isEmpty()) {
            sb.append(st.pop());
            if (!st.isEmpty()) sb.append(" ");
        }
        System.out.println(sb); // Java love I
    }
}`,
    },
    {
      task: 'Convert a decimal number to binary using a Stack (e.g. 13 -> 1101).',
      hint: 'Push n % 2 while n > 0, then pop all.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int n = 13;
        Stack<Integer> st = new Stack<>();
        while (n > 0) { st.push(n % 2); n /= 2; }
        StringBuilder sb = new StringBuilder();
        while (!st.isEmpty()) sb.append(st.pop());
        System.out.println(sb); // 1101
    }
}`,
    },
    {
      task: 'Create a Vector with initial capacity 4 and capacityIncrement 2. Add 7 elements and print capacity after each add.',
      hint: 'new Vector<>(4, 2); capacity goes 4,4,4,4,6,6,8.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Vector<Integer> v = new Vector<>(4, 2);
        for (int i = 1; i <= 7; i++) {
            v.add(i);
            System.out.println("size " + v.size() + " capacity " + v.capacity());
        }
    }
}
/* Output:
size 1 capacity 4
size 2 capacity 4
size 3 capacity 4
size 4 capacity 4
size 5 capacity 6
size 6 capacity 6
size 7 capacity 8 */`,
    },
    {
      task: 'Evaluate a postfix expression "23*54*+" using a Stack (answer 26).',
      hint: 'Digits are pushed; on an operator pop b then a and push a op b.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String exp = "23*54*+";
        Stack<Integer> st = new Stack<>();
        for (char c : exp.toCharArray()) {
            if (Character.isDigit(c)) st.push(c - '0');
            else {
                int b = st.pop(), a = st.pop();
                switch (c) {
                    case '+' -> st.push(a + b);
                    case '-' -> st.push(a - b);
                    case '*' -> st.push(a * b);
                    case '/' -> st.push(a / b);
                }
            }
        }
        System.out.println(st.pop()); // 26
    }
}`,
    },
  ],
  quiz: [
    { question: 'Stack class extends:', options: ['ArrayList', 'LinkedList', 'Vector', 'AbstractQueue'], answer: 2, explanation: 'java.util.Stack extends Vector.' },
    { question: 'How does a default Vector grow when full?', options: ['Doubles', 'By 50%', 'By 1', 'It does not grow'], answer: 0, explanation: 'Without capacityIncrement, Vector doubles its capacity.' },
    { question: 'Stack s: push(1), push(2), push(3), pop(), peek() returns:', options: ['1', '3', 'null', '2'], answer: 3, explanation: 'After popping 3, the top is 2.' },
    { question: 'The recommended modern replacement for Stack is:', options: ['Vector', 'ArrayDeque', 'PriorityQueue', 'TreeSet'], answer: 1, explanation: 'Deque<T> stack = new ArrayDeque<>() is faster and cleaner.' },
    { question: 'Which cursor is NOT fail-fast?', options: ['Iterator of ArrayList', 'ListIterator', 'Enumeration of Vector', 'Iterator of HashMap'], answer: 2, explanation: 'Enumeration is legacy and does not check for concurrent modification.' },
  ],
};
