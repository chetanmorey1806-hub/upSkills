export default {
  lesson: 'day-04-vector-stack',
  minutes: 18,
  intro: 'Use the legacy Vector and Stack classes, solve a bracket-matching problem, and know their modern replacements.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Stack methods: what does this program print?',
      example: {
        title: 'LIFO',
        code: `Stack<String> s = new Stack<>();
s.push("a"); s.push("b");
s.pop(); // "b" (last in, first out)`,
      },
      code: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        Stack<Integer> st = new Stack<>();
        st.push(10);
        st.push(20);
        st.push(30);
        System.out.println(st.peek());
        System.out.println(st.pop());
        System.out.println(st.search(10));
        System.out.println(st.search(99));
        System.out.println(st.empty());
        System.out.println(st);
    }
}`,
      expected: `30
30
2
-1
false
[10, 20]`,
      explain: '`peek` reads the top without removing; `pop` removes it. `search` returns a **1-based position from the top** (20 is 1, 10 is 2) or −1 if not found. Stack extends Vector, so printing shows bottom-to-top order.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Balanced brackets with a stack: what does this program print?',
      example: {
        title: 'the idea',
        text: 'Push every opening bracket. On a closing bracket, pop and check that it matches. At the end the stack must be empty.',
      },
      code: `import java.util.*;

public class Main {
    static boolean balanced(String s) {
        Deque<Character> st = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') st.push(c);
            else {
                if (st.isEmpty()) return false;
                char open = st.pop();
                if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) return false;
            }
        }
        return st.isEmpty();
    }

    public static void main(String[] args) {
        System.out.println(balanced("{[()]}"));
        System.out.println(balanced("([)]"));
        System.out.println(balanced("(("));
        System.out.println(balanced("())"));
    }
}`,
      expected: `true
false
false
false`,
      explain: '"{[()]}" closes in the reverse order it opens → true. In "([)]" the `)` meets `[` → false. "((" leaves items on the stack → false. In "())" the last `)` finds an empty stack → false. ArrayDeque is the modern stack.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Modern replacement for \`Stack<Integer> st = new Stack<>();\` — complete the declaration:
\`Deque<Integer> st = ____;\``,
      example: {
        title: 'using it',
        code: `st.push(5);
int top = st.pop();`,
      },
      accept: ['new ArrayDeque<>()', 'new ArrayDeque<Integer>()'],
      acceptRegex: ['^new\\s+ArrayDeque\\s*<\\s*>\\s*\\(\\s*\\)\\s*[;{]?$', '^new\\s+ArrayDeque\\s*<\\s*Integer\\s*>\\s*\\(\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'The Javadoc recommends **ArrayDeque** for stacks: it has push/pop/peek, is faster (no synchronization) and does not inherit Vector\'s index methods that break the LIFO idea.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Which legacy cursor interface does `vector.elements()` return?',
      example: { title: 'using it', code: 'while (e.hasMoreElements()) System.out.println(e.nextElement());' },
      accept: ['Enumeration', 'Enumeration<E>'],
      acceptRegex: ['^Enumeration\\s*[;{]?$', '^Enumeration\\s*<\\s*E\\s*>\\s*[;{]?$'],
      caseSensitive: true,
      explain: '**Enumeration** is the legacy cursor of Vector and Hashtable with `hasMoreElements()`/`nextElement()`. It is read-only; the modern Iterator also supports `remove()`.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'How does a full **Vector** grow by default compared with ArrayList?',
      options: ['Both grow by 1.5×', 'Vector doubles its capacity (2×); ArrayList grows by 1.5×', 'Vector grows by 1 element', 'Vector cannot grow'],
      answer: 1,
      explain: 'Vector doubles (unless a capacityIncrement is given); ArrayList grows by 50%. Vector\'s methods are also **synchronized**, which makes it slower in single-threaded code.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which are **legacy** classes from Java 1.0 (before the Collection Framework)? (choose all that apply)',
      options: ['Vector', 'Stack', 'Hashtable', 'ArrayList', 'Properties', 'ArrayDeque'],
      answers: [0, 1, 2, 4],
      explain: 'Vector, Stack, Hashtable, Properties and Enumeration existed before Java 1.2 and were later retro-fitted into the framework. ArrayList (1.2) and ArrayDeque (1.6) are modern.',
    },
  ],
};
