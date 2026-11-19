export default {
  lesson: 'day-05-iterator-listiterator-failfast',
  minutes: 20,
  intro: 'Walk collections with Iterator and ListIterator, remove safely while iterating, and predict fail-fast behaviour.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Iterator and ListIterator: what does this program print?',
      example: {
        title: 'safe removal',
        code: `Iterator<Integer> it = list.iterator();
while (it.hasNext()) if (it.next() < 0) it.remove();`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        List<Integer> list = new ArrayList<>(List.of(1, 2, 3, 4, 5, 6, 7, 8));
        Iterator<Integer> it = list.iterator();
        while (it.hasNext()) {
            if (it.next() % 2 == 0) it.remove();
        }
        System.out.println(list);

        ListIterator<Integer> lit = list.listIterator(list.size());
        while (lit.hasPrevious()) {
            int x = lit.previous();
            System.out.print(x + " ");
            lit.set(x * 10);
        }
        System.out.println();
        System.out.println(list);
    }
}`,
      expected: `[1, 3, 5, 7]
7 5 3 1 
[10, 30, 50, 70]`,
      explain: '`it.remove()` deletes the element returned by the last `next()` safely. A ListIterator can start at the end (`listIterator(size)`) and walk **backwards** with hasPrevious/previous, and `set` replaces the last returned element.',
    },
    {
      type: 'output',
      mins: 5,
      q: 'Fail-fast vs fail-safe: what does this program print?',
      example: {
        title: 'modCount',
        text: 'Each structural change (add/remove) increases the list\'s modCount. A fail-fast iterator compares it on every `next()` and throws ConcurrentModificationException if it changed.',
      },
      code: `import java.util.*;
import java.util.concurrent.CopyOnWriteArrayList;

public class Main {
    public static void main(String[] args) {
        List<String> a = new ArrayList<>(List.of("A", "B", "C"));
        try {
            for (String s : a) if (s.equals("A")) a.remove(s);
        } catch (ConcurrentModificationException e) {
            System.out.println("CME " + a);
        }

        List<String> b = new ArrayList<>(List.of("A", "B", "C"));
        for (String s : b) if (s.equals("B")) b.remove(s);
        System.out.println(b);

        List<String> c = new CopyOnWriteArrayList<>(List.of("A", "B", "C"));
        int seen = 0;
        for (String s : c) {
            if (s.equals("A")) c.add("D");
            seen++;
        }
        System.out.println(seen + " " + c);
    }
}`,
      expected: `CME [B, C]
[A, C]
3 [A, B, C, D]`,
      explain: 'Removing "A" through the list (not the iterator) changes modCount, so the next `next()` throws **ConcurrentModificationException**. The famous exception: removing the **second-last** element ("B") makes `hasNext()` return false (cursor == size), so the loop just ends without an error. CopyOnWriteArrayList is **fail-safe**: it iterates over a snapshot, so the loop sees only 3 elements and no exception.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the loop condition for an Iterator \`it\`:
\`while (____) {\`
\`    String name = it.next();\`
\`}\``,
      example: { title: 'getting an iterator', code: 'Iterator<String> it = names.iterator();' },
      accept: ['it.hasNext()'],
      acceptRegex: ['^it\\s*\\.\\s*hasNext\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`hasNext()` checks whether another element exists; `next()` returns it and advances. Calling next() without checking can throw NoSuchElementException.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Shortest correct way (Java 8+) to remove all **empty strings** from \`List<String> names\` without an explicit loop:
\`names.____;\``,
      example: { title: 'removing negatives', code: 'nums.removeIf(n -> n < 0);' },
      accept: [
        'removeIf(String::isEmpty)',
        'removeIf(s -> s.isEmpty())',
        'removeIf(n -> n.isEmpty())',
        'removeIf(x -> x.isEmpty())',
        'removeIf(s -> s.equals(""))',
        'removeIf(""::equals)',
      ],
      acceptRegex: [
        '^removeIf\\s*\\(\\s*String\\s*:\\s*:\\s*isEmpty\\s*\\)\\s*[;{]?$',
        '^removeIf\\s*\\(\\s*s\\s*-\\s*>\\s*s\\s*\\.\\s*isEmpty\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^removeIf\\s*\\(\\s*n\\s*-\\s*>\\s*n\\s*\\.\\s*isEmpty\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^removeIf\\s*\\(\\s*x\\s*-\\s*>\\s*x\\s*\\.\\s*isEmpty\\s*\\(\\s*\\)\\s*\\)\\s*[;{]?$',
        '^removeIf\\s*\\(\\s*s\\s*-\\s*>\\s*s\\s*\\.\\s*equals\\s*\\(\\s*""\\s*\\)\\s*\\)\\s*[;{]?$',
        '^removeIf\\s*\\(\\s*""\\s*:\\s*:\\s*equals\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`removeIf` iterates internally and removes safely, so there is no ConcurrentModificationException. It is the cleanest replacement for the Iterator.remove() loop.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What can a ListIterator do that a plain Iterator cannot?',
      options: ['Remove elements', 'Move backwards, get indexes, and set/add elements', 'Work on a HashSet', 'Iterate in parallel'],
      answer: 1,
      explain: 'ListIterator (only for Lists) adds `hasPrevious/previous`, `nextIndex/previousIndex`, `set` and `add`. Both Iterator and ListIterator can remove.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which iterators are **fail-safe / weakly consistent** (no ConcurrentModificationException when the collection changes)? (choose all that apply)',
      options: ['ArrayList iterator', 'CopyOnWriteArrayList iterator', 'ConcurrentHashMap keySet iterator', 'HashMap iterator', 'LinkedList iterator'],
      answers: [1, 2],
      explain: 'Collections from `java.util.concurrent` use snapshot (CopyOnWrite*) or weakly consistent (ConcurrentHashMap) iterators. The normal java.util collections are fail-fast.',
    },
  ],
};
