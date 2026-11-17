const ex1 = `import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nums = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6));
        Iterator<Integer> it = nums.iterator();
        while (it.hasNext()) {
            int n = it.next();
            if (n % 2 != 0) {
                it.remove();          // safe removal
            }
        }
        System.out.println(nums);
    }
}`;

const ex2 = `import java.util.ArrayList;
import java.util.List;
import java.util.ListIterator;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("amit", "bina", "chetan"));
        ListIterator<String> li = names.listIterator();

        while (li.hasNext()) {
            int idx = li.nextIndex();
            String s = li.next();
            li.set(s.toUpperCase());       // replace current element
            System.out.println(idx + ": " + s);
        }
        System.out.println(names);

        while (li.hasPrevious()) {         // walk backwards
            System.out.println("Back: " + li.previous());
        }

        li.next();                         // move over AMIT
        li.add("ANITA");                   // insert after AMIT
        System.out.println(names);
    }
}`;

const ex3 = `import java.util.ArrayList;
import java.util.ConcurrentModificationException;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        // Fail-fast
        List<String> list = new ArrayList<>(List.of("A", "B", "C"));
        try {
            for (String s : list) {
                if (s.equals("A")) list.remove(s);
            }
        } catch (ConcurrentModificationException e) {
            System.out.println("Caught: " + e.getClass().getSimpleName());
        }
        System.out.println("ArrayList: " + list);

        // Fail-safe
        List<String> safe = new CopyOnWriteArrayList<>(List.of("A", "B", "C"));
        for (String s : safe) {
            if (s.equals("A")) safe.add("D");   // works on a snapshot
        }
        System.out.println("CopyOnWriteArrayList: " + safe);
    }
}`;

const ex4 = `import java.util.Iterator;
import java.util.Map;
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new TreeMap<>();
        stock.put("Pen", 0);
        stock.put("Book", 5);
        stock.put("Bag", 0);
        stock.put("Ink", 3);

        Iterator<Map.Entry<String, Integer>> it = stock.entrySet().iterator();
        while (it.hasNext()) {
            Map.Entry<String, Integer> e = it.next();
            if (e.getValue() == 0) {
                System.out.println("Removing " + e.getKey());
                it.remove();
            }
        }
        System.out.println(stock);
    }
}`;

export default {
  id: 'day-05-iterator-listiterator-failfast',
  title: 'Iterator, ListIterator, for-each, Fail-fast vs Fail-safe',
  module: 'Module 1: Collections Basics & Lists',
  day: 5,
  level: 'Intermediate',
  duration: '2 hours',
  summary: 'Master the cursors used to walk through collections, remove elements safely while looping, and understand why some iterators throw ConcurrentModificationException (fail-fast) while others do not (fail-safe).',
  objectives: [
    'Use Iterator with hasNext, next and remove',
    'Use ListIterator to move forward and backward and to set/add elements',
    'Understand how the for-each loop uses an Iterator behind the scenes',
    'Explain fail-fast vs fail-safe iterators and modCount',
    'Remove elements correctly while iterating (Iterator.remove, removeIf)',
  ],
  theory: [
    {
      heading: 'What is an Iterator?',
      content:
        'An Iterator is a cursor - like a finger moving over a list of names on paper. It points between elements. hasNext() asks "is there another name?", next() moves the finger forward and returns that name, and remove() deletes the name the finger just passed. Every Collection gives an Iterator through iterator().',
      syntax: `Iterator<String> it = list.iterator();
while (it.hasNext()) {
    String s = it.next();
    if (condition) it.remove();
}`,
      points: [
        'Works with every Collection (List, Set, Queue) - universal cursor',
        'Forward only',
        'remove() can be called only once per next(), otherwise IllegalStateException',
        'next() when nothing is left throws NoSuchElementException',
      ],
    },
    {
      heading: 'ListIterator - the bidirectional cursor',
      content:
        'ListIterator works only on List implementations and can move both ways. It also knows indexes and can replace or insert elements.',
      syntax: `ListIterator<String> li = list.listIterator();   // or listIterator(index)
hasNext() next() nextIndex()
hasPrevious() previous() previousIndex()
set(e)   // replace the last returned element
add(e)   // insert at cursor position
remove()`,
      points: [
        'Iterator: all collections, forward only, read + remove',
        'ListIterator: only List, forward + backward, read + remove + set + add',
        'Enumeration: legacy (Vector/Hashtable), forward only, read only',
      ],
    },
    {
      heading: 'for-each loop behind the scenes',
      content:
        'The enhanced for loop for (String s : list) is converted by the compiler into an Iterator loop. That is why any class that implements Iterable can be used in for-each, and why calling list.remove() inside a for-each loop is dangerous - you are changing the list behind the iterator\'s back.',
      syntax: `for (String s : list) { ... }
// becomes
for (Iterator<String> i = list.iterator(); i.hasNext(); ) { String s = i.next(); ... }`,
    },
    {
      heading: 'Fail-fast iterators',
      content:
        'Collections like ArrayList, HashMap and HashSet keep a counter called modCount that increases on every structural change (add/remove). The iterator remembers the value when it was created (expectedModCount). On every next() it compares them; if someone else changed the collection, it immediately throws ConcurrentModificationException. It "fails fast" instead of giving wrong results later - like a cashier who stops counting the moment someone adds notes to the pile.',
      points: [
        'Examples: iterators of ArrayList, LinkedList, HashSet, HashMap, TreeMap',
        'The iterator\'s own remove() updates expectedModCount, so it is safe',
        'Fail-fast behaviour is best-effort; it is meant for detecting bugs, not for program logic',
      ],
    },
    {
      heading: 'Fail-safe (weakly consistent / snapshot) iterators',
      content:
        'Concurrent collections never throw ConcurrentModificationException. CopyOnWriteArrayList iterates over a snapshot copy of the array taken when the iterator was created - changes made during the loop are not seen by that loop. ConcurrentHashMap iterators are "weakly consistent": they may or may not reflect changes made during iteration.',
      points: [
        'Examples: CopyOnWriteArrayList, CopyOnWriteArraySet, ConcurrentHashMap, ConcurrentLinkedQueue',
        'Cost: extra memory (copies) or possibly stale data',
        'Their iterator.remove() may be unsupported (CopyOnWriteArrayList throws UnsupportedOperationException)',
      ],
    },
    {
      heading: 'How to remove while iterating - correct ways',
      content: 'Never call list.remove() inside a for-each loop. Use one of these instead.',
      syntax: `it.remove();                          // Iterator
list.removeIf(x -> x < 0);            // Java 8+ (cleanest)
for (int i = list.size() - 1; i >= 0; i--) if (...) list.remove(i);  // loop backwards
map.entrySet().removeIf(e -> e.getValue() == 0);`,
    },
  ],
  examples: [
    {
      title: 'Remove odd numbers with Iterator',
      scenario: 'Clean a list by deleting odd numbers while looping, safely.',
      steps: ['In IntelliJ: New > Java Class > Main', 'Type the code', 'Run ▶'],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `[2, 4, 6]`,
      explanation: 'it.remove() deletes the element last returned by next() and keeps the iterator in sync, so no exception occurs.',
    },
    {
      title: 'ListIterator: forward, backward, set and add',
      scenario: 'Capitalize names in place, print them in reverse, then insert a new name.',
      steps: ['Create class Main', 'Type the code', 'Run ▶ and trace the cursor position'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `0: amit
1: bina
2: chetan
[AMIT, BINA, CHETAN]
Back: CHETAN
Back: BINA
Back: AMIT
[AMIT, ANITA, BINA, CHETAN]`,
      explanation:
        'nextIndex() gives the index of the element next() will return. set() replaces the element just returned, so the list becomes upper case. After walking back to the start, next() returns AMIT and add("ANITA") inserts right after it.',
    },
    {
      title: 'Fail-fast vs fail-safe',
      scenario: 'Modify a list while looping over it - once with ArrayList, once with CopyOnWriteArrayList.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Caught: ConcurrentModificationException
ArrayList: [B, C]
CopyOnWriteArrayList: [A, B, C, D]`,
      explanation:
        'Removing "A" changes modCount; the next call to next() detects it and throws. The removal itself already happened, so the list is [B, C]. CopyOnWriteArrayList iterates a snapshot, so adding D is allowed and the loop does not see D.',
    },
    {
      title: 'Removing map entries while iterating',
      scenario: 'Remove out-of-stock products (quantity 0) from a stock map.',
      steps: ['Create class Main', 'Type the code', 'Run ▶'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Removing Bag
Removing Pen
{Book=5, Ink=3}`,
      explanation:
        'TreeMap keeps keys sorted (Bag, Book, Ink, Pen), so the order is predictable. Iterator.remove() on the entrySet iterator removes the entry from the map safely. Shorter alternative: stock.values().removeIf(q -> q == 0).',
    },
  ],
  interview: [
    { q: 'Difference between Iterator and ListIterator?', a: 'Iterator works on all collections and moves forward only with hasNext/next/remove. ListIterator works only on lists, moves both directions, gives indexes and supports set() and add().', level: 'Easy' },
    { q: 'What is ConcurrentModificationException?', a: 'An unchecked exception thrown by fail-fast iterators when the collection is structurally modified after the iterator was created by any means other than the iterator\'s own methods.', level: 'Easy' },
    { q: 'How do fail-fast iterators work internally?', a: 'The collection maintains modCount, incremented on structural changes. The iterator stores expectedModCount at creation and compares in next(); a mismatch throws ConcurrentModificationException.', level: 'Medium' },
    { q: 'Fail-fast vs fail-safe?', a: 'Fail-fast (ArrayList, HashMap) throw CME on concurrent modification and work on the original collection. Fail-safe/weakly consistent (CopyOnWriteArrayList, ConcurrentHashMap) never throw CME, working on a snapshot or tolerating changes, at the cost of memory or freshness.', level: 'Medium' },
    { q: 'What is the output? List<String> l = new ArrayList<>(List.of("A","B","C")); for (String s : l) if (s.equals("B")) l.remove(s); System.out.println(l);', a: '[A, C] with NO exception. After removing B (second-last), size becomes 2 and the cursor is 2, so hasNext() returns false and next() is never called again. Removing "A" would throw CME.', level: 'Hard' },
    { q: 'What happens if you call it.remove() twice in a row?', a: 'IllegalStateException - remove() is allowed only once after each next().', level: 'Medium' },
    { q: 'Can you add elements using Iterator?', a: 'No. Iterator has no add(). ListIterator has add().', level: 'Easy' },
    { q: 'How does for-each work internally?', a: 'For Iterable objects the compiler generates an Iterator loop (hasNext/next). For arrays it generates an index-based loop.', level: 'Medium' },
    { q: 'Best way to remove elements matching a condition in Java 8+?', a: 'collection.removeIf(predicate); for maps, map.entrySet().removeIf(...) or map.values().removeIf(...).', level: 'Easy' },
    { q: 'Does CopyOnWriteArrayList iterator support remove()?', a: 'No, it throws UnsupportedOperationException because it iterates over an immutable snapshot.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Remove all names shorter than 4 characters from a list using an Iterator.',
      hint: 'it.next().length() < 4 -> it.remove().',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<String> names = new ArrayList<>(List.of("Ram", "Sneha", "Om", "Kiran"));
        Iterator<String> it = names.iterator();
        while (it.hasNext()) {
            if (it.next().length() < 4) it.remove();
        }
        System.out.println(names); // [Sneha, Kiran]
    }
}`,
    },
    {
      task: 'Print a list in reverse order using ListIterator starting from the end.',
      hint: 'list.listIterator(list.size()) then hasPrevious/previous.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> l = List.of(1, 2, 3, 4);
        ListIterator<Integer> li = l.listIterator(l.size());
        StringBuilder sb = new StringBuilder();
        while (li.hasPrevious()) sb.append(li.previous()).append(" ");
        System.out.println(sb.toString().trim()); // 4 3 2 1
    }
}`,
    },
    {
      task: 'Using ListIterator, double every even number in a list in place.',
      hint: 'li.set(n * 2) when n % 2 == 0.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> l = new ArrayList<>(List.of(1, 2, 3, 4));
        ListIterator<Integer> li = l.listIterator();
        while (li.hasNext()) {
            int n = li.next();
            if (n % 2 == 0) li.set(n * 2);
        }
        System.out.println(l); // [1, 4, 3, 8]
    }
}`,
    },
    {
      task: 'Write a class Range implements Iterable<Integer> so that for (int x : new Range(1, 5)) prints 1 to 4.',
      hint: 'Return an anonymous Iterator whose hasNext checks current < end.',
      solution: `import java.util.*;

class Range implements Iterable<Integer> {
    private final int start, end;
    Range(int start, int end) { this.start = start; this.end = end; }
    public Iterator<Integer> iterator() {
        return new Iterator<>() {
            int cur = start;
            public boolean hasNext() { return cur < end; }
            public Integer next() { return cur++; }
        };
    }
}

public class Main {
    public static void main(String[] args) {
        for (int x : new Range(1, 5)) System.out.println(x); // 1 2 3 4 (one per line)
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which cursor can move backwards?', options: ['Iterator', 'Enumeration', 'ListIterator', 'Spliterator'], answer: 2, explanation: 'Only ListIterator has hasPrevious/previous.' },
    { question: 'Calling list.remove() inside a for-each over an ArrayList usually throws:', options: ['ConcurrentModificationException', 'IllegalStateException', 'NoSuchElementException', 'UnsupportedOperationException'], answer: 0, explanation: 'The fail-fast iterator detects the modCount change.' },
    { question: 'Which collection has a fail-safe (snapshot) iterator?', options: ['ArrayList', 'HashMap', 'LinkedList', 'CopyOnWriteArrayList'], answer: 3, explanation: 'CopyOnWriteArrayList iterates over a snapshot array.' },
    { question: 'Calling it.remove() before any it.next() throws:', options: ['NullPointerException', 'IllegalStateException', 'ConcurrentModificationException', 'Nothing'], answer: 1, explanation: 'remove() needs a previous next() call.' },
    { question: 'What field does a fail-fast iterator compare to detect modification?', options: ['size', 'capacity', 'modCount', 'hashCode'], answer: 2, explanation: 'expectedModCount is compared with the collection\'s modCount.' },
  ],
};
