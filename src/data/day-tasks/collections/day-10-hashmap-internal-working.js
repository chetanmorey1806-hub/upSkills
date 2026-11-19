export default {
  lesson: 'day-10-hashmap-internal-working',
  minutes: 22,
  intro: 'Compute bucket indexes, follow put/get internals, resizing and treeification, and apply the equals/hashCode contract.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Bucket index calculation: what does this program print? (`Integer.hashCode(k)` is k itself)',
      example: {
        title: 'the formula used by HashMap',
        code: `int h = key.hashCode();
h = h ^ (h >>> 16);
int index = (n - 1) & h;   // n = table size, a power of 2`,
      },
      code: `public class Main {
    static int index(Object key, int n) {
        int h = key.hashCode();
        h = h ^ (h >>> 16);
        return (n - 1) & h;
    }

    public static void main(String[] args) {
        int[] keys = {5, 17, 33, 100, 70000};
        for (int k : keys) System.out.print(index(k, 16) + " ");
        System.out.println();
        System.out.println(index(17, 32) + " " + index(33, 32));
        int capacity = 16;
        float loadFactor = 0.75f;
        System.out.println((int) (capacity * loadFactor));
    }
}`,
      expected: `5 1 1 4 1 
17 1
12`,
      explain: 'With 16 buckets, `(n - 1) & h` keeps the last 4 bits (same as h % 16 for positive h): 17 and 33 **collide** in bucket 1. For 70000, `h >>> 16` is 1, so the XOR mixes the high bits in (70001 → bucket 1). After resizing to 32 buckets, 17 moves to bucket 17 while 33 stays in 1 — that is rehashing. The resize threshold is 16 × 0.75 = 12 entries.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Broken keys: what does this program print?',
      example: { title: 'a good key', text: 'String and Integer are ideal keys: immutable, with proper equals() and hashCode().' },
      code: `import java.util.*;

class Key {
    int id;
    Key(int id) { this.id = id; }
}

public class Main {
    public static void main(String[] args) {
        Map<Key, String> m1 = new HashMap<>();
        m1.put(new Key(1), "A");
        System.out.println(m1.get(new Key(1)));
        m1.put(new Key(1), "B");
        System.out.println(m1.size());

        Map<List<Integer>, String> m2 = new HashMap<>();
        List<Integer> key = new ArrayList<>(List.of(1));
        m2.put(key, "v");
        System.out.println(m2.get(key));
        key.add(2);
        System.out.println(m2.get(key));
        System.out.println(m2.size());
    }
}`,
      expected: `null
2
v
null
1`,
      explain: 'Key does not override equals/hashCode, so every `new Key(1)` is a different key: the lookup misses and the map grows to 2. In the second map, changing the list **after** using it as a key changes its hashCode (32 → 994), so get() looks in the wrong bucket and returns null although the entry is still inside. Keys must be immutable.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the expression HashMap uses to turn the spread hash \`h\` into a bucket index for a table of size \`n\`:
\`int index = ____;\``,
      example: { title: 'spreading the hash', code: 'h = h ^ (h >>> 16);' },
      accept: ['(n - 1) & h', 'h & (n - 1)'],
      acceptRegex: ['^\\(\\s*n\\s*-\\s*1\\s*\\)\\s*&\\s*h\\s*[;{]?$', '^h\\s*&\\s*\\(\\s*n\\s*-\\s*1\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Because n is always a power of two, `(n - 1) & h` equals `h % n` for the low bits but is faster and never negative. That is why HashMap rounds every capacity up to a power of two.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Since Java 8, a bucket\'s linked list is converted into a Red-Black tree when it holds more than how many nodes (TREEIFY_THRESHOLD)? (the number)',
      example: {
        title: 'the other condition',
        text: 'Treeification also needs the table capacity to be at least MIN_TREEIFY_CAPACITY = 64; otherwise the table is resized instead.',
      },
      accept: ['8'],
      explain: 'When a bucket reaches **8** nodes (and the capacity is ≥ 64) it becomes a tree, so the worst-case lookup in that bucket improves from O(n) to O(log n). It turns back into a list when it shrinks to 6 (UNTREEIFY_THRESHOLD).',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'During `put(key, value)`, the target bucket already has a node with the **same hash** and `equals()` returns true. What happens?',
      options: [
        'A new node is appended (duplicate key)',
        'The existing node\'s value is replaced and the old value is returned',
        'An exception is thrown',
        'The map resizes',
      ],
      answer: 1,
      explain: 'Same hash + equals → it is the same key, so HashMap **replaces the value** and returns the old one. Only if equals is false (a collision) is a new node added to the bucket chain or tree.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which follow the **equals() / hashCode() contract**? (choose all that apply)',
      options: [
        'If a.equals(b) then a.hashCode() == b.hashCode()',
        'If a.hashCode() == b.hashCode() then a.equals(b) must be true',
        'hashCode must return the same value each call while the fields used in equals do not change',
        'Two unequal objects may have the same hashCode (collision)',
        'equals must be symmetric: a.equals(b) == b.equals(a)',
      ],
      answers: [0, 2, 3, 4],
      explain: 'Equal objects need equal hash codes, but equal hash codes do not imply equal objects (collisions are allowed). equals must be reflexive, symmetric, transitive and consistent; hashCode must be consistent while the relevant fields are unchanged.',
    },
  ],
};
