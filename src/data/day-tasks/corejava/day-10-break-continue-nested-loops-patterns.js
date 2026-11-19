export default {
  lesson: 'day-10-break-continue-nested-loops-patterns',
  minutes: 22,
  intro: 'Control loops with break, continue and labels, and trace nested-loop pattern programs.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: {
        title: 'continue skips the rest of one round',
        code: `for (int i = 1; i <= 4; i++) {
  if (i == 2) continue;
  System.out.print(i);
} // 134`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 10; i++) {
            if (i % 3 == 0) continue;
            if (i > 7) break;
            System.out.print(i + " ");
        }
        System.out.println();
    }
}`,
      expected: '1 2 4 5 7 ',
      explain: '`continue` skips multiples of 3 (3, 6, 9) and goes to the next i. When i reaches 8 (not a multiple of 3, and > 7) `break` ends the loop completely. Printed: 1 2 4 5 7.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Pattern program: what does this print?',
      example: {
        title: 'rows and columns',
        code: `for (int i = 1; i <= 2; i++) {
  for (int j = 1; j <= 3; j++) System.out.print("#");
  System.out.println();
}
// ###
// ###`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            System.out.println();
        }
    }
}`,
      expected: `1
12
123
1234`,
      explain: 'The **outer loop is the row** (i = 1..4) and the **inner loop prints the columns** of that row (j = 1..i). Row i prints the numbers 1 to i, then `println()` moves to the next row.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Labelled break: what does this program print?',
      example: {
        title: 'a label names a loop',
        code: `outer:
for (...) {
  for (...) {
    break outer; // leaves BOTH loops
  }
}`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        outer:
        for (int i = 1; i <= 3; i++) {
            for (int j = 1; j <= 3; j++) {
                if (j == 2) continue outer;
                if (i == 3) break outer;
                System.out.println(i + "," + j);
            }
        }
        System.out.println("done");
    }
}`,
      expected: `1,1
2,1
done`,
      explain: 'For i = 1 and 2, only j = 1 prints; at j = 2 `continue outer` jumps straight to the **next i**. When i = 3, `break outer` exits both loops before anything prints, then "done" is shown.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `This prints an inverted triangle (5 stars, then 4, … then 1). Complete the inner loop condition:
\`for (int i = 5; i >= 1; i--) {\`
\`  for (int j = 1; ____; j++) System.out.print("*");\`
\`  System.out.println();\`
\`}\``,
      example: {
        title: 'right triangle growing',
        code: `for (int i = 1; i <= 5; i++) {
  for (int j = 1; j <= i; j++) System.out.print("*");
  System.out.println();
}`,
      },
      accept: ['j <= i', 'j < i + 1', 'i >= j'],
      acceptRegex: ['^j\\s*<\\s*=\\s*i\\s*[;{]?$', '^j\\s*<\\s*i\\s*\\+\\s*1\\s*[;{]?$', '^i\\s*>\\s*=\\s*j\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'The number of stars in a row equals the row value i (5, 4, 3, 2, 1), so the inner loop runs while `j <= i`. Most pattern programs are solved by first writing "row i has ___ items" and turning that into the inner loop condition.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Prime check: as soon as a divisor is found there is no need to test more numbers. Which keyword exits the loop immediately?
\`for (int d = 2; d * d <= n; d++) {\`
\`  if (n % d == 0) { isPrime = false; ____; }\`
\`}\``,
      example: {
        title: 'stopping a search early',
        code: `for (int x : nums) {
  if (x == target) { found = true; break; }
}`,
      },
      accept: ['break', 'break;'],
      acceptRegex: ['^break\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`break` ends the loop at once, which makes the check faster. `continue` would only skip to the next d. Testing up to `d * d <= n` (√n) is the standard optimisation.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: `How many times does the inner statement run?
\`for (int i = 0; i < 4; i++)\`
\`  for (int j = 0; j < 3; j++)\`
\`    count++;\``,
      options: ['7', '12', '4', '3'],
      answer: 1,
      explain: 'For each of the 4 outer rounds, the inner loop runs 3 times: 4 × 3 = **12**. Nested loops multiply, they do not add.',
    },
  ],
};
