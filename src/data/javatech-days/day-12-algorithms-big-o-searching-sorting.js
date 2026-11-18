const ex1 = `public class Main {
    public static void main(String[] args) {
        int[] sizes = {8, 1024};
        for (int n : sizes) {
            int constant = 1;                               // O(1)

            int logSteps = 0;                               // O(log n)
            for (int i = 1; i < n; i *= 2) logSteps++;

            int linear = 0;                                 // O(n)
            for (int i = 0; i < n; i++) linear++;

            int nLogN = 0;                                  // O(n log n)
            for (int i = 0; i < n; i++)
                for (int j = 1; j < n; j *= 2) nLogN++;

            long quadratic = 0;                             // O(n^2)
            for (int i = 0; i < n; i++)
                for (int j = 0; j < n; j++) quadratic++;

            System.out.println("n=" + n + ": O(1)=" + constant + ", O(log n)=" + logSteps
                    + ", O(n)=" + linear + ", O(n log n)=" + nLogN + ", O(n^2)=" + quadratic);
        }
    }
}`;

const ex2 = `public class Main {
    static long factorial(int n) {
        if (n <= 1) return 1;                 // base case
        return n * factorial(n - 1);          // recursive case
    }

    static long power(int base, int exp) {
        if (exp == 0) return 1;
        return base * power(base, exp - 1);
    }

    static int sumOfDigits(int n) {
        if (n == 0) return 0;
        return n % 10 + sumOfDigits(n / 10);
    }

    static String reverse(String s) {
        if (s.isEmpty()) return "";
        return reverse(s.substring(1)) + s.charAt(0);
    }

    static int moves = 0;
    static void hanoi(int disks, char from, char to, char via) {
        if (disks == 1) {
            System.out.println("Move disk 1 from " + from + " to " + to);
            moves++;
            return;
        }
        hanoi(disks - 1, from, via, to);      // move n-1 disks out of the way
        System.out.println("Move disk " + disks + " from " + from + " to " + to);
        moves++;
        hanoi(disks - 1, via, to, from);      // put them back on top
    }

    public static void main(String[] args) {
        System.out.println("5! = " + factorial(5));
        System.out.println("2^10 = " + power(2, 10));
        System.out.println("Sum of digits of 4567 = " + sumOfDigits(4567));
        System.out.println("Reverse of java = " + reverse("java"));
        System.out.println("Tower of Hanoi with 3 disks:");
        hanoi(3, 'A', 'C', 'B');
        System.out.println("Total moves = " + moves);
    }
}`;

const ex3 = `public class Main {
    static int linearSearch(int[] a, int target) {
        int comparisons = 0;
        for (int i = 0; i < a.length; i++) {
            comparisons++;
            if (a[i] == target) {
                System.out.println("Linear: found " + target + " at index " + i + " after " + comparisons + " comparisons");
                return i;
            }
        }
        System.out.println("Linear: " + target + " not found after " + comparisons + " comparisons");
        return -1;
    }

    static int binarySearch(int[] a, int target) {      // array MUST be sorted
        int low = 0, high = a.length - 1, steps = 0;
        while (low <= high) {
            int mid = low + (high - low) / 2;            // avoids int overflow
            steps++;
            System.out.println("  step " + steps + ": low=" + low + " high=" + high + " mid=" + mid + " a[mid]=" + a[mid]);
            if (a[mid] == target) {
                System.out.println("Binary: found " + target + " at index " + mid + " in " + steps + " steps");
                return mid;
            } else if (a[mid] < target) {
                low = mid + 1;                           // search right half
            } else {
                high = mid - 1;                          // search left half
            }
        }
        System.out.println("Binary: " + target + " not found in " + steps + " steps");
        return -1;
    }

    static int binaryRecursive(int[] a, int target, int low, int high) {
        if (low > high) return -1;
        int mid = low + (high - low) / 2;
        if (a[mid] == target) return mid;
        if (a[mid] < target) return binaryRecursive(a, target, mid + 1, high);
        return binaryRecursive(a, target, low, mid - 1);
    }

    public static void main(String[] args) {
        int[] arr = {3, 8, 15, 21, 34, 47, 52, 66, 79, 90};
        linearSearch(arr, 66);
        linearSearch(arr, 10);
        binarySearch(arr, 66);
        binarySearch(arr, 10);
        System.out.println("Recursive binary search for 90: index " + binaryRecursive(arr, 90, 0, arr.length - 1));
    }
}`;

const ex4 = `import java.util.Arrays;

public class Main {
    static void bubbleSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            boolean swapped = false;
            for (int j = 0; j < a.length - 1 - i; j++) {
                if (a[j] > a[j + 1]) {
                    int t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
                    swapped = true;
                }
            }
            System.out.println("Bubble pass " + (i + 1) + ": " + Arrays.toString(a));
            if (!swapped) {
                System.out.println("No swaps in this pass, stop early");
                break;
            }
        }
    }

    static void selectionSort(int[] a) {
        for (int i = 0; i < a.length - 1; i++) {
            int min = i;
            for (int j = i + 1; j < a.length; j++) {
                if (a[j] < a[min]) min = j;
            }
            int t = a[i]; a[i] = a[min]; a[min] = t;
            System.out.println("Selection pass " + (i + 1) + ": " + Arrays.toString(a));
        }
    }

    static void insertionSort(int[] a) {
        for (int i = 1; i < a.length; i++) {
            int key = a[i];
            int j = i - 1;
            while (j >= 0 && a[j] > key) {
                a[j + 1] = a[j];            // shift bigger element right
                j--;
            }
            a[j + 1] = key;                 // drop key into the gap
            System.out.println("Insertion i=" + i + " (key=" + key + "): " + Arrays.toString(a));
        }
    }

    public static void main(String[] args) {
        bubbleSort(new int[]{5, 1, 4, 2, 8});
        selectionSort(new int[]{64, 25, 12, 22, 11});
        insertionSort(new int[]{9, 5, 1, 4, 3});
    }
}`;

const ex5 = `import java.util.Arrays;

public class Main {
    // ---------- Merge Sort: divide, sort halves, merge ----------
    static void mergeSort(int[] a, int left, int right) {
        if (left >= right) return;                 // 1 element is already sorted
        int mid = (left + right) / 2;
        mergeSort(a, left, mid);
        mergeSort(a, mid + 1, right);
        merge(a, left, mid, right);
    }

    static void merge(int[] a, int left, int mid, int right) {
        int[] temp = new int[right - left + 1];
        int i = left, j = mid + 1, k = 0;
        while (i <= mid && j <= right) {
            if (a[i] <= a[j]) temp[k++] = a[i++];
            else temp[k++] = a[j++];
        }
        while (i <= mid) temp[k++] = a[i++];
        while (j <= right) temp[k++] = a[j++];
        System.arraycopy(temp, 0, a, left, temp.length);
        System.out.println("Merged: " + Arrays.toString(temp));
    }

    // ---------- Quick Sort: pick pivot, partition, recurse ----------
    static void quickSort(int[] a, int low, int high) {
        if (low < high) {
            int p = partition(a, low, high);
            System.out.println("Pivot " + a[p] + " -> index " + p + ": " + Arrays.toString(a));
            quickSort(a, low, p - 1);
            quickSort(a, p + 1, high);
        }
    }

    static int partition(int[] a, int low, int high) {   // Lomuto: last element is pivot
        int pivot = a[high];
        int i = low - 1;
        for (int j = low; j < high; j++) {
            if (a[j] < pivot) {
                i++;
                int t = a[i]; a[i] = a[j]; a[j] = t;
            }
        }
        int t = a[i + 1]; a[i + 1] = a[high]; a[high] = t;
        return i + 1;
    }

    public static void main(String[] args) {
        int[] m = {38, 27, 43, 3, 9, 82, 10};
        mergeSort(m, 0, m.length - 1);
        System.out.println("Merge sorted: " + Arrays.toString(m));

        int[] q = {10, 80, 30, 90, 40, 50, 70};
        quickSort(q, 0, q.length - 1);
        System.out.println("Quick sorted: " + Arrays.toString(q));
    }
}`;

export default {
  id: 'day-12-algorithms-big-o-searching-sorting',
  title: 'Algorithms in Java: Big-O, Recursion, Searching and Sorting with Dry Runs',
  module: 'Module 3: Data Structures & Algorithms in Java',
  day: 12,
  level: 'Intermediate',
  duration: '3 hours',
  summary: 'Learn to measure algorithms with Big-O, think recursively, and implement linear/binary search plus bubble, selection, insertion, merge and quick sort — each with a printed dry run so you can see every step.',
  objectives: [
    'Explain Big-O time and space complexity with simple examples',
    'Write recursive methods with a correct base case and trace the call stack',
    'Implement linear and binary search (iterative and recursive)',
    'Implement and dry-run bubble, selection and insertion sort',
    'Implement merge sort and quick sort and compare their complexities',
  ],
  theory: [
    {
      heading: 'What is an Algorithm and Big-O Notation',
      content: 'An algorithm is a step-by-step recipe to solve a problem. Many recipes give the same dish, but some are faster. Big-O describes how the number of steps grows when input size n grows, ignoring constants. Analogy: finding a friend\'s name in a 1000-page phone book — reading every page is O(n), opening the middle and halving each time is O(log n) (about 10 steps for 1000 pages).',
      syntax: `O(1)        constant      arr[5], HashMap.get
O(log n)    logarithmic   binary search
O(n)        linear        one loop, linear search
O(n log n)  linearithmic  merge sort, quick sort (average), Arrays.sort
O(n^2)      quadratic     nested loops, bubble/selection/insertion sort
O(2^n)      exponential   naive recursive fibonacci`,
      points: [
        'Drop constants: O(2n) becomes O(n); O(n + 100) becomes O(n)',
        'Keep the biggest term: O(n^2 + n) becomes O(n^2)',
        'Best, average and worst case can differ (quick sort: O(n log n) average, O(n^2) worst)',
        'Space complexity = extra memory used (merge sort needs O(n) extra; quick sort O(log n) stack)',
        'For n = 1,00,000: O(n^2) = 10^10 steps (too slow), O(n log n) ~ 17 lakh steps (fast)',
      ],
      tip: 'Rule of thumb in coding tests: about 10^8 simple operations take ~1 second. Use it to decide if your approach will pass.',
    },
    {
      heading: 'Recursion: A Method that Calls Itself',
      content: 'Recursion solves a problem by solving a smaller copy of the same problem. Think of standing in a long queue and asking "what is my position?" — you ask the person in front, who asks the person in front of them, until the first person says "1" (base case). Then answers flow back: 2, 3, 4... Every recursive call is pushed onto the call stack; when a base case is reached, calls return one by one.',
      syntax: `returnType solve(n) {
    if (base condition) return simple answer;   // STOP condition
    return combine(n, solve(smaller n));        // move towards base case
}`,
      points: [
        'Missing or wrong base case -> StackOverflowError',
        'Each call uses stack memory, so recursion depth n uses O(n) space',
        'Tail recursion is NOT optimised by Java, so very deep recursion should be converted to a loop',
        'Classic examples: factorial, power, fibonacci, sum of digits, reverse string, Tower of Hanoi, tree traversal',
        'Tower of Hanoi with n disks needs 2^n - 1 moves',
      ],
    },
    {
      heading: 'Searching: Linear vs Binary Search',
      content: 'Linear search checks every element one by one — works on any array, O(n). Binary search works only on SORTED arrays: look at the middle; if the target is bigger, throw away the left half, else throw away the right half. Each step halves the search space, so 1 million elements need only about 20 comparisons.',
      syntax: `int mid = low + (high - low) / 2;   // safer than (low + high) / 2 which can overflow
if (a[mid] == target) return mid;
else if (a[mid] < target) low = mid + 1;
else high = mid - 1;`,
      points: [
        'Linear search: O(n), no sorting needed',
        'Binary search: O(log n), needs sorted data; loop condition is low <= high',
        'Java built-ins: Arrays.binarySearch(arr, key), Collections.binarySearch(list, key)',
        'Common bug: writing low = mid instead of low = mid + 1 causes an infinite loop',
      ],
    },
    {
      heading: 'Simple Sorts: Bubble, Selection, Insertion (O(n^2))',
      content: 'These are easy to write and asked often in interviews. Bubble sort repeatedly swaps adjacent elements that are in the wrong order, so the biggest element "bubbles" to the end in each pass. Selection sort finds the minimum of the unsorted part and puts it at the front — like picking the shortest student and making him stand first. Insertion sort picks the next card and inserts it into the correct place among already sorted cards — exactly how you arrange playing cards in your hand.',
      points: [
        'Bubble: O(n^2) worst; O(n) best with the "swapped" flag on already sorted input; stable',
        'Selection: always O(n^2) comparisons but at most n-1 swaps; NOT stable',
        'Insertion: O(n^2) worst, O(n) best; very fast for small or nearly-sorted data; stable',
        'All three sort in place: O(1) extra space',
        'Stable sort = equal elements keep their original relative order',
      ],
      tip: 'Java\'s Arrays.sort for objects (TimSort) uses insertion sort internally for small runs because it is fast on small data.',
    },
    {
      heading: 'Merge Sort: Divide and Conquer',
      content: 'Merge sort splits the array into two halves, sorts each half recursively, and then merges the two sorted halves — like two teachers each sorting half the answer sheets by roll number, and then combining them by always picking the smaller roll number from the top of the two piles.',
      syntax: `mergeSort(a, l, r):
    if l >= r: return
    mid = (l + r) / 2
    mergeSort(a, l, mid); mergeSort(a, mid+1, r)
    merge(a, l, mid, r)`,
      points: [
        'Time: O(n log n) in best, average and worst case — guaranteed',
        'Space: O(n) extra for the temp array',
        'Stable — used for sorting objects (TimSort is merge-sort based)',
        'Good for linked lists and external sorting of huge files',
      ],
    },
    {
      heading: 'Quick Sort: Partition Around a Pivot',
      content: 'Quick sort chooses a pivot, then partitions the array so all smaller elements come before the pivot and bigger ones after it. The pivot is now in its final place. Then it recursively sorts the left and right parts. Analogy: a PT teacher picks one student\'s height as reference and says "shorter ones to the left, taller ones to the right", then repeats in each group.',
      points: [
        'Average time O(n log n); worst O(n^2) when the pivot is always the smallest/largest (e.g. sorted input with last-element pivot)',
        'In place: only O(log n) stack space on average',
        'Not stable',
        'Random pivot or median-of-three avoids the worst case',
        'Arrays.sort for primitives uses Dual-Pivot Quicksort',
      ],
      tip: 'Interview line: "Merge sort guarantees O(n log n) but needs extra memory; quick sort is usually faster in practice and in-place, but has an O(n^2) worst case."',
    },
  ],
  examples: [
    {
      title: 'Counting Steps to Feel Big-O',
      scenario: 'Instead of memorising Big-O, count how many times each kind of loop runs for n = 8 and n = 1024.',
      steps: [
        'In IntelliJ: create a new Java project and a class Main',
        'Type the loops: single loop, doubling loop, nested loops',
        'Run and compare how fast each count grows when n grows 128 times',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `n=8: O(1)=1, O(log n)=3, O(n)=8, O(n log n)=24, O(n^2)=64
n=1024: O(1)=1, O(log n)=10, O(n)=1024, O(n log n)=10240, O(n^2)=1048576`,
      explanation: 'The doubling loop runs for i = 1, 2, 4 when n = 8 (3 times) and for i = 1, 2, 4 ... 512 when n = 1024 (10 times) — that is log2(n). The nested loops multiply: 8 x 3 = 24 and 1024 x 10 = 10240. When n grows 128 times, O(n^2) grows 16384 times (64 to 10,48,576) — that is why nested loops become slow for big input.',
    },
    {
      title: 'Recursion: factorial, power, digits, reverse, Tower of Hanoi',
      scenario: 'Practise the five most common recursion programs and watch Tower of Hanoi print every move.',
      steps: [
        'Create Main.java and write each recursive method with its base case first',
        'Run the program',
        'Dry-run hanoi(3) on paper: it first moves 2 disks from A to B, then disk 3 to C, then 2 disks from B to C',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `5! = 120
2^10 = 1024
Sum of digits of 4567 = 22
Reverse of java = avaj
Tower of Hanoi with 3 disks:
Move disk 1 from A to C
Move disk 2 from A to B
Move disk 1 from C to B
Move disk 3 from A to C
Move disk 1 from B to A
Move disk 2 from B to C
Move disk 1 from A to C
Total moves = 7`,
      explanation: 'factorial(5) = 5*4*3*2*1 = 120. sumOfDigits(4567) = 7 + 6 + 5 + 4 = 22. reverse("java") = reverse("ava") + "j" = ... = "avaj". hanoi(3) needs 2^3 - 1 = 7 moves: hanoi(2, A->B) gives 3 moves, then disk 3 A->C, then hanoi(2, B->C) gives 3 more moves.',
    },
    {
      title: 'Linear vs Binary Search with a Step-by-Step Trace',
      scenario: 'Search a sorted array of 10 values and print every binary search step to see the halving.',
      steps: [
        'Create Main.java with linearSearch, binarySearch (with prints) and binaryRecursive',
        'Make sure the array is sorted before binary search',
        'Run and compare comparison counts',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Linear: found 66 at index 7 after 8 comparisons
Linear: 10 not found after 10 comparisons
  step 1: low=0 high=9 mid=4 a[mid]=34
  step 2: low=5 high=9 mid=7 a[mid]=66
Binary: found 66 at index 7 in 2 steps
  step 1: low=0 high=9 mid=4 a[mid]=34
  step 2: low=0 high=3 mid=1 a[mid]=8
  step 3: low=2 high=3 mid=2 a[mid]=15
Binary: 10 not found in 3 steps
Recursive binary search for 90: index 9`,
      explanation: 'For 66: mid = 4 (34 < 66) so low = 5; mid = 5 + 4/2 = 7 which is 66. For 10: 34 > 10 so high = 3; mid = 1 (8 < 10) so low = 2; mid = 2 (15 > 10) so high = 1; now low (2) > high (1), loop ends: not found. Linear search needed 8 and 10 comparisons. Recursive search for 90 checks mid 4, 7, 8 and then 9.',
    },
    {
      title: 'Bubble, Selection and Insertion Sort — Pass by Pass',
      scenario: 'Print the array after every pass so you can verify your own dry run.',
      steps: [
        'Create Main.java with the three sort methods',
        'Each method prints the array after each outer loop iteration',
        'Before running, dry-run each sort on paper, then run and compare',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Bubble pass 1: [1, 4, 2, 5, 8]
Bubble pass 2: [1, 2, 4, 5, 8]
Bubble pass 3: [1, 2, 4, 5, 8]
No swaps in this pass, stop early
Selection pass 1: [11, 25, 12, 22, 64]
Selection pass 2: [11, 12, 25, 22, 64]
Selection pass 3: [11, 12, 22, 25, 64]
Selection pass 4: [11, 12, 22, 25, 64]
Insertion i=1 (key=5): [5, 9, 1, 4, 3]
Insertion i=2 (key=1): [1, 5, 9, 4, 3]
Insertion i=3 (key=4): [1, 4, 5, 9, 3]
Insertion i=4 (key=3): [1, 3, 4, 5, 9]`,
      explanation: 'Bubble pass 1 swaps 5-1, 5-4, 5-2 so 8 and 5 settle at the end; pass 2 swaps 4-2; pass 3 makes no swap, so the loop stops early (best-case optimisation). Selection pass 1 swaps the minimum 11 with 64; pass 2 puts 12 at index 1; pass 3 puts 22 at index 2; pass 4 finds 25 already in place. Insertion sort shifts bigger elements right and drops the key into the gap, e.g. key 3 shifts 9, 5, 4 and lands after 1.',
    },
    {
      title: 'Merge Sort and Quick Sort with Printed Steps',
      scenario: 'See the divide-and-conquer sorts in action: every merge and every pivot placement is printed.',
      steps: [
        'Create Main.java with mergeSort/merge and quickSort/partition',
        'Run the program',
        'Draw the merge sort recursion tree: [38,27,43,3] and [9,82,10], then smaller halves',
        'For quick sort, after each partition check that everything left of the pivot is smaller and right is bigger',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Merged: [27, 38]
Merged: [3, 43]
Merged: [3, 27, 38, 43]
Merged: [9, 82]
Merged: [9, 10, 82]
Merged: [3, 9, 10, 27, 38, 43, 82]
Merge sorted: [3, 9, 10, 27, 38, 43, 82]
Pivot 70 -> index 4: [10, 30, 40, 50, 70, 90, 80]
Pivot 50 -> index 3: [10, 30, 40, 50, 70, 90, 80]
Pivot 40 -> index 2: [10, 30, 40, 50, 70, 90, 80]
Pivot 30 -> index 1: [10, 30, 40, 50, 70, 90, 80]
Pivot 80 -> index 5: [10, 30, 40, 50, 70, 80, 90]
Quick sorted: [10, 30, 40, 50, 70, 80, 90]`,
      explanation: 'Merge sort first finishes the left half [38, 27, 43, 3] (merging pairs, then the two pairs), then the right half [9, 82, 10], and finally merges both halves. In quick sort, pivot 70 moves 10, 30, 40, 50 to the left and lands at index 4. The left part [10,30,40,50] is already ordered, so pivots 50, 40, 30 each stay in place — this shows why sorted input is the worst case for a last-element pivot. Finally pivot 80 swaps with 90.',
    },
  ],
  interview: [
    { q: 'What is Big-O notation?', a: 'It describes the upper bound of how running time (or memory) grows as input size n grows, ignoring constants and smaller terms. Example: a single loop is O(n), two nested loops O(n^2), binary search O(log n).', level: 'Easy' },
    { q: 'What is the time complexity of this code: for (i = 1; i < n; i = i * 2) { for (j = 0; j < n; j++) {...} }?', a: 'Outer loop runs log n times, inner loop n times, so total O(n log n).', level: 'Medium' },
    { q: 'What is recursion? What happens if there is no base case?', a: 'A method calling itself on a smaller input. Each call is added to the call stack. Without a base case the calls never stop and the JVM throws java.lang.StackOverflowError.', level: 'Easy' },
    { q: 'Why is binary search O(log n) and what is its precondition?', a: 'Each comparison halves the search space: n, n/2, n/4 ... 1, which takes log2(n) steps. The array must be sorted.', level: 'Easy' },
    { q: 'Why write mid = low + (high - low) / 2 instead of (low + high) / 2?', a: 'If low and high are both large (close to Integer.MAX_VALUE), low + high overflows into a negative number. low + (high - low) / 2 never overflows.', level: 'Medium' },
    { q: 'Compare bubble, selection and insertion sort.', a: 'All are O(n^2) worst case and in-place. Bubble and insertion are stable and O(n) best case on sorted data (with optimisation). Selection is not stable, always O(n^2) comparisons but does at most n-1 swaps. Insertion sort is best for small or nearly sorted arrays.', level: 'Medium' },
    { q: 'Merge sort vs quick sort?', a: 'Merge sort: always O(n log n), stable, needs O(n) extra memory. Quick sort: O(n log n) average, O(n^2) worst (bad pivot), in-place with O(log n) stack, not stable, usually faster in practice due to cache friendliness.', level: 'Medium' },
    { q: 'What is a stable sort? Why does it matter?', a: 'A stable sort keeps equal elements in their original relative order. Example: sort employees by name, then stably by department — employees within a department stay sorted by name. Merge sort, insertion sort and TimSort are stable; quick sort and selection sort are not.', level: 'Medium' },
    { q: 'Which algorithms does Java use in Arrays.sort?', a: 'For primitive arrays: Dual-Pivot Quicksort. For object arrays and Collections.sort: TimSort (hybrid of merge sort and insertion sort), which is stable and O(n log n).', level: 'Hard' },
    { q: 'What is the output of factorial(0) with if (n <= 1) return 1; and how many calls does factorial(5) make?', a: 'factorial(0) returns 1. factorial(5) makes 5 calls: f(5), f(4), f(3), f(2), f(1) — f(1) hits the base case.', level: 'Easy' },
  ],
  practice: [
    {
      task: 'Write a recursive method to check if a string is a palindrome, and a recursive method to find the GCD of two numbers. Test with "madam", "hello", gcd(48, 18).',
      hint: 'Palindrome: compare first and last chars, then recurse on substring(1, len-1). GCD: gcd(a, b) = gcd(b, a % b), gcd(a, 0) = a.',
      solution: `public class Main {
    static boolean isPalindrome(String s) {
        if (s.length() <= 1) return true;
        if (s.charAt(0) != s.charAt(s.length() - 1)) return false;
        return isPalindrome(s.substring(1, s.length() - 1));
    }

    static int gcd(int a, int b) {
        if (b == 0) return a;
        return gcd(b, a % b);
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("madam"));  // true
        System.out.println(isPalindrome("hello"));  // false
        System.out.println(gcd(48, 18));            // 6
    }
}`,
    },
    {
      task: 'Using binary search, find the FIRST and LAST occurrence of a number in a sorted array with duplicates: {1, 2, 2, 2, 3, 5}, target 2.',
      hint: 'When a[mid] == target, store mid and keep searching left (for first) or right (for last).',
      solution: `public class Main {
    static int first(int[] a, int t) {
        int low = 0, high = a.length - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (a[mid] == t) { ans = mid; high = mid - 1; }
            else if (a[mid] < t) low = mid + 1;
            else high = mid - 1;
        }
        return ans;
    }

    static int last(int[] a, int t) {
        int low = 0, high = a.length - 1, ans = -1;
        while (low <= high) {
            int mid = low + (high - low) / 2;
            if (a[mid] == t) { ans = mid; low = mid + 1; }
            else if (a[mid] < t) low = mid + 1;
            else high = mid - 1;
        }
        return ans;
    }

    public static void main(String[] args) {
        int[] a = {1, 2, 2, 2, 3, 5};
        System.out.println("First: " + first(a, 2));   // 1
        System.out.println("Last: " + last(a, 2));     // 3
        System.out.println("Count: " + (last(a, 2) - first(a, 2) + 1));  // 3
    }
}`,
    },
    {
      task: 'Sort an array of Student objects (name, marks) by marks descending using your own insertion sort, then print them.',
      hint: 'Compare s[j].marks < key.marks to shift for descending order.',
      solution: `public class Main {
    record Student(String name, int marks) {}

    static void sortByMarksDesc(Student[] s) {
        for (int i = 1; i < s.length; i++) {
            Student key = s[i];
            int j = i - 1;
            while (j >= 0 && s[j].marks() < key.marks()) {
                s[j + 1] = s[j];
                j--;
            }
            s[j + 1] = key;
        }
    }

    public static void main(String[] args) {
        Student[] arr = {
            new Student("Asha", 78), new Student("Ravi", 92),
            new Student("Neha", 85), new Student("Kiran", 60)
        };
        sortByMarksDesc(arr);
        for (Student s : arr) System.out.println(s.name() + " " + s.marks());
        // Ravi 92, Neha 85, Asha 78, Kiran 60
    }
}`,
    },
    {
      task: 'Count the number of inversions in an array (pairs i < j with a[i] > a[j]) using merge sort in O(n log n). Test {2, 4, 1, 3, 5} (answer 3).',
      hint: 'While merging, when a[j] (right half) is smaller than a[i] (left half), all remaining left elements (mid - i + 1) form inversions with a[j].',
      solution: `public class Main {
    static long countAndSort(int[] a, int l, int r) {
        if (l >= r) return 0;
        int mid = (l + r) / 2;
        long count = countAndSort(a, l, mid) + countAndSort(a, mid + 1, r);
        int[] temp = new int[r - l + 1];
        int i = l, j = mid + 1, k = 0;
        while (i <= mid && j <= r) {
            if (a[i] <= a[j]) temp[k++] = a[i++];
            else { count += mid - i + 1; temp[k++] = a[j++]; }
        }
        while (i <= mid) temp[k++] = a[i++];
        while (j <= r) temp[k++] = a[j++];
        System.arraycopy(temp, 0, a, l, temp.length);
        return count;
    }

    public static void main(String[] args) {
        int[] a = {2, 4, 1, 3, 5};
        System.out.println("Inversions: " + countAndSort(a, 0, a.length - 1));  // 3
    }
}`,
    },
    {
      task: 'Modify quick sort to use a RANDOM pivot (swap a random element with the last before partitioning) and sort {5, 4, 3, 2, 1}.',
      hint: 'int r = low + random.nextInt(high - low + 1); swap a[r] and a[high]; then call the normal Lomuto partition.',
      solution: `import java.util.Arrays;
import java.util.Random;

public class Main {
    static Random random = new Random();

    static void quickSort(int[] a, int low, int high) {
        if (low >= high) return;
        int r = low + random.nextInt(high - low + 1);
        int t = a[r]; a[r] = a[high]; a[high] = t;     // random pivot moved to end
        int p = partition(a, low, high);
        quickSort(a, low, p - 1);
        quickSort(a, p + 1, high);
    }

    static int partition(int[] a, int low, int high) {
        int pivot = a[high], i = low - 1;
        for (int j = low; j < high; j++) {
            if (a[j] < pivot) { i++; int t = a[i]; a[i] = a[j]; a[j] = t; }
        }
        int t = a[i + 1]; a[i + 1] = a[high]; a[high] = t;
        return i + 1;
    }

    public static void main(String[] args) {
        int[] a = {5, 4, 3, 2, 1};
        quickSort(a, 0, a.length - 1);
        System.out.println(Arrays.toString(a));   // [1, 2, 3, 4, 5]
    }
}`,
    },
  ],
  quiz: [
    {
      question: 'What is the worst-case time complexity of quick sort?',
      options: ['O(n log n)', 'O(n^2)', 'O(n)', 'O(log n)'],
      answer: 1,
      explanation: 'When the pivot is always the smallest or largest element (e.g. sorted input with last-element pivot), partitions are of size n-1 and 0, giving O(n^2).',
    },
    {
      question: 'Binary search on a sorted array of 1,024 elements needs at most about how many comparisons?',
      options: ['1024', '512', '100', '11'],
      answer: 3,
      explanation: 'log2(1024) = 10, so at most about 10-11 comparisons.',
    },
    {
      question: 'Which sorting algorithm always takes O(n log n) time but needs O(n) extra space?',
      options: ['Merge sort', 'Quick sort', 'Insertion sort', 'Selection sort'],
      answer: 0,
      explanation: 'Merge sort guarantees O(n log n) in all cases and uses a temporary array for merging.',
    },
    {
      question: 'What happens when a recursive method has no reachable base case?',
      options: ['It returns 0', 'Compilation error', 'StackOverflowError at runtime', 'OutOfMemoryError at compile time'],
      answer: 2,
      explanation: 'Calls keep piling up on the thread stack until it is full, and the JVM throws StackOverflowError.',
    },
    {
      question: 'Which simple sort is best for an array that is already almost sorted?',
      options: ['Selection sort', 'Insertion sort', 'Quick sort with first-element pivot', 'None, all are equal'],
      answer: 1,
      explanation: 'Insertion sort does very few shifts on nearly sorted data and approaches O(n).',
    },
  ],
};
