// Coding-round practice problems for Java fresher interviews.
// Plain ES module, no imports. Every "expected" value is the exact console output of "solution".

export const codingProblems = [
  // ---------------------------------------------------------------- EASY (12)
  {
    id: 'reverse-string',
    title: 'Reverse a String without reverse()',
    level: 'Easy',
    topic: 'Strings',
    statement: 'Write a method that reverses a string without using StringBuilder.reverse() or any library reverse method. Use the two-pointer technique on a char array.',
    input: 's = "Hello Java"',
    output: 'avaJ olleH',
    hints: ['Convert the string to a char array with toCharArray().', 'Swap characters at the left and right index and move both pointers towards the middle.'],
    starter: `public class Main {
    static String reverse(String s) {
        // TODO: reverse the characters using two pointers
        return s;
    }

    public static void main(String[] args) {
        String input = "Hello Java";
        System.out.println("Original: " + input);
        System.out.println("Reversed: " + reverse(input));
        System.out.println("Reversed: " + reverse("racecar"));
    }
}`,
    solution: `public class Main {
    static String reverse(String s) {
        char[] chars = s.toCharArray();
        int left = 0;
        int right = chars.length - 1;
        while (left < right) {
            char temp = chars[left];
            chars[left] = chars[right];
            chars[right] = temp;
            left++;
            right--;
        }
        return new String(chars);
    }

    public static void main(String[] args) {
        String input = "Hello Java";
        System.out.println("Original: " + input);
        System.out.println("Reversed: " + reverse(input));
        System.out.println("Reversed: " + reverse("racecar"));
    }
}`,
    expected: `Original: Hello Java
Reversed: avaJ olleH
Reversed: racecar`,
    stdin: '',
    explanation: 'Two pointers start at both ends of the char array and swap characters until they meet in the middle. Time O(n), extra space O(n) for the char array (strings are immutable in Java).',
    followUps: ['Can you do it using recursion?', 'Why are Java strings immutable?', 'How would you reverse only the words, not the characters?', 'What is the difference between String, StringBuilder and StringBuffer?'],
  },
  {
    id: 'palindrome-check',
    title: 'Check if a String is a Palindrome',
    level: 'Easy',
    topic: 'Strings',
    statement: 'Check whether a string reads the same forwards and backwards. Ignore case and skip any character that is not a letter or digit.',
    input: '"madam", "java", "Racecar", "A man, a plan, a canal: Panama", "12321"',
    output: 'true, false, true, true, true',
    hints: ['Use two pointers, one from each end.', 'Skip non-alphanumeric characters with Character.isLetterOrDigit().', 'Compare using Character.toLowerCase().'],
    starter: `public class Main {
    static boolean isPalindrome(String s) {
        // TODO: use two pointers, ignore case and non-alphanumeric characters
        return false;
    }

    public static void main(String[] args) {
        String[] words = {"madam", "java", "Racecar", "A man, a plan, a canal: Panama", "12321"};
        for (String w : words) {
            System.out.println(w + " -> " + isPalindrome(w));
        }
    }
}`,
    solution: `public class Main {
    static boolean isPalindrome(String s) {
        int left = 0;
        int right = s.length() - 1;
        while (left < right) {
            char a = s.charAt(left);
            char b = s.charAt(right);
            if (!Character.isLetterOrDigit(a)) {
                left++;
                continue;
            }
            if (!Character.isLetterOrDigit(b)) {
                right--;
                continue;
            }
            if (Character.toLowerCase(a) != Character.toLowerCase(b)) {
                return false;
            }
            left++;
            right--;
        }
        return true;
    }

    public static void main(String[] args) {
        String[] words = {"madam", "java", "Racecar", "A man, a plan, a canal: Panama", "12321"};
        for (String w : words) {
            System.out.println(w + " -> " + isPalindrome(w));
        }
    }
}`,
    expected: `madam -> true
java -> false
Racecar -> true
A man, a plan, a canal: Panama -> true
12321 -> true`,
    stdin: '',
    explanation: 'Two pointers move inward, skipping characters that are not letters or digits and comparing the rest in lower case. Time O(n), space O(1).',
    followUps: ['How would you check if a number is a palindrome without converting it to a string?', 'Can you solve it by building a cleaned string and comparing with its reverse? What is the trade-off?', 'What is the longest palindromic substring problem?'],
  },
  {
    id: 'char-frequency',
    title: 'Count Character Frequency',
    level: 'Easy',
    topic: 'HashMap',
    statement: 'Count how many times each character appears in a string. Print the counts in order of first appearance, and then sorted by character.',
    input: 's = "programming"',
    output: '{p=1, r=2, o=1, g=2, a=1, m=2, i=1, n=1}',
    hints: ['LinkedHashMap keeps insertion order.', 'TreeMap keeps keys sorted.', 'Use map.getOrDefault(c, 0) + 1 to update counts.'],
    starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "programming";
        System.out.println("Input: " + s);
        // TODO: count each character using a LinkedHashMap and print it
        // TODO: print the same counts sorted by character using a TreeMap
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        String s = "programming";
        System.out.println("Input: " + s);

        Map<Character, Integer> freq = new LinkedHashMap<>();
        for (char c : s.toCharArray()) {
            freq.put(c, freq.getOrDefault(c, 0) + 1);
        }
        System.out.println("Order of appearance: " + freq);

        Map<Character, Integer> sorted = new TreeMap<>(freq);
        System.out.println("Sorted by character: " + sorted);
    }
}`,
    expected: `Input: programming
Order of appearance: {p=1, r=2, o=1, g=2, a=1, m=2, i=1, n=1}
Sorted by character: {a=1, g=2, i=1, m=2, n=1, o=1, p=1, r=2}`,
    stdin: '',
    explanation: 'One pass over the string updates a map of counts. LinkedHashMap preserves first-appearance order and TreeMap sorts the keys. Time O(n) for the LinkedHashMap (O(k log k) to build the TreeMap for k distinct characters), space O(k).',
    followUps: ['How would you do this with an int[256] array instead of a map?', 'Can you write it using streams and Collectors.groupingBy?', 'Why does HashMap not guarantee order?', 'How would you find the most frequent character?'],
  },
  {
    id: 'second-largest',
    title: 'Find the Second Largest Element',
    level: 'Easy',
    topic: 'Arrays',
    statement: 'Find the second largest distinct number in an array in a single pass, without sorting. If it does not exist, print "none".',
    input: '[12, 35, 1, 10, 34, 1], [10, 10, 10], [5, 20, 20, 8]',
    output: '34, none, 8',
    hints: ['Keep two variables: largest and second.', 'When you find a new largest, the old largest becomes second.', 'Ignore values equal to the largest.'],
    starter: `import java.util.Arrays;

public class Main {
    static String secondLargest(int[] arr) {
        // TODO: single pass with two variables
        return "none";
    }

    public static void main(String[] args) {
        int[][] tests = {{12, 35, 1, 10, 34, 1}, {10, 10, 10}, {5, 20, 20, 8}};
        for (int[] arr : tests) {
            System.out.println(Arrays.toString(arr) + " -> " + secondLargest(arr));
        }
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static String secondLargest(int[] arr) {
        int largest = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;
        for (int n : arr) {
            if (n > largest) {
                second = largest;
                largest = n;
            } else if (n > second && n != largest) {
                second = n;
            }
        }
        return second == Integer.MIN_VALUE ? "none" : String.valueOf(second);
    }

    public static void main(String[] args) {
        int[][] tests = {{12, 35, 1, 10, 34, 1}, {10, 10, 10}, {5, 20, 20, 8}};
        for (int[] arr : tests) {
            System.out.println(Arrays.toString(arr) + " -> " + secondLargest(arr));
        }
    }
}`,
    expected: `[12, 35, 1, 10, 34, 1] -> 34
[10, 10, 10] -> none
[5, 20, 20, 8] -> 8`,
    stdin: '',
    explanation: 'Track the largest and second largest while scanning once. A new maximum pushes the old maximum down to second; a value between them updates second. Time O(n), space O(1).',
    followUps: ['What if the array can contain Integer.MIN_VALUE itself?', 'How would you find the k-th largest element?', 'Can you solve it with a TreeSet? What is the complexity?'],
  },
  {
    id: 'missing-number',
    title: 'Find the Missing Number from 1 to N',
    level: 'Easy',
    topic: 'Math',
    statement: 'An array contains n-1 distinct numbers from 1 to n with exactly one number missing. Find the missing number.',
    input: '[1, 2, 4, 5, 6] and [3, 7, 1, 2, 8, 4, 5]',
    output: '3 and 6',
    hints: ['n is the array length + 1.', 'The sum of 1..n is n * (n + 1) / 2.', 'Missing = expected sum - actual sum.'],
    starter: `import java.util.Arrays;

public class Main {
    static int findMissing(int[] arr) {
        // TODO: use the sum formula n * (n + 1) / 2
        return -1;
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 4, 5, 6};
        int[] b = {3, 7, 1, 2, 8, 4, 5};
        System.out.println("Missing in " + Arrays.toString(a) + ": " + findMissing(a));
        System.out.println("Missing in " + Arrays.toString(b) + ": " + findMissing(b));
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static int findMissing(int[] arr) {
        int n = arr.length + 1;
        int expectedSum = n * (n + 1) / 2;
        int actualSum = 0;
        for (int x : arr) {
            actualSum += x;
        }
        return expectedSum - actualSum;
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 4, 5, 6};
        int[] b = {3, 7, 1, 2, 8, 4, 5};
        System.out.println("Missing in " + Arrays.toString(a) + ": " + findMissing(a));
        System.out.println("Missing in " + Arrays.toString(b) + ": " + findMissing(b));
    }
}`,
    expected: `Missing in [1, 2, 4, 5, 6]: 3
Missing in [3, 7, 1, 2, 8, 4, 5]: 6`,
    stdin: '',
    explanation: 'The sum of 1..n is n(n+1)/2; subtracting the actual sum gives the missing value. Time O(n), space O(1). For very large n, use long or the XOR method to avoid overflow.',
    followUps: ['How can integer overflow happen here and how do you avoid it?', 'Solve it using XOR.', 'What if two numbers are missing?', 'What if the array also has duplicates?'],
  },
  {
    id: 'fibonacci-series',
    title: 'Fibonacci Series (Iterative and Recursive)',
    level: 'Easy',
    topic: 'Recursion',
    statement: 'Print the first 10 Fibonacci numbers using a loop, and compute fib(10) using recursion. The series starts 0, 1.',
    input: 'n = 10',
    output: '0 1 1 2 3 5 8 13 21 34 and fib(10) = 55',
    hints: ['Each number is the sum of the previous two.', 'Base cases for recursion: fib(0) = 0, fib(1) = 1.'],
    starter: `public class Main {
    static int fib(int n) {
        // TODO: recursive Fibonacci
        return 0;
    }

    public static void main(String[] args) {
        int n = 10;
        // TODO: print the first n Fibonacci numbers using a loop
        System.out.println("fib(10) using recursion = " + fib(10));
    }
}`,
    solution: `public class Main {
    static int fib(int n) {
        if (n <= 1) {
            return n;
        }
        return fib(n - 1) + fib(n - 2);
    }

    public static void main(String[] args) {
        int n = 10;
        long a = 0;
        long b = 1;
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < n; i++) {
            sb.append(a).append(' ');
            long next = a + b;
            a = b;
            b = next;
        }
        System.out.println("First 10 Fibonacci numbers: " + sb.toString().trim());
        System.out.println("fib(10) using recursion = " + fib(10));
    }
}`,
    expected: `First 10 Fibonacci numbers: 0 1 1 2 3 5 8 13 21 34
fib(10) using recursion = 55`,
    stdin: '',
    explanation: 'The loop keeps the last two values and runs in O(n) time, O(1) space. The plain recursive version is O(2^n) time because it recomputes the same values; memoization brings it down to O(n).',
    followUps: ['Why is the recursive version slow? Draw the recursion tree for fib(5).', 'Add memoization using an array or HashMap.', 'What happens for fib(50) with int?', 'Can you print the series in reverse?'],
  },
  {
    id: 'prime-numbers',
    title: 'Check Prime and Print Primes up to N',
    level: 'Easy',
    topic: 'Math',
    statement: 'Write isPrime(n) that checks divisors only up to the square root of n. Use it to print all primes up to 50 and test a few numbers.',
    input: 'limit = 50; test 1, 97, 91',
    output: '2 3 5 7 11 13 17 19 23 29 31 37 41 43 47; false, true, false',
    hints: ['Numbers less than 2 are not prime.', 'Loop i from 2 while i * i <= n.'],
    starter: `public class Main {
    static boolean isPrime(int n) {
        // TODO: check divisors up to sqrt(n)
        return false;
    }

    public static void main(String[] args) {
        // TODO: print all primes up to 50 on one line
        System.out.println("Is 1 prime? " + isPrime(1));
        System.out.println("Is 97 prime? " + isPrime(97));
        System.out.println("Is 91 prime? " + isPrime(91));
    }
}`,
    solution: `public class Main {
    static boolean isPrime(int n) {
        if (n < 2) {
            return false;
        }
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 50; i++) {
            if (isPrime(i)) {
                sb.append(i).append(' ');
            }
        }
        System.out.println("Primes up to 50: " + sb.toString().trim());
        System.out.println("Is 1 prime? " + isPrime(1));
        System.out.println("Is 97 prime? " + isPrime(97));
        System.out.println("Is 91 prime? " + isPrime(91));
    }
}`,
    expected: `Primes up to 50: 2 3 5 7 11 13 17 19 23 29 31 37 41 43 47
Is 1 prime? false
Is 97 prime? true
Is 91 prime? false`,
    stdin: '',
    explanation: 'If n has a divisor larger than sqrt(n), it must also have one smaller than sqrt(n), so checking up to sqrt(n) is enough. isPrime is O(sqrt n). Printing primes up to N this way is O(N sqrt N).',
    followUps: ['Implement the Sieve of Eratosthenes. What is its complexity?', 'Why is 1 not a prime number?', 'How would you skip even numbers to make it faster?'],
  },
  {
    id: 'armstrong-number',
    title: 'Armstrong Numbers',
    level: 'Easy',
    topic: 'Math',
    statement: 'A number is an Armstrong number if the sum of its digits, each raised to the power of the number of digits, equals the number itself (153 = 1^3 + 5^3 + 3^3). Check a few numbers and print all Armstrong numbers from 1 to 1000.',
    input: '153, 123, range 1..1000',
    output: 'true, false, 1 2 3 4 5 6 7 8 9 153 370 371 407',
    hints: ['Count digits with String.valueOf(n).length() or a loop.', 'Extract digits using % 10 and / 10.', 'Write your own integer power method to avoid double rounding.'],
    starter: `public class Main {
    static boolean isArmstrong(int n) {
        // TODO: sum of digits raised to the number of digits
        return false;
    }

    public static void main(String[] args) {
        System.out.println("153 is Armstrong: " + isArmstrong(153));
        System.out.println("123 is Armstrong: " + isArmstrong(123));
        // TODO: print all Armstrong numbers from 1 to 1000 on one line
    }
}`,
    solution: `public class Main {
    static int power(int base, int exp) {
        int result = 1;
        for (int i = 0; i < exp; i++) {
            result *= base;
        }
        return result;
    }

    static boolean isArmstrong(int n) {
        int digits = String.valueOf(n).length();
        int sum = 0;
        int temp = n;
        while (temp > 0) {
            int d = temp % 10;
            sum += power(d, digits);
            temp /= 10;
        }
        return sum == n;
    }

    public static void main(String[] args) {
        System.out.println("153 is Armstrong: " + isArmstrong(153));
        System.out.println("123 is Armstrong: " + isArmstrong(123));
        StringBuilder sb = new StringBuilder();
        for (int i = 1; i <= 1000; i++) {
            if (isArmstrong(i)) {
                sb.append(i).append(' ');
            }
        }
        System.out.println("Armstrong numbers from 1 to 1000: " + sb.toString().trim());
    }
}`,
    expected: `153 is Armstrong: true
123 is Armstrong: false
Armstrong numbers from 1 to 1000: 1 2 3 4 5 6 7 8 9 153 370 371 407`,
    stdin: '',
    explanation: 'Extract each digit with % 10, raise it to the digit count and add. Every single-digit number is an Armstrong number. Checking one number is O(d^2) with the simple power loop, where d is the number of digits.',
    followUps: ['Why is Math.pow risky here?', 'How would you count digits without converting to a String?', 'Find all 4-digit Armstrong numbers.'],
  },
  {
    id: 'factorial-recursion',
    title: 'Factorial using Recursion',
    level: 'Easy',
    topic: 'Recursion',
    statement: 'Write a recursive method to compute n! and print the factorial of 0, 5, 10 and 20 using long.',
    input: 'n = 0, 5, 10, 20',
    output: '1, 120, 3628800, 2432902008176640000',
    hints: ['Base case: 0! = 1 and 1! = 1.', 'Recursive case: n! = n * (n - 1)!', 'int overflows after 12!, so use long.'],
    starter: `public class Main {
    static long factorial(int n) {
        // TODO: base case and recursive case
        return 0;
    }

    public static void main(String[] args) {
        int[] values = {0, 5, 10, 20};
        for (int n : values) {
            System.out.println(n + "! = " + factorial(n));
        }
    }
}`,
    solution: `public class Main {
    static long factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }

    public static void main(String[] args) {
        int[] values = {0, 5, 10, 20};
        for (int n : values) {
            System.out.println(n + "! = " + factorial(n));
        }
    }
}`,
    expected: `0! = 1
5! = 120
10! = 3628800
20! = 2432902008176640000`,
    stdin: '',
    explanation: 'Each call reduces n by 1 until the base case. Time O(n), space O(n) for the call stack. 20! is the largest factorial that fits in a long; beyond that, use BigInteger.',
    followUps: ['What happens for 21! with long?', 'Rewrite it using BigInteger.', 'What is a StackOverflowError and when could this code cause one?', 'Write the iterative version.'],
  },
  {
    id: 'bubble-sort',
    title: 'Bubble Sort',
    level: 'Easy',
    topic: 'Searching & Sorting',
    statement: 'Sort an array in ascending order using bubble sort. Stop early if a pass makes no swaps.',
    input: '[64, 34, 25, 12, 22, 11, 90]',
    output: '[11, 12, 22, 25, 34, 64, 90]',
    hints: ['Compare adjacent elements and swap if they are in the wrong order.', 'After each pass the largest remaining element reaches the end.', 'Use a boolean flag to detect a pass with no swaps.'],
    starter: `import java.util.Arrays;

public class Main {
    static void bubbleSort(int[] arr) {
        // TODO: implement bubble sort with an early-exit flag
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Before: " + Arrays.toString(arr));
        bubbleSort(arr);
        System.out.println("After: " + Arrays.toString(arr));
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < n - 1 - i; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                    swapped = true;
                }
            }
            if (!swapped) {
                break;
            }
        }
    }

    public static void main(String[] args) {
        int[] arr = {64, 34, 25, 12, 22, 11, 90};
        System.out.println("Before: " + Arrays.toString(arr));
        bubbleSort(arr);
        System.out.println("After: " + Arrays.toString(arr));
    }
}`,
    expected: `Before: [64, 34, 25, 12, 22, 11, 90]
After: [11, 12, 22, 25, 34, 64, 90]`,
    stdin: '',
    explanation: 'Each pass bubbles the largest unsorted element to its final position. Worst and average time O(n^2), best case O(n) with the early-exit flag on an already sorted array. Space O(1); the sort is stable.',
    followUps: ['Is bubble sort stable? Why?', 'Compare it with selection sort and insertion sort.', 'Which sorting algorithm does Arrays.sort() use for int[] and for objects?', 'How would you sort in descending order?'],
  },
  {
    id: 'move-zeros',
    title: 'Move All Zeros to the End',
    level: 'Easy',
    topic: 'Arrays',
    statement: 'Move all zeros in an array to the end while keeping the relative order of the non-zero elements. Do it in place.',
    input: '[0, 1, 0, 3, 12] and [4, 0, 0, 2, 0, 7]',
    output: '[1, 3, 12, 0, 0] and [4, 2, 7, 0, 0, 0]',
    hints: ['Keep an index "pos" for where the next non-zero should go.', 'Copy non-zero values forward, then fill the rest with zeros.'],
    starter: `import java.util.Arrays;

public class Main {
    static void moveZeros(int[] arr) {
        // TODO: shift non-zero elements forward, then fill zeros
    }

    public static void main(String[] args) {
        int[][] tests = {{0, 1, 0, 3, 12}, {4, 0, 0, 2, 0, 7}};
        for (int[] arr : tests) {
            String before = Arrays.toString(arr);
            moveZeros(arr);
            System.out.println(before + " -> " + Arrays.toString(arr));
        }
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static void moveZeros(int[] arr) {
        int pos = 0;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] != 0) {
                arr[pos] = arr[i];
                pos++;
            }
        }
        while (pos < arr.length) {
            arr[pos] = 0;
            pos++;
        }
    }

    public static void main(String[] args) {
        int[][] tests = {{0, 1, 0, 3, 12}, {4, 0, 0, 2, 0, 7}};
        for (int[] arr : tests) {
            String before = Arrays.toString(arr);
            moveZeros(arr);
            System.out.println(before + " -> " + Arrays.toString(arr));
        }
    }
}`,
    expected: `[0, 1, 0, 3, 12] -> [1, 3, 12, 0, 0]
[4, 0, 0, 2, 0, 7] -> [4, 2, 7, 0, 0, 0]`,
    stdin: '',
    explanation: 'A write pointer collects non-zero values in order; the remaining positions are filled with zeros. Time O(n), space O(1).',
    followUps: ['Can you do it with swaps in a single loop?', 'How would you move zeros to the front instead?', 'How would you minimise the number of writes?'],
  },
  {
    id: 'pattern-pyramid',
    title: 'Star Pyramid and Number Triangle',
    level: 'Easy',
    topic: 'Patterns',
    statement: 'Print a centred star pyramid of 5 rows and then a number triangle of 4 rows. Do not print trailing spaces.',
    input: 'rows = 5 for the pyramid, 4 for the number triangle',
    output: 'Pyramid with 1, 3, 5, 7, 9 stars; triangle 1 / 1 2 / 1 2 3 / 1 2 3 4',
    hints: ['Row i of the pyramid has (n - i) leading spaces and (2 * i - 1) stars.', 'For the triangle, print numbers 1..i separated by single spaces.'],
    starter: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        System.out.println("Star pyramid:");
        // TODO: print the pyramid using nested loops

        System.out.println("Number triangle:");
        // TODO: print 4 rows: 1 / 1 2 / 1 2 3 / 1 2 3 4
    }
}`,
    solution: `public class Main {
    public static void main(String[] args) {
        int n = 5;
        System.out.println("Star pyramid:");
        for (int i = 1; i <= n; i++) {
            StringBuilder row = new StringBuilder();
            for (int s = 0; s < n - i; s++) {
                row.append(' ');
            }
            for (int k = 0; k < 2 * i - 1; k++) {
                row.append('*');
            }
            System.out.println(row);
        }

        System.out.println("Number triangle:");
        int rows = 4;
        for (int i = 1; i <= rows; i++) {
            StringBuilder row = new StringBuilder();
            for (int j = 1; j <= i; j++) {
                row.append(j);
                if (j < i) {
                    row.append(' ');
                }
            }
            System.out.println(row);
        }
    }
}`,
    expected: `Star pyramid:
    *
   ***
  *****
 *******
*********
Number triangle:
1
1 2
1 2 3
1 2 3 4`,
    stdin: '',
    explanation: 'The outer loop controls rows and inner loops print spaces and symbols. Find the formula for each row (spaces = n - i, stars = 2i - 1). Time O(n^2) for n rows.',
    followUps: ['Print an inverted pyramid.', 'Print a diamond shape.', 'Print Floyd\'s triangle or Pascal\'s triangle.', 'Print a hollow square.'],
  },

  // ---------------------------------------------------------------- MEDIUM (12)
  {
    id: 'reverse-words',
    title: 'Reverse Words in a Sentence',
    level: 'Medium',
    topic: 'Strings',
    statement: 'Given a sentence that may have extra spaces, (1) reverse the order of the words and (2) reverse the characters of each word while keeping word order. Output must have single spaces and no leading or trailing spaces.',
    input: '"  Java is   fun to learn "',
    output: '"learn to fun is Java" and "avaJ si nuf ot nrael"',
    hints: ['trim() removes leading and trailing spaces.', 'split(" +") splits on one or more spaces.', 'Build the result with a StringBuilder.'],
    starter: `public class Main {
    static String reverseWordOrder(String s) {
        // TODO
        return s;
    }

    static String reverseEachWord(String s) {
        // TODO
        return s;
    }

    public static void main(String[] args) {
        String s = "  Java is   fun to learn ";
        System.out.println("Input: [" + s + "]");
        System.out.println("Reversed word order: [" + reverseWordOrder(s) + "]");
        System.out.println("Each word reversed: [" + reverseEachWord(s) + "]");
    }
}`,
    solution: `public class Main {
    static String reverseWordOrder(String s) {
        String[] words = s.trim().split(" +");
        StringBuilder sb = new StringBuilder();
        for (int i = words.length - 1; i >= 0; i--) {
            sb.append(words[i]);
            if (i > 0) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    static String reverseEachWord(String s) {
        String[] words = s.trim().split(" +");
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < words.length; i++) {
            sb.append(new StringBuilder(words[i]).reverse());
            if (i < words.length - 1) {
                sb.append(' ');
            }
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String s = "  Java is   fun to learn ";
        System.out.println("Input: [" + s + "]");
        System.out.println("Reversed word order: [" + reverseWordOrder(s) + "]");
        System.out.println("Each word reversed: [" + reverseEachWord(s) + "]");
    }
}`,
    expected: `Input: [  Java is   fun to learn ]
Reversed word order: [learn to fun is Java]
Each word reversed: [avaJ si nuf ot nrael]`,
    stdin: '',
    explanation: 'Trim the input, split on one or more spaces, then join the words in reverse order (or reverse each word). Time O(n), space O(n).',
    followUps: ['Do it in place on a char array without split().', 'How would you handle tabs and newlines as separators?', 'Reverse only words with an even length.'],
  },
  {
    id: 'anagram-check',
    title: 'Check if Two Strings are Anagrams',
    level: 'Medium',
    topic: 'Strings',
    statement: 'Two strings are anagrams if they contain the same characters with the same counts. Ignore spaces and case.',
    input: '("listen", "silent"), ("triangle", "integral"), ("hello", "world"), ("Dormitory", "Dirty room")',
    output: 'true, true, false, true',
    hints: ['Remove spaces and convert to lower case first.', 'If lengths differ, they cannot be anagrams.', 'Use an int[26] counter: +1 for the first string, -1 for the second.'],
    starter: `public class Main {
    static boolean isAnagram(String a, String b) {
        // TODO: normalise, then compare character counts
        return false;
    }

    public static void main(String[] args) {
        String[][] pairs = {
            {"listen", "silent"},
            {"triangle", "integral"},
            {"hello", "world"},
            {"Dormitory", "Dirty room"}
        };
        for (String[] p : pairs) {
            System.out.println(p[0] + " & " + p[1] + " -> " + isAnagram(p[0], p[1]));
        }
    }
}`,
    solution: `public class Main {
    static boolean isAnagram(String a, String b) {
        String x = a.replace(" ", "").toLowerCase();
        String y = b.replace(" ", "").toLowerCase();
        if (x.length() != y.length()) {
            return false;
        }
        int[] count = new int[26];
        for (int i = 0; i < x.length(); i++) {
            count[x.charAt(i) - 'a']++;
            count[y.charAt(i) - 'a']--;
        }
        for (int c : count) {
            if (c != 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        String[][] pairs = {
            {"listen", "silent"},
            {"triangle", "integral"},
            {"hello", "world"},
            {"Dormitory", "Dirty room"}
        };
        for (String[] p : pairs) {
            System.out.println(p[0] + " & " + p[1] + " -> " + isAnagram(p[0], p[1]));
        }
    }
}`,
    expected: `listen & silent -> true
triangle & integral -> true
hello & world -> false
Dormitory & Dirty room -> true`,
    stdin: '',
    explanation: 'After normalising, one array of 26 counters is incremented for the first string and decremented for the second; all zeros means anagram. Time O(n), space O(1). Sorting both char arrays and comparing also works in O(n log n).',
    followUps: ['How would you support Unicode or digits? (Use a HashMap.)', 'Group a list of words into anagram groups.', 'Find all anagrams of a pattern inside a longer string.'],
  },
  {
    id: 'duplicate-elements',
    title: 'Find Duplicate Elements in an Array',
    level: 'Medium',
    topic: 'Collections',
    statement: 'Print the frequency of each element (in first-appearance order) and list the elements that appear more than once.',
    input: '[4, 2, 7, 2, 9, 4, 4, 1]',
    output: 'Frequency {4=3, 2=2, 7=1, 9=1, 1=1}, duplicates [4, 2]',
    hints: ['Use a LinkedHashMap<Integer, Integer> to keep order.', 'Collect keys whose count is greater than 1.'],
    starter: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] arr = {4, 2, 7, 2, 9, 4, 4, 1};
        System.out.println("Array: " + Arrays.toString(arr));
        // TODO: build a frequency map and print it
        // TODO: print the list of duplicate elements
    }
}`,
    solution: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        int[] arr = {4, 2, 7, 2, 9, 4, 4, 1};
        System.out.println("Array: " + Arrays.toString(arr));

        Map<Integer, Integer> freq = new LinkedHashMap<>();
        for (int x : arr) {
            freq.put(x, freq.getOrDefault(x, 0) + 1);
        }
        System.out.println("Frequency: " + freq);

        List<Integer> duplicates = new ArrayList<>();
        for (Map.Entry<Integer, Integer> e : freq.entrySet()) {
            if (e.getValue() > 1) {
                duplicates.add(e.getKey());
            }
        }
        System.out.println("Duplicates: " + duplicates);
    }
}`,
    expected: `Array: [4, 2, 7, 2, 9, 4, 4, 1]
Frequency: {4=3, 2=2, 7=1, 9=1, 1=1}
Duplicates: [4, 2]`,
    stdin: '',
    explanation: 'One pass builds counts in a LinkedHashMap; a second pass over the map picks counts above 1. Time O(n), space O(n).',
    followUps: ['Solve it with a HashSet: if add() returns false, it is a duplicate. What order do you get?', 'Solve it without extra space if values are in range 0..n-1.', 'Write it using streams with Collectors.groupingBy and counting().', 'Remove duplicates while keeping order.'],
  },
  {
    id: 'binary-search',
    title: 'Binary Search in a Sorted Array',
    level: 'Medium',
    topic: 'Searching & Sorting',
    statement: 'Implement iterative binary search that returns the index of the target in a sorted array, or -1 if it is not present.',
    input: 'arr = [3, 8, 15, 23, 42, 57, 64, 91]; targets 42, 3, 91, 50',
    output: '4, 0, 7, -1',
    hints: ['Keep low and high pointers.', 'mid = low + (high - low) / 2 avoids overflow.', 'Move low or high depending on the comparison.'],
    starter: `public class Main {
    static int binarySearch(int[] arr, int target) {
        // TODO: iterative binary search
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {3, 8, 15, 23, 42, 57, 64, 91};
        int[] targets = {42, 3, 91, 50};
        for (int t : targets) {
            System.out.println("Search " + t + " -> index " + binarySearch(arr, t));
        }
    }
}`,
    solution: `public class Main {
    static int binarySearch(int[] arr, int target) {
        int low = 0;
        int high = arr.length - 1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (arr[mid] == target) {
                return mid;
            } else if (arr[mid] < target) {
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return -1;
    }

    public static void main(String[] args) {
        int[] arr = {3, 8, 15, 23, 42, 57, 64, 91};
        int[] targets = {42, 3, 91, 50};
        for (int t : targets) {
            System.out.println("Search " + t + " -> index " + binarySearch(arr, t));
        }
    }
}`,
    expected: `Search 42 -> index 4
Search 3 -> index 0
Search 91 -> index 7
Search 50 -> index -1`,
    stdin: '',
    explanation: 'Each step halves the search range. Time O(log n), space O(1) for the iterative version (O(log n) stack for recursion). The array must be sorted.',
    followUps: ['Why use low + (high - low) / 2 instead of (low + high) / 2?', 'Find the first and last position of a repeated element.', 'Search in a rotated sorted array.', 'Write the recursive version.'],
  },
  {
    id: 'two-sum',
    title: 'Two Sum using HashMap',
    level: 'Medium',
    topic: 'HashMap',
    statement: 'Given an array and a target, return the indices of two numbers that add up to the target. Return an empty array if no pair exists.',
    input: '[2, 7, 11, 15] target 9; [3, 2, 4] target 6; [1, 5, 3] target 100',
    output: '[0, 1], [1, 2], []',
    hints: ['For each number, the needed partner is target - number.', 'Store each value and its index in a HashMap as you go.'],
    starter: `import java.util.*;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        // TODO: single pass with a HashMap of value -> index
        return new int[0];
    }

    public static void main(String[] args) {
        int[][] arrays = {{2, 7, 11, 15}, {3, 2, 4}, {1, 5, 3}};
        int[] targets = {9, 6, 100};
        for (int i = 0; i < arrays.length; i++) {
            System.out.println(Arrays.toString(arrays[i]) + ", target " + targets[i]
                    + " -> " + Arrays.toString(twoSum(arrays[i], targets[i])));
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> seen = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int need = target - nums[i];
            if (seen.containsKey(need)) {
                return new int[]{seen.get(need), i};
            }
            seen.put(nums[i], i);
        }
        return new int[0];
    }

    public static void main(String[] args) {
        int[][] arrays = {{2, 7, 11, 15}, {3, 2, 4}, {1, 5, 3}};
        int[] targets = {9, 6, 100};
        for (int i = 0; i < arrays.length; i++) {
            System.out.println(Arrays.toString(arrays[i]) + ", target " + targets[i]
                    + " -> " + Arrays.toString(twoSum(arrays[i], targets[i])));
        }
    }
}`,
    expected: `[2, 7, 11, 15], target 9 -> [0, 1]
[3, 2, 4], target 6 -> [1, 2]
[1, 5, 3], target 100 -> []`,
    stdin: '',
    explanation: 'While scanning, check whether the complement was already seen; if yes, return both indices. Checking before inserting avoids using the same element twice. Time O(n), space O(n). The brute-force double loop is O(n^2).',
    followUps: ['Solve it with two pointers if the array is sorted.', 'Return all unique pairs instead of one.', 'Extend it to Three Sum.'],
  },
  {
    id: 'first-non-repeating-char',
    title: 'First Non-Repeating Character',
    level: 'Medium',
    topic: 'HashMap',
    statement: 'Find the first character in a string that appears exactly once. Print "none" if every character repeats.',
    input: '"swiss", "programming", "aabbcc"',
    output: 'w, p, none',
    hints: ['Count characters with a LinkedHashMap.', 'Return the first key whose count is 1.'],
    starter: `import java.util.*;

public class Main {
    static Character firstUnique(String s) {
        // TODO: count with a LinkedHashMap, return first char with count 1, or null
        return null;
    }

    public static void main(String[] args) {
        String[] inputs = {"swiss", "programming", "aabbcc"};
        for (String s : inputs) {
            Character c = firstUnique(s);
            System.out.println(s + " -> " + (c == null ? "none" : c));
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static Character firstUnique(String s) {
        Map<Character, Integer> count = new LinkedHashMap<>();
        for (char c : s.toCharArray()) {
            count.put(c, count.getOrDefault(c, 0) + 1);
        }
        for (Map.Entry<Character, Integer> e : count.entrySet()) {
            if (e.getValue() == 1) {
                return e.getKey();
            }
        }
        return null;
    }

    public static void main(String[] args) {
        String[] inputs = {"swiss", "programming", "aabbcc"};
        for (String s : inputs) {
            Character c = firstUnique(s);
            System.out.println(s + " -> " + (c == null ? "none" : c));
        }
    }
}`,
    expected: `swiss -> w
programming -> p
aabbcc -> none`,
    stdin: '',
    explanation: 'LinkedHashMap keeps characters in first-appearance order, so the first entry with count 1 is the answer. Time O(n), space O(k) for k distinct characters.',
    followUps: ['Solve it with an int[256] array and a second pass over the string.', 'Find the first repeating character instead.', 'How would you handle a continuous stream of characters?'],
  },
  {
    id: 'balanced-parentheses',
    title: 'Balanced Parentheses',
    level: 'Medium',
    topic: 'Stack & Queue',
    statement: 'Check whether a string of brackets ( ) { } [ ] is balanced: every opening bracket is closed by the same type in the correct order.',
    input: '"{[()]}", "([)]", "((()", "{[]}()", ")("',
    output: 'true, false, false, true, false',
    hints: ['Push opening brackets onto a stack.', 'For a closing bracket, the top of the stack must be the matching opening bracket.', 'At the end the stack must be empty.'],
    starter: `import java.util.*;

public class Main {
    static boolean isBalanced(String s) {
        // TODO: use a Deque<Character> as a stack
        return false;
    }

    public static void main(String[] args) {
        String[] inputs = {"{[()]}", "([)]", "((()", "{[]}()", ")("};
        for (String s : inputs) {
            System.out.println(s + " -> " + isBalanced(s));
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static boolean isBalanced(String s) {
        Deque<Character> stack = new ArrayDeque<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') {
                stack.push(c);
            } else {
                if (stack.isEmpty()) {
                    return false;
                }
                char top = stack.pop();
                if ((c == ')' && top != '(') || (c == '}' && top != '{') || (c == ']' && top != '[')) {
                    return false;
                }
            }
        }
        return stack.isEmpty();
    }

    public static void main(String[] args) {
        String[] inputs = {"{[()]}", "([)]", "((()", "{[]}()", ")("};
        for (String s : inputs) {
            System.out.println(s + " -> " + isBalanced(s));
        }
    }
}`,
    expected: `{[()]} -> true
([)] -> false
((() -> false
{[]}() -> true
)( -> false`,
    stdin: '',
    explanation: 'A stack remembers the most recent unmatched opening bracket. A closing bracket must match the top; leftovers at the end mean unbalanced. Time O(n), space O(n).',
    followUps: ['Why is ArrayDeque preferred over the legacy Stack class?', 'Return the minimum number of brackets to add to make it balanced.', 'Find the length of the longest valid parentheses substring.'],
  },
  {
    id: 'rotate-array',
    title: 'Rotate an Array by K Positions',
    level: 'Medium',
    topic: 'Arrays',
    statement: 'Rotate an array to the right by k positions and to the left by k positions in place, using the reversal algorithm. k may be larger than the array length.',
    input: 'Right [1, 2, 3, 4, 5, 6, 7] by 3; Left [10, 20, 30, 40, 50] by 2; Right [1, 2, 3] by 10',
    output: '[5, 6, 7, 1, 2, 3, 4], [30, 40, 50, 10, 20], [3, 1, 2]',
    hints: ['Use k = k % n first.', 'Right rotation: reverse whole array, reverse first k, reverse the rest.', 'Left rotation: reverse first k, reverse the rest, reverse whole array.'],
    starter: `import java.util.Arrays;

public class Main {
    static void reverse(int[] arr, int start, int end) {
        // TODO
    }

    static void rotateRight(int[] arr, int k) {
        // TODO
    }

    static void rotateLeft(int[] arr, int k) {
        // TODO
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5, 6, 7};
        String before = Arrays.toString(a);
        rotateRight(a, 3);
        System.out.println("Right rotate " + before + " by 3 -> " + Arrays.toString(a));
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static void reverse(int[] arr, int start, int end) {
        while (start < end) {
            int temp = arr[start];
            arr[start] = arr[end];
            arr[end] = temp;
            start++;
            end--;
        }
    }

    static void rotateRight(int[] arr, int k) {
        int n = arr.length;
        k = k % n;
        reverse(arr, 0, n - 1);
        reverse(arr, 0, k - 1);
        reverse(arr, k, n - 1);
    }

    static void rotateLeft(int[] arr, int k) {
        int n = arr.length;
        k = k % n;
        reverse(arr, 0, k - 1);
        reverse(arr, k, n - 1);
        reverse(arr, 0, n - 1);
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 3, 4, 5, 6, 7};
        String before = Arrays.toString(a);
        rotateRight(a, 3);
        System.out.println("Right rotate " + before + " by 3 -> " + Arrays.toString(a));

        int[] b = {10, 20, 30, 40, 50};
        before = Arrays.toString(b);
        rotateLeft(b, 2);
        System.out.println("Left rotate " + before + " by 2 -> " + Arrays.toString(b));

        int[] c = {1, 2, 3};
        before = Arrays.toString(c);
        rotateRight(c, 10);
        System.out.println("Right rotate " + before + " by 10 -> " + Arrays.toString(c));
    }
}`,
    expected: `Right rotate [1, 2, 3, 4, 5, 6, 7] by 3 -> [5, 6, 7, 1, 2, 3, 4]
Left rotate [10, 20, 30, 40, 50] by 2 -> [30, 40, 50, 10, 20]
Right rotate [1, 2, 3] by 10 -> [3, 1, 2]`,
    stdin: '',
    explanation: 'Three reversals rotate the array in place. For right rotation by 3: [7,6,5,4,3,2,1] -> [5,6,7,4,3,2,1] -> [5,6,7,1,2,3,4]. Time O(n), space O(1).',
    followUps: ['Solve it with an extra array. What is the space cost?', 'Why do we need k % n?', 'What happens if the array is empty? Fix the code for that case.'],
  },
  {
    id: 'matrix-transpose-multiply',
    title: 'Matrix Transpose and Multiplication',
    level: 'Medium',
    topic: 'Arrays',
    statement: 'Given a 2x3 matrix A and a 3x2 matrix B, print A, the transpose of A, and the product A x B.',
    input: 'A = [[1, 2, 3], [4, 5, 6]], B = [[7, 8], [9, 10], [11, 12]]',
    output: 'Transpose [[1, 4], [2, 5], [3, 6]]; product [[58, 64], [139, 154]]',
    hints: ['Transpose: result[j][i] = a[i][j]; dimensions swap.', 'Product C[i][j] = sum over k of A[i][k] * B[k][j].', 'Columns of A must equal rows of B.'],
    starter: `import java.util.Arrays;

public class Main {
    static int[][] transpose(int[][] a) {
        // TODO
        return a;
    }

    static int[][] multiply(int[][] a, int[][] b) {
        // TODO
        return a;
    }

    static void print(int[][] m) {
        for (int[] row : m) {
            System.out.println(Arrays.toString(row));
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}};
        int[][] b = {{7, 8}, {9, 10}, {11, 12}};
        System.out.println("Matrix A:");
        print(a);
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static int[][] transpose(int[][] a) {
        int rows = a.length;
        int cols = a[0].length;
        int[][] t = new int[cols][rows];
        for (int i = 0; i < rows; i++) {
            for (int j = 0; j < cols; j++) {
                t[j][i] = a[i][j];
            }
        }
        return t;
    }

    static int[][] multiply(int[][] a, int[][] b) {
        int n = a.length;
        int m = a[0].length;
        int p = b[0].length;
        int[][] c = new int[n][p];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < p; j++) {
                int sum = 0;
                for (int k = 0; k < m; k++) {
                    sum += a[i][k] * b[k][j];
                }
                c[i][j] = sum;
            }
        }
        return c;
    }

    static void print(int[][] m) {
        for (int[] row : m) {
            System.out.println(Arrays.toString(row));
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}};
        int[][] b = {{7, 8}, {9, 10}, {11, 12}};
        System.out.println("Matrix A:");
        print(a);
        System.out.println("Transpose of A:");
        print(transpose(a));
        System.out.println("A x B:");
        print(multiply(a, b));
    }
}`,
    expected: `Matrix A:
[1, 2, 3]
[4, 5, 6]
Transpose of A:
[1, 4]
[2, 5]
[3, 6]
A x B:
[58, 64]
[139, 154]`,
    stdin: '',
    explanation: 'Transpose swaps rows and columns in O(r*c). Multiplication uses three nested loops: O(n*m*p) time and O(n*p) space for the result. Example: C[0][0] = 1*7 + 2*9 + 3*11 = 58.',
    followUps: ['Transpose a square matrix in place.', 'Rotate a square matrix by 90 degrees.', 'Print a matrix in spiral order.', 'How do you validate that two matrices can be multiplied?'],
  },
  {
    id: 'string-compression',
    title: 'String Compression (Run-Length Encoding)',
    level: 'Medium',
    topic: 'Strings',
    statement: 'Compress a string by replacing runs of the same character with the character followed by the count. If the compressed string is not shorter, return the original.',
    input: '"aabcccccaaa", "abc", "aaabbbcccd"',
    output: '"a2b1c5a3", "abc", "a3b3c3d1"',
    hints: ['Count consecutive equal characters.', 'Append the character and its count when the run ends.', 'Compare lengths at the end.'],
    starter: `public class Main {
    static String compress(String s) {
        // TODO: run-length encoding with StringBuilder
        return s;
    }

    public static void main(String[] args) {
        String[] inputs = {"aabcccccaaa", "abc", "aaabbbcccd"};
        for (String s : inputs) {
            System.out.println(s + " -> " + compress(s));
        }
    }
}`,
    solution: `public class Main {
    static String compress(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            int count = 0;
            while (i < s.length() && s.charAt(i) == c) {
                count++;
                i++;
            }
            sb.append(c).append(count);
        }
        return sb.length() < s.length() ? sb.toString() : s;
    }

    public static void main(String[] args) {
        String[] inputs = {"aabcccccaaa", "abc", "aaabbbcccd"};
        for (String s : inputs) {
            System.out.println(s + " -> " + compress(s));
        }
    }
}`,
    expected: `aabcccccaaa -> a2b1c5a3
abc -> abc
aaabbbcccd -> a3b3c3d1`,
    stdin: '',
    explanation: 'Walk through the string and count each run of identical characters, appending char + count. Using StringBuilder avoids creating many String objects. Time O(n), space O(n).',
    followUps: ['Why is string concatenation in a loop slow?', 'Write the decompress method.', 'How would you handle counts greater than 9 when decompressing?'],
  },
  {
    id: 'employee-sort-comparator',
    title: 'Sort Employees by Salary using Comparator',
    level: 'Medium',
    topic: 'Collections',
    statement: 'Create an Employee class (name, department, salary). Sort a list by salary in descending order, with ties broken by name, and then sort by name alphabetically.',
    input: 'Amit/IT/55000, Sneha/HR/48000, Ravi/IT/72000, Pooja/Finance/61000, Kiran/HR/48000',
    output: 'Ravi, Pooja, Amit, Kiran, Sneha (by salary); Amit, Kiran, Pooja, Ravi, Sneha (by name)',
    hints: ['Comparator.comparingInt(Employee::getSalary).reversed()', 'Chain with thenComparing(Employee::getName).', 'List.of() is immutable; copy it into an ArrayList before sorting.'],
    starter: `import java.util.*;

class Employee {
    private final String name;
    private final String dept;
    private final int salary;

    Employee(String name, String dept, int salary) {
        this.name = name;
        this.dept = dept;
        this.salary = salary;
    }

    public String getName() { return name; }
    public String getDept() { return dept; }
    public int getSalary() { return salary; }

    @Override
    public String toString() {
        return name + " (" + dept + ") - " + salary;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> list = new ArrayList<>(List.of(
            new Employee("Amit", "IT", 55000),
            new Employee("Sneha", "HR", 48000),
            new Employee("Ravi", "IT", 72000),
            new Employee("Pooja", "Finance", 61000),
            new Employee("Kiran", "HR", 48000)
        ));
        // TODO: sort by salary (high to low), then by name, and print
        // TODO: sort by name and print
    }
}`,
    solution: `import java.util.*;

class Employee {
    private final String name;
    private final String dept;
    private final int salary;

    Employee(String name, String dept, int salary) {
        this.name = name;
        this.dept = dept;
        this.salary = salary;
    }

    public String getName() { return name; }
    public String getDept() { return dept; }
    public int getSalary() { return salary; }

    @Override
    public String toString() {
        return name + " (" + dept + ") - " + salary;
    }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> list = new ArrayList<>(List.of(
            new Employee("Amit", "IT", 55000),
            new Employee("Sneha", "HR", 48000),
            new Employee("Ravi", "IT", 72000),
            new Employee("Pooja", "Finance", 61000),
            new Employee("Kiran", "HR", 48000)
        ));

        Comparator<Employee> bySalaryDesc = Comparator.comparingInt(Employee::getSalary).reversed();
        list.sort(bySalaryDesc.thenComparing(Employee::getName));
        System.out.println("Sorted by salary (high to low), then name:");
        list.forEach(System.out::println);

        list.sort(Comparator.comparing(Employee::getName));
        System.out.println("Sorted by name:");
        list.forEach(System.out::println);
    }
}`,
    expected: `Sorted by salary (high to low), then name:
Ravi (IT) - 72000
Pooja (Finance) - 61000
Amit (IT) - 55000
Kiran (HR) - 48000
Sneha (HR) - 48000
Sorted by name:
Amit (IT) - 55000
Kiran (HR) - 48000
Pooja (Finance) - 61000
Ravi (IT) - 72000
Sneha (HR) - 48000`,
    stdin: '',
    explanation: 'Comparator factory methods build readable multi-level sorts. List.sort uses a stable merge-based sort (TimSort), O(n log n) time.',
    followUps: ['What is the difference between Comparable and Comparator?', 'Sort the same list using a stream and sorted().', 'Why does Comparator.comparing(e -> e.getSalary()).reversed() sometimes fail to compile?', 'Find the employee with the highest salary in each department.'],
  },
  {
    id: 'singleton-class',
    title: 'Thread-Safe Singleton Class',
    level: 'Medium',
    topic: 'OOP',
    statement: 'Create an AppConfig class that can have only one instance. Use lazy initialisation with double-checked locking. Show that two calls to getInstance() return the same object.',
    input: 'Two calls to AppConfig.getInstance()',
    output: 'Constructor runs once; both references are the same object',
    hints: ['Make the constructor private.', 'Keep a private static volatile instance field.', 'Check for null, synchronize on the class, and check again.'],
    starter: `class AppConfig {
    // TODO: private static volatile instance field
    private String appName = "DefaultApp";

    // TODO: make the constructor private and print "AppConfig created"

    public static AppConfig getInstance() {
        // TODO: double-checked locking
        return null;
    }

    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }
}

public class Main {
    public static void main(String[] args) {
        // TODO: get the instance twice and compare the references
    }
}`,
    solution: `class AppConfig {
    private static volatile AppConfig instance;
    private String appName = "DefaultApp";

    private AppConfig() {
        System.out.println("AppConfig created");
    }

    public static AppConfig getInstance() {
        if (instance == null) {
            synchronized (AppConfig.class) {
                if (instance == null) {
                    instance = new AppConfig();
                }
            }
        }
        return instance;
    }

    public String getAppName() { return appName; }
    public void setAppName(String appName) { this.appName = appName; }
}

public class Main {
    public static void main(String[] args) {
        AppConfig c1 = AppConfig.getInstance();
        AppConfig c2 = AppConfig.getInstance();
        System.out.println("Same object? " + (c1 == c2));
        c1.setAppName("StudentPortal");
        System.out.println("App name: " + c2.getAppName());
    }
}`,
    expected: `AppConfig created
Same object? true
App name: StudentPortal`,
    stdin: '',
    explanation: 'The private constructor blocks outside creation; the static method creates the instance only once. volatile ensures other threads see a fully constructed object, and the second null check inside synchronized prevents two threads from creating two objects. getInstance is O(1).',
    followUps: ['Why is volatile needed in double-checked locking?', 'Show the Bill Pugh (static holder class) and enum singleton approaches.', 'How can reflection or serialization break a singleton, and how do you prevent it?', 'Where are singletons used in Spring?'],
  },

  // ---------------------------------------------------------------- HARD (6)
  {
    id: 'reverse-linked-list',
    title: 'Reverse a Singly Linked List',
    level: 'Hard',
    topic: 'Linked List',
    statement: 'Build a singly linked list 1 -> 2 -> 3 -> 4 -> 5 using your own Node class. Reverse it iteratively, then reverse it back using recursion.',
    input: '1 -> 2 -> 3 -> 4 -> 5',
    output: '5 -> 4 -> 3 -> 2 -> 1 -> null',
    hints: ['Iterative: keep prev, current and next pointers.', 'Point current.next to prev, then move all pointers one step.', 'Recursive: reverse the rest, then make head.next.next = head and head.next = null.'],
    starter: `class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
    }
}

public class Main {
    static Node reverseIterative(Node head) {
        // TODO
        return head;
    }

    static Node reverseRecursive(Node head) {
        // TODO
        return head;
    }

    static String toText(Node head) {
        StringBuilder sb = new StringBuilder();
        Node cur = head;
        while (cur != null) {
            sb.append(cur.data).append(" -> ");
            cur = cur.next;
        }
        sb.append("null");
        return sb.toString();
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        Node tail = head;
        for (int i = 2; i <= 5; i++) {
            tail.next = new Node(i);
            tail = tail.next;
        }
        System.out.println("Original: " + toText(head));
    }
}`,
    solution: `class Node {
    int data;
    Node next;

    Node(int data) {
        this.data = data;
    }
}

public class Main {
    static Node reverseIterative(Node head) {
        Node prev = null;
        Node current = head;
        while (current != null) {
            Node next = current.next;
            current.next = prev;
            prev = current;
            current = next;
        }
        return prev;
    }

    static Node reverseRecursive(Node head) {
        if (head == null || head.next == null) {
            return head;
        }
        Node newHead = reverseRecursive(head.next);
        head.next.next = head;
        head.next = null;
        return newHead;
    }

    static String toText(Node head) {
        StringBuilder sb = new StringBuilder();
        Node cur = head;
        while (cur != null) {
            sb.append(cur.data).append(" -> ");
            cur = cur.next;
        }
        sb.append("null");
        return sb.toString();
    }

    public static void main(String[] args) {
        Node head = new Node(1);
        Node tail = head;
        for (int i = 2; i <= 5; i++) {
            tail.next = new Node(i);
            tail = tail.next;
        }
        System.out.println("Original: " + toText(head));

        head = reverseIterative(head);
        System.out.println("Reversed: " + toText(head));

        head = reverseRecursive(head);
        System.out.println("Reversed again (recursive): " + toText(head));
    }
}`,
    expected: `Original: 1 -> 2 -> 3 -> 4 -> 5 -> null
Reversed: 5 -> 4 -> 3 -> 2 -> 1 -> null
Reversed again (recursive): 1 -> 2 -> 3 -> 4 -> 5 -> null`,
    stdin: '',
    explanation: 'The iterative version flips one link at a time using three pointers: O(n) time, O(1) space. The recursive version reaches the last node first and fixes links while returning: O(n) time, O(n) stack space.',
    followUps: ['Find the middle of a linked list in one pass.', 'Detect a cycle (Floyd\'s algorithm).', 'Reverse the list in groups of k.', 'Check if a linked list is a palindrome.'],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache using LinkedHashMap',
    level: 'Hard',
    topic: 'Collections',
    statement: 'Implement a Least Recently Used cache with a fixed capacity. When the cache is full, adding a new key removes the least recently used entry. Both get and put count as use.',
    input: 'capacity 3; put 1,2,3; get 1; put 4; get 2; put 3 = "C2"',
    output: 'Key 2 is evicted when 4 is added; get(2) returns null',
    hints: ['LinkedHashMap has a constructor with accessOrder = true.', 'Override removeEldestEntry to return true when size() > capacity.', 'In access order, every get or put moves the key to the end.'],
    starter: `import java.util.*;

class LRUCache extends LinkedHashMap<Integer, String> {
    private final int capacity;

    LRUCache(int capacity) {
        // TODO: call the LinkedHashMap constructor with accessOrder = true
        this.capacity = capacity;
    }

    // TODO: override removeEldestEntry
}

public class Main {
    public static void main(String[] args) {
        LRUCache cache = new LRUCache(3);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        System.out.println("After adding 1,2,3: " + cache);
    }
}`,
    solution: `import java.util.*;

class LRUCache extends LinkedHashMap<Integer, String> {
    private final int capacity;

    LRUCache(int capacity) {
        super(capacity, 0.75f, true);
        this.capacity = capacity;
    }

    @Override
    protected boolean removeEldestEntry(Map.Entry<Integer, String> eldest) {
        return size() > capacity;
    }
}

public class Main {
    public static void main(String[] args) {
        LRUCache cache = new LRUCache(3);
        cache.put(1, "A");
        cache.put(2, "B");
        cache.put(3, "C");
        System.out.println("After adding 1,2,3: " + cache);

        System.out.println("get(1): " + cache.get(1));
        System.out.println("After accessing 1: " + cache);

        cache.put(4, "D");
        System.out.println("After adding 4: " + cache);

        System.out.println("get(2): " + cache.get(2));

        cache.put(3, "C2");
        System.out.println("After updating 3: " + cache);
    }
}`,
    expected: `After adding 1,2,3: {1=A, 2=B, 3=C}
get(1): A
After accessing 1: {2=B, 3=C, 1=A}
After adding 4: {3=C, 1=A, 4=D}
get(2): null
After updating 3: {1=A, 4=D, 3=C2}`,
    stdin: '',
    explanation: 'An access-ordered LinkedHashMap keeps the least recently used entry at the head. removeEldestEntry is checked after every insertion of a new key and removes the head when size exceeds capacity. get and put are O(1) on average.',
    followUps: ['Implement LRU from scratch with a HashMap and a doubly linked list.', 'How would you make this cache thread-safe?', 'What is the difference between LRU and LFU caching?', 'Does printing the map (toString) change the access order?'],
  },
  {
    id: 'kadane-max-subarray',
    title: 'Maximum Subarray Sum (Kadane\'s Algorithm)',
    level: 'Hard',
    topic: 'DP',
    statement: 'Find the contiguous subarray with the largest sum and print the sum and the subarray itself. The array can contain negative numbers, and all elements may be negative.',
    input: '[-2, 1, -3, 4, -1, 2, 1, -5, 4] and [-3, -1, -2]',
    output: '6 with [4, -1, 2, 1]; -1 with [-1]',
    hints: ['At each index, either extend the current subarray or start a new one at this element.', 'Keep a temporary start index for the current subarray.', 'Initialise with the first element, not 0, to handle all-negative arrays.'],
    starter: `import java.util.Arrays;

public class Main {
    static void maxSubarray(int[] arr) {
        // TODO: Kadane's algorithm, tracking start and end indices
        System.out.println("Array: " + Arrays.toString(arr));
    }

    public static void main(String[] args) {
        maxSubarray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4});
        maxSubarray(new int[]{-3, -1, -2});
    }
}`,
    solution: `import java.util.Arrays;

public class Main {
    static void maxSubarray(int[] arr) {
        int maxSum = arr[0];
        int current = arr[0];
        int start = 0;
        int end = 0;
        int tempStart = 0;
        for (int i = 1; i < arr.length; i++) {
            if (current + arr[i] < arr[i]) {
                current = arr[i];
                tempStart = i;
            } else {
                current += arr[i];
            }
            if (current > maxSum) {
                maxSum = current;
                start = tempStart;
                end = i;
            }
        }
        System.out.println("Array: " + Arrays.toString(arr));
        System.out.println("Max sum: " + maxSum + ", subarray: "
                + Arrays.toString(Arrays.copyOfRange(arr, start, end + 1)));
    }

    public static void main(String[] args) {
        maxSubarray(new int[]{-2, 1, -3, 4, -1, 2, 1, -5, 4});
        maxSubarray(new int[]{-3, -1, -2});
    }
}`,
    expected: `Array: [-2, 1, -3, 4, -1, 2, 1, -5, 4]
Max sum: 6, subarray: [4, -1, 2, 1]
Array: [-3, -1, -2]
Max sum: -1, subarray: [-1]`,
    stdin: '',
    explanation: 'current holds the best sum of a subarray ending at index i: either arr[i] alone or current + arr[i]. maxSum records the best seen so far. One pass: O(n) time, O(1) space.',
    followUps: ['Why does starting with 0 instead of arr[0] fail for all-negative arrays?', 'Find the maximum product subarray.', 'Find the maximum circular subarray sum.', 'What is the brute-force approach and its complexity?'],
  },
  {
    id: 'longest-substring-no-repeat',
    title: 'Longest Substring Without Repeating Characters',
    level: 'Hard',
    topic: 'Strings',
    statement: 'Find the length of the longest substring that has no repeated characters, and print that substring (the first one if there are ties).',
    input: '"abcabcbb", "bbbbb", "pwwkew", "dvdf"',
    output: '3 (abc), 1 (b), 3 (wke), 3 (vdf)',
    hints: ['Use a sliding window with left and right pointers.', 'Store the last index of each character in a HashMap.', 'When a repeat is inside the window, move left to lastIndex + 1.'],
    starter: `import java.util.*;

public class Main {
    static String longestUnique(String s) {
        // TODO: sliding window with a HashMap of last seen indices
        return "";
    }

    public static void main(String[] args) {
        String[] inputs = {"abcabcbb", "bbbbb", "pwwkew", "dvdf"};
        for (String s : inputs) {
            String best = longestUnique(s);
            System.out.println(s + " -> " + best.length() + " (" + best + ")");
        }
    }
}`,
    solution: `import java.util.*;

public class Main {
    static String longestUnique(String s) {
        Map<Character, Integer> lastIndex = new HashMap<>();
        int left = 0;
        int bestLen = 0;
        int bestStart = 0;
        for (int right = 0; right < s.length(); right++) {
            char c = s.charAt(right);
            if (lastIndex.containsKey(c) && lastIndex.get(c) >= left) {
                left = lastIndex.get(c) + 1;
            }
            lastIndex.put(c, right);
            if (right - left + 1 > bestLen) {
                bestLen = right - left + 1;
                bestStart = left;
            }
        }
        return s.substring(bestStart, bestStart + bestLen);
    }

    public static void main(String[] args) {
        String[] inputs = {"abcabcbb", "bbbbb", "pwwkew", "dvdf"};
        for (String s : inputs) {
            String best = longestUnique(s);
            System.out.println(s + " -> " + best.length() + " (" + best + ")");
        }
    }
}`,
    expected: `abcabcbb -> 3 (abc)
bbbbb -> 1 (b)
pwwkew -> 3 (wke)
dvdf -> 3 (vdf)`,
    stdin: '',
    explanation: 'The window [left, right] always contains unique characters. When a character repeats inside the window, left jumps past its previous position. Each index is visited once: O(n) time, O(k) space for k distinct characters.',
    followUps: ['Why do we check lastIndex.get(c) >= left?', 'Solve it with an int[128] array instead of a HashMap.', 'Find the longest substring with at most K distinct characters.'],
  },
  {
    id: 'group-by-streams',
    title: 'Group Employees by Department with Streams',
    level: 'Hard',
    topic: 'Streams',
    statement: 'Using the Stream API on a list of employees, print: count per department, names per department, average salary per department, top earner per department, names earning above 60000 (sorted), and the total salary. Use TreeMap so the output order is fixed.',
    input: 'Amit/IT/55000, Sneha/HR/48000, Ravi/IT/72000, Pooja/Finance/61000, Kiran/HR/52000, Meena/IT/65000',
    output: '{Finance=1, HR=2, IT=3} ... total 353000',
    hints: ['Collectors.groupingBy(classifier, TreeMap::new, downstream) gives sorted keys.', 'Downstream collectors: counting(), mapping(), averagingInt(), maxBy().', 'collectingAndThen() can convert Optional<Employee> to a name.'],
    starter: `import java.util.*;
import java.util.stream.*;

class Employee {
    private final String name;
    private final String dept;
    private final int salary;

    Employee(String name, String dept, int salary) {
        this.name = name;
        this.dept = dept;
        this.salary = salary;
    }

    public String getName() { return name; }
    public String getDept() { return dept; }
    public int getSalary() { return salary; }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> emps = List.of(
            new Employee("Amit", "IT", 55000),
            new Employee("Sneha", "HR", 48000),
            new Employee("Ravi", "IT", 72000),
            new Employee("Pooja", "Finance", 61000),
            new Employee("Kiran", "HR", 52000),
            new Employee("Meena", "IT", 65000)
        );
        // TODO: use Collectors.groupingBy with TreeMap::new
    }
}`,
    solution: `import java.util.*;
import java.util.stream.*;

class Employee {
    private final String name;
    private final String dept;
    private final int salary;

    Employee(String name, String dept, int salary) {
        this.name = name;
        this.dept = dept;
        this.salary = salary;
    }

    public String getName() { return name; }
    public String getDept() { return dept; }
    public int getSalary() { return salary; }
}

public class Main {
    public static void main(String[] args) {
        List<Employee> emps = List.of(
            new Employee("Amit", "IT", 55000),
            new Employee("Sneha", "HR", 48000),
            new Employee("Ravi", "IT", 72000),
            new Employee("Pooja", "Finance", 61000),
            new Employee("Kiran", "HR", 52000),
            new Employee("Meena", "IT", 65000)
        );

        Map<String, Long> countByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::getDept, TreeMap::new, Collectors.counting()));
        System.out.println("Count by department: " + countByDept);

        Map<String, List<String>> namesByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::getDept, TreeMap::new,
                        Collectors.mapping(Employee::getName, Collectors.toList())));
        System.out.println("Names by department: " + namesByDept);

        Map<String, Double> avgByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::getDept, TreeMap::new,
                        Collectors.averagingInt(Employee::getSalary)));
        System.out.println("Average salary by department: " + avgByDept);

        Map<String, String> topByDept = emps.stream()
                .collect(Collectors.groupingBy(Employee::getDept, TreeMap::new,
                        Collectors.collectingAndThen(
                                Collectors.maxBy(Comparator.comparingInt(Employee::getSalary)),
                                opt -> opt.get().getName())));
        System.out.println("Top earner by department: " + topByDept);

        List<String> highEarners = emps.stream()
                .filter(e -> e.getSalary() > 60000)
                .map(Employee::getName)
                .sorted()
                .collect(Collectors.toList());
        System.out.println("Earning above 60000: " + highEarners);

        int total = emps.stream().mapToInt(Employee::getSalary).sum();
        System.out.println("Total salary: " + total);
    }
}`,
    expected: `Count by department: {Finance=1, HR=2, IT=3}
Names by department: {Finance=[Pooja], HR=[Sneha, Kiran], IT=[Amit, Ravi, Meena]}
Average salary by department: {Finance=61000.0, HR=50000.0, IT=64000.0}
Top earner by department: {Finance=Pooja, HR=Kiran, IT=Ravi}
Earning above 60000: [Meena, Pooja, Ravi]
Total salary: 353000`,
    stdin: '',
    explanation: 'groupingBy splits the stream by a key, and a downstream collector summarises each group. Passing TreeMap::new sorts department names; a plain groupingBy returns a HashMap with no guaranteed order. Each pipeline is O(n) plus O(g log g) for the TreeMap of g groups.',
    followUps: ['What is the difference between groupingBy and partitioningBy?', 'Find the second highest salary using streams.', 'What is the difference between map() and flatMap()?', 'Are streams lazy? What triggers execution?'],
  },
  {
    id: 'immutable-class',
    title: 'Create a Custom Immutable Class',
    level: 'Hard',
    topic: 'OOP',
    statement: 'Create an immutable Student class with name, roll number and a list of subjects. Changing the original list after construction must not affect the object, getters must not allow modification, and "changing" the name must return a new object.',
    input: 'Student("Asha", 101, [Java, SQL]); then add "Python" to the original list; try to add "HTML" through the getter',
    output: 'Student keeps [Java, SQL]; modifying via getter throws UnsupportedOperationException',
    hints: ['Make the class final and all fields private final.', 'Make a defensive copy of the list in the constructor (List.copyOf).', 'Return an unmodifiable list from the getter.', 'Provide withName() that returns a new Student.'],
    starter: `import java.util.*;

final class Student {
    // TODO: private final fields: name, roll, subjects

    Student(String name, int roll, List<String> subjects) {
        // TODO: assign fields with a defensive copy of subjects
    }

    // TODO: getters, withName(), toString()
}

public class Main {
    public static void main(String[] args) {
        List<String> subjects = new ArrayList<>();
        subjects.add("Java");
        subjects.add("SQL");
        // TODO: create a Student and test immutability
    }
}`,
    solution: `import java.util.*;

final class Student {
    private final String name;
    private final int roll;
    private final List<String> subjects;

    Student(String name, int roll, List<String> subjects) {
        this.name = name;
        this.roll = roll;
        this.subjects = List.copyOf(subjects);
    }

    public String getName() { return name; }
    public int getRoll() { return roll; }
    public List<String> getSubjects() { return subjects; }

    public Student withName(String newName) {
        return new Student(newName, roll, subjects);
    }

    @Override
    public String toString() {
        return "Student{name=" + name + ", roll=" + roll + ", subjects=" + subjects + "}";
    }
}

public class Main {
    public static void main(String[] args) {
        List<String> subjects = new ArrayList<>();
        subjects.add("Java");
        subjects.add("SQL");

        Student s = new Student("Asha", 101, subjects);
        System.out.println(s);

        subjects.add("Python");
        System.out.println("After changing original list: " + s);

        try {
            s.getSubjects().add("HTML");
        } catch (UnsupportedOperationException e) {
            System.out.println("Cannot modify subjects: UnsupportedOperationException");
        }

        Student s2 = s.withName("Asha Rao");
        System.out.println("Original: " + s);
        System.out.println("Copy: " + s2);
    }
}`,
    expected: `Student{name=Asha, roll=101, subjects=[Java, SQL]}
After changing original list: Student{name=Asha, roll=101, subjects=[Java, SQL]}
Cannot modify subjects: UnsupportedOperationException
Original: Student{name=Asha, roll=101, subjects=[Java, SQL]}
Copy: Student{name=Asha Rao, roll=101, subjects=[Java, SQL]}`,
    stdin: '',
    explanation: 'final class prevents subclasses from adding mutable behaviour; private final fields cannot be reassigned; List.copyOf makes an unmodifiable defensive copy so outside changes cannot leak in and callers cannot modify it. "Modifications" return new objects, just like String. Immutable objects are thread-safe without synchronization.',
    followUps: ['Why is String immutable in Java?', 'What if a field is a mutable Date? How do you protect it?', 'How does a Java record help create immutable classes?', 'What is the difference between Collections.unmodifiableList and List.copyOf?'],
  },
];
