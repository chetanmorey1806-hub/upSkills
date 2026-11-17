const j = String.raw;

const ex1 = j`public class Main {
    public static void main(String[] args) {
        int n = 7;
        for (int i = 1; i <= 10; i++) {
            System.out.println(n + " x " + i + " = " + (n * i));
        }
    }
}`;

const ex2 = j`public class Main {
    public static void main(String[] args) {
        int number = 12345;
        int temp = number;
        int reversed = 0;
        int digits = 0;
        int sum = 0;

        while (temp > 0) {
            int last = temp % 10;          // take last digit
            reversed = reversed * 10 + last;
            sum += last;
            digits++;
            temp = temp / 10;              // remove last digit
        }

        System.out.println("Number   : " + number);
        System.out.println("Reversed : " + reversed);
        System.out.println("Digits   : " + digits);
        System.out.println("Sum      : " + sum);
    }
}`;

const ex3 = j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        int i = 10;
        while (i < 5) {
            System.out.println("while body: " + i);   // never runs
            i++;
        }
        do {
            System.out.println("do-while body: " + i); // runs once
            i++;
        } while (i < 5);

        Scanner sc = new Scanner(System.in);
        System.out.println("Enter numbers (0 to stop):");
        int sum = 0;
        int count = 0;
        int n;
        do {
            n = sc.nextInt();
            sum += n;
            if (n != 0) {
                count++;
            }
        } while (n != 0);
        System.out.println("You entered " + count + " numbers. Sum = " + sum);
        sc.close();
    }
}`;

const ex4 = j`public class Main {
    public static void main(String[] args) {
        int[] marks = {78, 92, 65, 88, 71};
        int total = 0;
        int highest = marks[0];

        for (int m : marks) {
            total += m;
            if (m > highest) {
                highest = m;
            }
        }
        double average = (double) total / marks.length;

        System.out.println("Total   : " + total);
        System.out.println("Highest : " + highest);
        System.out.println("Average : " + average);

        String[] fruits = {"Apple", "Mango", "Banana"};
        for (String f : fruits) {
            System.out.println(f + " has " + f.length() + " letters");
        }
    }
}`;

const ex5 = j`public class Main {
    public static void main(String[] args) {
        int terms = 10;
        int a = 0, b = 1;
        System.out.print("Fibonacci: ");
        for (int i = 0; i < terms; i++) {
            System.out.print(a + (i < terms - 1 ? " " : ""));
            int next = a + b;
            a = b;
            b = next;
        }
        System.out.println();

        int num = 5;
        long fact = 1;
        for (int i = num; i >= 1; i--) {
            fact *= i;
        }
        System.out.println(num + "! = " + fact);

        int evenSum = 0;
        for (int i = 2; i <= 20; i += 2) {
            evenSum += i;
        }
        System.out.println("Sum of even numbers 2..20 = " + evenSum);

        for (int x = 1, y = 10; x < y; x += 3, y -= 3) {
            System.out.println("x = " + x + ", y = " + y);
        }
    }
}`;

export default {
  id: 'day-09-loops-for-while-do-while-foreach',
  title: 'Loops: for, while, do-while, for-each',
  module: 'Module 2: Loops, Arrays & Strings',
  day: 9,
  level: 'Beginner',
  duration: '2.5 hours',
  summary: 'Repeat work automatically with loops. Learn the for, while, do-while and enhanced for-each loops, when to use each, and how to trace loop variables step by step to predict output.',
  objectives: [
    'Write for loops with initialisation, condition and update parts',
    'Use while loops for unknown repetition counts such as digit processing',
    'Use do-while when the body must run at least once',
    'Traverse arrays with the enhanced for-each loop',
    'Trace loop execution and avoid infinite loops and off-by-one errors',
  ],
  theory: [
    {
      heading: 'Why Loops?',
      content: j`A loop repeats a block of code while a condition is true. Instead of writing println 100 times, you write it once inside a loop.

Analogy: a loop is like a running track. You keep running laps (iterations) until the coach's condition says stop (for example "10 laps done").

Every loop has 4 parts:
1. Initialisation - where the counter starts (int i = 1)
2. Condition      - checked before each lap (i <= 10)
3. Body           - the work done each lap
4. Update         - move towards the end (i++)

Forgetting the update creates an infinite loop.`,
    },
    {
      heading: 'The for Loop',
      content: j`Best when you know how many times to repeat.

for (initialisation; condition; update) {
    body
}

Execution order:
init -> check condition -> body -> update -> check condition -> body -> update ... -> condition false -> exit

Trace for (int i = 1; i <= 3; i++):
i=1 (1<=3 true) body, i=2 (true) body, i=3 (true) body, i=4 (false) stop. Body ran 3 times.

Variations:
- Counting down: for (int i = 10; i >= 1; i--)
- Step of 2: for (int i = 0; i <= 20; i += 2)
- Multiple variables: for (int i = 0, j = 10; i < j; i++, j--)
- All parts optional: for ( ; ; ) is an infinite loop.
- A variable declared in the for header exists only inside the loop.`,
      syntax: j`for (int i = 1; i <= 5; i++) {
    System.out.println(i);
}`,
    },
    {
      heading: 'The while Loop',
      content: j`Best when you do NOT know in advance how many times to repeat - you only know the stopping condition. It is an entry-controlled loop: the condition is checked BEFORE the body, so the body may run zero times.

while (condition) {
    body
    update
}

Classic use: processing digits of a number.
while (n > 0) {
    int digit = n % 10;   // last digit
    n = n / 10;           // drop last digit
}

Trace for n = 345: digit 5 (n=34), digit 4 (n=3), digit 3 (n=0) -> stop.`,
    },
    {
      heading: 'The do-while Loop',
      content: j`An exit-controlled loop: the body runs FIRST and the condition is checked AFTER. So the body always executes at least once.

do {
    body
} while (condition);     // note the semicolon!

Real-world uses: showing a menu at least once, asking for a password until it is correct, reading numbers until the user enters 0.

while vs do-while:
while                         do-while
checks condition first        runs body first
body may run 0 times          body runs at least once
entry-controlled              exit-controlled
no semicolon after )          semicolon after )`,
    },
    {
      heading: 'Enhanced for Loop (for-each)',
      content: j`Introduced in Java 5 to traverse arrays and collections easily without an index.

for (dataType item : arrayOrCollection) {
    // use item
}

Read it as: "for each item in the array".

Limitations:
- No index available (use a normal for if you need positions).
- Cannot modify the array element itself through the loop variable (item = 0 changes only the copy).
- Always goes forward through every element; cannot skip or go backwards easily.`,
      tip: 'Use for-each whenever you just need to read every element. It is shorter and avoids ArrayIndexOutOfBoundsException.',
    },
    {
      heading: 'Common Loop Mistakes',
      content: j`Beginner bugs to watch for:`,
      points: [
        'Infinite loop: forgetting i++ or updating the wrong variable (while (i < 5) without changing i)',
        'Off-by-one: i <= arr.length instead of i < arr.length -> ArrayIndexOutOfBoundsException',
        'Semicolon after for/while header: for (int i = 0; i < 5; i++); { ... } -> body runs once, loop is empty',
        'Using int for large products like factorial of 20 -> overflow; use long',
        'Modifying the loop counter inside the body makes code hard to follow',
      ],
    },
  ],
  examples: [
    {
      title: 'Multiplication table with a for loop',
      scenario: 'Print the multiplication table of 7 from 1 to 10.',
      steps: [
        'Create class Main in your IDE',
        'Write a for loop from i = 1 to i <= 10',
        'Print n x i = n * i inside the loop and run',
      ],
      code: ex1,
      java: { files: { 'Main.java': ex1 } },
      result: `7 x 1 = 7
7 x 2 = 14
7 x 3 = 21
7 x 4 = 28
7 x 5 = 35
7 x 6 = 42
7 x 7 = 49
7 x 8 = 56
7 x 9 = 63
7 x 10 = 70`,
      explanation: 'The loop runs exactly 10 times (i = 1 to 10). On each iteration the product is computed and printed. When i becomes 11 the condition i <= 10 is false and the loop ends.',
    },
    {
      title: 'Reverse a number, count and sum its digits with while',
      scenario: 'A classic interview program: given 12345, reverse it and also count and add its digits.',
      steps: [
        'Copy the number into temp so the original is preserved',
        'Loop while temp > 0, extracting the last digit with % 10',
        'Run and trace the variables in a table on paper',
      ],
      code: ex2,
      java: { files: { 'Main.java': ex2 } },
      result: `Number   : 12345
Reversed : 54321
Digits   : 5
Sum      : 15`,
      explanation: 'Iterations: last=5 rev=5; last=4 rev=54; last=3 rev=543; last=2 rev=5432; last=1 rev=54321; temp becomes 0 and the loop stops. 5 iterations = 5 digits; 5+4+3+2+1 = 15.',
    },
    {
      title: 'do-while runs at least once',
      scenario: 'Compare while and do-while with a false condition, then keep reading numbers until the user enters 0.',
      steps: [
        'Type the program with both loops',
        'Run; in the console type 5, 8, 12, 0 pressing Enter after each',
        'Observe that the while body never printed',
      ],
      code: ex3,
      java: { files: { 'Main.java': ex3 }, stdin: '5\n8\n12\n0\n' },
      result: `do-while body: 10
Enter numbers (0 to stop):
You entered 3 numbers. Sum = 25`,
      explanation: 'i = 10 so i < 5 is false: the while body is skipped entirely, but the do-while body runs once before checking. Then the do-while reads 5, 8, 12 and 0: sum = 25, and 3 non-zero numbers were counted. The loop exits after reading 0.',
    },
    {
      title: 'for-each over arrays',
      scenario: 'Find the total, highest and average of a student\'s marks and print each fruit name with its length.',
      steps: [
        'Declare an int array and a String array',
        'Use for (int m : marks) to visit each element',
        'Run and check the results',
      ],
      code: ex4,
      java: { files: { 'Main.java': ex4 } },
      result: `Total   : 394
Highest : 92
Average : 78.8
Apple has 5 letters
Mango has 5 letters
Banana has 6 letters`,
      explanation: '78 + 92 + 65 + 88 + 71 = 394. highest starts at 78 and is replaced by 92. 394 / 5.0 = 78.8. The second loop visits each String in order.',
    },
    {
      title: 'Fibonacci, factorial, step loops and two variables',
      scenario: 'Classic loop programs every fresher should know.',
      steps: [
        'Write each loop separately in main',
        'Notice the trick that avoids a trailing space after the last Fibonacci number',
        'Run and trace the last loop with two variables',
      ],
      code: ex5,
      java: { files: { 'Main.java': ex5 } },
      result: `Fibonacci: 0 1 1 2 3 5 8 13 21 34
5! = 120
Sum of even numbers 2..20 = 110
x = 1, y = 10
x = 4, y = 7`,
      explanation: 'Fibonacci: each term is the sum of the previous two. Factorial: 5*4*3*2*1 = 120. Even sum: 2+4+...+20 = 110. Last loop: (1,10) prints, then (4,7) prints, then (7,4): 7 < 4 is false so it stops.',
    },
  ],
  interview: [
    { q: 'Difference between while and do-while?', a: 'while checks the condition before the body (may run 0 times); do-while runs the body first and checks after (runs at least once).', level: 'Easy' },
    { q: 'When do you use for vs while?', a: 'for when the number of iterations is known (counting); while when repetition depends on a condition whose iteration count is unknown (e.g. until input is 0 or digits remain).', level: 'Easy' },
    { q: 'What is the output: for (int i = 0; i < 5; i++); System.out.println("Hi");', a: 'Hi is printed once. The semicolon makes the loop body empty; println is outside the loop.', level: 'Medium' },
    { q: 'What is the output: int i = 0; while (i < 3) { System.out.print(i + " "); i++; }', a: '0 1 2 (each followed by a space).', level: 'Easy' },
    { q: 'How do you write an infinite loop?', a: 'for (;;) { } or while (true) { } or do { } while (true); Exit with break or return.', level: 'Easy' },
    { q: 'Can we modify array elements using a for-each loop?', a: 'Not primitives: the loop variable is a copy. Assigning to it does not change the array. For objects you can change their fields, but not replace the array slot.', level: 'Medium' },
    { q: 'What is the output: int x = 10; do { x++; } while (x < 5); System.out.println(x);', a: '11. The body runs once even though the condition is false.', level: 'Medium' },
    { q: 'How many times does for (int i = 10; i > 0; i -= 3) run?', a: '4 times: i = 10, 7, 4, 1. Next i = -2 fails.', level: 'Medium' },
    { q: 'Is "while (1)" valid in Java?', a: 'No. The condition must be boolean. Use while (true).', level: 'Easy' },
    { q: 'What is the output: for (int i = 1; i <= 5; i++) { if (i % 2 == 0) continue; System.out.print(i); }', a: '135. continue skips the print for even i.', level: 'Medium' },
    { q: 'Is the following code reachable: while (false) { x++; }', a: 'No, it gives a compile error "unreachable statement" because the condition is a constant false. if (false) is allowed though.', level: 'Hard' },
  ],
  practice: [
    {
      task: 'Print all numbers from 1 to 50 that are divisible by both 3 and 5.',
      hint: 'Check i % 3 == 0 && i % 5 == 0.',
      solution: j`public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 50; i++) {
            if (i % 3 == 0 && i % 5 == 0) {
                System.out.println(i);
            }
        }
    }
}`,
    },
    {
      task: 'Check whether a number is a palindrome (e.g. 1221) using a while loop.',
      hint: 'Reverse the number and compare with the original.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int n = 1221, temp = n, rev = 0;
        while (temp > 0) {
            rev = rev * 10 + temp % 10;
            temp /= 10;
        }
        System.out.println(n + (n == rev ? " is" : " is not") + " a palindrome");
    }
}`,
    },
    {
      task: 'Keep asking the user for a PIN until they enter 1234 using do-while, then print "Access granted".',
      hint: 'do { read pin } while (pin != 1234);',
      solution: j`import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int pin;
        do {
            System.out.println("Enter PIN:");
            pin = sc.nextInt();
        } while (pin != 1234);
        System.out.println("Access granted");
    }
}`,
    },
    {
      task: 'Count how many numbers in an array are positive, negative and zero using for-each.',
      hint: 'Use three counters.',
      solution: j`public class Main {
    public static void main(String[] args) {
        int[] nums = {4, -2, 0, 7, -9, 0, 3};
        int pos = 0, neg = 0, zero = 0;
        for (int n : nums) {
            if (n > 0) pos++;
            else if (n < 0) neg++;
            else zero++;
        }
        System.out.println("Positive: " + pos + ", Negative: " + neg + ", Zero: " + zero);
    }
}`,
    },
    {
      task: 'Print the sum of the series 1 + 1/2 + 1/3 + ... + 1/10 rounded to 4 decimals.',
      hint: 'Use 1.0 / i so the division is not integer division.',
      solution: j`public class Main {
    public static void main(String[] args) {
        double sum = 0;
        for (int i = 1; i <= 10; i++) {
            sum += 1.0 / i;
        }
        System.out.printf("Sum = %.4f%n", sum);
    }
}`,
    },
  ],
  quiz: [
    { question: 'Which loop is guaranteed to execute its body at least once?', options: ['for', 'while', 'do-while', 'for-each'], answer: 2, explanation: 'do-while checks the condition after the body.' },
    { question: 'How many times does "Hi" print? for (int i = 0; i < 10; i += 2) System.out.println("Hi");', options: ['10', '5', '4', '6'], answer: 1, explanation: 'i = 0, 2, 4, 6, 8: five iterations.' },
    { question: 'What is printed? int s = 0; for (int i = 1; i <= 4; i++) s += i; System.out.println(s);', options: ['10', '4', '6', '15'], answer: 0, explanation: '1 + 2 + 3 + 4 = 10.' },
    { question: 'Which is the correct for-each syntax?', options: ['for (int x in arr)', 'foreach (int x : arr)', 'for (arr : int x)', 'for (int x : arr)'], answer: 3, explanation: 'Java uses a colon: for (type var : array).' },
    { question: 'What is printed? int n = 100; int c = 0; while (n > 0) { n /= 10; c++; } System.out.println(c);', options: ['2', '3', '100', '0'], answer: 1, explanation: 'n: 100 -> 10 -> 1 -> 0, three iterations = number of digits.' },
  ],
};
