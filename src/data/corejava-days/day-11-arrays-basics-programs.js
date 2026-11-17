const j = String.raw;

const ex1 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] scores = new int[3];           // declaration + memory, default 0
        String[] names = new String[2];      // default null
        boolean[] flags = new boolean[2];    // default false
        double[] prices = new double[2];     // default 0.0

        int[] marks = {10, 20, 30};          // declaration + initialisation
        int[] ages = new int[] {21, 25};     // anonymous array style
        marks[1] = 25;                       // update by index

        System.out.println("scores : " + Arrays.toString(scores));
        System.out.println("names  : " + Arrays.toString(names));
        System.out.println("flags  : " + Arrays.toString(flags));
        System.out.println("prices : " + Arrays.toString(prices));
        System.out.println("marks  : " + Arrays.toString(marks));
        System.out.println("ages   : " + Arrays.toString(ages));
        System.out.println("marks length = " + marks.length);
        System.out.println("first = " + marks[0] + ", last = " + marks[marks.length - 1]);
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        int[] arr = {5, 10, 15, 20};

        System.out.print("Forward :");
        for (int i = 0; i < arr.length; i++) {
            System.out.print(" " + arr[i]);
        }
        System.out.println();

        System.out.print("Reverse :");
        for (int i = arr.length - 1; i >= 0; i--) {
            System.out.print(" " + arr[i]);
        }
        System.out.println();

        System.out.print("for-each:");
        for (int value : arr) {
            System.out.print(" " + value);
        }
        System.out.println();

        System.out.print("Even indexes:");
        for (int i = 0; i < arr.length; i += 2) {
            System.out.print(" " + arr[i]);
        }
        System.out.println();
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        int[] arr = {34, 7, 89, 21, 56, 7};

        int sum = 0;
        int min = arr[0];
        int max = arr[0];
        for (int x : arr) {
            sum += x;
            if (x < min) min = x;
            if (x > max) max = x;
        }
        double avg = (double) sum / arr.length;

        System.out.println("Sum = " + sum);
        System.out.printf("Average = %.2f%n", avg);
        System.out.println("Min = " + min + ", Max = " + max);

        int key = 21;
        int index = -1;
        for (int i = 0; i < arr.length; i++) {
            if (arr[i] == key) {
                index = i;
                break;
            }
        }
        System.out.println(key + " found at index " + index);

        int count = 0;
        for (int x : arr) {
            if (x == 7) count++;
        }
        System.out.println("7 occurs " + count + " times");
    }
}`;

const ex4 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] original = {3, 1, 4, 1, 5, 9, 2};
        int[] copy = Arrays.copyOf(original, original.length);  // real copy
        int[] alias = original;                                 // same array!

        // reverse original in place using two pointers
        for (int i = 0, k = original.length - 1; i < k; i++, k--) {
            int temp = original[i];
            original[i] = original[k];
            original[k] = temp;
        }
        System.out.println("Reversed    : " + Arrays.toString(original));
        System.out.println("Alias       : " + Arrays.toString(alias));

        Arrays.sort(copy);
        System.out.println("Sorted copy : " + Arrays.toString(copy));
        System.out.println("Index of 5  : " + Arrays.binarySearch(copy, 5));

        int[] firstThree = Arrays.copyOfRange(copy, 0, 3);
        System.out.println("First three : " + Arrays.toString(firstThree));

        System.out.println("original == alias : " + (original == alias));
        System.out.println("equals(original, copy) : " + Arrays.equals(original, copy));
    }
}`;

const ex5 = j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        // 1. Second largest
        int[] a = {12, 35, 1, 10, 34, 1};
        int largest = Integer.MIN_VALUE;
        int second = Integer.MIN_VALUE;
        for (int x : a) {
            if (x > largest) {
                second = largest;
                largest = x;
            } else if (x > second && x != largest) {
                second = x;
            }
        }
        System.out.println("Largest = " + largest + ", Second largest = " + second);

        // 2. Move zeros to the end
        int[] b = {0, 1, 0, 3, 12};
        int pos = 0;
        for (int x : b) {
            if (x != 0) {
                b[pos++] = x;
            }
        }
        while (pos < b.length) {
            b[pos++] = 0;
        }
        System.out.println("Zeros moved : " + Arrays.toString(b));

        // 3. Missing number from 1..n
        int[] c = {1, 2, 4, 5, 6};
        int n = c.length + 1;
        int expected = n * (n + 1) / 2;
        int actual = 0;
        for (int x : c) actual += x;
        System.out.println("Missing number = " + (expected - actual));
    }
}`;

export default {
  id: 'day-11-arrays-basics-programs',
  title: 'Arrays: Declaration, Initialization, Traversal, Common Array Programs',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 11,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Store many values of the same type in a single array. Learn how to declare, create, initialise, traverse and copy arrays, use the java.util.Arrays helper class, and solve the most common array interview programs.',
  objectives: [
    'Declare and create arrays in all valid ways and know their default values',
    'Access elements by index and avoid ArrayIndexOutOfBoundsException',
    'Traverse arrays forward, backward and with for-each',
    'Use Arrays.toString, sort, copyOf, copyOfRange, binarySearch and equals',
    'Solve sum, min/max, search, reverse, second largest, move zeros and missing number problems',
  ],
  theory: [
    {
      heading: 'What is an Array?',
      content: j`An array is a fixed-size container that stores multiple values of the SAME type in contiguous memory, accessed by an index starting from 0.

Analogy: a row of numbered lockers at a railway station. Every locker is the same size (same data type), each has a number (index), and the total number of lockers is fixed once built (length).

int[] marks = {78, 92, 65, 88};

index:   0    1    2    3
       +----+----+----+----+
marks: | 78 | 92 | 65 | 88 |
       +----+----+----+----+
marks.length = 4, first index 0, last index length - 1 = 3

Key facts:
- Arrays are objects in Java; they live on the heap. The variable holds a reference.
- length is a field (marks.length), not a method (unlike String.length()).
- Size is fixed after creation. For a growing list use ArrayList (Collections course).`,
    },
    {
      heading: 'Declaration, Creation and Initialisation',
      content: j`1. Declare only (no memory yet):
   int[] a;        (preferred)       int a[];   (C-style, also valid)

2. Create with new (all elements get default values):
   a = new int[5];          // [0, 0, 0, 0, 0]

3. Declare + create:
   int[] a = new int[5];

4. Declare + initialise with values (size inferred):
   int[] a = {10, 20, 30};

5. Anonymous array (useful when passing to methods):
   int[] a = new int[] {10, 20, 30};
   printAll(new int[] {1, 2, 3});

Default values: 0 for int/long/short/byte, 0.0 for float/double, false for boolean, '\u0000' for char, null for objects (String etc.).

Invalid:
   int[5] a;                 // size cannot be in the declaration
   int[] a = new int[3] {1, 2, 3};   // cannot give both size and values
   int[] a; a = {1, 2};      // {..} shortcut only works in the declaration line`,
    },
    {
      heading: 'Accessing Elements and Traversal',
      content: j`Read:   int x = marks[2];
Write:  marks[2] = 70;

Valid indexes are 0 to length - 1. Using marks[4] on a 4-element array throws ArrayIndexOutOfBoundsException at runtime. Negative indexes also throw.

Traversal patterns:
- Forward:  for (int i = 0; i < arr.length; i++)
- Backward: for (int i = arr.length - 1; i >= 0; i--)
- for-each: for (int x : arr)        (read-only, no index)
- Two pointers: for (int i = 0, k = arr.length - 1; i < k; i++, k--)   (reverse, palindrome checks)

Printing an array directly with println(arr) prints something like [I@1b6d3586 (type + hash code), NOT the elements. Use Arrays.toString(arr).`,
      tip: 'Off-by-one errors are the number one array bug. Always use i < arr.length, never i <= arr.length.',
    },
    {
      heading: 'The java.util.Arrays Helper Class',
      content: j`Arrays contains static utility methods:`,
      points: [
        'Arrays.toString(arr) -> "[1, 2, 3]" readable text',
        'Arrays.sort(arr) -> sorts in ascending order (in place)',
        'Arrays.binarySearch(arr, key) -> index of key in a SORTED array (negative if not found)',
        'Arrays.copyOf(arr, newLength) -> new array copy (pads with defaults or truncates)',
        'Arrays.copyOfRange(arr, from, to) -> copy of indexes from..to-1',
        'Arrays.equals(a, b) -> true if same length and same elements in order',
        'Arrays.fill(arr, value) -> sets every element to value',
        'Arrays.stream(arr).sum() / max() -> stream helpers (Day 40)',
      ],
    },
    {
      heading: 'Array References: Copy vs Alias',
      content: j`Because arrays are objects, assigning one array variable to another copies the REFERENCE, not the elements:

int[] a = {1, 2, 3};
int[] b = a;        // b points to the SAME array
b[0] = 100;         // a[0] is now 100 too!

Stack          Heap
a ----+
      +-----> [100, 2, 3]
b ----+

To get an independent copy use Arrays.copyOf(a, a.length), a.clone(), or System.arraycopy(src, srcPos, dest, destPos, length).

a == b compares references (same object?). Arrays.equals(a, b) compares contents.`,
    },
    {
      heading: 'Common Array Program Techniques',
      content: j`Most interview array problems use one of these ideas:`,
      points: [
        'Running total: sum += arr[i]; average = (double) sum / length',
        'Track best so far: min/max start at arr[0] (or Integer.MAX_VALUE / MIN_VALUE)',
        'Linear search: loop and break when found; return -1 when not found',
        'Two pointers from both ends: reverse, palindrome, pair sum in sorted array',
        'Write pointer: copy wanted elements forward (move zeros, remove duplicates)',
        'Math formula: missing number = n(n+1)/2 - sum',
        'Counting: frequency of an element with a counter variable',
      ],
    },
  ],
  examples: [
    {
      title: 'Declaring, creating and initialising arrays',
      scenario: 'Create arrays in different ways and inspect their default values and length.',
      steps: [
        'Create class Main and import java.util.Arrays',
        'Declare each array as shown and change marks[1]',
        'Run and observe default values for each type',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `scores : [0, 0, 0]
names  : [null, null]
flags  : [false, false]
prices : [0.0, 0.0]
marks  : [10, 25, 30]
ages   : [21, 25]
marks length = 3
first = 10, last = 30`,
      explanation: 'Arrays created with new get default values. marks[1] = 25 replaces 20. The last element is always at index length - 1 = 2.',
    },
    {
      title: 'Traversing an array in different ways',
      scenario: 'Print the same array forward, backward, with for-each and only at even indexes.',
      steps: [
        'Type the four loops',
        'Note the spacing trick: a space is printed BEFORE each value',
        'Run and compare',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Forward : 5 10 15 20
Reverse : 20 15 10 5
for-each: 5 10 15 20
Even indexes: 5 15`,
      explanation: 'The forward loop uses indexes 0..3, the reverse loop 3..0. for-each reads values without an index. i += 2 visits indexes 0 and 2, which hold 5 and 15.',
    },
    {
      title: 'Sum, average, min, max, search and count',
      scenario: 'Analyse sales figures: total, average, lowest, highest, find a value and count repeats.',
      steps: [
        'Initialise min and max with arr[0]',
        'Update them inside a single for-each loop',
        'Write a linear search with break, then count occurrences of 7',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Sum = 214
Average = 35.67
Min = 7, Max = 89
21 found at index 3
7 occurs 2 times`,
      explanation: '34 + 7 + 89 + 21 + 56 + 7 = 214. 214 / 6 = 35.666... printed as 35.67. The smallest value is 7 and the largest 89. 21 is at index 3. 7 appears at indexes 1 and 5.',
    },
    {
      title: 'Reverse in place, copy vs alias, sort and binary search',
      scenario: 'Understand that assigning an array shares it, while Arrays.copyOf creates an independent copy.',
      steps: [
        'Create original, a real copy and an alias',
        'Reverse original with two pointers and print original and alias',
        'Sort the copy, search it, and compare references and contents',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Reversed    : [2, 9, 5, 1, 4, 1, 3]
Alias       : [2, 9, 5, 1, 4, 1, 3]
Sorted copy : [1, 1, 2, 3, 4, 5, 9]
Index of 5  : 5
First three : [1, 1, 2]
original == alias : true
equals(original, copy) : false`,
      explanation: 'alias points to the same array, so it also shows the reversed values. copy was made before reversing and is independent; after sorting it is [1, 1, 2, 3, 4, 5, 9] and 5 is at index 5. copyOfRange(0, 3) copies indexes 0, 1, 2. The contents of original and copy differ in order, so equals is false.',
    },
    {
      title: 'Interview classics: second largest, move zeros, missing number',
      scenario: 'Three frequently asked array problems solved in one pass each.',
      steps: [
        'Track largest and second largest together while scanning',
        'Use a write pointer pos to move non-zero values forward, then fill zeros',
        'Use the formula n(n+1)/2 to find the missing number',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Largest = 35, Second largest = 34
Zeros moved : [1, 3, 12, 0, 0]
Missing number = 3`,
      explanation: 'Scanning 12, 35, 1, 10, 34, 1: largest becomes 12 then 35 (second becomes 12); 34 > 12 so second = 34. Non-zero values 1, 3, 12 are written to positions 0-2, then positions 3-4 become 0. n = 6, expected sum 21, actual 18, missing 3.',
    },
  ],
  interview: [
    { q: 'What is the index of the first element of an array?', a: '0. The last index is length - 1.', level: 'Easy' },
    { q: 'Difference between length and length()?', a: 'length is a field of arrays (arr.length). length() is a method of String (s.length()). Collections use size().', level: 'Easy' },
    { q: 'What happens when you access an invalid index?', a: 'ArrayIndexOutOfBoundsException is thrown at runtime. Java checks bounds on every access.', level: 'Easy' },
    { q: 'What is the output: int[] a = new int[3]; System.out.println(a[1]);', a: '0. int array elements default to 0.', level: 'Easy' },
    { q: 'What is printed by System.out.println(new int[]{1,2});?', a: 'Something like [I@1b6d3586: the type code [I and a hash code. Use Arrays.toString to print elements.', level: 'Medium' },
    { q: 'What is the output: int[] a = {1,2,3}; int[] b = a; b[0] = 9; System.out.println(a[0]);', a: '9. a and b refer to the same array object.', level: 'Medium' },
    { q: 'Can the size of an array be changed after creation?', a: 'No. Arrays are fixed size. Create a new bigger array and copy (Arrays.copyOf), or use ArrayList.', level: 'Easy' },
    { q: 'Can array size be zero or negative?', a: 'Zero is allowed (new int[0] is an empty array). Negative size throws NegativeArraySizeException at runtime.', level: 'Medium' },
    { q: 'What is the precondition for Arrays.binarySearch?', a: 'The array must be sorted in ascending order; otherwise the result is undefined.', level: 'Medium' },
    { q: 'How do you find the second largest element in one pass?', a: 'Keep largest and second. If x > largest, second = largest and largest = x; else if x > second and x != largest, second = x.', level: 'Medium' },
    { q: 'Difference between a == b and Arrays.equals(a, b)?', a: '== checks whether both references point to the same array object. Arrays.equals compares length and each element.', level: 'Medium' },
    { q: 'Is int[] a, b; the same as int a[], b; ?', a: 'No. int[] a, b; declares two arrays. int a[], b; declares an array a and a plain int b.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Count the even and odd numbers in an array.',
      hint: 'Use x % 2 == 0 inside a for-each loop.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[] arr = {11, 24, 37, 40, 53, 66};
        int even = 0, odd = 0;
        for (int x : arr) {
            if (x % 2 == 0) even++;
            else odd++;
        }
        System.out.println("Even: " + even + ", Odd: " + odd);
    }
}`,
    },
    {
      task: 'Check whether an array is a palindrome, e.g. {1, 2, 3, 2, 1}.',
      hint: 'Compare arr[i] with arr[length - 1 - i] for the first half.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 2, 1};
        boolean palindrome = true;
        for (int i = 0; i < arr.length / 2; i++) {
            if (arr[i] != arr[arr.length - 1 - i]) {
                palindrome = false;
                break;
            }
        }
        System.out.println("Palindrome? " + palindrome);
    }
}`,
    },
    {
      task: 'Rotate an array left by one position: {1, 2, 3, 4, 5} -> {2, 3, 4, 5, 1}.',
      hint: 'Save arr[0], shift every element left, put the saved value at the end.',
      solution: j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] arr = {1, 2, 3, 4, 5};
        int first = arr[0];
        for (int i = 0; i < arr.length - 1; i++) {
            arr[i] = arr[i + 1];
        }
        arr[arr.length - 1] = first;
        System.out.println(Arrays.toString(arr));
    }
}`,
    },
    {
      task: 'Read 5 numbers from the user into an array and print them in reverse order.',
      hint: 'Fill with a for loop using sc.nextInt(), then loop backwards.',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int[] arr = new int[5];
        System.out.println("Enter 5 numbers:");
        for (int i = 0; i < arr.length; i++) {
            arr[i] = sc.nextInt();
        }
        for (int i = arr.length - 1; i >= 0; i--) {
            System.out.print(arr[i] + " ");
        }
        System.out.println();
    }
}`,
    },
    {
      task: 'Merge two arrays {1, 3, 5} and {2, 4} into one array and sort it.',
      hint: 'Create a new array of combined length, copy both, then Arrays.sort.',
      solution: j`import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {1, 3, 5};
        int[] b = {2, 4};
        int[] merged = new int[a.length + b.length];
        System.arraycopy(a, 0, merged, 0, a.length);
        System.arraycopy(b, 0, merged, a.length, b.length);
        Arrays.sort(merged);
        System.out.println(Arrays.toString(merged));
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which declaration is INVALID?', options: ['int[] a = new int[3];', 'int a[] = {1, 2};', 'int[] a = new int[3] {1, 2, 3};', 'int[] a = new int[] {1, 2, 3};'], answer: 2, explanation: 'You cannot give both a size and an initialiser list.' },
    { question: 'What is the default value of elements in new String[4]?', options: ['""', 'null', '"null"', '0'], answer: 1, explanation: 'Object/reference array elements default to null.' },
    { question: 'For int[] arr = new int[5], which index is the last?', options: ['5', '6', '0', '4'], answer: 3, explanation: 'Indexes run from 0 to length - 1 = 4.' },
    { question: 'Which method prints the contents of an array in readable form?', options: ['Arrays.toString(arr)', 'arr.toString()', 'System.out.println(arr)', 'arr.print()'], answer: 0, explanation: 'Arrays.toString returns a String like [1, 2, 3].' },
    { question: 'What prints? int[] a = {4, 8, 2}; int s = 0; for (int x : a) s += x; System.out.println(s / a.length);', options: ['4.67', '4', '5', '14'], answer: 1, explanation: '14 / 3 = 4 with int division.' },
  ],
};
