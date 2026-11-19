export default {
  lesson: 'day-09-map-hashmap',
  minutes: 22,
  intro: 'Store key-value data in a HashMap, use the Java 8 helper methods and count frequencies.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'HashMap methods: what does this program print? (no map is printed directly, so order does not matter)',
      example: {
        title: 'put returns the old value',
        code: `Map<String, Integer> m = new HashMap<>();
m.put("a", 1);   // null
m.put("a", 2);   // 1`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Map<String, Integer> stock = new HashMap<>();
        System.out.println(stock.put("pen", 10));
        System.out.println(stock.put("pen", 15));
        System.out.println(stock.get("pencil"));
        System.out.println(stock.getOrDefault("pencil", 0));
        System.out.println(stock.putIfAbsent("pen", 99));
        System.out.println(stock.merge("pen", 5, Integer::sum));
        System.out.println(stock.computeIfAbsent("ink", k -> k.length()));
        System.out.println(stock.containsValue(3) + " " + stock.size());
        System.out.println(stock.remove("ink"));
    }
}`,
      expected: `null
10
null
0
15
20
3
true 2
3`,
      explain: '`put` returns the previous value (null the first time, then 10). `get` on a missing key returns null; `getOrDefault` gives a fallback. `putIfAbsent` does nothing because "pen" exists and returns the current value 15. `merge` adds 5 → 20. `computeIfAbsent` stores "ink".length() = 3. `remove` returns the removed value.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Word frequency: what does this program print?',
      example: { title: 'sorted copy of a map', code: 'System.out.println(new TreeMap<>(hashMap)); // keys sorted' },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String text = "to be or not to be that is";
        Map<String, Integer> counts = new HashMap<>();
        for (String w : text.split(" ")) {
            counts.merge(w, 1, Integer::sum);
        }
        System.out.println(new TreeMap<>(counts));

        Map<Integer, List<String>> byLength = new TreeMap<>();
        for (String w : counts.keySet()) {
            byLength.computeIfAbsent(w.length(), k -> new ArrayList<>()).add(w);
        }
        System.out.println(byLength.keySet());
        System.out.println(byLength.get(4));
    }
}`,
      expected: `{be=2, is=1, not=1, or=1, that=1, to=2}
[2, 3, 4]
[that]`,
      explain: '`merge(w, 1, Integer::sum)` inserts 1 for a new word or adds 1 to the existing count. Printing a **HashMap** has no guaranteed order, so we copy it into a TreeMap (sorted keys). `computeIfAbsent` creates the list for a new length the first time, then `add` appends to it. Only "that" has length 4.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Classic counting line without merge: increase the count of \`word\` by 1 (starting from 0 if missing):
\`counts.put(word, ____);\``,
      example: { title: 'reading with a default', code: 'int qty = stock.getOrDefault("pen", 0);' },
      accept: ['counts.getOrDefault(word, 0) + 1', '1 + counts.getOrDefault(word, 0)'],
      acceptRegex: [
        '^counts\\s*\\.\\s*getOrDefault\\s*\\(\\s*word\\s*,\\s*0\\s*\\)\\s*\\+\\s*1\\s*[;{]?$',
        '^1\\s*\\+\\s*counts\\s*\\.\\s*getOrDefault\\s*\\(\\s*word\\s*,\\s*0\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`getOrDefault(word, 0)` avoids the NullPointerException you get from `counts.get(word) + 1` when the word is new (unboxing null). The modern one-liner is `counts.merge(word, 1, Integer::sum)`.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Complete the for-each header that iterates over **keys and values together** of \`Map<String, Integer> marks\`:
\`for (____ : marks.entrySet()) {\`
\`    System.out.println(e.getKey() + " = " + e.getValue());\`
\`}\``,
      example: {
        title: 'keys only / values only',
        code: `for (String k : marks.keySet()) { ... }
for (Integer v : marks.values()) { ... }`,
      },
      accept: ['Map.Entry<String, Integer> e', 'var e', 'Entry<String, Integer> e'],
      acceptRegex: [
        '^Map\\s*\\.\\s*Entry\\s*<\\s*String\\s*,\\s*Integer\\s*>\\s*e\\s*[;{]?$',
        '^var\\s+e\\s*[;{]?$',
        '^Entry\\s*<\\s*String\\s*,\\s*Integer\\s*>\\s*e\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Each element of `entrySet()` is a `Map.Entry<K, V>` with getKey(), getValue() and setValue(). Iterating entries is more efficient than iterating keys and calling get(key) for each.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How many **null keys** can a HashMap have?',
      options: ['None', 'Exactly one', 'Unlimited', 'One per bucket'],
      answer: 1,
      explain: 'HashMap allows **one null key** (stored in bucket 0) and any number of null values. TreeMap (natural order) and Hashtable/ConcurrentHashMap do not allow null keys.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about Map are TRUE? (choose all that apply)',
      options: [
        'Keys are unique; putting an existing key replaces its value',
        'Values must be unique',
        'HashMap get/put are O(1) on average',
        'HashMap keeps insertion order',
        'keySet() returns a Set and values() returns a Collection',
      ],
      answers: [0, 2, 4],
      explain: 'Only keys must be unique; many keys may share the same value. HashMap does not preserve any order — use LinkedHashMap for insertion order or TreeMap for sorted keys.',
    },
  ],
};
