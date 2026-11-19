export default {
  lesson: 'day-13-problem-solving-patterns',
  minutes: 26,
  intro: 'Dry-run two pointers, sliding window, hashing, prefix sums, a stack check and a small DP, and recognise which pattern fits a question.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Two pointers on a **sorted** array. What does this print?',
      example: { title: 'moving the pointers', text: 'Sum too small → move left pointer right (bigger value). Sum too big → move right pointer left.' },
      code: `int[] a = {1, 3, 4, 6, 8, 11};
int target = 10, i = 0, j = a.length - 1;
while (i < j) {
    int sum = a[i] + a[j];
    if (sum == target) { System.out.println(a[i] + " " + a[j]); break; }
    if (sum < target) i++; else j--;
}`,
      expected: '4 6',
      explain: '1+11=12 (j--), 1+8=9 (i++), 3+8=11 (j--), 3+6=9 (i++), 4+6=10 → found. One pass = **O(n)** instead of checking every pair (O(n²)).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Sliding window: what is the maximum sum of any **3 consecutive** elements? (what does it print)',
      example: { title: 'slide instead of recompute', text: 'window = window + a[i] - a[i - k]: add the new element, remove the one that left.' },
      code: `int[] a = {2, 1, 5, 1, 3, 2};
int k = 3, window = 0;
for (int i = 0; i < k; i++) window += a[i];
int best = window;
for (int i = k; i < a.length; i++) {
    window += a[i] - a[i - k];
    best = Math.max(best, window);
}
System.out.println(best);`,
      expected: '9',
      explain: 'Windows: 2+1+5=8, 1+5+1=7, 5+1+3=**9**, 1+3+2=6. Each step reuses the previous sum, so it is O(n).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Hashing: what does this print for the word `"swiss"`?',
      example: { title: 'frequency map', code: 'Map<Character, Integer> freq = new HashMap<>();\nfor (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);' },
      code: `String s = "swiss";
Map<Character, Integer> freq = new LinkedHashMap<>();
for (char c : s.toCharArray()) freq.merge(c, 1, Integer::sum);
System.out.println(freq);
for (char c : s.toCharArray()) {
    if (freq.get(c) == 1) { System.out.println(c); break; }
}`,
      expected: '{s=3, w=1, i=1}\nw',
      explain: '`LinkedHashMap` keeps insertion order: s appears 3 times, w and i once. The second loop scans the **string** in order and the first character with count 1 is **w**. Two passes = O(n).',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Prefix sum. What does this print? (two lines)',
      example: { title: 'range sum in O(1)', text: 'sum of a[l..r] = prefix[r + 1] - prefix[l]' },
      code: `int[] a = {3, 1, 4, 1, 5, 9, 2};
int[] prefix = new int[a.length + 1];
for (int i = 0; i < a.length; i++) prefix[i + 1] = prefix[i] + a[i];
System.out.println(Arrays.toString(prefix));
int l = 2, r = 5;
System.out.println(prefix[r + 1] - prefix[l]);`,
      expected: '[0, 3, 4, 8, 9, 14, 23, 25]\n19',
      explain: 'prefix[i] = sum of the first i elements. Sum of indexes 2..5 = prefix[6] − prefix[2] = 23 − 4 = **19** (4+1+5+9). After O(n) preparation every range query is O(1).',
    },
    {
      type: 'multi',
      mins: 3,
      q: 'Match the question to the pattern. Which pairs are good choices? (choose all that apply)',
      options: [
        'Longest substring without repeating characters → sliding window + set/map',
        'Check if brackets like "({[]})" are balanced → stack',
        'Two numbers in an UNSORTED array that add up to a target → HashMap of seen values',
        'Many queries "sum of a[l..r]" on a fixed array → prefix sum',
        'Next greater element for every item → nested loops are the only way',
      ],
      answers: [0, 1, 2, 3],
      explain: 'Recognising the pattern is half the solution. "Next greater element" is a classic **monotonic stack** problem solved in O(n), so nested loops (O(n²)) are not the only way. For brackets, push openers and pop when a matching closer arrives; the stack must be empty at the end.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Dynamic programming: in how many ways can you climb **6** stairs taking 1 or 2 steps at a time? (what does it print)',
      example: { title: 'small cases', text: 'ways(1) = 1, ways(2) = 2, ways(3) = 3 (1+1+1, 1+2, 2+1)' },
      code: `int n = 6;
int[] dp = new int[n + 1];
dp[0] = 1; dp[1] = 1;
for (int i = 2; i <= n; i++) dp[i] = dp[i - 1] + dp[i - 2];
System.out.println(dp[n]);`,
      expected: '13',
      explain: 'To reach step i you come from i−1 or i−2, so dp[i] = dp[i−1] + dp[i−2]: 1, 1, 2, 3, 5, 8, **13**. Storing answers to sub-problems (tabulation) turns exponential recursion into O(n).',
    },
  ],
};
