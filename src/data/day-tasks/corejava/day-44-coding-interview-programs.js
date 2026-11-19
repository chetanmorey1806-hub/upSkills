export default {
  lesson: 'day-44-coding-interview-programs',
  minutes: 25,
  intro: 'Trace and complete the classic interview programs: Fibonacci, primes, Armstrong numbers, sorting and binary search.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Number programs: what does this program print?',
      example: { title: 'Armstrong check for 370', code: '3³ + 7³ + 0³ = 27 + 343 + 0 = 370 → Armstrong' },
      code: `public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        for (int d = 2; d * d <= n; d++) if (n % d == 0) return false;
        return true;
    }
    static boolean isArmstrong(int n) {
        int digits = String.valueOf(n).length(), sum = 0, t = n;
        while (t > 0) {
            sum += (int) Math.pow(t % 10, digits);
            t /= 10;
        }
        return sum == n;
    }
    public static void main(String[] args) {
        int a = 0, b = 1;
        for (int i = 0; i < 8; i++) {
            System.out.print(a + " ");
            int c = a + b; a = b; b = c;
        }
        System.out.println();
        for (int n = 1; n <= 20; n++) if (isPrime(n)) System.out.print(n + " ");
        System.out.println();
        System.out.println(isArmstrong(153) + " " + isArmstrong(154));
    }
}`,
      expected: `0 1 1 2 3 5 8 13 
2 3 5 7 11 13 17 19 
true false`,
      explain: 'Fibonacci: each term is the sum of the previous two (0 1 1 2 3 5 8 13). The prime test only checks divisors up to √n and treats 1 as not prime. 153 = 1³ + 5³ + 3³ = 1 + 125 + 27, so it is an Armstrong number; 154 is not.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Bubble sort trace: what does this program print?',
      example: { title: 'one swap', code: 'int tmp = a[j]; a[j] = a[j + 1]; a[j + 1] = tmp;' },
      code: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {5, 1, 4, 2, 8};
        int passes = 0;
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    swapped = true;
                }
            }
            passes++;
            System.out.println(Arrays.toString(a));
            if (!swapped) break;
        }
        System.out.println("passes = " + passes);
    }
}`,
      expected: `[1, 4, 2, 5, 8]
[1, 2, 4, 5, 8]
[1, 2, 4, 5, 8]
passes = 3`,
      explain: 'Each pass bubbles the largest remaining value to the end. After pass 1: [1, 4, 2, 5, 8]; after pass 2 the array is already sorted; pass 3 makes no swap, so the `swapped` flag stops the loop early. This optimisation gives O(n) for already-sorted input; the worst case is O(n²).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Binary search: complete the **overflow-safe** middle index calculation:
\`int mid = ____;\``,
      example: {
        title: 'the loop around it',
        code: `while (low <= high) {
  int mid = ...;
  if (a[mid] == key) return mid;
  else if (a[mid] < key) low = mid + 1;
  else high = mid - 1;
}`,
      },
      accept: ['low + (high - low) / 2', '(low + high) >>> 1', 'low + ((high - low) / 2)'],
      acceptRegex: [
        '^low\\s*\\+\\s*\\(\\s*high\\s*-\\s*low\\s*\\)\\s*\\/\\s*2\\s*[;{]?$',
        '^\\(\\s*low\\s*\\+\\s*high\\s*\\)\\s*>\\s*>\\s*>\\s*1\\s*[;{]?$',
        '^low\\s*\\+\\s*\\(\\s*\\(\\s*high\\s*-\\s*low\\s*\\)\\s*\\/\\s*2\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`low + (high - low) / 2` gives the middle without overflow; `(low + high) / 2` works for normal sizes but can overflow int for very large arrays (a famous JDK bug). Binary search needs a **sorted** array and runs in O(log n).',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Recursive factorial: complete the base-case condition so \`fact(0)\` and \`fact(1)\` return 1:
\`static long fact(int n) { if (____) return 1; return n * fact(n - 1); }\``,
      example: {
        title: 'recursive sum of digits',
        code: 'static int sumDigits(int n) { if (n == 0) return 0; return n % 10 + sumDigits(n / 10); }',
      },
      accept: ['n <= 1', 'n < 2', 'n == 0 || n == 1', 'n == 1 || n == 0'],
      acceptRegex: [
        '^n\\s*<\\s*=\\s*1\\s*[;{]?$',
        '^n\\s*<\\s*2\\s*[;{]?$',
        '^n\\s*=\\s*=\\s*0\\s*\\|\\s*\\|\\s*n\\s*=\\s*=\\s*1\\s*[;{]?$',
        '^n\\s*=\\s*=\\s*1\\s*\\|\\s*\\|\\s*n\\s*=\\s*=\\s*0\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'Every recursion needs a **base case** that stops it; without it the calls go on until StackOverflowError. Use `long` because factorials grow fast (13! already overflows int).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'What is the time complexity of finding duplicates in an array using a `HashSet` (add each element, check the return value)?',
      options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(1)'],
      answer: 2,
      explain: 'Each `add`/`contains` on a HashSet is O(1) on average, so one pass over n elements is **O(n)**, using O(n) extra memory. Two nested loops would be O(n²) and sorting first would be O(n log n).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Array 1..n with one number missing (n = 100, 99 values given). What is the simplest O(n) way to find the missing number?',
      options: [
        'Sort and compare neighbours',
        'n * (n + 1) / 2 minus the sum of the given values',
        'Check every number from 1 to 100 with a nested loop',
        'Use binary search on the unsorted array',
      ],
      answer: 1,
      explain: 'The sum 1..n is n(n + 1)/2 = 5050; subtracting the actual sum leaves the missing number. Use long (or XOR) for very large n to avoid overflow.',
    },
  ],
};
