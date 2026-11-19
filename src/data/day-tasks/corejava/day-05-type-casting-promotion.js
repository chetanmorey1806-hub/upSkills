export default {
  lesson: 'day-05-type-casting-promotion',
  minutes: 20,
  intro: 'Predict widening, narrowing and type promotion results, and fix integer-division mistakes.',
  tasks: [
    {
      type: 'mcq',
      mins: 1,
      q: 'Which conversion happens **automatically** (widening, no cast needed)?',
      options: ['double → int', 'int → long', 'long → int', 'int → byte'],
      answer: 1,
      explain: 'Widening goes from a smaller type to a bigger one: byte → short → int → long → float → double. `int → long` is safe, so Java does it automatically. The other three can lose data and need an explicit cast like `(int)`.',
    },
    {
      type: 'output',
      mins: 3,
      q: 'What does this program print?',
      example: { title: 'narrowing drops the decimal part', code: 'int x = (int) 4.8;  // 4 (not rounded)' },
      code: `public class Main {
    public static void main(String[] args) {
        int a = (int) 9.99;
        byte b = (byte) 130;
        char c = (char) 66;
        int d = 'A' + 2;
        System.out.println(a);
        System.out.println(b);
        System.out.println(c);
        System.out.println(d);
    }
}`,
      expected: `9
-126
B
67`,
      explain: '`(int) 9.99` **truncates** to 9. `(byte) 130` overflows the range −128..127 and wraps to 130 − 256 = **−126**. `(char) 66` is \'B\'. `\'A\' + 2` promotes the char to int: 65 + 2 = **67** (a number, not \'C\', because the variable is an int).',
    },
    {
      type: 'output',
      mins: 3,
      q: 'Asha scored 85, 90 and 92. What does this program print?',
      example: {
        title: 'int / int is int',
        code: `System.out.println(7 / 2);    // 3
System.out.println(7 / 2.0);  // 3.5`,
      },
      code: `public class Main {
    public static void main(String[] args) {
        int total = 85 + 90 + 92;
        double avg1 = total / 3;
        double avg2 = total / 3.0;
        double avg3 = (double) total / 2;
        System.out.println(total);
        System.out.println(avg1);
        System.out.println(avg2);
        System.out.println(avg3);
    }
}`,
      expected: `267
89.0
89.0
133.5`,
      explain: '`total / 3` is **int / int**, so 267 / 3 = 89 (exact here) and only then widened to 89.0. `total / 3.0` is a double division = 89.0 too. `(double) total / 2` casts first, so 267.0 / 2 = 133.5. Without the cast, `total / 2` would give 133 and you would lose the .5.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Fix the percentage so it is not truncated. Fill in the blank with a cast:
\`int marks = 437, max = 500;\`
\`double pct = ____ marks / max * 100;\``,
      example: {
        title: 'casting before dividing',
        code: `int runs = 245, balls = 180;
double sr = (double) runs / balls * 100;`,
      },
      accept: ['(double)', '(float)'],
      acceptRegex: ['^\\(\\s*double\\s*\\)\\s*[;{]?$', '^\\(\\s*float\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: 'Casting **one operand before the division** makes it a double division: `(double) marks / max` = 0.874, × 100 = 87.4. Writing `(double) (marks / max)` is the common mistake: the int division happens first and gives 0.',
    },
    {
      type: 'mcq',
      mins: 2,
      q: '`byte b = 10;` Which line gives a **compile error**?',
      options: ['b += 5;', 'b = b + 5;', 'b++;', 'b = 15;'],
      answer: 1,
      explain: 'In `b + 5` the byte is **promoted to int**, so the result is an int that cannot be stored in a byte without a cast. Compound operators like `+=` and `++` contain a hidden cast, so they compile. `b = 15` is a constant that fits in a byte.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `What value is stored in \`x\`? (just the number)
\`byte x = (byte) 300;\``,
      example: { title: 'wrapping a byte', text: '`(byte) 200` → 200 − 256 = −56. A byte keeps only the lowest 8 bits.' },
      accept: ['44'],
      explain: 'A byte keeps only the lowest 8 bits: 300 − 256 = **44**. Narrowing never throws an error; it silently wraps, which is why it needs an explicit cast.',
    },
  ],
};
