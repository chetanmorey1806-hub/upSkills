export default {
  lesson: 'day-30-math-random-biginteger-bigdecimal',
  minutes: 22,
  intro: 'Use Math methods, generate random numbers in a range, and do exact calculations with BigInteger and BigDecimal.',
  tasks: [
    {
      type: 'output',
      mins: 4,
      q: 'Math methods and return types: what does this program print?',
      example: { title: 'some methods return double', code: 'System.out.println(Math.sqrt(16)); // 4.0, not 4' },
      code: `public class Main {
    public static void main(String[] args) {
        System.out.println(Math.round(2.5));
        System.out.println(Math.round(-2.5));
        System.out.println(Math.floor(-2.3));
        System.out.println(Math.ceil(2.1));
        System.out.println(Math.abs(-7));
        System.out.println(Math.pow(2, 10));
        System.out.println(Math.max(3, 7.5));
    }
}`,
      expected: `3
-2
-3.0
3.0
7
1024.0
7.5`,
      explain: '`Math.round` returns a long and rounds half **up** (towards +∞): 2.5 → 3 and −2.5 → −2. floor goes down (−2.3 → −3.0), ceil goes up, and both return **double**. `pow` always returns a double (1024.0). `Math.max(3, 7.5)` promotes 3 to double.',
    },
    {
      type: 'output',
      mins: 4,
      q: 'Money maths: what does this program print?',
      example: { title: 'create BigDecimal from a String', code: 'BigDecimal price = new BigDecimal("199.99");' },
      code: `import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

public class Main {
    public static void main(String[] args) {
        System.out.println(0.1 + 0.2);
        BigDecimal a = new BigDecimal("0.1");
        BigDecimal b = new BigDecimal("0.2");
        System.out.println(a.add(b));
        System.out.println(new BigDecimal("10").divide(new BigDecimal("3"), 2, RoundingMode.HALF_UP));
        System.out.println(new BigDecimal("2.50").equals(new BigDecimal("2.5")));
        System.out.println(new BigDecimal("2.50").compareTo(new BigDecimal("2.5")));
        BigInteger f = BigInteger.ONE;
        for (int i = 1; i <= 25; i++) f = f.multiply(BigInteger.valueOf(i));
        System.out.println(f);
    }
}`,
      expected: `0.30000000000000004
0.3
3.33
false
0
15511210043330985984000000`,
      explain: 'double cannot store 0.1 exactly, so 0.1 + 0.2 prints 0.30000000000000004 — never use double for money. BigDecimal from Strings is exact (0.3). Division needs a scale and RoundingMode (3.33). `equals` also compares the **scale** (2.50 ≠ 2.5) while `compareTo` compares only the value (0 = equal). 25! is far beyond long, but BigInteger handles it.',
    },
    {
      type: 'fill',
      mins: 2,
      q: `Simulate a dice roll: write the expression that gives a random int from **1 to 6** using \`Math.random()\`.
\`int dice = ____;\``,
      example: { title: 'random int from 0 to 9', code: 'int r = (int) (Math.random() * 10);' },
      accept: ['(int) (Math.random() * 6) + 1', '1 + (int) (Math.random() * 6)', '(int) (Math.random() * 6 + 1)', '(int) (1 + Math.random() * 6)'],
      acceptRegex: [
        '^\\(\\s*int\\s*\\)\\s*\\(\\s*Math\\s*\\.\\s*random\\s*\\(\\s*\\)\\s*\\*\\s*6\\s*\\)\\s*\\+\\s*1\\s*[;{]?$',
        '^1\\s*\\+\\s*\\(\\s*int\\s*\\)\\s*\\(\\s*Math\\s*\\.\\s*random\\s*\\(\\s*\\)\\s*\\*\\s*6\\s*\\)\\s*[;{]?$',
        '^\\(\\s*int\\s*\\)\\s*\\(\\s*Math\\s*\\.\\s*random\\s*\\(\\s*\\)\\s*\\*\\s*6\\s*\\+\\s*1\\s*\\)\\s*[;{]?$',
        '^\\(\\s*int\\s*\\)\\s*\\(\\s*1\\s*\\+\\s*Math\\s*\\.\\s*random\\s*\\(\\s*\\)\\s*\\*\\s*6\\s*\\)\\s*[;{]?$',
      ],
      caseSensitive: true,
      explain: '`Math.random()` gives a double in [0.0, 1.0). × 6 → [0, 6), cast to int → 0..5, + 1 → 1..6. A common mistake is `(int) Math.random() * 6`: the cast applies first and always gives 0.',
    },
    {
      type: 'fill',
      mins: 1,
      q: `Create a BigDecimal holding **exactly** 0.1 (the recommended way, not \`new BigDecimal(0.1)\`):
\`BigDecimal gst = ____;\``,
      example: { title: 'adding two BigDecimals', code: 'BigDecimal total = price.add(tax); // not price + tax' },
      accept: ['new BigDecimal("0.1")', 'BigDecimal.valueOf(0.1)'],
      acceptRegex: ['^new\\s+BigDecimal\\s*\\(\\s*"0\\.1"\\s*\\)\\s*[;{]?$', '^BigDecimal\\s*\\.\\s*valueOf\\s*\\(\\s*0\\s*\\.\\s*1\\s*\\)\\s*[;{]?$'],
      caseSensitive: true,
      explain: '`new BigDecimal(0.1)` copies the inexact double and gives 0.1000000000000000055511151231257827…. Use the **String constructor** `new BigDecimal("0.1")` or `BigDecimal.valueOf(0.1)` (which goes through the double\'s String form).',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Two `Random` objects are created with the **same seed**: `new Random(42)`. What happens when both call `nextInt(100)` five times?',
      options: ['They produce different numbers', 'They produce exactly the same sequence', 'The second one throws an exception', 'Both always return 42'],
      answer: 1,
      explain: 'Random is a pseudo-random generator: the same seed gives the **same sequence**, which is useful for repeatable tests. Without a seed it is seeded from the clock. For security tokens use SecureRandom.',
    },
    {
      type: 'mcq',
      mins: 1,
      q: 'Which is best for an **OTP or password-reset token**?',
      options: ['Math.random()', 'new Random()', 'SecureRandom', 'System.currentTimeMillis() % 10000'],
      answer: 2,
      explain: '`java.security.SecureRandom` produces cryptographically strong, unpredictable values. Math.random and Random are predictable if someone learns the seed, and the time-based trick is easy to guess.',
    },
  ],
};
