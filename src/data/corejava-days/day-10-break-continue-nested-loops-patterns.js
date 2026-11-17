const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        int[] nums = {12, 25, 49, 70, 14};
        for (int i = 0; i < nums.length; i++) {
            if (nums[i] % 7 == 0) {
                System.out.println("First multiple of 7: " + nums[i] + " at index " + i);
                break;                       // exit the loop immediately
            }
            System.out.println("Checked " + nums[i]);
        }

        System.out.print("Odd numbers:");
        for (int i = 1; i <= 10; i++) {
            if (i % 2 == 0) {
                continue;                    // skip the rest of this iteration
            }
            System.out.print(" " + i);
        }
        System.out.println();
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        int target = 12;
        boolean found = false;

        search:
        for (int i = 1; i <= 5; i++) {
            for (int k = 1; k <= 5; k++) {
                if (i * k == target) {
                    System.out.println("First pair with product " + target + ": " + i + " x " + k);
                    found = true;
                    break search;            // leaves BOTH loops
                }
            }
        }
        if (!found) {
            System.out.println("No pair found");
        }

        outer:
        for (int i = 1; i <= 3; i++) {
            for (int k = 1; k <= 3; k++) {
                if (k == 2) {
                    continue outer;          // jump to next i
                }
                System.out.println("i = " + i + ", k = " + k);
            }
        }
    }
}`;

const ex3 = j`public class Main {
    public static void main(String[] args) {
        int n = 4;

        System.out.println("Right triangle:");
        for (int i = 1; i <= n; i++) {
            for (int k = 1; k <= i; k++) {
                System.out.print("*");
            }
            System.out.println();
        }

        System.out.println("Inverted:");
        for (int i = n; i >= 1; i--) {
            for (int k = 1; k <= i; k++) {
                System.out.print("*");
            }
            System.out.println();
        }

        System.out.println("Numbers:");
        for (int i = 1; i <= n; i++) {
            for (int k = 1; k <= i; k++) {
                System.out.print(k);
            }
            System.out.println();
        }

        System.out.println("Letters:");
        for (int i = 1; i <= n; i++) {
            for (char c = 'A'; c < 'A' + i; c++) {
                System.out.print(c);
            }
            System.out.println();
        }
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        int n = 4;
        System.out.println("Pyramid:");
        for (int i = 1; i <= n; i++) {
            for (int s = 1; s <= n - i; s++) {
                System.out.print(" ");
            }
            for (int k = 1; k <= 2 * i - 1; k++) {
                System.out.print("*");
            }
            System.out.println();
        }

        System.out.println("Floyd's triangle:");
        int num = 1;
        for (int i = 1; i <= n; i++) {
            for (int k = 1; k <= i; k++) {
                System.out.print(num);
                if (k < i) {
                    System.out.print(" ");
                }
                num++;
            }
            System.out.println();
        }
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        int limit = 30;
        int count = 0;
        System.out.print("Primes up to " + limit + ":");

        for (int n = 2; n <= limit; n++) {
            boolean isPrime = true;
            for (int d = 2; d * d <= n; d++) {
                if (n % d == 0) {
                    isPrime = false;
                    break;               // no need to check more divisors
                }
            }
            if (!isPrime) {
                continue;                // skip printing non-primes
            }
            System.out.print(" " + n);
            count++;
        }
        System.out.println();
        System.out.println("Count: " + count);
    }
}`;

export default {
  id: 'day-10-break-continue-nested-loops-patterns',
  title: 'break, continue, Nested Loops and Pattern Programs',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 10,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Control loops precisely with break, continue and labels, understand how nested loops work row by column, and build the star, number and letter pattern programs that appear in almost every fresher interview.',
  objectives: [
    'Use break to exit a loop and continue to skip an iteration',
    'Use labelled break and continue to control outer loops',
    'Trace nested loops using the rows (outer) and columns (inner) idea',
    'Build triangle, inverted, pyramid, number, letter and Floyd patterns',
    'Write an efficient prime-number checker using nested loops and break',
  ],
  theory: [
    {
      heading: 'The break Statement',
      content: j`break immediately terminates the nearest enclosing loop (or switch). Control jumps to the first statement after that loop.

Analogy: you are searching for your keys in 10 drawers. As soon as you find them in drawer 3, you stop searching - you do not open drawers 4 to 10. That is break.

for (int i = 1; i <= 10; i++) {
    if (i == 4) break;
    System.out.print(i + " ");   // prints 1 2 3
}

Uses: stop searching once found, exit infinite loops (while (true)), stop when invalid input arrives.`,
    },
    {
      heading: 'The continue Statement',
      content: j`continue skips the REST of the current iteration and moves to the next one. In a for loop, the update (i++) still runs; in a while loop, control goes straight to the condition (so make sure the update happens before continue!).

Analogy: checking exam papers - if a paper is blank, you skip it and continue to the next one, but you do not stop checking.

for (int i = 1; i <= 5; i++) {
    if (i == 3) continue;
    System.out.print(i + " ");   // prints 1 2 4 5
}

Trap in while:
int i = 0;
while (i < 5) {
    if (i == 2) continue;   // i never changes -> infinite loop!
    i++;
}`,
    },
    {
      heading: 'Labelled break and continue',
      content: j`A plain break/continue only affects the innermost loop. To control an outer loop, put a label (any identifier followed by a colon) before it:

outer:
for (...) {
    for (...) {
        if (found) break outer;      // exits both loops
        if (skip)  continue outer;   // goes to next outer iteration
    }
}

Labels are rarely needed, but they are useful for searching in grids and are a common interview question. Java has no goto; labelled break is the structured alternative.`,
    },
    {
      heading: 'Nested Loops',
      content: j`A loop inside another loop. For every single iteration of the outer loop, the inner loop runs completely.

Analogy: a clock. The minute hand (inner loop) goes round 60 times for every 1 movement of the hour hand (outer loop).

for (int i = 1; i <= 3; i++) {          // outer: rows
    for (int k = 1; k <= 2; k++) {      // inner: columns
        System.out.print("(" + i + "," + k + ")");
    }
    System.out.println();
}
Output:
(1,1)(1,2)
(2,1)(2,2)
(3,1)(3,2)

Total inner iterations = outer count x inner count = 3 x 2 = 6.

Golden rule for patterns: outer loop = number of ROWS (lines), inner loop(s) = what to print in each row (COLUMNS). println() after the inner loop moves to the next row.`,
    },
    {
      heading: 'How to Solve Any Pattern Program',
      content: j`Follow these four steps:
1. Count the rows -> outer loop from 1 to n.
2. For row i, find how many spaces and how many symbols appear. Write a small table:

   Pyramid n=4        row i | spaces | stars
      *                 1   |   3    |   1
     ***                2   |   2    |   3
    *****               3   |   1    |   5
   *******              4   |   0    |   7

   spaces = n - i, stars = 2*i - 1
3. Write one inner loop for spaces and one for stars.
4. println() at the end of every row.

Common formulas:
- Right triangle: stars = i
- Inverted triangle: stars = n - i + 1 (or loop i from n down to 1)
- Pyramid: spaces = n - i, stars = 2i - 1
- Number triangle: print k (column) or i (row)
- Floyd's triangle: a counter that keeps increasing across rows`,
      tip: 'Before coding, always draw the pattern in a grid with row numbers. The formula becomes obvious.',
    },
  ],
  examples: [
    {
      title: 'break and continue basics',
      scenario: 'Stop scanning an array at the first multiple of 7, and print only odd numbers from 1 to 10.',
      steps: [
        'Create class Main in Eclipse/IntelliJ and type the code',
        'Predict which "Checked" lines appear before running',
        'Run and verify',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `Checked 12
Checked 25
First multiple of 7: 49 at index 2
Odd numbers: 1 3 5 7 9`,
      explanation: '12 and 25 are not multiples of 7, so "Checked" prints for them. 49 % 7 == 0, so it prints and break exits; 70 and 14 are never checked. In the second loop continue skips even numbers, so only odd numbers are printed.',
    },
    {
      title: 'Labelled break and continue',
      scenario: 'Find the first pair (i, k) from 1..5 whose product is 12 and stop both loops; then skip to the next outer iteration with continue outer.',
      steps: [
        'Write the label search: just before the outer loop',
        'Use break search; inside the inner loop',
        'Write the second nested loop with continue outer and run',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `First pair with product 12: 3 x 4
i = 1, k = 1
i = 2, k = 1
i = 3, k = 1`,
      explanation: 'For i = 1 and i = 2 no k in 1..5 gives 12. For i = 3, k = 4 gives 12; break search exits both loops. In the second part, whenever k reaches 2, continue outer jumps to the next i, so only k = 1 is printed for each i.',
    },
    {
      title: 'Triangle, inverted, number and letter patterns',
      scenario: 'Print four basic patterns with n = 4 rows.',
      steps: [
        'Outer loop controls rows; inner loop prints the content of each row',
        'Call println() after each inner loop',
        'Run and match each pattern with its formula',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 } },
      result: `Right triangle:
*
**
***
****
Inverted:
****
***
**
*
Numbers:
1
12
123
1234
Letters:
A
AB
ABC
ABCD`,
      explanation: 'Right triangle prints i stars in row i. Inverted runs i from 4 down to 1. Number triangle prints the column number k from 1 to i. Letter triangle starts at \'A\' and prints i letters by incrementing the char.',
    },
    {
      title: 'Pyramid and Floyd\'s triangle',
      scenario: 'Print a centred star pyramid and Floyd\'s triangle of consecutive numbers.',
      steps: [
        'Use one inner loop for spaces (n - i) and another for stars (2*i - 1)',
        'For Floyd\'s triangle, keep a counter outside the loops',
        'Run and compare row by row with the table in theory',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Pyramid:
   *
  ***
 *****
*******
Floyd's triangle:
1
2 3
4 5 6
7 8 9 10`,
      explanation: 'Row 1 has 3 spaces + 1 star, row 4 has 0 spaces + 7 stars. In Floyd\'s triangle num keeps increasing across rows; a space is printed only between numbers (k < i), so there is no trailing space.',
    },
    {
      title: 'Prime numbers using nested loops, break and continue',
      scenario: 'Print all primes up to 30 efficiently.',
      steps: [
        'Outer loop picks each number n from 2 to 30',
        'Inner loop tests divisors only while d * d <= n and breaks on the first divisor',
        'continue skips non-primes; run and count',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Primes up to 30: 2 3 5 7 11 13 17 19 23 29
Count: 10`,
      explanation: 'A number is prime if no d from 2 to sqrt(n) divides it. For 2 and 3 the inner loop does not even run (2*2 > 3), so they stay prime. break stops checking as soon as a divisor is found, which saves time. There are 10 primes up to 30.',
    },
  ],
  interview: [
    { q: 'Difference between break and continue?', a: 'break exits the loop completely. continue skips the remaining statements of the current iteration and proceeds with the next iteration.', level: 'Easy' },
    { q: 'What is a labelled break?', a: 'A break followed by a label name (break outer;) that exits the labelled outer loop, not just the innermost one.', level: 'Medium' },
    { q: 'Can break be used outside a loop or switch?', a: 'An unlabelled break cannot; it is a compile error. A labelled break can exit any labelled block.', level: 'Hard' },
    { q: 'What is the output: for (int i = 1; i <= 5; i++) { if (i == 3) break; System.out.print(i); }', a: '12', level: 'Easy' },
    { q: 'What is the output: for (int i = 1; i <= 5; i++) { if (i == 3) continue; System.out.print(i); }', a: '1245', level: 'Easy' },
    { q: 'How many times does the inner statement run? for (i = 0; i < 4; i++) for (k = 0; k < 3; k++) x++;', a: '12 times (4 x 3).', level: 'Easy' },
    { q: 'How many times does the inner statement run? for (i = 1; i <= 4; i++) for (k = 1; k <= i; k++) x++;', a: '10 times: 1 + 2 + 3 + 4.', level: 'Medium' },
    { q: 'Why does a prime check loop only need to go up to the square root of n?', a: 'If n = a * b and both a and b were greater than sqrt(n), their product would exceed n. So at least one factor is <= sqrt(n).', level: 'Medium' },
    { q: 'What is the danger of continue in a while loop?', a: 'If the update statement comes after continue, it is skipped and the loop may become infinite.', level: 'Medium' },
    { q: 'What is the time complexity of nested loops each running n times?', a: 'O(n^2).', level: 'Medium' },
    { q: 'Write the formula for stars and spaces in a pyramid of n rows.', a: 'For row i: spaces = n - i, stars = 2 * i - 1.', level: 'Medium' },
  ],
  practice: [
    {
      task: 'Print a hollow square of stars of size 5.',
      hint: 'Print * on the first/last row and first/last column, otherwise a space.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int n = 5;
        for (int i = 1; i <= n; i++) {
            for (int k = 1; k <= n; k++) {
                if (i == 1 || i == n || k == 1 || k == n) {
                    System.out.print("*");
                } else {
                    System.out.print(" ");
                }
            }
            System.out.println();
        }
    }
}`,
    },
    {
      task: 'Print a diamond pattern with 4 rows in the upper half.',
      hint: 'Upper pyramid for i = 1..n, then lower pyramid for i = n-1 down to 1.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int n = 4;
        for (int i = 1; i <= n; i++) {
            for (int s = 1; s <= n - i; s++) System.out.print(" ");
            for (int k = 1; k <= 2 * i - 1; k++) System.out.print("*");
            System.out.println();
        }
        for (int i = n - 1; i >= 1; i--) {
            for (int s = 1; s <= n - i; s++) System.out.print(" ");
            for (int k = 1; k <= 2 * i - 1; k++) System.out.print("*");
            System.out.println();
        }
    }
}`,
    },
    {
      task: 'Print the multiplication tables from 2 to 4 side by side for 1 to 5 using nested loops.',
      hint: 'Outer loop for the multiplier 1..5, inner loop for tables 2..4, use \\t between columns.',
      solution: j`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            for (int t = 2; t <= 4; t++) {
                System.out.print(t + "x" + i + "=" + (t * i) + "\t");
            }
            System.out.println();
        }
    }
}`,
    },
    {
      task: 'Read numbers until a negative number is entered (use while (true) and break) and print their sum.',
      hint: 'while (true) { n = sc.nextInt(); if (n < 0) break; sum += n; }',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int sum = 0;
        System.out.println("Enter numbers (negative to stop):");
        while (true) {
            int n = sc.nextInt();
            if (n < 0) {
                break;
            }
            sum += n;
        }
        System.out.println("Sum = " + sum);
    }
}`,
    },
    {
      task: 'Print the number pattern where each row repeats its row number: 1 / 22 / 333 / 4444 / 55555.',
      hint: 'Print i (the row) instead of k (the column).',
      solution: j`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 5; i++) {
            for (int k = 1; k <= i; k++) {
                System.out.print(i);
            }
            System.out.println();
        }
    }
}`,
    },
  ],
  quiz: [
    { question: 'What does continue do inside a for loop?', options: ['Exits the loop', 'Skips to the next iteration', 'Restarts the loop from the beginning', 'Exits the method'], answer: 1, explanation: 'continue skips the rest of the current iteration; the update and condition still run.' },
    { question: 'What prints? for (int i = 0; i < 3; i++) for (int k = 0; k < 2; k++) System.out.print("*");', options: ['***', '**', '******', '*****'], answer: 2, explanation: '3 x 2 = 6 stars.' },
    { question: 'In a pyramid of n rows, how many stars are in row i?', options: ['i', 'n - i', '2i + 1', '2i - 1'], answer: 3, explanation: 'Row 1 has 1, row 2 has 3, row 3 has 5: 2i - 1.' },
    { question: 'Which statement exits both loops at once?', options: ['break outer; (with a label on the outer loop)', 'break;', 'continue;', 'exit;'], answer: 0, explanation: 'A labelled break exits the labelled loop.' },
    { question: 'What prints? int i = 0; while (true) { i++; if (i == 4) break; } System.out.println(i);', options: ['3', '4', '5', 'Infinite loop'], answer: 1, explanation: 'i increments to 4, then break exits; i is 4.' },
  ],
};
