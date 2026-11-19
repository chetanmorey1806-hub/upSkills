export default {
  lesson: 'day-06-operators',
  minutes: 22,
  intro: 'Predict arithmetic, increment/decrement, logical short-circuit and ternary results the way interviewers test them.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: {
        title: '% gives the remainder',
        code: `System.out.println(10 % 4);  // 2
System.out.println("A" + 1 + 2); // A12`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int a = 17, b = 5;
        System.out.println(a / b);
        System.out.println(a % b);
        System.out.println(-17 % 5);
        System.out.println("Sum: " + a + b);
        System.out.println(a + b + " is the sum");
    }
}`,
      expected: `3
2
-2
Sum: 175
22 is the sum`,
      explain: '`17 / 5` is integer division = 3, and `17 % 5` = 2. The sign of `%` follows the **left** operand, so `-17 % 5` = −2. `+` works left to right: `"Sum: " + a` becomes a String, so `+ b` appends "5" → "Sum: 175". In the last line `a + b` is added first (22) and then joined with the text.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Pre- and post-increment: what does this program print?',
      example: {
        title: 'use-then-change vs change-then-use',
        code: `int x = 3;
int y = x++; // y = 3, x = 4
int z = ++x; // x = 5, z = 5`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int a = 5;
        int b = a++;
        int c = ++a;
        System.out.println(a + " " + b + " " + c);
        int e = 10;
        e = e++ + ++e;
        System.out.println(e);
        int f = 5;
        f = f++;
        System.out.println(f);
    }
}`,
      expected: `7 5 7
22
5`,
      explain: '`b = a++` stores 5 then a becomes 6; `c = ++a` makes a 7 then stores 7. In `e++ + ++e` the left part uses 10 (e becomes 11), the right part makes e 12 → 10 + 12 = 22. `f = f++` stores the OLD value 5 back into f, so f stays 5 — a favourite interview trap.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Short-circuit evaluation: what does this program print?',
      example: {
        title: '&& stops early',
        code: `int n = 0;
boolean r = false && (++n > 0); // n stays 0`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int x = 5;
        boolean r1 = (x > 10) && (++x > 5);
        System.out.println(r1 + " " + x);
        boolean r2 = (x > 10) & (++x > 5);
        System.out.println(r2 + " " + x);
        boolean r3 = (x > 1) || (++x > 5);
        System.out.println(r3 + " " + x);
    }
}`,
      expected: `false 5
false 6
true 6`,
      explain: '`&&` skips the right side when the left is false, so x stays 5. `&` (non-short-circuit) evaluates **both** sides, so x becomes 6 even though the result is false. `||` skips the right side when the left is already true, so x stays 6.',
    },
    {
      type: 'fill',
      mins: 1,
      q: 'Write the expression that gives the **last digit** of an int `n` (e.g. 1234 → 4).',
      example: {
        title: 'removing the last digit',
        code: `int n = 1234;
int rest = n / 10; // 123`,
      },
      accept: ['n % 10', 'n%10', '(n % 10)', 'Math.abs(n % 10)', 'Math.abs(n) % 10'],
      acceptRegex: [
        '^n\\s*%\\s*10\\s*[;{]?$',
        '^\\(\\s*n\\s*%\\s*10\\s*\\)\\s*[;{]?$',
        '^Math\\s*\\.\\s*abs\\s*\\(\\s*n\\s*%\\s*10\\s*\\)\\s*[;{]?$',
        '^Math\\s*\\.\\s*abs\\s*\\(\\s*n\\s*\\)\\s*%\\s*10\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`n % 10` is the remainder after dividing by 10, which is the last digit. `n / 10` removes the last digit. These two together power every digit program (sum of digits, reverse, palindrome, Armstrong).',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the ternary so \`result\` is "Pass" when \`marks >= 40\`, otherwise "Fail":
\`String result = ____;\``,
      example: { title: 'ternary syntax', code: 'String type = age >= 18 ? "Adult" : "Minor";' },
      accept: ['marks >= 40 ? "Pass" : "Fail"', '(marks >= 40) ? "Pass" : "Fail"', 'marks < 40 ? "Fail" : "Pass"', '(marks < 40) ? "Fail" : "Pass"'],
      acceptRegex: [
        '^marks\\s*>\\s*=\\s*40\\s*\\?\\s*"Pass"\\s*:\\s*"Fail"\\s*[;{]?$',
        '^\\(\\s*marks\\s*>\\s*=\\s*40\\s*\\)\\s*\\?\\s*"Pass"\\s*:\\s*"Fail"\\s*[;{]?$',
        '^marks\\s*<\\s*40\\s*\\?\\s*"Fail"\\s*:\\s*"Pass"\\s*[;{]?$',
        '^\\(\\s*marks\\s*<\\s*40\\s*\\)\\s*\\?\\s*"Fail"\\s*:\\s*"Pass"\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'The ternary is `condition ? valueIfTrue : valueIfFalse`. Both values must be compatible with the variable type (String here). It is an expression, so it can be used directly in an assignment or a println.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What is the value of `int r = 10 + 4 * 3 - 8 / 2;`?',
      options: ['17', '18', '38', '7'],
      answer: 1,
      explain: '`*` and `/` have higher precedence than `+` and `-`: 4 * 3 = 12 and 8 / 2 = 4, so 10 + 12 − 4 = **18**. Reading strictly left to right (38) is the usual mistake.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: 'What does `System.out.println(12 & 10);` print? (12 = 1100₂, 10 = 1010₂)',
      options: ['8', '14', '6', '22'],
      answer: 0,
      explain: 'Bitwise AND keeps a 1 only where **both** bits are 1: 1100 & 1010 = 1000₂ = **8**. `12 | 10` would be 1110₂ = 14 and `12 ^ 10` would be 0110₂ = 6.',
    },
  ],
};
