const ex1 = `import java.util.Scanner;

public class Main {
    static boolean isPrime(int n) {
        if (n < 2) return false;
        if (n % 2 == 0) return n == 2;
        for (int i = 3; i * i <= n; i += 2) {   // check only odd numbers up to sqrt(n)
            if (n % i == 0) return false;
        }
        return true;
    }

    static boolean isArmstrong(int n) {
        int digits = String.valueOf(n).length();
        int sum = 0, temp = n;
        while (temp > 0) {
            int d = temp % 10;
            sum += (int) Math.pow(d, digits);
            temp /= 10;
        }
        return sum == n;
    }

    static boolean isPalindrome(int n) {
        int rev = 0, temp = n;
        while (temp > 0) {
            rev = rev * 10 + temp % 10;
            temp /= 10;
        }
        return rev == n;
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        System.out.println(n + " is prime: " + isPrime(n));
        System.out.println(n + " is Armstrong: " + isArmstrong(n));
        System.out.println(n + " is palindrome: " + isPalindrome(n));

        StringBuilder primes = new StringBuilder();
        for (int i = 1; i <= 30; i++) if (isPrime(i)) primes.append(i).append(" ");
        System.out.println("Primes up to 30: " + primes.toString().trim());

        StringBuilder arm = new StringBuilder();
        for (int i = 100; i <= 999; i++) if (isArmstrong(i)) arm.append(i).append(" ");
        System.out.println("3-digit Armstrong: " + arm.toString().trim());
    }
}`;

const ex2 = `public class Main {
    static long factorialIterative(int n) {
        long f = 1;
        for (int i = 2; i <= n; i++) f *= i;
        return f;
    }

    static long factorialRecursive(int n) {
        if (n <= 1) return 1;                    // base case
        return n * factorialRecursive(n - 1);
    }

    static int fibRecursive(int n) {             // O(2^n): slow for big n
        if (n <= 1) return n;
        return fibRecursive(n - 1) + fibRecursive(n - 2);
    }

    static long[] memo = new long[100];
    static long fibMemo(int n) {                 // O(n) with memoization
        if (n <= 1) return n;
        if (memo[n] != 0) return memo[n];
        return memo[n] = fibMemo(n - 1) + fibMemo(n - 2);
    }

    public static void main(String[] args) {
        System.out.println("5! iterative = " + factorialIterative(5));
        System.out.println("10! recursive = " + factorialRecursive(10));
        System.out.println("20! = " + factorialIterative(20));

        StringBuilder sb = new StringBuilder();
        int a = 0, b = 1;
        for (int i = 0; i < 10; i++) {
            sb.append(a).append(i < 9 ? ", " : "");
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println("Fibonacci series: " + sb);
        System.out.println("fib(10) recursive = " + fibRecursive(10));
        System.out.println("fib(50) memo = " + fibMemo(50));

        int num = 12345, sum = 0, rev = 0;
        for (int t = num; t > 0; t /= 10) {
            sum += t % 10;
            rev = rev * 10 + t % 10;
        }
        System.out.println("Sum of digits of " + num + " = " + sum);
        System.out.println("Reverse of " + num + " = " + rev);

        int x = 10, y = 20;
        x = x + y; y = x - y; x = x - y;         // swap without temp
        System.out.println("After swap: x=" + x + ", y=" + y);
    }
}`;

const ex3 = `import java.util.Arrays;

public class Main {
    static void bubbleSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < arr.length - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int t = arr[j]; arr[j] = arr[j + 1]; arr[j + 1] = t;
                    swapped = true;
                }
            }
            if (!swapped) break;                 // already sorted
        }
    }

    static void selectionSort(int[] arr) {
        for (int i = 0; i < arr.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < arr.length; j++) if (arr[j] < arr[min]) min = j;
            int t = arr[i]; arr[i] = arr[min]; arr[min] = t;
        }
    }

    static void insertionSort(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i], j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    static int linearSearch(int[] arr, int target) {
        for (int i = 0; i < arr.length; i++) if (arr[i] == target) return i;
        return -1;
    }

    static int binarySearch(int[] arr, int target) {   // array must be sorted
        int low = 0, high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;            // avoids overflow
            if (arr[mid] == target) return mid;
            if (arr[mid] < target) low = mid + 1;
            else high = mid - 1;
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] data = {64, 25, 12, 22, 11};

        int[] a = data.clone(); bubbleSort(a);
        int[] b = data.clone(); selectionSort(b);
        int[] c = data.clone(); insertionSort(c);
        System.out.println("Bubble:    " + Arrays.toString(a));
        System.out.println("Selection: " + Arrays.toString(b));
        System.out.println("Insertion: " + Arrays.toString(c));
        System.out.println("Original:  " + Arrays.toString(data));

        System.out.println("Linear search 22 in original: index " + linearSearch(data, 22));
        System.out.println("Binary search 22 in sorted: index " + binarySearch(a, 22));
        System.out.println("Binary search 99: " + binarySearch(a, 99));
    }
}`;

const ex4 = `import java.util.Arrays;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        int[] nums = {4, 7, 2, 7, 9, 4, 4, 1};

        // 1. Duplicates using a Set (TreeSet for sorted output)
        Set<Integer> seen = new HashSet<>();
        Set<Integer> dupes = new TreeSet<>();
        for (int n : nums) if (!seen.add(n)) dupes.add(n);
        System.out.println("Duplicates: " + dupes);

        // 2. Frequency of each element, in order of first appearance
        Map<Integer, Integer> freq = new LinkedHashMap<>();
        for (int n : nums) freq.put(n, freq.getOrDefault(n, 0) + 1);
        System.out.println("Frequency: " + freq);

        // 3. Remove duplicates keeping order
        System.out.println("Unique (ordered): " + freq.keySet());

        // 4. Largest and second largest in one pass
        int first = Integer.MIN_VALUE, second = Integer.MIN_VALUE;
        for (int n : nums) {
            if (n > first) { second = first; first = n; }
            else if (n > second && n != first) second = n;
        }
        System.out.println("Largest: " + first + ", Second largest: " + second);

        // 5. Missing number in 1..n
        int[] seq = {1, 2, 4, 5, 6};
        int n = seq.length + 1;
        int expected = n * (n + 1) / 2;
        int actual = Arrays.stream(seq).sum();
        System.out.println("Missing number: " + (expected - actual));

        // 6. Reverse an array in place
        int[] r = {1, 2, 3, 4, 5};
        for (int i = 0, j = r.length - 1; i < j; i++, j--) {
            int t = r[i]; r[i] = r[j]; r[j] = t;
        }
        System.out.println("Reversed: " + Arrays.toString(r));

        // 7. Duplicate characters in a string
        String word = "programming";
        Map<Character, Integer> chars = new LinkedHashMap<>();
        for (char ch : word.toCharArray()) chars.merge(ch, 1, Integer::sum);
        StringBuilder sb = new StringBuilder();
        chars.forEach((ch, count) -> { if (count > 1) sb.append(ch).append("=").append(count).append(" "); });
        System.out.println("Repeated chars: " + sb.toString().trim());
    }
}`;

export default {
  id: 'day-44-coding-interview-programs',
  title: 'Must-Know Coding Interview Programs (prime, fibonacci, factorial, armstrong, sorting, searching, duplicates)',
  module: 'Module 8: I/O, JVM & Interview Prep',
  day: 44,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Practise the classic programs asked in almost every Java fresher interview and online test: number programs, recursion, sorting and searching algorithms, and array/string duplicate problems — with time complexity for each.',
  objectives: [
    'Write efficient prime, Armstrong, palindrome and digit programs',
    'Implement factorial and Fibonacci iteratively, recursively and with memoization',
    'Implement bubble, selection and insertion sort and explain their complexity',
    'Implement linear and binary search',
    'Solve duplicate, frequency, missing number and second-largest problems',
  ],
  theory: [
    {
      heading: 'How to Approach a Coding Question',
      content: 'Interviewers care about your thinking as much as your code. Follow a simple routine, like a doctor examining a patient before giving medicine.',
      points: [
        '1. Understand: repeat the problem, ask about input size, negatives, duplicates, empty input',
        '2. Example: work through a small example by hand',
        '3. Brute force first, then optimise (mention time and space complexity)',
        '4. Code cleanly with meaningful names and small methods',
        '5. Test with normal, edge (0, 1, empty, negative) and large cases',
      ],
      tip: 'Say your thoughts out loud. A correct brute force explained well beats a silent, half-finished optimal solution.',
    },
    {
      heading: 'Big-O Time Complexity in Simple Words',
      content: 'Big-O tells how the running time grows when input grows — like how long it takes to find a name in a phone book. Reading every page is O(n); opening the middle and halving each time is O(log n).',
      points: [
        'O(1) constant: array access arr[i], HashMap get',
        'O(log n) logarithmic: binary search',
        'O(n) linear: one loop over the array (linear search, sum)',
        'O(n log n): good sorting (Arrays.sort for objects uses TimSort; merge sort)',
        'O(n^2) quadratic: nested loops (bubble, selection, insertion sort)',
        'O(2^n) exponential: naive recursive Fibonacci',
      ],
    },
    {
      heading: 'Number Programs',
      content: 'These test loops, % and / operators. Key trick: n % 10 gives the last digit, n / 10 removes the last digit.',
      points: [
        'Prime: divisible only by 1 and itself; check divisors only up to sqrt(n) -> O(sqrt n)',
        'Armstrong: sum of each digit raised to the number of digits equals the number (153 = 1+125+27)',
        'Palindrome number: reverse equals original (121)',
        'Perfect number: sum of proper divisors equals the number (6 = 1+2+3, 28)',
        'Strong number: sum of factorials of digits equals the number (145 = 1!+4!+5!)',
        'GCD: Euclid: gcd(a, b) = gcd(b, a % b); LCM = a * b / gcd',
      ],
    },
    {
      heading: 'Recursion: Factorial and Fibonacci',
      content: 'Recursion is a method calling itself with a smaller problem, like Russian dolls: open one to find a smaller one inside, until the smallest doll (base case). Every recursive method needs a base case, otherwise StackOverflowError.',
      syntax: `factorial(n) = n * factorial(n - 1),  factorial(0 or 1) = 1
fib(n) = fib(n - 1) + fib(n - 2),     fib(0) = 0, fib(1) = 1
Series: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34`,
      points: [
        'int overflows after 12!, long after 20! — use BigInteger for bigger values',
        'Naive recursive Fibonacci recalculates the same values: O(2^n)',
        'Memoization (store results) or a loop makes Fibonacci O(n)',
      ],
    },
    {
      heading: 'Sorting and Searching Algorithms',
      content: 'Sorting puts data in order; searching finds an item. Bubble sort repeatedly swaps adjacent elements (largest "bubbles" to the end). Selection sort selects the minimum and puts it at the front. Insertion sort inserts each item into its place like arranging playing cards in your hand. Binary search works only on SORTED data: compare with the middle, discard half each time.',
      points: [
        'Bubble: O(n^2), best O(n) with the swapped flag, stable',
        'Selection: O(n^2) always, minimum number of swaps, not stable',
        'Insertion: O(n^2), best O(n) for nearly sorted data, stable',
        'Merge sort O(n log n) stable; Quick sort O(n log n) average, O(n^2) worst',
        'Linear search O(n) works on any data; Binary search O(log n) needs sorted data',
        'In real code: Arrays.sort(), Collections.sort(), Arrays.binarySearch()',
      ],
    },
    {
      heading: 'Array and String Problems with Collections',
      content: 'Many questions become easy with the right collection: Set for uniqueness, Map for counting.',
      points: [
        'Find duplicates: Set.add() returns false if the element already exists — O(n)',
        'Frequency count: map.put(x, map.getOrDefault(x, 0) + 1) or map.merge(x, 1, Integer::sum)',
        'Keep insertion order with LinkedHashMap/LinkedHashSet; sorted order with TreeMap/TreeSet',
        'Missing number in 1..n: n(n+1)/2 minus actual sum',
        'Second largest in one pass: track first and second',
        'Reverse in place: two pointers i from start, j from end, swap and move inward',
      ],
    },
  ],
  examples: [
    {
      title: 'Prime, Armstrong and Palindrome Checker (with Scanner)',
      scenario: 'A test platform reads a number and reports its properties, then lists primes and 3-digit Armstrong numbers.',
      steps: ['In IntelliJ: File > New > Java Class > Main', 'Type the code', 'Click Run ▶ and type 153 in the console, then press Enter'],
      code: ex1,
      java: { files: { 'Main.java': ex1 }, stdin: '153\n' },
      result: `153 is prime: false
153 is Armstrong: true
153 is palindrome: false
Primes up to 30: 2 3 5 7 11 13 17 19 23 29
3-digit Armstrong: 153 370 371 407`,
      explanation: '153 = 9 x 17 so not prime. 1^3 + 5^3 + 3^3 = 1 + 125 + 27 = 153, so Armstrong. Its reverse is 351, so not a palindrome. The prime check skips even numbers and stops at sqrt(n).',
    },
    {
      title: 'Factorial, Fibonacci, Digits and Swap',
      scenario: 'Classic recursion and loop programs asked in the first technical round.',
      steps: ['Create Main.java', 'Run ▶', 'Try fibRecursive(45) and feel how slow it is compared to fibMemo(45)'],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `5! iterative = 120
10! recursive = 3628800
20! = 2432902008176640000
Fibonacci series: 0, 1, 1, 2, 3, 5, 8, 13, 21, 34
fib(10) recursive = 55
fib(50) memo = 12586269025
Sum of digits of 12345 = 15
Reverse of 12345 = 54321
After swap: x=20, y=10`,
      explanation: '20! is the largest factorial that fits in a long. Memoization stores each Fibonacci value once, so fib(50) is instant while plain recursion would make billions of calls. % 10 extracts digits; / 10 removes them.',
    },
    {
      title: 'Bubble, Selection, Insertion Sort and Binary Search',
      scenario: 'Implement the three basic sorts and two searches without using library methods.',
      steps: ['Create Main.java', 'Note data.clone() so each algorithm sorts its own copy', 'Run ▶'],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Bubble:    [11, 12, 22, 25, 64]
Selection: [11, 12, 22, 25, 64]
Insertion: [11, 12, 22, 25, 64]
Original:  [64, 25, 12, 22, 11]
Linear search 22 in original: index 3
Binary search 22 in sorted: index 2
Binary search 99: -1`,
      explanation: 'All three algorithms give the same sorted array. Binary search needs the sorted array: mid = 2 holds 22 on the first comparison. low + (high - low) / 2 avoids integer overflow for very large arrays.',
    },
    {
      title: 'Duplicates, Frequency, Second Largest and Missing Number',
      scenario: 'Solve the most frequent array and string questions using Sets and Maps.',
      steps: ['Create Main.java', 'Run ▶', 'Change the arrays and predict the output before running'],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Duplicates: [4, 7]
Frequency: {4=3, 7=2, 2=1, 9=1, 1=1}
Unique (ordered): [4, 7, 2, 9, 1]
Largest: 9, Second largest: 7
Missing number: 3
Reversed: [5, 4, 3, 2, 1]
Repeated chars: r=2 g=2 m=2`,
      explanation: 'HashSet.add returns false for repeats. LinkedHashMap keeps first-appearance order so output is predictable. For the missing number, n = 6 so expected sum 21, actual 18, missing 3. In "programming", r, g and m appear twice.',
    },
  ],
  interview: [
    { q: 'What is the most efficient simple way to check if a number is prime?', a: 'Return false for n < 2, handle 2, reject even numbers, then test odd divisors from 3 up to sqrt(n). Complexity O(sqrt n). For many numbers use the Sieve of Eratosthenes.', level: 'Easy' },
    { q: 'What is an Armstrong number? Give examples.', a: 'A number equal to the sum of its digits each raised to the power of the number of digits: 153, 370, 371, 407, 1634.', level: 'Easy' },
    { q: 'Why is recursive Fibonacci slow and how do you fix it?', a: 'It recomputes the same subproblems repeatedly giving O(2^n). Fix with memoization, an iterative loop (O(n)), or matrix exponentiation (O(log n)).', level: 'Medium' },
    { q: 'What happens if you compute 25! using long?', a: 'It overflows silently and gives a wrong (even negative) value. Use BigInteger.', level: 'Medium' },
    { q: 'Compare bubble, selection and insertion sort.', a: 'All are O(n^2) average. Bubble and insertion are stable and O(n) best case on sorted input; selection is not stable but does the fewest swaps (n-1).', level: 'Medium' },
    { q: 'What is the precondition for binary search and its complexity?', a: 'The array must be sorted. Time O(log n), space O(1) iterative.', level: 'Easy' },
    { q: 'Why use low + (high - low) / 2 instead of (low + high) / 2?', a: 'To avoid integer overflow when low + high exceeds Integer.MAX_VALUE.', level: 'Hard' },
    { q: 'How do you find duplicates in an array in O(n)?', a: 'Iterate once and add each element to a HashSet; if add() returns false, it is a duplicate.', level: 'Easy' },
    { q: 'How do you find the missing number from 1 to n?', a: 'Subtract the sum of the array from n(n+1)/2, or XOR all numbers 1..n with all array elements (avoids overflow).', level: 'Medium' },
    { q: 'What sorting algorithm does Arrays.sort use?', a: 'Dual-Pivot Quicksort for primitive arrays and TimSort (stable, merge+insertion hybrid) for object arrays and Collections.sort.', level: 'Hard' },
    { q: 'What is the output? int n = 1234, r = 0; while (n > 0) { r = r * 10 + n % 10; n /= 10; } System.out.println(r);', a: '4321', level: 'Easy' },
    { q: 'How do you swap two numbers without a third variable?', a: 'a = a + b; b = a - b; a = a - b; or with XOR: a ^= b; b ^= a; a ^= b;', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a program to print all perfect numbers between 1 and 1000.',
      hint: 'Sum all divisors from 1 to n/2 and compare with n. Expected: 6 28 496.',
      solution: `public class Main {
    public static void main(String[] args) {
        for (int n = 2; n <= 1000; n++) {
            int sum = 0;
            for (int d = 1; d <= n / 2; d++) if (n % d == 0) sum += d;
            if (sum == n) System.out.println(n);
        }
    }
}`,
    },
    {
      task: 'Find the GCD and LCM of 36 and 60 using Euclid\'s algorithm.',
      hint: 'gcd(a, b) = b == 0 ? a : gcd(b, a % b); lcm = a / gcd * b.',
      solution: `public class Main {
    static int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
    public static void main(String[] args) {
        int a = 36, b = 60;
        int g = gcd(a, b);
        System.out.println("GCD = " + g);          // 12
        System.out.println("LCM = " + (a / g * b)); // 180
    }
}`,
    },
    {
      task: 'Check whether two strings are anagrams ("listen", "silent").',
      hint: 'Sort both char arrays and compare with Arrays.equals, or count characters with an int[26].',
      solution: `import java.util.Arrays;

public class Main {
    static boolean isAnagram(String a, String b) {
        if (a.length() != b.length()) return false;
        char[] x = a.toLowerCase().toCharArray();
        char[] y = b.toLowerCase().toCharArray();
        Arrays.sort(x);
        Arrays.sort(y);
        return Arrays.equals(x, y);
    }
    public static void main(String[] args) {
        System.out.println(isAnagram("listen", "silent")); // true
        System.out.println(isAnagram("hello", "world"));   // false
    }
}`,
    },
    {
      task: 'Move all zeros of an array to the end while keeping the order of other elements: {0, 1, 0, 3, 12} -> [1, 3, 12, 0, 0].',
      hint: 'Use an index pos; copy non-zero elements forward, then fill the rest with 0.',
      solution: `import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {0, 1, 0, 3, 12};
        int pos = 0;
        for (int x : a) if (x != 0) a[pos++] = x;
        while (pos < a.length) a[pos++] = 0;
        System.out.println(Arrays.toString(a)); // [1, 3, 12, 0, 0]
    }
}`,
    },
    {
      task: 'Find the first non-repeating character in "swiss".',
      hint: 'Count with a LinkedHashMap<Character, Integer>, then return the first key with value 1. Answer: w.',
      solution: `import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        String s = "swiss";
        Map<Character, Integer> count = new LinkedHashMap<>();
        for (char c : s.toCharArray()) count.merge(c, 1, Integer::sum);
        for (Map.Entry<Character, Integer> e : count.entrySet()) {
            if (e.getValue() == 1) {
                System.out.println("First non-repeating: " + e.getKey()); // w
                break;
            }
        }
    }
}`,
    },
  ],
  quiz: [
    { question: 'Up to which value do you need to check divisors to test if n is prime?', options: ['n', 'n / 2', 'sqrt(n)', 'n - 1'], answer: 2, explanation: 'If n has a divisor larger than sqrt(n), it also has one smaller than sqrt(n).' },
    { question: 'Which of these is an Armstrong number?', options: ['371', '123', '200', '99'], answer: 0, explanation: '3^3 + 7^3 + 1^3 = 27 + 343 + 1 = 371.' },
    { question: 'Time complexity of binary search is:', options: ['O(n)', 'O(n log n)', 'O(1)', 'O(log n)'], answer: 3, explanation: 'The search space halves each step.' },
    { question: 'Which sorting algorithm is O(n) in the best case when the array is already sorted?', options: ['Selection sort', 'Insertion sort', 'Quick sort (worst)', 'None of these'], answer: 1, explanation: 'Insertion sort (and bubble sort with a swapped flag) needs only one pass on sorted data.' },
    { question: 'What does set.add(x) return when x already exists in a HashSet?', options: ['true', 'Throws an exception', 'false', 'null'], answer: 2, explanation: 'add returns false if the element was already present, perfect for detecting duplicates.' },
  ],
};
