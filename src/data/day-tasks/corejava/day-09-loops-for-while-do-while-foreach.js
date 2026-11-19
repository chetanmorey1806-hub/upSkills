export default {
  lesson: 'day-09-loops-for-while-do-while-foreach',
  minutes: 20,
  intro: 'Trace for, while, do-while and for-each loops and write loop headers yourself.',
  tasks: [
    {
      type: 'output',
      mins: 3,
      q: 'Trace the loop: what does this program print?',
      example: {
        title: 'tracing a for loop',
        code: `for (int i = 1; i <= 3; i++) System.out.print(i * 2 + " ");
// 2 4 6`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int sum = 0;
        for (int i = 1; i <= 10; i += 3) {
            sum += i;
            System.out.print(i + " ");
        }
        System.out.println();
        System.out.println("sum = " + sum);
    }
}`,
      expected: `1 4 7 10 
sum = 22`,
      explain: 'i takes 1, 4, 7, 10 (each time + 3) and stops when it becomes 13. The sum is 1 + 4 + 7 + 10 = 22. `print` keeps everything on one line until the empty `println()` ends it.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Digit processing with while: what does this program print?',
      example: {
        title: 'sum of digits',
        code: `int n = 123, s = 0;
while (n > 0) { s += n % 10; n /= 10; }
// s = 6`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int n = 4072, rev = 0, count = 0;
        while (n > 0) {
            rev = rev * 10 + n % 10;
            n = n / 10;
            count++;
        }
        System.out.println(rev);
        System.out.println(count);
    }
}`,
      expected: `2704
4`,
      explain: 'Each round takes the last digit (`n % 10`) and appends it to `rev`, then removes it (`n / 10`). 4072 → 2, 27, 270, 2704. Notice the leading zero of "0274" disappears because rev is a number. The loop ran 4 times, once per digit.',
    },
    {
      type: 'output',
      mins: 2,
      q: 'What does this program print?',
      example: {
        title: 'do-while checks the condition at the end',
        code: `int k = 5;
do { System.out.println(k); } while (k < 3);
// prints 5 once`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int i = 10;
        while (i < 5) {
            System.out.println("while " + i);
            i++;
        }
        do {
            System.out.println("do " + i);
            i++;
        } while (i < 5);
    }
}`,
      expected: 'do 10',
      explain: 'The `while` loop checks first: 10 < 5 is false, so its body never runs. The `do-while` runs its body **once before checking**, prints "do 10", then 11 < 5 is false and it stops.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Complete the **for-each** header that visits every value of \`int[] marks\`:
\`____ {\`
\`    total += m;\`
\`}\``,
      example: {
        title: 'for-each over Strings',
        code: `String[] cities = {"Pune", "Delhi"};
for (String c : cities) System.out.println(c);`,
      },
      accept: ['for (int m : marks)', 'for (final int m : marks)', 'for (var m : marks)'],
      acceptRegex: [
        '^for\\s*\\(\\s*int\\s+m\\s*:\\s*marks\\s*\\)\\s*[;{]?$',
        '^for\\s*\\(\\s*final\\s+int\\s+m\\s*:\\s*marks\\s*\\)\\s*[;{]?$',
        '^for\\s*\\(\\s*var\\s+m\\s*:\\s*marks\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: 'The enhanced for loop is `for (Type variable : array)`. The variable gets each **value**, not the index, so you cannot use it to change the array or know the position. Use a classic for loop when you need the index.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `The loop should print 1 to 5. Complete the condition:
\`for (int i = 1; ____; i++) System.out.println(i);\``,
      example: { title: 'printing 0 to 9', code: 'for (int i = 0; i < 10; i++) System.out.println(i);' },
      accept: ['i <= 5', 'i < 6', '5 >= i', '6 > i'],
      acceptRegex: ['^i\\s*<\\s*=\\s*5\\s*[;{]?$', '^i\\s*<\\s*6\\s*[;{]?$', '^5\\s*>\\s*=\\s*i\\s*[;{]?$', '^6\\s*>\\s*i\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`i <= 5` (or `i < 6`) runs for 1, 2, 3, 4, 5. Writing `i < 5` stops at 4: that is the classic **off-by-one** error.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which loop is the best choice to show a menu that must appear **at least once** before the user chooses Exit?',
      options: ['for', 'while', 'do-while', 'for-each'],
      answer: 2,
      explain: '`do-while` runs the body first and checks the condition afterwards, so the menu is always shown at least once. `for` suits a known count, `while` an unknown count that may be zero, and `for-each` walking an array/collection.',
    },
  ],
};
