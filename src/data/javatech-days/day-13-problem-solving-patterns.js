const ex1 = `import java.util.Arrays;

public class Main {
    // Pair with given sum in a SORTED array
    static String pairWithSum(int[] a, int target) {
        int left = 0, right = a.length - 1;
        while (left < right) {
            int sum = a[left] + a[right];
            if (sum == target) return a[left] + " + " + a[right] + " = " + target;
            if (sum < target) left++;      // need bigger sum -> move left forward
            else right--;                  // need smaller sum -> move right back
        }
        return "No pair";
    }

    static boolean isPalindrome(String s) {
        int l = 0, r = s.length() - 1;
        while (l < r) {
            if (s.charAt(l) != s.charAt(r)) return false;
            l++;
            r--;
        }
        return true;
    }

    static void reverse(int[] a) {
        int l = 0, r = a.length - 1;
        while (l < r) {
            int t = a[l]; a[l] = a[r]; a[r] = t;
            l++;
            r--;
        }
    }

    // Returns count of unique elements; they are moved to the front
    static int removeDuplicates(int[] a) {
        int i = 0;                         // slow pointer: last unique position
        for (int j = 1; j < a.length; j++) {   // fast pointer: scans
            if (a[j] != a[i]) {
                i++;
                a[i] = a[j];
            }
        }
        return i + 1;
    }

    public static void main(String[] args) {
        int[] sorted = {1, 2, 4, 7, 11, 15};
        System.out.println("Pair for 15: " + pairWithSum(sorted, 15));
        System.out.println("Pair for 30: " + pairWithSum(sorted, 30));
        System.out.println("racecar palindrome: " + isPalindrome("racecar"));
        System.out.println("java palindrome: " + isPalindrome("java"));

        int[] nums = {1, 2, 3, 4, 5};
        reverse(nums);
        System.out.println("Reversed: " + Arrays.toString(nums));

        int[] dup = {1, 1, 2, 2, 2, 3, 4, 4};
        int k = removeDuplicates(dup);
        System.out.println("Unique count: " + k + ", array: " + Arrays.toString(Arrays.copyOf(dup, k)));
    }
}`;

const ex2 = `import java.util.HashSet;
import java.util.Set;

public class Main {
    // Fixed-size window
    static void maxSumWindow(int[] a, int k) {
        int windowSum = 0;
        for (int i = 0; i < k; i++) windowSum += a[i];     // first window
        int best = windowSum, bestStart = 0;
        for (int i = k; i < a.length; i++) {
            windowSum += a[i] - a[i - k];                   // add new, remove old
            if (windowSum > best) {
                best = windowSum;
                bestStart = i - k + 1;
            }
        }
        System.out.println("Max sum of " + k + " consecutive = " + best + " (window starts at index " + bestStart + ")");
    }

    // Variable-size window: longest substring without repeating characters
    static String longestUnique(String s) {
        Set<Character> window = new HashSet<>();
        int left = 0, best = 0, bestStart = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            while (window.contains(c)) {                    // shrink until no duplicate
                window.remove(s.charAt(left));
                left++;
            }
            window.add(c);
            if (right - left + 1 > best) {
                best = right - left + 1;
                bestStart = left;
            }
        }
        return s.substring(bestStart, bestStart + best);
    }

    public static void main(String[] args) {
        maxSumWindow(new int[]{2, 1, 5, 1, 3, 2}, 3);
        for (String s : new String[]{"abcabcbb", "pwwkew", "bbbb"}) {
            String ans = longestUnique(s);
            System.out.println(s + " -> " + ans + " (length " + ans.length() + ")");
        }
    }
}`;

const ex3 = `import java.util.Arrays;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    static Map<Character, Integer> frequency(String s) {
        Map<Character, Integer> map = new LinkedHashMap<>();   // keeps first-seen order
        for (char c : s.toCharArray()) map.put(c, map.getOrDefault(c, 0) + 1);
        return map;
    }

    static char firstNonRepeating(String s) {
        Map<Character, Integer> f = frequency(s);
        for (char c : s.toCharArray()) {
            if (f.get(c) == 1) return c;
        }
        return '_';
    }

    // Unsorted array: return indexes of two numbers adding to target, O(n)
    static int[] twoSum(int[] a, int target) {
        Map<Integer, Integer> seen = new HashMap<>();    // value -> index
        for (int i = 0; i < a.length; i++) {
            int need = target - a[i];
            if (seen.containsKey(need)) return new int[]{seen.get(need), i};
            seen.put(a[i], i);
        }
        return new int[0];
    }

    static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        int[] count = new int[26];
        for (int i = 0; i < a.length(); i++) {
            count[a.charAt(i) - 'a']++;
            count[b.charAt(i) - 'a']--;
        }
        for (int c : count) if (c != 0) return false;
        return true;
    }

    public static void main(String[] args) {
        System.out.println("Frequency: " + frequency("programming"));
        System.out.println("First non-repeating in swiss: " + firstNonRepeating("swiss"));
        System.out.println("Two sum [2,7,11,15] target 9: " + Arrays.toString(twoSum(new int[]{2, 7, 11, 15}, 9)));
        System.out.println("Two sum [3,2,4] target 6: " + Arrays.toString(twoSum(new int[]{3, 2, 4}, 6)));
        System.out.println("listen/silent anagram: " + isAnagram("listen", "silent"));
        System.out.println("hello/world anagram: " + isAnagram("hello", "world"));
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

public class Main {
    static int rangeSum(int[] prefix, int l, int r) {
        return prefix[r + 1] - prefix[l];          // O(1) per query
    }

    // Count subarrays whose sum equals k (works with negatives too)
    static int countSubarrays(int[] a, int k) {
        Map<Integer, Integer> prefixCount = new HashMap<>();
        prefixCount.put(0, 1);                      // empty prefix
        int sum = 0, count = 0;
        for (int x : a) {
            sum += x;
            count += prefixCount.getOrDefault(sum - k, 0);
            prefixCount.put(sum, prefixCount.getOrDefault(sum, 0) + 1);
        }
        return count;
    }

    public static void main(String[] args) {
        int[] a = {3, 1, 4, 1, 5, 9, 2, 6};
        int[] prefix = new int[a.length + 1];
        for (int i = 0; i < a.length; i++) prefix[i + 1] = prefix[i] + a[i];

        System.out.println("Array:  " + Arrays.toString(a));
        System.out.println("Prefix: " + Arrays.toString(prefix));
        System.out.println("Sum(2..5) = " + rangeSum(prefix, 2, 5));
        System.out.println("Sum(0..7) = " + rangeSum(prefix, 0, 7));
        System.out.println("Sum(3..3) = " + rangeSum(prefix, 3, 3));
        System.out.println("Subarrays of [1, 1, 1] with sum 2: " + countSubarrays(new int[]{1, 1, 1}, 2));
        System.out.println("Subarrays of [1, 2, 3] with sum 3: " + countSubarrays(new int[]{1, 2, 3}, 3));
    }
}`;

const ex5 = `import java.util.ArrayDeque;
import java.util.Arrays;
import java.util.Deque;

public class Main {
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '[' || c == '{') {
                stack.push(c);
            } else if (c == ')' || c == ']' || c == '}') {
                if (stack.isEmpty()) return false;
                char open = stack.pop();
                if ((c == ')' && open != '(') || (c == ']' && open != '[') || (c == '}' && open != '{')) {
                    return false;
                }
            }                                  // other characters are ignored
        }
        return stack.isEmpty();                // leftover '(' means unbalanced
    }

    // Monotonic stack: next greater element to the right
    static int[] nextGreater(int[] a) {
        int[] result = new int[a.length];
        Deque<Integer> stack = new ArrayDeque<>();
        for (int i = a.length - 1; i >= 0; i--) {
            while (!stack.isEmpty() && stack.peek() <= a[i]) stack.pop();
            result[i] = stack.isEmpty() ? -1 : stack.peek();
            stack.push(a[i]);
        }
        return result;
    }

    public static void main(String[] args) {
        String[] tests = {"{[()]}", "([)]", "((()", "a(b)c[d]"};
        for (String t : tests) System.out.println(t + " -> " + isBalanced(t));
        System.out.println("Next greater of [4, 5, 2, 25]: " + Arrays.toString(nextGreater(new int[]{4, 5, 2, 25})));
        System.out.println("Next greater of [13, 7, 6, 12]: " + Arrays.toString(nextGreater(new int[]{13, 7, 6, 12})));
    }
}`;

const ex6 = `import java.util.Arrays;

public class Main {
    static long calls = 0;

    static long fibNaive(int n) {                 // O(2^n)
        calls++;
        if (n <= 1) return n;
        return fibNaive(n - 1) + fibNaive(n - 2);
    }

    static long[] memo = new long[91];
    static long fibMemo(int n) {                  // top-down DP, O(n)
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    }

    static long fibTab(int n) {                   // bottom-up DP, O(n) time, O(1) space
        if (n <= 1) return n;
        long prev = 0, cur = 1;
        for (int i = 2; i <= n; i++) {
            long next = prev + cur;
            prev = cur;
            cur = next;
        }
        return cur;
    }

    // Climbing stairs: 1 or 2 steps at a time
    static int[] stairsTable(int n) {
        int[] dp = new int[n + 1];
        dp[0] = 1;                                // one way to stand still
        dp[1] = 1;
        for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
        return dp;
    }

    public static void main(String[] args) {
        System.out.println("fibNaive(20) = " + fibNaive(20) + " using " + calls + " calls");
        System.out.println("fibMemo(50) = " + fibMemo(50));
        System.out.println("fibTab(10) = " + fibTab(10));
        System.out.println("dp table for 5 stairs: " + Arrays.toString(stairsTable(5)));
        System.out.println("Ways to climb 5 stairs = " + stairsTable(5)[5]);
        System.out.println("Ways to climb 10 stairs = " + stairsTable(10)[10]);
    }
}`;

export default {
  id: 'day-13-problem-solving-patterns',
  title: 'Problem-Solving Patterns for Coding Interviews: Two Pointers, Sliding Window, Hashing, Prefix Sum, Stack and DP',
  module: 'Module 3: Data Structures & Algorithms in Java',
  day: 13,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Most coding-round questions are variations of a few patterns. Learn to recognise and apply two pointers, sliding window, hashing, prefix sums, stack tricks and basic dynamic programming to turn O(n^2) brute force into O(n) solutions.',
  objectives: [
    'Recognise which pattern fits a problem from keywords in the question',
    'Use two pointers and sliding window to solve array/string problems in O(n)',
    'Use HashMap frequency counting, two-sum and prefix sums',
    'Solve balanced brackets and next greater element with a stack',
    'Apply memoization and tabulation for Fibonacci and climbing stairs',
  ],
  theory: [
    {
      heading: 'Why Patterns? From Brute Force to Optimal',
      content: 'Product companies and service companies (TCS Digital, Infosys SP, Accenture, startups) ask questions like "find a pair with sum X" or "longest substring without repeating characters". The brute force usually checks every pair or every subarray — O(n^2) or O(n^3). Patterns are reusable tricks that cut this down to O(n) or O(n log n). Like a mechanic who recognises a problem from the sound of the engine, you learn to recognise the pattern from the wording.',
      points: [
        '"Sorted array", "pair", "reverse", "palindrome" -> Two pointers',
        '"Subarray/substring of size k", "longest/shortest window" -> Sliding window',
        '"Count", "duplicate", "first unique", "anagram", "pair in unsorted array" -> Hashing',
        '"Range sum", "subarray sum equals k" -> Prefix sum',
        '"Brackets", "next greater/smaller", "undo" -> Stack',
        '"Number of ways", "min/max cost", overlapping sub-problems -> Dynamic Programming',
      ],
      tip: 'In the interview, first state the brute force and its complexity, then say "we can optimise this using the X pattern".',
    },
    {
      heading: 'Two Pointers',
      content: 'Use two indexes that move towards each other (from both ends) or in the same direction (slow and fast). In a sorted array, if the sum of the two ends is too small, move the left pointer right to increase it; if too big, move the right pointer left. Analogy: two people searching a long corridor from both ends meet much faster than one person checking every door.',
      syntax: `int left = 0, right = n - 1;
while (left < right) {
    if (condition met) return;
    else if (need bigger) left++;
    else right--;
}`,
      points: [
        'Pair with given sum in sorted array: O(n) instead of O(n^2)',
        'Reverse array / check palindrome in place',
        'Remove duplicates from a sorted array (slow and fast pointers)',
        'Move all zeros to the end, merge two sorted arrays',
        'Floyd\'s slow/fast pointers detect cycles in a linked list',
      ],
    },
    {
      heading: 'Sliding Window',
      content: 'For problems about contiguous subarrays or substrings, keep a "window" and slide it instead of recomputing from scratch. Fixed window: add the new element and remove the element that leaves — like a train window where one new tree appears and one old tree disappears as you move. Variable window: expand right; when the window becomes invalid (duplicate char, sum too big), shrink from the left.',
      syntax: `// fixed size k
sum += a[i] - a[i - k];

// variable size
for (right ...) { add a[right]; while (invalid) { remove a[left]; left++; } update answer; }`,
      points: [
        'Maximum sum of k consecutive elements: O(n) instead of O(n*k)',
        'Longest substring without repeating characters',
        'Smallest subarray with sum >= target',
        'Each element enters and leaves the window at most once, so total O(n)',
      ],
    },
    {
      heading: 'Hashing and Frequency Maps',
      content: 'A HashMap gives O(1) average lookup, so it can "remember" what you have already seen. Instead of searching the array again for the partner of a number, check the map. Analogy: a register at a society gate — the watchman checks the register instead of knocking on every flat.',
      syntax: `map.put(key, map.getOrDefault(key, 0) + 1);   // counting
map.merge(key, 1, Integer::sum);              // same, shorter
int[] count = new int[26];                    // for lowercase letters only (faster)`,
      points: [
        'Character/word frequency, first non-repeating character, duplicates',
        'Two Sum in an unsorted array: store value -> index, look up target - value',
        'Anagram check: same letter counts',
        'Use LinkedHashMap when you need insertion order, TreeMap for sorted keys — HashMap order is not guaranteed',
        'Trade-off: O(n) extra memory for O(n) time',
      ],
    },
    {
      heading: 'Prefix Sum',
      content: 'prefix[i] stores the sum of the first i elements. Then the sum of any range l..r is prefix[r + 1] - prefix[l] in O(1). Analogy: the running total column in a bank passbook — to know how much you spent between two dates, subtract the two balances instead of adding every entry.',
      syntax: `prefix[0] = 0;
prefix[i + 1] = prefix[i] + a[i];
sum(l..r) = prefix[r + 1] - prefix[l];`,
      points: [
        'Build once in O(n), answer each range query in O(1)',
        'Subarray sum equals k: count how many earlier prefixes equal (currentSum - k) using a HashMap',
        'Also used for equilibrium index, 2D matrix sums, and difference arrays',
      ],
    },
    {
      heading: 'Stack Problems',
      content: 'Use a stack when the most recent unmatched item matters. For balanced brackets, push every opening bracket; on a closing bracket, the top must be the matching opener. A monotonic stack keeps elements in increasing or decreasing order and solves "next greater element" in O(n). Analogy: closing brackets are like closing nested boxes — you must close the innermost box first.',
      points: [
        'Balanced parentheses, valid expression, remove adjacent duplicates',
        'Next greater / next smaller element, stock span, daily temperatures',
        'Infix to postfix conversion and postfix evaluation',
        'Use ArrayDeque<Character> with push/pop/peek',
      ],
    },
    {
      heading: 'Dynamic Programming Basics',
      content: 'Dynamic Programming (DP) = recursion + remembering answers. When the same sub-problem is solved again and again (overlapping sub-problems) and the answer can be built from smaller answers (optimal substructure), store results. Naive Fibonacci recalculates fib(3) many times — like asking a friend the same sum again and again instead of writing it down once.',
      syntax: `Memoization (top-down):  recursion + memo[] array
Tabulation (bottom-up):  loop filling dp[] from small to big
Climbing stairs: dp[i] = dp[i-1] + dp[i-2]   (last step was 1 or 2)`,
      points: [
        'Steps: define state dp[i], write recurrence, set base cases, decide order',
        'Naive fib(n) is O(2^n); with DP it becomes O(n)',
        'Tabulation avoids deep recursion (no StackOverflowError) and can often use O(1) space',
        'Classic beginner DP: fibonacci, climbing stairs, min coins, house robber, 0/1 knapsack, longest common subsequence',
      ],
      tip: 'If a recursive solution calls itself twice with overlapping arguments, think DP.',
    },
  ],
  examples: [
    {
      title: 'Two Pointers: pair sum, palindrome, reverse, remove duplicates',
      scenario: 'Solve four classic array/string questions with two indexes and no extra memory.',
      steps: [
        'In IntelliJ: create class Main in a new Java project',
        'Write each method with left/right or slow/fast pointers',
        'Run and trace pairWithSum(15): (1,15)=16 too big -> right--; (1,11)=12 small -> left++; (2,11)=13 -> left++; (4,11)=15 found',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Pair for 15: 4 + 11 = 15
Pair for 30: No pair
racecar palindrome: true
java palindrome: false
Reversed: [5, 4, 3, 2, 1]
Unique count: 4, array: [1, 2, 3, 4]`,
      explanation: 'For target 30 the sum never reaches 30 (max is 11 + 15 = 26), so pointers meet and "No pair" is returned. removeDuplicates keeps i at the last unique value and copies each new value found by j to position i + 1, giving 4 unique values at the front.',
    },
    {
      title: 'Sliding Window: max sum of k elements and longest unique substring',
      scenario: 'Find the best 3-day sales total and the longest password segment without repeated characters.',
      steps: [
        'Create Main.java with maxSumWindow (fixed window) and longestUnique (variable window)',
        'Run the program',
        'Trace the fixed window: 8, then 8 + 1 - 2 = 7, then 7 + 3 - 1 = 9, then 9 + 2 - 5 = 6',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Max sum of 3 consecutive = 9 (window starts at index 2)
abcabcbb -> abc (length 3)
pwwkew -> wke (length 3)
bbbb -> b (length 1)`,
      explanation: 'The best window is [5, 1, 3] = 9 starting at index 2. For "pwwkew", the second w forces the left side to move past the first w; the window later grows to "wke". Only a strictly longer window replaces the answer, so for "abcabcbb" the first "abc" is kept. HashSet is used only for contains/remove, so its iteration order never affects output.',
    },
    {
      title: 'Hashing: frequency, first unique, two sum, anagram',
      scenario: 'Use maps and count arrays to answer counting questions in a single pass.',
      steps: [
        'Create Main.java and import HashMap, LinkedHashMap, Map, Arrays',
        'Use LinkedHashMap for frequency so the printed order is predictable',
        'Run and verify each line',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Frequency: {p=1, r=2, o=1, g=2, a=1, m=2, i=1, n=1}
First non-repeating in swiss: w
Two sum [2,7,11,15] target 9: [0, 1]
Two sum [3,2,4] target 6: [1, 2]
listen/silent anagram: true
hello/world anagram: false`,
      explanation: 'LinkedHashMap prints keys in the order they first appeared in "programming". In "swiss", s appears 3 times, so w is the first character with count 1. For two sum [3,2,4], when i = 2 (value 4) we need 2, which was stored at index 1. Anagram uses a 26-size count array: +1 for the first word, -1 for the second; all zeros means anagram.',
    },
    {
      title: 'Prefix Sum: range queries and subarray sum equals k',
      scenario: 'Answer many "total between day l and day r" queries instantly, and count subarrays with a given sum.',
      steps: [
        'Create Main.java and build the prefix array of size n + 1',
        'Write rangeSum using prefix[r + 1] - prefix[l]',
        'Write countSubarrays using a HashMap of prefix sums',
        'Run and verify Sum(2..5) = 4 + 1 + 5 + 9 = 19',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Array:  [3, 1, 4, 1, 5, 9, 2, 6]
Prefix: [0, 3, 4, 8, 9, 14, 23, 25, 31]
Sum(2..5) = 19
Sum(0..7) = 31
Sum(3..3) = 1
Subarrays of [1, 1, 1] with sum 2: 2
Subarrays of [1, 2, 3] with sum 3: 2`,
      explanation: 'Sum(2..5) = prefix[6] - prefix[2] = 23 - 4 = 19. For [1, 2, 3] and k = 3: running sums are 1, 3, 6. At sum 3, the earlier prefix 0 exists (subarray [1,2]); at sum 6, prefix 3 exists (subarray [3]); so 2 subarrays.',
    },
    {
      title: 'Stack: balanced brackets and next greater element',
      scenario: 'Validate code brackets like an IDE does, and find the next higher price for each day.',
      steps: [
        'Create Main.java and use ArrayDeque as the stack',
        'Write isBalanced: push openers, pop and match on closers, stack must be empty at the end',
        'Write nextGreater scanning from right to left',
        'Run the program',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `{[()]} -> true
([)] -> false
((() -> false
a(b)c[d] -> true
Next greater of [4, 5, 2, 25]: [5, 25, 25, -1]
Next greater of [13, 7, 6, 12]: [-1, 12, 12, -1]`,
      explanation: 'In "([)]" the ")" arrives while "[" is on top — mismatch. "((()" leaves two "(" on the stack, so false. For next greater, scanning from the right: 25 has none (-1); 2 sees 25; 5 pops 2 and sees 25; 4 sees 5. In the second array, 13 pops 7 and 12 and finds nothing bigger, so -1.',
    },
    {
      title: 'Dynamic Programming: Fibonacci three ways and Climbing Stairs',
      scenario: 'See how naive recursion explodes, and how memoization and tabulation fix it.',
      steps: [
        'Create Main.java with fibNaive (counting calls), fibMemo and fibTab',
        'Write stairsTable that fills dp[0..n]',
        'Run and compare 21891 calls for naive fib(20) with just 20 loop steps for tabulation',
      ],
      code: ex6,
      java: { files: { 'Main.java': ex6 } },
      result: `fibNaive(20) = 6765 using 21891 calls
fibMemo(50) = 12586269025
fibTab(10) = 55
dp table for 5 stairs: [1, 1, 2, 3, 5, 8]
Ways to climb 5 stairs = 8
Ways to climb 10 stairs = 89`,
      explanation: 'Naive fib(20) makes 21,891 calls because the same values are recomputed again and again. Memoization computes each fib(i) once, so fib(50) is instant (naive would take billions of calls). For stairs, the last move is either 1 step (from i-1) or 2 steps (from i-2), so dp[i] = dp[i-1] + dp[i-2] — it is the Fibonacci series again.',
    },
  ],
  interview: [
    { q: 'How do you find a pair with a given sum in an unsorted array in O(n)?', a: 'Use a HashMap/HashSet. For each element x, check if (target - x) is already in the set; if yes, pair found, otherwise add x. O(n) time, O(n) space. If the array is sorted, two pointers give O(n) time and O(1) space.', level: 'Easy' },
    { q: 'When do you use sliding window instead of two pointers?', a: 'Sliding window is a special two-pointer technique for CONTIGUOUS subarrays/substrings where you maintain some state of the window (sum, set of chars, counts). Two pointers in general can also move from both ends on sorted data.', level: 'Medium' },
    { q: 'Explain the longest substring without repeating characters solution.', a: 'Keep a window [left, right] and a set of its characters. Move right one step at a time; while the new char is already in the set, remove s[left] and move left forward. Update the best length after adding. Each char is added and removed at most once, so O(n).', level: 'Medium' },
    { q: 'What is a prefix sum and when is it useful?', a: 'prefix[i] = sum of first i elements. Any range sum becomes prefix[r+1] - prefix[l] in O(1). Useful for many range-sum queries and for counting subarrays with sum k (combined with a HashMap).', level: 'Easy' },
    { q: 'How do you check balanced parentheses?', a: 'Scan characters; push opening brackets onto a stack; on a closing bracket, if the stack is empty or the top is not the matching opener, return false; else pop. At the end, the stack must be empty. O(n).', level: 'Easy' },
    { q: 'What is dynamic programming? Memoization vs tabulation?', a: 'DP solves problems with overlapping sub-problems and optimal substructure by storing sub-results. Memoization is top-down: recursion plus a cache. Tabulation is bottom-up: fill a table iteratively from base cases. Tabulation avoids recursion depth issues; memoization only computes needed states.', level: 'Medium' },
    { q: 'What is the output: fib using dp where dp[0]=0, dp[1]=1; print dp[7]?', a: '13. Series: 0, 1, 1, 2, 3, 5, 8, 13 (index 0 to 7).', level: 'Easy' },
    { q: 'How many ways to climb 4 stairs taking 1 or 2 steps?', a: '5: 1111, 112, 121, 211, 22. dp = [1, 1, 2, 3, 5].', level: 'Easy' },
    { q: 'Why should you not rely on HashMap iteration order in answers like "first non-repeating character"?', a: 'HashMap does not keep insertion order. Either loop over the original string again (checking counts) or use LinkedHashMap, which preserves insertion order.', level: 'Medium' },
    { q: 'What is a monotonic stack? Give one use.', a: 'A stack where elements are kept in increasing or decreasing order by popping elements that break the order. It solves next greater element, stock span and largest rectangle in histogram in O(n) because each element is pushed and popped once.', level: 'Hard' },
    { q: 'Time complexity of brute force vs optimal for "max sum subarray of size k"?', a: 'Brute force recomputes each window: O(n*k). Sliding window updates the sum by adding the new element and subtracting the old: O(n).', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Move all zeros to the end of the array while keeping the order of non-zero elements: {0, 1, 0, 3, 12} -> [1, 3, 12, 0, 0]. Use two pointers.',
      hint: 'Pointer pos marks where the next non-zero goes. Copy non-zeros forward, then fill the rest with 0.',
      solution: `import java.util.Arrays;

public class Main {
    static void moveZeros(int[] a) {
        int pos = 0;
        for (int x : a) if (x != 0) a[pos++] = x;
        while (pos < a.length) a[pos++] = 0;
    }

    public static void main(String[] args) {
        int[] a = {0, 1, 0, 3, 12};
        moveZeros(a);
        System.out.println(Arrays.toString(a));   // [1, 3, 12, 0, 0]
    }
}`,
    },
    {
      task: 'Find the length of the smallest subarray with sum >= target. Input {2, 3, 1, 2, 4, 3}, target 7 -> 2 ([4, 3]).',
      hint: 'Variable sliding window: expand right, and while sum >= target, record length and shrink from the left.',
      solution: `public class Main {
    static int minSubArrayLen(int target, int[] a) {
        int left = 0, sum = 0, best = Integer.MAX_VALUE;
        for (int right = 0; right < a.length; right++) {
            sum += a[right];
            while (sum >= target) {
                best = Math.min(best, right - left + 1);
                sum -= a[left++];
            }
        }
        return best == Integer.MAX_VALUE ? 0 : best;
    }

    public static void main(String[] args) {
        System.out.println(minSubArrayLen(7, new int[]{2, 3, 1, 2, 4, 3}));   // 2
    }
}`,
    },
    {
      task: 'Group anagrams: {"eat", "tea", "tan", "ate", "nat", "bat"}. Print groups in a predictable order.',
      hint: 'Key = sorted characters of the word. Use TreeMap<String, List<String>> so keys print in sorted order.',
      solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String[] words = {"eat", "tea", "tan", "ate", "nat", "bat"};
        Map<String, List<String>> groups = new TreeMap<>();
        for (String w : words) {
            char[] c = w.toCharArray();
            Arrays.sort(c);
            String key = new String(c);
            groups.computeIfAbsent(key, k -> new ArrayList<>()).add(w);
        }
        System.out.println(groups);
        // {abt=[bat], aet=[eat, tea, ate], ant=[tan, nat]}
    }
}`,
    },
    {
      task: 'Minimum coins: given coins {1, 2, 5} and amount 11, find the minimum number of coins (answer 3 = 5 + 5 + 1). Return -1 if impossible.',
      hint: 'dp[a] = min over coins c of dp[a - c] + 1. Initialise dp with a big value and dp[0] = 0.',
      solution: `import java.util.Arrays;

public class Main {
    static int minCoins(int[] coins, int amount) {
        int[] dp = new int[amount + 1];
        Arrays.fill(dp, amount + 1);          // "infinity"
        dp[0] = 0;
        for (int a = 1; a <= amount; a++) {
            for (int c : coins) {
                if (c <= a) dp[a] = Math.min(dp[a], dp[a - c] + 1);
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }

    public static void main(String[] args) {
        System.out.println(minCoins(new int[]{1, 2, 5}, 11));   // 3
        System.out.println(minCoins(new int[]{2}, 3));          // -1
    }
}`,
    },
    {
      task: 'House Robber: houses have money {2, 7, 9, 3, 1}. You cannot rob two adjacent houses. Find the maximum money (answer 12 = 2 + 9 + 1).',
      hint: 'dp[i] = max(dp[i-1], dp[i-2] + money[i]). Keep only two variables.',
      solution: `public class Main {
    static int rob(int[] money) {
        int prev2 = 0, prev1 = 0;
        for (int m : money) {
            int cur = Math.max(prev1, prev2 + m);
            prev2 = prev1;
            prev1 = cur;
        }
        return prev1;
    }

    public static void main(String[] args) {
        System.out.println(rob(new int[]{2, 7, 9, 3, 1}));   // 12
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'Which pattern best solves "maximum sum of any 4 consecutive elements"?',
      options: ['Binary search', 'Dynamic programming', 'Sliding window', 'Recursion'],
      answer: 2,
      explanation: 'A fixed-size window of 4 slides across the array, adding one element and removing one each step: O(n).',
    },
    {
      question: 'What does prefix[r + 1] - prefix[l] give (prefix[0] = 0)?',
      options: ['Sum of elements from index l to r', 'Sum from l to r - 1', 'Average of l..r', 'Product of l..r'],
      answer: 0,
      explanation: 'prefix[r + 1] is the sum of a[0..r] and prefix[l] is the sum of a[0..l-1]; their difference is a[l..r].',
    },
    {
      question: 'For the string "(]" what does the balanced-brackets algorithm return?',
      options: ['true', 'false', 'Throws an exception', 'Depends on HashMap order'],
      answer: 1,
      explanation: '"]" arrives while "(" is on top of the stack; they do not match, so false.',
    },
    {
      question: 'Two Sum in an UNSORTED array in O(n) time uses which data structure?',
      options: ['Stack', 'TreeSet', 'Queue', 'HashMap'],
      answer: 3,
      explanation: 'Store each value with its index; for every element, look up target - value in O(1).',
    },
    {
      question: 'How many ways are there to climb 6 stairs taking 1 or 2 steps at a time?',
      options: ['13', '8', '21', '12'],
      answer: 0,
      explanation: 'dp = 1, 1, 2, 3, 5, 8, 13 for n = 0..6, so 13 ways.',
    },
  ],
};
