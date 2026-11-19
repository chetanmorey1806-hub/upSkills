export default {
  lesson: 'day-12-algorithms-big-o-searching-sorting',
  minutes: 26,
  intro: 'Estimate Big-O, trace recursion and binary search, and dry-run bubble and selection sort passes.',
  tasks: [
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the time complexity of this method?\n```\nfor (int i = 0; i < n; i++)\n    for (int j = 0; j < n; j++)\n        count++;\nfor (int k = 0; k < n; k++)\n    count++;\n```',
      options: ['O(n)', 'O(n log n)', 'O(n^2)', 'O(n^3)'],
      answer: 2,
      explain: 'The nested loops do n × n steps, the last loop n steps: n² + n. Big-O keeps only the **fastest-growing term** and drops constants, so it is **O(n²)**.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this recursive program print? (exactly as printed)',
      example: { title: 'base case + recursive case', text: 'Every recursive method needs a base case that stops the calls, otherwise StackOverflowError.' },
      code: `static int sum(int n) {
    if (n == 0) return 0;
    System.out.print(n + " ");
    return n + sum(n - 1);
}

public static void main(String[] args) {
    System.out.println(sum(4));
}`,
      expected: '4 3 2 1 10',
      explain: 'Before `println` can print the result, `sum(4)` runs: it prints "4 ", "3 ", "2 ", "1 " on the way down, then returns 4+3+2+1+0 = 10, which `println` adds on the same line.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Binary search for **40**. What does it print? (one line per println)',
      example: { title: 'integer division', text: 'mid = (low + high) / 2 uses integer division: (0 + 7) / 2 = 3.' },
      code: `int[] a = {3, 8, 12, 17, 25, 31, 40, 52};
int low = 0, high = a.length - 1, key = 40;
while (low <= high) {
    int mid = (low + high) / 2;
    System.out.println("mid=" + mid);
    if (a[mid] == key) { System.out.println("found at " + mid); break; }
    if (a[mid] < key) low = mid + 1;
    else high = mid - 1;
}`,
      expected: 'mid=3\nmid=5\nmid=6\nfound at 6',
      explain: 'mid=3 (17 < 40) → low=4. mid=(4+7)/2=5 (31 < 40) → low=6. mid=(6+7)/2=6 → 40 found. Only 3 checks for 8 elements: **O(log n)**. Binary search needs a **sorted** array.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Bubble sort on `{5, 1, 4, 2, 8}`. What is the array after pass 1 and after pass 2? Type each as printed by `Arrays.toString`.',
      example: { title: 'one bubble pass', text: 'Compare neighbours left to right and swap when the left one is bigger; the largest value "bubbles" to the end.' },
      code: `int[] a = {5, 1, 4, 2, 8};
for (int pass = 0; pass < 2; pass++) {
    for (int j = 0; j < a.length - 1 - pass; j++) {
        if (a[j] > a[j + 1]) { int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t; }
    }
    System.out.println(Arrays.toString(a));
}`,
      expected: '[1, 4, 2, 5, 8]\n[1, 2, 4, 5, 8]',
      explain: 'Pass 1: 5↔1, 5↔4, 5↔2, 5 vs 8 no swap → [1, 4, 2, 5, 8]. Pass 2: 1 vs 4 ok, 4↔2, 4 vs 5 ok → [1, 2, 4, 5, 8]. With a "swapped" flag bubble sort stops early when a pass makes no swaps.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Selection sort on `{64, 25, 12, 22, 11}`. What is the array after pass 1 and after pass 2?',
      example: { title: 'one selection pass', text: 'Find the minimum of the unsorted part and swap it to the front of that part.' },
      code: `int[] a = {64, 25, 12, 22, 11};
for (int i = 0; i < 2; i++) {
    int min = i;
    for (int j = i + 1; j < a.length; j++) if (a[j] < a[min]) min = j;
    int t = a[i]; a[i] = a[min]; a[min] = t;
    System.out.println(Arrays.toString(a));
}`,
      expected: '[11, 25, 12, 22, 64]\n[11, 12, 25, 22, 64]',
      explain: 'Pass 1: minimum 11 swaps with 64 → [11, 25, 12, 22, 64]. Pass 2: minimum of the rest is 12, swapped with 25 → [11, 12, 25, 22, 64]. Selection sort always does O(n²) comparisons but at most n−1 swaps.',
    },
    {
      type: 'multi',
      mins: 2,
      q: 'Which statements about **merge sort** and **quick sort** are TRUE? (choose all that apply)',
      options: [
        'Merge sort is O(n log n) in every case',
        'Merge sort needs O(n) extra memory for merging',
        'Quick sort is O(n log n) on average but O(n²) in the worst case (bad pivots)',
        'Quick sort is always stable',
        'Both use divide and conquer',
      ],
      answers: [0, 1, 2, 4],
      explain: 'Merge sort: always n log n, stable, extra array. Quick sort: in-place, usually fastest, but a bad pivot (e.g. sorted input with last-element pivot) gives n². Quick sort is **not stable**. Java uses a dual-pivot quicksort for primitives and TimSort (merge-based, stable) for objects.',
    },
  ],
};
